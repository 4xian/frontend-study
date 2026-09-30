---
id: backend.java.learn.intermediate.controller-testing-mockmvc-and-test-slices
type: lesson
title: MockMvc 接口测试
summary: 在不启动真实端口和数据库的情况下验证 Spring MVC 的映射、绑定、校验、响应和错误合同
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 150
prerequisites:
  - backend.java.learn.intermediate.testing-with-junit-and-mocks
objectives:
  - 能区分 MockMvc MVC 测试、Service 单元测试和完整应用集成测试的可验证边界。
  - 能用 WebMvcTest、MockMvc 和 MockitoBean 建立只加载 Web 层的测试切片。
  - 能构造路径变量、查询参数和 JSON 请求，并断言状态、媒体类型、响应头和 JSON 字段。
  - 能证明请求体校验失败时不会调用 Service，并识别分页参数转换失败发生在协作者调用之前。
  - 能让 ControllerAdvice 把业务异常和校验异常转换为稳定的 Problem Details 响应。
  - 能判断 Security 过滤链、standaloneSetup 和 SpringBootTest 何时属于当前测试边界。
  - 能把 Boot 4.1 的 MockitoBean、jakarta.validation 与 Jackson 3 写法映射到 Boot 2.3 的兼容写法。
recap:
  - MockMvc 执行真实 Spring MVC 请求处理，但使用 mock request/response，不建立真实 TCP 连接。
  - WebMvcTest 只加载 MVC 相关组件，Controller 的 Service 协作者必须显式提供测试替身。
  - 请求测试先断言公开 HTTP 合同，再验证必要的 Service 调用或禁止调用。
  - '@Valid 和分页参数转换失败都可能在 Service 之前终止请求；路径变量则应验证绑定后的资源身份。'
  - ControllerAdvice 是否进入切片，决定异常到 Problem Details 的映射能否被验证。
  - Boot 4.1 使用 MockitoBean 与 jakarta.validation；Boot 2.3 使用 MockBean 与 javax.validation。
  - Security 存在时，过滤链和 CSRF 是请求边界的一部分，不能无条件关闭 filters 追求绿色。
related: []
tags:
  - Java
  - Spring MVC
  - MockMvc
  - WebMvcTest
  - Controller 测试
  - 测试切片
  - Problem Details
  - 请求校验
appliesTo: Java 25、Spring Boot 4.1.1、Spring Framework 7.0.9、JUnit 6.0.3、Mockito 5.23.0 主线；Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE、JUnit 5.6.3、Mockito 3.3.3 兼容补充
verifiedAt: 2026-08-26
sources:
  - id: boot-411-system-requirements
    title: Spring Boot 4.1.1 System Requirements
    url: https://docs.spring.io/spring-boot/4.1/system-requirements.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.1
    claims:
      - Spring Boot 4.1.1 要求 Java 17 至 26，并要求 Spring Framework 7.0.9 或以上
  - id: boot-411-dependencies
    title: Spring Boot 4.1.1 Dependency Management
    url: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-dependencies/4.1.1/spring-boot-dependencies-4.1.1.pom
    sourceOrigin: official
    sourceType: source-code
    appliesTo: Spring Boot 4.1.1
    claims:
      - Boot 4.1.1 管理 Spring Framework 7.0.9、Spring Security 7.1.1、JUnit 6.0.3 与 Mockito 5.23.0
  - id: boot-411-webmvc-test
    title: Spring Boot 4.1.1 WebMvcTest API
    url: https://docs.spring.io/spring-boot/4.1/api/java/org/springframework/boot/webmvc/test/autoconfigure/WebMvcTest.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Boot 4.1.1
    claims:
      - WebMvcTest 聚焦 Spring MVC 组件并自动配置 MockMvc
      - WebMvcTest 默认会纳入 MVC 相关组件、ControllerAdvice、安全过滤链和 MockMvc 支持
      - 完整应用配置应使用 SpringBootTest 与 AutoConfigureMockMvc，而不是 WebMvcTest
  - id: boot-411-webmvc-test-starter
    title: Spring Boot 4.1.1 Web MVC Test Starter POM
    url: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-webmvc-test/4.1.1/spring-boot-starter-webmvc-test-4.1.1.pom
    sourceOrigin: official
    sourceType: source-code
    appliesTo: Spring Boot 4.1.1
    claims:
      - 现代 MVC 测试使用 spring-boot-starter-webmvc-test
      - 测试 starter 由 Boot BOM 管理版本，不应在课程示例中手工拼接 JUnit 和 Mockito 版本
  - id: spring-70-mockmvc
    title: Spring Framework 7.0 MockMvc
    url: https://docs.spring.io/spring-framework/reference/7.0/testing/mockmvc.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.9
    claims:
      - MockMvc 执行完整 Spring MVC 请求处理，但使用 mock request 和 response 替代运行中的服务器
  - id: spring-70-mockmvc-requests
    title: Spring Framework 7.0 Performing Requests
    url: https://docs.spring.io/spring-framework/reference/7.0/testing/mockmvc/hamcrest/requests.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.9
    claims:
      - 请求构造器支持 HTTP method、路径变量、query parameter、header、content type 和 body
  - id: spring-70-mockmvc-expectations
    title: Spring Framework 7.0 Defining Expectations
    url: https://docs.spring.io/spring-framework/reference/7.0/testing/mockmvc/hamcrest/expectations.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.9
    claims:
      - MockMvc 结果匹配器可以断言 status、header、content、jsonPath 和多个同时成立的期望
      - standaloneSetup 是比 WebMvcTest 更窄的手工 MVC 边界
  - id: spring-70-mockito-bean
    title: Spring Framework 7.0 MockitoBean
    url: https://docs.spring.io/spring-framework/reference/7.0/testing/annotations/integration-spring/annotation-mockitobean.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.9
    claims:
      - MockitoBean 在测试 ApplicationContext 中创建或覆盖 Mockito mock
  - id: spring-70-requestbody-validation
    title: Spring Framework 7.0 RequestBody Validation
    url: https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-controller/ann-methods/requestbody.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.9
    claims:
      - RequestBody 与 Valid 组合会触发 Bean Validation
      - 请求体校验失败会在 Controller 调用协作者之前结束请求
  - id: spring-70-exception-handler
    title: Spring Framework 7.0 ExceptionHandler
    url: https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-controller/ann-exceptionhandler.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.9
    claims:
      - ExceptionHandler 与 ControllerAdvice 可以集中处理 Controller 抛出的异常
  - id: spring-70-problem-detail
    title: Spring Framework 7.0 ProblemDetail API
    url: https://docs.spring.io/spring-framework/docs/7.0.9/javadoc-api/org/springframework/http/ProblemDetail.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.9
    claims:
      - ProblemDetail 提供 status、type、title、detail、instance 和扩展 properties 等错误字段
  - id: security-71-mockmvc-setup
    title: Spring Security 7.1 Setting Up MockMvc
    url: https://docs.spring.io/spring-security/reference/servlet/test/mockmvc/setup.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Security 7.1.1
    claims:
      - springSecurity 将 SecurityFilterChain 接入 MockMvc
      - Security 测试支持提供 csrf 等请求后处理器
  - id: security-71-csrf
    title: Spring Security 7.1 CSRF Testing
    url: https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html
    sourceOrigin: official
    sourceType: security-standard
    appliesTo: Spring Security 7.1.1
    claims:
      - 启用 CSRF 时缺少或无效 token 的写请求会被过滤链拒绝
  - id: boot-2312-dependencies
    title: Spring Boot 2.3.12 Dependency Management
    url: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-dependencies/2.3.12.RELEASE/spring-boot-dependencies-2.3.12.RELEASE.pom
    sourceOrigin: official
    sourceType: source-code
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Boot 2.3.12 管理 Spring Framework 5.2.15、JUnit Jupiter 5.6.3 与 Mockito 3.3.3
  - id: boot-2312-webmvc-test
    title: Spring Boot 2.3.12 WebMvcTest API
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/api/org/springframework/boot/test/autoconfigure/web/servlet/WebMvcTest.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - 旧线 WebMvcTest 位于 org.springframework.boot.test.autoconfigure.web.servlet 包
      - 旧线 WebMvcTest 通过 MockBean 提供 Controller 的协作者
  - id: boot-2312-mockbean
    title: Spring Boot 2.3.12 MockBean API
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/api/org/springframework/boot/test/mock/mockito/MockBean.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - MockBean 会在 ApplicationContext 中添加或替换 Mockito mock
  - id: spring-5215-mockmvc
    title: Spring Framework 5.2.15 MockMvc
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/testing.html#spring-mvc-test-framework
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Spring 5.2.15 提供 MockMvc 请求构造与结果断言反馈环
---

