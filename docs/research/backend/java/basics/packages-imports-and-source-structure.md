# 包、import 与源码目录研究记录

## 冻结课程合同

- `courseId`：`backend.java.learn.basics.packages-imports-and-source-structure`
- Phase B 编号：`B-02`
- `title`：包、import 与源码目录
- `purpose / collection / level / depth`：`learn / basics / beginner / lesson`
- `sequence`：`110`
- 冻结预计时长：45 分钟
- `prerequisites`：`backend.java.learn.basics.development-environment-and-runtime`（B-01）
- `necessaryPrerequisiteId`：`JAVA-PREREQ-002`
- `origin`：`necessary-prerequisite`
- Phase 2 冻结状态：`researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`；Phase B 的调整结果不回写冻结矩阵。

本课只建立普通编译单元、命名包、名称、`import`、源码根、输出根和 classpath 的最小关系。
不展开 Java Platform Module System（JPMS）、Maven 依赖解析、Spring Boot 包扫描或对象建模；不讲
B-03 的变量、类型、赋值和运算符。示例方法体作为已给定代码使用，学习者本课只观察类型名称如何被
编译器和 launcher 找到。

## 核验基线

| 项目 | 核验结果 |
| --- | --- |
| 官方来源复核日期 | 2026-08-14 |
| 外部资料发现 | Tavily 正常返回候选；最终逐项回到 Oracle、JLS、JDK 工具文档和 Dev.java 直接页面，不使用搜索摘要作证据 |
| 现代课程基线 | Java 25 LTS |
| legacy 课程基线 | Java 8；Spring Boot 2.3.12.RELEASE 仅作为项目背景 |
| 当前示例复验 | 本批使用固定 digest 的 Eclipse Temurin 25 与 8 JDK 容器，在 `/tmp` 完成成功和失败反馈环 |
| 项目证据 | Phase 2 没有为本课登记 `dzzz-app` 文件级证据，`projectEvidence` 保持空数组 |

旧稿记录的 2026-08-06 Temurin 容器与 `dzzz-app` HEAD 只属于历史批次，不能替代 2026-08-14 的
来源复核或当前示例复验。本课没有项目源码结论，因此不需要用旧项目 HEAD 支撑语言合同。

## B-02 冻结教学输入

### 学习目标

完成正文后，零基础学习者应能：

1. 说清普通编译单元中 `package`、`import` 和顶层类型声明的顺序与职责。
2. 区分简单名、完全限定名、包名、源码根目录和包目录。
3. 解释 `import` 只影响当前编译单元的名称解析，不下载依赖、不改变 classpath，也不会传递给其他
   源文件。
4. 识别 Java 8/25 共有的单类型 import、按需 import、单静态 import 和静态按需 import 四种
   非模块形式，并知道按需 import 不会递归导入子包。
5. 使用 `javac -d` 将两个命名包的源码编译到独立输出根，再以正确 classpath 和完全限定类名启动。
6. 说明“包名”和“源码目录”不是同一个语言合同：标准工程通常按包名映射目录，但显式交给
   `javac` 的源文件不必靠该目录关系才能声明包。
7. 识别缺少 import、声明顺序错误、classpath 根错误和按需 import 不递归四条失败路径，并能恢复
   到成功基线。
8. 说明 unnamed package 适合小型、临时或入门程序，不适合作为长期后端源码结构。

### 45 分钟教学节奏

| 时间 | 教学内容 | 可观察检查 |
| ---: | --- | --- |
| 5 分钟 | 从 B-01 的单文件程序过渡到两个命名包 | 学习者能指出“类型属于哪里”和“工具从哪里找”是两个问题 |
| 8 分钟 | 普通编译单元、包名、简单名与完全限定名 | 能从 `lesson.tasks.model.TaskText` 拆出包名和简单名 |
| 8 分钟 | `import` 作用域、四种共有非模块形式与隐式可用名称 | 能解释为什么 `java.lang` 可直接用、`java.util.*` 不包含子包 |
| 10 分钟 | 源码根、包目录、输出根与 classpath | 能从源码树推导 class 输出树和启动命令 |
| 9 分钟 | 任务管理示例的编译、检查和启动 | 输出精确等于 `任务：整理包结构` |
| 5 分钟 | 四条失败路径与 unnamed package 边界 | 能按“编译期还是启动期”定位并恢复 |

## 逐知识点教学输入

