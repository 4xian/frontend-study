---
id: backend.java.learn.advanced.teamflow-complete-delivery
type: lesson
title: "结课项目：TeamFlow 完整交付"
summary: 冻结 TeamFlow 的 API、数据、消息和安全合同，并用双版本交付门禁完成最终联调
domain: backend
technology: java
module: core
stage: advanced
level: advanced
estimatedMinutes: 240
prerequisites:
  - backend.java.learn.advanced.async-notification-pipeline
  - backend.java.learn.intermediate.testing-and-delivery-check
  - backend.java.learn.intermediate.containerized-deployment
  - backend.java.learn.intermediate.health-checks-and-graceful-shutdown
objectives:
  - 能在交付前冻结 TeamFlow 的资源、错误、认证、幂等和异步通知合同，避免联调时临时改协议。
  - 能把 MySQL、Redis、RabbitMQ 的职责和失败边界画成独立层，并为每层选择可验证的证据。
  - 能按源码构建、打包、镜像、健康检查和业务烟雾请求的顺序执行一次可停止的交付门禁。
  - 能让 JDK 25/Spring Boot 4.1.x 与 Java 8/Spring Boot 2.3.12.RELEASE 使用相同 API 和业务结果，只在依赖入口处保留必要分叉。
  - 能用真实 Vite + React 客户端验证 JWT 登录、分页读取、幂等创建和本地 CORS 边界。
  - 能根据门禁失败位置决定停止、修复或回滚，并用最终联调矩阵记录成功和失败路径。
recap:
  - 结课交付先冻结合同，再验证实现；联调阶段不通过临时改接口来掩盖失败。
  - MySQL 保存事实，Redis 保存可丢弃的加速状态，RabbitMQ 传递可重试的事件；三者不能互相冒充。
  - "`mvn -B clean verify` 只证明已配置的 Maven 生命周期成功，API 和依赖行为仍须由真实运行门禁证明。"
  - readiness 证明应用已能接流量，业务烟雾请求证明关键入口和配置仍然可用。
  - 现代线和兼容线各自拥有 target、镜像标签、端口和缓存目录，任何一条失败都不能污染另一条证据。
  - 交付 JWT 必须验证签名、签发者、受众和过期时间，角色与动作权限不能从请求参数读取。
  - 前端联调必须构建真实客户端，并把当前 profile 的 API 地址注入产物；接口脚本不能代替 CORS 和客户端契约。
  - 失败门禁保留日志和原始退出码，回滚只回到最近一个已验证快照，不删除数据库事实或通知历史。
  - 最终项目完成的标准是矩阵中的关键路径全部有证据，而不是一次本地启动成功。
related:
  - backend.java.learn.intermediate.testing-and-delivery-check
  - backend.java.learn.intermediate.containerized-deployment
  - backend.java.learn.advanced.async-notification-pipeline
  - backend.java.learn.advanced.reliable-consumption-and-idempotency
tags:
  - Java
  - Spring Boot
  - TeamFlow
  - 交付
  - 联调
  - MySQL
  - Redis
  - RabbitMQ
  - JWT
  - React
  - Vite
  - 健康检查
  - 双版本
appliesTo: JDK 25 / Spring Boot 4.1.1 主线；Java 8 / Spring Boot 2.3.12.RELEASE 兼容线；Maven 3.x；Docker Compose v2
verifiedAt: 2026-09-01
sources:
  - id: spring-boot-actuator-endpoints
    title: Actuator Endpoints
    url: https://docs.spring.io/spring-boot/reference/actuator/endpoints.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.x
    claims:
      - health、liveness 和 readiness 端点用于观察应用是否可运行以及是否应接收流量。
  - id: spring-boot-23-actuator-endpoints
    title: Spring Boot 2.3 Actuator endpoints
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/production-ready-features.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - 普通环境需要显式启用 health probes；Kubernetes 环境才会自动启用 liveness 和 readiness 组。
      - Boot 2.3 需要显式设置 server.shutdown=graceful 才启用优雅停机。
  - id: maven-build-lifecycle
    title: Introduction to the Build Lifecycle
    url: https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Apache Maven 3.x
    claims:
      - default 生命周期按顺序经过 compile、test、package 和 verify 等阶段。
  - id: spring-boot-41-graceful-shutdown
    title: Spring Boot 4.1.1 Graceful Shutdown
    url: https://docs.spring.io/spring-boot/4.1.1/reference/web/graceful-shutdown.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.1
    claims:
      - 优雅停机默认启用，spring.lifecycle.timeout-per-shutdown-phase 控制停机阶段的等待上限。
  - id: docker-compose-startup-order
    title: Control startup and shutdown order in Compose
    url: https://docs.docker.com/compose/how-tos/startup-order/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Docker Compose v2
    claims:
      - "`depends_on` 配合 `condition: service_healthy` 可以让应用等待依赖的健康检查通过。"
  - id: docker-image-inspect
    title: docker image inspect
    url: https://docs.docker.com/reference/cli/docker/image/inspect/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Docker Engine current CLI
    claims:
      - "`docker image inspect` 可以检查镜像 ID、入口、用户和端口声明。"
  - id: dockerfile-reference
    title: Dockerfile Reference
    url: https://docs.docker.com/reference/dockerfile/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Dockerfile current reference
    claims:
      - USER 决定运行时身份，EXPOSE 声明端口元数据，exec-form ENTRYPOINT 让 Java 进程直接接收停止信号。
  - id: rabbitmq-publisher-confirms
    title: Publisher Confirms
    url: https://www.rabbitmq.com/docs/confirms
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: RabbitMQ 4.x
    claims:
      - publisher confirm 只确认 Broker 已接受发布，不能代替消费者幂等或业务事务。
  - id: redis-expire-command
    title: EXPIRE command
    url: https://redis.io/docs/latest/commands/expire/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Redis 7.x
    claims:
      - "`EXPIRE` 为键设置秒级 TTL，键过期后缓存值不再是持久事实。"
  - id: spring-security-authorization
    title: Authorize HTTP Requests
    url: https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Security 7.x；授权语义同样适用于 5.3.x
    claims:
      - 请求授权规则按声明顺序匹配，具体规则应放在宽泛规则前，并用默认拒绝收口未知路径。
  - id: spring-security-resource-server-jwt
    title: OAuth 2.0 Resource Server JWT
    url: https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Security 7.x
    claims:
      - Resource Server 会验证 JWT 签名和时间声明，并可组合 issuer、audience 与自定义 claim 校验。
      - JWT claims 需要经过受控转换后才能成为角色和动作权限。
  - id: spring-security-cors
    title: CORS
    url: https://docs.spring.io/spring-security/reference/servlet/integrations/cors.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Security Servlet applications
    claims:
      - CORS 必须在 Spring Security 之前处理，CorsConfigurationSource 可集中声明允许的源、方法和请求头。
  - id: vite-env-and-mode
    title: Env Variables and Modes
    url: https://vite.dev/guide/env-and-mode
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Vite 7.x
    claims:
      - VITE_ 前缀变量通过 import.meta.env 暴露给客户端，并在构建时静态替换。
  - id: vite-production-build
    title: Building for Production
    url: https://vite.dev/guide/build
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Vite 7.x
    claims:
      - vite build 生成可部署的生产资源，适合作为前端交付门禁的构建证据。
  - id: rabbitmqadmin-ng
    title: rabbitmqadmin v2
    url: https://github.com/rabbitmq/rabbitmqadmin-ng
    sourceOrigin: official
    sourceType: project-source
    appliesTo: rabbitmqadmin 2.x
    claims:
      - rabbitmqadmin v2 使用 publish message 子命令和显式 exchange、routing-key、payload 选项发布测试消息。
  - id: rfc-9457-problem-details
    title: RFC 9457 - Problem Details for HTTP APIs
    url: https://www.rfc-editor.org/rfc/rfc9457
    sourceOrigin: official
    sourceType: specification
    appliesTo: HTTP Problem Details
    claims:
      - 错误响应使用 application/problem+json，并保留 type、title、status、detail 和 instance 标准成员。
  - id: twelve-factor-config
    title: The Twelve-Factor App - Config
    url: https://12factor.net/config
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: 通用 Web 服务交付
    claims:
      - 环境相关配置应与代码和镜像分离，烟雾测试可以用显式环境变量复核配置是否真的生效。
