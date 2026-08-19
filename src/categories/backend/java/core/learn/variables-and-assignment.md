---
id: backend.java.learn.basics.variables-and-assignment
type: lesson
title: 变量与赋值
summary: 在 TeamFlow 状态示例中声明、读取和更新局部变量，理解赋值前后的值变化
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 70
prerequisites:
  - backend.java.learn.basics.maven-project-model
objectives:
  - 能区分变量名、变量类型和变量当前保存的值。
  - 能正确完成局部变量的声明、初始化、读取和重新赋值。
  - 能根据执行顺序跟踪赋值前后的变量状态。
  - 能判断右侧结果能否赋给左侧变量，并识别本课涉及的少量赋值转换边界。
  - 能解释基本类型赋值与引用赋值产生不同结果的原因。
  - 能在 JDK 25 中正确使用 var，并写出对应的 Java 8 显式类型代码。
  - 能定位未初始化读取、重复声明、类型不兼容和错误使用 var 等常见问题。
recap:
  - 声明确定变量的类型和名称，初始化提供第一个可读取的值。
  - 局部变量必须在每一条可能执行的路径上先完成赋值，之后才能读取。
  - 赋值先计算右侧表达式，再把结果写入左侧变量，变量类型不会随赋值改变。
  - 基本类型变量之间赋值会复制值，引用变量之间赋值会复制对象引用。
  - var 只省略局部变量声明中的显式类型，变量仍有编译期确定的静态类型。
  - Java 8 不支持 var，其他局部变量声明、确定赋值和重新赋值规则与本课主线一致。
related: []
tags:
  - Java
  - 变量
  - 赋值
  - 确定赋值
  - var
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 使用显式局部变量类型
verifiedAt: 2026-08-16
sources:
  - id: jls-25-identifiers
    title: Java Language Specification 25 - Lexical Structure
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-3.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 标识符与关键字的语言规则
  - id: jls-25-variables
    title: Java Language Specification 25 - Types, Values, and Variables
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 变量、变量类型、基本类型值与引用值的语言规则
  - id: jls-25-local-variables
    title: Java Language Specification 25 - Blocks, Statements, and Patterns
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 局部变量声明、初始化与 var 的适用位置
  - id: jls-25-assignment-conversions
    title: Java Language Specification 25 - Assignment Contexts
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.2
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 赋值上下文允许的转换与整型常量窄化特例
  - id: jls-25-assignment-operators
    title: Java Language Specification 25 - Assignment Operators
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.26
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 简单赋值、赋值表达式的结果与连续赋值的结合规则
  - id: jls-25-definite-assignment
    title: Java Language Specification 25 - Definite Assignment
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-16.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 局部变量在读取前必须确定已赋值
  - id: dev-java-variables
    title: Creating Variables and Naming Them
    url: https://dev.java/learn/language-basics/variables/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java 入门资料
    claims:
      - 变量声明、初始化、赋值与命名的入门说明
  - id: jep-286-local-variable-type-inference
    title: JEP 286 - Local-Variable Type Inference
    url: https://openjdk.org/jeps/286
    sourceOrigin: official
    sourceType: release-note
    appliesTo: Java 10 及以上
    claims:
      - var 的设计目标、静态类型推断与使用边界
  - id: jls-8-local-variables
    title: Java Language Specification 8 - Blocks and Statements
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 局部变量使用显式类型声明
---

# 变量与赋值

程序运行时会不断产生需要暂时保存的数据：购物车里有几件商品、还有多少库存、用户是否已经登录。
如果只把这些数据直接写进代码，程序就无法清楚地表示“这个值现在代表什么”以及“它后来变成了
什么”。变量为一份数据提供名称，赋值则让程序能够记录数据的第一次状态和后续变化。

本课从最小的局部变量开始，但不会停在“照着语法抄一行代码”。你还会看到编译器怎样判断变量能否
读取、赋值语句按什么顺序执行、`var` 到底省略了什么，以及为什么把一个对象变量赋给另一个变量
并不会复制对象。

## 一、理解变量

### 1. 变量名和值

先把变量想成程序中的一个有名字的存储位置。变量名用于找到这个位置，值是这个位置当前保存的
数据。下面的 `completedLessons` 是变量名，`2` 是它最初保存的值：

```java
int completedLessons = 2;
```

这行代码包含三个不同的信息：

- `int` 规定这个变量保存整数。
- `completedLessons` 是后续读取和更新数据时使用的名称。
- `2` 是程序执行到这里时写入变量的值。

变量名不会因为值变化而变化。下面的程序两次读取同一个变量，但两次读取发生在不同的状态：

```java
/**
 * 观察同一个变量在赋值前后的值。
 */
public class VariableStateDemo {
    /**
     * 输出课程完成数量的两次状态。
     */
    public static void main(String[] args) {
        int completedLessons = 2;
        System.out.println(completedLessons);

        completedLessons = 3;
        System.out.println(completedLessons);
    }
}
```

