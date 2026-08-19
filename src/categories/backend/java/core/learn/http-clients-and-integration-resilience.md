---
id: backend.java.learn.advanced.http-clients-and-integration-resilience
type: lesson
title: HTTP 客户端、超时、资源生命周期与集成韧性
summary: 为外部 HTTP 调用建立客户端 owner、分阶段超时、资源关闭、幂等重试与安全观测边界
domain: backend
technology: java
module: core
stage: advanced
level: advanced
estimatedMinutes: 240
objectives:
  - 能画出 DNS、pool lease、connect、TLS、headers、body 和 total deadline 的边界。
  - 能为 JDK HttpClient、Spring RestClient/WebClient 或 Apache client 指定唯一 owner 和关闭顺序。
  - 能区分 connect、read、pool lease、request timeout 与端到端 deadline。
  - 能按方法幂等性、失败分类、Retry-After 和剩余预算决定是否重试。
  - 能实现并验证 admission、circuit、fallback、SSRF/TLS/header 脱敏和逐 attempt 观测。
  - 能隔离 Java 25/Spring 7/HttpClient 5 与 Java 8/Spring 5.2/HttpClient 4.5.14 的 API 边界。
prerequisites:
  - backend.java.learn.intermediate.http-uri-and-request-response-basics
  - backend.java.learn.intermediate.errors-results-and-logging
  - backend.java.learn.intermediate.transactions-and-idempotency
related: []
tags:
  - Java
  - HTTP Client
  - 超时
  - 连接池
  - 幂等
  - 重试
  - SSRF
  - 可观测性
appliesTo: Java 25 / Spring Boot 4.1.0 / Spring Framework 7.0.8 / Apache HttpClient 5.6.4 主线；项目补充适用于 Java 8 / Spring Boot 2.3.12.RELEASE / Spring Framework 5.2.15.RELEASE / Apache HttpClient 4.5.14
modernBaseline:
  java: '25'
  springBoot: 4.1.0
  springFramework: 7.0.8
  apacheHttpClient: 5.6.4
legacyBaseline:
  java: '8'
  springBoot: 2.3.12.RELEASE
  springFramework: 5.2.15.RELEASE
  apacheHttpClient: 4.5.14
verifiedAt: 2026-08-11
sources:
  - id: oracle-java-support-roadmap
    title: Oracle Java SE Support Roadmap
    url: https://www.oracle.com/java/technologies/java-se-support-roadmap.html
    sourceType: official-reference
    appliesTo: Java 25
    claims: ['Java 25 是 LTS，作为现代主线版本']
  - id: boot41-system-requirements
    title: Spring Boot System Requirements
    url: https://docs.spring.io/spring-boot/system-requirements.html
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims: ['Boot 4.1.0 支持 Java 17 至 26，并要求 Spring Framework 7.0.8 或更高版本']
  - id: boot2312-system-requirements
    title: Spring Boot 2.3.12.RELEASE System Requirements
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims: ['冻结旧线从 Java 8 起运行，并使用 Spring Framework 5.2.15.RELEASE']
  - id: java25-http-client
    title: Java SE 25 API - HttpClient
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/HttpClient.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['客户端管理并复用连接；逐请求新建客户端会妨碍复用并模糊资源责任', '取消和流式 body 仍需要显式完成、关闭或取消']
  - id: java25-http-client-builder
    title: Java SE 25 API - HttpClient.Builder
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/HttpClient.Builder.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['connectTimeout 只在新建连接时生效，redirect、proxy、TLS 与 executor 是独立策略']
  - id: java25-http-request-builder
    title: Java SE 25 API - HttpRequest.Builder
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/HttpRequest.Builder.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['请求 timeout 未设置时没有该上限，URI、method、headers 与 body publisher 共同组成请求合同']
  - id: java25-http-body-handlers
    title: Java SE 25 API - HttpResponse.BodyHandlers
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/HttpResponse.BodyHandlers.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['预置 handler 不验证状态码，ofInputStream 的流必须消费、关闭或取消']
  - id: java8-url-connection
    title: Java SE 8 API - URLConnection
    url: https://docs.oracle.com/javase/8/docs/api/java/net/URLConnection.html
    sourceType: api-doc
    appliesTo: Java 8
    claims: ['connect 与 read timeout 独立，0 表示无限，read timeout 约束阻塞读取']
  - id: java8-http-url-connection
    title: Java SE 8 API - HttpURLConnection
    url: https://docs.oracle.com/javase/8/docs/api/java/net/HttpURLConnection.html
    sourceType: api-doc
    appliesTo: Java 8
    claims: ['实例不可复用，流关闭与 disconnect 的作用不同，自动 redirect 需要显式审查']
  - id: spring7-rest-clients-reference
    title: Spring Framework 7.0 REST Clients
    url: https://docs.spring.io/spring-framework/reference/7.0/integration/rest-clients.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims: ['RestClient 是同步 fluent 客户端，WebClient 是 non-blocking 客户端，RestTemplate 自 7.0 起弃用']
  - id: spring708-rest-client
    title: Spring Framework 7.0.8 RestClient Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/client/RestClient.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims: ['同步 API 可配置 request factory、status handler 和 exchange callback，并可迁移既有配置']
  - id: spring708-rest-template
    title: Spring Framework 7.0.8 RestTemplate Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/client/RestTemplate.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims: ['实例适合共享但配置不支持并发修改，新高层能力聚焦 RestClient']
  - id: spring7-webclient-configuration
    title: Spring Framework 7.0 WebClient Configuration
    url: https://docs.spring.io/spring-framework/reference/7.0/web/webflux-webclient/client-builder.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims: ['Reactor Netty 分开设置 connect、response、read/write timeout；自建资源由调用方关闭']
  - id: spring7-http-client-observability
    title: Spring Framework 7.0 Observability Support
    url: https://docs.spring.io/spring-framework/reference/7.0/integration/observability.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims: ['客户端 observation 名为 http.client.requests，覆盖连接到 body 反序列化的 exchange']
  - id: boot410-rest-clients
    title: Spring Boot 4.1 Calling REST Services
    url: https://docs.spring.io/spring-boot/4.1/reference/io/rest-client.html
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims: ['Boot 可统一配置 connect/read timeout、redirect 与 SSL bundle；直接 create 不应用 Boot 自动配置', 'InetAddressFilter.externalAddresses 可辅助 SSRF 防护']
  - id: spring5215-rest-template
    title: Spring Framework 5.2.15.RELEASE RestTemplate Javadoc
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/client/RestTemplate.html
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims: ['旧线仍提供共享同步客户端但已处于 maintenance mode，不能把现代弃用结论回填为不可用']
  - id: httpclient564-coordinates
    title: Apache HttpClient 5.6.4 Maven Coordinates
    url: https://hc.apache.org/httpcomponents-client-5.6.x/5.6.4/httpclient5/dependency-info.html
    sourceType: official-reference
    appliesTo: Apache HttpClient 5.6.4
    claims: ['现代第三方客户端坐标固定为 org.apache.httpcomponents.client5:httpclient5:5.6.4']
  - id: httpclient564-request-config
    title: Apache HttpClient 5.6.4 RequestConfig.Builder Javadoc
    url: https://hc.apache.org/httpcomponents-client-5.6.x/5.6.4/httpclient5/apidocs/org/apache/hc/client5/http/config/RequestConfig.Builder.html
    sourceType: api-doc
    appliesTo: Apache HttpClient 5.6.4
    claims: ['connection-request timeout 约束 pool lease；response timeout 不是 deadline，自动重执行可超过它']
  - id: httpclient564-connection-config
    title: Apache HttpClient 5.6.4 ConnectionConfig Javadoc
    url: https://hc.apache.org/httpcomponents-client-5.6.x/5.6.4/httpclient5/apidocs/org/apache/hc/client5/http/config/ConnectionConfig.html
    sourceType: api-doc
    appliesTo: Apache HttpClient 5.6.4
    claims: ['connect、socket、TTL 与空闲后校验是不同连接合同，HTTPS 还包含 TLS 建连阶段']
  - id: httpclient564-pooling-manager
    title: Apache HttpClient 5.6.4 PoolingHttpClientConnectionManager Javadoc
    url: https://hc.apache.org/httpcomponents-client-5.6.x/5.6.4/httpclient5/apidocs/org/apache/hc/client5/http/impl/io/PoolingHttpClientConnectionManager.html
    sourceType: api-doc
    appliesTo: Apache HttpClient 5.6.4
    claims: ['lease 可取消，release 归还可复用 endpoint，manager 支持总量和每 route 上限并可关闭']
  - id: httpclient564-closeable-client
    title: Apache HttpClient 5.6.4 CloseableHttpClient Javadoc
    url: https://hc.apache.org/httpcomponents-client-5.6.x/5.6.4/httpclient5/apidocs/org/apache/hc/client5/http/impl/classic/CloseableHttpClient.html
    sourceType: api-doc
    appliesTo: Apache HttpClient 5.6.4
    claims: ['response handler 形式会消费 entity 并归还连接，客户端关闭责任不能遗失']
  - id: httpclient564-retry-strategy
    title: Apache HttpClient 5.6.4 DefaultHttpRequestRetryStrategy Javadoc
    url: https://hc.apache.org/httpcomponents-client-5.6.x/5.6.4/httpclient5/apidocs/org/apache/hc/client5/http/impl/DefaultHttpRequestRetryStrategy.html
    sourceType: api-doc
    appliesTo: Apache HttpClient 5.6.4
    claims: ['默认最多重试一次并处理 429/503 的 Retry-After；deadline、jitter 与业务幂等需显式包装']
  - id: httpclient4514-request-config
    title: Apache HttpClient 4.5.14 RequestConfig Javadoc
    url: https://hc.apache.org/httpcomponents-client-4.5.x/4.5.14/httpclient/apidocs/org/apache/http/client/config/RequestConfig.html
    sourceType: api-doc
    appliesTo: Apache HttpClient 4.5.14
    claims: ['旧线分别配置 pool lease、connect 与 socket/read timeout，0 表示无限']
  - id: httpclient4514-connection-management
    title: Apache HttpClient 4.5.14 Connection Management Tutorial
    url: https://hc.apache.org/httpcomponents-client-4.5.x/4.5.14/tutorial/html/connmgmt.html
    sourceType: official-reference
    appliesTo: Apache HttpClient 4.5.14
    claims: ['route 池满会等待归还，需要 connection-manager timeout 并处理 pool timeout']
  - id: httpclient4514-retry-handler
    title: Apache HttpClient 4.5.14 DefaultHttpRequestRetryHandler Javadoc
    url: https://hc.apache.org/httpcomponents-client-4.5.x/4.5.14/httpclient/apidocs/org/apache/http/impl/client/DefaultHttpRequestRetryHandler.html
    sourceType: api-doc
    appliesTo: Apache HttpClient 4.5.14
    claims: ['旧默认 retry count 为 3，并按异常与请求是否已发送决定是否重试']
  - id: rfc9110-idempotent-methods
    title: RFC 9110 Section 9.2.2 Idempotent Methods
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2
    sourceType: specification
    appliesTo: HTTP Semantics
    claims: ['幂等请求在通信失败且未收到响应时可自动重试；非幂等请求需要额外保证']
  - id: rfc9110-retry-after
    title: RFC 9110 Section 10.2.3 Retry-After
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-10.2.3
    sourceType: specification
    appliesTo: HTTP Semantics
    claims: ['Retry-After 是 HTTP-date 或非负秒数，等待仍受总 deadline 约束']
  - id: rfc9110-redirection
    title: RFC 9110 Section 15.4 Redirection
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-15.4
    sourceType: specification
    appliesTo: HTTP Semantics
    claims: ['自动跳转须防循环并移除敏感目标特定 headers，不安全方法的跳转需谨慎']
  - id: rfc6585-too-many-requests
    title: RFC 6585 Section 4 - 429 Too Many Requests
    url: https://www.rfc-editor.org/rfc/rfc6585.html#section-4
    sourceType: specification
    appliesTo: HTTP 429
    claims: ['429 表示请求过多，响应可以给出 Retry-After，不是无条件立即重试信号']
  - id: aws-limit-retries
    title: AWS REL05-BP03 Control and limit retry calls
    url: https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_mitigate_interaction_failure_limit_retries.html
    sourceType: engineering-reference
    appliesTo: AWS Well-Architected current page verified 2026-08-11
    claims: ['只重试瞬时失败，使用指数退避、jitter 和最大次数或总耗时，多层重试会放大流量']
  - id: aws-client-timeouts
    title: AWS REL05-BP05 Set client timeouts
    url: https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_mitigate_interaction_failure_client_timeouts.html
    sourceType: engineering-reference
    appliesTo: AWS Well-Architected current page verified 2026-08-11
    claims: ['跨进程调用应设置 connect 和 request timeout，并以观测数据校准']
  - id: owasp-ssrf-prevention
    title: OWASP SSRF Prevention Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: OWASP Cheat Sheet verified 2026-08-11
    claims: ['优先 allowlist 已知目标，检查 A/AAAA 与 DNS rebinding，关闭自动 redirect']
  - id: owasp-tls
    title: OWASP Transport Layer Security Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: OWASP Cheat Sheet verified 2026-08-11
    claims: ['优先 TLS 1.3，兼容时保留 1.2，不能关闭证书身份验证或信任任意证书']
  - id: owasp-logging
    title: OWASP Logging Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: OWASP Cheat Sheet verified 2026-08-11
    claims: ['token、密码、连接串和密钥不得直接记录，外部字段需清洗 CR/LF']
  - id: otel-http-client-spans
    title: OpenTelemetry Semantic Conventions for HTTP Spans
    url: https://opentelemetry.io/docs/specs/semconv/http/http-spans/
    sourceType: specification
    appliesTo: OpenTelemetry HTTP client spans stable convention verified 2026-08-11
    claims: ['出站调用使用 CLIENT span，重试和 redirect 以逐 attempt span 观测并记录 resend count']
