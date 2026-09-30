---
id: backend.java.learn.advanced.http-clients-and-integration-resilience
type: lesson
title: HTTP 客户端配置
summary: 为共享 RestClient 配置连接池、分阶段超时、拦截器、可信 TLS 与单层有限重试
domain: backend
technology: java
module: core
stage: advanced
level: advanced
estimatedMinutes: 220
prerequisites:
  - backend.java.learn.advanced.external-http-calls
objectives:
  - 能区分连接池租借、TCP 连接和响应读取三类超时，并说明它们都不是一次逻辑调用的总时限。
  - 能为 Apache HttpClient 连接池设置总连接数与每 route 上限，避免单个远端占满全部容量。
  - 能集中创建并共享 RestClient、请求工厂和连接池，并明确底层资源的唯一关闭责任。
  - 能使用 ClientHttpRequestInterceptor 添加非敏感请求信息，并保持凭据和正文不进入普通日志。
  - 能通过 Spring Boot SSL bundle 使用受管信任材料，同时保留证书链与主机名校验。
  - 能只为幂等请求和明确的瞬时失败执行有限重试，并保证 Apache 自动重试与业务重试不会叠加。
  - 能用本地可控服务验证请求头、503 重试次数和响应读取超时，不依赖公网接口。
  - 能把现代配置改写为 Java 8、Spring Boot 2.3.12.RELEASE 与 Apache HttpClient 4.5.13 可用的实现。
recap:
  - 连接池租借、TCP 建连和响应读取发生在不同阶段，必须分别设置有限超时。
  - maxTotal 约束整个连接池，maxPerRoute 约束单个目标地址；两者共同决定并发容量。
  - RestClient 可以共享，但它使用的请求工厂、HttpClient 和连接池必须有一个明确 owner 负责关闭。
  - 拦截器适合补充请求 ID 等横切信息，不应记录 Authorization、Cookie 或完整请求与响应正文。
  - SSL bundle 集中管理可信证书材料，不能用 TrustAllStrategy 或 NoopHostnameVerifier 绕过 TLS 校验。
  - 重试只能有一个 owner，只对幂等请求和明确瞬时失败生效，并同时限制次数与等待时间。
  - 受控本地服务可以稳定复现 503、请求头和慢响应，但不等同于生产网络、代理或真实证书验收。
  - Java 8 兼容线使用 RestTemplateBuilder 与 HttpClient 4.5.13，配置目标相同但 API 不能照搬现代线。
related:
  - backend.java.learn.intermediate.http-uri-and-request-response-basics
  - backend.java.learn.intermediate.transactions-and-idempotency
tags:
  - Java
  - Spring Boot
  - HTTP 客户端
  - RestClient
  - RestTemplate
  - Apache HttpClient
  - 连接池
  - 超时
  - TLS
  - 重试
appliesTo: JDK 25 / Spring Boot 4.1.1 / Spring Framework 7.0.9 / Apache HttpClient 5.6.4 主线；Java 8 / Spring Boot 2.3.12.RELEASE / Spring Framework 5.2.15.RELEASE / Apache HttpClient 4.5.13 兼容线
verifiedAt: 2026-08-30
sources:
  - id: spring-boot-rest-client
    title: Spring Boot 4.1 Calling REST Services
    url: https://docs.spring.io/spring-boot/4.1/reference/io/rest-client.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.x
    claims:
      - Spring Boot 提供可注入的 RestClient.Builder，并支持通过请求工厂构建器统一配置底层客户端。
      - SSL bundle 可以应用到出站 HTTP 客户端。
  - id: spring-boot-http-client-settings
    title: Spring Boot 4.1 HttpClientSettings Javadoc
    url: https://docs.spring.io/spring-boot/4.1/api/java/org/springframework/boot/http/client/HttpClientSettings.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Boot 4.1.x
    claims:
      - HttpClientSettings 可以承载连接超时、读取超时与 SSL bundle。
  - id: spring-boot-http-components-builder
    title: Spring Boot 4.1 HttpComponentsClientHttpRequestFactoryBuilder Javadoc
    url: https://docs.spring.io/spring-boot/4.1/api/java/org/springframework/boot/http/client/HttpComponentsClientHttpRequestFactoryBuilder.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Boot 4.1.x
    claims:
      - 请求工厂构建器允许定制连接管理器、默认 RequestConfig 和 HttpClientBuilder。
  - id: spring-rest-client-builder
    title: Spring Framework 7.0.9 RestClient Builder Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.9/javadoc-api/org/springframework/web/client/RestClient.Builder.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.9
    claims:
      - RestClient Builder 可以接收请求工厂、base URL 与按顺序执行的请求拦截器。
  - id: spring-client-http-request-interceptor
    title: Spring Framework 7.0.9 ClientHttpRequestInterceptor Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.9/javadoc-api/org/springframework/http/client/ClientHttpRequestInterceptor.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.9
    claims:
      - 请求拦截器可以修改请求并把执行继续交给拦截器链。
      - 拦截器在抛出异常且已获得响应时必须负责关闭响应。
  - id: spring-http-components-request-factory
    title: Spring Framework 7.0.9 HttpComponentsClientHttpRequestFactory Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.9/javadoc-api/org/springframework/http/client/HttpComponentsClientHttpRequestFactory.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.9
    claims:
      - 请求工厂基于 Apache HttpComponents HttpClient，并提供销毁底层连接管理器的生命周期入口。
  - id: apache-httpclient5-request-config
    title: Apache HttpClient 5.6 RequestConfig Builder Javadoc
    url: https://hc.apache.org/httpcomponents-client-5.6.x/current/httpclient5/apidocs/org/apache/hc/client5/http/config/RequestConfig.Builder.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Apache HttpClient 5.6.x
    claims:
      - connection request timeout 限制从连接管理器租借连接的等待时间。
      - response timeout 限制等待响应的时间，但不是一次逻辑调用的总 deadline。
  - id: apache-httpclient5-pooling-manager
    title: Apache HttpClient 5.6 PoolingHttpClientConnectionManagerBuilder Javadoc
    url: https://hc.apache.org/httpcomponents-client-5.6.x/current/httpclient5/apidocs/org/apache/hc/client5/http/impl/io/PoolingHttpClientConnectionManagerBuilder.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Apache HttpClient 5.6.x
    claims:
      - 连接池支持分别设置总连接数和每 route 最大连接数。
  - id: apache-httpclient5-builder
    title: Apache HttpClient 5.6 HttpClientBuilder Javadoc
    url: https://hc.apache.org/httpcomponents-client-5.6.x/current/httpclient5/apidocs/org/apache/hc/client5/http/impl/classic/HttpClientBuilder.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Apache HttpClient 5.6.x
    claims:
      - disableAutomaticRetries 可以关闭 Apache HttpClient 的自动请求恢复与重新执行。
  - id: apache-trust-all-strategy
    title: Apache HttpClient 5.6 TrustAllStrategy Javadoc
    url: https://hc.apache.org/httpcomponents-client-5.6.x/current/httpclient5/apidocs/org/apache/hc/client5/http/ssl/TrustAllStrategy.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Apache HttpClient 5.6.x
    claims:
      - TrustAllStrategy 接受所有证书，会关闭信任校验并允许中间人攻击。
  - id: apache-noop-hostname-verifier
    title: Apache HttpClient 5.6 NoopHostnameVerifier Javadoc
    url: https://hc.apache.org/httpcomponents-client-5.6.x/current/httpclient5/apidocs/org/apache/hc/client5/http/ssl/NoopHostnameVerifier.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Apache HttpClient 5.6.x
    claims:
      - NoopHostnameVerifier 关闭 TLS 主机名验证。
  - id: rfc-9110-idempotent-methods
    title: RFC 9110 Idempotent Methods
    url: https://www.rfc-editor.org/rfc/rfc9110.html#name-idempotent-methods
    sourceOrigin: official
    sourceType: specification
    appliesTo: HTTP Semantics
    claims:
      - PUT、DELETE 与安全方法是幂等方法。
      - 客户端不应自动重试非幂等请求，除非知道该请求实际上幂等或原请求没有被应用。
  - id: rfc-9110-retry-after
    title: RFC 9110 Retry-After
    url: https://www.rfc-editor.org/rfc/rfc9110.html#name-retry-after
    sourceOrigin: official
    sourceType: specification
    appliesTo: HTTP Semantics
    claims:
      - 服务端可以用 Retry-After 指示客户端在后续请求前等待的时间。
  - id: spring-boot-legacy-rest-template-builder
    title: Spring Boot 2.3.12 RestTemplateBuilder Javadoc
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/api/org/springframework/boot/web/client/RestTemplateBuilder.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Java 8 兼容线可以通过 Supplier 提供请求工厂并配置拦截器。
  - id: spring-legacy-http-components-request-factory
    title: Spring Framework 5.2.15 HttpComponentsClientHttpRequestFactory Javadoc
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/http/client/HttpComponentsClientHttpRequestFactory.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Java 8 兼容线的请求工厂可以使用预先配置的 Apache HttpClient 4 客户端。
  - id: apache-httpclient4-request-config
    title: Apache HttpClient 4.5 RequestConfig Builder Javadoc
    url: https://hc.apache.org/httpcomponents-client-4.5.x/current/httpclient/apidocs/org/apache/http/client/config/RequestConfig.Builder.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Apache HttpClient 4.5.x
    claims:
      - HttpClient 4.5 使用毫秒整数配置连接租借、TCP 建连和 socket 读取超时。
