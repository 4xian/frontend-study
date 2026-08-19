---
id: backend.java.learn.basics.classes-objects-and-immutability
type: lesson
title: 类与对象
summary: 从命令行任务清单出发，用类描述任务结构，用对象保存每一项任务的独立状态
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 100
prerequisites:
  - backend.java.learn.basics.command-line-task-manager-project
objectives:
  - 能区分类声明、运行时对象和保存对象引用的变量。
  - 能在类中声明实例字段与实例方法，并用点号访问具体对象的成员。
  - 能使用 new 创建多个对象，并说明每个对象为什么拥有独立的实例字段。
  - 能识别两个变量引用同一对象的别名关系，并观察经任一引用发生的状态变化。
  - 能分别在 JDK 25 与 Java 8 中运行完整的 TeamFlow 类与对象程序。
recap:
  - 类声明一种自定义引用类型，字段描述状态，实例方法描述对象能够执行的操作。
  - new 每次创建一个新对象并返回引用，引用变量用于找到并操作该对象。
  - 同一类创建的不同对象各自拥有一份实例字段，修改一个对象不会自动改变另一个对象。
  - 引用赋值只复制引用值，不复制对象；两个别名会观察到同一个对象的变化。
  - JDK 25 与 Java 8 都支持本课采用的传统类、对象、字段、实例方法和 new 写法。
related: []
tags:
  - Java
  - 类
  - 对象
  - 实例字段
  - 实例方法
  - 对象引用
appliesTo: Java 25；兼容示例适用于 Java 8
verifiedAt: 2026-08-17
sources:
  - id: dev-java-creating-classes
    title: Dev.java - Creating Classes
    url: https://dev.java/learn/classes-objects/creating-classes/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java；Java SE
    claims:
      - 类体包含字段和方法等成员，字段为类及其对象提供状态，方法描述行为
      - 字段声明由修饰符、类型和名称组成；本课只使用已经学过的类型和名称
  - id: dev-java-creating-objects
    title: Dev.java - Creating and Using Objects
    url: https://dev.java/learn/classes-objects/creating-objects/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java；Java SE
    claims:
      - 引用变量声明、new 创建对象和对象初始化是创建并使用对象的基本步骤
      - new 返回对象引用，点号可通过具体对象引用访问实例字段和调用实例方法
      - 同一类型的不同对象各自拥有一份实例字段
  - id: jls-25-objects
    title: Java Language Specification 25 - Objects
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.3.1
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 对象是类的实例，引用值用于指向对象
      - 类类型属于引用类型，本课变量保存的是对象引用而不是对象副本
  - id: jls-25-class-instance-creation
    title: Java Language Specification 25 - Class Instance Creation Expressions
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.9
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 类实例创建表达式创建新的类实例
  - id: jls-25-initial-values
    title: Java Language Specification 25 - Initial Values of Variables
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.12.5
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 实例字段在对象创建时取得默认值，其中 boolean 字段的默认值为 false
      - 局部变量必须在使用前通过初始化或赋值取得可用值
  - id: jls-25-top-level-declarations
    title: Java Language Specification 25 - Top Level Class and Interface Declarations
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html#jls-7.6
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25；普通文件系统项目
    claims:
      - 文件系统实现可以要求 public 顶层类位于同名源文件中，因此一份源文件至多承载一个这样的类型
  - id: oracle-java-8-classes
    title: Oracle Java Tutorials - Classes
    url: https://docs.oracle.com/javase/tutorial/java/javaOO/classes.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: JDK 8 教程；基础类声明同样适用于 Java 25
    claims:
      - Java 8 教程使用字段与方法展示类声明的基本结构
  - id: oracle-java-8-objects
    title: Oracle Java Tutorials - Objects
    url: https://docs.oracle.com/javase/tutorial/java/javaOO/objects.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: JDK 8 教程；基础对象创建与使用同样适用于 Java 25
    claims:
      - Java 8 程序可以创建多个对象并通过方法调用让对象协作
  - id: jls-8-objects
    title: Java Language Specification 8 - Objects
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-4.html#jls-4.3.1
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 同样把对象定义为类的实例，并使用引用值指向对象
  - id: jls-8-initial-values
    title: Java Language Specification 8 - Initial Values of Variables
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-4.html#jls-4.12.5
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 对实例字段默认值与局部变量先赋值规则采用相同合同
  - id: stackoverflow-classes-references-objects
    title: What are classes, references, and objects?
    url: https://stackoverflow.com/questions/9224517/what-are-classes-references-and-objects
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 初学者对类、对象和引用的常见混淆
    claims:
      - 初学者容易把类、对象和引用混为一谈，课程需要把三者放在同一可运行示例中对照
      - 引用赋值可让两个变量指向同一对象，不会自动复制对象