projectEvidence:
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/RestConfig.java
    symbol: com.tdh.bdzz.config.RestConfig
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/service/AsApiService.java
    symbol: com.tdh.bdzz.service.AsApiService
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/HttpClientUtil.java
    symbol: com.tdh.bdzz.util.HttpClientUtil
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/HeaderRequestInterceptor.java
    symbol: com.tdh.bdzz.config.HeaderRequestInterceptor
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/ThreadPoolConfig.java
    symbol: com.tdh.bdzz.config.ThreadPoolConfig
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/RestConfig.java
    symbol: com.tdh.bdzz.config.RestConfig
    usage: rejected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/download/SftpDownloader.java
    symbol: com.tdh.bdzz.download.SftpDownloader
    usage: rejected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/CxfClientUtil.java
    symbol: com.tdh.bdzz.util.CxfClientUtil
    usage: rejected
---
# HTTP 客户端、超时、资源生命周期与集成韧性
## 为什么需要学习
外部 HTTP 调用不是“发出 URL、拿到 JSON”这么简单。DNS、连接池租借、TCP/TLS 建连、请求发送、响应头、响应体读取和关闭各有不同的资源与失败边界。任何一个边界没有被建模，线程会长期阻塞，连接不能归还，重试会制造更大流量，日志还可能泄露凭据。
本课把一次 logical call 变成可观察的有限状态：一个长期共享的 client owner 管理连接和 executor；每次 attempt 使用剩余 deadline；响应 body 在所有路径恰好完成或关闭；重试只由一个 owner 按幂等、状态和预算决定；拒绝、熔断和 fallback 都返回明确结果。
## 学习目标
- 能画出 DNS、pool lease、connect、TLS、headers、body 和 total deadline 的边界。
- 能为 JDK HttpClient、Spring RestClient/WebClient 或 Apache client 指定唯一 owner 和关闭顺序。
- 能区分 connect、read、pool lease、request timeout 与端到端 deadline。
- 能按方法幂等性、失败分类、Retry-After 和剩余预算决定是否重试。
- 能实现并验证并发 admission、circuit、fallback、SSRF/TLS/header 脱敏和逐 attempt 观测。
- 能隔离 Java 25/Spring 7/HttpClient 5 与 Java 8/Spring 5.2/HttpClient 4.5.14 的 API 边界。
## 前置术语
你已经在 HTTP 基础课中学习了 URI、method、status、headers 和 body，在错误合同课中学习了 cause 与结构化日志，在事务与幂等课中学习了重复执行的业务风险。本课只把这些术语放进一次跨进程调用的生命周期；`deadline` 是调用方愿意等待的绝对结束时间，`attempt` 是其中一次实际发送。
## 零基础知识点详解
### Client owner 是长期共享的资源边界
**它是什么：** client owner 是创建、配置、共享并关闭 HTTP client、连接池和 executor 的应用组件。 **有什么作用：** 一个 owner 能保留连接复用、统一 TLS/代理/观测配置，并在关闭时知道哪些资源属于自己。
**什么时候用：** 应用启动时创建 singleton 或明确生命周期的 client；请求方法只接收 owner，不在每次调用中 `newHttpClient()`。 **怎么用：** 启动配置完成后发布为只读依赖；关闭按“拒绝新调用、等待 deadline、取消、关 client、关自有 pool/executor”执行。
**最小示例：** 复用 `new IntegrationClient(transport)`。
**运行结果：** 连续三次调用仍使用一个 owner，关闭后得到类型化拒绝。
**容易错在哪里：** 把共享 client 当成无须关闭的全局变量，或关闭了不属于自己的 shared connection manager。
### 一次调用必须拆成 timeout map
**它是什么：** timeout map 为 DNS、pool lease、connect/TLS、request/headers 和 body read 分别命名上限。 **有什么作用：** 失败报告能说明是没有租到连接、连不上远端还是读取响应停滞，而不是都叫“超时”。
**什么时候用：** JDK `connectTimeout`、Apache `connectionRequestTimeout`、`responseTimeout` 或 Java 8 `readTimeout` 同时存在时。 **怎么用：** 每个阶段读取剩余预算，阶段超时不能把无限值 `0` 当作生产默认；DNS 没有标准 per-call timeout 时要单独观测。
**最小示例：** 声明 `new TimeoutMap(5, 10, 30)`。
**运行结果：** pool lease 超时记录为 `POOL_LEASE_TIMEOUT`，不会误报 connect。
**容易错在哪里：** 只设置 connect timeout 就认为 body read 和 DNS 也受到限制。
### total deadline 约束所有 attempt
**它是什么：** deadline 是一个绝对时间点，不是每次 attempt 都重新开始计时的 duration。 **有什么作用：** 重试退避、Retry-After、redirect 和 fallback 不能把一次调用拖过上游预算。
**什么时候用：** service、job 或消息消费者调用任何跨进程依赖时，把调用方预算传入策略。 **怎么用：** `remaining = deadline - clock.now()`；下一次退避加最小调用成本超过 remaining 时直接停止。
**最小示例：** 计算 `remaining = deadline - clock.now`。
**运行结果：** 429 等待超过预算时为 `RETRY_BUDGET_EXHAUSTED`，不创建第二次 attempt。
**容易错在哪里：** 每次重试重新取 `now + requestTimeout`，导致总 elapsed 无界。
### response body 也是必须关闭的资源
**它是什么：** response 不只有 status 和 headers，body stream/entity 还持有 socket、缓冲或连接池 endpoint。 **有什么作用：** 消费、关闭或取消 body 才能让连接及时归还，避免后续 pool lease timeout。
**什么时候用：** 状态拒绝、媒体类型错误、大小超限、解码失败、取消和正常返回的每一条路径。 **怎么用：** 先检查状态和媒体类型，再限制字节数，最后在 `try/finally` 或 response handler 中关闭；`ofInputStream` 不能丢弃返回流。
**最小示例：** 在 `finally` 中执行 `response.close()`。
**运行结果：** 每个 scripted response 的 `closeCount` 恰好为 1。
**容易错在哪里：** 只关闭外层 reader，或者在判断 4xx 后直接 return 而不处理 entity。
### 连接池是容量合同
**它是什么：** 连接池规定总连接数、每 route 上限、租借等待、TTL、idle 清理和释放责任。 **有什么作用：** 它限制本地资源占用并改善连接复用，但不能判断远端是否健康。
**什么时候用：** Apache classic 或 Reactor Netty 共享连接时；JDK client 也要把 client 生命周期当作池 owner。 **怎么用：** 先从并发 admission 得到许可，再租借 route；lease 超时立即失败，响应完成后 release，shutdown 时停止新租借。
**最小示例：** 使用 `AtomicInteger.compareAndSet` 获取许可。
**运行结果：** 容量已满时得到 `ADMISSION_REJECTED`，不会无限排队。
**容易错在哪里：** 把 pool 上限当成端到端限流，或者只关 client 不关自己创建的 manager。
### HTTP method 语义决定默认幂等性
**它是什么：** safe 方法以及 PUT、DELETE 在协议语义上是幂等的；幂等描述重复请求的预期效果，不是“不会失败”。 **有什么作用：** 通信失败且未读到响应时，客户端才有基础判断是否可重试。
**什么时候用：** 设计 retry policy 或选择是否要求业务 `Idempotency-Key` 时。 **怎么用：** GET/HEAD/PUT/DELETE 仍检查业务副作用；POST/PATCH 默认停止，除非服务端提供可验证去重合同。
**最小示例：** 调用 `policy.isIdempotent(Method.POST)`。
**运行结果：** POST 收到 503 只执行一次，除非另有业务去重合同。
**容易错在哪里：** 把“PUT 幂等”误读为所有 PUT 都能无条件重复，或让库默认重试 POST。
### 失败分类先于 retry 次数
**它是什么：** retry policy 先把失败分为瞬时传输错误、可等待的 429/503、确定性 4xx、认证/TLS/解析错误和业务错误。 **有什么作用：** 避免对无论重试多少次都不会改变的输入或凭据错误浪费预算。
**什么时候用：** 捕获 `UnknownHost`、TLS failure、connect/read timeout、429/503 或响应解码错误时。 **怎么用：** 只有幂等或有业务去重保证且仍有预算时允许 retry；保留根 cause 和分类，不以空结果替代异常。
**最小示例：** 将失败映射到 `FailureKind`。
**运行结果：** 解析、证书和 400 停止；GET 的 connect timeout 才可能 retry。
**容易错在哪里：** 看到任何 `IOException` 都 retry，或者只按 status 而忽略请求是否已经发送。
### Retry-After、backoff 与 jitter 必须受预算限制
**它是什么：** Retry-After 是 HTTP-date 或非负秒数；backoff 是客户端等待，jitter 是防止同刻重试的随机扰动。 **有什么作用：** 尊重服务端节流信号，避免所有实例同步重试，并把等待纳入 deadline。
**什么时候用：** 429/503 有合法 Retry-After，或瞬时故障需要多次尝试时。 **怎么用：** 取服务端等待与客户端上限的较小值，加入有界指数退避和 jitter；若等待后没有最小调用预算就停止。
**最小示例：** 比较 `wait + 1L >= remaining`。
**运行结果：** 等待超过预算时不睡眠、不重试，记录预算耗尽。
**容易错在哪里：** 忽略 Retry-After、无限指数增长，或测试使用随机时间却没有可复现的 clock。
### 重试只允许一个 owner
**它是什么：** 一次 logical call 的 retry owner 是 service、client 或 job 中唯一被授权做 retry 的层。 **有什么作用：** 防止 client 3 次、service 3 次、job 3 次形成最多 27 次调用的 retry amplification。
**什么时候用：** 已经引入 SDK 默认重试、消息重投或任务调度重试时。 **怎么用：** 在接口合同中写明 owner、最大 attempt 和总 deadline；其他层只传播分类结果。
**最小示例：** 将 `attempts < maxAttempts` 放入 retry 条件。
**运行结果：** 实际 attempt 数不超过 policy，外层不会再乘法放大。
**容易错在哪里：** 只在日志中写“重试一次”，却没有禁止下游库的自动 retry。
### admission 与 circuit 解决不同问题
**它是什么：** admission 限制本地同时占用的调用数；circuit 根据失败/慢调用状态暂时拒绝已知故障依赖。 **有什么作用：** 一个保护本地池和线程，另一个减少向故障远端发送的新流量。
**什么时候用：** 高并发外呼、依赖故障或半开探测时，两者需要同时出现。 **怎么用：** 先检查 shutdown、并发许可和 circuit，再创建 attempt；CLOSED 不代表没有并发上限，HALF_OPEN 只放行有限探测。
**最小示例：** admission 前检查 `policy.circuitOpen`。
**运行结果：** OPEN 时返回 `CIRCUIT_OPEN`，transport 调用计数不增加。
**容易错在哪里：** 只有 circuit 没有 bulkhead/admission，或把 pool lease timeout 当作远端熔断。
### fallback 是有授权的不同机制
**它是什么：** fallback 用缓存、只读副本或受限默认值产生可接受结果，和 retry/failover 不是同一件事。 **有什么作用：** 调用方能区分新鲜成功、降级成功、缺失和明确失败。
**什么时候用：** 业务明确允许旧数据或只读降级，且有数据新鲜度、权限和审计合同时。 **怎么用：** 返回带 `outcome=FALLBACK`、原因和 freshness 的结果；不满足合同就返回失败并保留 cause。
**最小示例：** 返回 `Outcome.FALLBACK_STALE` 与根 cause。
**运行结果：** 过期缓存不会伪装成空 DTO 的 `SUCCESS`。
**容易错在哪里：** catch 后 `return new Object()`，让上层无法区分真正的成功。
### SSRF 防护从 endpoint key 开始
**它是什么：** endpoint key 是后端登记的逻辑名称，映射到固定 scheme、host、port 与允许地址；用户不直接提供完整 URL。 **有什么作用：** allowlist 可在 DNS、IPv4/IPv6、redirect 和 proxy 边界阻止内网或环回目标。
**什么时候用：** URL 中含用户输入、 webhook、导入地址或可配置第三方 endpoint 时。 **怎么用：** 只登记 HTTPS endpoint；每个 attempt 重新解析并检查全部 A/AAAA 结果，关闭自动 redirect；每个 redirect 目标重新做同样检查。
**最小示例：** 由 `endpointKey` 查到固定 endpoint。
**运行结果：** 未知 key、私网解析和未授权 redirect 都在 transport 前拒绝。
**容易错在哪里：** 只检查字符串前缀、只检查第一次解析，或信任 `Host` header。
### TLS、secret 与 header 要有独立边界
**它是什么：** TLS trust store/hostname verification、secret 注入和 header 脱敏是三个不同合同。 **有什么作用：** “连得上”不能覆盖证书身份；“有 token”不能授权任意目标；日志也不能回显 token。
**什么时候用：** 配置 SSL bundle、Authorization/Cookie、proxy 或诊断日志时。 **怎么用：** 使用系统或受管 trust store；只在 allowlist endpoint 注入短期 secret；日志只记录 header 名和脱敏类别并清洗 CR/LF。
**最小示例：** 事件只写入 `endpointKey` 和 `FailureKind`。
**运行结果：** TLS 失败保留分类，token、Cookie、query 和 body 不出现。
**容易错在哪里：** 设置 trust-all、关闭 hostname verification，或把完整请求头写入 debug 日志。
### 每个 attempt 都应产生脱敏观测
**它是什么：** logical call 包含 call、attempt、phase、response 和 resilience 五层事件；每次实际发送是一个独立 attempt。 **有什么作用：** 能把重试、redirect、退避、超时和最终结果关联起来，而不泄露内容。
**什么时候用：** 接入 Spring `http.client.requests`、OpenTelemetry CLIENT span 或自定义指标时。 **怎么用：** 记录 traceId、operation、endpoint key、attempt number、remaining budget、status class、timeout kind、retry reason 和最终 cause；host 使用模板。
**最小示例：** 每次发送创建 `new AttemptEvent(...)`。
**运行结果：** 两次 attempt 产生两条脱敏事件，计数与 transport 调用相等。
**容易错在哪里：** 只记录最终 503，或把 Authorization 和完整 query 当作排障上下文。
### Java 25 与 Java 8 是两条明确的 API 线
**它是什么：** Java 25 可以使用 `java.net.http.HttpClient`、Spring 7 `RestClient` 和 Apache 5；Java 8 使用 `HttpURLConnection`、Spring 5.2 `RestTemplate` 和 Apache 4.5。 **有什么作用：** 包名、timeout 类型、默认 retry 和生命周期 API 不会被错误地混合。
**什么时候用：** 为旧项目升级、编译 profile 或选择 Spring/Apache 客户端时。 **怎么用：** 现代代码先写在受支持版本；legacy 代码单独编译并标出 maintenance 与 API 差异。
**最小示例：** 用 Java 8 语法编译 `HttpIntegrationExample`。
**运行结果：** Java 8 不引用 `java.net.http`，Java 25 同一合同也通过。
**容易错在哪里：** 把 Spring 7 的 Boot 属性复制到 Boot 2.3，或以一个版本的默认 retry 推断另一个版本。
## JDK 25 与 Java 8 最小 API 对照
现代 JDK 只展示真实 `java.net.http` API；`ofInputStream()` 的 body 由调用方关闭，状态判断仍在 body 处理前完成。
```java
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/** 演示 JDK 25 真实 API 的最小可编译单元。 */
public final class Jdk25HttpClientSnippet {
  /** 使用 JDK 25 的共享 client、request timeout、状态先行和 body 关闭。 */
  public static void fetchWithJdk25(HttpClient client, URI uri) throws IOException, InterruptedException {
    HttpRequest request = HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(5)).GET().build();
    HttpResponse<InputStream> response = client.send(request, HttpResponse.BodyHandlers.ofInputStream());
    try (InputStream body = response.body()) { if (response.statusCode() / 100 == 2) body.read(); }
  }
}
```
Java 8 使用可编译的 `HttpURLConnection` API，connect/read timeout 与 stream ownership 仍然分开。
```java
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/** 演示 Java 8 真实 API 的最小可编译单元。 */
public final class Java8HttpUrlConnectionSnippet {
  /** 使用 Java 8 的连接、分阶段 timeout、stream ownership 和 disconnect。 */
  public static void fetchWithJava8(URL url) throws IOException {
    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
    connection.setConnectTimeout(2000); connection.setReadTimeout(5000);
    try (InputStream body = connection.getInputStream()) { body.read(); } finally { connection.disconnect(); }
  }
}
```
## 现代版本中的正确用法
现代同步 Spring 调用优先使用 `RestClient`，响应式或流式场景才使用 `WebClient`；没有 Spring 需求时可直接使用一个共享的 JDK `HttpClient`。Apache 5.6.4 适合需要 classic 连接池、route 上限和 response handler 的场景，但必须由明确 owner 关闭。
配置在启动期完成，发布后不并发修改 request factory、interceptor、converter、SSL 或 observation registry。Boot 自动配置的 client builder 与直接 `RestClient.create()` 的行为不同；需要统一 timeout、redirect 和 SSL bundle 时不要绕过 Boot owner。
## 核心接口与完整示例
下面的示例不访问真实网络，使用 scripted transport 模拟 429、503、body 关闭、预算耗尽、并发 admission、熔断、SSRF、脱敏观测和 shutdown。它只使用 Java 8 语法，因此可以在 Java 25 与 Java 8 分别编译。
```java
import java.net.URI;
import java.util.*;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
/** 展示有界 HTTP 集成策略的可运行示例。 */
public final class HttpIntegrationExample {
    enum Method { GET, POST }
    enum Outcome { SUCCESS, FAILED, FALLBACK_STALE, ADMISSION_REJECTED, CIRCUIT_OPEN, SHUTDOWN_REJECTED }
    enum FailureKind { NONE, DEADLINE_EXPIRED, BODY_TOO_LARGE, DECODE_FAILURE, HTTP_BAD_REQUEST, HTTP_TOO_MANY_REQUESTS, HTTP_SERVICE_UNAVAILABLE, HTTP_OTHER, CONNECT_TIMEOUT, READ_TIMEOUT, TLS_FAILURE, UNKNOWN_HOST, CANCELLED, RETRY_BUDGET_EXHAUSTED, REDIRECT_DISABLED }
    enum StatusClass { NO_RESPONSE, SUCCESS, REDIRECTION, CLIENT_ERROR, SERVER_ERROR }
    static final class Request {
        final String traceId, operation, endpointKey, path, token; final Method method; final Map<String, String> headers; final boolean cancelAfterResponse;
        /** 创建默认不会取消的脱敏请求。 */
        Request(String endpointKey, Method method, String path, String token) { this("trace-demo", "catalog.read", endpointKey, method, path, token, false); }
        /** 创建带调用关联信息和可测试取消点的请求。 */
        Request(String traceId, String operation, String endpointKey, Method method, String path, String token, boolean cancelAfterResponse) { this(traceId, operation, endpointKey, method, path, token, defaultHeaders(token), cancelAfterResponse); }
        /** 创建带真实敏感 header、但不会在事件中暴露其值的请求。 */
        Request(String traceId, String operation, String endpointKey, Method method, String path, String token, Map<String, String> headers, boolean cancelAfterResponse) { this.traceId = traceId; this.operation = operation; this.endpointKey = endpointKey; this.method = method; this.path = path; this.token = token; this.headers = Collections.unmodifiableMap(new LinkedHashMap<String, String>(headers)); this.cancelAfterResponse = cancelAfterResponse; }
        /** 创建用于脱敏验证的 Authorization 与 Cookie。 */
        private static Map<String, String> defaultHeaders(String token) { Map<String, String> headers = new LinkedHashMap<String, String>(); headers.put("Authorization", "Bearer " + token); headers.put("Cookie", "session=abc"); return headers; }
    }
    static final class Endpoint {
        final String scheme, host; final int port; final Set<String> allowedAddresses;
        /** 创建固定 HTTPS scheme、host、port 与解析地址的 endpoint。 */
        Endpoint(String scheme, String host, int port, Set<String> allowedAddresses) {
            if (!"https".equalsIgnoreCase(scheme)) throw new IllegalArgumentException("only https endpoints are allowed");
            this.scheme = "https"; this.host = host; this.port = port; this.allowedAddresses = allowedAddresses;
        }
        /** 从受限路径组装目标，调用方无法替换 authority。 */
        URI uri(String path) {
            if (!path.startsWith("/") || path.startsWith("//") || path.indexOf('#') >= 0) throw new IllegalArgumentException("path is not allowed");
            return URI.create(scheme + "://" + host + ":" + port + path);
        }
    }
    static final class Response implements AutoCloseable {
        final int status; final long retryAfterMillis, elapsedMillis; final boolean bodyTooLarge, cancelAfterHeaders, decodeFailure; final String redirectLocation;
        int closeCount;
        /** 创建不会在响应头后取消的 scripted response。 */
        Response(int status, long retryAfterMillis, boolean bodyTooLarge, String redirectLocation) { this(status, retryAfterMillis, bodyTooLarge, redirectLocation, false); }
        /** 创建可模拟 body 读取前取消的 scripted response。 */
        Response(int status, long retryAfterMillis, boolean bodyTooLarge, String redirectLocation, boolean cancelAfterHeaders) { this(status, retryAfterMillis, bodyTooLarge, redirectLocation, cancelAfterHeaders, false); }
        /** 创建可模拟 decoder 失败的 scripted response。 */
        Response(int status, long retryAfterMillis, boolean bodyTooLarge, String redirectLocation, boolean cancelAfterHeaders, boolean decodeFailure) { this(status, retryAfterMillis, bodyTooLarge, redirectLocation, cancelAfterHeaders, decodeFailure, 0); }
        /** 创建带有实际 transport 耗时的 scripted response。 */
        Response(int status, long retryAfterMillis, boolean bodyTooLarge, String redirectLocation, boolean cancelAfterHeaders, boolean decodeFailure, long elapsedMillis) { this.status = status; this.retryAfterMillis = retryAfterMillis; this.bodyTooLarge = bodyTooLarge; this.redirectLocation = redirectLocation; this.cancelAfterHeaders = cancelAfterHeaders; this.decodeFailure = decodeFailure; this.elapsedMillis = elapsedMillis; }
        /** 恰好记录一次 body 关闭。 */
        public void close() { closeCount++; }
    }
    static final class TransportFailure extends Exception {
        private static final long serialVersionUID = 1L;
        final FailureKind kind; final long elapsedMillis;
        /** 创建带有稳定分类的传输失败。 */
        TransportFailure(FailureKind kind) { this(kind, 0); }
        /** 创建带实际 transport 耗时的类型化失败。 */
        TransportFailure(FailureKind kind, long elapsedMillis) { super(kind.name()); this.kind = kind; this.elapsedMillis = elapsedMillis; }
    }
    interface Transport {
        /** 使用剩余预算和分阶段 timeout 执行一次实际 attempt。 */
        Response execute(Request request, Endpoint endpoint, URI uri, TimeoutMap timeouts, long remaining)
                throws TransportFailure;
        /** 请求 transport 取消仍在执行的阻塞调用。 */
        default void cancelInFlight() { }
    }
    static final class ScriptedTransport implements Transport {
        final List<Object> steps; int index, calls;
        /** 创建不访问网络的脚本传输。 */
        ScriptedTransport(Object... steps) { this.steps = Arrays.asList(steps); }
        /** 返回下一步并统计实际调用次数。 */
        public Response execute(Request request, Endpoint endpoint, URI uri, TimeoutMap timeouts,
                                long remaining) throws TransportFailure {
            calls++; Object step = steps.get(index++);
            if (step instanceof TransportFailure) throw (TransportFailure) step;
            return (Response) step;
        }
    }
    interface AddressResolver {
        /** 返回指定主机的全部 A/AAAA 结果。 */
        Set<String> resolve(String host);
    }
    static final class TimeoutMap {
        final long poolLeaseMillis, connectMillis, readMillis;
        /** 创建阶段 timeout map；每个值还要受剩余 deadline 截断。 */
        TimeoutMap(long poolLeaseMillis, long connectMillis, long readMillis) { this.poolLeaseMillis = poolLeaseMillis; this.connectMillis = connectMillis; this.readMillis = readMillis; }
    }
    static final class CallPolicy {
        final Map<String, Endpoint> endpoints; final AddressResolver resolver; final TimeoutMap timeouts;
        final long deadlineMillis; final int maxAttempts, maxConcurrent;
        final boolean allowFallback, circuitOpen;
        /** 创建策略；示例数值只是测试输入，不是生产默认值。 */
        CallPolicy(Map<String, Endpoint> endpoints, AddressResolver resolver, TimeoutMap timeouts,
                   long deadlineMillis, int maxAttempts, int maxConcurrent, boolean allowFallback,
                   boolean circuitOpen) {
            this.endpoints = endpoints; this.resolver = resolver; this.timeouts = timeouts;
            this.deadlineMillis = deadlineMillis; this.maxAttempts = maxAttempts; this.maxConcurrent = maxConcurrent; this.allowFallback = allowFallback; this.circuitOpen = circuitOpen;
        }
        /** 判断请求方法是否具备协议层幂等基础。 */
        boolean isIdempotent(Method method) { return method == Method.GET; }
        /** 取得被后端登记的 endpoint key。 */
        Endpoint endpoint(String key) {
            Endpoint endpoint = endpoints.get(key);
            if (endpoint == null) throw new IllegalArgumentException("unknown endpoint key");
            return endpoint;
        }
        /** 计算带有上限的指数退避和可复现 jitter。 */
        long backoffMillis(int attempt) { return Math.min(40L,
                5L * (1L << Math.min(attempt - 1, 3)) + (attempt * 3L) % 5L); }
    }
    static final class Result {
        final Outcome outcome; final int attempts; final FailureKind cause; final LogicalCallEvent callEvent; final List<AttemptEvent> events;
        /** 创建包含 logical-call 终态和逐 attempt 快照的结果。 */
        Result(Outcome outcome, int attempts, FailureKind cause, LogicalCallEvent callEvent, List<AttemptEvent> events) { this.outcome = outcome; this.attempts = attempts; this.cause = cause; this.callEvent = callEvent; this.events = events; }
    }
    static final class LogicalCallEvent {
        final String traceId, operation, endpointKey; final long deadlineMillis; final Outcome finalOutcome;
        /** 创建不含 secret、完整 URL 或 body 的 logical-call 终态事件。 */
        LogicalCallEvent(String traceId, String operation, String endpointKey, long deadlineMillis, Outcome finalOutcome) { this.traceId = traceId; this.operation = operation; this.endpointKey = endpointKey; this.deadlineMillis = deadlineMillis; this.finalOutcome = finalOutcome; }
    }
    static final class AttemptEvent {
        final String endpointKey, hostTemplate; final Method method; final List<String> headerNames; final int attempt, resendCount; final long remainingMillis; final StatusClass statusClass; final FailureKind cause;
        /** 创建单个 attempt 的观测快照。 */
        AttemptEvent(Request request, String hostTemplate, int attempt, long remainingMillis, StatusClass statusClass, FailureKind cause) { this.endpointKey = request.endpointKey; this.method = request.method; this.hostTemplate = hostTemplate; this.headerNames = safeHeaderNames(request.headers.keySet()); this.attempt = attempt; this.resendCount = attempt - 1; this.remainingMillis = remainingMillis; this.statusClass = statusClass; this.cause = cause; }
        /** 复制 header 名并清洗可能伪造日志行的 CR/LF。 */
        private static List<String> safeHeaderNames(Set<String> names) {
            List<String> safeNames = new ArrayList<String>();
            for (String name : names) safeNames.add(name.replace('\r', '_').replace('\n', '_'));
            return Collections.unmodifiableList(safeNames);
        }
        /** 返回适合断言的脱敏文本。 */
        public String toString() { return endpointKey + ":" + method + ":" + hostTemplate + ":" + attempt + ":" + resendCount + ":" + remainingMillis + ":" + statusClass + ":" + cause + ":headers=" + headerNames; }
    }
    static final class IntegrationClient implements AutoCloseable {
        final Transport transport;
        final AtomicInteger inFlight = new AtomicInteger();
        volatile boolean accepting = true; volatile boolean shutdownRequested;
        /** 创建长期共享的 client owner。 */
        IntegrationClient(Transport transport) { this.transport = transport; }
        /** 执行一次带 admission、重试和 body 关闭合同的调用。 */
        Result call(Request request, CallPolicy policy) {
            List<AttemptEvent> events = new ArrayList<AttemptEvent>();
            if (!accepting) return result(request, policy, Outcome.SHUTDOWN_REJECTED, 0, FailureKind.NONE, events);
            if (policy.circuitOpen) return result(request, policy, Outcome.CIRCUIT_OPEN, 0, FailureKind.NONE, events);
            if (!acquire(policy.maxConcurrent)) return result(request, policy, Outcome.ADMISSION_REJECTED, 0, FailureKind.NONE, events);
            if (!accepting) {
                inFlight.decrementAndGet();
                return result(request, policy, Outcome.SHUTDOWN_REJECTED, 0, FailureKind.NONE, events);
            }
            int attempts = 0; FailureKind cause = FailureKind.NONE;
            try {
                Endpoint endpoint = policy.endpoint(request.endpointKey);
                URI uri = endpoint.uri(request.path);
                long elapsedMillis = 0;
                while (attempts < policy.maxAttempts) {
                    long remaining = policy.deadlineMillis - elapsedMillis;
                    if (remaining <= 0) { cause = FailureKind.DEADLINE_EXPIRED; break; }
                    if (shutdownRequested) { cause = FailureKind.CANCELLED; break; }
                    validateTarget(endpoint, uri, policy);
                    attempts++;
                    Response response = null; try {
                        response = transport.execute(request, endpoint, uri, policy.timeouts, remaining);
                        elapsedMillis += response.elapsedMillis;
                        long remainingAfterTransport = policy.deadlineMillis - elapsedMillis;
                        if (remainingAfterTransport <= 0) {
                            cause = FailureKind.DEADLINE_EXPIRED;
                            events.add(event(request, endpoint, attempts, remaining, StatusClass.NO_RESPONSE, cause));
                            break;
                        }
                        if (request.cancelAfterResponse || response.cancelAfterHeaders || shutdownRequested) {
                            cause = FailureKind.CANCELLED;
                            events.add(event(request, endpoint, attempts, remaining, StatusClass.NO_RESPONSE, cause));
                            break;
                        }
                        cause = classify(response);
                        events.add(event(request, endpoint, attempts, remaining, statusClass(response.status), cause));
                        if (response.redirectLocation != null) {
                            validateTarget(endpoint, uri.resolve(response.redirectLocation), policy);
                            cause = FailureKind.REDIRECT_DISABLED;
                            break;
                        }
                        if (response.status >= 200 && response.status < 300 && !response.bodyTooLarge && !response.decodeFailure)
                            return result(request, policy, Outcome.SUCCESS, attempts, FailureKind.NONE, events);
                        if (!shouldRetry(request, policy, cause, remainingAfterTransport, attempts)) break;
                        long wait = response.retryAfterMillis > 0 ? response.retryAfterMillis : policy.backoffMillis(attempts);
                        if (!advance(wait, remainingAfterTransport)) {
                            cause = FailureKind.RETRY_BUDGET_EXHAUSTED; break;
                        }
                        elapsedMillis += wait;
                    } catch (TransportFailure failure) {
                        elapsedMillis += failure.elapsedMillis;
                        long remainingAfterTransport = policy.deadlineMillis - elapsedMillis;
                        if (remainingAfterTransport <= 0) {
                            cause = FailureKind.DEADLINE_EXPIRED;
                            events.add(event(request, endpoint, attempts, remaining, StatusClass.NO_RESPONSE, cause));
                            break;
                        }
                        cause = failure.kind;
                        events.add(event(request, endpoint, attempts, remaining, StatusClass.NO_RESPONSE, cause));
                        if (!shouldRetry(request, policy, cause, remainingAfterTransport, attempts)) break;
                        long wait = policy.backoffMillis(attempts);
                        if (!advance(wait, remainingAfterTransport)) {
                            cause = FailureKind.RETRY_BUDGET_EXHAUSTED; break;
                        }
                        elapsedMillis += wait;
                    } finally { if (response != null) response.close(); }
                }
                if (policy.allowFallback && allowsFallback(cause)) return result(request, policy, Outcome.FALLBACK_STALE, attempts, cause, events);
                return result(request, policy, Outcome.FAILED, attempts, cause, events);
            } finally {
                inFlight.decrementAndGet();
            }
        }
        /** 检查 HTTPS、host、port 和本 attempt 新解析的全部 A/AAAA 地址。 */
        private void validateTarget(Endpoint endpoint, URI uri, CallPolicy policy) {
            int port = uri.getPort() < 0 ? 443 : uri.getPort();
            if (!"https".equalsIgnoreCase(uri.getScheme()) || !endpoint.scheme.equalsIgnoreCase(uri.getScheme()) || !endpoint.host.equals(uri.getHost()) || endpoint.port != port) throw new IllegalArgumentException("endpoint is not allowlisted");
            Set<String> addresses = policy.resolver.resolve(uri.getHost());
            if (addresses.isEmpty()) throw new IllegalArgumentException("endpoint has no address");
            for (String address : addresses) if (isPrivateOrLoopback(address) || !endpoint.allowedAddresses.contains(address)) throw new IllegalArgumentException("endpoint address is not allowlisted");
        }
        /** 识别示例中拒绝的私网和环回地址。 */
        private boolean isPrivateOrLoopback(String address) {
            String value = address.toLowerCase(Locale.ROOT);
            if (value.equals("::1") || value.startsWith("0.") || value.startsWith("10.") || value.startsWith("127.") || value.startsWith("169.254.") || value.startsWith("192.168.") || value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe8") || value.startsWith("fe9") || value.startsWith("fea") || value.startsWith("feb")) return true;
            int dot = value.indexOf('.', 4);
            return value.startsWith("172.") && dot > 4 && Integer.parseInt(value.substring(4, dot)) >= 16 && Integer.parseInt(value.substring(4, dot)) <= 31;
        }
        /** 按类型、幂等性、预算和最大 attempt 决定是否重试。 */
        private boolean shouldRetry(Request request, CallPolicy policy, FailureKind cause, long remaining, int attempts) {
            return policy.isIdempotent(request.method) && remaining > 1 && attempts < policy.maxAttempts && (cause == FailureKind.HTTP_TOO_MANY_REQUESTS || cause == FailureKind.HTTP_SERVICE_UNAVAILABLE || cause == FailureKind.CONNECT_TIMEOUT || cause == FailureKind.READ_TIMEOUT);
        }
        /** 判断退避后是否仍保留一次实际发送所需的预算。 */
        private boolean advance(long wait, long remaining) { return wait + 1L < remaining; }
        /** 将响应转为有限失败类型。 */
        private FailureKind classify(Response response) { if (response.bodyTooLarge) return FailureKind.BODY_TOO_LARGE; if (response.decodeFailure) return FailureKind.DECODE_FAILURE; if (response.status >= 200 && response.status < 300) return FailureKind.NONE; if (response.status == 400) return FailureKind.HTTP_BAD_REQUEST;
            if (response.status == 429) return FailureKind.HTTP_TOO_MANY_REQUESTS; if (response.status == 503) return FailureKind.HTTP_SERVICE_UNAVAILABLE; return FailureKind.HTTP_OTHER; }
        /** 将状态码映射为事件可用的状态类。 */
        private StatusClass statusClass(int status) { if (status >= 200 && status < 300) return StatusClass.SUCCESS; if (status >= 300 && status < 400) return StatusClass.REDIRECTION; if (status >= 400 && status < 500) return StatusClass.CLIENT_ERROR; return StatusClass.SERVER_ERROR; }
        /** 判断失败是否可由已授权的 stale fallback 表达。 */
        private boolean allowsFallback(FailureKind cause) { return cause == FailureKind.HTTP_TOO_MANY_REQUESTS || cause == FailureKind.HTTP_SERVICE_UNAVAILABLE; }
        /** 原子获取一次本地 admission。 */
        private boolean acquire(int maxConcurrent) {
            while (true) { int current = inFlight.get(); if (current >= maxConcurrent) return false; if (inFlight.compareAndSet(current, current + 1)) return true; }
        }
        /** 创建当前 logical call 的逐 attempt 脱敏事件。 */
        private AttemptEvent event(Request request, Endpoint endpoint, int attempt, long remaining, StatusClass statusClass, FailureKind cause) {
            return new AttemptEvent(request, endpoint.host, attempt, remaining, statusClass, cause);
        }
        /** 创建带有 logical-call 终态和独立 attempt 快照的结果。 */
        private Result result(Request request, CallPolicy policy, Outcome outcome, int attempts, FailureKind cause, List<AttemptEvent> events) {
            LogicalCallEvent callEvent = new LogicalCallEvent(request.traceId, request.operation, request.endpointKey, policy.deadlineMillis, outcome);
            return new Result(outcome, attempts, cause, callEvent, Collections.unmodifiableList(new ArrayList<AttemptEvent>(events)));
        }
        /** 立即拒绝新调用并取消尚未完成的 transport。 */
        public void close() { close(0); }
        /** 拒绝新调用、等待给定上限并取消仍未收敛的 transport。 */
        void close(long waitMillis) {
            accepting = false;
            if (awaitInFlight(waitMillis)) return;
            shutdownRequested = true;
            transport.cancelInFlight();
            awaitInFlight(waitMillis);
        }
        /** 在有限等待内确认所有已接受调用均已结束。 */
        private boolean awaitInFlight(long waitMillis) {
            long deadlineNanos = System.nanoTime() + TimeUnit.MILLISECONDS.toNanos(waitMillis);
            while (inFlight.get() > 0 && System.nanoTime() < deadlineNanos) Thread.yield();
            return inFlight.get() == 0;
        }
    }
    /** 断言条件并在失败时中止示例。 */
    static void require(boolean condition, String message) { if (!condition) throw new IllegalStateException(message); }
    /** 返回固定 endpoint 允许的公开测试地址。 */
    static Set<String> publicAddresses() { return new HashSet<String>(Arrays.asList("203.0.113.10", "2001:db8::10")); }
    /** 返回由后端配置拥有的 endpoint key 映射。 */
    static Map<String, Endpoint> endpoints() { Map<String, Endpoint> endpoints = new HashMap<String, Endpoint>(); endpoints.put("catalog", new Endpoint("https", "api.example.test", 443, publicAddresses())); return Collections.unmodifiableMap(endpoints); }
    /** 创建本例统一使用的策略。 */
    static CallPolicy policy(AddressResolver resolver, int maxAttempts, int maxConcurrent, boolean allowFallback, boolean circuitOpen) {
        return new CallPolicy(endpoints(), resolver, new TimeoutMap(5, 10, 30), 100, maxAttempts, maxConcurrent, allowFallback, circuitOpen);
    }
    /** 断言输入在 transport 前被拒绝。 */
    static void expectRejected(Runnable action) { try { action.run(); throw new IllegalStateException("unsafe input was accepted"); } catch (IllegalArgumentException expected) { /* 预期的 SSRF 边界拒绝。 */ } }
    /** 运行正向、负向和关闭路径验证。 */
    public static void main(String[] args) {
        AddressResolver publicResolver = host -> publicAddresses();
        Request get = new Request("trace-1", "catalog.read", "catalog", Method.GET, "/items", "secret", false);
        Response busy = new Response(429, 20, false, null);
        Response success = new Response(200, 0, false, null);
        ScriptedTransport transport = new ScriptedTransport(busy, success);
        IntegrationClient client = new IntegrationClient(transport);
        CallPolicy policy = policy(publicResolver, 3, 1, false, false);
        Result result = client.call(get, policy);
        require(result.outcome == Outcome.SUCCESS && result.attempts == 2, "retry result");
        require(busy.closeCount == 1 && success.closeCount == 1, "body close count");
        require(transport.calls == result.attempts && result.events.size() == 2 && result.events.get(1).resendCount == 1, "attempt observation");
        String observations = result.events.toString();
        require(result.callEvent.traceId.equals("trace-1") && result.callEvent.operation.equals("catalog.read") && result.callEvent.endpointKey.equals("catalog") && result.callEvent.deadlineMillis == 100 && result.callEvent.finalOutcome == Outcome.SUCCESS && observations.indexOf("headers=[Authorization, Cookie]") >= 0 && observations.indexOf("Bearer secret") < 0 && observations.indexOf("session=abc") < 0, "event contract and header redaction");
        Map<String, String> unsafeHeaders = new LinkedHashMap<String, String>(); unsafeHeaders.put("Authorization", "Bearer secret"); unsafeHeaders.put("Cookie", "session=abc"); unsafeHeaders.put("X-Trace\r\nInjected", "ignored");
        Request unsafeLogRequest = new Request("trace-log", "catalog.read", "catalog", Method.GET, "/items", "secret", unsafeHeaders, false);
        Response unsafeLogResponse = new Response(200, 0, false, null); Result safeLog = new IntegrationClient(new ScriptedTransport(unsafeLogResponse)).call(unsafeLogRequest, policy);
        String safeObservations = safeLog.events.toString();
        require(safeLog.outcome == Outcome.SUCCESS && unsafeLogResponse.closeCount == 1 && safeObservations.indexOf("X-Trace__Injected") >= 0 && safeObservations.indexOf('\r') < 0 && safeObservations.indexOf('\n') < 0 && safeObservations.indexOf("Bearer secret") < 0 && safeObservations.indexOf("session=abc") < 0, "event CR/LF cleanup and value redaction");
        Response postFailure = new Response(503, 0, false, null);
        ScriptedTransport postTransport = new ScriptedTransport(postFailure); Result post = new IntegrationClient(postTransport).call(new Request("catalog", Method.POST, "/items", "secret"), policy);
        require(post.attempts == 1 && postTransport.calls == 1, "non idempotent retry");
        require(postFailure.closeCount == 1, "post body close");
        Response unavailable = new Response(503, 0, false, null); ScriptedTransport unavailableTransport = new ScriptedTransport(unavailable, new Response(200, 0, false, null));
        Result retry503 = new IntegrationClient(unavailableTransport).call(get, policy);
        require(retry503.outcome == Outcome.SUCCESS && retry503.attempts == 2 && retry503.events.get(0).cause == FailureKind.HTTP_SERVICE_UNAVAILABLE, "503 retry");
        Response badRequest = new Response(400, 0, false, null); Result bad = new IntegrationClient(new ScriptedTransport(badRequest)).call(get, policy);
        require(bad.cause == FailureKind.HTTP_BAD_REQUEST && bad.attempts == 1 && badRequest.closeCount == 1, "400 stop");
        Response connectSuccess = new Response(200, 0, false, null); ScriptedTransport connectTransport = new ScriptedTransport(new TransportFailure(FailureKind.CONNECT_TIMEOUT), connectSuccess);
        Result connect = new IntegrationClient(connectTransport).call(get, policy);
        require(connect.outcome == Outcome.SUCCESS && connect.attempts == 2 && connect.events.get(0).cause == FailureKind.CONNECT_TIMEOUT, "connect timeout retry");
        ScriptedTransport tlsTransport = new ScriptedTransport(new TransportFailure(FailureKind.TLS_FAILURE)); Result tls = new IntegrationClient(tlsTransport).call(get, policy);
        require(tls.cause == FailureKind.TLS_FAILURE && tlsTransport.calls == 1, "tls stop");
        Response overflowResponse = new Response(200, 0, true, null); Result overflow = new IntegrationClient(new ScriptedTransport(overflowResponse)).call(get, policy);
        require(overflow.cause == FailureKind.BODY_TOO_LARGE && overflowResponse.closeCount == 1, "body overflow close");
        Response decodeResponse = new Response(200, 0, false, null, false, true); Result decode = new IntegrationClient(new ScriptedTransport(decodeResponse)).call(get, policy);
        require(decode.cause == FailureKind.DECODE_FAILURE && decodeResponse.closeCount == 1, "decode failure close");
        Response slowResponse = new Response(200, 0, false, null, false, false, 100); Result timedOutAfterTransport = new IntegrationClient(new ScriptedTransport(slowResponse)).call(get, policy);
        require(timedOutAfterTransport.cause == FailureKind.DEADLINE_EXPIRED && slowResponse.closeCount == 1, "transport time is inside call deadline");
        CallPolicy expiredPolicy = new CallPolicy(endpoints(), publicResolver, new TimeoutMap(5, 10, 30), 0, 2, 1, false, false);
        require(new IntegrationClient(new ScriptedTransport()).call(get, expiredPolicy).cause == FailureKind.DEADLINE_EXPIRED, "deadline stop");
        Response cancelledResponse = new Response(200, 0, false, null, true); Result cancelled = new IntegrationClient(new ScriptedTransport(cancelledResponse)).call(get, policy);
        require(cancelled.cause == FailureKind.CANCELLED && cancelledResponse.closeCount == 1 && cancelled.attempts == 1, "cancel closes body");
        IntegrationClient isolated = new IntegrationClient(new ScriptedTransport(new Response(200, 0, false, null, false, false, 95), new Response(429, 20, false, null), new Response(200, 0, false, null)));
        Result first = isolated.call(get, policy); Result second = isolated.call(get, policy);
        require(first.events.size() == 1 && second.outcome == Outcome.SUCCESS && second.attempts == 2, "logical calls keep independent deadlines and events");
        IntegrationClient openClient = new IntegrationClient(new ScriptedTransport(success));
        Result open = openClient.call(get, policy(publicResolver, 2, 1, false, true));
        require(open.outcome == Outcome.CIRCUIT_OPEN, "circuit admission");
        openClient.close();
        require(openClient.call(get, policy).outcome == Outcome.SHUTDOWN_REJECTED, "shutdown");
        CountDownLatch transportStarted = new CountDownLatch(1); CountDownLatch transportCancelled = new CountDownLatch(1);
        Transport blockingTransport = new Transport() {
            /** 在取消信号到达前保持 transport 阻塞。 */
            public Response execute(Request request, Endpoint endpoint, URI uri, TimeoutMap timeouts, long remaining) throws TransportFailure {
                transportStarted.countDown();
                try { if (!transportCancelled.await(1, TimeUnit.SECONDS)) throw new TransportFailure(FailureKind.READ_TIMEOUT); }
                catch (InterruptedException interrupted) { Thread.currentThread().interrupt(); throw new TransportFailure(FailureKind.CANCELLED); }
                throw new TransportFailure(FailureKind.CANCELLED);
            }
            /** 收到 owner 关闭请求后解除阻塞 transport。 */
            public void cancelInFlight() { transportCancelled.countDown(); }
        };
        final IntegrationClient inFlightOwner = new IntegrationClient(blockingTransport); final Result[] inFlightResult = new Result[1];
        Thread inFlightThread = new Thread(() -> inFlightResult[0] = inFlightOwner.call(get, policy));
        inFlightThread.start();
        try { require(transportStarted.await(1, TimeUnit.SECONDS), "in-flight transport started"); inFlightOwner.close(10); inFlightThread.join(1000); }
        catch (InterruptedException interrupted) { Thread.currentThread().interrupt(); throw new IllegalStateException("shutdown verification interrupted", interrupted); }
        require(!inFlightThread.isAlive() && inFlightResult[0].cause == FailureKind.CANCELLED && inFlightOwner.inFlight.get() == 0, "shutdown cancels blocking in-flight transport");
        require(new IntegrationClient(new ScriptedTransport()).call(get,
                policy(publicResolver, 1, 0, false, false)).outcome == Outcome.ADMISSION_REJECTED,
                "atomic admission");
        expectRejected(() -> client.call(new Request("unknown", Method.GET, "/items", "secret"), policy));
        expectRejected(() -> new Endpoint("http", "api.example.test", 80, publicAddresses()));
        expectRejected(() -> client.call(get, policy(host -> Collections.singleton("127.0.0.1"), 1, 1, false, false)));
        expectRejected(() -> client.call(get, policy(host -> Collections.singleton("172.17.0.1"), 1, 1, false, false)));
        expectRejected(() -> client.call(get, policy(host -> Collections.singleton("fe80::1"), 1, 1, false, false)));
        final Response redirect = new Response(302, 0, false, "https://127.0.0.1:443/private");
        expectRejected(() -> new IntegrationClient(new ScriptedTransport(redirect)).call(get, policy));
        require(redirect.closeCount == 1, "redirect body close");
        AtomicInteger resolveCount = new AtomicInteger(); Response retry = new Response(429, 1, false, null); ScriptedTransport rebound = new ScriptedTransport(retry, new Response(200, 0, false, null));
        expectRejected(() -> new IntegrationClient(rebound).call(get, policy(host -> resolveCount.getAndIncrement() == 0 ? publicAddresses() : Collections.singleton("172.17.0.1"), 2, 1, false, false)));
        require(rebound.calls == 1 && retry.closeCount == 1, "every attempt resolves and validates");
        System.out.println("HTTP_INTEGRATION_PASS attempts=" + result.attempts + " postAttempts=" + post.attempts + " bodyClosed=" + (busy.closeCount + success.closeCount + postFailure.closeCount));
    }
}
```
## 从零跟着做
1. 先登记 HTTPS endpoint key、HTTP method、业务幂等保证、最大并发和总 deadline；不要让调用方直接传完整 URL。
2. 创建一个长期 owner，在启动期配置 client、连接池、TLS、代理、interceptor 和 observation registry。
3. 在 transport 边界返回 status、headers、body 生命周期和可分类异常；不要在这里隐藏重试。
4. 让一个 retry owner 根据幂等、瞬时失败、Retry-After 和剩余预算决定下一次 attempt。
5. 每次 attempt 重新解析并校验地址，记录脱敏事件；logical call 记录 traceId、operation、deadline 和最终 outcome。
6. 用上面的 scripted transport 编译并运行，覆盖 connect、429/503、400、TLS、body 超限、deadline、取消、SSRF 和 shutdown。
## 如何使用
在同步 Spring MVC 服务中，使用一个注入的 `RestClient` owner，并在 exchange 或 status handler 中把 response body 交给明确的 decoder。需要 non-blocking 或流式 backpressure 时选择 `WebClient`，不要在阻塞线程里仅仅调用 `block()` 就声称获得了响应式资源隔离。Apache classic 使用 response handler 可自动消费 entity 并归还连接，但 shared manager 的关闭责任仍属于创建它的组件。
调用合同建议包含：`endpointKey`、`method`、`deadline`、`maxAttempts`、backoff 上限、Retry-After 上限、并发许可、circuit 状态、fallback freshness 和 traceId。只有一层拥有 retry；底层客户端的自动重试要么关闭，要么纳入同一 policy 的 attempt 计数。
## 适用与不适用场景
适用于调用第三方 REST、内部 HTTP 服务、webhook、批处理外呼和需要连接复用的同步/异步 integration。对文件传输、消息队列、数据库连接和 WebSocket，仍需使用各自协议的资源与 deadline 合同；本课只借鉴 owner、关闭、幂等和观测思想，不把 HTTP timeout 名称直接复制过去。
## 当前项目补充
 冻结矩阵只证明项目中存在 HTTP 配置、服务适配、工具类、header interceptor 和线程池等候选位置：`RestConfig`、`AsApiService`、`HttpClientUtil`、`HeaderRequestInterceptor` 和 `ThreadPoolConfig` 均标为 `observed`。它们说明课程主题与项目调用面相关，但不能证明 timeout 完整、body 已关闭、TLS 安全或 retry 幂等。
