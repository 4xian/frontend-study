---
id: backend.java.learn.intermediate.testing-with-junit-and-mocks
type: lesson
title: JUnit、Mockito 与 Service 单元测试
summary: 不启动 Spring 或数据库，用真实 Service、Mockito 协作者和精确结果断言验证业务分支与失败合同
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 150
prerequisites:
  - backend.java.learn.intermediate.errors-results-and-logging
objectives:
  - 能把一个 Service 公开业务分支拆成输入、协作者安排、公开结果和必要副作用。
  - 能保持 Service、值对象和结果对象为真实实现，只 mock 越过单元边界的直接协作者。
  - 能用显式构造器建立清晰 fixture，并说明 InjectMocks 不能替代依赖设计。
  - 能用 when、thenReturn、thenThrow 与 doThrow 驱动成功、缺失、冲突和依赖失败分支。
  - 能先断言公开结果，再用 verify、times、never 与 InOrder 检查真正属于合同的协作。
  - 能正确选择精确参数、matcher 与 ArgumentCaptor，并识别 matcher 混用错误。
  - 能使用 MockitoExtension 与严格 stub 发现多余安排和参数不匹配。
  - 能隔离可变 fixture，并从常见 Mockito 失败信息定位测试、实现或准备阶段的问题。
recap:
  - I-14 的被测对象是普通 Service 的公开行为，不是 Spring Bean 身份、Controller 映射或私有方法。
  - 保持被测 Service 与业务值真实，只替换仓储、时钟和外部网关等直接协作者。
  - stub 安排依赖返回或失败，结果断言证明业务合同，verify 只补充必要协作。
  - 精确值优先于宽 matcher；复杂新对象在 verify 后用 captor 检查。
  - 默认一次调用无需写 times(1)，禁止写操作时用 never，顺序是合同才用 InOrder。
  - 严格 stub 暴露未使用安排和参数不匹配，不应靠全局 lenient 隐藏红灯。
  - 每个测试拥有自己的可变输入与 Service，公共 setup 不预置只服务某个分支的 stub。
  - 先按失败类型定位发现、断言、协作或严格性层级，再修改最小原因并复跑同一命令。
related:
  - backend.java.learn.basics.first-automated-test-with-junit
tags:
  - Java
  - 单元测试
  - JUnit
  - JUnit Jupiter
  - Mockito
  - Service
  - 测试替身
  - 严格 stub
  - Maven Surefire
  - 测试隔离
  - 失败诊断
appliesTo: Java 25、JUnit 6.1.3、Mockito 5.23.0、Maven Surefire 3.5.6 主线；Java 8、Spring Boot 2.3.12.RELEASE、JUnit Jupiter 5.6.3、Mockito 3.3.3 兼容补充
modernBaseline:
  java: '25'
  junit: 6.1.3
  mockito: 5.23.0
  mavenSurefire: 3.5.6
legacyBaseline:
  java: '8'
  springBoot: 2.3.12.RELEASE
  junitJupiter: 5.6.3
  mockito: 3.3.3
verifiedAt: 2026-08-16
sources:
  - id: junit-6-1-3-release
    title: JUnit 6.1.3 release
    url: https://github.com/junit-team/junit-framework/releases/tag/r6.1.3
    sourceType: release-note
    appliesTo: JUnit 6.1.3
    claims:
      - 现代主线使用 JUnit 6.1.3
  - id: junit-6-1-3-release-notes
    title: JUnit 6.1.3 Release Notes
    url: https://docs.junit.org/6.1.3/release-notes.html
    sourceType: release-note
    appliesTo: JUnit 6.1.3
    claims:
      - JUnit 6 运行时要求 Java 17 或以上
      - 记录 JUnit 6.1.3 的发布变更
  - id: junit-6-assertions
    title: JUnit Assertions API
    url: https://docs.junit.org/6.1.3/api/org.junit.jupiter.api/org/junit/jupiter/api/Assertions.html
    sourceType: api-doc
    appliesTo: JUnit Jupiter 6.1.3
    claims:
      - assertThrows 接受子类型并返回实际异常
      - assertThrowsExactly 只接受精确异常类型
  - id: spring-unit-testing
    title: Spring Framework Unit Testing
    url: https://docs.spring.io/spring-framework/reference/testing/unit.html
    sourceType: official-reference
    appliesTo: Spring Framework current
    claims:
      - POJO 可以在没有 Spring 容器的情况下进行单元测试
      - 依赖注入便于用 stub 或 mock 隔离持久化协作者
  - id: mockito-5-23-release
    title: Mockito 5.23.0 release
    url: https://github.com/mockito/mockito/releases/tag/v5.23.0
    sourceType: release-note
    appliesTo: Mockito 5.23.0
    claims:
      - 现代主线使用 Mockito 5.23.0
  - id: mockito-api
    title: Mockito API
    url: https://javadoc.io/static/org.mockito/mockito-core/5.23.0/org.mockito/org/mockito/Mockito.html
    sourceType: api-doc
    appliesTo: Mockito 5.23.0
    claims:
      - Mockito 提供 mock、stub、verify、次数验证与 never
      - spy 默认调用真实方法，doReturn 可避免安排时执行真实方法
  - id: mockito-extension
    title: MockitoExtension API
    url: https://javadoc.io/static/org.mockito/mockito-junit-jupiter/5.23.0/org.mockito.junit.jupiter/org/mockito/junit/jupiter/MockitoExtension.html
    sourceType: api-doc
    appliesTo: Mockito 5.23.0
    claims:
      - MockitoExtension 初始化 mock 并处理严格 stub
      - 扩展也支持测试方法参数
  - id: mockito-inject-mocks
    title: InjectMocks API
    url: https://javadoc.io/static/org.mockito/mockito-core/5.23.0/org.mockito/org/mockito/InjectMocks.html
    sourceType: api-doc
    appliesTo: Mockito 5.23.0
    claims:
      - 注入依次尝试构造器、setter 与字段
      - InjectMocks 不是依赖注入框架
  - id: mockito-captor
    title: ArgumentCaptor API
    url: https://javadoc.io/static/org.mockito/mockito-core/5.23.0/org.mockito/org/mockito/ArgumentCaptor.html
    sourceType: api-doc
    appliesTo: Mockito 5.23.0
    claims:
      - ArgumentCaptor 推荐用于 verify 后检查参数
      - 不推荐用 captor 构造 stub
  - id: mockito-matchers
    title: ArgumentMatchers API
    url: https://javadoc.io/static/org.mockito/mockito-core/5.23.0/org.mockito/org/mockito/ArgumentMatchers.html
    sourceType: api-doc
    appliesTo: Mockito 5.23.0
    claims:
      - 一次 mock 调用使用 matcher 时所有参数都必须使用 matcher
      - matcher 不能脱离 stub 或 verify 调用使用
  - id: mockito-strictness
    title: Strictness API
    url: https://javadoc.io/static/org.mockito/mockito-core/5.23.0/org.mockito/org/mockito/quality/Strictness.html
    sourceType: api-doc
    appliesTo: Mockito 5.23.0
    claims:
      - STRICT_STUBS 用于发现未使用 stub 和参数不匹配
      - LENIENT 只应用于明确例外
  - id: mockito-unused-stub
    title: UnnecessaryStubbingException API
    url: https://javadoc.io/static/org.mockito/mockito-core/5.23.0/org.mockito/org/mockito/exceptions/misusing/UnnecessaryStubbingException.html
    sourceType: api-doc
    appliesTo: Mockito 5.23.0
    claims:
      - 未使用 stub 应删除或只对真实例外局部放宽
  - id: mockito-stub-mismatch
    title: PotentialStubbingProblem API
    url: https://javadoc.io/static/org.mockito/mockito-core/5.23.0/org.mockito/org/mockito/exceptions/misusing/PotentialStubbingProblem.html
    sourceType: api-doc
    appliesTo: Mockito 5.23.0
    claims:
      - stub 参数与实际调用不一致通常表示测试或实现错误
  - id: surefire-3-5-6-release
    title: Surefire 3.5.6 release
    url: https://github.com/apache/maven-surefire/releases/tag/surefire-3.5.6
    sourceType: release-note
    appliesTo: Maven Surefire 3.5.6
    claims:
      - 现代 fixture 使用稳定 GA 版本 3.5.6
  - id: surefire-junit-platform
    title: Surefire JUnit Platform
    url: https://maven.apache.org/surefire/maven-surefire-plugin/examples/junit-platform.html
    sourceType: official-reference
    appliesTo: Maven Surefire 3.5.6
    claims:
      - Maven 测试阶段通过 JUnit Platform 执行 Jupiter 测试
  - id: boot-2-3-coordinates
    title: Spring Boot 2.3.12 dependency versions
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/appendix-dependency-versions.html
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Spring Boot 2.3.12 管理 JUnit Jupiter 5.6.3 与 Mockito 3.3.3
  - id: junit-5-6-3-assertions
    title: JUnit 5.6.3 Assertions API
    url: https://junit.org/junit5/docs/5.6.3/api/org.junit.jupiter.api/org/junit/jupiter/api/Assertions.html
    sourceType: api-doc
    appliesTo: JUnit Jupiter 5.6.3
    claims:
      - Java 8 fixture 可使用 JUnit Jupiter 5.6.3 断言
  - id: mockito-3-3-3-api
    title: Mockito 3.3.3 API
    url: https://javadoc.io/static/org.mockito/mockito-core/3.3.3/org/mockito/Mockito.html
    sourceType: api-doc
    appliesTo: Mockito 3.3.3
    claims:
      - Java 8 fixture 可使用 Mockito 3.3.3 的 mock、stub 与 verify