### 1. 普通编译单元中的声明顺序

**它是什么：** 普通编译单元通常对应一个 `.java` 文件，由可选的 package 声明、零个或多个
import 声明，以及零个或多个顶层类型声明按顺序组成。

**有什么作用：** 这个顺序先确定当前编译单元所属的包，再建立当前文件可使用的简单名，最后让类型
声明使用这些名称。顺序错误会在编译期失败。

**什么时候使用：** 长期项目中的普通类、接口等源文件都按这个结构组织。本课不讨论模块化编译单元。

**怎么使用：**

1. 如需命名包，先写 package 声明。
2. 再写当前文件需要的 import 声明。
3. 最后写顶层类型声明。

**最小示例：**

```java
package lesson.tasks.app;

import lesson.tasks.model.TaskText;

public final class Main {}
```

**预期结果：** 三类声明顺序合法；补全类体后可以交给 `javac` 编译。

**常见误区：** 不要写成“package 必须是源文件绝对第一行”。注释、空白以及 package 声明允许的
注解可能位于它之前；准确规则是普通编译单元中的 package 声明位于 import 和顶层类型声明之前，
并且一个普通编译单元至多有一个 package 声明。

### 2. 包名、简单名与完全限定名

**它是什么：** 包为类型建立命名空间。`lesson.tasks.model.TaskText` 是本课类型的完全限定名，
`lesson.tasks.model` 是包名，`TaskText` 是简单名。

**有什么作用：** 完全限定名把类型身份说完整，允许不同包各自拥有同名类型；简单名减少当前文件中
的重复文字。

**什么时候使用：** 声明类型归属时使用 package 声明；发生同名冲突、没有 import，或需要明确说明
类型身份时使用完全限定名。

**怎么使用：**

1. 在 `TaskText.java` 中声明 `package lesson.tasks.model;`。
2. 在其他包中使用 `lesson.tasks.model.TaskText`，或先单类型 import 后使用 `TaskText`。
3. 启动命名包中的主类时使用完全限定类名 `lesson.tasks.app.Main`。

**最小示例：** `lesson.tasks.model.TaskText.print();` 不依赖 import，也能明确指出目标类型。

**预期结果：** 编译器按完全限定名解析类型；launcher 按 `lesson.tasks.app.Main` 从 classpath 根查找
对应 class file。

**常见误区：** 包名不是磁盘目录本身，也不是项目依赖坐标。它首先是 Java 名称系统中的类型归属。

### 3. import 的作用域与四种共有非模块形式

**它是什么：** import 为当前编译单元引入可用的简单名。本课覆盖 Java 8/25 共有的单类型 import、
类型按需 import、单静态 import 和静态按需 import 四种非模块形式。Java 25 还定义了单模块 import
声明（`SingleModuleImportDeclaration`）；它属于 JPMS 范围，本课不展开，不能把前述四种形式当成
Java 25 的完整 import 合同。

```java
import lesson.tasks.model.TaskText;
import java.util.*;
import static java.lang.System.out;
import static java.lang.Math.*;
```

**有什么作用：** import 让当前文件可以写较短的名称；它不复制源码、不下载库、不修改 classpath，
也不把导入传递给其他 `.java` 文件。

**什么时候使用：** 当前编译单元引用其他包的可访问类型时，优先使用明确的单类型 import。需要同时
表达两个同名类型时，至少一个位置使用完全限定名。静态 import 只作为四种语法的边界说明，不进入
本课主示例。

**怎么使用：**

1. 确认依赖类型已经作为源码输入或位于编译器可查找路径中。
2. 在 package 声明之后写 `import lesson.tasks.model.TaskText;`。
3. 在当前文件中使用简单名 `TaskText`。

**最小示例：** 主示例的 `Main.java` 导入 `TaskText` 后执行 `TaskText.print();`。

**预期结果：** `Main.java` 中的 `TaskText` 解析到 `lesson.tasks.model.TaskText`；删除 import 后，
同一简单名无法解析，编译非零退出。

**常见误区：** `import java.util.*;` 只按需导入 `java.util` 中可访问的类型，不会递归导入
`java.util.concurrent`。`java.lang` 中的类型和当前包中的可访问类型可以直接使用，是语言规定的
名称可见性，不代表所有包都会自动导入。

### 4. 源码根、包目录、输出根与 classpath

