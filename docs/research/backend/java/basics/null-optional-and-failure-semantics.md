# B-16：null、Optional、缺失与失败语义官方研究

## 冻结课程合同

- `courseId`：`backend.java.learn.basics.null-optional-and-failure-semantics`
- `phaseBatch`：`B-16`
- `title`：null、Optional、缺失与失败语义
- `durationMinutes`：`75`
- `purpose / collection / level / depth`：`learn / basics / beginner / lesson`
- `sequence`：`240`
- `prerequisites`：`[backend.java.learn.basics.collections-and-iteration-contracts]`（唯一前置 `B-15`）
- `related`：`[]`
- `sourceCapabilityIds`：`[JAVA-STDLIB-009, JAVA-RISK-007]`
- `origin`：`[project-observed, risk-correction]`
- `selectionReason`：项目存在 Optional 使用和大量空值风险；课程必须区分缺失、失败与合法空结果。
- `projectEvidenceCount`：`JAVA-STDLIB-009: 4`、`JAVA-RISK-007: 132`
- `modernBaseline`：`Java 25 LTS`
- `legacyBaseline`：`Java 8 / Spring Boot 2.3.12.RELEASE`，只作冻结项目兼容补充
- `snapshotId`：`dzzz-app-20260803-179e722831ab`
- `analysisId`：`dzzz-app-analysis-20260803-958d37cf1be1`

本课只建立 `null`、合法缺失、合法空结果和失败之间的返回合同，并覆盖 Optional 的创建、转换与
默认值选择。集合返回、异常因果链和业务结果对象只连接已有课程，不在本课重复展开。

## 核验基线

| 项目 | 核验结果 |
| --- | --- |
| 核验日期 | 2026-08-15 |
| 现代主线 | Java 25 LTS |
| legacy 补充 | Java 8，只作冻结项目背景 |
| 发现方式 | Tavily 用于发现 Oracle 与 JLS 官方页面；搜索摘要不作最终依据，候选 URL 回到官方页面核验 |
| 最终证据 | Java 25/8 Optional、Objects、Collections API，JLS 25/8，以及 Java 25 NullPointerException API |
| 项目证据 | 只读取冻结矩阵与 inventory，不读取、运行或修改 `dzzz-app` 当前源码 |
| 本机工具链 | 未安装可用 JDK；本稿提供可复制反馈环和固定预期，不声称已在本机编译运行 |
| 验证边界 | Java 25/8 共同反馈环覆盖 Optional 核心；Java 25 单独覆盖增量 API，并要求 Java 8 编译拒绝 |

## 一手来源与结论

### 1. `null` 是引用层面的特殊值，不是缺失或失败的业务解释

