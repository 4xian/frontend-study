---
id: backend.java.learn.basics.debugging-stack-traces-and-javadoc
type: lesson
title: 程序调试、异常栈与 Javadoc 阅读
summary: 从可复现反馈开始阅读异常栈，用 jdb 缩小范围，再用 Javadoc 核对 API 合同
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 75
prerequisites:
  - backend.java.learn.basics.exceptions-and-cause-chains
objectives:
  - 能区分编译失败、运行时异常和结果错误，并为每类问题建立反馈环。
  - 能从异常类型、消息和栈帧定位第一条属于自己代码的调用位置。
  - 能使用 jdb 的断点、where、locals、print、next 和 cont 观察 Java 8/25 程序。
  - 能按 Javadoc 的描述、参数、返回值和 Throws 核对 API 使用合同。
  - 能避免只看最后一行、修改症状代码和把调试器输出当成业务结果。
recap:
  - 编译器拒绝的是源码合同，运行时异常来自已编译程序，错误结果可能完全不抛异常。
  - 栈顶通常是异常抛出点；从下向上读调用关系，再从上向下找第一条应用栈帧。
  - jdb 观察的是一次运行中的状态，断点命中后必须先确认位置再逐步执行。
  - Javadoc 是 API 的公开合同，描述、参数、返回值和 Throws 共同决定调用方式。
  - Java 8 与 Java 25 的本课调试命令和核心 API 阅读方法一致。
related: []
tags:
  - Java
  - 调试
  - 异常栈
  - jdb
  - Javadoc
appliesTo: Java 25；调试命令和示例兼容 Java 8
modernBaseline:
  java: "25"
legacyBaseline:
  java: "8"
  springBoot: 2.3.12.RELEASE
verifiedAt: 2026-08-15
sources:
  - id: openjdk-jdk-25
    title: OpenJDK JDK 25
    url: https://openjdk.org/projects/jdk/25/
    sourceType: official-reference
    appliesTo: JDK 25
    claims:
      - JDK 25 是 Java SE 25 的参考实现。
  - id: oracle-java-roadmap
    title: Oracle Java SE Support Roadmap
    url: https://www.oracle.com/java/technologies/java-se-support-roadmap.html
    sourceType: official-reference
    appliesTo: Java SE 25
    claims:
      - Java 25 是 LTS 版本，Java 8 是长期支持版本。
  - id: jls25-compile-runtime
    title: Java Language Specification 25 - Chapter 1
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-1.html
    sourceType: specification
    appliesTo: Java 25
    claims:
      - 规范区分编译期错误与运行期加载、链接和执行活动。
  - id: jls8-compile-runtime
    title: Java Language Specification 8 - Chapter 1
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-1.html
    sourceType: specification
    appliesTo: Java 8
    claims:
      - Java 8 同样区分编译期错误和运行期活动。
  - id: jls25-exceptions
    title: Java Language Specification 25 - Chapter 11
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html
    sourceType: specification
    appliesTo: Java 25
    claims:
      - 规范定义异常分类、编译期检查和沿调用栈寻找处理器的运行时规则。
  - id: jls8-exceptions
    title: Java Language Specification 8 - Chapter 11
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-11.html
    sourceType: specification
    appliesTo: Java 8
    claims:
      - Java 8 的异常分类、检查和运行时处理合同支持本课兼容反馈。
  - id: jdb25
    title: jdb - Java SE 25 Tools Reference
    url: https://docs.oracle.com/en/java/javase/25/docs/specs/man/jdb.html
    sourceType: official-reference
    appliesTo: Java 25
    claims:
      - JDK 25 jdb 文档明确列出 stop in、next 和 cont；where、print、dump 与局部变量检查需先以目标工具 help 核对。
  - id: jdb8
    title: jdb - Java SE 8 Tools Reference
    url: https://docs.oracle.com/javase/8/docs/technotes/tools/unix/jdb.html
    sourceType: official-reference
    appliesTo: Java 8
    claims:
      - Java 8 jdb 提供断点、where、print、dump、next 和 cont，局部变量查看需要 javac -g。
  - id: oracle-java-secure-exceptions
    title: Secure Coding Guidelines for Java SE
    url: https://www.oracle.com/java/technologies/javase/seccodeguide.html
    sourceType: security-standard
    appliesTo: Java SE（当前 Oracle 页面）
    claims:
      - 异常对象可能包含配置和内部信息；除非明确知道内容，否则不要把异常信息传给终端用户或把完整堆栈放进 HTML。
  - id: throwable25
    title: Throwable - Java SE 25
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - Throwable 提供异常消息、cause 和 stack trace 访问方法。
  - id: throwable8
    title: Throwable - Java SE 8
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/Throwable.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 Throwable 的消息、cause 和栈轨迹 API 与本课示例兼容。
  - id: stack-trace-element25
    title: StackTraceElement - Java SE 25
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/StackTraceElement.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - StackTraceElement 描述类名、方法名、文件名和行号。
  - id: stack-trace-element8
    title: StackTraceElement - Java SE 8
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/StackTraceElement.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 StackTraceElement 已提供本课定位所需的访问方法。
  - id: javadoc25
    title: Documentation Comment Specification - Java SE 25
    url: https://docs.oracle.com/en/java/javase/25/docs/specs/javadoc/doc-comment-spec.html
    sourceType: official-reference
    appliesTo: Java 25
    claims:
      - javadoc 根据文档注释生成 API 文档，并识别参数、返回值和 Throws 标签。
  - id: javadoc8
    title: javadoc - Java SE 8 Tools Reference
    url: https://docs.oracle.com/javase/8/docs/technotes/tools/windows/javadoc.html
    sourceType: official-reference
    appliesTo: Java 8
    claims:
      - Java 8 javadoc 支持本课的文档注释和 API 文档生成命令。
  - id: dev-java-exceptions
    title: Dev.java Exceptions
    url: https://dev.java/learn/exceptions/
    sourceType: official-reference
    appliesTo: 当前 Dev.java
    claims:
      - 官方教学入口说明异常会打断正常控制流，并连接到捕获和抛出主题。
