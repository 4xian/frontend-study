---
id: backend.java.learn.basics.methods-parameters-and-scope
type: lesson
title: 方法定义与调用
summary: 在普通 Java 类中定义并调用空参数静态方法，用 void 执行动作、用 return 把结果交回 TeamFlow 主流程
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 75
prerequisites:
  - backend.java.learn.basics.loop-control
objectives:
  - 能从修饰符、返回类型、方法名、圆括号和方法体读懂一个基础方法声明。
  - 能在类体内、main 方法外定义空参数静态方法，并从 main 按预期顺序调用。
  - 能区分 void 动作与有返回值的方法，并正确使用方法调用产生的结果。
  - 能解释调用发生时控制权如何进入方法体，再回到调用位置之后继续执行。
  - 能通过 return 把方法内局部结果交给调用方，并识别局部变量的可见边界。
  - 能定位方法未调用、嵌套声明、静态边界、漏写圆括号和缺少返回等常见问题。
recap:
  - 方法声明给一段行为确定名称和边界，只有执行调用表达式才会进入方法体。
  - 本课使用 static 辅助方法，是因为传统 main 处于静态上下文且还没有学习对象。
  - void 方法只执行动作，不产生可赋值结果；非 void 方法通过 return 交回兼容值。
  - 方法内的局部变量不能在另一个方法中直接使用，需要结果时由 return 交给调用方保存。
  - 普通类中的传统静态入口与本课方法写法在 JDK 25 和 Java 8 中一致。
related: []
tags:
  - Java
  - 方法
  - 方法调用
  - static
  - void
  - return
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 使用相同的普通类与传统静态入口写法
verifiedAt: 2026-08-17
sources:
  - id: jls-25-method-declarations
    title: "Java Language Specification 25 - Chapter 8: Classes"
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25，§8.4
    claims:
      - 方法声明、static 类方法、返回类型、方法名、圆括号和方法体的语言规则。
      - 非 void 方法不能沿着正常路径直接走到方法体末尾。
  - id: jls-25-method-invocation
    title: "Java Language Specification 25 - Chapter 15: Expressions"
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25，§15.12
    claims:
      - 方法调用表达式的执行与结果规则。
      - void 调用不产生值，静态上下文不能直接调用没有目标对象的实例方法。
  - id: jls-25-return-statement
    title: "Java Language Specification 25 - Chapter 14: Blocks, Statements, and Patterns"
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.17
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25，§14.17
    claims:
      - return 把控制权以及可选的结果值交回方法调用方。
  - id: dev-java-defining-methods
    title: Defining Methods - Dev.java
    url: https://dev.java/learn/classes-objects/defining-methods
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java Java 入门资料
    claims:
      - 初学阶段可见的方法声明组成、空参数圆括号和方法命名建议。
  - id: jls-8-language-specification
    title: Java Language Specification, Java SE 8 Edition
    url: https://docs.oracle.com/javase/specs/jls/se8/jls8.pdf
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8，§8.4、§14.17、§15.12
    claims:
      - Java 8 的普通类、静态方法、void、return 和调用合同与本课主线一致。
  - id: jep-512-compact-source-files
    title: "JEP 512: Compact Source Files and Instance Main Methods"
    url: https://openjdk.org/jeps/512
    sourceOrigin: official
    sourceType: release-note
    appliesTo: JDK 25
    claims:
      - JDK 25 已交付紧凑源文件和实例 main 方法，Java 8 不支持这些启动形式。
  - id: stack-overflow-nested-method
    title: "Illegal Start of Expression : declaring a method inside another method"
    url: https://stackoverflow.com/questions/19189214/illegal-start-of-expression-declaring-a-method-inside-another-method
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 初学者把方法声明写进 main 的真实误区
    claims:
      - Java 类的成员方法不能声明在另一个方法体内部。
  - id: stack-overflow-static-context
    title: "What is the \"non-static method\" error and how does \"this\" work?"
    url: https://stackoverflow.com/questions/9775139/what-is-the-non-static-method-error-and-how-does-this-work
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 初学者从静态 main 直接调用实例方法的真实误区
    claims:
      - 实例方法需要目标对象；本课同类无状态辅助方法可以声明为 static 后直接调用。
  - id: stack-overflow-missing-return
    title: '"Missing return statement" within if / for / while'
    url: https://stackoverflow.com/questions/23058029/missing-return-statement-within-if-for-while
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 非 void 方法缺少返回路径的真实误区
    claims:
      - 只有部分条件路径执行 return 时，其他正常路径仍可能走到方法体末尾并导致编译失败。
