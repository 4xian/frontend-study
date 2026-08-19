# OpenAPI、接口文档与接口联调研究稿

## 冻结课程合同

| 项目 | 冻结值 |
| --- | --- |
| 课程编号 | Phase C `I-16`；中级第 16/20 课 |
| 稳定 ID | `backend.java.learn.intermediate.openapi-documentation-and-api-integration` |
| 标题 | OpenAPI、接口文档与接口联调 |
| 预计时长 | 120 分钟 |
| 唯一前置 | `backend.java.learn.intermediate.controller-testing-mockmvc-and-test-slices`（I-15） |
| 处置 | 新增课程、新增稳定 ID、新增 URL |
| 现代主线 | Java 25、Spring Boot 4.1.0、Spring Framework 7.0.8、springdoc-openapi 3.1.0、OpenAPI 3.1 |
| 项目补充线 | Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE、springdoc-openapi 1.8.0 |
| 本课范围 | OpenAPI 文档结构、Spring MVC 文档生成、关键注解、Swagger UI、同一服务的 curl 联调与文档断言 |
| 明确排除 | OpenAPI-first 代码生成、SDK、远程服务联调、WireMock、契约演进 Gate、认证授权、生产文档暴露、Springfox 迁移实作 |

I-15 已用 MockMvc 证明 Controller 的实际 HTTP adapter 合同。本课在同一个最小任务 API 上增加机器可读
描述，并分别检查“文档写了什么”和“服务实际返回什么”。OpenAPI 描述、Swagger UI 和真实 API 是三层：
描述定义接口表面，UI 读取描述并发请求，运行时 Controller 才处理请求；任一层可用都不能自动证明另两层
正确。

## 研究方法与版本快照

- 核验日期：2026-08-16。
- Tavily 按仓库首选顺位调用，但返回套餐用量上限错误；随后按顺位使用 Exa 定位候选 URL。最终结论均
  回到 Spring Boot、springdoc、OpenAPI Initiative、JSON Schema 与 Swagger 的直接官方页面、发布说明、
  Javadoc 或 Maven Central 发布工件，搜索摘要不作为证据。
- Spring Boot 4.1.0 要求 Java 17～26，并要求 Spring Framework 7.0.8 或更高；Java 25 位于受支持范围内。
- springdoc-openapi 3.1.0 的发布说明明确升级到 Spring Boot 4.1.0，其父 POM 也精确继承
  `spring-boot-starter-parent:4.1.0`，同时管理 swagger-core 2.2.52 与 Swagger UI 5.32.11。因此现代
  fixture 固定使用 `springdoc-openapi-starter-webmvc-ui:3.1.0`，不从仅列出 Boot 4.0.x 的 FAQ 旧矩阵
  外推版本。
- 当前 springdoc 3.1.0 默认选择 `openapi_3_1`；OpenAPI 3.1.1 是本课的规范性语义来源。OAS 规定工具
  不应区分 3.1 patch 版本，因此反馈环断言生成文档属于 `3.1.x`，不强迫生成器输出字面值 `3.1.1`。
- 现代默认 JSON 端点为 `/v3/api-docs`，YAML 为 `/v3/api-docs.yaml`，Swagger UI 入口为
  `/swagger-ui.html`；上下文路径存在时三者都位于该路径之下。
- Spring Boot 2.3.12.RELEASE 要求 Java 8、Spring Framework 5.2.15.RELEASE 或更高。springdoc v1
  文档把 1.8.0 定义为 Boot 1/2 的最后稳定版，矩阵把 Boot 2.3.x 的最低 springdoc 版本列为 1.4.0+。
  旧线因此固定 `springdoc-openapi-ui:1.8.0`，但必须通过 Java 8 / Boot 2.3.12 临时运行反馈环确认。
- springdoc 1.8.0 默认选择 `openapi_3_0`，虽可显式切到 `OPENAPI_3_1`，本课旧项目补充不主动改变
  规范族。现代线讲 `type: [string, "null"]`，旧线只解释 OAS 3.0 的 `nullable: true`，不得混写。

## 官方来源卡与直接证据

