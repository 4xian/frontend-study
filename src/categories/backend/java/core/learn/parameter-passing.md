---
id: backend.java.learn.basics.parameter-passing
type: lesson
title: 参数传递
summary: 区分形参与实参，按位置传入固定参数，并用按值传递与 return 准确跟踪 TeamFlow 方法调用中的数据
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 80
prerequisites:
  - backend.java.learn.basics.methods-parameters-and-scope
objectives:
  - 能区分方法声明中的形参与调用位置的实参，并读懂固定参数的类型、数量和顺序。
  - 能按位置为每个形参提供可兼容的实参，并解释一次调用怎样创建参数变量。
  - 能说明 Java 始终按值传递，并区分基本类型值与引用值被复制后的可观察结果。
  - 能判断重新赋值形参为什么不会修改调用方变量。
  - 能通过 return 把计算结果交回调用方，并在调用处显式接收结果。
  - 能定位实参数量、类型、顺序、参数作用域和返回值使用等常见问题。
recap:
  - 形参写在方法声明中，实参写在调用位置；固定参数按数量、类型和位置建立对应关系。
  - 每次方法调用都会创建新的参数变量，并用对应实参值初始化这些变量。
  - Java 始终按值传递；基本类型复制数据值，引用类型复制引用值。
  - 重新赋值形参只改变本次调用的参数变量，不会替换调用方变量。
  - 参数只在声明它的方法体内可见；需要把结果交回调用方时使用 return 并显式接收。
  - 本课参数合同与传统 main 入口在 JDK 25 和 Java 8 中一致。
related: []
tags:
  - Java
  - 参数
  - 形参
  - 实参
  - 按值传递
  - return
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 在本课使用相同参数合同与传统入口
verifiedAt: 2026-08-17
sources:
  - id: jls-25-formal-parameters
    title: Java Language Specification 25 - Formal Parameters
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.1
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 方法调用前使用实参值初始化新创建的形参变量。
      - 固定参数声明由类型和参数名组成，参数名可在方法体中使用。
  - id: jls-25-kinds-of-variables
    title: Java Language Specification 25 - Kinds of Variables
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.12.3
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 每次方法调用都会创建新的参数变量，并用对应实参值初始化。
      - 方法体执行结束后，本次调用的参数变量不再存在。
  - id: jls-25-evaluate-arguments
    title: Java Language Specification 25 - Evaluate Arguments
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12.4.2
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 固定参数调用中的每个实参值按位置对应一个形参。
      - 实参表达式按照从左到右的顺序求值。
  - id: dev-java-calling-methods
    title: Calling Methods and Constructors
    url: https://dev.java/learn/classes-objects/calling-methods-constructors/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java 入门资料
    claims:
      - parameters 与 arguments 的区别。
      - 调用方法时实参需要与声明中的参数类型和顺序匹配。
  - id: jls-8-formal-parameters
    title: Java Language Specification 8 - Formal Parameters
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html#jls-8.4.1
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 同样使用实参值初始化新创建的形参变量。
  - id: stack-overflow-java-pass-by-value
    title: 'Is Java "pass-by-reference" or "pass-by-value"?'
    url: https://stackoverflow.com/questions/40480/is-java-pass-by-reference-or-pass-by-value
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 初学者对引用参数的常见误解
    claims:
      - Java 复制引用变量保存的引用值，不会让形参成为调用方变量的别名。
---

# 参数传递

上一课把 TeamFlow 主流程拆成了几个空参数方法，但这些方法只能使用自己内部写好的数据。真正可复用的
方法需要让调用方提供本次任务的名称、已完成数量或总数。参数就是这条数据通道：方法声明先说明自己
需要什么，调用位置再为本次执行交出具体值。

本课只学习普通静态方法的固定参数。我们会跟踪实参值怎样进入形参、形参重新赋值后谁会变化，以及
结果怎样通过 `return` 回到调用方。数组、可变参数、重载、对象字段和对象状态修改都不在本课展开。

## 一、让调用方为方法提供数据

### 1. 形参写在声明中，实参写在调用中

先看一组最小声明与调用：

```java
/**
 * 输出 TeamFlow 服务名称。
 *
 * @param serviceName 本次要显示的服务名称
 */
private static void printServiceName(String serviceName) {
    System.out.println("服务：" + serviceName);
}
```