运行结果：

```text
2
3
```

第一次输出读取旧值 `2`，重新赋值把当前值替换成 `3`，第二次输出读取新值。已经输出到控制台的
`2` 不会被回头修改，变化的是变量之后再被读取时得到的结果。

### 2. 类型是变量的长期约束

变量的类型在声明时确定。它不仅描述当前值，还限制以后能够写入哪些值：

```java
int availableSeats = 30;
availableSeats = 29;

boolean enrollmentOpen = false;
enrollmentOpen = true;
```

`availableSeats` 在两次赋值后都保存整数，`enrollmentOpen` 在两次赋值后都保存布尔值。重新赋值
允许值发生变化，不允许变量突然变成另一种类型。

```java
int availableSeats = 30;
// availableSeats = true; // 编译错误：boolean 不能赋给 int
```

这里暂时使用 `int`、`boolean` 和 `String` 作为现成例子，不展开每种类型的范围、精度和转换规则。
这一课需要先建立的心智模型是：变量的值可以更新，变量的静态类型不会跟着更新。

## 二、声明与初始化

### 1. 一行声明由哪些部分组成

局部变量声明的基本形式是“类型 + 名称”，末尾使用分号：

```java
int completedLessons;
```

这时编译器已经知道变量存在以及它能够保存什么类型，但变量还没有可读取的值。声明后第一次给它
赋值，叫作首次赋值：

```java
int completedLessons;
completedLessons = 2;
```

初始化器是写在声明中的 `= 2`。带初始化器的声明会在声明执行时计算右侧并提供第一个值：

```java
int completedLessons = 2;
```

四种动作不要混在一起理解：

| 动作 | 示例 | 执行后状态 |
| --- | --- | --- |
| 声明 | `int count;` | 名称和类型已确定，还不能读取 |
| 声明时初始化 | `int count = 1;` | 声明执行时获得第一个值 |
| 声明后首次赋值 | `count = 1;` | 已声明变量第一次获得值 |
| 重新赋值 | `count = 2;` | 原值被新值替换 |

初始化和首次赋值都能让变量满足后续读取条件，但它们在源码结构上不是同一个动作。只声明不初始化
并非总是错误，真正的限制是第一次读取前必须确定已经赋值。

### 2. 变量名既要合法也要表达含义

Java 标识符可以由字母、数字、下划线和美元符号等字符组成，但不能以数字开头，也不能与关键字
相同。局部变量通常使用小驼峰命名：第一个单词小写，后续单词首字母大写。

```java
int lessonCount = 6;
int completedLessons = 2;
boolean enrollmentOpen = true;
String courseTitle = "Java 基础";
```

这些名称说明了值在业务中的含义。`a`、`x1` 和 `data2` 可能合法，却要求阅读者回头猜测它们代表
什么。名字也不需要重复类型，例如 `completedLessonsInt` 通常不如 `completedLessons` 清楚。

下面两种名称会直接导致编译失败：

```java
// int 2ndLesson = 2;  // 不能以数字开头
// int class = 1;      // class 是关键字
```

:::warning
JDK 25 把单独的 `_` 用于特定的未命名声明，它不是能够在后续表达式中读取的普通变量名。这项语法
有自己的使用场景，本课不展开；需要保存并读取数据时，应选择能够表达含义的变量名。
:::

### 3. 读取前必须确定已经赋值

Java 不会为局部变量偷偷填入一个默认值。编译器会检查程序可能经过的每一条执行路径；只有能够
证明变量在当前读取点之前一定完成了赋值，读取才合法。这项规则叫作确定赋值。

最直接的错误是在声明后马上读取：

```java
int completedLessons;
// System.out.println(completedLessons);
```

典型编译提示包含：

```text
variable completedLessons might not have been initialized
```

更深一层的情况是某些路径赋值、某些路径没有赋值：

```java
boolean hasProgress = true;
int completedLessons;

if (hasProgress) {
    completedLessons = 2;
}

// System.out.println(completedLessons); // 编译错误
```

即使示例中的 `hasProgress` 当前写成 `true`，编译器仍按语言规则分析控制路径。要让读取合法，必须
保证每个可能继续执行到输出语句的分支都完成赋值：

```java
boolean hasProgress = true;
int completedLessons;

if (hasProgress) {
    completedLessons = 2;
} else {
    completedLessons = 0;
}

System.out.println(completedLessons);
```

这不是为了让代码显得严格，而是为了阻止程序读取一个没有明确定义含义的状态。

两个看起来互补的独立判断，也不等于一个结构完整的分支：

```java
boolean hasProgress = true;
int completedLessons;

if (hasProgress) {
    completedLessons = 2;
}
if (!hasProgress) {
    completedLessons = 0;
}

// System.out.println(completedLessons); // 仍然编译错误
```

