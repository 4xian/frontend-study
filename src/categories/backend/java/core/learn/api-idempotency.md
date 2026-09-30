---
id: backend.java.learn.intermediate.api-idempotency
type: lesson
title: 接口幂等
summary: 使用 Idempotency-Key 与 Redis 原子占用让可重试的 POST 请求在有限窗口内只执行一次并回放首次结果
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 240
prerequisites:
  - backend.java.learn.intermediate.verification-code
  - backend.java.learn.intermediate.project-and-task-persistence-project
objectives:
  - 能区分 HTTP 方法本身的幂等语义与 POST 接口的请求去重合同。
  - 能为 Idempotency-Key 固定作用域、格式、请求指纹、TTL 和重放响应规则。
  - 能用 SET NX 加 TTL 原子占用同一个请求键，阻止并发首次请求重复进入业务副作用。
  - 能处理 PENDING、COMPLETED、FAILED、同键不同请求体和状态缺失五种 Redis 状态。
  - 能用稳定的字段顺序和 SHA-256 请求指纹判断重试是否真的是同一个请求。
  - 能解释 Redis 记录与数据库或外部服务副作用不是同一事务，不把本课实现宣称为 exactly-once。
  - 能在 JDK 25 与 Java 8 兼容线上保持同一 HTTP 合同，只替换真实存在的语言和 API 差异。
  - 能用真实 Redis、并发 curl 和故障反馈证明首次执行、回放、冲突和过期边界。
recap:
  - GET、PUT、DELETE 的 HTTP 幂等语义不等于任意 POST 自动具备请求去重能力。
  - Idempotency-Key 是客户端为一次逻辑操作生成的唯一键；同一作用域内只能绑定一个请求指纹。
  - Redis SET NX 与 TTL 在一次命令中完成首次占用；失败返回表示已有 PENDING、COMPLETED 或 FAILED 记录。
  - 同键同指纹回放首次结果，同键不同指纹返回冲突；Redis 故障直接暴露为依赖不可用，绝不回退本机 Map。
  - PENDING TTL 必须覆盖业务最大执行时间，结果 TTL 决定重试可回放的窗口；两者都不是永久事实。
  - 记录完成状态与业务副作用的写入不是跨系统原子事务，本课提供的是有限时间的去重和可观察边界。
related:
  - backend.java.learn.intermediate.verification-code
  - backend.java.learn.intermediate.project-and-task-api-project
  - backend.java.learn.intermediate.project-and-task-persistence-project
tags:
  - Java
  - Spring Boot
  - Redis
  - HTTP
  - Idempotency-Key
  - 请求指纹
  - 重试
  - TeamFlow
appliesTo: JDK 25 与 Spring Boot 4.1.x 主线；Java 8 与 Spring Boot 2.3.12.RELEASE 兼容线；Redis Open Source 8.x；HTTP 语义按 RFC 9110
verifiedAt: 2026-08-21
sources:
  - id: rfc-9110-idempotent-methods
    title: RFC 9110 - HTTP Semantics
    url: https://www.rfc-editor.org/rfc/rfc9110.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: HTTP method safety and idempotency
    claims:
      - 幂等描述多次相同请求的预期服务器状态效果，不要求每次响应字节完全相同。
      - GET、PUT 和 DELETE 具有规范定义的幂等语义，POST 不因方法名自动获得请求去重。
  - id: ietf-idempotency-key-header
    title: Idempotency-Key HTTP Header Field
    url: https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-idempotency-key-header-07
    sourceOrigin: official
    sourceType: specification
    appliesTo: IETF HTTPAPI Idempotency-Key draft
    claims:
      - Idempotency-Key 用于标识一次由客户端发起的逻辑请求，服务端应在定义的作用域内处理重复键。
      - 同一个键不能被客户端并发用于多个不同请求意图；服务端可以用指纹检测键复用冲突。
      - 键的有效期和重放行为必须由接口合同明确，不能让客户端猜测。
  - id: redis-set-nx-ex
    title: Redis SET Command
    url: https://redis.io/docs/latest/commands/set/
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Redis Open Source 8.x
    claims:
      - SET 的 NX 条件只在 key 不存在时写入，条件未满足时返回空结果。
      - SET 可以同时提供 EX/PX 过期时间，适合把首次占用与回收边界放进同一条命令。
  - id: spring-data-redis-41-value-operations
    title: ValueOperations API - Spring Data Redis 4.1
    url: https://docs.spring.io/spring-data/redis/docs/4.1.x/api/org/springframework/data/redis/core/ValueOperations.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Data Redis 4.1.x
    claims:
      - 现代线提供带 Duration 的 setIfAbsent，可表达 SET NX 与过期时间。
      - get 与普通 set 可读取和回放字符串记录，但多步业务逻辑仍不因此成为跨系统事务。
  - id: spring-data-redis-23-value-operations
    title: ValueOperations API - Spring Data Redis 2.3.9.RELEASE
    url: https://docs.spring.io/spring-data/redis/docs/2.3.9.RELEASE/api/org/springframework/data/redis/core/ValueOperations.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Data Redis 2.3.9.RELEASE / Spring Boot 2.3.12.RELEASE
    claims:
      - Java 8 兼容线使用 setIfAbsent 的 long 与 TimeUnit 重载表达同一 SET NX + TTL 合同。
      - 兼容线不能假定现代 Spring Data Redis 才新增的类型或重载。
  - id: spring-boot-41-json
    title: 'JSON :: Spring Boot 4.1'
    url: https://docs.spring.io/spring-boot/4.1/reference/features/json.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.x
    claims:
      - Spring Boot 4.1 默认使用 Jackson 3，并自动配置 JsonMapper Bean。
  - id: spring-boot-2312-jackson
    title: Spring Boot 2.3.12 JacksonAutoConfiguration API
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/api/org/springframework/boot/autoconfigure/jackson/JacksonAutoConfiguration.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Java 8 兼容线自动配置 Jackson 2 ObjectMapper。
  - id: java-25-message-digest
    title: Java SE 25 MessageDigest API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/security/MessageDigest.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - MessageDigest.getInstance("SHA-256") 可为固定字节序列生成摘要，摘要不应直接当作加密秘密。
  - id: java-8-message-digest
    title: Java SE 8 MessageDigest API
    url: https://docs.oracle.com/javase/8/docs/api/java/security/MessageDigest.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 具有本课所需的 SHA-256 MessageDigest 与 Base64 API，指纹实现无需语言分叉。
  - id: community-redis-idempotency-race
    title: Stack Overflow - Atomic Redis transaction for idempotency required for database inserts
    url: https://stackoverflow.com/questions/78820801/atomic-redis-transaction-for-idempotency-required-for-database-inserts-using-red
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: 社区对 SET NX 与数据库插入竞态的讨论；最终命令合同已按 Redis 官方文档核验
    claims:
      - 真实开发者常把 Redis 的原子占用误认为数据库写入也会随之去重，该讨论可作为“跨系统事务边界”排错线索。
---

# 接口幂等

客户端遇到超时后，最自然的动作是重试。对于读取接口，重复请求通常只是在重新读取；对于创建任务的 `POST`，
重复请求可能已经写入两条任务。上一课讲过 GET、PUT、DELETE 的 HTTP 幂等语义，但它们不能替 POST 自动增加
一次业务操作的去重能力。本课不重做已经冻结的任务 API，而是为现有
`POST /api/v1/projects/{projectId}/tasks` 增加一个明确的请求合同：客户端为一次逻辑创建生成
`Idempotency-Key`，服务端在 Redis 中保留短期状态，重试时回放第一次结果。URL、请求 DTO、任务响应、
`201 + Location` 和 Problem Details 外形都继续沿用前置项目课。

本课只实现“有限时间的请求去重窗口”。Redis 记录、MySQL 事务、支付扣款、消息投递和外部供应商调用不属于同一
原子事务，因此不会把实现描述成 exactly-once。Lua、Redis 事务、分布式锁、消息消费幂等和任务查询缓存实战留给
专门课程或后续项目。

## 一、先固定幂等的边界

### 1. 方法幂等和请求幂等不是同一个词

RFC 9110 中的幂等描述的是：把相同请求重复执行多次，服务器预期的状态效果与执行一次相同。日志计数等附带
副作用可以不同，响应状态也不必每次完全一样。GET、PUT、DELETE 已有这种方法语义；POST 的语义允许目标资源
每次创建新成员，所以 `POST /tasks` 不能仅凭 HTTP 方法名防止重复创建。

应用层请求幂等需要额外的键和存储：

```text
第一次 POST + K-123 -> 创建 TASK-901 -> 保存首次结果
超时后 POST + K-123 -> 不再创建 -> 回放 TASK-901
```

键解决的是“这是同一次逻辑操作吗”，Redis 记录解决的是“服务器已经走到哪一步”。它们都不能替数据库回滚，也
不能替调用方决定重试哪一个业务意图。

### 2. 本课的 HTTP 合同

请求路径固定为：

```http
POST /api/v1/projects/PRJ-1/tasks
Idempotency-Key: task-create-20260821-001
Content-Type: application/json

{"title":"整理课程","dueAt":"2026-09-01T18:00:00+08:00","assignee":"lin"}
```

合同如下：

| 情况 | 响应 | 说明 |
| --- | --- | --- |
| 首次键成功占用并创建 | `201` + `Location` + 完整任务 JSON | 保存响应供重试回放 |
| 同键、同请求体，已完成 | 与首次相同的 `201`、`Location` 和 body | 额外返回 `Idempotency-Replayed: true` |
| 同键、同请求体，仍处理中 | `409` | 返回 `IDEMPOTENCY_IN_PROGRESS`，不执行第二次副作用 |
| 同键、同请求体，首次业务失败 | 与首次失败相同的 `409` | 回放 `FAILED` 记录，不反复执行 |
| 同键、不同请求体 | `409` | 返回 `IDEMPOTENCY_KEY_REUSED` |
| 缺失或非法键 | `400` | 在占用 Redis 前拒绝 |
| Redis 不可用 | `503` | 继续抛给已有全局错误边界，不能回退内存 |
| 结果 TTL 到期 | 重新按首次请求处理 | 去重窗口已经结束，客户端不能再假定旧结果可回放 |

