---
id: backend.java.learn.basics.variables-types-and-operators
type: lesson
title: 基本类型
summary: 在 TeamFlow 状态示例中认识 Java 的八种基本类型，并为整数、小数、字符和真假值选择合适表示
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 75
prerequisites:
  - backend.java.learn.basics.variables-and-assignment
objectives:
  - 能说出 Java 的八种基本类型，并按整数、浮点数和布尔值归类。
  - 能根据数据含义和取值范围选择 int、long、double、boolean 或 char。
  - 能说明 byte、short、int、long 的固定位宽与取值范围。
  - 能正确书写整数、浮点、字符和布尔字面量，以及必要的 L、F 后缀。
  - 能区分 char 与 String，并说明 char 表示一个 UTF-16 code unit 的边界。
  - 能识别数值越界、后缀缺失、字符写法和布尔值写法等常见错误。
  - 能在 JDK 25 与 Java 8 工程中运行完整的 TeamFlow 基本类型程序。
recap:
  - Java 有八种基本类型，String 是引用类型，不是第九种基本类型。
  - byte、short、int、long 是有符号整数，char 是无符号的 UTF-16 code unit。
  - 整数字面量通常是 int，超出 int 范围的 long 字面量需要 L 后缀。
  - 浮点字面量通常是 double，写入 float 变量时使用 F 后缀。
  - boolean 只有 true 与 false，不能使用 0 和 1 代替。
  - 本课示例在 JDK 25 与 Java 8 中使用相同语法和完整代码。
related: []
tags:
  - Java
  - 基本类型
  - primitive
  - 字面量
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 在本课使用相同的基本类型与字面量写法
verifiedAt: 2026-08-16
sources:
  - id: jls-25-types-values-variables
    title: Java Language Specification 25 - Types, Values, and Variables
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html
    sourceType: specification
    sourceOrigin: official
    appliesTo: Java SE 25
    claims:
      - 八种基本类型及其分类
      - 整数类型的固定位宽、取值范围和 char 的 UTF-16 code unit 语义
      - float、double 与 boolean 的语言规则
      - String 属于引用类型而不是基本类型
  - id: jls-25-lexical-structure
    title: Java Language Specification 25 - Lexical Structure
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-3.html
    sourceType: specification
    sourceOrigin: official
    appliesTo: Java SE 25
    claims:
      - 整数、浮点、字符和布尔字面量的语法
      - L 与 F 后缀以及字符字面量的 UTF-16 code unit 边界
  - id: dev-java-primitive-types
    title: Creating Primitive Type Variables in Your Programs
    url: https://dev.java/learn/language-basics/primitive-types/
    sourceType: official-reference
    sourceOrigin: official
    appliesTo: 当前 Dev.java 入门资料
    claims:
      - 八种基本类型的初学者说明和常见选择
      - String 不是基本类型
  - id: jep-306-always-strict-floating-point
    title: 'JEP 306: Restore Always-Strict Floating-Point Semantics'
    url: https://openjdk.org/jeps/306
    sourceType: release-note
    sourceOrigin: official
    appliesTo: Java 17 及以上
    claims:
      - Java 17 起浮点表达式恢复为始终严格求值
  - id: jls-8-types-values-variables
    title: Java Language Specification 8 - Types, Values, and Variables
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-4.html
    sourceType: specification
    sourceOrigin: official
    appliesTo: Java SE 8
    claims:
      - 八种基本类型、整数范围与 Java 8 浮点值集合合同
  - id: jls-8-lexical-structure
    title: Java Language Specification 8 - Lexical Structure
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-3.html
    sourceType: specification
    sourceOrigin: official
    appliesTo: Java SE 8
    claims:
      - 本课字面量写法在 Java 8 中的语言规则
  - id: jls-8-fp-strict-expressions
    title: Java Language Specification 8 - Expressions
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html
    sourceType: specification
    sourceOrigin: official
    appliesTo: Java SE 8
    claims:
      - Java 8 非严格浮点表达式曾允许扩展指数值集
  - id: stack-overflow-java-numeric-literal-suffixes
    title: Why the need for F and L suffixes at the end of long and float data types?
    url: https://stackoverflow.com/questions/66305194/why-the-need-for-f-and-l-suffixes-at-the-end-of-long-and-float-data-types
    sourceType: engineering-reference
    sourceOrigin: community
    appliesTo: Java 初学者常见编译错误
    claims:
      - 缺少 L 或 F 后缀是实际出现的初学者问题
      - 错误分别表现为整数过大或 double 不能直接赋给 float