人可以看出两个条件相反，但确定赋值分析通常不会替普通表达式证明这种布尔关系。把它写成完整的
`if/else`，才能从代码结构上明确保证两条路径都完成赋值。也不要为了消除错误就随意初始化成 `0`；
只有当 `0` 确实代表合理业务状态时，它才是正确初值。

### 4. 赋入的值必须与变量类型兼容

赋值不是把任意数据塞进变量。编译器会检查右侧表达式产生的结果能否赋给左侧类型：

```java
int completedLessons = 2;
completedLessons = 3;

boolean courseFinished = false;
courseFinished = true;
```

下面的两个方向都不兼容：

```java
// completedLessons = true;
// courseFinished = 3;
```

类型检查发生在编译阶段，因此错误不会等到程序运行一半才暴露。赋值上下文也允许少量明确的转换。
本课只掌握最常遇到的三种情况：

```java
int requestCount = 120;
long archivedRequestCount = requestCount; // int 可以宽化为 long

byte level = 100; // 常量 100 在 byte 范围内，允许窄化特例
```

普通 `int` 变量即使当前值也是 `100`，也不能直接使用同一个窄化特例：

```java
int score = 100;
// byte level = score; // 编译错误：int 变量不能隐式窄化为 byte
```

编译器检查的是表达式类型和语言允许的转换，不会因为普通变量当前碰巧保存较小数值，就假设它以后
永远不会超出范围。强制转换、截断和溢出风险需要结合类型转换完整学习；当前先能判断同类型赋值、
基本类型宽化和可表示的整型常量特例。

## 三、读取与更新

### 1. 读取不会自动修改变量

在表达式中写出变量名，就会读取它当前保存的值。读取本身不会消耗或重置数据：

```java
int availableSeats = 30;

System.out.println(availableSeats);
System.out.println(availableSeats);
System.out.println(availableSeats);
```

运行结果：

```text
30
30
30
```

三次输出之间没有赋值语句，所以三次读取都得到 `30`。如果程序需要状态变化，代码中必须出现能
产生新值并写回变量的动作。

### 2. 重新赋值不再重复写类型

类型只在声明变量时写一次。变量已经存在后，更新它只写“变量名 + `=` + 新值”：

```java
int availableSeats = 30;
availableSeats = 29;
availableSeats = 28;
```

如果重新写类型，含义就不再是“更新原变量”，而是“再次声明一个变量”。同一作用范围内重复声明
同名局部变量会编译失败：

```java
int availableSeats = 30;
// int availableSeats = 29; // 编译错误：变量已定义
```

把声明与更新分开后，代码的状态变化会更容易跟踪：

```java
int availableSeats = 30; // 创建状态
availableSeats = 29;     // 第一次变化
availableSeats = 28;     // 第二次变化
```

### 3. 右侧先计算，结果再写回左侧

更准确地说，简单赋值会先确定左侧代表哪个变量，再计算 `=` 右边的表达式，最后执行必要的赋值
转换并把结果存入左侧。普通局部变量名的左侧确定过程没有可观察变化，所以可以先直观理解为“计算
右侧，再写回左侧”。右侧可以读取左侧变量的旧值：

```java
int completedLessons = 2;
int newlyCompleted = 1;

completedLessons = completedLessons + newlyCompleted;
System.out.println(completedLessons);
```

运行结果：

```text
3
```

可以把这条语句按时间顺序拆开理解：

1. 读取 `completedLessons` 的旧值 `2`。
2. 读取 `newlyCompleted` 的值 `1`。
3. 计算 `2 + 1`，得到 `3`。
4. 把 `3` 写回 `completedLessons`。

如果第二次执行同一条更新语句，右侧读取的旧值已经是 `3`，最终会写回 `4`。这就是程序用变量
累积状态的基本过程。

### 4. 连续赋值从右向左结合

赋值本身也是一个表达式，它产生“赋值后左侧变量的值”。因此 Java 允许连续赋值：

```java
int firstCount;
int secondCount;

firstCount = secondCount = 0;

System.out.println(firstCount);
System.out.println(secondCount);
```

运行结果：

```text
0
0
```

这条语句按 `firstCount = (secondCount = 0)` 理解：先把 `0` 赋给 `secondCount`，内层赋值表达式
的结果仍是 `0`，再把它赋给 `firstCount`。

连续赋值适合少量变量使用同一个简单初值。只要右侧开始包含计算、方法调用或不同含义的变量，拆成
多行通常更容易阅读和调试：

```java
int firstCount = 0;
int secondCount = 0;
```

## 四、局部类型推断

### 1. var 省略的是类型文字

JDK 25 允许在局部变量声明中使用 `var`。编译器根据右侧初始化表达式推断出具体类型：

```java
var completedLessons = 2;
var enrollmentOpen = true;
var courseTitle = "Java 基础";
```

