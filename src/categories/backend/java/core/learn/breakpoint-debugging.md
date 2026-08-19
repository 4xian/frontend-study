---
id: backend.java.learn.basics.breakpoint-debugging
type: lesson
title: 断点调试
summary: 在 IntelliJ IDEA 中用行断点暂停 Java 程序，观察变量与调用帧，并用单步操作确认执行路径
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 65
prerequisites:
  - backend.java.learn.basics.error-localization
objectives:
  - 能在 IntelliJ IDEA 的可执行代码行设置行断点，并用 Debug 启动同一个主类。
  - 能解释断点命中后的暂停状态，读取当前变量和调用帧。
  - 能正确使用 Resume、Step Over、Step Into 和 Step Out 观察执行路径。
  - 能区分 Run 与 Debug，并核对 Project SDK、运行配置 JRE 与终端 JDK。
  - 能识别断点未命中的常见原因，并用最小步骤恢复可观察的调试会话。
  - 能在 JDK 25 和 Java 8 中使用传统入口完成相同的 TeamFlow 调试示例。
recap:
  - Run 让程序连续执行，Debug 在断点处暂停并显示当时的程序状态。
  - 行断点必须落在可执行代码行；命中后高亮行尚未执行，可以先看 Variables 和 Frames。
  - Step Over 越过当前调用，Step Into 进入调用的方法，Step Out 执行到当前方法返回处，Resume 继续运行。
  - 断点是否命中取决于实际运行的类、源码与调试信息、运行配置和断点状态，不只取决于红点是否存在。
  - JDK 25 与 Java 8 都能调试传统 main；现代项目和 Java 8 项目应分别选择对应 Project SDK。
related: []
tags:
  - Java
  - IntelliJ IDEA
  - 断点
  - 调试
  - Variables
  - 调用帧
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 使用相同的传统入口和 IDEA 调试流程
verifiedAt: 2026-08-16
sources:
  - id: jetbrains-debug-first-java
    title: 'Tutorial: Debug your first Java application'
    url: https://www.jetbrains.com/help/idea/debugging-your-first-java-application.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: IntelliJ IDEA 2026.1
    claims:
      - 在代码行的 gutter 设置断点后，可以用 Debug 启动程序并在命中处暂停。
      - 命中断点时程序行被高亮，Debug 工具窗口可以观察变量和程序状态。
  - id: jetbrains-breakpoints
    title: Breakpoints | IntelliJ IDEA Documentation
    url: https://www.jetbrains.com/help/idea/using-breakpoints.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: IntelliJ IDEA 2026.2
    claims:
      - 行断点会在到达可执行代码行时暂停程序。
      - 断点可以处于已验证、警告、无效、禁用或静音等状态，断点状态应在调试会话中核对。
  - id: jetbrains-stepping
    title: Step through the program | IntelliJ IDEA Documentation
    url: https://www.jetbrains.com/help/idea/stepping-through-the-program.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: IntelliJ IDEA 2026.2
    claims:
      - Step Over 跳过当前调用，Step Into 进入方法，Step Out 执行到当前方法返回处。
  - id: jetbrains-debug-code
    title: Debug code | IntelliJ IDEA Documentation
    url: https://www.jetbrains.com/help/idea/debugging-code.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: IntelliJ IDEA 2026.2
    claims:
      - 典型调试流程是设置断点、以 Debug 启动、在暂停状态观察程序并控制后续执行。
      - IntelliJ IDEA 的 Java 编译器设置默认生成调试信息。
  - id: javac-25-debug-info
    title: The javac Command - JDK 25
    url: https://docs.oracle.com/en/java/javase/25/docs/specs/man/javac.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: JDK 25
    claims:
      - javac 的 -g 选项会生成包含局部变量在内的全部调试信息，-g:lines、-g:vars 和 -g:source 可以选择类别。
  - id: javac-8-debug-info
    title: javac - Java 8 Compiler
    url: https://docs.oracle.com/javase/8/docs/technotes/tools/windows/javac.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: JDK 8
    claims:
      - Java 8 javac 同样支持生成 source、lines 和 vars 调试信息。
  - id: stackoverflow-breakpoint-source-mismatch
    title: The breakpoint will not currently be hit. The source code is different from the original version.
    url: https://stackoverflow.com/questions/2468852/the-breakpoint-will-not-currently-be-hit-the-source-code-is-different-from-the
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: IntelliJ IDEA 或其他 Java 调试器中的源码与实际运行类不一致场景
    claims:
      - 社区排错案例提醒，实际运行的 class 与编辑器中的源码不一致时，断点可能无法验证或不会命中。