---

# 类与对象

上一课的命令行任务清单用 `String[]` 保存标题、用 `boolean[]` 保存完成状态，再靠相同索引把两份数据
拼成一项任务。程序可以运行，但“标题和完成状态共同组成任务”只存在于编写者的约定里。

本课把一项任务声明成一种 Java 类型。类负责描述任务拥有哪些状态、能够执行什么操作；对象则是程序
运行时真正存在的某一项任务。我们仍然只做内存中的 TeamFlow 示例，不引入集合、文件、Maven、Spring
Boot 或业务框架。

构造方法与 `this`、封装与访问控制、`static` 与 `final` 都有各自的后续课程。本课只把 `new Type()`
作为固定创建形式使用，不提前解释或改写构造方法。

## 一、从并行数组走向任务类型

### 1. 类把一类数据和操作写在一起

类是源代码中的类型声明。下面的 `TaskCard` 描述每一张任务卡都拥有标题和完成状态，并能把自己标记为
已完成、生成一行摘要：

```java
class TaskCard {
    String title = "未命名任务";
    boolean completed;

    /**
     * 把当前任务标记为已完成。
     */
    void markCompleted() {
        completed = true;
    }

    /**
     * 返回当前任务的一行摘要。
     *
     * @return 任务摘要
     */
    String summary() {
        return (completed ? "[x] " : "[ ] ") + title;
    }
}
```

`class TaskCard` 声明一种名为 `TaskCard` 的自定义引用类型。花括号中的 `title`、`completed` 是实例
字段，用来保存一张任务卡的状态；`markCompleted()`、`summary()` 是实例方法，用来操作或读取某个
具体对象。

这段声明只说明“任务卡这种对象长什么样”，还没有创建任何任务卡。就像 `String` 是类型、某段具体文本
才是值一样，`TaskCard` 是类型，运行时创建出来的任务卡才是对象。

### 2. 字段描述对象需要保存的状态

字段写在类体中、方法之外。本课使用两个实例字段：

| 字段 | 类型 | 在 TeamFlow 中表示什么 | 初始表现 |
| --- | --- | --- | --- |
| `title` | `String` | 一项任务的标题 | 字段初始化为“未命名任务” |
| `completed` | `boolean` | 任务是否完成 | 没有显式赋值时为 `false` |

同一个类创建出的每个对象都有自己的一份实例字段。第一张卡可以保存“完成登录页联调”，第二张卡可以
同时保存“整理 API 文档”；它们不会因为类型相同就自动共享标题或完成状态。

字段初始化器 `String title = "未命名任务";` 只为新对象提供一个便于观察的初始值。本课不展开对象
初始化顺序，如何要求调用方在创建时提供标题会在下一课的构造方法中处理。

### 3. 实例方法描述对象能够执行的操作

`markCompleted()` 没有接收“要改哪一张卡”的额外参数。调用它时，点号左边的对象已经确定了操作目标：

```java
TaskCard first = new TaskCard();
TaskCard second = new TaskCard();
first.title = "完成登录页联调";
second.title = "整理 API 文档";

first.markCompleted();

System.out.println(first.summary());
System.out.println(second.summary());
```

预期输出：

```text
[x] 完成登录页联调
[ ] 整理 API 文档
```

`first.markCompleted()` 只把 `first` 对象的 `completed` 改为 `true`。`second` 是另一个对象，因此它的
字段仍保持原值。实例方法不是一段脱离对象的全局操作，它总是由某个具体对象接收调用。

## 二、创建并使用第一个对象

### 1. 声明引用变量不等于创建对象

下面一行只声明变量的类型和名称：

```java
TaskCard task;
```

它告诉编译器：`task` 将用来保存一个 `TaskCard` 对象的引用。此时没有执行 `new`，因此也没有新的
`TaskCard` 对象可供访问。局部变量还没有可用值，不能马上写 `task.title`。

把声明、创建和保存引用写在一起，才能得到可操作的对象：

```java
TaskCard task = new TaskCard();
```

