---
id: backend.java.learn.intermediate.openapi-documentation-and-api-integration
type: lesson
title: OpenAPI、接口文档与接口联调
summary: 用 OpenAPI 3.1 描述 Spring MVC 接口，并分别验证文档结构、Swagger UI 与真实 HTTP 请求
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 120
prerequisites:
  - backend.java.learn.intermediate.controller-testing-mockmvc-and-test-slices
objectives:
  - 能解释 OpenAPI 描述、Swagger UI 与运行时 API 的区别。
  - 能读懂 path、operation、parameter、requestBody、response 与 schema。
  - 能在 Spring Boot 4.1 项目中生成 OpenAPI 3.1 文档。
  - 能分开判断属性是否必需和是否允许 null。
  - 能用机器断言与 curl 复核文档和真实响应。
  - 能识别 Boot 2.3、springdoc v1 的旧 artifact 与 OAS 3.0 边界。
related:
  - backend.java.learn.intermediate.errors-results-and-logging
tags:
  - OpenAPI
  - springdoc-openapi
  - Swagger UI
  - 接口联调
appliesTo: Java 25、Spring Boot 4.1.0、springdoc-openapi 3.1.0；项目补充适用于 Java 8、Spring Boot 2.3.12.RELEASE、springdoc-openapi 1.8.0
modernBaseline:
  java: "25"
  springBoot: 4.1.0
  springFramework: 7.0.8
  springdocOpenapi: 3.1.0
  openapi: 3.1.x
legacyBaseline:
  java: "8"
  springBoot: 2.3.12.RELEASE
  springFramework: 5.2.15.RELEASE
  springdocOpenapi: 1.8.0
  openapi: "3.0"
verifiedAt: 2026-08-16
sources:
  - id: boot-410-system
    title: Spring Boot 4.1 System Requirements
    url: https://docs.spring.io/spring-boot/4.1/system-requirements.html
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Spring Boot 4.1.0 支持 Java 17 至 26，并要求 Spring Framework 7.0.8 或更高
  - id: springdoc-310-release
    title: springdoc-openapi 3.1.0 Release
    url: https://github.com/springdoc/springdoc-openapi/releases/tag/v3.1.0
    sourceType: release-note
    appliesTo: springdoc-openapi 3.1.0
    claims:
      - 3.1.0 对齐 Spring Boot 4.1.0、swagger-core 2.2.52 与 Swagger UI 5.32.11
  - id: springdoc-310-parent
    title: springdoc-openapi 3.1.0 Parent POM
    url: https://repo.maven.apache.org/maven2/org/springdoc/springdoc-openapi/3.1.0/springdoc-openapi-3.1.0.pom
    sourceType: source-code
    appliesTo: springdoc-openapi 3.1.0
    claims:
      - 发布工件精确继承 Spring Boot 4.1.0 并管理 Swagger 依赖版本
  - id: springdoc-310-webmvc-ui
    title: springdoc-openapi Web MVC UI 3.1.0 POM
    url: https://repo.maven.apache.org/maven2/org/springdoc/springdoc-openapi-starter-webmvc-ui/3.1.0/springdoc-openapi-starter-webmvc-ui-3.1.0.pom
    sourceType: source-code
    appliesTo: springdoc-openapi 3.1.0
    claims:
      - Boot 4 MVC 项目使用 springdoc-openapi-starter-webmvc-ui
  - id: springdoc-current
    title: springdoc-openapi 3 Documentation
    url: https://springdoc.org/
    sourceType: official-reference
    appliesTo: springdoc-openapi 3.1.0
    claims:
      - JSON、YAML 文档与 Swagger UI 的默认端点和最小依赖
  - id: springdoc-properties
    title: springdoc-openapi Properties
    url: https://springdoc.org/properties.html
    sourceType: official-reference
    appliesTo: springdoc-openapi 3.1.0
    claims:
      - OpenAPI 版本、文档端点和 Swagger UI 的配置面
  - id: oas-311
    title: OpenAPI Specification 3.1.1
    url: https://spec.openapis.org/oas/v3.1.1.html
    sourceType: specification
    appliesTo: OpenAPI 3.1.1
    claims:
      - OpenAPI Object、Path、Operation、Parameter、Request Body、Responses 与 Schema 合同
  - id: json-schema-2020-12-validation
    title: JSON Schema Draft 2020-12 Validation
    url: https://json-schema.org/draft/2020-12/json-schema-validation.html
    sourceType: specification
    appliesTo: JSON Schema Draft 2020-12
    claims:
      - type 数组、null 类型与对象 required 关键字的语义
  - id: swagger-operation-2252
    title: Swagger Operation 2.2.52 API
    url: https://docs.swagger.io/swagger-core/v2.2.52/apidocs/io/swagger/v3/oas/annotations/Operation.html
    sourceType: api-doc
    appliesTo: swagger-annotations 2.2.52
    claims:
      - Operation 注解的摘要、描述、operationId 和响应声明
  - id: swagger-schema-2252
    title: Swagger Schema 2.2.52 API
    url: https://docs.swagger.io/swagger-core/v2.2.52/apidocs/io/swagger/v3/oas/annotations/media/Schema.html
    sourceType: api-doc
    appliesTo: swagger-annotations 2.2.52
    claims:
      - Schema 注解的描述、类型、requiredMode 与 nullable 配置
  - id: swagger-api-response-2252
    title: Swagger ApiResponse 2.2.52 API
    url: https://docs.swagger.io/swagger-core/v2.2.52/apidocs/io/swagger/v3/oas/annotations/responses/ApiResponse.html
    sourceType: api-doc
    appliesTo: swagger-annotations 2.2.52
    claims:
      - ApiResponse 注解的状态码、描述、媒体类型与响应模型
  - id: swagger-ui-config
    title: Swagger UI Configuration
    url: https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/
    sourceType: official-reference
    appliesTo: Swagger UI
    claims:
      - Try it out 会组装并提交真实 HTTP 请求
  - id: boot-2312-system
    title: Spring Boot 2.3.12 System Requirements
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - 旧线支持 Java 8，并要求 Spring Framework 5.2.15.RELEASE 或更高
  - id: springdoc-v1
    title: springdoc-openapi v1 Documentation
    url: https://springdoc.org/v1/
    sourceType: official-reference
    appliesTo: springdoc-openapi 1.8.0
    claims:
      - Boot 1 和 Boot 2 的旧 artifact、默认端点与默认 OpenAPI 3.0 输出
  - id: springdoc-v1-faq
    title: springdoc-openapi v1 Compatibility Matrix
    url: https://springdoc.org/v1/faq.html#_what_is_the_compatibility_matrix_of_springdoc_openapi_with_spring_boot
    sourceType: official-reference
    appliesTo: springdoc-openapi v1
    claims:
      - Boot 2.3.x 的最低 springdoc 版本是 1.4.0，1.8.0 是 v1 最后稳定版
  - id: springdoc-180-parent
    title: springdoc-openapi 1.8.0 Parent POM
    url: https://repo.maven.apache.org/maven2/org/springdoc/springdoc-openapi/1.8.0/springdoc-openapi-1.8.0.pom
    sourceType: source-code
    appliesTo: springdoc-openapi 1.8.0
    claims:
      - 旧线发布工件管理 swagger-core 2.2.20 与 Swagger UI 5.11.8
  - id: springdoc-180-ui
    title: springdoc-openapi UI 1.8.0 POM
    url: https://repo.maven.apache.org/maven2/org/springdoc/springdoc-openapi-ui/1.8.0/springdoc-openapi-ui-1.8.0.pom
    sourceType: source-code
    appliesTo: springdoc-openapi 1.8.0
    claims:
      - Boot 2 MVC 使用 springdoc-openapi-ui 旧 artifact