这三行分别等价于：

```java
int completedLessons = 2;
boolean enrollmentOpen = true;
String courseTitle = "Java 基础";
```

`var` 不会把 Java 变成动态类型语言，也不是“什么类型都能装”的容器。编译完成后，三个变量仍然
分别具有确定的静态类型：

```java
var completedLessons = 2;
completedLessons = 3;
// completedLessons = true; // 编译错误：推断出的类型是 int
```

### 2. var 必须有可推断的局部初始值

编译器必须从初始化表达式得到类型，所以 `var` 不能只声明名称：

```java
// var completedLessons;
```

`null` 本身也不能提供一个确定类型：

```java
// var courseTitle = null;
String courseTitle = null;
```

一个 `var` 声明也不能同时声明多个变量，数组简写初始化器没有独立类型，初始化器还不能引用正在
声明的变量：

```java
// var first = 1, second = 2;
// var scores = {60, 80, 100};
// var currentScore = currentScore;
```

这三类写法都无法形成合法、独立且可确定的局部变量类型。拆开声明，或在需要目标类型的地方写出
显式类型：

```java
var first = 1;
var second = 2;
int[] scores = {60, 80, 100};
int currentScore = 0;
```

`var` 的范围也不是“所有出现类型的位置”。它主要用于带初始化器的局部变量；不能替代字段类型、
方法参数类型或方法返回类型：

```java
public class InvalidVarPositions {
    // private var lessonCount = 6;

    // public var findTitle() {
    //     return "Java 基础";
    // }

    // public void update(var completedLessons) {
    // }
}
```

下面是合法的局部位置：

```java
/**
 * 演示 var 可以出现的局部变量位置。
 */
public class LocalVarDemo {
    /**
     * 声明并读取两个局部变量。
     */
    public static void main(String[] args) {
        var courseTitle = "Java 基础";
        var completedLessons = 2;

        System.out.println(courseTitle);
        System.out.println(completedLessons);
    }
}
```

### 3. 什么时候显式类型更清楚

`var` 的价值是减少重复，不是追求最短代码。右侧一眼就能看出类型时，`var` 通常仍然清楚：

```java
var courseTitle = "Java 基础";
var completedLessons = 2;
```

如果变量类型承载重要含义，而右侧表达式无法直接看出结果类型，显式写出类型能降低阅读成本。下面
用方法调用表示这种差异；暂时只观察声明，不需要掌握方法定义：

```java
CourseProgress progress = loadProgress();
// var progress = loadProgress();
```

两种写法都可能合法。选择标准不是“项目是否统一禁止 `var`”，而是阅读者能否在当前代码附近快速
判断变量保存什么、后续允许哪些操作。

### 4. Java 8 使用显式类型

`var` 从 Java 10 开始支持，Java 8 编译器无法识别局部变量类型推断。维护 Java 8 项目时，把类型
明确写出即可：

:::compare{before="Java 8 不支持" after="Java 8 写法"}
### Java 8 不支持

~~~java
var completedLessons = 2;
var courseTitle = "Java 基础";
~~~

### Java 8 写法

~~~java
int completedLessons = 2;
String courseTitle = "Java 基础";
~~~
:::

变量的初始化、确定赋值、读取和重新赋值规则没有因此改变。差异只在于 Java 8 必须把局部变量类型
写在源码中。

## 五、相关拓展

### 1. 基本类型赋值会复制当前值

把一个基本类型变量赋给另一个变量时，右侧当前值会被复制。复制完成后，两个变量各自保存一份值，
后续更新其中一个不会自动更新另一个：

```java
int originalCount = 2;
int copiedCount = originalCount;

originalCount = 3;

System.out.println(originalCount);
System.out.println(copiedCount);
```

运行结果：

```text
3
2
```

执行 `copiedCount = originalCount` 时复制的是当时的整数 `2`，不是建立“让 copiedCount 永远跟随
originalCount”的连接。因此原变量后来变成 `3`，副本仍然是 `2`。

这个规则也解释了为什么下面的交换写法会丢失一个旧值：

```java
int first = 10;
int second = 20;

first = second;
second = first;

System.out.println(first);
System.out.println(second);
```

结果是两个变量都为 `20`。第一条赋值已经覆盖了 `first` 原来的 `10`，第二条赋值再也读不到它。
需要交换时，必须先用第三个变量保存旧值：

```java
int first = 10;
int second = 20;

int temporary = first;
first = second;
second = temporary;
```

### 2. 引用赋值不会复制对象

对象变量保存的是对象引用。把一个对象变量赋给另一个变量时，复制的是引用，而不是创建一份新对象。
两个变量会指向同一个对象：

```java
StringBuilder firstTitle = new StringBuilder("Java");
StringBuilder secondTitle = firstTitle;

secondTitle.append(" 25");

System.out.println(firstTitle);
System.out.println(secondTitle);
```

