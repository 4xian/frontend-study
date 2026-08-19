# Lambda、方法引用、Stream 与 Collectors 研究记录

## 冻结课程合同

- `courseId`：`backend.java.learn.intermediate.lambda-stream-and-collectors`
- `title`：Lambda、方法引用、Stream 与 Collectors
- `purpose / collection / level / depth`：`learn / intermediate / intermediate / lesson`
- `phaseCSequence`：`I-01`
- `legacyPhase2Sequence`：`300`
- `estimatedMinutes`：`120`
- `prerequisites`：`[backend.java.learn.basics.command-line-task-manager-project]`
- `coursePlan`：`docs/backend/java/spring-boot-web-curriculum-plan.md`
- `related`：`[]`
- `sourceCapabilityIds`：`[JAVA-LANG-008, JAVA-STDLIB-008]`
- `origin`：`[project-observed]`
- `selectionReason`：项目直接使用 Lambda、方法引用和 Stream；课程按集合处理顺序建立心智模型。
- `projectEvidenceCount`：`JAVA-LANG-008: 224`、`JAVA-STDLIB-008: 175`
- `modernBaseline`：Java 25 LTS
- `legacyBaseline`：Java 8，只作冻结项目兼容补充
- Phase 2 冻结状态：`researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`
- `snapshotId`：`dzzz-app-20260803-179e722831ab`
- `analysisId`：`dzzz-app-analysis-20260803-958d37cf1be1`

本课覆盖函数式接口与目标类型、Lambda 捕获、四种方法引用及重载歧义、Stream 创建与流水线、惰性与
单次消费、常用中间和终止操作、指定 Collectors、遇到顺序、副作用和并行归约边界。自定义
`Collector`、Gatherer、Reactive Streams、数据库流式游标、异步编排、并发集合和性能调优不在本课展开。

## 核验基线

| 项目 | 核验结果 |
| --- | --- |
| 官方来源复核日期 | 2026-08-15 |
| 现代主线 | Java 25 LTS；OpenJDK JDK 25 页面确认 2025-09-16 GA，Oracle 支持路线将 Java 25 列为 LTS |
| 官方 API 快照 | Java SE 25 API 页面页脚标识 `25.0.4+7-LTS-189`；语言规范仍按 JLS 25 取证 |
| legacy 补充 | Java 8；Lambda、方法引用、`java.util.function`、Stream 与除 `toUnmodifiableList` 外的本课 Collectors 核心能力均已具备 |
| 外部搜索 | 2026-08-08 使用过 Tavily extract 辅助定位；本批环境未提供 Tavily，改为用 `curl -L --fail` 直接复核既有 Oracle、OpenJDK 与 Dev.java 官方 URL |
| 最终证据 | JLS 25/8、Java 25/8 API、OpenJDK JDK 25 与 Dev.java 直接页面；搜索摘要不作证据 |
| 能力矩阵 | 冻结 `course-coverage-matrix`、`JAVA-LANG-008` 与 `JAVA-STDLIB-008` |
| 项目检查 | 沿用 2026-08-08 对 5 个最小源码文件的只读检查与 SHA；本批未重新读取、运行、构建或修改 `dzzz-app` |
| 快照边界 | 2026-08-08 检查时 `dzzz-app` HEAD 为 `167ca8aa91ca3a6b101246964ef4fddec3d21da0`，不同于冻结快照标识；仅声明下表 5 个文件当时逐个匹配冻结 inventory |
| 研究边界 | 本批只产出研究记录与 fixture 计划，不执行 Java、Docker、课程构建或浏览器验证 |

## 官方来源卡与直接证据

以下 Java 25 / OpenJDK / Dev.java URL 均在 `2026-08-15` 使用浏览器 User-Agent 直接访问并返回 HTTP
200；Java 8 归档 URL 保留 2026-08-08 的既有核验结果：