圆括号里的 `String serviceName` 是形参。`String` 约定它接收文本，`serviceName` 是方法体读取这份文本
时使用的参数名。调用方法时写出具体值：

```java
printServiceName("TeamFlow");
```

`"TeamFlow"` 是实参。执行到调用语句时，这个实参值交给形参 `serviceName`，所以方法体输出：

```text
服务：TeamFlow
```

形参是方法声明的一部分，描述每次调用都要遵守的输入合同；实参属于某一次调用，提供这一次真正使用
的值。两者名称不需要相同，真正建立对应关系的是位置和值。

### 2. 固定参数同时约定数量和类型

方法可以声明多个固定参数，逗号分隔每一项：

```java
/**
 * 输出 TeamFlow 任务进度。
 *
 * @param completedTasks 已完成任务数
 * @param totalTasks 任务总数
 */
private static void printProgress(int completedTasks, int totalTasks) {
    System.out.println("任务进度：" + completedTasks + "/" + totalTasks);
}
```

这个声明要求两个 `int` 实参。正确调用是：

```java
printProgress(3, 5);
```

控制台输出 `任务进度：3/5`。少传一个、多传一个或传入不能用于 `int` 参数的文本，都会让编译器无法
按这个声明完成调用。本课统一传入与形参类型完全一致的值；调用转换的更多规则不在这里展开。

### 3. 实参与形参按位置对应

固定参数不是按变量名寻找值，而是第一项对应第一项、第二项对应第二项。下面两个形参类型相同，交换
实参后编译器无法根据类型发现业务含义已经颠倒：

```java
int completedTasks = 3;
int totalTasks = 5;

printProgress(completedTasks, totalTasks);
```

正确顺序输出 `任务进度：3/5`。若写成 `printProgress(totalTasks, completedTasks)`，仍然满足“两个
`int`”的语法合同，却会输出 `任务进度：5/3`。参数名应准确表达位置含义，调用时也要按声明顺序逐项
核对。

实参本身是表达式时，Java 会从左到右求出各实参值，再让第一个值对应第一个形参。初学阶段不要在实参
里同时修改变量；先把要传的值保存在名称清楚的局部变量中，调用关系更容易检查。

## 二、一次调用会创建自己的参数变量

### 1. 每次调用都有新的形参

参数名不是全局共享的存储位置。每次调用方法时，Java 都会为该次调用创建新的参数变量，并用对应实参
值初始化：

```java
/**
 * 输出一次任务检查。
 *
 * @param taskNumber 本次检查的任务编号
 */
private static void printTask(int taskNumber) {
    System.out.println("检查任务：" + taskNumber);
}
```

连续调用：

```java
printTask(1);
printTask(2);
```

第一次调用里的 `taskNumber` 从 `1` 开始，方法结束后这次参数变量不再使用；第二次调用创建另一份
`taskNumber`，从 `2` 开始。因此输出依次是 `检查任务：1` 和 `检查任务：2`，两次调用不会互相覆盖。

### 2. 形参只在当前方法体内可见

形参名可以在声明它的方法体中读取和重新赋值，但不能跨到另一个方法：

```java
/**
 * 输出指定服务的状态。
 *
 * @param serviceName 本次检查的服务名称
 */
private static void printStatus(String serviceName) {
    System.out.println(serviceName + "：准备就绪");
}
```

`serviceName` 的可见范围是 `printStatus` 的方法体。`main` 若需要服务名称，应拥有自己的局部变量，再把
它作为实参传入；不能在调用结束后直接读取 `printStatus` 的形参。

这种边界让方法只依赖声明中明确列出的输入。阅读调用 `printStatus(serviceName)` 时，可以从圆括号直接
看到数据从调用方进入方法，而不必猜测方法会读取哪个外部局部变量。

### 3. 参数变量从实参值开始，不与调用方变量合并

调用方可以把变量当前保存的值作为实参：

```java
int completedTasks = 3;
printProgress(completedTasks, 5);
```

执行调用时，先读取调用方 `completedTasks` 当前保存的整数 `3`，再用 `3` 初始化方法中的参数变量。
调用方变量和参数变量名称即使相同，也仍是两个不同变量。这个“先取得值，再创建参数变量”的过程就是
理解 Java 参数传递的基础。