**它是什么：** 源码根是包目录之前的查找起点；包目录是项目按包名建立的常见物理映射；输出根是
`javac -d` 接收 class file 的起点；classpath 根是编译器或 launcher 查找已编译类型的起点。

**有什么作用：** 分清四个位置，才能解释源文件在哪里、编译结果写到哪里，以及启动器如何从完全
限定类名找到 class file。

**什么时候使用：** 多文件编译、把源码与产物分离、启动命名包主类时都需要明确这些根目录。

**怎么使用：**

1. 把 `src` 作为源码根，按包名创建 `src/lesson/tasks/model` 和 `src/lesson/tasks/app`。
2. 创建空的 `classes` 输出根，显式把两个源文件交给 `javac`，并用 `-d classes` 指定它。
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

**预期结果：** `javac -d classes` 按 package hierarchy 写出两个 class file；launcher 以
`classes` 为根，将 `lesson.tasks.app.Main` 解析到对应 class file。

**常见误区：** classpath 应指向输出根 `classes`，不是 `Main.class` 文件，也不是
`classes/lesson/tasks`。`import` 不能修复错误的 classpath。

### 5. 包名与源码目录的精确边界

**它是什么：** package 声明决定编译单元中的包归属；文件系统目录是 host system、编译器或构建
工具组织与发现编译单元的方式。两者常常按点号到目录分隔符的规则映射，但不是同一个语言声明。

**有什么作用：** 这个边界既保留标准工程布局，也避免把工具约定误写成 Java 语法的绝对要求。

**什么时候使用：** 项目源码应保持包目录一致，便于 IDE、构建工具和人查找；诊断时则要区分“源码
明确作为输入”和“编译器需要按 source path 自动发现源码”两种情况。

**怎么使用：**

1. 正文主线始终采用 `src/lesson/tasks/model/TaskText.java` 对应
   `package lesson.tasks.model;` 的标准布局。
2. 边界验证可把同一声明放在临时目录 `loose/TaskText.java`，再将该文件路径显式传给 `javac`。
3. 检查 `-d classes` 仍按 package 声明生成 `classes/lesson/tasks/model/TaskText.class`。

**最小示例：**

```bash
mkdir -p classes
javac -encoding UTF-8 -d classes loose/TaskText.java
```

`loose/TaskText.java` 内仍声明 `package lesson.tasks.model;`。

**预期结果：** 显式源码输入可以编译，产物路径按包名生成。这只证明语言和输出合同，不建议在长期
项目中故意让源码目录与包名错位。

**常见误区：** 不应写“只要源文件目录不匹配包名，`javac` 就一定失败”。当编译器需要通过
source path 自动查找源码时，目录映射会直接影响发现结果；当文件被显式列为输入时，结论不同。

### 6. unnamed package 的适用边界

**它是什么：** 没有 package 声明的普通编译单元属于 unnamed package。

**有什么作用：** 它降低单文件入门或临时程序的组织成本，但不提供长期项目需要的命名层次。

**什么时候使用：** 小型、临时或教学起步程序可以使用；多文件后端项目和可复用库应使用命名包。

**怎么使用：** B-01 的单文件程序可以没有 package；从本课的两包示例开始，为长期源码明确声明
命名包并使用完全限定类名启动。

**最小示例：** `public final class Scratch {}` 没有 package 声明，因此属于 unnamed package。

**预期结果：** 该文件可作为小型独立源码编译；它不进入本课任务管理示例的命名包结构。

**常见误区：** unnamed package 不是“自动选择了项目根包”，也不应作为长期后端业务结构。

## 最小任务管理示例与成功反馈环

示例只新增“任务文本类型位于 model 包，启动入口位于 app 包”的可观察行为。`print` 和 `main` 的
方法体作为已给定代码，不在本课解释变量、类型、赋值或运算符。

### 文件一：`src/lesson/tasks/model/TaskText.java`

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

### 文件二：`src/lesson/tasks/app/Main.java`

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

### 成功反馈环

从同时包含 `src` 和待生成 `classes` 的临时工作目录执行：

```bash
mkdir -p classes
javac -encoding UTF-8 -d classes \
  src/lesson/tasks/model/TaskText.java \
  src/lesson/tasks/app/Main.java

find classes -type f -name '*.class' -print | sort
java -cp classes lesson.tasks.app.Main
```

预期 class 文件：

```text
classes/lesson/tasks/app/Main.class
classes/lesson/tasks/model/TaskText.class
```

