---
id: backend.java.learn.basics.development-environment-and-runtime
type: lesson
title: 开发环境、JDK 与 Java 运行过程
summary: 理解 Java 源码如何经过 JDK 工具变成 class file，并由 JVM 找到入口开始运行
domain: backend
technology: java
module: core
level: beginner
estimatedMinutes: 35
prerequisites: []
stage: basics
objectives:
  - 能区分 Java 语言、Java SE、JDK、运行时环境与 JVM 的职责。
  - 能解释 `.java -> javac -> .class -> java launcher -> JVM` 的运行过程。
  - 能使用 Java 25 与 Java 8 都兼容的传统 `main` 入口编译并运行最小程序。
  - 能区分编译期、启动期和运行期错误。
  - 能识别 source-file launch、class file 版本和 classpath 的常见误用。
recap:
  - JDK 是开发套件，JVM 是运行 class file 的抽象机器；Java 语言和 Java SE 是规范层合同。
  - 推荐反馈环是 `.java -> javac -> .class -> java launcher -> JVM -> main`。
  - |-
    传统 `public static void main(String[] args)` 同时兼容 Java 25 和 Java 8，但不是 Java 25 唯一
    合法入口。
  - Java 8 不支持 source-file launch，也不能加载 Java 25 默认生成的 major 69 class。
  - 编译期、启动期和运行期错误发生在不同阶段，应分别检查源码、启动输入和程序行为。
related: []
tags:
  - Java
  - JDK
  - JVM
  - javac
  - class file
appliesTo: Java 25；Java 8 / Spring Boot 2.3.12.RELEASE legacy 背景
modernBaseline:
  java: '25'
legacyBaseline:
  java: '8'
  springBoot: 2.3.12.RELEASE
verifiedAt: 2026-08-05
sources:
  - id: oracle-java-support-roadmap
    title: Oracle Java SE Support Roadmap
    url: https://www.oracle.com/java/technologies/java-se-support-roadmap.html
    sourceType: official-reference
    appliesTo: 2026-08-05 页面状态
    claims:
      - Java 25 是当前受支持的 LTS 版本
  - id: dev-java-getting-started
    title: Getting Started with Java
    url: https://dev.java/learn/getting-started
    sourceType: official-reference
    appliesTo: Java 11 及以上与传统编译运行流程
    claims:
      - JDK 提供编译和运行所需工具
      - source-file launch 自 Java SE 11 开始提供
  - id: java-se-8-platform-overview
    title: Java SE 8 Platform Overview
    url: https://docs.oracle.com/javase/8/docs/technotes/guides/index.html
    sourceType: official-reference
    appliesTo: Java SE 8
    claims:
      - JDK、JRE、JVM 与 Java 语言的职责边界
  - id: jls-25-execution
    title: Java Language Specification 25 - Chapter 12 Execution
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - JVM 启动的语言层过程
      - Java 25 候选 main 方法的扩展规则
  - id: jvms-25-class-file
    title: Java Virtual Machine Specification 25 - Class File Format
    url: https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-4.html
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - class file 是版本化的 JVM 二进制格式
      - Java 25 class file major version 为 69
  - id: jvms-25-loading
    title: Java Virtual Machine Specification 25 - Loading Linking and Initializing
    url: https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-5.html
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - JVM 装入、链接、初始化和调用 main 的职责
  - id: java-25-command
    title: The java Command - JDK 25
    url: https://docs.oracle.com/en/java/javase/25/docs/specs/man/java.html
    sourceType: official-reference
    appliesTo: JDK 25
    claims:
      - class 启动与 source-file mode 的命令合同
  - id: javac-25-command
    title: The javac Command - JDK 25
    url: https://docs.oracle.com/en/java/javase/25/docs/specs/man/javac.html
    sourceType: official-reference
    appliesTo: JDK 25
    claims:
      - javac 编译与 classpath 合同
      - --release 同时约束语言、目标 class 与对应平台 API
  - id: jls-8-execution
    title: Java Language Specification 8 - Chapter 12 Execution
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-12.html
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 的传统 main 方法启动合同
  - id: java-8-command
    title: java - Java SE 8 Tools Reference
    url: https://docs.oracle.com/javase/8/docs/technotes/tools/unix/java.html
    sourceType: official-reference
    appliesTo: JDK 8
    claims:
      - Java 8 launcher 按类名和 classpath 查找启动类
  - id: javac-8-command
    title: javac - Java SE 8 Tools Reference
    url: https://docs.oracle.com/javase/8/docs/technotes/tools/unix/javac.html
    sourceType: official-reference
    appliesTo: JDK 8
    claims:
      - Java 8 交叉编译的 source、target 与 bootstrap classes 边界
  - id: jep-512
    title: JEP 512 - Compact Source Files and Instance Main Methods
    url: https://openjdk.org/jeps/512
    sourceType: release-note
    appliesTo: JDK 25
    claims:
      - Java 25 正式交付 compact source files 与 instance main methods