从左到右可以这样读：

1. `TaskCard` 是变量的类型。
2. `task` 是引用变量名。
3. `new TaskCard()` 创建一个新的 `TaskCard` 对象并得到它的引用。
4. `=` 把这个引用保存到 `task` 中。

`TaskCard()` 后的括号是本课固定使用的创建形式。为什么没有自己编写这段同名代码仍能创建对象，留到
下一课《构造方法与 this》解释。

### 2. 点号选择具体对象的成员

引用变量保存对象位置后，可以用点号选择该对象的字段或方法：

```java
task.title = "完成登录页联调";
task.markCompleted();
System.out.println(task.summary());
```

三行代码分别完成：

1. 找到 `task` 引用的对象，把它的 `title` 改成 TeamFlow 任务标题。
2. 找到同一个对象，调用它的 `markCompleted()` 方法。
3. 调用同一个对象的 `summary()`，把返回的字符串交给 `println`。

字段访问写成 `对象.字段`，方法调用写成 `对象.方法(参数)`。即使方法没有参数，调用时也不能省略
圆括号；圆括号表示“现在执行这个方法”。

### 3. 每次 new 都创建新的实例

连续执行两次 `new TaskCard()` 会得到两个不同对象：

```java
TaskCard first = new TaskCard();
TaskCard second = new TaskCard();

first.title = "完成登录页联调";
second.title = "整理 API 文档";

System.out.println(first.summary());
System.out.println(second.summary());
System.out.println(first == second);
```

预期输出：

```text
[ ] 完成登录页联调
[ ] 整理 API 文档
false
```

两个对象的类型都为 `TaskCard`，但它们拥有不同的运行时身份和各自的实例字段。这里的 `==` 只用来
观察两个引用是否指向同一个对象，不用来判断任务内容是否相同；对象内容相等属于后面的
《Object、equals 与 hashCode》课程。

## 三、理解对象引用与别名

### 1. 引用赋值不会复制对象

`TaskCard selected = first;` 不会创建新的任务卡。它只把 `first` 保存的引用值复制给 `selected`：

```java
TaskCard first = new TaskCard();
first.title = "完成登录页联调";

TaskCard selected = first;
selected.markCompleted();

System.out.println(first.summary());
System.out.println(first == selected);
```

预期输出：

```text
[x] 完成登录页联调
true
```

`first` 和 `selected` 是两个变量，却指向同一个对象。经 `selected` 改变完成状态后，经 `first` 读取到的
也是新状态。这种“多个引用指向同一对象”的关系称为引用别名。

### 2. 变量、引用和对象是三个不同角色

可以把运行时关系画成下面这样：

```text
first -----+
           +----> TaskCard 对象 { title="完成登录页联调", completed=true }
selected --+

second ----------> TaskCard 对象 { title="整理 API 文档", completed=false }
```

变量是源代码中可使用的名称，引用是变量当前保存的值，对象是运行时承载字段状态的实例。给变量重新
赋引用只会改变“这个变量现在指向哪里”，不会自动复制旧对象的字段。

### 3. 修改前先确认点号左边是谁

当程序中有多个相同类型的对象时，最直接的检查方法是读出每条语句点号左边的变量：

```java
first.markCompleted();
System.out.println(second.summary());
```

第一行修改 `first`，第二行观察 `second`。如果本来想完成第二项任务，错误地在第一行使用 `first`，
程序会正常运行，却改变错误的对象。此类问题不需要引入复杂调试知识，先把对象名称和预期操作目标逐行
对照即可。

命名也应反映对象角色。`firstTask`、`selectedTask` 比 `a`、`b` 更容易看出引用关系；本课示例为了展示
顺序使用 `first`、`second`，完整项目中应选择更贴近业务的名称。

## 四、在 IDEA 中完成最小 TeamFlow 对象程序

### 1. 创建文件并核对项目 JDK

1. 打开上一课使用的普通 Java 项目，进入 **File -> Project Structure -> Project**。
2. JDK 25 练习把 **Project SDK** 设为 JDK 25，并在 **Modules -> Dependencies** 核对模块 SDK。
3. 在 `src` 上右键，选择 **New -> Java Class**，输入 `TeamFlowObjectDemo`。
4. 保留 `public class TeamFlowObjectDemo` 作为启动类，在同一文件上方增加不带 `public` 的 `TaskCard`。
5. 运行前确认右上角运行配置选择 `TeamFlowObjectDemo`，不要运行上一课的命令行类。