---

# 结课项目：TeamFlow 完整交付

TeamFlow 的功能已经分散在 API、MySQL、Redis、RabbitMQ、安全和运行课程中。结课不是把这些目录压成一个压缩包，而是证明它们在同一份合同下仍能协作：客户端知道请求和错误长什么样，数据库知道哪些事实必须落盘，缓存失效不会改变事实，消息重复不会重复副作用，容器启动后也确实能接收业务请求。

本课把一次交付限制为两个独立快照：`teamflow-modern` 使用 JDK 25 与 Spring Boot 4.1.1，`teamflow-legacy` 使用 Java 8 与 Spring Boot 2.3.12.RELEASE。两条线的 URL、字段、状态迁移和验收结果必须一致；不同的 Maven 插件或 Spring 配置入口单独标出，不用“在本机能启动”代替交付证据。

## 一、先冻结 TeamFlow 的外部合同

### 1. 用资源表阻止联调漂移

| 资源 | 方法与路径 | 成功结果 | 关键失败结果 |
| --- | --- | --- | --- |
| 签发令牌 | `POST /api/v1/auth/token` | `200`，返回短期 access token | `401`，凭据错误 |
| 当前用户 | `GET /api/v1/me` | `200`，返回用户摘要 | `401`，缺少有效认证 |
| 用户目录 | `GET /api/v1/users?pageSize=20` | `200`，返回用户分页 | `400`，页大小或 token 非法 |
| 团队目录 | `GET /api/v1/teams?pageSize=20` | `200`，返回团队分页 | `400`，页大小或 token 非法 |
| 项目列表 | `GET /api/v1/projects?pageSize=20&pageToken=...` | `200`，返回 `items` 与 `nextPageToken` | `400`，页大小或 token 非法 |
| 项目任务 | `GET /api/v1/projects/{projectId}/tasks?pageSize=20` | `200`，返回任务分页 | `400`，筛选或分页参数非法 |
| 创建任务 | `POST /api/v1/projects/{projectId}/tasks` | `201`，返回任务和 `Location` | `409`，幂等键冲突 |
| 完成任务 | `PUT /api/v1/projects/{projectId}/tasks/{taskId}` | `200`，返回 `DONE` 任务 | `409`，版本或状态冲突 |
| 交付状态 | `GET /api/v1/projects/{projectId}/tasks/{taskId}/delivery` | `200`，返回 outbox 与通知状态 | `404`，任务不存在 |
| 就绪探针 | `GET /actuator/health/readiness` | `200`，状态为 `UP` | `503`，暂时拒绝流量 |

所有错误都沿用前置课程的 Problem Details 契约：`type`、`title`、`status`、`detail` 和 `instance`
是 RFC 9457 成员，`code`、`traceId` 和 `errors` 是 TeamFlow 扩展。响应媒体类型为
`application/problem+json`，实际 HTTP 状态必须与 body 的 `status` 一致。`401`、`403`、`404`、
`409` 和 `503` 不是随意挑选的状态码；客户端会按它们决定重试、重新认证或展示冲突。

### 2. 把不变规则写成一页合同

两套版本工程共同使用 Demo 根目录下的 `contracts/teamflow-api-contract.md`，只允许版本入口不同。至少冻结以下规则：

- 登录响应固定为 `accessToken`、`tokenType` 和 `expiresIn`。access token 是 HS256 JWT，Resource Server 必须验证签名、`iss`、`aud`、`exp`，再把 `roles` 映射为 `ROLE_*`、把 `permissions` 映射为动作 authority；过期 token 返回 `401`，权限不足返回 `403`。
- 项目分页继续使用前置项目已经冻结的 `pageSize`、`pageToken` 请求和 `items`、`nextPageToken` 响应，缓存命中不能增加 `cacheHit` 等仅供调试的公开字段，也不能静默夹取非法页大小。
- 创建任务的 `Idempotency-Key` 在同一用户和项目下只能绑定一个规范化请求摘要；相同摘要重放完整原响应，不同摘要返回 `409`。摘要先对每个字段做 Base64URL 编码再哈希，不能用可能碰撞的裸分隔符拼接。
- 任务更新为 `DONE` 时先写 MySQL 事实和 outbox，再异步发布通知；HTTP 成功只证明本地事务已提交，
  不承诺邮件已经送达。
