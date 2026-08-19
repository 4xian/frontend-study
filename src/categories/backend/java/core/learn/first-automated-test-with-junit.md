---
id: backend.java.learn.basics.first-automated-test-with-junit
type: lesson
title: 第一条自动化测试：JUnit、断言与测试结构
summary: 用 JUnit 把业务预期写成可重复执行、会明确失败的 Maven 测试反馈环
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 75
prerequisites:
  - backend.java.learn.basics.maven-project-model
objectives:
  - 能区分被测代码、测试代码、JUnit Jupiter 与 Maven Surefire 的职责。
  - 能在 Maven 项目中以 test scope 添加 Jupiter，并写出第一条可失败的测试。
  - 能用 Arrange-Act-Assert 组织输入、调用和断言。
  - 能根据行为选择 assertEquals、布尔断言或 assertThrows。
  - 能用测试名、退出码、测试计数和 Surefire 报告判断反馈环是否真实执行。
  - 能解释 Java 25 / JUnit 6 与 Java 8 / JUnit 5 为什么必须分线运行。
recap:
  - Test 标记测试方法，断言才把预期与实际结果变成可执行合同。
  - AAA 是准备、执行、断言的阅读结构，不是 JUnit 强制语法。
  - Jupiter 默认每个测试方法创建新的测试类实例，但 static 和外部资源仍会共享。
  - Surefire 按文件名发现测试；命令成功时仍要确认测试数大于零并检查报告。
  - 定向测试用于快速反馈，完整测试和重复运行才证明整套结果与隔离性。
  - JUnit 6 需要 Java 17+；Java 8 应使用独立的 JUnit 5 兼容线。
related: []
tags:
  - Java
  - JUnit
  - 自动化测试
  - 断言
  - Maven Surefire
  - Arrange-Act-Assert
appliesTo: Java 25、JUnit 6.1.3、Maven 3.9.16、Surefire 3.5.6；Java 8 使用 JUnit 5.14.4 兼容线
modernBaseline:
  java: '25'
  junit: 6.1.3
  maven: 3.9.16
  mavenSurefire: 3.5.6
legacyBaseline:
  java: '8'
  junit: 5.14.4
  maven: 3.9.16
  mavenSurefire: 3.5.6
verifiedAt: 2026-08-15
sources:
  - id: junit-6-overview
    title: JUnit 6.1.3 Overview
    url: https://docs.junit.org/6.1.3/overview.html
    sourceType: official-reference
    appliesTo: JUnit 6.1.3
    claims:
      - JUnit 由 Platform、Jupiter 与 Vintage 组成，JUnit 6 运行时要求 Java 17 或以上。
  - id: junit-test-api
    title: JUnit Jupiter Test API
    url: https://docs.junit.org/6.1.3/api/org.junit.jupiter.api/org/junit/jupiter/api/Test.html
    sourceType: api-doc
    appliesTo: JUnit Jupiter 6.1.3
    claims:
      - Test 标记测试方法，并规定方法可见性、返回值和 static 边界。
  - id: junit-assertions-api
    title: JUnit Jupiter Assertions API
    url: https://docs.junit.org/6.1.3/api/org.junit.jupiter.api/org/junit/jupiter/api/Assertions.html
    sourceType: api-doc
    appliesTo: JUnit Jupiter 6.1.3
    claims:
      - assertEquals、assertTrue、assertFalse 与 assertThrows 的断言合同。
  - id: junit-before-each-api
    title: JUnit Jupiter BeforeEach API
    url: https://docs.junit.org/6.1.3/api/org.junit.jupiter.api/org/junit/jupiter/api/BeforeEach.html
    sourceType: api-doc
    appliesTo: JUnit Jupiter 6.1.3
    claims:
      - BeforeEach 方法在每个测试前执行，并受返回值与 static 规则约束。
  - id: junit-after-each-api
    title: JUnit Jupiter AfterEach API
    url: https://docs.junit.org/6.1.3/api/org.junit.jupiter.api/org/junit/jupiter/api/AfterEach.html
    sourceType: api-doc
    appliesTo: JUnit Jupiter 6.1.3
    claims:
      - AfterEach 方法在每个测试后执行，只应承担真实清理职责。
  - id: junit-test-classes
    title: JUnit Test Classes and Methods
    url: https://docs.junit.org/6.1.3/writing-tests/test-classes-and-methods.html
    sourceType: official-reference
    appliesTo: JUnit Jupiter 6.1.3
    claims:
      - Jupiter 测试类和测试方法不必声明为 public。
  - id: junit-display-names
    title: JUnit Display Names
    url: https://docs.junit.org/6.1.3/writing-tests/display-names.html
    sourceType: official-reference
    appliesTo: JUnit Jupiter 6.1.3
    claims:
      - DisplayName 可以为测试类和测试方法提供报告显示名称。
  - id: junit-instance-lifecycle
    title: JUnit Test Instance Lifecycle
    url: https://docs.junit.org/6.1.3/writing-tests/test-instance-lifecycle.html
    sourceType: official-reference
    appliesTo: JUnit Jupiter 6.1.3
    claims:
      - Jupiter 默认使用 PER_METHOD，为每个测试方法创建新的测试类实例。
  - id: junit-maven-support
    title: JUnit Build Support
    url: https://docs.junit.org/6.1.3/running-tests/build-support.html
    sourceType: official-reference
    appliesTo: JUnit 6.1.3 / Maven
    claims:
      - Maven Surefire 支持 JUnit Platform，并按默认文件名模式发现测试。
  - id: junit-5-java8
    title: JUnit 5.14.4 Overview
    url: https://docs.junit.org/5.14.4/overview.html
    sourceType: official-reference
    appliesTo: JUnit 5.14.4 / Java 8
    claims:
      - JUnit 5 运行时要求 Java 8 或以上，可作为 Java 8 兼容线。
  - id: surefire-3-5-6
    title: Maven Surefire Plugin 3.5.6
    url: https://maven.apache.org/surefire-archives/surefire-3.5.6/maven-surefire-plugin/
    sourceType: official-reference
    appliesTo: Maven Surefire 3.5.6
    claims:
      - Surefire 在 Maven test 阶段运行单元测试并生成文本和 XML 报告。
  - id: surefire-requirements
    title: Maven Surefire Plugin 3.5.6 Details
    url: https://maven.apache.org/surefire-archives/surefire-3.5.6/maven-surefire-plugin/plugin-info.html
    sourceType: official-reference
    appliesTo: Maven Surefire 3.5.6
    claims:
      - Surefire 3.5.6 最低要求 Maven 3.6.3 和 JDK 8。
  - id: surefire-single-test
    title: Maven Surefire - Running a Single Test
    url: https://maven.apache.org/surefire-archives/surefire-3.5.6/maven-surefire-plugin/examples/single-test.html
    sourceType: official-reference
    appliesTo: Maven Surefire 3.5.6
    claims:
      - test 参数可以选择单个测试类执行。
  - id: oracle-java-roadmap
    title: Oracle Java SE Support Roadmap
    url: https://www.oracle.com/java/technologies/java-se-support-roadmap.html
    sourceType: official-reference
    appliesTo: Java 25 / Java 8
    claims:
      - Java 25 是现代 LTS，Java 8 是本课程项目兼容线。