| ID | 官方直接来源 | sourceType | 支持结论 |
| --- | --- | --- | --- |
| `boot-410-system` | <https://docs.spring.io/spring-boot/4.1/system-requirements.html> | `official-reference` | Boot 4.1.0 的 Java 17～26 与 Framework 7.0.8 或更高要求 |
| `springdoc-310-release` | <https://github.com/springdoc/springdoc-openapi/releases/tag/v3.1.0> | `release-note` | springdoc 3.1.0 升级到 Boot 4.1.0、swagger-core 2.2.52 与 Swagger UI 5.32.11 |
| `springdoc-310-parent` | <https://repo.maven.apache.org/maven2/org/springdoc/springdoc-openapi/3.1.0/springdoc-openapi-3.1.0.pom> | `source-code` | 发布工件精确继承 Boot 4.1.0 并管理 Swagger 依赖版本 |
| `springdoc-310-webmvc-ui` | <https://repo.maven.apache.org/maven2/org/springdoc/springdoc-openapi-starter-webmvc-ui/3.1.0/springdoc-openapi-starter-webmvc-ui-3.1.0.pom> | `source-code` | 现代 MVC UI starter 组成 |
| `springdoc-current` | <https://springdoc.org/> | `official-reference` | 3.1.0 依赖、JSON/YAML 文档和 Swagger UI 默认端点 |
| `springdoc-properties` | <https://springdoc.org/properties.html> | `official-reference` | OAS 3.1 默认值、端点路径和 Swagger UI 配置面 |
| `oas-311` | <https://spec.openapis.org/oas/v3.1.1.html> | `specification` | OpenAPI Object、Path、Operation、Parameter、Request Body、Responses 与 Schema 合同 |
| `json-schema-2020-12-validation` | <https://json-schema.org/draft/2020-12/json-schema-validation.html> | `specification` | `type` 数组、`null` 类型与对象 `required` 关键字语义 |
| `swagger-operation-2252` | <https://docs.swagger.io/swagger-core/v2.2.52/apidocs/io/swagger/v3/oas/annotations/Operation.html> | `api-doc` | `@Operation` 的 summary、description、operationId 与 responses |
| `swagger-schema-2252` | <https://docs.swagger.io/swagger-core/v2.2.52/apidocs/io/swagger/v3/oas/annotations/media/Schema.html> | `api-doc` | `@Schema` 的 description、implementation、requiredMode 与 nullable |
| `swagger-api-response-2252` | <https://docs.swagger.io/swagger-core/v2.2.52/apidocs/io/swagger/v3/oas/annotations/responses/ApiResponse.html> | `api-doc` | `@ApiResponse` 的 responseCode、description 与 content |
| `swagger-ui-config` | <https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/> | `official-reference` | Try it out、提交方法、请求片段与请求/响应拦截配置 |
| `boot-2312-system` | <https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements> | `official-reference` | Boot 2.3.12 的 Java 8 与 Framework 5.2.15 基线 |
| `springdoc-v1` | <https://springdoc.org/v1/> | `official-reference` | v1.8.0 的 Boot 1/2 依赖、默认端点与 OAS 3.0 默认值 |
| `springdoc-v1-faq` | <https://springdoc.org/v1/faq.html#_what_is_the_compatibility_matrix_of_springdoc_openapi_with_spring_boot> | `official-reference` | Boot 2.3.x 对应 springdoc 1.4.0+，1.8.0 是 v1 最后稳定版 |
| `springdoc-180-parent` | <https://repo.maven.apache.org/maven2/org/springdoc/springdoc-openapi/1.8.0/springdoc-openapi-1.8.0.pom> | `source-code` | 旧线管理 swagger-core 2.2.20 与 Swagger UI 5.11.8 |
| `springdoc-180-ui` | <https://repo.maven.apache.org/maven2/org/springdoc/springdoc-openapi-ui/1.8.0/springdoc-openapi-ui-1.8.0.pom> | `source-code` | Boot 2 MVC 的旧 artifact 名与传递依赖 |

## OpenAPI 3.1.1 语义冻结

1. OpenAPI 描述是语言无关的 HTTP API 接口描述，可供人、文档工具、代码生成和测试工具读取；它不是
   Controller 实现，也不自动执行运行时校验。
