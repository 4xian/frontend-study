---
id: backend.java.learn.intermediate.errors-results-and-logging
type: lesson
title: 错误合同、Problem Details 与结构化日志
summary: 区分业务结果、Java 异常、HTTP 错误和服务器日志，并把失败转换成稳定、可追踪且不泄密的合同
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 150
prerequisites:
  - backend.java.learn.intermediate.spring-boot-mysql-mybatis-persistence-bridge
objectives:
  - 能区分应用结果、Java 异常、HTTP 错误响应和日志事件的使用者与职责。
  - 能用结果对象表达可预期业务分支，并让一个对象只处于一个明确分支。
  - 能设计与异常类名、数据库文本和中文文案解耦的稳定错误码。
  - 能按具体语义选择 400、404、409、422 与 500，而不是把所有失败都返回 200。
  - 能解释 RFC 9457 五个标准字段，并安全添加 code、fieldErrors 与 correlationId。
  - 能用 ExceptionHandler 和 ControllerAdvice 集中完成异常到 HTTP 的转换。
  - 能区分 SLF4J facade、provider 与 Logback 实现，并正确使用 level、占位符和 Throwable。
  - 能输出机器可解析的结构化日志，并用 MDC 关联一次同步请求中的多个事件。
  - 能避免口令、token、连接串、密钥、完整对象和异常内部文本进入响应或日志。
  - 能配置 Appender、encoder 与 rolling policy，并用可观察结果验证保留边界。
recap:
  - 应用结果、Java 异常、HTTP 错误和日志事件面向不同使用者，不能复用同一个对象代替四种合同。
  - 可预期分支适合结果对象，意外失败适合异常；Web adapter 再把二者映射为协议响应。
  - HTTP status、problem type 和稳定 code 供机器判断，title 与 detail 供人阅读且必须去敏。
  - 已知错误返回稳定安全信息，未知 500 返回通用信息，内部 cause 只留在受控日志中。
  - SLF4J 是调用 API，Logback 是实现；level、结构化字段和 Throwable 都是日志事件的一部分。
  - MDC 只保存短小低敏的诊断上下文，外部关联 ID 必须校验，并在 finally 或 close 时清理。
  - 参数化日志不等于去敏或日志注入防护，仍需字段允许列表、长度限制和按输出格式编码。
  - 滚动策略限制单文件、历史周期和归档总量，但不能代替备份、权限、采集和磁盘监控。
related: []
tags:
  - Java
  - 错误合同
  - 结果对象
  - HTTP 状态码
  - ProblemDetail
  - SLF4J
  - Logback
  - 结构化日志
  - MDC
  - 日志安全
appliesTo: Java 25、Spring Boot 4.1.0、Spring Framework 7.0.8、SLF4J 2.0.18、Logback 1.5.34 主线；Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE、SLF4J 1.7.30、Logback 1.2.3 兼容补充
modernBaseline:
  java: '25'
  springBoot: 4.1.0
  springFramework: 7.0.8
  slf4j: 2.0.18
  logback: 1.5.34
legacyBaseline:
  java: '8'
  springBoot: 2.3.12.RELEASE
  springFramework: 5.2.15.RELEASE
  slf4j: 1.7.30
  logback: 1.2.3
verifiedAt: 2026-08-16
sources:
  - id: spring-boot-4-system-requirements
    title: Spring Boot 4.1 System Requirements
    url: https://docs.spring.io/spring-boot/4.1/system-requirements.html
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Spring Boot 4.1.0 支持 Java 17 至 26，并要求 Spring Framework 7.0.8 或以上
  - id: spring-boot-4-dependency-coordinates
    title: Spring Boot Managed Dependency Coordinates
    url: https://docs.spring.io/spring-boot/appendix/dependency-versions/coordinates.html
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Spring Boot 4.1.0 管理 SLF4J 2.0.18 与 Logback 1.5.34
  - id: rfc-9110-status
    title: RFC 9110 Section 15 Status Codes
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-15
    sourceType: specification
    appliesTo: HTTP
    claims:
      - 4xx 表示客户端似乎有误，5xx 表示服务端出错或无法完成请求
      - 400、404、409、422 与 500 各有独立协议语义
  - id: rfc-9457-problem-details
    title: RFC 9457 Problem Details for HTTP APIs
    url: https://www.rfc-editor.org/rfc/rfc9457.html
    sourceType: specification
    appliesTo: HTTP Problem Details
    claims:
      - 定义 type、status、title、detail、instance 和扩展成员
      - 响应状态与 body 中的 status 必须保持一致
  - id: spring-7-error-responses
    title: Spring MVC Error Responses
    url: https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-ann-rest-exceptions.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - ProblemDetail 和 ErrorResponse 可由 handler 渲染为 RFC 9457 响应
      - 应定制客户端详情以避免暴露实现信息
  - id: spring-7-problem-detail-api
    title: Spring Framework 7.0.8 ProblemDetail API
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/http/ProblemDetail.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - ProblemDetail 提供五个标准字段与扩展 properties
  - id: spring-7-error-response-api
    title: Spring Framework 7.0.8 ErrorResponse API
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/ErrorResponse.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - ErrorResponse 同时表达 status、headers 与 ProblemDetail body
  - id: spring-7-exception-handler-api
    title: Spring Framework 7.0.8 ExceptionHandler API
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/bind/annotation/ExceptionHandler.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - ExceptionHandler 按异常类型选择转换方法并支持 ProblemDetail 返回值
  - id: spring-7-response-entity-exception-handler
    title: Spring Framework 7.0.8 ResponseEntityExceptionHandler API
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/servlet/mvc/method/annotation/ResponseEntityExceptionHandler.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 可作为全局 ControllerAdvice 基类统一处理 MVC 异常
  - id: jls-25-records
    title: JLS 25 Record Classes
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.10
    sourceType: specification
    appliesTo: Java 25
    claims:
      - record header 声明数据载体状态并生成组件访问合同
  - id: jls-25-sealed-interface-permits
    title: JLS 25 Permitted Direct Subclasses and Subinterfaces
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.1.4
    sourceType: specification
    appliesTo: Java 25
    claims:
      - sealed interface 的 permits 子句列出预期的直接子类和直接子接口
  - id: spring-boot-4-logging
    title: Spring Boot 4.1 Logging
    url: https://docs.spring.io/spring-boot/4.1/reference/features/logging.html
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - 支持 ECS、GELF 与 Logstash 结构化 JSON
      - MDC 与 SLF4J fluent key-value 可进入结构化输出
  - id: slf4j-2-manual
    title: SLF4J Manual
    url: https://www.slf4j.org/manual.html
    sourceType: official-reference
    appliesTo: SLF4J 2.0.18
    claims:
      - SLF4J 是 facade API，需要 provider 才能产生输出
      - SLF4J 2 提供 fluent logging 与 MDC
  - id: slf4j-2-logger-api
    title: SLF4J Logger API
    url: https://www.slf4j.org/api/org/slf4j/Logger.html
    sourceType: api-doc
    appliesTo: SLF4J 2.0.18
    claims:
      - 定义日志级别、参数化消息、Throwable 重载与 fluent builder
  - id: slf4j-2-mdc-api
    title: SLF4J MDC API
    url: https://www.slf4j.org/api/org/slf4j/MDC.html
    sourceType: api-doc
    appliesTo: SLF4J 2.0.18
    claims:
      - MDC 保存当前线程诊断上下文并提供 putCloseable、remove 与 clear
  - id: logback-architecture
    title: Logback Architecture
    url: https://logback.qos.ch/manual/architecture.html
    sourceType: official-reference
    appliesTo: Logback；现代 fixture 为 1.5.34
    claims:
      - 日志事件携带 level、message、Throwable、thread、logger 与 MDC 后交给 appender
  - id: logback-appenders
    title: Logback Appenders
    url: https://logback.qos.ch/manual/appenders.html
    sourceType: official-reference
    appliesTo: Logback；现代 fixture 为 1.5.34
    claims:
      - RollingFileAppender 支持按时间和大小滚动及历史与总量限制
  - id: logback-mdc
    title: Logback Mapped Diagnostic Context
    url: https://logback.qos.ch/manual/mdc.html
    sourceType: official-reference
    appliesTo: Logback；现代 fixture 为 1.5.34
    claims:
      - MDC 的 put 与 remove 应成对执行，且子线程不会自动继承父线程上下文
  - id: logback-news-rolling
    title: Logback News Rolling Policy History
    url: https://logback.qos.ch/news-archive.html
    sourceType: release-note
    appliesTo: Logback 1.1.7 及以上
    claims:
      - legacy 1.2.3 已支持 totalSizeCap 与简化的大小时间滚动策略
  - id: owasp-logging
    title: OWASP Logging Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: 2026-08-16 页面状态
    claims:
      - 日志需要 interaction identifier、敏感数据排除、输入净化与正确输出编码
  - id: owasp-error-handling
    title: OWASP Error Handling Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: 2026-08-16 页面状态
    claims:
      - 未知错误向客户端返回通用信息，调查详情留在服务端日志
  - id: cwe-117
    title: CWE-117 Improper Output Neutralization for Logs
    url: https://cwe.mitre.org/data/definitions/117.html
    sourceType: security-standard
    appliesTo: CWE 4.20 页面状态
    claims:
      - 未处理日志特殊元素会伪造条目、破坏解析或注入下游工具
  - id: spring-boot-2-3-system-requirements
    title: Spring Boot 2.3.12 System Requirements
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#system-requirements
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - 支持 Java 8 至 15，并要求 Spring Framework 5.2.15.RELEASE 或以上
  - id: spring-boot-2-3-dependencies
    title: Spring Boot 2.3.12 Dependency Versions
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/appendix-dependency-versions.html
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - 管理 SLF4J 1.7.30、Logback 1.2.3 与 Spring Framework 5.2.15.RELEASE
  - id: spring-boot-2-3-logging
    title: Spring Boot 2.3.12 Logging How-to
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/howto.html#howto-logging
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - 使用 Logback 原生配置与 Boot 2.3 的日志属性，不具备 Boot 4.1 内置 structured format 合同
  - id: spring-5-exception-handler-api
    title: Spring Framework 5.2.15 ExceptionHandler API
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/bind/annotation/ExceptionHandler.html
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - legacy 可按异常类型选择 handler 并返回 ResponseEntity
  - id: spring-5-response-entity-exception-handler
    title: Spring Framework 5.2.15 ResponseEntityExceptionHandler API
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/servlet/mvc/method/annotation/ResponseEntityExceptionHandler.html
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - legacy 使用 body、headers 与 HttpStatus 统一创建错误 ResponseEntity
projectEvidence:
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingTailReadResult.java
    symbol: com.tdh.bdzz.config.websocket.server.LoggingTailReadResult
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/validator/Result.java
    symbol: com.tdh.bdzz.validator.Result
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/exception/ArgumentNotValidException.java
    symbol: com.tdh.bdzz.exception.ArgumentNotValidException
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/rolling/InnerProjectRollingFileAppender.java
    symbol: com.tdh.bdzz.rolling.InnerProjectRollingFileAppender
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/rolling/InnerProjectSizeAndTimeBasedRollingPolicy.java
    symbol: com.tdh.bdzz.rolling.InnerProjectSizeAndTimeBasedRollingPolicy
    usage: observed