---

# 基本类型

TeamFlow 需要记录待处理任务数、累计事件数、完成率、看板代号和服务是否就绪。它们看起来都只是
“一个值”，但 Java 不会用同一种方式表示：整数有不同范围，小数使用浮点类型，真假状态只能写成
`true` 或 `false`，一个 `char` 也不等于任意一个用户眼中的完整字符。

本课只建立选择和书写基本类型的能力。类型之间怎样转换属于下一课，运算符怎样组合表达式属于再下一课；
这里出现的输出语句只用于观察变量，不提前展开这些规则。

## 一、先看清 Java 的八种基本类型

### 1. 基本类型是语言直接定义的类型

Java 把类型分为基本类型和引用类型。基本类型由语言直接定义，共有八种：

```text
byte short int long char float double boolean
```

从语言分类看，基本类型包括整数类型、浮点类型和布尔类型。为了突出 `char` 与普通计数的区别，
下面把它从整数类型中单列出来，共显示四行：

| 分组 | 类型 | 表示的内容 |
| --- | --- | --- |
| 整数类型 | `byte`、`short`、`int`、`long` | 有正负号的整数 |
| 字符对应的整数类型 | `char` | 一个 16 位 UTF-16 code unit |
| 浮点类型 | `float`、`double` | 有限精度的二进制浮点数 |
| 布尔类型 | `boolean` | `true` 或 `false` |

表格把 `char` 单独列出来，是因为它在语言规范中属于整数类型，却通常用于表示一个 UTF-16 code unit，
不能把它理解成普通计数。`boolean` 也不是数字，不能把 `0`、`1` 当成它的别名。

下面的声明都只使用一个字面量给变量初始值：

```java
int activeTaskCount = 12;
double averageDurationSeconds = 2.5;
char boardCode = 'A';
boolean serviceReady = true;
```

观察每行等号左边的类型，就能先判断变量准备保存哪一类值。等号右边的源码写法叫字面量，例如 `12`、
`2.5`、`'A'` 和 `true`。

### 2. String 不是第九种基本类型

`String` 经常和基本类型一起出现，而且字符串字面量可以直接写成双引号文本，所以初学者容易把它看成
第九种基本类型。实际上，`String` 是类，属于引用类型：

```java
String applicationName = "TeamFlow";
char boardCode = 'A';
```

`"TeamFlow"` 是字符串字面量，使用双引号；`'A'` 是字符字面量，使用单引号。前者可以包含多个
UTF-16 code unit，后者只能表示一个 code unit。对象、引用和字符串操作会在后续课程展开，本课只需
先把 `String` 与八种基本类型分开。

运行包含这两行声明的程序时，不会自动产生控制台输出。只有后续把变量交给 `System.out.println`，
才能观察到它们当前保存的内容；声明负责保存值，输出语句负责显示值，两者职责不同。

### 3. 先按业务含义选择，再看范围

零基础阶段可以先使用下面的选择顺序：

1. 普通整数计数先考虑 `int`。
2. 可能超过 `int` 上限的累计数量使用 `long`。
3. 普通小数先考虑 `double`。
4. 真假开关使用 `boolean`。
5. 明确只有一个 UTF-16 code unit 的代号可以使用 `char`；用户文本使用 `String`。
6. 只有数据合同明确要求较小整数或 binary32 浮点值时，再选择 `byte`、`short` 或 `float`。

这不是说 `byte`、`short`、`float` 没有用途，而是不要仅凭“数字看起来小”就把它们当作默认选择。
例如 TeamFlow 的重试次数通常用 `int` 已足够清楚；只有文件格式、网络协议或既有接口明确规定 8 位
整数时，`byte` 才表达了额外合同。本课用八种类型做完整演示，不把演示选择包装成通用性能建议。

## 二、整数类型与字符类型

### 1. 四种有符号整数的范围固定

Java 的 `byte`、`short`、`int`、`long` 在所有实现上的位宽和范围都由语言规范固定，不会因为电脑是
Windows、macOS、Linux 或处理器不同而改变。

