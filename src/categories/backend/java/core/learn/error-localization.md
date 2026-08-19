---
id: backend.java.learn.basics.error-localization
type: lesson
title: 错误定位
summary: 从失败阶段、第一条有效诊断和异常栈中的应用位置开始，建立可重复的 Java 错误定位闭环
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 60
prerequisites:
  - backend.java.learn.basics.compilation-and-execution
objectives:
  - 能把一次失败先分为编译失败、启动失败、运行时异常或错误结果。
  - 能保留命令、工作目录、JDK 版本和完整输出，找到第一条有用诊断。
  - 能从异常类型、消息和栈帧中找到第一条属于自己代码的可行动位置。
  - 能用最小修改复现问题、验证修复，并区分现象变化与真正解决。
  - 能在 JDK 25 和 Java 8 上使用相同的传统入口完成本课示例。
recap:
  - 没有生成 class 文件时先看编译诊断；主类未找到时先看启动命令和 classpath。
  - 运行时异常要同时保留类型、消息、栈帧和 cause，不只看最后一行文字。
  - 第一条应用栈帧是缩小范围的起点，不自动等于唯一根因。
  - 修复必须回到同一条命令和同一组输入验证，避免把偶然成功当成解决。
  - JDK 25 与 Java 8 的传统入口和定位步骤相同，具体诊断措辞可能随版本变化。
related: []
tags:
  - Java
  - 错误定位
  - 编译诊断
  - 异常栈
  - 最小复现
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 使用相同的传统入口与命令行定位步骤
verifiedAt: 2026-08-16
sources:
  - id: jls-25-overview
    title: Java Language Specification 25 Chapter 1 Introduction
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-1.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - Java 规范区分编译期活动与运行期活动，错误应先按发生阶段分类。
  - id: jls-25-exceptions
    title: Java Language Specification 25 Chapter 11 Exceptions
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 异常存在编译期检查和运行期处理两个不同层面。
      - 未找到处理器时，运行期异常会沿调用路径传播并终止当前执行。
  - id: javac-25
    title: The javac Command - JDK 25
    url: https://docs.oracle.com/en/java/javase/25/docs/specs/man/javac.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: JDK 25
    claims:
      - javac 读取源文件并生成 class 文件，编译阶段未成功就没有可启动产物。
      - JDK 25 默认保留源文件和行号信息，便于把运行栈帧对应回源码位置。
  - id: diagnostic-25
    title: Diagnostic - Java SE 25
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.compiler/javax/tools/Diagnostic.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - 编译诊断可以提供来源、行号、列号、类型和本地化消息等事实。
  - id: throwable-25
    title: Throwable - Java SE 25
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - Throwable 提供消息、cause、printStackTrace 和 getStackTrace 等定位信息。
      - getStackTrace 返回的第一个元素通常对应异常创建或抛出的栈顶位置。
  - id: stack-trace-element-25
    title: StackTraceElement - Java SE 25
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/StackTraceElement.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - 栈帧可以读取类名、方法名、文件名和行号。
  - id: throwable-8
    title: Throwable - Java SE 8
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/Throwable.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 同样提供消息、cause、printStackTrace 和 getStackTrace 定位方法。
  - id: stack-trace-element-8
    title: StackTraceElement - Java SE 8
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/StackTraceElement.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 栈帧同样能够提供类、方法、文件和行号信息。
  - id: jls-8-overview
    title: Java Language Specification 8 Chapter 1 Introduction
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-1.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 同样区分编译期和运行期活动，本课分类方法可以保持一致。
  - id: stackoverflow-classpath
    title: What does Could not find or load main class mean?
    url: https://stackoverflow.com/questions/18093928/what-does-could-not-find-or-load-main-class-mean
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 命令行传统启动模式
    claims:
      - 相对 classpath 会随当前工作目录变化，错误主类提示应回看目录和 classpath 根。
---

# 错误定位