---

# 方法定义与调用

上一课已经能用条件和循环组织 TeamFlow 的一段流程，但所有语句都挤在 `main` 中时，很难直接看出每段代码
负责什么。方法让我们给一段行为命名：主流程看到 `showStartupMessage()`，就能知道这里要显示启动信息；
需要结果时，调用处还能接住方法交回的值。

本课只在一个普通 Java 类中定义空参数方法。`main` 里的 `String[] args` 继续作为固定启动形式，不展开数组；
形参、实参、按值传递和重载留到后续课程。对象、实例方法、继承、递归、异常和 JVM 调用栈也不在本课展开。

## 一、先观察一次方法调用

### 1. 方法声明不会自动执行

下面的 `showReadyMessage` 声明了一段输出行为，`main` 中的 `showReadyMessage()` 才是真正的调用：

```java
/**
 * 演示 TeamFlow 方法声明与调用。
 */
public final class MethodCallDemo {
    /**
     * 启动程序并调用就绪提示方法。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        showReadyMessage();
    }

    /**
     * 输出 TeamFlow 就绪提示。
     */
    private static void showReadyMessage() {
        System.out.println("TeamFlow 方法准备就绪");
    }
}
```

运行 `MethodCallDemo`，控制台只输出：

```text
TeamFlow 方法准备就绪
```

如果删除 `main` 中的调用，辅助方法仍然存在，源码也能编译，但它的输出语句没有执行机会。方法声明描述
“可以做什么”，调用表达式才表示“现在执行它”。

### 2. 调用结束后回到原位置继续

程序从 `main` 的第一条语句开始。执行到 `showReadyMessage()` 时，控制权进入该方法体；打印完成并到达
右花括号后，控制权回到调用位置的下一条语句：

```java
/**
 * 演示调用前后语句的执行顺序。
 */
public final class MethodOrderDemo {
    /**
     * 按顺序输出调用前、方法内和调用后的状态。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        System.out.println("1. 开始主流程");
        showReadyMessage();
        System.out.println("3. 回到主流程");
    }

    /**
     * 输出方法体正在执行的状态。
     */
    private static void showReadyMessage() {
        System.out.println("2. 执行辅助方法");
    }
}
```

预期输出依次是 `1、2、3`。方法调用不是跳过后续语句，也不是让两个位置同时执行；它会完成当前调用，
再继续调用位置后面的主流程。

### 3. 源码位置不决定调用顺序

上面两个例子都把辅助方法写在 `main` 后面，但 `main` 仍然可以调用它。Java 会根据类中的方法声明解析
调用，不要求方法先写在调用语句上方。

真正的运行顺序由入口和调用语句决定。为了让初学阶段的类容易阅读，本课统一把 `main` 放在前面，把它
调用的辅助方法放在后面；这是阅读约定，不是语言强制的执行顺序。

## 二、从左到右读懂方法声明

### 1. 一条基础声明包含哪些部分

以 `private static void showReadyMessage()` 为例，它在本课可见的结构是：

```java
/**
 * 输出 TeamFlow 就绪提示。
 */
private static void showReadyMessage() {
    System.out.println("TeamFlow 方法准备就绪");
}
```

**（1）`private` 和 `static` 说明调用边界**

`private` 表示这个辅助方法只供当前类内部使用。`static` 表示它属于类本身，不需要先创建对象；因此同处
静态上下文的 `main` 可以直接写 `showReadyMessage()`。访问控制和对象设计会在类与对象课程继续展开，
这里先固定使用 `private static` 编写无状态辅助方法。

**（2）`void`、名称和圆括号说明如何调用**