| ID | 直接来源 | sourceType | 适用版本 | 支持结论 |
| --- | --- | --- | --- | --- |
| `openjdk-jdk25` | [OpenJDK JDK 25](https://openjdk.org/projects/jdk/25/) | `official-reference` | JDK 25 | JDK 25 是 Java SE 25 参考实现并已 GA。 |
| `oracle-java-roadmap` | [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) | `official-reference` | 2026-08-08 页面状态 | Java SE 25 被列为 LTS。 |
| `jls25-functional-interface` | [JLS 25 §9.8 Functional Interfaces](https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.8) | `specification` | Java 25 | 函数式接口、单一函数方法与函数类型。 |
| `jls25-lambda` | [JLS 25 §15.27 Lambda Expressions](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.27) | `specification` | Java 25 | Lambda 语法、目标类型、兼容性、捕获与运行时求值。 |
| `jls25-effective-final` | [JLS 25 §4.12.4 final Variables](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.12.4) | `specification` | Java 25 | `final` 与 effectively final 的精确定义。 |
| `jls25-method-reference` | [JLS 25 §15.13 Method Reference Expressions](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.13) | `specification` | Java 25 | 方法引用语法、目标类型、编译期声明选择以及 exact / inexact 分类。 |
| `jls25-overload-resolution` | [JLS 25 §15.12.2.2 Identify Matching Arity Methods Applicable by Strict Invocation](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12.2.2) | `specification` | Java 25 | inexact 方法引用在重载适用性判断中的处理与歧义边界。 |
| `api25-function-package` | [java.util.function](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/function/package-summary.html) | `api-doc` | Java 25 | `Predicate`、`Function`、`Consumer`、`Supplier` 等通用函数式接口。 |
| `api25-stream-package` | [java.util.stream](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/package-summary.html) | `api-doc` | Java 25 | 流水线、惰性、状态、顺序、非干扰、副作用与并行执行合同。 |
| `api25-stream` | [Stream](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html) | `api-doc` | Java 25 | 单次消费、关闭、常用操作、`forEachOrdered`、`Stream.toList()` 与 `reduce` 合同。 |
| `api25-stream-reduce` | [Stream.reduce(U, BiFunction, BinaryOperator)](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html#reduce(U,java.util.function.BiFunction,java.util.function.BinaryOperator)) | `api-doc` | Java 25 | 三参数归约的 identity、accumulator、combiner 兼容性及行为参数约束。 |
| `api25-collectors` | [Collectors](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Collectors.html) | `api-doc` | Java 25 | `toList`、`toSet`、`toUnmodifiableList`、`toMap`、`groupingBy`、`partitioningBy` 与 `joining`。 |
| `api25-collection-streams` | [Collection](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Collection.html) | `api-doc` | Java 25 | `stream()` 创建顺序流，`parallelStream()` 创建可能并行的流。 |
| `dev-method-references` | [Writing Method References](https://dev.java/learn/lambdas/method-references/) | `official-reference` | 当前 Dev.java 教学页 | 静态、未绑定、已绑定与构造器方法引用的四类教学模型。 |
| `dev-stream-creation` | [Creating a Stream](https://dev.java/learn/api/streams/creating/) | `official-reference` | 当前 Dev.java 教学页 | 从集合、数组、工厂和生成器创建流。 |
| `dev-parallel-streams` | [Parallelizing a Stream](https://dev.java/learn/api/streams/parallel-streams/) | `official-reference` | 当前 Dev.java 教学页 | 并行化前的可拆分、归约、顺序与测量边界。 |
| `jls8-functional-interface` | [JLS 8 §9.8 Functional Interfaces](https://docs.oracle.com/javase/specs/jls/se8/html/jls-9.html#jls-9.8) | `specification` | Java 8 | Java 8 函数式接口与函数类型规则。 |
| `jls8-lambda` | [JLS 8 §15.27 Lambda Expressions](https://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html#jls-15.27) | `specification` | Java 8 | Java 8 Lambda、目标类型与捕获规则。 |
| `jls8-effective-final` | [JLS 8 §4.12.4 final Variables](https://docs.oracle.com/javase/specs/jls/se8/html/jls-4.html#jls-4.12.4) | `specification` | Java 8 | Java 8 `final` 与 effectively final 定义。 |
| `jls8-method-reference` | [JLS 8 §15.13 Method Reference Expressions](https://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html#jls-15.13) | `specification` | Java 8 | Java 8 方法引用语法与目标类型规则。 |
| `api8-function-package` | [Java 8 java.util.function](https://docs.oracle.com/javase/8/docs/api/java/util/function/package-summary.html) | `api-doc` | Java 8 | Java 8 标准函数式接口。 |
| `api8-stream` | [Java 8 Stream](https://docs.oracle.com/javase/8/docs/api/java/util/stream/Stream.html) | `api-doc` | Java 8 | Java 8 Stream 的惰性、单次消费、操作和并行合同。 |
| `api8-collectors` | [Java 8 Collectors](https://docs.oracle.com/javase/8/docs/api/java/util/stream/Collectors.html) | `api-doc` | Java 8 | Java 8 已有的收集、映射、分组、分区与连接能力。 |

Dev.java 当前页面中的示例链接可能跟随网站更新指向更新 JDK API，因此只作为教学结构辅源；
Java 25 与 Java 8 的版本结论分别以对应 JLS 和 API 页面为准。

## 现代主线结论

### 函数式接口给 Lambda 和方法引用提供目标类型

函数式接口不是“只能写一个方法的接口”，而是按 JLS 规则具有一个函数方法的接口。继承来的抽象方法
可能经过签名合并形成一个函数方法，`Object` 公共方法对应的声明不计入该函数方法判断；default 和
static 方法也不增加抽象函数方法数量。`@FunctionalInterface` 不是成为函数式接口的必要条件，但加上
它可让编译器检查作者意图。[来源：`jls25-functional-interface`、`api25-function-package`]

Lambda 本身没有脱离上下文的独立名义类型。赋值、参数传递或强制转换位置给出的目标函数式接口，决定
Lambda 的参数和返回合同。相同文本可能因目标类型不同而表示不同函数；无法推导目标类型、参数不匹配、
返回值不兼容或 checked exception 超出接口合同都会编译失败。[来源：`jls25-lambda`]

课程首先使用四个常用接口建立“输入 -> 输出”心智模型：

- `Predicate<T>`：接收 `T`，返回 `boolean`，用于 `filter` 等条件判断。
- `Function<T, R>`：把 `T` 转换为 `R`，用于 `map` 和键值映射。
- `Consumer<T>`：接收 `T`，不返回结果，适合明确的终止消费边界。
- `Supplier<T>`：不接收业务参数，提供 `T`，用于工厂、生成器或容器供应器。

自定义函数式接口只在现有接口无法准确表达 throws、参数或领域含义时使用；不能为每个 Lambda 新建接口。
[来源：`api25-function-package`]

### Lambda 捕获的是值稳定的局部变量，不是任意可变局部槽位

Lambda 使用外层局部变量、方法参数或异常参数时，该变量必须是显式 `final` 或 effectively final；
effectively final 表示虽然没有写 `final`，但赋值轨迹满足 JLS 的不可再赋值条件。被捕获变量还必须在
Lambda 使用前 definitely assigned。捕获后再给局部变量重新赋值会编译失败。
[来源：`jls25-effective-final`、`jls25-lambda`]

“引用 effectively final”不等于“引用指向的对象不可变”。下面两件事要分开：

- `names = otherList` 会改变局部变量绑定，捕获后不允许。
- `names.add(value)` 没有重新绑定局部变量，语法上可能允许，但会制造可变共享状态；进入 Stream，尤其
  并行 Stream 后，仍可能违反非干扰、无状态或线程安全要求。

因此课程用纯转换和 Collector 表达结果，不教“用一元素数组、可变 List 或 AtomicInteger 绕过捕获限制”。
后者即使能编译，也没有恢复正确的副作用、顺序和并行合同。[来源：`api25-stream-package`]

### 四种常用方法引用必须结合函数式接口阅读

方法引用是“Lambda 仅转调现有方法”时的紧凑写法，不是立即执行方法。目标函数式接口仍决定参数如何
传入、返回值如何接收以及重载/构造器如何选择。[来源：`jls25-method-reference`、
`dev-method-references`]

| 类型 | 语法 | 等价 Lambda 心智模型 | 示例目标类型 |
| --- | --- | --- | --- |
| 静态方法 | `Type::staticMethod` | `x -> Type.staticMethod(x)` | `Function<String, Integer> parse = Integer::parseInt` |
| 已绑定实例方法 | `expression::instanceMethod` | `x -> expression.instanceMethod(x)` | `Consumer<String> print = System.out::println` |
| 未绑定实例方法 | `Type::instanceMethod` | `x -> x.instanceMethod()` | `Function<String, String> trim = String::trim` |
| 构造器 | `Type::new` | `() -> new Type()` 或按目标参数调用对应构造器 | `Supplier<List<String>> create = ArrayList::new` |

未绑定实例方法看起来像静态语法，但函数式接口的第一个输入实际是接收者。仅凭 `ArrayList::new` 也不能
判断调用无参还是带容量构造器，必须先看 `Supplier`、`IntFunction` 等目标类型。

当被引用的方法或构造器存在多个候选时，方法引用可能成为 inexact poly expression。若它又作为参数传给
一个重载方法，JLS 规定它在重载适用性判断阶段通常只贡献预期参数数量，完整目标类型要等重载解析后才
确定，因此调用可能保持歧义并编译失败。可靠做法是先赋给明确的函数式接口变量，或在调用处显式转换为
目标函数式接口；不能假设编译器会凭方法名替开发者任选一个重载。[来源：`jls25-method-reference`、
`jls25-overload-resolution`]

### Stream 是一次性描述处理过程的流水线，不是保存数据的集合

Stream 流水线由来源、零个或多个中间操作和一个终止操作组成。常用创建方式包括
`collection.stream()`、`Arrays.stream(array)`、`Stream.of(...)`、`Stream.iterate(...)` 与
`Stream.generate(...)`。集合和数组保存数据；Stream 保存如何遍历和处理数据的描述。
[来源：`api25-stream-package`、`dev-stream-creation`]

中间操作返回 Stream，并且总是惰性执行。调用 `filter` 或 `map` 时只搭建流水线；`collect`、`count`、
`reduce`、`findFirst`、`anyMatch`、`forEach` 等终止操作启动遍历。短路操作只消费得到答案所需的元素。
`filter`、`map` 属于无状态中间操作；`distinct`、`sorted` 等有状态操作可能需要保存或看完更多数据，
尤其在并行处理时成本边界不同。[来源：`api25-stream-package`、`api25-stream`]

同一个 Stream 只能参与一次流水线和一次消费，不能在终止操作后再次遍历，也不能从同一 Stream 对象
分叉出两条流水线。实现检测到复用时可能抛 `IllegalStateException`，但 API 明确说明并非所有复用都能
检测，因此正确做法是从可复用来源重新调用 `stream()`，不能以“这次没有抛异常”证明复用合法。
[来源：`api25-stream`]

从集合、数组或生成函数得到的 Stream 通常没有需要关闭的资源；从 I/O channel 等资源得到的 Stream
应按对应来源 API 使用 try-with-resources。课程不把所有 Stream 一律套入 try-with-resources。
[来源：`api25-stream`]

### 中间操作负责选择与转换，终止操作负责产生结果

课程主流水线按“筛选 -> 转换 -> 收集”讲解：

1. `filter(predicate)` 保留满足条件的原元素。
2. `map(function)` 把每个元素转换为另一种值。
3. `sorted(comparator)` 在确实需要排序结果时建立顺序。
4. `limit(n)` 限制后续最多消费的数量。
5. `collect(collector)` 把元素汇总成 List、Map、分组或字符串。

`peek` 主要用于调试式观察；不能依赖它执行必须发生的业务副作用，因为实现可在不影响结果时省略流水线
阶段及其行为参数调用。`forEach` 是终止操作，但并行时不保证遇到顺序；只有确实需要按遇到顺序执行
动作时才选择 `forEachOrdered`，并承担相应约束。[来源：`api25-stream`、`api25-stream-package`]

### Collectors 的返回合同必须逐个阅读

`Collectors.toList()` 按遇到顺序收集到新 List，但不保证具体实现、可变性、序列化或线程安全。不得
强转 `ArrayList`，也不得依赖当前 JDK 恰好允许 `add`。需要指定容器时使用 `toCollection(Supplier)`。
[来源：`api25-collectors`]

`Collectors.toSet()` 收集到新 Set，并且该 Collector 明确标记为 unordered。它同样不保证具体实现、
可变性、序列化或线程安全，因此验收只能断言集合内容，不能断言迭代顺序或强转 `HashSet`。确实需要
指定集合类型与顺序时，使用 `toCollection` 并显式提供相应容器 supplier。[来源：`api25-collectors`]

`Collectors.toUnmodifiableList()` 自 Java 10 提供，按遇到顺序生成不可修改 List，并拒绝 null，
遇到 null 抛 `NullPointerException`。Java 25 还可用 Java 16 引入的 `Stream.toList()` 得到不可修改
List；二者名称相近但不是同一 API，课程必须明确 null 合同与版本边界，不能机械互换。
[来源：`api25-collectors`、`api25-stream`]

`Collectors.toMap(keyMapper, valueMapper)` 要求映射后的键唯一；重复键按 `equals` 判断并在收集时抛
`IllegalStateException`。可能重复时必须业务化选择三参数重载的 merge function，例如保留第一条、
保留最后一条或组合两个值；需要特定 Map 实现时再使用四参数重载的 map supplier。所有这些普通
`toMap` Collector 都不承诺返回 Map 的具体类型、可变性、线程安全或并发收集能力。
[来源：`api25-collectors`]

`groupingBy(classifier)` 生成 `Map<K, List<T>>`，适合一键对应多值；Map 和 List 的具体类型、可变性及
线程安全没有保证。普通 `groupingBy` 不是 concurrent Collector，并行流合并多个 Map 可能有成本；
不能仅因输入改成并行流就声称分组更快。[来源：`api25-collectors`]

`partitioningBy(predicate)` 是固定两个分区的专用分组，返回的 Map 总是同时包含 `true` 和 `false`
两个键；没有元素的一侧是空 List。它适合“通过/未通过”这类二分，不能替代多类别 `groupingBy`。
[来源：`api25-collectors`]

`joining(delimiter)` 按遇到顺序连接 `CharSequence`；三参数重载还可设置 prefix 和 suffix。非字符串
元素应先 `map` 为字符串，不能把对象任意 `toString` 结果当作稳定协议格式。
[来源：`api25-collectors`]

### 遇到顺序、执行顺序和副作用顺序不是同一件事

遇到顺序来自流的来源与流水线操作：List、数组通常有定义顺序；某些 Set 或并发来源可能没有；
`sorted` 建立排序约束，`unordered` 可移除顺序约束。`toList`、`joining`、`findFirst` 等会按各自合同
处理遇到顺序，但这不表示 `map` Lambda 一定按相同线程或相同调用时序执行。
[来源：`api25-stream-package`、`api25-stream`]

行为参数必须 non-interfering，通常还必须 stateless：不能在流水线执行期间修改非并发来源，也不应让
结果依赖外部可变状态。官方 API 明确指出，副作用可能有可见性、线程和执行顺序问题，甚至某些调用可在
不影响结果时被省略。需要产生集合、计数、分组或字符串时优先使用 reduction / Collector 返回结果。
[来源：`api25-stream-package`]

### 并行流是需要证明的执行选择，不是加速开关

JDK Stream 默认创建顺序流；`parallelStream()` 或 `parallel()` 才请求并行，最后一次顺序/并行模式
设置作用于整条流水线。除 `findAny` 等明确允许非确定结果的操作外，正确的无副作用归约不应因并行模式
改变业务结果。[来源：`api25-stream-package`、`api25-collection-streams`]

`reduce(identity, accumulator)` 要求 identity 对 accumulator 是恒等元，accumulator 必须满足结合性、
非干扰且无状态。三参数 `reduce(identity, accumulator, combiner)` 还要求 identity 是 combiner 的恒等元，
combiner 同样满足结合性、非干扰和无状态，并且对任意中间结果 `u` 和元素 `t`，
`combiner.apply(u, accumulator.apply(identity, t))` 必须与 `accumulator.apply(u, t)` 等价。这些是并行
拆分后仍能正确合并的业务正确性合同，不是性能建议；整数加法配合 `0` 是正例，减法不满足结合性，不能
作为可并行归约函数。[来源：`api25-stream`、`api25-stream-reduce`]

并行候选至少要同时满足：来源可有效拆分、数据量足以覆盖调度和合并成本、操作无共享可变状态、归约
满足结合性、顺序约束可接受，并且在目标 JDK、硬件和真实负载上测量过。I/O 阻塞、短集合、严格顺序、
访问请求上下文或 ThreadLocal、写共享集合以及不可结合的归约都不应直接改成 parallel stream。
本研究没有性能测量，因此课程只教判断与验证方法，不给出“并行更快”的结论。
[来源：`api25-stream-package`、`api25-collectors`、`dev-parallel-streams`]

## 关键结论、版本与验证绑定

| 关键结论 | 直接来源 | 版本 | 最小可验证方式 |
| --- | --- | --- | --- |
| Lambda 必须适配目标函数式接口 | `jls25-functional-interface`、`jls25-lambda`、`jls8-functional-interface`、`jls8-lambda` | Java 25；Java 8 | 正向赋值给 `Predicate` / `Function`；负向缺少目标类型或返回值不匹配，`javac` 失败 |
| 捕获局部变量必须 final / effectively final | `jls25-effective-final`、`jls25-lambda`、`jls8-effective-final`、`jls8-lambda` | Java 25；Java 8 | 捕获后重新赋值的独立负向源码在 `javac` 编译失败 |
| 四种方法引用由目标类型决定参数与重载 | `jls25-method-reference`、`jls8-method-reference`、`dev-method-references` | Java 25；Java 8 | 四种引用分别调用并核对精确结果；错误目标类型负向编译 |
| inexact 方法引用不会替重载调用自动消歧 | `jls25-method-reference`、`jls25-overload-resolution` | Java 25 | 歧义调用独立源码由 `javac` 拒绝；赋给明确函数式接口或显式转换后通过 |
| 中间操作惰性，终止操作启动遍历 | `api25-stream-package`、`api25-stream` | Java 25 | Predicate 计数器在终止前为 0，`collect` 后为实际遍历次数 |
| Stream 不能复用 | `api25-stream` | Java 25；Java 8 合同一致 | 固定 OpenJDK 镜像中终止后复用并记录 `IllegalStateException`；正文仍使用 API 的“可能检测”措辞 |
| `toList` 不保证具体类型或可变性 | `api25-collectors` | Java 25；Java 8 一致 | 只断言内容和遇到顺序；禁止把实现类或可修改性写成正向断言 |
| `toSet` 是 unordered Collector，且不保证具体容器合同 | `api25-collectors` | Java 25；Java 8 一致 | 只断言集合内容与去重结果；不对迭代顺序、实现类或可修改性作正向断言 |
| `toUnmodifiableList` 不可修改且拒绝 null | `api25-collectors` | Java 10+，本课 Java 25 | `add` 抛 `UnsupportedOperationException`；含 null 收集抛 `NullPointerException` |
| 两参数 `toMap` 遇重复键失败，三参数按策略合并 | `api25-collectors` | Java 25；Java 8 一致 | 重复键负例抛 `IllegalStateException`；merge fixture 得到精确值 |
| `groupingBy` 一键多值，`partitioningBy` 固定双分区 | `api25-collectors` | Java 25；Java 8 一致 | 核对分组内容；空分区仍存在 true / false 两键 |
| `joining` 按遇到顺序连接 | `api25-collectors` | Java 25；Java 8 一致 | 顺序来源得到带 delimiter / prefix / suffix 的精确字符串 |
| 行为参数要非干扰、通常无状态 | `api25-stream-package` | Java 25；Java 8 一致 | 来源修改和共享副作用只作负例；正向用 Collector 返回结果 |
| 并行归约必须满足恒等元、结合性及 accumulator / combiner 兼容合同 | `api25-stream`、`api25-stream-reduce` | Java 25；Java 8 核心合同一致 | 用整数加法核对顺序与并行结果；三参数 fixture 显式核对兼容公式，不用非结合操作作并行正例 |
| 并行不会自动更快，普通 groupingBy / toMap 不是 concurrent Collector | `api25-stream-package`、`api25-collectors` | Java 25 | 只验证合法归约结果一致；性能结论必须另行用 JMH/JFR 和真实负载测量 |

## 当前项目补充

冻结能力矩阵记录 `JAVA-LANG-008` 观察到 224 个文件，`JAVA-STDLIB-008` 观察到 175 个文件。下表只
选理解本课所需的最小证据。实时 SHA 与 `dzzz-app-file-inventory.json` 中冻结 SHA 一致，文件的
`auditStatus` 均为 `unreviewed`；本次源码阅读只提升下列稳定符号的局部理解，不改变冻结矩阵。

| 文件 | 稳定符号 | SHA-256 | usage | 课程处理 |
| --- | --- | --- | --- | --- |
| `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FybXntjServiceImpl.java` | `FybXntjServiceImpl#fybCount(FybCountDTO)` | `518d854b29de636d71a6458722f5d2f8d690281d816c334702ebcf05bef893f7` | `observed` | 证明项目使用 Lambda、getter 方法引用、`filter`、`map`、`toList`、`groupingBy` 与 `toMap`；不复制业务字段和查询。 |
| `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/swtpad/meeting/SwtPadMeetingServiceImpl.java` | `SwtPadMeetingServiceImpl#queryMeetingListByFilter(QueryMeetingListDTO)` | `633f19f84cfc2ac8b8f14da0fe0012d495d12d73e8155c38fa5e682cbf5fbc7c` | `adapted` | 保留“过滤空名称并用中文分隔符连接”的意图，课程改成中性姓名值、直接 Predicate 和 `joining` 最小流水线。 |
| `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientChatWsServer.java` | `ClientChatWsServer#generateClientKtUrl(ClientStateDTO, String)` | `73ea51927d7ae36903a4918c64061e34dce89b1534e51f246dce92304381368c` | `corrected` | 观察到两参数 `toMap`；课程必须先说明键唯一前提，不能证明唯一时展示显式 merge policy。未核验数据库唯一约束，不把它上升为已确认缺陷。 |
| `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/TsAiAssistantServiceImpl.java` | `TsAiAssistantServiceImpl#queryDeduplicatedMaterials(String, String, List<String>)` | `b78ee80b7a755226bf848bc03f6bf1bd35a66208b3d83f19bae0000f6755115f` | `adapted` | 证明项目已有“重复键保留 existing”的显式 merge；课程改为中性记录并要求解释保留第一条的业务含义。 |
| `dzzz-app/src/main/java/com/tdh/bdzz/cache/DzzzDxpzCacheLoader.java` | `DzzzDxpzCacheLoader#run(String...)` | `fa21fff1f9296c85851262f8c40214399e0f9c954f8bec7c4d12040157c03644` | `rejected` | `stream().forEach` 仅向共享 Map 写入，不进入推荐正文；教学改用清晰循环或直接 Collector，并单独解释副作用边界。不能据此声称项目运行错误。 |

对当前 `src/main/java/**/*.java` 的窄范围字面检查没有发现 `.parallelStream()` 或
`Collectors.partitioningBy`，因此这两节只由官方合同与临时 fixture 支持；项目中存在
`Collectors.joining` 直接证据。字面检查不替代调用路径或运行时证明，也不证明项目永远不间接并行。

## Java 8 / Spring Boot 2.3 兼容写法

Java 8 已引入 Lambda、方法引用、`java.util.function` 与 Stream。本课的目标类型、effectively final、
惰性、单次消费、非干扰、遇到顺序和并行核心合同可使用 Java 8 共同示例。

Java 8 已支持 `Collectors.toList()`、`toSet()`、`toMap()`、`groupingBy()`、`partitioningBy()` 和 `joining()`，
但没有 Java 10 的 `Collectors.toUnmodifiableList()`，也没有 Java 16 的 `Stream.toList()`。Java 8 若
需要不可修改收集结果，可用：

```java
List<String> names = source.stream()
        .map(User::getName)
        .collect(Collectors.collectingAndThen(
                Collectors.toList(),
                Collections::unmodifiableList));
```

该写法是不暴露内部可变 accumulator 后返回不可修改 view，不代表元素对象深不可变，也没有
`toUnmodifiableList()` 的“收集时明确拒绝 null”合同。Spring Boot 2.3.12.RELEASE 不改变 Java
Stream 合同；框架线程上下文、事务、延迟加载和数据库游标另属后续课程边界。
[来源：`jls8-functional-interface`、`jls8-lambda`、`jls8-effective-final`、
`jls8-method-reference`、`api8-function-package`、`api8-stream`、`api8-collectors`]

## 新旧版本差异

| 对比项 | Java 25 现代线 | Java 8 项目补充线 | 课程处理 |
| --- | --- | --- | --- |
| Lambda、函数式接口、方法引用 | 支持 | Java 8 已支持 | 核心语法使用双版本共同源码 |
| Stream 惰性、单次消费与并行模式 | 支持 | 核心合同一致 | 双版本运行同一核心 fixture |
| `Collectors.toList` / `toSet` | 可用；均不保证实现或可变性，`toSet` 为 unordered | 可用；合同一致 | List 只依赖内容与遇到顺序；Set 只依赖集合内容 |
| `Collectors.toUnmodifiableList` | 可用，Since 10，拒绝 null | 不可用 | 现代专属正向 + Java 8 负向编译 |
| `Stream.toList` | 可用，Since 16，返回不可修改 List | 不可用 | 只作现代对照，不能与 Collector 混称 |
| `toMap` / `groupingBy` / `partitioningBy` / `joining` | 可用 | Java 8 已支持 | 共同示例保持 Java 8 语法 |
| Lambda 参数使用 `var` | Java 11+ 可用 | 不可用 | 本课不用 `var`，避免分散目标类型主线 |

## 易错点取证

| 现象 | 原因 | 后果 | 修正 | 计划验证 |
| --- | --- | --- | --- | --- |
| 把 Lambda 当作无类型匿名方法单独保存 | Lambda 依赖目标函数式接口 | 编译器无法推导或重载歧义 | 先写准确的接口类型或方法参数合同 | 缺少目标类型的负向编译 |
| 捕获局部变量后再次赋值 | 变量不再 effectively final | 编译失败 | 计算好最终值再捕获，把结果作为流水线输出 | 双版本负向编译 |
| 用可变容器绕过捕获限制 | 只保持引用稳定，没有消除共享状态 | 顺序依赖、竞态或不可复现结果 | 使用 `map`、`reduce`、`collect` 返回结果 | 正向 Collector 对照；不以竞态次数作稳定断言 |
| 把 `Type::instanceMethod` 当静态调用 | 未绑定方法引用的首个输入是接收者 | 函数接口参数数量或类型不匹配 | 展开为等价 Lambda 后检查参数 | 四类方法引用正向和错误目标类型负向编译 |
| 把 inexact 方法引用直接传给重载方法并期待自动消歧 | 重载适用性判断时目标类型尚未完成，inexact 引用通常只贡献参数数量 | 调用歧义并编译失败 | 先绑定明确函数式接口变量或显式转换目标类型 | Java 25 歧义负例与显式目标类型正例 |
| 只调用 `filter` / `map` 就期待执行 | 中间操作惰性 | 没有遍历，也没有输出 | 添加真正需要的终止操作 | 终止前后计数器对照 |
| 终止后复用同一个 Stream | Stream 是一次性流水线 | 可能抛 `IllegalStateException` 或形成非法程序 | 从来源重新创建 Stream | 固定 JDK 复用负例 |
| 假设 `Collectors.toList()` 一定返回可变 `ArrayList` | API 不保证实现和可变性 | 强转或修改依赖可能随实现变化 | 需要实现时用 `toCollection`，需要不可修改时选明确 API | 仅验证内容；静态审查禁止实现类断言 |
| 依赖 `Collectors.toSet()` 的迭代顺序或 `HashSet` 实现 | `toSet` 是 unordered Collector，且不保证实现类 | 输出顺序或强转行为不稳定 | 只依赖 Set 内容；有顺序要求时显式选择容器 | 只断言集合相等，不断言遍历顺序 |
| `toUnmodifiableList()` 收集 null | 该 Collector 明确拒绝 null | `NullPointerException` | 先定义 null 策略并过滤、拒绝或转换 | Java 25 null 负例 |
| 两参数 `toMap` 遇到重复键 | 默认合并策略无条件抛异常 | 终止收集失败 | 证明键唯一或提供有业务含义的 merge function | 双版本重复键失败与 merge 正例 |
| 用 `groupingBy` 表达固定二分 | 没表达 true/false 固定结构 | 调用方需猜键是否存在 | 使用 `partitioningBy` | 核对两键始终存在 |
| 依赖 HashMap 流或普通 `forEach` 的输出顺序 | 来源或终止操作没有相应顺序保证 | 展示、签名或协议输出不稳定 | 选择有序来源、显式排序或 `forEachOrdered` | 有序来源 joining / forEachOrdered 精确输出 |
| 在 Stream 中修改来源 | 违反 non-interference | 异常、错误答案或不合规行为 | 流水线期间不修改非并发来源 | 独立负例，不把特定异常写成唯一结果 |
| 把 `parallelStream()` 当通用加速开关 | 拆分、调度、合并与顺序都有成本 | 更慢、竞态、上下文丢失或结果不稳定 | 先证明无状态与结合性，再在真实负载测量 | 只验结果一致；性能结论 deferred |
| 用错误 identity、非结合 accumulator 或不兼容 combiner 做并行归约 | 分块结果无法按同一代数合同重组 | 顺序与并行结果可能不同 | 逐项验证恒等元、结合性和兼容公式，优先用现成求和/统计 Collector | 合法整数加法与三参数兼容公式正向断言 |

## 最小 Java 25 与 Java 8 fixture 计划

所有资产在 `/tmp` 的 `mktemp -d` 目录创建，方法和构造器上方写规范中文注释；完成后使用
`find "$fixtureDir" -depth -delete` 清理，不在仓库保留测试文件。

预定使用与基础课一致的固定镜像：

| 角色 | 固定镜像 | 预期工具 |
| --- | --- | --- |
| modern | `eclipse-temurin:25-jdk@sha256:12e44624adee6808a36d962717e1656e0afeeeff5a100f9cb00e0136513558f0` | `javac 25.0.3` |
| legacy | `eclipse-temurin:8-jdk@sha256:c8b86f2c0a9bd6cc1b7fabc5d1a097501a166eea7cad3b2764e90e96178bea9b` | `javac 1.8.0_492` |

### 共同正向 fixture

`LambdaStreamCore.java` 只使用 Java 8 语法，在两版以 `-Xlint:all -Werror` 编译并运行：

1. 用 `Predicate`、`Function`、`Consumer`、`Supplier` 验证目标类型。
2. 捕获 effectively final 的阈值并验证结果。
3. 分别运行静态、已绑定、未绑定和构造器方法引用，并验证显式目标类型可消除预设的重载歧义。
4. 在 Predicate 中增加观察计数，验证终止前为 0、终止后为实际消费数。
5. 运行 `filter -> map -> collect(toList)` 并核对遇到顺序。
6. 运行 `toSet`、`toMap` merge、`groupingBy`、`partitioningBy` 与 `joining`；Set 只核对内容，其余核对
   精确结构和字符串。
7. 用 identity 为 `0` 的整数加法归约分别执行 sequential / parallel，并让三参数归约显式核对
   accumulator / combiner 兼容公式；只断言结果，不断言速度和工作线程。

### 共同负向 fixture

- `LambdaCaptureFails.java`：捕获后重新赋值，两个 `javac` 都应退出非零。
- `MethodReferenceTargetFails.java`：给方法引用错误目标参数/返回类型，两个 `javac` 都应退出非零。
- `MethodReferenceOverloadFails.java`：将 inexact 方法引用直接传给无法判定最具体候选的重载方法，Java 25
  `javac` 应退出非零；对应显式函数式接口变量或转换版本应通过。
- `DuplicateKey.java`：两参数 `toMap` 收集重复键，两个运行均应以 `IllegalStateException` 失败；再运行
  显式 merge 的正确版本。
- `StreamReuse.java`：在固定 OpenJDK 镜像记录终止后复用得到的 `IllegalStateException`；课程文字仍保留
  API 的“实现检测到时可能抛出”边界。
- `SourceInterference.java`：只用于说明修改非并发来源不合法，不把某个特定异常当作跨实现保证。

### Java 25 专属 fixture

- `ModernCollectors.java`：验证 `Collectors.toUnmodifiableList()` 的内容、不可修改和 null 拒绝。
- 同文件对照 `Stream.toList()` 的不可修改结果与 Since 16 边界，不声称两者 null 合同相同。

### Java 8 专属 fixture

- `ModernApiUnavailable.java`：引用 `Collectors.toUnmodifiableList()` 与 `Stream.toList()`，Java 8 编译应
  退出非零。
- `LegacyUnmodifiable.java`：使用 `collectingAndThen(toList(), Collections::unmodifiableList)`，验证
  内容和修改失败，不声称深不可变或 null 拒绝。

研究阶段未执行上述 fixture。实施批次必须记录每个命令、镜像摘要、退出码、精确输出/诊断和清理结果，
再进入课程页面与 signoff Gate。

## 课程小点建议

正文的“零基础知识点详解”建议拆成以下独立三级标题，每点都完整说明是什么、作用、场景、步骤、最小
示例、运行结果和误区：

1. 函数式接口与目标类型：从普通接口实现过渡到 Lambda，认识四个核心函数式接口。
2. Lambda 语法与 effectively final：参数、表达式体、代码块体、返回值和捕获边界。
3. 四种方法引用：逐个展开为等价 Lambda，先看目标类型再读 `::`，并解释重载歧义的显式消除方式。
4. 创建 Stream 与搭建流水线：集合、数组、工厂、来源/中间/终止三段结构。
5. 惰性、中间操作与短路：`filter`、`map`、`sorted`、`limit` 何时真正执行。
6. 终止操作与单次消费：`collect`、`count`、match/find、`forEach`，以及为何不能复用。
7. 收集 List、Set 与 Map：`toList`、`toSet`、`toUnmodifiableList`、`Stream.toList` 对照和 `toMap`
   重复键策略。
8. 分组、分区与连接：`groupingBy`、`partitioningBy`、`joining` 的输入、结果与选择条件。
9. 遇到顺序与副作用：来源顺序、执行顺序、`forEachOrdered`、non-interference 和 statelessness。
10. 并行流边界与版本差异：归约恒等元、结合性与合并兼容合同，何时不使用、如何验证结果与性能，
    Java 25 / Java 8 兼容写法。

“从零跟着做”使用一个中性订单或学员集合贯穿：先循环实现，再逐步改成顺序 Stream，最后收集 List、
Map、分组和摘要字符串。并行部分只改一个满足结合性的纯计算 fixture，不把项目业务代码改成并行示例。

## 研究缺口与排除项

- 当前环境未提供 Tavily；本批未新增候选来源，只用 `curl -L --fail` 直接复核已有 Oracle、OpenJDK 与
  Dev.java 官方页面。OpenJDK 对默认 curl User-Agent 返回 403，使用普通浏览器 User-Agent 后与其余
  Java 25 官方 URL 一并返回 HTTP 200；这属于访问条件，不改变来源结论。
- 本研究没有执行 Java 25/8 fixture、Docker、课程工程 Gate 或浏览器验证；这些属于实施批次。
- 没有核验 `ClientChatWsServer` 对应数据库列的唯一约束，因此只纠正课程示例，不报告项目 defect。
- 没有对并行流做 JMH/JFR 或真实业务负载测量，不给出吞吐、延迟或“更快”结论。
- 当前项目字面检查未发现 `parallelStream()` / `partitioningBy`，不扩写为运行时能力缺失结论。
- 不教授自定义 Collector、Collector characteristics 的实现、Gatherer、Reactive Streams 或框架异步。
- 不复制项目业务数据、查询条件、内部地址、日志文本或领域枚举值。
- 不修改冻结 Phase 2 状态；课程实施完成状态必须进入新的独立 signoff。

## 研究 Gate 自检

- [x] 冻结 ID、序号、前置、能力来源和 Phase 2 状态已核对。
- [x] Java 25 现代主线与 Java 8 legacy 补充分开。
- [x] 指定的 Lambda target typing / effectively final、四种方法引用与重载歧义、Stream 惰性 / 单次
      消费 / 非干扰 / 副作用、指定 Collectors 和并行归约约束均有直接来源。
- [x] 每条关键结论绑定来源 ID、版本和最小验证方式。
- [x] 5 个项目证据绑定相对路径、稳定符号、SHA 和四类 usage，且只读核验。
- [x] 当前 HEAD 与冻结快照的差异已显式限定，没有伪造全仓一致结论。
- [x] Java 25 / Java 8 正负 fixture 计划完整，但未把计划写成已执行结果。
- [x] 易错点具备触发原因、后果、修正和计划验证。
- [x] 课程小点按零基础逐步学习顺序拆分。
- [x] 未修改或运行 `dzzz-app`，未暂存、提交或推送。

## Stop Boundary

本文件只完成 Phase C 的 I-01 研究复核。不得把本研究稿视为课程正文、运行时 `available`、fixture
已通过、浏览器已验收或 signoff 已关闭；这些必须由父任务继续实施并形成独立证据后，才能领取 I-02。