| 类型 | 位宽 | 最小值 | 最大值 | 初学阶段的典型用途 |
| --- | --- | --- | --- | --- |
| `byte` | 8 位 | -128 | 127 | 外部合同明确要求 8 位整数 |
| `short` | 16 位 | -32,768 | 32,767 | 外部合同明确要求 16 位整数 |
| `int` | 32 位 | -2,147,483,648 | 2,147,483,647 | 普通计数和整数状态 |
| `long` | 64 位 | -9,223,372,036,854,775,808 | 9,223,372,036,854,775,807 | 超过 int 范围的累计值 |

例如活动任务数通常远小于 `int` 上限，写成下面这样清楚且足够：

```java
int activeTaskCount = 128;
```

如果把它写成 `byte activeTaskCount = 128;`，就会超出 `byte` 的最大值 `127`，编译器会拒绝。失败发生
在程序启动前，因此不会看到任何运行输出。

### 2. 整数字面量通常是 int，long 大值要加 L

直接写在源码里的十进制整数通常是 `int` 字面量。数值超过 `int` 范围时，需要用大写 `L` 明确表示
这是 `long` 字面量：

```java
int activeTaskCount = 128;
long processedEventCount = 3_000_000_000L;
```

`3_000_000_000` 中的下划线只帮助人阅读，不改变数值。末尾的 `L` 才决定该字面量属于 `long`。
规范同时允许小写 `l`，但它很像数字 `1`，课程统一使用大写 `L`。

如果漏掉 `L`，编译器先按整数字面量自身的规则判断它；`3_000_000_000` 已经超出 `int` 范围，
即使等号左边写了 `long`，也不能把一个非法的 `int` 字面量补救成合法值。

**社区补充：** Stack Overflow 的真实初学者问题记录了同类 `integer number too large` 错误，适用于
JDK 25 与 Java 8；本课的两个版本也分别验证了错误版编译失败、补上 `L` 后正确输出。

本课只学习如何写出目标类型的字面量。较小整数为什么有时可以赋给 `byte`，不同整数类型之间如何转换，
统一留到《类型转换》。

### 3. char 保存一个 UTF-16 code unit

`char` 的取值是 `0` 到 `65,535`，也可以写成 `\u0000` 到 `\uffff`。它没有负数，源码中的字符
字面量使用单引号：

```java
char boardCode = 'A';
char separator = '-';
```

这两行都能编译，因为单引号里各有一个 UTF-16 code unit。下面这行不能编译：

```java
char statusText = '完成';
```

`'完成'` 包含两个 code unit，不是一个合法的字符字面量。要保存状态文字应写：

```java
String statusText = "完成";
```

还要注意，一个用户眼中的符号不一定只占一个 UTF-16 code unit。许多补充字符需要一对 surrogate
code unit，因此不能放进单个 `char`。如何按 Unicode code point 或用户可见字符处理文本属于字符串
课程；现在只记住 `char` 的准确边界，不把它简化成“任何一个完整字符”。

## 三、浮点类型与布尔类型

### 1. float 与 double 都是有限精度的二进制浮点类型

`float` 对应 IEEE 754 binary32，`double` 对应 IEEE 754 binary64。位数更多不代表可以精确保存所有
十进制小数；很多十进制小数在二进制中没有有限表示，只能保存接近值。

| 类型 | 位宽 | 最小正非零有限值（约） | 最大正有限值（约） | 常见有效十进制数字 |
| --- | --- | --- | --- | --- |
| `float` | 32 位 | `1.4e-45` | `3.4028235e38` | 6 到 7 位 |
| `double` | 64 位 | `4.9e-324` | `1.7976931348623157e308` | 15 到 16 位 |

表中的“最小正非零有限值”不是最负数；负有限值与正有限值对应。两种浮点类型还包含正零、负零、
正无穷、负无穷和 `NaN`。这些特殊值属于类型边界，不表示本课要提前学习产生或运算它们；当前只需
知道浮点类型的值不只有表中的普通有限小数。JDK 25 与 Java 8 的 `float`、`double` 变量都使用这些
值集合。

```java
float completionRate = 0.75F;
double averageDurationSeconds = 2.375;
```

这两个示例选用的数值都能让输出保持简单。普通小数在没有外部合同限制时通常先用 `double`；只有接口、
文件格式或其他合同明确要求 binary32 时再用 `float`。精确金额不应直接依赖二进制浮点类型，但金额方案
不在本课展开。

