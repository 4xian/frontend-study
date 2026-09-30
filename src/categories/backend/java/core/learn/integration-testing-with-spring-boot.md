---
id: backend.java.learn.intermediate.integration-testing-with-spring-boot
type: lesson
title: 集成测试
summary: 用完整 Spring 上下文、真实 MySQL 和受控外部服务验证跨层协作
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 180
prerequisites:
  - backend.java.learn.intermediate.controller-testing-mockmvc-and-test-slices
objectives:
  - 能区分 Service 单元测试、MockMvc 测试和完整上下文集成测试的证明范围。
  - 能使用 SpringBootTest 与 AutoConfigureMockMvc 启动真实 ApplicationContext，并解释不同 WebEnvironment 的边界。
  - 能使用 Testcontainers 启动一次性 MySQL，为 Spring 数据源注入动态连接属性并验证真实持久化。
  - 能使用 WireMock 隔离外部 HTTP 服务，验证请求合同、成功响应和外部失败不会污染数据库状态。
  - 能处理测试上下文缓存、容器生命周期、事务回滚和测试间状态隔离问题。
  - 能把 Boot 4.1/Java 25 与 Boot 2.3.12/Java 8 的依赖、包路径和测试配置分开运行。
recap:
  - 集成测试连接至少两个真实边界，证明协作者接入后的行为而不只证明一个方法返回值。
  - SpringBootTest 创建完整 ApplicationContext；MOCK、RANDOM_PORT、DEFINED_PORT 和 NONE 的服务器边界不同。
  - Testcontainers 的 static 容器跨测试方法复用，实例容器则按测试方法启停；数据库状态仍需显式清理或回滚。
  - DynamicPropertySource 将容器运行时端口注入 Spring Environment，不能在静态配置中写死随机端口。
  - WireMock 应使用随机端口和每测重置的 stub；未匹配请求应让测试失败，而不是静默返回默认值。
  - RANDOM_PORT 下客户端与服务器位于不同线程，客户端测试事务不会替服务器端事务回滚。
  - Java 8 兼容线使用旧测试包、MockBean、Jackson 2 和 RestTemplate，不能只把现代工程改成 release 8。
related: []
tags:
  - Java
  - Spring Boot
  - 集成测试
  - SpringBootTest
  - Testcontainers
  - MySQL
  - WireMock
  - 测试上下文
  - 测试隔离
appliesTo: Java 25、Spring Boot 4.1.1、Spring Framework 7.0.9、JUnit 6.0.3、Testcontainers 2.0.5、WireMock 3.13.2 主线；Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE、JUnit 5.6.3 兼容补充
verifiedAt: 2026-08-26
sources:
  - id: boot-41-spring-boot-tests
    title: Spring Boot 4.1 Testing Spring Boot Applications
    url: https://docs.spring.io/spring-boot/4.1/reference/testing/spring-boot-applications.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.1
    claims:
      - SpringBootTest 通过 SpringApplication 创建完整 ApplicationContext
      - MOCK 默认不启动服务器，RANDOM_PORT 和 DEFINED_PORT 启动真实 Web 服务器，NONE 不提供 Web 环境
      - SpringBootTest 测试完整应用，切片测试只加载更窄的组件范围
  - id: boot-41-auto-configure-mockmvc
    title: AutoConfigureMockMvc API
    url: https://docs.spring.io/spring-boot/4.1/api/java/org/springframework/boot/webmvc/test/autoconfigure/AutoConfigureMockMvc.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Boot 4.1.1
    claims:
      - AutoConfigureMockMvc 注册 MockMvc 和 MVC 测试自动配置
      - addFilters 默认启用过滤器
  - id: boot-41-testcontainers
    title: Spring Boot 4.1 Testcontainers
    url: https://docs.spring.io/spring-boot/4.1/reference/testing/testcontainers.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.1
    claims:
      - Spring Boot 支持通过 ServiceConnection 为容器服务创建连接详情
      - Testcontainers 容器可以作为 Spring 测试配置的一部分参与完整上下文测试
  - id: spring-test-context-cache
    title: Spring Framework TestContext Framework
    url: https://docs.spring.io/spring-framework/reference/testing/testcontext-framework.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.9
    claims:
      - TestContext 管理测试 ApplicationContext 的加载与缓存
      - 污染上下文的测试需要使用 DirtiesContext 等明确手段隔离
  - id: testcontainers-junit5
    title: Testcontainers JUnit 5 integration
    url: https://java.testcontainers.org/test_framework_integration/junit_5/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Testcontainers 2.0.5
    claims:
      - Testcontainers JUnit Jupiter 扩展管理 @Container 字段的启动和停止
      - static 容器跨测试方法共享，实例容器按测试方法启停
  - id: testcontainers-mysql
    title: Testcontainers MySQL module
    url: https://java.testcontainers.org/modules/databases/mysql/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Testcontainers 2.0.5
    claims:
      - MySQLContainer 可以创建带随机端口的真实 MySQL 测试服务
      - JDBC URL 可以由容器运行时属性提供给应用
  - id: wiremock-junit5
    title: WireMock JUnit Jupiter
    url: https://wiremock.org/docs/junit-jupiter/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: WireMock 3.13.2
    claims:
      - WireMock Jupiter 扩展可以启动随机端口服务器并注入运行时信息
      - 每个测试方法前可以重置 stub 和请求记录，未匹配请求默认导致失败
  - id: boot-2312-testing
    title: Spring Boot 2.3.12 Testing Spring Boot Applications
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/spring-boot-features.html#boot-features-testing
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Boot 2.3.12 使用旧测试 starter、WebMvcTest 包路径和 MockBean
      - Boot 2.3.12 支持 SpringBootTest 完整上下文测试
  - id: spring-5215-dynamic-property-source
    title: DynamicPropertySource API
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/test/context/DynamicPropertySource.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - DynamicPropertySource 方法必须是 static，并把动态属性加入测试 Environment
      - 动态属性优先级高于常规配置来源
  - id: fowler-practical-test-pyramid
    title: The Practical Test Pyramid
    url: https://martinfowler.com/articles/practical-test-pyramid.html
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: 通用集成测试实践
    claims:
      - 窄集成测试应围绕数据库、文件系统或外部服务等真实边界建立反馈
      - 集成测试的范围可以保持窄，而不必把所有系统都纳入一次测试
---

# 集成测试

单元测试能告诉你 Service 分支是否正确，MockMvc 能告诉你 Controller 的 HTTP 适配是否正确，但它们都可以在
协作者没有真正接通时保持绿色。真正的 Web 功能还需要回答：Spring 能否把 Bean 装配起来，数据库驱动能否连接
真实数据库，SQL 是否能读写预期数据，外部通知服务失败时事务和错误合同是否仍然成立。