- Redis 保存可丢弃的项目分页缓存和带 TTL 的幂等状态；项目、任务、outbox、inbox 与通知事实仍由 MySQL 保存。
- `eventId` 在 relay 重试中不变，通知记录最多产生一次业务副作用；`correlationId` 只做链路关联。

### 3. 外部 HTTP 与异步联调边界

结课项目把外部项目目录作为可观察的适配层：现代版在 `integration/PartnerProjectClient` 使用
`RestClient`，兼容版使用 `RestTemplate`，两版固定连接和读取超时，并把外部 `404` 映射为
`404 RESOURCE_NOT_FOUND`，把 `5xx`、坏 JSON、网络错误和超时映射为 `503 PARTNER_UNAVAILABLE`。非幂等的外部
`POST` 不自动重试，避免一次门禁请求创建多个项目。

`AsyncPartnerProjectService` 使用具名 `teamflowTaskExecutor` 返回 `CompletableFuture`；控制器等待并观察 Future
的成功或异常结果，因此同步和异步入口共享同一份错误合同。对应联调入口为：

- `GET /api/v1/partner/projects/{projectId}`
- `GET /api/v1/partner/projects/{projectId}/async`
- `POST /api/v1/partner/projects`

这些入口只证明适配层的可观察行为，不声称外部系统与 TeamFlow 共享事务；外部调用成功也不等于外部系统与
TeamFlow 共享本地事务。

冻结合同后才能让前端联调。当前 `teamflow-frontend` 提供真实的 Vite + React 联调界面：获取 JWT 后可读取
当前用户、用户和团队目录，刷新项目与任务列表，创建任务，按乐观版本完成任务，并查看 outbox、发布尝试和通知
计数。界面始终使用当前 profile 的 API 地址和同一份错误/状态合同；发现字段缺失时，先回到合同和版本化变更记录，
不在某一条烟雾请求里临时兼容一个拼写。

## 二、为三种基础设施划清事实边界

### 1. MySQL 保存不可替代的事实

TeamFlow 的项目、任务、outbox、inbox 和通知记录属于 MySQL。一次完成任务的本地事务至少包含：

```sql
UPDATE task
SET status = 'DONE', version = version + 1, updated_at = CURRENT_TIMESTAMP
WHERE id = ? AND status = 'IN_PROGRESS' AND version = ?;

INSERT INTO notification_outbox
    (event_id, aggregate_id, event_type, payload, status, attempts)
VALUES (?, ?, 'TaskCompleted', ?, 'NEW', 0);
```

第一条更新影响行数为 0 时，服务返回明确的冲突，不插入第二条事件。两条语句必须在同一事务中提交；数据库失败时两者一起回滚，不能留下“任务已完成但没有通知意图”的空洞。

### 2. Redis 只提供可重建的加速状态

项目分页缓存键同时编码页大小和不透明 page token，例如 `teamflow:cache:project-list:v1:size:1:token:~`。缓存值与公开响应同形，只包含 `items` 和 `nextPageToken`；60 秒 TTL 到期后重新从 MySQL 计算。任务创建使用 `SET NX` 原子取得首次执行权，处理中状态保留 2 分钟，完成响应保留 24 小时：

```text
SET teamflow:idempotency:v1:task-create:<scope-sha256> PENDING|<request-sha256> NX EX 120
```

完成态存储完整任务响应，因此重放不依赖再次查询或重新执行业务逻辑。Redis 不可用时，readiness 返回 `503` 并让门禁停止新流量；本快照不伪装成“项目不存在”，也不声称实现了透明降级。删除项目缓存后可以从 MySQL 重建，但删除幂等状态会失去重放窗口，因此两类键虽然都有 TTL，职责并不相同。

### 3. RabbitMQ 传递事件，不保存业务真相

relay 从 outbox 领取 `NEW` 或到期的 `RETRY_WAIT` 行，在事务外发布携带原始 `eventId` 的消息。publisher confirm 表示 Broker 接受了消息，之后才把 outbox 标记为 `PUBLISHED`；进程在这两个动作之间崩溃时，重复发布是允许的。消费者在本地事务中先插入唯一 inbox 记录，再写通知记录；重复键只确认消息，不再次产生副作用。

这三个边界可以画成一条反馈链：

```text
HTTP 请求 -> MySQL 事务 -> outbox -> relay -> RabbitMQ confirm
                                      -> consumer -> inbox + notification
查询请求 -> Redis 命中/失效 -> MySQL 回源
```

链路中没有“跨三种系统的一个大事务”。每个边界只承诺自己能够证明的事情，故障时由状态、重试预算和人工补偿继续推进。

## 三、把交付拆成可停止的五道门

### 1. 先执行源码构建门

每条版本线从自己的目录执行同一条命令：

```bash
mvn -B clean verify
```

`verify` 会执行当前 POM 已配置的完整 default 生命周期，但不会凭空创建测试。这个结课快照按仓库约束不保留
测试源码，所以该命令只证明两条线可以在各自 JDK 上完成清理、编译、打包和 Boot JAR 重打包，不能把退出码
为 0 描述成 API、缓存或消息行为已经覆盖。

业务证据由同一门禁后续启动真实 MySQL、Redis 和 RabbitMQ 后取得。脚本直接断言统一错误、未知路径默认
拒绝、任务版本冲突、幂等键重放、outbox 发布、相同 `eventId` 重投、readiness 降级与恢复；因此构建成功后
仍必须继续执行 JAR、镜像、运行时和故障注入检查。

### 2. 再确认唯一交付 JAR

构建成功后，在对应 target 目录检查：

```bash
find target -maxdepth 1 -type f -name '*.jar' ! -name '*.jar.original' -print
jar tf target/teamflow-modern.jar | sed -n '1,12p'
manifest_dir=$(mktemp -d)
app_jar_path="$PWD/target/teamflow-modern.jar"
(cd "$manifest_dir" && jar xf "$app_jar_path" META-INF/MANIFEST.MF)
sed -n '1,20p' "$manifest_dir/META-INF/MANIFEST.MF"
rm -r "$manifest_dir"
```

