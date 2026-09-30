---
id: backend.java.learn.intermediate.openapi-documentation-and-api-integration
type: lesson
title: OpenAPI 与 Swagger UI
summary: 为已经实现的团队接口生成 OpenAPI 文档，并用 Swagger UI、文档断言和真实请求分别核对接口合同
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 150
prerequisites:
  - backend.java.learn.intermediate.cors-and-frontend-integration
objectives:
  - 能区分运行时 API、OpenAPI 描述与 Swagger UI 的职责。
  - 能从 paths、operation、parameter、requestBody、responses 与 schemas 读出调用合同。
  - 能为 Spring Boot 4.1 项目接入 springdoc-openapi 3.1.0。
  - 能用最少注解补充 operationId、业务说明、示例与真实错误响应。
  - 能同时验证 OpenAPI JSON、Swagger UI 与团队接口的实际响应。
  - 能为两条版本线选择正确的 springdoc 工件，并临时统一输出 OAS 3.0.1。
recap:
  - Spring MVC 映射与 DTO 是运行时事实，springdoc 读取这些事实并生成 OpenAPI 描述。
  - Swagger UI 是 OpenAPI 的交互式客户端，页面能打开不等于业务接口符合文档。
  - operationId 在整份文档中必须唯一，文档响应只能描述运行时已经存在的状态与模型。
  - requestBody 是否必需、对象属性是否必需和属性是否允许 null 是不同合同。
  - 机器断言负责检查文档结构，curl 与 Try it out 负责检查真实 HTTP 行为。
  - springdoc 3.1.0 暂时输出 OAS 3.0，可避开带校验参数在 OAS 3.1 下的 Schema 克隆回退。
  - Boot 4.1 使用 springdoc v3 starter，Boot 2.3 使用 v1 UI 工件；本课两条线都输出 OAS 3.0.1。
related:
  - backend.java.learn.basics.unified-api-contract
  - backend.java.learn.intermediate.user-and-team-api-project
  - backend.java.learn.intermediate.cors-and-frontend-integration
tags:
  - OpenAPI
  - springdoc-openapi
  - Swagger UI
  - Spring MVC
  - 接口文档
  - 接口联调
