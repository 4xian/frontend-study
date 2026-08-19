# Java 高级第 8 门：HTTP 客户端、超时、资源生命周期与集成韧性研究

> 课程 ID：`backend.java.learn.advanced.http-clients-and-integration-resilience`
>
> 冻结顺序：570
>
> 研究日期：2026-08-11
>
> 冻结快照：`dzzz-app-20260803-179e722831ab`
> 边界：只使用冻结 Phase 2 矩阵、审计文档和本稿核验的官方资料，不读取、运行或修改 `dzzz-app`

## 冻结课程合同

- 标题：HTTP 客户端、超时、资源生命周期与集成韧性。
- 阶段：`advanced`，深度：`lesson`，课程顺序：`570`。
- 前置课程：
  1. `backend.java.learn.intermediate.http-uri-and-request-response-basics`。
  2. `backend.java.learn.intermediate.errors-results-and-logging`。
  3. `backend.java.learn.intermediate.transactions-and-idempotency`。
- 来源能力必须保持为：
  1. `JAVA-FRAMEWORK-022`：RestTemplate 与 Apache HttpClient。
  2. `JAVA-ENGINEERING-018`：资源生命周期、清理与优雅关闭。
  3. `JAVA-ENGINEERING-023`：HTTP 调用、超时与头部合同。
  4. `JAVA-RISK-028`：网络客户端生命周期、超时与连接状态风险。
- 选择理由：项目有大量外部 HTTP 调用；超时、连接复用、关闭、重试和失败回退必须成组验证。
- 冻结状态保持 `researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`；本稿不修改矩阵、track、manifest、正文或 signoff。
- 本课不新增 resilience4j 或网络依赖。韧性模式先用类型化策略和可运行的本地假传输验证；
  Spring 与 Apache HttpComponents 文档用于解释精确客户端能力和版本边界。

## 研究范围与版本基线

### 现代主线

- Java 25 LTS、Spring Boot 4.1.0、Spring Framework 7.0.8。
- JDK `java.net.http.HttpClient` 25 作为无第三方依赖的可运行主线。
- Spring 同步主线使用 `RestClient`；异步、响应式或流式场景才引入 `WebClient`。
- Spring Framework 7.0.8 已弃用 `RestTemplate`；它只用于解释迁移和 legacy 配置复用。
- 需要 Apache classic 连接池时使用 HttpClient 5.6.4；必须显式区分 pool lease、connect、
  response/socket timeout 与端到端 deadline。

### 兼容线

- Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE。
- Java 8 没有 `java.net.http` 模块；最小标准库例子使用 `HttpURLConnection`，项目框架语境使用
  Spring 5.2 `RestTemplate` 与 Apache HttpClient 4.5.14。
- Spring 5.2 已将 `RestTemplate` 置于 maintenance mode，但它在冻结项目线仍可用；不能把
  Spring 7 的 `RestClient`、Boot 4.1 属性或 HttpClient 5 API 回填旧线。
- Apache 4.5.14 和 5.6.4 的包名、timeout 类型、连接管理与 retry SPI 不兼容，分别编译验证。

## 已核验的官方直接来源

以下 35 个唯一直接 URL 先由 Tavily 发现，再回到 Oracle、Spring、Apache、RFC、AWS、OWASP
或 OpenTelemetry 官方页面核验；核验日期均为 2026-08-11。未使用社区文章、问答或搜索摘要
支撑结论。

### 版本、JDK 与 Java 8

1. **`oracle-java-support-roadmap`**
   - 标题：Oracle Java SE Support Roadmap。
   - URL：<https://www.oracle.com/java/technologies/java-se-support-roadmap.html>。
   - `sourceType: official-reference`；`appliesTo: Java 25`；`verifiedAt: 2026-08-11`。
   - `claims`：Java 25 是 LTS；现代主线固定为 Java 25。
2. **`boot41-system-requirements`**
   - 标题：Spring Boot System Requirements。
   - URL：<https://docs.spring.io/spring-boot/system-requirements.html>。
   - `sourceType: official-reference`；`appliesTo: Spring Boot 4.1.0`；`verifiedAt: 2026-08-11`。
   - `claims`：Boot 4.1.0 支持 Java 17 至 26，并要求 Spring Framework 7.0.8 或更高版本。
3. **`boot2312-system-requirements`**
   - 标题：Spring Boot 2.3.12.RELEASE System Requirements。
   - URL：<https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements>。
   - `sourceType: official-reference`；`appliesTo: Spring Boot 2.3.12.RELEASE`；`verifiedAt: 2026-08-11`。
   - `claims`：冻结旧线从 Java 8 起运行，并使用 Spring Framework 5.2.15.RELEASE。
