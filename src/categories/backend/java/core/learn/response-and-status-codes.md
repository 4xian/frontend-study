---
id: backend.java.learn.intermediate.response-and-status-codes
type: lesson
title: 响应与状态码
summary: 控制 Spring MVC 响应的 body、status 与 headers，并用真实请求验证常见 HTTP 结果
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 160
prerequisites:
  - backend.java.learn.intermediate.request-body-and-json-binding
objectives:
  - 能说明普通返回对象怎样经过消息转换器写入响应体。
  - 能区分响应 body、status 与 headers 三项独立信息。
  - 能根据是否需要动态状态或响应头选择普通对象、ResponseEntity 或固定 ResponseStatus。
  - 能实现并验证 200、201、204 与动态 404 响应。
  - 能为创建结果生成 Location，并证明 204 响应体为零字节。
  - 能区分 400、404、405、406 与 415 的典型责任阶段。
  - 能说明 Spring Framework 7.0 与 5.2 的真实状态码 API 差异。
  - 能在现代与 Java 8 兼容工程中复跑同一组 HTTP 请求。
recap:
  - RestController 的普通返回对象由 HttpMessageConverter 写入响应体，未显式改变时通常返回 200。
  - ResponseEntity 同时携带 status、headers 与可选 body，适合动态响应合同。
  - 创建资源使用 201 和 Location，TeamFlow 同时返回创建后的 JSON 表示。
  - 204 表示响应没有内容，必须显式设置并验证下载字节数为零。
  - 固定 ResponseStatus 不设置 reason，也不与 ResponseEntity 混用。
  - 无映射路径与业务资源不存在都可能是 404，但由不同层负责。
  - 406 属于响应协商方向，415 属于请求媒体类型方向，畸形 JSON 通常是 400。
  - 本课没有 JDK 25 与 Java 8 的语言差异，兼容差异来自 Spring Framework API。
related: []
tags:
  - Java
  - Spring Boot
  - Spring MVC
  - ResponseEntity
  - HTTP 状态码
  - Location
appliesTo: JDK 25 / Spring Boot 4.1.0 主线；Java 8 / Spring Boot 2.3.12.RELEASE 兼容线
verifiedAt: 2026-08-19
sources:
  - id: spring-boot-41-system-requirements-response
    title: Spring Boot System Requirements
    url: https://docs.spring.io/spring-boot/system-requirements.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Spring Boot 4.1.0 的 Java 与 Spring Framework 基线
  - id: spring-boot-23-getting-started-response
    title: Spring Boot 2.3 Getting Started
    url: https://docs.spring.io/spring-boot/docs/2.3.x/reference/html/getting-started.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Java 8 兼容线的 Spring Boot 与 Spring Framework 基线
  - id: spring-mvc-return-values
    title: Spring MVC Annotated Controller Method Return Values
    url: https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/return-types.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - ResponseBody 与 ResponseEntity 返回值的处理职责
  - id: spring-mvc-request-mapping-media-types
    title: Spring MVC Mapping Requests
    url: https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - produces、consumes、Accept 与 Content-Type 的匹配方向
  - id: spring-response-entity-708
    title: ResponseEntity API - Spring Framework 7.0.8
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/http/ResponseEntity.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - ResponseEntity 的状态、响应头、响应体与 builder API
  - id: spring-http-status-code-708
    title: HttpStatusCode API - Spring Framework 7.0.8
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/http/HttpStatusCode.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - HttpStatusCode 自 Spring 6.0 引入并表示三位 HTTP 状态码
  - id: spring-response-status-708
    title: ResponseStatus API - Spring Framework 7.0.8
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/bind/annotation/ResponseStatus.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 固定响应状态、reason 的 sendError 行为与当前覆盖规则
  - id: spring-response-entity-5215
    title: ResponseEntity API - Spring Framework 5.2.15.RELEASE
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/http/ResponseEntity.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Java 8 兼容线的 ResponseEntity builder 与状态返回类型
  - id: spring-response-status-5215
    title: ResponseStatus API - Spring Framework 5.2.15.RELEASE
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/bind/annotation/ResponseStatus.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Java 8 兼容线的固定状态、reason 与旧版覆盖说明
  - id: spring-default-handler-exception-resolver-708-response
    title: DefaultHandlerExceptionResolver API - Spring Framework 7.0.8
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/servlet/mvc/support/DefaultHandlerExceptionResolver.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - Spring MVC 常见映射、转换与媒体类型异常的默认状态码
  - id: rfc-9110-response-status
    title: RFC 9110 - HTTP Semantics
    url: https://www.rfc-editor.org/rfc/rfc9110.txt
    sourceOrigin: official
    sourceType: specification
    appliesTo: HTTP Semantics
    claims:
      - 201、204、404、405、406 与 415 的协议语义
      - Location、Allow、Accept 与无内容响应的合同
  - id: stackoverflow-response-status-created
    title: Difference between ResponseStatus and ResponseEntity.created
    url: https://stackoverflow.com/questions/53003617/diffrence-b-w-responsestatus-and-responseentity-createdlocation-build-in-po
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Spring MVC Controller 边界；已由 Spring Javadoc 与 RFC 9110 复核
    claims:
      - ResponseEntity 应留在 Controller 层并在创建响应中携带 Location
---

# 响应与状态码

前几课已经让请求走到了 Controller：路径和方法先参与映射，URL 参数会转换成 Java 类型，JSON 请求体会
绑定到 DTO。方法执行完以后，还需要把 Java 返回值翻译为一份完整的 HTTP 响应。客户端看到的不只是 JSON，
还会看到状态码和响应头。

本课把这三项信息分开处理。TeamFlow 查询成功返回 `200` 和 JSON；创建成功返回 `201`、`Location` 与创建
后的 JSON；删除成功返回 `204` 且没有响应体；资源不存在时动态返回 `404`。`400`、`405`、`406` 和 `415`
继续由前置课已经观察过的请求阶段负责，本课只把它们放回完整响应地图，不设计统一错误格式。

## 一、把响应拆成三项信息

### 1. body 承载资源表示

Controller 返回一个 Java 对象时，`@RestController` 让返回值具有 `@ResponseBody` 语义。Spring MVC 再从
已注册的 `HttpMessageConverter` 中选择能够写出目标媒体类型的转换器。JSON 转换器可用、客户端接受 JSON
并且对象可序列化时，Java 对象会成为 JSON 响应体：

```text
Controller 返回 MemberView
  -> 根据返回类型、produces 与 Accept 选择媒体类型
  -> HttpMessageConverter 写出 JSON
  -> 客户端读取响应 body
```