---

# HTTP 客户端配置

上一课已经让 TeamFlow 通过 `RestClient` 发出 GET 与 POST 请求。本课不再扩展远端业务接口，而是回答一个
更靠近运行环境的问题：同一个客户端被很多请求复用时，它应该等多久、最多占用多少连接、由谁关闭、怎样
附加横切信息，以及失败后谁有权再次发送请求。

现代线使用 Spring Boot 4.1.1、Spring Framework 7.0.9 和 Apache HttpClient 5.6.4。Java 8 兼容线保留
同一配置合同，但改用 Spring Boot 2.3.12.RELEASE、`RestTemplate` 和 HttpClient 4.5.13。本课只处理同步
HTTP 客户端配置，不引入 WebClient、异步任务、熔断、服务发现或消息重投。

## 一、先把等待时间和连接容量分开

### 1. 三类超时发生在三个不同阶段

一次请求在真正读取响应前，可能先等待连接池，再建立 TCP 连接，最后等待远端响应。三类超时应分别命名：

| 配置 | 开始计时 | 超时说明 | 常见故障 |
| --- | --- | --- | --- |
| 连接池租借超时 | 请求等待可用池连接时 | 池内没有空闲连接，最多等多久 | 并发超过池容量、连接长期占用 |
| TCP 连接超时 | 开始连接目标地址时 | 新连接握手最多等多久 | 地址不可达、防火墙丢包 |
| 响应读取超时 | 请求已发出并等待响应时 | 读取响应反馈最多等多久 | 远端处理慢、连接建立后无数据 |

把三者都写成“连接超时”会误导排查。例如连接池已经满时，请求根本还没有尝试 TCP 建连；此时增加 connect
timeout 没有帮助，真正生效的是 connection request timeout。

### 2. 响应超时不是整次业务调用的总时限

Apache HttpClient 的 response timeout 约束等待响应的阶段，不会自动覆盖排队、DNS、建连、重试等待以及
第二次 attempt。因此下面配置只建立每一阶段的上限：

```java
HttpClientSettings settings = HttpClientSettings.defaults()
        .withTimeouts(Duration.ofMillis(300), Duration.ofMillis(800));
```

第一个参数是 TCP 连接超时，第二个参数是读取超时。若一次 GET 最多执行两次，逻辑调用耗时还可能包含两次
阶段等待和中间退避。本课通过小次数与短退避限制重试；需要严格端到端 deadline 时，应在更高层设计独立的
剩余时间预算，不能把 `readTimeout` 改名后假装它已经覆盖全过程。

### 3. 总连接数与每 route 上限共同生效

route 可以理解为一个目标主机及其连接路径。`maxTotal` 限制整个连接池，`maxPerRoute` 限制单个 route：

```java
var factoryBuilder = ClientHttpRequestFactoryBuilder.httpComponents()
        .withConnectionManagerCustomizer(connectionManager -> connectionManager
                .setMaxConnTotal(40)
                .setMaxConnPerRoute(10));
```

