---
id: backend.java.learn.intermediate.controller-testing-mockmvc-and-test-slices
type: lesson
title: Controller 测试、MockMvc 与测试切片
summary: 使用 MVC 测试切片验证请求映射、输入校验、响应与错误合同，并把业务依赖隔离为测试替身
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 150
prerequisites:
  - backend.java.learn.intermediate.testing-with-junit-and-mocks
objectives:
  - 能说明 Controller 测试与 Service 单元测试、完整应用集成测试的边界。
  - 能使用 WebMvcTest、MockMvc 与 MockitoBean 建立现代 MVC 测试切片。
  - 能构造路径变量、查询参数和 JSON 请求，并断言状态、媒体类型、响应头与 JSON 字段。
  - 能证明请求体校验失败时不会调用 Service。
  - 能把 Service 结果或异常驱动为稳定的 Problem Details 响应。
  - 能识别 Security 过滤链、standalone setup 与完整应用测试的适用边界。
  - 能把现代测试写法映射到 Boot 2.3 的 WebMvcTest 与 MockBean 兼容写法。
recap:
  - Controller 测试验证 HTTP adapter 合同，不重复证明 Service 内部算法。
  - MockMvc 运行 Spring MVC 的 mock Servlet 链路，不监听真实端口。
  - WebMvcTest 只加载 MVC 切片，Controller 的业务依赖必须显式提供测试替身。
  - 现代线使用 MockitoBean，Boot 2.3 兼容线使用 MockBean，包名不能混用。
  - 响应至少按合同断言 status、content type、header 和公开 JSON 字段。
  - 校验失败不仅要断言 400，还要证明 Service 从未被调用。
  - Advice 必须能被测试切片发现，才能验证业务异常到 Problem Details 的映射。
  - Security 在 classpath 时仍属于请求边界，不应为了让测试变绿而无条件关闭过滤器。
related: []
tags:
  - Java
  - Spring MVC
  - Controller 测试
  - MockMvc
  - WebMvcTest
  - MockitoBean
  - MockBean
  - 测试切片
appliesTo: Java 25、Spring Boot 4.1.0、Spring Framework 7.0.8、JUnit 6.0.3、Mockito 5.23.0 主线；Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE、JUnit 5.6.3、Mockito 3.3.3 兼容补充
modernBaseline:
  java: '25'
  springBoot: 4.1.0
  springFramework: 7.0.8
  junit: 6.0.3
  mockito: 5.23.0
legacyBaseline:
  java: '8'
  springBoot: 2.3.12.RELEASE
  springFramework: 5.2.15.RELEASE
  junit: 5.6.3
  mockito: 3.3.3
verifiedAt: 2026-08-16
sources:
  - id: boot-410-system
    title: Spring Boot 4.1 System Requirements
    url: https://docs.spring.io/spring-boot/4.1/system-requirements.html
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Spring Boot 4.1.0 支持 Java 17 至 26，并要求 Spring Framework 7.0.8 或以上
  - id: boot-410-dependencies
    title: Spring Boot 4.1.0 Dependency Management
    url: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-dependencies/4.1.0/spring-boot-dependencies-4.1.0.pom
    sourceType: source-code
    appliesTo: Spring Boot 4.1.0
    claims:
      - 管理 Spring Framework 7.0.8、JUnit 6.0.3 与 Mockito 5.23.0
  - id: boot-410-webmvc-test
    title: Spring Boot 4.1 WebMvcTest API
    url: https://docs.spring.io/spring-boot/4.1/api/java/org/springframework/boot/webmvc/test/autoconfigure/WebMvcTest.html
    sourceType: api-doc
    appliesTo: Spring Boot 4.1.0
    claims:
      - WebMvcTest 限定 MVC 组件并自动配置 MockMvc
      - 指定 Controller 可缩小测试切片范围
  - id: boot-410-webmvc-test-starter
    title: Spring Boot 4.1 Web MVC Test Starter POM
    url: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-webmvc-test/4.1.0/spring-boot-starter-webmvc-test-4.1.0.pom
    sourceType: source-code
    appliesTo: Spring Boot 4.1.0
    claims:
      - 现代 MVC 测试使用 spring-boot-starter-webmvc-test
  - id: boot-410-webmvc-starter
    title: Spring Boot 4.1 Web MVC Starter POM
    url: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-webmvc/4.1.0/spring-boot-starter-webmvc-4.1.0.pom
    sourceType: source-code
    appliesTo: Spring Boot 4.1.0
    claims:
      - MVC starter 引入 Jackson 3 starter，映射器使用 tools.jackson 包
  - id: spring-mockmvc
    title: Spring Framework MockMvc
    url: https://docs.spring.io/spring-framework/reference/7.0/testing/mockmvc.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - MockMvc 通过 mock request 和 response 执行完整 Spring MVC 请求处理
      - MockMvc 不启动真实服务器
  - id: spring-mockmvc-requests
    title: Spring Framework MockMvc Requests
    url: https://docs.spring.io/spring-framework/reference/7.0/testing/mockmvc/hamcrest/requests.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - 请求构造器支持 method、path、query、header、content type 与 body
  - id: spring-mockmvc-expectations
    title: Spring Framework MockMvc Expectations
    url: https://docs.spring.io/spring-framework/reference/7.0/testing/mockmvc/hamcrest/expectations.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - 结果匹配器可断言 status、header、content 与 jsonPath
  - id: spring-mockitobean
    title: Spring Framework MockitoBean
    url: https://docs.spring.io/spring-framework/reference/7.0/testing/annotations/integration-spring/annotation-mockitobean.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - MockitoBean 用 Mockito mock 覆盖测试 ApplicationContext 中的 bean
  - id: spring-requestbody-validation
    title: Spring MVC RequestBody
    url: https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-controller/ann-methods/requestbody.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - RequestBody 与 Valid 组合会触发 Bean Validation，默认校验失败形成 400
  - id: spring-exceptionhandler
    title: Spring MVC Exceptions
    url: https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-controller/ann-exceptionhandler.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - ExceptionHandler 与 ControllerAdvice 可集中映射 Controller 异常
  - id: spring-problemdetail
    title: Spring Framework ProblemDetail API
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/http/ProblemDetail.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - ProblemDetail 提供标准错误字段与扩展 properties
  - id: security-mockmvc
    title: Spring Security MockMvc Setup
    url: https://docs.spring.io/spring-security/reference/7.1/servlet/test/mockmvc/setup.html
    sourceType: official-reference
    appliesTo: Spring Security 7.1.0
    claims:
      - 存在 Spring Security 时应把安全过滤链纳入 MockMvc 请求边界
  - id: boot-2312-dependencies
    title: Spring Boot 2.3.12 Dependency Management
    url: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-dependencies/2.3.12.RELEASE/spring-boot-dependencies-2.3.12.RELEASE.pom
    sourceType: source-code
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Boot 2.3.12 管理 JUnit Jupiter 5.6.3 与 Mockito 3.3.3
  - id: boot-2312-webmvc-test
    title: Spring Boot 2.3.12 WebMvcTest API
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/api/org/springframework/boot/test/autoconfigure/web/servlet/WebMvcTest.html
    sourceType: api-doc
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - 旧线 WebMvcTest 位于 test.autoconfigure.web.servlet 包
  - id: boot-2312-mockbean
    title: Spring Boot 2.3.12 MockBean API
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/api/org/springframework/boot/test/mock/mockito/MockBean.html
    sourceType: api-doc
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - 旧线使用 MockBean 在 ApplicationContext 中添加或替换 Mockito mock
  - id: spring-5215-mockmvc
    title: Spring Framework 5.2.15 MockMvc
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/testing.html#spring-mvc-test-framework
    sourceType: official-reference
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Spring 5.2.15 提供 MockMvc 请求构造与结果断言反馈环
projectEvidence:
  - file: dzzz-app/src/main/java/com/tdh/bdzz/controller/BaseOuterController.java
    symbol: com.tdh.bdzz.controller.BaseOuterController
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/exception/ArgumentNotValidException.java
    symbol: com.tdh.bdzz.exception.ArgumentNotValidException
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/SpringMvcConfig.java
    symbol: com.tdh.bdzz.config.SpringMvcConfig
    usage: observed