这不是“任何对象都自动变成 JSON”。如果 `produces` 与 `Accept` 没有交集，或者没有转换器能写出客户端接受
的表示，响应会失败。普通对象只表达 body，未通过其他方式改变状态时，成功结果通常保持 `200 OK`。

### 2. status 描述这次请求的结果

相同的 JSON 形状可以出现在不同结果中。查询到成员是 `200 OK`，创建出成员是 `201 Created`。删除成功后
没有要发送的表示，使用 `204 No Content`。成员 ID 的路径存在，但具体成员不存在时，使用 `404 Not Found`。

状态码不是业务数据字段。下面的 body 仍然只是成员表示，不需要再增加 `success` 或 `code`：

```json
{"id":2,"name":"林澄","role":"Developer"}
```

客户端从 HTTP status 读取结果类别，从 body 读取资源表示。后续课程会分别处理输入校验和错误响应合同，本课
不提前为错误设计 JSON 包装。

### 3. headers 携带响应元数据

响应头描述响应本身。创建资源后，`Location` 指向新资源；方法不允许时，`Allow` 告诉客户端目标资源支持
哪些 HTTP 方法；`Content-Type` 描述当前响应体的媒体类型。

```text
HTTP/1.1 201 Created
Location: http://localhost:8080/api/v1/members/2
Content-Type: application/json

{"id":2,"name":"林澄","role":"Developer"}
```

`Location` 不是 JSON 字段，也不是下一次请求的状态码。把 body、status 与 headers 分开，才能准确选择返回
方式并写出可验证的合同。

## 二、选择合适的返回方式

### 1. 普通对象适合固定的 200 响应

成员列表只需要返回数据，成功状态固定为默认 `200`，不需要为了形式统一而包一层 `ResponseEntity`：

```java
/**
 * 返回当前成员列表。
 *
 * @return 成员列表
 */
@GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public List<MemberView> list() {
    return new ArrayList<>(members.values());
}
```

这段方法表达的信息很窄：方法成功时返回一组成员，消息转换器把列表写成 JSON。响应没有额外动态 header，
status 也不随结果变化，因此普通对象是更直接的接口。

### 2. ResponseEntity 同时控制三项信息

创建成员既要返回 JSON，又要设置 `201` 和动态 `Location`。`ResponseEntity<T>` 把三项信息放在同一个
Controller 返回值中：

```java
/**
 * 创建成员并返回新资源位置。
 *
 * @param request 创建成员请求
 * @return 带有 Location 的创建结果
 */
@PostMapping(
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
)
public ResponseEntity<MemberView> create(@RequestBody MemberRequest request) {
    long id = nextId++;
    MemberView created = new MemberView(id, request.getName(), request.getRole());
    members.put(id, created);
    URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(id)
            .toUri();
    return ResponseEntity.created(location).body(created);
}
```

`created(location)` 选择 `201 Created` 并写入 `Location`，`body(created)` 再提供 JSON 表示。这里的
`ResponseEntity` 属于 HTTP 边界，应由 Controller 创建；Service 不应返回带有 HTTP 状态的类型。

### 3. ResponseStatus 只表达固定状态

状态始终固定、也不需要动态 header 时，可以使用方法级 `@ResponseStatus`。下面的 ping 方法固定返回
`200 OK`，注解没有 `reason`：

```java
/**
 * 返回应用存活文本。
 *
 * @return 固定存活文本
 */
@GetMapping(path = "/ping", produces = MediaType.TEXT_PLAIN_VALUE)
@ResponseStatus(HttpStatus.OK)
public String ping() {
    return "READY";
}
```

普通对象本来也会得到 `200`，这里保留注解是为了观察“固定 status”这一种表达方式。不要再同时返回
`ResponseEntity`：Spring Framework 5.2 与 7.0 的 Javadoc 对两者叠加时的覆盖描述不同，混用会让接口意图
和版本行为都变得不清楚。

`@ResponseStatus(reason = "...")` 会让框架调用 `sendError`，容器可能接管响应并生成 HTML，因此 REST
Controller 不使用 `reason`。

## 三、实现四种业务结果

### 1. 200 返回资源表示

查询已有成员时，`ResponseEntity.ok(member)` 显式返回 `200` 与 JSON。这里使用 `ResponseEntity`，是因为
同一方法还需要在找不到成员时动态选择 `404`：

```java
/**
 * 按 ID 查询成员。
 *
 * @param id 成员 ID
 * @return 成员或 404 响应
 */
@GetMapping(path = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
public ResponseEntity<MemberView> find(@PathVariable long id) {
    MemberView member = members.get(id);
    if (member == null) {
        return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(member);
}
```

列表方法永远返回集合，可以直接返回普通对象；单个查询可能出现两种状态，因此显式实体更合适。选择返回
类型的依据是响应合同是否动态，而不是团队是否规定“所有 Controller 都必须包一层”。

### 2. 201 同时返回 Location 和 JSON

RFC 9110 允许新资源由 `Location` 标识；TeamFlow 的接口合同明确要求创建响应携带这个 header。假设创建
请求是 `/api/v1/members`，新 ID 是 `2`，最终位置就是 `/api/v1/members/2`。

`ServletUriComponentsBuilder.fromCurrentRequest()` 从当前请求开始构造 URI，避免把 host 和 port 硬编码进
Java 代码。`buildAndExpand(id)` 把真实 ID 填入路径模板。创建响应需要同时验证三项结果：

```text
status=201
Location=http://localhost:8080/api/v1/members/2
body={"id":2,"name":"林澄","role":"Developer"}
```

只写 `@ResponseStatus(HttpStatus.CREATED)` 能改变固定状态，却不能自然提供每次创建后都不同的
`Location`，因此不符合当前接口合同。

### 3. 204 必须没有响应内容

删除已有成员后，没有资源表示需要返回：

```java
/**
 * 删除指定成员。
 *
 * @param id 成员 ID
 * @return 删除成功的 204 或资源不存在的 404
 */
@DeleteMapping("/{id}")
public ResponseEntity<Void> delete(@PathVariable long id) {
    if (members.remove(id) == null) {
        return ResponseEntity.notFound().build();
    }
    return ResponseEntity.noContent().build();
}
```

`noContent().build()` 显式选择 `204`，泛型 `Void` 说明没有 body。RFC 9110 规定 204 响应在 header section
结束，不能携带 content 或 trailers。验证不能只看状态码，还要检查下载字节数：

```text
status=204,bytes=0
```

Java 方法返回 `void` 或对象值为 `null`，只说明 Java 返回值为空，不等于应用已经选择了 HTTP 204。需要无
内容成功时，显式返回 `ResponseEntity.noContent().build()`。

### 4. 404 要区分路径和业务资源