上一课已经能把源码编译并启动。程序第一次没有按预期工作时，最容易犯的错误是立刻修改一行代码，
却没有先确认问题发生在哪个阶段。本课建立一个很小的定位习惯：保留原始输入和命令，先分类反馈，
再读取最靠前的有效线索，最后用同一条路径验证修复。

本课只处理命令行 Java 程序的第一轮定位。不会讲断点、变量观察、调用栈调试器，也不会展开完整异常
分类、日志框架或后续的 Maven 工程。

## 一、先把失败分到正确阶段

### 1. 编译失败：程序还没有开始运行

`javac` 读取 `.java` 文件并尝试生成 `.class` 文件。如果它报告 `error` 并以非零状态结束，先停在
编译阶段；此时 `java` 没有新的产物可启动。诊断中的文件名、行号、列号和消息是第一组证据。

例如，下面这一行把字符串赋给整数，故意制造编译失败：

```java
int taskCount = "3";
```

它不是运行时异常，不能靠运行按钮或异常栈解决。先恢复成合法源码并重新执行 `javac`，确认 `out` 中
出现新的 class 文件，才进入下一阶段。

### 2. 启动失败：主类还没有进入 main

class 文件存在并不表示启动命令正确。`java -cp out TeamFlowErrorLocator` 需要从 `out` 这个 classpath
根目录找到名为 `TeamFlowErrorLocator` 的类；把目录写错、主类名拼错或把 `.class` 扩展名带进去，都会
在进入 `main` 以前失败。

启动失败的一个明显信号是：你在 `main` 的第一行放了输出，控制台却完全没有看到它。先核对当前工作目录、
`out/TeamFlowErrorLocator.class` 和不带扩展名的主类名，不要先改业务代码。

### 3. 运行失败或结果错误：程序已经开始执行

运行时异常说明 class 已经被启动器加载，执行过程中抛出了未处理的异常；错误结果则可能没有任何异常，
只是输出与预期不符。例如把任务状态写成 `READY` 却输出 `DONE`，需要通过预期值和实际值的对照发现。

下面的小程序同时展示一个可捕获的运行时异常和一个结果断言。它仍然是一个完整、可编译的传统入口：

```java
/**
 * 区分运行时异常和错误结果。
 */
public final class TeamFlowFeedbackKinds {
    /**
     * 运行两个最小反馈示例并输出可观察结果。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        try {
            Integer.parseInt("task-x");
            throw new AssertionError("应该先得到 NumberFormatException");
        } catch (NumberFormatException exception) {
            System.out.println("运行时异常：" + exception.getClass().getSimpleName());
        }

        String actualStatus = "READY";
        String expectedStatus = "READY";
        if (!expectedStatus.equals(actualStatus)) {
            throw new AssertionError("状态不符合预期");
        }
        System.out.println("错误结果检查：通过");
    }
}
```

正常运行时先看到 `运行时异常：NumberFormatException`，再看到 `错误结果检查：通过`。把
`actualStatus` 改成 `DONE` 后，第二个检查会失败；这说明程序确实执行到了结果判断，而不是启动失败。

## 二、采集一组最小证据

### 1. 先保存命令、目录和版本

定位不是复制一行红色文字。把下面的信息放在同一份临时记录中：

1. 当前目录：macOS/Linux 用 `pwd`，Windows PowerShell 用 `Get-Location`。
2. 版本：`java -version` 与 `javac -version`。
3. 完整编译命令和完整启动命令。
4. 源码文件名、class 输出目录和实际输入。
5. 从第一行开始的完整标准输出与错误输出，以及退出状态。

如果只保留最后一行，后面无法判断是编译失败、启动失败还是运行时异常。相同命令和相同输入能够再次
产生相同的现象，才称得上最小复现。

### 2. 读编译诊断中的位置和消息

典型的诊断可以按四段读取：

```text
src/TeamFlowErrorLocator.java:12: error: incompatible types: String cannot be converted to int
```