4. **`java25-http-client`**
   - 标题：Java SE 25 API - HttpClient。
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/HttpClient.html>。
   - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-11`。
   - `claims`：客户端管理并复用连接；每次请求新建客户端会妨碍复用；关闭、取消与流式 body
     都有显式资源责任。
5. **`java25-http-client-builder`**
   - 标题：Java SE 25 API - HttpClient.Builder。
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/HttpClient.Builder.html>。
   - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-11`。
   - `claims`：`connectTimeout` 只在新建连接时生效；redirect、proxy、TLS 与 executor 是独立策略。
6. **`java25-http-request-builder`**
   - 标题：Java SE 25 API - HttpRequest.Builder。
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/HttpRequest.Builder.html>。
   - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-11`。
   - `claims`：请求 timeout 未设置时没有该上限；URI、method、headers 与 body publisher
     共同组成请求合同。
7. **`java25-http-body-handlers`**
   - 标题：Java SE 25 API - HttpResponse.BodyHandlers。
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/HttpResponse.BodyHandlers.html>。
   - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-11`。
   - `claims`：预置 handler 不验证状态码；`ofInputStream` 的流必须消费、关闭或取消。
8. **`java8-url-connection`**
   - 标题：Java SE 8 API - URLConnection。
   - URL：<https://docs.oracle.com/javase/8/docs/api/java/net/URLConnection.html>。
   - `sourceType: api-doc`；`appliesTo: Java 8`；`verifiedAt: 2026-08-11`。
   - `claims`：connect 与 read timeout 独立；0 表示无限；read timeout 约束阻塞读取。
9. **`java8-http-url-connection`**
   - 标题：Java SE 8 API - HttpURLConnection。
   - URL：<https://docs.oracle.com/javase/8/docs/api/java/net/HttpURLConnection.html>。
   - `sourceType: api-doc`；`appliesTo: Java 8`；`verifiedAt: 2026-08-11`。
   - `claims`：实例不可复用；流关闭与 `disconnect()` 的作用不同；自动 redirect 需要显式审查。

### Spring 客户端与观测

10. **`spring7-rest-clients-reference`**
    - 标题：Spring Framework 7.0 REST Clients。
    - URL：<https://docs.spring.io/spring-framework/reference/7.0/integration/rest-clients.html>。
    - `sourceType: official-reference`；`appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-11`。
    - `claims`：`RestClient` 是同步 fluent 客户端，`WebClient` 是 non-blocking 客户端；
      `RestTemplate` 自 7.0 起弃用。
11. **`spring708-rest-client`**
    - 标题：Spring Framework 7.0.8 RestClient Javadoc。
    - URL：<https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/client/RestClient.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-11`。
    - `claims`：同步 API 可配置 request factory、status handler 和 exchange callback；可从
      `RestTemplate` 配置迁移。
12. **`spring708-rest-template`**
    - 标题：Spring Framework 7.0.8 RestTemplate Javadoc。
    - URL：<https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/client/RestTemplate.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-11`。
    - `claims`：实例适合共享但配置不支持并发修改；新高层能力聚焦 `RestClient`。
13. **`spring7-webclient-configuration`**
    - 标题：Spring Framework 7.0 WebClient Configuration。
    - URL：<https://docs.spring.io/spring-framework/reference/7.0/web/webflux-webclient/client-builder.html>。
    - `sourceType: official-reference`；`appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-11`。
    - `claims`：Reactor Netty 分开设置 connect、response、read/write timeout；自建资源时调用方
      承担共享和关闭责任。
14. **`spring7-http-client-observability`**
    - 标题：Spring Framework 7.0 Observability Support。
    - URL：<https://docs.spring.io/spring-framework/reference/7.0/integration/observability.html>。
    - `sourceType: official-reference`；`appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-11`。
    - `claims`：客户端 observation 名为 `http.client.requests`，覆盖连接到 body 反序列化的 exchange。
15. **`boot410-rest-clients`**
    - 标题：Spring Boot 4.1 Calling REST Services。
    - URL：<https://docs.spring.io/spring-boot/4.1/reference/io/rest-client.html>。
    - `sourceType: official-reference`；`appliesTo: Spring Boot 4.1.0`；`verifiedAt: 2026-08-11`。
    - `claims`：Boot 可统一配置 connect/read timeout、redirect 与 SSL bundle；直接 `create()`
      不应用 Boot 自动配置；地址过滤可辅助 SSRF 防护。