---

# Controller 测试、MockMvc 与测试切片

## 一、为什么需要学习

浏览器或客户端调用接口时，真正看到的是 HTTP 方法、URL、状态码、响应头和 JSON，而不是 Service
方法名。即使 Service 单元测试全部通过，Controller 仍可能把路径写错、漏掉 `@Valid`、返回错误状态码，
或者没有把异常交给统一 advice。

本课把反馈环放在 HTTP adapter：真实运行 Spring MVC 的映射、参数解析、校验、消息转换与异常处理，
同时用 Mockito 替代 Service。这样失败时能明确判断问题位于 Web 合同，而不需要启动服务器或数据库。

## 二、学习目标

- 能分清 Controller 测试、Service 单元测试和完整应用集成测试。
- 能从零建立 `@WebMvcTest`、`MockMvc` 与 `@MockitoBean` 反馈环。
- 能验证 GET、POST、路径变量、查询参数、JSON、状态码、响应头和响应体。
- 能验证输入校验、404/409 错误映射以及无效请求不会进入 Service。
- 能识别 Boot 4 与 Boot 2.3 的注解包名差异。

## 三、前置术语

- **Controller：** 把 HTTP 请求转换为用例调用，再把结果转换为 HTTP 响应的 adapter。
- **Servlet：** Java Web 的请求、响应与过滤链模型；MockMvc 使用 mock Servlet 对象运行 MVC。
- **测试切片：** 只加载某类组件及相关自动配置的测试上下文。
- **测试替身：** 在测试中代替真实协作者的对象；本课用 Mockito mock 代替 Service。
- **matcher：** 对可观察结果提出条件的断言组件，例如状态必须是 200。
- **Problem Details：** 结构化 HTTP 错误格式；本课只验证 I-13 已冻结的错误合同。

## 四、零基础知识点详解

### 1. Controller 测试：验证 HTTP adapter 合同

- **它是什么：** 直接向 Controller 所在的 MVC 边界发送模拟 HTTP 请求，并观察协议结果的测试。
- **有什么作用：** 它能发现映射、绑定、校验、序列化和状态码错误，而不会重复验证 Service 算法。
- **什么时候使用：** Controller 新增端点、修改 DTO、响应状态或 advice 映射时使用。
- **怎么使用：** 先安排 Service 返回值，再执行 MockMvc 请求，最后断言响应并验证 Service 调用。
- **最小示例：** `mockMvc.perform(get("/tasks/7")).andExpect(status().isOk());`
- **运行结果：** 请求匹配端点且 Controller 正常返回时测试通过；路径或状态不一致时 matcher 报错。
- **常见误区：** 只验证 Controller 方法的 Java 返回值，会绕过真实的 MVC 映射和消息转换。

### 2. MockMvc：不监听端口的 MVC 反馈环

- **它是什么：** Spring Test 提供的 MVC 测试入口，使用 mock request 和 response 执行请求处理。
- **有什么作用：** 它保留 DispatcherServlet 之后的 MVC 行为，同时避免启动嵌入式服务器。
- **什么时候使用：** 需要快速验证请求映射、参数绑定、消息转换和异常解析时使用。
- **怎么使用：** 注入 `MockMvc`，调用 `perform`，再用一个或多个 `andExpect` 断言结果。
- **最小示例：** `mockMvc.perform(get("/tasks/7")).andExpect(jsonPath("$.id").value(7));`
- **运行结果：** Spring MVC 生成 mock 响应；没有真实 TCP 连接，也没有随机服务器端口。
- **常见误区：** 把 MockMvc 测试写成“真实接口测试”，会夸大它对网络和部署配置的覆盖。

### 3. WebMvcTest：只加载目标 MVC 切片

- **它是什么：** Spring Boot 的测试注解，用于限定 Controller 和 MVC 相关组件。
- **有什么作用：** 它缩小 ApplicationContext，减少无关配置，并让失败更接近 Web 边界。
- **什么时候使用：** 单独验证一个或少量 Controller，不需要真实数据库和完整应用 Bean 时使用。
- **怎么使用：** 在测试类标注 `@WebMvcTest(TaskController.class)`，再提供 Controller 的协作者。
- **最小示例：** `@WebMvcTest(TaskController.class)`
- **运行结果：** 目标 Controller、MVC 基础设施和符合切片规则的组件进入上下文，普通 Service 不会自动进入。
- **常见误区：** 认为“Spring 上下文已启动”就等于完整应用已被验证；slice 只覆盖被准入的部分。

