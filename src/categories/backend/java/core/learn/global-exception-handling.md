---
id: backend.java.learn.intermediate.global-exception-handling
type: lesson
title: 全局异常处理
summary: 用全局异常映射把业务失败、绑定失败与校验失败转换成稳定且安全的 Problem Details
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 240
prerequisites:
  - backend.java.learn.intermediate.unified-api-response
objectives:
  - 能说明 Controller 局部处理器、全局 advice、异常深度与 advice 顺序如何决定最终处理器。
  - 能把业务不存在、业务冲突、字段校验、方法校验、不可读请求体和类型不匹配映射成真实 HTTP 状态。
  - 能从 BindingResult 提取全部字段错误，并生成稳定的 field、code、message 数组。
  - 能让 JDK 25 的 ProblemDetail 与 Java 8 的 ApiProblem 产生同形错误 JSON。
  - 能保证本课 advice 生成的错误使用 application/problem+json，且响应状态与 body status 一致。
  - 能实现去敏的 500 兜底，并用同一个 traceId 关联响应与服务端日志。
  - 能区分业务资源不存在、没有 handler 与静态资源不存在三条 404 链路。
  - 能验证全局处理没有包装成功响应，也没有把 405 和 415 误改成 500。
recap:
  - RestControllerAdvice 集中处理多个 Controller 的异常，但 Controller 内的局部处理器仍然优先。
  - 异常类型深度和 advice order 决定处理器选择，方法在文件中的先后顺序不决定优先级。
  - 现代线使用 ProblemDetail 承载标准字段和扩展字段，Java 8 使用强类型 ApiProblem 保持同一 JSON。
  - RequestBody 校验与方法参数校验来自不同异常，两条版本线也使用不同的方法校验异常。
  - 字段错误必须全部保留、稳定排序且显式映射 code，不能返回 rejectedValue 或底层异常消息。
  - 本课 advice 生成的非字段错误将 errors 固定为 []，错误媒体类型固定为 application/problem+json。
  - 未知 500 对客户端使用固定安全文案，完整异常只记录在服务端并复用响应中的 traceId。
  - ResponseEntityExceptionHandler 保留 MVC 内建异常映射，业务 404 不等于未知 URL 或静态资源 404。
related:
  - backend.java.learn.basics.unified-api-contract
  - backend.java.learn.intermediate.request-validation
  - backend.java.learn.intermediate.unified-api-response
tags:
  - Java
  - Spring Boot
  - Spring MVC
  - 全局异常处理
  - Problem Details
  - ProblemDetail
  - 参数校验
  - 错误去敏
appliesTo: JDK 25、Spring Boot 4.1.0、Spring Framework 7.0.8 主线；Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE 兼容写法；HTTP 错误合同按 RFC 9457
verifiedAt: 2026-08-19
sources:
  - id: spring-boot-4-global-errors-system-requirements
    title: Spring Boot 4.1 System Requirements
    url: https://docs.spring.io/spring-boot/system-requirements.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Spring Boot 4.1.0 至少需要 Java 17、兼容到 Java 26，并要求 Spring Framework 7.0.8 或以上
  - id: spring-boot-4-global-errors-properties
    title: Spring Boot 4.1 Application Properties
    url: https://docs.spring.io/spring-boot/4.1/appendix/application-properties/index.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - spring.mvc.problemdetails.enabled 默认关闭，静态资源映射默认开启并使用通配路径
  - id: spring-7-exception-handler-selection
    title: Spring Framework 7.0 - Exceptions
    url: https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-controller/ann-exceptionhandler.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - ExceptionHandler 按异常类型深度选择 root 或 cause 匹配，多个 advice 还受 order 影响
  - id: spring-7-controller-advice
    title: Spring Framework 7.0 - Controller Advice
    url: https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-controller/ann-advice.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - RestControllerAdvice 组合 ControllerAdvice 与 ResponseBody，且全局处理器位于局部处理器之后
  - id: spring-7-error-responses-global-errors
    title: Spring Framework 7.0 - Error Responses
    url: https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-ann-rest-exceptions.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - ProblemDetail、ErrorResponse 与 ResponseEntityExceptionHandler 提供 RFC 9457 集成
      - ProblemDetail 扩展属性会展开为顶层 JSON，且应使用安全的客户端文案
  - id: spring-7-problem-detail-global-errors
    title: Spring Framework 7.0.8 ProblemDetail API
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/http/ProblemDetail.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - ProblemDetail 表达标准问题成员，并通过 setProperty 添加扩展成员
  - id: spring-7-response-entity-exception-handler-global-errors
    title: Spring Framework 7.0.8 ResponseEntityExceptionHandler API
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/servlet/mvc/method/annotation/ResponseEntityExceptionHandler.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 基类集中处理 MVC 内建异常，并允许覆盖校验、请求体读取和类型转换模板方法
  - id: spring-7-mvc-validation-global-errors
    title: Spring Framework 7.0 - Validation
    url: https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-controller/ann-validation.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - 应分别处理 MethodArgumentNotValidException 与 HandlerMethodValidationException
  - id: spring-7-handler-method-validation-global-errors
    title: Spring Framework 7.0.8 HandlerMethodValidationException API
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/method/annotation/HandlerMethodValidationException.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - Controller 输入参数校验失败使用 400，并提供按方法参数分组的结果
  - id: spring-7-method-argument-not-valid-global-errors
    title: Spring Framework 7.0.8 MethodArgumentNotValidException API
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/bind/MethodArgumentNotValidException.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 异常提供 BindingResult，可读取全部字段错误
  - id: spring-7-type-mismatch-global-errors
    title: Spring Framework 7.0.8 MethodArgumentTypeMismatchException API
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/method/annotation/MethodArgumentTypeMismatchException.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 类型不匹配异常提供公开参数名和目标类型，原始值不应直接进入错误 body
  - id: spring-5-response-entity-exception-handler-global-errors
    title: Spring Framework 5.2.15 ResponseEntityExceptionHandler API
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/servlet/mvc/method/annotation/ResponseEntityExceptionHandler.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Java 8 兼容线可集中处理 MVC 异常，但覆盖方法使用 HttpStatus 且没有 ProblemDetail
  - id: spring-boot-2-global-errors-system-requirements
    title: Spring Boot 2.3.12 System Requirements
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Spring Boot 2.3.12 支持 Java 8，并要求 Spring Framework 5.2.15 或以上
  - id: rfc-9457-global-errors
    title: RFC 9457 - Problem Details for HTTP APIs
    url: https://www.rfc-editor.org/rfc/rfc9457.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: HTTP Problem Details
    claims:
      - 定义 application/problem+json、五个标准成员与扩展成员
      - body status 必须与实际 HTTP 状态一致，Problem Details 不用于暴露底层调试信息
  - id: rfc-9110-global-errors
    title: RFC 9110 - HTTP Semantics
    url: https://www.rfc-editor.org/rfc/rfc9110.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: HTTP status semantics
    claims:
      - 400、404、409 与 500 分别表达请求错误、资源缺失、状态冲突与未预期服务端失败
  - id: owasp-logging-global-errors
    title: OWASP Logging Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
    sourceOrigin: official
    sourceType: security-standard
    appliesTo: 服务端错误日志安全
    claims:
      - 可使用交互标识关联事件，日志不得直接记录 token、口令、会话标识、连接串与密钥
---

# 全局异常处理

TeamFlow 已经能校验请求并返回稳定的成功 DTO，但失败仍可能从不同位置离开请求链：JSON 读取可能失败，
参数可能不满足约束，业务层也可能找不到成员或发现状态冲突。如果每个 Controller 都各写一套
`try/catch`，同一种失败很快就会出现不同状态、不同字段和不同安全边界。

本课只集中转换这些失败。成功响应继续遵守上一课：单资源直接返回 DTO，创建使用 201 和 `Location`，
删除使用无正文的 204；不会给成功 JSON 增加 `data`、`code` 或 `message` 外壳。本课也不实现认证、数据库、
OpenAPI、MDC 或分布式追踪。

## 一、先分清异常和公开错误

### 1. 异常是内部控制流，Problem Details 是 HTTP 合同

Java 异常携带调用栈、cause 和内部诊断文本，适合在程序内部传播失败；HTTP 客户端只需要可以行动的
公开信息。两者不能直接等同：`MemberNotFoundException` 可以成为 404，但异常类名和
`exception.getMessage()` 都不是稳定的客户端合同。

TeamFlow 的错误响应固定为：

```json
{
  "type": "https://api.teamflow.example/problems/member-not-found",
  "title": "成员不存在",
  "status": 404,
  "detail": "没有找到编号为 404 的成员",
  "instance": "/api/v1/teams/TEAM-1/members/404",
  "code": "MEMBER_NOT_FOUND",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "errors": []
}
```

HTTP 状态行仍是 404，`Content-Type` 是 `application/problem+json`。`status` 是真实状态的副本，不能让
状态行写 200 而 body 写 404。非字段错误的 `errors` 固定为 `[]`，不是 `null` 或缺失。

### 2. 全局处理器位于 Web 边界

`@ExceptionHandler` 把一种异常转换成一种 HTTP 结果；`@RestControllerAdvice` 让这些方法作用于多个
Controller。处理器属于 Web adapter，不应让 Service 返回 `ProblemDetail` 或依赖 servlet 请求。

先看两个最明确的业务映射：

```java
@RestControllerAdvice
final class BusinessExceptionHandler {

    /** 把成员缺失异常转换成公开 404。 */
    @ExceptionHandler(MemberNotFoundException.class)
    ResponseEntity<ProblemDetail> handleNotFound(MemberNotFoundException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.NOT_FOUND,
                "没有找到指定成员"
        );
        problem.setTitle("成员不存在");
        problem.setProperty("code", "MEMBER_NOT_FOUND");
        problem.setProperty("errors", List.of());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problem);
    }

    /** 把成员状态冲突转换成公开 409。 */
    @ExceptionHandler(MemberConflictException.class)
    ResponseEntity<ProblemDetail> handleConflict(MemberConflictException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.CONFLICT,
                "该显示名称已经加入当前团队"
        );
        problem.setTitle("成员状态冲突");
        problem.setProperty("code", "MEMBER_CONFLICT");
        problem.setProperty("errors", List.of());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problem);
    }
}
```

这里故意先展示“具体异常 -> 具体状态”的直接关系。完整工程稍后再集中补齐 `type`、`instance`、
`traceId` 和框架异常，避免第一个示例就被基类模板方法遮住。

### 3. 处理器选择不看书写顺序

同一个 Controller 中的局部 handler 先于全局 advice。对同一个 advice，Spring 按异常类型深度选择更接近
实际异常的匹配，root exception 通常先于 cause match；多个 advice 还会先按 order 排序。把
`@ExceptionHandler(Exception.class)` 写在文件最后，并不会让它自动成为最低优先级。

