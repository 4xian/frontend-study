---
id: backend.java.learn.intermediate.testing-with-junit-and-mocks
type: lesson
title: 单元测试
summary: 不启动 Spring 或数据库，用真实 Service、Mockito 协作者和精确结果断言验证业务分支与失败合同
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 150
prerequisites:
  - backend.java.learn.intermediate.task-query-cache-project
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
  - 被测对象是普通 Service 的公开行为，不是 Spring Bean 身份、Controller 映射或私有方法。
  - 保持被测 Service 与业务值真实，只替换仓储、时钟和外部网关等直接协作者。
  - stub 安排依赖返回或失败，结果断言证明业务合同，verify 只补充必要协作。
  - 精确值优先于宽 matcher；复杂新对象在 verify 后用 captor 检查。
  - 默认一次调用无需写 times(1)，禁止写操作时用 never，顺序是合同才用 InOrder。
  - 严格 stub 暴露未使用安排和参数不匹配，不应靠全局 lenient 隐藏红灯。
  - 每个测试拥有自己的可变输入与 Service，公共 setup 不预置只服务某个分支的 stub。
  - 先按失败类型定位发现、断言、协作或严格性层级，再修改最小原因并复跑同一命令。
related: []
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
verifiedAt: 2026-08-26
sources:
  - id: junit-6-1-3-release
    title: JUnit 6.1.3 release
    url: https://github.com/junit-team/junit-framework/releases/tag/r6.1.3
    sourceOrigin: official
    sourceType: release-note
    appliesTo: JUnit 6.1.3
    claims:
      - 现代主线使用 JUnit 6.1.3
  - id: junit-6-1-3-release-notes
    title: JUnit 6.1.3 Release Notes
    url: https://docs.junit.org/6.1.3/release-notes.html
    sourceOrigin: official
    sourceType: release-note
    appliesTo: JUnit 6.1.3
    claims:
      - JUnit 6 运行时要求 Java 17 或以上
      - 记录 JUnit 6.1.3 的发布变更
  - id: junit-6-assertions
    title: JUnit Assertions API
    url: https://docs.junit.org/6.1.3/api/org.junit.jupiter.api/org/junit/jupiter/api/Assertions.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: JUnit Jupiter 6.1.3
    claims:
      - assertThrows 接受子类型并返回实际异常
      - assertThrowsExactly 只接受精确异常类型
  - id: junit-6-test-instance-lifecycle
    title: JUnit Test Instance Lifecycle
    url: https://docs.junit.org/6.1.3/writing-tests/test-instance-lifecycle.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: JUnit Jupiter 6.1.3
    claims:
      - PER_METHOD 是默认测试实例生命周期
      - PER_CLASS 允许非 static 的 MethodSource factory
  - id: junit-6-disabled-tests
    title: JUnit Disabling Tests
    url: https://docs.junit.org/6.1.3/writing-tests/disabling-tests.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: JUnit Jupiter 6.1.3
    claims:
      - '@Disabled 或条件禁用会跳过测试方法及方法级生命周期回调'
      - 禁用测试类仍可能被实例化，不能把跳过当作修复证明
  - id: junit-6-repeated-tests
    title: JUnit Repeated Tests
    url: https://docs.junit.org/6.1.3/writing-tests/repeated-tests.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: JUnit Jupiter 6.1.3
    claims:
      - 每次 `@RepeatedTest` 调用都拥有普通测试的生命周期和扩展支持
  - id: junit-6-parameterized-tests
    title: JUnit Parameterized Classes and Tests
    url: https://docs.junit.org/6.1.3/writing-tests/parameterized-classes-and-tests.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: JUnit Jupiter 6.1.3
    claims:
      - ValueSource、CsvSource 与 MethodSource 提供不同复杂度的参数源
      - 每个参数化测试参数都会形成独立调用
  - id: spring-unit-testing
    title: Spring Framework Unit Testing
    url: https://docs.spring.io/spring-framework/reference/testing/unit.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework current
    claims:
      - POJO 可以在没有 Spring 容器的情况下进行单元测试
      - 依赖注入便于用 stub 或 mock 隔离持久化协作者
  - id: mockito-5-23-release
    title: Mockito 5.23.0 release
    url: https://github.com/mockito/mockito/releases/tag/v5.23.0
    sourceOrigin: official
    sourceType: release-note
    appliesTo: Mockito 5.23.0
    claims:
      - 现代主线使用 Mockito 5.23.0
  - id: mockito-api
    title: Mockito API
    url: https://javadoc.io/static/org.mockito/mockito-core/5.23.0/org.mockito/org/mockito/Mockito.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Mockito 5.23.0
    claims:
      - Mockito 提供 mock、stub、verify、次数验证与 never
      - spy 默认调用真实方法，doReturn 可避免安排时执行真实方法
  - id: mockito-extension
    title: MockitoExtension API
    url: https://javadoc.io/static/org.mockito/mockito-junit-jupiter/5.23.0/org.mockito.junit.jupiter/org/mockito/junit/jupiter/MockitoExtension.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Mockito 5.23.0
    claims:
      - MockitoExtension 初始化 mock；测试严格性可用 MockitoSettings 配置
      - 扩展也支持测试方法参数
  - id: mockito-inject-mocks
    title: InjectMocks API
    url: https://javadoc.io/static/org.mockito/mockito-core/5.23.0/org.mockito/org/mockito/InjectMocks.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Mockito 5.23.0
    claims:
      - 注入依次尝试构造器、setter 与字段
      - InjectMocks 不是依赖注入框架
  - id: mockito-captor
    title: ArgumentCaptor API
    url: https://javadoc.io/static/org.mockito/mockito-core/5.23.0/org.mockito/org/mockito/ArgumentCaptor.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Mockito 5.23.0
    claims:
      - ArgumentCaptor 推荐用于 verify 后检查参数
      - 不推荐用 captor 构造 stub
  - id: mockito-answer
    title: Mockito Answer API
    url: https://javadoc.io/static/org.mockito/mockito-core/5.23.0/org.mockito/org/mockito/stubbing/Answer.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Mockito 5.23.0
    claims:
      - Answer 用于在 mock 交互时编程决定返回值，属于超出本课固定返回和异常安排的高级能力
  - id: mockito-matchers
    title: ArgumentMatchers API
    url: https://javadoc.io/static/org.mockito/mockito-core/5.23.0/org.mockito/org/mockito/ArgumentMatchers.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Mockito 5.23.0
    claims:
      - 一次 mock 调用使用 matcher 时所有参数都必须使用 matcher
      - matcher 不能脱离 stub 或 verify 调用使用
  - id: mockito-strictness
    title: Strictness API
    url: https://javadoc.io/static/org.mockito/mockito-core/5.23.0/org.mockito/org/mockito/quality/Strictness.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Mockito 5.23.0
    claims:
      - 显式 STRICT_STUBS 用于发现未使用 stub 和参数不匹配
      - LENIENT 只应用于明确例外
  - id: mockito-unused-stub
    title: UnnecessaryStubbingException API
    url: https://javadoc.io/static/org.mockito/mockito-core/5.23.0/org.mockito/org/mockito/exceptions/misusing/UnnecessaryStubbingException.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Mockito 5.23.0
    claims:
      - 未使用 stub 应删除或只对真实例外局部放宽
  - id: mockito-stub-mismatch
    title: PotentialStubbingProblem API
    url: https://javadoc.io/static/org.mockito/mockito-core/5.23.0/org.mockito/org/mockito/exceptions/misusing/PotentialStubbingProblem.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Mockito 5.23.0
    claims:
      - stub 参数与实际调用不一致通常表示测试或实现错误
  - id: surefire-3-5-6-release
    title: Surefire 3.5.6 release
    url: https://github.com/apache/maven-surefire/releases/tag/surefire-3.5.6
    sourceOrigin: official
    sourceType: release-note
    appliesTo: Maven Surefire 3.5.6
    claims:
      - 现代 fixture 使用稳定 GA 版本 3.5.6
  - id: surefire-junit-platform
    title: Surefire JUnit Platform
    url: https://maven.apache.org/surefire/maven-surefire-plugin/examples/junit-platform.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Maven Surefire 3.5.6
    claims:
      - Maven 测试阶段通过 JUnit Platform 执行 Jupiter 测试
  - id: boot-2-3-coordinates
    title: Spring Boot 2.3.12 dependency versions
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/appendix-dependency-versions.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Spring Boot 2.3.12 管理 JUnit Jupiter 5.6.3 与 Mockito 3.3.3
  - id: junit-5-6-3-assertions
    title: JUnit 5.6.3 Assertions API
    url: https://junit.org/junit5/docs/5.6.3/api/org.junit.jupiter.api/org/junit/jupiter/api/Assertions.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: JUnit Jupiter 5.6.3
    claims:
      - Java 8 fixture 可使用 JUnit Jupiter 5.6.3 断言
  - id: mockito-3-3-3-api
    title: Mockito 3.3.3 API
    url: https://javadoc.io/static/org.mockito/mockito-core/3.3.3/org/mockito/Mockito.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Mockito 3.3.3
    claims:
      - Java 8 fixture 可使用 Mockito 3.3.3 的 mock、stub 与 verify
