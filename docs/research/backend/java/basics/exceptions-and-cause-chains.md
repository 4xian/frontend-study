# 异常层级、传播、捕获与 cause 链研究记录

## 冻结课程合同

- `batch`：`B-10`
- `courseId`：`backend.java.learn.basics.exceptions-and-cause-chains`
- `title`：异常层级、传播、捕获与 cause 链
- `nature`：必修、重排
- `estimatedMinutes`：`75`
- `purpose / collection / level / depth`：`learn / basics / beginner / lesson`
- `sequence`：`200`
- 唯一前置：B-09 `backend.java.learn.basics.enums-and-finite-values`
- `related`：`[]`
- `sourceCapabilityIds`：`[JAVA-LANG-009, JAVA-STDLIB-033, JAVA-RISK-011]`
- `origin`：`[project-observed, risk-correction]`
- `selectionReason`：项目直接抛出、捕获和转换异常；风险证据只用于纠正吞没、宽泛捕获和 cause
  丢失。
- `projectEvidenceCount`：`JAVA-LANG-009: 359`、`JAVA-STDLIB-033: 3`、
  `JAVA-RISK-011: 400`
- `representativeProjectEvidence`：`5` 个冻结代表文件
- `modernBaseline`：`Java 25 LTS`
- `legacyBaseline`：`Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE`
  仅作冻结项目补充
- `verifiedAt`：`2026-08-15`
- Phase 2 冻结状态：`researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`
- `snapshotId`：`dzzz-app-20260803-179e722831ab`
- `analysisId`：`dzzz-app-analysis-20260803-958d37cf1be1`

Phase A live 冻结明确要求复用稳定 ID 和 URL，把本课重排为 B-10、75 分钟，并以 B-09 为唯一前置。
本研究稿只冻结 B-10 的教学证据；正文与必要运行时调整由同一 B-10 实施批完成，历史 signoff 保持原样
并在批次末追加 Phase B 复验记录。

本课建立后续 I/O、HTTP、数据访问和错误合同课程共同依赖的异常基础：`Throwable` 层级、checked 与
unchecked 分类、`throw` 与 `throws`、调用链传播、`try`/`catch` 匹配顺序、具体捕获、异常转换时保留
cause，以及 `finally` 覆盖原始失败的风险。multi-catch 只提示“相同处理动作可合并”的边界，不作为
必讲知识点；try-with-resources、suppressed exceptions、关闭顺序和资源所有权归 B-18 I/O 课程。
框架统一异常处理、日志字段、重试和业务错误响应也不进入本课。

本批关闭必须同时满足：

- 以五组零基础主题完整回答“是什么、作用、场景、怎么用、最小示例、运行结果、常见误区”。
- 正向示例同时可观察受检声明、传播、转换与 cause；负向示例覆盖未处理受检异常、不可达 catch、
  cause 丢失、吞没失败和 `finally` 覆盖风险。
- Java 25 与 Java 8 运行同一份 Java 8 兼容反馈源码，不绑定两版诊断文本或完整堆栈的逐字差异。
- 所有源码、class 与日志只进入 `/tmp` 临时目录，并由 `find -depth -delete` 清理。

## 核验基线

| 项目 | 核验结果 |
| --- | --- |
| 核验日期 | 2026-08-15 |
| 现代主线 | Java 25 LTS；OpenJDK JDK 25 页面确认已 GA，Oracle 支持路线将 Java 25 列为 LTS |
| legacy 补充 | Java 8；Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE 只作冻结项目背景 |
| 发现方式 | 通过 Tavily 查找并打开 Oracle、OpenJDK 与 Dev.java 官方页面；搜索摘要只作入口 |
| 最终证据 | JLS 25/8 Chapter 11、Chapter 14，Java SE 25/8 `Throwable`、`Exception`、`Error` API 与 Dev.java Exceptions |
| 项目证据 | 只读取仓库内冻结矩阵、inventory 与抽取记录，不读取、运行或修改 `dzzz-app` |
| 验证设计 | 同一 Java 8 兼容源码在固定 Java 25 与 Java 8 工具链分别编译、运行；资产只放 `/tmp` |

Java 25 与 Java 8 在本课选定的异常分类、受检异常检查、传播、catch 匹配、cause 和 `finally` 合同上
一致。课程必须把语言规范的硬规则、API 合同和项目风险纠正分开：项目出现过的捕获方式只证明场景
存在，不自动成为推荐实践。

## 官方来源卡与直接证据

以下页面均在 `2026-08-15` 直接核验；Tavily 只用于发现候选页面，社区文章、搜索摘要和 AI 输出均未
作为最终依据。

