---
id: backend.java.learn.basics.development-environment-and-runtime
type: lesson
title: 环境搭建与首个程序
summary: 安装并核验 JDK 25，在 IntelliJ IDEA 中选择项目 JDK，运行第一个 TeamFlow Java 程序
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 55
prerequisites: []
objectives:
  - 能说明 JDK 与 IntelliJ IDEA 的职责区别，并从官方入口获取 JDK 25。
  - 能在 Windows、macOS 和 Linux 上完成必要的 JDK 安装核对。
  - 能使用 `java -version`、`javac -version` 以及命令位置检查确认当前终端的 JDK。
  - 能在 IntelliJ IDEA 中创建普通 Java 项目并选择正确的 Project SDK。
  - 能创建 Java 类，写出 Java 25 与 Java 8 都能运行的传统 main 入口并观察控制台输出。
  - 能判断终端 JDK、IDEA 项目 JDK 和运行配置 JDK 是否一致。
recap:
  - JDK 提供 Java 开发与运行所需工具，IntelliJ IDEA 负责编辑项目和发起运行，两者不是同一个东西。
  - 安装后必须在新终端分别核对 `java` 和 `javac` 的版本与位置。
  - Project SDK 决定 IDEA 项目使用的 JDK；终端和 IDEA 的设置要分别检查。
  - '`public` 类名要和文件名一致，传统 `public static void main(String[] args)` 是两个版本都能使用的入口。'
  - TeamFlow 首程序只输出一条状态消息，先建立从环境到可见结果的最短反馈。
related: []
tags:
  - Java
  - JDK 25
  - Java 8
  - IntelliJ IDEA
  - 环境搭建
  - 首个程序
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 仅在真实入口和 IDEA 配置差异处说明
verifiedAt: 2026-08-16
sources:
  - id: oracle-jdk-25-installation-overview
    title: Oracle Java Platform, Standard Edition JDK Installation Guide 25
    url: https://docs.oracle.com/en/java/javase/25/install/overview-jdk-installation.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: JDK 25
    claims:
      - 开发或运行 Java 应用需要下载并安装 JDK
      - JDK 25 安装文档覆盖 Windows、macOS 和 Linux
  - id: oracle-jdk-25-downloads
    title: Java SE 25 Archive Downloads
    url: https://www.oracle.com/java/technologies/javase/jdk25-archive-downloads.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: JDK 25
    claims:
      - 官方下载项按操作系统和处理器架构区分
  - id: oracle-jdk-25-windows
    title: Installation of the JDK on Microsoft Windows Platforms
    url: https://docs.oracle.com/en/java/javase/25/install/installation-jdk-microsoft-windows-platforms.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: JDK 25 on Windows 64-bit
    claims:
      - Windows 可使用 exe 自安装器或 msi 企业安装器
      - 安装后应在新终端确认命令行版本
  - id: oracle-jdk-25-macos
    title: Installation of the JDK on macOS
    url: https://docs.oracle.com/en/java/javase/25/install/installation-jdk-macos.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: JDK 25 on macOS
    claims:
      - macOS 下载项区分 Intel x64 与 Apple Silicon AArch64
      - macOS 可使用 dmg 安装包或压缩包
  - id: oracle-jdk-25-linux
    title: Installation of the JDK on Linux Platforms
    url: https://docs.oracle.com/en/java/javase/25/install/installation-jdk-linux-platforms.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: JDK 25 on Linux
    claims:
      - Linux 可使用 tar.gz、Debian、RPM 或发行版仓库安装方式
      - 系统级安装可能需要管理员权限，归档方式可以放在用户可写目录
  - id: dev-java-getting-started
    title: Getting Started with Java
    url: https://dev.java/learn/getting-started
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java 入门
    claims:
      - JDK 提供编译和运行 Java 应用所需工具
      - 首个程序使用纯文本 Java 文件、类、main 和控制台输出
  - id: oracle-java-hello-world
    title: A Closer Look at the Hello World Application
    url: https://docs.oracle.com/javase/tutorial/getStarted/application/index.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java 入门
    claims:
      - main 是 Java 应用的固定启动入口并接收字符串数组参数
  - id: jetbrains-first-java-application
    title: Create your first Java application
    url: https://www.jetbrains.com/help/idea/creating-and-running-your-first-java-application.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: IntelliJ IDEA Java 项目
    claims:
      - 创建 Java 项目时需要选择或添加实际 JDK
      - 可以从 src 创建 Java 类并运行 main 查看 Run 工具窗口输出
  - id: jetbrains-sdks
    title: SDKs
    url: https://www.jetbrains.com/help/idea/sdk.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: IntelliJ IDEA Project SDK
    claims:
      - Project Structure 的 Project 设置用于选择 Project SDK
      - 已安装 JDK 可从磁盘添加，未安装时 IDEA 也提供 Download JDK 入口
  - id: jetbrains-application-run-configuration
    title: 'Run/debug configuration: Application'
    url: https://www.jetbrains.com/help/idea/run-debug-configuration-java-application.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: IntelliJ IDEA Application 运行配置
    claims:
      - Application 运行配置需要核对运行时、Main class 和 Working directory
  - id: jetbrains-project-settings
    title: Project structure settings
    url: https://www.jetbrains.com/help/idea/project-settings-and-structure.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: IntelliJ IDEA 项目设置
    claims:
      - Project SDK 是项目级设置，不能用终端版本输出替代核对
  - id: jls-25-execution
    title: Java Language Specification 25 Chapter 12 Execution
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - Java 25 支持传统 public static void main(String[] args) 启动入口
  - id: jls-8-execution
    title: Java Language Specification 8 Chapter 12 Execution
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-12.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 使用传统 main 入口并向其传入字符串数组
  - id: oracle-java-25-compact-main
    title: Compact Source Files and Instance main Methods
    url: https://docs.oracle.com/en/java/javase/25/language/compact-source-files-instance-main-methods.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java SE 25
    claims:
      - Java 25 支持更简洁的 compact source 和 instance main 形式
