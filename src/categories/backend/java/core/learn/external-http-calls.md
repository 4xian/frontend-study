---
id: backend.java.learn.advanced.external-http-calls
type: lesson
title: 外部 HTTP 调用
summary: 使用 RestClient 调用外部 JSON API，正确构造 GET 与 POST 请求、映射响应并区分错误状态
domain: backend
technology: java
module: core
stage: advanced
level: advanced
estimatedMinutes: 180
prerequisites:
  - backend.java.learn.intermediate.testing-and-delivery-check
objectives:
  - 能说明出站 HTTP 调用与本应用入站 Controller 的数据流和失败边界。
  - 能使用 RestClient 构造带路径变量、查询参数、Accept 和 Content-Type 的请求。
  - 能把 Java 请求对象序列化为 JSON，并把成功响应反序列化为明确的数据对象。
  - 能区分正常响应、404、其他 4xx 或 5xx，以及成功状态下的空响应体。
  - 能使用 MockRestServiceServer 验证真实发出的请求，而不依赖公网测试服务。
  - 能在 JDK 25 主线使用 RestClient，并在 Java 8 兼容线改用 RestTemplate 保持同一调用合同。
  - 能识别手工拼接 URI、吞掉错误状态和每次请求重建客户端等常见问题。
recap:
  - 外部 HTTP 调用是一次跨进程合同执行，调用方必须同时处理请求构造、响应转换和远端失败。
  - RestClient 使用方法、URI、请求头、请求体、retrieve 和响应提取组成一条同步调用链。
  - 路径变量和查询参数应交给 URI 模板或 UriBuilder 编码，不能把外部输入直接拼进 URL。
  - 默认错误处理会拒绝 4xx 与 5xx；404 只有在业务合同明确时才能转换为独立的未找到结果。
  - 成功状态不保证一定有响应体，调用方仍需验证返回对象是否存在。
  - MockRestServiceServer 能验证客户端发出的请求与处理的响应，但不能替代真实网络和超时验证。
  - Java 8 兼容线使用 RestTemplate 和普通 DTO，保持相同 URL、JSON 与错误语义。
related:
  - backend.java.learn.intermediate.http-uri-and-request-response-basics
  - backend.java.learn.intermediate.json-and-data-contracts
  - backend.java.learn.intermediate.integration-testing-with-spring-boot
tags:
  - Java
  - Spring Boot
  - HTTP 客户端
  - RestClient
  - RestTemplate
  - JSON
  - MockRestServiceServer
appliesTo: JDK 25 / Spring Boot 4.1.1 / Spring Framework 7.0.9 主线；Java 8 / Spring Boot 2.3.12.RELEASE / Spring Framework 5.2.15.RELEASE 兼容线
verifiedAt: 2026-08-30
sources:
  - id: spring-rest-clients
    title: Spring Framework REST Clients
    url: https://docs.spring.io/spring-framework/reference/integration/rest-clients.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.x
    claims:
      - RestClient 是使用 fluent API 的同步 HTTP 客户端。
      - 请求体和响应体通过 HTTP 消息转换器在 Java 对象与 HTTP 内容之间转换。
      - retrieve 默认把 4xx 与 5xx 响应转换为 RestClientException 子类。
      - 构建完成的 RestClient 可以安全地被多个线程复用。
  - id: spring-rest-client-javadoc
    title: Spring Framework 7.0.9 RestClient Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.9/javadoc-api/org/springframework/web/client/RestClient.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.9
    claims:
      - RestClient 提供 GET、POST、URI、请求头、请求体和响应提取 API。
  - id: spring-rest-client-response-spec
    title: Spring Framework 7.0.9 RestClient ResponseSpec Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.9/javadoc-api/org/springframework/web/client/RestClient.ResponseSpec.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.9
    claims:
      - body 在没有响应体时可以返回 null。
      - onStatus 可以为指定状态注册错误处理，未匹配的错误状态仍使用默认处理。
  - id: spring-mock-rest-service-server
    title: Spring Framework 7.0.9 MockRestServiceServer Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.9/javadoc-api/org/springframework/test/web/client/MockRestServiceServer.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.9
    claims:
      - MockRestServiceServer 可以绑定 RestClient Builder 并验证请求方法、URI、内容和伪响应。
  - id: spring-rest-template-javadoc
    title: Spring Framework 5.2.15 RestTemplate Javadoc
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/client/RestTemplate.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - RestTemplate 是 Java 8 兼容线可用的同步模板客户端。
      - exchange 可以同时表达方法、请求实体、URI 变量和响应类型。
  - id: spring-default-response-error-handler
    title: Spring Framework 5.2.15 DefaultResponseErrorHandler Javadoc
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/client/DefaultResponseErrorHandler.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - RestTemplate 默认把 4xx 和 5xx 识别为错误并抛出对应异常。
  - id: spring-mock-rest-service-server-legacy
    title: Spring Framework 5.2.15 MockRestServiceServer Javadoc
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/test/web/client/MockRestServiceServer.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Java 8 兼容线可以把 MockRestServiceServer 绑定到 RestTemplate 并执行同类请求验证。
  - id: rfc-9110-status-codes
    title: RFC 9110 HTTP Semantics - Status Codes
    url: https://www.rfc-editor.org/rfc/rfc9110.html#name-status-codes
    sourceOrigin: official
    sourceType: specification
    appliesTo: HTTP Semantics
    claims:
      - HTTP 状态码按信息、成功、重定向、客户端错误和服务器错误分类。
      - 调用方必须根据方法和应用合同解释具体状态，不能只依赖响应体猜测结果。