16. **`spring5215-rest-template`**
    - 标题：Spring Framework 5.2.15.RELEASE RestTemplate Javadoc。
    - URL：<https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/client/RestTemplate.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Framework 5.2.15.RELEASE`；`verifiedAt: 2026-08-11`。
    - `claims`：旧线仍提供共享同步客户端，但已处于 maintenance mode；现代弃用结论不能反推旧线 API 不可用。

### Apache HttpComponents 精确版本

17. **`httpclient564-coordinates`**
    - 标题：Apache HttpClient 5.6.4 Maven Coordinates。
    - URL：<https://hc.apache.org/httpcomponents-client-5.6.x/5.6.4/httpclient5/dependency-info.html>。
    - `sourceType: official-reference`；`appliesTo: Apache HttpClient 5.6.4`；`verifiedAt: 2026-08-11`。
    - `claims`：现代第三方客户端基线与坐标固定为
      `org.apache.httpcomponents.client5:httpclient5:5.6.4`。
18. **`httpclient564-request-config`**
    - 标题：Apache HttpClient 5.6.4 RequestConfig.Builder Javadoc。
    - URL：<https://hc.apache.org/httpcomponents-client-5.6.x/5.6.4/httpclient5/apidocs/org/apache/hc/client5/http/config/RequestConfig.Builder.html>。
    - `sourceType: api-doc`；`appliesTo: Apache HttpClient 5.6.4`；`verifiedAt: 2026-08-11`。
    - `claims`：connection-request timeout 约束 pool lease；response timeout 不是 deadline，自动重执行
      可使总耗时超过它。
19. **`httpclient564-connection-config`**
    - 标题：Apache HttpClient 5.6.4 ConnectionConfig Javadoc。
    - URL：<https://hc.apache.org/httpcomponents-client-5.6.x/5.6.4/httpclient5/apidocs/org/apache/hc/client5/http/config/ConnectionConfig.html>。
    - `sourceType: api-doc`；`appliesTo: Apache HttpClient 5.6.4`；`verifiedAt: 2026-08-11`。
    - `claims`：connect timeout、socket timeout、TTL 和空闲后校验是不同连接合同；HTTPS 还包含 TLS 建连阶段。
20. **`httpclient564-pooling-manager`**
    - 标题：Apache HttpClient 5.6.4 PoolingHttpClientConnectionManager Javadoc。
    - URL：<https://hc.apache.org/httpcomponents-client-5.6.x/5.6.4/httpclient5/apidocs/org/apache/hc/client5/http/impl/io/PoolingHttpClientConnectionManager.html>。
    - `sourceType: api-doc`；`appliesTo: Apache HttpClient 5.6.4`；`verifiedAt: 2026-08-11`。
    - `claims`：lease 可取消，release 归还可复用 endpoint；manager 可关闭并支持总量和每 route 上限。
21. **`httpclient564-closeable-client`**
    - 标题：Apache HttpClient 5.6.4 CloseableHttpClient Javadoc。
    - URL：<https://hc.apache.org/httpcomponents-client-5.6.x/5.6.4/httpclient5/apidocs/org/apache/hc/client5/http/impl/classic/CloseableHttpClient.html>。
    - `sourceType: api-doc`；`appliesTo: Apache HttpClient 5.6.4`；`verifiedAt: 2026-08-11`。
    - `claims`：response handler 形式会消费 entity 并归还连接；客户端关闭责任不能遗失。
22. **`httpclient564-retry-strategy`**
    - 标题：Apache HttpClient 5.6.4 DefaultHttpRequestRetryStrategy Javadoc。
    - URL：<https://hc.apache.org/httpcomponents-client-5.6.x/5.6.4/httpclient5/apidocs/org/apache/hc/client5/http/impl/DefaultHttpRequestRetryStrategy.html>。
    - `sourceType: api-doc`；`appliesTo: Apache HttpClient 5.6.4`；`verifiedAt: 2026-08-11`。
    - `claims`：默认最多重试一次并处理 429/503 的 `Retry-After`；若要 deadline、jitter 和业务
      幂等合同必须显式包装，不能把默认策略当完整韧性方案。
23. **`httpclient4514-request-config`**
    - 标题：Apache HttpClient 4.5.14 RequestConfig Javadoc。
    - URL：<https://hc.apache.org/httpcomponents-client-4.5.x/4.5.14/httpclient/apidocs/org/apache/http/client/config/RequestConfig.html>。
    - `sourceType: api-doc`；`appliesTo: Apache HttpClient 4.5.14`；`verifiedAt: 2026-08-11`。
    - `claims`：旧线分别配置 pool lease、connect 与 socket/read timeout；0 表示无限。
24. **`httpclient4514-connection-management`**
    - 标题：Apache HttpClient 4.5.14 Connection Management Tutorial。
    - URL：<https://hc.apache.org/httpcomponents-client-4.5.x/4.5.14/tutorial/html/connmgmt.html>。
    - `sourceType: official-reference`；`appliesTo: Apache HttpClient 4.5.14`；`verifiedAt: 2026-08-11`。
    - `claims`：route 池满会等待归还；需要 connection-manager timeout 并处理 pool timeout。
25. **`httpclient4514-retry-handler`**
    - 标题：Apache HttpClient 4.5.14 DefaultHttpRequestRetryHandler Javadoc。
    - URL：<https://hc.apache.org/httpcomponents-client-4.5.x/4.5.14/httpclient/apidocs/org/apache/http/impl/client/DefaultHttpRequestRetryHandler.html>。
    - `sourceType: api-doc`；`appliesTo: Apache HttpClient 4.5.14`；`verifiedAt: 2026-08-11`。
    - `claims`：旧默认 retry count 为 3，并按异常与请求是否已发送决定是否重试；与 5.6.4 默认值不同。

### HTTP、韧性、安全与观测

26. **`rfc9110-idempotent-methods`**
    - 标题：RFC 9110 Section 9.2.2 Idempotent Methods。
    - URL：<https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2>。
    - `sourceType: specification`；`appliesTo: HTTP Semantics`；`verifiedAt: 2026-08-11`。
    - `claims`：幂等请求在通信失败且未收到响应时可自动重试；非幂等请求需要额外幂等保证或
      可证明原请求未执行。
27. **`rfc9110-retry-after`**
    - 标题：RFC 9110 Section 10.2.3 Retry-After。
    - URL：<https://www.rfc-editor.org/rfc/rfc9110.html#section-10.2.3>。
    - `sourceType: specification`；`appliesTo: HTTP Semantics`；`verifiedAt: 2026-08-11`。
    - `claims`：`Retry-After` 是 HTTP-date 或非负秒数；503 与重定向具有不同语境。
28. **`rfc9110-redirection`**
    - 标题：RFC 9110 Section 15.4 Redirection。
    - URL：<https://www.rfc-editor.org/rfc/rfc9110.html#section-15.4>。
    - `sourceType: specification`；`appliesTo: HTTP Semantics`；`verifiedAt: 2026-08-11`。
    - `claims`：自动跳转必须防循环并移除敏感或目标特定 headers；不安全方法的跳转需谨慎。
29. **`rfc6585-too-many-requests`**
    - 标题：RFC 6585 Section 4 - 429 Too Many Requests。
    - URL：<https://www.rfc-editor.org/rfc/rfc6585.html#section-4>。
    - `sourceType: specification`；`appliesTo: HTTP 429`；`verifiedAt: 2026-08-11`。
    - `claims`：429 表示请求过多，响应可以给出 `Retry-After`；不是无条件立即重试信号。
30. **`aws-limit-retries`**
    - 标题：AWS REL05-BP03 Control and limit retry calls。
    - URL：<https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_mitigate_interaction_failure_limit_retries.html>。
    - `sourceType: engineering-reference`；`appliesTo: AWS Well-Architected current page verified 2026-08-11`；`verifiedAt: 2026-08-11`。
    - `claims`：只重试瞬时失败；使用指数退避、jitter 和最大次数或总耗时；多层重试会放大流量。
31. **`aws-client-timeouts`**
    - 标题：AWS REL05-BP05 Set client timeouts。
    - URL：<https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_mitigate_interaction_failure_client_timeouts.html>。
    - `sourceType: engineering-reference`；`appliesTo: AWS Well-Architected current page verified 2026-08-11`；`verifiedAt: 2026-08-11`。
    - `claims`：跨进程调用应设置 connect 和 request timeout；过高或过低都需要以观测数据校准。
32. **`owasp-ssrf-prevention`**
    - 标题：OWASP SSRF Prevention Cheat Sheet。
    - URL：<https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html>。
    - `sourceType: security-standard`；`appliesTo: OWASP Cheat Sheet verified 2026-08-11`；`verifiedAt: 2026-08-11`。
    - `claims`：优先 allowlist 已知目标；检查 A/AAAA 与 DNS rebinding；关闭自动 redirect 防止绕过校验。
33. **`owasp-tls`**
    - 标题：OWASP Transport Layer Security Cheat Sheet。
    - URL：<https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html>。
    - `sourceType: security-standard`；`appliesTo: OWASP Cheat Sheet verified 2026-08-11`；`verifiedAt: 2026-08-11`。
    - `claims`：优先 TLS 1.3，兼容时保留 1.2；不能关闭证书身份验证或信任任意证书。
34. **`owasp-logging`**
    - 标题：OWASP Logging Cheat Sheet。
    - URL：<https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html>。
    - `sourceType: security-standard`；`appliesTo: OWASP Cheat Sheet verified 2026-08-11`；`verifiedAt: 2026-08-11`。
    - `claims`：token、密码、连接串和密钥不得直接记录；外部字段需清洗 CR/LF 等日志注入字符。
35. **`otel-http-client-spans`**
    - 标题：OpenTelemetry Semantic Conventions for HTTP Spans。
    - URL：<https://opentelemetry.io/docs/specs/semconv/http/http-spans/>。
    - `sourceType: specification`；`appliesTo: OpenTelemetry HTTP client spans stable convention verified 2026-08-11`；`verifiedAt: 2026-08-11`。
    - `claims`：出站调用使用 `CLIENT` span；重试和 redirect 以逐 attempt span 观测，并记录 resend count。

## 一次调用不是一个 timeout

一次 HTTP 集成至少经历以下阶段：

| 阶段 | 可观察边界 | 失败不能伪装成 |
| --- | --- | --- |
| DNS | host 解析、A/AAAA 结果、解析耗时 | connect timeout |
| pool lease | 从连接池取得 route 对应 endpoint | TCP connect timeout |
| connect | TCP 建连，以及 HTTPS 的 TLS 建连过程 | response read timeout |
| request | headers/body 发送和请求级 timeout | 业务处理成功 |
| response headers | 状态、headers、最终 URI | body 已完整读取 |
| response body | 字节读取、大小上限、解码和关闭 | 请求 timeout 一定覆盖整个流 |
| total deadline | 所有 attempts、退避、重定向与 fallback 的总预算 | 任一库的单阶段 timeout |

客户端 API 的 `connectTimeout`、pool lease timeout 或 response timeout 都不是天然的端到端 deadline。
Apache 5.6.4 还明确说明 response timeout 不是 deadline，自动重执行会扩大总时长。课程必须把剩余
预算传入每次 attempt，并在预算不足以完成下一次退避加调用时直接停止。

## 客户端选择与资源所有权

### 一个 owner 共享一个长生命周期客户端

- JDK `HttpClient`、Spring `RestClient`/`WebClient` 和 Apache pool 都应由明确的应用组件创建、共享
  并关闭。逐请求创建客户端会丢失连接复用并模糊 executor、TLS 与 pool 的 owner。
- Spring client 的 converter、interceptor、request factory 和 observation registry 在启动期配置，
  发布后不并发修改。
- `RestClient` 适合同步请求响应；`WebClient` 适合 non-blocking、异步或流式场景。不能为了“新”
  在阻塞代码里调用 `block()` 后仍声称获得了响应式隔离。
- Apache shared connection manager 由共享方关闭；client 自身关闭不应被误认为关闭 shared manager。

### 响应 body 也是资源

状态码、headers 和 body 必须按顺序处理：先验证状态和媒体类型，再施加大小限制，最后解码。
流式 body 要在所有成功、异常、取消与提前返回路径消费完、关闭或取消。只关闭 Java wrapper 而不归还
Apache response entity，或者丢弃 `InputStream`，都会让连接不能及时回池并最终表现为 pool lease timeout。

## 连接池、并发与关闭

连接池至少需要总连接上限、每 route 上限、pool lease timeout、连接 TTL、idle 清理和关闭顺序。
这些参数是容量合同，不是普遍性能数字；课程不在没有 workload 与测量结果时给出“最佳值”。

关闭顺序固定为：拒绝新调用 -> 等待在途调用到 deadline -> 取消剩余任务 -> 关闭 client -> 关闭自有
connection manager/executor。强制关闭必须留下未完成 attempt 的结果，不能让未来一直 pending。

并发上限和 circuit breaker 解决不同问题：并发上限限制同时占用的本地资源；open circuit 暂停向已知
故障依赖发送请求。circuit breaker 本身不能替代 pool 上限，pool 上限也不能判定远端是否健康。
本课把它们作为类型化 admission 决策，不引入具体库或没有数据支撑的阈值。

## 状态、幂等与有界重试

重试决策同时依赖方法语义、业务幂等保证、失败分类和剩余预算：

1. GET、HEAD、PUT、DELETE 的协议幂等语义允许在特定通信失败后自动重试，但仍要考虑业务副作用。
2. POST/PATCH 默认不自动重试；只有服务端提供可验证的幂等 key/去重合同或能证明请求未执行时才允许。
3. 429/503 可读取有效 `Retry-After`，但等待仍必须小于剩余 deadline；其他 4xx 默认不可重试。
4. UnknownHost、TLS/证书失败、非法 URI、认证失败和确定性反序列化错误不是瞬时失败。
5. 每次重试使用有界指数退避与 jitter；总 attempt 数和总 elapsed time 同时受限。
6. 重试只允许存在一层 owner；client、service 和 job 三层都重试会乘法放大流量。

fallback 是不同机制产生可接受结果的独立路径，不是“吞异常返回空对象”。它必须有明确的数据新鲜度、
授权和降级状态，并在测试与指标中单独可见。无法满足业务合同就返回类型化失败，不伪造成功。

## 安全边界

- 业务请求只能选择后端登记的 endpoint key；不要接收完整 URL。scheme、host、port、解析后的全部
  IPv4/IPv6 地址和每次 redirect 目标都要重新检查。
- 默认关闭自动 redirect；若显式允许，限制次数、目标和方法变化，并移除 Authorization、Cookie、
  Proxy-Authorization 等敏感 headers。
- 使用系统或受管 trust store，保持主机名和证书验证；“信任所有证书”与关闭 TLS 验证只作拒绝案例。
- token 从 secret owner 注入，只在目标 allowlist 匹配时附加；不把 token、完整 URI query、请求/响应
  body、连接串或个人数据写入日志。
- proxy 是独立信任边界；显式配置并限制可转发 headers，不能让系统属性静默改变敏感调用路径。

## 逐 attempt 可观测验证

一个 logical call 可以包含多个 attempts、redirect 或 fallback。最小事件合同如下：

| 层级 | 记录 | 不记录 |
| --- | --- | --- |
| logical call | traceId、operation、endpoint key、deadline、final outcome | 原始 secret、完整 URL query |
| attempt | attempt number、remaining budget、method、host template、resend count | Authorization/Cookie 值 |
| phase | DNS/pool/connect/TLS/headers/body、耗时、timeout kind | 敏感 body |
| response | status class、Retry-After 判定、媒体类型、受限字节数 | 完整个人数据 |
| resilience | retry reason、backoff、admission/circuit 状态、fallback outcome | 假成功或被吞掉的异常 |

最终验证要证明：每个 attempt 有独立记录、`attemptCount` 与实际调用一致、deadline 未被退避突破、
取消后没有新 attempt、失败原因保留根 cause，且日志字段经过脱敏和 CR/LF 清洗。

## Java 25 与 Java 8 兼容边界

| 主题 | Java 25 / 现代主线 | Java 8 / 冻结项目线 | 教学决策 |
| --- | --- | --- | --- |
| 标准客户端 | `java.net.http.HttpClient` 25 | 无该模块，使用 `HttpURLConnection` 或框架客户端 | 不能回填 `java.net.http` |
| Spring 同步 | `RestClient`，Framework 7.0.8 | `RestTemplate`，Framework 5.2.15.RELEASE | 旧线 maintenance，不假称现代推荐 |
| Apache | HttpClient 5.6.4，`client5` 包 | HttpClient 4.5.14，`org.apache.http` 包 | API 与默认 retry 分开验证 |
| timeout | request、connect 及底层 phase 显式区分 | connect/read/pool lease 分开配置 | 0/infinite 均不得作为生产默认 |
| 关闭 | client、body、pool、executor owner 显式 | response entity、client、manager owner 显式 | 所有异常/取消路径验证归还 |
| 重试 | 类型化 policy + deadline + jitter | Java 8 兼容 policy + 旧 client 默认值隔离 | 不依赖某个客户端默认值 |

## 冻结项目证据映射

以下 8 条映射只来自 `course-coverage-matrix.json` 的冻结课程节点；不读取项目源码，不从类名
推断运行配置、网络结果或实现正确性。保留 5 条 `observed` 说明调用面，3 条 `rejected` 只说明
需要纠正的边界。

| sourceId | 冻结路径与稳定符号 | usage | 仅能支持的结论 |
| --- | --- | --- | --- |
| `JAVA-FRAMEWORK-022` | `dzzz-app/src/main/java/com/tdh/bdzz/config/RestConfig.java`；`com.tdh.bdzz.config.RestConfig` | `observed` | 项目存在 HTTP 客户端配置候选，不证明 timeout 完整 |
| `JAVA-FRAMEWORK-022` | `dzzz-app/src/main/java/com/tdh/bdzz/service/AsApiService.java`；`com.tdh.bdzz.service.AsApiService` | `observed` | 项目存在外部服务适配候选，不证明调用成功 |
| `JAVA-FRAMEWORK-022` | `dzzz-app/src/main/java/com/tdh/bdzz/util/HttpClientUtil.java`；`com.tdh.bdzz.util.HttpClientUtil` | `observed` | 项目存在 HTTP 工具候选，不作为推荐 owner |
| `JAVA-FRAMEWORK-022` | `dzzz-app/src/main/java/com/tdh/bdzz/config/HeaderRequestInterceptor.java`；`com.tdh.bdzz.config.HeaderRequestInterceptor` | `observed` | 项目存在 header interceptor 候选，不证明 secret 安全 |
| `JAVA-ENGINEERING-018` | `dzzz-app/src/main/java/com/tdh/bdzz/config/ThreadPoolConfig.java`；`com.tdh.bdzz.config.ThreadPoolConfig` | `observed` | 项目存在 executor 配置候选，不证明 pool 有界 |
| `JAVA-RISK-028` | `dzzz-app/src/main/java/com/tdh/bdzz/config/RestConfig.java`；`com.tdh.bdzz.config.RestConfig` | `rejected` | 风险侧只保留 timeout/连接状态警示，不复制实现 |
| `JAVA-RISK-028` | `dzzz-app/src/main/java/com/tdh/bdzz/download/SftpDownloader.java`；`com.tdh.bdzz.download.SftpDownloader` | `rejected` | 只保留跨网络资源关闭风险，不混入 SFTP 教学 |
| `JAVA-RISK-028` | `dzzz-app/src/main/java/com/tdh/bdzz/util/CxfClientUtil.java`；`com.tdh.bdzz.util.CxfClientUtil` | `rejected` | 只保留通用 client owner 风险，不混入 SOAP/CXF 实现 |

## 不能推出的结论

- 不能由存在 `RestConfig`、HTTP 工具或 interceptor 推出 connect/read/pool timeout 已完整配置。
- 不能由一个调用返回 2xx 推出 body 已关闭、连接已回池、重试幂等或资源可持续复用。
- 不能把 request timeout、response timeout 或 socket timeout 单独解释为端到端 deadline。
- 不能把 GET/PUT/DELETE 的协议幂等性解释为所有业务副作用都天然可重复。
- 不能由 429/503 推出必须重试；无预算、无幂等保证或 `Retry-After` 超预算时应停止。
- 不能把 client 默认 retry 与 service/job retry 叠加，也不能把 fallback 空值伪装为成功。
- 不能由 connection pool 存在推出并发已受控；总量、route 上限、lease timeout 和 caller admission
  必须分别验证。
- 不能把 redirect、proxy 或 DNS 解析视为目标 allowlist 之外的例外；每个实际目标都需重新检查。
- 不能把信任所有证书、关闭 hostname verification 或记录完整 token 当作排障手段。
- 不能把 Java 25/Spring 7/HttpClient 5 的 API、包名或默认值复制到 Java 8 旧线。

## 易错点取证与反馈环计划

正文至少覆盖以下 12 个可观察错误，每项按“现象 -> 触发条件 -> 原因 -> 后果 -> 错误示例 ->
正确写法 -> 影响版本 -> 验证方式 -> 来源”组织：

1. 每次请求创建新 client，连接无法复用且没有统一关闭 owner。
2. 只设置 connect timeout，把 DNS、pool lease、TLS、body read 和总 deadline 混成一个 timeout。
3. 将 timeout 配成 0 或未设置，故障调用无限占用线程、连接或 future。
4. 不消费/关闭响应 body，连接不能归还并最终出现 pool lease timeout。
5. 在 client、service、job 多层同时重试，故障时形成乘法 retry amplification。
6. 对 POST/PATCH 或确定性 4xx/证书/解析失败无条件重试，重复副作用并浪费预算。
7. 忽略 `Retry-After` 或让等待超过剩余 deadline，单次调用突破上游预算。
8. 只配 circuit breaker 不配并发上限，CLOSED 状态仍耗尽本地资源。
9. fallback 吞掉 cause 并返回空对象/假成功，调用方无法区分降级、缺失和正常结果。
10. 接收完整 URL、自动跟随 redirect 或信任任意证书，形成 SSRF 与 TLS 绕过。
11. 把 Authorization、Cookie、query、body 或 CR/LF 未清洗字段写入日志。
12. 把 HttpClient 5/Spring 7 API 复制到 Java 8/HttpClient 4.5.14 兼容线。

反馈环至少验证：

1. 一个 `CallPolicy` 同时给出 endpoint allowlist、method/idempotency、总 deadline、最大 attempts、
   backoff+jitter、并发 admission 与 fallback 许可。
2. 假传输依次产生 connect timeout、429 + `Retry-After`、503、确定性 4xx、TLS failure、body overflow
   和 success，断言 retry/stop 分类。
3. 端到端 deadline 覆盖所有 attempts 与退避；预算不足时不创建下一 attempt。
4. 同一个 response body 在 success、status reject、decode failure、cancel 路径都恰好关闭一次。
5. 同一个 client owner 多次调用只创建一次 client，shutdown 后拒绝新调用并完成/取消在途任务。
6. SSRF 负向输入覆盖非 HTTPS、未知 host、私网/loopback 地址、redirect 到未授权目标和 header 泄漏。
7. 每个 attempt 产生脱敏事件，最终 logical result 保留 attempt 数、最终 cause 与 fallback 状态。
8. Java 25 与 Java 8 runner 各连续运行两次；旧线 Apache 4.5.14 fixture 若启用则单独编译两次，
   不能用现代依赖结果替代。

所有 fixture、runner、缓存和输出必须位于 `/tmp` 的 `mktemp` 根；验证成功后使用显式路径删除并
确认不存在。本研究阶段不创建正文、loader、track、依赖、测试、浏览器证据或 signoff。

## 课程设计与验证合同

1. 正文顺序固定为：client owner -> timeout map/deadline -> request/response body 资源 -> connection pool
   -> 状态/幂等 -> 有界 retry -> admission/circuit/fallback -> SSRF/TLS/secret -> 逐 attempt 观测
   -> Spring 与 Java 8/Apache 4.5.14 差异。
2. 完整 Java 示例以不访问真实网络的 `HttpIntegrationExample` 为核心，用 scripted transport 验证
   deadline、retry、body close、SSRF、取消、观测和 shutdown；方法定义上方均有规范中文注释。
3. JDK 25 真实 API 最小片段只展示共享 `HttpClient`、请求 timeout、状态先行和 body 关闭；
   Java 8 片段只使用可编译 API，并保持 connect/read timeout 与 stream ownership。
4. 不给出没有 workload、远端容量、网络分布与测量结果的 timeout、pool、circuit 或 retry 最佳数字；
   示例数字只作为测试输入，不包装成生产默认。
5. 正文 frontmatter 的所有来源卡必须与本研究来源 ID/URL/order 一致；项目证据从 8 条冻结映射
   中选出能真实支持正文的 observed/rejected 项，不能升级为 adapted/corrected。
6. 正文发布前依次通过内容合同、Java 25/8 runner、负向 runner、可选 Apache 双线 fixture、
   Catalog 三次冷启动、Phase 2 validator、根质量 Gate、build、桌面/390px 浏览器验收和独立双轴复审。

## 研究 Gate 自检

- [x] 课程 ID、顺序 570、3 个前置、4 个 source capability、选择理由和 planned/not-started 状态已核对。
- [x] 35 个唯一官方直接 URL 已记录稳定 ID、标题、URL、允许的 `sourceType`、精确适用范围、
  claims 与 `verifiedAt: 2026-08-11`。
- [x] 已覆盖 client owner、timeout map、端到端 deadline、body/连接池生命周期、幂等/Retry-After、
  有界退避与 jitter、retry amplification、并发 admission、circuit/fallback、SSRF/TLS/secret 和逐 attempt 观测。
- [x] 项目证据只来自冻结课程节点：8 条 sourceId/代表符号映射；5 条 observed、3 条 rejected；
  重复符号按不同 sourceId 保留，风险证据未写成推荐实践。
- [x] Java 25、Spring 7、Apache 5.6.4 与 Java 8、Spring 5.2.15、Apache 4.5.14 精确隔离。
- [x] 未读取、运行或修改 `dzzz-app`，未创建正文、manifest、track、signoff、依赖、测试或浏览器资产。
- [x] 当前研究稿为 452 行；SHA-256 由后续 signoff 绑定，不在被校验文件
  内记录自引用哈希。

## 发布结论与 Stop Boundary

本文件只完成 Java 高级第 8 门课程的官方资料研究。研究稿通过 URL、冻结映射、格式、行数和 SHA
核验后，主流程才可进入本课正文 Gate；本研究任务不授权发布接线或第 9 门课程。
