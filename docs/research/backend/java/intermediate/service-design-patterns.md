# 策略、模板方法、适配器与回调研究稿

## 冻结课程合同

| 项目 | 冻结值 |
| --- | --- |
| 课程 ID | `backend.java.learn.intermediate.service-design-patterns` |
| 标题 | 策略、模板方法、适配器与回调 |
| 阶段与单元 | `intermediate`；Phase C `I-18`；必修；150 分钟 |
| 唯一前置课程 | I-17 `backend.java.learn.intermediate.lombok-and-generated-contracts` |
| 来源能力 | `JAVA-ENGINEERING-007`、`JAVA-ENGINEERING-008`、`JAVA-ENGINEERING-011`、`JAVA-ENGINEERING-012` |
| 来源性质 | `project-observed` |
| 选择原因 | 项目已出现这些协作形态；合并讲解可避免把单一模式拆成无必要的百科课程。 |
| 现代基线 | Java 25 LTS、Spring Boot 4.1.0、Spring Framework 7.0.8；fixture 保持纯 Java |
| 兼容基线 | Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE |
| 本批范围 | 只完成官方一手来源研究与本稿回写；不声明课程正文、fixture 或 signoff 已完成 |
| 冻结快照 | `dzzz-app-20260803-179e722831ab`；分析 `dzzz-app-analysis-20260803-958d37cf1be1` |
| 项目边界 | 只读取冻结审计产物；不读取、运行或修改 `dzzz-app`，不把项目现状当推荐写法 |
| 停止边界 | 本稿只完成 Phase C I-18 研究，不修改课程正文，不读取或开始 I-19 及后续课程 |

## 研究范围与教学边界

本课只回答服务内部的四类协作问题：如何替换一段算法，如何固定一条流程并开放有限步骤，如何把
已有接口翻译成服务所需端口，以及如何把进度或结果通知交回调用者。

| 主题 | 本课要建立的合同 | 不应扩张到的主题 |
| --- | --- | --- |
| Strategy | 上下文依赖稳定策略接口，调用方或路由器选择具体算法 | 工厂、注册表和服务定位器的完整设计 |
| Template Method | 骨架方法固定步骤次序，子类只实现受控原语或钩子 | 责任链、状态机和通用工作流引擎 |
| Adapter | 适配器把目标端口映射到已有对象，并显式定义、正确映射异常、所有权和生命周期语义 | 装饰器、门面或外部系统韧性的完整课程 |
| Callback | 宿主定义调用时机，回调定义通知动作；明确同步性、顺序、次数和失败传播 | 事件总线、消息队列和异步调度模型 |
| 组合 | 模板可调用策略和回调；策略可由适配器实现 | 把所有角色塞进一个抽象层或只按类名判断模式 |

GoF 模式名称属于课程的设计分析。Oracle 和 Spring 的规范、Javadoc 能直接证明语言与 API 合同，
但没有把下列全部 API 宣称为某个 GoF 模式。课程必须写成“用该 API 说明这种协作机制”，不能把
教学归类伪装成官方原话。

## 核验基线与研究方法

- 核验日期：2026-08-16。
- Oracle 支持路线页面更新于 2026-08-04，把 Java 25 列为 2025 年 9 月发布的 LTS；同一页面已经
  列出 Java 26 non-LTS，因此本课可以称 Java 25 为现代 LTS 基线，不能称它为当前最新 feature
  release。
- 本批先用 Tavily 对 Oracle 与 Spring 官方域名做三组定向检索，均遇到套餐用量上限；随后按仓库
  回退顺位使用 Exa 发现官方入口，并回到 Oracle、Spring 与 Fowler 原页核验。搜索摘要和社区文章
  不进入最终证据链。
- 本稿 36 张来源卡与当前课程 frontmatter 的 15 个来源 URL 均经逐条 GET 返回 HTTP 200；状态码只
  证明本次可访问，具体结论仍以对应规范或 Javadoc 原文为准。
- 现代主线先用 Java 25 规范和标准库建立可执行合同。Spring Framework 7.0.8 的 `JdbcTemplate`
  只用于证明“模板固定流程 + callback 参数化”的组合边界，不把本课改写成 Spring JDBC 课程。
- legacy 线固定在 Java 8、Spring Boot 2.3.12.RELEASE 和 Spring Framework 5.2.15.RELEASE。
  不能用 Java 25 编译或运行一次，就反推旧版 Spring Boot 获得官方支持。
- 研究阶段只冻结来源、结论、项目证据和 fixture 设计。下方命令、固定输出和 class major 均是
  待执行验收合同，不是本研究批的运行证据；Catalog 发布、页面检查和独立 signoff 仍由课程批次
  Gate 单独记录。

## 官方来源卡与直接证据

### 现代 Java 25 主线