projectEvidence:
  - file: dzzz-app/src/test/java/com/tdh/bdzz/util/KeywordSignatureMergeTest.java
    symbol: com.tdh.bdzz.util.KeywordSignatureMergeTest
    usage: observed
  - file: dzzz-app/src/test/java/com/tdh/bdzz/service/tsaiassistant/TsAiTranscriptDiffServiceTest.java
    symbol: com.tdh.bdzz.service.tsaiassistant.TsAiTranscriptDiffServiceTest
    usage: observed
  - file: dzzz-app/src/test/java/com/tdh/bdzz/service/impl/TsFileSignNewDragServiceImplTest.java
    symbol: com.tdh.bdzz.service.impl.TsFileSignNewDragServiceImplTest
    usage: observed
  - file: dzzz-app/src/test/java/com/tdh/bdzz/service/tscwh/TscwhRuntimePromptServiceTest.java
    symbol: com.tdh.bdzz.service.tscwh.TscwhRuntimePromptServiceTest
    usage: observed
  - file: dzzz-app/src/test/java/com/tdh/bdzz/util/PdfKeywordPositionUtilTest.java
    symbol: com.tdh.bdzz.util.PdfKeywordPositionUtilTest
    usage: observed
---

# JUnit、Mockito 与 Service 单元测试

## 一、为什么需要学习

B-20 已经建立第一条 JUnit 反馈环，但真实后端业务通常位于 Service：它要校验输入、查询仓储、选择业务
分支并保存结果。如果测试直接启动 Spring、MySQL 和 HTTP 服务，一个失败会同时包含配置、网络和数据状态，
很难判断 Service 规则是否正确。

本课把边界缩到一个普通 Java Service。Service、值对象和结果对象使用真实实现；仓储、时钟或外部网关
才由 Mockito 替代。这样既能验证公开业务结果，也能在写入是否发生、参数是否规范化等确属合同的地方检查
协作。Controller、MockMvc 和测试切片由 I-15 单独讲解，本课不提前展开。

## 二、学习目标

完成本课后，你能为普通 Service 设计成功、缺失、冲突和依赖失败四条测试路径；能通过构造器注入 mock，
使用 stub 驱动分支，先断言公开结果，再验证必要协作；还能从严格 stub、参数不匹配和调用次数错误中定位
失败原因，并让每个测试拥有独立 fixture。

## 三、前置术语

- **Service：** 编排业务规则与协作者的普通 Java 对象。
- **被测对象：** 当前测试真正执行的对象，本课固定为真实 Service。
- **协作者：** Service 通过接口调用的仓储、时钟或外部网关。
- **fixture：** 一条测试运行前准备的 Service、mock、输入和返回值安排。
- **mock：** Mockito 创建并记录调用的测试替身。
- **stub：** 规定 mock 收到特定调用时返回值或抛出异常的安排。
- **verify：** 行为执行后检查 mock 是否收到某次必要调用。