- `src/TeamFlowErrorLocator.java`：编译器认为相关的源文件。
- `12`：先打开的行号，不代表根因一定只在这一行。
- `error`：这次编译没有形成可用产物。
- 冒号后的消息：当前诊断说明的合同冲突。

JDK 25 和 Java 8 的消息措辞或列号呈现可能不同；先依赖文件、行号、诊断类型和可复现输入，再判断
具体修复。不要把整段英文消息当成跨版本稳定的业务合同。

### 3. 读运行时异常的四个事实

未处理异常通常包含异常类型、消息、栈帧和可能的 `Caused by`。可以按下面顺序记录：

1. 类型：例如 `NumberFormatException`，它说明哪类运行操作失败。
2. 消息：例如包含了无法解析的原始文本。
3. 第一组栈帧：先找当前项目类，再看它的调用者。
4. cause：如果出现 `Caused by`，保留它与外层异常的关系。

`Throwable.getStackTrace()` 返回的第一个元素通常是异常创建或抛出的位置，但那一帧可能属于 JDK。
找到第一条属于自己代码的帧，是缩小范围的起点，不是跳过输入检查的理由。

## 三、从栈信息找到第一条可行动位置

### 1. 栈帧是文件和行号的组合

`StackTraceElement` 可以提供类名、方法名、文件名和行号。先把这些字段当作定位坐标，再回到对应版本
的源码和输出目录。若源码已经改过却没有重新编译，行号可能指向旧 class 的位置；这时先重建产物。

```java
/**
 * 演示如何从异常中提取第一条应用栈帧。
 */
public final class TeamFlowFrameLocator {
    /**
     * 触发一个可重复的输入解析异常。
     */
    private static void parseTaskId() {
        Integer.parseInt("task-x");
    }

    /**
     * 从栈顶向下寻找当前应用类的第一条栈帧。
     *
     * @param exception 已捕获的异常
     * @return 第一条属于本类的栈帧；没有找到时返回 null
     */
    private static StackTraceElement firstApplicationFrame(RuntimeException exception) {
        for (StackTraceElement frame : exception.getStackTrace()) {
            if (frame.getClassName().equals(TeamFlowFrameLocator.class.getName())) {
                return frame;
            }
        }
        return null;
    }

    /**
     * 运行栈帧定位示例。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        try {
            parseTaskId();
        } catch (NumberFormatException exception) {
            StackTraceElement frame = firstApplicationFrame(exception);
            if (frame == null) {
                throw new AssertionError("没有找到应用栈帧");
            }
            System.out.println("异常类型：" + exception.getClass().getSimpleName());
            System.out.println("应用位置：" + frame.getFileName() + ":" + frame.getLineNumber());
            System.out.println("应用方法：" + frame.getMethodName());
        }
    }
}
```

预期输出包含 `异常类型：NumberFormatException`、当前文件名和 `parseTaskId`。行号会随文件编辑变化，
所以验收时比较类、方法和“是当前文件中的有效行号”，不要把某个固定数字当成唯一结果。

### 2. 先看应用帧，再回看输入和调用者

假设调用关系是 `main -> loadTask -> parseTaskId -> Integer.parseInt`。JDK 帧告诉你标准库在哪里拒绝
输入，第一条应用帧告诉你项目从哪里把输入交给了标准库；真正的根因还可能在更早的文件读取或参数绑定。
定位顺序应当是“找到应用位置 → 查看传入值 → 回到调用者合同”，而不是把 JDK 类复制到项目中修改。

### 3. cause 只用于保留因果关系

外层异常可以说明当前操作失败，`Caused by` 则保留更早的失败原因。当前课只要求把两者一起记录，
不要求设计自定义异常层级或完整的异常处理策略。若外层消息和 cause 指向不同位置，先分别记录它们，
再用同一输入重现，不要凭第一眼的类型猜测根因。

## 四、用最小修改完成验证闭环

### 1. 先重现，再只改一个事实

