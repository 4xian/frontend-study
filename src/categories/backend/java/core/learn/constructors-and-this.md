---
id: backend.java.learn.basics.constructors-and-this
type: lesson
title: 构造方法与 this
summary: 让 TeamFlow 任务对象在创建时接收必需状态，并用 this 区分字段、参数和构造入口
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 110
prerequisites:
  - backend.java.learn.basics.classes-objects-and-immutability
objectives:
  - 能声明无参和带参构造方法，并说明构造方法与普通方法的语法区别。
  - 能根据 new 后的实参判断会调用哪个构造方法。
  - 能区分编译器提供的默认构造方法与自己声明的无参构造方法。
  - 能使用 this.field 区分当前对象字段和同名参数。
  - 能使用 this(...) 把多个构造入口委托到一条完整初始化路径。
  - 能分别运行 JDK 25 与 Java 8 完整程序，并解释显式构造调用位置的版本差异。
recap:
  - 构造方法与类同名且不写返回类型，new 会按实参数量和类型选择匹配的构造方法。
  - 只有类没有声明任何构造方法时，编译器才会隐式提供默认无参构造方法。
  - 构造参数遮蔽同名字段时，this.field 表示当前对象字段，右侧简单名称表示参数。
  - this(...) 调用同一类的另一个构造方法，可把共同赋值集中到一条路径，但不能形成递归调用。
  - JDK 25 允许在 this(...) 前执行受限准备语句；Java 8 要求 this(...) 是构造方法首条语句。
related: []
tags:
  - Java
  - 构造方法
  - this
  - 构造方法重载
  - 默认构造方法
  - 对象初始化
appliesTo: Java 25；兼容示例适用于 Java 8
verifiedAt: 2026-08-17
sources:
  - id: dev-java-defining-constructors
    title: Dev.java - Providing Constructors for your Classes
    url: https://dev.java/learn/classes-objects/defining-constructors/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java；Java SE
    claims:
      - 构造方法与类同名，并可使用不同参数列表提供多个构造入口
      - 类未声明任何构造方法时，编译器会提供默认无参构造方法
  - id: dev-java-more-on-classes
    title: Dev.java - More on Classes
    url: https://dev.java/learn/classes-objects/more-on-classes/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java；Java SE 25
    claims:
      - this 表示当前对象，this.field 可访问被同名参数遮蔽的字段
      - this(...) 可调用同一类的另一个构造方法
      - JDK 25 允许在显式构造调用前执行受限准备语句
  - id: jls-25-constructors
    title: Java Language Specification 25 - Constructor Declarations
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.8
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 构造方法名称、签名、重载、构造调用和默认构造方法的语言规则
      - this(...) 不能直接或间接形成递归构造调用
  - id: jep-513-flexible-constructor-bodies
    title: JEP 513 - Flexible Constructor Bodies
    url: https://openjdk.org/jeps/513
    sourceOrigin: official
    sourceType: release-note
    appliesTo: JDK 25
    claims:
      - Flexible Constructor Bodies 在 JDK 25 正式交付
      - 显式构造调用前的 prologue 受到当前对象访问限制
  - id: oracle-java-25-flexible-constructor-bodies
    title: Oracle Java 25 - Flexible Constructor Bodies
    url: https://docs.oracle.com/en/java/javase/25/language/flexible-constructor-bodies.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java SE 25
    claims:
      - JDK 25 可在 this(...) 前准备局部值，但早期构造上下文不能任意读取当前对象状态或调用实例方法
  - id: jls-8-constructors
    title: Java Language Specification 8 - Constructor Declarations
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html#jls-8.8
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 的构造方法、重载、默认构造方法和递归调用限制
      - Java 8 的显式 this(...) 调用必须位于构造方法主体首条语句
  - id: stackoverflow-recursive-constructor-invocation
    title: Why am I getting this error with constructor chaining?
    url: https://stackoverflow.com/questions/43074715/why-am-i-getting-this-error-with-constructor-chaining
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 初学者构造方法委托误区
    claims:
      - 初学者可能把同一签名的 this(...) 自调用误认为构造方法链，实际会触发递归构造调用错误
