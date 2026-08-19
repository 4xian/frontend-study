---
id: backend.java.learn.basics.compilation-and-execution
type: lesson
title: 编译与运行
summary: 用 javac 把 TeamFlow 源码编译到独立目录，再由 java 从正确的 classpath 启动主类
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 60
prerequisites:
  - backend.java.learn.basics.development-environment-and-runtime
objectives:
  - 能区分 Java 源文件、class 文件、javac 编译器和 java 启动器的职责。
  - 能从正确的工作目录把源码编译到独立输出目录，并观察生成结果。
  - 能使用 classpath 根目录和主类名启动程序，而不是把 class 文件路径交给 java。
  - 能通过重新编译和重新运行确认控制台对应当前源码。
  - 能说明 JDK 25 源文件模式、传统两步流程和 Java 8 兼容边界。
recap:
  - javac 读取 .java 源文件并生成 class 文件，-d 用于指定独立输出目录。
  - java 启动已编译程序时接收主类名，并通过 -cp 指定查找 class 文件的根目录。
  - 相对路径从当前工作目录解析，改变目录会改变 src 和 out 的实际指向。
  - 修改源码后必须重新编译，旧 class 文件不会自动跟随源码变化。
  - JDK 25 支持直接启动单个源文件，Java 8 不支持；双版本主线使用显式编译和运行两步。
related: []
tags:
  - Java
  - javac
  - java launcher
  - class file
  - classpath
  - 编译
  - 运行
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 使用传统 javac 与 java 两步流程
verifiedAt: 2026-08-16
sources:
  - id: oracle-javac-25
    title: The javac Command - JDK 25
    url: https://docs.oracle.com/en/java/javase/25/docs/specs/man/javac.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: JDK 25
    claims:
      - javac 读取 Java 源文件并生成 class 文件
      - -d 指定 class 输出目录，未指定时默认写到源文件所在目录
      - --release 可限制面向较早 Java 平台的语言、class 格式和公开 API
  - id: oracle-java-25
    title: The java Command - JDK 25
    url: https://docs.oracle.com/en/java/javase/25/docs/specs/man/java.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: JDK 25
    claims:
      - java 可以按主类名启动已编译程序
      - JDK 25 支持把单个 .java 文件作为源文件模式启动
      - 源文件模式在内存中编译，不等同于把 class 文件保留到课程输出目录
  - id: jls-25-execution
    title: Java Language Specification 25 Chapter 12 Execution
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - Java 程序通常按初始类和 main 入口启动
      - 已编译类的二进制表示会在执行前被加载
  - id: jvms-25-class-file-format
    title: Java Virtual Machine Specification 25 Chapter 4 The class File Format
    url: https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-4.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - Java SE 25 JVM 支持到 major version 69 的 class 文件
      - class 文件是具有明确版本的二进制格式
  - id: oracle-javac-8
    title: javac - Java 8 Compiler
    url: https://docs.oracle.com/javase/8/docs/technotes/tools/windows/javac.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: JDK 8
    claims:
      - Java 8 javac 同样把源码编译为 class 文件并支持 -d 输出目录
      - Java 8 使用 -d 时要求目标目录预先存在
  - id: oracle-java-8
    title: java - Java 8 Launcher
    url: https://docs.oracle.com/javase/8/docs/technotes/tools/windows/java.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java 8
    claims:
      - Java 8 使用 java 加主类名启动应用
      - Java 8 启动器不提供单文件源文件模式
  - id: jls-8-execution
    title: Java Language Specification 8 Chapter 12 Execution
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-12.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 通常按完全限定类名指定初始类并调用传统 main 入口
  - id: jvms-8-class-file-format
    title: Java Virtual Machine Specification 8 Chapter 4 The class File Format
    url: https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - JDK 8 对应的 class 文件 major version 为 52
      - Java 8 运行时不能加载只被更新 JVM 版本支持的 class 文件
  - id: openjdk-jep-330
    title: JEP 330 Launch Single-File Source-Code Programs
    url: https://openjdk.org/jeps/330
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: JDK 11 及以上
    claims:
      - 单文件源代码启动模式从 JDK 11 引入
      - java File.java 会在内存中编译并启动源文件中的主类
  - id: stackoverflow-main-class-classpath
    title: What does Could not find or load main class mean?
    url: https://stackoverflow.com/questions/18093928/what-does-could-not-find-or-load-main-class-mean
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 命令行常见问题
    claims:
      - 初学者常把 .java 扩展名交给传统类启动命令
      - 相对 classpath 会随当前工作目录变化，classpath 应指向类层级的根目录