`RestConfig`、`SftpDownloader` 和 `CxfClientUtil` 在风险能力映射中标为 `rejected`，正文不复制它们的实现，也不把冻结类名当作缺陷结论。项目补充只使用相对路径和稳定符号，所有示例均使用脱敏的 `api.example.test`。
## Java 8 / Spring Boot 2.3 兼容写法
Java 8 没有 `java.net.http` 模块，标准库写法使用 `HttpURLConnection`：分别设置 `connectTimeout` 和 `readTimeout`，在 `finally` 关闭输入/错误流，并按 owner 关闭连接。Spring 5.2 的 `RestTemplate` 仍可共享使用，但已处于 maintenance mode；旧 Apache 4.5.14 使用 `org.apache.http` 包和 `RequestConfig` 的 pool lease/connect/socket timeout。旧线不能引用 Spring 7 的 `RestClient`、Boot 4.1 的 `spring.http.clients` 或 Apache 5 `client5` 包。
## 新旧版本差异
- **标准客户端：** 现代线使用 `java.net.http.HttpClient` 与 Spring `RestClient`；旧线使用 `HttpURLConnection` 与 Spring `RestTemplate`。
- **连接与响应：** 现代线区分 `connectTimeout`、request、response/socket 与 deadline；旧线区分 connect、read、pool lease，`0` 仍表示无限。
- **连接池：** 现代 `client5` 的 lease 可取消、endpoint 可 release、manager 可关闭；旧线使用 `org.apache.http` pool lease 与 manager timeout API。
- **默认 retry：** 5.6.4 默认最多一次；4.5.14 默认 retry count 为三，且对已发送的非幂等请求更谨慎。
- **迁移边界：** Spring 7 将 RestTemplate 弃用并要求启动期完成配置；旧线仍以 maintenance mode 保留项目兼容用途。
## 易错点
:::pitfalls
### 错误：每次请求都创建 client
**现象：** 连接复用率低，executor 和 TLS 配置散落在调用点。