预期标准输出：

```text
任务：整理包结构
```

## 冻结失败路径

| 失败路径 | 触发方式 | 阶段与现象 | 原因 | 恢复方式 | Java 25 / 8 验收 |
| --- | --- | --- | --- | --- | --- |
| 缺少 import | 删除 `Main.java` 的 `import lesson.tasks.model.TaskText;`，仍使用简单名 `TaskText` | 编译期找不到符号，`javac` 非零退出 | 两个类型不在同一包，当前编译单元没有获得该简单名 | 恢复单类型 import，或在调用处使用完全限定名 | 两版本都必须失败；恢复后成功 |
| package/import 顺序错误 | 把 import 写到 package 声明之前 | 编译期语法错误，`javac` 非零退出 | 普通编译单元要求 package 声明位于 import 之前 | 先写 package，再写 import | 两版本都必须失败；恢复后成功 |
| classpath 根错误 | 成功编译后执行 `java -cp classes/lesson/tasks lesson.tasks.app.Main` | 启动期找不到或无法装入主类，`java` 非零退出 | launcher 需要从能容纳完整包层级的输出根开始查找 | 使用 `java -cp classes lesson.tasks.app.Main` | 两版本都必须失败；恢复后输出成功文本 |
| 按需 import 不递归 | 只写 `import java.util.*;`，再使用简单名 `TimeUnit` | 编译期找不到 `TimeUnit`，`javac` 非零退出 | 类型按需 import 不导入指定包的子包 | 导入 `java.util.concurrent.TimeUnit` 或使用完全限定名 | 两版本都必须失败；恢复后成功 |

缺少 import 的失败只证明当前编译单元无法解析简单名，不证明 classpath 一定错误；错误 classpath 的
失败发生在已成功编译后的启动阶段。正文应要求学习者先判断阶段，再修改对应位置。

## 现代主线与 legacy 对照

| 对比项 | Java 25 主线 | Java 8 补充 | 本课处理 |
| --- | --- | --- | --- |
| 普通编译单元 | package、import、顶层类型声明 | 同样的基本结构 | 使用同一份双包源码 |
| import 形式 | 本课四种共有非模块形式；另有单模块 import 声明 | 四种共有非模块形式；没有单模块 import 声明 | 主示例只使用单类型 import，单模块 import 不展开 |
| `javac -d` | 按 package hierarchy 生成 class 子目录 | 同样按包层级输出 | 两版本检查相同的相对产物路径 |
| classpath 启动 | 输出根加完全限定主类名 | 同样适用 | 两版本执行同一启动命令 |
| unnamed package | 仍存在 | 存在 | 只作为小型、临时或入门程序边界 |
| JPMS | Java 25 规范包含模块与单模块 import 规则 | Java 8 尚无 JPMS | 本课只声明范围，不展开 |
| Spring Boot 2.3.12 | 不属于现代主线 | 仅冻结项目背景 | 不从框架目录推出语言规则 |

## 结论与直接证据

