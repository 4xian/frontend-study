#!/usr/bin/env bash
set -euo pipefail

profile="$1"
port="$2"
script_dir=$(cd "$(dirname "$0")" && pwd)
source_dir="$script_dir/teamflow-$profile"
frontend_source_dir="$script_dir/teamflow-frontend"
compose_file="$script_dir/compose.yaml"
run_id="$(date +%s)-$$"
work_dir=$(mktemp -d "/tmp/teamflow-${profile}-gate.XXXXXX")
build_dir="$work_dir/source"
frontend_build_dir="$work_dir/frontend"
maven_cache_dir="$work_dir/maven-cache"
report_dir="$work_dir/reports"
repo_dir=$(cd "$script_dir/../../../../../../.." && pwd)
frontend_pid=''
partner_pid=''
project="teamflow-${profile}-${run_id}"
image="teamflow:${profile}-${run_id}"

assert_json_content_type() {
  grep -Eiq '^Content-Type: application/(json|[^;[:space:]]+\+json)(;|[[:space:]]*$)' "$1"
}

case "$profile" in
  modern)
    maven_image='maven:3.9.11-eclipse-temurin-25'
    expected_main='org.springframework.boot.loader.launch.JarLauncher'
    ;;
  legacy)
    maven_image='maven:3.9.11-eclipse-temurin-8'
    expected_main='org.springframework.boot.loader.JarLauncher'
    ;;
  *)
    printf 'unsupported profile: %s\n' "$profile" >&2
    exit 2
    ;;
esac

cleanup() {
  local exit_code="$?"
  if test -n "$frontend_pid"; then
    kill "$frontend_pid" >/dev/null 2>&1 || true
    wait "$frontend_pid" >/dev/null 2>&1 || true
  fi
  if test -n "$partner_pid"; then
    kill "$partner_pid" >/dev/null 2>&1 || true
    wait "$partner_pid" >/dev/null 2>&1 || true
  fi
  TEAMFLOW_IMAGE="$image" TEAMFLOW_PORT="$port" \
    docker compose -p "$project" -f "$compose_file" down --volumes \
    >"$work_dir/compose-down.log" 2>&1 || true
  if test "$exit_code" -eq 0; then
    rm -r "$work_dir"
  else
    printf 'gate failed; reports preserved at %s\n' "$work_dir" >&2
    find "$report_dir" -maxdepth 1 -type f -print -exec tail -n 40 {} \; >&2 || true
  fi
  exit "$exit_code"
}
trap cleanup EXIT

cp -R "$source_dir" "$build_dir"
cp -R "$frontend_source_dir" "$frontend_build_dir"
mkdir -p "$report_dir" "$maven_cache_dir"
mkdir -p "$build_dir/src/test/java/dev/teamflow/application"
cat >"$build_dir/src/test/java/dev/teamflow/application/TaskCommandServiceTest.java" <<'JAVA'
package dev.teamflow.application;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import dev.teamflow.persistence.TeamFlowMapper;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

/** 验证 application 层任务完成事务的关键反馈。 */
class TaskCommandServiceTest {
  /** 成功完成任务时同步写入 outbox。 */
  @Test
  void completesTaskAndWritesOutbox() {
    TeamFlowMapper mapper = mock(TeamFlowMapper.class);
    when(mapper.completeTask("PRJ-1", "TASK-1", 0L)).thenReturn(1);
    TaskCommandService service = new TaskCommandService(mapper);

    service.complete("PRJ-1", "TASK-1", 0L, "DONE");

    verify(mapper).completeTask("PRJ-1", "TASK-1", 0L);
    ArgumentCaptor<String> eventId = ArgumentCaptor.forClass(String.class);
    verify(mapper).insertOutbox(eventId.capture(), eq("TASK-1"));
    assertFalse(eventId.getValue().isEmpty());
  }