projectEvidence: []
---

# 第一条自动化测试：JUnit、断言与测试结构

## 为什么需要学习

手工运行一次程序，只能说明这一次输入看起来正确。下一次修改后，你还要重新准备输入、观察结果并
判断对错；一旦步骤遗漏，错误就可能被当成成功。自动化测试把这套判断写成代码，让相同规则可以重复
执行，并让错误预期稳定地产生非零退出状态。

本课只建立第一条最小反馈环：一个普通 Java 类、一组 Jupiter 测试、精确断言，以及 Maven Surefire
生成的退出码和报告。测试替身、Spring 测试和集成测试属于后续课程，不在这里提前展开。

## 学习目标

- 区分生产代码、测试代码、Jupiter 和 Surefire 的职责。
- 在 Maven 项目中添加只用于测试的 Jupiter 依赖。
- 使用 `@Test`、AAA 和精确断言验证公开行为。
- 用行为名称描述测试，并避免依赖执行顺序或共享状态。
- 从测试计数、失败详情、退出码和 XML 报告判断反馈是否真实。
- 为 Java 25 与 Java 8 选择各自可运行的 JUnit 版本。

## 前置术语

- **被测代码**：需要验证的生产类，通常放在 `src/main/java`。
- **测试代码**：准备输入、调用被测行为并检查结果的代码，通常放在 `src/test/java`。
- **测试用例**：一条可独立执行并给出通过或失败结论的行为检查。
- **断言**：把预期值与实际结果比较；不满足时抛出测试失败。
- **fixture**：某个测试运行所需的对象和输入。本课只使用内存中的普通对象。
- **测试运行器**：发现并执行测试，再汇总退出状态与报告的工具链。

## 现代版本中的正确用法

现代主线使用 Java 25、JUnit 6.1.3、Maven 3.9.16 和 Surefire 3.5.6。JUnit 6 由 Platform、
Jupiter 与 Vintage 组成：Platform 提供启动测试框架的基础，Jupiter 提供本课使用的注解、断言和
测试引擎，Vintage 只服务旧测试迁移。本课依赖 `junit-jupiter` 聚合项，不使用 Vintage。

JUnit 6 自身需要 Java 17 或以上运行。它可以测试较早目标版本的业务 class，但不能由 Java 8 启动。
因此 Java 8 兼容反馈使用独立的 JUnit 5.14.4 POM，不能把两条版本线混在一个依赖图里。

## 基本语法

一条最小 Jupiter 测试由测试类、`@Test` 方法和断言组成。测试类与方法不必写 `public`，但测试方法
不能是 `private` 或 `static`，也不能返回值。

```java
import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class GreetingTest {
    /** 验证固定问候语。 */
    @Test
    void message_defaultInput_returnsGreeting() {
        String actual = "Hello";

        assertEquals("Hello", actual);
    }
}
```

`@Test` 让 Jupiter 发现方法，`assertEquals` 才真正验证结果。把 expected 改成 `"Hi"` 后，同一测试
必须失败；如果仍然成功，就说明测试没有执行或断言没有覆盖目标结果。

## 零基础知识点详解

### 自动化测试把人工判断变成重复反馈

**它是什么：** 自动化测试是可以重复执行的程序化检查，同一输入和规则应给出同一通过或失败结论。

**有什么作用：** 它把“我看起来觉得对”换成可由命令退出码和报告判断的合同。

**什么时候使用：** 每当公开行为有明确输入和结果，并且后续修改可能破坏它时使用。

**怎么使用：** 先选一个公开行为，准备最小输入，执行一次，再对可观察结果断言。

**最小示例：** `assertEquals("ready", rules.normalizeTitle(" ready "))`。