一个 `.java` 文件可以包含这里使用的两个顶层类，但文件名必须与 `public` 启动类一致，所以文件名是
`TeamFlowObjectDemo.java`。访问控制的完整规则不在本课展开。

### 2. 填写最小可运行代码

```java
class TaskCard {
    String title = "未命名任务";
    boolean completed;

    /**
     * 把当前任务标记为已完成。
     */
    void markCompleted() {
        completed = true;
    }

    /**
     * 返回当前任务的一行摘要。
     *
     * @return 任务摘要
     */
    String summary() {
        return (completed ? "[x] " : "[ ] ") + title;
    }
}

public class TeamFlowObjectDemo {
    /**
     * 创建并使用第一张 TeamFlow 任务卡。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        TaskCard task = new TaskCard();
        task.title = "完成登录页联调";

        System.out.println(task.summary());
        task.markCompleted();
        System.out.println(task.summary());
    }
}
```

点击 `main` 左侧运行图标，选择 **Run 'TeamFlowObjectDemo.main()'**。控制台应输出：

```text
[ ] 完成登录页联调
[x] 完成登录页联调
```

第一行证明新对象的完成状态起初为 `false`；调用 `markCompleted()` 后，同一个对象的字段变为 `true`，
第二次 `summary()` 因此生成不同标记。类声明没有重复执行，变化发生在运行时对象中。

### 3. 核对运行的类和实际对象

若控制台仍显示上一课的“命令：add”提示，说明运行配置指向旧类。停止程序，在编辑器中打开
`TeamFlowObjectDemo`，从当前 `main` 左侧重新运行。

若两行输出完全相同，依次核对：

1. `task.markCompleted();` 是否真的位于两次输出之间。
2. `markCompleted()` 内是否写了 `completed = true;`。
3. 两次 `summary()` 点号左边是否都是同一个 `task`。

这些检查只确认当前课程的对象与调用目标，不重复此前《错误定位》和《断点调试》的完整方法。

## 五、版本选择与课程边界

### 1. JDK 25 与 Java 8 使用相同对象写法

本课采用的传统类声明、实例字段、实例方法、`new TaskCard()`、点号访问与引用赋值，在 JDK 25 和
Java 8 中都可用。主示例继续使用传统 `public static void main(String[] args)`，因此两版完整代码的
业务部分相同。

这里没有为了制造差异而改写语法。Java 25 还有更简洁的启动形式，但它不改变类、对象和引用的基本
合同，也不是本课重点。

### 2. Java 8 项目必须真正选择 JDK 8

兼容验证使用独立普通 Java 项目或独立模块：

1. 在 **Project Structure -> SDKs** 中确认已经存在 JDK 8；本课不安装或修改系统 JDK。
2. 把兼容项目的 **Project SDK** 和模块 SDK 都改为 JDK 8。
3. 打开 **Run -> Edit Configurations**，把当前运行配置的 JRE 设为项目 JDK 8。
4. 运行后在 IDEA 控制台上方核对实际 Java 路径；终端还可用 `java -version` 复核当前 shell 的版本。

终端显示 JDK 25、IDEA 项目使用 JDK 8 并不矛盾，它们是两个独立选择。声称完成 Java 8 验证时，必须
核对实际编译和运行所用的 JDK，不能只改源码文字。

### 3. 后续课程分别承担什么

本课故意不提前展开：

- 如何自己声明构造方法、为什么使用 `this`：下一课《构造方法与 this》。
- 为什么字段应设为 `private`、哪些成员能被外部访问：后续《封装与访问控制》。
- 哪些成员属于类、`static` 与 `final` 的含义：后续《static 与 final》。
- 枚举、继承、接口、多态、`equals/hashCode`、record：各自后续课程。
- 集合、文件、Spring Boot、HTTP 和数据库：不属于当前对象入门范围。

## 六、常见错误

:::pitfalls
### 只声明引用变量就访问字段

**触发条件：** 在方法中写出 `TaskCard task;` 后，未执行 `new` 就访问 `task.title`。

**原因：** 声明引用变量只创建了一个局部变量名称，没有创建 `TaskCard` 对象，也没有为局部变量提供可用
引用。

**后果：** 源码无法通过编译，程序不会产生 TeamFlow 输出。

**错误示例：**