| ID | 直接来源 | sourceType | 适用版本 | claims |
| --- | --- | --- | --- | --- |
| `openjdk-jdk25` | [OpenJDK JDK 25](https://openjdk.org/projects/jdk/25/) | `official-reference` | JDK 25 | JDK 25 是 Java SE 25 的参考实现，并于 2025-09-16 达到 GA。 |
| `oracle-java-roadmap` | [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) | `official-reference` | 2026-08-15 页面状态 | Oracle 将 Java SE 25 列为 LTS，支持表记录其 2025-09 发布。 |
| `jls25-exceptions` | [JLS 25 Chapter 11](https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html) | `specification` | Java 25 | §11.1 定义异常类与 cause；§11.1.1 区分 checked/unchecked；§11.2 定义编译期异常检查；§11.3 定义运行时传播。 |
| `jls25-statements` | [JLS 25 Chapter 14](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html) | `specification` | Java 25 | §14.18 定义 `throw`；§14.20 定义 `try`、catch 从左到右匹配，以及 `finally` abrupt completion 覆盖先前原因。 |
| `jls8-exceptions` | [JLS 8 Chapter 11](https://docs.oracle.com/javase/specs/jls/se8/html/jls-11.html) | `specification` | Java 8 | 对应章节提供相同的异常分类、受检异常检查、cause 和运行时传播合同。 |
| `jls8-statements` | [JLS 8 Chapter 14](https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html) | `specification` | Java 8 | `throw`、`try`/`catch`、catch 顺序和 `finally` 的核心合同与 Java 25 一致。 |
| `api25-throwable` | [Throwable - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html) | `api-doc` | Java 25 | `Throwable` 是可由 JVM 抛出或由 `throw` 抛出的对象根类；提供 cause 构造器、`getCause()` 与一次性 `initCause()`。 |
| `api8-throwable` | [Throwable - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/lang/Throwable.html) | `api-doc` | Java 8 | Java 8 已提供本课需要的 cause 构造器、`getCause()` 与 `initCause()` 合同。 |
| `api25-exception` | [Exception - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Exception.html) | `api-doc` | Java 25 | `Exception` 及其子类表示合理应用可能希望捕获的情况；`RuntimeException` 分支属于 unchecked。 |
| `api8-exception` | [Exception - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/lang/Exception.html) | `api-doc` | Java 8 | `Exception` 层级和 `RuntimeException` 的检查边界与 Java 25 主线一致。 |
| `api25-error` | [Error - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Error.html) | `api-doc` | Java 25 | `Error` 表示严重问题，合理应用通常不应尝试捕获；它及其子类属于 unchecked。 |
| `api8-error` | [Error - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/lang/Error.html) | `api-doc` | Java 8 | Java 8 对 `Error` 的层级、严重故障含义与 unchecked 身份相同。 |
| `dev-java-exceptions` | [Dev.java Exceptions](https://dev.java/learn/exceptions/) | `official-reference` | 当前 Dev.java | 官方教学入口，覆盖异常定义、捕获处理、抛出和 unchecked 异常取舍。 |
| `dev-java-what` | [What Is an Exception?](https://dev.java/learn/exceptions/what-is-an-exception/) | `official-reference` | 当前 Dev.java | 说明异常事件会打断正常指令流，运行时沿调用栈寻找处理器。 |
| `dev-java-catching` | [Catching and Handling Exceptions](https://dev.java/learn/exceptions/catching-handling/) | `official-reference` | 当前 Dev.java | 说明 catch 参数类型、多个处理器、`finally` 和处理/传播路径。 |
| `dev-java-throwing` | [Throwing Exceptions](https://dev.java/learn/exceptions/throwing/) | `official-reference` | 当前 Dev.java | 区分 `throw` 语句与方法声明中的 `throws` 子句，并介绍异常链。 |
| `dev-java-unchecked` | [Unchecked Exceptions - The Controversy](https://dev.java/learn/exceptions/unchecked-exception-controversy/) | `official-reference` | 当前 Dev.java | checked/unchecked 选择取决于调用方是否能合理恢复，不能把所有失败机械改成运行时异常。 |
| `oracle8-chained` | [Chained Exceptions](https://docs.oracle.com/javase/tutorial/essential/exceptions/chained.html) | `official-tutorial-archive` | Java 8 教程补充 | 展示通过 cause 构造器或 `initCause()` 保存底层异常；精确 API 合同仍以 Java SE 8 `Throwable` 为准。 |

## 零基础五组教学冻结

### 1. `Throwable` 层级与 checked/unchecked

- **是什么与作用：** `Throwable` 是可抛出对象的根；`Error`、普通 checked `Exception` 与
  `RuntimeException` 分支决定编译器是否执行 catch-or-declare 检查。
- **何时使用：** 先根据调用方能否合理恢复和方法合同选择异常类型，不按“严重程度”机械选择 checked
  或 unchecked。
- **最小用法与结果：** `throw new IOException(...)` 必须在当前层捕获或向上声明；同位置改为
  `IllegalArgumentException` 时编译器不强制声明。
- **常见误区：** “所有 `Exception` 都是 checked”“unchecked 可以忽略”“`Error` 语法上不能捕获”。
- **证据：** `jls25-exceptions`、`jls8-exceptions`、`api25-exception`、`api25-error`。

### 2. `throw`、`throws` 与调用链传播

- **是什么与作用：** `throw` 在当前执行点抛出对象；`throws` 在方法头公开 checked 失败合同；未处理的
  异常沿调用链寻找兼容处理器。
- **何时使用：** 当前层不能恢复、也不能增加稳定抽象语义时，继续传播比“捕获后原样抛出”更清楚。
- **最小用法与结果：** `read() throws IOException` 抛出后，中间层不捕获，最外层具体 catch 得到同一个
  `IOException` 对象；正常返回路径不会继续执行。
- **常见误区：** 以为写了 `throws` 就会自动创建异常，或以为 `throw` 能替代 checked 声明。
- **证据：** `jls25-exceptions`、`jls25-statements`、`jls8-exceptions`、`jls8-statements`。

### 3. 具体 catch 与匹配顺序

- **是什么与作用：** 多个 catch 从左到右匹配第一个兼容类型，父类型会覆盖它的所有子类型。
- **何时使用：** 当前边界能够恢复、转换或终止某种具体失败时才捕获；不同动作使用不同分支。
- **最小用法与结果：** `FileNotFoundException` 分支放在 `IOException` 前可分别处理；反向排列时后一个
  分支不可达，`javac` 必须失败。
- **常见误区：** 为了“兜底”在普通业务方法捕获 `Throwable`，或把所有异常吞成同一个默认值。
- **边界提示：** Java 8 与 Java 25 都可在相同处理动作下使用 multi-catch；本课不把其类型推断、重抛
  分析或语法细节作为必讲知识点。
- **证据：** `jls25-statements`、`jls8-statements`、`dev-java-catching`。

### 4. 异常转换与 cause 链

- **是什么与作用：** 上层异常表达当前模块的稳定失败语义，cause 保存触发它的底层 throwable。
- **何时使用：** 当前层需要隔离底层库类型，并且能增加不敏感、可诊断的操作上下文时转换。
- **最小用法与结果：** `new CourseLoadException("无法加载课程: " + id, cause)` 让调用方同时得到上层
  消息与 `IOException` cause。
- **常见误区：** 只复制 `cause.getMessage()`，导致 `getCause()` 为 `null`；新代码无必要地先构造再
  调用 `initCause()`。
- **证据：** `api25-throwable`、`api8-throwable`、`dev-java-throwing`、`oracle8-chained`。

### 5. `finally` 与失败不丢失

- **是什么与作用：** 普通 `finally` 在 try/catch 完成后执行；如果它自己 abrupt completion，会覆盖
  先前的完成原因。
- **何时使用：** 本课只把它用于不会改变返回或抛出结果的最小清理，并用其说明“清理代码也不能破坏
  原始失败”。
- **最小用法与结果：** try 抛出 `IllegalStateException`、finally 仅输出清理标记时，调用方仍收到原始
  异常；finally 改为 `return` 时原始异常会消失。
- **常见误区：** 在 finally 返回伪造成功、抛出无关异常，或把手工资源关闭扩展进本课。
- **证据：** `jls25-statements`、`jls8-statements`；资源关闭与 suppressed 诊断明确留给 B-18。

## 现代主线结论

### `Throwable` 层级与 checked/unchecked 分类

`Throwable` 的两个直接分支是 `Error` 和 `Exception`。JLS 25 §11.1.1 将 `RuntimeException` 及其
子类、`Error` 及其子类归为 unchecked exception classes；其余异常类属于 checked exception
classes。因此不能把“所有 `Exception` 都是 checked”当成规则：`RuntimeException` 本身就在
`Exception` 分支内，但不受 catch-or-declare 编译期检查。

- checked exception 用于调用方可能合理恢复、替代处理或继续传播的失败合同；方法体可能抛出它时，
  必须由兼容的 `catch` 处理，或在方法/构造器的 `throws` 子句中声明。
- unchecked 不等于“可以忽略”。`RuntimeException` 常表示前置条件、状态或程序错误，仍需要清楚的
  边界与诊断；编译器只是不强制 catch-or-declare。
- `Error` 代表严重问题。课程不以 `catch (Throwable)` 或 `catch (Error)` 作为普通业务恢复方式，
  也不声称语法上绝对禁止捕获。

以上语言分类由 `jls25-exceptions`、`jls8-exceptions` 约束；恢复取舍参考
`dev-java-unchecked`，不是从冻结项目写法反推。

### `throw` 是执行语句，`throws` 是声明合同

`throw expression;` 在当前执行点抛出一个 `Throwable` 对象并使当前路径 abrupt completion；
`throws ConfigurationException` 写在方法或构造器头部，声明该可调用单元可能向调用方传播的 checked
异常。`throws` 不会主动创建或抛出对象，`throw` 也不能代替方法头对 checked exception 的声明。

```java
/**
 * 表示配置文本无法转换成合法端口。
 */
final class ConfigurationException extends Exception {
    /**
     * 使用上下文消息和原始原因创建异常。
     */
    ConfigurationException(String message, Throwable cause) {
        super(message, cause);
    }
}

/**
 * 解析端口，并把底层格式异常转换成配置异常。
 */
static int parsePort(String raw) throws ConfigurationException {
    try {
        return Integer.parseInt(raw);
    } catch (NumberFormatException cause) {
        throw new ConfigurationException("端口格式无效", cause);
    }
}
```

这里的 `NumberFormatException` 是 unchecked，但边界选择把它转换成带业务上下文的 checked
`ConfigurationException`。转换时把捕获变量作为 cause 传给构造器，调用方既能看到稳定的上层合同，
也能沿 `getCause()` 取回原始类型。

### 异常沿调用链传播，catch 从左到右匹配

当前方法没有兼容处理器时，异常沿调用链向调用方传播；运行时持续查找能处理该异常类或其超类的
catch。一个 `try` 带多个 catch 时，按源码从左到右选择第一个类型兼容的处理器，后续 catch 不再
执行。正因如此，先写 `catch (Exception)` 再写 `catch (NumberFormatException)` 会让后者不可达，
属于编译错误。

捕获顺序应从具体到宽泛。只有组件确实承担统一边界职责，并且能明确地传播、转换、记录或终止当前
工作时，才考虑宽泛捕获；不能因为“不想处理编译错误”就吞掉所有 `Exception` 或 `Throwable`。

### 捕获后必须明确处理语义

一个 catch 至少应做出可验证选择：在本层恢复、补充上下文后重新抛出、转换为更合适的边界异常，
或在真正的顶层边界记录并结束当前操作。空 catch、静默返回默认值以及只打印消息后继续，都可能把
失败伪装成成功并切断诊断信息。具体的日志字段、HTTP 错误响应和重试策略不在本课展开。

捕获应优先选择当前代码真正能处理的最具体类型。宽泛捕获不仅会合并不同失败语义，还可能误把编程
错误当作可恢复业务失败；这条课程纠正同时由 `dev-java-catching` 与冻结 `JAVA-RISK-011` 支持。

### 转换异常时保留 cause 链

`Throwable` 的 `(String message, Throwable cause)` 和 `(Throwable cause)` 构造器会建立因果链；
`getCause()` 返回导致当前异常的底层异常。只写
`new ConfigurationException(cause.getMessage())` 会复制一段可能为空、可能不稳定的文本，却丢失
原始类型、栈轨迹入口和可遍历的因果关系。

优先在自定义异常上提供 cause 构造器并在创建时完成初始化。`initCause()` 是为没有 cause 构造器的
legacy throwable 提供的兼容机制；cause 初始化后不能覆盖，同一个 throwable 最多成功调用一次。
新代码不应先构造再延迟拼接 cause。

### `finally` 可能覆盖原始失败

JLS 25/8 §14.20.2 明确规定：如果 `try` 或 catch 已因原因 R abrupt completion，而 `finally` 又因
原因 S abrupt completion，则整个语句以 S 结束，R 被丢弃。因而 `finally` 中新抛出的异常、`return`
或其他 abrupt completion 都可能覆盖原始异常。课程把 `finally` 限定为不会改变主要结果的最小清理；
资源所有权和 try-with-resources 在 I/O 课程单独处理。

## 当前项目补充

以下只记录冻结 `dzzz-app` 快照中的能力与风险场景。文件 SHA-256 均来自冻结 inventory；
`observed` 表示可作为能力场景，`corrected` 表示只用于说明需纠正的风险，不能复制为推荐实现。

| 文件 | 稳定符号 | 冻结 SHA-256 | 状态 | 可支持的结论 | 不支持的结论 |
| --- | --- | --- | --- | --- | --- |
| `dzzz-app/src/main/java/com/tdh/bdzz/exception/ArgumentNotValidException.java` | `com.tdh.bdzz.exception.ArgumentNotValidException` | `1c2371696fe2ca21efa939fc30d032f9b09eb74a828c4970cfd837bf03b56457` | `observed` | 自定义异常可继承项目异常基类，并提供 `(String, Throwable)` 构造器保留 cause | 该异常的业务语义、框架映射或继承层级适用于所有课程示例 |
| `dzzz-app/src/main/java/com/tdh/bdzz/exception/BpException.java` | `com.tdh.bdzz.exception.BpException` | `bbab82ad2fc763702c75091ea2d1ee6fe139b96dfa43ce8d4ffad5702487b88c` | `observed` | 项目存在继承 `RuntimeException` 的自定义异常基类，并提供 message/cause 构造器 | 所有业务失败都应改成 unchecked，或调用方无需处理 |
| `dzzz-app/src/main/java/com/tdh/bdzz/exception/RateLimitException.java` | `com.tdh.bdzz.exception.RateLimitException` | `00a810fade34a0126993695875fa8638bd44d3aa16f6d5db6848f912d46838fb` | `observed` | 一个具体失败类型可用独立异常类表达，并保留 cause 构造路径 | 本课已经定义限流恢复、HTTP 状态或框架处理合同 |
| `dzzz-app/src/main/java/com/tdh/bdzz/factories/flv/ConverterFactories.java` | `com.tdh.bdzz.factories.flv.ConverterFactories` | `4909d0f87731e736e6cadb770adc21bbe776cb05bd68b1bee6ba89e681b657bc` | `corrected` | 冻结风险来源 `RISK-0011` 记录空 catch 会丢失媒体编码失败 | 空 catch、继续执行或隐藏转换失败是推荐容错方式 |
| `dzzz-app/src/main/java/com/tdh/bdzz/controller/BaseOuterController.java` | `com.tdh.bdzz.controller.BaseOuterController` | `b05816472db460dc86f1503042d697a310559b870447701fe21c462589075623` | `corrected` | 冻结风险矩阵把该文件列入宽泛捕获场景，说明课程需要区分可处理异常与统一边界 | Controller 捕获顶层异常天然正确，或所有异常都可映射为同一结果 |

`JAVA-LANG-009`、`JAVA-STDLIB-033` 和 `JAVA-RISK-011` 的冻结证据数分别为 359、3 和 400；这些集合
可能重叠，研究不把它们相加为“独立文件总数”。风险矩阵的 13 条来源覆盖空 catch、静默吞没、宽泛
`Exception`/`Throwable`、不透明传播、`finally` 覆盖原失败和转换时应保留 cause 等纠正场景。

## Java 8 / Spring Boot 2.3 兼容写法

本课正向示例只使用 Java 8 已有的异常声明、`try`/`catch`、构造器和 cause API，可由 Java 8 与 Java
25 同源编译。Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE 仅提供冻结项目背景，
不参与语言反馈环，也不引入框架异常处理 API。

Java 8 兼容的推荐转换仍是：

```java
/**
 * 表示旧版配置读取边界中的格式失败。
 */
final class LegacyConfigurationException extends Exception {
    /**
     * 使用稳定上下文和底层原因创建异常。
     */
    LegacyConfigurationException(String message, Throwable cause) {
        super(message, cause);
    }
}

/**
 * 转换端口格式异常，同时保留底层原因。
 */
static int parseLegacyPort(String raw) throws LegacyConfigurationException {
    try {
        return Integer.parseInt(raw);
    } catch (NumberFormatException cause) {
        throw new LegacyConfigurationException("端口格式无效", cause);
    }
}
```

不得因为项目运行在 Java 8 就使用空 catch、只复制 `getMessage()` 或依赖 `initCause()` 拼接新异常；
这些都不是版本兼容要求。

## 新旧版本差异

| 对比项 | Java 25 现代线 | `dzzz-app` Java 8 补充线 | 课程处理 |
| --- | --- | --- | --- |
| `Throwable` 层级与 checked/unchecked 分类 | 本课合同适用 | 合同一致 | 同一分类说明，不制造版本差异 |
| catch-or-declare | checked exception 必须捕获或声明 | 合同一致 | 两个 `javac` 编译同一正误源码 |
| catch 匹配与传播 | 从左到右选择第一个兼容 catch | 合同一致 | 同一错误 catch 顺序要求编译失败 |
| cause API | 构造器、`getCause()`、一次性 `initCause()` | 本课所需 API 均已存在 | 正向输出检查 cause 类型 |
| `finally` 覆盖 | abrupt completion 可覆盖先前原因 | 合同一致 | 写入风险说明，不在本课制造破坏性清理示例 |
| 诊断文本与栈轨迹 | 可能包含新版格式和实现细节 | 文本、行号和实现细节可能不同 | signoff 不要求 stderr 或完整栈轨迹逐字相同 |
| Spring 框架处理 | 不参与 Java 语言合同 | 冻结版本只作项目背景 | 留给框架异常边界课程 |

## 易错点取证

| 现象 | 触发条件 | 原因 | 后果 | 错误示例 | 正确写法 | 影响版本 | 验证方式 | 来源 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| checked exception 既不捕获也不声明 | 方法体直接抛出 `new Exception(...)`，方法头没有兼容 `throws` | JLS 对 checked exception 执行 catch-or-declare 编译期检查 | `javac` 非零，调用合同无法成立 | `static void fail() { throw new Exception("checked"); }` | 在本层处理，或声明最具体的 checked 类型并由调用方继续决策 | Java 8、Java 25 | 两个固定 JDK 编译同一错误源码，均要求非零 | `jls25-exceptions`、`jls8-exceptions` |
| 具体 catch 放在宽泛 catch 之后 | `catch (Exception)` 后再写 `catch (NumberFormatException)` | catch 从左到右匹配，前者已覆盖后者所有值 | 后一个 catch 不可达，编译失败 | 先 `Exception` 后 `NumberFormatException` | 先具体后宽泛；若宽泛分支没有真实职责则删除它 | Java 8、Java 25 | 两个固定 JDK 编译同一错误顺序，均要求非零 | `jls25-statements`、`jls8-statements` |
| 转换异常只复制消息 | 捕获后执行 `new CustomException(cause.getMessage())` | 新异常没有关联原始 throwable | `getCause()` 为 `null`，原始类型和链路丢失 | 只调用 message 构造器 | `new CustomException("稳定上下文", cause)` | Java 8、Java 25 | 行为负向程序要求 cause 非空，错误实现应非零 | `api25-throwable`、`api8-throwable`、`dev-java-throwing` |
| 空 catch 或静默返回默认值 | 捕获解析失败后什么也不做，或直接返回 `0` | 失败被转换成正常控制流且没有可观察信号 | 调用方把无效输入误判为有效结果，故障难以诊断 | `catch (NumberFormatException ignored) { return 0; }` | 恢复、传播、保留 cause 的转换，或由明确顶层边界终止操作 | Java 8、Java 25 | 无效输入触发断言，证明错误实现把失败伪装为正常值 | `dev-java-catching`、`JAVA-RISK-011` |
| 把 unchecked 理解为无需处理 | 只因编译器不强制声明就忽略 `RuntimeException` | unchecked 是编译期分类，不是可靠性结论 | 编程错误和可恢复失败在边界混合，诊断或响应不稳定 | 捕获所有 `RuntimeException` 后继续成功路径 | 只捕获能处理的具体类型，其余交给明确的上层失败边界 | Java 8、Java 25 | 课程审查捕获类型、处理职责和退出路径 | `jls25-exceptions`、`jls8-exceptions`、`dev-java-unchecked` |
| `finally` 覆盖原始异常 | `try` 已抛异常，`finally` 又抛异常或 `return` | `finally` 的 abrupt completion 原因会替代先前原因 | 原始失败被丢弃，调用方看到次生结果 | 在 `finally` 中 `throw new IllegalStateException(...)` | 让清理保持最小且不改变主结果；资源关闭交由后续 try-with-resources 课程 | Java 8、Java 25 | 以 JLS 合同和代码审查作为本课证据，不运行破坏性清理示例 | `jls25-statements`、`jls8-statements` |
| 普通业务边界捕获 `Throwable` 或 `Error` | 为了“兜住一切”而捕获顶层类型 | `Error` 表示合理应用通常不应尝试恢复的严重问题 | 严重运行时状态可能被误报为业务成功或普通失败 | `catch (Throwable failure) { return fallback; }` | 捕获当前层能明确处理的最具体异常；严重错误保持失败语义 | Java 8、Java 25 | 代码审查 catch 参数与边界职责 | `api25-error`、`api8-error`、`jls25-exceptions` |

## 可重复验证设计

验证资产全部写入 `/tmp` 下的 `mktemp -d` 目录，仓库不保留 Java 源码、class、fixture 或测试文件。
研究阶段只定义反馈环与预期，不把尚未执行的结果写成 PASS。

| 角色 | 固定镜像 | 预期工具版本 |
| --- | --- | --- |
| modern | `eclipse-temurin:25-jdk@sha256:12e44624adee6808a36d962717e1656e0afeeeff5a100f9cb00e0136513558f0` | `javac 25.0.3` |
| legacy | `eclipse-temurin:8-jdk@sha256:c8b86f2c0a9bd6cc1b7fabc5d1a097501a166eea7cad3b2764e90e96178bea9b` | `javac 1.8.0_492` |

### 正向 cause 链反馈环

在临时目录创建 `ExceptionFeedback.java`，两个固定 JDK 分别编译和运行：

```java
/**
 * 表示配置值无法按合同解析。
 */
final class ConfigurationException extends Exception {
    /**
     * 使用稳定消息和底层原因创建配置异常。
     */
    ConfigurationException(String message, Throwable cause) {
        super(message, cause);
    }
}

/**
 * 验证 checked 声明、异常转换和 cause 链。
 */
public final class ExceptionFeedback {
    /**
     * 解析端口，并保留底层数字格式异常。
     */
    static int parsePort(String raw) throws ConfigurationException {
        try {
            return Integer.parseInt(raw);
        } catch (NumberFormatException cause) {
            throw new ConfigurationException("端口格式无效", cause);
        }
    }

    /**
     * 输出上层异常类型、cause 类型和稳定上下文消息。
     */
    public static void main(String[] args) {
        try {
            parsePort("not-a-number");
        } catch (ConfigurationException failure) {
            System.out.println(
                    "type="
                            + failure.getClass().getSimpleName()
                            + "|cause="
                            + failure.getCause().getClass().getSimpleName()
                            + "|message="
                            + failure.getMessage());
        }
    }
}
```

两个版本都预期编译和运行退出 0，并逐字输出：

```text
type=ConfigurationException|cause=NumberFormatException|message=端口格式无效
```

该输出同时证明：自定义 checked 类型承担上层合同、底层 `NumberFormatException` 沿 cause 保留，且
课程消息提供稳定上下文而不依赖底层异常文本。这里只记录预期，实际 PASS 必须由后续 signoff 运行
固定工具链后产生。

### 负向编译反馈环

第一个临时文件验证 checked exception 不可绕过 catch-or-declare：

```java
/**
 * 验证未处理 checked exception 会编译失败。
 */
public final class UnhandledChecked {
    /**
     * 错误示例：抛出 checked exception 但既不捕获也不声明。
     */
    static void fail() {
        throw new Exception("checked");
    }
}
```

第二个临时文件验证具体 catch 不可放在已覆盖它的宽泛 catch 之后：

```java
/**
 * 验证 catch 处理器的源码顺序约束。
 */
public final class UnreachableCatch {
    /**
     * 错误示例：宽泛处理器使后续具体处理器不可达。
     */
    static void parse(String raw) {
        try {
            Integer.parseInt(raw);
        } catch (Exception failure) {
            System.out.println("broad=" + failure.getClass().getSimpleName());
        } catch (NumberFormatException failure) {
            System.out.println("specific=" + failure.getClass().getSimpleName());
        }
    }
}
```

Java 25 与 Java 8 的 `javac` 对两个文件都预期非零退出，共四次负向编译。诊断措辞和定位可能随 JDK
版本变化；signoff 绑定源码身份与退出码，不要求 stderr 逐字一致。

### cause 丢失行为负向反馈环

以下错误实现故意只复制 message。程序要求转换后的 cause 非空，因此预期以 `AssertionError` 非零
退出：

```java
/**
 * 错误示例：只保留消息而不保存 cause。
 */
final class MessageOnlyException extends Exception {
    /**
     * 只使用消息创建异常，故意丢失底层原因。
     */
    MessageOnlyException(String message) {
        super(message);
    }
}

/**
 * 验证只复制消息不能形成 cause 链。
 */
public final class LostCauseFeedback {
    /**
     * 错误地把数字格式异常转换为 message-only 异常。
     */
    static int parse(String raw) throws MessageOnlyException {
        try {
            return Integer.parseInt(raw);
        } catch (NumberFormatException failure) {
            throw new MessageOnlyException(failure.getMessage());
        }
    }

    /**
     * 要求转换后仍能取得底层原因。
     */
    public static void main(String[] args) throws MessageOnlyException {
        try {
            parse("not-a-number");
        } catch (MessageOnlyException failure) {
            if (failure.getCause() == null) {
                throw new AssertionError("cause 丢失");
            }
        }
    }
}
```

两个 JDK 都预期编译成功、运行非零，并在 stderr 中出现 `AssertionError`；底层
`NumberFormatException` 的具体消息不作为稳定断言。

### 静默返回行为负向反馈环

以下错误实现把无效输入变成正常整数 `0`，调用方断言该路径不得伪装成功：

```java
/**
 * 验证静默返回默认值会隐藏解析失败。
 */
public final class SwallowedFailureFeedback {
    /**
     * 错误示例：捕获格式失败后静默返回零。
     */
    static int parseOrZero(String raw) {
        try {
            return Integer.parseInt(raw);
        } catch (NumberFormatException ignored) {
            return 0;
        }
    }

    /**
     * 证明无效输入被错误实现伪装成正常结果。
     */
    public static void main(String[] args) {
        int result = parseOrZero("not-a-number");
        if (result == 0) {
            throw new AssertionError("解析失败被伪装成正常值");
        }
    }
}
```

两个 JDK 都预期编译成功、运行非零且 stderr 含 `AssertionError`。这里不把 `0` 定义为普遍非法
业务值；它只证明这个最小错误实现没有向调用方保留“解析失败”这一事实。

### 复跑记录与清理

后续 signoff 必须记录镜像 digest、`javac -version`、`java -version`、每次编译/运行退出码、正向
精确 stdout 和负向 stderr 的最小类型标记。所有临时资产位于同一个 `mktemp -d` 目录，结束时使用
`find <temp-dir> -depth -delete` 清理；不得把临时测试、class 或浏览器输出加入仓库。

| 研究结论 | 后续课程最小观察 | signoff 证据 |
| --- | --- | --- |
| checked exception 可声明并向上层转换 | `parsePort` 声明 `throws ConfigurationException` | 两个 JDK 正向编译退出 0 |
| cause 构造器保留底层类型 | 输出 `cause=NumberFormatException` | 两个 JDK 精确 stdout |
| 未处理 checked exception 编译失败 | `UnhandledChecked` | 两个 `javac` 非零 |
| catch 从具体到宽泛 | `UnreachableCatch` | 两个 `javac` 非零 |
| message-only 转换丢失 cause | `LostCauseFeedback` | 两个 JDK 运行非零且出现 `AssertionError` |
| 静默默认值隐藏失败 | `SwallowedFailureFeedback` | 两个 JDK 运行非零且出现 `AssertionError` |

## 被排除或尚未证实的说法

- 不讲 try-with-resources、suppressed exceptions、资源关闭顺序和关闭异常合并；这些属于 I/O 与资源
  所有权课程。
- multi-catch 仅提示“处理动作相同时可合并”的边界；不讲其类型推断、精确重抛分析或专项示例，也不讲
  自定义堆栈裁剪、虚拟线程异常处理或 JVM 崩溃恢复。
- 不把 checked exception 宣传为始终优于 unchecked，也不把 unchecked 当成无需处理；选择取决于
  调用方是否能合理恢复和边界合同。
- 不把所有 `Exception` 误写为 checked，不把 `Error` 写成语法上不可捕获。
- 不把项目的空 catch、宽泛捕获、默认值返回、日志文本或 Controller 结果包装复制为现代推荐写法。
- 不把 Spring `@ExceptionHandler`、`@ControllerAdvice`、事务回滚、HTTP 状态映射或日志框架行为归因于
  JLS；这些需要按精确框架版本另行研究。
- 不声称完整异常栈、异常消息或 `javac` 诊断在 Java 25 与 Java 8 逐字相同。
- 不给出未经实际基准验证的“异常性能”结论，也不以性能理由要求吞没或预先捕获异常。

## 官方来源清单

- [OpenJDK JDK 25](https://openjdk.org/projects/jdk/25/) - Java SE 25 参考实现与 GA 状态。
- [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) -
  Java 25 LTS 状态。
- [JLS 25 Chapter 11](https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html) - 异常类、编译期
  检查和运行时传播。
- [JLS 25 Chapter 14](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html) - `throw`、
  `try`/`catch` 与 `finally`。
- [JLS 8 Chapter 11](https://docs.oracle.com/javase/specs/jls/se8/html/jls-11.html) - Java 8 异常分类、
  检查和传播合同。
- [JLS 8 Chapter 14](https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html) - Java 8 语句与处理器合同。
- [Throwable - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html) -
  cause 构造器、`getCause()` 与 `initCause()`。
- [Throwable - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/lang/Throwable.html) - Java 8 cause API。
- [Exception - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Exception.html) -
  `Exception` 层级。
- [Exception - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/lang/Exception.html) - Java 8
  `Exception` 层级。
- [Error - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Error.html) -
  严重问题与 unchecked 身份。
- [Error - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/lang/Error.html) - Java 8 `Error` 合同。
- [Dev.java Exceptions](https://dev.java/learn/exceptions/) - 官方异常课程入口。
- [What Is an Exception?](https://dev.java/learn/exceptions/what-is-an-exception/) - 异常事件和调用栈传播。
- [Catching and Handling Exceptions](https://dev.java/learn/exceptions/catching-handling/) - catch 与处理路径。
- [Throwing Exceptions](https://dev.java/learn/exceptions/throwing/) - `throw`、`throws` 与异常链。
- [Unchecked Exceptions - The Controversy](https://dev.java/learn/exceptions/unchecked-exception-controversy/) -
  checked/unchecked 取舍。
- [Chained Exceptions](https://docs.oracle.com/javase/tutorial/essential/exceptions/chained.html) - Java 8 教程的
  cause 链补充。

## 发布前自检

- [x] 冻结课程合同、sequence、前置课程、来源能力 ID、三类证据数和 Phase 2 状态均已对齐。
- [x] 现代 Java 25 与 Java 8 legacy 版本均明确；Spring Boot / Framework 仅作冻结项目背景。
- [x] 每条语言和 cause 关键结论均绑定 JLS、Java SE API 或 Dev.java 直接页面。
- [x] 5 个代表项目文件均记录稳定符号、冻结 SHA-256 和 `observed`/`corrected` 边界。
- [x] 易错点覆盖 checked 检查、catch 顺序、cause 丢失、吞没、unchecked 误读和 `finally` 覆盖。
- [x] 所有验证代码块中的方法与构造器定义上方均有规范中文注释。
- [x] Java 25/8 反馈环只设计 `/tmp` 临时资产；没有把未执行结果写成 PASS。
- [x] 未修改 `dzzz-app`、课程正文、catalog、进度、Reference 或其他批次文件。

## Stop Boundary

本研究记录只授权 Phase B 的 B-10 `exceptions-and-cause-chains`。只有本课研究、正文、Java 25/8
反馈环、catalog、搜索、进度、浏览器、完整 Gate、signoff 及 Standards / Spec 审查全部通过后，才可
宣布 B-10 关闭。研究稿通过校验不等于课程批次关闭，也不授权提前读取、研究或启动下一课程、其他
课程、Reference 或项目实战。
