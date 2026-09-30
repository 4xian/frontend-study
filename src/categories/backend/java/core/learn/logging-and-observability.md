---
id: backend.java.learn.intermediate.logging-and-observability
type: lesson
title: 日志与可观测性
summary: 让一次 Web 请求产生级别正确、可结构化、可关联且不泄露敏感信息的日志，并理解日志与指标、追踪的边界
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 160
prerequisites:
  - backend.java.learn.intermediate.roles-and-permissions
objectives:
  - 能区分日志、指标与追踪三类可观测信号，并说明 correlation ID 与 trace ID 的区别。
  - 能区分 SLF4J facade、provider 与 Logback 实现，并使用合适的日志级别。
  - 能用占位符、结构化键值和 Throwable 记录可检索的日志事件。
  - 能在请求边界校验或生成 correlation ID，通过 MDC 关联日志并在 finally 中清理。
  - 能使用 Spring Boot 4.1.1 内置 Logstash JSON 输出结构化日志。
  - 能在 Spring Boot 2.3.12.RELEASE 中使用 SLF4J 1.7 占位符和 Logback pattern 保留同一诊断字段。
  - 能识别敏感数据泄露、日志注入、重复异常记录、级别滥用和 MDC 污染等问题。
recap:
  - 日志记录离散事件，指标聚合数值趋势，追踪连接跨边界调用；correlation ID 只负责日志关联，不自动形成分布式追踪。
  - 业务代码面向 SLF4J，Spring Boot starter 默认提供 Logback provider；应用通常不需要手工混入第二套 provider。
  - TRACE 与 DEBUG 服务诊断，INFO 记录关键生命周期，WARN 表示可恢复异常，ERROR 表示操作失败且需要处理。
  - 占位符避免提前拼接消息，Throwable 必须作为异常参数传入；结构化字段让日志系统可以按字段筛选。
  - MDC 与执行线程关联，请求开始时写入，响应返回或抛出异常时都必须清理，异步边界不能假设自动继承。
  - Spring Boot 4.1.1 可以直接输出 Logstash JSON；Spring Boot 2.3 使用文本 pattern 时仍能保留 correlationId。
  - 日志字段采用允许列表，不记录密码、token、连接串和完整请求对象，外部文本还要限制字符与长度。
related:
  - backend.java.learn.intermediate.roles-and-permissions
tags:
  - Java
  - Spring Boot
  - Observability
  - SLF4J
  - Logback
  - Structured Logging
  - MDC
  - Correlation ID
appliesTo: JDK 25 / Spring Boot 4.1.1 / SLF4J 2.0.18 / Logback 1.5.38 主线；Java 8 / Spring Boot 2.3.12.RELEASE / SLF4J 1.7.30 / Logback 1.2.3 兼容线
verifiedAt: 2026-08-27
sources:
  - id: spring-boot-41-logging
    title: Spring Boot 4.1 Logging
    url: https://docs.spring.io/spring-boot/4.1/reference/features/logging.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.x
    claims:
      - Spring Boot starter 默认使用 Logback，并路由常见日志 API。
      - Spring Boot 内置 ECS、GELF 与 Logstash 结构化日志格式。
      - MDC 与 SLF4J fluent key-value 可以进入结构化 JSON。
  - id: spring-boot-41-observability
    title: Spring Boot 4.1 Observability
    url: https://docs.spring.io/spring-boot/4.1/reference/actuator/observability.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.x
    claims:
      - 可观测性由日志、指标和追踪三类信号组成。
      - Spring Boot 使用 Micrometer Observation 连接指标与追踪。
  - id: spring-boot-41-system-requirements
    title: Spring Boot 4.1 System Requirements
    url: https://docs.spring.io/spring-boot/4.1/system-requirements.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.x
    claims:
      - Spring Boot 4.1.x 至少需要 Java 17，并兼容至 Java 26。
  - id: spring-boot-411-dependency-coordinates
    title: Spring Boot 4.1 Managed Dependency Coordinates
    url: https://docs.spring.io/spring-boot/4.1/appendix/dependency-versions/coordinates.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.1
    claims:
      - Spring Boot 4.1.1 管理 SLF4J 2.0.18 与 Logback 1.5.38。
  - id: slf4j-manual-2018
    title: SLF4J Manual
    url: https://www.slf4j.org/manual.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: SLF4J 2.0.18
    claims:
      - SLF4J 提供日志 API，并由 provider 执行实际输出。
      - 参数化日志使用花括号占位符，SLF4J 2 提供 fluent logging API。
  - id: slf4j-logger-api-2018
    title: SLF4J Logger API
    url: https://www.slf4j.org/apidocs/org/slf4j/Logger.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: SLF4J 2.0.18
    claims:
      - Logger 为各级别提供占位符参数和 Throwable 重载。
  - id: slf4j-mdc-api-2018
    title: SLF4J MDC API
    url: https://www.slf4j.org/apidocs/org/slf4j/MDC.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: SLF4J 2.0.18
    claims:
      - MDC 把键值写入当前线程的诊断上下文，并提供 putCloseable、remove 与 clear。
  - id: logback-architecture
    title: Logback Architecture
    url: https://logback.qos.ch/manual/architecture.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Logback 1.5.x 与 1.2.x
    claims:
      - LoggingEvent 包含级别、消息、Throwable、线程、logger 和 MDC，再交给 appender 输出。
      - logger 的有效级别决定一次日志请求是否进入后续处理。
  - id: logback-mdc
    title: Logback Mapped Diagnostic Context
    url: https://logback.qos.ch/manual/mdc.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Logback 1.5.x 与 1.2.x
    claims:
      - Logback MDC 按线程保存上下文，子线程不会自动继承父线程的 MDC。
      - 请求边界应成对写入和移除诊断字段。
  - id: owasp-logging-cheat-sheet
    title: OWASP Logging Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
    sourceOrigin: official
    sourceType: security-standard
    appliesTo: 2026-08-27 页面状态
    claims:
      - 日志不应直接保存访问令牌、密码、连接串、密钥和受保护个人数据。
      - 外部数据进入日志前需要校验、净化与长度限制，日志功能需要进入安全验证。
  - id: spring-boot-2312-logging
    title: Spring Boot 2.3.12 Logging
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/spring-boot-features.html#boot-features-logging
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Spring Boot 2.3 starter 默认使用 Logback，并支持 logging.level 与 logging.pattern.console 配置。
      - Spring Boot 2.3 不具备 Spring Boot 3.4 之后的内置 structured format 属性。
  - id: spring-boot-2312-dependencies
    title: Spring Boot 2.3.12 Dependency Versions
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/appendix-dependency-versions.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Spring Boot 2.3.12.RELEASE 管理 SLF4J 1.7.30 与 Logback 1.2.3。
  - id: spring-boot-2312-system-requirements
    title: Spring Boot 2.3.12 System Requirements
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#system-requirements
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Spring Boot 2.3.12.RELEASE 支持 Java 8 至 Java 15。
---