重新执行原命令，确认问题仍然存在；然后只修改一个与诊断直接相关的事实，例如把错误的 classpath 根
改为 `out`，或把错误变量类型改成与输入一致。一次改很多行会让你失去“哪一项改变了结果”的证据。

### 2. 成功路径和失败路径都要有观察点

成功路径至少有一个明确输出或断言，失败路径至少有一个明确的非零退出状态、异常类型或定位信息。
TeamFlow 示例中的 `TeamFlowFrameLocator` 把异常转换为三行可比较输出，是为了观察定位结果，不是把
异常吞掉当作业务成功。

### 3. 修复后回到同一条命令

修复后再次执行相同的 `javac` 和 `java -cp out` 命令，确认新 class 文件来自当前源码，再检查预期输出。
如果只在 IDEA 里点一次运行却没有在终端复现，仍不能确认问题已经解决。IDEA 项目 SDK 和终端 JDK
也要分别核对；本课不把两者的配置差异展开成 IDE 调试课程。

## 五、常见易错情况

**社区补充：** Stack Overflow 的排错案例指出，相对 classpath 会随当前工作目录变化。这个提醒适用于
JDK 25 与 Java 8 的传统类启动模式；本课在两个版本中从错误目录和错误 `-cp src` 复现“找不到主类”，
再回到包含 `TeamFlowErrorLocator.class` 的 `out` 根目录验证成功。

:::pitfalls
### 只看输出最后一行

**现象：** 只复制 `Exception in thread "main"` 或最后一个 `Caused by`，无法判断自己的代码在哪里。

**原因：** 异常输出从类型和消息开始，后面才是栈帧与因果链；最后一行可能只是退出提示。

**后果：** 可能修改错误的调用者，或把正常的 JDK 帧当成业务根因。

**触发条件：** 在终端滚动后只保留最下方一行文字。

**错误示例：**

```text
Exception in thread "main" java.lang.NumberFormatException: For input string: "task-x"
```

**正确写法：**

```text
异常类型：NumberFormatException
消息：For input string: "task-x"
应用位置：TeamFlowFrameLocator.java:12
应用方法：parseTaskId
```

**验证方式：** 从异常类型开始保存完整输出，并能指出第一条当前项目类的栈帧。

### 把编译诊断当成运行时异常

**现象：** `javac` 已报告 `error`，仍然反复执行 `java -cp out ...` 或打开调试器。

**原因：** 编译阶段没有生成可供本次启动的最新 class 文件。

**后果：** 可能运行旧产物，看到与当前源码无关的输出，或误以为启动器没有反应。

**触发条件：** 忽略 `javac` 的退出状态，直接进入下一条命令。

**错误示例：**

```bash
javac -encoding UTF-8 -d out src/TeamFlowErrorLocator.java
java -cp out TeamFlowErrorLocator
```

**正确写法：**

```bash
javac -encoding UTF-8 -d out src/TeamFlowErrorLocator.java
# 只有 javac 成功并生成新 class 后才启动
java -cp out TeamFlowErrorLocator
```

**验证方式：** 编译失败时确认命令退出非零且不把旧 class 当成本次结果；修复源码后重新编译再启动。

### 在错误的工作目录或 classpath 启动

**现象：** `out/TeamFlowErrorLocator.class` 明明存在，`java` 仍报告找不到或无法加载主类。

**原因：** 相对路径从当前工作目录解析，`-cp src` 或错误目录不是 class 文件的查找根。

**后果：** 启动器尚未进入 `main`，任何业务输出都不会出现。

**触发条件：** 从父目录执行课程命令，或把源码目录当成 classpath。

**错误示例：**

```bash
java -cp src TeamFlowErrorLocator
```

**正确写法：**

```bash
pwd
ls out/TeamFlowErrorLocator.class
java -cp out TeamFlowErrorLocator
```

**验证方式：** 两个版本都从包含目标 class 的 `out` 根目录启动，并看到 `main` 的第一条输出。

### 看到行号就认定这一行是唯一根因

**现象：** 栈帧指向 `Integer.parseInt` 调用行，就直接修改这一行而不检查输入来源。