主 JAR 的 Manifest 必须包含 Spring Boot 启动入口，归档中应有 `BOOT-INF/classes` 和
`BOOT-INF/lib`。Boot 4.1.1 的 Main-Class 是
`org.springframework.boot.loader.launch.JarLauncher`，Boot 2.3.12 的 Main-Class 是
`org.springframework.boot.loader.JarLauncher`。若同时出现 `.jar.original`，它只是对照产物，不得被
Dockerfile 误复制为最终 JAR。两个版本的文件名、target 目录和 Maven 缓存必须明确分开。

### 3. 镜像检查不能跳过

从各自成功的 JAR 构建带版本标签的镜像：

```bash
docker build -t teamflow:modern ./teamflow-modern
docker image inspect teamflow:modern \
  --format 'id={{.Id}} user={{.Config.User}} entry={{json .Config.Entrypoint}} ports={{json .Config.ExposedPorts}} health={{json .Config.Healthcheck}}'
```

检查结果应能回答五个问题：入口是否以 exec form 指向主 JAR、用户是否为非 root、是否声明
`8080/tcp`、HEALTHCHECK 是否请求 readiness、镜像 ID 是否来自本次构建。兼容线使用
`teamflow:legacy`，不能复用现代标签或同一个可变容器名。

### 4. 启动依赖并观察 readiness

Compose 只负责本地联调依赖，不改变应用合同。应用服务等待 MySQL、Redis 和 RabbitMQ 的健康检查：

```yaml
services:
  mysql:
    image: mysql:8.4
    environment:
      MYSQL_DATABASE: teamflow
      MYSQL_USER: teamflow
      MYSQL_PASSWORD: local-teamflow-pass
      MYSQL_ROOT_PASSWORD: local-root-pass
    healthcheck:
      test: ["CMD-SHELL", "mysqladmin ping -h localhost -uroot -p$${MYSQL_ROOT_PASSWORD}"]
      interval: 5s
      timeout: 3s
      retries: 20
  redis:
    image: redis:8-alpine
    command: ["redis-server", "--requirepass", "local-redis-pass"]
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "local-redis-pass", "--no-auth-warning", "PING"]
      interval: 5s
      timeout: 3s
      retries: 20
  rabbitmq:
    image: rabbitmq:4-management-alpine
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "-q", "ping"]
      interval: 5s
      timeout: 5s
      retries: 20
  teamflow:
    image: ${TEAMFLOW_IMAGE}
    ports:
      - "${TEAMFLOW_PORT}:8080"
    environment:
      TEAMFLOW_DB_URL: jdbc:mysql://mysql:3306/teamflow
      TEAMFLOW_DB_USER: teamflow
      TEAMFLOW_DB_PASSWORD: local-teamflow-pass
      TEAMFLOW_REDIS_HOST: redis
      TEAMFLOW_REDIS_PASSWORD: local-redis-pass
      SPRING_RABBITMQ_HOST: rabbitmq
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
```

**社区补充：** Twelve-Factor 的配置建议适用于同一镜像在不同环境运行的场景。本课只采纳“环境配置与
代码、镜像分离”这一边界；示例值仅用于本机一次性联调，真实密码由环境或秘密管理系统注入。启动后先请求
`/actuator/health/readiness`。`200` 才允许进入业务烟雾请求；`503` 表示应用主动拒绝流量，应保留依赖
日志并停止门禁。两条基线都必须暴露相同的 Actuator readiness 路径；不能把容器处于 running 当作
readiness 证据。

### 5. 最后执行业务烟雾请求

最小烟雾脚本依次检查匿名访问、真实 JWT、过期 token、权限不足、分页合同、缓存失效、幂等创建、
分隔符碰撞、乐观锁冲突、任务完成、outbox 发布、相同消息重投和未知路径。每一步都检查 HTTP 状态和稳定字段；只要一步失败，脚本立即停止并
返回非零状态。重复消息通过 RabbitMQ 管理 CLI 向原交换机重投真实 `eventId|taskId`，再从既有交付状态
接口确认通知副作用仍为 1，不新增只为测试服务的业务路径。