projectEvidence: []
---

# 开发环境、JDK 与 Java 运行过程

## 为什么需要学习

后端程序最终要在某个确定的 Java 环境里编译和运行。只会点击 IDE 的“运行”按钮，却不知道按钮
背后调用了哪个工具、使用了哪个版本，一旦遇到“编译失败”“找不到主类”或“版本过高”，就很难
判断问题发生在哪一步。

本节先把最短链路看清：你写的是 `.java` 源码，JDK 中的 `javac` 生成 `.class` 文件，JDK 中的
`java` launcher 再启动 JVM，JVM 找到入口后才执行你的代码。

## 学习目标

- 能区分 Java 语言、Java SE、JDK、运行时环境与 JVM 的职责。
- 能解释 `.java -> javac -> .class -> java launcher -> JVM` 的运行过程。
- 能使用 Java 25 与 Java 8 都兼容的传统 `main` 入口编译并运行最小程序。
- 能区分编译期、启动期和运行期错误。
- 能识别 source-file launch、class file 版本和 classpath 的常见误用。

## 前置术语

- **源码**：人编写的文本文件，本节文件名是 `HelloBackend.java`。
- **编译器**：把一种形式的程序转换成另一种形式的工具；Java 编译器命令是 `javac`。
- **class file**：以 `.class` 结尾、遵守 JVM 规范的版本化二进制文件，通常包含 bytecode。
- **入口**：JVM 启动一个应用时首先调用的 `main` 方法。
- **classpath**：launcher 或编译器用来查找用户 class 的位置集合。本节只使用一个显式输出目录，
  包与源码目录结构留到下一课。

## 现代版本中的正确用法

本课在 2026-08-05 实时核对 Oracle 支持路线图后，采用 Java 25 作为现代 LTS 基线。完整开发环境
使用 JDK：它提供 `javac`、`java` 和其他开发工具，也包含运行程序所需的 JVM 实现与标准库。

这些名称不能互换：

| 名称       | 本课中的职责                                   | 不是                   |
| ---------- | ---------------------------------------------- | ---------------------- |
| Java 语言  | 规定源码的语法和语义                           | 一个安装目录或进程     |
| Java SE    | 规定语言、JVM、标准 API 等平台合同             | 某一家厂商的单个安装包 |
| JDK        | 提供编译、启动、诊断等开发工具和运行能力       | 只有 JVM               |
| 运行时环境 | JVM、标准库、launcher 和支持文件承担的运行职责 | 编译器本身             |
| JVM        | 装入并执行 class file，管理运行时状态          | Java 源码编译器        |

Java 8 文档曾把可单独分发的 JRE 明确定义为 JVM、库和其他运行组件。现代 JDK 使用模块化
runtime image，所以理解“运行时职责”比背诵旧版目录布局更可靠。

:::tip
排查环境问题时分别运行 `java -version` 和 `javac -version`。两个命令都成功且版本符合项目
要求，才证明当前终端同时具备相应的运行与编译工具。
:::

## 基本语法与运行过程

下面的源码是本课推荐入口。传统 `public static void main(String[] args)` 在 Java 25 与 Java 8
都合法，因此适合建立第一条可移植反馈环。

```java
public final class HelloBackend {
    /**
     * 输出后端课程的运行验证标记。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        System.out.println("后端课程运行成功");
    }
}
```

各部分只承担一个职责：

- `HelloBackend` 是要启动的类名，源码文件名与它保持一致。
- `public static void main(String[] args)` 是本课选择的跨版本入口。
- `System.out.println(...)` 在程序真正进入 `main` 后输出一行文本。
- `javac` 的直接产物是 `HelloBackend.class`，不是一个可以脱离 JVM 通用执行的机器码文件。

真实过程如下：

```text
HelloBackend.java
  -> javac 检查并编译源码
  -> HelloBackend.class
  -> java launcher 按 classpath 找到 HelloBackend
  -> JVM 装入、链接并初始化类
  -> JVM 选择并调用 main
  -> 输出“后端课程运行成功”
```

Java 25 的正式规则已经允许更多候选 `main`，包括无参数或实例方法；JEP 512 也正式交付了
compact source files。因此，传统形式仍是正确且可移植的入门写法，但不是 Java 25 唯一合法形式。

## 如何使用

1. 先确认终端使用的工具版本：`java -version` 与 `javac -version`。
2. 把上述源码保存为 `HelloBackend.java`。
3. 创建独立输出目录并编译：`javac -encoding UTF-8 -d /tmp/classes HelloBackend.java`。
4. 显式指定 classpath 运行：`java -cp /tmp/classes HelloBackend`。
5. 确认标准输出精确等于 `后端课程运行成功`，并确认两个命令退出码都为 0。