`Idempotency-Key` 只在同一个当前用户、任务创建接口和项目作用域内唯一。当前用户由 Web 边界解析后作为服务输入，
不进入路径或请求 DTO；安全课程接入认证后只需替换当前用户提供者，不能再次改写任务 URL。服务端限制键为 1 到
128 个可见 ASCII 字符，不把原始键写进日志或 Redis key。客户端必须为不同业务意图生成新键；把同一个键永久写在
前端代码里会把不同创建请求错误地绑定在一起。IETF 草案使用 Structured Field string；本课只借用键、指纹和
生命周期语义，并明确采用未加引号的简单 ASCII header 值，不宣称实现草案的完整字段语法解析。

### 3. 为什么同键不同体必须冲突

只按键去重会产生一个危险结果：

```text
K-123 + {"title":"整理课程"} -> TASK-901
K-123 + {"title":"发布课程"} -> 仍回放 TASK-901
```

第二个请求可能来自客户端 bug，也可能来自错误的重试拼接。服务端不能猜测调用方意图，因此为请求体生成指纹，
把指纹和状态一起保存。指纹不同就返回 `IDEMPOTENCY_KEY_REUSED`，不能覆盖旧记录，也不能创建第二条任务。

## 二、为 Redis 记录设计稳定身份

### 1. 请求指纹要有固定字段顺序

本课复用前置项目课的 `CreateTaskRequest`，字段仍是 `title`、`dueAt` 和 `assignee`。指纹输入不是原始 JSON
文本，因为客户端可以改变空格、字段顺序或换行而不改变业务请求。服务端先完成 JSON 绑定和校验，再按版本固定
顺序拼接：

```text
v1|title=<Base64URL(title)>|dueAt=<Base64URL(dueAt)>|assignee=<Base64URL(assignee)>
```

`null` 编码为 `~`，空字符串编码为空的 Base64URL 值。字段名称、顺序和版本号都是合同的一部分；以后增加字段时
必须升版本或明确迁移规则。随后对 UTF-8 字节做 SHA-256，得到 64 个十六进制字符。哈希用于稳定比较，不是密码
存储，也不能把它误写成“加密了请求内容”。

```java
/** 按固定字段顺序生成请求指纹。 */
private String requestFingerprint(CreateTaskRequest request) {
    String canonical = "v1|title=" + encodeField(request.title())
            + "|dueAt=" + encodeField(request.dueAt())
            + "|assignee=" + encodeField(request.assignee());
    return sha256(canonical);
}

/** 让分隔符和 Unicode 文本不会改变字段边界。 */
private String encodeField(String value) {
    if (value == null) {
        return "~";
    }
    return Base64.getUrlEncoder().withoutPadding()
            .encodeToString(value.getBytes(StandardCharsets.UTF_8));
}
```

### 2. Redis key 只保存哈希后的作用域

原始 `Idempotency-Key` 可能包含订单号、邮箱或其他业务标识，不能直接拼到 key、日志和监控标签中。本课使用
用户作用域和客户端键共同生成哈希：

```text
teamflow:idempotency:v1:task-create:<sha256(scope + key)>
```

作用域和键也用同样的固定字段编码：
`v1|actor=<current-user-id>|project=<projectId>|key=<Idempotency-Key>`。Redis key 只出现稳定前缀和摘要，
请求体指纹放在受 TTL 保护的值中。生产环境还要对 header、body、异常和 trace 记录做日志脱敏。

### 3. 状态值只表达有限窗口

为了让两条 Spring Data Redis 版本线都能读懂同一个字符串，本课把记录编码为：

```text
PENDING|<fingerprint>
COMPLETED|<fingerprint>|<Base64URL(response-json)>
FAILED|<fingerprint>|<Base64URL(error-code)>
```

状态值不是公开 API，不让 Controller 读取或拼接 Redis 字符串。解析时必须检查状态名、字段数量、指纹和 Base64
内容；损坏记录返回 `IDEMPOTENCY_STATE_INVALID`，不能把它当作第一次请求重新执行。

## 三、用 SET NX 占住并发首次请求

### 1. 原子占用是唯一入口

Redis `SET` 的 `NX` 选项只在 key 不存在时写入，配合 `EX` 或客户端的 TTL 重载，可以把“检查不存在”和“写入
PENDING”合成一条 Redis 命令。两个 JVM 同时提交同一个键时，最多一个请求得到 `true`：

```java
Boolean claimed = redisTemplate.opsForValue().setIfAbsent(
        redisKey,
        "PENDING|" + fingerprint,
        PROCESSING_TTL);
```

处理请求时可以先读取并回放已有状态，让已经保存的 `COMPLETED` 或 `FAILED` 不再依赖实时业务数据库；只有状态
不存在时才执行无副作用预校验并尝试占用。预读不代表获得了首次执行权，两个请求都读到 null 后仍必须通过
`SET NX` 竞争，只有返回 `true` 的请求才能进入业务副作用。`false` 代表已有记录，此时再次读取并解析：同指纹的
`PENDING` 返回处理中，同指纹的 `COMPLETED` 或 `FAILED` 回放，不同指纹冲突。

### 2. PENDING 与结果使用不同 TTL

本课固定：

```text
PROCESSING_TTL = 2 分钟
RESULT_TTL     = 24 小时
```

PENDING TTL 必须大于业务端口可接受的最大执行时间，否则第一个请求还在执行时记录可能过期，第二个请求可以再次
占用。结果 TTL 决定客户端可以在多长时间内安全重试；过期后服务端已经没有历史记录，同一个键会重新按首次请求
执行。生产系统应根据真实 p99、重试窗口和数据保留政策调整，并用指标观察过期与 PENDING 堆积。

### 3. 失败也要有公开语义

业务端口如果明确返回可重复且尚未提交副作用的业务失败，例如创建前发现任务标题冲突，本课保存 `FAILED` 并回放
相同错误。端口超时、未知异常和可能已经提交的失败不能伪装成 `TaskCreationException`，它们向上抛出并保留
PENDING。参数格式错误在占用前直接返回，不产生幂等记录；Redis 连接异常也不写失败记录。这样客户端能区分：

```text
400 -> 请求本身不符合合同，修正后生成新请求
409 FAILED -> 同一个逻辑请求已经得到稳定业务失败
503 -> 依赖故障，不能凭响应判断业务是否执行
```

特别是“业务副作用已经成功，但保存 COMPLETED 失败”的窗口：本课不掩盖它。请求应暴露 `503`，PENDING 记录保留
到 TTL；运维需要通过业务真相源和幂等 key 关联排查，不能因为 Redis 记录丢失就宣称没有创建。

## 四、现代 Spring Boot 实现

### 1. 复用已有 DTO 和业务入口

这里不是新建第二套任务模型。继续使用 `TeamFlowApplication` 内已经存在的 `CreateTaskRequest`、`TaskResponse`
和只有 `TODO`、`DONE` 两个值的 `TaskStatus`；这些嵌套类型仍保留在原文件，不复制到新包。新增幂等组件也放在
`com.teamflow.api`，通过 import 引用原嵌套类型。

幂等层只依赖一个创建端口。现有持久化 `ApiService` 的 adapter 调用原来的
`createTask(projectId, request)`，再用原有 `TaskResponse.from(...)` 转换结果；数据库写入、ID 生成、项目存在性检查
和其他任务 CRUD 仍由原 Service 负责。

先打开持久化项目的 `ApiService.java`，增加一个不写数据库的创建前校验。它只复用原有项目查询和截止时间解析，
只有 Redis 中没有可回放状态时才调用这项校验，让新请求的 404/400 在 Redis 占用前沿原 Problem Details 边界
返回；真正创建时 `createTask(...)` 仍重新检查，不能把预检查当作事务保证：

```java
/** 在幂等占用前复用现有、无副作用的任务创建校验。 */
public void validateTaskCreation(String projectId, CreateTaskRequest request) {
    requireProjectRow(projectId);
    requireDueAt(request.dueAt());
}
```

Java 8 线的方法体只把 `request.dueAt()` 换成已有公开字段 `request.dueAt`。这个方法不生成 ID、不插入任务，也不
改变既有错误类型和状态码。

```java
package com.teamflow.api;

import com.teamflow.api.TeamFlowApplication.CreateTaskRequest;
import com.teamflow.api.TeamFlowApplication.TaskResponse;

/** 把已有任务创建能力暴露给幂等层，不改变 HTTP 合同。 */
public interface TaskCreationPort {
    /** 在 Redis 占用前执行已有、无副作用的业务校验。 */
    void validate(String projectId, CreateTaskRequest request);

    /** @return 已经持久化的完整任务响应 */
    TaskResponse create(String projectId, CreateTaskRequest request) throws TaskCreationException;
}
```

生产工程新建 `PersistentTaskCreationPort.java`，把端口明确接回上一项目课的 MySQL Service：

```java
package com.teamflow.api;

import com.teamflow.api.TeamFlowApplication.CreateTaskRequest;
import com.teamflow.api.TeamFlowApplication.Task;
import com.teamflow.api.TeamFlowApplication.TaskResponse;
import org.springframework.stereotype.Component;

/** 复用现有 MySQL 任务创建链路。 */
@Component
public final class PersistentTaskCreationPort implements TaskCreationPort {
    private final ApiService service;

    /** 保存现有持久化 Service。 */
    public PersistentTaskCreationPort(ApiService service) {
        this.service = service;
    }

    /** 复用现有 400/404 校验，不创建任务。 */
    @Override
    public void validate(String projectId, CreateTaskRequest request) {
        service.validateTaskCreation(projectId, request);
    }

    /** @return 已经写入 MySQL 的完整任务响应 */
    @Override
    public TaskResponse create(String projectId, CreateTaskRequest request) {
        Task task = service.createTask(projectId, request);
        return TaskResponse.from(task);
    }
}
```

`ApiService` 抛出的项目不存在、数据库错误等既有异常继续交给原全局边界；adapter 不把未知失败伪装成可回放失败。
只有端口能确认副作用尚未发生且结果稳定时，才抛出下面的 `TaskCreationException`。

首次成功与回放成功都返回完整任务；冲突则继续交给全局 Problem Details 边界。