运行结果：

```text
Java 25
Java 25
```

`secondTitle = firstTitle` 没有执行对象复制。调用 `secondTitle.append` 修改了两者共同指向的
`StringBuilder`，所以通过 `firstTitle` 也能观察到变化。

可以用一张关系图理解赋值后的状态：

```text
firstTitle  ─┐
             ├──> 同一个 StringBuilder 对象："Java 25"
secondTitle ─┘
```

这部分是变量赋值的重要边界：基本类型赋值复制值，对象变量赋值复制引用。如何创建对象、设计类和
控制可变状态会在对象相关内容中继续展开；当前只需要记住“赋值对象变量不等于克隆对象”。

### 3. 赋值表达式也有结果

前面的连续赋值能够成立，是因为赋值表达式本身会产生一个结果。这个结果可以继续参与更外层的
表达式：

```java
int completedLessons;
int displayedLessons = (completedLessons = 3);

System.out.println(completedLessons);
System.out.println(displayedLessons);
```

运行结果：

```text
3
3
```

内层先把 `3` 写入 `completedLessons`，该赋值表达式的结果也是 `3`，随后用它初始化
`displayedLessons`。

语言允许这样写，不代表复杂代码都应该这样写。赋值埋在条件或长表达式中时，状态变化不容易被发现。
日常代码更适合把“更新状态”和“使用结果”拆开：

```java
int completedLessons = 3;
int displayedLessons = completedLessons;
```

下面的表达式同样有确定结果，但把状态变化藏进了计算过程：

```java
int quantity = 2;
int total = (quantity = 3) * quantity;

System.out.println(total); // 9
```

内层先把 `3` 写入 `quantity`，乘法两侧最终都读取 `3`，所以结果是 `9`。这种代码用于理解求值
规则，不适合作为日常写法。更清楚的版本把变化放在最外层：

```java
int quantity = 2;
quantity = 3;
int total = quantity * quantity;
```

### 4. 本课边界

变量与赋值会与很多后续知识相遇，但需要区分“本课必须掌握的赋值规则”和“其他主题自己的完整
体系”：

- `int`、`long`、`double` 的范围和精度属于基本类型。
- `+`、`++`、`+=` 的完整规则属于运算符，尤其 `+=` 还涉及隐式类型转换。
- 变量在花括号内何时可见属于作用域。
- `final` 变量、常量命名和不可变设计需要单独理解。
- 对象创建、对象状态和克隆属于面向对象编程。

这些主题会继续使用本课建立的模型：先确定变量的名称和类型，再跟踪每次读取和赋值造成的状态变化。

## 六、易错示例

下面集中列出初学阶段最常见的六类问题。每一项都给出错误出现的条件、编译器或运行结果，以及能够
直接对照的正确代码。

:::pitfalls
### 读取尚未初始化的局部变量

**现象：** 编译器提示变量可能尚未初始化，程序无法生成 class 文件。

**触发条件：** 局部变量只完成声明，或不是每一条可能执行到读取点的路径都完成了赋值。

**原因：** Java 对局部变量执行确定赋值分析，不会为它自动提供可读取的默认值。

**后果：** 无法区分“业务上确实是零”与“程序忘记写入值”，因此编译阶段直接拒绝。

**错误示例：**

```java
int completedLessons;
System.out.println(completedLessons);
```

**正确写法：**

```java
int completedLessons = 0;
System.out.println(completedLessons);
```

**影响版本：** Java 8 与 JDK 25 都适用。

**验证方式：** 分别编译两段代码；错误代码应报告 might not have been initialized，正确代码应输出 0。

**来源：** JLS 25 第 16 章 Definite Assignment。

### 更新变量时重复写出类型

**现象：** 编译器提示同名变量已经定义。

**触发条件：** 想更新现有变量，却再次写成“类型 + 名称 + 值”。

**原因：** 带类型的语句是在声明新变量，不是更新原变量；同一局部作用范围内不能重复声明同名变量。

**后果：** 程序无法编译，阅读者也无法判断代码是要创建新状态还是更新旧状态。

**错误示例：**

```java
int availableSeats = 30;
int availableSeats = 29;
```

**正确写法：**

```java
int availableSeats = 30;
availableSeats = 29;
```

**影响版本：** Java 8 与 JDK 25 都适用。

**验证方式：** 编译错误代码应报告变量重复定义；正确代码编译后变量最终值为 29。

**来源：** JLS 25 第 14 章局部变量声明规则。

### 把不兼容的值赋给变量

**现象：** 编译器报告 incompatible types。

**触发条件：** 右侧结果不能转换为左侧变量声明时确定的类型。

**原因：** 重新赋值只更新值，不会重新定义变量的静态类型。

**后果：** 如果允许这种写法，同一个变量在不同位置将失去稳定含义，编译器也无法保证后续操作合法。

**错误示例：**