把编译输出放到独立目录有两个好处：源码目录不会混入 `.class`，运行命令也明确展示了“类从哪里
被找到”。真正项目通常由构建工具管理输出目录，但底层边界仍然相同。

## 适用与不适用场景

显式 `javac` + `java -cp` 适合本课的单文件学习、环境确认和最小问题复现。它能把编译和启动
分开观察，错误归因最直接。

它不适合替代大型后端项目的依赖管理、测试和打包流程；后续会学习 Maven。Java 25 支持直接执行
`.java` 文件，但 source-file mode 会把编译隐藏在一次命令中，也不能在 Java 8 使用，因此本课不
把它作为双版本推荐流程。

## Java 8 / Spring Boot 2.3 兼容写法

`dzzz-app` 的冻结 legacy 背景是 Java 8 与 Spring Boot 2.3.12.RELEASE。本节点是必要前置知识，
`projectEvidence` 明确为空，所以这里不引用或虚构任何项目源码。

推荐的 `HelloBackend.java` 无需改写即可由真实 Java 8 JDK 编译、运行。Java 8 的启动合同更窄：
传统入口必须是 `public static void`，并接收 `String[]` 或等价的 `String...` 参数。它不支持
`java HelloBackend.java` 这种 Java 11 才引入的 source-file launch。

## 新旧版本差异

| 对比项                | Java 25                                      | Java 8                                 | 本课选择                                        |
| --------------------- | -------------------------------------------- | -------------------------------------- | ----------------------------------------------- |
| 基线角色              | 当前受支持的现代 LTS                         | 冻结项目兼容线                         | 现代先讲，legacy 后补充                         |
| `main` 候选           | 可无参数，可为实例方法，访问规则已扩展       | 传统 `public static void` + 字符串数组 | 使用两者都支持的传统形式                        |
| `java File.java`      | 支持 source-file mode                        | 不支持                                 | 使用显式编译、运行两步                          |
| 默认 class file major | 69                                           | 52                                     | 分别用目标运行时复测                            |
| 面向 Java 8 交叉编译  | `javac --release 8` 同时约束语言、目标与 API | 没有 `--release`                       | 不能把单独的 `-source/-target` 当成完整兼容证明 |

## 易错点

:::pitfalls

### 错误：把 javac 的产物说成通用机器码

**触发条件：** 编译后直接尝试执行 `.class` 文件，或省略 JVM 的职责。

**原因：** `javac` 生成的是遵守 JVM 规范的 bytecode class file；launcher 和 JVM 仍负责装入与执行。

**后果：** 无法解释跨平台运行和 class file 版本不兼容，命令也不能正确启动程序。

**错误示例：**

```bash
./HelloBackend.class
```

**正确写法：**

```bash
java -cp /tmp/classes HelloBackend
```

**验证方式：** 先确认 `javac` 生成 `.class`，再由 `java -cp` 启动；本课 Docker 反馈环在两个 JDK
中都得到精确输出。

### 错误：在 Java 8 直接运行源码文件

**触发条件：** 在 Java 8 执行 `java HelloBackend.java`。

**原因：** source-file mode 从 Java SE 11 才提供；Java 8 把 `HelloBackend.java` 当作类名。

**后果：** launcher 报告找不到主类，程序没有进入 `main`，退出码为 1。

**错误示例：**

```bash
java HelloBackend.java
```

**正确写法：**

```bash
javac -encoding UTF-8 -d /tmp/classes HelloBackend.java
java -cp /tmp/classes HelloBackend
```

**验证方式：** Temurin 8u492 实测错误为 `Could not find or load main class HelloBackend.java`；
显式两步命令退出码均为 0。

### 错误：把 Java 25 默认产物直接交给 Java 8

**触发条件：** 用 JDK 25 默认设置编译，再用 Java 8 JVM 启动生成的 class。

**原因：** Java 25 class file major 为 69，Java 8 只识别到 52。

**后果：** JVM 在进入 `main` 前抛出 `UnsupportedClassVersionError`。

**错误示例：** 以下两行分别在 JDK 25 与 Java 8 环境执行。

```bash
javac -d /tmp/classes HelloBackend.java
java -cp /tmp/classes HelloBackend
```

**正确写法：** 以下两行分别在 JDK 25 与 Java 8 环境执行。

```bash
javac --release 8 -d /tmp/classes HelloBackend.java
java -cp /tmp/classes HelloBackend
```

**验证方式：** 本课用 Java 25 默认编译后交给 Java 8，实测退出 1，并明确报告 class file 69.0
高于可识别的 52.0；兼容产物仍需在真实 Java 8 环境复测。