## 三、Java 始终按值传递

### 1. 基本类型复制具体数据值

下面的方法把形参重新赋值为 `4`：

```java
/**
 * 只更新本次调用的数量参数。
 *
 * @param completedTasks 传入的已完成任务数
 */
private static void markOneMoreTask(int completedTasks) {
    completedTasks = completedTasks + 1;
    System.out.println("方法内：" + completedTasks);
}
```

调用方这样使用：

```java
int completedTasks = 3;
markOneMoreTask(completedTasks);
System.out.println("调用后：" + completedTasks);
```

输出是：

```text
方法内：4
调用后：3
```

实参提供的是整数值 `3`。形参取得一份 `3` 后变成 `4`，只改变本次调用的参数变量；调用方的
`completedTasks` 仍保存 `3`。

### 2. 引用类型复制的是引用值

`String` 变量保存的是引用值。传入方法时，Java 仍然按值传递，只是这次复制的值是一份引用：

```java
/**
 * 只让本次调用的文本参数改为另一个字符串。
 *
 * @param serviceName 传入的服务名称
 */
private static void renameLocally(String serviceName) {
    serviceName = "TeamFlow Pro";
    System.out.println("方法内：" + serviceName);
}
```

调用代码：

```java
String serviceName = "TeamFlow";
renameLocally(serviceName);
System.out.println("调用后：" + serviceName);
```

输出是：

```text
方法内：TeamFlow Pro
调用后：TeamFlow
```

形参最初取得与调用方相同的引用值；执行赋值后，只有形参改为保存另一个引用值。调用方变量没有被重新
赋值，所以仍得到 `TeamFlow`。本课只观察参数重新绑定，不提前讨论可变对象的字段或状态修改。

### 3. 复制引用值不叫按引用传递

**社区补充：** Stack Overflow 的高票讨论反复澄清了一个真实误区：参数能够使用一份引用值，不等于
形参成为调用方变量的别名。判断方法是否按引用传递，要看方法能否通过给形参重新赋值而替换调用方变量；
上面的 `renameLocally` 已经证明 Java 做不到这一点。这个结论也与 JLS 的“新建参数变量并用实参值初始化”
合同一致。

因此，本课统一使用准确表述：基本类型参数复制基本类型值，引用类型参数复制引用值，两者都是按值传递。
不要把“复制了引用值”简称成“按引用传递”。

### 4. 需要更新调用方结果时使用 return

方法不能靠重新赋值形参来改变调用方变量。需要把计算结果交回去时，让方法返回值，并由调用方接收：

```java
/**
 * 返回增加一个任务后的数量。
 *
 * @param completedTasks 当前已完成任务数
 * @return 增加一个任务后的数量
 */
private static int addCompletedTask(int completedTasks) {
    return completedTasks + 1;
}
```

调用方显式赋值：

```java
int completedTasks = 3;
completedTasks = addCompletedTask(completedTasks);
System.out.println(completedTasks);
```

实参值 `3` 初始化形参，方法计算并返回 `4`，调用表达式产生的结果再写回调用方变量，所以最终输出
`4`。`return` 交回的是计算结果，不会改变 Java 按值传递的规则。

## 四、在 IntelliJ IDEA 中完成第一次带参数调用

### 1. 核对项目 JDK

继续使用前置课程创建的普通 Java 项目。在 **File | Project Structure | Project** 中确认 **Project SDK**
为 JDK 25，再打开当前 Application 运行配置，确认 **JRE** 使用 **Project SDK** 或同一套 JDK 25。

Project SDK 决定 IDEA 用哪套 Java 工具理解和构建项目，运行配置 JRE 决定点击运行时实际启动哪套 Java。
两处都显示 25，才能确认编辑器和运行过程处于同一教学版本。

### 2. 创建带参数的预览类

在项目 `src` 目录右键选择 **New | Java Class**，创建新文件 `TeamFlowParameterPreview.java`，填入：