```bash
#!/usr/bin/env bash
set -euo pipefail

base_url="$1"
report_dir="$2"
compose_project="$3"
compose_file="$4"
tmp_dir="$report_dir/tmp"
jwt_secret='local-teamflow-delivery-secret-key-2026'

mkdir -p "$tmp_dir"

cleanup() {
  local exit_code="$?"
  if test -f "$tmp_dir/token.json"; then
    rm "$tmp_dir/token.json"
  fi
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
  curl --silent --show-error --output "$output" --write-out '%{http_code}' "$@"
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

status=$(http_status "$tmp_dir/anonymous.json" "$base_url/api/v1/projects")
test "$status" = 401

status=$(http_status "$tmp_dir/bad-credentials.json" \
  -H 'Content-Type: application/json' \
  -d '{"username":"demo","password":"wrong"}' \
  "$base_url/api/v1/auth/token")
test "$status" = 401

status=$(http_status "$tmp_dir/token.json" \
  -H 'Content-Type: application/json' \
  -d '{"username":"demo","password":"Passw0rd!Pass"}' \
  "$base_url/api/v1/auth/token")
test "$status" = 200
token=$(jq -r '.accessToken' "$tmp_dir/token.json")
test "$(printf '%s' "$token" | awk -F. '{print NF}')" = 3
test "$(jq -r '.tokenType' "$tmp_dir/token.json")" = Bearer
test "$(jq -r '.expiresIn' "$tmp_dir/token.json")" = 300

status=$(http_status "$tmp_dir/me.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/me")
test "$status" = 200
jq -e '.username == "demo" and (.authorities | index("ROLE_USER")) != null' \
  "$tmp_dir/me.json" >/dev/null

expired_token=$(signed_token \
  '{"iss":"https://api.teamflow.test","sub":"demo","aud":"teamflow-api","iat":1,"exp":2,"roles":["USER"],"permissions":["project:read"]}')
status=$(http_status "$tmp_dir/expired.json" \
  -H "Authorization: Bearer $expired_token" \
  "$base_url/api/v1/projects")
test "$status" = 401

future_exp=$(( $(date +%s) + 300 ))
limited_token=$(signed_token \
  "{\"iss\":\"https://api.teamflow.test\",\"sub\":\"demo\",\"aud\":\"teamflow-api\",\"iat\":1,\"exp\":$future_exp,\"roles\":[\"USER\"],\"permissions\":[\"task:read\"]}")
status=$(http_status "$tmp_dir/forbidden-projects.json" \
  -H "Authorization: Bearer $limited_token" \
  "$base_url/api/v1/projects")
test "$status" = 403

compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning FLUSHDB >/dev/null
status=$(http_status "$tmp_dir/projects.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects?pageSize=1")
test "$status" = 200
jq -e 'keys | sort == ["items", "nextPageToken"]' "$tmp_dir/projects.json" >/dev/null
test "$(jq -r '.items[0].id' "$tmp_dir/projects.json")" = PRJ-1
test "$(jq -r '.nextPageToken' "$tmp_dir/projects.json")" = PROJECT-PAGE-2

status=$(http_status "$tmp_dir/projects-second-page.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects?pageSize=1&pageToken=PROJECT-PAGE-2")
test "$status" = 200
test "$(jq -r '.items[0].id' "$tmp_dir/projects-second-page.json")" = PRJ-2
test "$(jq -r '.nextPageToken' "$tmp_dir/projects-second-page.json")" = null

status=$(http_status "$tmp_dir/invalid-page-size.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects?pageSize=0")
test "$status" = 400
test "$(jq -r '.code' "$tmp_dir/invalid-page-size.json")" = INVALID_PAGE_SIZE

cache_key=$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning \
  --scan --pattern 'teamflow:cache:project-list:v1:size:1:token:~')
test -n "$cache_key"
cache_ttl=$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning PTTL "$cache_key")
test "$cache_ttl" -gt 0

compose stop mysql >/dev/null
wait_readiness 503 "$report_dir/readiness-mysql-cache-hit.json"
status=$(http_status "$tmp_dir/projects-cache-hit.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects?pageSize=1")
test "$status" = 200
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
test "$(jq -S . "$tmp_dir/projects.json")" = "$(jq -S . "$tmp_dir/projects-cache-expired.json")"

status=$(http_status "$tmp_dir/create.json" \
  --dump-header "$tmp_dir/create.headers" \
  -H "Authorization: Bearer $token" \
  -H 'Idempotency-Key: delivery-create-1' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Ship TeamFlow","dueAt":"2026-09-01T18:00:00+08:00","assignee":"demo"}' \
  "$base_url/api/v1/projects/PRJ-1/tasks")
test "$status" = 201
task_id=$(jq -r '.id' "$tmp_dir/create.json")

status=$(http_status "$tmp_dir/replay.json" \
  --dump-header "$tmp_dir/replay.headers" \
  -H "Authorization: Bearer $token" \
  -H 'Idempotency-Key: delivery-create-1' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Ship TeamFlow","dueAt":"2026-09-01T18:00:00+08:00","assignee":"demo"}' \
  "$base_url/api/v1/projects/PRJ-1/tasks")
test "$status" = 201
test "$(jq -S . "$tmp_dir/create.json")" = "$(jq -S . "$tmp_dir/replay.json")"
grep -Eiq '^Idempotency-Replayed: true' "$tmp_dir/replay.headers"

idempotency_key=$(compose exec -T redis redis-cli -a local-redis-pass --no-auth-warning \
  --scan --pattern 'teamflow:idempotency:v1:task-create:*' | head -1)
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
test "$(jq -r '.code' "$tmp_dir/conflict.json")" = IDEMPOTENCY_KEY_REUSED

status=$(http_status "$tmp_dir/delimiter-first.json" \
  -H "Authorization: Bearer $token" \
  -H 'Idempotency-Key: delimiter-collision-check' \
  -H 'Content-Type: application/json' \
  -d '{"title":"a|b","dueAt":"c","assignee":"d"}' \
  "$base_url/api/v1/projects/PRJ-1/tasks")
test "$status" = 201
status=$(http_status "$tmp_dir/delimiter-conflict.json" \
  -H "Authorization: Bearer $token" \
  -H 'Idempotency-Key: delimiter-collision-check' \
  -H 'Content-Type: application/json' \
  -d '{"title":"a","dueAt":"b|c","assignee":"d"}' \
  "$base_url/api/v1/projects/PRJ-1/tasks")
test "$status" = 409
test "$(jq -r '.code' "$tmp_dir/delimiter-conflict.json")" = IDEMPOTENCY_KEY_REUSED

status=$(http_status "$tmp_dir/forbidden-create.json" \
  -H "Authorization: Bearer $limited_token" \
  -H 'Idempotency-Key: forbidden-create' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Forbidden","dueAt":"2026-09-01T18:00:00+08:00","assignee":"demo"}' \
  "$base_url/api/v1/projects/PRJ-1/tasks")
test "$status" = 403

status=$(http_status "$tmp_dir/version-conflict.json" \
  -H "Authorization: Bearer $token" \
  -H 'Content-Type: application/json' \
  -X PUT \
  -d '{"version":9,"status":"DONE"}' \
  "$base_url/api/v1/projects/PRJ-1/tasks/$task_id")
test "$status" = 409
test "$(jq -r '.code' "$tmp_dir/version-conflict.json")" = TASK_VERSION_CONFLICT

status=$(http_status "$tmp_dir/unchanged.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects/PRJ-1/tasks/$task_id")
test "$status" = 200
test "$(jq -r '.status' "$tmp_dir/unchanged.json")" = IN_PROGRESS
test "$(jq -r '.version' "$tmp_dir/unchanged.json")" = 0

status=$(http_status "$tmp_dir/no-delivery-after-conflict.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/projects/PRJ-1/tasks/$task_id/delivery")
test "$status" = 404

status=$(http_status "$tmp_dir/completed.json" \
  -H "Authorization: Bearer $token" \
  -H 'Content-Type: application/json' \
  -X PUT \
  -d '{"version":0,"status":"DONE"}' \
  "$base_url/api/v1/projects/PRJ-1/tasks/$task_id")
test "$status" = 200
test "$(jq -r '.status' "$tmp_dir/completed.json")" = DONE

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

event_id=$(jq -r '.eventId' "$tmp_dir/delivery.json")
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
test "$(jq -r '.eventId' "$tmp_dir/duplicate-delivery.json")" = "$event_id"
test "$(jq -r '.notificationCount' "$tmp_dir/duplicate-delivery.json")" = 1

status=$(http_status "$tmp_dir/unknown.json" \
  -H "Authorization: Bearer $token" \
  "$base_url/api/v1/unknown")
test "$status" = 403

cp "$tmp_dir/create.json" "$report_dir/create.json"
cp "$tmp_dir/conflict.json" "$report_dir/conflict.json"
cp "$tmp_dir/duplicate-delivery.json" "$report_dir/duplicate-delivery.json"
printf 'anonymous=401 token=jwt cache=miss-hit-expired pagination=stable create=201 replay=201 conflict=409 delimiter=409 rollback=409 notification=1 duplicate=1 permission=403 expired=401 unknown=403 task=%s event=%s\n' \
  "$task_id" "$event_id"
```