**原因：** 栈帧说明异常经过的位置；调用者传入的值、文件内容或前一步转换也可能才是根因。

**后果：** 通过改动症状隐藏了坏输入，下一组数据仍会失败。

**触发条件：** 把“第一条应用帧”误解成“唯一错误行”。

**错误示例：**

```java
Integer.parseInt("task-x");
```

**正确写法：**

```java
String rawTaskId = "task-x";
System.out.println("待定位输入：" + rawTaskId);
Integer.parseInt(rawTaskId);
```

**验证方式：** 先记录应用帧和实际输入，再决定是修正输入来源还是改变转换合同。

### 修改源码后仍运行旧 class

**现象：** 源码行号和输出已经变化，控制台仍显示旧消息。

**原因：** 上一次编译产物没有被当前源码覆盖，`java` 只读取输出目录中的 class。

**后果：** 根据旧证据修改新源码，定位方向越来越乱。

**触发条件：** 保存文件后只执行启动命令，没有重新执行编译命令。

**错误示例：**

```bash
java -cp out TeamFlowErrorLocator
```

**正确写法：**

```bash
javac -encoding UTF-8 -d out src/TeamFlowErrorLocator.java
java -cp out TeamFlowErrorLocator
```

**验证方式：** 重新编译后检查 class 修改时间或输出变化与当前源码一致，再记录新的栈帧。

### 把版本相关的消息差异当成新错误

**现象：** JDK 25 与 Java 8 对同一失败输入的异常消息或列号展示不同，就认为其中一个版本运行错误。

**原因：** 工具和运行库可以调整诊断措辞、定位列或格式；异常类型、调用位置和输入合同才是更稳定的
定位事实。

**后果：** 为了匹配一段文字修改本来正确的程序或测试。

**触发条件：** 用完整英文消息做跨版本硬编码比较。

**错误示例：**

```text
只断言完整消息必须逐字等于某个 JDK 版本输出
```

**正确写法：**

```text
分别记录 Java 25 与 Java 8 的类型、输入和应用位置，再对照各自消息上下文
```

**验证方式：** 两个版本使用同一源码和输入，均能定位到同一应用方法；只把措辞差异作为版本信息记录。
:::

## 六、把定位闭环放进 TeamFlow

这一课给 TeamFlow 增加的是一条可重复的“输入 → 失败证据 → 应用位置 → 修复验证”自检路径。最终项目
中的任务状态、用户输入和接口参数都会经过类似定位；本课只用一个无依赖的启动类演示这条路径，不提前
引入 Web、数据库或日志框架。

### 1. JDK 25 完整程序

文件：`src/TeamFlowErrorLocator.java`

```java
/**
 * 用一个可控输入展示 TeamFlow 错误定位的成功和失败路径。
 */
public final class TeamFlowErrorLocator {
    /**
     * 检查任务状态是否符合当前最小合同。
     *
     * @param rawStatus 待检查的任务状态
     * @return 规范化后的任务状态
     * @throws IllegalArgumentException 状态不是 READY 时抛出
     */
    private static String requireReady(String rawStatus) {
        if (!"READY".equals(rawStatus)) {
            throw new IllegalArgumentException("任务状态必须是 READY，实际是：" + rawStatus);
        }
        return rawStatus;
    }

    /**
     * 运行 TeamFlow 状态定位示例。
     *
     * @param args 第一个参数可替换待检查状态，省略时使用 READY
     */
    public static void main(String[] args) {
        String rawStatus = args.length == 0 ? "READY" : args[0];
        String status = requireReady(rawStatus);
        System.out.println("TeamFlow 输入：" + rawStatus);
        System.out.println("TeamFlow 定位：状态检查通过");
        System.out.println("TeamFlow 输出：" + status);
    }
}
```

JDK 25 的 IDEA 配置与运行步骤：