`void` 表示调用不产生结果值。`showReadyMessage` 是方法名，采用以动词开头的 camelCase 写法，让调用处
读起来像一个动作。即使没有自定义输入，声明和调用都必须保留空圆括号 `()`。

**（3）花括号限定方法体**

左右花括号之间是调用时真正执行的语句。右花括号结束当前方法体；对于这个 `void` 方法，到达末尾后控制权
回到调用方。本课每个方法都放在类体内，并与 `main` 处于同一级，不能把一个方法声明塞进另一个方法体。

### 2. 方法名应该直接表达行为

动作方法使用 `showStartupMessage`、`printChecklist` 这类动词开头的名称；产生结果的方法使用
`countReadyTasks`、`createSummary` 这类能说明结果来源的名称。不要使用 `doIt`、`handle` 或 `method1`
这类离开上下文就不知道含义的名称。

方法名区分大小写。声明 `showStatus` 后，调用必须写 `showStatus()`，不能写成 `ShowStatus()`。名称准确不只
是样式问题，拼写或大小写不同会让编译器寻找另一个不存在的方法。

### 3. 本课为什么统一使用空参数方法

空圆括号表示本次调用不从调用处接收自定义输入，但方法仍然可以读取自己方法体里声明的局部变量并执行
计算。这样可以先把“声明、调用、执行、返回”的路径看清，不把参数对应关系混进同一个学习步骤。

`main(String[] args)` 的 `args` 是传统启动入口的一部分，本课不读取它，也不借它提前讲数组和参数传递。
下一课会在已经掌握调用顺序的基础上，让方法接收调用方提供的数据。

## 三、用 `void` 方法执行动作

### 1. `void` 表示调用没有结果值

下面的方法只输出分隔线，不需要把数据交给调用方，所以返回位置写 `void`：

```java
/**
 * 输出 TeamFlow 检查分隔线。
 */
private static void printSeparator() {
    System.out.println("--- TeamFlow 检查 ---");
}
```

调用时把它写成一条完整语句：

```java
printSeparator();
```

控制台出现分隔线，是因为方法体里的打印语句执行了；这不表示 `printSeparator()` 产生了一个字符串结果。
`void` 调用不能赋给变量，也不能放到需要值的拼接或计算位置。

### 2. 同一个方法可以按调用次数重复执行

方法声明只写一份，调用处可以根据流程多次执行：

```java
printSeparator();
System.out.println("检查任务数据");
printSeparator();
```

输出顺序是分隔线、任务提示、分隔线。两次调用都会从 `printSeparator` 方法体开头执行到末尾，然后分别
回到自己的调用位置。方法复用的是行为定义，不会自动记住上一次调用执行到了哪里。

### 3. 打印是动作，不是返回值

`System.out.println("就绪")` 把文字写到控制台；`return "就绪"` 则把字符串交回调用方。这两种语句的
数据去向不同。调用方需要继续组合、保存或判断结果时，不能用打印代替返回。

初学阶段可以先问：这段方法只需要产生可观察动作，还是调用方还要拿到一个值？前者使用 `void`，后者声明
具体返回类型并执行带值的 `return`。

## 四、用返回值把结果交给调用方

### 1. 返回类型先约定结果种类

下面的空参数方法在内部完成三轮检查，并把计数结果作为 `int` 返回：

```java
/**
 * 统计 TeamFlow 就绪任务数量。
 *
 * @return 已完成检查的任务数量
 */
private static int countReadyTasks() {
    int readyTaskCount = 0;

    for (int taskNumber = 1; taskNumber <= 3; taskNumber++) {
        readyTaskCount++;
    }

    return readyTaskCount;
}
```

`int` 是方法承诺的返回类型，`return readyTaskCount;` 把最终整数交给调用处。调用方可以把这次调用放在
变量初始化右侧：

```java
int readyTaskCount = countReadyTasks();
System.out.println("就绪任务：" + readyTaskCount);
```

方法体完成后返回 `3`，因此调用表达式 `countReadyTasks()` 在这个位置产生整数 `3`，调用方变量保存该值，
控制台最终输出 `就绪任务：3`。

### 2. `return` 同时结束当前方法