```java
int availableSeats = 30;
availableSeats = true;
```

**正确写法：**

```java
int availableSeats = 30;
availableSeats = 29;
```

**影响版本：** Java 8 与 JDK 25 都适用。

**验证方式：** 错误代码应在编译阶段失败；正确代码应编译并得到整数 29。

**来源：** JLS 25 第 4 章变量类型与第 15.26 节赋值运算符。

### 让 var 缺少可推断的类型

**现象：** 编译器无法推断局部变量类型。

**触发条件：** `var` 声明没有初始化器，或初始化器只有 `null`。

**原因：** `var` 需要从右侧表达式推断一个确定的静态类型；没有表达式或只有 null 类型都无法完成推断。

**后果：** 变量没有可用于类型检查的声明类型，代码无法编译。

**错误示例：**

```java
var courseTitle = null;
```

**正确写法：**

```java
String courseTitle = null;
```

**影响版本：** JDK 10 及以上涉及 var；Java 8 不支持 var。

**验证方式：** 在 JDK 25 编译两段代码；错误代码应报告 cannot infer type，正确代码应通过编译。

**来源：** JEP 286 与 JLS 25 第 14.4 节局部变量声明。

### 误以为基本类型副本会跟随原变量

**现象：** 原变量更新后，副本仍然保持旧值。

**触发条件：** 把一个基本类型变量赋给另一个变量后，继续更新原变量，并期望副本同步变化。

**原因：** 基本类型赋值复制的是赋值发生时的值，不会在两个变量之间建立持续绑定。

**后果：** 程序显示或计算的仍是旧快照，容易被误判为赋值没有生效。

**错误示例：**

```java
int completedLessons = 2;
int displayedLessons = completedLessons;
completedLessons = 3;
System.out.println(displayedLessons);
```

**正确写法：**

```java
int completedLessons = 2;
int displayedLessons = completedLessons;
completedLessons = 3;
displayedLessons = completedLessons;
System.out.println(displayedLessons);
```

**影响版本：** Java 8 与 JDK 25 都适用。

**验证方式：** 错误示例输出 2；正确示例显式同步后输出 3。

**来源：** JLS 25 第 4 章基本类型值与变量规则。

### 误以为引用赋值会复制对象

**现象：** 通过第二个变量修改对象后，第一个变量也观察到变化。

**触发条件：** 把对象变量赋给另一个变量，并把这次赋值当成对象克隆。

**原因：** 引用赋值复制的是指向对象的引用，两个变量仍然指向同一个可变对象。

**后果：** 一个位置的修改会影响另一个位置，可能产生难以定位的共享状态问题。

**错误示例：**

```java
StringBuilder original = new StringBuilder("Java");
StringBuilder copy = original;
copy.append(" 25");
System.out.println(original);
```

**正确写法：**

```java
StringBuilder original = new StringBuilder("Java");
StringBuilder copy = new StringBuilder(original);
copy.append(" 25");
System.out.println(original);
```

**影响版本：** Java 8 与 JDK 25 都适用。

**验证方式：** 错误示例输出 Java 25；正确示例为 copy 创建独立对象后，original 仍输出 Java。

**来源：** JLS 25 第 4 章引用值与对象规则。
:::

## 七、完整示例

### 1. TeamFlow 中的文件位置

沿用上一课创建的 Maven 多模块工程，在 `app` 模块中继续修改启动类。JDK 25 与 Java 8 应使用两份
独立工程，不能只在同一份工程中切换 IDEA 的 SDK：现代工程的根 `pom.xml` 保持
`<maven.compiler.release>25</maven.compiler.release>`，Java 8 工程的根 `pom.xml` 使用
`<maven.compiler.release>8</maven.compiler.release>`。

两份工程中的 Java 文件都位于同一个模块和包路径：

```text
teamflow-maven-jdk25/
└── app/
    └── src/main/java/com/teamflow/app/TeamFlowApplication.java

teamflow-maven-java8/
└── app/
    └── src/main/java/com/teamflow/app/TeamFlowApplication.java
```

在两份工程中分别打开上一课已经创建的
`app/src/main/java/com/teamflow/app/TeamFlowApplication.java`，用下方对应版本的完整代码替换原内容，
不需要重复创建包或同名类。这仍是普通 Java 程序，不包含 Spring Boot、HTTP 或数据库。它只借用最终
项目的名称和任务状态，让变量的第一次取值、旧值副本和新值都能在控制台中观察。

### 2. JDK 25 完整程序

```java
package com.teamflow.app;

/**
 * 启动 TeamFlow 变量状态示例。
 */
public final class TeamFlowApplication {
    /**
     * 输出 TeamFlow 服务状态和任务数量的变化。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        var applicationName = "TeamFlow";
        boolean serviceReady = true;
        int taskCount = 3;

        System.out.println("应用：" + applicationName);
        System.out.println("服务就绪：" + serviceReady);
        System.out.println("初始任务数：" + taskCount);

        int previousTaskCount = taskCount;
        taskCount = 4;

        System.out.println("更新前任务数：" + previousTaskCount);
        System.out.println("更新后任务数：" + taskCount);
    }
}
```