---

# 构造方法与 this

上一课创建 `TaskCard` 后，再逐个给 `taskNumber`、`title` 赋值。只要漏掉其中一步，调用方就可能拿到
标题为默认值、编号仍为 `0` 的任务对象。对象虽然已经存在，初始状态却依赖创建者记住一串额外操作。

本课让创建动作同时接收任务的必需状态。我们只讨论普通类的构造方法、`this.field` 和 `this(...)`，
继续使用内存中的 TeamFlow 任务卡，不引入访问控制、`static`、`final`、继承、集合或框架。

## 一、让对象在创建时得到状态

### 1. 构造方法不是普通方法

构造方法写在类体中，名称必须与类名完全相同，并且名称前不写返回类型。例如，
`TaskCard(String title)` 有一个 `String` 参数。它不是“返回一个 `TaskCard` 的方法”，因此前面既不写
`TaskCard`，也不写 `void`。构造方法的职责是在新对象交给调用方之前，为这次创建建立初始状态，完整
写法会在本节最小程序中出现。

类名区分大小写。如果类名是 `TaskCard`，`taskCard(...)` 不是它的构造方法。给声明加上 `void` 后，
它也会变成一个恰好与类同名的普通方法。

### 2. new 后的实参选择构造方法

调用方仍然使用上一课见过的 `new`，但圆括号现在携带构造实参：

```java
TaskCard task = new TaskCard("完成登录页联调");
```

这行代码可以按三个观察点阅读：

1. `TaskCard task` 声明一个能够保存 `TaskCard` 引用的变量。
2. `new TaskCard(...)` 创建新对象，并寻找能够接收一个 `String` 的 `TaskCard` 构造方法。
3. 构造方法完成后，`new` 表达式产生新对象的引用，再把引用赋给 `task`。

构造方法不需要由调用方写成 `task.TaskCard(...)`，也不能像普通方法那样稍后再次执行。每个 `new`
表达式只为它正在创建的那个新对象调用一次匹配的构造方法。

### 3. 最小 TeamFlow 程序

在上一课的普通 Java 项目中创建 `TeamFlowConstructorDemo.java`，填写完整代码：

```java
class TaskCard {
    String title;

    /**
     * 使用指定标题创建任务卡。
     *
     * @param title 任务标题
     */
    TaskCard(String title) {
        this.title = title;
    }

    /**
     * 返回任务标题。
     *
     * @return 当前任务标题
     */
    String summary() {
        return "[ ] " + title;
    }
}

public class TeamFlowConstructorDemo {
    /**
     * 创建已经具有标题的任务对象并输出摘要。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        TaskCard task = new TaskCard("完成登录页联调");
        System.out.println(task.summary());
    }
}
```

运行 `TeamFlowConstructorDemo.main()`，控制台应显示：

```text
[ ] 完成登录页联调
```

调用方没有再写 `task.title = ...`。标题通过构造参数进入新对象，`summary()` 读取到的就是构造完成后
保存在该对象字段中的值。

## 二、为同一类提供多个构造入口

### 1. 参数列表决定调用哪一个构造方法

同一个类可以声明多个构造方法，只要它们的参数列表不同。这叫构造方法重载：

```java
class TaskCard {
    int taskNumber;
    String title;

    /**
     * 创建使用默认标题的任务卡。
     *
     * @param taskNumber 任务编号
     */
    TaskCard(int taskNumber) {
        this.taskNumber = taskNumber;
        this.title = "未命名任务";
    }

    /**
     * 创建使用指定编号和标题的任务卡。
     *
     * @param taskNumber 任务编号
     * @param title 任务标题
     */
    TaskCard(int taskNumber, String title) {
        this.taskNumber = taskNumber;
        this.title = title;
    }
}
```