执行带值的 `return` 时，Java 先求出返回表达式的值，再结束当前方法，并把控制权和值交回调用方。当前
调用已经返回后，方法体中位于该条 `return` 之后且必然到达不了的语句不能继续执行。

下面的方法根据自己内部的状态选择一个结果，两条可能路径都会返回字符串：

```java
/**
 * 根据本地就绪数量创建 TeamFlow 状态。
 *
 * @return 当前状态文字
 */
private static String createStatus() {
    int readyTaskCount = 2;

    if (readyTaskCount > 0) {
        return "存在就绪任务";
    }

    return "暂无就绪任务";
}
```

当前局部值是 `2`，所以第一次 `return` 交回 `存在就绪任务`，第二条返回不会执行。如果把局部值改为 `0`，
条件为 `false`，程序会执行末尾的返回。

### 3. 非 `void` 方法不能沿正常路径走到末尾

声明 `int`、`String` 等返回类型后，每条能正常完成的路径都必须执行兼容的带值 `return`。如果只有
`if` 内返回，而条件为 `false` 时能直接走到右花括号，编译器会报告缺少返回语句。

“方法总会抛出异常”等特殊路径属于后续异常课程。本课的正常方法保持简单：能到达的方法末尾之前明确
返回结果，让调用方和编译器都能判断调用表达式会产生什么值。

## 五、传统静态入口与 `static` 辅助方法

### 1. `main` 是本课调用链的起点

JDK 25 与 Java 8 都支持传统入口 `public static void main(String[] args)`。Java 启动这个入口后，`main`
处在静态上下文中。本课还没有创建对象，因此它直接调用的同类辅助方法也声明为 `static`：

```java
/**
 * 启动方法调用示例。
 *
 * @param args 启动参数，本程序暂不使用
 */
public static void main(String[] args) {
    showReadyMessage();
}

/**
 * 输出 TeamFlow 就绪提示。
 */
private static void showReadyMessage() {
    System.out.println("TeamFlow 方法准备就绪");
}
```

这不是“所有 Java 方法都必须写 `static`”。没有 `static` 的实例方法需要针对某个对象调用；对象怎样创建、
实例方法怎样读取对象状态，会在类与对象课程讲解。当前阶段不要为了消除编译错误盲目给所有方法加
`static`，只把它作为本课同类无状态辅助方法的明确选择。

### 2. JDK 25 有更简洁入口，但本课不用

JDK 25 已支持紧凑源文件和实例 `main` 方法，因此现代版本可以在特定形式下省略传统入口的一些组成。
Java 8 不支持这些启动形式。本课继续使用普通类和传统静态入口，让两个版本的完整程序保持相同，也让
`main` 与静态辅助方法的调用关系始终明确。

这里不再次展开启动器选择规则。只要在 IntelliJ IDEA 中运行本课普通类，就应选择包含传统 `main` 的类，
并确认项目 JDK 与当前版本一致。

### 3. 直接调用与使用返回值是两条不同语句

静态动作方法可以直接调用：`showReadyMessage();`。有返回值的方法则可以把调用表达式放在需要值的位置：
`int count = countReadyTasks();`。两种写法都先执行方法体，区别在于调用结束时有没有结果交回。

本课调用的是当前类中的方法，所以可以省略类名。跨类调用、对象目标和导入关系属于后续课程，不在这里
扩张调用语法。

## 六、方法内局部变量的边界

### 1. 局部变量只在声明它的方法内可见

`countReadyTasks` 里的 `readyTaskCount` 属于该方法的局部变量。`main` 不能直接写这个名字，因为它不在
`main` 的可见范围内：

```java
/**
 * 统计 TeamFlow 就绪任务数量。
 *
 * @return 已完成检查的任务数量
 */
private static int countReadyTasks() {
    int readyTaskCount = 3;
    return readyTaskCount;
}
```

调用结束后，调用方得到的是返回的整数值，不是把辅助方法里的局部变量本身搬到 `main`。因此调用方通常
用自己的变量名接住结果：

```java
int result = countReadyTasks();
System.out.println(result);
```

辅助方法可以整理内部步骤，调用方只依赖返回结果。参数变量的作用域和传递方式留到下一课。