---

# 错误合同、Problem Details 与结构化日志

## 一、为什么需要学习

一次查询失败时，Service 调用方、HTTP 客户端和服务器维护人员需要的信息不同。调用方要知道“课程
不存在”这个业务分支，客户端要得到 404 和稳定错误码，维护人员则需要关联 ID 与异常 cause。若把
四种信息混成一个字符串，常见结果就是所有响应都返回 200、客户端依赖中文文案、日志重复打印，甚至
把 SQL、路径、token 或口令送给客户端。

本课从一个“按 ID 查询课程”的中性场景开始，逐步建立应用结果、异常、HTTP 错误和日志之间的转换
边界。学习重点不是记住某个框架注解，而是知道每个对象面向谁、应包含什么、何时创建以及怎样验证。

## 二、学习目标

- 能为可预期失败创建互斥的结果分支。
- 能为 HTTP 失败选择正确状态与稳定 Problem Details body。
- 能集中转换异常，并让未知失败既可调查又不泄露。
- 能产生带关联 ID、结构化字段和 Throwable 的日志事件。
- 能验证响应、日志、MDC 与滚动归档都满足明确合同。

## 三、前置术语

- **应用结果：** Service 返回给调用者的成功值或可预期业务分支。
- **异常：** Java 调用链中传播失败的对象，可携带类型、消息与 cause。
- **HTTP status：** 协议层机器可读的请求结果，例如 404 或 500。
- **错误合同：** 客户端可以长期依赖的状态、字段、类型与错误码约定。
- **日志事件：** 交给日志系统的一次结构化记录，包含 level、message、字段和可选 Throwable。
- **关联 ID：** 把同一次交互中的多条日志连接起来的短小标识，不是身份或授权凭据。
- **MDC：** 与当前线程关联的诊断键值表，logger 可以把其中字段写入事件。

## 四、零基础知识点详解

### 1. 一次失败中的四种合同

**它是什么：** 同一次失败可以形成应用结果、Java 异常、HTTP 错误和服务器日志四种对象。它们描述
同一事件的不同侧面，但使用者、字段和生命周期不同。

**有什么作用：** 分开合同后，Service 不必认识 Servlet，客户端不必解析 stack trace，维护人员也
不必依赖用户看到的中文消息定位问题。

**什么时候使用：** 只要失败会跨越方法、进程或人员边界，就先判断当前代码正在创建哪一种合同。

**怎么使用：**

1. Service 用结果对象或异常表达调用结果。
2. Web adapter 把结果或异常映射成 HTTP status 与安全 body。
3. 拥有处理责任的边界记录一次日志事件。
4. 客户端只读取公开协议字段，内部调查读取受控日志。

**最小示例：**

```java
record CourseMissing(String code) {}

record ApiError(String code, String message, String correlationId) {}
```

`CourseMissing` 面向 Java 调用方，`ApiError` 面向 HTTP 客户端；日志事件由 logger 创建，不需要塞进
这两个 record。

**运行结果：** 课程不存在时，Service 可以得到 `CourseMissing[code=course.not-found]`，客户端
可以得到 404 与安全消息，服务器日志则保留相同关联 ID 和必要异常上下文。

**常见误区：** 用 `Map<String, Object>` 同时承载业务结果、HTTP status 和日志字段。字段来源不清，
调用方也无法知道哪些组合合法。

### 2. 可预期业务分支与意外系统失败

**它是什么：** 可预期分支是业务允许发生且调用方需要处理的结果，例如“未找到课程”；意外失败是
当前用例无法正常解释或恢复的故障，例如数据库连接中断或程序不变量被破坏。

**有什么作用：** 调用方可以显式处理正常分支，而异常仍能保留 cause 并交给真正负责恢复或终止的
边界。

**什么时候使用：** 先问“调用方是否能把它当成正常分支继续工作”。答案为是时考虑结果对象；答案
为否时让明确异常传播。

**怎么使用：**

1. 列出用例允许出现的业务分支。
2. 为调用方必须处理的分支建模。
3. 不捕获自己无法恢复的系统异常。
4. 转换异常时保留原始 cause。

**最小示例：**

```java
CourseLookupResult result = repository.findById(courseId)
        .<CourseLookupResult>map(CourseFound::new)
        .orElseGet(() -> new CourseMissing(courseId))
```

**运行结果：** 查无数据返回 `CourseMissing`，数据库驱动抛出的连接异常不会被伪装成
`CourseMissing`，而是继续沿调用栈传播。

**常见误区：** `catch (Exception)` 后统一返回“未找到”。这会把服务器故障错误地变成业务分支，
也可能让事务和监控误判成功。

### 3. 结果对象与互斥分支

**它是什么：** 结果对象把一个方法可能产生的有限结果写进类型。互斥表示对象在任一时刻只能是成功
或某个失败分支，不能同时出现互相矛盾的字段。

**有什么作用：** 编译器和代码阅读者都能看到需要处理哪些分支，不必猜测 `success`、`data`、
`error` 与 null 的组合。

**什么时候使用：** 适合分支数量有限、每个分支都属于正常业务流程且调用方必须显式决定下一步的
方法。单一成功值不必机械套 `Result<T>`。

**怎么使用：**

1. 用接口表示共同结果类型。
2. 每个分支使用独立类型。
3. 让成功分支只携带成功数据。
4. 让失败分支只携带稳定原因，不携带半成品数据。

**最小示例：**

```java
sealed interface CourseLookupResult permits CourseFound, CourseMissing {}

record CourseFound(CourseView course) implements CourseLookupResult {}

record CourseMissing(long courseId) implements CourseLookupResult {}
```

**运行结果：** 一个 `CourseLookupResult` 实例只能是 `CourseFound` 或 `CourseMissing`。代码不会产生
`success=true` 但 `data=null` 的非法组合。

**常见误区：** 每个方法都返回通用 `Result<T>`，其中 `data`、`error`、`message` 全部可 null。
形式统一并不等于状态有效。

### 4. Java 25 与 Java 8 表达同一结果合同