```java
package com.teamflow.api;

import com.teamflow.api.TeamFlowApplication.TaskResponse;

/** 保存一次成功创建或回放的任务。 */
public record TaskCreationResult(TaskResponse task, boolean replayed) {
}
```

```java
package com.teamflow.api;

/** 表示业务端口已经确定、可以安全回放的任务创建失败。 */
public final class TaskCreationException extends Exception {
    private final String code;

    /** 保存稳定业务错误码。 */
    public TaskCreationException(String code) {
        super(code);
        this.code = code;
    }

    /** @return 稳定业务错误码 */
    public String getCode() {
        return code;
    }
}
```

```java
package com.teamflow.api;

/** 表示缺失或不符合格式的 Idempotency-Key。 */
public final class InvalidIdempotencyKeyException extends RuntimeException {
    /** 保存固定的公开说明。 */
    public InvalidIdempotencyKeyException() {
        super("Idempotency-Key 必须是 1 到 128 个可见 ASCII 字符");
    }
}
```

```java
package com.teamflow.api;

/** 表示可以安全公开为 409 的幂等状态。 */
public final class IdempotencyConflictException extends RuntimeException {
    private final String code;
    private final boolean replayed;

    /** 保存稳定错误码和是否来自已存结果。 */
    public IdempotencyConflictException(String code, boolean replayed) {
        super(code);
        this.code = code;
        this.replayed = replayed;
    }

    /** @return 稳定错误码 */
    public String getCode() {
        return code;
    }

    /** @return 是否回放首次失败 */
    public boolean isReplayed() {
        return replayed;
    }
}
```

```java
package com.teamflow.api;

/** 表示 Redis 幂等状态存储不可用。 */
public final class IdempotencyStoreUnavailableException extends RuntimeException {
    /** 保留根因供服务端日志使用，不向客户端公开。 */
    public IdempotencyStoreUnavailableException(Throwable cause) {
        super("幂等状态存储不可用", cause);
    }
}
```

### 2. 幂等服务只重试一次状态缺失竞态

下面的服务保存为 `TaskCreationIdempotencyService.java`。两条版本线都使用 `long + TimeUnit`，避免正文先展示
Java 8 不存在的结果写入重载。第一次 `SET NX` 失败后若紧随其后的 `GET` 为 `null`，说明旧记录可能刚好过期或
被删除；服务只再尝试一次 `SET NX`。第二次由当前请求占用成功时按首次请求执行，若又失败则读取当前占用者状态，
不会递归或无限重试。

```java
package com.teamflow.api;

import com.teamflow.api.TeamFlowApplication.CreateTaskRequest;
import com.teamflow.api.TeamFlowApplication.TaskResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Locale;
import java.util.concurrent.TimeUnit;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.json.JsonMapper;

/** 为已有任务创建接口提供 Redis-backed 的有限时间幂等窗口。 */
@Service
public final class TaskCreationIdempotencyService {
    private static final long PROCESSING_TTL_MILLIS = TimeUnit.MINUTES.toMillis(2);
    private static final long RESULT_TTL_MILLIS = TimeUnit.HOURS.toMillis(24);
    private static final String KEY_PREFIX = "teamflow:idempotency:v1:task-create:";

    private final StringRedisTemplate redisTemplate;
    private final JsonMapper jsonMapper;
    private final TaskCreationPort taskCreationPort;

    /** 保存 Redis、回放序列化和已有任务创建端口。 */
    public TaskCreationIdempotencyService(
            StringRedisTemplate redisTemplate,
            JsonMapper jsonMapper,
            TaskCreationPort taskCreationPort) {
        this.redisTemplate = redisTemplate;
        this.jsonMapper = jsonMapper;
        this.taskCreationPort = taskCreationPort;
    }

    /**
     * 处理一次已经通过 DTO 校验的项目任务创建请求。
     *
     * @return 首次创建或已保存的完整任务
     */
    public TaskCreationResult create(
            String actorId,
            String projectId,
            String idempotencyKey,
            CreateTaskRequest request) {
        validateKey(idempotencyKey);
        String fingerprint = requestFingerprint(request);
        String redisKey = redisKey(actorId, projectId, idempotencyKey);
        String pending = "PENDING|" + fingerprint;

        String stored = read(redisKey);
        if (stored != null) {
            return replayOrThrow(stored, fingerprint);
        }

        taskCreationPort.validate(projectId, request);

        if (claim(redisKey, pending)) {
            return executeFirstRequest(redisKey, fingerprint, projectId, request);
        }

        stored = read(redisKey);
        if (stored != null) {
            return replayOrThrow(stored, fingerprint);
        }

        if (claim(redisKey, pending)) {
            return executeFirstRequest(redisKey, fingerprint, projectId, request);
        }

        stored = read(redisKey);
        if (stored == null) {
            throw new IdempotencyConflictException("IDEMPOTENCY_STATE_MISSING", false);
        }
        return replayOrThrow(stored, fingerprint);
    }

    /** 只有获得 SET NX 的请求才进入已有业务副作用。 */
    private TaskCreationResult executeFirstRequest(
            String redisKey,
            String fingerprint,
            String projectId,
            CreateTaskRequest request) {
        try {
            TaskResponse task = taskCreationPort.create(projectId, request);
            String responseJson = jsonMapper.writeValueAsString(task);
            writeResult(redisKey, "COMPLETED|" + fingerprint + "|" + encode(responseJson));
            return new TaskCreationResult(task, false);
        } catch (TaskCreationException error) {
            writeResult(redisKey, "FAILED|" + fingerprint + "|" + encode(error.getCode()));
            throw new IdempotencyConflictException(error.getCode(), false);
        } catch (JacksonException error) {
            throw new IllegalStateException("幂等结果序列化失败", error);
        }
    }

    /** 解析已有状态，回放同一请求并拒绝其他状态。 */
    private TaskCreationResult replayOrThrow(String stored, String fingerprint) {
        String[] parts = stored.split("\\|", -1);
        if (parts.length < 2) {
            throw new IdempotencyConflictException("IDEMPOTENCY_STATE_INVALID", false);
        }
        if (!fingerprint.equals(parts[1])) {
            throw new IdempotencyConflictException("IDEMPOTENCY_KEY_REUSED", false);
        }
        switch (parts[0]) {
            case "PENDING":
                if (parts.length != 2) {
                    throw new IdempotencyConflictException("IDEMPOTENCY_STATE_INVALID", false);
                }
                throw new IdempotencyConflictException("IDEMPOTENCY_IN_PROGRESS", false);
            case "COMPLETED":
                if (parts.length != 3) {
                    throw new IdempotencyConflictException("IDEMPOTENCY_STATE_INVALID", false);
                }
                try {
                    TaskResponse task = jsonMapper.readValue(decode(parts[2]), TaskResponse.class);
                    if (!isValidTaskResponse(task)) {
                        throw new IdempotencyConflictException("IDEMPOTENCY_STATE_INVALID", false);
                    }
                    return new TaskCreationResult(task, true);
                } catch (JacksonException | IllegalArgumentException error) {
                    throw new IdempotencyConflictException("IDEMPOTENCY_STATE_INVALID", false);
                }
            case "FAILED":
                if (parts.length != 3) {
                    throw new IdempotencyConflictException("IDEMPOTENCY_STATE_INVALID", false);
                }
                try {
                    throw new IdempotencyConflictException(decode(parts[2]), true);
                } catch (IllegalArgumentException error) {
                    throw new IdempotencyConflictException("IDEMPOTENCY_STATE_INVALID", false);
                }
            default:
                throw new IdempotencyConflictException("IDEMPOTENCY_STATE_INVALID", false);
        }
    }

    /** 确认完成态保存的是可完整回放的任务响应。 */
    private boolean isValidTaskResponse(TaskResponse task) {
        return task != null
                && StringUtils.hasText(task.id())
                && StringUtils.hasText(task.projectId())
                && StringUtils.hasText(task.title())
                && task.status() != null
                && StringUtils.hasText(task.dueAt())
                && StringUtils.hasText(task.assignee());
    }

    /** 使用 SET NX 与处理 TTL 原子占用。 */
    private boolean claim(String redisKey, String pending) {
        try {
            Boolean claimed = redisTemplate.opsForValue().setIfAbsent(
                    redisKey,
                    pending,
                    PROCESSING_TTL_MILLIS,
                    TimeUnit.MILLISECONDS);
            return Boolean.TRUE.equals(claimed);
        } catch (DataAccessException error) {
            throw new IdempotencyStoreUnavailableException(error);
        }
    }

    /** 读取当前占用者状态。 */
    private String read(String redisKey) {
        try {
            return redisTemplate.opsForValue().get(redisKey);
        } catch (DataAccessException error) {
            throw new IdempotencyStoreUnavailableException(error);
        }
    }

    /** 使用有限结果 TTL 保存完成或稳定失败。 */
    private void writeResult(String redisKey, String stored) {
        try {
            redisTemplate.opsForValue().set(
                    redisKey,
                    stored,
                    RESULT_TTL_MILLIS,
                    TimeUnit.MILLISECONDS);
        } catch (DataAccessException error) {
            throw new IdempotencyStoreUnavailableException(error);
        }
    }

    /** 校验 header 形状，原始键不进入日志。 */
    private void validateKey(String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.length() < 1
                || idempotencyKey.length() > 128
                || !idempotencyKey.chars().allMatch(value -> value >= 0x21 && value <= 0x7e)) {
            throw new InvalidIdempotencyKeyException();
        }
    }

    /** 由当前用户、项目与客户端键生成不含原始标识的 Redis key。 */
    private String redisKey(String actorId, String projectId, String idempotencyKey) {
        String scope = "v1|actor=" + encodeField(actorId)
                + "|project=" + encodeField(projectId)
                + "|key=" + encodeField(idempotencyKey);
        return KEY_PREFIX + sha256(scope);
    }

    /** 以已有请求 DTO 的固定字段顺序生成指纹。 */
    private String requestFingerprint(CreateTaskRequest request) {
        String canonical = "v1|title=" + encodeField(request.title())
                + "|dueAt=" + encodeField(request.dueAt())
                + "|assignee=" + encodeField(request.assignee());
        return sha256(canonical);
    }

    /** 将任意 UTF-8 字段编码为不含分隔符的值。 */
    private String encodeField(String value) {
        if (value == null) {
            return "~";
        }
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    /** 保存 JSON 或错误码时避免破坏状态值分隔符。 */
    private String encode(String value) {
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    /** 解码受 TTL 保护的单条状态字段。 */
    private String decode(String value) {
        return new String(Base64.getUrlDecoder().decode(value), StandardCharsets.UTF_8);
    }

    /** 生成小写十六进制 SHA-256 摘要。 */
    private String sha256(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder(digest.length * 2);
            for (byte item : digest) {
                result.append(String.format(Locale.ROOT, "%02x", item & 0xff));
            }
            return result.toString();
        } catch (NoSuchAlgorithmException error) {
            throw new IllegalStateException("JDK 必须提供 SHA-256", error);
        }
    }
}
```