projectEvidence: []
---

# OpenAPI、接口文档与接口联调

## 一、为什么需要学习

接口能返回 JSON，不代表调用者知道该用哪个方法、路径、参数和请求体；Swagger UI 能打开，也不代表
文档中的状态码与运行时一致。OpenAPI 把 HTTP 接口写成机器可读合同，springdoc 从 Spring MVC 代码生成
这份描述，Swagger UI 再读取描述帮助人查看和发请求。

本课把反馈拆成三条：解析 OpenAPI JSON 证明“文档写对了”，打开 Swagger UI 证明“人能找到入口”，
使用 curl 证明“真实服务按合同响应”。三条都通过，才算完成一次可重复的接口联调。

## 二、学习目标

- 能解释 OpenAPI 描述、Swagger UI 与运行时 API 的区别。
- 能读懂 path、operation、parameter、requestBody、response 与 schema。
- 能在 Spring Boot 4.1 项目中生成 OpenAPI 3.1 文档。
- 能分开判断属性是否必需和是否允许 `null`。
- 能用机器断言与 curl 复核文档和真实响应。
- 能识别 Boot 2.3 / springdoc v1 的旧 artifact 与 OAS 3.0 边界。

## 三、前置术语

- **接口描述：** 对可调用路径、输入和输出的结构化说明，不是 Controller 本身。
- **Schema：** 描述 JSON 值的类型、属性和约束。
- **联调：** 调用方按接口合同组装请求，并与服务端共同核对真实响应。
- **Swagger UI：** 读取 OpenAPI 描述并渲染页面、提交 HTTP 请求的客户端工具。
- **`$ref`：** 指向可复用组件的引用，避免在每个 operation 重复同一模型。

## 四、零基础知识点详解

### 1. OpenAPI 描述、Swagger UI 与运行时 API

**它是什么：** OpenAPI 描述是合同文件，Swagger UI 是读取合同的页面，运行时 API 是实际接收请求的
Spring MVC 代码。

**有什么作用：** 把“写了什么”“展示了什么”“实际做了什么”分开验证，避免只看一个页面就误判。

**什么时候使用：** 开发或联调任何需要被其他人、前端或自动化工具调用的 HTTP API 时。