```java
/**
 * 演示 TeamFlow 固定参数的声明与调用。
 */
public final class TeamFlowParameterPreview {
    /**
     * 传入服务名称与就绪任务数并启动预览。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        printStatus("TeamFlow", 2);
    }

    /**
     * 输出服务名称与就绪任务数。
     *
     * @param serviceName 服务名称
     * @param readyTasks 就绪任务数
     */
    private static void printStatus(String serviceName, int readyTasks) {
        System.out.println(serviceName + " 就绪任务：" + readyTasks);
    }
}
```

类名与文件名保持一致。`printStatus` 声明两个形参，`main` 调用时按同样顺序给出一个 `String` 实参和
一个 `int` 实参。

### 3. 运行并观察参数结果

点击 `main` 左侧运行图标，选择 **Run 'TeamFlowParameterPreview.main()'**。控制台应只出现：

```text
TeamFlow 就绪任务：2
```

出现这行结果，说明运行的是正确类；文本实参到达 `serviceName`，整数实参到达 `readyTasks`，方法体按
参数位置拼接了两份值。若 IDEA 报参数不匹配，先对照声明逐项核对数量、类型和顺序，不要改为后续课程
才会学习的可变参数。

### 4. Java 8 的本课写法

固定参数、参数变量、按值传递和 `return` 在 Java 8 与 JDK 25 中没有本课可见的差异。Java 8 项目仍需
使用传统 `public static void main(String[] args)` 入口；后面的双版本程序都会完整写出同一参数合同，
不会用“同上”省略代码。

## 五、常见易错情况

下面只处理参数调用最常见的边界，不扩张为完整错误诊断课程。先看编译器或输出表现，再回到声明与调用
位置逐项核对。

:::pitfalls
### 实参数量与形参数量不一致

**触发条件：** `printProgress` 声明两个固定参数，调用时只传入一个实参。

**原因：** 固定参数调用需要为每个形参提供对应实参，本课不存在自动补值。

**后果：** Java 25 和 Java 8 都编译失败，方法不会运行。

**错误示例：**

```java
printProgress(3);
```

**正确写法：**

```java
printProgress(3, 5);
```

**验证方式：** 对错误调用执行编译，确认出现“实际参数列表与形式参数列表长度不同”或等价诊断；补齐第二个 `int` 实参后重新编译并运行，应输出 `任务进度：3/5`。

### 实参类型不能用于对应形参

**触发条件：** 第一个形参需要 `int`，调用时传入字符串 `"3"`。

**原因：** 文本值不能直接作为本课 `int` 固定参数的实参。

**后果：** 编译器找不到可应用于这组实参的方法，程序无法启动。

**错误示例：**

```java
printProgress("3", 5);
```

**正确写法：**

```java
printProgress(3, 5);
```

**验证方式：** 编译错误版应非零退出；把字符串改为整数后，Java 25 与 Java 8 都应编译成功并输出 `任务进度：3/5`。

### 同类型实参顺序颠倒

**触发条件：** 两个形参都是 `int`，调用时把总数放在已完成数量之前。

**原因：** 实参与形参按位置对应，编译器只能检查类型，不能推断两个整数的业务含义。

**后果：** 源码能够编译，但输出变成不合理的 `任务进度：5/3`。

**错误示例：**

```java
printProgress(totalTasks, completedTasks);
```

**正确写法：**

```java
printProgress(completedTasks, totalTasks);
```

**验证方式：** 使用 `completedTasks = 3`、`totalTasks = 5` 运行两次调用；错误版会输出 `5/3`，正确版必须精确输出 `3/5`。

### 误以为重新赋值基本类型形参会修改调用方变量

**触发条件：** 调用一个 `void` 方法在内部增加参数，然后直接读取调用方原变量。

**原因：** `int` 实参值被复制到新形参，方法内赋值只改变参数变量。

**后果：** 方法内看到 `4`，调用结束后原变量仍是 `3`，后续计算使用旧数据。

**错误示例：**

```java
/**
 * 只修改本次调用的参数变量。
 *
 * @param count 传入数量
 */
private static void increaseLocally(int count) {
    count = count + 1;
}
```

**正确写法：**

```java
/**
 * 返回增加后的数量。
 *
 * @param count 传入数量
 * @return 增加后的数量
 */
private static int increasedCount(int count) {
    return count + 1;
}
```

**验证方式：** 错误版调用后原变量应仍为 `3`；正确版执行 `count = increasedCount(count)` 后必须输出 `4`。