### 3. Controller 保留原路径、Location 和响应 DTO

当前课程还没有引入认证，因此用一个内部 `CurrentActorProvider` 提供前置项目课中已经存在的课程用户。它只负责给
幂等作用域提供输入，不增加路径段、header 或请求字段；安全课程接入认证后替换其实现。

```java
package com.teamflow.api;

/** 为服务层提供当前用户作用域，不改变公开任务 API。 */
public interface CurrentActorProvider {
    /** @return 当前课程环境中的用户 ID */
    String requireActorId();
}
```

当前未接入认证的课程工程使用固定演示用户；这个 adapter 不读取客户端可伪造的路径参数：

```java
package com.teamflow.api;

import org.springframework.stereotype.Component;

/** 在安全课程接入认证前提供课程环境的当前用户。 */
@Component
public final class CourseCurrentActorProvider implements CurrentActorProvider {
    /** @return 前置项目课已经存在的课程用户 */
    @Override
    public String requireActorId() {
        return "USR-1";
    }
}
```

打开原来的 `TeamFlowApplication.TaskController`。不要新建第二个 Controller，也不要删除查询、详情、替换和删除
端点；保留已有 `ApiService service` 字段，再增加两个依赖并扩展原构造器：

```java
private final ApiService service;
private final TaskCreationIdempotencyService idempotencyService;
private final CurrentActorProvider currentActorProvider;

/** 保存原业务 Service、幂等服务和当前用户提供者。 */
TaskController(
        ApiService service,
        TaskCreationIdempotencyService idempotencyService,
        CurrentActorProvider currentActorProvider) {
    this.service = service;
    this.idempotencyService = idempotencyService;
    this.currentActorProvider = currentActorProvider;
}
```

然后只用下面的方法替换原 `create(...)`；同一个类中的其他方法继续通过 `service` 访问 MySQL，不会产生重复路径映射：

```java
/**
 * 创建项目任务并保留 201、Location 与完整任务响应。
 *
 * @return 首次或回放的同一任务资源
 */
@Operation(operationId = "createProjectTask", summary = "创建项目任务")
@ApiResponses({
    @ApiResponse(responseCode = "201", description = "创建成功"),
    @ApiResponse(
            responseCode = "400",
            description = "请求体或幂等键校验失败",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class))),
    @ApiResponse(
            responseCode = "404",
            description = "项目不存在",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class))),
    @ApiResponse(
            responseCode = "409",
            description = "幂等键正在处理、被不同请求复用或命中稳定业务失败",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class))),
    @ApiResponse(
            responseCode = "415",
            description = "请求媒体类型不支持",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class))),
    @ApiResponse(
            responseCode = "503",
            description = "幂等存储暂不可用",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
})
@PostMapping(
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE)
ResponseEntity<TaskResponse> create(
        @PathVariable("projectId") String projectId,
        @RequestHeader(value = "Idempotency-Key", required = false) String key,
        @Valid @RequestBody CreateTaskRequest request) {
    TaskCreationResult result = idempotencyService.create(
            currentActorProvider.requireActorId(),
            projectId,
            key,
            request);
    URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{taskId}")
            .buildAndExpand(result.task().id())
            .toUri();
    return ResponseEntity.created(location)
            .header("Idempotency-Replayed", Boolean.toString(result.replayed()))
            .body(result.task());
}
```

这次增量只需要在原 Controller imports 中增加 `RequestHeader`；`ApiService`、DTO、`MediaType`、`ResponseEntity`
和 `ServletUriComponentsBuilder` 都已由原类使用。

### 4. 全局边界明确映射 400、409 和 503

不要用泛化的 `IllegalArgumentException` 映射非法 key，也不要在 Controller 中返回临时 `ApiError`。把下面三个
方法加入前置课已有的全局异常处理器，并继续复用它的 `problem(...)` 和 `traceId(...)` 方法，错误 JSON 仍包含
`type/title/status/detail/instance/code/traceId/errors`，媒体类型仍是 `application/problem+json`。

```java
/** 把缺失或非法幂等键转换为稳定 400。 */
@ExceptionHandler(InvalidIdempotencyKeyException.class)
ResponseEntity<Object> handleInvalidIdempotencyKey(
        InvalidIdempotencyKeyException exception,
        HttpServletRequest request) {
    return problem(
            HttpStatus.BAD_REQUEST,
            HttpHeaders.EMPTY,
            "invalid-idempotency-key",
            "幂等键无效",
            exception.getMessage(),
            "INVALID_IDEMPOTENCY_KEY",
            List.of(),
            request);
}

/** 把处理中、键复用和已保存业务失败转换为稳定 409。 */
@ExceptionHandler(IdempotencyConflictException.class)
ResponseEntity<Object> handleIdempotencyConflict(
        IdempotencyConflictException exception,
        HttpServletRequest request) {
    HttpHeaders headers = new HttpHeaders();
    headers.set("Idempotency-Replayed", Boolean.toString(exception.isReplayed()));
    return problem(
            HttpStatus.CONFLICT,
            headers,
            "idempotency-conflict",
            "幂等请求冲突",
            "该幂等键当前不能用于本次任务创建",
            exception.getCode(),
            List.of(),
            request);
}

/** 把 Redis 连接、超时或鉴权失败转换为稳定 503。 */
@ExceptionHandler(IdempotencyStoreUnavailableException.class)
ResponseEntity<Object> handleIdempotencyStoreUnavailable(
        IdempotencyStoreUnavailableException exception,
        HttpServletRequest request) {
    return problem(
            HttpStatus.SERVICE_UNAVAILABLE,
            HttpHeaders.EMPTY,
            "idempotency-store-unavailable",
            "幂等服务暂不可用",
            "暂时无法确认该任务创建请求的幂等状态",
            "IDEMPOTENCY_STORE_UNAVAILABLE",
            List.of(),
            request);
}
```

这些方法需要已有的 `HttpServletRequest`、`HttpStatus`、`ResponseEntity`、`ExceptionHandler` 和 `List`，并新增
`HttpHeaders` import。返回类型和参数顺序与前置工程已有的
`problem(HttpStatusCode, HttpHeaders, ..., HttpServletRequest)` 完全一致。`IdempotencyStoreUnavailableException`
只在 Redis 操作的
`DataAccessException` 边界创建，因此不会把数据库失败误报成 Redis 故障。如果业务端口已经成功但保存
`COMPLETED` 时 Redis 失败，响应仍是 503；运维随后要用任务真相源核对是否已经创建。

## 五、Java 8 兼容线

### 1. 复用普通 DTO，并让响应可被 Jackson 2 回放

Java 8 / Boot 2.3.12.RELEASE 线同样复用 `TeamFlowApplication` 中已有的 `CreateTaskRequest`、`TaskResponse` 和
`TaskStatus`，不在 `com.teamflow.api.task` 重新声明类型。为了让第九章的同一份反馈程序也能直接编译，在原
`CreateTaskRequest` 的无参构造器后加入下面的构造器和兼容访问器；公开字段继续供 Jackson 2 和 Java 8 服务使用：

```java
/** 供课程反馈直接构造请求。 */
public CreateTaskRequest(String title, String dueAt, String assignee) {
    this.title = title;
    this.dueAt = dueAt;
    this.assignee = assignee;
}

/** @return 任务标题 */
public String title() {
    return title;
}

/** @return 带偏移的截止时间 */
public String dueAt() {
    return dueAt;
}

/** @return 负责人 */
public String assignee() {
    return assignee;
}
```

原响应类只有 final 字段和带参构造器；为了让 `ObjectMapper.readValue(...)` 恢复 Redis 中保存的完整响应，打开原
`TeamFlowApplication.java`，只把已有的嵌套 `TaskResponse` 替换为下面版本：

```java
/** Java 8 中可由 Jackson 2 完整恢复的原任务响应。 */
@Schema(name = "TaskResponse", description = "任务公开表示")
static final class TaskResponse {
    public String id;
    public String projectId;
    public String title;
    public TaskStatus status;
    public String dueAt;
    public String assignee;

    /** 供 Jackson 2 恢复已保存的结果。 */
    public TaskResponse() {
    }

    /** 保存与现代线相同的六个响应字段。 */
    public TaskResponse(
            String id,
            String projectId,
            String title,
            TaskStatus status,
            String dueAt,
            String assignee) {
        this.id = id;
        this.projectId = projectId;
        this.title = title;
        this.status = status;
        this.dueAt = dueAt;
        this.assignee = assignee;
    }

    /** 从内部任务生成原公开响应。 */
    static TaskResponse from(Task task) {
        return new TaskResponse(
                task.id,
                task.projectId,
                task.title,
                task.status,
                task.dueAt,
                task.assignee);
    }

    /** @return 任务 ID */
    public String id() {
        return id;
    }
}
```

字段名、状态枚举和 JSON 外形都没有变化；这里只补足回放所需的反序列化入口和反馈程序读取 ID 的方法。现代线的
record 不需要这项修改。`TaskCreationPort`、生产 adapter、三个幂等异常和 `CurrentActorProvider` 没有使用现代
语法，可以沿用同一份源码。