### 4. MockitoBean：为现代切片提供 Service 替身

- **它是什么：** Spring Test 在测试 ApplicationContext 中用 Mockito mock 覆盖 bean 的注解。
- **有什么作用：** 它满足 Controller 构造器依赖，并让测试精确安排业务结果和异常。
- **什么时候使用：** Boot 4 / Framework 7 的 MVC slice 需要隔离 Service、仓储或外部网关时使用。
- **怎么使用：** 在测试字段上标注 `@MockitoBean`，字段类型必须与 Controller 依赖一致。
- **最小示例：** `@MockitoBean private TaskService taskService;`
- **运行结果：** 上下文能创建 Controller；调用端点时，Service 行为由 Mockito stub 决定。
- **常见误区：** 漏掉替身会使上下文因缺少 bean 失败，这不是 Controller 路由返回 404。

### 5. MockBean：Boot 2.3 的兼容注解

- **它是什么：** Boot 2.3 提供的旧测试注解，也会向上下文添加或替换 Mockito mock。
- **有什么作用：** 它让 Java 8 / Boot 2.3 项目保持同样的 MVC slice 隔离思路。
- **什么时候使用：** 只在旧线 `org.springframework.boot.test.mock.mockito.MockBean` 中使用。
- **怎么使用：** 旧测试使用旧 `WebMvcTest` 包名并在 Service 字段标注 `@MockBean`。
- **最小示例：** `@MockBean private TaskService taskService;`
- **运行结果：** Boot 2.3 上下文获得 Service mock；测试仍通过 MockMvc 发送模拟请求。
- **常见误区：** 把现代 `@MockitoBean` import 复制到 Boot 2.3，会在编译阶段找不到类型。

### 6. perform：构造并执行一次请求

- **它是什么：** `MockMvc` 接受请求构造器并执行 MVC 请求处理的入口。
- **有什么作用：** 它把 HTTP method、URI、header 和 body 组成一个可重复请求。
- **什么时候使用：** 每一条 Controller 行为测试都从一次明确的 `perform` 开始。
- **怎么使用：** 选择 `get`、`post` 等构造器，补齐路径和请求数据，再连接 matcher。
- **最小示例：** `mockMvc.perform(post("/tasks").contentType(APPLICATION_JSON).content(json));`
- **运行结果：** 返回 `ResultActions`，可继续追加多个断言或调试输出。
- **常见误区：** 忘记 content type 会让 JSON 请求走不到预期消息转换器。

### 7. GET 路径变量：同时验证映射与类型转换

- **它是什么：** URL 路径中的动态片段，例如 `/tasks/7` 的 `7`。
- **有什么作用：** 测试可证明路径模板命中、文本被转换为目标 Java 类型，并传给 Service。
- **什么时候使用：** 读取、更新或删除某个稳定资源 ID 的端点。
- **怎么使用：** 构造包含 ID 的 URL，stub 相同 ID 的 Service 返回值，再验证 JSON 和调用参数。
- **最小示例：** `verify(taskService).findById(7L);`
- **运行结果：** 合法数字进入 Controller；无法转换的文本通常在调用 Service 前形成 400。
- **常见误区：** 只断言 200 而不验证 Service 参数，可能漏掉错误的路径变量绑定。

### 8. 查询参数：覆盖默认值和类型失败

- **它是什么：** URI 问号后的键值，例如 `?page=1&size=20`。
- **有什么作用：** 它验证参数名、默认值、类型转换和边界校验是否符合公开合同。
- **什么时候使用：** 分页、筛选和排序等不属于资源身份的输入。
- **怎么使用：** 用 `param` 添加值；分别测试省略、合法值与无法转换的值。
- **最小示例：** `mockMvc.perform(get("/tasks").param("limit", "5"));`
- **运行结果：** 省略时使用 20，合法值 5 传入 Controller；`limit=abc` 形成 400 且不进入 Service。
- **常见误区：** 只测试显式合法值，会漏掉默认值与输入错误合同。

### 9. POST JSON：完整表达 method、URI 和 body

- **它是什么：** 使用 POST 方法和 JSON body 创建资源的模拟请求。
- **有什么作用：** 它共同验证路由、消息转换、DTO 绑定、校验和创建响应。
- **什么时候使用：** 创建命令或其他以 JSON 作为请求体的端点。
- **怎么使用：** 选择 `post`、设置 `application/json`、提供 JSON，再安排 Service 结果。
- **最小示例：** `post("/tasks").contentType(APPLICATION_JSON).content("{\"title\":\"学习 MockMvc\"}")`
- **运行结果：** JSON 结构正确时绑定为请求 DTO；语法错误时通常在 Controller 调用前返回 400。
- **常见误区：** 只传 body 而不声明媒体类型，会把消息转换器选择问题误判为业务失败。

### 10. ObjectMapper：从真实 DTO 生成 JSON

- **它是什么：** Spring MVC 使用的 Jackson 对象映射器，也可在测试中序列化请求 DTO。
- **有什么作用：** 它减少手工 JSON 的引号和字段拼写错误，让测试输入更接近真实 DTO。
- **什么时候使用：** body 字段较多、存在嵌套对象，或字段名由 Jackson 规则控制时使用。
- **怎么使用：** 注入切片中的 `ObjectMapper`，调用 `writeValueAsString` 后传给 `content`。
- **最小示例：** `String json = objectMapper.writeValueAsString(new CreateTaskRequest("学习 MockMvc"));`
- **运行结果：** 得到可作为请求体的 JSON；MVC 再把它反序列化为新的请求 DTO。
- **常见误区：** 把同一个 Java 对象直接交给 Controller 方法，会绕过 JSON 消息转换。

### 11. status matcher：先证明 HTTP 语义

- **它是什么：** 对 mock 响应状态码的断言，例如 200、201、400 或 404。
- **有什么作用：** 状态码供客户端决定成功、重试或纠正输入，不能只靠 body 文案判断。
- **什么时候使用：** 每个 Controller 测试都应有明确状态断言。
- **怎么使用：** 根据端点合同选择 `isOk`、`isCreated`、`isBadRequest` 等 matcher。
- **最小示例：** `andExpect(status().isCreated())`
- **运行结果：** 实际状态与合同一致时通过；即使 body 正确，状态错误也会失败。
- **常见误区：** 只断言 JSON 字段，会放过“错误 body 配上 200”的协议缺陷。