**运行结果：** 结果为 `ready` 时测试通过；其他值使测试失败并显示 expected 与 actual。

**常见误区：** 只运行生产程序并阅读一行输出，不是可独立判断失败的自动化测试。

### 被测代码、测试代码与运行器各有职责

**它是什么：** 被测类实现业务规则，测试类描述预期，Jupiter 执行测试模型，Surefire 连接 Maven。

**有什么作用：** 分清职责后，业务类不需要知道 JUnit，测试依赖也不会进入生产逻辑。

**什么时候使用：** 创建第一条测试或排查“能编译但测试为零”时先画出这四个角色。

**怎么使用：** 业务方法返回公开结果；测试调用该方法；Jupiter 运行断言；Surefire 汇总报告和退出码。

**最小示例：** `TaskRules` 不 import JUnit，`TaskRulesTest` 才 import Jupiter API。

**运行结果：** 生产代码可单独编译，测试代码在 test classpath 上编译并由 Surefire 执行。

**常见误区：** 在生产方法中直接抛 `AssertionError` 代替测试，会把测试职责泄漏到业务代码。

### Maven 目录和 test scope 隔离测试依赖

**它是什么：** Maven 默认从 `src/main/java` 编译生产代码，从 `src/test/java` 编译测试代码；
`scope=test` 只把 JUnit 放进测试编译与执行 classpath。

**有什么作用：** 发布的生产产物不需要携带测试框架，目录也能直接表达代码职责。

**什么时候使用：** 为普通 Maven JAR 添加第一条单元测试时使用默认目录，不自创 `tests/` 路径。

**怎么使用：** 在 POM 中固定 Jupiter 和 Surefire 版本：

```xml
<dependency>
  <groupId>org.junit.jupiter</groupId>
  <artifactId>junit-jupiter</artifactId>
  <version>6.1.3</version>
  <scope>test</scope>
</dependency>
```

**运行结果：** `mvn test` 能编译测试；生产运行 classpath 不需要 JUnit。

**常见误区：** 忘记 `test` scope 会让测试库进入更宽的依赖范围，却不会让断言更可靠。

### Platform、Jupiter 与 Surefire 组成执行链

**它是什么：** Platform 提供测试启动基础，Jupiter 提供 API 与引擎，Surefire 在 Maven `test`
阶段启动 Platform。

**有什么作用：** 这条链解释了为什么只有注解 API、没有引擎或没有运行插件时会出现发现问题。

**什么时候使用：** 依赖已下载但 tests 为 0，或 import 误写成 `org.junit.Test` 时检查。

**怎么使用：** 初学主线依赖 `junit-jupiter` 聚合项，并固定 Surefire 3.5.6。

**最小示例：** `org.junit.jupiter.api.Test` 属于 Jupiter，不是旧 JUnit 4 的 `org.junit.Test`。

**运行结果：** Surefire 发现符合名称的测试类，Jupiter 引擎执行其中的 `@Test` 方法。

**常见误区：** 把 JUnit、Jupiter 和 Surefire 当作三个同义词，会在缺少引擎时只检查注解。

### Test 标记方法，但不会自动判断业务结果

**它是什么：** `@Test` 只声明这是测试方法；方法正常结束不等于业务结果正确。

**有什么作用：** 注解让引擎发现入口，断言才决定返回值、状态或异常是否符合预期。

**什么时候使用：** 每个独立测试行为使用一个 `@Test` 方法。

**怎么使用：** 使用包可见、无参数、`void` 的实例方法，并至少检查一个业务可见结果。

**最小示例：**

```java
/** 验证外层空白会被移除。 */
@Test
void normalizeTitle_outerWhitespace_returnsTrimmedTitle() {
    String actual = new TaskRules().normalizeTitle(" ready ");
    assertEquals("ready", actual);
}
```

**运行结果：** 方法被发现并执行；实际值不是 `ready` 时失败。

**常见误区：** 只调用 `normalizeTitle` 而不断言，只能证明本次调用没有抛出异常。

### Arrange-Act-Assert 分开输入、调用与判断

**它是什么：** Arrange 准备对象和输入，Act 执行目标行为，Assert 检查实际结果。

**有什么作用：** 失败时可以快速判断是输入准备、目标调用还是预期比较出了问题。

**什么时候使用：** 测试包含多个语句、初学者需要明确阅读顺序时使用。

**怎么使用：** Act 区只保留本次要观察的调用；简单测试可以省略注释，但职责仍要清楚。

```java
/** 验证完成状态返回 true。 */
@Test
void isCompleted_doneStatus_returnsTrue() {
    TaskRules rules = new TaskRules(); // Arrange

    boolean actual = rules.isCompleted("done"); // Act

    assertTrue(actual); // Assert
}
```

**运行结果：** `done` 返回 `true` 时通过。

**常见误区：** AAA 是课程阅读结构，不是 JUnit 语法；不要为三行代码强行堆叠无信息注释。

### assertEquals 按 expected、actual 比较值

**它是什么：** `assertEquals(expected, actual)` 比较预期值与实际值。

**有什么作用：** 失败报告能明确展示应该得到什么和实际得到了什么。

**什么时候使用：** 返回字符串、数字、枚举或已经定义相等性合同的对象时使用。

**怎么使用：** 先写从需求得到的稳定 expected，再调用被测代码得到 actual。

**最小示例：** `assertEquals("ready", actual)`。

**运行结果：** 两者相等时继续执行；不相等时记录失败并使 Maven 最终返回非零。