---

# 单元测试

业务代码最容易出错的地方，往往不是 Controller 能不能接到请求，而是 Service 面对不同数据状态时是否
选择了正确分支：空白标题应当被拒绝，重复任务不能再次保存，仓储异常不能泄漏成公开结果。若每次验证
这些规则都启动 Spring、MySQL 和 HTTP 服务，一个失败会同时混入装配、网络和数据状态，反馈既慢又难定位。

本课把反馈范围缩到一个普通 `TaskService`。Service、输入和值对象都使用真实实现，只有越过单元边界的
仓储由 Mockito 替代。测试直接调用公开方法，先断言调用者能够看到的结果，再检查确实属于业务合同的
保存、禁止保存或参数转换。MockMvc、Spring 测试切片和完整应用装配由后续课程处理。

## 一、划清 Service 单元测试边界

### 1. 一个测试只证明一条公开行为

测试名称应先说明条件，再说明可观察结果。仓储没有对应任务时，`find` 返回 `NOT_FOUND`；标题重复时，
`create` 返回 `CONFLICT` 且不能保存。这样的测试即使 Service 内部以后拆出私有辅助方法，也不需要跟着
修改，因为调用者看到的合同没有变化。

```java
/** 验证任务不存在时返回稳定结果。 */
@Test
void returnsNotFoundWhenTaskIsMissing() {
    when(repository.findById(9L)).thenReturn(Optional.empty());

    TaskResult result = service.find(9L);

    assertEquals(TaskResult.NOT_FOUND, result);
}
```