```java
package com.teamflow.api;

import com.teamflow.api.TeamFlowApplication.TaskResponse;

/** 保存 Java 8 线的一次成功创建或回放结果。 */
public final class TaskCreationResult {
    private final TaskResponse task;
    private final boolean replayed;

    /** 保存完整任务和回放标记。 */
    public TaskCreationResult(TaskResponse task, boolean replayed) {
        this.task = task;
        this.replayed = replayed;
    }

    /** @return 完整任务响应 */
    public TaskResponse getTask() {
        return task;
    }

    /** @return 是否来自已保存结果 */
    public boolean isReplayed() {
        return replayed;
    }

    /** @return 完整任务响应，与现代 record accessor 同名 */
    public TaskResponse task() {
        return task;
    }

    /** @return 是否来自已保存结果，与现代 record accessor 同名 */
    public boolean replayed() {
        return replayed;
    }
}
```

### 2. ObjectMapper 服务保留同一控制流

把现代线的服务完整替换为下面版本。它显式使用 Jackson 2 `ObjectMapper`、Java 8 DTO 的公开字段与
`long + TimeUnit`，首次占用、状态缺失时的一次重试、结果写入和 Redis 异常边界都没有省略。

```java
package com.teamflow.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamflow.api.TeamFlowApplication.CreateTaskRequest;
import com.teamflow.api.TeamFlowApplication.TaskResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Locale;
import java.util.concurrent.TimeUnit;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/** 为 Java 8 任务创建接口提供同形的有限时间幂等窗口。 */
@Service
public final class TaskCreationIdempotencyService {
    private static final long PROCESSING_TTL_MILLIS = TimeUnit.MINUTES.toMillis(2);
    private static final long RESULT_TTL_MILLIS = TimeUnit.HOURS.toMillis(24);
    private static final String KEY_PREFIX = "teamflow:idempotency:v1:task-create:";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final TaskCreationPort taskCreationPort;

    /** 保存 Redis、Jackson 2 和已有任务创建端口。 */
    public TaskCreationIdempotencyService(
            StringRedisTemplate redisTemplate,
            ObjectMapper objectMapper,
            TaskCreationPort taskCreationPort) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.taskCreationPort = taskCreationPort;
    }

    /**
     * 处理一次已经通过 DTO 校验的项目任务创建请求。
     *
     * @return 首次创建或已保存的完整任务
     */
    public TaskCreationResult create(
            String actorId,
            String projectId,
            String idempotencyKey,
            CreateTaskRequest request) {
        validateKey(idempotencyKey);
        String fingerprint = requestFingerprint(request);
        String redisKey = redisKey(actorId, projectId, idempotencyKey);
        String pending = "PENDING|" + fingerprint;

        String stored = read(redisKey);
        if (stored != null) {
            return replayOrThrow(stored, fingerprint);
        }

        taskCreationPort.validate(projectId, request);

        if (claim(redisKey, pending)) {
            return executeFirstRequest(redisKey, fingerprint, projectId, request);
        }

        stored = read(redisKey);
        if (stored != null) {
            return replayOrThrow(stored, fingerprint);
        }

        if (claim(redisKey, pending)) {
            return executeFirstRequest(redisKey, fingerprint, projectId, request);
        }

        stored = read(redisKey);
        if (stored == null) {
            throw new IdempotencyConflictException("IDEMPOTENCY_STATE_MISSING", false);
        }
        return replayOrThrow(stored, fingerprint);
    }

    /** 只有获得 SET NX 的请求才进入已有业务副作用。 */
    private TaskCreationResult executeFirstRequest(
            String redisKey,
            String fingerprint,
            String projectId,
            CreateTaskRequest request) {
        try {
            TaskResponse task = taskCreationPort.create(projectId, request);
            String responseJson = objectMapper.writeValueAsString(task);
            writeResult(redisKey, "COMPLETED|" + fingerprint + "|" + encode(responseJson));
            return new TaskCreationResult(task, false);
        } catch (TaskCreationException error) {
            writeResult(redisKey, "FAILED|" + fingerprint + "|" + encode(error.getCode()));
            throw new IdempotencyConflictException(error.getCode(), false);
        } catch (JsonProcessingException error) {
            throw new IllegalStateException("幂等结果序列化失败", error);
        }
    }

    /** 解析已有状态，回放同一请求并拒绝其他状态。 */
    private TaskCreationResult replayOrThrow(String stored, String fingerprint) {
        String[] parts = stored.split("\\|", -1);
        if (parts.length < 2) {
            throw new IdempotencyConflictException("IDEMPOTENCY_STATE_INVALID", false);
        }
        if (!fingerprint.equals(parts[1])) {
            throw new IdempotencyConflictException("IDEMPOTENCY_KEY_REUSED", false);
        }
        switch (parts[0]) {
            case "PENDING":
                if (parts.length != 2) {
                    throw new IdempotencyConflictException("IDEMPOTENCY_STATE_INVALID", false);
                }
                throw new IdempotencyConflictException("IDEMPOTENCY_IN_PROGRESS", false);
            case "COMPLETED":
                if (parts.length != 3) {
                    throw new IdempotencyConflictException("IDEMPOTENCY_STATE_INVALID", false);
                }
                try {
                    TaskResponse task = objectMapper.readValue(decode(parts[2]), TaskResponse.class);
                    if (!isValidTaskResponse(task)) {
                        throw new IdempotencyConflictException("IDEMPOTENCY_STATE_INVALID", false);
                    }
                    return new TaskCreationResult(task, true);
                } catch (IOException | IllegalArgumentException error) {
                    throw new IdempotencyConflictException("IDEMPOTENCY_STATE_INVALID", false);
                }
            case "FAILED":
                if (parts.length != 3) {
                    throw new IdempotencyConflictException("IDEMPOTENCY_STATE_INVALID", false);
                }
                try {
                    String code = decode(parts[2]);
                    throw new IdempotencyConflictException(code, true);
                } catch (IllegalArgumentException error) {
                    throw new IdempotencyConflictException("IDEMPOTENCY_STATE_INVALID", false);
                }
            default:
                throw new IdempotencyConflictException("IDEMPOTENCY_STATE_INVALID", false);
        }
    }

    /** 确认完成态保存的是可完整回放的任务响应。 */
    private boolean isValidTaskResponse(TaskResponse task) {
        return task != null
                && StringUtils.hasText(task.id)
                && StringUtils.hasText(task.projectId)
                && StringUtils.hasText(task.title)
                && task.status != null
                && StringUtils.hasText(task.dueAt)
                && StringUtils.hasText(task.assignee);
    }

    /** 使用 SET NX 与处理 TTL 原子占用。 */
    private boolean claim(String redisKey, String pending) {
        try {
            Boolean claimed = redisTemplate.opsForValue().setIfAbsent(
                    redisKey,
                    pending,
                    PROCESSING_TTL_MILLIS,
                    TimeUnit.MILLISECONDS);
            return Boolean.TRUE.equals(claimed);
        } catch (DataAccessException error) {
            throw new IdempotencyStoreUnavailableException(error);
        }
    }

    /** 读取当前占用者状态。 */
    private String read(String redisKey) {
        try {
            return redisTemplate.opsForValue().get(redisKey);
        } catch (DataAccessException error) {
            throw new IdempotencyStoreUnavailableException(error);
        }
    }

    /** 使用有限结果 TTL 保存完成或稳定失败。 */
    private void writeResult(String redisKey, String stored) {
        try {
            redisTemplate.opsForValue().set(
                    redisKey,
                    stored,
                    RESULT_TTL_MILLIS,
                    TimeUnit.MILLISECONDS);
        } catch (DataAccessException error) {
            throw new IdempotencyStoreUnavailableException(error);
        }
    }

    /** 校验 header 形状，原始键不进入日志。 */
    private void validateKey(String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.length() < 1
                || idempotencyKey.length() > 128 || !isVisibleAscii(idempotencyKey)) {
            throw new InvalidIdempotencyKeyException();
        }
    }

    /** 判断键是否全部由可见 ASCII 字符组成。 */
    private boolean isVisibleAscii(String value) {
        for (int index = 0; index < value.length(); index++) {
            char item = value.charAt(index);
            if (item < 0x21 || item > 0x7e) {
                return false;
            }
        }
        return true;
    }

    /** 由当前用户、项目与客户端键生成不含原始标识的 Redis key。 */
    private String redisKey(String actorId, String projectId, String idempotencyKey) {
        String scope = "v1|actor=" + encodeField(actorId)
                + "|project=" + encodeField(projectId)
                + "|key=" + encodeField(idempotencyKey);
        return KEY_PREFIX + sha256(scope);
    }

    /** 以已有请求 DTO 的固定字段顺序生成指纹。 */
    private String requestFingerprint(CreateTaskRequest request) {
        String canonical = "v1|title=" + encodeField(request.title)
                + "|dueAt=" + encodeField(request.dueAt)
                + "|assignee=" + encodeField(request.assignee);
        return sha256(canonical);
    }

    /** 将任意 UTF-8 字段编码为不含分隔符的值。 */
    private String encodeField(String value) {
        if (value == null) {
            return "~";
        }
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    /** 保存 JSON 或错误码时避免破坏状态值分隔符。 */
    private String encode(String value) {
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    /** 解码受 TTL 保护的单条状态字段。 */
    private String decode(String value) {
        return new String(Base64.getUrlDecoder().decode(value), StandardCharsets.UTF_8);
    }

    /** 生成小写十六进制 SHA-256 摘要。 */
    private String sha256(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder(digest.length * 2);
            for (byte item : digest) {
                result.append(String.format(Locale.ROOT, "%02x", item & 0xff));
            }
            return result.toString();
        } catch (NoSuchAlgorithmException error) {
            throw new IllegalStateException("JDK 必须提供 SHA-256", error);
        }
    }
}
```

### 3. 兼容 Controller 和错误映射同样完整

Java 8 线也只修改原 `TeamFlowApplication.TaskController`，保留 `ApiService service` 和其他 CRUD。字段与构造器增量
和现代线相同；只替换原创建方法：

