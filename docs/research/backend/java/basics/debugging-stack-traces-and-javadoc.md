# 程序调试、异常栈与 Javadoc 阅读研究记录

## 冻结课程合同

- `batch`：`B-11`
- `courseId`：`backend.java.learn.basics.debugging-stack-traces-and-javadoc`
- `title`：程序调试、异常栈与 Javadoc 阅读
- `nature`：必修、新增
- `estimatedMinutes`：`75`
- `purpose / collection / level / depth`：`learn / basics / beginner / lesson`
- `sequence`：`210`
- 唯一前置：B-10 `backend.java.learn.basics.exceptions-and-cause-chains`
- `related`：`[]`
- `modernBaseline`：`Java 25 LTS`
- `legacyBaseline`：`Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE` 仅作冻结项目背景
- Phase 2 冻结状态：`researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`
- `snapshotId`：`dzzz-app-20260803-179e722831ab`
- `analysisId`：`dzzz-app-analysis-20260803-958d37cf1be1`

本课只研究五组能力：编译失败、运行时异常与错误结果的分类反馈；异常类型、消息和栈帧的阅读；从
栈顶向下定位第一条应用栈帧；使用 `jdb` 做断点、`where`、局部变量查看、`print`、`next`、`cont`；
以及阅读 Javadoc 的描述、参数、返回值和 `Throws` 合同。`locals` 在本课表示“要检查的局部变量”；
Oracle 的 JDK 8 工具文档把这个动作定义为在挂起的栈帧上使用 `print`/`dump`，并没有把 `locals` 列
为独立的标准 jdb 命令，因此正文不杜撰一个不存在的命令。

本稿只授权 B-11 研究，正文、loader、track、manifest、浏览器验证、signoff 和独立复审均留在后续
B-11 实施批。不得借本课研究读取、研究或实现其他课程。

本批关闭必须同时满足：

- 五组主题都用零基础语言回答“是什么、作用、场景、怎么用、最小示例、运行结果、常见误区”。
- 正向示例使用 Java 8 语法，在 Java 25 与 Java 8 工具链上可编译；诊断输出只断言稳定字段，不逐字
  比较实现相关的完整异常消息、行号和栈轨迹。
- 负向反馈环至少覆盖一个编译失败、一个运行时异常和一个错误结果，并明确预期退出状态及观察点。
- `jdb` 反馈环使用 `javac -g` 保留局部变量表，断点停下后依次观察栈、局部值、单步和继续执行。
- Javadoc 示例的描述、`@param`、`@return`、`@throws` 与实际方法合同一致；文档说明与运行时行为
  不互相替代。

## 核验基线

| 项目 | 核验结果 |
| --- | --- |
| 核验日期 | 2026-08-15 |
| 现代主线 | Java 25 LTS；OpenJDK JDK 25 页面确认 GA，Oracle 支持路线将 Java 25 列为 LTS |
| legacy 补充 | Java 8；Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE 只作冻结项目背景 |
| 发现方式 | 通过 Tavily 搜索官方页面；搜索摘要只作入口，结论回到 Oracle、OpenJDK、JLS、Java API 与 Dev.java |
| 最终证据 | JLS 25/8 Chapter 1、Chapter 11，Java SE 25/8 `Throwable` 与 `StackTraceElement`，JDK 25/8 `jdb`，JDK 25 Javadoc 文档注释规范，Dev.java Exceptions |
| 项目证据 | `projectEvidence: []`；本课冻结没有授权读取或运行 `dzzz-app` 业务文件 |
| 验证设计 | 正误 Java 源码、class、jdb 会话和 Javadoc 输出均只进入 `/tmp` 临时目录，研究稿不保留测试资产 |

JLS 25 §1 说明编译时翻译与运行时加载、链接和执行的边界；JLS 25 §11.2/§11.3 分别规定 checked
exception 的编译期检查和运行时处理。Java 8 对应章节的合同足以支撑本课的兼容示例。`Throwable` API
把异常创建时的执行栈保存为快照，`getStackTrace()` 的零号元素是栈顶，通常是创建并抛出异常的点；
它也允许读取消息、cause 和结构化 `StackTraceElement` 字段。完整诊断文本、文件行号、模块前缀和 jdb
命令输出可能随工具链变化，反馈环只绑定可观察的稳定字段。

## 官方来源卡与直接证据

以下页面在 `2026-08-15` 通过 Tavily 定位后直接打开核验；没有把搜索页、社区文章或 AI 输出写成最终
依据。

