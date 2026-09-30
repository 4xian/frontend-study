# TeamFlow 验收矩阵

两套后端必须使用相同的请求输入、外部合同和可观察结果；只有 Spring Boot、Spring Security、Servlet
命名空间和 JWT 签发适配属于版本差异。

| 场景           | 请求或输入                                                                                              | 预期结果                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 健康存活       | `GET /actuator/health/liveness`                                                                         | 依赖无关的 `200`                                                                                              |
| 健康就绪       | `GET /actuator/health/readiness`                                                                        | MySQL、Redis、RabbitMQ 均可用时 `200`，任一不可用时 `503`                                                     |
| 签发令牌       | `POST /api/v1/auth/token`，`demo / Passw0rd!Pass`                                                       | `200`，返回 `accessToken`、`tokenType=Bearer`、`expiresIn=300`                                                |
| 令牌声明       | 分别使用 `demo`、`outsider`、`admin` 登录并解析 JWT                                                    | 服务端写入稳定 `userId/roles/permissions`，三类账号声明与共享合同一致                                        |
| 无状态响应     | 检查令牌签发、成功请求、匿名拒绝和权限拒绝响应头                                                        | 均不包含 `Set-Cookie`                                                                                          |
| 受保护接口     | 无 Bearer 令牌访问 `/api/v1/me`                                                                         | `401` Problem Details，`code=AUTH_REQUIRED`                                                                   |
| JWT 校验失败   | 篡改 HS256 签名、使用错误 issuer/audience，或签名有效但缺少/仅含 Unicode 空白 `userId`                     | 均为 `401` Problem Details，`code=AUTH_REQUIRED`                                                              |
| OpenAPI        | `GET /v3/api-docs`                                                                                      | `200`、OAS 3.0.1，包含用户、团队、项目、任务和附件路径，创建/删除状态与运行时一致                             |
| CORS 预检      | 允许来源对 `/api/v1/users` 发起带 Authorization 的 GET 预检                                             | `200`，返回精确的 `Access-Control-Allow-Origin`                                                               |
| 用户分页与创建 | 查询首个用户，再创建合法邮箱用户                                                                        | 分页为 `200`，创建为 `201 + Location`                                                                         |
| 用户校验       | 创建空名称和非法邮箱用户                                                                                | `400`、`REQUEST_VALIDATION_FAILED`，`errors` 按 `displayName/email` 排序                                      |
| 验证码签发     | 合法 Bearer 令牌 POST `/api/v1/users/USR-1/email-change-verification-code`                              | `202` 无 body；code TTL 5 分钟、attempts TTL 10 分钟                                                          |
| 验证码校验     | 提交错误 code、正确 code、过期 code 和第五次错误                                                        | `INVALID` 不消费、`VERIFIED` 删除两个 key、`EXPIRED`、`TOO_MANY_ATTEMPTS`                                  |
| 验证码重签     | 失败窗口内再次签发                                                                                       | 替换 code 但 attempts 计数不清零                                                                             |
| 用户冲突       | 用不同大小写重复已创建邮箱                                                                              | `409`，`code=USER_CONFLICT`                                                                                   |
| 团队与成员     | 创建团队；向空团队添加、查询并移除成员                                                                  | 创建均为 `201 + Location`，查询 `200`，首次删除 `204`                                                         |
| 成员冲突       | 把同一用户重复加入同一团队                                                                              | `409`，`code=MEMBER_CONFLICT`                                                                                 |
| 项目分页       | 合法 Bearer 令牌访问 `/api/v1/projects?pageSize=1`                                                      | `200`，body 只有 `items` 和 `nextPageToken`                                                                   |
| 项目范围与缓存 | `demo`、无成员关系的 `outsider`、`admin` 分别读取项目列表                                               | 普通用户只见成员项目，管理员可见全部项目；Redis 项目页 key 按 `member/admin + userId` 隔离                   |
| 资源越权       | `outsider` 读取 `PRJ-1`，`admin` 读取同一项目                                                           | 非成员为 `403 ACCESS_DENIED`，管理员为 `200`                                                                  |
| 管理员动作权限 | 只含 `ROLE_ADMIN`、`project:read`、`task:read` 的令牌读取项目后创建任务                                 | 读取项目成功，创建任务仍为 `403 ACCESS_DENIED`                                                               |
| 项目详情与创建 | 查询 `PRJ-1`，再分别为 `TEAM-1`、`TEAM-EMPTY` 创建项目                                                  | 查询 `200`，两次创建均为 `201 + Location`                                                                     |
| 任务分页与删除 | 按 `IN_PROGRESS` 筛选任务；分别删除未完成任务和已产生通知的完成任务并再次查询                            | 分页 `200`，两类删除均为 `204`，再次查询 `404`，完成任务关联 outbox 与通知被清理                               |
| 任务缓存作用域 | `demo` 预热任务分页和详情，`outsider` 尝试复用，再停止 MySQL 由 `demo` 重读                              | Redis 列表 key 和详情授权标记按主体隔离；`outsider` 为 `403`，同主体缓存命中仍为 `200` 且响应不变              |
| 成员撤权缓存 | 先授权 `outsider` 并预热项目页、任务列表和详情，再删除该成员关系                                      | 项目页不再包含该团队项目，任务列表和详情均为 `403 ACCESS_DENIED`，不复用撤权前缓存         |
| 外部项目同步读取 | 合法令牌访问 `/api/v1/partner/projects/PARTNER-1`                                                     | `200`，返回外部项目；外部 `404` 映射为 `404 RESOURCE_NOT_FOUND`，`5xx`、坏 JSON 和超时映射为 `503 PARTNER_UNAVAILABLE` |
| 外部项目异步读取 | 合法令牌访问 `/api/v1/partner/projects/PARTNER-1/async`                                               | `200`，结果与同步读取一致；Future 异常映射为同一 `503 PARTNER_UNAVAILABLE`                             |
| 外部项目创建 | 合法令牌 POST `/api/v1/partner/projects`                                                                | `201`，发送 JSON 请求；非幂等 POST 不自动重试，临时 Partner 服务计数为 `1`                              |
| 附件边界       | 上传带路径文件名、下载、缺少 `file` part、损坏 multipart、上传空文件，以及超 5 MiB / 6 MiB 容器上限文件 | 文件名归一化且字节相同；失败分别返回 `FILE_PART_MISSING`、`MULTIPART_INVALID`、`EMPTY_FILE`、`FILE_TOO_LARGE` |
| 幂等首次创建   | 合法令牌、项目 `PRJ-1`、同一 `Idempotency-Key` 和请求体                                                 | `201`，创建一个 `IN_PROGRESS` 任务                                                                            |
| 幂等重放       | 重复上一个请求且请求体不变                                                                              | `201`，返回原任务并带 `Idempotency-Replayed: true`                                                            |
| 幂等冲突       | 重复 key 但请求体变化                                                                                   | `409`，`code=IDEMPOTENCY_KEY_REUSED`                                                                          |
| 幂等失败回放   | 首次业务稳定失败后重复同 key、同请求体                                                                  | 相同 `409` 错误码并带 `Idempotency-Replayed: true`，不重复业务副作用                                          |
| 幂等状态缺失   | `SET NX` 失败且两次读取均缺失                                                                             | `409`，`code=IDEMPOTENCY_STATE_MISSING`，最多占用重试一次                                                     |
| 完成任务       | `PUT /api/v1/projects/{projectId}/tasks/{taskId}`，版本匹配且 `status=DONE`                             | `200`，任务版本递增，并产生一条 `TaskCompleted` outbox 事件                                                   |
| 版本冲突       | 使用过期任务版本完成                                                                                    | `409`，`code=TASK_VERSION_CONFLICT`，任务事实不变                                                             |
| 通知重复消费   | 相同 `eventId` 投递两次                                                                                 | `notification_inbox` 一行，`notification` 只有一行                                                            |
| 未知路径       | 合法令牌访问未声明 API                                                                                  | `403` Problem Details，`code=ACCESS_DENIED`                                                                   |

每个请求还应检查 `Content-Type`、稳定错误字段 `type/title/status/detail/instance/code/traceId/errors` 和
不泄露密码、JWT 密钥及原始 Redis 幂等 key 的日志边界。