projectEvidence: []
---

# 程序调试、异常栈与 Javadoc 阅读

## 为什么需要学习

程序出问题时，先改代码往往会把原因藏得更深。可靠的调试从一个可重复的反馈开始：同一输入再次
运行，得到同一失败或同一错误结果，然后用证据缩小范围。编译器、运行时和业务断言提供的是三种不同
的反馈，不能混成一句“程序报错了”。

本课把上一课的异常传播连接到实际定位：先读异常类型、消息和栈帧，再找到第一条属于自己代码的栈帧；
需要观察中间状态时，使用 jdb 在断点处查看局部变量。最后回到 Javadoc，核对调用点真正依赖的参数、
返回值和 Throws 合同，而不是凭方法名猜测行为。

## 学习目标

- 区分编译失败、运行时异常和错误结果，并为每类问题建立最小反馈环。
- 从异常类型、消息和栈帧中找出第一条应用代码位置。
- 使用 `stop in`、`where`、`locals`、`print`、`next` 和 `cont` 观察执行。
- 通过 Javadoc 的描述、参数、返回值和 `Throws` 核对 API 合同。
- 在 Java 8 和 Java 25 上复现同一份调试示例，并区分版本输出差异与程序错误。

## 前置术语

上一课已经学习异常类型、传播、捕获和 cause。本课新增以下术语：

- **编译失败**：`javac` 无法把源码转换为 class 文件，程序尚未运行。
- **运行时异常**：class 已生成，执行时抛出未处理的 `Throwable`。
- **错误结果**：程序正常结束但结果不符合业务断言。
- **栈帧**：一次方法调用在当前线程调用栈中的执行记录。
- **断点**：调试器暂停执行的位置。
- **Javadoc 合同**：公开 API 文档对用途、参数、返回值和异常条件的说明。

## 零基础知识点详解

### 编译失败、运行时异常与错误结果是三种反馈