**触发条件：** 在 service 方法里直接创建 client。

**原因：** owner 不再拥有完整生命周期，连接池无法稳定复用。

**后果：** 连接建立开销增加，关闭和 shutdown 难以审计。

**错误示例：**
```java
return HttpClient.newHttpClient().send(request, handler);
```
**正确写法：**
```java
return sharedClient.send(request, handler);
```
**影响版本：** Java 25、Spring 7、Java 8 和 Spring 5.2。

**验证方式：** 连续调用只创建一个 owner，shutdown 后拒绝新调用。

**来源：** `java25-http-client`、`spring708-rest-client`。
### 错误：把 connect timeout 当总 timeout
**现象：** body read 仍无限等待，pool lease 也没有边界。

**触发条件：** 只设置 connect timeout。

**原因：** DNS、租借、TLS、发送和 body 读取是不同阶段。

**后果：** 工作线程和连接被长期占用，上游 deadline 被突破。

**错误示例：**
```java
HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build();
```
**正确写法：**
```java
new TimeoutMap(poolLeaseMillis, connectMillis, readMillis);
```
**影响版本：** Java 25/8；Apache 5/4 字段名称不同但边界相同。

**验证方式：** 分别注入 pool、connect、body 和 deadline 失败并断言分类。

**来源：** `java25-http-client-builder`、`httpclient564-request-config`、`aws-client-timeouts`。
### 错误：使用 0 或未设置 timeout
**现象：** 故障远端让线程、future 或连接一直 pending。