本课只保留一个自定义 advice，也不在 Controller 中声明局部 handler。这样同类失败只有一个公开出口。
需要多个 advice 时，应先明确它们的职责与 order，而不是依赖源码位置。

## 二、统一 Problem Details 字段

### 1. 现代线用 ProblemDetail 承载标准成员

Spring Framework 7 的 `ProblemDetail` 已提供 `type`、`title`、`status`、`detail`、`instance`。TeamFlow 的
`code`、`traceId` 和 `errors` 使用扩展属性；Spring 的 Jackson mixin 会把这些属性展开到 JSON 顶层：

```java
/** 构造字段完整的现代 Problem Details。 */
private ProblemDetail problem(
        HttpStatusCode status,
        String type,
        String title,
        String detail,
        String instance,
        String code,
        String traceId,
        List<FieldProblem> errors
) {
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
    problem.setType(URI.create(type));
    problem.setTitle(title);
    problem.setInstance(URI.create(instance));
    problem.setProperty("code", code);
    problem.setProperty("traceId", traceId);
    problem.setProperty("errors", errors);
    return problem;
}
```

返回值仍显式设置 `application/problem+json`，让媒体类型合同在代码和 HTTP 验收中都可见。

### 2. Java 8 用强类型 DTO 生成同形 JSON

Spring Framework 5.2 没有 `ProblemDetail`、`ErrorResponse` 或 `HttpStatusCode`。兼容线不能创建同包名的
仿制类，而应定义自己的不可变 `ApiProblem`，构造器一次接收八个公开成员，并为每个字段提供 getter。

两条版本线的内部类不同，客户端看到的 JSON 必须相同。使用强类型 DTO 而不是临时
`Map<String, Object>`，可以让缺字段、`errors: null` 和字段类型漂移在编译与验收时更容易被发现。

### 3. 字段错误只公开稳定信息

请求体字段校验从 `MethodArgumentNotValidException.getBindingResult().getFieldErrors()` 读取全部错误。
每项只保留三个字段：

| 字段 | 来源 | 公开规则 |
| --- | --- | --- |
| `field` | `FieldError.getField()` | 使用客户端已经知道的 DTO 字段名 |
| `code` | 显式约束映射 | `NotBlank` 转为 `NOT_BLANK`，未知约束转为 `INVALID` |
| `message` | 约束注解中的固定消息 | 只能使用课程已经确认可公开的文案 |

不要返回 `rejectedValue`。它可能是邮箱、口令、token 或一大段请求内容。错误按 `field` 再按 `code`
排序，使现代线、Java 8 线与重复请求都得到确定顺序；同一字段的多条错误全部保留，不能只取第一条。

```java
List<FieldProblem> errors = exception.getBindingResult().getFieldErrors().stream()
        .map(error -> new FieldProblem(
                error.getField(),
                stableCode(error.getCode()),
                error.getDefaultMessage()
        ))
        .sorted(Comparator.comparing(FieldProblem::field).thenComparing(FieldProblem::code))
        .toList();
```

这段代码只适用于现代 record 访问器。Java 8 改用循环、`Collections.sort` 与普通 getter，但排序和公开字段
合同不变。

## 三、按失败来源分流

### 1. RequestBody 校验与方法校验不是同一异常

`@Valid @RequestBody` 的对象字段失败使用 `MethodArgumentNotValidException`。Spring Framework 7 对 query
或 path 参数上的直接约束使用 `HandlerMethodValidationException`；Java 8 / Spring 5.2 的 Controller
沿用 spring-08 的类型级 `@Validated` AOP 路径，抛出 `ConstraintViolationException`。

三种异常最终都可以返回 400，但提取数据的 API 不同：

| 入口 | 现代异常 | Java 8 异常 | TeamFlow code |
| --- | --- | --- | --- |
| RequestBody 字段约束 | `MethodArgumentNotValidException` | 同名异常 | `MEMBER_VALIDATION_FAILED` |
| query/path 直接约束 | `HandlerMethodValidationException` | `ConstraintViolationException` | `REQUEST_VALIDATION_FAILED` |

现代线从 `ParameterValidationResult` 读取 query 参数错误；兼容线从 constraint violation 的 property path、
约束注解名称和安全 message 构造相同 `errors`。不能只处理请求体校验后便声称“所有参数错误都已统一”。

### 2. 不可读 JSON 与类型不匹配需要固定文案

JSON 少右括号、字段形状错误或 converter 无法读取请求体时会出现 `HttpMessageNotReadableException`。
它的 cause 可能包含 Jackson 类名、源码位置和原始输入，因此公开 detail 固定为“请求体不是可读取的 JSON”。

query/path 无法转换为目标类型时会出现 `MethodArgumentTypeMismatchException`，它是
`TypeMismatchException` 的子类。可以公开参数名和课程定义的目标类型说明，不能回显任意原始值或
`exception.getMessage()`。

### 3. 业务失败与协议失败使用真实状态

本课完整矩阵如下：

| 场景 | HTTP 状态 | code | errors |
| --- | ---: | --- | --- |
| 业务成员不存在 | 404 | `MEMBER_NOT_FOUND` | `[]` |
| 重复成员名称或成员状态冲突 | 409 | `MEMBER_CONFLICT` | `[]` |
| 请求体字段校验失败 | 400 | `MEMBER_VALIDATION_FAILED` | 字段错误数组 |
| query/path 方法校验失败 | 400 | `REQUEST_VALIDATION_FAILED` | 参数错误数组 |
| 请求体不可读 | 400 | `REQUEST_BODY_NOT_READABLE` | `[]` |
| 参数类型不匹配 | 400 | `ARGUMENT_TYPE_MISMATCH` | 一个参数错误 |
| 未预期服务器异常 | 500 | `INTERNAL_ERROR` | `[]` |

RFC 9457 的校验示例使用 422，但它不是对所有校验失败的强制规则。TeamFlow 已在 web-05 和 spring-08
冻结校验失败为 400，本课不能悄悄改成 422。

## 四、守住 traceId、日志与 404 边界

### 1. 本地 traceId 只用于关联

本课第一次处理错误时生成一个无连字符的 UUID，把它保存在 request attribute；同一请求后续读取同一个值：

```java
/** 返回当前错误处理使用的 32 位小写十六进制追踪标识。 */
private String traceId(HttpServletRequest request) {
    Object existing = request.getAttribute(TRACE_ID_ATTRIBUTE);
    if (existing instanceof String) {
        return (String) existing;
    }
    String created = UUID.randomUUID().toString().replace("-", "");
    request.setAttribute(TRACE_ID_ATTRIBUTE, created);
    return created;
}
```

它满足 web-05 的公开格式，也能让响应与本次日志关联，但它不是用户 ID、权限凭据或业务主键。本课不信任
任意客户端 `X-Trace-Id`，也不声称已经解析 W3C `traceparent`、实现采样或完成跨服务传播。

### 2. 只有未知 500 记录完整异常

400、404、409 使用固定 title、detail 与稳定 code，不打印完整 stack trace，也不记录请求 body 或
rejected value。未知 500 向客户端返回固定安全 detail，并在服务端 ERROR 日志中记录同一个 traceId 和
完整异常：

```java
String traceId = traceId(request);
LOGGER.error("Unhandled request, traceId={}", traceId, exception);
```

即使内部消息包含 SQL、文件路径、类名、连接串或 token，响应 body 也不能出现这些内容。MDC、结构化 JSON
日志、采样、聚合与告警属于后续可观测性课程。

### 3. 业务 404 不等于未知 URL

业务 404 表示请求已经匹配 Controller，只是 Service 找不到成员 `404`。完全未知 URL 可能由
`DispatcherServlet` 产生 `NoHandlerFoundException`；默认静态资源 handler 又可能先接住通配路径，现代
Spring 还会使用 `NoResourceFoundException`。Java 8 / Boot 2.3 的默认配置与现代线也不同。

因此本课完整实现只冻结业务 404 的 Problem body，对未知 URL 只验证真实状态仍是 404。不要为了统一它而
关闭全局静态资源映射；那会改变页面、资源和后续跨域联调的行为。

### 4. 基类保护 MVC 内建状态

单独写一个 `@ExceptionHandler(Exception.class)` 可能抢先把 405、415 或其他框架异常变成 500。完整工程
让 advice 继承 `ResponseEntityExceptionHandler`：业务异常仍用具体 `@ExceptionHandler`，框架异常通过
protected 模板方法定制，最后才保留未知异常兜底。

继承基类后，不得再为 `MethodArgumentNotValidException` 声明一个新的注解方法；基类已经注册该异常，
重复注册会让应用启动时报 ambiguous handler。现代模板参数使用 `HttpStatusCode`，Java 8 模板参数使用
`HttpStatus`，两套源码必须分别编译。

## 五、JDK 25 完整 TeamFlow 工程

### 1. 创建独立 Maven 工程

创建目录 `teamflow-global-errors-modern`，使用下面的完整 `pom.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
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

  <groupId>com.teamflow</groupId>
  <artifactId>teamflow-global-errors-modern</artifactId>
  <version>1.0.0</version>

  <properties>
    <java.version>25</java.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-webmvc</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-validation</artifactId>
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

工程只使用内存成员表，不引入数据库：

```text
teamflow-global-errors-modern/
├── pom.xml
└── src/main/
    ├── java/com/teamflow/error/
    │   ├── ErrorApplication.java
    │   ├── Member.java
    │   ├── CreateMemberRequest.java
    │   ├── MemberResponse.java
    │   ├── PageResponse.java
    │   ├── MemberService.java
    │   ├── MemberNotFoundException.java
    │   ├── MemberConflictException.java
    │   ├── MemberController.java
    │   ├── FieldProblem.java
    │   └── GlobalExceptionHandler.java
    └── resources/application.properties
```

### 2. 编写启动类与配置

`src/main/java/com/teamflow/error/ErrorApplication.java`：

```java
package com.teamflow.error;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 启动现代全局异常处理示例。
 */
@SpringBootApplication
public class ErrorApplication {

    /**
     * 启动 Spring Boot Web 应用。
     *
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        SpringApplication.run(ErrorApplication.class, args);
    }
}
```

`src/main/resources/application.properties`：

```properties
spring.application.name=teamflow-global-errors-modern
```

不要开启 `spring.mvc.problemdetails.enabled`。Boot 4.1 默认关闭该开关，本工程已经提供自己的 advice；同时
开启会再引入一套自动配置的 Problem Details advice 和额外顺序问题。

### 3. 定义成员模型与公开 DTO

`src/main/java/com/teamflow/error/Member.java`：

```java
package com.teamflow.error;

/**
 * 表示应用内部保存的成员。
 *
 * @param id 成员 ID
 * @param teamId 团队 ID
 * @param displayName 显示名称
 * @param role 成员角色
 * @param internalNote 内部备注
 */
record Member(long id, String teamId, String displayName, String role, String internalNote) {
}
```

`src/main/java/com/teamflow/error/CreateMemberRequest.java`：

```java
package com.teamflow.error;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 表示创建成员时读取的请求体。
 *
 * @param displayName 显示名称
 * @param role 成员角色
 */
public record CreateMemberRequest(
        @NotBlank(message = "成员名称不能为空")
        @Size(max = 40, message = "成员名称最多 40 个字符")
        String displayName,
        @NotBlank(message = "成员角色不能为空")
        String role) {
}
```

`src/main/java/com/teamflow/error/MemberResponse.java`：

```java
package com.teamflow.error;

/**
 * 表示客户端可见的成员资源。
 *
 * @param id 成员 ID
 * @param displayName 显示名称
 * @param role 成员角色
 */
public record MemberResponse(String id, String displayName, String role) {