### 12. content type matcher：验证消息转换结果

- **它是什么：** 对响应 `Content-Type` 的断言。
- **有什么作用：** 它证明响应由预期消息转换器写出，客户端可按正确格式解析。
- **什么时候使用：** JSON 成功响应和 Problem Details 错误响应。
- **怎么使用：** 普通 JSON 用兼容 JSON matcher，Problem Details 用对应媒体类型 matcher。
- **最小示例：** `andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))`
- **运行结果：** 含 charset 等兼容参数不会造成脆弱失败；错误媒体类型会被发现。
- **常见误区：** 把 content type 当作请求端 accept；两者位于不同方向。

### 13. jsonPath：按公开字段断言 JSON

- **它是什么：** 使用 JSONPath 表达式选择响应 JSON 中的字段。
- **有什么作用：** 它断言客户端可观察的数据，而不绑定 JSON 文本的空白和字段顺序。
- **什么时候使用：** 响应对象、数组、嵌套字段或 Problem Details 扩展字段。
- **怎么使用：** 从根符号 `$` 开始选择字段，再用 `value` 或存在性 matcher 断言。
- **最小示例：** `andExpect(jsonPath("$.title").value("学习 MockMvc"))`
- **运行结果：** 字段存在且值匹配时通过；其他无关字段顺序变化不会影响测试。
- **常见误区：** 用整段 JSON 字符串相等比较，会把格式化差异误报为合同变化。

### 14. header matcher：验证 Location 等元数据

- **它是什么：** 对响应头名称和值提出断言。
- **有什么作用：** 创建资源时，`Location` 告诉客户端新资源地址；它和 body 一样属于公开合同。
- **什么时候使用：** 201 创建、缓存 ETag、下载文件名或其他已冻结响应头。
- **怎么使用：** 先断言状态，再用 `header().string` 检查精确或模式值。
- **最小示例：** `andExpect(header().string("Location", "/tasks/8"))`
- **运行结果：** Controller 设置正确 URI 时通过；只有 201 而缺少 Location 时失败。
- **常见误区：** 验证实现内部 URI builder，却没有验证最终响应头。

### 15. Valid：在进入 Service 前触发输入校验

- **它是什么：** Controller 参数上的 `@Valid` 请求 Spring MVC 对绑定后的 DTO 执行 Bean Validation。
- **有什么作用：** 它阻止空标题等结构无效输入越过 HTTP 边界。
- **什么时候使用：** 请求 DTO 已声明 `@NotBlank`、`@Size` 等约束时。
- **怎么使用：** 请求参数同时使用 `@RequestBody` 与 `@Valid`，测试发送违反约束的 JSON。
- **最小示例：** `public ResponseEntity<TaskResponse> create(@Valid @RequestBody CreateTaskRequest request)`
- **运行结果：** 空标题形成 400；Controller 方法体和 Service 都不会执行。
- **常见误区：** DTO 有约束但 Controller 漏掉 `@Valid`，会让无效输入继续进入业务层。

### 16. never：证明失败请求没有越界

- **它是什么：** Mockito 的次数验证，表示某个调用在本测试中应发生零次。
- **有什么作用：** 它把“返回 400”与“没有产生业务副作用”同时写入验收条件。
- **什么时候使用：** 绑定失败、校验失败或认证失败必须在 Service 前终止时。
- **怎么使用：** 完成响应断言后，使用 `verify(taskService, never())` 验证目标方法。
- **最小示例：** `verify(taskService, never()).create(any());`
- **运行结果：** Service 未被调用时通过；即使响应后来被改成 400，偷偷发生的调用也会使测试失败。
- **常见误区：** 只写 `verifyNoInteractions` 可能把与当前合同无关的未来协作也锁死。

### 17. ControllerAdvice：确认默认发现与显式选择边界

- **它是什么：** `@WebMvcTest` 默认过滤规则包含扫描范围内的 `@ControllerAdvice`。
- **有什么作用：** 它让 Service 异常经过真实异常解析器转换为公开错误响应。
- **什么时候使用：** 同包 advice 先验证默认发现；位于扫描范围外或被过滤器排除时再显式选择。
- **怎么使用：** 保持 `@WebMvcTest(TaskController.class)`，安排 Service 抛异常并断言 advice 响应。
- **最小示例：** `when(taskService.findById(99L)).thenThrow(new TaskNotFoundException(99L));`
- **运行结果：** 同 package 的 advice 无需 `@Import` 即可把异常处理为 404 Problem Details。
- **常见误区：** 把普通 Service 不会自动进入 slice，误写成同包 advice 也必须 `@Import`。

### 18. Problem Details：同时断言状态、类型和安全字段

- **它是什么：** Spring `ProblemDetail` 表达的标准化 HTTP 错误响应。
- **有什么作用：** 它让客户端稳定读取状态、标题、详情和扩展错误码。
- **什么时候使用：** I-13 已冻结的 4xx/5xx 映射需要在 Web 边界回归时。
- **怎么使用：** 断言 HTTP status、`application/problem+json`、标准字段和允许公开的扩展字段。
- **最小示例：** `andExpect(jsonPath("$.code").value("TASK_NOT_FOUND"))`
- **运行结果：** 404 响应包含安全、稳定字段；内部异常类名与堆栈不应出现在 body。
- **常见误区：** 只断言 detail 文案，会把可变的人类文本误当成稳定机器合同。

### 19. 用 mock 驱动 Service 结果和异常

- **它是什么：** 使用 `when(...).thenReturn(...)` 或 `thenThrow(...)` 安排协作者行为。
- **有什么作用：** 它让每条 Controller 路径独立、确定，不连接数据库或外部系统。
- **什么时候使用：** 成功、缺失、冲突等业务结果已经由前置课程定义时。
- **怎么使用：** 只 stub 当前测试会发生的调用，再通过 HTTP 断言观察映射结果。
- **最小示例：** `when(taskService.create(any())).thenReturn(new TaskResponse(8L, "学习 MockMvc"));`
- **运行结果：** Controller 收到固定业务结果，测试只判断其 HTTP 表达是否正确。
- **常见误区：** 在 MVC slice 中启动真实仓储，会把测试范围扩张成不完整的集成测试。