**是什么：** 编译失败发生在 `javac` 阶段；运行时异常发生在已编译程序执行阶段；错误结果是程序没有
抛异常却违反了预期。三者的证据入口分别是编译器退出码、异常栈和可执行断言。

**作用：** 先分类能避免在错误的阶段找原因。编译失败不需要启动调试器，错误结果也不能只搜索异常日志。

**场景：** `int count = "3"` 是编译失败；`Integer.parseInt("x")` 是运行时异常；把 `42` 错写成 `24`
是错误结果。

**怎么用：** 保留最小输入，先执行编译，再执行一次命令；成功路径必须有明确输出或断言，失败路径必须
检查非零退出或预期异常类型。

```java
public final class FeedbackKinds {
    /** 把输入转换成任务编号，非法文本会在运行时失败。 */
    private static int parse(String raw) {
        return Integer.parseInt(raw);
    }

    /** 验证正常结束但结果不正确时能被断言发现。 */
    private static void assertResult(int actual) {
        if (actual != 42) {
            throw new AssertionError("expected 42, got " + actual);
        }
    }

    /** 运行运行时异常和错误结果的两个最小反馈。 */
    public static void main(String[] args) {
        try {
            parse("x");
            throw new AssertionError("expected NumberFormatException");
        } catch (NumberFormatException exception) {
            System.out.println("B11_RUNTIME:" + exception.getClass().getSimpleName());
        }
        assertResult(42);
        System.out.println("B11_RESULT:ok");
    }
}
```

**运行结果：** 正常编译运行时先输出 `B11_RUNTIME:NumberFormatException`，再输出
`B11_RESULT:ok`。把 `assertResult(42)` 改成 `assertResult(24)` 时，错误结果会被断言转换成失败反馈。

**常见误区：** 看到终端有红色文字就跳过退出码和最后一条栈帧；不要把编译诊断、异常栈和业务断言当成
同一种错误。

### 从异常类型、消息和栈帧读取事实

**是什么：** 未处理异常通常打印类型和消息，随后按栈帧列出调用路径。栈顶附近是异常抛出点，下面的帧
是调用者；真正需要修改的第一条应用栈帧可能不是最顶端的 JDK 帧。

**作用：** 类型告诉你失败类别，消息提供输入或资源上下文，栈帧把失败连接到源码文件和行号。三者缺一
不可只凭猜测修复。

**场景：** `Integer.parseInt` 抛出 `NumberFormatException` 时，先确认消息中的原始文本，再找到自己的
`parseTaskId` 调用，而不是修改 `Integer` 类或盲目捕获异常。

**怎么用：** 从第一行开始记录异常类型和消息；从上到下检查栈帧，遇到第一条项目包名或当前文件就停下；
用 `StackTraceElement` 读取同样的结构化字段。

```java
public final class StackFacts {
    /** 读取异常的第一条栈帧并输出可比较事实。 */
    private static void printFacts() {
        try {
            Integer.parseInt("bad-id");
        } catch (NumberFormatException exception) {
            StackTraceElement frame = exception.getStackTrace()[0];
            System.out.println("B11_STACK:" + exception.getClass().getSimpleName()
                + "|" + exception.getMessage()
                + "|" + frame.getClassName()
                + "|" + frame.getMethodName());
        }
    }

    /** 运行栈事实示例。 */
    public static void main(String[] args) {
        printFacts();
    }
}
```

**运行结果：** 输出以 `B11_STACK:NumberFormatException|For input string: "bad-id"|StackFacts|printFacts`
开头；JDK 版本可能改变消息措辞，但异常类型、当前类和方法合同不变。

**常见误区：** 断言整个异常消息逐字相同；跨 JDK 版本只绑定类型和关键上下文，不绑定实现可以变化的
措辞。

### 第一条应用栈帧是缩小范围的起点

**是什么：** 调用链可能包含 JDK、框架和应用帧。第一条属于当前应用包的帧通常是最小可行动范围，但它
不是自动证明“这一行就是唯一根因”。还要向下阅读调用者的输入和契约。