**怎么使用：** 先获取 `/v3/api-docs`，再打开 `/swagger-ui.html`，最后向业务路径发送真实请求。

**最小示例：** `curl -fsS localhost:8080/v3/api-docs` 读取合同；`curl -i localhost:8080/tasks/1`
调用业务接口。

**运行结果：** 前者返回 OpenAPI JSON，后者返回任务 JSON；两种响应来自不同端点。

**常见误区：** Swagger UI 能加载只证明页面和描述入口可用，不证明每个业务响应正确。

### 2. JSON、YAML 与 OpenAPI 版本字段

**它是什么：** 同一份描述可以使用 JSON 或 YAML；根 `openapi` 字段声明采用的 OAS 版本族。

**有什么作用：** 让工具选择正确的结构和 Schema 语义。

**什么时候使用：** 机器断言常读取 JSON，人需要下载配置时也可以读取 YAML。

**怎么使用：** 分别访问 `/v3/api-docs` 和 `/v3/api-docs.yaml`，解析根版本字段而不是搜索文本。

**最小示例：** `jq -e '.openapi | test("^3\\.1\\.")' openapi.json`。

**运行结果：** springdoc 3.1.0 的现代默认输出通过 `3.1.x` 断言。

**常见误区：** OAS 3.1 工具不应因 patch 号改变特性集，不能把输出字面锁死为 `3.1.1`。

### 3. 根 info、paths、components 与 servers

**它是什么：** `info` 说明 API 身份；`paths` 列出操作；`components` 保存复用模型；`servers` 提供
目标地址提示。

**有什么作用：** 让读者先确认服务，再找到路径并复用统一数据结构。

**什么时候使用：** 每份 OpenAPI 描述都要有 `info`，并至少通过 paths、components 或 webhooks 之一
提供实际内容。

**怎么使用：** 为标题和版本配置稳定值，然后按 path 查找 operation，再沿 `$ref` 查模型。

**最小示例：** `jq '{info, paths: (.paths | keys), schemas: (.components.schemas | keys)}' openapi.json`。

**运行结果：** 输出服务标题、`/tasks` 路径和任务模型名。

**常见误区：** 未声明 `servers` 时仍可能使用当前页面地址联调；它不是 Controller 的路由前缀配置。

### 4. Path Item、HTTP method 与路径模板

**它是什么：** `paths` 中每个键是路径，Path Item 下的 `get`、`post` 等字段表示 HTTP 方法。

**有什么作用：** 同一路径可拥有多个不同语义的操作，并精确描述 `{id}` 等模板变量。

**什么时候使用：** Controller 使用 `@GetMapping`、`@PostMapping` 或路径变量时。

**怎么使用：** 先选路径，再选小写 method；路径中的每个 `{id}` 都声明同名 `in: path` 参数。

**最小示例：** `.paths["/tasks/{id}"].get.parameters[] | select(.name == "id")`。

**运行结果：** 找到 `id`，其位置是 `path` 且 `required` 为 `true`。

**常见误区：** 路径模板存在不等于参数已描述；名称不一致会让调用者无法可靠组装 URL。

### 5. Operation 的摘要、描述、标签与 operationId

**它是什么：** Operation 描述一次 HTTP 操作；`operationId` 是整份文档内区分大小写的唯一标识。

**有什么作用：** 摘要帮助快速浏览，标签负责分组，稳定 ID 便于工具和人定位同一操作。

**什么时候使用：** 自动推导的名称不稳定，或业务语义无法从 Java 方法名准确看出时。

**怎么使用：** 用 `@Operation` 补 summary、description、tags 和明确的 operationId。

**最小示例：** `@Operation(summary = "按 ID 查询任务", operationId = "getTaskById")`。

**运行结果：** 文档中的 GET operation 显示指定摘要和 `getTaskById`。

**常见误区：** 复制同一个 operationId 给多个方法，会破坏工具对操作的唯一识别。

### 6. Parameter 的位置与 path required

**它是什么：** Parameter 由 `name` 和 `in` 共同识别，位置只能是 path、query、header 或 cookie。

**有什么作用：** 告诉调用者值应该放到 URL 模板、查询串、请求头还是 Cookie。

**什么时候使用：** 请求输入不在 JSON body 中时。

**怎么使用：** 保留 Spring MVC 可推导的注解，仅为缺少的说明、示例或精确 Schema 补 `@Parameter`。

**最小示例：** `@Parameter(description = "任务 ID", required = true, example = "1")`。

**运行结果：** UI 将 `id` 显示为必填 path 参数，并代入 `/tasks/{id}`。

**常见误区：** 所有 path 参数在 OAS 中都必须 required，不能把它标成可选。

### 7. Request Body、媒体类型与 body-level required

**它是什么：** Request Body 用 `content` 描述不同媒体类型的负载，自己的 `required` 决定整个 body
是否必须提交。

**有什么作用：** 区分“没有请求体”和“请求体存在但缺少某个属性”。

**什么时候使用：** POST、PUT 或 PATCH 接收 JSON 对象时。

