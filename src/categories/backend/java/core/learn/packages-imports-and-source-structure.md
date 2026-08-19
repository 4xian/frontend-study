---
id: backend.java.learn.basics.packages-imports-and-source-structure
type: lesson
title: 包、import 与源码目录
summary: 用包名、import 和源码根目录组织可编译、可复用的 Java 类型
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 45
prerequisites:
  - backend.java.learn.basics.development-environment-and-runtime
objectives:
  - 能解释编译单元中 package、import 和顶层类型的顺序与职责。
  - 能区分简单名、完全限定名、包名、源码根目录、包目录和 classpath。
  - 能在 Java 25 与 Java 8 编译两包最小示例。
  - 能识别 import 不传递、按需 import 不递归、classpath 根错误和 unnamed package 的边界。
recap:
  - package 声明决定命名空间，源码目录是工具组织和发现编译单元的常见方式。
  - import 只作用于当前编译单元，不是全局依赖，也不会递归进入子包。
  - javac 的输出根目录与 java 的 classpath 应保持一致。
  - unnamed package 只适合小型或临时代码，不适合作为后端长期结构。
related: []
tags:
  - Java
  - package
  - import
  - 编译单元
  - 源码目录
appliesTo: Java 25；Java 8 / Spring Boot 2.3.12.RELEASE legacy 背景
modernBaseline:
  java: '25'
legacyBaseline:
  java: '8'
  springBoot: 2.3.12.RELEASE
verifiedAt: 2026-08-14
sources:
  - id: oracle-java-support-roadmap
    title: Java SE Support Roadmap
    url: https://www.oracle.com/java/technologies/java-se-support-roadmap.html
    sourceType: official-reference
    appliesTo: Java SE support lifecycle checked 2026-08-14
    claims:
      - Java 25 is an LTS release
  - id: jls-25-names
    title: Java Language Specification 25 - Names
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 简单名、限定名、完全限定名与名称作用域
      - import 声明只影响包含它的编译单元
  - id: jls-25-packages
    title: Java Language Specification 25 - Packages and Modules
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html
    sourceType: specification
    appliesTo: Java SE 25 ordinary compilation units only
    claims:
      - 普通编译单元的 package、import 和顶层类型结构
      - Java 8/25 共有的四种非模块 import、Java 25 单模块 import 与 unnamed package 合同
      - package 与 compilation unit 存储关系由 host system 决定
  - id: dev-java-packages
    title: Packages - Dev.java
    url: https://dev.java/learn/packages/
    sourceType: official-reference
    appliesTo: Current Java learning guidance checked 2026-08-14
    claims:
      - package、import、java.lang 与当前包的入门解释
      - unnamed package 适合小型、临时或入门程序
  - id: javac-25
    title: The javac Command - JDK 25
    url: https://docs.oracle.com/en/java/javase/25/docs/specs/man/javac.html
    sourceType: official-reference
    appliesTo: JDK 25
    claims:
      - -d 输出根、package hierarchy、source path 与 class path 合同
  - id: java-25
    title: The java Command - JDK 25
    url: https://docs.oracle.com/en/java/javase/25/docs/specs/man/java.html
    sourceType: official-reference
    appliesTo: JDK 25
    claims:
      - classpath 与完全限定主类的启动合同
  - id: jls-8-names
    title: Java Language Specification 8 - Names
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-6.html
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 的名称与 import 作用域合同
  - id: jls-8-packages
    title: Java Language Specification 8 - Packages
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-7.html
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 的普通编译单元、四种 import 与 unnamed package 合同
  - id: javac-8
    title: javac - Java 8 Compiler
    url: https://docs.oracle.com/javase/8/docs/technotes/tools/unix/javac.html
    sourceType: official-reference
    appliesTo: JDK 8
    claims:
      - Java 8 的 -d 输出目录与编译查找路径
  - id: java-8
    title: java - Java 8 Launcher
    url: https://docs.oracle.com/javase/8/docs/technotes/tools/unix/java.html
    sourceType: official-reference
    appliesTo: JDK 8
    claims:
      - Java 8 的 classpath 与主类启动合同
projectEvidence: []
---

# 包、import 与源码目录

## 为什么需要学习