如果只设置总量为 40，却允许一个远端占用全部 40 个连接，其他远端仍可能饥饿。反过来，只设置每 route 为
10 而没有核对总量，也无法说明多个远端同时繁忙时的总体容量。数值没有通用答案，应从实例并发、远端数量、
响应时间和资源预算推导，并让租借超时在容量耗尽时尽快给出明确反馈。

## 二、让一个 owner 管理完整客户端资源

### 1. 共享的是整条客户端链

`RestClient` 构建后适合复用，但真正持有 socket 与连接池的是底层 Apache HttpClient。生产配置应一次创建
请求工厂，再把同一个工厂交给共享 `RestClient`：

```java
HttpClientSettings settings = HttpClientSettings.defaults()
        .withTimeouts(Duration.ofMillis(300), Duration.ofMillis(800));

HttpComponentsClientHttpRequestFactory requestFactory =
        ClientHttpRequestFactoryBuilder.httpComponents()
                .withConnectionManagerCustomizer(connectionManager -> connectionManager
                        .setMaxConnTotal(40)
                        .setMaxConnPerRoute(10))
                .withDefaultRequestConfigCustomizer(requestConfig -> requestConfig
                        .setConnectionRequestTimeout(Timeout.ofMilliseconds(150)))
                .withHttpClientCustomizer(httpClient -> httpClient.disableAutomaticRetries())
                .build(settings);

RestClient restClient = restClientBuilder
        .requestFactory(requestFactory)
        .baseUrl(baseUrl)
        .build();
```

业务方法只复用 `restClient`，不在每次调用中重新建池。否则连接无法跨请求复用，调用量上升时还会不断创建
socket 和清理线程，配置中的容量限制也失去统一含义。

### 2. Spring 容器可以承担关闭责任

在 Spring 应用中，请求工厂可以成为带销毁方法的 Bean。容器关闭时会调用 `destroy()`，由请求工厂关闭底层
连接管理器：

```java
/** 为合作方创建集中配置的请求工厂，并由 Spring 负责销毁。 */
@Bean(destroyMethod = "destroy")
HttpComponentsClientHttpRequestFactory partnerRequestFactory(
        PartnerHttpProperties properties) {
    HttpClientSettings settings = HttpClientSettings.defaults()
            .withTimeouts(properties.connectTimeout(), properties.readTimeout());

    return ClientHttpRequestFactoryBuilder.httpComponents()
            .withConnectionManagerCustomizer(connectionManager -> connectionManager
                    .setMaxConnTotal(properties.maxTotal())
                    .setMaxConnPerRoute(properties.maxPerRoute()))
            .withDefaultRequestConfigCustomizer(requestConfig -> requestConfig
                    .setConnectionRequestTimeout(
                            Timeout.ofMilliseconds(properties.leaseTimeout().toMillis())))
            .withHttpClientCustomizer(httpClient -> httpClient.disableAutomaticRetries())
            .build(settings);
}
```

这里的 owner 是 Spring 容器。若在普通 `main` 方法中手工创建请求工厂，owner 就必须实现 `AutoCloseable`，
并在 `close()` 中调用同一销毁入口。两种方式只能选定一个真实 owner，不能既遗漏关闭，又让多个不清楚彼此
关系的组件争抢关闭责任。

### 3. 参数应集中并在启动时检查

客户端配置应来自同一组属性，避免超时在一个类、池容量在另一个类、base URL 又散落到业务方法中。最小
配置对象可以表达以下约束：

```java
public record PartnerHttpProperties(
        URI baseUrl,
        Duration leaseTimeout,
        Duration connectTimeout,
        Duration readTimeout,
        int maxTotal,
        int maxPerRoute) {

    /** 在客户端建立前拒绝无效容量。 */
    public PartnerHttpProperties {
        if (maxTotal <= 0 || maxPerRoute <= 0 || maxPerRoute > maxTotal) {
            throw new IllegalArgumentException("连接池容量配置无效");
        }
    }
}
```

示例只检查本课真正需要的容量关系。base URL 的协议与主机白名单属于更完整的出站访问控制，不在本课扩展。

## 三、用拦截器补充非敏感横切信息

### 1. 拦截器位于请求执行链上

`ClientHttpRequestInterceptor` 能在请求交给底层客户端前修改请求头，再调用 `execution.execute` 继续执行：

```java
public final class RequestIdInterceptor implements ClientHttpRequestInterceptor {
    private final AtomicLong sequence = new AtomicLong();

    /** 为每个出站 attempt 添加可观察但不敏感的请求编号。 */
    @Override
    public ClientHttpResponse intercept(
            HttpRequest request,
            byte[] body,
            ClientHttpRequestExecution execution) throws IOException {
        request.getHeaders().set(
                "X-Request-Id",
                "partner-" + sequence.incrementAndGet());
        return execution.execute(request, body);
    }
}
```

通过 builder 添加的多个拦截器按注册顺序组成链。拦截器必须继续调用 `execution.execute`，否则请求不会发出。
若拦截器在获得响应后自行抛出异常，还必须关闭响应；上面的最小拦截器没有提前读取响应，因此直接返回即可。

### 2. 每次 attempt 都应产生独立请求编号

业务重试会再次执行完整调用链，所以第二次 attempt 会得到新的 `X-Request-Id`。这能让日志回答“逻辑调用
尝试了几次”，而不是把两个网络请求误认为同一个事件。若还需要关联逻辑调用，可以另加稳定的 correlation ID，
但不要用同一个字段同时表达逻辑调用和 attempt 两种身份。

### 3. 凭据和正文不属于普通请求日志

拦截器可以记录方法、目标服务键、耗时分类和请求编号，不应直接记录 `Authorization`、`Cookie`、API key、
完整查询参数或请求与响应正文。即使开发环境暂时方便，凭据一旦进入集中日志就会扩大读取范围和保留周期。
需要排错时应使用明确允许的字段清单，并对用户输入和凭据保持脱敏。

## 四、用 SSL bundle 保留 TLS 校验

### 1. TLS 同时校验证书链和主机名

HTTPS 可用不只意味着“握手没有抛异常”。客户端需要确认服务端证书由受信任材料签发，并确认请求主机名与
证书身份匹配。`TrustAllStrategy` 会接受所有证书，`NoopHostnameVerifier` 会跳过主机名验证；两者都会让
攻击者更容易冒充远端，因此不能作为证书问题的修复方案。