```java
TaskCard task;
task.title = "完成登录页联调";
```

**正确写法：** 用 `new TaskCard()` 创建对象并把返回的引用保存到变量后，再访问字段。

```java
TaskCard task = new TaskCard();
task.title = "完成登录页联调";
```

**验证方式：** 先编译错误片段，确认编译器拒绝未初始化的局部变量；恢复正确写法后运行并输出任务标题。

### 把引用赋值当成对象复制

**触发条件：** 已有 `first` 后写 `TaskCard second = first;`，却希望 `second` 是一张独立的新任务卡。

**原因：** 引用赋值只复制对象引用，`first` 和 `second` 指向同一个对象。

**后果：** 经 `second` 修改标题或完成状态后，经 `first` 读取也会看到相同变化，两项任务意外合并为同一
对象。

**错误示例：**

```java
TaskCard first = new TaskCard();
first.title = "完成登录页联调";
TaskCard second = first;
second.title = "整理 API 文档";
```

**正确写法：** 需要独立任务时再次执行 `new TaskCard()`。

```java
TaskCard first = new TaskCard();
first.title = "完成登录页联调";
TaskCard second = new TaskCard();
second.title = "整理 API 文档";
```

**验证方式：** 输出 `first == second`；错误版本为 `true`，正确版本为 `false`，并分别输出两个标题。

### 在错误的对象上调用方法

**触发条件：** 程序准备完成第二项任务，却写成 `first.markCompleted()`。

**原因：** 实例方法的接收对象由点号左边决定，变量名写错就会操作另一份实例状态。

**后果：** 程序可以正常运行，但完成标记出现在错误任务上。

**错误示例：**

```java
TaskCard selected = second;
first.markCompleted();
```

**正确写法：** 对准备操作的引用调用方法。

```java
TaskCard selected = second;
selected.markCompleted();
```

**验证方式：** 分别输出 `first.summary()` 和 `second.summary()`；只有第二项应显示 `[x]`。

### 调用实例方法时漏写圆括号

**触发条件：** 把方法名当成字段，写出 `task.markCompleted;` 或 `task.summary`。

**原因：** 字段访问与方法调用语法不同；圆括号表示执行方法，即使方法没有参数也必须保留。

**后果：** 源码无法编译，状态不会发生变化。

**错误示例：**

```java
task.markCompleted;
System.out.println(task.summary);
```

**正确写法：** 方法名后写出参数列表；无参数方法使用空圆括号。

```java
task.markCompleted();
System.out.println(task.summary());
```

**验证方式：** 正确版本先调用 `markCompleted()`，再输出摘要，结果必须以 `[x]` 开头。

### 同一文件声明两个 public 顶层类

**触发条件：** 在 `TeamFlowClassApplication.java` 中同时写 `public class TaskCard` 和
`public class TeamFlowClassApplication`。

**原因：** 当前普通项目的一份源文件不能这样承载两个各自要求同名文件的 `public` 顶层类。

**后果：** 编译器要求把 `TaskCard` 放进同名文件，当前完整程序无法编译。

**错误示例：**

```java
public class TaskCard {
}

public class TeamFlowClassApplication {
}
```

**正确写法：** 本课把辅助类型 `TaskCard` 留为不带 `public` 的顶层类，只让启动类与文件同名。

```java
class TaskCard {
}

public class TeamFlowClassApplication {
}
```

**验证方式：** 文件名保持 `TeamFlowClassApplication.java`，编译成功后运行同名启动类。
:::

## 七、运行 JDK 25 完整程序

### 1. 配置 IDEA 并创建启动类

1. 在 JDK 25 普通 Java 项目中确认 Project SDK、模块 SDK 和运行配置 JRE 都为 JDK 25。
2. 在 `src` 上右键选择 **New -> Java Class**，创建 `TeamFlowClassApplication`。
3. 将下面代码完整写入 `TeamFlowClassApplication.java`；不要另外创建同名 `public TaskCard` 文件。
4. 从 `TeamFlowClassApplication.main()` 左侧运行，观察两个对象和一个引用别名的输出。

### 2. 完整代码