本课不会计算完成率，也不会比较浮点值，只观察已经写好的字面量。浮点运算、精度传播和类型转换会在
后续课程中逐步建立。

### 2. 浮点字面量通常是 double，float 要加 F

源码中的 `2.375` 默认是 `double` 字面量。要直接写一个 `float` 字面量，应加 `F` 或 `f` 后缀，课程
统一使用更醒目的大写 `F`：

```java
float completionRate = 0.75F;
double averageDurationSeconds = 2.375;
```

下面的写法会编译失败：

```java
float completionRate = 0.75;
```

原因不是 `0.75` 超出 `float` 范围，而是它首先属于 `double`，语言不会在这里默默把它变成
`float`。现在使用 `0.75F` 写清字面量类型；`double` 到 `float` 的转换规则留到下一课。

**社区补充：** 同一则 Stack Overflow 初学者问题也记录了 possible lossy conversion 错误，适用于
JDK 25 与 Java 8；本课已在两个版本中验证缺少 `F` 的错误版编译失败，正确版输出 0.75。

`double` 字面量也可以加 `D`，但默认已经是 `double`，通常不需要额外写后缀。

### 3. boolean 只接受 true 和 false

`boolean` 只有两个值：`true` 与 `false`。它适合表示服务是否就绪、任务是否归档等明确的真假状态：

```java
boolean serviceReady = true;
boolean archived = false;
```

Java 不把整数自动当成真假值，所以下面的代码不能编译：

```java
boolean serviceReady = 1;
```

使用 `true`、`false` 可以直接表达含义，也避免不同系统对 `0`、`1` 或其他数字的约定混进 Java
语言规则。怎样根据条件产生布尔值属于后续控制流和表达式课程，本课只保存并输出现成的布尔字面量。

## 四、在 TeamFlow 中观察八种类型

### 1. 写出最小状态快照

下面这组局部变量把八种基本类型放在一个 TeamFlow 状态快照中，并额外用 `String` 保存应用名：

```java
byte retryLimit = 3;
short dailyTaskLimit = 1_500;
int activeTaskCount = 128;
long processedEventCount = 3_000_000_000L;
float completionRate = 0.75F;
double averageDurationSeconds = 2.375;
char boardCode = 'A';
boolean serviceReady = true;
String applicationName = "TeamFlow";
```

逐行检查时，先看左边的类型和变量名，再看右边字面量是否符合该类型：

1. `retryLimit` 和 `dailyTaskLimit` 都在各自范围内。
2. `activeTaskCount` 使用普通整数类型 `int`。
3. `processedEventCount` 超出 `int` 上限，因此变量和字面量都明确使用 `long`。
4. `completionRate` 的字面量带 `F`，`averageDurationSeconds` 使用默认的 `double` 字面量。
5. `boardCode` 用单引号保存一个 code unit。
6. `serviceReady` 只使用布尔字面量。
7. `applicationName` 是 `String` 引用变量，用来和八种基本类型对照。

这些值只是教学快照，不代表 TeamFlow 已经有对应数据库字段、接口或业务规则。

### 2. 用固定输出观察结果

把变量交给 `System.out.println` 后，控制台会按语句顺序显示当前值：

```java
System.out.println("应用：" + applicationName);
System.out.println("重试上限：" + retryLimit);
System.out.println("每日任务上限：" + dailyTaskLimit);
System.out.println("活动任务数：" + activeTaskCount);
System.out.println("累计事件数：" + processedEventCount);
System.out.println("完成率：" + completionRate);
System.out.println("平均耗时秒数：" + averageDurationSeconds);
System.out.println("看板代号：" + boardCode);
System.out.println("服务就绪：" + serviceReady);
```

预期输出是：

```text
应用：TeamFlow
重试上限：3
每日任务上限：1500
活动任务数：128
累计事件数：3000000000
完成率：0.75
平均耗时秒数：2.375
看板代号：A
服务就绪：true
```

源码中的数值下划线不会出现在输出里，因为它只服务于源码可读性；`L`、`F` 也不会被打印，因为它们
描述字面量类型，不是数值文本的一部分。输出语句中的 `+` 沿用上一课已经见过的固定写法，本课不展开
运算符规则。

### 3. JDK 25 与 Java 8 的本课边界