**作用：** 让排查从一条具体路径开始，避免在整仓库搜索异常类名。

**场景：** `main -> loadTask -> parseTaskId -> Integer.parseInt` 中，应用第一帧是 `parseTaskId`；应先
检查它的 `raw` 来源和转换合同，再决定是否修改调用者。

**怎么用：** 记录 `className`、`methodName`、`fileName` 和 `lineNumber`；确认源码版本与 class 文件匹配；
然后在该方法入口加断点或临时断言复现。

```java
public final class FrameLocator {
    /** 返回第一条指定包名前缀的应用栈帧。 */
    private static StackTraceElement firstApplicationFrame(String packagePrefix) {
        for (StackTraceElement frame : new Throwable().getStackTrace()) {
            if (frame.getClassName().startsWith(packagePrefix)) {
                return frame;
            }
        }
        return null;
    }

    /** 通过两层调用展示应用栈帧的定位起点。 */
    private static void loadTask() {
        StackTraceElement frame = firstApplicationFrame("FrameLocator");
        if (frame == null) {
            throw new AssertionError("application frame missing");
        }
        System.out.println("B11_APP_FRAME:" + frame.getClassName() + "|" + frame.getMethodName());
    }

    /** 运行应用栈帧示例。 */
    public static void main(String[] args) {
        loadTask();
    }
}
```

**运行结果：** 输出 `B11_APP_FRAME:FrameLocator|firstApplicationFrame`。若 class 文件来自旧源码，行号和
局部变量可能不对应；先清理临时输出再重新编译，不要依据错配证据修改业务代码。

**常见误区：** 把第一条应用帧当成唯一根因，或忽略栈帧来自旧构建；定位范围与根因确认是两个步骤。

### jdb 断点、栈、局部变量和单步

**是什么：** `jdb` 是 JDK 自带命令行调试器。`stop in` 在方法入口暂停，`where` 查看线程栈，`print`
或 `dump` 查看当前帧局部变量，`next` 执行到当前帧下一行，`cont` 继续运行。课程合同中的
`locals` 表示“检查局部变量”这一步；JDK 8/25 官方命令文档没有把它列为独立标准命令。

**作用：** 调试器能观察中间状态，不需要在正式代码中留下日志或改变返回值。

**场景：** 解析输入前要确认 `raw` 到底是什么；断点命中 `parseTaskId` 后先执行 `where` 和
`print raw`，再用 `next` 观察 `taskId`，最后 `cont` 看最终输出。

**怎么用：** 用带调试信息的 `javac -g` 编译，按方法名设置断点，逐条执行命令；每次停下都记录当前线程
和帧，不要把上一次命令的输出当成当前状态。

```text
stop in DebugTarget.parseTaskId
run
where
locals
print raw
dump raw
next
locals
print taskId
cont
quit
```

**运行结果：** Java 25 和 Java 8 都会命中 `DebugTarget.parseTaskId`；当前两版容器实测的 `locals`
能观察到 `raw = "42"`，直接运行输出 `B11_TARGET:42`。这不把 `locals` 提升为官方跨版本保证；便携脚本
仍应使用手册记录的 `print`/`dump`。线程提示、局部变量列表和源码行号格式可能不同。

**常见误区：** 没有 `-g` 就要求调试器显示全部局部变量；把 `locals` 当成所有 JDK 版本都存在的独立
命令；在错误的方法名上设断点；使用 `step` 进入 JDK 实现而失去当前应用路径；把 `where` 的帧顺序读反。

### Javadoc 的描述、参数、返回值与 Throws

**是什么：** Javadoc 是 API 的公开文档合同。描述说明用途和前置条件，`@param` 说明每个参数，`@return`
说明正常结果，`@throws`/`@exception` 说明异常条件。调用者应先读这些合同，再决定输入校验和失败处理。

**作用：** 文档能回答“这个方法在什么条件下成功”，比猜方法名或只看返回类型更可靠。