脚本把最终可留存响应与临时 token 分开；EXIT trap 总会删除 `token.json`，成功时再删除整个 `tmp` 子目录，失败时只保留不含 token 的诊断响应。真实流水线应
把数据库密码、JWT 密钥和镜像仓库凭据作为受控环境变量注入，不把秘密写进镜像或报告。

## 四、让两条版本线保持同一行为

### 1. 现代线只使用现代入口

`teamflow-modern` 的 POM 以 `java.version` 为 `25`，使用 Spring Boot 4.1.1 的 `SecurityFilterChain`、`authorizeHttpRequests`、Resource Server JWT 和 Jackson 3 包名。Actuator 的 readiness、优雅停机和自定义执行器配置按 Boot 4.1 文档设置；不要为了展示新 API 而改动响应字段。

```xml
<properties>
  <java.version>25</java.version>
  <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
</properties>
```

### 2. 兼容线只替换确有差异的入口

`teamflow-legacy` 的 POM 以 Java 8 编译，保持相同 DTO 字段和 URL。需要旧 Spring Security 配置时才使用 `WebSecurityConfigurerAdapter`、`authorizeRequests` 和 `antMatchers`；业务服务、SQL、事件字段和烟雾矩阵不复制成另一套规则。旧线不启用 Java 25 专属 API，也不把 Boot 4 的属性名直接粘贴进旧配置。Boot 2.3 普通环境要显式设置 `management.endpoint.health.probes.enabled=true` 和 `server.shutdown=graceful`，现代线则使用 Boot 4.1 的默认 health groups 与默认优雅停机；不要把 `/livez` 或 `/readyz` 的额外路径当成两条线都自动存在。

两条线的交付目录示意：

```text
delivery/
  modern/target/                  # JDK 25 编译输出
  legacy/target/                  # Java 8 编译输出
  images/teamflow-modern.tar
  images/teamflow-legacy.tar
  reports/modern/
  reports/legacy/
```

运行同一矩阵时，现代线和兼容线使用不同端口（例如 `18080` 和 `18081`）、容器名和 Compose 项目名。不能先启动现代容器，再把旧线的请求发到现代端口后声称兼容线通过。

### 3. 用真实前端完成跨域联调

`teamflow-frontend` 是独立的 Vite + React + TypeScript 客户端，不是 Markdown 中的静态伪界面。它真实调用登录、项目分页和幂等任务创建接口；后端只允许 `localhost:5173` 与 `127.0.0.1:5173`，并只开放联调需要的请求方法和请求头。浏览器发出的 Bearer token、`Content-Type` 和 `Idempotency-Key` 都必须经过同一套 CORS 与安全过滤链。

```bash
npm ci
VITE_TEAMFLOW_API_BASE_URL=http://127.0.0.1:18080 npm run build
```

`VITE_TEAMFLOW_API_BASE_URL` 会在构建时写入前端资源。门禁对每个 profile 都把前端复制到临时目录，以当前端口构建，并检查地址确实出现在产物中；成功后删除 `node_modules` 和 `dist`，不把生成物留在课程目录。生产部署仍应通过受控配置或同源反向代理管理 API 地址，不能把真实秘密放进 `VITE_*` 变量，因为它们会暴露给客户端。

## 五、失败时停止、回滚和保留事实

### 1. 用失败位置决定动作

| 失败位置 | 立即动作 | 不应做的事 |
| --- | --- | --- |
| Maven 构建 | 停止，不构建镜像；保留 Maven 日志 | 跳过失败阶段或复用旧 JAR |
| JAR Manifest | 停止，回到 packaging 配置 | 复制任意一个能启动的旧 JAR |
| 镜像 inspect | 停止，修复入口、用户或端口 | 只看镜像大小判断正确 |
| readiness | 停止业务请求，检查依赖和配置 | 用 `sleep 30` 把 503 变成成功 |
| 业务烟雾请求 | 停止发布，保存请求与响应 | 重试到成功后丢弃第一次失败 |
| 通知为 `DEAD` | 保留 eventId 和错误，走人工补偿 | 直接删除 outbox/inbox 记录 |

### 2. 回滚到最后一个可验证快照

回滚对象是应用镜像和配置版本，不是数据库历史。先停止新容器，再启动最近一次已通过完整矩阵的镜像；数据库迁移必须向后兼容，不能在回滚时删除已提交的任务、幂等记录或通知历史。恢复后重新跑 readiness 和一条只读业务请求，确认回滚本身没有制造新的故障。

### 3. 用可观察状态收口异步链路

交付报告至少记录以下低基数字段：`requestId`、`eventId`、outbox 状态、attempts、通知状态、队列积压、readiness 状态和镜像 ID。日志中的成功行不能替代这些状态；如果消息确认成功但通知仍是 `PENDING`，报告应明确这是消费者尚未完成，而不是“发送失败”。

## 六、集中排查六个交付错误

:::pitfalls
### 还没有通过源码构建就构建镜像

**触发条件：** 还没有从干净目录执行 `mvn -B clean verify`，就直接执行 `docker build`，把镜像构建成功当成应用交付成功。

**原因：** 镜像只证明 Dockerfile 能复制某个 JAR，不能证明该 JAR 来自本次源码，也不能证明运行时、幂等和安全合同已经通过。