**怎么使用：** 声明 `application/json`、请求模型和 `required = true`，再独立声明模型属性约束。

**最小示例：** `.paths["/tasks"].post.requestBody.required`。

**运行结果：** 返回 `true`；Schema 的 `required` 数组仍需另行检查。

**常见误区：** `@RequestBody` 存在不等于文档一定准确表达媒体类型和必需性。

### 8. Responses 的状态、媒体类型与模型

**它是什么：** Responses Object 把状态码映射到描述、响应头、媒体类型和 Schema。

**有什么作用：** 让调用者同时准备成功处理和已知失败处理。

**什么时候使用：** 每个 operation；至少要有一个响应，本课明确列出成功、400 和 404。

**怎么使用：** 复用 I-13 的错误合同，通过 `@ApiResponse` 描述真实可能返回的状态和模型。

**最小示例：** `.paths["/tasks/{id}"].get.responses["404"].content["application/json"]`。

**运行结果：** 找到指向 `ApiError` 的 Schema，而不是只有一段模糊文字。

**常见误区：** 使用 `default` 掩盖所有已知错误，会丢失调用者需要区分的状态语义。

### 9. components.schemas 与 $ref

**它是什么：** `components.schemas` 保存可复用模型，`$ref` 指向其中一个稳定位置。

**有什么作用：** 请求和多个响应共享同一结构时只维护一份定义。

**什么时候使用：** TaskRequest、TaskResponse 或 ApiError 被多个 operation 使用时。

**怎么使用：** 让生成器为 Java 类型建立组件，并在 operation 中引用该组件。

**最小示例：** `{"$ref":"#/components/schemas/TaskResponse"}`。

**运行结果：** 解析器沿引用找到 TaskResponse 的 properties。

**常见误区：** `$ref` 只复用描述，不会自动让服务端拒绝不合规 JSON。

### 10. Schema 类型、属性、数组、约束与 example

**它是什么：** OpenAPI 3.1 的 Schema Object 基于并扩展 JSON Schema Draft 2020-12，用来描述 JSON
值是 object、array 或基本类型，并可附属性、长度和示例。

**有什么作用：** 把 Java 类型转换成跨语言调用者能理解的输入输出结构。

**什么时候使用：** 请求 DTO、响应 DTO、集合或错误模型需要被公开时。

**怎么使用：** 优先保留 Java 类型和 Bean Validation 可推导事实，仅补无法推导的业务说明和示例。

**最小示例：** `@Schema(description = "任务标题", minLength = 1, example = "学习 OpenAPI")`。

**运行结果：** TaskRequest.title 显示字符串、说明、最小长度和示例。

**常见误区：** `format` 默认是注解信息，不能据此宣称运行时一定执行格式校验。

### 11. 对象 required 表示属性必须出现

**它是什么：** object Schema 的 `required` 是属性名数组，表示实例中必须出现这些属性。

**有什么作用：** 调用者可以区分缺字段和提供字段。

**什么时候使用：** 请求模型存在不可省略的属性时。

**怎么使用：** 检查父对象 `.required` 是否包含属性名，同时另行检查属性类型和运行时校验。

**最小示例：** `.components.schemas.TaskRequest.required | index("title") != null`。

**运行结果：** 返回 `true`，说明 title 必须出现。

**常见误区：** required 不表示值一定非 null，也不等于 Java 字段存在或 `@NotNull` 自动生效。

### 12. OAS 3.1 的 null 类型与四象限

**它是什么：** OAS 3.1 使用 JSON Schema 的 `null` 类型；属性是否出现与值能否为 null 是两个维度。

**有什么作用：** 准确表达“必需但可空”“可选但不可空”等不同合同。

**什么时候使用：** API 确实区分字段缺失与显式 null 时。

**怎么使用：** presence 看父对象 required；可空性看属性 type 是否包含 `null`。

**最小示例：** notes 不在 required 中，且 `type` 同时包含 `string` 与 `null`。

**运行结果：** notes 可以省略，也可以显式传 null；title 必须出现且只接受 string。

**常见误区：** OAS 3.1 不使用 OAS 3.0 的规范关键字 `nullable: true` 表达最终结果。

### 13. springdoc 从 Spring MVC 生成描述

**它是什么：** springdoc 读取映射、Java 类型、校验元数据和 Swagger 注解，构建 OpenAPI 描述。

**有什么作用：** 让接口代码和描述保持接近，减少手工重复。

**什么时候使用：** Spring MVC 项目希望从实际 Controller 生成文档时。

**怎么使用：** 引入匹配 Boot 代际的依赖，启动应用并解析生成结果。

**最小示例：** `@GetMapping("/{id}")` 会提供路径和 method，`@Operation` 再补充业务语义。

**运行结果：** `/v3/api-docs` 出现 `/tasks/{id}` 的 GET operation。

**常见误区：** 生成器只能推导代码和元数据中存在的信息，无法猜出所有业务错误。

### 14. Boot 4.1 的 springdoc 3.1 starter

**它是什么：** 现代 MVC + UI 依赖是 `springdoc-openapi-starter-webmvc-ui:3.1.0`。