- [JLS 25 §4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html) 与
  [JLS 8 §4](https://docs.oracle.com/javase/specs/jls/se8/html/jls-4.html) 都定义了无名的 null type；
  null reference 是其唯一值，并可赋给任意引用类型。
- 同一份 JLS 说明引用类型字段和数组元素的默认值为 null。这个语言事实不携带“未找到”“尚未设置”
  或“执行失败”等领域含义；这些含义必须由方法合同另行定义。
- [JLS 25 §15](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html) 与
  [JLS 8 §15](https://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html) 规定方法调用的目标和实参
  按运行时步骤求值。`orElse(expensiveFallback())` 的参数是普通实参，所以即使 Optional 有值，
  fallback 表达式仍会先求值；懒执行必须使用 `orElseGet(Supplier)`。

### 2. Optional 表达“可能没有返回值”，不是失败容器

- [Java 25 Optional](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Optional.html)
  将 Optional 定义为可能包含 non-null 值的容器；API note 说明它主要作为“可能没有结果”的方法返回
  类型，Optional 类型的变量自身绝不应为 null。
- `Optional.of(value)` 要求 value 非 null，传 null 抛 `NullPointerException`；
  `ofNullable(value)` 把 null 转为 empty；`empty()` 返回无值实例，但不得依赖它是单例，也不得用
  `==` 比较。
- empty 表示合同允许的缺失。输入非法、I/O 失败、状态冲突等失败仍应使用已有异常或明确结果合同；
  把异常吞掉并返回 empty 会丢失失败原因。
- Optional 是 value-based class，不应把实例身份用于同步、identity hash 或 `==` 判断。
- [Java 25 Collections](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Collections.html)
  与 [Java 8 Collections](https://docs.oracle.com/javase/8/docs/api/java/util/Collections.html) 都提供返回不可变
  空列表的 `emptyList()`。因此“查询成功但没有任何元素”应直接返回空集合；Optional 留给“可能没有一个
  单值结果”，不应用来包一层集合。

### 3. `map` 与 `flatMap` 的差别在于 mapper 的返回合同

- Java 25 和 [Java 8 Optional](https://docs.oracle.com/javase/8/docs/api/java/util/Optional.html) 都支持
  `map`、`flatMap`、`filter` 和 `ifPresent`。
- `map` 适用于 mapper 返回普通值；若 mapper 返回 null，结果会按 `ofNullable` 规则变成 empty。
- `flatMap` 适用于 mapper 已返回 Optional，避免得到嵌套的 `Optional<Optional<T>>`；mapper 自身
  返回 null 违反合同并抛 `NullPointerException`。
- 转换链只表达值存在时的纯转换。需要记录失败原因时，不应把异常改写为 empty。

### 4. 默认值和异常必须按求值时机选择

- `orElse(other)` 返回值存在时的值，否则返回已经求值的 other。
- `orElseGet(supplier)` 只在缺失分支调用 supplier，适合有副作用、I/O 或成本的 fallback。
- Java 8 的 `orElseThrow(exceptionSupplier)` 在缺失时由 supplier 创建异常；Java 10+ 还提供无参
  `orElseThrow()`，Java 8 没有该重载。
- Java 25 还提供 Java 9 加入的 `or(Supplier<Optional<T>>)`、`stream()`、`ifPresentOrElse()`，
  Java 10 加入的无参 `orElseThrow()`，以及 Java 11 加入的 `isEmpty()`；Java 8 没有这些方法。共同
  课程示例不能误用这些增量 API。

### 5. `Objects.requireNonNull` 是边界断言，不是缺失建模

- [Java 25 Objects](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Objects.html)
  和 [Java 8 Objects](https://docs.oracle.com/javase/8/docs/api/java/util/Objects.html) 都提供
  `requireNonNull`，用于立即拒绝违反 non-null 前置条件的引用。
- Java 9+ 的 `requireNonNullElse` 与 `requireNonNullElseGet` 不在 Java 8 中。它们适合“null 时选合法
  默认值”，仍不能区分缺失与执行失败。
- 自动拆箱 null 包装值会抛 NPE。边界若允许三态，使用明确枚举或可空合同；若只允许 true/false，
  应在进入拆箱前拒绝 null。

### 6. Helpful NPE 改善定位，不改变设计合同

- [Java 25 NullPointerException#getMessage](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/NullPointerException.html#getMessage())
  规定：未向构造器传入显式消息且 JVM 内部信息仍可用时，`getMessage()` 会返回关于 null reference 的
  verbose description；反序列化得到的 `NullPointerException` 不具备这类内部信息。
- 更具体的错误消息只缩短诊断路径，不会判断 null 应代表缺失、非法输入还是失败，也不会替代方法边界
  的 Optional、异常或结果类型设计。
- 该 API 同时允许实现相关消息或 `null`，所以课程只能让学习者观察诊断，不得精确断言消息文本，更
  不能把 Java 25 的诊断文本写成 Java 8 合同。

## 课程内容决策

1. 先建立四分法：`null` 是语言值；合法缺失用 Optional；合法空集合直接返回空集合；失败保留异常或
   明确失败结果。
2. Optional 主要出现在可能无单值结果的方法返回边界，不作为字段、参数、集合元素或“所有 null 的
   包装器”。
3. Optional 变量自身不得为 null；不要用 `get()` + `isPresent()` 重写分支，应优先使用转换和终结
   操作。
4. 用计数器在 Java 25/8 中实证 `orElse` eager 与 `orElseGet` lazy，不只依赖文字说明。
5. Java 25 增量 API 单独反馈，并要求 Java 8 编译拒绝。
6. Helpful NPE 只放在诊断补充中，不把它写成 null 边界设计。

## 75 分钟教学分配

| 时间 | 教学目标 | 最小可观察反馈 |
| --- | --- | --- |
| 0-10 分钟 | 从零解释引用、null type、null reference 和引用类型默认值 | 读懂“语言允许 null”不等于“业务合同定义了 null” |
| 10-25 分钟 | 建立单值缺失、空集合、非法输入和执行失败四分法 | 为四个返回场景选择 Optional、空集合或异常 |
| 25-45 分钟 | 练习 `empty/of/ofNullable/map/flatMap` | 观察存在、缺失、null mapper 与扁平化结果 |
| 45-60 分钟 | 比较 `orElse/orElseGet/orElseThrow` | 用计数器证明 eager/lazy，并保留失败类型和消息 |
| 60-70 分钟 | 对照 Java 25 与 Java 8 API | Java 25 运行增量 API，Java 8 编译明确拒绝 |
| 70-75 分钟 | 总结返回合同并检查易错点 | 能解释为什么 Optional 自身不能为 null，失败不能伪装成 empty |

## 正文复核边界与补写清单

本批授权只允许读取和修改本研究稿，因此没有读取课程正文，不能把下列项目表述成已观察到的正文
缺陷。正文实现或复核必须逐项核对；缺一项才构成正文不足：

1. 是否先用对象引用示例解释 `null`，再引入 Optional，而不是假定学习者已懂空指针和泛型容器。
2. 是否用同一组业务场景区分“单值未找到”“查询成功但集合为空”“输入非法”“执行失败”。
3. 是否展示 `of(null)` 失败、`ofNullable(null)` 为空，以及 Optional 变量自身返回 null 的错误合同。
4. 是否用可观察输出区分 `map` 与 `flatMap`，而不是只给方法签名。
5. 是否用计数器证明 `orElse` eager 与 `orElseGet` lazy，并沿用前序异常课保留失败原因。
6. 是否把 Java 25 增量 API 与 Java 8 共同 API 分开，避免 legacy 反馈环误用现代方法。
7. 是否说明 Helpful NPE 消息是实现相关诊断，不能作为稳定断言或业务语义。

## 项目证据边界

以下事实只来自冻结矩阵和 inventory。四个 Optional 符号保持 `observed`，一个 null 风险符号只作为
`corrected` 教学边界；本批不读取当前源码，也不声称已人工确认其具体实现。

| 角色 | 文件 | SHA-256 | 使用方式 |
| --- | --- | --- | --- |
| Optional 能力 | `dzzz-app/src/main/java/com/tdh/bdzz/handler/voice2text/TdhDtbVoice2TextHandler.java` | `28cf772df4ae8ca999be517a8c03529b1f3a7892d4e59aa1a67cd7e7ffe9abcc` | observed |
| Optional 能力 | `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/TsFileSignNewOfflineSqtServiceImpl.java` | `8296c0af432d691b7f28bb92cfba7cbb1eed6a4fb187eb38f3ab09af5afcd286` | observed |
| Optional 能力 | `dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/clearExpireData/HyUimSyncDataHandler.java` | `e16c9e81f908df18536d768f74aedf141db1f7cf69c1b02723df08bb25bcda9b` | observed |
| Optional 能力 | `dzzz-app/src/main/java/com/tdh/bdzz/util/ConvertPdf.java` | `f002857b190f1436f73286486cfb7dcb8dd1cf5d66ac6c526890884cb3f81db8` | observed |
| null 风险 | `dzzz-app/src/main/java/com/tdh/bdzz/util/AESUtils.java` | `8e5aeabb5f9034b211fa02937c1a6907fc02f41355fb1baca1d2e581e26cae0b` | corrected |

`JAVA-RISK-007` 合并了多个不同的 null 风险类别，132 是冻结矩阵中的项目证据分母，不代表这 132 个
文件都应机械改成 Optional。每个方法仍需按合法缺失、空结果、失败和非法状态逐一判断。

## 易错点取证

| 易错点 | 官方依据 | 反馈要求 |
| --- | --- | --- |
| Optional 变量自身返回 null | Optional API note | 调用链立即失败，改为 `Optional.empty()` |
| 对可能为 null 的值使用 `Optional.of` | `of` 的 NPE 合同 | 对比 `ofNullable` |
| 用 `orElse` 包裹昂贵或有副作用 fallback | JLS 实参求值 + Optional API | 有值分支中 eager 计数仍增加，lazy 计数不增加 |
| 用 `map` 包装返回 Optional 的 mapper | `map` / `flatMap` 合同 | 对比嵌套层级和扁平结果 |
| 捕获失败后返回 empty | Optional 只表达无值 | 断言失败原因仍由异常因果链保留 |
| Java 8 使用现代 Optional API | Java 8 API 方法清单 | Java 8 编译拒绝 `or/stream/ifPresentOrElse/isEmpty` |

## 验证设计

- Java 25 与 Java 8 共同编译运行：`of`、`ofNullable`、`empty`、`map`、`flatMap`、`orElse`、
  `orElseGet`、supplier 版 `orElseThrow`、Optional 自身 non-null 合同。
- 固定反馈输出必须证明有值分支中 eager fallback 被调用一次，lazy fallback 为零次；缺失分支中两者
  都各调用一次。
- Java 25 单独验证 `or`、`stream`、`ifPresentOrElse`、`isEmpty` 和无参 `orElseThrow()`。
- 同一现代源码在 Java 8 中必须编译失败。
- 所有临时源码与 class 只进入 `/tmp` 的 `mktemp` 目录，并用 `find -depth -delete` 清理。

### Java 25/8 共同反馈环

`OptionalSemantics.java` 只使用 Java 8 已存在的 API。正文应逐行解释四组计数器，避免学习者只记住
“一个快、一个慢”而不知道差别来自参数和 supplier 的求值时机。

```java
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

/** 演示合法缺失、空集合、失败以及 eager/lazy 默认值。 */
public class OptionalSemantics {
  /** 返回 fallback，并记录本次调用。 */
  private static String fallback(AtomicInteger calls) {
    calls.incrementAndGet();
    return "fallback";
  }

  /** 运行 Java 25/8 共同反馈。 */
  public static void main(String[] args) {
    AtomicInteger presentEagerCalls = new AtomicInteger();
    AtomicInteger presentLazyCalls = new AtomicInteger();
    AtomicInteger missingEagerCalls = new AtomicInteger();
    AtomicInteger missingLazyCalls = new AtomicInteger();

    String presentEager = Optional.of("value").orElse(fallback(presentEagerCalls));
    String presentLazy =
        Optional.of("value").orElseGet(() -> fallback(presentLazyCalls));
    String missingEager =
        Optional.<String>empty().orElse(fallback(missingEagerCalls));
    String missingLazy =
        Optional.<String>empty().orElseGet(() -> fallback(missingLazyCalls));

    Optional<Integer> mappedNull = Optional.of("x").map(value -> null);
    Optional<String> flat =
        Optional.of("x").flatMap(value -> Optional.of(value.toUpperCase()));
    List<String> noRows = Collections.emptyList();

    System.out.printf(
        "present=%s,%s; eagerCalls=%d; lazyCalls=%d%n",
        presentEager,
        presentLazy,
        presentEagerCalls.get(),
        presentLazyCalls.get());
    System.out.printf(
        "missing=%s,%s; eagerCalls=%d; lazyCalls=%d%n",
        missingEager,
        missingLazy,
        missingEagerCalls.get(),
        missingLazyCalls.get());
    System.out.println("mappedNullEmpty=" + !mappedNull.isPresent());
    System.out.println("flat=" + flat.orElse("unexpected"));
    System.out.println("emptyListSize=" + noRows.size());

    try {
      Optional.empty().orElseThrow(() -> new IllegalStateException("missing"));
    } catch (IllegalStateException exception) {
      System.out.println(
          "failure=" + exception.getClass().getSimpleName() + ":" + exception.getMessage());
    }
  }
}
```

Java 25 和 Java 8 都必须得到相同输出：

```text
present=value,value; eagerCalls=1; lazyCalls=0
missing=fallback,fallback; eagerCalls=1; lazyCalls=1
mappedNullEmpty=true
flat=X
emptyListSize=0
failure=IllegalStateException:missing
```

### Java 25 增量 API 反馈环

`OptionalModern.java` 有意只放 Java 8 缺失的方法，让 legacy 编译失败能够准确指向 API 差异，而
不是被 `var`、文本块等无关语法差异掩盖。

```java
import java.util.NoSuchElementException;
import java.util.Optional;

/** 演示 Java 25 可用而 Java 8 不可用的 Optional API。 */
public class OptionalModern {
  /** 运行 Java 25 增量 API 反馈。 */
  public static void main(String[] args) {
    Optional<String> recovered =
        Optional.<String>empty().or(() -> Optional.of("fallback"));
    long streamCount = Optional.of("value").stream().count();
    StringBuilder branch = new StringBuilder();
    Optional.<String>empty().ifPresentOrElse(branch::append, () -> branch.append("empty"));

    System.out.println("recovered=" + recovered.orElse("unexpected"));
    System.out.println("streamCount=" + streamCount);
    System.out.println("branch=" + branch);
    System.out.println("isEmpty=" + Optional.empty().isEmpty());

    try {
      Optional.empty().orElseThrow();
    } catch (NoSuchElementException exception) {
      System.out.println("throw=" + exception.getClass().getSimpleName());
    }
  }
}
```

Java 25 固定输出：

```text
recovered=fallback
streamCount=1
branch=empty
isEmpty=true
throw=NoSuchElementException
```

反馈命令要求先把上面两段源码分别保存为临时目录中的 `OptionalSemantics.java` 和
`OptionalModern.java`，并调用两套 JDK 的绝对路径，不能让 `PATH` 偶然选择同一套 JDK。源码与 class
必须全部位于 `mktemp` 创建的目录中：

```bash
feedback_dir="$(mktemp -d /tmp/b16-optional.XXXXXX)"
mkdir -p \
  "$feedback_dir/classes8" \
  "$feedback_dir/classes25" \
  "$feedback_dir/rejected8"

/absolute/path/to/jdk8/bin/javac -d "$feedback_dir/classes8" \
  "$feedback_dir/OptionalSemantics.java"
/absolute/path/to/jdk8/bin/java -cp "$feedback_dir/classes8" OptionalSemantics

/absolute/path/to/jdk25/bin/javac -d "$feedback_dir/classes25" \
  "$feedback_dir/OptionalSemantics.java" "$feedback_dir/OptionalModern.java"
/absolute/path/to/jdk25/bin/java -cp "$feedback_dir/classes25" OptionalSemantics
/absolute/path/to/jdk25/bin/java -cp "$feedback_dir/classes25" OptionalModern

# 预期非零退出，并至少报告 or、stream、ifPresentOrElse、isEmpty 或无参 orElseThrow 不存在。
/absolute/path/to/jdk8/bin/javac -d "$feedback_dir/rejected8" \
  "$feedback_dir/OptionalModern.java"

find "$feedback_dir" -depth -delete
```

本机在 2026-08-15 运行 `/usr/libexec/java_home -V`、`java -version` 和 `javac -version` 均未发现
Java Runtime，所以本批只冻结官方 API 合同、源码与预期；正文实现阶段必须在具备 JDK 25 和 JDK 8
的环境复跑上述反馈，不能把本研究稿当作编译通过证据。

## 排除项

- 不把 Optional 用于集合返回、字段、DTO 序列化、方法参数或 JPA 映射的通用方案。
- 不展开 Vavr、Either、Result 等第三方结果类型。
- 不重复异常课程的 checked/unchecked 和 cause chain 全部内容。
- 不把 Java 25 的 verbose NPE 诊断消息当成 Java 8 合同或 null 设计替代品。
- 不读取、运行或修改当前 `dzzz-app` 源码。