| 结论 | 来源直接页面 | 页内章节 | 适用版本 | 验证方式 |
| --- | --- | --- | --- | --- |
| Java 25 是 LTS 发布 | [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) | Oracle Java SE Product Releases | 2026-08-14 页面状态 | 页面正文列出 Java SE 8、11、17、21、25 为 LTS |
| 简单名、限定名、完全限定名和名称作用域由语言规范定义 | [JLS 25 Chapter 6](https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html) | 6.2、6.3、6.5、6.7 | Java SE 25 | 主示例分别使用 `TaskText` 与 `lesson.tasks.model.TaskText` |
| 普通编译单元按 package、import、顶层类型声明的顺序组成 | [JLS 25 Chapter 7](https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html) | 7.3 Compilation Units | Java SE 25 | 正确顺序编译成功，import 在 package 前时非零退出 |
| Java 8/25 共有四种非模块 import 声明；Java 25 另有单模块 import 声明；import 作用域限于包含它的编译单元 | [JLS 25 Chapter 6](https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html)；[JLS 25 Chapter 7](https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html) | 6.3；7.5.1-7.5.5 | Java SE 25 | 本课只复验四种共有非模块形式中的名称解析与按需 import 边界 |
| `java.lang` 和当前包中的类型有直接使用名称的规则 | [Dev.java Packages](https://dev.java/learn/packages/)；[JLS 25 Chapter 7](https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html) | Using Packages；7.3 | 当前教学资料；Java SE 25 | 主示例直接使用 `System`，不增加 `java.lang.System` import |
| package 与源码目录不是同一个语言合同，存储关系由 host system 决定 | [JLS 25 Chapter 7](https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html) | 7.2 Host Support for Packages and Modules；7.3 | Java SE 25 | 显式编译错位目录中的源码，产物仍按 package hierarchy 输出 |
| `javac -d` 指定 class 输出根，并按包层级创建子目录 | [The javac Command - JDK 25](https://docs.oracle.com/en/java/javase/25/docs/specs/man/javac.html) | Standard Options for javac - `-d`；source path 与 class path 说明 | JDK 25 | 检查两个 class 文件的相对路径 |
| `java -cp` 从 classpath 查找完全限定主类 | [The java Command - JDK 25](https://docs.oracle.com/en/java/javase/25/docs/specs/man/java.html) | Synopsis；Standard Options for Java - `--class-path` | JDK 25 | 正确输出根启动成功，错误根启动失败 |
| unnamed package 面向小型、临时或入门程序 | [Dev.java Packages](https://dev.java/learn/packages/)；[JLS 25 Chapter 7](https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html) | Unnamed Packages；7.4.2 | 当前教学资料；Java SE 25 | 只作为 B-01 单文件与本课命名包的结构对照 |
| Java 8 具有对应的名称、package 和四种 import 合同 | [JLS 8 Chapter 6](https://docs.oracle.com/javase/specs/jls/se8/html/jls-6.html)；[JLS 8 Chapter 7](https://docs.oracle.com/javase/specs/jls/se8/html/jls-7.html) | 6.3、6.7；7.3-7.5 | Java SE 8 | 同一组成功和失败 fixture 在 Java 8 复验 |
| Java 8 的 `javac -d` 和 classpath 启动可完成同一反馈环 | [Java 8 javac](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/javac.html)；[Java 8 java](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/java.html) | `-d`；`-classpath` | JDK 8 | 检查产物树并运行 `lesson.tasks.app.Main` |

外部关键词发现严格使用 Tavily。候选 URL 获取后，通过 Tavily Extract 回到 Oracle、JLS、JDK 工具
文档和 Dev.java 的官方直接页面核验；本批 Tavily 可用，因此没有进入 Exa、Parallel、Perplexity
或原生 Web 搜索。搜索摘要、社区文章和 AI 输出均未作为结论证据。

## 正文 frontmatter 可采用的来源卡

下列来源卡只包含本课实际使用的直接页面。正文改写时可以按 loader 合同直接采用，并将
`estimatedMinutes` 与 `verifiedAt` 同步为本批冻结值。

```yaml
estimatedMinutes: 45
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
      - 普通编译单元的 package、import 和顶层类型声明顺序
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
```

## `/tmp` 双版本验收合同

验证资产必须通过 `mktemp -d /tmp/java-b02.XXXXXX` 建立，并在成功或失败退出时清理；仓库中不新增
Java fixture、测试文件、class 或日志。

1. 固定 modern 与 legacy JDK 容器 digest，记录 `java -version`、`javac -version` 和架构。
2. 创建本课 `TaskText.java` 与 `Main.java`，分别在 Java 25 和 Java 8 执行成功反馈环。
3. 对两个版本断言 class 相对路径精确等于本课列出的两项，标准输出精确等于
   `任务：整理包结构`。
4. 把 `TaskText.java` 放入与包名不匹配的 `loose` 目录，显式把文件交给 `javac`；断言编译成功且
   `-d` 产物仍进入 `lesson/tasks/model`。
5. 分别触发缺少 import、package/import 顺序错误和按需 import 不递归；两个版本都必须在编译期
   非零退出，再为 `TimeUnit` 增加显式单类型 import 并确认恢复成功。
6. 成功编译后分别使用错误 classpath 根启动；两个版本都必须在启动期非零退出。恢复正确输出根后
   必须再次成功。
7. 清理整个临时目录，再确认目录不存在，仓库目标范围内没有新增验证资产。

## B-02 当前示例验证记录

下表和输出来自 2026-08-14 当前 B-02 批次。源码、脚本、class 与诊断信息只位于 `/tmp` 一次性
目录，复验后已删除，仓库中没有保留验证资产。

| 角色 | 请求镜像 | 本次固定 digest | 实际版本 |
| --- | --- | --- | --- |
| modern | `eclipse-temurin:25-jdk` | `sha256:12e44624adee6808a36d962717e1656e0afeeeff5a100f9cb00e0136513558f0` | `25.0.3+9-LTS` |
| legacy | `eclipse-temurin:8-jdk` | `sha256:c8b86f2c0a9bd6cc1b7fabc5d1a097501a166eea7cad3b2764e90e96178bea9b` | `1.8.0_492-b09` |

两者都是 Docker Official Image `eclipse-temurin` 的 Linux AArch64 JDK 镜像；当前记录固定到上述
digest。Docker client/server 为 29.6.1，engine 架构为 arm64。

```text
Java 25:
javac 25.0.3
成功编译 -> exit 0
class 相对路径 -> lesson/tasks/app/Main.class, lesson/tasks/model/TaskText.class
正确 classpath 启动 -> 任务：整理包结构，exit 0
缺少 import -> exit 1
package/import 顺序错误 -> exit 1
按需 import 不递归 -> exit 1
增加显式 TimeUnit import -> exit 0
错误 classpath 根 -> exit 1
错位源码目录显式编译 -> exit 0，预期 package hierarchy class 存在
恢复正确 classpath -> 任务：整理包结构，exit 0

Java 8:
javac 1.8.0_492
成功编译 -> exit 0
class 相对路径 -> lesson/tasks/app/Main.class, lesson/tasks/model/TaskText.class
正确 classpath 启动 -> 任务：整理包结构，exit 0
缺少 import -> exit 1
package/import 顺序错误 -> exit 1
按需 import 不递归 -> exit 1
增加显式 TimeUnit import -> exit 0
错误 classpath 根 -> exit 1
错位源码目录显式编译 -> exit 0，预期 package hierarchy class 存在
恢复正确 classpath -> 任务：整理包结构，exit 0
```

退出码的具体非零数值是当前 `javac` / `java` 实现的观察结果；课程合同只要求失败路径非零退出，
不把 `1` 或 `2` 写成所有 JDK 实现必须返回的语言规范。

## 项目证据边界

Phase 2 没有为本课登记 `projectEvidence`。本课不把 `dzzz-app` 的目录、类名或旧写法升级为语言
规范，也不复制项目源码。Spring Boot 常见的 `src/main/java` 目录属于后续构建和框架课程要说明的
工程约定，不能反推为 Java 语言强制布局。

## 被排除或尚未证实的说法

- 不写“package 必须是文件绝对第一行”；只写普通编译单元中它位于 import 和顶层类型声明之前。
- 不写“源码路径与包名不一致就一定无法编译”；区分显式源码输入与 source path 自动发现。
- 不把 import 描述为依赖安装、classpath 配置、源码复制或跨编译单元共享机制。
- 不把按需 import 描述为递归导入子包，也不声称它自动解决同名类型冲突。
- 不把 unnamed package 推荐为长期后端项目结构。
- 不从 `dzzz-app` 推导普遍语言规则，不虚构 `projectEvidence`。
- 不展开 JPMS、module declaration、module path、Maven、Spring 包扫描或构建目录约定。
- 不讲 B-03 的变量、类型、赋值或运算符；示例方法体仅作为已给定代码运行。

## 发布自检

- [x] B-02、45 分钟、B-01 前置和稳定 ID 与 Phase A 冻结合同一致。
- [x] 现代 Java 25 在前，Java 8 / Spring Boot 2.3.12.RELEASE 仅作 legacy 补充。
- [x] 每个知识点均包含是什么、作用、场景、用法、最小示例、预期结果和常见误区。
- [x] 包名与源码目录的关系没有被误写为同一个语言合同。
- [x] 任务管理示例不提前教授 B-03，所有显式 Java 方法定义上方都有中文 Javadoc。
- [x] 四条失败路径均冻结触发方式、阶段、原因、恢复方式和双版本验收。
- [x] 关键结论绑定当前官方直接页面，正文来源卡可以直接采用。
- [x] `projectEvidence` 保持为空，不虚构 `dzzz-app` 文件证据。
- [x] Java 25 / 8 当前双版本成功与失败反馈环已执行并记录。
- [x] 格式、diff、URL 可访问性和最终 SHA 已核对；临时资产已清理。
- [x] 停止在 B-02 research，不修改正文、track、loader、signoff，不进入 B-03 或 JPMS。