### 把引用值复制误称为按引用传递

**触发条件：** `String` 实参传入方法后，认为给形参重新赋值也会替换调用方变量。

**原因：** Java 复制的是调用方变量保存的引用值，形参仍是本次调用新建的独立变量。

**后果：** 方法内显示新文本，调用方却继续保存原文本，程序结果与错误预期不一致。

**错误示例：**

```java
/**
 * 只重新赋值本次调用的参数变量。
 *
 * @param serviceName 原服务名称
 */
private static void renameLocally(String serviceName) {
    serviceName = "TeamFlow Pro";
}
```

**正确写法：**

```java
/**
 * 返回新的服务名称。
 *
 * @param serviceName 原服务名称
 * @return 增加后缀的新名称
 */
private static String renamedService(String serviceName) {
    return serviceName + " Pro";
}
```

**验证方式：** 调用错误版后输出原变量仍应是 `TeamFlow`；执行 `serviceName = renamedService(serviceName)` 后应输出 `TeamFlow Pro`。

### 调用了返回值方法却没有接收结果

**触发条件：** 把有返回值的方法当成只执行动作的语句调用。

**原因：** Java 允许忽略调用表达式产生的结果，但被忽略的值不会自动写回任何调用方变量。

**后果：** 源码可以运行，`completedTasks` 却仍保持旧值，形成不易察觉的业务错误。

**错误示例：**

```java
addCompletedTask(completedTasks);
```

**正确写法：**

```java
completedTasks = addCompletedTask(completedTasks);
```

**验证方式：** 从初始值 `3` 分别运行两种写法；错误版输出 `3`，正确版必须输出 `4`。

### 在另一个方法中直接读取形参

**触发条件：** 形参只声明在 `printStatus` 中，却在 `main` 直接使用同名参数。

**原因：** 参数的作用域只覆盖声明它的方法体，不会进入其他方法。

**后果：** 编译器在 `main` 中找不到 `serviceName`，源码无法编译。

**错误示例：**

```java
/**
 * 错误地读取另一个方法的形参。
 *
 * @param args 启动参数，本程序暂不使用
 */
public static void main(String[] args) {
    System.out.println(serviceName);
}
```

**正确写法：**

```java
/**
 * 在调用方声明自己的变量，再作为实参传入。
 *
 * @param args 启动参数，本程序暂不使用
 */
public static void main(String[] args) {
    String serviceName = "TeamFlow";
    printStatus(serviceName);
}
```

**验证方式：** 编译错误版应出现“找不到符号”或等价诊断；正确版运行后应输出 `TeamFlow：准备就绪`。
::::

## 六、用完整 TeamFlow 程序串联参数

### 1. JDK 25 完整程序

在 JDK 25 普通 Java 项目的 `src` 目录创建 `TeamFlowParameterApplication.java`。程序把服务名称、已完成
任务数和总任务数从 `main` 传给不同方法，再显式接收剩余任务数与摘要。

```java
/**
 * 使用固定参数组织 TeamFlow 任务准备流程。
 */
public final class TeamFlowParameterApplication {
    /**
     * 准备输入、调用参数方法并输出最终摘要。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        String serviceName = "TeamFlow";
        int completedTasks = 3;
        int totalTasks = 5;

        printStartupMessage(serviceName);
        printProgress(completedTasks, totalTasks);

        int remainingTasks = calculateRemainingTasks(totalTasks, completedTasks);
        String summary = createSummary(serviceName, remainingTasks);
        System.out.println(summary);
    }

    /**
     * 输出指定服务的参数检查提示。
     *
     * @param serviceName 服务名称
     */
    private static void printStartupMessage(String serviceName) {
        System.out.println(serviceName + " 参数检查开始");
    }

    /**
     * 输出已完成任务数与任务总数。
     *
     * @param completedTasks 已完成任务数
     * @param totalTasks 任务总数
     */
    private static void printProgress(int completedTasks, int totalTasks) {
        System.out.println("任务进度：" + completedTasks + "/" + totalTasks);
    }

    /**
     * 计算尚未完成的任务数。
     *
     * @param totalTasks 任务总数
     * @param completedTasks 已完成任务数
     * @return 尚未完成的任务数
     */
    private static int calculateRemainingTasks(int totalTasks, int completedTasks) {
        return totalTasks - completedTasks;
    }

    /**
     * 创建 TeamFlow 剩余任务摘要。
     *
     * @param serviceName 服务名称
     * @param remainingTasks 尚未完成的任务数
     * @return 剩余任务摘要
     */
    private static String createSummary(String serviceName, int remainingTasks) {
        return serviceName + " 剩余任务：" + remainingTasks;
    }
}
```