本课把范围缩在一条窄反馈环：完整 Spring 上下文、一次性 MySQL 和一个 WireMock 外部通知服务。测试不部署整套
TeamFlow，也不提前讲认证、容器镜像或消息队列。你将验证一个任务创建请求从 Controller 经过 Service、Repository
写入真实 MySQL，并向外部通知服务发送请求；外部服务失败时，测试观察任务是否保持未写入。

## 一、先划清集成测试边界

### 1. 从“连接了谁”判断测试类型

集成测试不是“测试代码更多”的同义词，而是被测代码跨过了一个真实协作边界。直接 `new TaskService` 并把仓储换成
mock，只能证明 Service 和测试替身之间的合同；`@WebMvcTest` 只装配 MVC 相关组件，也不会证明数据库驱动和
事务配置。`@SpringBootTest` 则会通过 SpringApplication 创建完整 ApplicationContext，让真实 Bean、配置和
基础设施一起参与反馈。

| 测试 | 真实边界 | 能证明什么 | 不能证明什么 |
| --- | --- | --- | --- |
| Service 单元测试 | 只有被测对象 | 分支、结果和必要协作 | Spring 装配、SQL、网络 |
| MockMvc 切片 | Spring MVC 与 mock Service | 路由、绑定、校验、响应 | 数据源、真实事务、真实外部服务 |
| 完整上下文 + MySQL | Spring Bean、JDBC、数据库 | 配置、SQL、事务和持久化协作 | 外部服务真实可用性 |
| 完整上下文 + WireMock | Spring Bean、HTTP 外部替身 | 客户端请求合同和失败处理 | 真实供应商行为 |

**社区补充：** Martin Fowler 对窄集成测试的建议是围绕一个外部边界建立反馈，例如真实数据库或被替身隔离的
外部服务。这样一次失败仍然能指出“数据库接入”或“通知请求”这条边界，不会把整个部署环境变成不可解释的黑盒。

### 2. 本课只增加一条可观察路径

TeamFlow 已有任务 API 合同。本课的测试工程只保留创建任务所需的最小部分：

- `POST /api/v1/projects/{projectId}/tasks` 接收 `title`、`dueAt` 和 `assignee`。
- `TaskService` 调用真实 `TaskRepository`，Repository 使用 JDBC 写入 MySQL。
- 创建成功后，`NotificationClient` 向 `/notifications` 发送任务 ID 和项目 ID。
- 测试通过 MockMvc 发请求，通过 JdbcTemplate 查询数据库，并通过 WireMock 校验外部请求。

查询分页、缓存、认证、权限和真实端口部署不在本课范围；它们分别由前置或后续课程承担。

### 3. 集成测试的通过条件是多边界同时成立

一个仅返回 `201` 的测试不够。成功场景至少需要同时观察：

1. ApplicationContext 成功启动并找到 Controller、Service、Repository 和通知客户端。
2. HTTP 响应包含生成的任务 ID 和 `Location`。
3. MySQL 中确实出现一行对应的任务。
4. WireMock 收到一次正确路径、方法和 JSON 字段的请求。

失败场景则观察另一组合同：通知服务返回 `503` 时，Service 抛出稳定异常，Controller 返回 `502`，数据库中没有
因为失败通知而留下任务。若业务选择“先落库再异步通知”，那是另一条明确合同，不能让测试替它猜测。

## 二、让 Spring 上下文形成可解释的反馈

### 1. SpringBootTest 的四种 WebEnvironment

`@SpringBootTest` 默认使用 `MOCK` 环境。它创建完整上下文，但不监听 TCP 端口；搭配 `@AutoConfigureMockMvc` 后，
请求由 MockMvc 进入真实 DispatcherServlet。`RANDOM_PORT` 和 `DEFINED_PORT` 会启动真实 Web 服务器，适合用
真实 HTTP 客户端验证端口和序列化；`NONE` 则明确不创建 Web 环境。

```java
/** 验证完整上下文但不启动 TCP 服务器。 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
class MockEnvironmentIntegrationTest {}

/** 验证嵌入式服务器在随机端口上启动。 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class RandomPortIntegrationTest {}
```

`MOCK` 不是“假的 Spring”。Controller、Service、Repository 和数据源 Bean 仍然由容器创建；假的部分只是请求和
响应通道。相反，`RANDOM_PORT` 并不会自动让测试更可靠，它只是把 TCP、端口占用和真实客户端也纳入边界。

### 2. AutoConfigureMockMvc 要显式表达意图

Boot 4.1 的 `AutoConfigureMockMvc` 位于 `org.springframework.boot.webmvc.test.autoconfigure`，默认会注册 MVC
过滤器。把 `addFilters` 改成 `false` 会绕过安全过滤链，只有课程明确要隔离安全时才这样做；本课没有引入认证，
因此保留默认值即可。

```java
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;

/** 使用完整上下文中的真实 MVC 组件。 */
@SpringBootTest
@AutoConfigureMockMvc
class TaskIntegrationTest {}
```

Boot 2.3 的包路径是 `org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc`。两条线都要
显式写注解，不能把上一课的 `@WebMvcTest` 换成 `@SpringBootTest` 后继续保留 MockBean 作为唯一证明。

### 3. 上下文缓存既能提速也会隐藏污染

Spring TestContext 会缓存相同配置的 ApplicationContext，后续测试可以复用已经创建的 Bean。缓存本身不是共享
业务状态的许可：静态集合、数据库行、WireMock 请求记录和系统属性仍可能让测试顺序影响结果。

```java
/** 每次测试前清空本测试会改变的业务表。 */
@BeforeEach
void clearTasks() {
    jdbcTemplate.update("DELETE FROM tasks");
}

/** 只有测试修改了 ApplicationContext Bean 定义时才要求重新加载上下文。 */
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class ContextChangingIntegrationTest {}
```

不要为了每个数据库断言都加 `@DirtiesContext`。它会丢掉上下文缓存并显著放慢反馈；只清理实际变化的外部状态，
只有修改 Bean 定义或环境的测试才重建上下文。

### 4. 事务边界不能靠注解想当然

在 `MOCK` 环境中，测试方法可以使用 Spring Test 的事务支持观察回滚效果，但真实端口测试的客户端请求和服务器
处理通常位于不同线程。测试方法上的事务不会自动包住服务器线程里的事务；`RANDOM_PORT` 测试不能把“客户端回滚”
当作清理服务器写入的保证。

```java
/** 仅演示测试事务的范围，不替代数据库清理。 */
@Transactional
@Test
void mockRequestTransactionIsNotAUniversalCleanup() throws Exception {
    mockMvc.perform(post("/api/v1/projects/PRJ-1/tasks")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"title\":\"Build\",\"dueAt\":\"2026-08-28\",\"assignee\":\"lin\"}"))
        .andExpect(status().isCreated());
}
```