### 2. 每次调用都有自己这一次的局部状态

下面的方法每次进入时都重新声明 `sequence` 并赋值为 `1`：

```java
/**
 * 返回本次调用创建的本地序号。
 *
 * @return 本次调用的本地序号
 */
private static int createLocalSequence() {
    int sequence = 1;
    return sequence;
}
```

连续调用两次：

```java
System.out.println(createLocalSequence());
System.out.println(createLocalSequence());
```

输出是两行 `1`，不是 `1` 和 `2`。每次调用都会执行局部变量声明；如果需要跨调用保存状态，就会涉及字段
和对象，本课不提前引入。

### 3. 返回值让方法边界保持清楚

调用方不需要知道辅助方法用了 `for` 还是 `while` 得到计数，只要知道 `countReadyTasks()` 会返回一个
`int`。方法内部可以用前置课程学过的变量、条件和循环完成过程，调用方通过名称和返回类型理解结果。

这种边界并不意味着方法越长越好。当前课程只把一段有完整意图、能独立命名的行为放进方法，不为了减少
行数把每一条打印语句都拆成一个新方法。

## 七、常见易错情况

**社区补充：** 初学者问答中反复出现三类真实问题：把方法声明写进 `main`、从静态入口直接调用实例方法，
以及非 `void` 方法只有部分条件路径返回。下面把这些现象与官方声明、调用和返回规则对照；其余项目由相同
语言规则直接推导。JDK 25 与 Java 8 对这些普通类写法的结果一致。

:::pitfalls
### 只声明方法却没有调用

**触发条件：** 类中已经存在输出方法，但 main 只输出主流程结束，没有执行辅助方法的调用表达式。

**原因：** 方法声明只提供可调用行为，不会因为程序启动就自动执行。

**后果：** 程序能编译运行，却看不到预期的就绪提示，容易误以为方法体失效。

**错误示例：**

```java
/**
 * 启动程序但遗漏辅助方法调用。
 *
 * @param args 启动参数，本程序暂不使用
 */
public static void main(String[] args) {
    System.out.println("主流程结束");
}

/**
 * 输出 TeamFlow 就绪提示。
 */
private static void showReadyMessage() {
    System.out.println("TeamFlow 方法准备就绪");
}
```

**正确写法：**

```java
/**
 * 调用就绪提示后结束主流程。
 *
 * @param args 启动参数，本程序暂不使用
 */
public static void main(String[] args) {
    showReadyMessage();
    System.out.println("主流程结束");
}
```

**验证方式：** 错误版只输出 `主流程结束`；正确版先输出 `TeamFlow 方法准备就绪`，再输出 `主流程结束`。

### 把方法声明写进 main

**触发条件：** 在 main 的花括号内部再次编写带返回类型、方法名和方法体的完整声明。

**原因：** 本课方法是类成员，只能写在类体中；Java 不允许把这种成员方法声明嵌套在另一个方法体内。

**后果：** JDK 25 与 Java 8 都拒绝编译，常见提示包含 `illegal start of expression`。

**错误示例：**

```java
/**
 * 错误地在入口内部声明辅助方法。
 *
 * @param args 启动参数，本程序暂不使用
 */
public static void main(String[] args) {
    /**
     * 输出 TeamFlow 就绪提示。
     */
    private static void showReadyMessage() {
        System.out.println("TeamFlow 方法准备就绪");
    }
}
```

**正确写法：**

```java
/**
 * 调用类体中的辅助方法。
 *
 * @param args 启动参数，本程序暂不使用
 */
public static void main(String[] args) {
    showReadyMessage();
}

/**
 * 输出 TeamFlow 就绪提示。
 */
private static void showReadyMessage() {
    System.out.println("TeamFlow 方法准备就绪");
}
```

**验证方式：** 两个 JDK 编译错误版都应失败；把辅助方法移到 main 右花括号之后、类的右花括号之前，再编译运行，应输出就绪提示。

### 从静态 main 直接调用非静态方法

**触发条件：** 辅助方法漏写 static，main 却只用方法名直接调用，没有目标对象。

**原因：** main 处于静态上下文；实例方法需要针对一个对象调用，本课还没有创建对象。