**它是什么：** Java 25 可用 sealed interface 和 record 简洁表达封闭分支；Java 8 没有这些语法，
需要 final class、构造器和 getter。

**有什么作用：** 在两套版本中保持业务含义一致，同时避免把现代语法错误复制到旧项目。

**什么时候使用：** 现代主线优先使用 Java 25 语法；维护 Boot 2.3 / Java 8 时按相同字段和分支合同
写兼容类型。

**怎么使用：**

1. 先冻结与 Java 版本无关的分支名称和字段。
2. Java 25 使用 record 表达不可重新赋值的组件。
3. Java 8 使用 private final 字段和构造器。
4. 分别用目标版本编译，不用 Java 25 运行代替 Java 8 证据。

**最小示例：**

```java
public final class CourseMissing {
    private final long courseId;

    /** 创建 Java 8 可用的课程缺失结果。 */
    public CourseMissing(long courseId) {
        this.courseId = courseId;
    }

    /** 返回未找到的课程 ID。 */
    public long getCourseId() {
        return courseId;
    }
}
```

**运行结果：** Java 8 调用方通过 `getCourseId()` 得到与现代 `missing.courseId()` 相同的业务值。

**常见误区：** 只把 `record` 关键字替换成 `class`，却没有构造器、final 字段或访问方法，导致合同
不完整或对象可被任意修改。

### 5. 稳定错误码与人类消息

**它是什么：** 错误码是客户端用于分支判断的稳定机器标识；message 是给人阅读、可以本地化或改写
的文本。异常类名和数据库消息都不是公开错误码。

**有什么作用：** 文案变化不会破坏客户端，内部重构也不必改变外部协议。

**什么时候使用：** 任何客户端需要根据失败类型执行不同动作的公开 API，都应提供稳定 type 或 code。

**怎么使用：**

1. 为一个可操作含义定义一个 code。
2. code 使用稳定、可检索、与实现解耦的名称。
3. message 只说明用户可以理解或采取的动作。
4. 发布后把 code 语义变化视为 API 合同变化。

**最小示例：**

```java
enum ApiErrorCode {
    COURSE_NOT_FOUND("course.not-found"),
    COURSE_TITLE_CONFLICT("course.title-conflict");

    private final String value;

    /** 创建稳定的公开错误码。 */
    ApiErrorCode(String value) {
        this.value = value;
    }

    /** 返回协议使用的错误码文本。 */
    String value() {
        return value;
    }
}
```

**运行结果：** 即使把“课程不存在”改成其他语言，客户端仍按 `course.not-found` 处理。

**常见误区：** 让客户端判断 `message.contains("不存在")`。文案、本地化和标点变化都会让分支失效。

### 6. HTTP 4xx 与 5xx

**它是什么：** 4xx 表示服务器认为客户端请求似乎有误；5xx 表示服务器出错或无法完成一个看似有效
的请求。它们是协议结果，不是 Java 异常继承层级。

**有什么作用：** 客户端、代理、监控和缓存可以先按协议类别处理失败，而不必理解业务 JSON。

**什么时候使用：** Web adapter 产生响应时，必须先按请求与服务器责任选择状态类别。

**怎么使用：**

1. 判断请求是否违反公开协议或资源当前状态。
2. 若是，选择有精确语义的 4xx。
3. 若请求本可完成但服务端意外失败，使用适当 5xx。
4. 让 body 中的 status 与真实响应状态一致。

**最小示例：**

```java
enum FailureKind {
    COURSE_MISSING,
    UNEXPECTED_SERVER_FAILURE
}

/** 按失败责任与协议语义选择 HTTP 状态。 */
static HttpStatus toStatus(FailureKind failure) {
    return switch (failure) {
        case COURSE_MISSING -> HttpStatus.NOT_FOUND;
        case UNEXPECTED_SERVER_FAILURE -> HttpStatus.INTERNAL_SERVER_ERROR;
    };
}
```

**运行结果：** `toStatus(COURSE_MISSING)` 得到 404；
`toStatus(UNEXPECTED_SERVER_FAILURE)` 得到 500。课程是否存在与服务器是否意外失败不再混为一谈。

**常见误区：** 看到任何 `IllegalArgumentException` 就返回 400。同一异常类型也可能由服务端 bug
触发，必须根据业务和协议语义映射。

### 7. 选择 400、404、409、422 与 500

**它是什么：** 这些状态分别表达无法解析或不合法请求、资源不存在、当前状态冲突、可理解但无法
处理的内容，以及意外服务端失败。

**有什么作用：** 客户端能判断应修正格式、换资源、解决冲突还是稍后重试。

**什么时候使用：** API 设计时先为每个公开失败场景固定状态，并用自动化验证保持一致。

**怎么使用：**

1. JSON 或参数形状无法按合同解析时选择 400。
2. 目标资源不存在或不披露存在时选择 404。
3. 操作与资源当前状态冲突时选择 409。
4. 内容类型和语法可理解，但指令按选定合同无法处理时选择 422。
5. 未分类的服务端意外失败选择 500。

**最小示例：**

```java
Map<String, Integer> statuses = Map.of(
        "malformed", 400,
        "missing", 404,
        "conflict", 409,
        "unprocessable", 422,
        "unexpected", 500)
```

**运行结果：** 每个场景都有唯一可断言的状态；客户端不必从 detail 猜测原因。

**常见误区：** 把 422 当作所有业务错误的默认值。400 与 422 的具体划分是 API 合同决定，选定后
必须稳定，而不是随开发者习惯变化。

### 8. 把结果与异常映射成 HTTP

**它是什么：** 映射是 Web adapter 把应用结果或 Java 异常转换成协议状态和公开 body 的动作。
Service 不直接返回 `ResponseEntity`。

**有什么作用：** 业务用例可以被 HTTP、消息或批处理复用，每个 adapter 按自己的协议表达结果。

**什么时候使用：** 数据准备离开应用边界、进入 HTTP 响应时执行映射。

**怎么使用：**

1. Controller 处理成功和可预期结果分支。
2. 已知业务异常交给精确 handler。
3. 未知异常交给最后的安全兜底 handler。
4. 每个映射同时确定 status、type/code 与安全 detail。

**最小示例：**

```java
CourseLookupResult result = service.find(courseId)
if (result instanceof CourseFound found) {
    return ResponseEntity.ok(found.course())
}
throw new CourseNotFoundException(courseId)
```

**运行结果：** 成功分支返回课程数据；缺失分支进入 404 handler；Service 代码没有 Spring Web 类型。

**常见误区：** Service 同时返回 `Result`、设置 HTTP status 并记录 response JSON。这样业务层被协议
和日志格式绑死。

### 9. RFC 9457 的五个标准字段

**它是什么：** Problem Details 用 `type`、`status`、`title`、`detail`、`instance` 五个标准字段描述
一次 HTTP 问题。`type` 表示问题种类，`instance` 表示这一次发生；两者不能混用。

**有什么作用：** 不同 API 可以使用一致外形表达错误，通用客户端先读 status 和 type，再处理业务扩展。

**什么时候使用：** HTTP API 需要返回结构化错误，并希望客户端不依赖随时可能变化的中文消息时使用。

**怎么使用：**

1. 为一种问题选择稳定的 `type` URI。
2. 让响应 status 与 body 的 `status` 完全一致。
3. `title` 写问题种类的短摘要。
4. `detail` 只解释本次问题的安全信息。
5. `instance` 标识本次发生，不放可直接访问的敏感内部地址。

**最小示例：**

```json
{
  "type": "https://api.example.test/problems/course-not-found",
  "status": 404,
  "title": "课程不存在",
  "detail": "没有找到指定课程",
  "instance": "/courses/42"
}
```

**运行结果：** 客户端按 `type` 和 404 判断问题种类；detail 即使以后改写，也不会改变机器分支。

**常见误区：** 每次错误都生成一个新的 `type`，或让客户端解析 detail。`type` 应稳定表示问题种类，
detail 只供人阅读。

### 10. 安全设计 ProblemDetail 扩展字段

**它是什么：** RFC 9457 允许添加扩展成员。本课使用 `code`、`fieldErrors` 和 `correlationId`，分别
表达短错误码、字段问题列表和日志关联标识。

**有什么作用：** 客户端能处理业务分支和字段提示，维护人员也能用 correlationId 查找对应日志。

**什么时候使用：** 五个标准字段无法表达客户端确实需要的机器信息时，才添加少量稳定扩展。

**怎么使用：**

1. 先确认字段是客户端需要的公开合同。
2. 为字段固定名称、类型和空值规则。
3. `fieldErrors` 只返回允许公开的字段名、规则码和安全消息。
4. correlationId 只用于关联，不作为身份、权限或可信审计证明。

**最小示例：**