### 20. 404、409、422 与 500：只测试既有映射

- **它是什么：** 不同失败语义对应的 HTTP 状态分支。
- **有什么作用：** 测试能阻止错误合同在重构后退化成统一 200 或统一 500。
- **什么时候使用：** 业务与错误课程已经冻结了明确异常到状态码映射时。
- **怎么使用：** 每条测试只安排一个已知异常，并断言对应 status 和稳定错误码。
- **最小示例：** `andExpect(status().isConflict())`
- **运行结果：** 已冻结分支得到精确响应；未知异常仍由通用 500 策略处理。
- **常见误区：** 在 Controller 测试里发明新的业务分类，会让测试替代需求设计。

### 21. andDo print：只用于诊断

- **它是什么：** 把模拟请求、handler 和响应打印到测试输出的结果处理器。
- **有什么作用：** matcher 失败时，它帮助观察实际状态、header 和 body。
- **什么时候使用：** 本地排查失败或临时建立反馈环时按需添加。
- **怎么使用：** 在 `perform` 后连接 `andDo(print())`，定位后仍保留真正的 matcher。
- **最小示例：** `mockMvc.perform(get("/tasks/7")).andDo(print()).andExpect(status().isOk());`
- **运行结果：** 控制台显示请求响应详情；测试成功与否仍由断言决定。
- **常见误区：** 看到输出“看起来正确”就删除断言，会使自动回归失去判断标准。

### 22. standalone setup：更窄的纯 MVC 边界

- **它是什么：** 直接注册 Controller 构建 MockMvc，而不创建 Boot 测试切片。
- **有什么作用：** 它提供更快、更显式的 MVC 单元边界，适合极小的独立 Controller。
- **什么时候使用：** 不需要 Boot 自动配置、转换器和过滤链，只验证手工注册组件时。
- **怎么使用：** 调用 `standaloneSetup(controller)`，并显式注册 advice、转换器等依赖。
- **最小示例：** `MockMvcBuilders.standaloneSetup(controller).setControllerAdvice(advice).build();`
- **运行结果：** 只运行手工提供的 MVC 配置；遗漏的组件不会由 Boot 自动补齐。
- **常见误区：** 把 standalone 通过等同于 `@WebMvcTest` 或生产 MVC 配置通过。

### 23. Security 过滤链：不能默认关闭的请求边界

- **它是什么：** Spring Security 在 DispatcherServlet 前处理认证、授权与 CSRF 的 Servlet filters。
- **有什么作用：** 它决定请求是否能到达 Controller，是真实 HTTP 边界的一部分。
- **什么时候使用：** 项目 classpath 和配置中存在 Spring Security 时。
- **怎么使用：** 引入官方 security-test 支持，按合同构造身份、权限和 CSRF；A-07 再系统展开。
- **最小示例：** `mockMvc.perform(post("/tasks").with(csrf()).contentType(APPLICATION_JSON).content(json))`
- **运行结果：** 请求按真实安全合同得到成功、401 或 403；不会因跳过 filters 而产生假阳性。
- **常见误区：** 为了让测试变绿全局关闭 filters，会绕过生产请求首先经过的控制。

### 24. 四条路径：闭合 Controller 最小反馈环

- **它是什么：** 成功、校验失败、资源缺失和业务冲突四类代表性路径。
- **有什么作用：** 它以较少测试覆盖映射、输入、成功响应和主要错误映射。
- **什么时候使用：** 发布一个包含创建和查询的 Controller 前。
- **怎么使用：** 每条测试只聚焦一个原因，复用必要 fixture，并连续运行确认无状态泄漏。
- **最小示例：** `GET 200；POST 201；POST 空标题 400；GET 缺失 404；POST 重复标题 409`。
- **运行结果：** 四条路径数量和结果在重复执行时一致，Service mock 在每个测试后由框架重置。
- **常见误区：** 用一条超长测试串联所有请求，会让前一步失败污染后续判断。

## 五、现代版本中的正确用法

现代主线使用 Java 25、Boot 4.1.0 与 Framework 7.0.8。MVC 应用依赖
`spring-boot-starter-webmvc`，校验依赖 `spring-boot-starter-validation`，MVC 测试依赖使用
test scope 的 `spring-boot-starter-webmvc-test`。版本由 Boot BOM 管理，不单独覆盖 JUnit 或 Mockito。

测试类只指定目标 Controller；同扫描范围的错误 advice 会按 `@WebMvcTest` 默认过滤规则进入切片。
`@MockitoBean` 来自 Spring Test：

~~~java
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(TaskController.class)
class TaskControllerTest {
    @MockitoBean
    private TaskService taskService;
}
~~~

这段配置有三个可观察边界：

1. 只有 `TaskController` 是本测试明确选择的 Controller。
2. `TaskService` 是上下文中的 Mockito mock，不会访问数据库。
3. 同 package 的 `ApiExceptionHandler` 被默认发现，404/409 可按公开合同断言。

如果 advice 位于应用扫描范围外，或测试主动排除了它，再使用 `@Import(ApiExceptionHandler.class)`
显式选择；不要把这个条件写成所有 MVC slice 的固定模板。

## 六、核心接口与断言链

一条完整 MockMvc 测试遵循 Arrange、Act、Assert：

~~~java
/**
 * 查询存在任务时返回公开 JSON。
 */
@Test
void shouldReturnTaskWhenTaskExists() throws Exception {
    when(taskService.findById(7L)).thenReturn(new TaskResponse(7L, "学习 MockMvc"));

    mockMvc.perform(get("/tasks/{id}", 7L))
        .andExpect(status().isOk())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.id").value(7))
        .andExpect(jsonPath("$.title").value("学习 MockMvc"));

    verify(taskService).findById(7L);
}
~~~

Arrange 只安排当前路径需要的 Service 行为；Act 只有一次请求；Assert 同时检查协议结果和必要的协作者
调用。不要通过反射读取 Controller 私有字段，也不要断言 Spring 内部 handler 实现细节。

## 七、从零跟着做