---

# 编译与运行

上一课通过 IDEA 运行了 TeamFlow 的第一个程序。这一次不依赖运行按钮，而是把背后的两个动作分开：
先让 `javac` 读取源码并生成 class 文件，再让 `java` 从输出目录找到主类并执行。分开之后，你能亲眼
确认每一步的输入、产物和结果。

本课只处理一个没有包名、没有依赖的 Java 文件。包、Maven、错误分类和调试工具都有各自的后续课程，
这里先建立最短、可重复的编译运行路径。

## 一、看清源码、产物和工具

### 1. 四个对象分别是什么

一次最小的 Java 编译运行包含四个对象：

| 对象 | 本课示例 | 职责 |
| --- | --- | --- |
| Java 源文件 | `src/TeamFlowCompileCheck.java` | 保存人可以阅读和编辑的 Java 代码 |
| `javac` 编译器 | `javac -d out ...` | 检查源码并生成 class 文件 |
| class 文件 | `out/TeamFlowCompileCheck.class` | 保存 JVM 可以加载的二进制类表示 |
| `java` 启动器 | `java -cp out TeamFlowCompileCheck` | 找到主类并从 `main` 开始执行 |

`javac` 和 `java` 都来自 JDK，但不是同一个命令。编译成功只说明 class 文件已经生成；控制台出现
TeamFlow 文本，才说明启动器找到了主类并执行了程序。

本课只说明 class 文件是编译产物，不展开它内部的指令、常量池或类加载阶段。现在只需要确认它存在，
并知道它不能当作普通可执行文件直接双击或输入路径运行。

### 2. 当前工作目录决定相对路径

下面所有命令都假定终端当前位于 `teamflow-compile` 目录：

```text
teamflow-compile/
├── src/
│   └── TeamFlowCompileCheck.java
└── out/
```

macOS/Linux 使用 `pwd`，Windows PowerShell 使用 `Get-Location` 查看当前位置。列出文件时可以分别使用
`ls src` 或 `Get-ChildItem src`。只有观察到 `TeamFlowCompileCheck.java`，后面的相对路径才指向预期
文件。

如果终端位于父目录，`src/TeamFlowCompileCheck.java` 会指向另一个位置或根本不存在。命令文字没变，
相对路径的实际目标却已经改变，因此每次重试前先确认当前位置比反复改源码更可靠。

## 二、用 JDK 25 完成显式编译

### 1. 准备最小目录和源码

在练习目录中创建 `src` 和 `out` 两个目录。Windows PowerShell 可以执行：

```powershell
New-Item -ItemType Directory -Force src, out
```

macOS/Linux 可以执行：

```bash
mkdir -p src out
```

把下面的完整文件保存为 `src/TeamFlowCompileCheck.java`：

```java
/**
 * 检查 TeamFlow 源码能否经过显式编译后启动。
 */
public final class TeamFlowCompileCheck {
    /**
     * 输出本次编译运行的可见结果。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        System.out.println("TeamFlow 编译完成");
        System.out.println("TeamFlow 程序开始运行");
    }
}
```

源文件名和 `public` 类名必须完全相同。程序仍使用传统入口，因此 JDK 25 和 Java 8 都可以编译这份
源码。

### 2. 把 class 文件写入独立输出目录

确认 `java -version` 和 `javac -version` 都显示主版本 25，然后在 `teamflow-compile` 目录执行：

```bash
javac -encoding UTF-8 -d out src/TeamFlowCompileCheck.java
```

这条命令没有输出时，通常表示编译成功。不要只根据“没有报错”下结论，还要查看产物：

```bash
ls out
```

Windows PowerShell 使用：

```powershell
Get-ChildItem out
```

预期看到：

```text
TeamFlowCompileCheck.class
```

这个结果来自 `-d out`：`javac` 把生成的 class 文件写到 `out`，而不是混在 `src` 源码目录里。独立
输出目录让“可以编辑的源码”和“可以加载的编译产物”保持清楚边界。

### 3. 用主类名启动程序

继续在同一个工作目录执行：

```bash
java -cp out TeamFlowCompileCheck
```

预期输出：

```text
TeamFlow 编译完成
TeamFlow 程序开始运行
```