appliesTo: JDK 25、Spring Boot 4.1.0、springdoc-openapi 3.1.0、临时输出 OpenAPI 3.0.1 主线；Java 8、Spring Boot 2.3.12.RELEASE、springdoc-openapi 1.8.0、OpenAPI 3.0.1 兼容写法
verifiedAt: 2026-08-20
sources:
  - id: spring-boot-41-openapi-system
    title: Spring Boot 4.1 System Requirements
    url: https://docs.spring.io/spring-boot/4.1/system-requirements.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Spring Boot 4.1.0 支持 JDK 25，并要求 Spring Framework 7.0.8 或以上
  - id: springdoc-31-documentation
    title: springdoc-openapi 3 Documentation
    url: https://springdoc.org/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: springdoc-openapi 3.1.0
    claims:
      - Spring MVC UI starter、OpenAPI JSON、YAML 与 Swagger UI 的默认入口
      - Spring MVC 注解、Bean Validation 和 Swagger 注解参与文档生成
  - id: springdoc-31-properties
    title: springdoc-openapi Properties
    url: https://springdoc.org/properties.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: springdoc-openapi 3.1.0
    claims:
      - API 文档路径、Swagger UI 路径、启用状态和排序方式可以通过配置调整
  - id: springdoc-310-release
    title: springdoc-openapi 3.1.0 Release
    url: https://github.com/springdoc/springdoc-openapi/releases/tag/v3.1.0
    sourceOrigin: official
    sourceType: release-note
    appliesTo: springdoc-openapi 3.1.0
    claims:
      - springdoc-openapi 3.1.0 升级到 Spring Boot 4.1.0 并使用 Swagger UI 5.32.11
  - id: springdoc-310-parent-pom
    title: springdoc-openapi 3.1.0 Parent POM
    url: https://repo.maven.apache.org/maven2/org/springdoc/springdoc-openapi/3.1.0/springdoc-openapi-3.1.0.pom
    sourceOrigin: official
    sourceType: source-code
    appliesTo: springdoc-openapi 3.1.0
    claims:
      - 3.1.0 发布工件以 Spring Boot 4.1.0 为父项目并管理对应 Swagger 依赖
  - id: openapi-304-specification
    title: OpenAPI Specification 3.0.4
    url: https://spec.openapis.org/oas/v3.0.4.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: OpenAPI 3.0
    claims:
      - paths、Operation、Parameter、Request Body、Responses 与 Schema 的规范合同
      - operationId 必须在整份 OpenAPI 描述中唯一
  - id: swagger-operation-2252
    title: Swagger Operation 2.2.52 API
    url: https://docs.swagger.io/swagger-core/v2.2.52/apidocs/io/swagger/v3/oas/annotations/Operation.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: swagger-annotations 2.2.52
    claims:
      - Operation 注解可以补充摘要、描述、标签和 operationId
  - id: swagger-api-response-2252
    title: Swagger ApiResponse 2.2.52 API
    url: https://docs.swagger.io/swagger-core/v2.2.52/apidocs/io/swagger/v3/oas/annotations/responses/ApiResponse.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: swagger-annotations 2.2.52
    claims:
      - ApiResponse 注解描述状态码、响应说明、媒体类型与响应 Schema
  - id: swagger-schema-2252
    title: Swagger Schema 2.2.52 API
    url: https://docs.swagger.io/swagger-core/v2.2.52/apidocs/io/swagger/v3/oas/annotations/media/Schema.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: swagger-annotations 2.2.52
    claims:
      - Schema 注解可以补充模型、属性说明与示例
  - id: swagger-ui-configuration
    title: Swagger UI Configuration
    url: https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Swagger UI 5
    claims:
      - Try it out 根据页面中的参数组装并发送真实 HTTP 请求
  - id: spring-boot-2312-openapi-system
    title: Spring Boot 2.3.12 System Requirements
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Spring Boot 2.3.12.RELEASE 支持 Java 8 并使用 Spring Framework 5.2.15.RELEASE
  - id: springdoc-v1-documentation
    title: springdoc-openapi v1 Documentation
    url: https://springdoc.org/v1/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: springdoc-openapi 1.8.0
    claims:
      - Boot 2 使用 springdoc-openapi-ui 旧工件并生成 OpenAPI 3.0 文档
      - v1 与 v3 共享默认文档和 Swagger UI 入口
  - id: springdoc-v1-compatibility
    title: springdoc-openapi v1 Compatibility Matrix
    url: https://springdoc.org/v1/faq.html#_what_is_the_compatibility_matrix_of_springdoc_openapi_with_spring_boot
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: springdoc-openapi v1
    claims:
      - Spring Boot 2.3.x 至少需要 springdoc-openapi 1.4.0，1.8.0 是 v1 最后稳定版
  - id: springdoc-3314-schema-clone-warning
    title: springdoc-openapi issue 3314 - JsonSchema cloning warning
    url: https://github.com/springdoc/springdoc-openapi/issues/3314
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: springdoc-openapi 3.1.0、OpenAPI 3.1、带 Bean Validation 约束的查询参数
    claims:
      - 3.1.0 克隆带校验约束的 OAS 3.1 查询参数 Schema 时会发生 JsonSchema type 转换警告
      - 克隆失败后会回退到共享 Schema；临时输出 OAS 3.0 可以避开该路径
---

# OpenAPI 与 Swagger UI

TeamFlow 的团队接口已经能分页、查询和创建资源，错误响应也已经统一。调用方仍需要翻阅代码或询问后端，
才能知道路径、参数、请求体和可能返回的状态。OpenAPI 把这些已经存在的 HTTP 事实组织成机器可读描述，
Swagger UI 再把描述变成可浏览、可试调的页面。

本课继续使用前课的 `/api/v1/teams` 合同，只增加文档能力，不重新设计 Controller、DTO、Service 或错误
响应。项目与任务资源留给下一课；认证、网关、代码生成、契约差异检查和生产暴露策略也不在本课展开。

## 一、分清三条反馈路径

### 1. 运行时 API 是事实来源

Spring MVC 的映射决定请求能否到达方法，DTO 与 Bean Validation 决定输入形状，Controller、Service 和
advice 决定真实状态、响应头与 body。给方法增加文档注解不会创建新路由，也不会让不存在的 404 自动出现。

```text
HTTP 请求 -> Spring MVC -> Controller / Service / advice -> HTTP 响应
                         |
                         +-> springdoc 读取映射、类型与注解 -> OpenAPI 描述
                                                              |
                                                              +-> Swagger UI
```

因此应先实现并验证业务接口，再让文档准确描述它。OpenAPI 是合同的可读投影，不是第二套业务实现。