# 日志与可观测性

应用返回 200 只能证明当前请求得到了响应，不能回答它经过了哪些步骤、为什么变慢、失败发生在哪一层，
也不能把同一次请求散落在 Filter、Controller 和 Service 中的事件重新连起来。日志的价值不是“多打印一些文字”，
而是把运行中的关键事实记录成可筛选、可关联、可控制成本的事件。

本课只建立 Web 应用的日志反馈环：业务代码面向 SLF4J，Spring Boot 默认用 Logback 输出；请求进入时建立
correlation ID，日志事件选择正确级别并携带结构化字段，请求结束时清理 MDC。指标、追踪、健康检查、日志平台和
容器采集只说明边界，不在本课配置。

## 一、先区分三类可观测信号

### 1. 日志记录离散事件

可观测性表示从系统外部信号推断内部状态的能力。日志、指标和追踪回答的问题不同，不能用一份日志文件代替全部信号。

| 信号 | 主要形态 | 适合回答 | 本课范围 |
| --- | --- | --- | --- |
| 日志 | 带时间、级别和字段的事件 | 某次操作发生了什么，异常上下文是什么 | 完整实现 |
| 指标 | 按时间聚合的数值 | 错误率、吞吐量和延迟趋势是否异常 | 只建立概念 |
| 追踪 | 跨进程连接的 span | 一次调用经过哪些服务，时间花在哪里 | 只建立概念 |

日志适合保留离散事实，例如“任务 T-100 被读取”和“数据库查询失败”。指标适合观察一分钟内错误次数，追踪适合连接
浏览器、网关和多个服务。把每次请求所有变量都写进日志，既不能自动形成指标，也不能自动形成追踪。

### 2. correlation ID 不是 trace ID

correlation ID 是应用约定的关联值，用于筛选同一次请求产生的多条日志。它可以由可信上游传入，也可以由当前服务生成。
trace ID 则属于追踪上下文，需要采样、span 生命周期、跨进程传播和追踪后端共同工作。

本课使用 `X-Correlation-Id`，但不声称它已经实现分布式追踪。后续接入 Micrometer Tracing 时，可以让日志自动携带
标准 trace ID；在此之前，correlation ID 只是一个受控的日志关联字段。

```text
HTTP request
  -> 校验或生成 correlationId
  -> 写入 MDC
  -> Controller / Service 记录同一关联字段
  -> 写入响应 header
  -> finally 清理 MDC
```

## 二、把一次日志调用理解成事件

### 1. SLF4J 与 Logback 各管一层