---

# 断点调试

上一课建立了“保留反馈、找到应用位置、用同一命令复现”的定位习惯。本课把观察位置从异常发生之后
提前到程序执行途中：让 IntelliJ IDEA 在一行可执行代码前暂停，先查看当时的变量和调用关系，再决定
下一步执行多少代码。调试器是观察工具，不会自动替你判断业务是否正确。

本课只使用一个普通 Java 类和传统 `main` 入口。不会展开远程调试、并发调试、条件断点、表达式求值、
JDWP 或框架内部调试；先把一次本地单线程调试会话跑通。

## 一、让程序在想看的位置停下

### 1. Run 和 Debug 是两种启动方式

在 IntelliJ IDEA 中点击 Run，程序会尽可能连续执行，直到正常结束或出现未处理异常。点击 Debug 后，
IDEA 会附带调试器启动同一个运行配置；程序通常仍然从 `main` 开始，但到达有效断点时会暂停。

因此，Run 的直接观察点是最终输出，Debug 的直接观察点是“某一行即将执行时的状态”。如果没有设置
断点，Debug 也可能很快运行结束，这不代表调试器失效，只是没有暂停位置。

### 2. 在可执行行的 gutter 设置行断点

行断点表示“执行即将到达这一行时暂停”。在编辑器左侧行号旁的 gutter 单击一次，会出现红色圆点；再
单击一次可移除。应把断点放在赋值、方法调用或输出等可执行行上，例如：

```java
String status = loadStatus();
System.out.println(status);
```

第一行可以观察 `loadStatus()` 返回后的状态，第二行可以在打印前确认变量内容。空行、只包含大括号的
行、注释和只声明但不会执行的区域不是稳定的行断点位置。IDEA 可能把这样的断点标成无效或警告。

### 3. 命中时高亮的行还没有执行

用 Debug 启动后，程序先正常运行。命中断点时，编辑器会高亮当前执行位置，Debug 工具窗口打开，程序
处于 suspended（暂停）状态。高亮行是下一条要执行的语句，不是已经执行完的语句。

例如断点在下面的输出行：

```java
System.out.println("TeamFlow 服务准备就绪");
```

暂停时控制台还看不到这句话；此时按一次 Step Over，语句才会执行，控制台随后出现输出。先看变量再
单步，可以避免把“暂停前的值”和“语句执行后的值”混为一谈。

## 二、读懂暂停时的程序状态

### 1. 在 Variables 中看当前值

暂停后，Debug 工具窗口的 Variables 区域列出当前调用帧可见的局部变量。变量值是这一刻的快照：如果
后续按 Step Over 执行了赋值语句，值可能随之改变；恢复运行后程序继续前进，快照也不再代表旧时刻。

下面的断点适合观察 `ready` 在赋值前后的变化：

```java
boolean ready = false;
ready = true;
System.out.println(ready);
```

在第一行断点停下时，`ready` 还不存在；执行第一行后再停在第二行，Variables 中会看到 `ready=false`。
执行第二行后再停在输出行，值变为 `true`。这正是断点对“执行顺序”的帮助，而不是新的变量语法。

### 2. 在 Frames 中确认当前调用位置

Frames（调用帧）显示当前线程的调用路径。最上方通常是当前暂停的方法，下面是它的调用者。选择某个帧后，
编辑器和 Variables 会切换到该帧的源码上下文。

假设调用顺序是 `main -> buildMessage -> loadStatus`，断点在 `loadStatus` 中命中时，Frames 可以帮助你
确认程序确实经过了这条路径。先看自己的类和方法名，再看输入值；不要把 JDK 内部帧当成必须修改的业务
代码。调用帧只用于本课的观察，不展开完整的异常栈分析。

### 3. 运行配置决定调试的是哪个程序

Debug 按当前 Run/Debug Configuration 启动。检查右上角配置的 Main class、模块和工作目录，确认它们指向
正在编辑的类。若同时有多个同名类或多个模块，编辑器中的红点不一定属于正在运行的配置。

