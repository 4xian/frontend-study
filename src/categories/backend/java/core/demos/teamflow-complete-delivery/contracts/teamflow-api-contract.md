# TeamFlow API Contract

这是现代版和 Java 8 兼容版共同使用的入站、数据、缓存、出站和运行时合同。两版只允许在框架入口、Servlet
命名空间、JWT 签发适配和 Redis/Jackson API 上存在实现差异。

## HTTP 共通规则

- JSON 请求必须发送 `Content-Type: application/json`；JSON 响应使用 `application/json`。
- 所有受保护 API 都需要 `Authorization: Bearer <token>`。没有令牌或令牌无效返回 `401`，权限不足和未声明路径返回 `403`。
- 服务端使用无状态 Bearer JWT，不创建 HTTP Session；令牌签发、成功请求和拒绝响应均不得返回 `Set-Cookie`。
- 错误响应使用 `application/problem+json`，并包含 `type`、`title`、`status`、`detail`、`instance`、`code`、
  `traceId` 和 `errors`；字段错误按 `field` 排序，其他错误的 `errors` 为空数组。
- body 的 `status` 必须等于 HTTP 状态；错误不得包含密码、JWT 密钥或原始 Redis 幂等键。
- JSON 无法解析、缺少必需请求头或参数返回 `400`；不支持的媒体类型返回 `415`。

## 入站端点