本课完整工程采用 `@BeforeEach` 删除任务表，并在每条测试中使用唯一标题。这样既能应对真实端口变化，也能让状态
清理责任直接可见。

## 三、用 Testcontainers 接入真实 MySQL

### 1. 容器是测试基础设施，不是业务 fixture

`@Testcontainers` 让 JUnit Jupiter 扩展发现 `@Container` 字段。static 容器在测试类的第一个方法前启动，在最后
一个方法后停止；实例容器则每个测试方法单独启动和停止。MySQL 启动需要 Docker，因此 Docker 不可用时应报告
环境前置未满足，不能把 H2 代替 MySQL 后仍宣称 SQL 集成已验证。

```java
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** 为本测试类提供一套可复用的真实 MySQL。 */
@Testcontainers
class MysqlContainerFixture {
    static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.0.36")
        .withDatabaseName("teamflow")
        .withUsername("teamflow")
        .withPassword("teamflow-test");

    @Container
    static final MySQLContainer<?> DATABASE = MYSQL;
}
```

同一测试类的 static 容器共享的是数据库服务，不是自动隔离的表数据。每条测试仍要清理写入，或者在事务合同明确
时使用回滚；不能因为容器只启动一次就让测试依赖执行顺序。

### 2. 动态属性必须在容器启动后读取

容器端口由 Docker 在运行时分配，不能写成固定的 `3306`。`@DynamicPropertySource` 接收注册表并提供函数，
Spring 在创建 DataSource 时才读取实际 JDBC URL、用户名和密码。

```java
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

/** 把容器运行时连接信息交给 Spring 数据源。 */
@DynamicPropertySource
static void registerDatabase(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", DATABASE::getJdbcUrl);
    registry.add("spring.datasource.username", DATABASE::getUsername);
    registry.add("spring.datasource.password", DATABASE::getPassword);
}
```

Boot 4.1 还可以使用 `@ServiceConnection` 让 Boot 根据容器类型创建连接详情。它适合统一管理测试服务；
`DynamicPropertySource` 更容易同时在 Boot 2.3.12 兼容线上工作。本课完整代码使用后者，并在现代线的替代片段中
标出前者。

```java
/** 现代 Boot 中让连接详情由容器类型自动推断。 */
@Container
@ServiceConnection
static final MySQLContainer<?> DATABASE = new MySQLContainer<>("mysql:8.0.36");
```

不要同时为同一个属性注册 `@ServiceConnection` 和 `@DynamicPropertySource`。两种方式都能提供连接，重复注册会
让排错者无法判断最终属性来自哪里。

### 3. Schema 初始化必须属于测试合同

为了让示例不依赖本机残留数据库，完整工程把 `schema.sql` 放进 `src/test/resources`，并设置
`spring.sql.init.mode=always`。每次容器都是空的，应用启动时会创建同一张任务表。

```sql
CREATE TABLE tasks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id VARCHAR(80) NOT NULL,
    title VARCHAR(120) NOT NULL,
    due_at VARCHAR(40) NOT NULL,
    assignee VARCHAR(80) NOT NULL,
    status VARCHAR(20) NOT NULL
);
```

初始化脚本只负责表结构，不插入测试数据。测试中的数据由当前方法创建，并在下一次测试前删除；这样失败报告能
区分“schema 没加载”和“业务写入不正确”。

## 四、用 WireMock 控制外部服务

### 1. 随机端口比固定端口更适合测试

WireMock 是外部 HTTP 服务的可控替身。它应该绑定随机端口，测试通过运行时端口把 `teamflow.notification.base-url`
注入 Spring。固定 `8080` 会在并行测试或本机已有服务时产生无关冲突。

```java
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.options;
import com.github.tomakehurst.wiremock.WireMockServer;

/** 启动随机端口的外部通知替身。 */
static WireMockServer startNotificationStub() {
    WireMockServer server = new WireMockServer(options().dynamicPort());
    server.start();
    return server;
}
```

如果使用 WireMock Jupiter 扩展，可以让扩展管理生命周期和每测重置；手工 `WireMockServer` 则必须在
`@BeforeAll`/`@AfterAll` 中明确启动和停止。两种模式不要混用，否则同一测试可能启动两个服务器。

### 2. Stub 要描述请求合同

成功 stub 至少匹配 HTTP 方法和路径，必要时再匹配 JSON 字段。只返回一个无条件 `200` 会掩盖客户端发错路径、
请求体字段缺失和项目 ID 丢失的问题。

```java
/** 为任务创建通知注册精确的外部成功响应。 */
void stubNotification(WireMockServer server) {
    server.stubFor(post(urlEqualTo("/notifications"))
        .withHeader("Content-Type", containing("application/json"))
        .withRequestBody(matchingJsonPath("$.projectId", equalTo("PRJ-1")))
        .withRequestBody(matchingJsonPath("$.taskId", matching("[0-9]+")))
        .willReturn(aResponse()
            .withStatus(202)
            .withHeader("Content-Type", "application/json")
            .withBody("{\"accepted\":true}")));
}
```

WireMock 默认会把未匹配请求报告为失败。不要把 `failOnUnmatchedRequests(false)` 当作修复测试的快捷开关；只有
测试本来就不关心某类探测请求时，才在边界说明中局部放宽。

### 3. 外部失败要观察数据库后果

失败 stub 不只是为了让客户端抛异常，还要确认本地状态满足业务合同：

```java
/** 让通知服务返回失败，验证本地写入没有被错误地保留。 */
void stubNotificationFailure(WireMockServer server) {
    server.stubFor(post(urlEqualTo("/notifications"))
        .willReturn(aResponse().withStatus(503)));
}
```

测试结束后用 `NOTIFICATION_SERVER.verify(1, postRequestedFor(urlEqualTo("/notifications")))` 观察请求次数。只检查 `503` 而不检查
数据库，会允许实现先写入任务、再吞掉通知异常，导致下次查询看到一条没有通知的半成品任务。

## 五、两条版本线必须分开

### 1. 现代 Boot 4.1 / Java 25

现代工程使用 Boot 4.1.1 parent，测试依赖由 Boot 和 Testcontainers BOM 管理。常用包路径如下：

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-test</artifactId>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>org.testcontainers</groupId>
  <artifactId>mysql</artifactId>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>org.testcontainers</groupId>
  <artifactId>junit-jupiter</artifactId>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>org.wiremock</groupId>
  <artifactId>wiremock</artifactId>
  <version>3.13.2</version>
  <scope>test</scope>
