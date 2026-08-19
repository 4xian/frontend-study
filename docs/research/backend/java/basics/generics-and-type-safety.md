# 泛型、类型边界与类型安全研究记录

## 冻结课程合同

- `courseId`：`backend.java.learn.basics.generics-and-type-safety`
- `title`：泛型、类型边界与类型安全
- `purpose / collection / level / depth`：`learn / basics / beginner / lesson`
- `sequence`：`210`
- `estimatedMinutes`：`75`
- `prerequisites`：`[backend.java.learn.basics.debugging-stack-traces-and-javadoc]`
- `related`：`[]`
- `sourceCapabilityIds`：`[JAVA-LANG-006, JAVA-RISK-008]`
- `origin`：`[project-observed, risk-correction]`
- `selectionReason`：集合、Mapper、结果对象和回调都依赖泛型；原始类型风险仅作为纠错证据。
- `projectEvidenceCount`：`JAVA-LANG-006: 67`、`JAVA-RISK-008: 32`
- `modernBaseline`：`Java 25 LTS`
- `legacyBaseline`：`Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE`
  仅作冻结项目补充
- Phase 2 冻结状态：`researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`
- `snapshotId`：`dzzz-app-20260803-179e722831ab`
- `analysisId`：`dzzz-app-analysis-20260803-958d37cf1be1`

本课建立集合与数据合同课程共同依赖的泛型基础：参数化类型、泛型类与方法、类型上界、通配符读写
边界、捕获、擦除、可具体化类型、原始类型与 heap pollution。集合实现、Stream、Mapper 框架映射、
反射恢复泛型签名和高级递归边界不在本课展开。

## 核验基线

| 项目 | 核验结果 |
| --- | --- |
| 核验日期 | 2026-08-15 |
| 现代主线 | Java 25 LTS；Java SE 25 RI 页面确认官方参考实现，Oracle 支持路线将 Java 25 列为 LTS |
| legacy 补充 | Java 8；Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE 只作冻结项目背景 |
| 发现方式 | Tavily 只用于发现 Oracle、OpenJDK 与 Dev.java 候选；搜索摘要不作最终依据 |
| 最终证据 | JLS 25/8 Chapter 4、5、8、9 与 Dev.java Generics 系列直接页面 |
| 项目证据 | 只读取冻结矩阵、inventory 与抽取记录，不读取、运行或修改 `dzzz-app` |
| 验证设计 | 固定 Java 25 与 Java 8 容器编译同一 Java 8 兼容源码；临时资产只放 `/tmp` |

Java 25 与 Java 8 在本课选定的参数化类型、不变性、边界、通配符、擦除、raw type 与 unchecked
合同上保持一致。课程不能把“能在旧代码中编译”写成类型安全，也不能把所有 unchecked warning
机械地压制。

## 官方来源卡与直接证据

以下页面均在 `2026-08-15` 直接核验：