    /**
     * 从内部成员创建公开响应。
     *
     * @param member 内部成员
     * @return 公开成员响应
     */
    static MemberResponse from(Member member) {
        return new MemberResponse(
                Long.toString(member.id()), member.displayName(), member.role());
    }
}
```

`src/main/java/com/teamflow/error/PageResponse.java`：

```java
package com.teamflow.error;

import java.util.List;

/**
 * 表示一页公开资源。
 *
 * @param items 当前页资源
 * @param nextPageToken 下一页游标，没有下一页时为 null
 * @param <T> 资源类型
 */
public record PageResponse<T>(List<T> items, String nextPageToken) {

    /** 保存当前页列表的不可变快照。 */
    public PageResponse {
        items = List.copyOf(items);
    }
}
```

成功 DTO 没有错误字段，错误对象也不会代替成功 DTO。两种响应通过 HTTP 状态和媒体类型保持清晰边界。

### 4. 用业务异常离开 Service

`src/main/java/com/teamflow/error/MemberNotFoundException.java`：

```java
package com.teamflow.error;

/**
 * 表示请求的业务成员不存在。
 */
final class MemberNotFoundException extends RuntimeException {
    private final long memberId;

    /**
     * 创建成员缺失异常。
     *
     * @param memberId 公开成员 ID
     */
    MemberNotFoundException(long memberId) {
        super("Member not found: " + memberId);
        this.memberId = memberId;
    }

    /**
     * 返回可用于安全公开说明的成员 ID。
     *
     * @return 成员 ID
     */
    long memberId() {
        return memberId;
    }
}
```

`src/main/java/com/teamflow/error/MemberConflictException.java`：

```java
package com.teamflow.error;

/**
 * 表示成员名称已经属于当前团队成员。
 */
final class MemberConflictException extends RuntimeException {

    /** 创建不暴露内部数据结构的成员冲突异常。 */
    MemberConflictException() {
        super("Member display name already exists");
    }
}
```

`src/main/java/com/teamflow/error/MemberService.java`：

```java
package com.teamflow.error;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

/**
 * 使用内存数据提供成员业务结果。
 */
@Service
final class MemberService {
    private final Map<String, LinkedHashMap<Long, Member>> membersByTeam = new LinkedHashMap<>();
    private long nextId = 3L;

    /** 创建 Service 并准备固定成员样本。 */
    MemberService() {
        LinkedHashMap<Long, Member> members = new LinkedHashMap<>();
        members.put(1L, new Member(1L, "TEAM-1", "周宁", "Designer", "内部备注 A"));
        members.put(2L, new Member(2L, "TEAM-1", "林澄", "Developer", "内部备注 B"));
        membersByTeam.put("TEAM-1", members);
        membersByTeam.put("TEAM-EMPTY", new LinkedHashMap<>());
    }

    /**
     * 查询指定成员。
     *
     * @param teamId 团队 ID
     * @param memberId 成员 ID
     * @return 已找到的成员
     */
    Member find(String teamId, long memberId) {
        if (memberId == 500L) {
            throw new IllegalStateException("Repository read failed for member 500");
        }
        Member member = teamMembers(teamId).get(memberId);
        if (member == null) {
            throw new MemberNotFoundException(memberId);
        }
        return member;
    }

    /**
     * 查询一页成员。
     *
     * @param teamId 团队 ID
     * @param pageToken 下一页游标
     * @return 当前页成员
     */
    PageResponse<MemberResponse> list(String teamId, String pageToken) {
        List<Member> members = new ArrayList<>(teamMembers(teamId).values());
        int start = "PAGE-2".equals(pageToken) ? 1 : 0;
        List<MemberResponse> items = members.stream()
                .skip(start)
                .limit(1)
                .map(MemberResponse::from)
                .toList();
        String nextPageToken = start == 0 && members.size() > 1 ? "PAGE-2" : null;
        return new PageResponse<>(items, nextPageToken);
    }

    /**
     * 创建成员。
     *
     * @param teamId 团队 ID
     * @param request 已校验的创建请求
     * @return 已创建的成员
     */
    Member create(String teamId, CreateMemberRequest request) {
        boolean duplicate = teamMembers(teamId).values().stream()
                .anyMatch(member -> member.displayName().equals(request.displayName()));
        if (duplicate) {
            throw new MemberConflictException();
        }
        long memberId = nextId++;
        Member member = new Member(
                memberId, teamId, request.displayName(), request.role(), "仅内部可见");
        teamMembers(teamId).put(memberId, member);
        return member;
    }

    /**
     * 删除指定成员。
     *
     * @param teamId 团队 ID
     * @param memberId 成员 ID
     */
    void delete(String teamId, long memberId) {
        if (teamMembers(teamId).remove(memberId) == null) {
            throw new MemberNotFoundException(memberId);
        }
    }

    /**
     * 返回团队成员表。
     *
     * @param teamId 团队 ID
     * @return 团队成员表
     */
    private LinkedHashMap<Long, Member> teamMembers(String teamId) {
        return membersByTeam.computeIfAbsent(teamId, ignored -> new LinkedHashMap<>());
    }
}
```

Service 只抛业务异常或真正的系统异常，不读取 `HttpServletRequest`，也不创建 `ProblemDetail`。HTTP 映射
完全留在下一步的 Web 边界。

### 5. 保持 Controller 只描述成功路径

`src/main/java/com/teamflow/error/MemberController.java`：

```java
package com.teamflow.error;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import java.net.URI;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/**
 * 提供成员资源的成功 HTTP 路径。
 */
@RestController
@RequestMapping("/api/v1/teams/{teamId}/members")
final class MemberController {
    private final MemberService memberService;

    /**
     * 创建成员 Controller。
     *
     * @param memberService 成员服务
     */
    MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    /**
     * 查询指定成员。
     *
     * @param teamId 团队 ID
     * @param memberId 成员 ID
     * @return 成员资源
     */
    @GetMapping(path = "/{memberId}", produces = MediaType.APPLICATION_JSON_VALUE)
    MemberResponse find(@PathVariable String teamId, @PathVariable long memberId) {
        return MemberResponse.from(memberService.find(teamId, memberId));
    }

    /**
     * 查询一页成员。
     *
     * @param teamId 团队 ID
     * @param pageToken 下一页游标
     * @return 成员分页响应
     */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    PageResponse<MemberResponse> list(
            @PathVariable String teamId,
            @RequestParam(required = false)
            @Pattern(regexp = "PAGE-2", message = "分页游标必须为 PAGE-2")
            String pageToken) {
        return memberService.list(teamId, pageToken);
    }

    /**
     * 创建成员。
     *
     * @param teamId 团队 ID
     * @param request 已校验的创建请求
     * @return 201、Location 与成员资源
     */
    @PostMapping(
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<MemberResponse> create(
            @PathVariable String teamId,
            @Valid @RequestBody CreateMemberRequest request) {
        Member member = memberService.create(teamId, request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{memberId}")
                .buildAndExpand(member.id())
                .toUri();
        return ResponseEntity.created(location).body(MemberResponse.from(member));
    }

    /**
     * 删除指定成员。
     *
     * @param teamId 团队 ID
     * @param memberId 成员 ID
     * @return 无正文的 204
     */
    @DeleteMapping("/{memberId}")
    ResponseEntity<Void> delete(@PathVariable String teamId, @PathVariable long memberId) {
        memberService.delete(teamId, memberId);
        return ResponseEntity.noContent().build();
    }
}
```

Controller 没有 `try/catch` 或局部 `@ExceptionHandler`。正常请求仍返回上一课的成功结构；异常才离开
Controller 并由唯一的全局 advice 转换。

### 6. 实现现代全局异常处理器

`src/main/java/com/teamflow/error/FieldProblem.java`：

```java
package com.teamflow.error;

/**
 * 表示一个客户端可见的字段问题。
 *
 * @param field 字段或参数名
 * @param code 稳定约束码
 * @param message 安全提示
 */
public record FieldProblem(String field, String code, String message) {
}
```

`src/main/java/com/teamflow/error/GlobalExceptionHandler.java`：

```java
package com.teamflow.error;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.TypeMismatchException;
import org.springframework.context.MessageSourceResolvable;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.validation.method.ParameterValidationResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * 把业务异常和 Spring MVC 失败转换成 TeamFlow 错误合同。
 */
@RestControllerAdvice
final class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final String TRACE_ID_ATTRIBUTE = "com.teamflow.error.traceId";
    private static final String TYPE_ROOT = "https://api.teamflow.example/problems/";

    /**
     * 把成员缺失转换成稳定 404。
     *
     * @param exception 成员缺失异常
     * @param request 当前请求
     * @return TeamFlow 404 Problem Details
     */
    @ExceptionHandler(MemberNotFoundException.class)
    ResponseEntity<Object> handleMemberNotFound(
            MemberNotFoundException exception,
            HttpServletRequest request) {
        return problem(
                HttpStatus.NOT_FOUND,
                HttpHeaders.EMPTY,
                "member-not-found",
                "成员不存在",
                "没有找到编号为 " + exception.memberId() + " 的成员",
                "MEMBER_NOT_FOUND",
                List.of(),
                request);
    }

    /**
     * 把成员状态冲突转换成稳定 409。
     *
     * @param exception 成员冲突异常
     * @param request 当前请求
     * @return TeamFlow 409 Problem Details
     */
    @ExceptionHandler(MemberConflictException.class)
    ResponseEntity<Object> handleMemberConflict(
            MemberConflictException exception,
            HttpServletRequest request) {
        return problem(
                HttpStatus.CONFLICT,
                HttpHeaders.EMPTY,
                "member-conflict",
                "成员状态冲突",
                "该显示名称已经加入当前团队",
                "MEMBER_CONFLICT",
                List.of(),
                request);
    }

    /**
     * 把 RequestBody 字段校验失败转换成全部字段错误。
     *
     * @param exception 请求体校验异常
     * @param headers 框架响应头
     * @param status 框架状态
     * @param request 当前 Web 请求
     * @return TeamFlow 400 Problem Details
     */
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException exception,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        List<FieldProblem> errors = exception.getBindingResult().getFieldErrors().stream()
                .map(this::fieldProblem)
                .sorted(fieldProblemOrder())
                .toList();
        return problem(
                status,
                headers,
                "member-validation-failed",
                "成员参数校验失败",
                "有 " + errors.size() + " 个字段不符合成员创建合同",
                "MEMBER_VALIDATION_FAILED",
                errors,
                servletRequest(request));
    }