**场景：** `Integer.parseInt(String)` 的 Javadoc 明确说明空值会触发 `NumberFormatException`，返回值是
解析后的整数；调用方不能把所有异常都当成“返回 0”。

**怎么用：** 在 IDE 或官方 Java SE API 页面打开方法；按“描述 → 参数 → 返回值 → Throws”顺序核对，
再用最小输入验证边界。自己写 API 时也按同样顺序补齐文档注释。

```java
/** 解析任务编号。
 *
 * @param raw 只包含十进制数字的文本
 * @return 任务编号
 * @throws NumberFormatException 文本不是合法整数时抛出
 */
public static int parseTaskId(String raw) {
    return Integer.parseInt(raw);
}
```

**运行结果：** 合法输入 `"42"` 返回 `42`；输入 `"x"` 抛出 `NumberFormatException`。文档描述的是合同，
不会自动替调用者处理异常。

**常见误区：** 只读摘要不读 Throws；把 `@throws` 当成“方法一定会抛”；写了 Javadoc 就以为程序已经
校验参数；忽略 Java 8 与 Java 25 页面中可能不同的消息示例。

## 现代版本中的正确用法

Java 25 是本课现代基线；Java 8 作为兼容验证线。`Throwable`、`StackTraceElement` 和
`Integer.parseInt` 的本课 API 在两版中都存在。Java 25 页面使用模块化 API URL，Java 8 页面使用旧版
API 路径；这只是文档入口差异，不改变本课的调试顺序。JDK 25 的 `where`、`print`、`dump` 和局部变量
检查必须先由目标工具的 `help` 确认；不能把 JDK 25 页面未列出的命令写成官方合同。

调试时先让程序带调试信息编译，再从应用栈帧设置断点。本课只绑定稳定的异常类型、应用类名、方法名和
业务标记，不把线程提示、完整异常消息或源码行号当作跨版本合同。

## 新旧版本差异

| 对比项 | Java 25 | Java 8 | 本课处理 |
| --- | --- | --- | --- |
| API 文档入口 | 模块化 Java SE API URL | 旧版 Java SE API URL | 分别链接官方页面，核心调用方式保持一致 |
| jdb 命令来源 | 手册明确断点、`next`、`cont`；其他命令先看目标 `help` | 工具文档直接说明 `where`、`print`、`dump` 和 `-g` | 两版反馈环都先核对 `help`，不把页面未列命令写成规范保证 |
| 栈帧输出 | 可能出现模块和类加载器信息 | 主要显示类、方法、文件和行号 | 只比较异常类型、应用类和方法，不逐字比较排版 |
| Javadoc 能力 | 支持较新的文档注释能力 | 支持传统注释与块标签 | 示例只用 Java 8 已有的 `@param`、`@return`、`@throws` |

## 基本语法

```bash
javac -g DebugTarget.java
jdb DebugTarget
```

`jdb` 命令输入顺序是先用 `help` 确认目标命令，再执行 `stop in`、`run`、观察命令和 `cont`。单步只服务
于回答一个具体问题：当前值在这一行之前还是之后发生了变化。没有问题时直接 `cont`，不要为了“看得更多”
进入每个库方法。

## Java 8 兼容写法

反馈环只使用 Java 8 已有的类、方法和 jdb 命令，不使用模块选项、局部变量类型推断或 Java 9 之后的
try-with-resources 简写。Java 8 直接按工具文档执行 `where`、`print`、`dump`；Java 25 先运行 `help`，
确认目标工具可用后再执行相同观察。两版运行时都使用同一份源码。

## 安全注意

Oracle Secure Coding Guidelines 指出异常对象可能包含配置和内部信息。生产边界不要把敏感参数、完整
堆栈、内部路径或凭据直接返回给外部请求；只返回预先定义的安全字段，把完整诊断保留在受控环境中。
本课示例只在本地临时终端输出，Web 错误响应和日志访问控制留给后续 Spring MVC 与生产课程。

## 易错点

### 错误：把编译器诊断当成运行时异常

**触发条件：** `javac` 失败后仍直接执行 `java`。