**常见误区：** 把 actual 写在前面通常仍会失败，但报告中的“预期/实际”语义会颠倒。

### assertTrue 与 assertFalse 表达布尔合同

**它是什么：** `assertTrue` 要求条件为真，`assertFalse` 要求条件为假。

**有什么作用：** 它们直接表达布尔业务规则，不需要写成 `assertEquals(true, condition)`。

**什么时候使用：** 被测方法本身返回布尔结果，并且真假含义清晰时使用。

**怎么使用：** 分别为触发条件和非触发条件写独立测试。

```java
/** 验证待办状态不是完成状态。 */
@Test
void isCompleted_pendingStatus_returnsFalse() {
    boolean actual = new TaskRules().isCompleted("pending");

    assertFalse(actual);
}
```

**运行结果：** `pending` 返回 `false` 时通过。

**常见误区：** 把多个不同状态塞进一条复杂布尔表达式，会让失败报告无法指出具体输入。

### assertThrows 限定预期失败的目标调用

**它是什么：** `assertThrows` 执行一个 lambda，要求它抛出指定类型，并返回捕获到的异常。

**有什么作用：** 它同时证明失败类型，并允许继续检查稳定的消息或 cause。

**什么时候使用：** 业务合同明确要求某个输入被拒绝时使用。

**怎么使用：** 在 lambda 外完成 Arrange，lambda 内只保留 Act，再检查异常的稳定属性。

```java
/** 验证空白标题被明确拒绝。 */
@Test
void normalizeTitle_blankInput_throwsException() {
    TaskRules rules = new TaskRules();

    IllegalArgumentException error = assertThrows(
        IllegalArgumentException.class,
        () -> rules.normalizeTitle("   ")
    );

    assertEquals("title must not be blank", error.getMessage());
}
```

**运行结果：** 指定调用抛出 `IllegalArgumentException` 且消息匹配时通过。

**常见误区：** lambda 包住准备代码，准备阶段的同类异常也可能让测试误通过。

### 测试名称描述条件和结果

**它是什么：** 本课程采用 `method_condition_expectedResult`，`@DisplayName` 只补充报告显示文字。

**有什么作用：** 方法名让源码搜索、单类运行和失败定位都保留业务语义。

**什么时候使用：** 每个测试都给出被测方法、触发条件和可观察结果。

**怎么使用：** 先写 `normalizeTitle_blankInput_throwsException`，需要时再加中文显示名。

```java
/** 验证空白标题失败，并在报告中显示中文说明。 */
@DisplayName("空白任务标题会被拒绝")
@Test
void normalizeTitle_blankInput_throwsException() {
    assertThrows(IllegalArgumentException.class, () -> new TaskRules().normalizeTitle(" "));
}
```

**运行结果：** 源码保留可检索方法名，报告优先显示中文名称。

**常见误区：** 用 `test1`、`works` 配合漂亮显示名，移除注解后源码仍然没有行为含义。

### 默认 PER_METHOD 提供新的测试类实例

**它是什么：** Jupiter 默认在每个测试方法执行前创建新的测试类实例。

**有什么作用：** 普通实例字段不会自动从上一条测试泄漏到下一条测试。

**什么时候使用：** 把被测对象放在测试字段中，并在每个测试前重新创建时依赖默认规则。

**怎么使用：** 不通过字段或执行顺序传递结果；单独运行任何测试都应成功。

**最小示例：** 两个测试都由 `@BeforeEach` 得到新的 `TaskRules`。

**运行结果：** 单类、整套和重复运行得到相同测试计数与结论。

**常见误区：** `static` 字段、文件和系统属性仍会共享，默认实例生命周期不是完整隔离保证。

### BeforeEach 只提取重复准备，AfterEach 只做真实清理

**它是什么：** `@BeforeEach` 在每个测试前运行，`@AfterEach` 在每个测试后运行。

**有什么作用：** 前者消除真正重复的通用准备，后者恢复测试占用的外部状态或资源。

**什么时候使用：** 多个测试都创建同类对象时使用一个 `@BeforeEach`；只有真实清理时才添加
`@AfterEach`。

**怎么使用：** 特殊输入保留在当前测试内，避免失败上下文分散。

```java
private TaskRules rules;

/** 为每条测试创建新的规则对象。 */
@BeforeEach
void createRules() {
    rules = new TaskRules();
}
```

**运行结果：** 每条测试开始时 `rules` 都是新对象；本课没有外部资源，所以不添加空清理方法。

**常见误区：** 为展示注解而写空 `@AfterEach`，会把“见过 API”误当成资源所有权。

### mvn test 连接编译、发现、执行和报告

**它是什么：** Maven `test` 阶段编译测试并由 Surefire 运行单元测试。

**有什么作用：** 一条命令同时给出进程退出码、测试摘要和 `target/surefire-reports` 报告。

**什么时候使用：** 本地反馈、持续集成和提交前检查都以同一命令为入口。

**怎么使用：** 在项目根目录执行 `mvn test`，保存第一个失败详情，不要只搜索 `BUILD SUCCESS`。

**最小示例：** `mvn -B -ntp test`。

**运行结果：** 四条测试通过时 exit code 为 0；故意改错 expected 后 exit code 非零。

**常见误区：** 构建命令返回 0 却不检查测试数，可能把 tests=0 当成全部通过。

### 文件名和报告证明测试真的被发现

**它是什么：** Surefire 默认发现 `Test*.java`、`*Test.java`、`*Tests.java` 和 `*TestCase.java`。