业务类调用 `org.slf4j.Logger`，这层是 facade；provider 把调用交给实际实现；Spring Boot Web starter 默认带入 Logback，
由它创建日志事件并交给 appender 输出。应用代码通常不需要直接依赖 Logback 类。

```java
private static final Logger LOGGER = LoggerFactory.getLogger(TaskController.class);
```

一次通过级别检查的调用会形成 `LoggingEvent`，其中可以包含时间、级别、logger 名称、线程、消息、Throwable、MDC 和
结构化键值。最终文本或 JSON 只是 encoder 对这个事件的表示，不是业务代码应手工拼接的协议。

### 2. 级别表达处理优先级

级别不是“内容越多越严重”的排序按钮，而是团队对事件处理方式的合同。

| 级别 | 适合记录 | 不应记录 |
| --- | --- | --- |
| TRACE | 极细的本地执行路径 | 生产默认开启的业务流水 |
| DEBUG | 调试所需状态与分支 | 密码、token、完整对象 |
| INFO | 启动完成、关键业务动作和重要状态变化 | 每次循环和每个 getter |
| WARN | 已恢复、已降级但值得调查的异常情况 | 所有 4xx 或正常业务拒绝 |
| ERROR | 当前操作失败且需要处理的异常 | 已被上层记录过的同一异常 |

某个用户没有审批权限时，安全层返回 403 是已知合同，不必把它当成系统 ERROR。数据库连接中断导致当前请求失败，才适合
在负责把异常转换为响应的边界记录一次 ERROR 和完整 Throwable。

### 3. 占位符延迟构造消息

参数化日志把消息模板与参数交给 logger，只有对应级别启用时才需要完成格式化。

```java
LOGGER.info("Task viewed taskId={} status={}", taskId, status);
```

不要先拼接字符串：

```java
LOGGER.debug("Loaded task: " + expensiveTaskDescription(task));
```

即使 DEBUG 被关闭，方法调用和字符串拼接也已经发生。占位符解决的是消息构造时机，不会自动完成去敏；把完整 `task`、
请求 DTO 或用户对象传进去，仍可能通过 `toString()` 泄露字段。

### 4. Throwable 是日志事件的一部分

异常需要以 Throwable 参数传入，logger 才能保留类型、消息、cause 和堆栈。

```java
try {
    taskStore.read(taskId);
} catch (IllegalStateException exception) {
    LOGGER.error("Task read failed taskId={}", taskId, exception);
    throw exception;
}
```

最后一个参数没有对应占位符且是 Throwable 时，SLF4J 会把它作为异常处理。只写
`LOGGER.error(exception.getMessage())` 会丢失堆栈，还可能把未经审查的内部信息提升为日志主消息。

## 三、在请求边界管理关联上下文

### 1. 外部关联值必须先校验

客户端 header 是不可信输入。示例只接受 1 到 64 个 ASCII 字母、数字、点、下划线或连字符，并要求首字符为字母或数字；
空值、超长值和包含换行的值都由服务端 UUID 替换。日志中不回显被拒绝的原始值。

```java
private static final Pattern ACCEPTED_ID =
        Pattern.compile("[A-Za-z0-9][A-Za-z0-9._-]{0,63}");

/** 返回可信关联标识，外部值不合格时生成新值。 */
private String resolveCorrelationId(String candidate) {
    if (candidate != null && ACCEPTED_ID.matcher(candidate).matches()) {
        return candidate;
    }
    return UUID.randomUUID().toString();
}
```

这个允许列表同时挡住 CR 与 LF，避免攻击者伪造新的文本日志行。即使使用 JSON encoder，也应限制长度和字段范围，避免把
大段攻击载荷送进日志平台。

### 2. MDC 的所有权属于当前执行边界

Logback MDC 与当前线程关联。Servlet 容器会复用工作线程，因此只调用 `MDC.put` 而不清理，会让后续请求看到前一个请求
的 correlation ID。正确结构必须让异常路径也经过清理：

```java
String correlationId = resolveCorrelationId(request.getHeader(CORRELATION_HEADER));
response.setHeader(CORRELATION_HEADER, correlationId);
MDC.put("correlationId", correlationId);
try {
    filterChain.doFilter(request, response);
} finally {
    MDC.remove("correlationId");
}
```

`MDC.clear()` 会删除当前线程上的全部诊断字段；当 Filter 只拥有 `correlationId` 时，使用 `remove` 更准确。若同一边界创建
多个键，可以逐项清理，或明确由该边界拥有整张 MDC 后再使用 `clear`。

### 3. 异步调用需要单独传播

Logback 明确说明子线程不会自动继承父线程 MDC。把任务提交到线程池后，执行线程还可能保留自己的旧上下文，因此不能只在
提交前 `MDC.put` 就假设异步日志会正确关联。

