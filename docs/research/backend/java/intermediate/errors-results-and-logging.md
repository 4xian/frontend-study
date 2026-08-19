# 错误合同、Problem Details 与结构化日志研究稿

## 冻结课程合同

| 项目 | 冻结值 |
| --- | --- |
| 课程 ID | `backend.java.learn.intermediate.errors-results-and-logging` |
| 标题 | 错误合同、Problem Details 与结构化日志 |
| 阶段与顺序 | `intermediate`；Phase C `I-13` |
| 预计时长 | 150 分钟 |
| 唯一前置课程 | `backend.java.learn.intermediate.spring-boot-mysql-mybatis-persistence-bridge`（I-12） |
| 来源能力 | `JAVA-ENGINEERING-005`、`JAVA-ENGINEERING-006`、`JAVA-FRAMEWORK-026`、`JAVA-RISK-012`、`JAVA-RISK-014` |
| 来源性质 | `project-observed`、`risk-correction` |
| 选择原因 | 项目的异常、HTTP 错误和日志存在跨层边界；敏感内容风险只用于去敏与稳定错误合同 |
| 现代主线 | Java 25 LTS、Spring Boot 4.1.0、Spring Framework 7.0.8、SLF4J 2.0.18、Logback 1.5.34 |
| 项目补充 | Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE、SLF4J 1.7.30、Logback 1.2.3 |
| Phase 2 历史冻结状态 | `researchStatus: not-started`、`exampleStatus: not-started`、`courseStatus: planned` |
| 冻结快照 | `dzzz-app-20260803-179e722831ab`；分析 `dzzz-app-analysis-20260803-958d37cf1be1` |
| 项目边界 | 本研究只读取 `docs/backend/java/audit` 冻结产物；不读取、运行或修改 `dzzz-app` |
| 前后批边界 | I-12 已关闭后才可实施本批；I-13 完整关闭前不得领取后继课程 |

本课只建立“应用结果、Java 异常、HTTP 错误响应、服务器日志”四种合同及其转换关系。Spring MVC
完整请求分派、Bean Validation 字段错误、认证授权、分布式追踪、异步线程上下文、日志采集平台和告警
策略分别属于后续课程，不在本课提前扩成完整框架或运维课程。

## 核验基线与研究方法

- 核验日期：2026-08-16。
- Spring Boot 4.1.0 系统要求为 Java 17 至 26，并要求 Spring Framework 7.0.8 或以上；Java 25
  位于支持范围。
- Spring Boot 4.1.0 的依赖坐标页管理 SLF4J 2.0.18 与 Logback 1.5.34。本课的“现代版本”是这组
  Boot 管理基线，不把其他独立发布线混入 fixture。
- legacy 固定为 Spring Boot 2.3.12.RELEASE：Java 8 至 15、Spring Framework
  5.2.15.RELEASE、SLF4J 1.7.30、Logback 1.2.3。旧线不能复制 Spring 6+ 的
  `ProblemDetail`、`ErrorResponse` 或 SLF4J 2 fluent API。
- Tavily 在本批因用量上限未返回结果；按搜索路由仅用 Exa 定位缺失的 JLS 25 直接章节。最终
  结论均回到 IETF RFC Editor、Spring、SLF4J、Logback、Oracle、OWASP 与 MITRE CWE
  直接页面核对；RFC 关键规则同时核对 RFC Editor 官方纯文本。
- 27 个直接 URL 全部使用 `curl -L --fail` 实际 GET，HTTP 状态均为 200。Logback 通用手册是
  滚动文档，不将其当成 1.5.34 的精确版本快照；现代 fixture 版本由 Spring Boot 4.1.0 依赖坐标
  固定为 1.5.34，legacy rolling 能力另由 Logback 1.1.7 官方版本归档证明。
- “错误码命名”“哪一层记录一次异常”“各日志级别的业务含义”属于本课程明确声明的工程约定，不是
  Java、HTTP、Spring 或 SLF4J 强制语法。

## 官方来源卡与直接证据

以下 27 个直接页面均在 2026-08-16 重新核验。正式课程只把实际支持正文结论的条目放入
frontmatter `sources`，由右侧“官方来源”统一展示；正文不再复制“参考资料”或“来源详情”。

### HTTP、结果对象与 Spring 错误合同