# MockMvc 接口测试

Service 单元测试证明业务分支，但客户端真正看到的是 HTTP method、URI、状态码、响应头和 JSON。Controller
可能因为注解路径、参数转换、`@Valid`、消息转换或异常处理配置错误，让一个正确的 Service 结果变成错误的
接口响应。本课把边界放在 Spring MVC：请求经过 DispatcherServlet 的映射、绑定、校验、Controller 调用、
消息转换和 advice，但不打开真实端口，也不连接数据库。

完整示例分别提供 Boot 4.1.1/Java 25 与 Boot 2.3.12.RELEASE/Java 8 两个独立工程。两条工程的
`@WebMvcTest`、测试替身、校验 API 和 JSON 库不会混用；现代线使用 `@MockitoBean` 与 Jackson 3，兼容线使用
`@MockBean` 与 Jackson 2。

本课给 TeamFlow 增加的不是新生产端点，而是已冻结项目内任务 API 的 MVC 回归边界：分页查询、按项目和任务 ID
查询、创建任务、请求校验、参数转换和业务异常都由 Controller slice 测试保护。本课复用
`/api/v1/projects/{projectId}/tasks` 与 `/api/v1/projects/{projectId}/tasks/{taskId}`，任务响应保持已有的
`id`、`projectId`、`title`、`status`、`dueAt`、`assignee` 六字段，创建请求保持 `title`、`dueAt`、`assignee`
三字段；不会另造数值 ID 或简化响应外壳。错误响应也沿用既有的 `type`、`title`、`status`、`detail`、`instance`、
`code`、`traceId`、`errors` 合同。本课只用 mock Service 验证这些 HTTP 边界，不提前实现数据库、认证或完整项目
业务规则。

## 一、确定这类测试真正证明什么

### 1. Controller 是 HTTP adapter

Controller 的职责是把 HTTP 输入转换成用例参数，再把用例结果转换成协议响应。MockMvc 测试因此关注公开的
HTTP 合同：方法、路径、参数、请求体、状态、媒体类型、响应头和 JSON 字段。它不应该反射读取 Controller
私有字段，也不应该把 Service 内部算法重新复制一遍。

```java
mockMvc.perform(get("/api/v1/projects/{projectId}/tasks/{taskId}", "PRJ-1", "TASK-7"))
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.id").value("TASK-7"))
    .andExpect(jsonPath("$.projectId").value("PRJ-1"));
```

请求能匹配、Controller 能调用协作者并生成 JSON 时，这条断言证明的是 MVC adapter 合同；`TaskService` 如何
访问仓储仍由上一课的单元测试负责。

### 2. MockMvc 不等于真实网络端到端

MockMvc 使用 mock request 和 response 执行 Spring MVC 的请求处理，不监听 TCP 端口。因此它能验证映射、参数
绑定、消息转换和异常解析，但不能证明反向代理、TLS、真实 Servlet 容器、端口暴露或部署网络配置。

完整应用 Bean 装配与真实基础设施应使用后续集成测试。即使 MockMvc 测试通过，也不能把它描述成“接口已在真实
服务器上联调成功”。

### 3. 三种测试边界不能混为一谈

| 边界 | 主要对象 | 反馈内容 | 本课位置 |
| --- | --- | --- | --- |
| Service 单元测试 | 真实 Service + mock 协作者 | 业务分支和结果合同 | 上一课 |
| MVC 测试切片 | MVC 上下文 + MockMvc + mock Service | 映射、绑定、校验、响应和 advice | 本课 |
| 完整应用集成测试 | 完整 Spring 上下文和真实基础设施 | Bean 装配、数据库、事务、端口和跨层协作 | 后续课程 |

选择边界时先问“失败应该定位到哪一层”。如果问题是 `@RequestBody` 没有被校验，切片比 Service 单元测试更
合适；如果问题是 MySQL 约束是否真的回滚，则不能停在本课。

## 二、让 WebMvcTest 形成可解释的切片

### 1. WebMvcTest 只加载 MVC 相关组件

`@WebMvcTest(TaskController.class)` 选择目标 Controller，并自动配置 MVC 基础设施和 MockMvc。它不会把普通
Service、Repository 或数据库客户端自动当作真实 Bean 全部加载进来。这样测试上下文更小，失败也更接近 Web
边界。

```java
@WebMvcTest(TaskController.class)
class TaskControllerTest {
    @Autowired
    private MockMvc mockMvc;
}
```

Boot 4.1 的 WebMvcTest 默认也会处理 MVC 过滤范围内的 `@ControllerAdvice`、消息转换器、过滤器和安全相关
组件。它不是“只加载一个类”的反射工具，而是一个经过筛选的 Spring MVC ApplicationContext。

### 2. MockitoBean 交出 Controller 的协作者

Controller 仍然是上下文中的真实对象，Service 则由 `@MockitoBean` 提供 Mockito mock。缺少这个替身时，常见
结果是 ApplicationContext 在请求执行前因为无法满足构造器依赖而启动失败。

```java
@WebMvcTest(TaskController.class)
class TaskControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TaskService taskService;
}
```

每条测试就地安排当前路径会用到的 Service 返回值或异常。不要把所有端点的 stub 放进 `@BeforeEach`，否则
严格 Mockito 配置下会产生无关准备，也会让读者看不出请求前提。

### 3. Advice 的发现与显式导入

`@ControllerAdvice` 属于 MVC 测试切片可发现的组件。若 `ApiExceptionHandler` 在应用扫描范围内，通常不需要
额外 `@Import`；若它位于扫描范围外，或测试明确排除了它，才使用 `@Import(ApiExceptionHandler.class)`。

这个边界需要通过真实请求验证，而不是看到 advice 类存在就假设 404/409 一定会变成目标 JSON。切片测试的
价值正在于确认“当前上下文实际发现了哪些 Web 组件”。

## 三、从请求构造到响应断言

### 1. perform 是一次完整的请求反馈

`MockMvc.perform` 接收 `RequestBuilder`，执行请求并返回 `ResultActions`。请求构造器可以表达 method、URI、
路径变量、查询参数、header、content type 和 body。

```java
mockMvc.perform(
        post("/api/v1/projects/{projectId}/tasks", "PRJ-1")
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON)
            .content("{\"title\":\"学习 MockMvc\"}")
    )
    .andExpect(status().isCreated());
```

JSON body 应与 `contentType` 同时出现，否则 Controller 可能无法选择正确的消息转换器。`accept` 表达调用者
希望接收的媒体类型，不能用它替代请求 body 的 `contentType`。

### 2. 路径变量和查询参数都要经过真实绑定

路径变量负责资源身份，查询参数负责筛选或分页。不要直接调用 `taskController.findById("PRJ-1", "TASK-7")` 来代替 MockMvc，
因为那会跳过 `@GetMapping` 和 `@PathVariable` 的真实绑定。

