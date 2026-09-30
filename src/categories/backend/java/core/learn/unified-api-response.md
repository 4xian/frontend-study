---
id: backend.java.learn.intermediate.unified-api-response
type: lesson
title: 统一接口响应
summary: 用稳定的响应 DTO、分页 DTO 与 ResponseEntity 落实一致的成功响应合同
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 180
prerequisites:
  - backend.java.learn.intermediate.request-validation
objectives:
  - 能说明统一接口响应不等于给所有 JSON 增加成功包装。
  - 能把内部模型与公开响应 DTO 分开，并保持字段语义稳定。
  - 能直接返回单资源表示，并用 items 与 nextPageToken 表达分页结果。
  - 能保证空页返回空数组而不是 null，并为分页列表建立不可变快照。
  - 能组合 ResponseEntity、真实 HTTP 状态、Location 与无正文响应。
  - 能说明成功响应与错误响应的职责边界，不提前实现全局异常转换。
  - 能在 JDK 25 与 Java 8 工程中实现相同的外部 JSON 合同。
  - 能用真实 HTTP 请求验证响应根结构、状态、响应头与正文长度。
recap:
  - 统一的是公开合同，不是强制增加 success、code、message 或 data 外壳。
  - 单资源成功直接返回资源 DTO，分页成功返回 items 与 nextPageToken。
  - 空分页的 items 固定为 []，不能用 null 代替集合。
  - 内部模型负责程序状态，响应 DTO 冻结客户端可见字段，两者不要直接混用。
  - ResponseEntity 继续表达真实状态与响应头，201 必须带 Location，204 必须没有正文。
  - 不存在的资源保持 404，参数校验失败保持 400，本课不冻结框架默认错误 body。
  - JDK 25 可用 record 与 List.copyOf，Java 8 使用带 getter 的不可变类与不可变列表快照。
  - 两条版本线的实现语法不同，但成功 JSON、HTTP 状态、Location 与空正文合同一致。
related:
  - backend.java.learn.basics.unified-api-contract
  - backend.java.learn.intermediate.response-and-status-codes
  - backend.java.learn.intermediate.request-validation
tags:
  - Java
  - Spring Boot
  - Spring MVC
  - ResponseEntity
  - 响应 DTO
  - 分页响应
appliesTo: JDK 25 / Spring Boot 4.1.0 主线；Java 8 / Spring Boot 2.3.12.RELEASE 兼容线
verifiedAt: 2026-08-19
sources:
  - id: rfc-9110-unified-response
    title: RFC 9110 - HTTP Semantics
    url: https://www.rfc-editor.org/rfc/rfc9110.txt
    sourceOrigin: official
    sourceType: specification
    appliesTo: HTTP Semantics
    claims:
      - 200、201 与 204 分别表达不同的成功语义。
      - 201 使用 Location 标识创建出的主要资源，204 没有额外内容。
  - id: rfc-9457-unified-response
    title: RFC 9457 - Problem Details for HTTP APIs
    url: https://www.rfc-editor.org/rfc/rfc9457.txt
    sourceOrigin: official
    sourceType: specification
    appliesTo: HTTP Problem Details
    claims:
      - 错误响应不能用成功包装隐藏真实 HTTP 状态。
      - Problem Details 中的 status 应与实际 HTTP 状态一致。
  - id: spring-boot-41-system-unified-response
    title: Spring Boot System Requirements
    url: https://docs.spring.io/spring-boot/system-requirements.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Spring Boot 4.1.0 支持 JDK 25，并要求 Spring Framework 7.0.8 或以上版本。
  - id: spring-boot-41-dependencies-unified-response
    title: Spring Boot 4.1 Managed Dependency Coordinates
    url: https://docs.spring.io/spring-boot/4.1/appendix/dependency-versions/coordinates.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Spring Boot 4.1.0 管理 Jackson Databind 3.1.4。
  - id: spring-boot-2312-system-unified-response
    title: Spring Boot 2.3.12.RELEASE Getting Started
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java 8 / Spring Boot 2.3.12.RELEASE
    claims:
      - Java 8 兼容线使用 Spring Boot 2.3.12.RELEASE 与 Spring Framework 5.2.15.RELEASE。
  - id: spring-boot-2312-dependencies-unified-response
    title: Spring Boot 2.3.12.RELEASE Dependency Versions
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/appendix-dependency-versions.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Spring Boot 2.3.12.RELEASE 管理 Jackson Databind 2.11.4。
  - id: spring-mvc-return-values-unified-response
    title: Spring MVC Annotated Controller Method Return Values
    url: https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-controller/ann-methods/return-types.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0
    claims:
      - ResponseEntity 表达完整响应，响应 body 由 HttpMessageConverter 写出。
      - ProblemDetail 属于错误响应模型，不是成功响应外壳。
  - id: spring-response-entity-708-unified-response
    title: ResponseEntity API - Spring Framework 7.0.8
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/http/ResponseEntity.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - ok、created 与 noContent builder 分别建立 200、201 与 204 响应。
  - id: spring-response-entity-5215-unified-response
    title: ResponseEntity API - Spring Framework 5.2.15.RELEASE
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/http/ResponseEntity.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Java 8 兼容线同样支持 ok、created 与 noContent builder。
  - id: jep-395-unified-response
    title: JEP 395 - Records
    url: https://openjdk.org/jeps/395
    sourceOrigin: official
    sourceType: release-note
    appliesTo: JDK 16+ / JDK 25
    claims:
      - record 是表达透明不可变数据载体的正式语言能力。
  - id: jackson-314-record-unified-response
    title: Jackson 3.1.4 RecordBasicsTest
    url: https://github.com/FasterXML/jackson-databind/blob/jackson-databind-3.1.4/src/test/java/tools/jackson/databind/records/RecordBasicsTest.java
    sourceOrigin: official
    sourceType: official-test
    appliesTo: Jackson Databind 3.1.4
    claims:
      - Jackson 官方测试验证 record component 的默认 JSON 序列化。
  - id: jackson-2114-readme-unified-response
    title: Jackson Databind 2.11.4 README
    url: https://github.com/FasterXML/jackson-databind/blob/jackson-databind-2.11.4/README.md
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Jackson Databind 2.11.4
    claims:
      - JavaBean getter 可以定义 Java 8 对象的 JSON 属性。
---

# 统一接口响应

前几课已经分别完成请求映射、参数绑定、JSON 读取、状态选择和参数校验。Controller 现在可以返回一个
资源对象，也可以用 `ResponseEntity` 控制状态与响应头。接口增多以后，真正困难的不是“让对象变成
JSON”，而是让相同业务含义始终拥有相同的外部形状。

本课把 TeamFlow 已经确定的成功合同落实到 Java 类型：单个成员直接返回成员表示，成员列表使用
`items` 与 `nextPageToken`，创建结果保留 `201` 和 `Location`，删除结果保留无正文的 `204`。这里的
“统一”不是在每个结果外面增加 `success`、`code`、`message` 或 `data`，也不会提前实现全局异常处理。

## 一、统一公开合同

### 1. 统一不等于增加一层外壳

客户端已经能从 HTTP status 判断请求结果。查询成员成功时，body 只需要描述成员：

```json
{"id":"1","displayName":"周宁","role":"Designer"}
```

如果再把同一结果包装成下面的形状，客户端必须多穿过一层 `data`，而 `success` 与数字 `code` 又重复了
HTTP 已经表达的信息：