## 四、零基础知识点详解
### 1. Service 单元测试验证公开业务行为
- **它是什么：** Service 单元测试直接调用 Service 的公开方法，并观察返回值、异常或必要协作，不检查
Spring Bean 身份、私有字段或私有方法。
- **有什么作用：** 测试与调用者看到的合同对齐，内部重构不改变公开行为时不必重写测试。
- **什么时候使用：** Service 包含输入校验、状态选择、结果映射或仓储编排时使用。
- **怎么使用：**
1. 用一句“条件 + 结果”描述公开行为。
2. 只调用公开方法。
3. 先断言调用者可见的结果。
- **最小示例：**
```java
/** 验证缺失任务返回 NOT_FOUND。 */
@Test
void returnsNotFoundWhenTaskIsMissing() {
    when(repository.findById(9L)).thenReturn(Optional.empty());
    assertEquals(TaskResult.NOT_FOUND, service.find(9L));
}
```
- **运行结果：** 仓储返回空值时，公开结果必须是 `NOT_FOUND`；测试没有读取 Service 内部字段。
- **常见误区：** 通过反射调用私有规范化方法。那会锁定实现结构，却不能证明公开方法返回正确结果。
### 2. 一个单元只保留一个真实 Service
- **它是什么：** 本课的“单元”是一个真实 `TaskService` 及其真实业务值；越过构造器边界的仓储等依赖才
由测试替身提供。
- **有什么作用：** 业务代码真实执行，同时把慢、不可控或尚未实现的外部边界隔离出去。
- **什么时候使用：** Service 依赖 repository、clock 或 gateway，而当前测试只需要证明 Service 规则时使用。
- **怎么使用：**
1. 创建协作者 mock。
2. 用真实构造器创建 Service。
3. 不 mock Service、结果对象或简单值对象。
- **最小示例：**
```java
TaskRepository repository = mock(TaskRepository.class);
TaskService service = new TaskService(repository);
```
- **运行结果：** `service.create(...)` 会执行真实业务逻辑，repository 调用由 Mockito 记录。
- **常见误区：** `mock(TaskService.class)` 后直接 stub 预期结果。这只证明 Mockito 配置正确，没有执行生产逻辑。
### 3. Service 单元测试不启动容器
- **它是什么：** 普通 POJO Service 可以脱离 Spring 应用上下文、数据库、HTTP 服务器和网络运行。
- **有什么作用：** 失败只来自 Service、fixture 或协作合同，反馈快且可重复。
- **什么时候使用：** 不需要证明自动配置、Bean 装配、SQL 方言或 HTTP 映射时使用本课方式。
- **怎么使用：**
1. 测试依赖只加入 JUnit 与 Mockito。
2. 直接 `new TaskService(repository)`。
3. 把容器和协议事实留给对应集成课程。
- **最小示例：**
```java
@ExtendWith(MockitoExtension.class)
class TaskServiceTest {
    @Mock TaskRepository repository;
    TaskService service;
}
```
- **运行结果：** 测试进程不会启动 Spring，也不会打开数据库或 HTTP 端口。
- **常见误区：** 为了获得一个 mock 就使用 `@SpringBootTest`。它把不相关的配置失败带进 Service 反馈环。
### 4. 从业务分支反推测试四要素
- **它是什么：** 每个分支都可以拆成输入、协作者返回或失败、公开结果、必要副作用四项。
- **有什么作用：** 测试准备与断言都能追溯到业务合同，不会因为“看起来应该覆盖”而堆积无关代码。
- **什么时候使用：** 开始编写成功、缺失、冲突或依赖失败测试之前使用。
- **怎么使用：**
1. 写出输入和仓储当前状态。
2. 写出 Service 应返回的结果。
3. 只列真正必须发生或禁止发生的协作。
- **最小示例：**
```text
输入 " Task " + 仓储无同名任务 -> CREATED + 保存标题 "Task"
输入 "Task" + 仓储已有同名任务 -> CONFLICT + 不保存
```
- **运行结果：** 两行分别成为独立测试，失败名称直接指出是哪条业务分支被破坏。
- **常见误区：** 一个 `testEverything` 连续创建、查询和删除，任何断言失败都无法定位最初偏差。
### 5. 值对象保持真实，边界依赖才 mock
- **它是什么：** `Task`、`TaskResult` 等内存对象直接使用真实实现；repository 等跨单元接口才使用 mock。
- **有什么作用：** 测试会执行真实的值相等性和结果映射，而不是把所有行为预先写进 stub。
- **什么时候使用：** 协作者访问持久化、网络、系统时间或其他不可控资源时 mock；纯值计算不需要替身。
- **怎么使用：**
1. 真实创建输入和值对象。
2. 只 mock Service 的直接外部接口。
3. 断言真实结果对象的公开字段。
- **最小示例：**
```java
Task existing = new Task(7L, "Task");
when(repository.findByTitle("Task")).thenReturn(Optional.of(existing));
```
- **运行结果：** `Task` 的真实构造与访问器参与测试，只有查询动作由 mock 控制。
- **常见误区：** 把简单 `Task` 也 mock 掉，随后为每个 getter 建 stub，制造与生产对象无关的脆弱 fixture。
### 6. 通过显式构造器注入 mock
- **它是什么：** 测试把 repository mock 作为构造器参数交给真实 Service。
- **有什么作用：** 依赖一眼可见；生产构造器变化时测试会直接编译失败，而不是静默得到空字段。
- **什么时候使用：** 新代码、依赖数量较少或需要清楚展示 fixture 所有权时优先使用。
- **怎么使用：**
1. 生产类用 `final` 字段保存依赖。
2. 构造器要求非空依赖。
3. `BeforeEach` 中显式创建 Service。
- **最小示例：**
```java
/** 为每个测试创建真实 Service。 */
@BeforeEach
void setUp() {
    service = new TaskService(repository);
}
```
- **运行结果：** 每次测试调用都获得新的 Service，依赖固定为当前测试的 repository mock。
- **常见误区：** 用反射把 mock 写入私有字段。它绕过构造器合同，也会让生产依赖继续保持隐式。
### 7. InjectMocks 是便利注入，不是设计工具
- **它是什么：** `@InjectMocks` 依次尝试构造器、setter 和字段来创建并注入被测对象；它不是依赖注入框架。
- **有什么作用：** 构造器唯一且依赖类型明确时可以减少少量样板代码。
- **什么时候使用：** 简单对象可选择使用；构造器重载、同类型依赖或初学教学中优先显式 `new`。
- **怎么使用：**
1. 先让生产类具有清晰构造器。
2. 依赖标注 `@Mock`。
3. 只有注入结果毫无歧义时标注 `@InjectMocks`。
- **最小示例：**
```java
@Mock TaskRepository repository;
@InjectMocks TaskService service;
```
- **运行结果：** Mockito 优先通过最大构造器创建 `TaskService`；无法注入的复杂依赖不会自动变成合理设计。
- **常见误区：** 依赖仍使用字段注入，却把 `@InjectMocks` 当作修复方案。便利注解不能替代显式生产合同。
### 8. mock、stub 与 verify 分工
- **它是什么：** mock 是由框架创建的测试替身；stub 是“依赖收到某个输入时返回什么”的安排；verify 是
测试执行后检查某次协作是否发生。
- **有什么作用：** 被测 Service 不需要连接真实数据库，测试仍能稳定覆盖“查到”和“未查到”分支，并检查
关键依赖是否被正确调用。
- **什么时候使用：** 当前行为依赖慢、不可控或尚未实现的外部边界时使用，例如 repository、邮件网关或时钟。
普通值对象和被测业务对象应使用真实实现。
- **怎么使用：**
1. mock 被测对象的直接外部依赖。
2. 用 stub 安排当前分支需要的返回值。
3. 调用真实被测对象。
4. 先断言返回结果。
5. 只对业务必要协作使用 verify。
- **最小示例：**
```java
TaskRepository repository = mock(TaskRepository.class);
when(repository.findById(7L)).thenReturn(Optional.of(new Task(7L, "Task")));
TaskService service = new TaskService(repository);
TaskResult actual = service.find(7L);
assertEquals(TaskResult.FOUND, actual);
verify(repository).findById(7L);
```
- **运行结果：** repository 没有连接数据库；Service 返回真实 `FOUND` 结果，查询调用也被记录。
- **常见误区：** 只写 verify，不断言 Service 结果。协作发生不代表业务映射正确。
### 9. when 与 thenReturn 驱动分支
- **它是什么：** `when(mock.method(input)).thenReturn(output)` 建立 stub，描述 mock 对特定调用的返回值。
- **有什么作用：** 测试能主动选择依赖分支，不受数据库数据、网络状态或执行顺序影响。
- **什么时候使用：** 被测对象必须从依赖读取数据，且当前测试关心依赖返回后的业务处理时使用。
- **怎么使用：**
1. 只为当前测试会发生的调用建 stub。
2. 参数使用明确业务值。
3. 返回类型与真实接口一致。
4. 让严格 stub 检查多余安排。
- **最小示例：**
```java
when(repository.findByTitle("Task"))
    .thenReturn(Optional.empty());
assertEquals(TaskResult.CREATED, service.create(" Task "));
```
- **运行结果：** Service 用规范化后的 `Task` 查询仓储并执行真实创建分支。
- **常见误区：** 在公共 setup 为所有分支预置返回值。当前测试没用到的安排会触发严格 stub 失败。
### 10. thenThrow 与 doThrow 驱动依赖失败
- **它是什么：** `thenThrow` 安排有返回值的方法抛错，`doThrow` 常用于 `void` 方法；它们只制造协作者失败。
- **有什么作用：** 可以验证 Service 是否把底层异常转换成 I-13 已冻结的稳定失败结果，而不是泄漏内部消息。
- **什么时候使用：** 仓储读取、保存或外部网关可能失败，而当前测试关心 Service 的错误映射时使用。
- **怎么使用：**
1. 只对目标协作安排失败。
2. 调用真实 Service。
3. 断言公开失败码和安全消息。
- **最小示例：**
```java
when(repository.findById(7L)).thenThrow(new IllegalStateException("jdbc-secret"));
TaskResult result = service.find(7L);
assertEquals(TaskResult.DEPENDENCY_FAILED, result);

when(repository.findByTitle("Task")).thenReturn(Optional.empty());
doThrow(new IllegalStateException("jdbc-secret"))
    .when(repository).save(any(Task.class));
TaskResult saveResult = service.create("Task");
assertEquals(TaskResult.DEPENDENCY_FAILED, saveResult);
```
- **运行结果：** 查询失败和 `void save` 失败都只暴露稳定的 `DEPENDENCY_FAILED`，不会包含
`jdbc-secret`。
- **常见误区：** 断言底层异常消息原样返回。这样会把实现细节和敏感文本固化为公开合同。
### 11. 先断言公开结果，再验证必要协作
- **它是什么：** 结果断言证明调用者得到什么；verify 只补充“某个外部动作必须发生”的合同。
- **有什么作用：** Service 即使错误返回空结果，测试也不会因为 repository 被调用过就误判为成功。
- **什么时候使用：** 一个分支既有返回结果，又要求保存、发布或禁止写入时使用。
- **怎么使用：**
1. 保存 Service 返回值。
2. 断言状态、错误码或业务字段。
3. 最后验证必要外部协作。
- **最小示例：**
```java
TaskResult result = service.create(" Task ");
assertEquals(TaskResult.CREATED, result);
verify(repository).save(any(Task.class));
```
- **运行结果：** 返回结果和写入协作都必须正确，任一偏差都会失败。
- **常见误区：** 逐项 verify 所有内部调用。测试会绑定实现步骤，正常重构也会产生无意义失败。
### 12. verify 默认一次与 times 的边界
- **它是什么：** `verify` 检查 mock 的调用记录；默认要求一次，`times(n)` 指定次数，`never()` 要求零次。
- **有什么作用：** 可证明保存恰好发生一次，也能让“至少一次”与“精确次数”保持清晰区别。
- **什么时候使用：** 调用次数本身属于业务合同才验证，例如“只保存一次”“非法输入不得查询”。纯内部实现
步骤不需要逐项 verify。
- **怎么使用：**
1. 执行被测行为后再 verify。
2. 默认一次时省略 `times(1)`。
3. 只有次数不是一时才显式写 `times(n)`。
4. 同时断言公开结果。
- **最小示例：**
```java
/** 验证创建成功只保存一次。 */
@Test
void savesCreatedTaskOnce() {
    TaskResult result = service.create("Task");
    assertEquals(TaskResult.CREATED, result);
    verify(repository).save(any(Task.class));
}
```
- **运行结果：** 未保存或保存两次都会失败；`verify(repository)` 等价于 `times(1)`。
- **常见误区：** 到处写 `times(1)` 增加噪声，或用 `atLeastOnce()` 掩盖重复写入缺陷。
### 13. never 证明禁止写操作
- **它是什么：** `never()` 要求匹配调用次数为零。
- **有什么作用：** 可以证明非法输入、重复冲突或缺失分支在返回前没有执行保存、删除等副作用。
- **什么时候使用：** “不得调用协作者”本身属于业务合同的分支使用。
- **怎么使用：**
1. 安排触发拒绝分支的输入或仓储状态。
2. 断言公开拒绝结果。
3. 对危险写操作使用 `never()`。
- **最小示例：**
```java
when(repository.findByTitle("Task")).thenReturn(Optional.of(new Task(7L, "Task")));
assertEquals(TaskResult.CONFLICT, service.create("Task"));
verify(repository, never()).save(any(Task.class));
```
- **运行结果：** Service 若在发现重复后仍保存，测试会显示实际调用。
- **常见误区：** 对所有未关心方法都写 `never()`，把测试变成实现清单，而不是业务保护。
### 14. matcher 必须覆盖整次调用
- **它是什么：** `anyLong()`、`eq(value)` 等 matcher 让 Mockito 按规则匹配参数。一次方法调用中，只要一个
参数使用 matcher，其他参数也必须使用 matcher。
- **有什么作用：** 能表达“任意合法 ID”或“精确租户 + 任意页码”，同时避免参数录制不一致。
- **什么时候使用：** 参数不影响当前测试或需要按类别匹配时使用；业务关键值仍优先写明确值。
- **怎么使用：**
1. 精确值直接写 `7L`。
2. 混合匹配时用 `eq("java")` 包装精确值。
3. 不要用 `any()` 掩盖本应验证的业务参数。
4. matcher 只放在 stub 或 verify 调用中。
- **最小示例：**
下面是只说明 matcher 组合规则的伪代码；跟做工程没有定义 `search` 方法：
```java
when(repository.search(eq("task"), anyInt()))
    .thenReturn(List.of(new Task(7L, "Task")));
assertEquals(List.of(new Task(7L, "Task")), service.search(" task ", 1));
```
- **运行结果：** 规范化后的查询词必须精确为 `task`，页码可为任意 int；若 Service 未规范化，stub 不匹配。
- **常见误区：** `when(repository.search("task", anyInt()))` 混用裸值和 matcher。应改为
`when(repository.search(eq("task"), anyInt()))`。
### 15. 精确值优先于宽 matcher
- **它是什么：** 精确值直接表达业务输入；`eq()` 在同一次调用需要其他 matcher 时保留精确约束；`any()`
接受整个类型范围。
- **有什么作用：** 精确参数可以发现 Service 忘记规范化、传错租户或丢失状态等缺陷。
- **什么时候使用：** 业务关键参数优先精确匹配；与当前行为无关的技术参数才使用宽 matcher。
- **怎么使用：**
1. 只有一个参数时直接写业务值。
2. 混合规则时用 `eq(expected)`。
3. 不用 `any()` 逃避不清楚的合同。
- **最小示例：**
下面仍是只说明 matcher 选择的伪代码；跟做工程没有定义 `search` 方法：
```java
when(repository.search(eq("task"), anyInt())).thenReturn(List.of(new Task(7L, "Task")));
```
- **运行结果：** 查询词必须恰好是规范化后的 `task`，页码不属于当前行为所以允许任意 int。
- **常见误区：** 所有参数都写 `any()`，即使 Service 传入空标题或错误状态，stub 仍返回成功数据。
### 16. 在 verify 后使用 ArgumentCaptor
- **它是什么：** `ArgumentCaptor` 在 verify 阶段捕获 mock 实际收到的参数，然后由 JUnit 检查其中字段。
- **有什么作用：** 当参数是新创建的命令对象，无法提前拿到同一个实例时，仍能验证对外协作合同。
- **什么时候使用：** 调用确实发生且需要检查复杂参数多个字段时使用；简单字符串和数字直接 verify 明确值。
- **怎么使用：**
1. 创建目标类型 captor。
2. 在 `verify(mock).method(captor.capture())` 中捕获。
3. 调用 `getValue()` 取得实际参数。
4. 用 JUnit 断言公开字段。
- **最小示例：**
```java
ArgumentCaptor<Task> captor = ArgumentCaptor.forClass(Task.class);
service.create(" Task ");
verify(repository).save(captor.capture());
assertEquals("Task", captor.getValue().title());
```
- **运行结果：** 测试证明 Service 传给 repository 的标题已规范化；它没有读取私有字段或调用私有方法。
- **常见误区：** 用 captor 构造 stub。方法没有发生时就没有值，失败也不能清楚指出预期输入。
### 17. InOrder 只验证业务顺序
- **它是什么：** `InOrder` 按调用发生顺序验证多个 mock；它把顺序也纳入测试合同。
- **有什么作用：** 当“先保留审计事件，再发布任务”等顺序具有外部语义时，可以发现颠倒调用。
- **什么时候使用：** 顺序改变会造成真实业务差异时使用；普通查询和映射不验证顺序。
- **怎么使用：**
1. 先完成被测行为。
2. 用涉及顺序的 mock 创建 `InOrder`。
3. 只列必须保持的调用序列。
- **最小示例：**
下面是只说明顺序合同的伪代码；`publisher` 与 `task` 不属于跟做工程：
```java
InOrder order = inOrder(repository, publisher);
order.verify(repository).save(task);
order.verify(publisher).publish(task.id());
```
- **运行结果：** 发布若先于保存，第二组顺序验证会失败。
- **常见误区：** 为所有协作强制完整顺序。无关调用一调整，业务结果没变却产生大量脆弱失败。
### 18. MockitoExtension 管理 mock 生命周期
- **它是什么：** `MockitoExtension` 是 Jupiter 扩展，负责初始化 `@Mock`、建立 Mockito 会话并在测试结束时
检查严格 stub。
- **有什么作用：** 少写手工初始化和清理代码，并尽早发现未使用 stub 或参数不匹配。
- **什么时候使用：** Jupiter 测试类使用 Mockito 注解时使用；不使用 Mockito 的纯函数测试不需要注册它。
- **怎么使用：**
1. 在测试类添加 `@ExtendWith(MockitoExtension.class)`。
2. 依赖字段添加 `@Mock`。
3. 每个测试只安排自己需要的 stub。
4. 遇到严格失败先删除多余准备或修正参数。
5. 只有确有跨参数共用原因时才局部 `lenient()`。
- **最小示例：**
```java
@ExtendWith(MockitoExtension.class)
class TaskServiceTest {
    @Mock
    private TaskRepository repository;
    private TaskService service;
    /** 为每个测试创建真实 Service。 */
    @BeforeEach
    void setUp() {
        service = new TaskService(repository);
    }
}
```
- **运行结果：** 每个测试自动得到 mock；未使用的 `when(...)` 会在测试结束时报告问题。
- **常见误区：** 同时手工 `openMocks` 又注册扩展，导致重复初始化和难以判断的生命周期。
### 19. STRICT_STUBS 暴露准备错误
- **它是什么：** 严格模式在测试结束时检查未使用 stub，也会帮助定位 stub 参数与实际调用不一致。
- **有什么作用：** 多余 fixture 和拼错参数会直接变红，而不是作为永远不会执行的噪声留在测试里。
- **什么时候使用：** MockitoExtension 的默认单元测试保持严格；只有已确认的共享兼容场景才局部放宽。
- **怎么使用：**
1. 先阅读异常指出的 stub 与实际调用。
2. 删除多余 stub 或修正参数。
3. 只对无法拆开的单个 stub 使用 `lenient()`。
- **最小示例：**
```java
when(repository.findById(7L)).thenReturn(Optional.empty());
assertEquals(TaskResult.NOT_FOUND, service.find(7L));
```
- **运行结果：** 测试只安排真实发生的 `findById(7L)`，严格模式通过且结果为 `NOT_FOUND`。
- **常见误区：** 把整个类改成 LENIENT。红灯消失的同时，参数错误和废弃准备也被隐藏。
### 20. 每个测试拥有独立可变 fixture
- **它是什么：** mock 调用记录、Service 实例和可变输入都限定在单次测试生命周期内。
- **有什么作用：** 单独运行、全量运行和重复运行得到相同结果，不依赖测试顺序。
- **什么时候使用：** 所有测试默认采用；尤其不能共享 static 集合、系统属性或缓存。
- **怎么使用：**
1. 每次测试创建新 Service。
2. 可变集合在测试方法内创建。
3. 修改全局状态时在 finally 中恢复。
- **最小示例：**
```java
/** 为当前测试创建独立输入。 */
@Test
void doesNotShareDrafts() {
    List<Task> drafts = new ArrayList<>();
    assertTrue(drafts.isEmpty());
}
```
- **运行结果：** 目标类连续运行两次时，第二次不会看到第一次添加的数据。
- **常见误区：** 为了减少创建成本使用 static 可变集合。测试顺序变化后会出现间歇失败。
### 21. 公共 setup 只放稳定结构
- **它是什么：** `BeforeEach` 只创建每条测试都需要的 Service 结构，不放只服务某个业务分支的 stub。
- **有什么作用：** 打开任一测试即可看到该分支的完整输入与依赖安排，严格模式也不会遇到公共多余 stub。
- **什么时候使用：** 多个测试共享相同构造器，但仓储返回值不同的测试类。
- **怎么使用：**
1. setup 只执行 `new TaskService(repository)`。
2. 每条测试就地声明自己的 `when`。
3. 重复且真正通用的数据才提取构造方法。
- **最小示例：**
```java
/** 创建不含分支安排的公共结构。 */
@BeforeEach
void setUp() {
    service = new TaskService(repository);
}
```
- **运行结果：** 缺失测试只看到缺失 stub，冲突测试只看到冲突 stub。
- **常见误区：** setup 同时安排成功、缺失和异常返回。每条测试都被迫携带不相关分支数据。
### 22. spy 与 doReturn 的使用边界
- **它是什么：** mock 默认不执行真实实现；spy 包装真实对象，未 stub 的方法会真实执行。对 spy 使用
`when(spy.method())` 时，构造 stub 的表达式可能已经调用真实方法；`doReturn(...).when(spy)` 可避免。
- **有什么作用：** 理解这一点能避免测试准备阶段意外读文件、改状态或抛异常。
- **什么时候使用：** 只有遗留对象无法立即拆分、且确需部分真实行为时才用 spy。新设计优先提取依赖并使用
普通 mock。
- **怎么使用：**
1. 先判断是否可用真实对象或普通 mock。
2. 必须部分替换时创建 spy。
3. 确认真实方法没有副作用；仅为避免构造 stub 时调用真实方法，才使用 `doReturn`。
4. 测试结束仍断言公开结果。
- **最小示例：**
```java
List<String> titles = spy(new ArrayList<>());
doReturn("Task").when(titles).get(0);
assertEquals("Task", titles.get(0));
```
- **运行结果：** 空列表的真实 `get(0)` 本会抛出越界异常；`doReturn` 构造 stub 时不调用它，随后匹配
调用返回 `Task`。该示例没有文件、网络或状态写入等副作用。
- **常见误区：** 大量 spy 内部方法，实际是在锁定实现结构。应优先提取接口并 mock 直接协作者。
### 23. 按失败信息定位层级
- **它是什么：** Mockito 常见失败分别指向调用未发生、次数不符、未使用 stub 或 stub 参数不匹配。
- **有什么作用：** 先分类再修复，可以避免为了让测试变绿而随意放宽 matcher 或删除有效断言。
- **什么时候使用：** 出现 wanted-but-not-invoked、too many invocations、`UnnecessaryStubbingException` 或
`PotentialStubbingProblem` 时使用。
- **怎么使用：**
1. 核对测试是否调用了正确公开方法。
2. 对比 stub 参数与实际调用参数。
3. 删除无关准备或修正生产分支。
4. 重跑同一条失败命令。
- **最小示例：**
```text
wanted but not invoked -> 检查分支是否提前返回
unnecessary stubbing -> 删除当前测试未使用的安排
stubbing argument mismatch -> 对比规范化前后的实参
```
- **运行结果：** 每种失败只修改对应层级，修复后同一测试由红转绿。
- **常见误区：** 一看到严格性失败就改成 lenient，真正的参数拼错仍然存在。
### 24. 四条路径闭合 Service 反馈环
- **它是什么：** 完整反馈环用同一个真实 Service 分别验证创建成功、重复冲突、数据缺失和依赖失败。
- **有什么作用：** 它提供不依赖外部基础设施、可重复且失败原因单一的 Service 反馈，同时覆盖结果映射和
依赖合同。
- **什么时候使用：** Service 同时包含读取、写入和错误转换，而 repository 本身不是本课验证目标时使用。
- **怎么使用：**
1. 每条路径只安排当前分支需要的 stub。
2. 先断言 `CREATED`、`CONFLICT`、`NOT_FOUND` 或稳定失败码。
3. 再验证保存、禁止保存或规范化参数。
4. 目标类与全量测试各运行两次。
- **最小示例：**
```java
/** 验证规范化标题后创建任务。 */
@Test
void createsTaskWithNormalizedTitle() {
    when(repository.findByTitle("Task")).thenReturn(Optional.empty());
    TaskResult result = service.create(" Task ");
    assertEquals(TaskResult.CREATED, result);
    ArgumentCaptor<Task> captor = ArgumentCaptor.forClass(Task.class);
    verify(repository).save(captor.capture());
    assertEquals("Task", captor.getValue().title());
}
```
- **运行结果：** 测试同时证明公开结果为 `CREATED`、保存一次且标题已规范化；没有启动 Spring 或数据库。
- **常见误区：** 用一个测试依次执行四条路径。共享 stub 与调用记录会让失败原因互相污染。
## 五、现代版本中的正确用法