### 2. OpenAPI 描述供工具读取

默认 JSON 入口是 `/v3/api-docs`，YAML 入口是 `/v3/api-docs.yaml`。描述中的关键对象可以沿下面的顺序读取：

| 层级 | 回答的问题 | TeamFlow 示例 |
| --- | --- | --- |
| `info` | 这是什么 API | TeamFlow API、版本 1.0.0 |
| `paths` | 有哪些路径 | `/api/v1/teams` |
| operation | 允许什么方法 | `get`、`post` |
| `parameters` | 非 body 输入放在哪里 | `pageSize` 在 query |
| `requestBody` | body 是否必需、使用什么媒体类型 | 创建团队的 JSON |
| `responses` | 每种状态返回什么 | 201、400、415 |
| `components.schemas` | 请求和响应的字段结构 | `CreateTeamRequest` |

例如下面的命令直接读取创建团队 operation，而不是在整份 JSON 中搜索字符串：

```bash
curl -fsS http://localhost:8080/v3/api-docs \
  | jq '.paths["/api/v1/teams"].post'
```

### 3. Swagger UI 是实际 HTTP 客户端

访问 `/swagger-ui.html` 后，页面会读取 OpenAPI 描述并按 tag 展示 operation。点击 Try it out 和 Execute
会向当前服务发送真实请求；创建接口会真的新增团队，失败请求也会进入真实校验和异常处理链。

页面能加载，只证明 UI 静态资源与文档入口可用。它不能代替对 JSON 结构的机器断言，也不能代替对业务路径
的 curl 验收。浏览器中看不到 operation 时，应先检查 `/v3/api-docs` 是否包含目标 path，再检查 UI 获取的
文档 URL，而不是先修改 Controller 路由。

## 二、让依赖与 Spring Boot 代际匹配

### 1. Boot 4.1 使用 springdoc v3 starter

打开前课现代工程的 `pom.xml`，在现有 `webmvc` 与 `validation` starter 之后增加：

```xml
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
  <version>3.1.0</version>
</dependency>
```

重新执行 `mvn clean package`。这个 starter 同时提供 OpenAPI 生成器与 Swagger UI；不需要再手工添加
swagger-core、swagger-annotations 或 Swagger UI webjar。现代线继续使用 JDK 25 和 Boot 4.1.0。

### 2. Boot 2.3 使用 springdoc v1 工件

打开 Java 8 兼容工程的 `pom.xml`，增加独立的旧线工件：

```xml
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-ui</artifactId>
  <version>1.8.0</version>
</dependency>
```

`springdoc-openapi-ui` 是 Boot 2 时代的工件，不能把现代 starter 名称复制到兼容工程。反过来，Boot 4.1
也不能继续使用 v1 工件。两条线的 Java 源码都导入 `io.swagger.v3.oas.annotations`，但依赖坐标和默认
OpenAPI 版本不同。

### 3. 默认入口相同，本课统一输出 3.0.1

两条线都提供以下入口：

```text
/v3/api-docs
/v3/api-docs.yaml
/swagger-ui.html
```

`/swagger-ui.html` 会返回 302 并跳转到 `/swagger-ui/index.html`，跟随跳转后才是页面 HTML。现代 v3
默认生成 OpenAPI 3.1，兼容 v1 默认生成 OpenAPI 3.0；但本课现代线需要规避后文说明的 #3314，因此打开
`src/main/resources/application.properties`，加入：

```properties
# springdoc 3.1.0 的 OAS 3.1 参数 Schema 克隆存在 #3314，修复发布后再移除。
springdoc.api-docs.version=OPENAPI_3_0
```

此时两条线都输出 OpenAPI 3.0.1，path、operation、参数与响应合同可以使用同一组断言。配置只改变生成的
文档版本，不会删除 `@Min`、`@Max` 或改变 Spring MVC 的运行时校验。若项目需要修改入口，可以使用
`springdoc.api-docs.path` 与 `springdoc.swagger-ui.path`；本课保留默认路径。

## 三、从代码事实生成第一份文档

### 1. 定义 API 身份

在两个工程各自创建 `src/main/java/com/teamflow/OpenApiConfiguration.java`：

```java
package com.teamflow;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

/**
 * 定义 TeamFlow 对外文档的稳定身份。
 */
@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "TeamFlow API",
                version = "1.0.0",
                description = "团队协作接口"))
public class OpenApiConfiguration {
}
```

