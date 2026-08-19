# Controller 测试、MockMvc 与测试切片研究稿

## 冻结课程合同

| 项目 | 冻结值 |
| --- | --- |
| 课程编号 | Phase C `I-15`；中级第 15/20 课 |
| 稳定 ID | `backend.java.learn.intermediate.controller-testing-mockmvc-and-test-slices` |
| 标题 | Controller 测试、MockMvc 与测试切片 |
| 预计时长 | 150 分钟 |
| 唯一前置 | `backend.java.learn.intermediate.testing-with-junit-and-mocks`（I-14） |
| 处置 | 新增课程、新增稳定 ID、新增 URL |
| 现代主线 | Java 25、Spring Boot 4.1.0、Spring Framework 7.0.8、JUnit 6.0.3、Mockito 5.23.0 |
| 项目补充线 | Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE、JUnit 5.6.3、Mockito 3.3.3 |
| 本课范围 | `@WebMvcTest`、`MockMvc`、`@MockitoBean`、请求构造、响应断言、校验与错误合同 |
| 明确排除 | Service 单元测试、真实端口、真实数据库、`@SpringBootTest`、WireMock、端到端与性能测试 |

I-14 已证明普通 Service 的业务行为。本课只把真实对象切换为 Controller：Service 使用测试替身，
Spring MVC 负责映射、绑定、校验、消息转换和异常处理。A-05 才验证完整应用上下文与外部集成，不能把
`MockMvc` 的 mock Servlet 请求响应写成真实网络测试。

## 研究方法与版本快照

- 核验日期：2026-08-16。
- 外部候选按仓库顺位定位，最终结论全部回到 Spring Boot、Spring Framework、Spring Security、
  JUnit、Mockito 与 Maven Central 一手页面或发布工件。
- Spring Boot 4.1.0 的 BOM 管理 Spring Framework 7.0.8、JUnit Jupiter 6.0.3、Mockito 5.23.0 与
  Spring Security 7.1.0；课程 fixture 不覆盖 BOM 管理版本。
- Boot 4 的 MVC 测试 starter 是 `spring-boot-starter-webmvc-test`，`@WebMvcTest` 包名为
  `org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest`。
- Boot 4 的 Web MVC starter 使用 Jackson 3，测试中注入的映射器包名是
  `tools.jackson.databind.ObjectMapper`；Boot 2.3 仍使用 Jackson 2 的
  `com.fasterxml.jackson.databind.ObjectMapper`。
- 现代 mock bean 使用 Spring Test 的
  `org.springframework.test.context.bean.override.mockito.MockitoBean`。Boot 2.3.12 旧线隔离使用
  `org.springframework.boot.test.mock.mockito.MockBean`，不能混用包名。
- `MockMvc` 在 mock request/response 上执行 Spring MVC 请求处理，不启动真实服务器。
- `@WebMvcTest` 限定 MVC 组件和相关自动配置；Controller 的 Service 依赖需要显式测试替身。
- 应用存在 Spring Security 时，MVC slice 会保留相关过滤链；认证、授权与 CSRF 的完整教学属于 A-07，
  本课只说明不能无证据地关闭过滤器。

## 官方来源卡与直接证据