八种基本类型的名称、整数位宽、常用字面量以及 `L`、`F` 后缀在 JDK 25 与 Java 8 中都可用。因此
本课主程序不需要为了 Java 8 改写类型或字面量，后文仍会给出两份完整代码和独立运行步骤。

两者存在一个不影响本课输出的真实历史差异：Java 17 起浮点表达式始终采用严格求值；Java 8 规范曾
允许某些非严格浮点表达式使用扩展指数值集。本课只把普通字面量保存到 `float`、`double` 变量并输出，
两个版本的结果一致，不需要加入 `strictfp`。数值算法和极端浮点边界不在本课展开。

## 五、易错示例

下面的错误都可以用最小类单独编译验证。它们用于确认类型和字面量写法，不扩张成完整错误诊断课程。

:::pitfalls
### byte 值超出范围

**现象：** 编译器报告不兼容类型或可能丢失精度，程序没有运行输出。

**触发条件：** 把超出 -128 到 127 的整数字面量直接写入 `byte` 变量。

**原因：** `byte` 只有 8 位有符号整数范围，`128` 不属于它可以保存的值。

**后果：** 源码无法通过编译；如果业务确实可能达到 128，就说明变量类型选择不符合数据范围。

**错误示例：**

```java
byte retryLimit = 128;
System.out.println(retryLimit);
```

**正确写法：**

```java
int retryLimit = 128;
System.out.println(retryLimit);
```

**影响版本：** JDK 25 与 Java 8 都适用。

**验证方式：** 错误版必须编译失败；改为 `int` 后重新编译并运行，控制台输出 128。

**来源：** JLS 25 第 4.2.1 节整数类型范围。

### long 大字面量缺少 L

**现象：** 编译器报告 `integer number too large`，即使左侧变量已经声明为 `long` 也失败。

**触发条件：** 直接写出超过 `int` 上限的十进制整数字面量，却没有添加 `L` 后缀。

**原因：** 没有后缀的整数字面量通常按 `int` 判断，`3_000_000_000` 不是合法的 `int` 字面量。

**后果：** 累计事件数无法编译进程序，控制台不会输出该值。

**错误示例：**

```java
long processedEventCount = 3_000_000_000;
System.out.println(processedEventCount);
```

**正确写法：**

```java
long processedEventCount = 3_000_000_000L;
System.out.println(processedEventCount);
```

**影响版本：** JDK 25 与 Java 8 都适用。

**验证方式：** 错误版必须编译失败；正确版编译运行后输出 3000000000，源码下划线和 L 不进入输出。

**来源：** JLS 25 第 3.10.1 节；Stack Overflow 的 F/L 后缀初学者问题。

### float 字面量缺少 F

**现象：** 编译器报告 `double` 不能直接赋给 `float`，或提示 possible lossy conversion。

**触发条件：** 把没有后缀的小数字面量直接写入 `float` 变量。

**原因：** `0.75` 默认是 `double` 字面量；本课应使用 `0.75F` 明确写成 `float` 字面量。

**后果：** 程序编译失败，无法观察完成率。

**错误示例：**

```java
float completionRate = 0.75;
System.out.println(completionRate);
```

**正确写法：**

```java
float completionRate = 0.75F;
System.out.println(completionRate);
```

**影响版本：** JDK 25 与 Java 8 都适用。

**验证方式：** 错误版必须编译失败；正确版编译运行后输出 0.75。

**来源：** JLS 25 第 3.10.2 节；Stack Overflow 的 F/L 后缀初学者问题。

### 把多字文本写进 char

**现象：** 编译器报告字符字面量不合法，或报告字符串不能赋给 `char`。

**触发条件：** 试图用一个 `char` 保存包含多个 UTF-16 code unit 的任务状态文字。

**原因：** `char` 只表示一个 UTF-16 code unit，单引号也只用于一个合法字符字面量。

**后果：** 状态文字无法编译；即使用户看见的是一个符号，也不能据此断定它只占一个 code unit。

**错误示例：**

```java
char taskStatus = '完成';
System.out.println(taskStatus);
```

**正确写法：**

```java
String taskStatus = "完成";
System.out.println(taskStatus);
```

**影响版本：** JDK 25 与 Java 8 都适用。

**验证方式：** 错误版必须编译失败；正确版编译运行后输出“完成”。