`@OpenAPIDefinition` 补充整份文档的身份，不改变应用名、Controller 基础路径或服务端口。启动后可以这样
核对根信息：

```bash
curl -fsS http://localhost:8080/v3/api-docs \
  | jq -e '.info.title == "TeamFlow API" and .info.version == "1.0.0"'
```

### 2. 先依赖自动推导，再补业务语义

springdoc 能从 `@RequestMapping`、`@GetMapping`、`@PostMapping`、方法参数、返回类型和 Bean Validation
推导大量结构。文档注解只补代码无法稳定表达的内容：

- `@Tag` 为一组 operation 提供业务分组；
- `@Operation` 提供摘要和全局唯一的 operationId；
- `@Parameter` 提供调用者需要的说明与示例；
- `@ApiResponse` 列出运行时真实存在的成功和失败响应；
- `@Schema` 为公开 DTO 补充字段说明与示例。

不要给每个能自动推导的字段重复写一遍注解。重复信息越多，Controller 变更时越容易留下过期描述。

### 3. required 不是一个开关

创建团队时至少有三个独立问题：

1. 整个 JSON body 是否必须出现，由 `requestBody.required` 表达。
2. body 出现后 `name` 属性是否必须出现，由对象 Schema 的 `required` 数组表达。
3. `name` 出现后能否为空白，由运行时 `@NotBlank` 校验并在 Schema 中形成约束提示。

```bash
jq -e '
  .paths["/api/v1/teams"].post.requestBody.required == true and
  (.components.schemas.CreateTeamRequest.required | index("name") != null)
' openapi-modern.json
```

OpenAPI 文档不会执行 `@NotBlank`。仍要发送 `{"name":" "}`，确认真实服务返回 400；只有文档结构和
运行时反馈同时成立，调用者才能正确理解这个输入合同。

**社区补充：** springdoc-openapi 3.1.0 的开放 issue `#3314` 记录了一个可复现的版本问题：OAS 3.1 模式下，
带 `@Min`、`@Max` 等约束的查询参数会让 `SpringDocUtils` 在克隆 `JsonSchema` 时发生
`Json Processing Exception occurred` WARN。异常被捕获后，springdoc 会回退到原来的共享 Schema；文档请求
仍可能返回 200，当前参数上下界也可能看似正确，但独立副本已经没有建立。本课在 Boot 4.1.0、3.1.0 和
`pageSize` 约束上复现了回退，再设置 `springdoc.api-docs.version=OPENAPI_3_0`，确认文档输出 3.0.1、
上下界保留且 WARN 消失。修复进入稳定版本后，应移除临时配置并从默认 OAS 3.1 重跑同一反馈环。

## 四、为团队接口补齐稳定说明

### 1. 标记公开 DTO

现代工程中，打开前课 `TeamFlowApplication`，给已经存在的两个 record 增加 `@Schema`。字段校验和转换逻辑
保持不变：

```java
/** 创建团队请求。 */
@Schema(name = "CreateTeamRequest", description = "创建团队的输入")
record CreateTeamRequest(
        @NotBlank(message = "团队名称不能为空")
        @Size(max = 60, message = "团队名称最多 60 个字符")
        @Schema(description = "团队名称", example = "文档体验组")
        String name) {
}

/** 团队公开响应。 */
@Schema(name = "TeamResponse", description = "团队公开信息")
record TeamResponse(
        @Schema(description = "团队 ID", example = "TEAM-1") String id,
        @Schema(description = "团队名称", example = "课程平台组") String name) {
    /** 从内部团队生成公开响应。 */
    static TeamResponse from(Team team) {
        return new TeamResponse(team.id(), team.name());
    }
}
```

补充导入：

```java
import io.swagger.v3.oas.annotations.media.Schema;
```

Controller 返回的仍是 `TeamResponse`，所以内部 `Team.internalNote` 不会进入公开 Schema。文档注解不能用来
掩盖错误的返回类型；若 Controller 直接返回内部实体，应先修正运行时 DTO 边界。

### 2. 描述分页、单项查询与创建

在现代 `TeamController` 上增加以下注解。方法体继续调用前课的 `ApiService`，没有复制业务规则：