请求 `/api/v1/unknown` 时没有任何 handler，框架在 Controller 执行前给出 404。请求
`/api/v1/members/999` 时路径模板存在，Controller 已经执行，只是成员集合中没有这个 ID，方法显式返回
`ResponseEntity.notFound().build()`。

两种结果都使用 404，但责任不同：

```text
没有匹配的路径 -> Spring MVC 映射阶段 -> 404
路径匹配但成员不存在 -> Controller 业务分支 -> 404
```

本课不把业务 404 转换成统一错误 JSON，也不引入全局异常处理。客户端先通过状态码识别“目标不存在”，错误
body 的跨接口合同留给后续课程。

## 四、读懂框架决定的失败状态

### 1. 400 表示请求无法完成读取或转换

前置课已经验证：路径变量不能转换成 `long`、必填请求参数缺失、JSON 语法损坏，或 JSON 字段不能绑定到
目标类型时，常见结果是 `400 Bad Request`。这些失败通常发生在目标方法正常执行之前。

本课创建接口没有加入字段约束。`{"name":null}` 能否绑定，与“名称能否为空”的业务规则不是同一个问题。
参数校验属于下一门独立课程，不能看到 400 就提前加入约束注解。

### 2. 405 表示路径支持但方法不支持

Controller 为 `/api/v1/members/{id}` 注册 GET 和 DELETE。对同一路径发送 POST 时，路径目标存在，但没有
对应的 POST 映射，框架返回 `405 Method Not Allowed`。按照 HTTP 合同，响应还应携带 `Allow`：

```text
HTTP/1.1 405
Allow: GET,DELETE
```

不同运行环境可能调整方法顺序，验收应检查 `Allow` 是否包含预期方法，不把文本顺序写成业务合同。

### 3. 406 属于响应方向

成员查询声明 `produces = application/json`。客户端发送 `Accept: text/plain` 时，只接受纯文本，但该方法只
生成 JSON，框架找不到双方都接受的响应表示，通常返回 `406 Not Acceptable`。

```text
produces + Accept -> 响应方向 -> 不兼容通常为 406
```

即使请求没有 body，406 仍可能出现。它描述的是“服务端能写什么”和“客户端愿意接收什么”之间没有交集。

### 4. 415 属于请求方向

创建接口声明 `consumes = application/json`。客户端把 `Content-Type` 写成 `text/plain` 时，请求体类型不被
当前映射接受，通常返回 `415 Unsupported Media Type`：

```text
Content-Type + consumes/读取转换器 -> 请求方向 -> 不支持通常为 415
```

如果 `Content-Type` 已经是 JSON，但文本缺少右花括号，媒体类型是受支持的，失败发生在 JSON 解析阶段，
通常是 400，不是 415。

### 5. 一张责任地图连接前置课程

| 状态 | 典型触发点 | 目标方法是否通常执行 | 本课负责内容 |
| --- | --- | --- | --- |
| 400 | 参数转换或请求体读取失败 | 否 | 观察状态，不设计校验与错误包装 |
| 404 | 无 handler，或业务资源不存在 | 视类型而定 | 区分框架 404 与动态业务 404 |
| 405 | 路径存在但 HTTP 方法不支持 | 否 | 检查状态与 `Allow` |
| 406 | 没有可接受的响应表示 | 通常否；也可能在写返回值时失败 | 明确响应方向 |
| 415 | 请求媒体类型不满足映射或读取能力 | 否 | 明确请求方向 |

这张表用于定位责任，不代表所有错误都只能从一个内部类抛出。例如 406 既可能在 `produces` 匹配时出现，也
可能在写返回值时因没有可接受的转换器出现。

## 五、现代与兼容版本的真实差异

### 1. 常用 builder 在两条版本线都存在

本课使用的 `ResponseEntity.ok(...)`、`created(uri)`、`noContent()` 与 `notFound()` 在 Spring Framework
7.0.8 和 5.2.15.RELEASE 中都存在。Controller 的响应意图可以保持一致，两套工程仍要分别使用自己的 JDK、
Spring Boot parent 和 Web starter。

### 2. getStatusCode 的返回类型不同

Spring Framework 7.0.8 的 `ResponseEntity.getStatusCode()` 返回 `HttpStatusCode`。这个接口自 Spring 6.0
引入，可以表示 `HttpStatus` 枚举之外的三位状态码；`HttpStatus` 是它的一个实现。

Spring Framework 5.2.15.RELEASE 没有 `HttpStatusCode`，同名方法返回 `HttpStatus`。因此不要把基于 Spring
7 编译的二进制直接放到 Spring 5 环境，也不要在共享源码中假设两版方法签名完全相同。本课 Controller 不必
主动调用这个 getter，常用 builder 足以表达响应。

### 3. 版本差异来自框架而不是 Java 语法

本课没有需要 JDK 25 专属语法的知识点。现代工程使用 JDK 25、Boot 4.1.0 和
`spring-boot-starter-webmvc`；兼容工程使用 Java 8、Boot 2.3.12.RELEASE 和
`spring-boot-starter-web`。DTO 使用普通 JavaBean，两条版本线都能理解。

`@ResponseStatus` 与 `ResponseEntity` 的叠加规则在两版 Javadoc 中描述相反。课程不比较谁覆盖谁，而是采用
稳定规则：固定状态只使用注解，动态状态或响应头只使用 `ResponseEntity`，同一方法不混用。

## 六、JDK 25 完整 TeamFlow 响应工程

### 1. 创建独立 Maven 工程

新建目录 `teamflow-response-jdk25`，完整 `pom.xml` 如下：

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
    <artifactId>teamflow-response-jdk25</artifactId>
    <version>0.0.1-SNAPSHOT</version>

    <properties>
        <java.version>25</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webmvc</artifactId>
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

工程目录如下：

```text
teamflow-response-jdk25/
├── pom.xml
└── src/main
    ├── java/com/teamflow
    │   ├── TeamFlowApplication.java
    │   └── response
    │       ├── MemberController.java
    │       ├── MemberRequest.java
    │       └── MemberView.java
    └── resources/application.properties
```

### 2. 编写启动类和配置

`src/main/java/com/teamflow/TeamFlowApplication.java`：

```java
package com.teamflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 启动 TeamFlow 响应示例。
 */
@SpringBootApplication
public class TeamFlowApplication {
    /**
     * 启动现代版 Spring Boot Web 应用。
     *
     * @param args 启动参数
     */
    public static void main(String[] args) {
        SpringApplication.run(TeamFlowApplication.class, args);
    }
}
```

`src/main/resources/application.properties`：

```properties
spring.application.name=teamflow-response-jdk25
server.port=8080
```

### 3. 定义请求与响应 DTO

`src/main/java/com/teamflow/response/MemberRequest.java`：