```java
/** 创建项目任务并保留原公开合同。 */
@Operation(operationId = "createProjectTask", summary = "创建项目任务")
@ApiResponses({
    @ApiResponse(responseCode = "201", description = "创建成功"),
    @ApiResponse(
            responseCode = "400",
            description = "请求体或幂等键校验失败",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ApiProblem.class))),
    @ApiResponse(
            responseCode = "404",
            description = "项目不存在",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ApiProblem.class))),
    @ApiResponse(
            responseCode = "409",
            description = "幂等键正在处理、被不同请求复用或命中稳定业务失败",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ApiProblem.class))),
    @ApiResponse(
            responseCode = "415",
            description = "请求媒体类型不支持",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ApiProblem.class))),
    @ApiResponse(
            responseCode = "503",
            description = "幂等存储暂不可用",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ApiProblem.class)))
})
@PostMapping(
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE)
ResponseEntity<TaskResponse> create(
        @PathVariable("projectId") String projectId,
        @RequestHeader(value = "Idempotency-Key", required = false) String key,
        @Valid @RequestBody CreateTaskRequest request) {
    TaskCreationResult result = idempotencyService.create(
            currentActorProvider.requireActorId(),
            projectId,
            key,
            request);
    URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{taskId}")
            .buildAndExpand(result.getTask().id)
            .toUri();
    return ResponseEntity.created(location)
            .header("Idempotency-Replayed", Boolean.toString(result.isReplayed()))
            .body(result.getTask());
}
```

把下面三个方法加入 Java 8 线已有的全局处理器。它们复用前置课的 `problem(...)` helper 和强类型
`ApiProblem`，不会退化成临时 Map 或缺字段的错误 body。

```java
/** 把缺失或非法幂等键转换为稳定 400。 */
@ExceptionHandler(InvalidIdempotencyKeyException.class)
ResponseEntity<Object> handleInvalidIdempotencyKey(
        InvalidIdempotencyKeyException exception,
        HttpServletRequest request) {
    return problem(
            HttpStatus.BAD_REQUEST,
            new HttpHeaders(),
            "invalid-idempotency-key",
            "幂等键无效",
            exception.getMessage(),
            "INVALID_IDEMPOTENCY_KEY",
            Collections.<FieldProblem>emptyList(),
            request);
}

/** 把处理中、键复用和已保存业务失败转换为稳定 409。 */
@ExceptionHandler(IdempotencyConflictException.class)
ResponseEntity<Object> handleIdempotencyConflict(
        IdempotencyConflictException exception,
        HttpServletRequest request) {
    HttpHeaders headers = new HttpHeaders();
    headers.set("Idempotency-Replayed", Boolean.toString(exception.isReplayed()));
    return problem(
            HttpStatus.CONFLICT,
            headers,
            "idempotency-conflict",
            "幂等请求冲突",
            "该幂等键当前不能用于本次任务创建",
            exception.getCode(),
            Collections.<FieldProblem>emptyList(),
            request);
}

/** 把 Redis 连接、超时或鉴权失败转换为稳定 503。 */
@ExceptionHandler(IdempotencyStoreUnavailableException.class)
ResponseEntity<Object> handleIdempotencyStoreUnavailable(
        IdempotencyStoreUnavailableException exception,
        HttpServletRequest request) {
    return problem(
            HttpStatus.SERVICE_UNAVAILABLE,
            new HttpHeaders(),
            "idempotency-store-unavailable",
            "幂等服务暂不可用",
            "暂时无法确认该任务创建请求的幂等状态",
            "IDEMPOTENCY_STORE_UNAVAILABLE",
            Collections.<FieldProblem>emptyList(),
            request);
}
```

上述增量需要 `java.util.Collections`、`javax.servlet.http.HttpServletRequest`、`HttpHeaders`、`HttpStatus`、
`ResponseEntity` 和 `ExceptionHandler` import；参数顺序与 Java 8 前置工程的
`problem(HttpStatus, HttpHeaders, ..., HttpServletRequest)` 一致。兼容工程使用下面的真实 Redis 属性；现代
Boot 4.1.x 则使用
`spring.data.redis.*`：

```properties
spring.redis.host=${TEAMFLOW_REDIS_HOST:127.0.0.1}
spring.redis.port=${TEAMFLOW_REDIS_PORT:6379}
spring.redis.password=${TEAMFLOW_REDIS_PASSWORD:}
spring.redis.timeout=2s
```

两条工程可以共享 Redis server，但必须在验证前只清理本课唯一前缀，不能并行使用同一个用户、项目和 key。
Redis 连接失败时两条线都返回相同结构的 503，不能因 JVM 本地存在一份 Map 就继续创建。

## 六、用真实 Redis 和 HTTP 观察边界

### 1. 启动隔离 Redis

下面的容器只用于本课。先确认容器名和端口未被其他课程占用；不要停止或清理不属于本课的容器：

```bash
docker network create teamflow-api-idempotency-net
docker run -d --name teamflow-api-idempotency-redis \
  --network teamflow-api-idempotency-net -p 16384:6379 \
  redis:8-alpine redis-server --requirepass course-pass
docker exec teamflow-api-idempotency-redis \
  redis-cli -a course-pass --no-auth-warning PING
```

必须得到 `PONG`。重复执行反馈前，只清理本课专用前缀下的记录，不使用 `FLUSHDB`，也不删除其他课程的 key：

```bash
COURSE_PATTERN='teamflow:idempotency:v1:task-create:*'
docker exec teamflow-api-idempotency-redis \
  redis-cli -a course-pass --no-auth-warning --scan --pattern "$COURSE_PATTERN" |
while IFS= read -r redis_key; do
  docker exec teamflow-api-idempotency-redis \
    redis-cli -a course-pass --no-auth-warning DEL "$redis_key"
done
```

应用使用端口 `18095`，数据库变量沿用前置课程已经验证的 TeamFlow schema：

```bash
SPRING_PROFILES_ACTIVE=course \
TEAMFLOW_DB_URL='jdbc:mysql://127.0.0.1:33320/teamflow_modern?useSSL=false&allowPublicKeyRetrieval=true' \
TEAMFLOW_DB_USER=teamflow \
TEAMFLOW_DB_PASSWORD=teamflow-pass \
TEAMFLOW_PORT=18095 \
TEAMFLOW_REDIS_HOST=127.0.0.1 \
TEAMFLOW_REDIS_PORT=16384 \
TEAMFLOW_REDIS_PASSWORD=course-pass \
mvn -Dstart-class=com.teamflow.api.TeamFlowApplication spring-boot:run
```

启动命令必须从完整现代工程根目录执行。工程现在同时存在正常 Web 入口和第九章反馈入口，因此用 `start-class` 明确
选择正常入口；Java 8 线停止现代应用后改用独立 schema、端口 `18096` 和 Boot 2.3.12 工程，命令其余部分保持一致。

### 2. 首次创建和同键回放

```bash
KEY='task-create-20260821-001'
URL='http://127.0.0.1:18095/api/v1/projects/PRJ-1/tasks'
BODY='{"title":"整理课程","dueAt":"2026-09-01T18:00:00+08:00","assignee":"lin"}'

curl -i -sS -X POST "$URL" \
  -H "Idempotency-Key: $KEY" \
  -H 'Content-Type: application/json' \
  -d "$BODY"

curl -i -sS -X POST "$URL" \
  -H "Idempotency-Key: $KEY" \
  -H 'Content-Type: application/json' \
  -d "$BODY"
```

第一次必须是 `201`，返回完整任务字段，Location 以 `/projects/PRJ-1/tasks/<taskId>` 结尾；第二次仍是
`201`、相同 Location 和相同 body，并出现 `Idempotency-Replayed: true`。第二次不能新增任务。Redis 中只检查
摘要 key，不要把原始 header 拼进 `KEYS`：

```bash
docker exec teamflow-api-idempotency-redis \
  redis-cli -a course-pass --no-auth-warning --scan \
  --pattern 'teamflow:idempotency:v1:task-create:*'
```

每个结果 key 的 TTL 应为正数且不超过 `86400`；value 应以 `COMPLETED|` 开头，不能出现 `task-create-20260821-001`
或用户原始 JSON。

### 3. 同键不同 body 冲突

```bash
curl -i -sS -X POST "$URL" \
  -H "Idempotency-Key: $KEY" \
  -H 'Content-Type: application/json' \
  -d '{"title":"发布课程","dueAt":"2026-09-01T18:00:00+08:00","assignee":"lin"}'
```

响应必须是 `409`，body code 为 `IDEMPOTENCY_KEY_REUSED`，任务总数不增加。不要删除旧 key 再让第二个 body 成功；
那会掩盖客户端复用键的错误。

### 4. 并发首次请求

先换一个新键，再并发发出两个完全相同的请求：

```bash
KEY='task-create-20260821-concurrent'
curl -sS -X POST "$URL" -H "Idempotency-Key: $KEY" \
  -H 'Content-Type: application/json' -d "$BODY" > /tmp/idempotency-a.json &
curl -sS -X POST "$URL" -H "Idempotency-Key: $KEY" \
  -H 'Content-Type: application/json' -d "$BODY" > /tmp/idempotency-b.json &
wait
cat /tmp/idempotency-a.json /tmp/idempotency-b.json
```

根据业务端口速度，两个响应可能是一个 `201` 和一个 `409 IDEMPOTENCY_IN_PROGRESS`，也可能是两个 `201`（第二个
已经等到 `COMPLETED`）。无论响应顺序如何，数据库或任务端口只能观察到一次创建。课程不要求客户端自动轮询；生产
接口可以另行设计 `Retry-After` 或查询端点，但不能在本课中把等待策略伪装成原子事务。

### 5. PENDING、FAILED 和过期

先再次只清理本课专用前缀，再用一枚新 key 完成真实创建。清理后只有当前请求的一条记录，因此可以准确取得
它的 Redis key 和指纹，再把完成记录改成 PENDING：

