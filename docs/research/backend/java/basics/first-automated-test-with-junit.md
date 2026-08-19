# 第一条自动化测试：JUnit、断言与测试结构研究记录

## 冻结课程合同

- `batch`：`B-20`
- `courseId`：`backend.java.learn.basics.first-automated-test-with-junit`
- `title`：第一条自动化测试：JUnit、断言与测试结构
- `nature`：必修、新增
- `purpose / collection / level / depth`：`learn / basics / beginner / lesson`
- `sequence`：`280`
- `estimatedMinutes`：`75`
- `prerequisites`：`[backend.java.learn.basics.maven-project-model]`
- `related`：`[]`
- `sourceCapabilityIds`：`[]`
- `origin`：`[necessary-prerequisite]`
- `selectionReason`：在 B-21 阶段项目前建立第一条可重复、可失败、可定位的 Maven/JUnit
  测试反馈环。
- `projectEvidence`：`[]`；本课是独立基础前置，不读取或复用 `dzzz-app` 测试源码。
- `modernBaseline`：`Java 25 LTS / Maven 3.9.16 / JUnit 6.1.3 / Maven Surefire 3.5.6`
- `legacyBaseline`：`Java 8 / Maven 3.9.16 / JUnit 5.14.4 / Maven Surefire 3.5.6`
- Phase B 路线：`B-20`；B-19 已关闭后启动。研究稿完成不等于 B-20 发布或关闭。
- 冻结停止边界：B-20 完整关闭前不得开始 B-21；B-21 基础 Gate 关闭后立即停止，不进入
  Phase C。

本课只讲 JUnit Jupiter 最小编程模型、断言、Arrange-Act-Assert、测试命名、基础生命周期和 Maven
测试反馈环。Mockito、Spring 测试切片和集成测试均不进入本课。

## 核验基线与方法

| 项目 | 核验结果 |
| --- | --- |
| 核验日期 | 2026-08-15 |
| 现代 Java | Oracle 支持路线将 Java 25 列为 LTS；Java SE 25 API 页面可达 |
| 现代 JUnit | JUnit 6.1.3；官方版本导航标为 latest，Release Notes 记录 2026-08-07 发布 |
| 现代运行边界 | JUnit 6 要求 Java 17+；Java 25 可以运行，Java 8 不可以运行 |
| Java 8 兼容线 | JUnit 5.14.4；官方 Overview 明确 JUnit 5 要求 Java 8+ |
| Maven | 延续前置 B-19 的 Maven 3.9.16；本课只增加测试反馈环，不重复项目模型课程 |
| Surefire | 3.5.6 为当前稳定版；3.6.0-M1 是里程碑版，不进入稳定主线 |
| 发现方式 | 使用 Tavily 发现候选页，再逐页直接核对 JUnit、Apache Maven 和 Oracle 官方页面 |
| 项目证据 | 新增必修前置，`sourceCapabilityIds` 与 `projectEvidence` 均为空 |
| 研究边界 | 本批只完成一手资料、课程验收和临时反馈环设计；不实施正文或 fixture |

`JUnit 6.1.3` 是当前整体稳定主线，`JUnit 5.14.4` 只用于 Java 8 兼容反馈。不能把两者放进同一个
POM，也不能仅凭源码能用 `--release 8` 编译，就宣称 JUnit 6 可以在 Java 8 运行。

## 官方页面可达性

以下结果为 2026-08-15 使用直接 URL、跟随重定向后的 HTTP 状态。所有课程结论只使用一手页面，
没有把 Tavily 摘要或社区文章作为证据。