上一课已经看到 `javac` 产出 class file。真实后端不会把几百个类型都放在同一个默认目录里，而是用
包名避免同名冲突，用 `import` 让当前文件可读，再用源码根目录和输出目录保持编译器、启动器的查找
路径一致。本课解决的是“这个类型属于哪里，以及编译器去哪里找它”。

## 学习目标

- 能解释编译单元中 `package`、`import` 和顶层类型的顺序与职责。
- 能区分简单名、完全限定名、包名、源码根目录、包目录和 classpath。
- 能在 Java 25 与 Java 8 编译两包最小示例。
- 能识别 import 不传递、按需 import 不递归、classpath 根错误和 unnamed package 的边界。

## 前置术语

- **编译单元**：通常就是一个 `.java` 源文件，包含 package、import 和顶层声明。
- **源码根目录**：包目录之前的目录，例如 `src`；它不是包名本身。
- **完全限定名**：包名加类型名，例如 `lesson.tasks.model.TaskText`。
- **classpath**：编译器或 launcher 查找已编译类型的位置集合。

## 零基础知识点详解

### 普通编译单元中的声明顺序

**它是什么：** 普通编译单元通常对应一个 `.java` 文件，由可选的 `package` 声明、零个或多个
`import` 声明，以及零个或多个顶层类型声明按顺序组成。

**有什么作用：** 这个顺序先确定当前文件所属的包，再建立当前文件可使用的简单名，最后让类型声明
使用这些名称。顺序错误会在编译期失败。

**什么时候使用：** 长期项目中的普通类、接口等源文件都按这个结构组织。本课不讨论模块化编译单元。

**怎么使用：**

1. 如需命名包，先写 `package` 声明。
2. 再写当前文件需要的 `import` 声明。
3. 最后写顶层类型声明。

**最小示例：**

```java
package lesson.tasks.app;

import lesson.tasks.model.TaskText;

public final class Main {}
```

**运行结果：** 三类声明顺序合法；补全类体后可以交给 `javac` 编译。

**常见误区：** 不要写成“`package` 必须是文件绝对第一行”。准确规则是普通编译单元中的
`package` 声明位于 `import` 和顶层类型声明之前，并且至多有一个 `package` 声明。

### 包名、简单名与完全限定名

**它是什么：** 包为类型建立命名空间。`lesson.tasks.model.TaskText` 是完全限定名，
`lesson.tasks.model` 是包名，`TaskText` 是简单名。

**有什么作用：** 完全限定名把类型身份说完整，允许不同包各自拥有同名类型；简单名减少当前文件中
的重复文字。

**什么时候使用：** 声明类型归属时使用 `package`；发生同名冲突、没有 `import`，或需要明确说明
类型身份时使用完全限定名。

**怎么使用：**

1. 在 `TaskText.java` 中声明 `package lesson.tasks.model;`。
2. 在其他包中使用 `lesson.tasks.model.TaskText`，或先单类型 import 后使用 `TaskText`。
3. 启动命名包中的主类时使用完全限定类名 `lesson.tasks.app.Main`。

**最小示例：** `lesson.tasks.model.TaskText.print();` 不依赖 import，也能明确指出目标类型。

**运行结果：** 编译器按完全限定名解析类型；launcher 按 `lesson.tasks.app.Main` 从 classpath 根
查找对应 class file。

**常见误区：** 包名不是磁盘目录本身，也不是项目依赖坐标。它首先是 Java 名称系统中的类型归属。

### import 的作用域与四种共有非模块形式

**它是什么：** import 为当前编译单元引入可用的简单名。本课覆盖 Java 8/25 共有的单类型 import、
类型按需 import、单静态 import 和静态按需 import 四种非模块形式。Java 25 还定义了单模块 import
声明（`SingleModuleImportDeclaration`）；它属于 JPMS 范围，本课不展开，不能把前述四种形式当成
Java 25 的完整 import 合同。

**有什么作用：** import 让当前文件可以写较短的名称；它不复制源码、不下载库、不修改 classpath，
也不把导入传递给其他 `.java` 文件。

**什么时候使用：** 当前文件引用其他包的可访问类型时，优先使用明确的单类型 import。需要同时表达
两个同名类型时，至少一个位置使用完全限定名。静态 import 只作为语法边界说明，不进入主示例。

**怎么使用：**