```json
{"success":true,"code":200,"message":"ok","data":{"id":"1","displayName":"周宁","role":"Designer"}}
```

外壳本身不会带来一致性。真正需要统一的是同类结果的字段、空值语义、状态、响应头和正文有无。例如，
所有成员资源都使用 `id`、`displayName`、`role`；所有成员分页都使用 `items` 与 `nextPageToken`；所有创建
结果都使用真实的 `201 Created`。

### 2. HTTP 与 JSON 各自只负责一层语义

可以把一次响应拆成两层：

```text
HTTP 层：status + headers + body 是否存在
JSON 层：资源字段或分页字段
```

`200`、`201`、`204`、`400` 与 `404` 属于 HTTP 层。成员姓名、角色、分页 items 属于 JSON 层。不要在
JSON 中复制 HTTP status，也不要让 body 中的私有状态码推翻实际状态行。否则代理、监控、缓存和普通 HTTP
客户端看到的结果会与业务代码分支不一致。

### 3. 成功与失败保持不同职责

成功响应返回资源表示或分页表示。参数校验失败仍然是 `400`，资源不存在仍然是 `404`。本课只验证这些
真实状态，不约定 Spring Boot 默认错误 body，因为默认字段会随框架版本和失败阶段变化。

后续课程会集中处理异常分类、全局映射与 Problem Details。当前 Controller 不添加
`@ControllerAdvice`、`@ExceptionHandler` 或自动包装返回值的 `ResponseBodyAdvice`。

## 二、分开内部模型与响应 DTO

### 1. 内部模型不是公开合同

程序内部可能需要保存审计字段、权限状态或数据库版本号，但客户端不一定应该看到它们。假设内部成员包含
`internalNote`，直接返回内部对象就可能意外扩大接口：

```java
record Member(long id, String displayName, String role, String internalNote) {
}
```

公开响应单独定义为：

```java
/**
 * 表示客户端可见的成员资源。
 *
 * @param id 成员 ID
 * @param displayName 成员显示名称
 * @param role 成员角色
 */
public record MemberResponse(String id, String displayName, String role) {

    /**
     * 从内部成员模型创建公开响应。
     *
     * @param member 内部成员模型
     * @return 公开成员响应
     */
    static MemberResponse from(Member member) {
        return new MemberResponse(Long.toString(member.id()), member.displayName(), member.role());
    }
}
```

转换点明确列出公开字段，并把内部数值 ID 转为公开字符串。内部模型以后增加字段时，JSON 不会自动变化；
公开合同要变化时，也能直接定位到响应 DTO。

### 2. DTO 名称表达响应方向

`CreateMemberRequest` 只负责读取创建请求，`MemberResponse` 只负责写出成员响应。不要用一个含大量可选字段的
`MemberDto` 同时承担创建、更新、内部存储和返回职责。方向明确后，字段的必填性和含义更容易保持稳定。

```text
JSON 请求 -> CreateMemberRequest -> 内部 Member -> MemberResponse -> JSON 响应
```

请求 DTO 上的 Bean Validation 约束仍然只检查输入合同。内部模型到响应 DTO 的转换不是异常处理，也不会改变
校验失败的默认 `400`。

### 3. 只在边界处完成转换

Controller 可以在返回前调用明确的转换方法：

```java
Member member = members.get(id);
if (member == null) {
    return ResponseEntity.notFound().build();
}
return ResponseEntity.ok(MemberResponse.from(member));
```

成功路径返回 `MemberResponse`，不存在路径返回没有成员 body 的 `404`。两条路径的返回类型都写成
`ResponseEntity<MemberResponse>`，不会把内部 `Member` 暴露给消息转换器。

## 三、固定单资源与分页结构

### 1. 单资源直接返回资源表示

查询一个成员时，JSON 根对象就是成员，不增加 `data`：

```java
/**
 * 查询一个成员并直接返回资源表示。
 *
 * @param memberId 成员 ID
 * @return 成员资源或 404
 */
@GetMapping(path = "/{memberId}", produces = MediaType.APPLICATION_JSON_VALUE)
public ResponseEntity<MemberResponse> find(@PathVariable long memberId) {
    Member member = members.get(memberId);
    if (member == null) {
        return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(MemberResponse.from(member));
}
```

客户端可直接读取 `response.id` 与 `response.displayName`。资源不存在时不返回一个字段全部为 null 的假成员，
而是保持真实 `404`。

### 2. 分页响应使用专用 DTO

列表与分页元数据属于同一个公开结构。JDK 25 可以用泛型 record 表达：

```java
import java.util.List;

/**
 * 表示一页公开资源。
 *
 * @param items 当前页资源
 * @param nextPageToken 下一页游标，没有下一页时为 null
 * @param <T> 资源类型
 */
public record PageResponse<T>(List<T> items, String nextPageToken) {

    /**
     * 保存当前页列表的不可变快照。
     */
    public PageResponse {
        items = List.copyOf(items);
    }
}
```

`T` 让成员分页和以后其他资源分页共享同一个结构，但不会把单资源也塞进分页 DTO。下面是有下一页的 JSON：

```json
{
  "items": [{"id":"1","displayName":"周宁","role":"Designer"}],
  "nextPageToken": "PAGE-2"
}
```

### 3. 空页必须保留数组

没有成员时返回：

```json
{"items":[],"nextPageToken":null}
```

`[]` 表示“这个集合存在，但当前没有元素”。`null` 则表示“这里没有集合值”，会迫使客户端增加另一套分支。
Controller 应创建空列表，不把 `items` 设为 null：

```java
return ResponseEntity.ok(new PageResponse<>(List.of(), null));
```

### 4. 分页 DTO 保存列表快照

如果 DTO 直接保存可变列表，Controller 返回以后，其他代码仍可能修改该列表，使一次响应的内容依赖后续时序。
`List.copyOf(items)` 会创建不可变快照。Java 8 没有这个 API，使用：

```java
this.items = Collections.unmodifiableList(new ArrayList<>(items));
```

`new ArrayList<>(items)` 先切断与调用方列表的共享，`unmodifiableList` 再阻止通过 DTO getter 修改快照。两版写法
不同，但 JSON 都是普通数组。

## 四、组合状态、响应头与正文

### 1. 查询保持真实的 200 或 404

查询成功使用 `ResponseEntity.ok(body)`，资源不存在使用 `ResponseEntity.notFound().build()`：

```java
return ResponseEntity.ok(MemberResponse.from(member));
```

`ResponseEntity` 的泛型参数只描述可能存在的成功 body，不会要求 `404` 也创建一个成员对象。本课只断言
不存在路径的 HTTP status，不依赖框架默认错误 JSON。

### 2. 创建同时返回 201、Location 与资源

创建成功产生了一个新资源。`Location` 应由当前请求 URI 与真实新 ID 组合，不能写死：

```java
URI location = ServletUriComponentsBuilder.fromCurrentRequest()
        .path("/{memberId}")
        .buildAndExpand(created.id())
        .toUri();
return ResponseEntity.created(location).body(MemberResponse.from(created));
```

body 仍然直接是 `MemberResponse`。`201` 不放进 JSON 字段，`Location` 也不需要在 body 中复制。

### 3. 删除使用 Void 表达无正文

删除成功没有资源表示可发送，返回类型写成 `ResponseEntity<Void>`：