不要通过反射调用私有规范化方法，也不要读取 Service 私有字段。那只能证明当前实现结构，没有证明公开
入口在真实控制流中会得到同样结果。

### 2. 真实对象与测试替身各有边界

本课的被测单元是一个真实 `TaskService`。`Task`、`TaskResult` 和普通集合也保持真实，因为它们本身就是
业务计算的一部分。`TaskRepository` 代表持久化边界，真实实现会引入数据库状态，所以用 mock 控制它的
返回值并记录调用。

```java
TaskRepository repository = mock(TaskRepository.class);
TaskService service = new TaskService(repository);
```

如果把 `TaskService` 本身也 mock 掉，再直接安排它返回 `CREATED`，测试只会证明 Mockito 按安排返回了值，
生产业务逻辑根本没有执行。简单值对象也不需要 mock，否则每个访问器都要重复写 stub，测试反而偏离真实
对象合同。

### 3. 单元测试不证明容器和协议事实

直接 `new TaskService(repository)` 不会启动 Spring，不会打开数据库连接，也不会监听 HTTP 端口。这正是
Service 单元测试反馈快、失败原因集中的来源，但也决定了它不能证明下面这些事实：

- Spring 是否能扫描并装配 Bean。
- 事务代理是否提交或回滚。
- SQL、数据库约束和真实存储引擎是否正确。
- Controller 映射、JSON 序列化和 HTTP 状态码是否符合合同。

这些问题需要 MockMvc、测试切片或集成测试。本课不能因为“测试通过”就把它们一并宣称为已验证。

## 二、建立独立且可读的 fixture

### 1. 用构造器明确交出协作者

生产类通过构造器接收 repository，测试才能在不使用反射的情况下替换外部边界。依赖字段保持 `final`，
也能让“这个 Service 没有仓储就不能工作”成为编译期可见的合同。

```java
final class TaskService {
    private final TaskRepository repository;

    /** 创建具有显式仓储依赖的任务服务。 */
    TaskService(TaskRepository repository) {
        this.repository = repository;
    }
}
```