1. 确认依赖类型已经作为源码输入或位于编译器可查找路径中。
2. 在 `package` 声明之后写 `import lesson.tasks.model.TaskText;`。
3. 在当前文件中使用简单名 `TaskText`。

**最小示例：**

```java
import lesson.tasks.model.TaskText;
import java.util.*;
import static java.lang.System.out;
import static java.lang.Math.*;
```

**运行结果：** 主示例导入后，`TaskText` 解析到 `lesson.tasks.model.TaskText`；删除 import 后，
同一简单名无法解析，编译非零退出。

**常见误区：** `import java.util.*;` 不会递归导入 `java.util.concurrent`。`java.lang` 和当前包中的
可访问类型可以直接使用，不代表所有包都会自动导入。

### 源码根、包目录、输出根与 classpath

**它是什么：** 源码根是包目录之前的起点；包目录是项目按包名建立的常见物理映射；输出根是
`javac -d` 接收 class file 的起点；classpath 根是编译器或 launcher 查找已编译类型的起点。

**有什么作用：** 分清四个位置，才能解释源文件在哪里、编译结果写到哪里，以及启动器如何从完全
限定类名找到 class file。

**什么时候使用：** 多文件编译、把源码与产物分离、启动命名包主类时都需要明确这些根目录。

**怎么使用：**

1. 把 `src` 作为源码根，按包名创建 `src/lesson/tasks/model` 和 `src/lesson/tasks/app`。
2. 显式把两个源文件交给 `javac`，并用 `-d classes` 指定输出根。
3. 检查 `classes` 下按包名生成的 class 子目录。
4. 用 `java -cp classes lesson.tasks.app.Main` 启动。

**最小示例：**

```text
src/lesson/tasks/model/TaskText.java
src/lesson/tasks/app/Main.java
  -> javac -d classes ...
classes/lesson/tasks/model/TaskText.class
classes/lesson/tasks/app/Main.class
```

**运行结果：** `javac -d classes` 按包层级写出两个 class file；launcher 以 `classes` 为根，将
`lesson.tasks.app.Main` 解析到对应 class file。

**常见误区：** classpath 应指向输出根 `classes`，不是 `Main.class` 文件，也不是
`classes/lesson/tasks`。import 不能修复错误的 classpath。

### 包名与源码目录的精确边界

**它是什么：** `package` 声明决定编译单元中的包归属；文件系统目录是 host system、编译器或构建
工具组织与发现编译单元的方式。两者常常按点号到目录分隔符的规则映射，但不是同一个语言声明。

**有什么作用：** 这个边界既保留标准工程布局，也避免把工具约定误写成 Java 语法的绝对要求。

**什么时候使用：** 项目源码应保持包目录一致，便于 IDE、构建工具和人查找；诊断时则要区分“显式
给出源码路径”和“让编译器通过 source path 自动发现源码”。

**怎么使用：**

1. 正文主线采用 `src/lesson/tasks/model/TaskText.java` 对应
   `package lesson.tasks.model;` 的标准布局。
2. 边界验证可把同一声明放在 `loose/TaskText.java`，再显式把文件路径交给 `javac`。
3. 检查 `-d classes` 仍按包名生成 `classes/lesson/tasks/model/TaskText.class`。

**最小示例：** `javac -encoding UTF-8 -d classes loose/TaskText.java`。

**运行结果：** 显式源码输入可以编译，产物路径仍按包名生成。这不等于推荐长期项目故意错放源码。

**常见误区：** 不应写“源码路径与包名不一致就一定失败”。编译器自动发现源码和显式接收源码路径
是不同场景。

### unnamed package 的适用边界

**它是什么：** 没有 `package` 声明的普通编译单元属于 unnamed package。

**有什么作用：** 它降低单文件入门或临时程序的组织成本，但不提供长期项目需要的命名层次。

**什么时候使用：** 小型、临时或教学起步程序可以使用；多文件后端项目和可复用库应使用命名包。

**怎么使用：** B-01 的单文件程序可以没有 `package`；从本课的两包示例开始，为长期源码明确声明
命名包并使用完全限定类名启动。

**最小示例：** `public final class Scratch {}` 没有 `package` 声明，因此属于 unnamed package。

**运行结果：** 该文件可作为小型独立源码编译；它不进入本课任务管理示例的命名包结构。