2. OpenAPI 文档可使用 JSON 或 YAML。根 `openapi` 与 `info` 是必填字段；一次完整描述还必须至少包含
   `paths`、`components` 或 `webhooks` 之一。
3. `paths` 保存可用路径，Path Item 按 HTTP method 保存 Operation。`/tasks/{id}` 中的每个模板表达式
   必须有对应 path 参数。
4. Operation 描述单次 API 操作；`summary` 面向快速阅读，`description` 补充行为，`operationId` 在整份
   描述中必须唯一且区分大小写。
5. Parameter 由 `name + in` 唯一识别，位置只允许 path、query、header、cookie；path 参数的
   `required` 必须为 `true`。
6. Request Body 用 `content` 按媒体类型描述负载，其自身 `required` 默认是 `false`。请求体是否必需、
   请求体对象中哪些属性必需是两个不同层级。
7. Responses Object 映射状态码与响应；它至少包含一个响应。课程示例必须描述一个成功响应和已知的
   400、404 错误，不用 `default` 掩盖已经冻结的错误合同。
8. `components.schemas` 保存可复用模型，操作通过 `$ref` 复用。`$ref` 只减少重复，不代表服务端会自动
   拒绝不合规 JSON。
9. OAS 3.1 Schema Object 基于并扩展 JSON Schema Draft 2020-12；`type` 明确约束实例类型，`format`
   默认只是注解，不应把 `format` 存在写成已执行格式校验。
10. 对象 Schema 的 `required` 是唯一字符串数组，表示实例中必须出现的属性名；省略它等价于空数组。
    Java 字段存在、`@NotNull`、请求体必需和 Schema `required` 不能互相代替。
11. OAS 3.1 把 `null` 当作类型。一个“必须出现但允许 null”的字段可以同时位于父对象 `required` 中，
    并使用 `type: ["string", "null"]`；一个“不必出现但出现时不可为 null”的字段则不在 `required`
    中且类型只为 `string`。必需性与可空性是正交维度。
12. OAS 3.1 Schema Object 没有 OAS 3.0 的 `nullable` 规范关键字。Java 注解 API 虽仍提供
    `@Schema(nullable = true)`，课程必须查看最终 3.1 文档是否产生包含 `null` 的类型，不能把注解名
    直接当作规范结果。

## I-16 知识点规划

正文按以下 20 个独立知识点展开，每点都回答是什么、作用、场景、用法、最小示例、结果和误区：

1. OpenAPI 描述、Swagger UI 与运行时 API 是三个相关但不同的对象。
2. JSON/YAML、`openapi` 版本字段与 OAS 3.1 patch 兼容规则。
3. 根 `info`、`paths`、`components` 和默认 `servers` 的职责。
4. Path Item、HTTP method 与路径模板参数的对应关系。
5. Operation 的 summary、description、tag 与全局唯一 operationId。
6. path/query/header/cookie Parameter 及 path 参数强制 required。
7. Request Body 的媒体类型、Schema 与 body-level required。
8. Responses 的成功状态、已知错误、响应媒体类型和 Schema。
9. `components.schemas` 与 `$ref` 的复用边界。
10. Schema 的 object、properties、array、基本类型、约束与 example。
11. 对象属性 `required` 表示“必须出现”，不等于 Java 非 null 或 Bean Validation。
12. OAS 3.1 的 `null` 类型以及“必需但可空 / 可选但不可空”四象限。
13. springdoc 根据 Spring MVC 映射、Java 类型、校验元数据和 Swagger 注解生成描述。
14. Boot 4.1 使用 `springdoc-openapi-starter-webmvc-ui:3.1.0`，不使用 v1 artifact。
15. `/v3/api-docs`、`/v3/api-docs.yaml`、`/swagger-ui.html` 与 context path。
16. 先保留可推导事实，再用 `@OpenAPIDefinition`、`@Operation`、`@Parameter`、`@Schema` 和
    `@ApiResponse` 补齐无法可靠推导的语义。