### 2. Spring Boot 统一管理信任材料

Spring Boot SSL bundle 可以把信任证书集中到配置中。例如生产环境把合作方 CA 证书放入受控资源：

```yaml
spring:
  ssl:
    bundle:
      pem:
        partner:
          truststore:
            certificate: classpath:partner-ca.pem
```

配置客户端时按 bundle 名称读取，并交给 `HttpClientSettings`：

```java
SslBundle partnerBundle = sslBundles.getBundle("partner");

HttpClientSettings settings = HttpClientSettings.defaults()
        .withTimeouts(connectTimeout, readTimeout)
        .withSslBundle(partnerBundle);
```

bundle 改变的是信任材料，不会关闭默认主机名验证。证书轮换时更新受管证书和部署配置，而不是在代码里加入
“临时”trust-all 分支。若本地可控服务使用纯 HTTP，它只能验证超时、连接池和请求链，不能证明 HTTPS 配置。

### 3. Java 8 兼容线没有 Boot SSL bundle

Spring Boot 2.3.12.RELEASE 尚没有同一套 SSL bundle API。兼容线应从受管 JKS 或 PKCS12 truststore 加载信任
材料，再使用默认主机名校验器：

```java
KeyStore trustStore = KeyStore.getInstance("PKCS12");
try (InputStream input = Files.newInputStream(trustStorePath)) {
    trustStore.load(input, trustStorePassword);
}

SSLContext sslContext = SSLContexts.custom()
        .loadTrustMaterial(trustStore, null)
        .build();

SSLConnectionSocketFactory socketFactory =
        new SSLConnectionSocketFactory(sslContext, new DefaultHostnameVerifier());
```

信任库密码来自秘密管理或部署环境，不写进源码和日志。现代与兼容线的配置入口不同，但都保留证书链与主机名
验证这一安全合同。

## 五、把有限重试交给唯一 owner

### 1. 方法幂等性先于重试次数

GET、PUT、DELETE 和安全方法在 HTTP 语义上是幂等的；重复执行同一意图应具有与执行一次相同的预期效果。
POST 默认不是幂等方法，第一次请求可能已在远端创建资源，只是响应在回程丢失。除非远端提供并验证了幂等键
合同，否则客户端不能因为超时就自动重发 POST。

幂等也不代表任何失败都值得重试。参数错误、认证失败和普通 4xx 不会因为等待后自动消失。适合有限重试的
候选应同时满足：方法允许重复、失败被明确分类为瞬时、仍有次数和时间预算。

### 2. 先关闭 Apache 自动重试

本课由业务客户端决定 GET 是否重试，因此底层 HttpClient 必须关闭自动重试：

```java
.withHttpClientCustomizer(httpClient -> httpClient.disableAutomaticRetries())
```

如果 Apache 自动重试两次，业务层又重试两次，一次逻辑调用可能产生多于预期的网络请求，日志中的 attempt
次数也不再可信。代理、SDK 或框架若还有重试能力，同样要核对并只保留一个 owner。

### 3. 明确瞬时失败并限制等待

下面的客户端只处理一个教学合同：GET `/status` 收到 `503 Service Unavailable` 时最多再试一次。其他 4xx、
5xx、POST 和未知 I/O 失败都不会自动重试：

```java
/** 查询远端状态，并只对 503 执行一次有限重试。 */
public StatusResponse getStatus() {
    for (int attempt = 1; attempt <= 2; attempt++) {
        try {
            StatusResponse response = restClient.get()
                    .uri("/status")
                    .retrieve()
                    .body(StatusResponse.class);
            if (response == null) {
                throw new IllegalStateException("远端状态响应体为空");
            }
            return response;
        } catch (HttpServerErrorException.ServiceUnavailable exception) {
            if (attempt == 2) {
                throw exception;
            }
            sleepBeforeRetry(retryDelay(exception));
        }
    }
    throw new IllegalStateException("重试循环未返回结果");
}
```

`Retry-After` 可以给出等待建议，但客户端仍需设置自身上限，不能让远端值无限占用线程或突破调用预算。完整
示例只接受秒数形式，并把等待限制在一秒内；生产系统若需要 HTTP-date 形式，应按 RFC 完整解析并继续受剩余
预算约束。

## 六、完整现代线反馈项目

### 1. 建立只包含本课依赖的工程

创建独立目录 `http-client-config-modern`，POM 使用 Spring Boot 4.1.1、JDK 25 与明确的 HttpClient 5.6.4：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>4.1.1</version>
    <relativePath />
  </parent>

  <groupId>dev.teamflow</groupId>
  <artifactId>http-client-config-modern</artifactId>
  <version>1.0.0</version>

  <properties>
    <java.version>25</java.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-http-client</artifactId>
    </dependency>
    <dependency>
      <groupId>org.apache.httpcomponents.client5</groupId>
      <artifactId>httpclient5</artifactId>
      <version>5.6.4</version>
    </dependency>
  </dependencies>
</project>
```

### 2. 实现共享客户端与资源关闭

创建 `src/main/java/dev/teamflow/client/PartnerHttpClient.java`：

```java
package dev.teamflow.client;

import java.net.URI;
import java.time.Duration;
import org.apache.hc.core5.util.Timeout;
import org.springframework.boot.http.client.ClientHttpRequestFactoryBuilder;
import org.springframework.boot.http.client.HttpClientSettings;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClient;

/** 共享远端客户端，并拥有底层请求工厂的关闭责任。 */
public final class PartnerHttpClient implements AutoCloseable {
    private final HttpComponentsClientHttpRequestFactory requestFactory;
    private final RestClient restClient;

    /** 创建带连接池、分阶段超时和单层重试的客户端。 */
    public PartnerHttpClient(URI baseUri) {
        HttpClientSettings settings = HttpClientSettings.defaults()
                .withTimeouts(Duration.ofMillis(200), Duration.ofMillis(120));

        this.requestFactory = ClientHttpRequestFactoryBuilder.httpComponents()
                .withConnectionManagerCustomizer(connectionManager -> connectionManager
                        .setMaxConnTotal(4)
                        .setMaxConnPerRoute(2))
                .withDefaultRequestConfigCustomizer(requestConfig -> requestConfig
                        .setConnectionRequestTimeout(Timeout.ofMilliseconds(100)))
                .withHttpClientCustomizer(httpClient -> httpClient.disableAutomaticRetries())
                .build(settings);

        this.restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .requestInterceptor(new RequestIdInterceptor())
                .baseUrl(baseUri.toString())
                .build();
    }