    /**
     * 把现代 MVC 方法参数校验失败转换成参数错误。
     *
     * @param exception 方法参数校验异常
     * @param headers 框架响应头
     * @param status 框架状态
     * @param request 当前 Web 请求
     * @return TeamFlow 400 Problem Details
     */
    @Override
    protected ResponseEntity<Object> handleHandlerMethodValidationException(
            HandlerMethodValidationException exception,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        List<FieldProblem> errors = new ArrayList<>();
        for (ParameterValidationResult result : exception.getParameterValidationResults()) {
            String field = parameterName(result.getMethodParameter());
            for (MessageSourceResolvable error : result.getResolvableErrors()) {
                errors.add(new FieldProblem(
                        field,
                        stableCode(lastCode(error)),
                        safeMessage(error.getDefaultMessage())));
            }
        }
        errors.sort(fieldProblemOrder());
        return problem(
                status,
                headers,
                "request-validation-failed",
                "请求参数校验失败",
                "请求参数不符合接口约束",
                "REQUEST_VALIDATION_FAILED",
                errors,
                servletRequest(request));
    }

    /**
     * 把不可读请求体转换成固定安全 400。
     *
     * @param exception 请求体读取异常
     * @param headers 框架响应头
     * @param status 框架状态
     * @param request 当前 Web 请求
     * @return TeamFlow 400 Problem Details
     */
    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(
            HttpMessageNotReadableException exception,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        return problem(
                status,
                headers,
                "request-body-not-readable",
                "请求体无法读取",
                "请求体不是可读取的 JSON",
                "REQUEST_BODY_NOT_READABLE",
                List.of(),
                servletRequest(request));
    }

    /**
     * 把 query 或 path 类型不匹配转换成参数错误。
     *
     * @param exception 类型不匹配异常
     * @param headers 框架响应头
     * @param status 框架状态
     * @param request 当前 Web 请求
     * @return TeamFlow 400 Problem Details
     */
    @Override
    protected ResponseEntity<Object> handleTypeMismatch(
            TypeMismatchException exception,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        String field = exception instanceof MethodArgumentTypeMismatchException mismatch
                ? mismatch.getName()
                : "request";
        List<FieldProblem> errors = List.of(new FieldProblem(
                field,
                "TYPE_MISMATCH",
                field + " 必须使用接口声明的类型"));
        return problem(
                status,
                headers,
                "argument-type-mismatch",
                "请求参数类型不正确",
                "请检查请求参数的类型",
                "ARGUMENT_TYPE_MISMATCH",
                errors,
                servletRequest(request));
    }

    /**
     * 保留 MVC 内建异常的真实状态，并补齐 TeamFlow 字段。
     *
     * @param exception MVC 内建异常
     * @param body 框架原始 body
     * @param headers 框架响应头
     * @param status 框架状态
     * @param request 当前 Web 请求
     * @return 与原状态一致的 Problem Details
     */
    @Override
    protected ResponseEntity<Object> handleExceptionInternal(
            Exception exception,
            Object body,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        String slug;
        String title;
        String code;
        switch (status.value()) {
            case 405 -> {
                slug = "method-not-allowed";
                title = "请求方法不受支持";
                code = "METHOD_NOT_ALLOWED";
            }
            case 415 -> {
                slug = "media-type-not-supported";
                title = "媒体类型不受支持";
                code = "MEDIA_TYPE_NOT_SUPPORTED";
            }
            default -> {
                slug = "request-rejected";
                title = "请求无法处理";
                code = "REQUEST_REJECTED";
            }
        }
        return problem(
                status,
                headers,
                slug,
                title,
                "请求不符合当前接口的协议要求",
                code,
                List.of(),
                servletRequest(request));
    }

    /**
     * 对未预期失败记录一次完整异常并返回去敏 500。
     *
     * @param exception 未预期异常
     * @param request 当前请求
     * @return TeamFlow 500 Problem Details
     */
    @ExceptionHandler(Exception.class)
    ResponseEntity<Object> handleUnexpected(
            Exception exception,
            HttpServletRequest request) {
        String traceId = traceId(request);
        LOGGER.error("Unhandled request, traceId={}", traceId, exception);
        return problem(
                HttpStatus.INTERNAL_SERVER_ERROR,
                HttpHeaders.EMPTY,
                "internal-error",
                "服务器内部错误",
                "服务器暂时无法处理请求",
                "INTERNAL_ERROR",
                List.of(),
                request);
    }

    /**
     * 构造媒体类型、状态和字段一致的 Problem Details。
     *
     * @param status HTTP 状态
     * @param headers 需要保留的框架响应头
     * @param typeSlug 问题类型末段
     * @param title 问题类型摘要
     * @param detail 本次失败的安全说明
     * @param code 稳定机器错误码
     * @param errors 字段错误
     * @param request 当前请求
     * @return 完整错误响应
     */
    private ResponseEntity<Object> problem(
            HttpStatusCode status,
            HttpHeaders headers,
            String typeSlug,
            String title,
            String detail,
            String code,
            List<FieldProblem> errors,
            HttpServletRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setType(URI.create(TYPE_ROOT + typeSlug));
        problem.setTitle(title);
        problem.setInstance(URI.create(request.getRequestURI()));
        problem.setProperty("code", code);
        problem.setProperty("traceId", traceId(request));
        problem.setProperty("errors", errors);
        return ResponseEntity.status(status)
                .headers(headers)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problem);
    }

    /**
     * 把 Spring 字段错误转换成公开字段问题。
     *
     * @param error Spring 字段错误
     * @return TeamFlow 字段问题
     */
    private FieldProblem fieldProblem(FieldError error) {
        return new FieldProblem(
                error.getField(),
                stableCode(error.getCode()),
                safeMessage(error.getDefaultMessage()));
    }

    /**
     * 返回字段错误的确定性排序规则。
     *
     * @return 先字段、后错误码的比较器
     */
    private Comparator<FieldProblem> fieldProblemOrder() {
        return Comparator.comparing(FieldProblem::field).thenComparing(FieldProblem::code);
    }

    /**
     * 从 RequestParam 注解或方法参数中取得公开参数名。
     *
     * @param parameter 方法参数
     * @return 公开参数名
     */
    private String parameterName(MethodParameter parameter) {
        RequestParam requestParam = parameter.getParameterAnnotation(RequestParam.class);
        if (requestParam != null && !requestParam.name().isEmpty()) {
            return requestParam.name();
        }
        String parameterName = parameter.getParameterName();
        return parameterName == null ? "request" : parameterName;
    }

    /**
     * 取得消息 code 列表中的默认约束名。
     *
     * @param error 可解析错误
     * @return 默认约束名，没有时为 null
     */
    private String lastCode(MessageSourceResolvable error) {
        String[] codes = error.getCodes();
        return codes == null || codes.length == 0 ? null : codes[codes.length - 1];
    }

    /**
     * 把框架约束名映射为稳定公开 code。
     *
     * @param code 框架约束名
     * @return TeamFlow 字段错误码
     */
    private String stableCode(String code) {
        if (code == null) {
            return "INVALID";
        }
        return switch (code) {
            case "NotBlank" -> "NOT_BLANK";
            case "Size" -> "SIZE";
            case "Pattern" -> "PATTERN";
            case "NotNull" -> "NOT_NULL";
            case "Min" -> "MIN";
            case "Max" -> "MAX";
            default -> "INVALID";
        };
    }

    /**
     * 保证客户端始终收到非空安全消息。
     *
     * @param message 约束消息
     * @return 安全消息
     */
    private String safeMessage(String message) {
        return message == null ? "参数不符合约束" : message;
    }

    /**
     * 把 WebRequest 转换为当前 servlet 请求。
     *
     * @param request 当前 Web 请求
     * @return servlet 请求
     */
    private HttpServletRequest servletRequest(WebRequest request) {
        return ((ServletWebRequest) request).getRequest();
    }

    /**
     * 返回当前错误处理使用的追踪标识。
     *
     * @param request 当前请求
     * @return 32 位小写十六进制追踪标识
     */
    private String traceId(HttpServletRequest request) {
        Object existing = request.getAttribute(TRACE_ID_ATTRIBUTE);
        if (existing instanceof String traceId) {
            return traceId;
        }
        String created = UUID.randomUUID().toString().replace("-", "");
        request.setAttribute(TRACE_ID_ATTRIBUTE, created);
        return created;
    }
}
```

字段校验 override 从 `BindingResult` 取全部错误；方法校验 override 按参数结果展开；不可读 JSON 与类型
不匹配只返回固定安全信息。基类继续掌握 405、415 等内建异常，`handleExceptionInternal` 只补齐统一错误
字段，不改变原始状态和 `Allow` 等响应头。

### 7. 构建并运行 HTTP 矩阵

在现代工程根目录执行：

```bash
mvn clean package
java -jar target/teamflow-global-errors-modern-1.0.0.jar
```

用以下请求逐项观察成功和失败。`-i` 会同时显示状态、响应头和 body：

```bash
curl -i http://localhost:8080/api/v1/teams/TEAM-1/members/1

curl -i -X POST http://localhost:8080/api/v1/teams/TEAM-1/members \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"顾言","role":"Tester"}'

curl -i -X DELETE http://localhost:8080/api/v1/teams/TEAM-1/members/2

curl -i http://localhost:8080/api/v1/teams/TEAM-1/members/404

curl -i -X POST http://localhost:8080/api/v1/teams/TEAM-1/members \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"周宁","role":"Tester"}'

curl -i -X POST http://localhost:8080/api/v1/teams/TEAM-1/members \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"","role":""}'

curl -i -X POST http://localhost:8080/api/v1/teams/TEAM-1/members \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"顾言","role":"Tester"'

curl -i 'http://localhost:8080/api/v1/teams/TEAM-1/members?pageToken=PAGE-3'
curl -i http://localhost:8080/api/v1/teams/TEAM-1/members/not-a-number
curl -i http://localhost:8080/api/v1/teams/TEAM-1/members/500

curl -i -X POST http://localhost:8080/api/v1/teams/TEAM-1/members/1
curl -i -X POST http://localhost:8080/api/v1/teams/TEAM-1/members \
  -H 'Content-Type: text/plain' \
  -d 'not-json'