| 方法与路径                                                                    | 请求                                             | 成功响应                                                          | 主要失败码                                                                                                     |
| ----------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `POST /api/v1/auth/token`                                                     | `{"username":"demo","password":"Passw0rd!Pass"}` | `200`，`accessToken`、`tokenType=Bearer`、`expiresIn=300`         | `AUTH_REQUIRED` (`401`)，`INVALID_REQUEST_BODY` (`400`)                                                        |
| `GET /api/v1/me`                                                              | Bearer JWT                                       | `200`，`username`、`authorities`                                  | `AUTH_REQUIRED` (`401`)                                                                                        |
| `GET /api/v1/users?pageSize=20&pageToken=...`                                 | Bearer JWT、`pageSize` 1 至 50                   | `200`，用户分页                                                   | `INVALID_PAGE_SIZE`、`INVALID_PAGE_TOKEN` (`400`)                                                              |
| `GET /api/v1/users/{userId}`                                                  | Bearer JWT                                       | `200`，用户 JSON                                                  | `RESOURCE_NOT_FOUND` (`404`)                                                                                   |
| `POST /api/v1/users`                                                          | Bearer JWT、`displayName`、合法 `email`          | `201`，用户 JSON 和 `Location`                                    | `REQUEST_VALIDATION_FAILED` (`400`)，`USER_CONFLICT` (`409`)                                                   |
| `POST /api/v1/users/{userId}/email-change-verification-code`                  | Bearer JWT                                       | `202`，无 body；code TTL 5 分钟、attempts TTL 10 分钟             | `DEPENDENCY_UNAVAILABLE` (`503`)                                                                               |
| `POST /api/v1/users/{userId}/email-change-verification-code/verification`     | Bearer JWT、`{"code":"123456"}`                  | `200`，`{"result":"VERIFIED &#124; INVALID &#124; EXPIRED &#124; TOO_MANY_ATTEMPTS"}` | `DEPENDENCY_UNAVAILABLE` (`503`) |
| `GET /api/v1/teams?pageSize=20&pageToken=...`                                 | Bearer JWT、`pageSize` 1 至 50                   | `200`，团队分页                                                   | `INVALID_PAGE_SIZE`、`INVALID_PAGE_TOKEN` (`400`)                                                              |
| `GET /api/v1/teams/{teamId}`                                                  | Bearer JWT                                       | `200`，团队 JSON                                                  | `RESOURCE_NOT_FOUND` (`404`)                                                                                   |
| `POST /api/v1/teams`                                                          | Bearer JWT、非空 `name`                          | `201`，团队 JSON 和 `Location`                                    | `REQUEST_VALIDATION_FAILED` (`400`)                                                                            |
| `GET /api/v1/teams/{teamId}/members`                                          | Bearer JWT、分页参数                             | `200`，成员关系列表                                               | `RESOURCE_NOT_FOUND` (`404`)，分页参数错误 (`400`)                                                             |
| `GET /api/v1/teams/{teamId}/members/{memberId}`                               | Bearer JWT                                       | `200`，成员关系 JSON                                              | `RESOURCE_NOT_FOUND` (`404`)                                                                                   |
| `POST /api/v1/teams/{teamId}/members`                                         | Bearer JWT、已有 `userId`、非空 `role`           | `201`，成员关系 JSON 和 `Location`                                | `REQUEST_VALIDATION_FAILED` (`400`)，`RESOURCE_NOT_FOUND` (`404`)，`MEMBER_CONFLICT` (`409`)                   |
| `DELETE /api/v1/teams/{teamId}/members/{memberId}`                            | Bearer JWT                                       | `204`，无 body                                                    | `RESOURCE_NOT_FOUND` (`404`)                                                                                   |
| `GET /api/v1/projects?pageSize=20&pageToken=...`                              | Bearer JWT、`pageSize` 1 至 50                   | `200`，body 只有 `items` 和 `nextPageToken`                       | `INVALID_PAGE_SIZE`、`INVALID_PAGE_TOKEN` (`400`)，`ACCESS_DENIED` (`403`)                                     |
| `GET /api/v1/projects/{projectId}`                                            | Bearer JWT                                       | `200`，项目 JSON                                                  | `RESOURCE_NOT_FOUND` (`404`)                                                                                   |
| `POST /api/v1/projects`                                                       | Bearer JWT、已有 `teamId`、非空 `name`           | `201`，项目 JSON 和 `Location`                                    | `REQUEST_VALIDATION_FAILED` (`400`)，`RESOURCE_NOT_FOUND` (`404`)                                              |
| `GET /api/v1/projects/{projectId}/tasks?pageSize=20&pageToken=...&status=...` | Bearer JWT、可选 `IN_PROGRESS` 或 `DONE`         | `200`，任务分页                                                   | 分页或状态错误 (`400`)，`RESOURCE_NOT_FOUND` (`404`)                                                           |
| `POST /api/v1/projects/{projectId}/tasks`                                     | Bearer JWT、`Idempotency-Key`、任务 JSON         | `201`，任务 JSON 和 `Location`                                    | `MISSING_REQUEST_HEADER` (`400`)，`IDEMPOTENCY_KEY_REUSED`、`TASK_CREATE_CONFLICT` (`409`)，`RESOURCE_NOT_FOUND` (`404`) |
| `GET /api/v1/projects/{projectId}/tasks/{taskId}`                             | Bearer JWT                                       | `200`，任务 JSON                                                  | `RESOURCE_NOT_FOUND` (`404`)                                                                                   |
| `PUT /api/v1/projects/{projectId}/tasks/{taskId}`                             | Bearer JWT、`{"version":0,"status":"DONE"}`      | `200`，版本递增的 `DONE` 任务                                     | `TASK_VERSION_CONFLICT` (`409`)，`INVALID_TASK_STATE` (`409`)                                                  |
| `DELETE /api/v1/projects/{projectId}/tasks/{taskId}`                          | Bearer JWT                                       | `204`，无 body                                                    | `RESOURCE_NOT_FOUND` (`404`)                                                                                   |
| `POST /api/v1/projects/{projectId}/tasks/{taskId}/attachments`                | Bearer JWT、`multipart/form-data` 的 `file` part | `201`，附件元数据和 `Location`                                    | `FILE_PART_MISSING`、`MULTIPART_INVALID`、`EMPTY_FILE`、`FILE_TOO_LARGE` (`400`)，`RESOURCE_NOT_FOUND` (`404`) |
| `GET /api/v1/projects/{projectId}/tasks/{taskId}/attachments/{attachmentId}`  | Bearer JWT                                       | `200`，原始字节和下载文件名                                       | `RESOURCE_NOT_FOUND` (`404`)                                                                                   |
| `GET /api/v1/projects/{projectId}/tasks/{taskId}/delivery`                    | Bearer JWT                                       | `200`，`eventId`、`outboxStatus`、`attempts`、`notificationCount` | `RESOURCE_NOT_FOUND` (`404`)                                                                                   |
| `GET /v3/api-docs`                                                            | 无                                               | `200`，OAS 3.0.1                                                  | 无                                                                                                             |
| `GET /actuator/health/liveness`                                               | 无                                               | 依赖无关的 `200`                                                  | 无                                                                                                             |
| `GET /actuator/health/readiness`                                              | 无                                               | MySQL、Redis、RabbitMQ 均可用时 `200`                             | 任一依赖不可用时 `503`                                                                                         |