| ID | 直接来源 | sourceType | 适用版本 | claims |
| --- | --- | --- | --- | --- |
| `openjdk-jdk25` | [OpenJDK JDK 25](https://openjdk.org/projects/jdk/25/) | `official-reference` | JDK 25 | JDK 25 是 Java SE 25 的参考实现，并于 2025-09-16 达到 GA。 |
| `oracle-java-roadmap` | [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) | `official-reference` | 2026-08-15 页面状态 | Oracle 将 Java SE 25 列为 LTS。 |
| `jls25-compile-runtime` | [JLS 25 Chapter 1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-1.html) | `specification` | Java 25 | 规范区分必须在编译期检测的错误与运行期发生的活动；编译期通常把源码翻译为字节码，运行期包括加载、链接和执行。 |
| `jls8-compile-runtime` | [JLS 8 Chapter 1](https://docs.oracle.com/javase/specs/jls/se8/html/jls-1.html) | `specification` | Java 8 | Java 8 同样区分 compile-time error 与 run-time activity，可支持兼容示例的反馈分类。 |
| `jls25-exceptions` | [JLS 25 Chapter 11](https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html) | `specification` | Java 25 | §11.1 区分 checked、run-time exception 与 error；§11.2 要求 checked exception 被处理或声明；§11.3 规定运行时沿调用栈寻找处理器。 |
| `jls8-exceptions` | [JLS 8 Chapter 11](https://docs.oracle.com/javase/specs/jls/se8/html/jls-11.html) | `specification` | Java 8 | 同一异常分类、checked 检查和运行时处理合同适用于 Java 8。 |
| `api25-throwable` | [Throwable - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html) | `api-doc` | Java 25 | `Throwable` 保存创建时的执行栈快照、detail message 和 cause；`getStackTrace()` 提供结构化栈帧，`printStackTrace()` 输出诊断。 |
| `api8-throwable` | [Throwable - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/lang/Throwable.html) | `api-doc` | Java 8 | Java 8 已提供 `getMessage`、`getCause`、`getStackTrace`、`printStackTrace` 及 cause 构造器。 |
| `api25-stack-trace-element` | [StackTraceElement - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/StackTraceElement.html) | `api-doc` | Java 25 | 栈帧可读取类名、方法名、源文件名、行号和 native 标记；字段缺失时可能显示 `Unknown Source` 等诊断文本。 |
| `api8-stack-trace-element` | [StackTraceElement - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/lang/StackTraceElement.html) | `api-doc` | Java 8 | Java 8 提供本课需要的类名、方法名、源文件名、行号和 native 标记读取。 |
| `jdb25` | [The jdb Command - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/specs/man/jdb.html) | `official-reference` | JDK 25 | 当前页面明确列出 `stop at`/`stop in`、`next`、`cont` 及未捕获异常停靠；不把页面未列出的 `where`、`print`、`dump` 或 `javac -g` 条件归给该页。 |
| `jdb8` | [jdb - JDK 8 Tools Reference](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/jdb.html) | `official-reference` | JDK 8 | 页面明确列出 `where`、`print`/`dump`、`next`、`cont` 和断点；局部变量查看要求类用 `javac -g` 编译。 |
| `oracle-java-secure-exceptions` | [Secure Coding Guidelines for Java SE](https://www.oracle.com/java/technologies/javase/seccodeguide.html) | `security-standard` | Java SE（当前 Oracle 页面） | 异常对象可能含配置和内部信息；除非明确知道内容，否则不要把异常信息传给终端用户或把栈放进 HTML；只选择已知可接受的信息。 |
| `javadoc25` | [Documentation Comment Specification](https://docs.oracle.com/en/java/javase/25/docs/specs/javadoc/doc-comment-spec.html) | `official-reference` | JDK 25 standard doclet | 文档注释必须紧邻声明；方法文档至少有主描述、参数、非 `void` 返回值和 `throws` 类型的对应说明；`@param`、`@return`、`@throws` 各自生成对应章节。 |
| `javadoc8` | [javadoc - JDK 8 Tools Reference](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/javadoc.html) | `official-reference` | JDK 8 standard doclet | Java 8 的标准标签与方法文档结构支持本课兼容示例；JDK 8 线不使用后续新增的 Markdown 或 `{@return}` 便利语法。 |
| `dev-java-exceptions` | [Dev.java Exceptions](https://dev.java/learn/exceptions/) | `official-reference` | 当前 Dev.java | 官方教学入口解释异常会打断正常控制流、捕获与抛出；精确语言合同仍以 JLS 和 Java API 为准。 |

### jdb 命令归因矩阵

“未在页面列出”只表示该版本页面没有给出正向来源，不等于目标 JDK 一定不支持；后续 signoff
必须在目标 JDK 执行 `help`，再记录实际可用命令。

| 能力 | JDK 25 页面 | JDK 8 页面 | 本稿归因 |
| --- | --- | --- | --- |
| `stop at` / `stop in` | 明确列出 | 明确列出 | 两页均可引用 |
| `next` | 明确列出 | 明确列出 | 两页均可引用 |
| `cont` | 明确列出 | 明确列出 | 两页均可引用 |
| `where` | 未列出 | 明确列出 | 正向合同仅引用 `jdb8` |
| `print` | 未列出 | 明确列出 | 正向局部变量查看仅引用 `jdb8` |
| `dump` | 未列出 | 明确列出 | 仅作为 JDK 8 的局部变量/字段查看替代命令 |
| `javac -g` 局部变量条件 | 未列出 | 明确列出 | 仅引用 `jdb8` |
| 独立 `locals` 命令 | 未列出 | 未列出 | 两页都不声称存在；以目标 JDK `help` 为准 |

## 零基础五组教学冻结

### 1. 编译失败、运行时异常与错误结果

- **是什么与作用：** 编译失败意味着 `javac` 没有生成可运行的 class；运行时异常意味着 class 已经
  启动但某条执行路径抛出 `Throwable`；错误结果意味着程序正常退出，却算出了不符合输入和业务不变
  量的值。三者都需要反馈环，不能只看“有没有堆栈”。
- **何时使用：** 先看编译退出码和诊断，再看进程退出码、stderr 和栈，最后用固定输入断言结果。缺少
  一步就可能把编译问题误当成运行时问题，或把静默错误结果误当成成功。
- **最小用法与结果：** `javac` 错误源码预期非零且无 class；可运行的除零源码预期非零并含
  `ArithmeticException`；故意把总价乘二的源码预期退出零但结果断言失败。
- **常见误区：** “能编译就正确”“出现异常才算 bug”“退出码为零代表业务正确”。
- **证据：** `jls25-compile-runtime`、`jls25-exceptions`、`jls8-compile-runtime`、`jls8-exceptions`。

### 2. 异常类型、消息与栈帧

- **是什么与作用：** 类型说明失败类别，消息提供当前实例的上下文，栈帧描述异常创建点到调用者的
  执行路径。三者回答不同问题，不能只复制消息文本。
- **何时使用：** 先读第一行的类型和消息，再从栈顶向下读类、方法、文件和行号；有 `Caused by` 时
  分开阅读每一条 cause 链，不把 cause 的栈和外层栈混为一条路径。
- **最小用法与结果：** `failure.getClass().getSimpleName()`、`getMessage()`、
  `getStackTrace()[0]` 可以输出稳定类型和首帧字段；完整 `printStackTrace()` 仍用于人工诊断。
- **常见误区：** 把消息当异常类型、相信所有栈帧都有源码行号、把 `... N more` 当成缺失错误而不是
  共享尾部的压缩表示。
- **证据：** `api25-throwable`、`api25-stack-trace-element`、`api8-throwable`、`api8-stack-trace-element`。

### 3. 第一条应用栈帧

- **是什么与作用：** `getStackTrace()` 的零号元素是栈顶，通常是异常创建/抛出点；“第一条应用栈帧”
  是从零号元素开始、按预先约定的应用包名前缀找到的第一个帧。它是诊断启发式，不是 Java 规范定义
  的“业务根因”。
- **何时使用：** 你知道应用包名前缀（例如 `com.example.task`），且想快速跳过 `java.*`、`jdk.*`、
  反射或框架内部帧时使用。没有可靠包名前缀时应返回“未找到”，不要猜一个类。
- **最小用法与结果：** 逐帧读取 `getClassName()`，首个匹配前缀的帧输出类、方法、文件和行号；若 VM
  省略帧或没有 `LineNumberTable`，行号可能是负数或文件名为 `null`。
- **常见误区：** 直接取最后一帧作为根因、把第一条应用帧当作一定错误位置、跨 cause 链只看外层栈。
- **证据：** `api25-throwable` 的 zeroth/top/bottom 说明、`api25-stack-trace-element` 字段合同；
  包名前缀筛选属于明确标注的工程建议。

### 4. jdb 断点、where、locals、print、next、cont

- **是什么与作用：** jdb 是命令行 Java 调试器。断点暂停执行；`where` 查看线程栈；局部变量查看要
  在挂起栈帧上用 `print` 或 `dump`，并且 class 要带调试局部变量信息；`next` 在当前栈帧单步，
  `cont` 继续执行。
- **何时使用：** 先用 `javac -g -d <out>` 编译，再 `jdb -classpath <out> DebugFeedback`，
  输入 `stop at Class:line` 或 `stop in Class.method` 设置断点，命中后按“where -> print -> next -> cont”。
  若要调试已运行 JVM，则使用官方文档说明的 attach/JPDA 路径，并记录连接参数。
- **最小用法与结果：** 断点处 `where` 能看到当前线程的帧；`print amount` 输出局部值；`next` 移到
  当前方法下一行而不进入被调用方法；`cont` 让程序继续到下一个事件或结束。
- **常见误区：** 未用 `-g` 却断言局部值一定可见；把 `step` 当作 `next`；断点行没有可执行字节码；
  误以为 `locals` 是所有 JDK 版本都存在的独立命令。
- **证据：** `jdb25` 只直接支持断点、`next`、`cont` 和异常停靠；`jdb8` 直接支持 `where`、
  `print`/`dump` 及 `javac -g` 局部变量条件。两页都没有列出独立的 `locals` 命令。

### 5. Javadoc 描述、参数、返回值与 Throws

- **是什么与作用：** Javadoc 是从紧邻声明的文档注释生成的 API 合同。主描述讲“做什么”，`@param`
  讲每个输入的含义和限制，`@return` 讲非 `void` 返回值及允许范围，`@throws` 讲可能抛出的异常及
  触发条件。
- **何时使用：** 阅读陌生 API 时先读主描述，再按实际调用参数核对 `@param`、返回值和 `Throws`；
  写公共方法时同步维护这四部分，避免代码和文档表达不同合同。
- **最小用法与结果：** 对有两个参数、一个返回值和一个 checked 异常的方法生成文档后，HTML 的
  Parameters、Returns、Throws 区块都应出现；`void` 方法不写 `@return`。
- **常见误区：** 把注释写在注解或修饰符之后导致标准 doclet 不识别；参数名拼错；`@return` 写成
  “返回结果”而不说明范围；`@throws` 只列异常名不写触发条件；把 Javadoc 当作运行时校验。
- **证据：** `javadoc25`、`javadoc8`。

### 异常信息的用户可见边界

Oracle Secure Coding Guidelines for Java SE 的 Guideline 2-1 指出，异常对象可能包含系统配置和内部
实现信息；除非明确知道内容，否则不要把异常信息传给终端用户，也不要把完整异常栈放进 HTML，即使
页面当前不显示它。对本课的窄结论是：生产或用户可见错误响应只返回明确已知且可接受的信息，不直接
暴露完整异常对象、异常栈或未经选择的诊断信息。本课不定义日志访问控制、脱敏策略或 HTTP 错误格式。

- **证据：** `oracle-java-secure-exceptions`。

## 现代主线结论

### 先判断反馈所在阶段

JLS 25 把编译时和运行时分开：编译时通常是源码到字节码的翻译；运行时包括类加载、链接和实际执行。
因此调试的第一步不是打开堆栈，而是确认反馈阶段：

1. `javac` 返回非零：记录首个诊断、源码位置和是否生成 class；修正编译合同后再进入运行环。
2. `java` 返回非零并在 stderr 出现异常类型：记录异常类型、稳定消息前缀、首帧和 cause 链。
3. `java` 返回零但输出值错误：保留输入、期望值和实际值，建立可重复断言；没有异常并不等于没有 bug。

示例使用三个独立临时文件，不把“编译失败”和“运行时异常”混成一个示例：

```java
/**
 * 编译失败反馈：checked 异常既未捕获也未声明。
 */
public final class CompileFailure {
    /**
     * 故意违反 catch-or-declare 要求。
     */
    static void fail() {
        throw new Exception("checked");
    }
}
```

预期 `javac CompileFailure.java` 返回非零，不应生成可运行的 `CompileFailure.class`。诊断措辞和
列号可以随 JDK 变化，不把 stderr 逐字作为断言。

```java
/**
 * 运行时异常反馈：源码可编译，但执行路径发生除零。
 */
public final class RuntimeFailure {
    /**
     * 触发一个确定的运行时异常。
     */
    static int divide(int total, int count) {
        return total / count;
    }

    /**
     * 运行失败时输出稳定异常类型。
     */
    public static void main(String[] args) {
        try {
            divide(10, 0);
        } catch (ArithmeticException failure) {
            System.out.println("type=" + failure.getClass().getSimpleName());
        }
    }
}
```

这里 `javac` 和 `java` 都预期返回零，因为示例在边界捕获了异常；若移除 `catch`，`java` 预期返回非零。
这说明“运行时异常”是执行阶段事件，不等于必须让进程崩溃。

```java
/**
 * 错误结果反馈：程序正常退出，但业务公式故意错误。
 */
public final class WrongResult {
    /**
     * 故意把数量乘以二，模拟没有异常的逻辑错误。
     */
    static int total(int unitPrice, int quantity) {
        return unitPrice * quantity * 2;
    }

    /**
     * 用固定输入断言业务结果。
     */
    public static void main(String[] args) {
        int actual = total(7, 3);
        if (actual != 21) {
            throw new AssertionError("expected=21|actual=" + actual);
        }
    }
}
```

该程序编译成功，运行预期非零且 stderr 含 `AssertionError`；将乘二删除后才预期退出零。这里的
反馈环不把某个业务数值当作普遍规则，只验证固定输入的明确不变量。

### 读取异常类型、消息和栈帧

`Throwable` 在创建时保存线程执行栈快照，并可以保存 detail message 与 cause。`getStackTrace()` 给出
结构化 `StackTraceElement[]`，`printStackTrace()` 把诊断写到标准错误。先读稳定字段，再决定是否需要
完整文本：

```java
/**
 * 读取异常的稳定诊断字段。
 */
public final class StackFrameFeedback {
    /**
     * 在应用边界抛出带上下文的异常。
     */
    static void fail() {
        throw new IllegalStateException("state=ready|expected=paused");
    }

    /**
     * 输出类型、消息和首个栈帧字段，避免绑定完整栈文本。
     */
    public static void main(String[] args) {
        try {
            fail();
        } catch (IllegalStateException failure) {
            StackTraceElement first = failure.getStackTrace()[0];
            System.out.println(
                    "type="
                            + failure.getClass().getSimpleName()
                            + "|message="
                            + failure.getMessage()
                            + "|class="
                            + first.getClassName()
                            + "|method="
                            + first.getMethodName());
        }
    }
}
```

预期输出稳定地以 `type=IllegalStateException|message=state=ready|expected=paused|class=StackFrameFeedback|method=fail`
开头。文件名、行号和完整 `printStackTrace()` 可能受编译参数、JDK 实现和源码行移动影响，不作为
跨版本逐字断言。`getStackTrace()` 也允许虚拟机在特定情况下省略帧，空数组必须被当作“没有可用栈信息”
处理，而不能索引零号元素。

### 用包名前缀定位第一条应用栈帧

API 合同定义了栈帧顺序，却没有定义“应用代码”的包名。因而“第一条应用栈帧”必须由调用方提供
包名前缀或类加载器边界。下面的 Java 8 兼容函数从零号元素开始扫描，并在找不到匹配时返回 `null`：

```java
/**
 * 从异常栈中找到指定应用包名前缀的第一条帧。
 */
static StackTraceElement firstApplicationFrame(Throwable failure, String applicationPrefix) {
    for (StackTraceElement frame : failure.getStackTrace()) {
        if (frame.getClassName().startsWith(applicationPrefix)) {
            return frame;
        }
    }
    return null;
}
```

把函数放入一个完整的临时类即可运行：

```java
/**
 * 验证应用包名前缀筛选的首个栈帧。
 */
public final class FirstApplicationFrameFeedback {
    /**
     * 产生一个属于当前应用类的异常栈。
     */
    static void fail() {
        throw new IllegalStateException("state=ready|expected=paused");
    }

    /**
     * 从栈顶开始查找第一个应用类。
     */
    static StackTraceElement firstApplicationFrame(
            Throwable failure, String applicationPrefix) {
        for (StackTraceElement frame : failure.getStackTrace()) {
            if (frame.getClassName().startsWith(applicationPrefix)) {
                return frame;
            }
        }
        return null;
    }

    /**
     * 输出稳定的应用类和方法名。
     */
    public static void main(String[] args) {
        try {
            fail();
        } catch (IllegalStateException failure) {
            StackTraceElement first = firstApplicationFrame(failure, "FirstApplicationFrameFeedback");
            if (first == null) {
                throw new AssertionError("application frame missing");
            }
            System.out.println(
                    "appClass=" + first.getClassName() + "|appMethod=" + first.getMethodName());
        }
    }
}
```

调用方应把 `null` 显示为“未找到应用前缀”，而不是回退到最后一帧并称其为根因。若异常被包装，需
分别对外层和每个 `getCause()` 重复该反馈环；外层第一应用帧通常表示包装边界，不一定是底层故障源。
`StackTraceElement.getFileName()` 可能为 `null`，`getLineNumber()` 可能为未知值；这些是诊断数据缺失，
不是可以凭经验补齐的源码位置。

### jdb 的最小会话

JDK 25 官方手册明确说明可以按行或方法设置断点，`next` 在当前栈帧移动一行，`cont` 在断点、异常
或单步后继续。JDK 8 工具文档另外明确说明：`where` 显示当前线程（或 `where all` 的全部线程）栈；
挂起时用 `print`/`dump` 查看局部变量和字段，且编译 class 时必须带 `javac -g`。因此本课的
“locals”是查看局部变量这一目标，不是一个被两页都定义的独立命令。

在 JDK 8 上，下面的 `where`/`print` 序列有直接官方命令依据。在 JDK 25 上，先运行 `help` 核对这些
命令是否由目标工具提供；`jdb25` 页面没有为它们提供正向定义，不能把它们写成 JDK 25 页面已保证的
合同。若目标 JDK 的 `help` 不列出某命令，signoff 记录实际提示并停止把该命令放入自动化脚本。

最小源码：

```java
/**
 * 为 jdb 断点提供稳定的局部变量和单步路径。
 */
public final class JdbFeedback {
    /**
     * 计算总价并保留可观察的局部变量。
     */
    static int total(int unitPrice, int quantity) {
        int subtotal = unitPrice * quantity;
        return subtotal;
    }

    /**
     * 启动 jdb 反馈环。
     */
    public static void main(String[] args) {
        int total = total(7, 3);
        System.out.println("total=" + total);
    }
}
```

在临时目录执行（`<line>` 替换为 `int subtotal` 所在行；目标 JDK 先执行 `help`）：

```text
javac -g -d out JdbFeedback.java
jdb -classpath out JdbFeedback
> help
> stop at JdbFeedback:<line>
> run
> where
> print unitPrice
> print quantity
> print subtotal
> next
> cont
```

预期观察（仅在目标 JDK 的 `help` 确认命令可用时）：`where` 显示当前线程栈并停在
`JdbFeedback.total`；`print unitPrice` 和 `print quantity` 分别显示 `7`、`3`。在 `subtotal` 尚未
执行的行上读取它可能显示尚未初始化或不可用，执行 `next` 到赋值完成后再 `print subtotal` 才能观察
`21`。`next` 不进入被调用方法，`step` 才可能进入；本课不把 `step` 扩展成独立主题。`cont` 后程序
继续，最终标准输出为 `total=21`。JDK 25 页面的正向证据只覆盖断点、`next`、`cont`；JDK 8 页面才
直接覆盖 `where`、`print`/`dump` 和 `-g` 条件。

### 阅读 Javadoc 的四步

JDK 25 文档注释规范把注释识别限定为紧邻声明的位置。方法文档的最低组成是主描述、每个方法类型
参数的 `@param`、每个形参的 `@param`、非 `void` 方法的 `@return`，以及 `throws` 子句中每个异常
类型的 `@throws`。`@param` 描述输入及限制，`@return` 描述可返回值和范围，`@throws` 描述可能抛出
异常与触发条件；它们是文档合同，不会自动执行校验。

```java
/**
 * 生成 Javadoc 的 Java 8 兼容示例。
 */
public final class JavadocFeedback {
    /**
     * 把非空端口文本转换为 1 到 65535 的 TCP 端口。
     *
     * @param raw 待解析的十进制文本，不能为 null，且不能包含空白
     * @return 解析后的端口号，范围为 1 到 65535
     * @throws IllegalArgumentException 文本为空、不是十进制数字或超出端口范围
     */
    static int parsePort(String raw) {
        if (raw == null || raw.length() == 0) {
            throw new IllegalArgumentException("port text is empty");
        }
        int port;
        try {
            port = Integer.parseInt(raw);
        } catch (NumberFormatException failure) {
            throw new IllegalArgumentException("port text is not decimal", failure);
        }
        if (port < 1 || port > 65535) {
            throw new IllegalArgumentException("port is out of range");
        }
        return port;
    }

    /**
     * 用一个合法端口验证运行结果。
     */
    public static void main(String[] args) {
        System.out.println("port=" + parsePort("8080"));
    }
}
```

上面的 `JavadocFeedback.java` 可以直接交给 `javadoc`；生成文档的反馈环不要求先运行 `main`。

阅读陌生 API 时按以下顺序核对：

1. 先读主描述，确认方法解决的问题和副作用。
2. 对照 `@param` 检查传入值的空值、范围、格式和所有权要求。
3. 对照 `@return` 判断返回值是否可能为 `null`、是否包含边界值，以及“成功”代表什么。
4. 阅读 `Throws` 的异常类型和触发条件，再决定本层捕获、声明或让上层处理。

JDK 25 还支持 Markdown 文档注释和 JDK 16 引入的 `{@return}` 内联标签；为了 Java 8 兼容，本课源
码只使用传统 `/** ... */` 注释与 Java 8 已有的 `@param`、`@return`、`@throws`。标准 doclet 的
继承可以补齐重写方法的缺失文档，但不能把不相容的业务合同“继承”成正确行为。

## 当前项目补充

本课冻结没有授权读取 `dzzz-app` 源码或风险矩阵中的代表文件，因此 `projectEvidence` 保持空数组。
不能从项目中某个日志格式、Controller 捕获方式或 IDE 配置推导 Java 语言、jdb 或 Javadoc 的普遍合同。
若后续 B-11 实施批需要项目场景，应先在该批重新冻结文件路径、稳定符号、版本和去敏状态，再单独标记
`observed`、`adapted` 或 `corrected`；研究稿本身不添加未经核验的项目证据。

## Java 8 / Spring Boot 2.3 兼容写法

本课所有 Java 源码只用 Java 8 已有语法和 `java.lang` API。Java 8 兼容线不引入记录类、模式匹配、
模块声明、Markdown Javadoc 或 `{@return}`。`Spring Boot 2.3.12.RELEASE` 与 `Spring Framework
5.2.15.RELEASE` 仅用于说明冻结项目环境，不参与 jdb、JLS 或标准库合同。

兼容反馈环先固定编译和启动命令：

```text
javac -g -d out JdbFeedback.java
jdb -classpath out JdbFeedback
```

Java 25 与 Java 8 分别直接编译同一份只使用 Java 8 语法/API 的源码。两条工具链都必须记录
`javac -version` 和 `java -version`，并只比较类型、消息前缀、业务结果和退出码等稳定字段。JDK 8
会话可按 `jdb8` 直接执行 `where`/`print`；JDK 25 会话必须先运行目标工具的 `help`，确认命令可用后
才复用该序列，不能把 `where`/`print` 归因于未列出它们的 `jdb25` 页面。

## 新旧版本差异

| 对比项 | Java 25 现代线 | Java 8 / Spring Boot 2.3 项目线 | 课程处理 |
| --- | --- | --- | --- |
| 编译期与运行期边界 | JLS 25 Chapter 1、11 | JLS 8 对应章节合同一致 | 同一正误源码双版本编译/运行；不绑定诊断措辞 |
| 异常栈 API | `Throwable`、`StackTraceElement` 均可用 | 本课所需方法均已存在 | 只用 Java 8 API；允许实现细节导致的文本差异 |
| 栈帧字段 | Java 25 可能包含模块/类加载器字段 | Java 8 主要显示类、方法、文件、行号 | 只断言类名、方法名等稳定字段，未知行号不补猜 |
| jdb 文档 | 当前手册明确断点、`next`、`cont` 和异常停靠；未列 `where`、`print`、`dump`、`-g` | JDK 8 工具参考明确 `where`、`print`/`dump`、`-g` 及基本命令 | 后续 signoff 在各自 JDK 执行 `help`；“locals”按目标动作描述 |
| Javadoc | 支持 Markdown 注释及 `{@return}`（JDK 16+） | 传统 doc comment 和块标签 | 示例保持传统注释，保证 Java 8 可生成 |
| 框架 | 不引入 Spring API | Boot 2.3.12 / Framework 5.2.15 只作背景 | 不把框架日志、异常映射或 IDE 行为写成 Java 合同 |

## 易错点取证

| 现象 | 触发条件 | 原因 | 后果 | 错误示例 | 正确写法 | 影响版本 | 验证方式 | 来源 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 把编译成功当作程序正确 | 只运行 `javac`，不执行固定输入的结果断言 | 编译期只检查语言和类型合同，不证明运行路径和业务公式 | 错误结果进入后续流程而无人发现 | `javac WrongResult.java` 后直接宣布成功 | 编译后用固定输入执行并断言返回值/状态 | Java 8、Java 25 | `WrongResult` 预期编译成功但断言非零 | `jls25-compile-runtime`、`jls8-compile-runtime` |
| 把异常消息当稳定标识 | 用 `getMessage()` 文本判断异常种类或跨 JDK 逐字比较 | 消息是实例上下文，格式和底层实现可变 | 诊断过滤器误分类或跨版本测试脆弱 | `if (message.equals("/ by zero"))` | 先用异常类型和结构化字段，消息只断言稳定前缀 | Java 8、Java 25 | 输出 `type=` 与消息前缀，拒绝完整文本断言 | `api25-throwable`、`api8-throwable` |
| 直接取最后一帧当业务根因 | 把栈底调用者误认为错误发生点 | zeroth 是栈顶、通常为创建/抛出点；栈底是最早调用者 | 修错位置偏离实际抛出点 | `trace[trace.length - 1]` | 从零号元素读取，按应用包名前缀筛选首个匹配帧 | Java 8、Java 25 | 构造 `StackTraceElement[]` 输出首帧与包名前缀匹配结果 | `api25-throwable`、`api25-stack-trace-element` |
| 不区分外层异常与 cause 栈 | 只读第一条 `printStackTrace()` 文本 | 每个 throwable 都有自己的栈，cause 链是多个异常快照 | 根因定位停在包装边界 | 只记录 `failure.toString()` | 记录外层类型、`getCause()` 类型并分别扫描栈 | Java 8、Java 25 | 正向包装示例要求 `cause` 非空并输出两层类型 | `api25-throwable`、`api8-throwable` |
| jdb 看不到局部变量 | 未用 `javac -g` 或断点时线程未挂起 | 局部变量表是 class 调试信息，`print` 依赖挂起栈帧 | `print` 报不可用或无法解析名称 | `javac -d out JdbFeedback.java` | `javac -g -d out ...`，命中断点后 `where` 再 `print` | JDK 8 有直接来源；JDK 25 待目标 `help` 确认 | 同一源码分别带/不带 `-g`，记录命令与观察结果 | `jdb8`；JDK 25 仅记录现场 `help` 观察 |
| 把 `step`、`next`、`cont` 混为一谈 | 需要停留当前方法却使用 `step`，或单步后忘记继续 | `next` 不进入被调用方法；`cont` 继续到下一事件 | 调试路径跳过关键状态或停在错误位置 | `step` 代替所有单步 | 当前栈帧用 `next`，需要进入调用方法才用 `step`，完成后 `cont` | JDK 8、JDK 25 | jdb 会话固定检查停靠方法、局部值和最终输出 | `jdb8`、`jdb25` |
| 把 `locals` 当作标准独立命令 | 直接输入 `locals`，没有先核对目标 JDK 的 `help` | 两页都未列独立 `locals`；局部变量查看的正向合同仅来自 `jdb8` 的 `print`/`dump` | 调试脚本因未知命令中断 | `locals`（未核验） | JDK 8 用 `where` 选帧、`print name`/`dump object` 查看；JDK 25 先核对 `help` | JDK 8、JDK 25 | 在目标 JDK 执行 `help`，保存命令可用性；不猜测未列命令 | `jdb8`（正向合同）、`jdb25`（未列独立命令） |
| Javadoc 标签与实现合同不一致 | 参数改名/范围改变后只改代码不改注释 | Javadoc 是调用方阅读的 API 合同，不会自动同步源码 | 调用方按过时约束传值，误判返回和异常 | `@return result`、`@throws Exception` 无触发条件 | 每个形参写含义/边界，非 `void` 写返回范围，throws 写触发条件 | JDK 8、JDK 25 | 运行 `javadoc`，检查 Parameters/Returns/Throws 区块和源码合同 | `javadoc25`、`javadoc8` |
| 文档注释位置错误 | 把 `/** ... */` 放在注解或 `public` 修饰符之后 | 标准 doclet 只识别紧邻声明的文档注释 | 生成的 API 页面缺少描述和标签 | `@Override\n/** ... */` | 文档注释放在注解、修饰符、声明之前 | JDK 8、JDK 25 | 最小类分别生成文档并比较区块是否出现 | `javadoc25`、`javadoc8` |

## 可重复验证设计

验证资产全部写入 `/tmp` 下的 `mktemp -d` 目录，研究稿只定义反馈环和预期，不把未执行结果写成
PASS。后续 signoff 必须记录实际 JDK 镜像或本机工具链、`javac -version`、`java -version`、jdb
命令输出摘要、每次编译/运行退出码和清理结果。

### 正向阶段分类反馈环

依次在临时目录创建 `CompileFailure.java`、`RuntimeFailure.java` 和 `WrongResult.java`。

| 文件 | 预期编译 | 预期运行 | 稳定观察 |
| --- | --- | --- | --- |
| `CompileFailure.java` | `javac` 非零；不应把未通过源码当作可运行 class | 不进入运行阶段 | stderr 是编译诊断，文本不逐字固定 |
| `RuntimeFailure.java` | 零 | 捕获版本退出零并输出 `type=ArithmeticException`；移除捕获版本退出非零 | 异常类型和进程退出码 |
| `WrongResult.java` | 零 | 非零，stderr 含 `AssertionError` | 固定输入 `7,3` 的期望 `21` 与实际 `42` |

每个文件的所有方法和构造器定义上方都必须有规范中文 Javadoc 注释。不要把三个阶段压缩成一份
“万能错误示例”，否则无法判断反馈来自编译器、JVM 还是业务断言。

### 正向异常栈与第一条应用帧反馈环

分别编译、运行前文完整的 `StackFrameFeedback` 与 `FirstApplicationFrameFeedback`。前者预期输出异常
类型、稳定消息和首帧类/方法；后者预期两个 JDK 都退出零，并输出
`appClass=FirstApplicationFrameFeedback|appMethod=fail`。不比较行号、模块名或完整栈文本；若 VM
返回空栈或没有命中前缀，程序应明确非零而不是选择任意帧。

### jdb 反馈环

在临时目录执行；启动后先运行 `help`，确认目标 JDK 实际提供 `stop in`、`where`、`locals`、`print`、
`dump`、`next` 与 `cont`：

```text
tmp=$(mktemp -d)
javac -g -d "$tmp/out" JdbFeedback.java
jdb -classpath "$tmp/out" JdbFeedback
```

在 jdb 提示符逐步执行：

```text
help
stop at JdbFeedback:<subtotal-line>
run
where
print unitPrice
dump unitPrice
print quantity
next
print subtotal
cont
```

预期反馈是：断点命中 `JdbFeedback.total`；`where` 显示当前栈；两个输入局部值为 `7`、`3`；执行
`next` 后 `subtotal` 为 `21`；`cont` 后程序输出 `total=21` 并正常结束。该完整序列由 `jdb8` 直接
支持；在 JDK 25 上是等待目标工具 `help` 确认的验证候选，不声称 `jdb25` 页面已定义 `where` 或
`print`。自动化反馈环另外启动一次只发送 `dump unitPrice` 的会话，必须观察到 `unitPrice = 7`，且不得
出现未知命令提示；这样 `dump` 不能借用 `locals` 或 `print` 的输出假通过。若 `help` 没有列出某个
命令，signoff 应记录实际提示并停止把该命令写入自动化脚本。

### Javadoc 生成反馈环

在临时目录创建带 `parsePort` 注释的 `JavadocFeedback.java`，执行：

```text
javadoc -quiet -d docs JavadocFeedback.java
```

预期生成 HTML 中同时包含：

- 主描述：非空端口文本如何转换；
- Parameters：`raw` 的非空、十进制和空白约束；
- Returns：1 到 65535 的返回范围；
- Throws：空文本、非十进制和越界分别触发 `IllegalArgumentException` 的说明。

再把 `@return` 从 `void` 方法或把参数名改错，分别运行 `javadoc` 并记录警告/缺失区块；不把某个
doclet 的 warning 文本当作 Java 语法错误。生成目录必须在验证后用 `find <temp-dir> -depth -delete`
清理。

### 复跑记录与清理

后续 signoff 需要记录：

1. modern/legacy 固定 JDK 的镜像标识或本机路径、`javac -version`、`java -version`、`jdb` 版本信息。
2. 三个阶段文件的编译退出码、运行退出码、稳定 stdout/stderr 类型标记。
3. 栈反馈的类型、消息前缀、首帧类/方法、应用前缀命中结果；不记录完整路径作为跨版本断言。
4. jdb 的目标版本、`help` 命令清单、断点位置，以及实际可用的 `where`、`locals`、`print`、`dump`、
   `next`、`cont` 观察摘要和是否使用 `-g`；JDK 25 不把页面未列命令记成文档已保证。
5. Javadoc 输出目录中四个合同区块的存在性和源码/文档对应关系。
6. 同一临时目录已用 `find <temp-dir> -depth -delete` 清理，仓库没有新增 `.java`、`.class`、日志或 HTML。

| 研究结论 | 后续课程最小观察 | signoff 证据 |
| --- | --- | --- |
| 三阶段反馈不同 | 编译错误、运行异常、错误结果三个独立文件 | 两个 JDK 的编译/运行退出码与稳定标记 |
| 栈顶是零号元素 | `getStackTrace()[0]` 输出创建/抛出方法 | 首帧类名/方法名，不断言行号 |
| 第一应用帧需要前缀 | `firstApplicationFrame` 命中或明确返回 null | 应用前缀与命中结果 |
| jdb 查看局部值依赖调试信息 | JDK 8 按文档执行完整序列；JDK 25 先用目标 `help` 确认可用命令 | 目标版本、`help` 清单、实际命令序列与观察摘要 |
| Javadoc 四个合同区块可阅读 | 运行 `javadoc` 并检查 HTML | 描述、Parameters、Returns、Throws 存在且一致 |

## 被排除或尚未证实的说法

- 不把完整异常消息、文件行号、模块前缀、`printStackTrace()` 排版或 jdb 提示文本声明为 Java 8 与
  Java 25 逐字相同。
- 不把“第一条应用栈帧”写成 JLS 规则；它依赖应用包名前缀、类加载器边界和可用栈帧，是工程诊断
  启发式。
- 不把 `locals` 当作 Oracle jdb 的独立标准命令；官方 JDK 8 文档通过 `print`/`dump` 在挂起栈帧上
  查看局部变量和字段，目标 JDK 的 `help` 才是当前命令可用性的最终观察。
- 不扩展到自定义调试器、IDE 专项、远程生产 attach、安全权限、日志访问控制、脱敏策略、HTTP 错误
  格式、JFR/JMC、性能基准或 native 调试。
- 不把 Javadoc 文档合同当作运行时校验，不声称 `@throws` 会自动捕获或转换异常。
- 不把异常捕获、日志框架、HTTP 错误映射、Spring `@ControllerAdvice` 或 Boot 开发工具行为归因于
  JLS 或标准 jdb。
- 不读取、运行或复制 `dzzz-app` 未冻结的业务文件；`projectEvidence` 在本研究阶段保持空数组。
- 本研究停止在 B-11，不领取、研究或实现 B-12 及之后课程。

## 官方来源清单

- [OpenJDK JDK 25](https://openjdk.org/projects/jdk/25/) - Java SE 25 参考实现与 GA 状态。
- [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) - Java 25 LTS 状态。
- [JLS 25 Chapter 1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-1.html) - 编译期与运行期边界。
- [JLS 8 Chapter 1](https://docs.oracle.com/javase/specs/jls/se8/html/jls-1.html) - Java 8 编译/运行边界。
- [JLS 25 Chapter 11](https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html) - 异常分类、编译期检查和运行时处理。
- [JLS 8 Chapter 11](https://docs.oracle.com/javase/specs/jls/se8/html/jls-11.html) - Java 8 异常合同。
- [Throwable - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html) - 栈快照、消息、cause、结构化栈和打印。
- [Throwable - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/lang/Throwable.html) - Java 8 对应 API。
- [StackTraceElement - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/StackTraceElement.html) - 类、方法、文件、行号和 native 字段。
- [StackTraceElement - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/lang/StackTraceElement.html) - Java 8 对应字段。
- [The jdb Command - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/specs/man/jdb.html) - 断点、`next`、`cont` 和异常停靠。
- [jdb - JDK 8 Tools Reference](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/jdb.html) - `where`、`print`/`dump`、`javac -g` 和基本命令。
- [Secure Coding Guidelines for Java SE](https://www.oracle.com/java/technologies/javase/seccodeguide.html) - 异常信息的用户可见安全边界。
- [Documentation Comment Specification](https://docs.oracle.com/en/java/javase/25/docs/specs/javadoc/doc-comment-spec.html) - 文档注释位置、方法文档和标准标签。
- [javadoc - JDK 8 Tools Reference](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/javadoc.html) - Java 8 标准 doclet 和标签。
- [Dev.java Exceptions](https://dev.java/learn/exceptions/) - 官方异常教学入口。

## 发布前自检

- [x] 冻结课程 ID、B-10 唯一前置、75 分钟、五组主题和 Phase 2 状态已明确。
- [x] Java 25 现代线、Java 8 legacy 线及 Spring Boot/Framework 背景边界已明确。
- [x] 编译/运行分类、异常类型/消息/栈帧、首个应用帧、jdb 和 Javadoc 关键结论均绑定直接官方来源。
- [x] 负向反馈环覆盖编译失败、运行时异常和错误结果，并写明预期退出码及稳定观察。
- [x] jdb 局部变量条件写成 `javac -g` + `print`/`dump`；没有把未被官方列出的 `locals` 命令写成事实。
- [x] jdb 命令按 JDK 25/JDK 8 页面逐项归因；JDK 25 的 `where`/`print` 等候目标 `help` 确认。
- [x] 用户可见异常信息边界已绑定 Oracle Secure Coding Guidelines，且未扩展日志或 HTTP 设计范围。
- [x] Java 8 兼容源码中的方法和构造器定义上方均有规范中文 Javadoc 注释。
- [x] 版本差异、消息/行号不稳定性、包名前缀启发式和停止边界已记录。
- [x] 未修改课程正文、track、loader、manifest、signoff、其他研究稿或 `dzzz-app`。

## Stop Boundary

本研究记录只授权 Phase B 的 B-11 `debugging-stack-traces-and-javadoc`。研究稿完成不等于课程批次
关闭；只有 B-11 正文、Java 25/8 反馈环、catalog、搜索、进度、浏览器、完整 Gate、signoff 及
Standards / Spec 审查全部通过后，才可宣布 B-11 关闭。当前任务在研究稿、定向格式验证和 SHA-256
报告后停止，不授权读取、研究或启动 B-12 及之后课程。