```bash
docker exec teamflow-api-idempotency-redis \
  redis-cli -a course-pass --no-auth-warning --scan --pattern "$COURSE_PATTERN" |
while IFS= read -r redis_key; do
  docker exec teamflow-api-idempotency-redis \
    redis-cli -a course-pass --no-auth-warning DEL "$redis_key"
done

KEY='task-create-20260821-state'
curl -sS -X POST "$URL" -H "Idempotency-Key: $KEY" \
  -H 'Content-Type: application/json' -d "$BODY"
REDIS_KEY=$(docker exec teamflow-api-idempotency-redis \
  redis-cli -a course-pass --no-auth-warning --scan \
  --pattern "$COURSE_PATTERN")
test "$(printf '%s\n' "$REDIS_KEY" | sed '/^$/d' | wc -l | tr -d ' ')" -eq 1
STORED=$(docker exec teamflow-api-idempotency-redis \
  redis-cli -a course-pass --no-auth-warning GET "$REDIS_KEY")
FINGERPRINT=$(printf '%s' "$STORED" | cut -d '|' -f 2)
docker exec teamflow-api-idempotency-redis redis-cli -a course-pass --no-auth-warning \
  SET "$REDIS_KEY" "PENDING|$FINGERPRINT" EX 120
```

使用与该记录同指纹的请求得到 `409 IDEMPOTENCY_IN_PROGRESS`；不同 body 得到 `409 IDEMPOTENCY_KEY_REUSED`。真实业务
失败会由端口返回稳定 code，服务保存 `FAILED|fingerprint|...` 并在 24 小时内回放相同 code。

过期反馈必须换一枚 key，避免继续命中刚才手工写入的 PENDING。先再次清理本课前缀，再创建唯一记录并缩短它的
TTL：

```bash
docker exec teamflow-api-idempotency-redis \
  redis-cli -a course-pass --no-auth-warning --scan --pattern "$COURSE_PATTERN" |
while IFS= read -r redis_key; do
  docker exec teamflow-api-idempotency-redis \
    redis-cli -a course-pass --no-auth-warning DEL "$redis_key"
done

KEY='task-create-20260821-ttl'
curl -sS -X POST "$URL" -H "Idempotency-Key: $KEY" \
  -H 'Content-Type: application/json' -d "$BODY"
REDIS_KEY=$(docker exec teamflow-api-idempotency-redis \
  redis-cli -a course-pass --no-auth-warning --scan \
  --pattern "$COURSE_PATTERN")
test "$(printf '%s\n' "$REDIS_KEY" | sed '/^$/d' | wc -l | tr -d ' ')" -eq 1
docker exec teamflow-api-idempotency-redis \
  redis-cli -a course-pass --no-auth-warning EXPIRE "$REDIS_KEY" 2
sleep 3
curl -i -sS -X POST "$URL" -H "Idempotency-Key: $KEY" \
  -H 'Content-Type: application/json' -d "$BODY"
```

最后一次请求会重新占用并创建新任务；这证明 TTL 是去重保证的终点，不是永久历史。若第一次 NX 失败后紧随其后的
GET 恰好遇到旧记录过期或删除，服务会再尝试一次 NX：抢到就按首次请求执行，没抢到就读取当前占用者并回放。
只有第二次读取仍为 null 时才返回 `IDEMPOTENCY_STATE_MISSING`，整个过程没有递归和无限重试。

### 6. Redis 故障反馈

停止本课 Redis 后重发一次新 key：

```bash
docker stop teamflow-api-idempotency-redis
curl -i -sS -X POST "$URL" \
  -H 'Idempotency-Key: task-create-20260821-redis-down' \
  -H 'Content-Type: application/json' \
  -d "$BODY"
```

响应必须是现有错误边界定义的 `503` 或依赖不可用错误。恢复 Redis 后再重试；不要看到 `503` 就断言任务一定没有
创建，也不要在 Controller 中创建本地 Map 继续返回 `201`。完成反馈后启动 Java 8 线，以端口 `18096` 重跑同一组
首次、回放、冲突、并发和故障请求，JSON 与状态码合同必须相同。

## 七、集中排查四个接口幂等错误

### 四个典型错误

:::pitfalls
### 先 GET 再 SET，试图手工模拟占用

**触发条件：** Controller 先调用 `get(key)`，读到 null 后再调用 `set(key, ...)`。

**原因：** 两个 JVM 可以同时读到不存在；普通往返之间没有原子条件。

**后果：** 两个请求都进入创建端口，最终产生两条任务。

**错误示例：**

```java
if (redis.opsForValue().get(key) == null) {
    redis.opsForValue().set(key, "PENDING");
    taskCreationPort.create(projectId, request);
}
```

**正确写法：**

```java
Boolean claimed = redis.opsForValue().setIfAbsent(
        key, pending, 2, TimeUnit.MINUTES);
if (Boolean.TRUE.equals(claimed)) {
    return executeFirstRequest(key, fingerprint, projectId, request);
}
return replayOrThrow(redis.opsForValue().get(key), fingerprint);
```

**验证方式：** 对同一新 key 并发发送两个完全相同的 curl；业务端口的创建计数必须为 1，响应只允许一个首次执行。

### 只按 key 回放，不比较请求指纹

**触发条件：** 只要 Redis key 存在就返回第一次 body，不读取保存的 fingerprint。

**原因：** 客户端复用了 key 时，服务端无法区分重试和新的业务意图。

**后果：** 修改后的第二个请求被错误地当作第一次请求，调用方可能误以为新任务已经创建。

**错误示例：**

```java
String stored = redis.opsForValue().get(key);
return stored == null ? create(request) : replay(stored);
```

**正确写法：**

```java
String stored = redis.opsForValue().get(key);
String[] parts = stored.split("\\|", -1);
if (!fingerprint.equals(parts[1])) {
    throw new IdempotencyConflictException("IDEMPOTENCY_KEY_REUSED", false);
}
return replayOrThrow(stored, fingerprint);
```

**验证方式：** 先用 `整理课程` 创建，再用同 key 提交 `发布课程`；必须是 `409 IDEMPOTENCY_KEY_REUSED`，任务数量不变。

### 把 Redis key 当作原始 header 或用户标识

**触发条件：** 直接拼接 `"idempotency:" + actorId + ":" + projectId + ":" + idempotencyKey`。

**原因：** key 可能包含邮箱、订单号或日志中不应长期保留的业务标识。

**后果：** Redis 备份、监控和排错导出扩大 PII 暴露面，还可能因为特殊字符破坏命名约定。

**错误示例：**

```java
String key = "teamflow:idempotency:" + actorId + ":" + projectId + ":" + idempotencyKey;
```

**正确写法：**

```java
String key = KEY_PREFIX + sha256(
        "v1|actor=" + encodeField(actorId)
                + "|project=" + encodeField(projectId)
                + "|key=" + encodeField(idempotencyKey));
```

**验证方式：** 用包含 `@` 和业务编号的 header 创建请求；`SCAN` 返回的 key 只能有固定前缀和 64 位摘要，不能出现
原始用户或 header 文本。

### Redis 失败时回退本机 Map

**触发条件：** 捕获 `RedisConnectionFailureException` 后使用 `ConcurrentHashMap` 继续执行请求。

**原因：** 每个 JVM 的 Map 只在本进程存在，重启和多实例都看不到彼此的记录。

**后果：** 同一个 key 可以在两个实例分别创建，Redis 恢复后的状态也无法解释哪些副作用已经发生。

**错误示例：**

```java
try {
    return redisBackedCreate(request);
} catch (RuntimeException error) {
    return localMap.computeIfAbsent(key, ignored -> create(request));
}
```

**正确写法：**

```java
try {
    return redisBackedCreate(request);
} catch (DataAccessException error) {
    throw new IdempotencyStoreUnavailableException(error);
}
```

**验证方式：** 停止 Redis 后发送新 key；HTTP 必须返回 `503`，日志不能出现本地创建成功，恢复 Redis 后再按状态源
核对是否存在未完成副作用。
:::

## 八、独立练习

:::exercise
### 为幂等反馈补齐任务创建端口

**要求：** 只实现一个课程用 `TaskCreationPort`，不要改写正文已经完成的幂等服务、Controller 或全局异常映射。
端口继续接收 `projectId` 和完整 `CreateTaskRequest`：正常标题按递增序列生成任务 ID，返回包含 `id`、
`projectId`、`title`、`status`、`dueAt` 和 `assignee` 的 `TaskResponse`，初始状态固定为 `TODO`；标题为“冲突”
时抛出 `TaskCreationException`，错误码为 `TASK_TITLE_CONFLICT`。端口只表达业务副作用，不能读取
`Idempotency-Key`、Redis 或回放状态。

**验收：** 直接调用两次正常请求会得到两个不同 ID，证明端口本身没有偷偷去重；接入正文服务后，同一用户、项目、
key 和 body 连续调用两次只让端口计数增加 1，并回放同一枚完整任务。标题为“冲突”的请求首次与重试都返回
`TASK_TITLE_CONFLICT`，端口计数不增加。现代线使用 record accessor；Java 8 线使用第五章补充的同名兼容访问器，
服务内部仍使用前置 DTO 的公开字段，公开 JSON 字段保持一致。

**参考答案：**

```java
package com.teamflow.api;

import com.teamflow.api.TeamFlowApplication.CreateTaskRequest;
import com.teamflow.api.TeamFlowApplication.TaskResponse;
import com.teamflow.api.TeamFlowApplication.TaskStatus;
import java.util.concurrent.atomic.AtomicInteger;

/** 只用于课程反馈的确定性业务端口；生产实现应接数据库事务。 */
public final class CourseTaskCreationPort implements TaskCreationPort {
    private final AtomicInteger sequence = new AtomicInteger(900);

    /** 课程端口没有项目仓储，因此不执行额外的创建前校验。 */
    @Override
    public void validate(String projectId, CreateTaskRequest request) {
    }

    /** 生成可观察的任务 ID并保留前置项目课的完整任务字段。 */
    @Override
    public TaskResponse create(String projectId, CreateTaskRequest request)
            throws TaskCreationException {
        if ("冲突".equals(request.title())) {
            throw new TaskCreationException("TASK_TITLE_CONFLICT");
        }
        String taskId = "TASK-" + sequence.incrementAndGet();
        return new TaskResponse(
                taskId,
                projectId,
                request.title(),
                TaskStatus.TODO,
                request.dueAt(),
                request.assignee());
    }

    /** @return 已经真实进入端口的成功创建次数 */
    public int createdCount() {
        return sequence.get() - 900;
    }
}
```
:::