    /** 查询远端状态，并只对 503 执行一次有限重试。 */
    public StatusResponse getStatus() {
        for (int attempt = 1; attempt <= 2; attempt++) {
            try {
                StatusResponse response = restClient.get()
                        .uri("/status")
                        .retrieve()
                        .body(StatusResponse.class);
                if (response == null) {
                    throw new IllegalStateException("远端状态响应体为空");
                }
                return response;
            } catch (HttpServerErrorException.ServiceUnavailable exception) {
                if (attempt == 2) {
                    throw exception;
                }
                sleepBeforeRetry(retryDelay(exception));
            }
        }
        throw new IllegalStateException("重试循环未返回结果");
    }

    /** 调用慢端点，用于观察响应读取超时。 */
    public void callSlowEndpoint() {
        restClient.get().uri("/slow").retrieve().toBodilessEntity();
    }

    /** 读取秒数形式的 Retry-After，并把等待限制在一秒内。 */
    private Duration retryDelay(HttpServerErrorException exception) {
        String value = exception.getResponseHeaders().getFirst("Retry-After");
        if (value == null) {
            return Duration.ofMillis(50);
        }
        try {
            long seconds = Long.parseLong(value);
            return Duration.ofSeconds(Math.max(0, Math.min(seconds, 1)));
        } catch (NumberFormatException ignored) {
            return Duration.ofMillis(50);
        }
    }

    /** 等待下一次 attempt，并保留线程中断状态。 */
    private void sleepBeforeRetry(Duration delay) {
        try {
            Thread.sleep(delay.toMillis());
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("重试等待被中断", exception);
        }
    }

    /** 关闭请求工厂拥有的底层连接管理器。 */
    @Override
    public void close() throws Exception {
        requestFactory.destroy();
    }

    /** 远端状态响应。 */
    public record StatusResponse(String status) {}
}
```

### 3. 添加请求拦截器

创建 `src/main/java/dev/teamflow/client/RequestIdInterceptor.java`：

```java
package dev.teamflow.client;

import java.io.IOException;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;

/** 为每个真实网络 attempt 添加独立请求编号。 */
public final class RequestIdInterceptor implements ClientHttpRequestInterceptor {
    private final AtomicLong sequence = new AtomicLong();

    /** 添加非敏感请求头后继续执行拦截器链。 */
    @Override
    public ClientHttpResponse intercept(
            HttpRequest request,
            byte[] body,
            ClientHttpRequestExecution execution) throws IOException {
        request.getHeaders().set(
                "X-Request-Id",
                "partner-" + sequence.incrementAndGet());
        return execution.execute(request, body);
    }
}
```

### 4. 用可控本地服务制造确定反馈

创建 `src/main/java/dev/teamflow/client/ControlledPartnerServer.java`：

```java
package dev.teamflow.client;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

/** 提供确定的 503、成功响应和慢响应。 */
public final class ControlledPartnerServer implements AutoCloseable {
    private final HttpServer server;
    private final AtomicInteger statusAttempts = new AtomicInteger();
    private final List<String> statusRequestIds = new CopyOnWriteArrayList<>();
    private final AtomicBoolean slowRequestObserved = new AtomicBoolean();

    /** 创建并启动只监听本机回环地址的服务。 */
    public ControlledPartnerServer() throws IOException {
        this.server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/status", this::handleStatus);
        server.createContext("/slow", this::handleSlow);
        server.start();
    }

    /** 返回服务的动态本地地址。 */
    public URI baseUri() {
        return URI.create("http://127.0.0.1:" + server.getAddress().getPort());
    }

    /** 返回已经收到的状态请求次数。 */
    public int statusAttempts() {
        return statusAttempts.get();
    }

    /** 返回状态端点收到的请求编号。 */
    public List<String> statusRequestIds() {
        return List.copyOf(statusRequestIds);
    }

    /** 确认两次状态请求都有不同的非空编号。 */
    public boolean statusRequestIdsVerified() {
        return statusRequestIds.size() == 2
                && statusRequestIds.stream().allMatch(requestId -> !requestId.isBlank())
                && statusRequestIds.stream().distinct().count() == 2;
    }

    /** 返回慢端点是否收到请求。 */
    public boolean slowRequestObserved() {
        return slowRequestObserved.get();
    }

    /** 第一次返回 503，第二次返回 JSON 成功响应。 */
    private void handleStatus(HttpExchange exchange) throws IOException {
        recordStatusRequestId(exchange);
        if (statusAttempts.incrementAndGet() == 1) {
            exchange.getResponseHeaders().set("Retry-After", "0");
            exchange.sendResponseHeaders(503, -1);
            exchange.close();
            return;
        }
        writeJson(exchange, 200, "{\"status\":\"ready\"}");
    }

    /** 延迟响应，稳定超过客户端的读取超时。 */
    private void handleSlow(HttpExchange exchange) throws IOException {
        slowRequestObserved.set(true);
        try {
            Thread.sleep(300);
            writeJson(exchange, 200, "{\"status\":\"late\"}");
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            exchange.close();
        }
    }

    /** 保存状态请求的非空编号。 */
    private void recordStatusRequestId(HttpExchange exchange) {
        String requestId = exchange.getRequestHeaders().getFirst("X-Request-Id");
        if (requestId != null && !requestId.isBlank()) {
            statusRequestIds.add(requestId);
        }
    }

    /** 写出 JSON 响应并关闭 exchange。 */
    private void writeJson(HttpExchange exchange, int status, String json) throws IOException {
        byte[] body = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(status, body.length);
        try (var output = exchange.getResponseBody()) {
            output.write(body);
        }
    }

    /** 停止本地服务。 */
    @Override
    public void close() {
        server.stop(0);
    }
}
```

### 5. 运行并核对可观察结果

创建 `src/main/java/dev/teamflow/client/ClientConfigApplication.java`：

```java
package dev.teamflow.client;

import org.springframework.web.client.ResourceAccessException;

/** 运行 HTTP 客户端配置反馈环。 */
public final class ClientConfigApplication {