```java
ProblemDetail detail = ProblemDetail.forStatus(HttpStatus.UNPROCESSABLE_ENTITY);
detail.setProperty("code", "course.title-invalid");
detail.setProperty("fieldErrors", List.of(
        Map.of("field", "title", "code", "required", "message", "课程标题不能为空")
));
detail.setProperty("correlationId", "req-demo-001");
```

**运行结果：** JSON 中扩展字段与标准字段并列，客户端不需要读取 Java 类名或异常文本。

**常见误区：** 把整个异常、请求 DTO 或数据库行作为扩展字段。扩展机制不是暴露内部对象的通道。

### 11. 客户端错误响应去敏

**它是什么：** 去敏是从公开错误中排除 stack trace、SQL、文件路径、类名、密钥、token 和底层异常
原文，只留下客户端能理解且能行动的信息。

**有什么作用：** 既保持 API 合同稳定，也避免攻击者从错误中获得系统结构、数据或凭据。

**什么时候使用：** 任何异常将跨越服务边界进入 HTTP body 前都要执行；未知 500 尤其必须使用通用文本。

**怎么使用：**

1. 已知错误从预先定义的安全消息表取 detail。
2. 未知错误固定返回通用 detail。
3. 内部 Throwable 只交给受控服务器日志。
4. 用禁止样本断言响应中不存在内部信息。

**最小示例：**

```java
String publicDetail = status.is5xxServerError()
        ? "请求暂时无法完成"
        : "请求不符合课程接口合同";
```

**运行结果：** 即使内部异常消息是 `SQL failed at /srv/private/CourseDao.java`，500 body 也只含通用说明。

**常见误区：** 认为 `exception.getMessage()` 比 stack trace 安全。异常消息同样可能包含 SQL、路径、
第三方响应或用户输入。

### 12. 用 ExceptionHandler 集中转换

**它是什么：** `@ExceptionHandler` 按异常类型选择转换方法，`@ControllerAdvice` 让这些方法对多个
Controller 生效。它们属于 Web adapter，不替代 Service 的业务合同。

**有什么作用：** 同类错误得到一致 status 和 body，Controller 不必重复 try/catch，未知异常仍能统一兜底。

**什么时候使用：** 多个 HTTP 入口需要共享异常映射时使用；能在 Service 恢复的业务分支仍应在那里处理。

**怎么使用：**

1. 为已知异常声明精确 handler。
2. 返回与异常语义匹配的 status 和安全 ProblemDetail。
3. 最后才添加 `Exception.class` 兜底。
4. 兜底处记录一次 Throwable，不在每一层重复记录。

**最小示例：**

```java
@RestControllerAdvice
final class ApiErrorHandler {
    /** 把课程缺失异常转换成稳定 404 合同。 */
    @ExceptionHandler(CourseNotFoundException.class)
    ProblemDetail handleMissing(CourseNotFoundException exception) {
        return ProblemDetail.forStatusAndDetail(
                HttpStatus.NOT_FOUND,
                "没有找到指定课程"
        );
    }
}
```

**运行结果：** 任一 Controller 抛出 `CourseNotFoundException` 都得到 404，不会因忘写局部 catch 而变成 500。

**常见误区：** 在 handler 中捕获所有异常后返回 200，或只写日志不返回正确状态。集中处理不等于吞掉失败。

### 13. SLF4J、provider 与 Logback

**它是什么：** SLF4J 是业务代码调用的日志 facade；provider 把 facade 连接到实现；Logback 是常见
实现，负责级别过滤、事件、编码和输出。

**有什么作用：** 业务代码依赖稳定 API，部署时由一套实现决定日志写法和目的地。

**什么时候使用：** 应用代码需要记录日志时面向 SLF4J；只有日志配置和基础设施才直接涉及 Logback。

**怎么使用：**

1. 业务类只 import `org.slf4j.Logger` 与 `LoggerFactory`。
2. 使用当前类创建 `private static final` logger。
3. classpath 保留一套兼容 provider。
4. 在 Logback 配置中选择 appender、encoder 和 level。

**最小示例：**

```java
private static final Logger LOGGER = LoggerFactory.getLogger(CourseService.class);
```

**运行结果：** 调用 `LOGGER.info(...)` 会形成日志事件，再由 Logback appender 输出；SLF4J 本身不决定文件路径。

**常见误区：** 同时直接调用 SLF4J 和 Logback logger，或放入多套 provider。这样可能出现绑定警告、
重复输出或行为不确定。

### 14. 日志级别与业务约定

**它是什么：** Logback 的级别从低到高为 TRACE、DEBUG、INFO、WARN、ERROR；启用某一级别时，更低
级别事件会被过滤。具体业务含义需由团队约定。

**有什么作用：** 生产环境可以保留重要信号并控制噪声，诊断时再临时打开更细级别。

**什么时候使用：** 每次记录事件前，根据影响、频率和处置需求选择 level，而不是只看异常类名。

**怎么使用：**

1. ERROR 表示当前操作意外失败且需要调查。
2. WARN 表示操作可继续但存在异常或安全信号。
3. INFO 记录低频生命周期或重要业务里程碑。
4. DEBUG 与 TRACE 只承载逐步增加的诊断细节。

**最小示例：**

```java
LOGGER.info("Course created courseId={}", courseId);
LOGGER.warn("Course title conflict courseId={}", courseId);
LOGGER.error("Course lookup failed", exception);
```

**运行结果：** root level 为 INFO 时，INFO、WARN、ERROR 可见，DEBUG 与 TRACE 被过滤。

**常见误区：** 把所有 4xx 记录成 ERROR stack。正常的 404 可能不需要业务日志；是否记录取决于事件
用途与频率，不由 HTTP 状态机械决定。

### 15. 占位符、重载与 Throwable

**它是什么：** SLF4J 的 `{}` 是参数占位符，logger 重载负责合并 message、参数和可选 Throwable。
Throwable 是独立事件字段，不应只留下它的 message。

**有什么作用：** 关闭某级别时可避免不必要的字符串拼接，并保留完整 cause 链供调查。

**什么时候使用：** 动态值用占位符；意外失败需要调用栈时，使用明确的 `(String, Throwable)` 形式。

**怎么使用：**

1. 固定模板写在第一个参数。
2. 只传允许记录的低敏字段。
3. 需要 stack 时把 Throwable 作为独立参数。
4. 检查占位符数量，不依赖含糊的最后参数推断。

**最小示例：**

```java
LOGGER.info("Course loaded courseId={} status={}", courseId, status);
LOGGER.error("Unexpected course lookup failure", exception);
```

**运行结果：** 第一条事件包含两个格式化值；第二条事件的 Throwable 字段非 null，可输出 cause chain。

**常见误区：** `LOGGER.error("failed: " + exception.getMessage())`。它提前拼接字符串，还丢失异常类型、
stack 与 cause。

### 16. 结构化日志的字段合同

**它是什么：** 结构化日志把事件属性保存为有名称、有类型的字段，而不是把所有内容拼成一行供人猜测。

**有什么作用：** 日志平台可以按 `event.action`、`outcome`、`error.code` 或 correlationId 精确检索和聚合。

**什么时候使用：** 事件需要机器查询、统计或跨多条日志关联时使用；本地临时调试也要保持同一字段含义。

**怎么使用：**

1. 为稳定事件定义少量字段名。
2. 数值、布尔值保持原类型。
3. message 只写简短人类摘要。
4. 不把秘密或无限长度正文作为字段。

**最小示例：**

```json
{
  "level": "INFO",
  "message": "Course created",
  "event.action": "course.create",
  "course.id": 42,
  "outcome": "success"
}
```

**运行结果：** `course.id` 是 number，查询系统可以按范围处理；无需从 message 正则提取 42。

**常见误区：** 只把原文本放进 `{"message":"..."}` 就称为结构化日志。没有稳定独立字段，机器仍
只能解析文本。

### 17. SLF4J fluent 字段与 Boot JSON

**它是什么：** SLF4J 2 fluent API 用 `addKeyValue` 添加事件字段；Spring Boot 4.1 可用内置配置把
控制台日志编码成 ECS、GELF 或 Logstash JSON。

**有什么作用：** 应用声明业务字段，Boot 与 provider 负责按选定格式正确编码，不必手写 JSON 字符串。

**什么时候使用：** 现代 Boot 4.1 应用需要可解析 JSON 输出时使用。Boot 2.3 没有同名内置配置。

**怎么使用：**

1. 设置 `logging.structured.format.console=logstash`。
2. 用 fluent logger 添加允许字段。
3. 最后调用 `log` 提交事件。
4. 启动后用 JSON parser 验证每行，而不是肉眼判断。

**最小示例：**