`-cp out` 告诉启动器从 `out` 这个根目录查找 class 文件；`TeamFlowCompileCheck` 是主类名，不是
文件路径，因此没有 `.java` 或 `.class` 扩展名。启动器找到该类后，从传统 `main` 入口开始执行，
两条 `println` 依次形成两行输出。

### 4. 修改源码后重新建立结果

把第二行源码改成：

```java
System.out.println("TeamFlow 程序重新运行");
```

保存后如果直接执行 `java -cp out TeamFlowCompileCheck`，仍可能看到旧文字，因为 `java` 读取的是
上一次生成的 class 文件。必须重新执行编译命令，再执行启动命令：

```bash
javac -encoding UTF-8 -d out src/TeamFlowCompileCheck.java
java -cp out TeamFlowCompileCheck
```

预期第二行变为：

```text
TeamFlow 程序重新运行
```

这次变化证明当前 class 文件来自刚保存的源码，也建立了本课最重要的反馈环：编辑源码、重新编译、
重新运行、观察新结果。

## 三、读懂两条命令

### 1. `javac` 接收源文件路径

编译命令可以按四段阅读：

```text
javac | -encoding UTF-8 | -d out | src/TeamFlowCompileCheck.java
```

- `javac`：调用 JDK 中的 Java 编译器。
- `-encoding UTF-8`：明确告诉编译器源码采用 UTF-8，避免中文字符串随系统默认编码变化。
- `-d out`：把 class 文件写到独立的 `out` 目录。
- `src/TeamFlowCompileCheck.java`：本次要读取的源文件路径。

JDK 25 的 `javac` 可以在需要时创建 `out` 目录，Java 8 的官方工具说明要求 `-d` 目标目录已经存在。
为了让两个版本操作一致，本课始终先创建 `out`，再执行同一条编译命令。

### 2. `java` 接收 classpath 和主类名

启动命令分成三段：

```text
java | -cp out | TeamFlowCompileCheck
```

- `java`：启动 Java 应用。
- `-cp out`：把 `out` 设为本次用户 classpath 的根目录。
- `TeamFlowCompileCheck`：指定要启动的主类。

当前示例没有包名，所以主类名只有一段。classpath 指向“能够从这里继续找到类”的根目录，而不是
指向 class 文件本身。把 `out/TeamFlowCompileCheck.class` 填在 `-cp` 后面，启动器就失去了可用于查找
类的根目录。

### 3. IDE 运行和终端运行的关系

IDEA 的运行按钮也需要先得到可加载的编译结果，再用运行配置中的 JDK、classpath 和 Main class 启动。
IDEA 会替你组织这些命令，因此日常项目不必手写每一项；终端两步流程的价值是让关键输入可以直接观察。

在本课中，终端成功和 IDEA 成功是两条独立证据：

1. 终端证据是 `out/TeamFlowCompileCheck.class` 存在，且显式启动命令得到两行输出。
2. IDEA 证据是 Project SDK、Application JRE 和 Main class 正确，Run 窗口得到相同输出。

若两边结果不同，先分别核对 JDK、输出目录和主类，不要假定 IDEA 一定复用了外部终端的设置。

## 四、JDK 25 与 Java 8 的运行差异

### 1. 传统两步流程两个版本都支持

JDK 25 和 Java 8 都能执行下面两条命令：

```bash
javac -encoding UTF-8 -d out src/TeamFlowCompileCheck.java
java -cp out TeamFlowCompileCheck
```

前提是当前终端确实使用对应版本的 `javac` 和 `java`，`out` 目录已经创建，源码使用两个版本共有的
传统语法。本课现代版和兼容版都把这套流程作为可见、可比较的主线。

### 2. JDK 25 支持单文件源代码启动

JDK 25 还可以直接执行：

```bash
java src/TeamFlowCompileCheck.java
```

此时 `java` 进入单文件源代码模式，在内存中编译源文件并启动其中的主类。它适合快速运行单文件，但
不会替代本课的 `out` 产物观察，也会把编译和启动折叠成一步。

Java 8 没有这个模式。在 Java 8 中执行同样命令时，启动器不会把 `.java` 文件当作待编译源码。本课
为了让两个版本共享一条学习路径，不把源文件模式作为主操作，只把它作为真实版本差异说明。

### 3. Java 8 的完整程序和操作