现代主线使用 Java 25、JUnit 6.1.3、Mockito 5.23.0 与 Surefire 3.5.6。独立 fixture 用 JUnit BOM
对齐 JUnit 模块，并显式固定 Mockito 与 Surefire。若正式项目由 Spring Boot BOM 管理测试依赖，应先
接受其一致版本集合；需要覆盖时必须整体对齐并重跑所有测试。

推荐顺序是：直接创建普通 Service；保持业务值真实；只有直接外部协作者使用 mock；每条测试只安排当前
分支；先断言公开结果，再检查保存、禁止保存或调用顺序。需要 Spring 上下文、HTTP 映射或真实 SQL 时，
进入相应后续课程，而不是继续扩大本课单元。

## 六、核心接口与执行流程

```text
mvn test
  -> Surefire 通过 JUnit Platform 发现 TaskServiceTest
  -> MockitoExtension 为当前测试创建 repository mock
  -> BeforeEach 用构造器创建真实 TaskService
  -> 当前测试安排唯一所需的 stub
  -> 调用 Service 并断言 TaskResult
  -> verify 必要协作或 never 禁止写入
  -> 严格模式检查未使用 stub 与参数不匹配
  -> Surefire 写入 XML 报告并返回退出码
```

## 七、从零跟着做
下面建立一个不启动 Spring 的 Maven 工程。repository 只是接口，不包含 SQL、数据库连接或 Spring 注解。
### 1. 第一步：创建 Maven 工程
目录结构：
```text
testing-service/
  pom.xml
  src/main/java/example/testing/Task.java
  src/main/java/example/testing/TaskRepository.java
  src/main/java/example/testing/TaskResult.java
  src/main/java/example/testing/TaskService.java
  src/test/java/example/testing/TaskServiceTest.java
```
`pom.xml`：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>example</groupId>
  <artifactId>testing-service</artifactId>
  <version>1.0.0</version>
  <properties>
    <maven.compiler.release>25</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <junit.version>6.1.3</junit.version>
    <mockito.version>5.23.0</mockito.version>
  </properties>
  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>org.junit</groupId>
        <artifactId>junit-bom</artifactId>
        <version>${junit.version}</version>
        <type>pom</type>
        <scope>import</scope>
      </dependency>
    </dependencies>
  </dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.mockito</groupId>
      <artifactId>mockito-core</artifactId>
      <version>${mockito.version}</version>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.mockito</groupId>
      <artifactId>mockito-junit-jupiter</artifactId>
      <version>${mockito.version}</version>
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
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>3.5.6</version>
      </plugin>
    </plugins>
  </build>