**原因：** 编译器还没有生成可运行的 class。

**后果：** 把编译诊断误读成运行时异常，反馈阶段混乱。

**修正：** 先保留 `javac` 的非零退出和诊断，再修复最小源码。

**验证：** 反馈环中的 `CompileFailure.java` 必须编译失败，且不进入运行阶段。

### 错误：只看异常最后一行

**触发条件：** 只复制 `Exception in thread` 后的一行消息。

**原因：** 消息可能不包含调用者上下文，栈帧才提供文件、方法和行号。

**后果：** 无法判断哪一层传入了错误输入。

**修正：** 同时记录类型、消息、栈顶和第一条应用栈帧。

**验证：** 用 `StackTraceElement` 检查类名和方法名，不把完整行号当作跨版本断言。

### 错误：直接修改第一条看见的业务行

**触发条件：** 看到一行看似可疑的代码就立即修改。

**原因：** 尚未确认源码与 class 匹配，也没有复现输入和前置条件。

**后果：** 症状可能暂时消失，真正的输入或调用合同问题被掩盖。

**修正：** 先保存最小复现，再用断点或断言证明假设，最后做最小修改。

**验证：** 断点命中 `parseTaskId` 并观察 `raw` 后，才判断是否需要修改解析代码。

### 错误：把 Javadoc 的 Throws 当成实现细节

**触发条件：** 只读方法名和返回类型，不读 `@throws` 的触发条件。

**原因：** 把 Javadoc 当成实现注释，而不是调用者可依赖的 API 合同。

**后果：** 调用方没有按文档处理非法输入，异常边界变得不可预测。

**修正：** 按描述、参数、返回值和 Throws 顺序核对，再决定校验和失败处理。

**验证：** 对 `Integer.parseInt("x")` 运行最小示例，确认文档所述的 `NumberFormatException`。

### 错误：在生产响应中回显完整异常栈

**触发条件：** 把 `printStackTrace()` 或完整异常对象直接放入外部响应。

**原因：** 异常对象可能包含配置、内部路径、类名、参数或凭据。

**后果：** 外部调用者获得不必要的内部诊断信息，增加信息泄露风险。

**修正：** 外部边界只返回已知可接受的错误字段，把完整诊断留在受控日志；Web 错误合同留给后续课程。

**验证：** 检查响应序列化结果不包含堆栈或内部路径，并保留本地终端的完整诊断供调试。

## 从零跟着做

1. 创建 `DebugTarget.java`，使用 `parseTaskId`、`loadTask`、`main` 三层调用。
2. 用 `javac -g DebugTarget.java` 编译，确保生成 `DebugTarget.class`。
3. 用 `jdb DebugTarget` 启动，逐条输入本课命令，记录 `where`、`locals` 和 `print raw`。
4. 打开 `Integer.parseInt` 的 Java 25 或 Java 8 Javadoc，核对参数、返回值和 Throws。
5. 把输入改成 `"x"`，先直接运行观察异常栈，再回到 `parseTaskId` 设置断点。
6. 删除临时 class 和源码，确认仓库没有新增验证文件。

## 如何使用

遇到问题时按这个顺序执行：

1. 保留最小复现输入和完整命令。
2. 判断是编译失败、运行时异常还是错误结果。
3. 记录异常类型、消息和第一条应用栈帧。
4. 只对一个假设设置断点，使用 `locals`、`print`、`next` 验证。
5. 用 Javadoc 核对调用合同，修复最小责任边界。
6. 复跑同一个反馈环，并记录结果而不是只记录“已修复”。

## 适用与不适用场景

适用于本地 Java 命令行程序、单元测试中的异常定位和阅读 Java SE API。它不替代分布式追踪、生产日志
采集、远程调试权限或 Spring 的统一错误响应；这些内容放在后续 Web 与生产课程。

## 如何验证

反馈环只在固定 Java 容器的临时目录生成源码、class 和 jdb 输出，退出后删除目录。它分别验证编译失败、
运行时异常、错误结果和正向 jdb 观察；Java 8/25 只比较稳定标记，不比较版本相关的线程提示、行号格式
或异常消息完整措辞。jdb 会话先用 `help` 核对目标命令，再逐条发送命令，脚本不会吞掉 jdb 失败。