1. 在 Project Structure 中把 Project SDK 设为 JDK 25，并确认运行配置的 JRE 没有单独覆盖为其他版本。
2. 在 `src` 目录创建 `TeamFlowErrorLocator.java`，确认文件名和 `public` 类名完全一致。
3. 运行 `java -version` 与 `javac -version`，再在终端执行 `javac -encoding UTF-8 -d out
   src/TeamFlowErrorLocator.java`。
4. 终端执行 `java -cp out TeamFlowErrorLocator`，或在 IDEA 中以 `TeamFlowErrorLocator` 为 Main class
   运行；两边都应使用 JDK 25。
5. 再用参数 `BROKEN` 运行：`java -cp out TeamFlowErrorLocator BROKEN`。异常栈应指向
   `requireReady` 的源码位置，第一条应用帧就是本课要记录的定位证据。

无参数的预期输出：

```text
TeamFlow 输入：READY
TeamFlow 定位：状态检查通过
TeamFlow 输出：READY
```

使用 `BROKEN` 时，程序会以非零状态结束并输出 `IllegalArgumentException`；消息包含实际输入，栈帧
包含 `TeamFlowErrorLocator.requireReady`。这一次失败是刻意制造的定位练习，不是成功输出。

### 2. Java 8 完整程序

Java 8 使用完整的传统入口和相同的状态检查代码：

```java
/**
 * 用一个可控输入展示 TeamFlow Java 8 的错误定位路径。
 */
public final class TeamFlowErrorLocator {
    /**
     * 检查任务状态是否符合当前最小合同。
     *
     * @param rawStatus 待检查的任务状态
     * @return 规范化后的任务状态
     * @throws IllegalArgumentException 状态不是 READY 时抛出
     */
    private static String requireReady(String rawStatus) {
        if (!"READY".equals(rawStatus)) {
            throw new IllegalArgumentException("任务状态必须是 READY，实际是：" + rawStatus);
        }
        return rawStatus;
    }

    /**
     * 运行 TeamFlow Java 8 状态定位示例。
     *
     * @param args 第一个参数可替换待检查状态，省略时使用 READY
     */
    public static void main(String[] args) {
        String rawStatus = args.length == 0 ? "READY" : args[0];
        String status = requireReady(rawStatus);
        System.out.println("TeamFlow 输入：" + rawStatus);
        System.out.println("TeamFlow 定位：状态检查通过");
        System.out.println("TeamFlow 输出：" + status);
    }
}
```

Java 8 的 IDEA 配置与运行步骤：

1. 在 Project Structure 中选择已经安装的 JDK 8 作为 Project SDK；不要把语言级别下拉框当成 JDK 安装。
2. 运行配置的 JRE 也选择 JDK 8，Main class 填 `TeamFlowErrorLocator`。
3. 终端确认 `java -version` 和 `javac -version` 都显示 1.8，再预先创建 `out` 目录。
4. 执行 `javac -encoding UTF-8 -d out src/TeamFlowErrorLocator.java`，然后执行
   `java -cp out TeamFlowErrorLocator`。
5. 用 `java -cp out TeamFlowErrorLocator BROKEN` 复现异常，记录类型、消息和应用栈帧；不要用
   JDK 25 的 `.java` 源文件模式替代这两步。

Java 8 无参数时的预期输出与 JDK 25 相同：

```text
TeamFlow 输入：READY
TeamFlow 定位：状态检查通过
TeamFlow 输出：READY
```

两版源码相同，是因为本课只使用 Java 8 与 JDK 25 共有的字符串、条件判断、异常和传统 `main`；差异
在于实际 Project SDK、启动器版本和诊断措辞，定位步骤本身不变。

## 七、独立练习与参考实现

### 1. 练习：输出一次可核对的定位报告

:::exercise
### 练习任务

**要求：** 新建 `src/TeamFlowDiagnosticReport.java`，接受可选的状态参数。没有参数时使用 `READY`，
依次输出 `输入：READY`、`分类：运行成功`、`验证：状态符合预期` 三行；参数不是 `READY` 时抛出
`IllegalArgumentException`，消息必须包含实际参数，并且栈帧必须指向你自己的 `check` 方法。只允许
一个类和一个传统 `main` 方法，不使用包、Maven、第三方依赖或 JDK 25 专属语法。