| 官方页面 | 适用版本 | HTTP 状态 |
| --- | --- | ---: |
| [JUnit 6.1.3 Release Notes](https://docs.junit.org/6.1.3/release-notes.html) | JUnit 6.1.3 | 200 |
| [JUnit 6.1.3 Overview](https://docs.junit.org/6.1.3/overview.html) | JUnit 6.1.3 | 200 |
| [JUnit Jupiter Test API](https://docs.junit.org/6.1.3/api/org.junit.jupiter.api/org/junit/jupiter/api/Test.html) | JUnit Jupiter 6.1.3 | 200 |
| [JUnit Jupiter Assertions API](https://docs.junit.org/6.1.3/api/org.junit.jupiter.api/org/junit/jupiter/api/Assertions.html) | JUnit Jupiter 6.1.3 | 200 |
| [JUnit Jupiter BeforeEach API](https://docs.junit.org/6.1.3/api/org.junit.jupiter.api/org/junit/jupiter/api/BeforeEach.html) | JUnit Jupiter 6.1.3 | 200 |
| [JUnit Jupiter AfterEach API](https://docs.junit.org/6.1.3/api/org.junit.jupiter.api/org/junit/jupiter/api/AfterEach.html) | JUnit Jupiter 6.1.3 | 200 |
| [Test Classes and Methods](https://docs.junit.org/6.1.3/writing-tests/test-classes-and-methods.html) | JUnit Jupiter 6.1.3 | 200 |
| [Display Names](https://docs.junit.org/6.1.3/writing-tests/display-names.html) | JUnit Jupiter 6.1.3 | 200 |
| [Test Instance Lifecycle](https://docs.junit.org/6.1.3/writing-tests/test-instance-lifecycle.html) | JUnit Jupiter 6.1.3 | 200 |
| [JUnit Build Support](https://docs.junit.org/6.1.3/running-tests/build-support.html) | JUnit 6.1.3 / Maven | 200 |
| [JUnit 5.14.4 Release Notes](https://docs.junit.org/5.14.4/release-notes.html) | JUnit 5.14.4 | 200 |
| [JUnit 5.14.4 Overview](https://docs.junit.org/5.14.4/overview.html) | JUnit 5.14.4 / Java 8 | 200 |
| [Maven Surefire Plugin 3.5.6](https://maven.apache.org/surefire-archives/surefire-3.5.6/maven-surefire-plugin/) | Surefire 3.5.6 | 200 |
| [Surefire 3.5.6 Plugin Details](https://maven.apache.org/surefire-archives/surefire-3.5.6/maven-surefire-plugin/plugin-info.html) | Surefire 3.5.6 | 200 |
| [Surefire JUnit Platform](https://maven.apache.org/surefire-archives/surefire-3.5.6/maven-surefire-plugin/examples/junit-platform.html) | Surefire 3.5.6 | 200 |
| [Running a Single Test](https://maven.apache.org/surefire-archives/surefire-3.5.6/maven-surefire-plugin/examples/single-test.html) | Surefire 3.5.6 | 200 |
| [Maven 3.9.16 Release Notes](https://maven.apache.org/docs/3.9.16/release-notes.html) | Maven 3.9.16 | 200 |
| [Maven Installation](https://maven.apache.org/install.html) | Maven 3.9.16 / Java 8+ | 200 |
| [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) | Java 25 / Java 8 | 200 |
| [Java SE 25 API](https://docs.oracle.com/en/java/javase/25/docs/api/index.html) | Java 25 | 200 |
| [Java SE 8 API](https://docs.oracle.com/javase/8/docs/api/) | Java 8 | 200 |

## 一手来源与关键结论

### 1. JUnit、Platform、Jupiter 不是三个可互换名称

- [JUnit 6.1.3 Overview](https://docs.junit.org/6.1.3/overview.html) 明确：JUnit 6.1.3 由
  JUnit Platform、JUnit Jupiter 和 JUnit Vintage 组成。
- Platform 负责在 JVM 上启动测试框架并定义 `TestEngine`；Jupiter 提供编写测试的编程模型、扩展
  模型和对应引擎；Vintage 只用于运行 JUnit 3/4 旧测试，而且已经弃用。
- B-20 只使用 Jupiter。正文第一次出现依赖时应说明 `org.junit.jupiter:junit-jupiter` 是包含 API
  与引擎的聚合依赖，避免只添加注解 API 却没有可执行引擎。
- 本课不教 Vintage、JUnit 4 迁移或自定义 Engine；这些概念只用于解释为什么 import 必须是
  `org.junit.jupiter.api.Test`。

### 2. 现代线和 Java 8 线必须使用不同 JUnit 大版本

- [JUnit 6.1.3 Overview](https://docs.junit.org/6.1.3/overview.html) 明确 JUnit 6 运行时要求
  Java 17+，但可以测试由更早 JDK 编译的被测代码。
- Java 25 满足这个运行时要求；[Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html)
  将 Java 25 列为 LTS，因此现代 fixture 固定 Java 25 + JUnit 6.1.3。
- [JUnit 5.14.4 Overview](https://docs.junit.org/5.14.4/overview.html) 明确 JUnit 5 运行时要求
  Java 8+；兼容 fixture 固定 Java 8 + JUnit 5.14.4。
- “JUnit 6 能测试 Java 8 编译的业务类”不等于“JUnit 6 能由 Java 8 启动”。课程必须分别记录
  测试运行 JDK、被测源码目标版本和 JUnit 版本。

### 3. `@Test` 标记测试方法，不负责断言

- [JUnit Jupiter Test API](https://docs.junit.org/6.1.3/api/org.junit.jupiter.api/org/junit/jupiter/api/Test.html)
  定义 `@Test` 用于表明被标注方法是测试方法。
- Jupiter 的 `@Test` 方法不能是 `private` 或 `static`，不能返回值；本课使用包可见、无参数、
  `void` 方法，暂不引入参数解析扩展。
- 测试类和测试方法不必声明为 `public`。正文必须明确这是 Jupiter 的可见性合同，不能照搬 JUnit 4
  的公开方法样板。
- `@Test` 本身不会验证结果。方法能正常结束只证明“没有异常中断”，业务行为仍需要断言表达预期。

### 4. 断言把预期结果和实际结果变成可执行合同

- [JUnit Jupiter Assertions API](https://docs.junit.org/6.1.3/api/org.junit.jupiter.api/org/junit/jupiter/api/Assertions.html)
  定义 Jupiter 内置断言；本课只讲 `assertEquals`、`assertTrue`、`assertFalse` 和 `assertThrows`。
- `assertEquals(expected, actual)` 的预期值在前、实际值在后。顺序写反通常仍能失败，但报告含义会
  颠倒，降低定位速度。
- `assertTrue`/`assertFalse` 适合布尔业务合同；不要用 `assertEquals(true, condition)` 降低可读性。
- `assertThrows(ExpectedType.class, executable)` 只包住预期抛错的调用，并返回捕获到的异常，后续可
  检查稳定的消息或 cause。不能用宽泛 `Exception.class` 掩盖错误类型。
- 失败消息只有能补充业务上下文时才添加；不要把被测逻辑复制进消息。Supplier 形式只在消息计算
  有成本时才需要，本课不扩展高级断言 API。

### 5. Arrange-Act-Assert 是教学结构，不是 JUnit 语法

- Arrange 准备输入和被测对象，Act 只调用本次要观察的行为，Assert 对实际结果做精确断言。
- JUnit 官方 API 不要求代码必须出现这三个注释，也不规定一个固定排版。本课把 AAA 用作零基础读者
  的检查清单，不把工程约定写成框架规则。
- 简单测试可省略注释，但三种职责仍应能被读者一眼区分。Act 区只保留目标调用，尤其是
  `assertThrows` 的 lambda 内不能混入不相关准备步骤。
- “一个测试一个行为”是本课的可读性约定，不等于“一个测试只能有一条 Java 断言”；同一行为的
  必要结果可以一起验证，但不同触发条件应拆成独立测试。

### 6. 默认每个测试方法使用新的测试实例

- [Test Instance Lifecycle](https://docs.junit.org/6.1.3/writing-tests/test-instance-lifecycle.html)
  明确 Jupiter 默认使用 `PER_METHOD`：每个测试方法执行前创建一个新的测试类实例，以减少可变字段
  带来的意外副作用。
- 默认实例隔离不包括 `static` 字段、外部文件、数据库或系统属性；本课不得据此宣称所有测试天然隔离。
- `PER_CLASS` 会让全部测试方法共享同一个实例，容易让初学者依赖执行顺序。本课只说明边界，不使用
  `@TestInstance(PER_CLASS)`。
- 测试之间不得通过字段或执行顺序传递结果；每个测试单独运行和整类运行都应得到相同结论。

### 7. `@BeforeEach` 用于重复准备，`@AfterEach` 用于真实清理

- [BeforeEach API](https://docs.junit.org/6.1.3/api/org.junit.jupiter.api/org/junit/jupiter/api/BeforeEach.html)
  规定被标注方法在每个测试前执行，返回 `void` 且不能为 `static`。
- [AfterEach API](https://docs.junit.org/6.1.3/api/org.junit.jupiter.api/org/junit/jupiter/api/AfterEach.html)
  规定被标注方法在每个测试后执行，签名边界相同。
- `@BeforeEach` 只提取真正重复且不会隐藏关键输入的准备。当前测试的特殊输入继续写在测试方法中，
  否则失败时需要在多个位置拼接上下文。
- `@AfterEach` 只用于确实需要释放或恢复的状态；纯对象测试没有清理动作时不要为了展示注解而添加
  空方法。
- 同一个类中的多个 `@BeforeEach` 或多个 `@AfterEach` 方法没有可依赖的明显声明顺序；本课每种至多
  使用一个，复杂资源所有权留给后续测试课程。

### 8. 测试名称要表达行为，显示名称只负责报告展示

- [Display Names](https://docs.junit.org/6.1.3/writing-tests/display-names.html) 允许通过
  `@DisplayName` 为测试类或方法提供显示名称，并定义显示名称优先级。
- Java 方法名应使用可检索的业务词，课程 house style 冻结为
  `method_condition_expectedResult`，例如 `normalizeTitle_blankInput_throwsException`。这是一项课程
  命名约定，不是 JUnit 语法要求。
- `@DisplayName` 可补充面向报告读者的中文描述，但不能用来掩盖 `test1`、`works`、`success` 之类
  空泛方法名。即使去掉注解，源码中的行为仍应可理解。
- 测试名描述“输入条件 + 可观察结果”，不写私有实现步骤，也不把 `should` 当作没有业务名词的模板。

### 9. Surefire 把 Maven `test` 阶段连接到 JUnit Platform

- [JUnit Build Support](https://docs.junit.org/6.1.3/running-tests/build-support.html) 说明 Maven
  Surefire 原生支持 JUnit Platform；JUnit 6.0 起要求 Surefire/Failsafe 至少为 3.0.0。
- [Maven Surefire Plugin 3.5.6](https://maven.apache.org/surefire-archives/surefire-3.5.6/maven-surefire-plugin/)
  明确 Surefire 在 Maven `test` 阶段执行应用单元测试，并生成文本与 XML 报告。
- [Surefire 3.5.6 Plugin Details](https://maven.apache.org/surefire-archives/surefire-3.5.6/maven-surefire-plugin/plugin-info.html)
  明确 3.5.6 的最低运行要求是 Maven 3.6.3 与 JDK 8；因此前置 B-19 的 Maven 3.9.16 可同时服务
  Java 25 和 Java 8 两条反馈线。
- POM 应把 `org.junit.jupiter:junit-jupiter` 放在 `test` scope，并固定 Surefire 3.5.6；测试依赖不应
  进入生产运行 classpath。

### 10. 文件名、退出码和报告共同构成最小反馈环

- [JUnit Build Support](https://docs.junit.org/6.1.3/running-tests/build-support.html) 记录 Surefire
  默认扫描 `Test*.java`、`*Test.java`、`*Tests.java` 和 `*TestCase.java`；本课统一使用
  `<Subject>Test.java`。
- `mvn test` 的 exit code 是自动化判断入口：正确断言为 `0`，故意失败的断言必须为非零。不能只看
  控制台是否打印某句话。
- Surefire 3.5.6 默认把报告写入 `target/surefire-reports`。反馈环同时核对 XML 中的 tests、failures、
  errors 和 skipped，避免“命令成功但测试为 0”假绿。
- [Running a Single Test](https://maven.apache.org/surefire-archives/surefire-3.5.6/maven-surefire-plugin/examples/single-test.html)
  说明可使用 `mvn -Dtest=TaskRulesTest test` 运行单个测试类；定向运行不能替代最终整套 `mvn test`。

## 课程内容与验收冻结

正式课程在 75 分钟内按以下 14 个小知识点展开。每个小知识点都必须回答“它是什么、有什么作用、
什么时候使用、怎么使用、最小示例、运行结果、常见误区”，不能把清单压成一段概念摘要。

1. 自动化测试是什么：相同输入和规则可重复执行，并用退出状态表达通过或失败。
2. 被测代码、测试代码与测试运行器分别承担什么职责。
3. Maven 的 `src/main/java`、`src/test/java` 和 `test` scope 如何分隔生产与测试代码。
4. Platform、Jupiter 与 Vintage 的最小角色区分；本课只使用 Jupiter。
5. 第一条 `@Test` 如何被发现；测试类和方法为什么不必 `public`。
6. Arrange-Act-Assert 如何把输入、调用和观察结果分开。
7. `assertEquals(expected, actual)` 如何比较预期与实际。
8. `assertTrue` 与 `assertFalse` 如何表达布尔合同。
9. `assertThrows` 如何限定抛错调用并检查稳定的异常属性。
10. 测试方法名和 `@DisplayName` 如何帮助源码检索与失败报告。
11. 默认 `PER_METHOD` 实例生命周期如何减少字段状态泄漏。
12. `@BeforeEach` 何时提取重复准备，`@AfterEach` 何时执行真实清理。
13. `mvn test`、Surefire 发现规则、退出码和 XML 报告如何组成反馈环。
14. 单类定向运行、整套运行和重复运行分别证明什么，为什么测试数必须大于零。

### 学习目标

课程正文完成后，学习者必须能够：

- 用自己的话区分生产代码、测试代码、Jupiter 和 Surefire。
- 在最小 Maven 项目中添加正确 scope 的 Jupiter 依赖和固定版本的 Surefire 插件。
- 使用 `@Test` 与 AAA 结构写出一条可失败的行为测试。
- 根据行为选择 `assertEquals`、布尔断言或 `assertThrows`，并正确排列 expected/actual。
- 使用可检索的方法名描述触发条件与可观察结果，必要时补充 `@DisplayName`。
- 解释默认测试实例生命周期，并避免测试通过共享状态或顺序互相依赖。
- 从 Maven exit code、测试计数、失败详情和 Surefire XML 判断反馈环是否真实执行。
- 说明为什么 Java 25/JUnit 6.1.3 与 Java 8/JUnit 5.14.4 必须分线运行。

### 正文结构决策

1. 从“手工运行一次并不能保证下一次”开始，不先堆 Platform/Jupiter 模块名。
2. 先展示一个会通过的纯行为测试，再故意改错 expected 让同一测试失败，证明断言确实参与退出状态。
3. 第一条测试只使用 `assertEquals`；布尔与异常断言作为同一被测类的后续独立行为。
4. AAA 是阅读顺序，不强制在每个三行测试中写三条注释。
5. 用两个独立测试证明默认实例不共享字段；不通过排序注解制造顺序依赖。
6. `@BeforeEach` 只提取被测对象的重复创建；无真实资源时不添加空 `@AfterEach`。
7. 同时展示 Maven 控制台摘要、非零失败退出码和 `target/surefire-reports` XML，不以截图代替文本证据。
8. Java 8 补充复用同一份 Java 8 兼容源码，只替换 JUnit 版本和编译运行 JDK。

## `/tmp` 可复跑反馈环设计

研究阶段不创建或执行 fixture。课程实施阶段在 `mktemp` 目录建立两套独立 Maven 工程，所有源码、
POM、本地 Maven 仓库、报告和故意失败改动都留在 `/tmp`，验收后使用 `find -depth -delete` 清理。

### 临时结构

```text
java-junit-b20-fixture/
├── modern-java25/
│   ├── pom.xml
│   └── src/
│       ├── main/java/example/TaskRules.java
│       └── test/java/example/TaskRulesTest.java
├── legacy-java8/
│   ├── pom.xml
│   └── src/
│       ├── main/java/example/TaskRules.java
│       └── test/java/example/TaskRulesTest.java
└── repository/
```

- 两套工程的 `TaskRules.java` 与 `TaskRulesTest.java` 字节一致，只使用 Java 8 已支持的类、方法、
  lambda 和 Jupiter 基础 API。
- `modern-java25` 固定 JUnit 6.1.3、Surefire 3.5.6，由 Java 25 编译和执行。
- `legacy-java8` 固定 JUnit 5.14.4、Surefire 3.5.6，由真实 Java 8 编译和执行。
- 使用隔离的 `maven.repo.local`，防止用户已有缓存让缺失依赖或错误版本假绿。
- 被测类只提供标题规范化和完成状态判断，不读文件、不启动线程、不访问网络或框架容器。

### 最小测试行为

1. `normalizeTitle_outerWhitespace_returnsTrimmedTitle`：AAA + `assertEquals`。
2. `isCompleted_doneStatus_returnsTrue`：`assertTrue`。
3. `isCompleted_pendingStatus_returnsFalse`：`assertFalse`。
4. `normalizeTitle_blankInput_throwsException`：`assertThrows` 并检查稳定消息。
5. 两个测试通过 `@BeforeEach` 分别得到新的 `TaskRules`；单类、整套和第二次运行结果相同。

四类业务合同只依赖公开方法。不得断言私有方法、反射字段、控制台完整文本或测试方法执行顺序。

### 执行与断言

1. 分别记录两个固定 JDK 的 `java -version` 和 `mvn -v`，确认测试实际由 Java 25/Java 8 启动。
2. 对现代工程运行 `mvn -B -ntp test`；要求 exit `0`、tests `4`、failures/errors/skipped 均为 `0`。
3. 运行 `mvn -B -ntp -Dtest=TaskRulesTest test`；要求只选择目标类且 tests 仍为 `4`。
4. 只在临时副本把一个 expected 改错，复跑同一命令；要求 exit 非零、failures `1`、错误报告同时
   显示 expected 与 actual，证明失败路径可观察。
5. 恢复正确断言，连续两次运行整套测试；要求计数一致，没有跨运行共享状态。
6. 对 Java 8 工程执行同样的整套、定向和重复运行；要求同一测试源码全部通过。
7. 检查两套 `target/surefire-reports/TEST-*.xml` 存在并可解析，不能只匹配控制台 `BUILD SUCCESS`。
8. 记录 POM 与源码 SHA-256、命令、exit code、Surefire 摘要和报告计数。
9. 清理临时根目录后断言路径不存在；仓库中不得留下测试、fixture、报告或截图。

### 建议的稳定证据摘要

```text
junit|java=25|junit=6.1.3|surefire=3.5.6|tests=4|failures=0|errors=0|selected=true|repeat=true
junit|java=8|junit=5.14.4|surefire=3.5.6|tests=4|failures=0|errors=0|selected=true|repeat=true
junit-negative|java=25|tests=4|failures=1|exitNonZero=true|expectedActual=true|report=true
```

摘要只便于人工比较；真实 Maven 输出、exit code 和 Surefire XML 才是权威反馈证据。

## 易错点取证矩阵

| 易错点 | 原因与后果 | 正确处理 | 反馈要求 |
| --- | --- | --- | --- |
| import `org.junit.Test` | 混入 JUnit 4 API，不是本课 Jupiter 模型 | 使用 `org.junit.jupiter.api.Test` | 编译源码并检查依赖树无 JUnit 4/Vintage |
| 只加入 `junit-jupiter-api` | 缺少引擎时可能没有测试可执行 | 初学主线使用 `junit-jupiter` 聚合依赖 | tests 必须为 4，禁止 tests=0 假绿 |
| 忘记 `test` scope | 测试库泄漏到生产 classpath | JUnit 依赖声明 `test` | dependency tree 分开核对 scope |
| 类名不符合 Surefire 默认模式 | 测试源码已编译但未被默认扫描 | 使用 `<Subject>Test.java` | 整套运行测试数必须大于 0 |
| 把 expected/actual 写反 | 报告语义颠倒，定位困难 | `assertEquals(expected, actual)` | 故意失败报告核对两侧值 |
| 测试没有断言 | 只证明调用未抛异常，不证明返回合同 | 对公开结果使用精确断言 | 错 expected 必须导致非零退出 |
| `assertThrows` 包住准备代码 | 不相关语句抛同类异常也会误通过 | lambda 只包含 Act 调用 | 负例先在准备阶段抛错，修正后拒绝误通过 |
| 使用宽泛异常类型 | 错误原因变化仍可能通过 | 断言最具体稳定类型和必要属性 | 错误异常类型必须失败 |
| 测试依赖执行顺序 | 单独运行或顺序改变时失败 | 每个测试独立 Arrange；不用共享 static 状态 | 单类、整套、重复运行一致 |
| `@BeforeEach` 隐藏特殊输入 | 失败上下文分散，读者看不出触发条件 | 只提取真正重复的通用准备 | 测试方法中保留本行为输入 |
| 添加空 `@AfterEach` | 把注解展示误当资源所有权 | 只有真实清理职责才使用 | 纯对象 fixture 不保留空清理 |
| 多个生命周期方法依赖声明顺序 | Jupiter 不保证明显的声明顺序 | 每类每种生命周期方法至多一个 | 不写顺序敏感断言 |
| 用 `@DisplayName` 掩盖 `test1` | 源码搜索与重构仍缺少语义 | 方法名表达条件和结果，显示名只补报告 | 去掉显示名后方法仍可读 |
| Java 8 运行 JUnit 6 | JUnit 6 的最低运行时是 Java 17 | Java 8 使用独立 JUnit 5.14.4 POM | 真实 Java 8 runtime 运行，不能只用 `--release 8` |

## 明确排除项

以下内容不进入 B-20 正文、示例、练习或反馈环：

- Mockito、mock、stub、spy、verify、captor、`MockitoExtension` 和测试替身设计；
- Spring Test、`@SpringBootTest`、MockMvc、WebTestClient、Controller test slice 和 context cache；
- 集成测试、Maven Failsafe、Testcontainers、WireMock、真实数据库、Redis 和外部 HTTP；
- JUnit 4/Vintage 迁移、Runner/Rule、参数化测试、动态测试、嵌套测试和自定义扩展；
- 并行测试、测试顺序控制、重试、flaky test 治理、覆盖率门槛和性能基准；
- TDD、红绿重构或测试金字塔方法论；本课只建立第一条可验证反馈环；
- 对私有方法或实现字段的反射断言，以及只依赖快照/完整字符串的大型断言。

上述职责分别留给 I-14 Service/JUnit/Mockito、I-15 Controller/MockMvc/test slice、A-05 Spring Boot
集成测试/WireMock，以及后续数据库、Redis 专项。

## 正式正文来源卡计划

正式课程 frontmatter 只登记实际支撑正文结论的直接页面，建议使用以下稳定 ID；实施时必须按 live
正文精确删减未引用来源，不得为凑数量堆链接。

| source ID | 页面 | sourceType | appliesTo | 核心 claims |
| --- | --- | --- | --- | --- |
| `junit-6-release-notes` | JUnit 6.1.3 Release Notes | `release-note` | JUnit 6.1.3 | 当前稳定版本和发布日期 |
| `junit-6-overview` | JUnit 6.1.3 Overview | `official-reference` | JUnit 6.1.3 | Platform/Jupiter/Vintage 职责；Java 17+ 运行边界 |
| `junit-test-api` | JUnit Jupiter Test API | `api-doc` | JUnit Jupiter 6.1.3 | `@Test` 身份与方法签名 |
| `junit-assertions-api` | JUnit Jupiter Assertions API | `api-doc` | JUnit Jupiter 6.1.3 | equals、布尔、异常断言语义 |
| `junit-before-each-api` | JUnit Jupiter BeforeEach API | `api-doc` | JUnit Jupiter 6.1.3 | 每个测试前执行和签名边界 |
| `junit-after-each-api` | JUnit Jupiter AfterEach API | `api-doc` | JUnit Jupiter 6.1.3 | 每个测试后执行和签名边界 |
| `junit-test-classes` | Test Classes and Methods | `official-reference` | JUnit Jupiter 6.1.3 | 标准测试类结构与可见性 |
| `junit-display-names` | Display Names | `official-reference` | JUnit Jupiter 6.1.3 | 显示名称和优先级 |
| `junit-instance-lifecycle` | Test Instance Lifecycle | `official-reference` | JUnit Jupiter 6.1.3 | 默认 `PER_METHOD` 与共享状态边界 |
| `junit-maven-support` | JUnit Build Support | `official-reference` | JUnit 6.1.3 / Maven | Jupiter 依赖、Surefire 最低版和默认发现模式 |
| `junit-5-java8` | JUnit 5.14.4 Overview | `official-reference` | JUnit 5.14.4 / Java 8 | Java 8 运行时兼容线 |
| `surefire-3-5-6` | Maven Surefire Plugin 3.5.6 | `official-reference` | Surefire 3.5.6 | test phase、单元测试与报告 |
| `surefire-requirements` | Surefire 3.5.6 Plugin Details | `official-reference` | Surefire 3.5.6 | Maven 3.6.3 / JDK 8 最低要求 |
| `surefire-single-test` | Running a Single Test | `official-reference` | Surefire 3.5.6 | `-Dtest` 定向反馈 |
| `oracle-java-roadmap` | Oracle Java SE Support Roadmap | `official-reference` | Java 25 / Java 8 | Java 25 LTS 与 Java 8 legacy 边界 |

## 研究 Gate 自检

- [x] B-20 身份、必修新增性质、75 分钟、B-19 唯一前置和 `sequence: 280` 已冻结。
- [x] Java 25/JUnit 6.1.3 现代线与 Java 8/JUnit 5.14.4 兼容线已分开。
- [x] Maven 3.9.16 与 Surefire 3.5.6 的双 JDK 运行边界已核验。
- [x] `@Test`、基础断言、默认实例生命周期、`@BeforeEach`、`@AfterEach` 和显示名称均有直接
  JUnit 6.1.3 页面。
- [x] Maven `test`、默认发现模式、报告目录和 `-Dtest` 定向运行均有直接 JUnit/Maven 页面。
- [x] 21 个唯一官方 URL 全部直接请求为 HTTP 200；社区来源使用数量为 0。
- [x] 14 个零基础知识点、学习目标、正文决策、易错点和 `/tmp` 双版本反馈环已冻结。
- [x] AAA 已标明为教学结构，不冒充 JUnit 语法；没有自动扩展为 TDD 方法论。
- [x] Mockito、Spring 测试切片、集成测试及后续课程职责已明确排除。
- [x] 本研究未创建 fixture，未实施课程正文，未修改 track、loader、manifest 或 signoff。

## Stop Boundary

本研究记录只服务 Phase B 的 B-20 `first-automated-test-with-junit`。研究稿完成不等于课程已发布；
只有 B-20 正文、Java 25/8 临时反馈环、track/loader、工程 Gate、浏览器验收、复杂改动独立复审和
signoff 全部通过后，才可宣布 B-20 关闭并开始 B-21。当前研究任务在本文件格式、链接、diff 与
SHA-256 核验后停止，不读取或启动 B-21，不进入 Phase C。