本课完整程序只处理同步 Servlet 请求。复制上下文、TaskDecorator、虚拟线程和 tracing context propagation 都是独立的
并发或追踪能力，不在这里加入一套未经验证的传播方案。

## 四、让字段可以被机器检索

### 1. Spring Boot 4.1.1 直接输出 Logstash JSON

现代工程只需配置：

```properties
spring.application.name=teamflow-api
logging.level.example.logging=INFO
logging.structured.format.console=logstash
```

Spring Boot 会让控制台每行输出一个 JSON 对象。MDC 中的 `correlationId` 会成为字段，SLF4J 2 fluent API 添加的业务键值
也会进入同一个对象：

```java
LOGGER.atInfo()
        .addKeyValue("event", "task_viewed")
        .addKeyValue("taskId", taskId)
        .addKeyValue("status", "PENDING")
        .log("Task viewed");
```

预期事件包含如下可观察字段；时间、线程和 logger 等字段由框架补齐：

```json
{"message":"Task viewed","level":"INFO","correlationId":"demo-100","event":"task_viewed","taskId":"T-100","status":"PENDING"}
```

JSON 字段顺序不属于合同。验证时应解析 JSON，再分别断言键值，不能对整行字符串做脆弱比较。

### 2. Java 8 兼容线保留相同诊断事实

Spring Boot 2.3.12.RELEASE 使用 SLF4J 1.7.30，没有 `atInfo()` fluent API，也没有 Boot 内置的
`logging.structured.format.console`。兼容线改用占位符，并通过 Logback pattern 显示 MDC：

```properties
spring.application.name=teamflow-api
logging.level.example.logging=INFO
logging.pattern.console=%d{yyyy-MM-dd'T'HH:mm:ss.SSSXXX} level=%-5level correlationId=%X{correlationId} logger=%logger{36} - %msg%n
```

```java
LOGGER.info("event=task_viewed taskId={} status={}", taskId, "PENDING");
```

输出仍可按 correlation ID 关联，但它不是与现代 JSON 等价的结构化格式。旧系统确实需要 JSON 时，应选择与既有采集平台兼容
的 encoder 并单独验证依赖、字段和性能；本课不为示例增加第三方 encoder。

### 3. 输出位置与采集平台分开决策

Spring Boot 默认写控制台，也可以通过 `logging.file.name` 写文件。应用负责产生事件，运行环境负责决定 stdout、文件、
采集代理和保留策略。容器化课程会再说明 stdout 采集；本课不把日志平台地址、凭据或本机路径写死在应用源码中。

## 五、只记录诊断所需事实

### 1. 建立字段允许列表

适合记录的字段通常是短小、稳定、低敏的标识和状态，例如 `event`、`taskId`、`status`、`correlationId`、耗时和安全结果。
下列值不能直接进入普通应用日志：

- 密码、访问 token、刷新 token、session 标识和 Cookie；
- 数据库连接串、私钥、API key 和其他秘密；
- 完整请求体、完整用户对象和未经筛选的 `toString()`；
- 不必要的身份证件、支付信息、健康信息等个人数据；
- 未经验证的 header、查询参数和异常内部文本。

“DEBUG 只在开发环境开启”不是记录秘密的许可。日志会被复制、采集和长期保留，级别关闭也不能证明未来永远不会打开。
完整示例还会把来自路径的 `taskId` 限制为 1 到 64 个字母、数字、点、下划线或连字符。拒绝非法值时只记录稳定的
`task_id_rejected` 事件，不把原始输入复制进消息或字段。

### 2. 事件名与字段名保持稳定

消息给人阅读，字段给机器筛选。把事件名固定为 `task_viewed`，比在 message 中轮流写“查看任务”“load task”或“task read”
更容易统计和检索。字段名变更同样是数据合同变更，应与采集和告警查询一起更新。

### 3. 同一异常只在负责处置的边界记录一次

Repository、Service、Controller 和全局异常处理器如果逐层记录同一个 Throwable，一次失败会产生多份相同堆栈，错误计数失真。
中间层只补充语义并继续抛出，由最终转换响应、重试或降级的边界记录一次。

## 六、集中排查常见错误

### 六个典型错误

:::pitfalls
### 把 token 和完整请求对象写进日志

**触发条件：** 使用 `LOGGER.info("request={}", request)`，而对象包含 Authorization、Cookie、密码或个人信息。

**原因：** 占位符会调用对象的字符串表示，不会按敏感级别自动过滤字段。

**后果：** 秘密进入控制台、文件和集中日志平台，访问范围与保留时间都可能超过原业务数据。

**错误示例：**

```java
LOGGER.info("login request={}", loginRequest);
```

**正确写法：**

```java
LOGGER.info("event=login_failed usernameHash={}", usernameHash);
```

**验证方式：** 运行完整示例的成功、404 与存储故障请求，确认业务日志只记录允许字段，不出现 title、Authorization、
Bearer、Cookie 或完整 `TaskView`。