---

# 环境搭建与首个程序

第一次运行 Java 程序时，最重要的不是记住一个按钮的位置，而是确认三件事：电脑上有可用的 JDK，
IntelliJ IDEA 的项目选中了它，程序确实从预期的类开始输出结果。本课把这条路径缩短成三个动作：
安装并确认 JDK 25、在 IDEA 中配置项目 JDK、创建并运行一个 TeamFlow 首程序。

本课使用一个普通 Java 项目，不引入 Web 框架、依赖管理或业务对象。你会先看到一条明确的控制台消息，
后续 TeamFlow 项目再把这个入口逐步扩展成真正的后端应用。

## 一、先认识两件工具

### 1. JDK 和 IntelliJ IDEA 分别负责什么

JDK（Java Development Kit）是 Java 的开发套件，里面有运行 Java 程序的 `java` 命令，也有检查和开发
程序需要的 `javac` 等工具。JDK 是程序真正使用的 Java 工具链；没有它，IDEA 不能凭空提供 Java 运行
环境。

IntelliJ IDEA 是集成开发环境（IDE）。它负责组织项目文件、编辑源码、提供代码提示，并根据项目和运行
配置发起程序运行。IDEA 的安装目录还可能带有自己的运行时，那只是 IDEA 自己运行所需的环境，不等于
当前项目的 JDK。

因此要分开记住：

| 要回答的问题 | 应检查的位置 |
| --- | --- |
| 终端能否找到 Java 工具 | 当前终端的 `java`、`javac` 位置与版本 |
| IDEA 项目用哪个 JDK | `File > Project Structure > Project > Project SDK` |
| 点击 Run 时运行哪个类 | Application 运行配置的 `Main class` |

看到 IDEA 已安装，不能推出终端已经配置好 JDK；看到终端显示 Java 25，也不能推出 IDEA 项目已经选择
Project SDK 25。三处都要单独确认。

### 2. 本课要得到什么结果