```java
return ResponseEntity.noContent().build();
```

验证时既要检查 `204`，也要检查下载字节数为 `0`。返回 `{}`、`null` 文本或成功外壳都不是本合同中的无正文。

### 4. 统一合同仍然接受不同成功状态

统一响应不意味着所有成功都变成 `200`：

| 场景 | 返回类型 | 状态 | body | 关键 header |
| --- | --- | --- | --- | --- |
| 查询单成员 | `ResponseEntity<MemberResponse>` | 200 或 404 | 成功时为资源 | 无新增要求 |
| 查询成员页 | `ResponseEntity<PageResponse<MemberResponse>>` | 200 | 分页表示 | 无新增要求 |
| 创建成员 | `ResponseEntity<MemberResponse>` | 201 | 创建后的资源 | `Location` |
| 删除成员 | `ResponseEntity<Void>` | 204 或 404 | 无 | 无新增要求 |

这张表才是 Controller 返回合同。任何 JSON 包装都不能替代其中的真实状态、header 与正文有无。

## 五、两条版本线保持同一外部合同

### 1. JDK 25 使用 record 表达响应值

record 会为组件生成访问器，并适合表达只携带数据的响应 DTO。Jackson 3 可以按 record component 名称写出
JSON。本课使用 record，不代表所有业务对象都应该改成 record；内部可变状态仍由自己的模型负责。

### 2. Java 8 使用不可变类与 getter

Java 8 没有 record。兼容版声明 final 字段，在构造器中一次写入，再提供 JavaBean getter：

```java
public final class MemberResponse {
    private final String id;
    private final String displayName;
    private final String role;

    /**
     * 创建公开成员响应。
     *
     * @param id 成员 ID
     * @param displayName 成员显示名称
     * @param role 成员角色
     */
    public MemberResponse(String id, String displayName, String role) {
        this.id = id;
        this.displayName = displayName;
        this.role = role;
    }

    /**
     * 返回成员 ID。
     *
     * @return 成员 ID
     */
    public String getId() {
        return id;
    }
}
```

完整兼容工程会补齐其他 getter。这里的真实差异是 Java 数据类型写法与集合快照 API，不是 HTTP 合同。

### 3. 不制造无效版本差异

两版都使用 `ResponseEntity.ok`、`created` 与 `noContent`，也都使用菱形运算符。菱形运算符早于 Java 8，
不能把兼容代码机械展开成 `new ArrayList<MemberResponse>()`。两版最终应产生同形 JSON，并观察到相同的
`200`、`201`、`204`、`400` 与 `404`。

## 六、JDK 25 完整 TeamFlow 响应工程

### 1. 创建独立 Maven 工程

创建目录 `teamflow-unified-response-modern`，完整 `pom.xml` 如下：

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
  <artifactId>teamflow-unified-response-modern</artifactId>
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

工程目录如下：

```text
teamflow-unified-response-modern/
├── pom.xml
└── src/main/
    ├── java/com/teamflow/response/
    │   ├── ResponseApplication.java
    │   ├── Member.java
    │   ├── CreateMemberRequest.java
    │   ├── MemberResponse.java
    │   ├── PageResponse.java
    │   └── MemberController.java
    └── resources/application.properties
```

### 2. 编写启动类与配置

`src/main/java/com/teamflow/response/ResponseApplication.java`：

```java
package com.teamflow.response;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 启动统一响应示例。
 */
@SpringBootApplication
public class ResponseApplication {

    /**
     * 启动现代版 Spring Boot Web 应用。
     *
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        SpringApplication.run(ResponseApplication.class, args);
    }
}
```

`src/main/resources/application.properties`：

```properties
spring.application.name=teamflow-unified-response-modern
```

### 3. 定义内部模型与请求 DTO

`src/main/java/com/teamflow/response/Member.java`：

```java
package com.teamflow.response;

/**
 * 表示应用内部保存的成员。
 *
 * @param id 成员 ID
 * @param teamId 团队 ID
 * @param displayName 成员显示名称
 * @param role 成员角色
 * @param internalNote 内部备注
 */
record Member(
        long id,
        String teamId,
        String displayName,
        String role,
        String internalNote) {
}
```

`src/main/java/com/teamflow/response/CreateMemberRequest.java`：

```java
package com.teamflow.response;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 表示创建成员时读取的 JSON 请求。
 *
 * @param displayName 成员显示名称
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

### 4. 定义公开响应 DTO

`src/main/java/com/teamflow/response/MemberResponse.java`：

```java
package com.teamflow.response;

/**
 * 表示客户端可见的成员资源。
 *
 * @param id 成员 ID
 * @param displayName 成员显示名称
 * @param role 成员角色
 */
public record MemberResponse(String id, String displayName, String role) {

    /**
     * 从内部模型创建公开响应。
     *
     * @param member 内部成员模型
     * @return 公开成员响应
     */
    static MemberResponse from(Member member) {
        return new MemberResponse(Long.toString(member.id()), member.displayName(), member.role());
    }
}
```

`src/main/java/com/teamflow/response/PageResponse.java`：

```java
package com.teamflow.response;

import java.util.List;

/**
 * 表示一页公开资源。
 *
 * @param items 当前页资源
 * @param nextPageToken 下一页游标，没有下一页时为 null
 * @param <T> 资源类型
 */
public record PageResponse<T>(List<T> items, String nextPageToken) {

    /**
     * 保存当前页列表的不可变快照。
     */
    public PageResponse {
        items = List.copyOf(items);
    }
}
```

### 5. 编写统一响应 Controller

`src/main/java/com/teamflow/response/MemberController.java`：

```java
package com.teamflow.response;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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
 * 提供成员资源的统一成功响应。
 */
@RestController
@RequestMapping("/api/v1/teams/{teamId}/members")
public class MemberController {
    private final Map<String, LinkedHashMap<Long, Member>> membersByTeam = new LinkedHashMap<>();
    private long nextId = 3L;

    /**
     * 创建 Controller 并准备分页与空页样本。
     */
    public MemberController() {
        LinkedHashMap<Long, Member> teamMembers = new LinkedHashMap<>();
        teamMembers.put(1L, new Member(1L, "TEAM-1", "周宁", "Designer", "内部备注 A"));
        teamMembers.put(2L, new Member(2L, "TEAM-1", "林澄", "Developer", "内部备注 B"));
        membersByTeam.put("TEAM-1", teamMembers);
        membersByTeam.put("TEAM-EMPTY", new LinkedHashMap<>());
    }