```java
LOGGER.atInfo()
        .addKeyValue("event.action", "course.create")
        .addKeyValue("course.id", 42)
        .addKeyValue("outcome", "success")
        .log("Course created");
```

**运行结果：** 选定 Logstash 格式后，三个 key-value 与 message 一起进入可解析 JSON event。

**常见误区：** `LOGGER.info("{\"token\":\"" + token + "\"}")`。手写 JSON 既容易破坏转义，也会把
秘密直接写出。

### 18. correlation ID 与 MDC 生命周期

**它是什么：** correlation ID 是一次交互的关联值；MDC 是当前线程的诊断键值表。同步请求开始时放入，
结束时必须清理。

**有什么作用：** 同一请求经过 Controller、Service 和 handler 时，多条事件都能用同一个值检索。

**什么时候使用：** 一次同步请求会产生多条日志时使用。跨线程和跨服务传播需要额外上下文机制，不在
本课自动成立。

**怎么使用：**

1. 校验外部 ID 只含允许字符且长度不超过 64。
2. 不合格或缺失时生成服务端 UUID。
3. 把最终值写入 MDC 和响应 header。
4. 用 try-with-resources 或 finally 保证清理。

**最小示例：**

```java
String correlationId = candidate != null && SAFE_ID.matcher(candidate).matches()
        ? candidate
        : UUID.randomUUID().toString();
try (MDC.MDCCloseable ignored = MDC.putCloseable("correlationId", correlationId)) {
    chain.doFilter(request, response);
}
```

**运行结果：** 请求期间 `MDC.get("correlationId")` 返回当前值；离开 try 后返回 null，不污染线程的下一次请求。

**常见误区：** 把客户端传来的 correlation ID 当成用户身份，或只 put 不 remove。客户端可伪造该值，
线程池还会复用线程。

### 19. 敏感字段与 toString 风险

**它是什么：** 敏感字段包括密码、token、session ID、连接串、密钥和高敏个人数据。记录完整 DTO 或
调用 `toString()` 会在模型新增字段后悄悄扩大日志内容。

**有什么作用：** 省略不必要数据可以减少凭据泄露、合规暴露和日志存储风险。

**什么时候使用：** 每次选择日志参数、MDC 字段、异常上下文或结构化字段时都要执行字段允许列表判断。

**怎么使用：**

1. 不需要调查的值完全不记录。
2. 优先记录独立业务 ID，不记录整个对象。
3. 确有辨认需要时只保留固定末尾并标明掩码。
4. 对所有自由文本设置长度上限。

**最小示例：**

```java
LOGGER.info("Login rejected userId={} reasonCode={}", userId, "credential-invalid");
```

**运行结果：** 事件可以按 userId 和 reasonCode 调查，但不包含密码、Authorization header 或整个请求对象。

**常见误区：** 认为 record、Lombok 或 IDE 生成的 `toString()` 已自动去敏。生成方法通常会输出所有组件。

### 20. CR/LF 与日志注入防护

**它是什么：** 不可信文本中的回车、换行、分隔符或无效 JSON 字符可能伪造新日志、破坏解析，甚至
把控制内容带入下游查看器。这类问题称为日志注入。

**有什么作用：** 正确验证与编码后，一次 logger 调用仍只形成一条符合 sink 格式的事件。

**什么时候使用：** 用户输入、header、第三方响应或异常文本进入日志前都要考虑最终输出格式。

**怎么使用：**

1. 先按业务规则限制字符集、类型与长度。
2. 将值作为字段或占位符参数，不拼接整行。
3. 由 JSON、CEF 或纯文本 encoder 按最终格式编码。
4. 纯文本输出额外转义 CR/LF，并用恶意样本验证。

**最小示例：**

```java
String safeText = rawText
        .replace("\r", "\\r")
        .replace("\n", "\\n");
LOGGER.warn("Rejected input value={}", safeText);
```

**运行结果：** 输入 `ok\r\nFORGED=1` 在纯文本日志中显示为可见转义，不会生成伪造的第二行。

**常见误区：** 认为 `{}` 占位符会自动防注入。占位符控制格式化时机，不是针对所有 sink 的输出编码器。

### 21. Appender、encoder 与 RollingPolicy

**它是什么：** Appender 决定事件写到哪里；encoder/layout 决定字节或文本格式；RollingPolicy 决定
活动文件何时归档、如何命名和何时删除。

**有什么作用：** 三个职责分开后，可以独立修改目的地、格式和生命周期，而不改业务 logger 调用。

**什么时候使用：** 需要控制台、文件或滚动归档时在 Logback 配置中组合，不在 Java 业务代码中手写文件。

**怎么使用：**

1. 创建目标 appender。
2. 为 appender 选择 encoder。
3. 文件需要轮换时配置 rolling policy。
4. 把 appender 挂到目标 logger 或 root logger。

**最小示例：**

```xml
<appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
  <file>${LOG_PATH:-logs}/application.log</file>
  <encoder><pattern>%date %-5level %X{correlationId} %msg%n</pattern></encoder>
</appender>
```

**运行结果：** 事件由 FILE appender 写到活动文件，encoder 决定每条记录包含的字段与换行。

**常见误区：** 说“logger 自己写文件”。logger 创建事件，真正执行 I/O 的是 appender。

### 22. 组合滚动与保留参数

**它是什么：** `maxFileSize` 限制单个归档大小，`maxHistory` 限制保留周期数，`totalSizeCap` 限制
全部归档总量，`cleanHistoryOnStart` 让启动时也执行历史清理。

**有什么作用：** 同时限制单文件、时间跨度和磁盘总量，避免只滚动不删除导致目录无限增长。

**什么时候使用：** 单日文件可能过大时使用 size-and-time；只需按天和总量时优先使用更简单的 time-based。

**怎么使用：**

1. size-and-time 的文件名同时包含 `%d` 和 `%i`。
2. 设置符合业务处置周期的 `maxHistory`。
3. 让 `totalSizeCap` 与实际磁盘预算一致。
4. 在临时目录触发滚动并检查归档，而不是只看 XML。

**最小示例：**

```xml
<rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
  <fileNamePattern>${LOG_PATH:-logs}/archive/app.%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>
  <maxFileSize>20MB</maxFileSize>
  <maxHistory>14</maxHistory>
  <totalSizeCap>1GB</totalSizeCap>
  <cleanHistoryOnStart>true</cleanHistoryOnStart>
</rollingPolicy>
```

**运行结果：** 超过单档大小后 `%i` 增加；超出历史或总量界限的旧归档会在清理时删除。

**常见误区：** 只配置 `maxFileSize` 就认为磁盘总量受控。它只切分文件，不负责限制所有归档之和。

### 23. Spring Boot 2.3 日志与错误合同差异

**它是什么：** legacy 线使用 Java 8、Spring 5.2、SLF4J 1.7 和 Logback 1.2，不具备 record、sealed、
Spring `ProblemDetail`、SLF4J fluent API 或 Boot 4.1 内置结构化格式属性。

**有什么作用：** 隔离版本能力后，旧项目能保持相同业务语义，又不会复制无法编译的现代 API。

**什么时候使用：** 维护 Spring Boot 2.3.12.RELEASE 项目时使用兼容写法；新项目仍从现代主线开始。

**怎么使用：**

1. 结果对象改为 final class、构造器和 getter。
2. 错误 body 使用自定义不可变 `ApiError` 和 `ResponseEntity`。
3. 日志使用经典 placeholder 与 Throwable 重载。
4. MDC 用 put，并在 finally 中 remove。

**最小示例：**

```java
MDC.put("correlationId", correlationId);
try {
    LOGGER.info("Course loaded courseId={}", courseId);
} finally {
    MDC.remove("correlationId");
}
```

**运行结果：** 代码可在 SLF4J 1.7 工作，请求结束后 MDC 不残留；没有调用 `atInfo()`。

**常见误区：** 在 Boot 2.3 中自行创建同包名 `ProblemDetail`，或复制
`logging.structured.format.console` 后认为已经产生 JSON。

### 24. 建立可观察反馈环

**它是什么：** 可观察反馈环是用真实请求、捕获日志事件、MDC 状态和归档文件证明合同，而不是只看源码。

**有什么作用：** 能发现 body status 不一致、异常重复记录、MDC 泄漏、敏感信息进入日志或滚动配置未生效。

**什么时候使用：** 修改结果类型、handler、日志字段、filter、encoder 或 rolling policy 后都要复跑。

**怎么使用：**

1. 请求 400、404、409、422 和 500 场景并精确断言 status。
2. 用 JSON parser 检查 Problem Details 与结构化日志。
3. 捕获 event，断言 ERROR 数量、Throwable 和 correlationId。
4. 连续请求后检查 MDC 为 null。
5. 在临时目录触发滚动并检查活动文件与归档。