最后的程序类名是 `TeamFlowApplication`，文件名是 `TeamFlowApplication.java`，运行后控制台精确输出：

```text
TeamFlow 服务准备就绪
```

这个名字只表示 TeamFlow 项目的第一个启动位置。此时没有 HTTP、数据库、消息或复杂业务，程序只负责
证明环境和入口都已经准备好。

## 二、安装并确认 JDK 25

### 1. 从官方入口选择正确下载项

请从 Oracle 的 [Java SE 25 下载页](https://www.oracle.com/java/technologies/javase/jdk25-archive-downloads.html)
或 [JDK 25 安装总览](https://docs.oracle.com/en/java/javase/25/install/overview-jdk-installation.html)
进入。下载时同时看操作系统和处理器架构：Windows 通常选择 x64，macOS 需要区分 Intel x64 与 Apple
Silicon AArch64，Linux 也需要在 x64 与 AArch64 之间选择。

本课不替你安装或修改系统 JDK。下载前先确认机器架构，下载后使用官方安装器或归档文件完成安装；如果
电脑已经有 JDK 25，只需要直接进入核验步骤。安装完成后关闭原有终端并重新打开，因为旧终端可能仍保留
安装前的 PATH。

### 2. Windows 的必要注意事项

在官方 Windows 安装页选择 64 位 JDK 25。普通个人安装可使用 `.exe` 自安装器；组织统一部署时可以使用
`.msi` 企业安装器。安装器可能要求管理员权限，安装位置以安装器显示的 JDK 目录为准，不要把某个只含
`java.exe` 的旧运行时目录误当作 JDK 根目录。

安装结束后打开新的 PowerShell 或命令提示符，再执行本节的版本和位置检查。若系统提示找不到命令，先检查
Windows 的 PATH 是否包含目标 JDK 的 `bin` 目录，并确认 PATH 中是否有更早的旧 Java 路径；不要只修改
IDEA 的设置就认为系统终端已经更新。

### 3. macOS 的必要注意事项

Intel Mac 选择 x64，Apple Silicon Mac 选择 AArch64。官方 macOS 安装页提供 `.dmg` 安装包，也说明了
压缩包安装方式。使用安装包时按向导完成即可；使用压缩包时，必须记住实际 JDK 根目录，后续在 IDEA 的
`Add SDK from disk` 中选择这个目录，而不是选择 `/usr/bin/java` 这样的系统入口。

安装后打开新的终端，使用 `command -v java` 和 `command -v javac` 观察命令位置，再执行版本检查。若
电脑中有多个 JDK，不要根据文件夹名称猜版本，以命令输出和 IDEA 的 Project SDK 选择为准。

### 4. Linux 的必要注意事项

Linux 可以按发行版和权限选择官方 `.deb`、`.rpm`、发行版仓库或 `.tar.gz` 归档。系统级 `.deb`/`.rpm`
通常需要管理员权限；归档文件可以解压到当前用户有写权限的目录。选择归档方式后，当前 shell 的 PATH
需要包含该 JDK 的 `bin` 目录；使用发行版包时，要留意系统的 alternatives 可能仍把另一套 JDK 设为默认。

不确定权限或发行版差异时，优先阅读 Oracle 对应平台页面，不要把某个发行版的命令直接复制到另一种系统。
安装结束后重新打开 shell，再做位置和版本核验。

### 5. 用两个命令确认当前 JDK

先确认命令来自哪里，再确认版本。macOS/Linux 的 shell 使用：

```bash
command -v java
command -v javac
java -version
javac -version
```

Windows PowerShell 使用：

```powershell
Get-Command java
Get-Command javac
java -version
javac -version
```

Windows 命令提示符也可以使用：

```bat
where java
where javac
java -version
javac -version
```

JDK 25 的输出会包含主版本 `25`；Java 8 的输出通常以 `1.8.0` 开头。`java -version` 和 `javac -version`
都要成功，且它们的位置应来自同一套目标 JDK 的 `bin` 目录。只看到 `java` 成功并不代表已经具备完整的
开发环境。

如果位置命令列出多行，系统会按 PATH 顺序优先使用其中一项。记录第一项，再逐项检查是否有旧 JDK、只含
运行工具的目录或残留 shim。修改 PATH 后必须新开终端再次核对，不能用旧窗口的输出作结论。

## 三、在 IntelliJ IDEA 中配置项目 JDK

### 1. 创建一个普通 Java 项目

在 IntelliJ IDEA 的欢迎页选择 `New Project`，左侧选择 `Java`。项目名称可以填写
`TeamFlowStarter`，构建系统选择由 IDEA 管理的普通 Java 项目，不添加外部依赖。JDK 下拉框选择已经安装
的 JDK 25；如果列表没有它，选择 `Add JDK` 或 `Add SDK from disk`，指向 JDK 根目录。只有在确实需要由
IDEA 下载时才使用 `Download JDK`，本课不会替你执行下载。

创建项目后，项目窗口中应看到 `src` 目录。`src` 是本课放置 Java 源码的地方；此时只需要一个类，不要
为了“像真实项目”提前添加其他目录或框架。

### 2. 在 Project Structure 再核对 Project SDK

打开 `File | Project Structure | Project Settings | Project`，查看 `Project SDK` 是否为 JDK 25。没有
正确 SDK 时，使用 `Add SDK from disk` 选择 JDK 根目录，确认后再回到 Project 页面选择它。

这里选的是项目级 SDK，不是 IDEA 自身的运行时。若项目还显示模块设置，保持模块使用项目 SDK 即可；本课
不展开语言级别、构建工具或依赖配置。

### 3. 创建类并准备运行配置

右键 `src`，选择 `New | Java Class`，输入 `TeamFlowApplication`。IDEA 会创建
`TeamFlowApplication.java`，随后把完整程序放入文件并保存。

第一次点击类旁的运行图标时，IDEA 通常会自动创建 Application 配置。若需要手动核对，打开
`Run | Edit Configurations`，确认：

- `Main class` 是 `TeamFlowApplication`；
- `JRE` 或运行时选择 `Project SDK`；
- `Working directory` 是当前项目根目录。

运行配置的三个字段分别决定启动哪个类、使用哪个项目 JDK、从哪个项目目录开始。不要只看按钮名称，配置
字段才是实际运行依据。

### 4. 终端和 IDEA 使用不同 JDK 时怎么核对

在 IDEA 的内置 Terminal 中重新执行 `java -version` 和 `javac -version`，再与外部终端结果比较。然后
回到 `Project Structure | Project SDK` 和 Application 配置查看项目 JDK。可能出现以下合法但容易混淆的
组合：外部终端是 JDK 25，IDEA 项目是 JDK 8；项目 SDK 是 JDK 25，但内置 Terminal 仍保留旧会话的 PATH。

正确做法是分别记录三处结果：

1. 外部终端的命令位置与版本。
2. IDEA 内置 Terminal 的命令位置与版本。
3. Project SDK 和 Application 配置中的 JDK。

如果第三处不对，修改 Project SDK 或运行配置；如果前两处不对，关闭旧终端会话、修正系统 PATH 后重新
打开终端。不要把 IDEA 自身使用的运行时版本当成项目 JDK 版本。

### 5. Java 8 项目的正确配置方式

需要兼容 Java 8 时，前提是电脑上已经有 JDK 8。在 `New Project` 的 JDK 下拉框选择 JDK 8，或在
`File | Project Structure | SDKs` 中添加 JDK 8 根目录，再在 `Project` 页面把 `Project SDK` 改为
JDK 8。Application 配置的运行时也选择 `Project SDK`。

不要把“IDEA 可以打开项目”当作“项目已经使用 Java 8”。重新查看 Project SDK、Application 的 JRE，
并在对应终端执行 `java -version` 与 `javac -version`；版本输出为 `1.8.0` 才是 Java 8 的命令行证据。

## 四、创建并运行第一个 Java 程序

### 1. 只记住四个最低限度的约定

首个类使用下面的结构。为了让 Java 8 和 JDK 25 都能运行，暂时固定使用传统入口：

- `TeamFlowApplication` 是类名，也是 IDEA 运行配置要找的主类名。
- `TeamFlowApplication.java` 是文件名，大小写和类名必须完全一致。
- `public static void main(String[] args)` 是两个版本都支持的启动入口。
- `System.out.println(...)` 把一行文字写到控制台。

这里不展开方法、数组和类型系统。现在只要把 `main` 当成固定的启动位置，把 `args` 当成暂时不用的启动
参数容器即可。

### 2. JDK 25 的完整首程序

把下面的完整内容放入 `TeamFlowApplication.java`：

```java
/**
 * TeamFlow 学习项目的第一个可运行程序。
 */
public final class TeamFlowApplication {
    /**
     * 从固定入口输出 TeamFlow 的准备状态。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        System.out.println("TeamFlow 服务准备就绪");
    }
}
```

保存后检查编辑器标签上的文件名仍为 `TeamFlowApplication.java`。`public` 表示这个类可被运行工具找到，
`static` 让启动时不需要先创建对象，`void` 表示入口不返回结果，`main` 是固定名称，`String[] args` 是
启动参数。现在只需要记住这些最低限度含义，不必提前学习对象创建或参数处理。

### 3. 在 IDEA 中运行并观察结果

1. 确认 Project SDK 是 JDK 25，Application 的 Main class 是 `TeamFlowApplication`。
2. 在编辑器中点击 `main` 左侧的绿色运行图标，或右键类名选择 `Run 'TeamFlowApplication.main()'`。
3. IDEA 打开 Run 工具窗口后，观察控制台输出。
4. 输出应只有下面这一行，前后不要多空格：

```text
TeamFlow 服务准备就绪
```

如果看到这行，说明 IDEA 找到了目标类、使用了可运行的 JDK，并执行了 `main` 中的输出语句。修改文字
后重新保存并运行，控制台出现新文字，才能证明运行的是当前文件内容。

## 五、JDK 25 与 Java 8 的真实差异

### 1. 两个版本都支持传统入口

JDK 25 和 Java 8 都支持：

```java
public static void main(String[] args)
```

这是本课唯一的主示例形式。JDK 25 还支持更简洁的启动形式，例如省略显式类声明或使用更短的 `main`；
Java 8 不支持这些形式。为了让同一份入门结构能在两个版本运行，本课不使用简洁形式，也不把版本差异
扩大成另一套语法课程。

### 2. Java 8 的完整程序和运行步骤

Java 8 版本同样必须把完整入口写出来，不能用“同上”代替：

```java
/**
 * TeamFlow Java 8 兼容线的第一个可运行程序。
 */
public final class TeamFlowApplication {
    /**
     * 从传统入口输出 TeamFlow 的准备状态。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        System.out.println("TeamFlow 服务准备就绪");
    }
}
```

在 IDEA 中运行 Java 8 版本时，按以下顺序操作：

1. 确认项目已添加 JDK 8，并在 `Project Structure | Project` 选择 JDK 8 作为 Project SDK。
2. 确认 Application 的 JRE 使用 `Project SDK`，Main class 仍为 `TeamFlowApplication`。
3. 用完整代码覆盖 `TeamFlowApplication.java`，保存后运行 `main`。
4. 控制台应精确输出 `TeamFlow 服务准备就绪`。

代码看起来与 JDK 25 版本相同，是因为本课选的是两个版本共有的传统入口；不能因此省略 Java 8 的完整
代码和配置步骤。

## 六、常见易错情况

下面的例子只帮助你恢复本课的运行路径，不把它们扩展成完整的错误诊断课。每个例子都先看现象，再回到
命令位置、版本、Project SDK、类名和输出这几个可核对事实。

:::pitfalls
### JDK 已安装但终端仍显示旧版本

**现象：** 安装了 JDK 25，`java -version` 或 `javac -version` 仍显示旧主版本。

**原因：** 当前终端是在安装前打开的，或 PATH 中旧 JDK 的 `bin` 排在新 JDK 前面。

**后果：** 你以为正在使用 JDK 25，实际运行的却是另一套工具；IDEA 和终端的结果也可能不一致。

**触发条件：** 错误操作是只在 IDEA 的 Project SDK 下拉框选择 JDK 25，然后继续使用旧终端的版本输出。

**错误示例：**

```text
Project SDK: JDK 25
旧终端 java -version: 1.8.0
```

**正确写法：** 关闭当前终端，打开新终端；执行 `where java`/`where javac` 或 `command -v java`/
`command -v javac`，检查 PATH 顺序，再分别执行两个版本命令。

```text
新终端 java -version: 25
新终端 javac -version: 25
```

**验证方式：** 两个版本命令都成功，主版本都显示 `25`，命令位置都属于目标 JDK 的 `bin` 目录。

### `java` 可用但 `javac` 不可用

**现象：** `java -version` 成功，`javac -version` 报找不到命令。

**原因：** PATH 可能只指向运行工具，或者当前 PATH 中没有完整 JDK 的 `bin` 目录；只安装了可运行环境
也不能提供 `javac`。

**后果：** 终端看似能运行 Java，却不能确认这是完整的开发环境；后续在 IDEA 选择 SDK 时也容易选错目录。

**触发条件：** 错误操作是只要 `java -version` 有输出，就跳过 `javac -version` 和命令位置检查。

**错误示例：**

```bash
java -version
# 看到输出后就停止检查
```

**正确写法：** 找到 JDK 根目录，把它作为 IDEA 的 SDK home，并在系统 PATH 中确认其 `bin` 目录；重新
打开终端后再次执行两个版本命令。

```bash
java -version
javac -version
```

**验证方式：** `java` 和 `javac` 都能被位置命令找到，并且来自同一套 JDK 目录。

### IDEA 没有 Project SDK 或选择了错误版本

**现象：** 新项目无法运行 `main`，或者编辑器提示没有配置 SDK；项目显示的是 JDK 8 而你要运行 JDK 25。

**原因：** 创建项目时跳过了 JDK 选择，或 Project SDK 与电脑上实际想用的 JDK 不同。

**后果：** 代码本身可能没有问题，但 IDEA 没有正确的项目工具链来运行它。

**触发条件：** 错误操作是只检查 IDEA 能打开文件，不检查 `File | Project Structure | Project | Project SDK`。

**错误示例：**

```text
Project SDK: <未配置>
```

**正确写法：** 在 Project SDK 中选择 JDK 25；列表没有时用 `Add SDK from disk` 指向 JDK 根目录；再把
Application 的运行时设为 `Project SDK`。

```text
Project SDK: JDK 25
Application JRE: Project SDK
```

**验证方式：** Project SDK、Application JRE 和输出的主版本都符合当前目标；重新运行后看到预期文本。

### 终端 JDK 与 IDEA 项目 JDK 不同

**现象：** 外部终端显示 JDK 25，IDEA 项目设置显示 JDK 8，或 IDEA 内置 Terminal 仍显示旧版本。

**原因：** 系统 PATH、IDEA 内置终端会话、Project SDK 和 Application 配置是彼此独立的设置。

**后果：** 你在终端核对的版本不能证明 IDEA 运行按钮使用同一个 JDK，版本差异会被误认为代码问题。

**触发条件：** 错误操作是只执行一次外部 `java -version`，然后假定所有工具都使用这个版本。

**错误示例：**

```text
外部终端: JDK 25
IDEA Project SDK: JDK 8
```

**正确写法：** 分别核对外部终端、IDEA 内置 Terminal、Project SDK 和 Application JRE；关闭旧终端会话后再
比较输出。

```text
外部终端: JDK 25
IDEA 内置 Terminal: JDK 25
Project SDK: JDK 25
Application JRE: Project SDK
```

**验证方式：** 四处记录的目标版本一致，或者你明确知道哪一处必须保留 Java 8，并能解释差异。

### `public` 类名与文件名不一致

**现象：** 保存或运行时提示 public 类应放在同名文件中，程序不能正常运行。

**原因：** 文件叫 `TeamFlowApp.java`，但代码中的 public 类叫 `TeamFlowApplication`，或大小写不同。

**后果：** IDEA 无法把当前文件当作这个 public 类来运行。

**触发条件：** 错误操作是只改类名或只改文件名，留下另一处不一致。

**错误示例：**

```java
/**
 * 展示文件名不一致时的类声明。
 */
public final class TeamFlowApplication {
}
// 文件名却是 TeamFlowApp.java
```

**正确写法：** 让文件名严格为 `TeamFlowApplication.java`，类声明严格为
`public final class TeamFlowApplication`，包括大小写。

```java
/**
 * 展示文件名一致时的类声明。
 */
public final class TeamFlowApplication {
}
```

**验证方式：** 编辑器文件标签、类声明和 Application 的 Main class 三处文字完全一致。

### 入口方法写成 Java 8 不支持的形式

**现象：** JDK 25 可能接受更简洁的入口，但切换到 Java 8 后提示找不到 main 方法。

**原因：** Java 8 只认识传统的 `public static void main(String[] args)` 入口；更短的 `void main()` 等
形式不是 Java 8 的启动合同。

**后果：** 同一份源码在两个项目版本中表现不同，初学者会误以为 JDK 或 IDEA 随机失败。

**触发条件：** 错误操作是为了少写几行，删掉 `public`、`static` 或 `String[] args`。

**错误示例：**

```java
/**
 * 展示 Java 8 无法使用的简洁入口。
 */
final class TeamFlowApplication {
    /**
     * 这是 JDK 25 可识别但 Java 8 不识别的入口形式。
     */
    void main() {
        System.out.println("TeamFlow 服务准备就绪");
    }
}
```

**正确写法：** 本课始终完整写出 `public static void main(String[] args)`，并在 Java 8 项目中用完整代码
运行。

```java
/**
 * 展示两个版本都支持的传统入口。
 */
final class TeamFlowApplication {
    /**
     * 输出 TeamFlow 准备状态。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        System.out.println("TeamFlow 服务准备就绪");
    }
}
```

**验证方式：** JDK 25 与 JDK 8 的 Project SDK 都能运行同一个类，并输出同一行状态消息。

### 运行了错误的类或没有看到预期输出

**现象：** Run 窗口没有 `TeamFlow 服务准备就绪`，或输出仍是修改前的文字。

**原因：** 运行配置的 Main class 指向了另一个类，文件没有保存，或者点击了错误类的运行图标。

**后果：** 实际运行的不是刚刚阅读和修改的程序，容易把配置问题误判为代码问题。

**触发条件：** 错误操作是反复点击 Run，不查看 `Main class` 和输出内容。

**错误示例：**

```text
Main class: OtherDemo
控制台: 没有 TeamFlow 服务准备就绪
```

**正确写法：** 保存当前文件，检查 Application 的 Main class 为 `TeamFlowApplication`，从该类的 `main` 左侧
图标运行，并比较控制台完整输出。

```text
Main class: TeamFlowApplication
控制台: TeamFlow 服务准备就绪
```

**验证方式：** 输出精确为当前源码中的文字，Run 配置显示正确主类且运行成功。
:::

## 七、完整程序与练习

### 1. JDK 25 TeamFlow 完整程序

下面的程序把本课三步串在一起：你先确认 JDK 25，把项目 SDK 指向它，再运行这个类观察控制台。它没有
提前引入业务对象，唯一的业务信号就是“服务准备就绪”。

文件：`src/TeamFlowApplication.java`

```java
/**
 * TeamFlow 项目的第一个 JDK 25 启动程序。
 */
public final class TeamFlowApplication {
    /**
     * 输出服务准备状态，作为首次运行的可见结果。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        System.out.println("TeamFlow 服务准备就绪");
    }
}
```

JDK 25 IDEA 步骤：确认 Project SDK 为 JDK 25，确认 Application 的 Main class 为
`TeamFlowApplication`，运行 `main`。预期输出：

```text
TeamFlow 服务准备就绪
```

### 2. Java 8 TeamFlow 完整程序

这是 Java 8 对应的完整文件，不省略任何一行：

```java
/**
 * TeamFlow 项目的第一个 Java 8 启动程序。
 */
public final class TeamFlowApplication {
    /**
     * 输出服务准备状态，作为首次运行的可见结果。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        System.out.println("TeamFlow 服务准备就绪");
    }
}
```

Java 8 IDEA 步骤：确认电脑已有 JDK 8，在 `Project Structure | Project` 选择 JDK 8 为 Project SDK，
Application 的 JRE 选择 `Project SDK`，Main class 选择 `TeamFlowApplication`，再运行 `main`。预期输出
仍为：

```text
TeamFlow 服务准备就绪
```

### 3. 为什么这段程序会输出这一行

IDEA 运行配置先确定要启动的 `TeamFlowApplication`，再从这个类的传统 `main` 入口开始。进入方法后，
程序执行唯一一条输出语句，把括号中的文字写到 Run 工具窗口，因此控制台只有一行文本。

类名、文件名、入口方法和输出语句各自承担不同任务：类名让运行配置指向目标，文件名让源码身份明确，
入口方法给程序一个固定起点，`System.out.println` 产生学习者可以直接观察的结果。

### 4. 练习：输出 TeamFlow 工作区状态

:::exercise
### 练习任务

**要求：** 新建 `TeamFlowWelcome.java`，创建 `TeamFlowWelcome` 类，使用传统
`public static void main(String[] args)` 入口输出 `TeamFlow 服务准备就绪` 和
`当前工作区：学习环境` 两行。文件名必须是 `TeamFlowWelcome.java`，public 类名必须是
`TeamFlowWelcome`；只使用一个类和一个 `main` 方法，不添加框架、依赖或输入功能；JDK 25 和 Java 8
都要能运行，入口签名保持完整；运行配置的 Main class 必须指向 `TeamFlowWelcome`。

**验收：** 在 JDK 25 项目中运行后，控制台按顺序精确出现两行；把 Project SDK 换成 JDK 8 后再次运行，
仍得到同样两行。若两版本输出不同，先核对文件、Main class 和 Project SDK，不要先改代码结构。
:::

### 5. JDK 25 练习参考实现

```java
/**
 * 输出 TeamFlow 学习工作区的欢迎状态。
 */
public final class TeamFlowWelcome {
    /**
     * 输出练习要求的两行状态。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        System.out.println("TeamFlow 服务准备就绪");
        System.out.println("当前工作区：学习环境");
    }
}
```

预期输出：

```text
TeamFlow 服务准备就绪
当前工作区：学习环境
```

### 6. Java 8 练习参考实现

Java 8 版本也完整写出，代码不使用 JDK 25 的简洁入口：

```java
/**
 * 输出 TeamFlow Java 8 学习工作区的欢迎状态。
 */
public final class TeamFlowWelcome {
    /**
     * 输出练习要求的两行状态。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        System.out.println("TeamFlow 服务准备就绪");
        System.out.println("当前工作区：学习环境");
    }
}
```

在 Java 8 的 IDEA 项目中选择 JDK 8 Project SDK，确认 Application 的 Main class 为
`TeamFlowWelcome`，运行后应得到与 JDK 25 完全相同的两行输出。

## 八、本课小结

你现在可以从官方入口取得与机器架构匹配的 JDK 25，分别用 `java -version` 和 `javac -version` 核对
终端工具，在 IDEA 中选择 Project SDK，并运行一个有明确类名、文件名、入口和输出的 TeamFlow 程序。

本课的兼容策略也很明确：JDK 25 的确有更简洁的启动形式，但 Java 8 不支持；因此主线和练习都使用
传统 `public static void main(String[] args)`，并为两个版本分别给出完整代码与 IDEA 配置步骤。