  /** 乐观版本冲突时不创建 outbox。 */
  @Test
  void rejectsVersionConflictWithoutOutbox() {
    TeamFlowMapper mapper = mock(TeamFlowMapper.class);
    when(mapper.completeTask("PRJ-1", "TASK-1", 4L)).thenReturn(0);
    TaskCommandService service = new TaskCommandService(mapper);

    assertThrows(
        TeamFlowConflictException.class,
        () -> service.complete("PRJ-1", "TASK-1", 4L, "DONE"));

    verify(mapper, never()).insertOutbox(org.mockito.ArgumentMatchers.anyString(), eq("TASK-1"));
  }
}
JAVA

docker run --rm \
  --volume "$frontend_build_dir:/workspace" \
  --workdir /workspace \
  --env "VITE_TEAMFLOW_API_BASE_URL=http://127.0.0.1:$port" \
  node:24.14.0-alpine \
  sh -c 'npm ci && npm run build' >"$report_dir/frontend-build.log" 2>&1

test -f "$frontend_build_dir/dist/index.html"
grep -R -Fq "http://127.0.0.1:$port" "$frontend_build_dir/dist/assets"

(
  cd "$repo_dir"
  npm run type-check
  npm run lint
  npm run build
  npx prettier --check \
    docs/backend/java/teamflow-progressive-project-remediation-plan.md \
    "$script_dir/compose.yaml" \
    "$script_dir/contracts"/*.md \
    "$script_dir/teamflow-frontend"/index.html \
    "$script_dir/teamflow-frontend"/package.json \
    "$script_dir/teamflow-frontend"/src/main.tsx \
    "$script_dir/teamflow-frontend"/src/styles.css
) >"$report_dir/root-checks.log" 2>&1

frontend_port=$(python3 -c 'import socket; sock = socket.socket(); sock.bind(("127.0.0.1", 0)); print(sock.getsockname()[1]); sock.close()')
python3 -m http.server "$frontend_port" --bind 127.0.0.1 \
  --directory "$frontend_build_dir/dist" >"$report_dir/frontend-server.log" 2>&1 &
frontend_pid=$!
frontend_url="http://127.0.0.1:$frontend_port"
frontend_ready=false
for _ in $(seq 1 20); do
  if ! kill -0 "$frontend_pid" >/dev/null 2>&1; then
    break
  fi
  if curl --silent --fail "$frontend_url" >/dev/null 2>&1; then
    frontend_ready=true
    break
  fi
  sleep 1
done
test "$frontend_ready" = true
node --input-type=module - "$frontend_url" >"$report_dir/browser-check.log" 2>&1 <<'NODE'
import { chromium } from 'playwright'

const url = process.argv[2]
const browser = await chromium.launch({ headless: true })
for (const viewport of [
  { width: 1280, height: 800 },
  { width: 390, height: 844 },
]) {
  const page = await browser.newPage({ viewport })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.goto(url, { waitUntil: 'networkidle' })
  if ((await page.locator('h1').textContent()) !== '交付联调台') {
    throw new Error(`unexpected heading at ${viewport.width}px`)
  }
  if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)) {
    throw new Error(`horizontal overflow at ${viewport.width}px`)
  }
  if (errors.length > 0) throw new Error(errors.join('; '))
  await page.close()
}
await browser.close()
console.log('browser=PASS viewports=1280,390')
NODE

docker run --rm \
  --volume "$build_dir:/workspace" \
  --volume "$maven_cache_dir:/root/.m2" \
  --workdir /workspace \
  "$maven_image" \
  mvn -B clean verify >"$report_dir/maven.log" 2>&1

application_test_report="$build_dir/target/surefire-reports/TEST-dev.teamflow.application.TaskCommandServiceTest.xml"
test -f "$application_test_report"
grep -Eq 'tests="2"' "$application_test_report"
grep -Eq 'errors="0"' "$application_test_report"
grep -Eq 'failures="0"' "$application_test_report"
grep -Eq 'skipped="0"' "$application_test_report"

jar_path=$(find "$build_dir/target" -maxdepth 1 -type f -name '*.jar' ! -name '*.jar.original')
test "$(printf '%s\n' "$jar_path" | sed '/^$/d' | wc -l | tr -d ' ')" = 1
manifest=$(unzip -p "$jar_path" META-INF/MANIFEST.MF)
printf '%s\n' "$manifest" | grep -Fq "Main-Class: $expected_main"
unzip -Z1 "$jar_path" >"$report_dir/jar-entries.txt"
grep -Fxq 'BOOT-INF/classes/' "$report_dir/jar-entries.txt"
grep -Fxq 'BOOT-INF/lib/' "$report_dir/jar-entries.txt"

docker build --tag "$image" "$build_dir" >"$report_dir/docker-build.log" 2>&1
docker image inspect "$image" >"$report_dir/image.json"
jq -e '.[0].Config.User == "10001:10001"' "$report_dir/image.json" >/dev/null
jq -e '.[0].Config.Entrypoint == ["java", "-jar", "/app/app.jar"]' \
  "$report_dir/image.json" >/dev/null
jq -e '.[0].Config.ExposedPorts | has("8080/tcp")' "$report_dir/image.json" >/dev/null
jq -e '.[0].Config.Healthcheck.Test | join(" ") | contains("/actuator/health/readiness")' \
  "$report_dir/image.json" >/dev/null

partner_port=$(python3 -c 'import socket; sock = socket.socket(); sock.bind(("127.0.0.1", 0)); print(sock.getsockname()[1]); sock.close()')
partner_base_url="http://host.docker.internal:$partner_port"
partner_counter_file="$work_dir/partner-post-count.txt"
partner_script="$work_dir/partner-server.py"
printf '0\n' >"$partner_counter_file"
cat >"$partner_script" <<'PY'
import json
import sys
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote, urlparse


class PartnerHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.0"
    counter_file = ""

    def log_message(self, format_string, *args):
        sys.stdout.write((format_string % args) + "\n")
        sys.stdout.flush()

    def send_payload(self, status, payload, content_type="application/json"):
        body = payload if isinstance(payload, bytes) else payload.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_request_body(self):
        if self.headers.get("Transfer-Encoding", "").lower() != "chunked":
            return self.rfile.read(int(self.headers.get("Content-Length", "0")))
        chunks = []
        while True:
            size_line = self.rfile.readline().strip()
            size = int(size_line.split(b";", 1)[0], 16)
            if size == 0:
                self.rfile.readline()
                return b"".join(chunks)
            chunks.append(self.rfile.read(size))
            self.rfile.read(2)

    def do_GET(self):
        path = urlparse(self.path).path
        if not path.startswith("/projects/"):
            self.send_payload(404, b"not found", "text/plain")
            return
        project_id = unquote(path.rsplit("/", 1)[-1])
        if project_id == "PARTNER-404":
            self.send_payload(404, json.dumps({"error": "missing"}))
            return
        if project_id == "PARTNER-5XX":
            self.send_payload(503, json.dumps({"error": "unavailable"}))
            return
        if project_id == "PARTNER-BAD-JSON":
            self.send_payload(200, b"{broken")
            return
        if project_id == "PARTNER-SLOW":
            time.sleep(2)
        self.send_payload(
            200,
            json.dumps({"id": project_id, "name": "Partner project", "status": "ACTIVE"}),
        )

    def do_POST(self):
        if urlparse(self.path).path != "/projects":
            self.send_payload(404, b"not found", "text/plain")
            return
        raw_body = self.read_request_body()
        try:
            request = json.loads(raw_body.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self.send_payload(400, json.dumps({"error": "invalid json"}))
            return
        with open(self.counter_file, "r+", encoding="utf-8") as counter:
            count = int(counter.read().strip() or "0") + 1
            counter.seek(0)
            counter.truncate()
            counter.write(str(count) + "\n")
            counter.flush()
        self.send_payload(
            201,
            json.dumps(
                {"id": "PARTNER-CREATED", "name": request.get("name", ""), "status": "ACTIVE"}
            ),
        )


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", int(sys.argv[1])), PartnerHandler)
    PartnerHandler.counter_file = sys.argv[2]
    server.serve_forever()
PY
python3 "$partner_script" "$partner_port" "$partner_counter_file" \
  >"$report_dir/partner-server.log" 2>&1 &
partner_pid=$!
partner_ready=false
for _ in $(seq 1 20); do
  if curl --silent --fail "http://127.0.0.1:$partner_port/projects/PARTNER-1" >/dev/null 2>&1; then
    partner_ready=true
    break
  fi
  sleep 1
done
test "$partner_ready" = true
export TEAMFLOW_PARTNER_BASE_URL="$partner_base_url"
export TEAMFLOW_PARTNER_COUNTER_FILE="$partner_counter_file"

TEAMFLOW_IMAGE="$image" TEAMFLOW_PORT="$port" \
  TEAMFLOW_CORS_ALLOWED_ORIGINS="$frontend_url" \
  docker compose -p "$project" -f "$compose_file" up -d --wait \
  >"$report_dir/compose-up.log" 2>&1

base_url="http://127.0.0.1:$port"
test "$(curl --silent --output "$report_dir/liveness.json" \
  --dump-header "$report_dir/liveness.headers" --write-out '%{http_code}' \
  "$base_url/actuator/health/liveness")" = 200
assert_json_content_type "$report_dir/liveness.headers"
test "$(curl --silent --output "$report_dir/readiness.json" \
  --dump-header "$report_dir/readiness.headers" --write-out '%{http_code}' \
  "$base_url/actuator/health/readiness")" = 200
assert_json_content_type "$report_dir/readiness.headers"

node --input-type=module - "$frontend_url" >"$report_dir/browser-integration-check.log" 2>&1 <<'NODE'
import { chromium } from 'playwright'

const frontendUrl = process.argv[2]
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
const errors = []
const taskRequests = []
const taskResponses = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
page.on('request', (request) => {
  if (request.method() === 'POST' && request.url().includes('/api/v1/projects/')) {
    taskRequests.push(request)
  }
})
page.on('response', (response) => {
  if (response.url().includes('/api/v1/projects/') && response.request().method() === 'POST') {
    taskResponses.push(response)
  }
})
await page.goto(frontendUrl, { waitUntil: 'networkidle' })
await page.getByRole('button', { name: '获取令牌' }).click()
await page.getByRole('button', { name: '刷新', exact: true }).click()
await page.getByText('已加载 2 个项目').waitFor()
await page.getByRole('button', { name: '创建任务' }).click()
await page.waitForFunction(() => document.querySelector('output.status')?.textContent?.includes('IN_PROGRESS'))
if (!taskRequests.some((request) => request.headers()['idempotency-key'])) {
  throw new Error('frontend task request missing Idempotency-Key')
}
if (!taskResponses.some((response) => response.status() === 201)) {
  throw new Error('frontend task request did not return 201')
}
if (errors.length > 0) throw new Error(errors.join('; '))
await browser.close()
console.log('browser-integration=PASS login=projects cors=PASS')
NODE
kill "$frontend_pid" >/dev/null 2>&1 || true
wait "$frontend_pid" >/dev/null 2>&1 || true
frontend_pid=''

TEAMFLOW_IMAGE="$image" TEAMFLOW_PORT="$port" \
  TEAMFLOW_TEST_ORIGIN="$frontend_url" \
    bash "$script_dir/delivery-smoke.sh" "$base_url" "$report_dir" "$project" "$compose_file" "$profile"

container_id=$(TEAMFLOW_IMAGE="$image" TEAMFLOW_PORT="$port" \
  docker compose -p "$project" -f "$compose_file" ps -q teamflow)
shutdown_started=$(date +%s)
slow_response="$report_dir/graceful-shutdown-slow.json"
slow_request_pid=''
curl --silent --show-error --output "$slow_response" \
  --dump-header "$report_dir/graceful-shutdown-slow.headers" \
  "$base_url/slow" &
slow_request_pid=$!
sleep 1
TEAMFLOW_IMAGE="$image" TEAMFLOW_PORT="$port" \
  docker compose -p "$project" -f "$compose_file" kill -s SIGTERM teamflow \
  >"$report_dir/graceful-shutdown-signal.log" 2>&1
shutdown_finished=false
shutdown_readiness_rejected=false
for _ in $(seq 1 20); do
  test "$(docker inspect -f '{{.State.Running}}' "$container_id" 2>/dev/null || true)" = true || break
  http_code=$(curl --silent --output /dev/null --write-out '%{http_code}' \
    "$base_url/actuator/health/readiness" || true)
  if test "$http_code" = 503 || test "$http_code" = 000; then
    shutdown_readiness_rejected=true
    break
  fi
  sleep 1
done
test "$shutdown_readiness_rejected" = true
: >"$report_dir/graceful-shutdown-new.json"
new_slow_status=$(curl --silent --show-error --output "$report_dir/graceful-shutdown-new.json" \
  --dump-header "$report_dir/graceful-shutdown-new.headers" \
  --write-out '%{http_code}' --max-time 6 "$base_url/slow" \
  2>"$report_dir/graceful-shutdown-new.curl.log" || true)
test "$new_slow_status" = 503 || test "$new_slow_status" = 000
wait "$slow_request_pid"
grep -Fq 'slow-finished; accepted=1' "$slow_response"
if grep -Fq 'slow-finished; accepted=2' "$report_dir/graceful-shutdown-new.json"; then
  printf 'new slow request entered business handler during shutdown\n' >&2
  exit 1
fi
for _ in $(seq 1 20); do
  if test "$(docker inspect -f '{{.State.Running}}' "$container_id" 2>/dev/null || true)" = false; then
    shutdown_finished=true
    break
  fi
  sleep 1
done
test "$shutdown_finished" = true
shutdown_elapsed=$(($(date +%s) - shutdown_started))
test "$shutdown_elapsed" -le 15
TEAMFLOW_IMAGE="$image" TEAMFLOW_PORT="$port" \
  docker compose -p "$project" -f "$compose_file" start teamflow \
  >"$report_dir/graceful-shutdown-restart.log" 2>&1
restarted=false
for _ in $(seq 1 30); do
  http_code=$(curl --silent --output "$report_dir/readiness-after-shutdown.json" \
    --dump-header "$report_dir/readiness-after-shutdown.headers" \
    --write-out '%{http_code}' "$base_url/actuator/health/readiness" || true)
  if test "$http_code" = 200; then
    assert_json_content_type "$report_dir/readiness-after-shutdown.headers"
    restarted=true
    break
  fi
  sleep 1
done
test "$restarted" = true

for dependency in mysql redis rabbitmq; do
  TEAMFLOW_IMAGE="$image" TEAMFLOW_PORT="$port" \
    docker compose -p "$project" -f "$compose_file" stop "$dependency" >/dev/null
  dependency_down=false
  for _ in $(seq 1 20); do
    status=$(curl --silent --output "$report_dir/readiness-${dependency}-down.json" \
      --dump-header "$report_dir/readiness-${dependency}-down.headers" \
      --write-out '%{http_code}' "$base_url/actuator/health/readiness" || true)
    if test "$status" = 503; then
      assert_json_content_type "$report_dir/readiness-${dependency}-down.headers"
      dependency_down=true
      break
    fi
    sleep 1
  done
  test "$dependency_down" = true
  liveness_status=$(curl --silent --output "$report_dir/liveness-${dependency}-down.json" \
    --dump-header "$report_dir/liveness-${dependency}-down.headers" \
    --write-out '%{http_code}' "$base_url/actuator/health/liveness" || true)
  test "$liveness_status" = 200
  assert_json_content_type "$report_dir/liveness-${dependency}-down.headers"
  TEAMFLOW_IMAGE="$image" TEAMFLOW_PORT="$port" \
    docker compose -p "$project" -f "$compose_file" start "$dependency" >/dev/null
  dependency_up=false
  for _ in $(seq 1 30); do
    status=$(curl --silent --output "$report_dir/readiness-${dependency}-up.json" \
      --dump-header "$report_dir/readiness-${dependency}-up.headers" \
      --write-out '%{http_code}' "$base_url/actuator/health/readiness" || true)
    if test "$status" = 200; then
      assert_json_content_type "$report_dir/readiness-${dependency}-up.headers"
      dependency_up=true
      break
    fi
    sleep 1
  done
  test "$dependency_up" = true
done

printf 'profile=%s gate=PASS port=%s\n' "$profile" "$port"