</dependency>
```

本课的现代完整工程使用 `org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc`、
`org.springframework.jdbc.core.JdbcTemplate` 和 `org.springframework.test.context.DynamicPropertySource`。
若改用自动连接，额外加入 `spring-boot-testcontainers`，并使用 `org.springframework.boot.testcontainers.service.connection.ServiceConnection`。

### 2. Boot 2.3.12 / Java 8

兼容工程单独使用 `spring-boot-starter-test`、Boot 管理的 JUnit Jupiter 5.6.3，以及 Java 8 可用的 WireMock 2.35.1。
包路径和 JSON 库都必须随工程切换：

```java
import javax.validation.Valid;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import com.fasterxml.jackson.databind.ObjectMapper;
```

Boot 2.3.12 没有现代 `ProblemDetail` 和 `@MockitoBean`。兼容工程使用普通 Java Bean 表示响应，使用
`@MockBean` 只在切片测试中替换协作者；本课的集成测试则装配真实 Service、Repository 和 `RestTemplate`。
`DynamicPropertySource` 在 Spring Framework 5.2.15 可用，因此可以复用动态端口注入思路，但包版本和 POM 必须独立。

### 3. 不要用 release 8 伪装兼容验证

在 Java 25 上执行 `javac --release 8` 只能检查语言字节码级别，不能证明 Spring Framework 5.2、Boot 2.3、旧
Jackson、旧 MySQL 驱动和 WireMock 2.35.1 能在真实 Java 8 runtime 启动。兼容工程必须在 Java 8 的 Project SDK、
模块 SDK 和 Maven Runner JRE 下执行自己的 Maven 测试命令。

## 六、完整工程：现代线

### 1. 工程结构与 POM

下面的工程只增加本课的集成边界。它不覆盖前置课已经创建的文件；在 TeamFlow 工程中应打开并修改已有的
任务 Controller、Service 和 Repository，而不是再次创建同名类。

```text
integration-test/
  pom.xml
  src/main/java/example/integration/TaskApplication.java
  src/main/java/example/integration/CreateTaskRequest.java
  src/main/java/example/integration/TaskResponse.java
  src/main/java/example/integration/TaskRepository.java
  src/main/java/example/integration/NotificationClient.java
  src/main/java/example/integration/TaskService.java
  src/main/java/example/integration/TaskController.java
  src/test/java/example/integration/TaskIntegrationTest.java
  src/test/resources/schema.sql
```

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
  <artifactId>integration-test</artifactId>
  <version>1.0.0</version>
  <properties>
    <java.version>25</java.version>
    <testcontainers.version>2.0.5</testcontainers.version>
    <wiremock.version>3.13.2</wiremock.version>
  </properties>
  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>testcontainers-bom</artifactId>
        <version>${testcontainers.version}</version>
        <type>pom</type>
        <scope>import</scope>
      </dependency>
    </dependencies>
  </dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-webmvc</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-jdbc</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
      <groupId>com.mysql</groupId>
      <artifactId>mysql-connector-j</artifactId>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-webmvc-test</artifactId>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.testcontainers</groupId>
      <artifactId>mysql</artifactId>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.testcontainers</groupId>
      <artifactId>junit-jupiter</artifactId>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.wiremock</groupId>
      <artifactId>wiremock</artifactId>
      <version>${wiremock.version}</version>
      <scope>test</scope>
    </dependency>
  </dependencies>
  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
        <version>3.14.1</version>
      </plugin>
    </plugins>
  </build>
</project>
```

### 2. 定义应用、数据对象和 Repository

`TaskApplication.java`：

```java
package example.integration;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TaskApplication {
    /** 启动集成测试示例应用。 */
    public static void main(String[] args) {
        SpringApplication.run(TaskApplication.class, args);
    }
}
```

`CreateTaskRequest.java` 与 `TaskResponse.java`：

```java
package example.integration;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTaskRequest(
    @NotBlank @Size(max = 120) String title,
    @NotBlank @Size(max = 40) String dueAt,
    @NotBlank @Size(max = 80) String assignee
) {}
```

```java
package example.integration;

public record TaskResponse(
    long id,
    String projectId,
    String title,
    String dueAt,
    String assignee,
    String status
) {}
```

```java
package example.integration;

import java.util.Map;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class TaskRepository {
    private final JdbcTemplate jdbcTemplate;

    /** 注入真实 JDBC 访问协作者。 */
    public TaskRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /** 写入任务并返回数据库生成的主键。 */
    public long insert(String projectId, CreateTaskRequest request) {
        KeyHolder keys = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            var statement = connection.prepareStatement(
                "INSERT INTO tasks(project_id, title, due_at, assignee, status) VALUES (?, ?, ?, ?, ?)",
                new String[] { "id" }
            );
            statement.setString(1, projectId);
            statement.setString(2, request.title());
            statement.setString(3, request.dueAt());
            statement.setString(4, request.assignee());
            statement.setString(5, "TODO");
            return statement;
        }, keys);
        Number id = keys.getKey();
        if (id == null) throw new IllegalStateException("database did not return task id");
        return id.longValue();
    }

    /** 按主键读取任务，用于集成测试后的真实数据库断言。 */
    public Optional<Map<String, Object>> findRow(long id) {
        return jdbcTemplate.query(
            "SELECT id, project_id, title, due_at, assignee, status FROM tasks WHERE id = ?",
            (result, row) -> Map.of(
                "id", result.getLong("id"),
                "projectId", result.getString("project_id"),
                "title", result.getString("title"),
                "status", result.getString("status")
            ),
            id
        ).stream().findFirst();
    }
}
```

### 3. 定义外部客户端、事务服务和 Controller

`NotificationClient.java`：

```java
package example.integration;

import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class NotificationClient {
    private final RestClient client;

    /** 根据测试或生产配置创建通知客户端。 */
    public NotificationClient(@Value("${teamflow.notification.base-url}") String baseUrl) {
        this.client = RestClient.builder().baseUrl(baseUrl).build();
    }

    /** 向外部通知服务发送已创建任务。 */
    public void notifyCreated(String projectId, long taskId) {
        try {
            client.post()
                .uri("/notifications")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("projectId", projectId, "taskId", taskId))
                .retrieve()
                .toBodilessEntity();
        } catch (RuntimeException exception) {
            throw new NotificationUnavailableException(exception);
        }
    }
}
```

`RestClient` 收到 `4xx` 或 `5xx` 响应时会抛出异常。为了让失败合同稳定地落到 HTTP `502`，示例增加一个运行时异常
和一个 Controller advice：

```java
package example.integration;

/** 表示通知服务不可用，交给 Web 层转换为 502。 */
public class NotificationUnavailableException extends RuntimeException {
    /** 创建带原始异常原因的通知失败异常。 */
    public NotificationUnavailableException(Throwable cause) {
        super("notification service unavailable", cause);
    }
}
```

```java
package example.integration;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class TaskErrorHandler {
    /** 将外部通知失败转换为稳定的网关错误。 */
    @ExceptionHandler(NotificationUnavailableException.class)
    public ResponseEntity<Void> handleNotificationUnavailable(NotificationUnavailableException exception) {
        return ResponseEntity.status(502).build();
    }
}
```