---

# 外部 HTTP 调用

前面的课程一直站在服务器一侧：浏览器或其他客户端把请求发给 TeamFlow，Controller 读取请求并返回响应。
真实后端也经常成为调用方，例如向项目目录查询外部项目、向通知平台创建订阅，或向支付平台确认交易。
这时应用发出的请求叫作出站请求，远端返回的状态、响应头和响应体都不再由本应用控制。

本课先建立一条可验证的同步调用链。现代线使用 Spring Framework 7 的 `RestClient`，Java 8 兼容线使用
Spring Framework 5.2 的 `RestTemplate`。base URL 外部化、连接与读取超时、连接池、拦截器、重试和 SSL
属于下一课“HTTP 客户端配置”，这里不会提前展开。

## 一、把外部调用看成一份跨进程合同

### 1. 入站与出站请求方向相反

TeamFlow 接收请求时，本应用控制 Controller 和响应合同；调用外部项目目录时，本应用只控制请求，远端
什么时候返回、返回什么状态以及 JSON 是否完整，都必须通过客户端反馈判断：

```text
浏览器 -> TeamFlow Controller -> PartnerProjectClient -> 外部项目目录
                                                |
浏览器 <- TeamFlow 错误合同  <- 调用结果或异常 <-+
```

`PartnerProjectClient` 是外部合同的本地边界。业务 Service 不应散落 URL、请求头和状态判断，而是调用这个
边界提供的 Java 方法。这样远端的 HTTP 细节不会蔓延到每个业务方法。

### 2. 一次调用同时包含请求和响应合同

假设外部项目目录提供两个端点：

| 动作 | 请求 | 成功响应 | 本课本地结果 |
| --- | --- | --- | --- |
| 查询项目 | `GET /projects/{id}` | `200` 与项目 JSON | `PartnerProject` |
| 创建项目 | `POST /projects` 与名称 JSON | `201` 与项目 JSON | `PartnerProject` |

调用方至少要明确方法、URI、请求头、请求体、成功状态、响应类型和失败状态。只知道“地址返回 JSON”不够，
因为同一个 URI 上的方法不同，含义可能完全不同；同一个 JSON 在 `200` 和 `404` 下也不能解释成同一结果。

### 3. 本课只处理调用，不处理客户端配置

为了观察请求本身，示例直接从给定 base URL 构建客户端。生产应用通常还要统一配置超时、请求工厂、
连接池、拦截器和观测信息，这些内容会在下一课完成。本课先冻结三个边界：

- 业务代码只依赖 `PartnerProjectClient`，不直接操作 URL。
- 客户端对象由外部创建后注入，单次业务方法不重复创建。
- 每个方法明确成功结果、未找到结果和远端失败结果。

## 二、用 RestClient 发出 GET 请求

### 1. 方法和 URI 从调用链起点开始

现代线先创建一个指向外部服务的同步客户端。`baseUrl` 只提供共同前缀，路径仍写在具体调用方法中。
查询编号为 `42` 的项目时使用 URI 模板：

```java
PartnerProject response = client.get()
        .uri("/projects/{id}", 42)
        .accept(MediaType.APPLICATION_JSON)
        .retrieve()
        .body(PartnerProject.class);
```