```bash b11-feedback-loop
set -euo pipefail

run_b11_feedback() {
  image_ref=$1
  docker run --rm -i "$image_ref" bash -s <<'CONTAINER'
set -euo pipefail
work_dir=$(mktemp -d /tmp/java-debug-feedback.XXXXXX)
trap 'find "$work_dir" -depth -delete' EXIT
cd "$work_dir"

cat > DebugTarget.java <<'JAVA'
public final class DebugTarget {
    /** 把文本任务编号转换为整数。 */
    private static int parseTaskId(String raw) {
        int taskId = Integer.parseInt(raw);
        return taskId;
    }

    /** 提供可在 jdb 中观察的调用入口。 */
    private static int loadTask() {
        String raw = "42";
        return parseTaskId(raw);
    }

    /** 输出调试目标的最终结果。 */
    public static void main(String[] args) {
        System.out.println("B11_TARGET:" + loadTask());
    }
}
JAVA

javac -g -encoding UTF-8 DebugTarget.java
java DebugTarget > target.log
grep -q 'B11_TARGET:42' target.log
set +e
printf '%s\n' 'help' | jdb -J-XX:-TieredCompilation -classpath . DebugTarget > jdb-help.log 2>&1
jdb_help_status=("${PIPESTATUS[@]}")
set -e
test "${jdb_help_status[1]}" -eq 0
grep -q 'stop in' jdb-help.log
grep -q '^where ' jdb-help.log
grep -q '^locals ' jdb-help.log
grep -q '^print <expr>' jdb-help.log
grep -q '^dump <expr>' jdb-help.log
grep -q '^next ' jdb-help.log
grep -q '^cont ' jdb-help.log
set +e
{
  printf '%s\n' 'stop in DebugTarget.parseTaskId'
  sleep 0.5
  printf '%s\n' 'run'
  sleep 1
  printf '%s\n' 'where'
  sleep 0.5
  printf '%s\n' 'locals'
  sleep 0.5
  printf '%s\n' 'print raw'
  sleep 0.5
  printf '%s\n' 'next'
  sleep 1
  printf '%s\n' 'locals'
  sleep 0.5
  printf '%s\n' 'print taskId'
  sleep 0.5
  printf '%s\n' 'cont'
  sleep 1
  printf '%s\n' 'quit'
} | jdb -J-XX:-TieredCompilation -classpath . DebugTarget > jdb.log 2>&1
jdb_status=("${PIPESTATUS[@]}")
set -e
test "${jdb_status[1]}" -eq 0
grep -q 'Breakpoint hit' jdb.log
grep -q 'DebugTarget.parseTaskId' jdb.log
grep -q 'DebugTarget.loadTask' jdb.log
grep -q 'Method arguments:' jdb.log
grep -q 'Local variables:' jdb.log
grep -q 'raw = "42"' jdb.log
grep -q 'Step completed' jdb.log
grep -q 'taskId = 42' jdb.log
grep -q 'B11_TARGET:42' jdb.log

set +e
{
  printf '%s\n' 'stop in DebugTarget.parseTaskId'
  sleep 0.5
  printf '%s\n' 'run'
  sleep 1
  printf '%s\n' 'dump raw'
  sleep 0.5
  printf '%s\n' 'quit'
} | jdb -J-XX:-TieredCompilation -classpath . DebugTarget > jdb-dump.log 2>&1
jdb_dump_status=("${PIPESTATUS[@]}")
set -e
test "${jdb_dump_status[1]}" -eq 0
grep -q 'raw = "42"' jdb-dump.log
if grep -Eq 'Unrecognized command|Command not valid' jdb-dump.log; then
  exit 1
fi
printf '%s\n' 'B11_JDB_PASS'

cat > CompileFailure.java <<'JAVA'
public final class CompileFailure {
    /** 让 javac 在类型不匹配处返回失败。 */
    public static void main(String[] args) {
        int taskId = "42";
        System.out.println(taskId);
    }
}
JAVA
if javac -encoding UTF-8 CompileFailure.java > compile.log 2>&1; then
  printf '%s\n' 'unexpected compile success' >&2
  exit 1
fi
printf '%s\n' 'B11_COMPILE_FAILURE_PASS'

cat > ResultFeedback.java <<'JAVA'
public final class ResultFeedback {
    /** 把错误结果转换为可观察的断言失败。 */
    private static void assertTaskId(int actual) {
        if (actual != 42) {
            throw new AssertionError("expected 42, got " + actual);
        }
    }

    /** 运行错误结果反馈。 */
    public static void main(String[] args) {
        boolean assertionObserved = false;
        try {
            assertTaskId(24);
        } catch (AssertionError error) {
            assertionObserved = "expected 42, got 24".equals(error.getMessage());
        }
        if (!assertionObserved) {
            throw new AssertionError("wrong result did not fail with the expected assertion");
        }
        System.out.println("B11_WRONG_RESULT_PASS");
    }
}
JAVA
javac -encoding UTF-8 ResultFeedback.java
java ResultFeedback

cat > RuntimeFeedback.java <<'JAVA'
public final class RuntimeFeedback {
    /** 调用 JDK 解析 API，非法输入必须产生指定异常类型。 */
    public static void main(String[] args) {
        try {
            Integer.parseInt("x");
            throw new AssertionError("expected NumberFormatException");
        } catch (NumberFormatException exception) {
            System.out.println("B11_RUNTIME:" + exception.getClass().getSimpleName());
        }
    }
}
JAVA
javac -encoding UTF-8 RuntimeFeedback.java
java RuntimeFeedback
CONTAINER
}

JAVA_25_IMAGE="${JAVA_25_IMAGE:-eclipse-temurin:25-jdk}"
JAVA_8_IMAGE="${JAVA_8_IMAGE:-eclipse-temurin:8-jdk}"
java_25_output=$(run_b11_feedback "$JAVA_25_IMAGE")
java_8_output=$(run_b11_feedback "$JAVA_8_IMAGE")
test "$(printf '%s\n' "$java_25_output" | sed -n 's/^B11_//p')" = "$(printf '%s\n' "$java_8_output" | sed -n 's/^B11_//p')"
printf '%s\n' "$java_25_output"
printf '%s\n' 'B11_FEEDBACK_PASS'
```