**触发条件：** Java 8 timeout 为 0，或 request 未设置 timeout。

**原因：** 0/未设置表示无限，而不是合理默认值。

**后果：** 资源耗尽，重试和 shutdown 无法收敛。

**错误示例：**
```java
connection.setReadTimeout(0);
```
**正确写法：**
```java
connection.setReadTimeout(readMillis);
```
**影响版本：** Java 8 `URLConnection` 和 Java 25 `HttpRequest.Builder`。

**验证方式：** 推进时钟到 deadline，断言没有下一次 attempt。

**来源：** `java25-http-request-builder`、`java8-url-connection`。
### 错误：不消费或关闭 response body
**现象：** 首次调用成功，稍后却出现 pool lease timeout。

**触发条件：** 4xx/5xx 或解码失败分支直接 return。

**原因：** entity 或 stream 仍持有可复用 endpoint。

**后果：** 连接无法回池，池容量逐步被占满。

**错误示例：**
```java
if (status >= 400) return failure;
```
**正确写法：**
```java
try { return decode(response); } finally { response.close(); }
```
**影响版本：** JDK、Spring、Apache 5/4。

**验证方式：** 对所有响应分支断言 `closeCount == 1`。

**来源：** `java25-http-body-handlers`、`httpclient564-closeable-client`。
### 错误：多层同时重试
**现象：** 一个故障请求产生远多于配置次数的流量。