参考实现仍必须复用正文的 `TaskCreationIdempotencyService`，不能把 `AtomicInteger` 移到幂等服务中，也不能把
`CourseTaskCreationPort` 加入生产应用或当作跨重启持久化证明。第五章加入的兼容访问器让这份端口源码可直接用于
Java 8 线；Java 8 服务内部仍使用前置 DTO 的公开字段。

## 九、完整程序与运行结果

下面的反馈程序直接复用正文 `TaskCreationIdempotencyService` 和练习中的 `CourseTaskCreationPort`，并操作真实
`StringRedisTemplate`。它只适合连接本课隔离 Redis：为了让反馈代码可读，它使用 `KEYS` 找到本课固定前缀，生产
请求路径不能这样扫描 Redis。反馈入口显式 import 课程端口和幂等服务，不扫描生产的
`PersistentTaskCreationPort` 或 MySQL Service。把文件保存为
`src/main/java/com/teamflow/api/IdempotencyFeedbackApplication.java`：

```java
package com.teamflow.api;

import com.teamflow.api.TeamFlowApplication.CreateTaskRequest;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.StringRedisTemplate;

/** 用真实 Redis 串联接口幂等的全部核心状态。 */
@SpringBootConfiguration
@EnableAutoConfiguration(excludeName = {
        "org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration",
        "org.springframework.boot.flyway.autoconfigure.FlywayAutoConfiguration",
        "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration",
        "org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration"
})
@Import({TaskCreationIdempotencyService.class, CourseTaskCreationPort.class})
@Profile("idempotency-feedback")
public class IdempotencyFeedbackApplication implements CommandLineRunner {
    private static final String KEY_PREFIX = "teamflow:idempotency:v1:task-create:";
    private static final String ACTOR_ID = "USR-1";
    private static final String PROJECT_ID = "PRJ-1";

    private final TaskCreationIdempotencyService service;
    private final CourseTaskCreationPort taskCreationPort;
    private final StringRedisTemplate redisTemplate;

    /** 保存正文服务、练习端口和真实 Redis client。 */
    public IdempotencyFeedbackApplication(
            TaskCreationIdempotencyService service,
            CourseTaskCreationPort taskCreationPort,
            StringRedisTemplate redisTemplate) {
        this.service = service;
        this.taskCreationPort = taskCreationPort;
        this.redisTemplate = redisTemplate;
    }

    /** 启动非 Web 反馈程序并在运行完成后关闭上下文。 */
    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(
                IdempotencyFeedbackApplication.class,
                args);
        context.close();
    }

    /** 串联首次、回放、冲突、PENDING、FAILED 与 TTL。 */
    @Override
    public void run(String... args) throws Exception {
        clearCourseKeys();
        try {
            CreateTaskRequest request = new CreateTaskRequest(
                    "整理课程",
                    "2026-09-01T18:00:00+08:00",
                    "lin");

            Set<String> beforeFirst = courseKeys();
            TaskCreationResult first = service.create(
                    ACTOR_ID, PROJECT_ID, "feedback-first", request);
            String firstKey = onlyNewKey(beforeFirst);
            TaskCreationResult replay = service.create(
                    ACTOR_ID, PROJECT_ID, "feedback-first", request);
            require(first.task().id().equals(replay.task().id()), "回放任务 ID 不一致");
            require(!first.replayed() && replay.replayed(), "首次与回放标记错误");
            System.out.println("FIRST replayed=false id=" + first.task().id());
            System.out.println("REPLAY replayed=true id=" + replay.task().id());

            expectConflict(
                    "IDEMPOTENCY_KEY_REUSED",
                    false,
                    () -> service.create(
                            ACTOR_ID,
                            PROJECT_ID,
                            "feedback-first",
                            new CreateTaskRequest(
                                    "发布课程",
                                    "2026-09-01T18:00:00+08:00",
                                    "lin")));
            System.out.println("REUSED code=IDEMPOTENCY_KEY_REUSED");

            String completed = redisTemplate.opsForValue().get(firstKey);
            require(completed != null, "首次 COMPLETED 记录不存在");
            String fingerprint = completed.split("\\|", -1)[1];
            redisTemplate.opsForValue().set(
                    firstKey,
                    "PENDING|" + fingerprint,
                    2,
                    TimeUnit.MINUTES);
            expectConflict(
                    "IDEMPOTENCY_IN_PROGRESS",
                    false,
                    () -> service.create(
                            ACTOR_ID, PROJECT_ID, "feedback-first", request));
            System.out.println("PENDING code=IDEMPOTENCY_IN_PROGRESS");

            CreateTaskRequest failedRequest = new CreateTaskRequest(
                    "冲突",
                    "2026-09-02T18:00:00+08:00",
                    "lin");
            expectConflict(
                    "TASK_TITLE_CONFLICT",
                    false,
                    () -> service.create(
                            ACTOR_ID, PROJECT_ID, "feedback-failed", failedRequest));
            expectConflict(
                    "TASK_TITLE_CONFLICT",
                    true,
                    () -> service.create(
                            ACTOR_ID, PROJECT_ID, "feedback-failed", failedRequest));
            System.out.println("FAILED first=false replay=true code=TASK_TITLE_CONFLICT");

            Set<String> beforeTtl = courseKeys();
            TaskCreationResult ttlFirst = service.create(
                    ACTOR_ID, PROJECT_ID, "feedback-ttl", request);
            String ttlKey = onlyNewKey(beforeTtl);
            redisTemplate.expire(ttlKey, 1, TimeUnit.SECONDS);
            Thread.sleep(1500);
            TaskCreationResult ttlSecond = service.create(
                    ACTOR_ID, PROJECT_ID, "feedback-ttl", request);
            require(!ttlFirst.task().id().equals(ttlSecond.task().id()), "TTL 后没有重新执行");
            require(!ttlSecond.replayed(), "TTL 后错误标记为回放");
            System.out.println(
                    "TTL old=" + ttlFirst.task().id() + " new=" + ttlSecond.task().id());

            require(taskCreationPort.createdCount() == 3, "业务端口成功次数不是 3");
            System.out.println("RUNTIME_PASS created=" + taskCreationPort.createdCount());
        } finally {
            clearCourseKeys();
        }
    }

    /** 断言一次调用抛出指定冲突。 */
    private void expectConflict(String code, boolean replayed, Runnable action) {
        try {
            action.run();
            throw new IllegalStateException("预期冲突没有发生: " + code);
        } catch (IdempotencyConflictException error) {
            require(code.equals(error.getCode()), "冲突错误码不一致");
            require(replayed == error.isReplayed(), "冲突回放标记不一致");
        }
    }

    /** 返回本课隔离前缀下的 key 快照。 */
    private Set<String> courseKeys() {
        Set<String> keys = redisTemplate.keys(KEY_PREFIX + "*");
        return keys == null ? new HashSet<>() : new HashSet<>(keys);
    }

    /** 从前后快照中取得本次请求唯一新增的 key。 */
    private String onlyNewKey(Set<String> before) {
        Set<String> added = courseKeys();
        added.removeAll(before);
        require(added.size() == 1, "没有观察到唯一新增的 Redis key");
        return added.iterator().next();
    }

    /** 只清理本课固定前缀。 */
    private void clearCourseKeys() {
        Set<String> keys = courseKeys();
        if (!keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    /** 在反馈不符合预期时立即失败。 */
    private void require(boolean condition, String message) {
        if (!condition) {
            throw new IllegalStateException(message);
        }
    }
}
```

先按第六章启动本课隔离 Redis，然后从现代工程根目录运行这个非 Web main：

```bash
TEAMFLOW_REDIS_HOST=127.0.0.1 \
TEAMFLOW_REDIS_PORT=16384 \
TEAMFLOW_REDIS_PASSWORD=course-pass \
mvn -q \
  -Dstart-class=com.teamflow.api.IdempotencyFeedbackApplication \
  -Dspring-boot.run.arguments="--spring.main.web-application-type=none --spring.profiles.active=idempotency-feedback" \
  spring-boot:run
```

`start-class` 在两个入口之间显式选择反馈程序，这条命令可直接用于现代线和 Java 8 线。

忽略 Spring 启动日志后，业务输出中的任务 ID 必须满足下面关系：

```text
FIRST replayed=false id=TASK-901
REPLAY replayed=true id=TASK-901
REUSED code=IDEMPOTENCY_KEY_REUSED
PENDING code=IDEMPOTENCY_IN_PROGRESS
FAILED first=false replay=true code=TASK_TITLE_CONFLICT
TTL old=TASK-902 new=TASK-903
RUNTIME_PASS created=3
```

首次与回放使用同一 ID，FAILED 不增加成功计数，TTL 到期后才产生第三枚任务。程序开始和结束都只清理本课固定
前缀；它证明正文服务真实访问 Redis，但不能替代第六章对 `201 + Location`、Problem Details 和 503 的 HTTP 验收。
专用 Profile 使正常 TeamFlow 启动只装配生产端口；Java 8 线使用第五章的普通 DTO 与服务后，可直接运行同一反馈程序，
预期关系和最终 `RUNTIME_PASS created=3` 不变。

完成两条线的反馈后，先在运行应用的终端按 `Ctrl+C` 停止应用，再只清理本课创建的临时文件、容器和网络：

```bash
find /tmp -maxdepth 1 -type f \
  \( -name 'idempotency-a.json' -o -name 'idempotency-b.json' \) -delete
docker stop teamflow-api-idempotency-redis
docker rm teamflow-api-idempotency-redis
docker network rm teamflow-api-idempotency-net
```

不要把容器名、网络名或文件条件改成通配其他课程的范围。清理完成后，`docker ps -a` 和 `docker network ls` 中不应
再出现本课名称，两个响应文件也不应继续存在。

## 十、本课小结

接口幂等的核心不是在 Controller 外面套一个 Map，而是把一次逻辑请求的身份、状态、回放窗口和失败边界写成可观察
合同。`Idempotency-Key` 先经过作用域与请求指纹约束，再由 Redis `SET NX + TTL` 原子占用；成功和稳定失败都保存
可回放结果，同键不同意图冲突，处理中请求不重复进入副作用。Redis 断开时直接暴露依赖故障，业务副作用与幂等记录
之间的非原子窗口则必须进入监控、补偿和后续架构决策，而不能用一句“幂等”掩盖。