```java
/** 提供团队资源。 */
@Tag(name = "Teams", description = "团队查询与创建")
@RestController
@RequestMapping("/api/v1/teams")
static final class TeamController {
    private final ApiService service;

    /** 创建团队 Controller。 */
    TeamController(ApiService service) {
        this.service = service;
    }

    /** 查询一页团队。 */
    @Operation(summary = "查询团队列表", operationId = "listTeams")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    PageResponse<TeamResponse> list(
            @Parameter(description = "每页数量，范围 1 到 50", example = "20")
            @RequestParam(defaultValue = "20")
            @Min(value = 1, message = "pageSize 最小为 1")
            @Max(value = 50, message = "pageSize 最大为 50")
            int pageSize,
            @Parameter(description = "上一页返回的不透明 token")
            @RequestParam(required = false) String pageToken) {
        return service.listTeams(pageSize, pageToken);
    }

    /** 查询一个团队。 */
    @Operation(summary = "查询一个团队", operationId = "getTeam")
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "查询成功",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = TeamResponse.class))),
        @ApiResponse(
                responseCode = "404",
                description = "团队不存在",
                content = @Content(
                        mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class)))
    })
    @GetMapping(path = "/{teamId}", produces = MediaType.APPLICATION_JSON_VALUE)
    TeamResponse get(
            @Parameter(description = "团队 ID", required = true, example = "TEAM-1")
            @PathVariable("teamId") String teamId) {
        return TeamResponse.from(service.findTeam(teamId));
    }

    /** 创建团队。 */
    @Operation(summary = "创建团队", operationId = "createTeam")
    @ApiResponses({
        @ApiResponse(
                responseCode = "201",
                description = "创建成功",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = TeamResponse.class))),
        @ApiResponse(
                responseCode = "400",
                description = "输入校验失败",
                content = @Content(
                        mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(
                responseCode = "415",
                description = "请求媒体类型不受支持",
                content = @Content(
                        mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class)))
    })
    @PostMapping(
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<TeamResponse> create(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "团队名称",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = CreateTeamRequest.class)))
            @Valid @RequestBody CreateTeamRequest request) {
        Team team = service.createTeam(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{teamId}")
                .buildAndExpand(team.id())
                .toUri();
        return ResponseEntity.created(location).body(TeamResponse.from(team));
    }
}
```

新增的导入是：

```java
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ProblemDetail;
```

这里明确列出的 404、400 与 415 都已经由前课运行时实现。每个响应都显式绑定真实媒体类型与 Schema，避免
springdoc 把方法的成功返回类型误用到失败响应。注解只描述结果，不改变原来的 Problem Details 字段、
Content-Type 或状态选择。

### 3. Java 8 只替换真实差异

兼容工程的普通 JavaBean 保持 getter、setter 与 `javax.validation` 注解。给类和字段增加同一组 `@Schema`
说明即可：

```java
/** 创建团队请求。 */
@Schema(name = "CreateTeamRequest", description = "创建团队的输入")
static final class CreateTeamRequest {
    @NotBlank(message = "团队名称不能为空")
    @Size(max = 60, message = "团队名称最多 60 个字符")
    @Schema(description = "团队名称", example = "文档体验组")
    private String name;

    /** 创建空请求对象供 JSON 绑定。 */
    public CreateTeamRequest() {
    }

    /** 返回团队名称。 */
    public String getName() {
        return name;
    }

    /** 更新团队名称。 */
    public void setName(String name) {
        this.name = name;
    }
}
```

兼容 `TeamController` 使用与现代版相同的 `@Tag`、`@Operation`、`@Parameter`、`@ApiResponse` 与
`@io.swagger.v3.oas.annotations.parameters.RequestBody`。失败响应的 `mediaType` 仍是
`application/problem+json`，但将现代线的 `ProblemDetail.class` 替换为前课已有的 `ApiProblem.class`。
保留类型级 `@Validated`、非 `final` Controller、JavaBean getter 和 `javax.validation` import；不要为了接入
文档改变兼容线的运行时校验路径。

## 五、完成双版本文档反馈环

### 1. 构建并启动两个工程

现代工程：

```bash
cd teamflow-user-team-api-modern
mvn clean package
java -jar target/teamflow-user-team-api-modern-1.0.0.jar --server.port=8080
```

兼容工程在另一个终端运行：

```bash
cd teamflow-user-team-api-java8
mvn clean package
java -jar target/teamflow-user-team-api-java8-1.0.0.jar --server.port=8081
```

两个进程都出现 `Started TeamFlowApplication` 后再发请求。若文档端点是 404，先用
`mvn dependency:tree` 核对当前工程实际解析的 springdoc 工件，不要通过随机更换版本掩盖坐标错误。