| ID | 直接来源 | sourceType | 适用版本 | claims |
| --- | --- | --- | --- | --- |
| `java-se-25-ri` | [Java SE 25 Reference Implementations](https://jdk.java.net/java-se-ri/25) | `official-reference` | Java SE 25 | 官方参考实现基于 OpenJDK JDK 25 项目，并已通过 Java Community Process 批准。 |
| `oracle-java-roadmap` | [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) | `official-reference` | 2026-08-15 页面状态 | Java SE 25 被列为 LTS。 |
| `jls25-types` | [JLS 25 Chapter 4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html) | `specification` | Java 25 | 参数化类型、类型实参、子类型、擦除、可具体化类型、raw type 与 heap pollution。 |
| `jls25-conversions` | [JLS 25 Chapter 5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html) | `specification` | Java 25 | widening、narrowing、unchecked conversion 与转换安全边界。 |
| `jls25-classes` | [JLS 25 Chapter 8](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html) | `specification` | Java 25 | 泛型类、类型参数、边界和泛型方法声明。 |
| `jls25-interfaces` | [JLS 25 Chapter 9](https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html) | `specification` | Java 25 | 泛型接口和接口方法的类型参数规则。 |
| `jls8-types` | [JLS 8 Chapter 4](https://docs.oracle.com/javase/specs/jls/se8/html/jls-4.html) | `specification` | Java 8 | Java 8 的参数化类型、擦除、可具体化类型、raw type 与 heap pollution 合同。 |
| `jls8-conversions` | [JLS 8 Chapter 5](https://docs.oracle.com/javase/specs/jls/se8/html/jls-5.html) | `specification` | Java 8 | Java 8 的 unchecked conversion 与强制转换规则。 |
| `jls8-classes` | [JLS 8 Chapter 8](https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html) | `specification` | Java 8 | Java 8 的泛型类与泛型方法规则。 |
| `jls8-interfaces` | [JLS 8 Chapter 9](https://docs.oracle.com/javase/specs/jls/se8/html/jls-9.html) | `specification` | Java 8 | Java 8 的泛型接口规则。 |
| `dev-generics-intro` | [Introducing Generics](https://dev.java/learn/generics/intro/) | `official-reference` | 当前 Dev.java | 类型参数、参数化类型、泛型类/接口与 raw type 风险。 |
| `dev-generics-methods` | [Generic Methods](https://dev.java/learn/generics/intro/#generic-methods) | `official-reference` | 当前 Dev.java | 泛型方法在返回类型前声明独立类型参数，并可由调用点推断。 |
| `dev-generics-bounded` | [Bounded Type Parameters](https://dev.java/learn/generics/intro/#bounded-type-parameters) | `official-reference` | 当前 Dev.java | 上界限制可用成员，多个边界中类边界必须在首位。 |
| `dev-generics-wildcards` | [Wildcards](https://dev.java/learn/generics/wildcards/) | `official-reference` | 当前 Dev.java | 不变性、上界读、下界写、通配符捕获和 API 设计边界。 |
| `dev-generics-erasure` | [Type Erasure](https://dev.java/learn/generics/type-erasure/) | `official-reference` | 当前 Dev.java | 擦除、bridge method、不可具体化类型与 heap pollution。 |
| `dev-generics-restrictions` | [Restrictions on Generics](https://dev.java/learn/generics/restrictions/) | `official-reference` | 当前 Dev.java | primitive 类型实参、参数化数组、`instanceof` 和静态类型参数等限制。 |

## 现代主线结论

### 类型参数把一次声明变成一组受约束的类型合同

`Box<T>` 声明类型参数，`Box<String>` 为它提供类型实参。编译器据此检查写入与读取，不需要调用方
把 `Object` 强制转换回目标类型：

```java
final class Box<T> {
    private final T value;

    /**
     * 创建保存指定类型值的容器。
     */
    Box(T value) {
        this.value = value;
    }

    /**
     * 返回容器中的值。
     */
    T get() {
        return value;
    }
}
```

类型实参必须是引用类型；不能写 `Box<int>`。`Box<String>` 与 `Box<Integer>` 是同一泛型声明的不同
参数化类型，不是两个独立 class 文件。

### 泛型不随类型实参的继承关系自动协变

即使 `Integer` 是 `Number` 的子类型，`List<Integer>` 也不是 `List<Number>` 的子类型。否则接收
`List<Number>` 的代码可以写入 `Double`，破坏原集合的 `Integer` 合同。两者共同可赋给
`List<?>`，但未知元素类型阻止任意非 null 写入。

### 泛型方法拥有独立的类型参数

泛型方法把 `<T>` 放在返回类型之前；类型参数不依赖外围类是否泛型：

```java
/**
 * 返回两个可比较值中较大的一个。
 */
static <T extends Comparable<T>> T max(T left, T right) {
    return left.compareTo(right) >= 0 ? left : right;
}
```

`extends` 在类型参数边界中同时覆盖类与接口。多个边界使用 `&`；如果包含类，该类必须写在首位。

### 通配符表达调用方只知道的一部分类型信息

- `? extends Number` 表示某个未知的 `Number` 子类型。可以把元素当 `Number` 读取，但不能安全写入
  任意 `Number`。
- `? super Integer` 表示某个未知的 `Integer` 超类型。可以安全写入 `Integer`，读取时只能保证
  `Object`。
- `?` 表示未知类型，适合只依赖 `Object` 合同的读取和转发。

这不是口号替代类型分析。方法同时读写同一种精确类型时应使用命名类型参数；只表达输入/输出方向时
才使用通配符。通配符捕获允许私有泛型 helper 为一个具体调用保存该未知类型的一致性。

```java
/**
 * 把来源中的整数复制到可接收整数的目标。
 */
static void copyIntegers(
    java.util.List<? extends Integer> source,
    java.util.List<? super Integer> target
) {
    for (Integer value : source) {
        target.add(value);
    }
}
```

### 擦除保留二进制兼容，不保留全部类型实参

编译器把无界类型参数擦除为 `Object`，有界参数擦除为首个边界，并按需插入转换或 bridge method。
因此 `List<String>` 与 `List<Integer>` 在运行时具有同一个 `List` class；不能使用
`instanceof List<String>`，也不能直接创建 `new List<String>[10]`。

JLS 把运行时信息完整可用的类型称为 reifiable type，例如非泛型类型、raw type、全部实参都是无界
通配符的参数化类型，以及元素类型可具体化的数组。raw type 可具体化不表示类型安全，它只是为
pre-generics 二进制兼容保留的形式。

### unchecked warning 是合同无法被编译器证明的信号

把 raw value 赋给参数化类型或进行 unchecked cast 时，编译器不能证明元素类型正确。若错误对象进入
参数化容器，变量静态类型与实际对象不一致，就发生 heap pollution；错误通常在更晚的读取位置以
`ClassCastException` 暴露。

应先消除 raw type 或在系统边界逐项验证数据，再把已验证值放入类型化结构。只有能说明为何安全、
作用域最小且有反馈环时才允许局部 `@SuppressWarnings("unchecked")`；本课不把压制当作修复。

## 当前项目补充

以下证据只来自冻结 inventory；`observed` 证明场景存在，`corrected` 只说明需要纠正的边界：

| 文件 | 稳定符号 | SHA-256 | 状态 | 课程边界 |
| --- | --- | --- | --- | --- |
| `dzzz-app/src/main/java/com/tdh/bdzz/dto/as/AsComDTO.java` | `com.tdh.bdzz.dto.as.AsComDTO` | `64d0678af57fd15d3acbcc030fecb73b5f8b0de980a3b8951c7104f3fa56c9c9` | `observed` | 证明项目使用泛型结果对象；不复制业务字段。 |
| `dzzz-app/src/main/java/com/tdh/bdzz/handler/AbstractJsonTypeHandler.java` | `com.tdh.bdzz.handler.AbstractJsonTypeHandler` | `ece52e9d645ecf982fce35e0ecd3e4122b086990a9efa6162b00bedf69cbb24d` | `observed` | 证明抽象处理器使用类型参数约束值类型；框架映射留到后续。 |
| `dzzz-app/src/main/java/com/tdh/bdzz/enums/IEnum.java` | `com.tdh.bdzz.enums.IEnum` | `a396a9a4a41dbd2137d1e01a0e747581e976b0d9c1636db9f18eea9a8f7f9dcb` | `observed` | 证明接口可声明泛型方法；不提升具体枚举协议为通用合同。 |
| `dzzz-app/src/main/java/com/tdh/bdzz/config/Pdf2ImageComparablePriorityTaskPoolExecutor.java` | `com.tdh.bdzz.config.Pdf2ImageComparablePriorityTaskPoolExecutor` | `d0e4192de8a26e059745e358a6d888f7f8bdf39130c30b58cca7dc0ecfbddc73` | `corrected` | raw Callable/Future 和转换只作风险证据，推荐代码必须保留任务结果类型。 |
| `dzzz-app/src/main/java/com/tdh/bdzz/vo/voice2text/CheckBljjVO.java` | `com.tdh.bdzz.vo.voice2text.CheckBljjVO` | `6ff7f04addbeb4b4c76a2f0dd8772d4f4b7b866550ddac2539fdc9c3c3f1f7b1` | `corrected` | raw 集合字段只作纠错证据，课程使用明确元素类型。 |

## Java 8 / Spring Boot 2.3 兼容写法

本课示例只使用 Java 8 已支持的泛型语法。Java 8 可使用 diamond、泛型方法、上下界通配符和
`@SafeVarargs`，但 `@SafeVarargs` 在 Java 8 不能标注普通 `final` 实例方法；本课不需要泛型 varargs，
避免把压制警告作为零基础主线。

项目中的 `Callable`、`Future`、`Page`、`ThreadLocal` 与集合字段都应提供类型实参。Java 8 兼容
并不要求保留 raw type；raw type 只用于与无法修改的旧 API 相交的最窄边界。

## 新旧版本差异

| 对比项 | Java 25 | Java 8 | 课程处理 |
| --- | --- | --- | --- |
| 参数化类型、泛型类/接口/方法 | 支持 | 支持 | 使用共同核心语法 |
| 上下界通配符与捕获 | 支持 | 支持 | 双版本运行同一源码 |
| 擦除、raw type、reifiable type | 核心合同 | 核心合同 | 不把它们误写成新特性 |
| diamond 与目标类型推断 | 支持 | 支持 | 示例保持 Java 8 可编译 |
| `instanceof` 参数化类型限制 | 只允许可具体化类型，例如 `List<?>` | 同样限制 | 禁止使用 `List<String>` 判断，两版共用负向验证 |

## 易错点取证

| 现象 | 原因 | 后果 | 修正 | 验证 |
| --- | --- | --- | --- | --- |
| 把 `List<Integer>` 赋给 `List<Number>` | 泛型参数化类型默认不变 | 若允许会写入非 Integer | 使用 `? extends Number` 只读或重新设计写入合同 | 两版负向源码均编译失败 |
| 使用 raw `List`、`Callable`、`Future` | 绕过类型实参和编译期约束 | unchecked warning、延迟转换失败 | 补全元素或结果类型 | `-Xlint:rawtypes,unchecked` 产生两类警告，`-Werror` 失败 |
| 用 unchecked cast 声称容器已类型化 | 擦除后无法逐项证明元素类型 | heap pollution 在读取处触发 `ClassCastException` | 在边界逐项验证并复制到新容器 | 两版污染样例运行均非零 |
| 向 `List<? extends Number>` 写入 `Integer` | 实际未知类型可能是 `List<Double>` | 编译器拒绝不安全写入 | 只读或使用 `? super Integer` | 双版本负向编译 |
| 创建 `new List<String>[1]` 或判断 `instanceof List<String>` | 该参数化类型不可具体化 | 编译错误，运行时无法区分实参 | 使用集合嵌套或 `List<?>` 检查 | 两版 reifiable 负向源码编译失败 |
| 无依据压制 unchecked warning | 压制不恢复类型证明 | 风险越过边界并延迟暴露 | 缩小边界、验证数据、记录最小压制理由 | `-Werror` 门禁和运行负例共同验证 |

## 可重复验证与实跑结果

反馈资产位于 `/tmp` 的 `mktemp -d` 目录，使用固定镜像，退出时由
`find "$work_dir" -depth -delete` 清理：

| 角色 | 固定镜像 | 工具版本 |
| --- | --- | --- |
| modern | `eclipse-temurin:25-jdk@sha256:12e44624adee6808a36d962717e1656e0afeeeff5a100f9cb00e0136513558f0` | `javac 25.0.3` |
| legacy | `eclipse-temurin:8-jdk@sha256:c8b86f2c0a9bd6cc1b7fabc5d1a097501a166eea7cad3b2764e90e96178bea9b` | `javac 1.8.0_492` |

实跑结果：

- Java 25 与 Java 8 正向源码均退出 `0`，精确输出：
  `box=6|format=n=4|copy=2,4,6|capture=2|sameClass=true`。
- 不变性负向源码在两版均编译退出 `1`。
- `instanceof List<String>` / 泛型数组负向源码在两版均编译退出 `1`。
- raw type 源码用 `-Xlint:rawtypes,unchecked` 编译退出 `0`，同时产生 `rawtypes` 与 `unchecked`
  警告；加入 `-Werror` 后两版均退出 `1`。
- heap pollution 源码在两版编译后运行均退出 `1`，诊断包含 `ClassCastException`。
- 正向源码每个方法与构造器上方均有规范中文注释；临时目录已清理。

## 被排除或尚未证实的说法

- 不把“泛型没有运行时开销”扩写成性能结论；本课没有性能测量。
- 不讲 Stream、Collector、集合实现复杂度或并发集合。
- 不讲 MyBatis、Mapper、JSON 类型令牌和 Spring 泛型注入规则。
- 不把 `@SuppressWarnings` 或 `@SafeVarargs` 当作消除类型风险的通用方案。
- 不声称 Java 25 改变了本课核心泛型合同。
- 不读取或修改 `dzzz-app` 来证明冻结 inventory 已记录的事实。

## 发布前自检

- [x] Phase A 冻结 ID、B-11 唯一前置和 75 分钟合同已同步，来源能力未改写。
- [x] 现代主线与 Java 8 项目补充分开。
- [x] 关键语言结论绑定 JLS 25/8 直接章节，并用 Dev.java 辅助教学。
- [x] 3 个 observed 与 2 个 corrected 项目证据绑定路径、符号和 SHA。
- [x] raw type 风险只作纠错证据，没有复制为推荐示例。
- [x] Java 25/8 正向、负向、lint、`-Werror` 与运行失败均实际执行。
- [x] 验证资产仅在 `/tmp`，已清理。
- [x] 不包含真实业务数据、内部地址或凭据。

## Stop Boundary

本研究只授权创建 `generics-and-type-safety` 课程及其注册、验证和独立 signoff；本课完整关闭前不领取
第十三课，不进入集合、Stream、中级、高级、Reference、项目实战或其他后端技术。