`TaskService.java`：

```java
package example.integration;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskService {
    private final TaskRepository repository;
    private final NotificationClient notificationClient;

    /** 注入真实持久化和外部通知协作者。 */
    public TaskService(TaskRepository repository, NotificationClient notificationClient) {
        this.repository = repository;
        this.notificationClient = notificationClient;
    }

    /** 创建任务，通知失败时让当前数据库事务回滚。 */
    @Transactional
    public TaskResponse create(String projectId, CreateTaskRequest request) {
        long id = repository.insert(projectId, request);
        notificationClient.notifyCreated(projectId, id);
        return new TaskResponse(id, projectId, request.title(), request.dueAt(), request.assignee(), "TODO");
    }
}
```

`TaskController.java`：

```java
package example.integration;

import java.net.URI;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/tasks")
public class TaskController {
    private final TaskService taskService;

    /** 注入真实任务服务。 */
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /** 创建任务并返回资源地址。 */
    @PostMapping
    public ResponseEntity<TaskResponse> create(
        @PathVariable String projectId,
        @Valid @RequestBody CreateTaskRequest request
    ) {
        TaskResponse response = taskService.create(projectId, request);
        return ResponseEntity.created(URI.create(
            "/api/v1/projects/" + projectId + "/tasks/" + response.id()
        )).body(response);
    }
}
```

### 4. 编写完整集成测试

`TaskIntegrationTest.java`：

```java
package example.integration;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.equalTo;
import static com.github.tomakehurst.wiremock.client.WireMock.matching;
import static com.github.tomakehurst.wiremock.client.WireMock.matchingJsonPath;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.postRequestedFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;
import com.github.tomakehurst.wiremock.WireMockServer;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.options;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class TaskIntegrationTest {
    @Container
    static final MySQLContainer<?> DATABASE = new MySQLContainer<>("mysql:8.0.36")
        .withDatabaseName("teamflow")
        .withUsername("teamflow")
        .withPassword("teamflow-test");

    private static final WireMockServer NOTIFICATION_SERVER = startNotificationServer();

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /** 启动随机端口的外部通知替身，使动态属性读取时已有端口。 */
    private static WireMockServer startNotificationServer() {
        WireMockServer server = new WireMockServer(options().dynamicPort());
        server.start();
        return server;
    }

    /** 停止外部通知替身，释放随机端口。 */
    @AfterAll
    static void stopNotificationServer() {
        NOTIFICATION_SERVER.stop();
    }

    /** 向 Spring 注入两个真实测试服务的运行时地址。 */
    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", DATABASE::getJdbcUrl);
        registry.add("spring.datasource.username", DATABASE::getUsername);
        registry.add("spring.datasource.password", DATABASE::getPassword);
        registry.add("spring.sql.init.mode", () -> "always");
        registry.add("teamflow.notification.base-url", NOTIFICATION_SERVER::baseUrl);
    }

    /** 清理当前测试可能写入的任务和外部请求记录。 */
    @BeforeEach
    void resetState() {
        jdbcTemplate.update("DELETE FROM tasks");
        NOTIFICATION_SERVER.resetAll();
    }

    /** 验证真实上下文、MySQL 写入和外部通知请求同时成立。 */
    @Test
    void createsTaskAcrossDatabaseAndNotificationBoundary() throws Exception {
        NOTIFICATION_SERVER.stubFor(post(urlEqualTo("/notifications"))
            .withRequestBody(matchingJsonPath("$.projectId", equalTo("PRJ-1")))
            .withRequestBody(matchingJsonPath("$.taskId", matching("[0-9]+")))
            .willReturn(aResponse().withStatus(202)));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(
                "/api/v1/projects/PRJ-1/tasks")
                .contentType("application/json")
                .content("{\"title\":\"Build\",\"dueAt\":\"2026-08-28\",\"assignee\":\"lin\"}"))
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", matching(".*/api/v1/projects/PRJ-1/tasks/[0-9]+")))
            .andExpect(jsonPath("$.id").isNumber())
            .andExpect(jsonPath("$.projectId").value("PRJ-1"))
            .andExpect(jsonPath("$.status").value("TODO"))
            .andReturn();

        Map<String, Object> row = jdbcTemplate.queryForMap(
            "SELECT id, project_id, title, status FROM tasks WHERE title = ?", "Build"
        );
        assertEquals("PRJ-1", row.get("project_id"));
        assertEquals("Build", row.get("title"));
        NOTIFICATION_SERVER.verify(1, postRequestedFor(urlEqualTo("/notifications")));
    }

    /** 验证外部失败触发事务回滚且不会残留任务。 */
    @Test
    void rollsBackDatabaseWhenNotificationFails() throws Exception {
        NOTIFICATION_SERVER.stubFor(post(urlEqualTo("/notifications"))
            .willReturn(aResponse().withStatus(503)));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(
                "/api/v1/projects/PRJ-1/tasks")
                .contentType("application/json")
                .content("{\"title\":\"Broken\",\"dueAt\":\"2026-08-28\",\"assignee\":\"lin\"}"))
            .andExpect(status().isBadGateway());

        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM tasks WHERE title = ?", Integer.class, "Broken"
        );
        assertEquals(0, count);
        NOTIFICATION_SERVER.verify(1, postRequestedFor(urlEqualTo("/notifications")));
    }
}
```

上面的完整测试展示了几个重要边界：测试方法没有 mock `TaskService` 或 `TaskRepository`；MySQL 连接来自容器；
通知服务使用随机端口；成功场景同时断言 HTTP、数据库和外部请求；失败场景同时断言 HTTP 和事务回滚。
响应中的 `id` 已由 `jsonPath("$.id").isNumber()` 覆盖；数据库断言按标题查询生成的真实行，因此完整示例不需要额外
实现 JSON 解析辅助类。

### 5. 运行现代工程并读取结果

在工程根目录设置 Project SDK、模块 SDK 和 Maven Runner JRE 为 Java 25，确认 Docker Desktop 正在运行，然后执行：

```bash
mvn -Dtest=TaskIntegrationTest test
```

预期输出至少包含：

```text
Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

如果看到 `Could not find a valid Docker environment`，这是 Testcontainers 的环境前置缺失；如果看到 `Communications
link failure`，先检查容器日志、JDBC URL 和动态属性，不要把数据库替换为 H2 后继续记录成功。

## 七、完整工程：Java 8 兼容线

### 1. 目录和 POM 必须独立

兼容工程目录为 `integration-test-java8/`，不能和现代工程共用 `target`、POM 或 `src`：

```text
integration-test-java8/
  pom.xml
  src/main/java/example/integration/TaskApplication.java
  src/main/java/example/integration/CreateTaskRequest.java
  src/main/java/example/integration/TaskResponse.java
  src/main/java/example/integration/TaskRepository.java
  src/main/java/example/integration/NotificationClient.java
  src/main/java/example/integration/TaskService.java
  src/main/java/example/integration/TaskController.java
  src/test/java/example/integration/TaskIntegrationTest.java
  src/test/resources/schema.sql