### 2. 保存并断言机器文档

```bash
curl -fsS http://localhost:8080/v3/api-docs -o openapi-modern.json
curl -fsS http://localhost:8081/v3/api-docs -o openapi-java8.json
curl -fsS http://localhost:8080/v3/api-docs.yaml -o openapi-modern.yaml
curl -fsS http://localhost:8081/v3/api-docs.yaml -o openapi-java8.yaml
```

先确认两条线都输出规避后的 3.0.1，再检查共享业务合同和失败响应 Schema：

```bash
jq -e '.openapi == "3.0.1"' openapi-modern.json
jq -e '.openapi == "3.0.1"' openapi-java8.json

for document in openapi-modern.json openapi-java8.json; do
  jq -e '
    .paths["/api/v1/teams"].get.operationId == "listTeams" and
    .paths["/api/v1/teams"].post.operationId == "createTeam" and
    .paths["/api/v1/teams/{teamId}"].get.operationId == "getTeam" and
    .paths["/api/v1/teams"].post.requestBody.required == true and
    (.paths["/api/v1/teams"].post.responses | has("201")) and
    (.paths["/api/v1/teams"].post.responses | has("400")) and
    (.paths["/api/v1/teams"].post.responses | has("415")) and
    (.paths["/api/v1/teams"].post.responses["400"].content
      | has("application/problem+json")) and
    (.paths["/api/v1/teams"].post.responses["415"].content
      | has("application/problem+json")) and
    (.paths["/api/v1/teams/{teamId}"].get.responses["404"].content
      | has("application/problem+json")) and
    (.paths["/api/v1/teams/{teamId}"].get.parameters[]
      | select(.name == "teamId" and .in == "path" and .required == true))
  ' "$document"
done

jq -e '
  (.paths["/api/v1/teams"].post.responses["400"]
    .content["application/problem+json"].schema."$ref" | endswith("/ProblemDetail")) and
  (.paths["/api/v1/teams/{teamId}"].get.responses["404"]
    .content["application/problem+json"].schema."$ref" | endswith("/ProblemDetail")) and
  (.paths["/api/v1/teams"].post.responses["415"]
    .content["application/problem+json"].schema."$ref" | endswith("/ProblemDetail"))
' openapi-modern.json

jq -e '
  (.paths["/api/v1/teams"].post.responses["400"]
    .content["application/problem+json"].schema."$ref" | endswith("/ApiProblem")) and
  (.paths["/api/v1/teams/{teamId}"].get.responses["404"]
    .content["application/problem+json"].schema."$ref" | endswith("/ApiProblem")) and
  (.paths["/api/v1/teams"].post.responses["415"]
    .content["application/problem+json"].schema."$ref" | endswith("/ApiProblem"))
' openapi-java8.json
```

第一组断言不依赖自动生成的组件名，锁定调用者依赖的根版本、method、path、operationId、请求体、响应状态和
失败媒体类型。后两组再分别确认现代 400、404、415 引用 `ProblemDetail`，兼容线引用 `ApiProblem`，不能
引用成功响应 `TeamResponse`。

### 3. 对照真实团队响应

分别把端口替换为 8080 和 8081，复跑前课的五类结果：

```bash
curl -i 'http://localhost:8080/api/v1/teams?pageSize=1'
curl -i http://localhost:8080/api/v1/teams/TEAM-404
curl -i -X POST http://localhost:8080/api/v1/teams \
  -H 'Content-Type: application/json' \
  -d '{"name":"文档体验组"}'
curl -i -X POST http://localhost:8080/api/v1/teams \
  -H 'Content-Type: application/json' \
  -d '{"name":" "}'
curl -i -X POST http://localhost:8080/api/v1/teams \
  -H 'Content-Type: text/plain' \
  -d 'wrong media type'
```

预期依次为 200、404、201、400 与 415；404、400、415 的 `Content-Type` 都是
`application/problem+json`。201 响应仍有 `/api/v1/teams/TEAM-2` 形式的 Location，body 仍只包含 `id`
与 `name`。文档新增前后，这些运行时事实都不能变化。

### 4. 打开 Swagger UI 完成人工核对

先用 HTTP 确认 UI 入口可跟随到页面：

```bash
curl -fsSL http://localhost:8080/swagger-ui.html \
  | rg '<title>Swagger UI</title>'
curl -fsSL http://localhost:8081/swagger-ui.html \
  | rg '<title>Swagger UI</title>'
```