**后果：** 旧 JAR 或不能重新构建的源码可能进入烟雾阶段，失败位置被推迟且难以定位。

**错误示例：**

```bash
docker build -t teamflow:modern ./teamflow-modern
mvn -B clean verify
```

**正确写法：**

```bash
mvn -B clean verify
docker build -t teamflow:modern ./teamflow-modern
```

**验证方式：** 在 `/tmp` 源码副本中制造一个编译错误，确认脚本退出且没有执行 `docker build`；修复副本后再按相同顺序运行。影响版本：Maven 3.x、Docker Compose v2，两条 Java 版本线都适用。

### 只用 depends_on 排顺序，不等待健康状态

**触发条件：** Compose 文件声明了 `depends_on`，但没有健康检查和 `service_healthy` 条件。

**原因：** 容器启动顺序不等于 MySQL、Redis 或 RabbitMQ 已经可以接受连接。

**后果：** 应用在依赖尚未就绪时启动失败，或把首次连接错误误报为业务数据不存在。

**错误示例：**

```yaml
depends_on:
  - mysql
  - redis
```

**正确写法：**

```yaml
depends_on:
  mysql:
    condition: service_healthy
```

**验证方式：** 将 MySQL 健康检查延迟，观察应用在健康状态前不应收到业务烟雾请求；健康后再检查 readiness。影响版本：Docker Compose v2。

### 把 Redis 当成任务状态的唯一来源

**触发条件：** 完成任务后只写 Redis，不写 MySQL，或者 Redis miss 时直接返回“任务不存在”。

**原因：** Redis 的 TTL 和故障模型只适合可重建缓存，不能承担不可替代的业务事实。

**后果：** 键过期或实例重启会丢失任务，客户端看到与真实业务不一致的结果。

**错误示例：**

```java
String status = redis.get("task:" + taskId);
if (status == null) {
    throw new TaskNotFoundException(taskId);
}
```

**正确写法：**

```java
String status = redis.get("task:" + taskId);
if (status == null) {
    status = taskRepository.findStatus(taskId);
    redis.setex("task:" + taskId, 60, status);
}
```

**验证方式：** 删除任务缓存后重新查询，断言返回值仍来自 MySQL 并重建缓存；再让 Redis 不可用，确认日志标记降级而不是伪造 `404`。影响版本：Redis 7.x、Java 8 与 JDK 25。

### 把 publisher confirm 当成通知已经送达

**触发条件：** RabbitMQ 返回 confirm 后，接口立即把通知状态写成 `SENT`，没有等待消费者写入通知记录。

**原因：** confirm 只说明 Broker 接受发布，消费者可能尚未执行、可能重试，也可能因为幂等记录而跳过副作用。

**后果：** 查询接口报告“已发送”，但用户通知仍是 `PENDING` 或 `DEAD`。

**错误示例：**

```java
publisher.confirm(event);
notificationRepository.markSent(event.eventId());
```

**正确写法：**

```java
publisher.confirm(event);
outboxRepository.markPublished(event.eventId());
// consumer 成功写入 inbox 与 notification 后，才更新通知状态
```

**验证方式：** 让消费者暂停 10 秒，确认 confirm 后 outbox 为 `PUBLISHED`、通知仍为 `PENDING`；恢复消费者后再观察最终状态。影响版本：RabbitMQ 4.x。

### 两条版本线共用 target 或镜像标签

**触发条件：** 现代线和兼容线都写入同一个 `target` 目录，或者先后都使用 `teamflow:latest`。

**原因：** 后一次编译或构建会覆盖前一次产物，日志无法证明实际运行的 Java 和 Spring Boot 版本。

**后果：** Java 8 可能运行了 JDK 25 编译的 class，或者兼容线的 smoke 请求实际打到了现代容器。

**错误示例：**

```bash
mvn -f teamflow-modern/pom.xml -Dproject.build.directory=target package
mvn -f teamflow-legacy/pom.xml -Dproject.build.directory=target package
docker build -t teamflow:latest teamflow-modern
docker build -t teamflow:latest teamflow-legacy
```

**正确写法：**

```bash
mvn -f teamflow-modern/pom.xml -Dproject.build.directory=modern/target package
mvn -f teamflow-legacy/pom.xml -Dproject.build.directory=legacy/target package
docker build -t teamflow:modern teamflow-modern
docker build -t teamflow:legacy teamflow-legacy
```

**验证方式：** 分别检查两个镜像的 Java 版本、镜像 ID 和端口，向 `18080`、`18081` 发同一请求并比较结果。影响版本：JDK 25、Java 8、Docker Engine current CLI。

### readiness 失败后用固定 sleep 掩盖问题

**触发条件：** 启动容器后无论探针返回什么都 `sleep 30`，然后直接发业务请求。

**原因：** 固定等待无法区分依赖未就绪、配置错误和应用已经退出；它也会让本应立即停止的门禁继续执行。

**后果：** 交付反馈变慢，甚至把错误页面或旧容器当成成功结果。

**错误示例：**

```bash
docker run -d --name teamflow teamflow:modern
sleep 30
curl http://127.0.0.1:8080/api/projects/demo
```

**正确写法：**

```bash
for attempt in 1 2 3 4 5 6; do
  code=$(curl --silent --output /dev/null --write-out '%{http_code}' \
    http://127.0.0.1:8080/actuator/health/readiness)
  [ "$code" = 200 ] && break
  [ "$attempt" = 6 ] && exit 1
  sleep 2
done
curl --fail-with-body http://127.0.0.1:8080/api/v1/projects
```

**验证方式：** 让 readiness 连续返回 `503`，确认门禁在第六次检查后返回非零且没有发出创建任务请求。影响版本：Spring Boot 4.1.x；Boot 2.3 需要显式启用 probes。
:::

## 七、结课联调矩阵

### 1. 先验证合同，再验证故障