```

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
  <artifactId>integration-test-java8</artifactId>
  <version>1.0.0</version>
  <properties>
    <java.version>1.8</java.version>
    <wiremock.version>2.35.1</wiremock.version>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-jdbc</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
      <groupId>mysql</groupId>
      <artifactId>mysql-connector-java</artifactId>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.testcontainers</groupId>
      <artifactId>mysql</artifactId>
      <version>1.20.1</version>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.testcontainers</groupId>
      <artifactId>junit-jupiter</artifactId>
      <version>1.20.1</version>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>com.github.tomakehurst</groupId>
      <artifactId>wiremock-jre8</artifactId>
      <version>${wiremock.version}</version>
      <scope>test</scope>
    </dependency>
  </dependencies>
</project>
```

Java 8 兼容工程的 Testcontainers 版本、MySQL 驱动坐标和 WireMock artifact 与现代线分开，不能把现代线的
`org.testcontainers:mysql:2.0.5` 和 `org.wiremock:wiremock:3.13.2` 直接复制进去。若团队必须使用其他已验证版本，
应同步更新 POM、来源和运行结果，不能只改版本字符串。

### 2. Java 8 数据对象和客户端差异

Java 8 没有 record，DTO 使用普通 Bean，并保留与现代线相同的 JSON 字段：

```java
package example.integration;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class CreateTaskRequest {
    @NotBlank @Size(max = 120)
    private String title;
    @NotBlank @Size(max = 40)
    private String dueAt;
    @NotBlank @Size(max = 80)
    private String assignee;

    /** 创建空请求对象供 Jackson 绑定。 */
    public CreateTaskRequest() {}

    /** 返回任务标题。 */
    public String getTitle() { return title; }

    /** 设置任务标题。 */
    public void setTitle(String title) { this.title = title; }

    /** 返回截止时间。 */
    public String getDueAt() { return dueAt; }

    /** 设置截止时间。 */
    public void setDueAt(String dueAt) { this.dueAt = dueAt; }

    /** 返回负责人。 */
    public String getAssignee() { return assignee; }

    /** 设置负责人。 */
    public void setAssignee(String assignee) { this.assignee = assignee; }
}
```

`NotificationClient` 使用 `RestTemplate`，其外部路径和请求 JSON 与现代 `RestClient` 相同：

```java
package example.integration;

import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class NotificationClient {
    private final RestTemplate restTemplate = new RestTemplate();
    private final String baseUrl;

    /** 读取兼容线的通知服务地址。 */
    public NotificationClient(@Value("${teamflow.notification.base-url}") String baseUrl) {
        this.baseUrl = baseUrl;
    }

    /** 使用 Java 8 可用的 RestTemplate 发送通知。 */
    public void notifyCreated(String projectId, long taskId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, Object> body = new java.util.HashMap<>();
        body.put("projectId", projectId);
        body.put("taskId", taskId);
        try {
            restTemplate.postForEntity(
                baseUrl + "/notifications",
                new HttpEntity<Map<String, Object>>(body, headers),
                Void.class
            );
        } catch (RuntimeException exception) {
            throw new NotificationUnavailableException(exception);
        }
    }
}
```

该实现只使用 Java 8 可用的 `HashMap`、`HttpEntity` 和 `RestTemplate`。它与现代线的可观察合同保持一致：URL 为
`/notifications`，请求体包含 `projectId` 和 `taskId`，通知返回 `4xx` 或 `5xx` 时由 `RestTemplate` 抛出异常。

`TaskApplication.java`、`TaskResponse.java`、`TaskRepository.java`、`TaskService.java` 和 `TaskController.java`：

```java
package example.integration;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TaskApplication {
    /** 启动 Java 8 兼容工程。 */
    public static void main(String[] args) {
        SpringApplication.run(TaskApplication.class, args);
    }
}
```

```java
package example.integration;

public class TaskResponse {
    private long id;
    private String projectId;
    private String title;
    private String dueAt;
    private String assignee;
    private String status;

    /** 创建供 Jackson 使用的空响应对象。 */
    public TaskResponse() {}

    /** 创建完整任务响应。 */
    public TaskResponse(long id, String projectId, String title, String dueAt, String assignee, String status) {
        this.id = id;
        this.projectId = projectId;
        this.title = title;
        this.dueAt = dueAt;
        this.assignee = assignee;
        this.status = status;
    }

    /** 返回任务 ID。 */
    public long getId() { return id; }

    /** 返回项目 ID。 */
    public String getProjectId() { return projectId; }

    /** 返回任务标题。 */
    public String getTitle() { return title; }

    /** 返回截止时间。 */
    public String getDueAt() { return dueAt; }

    /** 返回负责人。 */
    public String getAssignee() { return assignee; }

    /** 返回任务状态。 */
    public String getStatus() { return status; }
}
```

```java
package example.integration;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class TaskRepository {
    private final JdbcTemplate jdbcTemplate;

    /** 注入真实 JDBC 访问协作者。 */
    public TaskRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /** 写入任务并返回数据库生成的主键。 */
    public long insert(String projectId, CreateTaskRequest request) {
        KeyHolder keys = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            java.sql.PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO tasks(project_id, title, due_at, assignee, status) VALUES (?, ?, ?, ?, ?)",
                new String[] { "id" }
            );
            statement.setString(1, projectId);
            statement.setString(2, request.getTitle());
            statement.setString(3, request.getDueAt());
            statement.setString(4, request.getAssignee());
            statement.setString(5, "TODO");
            return statement;
        }, keys);
        Number id = keys.getKey();
        if (id == null) throw new IllegalStateException("database did not return task id");
        return id.longValue();
    }
}
```

```java
package example.integration;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskService {
    private final TaskRepository repository;
    private final NotificationClient notificationClient;

    /** 注入真实持久化和外部通知协作者。 */
    public TaskService(TaskRepository repository, NotificationClient notificationClient) {
        this.repository = repository;
        this.notificationClient = notificationClient;
    }

    /** 创建任务，通知失败时让当前数据库事务回滚。 */
    @Transactional
    public TaskResponse create(String projectId, CreateTaskRequest request) {
        long id = repository.insert(projectId, request);
        notificationClient.notifyCreated(projectId, id);
        return new TaskResponse(id, projectId, request.getTitle(), request.getDueAt(), request.getAssignee(), "TODO");
    }
}
```