**后果：** 两个 JDK 都在编译阶段报告非静态方法不能从静态上下文直接引用。

**错误示例：**

```java
/**
 * 从静态入口直接调用实例方法。
 *
 * @param args 启动参数，本程序暂不使用
 */
public static void main(String[] args) {
    showReadyMessage();
}

/**
 * 错误地声明为实例方法。
 */
private void showReadyMessage() {
    System.out.println("TeamFlow 方法准备就绪");
}
```

**正确写法：**

```java
/**
 * 定义本课同类无状态静态辅助方法。
 */
private static void showReadyMessage() {
    System.out.println("TeamFlow 方法准备就绪");
}
```

**验证方式：** 两个 JDK 编译错误版都应失败；为本课辅助方法补上 static 后重新编译，应成功运行。不要把这个修复泛化为“所有方法都要 static”。

### 调用空参数方法时漏掉圆括号

**触发条件：** 只写方法名和分号，误以为没有输入就不需要圆括号。

**原因：** 方法调用表达式需要圆括号；方法名本身不是本课可独立执行的调用语句。

**后果：** 两个 JDK 都拒绝编译，方法体没有执行机会。

**错误示例：**

```java
showReadyMessage;
```

**正确写法：**

```java
showReadyMessage();
```

**验证方式：** 错误片段编译失败；补齐 `()` 后运行，控制台应出现方法体定义的就绪提示。

### 把 void 调用赋给变量

**触发条件：** void 方法内部打印了字符串，调用方就把整个调用赋给 String 变量。

**原因：** 打印是方法执行的动作；void 明确表示调用不产生结果值。

**后果：** 两个 JDK 都无法把 void 转换成 String，源码编译失败。

**错误示例：**

```java
String message = showReadyMessage();
```

**正确写法：**

```java
showReadyMessage();
```

**验证方式：** 错误片段编译失败；正确片段作为独立语句运行并输出提示。如果调用方确实需要字符串，应把方法返回类型改为 String 并执行带值 return。

### 非 void 方法存在缺少返回的路径

**触发条件：** String 方法只在 if 条件为 true 时返回，条件为 false 时可以走到方法体末尾。

**原因：** 非 void 方法不能沿正常路径直接结束；调用方需要在每条正常路径上得到声明类型的结果。

**后果：** JDK 25 与 Java 8 都报告缺少返回语句，程序不能运行。

**错误示例：**

```java
/**
 * 只在一个条件路径返回状态。
 *
 * @return 当前 TeamFlow 状态
 */
private static String createStatus() {
    int readyTaskCount = 1;
    if (readyTaskCount > 0) {
        return "存在就绪任务";
    }
}
```

**正确写法：**

```java
/**
 * 在每条正常路径返回状态。
 *
 * @return 当前 TeamFlow 状态
 */
private static String createStatus() {
    int readyTaskCount = 1;
    if (readyTaskCount > 0) {
        return "存在就绪任务";
    }
    return "暂无就绪任务";
}
```

**验证方式：** 两个 JDK 编译错误版都应失败；补上末尾返回后编译运行，应得到与局部状态对应的字符串。

### 在 main 中直接读取辅助方法的局部变量

**触发条件：** readyTaskCount 声明在辅助方法内，main 调用方法后直接输出同名变量。

**原因：** 局部变量只在声明它的方法内可见；调用不会把局部变量名带回调用方。

**后果：** 编译器在 main 中找不到该符号，源码无法编译。

**错误示例：**

```java
countReadyTasks();
System.out.println(readyTaskCount);
```

**正确写法：**

```java
int result = countReadyTasks();
System.out.println(result);
```

**验证方式：** 错误片段编译失败；正确片段接住返回值后应输出 `3`，证明调用方得到的是结果值而不是辅助方法的局部变量。

:::

## 八、用完整 TeamFlow 程序串联方法

### 1. JDK 25 完整程序

这个程序让 `main` 只保留主流程：显示启动提示、调用任务统计、取得摘要，再输出最终结果。三个辅助方法
分别演示 `void` 动作、`int` 返回值和 `String` 返回值。

文件：`TeamFlowMethodApplication.java`