`@InjectMocks` 可以在构造器唯一、依赖类型明确时减少少量样板代码，但它会依次尝试构造器、setter 和字段，
不是依赖设计工具。初学和排错时显式 `new TaskService(repository)` 更容易看清 fixture；生产类依赖不清晰时，
不能靠 `@InjectMocks` 掩盖问题。

### 2. 让 MockitoExtension 管理 mock 生命周期

JUnit Jupiter 使用扩展机制初始化 `@Mock`。本课同时显式声明 `STRICT_STUBS`，让未使用的安排和参数不匹配
尽早变成失败，而不是留在测试中成为无效准备。

```java
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.STRICT_STUBS)
class TaskServiceTest {
    @Mock
    private TaskRepository repository;

    private TaskService service;

    /** 为每次测试调用创建真实 Service。 */
    @BeforeEach
    void setUp() {
        service = new TaskService(repository);
    }
}
```

不要同时注册扩展又手工调用 `openMocks`。两套初始化路径会让 mock 所有权和清理时机变得模糊。

### 3. 公共 setup 只创建稳定结构

JUnit Jupiter 默认使用 `PER_METHOD` 生命周期，每个普通测试和每次参数化调用都有独立测试类实例。
`@BeforeEach` 适合创建每条测试都需要的 Service，不适合预置某个分支才会使用的 repository 返回值。

```java
/** 创建不包含业务分支安排的公共结构。 */
@BeforeEach
void setUp() {
    service = new TaskService(repository);
}
```

成功、冲突、缺失和异常分支需要不同 stub，应在各自测试中就地声明。只有测试确实修改了系统属性、文件或
其他外部状态时才添加 `@AfterEach` 清理；没有资源需要恢复时，不写空的生命周期方法。

禁用和重复执行也会改变反馈的含义。`@Disabled` 或条件禁用会跳过测试方法及其方法级生命周期回调；测试
类仍可能被实例化，所以“被跳过”不等于“行为已经修复”。`@RepeatedTest` 的每次调用仍会获得普通测试的
生命周期和扩展支持，适合确认疑似 flaky 的反馈，但不应拿它替代一次清晰的行为测试。默认 `PER_METHOD`
下每个测试实例独立；切换到 `PER_CLASS` 会让实例字段跨方法共享，必须重新检查 `BeforeEach`、`AfterEach`
和可变 fixture 的清理责任。

## 三、用 stub 驱动真实业务分支

### 1. thenReturn 选择仓储状态

`when(...).thenReturn(...)` 不是在描述 Service 应返回什么，而是在准备 Service 调用仓储时会看到的状态。
Service 仍然执行真实的标题规范化、重复判断和结果映射。

```java
when(repository.findByTitle("Task")).thenReturn(Optional.empty());

TaskResult result = service.create(" Task ");

assertEquals(TaskResult.CREATED, result);
```

stub 参数写的是 Service 真正交给协作者的值。这里原始输入是带空格的 `" Task "`，但仓储收到的是规范化
后的 `"Task"`。如果把 stub 写成原始输入，严格模式会暴露测试安排与真实调用不一致。

### 2. thenThrow 与 doThrow 制造依赖失败

有返回值的方法通常使用 `thenThrow`，`void` 方法使用 `doThrow`。异常只用于制造当前协作者失败，测试仍
调用真实 Service，观察它是否把内部异常转换为稳定业务结果。

```java
when(repository.findById(7L))
    .thenThrow(new IllegalStateException("jdbc-secret"));

assertEquals(TaskResult.DEPENDENCY_FAILED, service.find(7L));
```

```java
when(repository.findByTitle("Task")).thenReturn(Optional.empty());
doThrow(new IllegalStateException("jdbc-secret"))
    .when(repository)
    .save(any(Task.class));

assertEquals(TaskResult.DEPENDENCY_FAILED, service.create("Task"));
```

公开断言不应依赖 `jdbc-secret` 之类的底层消息。否则更换数据库驱动或异常实现就会改变业务合同，还可能把
内部信息带到调用者可见结果中。

### 3. 每条测试只安排自己会用到的调用

把所有 stub 放进 `@BeforeEach` 看起来减少了重复，实际会让每个测试携带无关状态。严格模式下，无关安排
会触发 `UnnecessaryStubbingException`；即使关闭严格模式，读者也很难判断当前分支真正依赖什么。