**常见误区：** unnamed package 不是“自动选择了项目根包”，也不适合作为长期后端业务结构。

## 现代版本中的正确用法

Java 25 的普通编译单元仍然可以按这个顺序理解：可选 `package`，零个或多个 `import`，零个或多个
顶层类或接口声明。现代版本新增的简化源文件能力不改变本课要建立的长期项目结构，因此示例继续
使用普通编译单元。

包名是命名空间。`package lesson.tasks.model;` 使类型的完全限定名成为
`lesson.tasks.model.TaskText`。目录 `src/lesson/tasks/model` 是常见的文件系统映射；`src` 才是
源码根目录。显式把源文件路径交给 `javac` 时，源码所在目录不决定 package 声明；长期项目仍应保持
目录与包名一致，让工具和人都能稳定找到文件。

`import` 只给当前源文件提供简单名：

- `import lesson.tasks.model.TaskText;` 导入一个类型。
- `import java.util.*;` 是按需导入，只覆盖 `java.util` 这个包的可导入类型，不会覆盖子包。
- `import static java.lang.Math.max;` 导入一个静态成员。
- `import static java.lang.Math.*;` 按需导入一个类型的可访问静态成员。

这四项是 Java 8/25 共有的非模块 import 形式。Java 25 另有单模块 import 声明，本课只标明这条
版本边界，不展开 JPMS 或该声明的用法。

同一个简单名冲突时，使用完全限定名比猜测 import 更清楚。

`java.lang` 和当前包的可见类型由语言平台自动提供名称便利；这不是所有包都自动可见的理由。

## 基本语法

下面把任务文本类型放进命名包：

```java
package lesson.tasks.model;

/**
 * 输出任务管理示例的固定文本。
 */
public final class TaskText {
    /**
     * 输出本课的任务文本。
     */
    public static void print() {
        System.out.println("任务：整理包结构");
    }
}
```

另一个包通过 import 使用它：

```java
package lesson.tasks.app;

import lesson.tasks.model.TaskText;

/**
 * 启动任务管理示例。
 */
public final class Main {
    /**
     * 运行跨包调用并输出任务文本。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        TaskText.print();
    }
}
```

编译和启动时，源码根目录是 `src`，输出根目录是单独的 `classes`：

```bash
mkdir -p classes
javac -encoding UTF-8 -d classes \
  src/lesson/tasks/model/TaskText.java \
  src/lesson/tasks/app/Main.java
java -cp classes lesson.tasks.app.Main
```

`-d classes` 生成 `classes/lesson/tasks/model/TaskText.class` 和
`classes/lesson/tasks/app/Main.class`；launcher 必须使用完全限定的 `lesson.tasks.app.Main`。

## 从零跟着做

这次从一个只包含练习目录的可写父目录开始，使用 Java 25 完成主线，再用 Java 8 复核同一普通编译
单元合同。不要把两个类型放在同一目录。

1. **核验 JDK。** 执行 `java -version` 与 `javac -version`，确认主线使用 Java 25；复核 legacy 时
   两条命令都应显示 Java 8。
2. **创建工作目录。** 新建并进入 `java-packages`，确认当前位置就是后续 `src` 与 `classes` 的共同
   父目录。
3. **创建包目录。** 建立 `src/lesson/tasks/model` 和 `src/lesson/tasks/app`。此时 `src` 是源码根，
   不属于包名。
4. **创建精确文件。** 把 `TaskText` 完整代码写入
   `src/lesson/tasks/model/TaskText.java`，把 `Main` 完整代码写入
   `src/lesson/tasks/app/Main.java`。逐项核对路径、package 声明和公开类名。
5. **编译到独立输出根。** 在 `java-packages` 先执行 `mkdir -p classes`，再执行本节
   `javac -d classes` 命令。成功时命令退出码为 0，且生成两个与包名一致的 class 文件。
6. **用完全限定名启动。** 执行 `java -cp classes lesson.tasks.app.Main`，标准输出应精确等于
   `任务：整理包结构`。
7. **触发并恢复 import 失败。** 暂时删除 `Main.java` 的单类型 import，再编译并观察“找不到符号”；
   恢复 import 后，使用同一命令应重新编译成功。