**触发条件：** client、service 和 job 各自 retry。

**原因：** 各层次数相乘，且无法共享同一个 deadline。

**后果：** retry storm 加重依赖过载。

**错误示例：**
```text
SDK 3 次 x service 3 次 x job 3 次
```
**正确写法：**
```text
唯一 retry owner；其他层只传播失败
```
**影响版本：** 所有客户端和调度框架。

**验证方式：** 断言 transport calls 等于 logical call 的 attempts。

**来源：** `aws-limit-retries`、`httpclient564-retry-strategy`。
### 错误：无视方法语义重试 POST
**现象：** 远端已写入，客户端超时后再次创建相同资源。

**触发条件：** 对所有异常或 503 无条件 retry。

**原因：** 非幂等方法没有业务去重合同。

**后果：** 重复扣款、消息或状态变更。

**错误示例：**
```java
catch (IOException error) { retry(); }
```
**正确写法：**
```java
if (method == Method.POST) return Outcome.FAILED;
```
**影响版本：** RFC 9110 语义与所有 Java 客户端。

**验证方式：** 503 对 GET 可重试，对 POST 只产生一次调用。

**来源：** `rfc9110-idempotent-methods`。
### 错误：让 Retry-After 超过剩余 deadline
**现象：** 单次请求耗时超过上游规定。