**来源：** JLS 25 第 3.10.4 节字符字面量与第 4.2.1 节 char 范围。

### 用 0 或 1 代替 boolean

**现象：** 编译器报告 `int` 不能转换为 `boolean`。

**触发条件：** 沿用其他语言或外部数据约定，把数字 1 直接赋给 Java 的 `boolean` 变量。

**原因：** Java 的 `boolean` 只有 `true` 和 `false`，它不是整数类型。

**后果：** 服务就绪状态无法编译进程序，也不会自动解释为真。

**错误示例：**

```java
boolean serviceReady = 1;
System.out.println(serviceReady);
```

**正确写法：**

```java
boolean serviceReady = true;
System.out.println(serviceReady);
```

**影响版本：** JDK 25 与 Java 8 都适用。

**验证方式：** 错误版必须编译失败；正确版编译运行后输出 true。

**来源：** JLS 25 第 4.2.5 节 boolean 的两个值。
:::

## 六、完整程序

### 1. TeamFlow 中的文件位置

继续使用前两课建立的两份独立 Maven 工程，不创建第三份工程，也不在同一工程中来回切换编译目标：

```text
teamflow-maven-jdk25/
└── app/
    └── src/main/java/com/teamflow/app/TeamFlowApplication.java

teamflow-maven-java8/
└── app/
    └── src/main/java/com/teamflow/app/TeamFlowApplication.java
```

两份工程中都已经存在 `com.teamflow.app.TeamFlowApplication`。打开该文件并替换内容，不要再次创建
同名类。JDK 25 工程根 POM 保持 `maven.compiler.release` 为 `25`，Java 8 工程保持为 `8`。

### 2. JDK 25 完整程序

```java
package com.teamflow.app;

/**
 * 输出 TeamFlow 服务状态中不同基本类型的值。
 */
public final class TeamFlowApplication {
    /**
     * 创建基本类型状态快照并输出每个值。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        String applicationName = "TeamFlow";
        byte retryLimit = 3;
        short dailyTaskLimit = 1_500;
        int activeTaskCount = 128;
        long processedEventCount = 3_000_000_000L;
        float completionRate = 0.75F;
        double averageDurationSeconds = 2.375;
        char boardCode = 'A';
        boolean serviceReady = true;

        System.out.println("应用：" + applicationName);
        System.out.println("重试上限：" + retryLimit);
        System.out.println("每日任务上限：" + dailyTaskLimit);
        System.out.println("活动任务数：" + activeTaskCount);
        System.out.println("累计事件数：" + processedEventCount);
        System.out.println("完成率：" + completionRate);
        System.out.println("平均耗时秒数：" + averageDurationSeconds);
        System.out.println("看板代号：" + boardCode);
        System.out.println("服务就绪：" + serviceReady);
    }
}
```

### 3. 在 IntelliJ IDEA 中使用 JDK 25 运行

1. 用 **File | Open** 打开 `teamflow-maven-jdk25/pom.xml`，选择 **Open as Project**。在根 POM 中
   确认 `maven.compiler.release` 是 `25`。
2. 打开 **File | Project Structure | Project**，把 **Project SDK** 设为 JDK 25，Language level
   选择 `SDK default` 或 Java 25。
3. 在 **Modules | app | Dependencies** 中确认 app 模块使用 Project SDK 或同一个 JDK 25；在
   **Settings | Build, Execution, Deployment | Build Tools | Maven | Runner** 中把 JRE 设为 JDK 25。
4. 点击 Maven 工具窗口的 **Reload All Maven Projects**。如果还要从工程根目录使用 Maven，先运行
   `mvn -version`，确认 Java version 是 25。
5. 打开现有 `TeamFlowApplication.java`，替换为上面的完整代码。点击 `main` 左侧绿色运行图标，选择
   **Run 'TeamFlowApplication.main()'**；Main class 应为 `com.teamflow.app.TeamFlowApplication`。
6. 核对控制台中的九行输出，尤其确认 long 值没有 L、float 值没有 F、数字中没有源码下划线。这说明
   后缀和下划线只参与源码表示，没有成为输出数据。

JDK 25 的预期输出为：

```text
应用：TeamFlow
重试上限：3
每日任务上限：1500
活动任务数：128
累计事件数：3000000000
完成率：0.75
平均耗时秒数：2.375
看板代号：A
服务就绪：true
```