### 错误：把 -source/-target 当成 --release

**触发条件：** 在现代 JDK 面向 Java 8 编译时只设置 `-source 8 -target 8`。

**原因：** `--release 8` 还会把编译可见 API 限定到目标平台；单独的 source/target 不等于这份
完整合同。

**后果：** class 版本可能看似兼容，却引用 Java 8 不存在的类型或方法，部署后才失败。

**错误示例：**

```bash
javac -source 8 -target 8 Example.java
```

**正确写法：**

```bash
javac --release 8 Example.java
```

**验证方式：** 对照 JDK 25 `javac --release` 与 Java 8 `javac` 的 Cross-Compilation Options；
最终产物在精确 Java 8 运行时再执行一次。

### 错误：把源码目录自动当成 classpath

**触发条件：** class 被写入独立目录，却在其他目录直接执行 `java HelloBackend`。

**原因：** 传统 launcher 按类名从用户 classpath 查找 class；源码存在不代表编译输出目录可见。

**后果：** 启动期报告找不到类，与源码语法是否正确无关。

**错误示例：**

```bash
cd /tmp
java HelloBackend
```

**正确写法：**

```bash
java -cp /tmp/classes HelloBackend
```

**验证方式：** 本课源码只读挂载在 `/workspace`，class 只写到 `/tmp/classes`，显式 classpath 后
两个版本都能启动。
:::

## 如何验证

复验时在 `/tmp` 的一次性目录创建脚本，固定使用本课签核中的 Eclipse Temurin 25 与 8 镜像
digest。源码目录只读挂载，编译输出只进入临时 Docker volume；脚本和 volume 均在结束时删除，
仓库不保留 fixture。成功标准是：

- Java 25 与 Java 8 的 `java -version`、`javac -version`、编译和运行退出码均为 0。
- 两个版本的标准输出都精确等于 `后端课程运行成功`。
- Java 8 source-file launch 以退出码 1 失败，且不能进入 `main`。
- Java 8 加载 Java 25 major 69 class 时以 `UnsupportedClassVersionError` 和退出码 1 失败。

编译期错误发生在 `javac`；classpath、入口或 class 版本问题通常在启动期暴露；进入 `main` 后
才发生的未捕获异常属于运行期。先判断阶段，再检查对应输入，比反复改代码更有效。

## 练习

:::exercise

### 练习：独立编译并启动第一个后端 Java 程序

**要求：** 使用显式输出目录编译 `HelloBackend.java`，再通过该目录作为 classpath 启动类；不要
把 `.java` 文件路径传给 Java 8 launcher。

**验收：** 编译和运行退出码均为 0，标准输出精确等于 `后端课程运行成功`，源码目录没有新增
`.class` 文件。

**参考答案：** 依次执行 `javac -encoding UTF-8 -d /tmp/classes HelloBackend.java` 和
`java -cp /tmp/classes HelloBackend`。
:::

## 本节小结

- JDK 是开发套件，JVM 是运行 class file 的抽象机器；Java 语言和 Java SE 是规范层合同。
- 推荐反馈环是 `.java -> javac -> .class -> java launcher -> JVM -> main`。
- 传统 `public static void main(String[] args)` 同时兼容 Java 25 和 Java 8，但不是 Java 25 唯一
  合法入口。
- Java 8 不支持 source-file launch，也不能加载 Java 25 默认生成的 major 69 class。
- 编译期、启动期和运行期错误发生在不同阶段，应分别检查源码、启动输入和程序行为。

## 参考资料

- [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) -
  核对现代 LTS 状态。
- [Getting Started with Java](https://dev.java/learn/getting-started) - 编译运行周期与 source-file mode
  的版本起点。
- [Java SE 8 Platform Overview](https://docs.oracle.com/javase/8/docs/technotes/guides/index.html) -
  JDK、JRE、JVM 与语言职责。
- [JLS 25 Chapter 12](https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html) - Java 25 启动与
  候选 `main` 规则。
- [JVMS 25 Chapter 4](https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-4.html) - class file
  格式和版本。
- [JVMS 25 Chapter 5](https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-5.html) - 装入、链接、
  初始化和启动。
- [JDK 25 java](https://docs.oracle.com/en/java/javase/25/docs/specs/man/java.html) 与
  [JDK 25 javac](https://docs.oracle.com/en/java/javase/25/docs/specs/man/javac.html) - 现代工具合同。
- [JLS 8 Chapter 12](https://docs.oracle.com/javase/specs/jls/se8/html/jls-12.html)、
  [Java 8 java](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/java.html) 与
  [Java 8 javac](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/javac.html) - legacy 启动与编译合同。
- [JEP 512](https://openjdk.org/jeps/512) - Java 25 启动协议演进的正式交付记录。