`new TaskCard(1)` 匹配一个 `int` 参数的构造方法，`new TaskCard(2, "整理 API 文档")` 匹配
`int, String` 两个参数的构造方法。参数名称不参与匹配；构造方法的参数数量和各位置类型才决定签名。

因此，仅把 `title` 改名为 `name` 不能声明第二个 `TaskCard(int, String)`，两个声明仍是相同签名，
编译器无法接受。

### 2. 默认构造方法有严格条件

上一课的 `new TaskCard()` 能运行，是因为当时 `TaskCard` 没有声明任何构造方法。对于普通类，编译器
会在这种情况下隐式提供一个没有参数的构造方法，称为默认构造方法。

一旦类自己声明了任意构造方法，编译器就不再提供默认构造方法。若类只声明
`TaskCard(String title)`，只有 `new TaskCard("标题")` 能匹配现有声明，`new TaskCard()` 会编译失败。
业务确实需要无参创建时，就要自己显式声明 `TaskCard()`。

“默认构造方法”和“无参构造方法”不是完全相同的说法。前者专指编译器在类没有任何构造声明时隐式
提供的构造方法；开发者自己写下的 `TaskCard()` 是显式无参构造方法。

### 3. 多个入口仍应得到可解释状态

多个构造入口不是让调用方跳过必需状态。执行 `new TaskCard(1)` 后，标题应是一个参数入口明确补上的
“未命名任务”；执行 `new TaskCard(2, "整理 API 文档")` 后，标题应是调用方给出的文本。两个对象在
创建完成后都有可观察的标题，下一节会把重复的字段赋值集中起来。

## 三、用 this 区分字段、参数和构造入口

### 1. this 表示正在构造的当前对象

构造参数可以和实例字段同名。此时参数会遮蔽同名字段，简单名称 `title` 表示参数；`this.title`
明确表示正在构造的当前对象字段：

```java
class TaskCard {
    String title;

    /**
     * 把构造参数保存到当前对象字段。
     *
     * @param title 任务标题
     */
    TaskCard(String title) {
        this.title = title;
    }
}
```

赋值号左侧 `this.title` 是字段，右侧 `title` 是参数。执行后，参数携带的文本进入新对象。若写成
`title = title`，赋值号两边都会解析为参数，只是把参数自己的值再次赋给参数，字段仍保持 `null`。

这里的 `this` 只在某个对象的构造方法或实例方法中有意义。启动入口 `main` 是 `static` 方法，不对应
某个当前 `TaskCard`，所以它继续通过 `task.title` 等具体对象引用访问状态。

### 2. this.field 与 this(...) 是两种语法

`this` 后接点号和后接圆括号承担不同职责：

| 写法 | 作用 | 当前示例 |
| --- | --- | --- |
| `this.title` | 选择当前对象的字段 | 把参数保存到任务标题字段 |
| `this(taskNumber, title)` | 调用同一类的另一个构造方法 | 把简化入口委托给完整入口 |

下面的一个参数构造方法通过 `this(...)` 调用两个参数构造方法：

```java
class TaskCard {
    int taskNumber;
    String title;

    /**
     * 使用默认标题创建任务卡。
     *
     * @param taskNumber 任务编号
     */
    TaskCard(int taskNumber) {
        this(taskNumber, "未命名任务");
    }

    /**
     * 使用完整状态创建任务卡。
     *
     * @param taskNumber 任务编号
     * @param title 任务标题
     */
    TaskCard(int taskNumber, String title) {
        this.taskNumber = taskNumber;
        this.title = title;
    }
}
```

`new TaskCard(1)` 先进入一个参数入口，再委托给两个参数入口。真正的字段赋值只保留一份，默认标题由
简化入口补齐。

### 3. 构造委托必须最终结束