这条链从左到右依次表达：使用 GET、展开路径变量、声明希望接收 JSON、执行请求并按
`PartnerProject` 类型读取响应体。`{id}` 由 URI 模板展开，不需要手工拼接斜杠和数字。

### 2. 查询参数交给 UriBuilder 编码

路径变量定位一个资源，查询参数通常筛选资源。状态来自方法参数时，应把原始值传给 URI builder 的
`queryParam`，完整写法会在本课练习中实现。URI builder 会按 URI 规则处理空格等字符；直接写
`"/projects?status=" + status` 会把编码责任推给调用者，还容易在加入第二个参数时漏掉 `&` 或重复 `?`。

### 3. body 负责把 JSON 转成明确类型

`body(PartnerProject.class)` 不是强制类型转换。`RestClient` 根据响应的 `Content-Type` 选择消息转换器，
读取字节并把 JSON 字段映射到 Java 对象。现代线可以使用 record 表达只承载数据的响应，完整类型会在
后面的项目中创建。远端新增一个本地不关心的 JSON 字段时，Jackson 默认可以忽略它；但字段类型不兼容、
JSON 语法错误或必要
构造数据无法生成时，转换仍会失败。HTTP `200` 只说明服务器认为请求成功，不保证响应体符合本地数据合同。

## 三、用 POST 发送 JSON 请求体

### 1. 请求对象与远端 JSON 对齐

创建项目只需要名称，不应把本地完整项目对象全部发送给远端。调用链使用专门的
`CreateProjectRequest`，并同时声明请求和响应的媒体类型：

```java
PartnerProject created = client.post()
        .uri("/projects")
        .contentType(MediaType.APPLICATION_JSON)
        .accept(MediaType.APPLICATION_JSON)
        .body(new CreateProjectRequest("发布课程"))
        .retrieve()
        .body(PartnerProject.class);
```

`Content-Type` 描述发送出去的请求体，`Accept` 描述调用方希望收到的响应格式。两者都写 JSON 并不表示可以
互换；一个属于请求实体，一个参与响应内容协商。

### 2. 成功状态也可能没有响应体

`body` 在没有响应体时可以返回 `null`。如果当前方法承诺一定返回项目对象，就要在边界处抛出明确异常；
完整项目中的 `requireBody` 会实现这个检查。不要把空响应体替换成字段全为空的对象。那会让后续代码误以为
远端真的返回了一个项目，并把故障拖到更远的
数据库写入或页面渲染阶段。

## 四、按状态处理远端失败

### 1. 默认错误处理已经拒绝 4xx 与 5xx

`retrieve()` 默认把 `4xx` 与 `5xx` 响应转换为 `RestClientException` 子类，不会在 `404` 时正常返回一个
`PartnerProject`。默认行为比“忽略状态后尝试解析任意响应体”更安全。错误响应的 JSON 往往是错误码和消息，不是项目对象；
强行按成功类型解析只会掩盖真正的 HTTP 失败。

### 2. 只有明确的业务分支才定制 onStatus

如果外部合同明确规定 `404` 表示“项目编号不存在”，本地客户端可以把它转换为专用异常，同时让其他错误
保持远端服务失败：

```java
PartnerProject result = client.get()
        .uri("/projects/{id}", projectId)
        .retrieve()
        .onStatus(
                status -> status.value() == 404,
                (request, response) -> {
                    throw new PartnerProjectNotFoundException(projectId);
                })
        .onStatus(
                HttpStatusCode::isError,
                (request, response) -> {
                    throw new PartnerServiceException(
                            "外部项目目录返回 " + response.getStatusCode().value());
                })
        .body(PartnerProject.class);
```

处理器顺序从具体到一般：先匹配 `404`，再匹配剩余错误状态。业务 Service 可以分别决定“项目不存在”如何
反馈给调用者，以及“外部服务故障”是否转换为 `502 Bad Gateway`；客户端不重新定义 TeamFlow 的统一响应结构。

### 3. 网络失败与 HTTP 错误不是同一反馈

收到 `503` 表示已经建立连接并得到 HTTP 响应；DNS 失败、连接失败或读取中断则可能根本没有状态码。
本课用 `PartnerServiceException` 统一收口远端调用失败，但日志和后续配置仍要保留原始 cause，不能伪造一个
并不存在的 HTTP 状态。具体超时分类和观测字段留到下一课。

## 五、用伪服务验证真正发出的请求

### 1. MockRestServiceServer 绑定客户端构建器