| ID | 第一方直接来源 | sourceType | 适用版本 | 支持结论 |
| --- | --- | --- | --- | --- |
| `oracle-java-support-roadmap` | [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) | `official-reference` | 2026-08-16 页面状态 | Java 25 是 LTS；Java 26 是后续 non-LTS，课程以 25 作为稳定主线。 |
| `spring-boot-4-1-system-requirements` | [Spring Boot 4.1.0 System Requirements](https://docs.spring.io/spring-boot/system-requirements.html) | `official-reference` | 2026-08-16 页面状态 | Spring Boot 4.1.0 要求至少 Java 17、兼容至 Java 26，并要求 Spring Framework 7.0.8 或以上。 |
| `jls25-functional-interface` | [JLS 25 §9.8 Functional Interfaces](https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.8) | `specification` | Java 25 | 函数式接口不得声明为 `sealed`；排除 `Object` 公有实例方法后形成单一抽象函数合同；lambda 和方法引用可创建其实例。 |
| `jls25-functional-interface-annotation` | [JLS 25 §9.6.4.9 `@FunctionalInterface`](https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.6.4.9) | `specification` | Java 25 | 错误标注非函数式接口产生编译错误；函数式接口不强制标注该注解。 |
| `jls25-lambda` | [JLS 25 §15.27 Lambda Expressions](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.27) | `specification` | Java 25 | lambda 是 poly expression，依赖兼容函数式接口目标类型；求值创建接口实例但不立即执行其方法体。 |
| `jls25-final-method` | [JLS 25 §8.4.3.3 `final` Methods](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.3.3) | `specification` | Java 25 | `final` 方法不能被覆盖；本来源不负责证明课程应在何时选择 `final`。 |
| `jvms25-class-version` | [JVMS 25 §4.1 The `ClassFile` Structure](https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-4.html#jvms-4.1) | `specification` | Java 25 | Java SE 25 JVM 支持 45 至 69 的 class major version；现代 fixture 应产生 major 69。 |
| `java25-functional-interface-api` | [Java 25 `FunctionalInterface`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/FunctionalInterface.html) | `api-doc` | Java 25 | 注解表达设计意图并启用编译检查；没有注解但满足 JLS 定义的接口仍可作为 lambda 目标。 |
| `java25-comparator` | [Java 25 `Comparator`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Comparator.html) | `api-doc` | Java 25 | 比较函数可传给排序方法或有序集合以替换排序规则；全序是硬合同，与 `equals` 一致并非强制，但不一致应明确且会影响有序集合合同。 |
| `java25-consumer` | [Java 25 `Consumer`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/function/Consumer.html) | `api-doc` | Java 25 | `Consumer<T>` 接收一个输入且无返回值，预期通过副作用工作；`andThen` 按先当前后后续的顺序调用。 |
| `java25-function` | [Java 25 `Function`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/function/Function.html) | `api-doc` | Java 25 | `Function<T, R>` 表达输入到输出的转换，并可用 `compose` 与 `andThen` 组合转换步骤。 |
| `java25-list-copyof` | [Java 25 `List.copyOf`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#copyOf(java.util.Collection)) | `api-doc` | Java 25 | `copyOf` 返回不可修改列表；原集合后续变化不会反映到结果，元素本身仍可能可变。 |
| `java25-abstract-list` | [Java 25 `AbstractList`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/AbstractList.html) | `api-doc` | Java 25 | 官方 skeletal implementation 由稳定骨架复用 `get`、`size`、`set`、`add`、`remove` 等原语。 |
| `java25-input-stream-read` | [Java 25 `InputStream.read(byte[], int, int)`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/InputStream.html#read(byte%5B%5D,int,int)) | `api-doc` | Java 25 | 默认批量读取反复调用抽象 `read()`；子类可以为效率覆盖批量实现，异常与部分读取有精确合同。 |
| `java25-input-stream-reader` | [Java 25 `InputStreamReader`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/InputStreamReader.html) | `api-doc` | Java 25 | 它明确是字节流到字符流的 bridge，并按指定或默认 charset 解码；底层读取允许预读。 |
| `java25-arrays-as-list` | [Java 25 `Arrays.asList`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Arrays.html#asList(T...)) | `api-doc` | Java 25 | 官方 API Note 明确称其为数组 API 与集合 API 的 bridge；返回数组支撑的定长可修改视图。 |
| `java25-collections-lifo` | [Java 25 `Collections.asLifoQueue`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Collections.html#asLifoQueue(java.util.Deque)) | `api-doc` | Java 25 | 把 `Deque` 映射为 LIFO `Queue` 视图，`add` 对应 `push`、`remove` 对应 `pop`。 |
| `java25-executors-callable` | [Java 25 `Executors.callable(Runnable)`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/Executors.html#callable(java.lang.Runnable)) | `api-doc` | Java 25 | 返回一个 `Callable` 适配对象；调用它会运行原 `Runnable` 并返回 `null`。 |
| `java25-completable-future` | [Java 25 `CompletableFuture`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/CompletableFuture.html) | `api-doc` | Java 25 | 非 async 依赖动作可由完成线程或其他完成调用者执行；未显式传 executor 的实例 async 方法使用默认 executor，子类可用 `defaultExecutor()` 覆盖这些非静态方法。默认实现通常使用 common pool；其并行度不足 2 时改为为每个任务创建线程。 |
| `java25-completable-future-when-complete` | [Java 25 `CompletableFuture.whenComplete`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/CompletableFuture.html#whenComplete(java.util.function.BiConsumer)) | `api-doc` | Java 25 | 回调同时接收结果与异常，不用于转换结果；回调抛错会按上游完成状态影响返回 stage。 |
| `spring7-jdbc-template` | [Spring Framework 7.0.8 `JdbcTemplate`](https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/jdbc/core/JdbcTemplate.html) | `api-doc` | Spring Framework 7.0.8 | 模板执行 JDBC 核心流程、遍历结果并转换异常，应用通过 callback 提供 SQL 与映射；官方说明通常无需子类化。 |

### Java 8 与 Spring Boot 2.3 legacy 线

| ID | 第一方直接来源 | sourceType | 适用版本 | 支持结论 |
| --- | --- | --- | --- | --- |
| `jls8-functional-interface` | [JLS 8 §9.8 Functional Interfaces](https://docs.oracle.com/javase/specs/jls/se8/html/jls-9.html#jls-9.8) | `specification` | Java 8 | Java 8 已有单一抽象函数合同、lambda 和方法引用；不能把 Java 25 的 `sealed` 限定词倒写到 Java 8。 |
| `jls8-lambda` | [JLS 8 §15.27 Lambda Expressions](https://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html#jls-15.27) | `specification` | Java 8 | Java 8 lambda 同样依赖函数式接口目标类型，并要求捕获的局部变量为 final 或 effectively final。 |
| `jvms8-class-version` | [JVMS 8 §4.1 The `ClassFile` Structure](https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.1) | `specification` | Java 8 | JDK 1.k 的最高 class major 为 44+k；Java 8 fixture 应产生 major 52。 |
| `java8-comparator` | [Java 8 `Comparator`](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html) | `api-doc` | Java 8 | Java 8 已支持函数式比较策略和组合；必须满足全序，与 `equals` 不一致虽被允许，但应明确且会影响有序集合合同。 |
| `java8-consumer` | [Java 8 `Consumer`](https://docs.oracle.com/javase/8/docs/api/java/util/function/Consumer.html) | `api-doc` | Java 8 | `Consumer` 和 `andThen` 自 Java 8 起可用；前一个动作抛异常时后一个动作不执行。 |
| `java8-abstract-list` | [Java 8 `AbstractList`](https://docs.oracle.com/javase/8/docs/api/java/util/AbstractList.html) | `api-doc` | Java 8 | skeletal implementation 与原语覆盖合同已经存在，可用经典类实现 legacy 模板示例。 |
| `java8-input-stream-reader` | [Java 8 `InputStreamReader`](https://docs.oracle.com/javase/8/docs/api/java/io/InputStreamReader.html) | `api-doc` | Java 8 | 同样是字节流到字符流的 bridge；允许显式 charset 或平台默认 charset。 |
| `java8-arrays-as-list` | [Java 8 `Arrays.asList`](https://docs.oracle.com/javase/8/docs/api/java/util/Arrays.html#asList-T...-) | `api-doc` | Java 8 | 返回数组支撑的定长列表；元素替换双向可见，改变长度的方法抛 `UnsupportedOperationException`。 |
| `java8-executors-callable` | [Java 8 `Executors.callable(Runnable)`](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/Executors.html#callable-java.lang.Runnable-) | `api-doc` | Java 8 | `Runnable` 到 `Callable<Object>` 的适配合同在 Java 8 已存在。 |
| `spring-boot-2-3-system-requirements` | [Spring Boot 2.3.12 System Requirements](https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements) | `official-reference` | Spring Boot 2.3.12.RELEASE | 要求 Java 8，兼容至 Java 15，并要求 Spring Framework 5.2.15.RELEASE 或以上。 |
| `spring5-multipart-file` | [Spring Framework 5.2.15 `MultipartFile`](https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/multipart/MultipartFile.html) | `api-doc` | Spring Framework 5.2.15.RELEASE | 上传内容可能位于内存或临时磁盘；使用者负责复制到持久存储，请求结束后临时存储会被清理。 |
| `spring5-jdbc-template` | [Spring Framework 5.2.15 `JdbcTemplate`](https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/jdbc/core/JdbcTemplate.html) | `api-doc` | Spring Framework 5.2.15.RELEASE | legacy 版同样固定 JDBC 工作流并通过 callback 参数化；配置完成后线程安全，通常无需继承。 |

### 有条件的工程取舍来源

| ID | 工程来源 | sourceType | 适用条件 | 支持结论 |
| --- | --- | --- | --- | --- |
| `fowler-replace-conditional-polymorphism` | [Martin Fowler - Replace Conditional with Polymorphism](https://refactoring.com/catalog/replaceConditionalWithPolymorphism.html) | `engineering-reference` | 条件分支按类型形成多种独立行为，且多态能让每种行为留在对应类型中 | 可把按类型变化的条件分支移动到多态实现；不表示所有 `if` 都应替换。 |
| `fowler-replace-subclass-delegate` | [Martin Fowler - Replace Subclass with Delegate](https://refactoring.com/catalog/replaceSubclassWithDelegate.html) | `engineering-reference` | 继承关系服务了错误变化轴、需要多于一个变化维度，或父类 API 泄漏给子类 | 委托可替代不合适的继承；不表示继承本身错误。 |
| `fowler-dependency-injection` | [Martin Fowler - Inversion of Control Containers and the Dependency Injection pattern](https://martinfowler.com/articles/injection.html) | `engineering-reference` | 必需协作者需要由外部装配，并希望依赖在创建时显式可见 | 构造器注入是依赖注入的一种形式；不要求把纯值对象或可选参数都交给容器。 |

以上共 36 张来源卡：33 张直接第一方来源卡和 3 张 D 级工程取舍来源。课程 frontmatter 只应选取
实际支撑正文结论的卡片，不应为了维持数量把未使用链接全部复制进去。

## 关键合同与课程结论

本节区分两类内容：JLS、JVMS 与 Javadoc 直接支持的语言/API 事实，以及只为控制示例变量而提出的
fixture 建模约定。后者不是 Java 语法规则，也不回答生产设计“哪一种更合适”；临时 fixture 只能
验证约定下的可观察行为，不能把冻结项目的 `observed` 证据升级为通用工程建议。

### Strategy：把变化放在稳定策略接口后面

1. `Comparator` 证明 Java API 可以把一段算法作为对象传给上下文。课程可以据此说明 Strategy 的
   机制，但“`Comparator` 是 GoF Strategy”应标为教学分析，而不是 Javadoc 原话。
2. 本课把 Strategy 的教学角色限定为“一个可替换决策”，例如“如何计算费用”或“使用哪个存储
   实现”；最小上下文只保存策略接口。这是课程建模约定，不是 JLS 定义。
3. JLS 允许函数式接口由 lambda 实现；本课分别展示一个 lambda 和一个具名实现，只比较可观察结果，
   不给出“哪种形式更合适”的无证据结论。
4. 为控制单课范围，fixture 用 `EnumMap<Mode, TransferStrategy>` 显式分开选择与执行；完整注册表、
   工厂和服务定位器留给其冻结后继能力。本条是范围决定，不是通用架构规则。
5. 策略替换不免除合同约束。`Comparator` 即使可以注入，也必须满足全序；与 `equals` 不一致虽被
   允许，但应显式说明，并可能让有序 set/map 的行为违反一般 set/map 合同。

### Template Method：固定骨架，只开放必要步骤

1. `AbstractList` 官方称为 skeletal implementation：父类复用通用算法，子类提供少量原语。
   `InputStream.read(byte[], int, int)` 也展示默认批量流程如何反复调用单字节 `read()`。
2. 本课 fixture 把模板拆为公开骨架、固定步骤次序和一个子类钩子，并用 `final` 让“不可覆盖”成为
   可编译验证的局部合同。是否在生产设计中使用 `final` 仍是待具体上下文决定的工程选择。
3. 课程用两个最小输入对比“继承时扩展点固定在类型层次”和“委托时策略可在运行前选择”的可观察
   差异；不把其中一种写成所有服务的默认优先方案。
4. `AbstractList` 的可选修改方法说明一个易错边界：只实现最小原语可能得到只读或定长行为；遗漏
   `set`、`add`、`remove` 时出现 `UnsupportedOperationException` 并不等于骨架失效。
5. `JdbcTemplate` 是“模板 + callback”的直接第一方例子。它固定资源、遍历和异常处理流程，通过
   callback 参数化应用行为，官方反而说明通常无需子类化；课程不能把它硬写成靠继承 hook 的案例。

### Adapter：翻译接口时也要翻译合同

1. 本课用“目标端口、已有对象、映射层”作为 Adapter 的教学模型，并在 fixture 中只验证参数和
   返回值映射。异常、资源所有权和生命周期必须逐项另立合同，不能从“适配器”名称自动推出。
2. `InputStreamReader` 是官方明确命名的 byte-to-character bridge。它同时证明适配不只是方法改名，
   还包含 charset 和预读语义；为让 fixture 结果跨环境确定，课程示例固定显式 charset。
3. `Arrays.asList` 和 `Collections.asLifoQueue` 都返回 view 而不是 copy。适配后的接口形状相同，不代表
   所有权、可变性或顺序语义相同；这些差异必须进入适配器合同。
4. `Executors.callable(Runnable)` 证明最小适配器可以只翻译调用与返回值：执行原任务，并把无返回值
   映射为 `null`。
5. 冻结审计把 `CustomMultipartFile` 归入适配器能力，但本批没有读取项目源码。课程只能说明存在该
   候选场景；在实际课程中使用前，仍须从冻结证据允许的合同出发做去敏、纠正和可执行验证。

### Callback 与函数式接口：先定义宿主协议，再传入动作

1. 函数式接口是 JLS 定义的目标类型合同；callback 是本课为“宿主在约定时机调用传入动作”采用的
   教学角色。两者不是同义词：callback 可以用普通对象实现，函数式接口也可以被用作 Strategy。
2. `@FunctionalInterface` 是意图检查，不是 lambda 开关。添加第二个不等价抽象方法会破坏函数式
   合同；default、static 和与 `Object` 公有实例方法等价的声明不能简单计入数量。
3. lambda 求值创建函数式接口实例，但不立即执行 lambda body。`Consumer` 本身不定义调度；本课
   fixture 的直接调用路径没有引入 executor，因此 callback 在同一调用链中执行。把同一回调交给
   `CompletableFuture` 后，执行线程和完成语义由宿主 API 决定。
4. 本课 fixture 只承诺同步调用时机、三次调用和精确顺序。线程切换、异常传播、重入和宿主状态修改
   均标为未验证；`Consumer` 自身只定义 `accept` 和组合，不提供这些更高层保证。
5. `Consumer.andThen` 固定先后顺序；第一个动作抛异常时第二个不执行，异常传回调用者。
   `CompletableFuture.whenComplete` 不负责转换结果；回调抛异常还会影响返回 stage，因此 fixture 把
   “回调抛错”单列为失败场景。

### 四者组合时的 fixture 建模约定

| 组合 | 本课 fixture 的职责分配 | 为控制变量而排除的输入形态 |
| --- | --- | --- |
| Template + Strategy | 模板固定流程；某一步委托给可替换策略 | 子类既改步骤顺序又自行选择所有策略 |
| Template + Callback | 模板拥有调用时机；callback 只接收进度或结果 | callback 反向接管主流程且合同未命名 |
| Strategy + Adapter | Strategy 表达业务选择；Adapter 翻译到具体后端 | 路由条件散落在每个适配器内部 |
| Adapter + Callback | Adapter 翻译第三方通知为内部事件值 | 直接把第三方 callback 类型暴露给业务层 |
| 四者组合 | 模板编排，策略决策，适配器接外部端口，callback 报告状态 | 一个类同时负责路由、资源、转换、重试和通知 |

为让初学者能从输出区分角色，本课把“返回决策值的传入动作”命名为 Strategy，把“选择多个实现”
留给路由器，不在 Adapter 中实现。这只是本课的命名与 fixture 约定，不提供生产架构选型结论；真实
项目仍需根据变化原因、调用链和测试证据单独评审。

## 易错点取证矩阵

| 易错点 | 现象与触发条件 | 原因和后果 | 正确写法与验证 | 直接证据 |
| --- | --- | --- | --- | --- |
| 把 `@FunctionalInterface` 当成 lambda 开关 | 未标注就认为不能使用 lambda，或给多抽象方法接口强行加注解 | JLS 按函数类型判定；错误注解会编译失败 | 分别编译有无注解的合法接口，再编译双抽象方法反例并断言失败 | JLS 25 §9.8、§9.6.4.9；`FunctionalInterface` API |
| 在 lambda 中修改捕获局部变量 | callback 试图对外部局部计数器自增 | 捕获变量必须 final 或 effectively final，代码编译失败 | 把状态作为参数或受控对象字段，并用 `javac --release 25` / Java 8 编译验证 | JLS 25 / JLS 8 §15.27 |
| 策略实现破坏调用者合同 | 比较器不传递或与 `equals` 不一致后放入 `TreeSet` | 可替换算法仍须满足全序；集合可能出现与一般 `Set` 预期冲突的结果 | 用稳定字段比较并显式决定与 `equals` 是否一致；验证排序和集合大小 | Java 25 / Java 8 `Comparator` |
| 误以为 skeletal implementation 自动支持全部修改 | 只实现 `get/size` 后调用 `add/remove` | 未覆盖的可选修改操作按合同抛 `UnsupportedOperationException` | 按可变性需求实现 `set/add/remove`，或明确暴露只读合同 | Java 25 / Java 8 `AbstractList` |
| 把适配视图当副本 | 修改原数组后适配列表也变化，或对列表调用 `add` | `Arrays.asList` 共享原数组且固定长度 | 需要独立集合时显式复制；fixture 同时断言写入穿透和 `add` 失败 | Java 25 / Java 8 `Arrays.asList` |
| 依赖默认 charset | 同一字节输入在不同环境得到不同文本 | `InputStreamReader` 允许使用默认 charset，环境配置可能不同 | 适配器构造时显式传 `StandardCharsets.UTF_8`；断言固定中文结果 | Java 25 / Java 8 `InputStreamReader` |
| 认为 callback 一定异步或一定在调用线程 | 把耗时或线程绑定动作放进未知宿主回调 | `Consumer` 不定义调度；`CompletableFuture` 又区分 non-async 和 async 执行策略 | API 显式声明同步性和 executor；记录线程名仅作行为断言，不作性能结论 | `Consumer`、`CompletableFuture` |
| 忽略 callback 异常对后续动作的影响 | 首个 `Consumer` 抛错后仍期待 `andThen` 执行，或日志回调让 stage 失败 | 官方合同会停止后续 Consumer，`whenComplete` 的异常也影响返回 stage | fixture 断言后续计数不增加，并分别验证上游正常/异常完成 | `Consumer.andThen`、`CompletableFuture.whenComplete` |
| 把 `JdbcTemplate` 写成必须继承的模板方法 | 为每条 SQL 建子类覆盖流程 | 官方以 callback 参数化，并说明通常无需子类化 | 把它作为 template-callback 组合证据，不作为继承模板主例 | Spring 7.0.8 / 5.2.15 `JdbcTemplate` |
| 宣称 Boot 2.3.12 支持 Java 25 | 用现代 JDK 跑通一次后改写兼容范围 | 官方只声明 Java 8 至 15；偶然运行不等于受支持 | legacy fixture 必须在 Java 8 环境执行并记录精确依赖 | Spring Boot 2.3.12 System Requirements |

## 冻结项目证据

以下内容只来自 `course-coverage-matrix.json`、`java-engineering-pattern-capability-matrix.json`、
`engineering-pattern-capability-source-inventory.jsonl`、`architecture-and-call-paths.md` 和
`project-example-register.md`。本批没有重新扫描项目源码，也没有修改冻结数量、路径或符号。

### 来源能力与代表符号

| 来源能力 | 冻结证据 | 代表路径与稳定符号 | 课程用途与边界 |
| --- | --- | --- | --- |
| `JAVA-ENGINEERING-007` 策略模式与业务路由 | `projectEvidenceCount: 16`；合并来源含按业务类型建组、策略模式、地区差异、角色路由 | `FybWsServer`、`DownloadUtil`、`DqUtils`、`Voice2TextWsServer`、`Downloader` 及矩阵记录的原路径 | `observed`：证明项目存在策略/路由候选，不证明选择逻辑正确或完备 |
| `JAVA-ENGINEERING-008` 模板方法与默认扩展点 | `projectEvidenceCount: 10`；合并来源含模板方法、默认方法 | `ClearExpiredDataController`、`ConstraintValidator`、`DxReportTaskController`、`EndYchyController`、`HxDataReportController` 及矩阵记录的原路径 | `observed`：证明存在骨架/扩展点候选，不证明步骤顺序或异常合同 |
| `JAVA-ENGINEERING-011` 适配器与端口隔离 | `projectEvidenceCount: 1`；合并来源为适配器 | `dzzz-app/src/main/java/com/tdh/bdzz/util/CustomMultipartFile.java` -> `com.tdh.bdzz.util.CustomMultipartFile` | `observed`：只证明冻结审计分类，不推断源码实现细节 |
| `JAVA-ENGINEERING-012` 回调与进度通知 | `projectEvidenceCount: 3`；合并来源含传输进度、回调、结果回调、最后连接回调 | `StorageProcessListener`、`ReTransmissionService`、`FybChatRoomWsServer` 及矩阵记录的原路径 | `observed`：只证明 callback 候选，不证明线程、次数、顺序或失败传播 |

策略能力的 16 个冻结文件来自四类输入的去重并集，模板能力为 10 个文件，适配器为 1 个文件，回调
为 3 个文件。数量表示审计覆盖，不表示文件数量等于实现数量，也不表示这些写法已经通过运行验证。

### 课程节点冻结的代表路径

| 来源能力 | 冻结路径 | 稳定符号 |
| --- | --- | --- |
| `JAVA-ENGINEERING-007` | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/fyb/FybWsServer.java` | `com.tdh.bdzz.config.websocket.server.fyb.FybWsServer` |
| `JAVA-ENGINEERING-007` | `dzzz-app/src/main/java/com/tdh/bdzz/download/DownloadUtil.java` | `com.tdh.bdzz.download.DownloadUtil` |
| `JAVA-ENGINEERING-007` | `dzzz-app/src/main/java/com/tdh/bdzz/util/DqUtils.java` | `com.tdh.bdzz.util.DqUtils` |
| `JAVA-ENGINEERING-007` | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/Voice2TextWsServer.java` | `com.tdh.bdzz.config.websocket.server.Voice2TextWsServer` |
| `JAVA-ENGINEERING-007` | `dzzz-app/src/main/java/com/tdh/bdzz/download/Downloader.java` | `com.tdh.bdzz.download.Downloader` |
| `JAVA-ENGINEERING-008` | `dzzz-app/src/main/java/com/tdh/bdzz/timer/controller/ClearExpiredDataController.java` | `com.tdh.bdzz.timer.controller.ClearExpiredDataController` |
| `JAVA-ENGINEERING-008` | `dzzz-app/src/main/java/com/tdh/bdzz/validator/ConstraintValidator.java` | `com.tdh.bdzz.validator.ConstraintValidator` |
| `JAVA-ENGINEERING-008` | `dzzz-app/src/main/java/com/tdh/bdzz/timer/controller/DxReportTaskController.java` | `com.tdh.bdzz.timer.controller.DxReportTaskController` |
| `JAVA-ENGINEERING-008` | `dzzz-app/src/main/java/com/tdh/bdzz/timer/controller/EndYchyController.java` | `com.tdh.bdzz.timer.controller.EndYchyController` |
| `JAVA-ENGINEERING-008` | `dzzz-app/src/main/java/com/tdh/bdzz/timer/controller/HxDataReportController.java` | `com.tdh.bdzz.timer.controller.HxDataReportController` |
| `JAVA-ENGINEERING-011` | `dzzz-app/src/main/java/com/tdh/bdzz/util/CustomMultipartFile.java` | `com.tdh.bdzz.util.CustomMultipartFile` |
| `JAVA-ENGINEERING-012` | `dzzz-app/src/main/java/com/tdh/bdzz/storage/StorageProcessListener.java` | `com.tdh.bdzz.storage.StorageProcessListener` |
| `JAVA-ENGINEERING-012` | `dzzz-app/src/main/java/com/tdh/bdzz/ws/ReTransmissionService.java` | `com.tdh.bdzz.ws.ReTransmissionService` |
| `JAVA-ENGINEERING-012` | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/fyb/FybChatRoomWsServer.java` | `com.tdh.bdzz.config.websocket.server.fyb.FybChatRoomWsServer` |

### CALL-PATH-006 文件存储策略与适配器链

| 步骤 | 冻结路径与符号 | SHA-256 |
| --- | --- | --- |
| 1 | `dzzz-app/src/main/java/com/tdh/bdzz/upload/UploadUtil.java` -> `UploadUtil.upload` | `22b66fcb37f7ef0896a788eccd226b5718c610f97079697b114ecc58b37d6d59` |
| 2 | `dzzz-app/src/main/java/com/tdh/bdzz/upload/UploadUtil.java` -> `StorageMode.upload` 调用 | `22b66fcb37f7ef0896a788eccd226b5718c610f97079697b114ecc58b37d6d59` |
| 3 | `dzzz-app/src/main/java/com/tdh/bdzz/enums/StorageMode.java` -> `StorageMode` 策略枚举 | `84fb70fc41b63bb990c5a4529ef29f1f89c5d0643570a3321232380d1ec0e8cc` |
| 4 | `dzzz-app/src/main/java/com/tdh/bdzz/upload/Uploader.java` -> `Uploader.upload` | `8795dcd950abeb934ea2bff405a56ba544d0a8e066d01f9c1e96d57607548192` |
| 5 | `dzzz-app/src/main/java/com/tdh/bdzz/upload/LocalUploader.java` -> `LocalUploader.upload` | `b0b7f0b654d5ecd71e096181fd1260ef47fff5b2909218b86ae1596212a6eb13` |
| 6 | `dzzz-app/src/main/java/com/tdh/bdzz/upload/SftpUploader.java` -> `SftpUploader.upload` | `840d6653867d300f00e11ac9f8886a3ae91c2230fbaa27d9ff2fe353465dd751` |
| 7 | `dzzz-app/src/main/java/com/tdh/bdzz/upload/S3Uploader.java` -> `S3Uploader.upload` | `b353bcdfb18ef0663628dded727f3c599c0e6f51f339835f334024628e7202fa` |
| 8 | `dzzz-app/src/main/java/com/tdh/bdzz/upload/MossUploader.java` -> `MossUploader.upload` | `cb5e2c0167a7fd06e055e9ab39216fc18b49e6fa99f7771815acdefb77689357` |

冻结调用链状态为 `static-source-verified`。它只证明静态策略分派与适配器实现关系，不证明凭据有效、
远端服务可用、上传成功、回调顺序或资源清理。课程示例应保留“选择存储策略并调用统一端口”的业务
意图，删除业务标识和基础设施细节，使用本地 fake adapter 建立可重复反馈环。

`project-example-register.md` 把该链归入“文件上传、对象存储、传输与下载链”，并规定 Phase 5
重新设计最小现代实现。其预期状态不是对当前项目写法的认可；本课程最多采用 `adapted` 或
`corrected` 场景，不能把冻结项目代码复制成推荐实现。

## 临时 fixture 验证设计

### 现代 Java 25 待执行反馈环

实施阶段在 `/tmp` 的 `mktemp` 目录创建单文件 `ServicePatternsFeedback.java`，不得向仓库增加测试文件。

1. 使用 `DeliveryRequest`、`Receipt` 和 `DeliveryStrategy` 注册两个 lambda 策略，分别执行
   `LOCAL` 与 `REMOTE`，并断言两条路由输出。
2. 使用 `ImportTemplate.execute` 固定 `validate -> transform -> save` 次序，只开放受保护的
   `transform` 步骤。
3. 使用 `MessagePort`、`LegacySender` 和 `LegacySenderAdapter` 验证双参数内部协议到旧单字符串
   协议的转换，不访问网络、文件系统或真实凭据。
4. 使用 `ProgressListener` 记录 `validated -> transformed -> saved` 三次同步回调，并断言精确顺序。
5. 使用记录了精确 digest 的 Temurin 25 容器执行 `javac -Xlint:all -Werror --release 25`、主类和
   `javap -verbose`；预期固定输出为：
   `SERVICE_PATTERNS_PASS strategy=2 template=1 adapter=1 callback=3`，class major version 为 69。

本反馈环只证明策略选择、模板顺序、参数映射和同步回调顺序，不证明异常翻译、异步线程、重入、
吞吐量或性能优势。课程中的未知策略步骤由学习者主动修改输入验证，批次 Gate 只在实际执行后记录
其结果。

### Java 8 待执行兼容反馈环

实施阶段在同一 `/tmp` 批次目录的独立子目录创建 `ServicePatternsLegacyFeedback.java`，使用记录了
精确 digest 的 Temurin 8 容器编译和运行，不解析 Maven 或 Spring 依赖。

1. 将 record、`Map.of`、`List.of`、`List.copyOf` 和 `Stream.toList()` 改成 Java 8 普通类与集合写法。
2. 保留两个策略分支、适配器参数映射、模板步骤和三次进度回调，验证示例的可观察合同不依赖现代
   便捷 API。
3. 执行 `javac -Xlint:all -Werror`、主类和 `javap -verbose`；预期固定输出为：
   `SERVICE_PATTERNS_LEGACY_PASS strategy=2 template=1 adapter=1 callback=3`，class major version 为 52。
4. 本反馈环不包含 Spring 类型，因此 Spring Boot 2.3.12.RELEASE 和 Spring Framework
   5.2.15.RELEASE 只由官方版本来源与 `JdbcTemplate` Javadoc 支撑，不能写成已编译运行。

实施阶段完成两份反馈环后必须删除整个临时目录，并用最终不存在性检查确认无残留。验证记录必须包含
JDK 容器 digest、完整命令、编译与运行退出码、固定输出和 class major；不记录不存在的 Maven 依赖
解析结果。

## 课程编写约束

1. 正文必须先解释四个角色各自解决的问题，再展示组合案例；不能先堆四套完整代码。
2. `零基础知识点详解` 至少分别为 Strategy、Template Method、Adapter、Callback 和组合边界设置
   独立三级标题，每点都覆盖是什么、作用、场景、步骤、最小示例、结果和误区。
3. 现代示例先讲纯 Java 25；Java 8 / Spring Boot 2.3.12 单独放在兼容章节，不把项目旧写法包装
   成现代推荐。
4. 所有 Java 方法和构造器定义上方必须有规范中文注释；错误示例只放在 `pitfalls` 或 `compare`。
5. 课程 frontmatter 的 `sources` 只选择正文实际使用的直接来源；正文不再增加“参考资料”或
   “来源详情”。
6. `projectEvidence` 只能从本稿冻结表选择，并按 `observed`、`adapted` 或 `corrected` 标注；没有
   新的可执行证据前不得标记为项目已验证。
7. 不写“某模式更快”的性能结论。本批没有测量；如需比较，只能另行设计 JMH/JFR 反馈环。

## 待验证点与停止边界

- 现代和 Java 8 反馈环均未形成可追溯的 digest、完整命令和退出码，本研究稿只冻结预期输出与
  class major 验收合同；不得写成已实际运行。
- 当前 fixture 设计未包含 `@FunctionalInterface` 编译失败或 Spring 依赖验证；二者保持待验证。
- 冻结审计没有证明项目 callback 的同步性、线程、调用次数、顺序或异常传播，课程不得补猜。
- `CustomMultipartFile` 只被审计归类为适配器候选；未读取源码前不能声称它完整满足 Spring
  `MultipartFile` 的临时存储、资源所有权或复制合同。
- CALL-PATH-006 没有运行时网络、凭据、上传结果或清理证据；课程只能使用本地 fake adapter。
- 当前课程 fixture 只在发出 `validated` 与 `saved` 事件前复制列表，没有可观察的输入校验或持久化
  保存；实施批应补最小操作，或把事件改成与真实动作一致的名称。
- 当前课程 fixture 只验证适配器参数映射和三次成功 callback，没有验证异常映射、callback 抛错或
  legacy 未知策略；正文中的这些内容仍是待验证合同，不能写成已由反馈环证明。
- 当前课程 frontmatter 的 Spring Boot 4.1.0 基线仍缺少对应系统要求来源；实施批应加入
  `spring-boot-4-1-system-requirements` 来源卡。
- 本批研究盘点的初始快照写为 280 分钟、两个旧前置和 `verifiedAt: 2026-08-09`；并行工作树随后
  改成 150 分钟、唯一前置 I-17 和 `verifiedAt: 2026-08-16`。这些正文改动不属于本研究批，也不能
  替代实施批的独立验收。
- 课程实施时仍须完成格式、类型、lint、构建、Catalog 冷启动、桌面/390px 浏览器验证和独立
  Standards/Spec `PASS / 0 finding`，这些 Gate 不属于本研究稿的完成声明。
- Phase C I-18 在本研究稿完成定向验证后停止；本批不授权 I-19、课程正文、track、entry manifest、
  页面或 signoff 修改。