`this(...)` 的目标必须是另一个参数签名，并且委托链最终要到达一个不再调用 `this(...)`、实际完成
字段赋值的构造方法。

```java
class TaskCard {
    String title;

    /**
     * 使用默认标题委托给带参构造方法。
     */
    TaskCard() {
        this("未命名任务");
    }

    /**
     * 保存最终标题并结束构造委托。
     *
     * @param title 任务标题
     */
    TaskCard(String title) {
        this.title = title;
    }
}
```

若 `TaskCard()` 中写 `this()`，它会试图再次调用自己。Java 会在编译期拒绝直接或间接的递归构造调用，
不会等到运行时无限创建对象。

**社区补充：** Stack Overflow 的真实初学者问题把同一签名的 `this(...)` 自调用误认为“构造方法链”。
判断目标时不要只看 `this` 关键字，要逐项核对实参数量和类型，确认它匹配的是另一个构造签名；这一
编译期规则在 JDK 25 与 Java 8 中一致。

## 四、沿着一次创建观察执行结果

### 1. 简化入口先准备参数，再由完整入口赋值

使用两个构造方法时，可以在各入口打印一行，观察委托顺序。假设类中已有 `title` 字段：

```java
/** 使用默认标题委托给完整入口。 */
TaskCard() {
    this("未命名任务");
    System.out.println("简化入口结束");
}

/** 使用标题建立完整状态。 */
TaskCard(String title) {
    this.title = title;
    System.out.println("完整入口完成：" + this.title);
}
```

JDK 25 与 Java 8 都输出：

```text
完整入口完成：未命名任务
简化入口结束
```

`this("未命名任务")` 先让完整入口完成字段赋值，控制才回到无参构造方法的下一行。两个构造方法都
结束后，调用方才得到 `new TaskCard()` 产生的引用。

### 2. 构造方法重载不等于创建多个对象

上例执行了两个构造方法主体，但只有一个 `new`，因此只创建一个 `TaskCard` 对象。`this(...)` 在同一
对象的构造过程中切换到另一个初始化入口，不会创建第二个对象，也不会返回另一个引用。

## 五、处理 JDK 25 与 Java 8 的真实差异

### 1. JDK 25 可以在 this(...) 前准备局部值

JDK 25 正式支持 Flexible Constructor Bodies。构造方法可以在显式 `this(...)` 调用前执行受限语句，
前面的部分称为 prologue：

```java
class TaskCard {
    String title;
    boolean completed;

    /**
     * 清理标题后委托给完整构造方法。
     *
     * @param rawTitle 可能包含首尾空白的标题
     */
    TaskCard(String rawTitle) {
        String normalizedTitle = rawTitle.trim();
        this(normalizedTitle, false);
    }

    /**
     * 使用完整状态创建任务卡。
     *
     * @param title 已清理的标题
     * @param completed 是否完成
     */
    TaskCard(String title, boolean completed) {
        this.title = title;
        this.completed = completed;
    }
}
```

prologue 中的 `normalizedTitle` 是局部变量，只依赖构造参数。本课不在这个区域读取当前对象字段、调用
实例方法或传出 `this`；等完整构造入口建立对象状态后，再使用当前对象。

### 2. Java 8 要把 this(...) 放在首条语句

Java 8 不接受上一段写法，因为在它的构造方法主体中，显式 `this(...)` 必须是首条语句。兼容写法把
准备表达式直接放进调用参数：

```java
class TaskCard {
    String title;
    boolean completed;

    /**
     * 在首条语句中清理标题并委托。
     *
     * @param rawTitle 可能包含首尾空白的标题
     */
    TaskCard(String rawTitle) {
        this(rawTitle.trim(), false);
    }

    /**
     * 使用完整状态创建任务卡。
     *
     * @param title 已清理的标题
     * @param completed 是否完成
     */
    TaskCard(String title, boolean completed) {
        this.title = title;
        this.completed = completed;
    }
}
```