```java
class TaskCard {
    int taskNumber;
    String title = "未命名任务";
    boolean completed;

    /**
     * 把当前任务标记为已完成。
     */
    void markCompleted() {
        completed = true;
    }

    /**
     * 返回当前任务的一行摘要。
     *
     * @return 带编号和状态的任务摘要
     */
    String summary() {
        String mark = completed ? "[x]" : "[ ]";
        return "#" + taskNumber + " " + mark + " " + title;
    }
}

public class TeamFlowClassApplication {
    /**
     * 创建两项独立任务，并通过别名完成第二项任务。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        TaskCard first = new TaskCard();
        first.taskNumber = 1;
        first.title = "完成登录页联调";

        TaskCard second = new TaskCard();
        second.taskNumber = 2;
        second.title = "整理 API 文档";

        TaskCard selected = second;
        selected.markCompleted();

        System.out.println("TeamFlow 任务对象");
        System.out.println(first.summary());
        System.out.println(second.summary());
        System.out.println("selected 与 second 指向同一对象：" + (selected == second));
        System.out.println("first 与 second 指向同一对象：" + (first == second));
    }
}
```

### 3. 预期控制台输出

```text
TeamFlow 任务对象
#1 [ ] 完成登录页联调
#2 [x] 整理 API 文档
selected 与 second 指向同一对象：true
first 与 second 指向同一对象：false
```

`first` 和 `second` 分别接收两次 `new` 的结果，所以它们指向不同对象。`selected = second` 只复制引用，
因此 `selected.markCompleted()` 改变的是第二项任务。第一项仍为待办，两个身份检查也与引用关系一致。

### 4. 用终端核对同一程序

在源码目录依次执行：

```bash
javac TeamFlowClassApplication.java
java TeamFlowClassApplication
```

`javac` 读取同一文件中的两个类声明并生成相应 class 文件，`java` 启动包含传统 `main` 的
`TeamFlowClassApplication`。本课只核对运行结果，不重新展开编译流程。

## 八、运行 Java 8 完整程序

### 1. 切换独立兼容项目

1. 使用独立普通 Java 项目，把 Project SDK、模块 SDK 和运行配置 JRE 都设为 JDK 8。
2. 创建 `TeamFlowClassApplication.java`，完整填写下面的 Java 8 版本。
3. 运行 `TeamFlowClassApplication.main()`，核对控制台输出与 JDK 25 版本一致。
4. 若终端复核，先执行 `java -version` 与 `javac -version`，确认两者都显示 1.8 系列。

### 2. 完整兼容代码

```java
class TaskCard {
    int taskNumber;
    String title = "未命名任务";
    boolean completed;

    /**
     * 把当前任务标记为已完成。
     */
    void markCompleted() {
        completed = true;
    }

    /**
     * 返回当前任务的一行摘要。
     *
     * @return 带编号和状态的任务摘要
     */
    String summary() {
        String mark = completed ? "[x]" : "[ ]";
        return "#" + taskNumber + " " + mark + " " + title;
    }
}

public class TeamFlowClassApplication {
    /**
     * 创建两项独立任务，并通过别名完成第二项任务。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        TaskCard first = new TaskCard();
        first.taskNumber = 1;
        first.title = "完成登录页联调";

        TaskCard second = new TaskCard();
        second.taskNumber = 2;
        second.title = "整理 API 文档";

        TaskCard selected = second;
        selected.markCompleted();

        System.out.println("TeamFlow 任务对象");
        System.out.println(first.summary());
        System.out.println(second.summary());
        System.out.println("selected 与 second 指向同一对象：" + (selected == second));
        System.out.println("first 与 second 指向同一对象：" + (first == second));
    }
}
```

### 3. 兼容版输出与执行解释

```text
TeamFlow 任务对象
#1 [ ] 完成登录页联调
#2 [x] 整理 API 文档
selected 与 second 指向同一对象：true
first 与 second 指向同一对象：false
```

Java 8 对传统类、实例字段、实例方法、对象创建和引用赋值采用与本课 JDK 25 示例相同的基础语义，
所以这里给出完整但等价的代码。两个版本都必须真的选择相应 JDK 运行，不能用 JDK 25 的输出代替
Java 8 验证。

## 九、练习与参考实现

:::exercise
### 练习：用三个对象建立任务看板

**要求：** 声明 `BoardTask` 类，包含编号、标题和完成状态三个实例字段，以及 `markCompleted()`、
`summary()` 两个实例方法。启动类必须执行三次 `new BoardTask()` 创建三个独立对象，再让 `selected`
引用第三个对象并通过该引用完成第三项任务。不得声明构造方法，不使用 `this`、`private`、`static` 字段、
`final`、数组或集合。