下面建立一个只含任务列表、单项查询和创建的最小工程。所有文件使用同一 package
`example.controller`；测试不会启动真实端口，也不连接数据库。先确认 B-19 已准备 Maven 与 Java 25，
再从一个可精确清理的临时目录开始：

~~~bash
mvn -version
java -version
course_dir="$(mktemp -d /tmp/controller-slice.XXXXXX)"
cd "$course_dir"
mkdir -p src/main/java/example/controller src/test/java/example/controller
pwd
~~~

若 `mvn -version` 或 `java -version` 失败，先回到 B-19 修复环境，不要继续复制文件。后续代码分别写入：

| 文件 | 作用 |
| --- | --- |
| `pom.xml` | Maven 依赖与 Java 版本 |
| `src/main/java/example/controller/TaskApplication.java` | Boot 应用入口 |
| `src/main/java/example/controller/CreateTaskRequest.java` | 创建请求 DTO |
| `src/main/java/example/controller/TaskResponse.java` | 公开响应 DTO |
| `src/main/java/example/controller/TaskService.java` | Controller 的业务协作者合同 |
| `src/main/java/example/controller/TaskController.java` | 列表、单项查询与创建端点 |
| `src/main/java/example/controller/TaskNotFoundException.java` | 资源缺失异常 |
| `src/main/java/example/controller/DuplicateTaskException.java` | 标题冲突异常 |
| `src/main/java/example/controller/ApiExceptionHandler.java` | 同包错误映射 advice |
| `src/test/java/example/controller/TaskControllerTest.java` | 八条 MVC slice 测试 |

按下面的有序步骤完成整个反馈环：

1. 创建 Maven 工程。
2. 添加应用入口和 Web 合同。
3. 添加 Controller 和错误映射。
4. 添加八条 MVC slice 测试。
5. 运行测试、读取结果并清理临时目录。

### 创建 Maven 工程

`pom.xml` 使用 Boot parent 管理依赖版本：

~~~xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>4.1.0</version>
    <relativePath/>
  </parent>
  <groupId>example</groupId>
  <artifactId>controller-slice</artifactId>
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
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-webmvc-test</artifactId>
      <scope>test</scope>
    </dependency>
  </dependencies>
</project>
~~~

### 添加应用入口和 Web 合同

文件：`src/main/java/example/controller/TaskApplication.java`

~~~java
package example.controller;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TaskApplication {
    /**
     * 启动示例应用。
     */
    public static void main(String[] args) {
        SpringApplication.run(TaskApplication.class, args);
    }
}
~~~

文件：`src/main/java/example/controller/CreateTaskRequest.java`

~~~java
package example.controller;

import jakarta.validation.constraints.NotBlank;

public record CreateTaskRequest(@NotBlank String title) {
}
~~~

文件：`src/main/java/example/controller/TaskResponse.java`

~~~java
package example.controller;

public record TaskResponse(long id, String title) {
}
~~~

文件：`src/main/java/example/controller/TaskService.java`

~~~java
package example.controller;

import java.util.List;

public interface TaskService {
    /**
     * 按数量上限列出任务。
     */
    List<TaskResponse> findAll(int limit);

    /**
     * 按 ID 查询任务。
     */
    TaskResponse findById(long id);

    /**
     * 创建任务。
     */
    TaskResponse create(CreateTaskRequest request);
}
~~~

### 添加 Controller 和错误映射

文件：`src/main/java/example/controller/TaskController.java`

~~~java
package example.controller;

import java.net.URI;
import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/tasks")
public class TaskController {
    private final TaskService taskService;

    /**
     * 创建任务入口。
     */
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * 按数量上限列出任务。
     */
    @GetMapping
    public List<TaskResponse> findAll(
        @RequestParam(defaultValue = "20") int limit
    ) {
        return taskService.findAll(limit);
    }

    /**
     * 查询一个任务。
     */
    @GetMapping("/{id}")
    public TaskResponse findById(@PathVariable long id) {
        return taskService.findById(id);
    }

    /**
     * 创建任务并返回新资源地址。
     */
    @PostMapping
    public ResponseEntity<TaskResponse> create(
        @Valid @RequestBody CreateTaskRequest request
    ) {
        TaskResponse created = taskService.create(request);
        return ResponseEntity
            .created(URI.create("/tasks/" + created.id()))
            .body(created);
    }
}
~~~

文件：`src/main/java/example/controller/TaskNotFoundException.java`

~~~java
package example.controller;

public final class TaskNotFoundException extends RuntimeException {
    /**
     * 创建资源缺失异常。
     */
    public TaskNotFoundException(long id) {
        super("task not found: " + id);
    }
}
~~~

文件：`src/main/java/example/controller/DuplicateTaskException.java`

~~~java
package example.controller;

public final class DuplicateTaskException extends RuntimeException {
    /**
     * 创建任务冲突异常。
     */
    public DuplicateTaskException() {
        super("task title already exists");
    }
}
~~~

文件：`src/main/java/example/controller/ApiExceptionHandler.java`

~~~java
package example.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
    /**
     * 把资源缺失转换为安全的 404 错误合同。
     */
    @ExceptionHandler(TaskNotFoundException.class)
    public ResponseEntity<ProblemDetail> handleNotFound() {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.NOT_FOUND,
            "请求的任务不存在"
        );
        problem.setTitle("任务不存在");
        problem.setProperty("code", "TASK_NOT_FOUND");
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .contentType(MediaType.APPLICATION_PROBLEM_JSON)
            .body(problem);
    }

    /**
     * 把重复任务转换为 409 错误合同。
     */
    @ExceptionHandler(DuplicateTaskException.class)
    public ResponseEntity<ProblemDetail> handleConflict() {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.CONFLICT,
            "任务标题已经存在"
        );
        problem.setTitle("任务冲突");
        problem.setProperty("code", "TASK_ALREADY_EXISTS");
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .contentType(MediaType.APPLICATION_PROBLEM_JSON)
            .body(problem);
    }
}
~~~

### 添加八条 MVC slice 测试

文件：`src/test/java/example/controller/TaskControllerTest.java`

~~~java
package example.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