浏览器中依次核对 `Teams` 分组、三个 operationId、创建请求示例和响应状态。展开 400、404、415，确认媒体类型
都是 `application/problem+json`，现代页面显示 `ProblemDetail`，兼容页面显示 `ApiProblem`。对
`createTeam` 点击 Try it out，提交 `{"name":"页面联调组"}`；页面应显示 201、Location 和团队 JSON。再提交
空白名称，确认真实 400。这两次操作会改变内存状态，验证后重启服务即可恢复前课的初始数据。

## 六、集中排查五类文档错误

### 五个典型错误

:::pitfalls
### 只检查 Swagger UI 能否打开

**触发条件：** 只访问 `/swagger-ui.html`，看到页面后就宣称接口文档正确。

**原因：** UI 静态资源、OpenAPI 描述与业务 Controller 是三条独立反馈路径。

**后果：** 页面可能存在，但目标 path、失败响应或真实运行结果仍然缺失。

**错误示例：**

```bash
curl -fsSL http://localhost:8080/swagger-ui.html >/dev/null
```

**正确写法：**

```bash
curl -fsS http://localhost:8080/v3/api-docs \
  | jq -e '.paths["/api/v1/teams"].post.responses["201"]'
curl -i -X POST http://localhost:8080/api/v1/teams \
  -H 'Content-Type: application/json' -d '{"name":"验收组"}'
```

**验证方式：** UI 页面、文档结构和真实 201 三项分别通过，删除 201 描述时文档断言能够独立失败。

### 用 ApiResponse 注解实现错误处理

**触发条件：** Controller 原本没有 404 行为，却只增加 `@ApiResponse(responseCode = "404")`。

**原因：** Swagger 注解只生成说明，不会抛异常、选择状态或创建错误 body。

**后果：** 文档承诺 404，运行时仍可能返回 200、500 或另一种错误结构。

**错误示例：**

```java
/** 错误示例：查询一个团队，但只补文档说明而没有实现缺失资源行为。 */
@ApiResponse(responseCode = "404", description = "团队不存在")
@GetMapping("/{teamId}")
TeamResponse get(@PathVariable String teamId) {
    return null;
}
```

**正确写法：**

```java
/** 查询一个团队，缺失资源仍由既有 Service 与 advice 处理。 */
@ApiResponse(
        responseCode = "404",
        description = "团队不存在",
        content = @Content(
                mediaType = "application/problem+json",
                schema = @Schema(implementation = ProblemDetail.class)))
@GetMapping("/{teamId}")
TeamResponse get(@PathVariable String teamId) {
    return TeamResponse.from(service.findTeam(teamId));
}
```

**验证方式：** 请求 `TEAM-404` 得到前课定义的 404 Problem Details，同时 OpenAPI 对应 operation 包含 404。

### 复制 operationId

**触发条件：** 多个方法都使用便于复制的 `operationId = "teamOperation"`。

**原因：** operationId 在整份 OpenAPI 描述中是区分大小写的全局唯一标识，不只在同一 tag 内唯一。

**后果：** 调用者和代码生成工具无法稳定区分列表、查询与创建操作。

**错误示例：**

```java
@Operation(operationId = "teamOperation")
```

**正确写法：**

```java
@Operation(operationId = "listTeams")
```

**验证方式：** 提取所有 operationId，排序后确认总数等于去重后的总数，并逐项找到三个团队 operation。

### 混用 springdoc 工件代际

**触发条件：** Boot 4.1 使用 `springdoc-openapi-ui:1.8.0`，或 Boot 2.3 复制 v3 starter。

**原因：** springdoc v3 与 v1 面向不同 Spring Boot、Spring Framework 和 Jakarta / Javax 代际。

**后果：** Maven 无法形成兼容运行时，应用启动失败或文档端点不可用。

**错误示例：**

```xml
<artifactId>springdoc-openapi-ui</artifactId>
<version>1.8.0</version>
```

**正确写法：**

```xml
<artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
<version>3.1.0</version>
```

**验证方式：** 现代工程解析 v3 starter，Java 8 工程解析 v1 UI 工件；本课配置下两者都输出 3.0.1 文档。

### 忽略错误响应 Schema

**触发条件：** 只声明 400 的状态与描述，没有显式绑定错误媒体类型和 Schema。

**原因：** 方法返回 `ResponseEntity<TeamResponse>`，springdoc 可能把成功类型推导到所有显式响应。