```java
package com.teamflow.response;

/**
 * 表示创建成员时读取的 JSON 请求体。
 */
public final class MemberRequest {
    private String name;
    private String role;

    /**
     * 创建供消息转换器填充的空对象。
     */
    public MemberRequest() {
    }

    /**
     * 读取成员姓名。
     *
     * @return 成员姓名
     */
    public String getName() {
        return name;
    }

    /**
     * 写入成员姓名。
     *
     * @param name 成员姓名
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * 读取成员角色。
     *
     * @return 成员角色
     */
    public String getRole() {
        return role;
    }

    /**
     * 写入成员角色。
     *
     * @param role 成员角色
     */
    public void setRole(String role) {
        this.role = role;
    }
}
```

`src/main/java/com/teamflow/response/MemberView.java`：

```java
package com.teamflow.response;

/**
 * 表示发送给客户端的成员资源。
 */
public final class MemberView {
    private final long id;
    private final String name;
    private final String role;

    /**
     * 创建成员资源表示。
     *
     * @param id 成员 ID
     * @param name 成员姓名
     * @param role 成员角色
     */
    public MemberView(long id, String name, String role) {
        this.id = id;
        this.name = name;
        this.role = role;
    }

    /**
     * 读取成员 ID。
     *
     * @return 成员 ID
     */
    public long getId() {
        return id;
    }

    /**
     * 读取成员姓名。
     *
     * @return 成员姓名
     */
    public String getName() {
        return name;
    }

    /**
     * 读取成员角色。
     *
     * @return 成员角色
     */
    public String getRole() {
        return role;
    }
}
```

### 4. 编写响应 Controller

`src/main/java/com/teamflow/response/MemberController.java`：

```java
package com.teamflow.response;

import java.net.URI;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/**
 * 展示普通对象、响应实体和固定状态的使用边界。
 */
@RestController
@RequestMapping("/api/v1/members")
public final class MemberController {
    private final Map<Long, MemberView> members = new LinkedHashMap<>();
    private long nextId = 2L;

    /**
     * 创建 Controller 并准备一个可查询成员。
     */
    public MemberController() {
        members.put(1L, new MemberView(1L, "周宁", "Designer"));
    }

    /**
     * 返回应用存活文本。
     *
     * @return 固定存活文本
     */
    @GetMapping(path = "/ping", produces = MediaType.TEXT_PLAIN_VALUE)
    @ResponseStatus(HttpStatus.OK)
    public String ping() {
        return "READY";
    }

    /**
     * 返回当前成员列表。
     *
     * @return 成员列表
     */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public List<MemberView> list() {
        return new ArrayList<>(members.values());
    }

    /**
     * 按 ID 查询成员。
     *
     * @param id 成员 ID
     * @return 成员或 404 响应
     */
    @GetMapping(path = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<MemberView> find(@PathVariable long id) {
        MemberView member = members.get(id);
        if (member == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(member);
    }

    /**
     * 创建成员并返回新资源位置。
     *
     * @param request 创建成员请求
     * @return 带有 Location 的创建结果
     */
    @PostMapping(
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<MemberView> create(@RequestBody MemberRequest request) {
        long id = nextId++;
        MemberView created = new MemberView(id, request.getName(), request.getRole());
        members.put(id, created);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(id)
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    /**
     * 删除指定成员。
     *
     * @param id 成员 ID
     * @return 删除成功的 204 或资源不存在的 404
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id) {
        if (members.remove(id) == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
```

示例用内存集合保持请求前后的可观察状态，不代表持久化设计。不要在本课加入 Repository、数据库或并发
控制。

### 5. 构建、启动并观察完整矩阵

在 IDEA 中把 Project SDK、Module SDK 与 Maven Runner JRE 都设为 JDK 25，Reload Maven 后运行
`TeamFlowApplication.main`。终端等价步骤是：

```bash
java -version
mvn -version
mvn clean package
mvn spring-boot:run
```

应用监听 8080 后，从另一个终端依次执行：

```bash
curl --silent --show-error --write-out '\nstatus=%{http_code}\n' \
  'http://localhost:8080/api/v1/members/ping'
curl --silent --show-error --write-out '\nstatus=%{http_code}\n' \
  --header 'Accept: application/json' \
  'http://localhost:8080/api/v1/members'
curl --silent --show-error --write-out '\nstatus=%{http_code}\n' \
  --header 'Accept: application/json' \
  'http://localhost:8080/api/v1/members/1'
curl --silent --show-error --include \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json' \
  --data '{"name":"林澄","role":"Developer"}' \
  'http://localhost:8080/api/v1/members'
curl --silent --show-error --output /dev/null \
  --write-out 'status=%{http_code},bytes=%{size_download}\n' \
  --request DELETE 'http://localhost:8080/api/v1/members/2'
curl --silent --show-error --output /dev/null --write-out 'status=%{http_code}\n' \
  --header 'Accept: application/json' \
  'http://localhost:8080/api/v1/members/2'
curl --silent --show-error --output /dev/null --write-out 'bad-json=%{http_code}\n' \
  --header 'Content-Type: application/json' \
  --data '{"name":"未闭合"' \
  'http://localhost:8080/api/v1/members'
curl --silent --show-error --dump-header - --output /dev/null \
  --request POST 'http://localhost:8080/api/v1/members/1'
curl --silent --show-error --output /dev/null --write-out 'not-acceptable=%{http_code}\n' \
  --header 'Accept: text/plain' \
  'http://localhost:8080/api/v1/members/1'
curl --silent --show-error --output /dev/null --write-out 'unsupported=%{http_code}\n' \
  --header 'Content-Type: text/plain' \
  --data 'name=林澄' \
  'http://localhost:8080/api/v1/members'
curl --silent --show-error --output /dev/null --write-out 'no-handler=%{http_code}\n' \
  'http://localhost:8080/api/v1/unknown'
```

关键输出应为：

```text
READY
status=200
[{"id":1,"name":"周宁","role":"Designer"}]
status=200
{"id":1,"name":"周宁","role":"Designer"}
status=200
HTTP/1.1 201
Location: http://localhost:8080/api/v1/members/2
Content-Type: application/json

{"id":2,"name":"林澄","role":"Developer"}
status=204,bytes=0
status=404
bad-json=400
HTTP/1.1 405
Allow: GET,DELETE
not-acceptable=406
unsupported=415
no-handler=404
```

HTTP 版本、`Allow` 方法顺序、`Content-Type` 参数和其他服务器 header 可能不同；验收固定的是状态、
`Location`、允许的方法集合、JSON 数据和 204 下载字节数。

## 七、Java 8 完整兼容工程

### 1. 使用独立 POM 和运行环境