### 4. Java 8 完整程序

本课没有使用 Java 8 不支持的语法，但仍给出完整代码，不能把“没有差异”理解成省略 Java 8 程序：

```java
package com.teamflow.app;

/**
 * 输出 TeamFlow 服务状态中不同基本类型的值。
 */
public final class TeamFlowApplication {
    /**
     * 创建基本类型状态快照并输出每个值。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        String applicationName = "TeamFlow";
        byte retryLimit = 3;
        short dailyTaskLimit = 1_500;
        int activeTaskCount = 128;
        long processedEventCount = 3_000_000_000L;
        float completionRate = 0.75F;
        double averageDurationSeconds = 2.375;
        char boardCode = 'A';
        boolean serviceReady = true;

        System.out.println("应用：" + applicationName);
        System.out.println("重试上限：" + retryLimit);
        System.out.println("每日任务上限：" + dailyTaskLimit);
        System.out.println("活动任务数：" + activeTaskCount);
        System.out.println("累计事件数：" + processedEventCount);
        System.out.println("完成率：" + completionRate);
        System.out.println("平均耗时秒数：" + averageDurationSeconds);
        System.out.println("看板代号：" + boardCode);
        System.out.println("服务就绪：" + serviceReady);
    }
}
```

### 5. 在 IntelliJ IDEA 中使用 Java 8 运行

1. 用 **File | Open** 打开独立的 `teamflow-maven-java8/pom.xml`，确认根 POM 中
   `maven.compiler.release` 是 `8`，不要修改 JDK 25 工程代替这份兼容工程。
2. 打开 **File | Project Structure | SDKs**。列表中没有本机已安装的 JDK 8 时，用 **Add JDK**
   选择它的真实安装目录；不要把 JDK 25 目录当成 JDK 8。
3. 在 **Project** 中把 Project SDK 和 Language level 设为 Java 8；在
   **Modules | app | Dependencies** 中确认 app 模块也使用 JDK 8。
4. 把 Maven Runner JRE 设为 JDK 8，然后点击 **Reload All Maven Projects**。从终端使用 Maven 前，
   在 Java 8 工程根目录运行 `mvn -version`，确认 Java version 是 1.8。
5. 打开 Java 8 工程中现有的 `TeamFlowApplication.java`，用上面的 Java 8 完整代码替换内容，从
   当前类 `main` 左侧运行。Main class 同样应为 `com.teamflow.app.TeamFlowApplication`。
6. Java 8 版也必须得到相同九行输出。若输出仍是上一课的任务数量变化，说明运行的是旧编译结果或错误
   运行配置；从当前文件的 `main` 左侧重新运行并再次核对 Main class。

### 6. 按执行顺序理解结果

程序进入 `main` 后依次发生下面的事情：

1. `applicationName` 保存一个 `String` 引用，用来和八种基本类型对照。
2. 四个有符号整数变量分别接收落在自身范围内的整数；long 字面量用 `L` 明确类型。
3. `completionRate` 接收带 `F` 的 float 字面量，`averageDurationSeconds` 接收默认 double 字面量。
4. `boardCode` 接收单引号里的一个 UTF-16 code unit，`serviceReady` 接收布尔字面量 `true`。
5. 九条输出语句从上到下读取变量当前值，因此控制台顺序和源码顺序一致。
6. 下划线、`L`、`F` 不属于变量保存的显示文本，所以输出只呈现数值和字符本身。

这段程序没有计算、分支、循环、HTTP、数据库或 Spring Boot。它只把本课类型选择和字面量写法连接成
一条可运行、可观察的最小反馈环。

## 七、练习

### 1. 任务与验收

:::exercise
### 记录 TeamFlow 任务指标

**要求：** 在两份工程的 app 模块中创建 `TaskTypeSnapshot`，分别保存最大重试次数、迭代任务上限、
待处理任务数、审计事件编号、计划完成率、预计工时、看板代号、是否归档和任务标题。八种基本类型必须
各使用一次，任务标题使用 `String`；long 和 float 字面量使用正确后缀，不使用输入、条件、循环或外部依赖。

**验收：** JDK 25 与 Java 8 两版都能从当前类运行并得到九行指定输出；`4_000_000_001L` 输出时没有
下划线和 L，`0.6F` 输出为 0.6，`String` 被正确说明为引用类型；public 类名与文件名一致。