**要求：** JDK 25 和 Java 8 都先用 `javac -encoding UTF-8 -d out` 编译，再用
`java -cp out TeamFlowDiagnosticReport` 运行。无参数时精确得到三行成功输出；用 `BROKEN` 运行时退出
非零，输出异常类型和包含 `TeamFlowDiagnosticReport.check` 的栈帧。修改成功文字后，必须重新编译才可
看到新输出。

**验收：** 无参数时精确得到三行成功输出；用 `BROKEN` 运行时退出非零，输出异常类型和包含
`TeamFlowDiagnosticReport.check` 的栈帧。修改成功文字后，必须重新编译才可看到新输出。
:::

### 2. JDK 25 参考实现

```java
/**
 * 输出 TeamFlow 的最小错误定位报告。
 */
public final class TeamFlowDiagnosticReport {
    /**
     * 检查状态并返回可观察的成功结果。
     *
     * @param rawStatus 待检查状态
     * @return 成功状态文本
     * @throws IllegalArgumentException 状态不是 READY 时抛出
     */
    private static String check(String rawStatus) {
        if (!"READY".equals(rawStatus)) {
            throw new IllegalArgumentException("不支持的状态：" + rawStatus);
        }
        return "状态符合预期";
    }

    /**
     * 运行诊断报告。
     *
     * @param args 第一个参数为待检查状态
     */
    public static void main(String[] args) {
        String status = args.length == 0 ? "READY" : args[0];
        System.out.println("输入：" + status);
        String result = check(status);
        System.out.println("分类：运行成功");
        System.out.println("验证：" + result);
    }
}
```

```bash
javac -encoding UTF-8 -d out src/TeamFlowDiagnosticReport.java
java -cp out TeamFlowDiagnosticReport
```

预期输出：

```text
输入：READY
分类：运行成功
验证：状态符合预期
```

### 3. Java 8 参考实现

```java
/**
 * 输出 TeamFlow Java 8 的最小错误定位报告。
 */
public final class TeamFlowDiagnosticReport {
    /**
     * 检查状态并返回可观察的成功结果。
     *
     * @param rawStatus 待检查状态
     * @return 成功状态文本
     * @throws IllegalArgumentException 状态不是 READY 时抛出
     */
    private static String check(String rawStatus) {
        if (!"READY".equals(rawStatus)) {
            throw new IllegalArgumentException("不支持的状态：" + rawStatus);
        }
        return "状态符合预期";
    }

    /**
     * 运行 Java 8 诊断报告。
     *
     * @param args 第一个参数为待检查状态
     */
    public static void main(String[] args) {
        String status = args.length == 0 ? "READY" : args[0];
        System.out.println("输入：" + status);
        String result = check(status);
        System.out.println("分类：运行成功");
        System.out.println("验证：" + result);
    }
}
```

Java 8 先确认 `out` 已存在，再运行同样的两条命令：

```bash
javac -encoding UTF-8 -d out src/TeamFlowDiagnosticReport.java
java -cp out TeamFlowDiagnosticReport
```

预期输出仍是：

```text
输入：READY
分类：运行成功
验证：状态符合预期
```

## 八、本课小结

错误定位的第一步不是选择更复杂的工具，而是确认失败阶段并保存足够证据：编译诊断看文件和位置，启动
失败看工作目录、class 文件和 classpath，运行时异常看类型、消息、栈帧和 cause，错误结果看预期与实际
值。找到第一条应用栈帧后，只做一个最小修改，再用原命令和原输入验证。

JDK 25 与 Java 8 都能运行本课的传统入口和两步命令；消息格式可能不同，但分类、证据和验证顺序保持
一致。下一课才会把“暂停在某一行并观察执行状态”作为断点调试的独立能力。