Java 8 使用的完整源码如下，不能省略为“与现代版相同”：

```java
/**
 * 检查 TeamFlow Java 8 源码能否经过显式编译后启动。
 */
public final class TeamFlowCompileCheck {
    /**
     * 输出 Java 8 编译运行的可见结果。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        System.out.println("TeamFlow 编译完成");
        System.out.println("TeamFlow 程序开始运行");
    }
}
```

先确认两个版本命令都显示 `1.8.0`，再创建输出目录并运行：

```bash
java -version
javac -version
mkdir -p out
javac -encoding UTF-8 -d out src/TeamFlowCompileCheck.java
java -cp out TeamFlowCompileCheck
```

Windows PowerShell 的目录创建命令改为：

```powershell
New-Item -ItemType Directory -Force out
```

预期输出与 JDK 25 完全一致：

```text
TeamFlow 编译完成
TeamFlow 程序开始运行
```

### 4. class 文件也有版本边界

JDK 25 默认生成的 class 文件使用 major version 69；Java 8 对应 major version 52。较旧的 Java 8
运行时不能加载只受新版本 JVM 支持的 class 文件，因此“源码使用传统 `main`”并不自动保证“任意版本
编译出的 class 都能跨版本运行”。

需要面向 Java 8 交付时，最直接的学习方式仍是使用真实 JDK 8 编译并运行。如果暂时只有 JDK 25，
`javac --release 8` 可以限制面向 Java 8 的语言、class 格式和公开 API；但这只是一项编译约束，最终
产物仍应在真实 Java 8 环境复跑。本课不展开更复杂的交叉编译配置。

## 五、常见易错情况

下面的问题集中在本课的目录、产物和启动参数。这里只恢复编译运行路径，不建立完整错误分类体系。

**社区补充：** Stack Overflow 的真实排错案例显示，相对 classpath 会随当前工作目录变化。这个结论
适用于 JDK 25 和 Java 8 的传统类启动模式；本课已在两个版本中复现 `-cp src` 无法找到主类，并确认
改为实际产物根目录 `-cp out` 后可以启动。

:::pitfalls
### 在错误的工作目录执行编译

**现象：** `javac` 提示找不到 `src/TeamFlowCompileCheck.java`。

**原因：** 命令中的相对路径从当前工作目录解析，终端并不在 `teamflow-compile`。

**后果：** 编译器没有读到目标源码，也不会生成新的 class 文件。

**触发条件：** 不检查当前位置，连续重复同一条命令。

**错误示例：**

```bash
javac -encoding UTF-8 -d out src/TeamFlowCompileCheck.java
```

**正确写法：**

```bash
pwd
ls src
javac -encoding UTF-8 -d out src/TeamFlowCompileCheck.java
```

**验证方式：** `src` 中能看到源码，编译后 `out` 中出现新的 class 文件。

### 忘记 `-d out`，产物混进源码目录

**现象：** 编译成功，但 `out` 为空，`src` 中多出 `TeamFlowCompileCheck.class`。

**原因：** `javac` 在没有 `-d` 时默认把 class 文件放在对应源文件目录。

**后果：** 源码和生成物混在一起，后续 `-cp out` 也找不到这次产物。

**触发条件：** 编译时省略 `-d out`，又继续使用 `out` 作为启动根目录。

**错误示例：**

```bash
javac src/TeamFlowCompileCheck.java
```

**正确写法：**

```bash
javac -encoding UTF-8 -d out src/TeamFlowCompileCheck.java
```

**验证方式：** `src` 只保留 `.java`，`out` 中存在 `.class`，启动命令使用 `-cp out`。

### 把 class 文件路径交给 `java`

**现象：** 启动器报告找不到主类，程序没有输出 TeamFlow 文本。

**原因：** 传统类启动模式需要的是主类名，不能把 `.class` 文件路径当作主类名。

**后果：** 已经成功生成的 class 文件仍无法被正确启动。

**触发条件：** 把终端中看到的 class 文件路径直接复制到 `java` 命令后。

**错误示例：**

```bash
java out/TeamFlowCompileCheck.class
```

**正确写法：**

```bash
java -cp out TeamFlowCompileCheck
```

**验证方式：** 命令中 classpath 是目录，最后一项是没有扩展名的类名，控制台出现两行预期输出。

### 把源码扩展名用于传统启动命令