`applicationName` 使用 `var`，编译器根据字符串初始值把它推断为 `String`。`taskCount` 先保存
`3`，随后把当前值复制给 `previousTaskCount`，再重新赋值为 `4`。这些语句只是更新局部变量，不会
创建任务、调用接口或连接任何服务。

### 3. 在 IntelliJ IDEA 中使用 JDK 25 运行

1. 用 **File | Open** 打开 `teamflow-maven-jdk25/pom.xml`，选择 **Open as Project**。确认根 POM 中
   `maven.compiler.release` 的值是 `25`。
2. 打开 **File | Project Structure | Project**，把 **Project SDK** 设为 JDK 25，
   **Language level** 选择 `SDK default` 或 Java 25。
3. 在 **Modules | app | Dependencies** 中确认 app 模块使用 `Project SDK` 或同一个 JDK 25；再到
   **Settings | Build, Execution, Deployment | Build Tools | Maven | Runner**，把 JRE 设为 JDK 25。
4. 在 Maven 工具窗口点击 **Reload All Maven Projects**。若还要从终端执行 Maven，先在这个工程根目录
   运行 `mvn -version`，确认输出中的 Java version 也是 25。
5. 打开 `TeamFlowApplication.java`，点击 `main` 左侧的绿色运行图标，选择
   **Run 'TeamFlowApplication.main()'**。运行配置中的 Main class 应为
   `com.teamflow.app.TeamFlowApplication`。

运行窗口应显示：

```text
应用：TeamFlow
服务就绪：true
初始任务数：3
更新前任务数：3
更新后任务数：4
```

如果控制台中仍是其他类的输出，先查看运行窗口顶部的配置名称，再从当前类的 `main` 左侧重新运行。
这只是在确认运行目标，不展开后续课程的系统化错误定位方法。

### 4. Java 8 完整程序

Java 8 不支持局部变量 `var`，因此必须把 `applicationName` 的类型完整写成 `String`。下面给出可直接
替换并运行的完整代码：

```java
package com.teamflow.app;

/**
 * 启动 TeamFlow 变量状态示例。
 */
public final class TeamFlowApplication {
    /**
     * 输出 TeamFlow 服务状态和任务数量的变化。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        String applicationName = "TeamFlow";
        boolean serviceReady = true;
        int taskCount = 3;

        System.out.println("应用：" + applicationName);
        System.out.println("服务就绪：" + serviceReady);
        System.out.println("初始任务数：" + taskCount);

        int previousTaskCount = taskCount;
        taskCount = 4;

        System.out.println("更新前任务数：" + previousTaskCount);
        System.out.println("更新后任务数：" + taskCount);
    }
}
```

### 5. 在 IntelliJ IDEA 中使用 Java 8 运行

1. 用 **File | Open** 打开独立的 `teamflow-maven-java8/pom.xml`，确认根 POM 中
   `maven.compiler.release` 的值是 `8`。不要直接修改 JDK 25 工程来回切换版本。
2. 打开 **File | Project Structure | SDKs**。如果列表中还没有本机已经安装的 JDK 8，使用
   **Add JDK** 选择它的安装目录；不要把 JDK 25 目录改名或当作 JDK 8。
3. 回到 **Project**，把 **Project SDK** 设为 JDK 8，把 **Language level** 设为 Java 8；在
   **Modules | app | Dependencies** 中确认 app 模块也使用 JDK 8。
4. 在 Maven Runner 中把 JRE 设为 JDK 8，然后点击 **Reload All Maven Projects**。若从终端执行 Maven，
   先在 Java 8 工程根目录运行 `mvn -version`，确认输出中的 Java version 是 1.8。
5. 粘贴上面的完整 Java 8 代码，从当前类 `main` 左侧运行 `TeamFlowApplication`；Main class 仍是
   `com.teamflow.app.TeamFlowApplication`。

Java 8 版的预期输出与 JDK 25 版完全相同。两版都使用传统入口
`public static void main(String[] args)`；源码差异只在本课出现 `var` 的局部变量声明处，工程配置还必须
分别使用 `release=25` 和 `release=8`。

### 6. 按执行顺序解释结果

程序从上到下进入 `main`：

1. 类名 `TeamFlowApplication` 必须与文件名 `TeamFlowApplication.java` 一致。
2. `main` 是 IntelliJ IDEA 本次运行寻找的入口，花括号中的语句按顺序执行。
3. 三条声明先为应用名、服务状态和任务数量提供初始值。
4. `previousTaskCount = taskCount` 复制的是当时的整数 `3`。
5. `taskCount = 4` 只替换 `taskCount` 当前保存的值，不会回头修改旧值副本。
6. `System.out.println` 读取语句执行到这里时的变量值，并把文字写入控制台。