```java
mockMvc.perform(get("/api/v1/projects/{projectId}/tasks/{taskId}", "PRJ-1", "TASK-7"))
    .andExpect(status().isOk());

mockMvc.perform(get("/api/v1/projects/{projectId}/tasks", "PRJ-1").param("pageSize", "5"))
    .andExpect(status().isOk());
```

如果 `pageSize` 是 `int` 而请求传入 `abc`，Spring MVC 会在 Controller 方法执行前报告参数转换失败。此时
Service 不应该被调用，这也是一条需要显式验证的边界。

### 3. 先断言协议骨架，再断言公开字段

响应断言按稳定性从外到内排列：先 status，再 content type，再 header，最后用 `jsonPath` 检查公开 JSON 字段。
`contentTypeCompatibleWith` 适合允许 charset 等兼容参数；完整字符串比较只有在 charset 本身是合同的一部分时
才使用。

```java
mockMvc.perform(get("/api/v1/projects/{projectId}/tasks/{taskId}", "PRJ-1", "TASK-7"))
    .andExpect(status().isOk())
    .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
    .andExpect(jsonPath("$.id").value(7))
    .andExpect(jsonPath("$.title").value("学习 MockMvc"));
```

创建资源还应检查 `Location`，因为它是客户端继续访问新资源的协议元数据：

```java
mockMvc.perform(post("/api/v1/projects/{projectId}/tasks", "PRJ-1")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"title\":\"学习 MockMvc\"}"))
    .andExpect(status().isCreated())
    .andExpect(header().string("Location", "/api/v1/projects/PRJ-1/tasks/TASK-8"));
```

### 4. 多个断言应共同表达一条合同

Spring Framework 提供 `andExpectAll`，可以在同一请求上收集多个失败。它适合 status、media type 和两个字段
共同组成一条响应合同；不要把互不相关的请求塞进同一个测试方法。

```java
mockMvc.perform(get("/api/v1/projects/{projectId}/tasks/{taskId}", "PRJ-1", "TASK-7"))
    .andExpectAll(
        status().isOk(),
        content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON),
        jsonPath("$.id").value("TASK-7")
    );
```

## 四、让校验和转换失败停在正确边界

### 1. @Valid 把请求体校验放在 Service 之前

`@Valid @RequestBody` 会先让消息转换器生成 DTO，再执行 Bean Validation。约束失败时 Spring MVC 处理校验异常，
Controller 方法体不会继续调用 Service。

```java
/** 校验通过后创建任务并返回新资源。 */
@PostMapping
public ResponseEntity<TaskResponse> create(
    @PathVariable String projectId,
    @Valid @RequestBody CreateTaskRequest request
) {
    TaskResponse created = taskService.create(projectId, request);
    return ResponseEntity.created(URI.create(
        "/api/v1/projects/" + projectId + "/tasks/" + created.id())).body(created);
}
```

对应测试不能只断言 400，还要验证 `taskService.create(...)` 为 `never()`。这样才能证明拒绝发生在 HTTP adapter
边界，而不是 Service 接到空标题后恰好返回某个错误。

### 2. 路径和查询参数转换也可能提前失败

`@PathVariable String taskId` 与 `@RequestParam int pageSize` 分别承担资源身份和分页大小。当前 TeamFlow 合同的
任务 ID 是字符串，不会触发数值转换；`pageSize` 收到 `not-a-number` 时，类型转换才会在 Controller 方法调用前失败。
对于这种参数转换测试，不需要安排 Service 返回值，只需要断言 400 并验证对应方法没有被调用。

```java
mockMvc.perform(get("/api/v1/projects/{projectId}/tasks", "PRJ-1")
        .param("pageSize", "not-a-number"))
    .andExpect(status().isBadRequest());

verify(taskService, never()).findAll(anyString(), any(), anyInt(), anyString());
```

### 3. 缺失字段、空字符串和错误 JSON 不是同一个输入

`{}`、`{\"title\":\"\"}`、`{\"title\":\" \"}` 和非法 JSON 可能分别触发不同的校验或消息转换路径。课程只需
覆盖当前 DTO 合同要求的代表性输入，但不能用一个空字符串测试声称所有解析失败都已经验证。

完整示例选择空白标题；练习补充分页参数类型错误。需要产品级字段错误列表时，应在 advice 合同中增加稳定的
字段名和错误码，再按字段级 JSON 断言，不要依赖框架默认的长 detail 文案。

## 五、用 Advice 验证稳定错误合同

### 1. 业务异常由 ControllerAdvice 统一映射

Controller 可以让 `TaskNotFoundException` 或 `DuplicateTaskException` 冒泡，再由 `@RestControllerAdvice` 统一
转成 `ProblemDetail`。测试通过 Service mock 抛出异常，直接观察最终 HTTP 响应。

```java
when(taskService.findById("PRJ-1", "TASK-99"))
    .thenThrow(new TaskNotFoundException("PRJ-1", "TASK-99"));

mockMvc.perform(get("/api/v1/projects/{projectId}/tasks/{taskId}", "PRJ-1", "TASK-99"))
    .andExpect(status().isNotFound())
    .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
    .andExpect(jsonPath("$.type").value("https://api.teamflow.example/problems/task-not-found"))
    .andExpect(jsonPath("$.status").value(404))
    .andExpect(jsonPath("$.instance").value("/api/v1/projects/PRJ-1/tasks/TASK-99"))
    .andExpect(jsonPath("$.code").value("TASK_NOT_FOUND"))
    .andExpect(jsonPath("$.traceId").value("demo-trace-id"))
    .andExpect(jsonPath("$.errors").isEmpty());
```

这里的测试没有启动真实 Service，因此只证明异常已经经过 MVC 的异常解析和 advice 映射；异常本身何时产生由
上一课的 Service 测试或后续集成测试负责。

### 2. ProblemDetail 只暴露安全字段

ProblemDetail 标准字段包含 status、type、title、detail、instance，应用还可以用 properties 放置稳定的错误码、
traceId 和 errors。测试应断言既有合同中的公开字段，不要把异常类名、堆栈、SQL 或内部路径写入响应。

```java
ProblemDetail problem = ProblemDetail.forStatusAndDetail(
    HttpStatus.NOT_FOUND,
    "请求的任务不存在"
);
problem.setTitle("任务不存在");
problem.setType(URI.create("https://api.teamflow.example/problems/task-not-found"));
problem.setInstance(URI.create("/api/v1/projects/PRJ-1/tasks/TASK-99"));
problem.setProperty("code", "TASK_NOT_FOUND");
problem.setProperty("traceId", "demo-trace-id");
problem.setProperty("errors", List.of());
```

### 3. 校验异常也应有稳定的最小映射

如果应用需要统一错误格式，advice 可以把 `MethodArgumentNotValidException` 映射为 400 ProblemDetail，并在
properties 中写入 `code` 和字段错误列表。正文示例只保留一个字段错误，避免把框架内部 `BindingResult` 结构
直接暴露给客户端。

```java
import java.util.Map;

/** 把请求体校验失败转换为本课的既有错误合同。 */
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ProblemDetail> handleValidation(
    MethodArgumentNotValidException failure
) {
    ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
    problem.setTitle("请求参数无效");
    problem.setProperty("code", "INVALID_REQUEST");
    problem.setDetail("请求体字段未通过校验");
    problem.setType(URI.create("https://api.teamflow.example/problems/validation-failed"));
    problem.setInstance(URI.create("/api/v1/projects/PRJ-1/tasks"));
    problem.setProperty("traceId", "demo-trace-id");
    problem.setProperty("errors", List.of(Map.of(
        "field", "title", "code", "NOT_BLANK", "message", "任务标题不能为空")));
    return ResponseEntity.badRequest()
        .contentType(MediaType.APPLICATION_PROBLEM_JSON)
        .body(problem);
}
```

## 六、安全过滤链、standaloneSetup 与完整测试

### 1. Security 在 classpath 时是请求边界的一部分