单元测试若只 mock `PartnerProjectClient`，只能证明业务代码调用了一个 Java 方法，不能证明客户端发出了正确
HTTP 请求。`MockRestServiceServer` 会绑定 `RestClient.Builder` 并接管底层请求，在进程内核对 URI、方法、
请求头和请求体。客户端必须从绑定后的同一个 builder 构建；若先 `build()`，再把另一个 builder 交给测试服务器，测试观察的
就不是生产代码实际使用的请求通道。

### 2. 期望同时覆盖请求与响应

完整项目的反馈会同时断言 GET 请求并提供可反序列化的 JSON 响应。如果路径、方法或请求头不一致，测试会在调用处失败；如果 JSON 无法映射，客户端会在读取响应体时失败；如果
预期请求根本没有发生，`verify()` 会失败。这比只断言最后返回值多覆盖了一层外部合同。

### 3. 伪服务不证明真实网络配置

这个测试不会建立真实 TCP 连接，也不会证明 DNS、代理、证书、连接池和超时配置正确。它适合验证请求合同和
响应分支；真实网络配置仍需在下一课用受控服务进行集成验证。测试工具的能力边界也必须写清，避免把进程内
通过误报为部署环境已经可用。

## 六、完整现代线项目

### 1. 建立只包含客户端边界的工程

创建独立目录 `external-http-modern`。POM 使用 Spring Boot 4.1.1 与 JDK 25，测试依赖提供
`MockRestServiceServer`、JUnit 和 JSON 请求匹配器：

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
  <artifactId>external-http-modern</artifactId>
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
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
    </dependency>
  </dependencies>
</project>
```

### 2. 实现查询、创建和状态分支

创建 `src/main/java/dev/teamflow/integration/PartnerProjectClient.java`：

```java
package dev.teamflow.integration;

import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/** 调用外部项目目录，并把 HTTP 反馈转换为本地结果。 */
public final class PartnerProjectClient {
    private final RestClient client;

    /** 使用已经确定的服务地址构建客户端。 */
    public PartnerProjectClient(RestClient.Builder builder, String baseUrl) {
        this.client = builder.baseUrl(baseUrl).build();
    }

    /** 按外部项目编号查询项目。 */
    public PartnerProject findProject(long projectId) {
        try {
            PartnerProject project = client.get()
                    .uri("/projects/{id}", projectId)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .onStatus(
                            status -> status.value() == 404,
                            (request, response) -> {
                                throw new PartnerProjectNotFoundException(projectId);
                            })
                    .onStatus(
                            HttpStatusCode::isError,
                            (request, response) -> {
                                throw new PartnerServiceException(
                                        "外部项目目录返回 " + response.getStatusCode().value());
                            })
                    .body(PartnerProject.class);
            return requireBody(project);
        } catch (PartnerProjectNotFoundException | PartnerServiceException exception) {
            throw exception;
        } catch (RestClientException exception) {
            throw new PartnerServiceException("外部项目目录调用失败", exception);
        }
    }

    /** 创建外部项目并返回远端生成的数据。 */
    public PartnerProject createProject(String name) {
        try {
            PartnerProject project = client.post()
                    .uri("/projects")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(new CreateProjectRequest(name))
                    .retrieve()
                    .onStatus(
                            HttpStatusCode::isError,
                            (request, response) -> {
                                throw new PartnerServiceException(
                                        "外部项目目录返回 " + response.getStatusCode().value());
                            })
                    .body(PartnerProject.class);
            return requireBody(project);
        } catch (PartnerServiceException exception) {
            throw exception;
        } catch (RestClientException exception) {
            throw new PartnerServiceException("外部项目目录调用失败", exception);
        }
    }

    /** 拒绝成功状态下缺少业务响应体的结果。 */
    private PartnerProject requireBody(PartnerProject project) {
        if (project == null) {
            throw new PartnerServiceException("外部项目目录没有返回项目数据");
        }
        return project;
    }

    /** 外部项目响应。 */
    public record PartnerProject(long id, String name, String status) {
    }

    /** 创建外部项目时发送的最小请求。 */
    public record CreateProjectRequest(String name) {
    }

    /** 表示外部项目不存在。 */
    public static final class PartnerProjectNotFoundException extends RuntimeException {
        /** 记录未找到的外部项目编号。 */
        public PartnerProjectNotFoundException(long projectId) {
            super("外部项目不存在：" + projectId);
        }
    }

    /** 表示外部服务未完成约定的调用。 */
    public static final class PartnerServiceException extends RuntimeException {
        /** 使用明确消息创建异常。 */
        public PartnerServiceException(String message) {
            super(message);
        }