创建目录 `teamflow-response-java8`，完整 `pom.xml` 如下：

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
    <artifactId>teamflow-response-java8</artifactId>
    <version>0.0.1-SNAPSHOT</version>

    <properties>
        <java.version>1.8</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
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

目录结构必须独立存在，不能让 Java 8 工程复用现代工程的编译输出：

```text
teamflow-response-java8/
├── pom.xml
└── src/main
    ├── java/com/teamflow
    │   ├── TeamFlowApplication.java
    │   └── response
    │       ├── MemberController.java
    │       ├── MemberRequest.java
    │       └── MemberView.java
    └── resources/application.properties
```

### 2. 编写启动类和配置

`src/main/java/com/teamflow/TeamFlowApplication.java`：

```java
package com.teamflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 启动 Java 8 TeamFlow 响应示例。
 */
@SpringBootApplication
public class TeamFlowApplication {
    /**
     * 启动 Java 8 Spring Boot Web 应用。
     *
     * @param args 启动参数
     */
    public static void main(String[] args) {
        SpringApplication.run(TeamFlowApplication.class, args);
    }
}
```

`src/main/resources/application.properties`：

```properties
spring.application.name=teamflow-response-java8
server.port=8080
```

### 3. 定义 Java 8 请求与响应 DTO

`src/main/java/com/teamflow/response/MemberRequest.java`：

```java
package com.teamflow.response;

/**
 * 表示 Java 8 兼容工程的创建成员请求。
 */
public final class MemberRequest {
    private String name;
    private String role;

    /**
     * 创建供消息转换器填充的空对象。
     */
    public MemberRequest() {
    }

    /**
     * 读取成员姓名。
     *
     * @return 成员姓名
     */
    public String getName() {
        return name;
    }

    /**
     * 写入成员姓名。
     *
     * @param name 成员姓名
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * 读取成员角色。
     *
     * @return 成员角色
     */
    public String getRole() {
        return role;
    }

    /**
     * 写入成员角色。
     *
     * @param role 成员角色
     */
    public void setRole(String role) {
        this.role = role;
    }
}
```

`src/main/java/com/teamflow/response/MemberView.java`：

```java
package com.teamflow.response;

/**
 * 表示 Java 8 兼容工程发送的成员资源。
 */
public final class MemberView {
    private final long id;
    private final String name;
    private final String role;

    /**
     * 创建成员资源表示。
     *
     * @param id 成员 ID
     * @param name 成员姓名
     * @param role 成员角色
     */
    public MemberView(long id, String name, String role) {
        this.id = id;
        this.name = name;
        this.role = role;
    }

    /**
     * 读取成员 ID。
     *
     * @return 成员 ID
     */
    public long getId() {
        return id;
    }

    /**
     * 读取成员姓名。
     *
     * @return 成员姓名
     */
    public String getName() {
        return name;
    }

    /**
     * 读取成员角色。
     *
     * @return 成员角色
     */
    public String getRole() {
        return role;
    }
}
```

### 4. 编写 Java 8 响应 Controller

`src/main/java/com/teamflow/response/MemberController.java`：

```java
package com.teamflow.response;

import java.net.URI;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/**
 * 展示 Java 8 兼容线的响应合同。
 */
@RestController
@RequestMapping("/api/v1/members")
public final class MemberController {
    private final Map<Long, MemberView> members = new LinkedHashMap<Long, MemberView>();
    private long nextId = 2L;

    /**
     * 创建 Controller 并准备一个可查询成员。
     */
    public MemberController() {
        members.put(1L, new MemberView(1L, "周宁", "Designer"));
    }

    /**
     * 返回应用存活文本。
     *
     * @return 固定存活文本
     */
    @GetMapping(path = "/ping", produces = MediaType.TEXT_PLAIN_VALUE)
    @ResponseStatus(HttpStatus.OK)
    public String ping() {
        return "READY";
    }

    /**
     * 返回当前成员列表。
     *
     * @return 成员列表
     */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public List<MemberView> list() {
        return new ArrayList<MemberView>(members.values());
    }

    /**
     * 按 ID 查询成员。
     *
     * @param id 成员 ID
     * @return 成员或 404 响应
     */
    @GetMapping(path = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<MemberView> find(@PathVariable long id) {
        MemberView member = members.get(id);
        if (member == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(member);
    }

    /**
     * 创建成员并返回新资源位置。
     *
     * @param request 创建成员请求
     * @return 带有 Location 的创建结果
     */
    @PostMapping(
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<MemberView> create(@RequestBody MemberRequest request) {
        long id = nextId++;
        MemberView created = new MemberView(id, request.getName(), request.getRole());
        members.put(id, created);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(id)
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    /**
     * 删除指定成员。
     *
     * @param id 成员 ID
     * @return 删除成功的 204 或资源不存在的 404
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id) {
        if (members.remove(id) == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
```

### 5. 独立构建并复跑请求矩阵

切换到真实 Java 8 环境，执行：

```bash
java -version
mvn -version
mvn clean package
mvn spring-boot:run
```

应用启动后，完整复跑现代工程的 11 个 `curl` 请求。预期状态、`Location`、JSON 和 body 字节数相同：

```text
ping=200
list=200
find-existing=200
create=201,location=/api/v1/members/2
delete-existing=204,bytes=0
find-deleted=404
bad-json=400
wrong-method=405,allow-contains=GET+DELETE
not-acceptable=406
unsupported=415
no-handler=404
```

Java 8 工程必须从自己的目录完成 `mvn clean package`，不能只把现代工程的预期输出复制过来。两条基线
得到相同 HTTP 合同，说明差异只留在依赖和 API 类型层，没有被误写成业务响应差异。

## 八、集中排查常见响应误用

### 六个典型错误

**社区补充：** Stack Overflow 的真实讨论把 `@ResponseStatus(HttpStatus.CREATED)` 与
`ResponseEntity.created(location)` 放在一起比较，并提醒 HTTP 类型应留在 Controller，而不是从 Service
返回。这个建议适用于 Spring MVC Web 边界，已经由两版 `ResponseEntity` Javadoc、RFC 9110 和本课实际
请求复核；它不表示每个固定 200 都必须使用 `ResponseEntity`。

:::pitfalls
### 把 Java 的 void 当成自动 204

**触发条件：** 删除方法返回 `void`，没有用注解或响应实体显式设置状态，却把接口文档写成 204。

**原因：** Java 返回值是否存在与 HTTP status 是两项独立信息；没有返回值不会替应用选择 204。

**后果：** 客户端实际收到 200，接口实现与文档不一致，也无法区分“默认成功”与“明确无内容成功”。

**错误示例：**