预期两版都包含：

```text
B11_JDB_PASS
B11_COMPILE_FAILURE_PASS
B11_WRONG_RESULT_PASS
B11_RUNTIME:NumberFormatException
B11_FEEDBACK_PASS
```

:::exercise
### 练习：从一段异常栈定位输入

**要求：** 让 `parseTaskId` 对非法文本抛出 `NumberFormatException`；运行一次并记录类型、消息和第一条
应用栈帧。再用 jdb 在方法入口观察 `raw`，不要添加永久调试日志。

**验收：** 能说明异常发生阶段；能指出第一条应用栈帧；能用 Javadoc 解释 `parseInt` 的参数、返回值和
Throws；Java 25 与 Java 8 正向反馈都出现 `B11_TARGET:42`，jdb 反馈都命中 `parseTaskId` 和 `raw`。

**参考答案：** 复用 `DebugTarget` 三层调用和本课 jdb 命令；用 `StackTraceElement` 读取稳定字段，
消息只断言包含输入上下文，不比较跨版本完整措辞。

:::

## 本节小结

- 先分类反馈阶段，再选择编译器、直接运行、断言或 jdb。
- 异常类型、消息和栈帧要一起读；第一条应用栈帧是缩小范围的起点。
- jdb 的断点、栈、局部变量和单步命令服务于一个可验证假设。
- Javadoc 的描述、参数、返回值和 Throws 是调用 API 前必须核对的合同。
- Java 8 与 Java 25 共享本课核心调试路径，但输出格式和诊断措辞可能不同。