**有什么作用：** 使用 `TaskRulesTest.java` 让默认配置可预测，XML 报告再证明执行数量。

**什么时候使用：** 新增测试类或排查“源码编译了但没有执行”时核对。

**怎么使用：** 检查控制台 tests 大于零，并打开 `target/surefire-reports/TEST-*.xml` 核对 counts。

**最小示例：** `TaskRulesTest.java` 会被发现，`TaskRulesCheck.java` 默认不会被发现。

**运行结果：** 本课报告应显示 tests=4、failures=0、errors=0、skipped=0。

**常见误区：** 只看测试源码存在，不核对发现规则、报告文件和实际计数。

### 定向、完整和重复运行回答不同问题

**它是什么：** `-Dtest=TaskRulesTest` 只选当前类，`mvn test` 运行整套，重复运行检查结果稳定性。

**有什么作用：** 定向运行缩短开发反馈，整套运行检查影响范围，重复运行暴露共享状态。

**什么时候使用：** 修改当前行为时先定向；结束前再跑整套并至少重复一次关键反馈。

**怎么使用：** 依次执行 `mvn -Dtest=TaskRulesTest test`、`mvn test` 和第二次 `mvn test`。

**最小示例：** 三次结果都应包含 TaskRulesTest 的四条测试并通过。

**运行结果：** 测试计数和结论一致，第二次运行不依赖第一次留下的字段状态。

**常见误区：** 只跑定向测试就宣布整套通过，无法证明其他测试没有回归。

## 从零跟着做

本节按现代主线使用 Java 25、Maven 3.9.16、JUnit 6.1.3、Compiler Plugin 3.14.1 和
Surefire 3.5.6。先用 `java --version` 与 `mvn --version` 确认实际运行版本，再从 `/tmp` 的空目录
开始：

**步骤 1：** 创建临时根目录和 Maven 标准目录；后续命令都在 `$work_dir` 中执行。

```bash
work_dir=$(mktemp -d /tmp/java-junit-first-test.XXXXXX)
cd "$work_dir"
mkdir -p src/main/java/example src/test/java/example
```

**步骤 2：** 在 `$work_dir/pom.xml` 写入完整构建配置。JUnit 只进入 test scope，Surefire 负责执行测试：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>lesson.junit</groupId>
  <artifactId>first-test</artifactId>
  <version>1.0.0</version>
  <properties>
    <maven.compiler.release>8</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <version>6.1.3</version>
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

**步骤 3：** 把下面的生产类保存到 `src/main/java/example/TaskRules.java`；它不引用任何测试 API。

**步骤 4：** 把下面的测试类保存到 `src/test/java/example/TaskRulesTest.java`。

**步骤 5：** 执行 `mvn -B -ntp test`。预期看到
`Tests run: 4, Failures: 0, Errors: 0, Skipped: 0` 和 `BUILD SUCCESS`，进程 exit code 为 0，并生成
`target/surefire-reports/TEST-example.TaskRulesTest.xml`。

**步骤 6：** 复制一份正确测试作为恢复点，把第一个 `assertEquals("ready", actual)` 的 expected 临时改为
`"wrong"`，再执行同一命令。预期 exit code 非零，报告显示 expected `wrong`、actual `ready`。

```bash
cp src/test/java/example/TaskRulesTest.java TaskRulesTest.java.correct
sed 's/assertEquals("ready", actual)/assertEquals("wrong", actual)/' \
  TaskRulesTest.java.correct > TaskRulesTest.java.wrong
mv TaskRulesTest.java.wrong src/test/java/example/TaskRulesTest.java
mvn -B -ntp test
```

**步骤 7：** 用恢复点覆盖错误改动并复跑，确认四条测试重新通过。

```bash
cp TaskRulesTest.java.correct src/test/java/example/TaskRulesTest.java
mvn -B -ntp test
```

**步骤 8：** 完成观察后离开临时目录并清理全部源码、依赖输出和报告。

```bash
cd /tmp
find "$work_dir" -depth -delete
test ! -e "$work_dir"
```

被测类只包含本课需要的两个公开行为：

```java
package example;

public final class TaskRules {
    /** 规范化任务标题，并拒绝 null 或空白。 */
    public String normalizeTitle(String rawTitle) {
        if (rawTitle == null || rawTitle.trim().isEmpty()) {
            throw new IllegalArgumentException("title must not be blank");
        }
        return rawTitle.trim();
    }

    /** 判断状态是否表示任务已经完成。 */
    public boolean isCompleted(String status) {
        return "done".equals(status);
    }
}
```

测试类用一个 `@BeforeEach` 创建被测对象，特殊输入仍写在各自测试中：

```java
package example;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class TaskRulesTest {
    private TaskRules rules;

    /** 为每条测试创建新的规则对象。 */
    @BeforeEach
    void createRules() {
        rules = new TaskRules();
    }

    /** 验证标题外层空白会被移除。 */
    @DisplayName("标题外层空白会被移除")
    @Test
    void normalizeTitle_outerWhitespace_returnsTrimmedTitle() {
        String actual = rules.normalizeTitle(" ready ");

        assertEquals("ready", actual);
    }

    /** 验证完成状态返回 true。 */
    @Test
    void isCompleted_doneStatus_returnsTrue() {
        assertTrue(rules.isCompleted("done"));
    }

    /** 验证待办状态返回 false。 */
    @Test
    void isCompleted_pendingStatus_returnsFalse() {
        assertFalse(rules.isCompleted("pending"));
    }

    /** 验证空白标题抛出精确异常。 */
    @Test
    void normalizeTitle_blankInput_throwsException() {
        IllegalArgumentException error = assertThrows(
            IllegalArgumentException.class,
            () -> rules.normalizeTitle("   ")
        );

        assertEquals("title must not be blank", error.getMessage());
    }
}
```