```java
/**
 * 删除成员，但没有显式选择 HTTP 状态。
 *
 * @param id 成员 ID
 */
@DeleteMapping("/{id}")
public void delete(@PathVariable long id) {
    members.remove(id);
}
```

**正确写法：**

```java
/**
 * 删除成员并显式返回无内容状态。
 *
 * @param id 成员 ID
 * @return 204 无内容响应
 */
@DeleteMapping("/{id}")
public ResponseEntity<Void> delete(@PathVariable long id) {
    members.remove(id);
    return ResponseEntity.noContent().build();
}
```

**影响版本：** Spring Framework 7.0.8 与 5.2.15.RELEASE 都适用。

**验证方式：** 对两种写法分别发送 DELETE，用
`--write-out 'status=%{http_code},bytes=%{size_download}\n'` 观察；错误版通常是 200，正确版必须是
`status=204,bytes=0`。

### 给 204 响应继续添加 body

**触发条件：** 先选择 `HttpStatus.NO_CONTENT`，随后仍调用 `body(...)` 返回文本或 JSON。

**原因：** RFC 9110 规定 204 响应在 header section 结束，不能包含 content 或 trailers。

**后果：** 框架或服务器可能丢弃 body，客户端也不能把它作为可靠合同，代码却让维护者误以为内容会送达。

**错误示例：**

```java
/**
 * 错误地尝试给 204 添加文本。
 *
 * @return 名义上的无内容响应
 */
@DeleteMapping("/latest")
public ResponseEntity<String> deleteLatest() {
    return ResponseEntity.status(HttpStatus.NO_CONTENT).body("deleted");
}
```

**正确写法：**

```java
/**
 * 返回真正没有响应体的删除结果。
 *
 * @return 204 无内容响应
 */
@DeleteMapping("/latest")
public ResponseEntity<Void> deleteLatest() {
    return ResponseEntity.noContent().build();
}
```

**影响版本：** 所有符合 RFC 9110 无内容语义的 HTTP 实现都适用。

**验证方式：** 使用 curl 同时记录 status 与 `size_download`；正确响应必须是 204 和 0 字节，不检查任何
假定存在的 body 文本。

### 创建成功只设置 201 却遗漏 Location

**触发条件：** TeamFlow 创建方法只添加固定 `@ResponseStatus(CREATED)` 并直接返回对象，没有构造新资源
URI。

**原因：** 固定状态注解只能表达 status，不能提供每次创建后随 ID 变化的 `Location`。

**后果：** 虽然客户端看到 201，却无法从响应头直接定位刚创建的资源，违反本课已经确定的创建合同。

**错误示例：**

```java
/**
 * 创建成员但没有返回新资源位置。
 *
 * @param request 创建请求
 * @return 创建后的成员
 */
@PostMapping
@ResponseStatus(HttpStatus.CREATED)
public MemberView create(@RequestBody MemberRequest request) {
    return new MemberView(2L, request.getName(), request.getRole());
}
```

**正确写法：**

```java
/**
 * 创建成员并返回新资源位置。
 *
 * @param request 创建请求
 * @return 带有 Location 的创建结果
 */
@PostMapping
public ResponseEntity<MemberView> create(@RequestBody MemberRequest request) {
    MemberView created = new MemberView(2L, request.getName(), request.getRole());
    URI location = URI.create("http://localhost:8080/api/v1/members/2");
    return ResponseEntity.created(location).body(created);
}
```

**影响版本：** Spring Framework 7.0.8 与 5.2.15.RELEASE 都支持 `created(URI)`；真实应用应像完整工程
一样从当前请求和真实 ID 构造 URI，而不是硬编码地址。

**验证方式：** 使用 `curl --include` 创建资源；错误版缺少 `Location`，正确版必须同时出现 201、
`Location` 和成员 JSON。

### 在同一方法混用两种状态来源

**触发条件：** 方法同时声明 `@ResponseStatus(CREATED)`，又返回 `ResponseEntity.ok(...)`。

**原因：** 注解和返回值都试图决定 status，而且 Spring Framework 5.2 与 7.0 Javadoc 对叠加时的覆盖说明
不同。

**后果：** 读代码无法判断哪个状态代表真实接口意图，跨主版本运行时还可能观察到不同结果。

**错误示例：**

```java
/**
 * 同时声明两个相互冲突的状态来源。
 *
 * @return 冲突的响应
 */
@PostMapping("/conflict")
@ResponseStatus(HttpStatus.CREATED)
public ResponseEntity<String> conflict() {
    return ResponseEntity.ok("created");
}
```

**正确写法：**

```java
/**
 * 只使用响应实体表达动态创建响应。
 *
 * @return 创建响应
 */
@PostMapping("/created")
public ResponseEntity<String> created() {
    return ResponseEntity.created(URI.create("/api/v1/members/2")).body("created");
}
```

**影响版本：** 两条课程基线都应避免混用；具体覆盖文字正是 5.2 与 7.0 的版本风险。

**验证方式：** 对错误版分别在两条基线发请求并记录实际 status；修正后两条基线都只由
`ResponseEntity.created(...)` 决定 201 和 `Location`。

### 给 ResponseStatus 设置 reason

**触发条件：** 为了返回说明文字，写成 `@ResponseStatus(value = NOT_FOUND, reason = "member missing")`。

**原因：** `reason` 会触发 `sendError`，容器通常接管响应并可能生成 HTML 错误页面。

**后果：** REST 客户端得到的 body 由服务器环境决定，无法作为稳定 JSON 合同，且提前混入后续错误处理
主题。

**错误示例：**

```java
/**
 * 使用 reason 触发容器错误处理。
 *
 * @return 不会形成稳定 REST body 的文本
 */
@GetMapping("/missing")
@ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "member missing")
public String missing() {
    return "missing";
}
```

**正确写法：**

```java
/**
 * 用响应实体显式返回动态 404。
 *
 * @return 404 响应
 */
@GetMapping("/missing")
public ResponseEntity<Void> missing() {
    return ResponseEntity.notFound().build();
}
```

**影响版本：** Spring Framework 7.0.8 与 5.2.15.RELEASE 的 `reason` 都具有 `sendError` 风险。

**验证方式：** 在两条基线使用 `curl --include`；错误版 body 和 `Content-Type` 可能受容器错误页影响，
正确版只验收 404，不假定本课尚未定义的错误 JSON。

### 把 406 和 415 的方向写反

**触发条件：** 用 `Accept` 修复请求 `Content-Type`，或把服务端不能生成客户端接受的格式称为 415。

**原因：** `Accept` 描述响应偏好，`Content-Type` 描述当前请求 body；`produces` 与 `consumes` 分别位于
两个方向。

**后果：** 排错时反复修改无关 header，Controller 仍不执行，最终状态与解释不一致。

