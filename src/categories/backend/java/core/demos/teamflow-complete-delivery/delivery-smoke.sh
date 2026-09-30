#!/usr/bin/env bash
set -euo pipefail

base_url="$1"
report_dir="$2"
compose_project="$3"
compose_file="$4"
profile="${5:-legacy}"
tmp_dir="$report_dir/tmp"
jwt_secret='local-teamflow-delivery-secret-key-2026'

mkdir -p "$tmp_dir"

cleanup() {
  local exit_code="$?"
  local token_file
  for token_file in "$tmp_dir"/*token.json; do
    if test -f "$token_file"; then
      rm "$token_file"
    fi
  done
  if test "$exit_code" -eq 0; then
    rm -r "$tmp_dir"
  else
    printf 'smoke failed; token-free diagnostics preserved at %s\n' "$tmp_dir" >&2
  fi
  exit "$exit_code"
}
trap cleanup EXIT

http_status() {
  local output="$1"
  shift
  curl --silent --show-error --output "$output" --dump-header "$output.headers" \
    --write-out '%{http_code}' "$@"
}

assert_problem() {
  local output="$1"
  local expected_status="$2"
  local expected_code="$3"
  jq -e --arg expected_status "$expected_status" --arg expected_code "$expected_code" '
    type == "object"
    and .type == "about:blank"
    and (.title | type) == "string"
    and (.title | length) > 0
    and (.status | type) == "number"
    and .status == ($expected_status | tonumber)
    and (.detail | type) == "string"
    and (.detail | length) > 0
    and (.instance | type) == "string"
    and (.instance | length) > 0
    and .code == $expected_code
    and (.traceId | type) == "string"
    and (.traceId | length) > 0
    and (.errors | type) == "array"
  ' "$output" >/dev/null
  grep -Eiq '^Content-Type: application/problem\+json(;|[[:space:]]*$)' \
    "$output.headers"
}

assert_json_content_type() {
  local output="$1"
  grep -Eiq '^Content-Type: application/(json|[^;[:space:]]+\+json)(;|[[:space:]]*$)' \
    "$output.headers"
}

assert_no_set_cookie() {
  ! grep -Eiq '^Set-Cookie:' "$1.headers"
}

compose() {
  TEAMFLOW_IMAGE="${TEAMFLOW_IMAGE:?TEAMFLOW_IMAGE is required}" \
    TEAMFLOW_PORT="${TEAMFLOW_PORT:?TEAMFLOW_PORT is required}" \
    docker compose -p "$compose_project" -f "$compose_file" "$@"
}

wait_readiness() {
  local expected="$1"
  local output="$2"
  local matched=false
  for _ in $(seq 1 30); do
    local status
    status=$(http_status "$output" "$base_url/actuator/health/readiness" || true)
    if test "$status" = "$expected"; then
      assert_json_content_type "$output"
      matched=true
      break
    fi
    sleep 1
  done
  test "$matched" = true
}

base64url() {
  openssl base64 -A | tr '+/' '-_' | tr -d '='
}

sha256() {
  shasum -a 256 | awk '{print $1}'
}

encoded_field() {
  printf '%s' "$1" | base64url
}

idempotency_redis_key() {
  local client_key="$1"
  local scope
  scope="v1|actor=$(encoded_field demo)|project=$(encoded_field PRJ-1)|key=$(encoded_field "$client_key")"
  printf 'teamflow:idempotency:v1:task-create:%s' "$(printf '%s' "$scope" | sha256)"
}

task_fingerprint() {
  local title="$1"
  local due_at="$2"
  local assignee="$3"
  local canonical
  canonical="v1|title=$(encoded_field "$title")|dueAt=$(encoded_field "$due_at")|assignee=$(encoded_field "$assignee")"
  printf '%s' "$canonical" | sha256
}

signed_token() {
  local payload="$1"
  local header_part
  local payload_part
  local signature
  header_part=$(printf '%s' '{"alg":"HS256","typ":"JWT"}' | base64url)
  payload_part=$(printf '%s' "$payload" | base64url)
  signature=$(
    printf '%s' "$header_part.$payload_part" \
      | openssl dgst -sha256 -mac HMAC -macopt "key:$jwt_secret" -binary \
      | base64url
  )
  printf '%s.%s.%s' "$header_part" "$payload_part" "$signature"
}

decode_base64url() {
  local value="$1"
  case $((${#value} % 4)) in
    2) value="${value}==" ;;
    3) value="${value}=" ;;
  esac
  printf '%s' "$value" | tr '_-' '/+' | openssl base64 -d -A
}

status=$(http_status "$tmp_dir/anonymous.json" "$base_url/api/v1/projects")
test "$status" = 401
assert_problem "$tmp_dir/anonymous.json" 401 AUTH_REQUIRED
assert_no_set_cookie "$tmp_dir/anonymous.json"

status=$(http_status "$tmp_dir/anonymous-me.json" "$base_url/api/v1/me")
test "$status" = 401
assert_problem "$tmp_dir/anonymous-me.json" 401 AUTH_REQUIRED
anonymous_me_trace_id=$(jq -r '.traceId' "$tmp_dir/anonymous-me.json")

status=$(http_status "$tmp_dir/anonymous-me-correlation.json" \
  -H 'X-Correlation-Id: smoke-correlation-7' \
  "$base_url/api/v1/me")
test "$status" = 401
assert_problem "$tmp_dir/anonymous-me-correlation.json" 401 AUTH_REQUIRED
grep -Eiq '^X-Correlation-Id: smoke-correlation-7([[:space:]]*)$' \
  "$tmp_dir/anonymous-me-correlation.json.headers"
jq -e '.traceId == "smoke-correlation-7"' "$tmp_dir/anonymous-me-correlation.json" >/dev/null

status=$(http_status "$tmp_dir/anonymous-me-invalid-correlation.json" \
  -H 'X-Correlation-Id: contains space' \
  "$base_url/api/v1/me")
test "$status" = 401
assert_problem "$tmp_dir/anonymous-me-invalid-correlation.json" 401 AUTH_REQUIRED
invalid_correlation_id=$(jq -r '.traceId' "$tmp_dir/anonymous-me-invalid-correlation.json")
test "$(printf '%s' "$invalid_correlation_id" | awk 'length($0) >= 36 && length($0) <= 64 { print "ok" }')" = ok
grep -Eiq "^X-Correlation-Id: $invalid_correlation_id([[:space:]]*)$" \
  "$tmp_dir/anonymous-me-invalid-correlation.json.headers"

status=$(http_status "$tmp_dir/bad-credentials.json" \
  -H 'Content-Type: application/json' \
  -d '{"username":"demo","password":"wrong"}' \
  "$base_url/api/v1/auth/token")
test "$status" = 401
assert_problem "$tmp_dir/bad-credentials.json" 401 AUTH_REQUIRED

status=$(http_status "$tmp_dir/bad-json.json" \
  -H 'Content-Type: application/json' \
  -d '{' \
  "$base_url/api/v1/auth/token")
test "$status" = 400
assert_problem "$tmp_dir/bad-json.json" 400 INVALID_REQUEST_BODY

status=$(http_status "$tmp_dir/unsupported-media.json" \
  -H 'Content-Type: text/plain' \
  -d 'demo' \
  "$base_url/api/v1/auth/token")
test "$status" = 415
assert_problem "$tmp_dir/unsupported-media.json" 415 UNSUPPORTED_MEDIA_TYPE

status=$(http_status "$tmp_dir/token.json" \
  -H 'Content-Type: application/json' \
  -d '{"username":"demo","password":"Passw0rd!Pass"}' \
  "$base_url/api/v1/auth/token")
test "$status" = 200
assert_json_content_type "$tmp_dir/token.json"
assert_no_set_cookie "$tmp_dir/token.json"
token=$(jq -r '.accessToken' "$tmp_dir/token.json")
test "$(printf '%s' "$token" | awk -F. '{print NF}')" = 3
test "$(jq -r '.tokenType' "$tmp_dir/token.json")" = Bearer
test "$(jq -r '.expiresIn' "$tmp_dir/token.json")" = 300
token_payload=$(printf '%s' "$token" | awk -F. '{print $2}')
decode_base64url "$token_payload" \
  | jq -e '.userId == "USR-1" and .roles == ["USER"] and (.permissions | index("task:write")) != null' \
    >/dev/null

status=$(http_status "$tmp_dir/outsider-token.json" \
  -H 'Content-Type: application/json' \
  -d '{"username":"outsider","password":"OutsiderPassw0rd!"}' \
  "$base_url/api/v1/auth/token")
test "$status" = 200
assert_json_content_type "$tmp_dir/outsider-token.json"
assert_no_set_cookie "$tmp_dir/outsider-token.json"
outsider_token=$(jq -r '.accessToken' "$tmp_dir/outsider-token.json")

status=$(http_status "$tmp_dir/admin-token.json" \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"AdminPassw0rd!"}' \
  "$base_url/api/v1/auth/token")
test "$status" = 200
assert_json_content_type "$tmp_dir/admin-token.json"
assert_no_set_cookie "$tmp_dir/admin-token.json"
admin_token=$(jq -r '.accessToken' "$tmp_dir/admin-token.json")

status=$(http_status "$tmp_dir/me.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/me")
test "$status" = 200
assert_json_content_type "$tmp_dir/me.json"
jq -e '.username == "demo" and .userId == "USR-1" and (.authorities | index("ROLE_USER")) != null' \
  "$tmp_dir/me.json" >/dev/null
assert_no_set_cookie "$tmp_dir/me.json"

status=$(http_status "$tmp_dir/openapi.json" \
  "$base_url/v3/api-docs")
test "$status" = 200
assert_json_content_type "$tmp_dir/openapi.json"
jq -e '.openapi | startswith("3.0")' "$tmp_dir/openapi.json" >/dev/null
jq -e '.paths | has("/api/v1/users") and has("/api/v1/users/{userId}/email-change-verification-code") and has("/api/v1/users/{userId}/email-change-verification-code/verification") and has("/api/v1/teams/{teamId}/members") and has("/api/v1/projects/{projectId}/tasks/{taskId}/attachments") and has("/api/v1/partner/projects/{projectId}") and has("/api/v1/partner/projects/{projectId}/async") and has("/api/v1/partner/projects")' \
  "$tmp_dir/openapi.json" >/dev/null
jq -e '
  (.paths["/api/v1/users"].post.responses | has("201"))
  and (.paths["/api/v1/teams"].post.responses | has("201"))
  and (.paths["/api/v1/teams/{teamId}/members"].post.responses | has("201"))
  and (.paths["/api/v1/teams/{teamId}/members/{memberId}"].delete.responses | has("204"))
  and (.paths["/api/v1/projects"].post.responses | has("201"))
  and (.paths["/api/v1/partner/projects"].post.responses | has("201"))
  and (.paths["/api/v1/partner/projects/{projectId}"].get.responses | has("200"))
  and (.paths["/api/v1/partner/projects/{projectId}/async"].get.responses | has("200"))
  and (.paths["/api/v1/projects/{projectId}/tasks"].post.responses | has("201"))
  and (.paths["/api/v1/projects/{projectId}/tasks/{taskId}"].delete.responses | has("204"))
  and (.paths["/api/v1/projects/{projectId}/tasks/{taskId}/attachments"].post.responses | has("201"))
' "$tmp_dir/openapi.json" >/dev/null

status=$(http_status "$tmp_dir/partner-success.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/partner/projects/PARTNER-1")
test "$status" = 200
assert_json_content_type "$tmp_dir/partner-success.json"
jq -e '.id == "PARTNER-1" and .status == "ACTIVE"' "$tmp_dir/partner-success.json" >/dev/null

status=$(http_status "$tmp_dir/partner-async-success.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/partner/projects/PARTNER-1/async")
test "$status" = 200
assert_json_content_type "$tmp_dir/partner-async-success.json"
jq -e '.id == "PARTNER-1" and .name == "Partner project"' "$tmp_dir/partner-async-success.json" >/dev/null

status=$(http_status "$tmp_dir/partner-not-found.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/partner/projects/PARTNER-404")
test "$status" = 404
assert_problem "$tmp_dir/partner-not-found.json" 404 RESOURCE_NOT_FOUND

for partner_failure in 5XX BAD-JSON SLOW; do
  status=$(http_status "$tmp_dir/partner-${partner_failure}.json" \
    -H "Authorization: Bearer $token" \
    "$base_url/api/v1/partner/projects/PARTNER-$partner_failure")
  test "$status" = 503
  assert_problem "$tmp_dir/partner-${partner_failure}.json" 503 PARTNER_UNAVAILABLE
done

status=$(http_status "$tmp_dir/partner-async-failure.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/partner/projects/PARTNER-5XX/async")
test "$status" = 503
assert_problem "$tmp_dir/partner-async-failure.json" 503 PARTNER_UNAVAILABLE

status=$(http_status "$tmp_dir/partner-create.json" \
  -H "Authorization: Bearer $token" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Smoke partner"}' \
  "$base_url/api/v1/partner/projects")
test "$status" = 201
assert_json_content_type "$tmp_dir/partner-create.json"
jq -e '.id == "PARTNER-CREATED" and .name == "Smoke partner"' "$tmp_dir/partner-create.json" >/dev/null
test "$(cat "${TEAMFLOW_PARTNER_COUNTER_FILE:?TEAMFLOW_PARTNER_COUNTER_FILE is required}")" = 1

origin="${TEAMFLOW_TEST_ORIGIN:-http://localhost:5173}"
status=$(curl --silent --output "$tmp_dir/cors-preflight.json" \
  --dump-header "$tmp_dir/cors-preflight.headers" --write-out '%{http_code}' \
  -X OPTIONS \
  -H "Origin: $origin" \
  -H 'Access-Control-Request-Method: GET' \
  -H 'Access-Control-Request-Headers: Authorization,Content-Type' \
  "$base_url/api/v1/users")
test "$status" = 200
grep -Fqi "Access-Control-Allow-Origin: $origin" "$tmp_dir/cors-preflight.headers"

status=$(http_status "$tmp_dir/users.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/users?pageSize=1")
test "$status" = 200
assert_json_content_type "$tmp_dir/users.json"
jq -e '.items[0].id == "USR-1" and .nextPageToken == "USR-PAGE-2"' "$tmp_dir/users.json" >/dev/null

status=$(http_status "$tmp_dir/invalid-user-page-size.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/users?pageSize=0")
test "$status" = 400
assert_problem "$tmp_dir/invalid-user-page-size.json" 400 INVALID_PAGE_SIZE

status=$(http_status "$tmp_dir/create-user.json" \
  -H "Authorization: Bearer $token" \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"C3 user","email":"c3-user@example.com"}' \
  "$base_url/api/v1/users")
test "$status" = 201
assert_json_content_type "$tmp_dir/create-user.json"
grep -Eiq '^Location: (https?://[^/[:space:]]+)?/api/v1/users/USR-[0-9]+[[:space:]]*$' \
  "$tmp_dir/create-user.json.headers"

status=$(http_status "$tmp_dir/duplicate-user.json" \
  -H "Authorization: Bearer $token" \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"C3 user again","email":"C3-USER@EXAMPLE.COM"}' \
  "$base_url/api/v1/users")
test "$status" = 409
assert_problem "$tmp_dir/duplicate-user.json" 409 USER_CONFLICT

status=$(http_status "$tmp_dir/invalid-user.json" \
  -H "Authorization: Bearer $token" \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"","email":"invalid"}' \
  "$base_url/api/v1/users")
test "$status" = 400
assert_problem "$tmp_dir/invalid-user.json" 400 REQUEST_VALIDATION_FAILED
jq -e '(.errors | map(.field)) == ["displayName", "email"]' \
  "$tmp_dir/invalid-user.json" >/dev/null

status=$(http_status "$tmp_dir/teams.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/teams?pageSize=1")
test "$status" = 200
assert_json_content_type "$tmp_dir/teams.json"
jq -e '.items[0].id == "TEAM-1" and .nextPageToken == "TEAM-PAGE-2"' "$tmp_dir/teams.json" >/dev/null

status=$(http_status "$tmp_dir/invalid-team-page-token.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/teams?pageToken=USR-PAGE-2")
test "$status" = 400
assert_problem "$tmp_dir/invalid-team-page-token.json" 400 INVALID_PAGE_TOKEN

status=$(http_status "$tmp_dir/create-team.json" \
  -H "Authorization: Bearer $token" \
  -H 'Content-Type: application/json' \
  -d '{"name":"C3 team"}' \
  "$base_url/api/v1/teams")
test "$status" = 201
assert_json_content_type "$tmp_dir/create-team.json"
grep -Eiq '^Location: (https?://[^/[:space:]]+)?/api/v1/teams/TEAM-[0-9]+[[:space:]]*$' \
  "$tmp_dir/create-team.json.headers"

status=$(http_status "$tmp_dir/add-member.json" \
  -H "Authorization: Bearer $token" \
  -H 'Content-Type: application/json' \
  -d '{"userId":"USR-2","role":"QA"}' \
  "$base_url/api/v1/teams/TEAM-EMPTY/members")
test "$status" = 201
assert_json_content_type "$tmp_dir/add-member.json"
member_id=$(jq -r '.id' "$tmp_dir/add-member.json")
test -n "$member_id"
grep -Eiq '^Location: (https?://[^/[:space:]]+)?/api/v1/teams/TEAM-EMPTY/members/MBR-[0-9]+[[:space:]]*$' \
  "$tmp_dir/add-member.json.headers"

status=$(http_status "$tmp_dir/members.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/teams/TEAM-EMPTY/members")
test "$status" = 200
assert_json_content_type "$tmp_dir/members.json"
jq -e --arg member_id "$member_id" '.items | any(.id == $member_id and .userId == "USR-2")' \
  "$tmp_dir/members.json" >/dev/null

status=$(http_status "$tmp_dir/member-conflict.json" \
  -H "Authorization: Bearer $token" \
  -H 'Content-Type: application/json' \
  -d '{"userId":"USR-2","role":"QA"}' \
  "$base_url/api/v1/teams/TEAM-EMPTY/members")
test "$status" = 409
assert_problem "$tmp_dir/member-conflict.json" 409 MEMBER_CONFLICT

status=$(http_status "$tmp_dir/remove-member.json" \
  -H "Authorization: Bearer $token" \
  -X DELETE \
  "$base_url/api/v1/teams/TEAM-EMPTY/members/$member_id")
test "$status" = 204
test ! -s "$tmp_dir/remove-member.json"
status=$(http_status "$tmp_dir/remove-member-again.json" \
  -H "Authorization: Bearer $token" \
  -X DELETE \
  "$base_url/api/v1/teams/TEAM-EMPTY/members/$member_id")
test "$status" = 404
assert_problem "$tmp_dir/remove-member-again.json" 404 RESOURCE_NOT_FOUND

status=$(http_status "$tmp_dir/team-not-found.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/teams/TEAM-404/members")
test "$status" = 404
assert_problem "$tmp_dir/team-not-found.json" 404 RESOURCE_NOT_FOUND

status=$(http_status "$tmp_dir/missing-idempotency-key.json" \
  -H "Authorization: Bearer $token" \
  -H 'Content-Type: application/json' \
  -d '{"title":"missing key","dueAt":"2026-09-01T18:00:00+08:00","assignee":"demo"}' \
  "$base_url/api/v1/projects/PRJ-1/tasks")
test "$status" = 400
assert_problem "$tmp_dir/missing-idempotency-key.json" 400 MISSING_REQUEST_HEADER

expired_token=$(signed_token \
  '{"iss":"https://api.teamflow.test","sub":"demo","aud":"teamflow-api","iat":1,"exp":2,"userId":"USR-1","roles":["USER"],"permissions":["project:read"]}')
status=$(http_status "$tmp_dir/expired.json" \
  -H "Authorization: Bearer $expired_token" \
  "$base_url/api/v1/projects")
test "$status" = 401
assert_problem "$tmp_dir/expired.json" 401 AUTH_REQUIRED
assert_no_set_cookie "$tmp_dir/expired.json"

future_exp=$(( $(date +%s) + 300 ))
missing_user_id_token=$(signed_token \
  "{\"iss\":\"https://api.teamflow.test\",\"sub\":\"missing-user-id\",\"aud\":\"teamflow-api\",\"iat\":1,\"exp\":$future_exp,\"roles\":[\"USER\"],\"permissions\":[]}")
status=$(http_status "$tmp_dir/missing-user-id.json" \
  -H "Authorization: Bearer $missing_user_id_token" \
  "$base_url/api/v1/users")
test "$status" = 401
assert_problem "$tmp_dir/missing-user-id.json" 401 AUTH_REQUIRED

blank_user_id_token=$(signed_token \
  "{\"iss\":\"https://api.teamflow.test\",\"sub\":\"blank-user-id\",\"aud\":\"teamflow-api\",\"iat\":1,\"exp\":$future_exp,\"userId\":\"\\u2003\",\"roles\":[\"USER\"],\"permissions\":[]}")
status=$(http_status "$tmp_dir/blank-user-id.json" \
  -H "Authorization: Bearer $blank_user_id_token" \
  "$base_url/api/v1/users")
test "$status" = 401
assert_problem "$tmp_dir/blank-user-id.json" 401 AUTH_REQUIRED

missing_roles_token=$(signed_token \
  "{\"iss\":\"https://api.teamflow.test\",\"sub\":\"missing-roles\",\"aud\":\"teamflow-api\",\"iat\":1,\"exp\":$future_exp,\"userId\":\"USR-1\",\"permissions\":[\"project:read\"]}")
status=$(http_status "$tmp_dir/missing-roles.json" \
  -H "Authorization: Bearer $missing_roles_token" \
  "$base_url/api/v1/projects")
test "$status" = 401
assert_problem "$tmp_dir/missing-roles.json" 401 AUTH_REQUIRED

missing_permissions_token=$(signed_token \
  "{\"iss\":\"https://api.teamflow.test\",\"sub\":\"missing-permissions\",\"aud\":\"teamflow-api\",\"iat\":1,\"exp\":$future_exp,\"userId\":\"USR-1\",\"roles\":[\"USER\"]}")
status=$(http_status "$tmp_dir/missing-permissions.json" \
  -H "Authorization: Bearer $missing_permissions_token" \
  "$base_url/api/v1/users")
test "$status" = 401
assert_problem "$tmp_dir/missing-permissions.json" 401 AUTH_REQUIRED

limited_token=$(signed_token \
  "{\"iss\":\"https://api.teamflow.test\",\"sub\":\"demo\",\"aud\":\"teamflow-api\",\"iat\":1,\"exp\":$future_exp,\"userId\":\"USR-1\",\"roles\":[\"USER\"],\"permissions\":[\"task:read\"]}")
status=$(http_status "$tmp_dir/forbidden-projects.json" \
  -H "Authorization: Bearer $limited_token" \
  "$base_url/api/v1/projects")
test "$status" = 403
assert_problem "$tmp_dir/forbidden-projects.json" 403 ACCESS_DENIED
assert_no_set_cookie "$tmp_dir/forbidden-projects.json"

token_header=$(printf '%s' "$token" | awk -F. '{print $1}')
token_body=$(printf '%s' "$token" | awk -F. '{print $2}')
token_signature=$(printf '%s' "$token" | awk -F. '{print $3}')
case "$token_signature" in
  A*) tampered_signature="B${token_signature#?}" ;;
  *) tampered_signature="A${token_signature#?}" ;;
esac
tampered_token="$token_header.$token_body.$tampered_signature"
status=$(http_status "$tmp_dir/tampered-token.json" \
  -H "Authorization: Bearer $tampered_token" \
  "$base_url/api/v1/projects")
test "$status" = 401
assert_problem "$tmp_dir/tampered-token.json" 401 AUTH_REQUIRED

wrong_issuer_token=$(signed_token \
  "{\"iss\":\"https://wrong-issuer.test\",\"sub\":\"demo\",\"aud\":\"teamflow-api\",\"iat\":1,\"exp\":$future_exp,\"userId\":\"USR-1\",\"roles\":[\"USER\"],\"permissions\":[\"project:read\"]}")
status=$(http_status "$tmp_dir/wrong-issuer.json" \
  -H "Authorization: Bearer $wrong_issuer_token" \
  "$base_url/api/v1/projects")
test "$status" = 401
assert_problem "$tmp_dir/wrong-issuer.json" 401 AUTH_REQUIRED

wrong_audience_token=$(signed_token \
  "{\"iss\":\"https://api.teamflow.test\",\"sub\":\"demo\",\"aud\":\"wrong-audience\",\"iat\":1,\"exp\":$future_exp,\"userId\":\"USR-1\",\"roles\":[\"USER\"],\"permissions\":[\"project:read\"]}")
status=$(http_status "$tmp_dir/wrong-audience.json" \
  -H "Authorization: Bearer $wrong_audience_token" \
  "$base_url/api/v1/projects")
test "$status" = 401
assert_problem "$tmp_dir/wrong-audience.json" 401 AUTH_REQUIRED

status=$(http_status "$tmp_dir/outsider-project.json" \
  -H "Authorization: Bearer $outsider_token" \
  "$base_url/api/v1/projects/PRJ-1")
test "$status" = 403
assert_problem "$tmp_dir/outsider-project.json" 403 ACCESS_DENIED
assert_no_set_cookie "$tmp_dir/outsider-project.json"

status=$(http_status "$tmp_dir/admin-project.json" \
  -H "Authorization: Bearer $admin_token" \
  "$base_url/api/v1/projects/PRJ-1")
test "$status" = 200
assert_json_content_type "$tmp_dir/admin-project.json"
assert_no_set_cookie "$tmp_dir/admin-project.json"

admin_read_token=$(signed_token \
  "{\"iss\":\"https://api.teamflow.test\",\"sub\":\"admin-read\",\"aud\":\"teamflow-api\",\"iat\":1,\"exp\":$future_exp,\"userId\":\"USR-2\",\"roles\":[\"USER\",\"ADMIN\"],\"permissions\":[\"project:read\",\"task:read\"]}")
status=$(http_status "$tmp_dir/admin-read-project.json" \
  -H "Authorization: Bearer $admin_read_token" \
  "$base_url/api/v1/projects/PRJ-1")
test "$status" = 200
assert_json_content_type "$tmp_dir/admin-read-project.json"
status=$(http_status "$tmp_dir/admin-without-task-write.json" \
  -H "Authorization: Bearer $admin_read_token" \
  -H 'Idempotency-Key: admin-without-task-write' \
  -H 'Content-Type: application/json' \
  -d '{"title":"must stay forbidden","dueAt":"2026-09-01T18:00:00+08:00","assignee":"admin-read"}' \
  "$base_url/api/v1/projects/PRJ-1/tasks")
test "$status" = 403
assert_problem "$tmp_dir/admin-without-task-write.json" 403 ACCESS_DENIED
assert_no_set_cookie "$tmp_dir/admin-without-task-write.json"

compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning FLUSHDB >/dev/null
generation_key='teamflow:cache:task-list-generation:v1:PRJ-1'
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning EXISTS "$generation_key")" = 0

status=$(http_status "$tmp_dir/tasks-generation-zero.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects/PRJ-1/tasks?pageSize=1&status=DONE")
test "$status" = 200
assert_json_content_type "$tmp_dir/tasks-generation-zero.json"
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning EXISTS "$generation_key")" = 0
task_list_zero_hash=$(printf '%s' 'v1|status=DONE|pageSize=1|pageToken=~' | sha256)
task_list_zero_key="teamflow:cache:task-list:v1:scope:bWVtYmVyOlVTUi0x:PRJ-1:g0:$task_list_zero_hash"
task_list_zero_ttl=$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning PTTL "$task_list_zero_key")
test "$task_list_zero_ttl" -gt 0
test "$task_list_zero_ttl" -le 90000
generation_case=0
for invalid_generation in -1 01 broken 9223372036854775808; do
  generation_case=$((generation_case + 1))
  compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning \
    SET "$generation_key" "$invalid_generation" >/dev/null
  status=$(http_status "$tmp_dir/invalid-generation-$generation_case.json" \
    -H "Authorization: Bearer $token" \
    "$base_url/api/v1/projects/PRJ-1/tasks?pageSize=1&status=DONE")
  test "$status" = 500
  assert_problem "$tmp_dir/invalid-generation-$generation_case.json" 500 CACHE_STATE_INVALID
done
compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning DEL "$generation_key" >/dev/null

verification_code_key='teamflow:verification-code:v1:email-change:USR-1'
verification_attempt_key='teamflow:verification-attempts:v1:email-change:USR-1'
status=$(http_status "$tmp_dir/verification-issue.json" \
  -H "Authorization: Bearer $token" \
  -X POST \
  "$base_url/api/v1/users/USR-1/email-change-verification-code")
test "$status" = 202
test ! -s "$tmp_dir/verification-issue.json"
verification_code=$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning GET "$verification_code_key")
printf '%s' "$verification_code" | grep -Eq '^[0-9]{6}$'
verification_code_ttl=$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning TTL "$verification_code_key")
verification_attempt_ttl=$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning TTL "$verification_attempt_key")
test "$verification_code_ttl" -gt 0
test "$verification_code_ttl" -le 300
test "$verification_attempt_ttl" -gt 0
test "$verification_attempt_ttl" -le 600
verification_wrong_code=000000
test "$verification_code" != 000000 || verification_wrong_code=999999
for attempt in 1 2 3 4; do
  status=$(http_status "$tmp_dir/verification-invalid-$attempt.json" \
    -H "Authorization: Bearer $token" \
    -H 'Content-Type: application/json' \
    -d "{\"code\":\"$verification_wrong_code\"}" \
    "$base_url/api/v1/users/USR-1/email-change-verification-code/verification")
  test "$status" = 200
  jq -e '.result == "INVALID"' "$tmp_dir/verification-invalid-$attempt.json" >/dev/null
done
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning GET "$verification_attempt_key")" = 4
status=$(http_status "$tmp_dir/verification-reissue.json" \
  -H "Authorization: Bearer $token" \
  -X POST \
  "$base_url/api/v1/users/USR-1/email-change-verification-code")
test "$status" = 202
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning GET "$verification_attempt_key")" = 4
verification_reissued_code=$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning GET "$verification_code_key")
verification_wrong_code=000000
test "$verification_reissued_code" != 000000 || verification_wrong_code=999999
status=$(http_status "$tmp_dir/verification-blocked.json" \
  -H "Authorization: Bearer $token" \
  -H 'Content-Type: application/json' \
  -d "{\"code\":\"$verification_wrong_code\"}" \
  "$base_url/api/v1/users/USR-1/email-change-verification-code/verification")
test "$status" = 200
jq -e '.result == "TOO_MANY_ATTEMPTS"' "$tmp_dir/verification-blocked.json" >/dev/null
status=$(http_status "$tmp_dir/verification-still-blocked.json" \
  -H "Authorization: Bearer $token" \
  -H 'Content-Type: application/json' \
  -d "{\"code\":\"$verification_reissued_code\"}" \
  "$base_url/api/v1/users/USR-1/email-change-verification-code/verification")
test "$status" = 200
jq -e '.result == "TOO_MANY_ATTEMPTS"' "$tmp_dir/verification-still-blocked.json" >/dev/null

verification_success_code_key='teamflow:verification-code:v1:email-change:USR-2'
verification_success_attempt_key='teamflow:verification-attempts:v1:email-change:USR-2'
status=$(http_status "$tmp_dir/verification-success-issue.json" \
  -H "Authorization: Bearer $outsider_token" \
  -X POST \
  "$base_url/api/v1/users/USR-2/email-change-verification-code")
test "$status" = 202
verification_success_code=$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning GET "$verification_success_code_key")
http_status "$tmp_dir/verification-concurrent-1.json" \
  -H "Authorization: Bearer $outsider_token" \
  -H 'Content-Type: application/json' \
  -d "{\"code\":\"$verification_success_code\"}" \
  "$base_url/api/v1/users/USR-2/email-change-verification-code/verification" \
  >"$tmp_dir/verification-concurrent-1.status" &
verification_pid_1=$!
http_status "$tmp_dir/verification-concurrent-2.json" \
  -H "Authorization: Bearer $outsider_token" \
  -H 'Content-Type: application/json' \
  -d "{\"code\":\"$verification_success_code\"}" \
  "$base_url/api/v1/users/USR-2/email-change-verification-code/verification" \
  >"$tmp_dir/verification-concurrent-2.status" &
verification_pid_2=$!
wait "$verification_pid_1"
wait "$verification_pid_2"
test "$(cat "$tmp_dir/verification-concurrent-1.status")" = 200
test "$(cat "$tmp_dir/verification-concurrent-2.status")" = 200
test "$(jq -r '.result' "$tmp_dir/verification-concurrent-1.json" "$tmp_dir/verification-concurrent-2.json" \
  | sort | paste -sd, -)" = 'EXPIRED,VERIFIED'
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning EXISTS "$verification_success_code_key")" = 0
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning EXISTS "$verification_success_attempt_key")" = 0
status=$(http_status "$tmp_dir/verification-expired.json" \
  -H "Authorization: Bearer $outsider_token" \
  -H 'Content-Type: application/json' \
  -d "{\"code\":\"$verification_success_code\"}" \
  "$base_url/api/v1/users/USR-2/email-change-verification-code/verification")
test "$status" = 200
jq -e '.result == "EXPIRED"' "$tmp_dir/verification-expired.json" >/dev/null

status=$(http_status "$tmp_dir/projects.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects?pageSize=1")
test "$status" = 200
assert_json_content_type "$tmp_dir/projects.json"
jq -e 'keys | sort == ["items", "nextPageToken"]' "$tmp_dir/projects.json" >/dev/null
test "$(jq -r '.items[0].id' "$tmp_dir/projects.json")" = PRJ-1
test "$(jq -r '.nextPageToken' "$tmp_dir/projects.json")" = PROJECT-PAGE-2
project_generation_key='teamflow:cache:project-list-generation:v1'
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning EXISTS "$project_generation_key")" = 0
project_cache_key_g0='teamflow:cache:project-list:v1:scope:bWVtYmVyOlVTUi0x:g0:size:1:token:~'
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning EXISTS "$project_cache_key_g0")" = 1

status=$(http_status "$tmp_dir/outsider-projects.json" \
  -H "Authorization: Bearer $outsider_token" \
  "$base_url/api/v1/projects?pageSize=1")
test "$status" = 200
assert_json_content_type "$tmp_dir/outsider-projects.json"
jq -e '.items == [] and .nextPageToken == null' "$tmp_dir/outsider-projects.json" >/dev/null
outsider_project_cache_key='teamflow:cache:project-list:v1:scope:bWVtYmVyOlVTUi0y:g0:size:1:token:~'
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning EXISTS "$outsider_project_cache_key")" = 1

status=$(http_status "$tmp_dir/admin-projects.json" \
  -H "Authorization: Bearer $admin_token" \
  "$base_url/api/v1/projects?pageSize=1")
test "$status" = 200
assert_json_content_type "$tmp_dir/admin-projects.json"
test "$(jq -r '.items[0].id' "$tmp_dir/admin-projects.json")" = PRJ-1
admin_project_cache_key='teamflow:cache:project-list:v1:scope:YWRtaW46VVNSLTI:g0:size:1:token:~'
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning EXISTS "$admin_project_cache_key")" = 1

status=$(http_status "$tmp_dir/projects-second-page.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects?pageSize=1&pageToken=PROJECT-PAGE-2")
test "$status" = 200
assert_json_content_type "$tmp_dir/projects-second-page.json"
test "$(jq -r '.items[0].id' "$tmp_dir/projects-second-page.json")" = PRJ-2
test "$(jq -r '.nextPageToken' "$tmp_dir/projects-second-page.json")" = null

status=$(http_status "$tmp_dir/invalid-page-size.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects?pageSize=0")
test "$status" = 400
assert_problem "$tmp_dir/invalid-page-size.json" 400 INVALID_PAGE_SIZE

status=$(http_status "$tmp_dir/project-detail.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects/PRJ-1")
test "$status" = 200
assert_json_content_type "$tmp_dir/project-detail.json"
jq -e '.id == "PRJ-1" and .name == "TeamFlow delivery"' "$tmp_dir/project-detail.json" >/dev/null

status=$(http_status "$tmp_dir/create-project.json" \
  -H "Authorization: Bearer $token" \
  -H 'Content-Type: application/json' \
  -d '{"teamId":"TEAM-1","name":"C3 project"}' \
  "$base_url/api/v1/projects")
test "$status" = 201
assert_json_content_type "$tmp_dir/create-project.json"
grep -Eiq '^Location: (https?://[^/[:space:]]+)?/api/v1/projects/PRJ-[[:alnum:]-]+[[:space:]]*$' \
  "$tmp_dir/create-project.json.headers"
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning GET "$project_generation_key")" = 1
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning TTL "$project_generation_key")" = -1

status=$(http_status "$tmp_dir/create-project-for-named-team.json" \
  -H "Authorization: Bearer $token" \
  -H 'Content-Type: application/json' \
  -d '{"teamId":"TEAM-EMPTY","name":"Named team project"}' \
  "$base_url/api/v1/projects")
test "$status" = 201
assert_json_content_type "$tmp_dir/create-project-for-named-team.json"
grep -Eiq '^Location: (https?://[^/[:space:]]+)?/api/v1/projects/PRJ-[[:alnum:]-]+[[:space:]]*$' \
  "$tmp_dir/create-project-for-named-team.json.headers"
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning GET "$project_generation_key")" = 2

status=$(http_status "$tmp_dir/projects-after-create.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects?pageSize=1")
test "$status" = 200
assert_json_content_type "$tmp_dir/projects-after-create.json"
test "$(jq -S . "$tmp_dir/projects.json")" = "$(jq -S . "$tmp_dir/projects-after-create.json")"

cache_key=$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning \
  --scan --pattern 'teamflow:cache:project-list:v1:scope:bWVtYmVyOlVTUi0x:g2:size:1:token:~')
test -n "$cache_key"
cache_ttl=$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning PTTL "$cache_key")
test "$cache_ttl" -gt 0

compose stop mysql >/dev/null
wait_readiness 503 "$report_dir/readiness-mysql-cache-hit.json"
status=$(http_status "$tmp_dir/projects-cache-hit.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects?pageSize=1")
test "$status" = 200
assert_json_content_type "$tmp_dir/projects-cache-hit.json"
test "$(jq -S . "$tmp_dir/projects.json")" = "$(jq -S . "$tmp_dir/projects-cache-hit.json")"
compose start mysql >/dev/null
wait_readiness 200 "$report_dir/readiness-mysql-restored.json"

compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning \
  PEXPIRE "$cache_key" 1000 >/dev/null
sleep 2
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning EXISTS "$cache_key")" = 0
status=$(http_status "$tmp_dir/projects-cache-expired.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects?pageSize=1")
test "$status" = 200
assert_json_content_type "$tmp_dir/projects-cache-expired.json"
test "$(jq -S . "$tmp_dir/projects.json")" = "$(jq -S . "$tmp_dir/projects-cache-expired.json")"
cache_key_after_expire=''
for _ in $(seq 1 10); do
  cache_key_after_expire=$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning \
    --scan --pattern 'teamflow:cache:project-list:v1:scope:bWVtYmVyOlVTUi0x:g2:size:1:token:~')
  test -n "$cache_key_after_expire" && break
  sleep 1
done
test -n "$cache_key_after_expire"
cache_ttl_after_expire=$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning \
  PTTL "$cache_key_after_expire")
test "$cache_ttl_after_expire" -gt 0

compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning \
  SET "$cache_key_after_expire" '{"items":[{"id":"","name":"broken"}],"nextPageToken":null}' PX 60000 >/dev/null
status=$(http_status "$tmp_dir/projects-cache-invalid.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects?pageSize=1")
test "$status" = 500
assert_problem "$tmp_dir/projects-cache-invalid.json" 500 CACHE_STATE_INVALID
compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning DEL "$cache_key_after_expire" >/dev/null

project_generation_case=0
for invalid_generation in -1 01 broken 9223372036854775808; do
  project_generation_case=$((project_generation_case + 1))
  compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning \
    SET "$project_generation_key" "$invalid_generation" >/dev/null
  status=$(http_status "$tmp_dir/invalid-project-generation-$project_generation_case.json" \
    -H "Authorization: Bearer $token" \
    "$base_url/api/v1/projects?pageSize=1")
  test "$status" = 500
  assert_problem "$tmp_dir/invalid-project-generation-$project_generation_case.json" 500 CACHE_STATE_INVALID
done
compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning SET "$project_generation_key" 2 >/dev/null

status=$(http_status "$tmp_dir/create.json" \
  -H "Authorization: Bearer $token" \
  -H 'Idempotency-Key: delivery-create-1' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Ship TeamFlow","dueAt":"2026-09-01T18:00:00+08:00","assignee":"demo"}' \
  "$base_url/api/v1/projects/PRJ-1/tasks")
test "$status" = 201
assert_json_content_type "$tmp_dir/create.json"
grep -Eiq '^Location: (https?://[^/[:space:]]+)?/api/v1/projects/PRJ-1/tasks/[[:alnum:]-]+[[:space:]]*$' \
  "$tmp_dir/create.json.headers"
task_id=$(jq -r '.id' "$tmp_dir/create.json")
jq -e '.projectId == "PRJ-1" and .status == "IN_PROGRESS" and .version == 0' \
  "$tmp_dir/create.json" >/dev/null
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning GET "$generation_key")" = 1
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning TTL "$generation_key")" = -1

status=$(http_status "$tmp_dir/tasks.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects/PRJ-1/tasks?pageSize=1&status=IN_PROGRESS")
test "$status" = 200
assert_json_content_type "$tmp_dir/tasks.json"
tasks_next_page_token=$(jq -r '.nextPageToken' "$tmp_dir/tasks.json")
test "$tasks_next_page_token" != null
status=$(http_status "$tmp_dir/tasks-second-page.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects/PRJ-1/tasks?pageSize=1&status=IN_PROGRESS&pageToken=$tasks_next_page_token")
test "$status" = 200
assert_json_content_type "$tmp_dir/tasks-second-page.json"
jq -s -e --arg task_id "$task_id" \
  'map(.items) | add | any(.id == $task_id and .status == "IN_PROGRESS")' \
  "$tmp_dir/tasks.json" "$tmp_dir/tasks-second-page.json" >/dev/null
task_list_hash=$(printf '%s' 'v1|status=IN_PROGRESS|pageSize=1|pageToken=~' | sha256)
task_list_key="teamflow:cache:task-list:v1:scope:bWVtYmVyOlVTUi0x:PRJ-1:g1:$task_list_hash"
task_list_ttl=$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning PTTL "$task_list_key")
test "$task_list_ttl" -gt 0
test "$task_list_ttl" -le 90000
status=$(http_status "$tmp_dir/outsider-tasks-cache.json" \
  -H "Authorization: Bearer $outsider_token" \
  "$base_url/api/v1/projects/PRJ-1/tasks?pageSize=1&status=IN_PROGRESS")
test "$status" = 403
assert_problem "$tmp_dir/outsider-tasks-cache.json" 403 ACCESS_DENIED
compose stop mysql >/dev/null
wait_readiness 503 "$report_dir/readiness-mysql-task-list-hit.json"
status=$(http_status "$tmp_dir/tasks-cache-hit.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects/PRJ-1/tasks?pageSize=1&status=IN_PROGRESS")
test "$status" = 200
test "$(jq -S . "$tmp_dir/tasks.json")" = "$(jq -S . "$tmp_dir/tasks-cache-hit.json")"
compose start mysql >/dev/null
wait_readiness 200 "$report_dir/readiness-mysql-task-list-restored.json"
compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning SET "$task_list_key" not-json EX 60 >/dev/null
status=$(http_status "$tmp_dir/tasks-cache-invalid.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects/PRJ-1/tasks?pageSize=1&status=IN_PROGRESS")
test "$status" = 500
assert_problem "$tmp_dir/tasks-cache-invalid.json" 500 CACHE_STATE_INVALID
compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning DEL "$task_list_key" >/dev/null
status=$(http_status "$tmp_dir/tasks-cache-recovered.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects/PRJ-1/tasks?pageSize=1&status=IN_PROGRESS")
test "$status" = 200
compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning PEXPIRE "$task_list_key" 1000 >/dev/null
sleep 2
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning EXISTS "$task_list_key")" = 0
status=$(http_status "$tmp_dir/tasks-cache-expired.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects/PRJ-1/tasks?pageSize=1&status=IN_PROGRESS")
test "$status" = 200

status=$(http_status "$tmp_dir/task-detail-cache-fill.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects/PRJ-1/tasks/$task_id")
test "$status" = 200
task_detail_key="teamflow:cache:task-detail:v1:PRJ-1:$task_id"
task_detail_access_key="teamflow:cache:task-detail-access:v1:scope:bWVtYmVyOlVTUi0x:PRJ-1:$task_id"
task_detail_ttl=$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning PTTL "$task_detail_key")
test "$task_detail_ttl" -gt 0
test "$task_detail_ttl" -le 60000
task_detail_access_ttl=$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning PTTL "$task_detail_access_key")
test "$task_detail_access_ttl" -gt 0
test "$task_detail_access_ttl" -le 60000
status=$(http_status "$tmp_dir/outsider-task-detail-cache.json" \
  -H "Authorization: Bearer $outsider_token" \
  "$base_url/api/v1/projects/PRJ-1/tasks/$task_id")
test "$status" = 403
assert_problem "$tmp_dir/outsider-task-detail-cache.json" 403 ACCESS_DENIED
compose stop mysql >/dev/null
wait_readiness 503 "$report_dir/readiness-mysql-task-detail-hit.json"
status=$(http_status "$tmp_dir/task-detail-cache-hit.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects/PRJ-1/tasks/$task_id")
test "$status" = 200
test "$(jq -S . "$tmp_dir/task-detail-cache-fill.json")" = "$(jq -S . "$tmp_dir/task-detail-cache-hit.json")"
compose start mysql >/dev/null
wait_readiness 200 "$report_dir/readiness-mysql-task-detail-restored.json"
compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning SET "$task_detail_key" not-json EX 60 >/dev/null
status=$(http_status "$tmp_dir/task-detail-cache-invalid.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects/PRJ-1/tasks/$task_id")
test "$status" = 500
assert_problem "$tmp_dir/task-detail-cache-invalid.json" 500 CACHE_STATE_INVALID
compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning DEL "$task_detail_key" >/dev/null
status=$(http_status "$tmp_dir/task-detail-cache-recovered.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects/PRJ-1/tasks/$task_id")
test "$status" = 200
compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning PEXPIRE "$task_detail_key" 1000 >/dev/null
sleep 2
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning EXISTS "$task_detail_key")" = 0
status=$(http_status "$tmp_dir/task-detail-cache-expired.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects/PRJ-1/tasks/$task_id")
test "$status" = 200

status=$(http_status "$tmp_dir/delete-candidate.json" \
  -H "Authorization: Bearer $token" \
  -H 'Idempotency-Key: c3-delete-candidate' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Delete C3 task","dueAt":"2026-09-02T18:00:00+08:00","assignee":"demo"}' \
  "$base_url/api/v1/projects/PRJ-1/tasks")
test "$status" = 201
delete_task_id=$(jq -r '.id' "$tmp_dir/delete-candidate.json")
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning GET "$generation_key")" = 2
status=$(http_status "$tmp_dir/delete-task.json" \
  -H "Authorization: Bearer $token" \
  -X DELETE \
  "$base_url/api/v1/projects/PRJ-1/tasks/$delete_task_id")
test "$status" = 204
test ! -s "$tmp_dir/delete-task.json"
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning GET "$generation_key")" = 3
status=$(http_status "$tmp_dir/deleted-task.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects/PRJ-1/tasks/$delete_task_id")
test "$status" = 404
assert_problem "$tmp_dir/deleted-task.json" 404 RESOURCE_NOT_FOUND

printf 'TeamFlow C3 attachment bytes\n' > "$tmp_dir/attachment.txt"
status=$(curl --silent --show-error --output "$tmp_dir/attachment.json" \
  --dump-header "$tmp_dir/attachment.json.headers" --write-out '%{http_code}' \
  -H "Authorization: Bearer $token" \
  -F 'file=@'$tmp_dir'/attachment.txt;filename=../notes.txt;type=text/plain' \
  "$base_url/api/v1/projects/PRJ-1/tasks/$task_id/attachments")
test "$status" = 201
assert_json_content_type "$tmp_dir/attachment.json"
attachment_id=$(jq -r '.id' "$tmp_dir/attachment.json")
test "$(jq -r '.fileName' "$tmp_dir/attachment.json")" = notes.txt

status=$(curl --silent --show-error --output "$tmp_dir/attachment-download.txt" \
  --dump-header "$tmp_dir/attachment-download.headers" --write-out '%{http_code}' \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects/PRJ-1/tasks/$task_id/attachments/$attachment_id")
test "$status" = 200
cmp "$tmp_dir/attachment.txt" "$tmp_dir/attachment-download.txt"

status=$(curl --silent --show-error --output "$tmp_dir/missing-file-part.json" \
  --dump-header "$tmp_dir/missing-file-part.json.headers" --write-out '%{http_code}' \
  -H "Authorization: Bearer $token" \
  -F 'note=missing-file' \
  "$base_url/api/v1/projects/PRJ-1/tasks/$task_id/attachments")
test "$status" = 400
assert_problem "$tmp_dir/missing-file-part.json" 400 FILE_PART_MISSING

printf 'malformed multipart body' > "$tmp_dir/malformed-multipart.txt"
status=$(curl --silent --show-error --output "$tmp_dir/malformed-multipart.json" \
  --dump-header "$tmp_dir/malformed-multipart.json.headers" --write-out '%{http_code}' \
  -H "Authorization: Bearer $token" \
  -H 'Content-Type: multipart/form-data' \
  --data-binary "@$tmp_dir/malformed-multipart.txt" \
  "$base_url/api/v1/projects/PRJ-1/tasks/$task_id/attachments")
test "$status" = 400
assert_problem "$tmp_dir/malformed-multipart.json" 400 MULTIPART_INVALID

: > "$tmp_dir/empty-attachment.txt"
status=$(curl --silent --show-error --output "$tmp_dir/empty-attachment.json" \
  --dump-header "$tmp_dir/empty-attachment.json.headers" --write-out '%{http_code}' \
  -H "Authorization: Bearer $token" \
  -F "file=@$tmp_dir/empty-attachment.txt;filename=empty.txt;type=text/plain" \
  "$base_url/api/v1/projects/PRJ-1/tasks/$task_id/attachments")
test "$status" = 400
assert_problem "$tmp_dir/empty-attachment.json" 400 EMPTY_FILE

dd if=/dev/zero of="$tmp_dir/too-large-attachment.bin" bs=5242881 count=1 2>/dev/null
status=$(curl --silent --show-error --output "$tmp_dir/too-large-attachment.json" \
  --dump-header "$tmp_dir/too-large-attachment.json.headers" --write-out '%{http_code}' \
  -H "Authorization: Bearer $token" \
  -F "file=@$tmp_dir/too-large-attachment.bin;filename=too-large.bin;type=application/octet-stream" \
  "$base_url/api/v1/projects/PRJ-1/tasks/$task_id/attachments")
test "$status" = 400
assert_problem "$tmp_dir/too-large-attachment.json" 400 FILE_TOO_LARGE

dd if=/dev/zero of="$tmp_dir/container-too-large-attachment.bin" bs=6291457 count=1 2>/dev/null
status=$(curl --silent --show-error --output "$tmp_dir/container-too-large-attachment.json" \
  --dump-header "$tmp_dir/container-too-large-attachment.json.headers" --write-out '%{http_code}' \
  -H "Authorization: Bearer $token" \
  -F "file=@$tmp_dir/container-too-large-attachment.bin;filename=container-too-large.bin;type=application/octet-stream" \
  "$base_url/api/v1/projects/PRJ-1/tasks/$task_id/attachments")
test "$status" = 400
assert_problem "$tmp_dir/container-too-large-attachment.json" 400 FILE_TOO_LARGE

status=$(http_status "$tmp_dir/missing-attachment.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects/PRJ-1/tasks/$task_id/attachments/ATT-404")
test "$status" = 404
assert_problem "$tmp_dir/missing-attachment.json" 404 RESOURCE_NOT_FOUND

status=$(http_status "$tmp_dir/replay.json" \
  --dump-header "$tmp_dir/replay.headers" \
  -H "Authorization: Bearer $token" \
  -H 'Idempotency-Key: delivery-create-1' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Ship TeamFlow","dueAt":"2026-09-01T18:00:00+08:00","assignee":"demo"}' \
  "$base_url/api/v1/projects/PRJ-1/tasks")
test "$status" = 201
grep -Eiq '^Content-Type: application/json(;|[[:space:]]*$)' \
  "$tmp_dir/replay.headers"
test "$(jq -S . "$tmp_dir/create.json")" = "$(jq -S . "$tmp_dir/replay.json")"
grep -Eiq '^Idempotency-Replayed: true' "$tmp_dir/replay.headers"
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning GET "$generation_key")" = 3

idempotency_key=$(idempotency_redis_key 'delivery-create-1')
test -n "$idempotency_key"
idempotency_ttl=$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning \
  PTTL "$idempotency_key")
test "$idempotency_ttl" -gt 0

status=$(http_status "$tmp_dir/conflict.json" \
  -H "Authorization: Bearer $token" \
  -H 'Idempotency-Key: delivery-create-1' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Different task","dueAt":"2026-09-01T18:00:00+08:00","assignee":"demo"}' \
  "$base_url/api/v1/projects/PRJ-1/tasks")
test "$status" = 409
assert_problem "$tmp_dir/conflict.json" 409 IDEMPOTENCY_KEY_REUSED

pending_title='Pending state task'
pending_due_at='2026-09-03T18:00:00+08:00'
pending_assignee='demo'
pending_client_key='c5-pending-state'
pending_redis_key=$(idempotency_redis_key "$pending_client_key")
pending_fingerprint=$(task_fingerprint "$pending_title" "$pending_due_at" "$pending_assignee")
compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning \
  SET "$pending_redis_key" "PENDING|$pending_fingerprint" PX 120000 >/dev/null
status=$(http_status "$tmp_dir/idempotency-pending.json" \
  -H "Authorization: Bearer $token" \
  -H "Idempotency-Key: $pending_client_key" \
  -H 'Content-Type: application/json' \
  -d "{\"title\":\"$pending_title\",\"dueAt\":\"$pending_due_at\",\"assignee\":\"$pending_assignee\"}" \
  "$base_url/api/v1/projects/PRJ-1/tasks")
test "$status" = 409
assert_problem "$tmp_dir/idempotency-pending.json" 409 IDEMPOTENCY_IN_PROGRESS

failed_title='Ship TeamFlow'
failed_due_at='2026-09-04T18:00:00+08:00'
failed_assignee='demo'
failed_client_key='c5-failed-state'
failed_redis_key=$(idempotency_redis_key "$failed_client_key")
failed_fingerprint=$(task_fingerprint "$failed_title" "$failed_due_at" "$failed_assignee")
failed_task_count_before=$(compose exec -T mysql mysql --batch --skip-column-names \
  -uteamflow -plocal-teamflow-pass teamflow \
  -e "SELECT COUNT(*) FROM task WHERE project_id = 'PRJ-1' AND title = '$failed_title'")
test "$failed_task_count_before" = 1
status=$(http_status "$tmp_dir/idempotency-failed-first.json" \
  -H "Authorization: Bearer $token" \
  -H "Idempotency-Key: $failed_client_key" \
  -H 'Content-Type: application/json' \
  -d "{\"title\":\"$failed_title\",\"dueAt\":\"$failed_due_at\",\"assignee\":\"$failed_assignee\"}" \
  "$base_url/api/v1/projects/PRJ-1/tasks")
test "$status" = 409
assert_problem "$tmp_dir/idempotency-failed-first.json" 409 TASK_CREATE_CONFLICT
! grep -Eiq '^Idempotency-Replayed: true' "$tmp_dir/idempotency-failed-first.json.headers"
printf '%s' "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning GET "$failed_redis_key")" \
  | grep -Fq "FAILED|$failed_fingerprint|"
status=$(http_status "$tmp_dir/idempotency-failed-replay.json" \
  -H "Authorization: Bearer $token" \
  -H "Idempotency-Key: $failed_client_key" \
  -H 'Content-Type: application/json' \
  -d "{\"title\":\"$failed_title\",\"dueAt\":\"$failed_due_at\",\"assignee\":\"$failed_assignee\"}" \
  "$base_url/api/v1/projects/PRJ-1/tasks")
test "$status" = 409
assert_problem "$tmp_dir/idempotency-failed-replay.json" 409 TASK_CREATE_CONFLICT
grep -Eiq '^Idempotency-Replayed: true' "$tmp_dir/idempotency-failed-replay.json.headers"
failed_task_count_after=$(compose exec -T mysql mysql --batch --skip-column-names \
  -uteamflow -plocal-teamflow-pass teamflow \
  -e "SELECT COUNT(*) FROM task WHERE project_id = 'PRJ-1' AND title = '$failed_title'")
test "$failed_task_count_after" = 1
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning GET "$generation_key")" = 3

status=$(http_status "$tmp_dir/delimiter-first.json" \
  -H "Authorization: Bearer $token" \
  -H 'Idempotency-Key: delimiter-collision-check' \
  -H 'Content-Type: application/json' \
  -d '{"title":"a|b","dueAt":"c","assignee":"d"}' \
  "$base_url/api/v1/projects/PRJ-1/tasks")
test "$status" = 201
assert_json_content_type "$tmp_dir/delimiter-first.json"
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning GET "$generation_key")" = 4
status=$(http_status "$tmp_dir/delimiter-conflict.json" \
  -H "Authorization: Bearer $token" \
  -H 'Idempotency-Key: delimiter-collision-check' \
  -H 'Content-Type: application/json' \
  -d '{"title":"a","dueAt":"b|c","assignee":"d"}' \
  "$base_url/api/v1/projects/PRJ-1/tasks")
test "$status" = 409
assert_problem "$tmp_dir/delimiter-conflict.json" 409 IDEMPOTENCY_KEY_REUSED

status=$(http_status "$tmp_dir/forbidden-create.json" \
  -H "Authorization: Bearer $limited_token" \
  -H 'Idempotency-Key: forbidden-create' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Forbidden","dueAt":"2026-09-01T18:00:00+08:00","assignee":"demo"}' \
  "$base_url/api/v1/projects/PRJ-1/tasks")
test "$status" = 403
assert_problem "$tmp_dir/forbidden-create.json" 403 ACCESS_DENIED

status=$(http_status "$tmp_dir/version-conflict.json" \
  -H "Authorization: Bearer $token" \
  -H 'Content-Type: application/json' \
  -X PUT \
  -d '{"version":9,"status":"DONE"}' \
  "$base_url/api/v1/projects/PRJ-1/tasks/$task_id")
test "$status" = 409
assert_problem "$tmp_dir/version-conflict.json" 409 TASK_VERSION_CONFLICT

status=$(http_status "$tmp_dir/unchanged.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects/PRJ-1/tasks/$task_id")
test "$status" = 200
assert_json_content_type "$tmp_dir/unchanged.json"
test "$(jq -r '.status' "$tmp_dir/unchanged.json")" = IN_PROGRESS
test "$(jq -r '.version' "$tmp_dir/unchanged.json")" = 0

status=$(http_status "$tmp_dir/no-delivery-after-conflict.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects/PRJ-1/tasks/$task_id/delivery")
test "$status" = 404
assert_problem "$tmp_dir/no-delivery-after-conflict.json" 404 RESOURCE_NOT_FOUND

generation_before_completion=$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning GET "$generation_key")
test "$generation_before_completion" -ge 0
http_status "$tmp_dir/concurrent-1.json" \
  -H "Authorization: Bearer $token" \
  -H 'Content-Type: application/json' \
  -X PUT \
  -d '{"version":0,"status":"DONE"}' \
  "$base_url/api/v1/projects/PRJ-1/tasks/$task_id" \
  >"$tmp_dir/concurrent-1.status" &
concurrent_pid_1=$!
http_status "$tmp_dir/concurrent-2.json" \
  -H "Authorization: Bearer $token" \
  -H 'Content-Type: application/json' \
  -X PUT \
  -d '{"version":0,"status":"DONE"}' \
  "$base_url/api/v1/projects/PRJ-1/tasks/$task_id" \
  >"$tmp_dir/concurrent-2.status" &
concurrent_pid_2=$!
wait "$concurrent_pid_1"
wait "$concurrent_pid_2"
concurrent_status_1=$(cat "$tmp_dir/concurrent-1.status")
concurrent_status_2=$(cat "$tmp_dir/concurrent-2.status")
if test "$concurrent_status_1" = 200 && test "$concurrent_status_2" = 409; then
  cp "$tmp_dir/concurrent-1.json" "$tmp_dir/completed.json"
  cp "$tmp_dir/concurrent-1.json.headers" "$tmp_dir/completed.json.headers"
  cp "$tmp_dir/concurrent-2.json" "$tmp_dir/version-conflict.json"
  cp "$tmp_dir/concurrent-2.json.headers" "$tmp_dir/version-conflict.json.headers"
elif test "$concurrent_status_1" = 409 && test "$concurrent_status_2" = 200; then
  cp "$tmp_dir/concurrent-1.json" "$tmp_dir/version-conflict.json"
  cp "$tmp_dir/concurrent-1.json.headers" "$tmp_dir/version-conflict.json.headers"
  cp "$tmp_dir/concurrent-2.json" "$tmp_dir/completed.json"
  cp "$tmp_dir/concurrent-2.json.headers" "$tmp_dir/completed.json.headers"
else
  false
fi
assert_json_content_type "$tmp_dir/completed.json"
test "$(jq -r '.status' "$tmp_dir/completed.json")" = DONE
test "$(jq -r '.version' "$tmp_dir/completed.json")" = 1
assert_problem "$tmp_dir/version-conflict.json" 409 TASK_VERSION_CONFLICT
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning EXISTS "$task_detail_key")" = 0
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning GET "$generation_key")" = $((generation_before_completion + 1))

delivered=false
for _ in $(seq 1 30); do
  status=$(http_status "$tmp_dir/delivery.json" \
    -H "Authorization: Bearer $token" \
    "$base_url/api/v1/projects/PRJ-1/tasks/$task_id/delivery")
  if test "$status" = 200 \
    && test "$(jq -r '.outboxStatus' "$tmp_dir/delivery.json")" = PUBLISHED \
    && test "$(jq -r '.notificationCount' "$tmp_dir/delivery.json")" = 1; then
    delivered=true
    break
  fi
  sleep 1
done
test "$delivered" = true
assert_json_content_type "$tmp_dir/delivery.json"

event_id=$(jq -r '.eventId' "$tmp_dir/delivery.json")
event_type=$(compose exec -T mysql mysql --batch --skip-column-names \
  -uteamflow -plocal-teamflow-pass teamflow \
  -e "SELECT event_type FROM notification_outbox WHERE event_id = '$event_id'")
test "$event_type" = TaskCompleted
inbox_count=$(compose exec -T mysql mysql --batch --skip-column-names \
  -uteamflow -plocal-teamflow-pass teamflow \
  -e "SELECT COUNT(*) FROM notification_inbox WHERE event_id = '$event_id'")
test "$inbox_count" = 1
notification_count=$(compose exec -T mysql mysql --batch --skip-column-names \
  -uteamflow -plocal-teamflow-pass teamflow \
  -e "SELECT COUNT(*) FROM notification WHERE event_id = '$event_id'")
test "$notification_count" = 1
compose exec -T rabbitmq rabbitmqadmin \
  --username teamflow \
  --password local-rabbit-pass \
  --non-interactive \
  publish message \
  --exchange teamflow.events \
  --routing-key task.completed \
  --payload "$event_id|$task_id" \
  >"$tmp_dir/duplicate-publish.log"

duplicate_consumed=false
for _ in $(seq 1 30); do
  compose logs --no-color teamflow >"$tmp_dir/duplicate-consumer.log"
  if grep -Fq "Notification event $event_id was already consumed" \
    "$tmp_dir/duplicate-consumer.log"; then
    duplicate_consumed=true
    break
  fi
  sleep 1
done
test "$duplicate_consumed" = true

status=$(http_status "$tmp_dir/duplicate-delivery.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects/PRJ-1/tasks/$task_id/delivery")
test "$status" = 200
assert_json_content_type "$tmp_dir/duplicate-delivery.json"
test "$(jq -r '.eventId' "$tmp_dir/duplicate-delivery.json")" = "$event_id"
test "$(jq -r '.notificationCount' "$tmp_dir/duplicate-delivery.json")" = 1

status=$(http_status "$tmp_dir/cross-project-delivery.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects/PRJ-2/tasks/$task_id/delivery")
test "$status" = 404
assert_problem "$tmp_dir/cross-project-delivery.json" 404 RESOURCE_NOT_FOUND

status=$(http_status "$tmp_dir/delete-completed-task.json" \
  -H "Authorization: Bearer $token" \
  -X DELETE \
  "$base_url/api/v1/projects/PRJ-1/tasks/$task_id")
test "$status" = 204
test ! -s "$tmp_dir/delete-completed-task.json"
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning GET "$generation_key")" = 6
status=$(http_status "$tmp_dir/deleted-completed-task.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects/PRJ-1/tasks/$task_id")
test "$status" = 404
assert_problem "$tmp_dir/deleted-completed-task.json" 404 RESOURCE_NOT_FOUND
outbox_after_delete=$(compose exec -T mysql mysql --batch --skip-column-names \
  -uteamflow -plocal-teamflow-pass teamflow \
  -e "SELECT COUNT(*) FROM notification_outbox WHERE event_id = '$event_id'")
test "$outbox_after_delete" = 0
notification_after_delete=$(compose exec -T mysql mysql --batch --skip-column-names \
  -uteamflow -plocal-teamflow-pass teamflow \
  -e "SELECT COUNT(*) FROM notification WHERE event_id = '$event_id'")
test "$notification_after_delete" = 0

compose stop redis >/dev/null
wait_readiness 503 "$report_dir/readiness-redis-business-failure.json"
status=$(http_status "$tmp_dir/verification-redis-down.json" \
  -H "Authorization: Bearer $admin_token" \
  -X POST \
  "$base_url/api/v1/users/USR-2/email-change-verification-code")
test "$status" = 503
assert_problem "$tmp_dir/verification-redis-down.json" 503 DEPENDENCY_UNAVAILABLE
status=$(http_status "$tmp_dir/task-cache-redis-down.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects/PRJ-1/tasks/TASK-1")
test "$status" = 503
assert_problem "$tmp_dir/task-cache-redis-down.json" 503 DEPENDENCY_UNAVAILABLE
compose start redis >/dev/null
wait_readiness 200 "$report_dir/readiness-redis-business-restored.json"
test "$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning EXISTS 'teamflow:verification-code:v1:email-change:USR-2')" = 0

status=$(http_status "$tmp_dir/revocation-task.json" \
  -H "Authorization: Bearer $token" \
  -H 'Idempotency-Key: c6-membership-revocation' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Membership revocation task","dueAt":"2026-09-04T18:00:00+08:00","assignee":"demo"}' \
  "$base_url/api/v1/projects/PRJ-1/tasks")
test "$status" = 201
revocation_task_id=$(jq -r '.id' "$tmp_dir/revocation-task.json")

status=$(http_status "$tmp_dir/revocable-member.json" \
  -H "Authorization: Bearer $admin_token" \
  -H 'Content-Type: application/json' \
  -d '{"userId":"USR-2","role":"Reviewer"}' \
  "$base_url/api/v1/teams/TEAM-1/members")
test "$status" = 201
revocable_member_id=$(jq -r '.id' "$tmp_dir/revocable-member.json")

status=$(http_status "$tmp_dir/revocable-project-cache.json" \
  -H "Authorization: Bearer $outsider_token" \
  "$base_url/api/v1/projects?pageSize=50")
test "$status" = 200
jq -e '.items | any(.id == "PRJ-1")' "$tmp_dir/revocable-project-cache.json" >/dev/null
status=$(http_status "$tmp_dir/revocable-task-list-cache.json" \
  -H "Authorization: Bearer $outsider_token" \
  "$base_url/api/v1/projects/PRJ-1/tasks?pageSize=50")
test "$status" = 200
status=$(http_status "$tmp_dir/revocable-task-detail-cache.json" \
  -H "Authorization: Bearer $outsider_token" \
  "$base_url/api/v1/projects/PRJ-1/tasks/$revocation_task_id")
test "$status" = 200

membership_guard_key='teamflow:cache:membership-change-guard:v1'
project_generation_before_revoke=$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning \
  GET "$project_generation_key")
task_generation_before_revoke=$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning \
  GET "$generation_key")
compose exec -T mysql mysql --batch --skip-column-names --unbuffered \
  -uteamflow -plocal-teamflow-pass teamflow \
  -e "START TRANSACTION; SELECT id FROM team_member WHERE id = '$revocable_member_id' FOR UPDATE; SELECT SLEEP(20); COMMIT;" \
  >"$tmp_dir/revocation-row-lock.txt" &
revocation_lock_pid=$!
revocation_locked=false
for _ in $(seq 1 50); do
  if grep -Fxq "$revocable_member_id" "$tmp_dir/revocation-row-lock.txt"; then
    revocation_locked=true
    break
  fi
  sleep 0.2
done
test "$revocation_locked" = true

http_status "$tmp_dir/revoke-member.json" \
  -H "Authorization: Bearer $admin_token" \
  -X DELETE \
  "$base_url/api/v1/teams/TEAM-1/members/$revocable_member_id" \
  >"$tmp_dir/revoke-member.status" &
revocation_request_pid=$!
revocation_guarded=false
for _ in $(seq 1 100); do
  guard_token=$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning \
    GET "$membership_guard_key")
  project_generation_during_revoke=$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning \
    GET "$project_generation_key")
  task_generation_during_revoke=$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning \
    GET "$generation_key")
  if test -n "$guard_token" \
    && test "$project_generation_during_revoke" -gt "$project_generation_before_revoke" \
    && test "$task_generation_during_revoke" -gt "$task_generation_before_revoke"; then
    revocation_guarded=true
    break
  fi
  sleep 0.1
done
test "$revocation_guarded" = true

compose stop redis >/dev/null
wait "$revocation_lock_pid"
wait "$revocation_request_pid"
test "$(cat "$tmp_dir/revoke-member.status")" = 503
assert_problem "$tmp_dir/revoke-member.json" 503 DEPENDENCY_UNAVAILABLE
test "$(compose exec -T mysql mysql --batch --skip-column-names \
  -uteamflow -plocal-teamflow-pass teamflow \
  -e "SELECT COUNT(*) FROM team_member WHERE id = '$revocable_member_id'")" = 0

compose start redis >/dev/null
wait_readiness 200 "$report_dir/readiness-redis-revocation-restored.json"
membership_guard_ttl=$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning \
  PTTL "$membership_guard_key")
test "$membership_guard_ttl" -gt 90000
test "$membership_guard_ttl" -le 120000

status=$(http_status "$tmp_dir/guarded-project-cache.json" \
  -H "Authorization: Bearer $outsider_token" \
  "$base_url/api/v1/projects?pageSize=50")
test "$status" = 503
assert_problem "$tmp_dir/guarded-project-cache.json" 503 DEPENDENCY_UNAVAILABLE
status=$(http_status "$tmp_dir/guarded-task-list-cache.json" \
  -H "Authorization: Bearer $outsider_token" \
  "$base_url/api/v1/projects/PRJ-1/tasks?pageSize=50")
test "$status" = 503
assert_problem "$tmp_dir/guarded-task-list-cache.json" 503 DEPENDENCY_UNAVAILABLE
status=$(http_status "$tmp_dir/guarded-task-detail-cache.json" \
  -H "Authorization: Bearer $outsider_token" \
  "$base_url/api/v1/projects/PRJ-1/tasks/$revocation_task_id")
test "$status" = 503
assert_problem "$tmp_dir/guarded-task-detail-cache.json" 503 DEPENDENCY_UNAVAILABLE
compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning \
  DEL "$membership_guard_key" >/dev/null

status=$(http_status "$tmp_dir/revoked-project-cache.json" \
  -H "Authorization: Bearer $outsider_token" \
  "$base_url/api/v1/projects?pageSize=50")
test "$status" = 200
jq -e '.items | all(.id != "PRJ-1")' "$tmp_dir/revoked-project-cache.json" >/dev/null
status=$(http_status "$tmp_dir/revoked-task-list-cache.json" \
  -H "Authorization: Bearer $outsider_token" \
  "$base_url/api/v1/projects/PRJ-1/tasks?pageSize=50")
test "$status" = 403
assert_problem "$tmp_dir/revoked-task-list-cache.json" 403 ACCESS_DENIED
status=$(http_status "$tmp_dir/revoked-task-detail-cache.json" \
  -H "Authorization: Bearer $outsider_token" \
  "$base_url/api/v1/projects/PRJ-1/tasks/$revocation_task_id")
test "$status" = 403
assert_problem "$tmp_dir/revoked-task-detail-cache.json" 403 ACCESS_DENIED

compose logs --no-color --tail=all teamflow >"$tmp_dir/teamflow.log"
! grep -Fq 'Passw0rd!Pass' "$tmp_dir/teamflow.log"
! grep -Fq "$jwt_secret" "$tmp_dir/teamflow.log"
! grep -Fq 'delivery-create-1' "$tmp_dir/teamflow.log"
! grep -Fq 'c5-pending-state' "$tmp_dir/teamflow.log"
! grep -Fq 'c5-failed-state' "$tmp_dir/teamflow.log"
! grep -Fq 'Authorization: Bearer' "$tmp_dir/teamflow.log"
! grep -Fq "\"code\":\"$verification_code\"" "$tmp_dir/teamflow.log"
! grep -Fq "\"code\":\"$verification_reissued_code\"" "$tmp_dir/teamflow.log"
! grep -Fq "\"code\":\"$verification_success_code\"" "$tmp_dir/teamflow.log"
if test "$profile" = modern; then
  sed -nE 's/^[^|]*\| (\{.*\})$/\1/p' "$tmp_dir/teamflow.log" >"$tmp_dir/teamflow-json.log"
  jq -e --arg trace "$anonymous_me_trace_id" \
    'select(.event == "http_request" and .traceId == $trace and .path == "/api/v1/me" and .status == 401 and .failureReason == "HTTP_401")' \
    "$tmp_dir/teamflow-json.log" >/dev/null
  jq -e \
    'select(.event == "http_request" and .traceId == "smoke-correlation-7" and .path == "/api/v1/me" and .status == 401 and .failureReason == "HTTP_401")' \
    "$tmp_dir/teamflow-json.log" >/dev/null
  jq -e --arg event_id "$event_id" --arg task_id "$task_id" \
    'select(.event == "notification_publish" and .path == "/outbox" and .status == "PUBLISHED" and .eventId == $event_id and .taskId == $task_id and (.attempts | type) == "number" and .failureReason == "none")' \
    "$tmp_dir/teamflow-json.log" >/dev/null
  jq -e --arg event_id "$event_id" \
    'select(.event == "notification_consume" and .path == "/messages/task.completed" and .status == 200 and .eventId == $event_id and (.attempts | type) == "number" and .failureReason == "none")' \
    "$tmp_dir/teamflow-json.log" >/dev/null
else
  grep -Eq 'http_request traceId=[^ ]+ path=/api/v1/me status=200 failureReason=none' \
    "$tmp_dir/teamflow.log"
  grep -Eq "http_request traceId=$anonymous_me_trace_id path=/api/v1/me status=401 failureReason=HTTP_401" \
    "$tmp_dir/teamflow.log"
  grep -Eq 'http_request traceId=smoke-correlation-7 path=/api/v1/me status=401 failureReason=HTTP_401' \
    "$tmp_dir/teamflow.log"
  grep -Eq "notification_publish traceId=[^ ]+ path=/outbox status=PUBLISHED eventId=$event_id taskId=$task_id attempts=[0-9]+ failureReason=none" \
    "$tmp_dir/teamflow.log"
  grep -Eq "notification_consume traceId=[^ ]+ path=/messages/task.completed status=200 eventId=$event_id attempts=[0-9]+ failureReason=none" \
    "$tmp_dir/teamflow.log"
fi

status=$(http_status "$tmp_dir/unknown.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/unknown")
test "$status" = 403
assert_problem "$tmp_dir/unknown.json" 403 ACCESS_DENIED

cp "$tmp_dir/create.json" "$report_dir/create.json"
cp "$tmp_dir/conflict.json" "$report_dir/conflict.json"
cp "$tmp_dir/duplicate-delivery.json" "$report_dir/duplicate-delivery.json"
printf 'c3=users-teams-projects-tasks-files-cors-openapi c4=mysql-mybatis-migrations-completed-delete c5=task-cache-generation-verification-idempotency c6=jwt-required-claims-resource-scope-role-action-cookie-membership-guard anonymous=401 token=jwt-userId cache=scoped-miss-hit-expired pagination=stable outsider=403 admin=200 admin-without-write=403 jwt-invalid=401 cookie=stateless create=201 replay=201 conflict=409 delimiter=409 rollback=409 notification=1 duplicate=1 permission=403 expired=401 unknown=403 task=%s event=%s\n' \
  "$task_id" "$event_id"