```java
/** 验证重复任务不再保存。 */
@Test
void rejectsDuplicateWithoutSaving() {
    when(repository.findByTitle("Task"))
        .thenReturn(Optional.of(new Task(7L, "Task")));

    TaskResult result = service.create("Task");

    assertEquals(TaskResult.CONFLICT, result);
    verify(repository, never()).save(any(Task.class));
}
```

打开这个测试即可看到输入、仓储状态、公开结果和禁止发生的副作用，不需要跳到公共 setup 猜测隐藏条件。

## 四、先断言结果，再检查必要协作

### 1. 结果断言保护调用者合同

返回枚举、异常和结果对象是调用者直接观察到的事实，应优先断言。一个结果对象包含多个相关字段时，
`assertAll` 可以在一次执行中报告多项偏差，但不要用它拼接互不相关的业务场景。

```java
Task created = new Task(7L, "Task");

assertAll(
    () -> assertEquals(7L, created.id()),
    () -> assertEquals("Task", created.title())
);
```

异常合同也要区分范围。`assertThrows` 接受指定异常及其子类型，并返回实际异常；
`assertThrowsExactly` 只接受精确类型。只有子类也代表合同变化时，才需要精确断言。

```java
IllegalArgumentException failure = assertThrows(
    IllegalArgumentException.class,
    () -> service.create("   ")
);

assertEquals("title must not be blank", failure.getMessage());
```

### 2. verify 只补充真正的协作合同

`verify(repository).save(...)` 默认要求调用恰好一次，通常无需写 `times(1)`。`never()` 适合保护“非法输入
或重复任务不得写入”这类明确边界；`times(n)` 只在次数本身确实具有业务含义时使用。

```java
verify(repository).save(any(Task.class));
verify(repository, times(2)).findById(7L);
```

上面的 `times(2)` 只在业务合同确实要求同一个 ID 被查询两次时使用；如果当前分支只要求保存一次，普通
`verify(repository).save(...)` 就足够。不要把所有内部调用都写成 verify 清单。只要公开结果正确，且关键
外部副作用满足合同，内部查询顺序和辅助方法拆分通常应允许重构。

### 3. 精确参数、matcher 与 captor 表达不同意图

业务关键参数优先写精确值，因为它能发现标题未规范化、租户传错或状态丢失。一次 mock 调用中，只要一个
参数使用 matcher，其他参数也必须使用 matcher；需要保留精确约束时使用 `eq(expected)`。

```java
List<String> values = mock(List.class);
when(values.set(eq(0), eq("task"))).thenReturn("old");
```

这里只展示“全部参数都使用 matcher”的规则。`ArgumentCaptor` 适合检查 Service 新建并传出的复杂对象，
它在行为完成后的 verify 阶段捕获实际参数，不用来构造 stub。

```java
ArgumentCaptor<Task> captor = ArgumentCaptor.forClass(Task.class);

service.create(" Task ");

verify(repository).save(captor.capture());
assertEquals("Task", captor.getValue().title());
```

### 4. InOrder 只保护有业务含义的顺序

如果保存审计记录必须发生在发布消息之前，顺序就是合同，可以用 `InOrder` 表达。普通查询和结果转换通常
没有这种外部语义，不应为了“更严格”而固定全部调用顺序。

```java
InOrder order = inOrder(repository, publisher);
order.verify(repository).save(task);
order.verify(publisher).publish(task.id());
```

这段代码只展示顺序验证，`publisher` 不属于后面的完整工程。顺序改变不会影响业务结果时，不添加
`InOrder`，否则测试会因无关重构频繁失败。

## 五、用参数化测试整理重复规则

### 1. ValueSource 处理单个字面量参数

同一规则只变化一个字符串、数字或枚举名称时，`@ValueSource` 可以减少重复测试方法。每个参数仍是独立
测试调用，都会重新执行 `@BeforeEach`。

```java
/** 验证多种空白标题都被拒绝。 */
@ParameterizedTest
@ValueSource(strings = { "", " ", "   " })
void rejectsBlankTitles(String rawTitle) {
    assertThrows(IllegalArgumentException.class, () -> service.create(rawTitle));
}
```

### 2. CsvSource 表达简单输入与预期值

输入和预期值都是简单字面量时，`@CsvSource` 能让每一行成为一组参数。复杂文本、集合或对象不应先编码成
难读的分隔字符串，再由测试自行解析。