@WebMvcTest(TaskController.class)
class TaskControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TaskService taskService;

    /**
     * 省略查询参数时使用默认上限 20。
     */
    @Test
    void shouldUseDefaultQueryLimit() throws Exception {
        when(taskService.findAll(20))
            .thenReturn(List.of(new TaskResponse(7L, "学习 MockMvc")));

        mockMvc.perform(get("/tasks"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(7));

        verify(taskService).findAll(20);
    }

    /**
     * 显式查询参数传入 Controller。
     */
    @Test
    void shouldUseExplicitQueryLimit() throws Exception {
        when(taskService.findAll(5)).thenReturn(List.of());

        mockMvc.perform(get("/tasks").param("limit", "5"))
            .andExpect(status().isOk());

        verify(taskService).findAll(5);
    }

    /**
     * 非数字查询参数在调用 Service 前返回 400。
     */
    @Test
    void shouldRejectNonNumericQueryLimit() throws Exception {
        mockMvc.perform(get("/tasks").param("limit", "abc"))
            .andExpect(status().isBadRequest());

        verify(taskService, never()).findAll(anyInt());
    }

    /**
     * 查询存在任务时返回 200 与 JSON。
     */
    @Test
    void shouldReturnTaskWhenTaskExists() throws Exception {
        when(taskService.findById(7L))
            .thenReturn(new TaskResponse(7L, "学习 MockMvc"));

        mockMvc.perform(get("/tasks/{id}", 7L))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(7))
            .andExpect(jsonPath("$.title").value("学习 MockMvc"));

        verify(taskService).findById(7L);
    }

    /**
     * 合法请求创建任务时返回 201 与 Location。
     */
    @Test
    void shouldCreateTask() throws Exception {
        CreateTaskRequest request = new CreateTaskRequest("学习 MockMvc");
        when(taskService.create(any(CreateTaskRequest.class)))
            .thenReturn(new TaskResponse(8L, request.title()));

        mockMvc.perform(post("/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", "/tasks/8"))
            .andExpect(jsonPath("$.id").value(8));

        verify(taskService).create(any(CreateTaskRequest.class));
    }

    /**
     * 空标题在调用 Service 前返回 400。
     */
    @Test
    void shouldRejectBlankTitleBeforeService() throws Exception {
        CreateTaskRequest request = new CreateTaskRequest(" ");

        mockMvc.perform(post("/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());

        verify(taskService, never()).create(any(CreateTaskRequest.class));
    }

    /**
     * 资源缺失时返回安全的 Problem Details。
     */
    @Test
    void shouldReturnProblemWhenTaskIsMissing() throws Exception {
        when(taskService.findById(99L)).thenThrow(new TaskNotFoundException(99L));

        mockMvc.perform(get("/tasks/{id}", 99L))
            .andExpect(status().isNotFound())
            .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
            .andExpect(jsonPath("$.title").value("任务不存在"))
            .andExpect(jsonPath("$.code").value("TASK_NOT_FOUND"));
    }

    /**
     * 标题冲突时返回 409。
     */
    @Test
    void shouldReturnConflictWhenTitleExists() throws Exception {
        when(taskService.create(any(CreateTaskRequest.class)))
            .thenThrow(new DuplicateTaskException());

        mockMvc.perform(post("/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"重复任务\"}"))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.code").value("TASK_ALREADY_EXISTS"));
    }
}
~~~

### 运行并读取结果

在项目根目录执行：

~~~bash
mvn test
mvn test
~~~

两次都应看到 8 条测试通过且失败数为 0。重复运行用于发现静态状态或测试顺序污染；它不等于性能测试。

然后临时删除测试中的 `@MockitoBean` 字段并再运行一次。预期上下文因缺少 `TaskService` bean
启动失败。恢复字段并复跑，8 条测试应重新通过。这条负例证明替身确实参与了 slice 组装。

本例的 `ApiExceptionHandler` 与应用入口同包，`@WebMvcTest` 默认会发现它。不要添加 `@Import`，
404 与 409 仍应通过；这正是 advice 默认过滤规则的反馈证据。只有 advice 位于扫描范围外，或测试主动
排除了它时，才应显式导入。

若测试失败，先运行 `mvn -Dtest=TaskControllerTest test` 缩小范围，再读取
`target/surefire-reports` 中的失败测试、实际状态和异常。恢复最近一次改动后复跑同一命令，不要靠删除
matcher 让测试变绿。完成练习后离开临时目录并精确清理：

~~~bash
cd /tmp
find "$course_dir" -depth -delete
~~~

## 八、如何使用

1. 从端点公开合同列出 method、URI、输入、成功状态、响应头和错误状态。
2. 使用 `@WebMvcTest` 只选择当前 Controller，并确认同扫描范围的 advice 被默认发现。
3. 使用 `@MockitoBean` 隔离 Service，只安排当前路径用到的行为。
4. 对每条路径执行一次 MockMvc 请求，先断言 status，再断言媒体类型、header 和 JSON。
5. 对校验失败验证 Service 为 `never()`，对成功路径验证关键调用参数。
6. 连续运行目标测试；失败时临时使用 `andDo(print())` 观察实际响应。

## 九、适用与不适用场景

| 场景 | 是否适合本课方案 | 原因 |
| --- | --- | --- |
| Controller 映射、绑定、校验和 advice | 适合 | 都位于 MVC 边界 |
| Service 分支和仓储协作 | 不适合 | I-14 的普通单元测试更直接 |
| 完整应用 Bean 装配 | 不适合 | 需要 SpringBootTest |
| 真实端口、代理或 TLS | 不适合 | MockMvc 不建立网络连接 |
| 真实 MySQL 与 SQL 方言 | 不适合 | 应使用数据库集成反馈环 |
| 认证、授权与 CSRF | 有条件适合 | 过滤链属于边界，系统教学留到 A-07 |

:::tip
先断言最稳定的协议字段。错误码和 status 通常比 detail 文案稳定；只在文案本身属于产品合同时断言全文。
:::

## 十、当前项目补充

`dzzz-app` 已存在 Controller、MVC 配置和自定义校验异常，这说明 Web adapter 需要独立反馈环。
本课只复用这个学习动机，不复制业务控制器，也不把项目当前错误格式当作现代推荐合同。

对 Java 8 项目补测试时，应先选择一个小 Controller，把外部依赖替换为 `@MockBean`，再分别验证
合法请求和输入失败。不要在第一次引入 MockMvc 时同时迁移全部 Controller 或错误格式。

## 十一、Java 8 / Spring Boot 2.3 兼容写法

旧线的核心思路不变，但 import 和错误对象不同：

~~~java
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@WebMvcTest(TaskController.class)
public class TaskControllerTest {
    @MockBean
    private TaskService taskService;
}
~~~

Boot 2.3 使用 `spring-boot-starter-test`，请求 DTO 的约束来自 `javax.validation`。Spring 5.2
没有现代 `ProblemDetail`；应使用已冻结字段的普通 `ApiError`，例如 `status`、`code` 和
`message`，而不是在旧项目中伪造现代类型。

## 十二、新旧版本差异

| 对比项 | Boot 4.1 / Framework 7 | Boot 2.3 / Framework 5.2 |
| --- | --- | --- |
| MVC 测试 starter | `spring-boot-starter-webmvc-test` | `spring-boot-starter-test` |
| WebMvcTest 包 | `boot.webmvc.test.autoconfigure` | `boot.test.autoconfigure.web.servlet` |
| mock bean | Spring Test `@MockitoBean` | Boot `@MockBean` |
| JSON 映射器包 | `tools.jackson.databind` | `com.fasterxml.jackson.databind` |
| Validation 包 | `jakarta.validation` | `javax.validation` |
| 错误对象 | `ProblemDetail` | 自定义 `ApiError` |

## 十三、易错点

:::pitfalls
### 错误：切片因缺少 Service bean 启动失败

**触发条件：** Controller 使用构造器注入 Service，但测试没有声明 mock bean。

**原因：** WebMvcTest 不会自动扫描普通 Service。

**后果：** ApplicationContext 在发送请求前失败。

**错误示例：**

~~~java
@WebMvcTest(TaskController.class)
class TaskControllerTest {
}
~~~

**正确写法：**

~~~java
@MockitoBean
private TaskService taskService;
~~~

**验证方式：** 先复现缺 bean 失败，恢复替身后用同一测试命令通过。
:::

:::pitfalls
### 错误：期望 400 却返回 201

**触发条件：** 请求 DTO 有约束，但 Controller 参数遗漏 `@Valid`。

**原因：** 反序列化成功不代表 Bean Validation 自动执行。

**后果：** 无效输入进入 Service，可能产生错误数据。

**错误示例：**

~~~java
create(@RequestBody CreateTaskRequest request)
~~~

**正确写法：**

~~~java
create(@Valid @RequestBody CreateTaskRequest request)
~~~

**验证方式：** 空标题断言 400，并验证 Service 为 `never()`。
:::

:::pitfalls
### 错误：把 Import 写成同包 advice 的必需条件

**触发条件：** advice 与应用入口同属扫描范围，但测试仍宣称缺少 `@Import` 会破坏错误合同。

**原因：** 把普通 Service 不会进入 slice 的规则误套到了 `@ControllerAdvice` 默认过滤规则。

**后果：** 负例无法复现，学习者会复制没有必要的测试配置。

**错误示例：**

~~~java
@WebMvcTest(TaskController.class)
@Import(ApiExceptionHandler.class) // 同包默认可发现时仍宣称“必须”
class TaskControllerTest {
}
~~~

**正确写法：**

~~~java
@WebMvcTest(TaskController.class)
class TaskControllerTest {
}
~~~

**验证方式：** 不添加 `@Import`，缺失与冲突路径仍分别得到 404 与 409；只有 advice 不在扫描范围时
才显式导入。
:::

:::pitfalls
### 错误：关闭全部 filters 让测试变绿

**触发条件：** classpath 中存在 Spring Security，测试为了绕过 401/403 禁用过滤器。

**原因：** 测试跳过了真实请求首先经过的安全边界。

**后果：** 未认证请求可能在测试中成功，在生产中失败。

**错误示例：**

~~~java
@AutoConfigureMockMvc(addFilters = false)
~~~

**正确写法：**

~~~java
mockMvc.perform(post("/tasks").with(csrf()))
~~~

**验证方式：** 对照执行未认证、权限不足和成功请求；完整规则在 A-07 验证。
:::

## 十四、错误与正确写法对比

:::compare
### 错误写法

~~~java
assertEquals(
    "{\"id\":7,\"title\":\"学习 MockMvc\"}",
    response.getContentAsString()
);
~~~

### 正确写法

~~~java
mockMvc.perform(get("/tasks/{id}", 7L))
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.id").value(7));
~~~
:::

## 十五、安全注意

- Problem Details 只返回允许公开的 code 与说明，不包含异常类名、堆栈、SQL 或内部路径。
- Security 存在时，Controller 测试不能默认绕过过滤链。
- 校验失败测试使用中性输入，不把真实口令、令牌或个人数据写入 fixture 和测试报告。

## 十六、如何验证

1. 现代 fixture 运行 8 条测试两次，数量一致且失败数为 0。
2. 删除现代 `@MockitoBean` 复现上下文失败，恢复后用同一命令通过。
3. 在真实 Java 8 runtime 复跑 GET 200、POST 201、空标题 400 和 Service `never()`。
4. 课程页面检查标题编号、代码块、来源区域和桌面/390px 水平溢出。

:::exercise
### 练习：补充路径变量类型错误测试

**要求：** 对 `GET /tasks/not-a-number` 编写 MockMvc 测试，断言 400，并证明
`taskService.findById` 没有被调用。

**验收：** 测试单独和全类执行都通过；不启动真实端口，不连接数据库。

**参考答案：** 使用 `get("/tasks/{id}", "not-a-number")`，断言 `isBadRequest()`，再使用
`verify(taskService, never()).findById(anyLong())`。
:::

## 十七、本节小结

- MockMvc 验证 mock Servlet 上的真实 MVC 链路，不是网络端到端测试。
- WebMvcTest 缩小上下文；现代 MockitoBean 与旧 MockBean 负责提供 Service 替身。
- 成功响应需要断言 status、媒体类型、header 和公开 JSON 字段。
- 校验失败要同时证明 400 与 Service 从未被调用。
- Advice 和 Security filters 是否进入切片，会直接改变可验证的请求边界。
- 完整应用、真实端口、数据库和 WireMock 留给后续集成测试课程。