Boot 的 WebMvcTest 默认会自动配置 Spring Security 相关能力。如果应用包含 SecurityFilterChain，未认证请求或
缺少 CSRF token 的写请求可能在到达 Controller 前返回 401、403。测试不应为了让状态码变成 200 而无条件使用
`@AutoConfigureMockMvc(addFilters = false)`。

需要验证安全边界时，把过滤链接入 MockMvc，并使用 Security 测试支持提供身份或 CSRF：

```java
mockMvc.perform(
        post("/api/v1/projects/{projectId}/tasks", "PRJ-1")
            .with(csrf())
            .with(user("reader"))
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"title\":\"学习 MockMvc\"}")
    )
    .andExpect(status().isCreated());
```

这段代码只有在工程包含 `spring-security-test` 和相应安全配置时才成立；本课完整工程不引入 Security，避免
把认证授权提前扩展成独立课程。安全规则、角色和登录流程留给后续认证课程。

### 2. standaloneSetup 是更窄的手工边界

`MockMvcBuilders.standaloneSetup(controller)` 不启动 Spring ApplicationContext，适合快速验证一个 Controller
和手工注册的 converter、validator 或 advice。它不会自动反映 `@WebMvcTest` 的组件扫描、Boot 自动配置或安全
过滤链。

```java
MockMvc mvc = MockMvcBuilders
    .standaloneSetup(new TaskController(taskService))
    .setControllerAdvice(new ApiExceptionHandler())
    .build();
```

当问题是“注解和 MVC 组件在 Spring 上下文中能否协同工作”时，应使用 WebMvcTest；当问题是单个 Controller 的
最小映射行为且不需要 Spring 配置时，standaloneSetup 才更合适。

### 3. SpringBootTest 加载完整应用配置

如果要同时验证完整 Bean 装配和 MockMvc，可以使用 `@SpringBootTest` 配合 `@AutoConfigureMockMvc`。这会扩大
反馈范围，也可能连接数据库、读取外部配置和触发安全规则，不应拿它替代本课的快速切片。

## 七、Boot 4.1 与 Boot 2.3 的两条版本线

### 1. 现代线使用 Boot BOM 和新测试 starter

本课完整工程使用 Boot 4.1.1 parent，`spring-boot-starter-webmvc-test` 只放在 test scope。Boot BOM 管理
Spring Framework 7.0.9、JUnit 6.0.3 和 Mockito 5.23.0；不在 POM 中重复声明这些版本。

现代 import 的关键位置如下：

```java
import jakarta.validation.Valid;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import tools.jackson.databind.ObjectMapper;
```

Boot 4.1.1 的 Jackson 3 starter 使用 `tools.jackson` 包。它与 Boot 2.3 的 `com.fasterxml.jackson` 包不是同一条
import 线，不能只切换 JDK 后继续复用完整 import。

### 2. Boot 2.3 使用旧切片和 MockBean

Boot 2.3.12 的 WebMvcTest 位于旧包路径，协作者注解是 Boot 自己提供的 `@MockBean`：

```java
import javax.validation.Valid;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(TaskController.class)
public class TaskControllerTest {
    @MockBean
    private TaskService taskService;
}
```

Spring Framework 5.2 没有现代 `ProblemDetail`。旧项目应使用本课的 `ApiProblem` Bean，在 JSON 中保持
`type`、`title`、`status`、`detail`、`instance`、`code`、`traceId`、`errors` 八个既有字段；只替换
`javax.validation`、`@MockBean` 和 Jackson 2 的 import，不要把 `jakarta.validation` 或现代类型混入 Boot 2.3。

### 3. 两条线必须分别运行

现代测试必须在 Java 25 与 Boot 4.1.1 依赖图中运行；兼容测试必须在真实 Java 8 runtime 与 Boot 2.3.12 依赖图中
运行。只用 Java 25 的 `--release 8` 编译，不能证明 Spring 5.2、JUnit 5.6.3 和 Mockito 3.3.3 在 Java 8 上真的
能启动。

## 八、完整工程与运行结果

### 1. 建立最小 Maven 工程

下面的完整工程只验证 MVC adapter，不启动端口、不连接数据库，也不引入 Security。文件结构如下：

```text
controller-slice/
  pom.xml
  src/main/java/example/controller/TaskApplication.java
  src/main/java/example/controller/CreateTaskRequest.java
  src/main/java/example/controller/TaskStatus.java
  src/main/java/example/controller/TaskResponse.java
  src/main/java/example/controller/PageResponse.java
  src/main/java/example/controller/TaskService.java
  src/main/java/example/controller/TaskController.java
  src/main/java/example/controller/TaskNotFoundException.java
  src/main/java/example/controller/ApiExceptionHandler.java
  src/test/java/example/controller/TaskControllerTest.java
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
    <version>4.1.1</version>
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
```

### 2. 定义 DTO、Service 和 Controller

`TaskApplication.java`：

```java
package example.controller;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TaskApplication {
    /** 启动示例 Spring Boot 应用。 */
    public static void main(String[] args) {
        SpringApplication.run(TaskApplication.class, args);
    }
}
```

`TaskStatus.java`：

```java
package example.controller;

public enum TaskStatus { TODO, DONE }
```

`CreateTaskRequest.java`：

```java
package example.controller;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTaskRequest(
    @NotBlank @Size(max = 120) String title,
    @NotBlank @Size(max = 40) String dueAt,
    @NotBlank @Size(max = 40) String assignee
) {}
```

`TaskResponse.java`：

```java
package example.controller;

public record TaskResponse(
    String id,
    String projectId,
    String title,
    TaskStatus status,
    String dueAt,
    String assignee
) {}
```

`PageResponse.java`：

```java
package example.controller;

import java.util.List;

public record PageResponse<T>(List<T> items, String nextPageToken) {}
```

`TaskService.java`：

```java
package example.controller;

import java.util.List;

public interface TaskService {
    /** 按项目、状态和分页参数查询任务。 */
    PageResponse<TaskResponse> findAll(String projectId, TaskStatus status, int pageSize, String pageToken);

    /** 按项目和任务 ID 查询任务。 */
    TaskResponse findById(String projectId, String taskId);

    /** 在项目下创建任务。 */
    TaskResponse create(String projectId, CreateTaskRequest request);
}
```

`TaskController.java`：

```java
package example.controller;

import java.net.URI;
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
@RequestMapping("/api/v1/projects/{projectId}/tasks")
public class TaskController {
    private final TaskService taskService;

    /** 注入任务业务协作者。 */
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /** 按项目、状态和分页参数返回任务列表。 */
    @GetMapping
    public PageResponse<TaskResponse> findAll(
        @PathVariable String projectId,
        @RequestParam(required = false) TaskStatus status,
        @RequestParam(defaultValue = "20") int pageSize,
        @RequestParam(required = false) String pageToken
    ) {
        return taskService.findAll(projectId, status, pageSize, pageToken);
    }

    /** 按项目和路径 ID 返回一个任务。 */
    @GetMapping("/{taskId}")
    public TaskResponse findById(
        @PathVariable String projectId,
        @PathVariable String taskId
    ) {
        return taskService.findById(projectId, taskId);
    }

    /** 创建项目任务并返回新资源地址。 */
    @PostMapping
    public ResponseEntity<TaskResponse> create(
        @PathVariable String projectId,
        @Valid @RequestBody CreateTaskRequest request
    ) {
        TaskResponse created = taskService.create(projectId, request);
        return ResponseEntity
            .created(URI.create("/api/v1/projects/" + projectId + "/tasks/" + created.id()))
            .body(created);
    }
}
```

### 3. 定义业务异常和 ProblemDetail advice

`TaskNotFoundException.java`：

```java
package example.controller;

public final class TaskNotFoundException extends RuntimeException {
    /** 创建资源缺失异常。 */
    public TaskNotFoundException(String projectId, String taskId) {
        super("task not found: " + projectId + "/" + taskId);
    }
}
```