curl -i http://localhost:8080/completely-unknown
```

应观察到：

- 三条成功请求分别保持 200 普通 JSON、201 加 `Location`、204 无正文，没有成功外壳。
- 业务缺失为 404，重复成员名称为 409；两者 `errors` 都是 `[]`。
- 名称与角色同时错误时，400 的 `errors` 同时包含 `displayName/NOT_BLANK` 与 `role/NOT_BLANK`。
- `pageToken=PAGE-3` 和成员 ID `not-a-number` 都是 400，但分别使用 `REQUEST_VALIDATION_FAILED` 和
  `ARGUMENT_TYPE_MISMATCH`。
- 损坏 JSON 是固定去敏的 400；成员 `500` 是固定去敏的 500，body 不出现 `Repository` 或
  `member 500`，服务端 ERROR 日志出现相同 traceId 和完整异常。
- 错误 method 与错误媒体类型仍是 405 和 415，没有被未知异常兜底改成 500。
- 完全未知 URL 保持 404；本课不承诺它与业务 404 使用相同 body。

本课 advice 生成的 TeamFlow Problem 响应都必须同时满足：媒体类型为 `application/problem+json`、状态行
等于 body `status`、`traceId` 匹配 `^[0-9a-f]{32}$`，并且非字段错误的 `errors` 为 `[]`。完全未知 URL
只断言真实 404，不对它的媒体类型或 body 字段作承诺。

## 六、Java 8 完整兼容工程

### 1. 使用独立 POM 与端口

创建目录 `teamflow-global-errors-java8`。它必须由真实 Java 8 环境独立编译和运行，不能复用现代工程的
class 文件。完整 `pom.xml` 如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
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

  <groupId>com.teamflow</groupId>
  <artifactId>teamflow-global-errors-java8</artifactId>
  <version>1.0.0</version>

  <properties>
    <java.version>1.8</java.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-validation</artifactId>
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

目录职责与现代工程一致，并额外使用 `ApiProblem.java` 表示公开错误：

```text
teamflow-global-errors-java8/
├── pom.xml
└── src/main/
    ├── java/com/teamflow/error/
    │   ├── ErrorApplication.java
    │   ├── Member.java
    │   ├── CreateMemberRequest.java
    │   ├── MemberResponse.java
    │   ├── PageResponse.java
    │   ├── MemberService.java
    │   ├── MemberNotFoundException.java
    │   ├── MemberConflictException.java
    │   ├── MemberController.java
    │   ├── FieldProblem.java
    │   ├── ApiProblem.java
    │   └── GlobalExceptionHandler.java
    └── resources/application.properties
```

`src/main/java/com/teamflow/error/ErrorApplication.java`：

```java
package com.teamflow.error;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 启动 Java 8 全局异常处理示例。
 */
@SpringBootApplication
public class ErrorApplication {

    /**
     * 启动兼容版 Spring Boot Web 应用。
     *
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        SpringApplication.run(ErrorApplication.class, args);
    }
}
```

`src/main/resources/application.properties`：

```properties
spring.application.name=teamflow-global-errors-java8
server.port=8081
```

在 IDEA 中同时把 Project SDK、Module SDK、Maven Runner JRE 与 POM 编译目标设为 Java 8，再 Reload Maven。

### 2. 用普通类保持同一成员合同

`src/main/java/com/teamflow/error/Member.java`：

```java
package com.teamflow.error;

/**
 * 表示 Java 8 工程内部保存的成员。
 */
final class Member {
    final long id;
    final String teamId;
    final String displayName;
    final String role;
    final String internalNote;

    /**
     * 创建内部成员。
     *
     * @param id 成员 ID
     * @param teamId 团队 ID
     * @param displayName 显示名称
     * @param role 成员角色
     * @param internalNote 内部备注
     */
    Member(long id, String teamId, String displayName, String role, String internalNote) {
        this.id = id;
        this.teamId = teamId;
        this.displayName = displayName;
        this.role = role;
        this.internalNote = internalNote;
    }
}
```

`src/main/java/com/teamflow/error/CreateMemberRequest.java`：

```java
package com.teamflow.error;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/**
 * 表示 Java 8 创建成员请求。
 */
public final class CreateMemberRequest {
    @NotBlank(message = "成员名称不能为空")
    @Size(max = 40, message = "成员名称最多 40 个字符")
    private String displayName;

    @NotBlank(message = "成员角色不能为空")
    private String role;

    /**
     * 创建供 JSON 绑定使用的空请求对象。
     */
    public CreateMemberRequest() {
    }

    /**
     * 返回显示名称。
     *
     * @return 显示名称
     */
    public String getDisplayName() {
        return displayName;
    }

    /**
     * 设置成员显示名称。
     *
     * @param displayName 成员显示名称
     */
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    /**
     * 返回成员角色。
     *
     * @return 成员角色
     */
    public String getRole() {
        return role;
    }

    /**
     * 设置成员角色。
     *
     * @param role 成员角色
     */
    public void setRole(String role) {
        this.role = role;
    }
}
```

`src/main/java/com/teamflow/error/MemberResponse.java`：

```java
package com.teamflow.error;

/**
 * 表示 Java 8 客户端可见的成员资源。
 */
public final class MemberResponse {
    private final String id;
    private final String displayName;
    private final String role;

    /**
     * 创建公开成员响应。
     *
     * @param id 成员 ID
     * @param displayName 显示名称
     * @param role 成员角色
     */
    public MemberResponse(String id, String displayName, String role) {
        this.id = id;
        this.displayName = displayName;
        this.role = role;
    }

    /**
     * 从内部成员创建公开响应。
     *
     * @param member 内部成员
     * @return 公开成员响应
     */
    static MemberResponse from(Member member) {
        return new MemberResponse(
                String.valueOf(member.id), member.displayName, member.role);
    }

    /**
     * 返回成员 ID。
     *
     * @return 成员 ID
     */
    public String getId() {
        return id;
    }

    /**
     * 返回显示名称。
     *
     * @return 显示名称
     */
    public String getDisplayName() {
        return displayName;
    }

    /**
     * 返回成员角色。
     *
     * @return 成员角色
     */
    public String getRole() {
        return role;
    }
}
```

`src/main/java/com/teamflow/error/PageResponse.java`：

```java
package com.teamflow.error;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 表示 Java 8 兼容线的一页公开资源。
 *
 * @param <T> 资源类型
 */
public final class PageResponse<T> {
    private final List<T> items;
    private final String nextPageToken;

    /**
     * 创建成员分页响应并保存列表快照。
     *
     * @param items 当前页成员
     * @param nextPageToken 下一页游标
     */
    public PageResponse(List<T> items, String nextPageToken) {
        this.items = Collections.unmodifiableList(new ArrayList<T>(items));
        this.nextPageToken = nextPageToken;
    }

    /**
     * 返回当前页成员。
     *
     * @return 不可变成员列表
     */
    public List<T> getItems() {
        return items;
    }

    /**
     * 返回下一页游标。
     *
     * @return 下一页游标，没有下一页时为 null
     */
    public String getNextPageToken() {
        return nextPageToken;
    }
}
```

这些普通类只是 Java 8 表达方式的差异。公开 ID 仍是字符串，分页字段仍是 `items` 与
`nextPageToken`，错误处理不能借版本兼容改变成功 JSON。

### 3. 编写 Java 8 业务边界

`src/main/java/com/teamflow/error/MemberNotFoundException.java`：

```java
package com.teamflow.error;

/**
 * 表示 Java 8 工程中的业务成员不存在。
 */
final class MemberNotFoundException extends RuntimeException {
    private final long memberId;

    /**
     * 创建成员缺失异常。
     *
     * @param memberId 公开成员 ID
     */
    MemberNotFoundException(long memberId) {
        super("Member not found: " + memberId);
        this.memberId = memberId;
    }

    /**
     * 返回成员 ID。
     *
     * @return 成员 ID
     */
    long getMemberId() {
        return memberId;
    }
}
```

`src/main/java/com/teamflow/error/MemberConflictException.java`：

```java
package com.teamflow.error;

/**
 * 表示 Java 8 工程中的成员状态冲突。
 */
final class MemberConflictException extends RuntimeException {

    /** 创建不暴露内部数据结构的成员冲突异常。 */
    MemberConflictException() {
        super("Member display name already exists");
    }
}
```

`src/main/java/com/teamflow/error/MemberService.java`：

```java
package com.teamflow.error;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

/**
 * 使用 Java 8 集合保存成员业务状态。
 */
@Service
final class MemberService {
    private final Map<String, LinkedHashMap<Long, Member>> membersByTeam =
            new LinkedHashMap<String, LinkedHashMap<Long, Member>>();
    private long nextId = 3L;

    /** 创建 Service 并准备固定成员样本。 */
    MemberService() {
        LinkedHashMap<Long, Member> members = new LinkedHashMap<Long, Member>();
        members.put(1L, new Member(1L, "TEAM-1", "周宁", "Designer", "内部备注 A"));
        members.put(2L, new Member(2L, "TEAM-1", "林澄", "Developer", "内部备注 B"));
        membersByTeam.put("TEAM-1", members);
        membersByTeam.put("TEAM-EMPTY", new LinkedHashMap<Long, Member>());
    }

    /**
     * 查询指定成员。
     *
     * @param teamId 团队 ID
     * @param memberId 成员 ID
     * @return 已找到的成员
     */
    Member find(String teamId, long memberId) {
        if (memberId == 500L) {
            throw new IllegalStateException("Repository read failed for member 500");
        }
        Member member = teamMembers(teamId).get(memberId);
        if (member == null) {
            throw new MemberNotFoundException(memberId);
        }
        return member;
    }

    /**
     * 查询一页成员。
     *
     * @param teamId 团队 ID
     * @param pageToken 下一页游标
     * @return 当前页成员
     */
    PageResponse<MemberResponse> list(String teamId, String pageToken) {
        List<Member> members = new ArrayList<Member>(teamMembers(teamId).values());
        List<MemberResponse> items = new ArrayList<MemberResponse>();
        int start = "PAGE-2".equals(pageToken) ? 1 : 0;
        if (start < members.size()) {
            items.add(MemberResponse.from(members.get(start)));
        }
        String nextPageToken = start == 0 && members.size() > 1 ? "PAGE-2" : null;
        return new PageResponse<MemberResponse>(items, nextPageToken);
    }

    /**
     * 创建成员。
     *
     * @param teamId 团队 ID
     * @param request 已校验的创建请求
     * @return 已创建的成员
     */
    Member create(String teamId, CreateMemberRequest request) {
        for (Member member : teamMembers(teamId).values()) {
            if (member.displayName.equals(request.getDisplayName())) {
                throw new MemberConflictException();
            }
        }
        long memberId = nextId++;
        Member member = new Member(
                memberId,
                teamId,
                request.getDisplayName(),
                request.getRole(),
                "仅内部可见");
        teamMembers(teamId).put(memberId, member);
        return member;
    }

    /**
     * 删除指定成员。
     *
     * @param teamId 团队 ID
     * @param memberId 成员 ID
     */
    void delete(String teamId, long memberId) {
        if (teamMembers(teamId).remove(memberId) == null) {
            throw new MemberNotFoundException(memberId);
        }
    }