        /** 保留底层客户端失败作为原因。 */
        public PartnerServiceException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
```

### 3. 从请求到错误分支完成反馈

创建 `src/test/java/dev/teamflow/integration/PartnerProjectClientTest.java`：

```java
package dev.teamflow.integration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withNoContent;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

/** 验证外部项目客户端的请求与响应合同。 */
class PartnerProjectClientTest {
    private MockRestServiceServer server;
    private PartnerProjectClient client;

    /** 为每个测试创建独立的请求记录器。 */
    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        client = new PartnerProjectClient(builder, "https://partner.test");
    }

    /** GET 请求应展开路径变量并读取 JSON。 */
    @Test
    void findsProject() {
        server.expect(requestTo("https://partner.test/projects/42"))
                .andExpect(method(HttpMethod.GET))
                .andExpect(header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE))
                .andRespond(withSuccess(
                        "{\"id\":42,\"name\":\"课程平台\",\"status\":\"ACTIVE\"}",
                        MediaType.APPLICATION_JSON));

        PartnerProjectClient.PartnerProject project = client.findProject(42);

        assertEquals(42, project.id());
        assertEquals("课程平台", project.name());
        server.verify();
    }

    /** POST 请求应发送最小 JSON 并读取创建结果。 */
    @Test
    void createsProject() {
        server.expect(requestTo("https://partner.test/projects"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE))
                .andExpect(content().json("{\"name\":\"发布课程\"}"))
                .andRespond(withStatus(HttpStatus.CREATED)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"id\":43,\"name\":\"发布课程\",\"status\":\"NEW\"}"));

        PartnerProjectClient.PartnerProject project = client.createProject("发布课程");

        assertEquals(43, project.id());
        assertEquals("NEW", project.status());
        server.verify();
    }

    /** 404 应转换为专用的未找到异常。 */
    @Test
    void reportsMissingProject() {
        server.expect(requestTo("https://partner.test/projects/99"))
                .andRespond(withStatus(HttpStatus.NOT_FOUND));

        assertThrows(
                PartnerProjectClient.PartnerProjectNotFoundException.class,
                () -> client.findProject(99));
        server.verify();
    }

    /** 成功状态没有响应体时不应制造空项目。 */
    @Test
    void rejectsEmptySuccessBody() {
        server.expect(requestTo("https://partner.test/projects/42"))
                .andRespond(withNoContent());

        PartnerProjectClient.PartnerServiceException exception = assertThrows(
                PartnerProjectClient.PartnerServiceException.class,
                () -> client.findProject(42));

        assertEquals("外部项目目录没有返回项目数据", exception.getMessage());
        server.verify();
    }
}
```

在工程根目录执行：

```bash
mvn clean test
```

关键反馈应为：

```text
Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

四个测试分别证明 GET 合同、POST 合同、`404` 分支和空响应体分支。它们共享同一客户端实现，但每个测试
都创建新的伪服务，避免请求期望在测试之间泄漏。

## 七、Java 8 兼容线使用 RestTemplate

### 1. 客户端链和数据类型需要真实改写

Spring Boot 2.3.12 的 Spring Framework 5.2 没有 `RestClient`。兼容线使用 `RestTemplate.exchange` 表达
请求方法、请求头、URI 变量和响应类型；record 也要换成带无参构造器与访问方法的普通类。URL、JSON 字段和
错误语义保持不变，不能只改 Maven 的 Java 版本。

创建独立目录 `external-http-legacy`，使用下面的 POM：

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
  <artifactId>external-http-legacy</artifactId>
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
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
    </dependency>
  </dependencies>
</project>
```

### 2. 用 exchange 保留同一请求合同

创建 `src/main/java/dev/teamflow/integration/PartnerProjectClient.java`：

```java
package dev.teamflow.integration;

import java.util.Collections;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

/** 使用 Java 8 可用的 RestTemplate 调用外部项目目录。 */
public final class PartnerProjectClient {
    private final RestTemplate restTemplate;
    private final String baseUrl;

    /** 保存可复用客户端与服务地址。 */
    public PartnerProjectClient(RestTemplate restTemplate, String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
    }