8. **触发并恢复 classpath 失败。** 执行
   `java -cp classes/lesson/tasks lesson.tasks.app.Main`，启动应非零退出；恢复 `-cp classes` 后应再次
   输出成功文本。
9. **清理一次性产物。** 当前课程验证完成后，确认目标是练习目录中的 `classes`，再使用
   `find classes -depth -delete` 删除编译产物；需要重跑时执行第 5 步即可恢复。

完成标准是：你能从 `package lesson.tasks.app;` 推导标准源码目录，能说明 import 不会复制代码，
也能说明为什么启动命令需要输出根和完全限定主类名。

## 如何使用

1. 先写 package 声明，再写 import，最后写类型声明。
2. 从源码根目录计算包目录，不要把 `src` 写进 package 名。
3. 用明确的 `-d` 输出目录编译，并把同一个输出根目录交给 `-cp`。
4. 启动时使用完全限定类名；不要用源文件路径代替类名。
5. 多个源文件各自声明自己需要的 import；同包也不意味着其他文件的 import 会共享。

## 适用与不适用场景

命名包和显式源码根目录适合后端项目、可复用库和多文件练习。不建议把 unnamed package 用作长期
业务结构，也不要把 `import` 当成依赖管理器：它不会下载库、不会改变 classpath，也不会递归导入
子包。Maven 的 `src/main/java` 只是后续构建课程会介绍的工程约定，本课先验证底层 Java 合同。

## Java 8 / Spring Boot 2.3 兼容写法

同一组 `lesson.tasks.model.TaskText` 和 `lesson.tasks.app.Main` 可以直接用 Java 8 编译。Java 8
没有本课不需要的现代简化源文件能力，但普通 package、本课覆盖的四种共有非模块 import、`-d` 和
classpath 合同相同。Java 25 另有 Java 8 不具备的单模块 import 声明，本课不展开。Spring Boot
2.3 的项目源码通常位于 `src/main/java`，这里只把它当作旧项目背景，不把框架目录约定写成 Java
语言规则。

## 新旧版本差异

| 对比项 | Java 25 | Java 8 | 本课选择 |
| --- | --- | --- | --- |
| 普通编译单元 | package、import、顶层声明 | 同样的普通结构 | 使用可跨版本结构 |
| import 形式 | 本课四种共有非模块形式；另有单模块 import 声明 | 四种共有非模块形式；没有单模块 import 声明 | 主示例只使用单类型 import，单模块 import 不展开 |
| unnamed package | 可用于小型临时代码 | 可用于小型临时代码 | 不作为后端长期结构 |
| 简化源文件 | Java 25 另有简化能力 | 不支持 | 不影响包目录入门示例 |

## 当前项目补充：证据边界

冻结矩阵没有为本课登记 `dzzz-app` 文件级证据，所以这里只保留“后续需要阅读项目分包”的学习
动机，不展示项目类名、路径或旧写法。这样可以把项目选择理由与语言规范证据分开，避免把一次项目
实现误教成普遍规则。

## 易错点

:::pitfalls

### 错误：把 import 写在 package 前面

**触发条件：** 先写 `import lesson.tasks.model.TaskText;`，再写 `package lesson.tasks.app;`。

**原因：** 普通编译单元的 package 声明位于 import 之前。

**后果：** 编译期报错，当前文件没有按预期归入包。

**错误示例：**

```java
import lesson.tasks.model.TaskText;
package lesson.tasks.app;
```

**正确写法：**

```java
package lesson.tasks.app;

import lesson.tasks.model.TaskText;
```

**验证方式：** 在 Java 25 和 Java 8 中编译，错误顺序必须非零退出。

### 错误：认为 import 会传给同包的其他文件

**触发条件：** 只在 `Main.java` 导入 `TaskText`，在 `Other.java` 中直接使用简单名。

**原因：** import 的作用域只覆盖包含该声明的编译单元。

**后果：** `Other.java` 找不到 `TaskText` 的简单名。

**错误示例：**

```java
package lesson.tasks.app;

public final class Other {
    /**
     * 尝试输出未导入类型中的文本。
     */
    public static void print() {
        TaskText.print();
    }
}
```

**正确写法：**

```java
package lesson.tasks.app;

import lesson.tasks.model.TaskText;

public final class Other {
    /**
     * 输出已经正确导入类型中的文本。
     */
    public static void print() {
        TaskText.print();
    }
}
```