两版都把清理后的标题和默认完成状态交给同一个完整入口，运行结果相同。差异只在“能否先声明局部变量
再调用 `this(...)`”，不是 `this.field`、构造重载或对象状态语义的变化。

### 3. 兼容项目要核对实际 JDK

JDK 25 版本在独立普通 Java 项目中运行，Project SDK、模块 SDK 和运行配置 JRE 都选择 JDK 25。
Java 8 版本放在另一个独立项目或模块中，三处都选择 JDK 8。

终端复核时分别执行：

```bash
java -version
javac -version
```

终端 JDK 与 IDEA 项目 JDK 是独立选择。验证 Java 8 的首语句限制时，要确认实际执行的是 1.8 系列
`javac`，不能用 JDK 25 编译结果代替。

## 六、常见错误

:::pitfalls
### 给构造方法写了返回类型

**触发条件：** 把构造声明写成 `void TaskCard(String title)`，再执行 `new TaskCard("标题")`。

**原因：** 带返回类型的声明是普通方法，不是构造方法；类实际上没有接收 `String` 的构造方法。

**后果：** `new TaskCard("标题")` 找不到匹配构造方法，JDK 25 与 Java 8 都编译失败。

**错误示例：**

```java
class TaskCard {
    String title;

    /** 错误地声明成普通方法。 */
    void TaskCard(String title) {
        this.title = title;
    }
}

TaskCard task = new TaskCard("完成联调");
```

**正确写法：**

```java
class TaskCard {
    String title;

    /** 使用标题创建任务卡。 */
    TaskCard(String title) {
        this.title = title;
    }
}

TaskCard task = new TaskCard("完成联调");
```

**验证方式：** 错误版的编译器消息应指出实际参数列表与可用构造方法不匹配；删除 `void` 后重新编译成功。

### 把参数赋值给参数自身

**触发条件：** 字段和参数都叫 `title`，构造方法中写 `title = title`。

**原因：** 参数遮蔽了同名字段，两个简单名称都表示参数，没有任何一侧指向实例字段。

**后果：** 程序能够编译运行，但对象字段仍为默认值 `null`，后续摘要出现错误数据。

**错误示例：**

```java
class TaskCard {
    String title;

    /** 错误地把参数再次赋给参数。 */
    TaskCard(String title) {
        title = title;
    }
}
```

**正确写法：**

```java
class TaskCard {
    String title;

    /** 把参数保存到当前对象字段。 */
    TaskCard(String title) {
        this.title = title;
    }
}
```

**验证方式：** 创建 `new TaskCard("完成联调")` 并输出 `task.title`；错误版输出 `null`，正确版输出标题。

### 声明带参构造方法后仍调用无参入口

**触发条件：** 类只声明 `TaskCard(String title)`，调用方仍写 `new TaskCard()`。

**原因：** 类已经声明构造方法，编译器不会再隐式提供默认无参构造方法。

**后果：** 两个 JDK 都无法为零个实参找到匹配的构造方法，源码编译失败。

**错误示例：**

```java
class TaskCard {
    /** 使用标题创建任务卡。 */
    TaskCard(String title) {
    }
}

TaskCard task = new TaskCard();
```

**正确写法：**

```java
class TaskCard {
    /** 使用标题创建任务卡。 */
    TaskCard(String title) {
    }
}

TaskCard task = new TaskCard("完成联调");
```

**验证方式：** 对错误版运行 `javac` 应得到非零退出码；传入一个 `String` 后重新编译成功。

### 让 this(...) 调回同一构造方法

**触发条件：** 无参构造方法内部写 `this()`，或多个构造方法互相委托后又回到起点。

**原因：** `this(...)` 选择的签名没有前进到另一条最终赋值路径，而是形成直接或间接递归。

**后果：** Java 语言在编译期拒绝 recursive constructor invocation，两版都不会生成可运行程序。

**错误示例：**