```java
/**
 * 使用静态辅助方法组织 TeamFlow 启动检查流程。
 */
public final class TeamFlowMethodApplication {
    /**
     * 按顺序调用启动提示、任务统计和摘要方法。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        showStartupMessage();
        int readyTaskCount = countReadyTasks();
        String summary = createSummary();

        System.out.println(summary);
        System.out.println("就绪任务：" + readyTaskCount);
    }

    /**
     * 输出 TeamFlow 启动提示。
     */
    private static void showStartupMessage() {
        System.out.println("TeamFlow 方法流程开始");
    }

    /**
     * 逐条检查任务并返回就绪数量。
     *
     * @return 已完成检查的任务数量
     */
    private static int countReadyTasks() {
        int readyTaskCount = 0;

        for (int taskNumber = 1; taskNumber <= 3; taskNumber++) {
            System.out.println("检查任务：" + taskNumber);
            readyTaskCount++;
        }

        return readyTaskCount;
    }

    /**
     * 创建 TeamFlow 方法调用摘要。
     *
     * @return 方法调用完成提示
     */
    private static String createSummary() {
        return "TeamFlow 方法调用完成";
    }
}
```

在 IntelliJ IDEA 中使用 JDK 25 项目创建同名 Java 类，确认 Project SDK 与当前 Application 运行配置的
JRE 都是 JDK 25。从 `main` 左侧运行图标启动，控制台应输出：

```text
TeamFlow 方法流程开始
检查任务：1
检查任务：2
检查任务：3
TeamFlow 方法调用完成
就绪任务：3
```

### 2. Java 8 对应的完整程序

本课普通类、传统静态入口、空参数静态方法、`void` 和返回值写法在 Java 8 中没有语法差异。即使代码
相同，下面仍给出完整 Java 8 源码，不能用 JDK 25 文件里的 JEP 512 简洁入口替代。

文件：`TeamFlowMethodApplication.java`

```java
/**
 * 使用 Java 8 兼容静态辅助方法组织 TeamFlow 启动检查流程。
 */
public final class TeamFlowMethodApplication {
    /**
     * 按顺序调用启动提示、任务统计和摘要方法。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        showStartupMessage();
        int readyTaskCount = countReadyTasks();
        String summary = createSummary();

        System.out.println(summary);
        System.out.println("就绪任务：" + readyTaskCount);
    }

    /**
     * 输出 TeamFlow 启动提示。
     */
    private static void showStartupMessage() {
        System.out.println("TeamFlow 方法流程开始");
    }

    /**
     * 逐条检查任务并返回就绪数量。
     *
     * @return 已完成检查的任务数量
     */
    private static int countReadyTasks() {
        int readyTaskCount = 0;

        for (int taskNumber = 1; taskNumber <= 3; taskNumber++) {
            System.out.println("检查任务：" + taskNumber);
            readyTaskCount++;
        }

        return readyTaskCount;
    }

    /**
     * 创建 TeamFlow 方法调用摘要。
     *
     * @return 方法调用完成提示
     */
    private static String createSummary() {
        return "TeamFlow 方法调用完成";
    }
}
```

在 IntelliJ IDEA 的 **File | Project Structure | Project** 中选择已安装的 JDK 8 作为 **Project SDK**，
并确认当前 Application 运行配置的 JRE 使用 **Project SDK**。运行同名类，预期输出与 JDK 25 的六行结果
完全相同。

### 3. 按调用顺序解释完整结果

`main` 先调用 `showStartupMessage()`，所以第一行来自 `void` 方法。接着 `countReadyTasks()` 进入三轮
循环，依次输出任务编号，并把局部计数从 `0` 增加到 `3`；执行 `return` 后，整数 `3` 交给 `main` 的
`readyTaskCount`。

`createSummary()` 没有直接打印，它只返回字符串；直到 `main` 把 `summary` 交给 `println`，摘要才显示。
最后一行使用调用方保存的整数结果。整个过程中每次调用都完成后才回到 `main` 的下一条语句。

## 九、练习：拆分发布检查主流程

### 1. 任务与验收

:::exercise
### 拆分发布检查主流程