**最小示例：**

```java
assertThat(response.getStatus()).isEqualTo(500);
assertThat(errorEvents).hasSize(1);
assertThat(errorEvents.getFirst().getThrowableProxy()).isNotNull();
assertThat(MDC.get("correlationId")).isNull();
```

**运行结果：** 所有断言通过时，HTTP、日志、MDC 和文件生命周期形成同一可复跑证据链。

**常见误区：** 只确认“控制台看到一条红色日志”。肉眼无法稳定证明字段类型、响应去敏、事件数量或清理状态。

## 五、现代版本中的正确用法

现代主线先按边界建立四种合同，再选择 Spring 与日志 API：

1. Service 用普通返回值或结果对象表达成功与可预期业务分支。
2. 无法在当前层恢复的意外失败使用异常，并保留 cause。
3. Web adapter 把结果与异常映射成准确 status 和安全 ProblemDetail。
4. 最外层错误 handler 对意外失败记录一次带 Throwable 的 ERROR。
5. filter 在同步请求开始时建立 correlationId，请求结束时清理 MDC。
6. SLF4J 事件只携带允许字段，Logback encoder 和 appender 负责格式与目的地。
7. HTTP、日志、MDC 和滚动策略都通过真实可观察结果验证。

这条执行链可以简写为：

```text
HTTP request
  -> correlation filter
  -> controller
  -> service result / exception
  -> controller or exception handler
  -> HTTP status + safe ProblemDetail
  -> one structured log event when investigation is required
  -> MDC cleanup
```

不要反向依赖：Service 不读取 HTTP status，不返回 `ProblemDetail`，也不依赖 MDC 才能说明业务结果；
客户端则不读取服务器日志或 Java exception message。

## 六、核心接口与执行流程

| 位置 | 输入 | 输出 | 主要责任 |
| --- | --- | --- | --- |
| Correlation filter | HTTP request | 带最终关联 ID 的请求上下文 | 校验/生成 ID、写响应头、清理 MDC |
| Controller | 路径、参数、body | 成功响应或明确业务异常 | 绑定协议、调用 Service、转换结果分支 |
| Service | 业务输入 | 成功/缺失等应用结果，或意外异常 | 执行业务用例，不认识 HTTP |
| Error handler | 已知或未知异常 | status + ProblemDetail | 集中协议映射、未知错误去敏、记录一次 Throwable |
| SLF4J + Logback | 日志事件 | JSON、控制台或滚动文件 | 级别过滤、编码、输出和生命周期 |

## 七、从零跟着做

下面创建一个最小 Spring Boot 4.1.0 应用。示例只使用中性的课程 ID，不连接数据库；不同 ID 用来稳定
触发成功、404、409、422 和 500。所有文件都放在同一个临时工程中。

### 1. 第一步：创建 Maven 工程

创建 `pom.xml`：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>4.1.0</version>
    <relativePath/>
  </parent>
  <groupId>example</groupId>
  <artifactId>errors-logging-course</artifactId>
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

创建目录 `src/main/java/example/course` 与 `src/main/resources`。Maven parent 会固定 Boot 管理的 Spring、
SLF4J 和 Logback 版本，不需要再手写三套版本号。

### 2. 第二步：创建应用入口

创建 `src/main/java/example/course/CourseApplication.java`：

```java
package example.course;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CourseApplication {
    /** 启动课程错误合同示例。 */
    public static void main(String[] args) {
        SpringApplication.run(CourseApplication.class, args);
    }
}
```

### 3. 第三步：创建应用结果与 Service

创建 `src/main/java/example/course/CourseLookupResult.java`：

```java
package example.course;

sealed interface CourseLookupResult permits CourseFound, CourseMissing {}

record CourseFound(CourseView course) implements CourseLookupResult {}

record CourseMissing(long courseId) implements CourseLookupResult {}

record CourseView(long id, String title) {}
```

创建 `src/main/java/example/course/CourseService.java`：

```java
package example.course;

import org.springframework.stereotype.Service;

@Service
final class CourseService {
    /** 按课程 ID 返回成功、缺失或意外失败。 */
    CourseLookupResult find(long courseId) {
        if (courseId == 1) {
            return new CourseFound(new CourseView(1, "Java 错误合同"));
        }
        if (courseId == 5) {
            throw new IllegalStateException("internal SQL sample at /srv/private/CourseDao.java");
        }
        return new CourseMissing(courseId);
    }
}
```

`CourseMissing` 是可预期业务分支；ID 5 模拟的异常不是“缺失”，所以不能被 Service 改写成 missing。

### 4. 第四步：创建 Controller 与业务异常

创建 `src/main/java/example/course/CourseController.java`：

```java
package example.course;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
final class CourseController {
    private final CourseService service;

    /** 注入课程查询用例。 */
    CourseController(CourseService service) {
        this.service = service;
    }

    /** 查询课程，并把可预期结果转换成 Web 分支。 */
    @GetMapping("/courses/{courseId}")
    CourseView find(@PathVariable long courseId) {
        if (courseId == 3) {
            throw new CourseConflictException();
        }
        if (courseId == 4) {
            throw new CourseInstructionException();
        }
        CourseLookupResult result = service.find(courseId);
        if (result instanceof CourseFound found) {
            return found.course();
        }
        CourseMissing missing = (CourseMissing) result;
        throw new CourseNotFoundException(missing.courseId());
    }
}

final class CourseNotFoundException extends RuntimeException {
    /** 创建不把内部信息暴露给客户端的课程缺失异常。 */
    CourseNotFoundException(long courseId) {
        super("Course not found: " + courseId);
    }
}

@ResponseStatus(HttpStatus.CONFLICT)
final class CourseConflictException extends RuntimeException {}

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
final class CourseInstructionException extends RuntimeException {}
```

这里故意让 handler 统一决定 body；`@ResponseStatus` 只标记两个异常的语义，下一步仍会为其创建稳定
ProblemDetail。

### 5. 第五步：集中构造安全 ProblemDetail

创建 `src/main/java/example/course/ApiErrorHandler.java`：

```java
package example.course;

import java.net.URI;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
final class ApiErrorHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger(ApiErrorHandler.class);

    /** 把路径或参数类型解析失败转换成 400。 */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    ProblemDetail handleBadRequest(MethodArgumentTypeMismatchException exception) {
        return problem(
                HttpStatus.BAD_REQUEST,
                "request.parameter-invalid",
                "请求参数无效",
                "请检查请求参数的格式"
        );
    }

    /** 把课程缺失转换成 404。 */
    @ExceptionHandler(CourseNotFoundException.class)
    ProblemDetail handleMissing(CourseNotFoundException exception) {
        return problem(HttpStatus.NOT_FOUND, "course.not-found", "课程不存在", "没有找到指定课程");
    }

    /** 把资源状态冲突转换成 409。 */
    @ExceptionHandler(CourseConflictException.class)
    ProblemDetail handleConflict(CourseConflictException exception) {
        return problem(HttpStatus.CONFLICT, "course.state-conflict", "课程状态冲突", "请刷新课程状态后重试");
    }

    /** 把可理解但无法处理的指令转换成 422。 */
    @ExceptionHandler(CourseInstructionException.class)
    ProblemDetail handleInstruction(CourseInstructionException exception) {
        return problem(
                HttpStatus.UNPROCESSABLE_ENTITY,
                "course.instruction-invalid",
                "课程指令无法处理",
                "请修改课程指令后重试"
        );
    }

    /** 对意外失败记录一次 Throwable，并向客户端返回通用 500。 */
    @ExceptionHandler(Exception.class)
    ProblemDetail handleUnexpected(Exception exception) {
        LOGGER.atError()
                .addKeyValue("event.action", "course.lookup")
                .addKeyValue("outcome", "failure")
                .addKeyValue("error.code", "internal-error")
                .setCause(exception)
                .log("Unhandled course lookup failure");
        return problem(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "internal-error",
                "服务暂时不可用",
                "请求暂时无法完成"
        );
    }

    /** 构造 status、类型和扩展字段一致的公开错误。 */
    private ProblemDetail problem(HttpStatus status, String code, String title, String detail) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setType(URI.create("https://api.example.test/problems/" + code));
        problem.setTitle(title);
        problem.setProperty("code", code);
        problem.setProperty("correlationId", MDC.get("correlationId"));
        return problem;
    }
}
```

注意：已知 handler 的异常参数可以帮助 Spring 选择方法，但不能把 `exception.getMessage()` 直接放进
detail。未知 handler 才记录完整 Throwable，而且只记录一次。

### 6. 第六步：建立并清理 correlationId

创建 `src/main/java/example/course/CorrelationIdFilter.java`：