```java
class TaskCard {
    /** 错误地再次调用自身。 */
    TaskCard() {
        this();
    }
}
```

**正确写法：**

```java
class TaskCard {
    String title;

    /** 委托给带参构造方法。 */
    TaskCard() {
        this("未命名任务");
    }

    /** 保存标题并结束委托。 */
    TaskCard(String title) {
        this.title = title;
    }
}
```

**验证方式：** 错误版在两个 JDK 下都应编译失败；正确版创建对象后输出标题应为“未命名任务”。

### 把 JDK 25 prologue 原样放进 Java 8

**触发条件：** Java 8 构造方法先声明局部变量，再在下一行调用 `this(...)`。

**原因：** Java 8 要求显式构造调用是构造方法主体首条语句；JDK 25 才正式允许受限 prologue。

**后果：** 同一源码可被 JDK 25 接受，但 Java 8 编译器报告 `call to this must be first statement in constructor`。

**错误示例：**

```java
class TaskCard {
    String title;
    boolean completed;

    /** 使用 JDK 25 写法准备局部值。 */
    TaskCard(String rawTitle) {
        String normalizedTitle = rawTitle.trim();
        this(normalizedTitle, true);
    }

    /** 保存标题和完成状态。 */
    TaskCard(String title, boolean completed) {
        this.title = title;
        this.completed = completed;
    }
}
```

**正确写法：**

```java
class TaskCard {
    String title;
    boolean completed;

    /** 使用两版都支持的首语句委托。 */
    TaskCard(String rawTitle) {
        this(rawTitle.trim(), true);
    }

    /** 保存标题和完成状态。 */
    TaskCard(String title, boolean completed) {
        this.title = title;
        this.completed = completed;
    }
}
```

**验证方式：** 用实际 Java 8 编译器复现错误，再把 `this(...)` 移到首条语句；JDK 25 两版源码都应通过。
:::

## 七、运行 JDK 25 完整程序

### 1. 在 IDEA 中准备现代项目

1. 打开独立普通 Java 项目，在 **Project Structure** 中把 Project SDK 和模块 SDK 设为 JDK 25。
2. 创建 `TeamFlowConstructorApplication.java`，保持文件名与 `public` 启动类同名。
3. 填写下面完整代码；`TaskCard` 保持为同文件中的非 `public` 辅助类。
4. 从 `TeamFlowConstructorApplication.main()` 左侧运行，观察标题清理和两个构造入口的结果。

### 2. 完整代码

```java
class TaskCard {
    int taskNumber;
    String title;
    boolean completed;

    /**
     * 清理标题后创建未完成任务。
     *
     * @param taskNumber 任务编号
     * @param rawTitle 可能包含首尾空白的任务标题
     */
    TaskCard(int taskNumber, String rawTitle) {
        String normalizedTitle = rawTitle.trim();
        this(taskNumber, normalizedTitle, false);
    }

    /**
     * 使用完整状态创建任务。
     *
     * @param taskNumber 任务编号
     * @param title 已清理的任务标题
     * @param completed 是否完成
     */
    TaskCard(int taskNumber, String title, boolean completed) {
        this.taskNumber = taskNumber;
        this.title = title;
        this.completed = completed;
    }

    /**
     * 返回包含编号、状态和标题的任务摘要。
     *
     * @return 当前任务摘要
     */
    String summary() {
        String mark = completed ? "[x]" : "[ ]";
        return "#" + taskNumber + " " + mark + " " + title;
    }
}

public class TeamFlowConstructorApplication {
    /**
     * 通过两个构造入口创建 TeamFlow 任务并输出结果。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        TaskCard first = new TaskCard(1, " 完成登录页联调 ");
        TaskCard second = new TaskCard(2, "整理 API 文档", true);

        System.out.println("TeamFlow 构造任务");
        System.out.println(first.summary());
        System.out.println(second.summary());
    }
}
```

### 3. 预期控制台输出