**要求：** 创建 `TeamFlowMethodPractice.java`。使用一个 String 返回值方法创建看板名称，使用一个 void 方法输出发布准备提示，使用一个 int 返回值方法通过 while 完成两轮检查并返回次数。所有辅助方法都必须是当前类中的空参数 static 方法，并在 main 中按“名称、提示、检查、总数”的顺序调用；不得使用自定义参数、数组操作、对象或框架。JDK 25 与 Java 8 都使用传统 main 入口。

**验收：** 两个版本都依次输出 `看板：TeamFlow 学习看板`、`准备发布`、`执行检查：1`、`执行检查：2` 和 `检查总数：2`；每个方法定义上方有中文 Javadoc，main 不能直接读取辅助方法的局部变量。

**参考答案：** 先分别确定三个辅助方法是返回 String、执行 void 动作还是返回 int，再让 main 使用调用表达式串联结果；与下面两份完整实现逐行对照。
:::

### 2. JDK 25 完整参考实现

```java
/**
 * 使用空参数静态方法组织 TeamFlow 发布检查。
 */
public final class TeamFlowMethodPractice {
    /**
     * 按顺序调用看板名称、准备提示和检查统计方法。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        String boardName = createBoardName();
        System.out.println("看板：" + boardName);

        showReleaseMessage();
        int checkCount = runReleaseChecks();
        System.out.println("检查总数：" + checkCount);
    }

    /**
     * 创建 TeamFlow 学习看板名称。
     *
     * @return 学习看板名称
     */
    private static String createBoardName() {
        return "TeamFlow 学习看板";
    }

    /**
     * 输出发布准备提示。
     */
    private static void showReleaseMessage() {
        System.out.println("准备发布");
    }

    /**
     * 执行两轮发布检查并返回次数。
     *
     * @return 已完成的检查次数
     */
    private static int runReleaseChecks() {
        int checkCount = 0;

        while (checkCount < 2) {
            checkCount++;
            System.out.println("执行检查：" + checkCount);
        }

        return checkCount;
    }
}
```

在 JDK 25 项目中运行 `TeamFlowMethodPractice`，预期输出：

```text
看板：TeamFlow 学习看板
准备发布
执行检查：1
执行检查：2
检查总数：2
```

### 3. Java 8 完整参考实现

Java 8 的参考实现保持传统静态入口和显式局部变量类型，完整代码如下：

```java
/**
 * 使用 Java 8 兼容空参数静态方法组织 TeamFlow 发布检查。
 */
public final class TeamFlowMethodPractice {
    /**
     * 按顺序调用看板名称、准备提示和检查统计方法。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        String boardName = createBoardName();
        System.out.println("看板：" + boardName);

        showReleaseMessage();
        int checkCount = runReleaseChecks();
        System.out.println("检查总数：" + checkCount);
    }

    /**
     * 创建 TeamFlow 学习看板名称。
     *
     * @return 学习看板名称
     */
    private static String createBoardName() {
        return "TeamFlow 学习看板";
    }

    /**
     * 输出发布准备提示。
     */
    private static void showReleaseMessage() {
        System.out.println("准备发布");
    }

    /**
     * 执行两轮发布检查并返回次数。
     *
     * @return 已完成的检查次数
     */
    private static int runReleaseChecks() {
        int checkCount = 0;

        while (checkCount < 2) {
            checkCount++;
            System.out.println("执行检查：" + checkCount);
        }

        return checkCount;
    }
}
```

把 Project SDK 和运行配置 JRE 都切换为 JDK 8，运行 `TeamFlowMethodPractice`。控制台应得到与 JDK 25
完全相同的五行输出。若结果不同，按调用顺序检查每个方法是否真正被调用、`void` 方法是否只作动作、
返回值是否由 `main` 接住，以及循环局部计数是否在 `return` 前达到 `2`。

完成后，你应该能够从 `main` 的调用语句还原实际执行顺序，判断一个方法是执行动作还是交回结果，并让
方法内部的局部状态通过 `return` 越过方法边界。下一课再为这些方法加入自定义输入，解释参数怎样接收调用处
提供的值；本课不提前展开。