```java
package example.integration;

import java.net.URI;
import javax.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/tasks")
public class TaskController {
    private final TaskService taskService;

    /** 注入真实任务服务。 */
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /** 创建任务并返回资源地址。 */
    @PostMapping
    public ResponseEntity<TaskResponse> create(
        @PathVariable String projectId,
        @Valid @RequestBody CreateTaskRequest request
    ) {
        TaskResponse response = taskService.create(projectId, request);
        return ResponseEntity.created(URI.create(
            "/api/v1/projects/" + projectId + "/tasks/" + response.getId()
        )).body(response);
    }
}
```

通知失败的异常和处理器也需要使用 Boot 2.3 可用的 Spring MVC API：

```java
package example.integration;

/** 表示通知服务不可用，交给 Web 层转换为 502。 */
public class NotificationUnavailableException extends RuntimeException {
    /** 创建带原始异常原因的通知失败异常。 */
    public NotificationUnavailableException(Throwable cause) {
        super("notification service unavailable", cause);
    }
}
```

```java
package example.integration;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class TaskErrorHandler {
    /** 将外部通知失败转换为稳定的网关错误。 */
    @ExceptionHandler(NotificationUnavailableException.class)
    public ResponseEntity<Void> handleNotificationUnavailable(NotificationUnavailableException exception) {
        return ResponseEntity.status(502).build();
    }
}
```

### 3. Java 8 完整集成测试

兼容测试仍使用 `@SpringBootTest`、`@AutoConfigureMockMvc`、`@Testcontainers`、`@Container`、
`@DynamicPropertySource` 和真实 MySQL。WireMock 2.35.1 使用 `com.github.tomakehurst` 包；测试服务器在静态字段初始化
阶段启动，确保 Spring 读取动态通知地址时端口已经存在：

```java
package example.integration;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.postRequestedFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static org.junit.jupiter.api.Assertions.assertEquals;
import java.util.Map;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import com.github.tomakehurst.wiremock.WireMockServer;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.options;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class TaskIntegrationTest {
    @Container
    static final MySQLContainer<?> DATABASE = new MySQLContainer<>("mysql:8.0.36")
        .withDatabaseName("teamflow")
        .withUsername("teamflow")
        .withPassword("teamflow-test");

    private static final WireMockServer NOTIFICATION_SERVER = startNotificationServer();

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /** 启动随机端口的外部通知替身。 */
    private static WireMockServer startNotificationServer() {
        WireMockServer server = new WireMockServer(options().dynamicPort());
        server.start();
        return server;
    }

    /** 停止外部通知替身。 */
    @AfterAll
    static void stopNotificationServer() {
        NOTIFICATION_SERVER.stop();
    }

    /** 向 Spring 注入真实测试服务的运行时地址。 */
    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", DATABASE::getJdbcUrl);
        registry.add("spring.datasource.username", DATABASE::getUsername);
        registry.add("spring.datasource.password", DATABASE::getPassword);
        registry.add("spring.datasource.initialization-mode", () -> "always");
        registry.add("teamflow.notification.base-url", NOTIFICATION_SERVER::baseUrl);
    }

    /** 清理数据库和外部请求记录。 */
    @BeforeEach
    void resetState() {
        jdbcTemplate.update("DELETE FROM tasks");
        NOTIFICATION_SERVER.resetAll();
    }

    /** 验证 Java 8 兼容线的成功路径。 */
    @Test
    void createsTaskAcrossDatabaseAndNotificationBoundary() throws Exception {
        NOTIFICATION_SERVER.stubFor(post(urlEqualTo("/notifications"))
            .willReturn(aResponse().withStatus(202)));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(
                "/api/v1/projects/PRJ-1/tasks")
                .contentType("application/json")
                .content("{\"title\":\"Build\",\"dueAt\":\"2026-08-28\",\"assignee\":\"lin\"}"))
            .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isCreated())
            .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.id").isNumber());

        Map<String, Object> row = jdbcTemplate.queryForMap(
            "SELECT project_id, title, status FROM tasks WHERE title = ?", "Build"
        );
        assertEquals("PRJ-1", row.get("project_id"));
        assertEquals("TODO", row.get("status"));
        NOTIFICATION_SERVER.verify(1, postRequestedFor(urlEqualTo("/notifications")));
    }

    /** 验证外部失败触发事务回滚。 */
    @Test
    void rollsBackDatabaseWhenNotificationFails() throws Exception {
        NOTIFICATION_SERVER.stubFor(post(urlEqualTo("/notifications"))
            .willReturn(aResponse().withStatus(503)));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(
                "/api/v1/projects/PRJ-1/tasks")
                .contentType("application/json")
                .content("{\"title\":\"Broken\",\"dueAt\":\"2026-08-28\",\"assignee\":\"lin\"}"))
            .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isBadGateway());

        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM tasks WHERE title = ?", Integer.class, "Broken"
        );
        assertEquals(0, count);
        NOTIFICATION_SERVER.verify(1, postRequestedFor(urlEqualTo("/notifications")));
    }
}
```

由于 Java 8 兼容线没有 `@ServiceConnection`，使用 `DynamicPropertySource` 是唯一的容器连接注入路径。测试文件与现代线
共用同一份 `schema.sql` 内容，但位于 `integration-test-java8/src/test/resources` 的独立目录中。

### 4. 运行 Java 8 工程并读取结果

在工程根目录使用 Java 8 的 Project SDK 和 Maven Runner JRE，确认 Docker Desktop 正在运行，然后单独进入兼容工程执行：

```bash
cd integration-test-java8
mvn -Dtest=TaskIntegrationTest test
```

预期输出至少包含：

```text
Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

这条命令必须在 Java 8 工程中实际执行；不能只在现代工程成功后，把兼容线标记为已验证。

## 八、集中排查五个集成测试错误

### 五个典型错误

:::pitfalls
### 把 MockMvc 切片当成完整集成测试

**触发条件：** 测试使用 `@WebMvcTest` 和 `@MockBean TaskService`，却把通过当成数据库集成已验证。

**原因：** WebMvcTest 只加载 MVC 相关组件，Service、Repository 和 DataSource 都被排除或替换。

**后果：** SQL、事务和真实数据库连接错误直到部署或后续测试才暴露。

**错误示例：**

```java
@WebMvcTest(TaskController.class)
class TaskIntegrationTest {}
```

**正确写法：**

```java
@SpringBootTest
@AutoConfigureMockMvc
class TaskIntegrationTest {}
```

**验证方式：** 适用于 Boot 4.1.1 与 Boot 2.3.12；在 Repository 中故意写错表名，切片测试仍可能启动，完整上下文
请求应在数据库边界失败；恢复表名后重跑同一命令。

### 把随机端口写死在配置中

**触发条件：** `spring.datasource.url` 或 WireMock base URL 使用固定 `localhost:3306`/`localhost:8080`。

**原因：** Docker 和 WireMock 运行时分配端口，固定端口不代表容器或替身实际监听位置。

**后果：** 测试连接到本机其他服务、并行测试互相抢端口，或出现 connection refused。

**错误示例：**

```java
registry.add("spring.datasource.url", () -> "jdbc:mysql://localhost:3306/teamflow");
```

**正确写法：**

```java
registry.add("spring.datasource.url", DATABASE::getJdbcUrl);
registry.add("teamflow.notification.base-url", NOTIFICATION_SERVER::baseUrl);
```

**验证方式：** 适用于 Boot 4.1.1、Boot 2.3.12 和 Testcontainers；停止本机 3306 服务仍应能由容器端口完成连接，
再用固定端口错误版本重跑，确认失败来自连接地址而非断言。

### 外部失败后只断言 HTTP 状态

**触发条件：** WireMock 返回 503，测试只断言 `502`，不查询数据库。

**原因：** HTTP 响应不能说明本地事务是否回滚；实现可能已经写入任务后吞掉通知错误。

**后果：** 数据库留下没有通知的半成品，后续查询或重试出现重复任务。

**错误示例：**

```java
mockMvc.perform(post("/api/v1/projects/PRJ-1/tasks")
        .contentType("application/json")
        .content("{\"title\":\"Broken\"}"))
    .andExpect(status().isBadGateway());