| ID | 官方直接来源 | sourceType | 支持结论 |
| --- | --- | --- | --- |
| `boot-410-system` | <https://docs.spring.io/spring-boot/4.1/system-requirements.html> | `official-reference` | Boot 4.1.0 的 Java 与 Framework 基线 |
| `boot-410-dependencies` | <https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-dependencies/4.1.0/spring-boot-dependencies-4.1.0.pom> | `source-code` | JUnit、Mockito、Spring Security 与 Spring Framework 管理版本 |
| `boot-410-webmvc-test-starter` | <https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-webmvc-test/4.1.0/spring-boot-starter-webmvc-test-4.1.0.pom> | `source-code` | MVC 测试 starter 的组成 |
| `boot-410-webmvc-starter` | <https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-webmvc/4.1.0/spring-boot-starter-webmvc-4.1.0.pom> | `source-code` | MVC starter 使用 Jackson 3 starter |
| `boot-410-webmvc-test` | <https://docs.spring.io/spring-boot/4.1/api/java/org/springframework/boot/webmvc/test/autoconfigure/WebMvcTest.html> | `api-doc` | `@WebMvcTest` 的目标与筛选边界 |
| `boot-testing` | <https://docs.spring.io/spring-boot/4.1/reference/testing/spring-boot-applications.html> | `official-reference` | slice 与完整应用测试的边界 |
| `spring-mockmvc` | <https://docs.spring.io/spring-framework/reference/7.0/testing/mockmvc.html> | `official-reference` | MockMvc 执行 MVC 请求处理且不启动服务器 |
| `spring-mockmvc-setup` | <https://docs.spring.io/spring-framework/reference/7.0/testing/mockmvc/setup-options.html> | `official-reference` | standalone 与 WebApplicationContext 两种 setup |
| `spring-mockmvc-requests` | <https://docs.spring.io/spring-framework/reference/7.0/testing/mockmvc/hamcrest/requests.html> | `official-reference` | 请求方法、路径、头与内容构造 |
| `spring-mockmvc-expectations` | <https://docs.spring.io/spring-framework/reference/7.0/testing/mockmvc/hamcrest/expectations.html> | `official-reference` | status、header、content 与 jsonPath 断言 |
| `spring-result-matchers` | <https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/test/web/servlet/result/MockMvcResultMatchers.html> | `api-doc` | MockMvc 结果匹配器合同 |
| `spring-mockitobean` | <https://docs.spring.io/spring-framework/reference/7.0/testing/annotations/integration-spring/annotation-mockitobean.html> | `official-reference` | `@MockitoBean` 覆盖 ApplicationContext 中的 bean |
| `spring-mockitobean-api` | <https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/test/context/bean/override/mockito/MockitoBean.html> | `api-doc` | 现代注解包名与字段级使用方式 |
| `spring-requestbody-validation` | <https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-controller/ann-methods/requestbody.html> | `official-reference` | `@RequestBody` 与 `@Valid` 的绑定、校验及 400 行为 |
| `spring-exceptionhandler` | <https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-controller/ann-exceptionhandler.html> | `official-reference` | `@ExceptionHandler` 与 advice 的错误映射 |
| `spring-problemdetail` | <https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/http/ProblemDetail.html> | `api-doc` | Problem Details 标准字段与扩展属性 |
| `security-mockmvc` | <https://docs.spring.io/spring-security/reference/7.1/servlet/test/mockmvc/setup.html> | `official-reference` | Security filter chain 与 MockMvc 集成边界 |
| `boot-2312-dependencies` | <https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-dependencies/2.3.12.RELEASE/spring-boot-dependencies-2.3.12.RELEASE.pom> | `source-code` | 旧线 JUnit Jupiter 5.6.3 与 Mockito 3.3.3 管理版本 |
| `boot-2312-webmvc-test` | <https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/api/org/springframework/boot/test/autoconfigure/web/servlet/WebMvcTest.html> | `api-doc` | 旧线 `@WebMvcTest` 包名和切片合同 |
| `boot-2312-mockbean` | <https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/api/org/springframework/boot/test/mock/mockito/MockBean.html> | `api-doc` | 旧线 `@MockBean` 合同 |
| `spring-5215-mockmvc` | <https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/testing.html#spring-mvc-test-framework> | `official-reference` | Spring 5.2.15 MockMvc 反馈环 |
| `boot-2312-test-starter` | <https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-test/2.3.12.RELEASE/spring-boot-starter-test-2.3.12.RELEASE.pom> | `source-code` | 旧线 JUnit 与 Mockito 测试依赖 |

## 冻结项目证据边界

本课只复用 Phase 2 已冻结的抽象能力，不重新访问项目源码：

| 来源能力 | 冻结用途 |
| --- | --- |
| `JAVA-FRAMEWORK-008` | 项目存在 Controller 和 Spring MVC 配置，证明 HTTP adapter 需要独立验证。 |
| `JAVA-FRAMEWORK-009` | 项目存在标准与私有校验场景，课程只采用标准 Bean Validation。 |
| `JAVA-ENGINEERING-035` | 测试应断言公开可观察行为，不反射私有实现。 |
| `JAVA-RISK-009` | 粗粒度输入检查可能漏掉嵌套字段与边界条件。 |
| `JAVA-RISK-012` | 错误响应需稳定、去敏并匹配状态语义。 |

项目证据只说明为什么要学，不作为推荐 API。正式示例统一使用 `TaskController`、`TaskService`、
`TaskResponse` 与中性路径 `/tasks`。

## I-15 知识点规划

正文按以下 24 个独立知识点展开，每点都回答是什么、作用、场景、用法、最小示例、结果和误区：

1. Controller 测试验证 HTTP adapter 合同，而不是重新测试 Service 算法。
2. MockMvc 在 mock Servlet request/response 上执行 MVC 链路，不监听真实端口。
3. `@WebMvcTest(TaskController.class)` 只准入目标 Controller 与 MVC 基础设施。
4. `@MockitoBean` 为现代 slice 提供 Service 替身。
5. Boot 2.3 使用 `@MockBean`，包名和生命周期不能复制到现代线。
6. `mockMvc.perform` 构造一次请求并返回可继续断言的结果。
7. GET 路径变量要同时证明映射、类型转换和 JSON 响应。
8. query 参数测试要覆盖默认值、合法值和类型不匹配。
9. POST JSON 要明确 method、URI、content type 与 body。
10. 现代 `tools.jackson.databind.ObjectMapper` 生成 JSON 能减少手工转义，但 DTO
    本身仍是真实对象；旧线包名必须隔离。
11. status 断言证明 HTTP 语义，不能只看 body。
12. content type 断言证明消息转换器选择。
13. `jsonPath` 断言公开字段和值，不绑定 JSON 文本空白或字段顺序。
14. header 断言用于 Location、ETag 等公开合同。
15. `@Valid` 请求体失败应在进入 Service 前返回 400。
16. `verify(..., never())` 证明无效输入未越过 Controller 边界。
17. `@WebMvcTest` 默认包含扫描范围内的 `@ControllerAdvice`；只有 advice 位于扫描范围外或测试主动
    收窄过滤器时，才需要使用 `@Import` 显式选择。