    /** 按外部项目编号查询项目。 */
    public PartnerProject findProject(long projectId) {
        try {
            ResponseEntity<PartnerProject> response = restTemplate.exchange(
                    baseUrl + "/projects/{id}",
                    HttpMethod.GET,
                    new HttpEntity<Void>(acceptJsonHeaders()),
                    PartnerProject.class,
                    projectId);
            return requireBody(response.getBody());
        } catch (RestClientResponseException exception) {
            if (exception.getRawStatusCode() == 404) {
                throw new PartnerProjectNotFoundException(projectId);
            }
            throw new PartnerServiceException(
                    "外部项目目录返回 " + exception.getRawStatusCode(), exception);
        } catch (RestClientException exception) {
            throw new PartnerServiceException("外部项目目录调用失败", exception);
        }
    }

    /** 创建外部项目并返回远端生成的数据。 */
    public PartnerProject createProject(String name) {
        try {
            HttpEntity<CreateProjectRequest> request = new HttpEntity<CreateProjectRequest>(
                    new CreateProjectRequest(name), jsonRequestHeaders());
            ResponseEntity<PartnerProject> response = restTemplate.exchange(
                    baseUrl + "/projects",
                    HttpMethod.POST,
                    request,
                    PartnerProject.class);
            return requireBody(response.getBody());
        } catch (RestClientResponseException exception) {
            throw new PartnerServiceException(
                    "外部项目目录返回 " + exception.getRawStatusCode(), exception);
        } catch (RestClientException exception) {
            throw new PartnerServiceException("外部项目目录调用失败", exception);
        }
    }

    /** 创建声明接收 JSON 所需的请求头。 */
    private HttpHeaders acceptJsonHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        return headers;
    }

    /** 创建发送和接收 JSON 所需的请求头。 */
    private HttpHeaders jsonRequestHeaders() {
        HttpHeaders headers = acceptJsonHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    /** 拒绝成功状态下缺少业务响应体的结果。 */
    private PartnerProject requireBody(PartnerProject project) {
        if (project == null) {
            throw new PartnerServiceException("外部项目目录没有返回项目数据");
        }
        return project;
    }

    /** 外部项目响应。 */
    public static final class PartnerProject {
        private long id;
        private String name;
        private String status;

        /** 供 JSON 转换器创建对象。 */
        public PartnerProject() {
        }

        /** 返回外部项目编号。 */
        public long getId() {
            return id;
        }

        /** 设置外部项目编号。 */
        public void setId(long id) {
            this.id = id;
        }

        /** 返回外部项目名称。 */
        public String getName() {
            return name;
        }

        /** 设置外部项目名称。 */
        public void setName(String name) {
            this.name = name;
        }

        /** 返回外部项目状态。 */
        public String getStatus() {
            return status;
        }

        /** 设置外部项目状态。 */
        public void setStatus(String status) {
            this.status = status;
        }
    }

    /** 创建外部项目时发送的最小请求。 */
    public static final class CreateProjectRequest {
        private final String name;

        /** 保存需要创建的项目名称。 */
        public CreateProjectRequest(String name) {
            this.name = name;
        }

        /** 返回需要创建的项目名称。 */
        public String getName() {
            return name;
        }
    }

    /** 表示外部项目不存在。 */
    public static final class PartnerProjectNotFoundException extends RuntimeException {
        /** 记录未找到的外部项目编号。 */
        public PartnerProjectNotFoundException(long projectId) {
            super("外部项目不存在：" + projectId);
        }
    }

    /** 表示外部服务未完成约定的调用。 */
    public static final class PartnerServiceException extends RuntimeException {
        /** 使用明确消息创建异常。 */
        public PartnerServiceException(String message) {
            super(message);
        }

        /** 保留底层客户端失败作为原因。 */
        public PartnerServiceException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
```

创建完整测试类
`src/test/java/dev/teamflow/integration/PartnerProjectClientTest.java`，把伪服务绑定到
`RestTemplate`，并覆盖与现代线相同的四个分支：

```java
package dev.teamflow.integration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

/** 验证 Java 8 兼容客户端保持同一外部合同。 */
class PartnerProjectClientTest {
    private MockRestServiceServer server;
    private PartnerProjectClient client;

    /** 为每个测试绑定独立 RestTemplate。 */
    @BeforeEach
    void setUp() {
        RestTemplate restTemplate = new RestTemplate();
        server = MockRestServiceServer.bindTo(restTemplate).build();
        client = new PartnerProjectClient(restTemplate, "https://partner.test");
    }

    /** GET 请求应展开路径变量并读取 JSON。 */
    @Test
    void findsProject() {
        server.expect(requestTo("https://partner.test/projects/42"))
                .andExpect(method(HttpMethod.GET))
                .andExpect(header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE))
                .andRespond(withSuccess(
                        "{\"id\":42,\"name\":\"课程平台\",\"status\":\"ACTIVE\"}",
                        MediaType.APPLICATION_JSON));

        PartnerProjectClient.PartnerProject project = client.findProject(42);

        assertEquals(42, project.getId());
        assertEquals("课程平台", project.getName());
        server.verify();
    }

    /** POST 请求应发送最小 JSON 并读取创建结果。 */
    @Test
    void createsProject() {
        server.expect(requestTo("https://partner.test/projects"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE))
                .andExpect(content().json("{\"name\":\"发布课程\"}"))
                .andRespond(withStatus(HttpStatus.CREATED)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"id\":43,\"name\":\"发布课程\",\"status\":\"NEW\"}"));

        PartnerProjectClient.PartnerProject project = client.createProject("发布课程");

        assertEquals(43, project.getId());
        assertEquals("NEW", project.getStatus());
        server.verify();
    }

    /** 404 应转换为专用的未找到异常。 */
    @Test
    void reportsMissingProject() {
        server.expect(requestTo("https://partner.test/projects/99"))
                .andRespond(withStatus(HttpStatus.NOT_FOUND));

        assertThrows(
                PartnerProjectClient.PartnerProjectNotFoundException.class,
                () -> client.findProject(99));
        server.verify();
    }

    /** 成功状态没有响应体时不应制造空项目。 */
    @Test
    void rejectsEmptySuccessBody() {
        server.expect(requestTo("https://partner.test/projects/42"))
                .andRespond(withStatus(HttpStatus.NO_CONTENT));

        PartnerProjectClient.PartnerServiceException exception = assertThrows(
                PartnerProjectClient.PartnerServiceException.class,
                () -> client.findProject(42));

        assertEquals("外部项目目录没有返回项目数据", exception.getMessage());
        server.verify();
    }
}
```

在 Java 8 环境执行同一条 `mvn clean test`。兼容线的区别是客户端 API 与 DTO 写法，外部端点、请求头、JSON
字段、`404` 分支和空响应体分支都应与现代线一致。

## 八、集中处理常见调用错误

下面三个错误分别破坏 URI、状态和客户端生命周期边界。

:::pitfalls
### 把外部输入直接拼进 URI

**触发条件：** 把项目名称或状态直接追加到 URL 字符串，没有使用路径模板或 queryParam。

**原因：** 调用代码接管了 URI 编码和分隔符管理，空格、斜杠、问号等字符可能改变 URI 结构。

**后果：** 请求可能发送到错误路径、丢失查询值，或在不同输入下产生不可复现的地址。

**错误示例：**

```java
client.get().uri("/projects?name=" + projectName).retrieve();
```

**正确写法：**

```java
client.get()
        .uri(builder -> builder.path("/projects").queryParam("name", projectName).build())
        .retrieve();