Project SDK 和运行配置的 JRE 也需要分别核对：前者决定项目使用的 Java SDK，后者可能单独覆盖一次运行。
本课完整示例会在 IDEA 中明确选择 JDK 25 或 JDK 8，并在终端用 `java -version`、`javac -version` 对照。

## 三、用单步控制执行速度

### 1. Resume 继续到下一个暂停点

Resume 会让程序从当前高亮行继续运行，直到下一个断点或程序结束。若当前行还没执行，Resume 会先执行
它，再寻找后续暂停点；没有后续断点时，控制台会一次性出现剩余输出。

在只需要确认“这条路径是否会继续到某个断点”时使用 Resume。不要把 Resume 当成删除断点；断点仍会保留
在项目中，下一次 Debug 仍可能命中。

### 2. Step Over 留在当前方法中

Step Over 执行当前高亮行，然后停在当前方法的下一条可执行行。若当前行调用了另一个方法，调试器会执行
该调用但不进入被调用方法的每一行。

```java
String status = loadStatus(); // Step Over 会执行 loadStatus，但不进入它
System.out.println(status);   // 然后停在这里
```

当你只想看本方法的输入和输出变化时，Step Over 最合适。被调用方法内部若有断点，调试器仍可能在那个
断点暂停；这不是 Step Over 变成了 Step Into。

### 3. Step Into 进入被调用的方法

Step Into 会进入当前行调用的方法，暂停到被调用方法内部的第一条可执行行。它适合确认“传入了什么值、
方法内部先做了什么”。对于 `System.out.println` 这类库调用，初学者通常不需要进入实现；在自己的方法
之间使用 Step Into 即可。

### 4. Step Out 执行到当前方法返回处

如果已经进入 `loadStatus`，但发现内部不是当前问题，Step Out 会执行剩余代码并回到调用者，通常停在调用
行之后的下一条可执行行。它不会撤销已经执行的副作用，所以观察前要知道该方法是否会修改数据。

四个动作可以这样记：Step Over 看“调用完成后下一行”，Step Into 看“调用里面怎么走”，Step Out 看“从
当前方法回到调用者”，Resume 看“继续跑到下一个已设置的暂停点”。

## 四、保证断点能获得可靠信息

### 1. IDEA 项目默认生成调试信息

IntelliJ IDEA 的 Java Compiler 设置默认会生成调试信息。可以打开 Settings（macOS 为 IntelliJ IDEA >
Settings，Windows/Linux 为 File > Settings），进入 Build, Execution, Deployment > Compiler > Java
Compiler，确认 Generate debugging info 处于开启状态。

调试信息把 class 中的行号、源文件和局部变量等信息对应回源码。关闭它或使用不含这些信息的产物时，
断点可能无法验证，Variables 也可能缺少局部变量。普通 IDEA 项目保持默认设置即可，不需要为本课改变全局
编译策略。

### 2. 终端编译时用 `javac -g` 保留变量信息

如果不用 IDEA 而在终端编译一个用于调试的示例，可使用：

```bash
javac -g -d out src/TeamFlowApplication.java
```

`-g` 表示生成全部调试信息，包括局部变量；也可以使用 `-g:lines,vars,source` 只指定行号、变量和源文件。
这里的命令只用于确保调试器能看到足够的映射，不展开上一课的编译流程。Java 8 的 `javac` 也支持这些
调试信息选项。

### 3. JDK 25 与 Java 8 的调试差异

两版都支持传统入口：

```java
public static void main(String[] args)
```

本课完整程序故意使用这套共同写法，因此断点位置、Variables、Frames 和四种单步操作可以保持一致。真实
差异在项目配置：JDK 25 项目选择 JDK 25，Java 8 项目选择已安装的 JDK 8；运行配置的 JRE 和终端命令也
应分别对应同一版本。IDEA 界面文案可能随版本变化，操作名称的含义不变。

## 五、断点不命中时先核对事实

:::pitfalls
### 已安装 JDK，但调试使用了另一套 JDK

**现象：** 终端显示 JDK 25，IDEA 的 Project SDK 或运行配置 JRE 却是 JDK 8，断点位置或变量显示与预期不同。

**原因：** 终端和 IDEA 是两个独立的 Java 使用者；终端的 `PATH` 不会自动改写 IDEA 项目的 SDK。

**后果：** 可能运行旧 class、使用不同编译器选项，或把版本差异误认为断点问题。

**触发条件：** 终端、Project SDK 或运行配置 JRE 中至少有一处没有按同一版本核对。