</project>
```
### 2. 第二步：定义真实值与仓储边界
```java
package example.testing;
record Task(long id, String title) {}
```
```java
package example.testing;
enum TaskResult {
    CREATED,
    CONFLICT,
    FOUND,
    NOT_FOUND,
    DEPENDENCY_FAILED
}
```
```java
package example.testing;
import java.util.Optional;
interface TaskRepository {
    /** 按规范化标题查询任务。 */
    Optional<Task> findByTitle(String title);
    /** 按 ID 查询任务。 */
    Optional<Task> findById(long taskId);
    /** 保存新任务。 */
    void save(Task task);
}
```
### 3. 第三步：编写真实 Service
```java
package example.testing;
import java.util.Locale;
final class TaskService {
    private final TaskRepository repository;
    /** 创建具有显式仓储依赖的 Service。 */
    TaskService(TaskRepository repository) {
        this.repository = repository;
    }
    /** 创建任务并返回稳定业务结果。 */
    TaskResult create(String rawTitle) {
        String title = normalizeTitle(rawTitle);
        try {
            if (repository.findByTitle(title).isPresent()) {
                return TaskResult.CONFLICT;
            }
            repository.save(new Task(0L, title));
            return TaskResult.CREATED;
        } catch (RuntimeException failure) {
            return TaskResult.DEPENDENCY_FAILED;
        }
    }
    /** 查询任务并把仓储失败转换成稳定结果。 */
    TaskResult find(long taskId) {
        try {
            return repository.findById(taskId).isPresent()
                ? TaskResult.FOUND
                : TaskResult.NOT_FOUND;
        } catch (RuntimeException failure) {
            return TaskResult.DEPENDENCY_FAILED;
        }
    }
    /** 规范化任务标题。 */
    private String normalizeTitle(String rawTitle) {
        if (rawTitle == null || rawTitle.isBlank()) {
            throw new IllegalArgumentException("title must not be blank");
        }
        String trimmed = rawTitle.trim();
        return trimmed.substring(0, 1).toUpperCase(Locale.ROOT) + trimmed.substring(1);
    }
}
```
`normalizeTitle` 只通过 `create` 的公开结果和保存参数验证，不使用反射。
### 4. 第四步：建立四条 Service 测试路径
```java
package example.testing;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
@ExtendWith(MockitoExtension.class)
class TaskServiceTest {
    @Mock
    private TaskRepository repository;
    private TaskService service;
    /** 为每个测试创建真实 Service。 */
    @BeforeEach
    void setUp() {
        service = new TaskService(repository);
    }
    /** 验证规范化标题后创建任务。 */
    @Test
    void createsTaskWithNormalizedTitle() {
        when(repository.findByTitle("Task")).thenReturn(Optional.empty());
        TaskResult result = service.create(" Task ");
        assertEquals(TaskResult.CREATED, result);
        ArgumentCaptor<Task> captor = ArgumentCaptor.forClass(Task.class);
        verify(repository).save(captor.capture());
        assertEquals("Task", captor.getValue().title());
    }
    /** 验证重复任务返回冲突且不保存。 */
    @Test
    void rejectsDuplicateWithoutSaving() {
        when(repository.findByTitle("Task"))
            .thenReturn(Optional.of(new Task(7L, "Task")));
        assertEquals(TaskResult.CONFLICT, service.create("Task"));
        verify(repository, never()).save(any(Task.class));
    }
    /** 验证缺失任务返回稳定结果。 */
    @Test
    void returnsNotFoundWhenTaskIsMissing() {
        when(repository.findById(9L)).thenReturn(Optional.empty());
        assertEquals(TaskResult.NOT_FOUND, service.find(9L));
    }
    /** 验证仓储异常不会作为公开结果泄漏。 */
    @Test
    void mapsRepositoryFailure() {
        when(repository.findById(7L))
            .thenThrow(new IllegalStateException("jdbc-secret"));
        assertEquals(TaskResult.DEPENDENCY_FAILED, service.find(7L));
    }
}
```
### 5. 第五步：运行严格 stub 负例
先在任一测试中加入未使用安排：
```java
when(repository.findByTitle("unused")).thenReturn(Optional.empty());
```
运行 `mvn -Dtest=TaskServiceTest test`，应看到 `UnnecessaryStubbingException`。删除这一行后，原命令必须
恢复通过。参数不匹配负例可把创建测试的 stub 暂时写成原始标题 `" Task "`；Service 实际使用
`"Task"`，当前安排不会命中并使测试失败。恢复精确规范化参数后再次通过。
### 6. 第六步：核对单类与全量报告
```bash
mvn -Dtest=TaskServiceTest test
mvn test
mvn test
```
三次都应显示 `Tests run: 4, Failures: 0, Errors: 0`，并生成
`target/surefire-reports/TEST-example.testing.TaskServiceTest.xml`。重复运行次数一致，说明测试没有依赖
共享静态状态。
## 八、如何使用

1. 从一个 Service 公开分支写出输入、协作者状态、结果和必要副作用。
2. 真实创建 Service、值对象和结果对象。
3. 只 mock 直接外部协作者，并把 mock 通过构造器注入。
4. 当前测试就地安排 `when` 或 `thenThrow`。
5. 先断言公开结果，再 verify 保存、禁止保存或确属合同的顺序。
6. 遇到严格性失败先修正准备或实参，不全局放宽。
7. 单类反馈完成后运行全量测试并核对报告中的真实测试数。

## 九、适用与不适用场景

适合：

- Service 输入校验、状态分支、结果映射与 repository 协作。
- 仓储缺失、重复冲突和依赖异常的稳定结果合同。
- 保存次数、禁止写入、复杂保存参数和必要协作顺序。
- 不依赖容器的普通 Java 业务对象。

不适合仅靠本课证明：

- Spring 自动配置、Bean 装配与事务代理。
- SQL 方言、真实提交回滚和数据库约束。
- Controller、HTTP 状态、序列化、Filter 与 Servlet 生命周期。
- 真实网络、跨进程契约、浏览器流程与生产性能。

Controller/MockMvc/test slice 属于 I-15；Spring 上下文、WireMock 与真实外部集成属于高级测试课程。

## 十、当前项目补充

冻结审计产物记录了回归断言、JUnit 4、Mockito 和脆弱 fixture 等项目背景。这些证据只说明课程选题
相关，不证明每个记录文件当前有缺陷，也不允许从冻结路径推断未记录的源码细节。

迁移应保持可逆：先把共享 fixture 拆到每个测试，再把手工 mock 改为构造器边界，最后按测试类迁移框架
版本。不要在同一批同时升级依赖、重写业务实现并更换所有断言。

## 十一、Java 8 / Spring Boot 2.3 兼容写法

Spring Boot 2.3.12.RELEASE 管理 JUnit Jupiter 5.6.3 与 Mockito 3.3.3。Java 8 没有 record 和
`String.isBlank`，因此值对象使用 final class，空白检查使用 `trim().isEmpty()`；Service 行为合同保持不变。

```java
public final class Task {
    private final long id;
    private final String title;