**参考答案：** 完整的两个版本见下一小节。先独立选择类型并预测输出，再运行核对。
:::

### 2. JDK 25 完整参考实现

在 `teamflow-maven-jdk25/app/src/main/java/com/teamflow/app/` 中创建 `TaskTypeSnapshot.java`：

```java
package com.teamflow.app;

/**
 * 展示 TeamFlow 任务指标使用的八种基本类型。
 */
public final class TaskTypeSnapshot {
    /**
     * 创建任务指标快照并输出各项值。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        byte maxRetries = 5;
        short sprintTaskLimit = 120;
        int pendingTaskCount = 42;
        long auditEventId = 4_000_000_001L;
        float plannedProgress = 0.6F;
        double estimatedHours = 13.5;
        char boardCode = 'B';
        boolean archived = false;
        String taskTitle = "整理课程目录";

        System.out.println("最大重试次数：" + maxRetries);
        System.out.println("迭代任务上限：" + sprintTaskLimit);
        System.out.println("待处理任务数：" + pendingTaskCount);
        System.out.println("审计事件编号：" + auditEventId);
        System.out.println("计划完成率：" + plannedProgress);
        System.out.println("预计工时：" + estimatedHours);
        System.out.println("看板代号：" + boardCode);
        System.out.println("已归档：" + archived);
        System.out.println("任务标题：" + taskTitle);
    }
}
```

### 3. Java 8 完整参考实现

Java 8 版使用相同的八种基本类型和字面量规则。下面仍然给出完整、可直接运行的实现：

```java
package com.teamflow.app;

/**
 * 展示 TeamFlow 任务指标使用的八种基本类型。
 */
public final class TaskTypeSnapshot {
    /**
     * 创建任务指标快照并输出各项值。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        byte maxRetries = 5;
        short sprintTaskLimit = 120;
        int pendingTaskCount = 42;
        long auditEventId = 4_000_000_001L;
        float plannedProgress = 0.6F;
        double estimatedHours = 13.5;
        char boardCode = 'B';
        boolean archived = false;
        String taskTitle = "整理课程目录";

        System.out.println("最大重试次数：" + maxRetries);
        System.out.println("迭代任务上限：" + sprintTaskLimit);
        System.out.println("待处理任务数：" + pendingTaskCount);
        System.out.println("审计事件编号：" + auditEventId);
        System.out.println("计划完成率：" + plannedProgress);
        System.out.println("预计工时：" + estimatedHours);
        System.out.println("看板代号：" + boardCode);
        System.out.println("已归档：" + archived);
        System.out.println("任务标题：" + taskTitle);
    }
}
```

### 4. 两个版本的配置与运行

1. 在 JDK 25 工程中确认 Project SDK、app 模块 SDK、Maven Runner JRE 都是 JDK 25，根 POM 使用
   `release=25`；Reload Maven Projects 后，从新建类的 `main` 左侧运行 `TaskTypeSnapshot`。
2. 在 Java 8 工程中确认对应三处都选择 JDK 8，根 POM 使用 `release=8`；Reload 后运行 Java 8
   工程里的 `TaskTypeSnapshot`。
3. 两边的运行配置都必须指向 `com.teamflow.app.TaskTypeSnapshot`，不能继续运行
   `TeamFlowApplication`。运行前先观察配置名称，运行后再核对九行输出。

两个版本都应输出：

```text
最大重试次数：5
迭代任务上限：120
待处理任务数：42
审计事件编号：4000000001
计划完成率：0.6
预计工时：13.5
看板代号：B
已归档：false
任务标题：整理课程目录
```

### 5. 自我检查

完成练习后，逐项回答：

1. 为什么审计事件编号不能省略 `L`？
2. 为什么计划完成率使用 `0.6F`，而预计工时的 `13.5` 不需要 `F`？
3. 为什么看板代号可以使用 `char`，任务标题却应使用 `String`？
4. 为什么归档状态不能写成 `0`？
5. 哪些类型在普通业务计数中应优先用 `int` 或 `long`，而不是为了数值小就选择 `byte`、`short`？
6. JDK 25 与 Java 8 在本课源码中为什么不需要不同写法？

能够从类型范围和字面量规则解释答案，并在两个工程里得到一致输出，才说明本课反馈环已经完成。