**错误示例：**

```text
只执行一次 java -version，就认为 IDEA 一定使用相同版本。
```

**正确写法：**

```text
在 Project Structure 查看 Project SDK，在 Run/Debug Configuration 查看 JRE，再分别运行终端的
java -version 和 javac -version。
```

**验证方式：** 三处版本都明确记录；以 Debug 启动后，在 Variables 中能看到当前示例变量，并命中预期行。

### 断点放在不可执行的行

**现象：** gutter 有红点，但 Debug 后断点显示无效或程序直接结束。

**原因：** 空行、注释、单独的大括号或不会产生执行位置的声明不能稳定暂停。

**后果：** 把合法的“无可暂停位置”误判成 IDEA 或 JDK 故障。

**触发条件：** 断点落在注释、空行、大括号或没有实际执行位置的声明上。

**错误示例：**

```text
在注释或方法结尾的大括号旁设置断点，然后只点击 Run。
```

**正确写法：**

```text
把断点移到赋值、方法调用或输出等可执行语句，并用 Debug 启动。
```

**验证方式：** 断点在 Debug 会话中变为已验证状态，编辑器高亮该语句，Debug 工具窗口出现暂停状态。

### 使用 Run 或错误的运行配置

**现象：** 红点存在，但程序输出后立即结束，没有任何暂停。

**原因：** 点击了 Run 而不是 Debug，或当前配置的 Main class 是另一个类。

**后果：** 实际没有让调试器附着到你设置断点的程序。

**触发条件：** 启动时选择了 Run，或右上角运行配置的 Main class 不是当前编辑的类。

**错误示例：**

```text
看到输出正确就认为断点已经验证。
```

**正确写法：**

```text
选择显示目标类的配置，点击 Debug 图标，并确认顶部显示的 Main class。
```

**验证方式：** 暂停时编辑器高亮目标类的断点行，Frames 顶部显示该类的 `main` 或目标方法。

### 源码和实际 class 不一致

**现象：** 断点图标没有验证标记，或 IDEA 提示源代码与原始版本不同；断点永远不命中。

**原因：** 调试器加载的是旧输出目录、另一个模块的 class，或源码保存后没有重新构建当前配置使用的产物。

**后果：** 你看到的行号和实际执行的字节码不对应，Variables 与源码也会让人误判。

**触发条件：** 保存源码后没有重建当前配置使用的输出，或配置指向了另一个模块的 class。

**错误示例：**

```text
只反复移动红点，不检查运行配置的模块和构建结果。
```

**正确写法：**

```text
保存源码，确认配置的模块和输出目录，执行 Build > Rebuild Project，再重新 Debug。
```

**验证方式：** 断点恢复为已验证状态，暂停位置与当前源码行一致；这是社区案例中最值得先检查的事实。

### 断点被禁用、静音或没有暂停策略

**现象：** 断点仍显示在编辑器中，但 Debug 会话跳过它。

**原因：** 断点属性被取消 Enabled，或在 Debug 工具窗口中启用了 Mute Breakpoints；也可能配置为命中时不暂停。

**后果：** 误以为执行路径没有经过该行。

**触发条件：** 断点属性被禁用、静音，或 Suspend 没有设置为暂停。

**错误示例：**

```text
继续添加更多红点，导致真正的暂停位置更难判断。
```

**正确写法：**

```text
打开 Run > View Breakpoints，确认 Enabled；Debug 工具栏确认 Mute Breakpoints 未开启，并检查 Suspend 设置为暂停。
```

**验证方式：** 保留一个简单的行断点重新 Debug，确认程序确实停下后再恢复其他断点。

### 入口方法不适合 Java 8

**现象：** JDK 25 可以运行的简洁启动形式，在 Java 8 项目中无法创建或无法启动；因此没有机会命中断点。

**原因：** Java 8 只支持传统的 `public static void main(String[] args)` 入口。

**后果：** 把入口兼容问题误认为调试器无法连接。

**触发条件：** 在 Java 8 项目里使用了不属于传统入口的启动形式。

**错误示例：**

```text
在 Java 8 配置中复制只适用于较新 JDK 的简洁入口。
```

**正确写法：**

```text
Java 8 示例使用完整传统入口，并把 Project SDK、运行配置 JRE 和终端 java 都切换到 JDK 8。
```

**验证方式：** 先用 Run 看到正常输出，再设置行断点用 Debug 重新运行；两次都能进入 `main`。
:::