**有什么作用：** 一次引入 API 文档生成和 Swagger UI 所需模块，并与 Boot 4.1 对齐。

**什么时候使用：** 本课的 Java 25 / Spring Boot 4.1 MVC 项目。

**怎么使用：** 在 `pom.xml` 添加 starter，版本固定为 3.1.0，不添加 v1 artifact。

**最小示例：** Maven 坐标 `org.springdoc:springdoc-openapi-starter-webmvc-ui:3.1.0`。

**运行结果：** 应用启动后文档 JSON、YAML 与 UI 入口可访问。

**常见误区：** artifact 名相似不代表跨 Boot 代际兼容；现代项目不能复制 `springdoc-openapi-ui`。

### 15. 默认端点与 context path

**它是什么：** 默认 JSON、YAML、UI 入口分别为 `/v3/api-docs`、`/v3/api-docs.yaml` 和
`/swagger-ui.html`。

**有什么作用：** 为自动化和人工联调提供稳定入口。

**什么时候使用：** 首次接入或排查页面、文档和业务请求的不同失败点时。

**怎么使用：** 有 context path 时在三个入口前都加同一前缀，并分别检查状态和内容类型。

**最小示例：** context path 为 `/task-api` 时请求 `/task-api/v3/api-docs`。

**运行结果：** JSON 与 YAML 端点直接返回 200；默认 `/swagger-ui.html` 入口先返回 302 与有效
`Location`，跟随重定向后的 HTML 返回 200。遗漏 context path 前缀通常得到 404。

**常见误区：** 自定义 UI path 不会自动等价修改 JSON path，两个配置面要分别处理。

### 16. 先推导，再用注解补语义

**它是什么：** 映射和 Java 类型负责可推导事实，Swagger 注解只补标题、说明、示例和已知响应。

**有什么作用：** 减少注解与真实 Controller 重复，同时保留调用者需要的业务信息。

**什么时候使用：** 自动生成结果缺少稳定 operationId、错误响应或字段含义时。

**怎么使用：** 先查看生成文档，再最小添加 `@OpenAPIDefinition`、`@Operation`、`@Parameter`、
`@Schema`、`@ApiResponse`。

**最小示例：** 不重复注解 `@GetMapping` 已明确的方法和 path，只补 `operationId` 与 404 模型。

**运行结果：** 文档保留真实映射，同时补齐调用者无法可靠猜出的语义。

**常见误区：** 大量复制 method、path 和类型会形成第二份易漂移的接口实现。

### 17. 描述既有错误合同

**它是什么：** 文档把 I-13 已冻结的错误码、状态和公开字段映射为响应说明。

**有什么作用：** 调用者能区分输入错误、资源缺失和成功结果。

**什么时候使用：** Controller 已真实返回 400、404 等稳定错误时。

**怎么使用：** 为每个 operation 只列实际可能出现的错误，并引用统一 ApiError Schema。

**最小示例：** GET `/tasks/{id}` 同时描述 200 TaskResponse 和 404 ApiError。

**运行结果：** 机器断言能找到两个状态；真实缺失请求返回文档所述字段。

**常见误区：** 文档注解不能重新发明错误码，也不能让尚未实现的错误自动出现。

### 18. Swagger UI 的展示与 Try it out

**它是什么：** Swagger UI 获取 OpenAPI 描述，展示 operation 和模型，并可向服务发送请求。

**有什么作用：** 让人快速检查参数位置、示例和实际响应。

**什么时候使用：** 开发环境人工探索接口或协助调用方确认请求形状时。

**怎么使用：** 选择 operation，填写参数，点击 Try it out 和 Execute，再核对请求 URL 与响应。

**最小示例：** 对 `getTaskById` 填入 `1`，执行 GET `/tasks/1`。

**运行结果：** 页面展示 curl 片段、请求 URL、状态、响应头和 body。

**常见误区：** Try it out 是实际 HTTP 请求，可能受 context path、CORS、认证和服务状态影响。

### 19. curl 联调与文档机器断言

**它是什么：** curl 验证运行时 HTTP，`jq` 验证 OpenAPI 结构，两者承担不同断言。

**有什么作用：** 同时发现“代码正确但文档漏写”和“文档写了但运行时不符”。

**什么时候使用：** 发布接口前、前后端联调时和课程验收时。

**怎么使用：** curl 固定 method、URL、header 和 body；jq 固定 operation、参数、响应与 Schema。

**最小示例：** 先断言文档有 404，再请求缺失任务并断言 HTTP 404 与 `TASK_NOT_FOUND`。

**运行结果：** 两条断言独立通过；删除 404 文档注解后，真实请求仍是 404，但文档断言失败。

**常见误区：** 只保存一张 UI 截图无法形成可重复的接口验收。

### 20. Boot 2.3 / Java 8 的旧线边界

**它是什么：** 旧项目使用 `springdoc-openapi-ui:1.8.0`、普通 JavaBean 与 `javax.validation`，默认
输出 OAS 3.0。