完成标准不是“终端出现绿色文字”，而是 Maven exit code 为 0、tests=4、失败与错误均为 0，并且
`target/surefire-reports` 中存在对应 XML。故意改错 expected 时，这四项中的失败证据必须同步变化。

## 如何使用

1. 从一个公开、确定、无需外部资源的行为开始，不先搭建复杂 fixture。
2. 用测试名写清被测方法、输入条件和预期结果。
3. Arrange 特殊输入，Act 只调用目标行为，Assert 检查业务可见结果。
4. 先运行当前测试类并阅读第一个失败，再运行整套测试。
5. 确认测试计数大于零，检查 Surefire XML，并重复运行验证隔离。
6. 失败修复后复跑同一个命令；不要通过删除断言或扩大异常类型让测试变绿。

## 适用与不适用场景

本课适合无网络、无数据库、无框架容器的普通 Java 行为，例如字符串规则、集合计算、状态判断和异常
合同。需要替换协作者的 Service 测试留给 Mockito 课程；Controller、Spring 上下文、外部 HTTP、真实
数据库和容器测试也有不同的生命周期与失败边界，不能由本课的纯对象测试直接替代。

:::tip
先故意让 expected 出错一次，再恢复并通过。只有同一测试能稳定地先失败、后成功，才能证明断言和
运行器确实接入了目标行为。这个动作只验证反馈环，不等于要求所有开发都采用 TDD。
:::

## Java 8 兼容写法

本课的 `TaskRules` 与 `TaskRulesTest` 源码只使用 Java 8 已支持的语法和 Jupiter 基础 API，可以在两条
反馈线复用。但运行时依赖不同：现代线使用 JUnit 6.1.3 和 Java 25；Java 8 线必须换成 JUnit 5.14.4。
Surefire 3.5.6 的最低要求是 Maven 3.6.3 与 JDK 8，因此前置课程的 Maven 3.9.16 可在两条线运行。

| 对比项 | 现代主线 | Java 8 兼容线 | 迁移注意 |
| --- | --- | --- | --- |
| 测试运行 JDK | Java 25 | Java 8 | 记录实际启动测试的 JDK |
| Jupiter 版本 | 6.1.3 | 5.14.4 | 不在同一个 POM 混用 |
| 最低 JDK | Java 17+ | Java 8+ | release 8 不会让 JUnit 6 能在 Java 8 启动 |
| Surefire | 3.5.6 | 3.5.6 | 两条线都固定插件版本 |
| 本课源码 | 同一 Java 8 兼容源码 | 同一源码 | 版本差异只在 POM 和运行时 |

## 易错点

:::pitfalls
### 错误：测试方法没有断言

**触发条件：** `@Test` 方法只调用生产方法，然后正常结束。

**原因：** `@Test` 只标记入口，不知道什么业务结果才算正确。

**后果：** 返回错误值也会通过，形成没有保护力的假绿测试。

**错误示例：**

```java
/** 错误：只执行调用，不检查返回值。 */
@Test
void normalizeTitle_outerWhitespace_runs() {
    new TaskRules().normalizeTitle(" ready ");
}
```

**正确写法：**

```java
assertEquals("ready", new TaskRules().normalizeTitle(" ready "));
```

**验证方式：** 把 expected 改错，测试必须失败且 Maven exit code 非零。

### 错误：把 expected 与 actual 写反

**触发条件：** 写成 `assertEquals(actual, "ready")`。

**原因：** 两个参数都能参与相等比较，编译器无法识别业务角色。

**后果：** 失败报告颠倒预期和实际，增加定位成本。

**错误示例：**

```java
assertEquals(actual, "ready");
```

**正确写法：**

```java
assertEquals("ready", actual);
```

**验证方式：** 故意返回 `READY`，报告应显示 expected 为 `ready`、actual 为 `READY`。

### 错误：assertThrows 包住准备步骤

**触发条件：** lambda 同时创建输入、查找数据并调用目标方法。

**原因：** 任意准备步骤抛出相同类型都会满足断言。

**后果：** 目标方法即使不再拒绝非法输入，测试仍可能通过。

**错误示例：**

```java
assertThrows(IllegalArgumentException.class, () -> {
    String input = prepareInvalidTitle();
    new TaskRules().normalizeTitle(input);
});
```

**正确写法：**

```java
String input = " ";
assertThrows(IllegalArgumentException.class, () -> rules.normalizeTitle(input));
```

**验证方式：** 让准备步骤抛出相同异常，正确结构应在进入 `assertThrows` 前直接失败。

### 错误：测试类名不符合默认发现模式

**触发条件：** 文件命名为 `TaskRulesCheck.java`，却没有配置 includes。

**原因：** Surefire 默认只扫描 `Test*`、`*Test`、`*Tests` 和 `*TestCase` 模式。

**后果：** 测试源码可能编译成功，但 tests=0，命令仍可能返回成功。

**错误示例：**

```text
src/test/java/example/TaskRulesCheck.java
```

**正确写法：**

```text
src/test/java/example/TaskRulesTest.java
```

**验证方式：** 同时检查控制台测试数和 `target/surefire-reports/TEST-*.xml`。

### 错误：让测试依赖执行顺序

**触发条件：** 一条测试修改 static 状态，下一条测试假设该修改已经发生。