`ApiExceptionHandler.java`：

```java
package example.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import jakarta.servlet.http.HttpServletRequest;

record FieldProblem(String field, String code, String message) {}

@RestControllerAdvice
public class ApiExceptionHandler {
    /** 把资源缺失转换为稳定的 404 错误合同。 */
    @ExceptionHandler(TaskNotFoundException.class)
    public ResponseEntity<ProblemDetail> handleNotFound(
        TaskNotFoundException failure,
        HttpServletRequest request
    ) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.NOT_FOUND,
            "请求的任务不存在"
        );
        problem.setType(URI.create("https://api.teamflow.example/problems/task-not-found"));
        problem.setTitle("任务不存在");
        problem.setInstance(URI.create(request.getRequestURI()));
        problem.setProperty("code", "TASK_NOT_FOUND");
        problem.setProperty("traceId", "demo-trace-id");
        problem.setProperty("errors", List.of());
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .contentType(MediaType.APPLICATION_PROBLEM_JSON)
            .body(problem);
    }

    /** 把请求体校验失败转换为稳定的 400 错误合同。 */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidation(
        MethodArgumentNotValidException failure,
        HttpServletRequest request
    ) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setType(URI.create("https://api.teamflow.example/problems/validation-failed"));
        problem.setTitle("请求参数无效");
        problem.setDetail("请求体字段未通过校验");
        problem.setInstance(URI.create(request.getRequestURI()));
        problem.setProperty("code", "INVALID_REQUEST");
        problem.setProperty("traceId", "demo-trace-id");
        problem.setProperty("errors", List.of(new FieldProblem("title", "NOT_BLANK", "任务标题不能为空")));
        return ResponseEntity
            .badRequest()
            .contentType(MediaType.APPLICATION_PROBLEM_JSON)
            .body(problem);
    }
}
```

### 4. 编写 MVC slice 测试

`TaskControllerTest.java`：

```java
package example.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
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

    /** 验证分页参数经过 MVC 绑定后传入 Service。 */
    @Test
    void listsTasksWithExplicitPageSize() throws Exception {
        when(taskService.findAll("PRJ-1", null, 5, null))
            .thenReturn(new PageResponse<>(List.of(
                new TaskResponse("TASK-7", "PRJ-1", "学习 MockMvc", TaskStatus.TODO,
                    "2026-08-22T18:00:00+08:00", "lin")), null));

        mockMvc.perform(get("/api/v1/projects/{projectId}/tasks", "PRJ-1").param("pageSize", "5"))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.items[0].id").value("TASK-7"))
            .andExpect(jsonPath("$.items[0].projectId").value("PRJ-1"))
            .andExpect(jsonPath("$.items[0].title").value("学习 MockMvc"));

        verify(taskService).findAll("PRJ-1", null, 5, null);
    }

    /** 验证路径变量、状态和公开 JSON 字段。 */
    @Test
    void returnsTaskWhenTaskExists() throws Exception {
        when(taskService.findById("PRJ-1", "TASK-7"))
            .thenReturn(new TaskResponse("TASK-7", "PRJ-1", "学习 MockMvc", TaskStatus.TODO,
                "2026-08-22T18:00:00+08:00", "lin"));

        mockMvc.perform(get("/api/v1/projects/{projectId}/tasks/{taskId}", "PRJ-1", "TASK-7"))
            .andExpectAll(
                status().isOk(),
                content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON),
                jsonPath("$.id").value("TASK-7"),
                jsonPath("$.projectId").value("PRJ-1"),
                jsonPath("$.title").value("学习 MockMvc")
            );

        verify(taskService).findById("PRJ-1", "TASK-7");
    }

    /** 验证创建请求的 JSON、201 状态、Location 和响应体。 */
    @Test
    void createsTaskAndReturnsLocation() throws Exception {
        when(taskService.create(eq("PRJ-1"), any(CreateTaskRequest.class)))
            .thenReturn(new TaskResponse("TASK-8", "PRJ-1", "学习 MockMvc", TaskStatus.TODO,
                "2026-08-22T18:00:00+08:00", "lin"));

        mockMvc.perform(post("/api/v1/projects/{projectId}/tasks", "PRJ-1")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new CreateTaskRequest(
                    "学习 MockMvc", "2026-08-22T18:00:00+08:00", "lin"))))
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", "/api/v1/projects/PRJ-1/tasks/TASK-8"))
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value("TASK-8"))
            .andExpect(jsonPath("$.projectId").value("PRJ-1"))
            .andExpect(jsonPath("$.title").value("学习 MockMvc"));

        verify(taskService).create(eq("PRJ-1"), any(CreateTaskRequest.class));
    }

    /** 验证空白标题在 Service 之前被校验并映射为 Problem Details。 */
    @Test
    void rejectsBlankTitleBeforeService() throws Exception {
        mockMvc.perform(post("/api/v1/projects/{projectId}/tasks", "PRJ-1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new CreateTaskRequest(
                    " ", "2026-08-22T18:00:00+08:00", "lin"))))
            .andExpect(status().isBadRequest())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
            .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
            .andExpect(jsonPath("$.type").value("https://api.teamflow.example/problems/validation-failed"))
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.instance").value("/api/v1/projects/PRJ-1/tasks"))
            .andExpect(jsonPath("$.traceId").value("demo-trace-id"))
            .andExpect(jsonPath("$.errors[0].field").value("title"));

        verify(taskService, never()).create(eq("PRJ-1"), any(CreateTaskRequest.class));
    }

    /** 验证业务缺失异常由 advice 转换为 404。 */
    @Test
    void mapsMissingTaskToProblemDetail() throws Exception {
        when(taskService.findById("PRJ-1", "TASK-99"))
            .thenThrow(new TaskNotFoundException("PRJ-1", "TASK-99"));

        mockMvc.perform(get("/api/v1/projects/{projectId}/tasks/{taskId}", "PRJ-1", "TASK-99"))
            .andExpect(status().isNotFound())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
            .andExpect(jsonPath("$.type").value("https://api.teamflow.example/problems/task-not-found"))
            .andExpect(jsonPath("$.title").value("任务不存在"))
            .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.detail").value("请求的任务不存在"))
            .andExpect(jsonPath("$.instance").value("/api/v1/projects/PRJ-1/tasks/TASK-99"))
            .andExpect(jsonPath("$.code").value("TASK_NOT_FOUND"))
            .andExpect(jsonPath("$.traceId").value("demo-trace-id"))
            .andExpect(jsonPath("$.errors").isEmpty());
    }

    /** 验证省略查询参数时使用 Controller 声明的默认值。 */
    @Test
    void usesDefaultPageSizeWhenQueryParameterIsOmitted() throws Exception {
        when(taskService.findAll("PRJ-1", null, 20, null))
            .thenReturn(new PageResponse<>(List.of(), null));

        mockMvc.perform(get("/api/v1/projects/{projectId}/tasks", "PRJ-1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items").isEmpty());

        verify(taskService).findAll("PRJ-1", null, 20, null);
    }

    /** 验证查询参数转换失败时不会调用 Service。 */
    @Test
    void rejectsNonNumericPageSizeBeforeService() throws Exception {
        mockMvc.perform(get("/api/v1/projects/{projectId}/tasks", "PRJ-1")
                .param("pageSize", "not-a-number"))
            .andExpect(status().isBadRequest());

        verify(taskService, never()).findAll(anyString(), any(), anyInt(), anyString());
    }
}
```

### 5. 运行现代工程并读取反馈

在临时工程根目录执行：

```bash
mvn -Dtest=TaskControllerTest test
mvn test
mvn test
```

现代工程在 Java 25 与 Boot 4.1.1 上实际得到：