**验收：** 依次输出三项任务，只有第三项显示 `[x]`；随后输出 `selected 与 third 指向同一对象：true`
和 `first 与 third 指向同一对象：false`。JDK 25 与 Java 8 都要使用各自正确的 Project SDK、模块 SDK
和运行配置 JRE。

**参考答案：** 两个版本的完整实现分别放在 directive 后；每个实例方法和启动方法都带中文 Javadoc。
:::

### 1. JDK 25 参考实现

```java
class BoardTask {
    int taskNumber;
    String title = "未命名任务";
    boolean completed;

    /**
     * 把当前看板任务标记为已完成。
     */
    void markCompleted() {
        completed = true;
    }

    /**
     * 返回当前看板任务的一行摘要。
     *
     * @return 带编号和状态的任务摘要
     */
    String summary() {
        String mark = completed ? "[x]" : "[ ]";
        return "#" + taskNumber + " " + mark + " " + title;
    }
}

public class TeamFlowObjectPractice {
    /**
     * 创建三项独立任务并验证第三项的引用别名。
     *
     * @param args 启动参数，本练习不使用
     */
    public static void main(String[] args) {
        BoardTask first = new BoardTask();
        first.taskNumber = 1;
        first.title = "完成登录页联调";

        BoardTask second = new BoardTask();
        second.taskNumber = 2;
        second.title = "整理 API 文档";

        BoardTask third = new BoardTask();
        third.taskNumber = 3;
        third.title = "准备演示";

        BoardTask selected = third;
        selected.markCompleted();

        System.out.println(first.summary());
        System.out.println(second.summary());
        System.out.println(third.summary());
        System.out.println("selected 与 third 指向同一对象：" + (selected == third));
        System.out.println("first 与 third 指向同一对象：" + (first == third));
    }
}
```

### 2. Java 8 参考实现

```java
class BoardTask {
    int taskNumber;
    String title = "未命名任务";
    boolean completed;

    /**
     * 把当前看板任务标记为已完成。
     */
    void markCompleted() {
        completed = true;
    }

    /**
     * 返回当前看板任务的一行摘要。
     *
     * @return 带编号和状态的任务摘要
     */
    String summary() {
        String mark = completed ? "[x]" : "[ ]";
        return "#" + taskNumber + " " + mark + " " + title;
    }
}

public class TeamFlowObjectPractice {
    /**
     * 创建三项独立任务并验证第三项的引用别名。
     *
     * @param args 启动参数，本练习不使用
     */
    public static void main(String[] args) {
        BoardTask first = new BoardTask();
        first.taskNumber = 1;
        first.title = "完成登录页联调";

        BoardTask second = new BoardTask();
        second.taskNumber = 2;
        second.title = "整理 API 文档";

        BoardTask third = new BoardTask();
        third.taskNumber = 3;
        third.title = "准备演示";

        BoardTask selected = third;
        selected.markCompleted();

        System.out.println(first.summary());
        System.out.println(second.summary());
        System.out.println(third.summary());
        System.out.println("selected 与 third 指向同一对象：" + (selected == third));
        System.out.println("first 与 third 指向同一对象：" + (first == third));
    }
}
```

### 3. 运行步骤与预期结果

JDK 25 项目和 Java 8 项目都创建 `TeamFlowObjectPractice.java`，分别粘贴对应完整代码，从当前文件的
`main` 左侧运行。两个控制台都必须输出：

```text
#1 [ ] 完成登录页联调
#2 [ ] 整理 API 文档
#3 [x] 准备演示
selected 与 third 指向同一对象：true
first 与 third 指向同一对象：false
```

三次 `new` 产生三个独立对象，所以完成第三项不会改变第一、第二项。`selected = third` 只增加一个指向
第三项的引用，经 `selected` 调用实例方法后，经 `third` 读取到相同完成状态。

## 十、本节小结

- 类声明一种自定义引用类型，实例字段保存对象状态，实例方法描述对象操作。
- `new` 创建对象并返回引用，引用变量保存找到该对象所需的引用值。
- 同一类的不同对象各自拥有一份实例字段，点号左边决定访问或调用哪一个对象。
- 引用赋值不会复制对象，多个别名会观察到同一对象的状态变化。
- JDK 25 与 Java 8 都能运行本课的传统类与对象代码；构造、封装和类级成员留给后续课程。