**有什么作用：** 保留旧项目可运行路径，同时隔离现代 starter、record 和 OAS 3.1 null 语义。

**什么时候使用：** 维护 Java 8 / Boot 2.3.12.RELEASE 服务时。

**怎么使用：** 在真实 Java 8 runtime 独立启动，检查 class major 52、默认端点与 OAS 3.0 文档。

**最小示例：** Maven 坐标 `org.springdoc:springdoc-openapi-ui:1.8.0`。

**运行结果：** `/v3/api-docs` 与 UI 可用，但不得套用现代 `type: [string, "null"]` 断言。

**常见误区：** 旧线的 `nullable` 与现代 JSON Schema null 类型不是可以混写的同一结构。

## 五、现代版本中的正确用法

现代主线固定 Java 25、Boot 4.1.0 和 springdoc 3.1.0。先依赖 Controller 映射、DTO 类型和 Bean
Validation 生成基础结构，再用最少注解补充稳定 operationId、业务说明、示例和真实错误响应。验收以
最终 `/v3/api-docs` 为准，不以 Java 注解名字推测最终 OAS 3.1 结果。

`required` 和 `null` 必须分两次读取：父对象 `required` 决定属性是否出现，属性的 `type` 决定是否接收
null。文档约束还必须与真实空标题 400 等运行时反馈交叉验证，不能把文档当作校验器。

## 六、完整依赖配置

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>4.1.0</version>
    <relativePath />
  </parent>
  <groupId>dev.example</groupId>
  <artifactId>openapi-course</artifactId>
  <version>1.0.0</version>
  <properties>
    <java.version>25</java.version>
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
    <dependency>
      <groupId>org.springdoc</groupId>
      <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
      <version>3.1.0</version>
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

把它保存为临时目录中的 `pom.xml`。依赖开启生成器，Spring MVC 注解提供真实映射，Swagger 注解补充
文档语义，三个角色不能互相代替。

## 七、从零跟着做

在终端执行 `WORK_DIR=$(mktemp -d /tmp/java-openapi-course.XXXXXX)`，进入 `$WORK_DIR`，按上一节创建
`pom.xml`，再创建 `src/main/java/dev/example/openapi/TaskApiApplication.java`：

```java
package dev.example.openapi;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.net.URI;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@SpringBootApplication
@OpenAPIDefinition(info = @Info(title = "Task API", version = "1.0.0"))
public class TaskApiApplication {
    /**
     * 启动任务接口示例。
     */
    public static void main(String[] args) {
        SpringApplication.run(TaskApiApplication.class, args);
    }
}

@RestController
@RequestMapping("/tasks")
final class TaskController {
    private final Map<Long, TaskResponse> tasks = new ConcurrentHashMap<>();
    private final AtomicLong sequence = new AtomicLong(1);

    /**
     * 创建带有初始任务的控制器。
     */
    TaskController() {
        tasks.put(1L, new TaskResponse(1L, "学习 OpenAPI", null));
    }

    /**
     * 按稳定标识查询任务。
     */
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
        operationId = "getTaskById",
        responses = {
            @ApiResponse(responseCode = "200", description = "查询成功"),
            @ApiResponse(
                responseCode = "404",
                description = "任务不存在",
                content = @Content(schema = @Schema(implementation = ApiError.class))
            )
        }
    )
    TaskResponse find(@PathVariable long id) {
        TaskResponse task = tasks.get(id);
        if (task == null) {
            throw new TaskNotFoundException(id);
        }
        return task;
    }

    /**
     * 创建一个新任务。
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
        operationId = "createTask",
        responses = {
            @ApiResponse(responseCode = "201", description = "创建成功"),
            @ApiResponse(
                responseCode = "400",
                description = "输入校验失败",
                content = @Content(schema = @Schema(implementation = ApiError.class))
            )
        }
    )
    ResponseEntity<TaskResponse> create(@Valid @RequestBody TaskRequest request) {
        long id = sequence.incrementAndGet();
        TaskResponse task = new TaskResponse(id, request.title().trim(), request.notes());
        tasks.put(id, task);
        return ResponseEntity.created(URI.create("/tasks/" + id)).body(task);
    }
}

@Schema(description = "创建任务请求")
record TaskRequest(
    @NotBlank
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
    String title,
    @Schema(types = {"string", "null"}) String notes
) {}

record TaskResponse(long id, String title, @Schema(types = {"string", "null"}) String notes) {}

record ApiError(String code, String message) {}

final class TaskNotFoundException extends RuntimeException {
    /**
     * 创建任务不存在异常。
     */
    TaskNotFoundException(long id) {
        super("任务 " + id + " 不存在");
    }
}

@RestControllerAdvice
final class ApiExceptionHandler {
    /**
     * 将资源缺失映射为公开的 404 响应。
     */
    @ExceptionHandler(TaskNotFoundException.class)
    ResponseEntity<ApiError> handleMissing(TaskNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ApiError("TASK_NOT_FOUND", "任务不存在"));
    }

    /**
     * 将输入校验失败映射为公开的 400 响应。
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException exception) {
        return ResponseEntity.badRequest()
            .body(new ApiError("VALIDATION_FAILED", "任务标题不能为空"));
    }
}
```