**错误示例：**

```bash
curl --header 'Accept: application/json' \
  --header 'Content-Type: text/plain' \
  --data 'name=林澄' \
  'http://localhost:8080/api/v1/members'
```

**正确写法：**

```bash
curl --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --data '{"name":"林澄","role":"Developer"}' \
  'http://localhost:8080/api/v1/members'
```

**影响版本：** Spring Framework 7.0.8 与 5.2.15.RELEASE 的方向一致。

**验证方式：** 先只把请求 `Content-Type` 改为 `text/plain`，应得到 415；再发送合法 JSON、只把
`Accept` 改为 `text/plain`，应得到 406；两次请求每次只改变一个方向。
:::

## 九、独立练习

### 1. 任务、约束与验收

:::exercise
### 为 TeamFlow 项目资源设计响应合同

**要求：** 新建独立项目资源工程。类级路径固定为 `/api/v1/projects`；普通列表返回 200 与 JSON；单个
查询根据 ID 返回 200 或动态 404；创建返回 201、动态 `Location` 与 JSON；删除返回 204 或动态 404；固定
`/ping` 使用不含 `reason` 的方法级 `@ResponseStatus(OK)`。只使用内存集合，不加入校验、统一响应、
Problem Details、全局异常处理或数据库。

**验收：** JDK 25 / Boot 4.1.0 与 Java 8 / Boot 2.3.12.RELEASE 工程都能独立构建和启动。两条线依次
验证 ping 200、列表 200、查询 200、创建 `201 + Location + JSON`、删除 `204 + 0 bytes`、业务 404、
405 且 `Allow` 包含 GET 和 DELETE、406、415 与损坏 JSON 400。

**参考答案：** 两套完整 POM、配置、启动类、DTO、Controller 与请求矩阵见后文。先独立完成，再按 body、
status 和 headers 三项逐项对照。
:::

### 2. JDK 25 完整参考工程

现代练习工程目录为 `teamflow-project-response-jdk25`，完整 `pom.xml`：

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
    <artifactId>teamflow-project-response-jdk25</artifactId>
    <version>0.0.1-SNAPSHOT</version>

    <properties>
        <java.version>25</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webmvc</artifactId>
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
spring.application.name=teamflow-project-response-jdk25
server.port=8080
```

`src/main/java/com/teamflow/TeamFlowApplication.java`：

```java
package com.teamflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 启动 TeamFlow 项目响应练习。
 */
@SpringBootApplication
public class TeamFlowApplication {
    /**
     * 启动现代版项目响应应用。
     *
     * @param args 启动参数
     */
    public static void main(String[] args) {
        SpringApplication.run(TeamFlowApplication.class, args);
    }
}
```

`src/main/java/com/teamflow/project/ProjectRequest.java`：

```java
package com.teamflow.project;

/**
 * 表示创建项目时读取的 JSON 请求体。
 */
public final class ProjectRequest {
    private String name;

    /**
     * 创建供消息转换器填充的空对象。
     */
    public ProjectRequest() {
    }

    /**
     * 读取项目名称。
     *
     * @return 项目名称
     */
    public String getName() {
        return name;
    }

    /**
     * 写入项目名称。
     *
     * @param name 项目名称
     */
    public void setName(String name) {
        this.name = name;
    }
}
```

`src/main/java/com/teamflow/project/ProjectView.java`：

```java
package com.teamflow.project;

/**
 * 表示发送给客户端的项目资源。
 */
public final class ProjectView {
    private final long id;
    private final String name;

    /**
     * 创建项目资源表示。
     *
     * @param id 项目 ID
     * @param name 项目名称
     */
    public ProjectView(long id, String name) {
        this.id = id;
        this.name = name;
    }

    /**
     * 读取项目 ID。
     *
     * @return 项目 ID
     */
    public long getId() {
        return id;
    }

    /**
     * 读取项目名称。
     *
     * @return 项目名称
     */
    public String getName() {
        return name;
    }
}
```

`src/main/java/com/teamflow/project/ProjectController.java`：

```java
package com.teamflow.project;

import java.net.URI;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/**
 * 实现项目资源的响应合同。
 */
@RestController
@RequestMapping("/api/v1/projects")
public final class ProjectController {
    private final Map<Long, ProjectView> projects = new LinkedHashMap<>();
    private long nextId = 2L;

    /**
     * 创建 Controller 并准备一个可查询项目。
     */
    public ProjectController() {
        projects.put(1L, new ProjectView(1L, "课程迁移"));
    }

    /**
     * 返回固定存活文本。
     *
     * @return 固定存活文本
     */
    @GetMapping(path = "/ping", produces = MediaType.TEXT_PLAIN_VALUE)
    @ResponseStatus(HttpStatus.OK)
    public String ping() {
        return "READY";
    }

    /**
     * 返回当前项目列表。
     *
     * @return 项目列表
     */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public List<ProjectView> list() {
        return new ArrayList<>(projects.values());
    }