    /** 验证请求头、有限重试和响应读取超时。 */
    public static void main(String[] args) throws Exception {
        try (ControlledPartnerServer server = new ControlledPartnerServer();
                PartnerHttpClient client = new PartnerHttpClient(server.baseUri())) {
            PartnerHttpClient.StatusResponse response = client.getStatus();

            boolean readTimeoutObserved = false;
            try {
                client.callSlowEndpoint();
            } catch (ResourceAccessException exception) {
                readTimeoutObserved = server.slowRequestObserved() && isReadTimeout(exception);
            }
            if (!server.statusRequestIdsVerified() || !readTimeoutObserved) {
                throw new IllegalStateException("客户端配置反馈不符合预期");
            }

            System.out.println("status=" + response.status());
            System.out.println("attempts=" + server.statusAttempts());
            System.out.println("statusRequestIds=" + server.statusRequestIds());
            System.out.println("statusRequestIdsVerified=" + server.statusRequestIdsVerified());
            System.out.println("slowRequestObserved=" + server.slowRequestObserved());
            System.out.println("readTimeoutObserved=" + readTimeoutObserved);
        }
    }

    /** 只把因果链中确实包含 SocketTimeoutException 的异常认定为读取超时。 */
    private static boolean isReadTimeout(ResourceAccessException exception) {
        Throwable cause = exception;
        while (cause != null) {
            if (cause instanceof java.net.SocketTimeoutException) {
                return true;
            }
            cause = cause.getCause();
        }
        return false;
    }
}
```

从工程根目录执行：

```bash
mvn -q clean package
mvn -q exec:java -Dexec.mainClass=dev.teamflow.client.ClientConfigApplication
```

预期输出的关键行是：

```text
status=ready
attempts=2
statusRequestIds=[partner-1, partner-2]
statusRequestIdsVerified=true
slowRequestObserved=true
readTimeoutObserved=true
```

`attempts=2` 和两个不同的状态请求编号证明一次 503 只触发了一次业务重试，且两个 attempt 都经过拦截器；
`slowRequestObserved=true` 与异常因果链中的 `SocketTimeoutException` 共同证明 120ms 读取超时实际进入请求工厂。
这个反馈没有并发占满连接池，因此不能宣称已经验证 `maxTotal=4` 与
`maxPerRoute=2` 的运行容量；容量验收还应在部署测试中用并发可控的慢服务单独进行。

## 七、Java 8 兼容线改用 HttpClient 4

### 1. 三类超时在 RequestConfig 中使用毫秒整数

HttpClient 4.5.13 的 API 名称不同，但三阶段含义不变：

```java
RequestConfig requestConfig = RequestConfig.custom()
        .setConnectionRequestTimeout(100)
        .setConnectTimeout(200)
        .setSocketTimeout(120)
        .build();
```

`setConnectionRequestTimeout` 是池租借等待，`setConnectTimeout` 是 TCP 建连，`setSocketTimeout` 是连接建立
后的 socket 数据等待。不能把现代线的 `Timeout`、`HttpClientSettings` 或 SSL bundle API 复制到旧工程。

### 2. RestTemplateBuilder 接收共享请求工厂

创建 `http-client-config-java8`，使用以下 POM：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.3.12.RELEASE</version>
    <relativePath />
  </parent>

  <groupId>dev.teamflow</groupId>
  <artifactId>http-client-config-java8</artifactId>
  <version>1.0.0</version>

  <properties>
    <java.version>1.8</java.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org.apache.httpcomponents</groupId>
      <artifactId>httpclient</artifactId>
      <version>4.5.13</version>
    </dependency>
  </dependencies>
</project>
```

创建 `src/main/java/dev/teamflow/client/LegacyClientApplication.java`：