1. 运行 `mvn spring-boot:run`。若启动失败，先看第一段 `APPLICATION FAILED TO START`，确认 Java
   版本和依赖坐标；不要通过随意换版本掩盖失败。等待 `Started TaskApiApplication` 后再请求端点。
2. 获取文档：`curl -fsS localhost:8080/v3/api-docs -o openapi.json`，用 `jq -e` 断言版本为 3.1.x、
   两个 operationId 唯一、id 为 required、POST body 为 required、响应和 Schema 完整。再请求
   `/v3/api-docs.yaml`，确认状态 200；再请求 `/swagger-ui.html`，确认原始响应为 302 且带有效
   `Location`，跟随重定向后的 HTML 为 200。
3. 依次 curl 查询已有任务、创建任务、提交空标题和查询缺失任务。记录 method、URL、Content-Type、
   状态和公开 JSON 字段；预期分别为 200、201、400 `VALIDATION_FAILED`、404 `TASK_NOT_FOUND`。
4. 暂时删除 GET 的 404 `@ApiResponse` 并重启：真实缺失请求仍返回 404，但文档结构断言失败。恢复注解
   后复跑同一命令必须通过。再把一个 operationId 改成重复值，确认唯一性断言失败，最后恢复。
5. 连续运行完整探针两次，确认结果一致。停止 Maven 进程，离开目录后执行
   `find "$WORK_DIR" -depth -delete`，再用 `test ! -e "$WORK_DIR"` 确认清理完成。

## 八、如何使用

1. 先列出本次联调的 operationId、method、path、输入和预期状态。
2. 从 `/v3/api-docs` 解析结构，确认调用说明完整。
3. 在 Swagger UI 检查说明、模型和示例是否便于人阅读。
4. 用 curl 发送可重复请求，保留状态、响应头和 JSON 断言。
5. 对每个业务错误同时检查文档响应和真实响应。
6. 修改 Controller 或 DTO 后复跑同一反馈环，防止合同静默漂移。

## 九、适用与不适用场景

适用于 Spring MVC REST API 的接口发现、开发环境文档和同一服务联调。它不替代 Service 单元测试、
Controller 测试、远程依赖集成测试或认证授权。OpenAPI-first 代码生成、SDK、breaking-change 检查和
消费者契约属于后续专门课程。

:::tip
先断言生成的 OpenAPI JSON，再用 UI 浏览。JSON 断言可重复且能定位字段；UI 更适合检查阅读体验和
实际请求，但不应成为唯一验收证据。
:::

## 十、Java 8 / Spring Boot 2.3 兼容写法

旧线依赖改为：

```xml
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-ui</artifactId>
  <version>1.8.0</version>
</dependency>
```

DTO 使用带无参构造器、getter 和 setter 的普通类，校验 import 使用 `javax.validation`。在真实 Java 8
容器中启动 Boot 2.3.12，确认 class major 52、文档端点 200、UI 原始入口 302 且跟随后 HTML 200，并
复跑成功、空标题 400 和缺失 404。旧线保留默认 OAS 3.0，不把现代 OAS 3.1 的 null 类型结构写进验收。

## 十一、新旧版本差异

| 对比项 | 现代主线 | Java 8 / Boot 2.3 补充 | 迁移注意 |
| --- | --- | --- | --- |
| springdoc | `starter-webmvc-ui:3.1.0` | `openapi-ui:1.8.0` | artifact 不可跨代复制 |
| Spring Boot | 4.1.0 | 2.3.12.RELEASE | 分别使用匹配的 Spring Framework |
| DTO | record 或普通类 | 普通 JavaBean | 旧线没有 record |
| 校验包 | `jakarta.validation` | `javax.validation` | import 必须随代际切换 |
| 默认 OAS | 3.1 | 3.0 | required/null 结构分开断言 |
| null | JSON Schema `null` 类型 | `nullable` 语义 | 不混写最终文档结构 |

## 十二、易错点

:::pitfalls
### 错误：Swagger UI 能打开就宣称接口正确

**触发条件：** 只访问 `/swagger-ui.html`，没有解析文档或发送业务请求。

**原因：** UI 页面、OpenAPI 描述和 Controller 是三条不同反馈路径。

**后果：** 文档可能缺响应，运行时也可能返回与说明不同的状态和字段。

**错误示例：**

~~~bash
curl -I localhost:8080/swagger-ui.html
~~~

**正确写法：**

~~~bash
curl -fsS localhost:8080/v3/api-docs | jq -e '.paths["/tasks/{id}"].get'
curl -fsS localhost:8080/tasks/1 | jq -e '.id == 1'
~~~

**验证方式：** 三类探针都有独立断言，任一失败都不关闭课程。
:::

:::pitfalls
### 错误：把 required 当作值不能为 null

**触发条件：** 看到 title 位于父对象 required 中，就宣称 title 不可能为 null。