## 六、在 TeamFlow 首程序中完成一次调试

下面的程序模拟 TeamFlow 启动前检查：先读取状态，再把状态转成用户能看到的消息。我们在
`buildReadyMessage` 的返回语句设置断点，用 Step Into 进入方法、Variables 查看 `status`，再用 Step Out
回到 `main`。程序没有业务框架，输出可以直接和暂停位置对应。

### 1. JDK 25 完整程序

文件名：`TeamFlowApplication.java`。在 IDEA 的 `src` 目录创建这个类，所有方法都使用完整中文 Javadoc：

```java
/**
 * TeamFlow 的第一个可调试启动类。
 */
public final class TeamFlowApplication {
    /**
     * 读取本次启动使用的固定状态。
     *
     * @return 待检查的任务状态
     */
    private static String loadStatus() {
        return "READY";
    }

    /**
     * 根据状态构造启动提示。
     *
     * @param status 当前任务状态
     * @return TeamFlow 启动提示
     */
    private static String buildReadyMessage(String status) {
        if (!"READY".equals(status)) {
            return "TeamFlow 尚未准备好";
        }
        return "TeamFlow 服务准备就绪";
    }

    /**
     * 启动 TeamFlow 首个 Java 程序。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        String status = loadStatus();
        String message = buildReadyMessage(status);
        System.out.println("TeamFlow 状态：" + status);
        System.out.println(message);
    }
}
```

在 JDK 25 的 IDEA 中配置和运行：

1. 打开 Project Structure，将 Project SDK 选择为 JDK 25；在 Run/Debug Configuration 中选择 `Application`，
   Main class 填 `TeamFlowApplication`，JRE 选择 Project SDK。
2. 在 `return "TeamFlow 服务准备就绪";` 这一行左侧 gutter 单击，看到红点。
3. 点击 Debug（小昆虫图标），不要点击旁边的 Run。程序会在返回语句处暂停；此时 Variables 中能看到
   `status` 为 `READY`，Frames 顶部显示 `buildReadyMessage`。
4. 点击 Step Out，回到 `main` 的下一行；再点击 Step Over 执行第一条输出，最后点击 Resume 让程序结束。

预期控制台输出：

```text
TeamFlow 状态：READY
TeamFlow 服务准备就绪
```

暂停时还看不到第二行输出，因为输出语句尚未执行。Step Out 只改变观察位置，不会改变 `message` 的值；
Resume 后两行才完整出现。

### 2. Java 8 完整程序

Java 8 版本仍然完整写出传统入口，不能只写“同上”：

```java
/**
 * TeamFlow 的 Java 8 可调试启动类。
 */
public final class TeamFlowApplication {
    /**
     * 读取本次启动使用的固定状态。
     *
     * @return 待检查的任务状态
     */
    private static String loadStatus() {
        return "READY";
    }

    /**
     * 根据状态构造启动提示。
     *
     * @param status 当前任务状态
     * @return TeamFlow 启动提示
     */
    private static String buildReadyMessage(String status) {
        if (!"READY".equals(status)) {
            return "TeamFlow 尚未准备好";
        }
        return "TeamFlow 服务准备就绪";
    }

    /**
     * 启动 TeamFlow Java 8 首个程序。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        String status = loadStatus();
        String message = buildReadyMessage(status);
        System.out.println("TeamFlow 状态：" + status);
        System.out.println(message);
    }
}
```

在 Java 8 的 IDEA 中配置和运行：

1. 在 Project Structure 中把 Project SDK 改为已经安装的 JDK 8；运行配置的 JRE 也选 JDK 8，Main class
   填 `TeamFlowApplication`。
2. 在相同的 `return "TeamFlow 服务准备就绪";` 行设置断点，然后使用 Debug 启动。
3. 暂停后先在 Variables 检查 `status=READY`，在 Frames 确认当前方法是 `buildReadyMessage`。
4. 依次使用 Step Out、Step Over 和 Resume，确认控制台出现完整输出。

预期输出与 JDK 25 版本相同：

```text
TeamFlow 状态：READY
TeamFlow 服务准备就绪
```

两份代码相同，是因为本课只用两版共有的字符串、条件判断和传统入口。实际操作的差异只有 Project SDK、
运行配置 JRE、终端版本以及 IDEA 可能显示的诊断文字。