```java
package dev.teamflow.client;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.SocketTimeoutException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

/** 运行 Java 8 兼容线的客户端配置反馈环。 */
public final class LegacyClientApplication {

    /** 验证兼容线的共享连接池、有限重试、请求头和读取超时。 */
    public static void main(String[] args) throws Exception {
        try (ControlledServer server = new ControlledServer();
                LegacyPartnerClient client = new LegacyPartnerClient(server.baseUri())) {
            StatusResponse response = client.getStatus();

            boolean readTimeoutObserved = false;
            try {
                client.callSlowEndpoint();
            } catch (ResourceAccessException exception) {
                readTimeoutObserved = server.slowRequestObserved() && isReadTimeout(exception);
            }
            if (!server.statusRequestIdsVerified() || !readTimeoutObserved) {
                throw new IllegalStateException("客户端配置反馈不符合预期");
            }

            System.out.println("status=" + response.getStatus());
            System.out.println("attempts=" + server.statusAttempts());
            System.out.println("statusRequestIds=" + server.statusRequestIds());
            System.out.println("statusRequestIdsVerified=" + server.statusRequestIdsVerified());
            System.out.println("slowRequestObserved=" + server.slowRequestObserved());
            System.out.println("readTimeoutObserved=" + readTimeoutObserved);
        }
    }

    /** 只把因果链中确实包含 SocketTimeoutException 的异常认定为读取超时。 */
    private static boolean isReadTimeout(ResourceAccessException exception) {
        Throwable cause = exception;
        while (cause != null) {
            if (cause instanceof SocketTimeoutException) {
                return true;
            }
            cause = cause.getCause();
        }
        return false;
    }

    /** 拥有 RestTemplate、HttpClient 4 连接池和关闭责任。 */
    private static final class LegacyPartnerClient implements AutoCloseable {
        private final CloseableHttpClient httpClient;
        private final RestTemplate restTemplate;

        /** 创建 Java 8 可用的共享客户端。 */
        private LegacyPartnerClient(URI baseUri) {
            PoolingHttpClientConnectionManager manager =
                    new PoolingHttpClientConnectionManager();
            manager.setMaxTotal(4);
            manager.setDefaultMaxPerRoute(2);

            RequestConfig requestConfig = RequestConfig.custom()
                    .setConnectionRequestTimeout(100)
                    .setConnectTimeout(200)
                    .setSocketTimeout(120)
                    .build();

            this.httpClient = HttpClients.custom()
                    .setConnectionManager(manager)
                    .setDefaultRequestConfig(requestConfig)
                    .disableAutomaticRetries()
                    .build();

            final HttpComponentsClientHttpRequestFactory requestFactory =
                    new HttpComponentsClientHttpRequestFactory(httpClient);
            this.restTemplate = new RestTemplateBuilder()
                    .rootUri(baseUri.toString())
                    .requestFactory(new Supplier<ClientHttpRequestFactory>() {
                        /** 返回整个客户端生命周期内共享的请求工厂。 */
                        @Override
                        public ClientHttpRequestFactory get() {
                            return requestFactory;
                        }
                    })
                    .interceptors(new RequestIdInterceptor())
                    .build();
        }

        /** 查询远端状态，并只对 503 执行一次有限重试。 */
        private StatusResponse getStatus() {
            for (int attempt = 1; attempt <= 2; attempt++) {
                try {
                    StatusResponse response =
                            restTemplate.getForObject("/status", StatusResponse.class);
                    if (response == null) {
                        throw new IllegalStateException("远端状态响应体为空");
                    }
                    return response;
                } catch (HttpServerErrorException.ServiceUnavailable exception) {
                    if (attempt == 2) {
                        throw exception;
                    }
                }
            }
            throw new IllegalStateException("重试循环未返回结果");
        }

        /** 调用慢端点，用于观察 socket 读取超时。 */
        private void callSlowEndpoint() {
            restTemplate.getForEntity("/slow", Void.class);
        }

        /** 关闭 HttpClient 及其拥有的连接管理器。 */
        @Override
        public void close() throws IOException {
            httpClient.close();
        }
    }

    /** 为每次兼容线请求添加非敏感编号。 */
    private static final class RequestIdInterceptor
            implements ClientHttpRequestInterceptor {
        private final AtomicInteger sequence = new AtomicInteger();

        /** 添加请求头后继续执行请求。 */
        @Override
        public ClientHttpResponse intercept(
                HttpRequest request,
                byte[] body,
                ClientHttpRequestExecution execution) throws IOException {
            request.getHeaders().set(
                    "X-Request-Id",
                    "legacy-partner-" + sequence.incrementAndGet());
            return execution.execute(request, body);
        }
    }

    /** Java 8 可反序列化的远端状态对象。 */
    public static final class StatusResponse {
        private String status;

        /** 为 JSON 反序列化创建空对象。 */
        public StatusResponse() {}

        /** 返回远端状态。 */
        public String getStatus() {
            return status;
        }

        /** 写入远端状态。 */
        public void setStatus(String status) {
            this.status = status;
        }
    }

    /** 提供 Java 8 可控的本地 HTTP 服务。 */
    private static final class ControlledServer implements AutoCloseable {
        private final HttpServer server;
        private final AtomicInteger attempts = new AtomicInteger();
        private final List<String> statusRequestIds = new CopyOnWriteArrayList<>();
        private volatile boolean slowRequestObserved;

        /** 创建并启动回环服务。 */
        private ControlledServer() throws IOException {
            this.server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            server.createContext("/status", this::handleStatus);
            server.createContext("/slow", this::handleSlow);
            server.start();
        }

        /** 返回动态服务地址。 */
        private URI baseUri() {
            return URI.create("http://127.0.0.1:" + server.getAddress().getPort());
        }

        /** 返回状态端点调用次数。 */
        private int statusAttempts() {
            return attempts.get();
        }

        /** 返回状态端点收到的请求编号。 */
        private List<String> statusRequestIds() {
            return new ArrayList<>(statusRequestIds);
        }

        /** 确认两次状态请求都有不同的非空编号。 */
        private boolean statusRequestIdsVerified() {
            return statusRequestIds.size() == 2
                    && statusRequestIds.stream().allMatch(requestId -> !requestId.trim().isEmpty())
                    && statusRequestIds.stream().distinct().count() == 2;
        }

        /** 返回慢端点是否收到请求。 */
        private boolean slowRequestObserved() {
            return slowRequestObserved;
        }

        /** 第一次返回 503，第二次返回成功 JSON。 */
        private void handleStatus(HttpExchange exchange) throws IOException {
            recordStatusRequestId(exchange);
            if (attempts.incrementAndGet() == 1) {
                exchange.getResponseHeaders().set("Connection", "close");
                exchange.sendResponseHeaders(503, -1);
                exchange.close();
                return;
            }
            writeJson(exchange, "{\"status\":\"ready\"}");
        }

        /** 延迟响应以触发 socket 读取超时。 */
        private void handleSlow(HttpExchange exchange) throws IOException {
            slowRequestObserved = true;
            try {
                Thread.sleep(300);
                writeJson(exchange, "{\"status\":\"late\"}");
            } catch (InterruptedException exception) {
                Thread.currentThread().interrupt();
                exchange.close();
            }
        }

        /** 保存状态请求的非空编号。 */
        private void recordStatusRequestId(HttpExchange exchange) {
            String requestId = exchange.getRequestHeaders().getFirst("X-Request-Id");
            if (requestId != null && !requestId.trim().isEmpty()) {
                statusRequestIds.add(requestId);
            }
        }

        /** 写出成功 JSON。 */
        private void writeJson(HttpExchange exchange, String json) throws IOException {
            byte[] body = json.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, body.length);
            try {
                exchange.getResponseBody().write(body);
            } finally {
                exchange.close();
            }
        }

        /** 停止本地服务。 */
        @Override
        public void close() {
            server.stop(0);
        }
    }
}
```

使用 JDK 8 执行与现代线相同的两条 Maven 命令，预期得到 `status=ready`、`attempts=2`、
`statusRequestIds=[legacy-partner-1, legacy-partner-2]`、请求编号验证为 true、慢端点观察为 true 和读取超时为
true。这里没有使用 record、`var`、`String.isBlank()`、`HttpClientSettings` 或 RestClient，
因此不是把现代源码降低编译目标，而是对旧 API 做了真实改写。

## 八、集中处理客户端配置错误

下面五类错误会直接破坏本课建立的等待、容量、安全或重试合同。

:::pitfalls
### 用一个数值冒充所有超时

**触发条件：** 只设置 connect timeout，并把它描述成请求总超时。

**原因：** 连接池租借、TCP 建连和响应读取发生在不同阶段，connect timeout 不参与另外两个阶段。