**后果：** Swagger UI 会把 400 错误展示成团队成功响应，调用者据此实现错误解析逻辑。

**错误示例：**

```java
@ApiResponse(responseCode = "400", description = "输入校验失败")
```

**正确写法：**

```java
@ApiResponse(
        responseCode = "400",
        description = "输入校验失败",
        content = @Content(
                mediaType = "application/problem+json",
                schema = @Schema(implementation = ProblemDetail.class)))
```

**验证方式：** 现代文档的 400 引用 `ProblemDetail`，兼容文档的 400 引用 `ApiProblem`，两者都不引用
`TeamResponse`。
:::

## 七、独立练习

:::exercise
### 为查询单个团队补齐可验证文档

**要求：** 为 `GET /api/v1/teams/{teamId}` 保留唯一 operationId，说明必填 path 参数，并准确描述 200 与
404；不能修改 Service、异常处理或公开响应字段。

**验收：** 两条版本线的 OpenAPI 都包含 `getTeam`、必填的 `teamId`、200 与 404；真实请求 `TEAM-1`
返回 200，`TEAM-404` 返回既有 404 错误合同；Swagger UI 能用同一参数分别执行两次请求。
:::

### 1. 完整参考实现

现代 `TeamController` 使用下面的响应声明；Java 8 版本只把 `ProblemDetail.class` 替换为
`ApiProblem.class`，方法体保持各版本前课写法：

```java
/** 查询一个团队。 */
@Operation(summary = "查询一个团队", operationId = "getTeam")
@ApiResponses({
    @ApiResponse(
            responseCode = "200",
            description = "查询成功",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TeamResponse.class))),
    @ApiResponse(
            responseCode = "404",
            description = "团队不存在",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
})
@GetMapping(path = "/{teamId}", produces = MediaType.APPLICATION_JSON_VALUE)
TeamResponse get(
        @Parameter(description = "团队 ID", required = true, example = "TEAM-1")
        @PathVariable("teamId") String teamId) {
    return TeamResponse.from(service.findTeam(teamId));
}
```

再执行同一份验收脚本，只替换端口：

```bash
document=$(mktemp /tmp/teamflow-openapi.XXXXXX)
curl -fsS http://localhost:8080/v3/api-docs -o "$document"
jq -e '
  .paths["/api/v1/teams/{teamId}"].get.operationId == "getTeam" and
  (.paths["/api/v1/teams/{teamId}"].get.responses | has("200")) and
  (.paths["/api/v1/teams/{teamId}"].get.responses | has("404")) and
  (.paths["/api/v1/teams/{teamId}"].get.responses["404"].content
    | has("application/problem+json")) and
  (.paths["/api/v1/teams/{teamId}"].get.parameters[]
    | select(.name == "teamId" and .in == "path" and .required == true))
' "$document"
curl -fsS http://localhost:8080/api/v1/teams/TEAM-1 \
  | jq -e '.id == "TEAM-1" and has("internalNote") == false'
status=$(curl -sS -o /dev/null -w '%{http_code}' \
  http://localhost:8080/api/v1/teams/TEAM-404)
test "$status" = "404"
find "$document" -delete
```

### 2. 预期反馈

`jq` 返回成功，已有团队只公开 `id` 与 `name`，缺失团队返回 404。把 404 `@ApiResponse` 暂时删除并重启
后，真实缺失请求仍然是 404，但文档结构断言失败；恢复注解后两条反馈再次同时通过。这证明文档描述与运行时
行为有关联，却不会互相替代。

## 八、本课小结

- 先实现并验证 Spring MVC 合同，再让 springdoc 生成它的机器可读投影。
- `/v3/api-docs` 用于结构断言，Swagger UI 用于阅读和真实试调，两者都不能代替业务请求验收。
- 文档注解只补自动推导缺少的业务语义，不能实现状态码、校验或错误处理。
- Boot 4.1 与 Boot 2.3 使用不同 springdoc 工件；本课临时统一输出 OAS 3.0.1，并共享同一团队 HTTP 合同。
- 每次接口变化都应一起复跑文档结构、UI 展示和真实响应三条反馈路径。

## 累计项目衔接

累计项目的 `/v3/api-docs` 同时描述用户、团队、成员、项目、任务与附件路径。两版使用各自匹配的 springdoc
工件，并显式声明创建 `201` 与删除 `204`；门禁会把这些响应声明与真实请求一起检查。