### 3. 用终端核对 IDEA 调试的版本

在 IDEA 内运行程序后，打开终端分别执行：

```bash
java -version
javac -version
```

JDK 25 配置应显示 25 开头的版本，Java 8 配置应显示 1.8 开头的版本。终端版本只能说明这两个命令找到的
JDK；再回到 Project Structure 和运行配置核对 IDEA 使用的 SDK，三处都记录后，才知道调试器与命令行是否
在同一版本上。

## 七、独立练习与参考实现

### 1. 练习：追踪一次状态消息的构造

:::exercise
### 练习任务

**要求：** 创建 `TeamFlowDebugPractice` 类并保留传统 `main` 入口；让 `loadStatus` 返回 `READY`，让
`buildMessage` 在状态为 `READY` 时返回 `TeamFlow 检查通过`，其他状态返回 `TeamFlow 需要检查`。在
`buildMessage` 的返回语句设置断点，用 Debug 启动，在 Variables 中确认 `status`，并至少使用一次
Step Into、Step Over、Step Out 和 Resume。不能使用 Spring、Maven 或第三方库。

**验收：** JDK 25 和 Java 8 都能以传统入口运行，控制台按顺序输出 `状态：READY` 和
`消息：TeamFlow 检查通过`；暂停时 Frames 显示 `buildMessage`，Variables 能看到 `status=READY`。
:::

### 2. JDK 25 参考实现

```java
/**
 * TeamFlow 断点调试练习的 JDK 25 参考实现。
 */
public final class TeamFlowDebugPractice {
    /**
     * 返回待检查的状态。
     *
     * @return READY 状态
     */
    private static String loadStatus() {
        return "READY";
    }

    /**
     * 根据状态构造练习消息。
     *
     * @param status 待检查状态
     * @return 检查结果消息
     */
    private static String buildMessage(String status) {
        if ("READY".equals(status)) {
            return "TeamFlow 检查通过";
        }
        return "TeamFlow 需要检查";
    }

    /**
     * 运行断点调试练习。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        String status = loadStatus();
        String message = buildMessage(status);
        System.out.println("状态：" + status);
        System.out.println("消息：" + message);
    }
}
```

JDK 25 的 IDEA 步骤：Project SDK 和运行配置 JRE 选择 JDK 25；在 `buildMessage` 的两个返回语句之一
设置行断点；用 Debug 启动后在 Variables 确认 `status`，用 Step Over 观察条件执行，再用 Step Out 回到
`main`，最后 Resume。输出应为：

```text
状态：READY
消息：TeamFlow 检查通过
```

### 3. Java 8 参考实现

```java
/**
 * TeamFlow 断点调试练习的 Java 8 参考实现。
 */
public final class TeamFlowDebugPractice {
    /**
     * 返回待检查的状态。
     *
     * @return READY 状态
     */
    private static String loadStatus() {
        return "READY";
    }

    /**
     * 根据状态构造练习消息。
     *
     * @param status 待检查状态
     * @return 检查结果消息
     */
    private static String buildMessage(String status) {
        if ("READY".equals(status)) {
            return "TeamFlow 检查通过";
        }
        return "TeamFlow 需要检查";
    }

    /**
     * 运行 Java 8 断点调试练习。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        String status = loadStatus();
        String message = buildMessage(status);
        System.out.println("状态：" + status);
        System.out.println("消息：" + message);
    }
}
```

Java 8 的 IDEA 步骤：Project SDK、运行配置 JRE 和终端 JDK 都选择 Java 8；使用同一个断点和传统 Debug
流程，完整输出仍为：

```text
状态：READY
消息：TeamFlow 检查通过
```

本练习没有版本专属语法，因此 Java 8 不需要修改方法体；必须修改的是项目选择的 JDK，不能只把语言级别
下拉框改成 8 而继续使用 JDK 25。

## 八、本课小结

断点调试的最短路径是：选择正确的运行配置，在可执行行设置断点，用 Debug 启动，暂停后先看 Variables
和 Frames，再用 Step Over、Step Into、Step Out 或 Resume 控制执行。断点没有命中时，先核对 Debug 而
不是 Run、断点是否有效、源码与实际 class 是否一致、调试信息是否存在，以及 Project SDK、运行配置 JRE
和终端 JDK 是否指向同一版本。JDK 25 和 Java 8 都可以沿用传统 `main` 完成这套观察流程。