```text
Tests run: 7, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

加入练习方法后，两次完整运行都得到 8 条测试通过，说明测试实例、MockitoBean 和请求 fixture 没有依赖
上一次执行残留的可变状态。

如果暂时删除 `@MockitoBean`，上下文应在发送请求之前因为缺少 `TaskService` 而失败；恢复后用同一条命令
重跑。这个负例验证的是切片装配边界，不是课程要求保留的测试代码。

### 6. 建立独立的 Java 8 / Boot 2.3.12 工程

兼容工程必须与现代工程分开存放，不能只把现代工程的 POM 改成 `--release 8`。本示例使用真实 Java 8
运行时、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15、JUnit Jupiter 5.6.3 和 Mockito 3.3.3。
在 IntelliJ IDEA 中分别设置该工程的 Project SDK、模块 SDK 和 Maven Runner JRE 为 Java 8，确认 POM 的
`<java.version>` 为 `1.8`，Reload Maven；现代工程保持 Java 25 和 `<java.version>25</java.version>`。

兼容工程目录如下：

```text
controller-slice-java8/
  pom.xml
  src/main/java/example/controller/TaskApplication.java
  src/main/java/example/controller/ApiProblem.java
  src/main/java/example/controller/CreateTaskRequest.java
  src/main/java/example/controller/TaskStatus.java
  src/main/java/example/controller/TaskResponse.java
  src/main/java/example/controller/PageResponse.java
  src/main/java/example/controller/TaskService.java
  src/main/java/example/controller/TaskController.java
  src/main/java/example/controller/TaskNotFoundException.java
  src/main/java/example/controller/ApiExceptionHandler.java
  src/test/java/example/controller/TaskControllerTest.java
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
    <version>2.3.12.RELEASE</version>
    <relativePath/>
  </parent>
  <groupId>example</groupId>
  <artifactId>controller-slice-java8</artifactId>
  <version>1.0.0</version>
  <properties><java.version>1.8</java.version></properties>
  <dependencies>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-validation</artifactId></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-test</artifactId><scope>test</scope></dependency>
  </dependencies>
</project>
```

以下文件构成一个可独立运行的兼容版本。Java 8 没有 record，因此 DTO 使用普通 Java Bean；在本课范围内，
它通过 getter 输出与现代 `TaskResponse` 相同的 `id`、`projectId`、`title`、`status`、`dueAt`、`assignee` 六个
JSON 字段，setter 只服务于 Jackson 的 Bean 约定。错误 DTO 使用与现代 ProblemDetail 相同的
`type`、`title`、`status`、`detail`、`instance`、`code`、`traceId`、`errors` 八个字段。Boot 2.3 使用
`javax.validation`、`MockBean` 和 `com.fasterxml.jackson`，不能把现代线的 import 原样复制过来。

`TaskApplication.java`：

```java
package example.controller;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TaskApplication {
    /** 启动 Java 8 兼容示例应用。 */
    public static void main(String[] args) { SpringApplication.run(TaskApplication.class, args); }
}
```

`TaskStatus.java`：

```java
package example.controller;

public enum TaskStatus { TODO, DONE }
```

`PageResponse.java`：

```java
package example.controller;

import java.util.List;

public class PageResponse<T> {
    private final List<T> items;
    private final String nextPageToken;
    /** 创建分页响应。 */
    public PageResponse(List<T> items, String nextPageToken) {
        this.items = items;
        this.nextPageToken = nextPageToken;
    }
    /** 返回当前页任务。 */
    public List<T> getItems() { return items; }
    /** 返回下一页 token。 */
    public String getNextPageToken() { return nextPageToken; }
}
```

```java
package example.controller;

import java.util.List;

public interface TaskService {
    /** 按项目、状态和分页参数查询任务。 */
    PageResponse<TaskResponse> findAll(String projectId, TaskStatus status, int pageSize, String pageToken);
    /** 按项目和任务 ID 查询任务。 */
    TaskResponse findById(String projectId, String taskId);
    /** 在项目下创建任务。 */
    TaskResponse create(String projectId, CreateTaskRequest request);
}
```

```java
package example.controller;

public class TaskNotFoundException extends RuntimeException {
    /** 创建资源缺失异常。 */
    public TaskNotFoundException(String projectId, String taskId) {
        super("task not found: " + projectId + "/" + taskId);
    }
}
```

`CreateTaskRequest.java`、`TaskResponse.java` 和 `TaskController.java`：

```java
package example.controller;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class CreateTaskRequest {
    @NotBlank @Size(max = 120) private String title;
    @NotBlank @Size(max = 40) private String dueAt;
    @NotBlank @Size(max = 40) private String assignee;
    /** 供 Jackson 创建请求对象。 */
    public CreateTaskRequest() {}
    /** 创建带标题的请求对象。 */
    public CreateTaskRequest(String title, String dueAt, String assignee) {
        this.title = title;
        this.dueAt = dueAt;
        this.assignee = assignee;
    }
    /** 返回任务标题。 */
    public String getTitle() { return title; }
    /** 更新任务标题。 */
    public void setTitle(String title) { this.title = title; }
    /** 返回截止时间。 */
    public String getDueAt() { return dueAt; }
    /** 更新截止时间。 */
    public void setDueAt(String dueAt) { this.dueAt = dueAt; }
    /** 返回负责人。 */
    public String getAssignee() { return assignee; }
    /** 更新负责人。 */
    public void setAssignee(String assignee) { this.assignee = assignee; }
}
```

```java
package example.controller;

public class TaskResponse {
    private String id;
    private String projectId;
    private String title;
    private TaskStatus status;
    private String dueAt;
    private String assignee;
    /** 供 Jackson 创建响应对象。 */
    public TaskResponse() {}
    /** 创建任务响应。 */
    public TaskResponse(String id, String projectId, String title, TaskStatus status, String dueAt, String assignee) {
        this.id = id;
        this.projectId = projectId;
        this.title = title;
        this.status = status;
        this.dueAt = dueAt;
        this.assignee = assignee;
    }
    /** 返回任务 ID。 */
    public String getId() { return id; }
    /** 更新任务 ID。 */
    public void setId(String id) { this.id = id; }
    /** 返回项目 ID。 */
    public String getProjectId() { return projectId; }
    /** 更新项目 ID。 */
    public void setProjectId(String projectId) { this.projectId = projectId; }
    /** 返回任务标题。 */
    public String getTitle() { return title; }
    /** 更新任务标题。 */
    public void setTitle(String title) { this.title = title; }
    /** 返回任务状态。 */
    public TaskStatus getStatus() { return status; }
    /** 更新任务状态。 */
    public void setStatus(TaskStatus status) { this.status = status; }
    /** 返回截止时间。 */
    public String getDueAt() { return dueAt; }
    /** 更新截止时间。 */
    public void setDueAt(String dueAt) { this.dueAt = dueAt; }
    /** 返回负责人。 */
    public String getAssignee() { return assignee; }
    /** 更新负责人。 */
    public void setAssignee(String assignee) { this.assignee = assignee; }
}
```

```java
package example.controller;

import java.net.URI;
import javax.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/tasks")
public class TaskController {
    private final TaskService taskService;
    /** 注入任务业务协作者。 */
    public TaskController(TaskService taskService) { this.taskService = taskService; }
    /** 按项目、状态和分页参数返回任务列表。 */
    @GetMapping
    public PageResponse<TaskResponse> findAll(
            @PathVariable String projectId,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String pageToken) {
        return taskService.findAll(projectId, status, pageSize, pageToken);
    }
    /** 按项目和路径 ID 返回一个任务。 */
    @GetMapping("/{taskId}")
    public TaskResponse findById(
            @PathVariable String projectId,
            @PathVariable String taskId) {
        return taskService.findById(projectId, taskId);
    }
    /** 创建项目任务并返回新资源地址。 */
    @PostMapping
    public ResponseEntity<TaskResponse> create(
            @PathVariable String projectId,
            @Valid @RequestBody CreateTaskRequest request) {
        TaskResponse created = taskService.create(projectId, request);
        return ResponseEntity.created(URI.create(
                "/api/v1/projects/" + projectId + "/tasks/" + created.getId())).body(created);
    }
}
```

`ApiProblem.java` 与 `ApiExceptionHandler.java`：

```java
package example.controller;