因此最后两行分别输出 `3` 和 `4`。这不是两次运行的结果，而是一次运行中变量先后处于两个状态。

## 八、练习

### 1. 任务与验收

:::exercise
### 更新 TeamFlow 任务状态

**要求：** 编写 `TaskStatusDemo`，保存项目名、任务标题、任务状态和是否已经分配负责人。先输出初始
状态，再保存更新前的任务状态，把任务状态改为“进行中”，把分配状态改为 `true`，最后输出更新结果。
JDK 25 版的项目名使用 `var`，其他变量使用显式类型；不使用输入、条件分支、循环或外部依赖。

**验收：** JDK 25 与 Java 8 两版都能从 IntelliJ IDEA 运行；输出包含项目 `TeamFlow`、任务“整理需求”、
初始状态“待处理”、更新前状态“待处理”、更新后状态“进行中”和已分配 `true`；所有局部变量都在读取
前完成初始化，public 类名与文件名一致。

**参考答案：** 完整参考实现见下一小节。先独立完成，再逐行对照变量状态与输出顺序。
:::

### 2. JDK 25 完整参考实现

```java
package com.teamflow.app;

/**
 * 练习记录并更新 TeamFlow 任务状态。
 */
public final class TaskStatusDemo {
    /**
     * 输出任务状态更新前后的结果。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        var projectName = "TeamFlow";
        String taskTitle = "整理需求";
        String taskStatus = "待处理";
        boolean assigned = false;

        System.out.println("项目：" + projectName);
        System.out.println("任务：" + taskTitle);
        System.out.println("初始状态：" + taskStatus);
        System.out.println("初始已分配：" + assigned);

        String previousTaskStatus = taskStatus;
        taskStatus = "进行中";
        assigned = true;

        System.out.println("更新前状态：" + previousTaskStatus);
        System.out.println("更新后状态：" + taskStatus);
        System.out.println("更新后已分配：" + assigned);
    }
}
```

### 3. Java 8 完整参考实现

Java 8 版把项目名声明改为显式 `String`，其余赋值规则保持不变。这里仍然给出完整程序，而不是只列
出改动行：

```java
package com.teamflow.app;

/**
 * 练习记录并更新 TeamFlow 任务状态。
 */
public final class TaskStatusDemo {
    /**
     * 输出任务状态更新前后的结果。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        String projectName = "TeamFlow";
        String taskTitle = "整理需求";
        String taskStatus = "待处理";
        boolean assigned = false;

        System.out.println("项目：" + projectName);
        System.out.println("任务：" + taskTitle);
        System.out.println("初始状态：" + taskStatus);
        System.out.println("初始已分配：" + assigned);

        String previousTaskStatus = taskStatus;
        taskStatus = "进行中";
        assigned = true;

        System.out.println("更新前状态：" + previousTaskStatus);
        System.out.println("更新后状态：" + taskStatus);
        System.out.println("更新后已分配：" + assigned);
    }
}
```

### 4. 运行步骤与预期结果

在两份工程的 `app/src/main/java/com/teamflow/app/` 下分别创建 `TaskStatusDemo.java`：

1. JDK 25 版打开 `teamflow-maven-jdk25`，确认 Project SDK、app 模块 SDK 和 Maven Runner JRE 都是
   JDK 25，根 POM 使用 `release=25`；Reload Maven Projects 后粘贴 JDK 25 参考实现并运行当前类。
2. Java 8 版打开 `teamflow-maven-java8`，确认上述三处都选择 JDK 8，根 POM 使用 `release=8`；Reload
   Maven Projects 后粘贴完整 Java 8 参考实现并运行当前类。

两边的运行配置都应把 Main class 指向 `com.teamflow.app.TaskStatusDemo`，不能继续使用上一段程序的
`TeamFlowApplication`。这样可以同时确认源码版本、Maven 编译目标和实际运行类都正确。

两个版本都应输出：

```text
项目：TeamFlow
任务：整理需求
初始状态：待处理
初始已分配：false
更新前状态：待处理
更新后状态：进行中
更新后已分配：true
```

### 5. 自我检查

完成后不要只核对输出文本，还要回答下面的问题：

1. 为什么 `previousTaskStatus` 在更新后仍然输出“待处理”？
2. 为什么更新 `taskStatus` 不会自动把 `assigned` 变成 `true`？
3. 如果删掉 `String taskStatus = "待处理"` 中的初始值，第一处读取会发生什么？
4. JDK 25 版的 `projectName` 最终是什么静态类型？
5. Java 8 版为什么必须写出 `String projectName`？

能够根据执行顺序独立回答这些问题，比只得到相同输出更能说明你已经掌握变量与赋值。