    /**
     * 返回团队成员表。
     *
     * @param teamId 团队 ID
     * @return 团队成员表
     */
    private LinkedHashMap<Long, Member> teamMembers(String teamId) {
        LinkedHashMap<Long, Member> members = membersByTeam.get(teamId);
        if (members == null) {
            members = new LinkedHashMap<Long, Member>();
            membersByTeam.put(teamId, members);
        }
        return members;
    }
}
```

`src/main/java/com/teamflow/error/MemberController.java`：

```java
package com.teamflow.error;

import java.net.URI;
import javax.validation.Valid;
import javax.validation.constraints.Pattern;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/**
 * 提供 Java 8 成员成功路径，并启用旧 AOP 方法校验。
 */
@Validated
@RestController
@RequestMapping("/api/v1/teams/{teamId}/members")
public class MemberController {
    private final MemberService memberService;

    /**
     * 创建成员 Controller。
     *
     * @param memberService 成员服务
     */
    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    /**
     * 查询指定成员。
     *
     * @param teamId 团队 ID
     * @param memberId 成员 ID
     * @return 成员资源
     */
    @GetMapping(path = "/{memberId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public MemberResponse find(@PathVariable String teamId, @PathVariable long memberId) {
        return MemberResponse.from(memberService.find(teamId, memberId));
    }

    /**
     * 查询一页成员。
     *
     * @param teamId 团队 ID
     * @param pageToken 下一页游标
     * @return 成员分页响应
     */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public PageResponse<MemberResponse> list(
            @PathVariable String teamId,
            @RequestParam(required = false)
            @Pattern(regexp = "PAGE-2", message = "分页游标必须为 PAGE-2")
            String pageToken) {
        return memberService.list(teamId, pageToken);
    }

    /**
     * 创建成员。
     *
     * @param teamId 团队 ID
     * @param request 已校验的创建请求
     * @return 201、Location 与成员资源
     */
    @PostMapping(
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<MemberResponse> create(
            @PathVariable String teamId,
            @Valid @RequestBody CreateMemberRequest request) {
        Member member = memberService.create(teamId, request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{memberId}")
                .buildAndExpand(member.id)
                .toUri();
        return ResponseEntity.created(location).body(MemberResponse.from(member));
    }

    /**
     * 删除指定成员。
     *
     * @param teamId 团队 ID
     * @param memberId 成员 ID
     * @return 无正文的 204
     */
    @DeleteMapping("/{memberId}")
    public ResponseEntity<Void> delete(
            @PathVariable String teamId,
            @PathVariable long memberId) {
        memberService.delete(teamId, memberId);
        return ResponseEntity.noContent().build();
    }
}
```

类型级 `@Validated` 只属于 Spring 5.2 的旧 AOP 路径。它让 query 约束失败抛
`ConstraintViolationException`；现代 Controller 不应复制这个注解。

### 4. 定义 Java 8 错误 DTO 与全局处理器

`src/main/java/com/teamflow/error/FieldProblem.java`：

```java
package com.teamflow.error;

/**
 * 表示 Java 8 错误响应中的字段问题。
 */
public final class FieldProblem {
    private final String field;
    private final String code;
    private final String message;

    /**
     * 创建字段问题。
     *
     * @param field 字段或参数名
     * @param code 稳定约束码
     * @param message 安全提示
     */
    public FieldProblem(String field, String code, String message) {
        this.field = field;
        this.code = code;
        this.message = message;
    }

    /**
     * 返回字段名。
     *
     * @return 字段名
     */
    public String getField() {
        return field;
    }

    /**
     * 返回稳定错误码。
     *
     * @return 错误码
     */
    public String getCode() {
        return code;
    }

    /**
     * 返回安全提示。
     *
     * @return 安全提示
     */
    public String getMessage() {
        return message;
    }
}
```

`src/main/java/com/teamflow/error/ApiProblem.java`：

```java
package com.teamflow.error;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 表示 Java 8 兼容线的 Problem Details 外部合同。
 */
public final class ApiProblem {
    private final String type;
    private final String title;
    private final int status;
    private final String detail;
    private final String instance;
    private final String code;
    private final String traceId;
    private final List<FieldProblem> errors;

    /**
     * 创建字段完整的错误响应。
     *
     * @param type 问题类型 URI
     * @param title 问题摘要
     * @param status HTTP 状态
     * @param detail 安全说明
     * @param instance 请求路径
     * @param code 稳定机器码
     * @param traceId 关联标识
     * @param errors 字段问题
     */
    public ApiProblem(
            String type,
            String title,
            int status,
            String detail,
            String instance,
            String code,
            String traceId,
            List<FieldProblem> errors) {
        this.type = type;
        this.title = title;
        this.status = status;
        this.detail = detail;
        this.instance = instance;
        this.code = code;
        this.traceId = traceId;
        this.errors = Collections.unmodifiableList(new ArrayList<FieldProblem>(errors));
    }

    /**
     * 返回问题类型。
     *
     * @return 问题类型 URI
     */
    public String getType() {
        return type;
    }

    /**
     * 返回问题摘要。
     *
     * @return 问题摘要
     */
    public String getTitle() {
        return title;
    }

    /**
     * 返回 HTTP 状态。
     *
     * @return HTTP 状态
     */
    public int getStatus() {
        return status;
    }

    /**
     * 返回安全说明。
     *
     * @return 安全说明
     */
    public String getDetail() {
        return detail;
    }

    /**
     * 返回请求实例路径。
     *
     * @return 请求路径
     */
    public String getInstance() {
        return instance;
    }

    /**
     * 返回稳定机器码。
     *
     * @return 稳定机器码
     */
    public String getCode() {
        return code;
    }

    /**
     * 返回请求关联标识。
     *
     * @return traceId
     */
    public String getTraceId() {
        return traceId;
    }

    /**
     * 返回字段问题数组。
     *
     * @return 不可变字段问题列表
     */
    public List<FieldProblem> getErrors() {
        return errors;
    }
}
```

`src/main/java/com/teamflow/error/GlobalExceptionHandler.java`：

```java
package com.teamflow.error;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import javax.servlet.http.HttpServletRequest;
import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.TypeMismatchException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * 把 Java 8 业务异常和 Spring MVC 失败转换成同形 TeamFlow 错误。
 */
@RestControllerAdvice
final class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final String TRACE_ID_ATTRIBUTE = "com.teamflow.error.traceId";
    private static final String TYPE_ROOT = "https://api.teamflow.example/problems/";

    /**
     * 把成员缺失转换成 404。
     *
     * @param exception 成员缺失异常
     * @param request 当前请求
     * @return TeamFlow 404 错误
     */
    @ExceptionHandler(MemberNotFoundException.class)
    ResponseEntity<Object> handleMemberNotFound(
            MemberNotFoundException exception,
            HttpServletRequest request) {
        return problem(
                HttpStatus.NOT_FOUND,
                "member-not-found",
                "成员不存在",
                "没有找到编号为 " + exception.getMemberId() + " 的成员",
                "MEMBER_NOT_FOUND",
                Collections.<FieldProblem>emptyList(),
                new HttpHeaders(),
                request);
    }

    /**
     * 把成员冲突转换成 409。
     *
     * @param exception 成员冲突异常
     * @param request 当前请求
     * @return TeamFlow 409 错误
     */
    @ExceptionHandler(MemberConflictException.class)
    ResponseEntity<Object> handleMemberConflict(
            MemberConflictException exception,
            HttpServletRequest request) {
        return problem(
                HttpStatus.CONFLICT,
                "member-conflict",
                "成员状态冲突",
                "该显示名称已经加入当前团队",
                "MEMBER_CONFLICT",
                Collections.<FieldProblem>emptyList(),
                new HttpHeaders(),
                request);
    }

    /**
     * 把 RequestBody 字段校验失败转换成全部字段错误。
     *
     * @param exception 请求体校验异常
     * @param headers 框架响应头
     * @param status 框架状态
     * @param request 当前 Web 请求
     * @return TeamFlow 400 错误
     */
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException exception,
            HttpHeaders headers,
            HttpStatus status,
            org.springframework.web.context.request.WebRequest request) {
        List<FieldProblem> errors = new ArrayList<FieldProblem>();
        for (FieldError error : exception.getBindingResult().getFieldErrors()) {
            errors.add(fieldProblem(error));
        }
        Collections.sort(errors, fieldProblemOrder());
        return problem(
                status,
                "member-validation-failed",
                "成员参数校验失败",
                "有 " + errors.size() + " 个字段不符合成员创建合同",
                "MEMBER_VALIDATION_FAILED",
                errors,
                headers,
                servletRequest(request));
    }

    /**
     * 把旧 AOP 方法校验失败转换成参数错误。
     *
     * @param exception 方法校验异常
     * @param request 当前请求
     * @return TeamFlow 400 错误
     */
    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<Object> handleConstraintViolation(
            ConstraintViolationException exception,
            HttpServletRequest request) {
        List<FieldProblem> errors = new ArrayList<FieldProblem>();
        for (ConstraintViolation<?> violation : exception.getConstraintViolations()) {
            errors.add(new FieldProblem(
                    lastPathSegment(violation.getPropertyPath().toString()),
                    stableCode(violation.getConstraintDescriptor().getAnnotation().annotationType().getSimpleName()),
                    safeMessage(violation.getMessage())));
        }
        Collections.sort(errors, fieldProblemOrder());
        return problem(
                HttpStatus.BAD_REQUEST,
                "request-validation-failed",
                "请求参数校验失败",
                "请求参数不符合接口约束",
                "REQUEST_VALIDATION_FAILED",
                errors,
                new HttpHeaders(),
                request);
    }

    /**
     * 把不可读请求体转换成固定安全 400。
     *
     * @param exception 请求体读取异常
     * @param headers 框架响应头
     * @param status 框架状态
     * @param request 当前 Web 请求
     * @return TeamFlow 400 错误
     */
    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(
            HttpMessageNotReadableException exception,
            HttpHeaders headers,
            HttpStatus status,
            org.springframework.web.context.request.WebRequest request) {
        return problem(
                status,
                "request-body-not-readable",
                "请求体无法读取",
                "请求体不是可读取的 JSON",
                "REQUEST_BODY_NOT_READABLE",
                Collections.<FieldProblem>emptyList(),
                headers,
                servletRequest(request));
    }