```java
package example.course;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
final class CorrelationIdFilter extends OncePerRequestFilter {
    private static final Pattern SAFE_ID = Pattern.compile("[A-Za-z0-9._-]{1,64}");

    /** 为当前同步请求建立关联上下文，并在结束时自动清理。 */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {
        String correlationId = select(request.getHeader("X-Correlation-Id"));
        response.setHeader("X-Correlation-Id", correlationId);
        try (MDC.MDCCloseable ignored = MDC.putCloseable("correlationId", correlationId)) {
            chain.doFilter(request, response);
        }
    }

    /** 只复用短小安全的外部 ID，否则生成服务端 ID。 */
    private String select(String candidate) {
        return candidate != null && SAFE_ID.matcher(candidate).matches()
                ? candidate
                : UUID.randomUUID().toString();
    }
}
```

### 7. 第七步：启用结构化控制台日志

创建 `src/main/resources/application.properties`：

```properties
logging.structured.format.console=logstash
```

这只选择 Boot 4.1 的输出格式，不代表字段自动安全。字段仍必须由应用允许列表控制。

### 8. 第八步：启动并逐个观察结果

执行：

```bash
./mvnw spring-boot:run
```

如果工程没有 Maven Wrapper，可使用本机 `mvn spring-boot:run`。然后在另一个终端依次请求：

```bash
curl -i -H 'X-Correlation-Id: learn-001' http://localhost:8080/courses/1
curl -i -H 'X-Correlation-Id: learn-002' http://localhost:8080/courses/2
curl -i http://localhost:8080/courses/3
curl -i http://localhost:8080/courses/4
curl -i http://localhost:8080/courses/not-a-number
curl -i -H 'X-Correlation-Id: learn-005' http://localhost:8080/courses/5
```

预期分别得到 200、404、409、422、400 和 500。404 body 的 `code` 为 `course.not-found`；500 body
不含 `IllegalStateException`、`internal SQL sample` 或 `/srv/private`。服务端只有 500 场景产生本课
定义的一条 ERROR 事件，事件含 Throwable 与 `learn-005`。

## 八、如何使用

把本课方法应用到真实接口时，按以下顺序进行：

1. 列出成功、可预期业务分支和意外失败。
2. 决定哪些分支用结果对象，哪些故障必须保留异常 cause。
3. 为每个公开失败固定 status、type、code 与安全消息。
4. 在 Web adapter 集中实现映射，不让 Service 依赖 HTTP 类型。
5. 选择真正需要调查的事件和 level，并确保同一 Throwable 只记录一次。
6. 为日志字段建立允许列表、类型与长度上限。
7. 在请求边界建立 correlationId，并保证 MDC 清理。
8. 配置 encoder、appender 与滚动策略后，用真实输出验证。

## 九、适用与不适用场景

**适用：**

- API 客户端需要稳定识别不同失败并采取动作。
- 一个业务用例同时被 HTTP、消息或批处理入口调用。
- 服务端需要通过关联 ID 调查一次请求的多个事件。
- 文件日志需要明确的编码、滚动与保留边界。

**不必机械套用：**

- 只会返回单一成功值的方法不必强行包成通用 Result。
- 正常、高频且无需调查的 4xx 不必全部打印 ERROR stack。
- 单进程同步关联不等于分布式追踪，不能用 MDC 代替 trace context。
- 滚动文件不等于备份、审计归档或日志平台可用性保证。

## 十、当前项目补充

本节只使用冻结审计已经登记的路径与稳定符号，不重新读取、运行或修改 `dzzz-app`。五条 evidence
均标记为 `observed`，只说明冻结快照中存在相应形态，不表示实现符合现代推荐方式：

1. `LoggingTailReadResult` 帮助学习者识别“结果对象”形态，但是否满足互斥分支合同仍需项目实战取证。
2. `validator.Result` 说明项目存在通用结果类型，不代表所有字段组合都有效，也不代表应直接作为 HTTP body。
3. `ArgumentNotValidException` 说明存在参数异常边界；具体应映射 400 还是 422 必须由 API 合同决定。
4. `InnerProjectRollingFileAppender` 说明项目存在自定义 appender；是否仍需自定义要对照目标版本重新验证。
5. `InnerProjectSizeAndTimeBasedRollingPolicy` 说明项目存在自定义 rolling policy；本课不把旧实现复制成推荐配置。

冻结能力和风险节点用于决定教学范围，不代表已确认某个当前文件泄露信息。任何具体缺陷结论都需要在
项目实战阶段对当前快照重新取证。

## 十一、Java 8 / Spring Boot 2.3 兼容写法

旧版没有 Spring `ProblemDetail`，可以定义不可变错误体并由 handler 明确返回 status：

```java
public final class ApiError {
    private final String code;
    private final String message;
    private final String correlationId;

    /** 创建 Java 8 可用的安全错误响应。 */
    public ApiError(String code, String message, String correlationId) {
        this.code = code;
        this.message = message;
        this.correlationId = correlationId;
    }

    /** 返回稳定机器错误码。 */
    public String getCode() {
        return code;
    }

    /** 返回安全的人类消息。 */
    public String getMessage() {
        return message;
    }

    /** 返回日志关联 ID。 */
    public String getCorrelationId() {
        return correlationId;
    }
}
```

legacy handler 使用 Spring 5 的 `ResponseEntity`：