用户 JSON 为 `id/displayName/email`，团队 JSON 为 `id/name`，成员关系 JSON 为
`id/userId/displayName/role`。任务 JSON 的字段为 `id`、`projectId`、`title`、`dueAt`、`assignee`、`status`、
`version`，项目 JSON 的字段为 `id/name`。分页 token 为不透明字符串；调用方不得自行计算或修改。

用户、团队、成员、项目和任务状态由 MySQL 与 Flyway 迁移维护；附件仍只保存应用进程内的请求字节快照，重启后
清空。单文件上限为 5 MiB，公开文件名只保留 basename 和可打印字符。

## JWT 合同

- 算法固定为 `HS256`；issuer 为 `https://api.teamflow.test`；audience 为 `teamflow-api`。
- 令牌必须包含 `iss`、`sub`、`aud`、`iat`、`exp`、`userId`、`roles` 和 `permissions`，有效期为 300 秒。
  `userId` 必须是含非 Unicode 空白字符的字符串；缺失或仅由 Unicode 空白字符组成时，即使签名、
  issuer 和 audience 均有效也必须返回 `401 AUTH_REQUIRED`。
- `roles` 映射为 `ROLE_*`，`permissions` 映射为动作 authority；所有声明只能由服务端根据已验证账号生成，不能从
  登录请求或业务请求直接透传。
- 签名密钥只从 `TEAMFLOW_JWT_SECRET` 注入，至少包含 32 个 UTF-8 字节，不得写入日志或响应。

本地交付反馈环固定使用以下账号：

| 用户名     | 密码                  | `userId` | 角色            | 动作权限                                        |
| ---------- | --------------------- | -------- | --------------- | ----------------------------------------------- |
| `demo`     | `Passw0rd!Pass`       | `USR-1`  | `USER`          | `project:read`、`task:read`、`task:write`       |
| `outsider` | `OutsiderPassw0rd!`    | `USR-2`  | `USER`          | `project:read`、`task:read`、`task:write`       |
| `admin`    | `AdminPassw0rd!`       | `USR-2`  | `USER`、`ADMIN` | `project:read`、`task:read`、`task:write`       |

## 权限矩阵

| 动作                           | 所需 authority                |
| ------------------------------ | ----------------------------- |
| 读取当前用户                   | `ROLE_USER`                   |
| 读取或修改用户、团队和成员关系 | `ROLE_USER`                   |
| 读取项目和项目任务             | `project:read` 或 `task:read` |
| 创建项目                       | `project:read`                |
| 创建、完成、删除任务或上传附件 | `task:write`                  |
| 下载附件                       | `task:read`                   |
| 未声明 API                     | 默认拒绝，`ACCESS_DENIED`     |