**后果：** 池耗尽或远端连接后不返回数据时，请求仍可能长时间等待，日志也会把故障分类错误。

**错误示例：**

```java
HttpClientSettings settings = HttpClientSettings.defaults()
        .withConnectTimeout(Duration.ofSeconds(5));
```

**正确写法：**

```java
HttpClientSettings settings = HttpClientSettings.defaults()
        .withTimeouts(Duration.ofMillis(300), Duration.ofMillis(800));

var factoryBuilder = ClientHttpRequestFactoryBuilder.httpComponents()
        .withDefaultRequestConfigCustomizer(requestConfig -> requestConfig
                .setConnectionRequestTimeout(Timeout.ofMilliseconds(150)));
```

**验证方式：** 分别让池无空闲连接、目标地址不可达和本地服务延迟响应，确认三种场景由对应阶段的有限超时结束。

### 每次业务调用都创建新的连接池

**触发条件：** 在 `findProject` 等单次业务方法中创建请求工厂和 RestClient。

**原因：** 客户端链没有长期 owner，连接不能跨业务调用复用。

**后果：** 连接数量与清理时机失控，池容量配置只约束一次调用创建的临时对象。

**错误示例：**

```java
public Project findProject(long id) {
    RestClient client = RestClient.builder().baseUrl(baseUrl).build();
    return client.get().uri("/projects/{id}", id).retrieve().body(Project.class);
}
```

**正确写法：**

```java
public final class PartnerProjectClient {
    private final RestClient client;

    /** 注入由应用共享并统一关闭的客户端。 */
    public PartnerProjectClient(RestClient client) {
        this.client = client;
    }
}
```

**验证方式：** 连续执行多次业务调用，确认它们使用同一个注入实例，并在应用关闭时只由请求工厂 owner 执行一次销毁。

### 用 trust-all 修复证书失败

**触发条件：** 遇到未知 CA 或主机名不匹配后，改用 TrustAllStrategy 与 NoopHostnameVerifier。

**原因：** 代码绕过了服务身份验证，而不是补充正确的信任材料或修复访问主机名。

**后果：** 任意证书都可能被接受，客户端无法确认连接的确是目标服务。

**错误示例：**

```java
SSLContext context = SSLContexts.custom()
        .loadTrustMaterial(TrustAllStrategy.INSTANCE)
        .build();
NoopHostnameVerifier verifier = NoopHostnameVerifier.INSTANCE;
```

**正确写法：**

```java
SslBundle bundle = sslBundles.getBundle("partner");
HttpClientSettings settings = HttpClientSettings.defaults()
        .withSslBundle(bundle);
```

**验证方式：** 使用受信任测试证书与错误主机名分别连接；前者成功，后者仍应因主机名校验失败而被拒绝。

### 让底层和业务层同时重试

**触发条件：** 业务代码已有 attempt 循环，却保留 Apache 自动重试，或无条件重发 POST。

**原因：** 重试 owner 不唯一，并且没有先检查方法幂等性与失败分类。

**后果：** 网络请求次数超过配置，POST 还可能重复创建资源或重复产生副作用。

**错误示例：**

```java
for (int attempt = 0; attempt < 3; attempt++) {
    restClient.post().uri("/projects").body(command).retrieve().toBodilessEntity();
}
```

**正确写法：**

```java
var factoryBuilder = ClientHttpRequestFactoryBuilder.httpComponents()
        .withHttpClientCustomizer(httpClient -> httpClient.disableAutomaticRetries());

// 业务层只为明确允许重复的 GET 与明确的 503 执行一次重试。
```

**验证方式：** 让受控服务先返回一次 503；GET 总请求数应为 2，POST 在没有幂等键合同时总请求数应为 1。

### 在拦截器中记录凭据和完整正文

**触发条件：** 为排错直接输出全部请求头、请求体与响应体。

**原因：** 横切日志没有字段允许列表，也没有区分诊断信息与秘密数据。

**后果：** Authorization、Cookie、API key 或用户数据进入更广泛、更长期的日志存储。

**错误示例：**

```java
logger.info("headers={}, body={}", request.getHeaders(), new String(body));
```

**正确写法：**

```java
logger.info(
        "outbound method={}, service={}, requestId={}",
        request.getMethod(),
        "partner-projects",
        request.getHeaders().getFirst("X-Request-Id"));
```

**验证方式：** 使用测试凭据发出请求并检查日志，日志应包含方法、服务键和请求编号，且不包含凭据值与正文内容。
:::

## 九、练习：确定哪些失败可以重试

:::exercise
### 实现唯一重试 owner 的判定函数

**要求：** 编写一个可运行程序，只允许 GET 在第一次收到 503 时重试；POST、400 和已经执行到第二次的 503 都必须停止。判定函数不能执行网络请求，只负责给业务重试 owner 一个明确结果。

**验收：** 程序依次输出 `GET 503 attempt1=true`、`GET 503 attempt2=false`、`POST 503 attempt1=false` 和 `GET 400 attempt1=false`。
:::

参考实现使用普通 Java 语法，在 JDK 25 与 Java 8 都可以直接运行：

```java
public final class RetryDecisionExercise {

    /** 运行四组重试边界检查。 */
    public static void main(String[] args) {
        print("GET", 503, 1);
        print("GET", 503, 2);
        print("POST", 503, 1);
        print("GET", 400, 1);
    }

    /** 输出一组方法、状态与 attempt 的判定结果。 */
    private static void print(String method, int status, int attempt) {
        System.out.println(
                method + " " + status + " attempt" + attempt + "="
                        + shouldRetry(method, status, attempt));
    }

    /** 只允许第一次幂等 GET 遇到 503 后再次尝试。 */
    private static boolean shouldRetry(String method, int status, int attempt) {
        return "GET".equals(method) && status == 503 && attempt == 1;
    }
}
```

保存为 `RetryDecisionExercise.java` 后执行：

```bash
javac RetryDecisionExercise.java
java RetryDecisionExercise
```

预期输出为：

```text
GET 503 attempt1=true
GET 503 attempt2=false
POST 503 attempt1=false
GET 400 attempt1=false
```

判定函数故意保持窄范围。未来若远端为 POST 提供幂等键、或增加其他可重试状态，必须先扩展外部合同和验收，
不能仅因为“偶尔会失败”就把条件改成所有 5xx 或所有方法。