### 用字符串拼接构造关闭级别的消息

**触发条件：** DEBUG 未启用，仍调用昂贵方法拼接日志文本。

**原因：** Java 会在调用 logger 前先计算方法参数。

**后果：** 关闭的日志仍消耗 CPU，还可能触发对象读取或异常。

**错误示例：**

```java
LOGGER.debug("task=" + expensiveTaskDescription(task));
```

**正确写法：**

```java
LOGGER.debug("event=task_lookup_started taskId={}", taskId);
```

**验证方式：** 按完整示例保持 INFO 级别并发送成功请求，确认日志中没有 `task_lookup_started`；再核对 DEBUG 调用只接收
已有的 taskId，没有调用额外描述函数。

### 把正常拒绝全部记录为 ERROR

**触发条件：** 参数校验失败、资源不存在或权限不足时统一打印 ERROR 堆栈。

**原因：** 把协议内已知分支与系统故障混成同一级别。

**后果：** 告警噪声掩盖真正故障，错误率与容量判断失真。

**错误示例：**

```java
LOGGER.error("task not found taskId={}", taskId);
```

**正确写法：**

```java
LOGGER.info("event=task_not_found taskId={}", taskId);
```

**验证方式：** 分别触发 404 与模拟存储故障，确认只有后者产生 ERROR 与 Throwable。

### 在每一层重复记录同一个异常

**触发条件：** Repository 记录后抛出，Service 再记录后抛出，全局异常处理器第三次记录。

**原因：** 没有明确哪个边界负责处置失败。

**后果：** 一次故障出现多份堆栈，告警和人工排查都误判数量。

**错误示例：**

```java
catch (RuntimeException exception) {
    LOGGER.error("service failed", exception);
    throw exception;
}
```

**正确写法：**

```java
/** 读取任务，让异常继续交给统一处置边界。 */
public TaskView read(String taskId) {
    return taskStore.read(taskId);
}
```

**验证方式：** 让一次请求稳定失败，按 correlation ID 检索，确认只有负责转换或降级的边界记录一份 Throwable。

### MDC 写入后没有在 finally 清理

**触发条件：** Filter 在请求开始调用 `MDC.put`，正常返回或异常路径都没有 remove。

**原因：** MDC 与容器工作线程关联，而工作线程会服务后续请求。

**后果：** 后续日志可能携带前一个请求的 correlation ID，形成错误审计链。

**错误示例：**

```java
MDC.put("correlationId", correlationId);
filterChain.doFilter(request, response);
```

**正确写法：**

```java
MDC.put("correlationId", correlationId);
try {
    filterChain.doFilter(request, response);
} finally {
    MDC.remove("correlationId");
}
```

**验证方式：** 连续发送不同 correlation ID 的请求，并包含一条失败请求，确认每条事件只出现当前请求的值。

### 把 correlation ID 当作可信身份或分布式追踪

**触发条件：** 直接接受任意 header，并用它决定用户、权限或跨服务 trace 关系。

**原因：** correlation ID 只是诊断字段，不带身份真实性，也不包含 span 生命周期。

**后果：** 攻击者可污染日志关联，业务授权和追踪数据也会得出错误结论。

**错误示例：**

```java
String userId = request.getHeader("X-Correlation-Id");
```

**正确写法：**

```java
String correlationId = resolveCorrelationId(request.getHeader("X-Correlation-Id"));
```

**验证方式：** 发送含空格或超过 64 字符的值，确认服务生成新 ID，日志也不出现原始值；本例不把 correlation ID 写入
任何身份或授权分支。
:::

## 七、独立练习

:::exercise
### 为任务查询建立日志反馈环

**要求：** 创建现代与 Java 8 两个独立 Spring Boot 工程。实现 `GET /api/tasks/{taskId}`；在 Filter 中校验或生成
`X-Correlation-Id`，写入响应和 MDC，并在 finally 中清理。任务不存在时记录 INFO 并返回 404，模拟存储故障时只在
处置边界记录一次 ERROR 与 Throwable 并返回 503。现代线输出 Logstash JSON，并用 fluent API 写入 `event`、`taskId`
与 `status`；Java 8 线使用占位符和带 correlationId 的 console pattern。不得记录 token、Cookie、完整请求对象或
未校验 header。进入第一条业务日志前还要校验 `taskId` 的字符和长度；非法时返回 400，只记录不含原值的拒绝事件。