    /**
     * 按 ID 查询项目。
     *
     * @param id 项目 ID
     * @return 项目或 404 响应
     */
    @GetMapping(path = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ProjectView> find(@PathVariable long id) {
        ProjectView project = projects.get(id);
        if (project == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(project);
    }

    /**
     * 创建项目并返回新资源位置。
     *
     * @param request 创建项目请求
     * @return 带有 Location 的创建结果
     */
    @PostMapping(
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ProjectView> create(@RequestBody ProjectRequest request) {
        long id = nextId++;
        ProjectView created = new ProjectView(id, request.getName());
        projects.put(id, created);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(id)
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    /**
     * 删除指定项目。
     *
     * @param id 项目 ID
     * @return 删除成功的 204 或资源不存在的 404
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id) {
        if (projects.remove(id) == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
```

工程目录应包含上述 POM、配置、启动类和三个项目资源类。使用 JDK 25 构建并启动：

```bash
java -version
mvn -version
mvn clean package
mvn spring-boot:run
```

### 3. Java 8 完整参考工程

兼容练习工程目录为 `teamflow-project-response-java8`。完整 `pom.xml`：

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
    <artifactId>teamflow-project-response-java8</artifactId>
    <version>0.0.1-SNAPSHOT</version>

    <properties>
        <java.version>1.8</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
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
spring.application.name=teamflow-project-response-java8
server.port=8080
```

`src/main/java/com/teamflow/TeamFlowApplication.java`：

```java
package com.teamflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 启动 Java 8 TeamFlow 项目响应练习。
 */
@SpringBootApplication
public class TeamFlowApplication {
    /**
     * 启动 Java 8 项目响应应用。
     *
     * @param args 启动参数
     */
    public static void main(String[] args) {
        SpringApplication.run(TeamFlowApplication.class, args);
    }
}
```

`src/main/java/com/teamflow/project/ProjectRequest.java`：

```java
package com.teamflow.project;

/**
 * 表示 Java 8 兼容工程的创建项目请求。
 */
public final class ProjectRequest {
    private String name;

    /**
     * 创建供消息转换器填充的空对象。
     */
    public ProjectRequest() {
    }

    /**
     * 读取项目名称。
     *
     * @return 项目名称
     */
    public String getName() {
        return name;
    }

    /**
     * 写入项目名称。
     *
     * @param name 项目名称
     */
    public void setName(String name) {
        this.name = name;
    }
}
```

`src/main/java/com/teamflow/project/ProjectView.java`：

```java
package com.teamflow.project;

/**
 * 表示 Java 8 兼容工程发送的项目资源。
 */
public final class ProjectView {
    private final long id;
    private final String name;

    /**
     * 创建项目资源表示。
     *
     * @param id 项目 ID
     * @param name 项目名称
     */
    public ProjectView(long id, String name) {
        this.id = id;
        this.name = name;
    }

    /**
     * 读取项目 ID。
     *
     * @return 项目 ID
     */
    public long getId() {
        return id;
    }

    /**
     * 读取项目名称。
     *
     * @return 项目名称
     */
    public String getName() {
        return name;
    }
}
```

`src/main/java/com/teamflow/project/ProjectController.java`：

```java
package com.teamflow.project;

import java.net.URI;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/**
 * 实现 Java 8 兼容线的项目资源响应合同。
 */
@RestController
@RequestMapping("/api/v1/projects")
public final class ProjectController {
    private final Map<Long, ProjectView> projects = new LinkedHashMap<Long, ProjectView>();
    private long nextId = 2L;

    /**
     * 创建 Controller 并准备一个可查询项目。
     */
    public ProjectController() {
        projects.put(1L, new ProjectView(1L, "课程迁移"));
    }

    /**
     * 返回固定存活文本。
     *
     * @return 固定存活文本
     */
    @GetMapping(path = "/ping", produces = MediaType.TEXT_PLAIN_VALUE)
    @ResponseStatus(HttpStatus.OK)
    public String ping() {
        return "READY";
    }

    /**
     * 返回当前项目列表。
     *
     * @return 项目列表
     */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public List<ProjectView> list() {
        return new ArrayList<ProjectView>(projects.values());
    }

    /**
     * 按 ID 查询项目。
     *
     * @param id 项目 ID
     * @return 项目或 404 响应
     */
    @GetMapping(path = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ProjectView> find(@PathVariable long id) {
        ProjectView project = projects.get(id);
        if (project == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(project);
    }

    /**
     * 创建项目并返回新资源位置。
     *
     * @param request 创建项目请求
     * @return 带有 Location 的创建结果
     */
    @PostMapping(
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ProjectView> create(@RequestBody ProjectRequest request) {
        long id = nextId++;
        ProjectView created = new ProjectView(id, request.getName());
        projects.put(id, created);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(id)
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    /**
     * 删除指定项目。
     *
     * @param id 项目 ID
     * @return 删除成功的 204 或资源不存在的 404
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id) {
        if (projects.remove(id) == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
```

在真实 Java 8 环境中，从兼容练习目录执行 `mvn clean package` 和 `mvn spring-boot:run`。两套练习工程
都启动后，在各自进程上依次执行同一矩阵：

```bash
curl --silent --show-error --output /dev/null --write-out 'ping=%{http_code}\n' \
  'http://localhost:8080/api/v1/projects/ping'
curl --silent --show-error --write-out '\nlist=%{http_code}\n' \
  --header 'Accept: application/json' \
  'http://localhost:8080/api/v1/projects'
curl --silent --show-error --write-out '\nfind=%{http_code}\n' \
  --header 'Accept: application/json' \
  'http://localhost:8080/api/v1/projects/1'
curl --silent --show-error --include \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json' \
  --data '{"name":"响应合同"}' \
  'http://localhost:8080/api/v1/projects'
curl --silent --show-error --output /dev/null \
  --write-out 'delete=%{http_code},bytes=%{size_download}\n' \
  --request DELETE 'http://localhost:8080/api/v1/projects/2'
curl --silent --show-error --output /dev/null --write-out 'missing=%{http_code}\n' \
  'http://localhost:8080/api/v1/projects/2'
curl --silent --show-error --dump-header - --output /dev/null \
  --request POST 'http://localhost:8080/api/v1/projects/1'
curl --silent --show-error --output /dev/null --write-out 'accept=%{http_code}\n' \
  --header 'Accept: text/plain' \
  'http://localhost:8080/api/v1/projects/1'
curl --silent --show-error --output /dev/null --write-out 'content-type=%{http_code}\n' \
  --header 'Content-Type: text/plain' --data 'name=响应合同' \
  'http://localhost:8080/api/v1/projects'
curl --silent --show-error --output /dev/null --write-out 'json=%{http_code}\n' \
  --header 'Content-Type: application/json' --data '{"name":"未闭合"' \
  'http://localhost:8080/api/v1/projects'
```

预期关键结果：

```text
ping=200
[{"id":1,"name":"课程迁移"}]
list=200
{"id":1,"name":"课程迁移"}
find=200
HTTP/1.1 201
Location: http://localhost:8080/api/v1/projects/2
{"id":2,"name":"响应合同"}
delete=204,bytes=0
missing=404
HTTP/1.1 405
Allow: GET,DELETE
accept=406
content-type=415
json=400
```

与主工程相同，`Allow` 的方法顺序和服务器附加 headers 不固定。每次只运行一个工程，先核对应用名和
端口，再把现代与兼容结果逐项比较。

## 十、本课小结

- 一份 HTTP 响应由 body、status 和 headers 共同组成，三者应分别选择和验证。
- RestController 的普通返回对象通过 HttpMessageConverter 写入 body，固定成功结果通常保持 200。
- ResponseEntity 适合动态 status 或 headers；固定 ResponseStatus 不设置 reason，也不与实体混用。
- TeamFlow 创建结果使用 `201 + Location + JSON`，删除结果使用 `204 + 0 bytes`。
- 无 handler 的 404 由映射阶段负责，业务资源不存在的 404 由 Controller 分支显式返回。
- 400 常见于读取或转换失败，405 常见于方法不支持，406 属于响应方向，415 属于请求方向。
- Spring 7 的 getStatusCode 返回 HttpStatusCode，Spring 5.2 返回 HttpStatus；常用 builder 在两版都存在。
- 两套主工程和两套练习工程必须独立构建、启动并复跑同一 HTTP 矩阵，不能用预期文本代替真实请求。