| 场景 | 现代线预期 | 兼容线预期 | 证据 |
| --- | --- | --- | --- |
| 匿名访问任务列表 | `401` | `401` | HTTP 响应和认证日志 |
| 有 `project:read` 的成员读取 | `200` | `200` | JSON 字段与分页值 |
| 过期 JWT | `401` | `401` | Resource Server 校验响应 |
| 缺少 `project:read` | `403` | `403` | authority 映射与拒绝响应 |
| 非法页大小 | `400` | `400` | `INVALID_PAGE_SIZE` |
| 相同幂等键重放 | 原响应、无第二条任务 | 同样 | 唯一键与响应体 |
| 不同摘要复用幂等键 | `409` | `409` | 错误码和数据库记录 |
| 错误版本完成任务 | `409`、状态不变、无 outbox | 同样 | 任务与交付状态响应 |
| 发布后消费者重复 | 通知副作用一次 | 同样 | inbox 唯一记录 |
| Redis 键过期 | MySQL 回源并重建 | 同样 | TTL 与查询日志 |
| React 前端构建 | 当前端口进入产物 | 同样 | Vite 生产构建日志 |
| 任一依赖停止 | readiness 为 `503` | 同样 | 三次 Actuator 故障注入 |
| 健康后关键业务请求 | `200`/`201`/`202` | 同样 | 烟雾脚本输出 |
| 未知路径 | `403` | `403` | 默认拒绝规则 |

### 2. 练习：把门禁变成可复跑命令

:::exercise
### 完成 TeamFlow 双版本交付门禁

**要求：** 在不改变既有 API 字段和事件 ID 规则的前提下，为 `teamflow-modern` 与 `teamflow-legacy` 各准备一份门禁脚本。脚本必须按前端生产构建、`clean verify`、JAR 检查、镜像检查、readiness、业务烟雾请求的顺序执行；任何一步失败立即停止。为现代线和兼容线使用不同端口、Compose 项目名与临时输出目录，并验证真实 JWT、分页字段、缓存过期回源、相同幂等键重放、分隔符碰撞、不同请求复用幂等键、乐观锁冲突、相同 RabbitMQ 消息重投和未知路径。不得把真实数据库密码、JWT 密钥或邮件地址写进脚本。

**验收：** 两条线都得到 `token=jwt`、`pagination=stable` 和 `cache=miss-hit-expired`，第一次创建与相同幂等键重放返回同一 taskId，分隔符碰撞请求和不同请求复用该键均返回 `409`，错误任务版本返回 `409`，同一 `eventId` 被消费者实际接收两次但通知副作用计数仍为 `1`，未知路径返回 `403`；分别停止 MySQL、Redis、RabbitMQ 时 readiness 返回 `503`，恢复后重新返回 `200`。成功后清理临时报告，失败时回显并保留不含 token 的诊断目录。
:::

### 参考实现

```bash
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
await page.getByRole('button', { name: '刷新' }).click()
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
  bash "$script_dir/delivery-smoke.sh" "$base_url" "$report_dir" "$project" "$compose_file"

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
```

完整参考工程位于
`src/categories/backend/java/core/demos/teamflow-complete-delivery/`。其中 `delivery-gate.sh` 就是上面的
门禁，`delivery-smoke.sh` 是前一节的烟雾脚本，`teamflow-frontend` 提供真实 Vite + React 客户端，`compose.yaml` 和两个后端 `teamflow-*` 目录分别提供共享依赖
与独立源码快照。在该目录分别运行 `bash delivery-gate.sh modern 18080` 和
`bash delivery-gate.sh legacy 18081`。两个命令必须各自输出 `gate=PASS`；失败时会输出保留的 `/tmp`
报告目录，成功时则清理源码副本、报告和 Compose 数据卷。

### 4. 完整项目结构与联调界面

结课快照的业务代码按职责放在两个版本工程的 `dev.teamflow` 根包下：`domain` 保存用户、团队、项目和任务规则，
`application` 编排用例和事务，`web` 暴露 DTO、校验与 Problem Details，`persistence` 负责 MyBatis 与 Flyway，
`cache` 负责 Redis 查询缓存、验证码和幂等，`messaging` 负责 RabbitMQ、outbox、inbox 与通知，`integration` 负责
外部 HTTP，`security` 负责 JWT 与动作权限，`config` 只放版本适配。现代版和兼容版分别位于
`teamflow-modern/` 与 `teamflow-legacy/`，不会共享编译产物。

`teamflow-frontend/` 是可直接构建的 React 客户端：登录后可读取用户/团队目录和项目、任务分页，创建任务、完成
任务，并查询 `delivery` 状态中的 `eventId`、outbox 状态、重试次数和通知计数。前端通过
`VITE_TEAMFLOW_API_BASE_URL` 切换两个后端；CORS、JWT、错误状态和分页字段均来自共享合同，不维护第二套接口。

从源码到联调的最短路径是：启动 Compose 依赖，运行 `delivery-gate.sh` 完成前端构建、两套 Maven/JAR/镜像检查、
readiness、C0-C9 请求矩阵和依赖故障恢复；门禁输出 `profile=modern gate=PASS` 或
`profile=legacy gate=PASS` 才算对应版本完成。

## 八、最终交付清单

### 1. 交付前逐项签字

1. 两条版本线的源码、POM、配置、target、镜像标签和端口互不混用。
2. `mvn -B clean verify` 在两个独立的临时源码副本中均通过，日志能确认实际 JDK 与 Spring Boot 版本。
3. 主 JAR 的 Manifest、归档目录、非 root 用户、入口和端口声明均已检查。
4. MySQL、Redis、RabbitMQ 健康后才启动应用，readiness 通过后才执行业务烟雾请求。
5. JWT 签名与 claims 校验、权限映射、分页字段、错误码、幂等、缓存、outbox、inbox 和通知状态与合同一致。
6. Vite + React 客户端使用当前 profile 的地址完成生产构建，后端 CORS 只开放联调所需范围。
7. 重复消息、缓存过期、摘要分隔符碰撞、错误版本、三项依赖不可用和未知路径都有可观察结果。
8. 任一门禁失败都删除 token、保留其余原始日志和退出码，修复或回滚后从失败门重新开始。

### 2. 结课边界

到这里，TeamFlow 已经具备从 React 客户端、JWT 和 API 请求进入，到 MySQL 事务、Redis 状态、RabbitMQ 通知与容器交付的完整反馈链。它仍然没有承诺 exactly-once、跨系统分布式事务或零停机发布；这些承诺需要另外的架构和运维能力。结课项目的完成证据是两条版本线在同一矩阵上得到相同业务结果，并且每个结果都能回到一条明确的状态或日志记录。