**原因：** required 只约束属性是否出现，类型才约束可接受的值。

**后果：** 调用者对缺失、显式 null 和空字符串的处理与服务端不一致。

**错误示例：**

~~~jq
.components.schemas.TaskRequest.required | index("title") != null
~~~

**正确写法：**

~~~jq
(.components.schemas.TaskRequest.required | index("title") != null) and
(.components.schemas.TaskRequest.properties.notes.type | index("null") != null)
~~~

**验证方式：** 解析 Schema 四象限，再用空标题和 null 请求复核服务端行为。
:::

:::pitfalls
### 错误：文档注解代替运行时校验

**触发条件：** 只给 title 添加 `@Schema(requiredMode = REQUIRED)`，没有 `@NotBlank`。

**原因：** OpenAPI 描述不会自动成为 Spring MVC 的输入校验器。

**后果：** 文档宣称必填，运行时却接受空标题。

**错误示例：**

~~~java
@Schema(requiredMode = Schema.RequiredMode.REQUIRED)
private String title;
~~~

**正确写法：**

~~~java
@NotBlank
@Schema(requiredMode = Schema.RequiredMode.REQUIRED)
private String title;
~~~

**验证方式：** Schema required 与空标题真实 400 两条断言同时通过。
:::

:::pitfalls
### 错误：混用 springdoc 代际与 OAS null 写法

**触发条件：** Boot 4 使用 v1 artifact，或 Boot 2.3 复制 v3 starter 和 3.1 type 数组断言。

**原因：** Boot、Spring Framework、Java 与 springdoc artifact 有精确兼容边界。

**后果：** 应用启动失败，或课程记录与实际 OAS 版本不一致。

**错误示例：**

~~~xml
<artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
<version>3.1.0</version>
~~~

**正确写法：**

~~~xml
<artifactId>springdoc-openapi-ui</artifactId>
<version>1.8.0</version>
~~~

**验证方式：** 两个容器分别检查依赖、class major、根 openapi 版本和端点状态。
:::

## 十三、错误与正确写法对比

:::compare
### 错误写法

```java
@GetMapping("/{id}")
@Operation(operationId = "getTask")
public TaskResponse find(@PathVariable long id) {
    return service.find(id);
}
```

### 正确写法

```java
/**
 * 按稳定标识查询任务。
 */
@GetMapping("/{id}")
@Operation(
    operationId = "getTaskById",
    responses = {
        @ApiResponse(responseCode = "200", description = "查询成功"),
        @ApiResponse(responseCode = "404", description = "任务不存在")
    }
)
public TaskResponse find(@PathVariable long id) {
    return service.find(id);
}
```

:::

错误写法只描述成功结果，调用者不知道资源缺失时的状态和模型。正确写法也不会改变运行时行为：仍由
Controller、Service 和 advice 产生真实 200/404，注解只准确描述既有合同。

## 十四、安全注意

Swagger UI 的 Try it out 会发送真实请求，不能把它当成静态示例。开发环境也要确认目标 URL、请求体和
调用身份；生产是否生成、暴露和允许访问文档由安全课程单独治理。本课不通过“额外 Controller 返回
404”伪装关闭能力，也不在示例中写入令牌、内网地址或真实业务数据。

## 十五、如何验证

1. 在 Java 25 / Boot 4.1.0 fixture 中两次启动并断言 3.1.x 文档、20 项结构合同和四条真实请求。
2. 删除 404 描述与制造重复 operationId，确认文档断言能失败；恢复后复跑通过。
3. 在 Java 8 / Boot 2.3.12 fixture 中断言 class major 52、OAS 3.0、三个文档入口和相同核心请求。
4. 删除旧 springdoc 依赖，确认文档探针失败；恢复精确依赖后复跑通过。
5. 所有 fixture、响应、日志和截图只保存在 `/tmp`，通过后停止进程并精确删除。

:::exercise
### 练习：补齐更新任务的文档与联调合同

**要求：** 为 `PUT /tasks/{id}` 定义唯一 operationId、必填 path 参数、必填 JSON body、200、400 和
404 响应；不要引入数据库、认证或契约 diff 工具。

**验收：** jq 能找到 operation、参数、请求体和三个响应；curl 更新成功返回 200，空标题返回 400，
未知 ID 返回 404，响应字段与文档模型一致。

**参考答案：** 先实现并用 MockMvc 证明真实 Controller 合同，再让 springdoc 推导 method、path 和
DTO；只补稳定 operationId、说明与已知错误响应，最后分别运行文档结构断言和三条 curl。
:::

## 十六、本节小结

- OpenAPI 描述、Swagger UI 和运行时 API 必须分别验证。
- path、operation、parameter、requestBody、responses 与 Schema 共同构成可调用合同。
- required 与 null 是正交维度，现代 OAS 3.1 和旧线 OAS 3.0 不能混写。
- springdoc 只能描述可推导或显式提供的信息，文档注解不执行运行时校验。
- 机器文档断言加真实 curl 才能形成可重复的本地接口联调闭环。