**原因：** 默认新实例不隔离 static 或外部状态，测试顺序也不是业务合同。

**后果：** 单独运行、整套运行或顺序变化时出现不同结果。

**错误示例：**

```java
sharedStatus = "done";
assertEquals("done", sharedStatus);
```

**正确写法：**

```java
String status = "done";
assertTrue(new TaskRules().isCompleted(status));
```

**验证方式：** 单类定向、整套和连续两次运行必须得到同一测试计数与结论。
:::

## 如何验证

下面的反馈环只在 `/tmp` 创建两套独立 Maven 工程。两套工程复用完全相同的 Java 8 兼容源码，现代线
由 Java 25 + JUnit 6.1.3 执行，兼容线由真实 Java 8 + JUnit 5.14.4 执行。脚本同时检查正常、定向、
故意失败、恢复和离线重复运行，并在退出时删除全部临时资产：

```bash
set -euo pipefail

work_dir=$(mktemp -d /tmp/java-junit-b20-feedback.XXXXXX)
trap 'find "$work_dir" -depth -delete' EXIT

maven_url='https://dlcdn.apache.org/maven/maven-3/3.9.16/binaries/apache-maven-3.9.16-bin.tar.gz'
maven_sha512='831a8591fe20c8243b1dbe7d71e3244f31d1665b0804b2e825e38cbbe5ce0cafb8338851f90780735568773e0a6cd07bbec107cda0b896b008b861075358b6f6'
curl -L -sS -o "$work_dir/apache-maven.tar.gz" "$maven_url"
printf '%s  %s\n' "$maven_sha512" "$work_dir/apache-maven.tar.gz" | shasum -a 512 -c - >/dev/null
tar -xzf "$work_dir/apache-maven.tar.gz" -C "$work_dir"

mkdir -p \
  "$work_dir/source/src/main/java/example" \
  "$work_dir/source/src/test/java/example" \
  "$work_dir/modern-java25" \
  "$work_dir/legacy-java8" \
  "$work_dir/repository-modern" \
  "$work_dir/repository-legacy"

cat > "$work_dir/pom.template.xml" <<'POM'
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>lesson.junit</groupId>
  <artifactId>first-test</artifactId>
  <version>1.0.0</version>
  <properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <version>@JUNIT_VERSION@</version>
      <scope>test</scope>
    </dependency>
  </dependencies>
  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
        <version>3.14.1</version>
        <configuration>
          <release>8</release>
        </configuration>
      </plugin>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>3.5.6</version>
      </plugin>
    </plugins>
  </build>
</project>
POM

cat > "$work_dir/source/src/main/java/example/TaskRules.java" <<'JAVA'
package example;

public final class TaskRules {
    /** 规范化任务标题，并拒绝 null 或空白。 */
    public String normalizeTitle(String rawTitle) {
        if (rawTitle == null || rawTitle.trim().isEmpty()) {
            throw new IllegalArgumentException("title must not be blank");
        }
        return rawTitle.trim();
    }

    /** 判断状态是否表示任务已经完成。 */
    public boolean isCompleted(String status) {
        return "done".equals(status);
    }
}
JAVA

cat > "$work_dir/source/src/test/java/example/TaskRulesTest.java" <<'JAVA'
package example;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class TaskRulesTest {
    private TaskRules rules;

    /** 为每条测试创建新的规则对象。 */
    @BeforeEach
    void createRules() {
        rules = new TaskRules();
    }

    /** 验证标题外层空白会被移除。 */
    @DisplayName("标题外层空白会被移除")
    @Test
    void normalizeTitle_outerWhitespace_returnsTrimmedTitle() {
        String actual = rules.normalizeTitle(" ready ");
        assertEquals("ready", actual);
    }

    /** 验证完成状态返回 true。 */
    @Test
    void isCompleted_doneStatus_returnsTrue() {
        assertTrue(rules.isCompleted("done"));
    }

    /** 验证待办状态返回 false。 */
    @Test
    void isCompleted_pendingStatus_returnsFalse() {
        assertFalse(rules.isCompleted("pending"));
    }

    /** 验证空白标题抛出精确异常。 */
    @Test
    void normalizeTitle_blankInput_throwsException() {
        IllegalArgumentException error = assertThrows(
            IllegalArgumentException.class,
            () -> rules.normalizeTitle("   ")
        );
        assertEquals("title must not be blank", error.getMessage());
    }
}
JAVA

cat > "$work_dir/source/src/test/java/example/UndiscoveredCheck.java" <<'JAVA'
package example;

import static org.junit.jupiter.api.Assertions.fail;

import org.junit.jupiter.api.Test;

class UndiscoveredCheck {
    /** 如果默认发现规则错误地执行本类，则明确失败。 */
    @Test
    void defaultDiscovery_doesNotSelectCheckSuffix() {
        fail("UndiscoveredCheck must not run");
    }
}
JAVA

cp -R "$work_dir/source/src" "$work_dir/modern-java25/"
cp -R "$work_dir/source/src" "$work_dir/legacy-java8/"
sed 's/@JUNIT_VERSION@/6.1.3/' "$work_dir/pom.template.xml" > "$work_dir/modern-java25/pom.xml"
sed 's/@JUNIT_VERSION@/5.14.4/' "$work_dir/pom.template.xml" > "$work_dir/legacy-java8/pom.xml"

run_feedback() {
  local project="$1"
  local image="$2"
  local junit_version="$3"
  local java_label="$4"
  local repository="$5"

  docker run --rm -i \
    --volume "$work_dir/apache-maven-3.9.16:/opt/maven:ro" \
    --volume "$work_dir/$project:/workspace" \
    --volume "$work_dir/$repository:/tmp/maven-repository" \
    --workdir /workspace \
    "$image" bash -euo pipefail <<CONTAINER
maven=(/opt/maven/bin/mvn -B -ntp -Dstyle.color=never \
  -Dmaven.repo.local=/tmp/maven-repository)
"\${maven[@]}" --version | grep -F 'Apache Maven 3.9.16' >/dev/null
grep -F '<version>$junit_version</version>' pom.xml >/dev/null

capture_maven() {
  local output_file="\$1"
  shift
  if ! "\${maven[@]}" "\$@" >"\$output_file" 2>&1; then
    cat "\$output_file" >&2
    return 1
  fi
  cat "\$output_file"
}

assert_success_report() {
  local report='target/surefire-reports/TEST-example.TaskRulesTest.xml'
  test -s "\$report"
  grep -E 'tests="4"' "\$report" >/dev/null
  grep -E 'errors="0"' "\$report" >/dev/null
  grep -E 'failures="0"' "\$report" >/dev/null
  test ! -e target/surefire-reports/TEST-example.UndiscoveredCheck.xml
}

full_output=\$(capture_maven /tmp/b20-full.log clean test)
grep -F 'Tests run: 4, Failures: 0, Errors: 0, Skipped: 0' <<<"\$full_output" >/dev/null
assert_success_report

selected_output=\$(capture_maven /tmp/b20-selected.log -Dtest=TaskRulesTest test)
grep -F 'Tests run: 4, Failures: 0, Errors: 0, Skipped: 0' <<<"\$selected_output" >/dev/null
assert_success_report

cp src/test/java/example/TaskRulesTest.java /tmp/TaskRulesTest.java.correct
sed -i 's/assertEquals("ready", actual)/assertEquals("wrong", actual)/' \
  src/test/java/example/TaskRulesTest.java
set +e
"\${maven[@]}" -Dtest=TaskRulesTest test >/tmp/b20-negative.log 2>&1
negative_exit=\$?
set -e
test "\$negative_exit" -ne 0
grep -F 'Failures: 1' /tmp/b20-negative.log >/dev/null
negative_report='target/surefire-reports/TEST-example.TaskRulesTest.xml'
grep -E 'failures="1"' "\$negative_report" >/dev/null
grep -F 'wrong' "\$negative_report" >/dev/null
grep -F 'ready' "\$negative_report" >/dev/null
cp /tmp/TaskRulesTest.java.correct src/test/java/example/TaskRulesTest.java

repeat_output=\$(capture_maven /tmp/b20-repeat.log -o clean test)
grep -F 'Tests run: 4, Failures: 0, Errors: 0, Skipped: 0' <<<"\$repeat_output" >/dev/null
assert_success_report

printf '%s\n' \
  'junit|java=$java_label|junit=$junit_version|surefire=3.5.6|tests=4|failures=0|errors=0|selected=true|negative=true|report=true|repeat=true'
CONTAINER
}

run_feedback modern-java25 eclipse-temurin:25-jdk 6.1.3 25 repository-modern
run_feedback legacy-java8 eclipse-temurin:8-jdk 5.14.4 8 repository-legacy
```