**现象：** 学习者想运行已编译结果，却输入 `java TeamFlowCompileCheck.java`；在 Java 8 中无法启动，
在 JDK 25 中又可能意外进入另一种源文件模式。

**原因：** `.java` 表示源文件；传统类启动命令需要主类名。JDK 25 额外支持源文件模式，Java 8 没有。

**后果：** 两个版本执行的不是同一条路径，也无法证明 `out` 中的 class 文件可以运行。

**触发条件：** 想验证 `out` 产物，却把 `.java` 文件路径交给两个版本的 `java` 命令。

**错误示例：**

```bash
java src/TeamFlowCompileCheck.java
```

**正确写法：**

```bash
javac -encoding UTF-8 -d out src/TeamFlowCompileCheck.java
java -cp out TeamFlowCompileCheck
```

**验证方式：** 两个版本都明确生成 `out/TeamFlowCompileCheck.class`，再从这个输出根目录启动主类。

### classpath 指向了错误目录

**现象：** class 文件明明存在，`java` 仍提示找不到或无法加载主类。

**原因：** `-cp` 指向了 `src`、某个 class 文件，或一个不包含目标类层级的目录。

**后果：** 启动器从错误根目录查找，无法定位已经编译的主类。

**触发条件：** 编译产物位于 `out`，但启动命令仍把 `src` 当作 classpath。

**错误示例：**

```bash
java -cp src TeamFlowCompileCheck
```

**正确写法：**

```bash
java -cp out TeamFlowCompileCheck
```

**验证方式：** 从当前工作目录解析后，`out/TeamFlowCompileCheck.class` 确实存在，命令成功输出两行文本。

### 修改源码后忘记重新编译

**现象：** 源码中的文字已经变化，运行结果仍显示旧文字。

**原因：** `java` 启动的是旧 class 文件，保存 `.java` 不会自动改写终端输出目录中的产物。

**后果：** 观察结果与当前源码不一致，容易误判为保存失败或运行了错误程序。

**触发条件：** 修改源码后只重复启动命令，没有重新执行 `javac`。

**错误示例：**

```bash
java -cp out TeamFlowCompileCheck
```

**正确写法：**

```bash
javac -encoding UTF-8 -d out src/TeamFlowCompileCheck.java
java -cp out TeamFlowCompileCheck
```

**验证方式：** 控制台出现刚写入源码的新文字，class 文件更新时间也晚于修改前产物。

### 用 Java 8 运行 JDK 25 默认产物

**现象：** JDK 25 编译成功，把同一个 class 文件交给 Java 8 时出现 `UnsupportedClassVersionError`。

**原因：** JDK 25 默认 class 版本高于 Java 8 能识别的版本。

**后果：** 程序在进入 `main` 前停止，传统入口和源码内容都没有机会执行。

**触发条件：** 用 JDK 25 默认设置编译，然后只切换 `java` 命令到 Java 8。

**错误示例：**

```bash
# 使用 JDK 25 编译
javac -encoding UTF-8 -d out25 src/TeamFlowCompileCheck.java
# 直接使用 Java 8 加载 JDK 25 默认产物
java -cp out25 TeamFlowCompileCheck
```

**正确写法：**

```bash
# 使用真实 JDK 8 编译并运行
javac -encoding UTF-8 -d out8 src/TeamFlowCompileCheck.java
java -cp out8 TeamFlowCompileCheck
```

**验证方式：** 编译器目标与运行时匹配，Java 8 启动成功并得到与现代版相同的两行输出。
:::

## 六、把本课步骤串成 TeamFlow 编译闭环

这一闭环给 TeamFlow 增加的是可重复的编译与启动自检：在最终项目中，领域对象、服务和接口都必须先
经过构建并由正确主类启动。本课只用可见的构建状态证明这条基础路径，不提前加入任务业务逻辑。

### 1. JDK 25 完整程序

文件：`src/TeamFlowBuildStatus.java`

```java
/**
 * 展示 TeamFlow 源码经过编译后进入运行状态。
 */
public final class TeamFlowBuildStatus {
    /**
     * 输出本次构建状态和下一步提示。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        System.out.println("TeamFlow 源码已编译");
        System.out.println("TeamFlow 主类已启动");
        System.out.println("下一步：观察并定位错误");
    }
}
```

JDK 25 操作：