动作权限与资源归属必须同时通过：非管理员只能访问其团队成员关系覆盖的团队和项目，验证码只能由本人操作；
`ROLE_ADMIN` 可以绕过用户、团队和项目归属检查，但不会自动获得 `project:read`、`task:read` 或 `task:write`。团队列表
仍是全局目录，团队详情和成员变更受资源归属保护。项目列表只返回当前主体可访问的项目；管理员可以读取全部项目。

## MySQL 事实合同

MySQL 保存 `project`、`task`、`notification_outbox`、`notification_inbox` 和 `notification`。项目和任务由
主键及外键关联；同一项目内的任务标题唯一，通知的 `event_id` 唯一。重复任务标题返回稳定
`TASK_CREATE_CONFLICT`。完成任务必须在同一事务中执行乐观锁更新和 outbox 插入：更新影响行数为 0 时返回
`TASK_VERSION_CONFLICT`，不得插入事件。

## Redis 合同

- 项目列表代次键为 `teamflow:cache:project-list-generation:v1`；缺失只读为 `0` 且不创建 key。项目页缓存键为
  `teamflow:cache:project-list:v1:scope:<base64url-scope>:g<generation>:size:<pageSize>:token:<encoded-page-token>`；
  普通主体 scope 为 `member:<userId>`，管理员 scope 为 `admin:<userId>`，不得在不同主体或管理员/成员范围间共享缓存。
  值与分页公开响应同形，TTL 为 60 秒。项目创建事务成功返回后推进代次，旧代次 key 由 TTL 自然淘汰，不使用
  `KEYS` 扫描；写入任务或依赖故障不得伪造缓存事实。代次不是规范非负 `long`，或项目页 JSON、`items`、项目
  `id/name`、`nextPageToken` 不符合当前 schema 时返回 `500 CACHE_STATE_INVALID`，不得静默回源。
- 任务创建幂等键为 `teamflow:idempotency:v1:task-create:<scope-sha256>`。scope 同时包含 actor、project 和
  `Idempotency-Key`，只存 SHA-256，不暴露原始键。
- `SET NX` 首次占用状态为 `PENDING|<request-sha256>`，TTL 120 秒；完成态保存完整任务响应，TTL 24 小时。
- 请求摘要先对 `title`、`dueAt`、`assignee` 分别做 Base64URL 编码再哈希。相同摘要重放原响应并返回
  `Idempotency-Replayed: true`，不同摘要返回 `IDEMPOTENCY_KEY_REUSED`。
- `FAILED|<fingerprint>|<encoded-error-code>` 保存稳定业务失败；同指纹回放相同 `409` 并带
  `Idempotency-Replayed: true`。首次 `SET NX` 失败且状态缺失时只重试占用一次，第二次仍缺失返回
  `IDEMPOTENCY_STATE_MISSING`。未知异常或可能已提交失败保留 `PENDING`；保存 `COMPLETED` 失败返回 `503`。
- Redis 是可丢弃状态；项目、任务和消息事实不能只存在 Redis。Redis 不可用时 readiness 返回 `503`。
- 验证码 key 为 `teamflow:verification-code:v1:email-change:<userId>`，失败计数 key 为
  `teamflow:verification-attempts:v1:email-change:<userId>`；验证码使用 `SecureRandom` 生成的六位数字字符串，TTL 为
  300 秒，失败窗口 TTL 为 600 秒。重新签发覆盖 code 但使用 `SET NX` 保留已有失败计数；第五次错误返回
  `TOO_MANY_ATTEMPTS`。校验使用单条 Redis Lua 原子完成状态检查、比较、失败计数和成功删除；同一验证码的并发正确
  提交只能一个返回 `VERIFIED`，其余返回 `EXPIRED`。Redis 故障返回 `503`，不得回退内存状态。