```java
/** 验证标题规范化后使用正确仓储参数。 */
@ParameterizedTest
@CsvSource({ "task,Task", "report,Report", "release,Release" })
void normalizesTitles(String rawTitle, String expectedTitle) {
    when(repository.findByTitle(expectedTitle)).thenReturn(Optional.empty());

    assertEquals(TaskResult.CREATED, service.create(rawTitle));

    verify(repository).findByTitle(expectedTitle);
}
```

### 3. MethodSource 提供复杂组合

参数需要对象或程序化构造时使用 `@MethodSource`。默认 `PER_METHOD` 生命周期下，同类 factory 必须是
`static`；测试类显式使用 `PER_CLASS` 时才允许实例 factory。不要为了省掉 `static` 就切换生命周期并共享
可变状态。

```java
/** 提供标题规范化样例。 */
static Stream<Arguments> titleCases() {
    return Stream.of(
        Arguments.of(" task ", "Task"),
        Arguments.of(" report ", "Report")
    );
}

/** 验证复杂标题样例。 */
@ParameterizedTest
@MethodSource("titleCases")
void normalizesComplexTitles(String rawTitle, String expectedTitle) {
    when(repository.findByTitle(expectedTitle)).thenReturn(Optional.empty());

    service.create(rawTitle);

    verify(repository).findByTitle(expectedTitle);
}
```

## 六、理解严格模式给出的失败

### 1. 未使用 stub 说明准备超出当前分支

在任一测试中加入下面这行，但不调用对应方法：

```java
when(repository.findByTitle("unused")).thenReturn(Optional.empty());
```

运行 `mvn -Dtest=TaskServiceTest test`，测试结束时应看到 `UnnecessaryStubbingException`。正确修复是删除
无关安排，或把它移动到真正需要的测试中，而不是把整个类改成 `LENIENT`。

### 2. 参数不匹配要回到真实调用链

创建任务前，Service 会把 `" Task "` 规范化为 `"Task"`。如果 stub 仍写原始值：

```java
when(repository.findByTitle(" Task ")).thenReturn(Optional.empty());
```

真实调用不会命中这条安排，严格模式可能报告参数不匹配；即使版本或调用形状没有立即给出该异常，mock
默认返回值也会使 Service 进入错误分支。应对比真实协作参数并修正为 `"Task"`，不能改成宽泛 `anyString()`
来隐藏标题规范化缺陷。

### 3. 失败类型指向不同层级

```text
wanted but not invoked        -> 预期协作没有发生，先检查分支是否提前返回
too many invocations          -> 调用次数超出合同，检查循环或重复写入
unnecessary stubbing          -> 当前测试带有未使用准备
stubbing argument mismatch    -> stub 参数与真实调用参数不同
assertion failed              -> 公开结果或字段不符合合同
```

先判断失败属于发现、准备、业务结果还是协作层，再修改最小原因，并复跑同一条失败命令。直接放宽 matcher、
删除断言或启用 lenient 只会让红灯消失，不会证明实现正确。

Mockito 还提供 `Answer`、`thenAnswer` 和 `doAnswer`，可以根据调用参数或调用次数动态计算返回值或执行动作。
它们适合确有动态协作合同的高级测试；本课的固定返回、异常和 `void` 失败已经足以覆盖 Service 四条业务
路径，因此不在主线示例中引入。不要为了展示 API 数量，把动态回答写进本应使用简单 `thenReturn` 的 fixture。

## 七、Java 8 兼容线只处理真实差异

### 1. 测试框架版本由各自运行线决定

本课完整工程是独立的 Java 25 fixture，使用 JUnit 6.1.3 与 Mockito 5.23.0；它不代表 Spring Boot 4.1 的默认
测试 BOM，也不与 Java 8 fixture 共用依赖声明。Spring Boot 2.3.12.RELEASE 管理 JUnit Jupiter 5.6.3 与 Mockito 3.3.3。
`mock`、`when`、`verify`、
`never`、`ArgumentCaptor` 和 Mockito Jupiter 扩展仍可使用，Service 单元边界也不需要启动 Boot 容器。

JUnit Jupiter 5.6.3 没有后续版本加入的 `assertThrowsExactly`。需要精确类型时，先使用 `assertThrows` 取得
异常，再断言实际类：