在 IDEA 中确认 Project SDK 与运行配置 JRE 都是 JDK 25，从 `main` 左侧运行该类。控制台必须精确输出：

```text
TeamFlow 参数检查开始
任务进度：3/5
TeamFlow 剩余任务：2
```

### 2. Java 8 对应的完整程序

为 Java 8 建立独立的普通 Java 项目，在 **File | Project Structure | Project** 中选择已安装的 JDK 8
作为 **Project SDK**，并确认 Application 运行配置的 **JRE** 使用 **Project SDK**。在该项目 `src` 下
创建同名文件，使用完整代码：

```java
/**
 * 使用 Java 8 兼容固定参数组织 TeamFlow 任务准备流程。
 */
public final class TeamFlowParameterApplication {
    /**
     * 准备输入、调用参数方法并输出最终摘要。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        String serviceName = "TeamFlow";
        int completedTasks = 3;
        int totalTasks = 5;

        printStartupMessage(serviceName);
        printProgress(completedTasks, totalTasks);

        int remainingTasks = calculateRemainingTasks(totalTasks, completedTasks);
        String summary = createSummary(serviceName, remainingTasks);
        System.out.println(summary);
    }

    /**
     * 输出指定服务的参数检查提示。
     *
     * @param serviceName 服务名称
     */
    private static void printStartupMessage(String serviceName) {
        System.out.println(serviceName + " 参数检查开始");
    }

    /**
     * 输出已完成任务数与任务总数。
     *
     * @param completedTasks 已完成任务数
     * @param totalTasks 任务总数
     */
    private static void printProgress(int completedTasks, int totalTasks) {
        System.out.println("任务进度：" + completedTasks + "/" + totalTasks);
    }

    /**
     * 计算尚未完成的任务数。
     *
     * @param totalTasks 任务总数
     * @param completedTasks 已完成任务数
     * @return 尚未完成的任务数
     */
    private static int calculateRemainingTasks(int totalTasks, int completedTasks) {
        return totalTasks - completedTasks;
    }

    /**
     * 创建 TeamFlow 剩余任务摘要。
     *
     * @param serviceName 服务名称
     * @param remainingTasks 尚未完成的任务数
     * @return 剩余任务摘要
     */
    private static String createSummary(String serviceName, int remainingTasks) {
        return serviceName + " 剩余任务：" + remainingTasks;
    }
}
```

运行 `TeamFlowParameterApplication`，Java 8 控制台也必须得到同样三行输出。两份代码相同，是因为本课
使用的固定参数、按值传递、`return` 和传统入口在两个版本中合同一致，而不是省略了版本差异。

### 3. 按执行顺序解释参数和值

`main` 先创建自己的三个局部变量。调用 `printStartupMessage(serviceName)` 时，形参得到引用值的一份
复制并输出第一行；调用 `printProgress(completedTasks, totalTasks)` 时，两个整数值按位置进入两个形参，
所以输出 `3/5`。

`calculateRemainingTasks(totalTasks, completedTasks)` 的第一形参取得 `5`，第二形参取得 `3`，返回计算
结果 `2`。调用方把 `2` 保存到 `remainingTasks`，再把服务名称与剩余数传给 `createSummary`。最后由
`main` 输出返回的摘要。每次调用都有自己的参数变量，所有需要继续使用的结果都通过 `return` 明确交回。

## 七、练习：传递看板进度

### 1. 任务与验收

:::exercise
### 传递看板进度

**要求：** 创建 `TeamFlowParameterPractice.java`。在 main 中声明看板名称、已完成卡片数和卡片总数；使用一个带三个固定参数的 void 方法输出看板与进度，使用一个带两个 int 参数的方法返回待完成数，再使用一个带 String 和 int 参数的方法返回最终摘要。必须按声明位置传参并显式接收两个返回值；不得使用数组、varargs、重载、对象字段或框架。JDK 25 与 Java 8 都使用传统 main 入口，所有方法上方写中文 Javadoc。