**触发条件：** 429/503 后直接 sleep header 值。

**原因：** 服务端等待和客户端剩余预算没有比较。

**后果：** deadline 失效并制造级联超时。

**错误示例：**
```java
Thread.sleep(retryAfterMillis);
```
**正确写法：**
```java
if (retryAfterMillis >= remaining) return Outcome.FAILED;
```
**影响版本：** HTTP 429/503 和 Java 8/25。

**验证方式：** 等待大于剩余预算时断言没有第二次 attempt。

**来源：** `rfc9110-retry-after`、`rfc6585-too-many-requests`。
### 错误：只有 circuit 没有 admission
**现象：** CLOSED 状态仍耗尽本地线程和连接池。

**触发条件：** 只设置 failure threshold，没有并发上限。

**原因：** circuit 判定远端状态，不负责本地容量。

**后果：** 本地资源耗尽并放大依赖故障。

**错误示例：**
```java
return transport.execute(target);
```
**正确写法：**
```java
if (!acquire(maxConcurrent)) return Outcome.ADMISSION_REJECTED;
```
**影响版本：** 任意 Java resilience 实现。

**验证方式：** 容量为 0 时 transport calls 保持 0。

**来源：** `httpclient564-pooling-manager`、`aws-limit-retries`。
### 错误：fallback 吞异常返回空对象
**现象：** 调用方把降级数据当成新鲜成功。