```java
IllegalArgumentException failure = assertThrows(
    IllegalArgumentException.class,
    () -> service.create("   ")
);
assertEquals(IllegalArgumentException.class, failure.getClass());
```

### 2. 生产代码差异不能伪装成测试差异

Java 8 没有 record、`String.strip()` 和 `String.isBlank()`。`Task` 需要使用普通不可变类；若业务合同要求
识别 Unicode 空白，不能简单声称 `trim().isEmpty()` 完全等价，应提供按 `Character.isWhitespace` 处理
首尾 code point 的辅助方法。Mockito 的使用方式并不会因此改变。

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

:::compare{before="现代写法" after="Java 8 写法"}
### 现代写法

```java
record Task(long id, String title) {}
```

### Java 8 写法

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
:::

现代 fixture 必须在 Java 25 runtime 运行，兼容 fixture 必须在真实 Java 8 runtime 运行。只用 Java 25 的
`--release 8` 编译，不能替代旧运行时对 JUnit、Mockito 和字节码的真实验证。

## 八、集中排查五个单元测试错误

### 五个典型错误

:::pitfalls
### 在公共 setup 预置所有分支

**触发条件：** `BeforeEach` 同时安排成功、冲突、缺失和异常返回，而当前测试只使用其中一条。

**原因：** 公共 fixture 承担了业务分支准备，严格模式会发现当前调用没有使用其他 stub。

**后果：** 测试出现 `UnnecessaryStubbingException`，读者也无法从测试方法看出真实前置条件。

**错误示例：**

```java
when(repository.findById(99L)).thenReturn(Optional.empty());
```

**正确写法：**

```java
service = new TaskService(repository);
```

**验证方式：** 先运行带无关 stub 的测试看到严格性失败，再删除该安排并复跑同一命令。

### stub 使用规范化前的参数

**触发条件：** 测试输入是 `" Task "`，Service 调用 repository 时使用 `"Task"`，stub 却仍写原始输入。

**原因：** 测试准备和真实协作合同描述了不同参数。

**后果：** stub 不命中，正确实现被误判失败；改成宽 matcher 又会掩盖未规范化缺陷。

**错误示例：**

```java
when(repository.findByTitle(" Task ")).thenReturn(Optional.empty());
```

**正确写法：**

```java
when(repository.findByTitle("Task")).thenReturn(Optional.empty());
```

**验证方式：** 运行错误版观察严格性或结果失败，再改成真实协作参数并复跑。

### 同一次调用混用裸值和 matcher

**触发条件：** 同一次 Mockito 调用中，一个参数使用 `eq(...)`，另一个仍使用裸值。

**原因：** matcher 通过内部记录工作，一次调用只要使用 matcher，全部参数都必须按 matcher 记录。

**后果：** 测试在准备阶段失败，尚未进入真实 Service 行为。

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

**验证方式：** 用错误版触发 matcher misuse，再统一参数风格并复跑。

### 用 captor 构造 stub

**触发条件：** 在 `when` 或 `doNothing` 中调用 `captor.capture()`，随后立即读取捕获值。

**原因：** captor 的主要职责是在 verify 阶段检查已经发生的调用，不负责表达准备条件。

**后果：** 调用未发生时没有可读值，测试准备与观察也混在一起。

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

**验证方式：** 先让保存不发生观察错误版失败，再把捕获移动到 verify 后重跑。

### 共享 static 可变 fixture

**触发条件：** 测试类使用 static 集合、缓存或其他可变对象，并由多条测试共同修改。

**原因：** fixture 生命周期越过单个测试调用，后运行的测试会继承旧状态。

**后果：** 单独运行通过，全量、重复或并行运行时出现顺序依赖。

**错误示例：**

```java
static final List<Task> DRAFTS = new ArrayList<>();
```

**正确写法：**

```java
List<Task> drafts = new ArrayList<>();
```

**验证方式：** 目标测试类连续运行两次，确认测试数和结果一致，第二次不读取第一次的可变数据。
:::

## 九、完整程序与运行结果

### 1. 创建独立 Maven 工程

下面的工程只依赖 JUnit 与 Mockito，不包含 Spring、SQL 或数据库连接：

```text
testing-service/
  pom.xml
  src/main/java/example/testing/Task.java
  src/main/java/example/testing/TaskRepository.java
  src/main/java/example/testing/TaskResult.java
  src/main/java/example/testing/TaskService.java
  src/test/java/example/testing/TaskServiceTest.java
```