```

**验证方式：** 使用包含空格和 `&` 的名称，通过 MockRestServiceServer 断言最终 URI 中查询值被正确编码且没有多出参数。

### 用空的 onStatus 处理器吞掉 404

**触发条件：** 为了避免异常，让 `404` 处理器什么都不做，然后继续把错误响应当成功响应读取。

**原因：** onStatus 负责定义错误分支；空处理器会取消默认异常，却没有建立明确的本地结果合同。

**后果：** 空错误体可能变成 null，带错误 JSON 的响应可能发生转换失败，业务代码无法稳定区分未找到与坏数据。

**错误示例：**

```java
client.get()
        .uri("/projects/{id}", projectId)
        .retrieve()
        .onStatus(status -> status.value() == 404, (request, response) -> { })
        .body(PartnerProject.class);
```

**正确写法：**

```java
client.get()
        .uri("/projects/{id}", projectId)
        .retrieve()
        .onStatus(
                status -> status.value() == 404,
                (request, response) -> {
                    throw new PartnerProjectNotFoundException(projectId);
                })
        .body(PartnerProject.class);
```

**验证方式：** 让伪服务返回空的 `404`，断言客户端稳定抛出 PartnerProjectNotFoundException，而不是返回 null 或 JSON 转换异常。

### 在每次业务调用中重新创建客户端

**触发条件：** 每个查询方法都调用 RestClient.create 或 new RestTemplate。

**原因：** 客户端的创建责任和单次请求执行混在一起，后续无法统一绑定请求工厂、超时、拦截器和观测配置。

**后果：** 配置发生漂移，测试难以绑定真实客户端，底层资源也可能无法按应用生命周期复用。

**错误示例：**

```java
public PartnerProject findProject(long id) {
    RestClient client = RestClient.create("https://partner.example");
    return client.get().uri("/projects/{id}", id).retrieve().body(PartnerProject.class);
}
```

**正确写法：**

```java
private final RestClient client;