import java.util.Collections;
import java.util.List;

public class ApiProblem {
    private final String type;
    private final String title;
    private final int status;
    private final String detail;
    private final String instance;
    private final String code;
    private final String traceId;
    private final List<FieldProblem> errors;
    /** 创建与现代线同形的错误响应。 */
    public ApiProblem(String type, String title, int status, String detail, String instance,
            String code, String traceId, List<FieldProblem> errors) {
        this.type = type; this.title = title; this.status = status; this.detail = detail;
        this.instance = instance; this.code = code; this.traceId = traceId;
        this.errors = Collections.unmodifiableList(errors);
    }
    /** 返回问题类型。 */ public String getType() { return type; }
    /** 返回标题。 */ public String getTitle() { return title; }
    /** 返回状态。 */ public int getStatus() { return status; }
    /** 返回详情。 */ public String getDetail() { return detail; }
    /** 返回请求路径。 */ public String getInstance() { return instance; }
    /** 返回错误码。 */ public String getCode() { return code; }
    /** 返回追踪标识。 */ public String getTraceId() { return traceId; }
    /** 返回字段错误。 */ public List<FieldProblem> getErrors() { return errors; }
}

class FieldProblem {
    private final String field;
    private final String code;
    private final String message;
    /** 创建字段错误。 */
    FieldProblem(String field, String code, String message) {
        this.field = field; this.code = code; this.message = message;
    }
    /** 返回字段名。 */ public String getField() { return field; }
    /** 返回错误码。 */ public String getCode() { return code; }
    /** 返回安全消息。 */ public String getMessage() { return message; }
}
```

```java
package example.controller;

import java.util.Collections;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import javax.servlet.http.HttpServletRequest;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
    /** 把资源缺失转换为旧版稳定错误合同。 */
    @ExceptionHandler(TaskNotFoundException.class)
    public ResponseEntity<ApiProblem> handleNotFound(HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiProblem(
            "https://api.teamflow.example/problems/task-not-found", "任务不存在", 404,
            "请求的任务不存在", request.getRequestURI(), "TASK_NOT_FOUND", "demo-trace-id",
            Collections.<FieldProblem>emptyList()));
    }
    /** 把请求体校验失败转换为旧版稳定错误合同。 */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiProblem> handleValidation(HttpServletRequest request) {
        return ResponseEntity.badRequest().body(new ApiProblem(
            "https://api.teamflow.example/problems/validation-failed", "请求参数无效", 400,
            "请求体字段未通过校验", request.getRequestURI(), "INVALID_REQUEST", "demo-trace-id",
            Collections.singletonList(new FieldProblem("title", "NOT_BLANK", "任务标题不能为空"))));
    }
}
```

`TaskControllerTest.java`：

```java
package example.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Collections;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(TaskController.class)
public class TaskControllerTest {
    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean private TaskService taskService;

    /** 验证兼容线的默认分页参数。 */
    @Test public void usesDefaultPageSizeOnJava8Line() throws Exception {
        when(taskService.findAll("PRJ-1", null, 20, null))
            .thenReturn(new PageResponse<TaskResponse>(Collections.<TaskResponse>emptyList(), null));
        mockMvc.perform(get("/api/v1/projects/{projectId}/tasks", "PRJ-1"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.items").isEmpty());
        verify(taskService).findAll("PRJ-1", null, 20, null);
    }
    /** 验证旧版 Jackson 和 201 Location。 */
    @Test public void createsTaskWithJackson2() throws Exception {
        when(taskService.create(eq("PRJ-1"), any(CreateTaskRequest.class)))
            .thenReturn(new TaskResponse("TASK-8", "PRJ-1", "学习 MockMvc", TaskStatus.TODO,
                "2026-08-22T18:00:00+08:00", "lin"));
        mockMvc.perform(post("/api/v1/projects/{projectId}/tasks", "PRJ-1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new CreateTaskRequest(
                    "学习 MockMvc", "2026-08-22T18:00:00+08:00", "lin"))))
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", "/api/v1/projects/PRJ-1/tasks/TASK-8"));
        verify(taskService).create(eq("PRJ-1"), any(CreateTaskRequest.class));
    }
    /** 验证兼容线校验失败不会调用 Service。 */
    @Test public void rejectsBlankTitleBeforeService() throws Exception {
        mockMvc.perform(post("/api/v1/projects/{projectId}/tasks", "PRJ-1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new CreateTaskRequest(
                    " ", "2026-08-22T18:00:00+08:00", "lin"))))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.type").value("https://api.teamflow.example/problems/validation-failed"))
            .andExpect(jsonPath("$.errors[0].field").value("title"));
        verify(taskService, never()).create(eq("PRJ-1"), any(CreateTaskRequest.class));
    }
    /** 验证兼容线业务缺失会调用正确的项目任务身份。 */
    @Test public void mapsMissingTaskWithProjectIdentity() throws Exception {
        when(taskService.findById("PRJ-1", "TASK-99"))
            .thenThrow(new TaskNotFoundException("PRJ-1", "TASK-99"));
        mockMvc.perform(get("/api/v1/projects/{projectId}/tasks/{taskId}", "PRJ-1", "TASK-99"))
            .andExpect(status().isNotFound());
        verify(taskService).findById("PRJ-1", "TASK-99");
        verify(taskService, never()).findAll(anyString(), any(), anyInt(), anyString());
    }
}
```

在 Java 8 运行时执行 `mvn -Dtest=TaskControllerTest test`，实际得到：

```text
Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

这证明兼容依赖、包名、配置和请求在真实 Java 8 上可以启动；它用 `ApiProblem` 输出与现代
`ProblemDetail` 同形的 TeamFlow 错误 JSON。

## 九、集中排查四个 MVC 测试错误

### 四个典型错误

:::pitfalls
### 把 Controller 方法直接当成接口测试

**触发条件：** 直接调用 `taskController.findById("PRJ-1", "TASK-7")`，没有经过 MockMvc。

**原因：** 这种调用绕过了 `@GetMapping`、路径绑定、消息转换、过滤器和 advice。

**后果：** Java 方法返回值正确，但真实 URL、状态码或 JSON 序列化仍可能错误。

**错误示例：**

```java
TaskResponse response = taskController.findById("PRJ-1", "TASK-7");
```

**正确写法：**

```java
mockMvc.perform(get("/api/v1/projects/{projectId}/tasks/{taskId}", "PRJ-1", "TASK-7"))
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.id").value("TASK-7"));
```

**验证方式：** 适用于 Boot 4.1.1 与 Boot 2.3.12；先修改 `@GetMapping` 路径观察 MockMvc 失败，再恢复路径并
重跑同一测试。

### 切片缺少 Controller 协作者

**触发条件：** `@WebMvcTest` 测试没有提供构造器所需的 Service mock。

**原因：** WebMvcTest 不会把普通 Service 自动加载为真实业务 Bean。

**后果：** ApplicationContext 在请求执行前失败，学习者误以为是路由 404。

**错误示例：**

```java
@WebMvcTest(TaskController.class)
class TaskControllerTest {}
```

**正确写法：**

```java
@MockitoBean
private TaskService taskService;
```

**验证方式：** Boot 4.1.1 使用 `@MockitoBean`，Boot 2.3.12 使用 `@MockBean`；删除对应字段运行定向测试看到
上下文失败，恢复后复跑并确认测试通过。

### 只断言 400，不确认 Service 没被调用

**触发条件：** 空白标题测试只写 `status().isBadRequest()`。

**原因：** 状态码只能说明响应结果，不能说明拒绝发生在校验阶段。