**验收：** 使用 `demo-100` 请求两条版本线均返回 200，响应 header 保留 `demo-100`；现代日志解析后包含
`level=INFO`、`correlationId=demo-100`、`event=task_viewed`、`taskId=T-100` 和 `status=PENDING`；Java 8 日志包含同一
correlationId 与业务事实。两版的 missing 请求只产生 INFO，failure 请求返回 503 且只产生一份 ERROR 堆栈，INFO
配置下不出现 DEBUG 事件。再发送含空格的无效 correlation ID，确认响应改为服务端 UUID；分别使用含 `!` 的 taskId
和 65 字符 taskId 请求，确认均返回 400，日志只含 `task_id_rejected`，不含三项原始无效值。

**参考答案：** 下文给出两个独立工程的完整 POM、配置、入口类、请求命令和预期结果。
:::

## 八、现代线参考实现

### 1. 创建 Maven 工程

在 IntelliJ IDEA 中把 Project SDK、模块 SDK 和 Maven Runner JRE 都设为 JDK 25，确认 POM 的 `java.version` 为
`25`，再执行 Maven Reload。目录结构如下：

```text
logging-modern/
├── pom.xml
└── src/main/
    ├── java/example/logging/LoggingApplication.java
    └── resources/application.properties
```

`pom.xml`：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>4.1.1</version>
        <relativePath/>
    </parent>
    <groupId>example</groupId>
    <artifactId>logging-modern</artifactId>
    <version>1.0.0</version>
    <properties>
        <java.version>25</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

`src/main/resources/application.properties`：

```properties
spring.application.name=teamflow-api
logging.level.example.logging=INFO
logging.structured.format.console=logstash
```

### 2. 实现请求边界和业务事件

创建 `src/main/java/example/logging/LoggingApplication.java`：

```java
package example.logging;

import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.server.ResponseStatusException;

/** 启动现代日志与请求关联示例。 */
@SpringBootApplication
public class LoggingApplication {

    /** 启动日志示例应用。 */
    public static void main(String[] args) {
        SpringApplication.run(LoggingApplication.class, args);
    }

    /** 在同步请求边界建立并清理 correlation ID。 */
    @Component
    static class CorrelationIdFilter extends OncePerRequestFilter {

        private static final String CORRELATION_HEADER = "X-Correlation-Id";
        private static final Pattern ACCEPTED_ID =
                Pattern.compile("[A-Za-z0-9][A-Za-z0-9._-]{0,63}");

        /** 写入可信 correlation ID，并保证异常路径同样清理 MDC。 */
        @Override
        protected void doFilterInternal(
                HttpServletRequest request,
                HttpServletResponse response,
                FilterChain filterChain
        ) throws ServletException, IOException {
            String correlationId = resolveCorrelationId(request.getHeader(CORRELATION_HEADER));
            response.setHeader(CORRELATION_HEADER, correlationId);
            MDC.put("correlationId", correlationId);
            try {
                filterChain.doFilter(request, response);
            } finally {
                MDC.remove("correlationId");
            }
        }

        /** 返回可信关联标识，外部值不合格时生成新值。 */
        private String resolveCorrelationId(String candidate) {
            if (candidate != null && ACCEPTED_ID.matcher(candidate).matches()) {
                return candidate;
            }
            return UUID.randomUUID().toString();
        }
    }

    /** 暴露带结构化业务日志的任务读取接口。 */
    @RestController
    @RequestMapping("/api/tasks")
    static class TaskController {

        private static final Logger LOGGER = LoggerFactory.getLogger(TaskController.class);
        private static final Pattern ACCEPTED_TASK_ID =
                Pattern.compile("[A-Za-z0-9][A-Za-z0-9._-]{0,63}");

        /** 返回任务视图，并在处置边界记录成功、未找到或存储故障事件。 */
        @GetMapping("/{taskId}")
        public TaskView read(@PathVariable String taskId) {
            String safeTaskId = requireSafeTaskId(taskId);
            LOGGER.debug("event=task_lookup_started taskId={}", safeTaskId);
            if ("missing".equals(safeTaskId)) {
                LOGGER.atInfo()
                        .addKeyValue("event", "task_not_found")
                        .addKeyValue("taskId", safeTaskId)
                        .log("Task not found");
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found");
            }
            try {
                TaskView task = loadTask(safeTaskId);
                LOGGER.atInfo()
                        .addKeyValue("event", "task_viewed")
                        .addKeyValue("taskId", task.id())
                        .addKeyValue("status", task.status())
                        .log("Task viewed");
                return task;
            } catch (IllegalStateException exception) {
                LOGGER.atError()
                        .setCause(exception)
                        .addKeyValue("event", "task_read_failed")
                        .addKeyValue("taskId", safeTaskId)
                        .log("Task read failed");
                throw new ResponseStatusException(
                        HttpStatus.SERVICE_UNAVAILABLE,
                        "Task store unavailable"
                );
            }
        }

        /** 返回可安全记录的任务标识，非法值只记录不含原文的拒绝事件。 */
        private String requireSafeTaskId(String taskId) {
            if (ACCEPTED_TASK_ID.matcher(taskId).matches()) {
                return taskId;
            }
            LOGGER.atInfo()
                    .addKeyValue("event", "task_id_rejected")
                    .log("Task ID rejected");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid task ID");
        }

        /** 读取固定任务，failure 标识用于稳定复现存储故障。 */
        private TaskView loadTask(String taskId) {
            if ("failure".equals(taskId)) {
                throw new IllegalStateException("Simulated task store failure");
            }
            return new TaskView(taskId, "发布日志规范", "PENDING");
        }
    }

    /** 表达返回给客户端的固定任务字段。 */
    public record TaskView(String id, String title, String status) {
    }
}
```