    /**
     * 把类型不匹配转换成参数错误。
     *
     * @param exception 类型不匹配异常
     * @param headers 框架响应头
     * @param status 框架状态
     * @param request 当前 Web 请求
     * @return TeamFlow 400 错误
     */
    @Override
    protected ResponseEntity<Object> handleTypeMismatch(
            TypeMismatchException exception,
            HttpHeaders headers,
            HttpStatus status,
            org.springframework.web.context.request.WebRequest request) {
        String field = exception instanceof MethodArgumentTypeMismatchException
                ? ((MethodArgumentTypeMismatchException) exception).getName()
                : "request";
        List<FieldProblem> errors = Collections.singletonList(new FieldProblem(
                field,
                "TYPE_MISMATCH",
                field + " 必须使用接口声明的类型"));
        return problem(
                status,
                "argument-type-mismatch",
                "请求参数类型不正确",
                "请检查请求参数的类型",
                "ARGUMENT_TYPE_MISMATCH",
                errors,
                headers,
                servletRequest(request));
    }

    /**
     * 对 MVC 内建异常补齐统一字段但保留真实状态。
     *
     * @param exception MVC 内建异常
     * @param body 框架原始 body
     * @param headers 框架响应头
     * @param status 框架状态
     * @param request 当前 Web 请求
     * @return 与原状态一致的错误
     */
    @Override
    protected ResponseEntity<Object> handleExceptionInternal(
            Exception exception,
            Object body,
            HttpHeaders headers,
            HttpStatus status,
            org.springframework.web.context.request.WebRequest request) {
        String slug;
        String title;
        String code;
        if (status == HttpStatus.METHOD_NOT_ALLOWED) {
            slug = "method-not-allowed";
            title = "请求方法不受支持";
            code = "METHOD_NOT_ALLOWED";
        } else if (status == HttpStatus.UNSUPPORTED_MEDIA_TYPE) {
            slug = "media-type-not-supported";
            title = "媒体类型不受支持";
            code = "MEDIA_TYPE_NOT_SUPPORTED";
        } else {
            slug = "request-rejected";
            title = "请求无法处理";
            code = "REQUEST_REJECTED";
        }
        return problem(
                status,
                slug,
                title,
                "请求不符合当前接口的协议要求",
                code,
                Collections.<FieldProblem>emptyList(),
                headers,
                servletRequest(request));
    }

    /**
     * 对未知异常记录一次完整异常并返回去敏 500。
     *
     * @param exception 未知异常
     * @param request 当前请求
     * @return TeamFlow 500 错误
     */
    @ExceptionHandler(Exception.class)
    ResponseEntity<Object> handleUnexpected(
            Exception exception,
            HttpServletRequest request) {
        String traceId = traceId(request);
        LOGGER.error("Unhandled request, traceId={}", traceId, exception);
        return problem(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "internal-error",
                "服务器内部错误",
                "服务器暂时无法处理请求",
                "INTERNAL_ERROR",
                Collections.<FieldProblem>emptyList(),
                new HttpHeaders(),
                request);
    }

    /**
     * 构造状态、媒体类型与 body 一致的兼容错误。
     *
     * @param status HTTP 状态
     * @param typeSlug 问题类型末段
     * @param title 问题摘要
     * @param detail 安全说明
     * @param code 稳定机器码
     * @param errors 字段问题
     * @param headers 需要保留的框架响应头
     * @param request 当前请求
     * @return 完整错误响应
     */
    private ResponseEntity<Object> problem(
            HttpStatus status,
            String typeSlug,
            String title,
            String detail,
            String code,
            List<FieldProblem> errors,
            HttpHeaders headers,
            HttpServletRequest request) {
        String traceId = traceId(request);
        ApiProblem body = new ApiProblem(
                TYPE_ROOT + typeSlug,
                title,
                status.value(),
                detail,
                request.getRequestURI(),
                code,
                traceId,
                errors);
        return ResponseEntity.status(status)
                .headers(headers)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body((Object) body);
    }

    /**
     * 把字段错误转换成公开字段问题。
     *
     * @param error Spring 字段错误
     * @return TeamFlow 字段问题
     */
    private FieldProblem fieldProblem(FieldError error) {
        return new FieldProblem(
                error.getField(),
                stableCode(error.getCode()),
                safeMessage(error.getDefaultMessage()));
    }

    /**
     * 返回字段问题排序规则。
     *
     * @return 先字段后错误码的比较器
     */
    private Comparator<FieldProblem> fieldProblemOrder() {
        return new Comparator<FieldProblem>() {
            /**
             * 按字段名和错误码比较两个字段问题。
             *
             * @param left 左侧字段问题
             * @param right 右侧字段问题
             * @return 负数、零或正数，分别表示左侧小于、等于或大于右侧
             */
            @Override
            public int compare(FieldProblem left, FieldProblem right) {
                int field = left.getField().compareTo(right.getField());
                return field != 0 ? field : left.getCode().compareTo(right.getCode());
            }
        };
    }

    /**
     * 从约束名称映射稳定字段 code。
     *
     * @param code 约束名称
     * @return TeamFlow 字段错误码
     */
    private String stableCode(String code) {
        if ("NotBlank".equals(code)) return "NOT_BLANK";
        if ("Size".equals(code)) return "SIZE";
        if ("Pattern".equals(code)) return "PATTERN";
        if ("NotNull".equals(code)) return "NOT_NULL";
        if ("Min".equals(code)) return "MIN";
        if ("Max".equals(code)) return "MAX";
        return "INVALID";
    }

    /**
     * 返回安全约束消息。
     *
     * @param message 约束消息
     * @return 非空安全消息
     */
    private String safeMessage(String message) {
        return message == null ? "参数不符合约束" : message;
    }

    /**
     * 取属性路径末段作为公开参数名。
     *
     * @param path 属性路径
     * @return 参数名
     */
    private String lastPathSegment(String path) {
        int dot = path.lastIndexOf('.');
        return dot < 0 ? path : path.substring(dot + 1);
    }

    /**
     * 把 WebRequest 转换为 servlet 请求。
     *
     * @param request 当前 Web 请求
     * @return servlet 请求
     */
    private HttpServletRequest servletRequest(org.springframework.web.context.request.WebRequest request) {
        return ((org.springframework.web.context.request.ServletWebRequest) request).getRequest();
    }