- 任务详情 key 为 `teamflow:cache:task-detail:v1:<projectId>:<taskId>`，并以
  `teamflow:cache:task-detail-access:v1:scope:<base64url-scope>:<projectId>:<taskId>` 保存同 TTL 的主体授权标记，TTL 均为
  60 秒；任务列表 key 为
  `teamflow:cache:task-list:v1:scope:<base64url-scope>:<projectId>:g<generation>:<query-sha256>`，TTL 为 90 秒。
  scope 规则与项目列表一致，详情必须同时命中值与当前主体标记，列表不得跨主体共享。已授权主体的任务缓存命中时允许
  在 MySQL readiness 为 `DOWN` 时返回缓存；未命中仍须先验证项目归属再查询事实库。任务写事务提交后先删除详情 key，
  再推进列表代次；遗留的详情授权标记不能单独返回数据。首次真实任务 POST 只推进一次，幂等回放不推进。列表代次 key
  缺失时只读为 `0`；任务详情、任务列表或列表代次值无法按当前 schema 解析，或代次为负数、带前导零、超出 `long`
  范围时返回 `500 CACHE_STATE_INVALID`，不得静默回源或重置代次。
- 团队成员关系新增或删除时，必须先建立
  `teamflow:cache:membership-change-guard:v1` 全局护栏并失效旧缓存；护栏保存唯一 token，TTL 为 120 秒，长于
  最长 90 秒的授权缓存 TTL。事务提交后再次推进全局项目列表代次，并对该团队的每个项目推进任务列表代次、删除
  所有任务详情值，再按 token 释放护栏。提交后失效失败时保留护栏，项目页、任务列表和任务详情缓存读写必须返回
  `503 DEPENDENCY_UNAVAILABLE`，直到旧缓存自然过期；已撤销成员不得继续命中变更前的授权缓存。

## RabbitMQ 事件

任务完成事务写入一条 `TaskCompleted` outbox 事件。事件字段、exchange、queue、routing key、relay、publisher
confirm、inbox 唯一键和重复消费规则见 [`teamflow-event-contract.md`](./teamflow-event-contract.md)。relay 重试不得重新生成
`eventId`；重复投递最多创建一条通知副作用。

## 外部 HTTP 合同（C8 接入）

业务只依赖 `PartnerProjectClient`，不在业务代码散落 URL。现代版使用 `RestClient`，兼容版使用 `RestTemplate`，两版
请求和错误语义相同：

- `GET /projects/{id}` 以 `Accept: application/json` 查询项目；`200` 返回项目 JSON，`404` 映射本地项目不存在。
- `POST /projects` 以 `Content-Type: application/json` 发送 `{"name":"..."}`；`201` 返回项目 JSON。
- 连接超时 300 ms、响应读取超时 800 ms；网络失败、远端 `5xx` 和无法解析响应映射为 `PARTNER_UNAVAILABLE` (`503`)。
  外部 `POST` 不自动重试，避免重复创建；有限重试策略只能在 C8 适配层显式启用。

应用通过受保护的联调入口观察该适配层：`GET /api/v1/partner/projects/{projectId}` 为同步读取，
`GET /api/v1/partner/projects/{projectId}/async` 通过具名异步执行器读取，`POST /api/v1/partner/projects` 创建外部项目。
三条入口均要求 `project:read`；同步和异步入口对外部 `404` 返回 `404 RESOURCE_NOT_FOUND`，对外部 `5xx`、坏 JSON、
网络错误和超时返回 `503 PARTNER_UNAVAILABLE`，创建成功返回 `201`，且一次请求最多产生一次外部 POST。

## 运行时与日志合同

- `/actuator/health/liveness` 只反映进程存活；`readiness` 必须同时包含 `db`、`redis`、`rabbit`，依赖异常返回 `503`。
- 应用启用 graceful shutdown，停机阶段等待上限为 15 秒；停止依赖后先拒绝 readiness，再在恢复后重新接受流量。
- 结构化日志至少保留 `traceId`、请求路径、HTTP 状态、`eventId`、outbox `attempts` 和失败原因；不得输出密码、JWT
  密钥、Authorization 值或原始幂等键。