    /**
     * 查询一个成员并直接返回资源表示。
     *
     * @param teamId 团队 ID
     * @param memberId 成员 ID
     * @return 成员资源或 404
     */
    @GetMapping(path = "/{memberId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<MemberResponse> find(
            @PathVariable String teamId,
            @PathVariable long memberId) {
        Member member = teamMembers(teamId).get(memberId);
        if (member == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(MemberResponse.from(member));
    }

    /**
     * 查询一页成员。
     *
     * @param teamId 团队 ID
     * @param pageToken 下一页游标
     * @return 使用 items 与 nextPageToken 的分页响应
     */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PageResponse<MemberResponse>> list(
            @PathVariable String teamId,
            @RequestParam(required = false) String pageToken) {
        List<Member> members = new ArrayList<>(teamMembers(teamId).values());
        int start = "PAGE-2".equals(pageToken) ? 1 : 0;
        List<MemberResponse> items = members.stream()
                .skip(start)
                .limit(1)
                .map(MemberResponse::from)
                .toList();
        String nextPageToken = start == 0 && members.size() > 1 ? "PAGE-2" : null;
        return ResponseEntity.ok(new PageResponse<>(items, nextPageToken));
    }

    /**
     * 创建成员并返回新资源位置。
     *
     * @param teamId 团队 ID
     * @param request 已通过校验的创建请求
     * @return 201、Location 与创建后的成员资源
     */
    @PostMapping(
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<MemberResponse> create(
            @PathVariable String teamId,
            @Valid @RequestBody CreateMemberRequest request) {
        long id = nextId++;
        Member created = new Member(
                id,
                teamId,
                request.displayName(),
                request.role(),
                "仅内部可见");
        teamMembers(teamId).put(id, created);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{memberId}")
                .buildAndExpand(id)
                .toUri();
        return ResponseEntity.created(location).body(MemberResponse.from(created));
    }

    /**
     * 删除指定成员。
     *
     * @param teamId 团队 ID
     * @param memberId 成员 ID
     * @return 删除成功的 204 或资源不存在的 404
     */
    @DeleteMapping("/{memberId}")
    public ResponseEntity<Void> delete(
            @PathVariable String teamId,
            @PathVariable long memberId) {
        if (teamMembers(teamId).remove(memberId) == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    /**
     * 返回团队成员表，并为首次出现的团队创建空表。
     *
     * @param teamId 团队 ID
     * @return 团队成员表
     */
    private LinkedHashMap<Long, Member> teamMembers(String teamId) {
        return membersByTeam.computeIfAbsent(teamId, ignored -> new LinkedHashMap<>());
    }
}
```

内部 `Member` 的 `teamId` 与 `internalNote` 不会进入响应 JSON。Controller 只把 `MemberResponse` 或
`PageResponse<MemberResponse>` 交给消息转换器。

### 6. 构建并验证 HTTP 合同

在 IDEA 中把 Project SDK、Module SDK 与 Maven Runner JRE 都设为 JDK 25，Reload Maven 后运行
`ResponseApplication.main`。终端等价命令为：

```bash
mvn clean package
java -jar target/teamflow-unified-response-modern-1.0.0.jar
```

应用启动后依次执行：

```bash
curl --silent --show-error \
  --write-out '\nstatus=%{http_code}\n' \
  'http://localhost:8080/api/v1/teams/TEAM-1/members/1'

curl --silent --show-error \
  --write-out '\nstatus=%{http_code}\n' \
  'http://localhost:8080/api/v1/teams/TEAM-1/members'

curl --silent --show-error \
  --write-out '\nstatus=%{http_code}\n' \
  'http://localhost:8080/api/v1/teams/TEAM-EMPTY/members'

curl --silent --show-error --include \
  --header 'Content-Type: application/json' \
  --data '{"displayName":"苏禾","role":"Tester"}' \
  'http://localhost:8080/api/v1/teams/TEAM-1/members'

curl --silent --show-error --output /dev/null \
  --write-out 'status=%{http_code},bytes=%{size_download}\n' \
  --request DELETE \
  'http://localhost:8080/api/v1/teams/TEAM-1/members/3'

curl --silent --show-error --output /dev/null \
  --write-out 'not-found=%{http_code}\n' \
  'http://localhost:8080/api/v1/teams/TEAM-1/members/999'

curl --silent --show-error --output /dev/null \
  --write-out 'invalid=%{http_code}\n' \
  --header 'Content-Type: application/json' \
  --data '{"displayName":" ","role":"Tester"}' \
  'http://localhost:8080/api/v1/teams/TEAM-1/members'
```

关键结果应为：

```text
单成员：200 / {"id":"1","displayName":"周宁","role":"Designer"}
第一页：200 / {"items":[{"id":"1","displayName":"周宁","role":"Designer"}],"nextPageToken":"PAGE-2"}
空团队：200 / {"items":[],"nextPageToken":null}
创建成员：201 / Location: http://localhost:8080/api/v1/teams/TEAM-1/members/3
删除成员：status=204,bytes=0
不存在成员：not-found=404
空白名称：invalid=400
```

单成员和创建 body 的根级字段中都没有 `data`、`code` 或 `message`；分页根级只有 `items` 与
`nextPageToken`。对 `400` 与 `404` 只断言状态，不冻结默认错误 body。

## 七、Java 8 完整兼容工程

### 1. 使用独立 POM 与运行环境

创建目录 `teamflow-unified-response-java8`。它必须由 Java 8 独立编译和运行，不能复用现代工程的 class
文件。完整 `pom.xml` 如下：

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
  <artifactId>teamflow-unified-response-java8</artifactId>
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

工程目录与现代版保持相同职责：

```text
teamflow-unified-response-java8/
├── pom.xml
└── src/main/
    ├── java/com/teamflow/response/
    │   ├── ResponseApplication.java
    │   ├── Member.java
    │   ├── CreateMemberRequest.java
    │   ├── MemberResponse.java
    │   ├── PageResponse.java
    │   └── MemberController.java
    └── resources/application.properties
```

在 IDEA 中分别把这个工程的 Project SDK、Module SDK、Maven Runner JRE 与 POM 编译目标设为 Java 8，
Reload Maven 后再构建。

### 2. 编写启动类与配置

`src/main/java/com/teamflow/response/ResponseApplication.java`：

```java
package com.teamflow.response;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 启动 Java 8 统一响应示例。
 */
@SpringBootApplication
public class ResponseApplication {

    /**
     * 启动兼容版 Spring Boot Web 应用。
     *
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        SpringApplication.run(ResponseApplication.class, args);
    }
}
```

`src/main/resources/application.properties`：

```properties
spring.application.name=teamflow-unified-response-java8
```

### 3. 定义 Java 8 内部模型与请求 DTO

`src/main/java/com/teamflow/response/Member.java`：

```java
package com.teamflow.response;

/**
 * 表示应用内部保存的成员。
 */
final class Member {
    private final long id;
    private final String teamId;
    private final String displayName;
    private final String role;
    private final String internalNote;

    /**
     * 创建内部成员模型。
     *
     * @param id 成员 ID
     * @param teamId 团队 ID
     * @param displayName 成员显示名称
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

    /**
     * 返回成员 ID。
     *
     * @return 成员 ID
     */
    long getId() {
        return id;
    }

    /**
     * 返回成员显示名称。
     *
     * @return 成员显示名称
     */
    String getDisplayName() {
        return displayName;
    }

    /**
     * 返回成员角色。
     *
     * @return 成员角色
     */
    String getRole() {
        return role;
    }
}
```

`teamId` 与 `internalNote` 是内部状态，因此不提供给响应转换使用的 getter。它们不会成为 JSON 属性。

`src/main/java/com/teamflow/response/CreateMemberRequest.java`：

```java
package com.teamflow.response;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/**
 * 表示创建成员时读取的 JSON 请求。
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
     * 返回成员显示名称。
     *
     * @return 成员显示名称
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

### 4. 定义 Java 8 公开响应 DTO

`src/main/java/com/teamflow/response/MemberResponse.java`：

```java
package com.teamflow.response;

/**
 * 表示客户端可见的成员资源。
 */
public final class MemberResponse {
    private final String id;
    private final String displayName;
    private final String role;

    /**
     * 创建公开成员响应。
     *
     * @param id 成员 ID
     * @param displayName 成员显示名称
     * @param role 成员角色
     */
    public MemberResponse(String id, String displayName, String role) {
        this.id = id;
        this.displayName = displayName;
        this.role = role;
    }

    /**
     * 从内部模型创建公开响应。
     *
     * @param member 内部成员模型
     * @return 公开成员响应
     */
    static MemberResponse from(Member member) {
        return new MemberResponse(
                String.valueOf(member.getId()), member.getDisplayName(), member.getRole());
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
     * 返回成员显示名称。
     *
     * @return 成员显示名称
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

`src/main/java/com/teamflow/response/PageResponse.java`：

```java
package com.teamflow.response;

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
     * 创建分页响应并保存列表的不可变快照。
     *
     * @param items 当前页资源
     * @param nextPageToken 下一页游标，没有下一页时为 null
     */
    public PageResponse(List<T> items, String nextPageToken) {
        this.items = Collections.unmodifiableList(new ArrayList<>(items));
        this.nextPageToken = nextPageToken;
    }

    /**
     * 返回当前页资源。
     *
     * @return 不可变资源列表
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

### 5. 编写 Java 8 Controller

`src/main/java/com/teamflow/response/MemberController.java`：

```java
package com.teamflow.response;

import java.net.URI;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import javax.validation.Valid;
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
 * 提供 Java 8 成员资源的统一成功响应。
 */
@RestController
@RequestMapping("/api/v1/teams/{teamId}/members")
public class MemberController {
    private final Map<String, LinkedHashMap<Long, Member>> membersByTeam = new LinkedHashMap<>();
    private long nextId = 3L;

    /**
     * 创建 Controller 并准备分页与空页样本。
     */
    public MemberController() {
        LinkedHashMap<Long, Member> teamMembers = new LinkedHashMap<>();
        teamMembers.put(1L, new Member(1L, "TEAM-1", "周宁", "Designer", "内部备注 A"));
        teamMembers.put(2L, new Member(2L, "TEAM-1", "林澄", "Developer", "内部备注 B"));
        membersByTeam.put("TEAM-1", teamMembers);
        membersByTeam.put("TEAM-EMPTY", new LinkedHashMap<>());
    }

    /**
     * 查询一个成员并直接返回资源表示。
     *
     * @param teamId 团队 ID
     * @param memberId 成员 ID
     * @return 成员资源或 404
     */
    @GetMapping(path = "/{memberId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<MemberResponse> find(
            @PathVariable String teamId,
            @PathVariable long memberId) {
        Member member = teamMembers(teamId).get(memberId);
        if (member == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(MemberResponse.from(member));
    }

    /**
     * 查询一页成员。
     *
     * @param teamId 团队 ID
     * @param pageToken 下一页游标
     * @return 使用 items 与 nextPageToken 的分页响应
     */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PageResponse<MemberResponse>> list(
            @PathVariable String teamId,
            @RequestParam(required = false) String pageToken) {
        List<Member> members = new ArrayList<>(teamMembers(teamId).values());
        int start = "PAGE-2".equals(pageToken) ? 1 : 0;
        List<MemberResponse> items = new ArrayList<>();
        if (start < members.size()) {
            items.add(MemberResponse.from(members.get(start)));
        }
        String nextPageToken = start == 0 && members.size() > 1 ? "PAGE-2" : null;
        return ResponseEntity.ok(new PageResponse<>(items, nextPageToken));
    }

    /**
     * 创建成员并返回新资源位置。
     *
     * @param teamId 团队 ID
     * @param request 已通过校验的创建请求
     * @return 201、Location 与创建后的成员资源
     */
    @PostMapping(
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<MemberResponse> create(
            @PathVariable String teamId,
            @Valid @RequestBody CreateMemberRequest request) {
        long id = nextId++;
        Member created = new Member(
                id,
                teamId,
                request.getDisplayName(),
                request.getRole(),
                "仅内部可见");
        teamMembers(teamId).put(id, created);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{memberId}")
                .buildAndExpand(id)
                .toUri();
        return ResponseEntity.created(location).body(MemberResponse.from(created));
    }

    /**
     * 删除指定成员。
     *
     * @param teamId 团队 ID
     * @param memberId 成员 ID
     * @return 删除成功的 204 或资源不存在的 404
     */
    @DeleteMapping("/{memberId}")
    public ResponseEntity<Void> delete(
            @PathVariable String teamId,
            @PathVariable long memberId) {
        if (teamMembers(teamId).remove(memberId) == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    /**
     * 返回团队成员表，并为首次出现的团队创建空表。
     *
     * @param teamId 团队 ID
     * @return 团队成员表
     */
    private LinkedHashMap<Long, Member> teamMembers(String teamId) {
        LinkedHashMap<Long, Member> teamMembers = membersByTeam.get(teamId);
        if (teamMembers == null) {
            teamMembers = new LinkedHashMap<>();
            membersByTeam.put(teamId, teamMembers);
        }
        return teamMembers;
    }
}
```

### 6. 独立构建并复跑矩阵

在 Java 8 环境中执行：

```bash
mvn clean package
java -jar target/teamflow-unified-response-java8-1.0.0.jar --server.port=8081
```

把现代版请求中的端口改为 `8081`，复跑单成员、第一页、空团队、创建、删除、不存在与校验失败请求。预期
JSON 结构和状态完全相同，只有创建响应的 `Location` 使用 `8081`。兼容版同样不能出现根级
`data`、`code`、`message`，删除结果同样是 `204` 与零字节 body。

## 八、集中排查响应合同误用

### 六个典型错误

下面每项都可以通过 JSON 根结构、实际 HTTP status、`Location` 或正文长度直接复现。

:::pitfalls
### 给所有成功资源增加 data 外壳

**触发条件：** 已经确定单资源直接返回资源表示，却又创建通用 `ApiResponse<T>`，让每个 Controller 都把
资源放进 `data`。

**原因：** 把“统一”误解为“所有 JSON 必须长得完全一样”，忽略资源表示与分页表示本来承担不同语义。

**后果：** 客户端字段路径从 `response.id` 变成 `response.data.id`，与既有合同冲突；额外的 `code` 与
`message` 还可能复制 HTTP 信息。

**错误示例：**

```java
return ResponseEntity.ok(new ApiResponse<>(200, "ok", MemberResponse.from(member)));
```

**正确写法：**

```java
return ResponseEntity.ok(MemberResponse.from(member));
```

**验证方式：** 对单成员响应执行 `jq -e 'has("id") and (has("data") | not)'`；正确响应退出码为 0。

### 把空集合写成 null

**触发条件：** 团队没有成员时，令分页 DTO 的 `items` 等于 null。

**原因：** 没有区分“集合存在但当前为空”和“集合值缺失”。

**后果：** 客户端在遍历前必须增加 null 分支，同一种分页响应出现两套集合语义。

**错误示例：**

```java
return ResponseEntity.ok(new PageResponse<MemberResponse>(null, null));
```

**正确写法：**

```java
return ResponseEntity.ok(new PageResponse<>(List.of(), null));
```

**验证方式：** 请求空团队后执行 `jq -e '.items == [] and .nextPageToken == null'`；不要只检查状态 200。

### 直接把内部模型交给消息转换器

**触发条件：** Controller 返回保存了 `internalNote` 的 `Member`，没有转换为公开响应 DTO。

**原因：** 把当前 Java 对象结构当成长期公开合同，忽略内部字段会随实现变化。

**后果：** 内部备注可能泄露，后续重构内部模型也会意外改变客户端 JSON。

**错误示例：**

```java
/**
 * 演示直接返回内部模型的错误写法。
 *
 * @param memberId 成员 ID
 * @return 未隔离内部字段的成员响应
 */
public ResponseEntity<Member> find(long memberId) {
    return ResponseEntity.ok(members.get(memberId));
}
```

**正确写法：**

```java
/**
 * 演示转换为公开响应 DTO 的正确写法。
 *
 * @param memberId 成员 ID
 * @return 只包含公开字段的成员响应
 */
public ResponseEntity<MemberResponse> find(long memberId) {
    return ResponseEntity.ok(MemberResponse.from(members.get(memberId)));
}
```

**验证方式：** 解析响应并确认根级字段集合只有 `id`、`displayName`、`role`，且不存在 `internalNote`。

### 创建成功仍返回 200 且没有 Location

**触发条件：** 新资源已经生成，却用 `ResponseEntity.ok` 返回创建结果。

**原因：** 只关注 JSON body，没有同时维护状态与响应头。

**后果：** 客户端和监控无法准确识别创建结果，也不能从 `Location` 定位新资源。

**错误示例：**

```java
return ResponseEntity.ok(MemberResponse.from(created));
```

**正确写法：**

```java
URI location = ServletUriComponentsBuilder.fromCurrentRequest()
        .path("/{memberId}")
        .buildAndExpand(created.id())
        .toUri();
return ResponseEntity.created(location).body(MemberResponse.from(created));
```

**验证方式：** 同时断言实际状态为 201、`Location` 以真实新 ID 结尾、body 的 `id` 与该 ID 相同。

### 给 204 返回成功 JSON

**触发条件：** 删除成功后仍尝试返回 `{}`、`null` 文本或成功外壳。

**原因：** 把统一 JSON 当成比 HTTP 无正文语义更高的规则。

**后果：** 方法签名误导维护者；部分框架会丢弃 body，测试若只看状态就无法发现合同混乱。

**错误示例：**

```java
return ResponseEntity.status(204).body(MemberResponse.from(deleted));
```

**正确写法：**

```java
return ResponseEntity.noContent().build();
```

**验证方式：** 使用 curl 同时输出 `%{http_code}` 与 `%{size_download}`，必须得到 `204` 与 `0`。

### 用自动包装提前改写所有 Controller

**触发条件：** 为了“省掉重复代码”，加入 `ResponseBodyAdvice`，或在本课编写全局异常 handler。

**原因：** 没有先冻结各类资源的外部合同，也跨过了成功响应与错误映射的课程边界。

**后果：** `ResponseEntity<Void>`、文件响应、已有资源 JSON 与错误格式可能被统一改写，影响范围远超本课。

**错误示例：**

```java
@ControllerAdvice
public class GlobalResponseWrapper {
    // 自动包装所有 Controller 返回值
}
```

**正确写法：**

```java
/**
 * 查询一页成员并返回固定分页结构。
 *
 * @return 成员分页响应
 */
public ResponseEntity<PageResponse<MemberResponse>> list() {
    return ResponseEntity.ok(new PageResponse<>(items, nextPageToken));
}
```

**验证方式：** 定向检查当前工程没有 `ControllerAdvice`、`ExceptionHandler` 或 `ResponseBodyAdvice`；再按 endpoint
分别验证资源、分页、201 与 204 合同。
:::

## 九、独立练习

### 1. 任务、约束与验收

:::exercise
### 为 TeamFlow 团队邀请实现统一响应

**要求：** 创建独立工程，实现邀请单资源查询、分页查询、创建与删除。内部 Invitation 保存内部备注，
公开 InvitationResponse 只返回 ID、邮箱和状态。分页根级固定为 items 与 nextPageToken；空团队的 items
必须是空数组。创建使用 201、Location 与 InvitationResponse，删除使用无正文的响应。邮箱为空或格式错误时
保留 Bean Validation 的真实 400，不要实现全局异常映射，也不要增加 data、code 或 message 包装。

**验收：** 单邀请响应根级直接含 ID；第一页的 nextPageToken 为 INVITE-PAGE-2；空团队的 items 为空数组；
创建返回 201，且 Location 与 body ID 都是 3；删除返回 204 且 body 为零字节；不存在返回 404；非法邮箱
返回 400；公开 JSON 不含内部备注、data、code 或 message。
:::

### 2. JDK 25 完整参考工程

创建 `teamflow-invitation-response-modern`：

```text
teamflow-invitation-response-modern/
├── pom.xml
└── src/main/
    ├── java/com/teamflow/invitation/
    │   ├── InvitationApplication.java
    │   └── InvitationController.java
    └── resources/application.properties
```

`pom.xml`：

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
  <artifactId>teamflow-invitation-response-modern</artifactId>
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

`src/main/resources/application.properties`：

```properties
spring.application.name=teamflow-invitation-response-modern
```

`src/main/java/com/teamflow/invitation/InvitationApplication.java`：

```java
package com.teamflow.invitation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 启动团队邀请响应练习。
 */
@SpringBootApplication
public class InvitationApplication {

    /**
     * 启动现代版练习应用。
     *
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        SpringApplication.run(InvitationApplication.class, args);
    }
}
```

`src/main/java/com/teamflow/invitation/InvitationController.java`：

```java
package com.teamflow.invitation;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.net.URI;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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
 * 提供团队邀请的统一成功响应。
 */
@RestController
@RequestMapping("/api/v1/teams/{teamId}/invitations")
public class InvitationController {
    private final Map<String, LinkedHashMap<Long, Invitation>> invitationsByTeam =
            new LinkedHashMap<>();
    private long nextId = 3L;

    /**
     * 创建 Controller 并准备分页与空页样本。
     */
    public InvitationController() {
        LinkedHashMap<Long, Invitation> invitations = new LinkedHashMap<>();
        invitations.put(1L, new Invitation(1L, "lead@example.com", "PENDING", "内部邀请人 A"));
        invitations.put(2L, new Invitation(2L, "dev@example.com", "PENDING", "内部邀请人 B"));
        invitationsByTeam.put("TEAM-1", invitations);
        invitationsByTeam.put("TEAM-EMPTY", new LinkedHashMap<>());
    }

    /**
     * 查询一条邀请。
     *
     * @param teamId 团队 ID
     * @param invitationId 邀请 ID
     * @return 邀请资源或 404
     */
    @GetMapping(path = "/{invitationId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<InvitationResponse> find(
            @PathVariable String teamId,
            @PathVariable long invitationId) {
        Invitation invitation = teamInvitations(teamId).get(invitationId);
        if (invitation == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(InvitationResponse.from(invitation));
    }

    /**
     * 查询一页邀请。
     *
     * @param teamId 团队 ID
     * @param pageToken 下一页游标
     * @return 邀请分页响应
     */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PageResponse<InvitationResponse>> list(
            @PathVariable String teamId,
            @RequestParam(required = false) String pageToken) {
        List<Invitation> invitations = new ArrayList<>(teamInvitations(teamId).values());
        int start = "INVITE-PAGE-2".equals(pageToken) ? 1 : 0;
        List<InvitationResponse> items = invitations.stream()
                .skip(start)
                .limit(1)
                .map(InvitationResponse::from)
                .toList();
        String nextPageToken =
                start == 0 && invitations.size() > 1 ? "INVITE-PAGE-2" : null;
        return ResponseEntity.ok(new PageResponse<>(items, nextPageToken));
    }

    /**
     * 创建团队邀请。
     *
     * @param teamId 团队 ID
     * @param request 已通过校验的邀请请求
     * @return 201、Location 与创建后的邀请资源
     */
    @PostMapping(
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<InvitationResponse> create(
            @PathVariable String teamId,
            @Valid @RequestBody CreateInvitationRequest request) {
        long id = nextId++;
        Invitation created = new Invitation(id, request.email(), "PENDING", "仅内部可见");
        teamInvitations(teamId).put(id, created);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{invitationId}")
                .buildAndExpand(id)
                .toUri();
        return ResponseEntity.created(location).body(InvitationResponse.from(created));
    }

    /**
     * 删除团队邀请。
     *
     * @param teamId 团队 ID
     * @param invitationId 邀请 ID
     * @return 删除成功的 204 或资源不存在的 404
     */
    @DeleteMapping("/{invitationId}")
    public ResponseEntity<Void> delete(
            @PathVariable String teamId,
            @PathVariable long invitationId) {
        if (teamInvitations(teamId).remove(invitationId) == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    /**
     * 返回团队邀请表，并为首次出现的团队创建空表。
     *
     * @param teamId 团队 ID
     * @return 团队邀请表
     */
    private LinkedHashMap<Long, Invitation> teamInvitations(String teamId) {
        return invitationsByTeam.computeIfAbsent(teamId, ignored -> new LinkedHashMap<>());
    }

    /**
     * 表示应用内部保存的邀请。
     *
     * @param id 邀请 ID
     * @param email 被邀请邮箱
     * @param status 邀请状态
     * @param internalNote 内部备注
     */
    private record Invitation(long id, String email, String status, String internalNote) {
    }

    /**
     * 表示创建邀请时读取的 JSON 请求。
     *
     * @param email 被邀请邮箱
     */
    public record CreateInvitationRequest(
            @NotBlank(message = "邀请邮箱不能为空")
            @Email(message = "邀请邮箱格式不正确")
            String email) {
    }

    /**
     * 表示客户端可见的邀请资源。
     *
     * @param id 邀请 ID
     * @param email 被邀请邮箱
     * @param status 邀请状态
     */
    public record InvitationResponse(String id, String email, String status) {

        /**
         * 从内部邀请模型创建公开响应。
         *
         * @param invitation 内部邀请模型
         * @return 公开邀请响应
         */
        private static InvitationResponse from(Invitation invitation) {
            return new InvitationResponse(
                    Long.toString(invitation.id()), invitation.email(), invitation.status());
        }
    }

    /**
     * 表示一页邀请资源。
     *
     * @param items 当前页资源
     * @param nextPageToken 下一页游标，没有下一页时为 null
     * @param <T> 资源类型
     */
    public record PageResponse<T>(List<T> items, String nextPageToken) {

        /**
         * 保存当前页列表的不可变快照。
         */
        public PageResponse {
            items = List.copyOf(items);
        }
    }
}
```

在工程根目录执行：

```bash
mvn clean package
java -jar target/teamflow-invitation-response-modern-1.0.0.jar --server.port=8082
```

### 3. Java 8 完整参考工程

创建 `teamflow-invitation-response-java8`，目录与现代练习相同。`pom.xml`：

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
  <artifactId>teamflow-invitation-response-java8</artifactId>
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

`src/main/resources/application.properties`：

```properties
spring.application.name=teamflow-invitation-response-java8
```

`src/main/java/com/teamflow/invitation/InvitationApplication.java`：

```java
package com.teamflow.invitation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 启动 Java 8 团队邀请响应练习。
 */
@SpringBootApplication
public class InvitationApplication {

    /**
     * 启动兼容版练习应用。
     *
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        SpringApplication.run(InvitationApplication.class, args);
    }
}
```

`src/main/java/com/teamflow/invitation/InvitationController.java`：

```java
package com.teamflow.invitation;

import java.net.URI;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import javax.validation.Valid;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
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
 * 提供 Java 8 团队邀请的统一成功响应。
 */
@RestController
@RequestMapping("/api/v1/teams/{teamId}/invitations")
public class InvitationController {
    private final Map<String, LinkedHashMap<Long, Invitation>> invitationsByTeam =
            new LinkedHashMap<>();
    private long nextId = 3L;

    /**
     * 创建 Controller 并准备分页与空页样本。
     */
    public InvitationController() {
        LinkedHashMap<Long, Invitation> invitations = new LinkedHashMap<>();
        invitations.put(1L, new Invitation(1L, "lead@example.com", "PENDING", "内部邀请人 A"));
        invitations.put(2L, new Invitation(2L, "dev@example.com", "PENDING", "内部邀请人 B"));
        invitationsByTeam.put("TEAM-1", invitations);
        invitationsByTeam.put("TEAM-EMPTY", new LinkedHashMap<>());
    }

    /**
     * 查询一条邀请。
     *
     * @param teamId 团队 ID
     * @param invitationId 邀请 ID
     * @return 邀请资源或 404
     */
    @GetMapping(path = "/{invitationId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<InvitationResponse> find(
            @PathVariable String teamId,
            @PathVariable long invitationId) {
        Invitation invitation = teamInvitations(teamId).get(invitationId);
        if (invitation == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(InvitationResponse.from(invitation));
    }

    /**
     * 查询一页邀请。
     *
     * @param teamId 团队 ID
     * @param pageToken 下一页游标
     * @return 邀请分页响应
     */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PageResponse<InvitationResponse>> list(
            @PathVariable String teamId,
            @RequestParam(required = false) String pageToken) {
        List<Invitation> invitations = new ArrayList<>(teamInvitations(teamId).values());
        int start = "INVITE-PAGE-2".equals(pageToken) ? 1 : 0;
        List<InvitationResponse> items = new ArrayList<>();
        if (start < invitations.size()) {
            items.add(InvitationResponse.from(invitations.get(start)));
        }
        String nextPageToken =
                start == 0 && invitations.size() > 1 ? "INVITE-PAGE-2" : null;
        return ResponseEntity.ok(new PageResponse<>(items, nextPageToken));
    }

    /**
     * 创建团队邀请。
     *
     * @param teamId 团队 ID
     * @param request 已通过校验的邀请请求
     * @return 201、Location 与创建后的邀请资源
     */
    @PostMapping(
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<InvitationResponse> create(
            @PathVariable String teamId,
            @Valid @RequestBody CreateInvitationRequest request) {
        long id = nextId++;
        Invitation created = new Invitation(id, request.getEmail(), "PENDING", "仅内部可见");
        teamInvitations(teamId).put(id, created);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{invitationId}")
                .buildAndExpand(id)
                .toUri();
        return ResponseEntity.created(location).body(InvitationResponse.from(created));
    }

    /**
     * 删除团队邀请。
     *
     * @param teamId 团队 ID
     * @param invitationId 邀请 ID
     * @return 删除成功的 204 或资源不存在的 404
     */
    @DeleteMapping("/{invitationId}")
    public ResponseEntity<Void> delete(
            @PathVariable String teamId,
            @PathVariable long invitationId) {
        if (teamInvitations(teamId).remove(invitationId) == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    /**
     * 返回团队邀请表，并为首次出现的团队创建空表。
     *
     * @param teamId 团队 ID
     * @return 团队邀请表
     */
    private LinkedHashMap<Long, Invitation> teamInvitations(String teamId) {
        LinkedHashMap<Long, Invitation> invitations = invitationsByTeam.get(teamId);
        if (invitations == null) {
            invitations = new LinkedHashMap<>();
            invitationsByTeam.put(teamId, invitations);
        }
        return invitations;
    }

    /**
     * 表示应用内部保存的邀请。
     */
    private static final class Invitation {
        private final long id;
        private final String email;
        private final String status;
        private final String internalNote;

        /**
         * 创建内部邀请模型。
         *
         * @param id 邀请 ID
         * @param email 被邀请邮箱
         * @param status 邀请状态
         * @param internalNote 内部备注
         */
        private Invitation(long id, String email, String status, String internalNote) {
            this.id = id;
            this.email = email;
            this.status = status;
            this.internalNote = internalNote;
        }

        /**
         * 返回邀请 ID。
         *
         * @return 邀请 ID
         */
        private long getId() {
            return id;
        }

        /**
         * 返回被邀请邮箱。
         *
         * @return 被邀请邮箱
         */
        private String getEmail() {
            return email;
        }

        /**
         * 返回邀请状态。
         *
         * @return 邀请状态
         */
        private String getStatus() {
            return status;
        }
    }

    /**
     * 表示创建邀请时读取的 JSON 请求。
     */
    public static final class CreateInvitationRequest {

        @NotBlank(message = "邀请邮箱不能为空")
        @Email(message = "邀请邮箱格式不正确")
        private String email;

        /**
         * 创建供 JSON 绑定使用的空请求对象。
         */
        public CreateInvitationRequest() {
        }

        /**
         * 返回被邀请邮箱。
         *
         * @return 被邀请邮箱
         */
        public String getEmail() {
            return email;
        }

        /**
         * 设置被邀请邮箱。
         *
         * @param email 被邀请邮箱
         */
        public void setEmail(String email) {
            this.email = email;
        }
    }

    /**
     * 表示客户端可见的邀请资源。
     */
    public static final class InvitationResponse {
        private final String id;
        private final String email;
        private final String status;

        /**
         * 创建公开邀请响应。
         *
         * @param id 邀请 ID
         * @param email 被邀请邮箱
         * @param status 邀请状态
         */
        public InvitationResponse(String id, String email, String status) {
            this.id = id;
            this.email = email;
            this.status = status;
        }

        /**
         * 从内部邀请模型创建公开响应。
         *
         * @param invitation 内部邀请模型
         * @return 公开邀请响应
         */
        private static InvitationResponse from(Invitation invitation) {
            return new InvitationResponse(
                    String.valueOf(invitation.getId()),
                    invitation.getEmail(),
                    invitation.getStatus());
        }

        /**
         * 返回邀请 ID。
         *
         * @return 邀请 ID
         */
        public String getId() {
            return id;
        }

        /**
         * 返回被邀请邮箱。
         *
         * @return 被邀请邮箱
         */
        public String getEmail() {
            return email;
        }

        /**
         * 返回邀请状态。
         *
         * @return 邀请状态
         */
        public String getStatus() {
            return status;
        }
    }

    /**
     * 表示 Java 8 兼容线的一页邀请资源。
     *
     * @param <T> 资源类型
     */
    public static final class PageResponse<T> {
        private final List<T> items;
        private final String nextPageToken;

        /**
         * 创建分页响应并保存列表的不可变快照。
         *
         * @param items 当前页资源
         * @param nextPageToken 下一页游标，没有下一页时为 null
         */
        public PageResponse(List<T> items, String nextPageToken) {
            this.items = Collections.unmodifiableList(new ArrayList<>(items));
            this.nextPageToken = nextPageToken;
        }

        /**
         * 返回当前页资源。
         *
         * @return 不可变资源列表
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
}
```

在 Java 8 环境中执行：

```bash
mvn clean package
java -jar target/teamflow-invitation-response-java8-1.0.0.jar --server.port=8083
```

### 4. 复跑练习验收矩阵

现代版使用端口 `8082`，Java 8 版使用端口 `8083`。对两个端口分别执行相同请求：

```bash
curl --silent --show-error \
  --write-out '\nstatus=%{http_code}\n' \
  'http://localhost:8082/api/v1/teams/TEAM-1/invitations/1'

curl --silent --show-error \
  --write-out '\nstatus=%{http_code}\n' \
  'http://localhost:8082/api/v1/teams/TEAM-1/invitations'

curl --silent --show-error \
  --write-out '\nstatus=%{http_code}\n' \
  'http://localhost:8082/api/v1/teams/TEAM-EMPTY/invitations'

curl --silent --show-error --include \
  --header 'Content-Type: application/json' \
  --data '{"email":"qa@example.com"}' \
  'http://localhost:8082/api/v1/teams/TEAM-1/invitations'

curl --silent --show-error --output /dev/null \
  --write-out 'status=%{http_code},bytes=%{size_download}\n' \
  --request DELETE \
  'http://localhost:8082/api/v1/teams/TEAM-1/invitations/3'

curl --silent --show-error --output /dev/null \
  --write-out 'not-found=%{http_code}\n' \
  'http://localhost:8082/api/v1/teams/TEAM-1/invitations/999'

curl --silent --show-error --output /dev/null \
  --write-out 'invalid=%{http_code}\n' \
  --header 'Content-Type: application/json' \
  --data '{"email":"not-an-email"}' \
  'http://localhost:8082/api/v1/teams/TEAM-1/invitations'
```

两个版本都应观察到：

```text
单邀请：200 / {"id":"1","email":"lead@example.com","status":"PENDING"}
第一页：200 / items 含邀请 1，nextPageToken 为 INVITE-PAGE-2
空团队：200 / {"items":[],"nextPageToken":null}
创建邀请：201 / Location 以 /invitations/3 结尾，body 的 id 为字符串 "3"
删除邀请：status=204,bytes=0
不存在邀请：not-found=404
非法邮箱：invalid=400
```

把端口改为 `8083` 后结果应保持同形。JSON 属性顺序不属于合同，比较时应解析 JSON，不按原始字符串顺序
比较。

## 十、本课小结

统一接口响应的目标是让客户端能预测结果，而不是让每个 JSON 都套上相同外壳。单资源直接返回公开响应
DTO，分页资源固定使用 `items` 与 `nextPageToken`，空集合固定为 `[]`。内部模型通过明确转换点进入响应
DTO，避免内部字段意外成为公开合同。

HTTP 层继续表达真实结果：查询成功是 `200`，创建成功是 `201` 并携带动态 `Location`，删除成功是没有
body 的 `204`，不存在与校验失败保持 `404` 和 `400`。本课没有改变错误 body，也没有加入全局异常处理。

JDK 25 使用 record 与 `List.copyOf`，Java 8 使用带 getter 的不可变类和不可变列表快照。实现语法不同，
但两条版本线对外暴露相同的资源字段、分页结构、状态、响应头与正文有无。

## 累计项目衔接

累计项目继续使用单资源 DTO 和 `items/nextPageToken` 分页外形，不增加统一成功外壳。用户、团队、成员、项目
和任务各自拥有公开响应类型，现代版与 Java 8 版由共享黑盒矩阵比较外部结果。