17. 文档必须覆盖 I-13 已冻结的公开错误响应，但注解不重新设计业务错误。
18. Swagger UI 读取描述、展示模型，并通过 Try it out 向实际服务发 HTTP 请求。
19. curl 联调同时核对请求、状态、头、媒体类型和响应体；文档结构另用机器断言核对。
20. Boot 2.3 / Java 8 使用 springdoc v1 artifact、JavaBean 与 `javax.validation`，默认 OAS 3.0；
    只复用共同概念，不伪造现代 3.1 输出。

### 与相邻课程的内容边界

- I-15 负责 MockMvc、Controller slice 和实际 HTTP 失败合同；本课只复用其结果，不重讲测试切片。
- I-10 负责 Bean Validation；本课只观察约束如何进入文档，并明确文档不替代运行时校验。
- I-13 负责 Problem Details 与错误码设计；本课只把已冻结的错误合同准确描述和联调。
- A-05 才讲完整应用集成、远程依赖与 WireMock；本课只调用本地同一个任务 API。
- A-06 才讲 API 演进、兼容性与契约测试；本课不做快照 diff、breaking-change Gate 或消费者契约。
- 安全课程负责认证、授权、CORS 与生产文档暴露；本课仅提醒 Swagger UI 的 Try it out 是真实请求。
- `JAVA-FRAMEWORK-013` 只证明旧项目存在 Springfox Swagger 2 场景。Springfox 到 OpenAPI 的系统迁移
  留给冻结的 Reference 候选，本课不复制 `Docket` 或 Swagger 2 注解。
- 冻结后继 I-17 不属于本批；本稿不读取、研究或修改其正文与资产。

## 实施阶段临时反馈环

现代与旧线分别在 `/tmp` 的 `mktemp -d` 工程执行，所有命令和响应保存于临时目录，成功后精确删除。
研究阶段只冻结可执行方案，不虚构尚未运行的 fixture 结果。

### 现代 Java 25 / Boot 4.1.0

最小 Maven 工程固定 Boot 4.1.0、`spring-boot-starter-webmvc`、`spring-boot-starter-validation` 和
`springdoc-openapi-starter-webmvc-ui:3.1.0`。使用 `TaskController`、`TaskRequest`、`TaskResponse`、
`ApiError` 与内存数据，不引入数据库、Security 或远程服务。至少验证：

1. 在真实 Java 25 runtime 启动应用，两次获取 `/v3/api-docs` 均为 200 和 JSON，根 `openapi` 属于
   `3.1.x`，`info.title/version` 稳定。
2. 机器断言 `/tasks/{id}` GET 与 `/tasks` POST 存在，operationId 唯一，path `id` 为 required，POST
   request body 为 required。
3. 机器断言 200/201、400、404 响应、媒体类型与 `$ref` 完整；`TaskRequest.required` 包含 `title`。
4. 显式建模一个允许 null 的 `notes` 字段，断言最终 OAS 3.1 Schema 的类型包含 `null`；同时证明它是否
   位于父对象 `required` 由独立配置决定。
5. 获取 `/v3/api-docs.yaml` 为 200；先断言 `/swagger-ui.html` 返回 302 与有效 `Location`，再跟随
   重定向得到最终 HTML 200。Swagger UI 显示相同 operationId、参数、request body、成功和错误响应。
6. 用 curl 执行查询成功、合法创建、空标题 400 和缺失任务 404，逐项核对状态、Content-Type 与公开
   JSON 字段；UI Try it out 对同一路径得到相同公开结果。
7. 在临时副本删掉 404 `@ApiResponse`：运行时 404 仍存在，但文档断言必须失败；恢复注解后同一命令
   通过。这个负例证明“接口能返回”不等于“文档已描述”。
8. 在临时副本制造重复 operationId 或错误 required/null 描述，结构断言先失败；修正后连续运行两次，
   请求数量与断言数量一致。

### Java 8 / Boot 2.3.12

真实 Java 8 runtime 固定 Boot 2.3.12.RELEASE、`spring-boot-starter-web`、
`spring-boot-starter-validation` 与 `springdoc-openapi-ui:1.8.0`。DTO 使用普通 JavaBean，校验包使用
`javax.validation`；Swagger 注解仍使用 `io.swagger.v3.oas.annotations`。至少验证：