| ID | 直接来源 | sourceType | 适用版本 | 支持结论 |
| --- | --- | --- | --- | --- |
| `spring-boot-4-system-requirements` | [Spring Boot 4.1 System Requirements](https://docs.spring.io/spring-boot/4.1/system-requirements.html) | `official-reference` | Spring Boot 4.1.0 | 支持 Java 17 至 26，要求 Spring Framework 7.0.8 或以上。 |
| `spring-boot-4-dependency-coordinates` | [Spring Boot Managed Dependency Coordinates](https://docs.spring.io/spring-boot/appendix/dependency-versions/coordinates.html) | `official-reference` | Spring Boot 4.1.0 | 管理 `slf4j-api` 2.0.18、`logback-classic` 与 `logback-core` 1.5.34。 |
| `rfc-9110-status` | [RFC 9110 §15 Status Codes](https://www.rfc-editor.org/rfc/rfc9110.html#section-15) | `specification` | HTTP | 4xx 表示客户端似乎有误，5xx 表示服务端出错或无法完成；400、404、409、422、500 各有独立语义。 |
| `rfc-9457-problem-details` | [RFC 9457 Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html) | `specification` | HTTP Problem Details | 定义 `type`、`status`、`title`、`detail`、`instance` 与扩展成员；实际 HTTP status 必须与 body 中的 status 一致。 |
| `spring-7-error-responses` | [Spring MVC Error Responses](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-ann-rest-exceptions.html) | `official-reference` | Spring Framework 7.0.8 | `ProblemDetail`/`ErrorResponse` 可由 handler 渲染；`ProblemDetail.status` 决定 HTTP status；建议定制详情以免泄露实现。 |
| `spring-7-problem-detail-api` | [Spring 7.0.8 `ProblemDetail`](https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/http/ProblemDetail.html) | `api-doc` | Spring Framework 7.0.8 | 提供标准五字段、扩展 properties 和 `forStatusAndDetail`；从异常 handler 返回时未设置的 instance 默认使用请求路径。 |
| `spring-7-error-response-api` | [Spring 7.0.8 `ErrorResponse`](https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/ErrorResponse.html) | `api-doc` | Spring Framework 7.0.8 | 完整错误响应同时包含 status、headers 和 RFC 9457 `ProblemDetail` body；body status 应匹配响应 status。 |
| `spring-7-exception-handler-api` | [Spring 7.0.8 `@ExceptionHandler`](https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/bind/annotation/ExceptionHandler.html) | `api-doc` | Spring Framework 7.0.8 | 按异常类型映射 handler；支持返回 `ProblemDetail`、`ErrorResponse`、`ResponseEntity` 等响应类型。 |
| `spring-7-response-entity-exception-handler` | [Spring 7.0.8 `ResponseEntityExceptionHandler`](https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/servlet/mvc/method/annotation/ResponseEntityExceptionHandler.html) | `api-doc` | Spring Framework 7.0.8 | 可作为全局 `@ControllerAdvice` 基类，统一处理 MVC 异常并定制 `ProblemDetail` 与最终响应。 |
| `jls-25-records` | [JLS 25 §8.10 Record Classes](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.10) | `specification` | Java 25 | record header 声明数据载体状态，并生成 component fields、accessors、canonical constructor 及对象合同。 |
| `jls-25-sealed-interface-permits` | [JLS 25 §9.1.4 Permitted Direct Subclasses and Subinterfaces](https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.1.4) | `specification` | Java 25 | `sealed interface` 的可选 `permits` 子句列出所有预期的直接子类和直接子接口。 |

### 日志 API、实现、安全与滚动策略

| ID | 直接来源 | sourceType | 适用版本 | 支持结论 |
| --- | --- | --- | --- | --- |
| `spring-boot-4-logging` | [Spring Boot 4.1 Logging](https://docs.spring.io/spring-boot/4.1/reference/features/logging.html) | `official-reference` | Spring Boot 4.1.0 | 支持 ECS、GELF、Logstash 结构化 JSON；MDC 与 SLF4J fluent key-value 可进入 JSON；支持 Logback 扩展。 |
| `slf4j-2-manual` | [SLF4J Manual](https://www.slf4j.org/manual.html) | `official-reference` | SLF4J 2.0.18 | SLF4J 是 facade/API，需要一个 provider；页面固定 2.0.18 依赖并说明 MDC 与 fluent logging。 |
| `slf4j-2-logger-api` | [SLF4J `Logger`](https://www.slf4j.org/api/org/slf4j/Logger.html) | `api-doc` | SLF4J 2.0.18 | 定义 TRACE、DEBUG、INFO、WARN、ERROR、参数化消息、Throwable 重载与 2.0 fluent builder。 |
| `slf4j-2-mdc-api` | [SLF4J `MDC`](https://www.slf4j.org/api/org/slf4j/MDC.html) | `api-doc` | SLF4J 2.0.18 | MDC 是当前线程的诊断上下文；`putCloseable` 关闭时移除 key，也提供 `remove`/`clear`。 |
| `logback-architecture` | [Logback Architecture](https://logback.qos.ch/manual/architecture.html) | `official-reference` | Logback；现代 fixture 为 1.5.34 | logger 继承 effective level；事件携带 level、message、Throwable、thread、logger、MDC 并交给 appender。 |
| `logback-appenders` | [Logback Appenders](https://logback.qos.ch/manual/appenders.html) | `official-reference` | Logback；现代 fixture 为 1.5.34 | `RollingFileAppender`、时间/大小滚动、`maxHistory`、`totalSizeCap`、`maxFileSize` 与 `%d`/`%i` 合同。 |
| `logback-mdc` | [Logback Mapped Diagnostic Context](https://logback.qos.ch/manual/mdc.html) | `official-reference` | Logback；现代 fixture 为 1.5.34 | MDC 应成对 put/remove，remove 最好放 finally；子线程不会自动继承父线程 MDC。 |
| `logback-news-rolling` | [Logback News Archive: rolling policy history](https://logback.qos.ch/news-archive.html) | `release-note` | Logback 1.1.7 起；涵盖 legacy 1.2.3 | 1.1.7 已加入 `totalSizeCap` 和简化的 `SizeAndTimeBasedRollingPolicy`，因此 1.2.3 可做兼容 fixture。 |
| `owasp-logging` | [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) | `security-standard` | 2026-08-16 页面状态 | 规定事件属性、interaction identifier、敏感数据排除、CR/LF/分隔符净化、格式编码、日志保护和验证。 |
| `owasp-error-handling` | [OWASP Error Handling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html) | `security-standard` | 2026-08-16 页面状态 | 意外错误向客户端返回通用信息，调查详情留在服务端日志；全局 handler 统一执行该边界。 |
| `cwe-117` | [CWE-117 Improper Output Neutralization for Logs](https://cwe.mitre.org/data/definitions/117.html) | `security-standard` | CWE 4.20 页面状态 | 未正确处理外部输入中的日志特殊元素会伪造条目、破坏解析或向下游日志工具注入内容。 |

### Java 8 / Spring Boot 2.3 legacy 直接证据

| ID | 直接来源 | sourceType | 适用版本 | 支持结论 |
| --- | --- | --- | --- | --- |
| `spring-boot-2-3-system-requirements` | [Spring Boot 2.3.12 System Requirements](https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#system-requirements) | `official-reference` | Spring Boot 2.3.12.RELEASE | 要求 Java 8，兼容至 Java 15，要求 Spring Framework 5.2.15.RELEASE 或以上。 |
| `spring-boot-2-3-dependencies` | [Spring Boot 2.3.12 Dependency Versions](https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/appendix-dependency-versions.html) | `official-reference` | Spring Boot 2.3.12.RELEASE | 管理 SLF4J 1.7.30、Logback 1.2.3 与 Spring Framework 5.2.15.RELEASE。 |
| `spring-boot-2-3-logging` | [Spring Boot 2.3.12 Logging How-to](https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/howto.html#howto-logging) | `official-reference` | Spring Boot 2.3.12.RELEASE | 使用 Logback 原生配置、`logging.config` 与 Boot 提供的 pattern/rolling properties；没有 Boot 4.1 的内置 structured format 合同。 |
| `spring-5-exception-handler-api` | [Spring 5.2.15 `@ExceptionHandler`](https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/bind/annotation/ExceptionHandler.html) | `api-doc` | Spring Framework 5.2.15.RELEASE | 按异常类型选择 handler，可配合 `@ResponseStatus` 或返回 `ResponseEntity`。 |
| `spring-5-response-entity-exception-handler` | [Spring 5.2.15 `ResponseEntityExceptionHandler`](https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/servlet/mvc/method/annotation/ResponseEntityExceptionHandler.html) | `api-doc` | Spring Framework 5.2.15.RELEASE | 集中处理标准 MVC 异常，使用 body、headers 与 `HttpStatus` 创建 `ResponseEntity`；不存在 Spring 6 的 `ProblemDetail`。 |

## 冻结能力与 projectEvidence 合同

以下内容只抄录当前冻结矩阵，不重新扫描项目源码，不修改数量、路径、符号或 evidence policy。
`projectEvidenceCount` 只表示冻结审计覆盖量，不表示每个文件都有缺陷，也不代表课程示例数量。

### 三个能力节点

| 能力 | evidencePolicy | 冻结数量 | 冻结代表符号 |
| --- | --- | ---: | --- |
| `JAVA-ENGINEERING-005` 结果对象与结果合同 | `project-observed-capability` | 5 | `LoggingTailReadResult`、`DownloadResponse`、`WordToPdfUtil`、`validator.Error`、`validator.Result` |
| `JAVA-ENGINEERING-006` 异常、错误与消息边界 | `project-observed-capability` | 129 | `HkDataReportHandler`、`ErrorMessage`、`validator.Error`、`CltjrSfValidator`、`ArgumentNotValidException` |
| `JAVA-FRAMEWORK-026` SLF4J 与 Logback | `project-observed-capability` | 3 | `InnerProjectRollingFileAppender`、`InnerProjectSizeAndTimeBasedRollingPolicy`、`StorageProcessListener` |

冻结代表路径如下：

- `JAVA-ENGINEERING-005`：
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingTailReadResult.java`
  - `dzzz-app/src/main/java/com/tdh/bdzz/download/DownloadResponse.java`
  - `dzzz-app/src/main/java/com/tdh/bdzz/util/WordToPdfUtil.java`
  - `dzzz-app/src/main/java/com/tdh/bdzz/validator/Error.java`
  - `dzzz-app/src/main/java/com/tdh/bdzz/validator/Result.java`
- `JAVA-ENGINEERING-006`：
  - `dzzz-app/src/main/java/com/tdh/bdzz/handler/datareport/HkDataReportHandler.java`
  - `dzzz-app/src/main/java/com/tdh/bdzz/util/ErrorMessage.java`
  - `dzzz-app/src/main/java/com/tdh/bdzz/validator/Error.java`
  - `dzzz-app/src/main/java/com/tdh/bdzz/annoation/impl/CltjrSfValidator.java`
  - `dzzz-app/src/main/java/com/tdh/bdzz/exception/ArgumentNotValidException.java`
- `JAVA-FRAMEWORK-026`：
  - `dzzz-app/src/main/java/com/tdh/bdzz/rolling/InnerProjectRollingFileAppender.java`
  - `dzzz-app/src/main/java/com/tdh/bdzz/rolling/InnerProjectSizeAndTimeBasedRollingPolicy.java`
  - `dzzz-app/src/main/java/com/tdh/bdzz/storage/StorageProcessListener.java`

### 两个风险节点

| 风险 | evidencePolicy | 冻结数量 | 冻结结论边界 |
| --- | --- | ---: | --- |
| `JAVA-RISK-012` HTTP 错误状态、错误码与详情泄露 | `project-risk-evidence-only` | 17 | 候选包括宽泛异常兜底、响应体未配套 HTTP status、直接返回异常或底层消息。 |
| `JAVA-RISK-014` 敏感数据进入日志与字符串化输出 | `project-risk-evidence-only` | 170 | 候选包括完整登录/配置/消息对象、token/口令/密钥、原始校验值及自动或显式 `toString`。 |

`JAVA-RISK-012` 的冻结代表符号为 `GloableExceptionHandler`、`BaseOuterController`、
`ClientZzController`、`CommController`、`FileController`；`JAVA-RISK-014` 的冻结代表符号为
`FrontLoginController`、`FybController`、`ClientZzWsServer`、`AsConferenceBO`、`MossClientUtil`。

本批没有打开上述源码，因此不能宣称某个代表文件当前仍存在缺陷，也不能把其旧字段、异常文本、token、
URL 或日志内容复制进课程。风险节点只用于设计去敏的中性示例、负例和验证断言。

## 现代主线结论

### 先区分四种合同

一次失败可能同时出现在四个位置，但四者不是同一个对象：

| 合同 | 面向谁 | 应包含什么 | 不应包含什么 |
| --- | --- | --- | --- |
| 应用结果 | Service 调用方 | 成功数据或可预期业务分支 | HTTP status、Servlet 类型、日志格式 |
| Java 异常 | 当前调用链 | 失败类型、cause、必要上下文 | 可直接展示给终端用户的承诺 |
| HTTP 错误 | API 客户端 | status、稳定类型/错误码、安全可读详情、问题实例 | stack trace、SQL、类名、路径、密钥、底层异常原文 |
| 服务器日志 | 开发/运维/安全人员 | 时间、level、event、稳定字段、关联 ID、必要 Throwable | 口令、token、完整请求对象、无限长度原文 |

转换方向是“内层结果/异常 -> Web 错误合同”和“失败事件 -> 日志事件”。不能把日志字符串直接当客户端
响应，也不能让 Service 返回 `ResponseEntity` 或依赖 MDC 才能表达业务结果。

### 结果对象表达可预期分支，不代替所有返回值和异常

结果对象适合调用方必须显式处理的正常业务分支，例如“找到课程”或“课程不存在”。Java 25 可用
sealed interface 加 record 让分支在类型上可见：

```java
public sealed interface CourseLookupResult permits CourseFound, CourseMissing {}

public record CourseFound(Course course) implements CourseLookupResult {}

public record CourseMissing(String code) implements CourseLookupResult {}
```

这不意味着每个方法都必须包一层 `Result<T>`：单一成功值直接返回即可；输入违反方法前置条件可明确
抛异常；真正意外的数据库中断、程序错误仍应沿 cause 链传播到拥有处理责任的边界。结果对象必须满足
“一个时刻只有一个分支”，不能同时出现 `success=true`、`data=null`、`error=null` 等互相矛盾字段。

Web 层将 `CourseMissing` 映射为 HTTP 404，不应为了统一 JSON 而始终返回 200 再让客户端读取
`success=false`。HTTP status 是协议层已有的机器可读结果。

### 稳定错误码与人类消息分离

RFC 9457 规定客户端以 `type` URI 作为问题类型的主要标识，并明确不应解析 `detail`。本课增加
`code` 扩展字段，作为同一 API 内更短的稳定标识；这是课程 API 约定，不是 RFC 强制字段。

```java
public final class ErrorCodes {
    public static final String COURSE_NOT_FOUND = "course.not-found";
    public static final String COURSE_TITLE_CONFLICT = "course.title-conflict";

    /** 禁止创建只保存错误码常量的工具类实例。 */
    private ErrorCodes() {}
}
```

稳定错误码应满足：

1. 与 Java 异常类名、中文文案和数据库错误文本解耦。
2. 一旦对外发布，改名或改变语义按 API breaking change 处理。
3. 一个 code 只表达一个可操作含义，不能把所有失败都写成 `SYSTEM_ERROR`。
4. 人类消息可以本地化或改写；客户端分支只读取 HTTP status、`type`/`code` 和结构化扩展字段。
5. 字段校验错误只返回字段名、规则码和安全消息，不回显口令、token 或完整原始值。

### 异常到 HTTP 的映射必须按协议语义

RFC 9110 给出状态语义；应用需在此基础上制定稳定映射，而不是见到异常就返回 200、400 或 500：

| 场景 | HTTP status | 原因 |
| --- | ---: | --- |
| 请求 JSON/参数无法按合同解析 | 400 | 请求语法、framing 或参数形状被视为客户端错误 |
| 目标课程当前不存在或不披露存在 | 404 | 没有当前 representation，或服务器不愿披露 |
| 更新与目标资源当前状态冲突 | 409 | 冲突可由客户端理解并调整后重试 |
| content type 和语法可理解，但业务指令无法处理 | 422 | 内容语义无法执行；不能用来代替所有校验失败 |
| 未分类的意外服务端失败 | 500 | 服务器遇到阻止完成请求的意外条件 |

`IllegalArgumentException` 可能是客户端输入，也可能是程序内部 bug，不能仅按 Java 类名全局映射 400。
应定义语义清楚的业务异常或结果分支，由 adapter 选择 status。400 与 422 的字段校验边界属于 API
产品合同；一旦选定，要用测试固定，不能同类错误随机变化。

### `ProblemDetail` 是协议响应，不是异常对象序列化

现代 Spring 7 示例应显式构造安全 Problem Details：

```java
@RestControllerAdvice
final class ApiErrorHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger(ApiErrorHandler.class);

    /** 把已知的课程缺失映射为稳定的 404 错误合同。 */
    @ExceptionHandler(CourseNotFoundException.class)
    ProblemDetail handleCourseNotFound(CourseNotFoundException exception) {
        ProblemDetail detail = ProblemDetail.forStatusAndDetail(
                HttpStatus.NOT_FOUND,
                "没有找到指定课程"
        );
        detail.setType(URI.create("https://api.example.test/problems/course-not-found"));
        detail.setTitle("课程不存在");
        detail.setProperty("code", ErrorCodes.COURSE_NOT_FOUND);
        detail.setProperty("correlationId", MDC.get("correlationId"));
        return detail;
    }

    /** 对意外失败只向客户端返回通用信息，并在服务端保留 Throwable。 */
    @ExceptionHandler(Exception.class)
    ProblemDetail handleUnexpected(Exception exception) {
        LOGGER.error("Unhandled request failure", exception);
        ProblemDetail detail = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "请求暂时无法完成"
        );
        detail.setType(URI.create("https://api.example.test/problems/internal-error"));
        detail.setTitle("服务暂时不可用");
        detail.setProperty("code", "internal-error");
        detail.setProperty("correlationId", MDC.get("correlationId"));
        return detail;
    }
}
```

字段合同为：

- `type`：问题类型的稳定主标识，尽量使用绝对 URI；不能每次请求生成一个新 type。
- `status`：body 中是便利字段，真正驱动通用 HTTP 软件的是响应 status；两者必须一致。
- `title`：问题类型的短摘要，除本地化外不应随每次发生而变化。
- `detail`：帮助客户端修正本次问题的人类说明，不用于调试，客户端不解析其文本。
- `instance`：本次问题发生的标识/URI；可以与关联 ID 建立联系，但不得变成可枚举的敏感记录入口。
- 扩展字段：`code`、`fieldErrors`、`correlationId` 等机器字段；不放 stack、SQL、类名或原始秘密。

`exception.getMessage()`、`exception.toString()`、cause chain 或整个异常对象均不是 Problem Details 的
默认 `detail`。Spring 官方也建议定制 MVC 错误详情，避免暴露实现信息。

### 全局 handler 集中转换，不表示吞掉所有异常

`@ExceptionHandler`/`@ControllerAdvice` 负责 Web adapter 的统一映射。已知异常由具体 handler 转成
4xx；最终 `Exception` handler 只做意外 500、安全响应和一次完整日志。业务代码不能为了“统一处理”
catch `Exception` 后返回成功结果，也不能丢失原 cause。

预期的 4xx 不一定都记录 ERROR stack：普通“未找到”可由访问日志和指标覆盖；可疑认证、权限、输入
攻击或频繁冲突按安全策略记录 WARN/事件。意外 5xx 在最外层记录一次 Throwable，避免 Service、
Controller、全局 handler 对同一异常重复打印三份 stack。

### SLF4J 是调用 API，Logback 是执行实现

业务代码面向 `org.slf4j.Logger`；Logback provider 决定 level 过滤、event、encoder 和 appender。
classpath 应只有与 API 兼容的一套 provider，不能把 SLF4J facade 与 Logback 实现当成两个都要直接
调用的日志器。

Logger 通常以当前类命名并声明为 `private static final`。日志事件的 logger、level、message、
Throwable、thread 和 MDC 是独立字段；先形成 event，再由 appender 写向控制台、文件或其他目标。

### 日志级别使用一致的课程约定

Logback 只定义 TRACE < DEBUG < INFO < WARN < ERROR 的层级与 effective level 继承；具体业务含义需由
团队固定。本课采用：

| level | 本课约定 | 例子 |
| --- | --- | --- |
| ERROR | 当前操作因意外失败，需要调查或处置 | 未分类异常导致请求 500，并附 Throwable |
| WARN | 操作可继续但出现异常信号或安全关注 | 上游降级、重复冲突、可疑输入被拒绝 |
| INFO | 低频生命周期或重要业务里程碑 | 应用启动完成、批次任务开始/结束，不记录秘密 |
| DEBUG | 开发诊断所需的中等细节 | 分支选择、数量和耗时，生产默认可关闭 |
| TRACE | 极细粒度执行路径 | 循环/协议步骤，仅短时诊断，避免高量和敏感内容 |

level 不是异常类型到日志级别的固定函数。同一个 404 在正常查询中可能无需业务日志，在资源探测告警
中可能成为安全事件；必须同时看事件重要性、频率和监控用途。

### 占位符解决延迟格式化，不负责去敏

应使用 SLF4J 参数化消息：

```java
LOGGER.info("Course created courseId={} status={}", courseId, status);
LOGGER.error("Course creation failed", exception);
```

不要使用字符串拼接提前执行昂贵 `toString()`，也不要只记录 `exception.getMessage()` 后丢掉 stack。
需要 Throwable 时优先选择明确的 `(String, Throwable)` 重载；多参数场景也要测试最后一个 Throwable
是否被 provider 识别，不依赖读者猜 placeholder 数量。

占位符不会自动屏蔽口令，也不会阻止 CR/LF 日志注入。`LOGGER.info("login={}", request)` 仍可能调用
整个请求对象的 `toString()`，把秘密写入日志；必须先选择允许记录的字段。

### 结构化日志把可查询字段与 message 分开

Spring Boot 4.1.0 可通过以下配置启用内置 JSON 格式之一：

```properties
logging.structured.format.console=logstash
```

结构化日志的价值是稳定字段类型和名称，而不是把文本包进 JSON。现代 SLF4J 2 fluent API 可写：

```java
LOGGER.atInfo()
        .addKeyValue("event.action", "course.create")
        .addKeyValue("course.id", courseId)
        .addKeyValue("outcome", "success")
        .log("Course created");
```

本课字段约定至少包含时间、level、logger、message、`event.action`、`outcome`、`error.code`、
`correlationId`；数值保持 number，不全部转成字符串。同一 key 不应在不同事件中一会儿是 number、一会儿
是 object。高基数业务正文不适合作为索引字段，秘密更不能进入任何结构化字段。

Boot 4.1 的结构化格式会把 MDC key-value 放入 JSON，因此 MDC 必须比普通 message 更严格：只放
短小、低敏、跨日志有检索价值的上下文，不能塞 request body、用户对象或 token。

### MDC 与关联 ID 只做日志关联

一个请求经过多个类时，可使用短小 `correlationId` 把日志串起来。外部 header 是不可信输入：只接受
限定字符和长度的值，否则生成新 UUID；把最终值回写响应 header，并在请求结束时清理 MDC。

```java
final class CorrelationIdFilter extends OncePerRequestFilter {
    private static final Pattern SAFE_ID = Pattern.compile("[A-Za-z0-9._-]{1,64}");

    /** 为当前同步请求建立并及时清理日志关联上下文。 */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {
        String correlationId = selectCorrelationId(request.getHeader("X-Correlation-Id"));
        response.setHeader("X-Correlation-Id", correlationId);
        try (MDC.MDCCloseable ignored = MDC.putCloseable("correlationId", correlationId)) {
            chain.doFilter(request, response);
        }
    }

    /** 只复用符合日志字段合同的外部 ID，其余情况生成服务端 ID。 */
    private String selectCorrelationId(String candidate) {
        return candidate != null && SAFE_ID.matcher(candidate).matches()
                ? candidate
                : UUID.randomUUID().toString();
    }
}
```

关联 ID 不是身份认证、授权证明或全局唯一审计号，客户端可伪造。Logback MDC 不会自动继承到子线程；
异步任务必须显式捕获、传播和 finally 清理，完整线程上下文留给高级课程。本课 fixture 只验证同步请求。

### 敏感字段按“省略优先”处理

OWASP 明确要求排除 session identifier、access token、认证口令、数据库连接字符串、密钥、银行卡与
高敏个人数据。课程采用以下顺序：

1. 不需要调查的字段完全不记录。
2. 只需要关联时记录独立业务 ID，不记录整个 DTO/VO/entity。
3. 必须辨认末尾时做固定掩码，例如只保留后四位；不能用可逆“加星”掩盖整串仍可恢复的秘密。
4. 需要比较而不需要原值时，在有明确威胁模型和密钥管理的前提下使用不可逆/带密钥摘要。
5. 对消息、header、body 和第三方错误响应设置长度上限，避免日志存储与查看器被大输入拖垮。

自动生成或手写 `toString()` 都可能在模型新增字段后扩大日志面。禁止把登录请求、配置对象、
Authorization header、预签名 URL、license 字符串或校验原值整体交给 logger。

### 日志注入按最终输出格式处理

不可信输入含 `\r`、`\n` 或分隔符时，纯文本日志可能被伪造成多条事件；不合法 JSON 字符也可能破坏
下游解析。正确顺序是：

1. 按业务合同验证字段字符集、长度和类型。
2. 把值作为结构化字段或占位符参数，不拼接原始日志行。
3. 由 encoder 按 JSON、CEF 或纯文本等最终格式正确编码。
4. 纯文本 sink 额外把 CR/LF 转成可见转义或拒绝该值，并限制 delimiter。
5. 用含 CR、LF、引号、反斜杠和超长文本的负例验证“一次调用仍是一条可解析 event”。

简单 `replace("\n", "")` 不是所有 sink 的通用编码器；输出格式不同，需处理的字符也不同。参数化
logging 只改变消息格式化时机，不提供 CWE-117 的 output neutralization。

### Appender 与滚动策略解决输出生命周期

Appender 决定日志写到哪里，encoder/layout 决定格式，rolling policy 决定何时归档和删除。三者职责
不能混成“logger 写文件”。零基础先用 `RollingFileAppender` 加 `SizeAndTimeBasedRollingPolicy`：

```xml
<appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
  <file>${LOG_PATH:-logs}/application.log</file>
  <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
    <fileNamePattern>${LOG_PATH:-logs}/archive/application.%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>
    <maxFileSize>20MB</maxFileSize>
    <maxHistory>14</maxHistory>
    <totalSizeCap>1GB</totalSizeCap>
    <cleanHistoryOnStart>true</cleanHistoryOnStart>
  </rollingPolicy>
  <encoder>
    <pattern>%date %-5level [%thread] %logger{36} %X{correlationId} - %msg%n</pattern>
  </encoder>
</appender>
```

`%d` 负责时间周期，size-and-time 策略还必须有 `%i`。`maxHistory` 限制保留周期，
`totalSizeCap` 限制归档总量，`maxFileSize` 限制单个归档大小，`cleanHistoryOnStart` 让短生命周期应用
启动时也有机会清理。若只需按天与总容量限制，Logback 官方更推荐 `TimeBasedRollingPolicy` 加
`totalSizeCap`；只有单日文件确实可能过大时才使用 size-and-time。

滚动不是备份和安全控制。部署仍需验证目录权限、磁盘满行为、采集延迟、压缩文件读取、时区、容器
临时文件系统和日志处置周期；日志系统故障不能把秘密回显给客户端。

## Java 8 / Spring Boot 2.3 legacy 补充

### 版本差异

| 对比项 | 现代主线 | Java 8 / Boot 2.3 项目线 | 迁移边界 |
| --- | --- | --- | --- |
| 结果类型 | Java 25 record / sealed interface 可表达分支 | Java 8 使用 final class、构造器、getter，不能复制 record/sealed 语法 | 保持字段和分支合同相同，语法分别实现 |
| HTTP 错误体 | Spring 7 `ProblemDetail`、`ErrorResponse`、`HttpStatusCode` | Spring 5.2.15 自定义不可变 `ApiError` + `ResponseEntity`/`HttpStatus` | 不在旧项目伪造同包名 `ProblemDetail` |
| 日志 API | SLF4J 2.0.18，有 fluent `addKeyValue` | SLF4J 1.7.30，使用经典 placeholder/Throwable API | 旧线不能复制 `atInfo()`/`addKeyValue()` |
| 日志实现 | Logback 1.5.34 | Logback 1.2.3 | 只使用两版共有的 appender/rolling 合同，并分别装载配置验证 |
| 结构化日志 | Boot 4.1 内置 ECS/GELF/Logstash 配置 | Boot 2.3 没有同名内置 structured format 属性 | 旧线先用稳定 pattern；额外 JSON encoder 需另做依赖研究 |
| MDC | `putCloseable` + try-with-resources | SLF4J 1.7 可用 `put`/`remove`，finally 清理最直观 | 两线都验证线程复用后无旧值残留 |

Spring 5.2.15 的兼容错误体可写成：

```java
public final class ApiError {
    private final String code;
    private final String message;
    private final String correlationId;

    /** 创建不包含内部异常详情的旧版错误响应。 */
    public ApiError(String code, String message, String correlationId) {
        this.code = code;
        this.message = message;
        this.correlationId = correlationId;
    }

    /** 返回稳定机器错误码。 */
    public String getCode() {
        return code;
    }

    /** 返回可安全展示的人类消息。 */
    public String getMessage() {
        return message;
    }

    /** 返回本次请求的日志关联 ID。 */
    public String getCorrelationId() {
        return correlationId;
    }
}
```

legacy handler 仍须同时设置正确 HTTP status 和安全 body；不能只返回 `ApiError` 后让状态默认为 200。
Java 8 的 result class、error body 和日志示例只保留中性课程字段，不读取或复制冻结项目业务实现。

## 易错点与修正合同

| 现象 | 触发条件与原因 | 后果 | 正确边界 | 最小验证 |
| --- | --- | --- | --- | --- |
| 所有响应都返回 200 + `success=false` | 把 JSON 外形当 HTTP 合同 | 代理、客户端和监控无法按协议识别失败 | 业务 code 与正确 4xx/5xx 同时存在 | 对 status、content type 和 body 做精确断言 |
| 客户端解析中文 message | 没有稳定 type/code | 文案或本地化变化立即破坏客户端 | 客户端读取 status + type/code，message 只展示 | 改写 message 后客户端分支测试仍通过 |
| 直接返回 `exception.getMessage()` | 把内部诊断当用户提示 | 泄露 SQL、路径、类名或第三方响应，合同不稳定 | 已知错误使用安全详情；未知 500 用通用文案 | 故障注入内部秘密，确认响应中不存在 |
| catch `Exception` 后正常返回 | 为“防止报错”吞掉失败 | 事务可能提交，调用方误判成功，cause 丢失 | 只转换可负责的异常；其他带 cause 继续传播 | 注入失败并断言 status、数据和 cause |
| 同一异常每层都 `LOGGER.error` | 每层都想保留证据 | 重复 stack、告警倍增、关联困难 | 最外层拥有者记录一次；内层补上下文后 rethrow | 一次请求只出现一个目标 error event |
| `LOGGER.info("{}", request)` | 相信占位符会去敏 | `toString()` 输出口令、token 或大量数据 | 选择 allowlist 字段，秘密省略 | 捕获日志并断言敏感样本 0 命中 |
| `LOGGER.error(ex.getMessage())` | 只记异常文本 | stack/cause 丢失且文本可能含秘密 | 安全 message + 明确 Throwable 重载 | 捕获 event 的 throwableProxy 非空 |
| MDC 未清理 | 线程池复用，同一线程处理后续请求 | 第二个请求继承错误 correlationId/用户上下文 | try-with-resources 或 finally remove | 连续两个请求的 ID 不串线，结束后 MDC 为空 |
| 信任外部 correlation ID | header 直接进入 MDC/响应 | 日志注入、超长字段、错误归因 | 限字符和长度，不合格则服务端生成 | CRLF/超长 header 被替换为新 UUID |
| 把完整 body/header 写日志 | 调试期临时输出留到生产 | 凭据、隐私、业务正文泄露 | 按数据分类和 allowlist 记录摘要/ID | token、password、Authorization 样本 0 命中 |
| 用 placeholder 代替 output encoding | 误解参数化日志的作用 | CRLF 仍可伪造纯文本行 | 按最终 sink 验证、编码和净化 | 恶意值仍只生成一条可解析事件 |
| 只配 `maxFileSize` 不配保留策略 | 关注单文件不关注归档总量 | 磁盘持续增长 | 同时设置 history、total cap 和运行监控 | 触发滚动后归档数量/总量在界限内 |
| `%i`/`%d` 模式错误 | 混淆时间和大小触发器 | 配置启动失败或无法滚动 | size-and-time 同时使用 `%d` 与 `%i` | 两版 Logback 均实际加载配置并触发滚动 |
| 直接把现代示例复制到 Boot 2.3 | 使用 ProblemDetail/fluent key-value | Java 8 或旧依赖编译失败 | legacy 使用 ApiError、经典 SLF4J API | `--release 8` 与 legacy effective deps 验证 |

## 零基础课程拆分

正式课程至少按以下顺序建立独立三级知识点，不得把多个编号挤在同一段：

1. 一次失败为什么同时存在应用结果、Java 异常、HTTP 错误和日志事件。
2. 可预期业务分支与意外系统失败如何区分。
3. 结果对象是什么，什么时候使用，为什么一个时刻只能有一个分支。
4. Java 25 record/sealed result 与 Java 8 final class 如何表达同一合同。
5. 稳定错误码是什么，为什么必须与异常类名和中文 message 分离。
6. HTTP 4xx 与 5xx 分别表示谁似乎出错。
7. 400、404、409、422、500 如何按具体场景选择。
8. 已知异常、未知异常和结果分支如何映射为 HTTP status。
9. RFC 9457 `type/status/title/detail/instance` 每个字段的含义和边界。
10. ProblemDetail 扩展 `code/fieldErrors/correlationId` 如何安全设计。
11. 客户端响应为何不能包含 exception message、stack、SQL、路径或秘密。
12. `@ExceptionHandler`/`@ControllerAdvice` 如何集中转换而不吞异常。
13. SLF4J facade、provider 与 Logback 实现各做什么。
14. TRACE、DEBUG、INFO、WARN、ERROR 的层级与课程使用约定。
15. `{}` 占位符、classic overload 与 Throwable 如何正确记录。
16. 结构化日志是什么，字段、类型和 message 为什么要分开。
17. SLF4J 2 fluent key-value 与 Spring Boot 4.1 JSON 输出如何配合。
18. correlation ID、MDC、同步请求范围和 finally 清理如何工作。
19. 密码、token、连接串、密钥、请求对象和 `toString()` 如何去敏。
20. CR/LF、分隔符和日志注入如何按最终输出格式防护。
21. Appender、encoder/layout、RollingPolicy 分别负责什么。
22. `maxFileSize`、`maxHistory`、`totalSizeCap`、`cleanHistoryOnStart` 如何组合。
23. Spring Boot 2.3 / Spring 5 / SLF4J 1.7 / Logback 1.2 的 legacy 差异。
24. 用 status、JSON、captured event、MDC 和归档文件建立可观察反馈环。

每个小点在课程正文中必须独立回答“它是什么、有什么作用、什么时候使用、怎么使用、最小示例、
运行结果、常见误区”。涉及多个动作时使用真实 Markdown 有序列表，每个序号独立一行。

## 可执行最小反馈环设计

研究阶段不执行 fixture；实施阶段在 `mktemp -d /tmp/java-errors-logging-course.XXXXXX` 中创建最小工程，
成功后清理并检查临时目录不存在，不向仓库保留测试、日志、数据库或浏览器输出。

### 现代 Java 25 / Spring Boot 4.1.0 反馈环

临时 Maven 工程固定 Spring Boot 4.1.0 dependency management、Spring MVC test、SLF4J 2.0.18、
Logback 1.5.34。只使用“课程查询/创建”中性数据。最少验证：

1. Service 的 `found`/`missing` 两个结果分支可穷举，错误码固定为 `course.not-found`。
2. 已知缺失返回 404 + `application/problem+json`，body status 为 404，code 稳定。
3. 冲突返回 409；语义无法处理按已选合同返回 422；解析错误返回 400。
4. 意外异常返回 500 通用 detail；响应不含异常类名、内部路径、SQL 样本或 stack。
5. 捕获 Logback event，确认意外失败只有一条 ERROR、Throwable 存在、correlationId 一致。
6. 连续两个同步请求使用不同 MDC 值，请求结束后当前线程 `MDC.get` 为 null。
7. 密码、token、CR/LF、引号、反斜杠和超长输入不出现在日志；一次调用只产生一条可解析 JSON event。
8. 在临时日志目录触发 size-and-time rolling，确认 active file、archive、history 与 total cap 配置生效。

稳定证据文本只输出计数和布尔值，不输出秘密或完整日志：

```text
result|found=1|missing=1|code=course.not-found
http|badRequest=400|missing=404|conflict=409|unprocessable=422|unexpected=500
problem|contentType=application/problem+json|statusMatches=true|internalDetailExposed=false
logging|errorEvents=1|throwablePresent=true|sensitiveMatches=0|singleLine=true
mdc|requestIds=2|crossRequestLeak=false|afterRequest=null
rolling|active=true|archivesWithinPolicy=true
```

滚动测试只证明该临时目录、配置和版本组合。不能外推生产磁盘容量、容器采集或保留合规已经完成。

### Java 8 / Spring Boot 2.3 反馈环

另建独立临时模块，固定 Boot 2.3.12.RELEASE、Spring 5.2.15.RELEASE、SLF4J 1.7.30、
Logback 1.2.3。把 record/sealed result 改成 final class，把 ProblemDetail 改成 `ApiError` +
`ResponseEntity<ApiError>`，把 fluent key-value 改成经典 placeholder API。

先用 `javac --release 8` 或 Maven compiler release/source/target 8 证明源码未引用 Java 9+ API；若本机
存在真实 JDK 8，再运行相同 HTTP、日志、MDC 和 rolling 反馈环。没有真实 JDK 8 时必须写
“release 8 编译通过、JDK 8 runtime deferred”，不能把当前 JDK 的 `--release 8` 当成旧运行时证据。

### 负例只验证一个失败原因

- handler 返回 body 但 status 仍为 200：HTTP 断言必须失败。
- ProblemDetail.detail 使用内部异常文本：去敏断言必须指出具体禁止样本。
- Service 和 handler 同时 log 同一 Throwable：event count 必须从 1 变 2 并失败。
- filter 不 remove MDC：第二个请求或请求结束断言必须发现旧值。
- header 为 `ok\r\nFORGED=1`：ID 校验必须拒绝并生成新值。
- `LOGGER.info("request={}", loginRequest)`：敏感样本断言必须发现口令并失败。
- size-and-time pattern 缺 `%i`：配置加载或 rolling 断言必须失败。
- Java 8 fixture 复制 `ProblemDetail` 或 `atInfo()`：legacy 编译必须失败。

负例修复后复跑同一反馈环；不得删除断言、降低日志检查或把 HTTP 200 重新解释为成功来关闭 Gate。

## 不确定点与后续准入条件

1. 冻结矩阵只提供路径、符号、数量和 evidence policy；本批禁止读取 `dzzz-app`，因此不新增源码
   SHA、不复现风险，也不为代表文件自行分配 `adapted`/`corrected`。
2. `JAVA-RISK-014` 的 170 个文件是静态风险覆盖量，不等于 170 个已确认泄露。课程只讲防护合同和
   中性负例，不展示冻结项目秘密或业务正文。
3. correlation ID 只用于本课同步日志关联。W3C Trace Context、跨服务传播、线程池装饰器和异步清理
   留给高级可观测性/线程上下文课程。
4. 400 与 422 的具体字段校验划分、哪些 4xx 需要日志、日志保留天数和安全告警阈值都是产品/运维
   决策；正式课程要声明示例约定，不能包装成 RFC 唯一答案。
5. Spring Boot 4.1 内置 structured format 不代表所有字段自动安全；encoder 正确转义也不能替代
   数据最小化、字段分类、访问控制和 retention。
6. legacy 若需要 JSON encoder、远程 appender 或异步 appender，必须另做精确依赖与丢失策略研究；
   本批不为 Boot 2.3 擅自增加第三方日志依赖。

## 研究 Gate 自检

- [x] Phase C I-13 的课程 ID、标题、150 分钟、唯一前置 I-12 与停止边界已核对。
- [x] 五组 projectEvidence 的 policy、数量和代表符号来自冻结矩阵，未读取项目源码。
- [x] Java 25 / Boot 4.1.0 / Framework 7.0.8 / SLF4J 2.0.18 / Logback 1.5.34 已精确绑定。
- [x] Java 8 / Boot 2.3.12 / Framework 5.2.15 / SLF4J 1.7.30 / Logback 1.2.3 已独立绑定。
- [x] 结果对象、sealed 分支、稳定错误码、异常到 HTTP、ProblemDetail 与客户端去敏均有规范或
  Spring 直接来源。
- [x] level、placeholder、Throwable、structured log、MDC、关联 ID、Appender 与 rolling 均有官方来源。
- [x] 敏感字段、日志注入和错误详情泄露达到 OWASP/CWE/RFC 安全证据门槛。
- [x] 零基础拆分共 24 点，后续每点必须使用七项结构和独立编号行。
- [x] `/tmp` 反馈环覆盖双版本、HTTP、captured event、MDC、去敏、注入与 rolling。
- [x] 未修改课程、manifest、track、计划、signoff 或冻结矩阵，未暂存、提交或推送。

## Stop Boundary

本研究稿只完成 Phase C I-13 `errors-results-and-logging` 的官方研究。不得把研究完成写成
课程正文、runtime `available`、fixture 已通过、浏览器已验收或 signoff 已关闭。父任务需在 I-12
完整关闭后，再串行完成本课正文、`/tmp` 双版本反馈环、loader + `available` 原子发布、Catalog
连续三次冷启动、工程 Gate、桌面/390px 浏览器证据、独立 signoff 和 Standards/Spec 双轴
`PASS / 0 finding`；在此之前不得进入后继课程。