## 九、Java 8 兼容线参考实现

### 1. 创建独立工程

复制业务合同，不复制现代工程的 class 文件。在 IntelliJ IDEA 中把 Project SDK、模块 SDK 和 Maven Runner JRE 都设为
Java 8，确认 POM 的 `java.version` 为 `1.8`，再执行 Maven Reload。目录为：

```text
logging-java8/
├── pom.xml
└── src/main/
    ├── java/example/logging/LegacyLoggingApplication.java
    └── resources/application.properties
```

`pom.xml`：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.3.12.RELEASE</version>
        <relativePath/>
    </parent>
    <groupId>example</groupId>
    <artifactId>logging-java8</artifactId>
    <version>1.0.0</version>
    <properties>
        <java.version>1.8</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

`src/main/resources/application.properties`：

```properties
spring.application.name=teamflow-api
logging.level.example.logging=INFO
logging.pattern.console=%d{yyyy-MM-dd'T'HH:mm:ss.SSSXXX} level=%-5level correlationId=%X{correlationId} logger=%logger{36} - %msg%n
```

### 2. 替换版本相关 API

创建 `src/main/java/example/logging/LegacyLoggingApplication.java`。Servlet import 改为 `javax.servlet`，fluent 日志改为
占位符，record 改为普通不可变类；MDC 生命周期与请求合同保持不变。

```java
package example.logging;

import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.server.ResponseStatusException;

/** 启动 Java 8 日志与请求关联示例。 */
@SpringBootApplication
public class LegacyLoggingApplication {

    /** 启动 Java 8 日志示例应用。 */
    public static void main(String[] args) {
        SpringApplication.run(LegacyLoggingApplication.class, args);
    }

    /** 在同步请求边界建立并清理 correlation ID。 */
    @Component
    static class CorrelationIdFilter extends OncePerRequestFilter {

        private static final String CORRELATION_HEADER = "X-Correlation-Id";
        private static final Pattern ACCEPTED_ID =
                Pattern.compile("[A-Za-z0-9][A-Za-z0-9._-]{0,63}");

        /** 写入可信 correlation ID，并保证异常路径同样清理 MDC。 */
        @Override
        protected void doFilterInternal(
                HttpServletRequest request,
                HttpServletResponse response,
                FilterChain filterChain
        ) throws ServletException, IOException {
            String correlationId = resolveCorrelationId(request.getHeader(CORRELATION_HEADER));
            response.setHeader(CORRELATION_HEADER, correlationId);
            MDC.put("correlationId", correlationId);
            try {
                filterChain.doFilter(request, response);
            } finally {
                MDC.remove("correlationId");
            }
        }

        /** 返回可信关联标识，外部值不合格时生成新值。 */
        private String resolveCorrelationId(String candidate) {
            if (candidate != null && ACCEPTED_ID.matcher(candidate).matches()) {
                return candidate;
            }
            return UUID.randomUUID().toString();
        }
    }

    /** 暴露带关联日志的任务读取接口。 */
    @RestController
    @RequestMapping("/api/tasks")
    static class TaskController {

        private static final Logger LOGGER = LoggerFactory.getLogger(TaskController.class);
        private static final Pattern ACCEPTED_TASK_ID =
                Pattern.compile("[A-Za-z0-9][A-Za-z0-9._-]{0,63}");

        /** 返回任务视图，并在处置边界记录成功、未找到或存储故障事件。 */
        @GetMapping("/{taskId}")
        public TaskView read(@PathVariable String taskId) {
            String safeTaskId = requireSafeTaskId(taskId);
            LOGGER.debug("event=task_lookup_started taskId={}", safeTaskId);
            if ("missing".equals(safeTaskId)) {
                LOGGER.info("event=task_not_found taskId={}", safeTaskId);
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found");
            }
            try {
                TaskView task = loadTask(safeTaskId);
                LOGGER.info(
                        "event=task_viewed taskId={} status={}",
                        task.getId(),
                        task.getStatus()
                );
                return task;
            } catch (IllegalStateException exception) {
                LOGGER.error("event=task_read_failed taskId={}", safeTaskId, exception);
                throw new ResponseStatusException(
                        HttpStatus.SERVICE_UNAVAILABLE,
                        "Task store unavailable"
                );
            }
        }

        /** 返回可安全记录的任务标识，非法值只记录不含原文的拒绝事件。 */
        private String requireSafeTaskId(String taskId) {
            if (ACCEPTED_TASK_ID.matcher(taskId).matches()) {
                return taskId;
            }
            LOGGER.info("event=task_id_rejected");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid task ID");
        }

        /** 读取固定任务，failure 标识用于稳定复现存储故障。 */
        private TaskView loadTask(String taskId) {
            if ("failure".equals(taskId)) {
                throw new IllegalStateException("Simulated task store failure");
            }
            return new TaskView(taskId, "发布日志规范", "PENDING");
        }
    }

    /** Java 8 兼容线使用普通不可变类表达任务视图。 */
    static class TaskView {

        private final String id;
        private final String title;
        private final String status;

        /** 创建固定字段的任务视图。 */
        TaskView(String id, String title, String status) {
            this.id = id;
            this.title = title;
            this.status = status;
        }

        /** 返回任务标识。 */
        public String getId() {
            return id;
        }

        /** 返回任务标题。 */
        public String getTitle() {
            return title;
        }

        /** 返回任务状态。 */
        public String getStatus() {
            return status;
        }
    }
}
```