18. Problem Details 测试要同时断言状态、媒体类型和安全字段。
19. Service 结果或异常由 mock 驱动，测试不连接数据库。
20. 404、409、422 与 500 只测试已冻结的映射，不在 Controller 中发明业务规则。
21. `andDo(print())` 只用于诊断，不代替 matcher 断言。
22. standalone setup 适合纯 MVC 单元边界，但不等于 Boot slice。
23. Security 在 classpath 时过滤链属于请求边界，不能默认关闭。
24. 用成功、校验失败、缺失和冲突四条路径闭合 Controller 反馈环。

### 与相邻课程的内容边界

- I-14 负责 Service 公开行为、Mockito stub/verify 与 fixture 隔离，本课不重讲。
- I-10 已讲 Bean Validation 规则，本课只验证 Web 入口是否触发并形成 HTTP 400。
- I-13 已冻结 Problem Details，本课只验证 advice 输出，不重新设计错误码。
- I-16 负责 OpenAPI 文档与联调，本课不生成接口文档。
- A-05 负责 `@SpringBootTest`、WireMock、真实应用上下文和测试分层。
- A-07 负责认证、授权和 CSRF，本课只记录 Security 过滤链的测试边界。

## 实施阶段临时反馈环

现代与旧线分别在 `/tmp` 的 `mktemp -d` 工程执行，成功后精确删除目录。

### 现代 Boot 4.1.0

最小工程使用 `spring-boot-starter-webmvc`、`spring-boot-starter-validation` 和 test scope 的
`spring-boot-starter-webmvc-test`。至少验证：

1. GET `/tasks/7` 返回 200、JSON 媒体类型与公开字段。
2. POST `/tasks` 合法 JSON 返回 201、Location 与 JSON。
3. POST 空标题返回 400，Service 为 `never()`。
4. Service 抛缺失与冲突异常时，同包 advice 在不加 `@Import` 的情况下返回安全 Problem Details。
5. 未提供 `@MockitoBean` 的负例先以缺 bean 失败，补回后同一命令通过。
6. query 参数分别验证默认值、显式合法值和非数字 400，失败请求不得调用 Service。
7. 目标测试连续运行两次，数量一致。

### Java 8 / Boot 2.3.12

真实 Java 8 runtime 使用 `spring-boot-starter-web`、`spring-boot-starter-validation`、
`spring-boot-starter-test` 与旧包名 `@WebMvcTest`、`@MockBean`。至少复跑 GET、合法 POST、校验失败和
Service never 四个合同。旧线使用自定义 `ApiError`，不得伪造 Spring `ProblemDetail`。

## 易错点冻结

| 现象 | 原因 | 正确方向 | 验证 |
| --- | --- | --- | --- |
| slice 启动失败，提示缺少 Service bean | 目标 Controller 的协作者未被替换 | 使用现代 `@MockitoBean` 或旧线 `@MockBean` | 负例失败后补 bean 并复跑 |
| 测试返回 404 | 请求 URI、method 或 Controller 选择错误 | 先检查映射与 `@WebMvcTest` 目标 | `handler()` 与 status 断言 |
| 期望 400 却返回 201 | DTO 未加约束、参数未加 `@Valid` 或 validator 未进入 slice | 修复生产入口合同 | verify Service 为 never |
| 把 `@Import` 写成同包 advice 的必需条件 | 混淆了普通 Service 排除规则与 `@ControllerAdvice` 默认过滤规则 | 先证明同包 advice 自动发现；仅在扫描范围外或主动排除时显式导入 | 删除 `@Import` 后 404/409 仍通过 |
| 全文 JSON 字符串断言脆弱 | 绑定了字段顺序和空白 | 使用 content type 与 jsonPath | 调整 JSON 排版仍通过 |
| 关闭全部过滤器后测试变绿 | 绕过了真实请求边界 | 有 Security 时使用官方 test support 构造身份/CSRF | 对照 401/403/成功路径 |

## 研究 Gate

- [x] I-15 身份、标题、150 分钟、唯一前置 I-14 与 Phase A 一致。
- [x] 现代与旧线包名、starter、JUnit/Mockito 版本已隔离。
- [x] 24 个知识点只覆盖 Controller、MockMvc、slice 与 HTTP 失败合同。
- [x] I-14、I-16、A-05、A-07 边界明确。
- [x] 官方来源均为直接页面或发布工件，项目证据只使用冻结能力。
- [x] 双版本 fixture 只写为实施计划，没有虚构运行结果。

## Stop Boundary

研究完成不等于 I-15 发布。父任务必须继续完成正文、双版本临时反馈环、track/loader 原子登记、工程
Gate、桌面/390px 浏览器验收、独立 Standards/Spec 复审、signoff 与清理。I-15 关闭前不得读取或修改
I-16 研究稿和正文。