**验收：** 两个版本都依次输出 `看板：TeamFlow 开发看板`、`卡片进度：4/6` 和 `TeamFlow 开发看板待完成：2`；交换两个 int 实参时能够说明为什么编译器不报错但结果会错误。

**参考答案：** 调用处按“已完成数、总数”输出进度，按“总数、已完成数”计算差值，并把返回的待完成数继续传给摘要方法；完整实现见下方两份代码。
:::

### 2. JDK 25 完整参考实现

```java
/**
 * 使用固定参数完成 TeamFlow 看板进度练习。
 */
public final class TeamFlowParameterPractice {
    /**
     * 准备看板数据并输出验收结果。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        String boardName = "TeamFlow 开发看板";
        int completedCards = 4;
        int totalCards = 6;

        printBoardProgress(boardName, completedCards, totalCards);
        int pendingCards = calculatePendingCards(totalCards, completedCards);
        String summary = createBoardSummary(boardName, pendingCards);
        System.out.println(summary);
    }

    /**
     * 输出看板名称与卡片进度。
     *
     * @param boardName 看板名称
     * @param completedCards 已完成卡片数
     * @param totalCards 卡片总数
     */
    private static void printBoardProgress(
            String boardName, int completedCards, int totalCards) {
        System.out.println("看板：" + boardName);
        System.out.println("卡片进度：" + completedCards + "/" + totalCards);
    }

    /**
     * 计算待完成卡片数。
     *
     * @param totalCards 卡片总数
     * @param completedCards 已完成卡片数
     * @return 待完成卡片数
     */
    private static int calculatePendingCards(int totalCards, int completedCards) {
        return totalCards - completedCards;
    }

    /**
     * 创建看板待完成摘要。
     *
     * @param boardName 看板名称
     * @param pendingCards 待完成卡片数
     * @return 看板待完成摘要
     */
    private static String createBoardSummary(String boardName, int pendingCards) {
        return boardName + "待完成：" + pendingCards;
    }
}
```

在 JDK 25 项目中运行 `TeamFlowParameterPractice`，预期输出：

```text
看板：TeamFlow 开发看板
卡片进度：4/6
TeamFlow 开发看板待完成：2
```

### 3. Java 8 完整参考实现

```java
/**
 * 使用 Java 8 兼容固定参数完成 TeamFlow 看板进度练习。
 */
public final class TeamFlowParameterPractice {
    /**
     * 准备看板数据并输出验收结果。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        String boardName = "TeamFlow 开发看板";
        int completedCards = 4;
        int totalCards = 6;

        printBoardProgress(boardName, completedCards, totalCards);
        int pendingCards = calculatePendingCards(totalCards, completedCards);
        String summary = createBoardSummary(boardName, pendingCards);
        System.out.println(summary);
    }

    /**
     * 输出看板名称与卡片进度。
     *
     * @param boardName 看板名称
     * @param completedCards 已完成卡片数
     * @param totalCards 卡片总数
     */
    private static void printBoardProgress(
            String boardName, int completedCards, int totalCards) {
        System.out.println("看板：" + boardName);
        System.out.println("卡片进度：" + completedCards + "/" + totalCards);
    }

    /**
     * 计算待完成卡片数。
     *
     * @param totalCards 卡片总数
     * @param completedCards 已完成卡片数
     * @return 待完成卡片数
     */
    private static int calculatePendingCards(int totalCards, int completedCards) {
        return totalCards - completedCards;
    }

    /**
     * 创建看板待完成摘要。
     *
     * @param boardName 看板名称
     * @param pendingCards 待完成卡片数
     * @return 看板待完成摘要
     */
    private static String createBoardSummary(String boardName, int pendingCards) {
        return boardName + "待完成：" + pendingCards;
    }
}
```

在独立 Java 8 项目中确认 Project SDK 和运行配置 JRE 都是 JDK 8，运行同名类，预期输出仍是上面的
三行。练习通过后，应能从每个调用位置指出实参依次进入哪个形参，并能说明计算结果只有在调用方接住
`return` 值后才会继续保留。