## 十、运行结果与自检

### 1. 先验证可信关联值

两个工程一次只启动一个，执行：

```bash
mvn spring-boot:run
```

另开终端发送请求：

```bash
curl -i -H 'X-Correlation-Id: demo-100' \
  http://127.0.0.1:8080/api/tasks/T-100
```

响应包含：

```text
HTTP/1.1 200
X-Correlation-Id: demo-100

{"id":"T-100","title":"发布日志规范","status":"PENDING"}
```

现代控制台每行是 JSON。解析业务事件后应得到：

```text
level=INFO
correlationId=demo-100
event=task_viewed
taskId=T-100
status=PENDING
```

Java 8 控制台对应事件包含：

```text
level=INFO correlationId=demo-100 ... event=task_viewed taskId=T-100 status=PENDING
```

### 2. 再验证无效输入不会污染日志

发送包含空格的值：

```bash
curl -i -H 'X-Correlation-Id: invalid value' \
  http://127.0.0.1:8080/api/tasks/T-200
```

响应 header 应是服务端生成的 UUID，不再是 `invalid value`；对应日志使用同一个新 UUID，并且不出现原始无效值。随后再次
发送 `demo-300`，确认新事件只包含 `demo-300`，证明容器线程没有沿用前一次 MDC。

再验证会进入业务日志字段的路径参数。下面两个请求分别包含非法字符和超过 64 字符的任务标识：

```bash
curl -i -H 'X-Correlation-Id: rejected-char' \
  http://127.0.0.1:8080/api/tasks/invalid%21
curl -i -H 'X-Correlation-Id: rejected-length' \
  http://127.0.0.1:8080/api/tasks/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
```

两次响应都应为 400。日志分别带有当前 correlation ID 和 `event=task_id_rejected`，但不包含 `invalid!` 或 65 个 `A`；
这证明应用在第一条业务日志前完成了字符与长度校验。

### 3. 对比协议分支与系统故障

先请求不存在的任务：

```bash
curl -i -H 'X-Correlation-Id: missing-404' \
  http://127.0.0.1:8080/api/tasks/missing
```

响应为 404，业务日志只有一条 `level=INFO`、`correlationId=missing-404`、`event=task_not_found` 和
`taskId=missing`，没有 Throwable。再模拟存储故障：

```bash
curl -i -H 'X-Correlation-Id: failure-503' \
  http://127.0.0.1:8080/api/tasks/failure
```

响应为 503，按 `failure-503` 检索只得到一条 `event=task_read_failed` 的 ERROR 事件和一份
`IllegalStateException: Simulated task store failure` 堆栈。两次响应都保留各自的 correlation ID；INFO 配置下日志中
没有 `task_lookup_started`。最后再次发送 `demo-300`，确认后续成功事件不携带 `failure-503`。

## 十一、本课小结

日志是可观测性中的离散事件信号，不是指标或追踪的替代品。业务代码面向 SLF4J，Spring Boot starter 默认使用 Logback；
级别、占位符、Throwable、MDC 和结构化字段共同组成可检索的事件合同。

请求关联值必须在边界校验或生成，写入响应与 MDC，并在 finally 中清理；其他外部日志字段也要先限制字符与长度。
Spring Boot 4.1.1 可以直接输出 Logstash JSON，
Java 8 兼容线则用 SLF4J 1.7 占位符和 Logback pattern 保留相同诊断事实。无论输出格式如何，日志都只记录必要字段，
不保存秘密或完整请求对象。下一课将在这条可观察基础上加入健康检查和优雅停机。