**后果：** Controller 可能已经把无效 DTO 交给 Service，测试仍然变绿。

**错误示例：**

```java
mockMvc.perform(post("/api/v1/projects/{projectId}/tasks", "PRJ-1")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"title\":\" \",\"dueAt\":\"2026-08-22T18:00:00+08:00\",\"assignee\":\"lin\"}"))
    .andExpect(status().isBadRequest());
```

**正确写法：**

```java
verify(taskService, never()).create(eq("PRJ-1"), any(CreateTaskRequest.class));
```

**验证方式：** 适用于 Boot 4.1.1 的 `jakarta.validation` 与 Boot 2.3.12 的 `javax.validation`；临时移除
`@Valid`，重新运行测试应因 Service 被调用或响应改变而失败，恢复后重跑。

### 把 Boot 4 与 Boot 2.3 import 混在一起

**触发条件：** 在现代工程使用 `MockBean`、`javax.validation` 或 `com.fasterxml.jackson`，或在旧工程使用
`MockitoBean`、`jakarta.validation` 或 `tools.jackson`。

**原因：** 两条版本线的包路径和测试替身 API 不同。

**后果：** 编译失败，或迁移时误以为只需切换 Java SDK。

**错误示例：**

```java
import org.springframework.boot.test.mock.mockito.MockBean;
import javax.validation.Valid;
```

**正确写法：**

```java
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import jakarta.validation.Valid;
```

**验证方式：** 在 Boot 4.1.1 与 Boot 2.3.12 两个独立 POM 中分别编译对应 import，不能共用依赖图。
:::

## 十、独立练习

:::exercise
### 补充无效路径变量测试

**要求：** 在完整工程的 `TaskControllerTest` 中补充 `GET /api/v1/projects/PRJ-1/tasks/TASK-99` 测试，断言
业务缺失响应为 404，并证明 `taskService.findById` 会以正确项目和任务 ID 被安排。测试必须继续使用 MockMvc，
不得直接调用 Controller 方法，不得启动真实端口。

**验收：** 定向执行显示 1 条测试通过；完整测试显示 8 条测试通过；连续运行两次数量一致。

**参考答案：** 使用下方完整测试类替换现代工程中的 `TaskControllerTest`。

:::

### 1. 完整参考实现

```java
package example.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
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

    /** 验证显式分页参数。 */
    @Test
    void listsTasksWithExplicitPageSize() throws Exception {
        when(taskService.findAll("PRJ-1", null, 5, null))
            .thenReturn(new PageResponse<>(List.of(new TaskResponse(
                "TASK-7", "PRJ-1", "学习 MockMvc", TaskStatus.TODO,
                "2026-08-22T18:00:00+08:00", "lin")), null));

        mockMvc.perform(get("/api/v1/projects/{projectId}/tasks", "PRJ-1").param("pageSize", "5"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items[0].id").value("TASK-7"));

        verify(taskService).findAll("PRJ-1", null, 5, null);
    }

    /** 验证按 ID 查询任务。 */
    @Test
    void returnsTaskWhenTaskExists() throws Exception {
        when(taskService.findById("PRJ-1", "TASK-7"))
            .thenReturn(new TaskResponse("TASK-7", "PRJ-1", "学习 MockMvc", TaskStatus.TODO,
                "2026-08-22T18:00:00+08:00", "lin"));

        mockMvc.perform(get("/api/v1/projects/{projectId}/tasks/{taskId}", "PRJ-1", "TASK-7"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value("TASK-7"));

        verify(taskService).findById("PRJ-1", "TASK-7");
    }

    /** 验证创建响应的状态、地址和 JSON。 */
    @Test
    void createsTaskAndReturnsLocation() throws Exception {
        when(taskService.create(eq("PRJ-1"), any(CreateTaskRequest.class)))
            .thenReturn(new TaskResponse("TASK-8", "PRJ-1", "学习 MockMvc", TaskStatus.TODO,
                "2026-08-22T18:00:00+08:00", "lin"));

        mockMvc.perform(post("/api/v1/projects/{projectId}/tasks", "PRJ-1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new CreateTaskRequest(
                    "学习 MockMvc", "2026-08-22T18:00:00+08:00", "lin"))))
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", "/api/v1/projects/PRJ-1/tasks/TASK-8"))
            .andExpect(jsonPath("$.id").value("TASK-8"));

        verify(taskService).create(eq("PRJ-1"), any(CreateTaskRequest.class));
    }

    /** 验证空白标题在 Service 之前被拒绝。 */
    @Test
    void rejectsBlankTitleBeforeService() throws Exception {
        mockMvc.perform(post("/api/v1/projects/{projectId}/tasks", "PRJ-1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new CreateTaskRequest(
                    " ", "2026-08-22T18:00:00+08:00", "lin"))))
            .andExpect(status().isBadRequest())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON));

        verify(taskService, never()).create(eq("PRJ-1"), any(CreateTaskRequest.class));
    }

    /** 验证业务异常由 advice 转换为 404。 */
    @Test
    void mapsMissingTaskToProblemDetail() throws Exception {
        when(taskService.findById("PRJ-1", "TASK-99"))
            .thenThrow(new TaskNotFoundException("PRJ-1", "TASK-99"));

        mockMvc.perform(get("/api/v1/projects/{projectId}/tasks/{taskId}", "PRJ-1", "TASK-99"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.type").value("https://api.teamflow.example/problems/task-not-found"))
            .andExpect(jsonPath("$.code").value("TASK_NOT_FOUND"));
    }

    /** 验证省略参数时使用默认上限。 */
    @Test
    void usesDefaultPageSizeWhenQueryParameterIsOmitted() throws Exception {
        when(taskService.findAll("PRJ-1", null, 20, null))
            .thenReturn(new PageResponse<>(List.of(), null));

        mockMvc.perform(get("/api/v1/projects/{projectId}/tasks", "PRJ-1"))
            .andExpect(status().isOk());

        verify(taskService).findAll("PRJ-1", null, 20, null);
    }

    /** 验证查询参数转换失败不会调用 Service。 */
    @Test
    void rejectsNonNumericPageSizeBeforeService() throws Exception {
        mockMvc.perform(get("/api/v1/projects/{projectId}/tasks", "PRJ-1")
                .param("pageSize", "not-a-number"))
            .andExpect(status().isBadRequest());

        verify(taskService, never()).findAll(anyString(), any(), anyInt(), anyString());
    }

    /** 验证业务缺失会调用正确的项目任务身份。 */
    @Test
    void mapsMissingTaskWithProjectIdentity() throws Exception {
        when(taskService.findById("PRJ-1", "TASK-99"))
            .thenThrow(new TaskNotFoundException("PRJ-1", "TASK-99"));
        mockMvc.perform(get("/api/v1/projects/{projectId}/tasks/{taskId}", "PRJ-1", "TASK-99"))
            .andExpect(status().isNotFound());

        verify(taskService).findById("PRJ-1", "TASK-99");
    }
}
```

然后运行：

```bash
mvn -Dtest=TaskControllerTest#rejectsNonNumericPathBeforeService test
mvn -Dtest=TaskControllerTest test
```

实际定向结果为 `1 tests run, 0 failures, 0 errors`；完整测试连续运行两次都为
`8 tests run, 0 failures, 0 errors`。

## 十一、本课小结

MockMvc 把反馈放在 HTTP adapter：WebMvcTest 缩小 Spring MVC 上下文，MockitoBean 交出真实 Controller 的
Service 协作者，perform 构造真实请求，结果匹配器验证状态、媒体类型、响应头和 JSON。`@Valid`、路径变量和
查询参数的失败都应证明 Service 没有越过边界；ControllerAdvice 决定业务异常是否成为稳定的 Problem Details。
Security 过滤链、standaloneSetup 和 SpringBootTest 是不同范围，不能为了让状态码变绿而混用或无条件关闭。