/** 保存由应用启动阶段创建的客户端。 */
public PartnerProjectClient(RestClient client) {
    this.client = client;
}
```

**验证方式：** 构造客户端边界时注入一次 RestClient，连续执行两个请求，并确认两次请求都被同一个 MockRestServiceServer 记录。
:::

## 九、练习：按状态查询外部项目

:::exercise
### 按状态查询项目页

**要求：** 新建 `PartnerProjectSearchClient`，使用 GET 请求访问 `/projects?status=状态值`；必须通过
`queryParam` 传值，接收 `{"items":[...]}` 结构，并在成功响应没有 body 时抛出明确异常。不得加入超时、重试
或 WebClient。

**验收：** 测试输入 `IN PROGRESS` 时，伪服务必须收到编码后的查询参数，并返回两个项目；断言结果数量为 2。
再让同一端点返回 `204 No Content`，断言抛出消息为“外部项目目录没有返回项目页”的
`IllegalStateException`。两个测试都要调用 `server.verify()`。
:::

参考实现创建 `src/main/java/dev/teamflow/integration/PartnerProjectSearchClient.java`：

```java
package dev.teamflow.integration;

import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

/** 按状态读取外部项目页。 */
public final class PartnerProjectSearchClient {
    private final RestClient client;

    /** 使用已经绑定测试或生产请求工厂的 builder。 */
    public PartnerProjectSearchClient(RestClient.Builder builder, String baseUrl) {
        this.client = builder.baseUrl(baseUrl).build();
    }

    /** 按状态查询外部项目。 */
    public ProjectPage findByStatus(String status) {
        ProjectPage page = client.get()
                .uri(builder -> builder
                        .path("/projects")
                        .queryParam("status", status)
                        .build())
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .body(ProjectPage.class);
        if (page == null) {
            throw new IllegalStateException("外部项目目录没有返回项目页");
        }
        return page;
    }

    /** 外部项目页。 */
    public record ProjectPage(List<ProjectItem> items) {
    }

    /** 项目页中的最小项目数据。 */
    public record ProjectItem(long id, String name) {
    }
}
```

参考测试创建 `src/test/java/dev/teamflow/integration/PartnerProjectSearchClientTest.java`：

```java
package dev.teamflow.integration;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

/** 验证按状态查询时的 URI 编码、响应映射与空响应体边界。 */
class PartnerProjectSearchClientTest {
    /** 状态中的空格必须作为查询参数编码。 */
    @Test
    void findsProjectsByEncodedStatus() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        PartnerProjectSearchClient client = new PartnerProjectSearchClient(
                builder,
                "https://partner.test");
        server.expect(requestTo("https://partner.test/projects?status=IN%20PROGRESS"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess(
                        "{\"items\":[{\"id\":1,\"name\":\"API\"},"
                                + "{\"id\":2,\"name\":\"Web\"}]}",
                        MediaType.APPLICATION_JSON));

        PartnerProjectSearchClient.ProjectPage page = client.findByStatus("IN PROGRESS");

        assertEquals(2, page.items().size());
        server.verify();
    }

    /** 成功响应没有项目页时应抛出明确异常。 */
    @Test
    void rejectsEmptySuccessBody() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        PartnerProjectSearchClient client = new PartnerProjectSearchClient(
                builder,
                "https://partner.test");
        server.expect(requestTo("https://partner.test/projects?status=ACTIVE"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.NO_CONTENT));

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> client.findByStatus("ACTIVE"));

        assertEquals("外部项目目录没有返回项目页", exception.getMessage());
        server.verify();
    }
}
```

运行结果应包含：

```text
Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

Java 8 兼容线使用 `UriComponentsBuilder.fromHttpUrl(baseUrl).path("/projects")`
`.queryParam("status", status).build().encode().toUri()` 生成 URI，再调用
`restTemplate.getForObject(uri, ProjectPage.class)`；`ProjectPage` 与 `ProjectItem` 改为带无参构造器和访问方法的
普通类。查询参数、响应 JSON 和验收结果不变。