**触发条件：** catch 后返回空对象或空列表。

**原因：** fallback 没有独立 outcome、freshness 和 cause。

**后果：** 数据错误静默传播，监控无法告警。

**错误示例：**
```java
return Optional.empty();
```
**正确写法：**
```java
return result(Outcome.FALLBACK_STALE, attempts, cause, events);
```
**影响版本：** 所有 service 与缓存实现。

**验证方式：** 检查 outcome、cause 和 freshness。

**来源：** 冻结项目能力 `JAVA-FRAMEWORK-022`。
### 错误：完整 URL、redirect 和证书信任过宽
**现象：** 外部输入可访问内网或转发 token。

**触发条件：** 接收完整 URL、自动 redirect 或 trust-all。

**原因：** 目标解析和 TLS 身份未经过后端 allowlist。

**后果：** SSRF、凭据泄露和中间人攻击。

**错误示例：**
```java
RestClient.create(userUrl);
```
**正确写法：**
```java
client.call(new Request("catalog", Method.GET, "/items", token), policy);
```
**影响版本：** Spring Boot 4.1、Java 25/8 和 Apache 4/5。

**验证方式：** 覆盖未知 key、loopback 和未授权 redirect。

**来源：** `owasp-ssrf-prevention`、`rfc9110-redirection`、`owasp-tls`。
### 错误：把 Authorization 和 body 写入日志
**现象：** debug 日志包含 token、Cookie、query 或个人数据。

**触发条件：** 直接打印 request、headers 或完整 URI。

**原因：** 观测字段没有脱敏和 CR/LF 清洗合同。

**后果：** 凭据泄露、日志注入和合规风险。

**错误示例：**
```java
log.debug("request={}", request);
```
**正确写法：**
```java
log.info("endpointKey={} status={}", endpointKey, statusClass);
```
**影响版本：** OWASP Logging 与 OpenTelemetry HTTP 语义。

**验证方式：** 断言事件不含 token、Cookie、query 和换行。

**来源：** `owasp-logging`、`otel-http-client-spans`。
### 错误：把现代客户端 API 复制到 Java 8 旧线
**现象：** Java 8 代码引用 `java.net.http`、`RestClient` 或 `org.apache.hc.client5`，在旧构建中失败或悄悄换成不等价默认值。

**触发条件：** 从 Java 25、Spring 7 或 HttpClient 5 示例直接粘贴到 Java 8/Spring 5.2/HttpClient 4.5.14 项目。

**原因：** 标准库模块、Spring API、Apache 包名和默认 retry 都不是同一条兼容线。

**后果：** 编译失败，或把现代 timeout、关闭与重试合同错误套用到 legacy client。

**错误示例：**
```java
java.net.http.HttpClient.newHttpClient();
```
**正确写法：**
```java
HttpURLConnection connection = (HttpURLConnection) url.openConnection();
```
**影响版本：** Java 25/Spring 7/HttpClient 5 与 Java 8/Spring 5.2/HttpClient 4.5.14。

**验证方式：** Java 25 与 Java 8 fixture 各连续编译运行两次，并分别核对包名和 timeout/关闭合同。

**来源：** `java25-http-client`、`java8-url-connection`、`spring708-rest-client`、`httpclient4514-request-config`。
:::
## 安全与性能边界
SSRF 防护必须在每个 attempt 发起 transport 前重新解析并完成检查，redirect 目标也要重新检查；TLS 使用 TLS 1.3（兼容时保留 1.2）、主机名验证和受管 trust store。secret 由 owner 注入，只在 allowlist endpoint 使用，绝不写入日志。
本课不声称某个 timeout、pool、circuit 或 retry 数值“最佳”。这些数字必须由 JFR/JMC、请求延迟分布、远端容量、并发模型和失败率共同测量；示例中的 100ms、3 次和 20ms 只为让临时 runner 可复现。
## 如何验证
1. 用 `mktemp -d /tmp/java-advanced-08-feedback.XXXXXX` 创建临时根，分别抽取 `Jdk25HttpClientSnippet`、`Java8HttpUrlConnectionSnippet` 和 `HttpIntegrationExample`。
2. Java 25 编译 JDK 25 片段和 runner，Java 8 编译旧线片段和 runner；runner 在两条线各连续运行两次，检查成功重试、POST 不重试、body 恰好关闭、circuit、admission、SSRF 和 shutdown。
3. 用负向 runner 注入 connect timeout、429/503、400、TLS failure、body overflow、decode failure、transport elapsed deadline、取消、未知 host、非 HTTPS、私网/链路本地、DNS rebinding 和阻塞 transport shutdown，确认没有额外 attempt 且取消路径关闭 body。
4. 检查 logical-call 事件含 traceId、operation、endpoint key、每次调用独立的 deadline、final outcome；每个 attempt 事件含 method、host template、resend count、status class、remaining budget、敏感 header 名和不含 header 值的脱敏字段。
5. 反馈环通过后删除明确的临时目录，并用 `test ! -e` 复核；仓库不保留 runner、fixture 或输出。
:::exercise
### 练习：为一个可重试 GET 写出调用合同

**要求：** 指定 endpoint key、scheme/host allowlist、timeout map、总 deadline、最大 attempts、Retry-After 上限、并发 admission、circuit 和 fallback freshness。再分别说明 DNS、pool lease、body read、429、证书失败的 outcome。

**验收：** 能证明退避和所有 attempt 都在同一 deadline 内；能说明 response body 在成功、失败、取消路径如何关闭；日志不含 token、完整 query 和 body。

**参考答案：** 允许 HTTPS 的固定 host，GET 最多两次 attempt；429 的等待不得超过剩余预算；证书和未知 host直接停止；每个 response 在 `finally` 关闭；fallback 单独标记 freshness 和根 cause。
:::
## 本节小结
- client、pool、executor 和 body 必须有唯一 owner 与关闭顺序。
- connect、pool lease、response/read 和 total deadline 是不同边界，不能用一个 timeout 代替。
- retry 依赖 method 幂等、失败分类、Retry-After、backoff、jitter 和剩余预算，且只能有一个 owner。
- admission、circuit 和 fallback 分别保护本地容量、远端故障和业务降级合同。
- endpoint allowlist、TLS 身份验证、secret 脱敏和逐 attempt 观测是同一集成边界的必需部分。
- Java 25/8 与 Apache 5/4 的 API 和默认值分别验证，不能跨线复制。