```text
TeamFlow 构造任务
#1 [ ] 完成登录页联调
#2 [x] 整理 API 文档
```

第一行任务调用两个参数入口。prologue 先把标题首尾空白清理到局部变量，再委托三个参数入口，并补上
`completed = false`。第二行任务直接调用三个参数入口，因此显示调用方传入的完成状态 `true`。

### 4. 用终端复核

在只包含该源文件的目录中确认 `javac -version` 为 25 系列，再执行：

```bash
javac TeamFlowConstructorApplication.java
java TeamFlowConstructorApplication
```

`javac` 成功接受 `this(...)` 前的局部变量准备语句，`java` 启动同名类并输出三行结果。这里不重复
展开 class 文件或 classpath，它们已经由《编译与运行》讲解。

## 八、运行 Java 8 完整程序

### 1. 切换独立兼容项目

1. 在独立项目或模块中把 Project SDK、模块 SDK 和运行配置 JRE 都设为 JDK 8。
2. 创建 `TeamFlowConstructorApplication.java`，完整填写下面的 Java 8 版本。
3. 从 `main` 左侧运行；若使用终端，先确认 `java -version` 与 `javac -version` 都为 1.8 系列。

### 2. 完整兼容代码

```java
class TaskCard {
    int taskNumber;
    String title;
    boolean completed;

    /**
     * 在首条语句中清理标题并创建未完成任务。
     *
     * @param taskNumber 任务编号
     * @param rawTitle 可能包含首尾空白的任务标题
     */
    TaskCard(int taskNumber, String rawTitle) {
        this(taskNumber, rawTitle.trim(), false);
    }

    /**
     * 使用完整状态创建任务。
     *
     * @param taskNumber 任务编号
     * @param title 已清理的任务标题
     * @param completed 是否完成
     */
    TaskCard(int taskNumber, String title, boolean completed) {
        this.taskNumber = taskNumber;
        this.title = title;
        this.completed = completed;
    }

    /**
     * 返回包含编号、状态和标题的任务摘要。
     *
     * @return 当前任务摘要
     */
    String summary() {
        String mark = completed ? "[x]" : "[ ]";
        return "#" + taskNumber + " " + mark + " " + title;
    }
}

public class TeamFlowConstructorApplication {
    /**
     * 通过两个构造入口创建 TeamFlow 任务并输出结果。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        TaskCard first = new TaskCard(1, " 完成登录页联调 ");
        TaskCard second = new TaskCard(2, "整理 API 文档", true);

        System.out.println("TeamFlow 构造任务");
        System.out.println(first.summary());
        System.out.println(second.summary());
    }
}
```

### 3. 输出与执行解释

Java 8 的控制台应与 JDK 25 完全一致：

```text
TeamFlow 构造任务
#1 [ ] 完成登录页联调
#2 [x] 整理 API 文档
```

兼容版把 `rawTitle.trim()` 直接写进首条 `this(...)` 调用，仍由三个参数入口完成全部字段赋值。两个版本
使用不同语法位置得到相同对象状态，不能只展示一份代码并写“Java 8 同上”。

## 九、练习与参考实现

:::exercise
### 练习：为任务看板设计两个构造入口

**要求：** 声明 `BoardTask`，包含任务编号、标题和优先级三个实例字段。提供接收编号与原始标题的简化
构造方法，以及接收编号、标题和优先级的完整构造方法。简化入口要清理标题首尾空白，并把优先级设为
“普通”。创建两项任务，第一项使用简化入口，第二项使用完整入口。不得使用访问控制、`static` 字段、
`final`、数组、集合或继承。

**验收：** JDK 25 与 Java 8 都依次输出 `#1 [普通] 完成接口联调` 和 `#2 [高] 准备发布说明`；两版
分别使用符合自身构造调用位置规则的完整代码。

**参考答案：** directive 后分别给出 JDK 25 与 Java 8 的完整可运行实现。
:::