    /** 创建 Java 8 可用的任务值。 */
    public Task(long id, String title) {
        this.id = id;
        this.title = title;
    }

    /** 返回任务 ID。 */
    public long getId() {
        return id;
    }

    /** 返回任务标题。 */
    public String getTitle() {
        return title;
    }
}
```

旧线测试仍使用真实 Service、repository mock、`when`、`verify`、`never` 与 `ArgumentCaptor`。不要复制
JUnit 6 的 `assertThrowsExactly` 或只在较新 Mockito 中存在的 API。验证必须在真实 Java 8 runtime 运行；
仅用 Java 25 编译 `--release 8` 不能替代旧运行时证据。

## 十二、新旧版本差异

| 对比项 | 现代主线 | Java 8 / Boot 2.3 项目线 | 保持不变的合同 |
| --- | --- | --- | --- |
| 测试运行时 | Java 25 + JUnit 6.1.3 | Java 8 + Jupiter 5.6.3 | 都执行真实 Service |
| Mockito | 5.23.0 | 3.3.3 | mock、stub、verify、never 与 captor |
| 值对象 | record | final class + getter | 标题和 ID 的业务含义 |
| 空白判断 | `String.isBlank()` | `trim().isEmpty()` | 空白标题被拒绝 |
| 严格性 | MockitoExtension 默认严格诊断 | 使用 3.3.3 支持的扩展和 API | 不保留无关 stub |
| 外部环境 | 不启动 Spring | 不启动 Boot 2.3 容器 | 单元边界不证明装配和 SQL |

## 十三、易错点
:::pitfalls

### 错误：公共 setup 产生未使用 stub

**现象：** 测试结束时报 `UnnecessaryStubbingException`。

**触发条件：** `BeforeEach` 预置了当前分支没有调用的 repository stub。

**原因：** fixture 同时承担多个业务分支，严格模式发现安排未被使用。

**后果：** 失败噪声增多，测试读者也无法判断当前分支真正需要什么。

**错误示例：**

```java
when(repository.findById(99L)).thenReturn(Optional.empty());
```

**正确写法：**

```java
service = new TaskService(repository);
```

**影响版本：** Mockito 5.23.0 严格模式；其他严格配置版本同理。

**验证方式：** 先运行负例看到指定异常，删除多余 stub 后复跑同一命令。

**来源：** `mockito-strictness`、`mockito-unused-stub`。

### 错误：stub 参数与规范化实参不一致

**现象：** 报 `PotentialStubbingProblem`，或调用得到 mock 默认值而进入错误分支。

**触发条件：** stub 使用原始 `" Task "`，Service 实际调用 repository 时使用 `"Task"`。

**原因：** 测试安排和真实协作合同描述了不同参数。

**后果：** 正确实现被误判失败，或宽 matcher 掩盖 Service 忘记规范化的缺陷。

**错误示例：**

```java
when(repository.findByTitle(" Task ")).thenReturn(Optional.empty());
```

**正确写法：**

```java
when(repository.findByTitle("Task")).thenReturn(Optional.empty());
```

**影响版本：** Mockito 5.23.0 严格模式。

**验证方式：** 运行不匹配负例，再改为 `"Task"` 后复跑。

**来源：** `mockito-stub-mismatch`。

### 错误：同一次调用混用裸值和 matcher

**现象：** Mockito 报 matcher misuse，失败位置常出现在准备阶段。

**触发条件：** 同一次调用中同时传入 `eq("task")` 和裸值 `10`，或在 stub/verify 外调用 matcher。

**原因：** matcher 通过内部记录栈工作，一次调用的全部参数必须采用一致记录方式。

**后果：** 测试不能进入业务行为，错误也容易被误认为生产代码问题。

**错误示例：**

```java
List<String> values = mock(List.class);
when(values.set(eq(0), "task")).thenReturn("old");
```

**正确写法：**

```java
List<String> values = mock(List.class);
when(values.set(eq(0), eq("task"))).thenReturn("old");
```

**影响版本：** Mockito 3.3.3 与 5.23.0。

**验证方式：** 最小负例触发，再统一参数风格并复跑。

**来源：** `mockito-matchers`、`mockito-3-3-3-api`。

### 错误：用 captor 构造 stub

**现象：** 被测调用没有发生时 captor 无值，失败信息也不能清楚表达预期输入。

**触发条件：** 在 `when` 中调用 `captor.capture()`，随后依赖该捕获值完成安排。

**原因：** captor 的主要职责是在 verify 后检查已经发生的复杂参数。

**后果：** 测试准备与观察混在一起，缺失调用时定位困难。

**错误示例：**

```java
doNothing().when(repository).save(captor.capture());
captor.getValue();
```

**正确写法：**

```java
verify(repository).save(captor.capture());
assertEquals("Task", captor.getValue().title());
```

**影响版本：** Mockito 3.3.3 与 5.23.0。

**验证方式：** 让保存不发生观察空捕获，再改为 verify 后捕获。

**来源：** `mockito-captor`。

### 错误：共享静态 fixture 导致顺序依赖

**现象：** 测试单独运行通过，全量或第二次运行失败。

**触发条件：** static 集合、系统属性、缓存或 mock 调用记录跨测试保留。

**原因：** fixture 所有权越过单个测试生命周期。

**后果：** 测试结果依赖顺序，并行执行时出现间歇失败。

**错误示例：**

```java
static final List<Task> DRAFTS = new ArrayList<>();
```

**正确写法：**

```java
List<Task> drafts = new ArrayList<>();
```

**影响版本：** JUnit 5.6.3/6.1.3 与 Mockito 3.3.3/5.23.0。

**验证方式：** 目标类连续运行两次，测试数一致且仓库无输出文件。

**来源：** `mockito-extension`、`spring-unit-testing`。

:::
## 十四、性能注意

Service 单元测试应保持快速，但不要为了少创建几个对象而共享可变 fixture。真正拖慢反馈的常见原因是
启动完整容器、访问真实网络和数据库，或把多个业务行为塞进一个大型测试。先缩小测试边界，再考虑并行；
没有验证隔离前不要打开并行模式。

Mockito 调用次数不是生产性能证据。verify 只能证明协作合同；吞吐、延迟和资源占用仍需专门的 JMH、JFR
或集成环境测量。

## 十五、如何验证

1. Java 25 fixture 固定 JUnit 6.1.3、Mockito 5.23.0 与 Surefire 3.5.6。
2. 创建成功、重复冲突、数据缺失和依赖失败四条测试都执行。
3. 公开结果断言与必要 verify 同时存在，禁止写入使用 never。
4. 未使用 stub 和参数不匹配负例先失败，最小修正后同一命令通过。
5. `-Dtest=TaskServiceTest` 与全量测试都执行四条路径并生成 XML。
6. 全量测试连续运行两次，测试数量一致且没有共享状态。
7. legacy fixture 在真实 Java 8 runtime 运行 Jupiter 5.6.3 与 Mockito 3.3.3。
8. 所有临时工程、报告和浏览器资产清理后确认不存在。

:::exercise
### 练习：为任务发布 Service 建立反馈环

**要求：** 实现 `publish(taskId)`：把非法 ID、任务缺失和发布成功分成三个测试；非法 ID 断言精确异常并
用 `never()` 证明没有查询和写入；缺失分支安排 `Optional.empty()` 并断言 `NOT_FOUND`；成功分支先断言
`PUBLISHED`，再 verify 一次 `markPublished`。保持被测 Service 真实，不反射私有字段，也不启动 Spring。

**验收：** 三个测试分别通过；把成功分支的写入删除后只有成功测试失败；恢复后单类与全量测试各连续
运行两次且测试数一致。

**参考答案：** 在 `BeforeEach` 只构造真实 Service；非法 ID 用精确异常断言和 `never()`；缺失分支只
stub `findById(taskId)` 返回 empty；成功分支返回真实 Task，断言 `PUBLISHED` 后 verify 一次
`markPublished(taskId)`。
:::

## 十六、本节小结

Service 单元测试的核心不是“使用了多少 Mockito API”，而是边界是否清楚：真实 Service 执行业务规则，
mock 只替代直接协作者，stub 只安排当前分支，JUnit 先证明公开结果，verify 再补充必要协作。保持构造器
依赖显式、fixture 独立和严格诊断开启，才能得到快速、稳定且能解释失败原因的反馈环。