```

**正确写法：**

```java
Integer count = jdbcTemplate.queryForObject(
    "SELECT COUNT(*) FROM tasks WHERE title = ?", Integer.class, "Broken"
);
assertEquals(0, count);
```

**验证方式：** 适用于两条版本线；暂时删除 `@Transactional`，重新运行失败场景应发现数据库仍有一行，恢复后重跑
并确认查询结果为 0。

### 让测试数据依赖执行顺序

**触发条件：** 只在 `@BeforeAll` 插入一行任务，多个测试共享并修改它。

**原因：** static 容器复用服务，但不会自动为每个测试重置表数据；TestContext 缓存也不会清理数据库行。

**后果：** 单独运行通过，类内顺序变化、重复执行或并行运行时失败。

**错误示例：**

```java
@BeforeAll
static void seedOnce() {
    jdbcTemplate.update("INSERT INTO tasks ...");
}
```

**正确写法：**

```java
@BeforeEach
void resetState() {
    jdbcTemplate.update("DELETE FROM tasks");
    NOTIFICATION_SERVER.resetAll();
}
```

**验证方式：** 适用于 Testcontainers 2.0.5/1.20.1；连续运行 `mvn -Dtest=TaskIntegrationTest test` 两次，测试数和
结果必须一致，交换测试方法顺序也不能改变结果。

### 用客户端事务假设真实端口会回滚

**触发条件：** `RANDOM_PORT` 测试方法加 `@Transactional`，结束后直接假设服务器写入已经回滚。

**原因：** 客户端和服务器在不同线程，测试事务没有包住服务器请求处理事务。

**后果：** 数据库残留让下一条测试读取到旧状态，失败只在完整套件中出现。

**错误示例：**

```java
@Transactional
void randomPortRequestIsAutomaticallyRolledBack() {}
```

**正确写法：**

```java
@BeforeEach
void clearServerState() {
    jdbcTemplate.update("DELETE FROM tasks");
}
```

**验证方式：** 适用于 Spring Boot 4.1.1 与 2.3.12；将 MOCK 改为 RANDOM_PORT 后连续运行两次，读取数据库的结果
必须仍由显式清理保证；不能用测试方法事务取代清理。
:::

## 九、独立练习

:::exercise
### 为通知失败增加数据库边界测试

**要求：** 在完整工程中增加一个测试：WireMock 返回 503，向 `POST /api/v1/projects/PRJ-1/tasks` 发送标题为
`Retryable` 的请求，断言响应为 502，查询 `tasks` 表确认没有 `Retryable` 行，并验证通知端点只收到一次请求。
测试必须继续使用真实 MySQL、完整 Spring 上下文和随机 WireMock 端口，不得把 `TaskService` 或 Repository 改成 mock。

**验收：** `mvn -Dtest=TaskIntegrationTest#rollsBackDatabaseWhenNotificationFails test` 显示 1 条测试通过；
随后执行完整测试显示 2 条测试通过，连续执行两次的数量一致。
:::

### 1. 完整参考实现

```java
/** 验证通知失败时数据库没有遗留任务。 */
@Test
void rollsBackDatabaseWhenNotificationFails() throws Exception {
    NOTIFICATION_SERVER.stubFor(post(urlEqualTo("/notifications"))
        .willReturn(aResponse().withStatus(503)));

    mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(
            "/api/v1/projects/PRJ-1/tasks")
            .contentType("application/json")
            .content("{\"title\":\"Retryable\",\"dueAt\":\"2026-08-28\",\"assignee\":\"lin\"}"))
        .andExpect(status().isBadGateway());

    Integer count = jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM tasks WHERE title = ?", Integer.class, "Retryable"
    );
    assertEquals(0, count);
    NOTIFICATION_SERVER.verify(1, postRequestedFor(urlEqualTo("/notifications")));
}
```

### 2. 运行结果与自检

```text
Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

完成后应能解释：为什么完整上下文测试不能把 Service 替换成 mock；为什么容器端口必须动态注入；为什么通知失败
不仅要断言 502，还要查询数据库；为什么 RANDOM_PORT 下测试方法事务不能代替服务器状态清理。

## 十、本课小结

集成测试的价值在于把真实协作边界接回来，同时让范围仍然可解释。`@SpringBootTest` 证明完整 Bean 图能启动，
Testcontainers 证明 JDBC 和 SQL 真能面对 MySQL，WireMock 证明外部 HTTP 请求符合约定；成功和失败都要观察边界
两端的状态。容器生命周期、动态属性、上下文缓存和事务线程边界不是测试脚手架细节，而是决定反馈是否可信的
一部分。

### 课程总结

- 先根据真实协作者判断测试类型，再决定使用单元、切片还是完整上下文。
- `MOCK` 环境可用 MockMvc 验证真实 MVC；`RANDOM_PORT` 才把 TCP 客户端和服务器线程纳入范围。
- static Testcontainers 容器复用服务，不复用业务状态；每个测试仍需清理数据库和 WireMock 记录。
- `DynamicPropertySource` 提供随机端口连接，Boot 4.1 也可以使用 `ServiceConnection`。
- WireMock stub 必须匹配关键请求合同，外部失败应同时验证 HTTP、请求次数和数据库事务结果。
- Boot 4.1 与 Boot 2.3.12 使用不同 starter、包路径、JSON 库和 HTTP 客户端，必须在真实对应 JDK 下分别运行。

### 继续探索

后续课程会在这条完整反馈环上增加密码登录、JWT、角色权限、日志与健康探针；这些能力必须继续沿用真实上下文
和可观察边界，不能退回只断言单个方法返回值的验证方式。