1. 确认当前目录包含 `src/TeamFlowBuildStatus.java`，并创建 `out`。
2. 确认 `java -version` 和 `javac -version` 都显示主版本 25。
3. 执行 `javac -encoding UTF-8 -d out src/TeamFlowBuildStatus.java`。
4. 确认 `out/TeamFlowBuildStatus.class` 已生成。
5. 执行 `java -cp out TeamFlowBuildStatus`。

预期输出：

```text
TeamFlow 源码已编译
TeamFlow 主类已启动
下一步：观察并定位错误
```

第一条来自成功生成的 class 文件，第二条证明启动器找到主类并进入 `main`，第三条只说明 TeamFlow
学习路径的下一步，不在本课展开错误类型。

### 2. Java 8 完整程序

Java 8 对应文件也完整给出：

```java
/**
 * 展示 TeamFlow Java 8 源码经过编译后进入运行状态。
 */
public final class TeamFlowBuildStatus {
    /**
     * 输出 Java 8 构建状态和下一步提示。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        System.out.println("TeamFlow 源码已编译");
        System.out.println("TeamFlow 主类已启动");
        System.out.println("下一步：观察并定位错误");
    }
}
```

Java 8 操作：

1. 确认 `java -version` 和 `javac -version` 都显示 `1.8.0`。
2. 预先创建 `out`，不要依赖编译器自动创建目标目录。
3. 执行 `javac -encoding UTF-8 -d out src/TeamFlowBuildStatus.java`。
4. 确认 `out/TeamFlowBuildStatus.class` 已生成。
5. 执行 `java -cp out TeamFlowBuildStatus`，观察与 JDK 25 相同的三行输出。

两个版本的源码相同，是因为本课只使用共有的传统类和 `main` 入口；运行步骤仍分别写出，以便确认
实际调用的是目标 JDK，而不是只根据代码外观猜测兼容性。

## 七、独立练习与参考实现

### 1. 练习：建立可重复的 TeamFlow 启动检查

:::exercise
### 练习任务

**要求：** 新建 `src/TeamFlowLaunchReport.java`，程序依次输出 `源码：已保存`、`编译：已完成`、
`运行：已启动` 三行。使用 `javac -encoding UTF-8 -d out` 编译，再使用 `java -cp out` 启动。文件名和
public 类名都必须是 `TeamFlowLaunchReport`；只允许一个类和一个传统 `main` 方法；不得使用包、Maven、
依赖或 JDK 25 专属语法；源码和 class 文件必须分别位于 `src` 与 `out`；JDK 25 和 Java 8 都要使用
显式两步流程。

**验收：** 两个版本都生成 `out/TeamFlowLaunchReport.class`，运行命令均成功，控制台按顺序精确
出现三行文字。修改第三行为 `运行：已重新启动` 后，只有重新编译并运行才得到新输出。
:::

### 2. JDK 25 参考实现

```java
/**
 * 报告 TeamFlow 首次命令行启动的三个状态。
 */
public final class TeamFlowLaunchReport {
    /**
     * 按顺序输出源码、编译和运行状态。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        System.out.println("源码：已保存");
        System.out.println("编译：已完成");
        System.out.println("运行：已启动");
    }
}
```

```bash
javac -encoding UTF-8 -d out src/TeamFlowLaunchReport.java
java -cp out TeamFlowLaunchReport
```

预期输出：

```text
源码：已保存
编译：已完成
运行：已启动
```

### 3. Java 8 参考实现

```java
/**
 * 报告 TeamFlow Java 8 命令行启动的三个状态。
 */
public final class TeamFlowLaunchReport {
    /**
     * 按顺序输出源码、编译和运行状态。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        System.out.println("源码：已保存");
        System.out.println("编译：已完成");
        System.out.println("运行：已启动");
    }
}
```

Java 8 先确认 `out` 已存在，再执行与现代版相同的两条命令。预期输出同样是：

```text
源码：已保存
编译：已完成
运行：已启动
```

## 八、本课小结

现在你已经能从正确的工作目录读取源码，用 `javac` 把 class 文件写入独立 `out` 目录，再让 `java`
以该目录作为 classpath 根并按主类名启动程序。修改源码后重新编译和运行，控制台才会对应当前内容。

JDK 25 可以直接启动单个源文件，Java 8 不可以；两个版本都支持传统两步流程，因此 TeamFlow 主线继续
使用显式编译和启动。下一步需要处理的是：当这条路径失败或结果不对时，怎样根据现象找到问题所在。