```java
@ControllerAdvice
public final class LegacyApiErrorHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger(LegacyApiErrorHandler.class);

    /** 把课程缺失转换成 Java 8 可序列化的 404 body。 */
    @ExceptionHandler(CourseNotFoundException.class)
    public ResponseEntity<ApiError> handleMissing(CourseNotFoundException exception) {
        ApiError body = new ApiError(
                "course.not-found",
                "没有找到指定课程",
                MDC.get("correlationId")
        );
        return new ResponseEntity<ApiError>(body, HttpStatus.NOT_FOUND);
    }

    /** 对意外失败记录一次完整异常并返回通用 500。 */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception exception) {
        LOGGER.error("Unhandled course lookup failure", exception);
        ApiError body = new ApiError(
                "internal-error",
                "请求暂时无法完成",
                MDC.get("correlationId")
        );
        return new ResponseEntity<ApiError>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

Java 8 filter 使用 `MDC.put` 与 finally：

```java
MDC.put("correlationId", correlationId);
try {
    chain.doFilter(request, response);
} finally {
    MDC.remove("correlationId");
}
```

旧线仍要分别编译、启动和请求验证。Java 25 下使用 `--release 8` 只能证明没有引用较新的 Java API，
不能冒充真实 JDK 8 runtime 证据。

## 十二、新旧版本差异

| 对比项 | 现代主线 | Java 8 / Boot 2.3 | 迁移注意 |
| --- | --- | --- | --- |
| 结果类型 | sealed interface + record | final class + 构造器/getter | 保持业务分支与字段合同一致 |
| HTTP 错误体 | Spring `ProblemDetail` / `ErrorResponse` | 自定义 `ApiError` + `ResponseEntity` | 不在旧线伪造现代框架类 |
| HTTP 状态类型 | `HttpStatusCode` 与 `HttpStatus` | `HttpStatus` | handler 签名按目标 Spring 版本编写 |
| 日志字段 | SLF4J 2 fluent `addKeyValue` | 经典 placeholder API | 旧线没有 `atInfo()`/`atError()` |
| 结构化输出 | Boot 4.1 内置 ECS/GELF/Logstash | 无同名内置属性 | legacy JSON encoder 需另做依赖研究 |
| MDC 清理 | `putCloseable` | put + finally remove | 两线都必须验证无跨请求残留 |
| Logback | 1.5.34 | 1.2.3 | 配置分别装载与触发滚动 |

## 十三、易错点

:::pitfalls
### 错误：所有失败都返回 200 和 success=false

**现象：** HTTP 响应始终为 200，客户端只能解析 body 中的 `success=false` 才能识别失败。

**触发条件：** 只追求 JSON 外形统一，忽略 HTTP 已有的失败语义。

**原因：** 把业务 JSON 外形误当成完整协议。影响所有使用 HTTP 的版本；判断依据是 frontmatter 中的
RFC 9110 状态语义与 RFC 9457 Problem Details 来源卡。

**后果：** 客户端、代理和监控无法按协议识别失败，缓存与重试也可能作出错误判断。

**错误示例：**

```java
return ResponseEntity.ok(Map.of("success", false, "code", "course.not-found"));
```

**正确写法：**

```java
ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
problem.setProperty("code", "course.not-found");
return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problem);
```

**影响版本：** 所有使用 HTTP 的现代与 legacy 版本。

**验证方式：** 对真实 response status、content type 与 body status 做精确断言。

**来源：** `rfc-9110-status`、`rfc-9457-problem-details`。

### 错误：直接返回 exception message

**现象：** 500 body 出现 SQL、文件路径、Java 类名或底层异常原文。

**触发条件：** 把内部诊断文本当作用户提示。

**原因：** 错误地假设 exception message 是稳定且安全的公开信息。影响现代与 legacy 两条版本线；判断
依据是 frontmatter 中的 Spring 错误响应、OWASP Error Handling 与 Logging 来源卡。

**后果：** 可能泄露 SQL、路径、类名、第三方响应或秘密，且内部重构会破坏公开合同。

**错误示例：**

```java
return ProblemDetail.forStatusAndDetail(
        HttpStatus.INTERNAL_SERVER_ERROR,
        exception.getMessage()
);
```

**正确写法：**

```java
LOGGER.error("Unhandled course lookup failure", exception);
return ProblemDetail.forStatusAndDetail(
        HttpStatus.INTERNAL_SERVER_ERROR,
        "请求暂时无法完成"
);
```

**影响版本：** 现代与 legacy 两条版本线。

**验证方式：** 注入含内部样本的异常，断言响应 body 不包含任何禁止样本。

**来源：** `spring-7-error-responses`、`owasp-error-handling`、`owasp-logging`。

### 错误：同一异常在每一层重复记录

**现象：** 一次失败生成多条相同 stack trace，ERROR 计数高于真实失败次数。

**触发条件：** Service、Controller 和 handler 都 catch、log 后再次抛出。

**原因：** 每一层都试图承担最终处理责任。影响所有 SLF4J/Logback 版本；判断依据是本课由 SLF4J
事件合同、Logback architecture 与 OWASP Logging 来源卡支持的“一处记录”工程约定。

**后果：** 同一故障产生多份 stack，告警与计数膨胀，真正的处理边界难以判断。

**错误示例：**

```java
try {
    return repository.find(courseId);
} catch (RuntimeException exception) {
    LOGGER.error("Service failed", exception);
    throw exception;
}
```

**正确写法：**

```java
CourseLookupResult result = repository.find(courseId);
return result;
```

**影响版本：** 所有 SLF4J 与 Logback 版本。

**验证方式：** 捕获 Logback event，意外请求的目标 ERROR 数量必须等于 1。

**来源：** `slf4j-2-logger-api`、`logback-architecture`、`owasp-logging`。

### 错误：MDC 只写入不清理

**现象：** 后续请求的日志错误携带前一个请求的 correlationId。

**触发条件：** filter 调用 `MDC.put` 后没有 finally、close、remove 或 clear。

**原因：** 忽略 Web 容器线程会被后续请求复用。影响现代与 legacy 两条版本线；判断依据是 frontmatter
中的 SLF4J MDC 与 Logback MDC 来源卡。

**后果：** 线程池复用线程后，下一次请求可能带上旧关联 ID，导致错误关联。

**错误示例：**

```java
MDC.put("correlationId", correlationId);
chain.doFilter(request, response);
```

**正确写法：**

```java
try (MDC.MDCCloseable ignored = MDC.putCloseable("correlationId", correlationId)) {
    chain.doFilter(request, response);
}
```

**影响版本：** 现代与 legacy 两条版本线。

**验证方式：** 连续发送两个 ID 不同的请求，并在每次结束后断言 MDC 值为 null。

**来源：** `slf4j-2-mdc-api`、`logback-mdc`。

### 错误：只配置 maxFileSize

**现象：** 活动日志文件会切分，但归档文件持续累积并占满磁盘。

**触发条件：** 只关注活动文件大小，不配置历史与总量边界。

**原因：** 把“切分单个文件”误当成“限制所有归档”。影响 Logback 1.5.34 与 legacy 1.2.3；判断依据
是 frontmatter 中的 Logback Appenders 与 rolling policy history 来源卡。

**后果：** 文件不断被切分，但归档总量仍会无限增长并占满磁盘。

**错误示例：**

```xml
<maxFileSize>20MB</maxFileSize>
```

**正确写法：**

```xml
<maxFileSize>20MB</maxFileSize>
<maxHistory>14</maxHistory>
<totalSizeCap>1GB</totalSizeCap>
<cleanHistoryOnStart>true</cleanHistoryOnStart>
```

**影响版本：** Logback 1.5.34 与 legacy 1.2.3。

**验证方式：** 在临时目录触发多次滚动，检查归档数、总量和活动文件。

**来源：** `logback-appenders`、`logback-news-rolling`。
:::

## 十四、安全注意

- 客户端响应只包含 status、稳定 type/code、公开字段和安全 detail；禁止 stack、SQL、路径与秘密。
- 日志字段采用允许列表和长度上限，优先省略密码、token、session ID、连接串、密钥与完整对象。
- correlationId 是不可信关联值，必须校验，不能作为认证、授权或防重放凭据。
- 参数化日志不能替代去敏或输出编码；按 JSON、纯文本等最终 sink 分别验证特殊字符。
- 日志目录、归档和采集端仍需最小权限、访问审计与处置周期；滚动配置不提供这些保证。

## 十五、性能注意

- 关闭级别时占位符可避免直接字符串拼接，但参数表达式和显式 `toString()` 仍可能提前执行。
- DEBUG/TRACE、高频 stack、无限长度字段和高基数字段会增加 CPU、I/O、存储与查询成本。
- 异步 appender 的队列、丢弃与停机刷新策略不在本课猜测；采用前必须针对目标版本和负载验证。
- 性能结论应在目标 JDK、provider、encoder、appender、字段量和吞吐下用 JFR/JMC 或基准测量。

## 十六、如何验证

完成实现后，至少建立以下反馈环：

1. Java 25 / Boot 4.1 fixture 能编译并真实启动。
2. found 与 missing 结果分支互斥，missing code 固定为 `course.not-found`。
3. 400、404、409、422、500 的真实响应状态与 body status 一致。
4. Problem Details content type 正确，500 body 不含异常类型、内部路径、SQL 或 stack。
5. 意外失败只有一条目标 ERROR，事件带 Throwable 与同一 correlationId。
6. 两个同步请求使用不同 ID，结束后 MDC 为 null。
7. token、密码、CR/LF、引号、反斜杠和超长输入不进入目标日志事件。
8. 结构化输出的每一行都能被 JSON parser 解析。
9. 临时目录中可触发 rolling，活动文件与归档满足配置边界。
10. 独立 Boot 2.3 fixture 使用 Java 8 语法、ApiError、经典 SLF4J API 并通过相同关键断言。
11. 所有 fixture、日志和浏览器输出只位于 `/tmp`，完成后清理并确认路径不存在。

:::exercise
### 练习：为课程发布接口设计错误与日志合同

**要求：** 一个发布请求可能成功、课程不存在、状态冲突、发布时间无法处理或数据库意外失败。请为
五个结果选择应用结果或异常表达方式；为四个失败固定 HTTP status、type、code 和安全 detail；设计
只含 `course.id`、`event.action`、`outcome`、`error.code`、correlationId 的日志字段；明确哪些场景
不记录 ERROR、哪个场景记录一次 Throwable；写一个含 `\r\nFORGED=1` 的关联 ID 负例并说明新 ID
格式；最后写出 response、captured event 和 MDC 清理的最小断言。

**验收：** 客户端不解析中文消息；500 不泄露内部样本；同一故障只有一条 ERROR；请求结束后 MDC
为 null；每个序号对应一个可以独立核对的结果。

**参考答案：** 缺失使用 404/`course.not-found`，状态冲突使用 409/`course.state-conflict`，无法处理
的有效指令按本接口合同使用 422/`course.instruction-invalid`，意外数据库失败使用 500/
`internal-error`。前三类返回安全 detail，500 记录一次 Throwable；非法关联 ID 被替换为 UUID。
:::

## 十七、本节小结

- 应用结果、Java 异常、HTTP 错误和服务器日志面向不同使用者，不能互相代替。
- 可预期业务分支适合互斥结果类型，意外失败保留异常与 cause，再由 Web adapter 转换。
- HTTP status、type 和 code 是机器合同；title 与 detail 只供人阅读且必须去敏。
- `@ExceptionHandler` 集中做协议映射，不表示吞掉异常或让所有失败返回 200。
- SLF4J 创建事件，Logback 负责级别、编码、输出和滚动；结构化字段与 message 应分开。
- MDC 只保存短小低敏的同步关联上下文，外部 ID 必须校验，请求结束必须清理。
- 占位符不负责去敏和日志注入防护；允许列表、长度限制和最终格式编码缺一不可。
- 滚动策略限制文件生命周期，不替代备份、权限、日志采集、磁盘监控或真实验证。