1. 编译 class major 为 52，应用启动后 `/v3/api-docs`、`/v3/api-docs.yaml` 返回 200；
   `/swagger-ui.html` 返回 302 与有效 `Location`，跟随重定向后最终 HTML 返回 200。
2. 保留 v1 默认 OAS 3.0，断言 GET/POST、operationId、path required、request body、200/201、400、
   404 和共享 Schema 均存在；不得复用现代线的 `type` 包含 `null` 断言。
3. 使用同一组 curl 请求复跑成功、空标题 400 和缺失任务 404，证明文档入口与真实 API 都可用。
4. 删除旧 `springdoc-openapi-ui` 依赖的临时负例必须让文档/UI 探针失败；恢复精确依赖后同一反馈环通过。
5. 若后续确需试验 OAS 3.1，只在独立临时分支显式设置
   `springdoc.api-docs.version=OPENAPI_3_1` 并重新断言输出；该试验不改变本课 legacy 默认合同。

## 易错点冻结

| 现象 | 原因 | 正确方向 | 验证 |
| --- | --- | --- | --- |
| Swagger UI 能打开就宣称接口正确 | UI 页面、描述获取与 API 请求是三条反馈 | 分别探测 UI、OpenAPI JSON 和真实 curl | 三类探针独立断言 |
| `/v3/api-docs` 为 200 但错误响应未出现 | 生成器只能推导部分语义，已知业务错误未显式描述 | 为冻结错误合同补 `@ApiResponse` | 运行时 404 + 文档 404 双断言 |
| 把 `required` 写成“值不能为 null” | JSON Schema required 只约束属性是否出现 | 分开建模 presence 与 null 类型 | 四象限 Schema 断言 |
| OAS 3.1 继续手写 `nullable: true` | 3.1 使用 JSON Schema 的 `null` 类型 | 检查最终 `type` 是否包含 `null` | 解析生成 JSON，不只看 Java 注解 |
| 现代项目使用 v1 artifact，旧项目复制 v3 starter | springdoc 的 Boot 代际与 artifact 名不同 | Boot 4.1 用 3.1 starter；Boot 2.3 用 1.8 UI artifact | 两个精确版本独立启动 |
| Try it out 失败却修改 Controller | `servers`、context path、CORS、认证或 UI 配置都可能影响真实请求 | 先看浏览器 network，并用同 URL curl 对照 | 请求 URL、状态和响应体三项证据 |
| 文档注解代替 Bean Validation | OpenAPI 描述不会自动执行服务端输入校验 | 运行时约束与文档约束分别维护并交叉验证 | 空标题真实 400 + Schema required |
| 把 springdoc 输出字面值锁为 3.1.1 | OAS 3.1 patch 不改变 feature set，生成器可输出其他 3.1 patch | 断言 `3.1.x` 并以 3.1.1 解释语义 | 版本族断言 |

## 研究 Gate

- [x] I-16 身份、标题、120 分钟、唯一前置 I-15 与 Phase A 一致。
- [x] I-15 signoff 为 `implementation-complete / lesson-passed`，Phase C 进度 15/20，并明确只授权 I-16。
- [x] springdoc 3.1.0 与 Boot 4.1.0 的精确发布/POM 关系已核验，Java 25 位于 Boot 支持范围。
- [x] OpenAPI 3.1.1 的 document、operation、schema、required 与 null 语义已回到规范核验。
- [x] springdoc 默认端点、Swagger UI Try it out 与机器文档断言的职责已分离。
- [x] Boot 2.3.12 / Java 8 的 v1 artifact、最低兼容版本、默认 OAS 3.0 与包名边界已冻结。
- [x] 20 个知识点只覆盖 OpenAPI、文档生成和本地接口联调，不进入后继、集成测试或契约演进。
- [x] 双版本 fixture 与失败反馈环只写为实施计划，没有虚构运行结果。

## Stop Boundary

研究完成不等于 I-16 发布。父任务必须继续完成正文、现代与 legacy 临时反馈环、track/loader 原子登记、
工程 Gate、桌面/390px 浏览器验收、独立 Standards/Spec 复审、signoff 与清理。I-16 关闭前不得读取、
研究或修改 I-17 正文、研究稿、track、loader 或 signoff；Phase D 仍未获授权。