**验证方式：** 先把 `TaskText.java` 编译到 `classes`，再用 `-cp classes` 编译未导入的
`Other.java`，退出码必须非零；补上 import 后用同一 classpath 再次编译。

### 错误：把按需 import 当成递归导入

**触发条件：** 只写 `import java.util.*;`，然后使用简单名 `TimeUnit`。

**原因：** 按需 import 只覆盖指定包，不覆盖子包。

**后果：** 编译器无法解析子包类型。

**错误示例：**

```java
import java.util.*;

public final class TimeoutUnit {
    /**
     * 输出错误地依赖递归导入的类型。
     */
    public static void print() {
        System.out.println(TimeUnit.SECONDS);
    }
}
```

**正确写法：**

```java
import java.util.concurrent.TimeUnit;

public final class TimeoutUnit {
    /**
     * 输出已经正确导入的类型。
     */
    public static void print() {
        System.out.println(TimeUnit.SECONDS);
    }
}
```

**验证方式：** 使用最小源文件分别编译错误和正确版本。

### 错误：把包目录当成 classpath 根

**触发条件：** 已成功编译，却执行
`java -cp classes/lesson/tasks lesson.tasks.app.Main`。

**原因：** launcher 会把完全限定类名转换成 `lesson/tasks/app/Main.class`；classpath 必须从包含
这段完整相对路径的输出根开始。

**后果：** 启动期找不到或无法装入主类，程序尚未进入 `main`。

**错误示例：**

```bash
java -cp classes/lesson/tasks lesson.tasks.app.Main
```

**正确写法：**

```bash
java -cp classes lesson.tasks.app.Main
```

**验证方式：** 两个 JDK 都先用错误根确认非零退出，再恢复 `classes` 并确认输出成功文本。
:::

## 如何验证

在 `/tmp` 使用 `mktemp -d /tmp/java-b02.XXXXXX` 建立一次性目录，把“基本语法”的两个文件放入
对应 `src` 路径。Java 25 与 Java 8 都执行同一组检查：

```bash
fixture_dir="$(mktemp -d /tmp/java-b02.XXXXXX)"
trap 'find "$fixture_dir" -depth -delete' EXIT
mkdir -p \
  "$fixture_dir/src/lesson/tasks/model" \
  "$fixture_dir/src/lesson/tasks/app" \
  "$fixture_dir/classes"
javac -encoding UTF-8 -d "$fixture_dir/classes" \
  "$fixture_dir/src/lesson/tasks/model/TaskText.java" \
  "$fixture_dir/src/lesson/tasks/app/Main.java"
find "$fixture_dir/classes" -type f -name '*.class' -print | sort
java -cp "$fixture_dir/classes" lesson.tasks.app.Main
```

预期 class 相对路径精确为 `lesson/tasks/app/Main.class` 与
`lesson/tasks/model/TaskText.class`，标准输出精确为 `任务：整理包结构`。随后分别按“易错点”触发
缺少 import、声明顺序错误、按需 import 不递归和错误 classpath 根，要求非零退出；每次恢复正确
源码或 `-cp classes` 后必须重新成功。另把 `TaskText.java` 放入 `loose` 目录并显式编译，确认
`-d` 仍按 package hierarchy 写出 class。签核完成后用 `find "$fixture_dir" -depth -delete` 清理，
并确认目录不存在。

:::exercise
### 练习：把两个类型放进不同包

**要求：** 创建 `lesson.tasks.model.TaskText` 和 `lesson.tasks.app.Main`，让 `Main` 通过单类型
import 调用 `TaskText`，并使用 `javac -d` 与 `java -cp` 运行。

**验收：** 输出 `任务：整理包结构`，并能在输出目录中找到两个与包名一致的 class 文件。

**参考答案：** 使用本课的两个最小类；`Main.java` 必须自己声明
`import lesson.tasks.model.TaskText;`。
:::

## 本节小结

- package 声明决定命名空间，源码目录是工具组织和发现编译单元的常见方式。
- import 只作用于当前编译单元，不是全局依赖，也不递归进入子包。
- `javac -d` 和 `java -cp` 必须共享同一个输出根目录，启动时使用完全限定类名。
- unnamed package 适合短小临时程序，不适合作为后端长期结构。