    /**
     * 返回当前请求的本地 traceId。
     *
     * @param request 当前请求
     * @return 32 位小写十六进制标识
     */
    private String traceId(HttpServletRequest request) {
        Object existing = request.getAttribute(TRACE_ID_ATTRIBUTE);
        if (existing instanceof String) return (String) existing;
        String created = UUID.randomUUID().toString().replace("-", "");
        request.setAttribute(TRACE_ID_ATTRIBUTE, created);
        return created;
    }
}
```

旧线的 `ResponseEntityExceptionHandler` override 使用 `HttpStatus`，方法校验额外使用
`ConstraintViolationException`。没有 `ProblemDetail`、`HttpStatusCode`、`HandlerMethodValidationException`、
`record` 或 `jakarta.*` import；但 `ApiProblem` 的八个 getter 让 JSON 与现代线保持同形。

### 5. 构建、启动与复跑同一 HTTP 矩阵

在 Java 8 工程根目录执行：

```bash
mvn clean package
java -jar target/teamflow-global-errors-java8-1.0.0.jar
```

Java 8 服务监听 8081。将上一节所有 `http://localhost:8080` 替换为 `http://localhost:8081`，逐项复跑请求，
并比较以下公开结果而不是比较 Java 类名：

| 结果 | 现代线 | Java 8 线 |
| --- | --- | --- |
| 成员成功 | 200 普通 JSON | 200 普通 JSON |
| 创建成功 | 201、Location、成员 DTO | 201、Location、成员 DTO |
| 删除成功 | 204 无正文 | 204 无正文 |
| 业务缺失 | 404、MEMBER_NOT_FOUND | 404、MEMBER_NOT_FOUND |
| 重复成员名称 | 409、MEMBER_CONFLICT | 409、MEMBER_CONFLICT |
| 字段校验 | 400、完整 errors | 400、完整 errors |
| 方法校验 | 400、REQUEST_VALIDATION_FAILED | 400、REQUEST_VALIDATION_FAILED |
| 不可读 JSON | 400、REQUEST_BODY_NOT_READABLE | 400、REQUEST_BODY_NOT_READABLE |
| 类型不匹配 | 400、ARGUMENT_TYPE_MISMATCH | 400、ARGUMENT_TYPE_MISMATCH |
| 未知异常 | 500、INTERNAL_ERROR | 500、INTERNAL_ERROR |
| 405/415 | 保持真实状态 | 保持真实状态 |

## 七、集中排查错误映射

### 六个典型错误

:::pitfalls
### 错误：把异常消息直接返回给客户端

**触发条件：** 在 500 handler 中把 `exception.getMessage()` 作为 detail，或把 JSON 解析 cause 原样放进响应。

**原因：** 异常文本属于内部诊断，可能包含 SQL、文件路径、类名、第三方响应或秘密，并且会随实现重构变化。

**后果：** 公开错误泄露内部结构，客户端还会被迫依赖不稳定文案。

**错误示例：**

```java
return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, exception.getMessage());
```

**正确写法：**

```java
LOGGER.error("Unhandled request, traceId={}", traceId, exception);
return problem(HttpStatus.INTERNAL_SERVER_ERROR, HttpHeaders.EMPTY,
        "internal-error", "服务器内部错误", "服务器暂时无法处理请求",
        "INTERNAL_ERROR", List.of(), request);
```

**影响版本：** 现代与 Java 8 两条线。

**验证方式：** 请求成员 `500`，断言 body 不含 `Repository` 或 `member 500`，日志保留异常堆栈并使用与响应
相同的 traceId。

### 错误：只取第一条字段错误

**触发条件：** 使用 `getFieldErrors().get(0)` 或把所有错误拼成一个 message。

**原因：** 一个请求可以同时违反名称和角色约束；Spring 的 BindingResult 保存的是完整错误集合。

**后果：** 客户端只能修一次一个字段，现代与旧线还可能因为迭代顺序不同而显示不同结果。

**错误示例：**

```java
FieldError first = exception.getBindingResult().getFieldErrors().get(0);
return List.of(fieldProblem(first));
```

**正确写法：**

```java
List<FieldProblem> errors = exception.getBindingResult().getFieldErrors().stream()
        .map(this::fieldProblem)
        .sorted(Comparator.comparing(FieldProblem::field).thenComparing(FieldProblem::code))
        .toList();
```

**影响版本：** 现代与 Java 8；Java 8 使用循环和 getter 实现同一排序。

**验证方式：** 提交 `displayName` 与 `role` 都为空的请求，断言 `errors` 至少包含两个不同字段。

### 错误：继承基类后重复注册内建异常

**触发条件：** advice 已继承 `ResponseEntityExceptionHandler`，又为 `MethodArgumentNotValidException` 添加 `@ExceptionHandler`。

**原因：** 基类已经注册同一异常；注解 handler 与继承 handler 会形成 ambiguous mapping。

**后果：** 应用启动失败，所有 HTTP 验证都无法进入运行阶段。

**错误示例：**

```java
/** 错误示例：重复注册基类已经处理的校验异常。 */
@ExceptionHandler(MethodArgumentNotValidException.class)
ResponseEntity<?> handleAgain(MethodArgumentNotValidException exception) { ... }
```

**正确写法：**

```java
/** 正确示例：覆盖基类的校验模板方法。 */
@Override
protected ResponseEntity<Object> handleMethodArgumentNotValid(
        MethodArgumentNotValidException exception,
        HttpHeaders headers,
        HttpStatusCode status,
        WebRequest request) {
    return super.handleMethodArgumentNotValid(exception, headers, status, request);
}
```

**影响版本：** 现代和 Java 8，唯一区别是现代参数为 `HttpStatusCode`，旧线为 `HttpStatus`。

**验证方式：** 启动两套工程；无 `Ambiguous @ExceptionHandler`，非法 body 返回 400。

### 错误：用宽泛兜底改写 405 和 415

**触发条件：** 只声明 `@ExceptionHandler(Exception.class)`，没有继承基类或覆盖 MVC 内建处理。

**原因：** 框架协议异常也会进入宽泛匹配，错误被当成未知服务器故障。

**后果：** 客户端得到错误状态，监控与重试策略失去 HTTP 语义。

**错误示例：**

```java
/** 错误示例：把所有框架异常都当成未知 500。 */
@ExceptionHandler(Exception.class)
ResponseEntity<?> everything(Exception exception) {
    return ResponseEntity.status(500).body(...);
}
```

**正确写法：**

```java
/** 正确示例：保留 MVC 基类负责的异常集合和状态。 */
final class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
    @Override
    protected ResponseEntity<Object> handleExceptionInternal(
            Exception exception, Object body, HttpHeaders headers,
            HttpStatusCode status, WebRequest request) {
        return super.handleExceptionInternal(exception, body, headers, status, request);
    }
}
```

**影响版本：** 现代与 Java 8。

**验证方式：** 对 GET-only 地址发送 POST，对 JSON-only 地址发送 `Content-Type: text/plain`，观察 405 和 415。

### 错误：把业务 404 当成未知 URL 404

**触发条件：** 看到两个请求都是 404，就认为它们一定经过同一个 ControllerAdvice handler。

**原因：** 业务 404 来自 Service；未知 URL 或静态资源 404 来自 DispatcherServlet/ResourceHttpRequestHandler，
默认配置甚至可能直接提交响应而不抛异常。

**后果：** 课程或 API 文档虚假承诺所有 404 都有同一 Problem body，实际页面和资源请求被错误改写。

**错误示例：**

```java
/** 错误示例：无法保证匹配所有 404 来源的宽泛处理器。 */
@ExceptionHandler(Exception.class)
ResponseEntity<?> assumeEvery404(Exception exception) { ... }
```

**正确写法：**

```java
/** 正确示例：只冻结业务成员不存在的公开合同。 */
@ExceptionHandler(MemberNotFoundException.class)
ResponseEntity<?> handleBusiness404(MemberNotFoundException exception) { ... }
```

**影响版本：** 现代与 Java 8，静态资源异常类型不同。

**验证方式：** 分别请求成员 `404` 与 `/completely-unknown`，前者断言完整业务 Problem，后者只断言真实 404。

### 错误：Java 8 复制现代 API

**触发条件：** 在旧工程直接使用 `ProblemDetail`、`HttpStatusCode`、`HandlerMethodValidationException`、`record` 或 `jakarta.*`。

**原因：** 这些类型或命名空间属于 Spring 6+/Java 16+ 或 Jakarta 迁移后的现代线，Spring 5.2/Java 8 没有它们。

**后果：** 旧工程无法编译，或运行时加载到错误的命名空间。

**错误示例：**

```java
ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
```

**正确写法：**

```java
ApiProblem problem = new ApiProblem(
        "https://api.teamflow.example/problems/request-validation-failed",
        "请求参数校验失败", 400, "请求参数不符合接口约束",
        request.getRequestURI(), "REQUEST_VALIDATION_FAILED", traceId,
        errors);
```

**影响版本：** Java 8 / Spring Boot 2.3 兼容线。

**验证方式：** 对旧工程执行 `mvn clean package`，确认没有现代类型、record 或 `jakarta.*` 编译错误。

:::

## 八、独立练习

:::exercise
### 为团队缺失补齐业务 404

**要求：** 复制本课已经完成的现代与 Java 8 成员工程。新增 `TeamNotFoundException`，让 `MemberService`
在团队 ID 未登记时抛出该异常，并在现有全局 advice 中映射为 404、`TEAM_NOT_FOUND`、
`errors=[]`。成功查询仍返回普通成员 JSON；不能在 Controller 添加局部 handler，也不能改写已有成员 404、
校验 400、冲突 409 或未知 500 合同。

**验收：** `GET /api/v1/teams/TEAM-404/members/1` 在两套工程中都返回 404、
`application/problem+json`、`TEAM_NOT_FOUND`、`errors=[]`，body status 为 404，traceId 为 32 位小写
十六进制；`GET /api/v1/teams/TEAM-1/members/1` 仍返回 200 普通 JSON，`GET /api/v1/teams/TEAM-EMPTY/members`
仍返回 200 空页。
:::

### 1. JDK 25 参考改动

本练习明确沿用第五章的完整现代工程；未列出的文件逐字保持不变。新增
`src/main/java/com/teamflow/error/TeamNotFoundException.java`：

```java
package com.teamflow.error;

/**
 * 表示请求的业务团队不存在。
 */
final class TeamNotFoundException extends RuntimeException {
    private final String teamId;

    /**
     * 创建团队缺失异常。
     *
     * @param teamId 公开团队 ID
     */
    TeamNotFoundException(String teamId) {
        super("Team not found: " + teamId);
        this.teamId = teamId;
    }

    /**
     * 返回可安全公开的团队 ID。
     *
     * @return 团队 ID
     */
    String teamId() {
        return teamId;
    }
}
```

在现代 `MemberService` 中用下面的完整方法替换原 `teamMembers`：

```java
/**
 * 返回已存在团队的成员表。
 *
 * @param teamId 团队 ID
 * @return 团队成员表
 */
private LinkedHashMap<Long, Member> teamMembers(String teamId) {
    LinkedHashMap<Long, Member> members = membersByTeam.get(teamId);
    if (members == null) {
        throw new TeamNotFoundException(teamId);
    }
    return members;
}
```

在现代 `GlobalExceptionHandler` 的业务 handler 区域加入：

```java
/**
 * 把团队缺失转换成稳定 404。
 *
 * @param exception 团队缺失异常
 * @param request 当前请求
 * @return TeamFlow 404 Problem Details
 */
@ExceptionHandler(TeamNotFoundException.class)
ResponseEntity<Object> handleTeamNotFound(
        TeamNotFoundException exception,
        HttpServletRequest request) {
    return problem(
            HttpStatus.NOT_FOUND,
            HttpHeaders.EMPTY,
            "team-not-found",
            "团队不存在",
            "没有找到编号为 " + exception.teamId() + " 的团队",
            "TEAM_NOT_FOUND",
            List.of(),
            request);
}
```

三个改动之外，现代 POM、启动类、Controller、DTO 和 advice 其余方法都使用第五章的完整代码。重新执行
`mvn clean package` 并启动 8080 后验证：

```bash
curl -i http://localhost:8080/api/v1/teams/TEAM-404/members/1
curl -i http://localhost:8080/api/v1/teams/TEAM-1/members/1
curl -i http://localhost:8080/api/v1/teams/TEAM-EMPTY/members
```

第一条得到 404 与 `TEAM_NOT_FOUND`，第二条仍得到 200 普通成员 JSON，第三条仍得到 200 空页。

### 2. Java 8 参考改动

Java 8 同样沿用第六章的完整工程。新增同路径 `TeamNotFoundException.java`：

```java
package com.teamflow.error;

/**
 * 表示 Java 8 工程中的业务团队不存在。
 */
final class TeamNotFoundException extends RuntimeException {
    private final String teamId;

    /**
     * 创建团队缺失异常。
     *
     * @param teamId 公开团队 ID
     */
    TeamNotFoundException(String teamId) {
        super("Team not found: " + teamId);
        this.teamId = teamId;
    }

    /**
     * 返回团队 ID。
     *
     * @return 团队 ID
     */
    String getTeamId() {
        return teamId;
    }
}
```

在 Java 8 `MemberService` 中替换原方法：

```java
/**
 * 返回已存在团队的成员表。
 *
 * @param teamId 团队 ID
 * @return 团队成员表
 */
private LinkedHashMap<Long, Member> teamMembers(String teamId) {
    LinkedHashMap<Long, Member> members = membersByTeam.get(teamId);
    if (members == null) {
        throw new TeamNotFoundException(teamId);
    }
    return members;
}
```

在 Java 8 `GlobalExceptionHandler` 中加入兼容 handler：

```java
/**
 * 把团队缺失转换成稳定 404。
 *
 * @param exception 团队缺失异常
 * @param request 当前请求
 * @return TeamFlow 404 错误
 */
@ExceptionHandler(TeamNotFoundException.class)
ResponseEntity<Object> handleTeamNotFound(
        TeamNotFoundException exception,
        HttpServletRequest request) {
    return problem(
            HttpStatus.NOT_FOUND,
            "team-not-found",
            "团队不存在",
            "没有找到编号为 " + exception.getTeamId() + " 的团队",
            "TEAM_NOT_FOUND",
            Collections.<FieldProblem>emptyList(),
            new HttpHeaders(),
            request);
}
```

保留第六章的 `ApiProblem`、`ConstraintViolationException` 和其余完整文件。用真实 Java 8 执行
`mvn clean package`，启动 8081 后复跑同样三条请求；除端口外，404、普通成员与空页的公开合同应与现代线
一致。

## 九、本课小结

全局异常处理的目标不是把所有失败吞进一个 200 JSON，而是在 Web 边界集中完成稳定、真实且安全的协议映射。
先用具体业务异常表达 404 与 409，再为请求体校验、方法校验、不可读 JSON 和类型不匹配补齐 400；最后保留
一个去敏 500 兜底，并用 `ResponseEntityExceptionHandler` 保护 405、415 等框架状态。

现代 `ProblemDetail` 与 Java 8 `ApiProblem` 是两种内部表示，外部仍共享相同的 `type`、`title`、`status`、
`detail`、`instance`、`code`、`traceId` 和 `errors`。字段错误必须全部保留并稳定排序，非字段错误始终使用
空数组；未知 URL 的 404 与业务资源不存在的 404 也要保持来源边界。完成本课后，下一课才负责把这些能力组合进
完整用户与团队 API。

## 累计项目衔接

累计项目由两版 `ProblemSupport` 集中映射业务异常、请求体解析、缺少请求头、媒体类型和字段校验；安全过滤链
也复用同一字段合同。门禁同时比较 HTTP 状态与 body 的 `status`，并要求每个错误都含稳定 `errors` 数组。