### 1. JDK 25 参考实现

```java
class BoardTask {
    int taskNumber;
    String title;
    String priority;

    /**
     * 清理标题后创建普通优先级任务。
     *
     * @param taskNumber 任务编号
     * @param rawTitle 可能包含首尾空白的任务标题
     */
    BoardTask(int taskNumber, String rawTitle) {
        String normalizedTitle = rawTitle.trim();
        this(taskNumber, normalizedTitle, "普通");
    }

    /**
     * 使用完整状态创建看板任务。
     *
     * @param taskNumber 任务编号
     * @param title 已清理的任务标题
     * @param priority 任务优先级
     */
    BoardTask(int taskNumber, String title, String priority) {
        this.taskNumber = taskNumber;
        this.title = title;
        this.priority = priority;
    }

    /**
     * 返回看板任务摘要。
     *
     * @return 包含编号、优先级和标题的摘要
     */
    String summary() {
        return "#" + taskNumber + " [" + priority + "] " + title;
    }
}

public class TeamFlowConstructorPractice {
    /**
     * 使用两个构造入口创建看板任务。
     *
     * @param args 启动参数，本练习不使用
     */
    public static void main(String[] args) {
        BoardTask first = new BoardTask(1, " 完成接口联调 ");
        BoardTask second = new BoardTask(2, "准备发布说明", "高");

        System.out.println(first.summary());
        System.out.println(second.summary());
    }
}
```

### 2. Java 8 参考实现

```java
class BoardTask {
    int taskNumber;
    String title;
    String priority;

    /**
     * 在首条语句中清理标题并创建普通优先级任务。
     *
     * @param taskNumber 任务编号
     * @param rawTitle 可能包含首尾空白的任务标题
     */
    BoardTask(int taskNumber, String rawTitle) {
        this(taskNumber, rawTitle.trim(), "普通");
    }

    /**
     * 使用完整状态创建看板任务。
     *
     * @param taskNumber 任务编号
     * @param title 已清理的任务标题
     * @param priority 任务优先级
     */
    BoardTask(int taskNumber, String title, String priority) {
        this.taskNumber = taskNumber;
        this.title = title;
        this.priority = priority;
    }

    /**
     * 返回看板任务摘要。
     *
     * @return 包含编号、优先级和标题的摘要
     */
    String summary() {
        return "#" + taskNumber + " [" + priority + "] " + title;
    }
}

public class TeamFlowConstructorPractice {
    /**
     * 使用两个构造入口创建看板任务。
     *
     * @param args 启动参数，本练习不使用
     */
    public static void main(String[] args) {
        BoardTask first = new BoardTask(1, " 完成接口联调 ");
        BoardTask second = new BoardTask(2, "准备发布说明", "高");

        System.out.println(first.summary());
        System.out.println(second.summary());
    }
}
```

### 3. 运行步骤与预期结果

在 JDK 25 项目和 Java 8 项目中都创建 `TeamFlowConstructorPractice.java`，分别粘贴对应版本，从当前
文件的 `main` 左侧运行。两个控制台都必须输出：

```text
#1 [普通] 完成接口联调
#2 [高] 准备发布说明
```

第一项标题的首尾空白被简化入口清理，缺少的优先级由该入口补成“普通”；第二项直接把三个实参交给
完整入口。两个入口最终都由同一个构造方法完成字段赋值。

## 十、本节小结

- 构造方法与类同名且不写返回类型，`new` 按实参数量和类型选择匹配入口。
- 只有类没有任何构造声明时，编译器才提供默认无参构造方法；显式无参构造方法是另一回事。
- 参数遮蔽同名字段时，`this.field = field` 把右侧参数保存到当前对象字段。
- `this(...)` 可集中共同初始化，但目标必须是另一个签名，并最终到达实际赋值路径。
- JDK 25 可在 `this(...)` 前准备受限局部值；Java 8 必须把 `this(...)` 写成首条语句。