`pom.xml` 使用 Java 25、JUnit 6.1.3、Mockito 5.23.0 与 Surefire 3.5.6：

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

### 2. 定义真实业务对象和仓储边界

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

### 3. 实现被测 Service

```java
package example.testing;

import java.util.Locale;

final class TaskService {
    private final TaskRepository repository;

    /** 创建具有显式仓储依赖的任务服务。 */
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

    /** 去除首尾空白并统一标题首字母。 */
    private String normalizeTitle(String rawTitle) {
        if (rawTitle == null) {
            throw new IllegalArgumentException("title must not be blank");
        }
        String title = rawTitle.strip();
        if (title.isEmpty()) {
            throw new IllegalArgumentException("title must not be blank");
        }
        return title.substring(0, 1).toUpperCase(Locale.ROOT) + title.substring(1);
    }
}
```

私有 `normalizeTitle` 不单独测试。创建成功测试通过公开结果和 repository 实际收到的 `Task` 证明它参与了
真实控制流。

### 4. 覆盖四条业务路径

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
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.STRICT_STUBS)
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

        TaskResult result = service.create("Task");

        assertEquals(TaskResult.CONFLICT, result);
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

### 5. 运行定向与全量反馈

```bash
mvn -Dtest=TaskServiceTest test
mvn test
mvn test
```

三次都应包含：

```text
Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

Surefire 还会生成 `target/surefire-reports/TEST-example.testing.TaskServiceTest.xml`。连续两次全量结果数量
一致，说明这些测试没有依赖上一次运行留下的可变 fixture。

## 十、独立练习

### 1. 任务与验收

:::exercise
### 补齐标题校验与保存失败反馈

**要求：** 在完整工程中新增 `TaskTitleValidationTest`。空白标题必须抛出
`IllegalArgumentException` 且不访问仓储；保存抛出异常时必须返回 `DEPENDENCY_FAILED`。保持真实
`TaskService`，只 mock `TaskRepository`，不启动 Spring。

**验收：** `mvn -Dtest=TaskTitleValidationTest test` 显示两条测试通过；删除保存失败安排后，第二条测试失败；
恢复后定向测试与全量测试各连续运行两次，测试数量保持一致。

**参考答案：** 完整参考实现见下一小节。先独立写出输入、协作者失败、公开结果和禁止协作，再与答案对照。
:::

### 2. 完整参考实现

```java
package example.testing;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.STRICT_STUBS)
class TaskTitleValidationTest {
    @Mock
    private TaskRepository repository;

    private TaskService service;

    /** 为每个测试创建真实 Service。 */
    @BeforeEach
    void setUp() {
        service = new TaskService(repository);
    }

    /** 验证空白标题在访问仓储前被拒绝。 */
    @Test
    void rejectsBlankTitleBeforeRepositoryCall() {
        assertThrows(IllegalArgumentException.class, () -> service.create("   "));

        verify(repository, never()).findByTitle(any(String.class));
        verify(repository, never()).save(any(Task.class));
    }

    /** 验证保存失败被映射为稳定业务结果。 */
    @Test
    void mapsSaveFailure() {
        when(repository.findByTitle("Task")).thenReturn(Optional.empty());
        doThrow(new IllegalStateException("database unavailable"))
            .when(repository)
            .save(any(Task.class));

        assertEquals(TaskResult.DEPENDENCY_FAILED, service.create("Task"));
        verify(repository).save(any(Task.class));
    }
}
```

### 3. 运行结果与自检

```bash
mvn -Dtest=TaskTitleValidationTest test
mvn test
mvn test
```

定向测试应显示：

```text
Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

完成后还应能解释：为什么空白标题测试不需要任何 stub；为什么保存失败使用 `doThrow`；为什么不能只
verify `save` 而不断言 `DEPENDENCY_FAILED`；以及为什么这些测试不需要 `@SpringBootTest`。

## 十一、本课小结

Service 单元测试把反馈集中在一段真实业务逻辑上：构造器交出直接协作者，Mockito 只替代外部边界，stub
只准备当前分支，JUnit 先证明公开结果，verify 再保护必要副作用。参数精确、fixture 独立且严格模式开启时，
失败信息能够直接指向准备、断言或协作合同，而不是被 Spring、数据库和网络状态淹没。