预期输出：

```text
junit|java=25|junit=6.1.3|surefire=3.5.6|tests=4|failures=0|errors=0|selected=true|negative=true|report=true|repeat=true
junit|java=8|junit=5.14.4|surefire=3.5.6|tests=4|failures=0|errors=0|selected=true|negative=true|report=true|repeat=true
```

两行摘要只记录稳定断言；Maven exit code、故意失败日志和 Surefire XML 才是权威证据。脚本还放入
一个故意失败但名称不符合默认模式的 `UndiscoveredCheck`，用 tests=4 与报告缺席证明发现规则，而
不是把 tests=0 当成成功。

:::exercise
### 练习：为任务优先级写第一组行为测试

**要求：** 新建 `TaskPriority`，让 `normalize(" HIGH ")` 返回 `high`，`isUrgent("high")` 返回 true，
空白输入抛出 `IllegalArgumentException`。分别使用 equals、布尔和异常断言，测试名写出条件与结果。

**验收：** `mvn test` 执行三条测试且全部通过；把 `high` 的 expected 临时改成 `low` 后必须非零失败；
恢复后定向、整套和重复运行结论一致，Surefire XML 的 tests 为 3。

**参考答案：** 生产类只实现 `normalize` 与 `isUrgent`；测试类命名 `TaskPriorityTest`。每条测试独立
Arrange 输入，Act 调用公开方法，Assert 分别使用 `assertEquals`、`assertTrue` 与 `assertThrows`。
JUnit 依赖保持 test scope，不添加 Mockito、Spring 或外部资源。
:::

## 本节小结

- 被测类实现业务，测试类表达预期，Jupiter 执行模型，Surefire 连接 Maven 和报告。
- `@Test` 只标记入口；精确断言才证明返回值、布尔结果或异常合同。
- AAA 分开准备、调用与判断；测试名应描述方法、条件和可观察结果。
- 默认新测试实例不等于所有状态隔离，单类、整套和重复运行都要保持一致。
- 退出码、非零测试数、失败详情与 XML 报告共同证明测试反馈环真实执行。
- Java 25 使用 JUnit 6.1.3；Java 8 使用独立的 JUnit 5.14.4 兼容线。
