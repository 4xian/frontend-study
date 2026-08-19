---
id: backend.java.learn.basics.type-conversion
type: lesson
title: 类型转换
summary: 在 TeamFlow 的任务指标中掌握基本类型的自动宽化、显式窄化、截断和取值边界
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 70
prerequisites:
  - backend.java.learn.basics.variables-types-and-operators
objectives:
  - 能区分保持原类型、自动宽化和必须写强制转换的显式窄化。
  - 能根据 Java 的基本类型转换表判断一条赋值是否可以直接通过编译。
  - 能解释整数窄化时的低位保留、浮点转整数时向零截断以及超范围结果。
  - 能识别整数常量赋给 byte、short、char 时的特殊编译规则。
  - 能说明 int 转 float 可能丢失精度，并知道 boolean 与 String 不属于基本数值转换。
  - 能在 JDK 25 和 Java 8 工程中运行包含转换边界的 TeamFlow 程序。
recap:
  - 小范围整数可以自动宽化到更宽的数值类型，但宽化到 float 或 double 仍可能丢失精度。
  - 可能丢失范围或精度的基本类型转换通常必须使用 `(目标类型)` 强制转换。
  - 整数窄化保留目标类型的低位；浮点转整数按向零规则截去小数，NaN 和超范围值有规定结果。
  - 可表示的整型常量表达式可以直接赋给 byte、short 或 char，普通变量则不能靠“当前值很小”绕过规则。
  - boolean、String 与基本数值类型没有本课所讲的直接强制转换关系。
  - JDK 25 与 Java 8 的基本类型转换规则相同，本课代码可以分别完整运行。
related: []
tags:
  - Java
  - 类型转换
  - 基本类型
  - 强制转换
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 使用相同的基本类型转换语法和规则
verifiedAt: 2026-08-17
sources:
  - id: jls-25-conversions
    title: Java Language Specification 25 - Conversions and Contexts
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 基本类型宽化与窄化的完整转换路径
      - 整数窄化的低位保留和浮点转整数的向零规则
      - double、float、NaN、无穷大与整数类型之间的边界结果
      - 赋值上下文中可表示整型常量的特殊窄化
  - id: jls-25-types
    title: Java Language Specification 25 - Types, Values, and Variables
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 基本类型和值的分类以及浮点类型的表示边界
      - char、整数、float 和 double 的类型语义
  - id: dev-java-numbers
    title: Numbers - Dev.java
    url: https://dev.java/learn/numbers-strings/numbers/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Java 入门资料
    claims:
      - 初学者语境下的数值基本类型和包装类型边界
      - 字符串解析和装箱属于不同的转换能力
  - id: jls-8-conversions
    title: Java Language Specification 8 - Conversions and Contexts
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-5.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 的基本类型宽化、窄化和赋值上下文规则
      - Java 8 的浮点转整数边界和常量表达式窄化
  - id: java25-math-round
    title: Java SE 25 API - Math.round(double)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Math.html#round(double)
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - Math.round(double) 返回最接近参数的 long，用于与强制转换的向零截断结果作最小对照
  - id: java8-math-round
    title: Java SE 8 API - Math.round(double)
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/Math.html#round-double-
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 同样提供 Math.round(double) 的最接近 long 规则
  - id: stackoverflow-int-float-precision
    title: Java allows implicit conversion of int to float. Why?
    url: https://stackoverflow.com/questions/11908429/java-allows-implicit-conversion-of-int-to-float-why
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 初学者对宽化与精度的疑问
    claims:
      - 社区中真实出现了“自动宽化是否必然保持精确值”的疑问
  - id: stackoverflow-byte-cast
    title: Casting Incompatible Types in Java
    url: https://stackoverflow.com/questions/39172902/casting-incompatible-types-in-java
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 初学者的整数窄化疑问
    claims:
      - 社区中真实出现了整数强转为 byte 后范围和符号变化的疑问
  - id: stackoverflow-double-int
    title: Converting double to integer in Java
    url: https://stackoverflow.com/questions/6468730/converting-double-to-integer-in-java
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 初学者的浮点转整数疑问
    claims:
      - 社区中真实出现了强制转换截断与舍入之间的混淆
---

# 类型转换

TeamFlow 的任务数量可能来自不同来源：一个重试次数适合用 `byte`，累计事件编号可能需要 `long`，
而外部计算得到的比例可能暂时是 `double`。这些值不能因为“看起来都是数字”就随意互换。Java 会先
根据类型关系判断是否允许直接赋值；有损转换必须把决定写在源码中，运行结果也可能与原值不同。

本课只处理八种基本类型之间的转换，以及为了观察结果所需的最小赋值语法。字符串解析、包装类型、
引用类型强转和表达式中的完整数值提升分别属于字符串、对象和运算符等后续能力；这里会指出边界，
但不提前展开。

## 一、先建立转换地图

### 1. 三种结果不同的转换

把一个表达式放进另一个类型的变量时，可以先按下面三种情况判断：

| 情况 | 源码表现 | 是否通常需要强制转换 | 主要风险 |
| --- | --- | --- | --- |
| 保持原类型 | `int count = 3;` | 不需要 | 没有类型变化 |
| 自动宽化 | `long count = intCount;` | 不需要 | 转成浮点类型时可能丢精度 |
| 显式窄化 | `byte count = (byte) intCount;` | 需要 | 可能丢范围、精度或小数 |

“宽”和“窄”描述的是可表示值集合的相对关系，不是变量当前存的数字大小。`int` 变量即使当前值为
`3`，它的类型仍然是 `int`；Java 不会因为运行时值恰好很小，就把普通 `int` 变量自动塞进 `byte`。

### 2. 基本类型的常用宽化路径

下表只列本课需要使用的基本类型路径。箭头表示左侧的值可以直接放入右侧变量：

```text
byte  -> short -> int -> long -> float -> double
  |       |       |       |
  +------>int     +------>double

char  -> int -> long -> float -> double
```

更完整地写成列表：

- `byte` 可以宽化为 `short`、`int`、`long`、`float` 或 `double`。
- `short` 可以宽化为 `int`、`long`、`float` 或 `double`。
- `char` 可以宽化为 `int`、`long`、`float` 或 `double`。
- `int` 可以宽化为 `long`、`float` 或 `double`。
- `long` 可以宽化为 `float` 或 `double`。
- `float` 可以宽化为 `double`。

`boolean` 不在这张数值转换图中。它只能保存 `true` 或 `false`，不能和整数互换。

### 3. 普通赋值先看编译期类型

下面的完整小程序让两个赋值同时发生：

```java
/**
 * 观察基本类型自动宽化。
 */
public final class WideningAssignment {
    /**
     * 将 int 和 float 值放入更宽的变量并输出结果。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        int activeTaskCount = 17;
        long eventCount = activeTaskCount;
        double eventCountAsDouble = eventCount;

        System.out.println(eventCount);
        System.out.println(eventCountAsDouble);
    }
}
```

预期输出是 `17` 和 `17.0`。第一行发生 `int -> long`，第二行发生 `long -> double`；这两次赋值都
没有写 cast，因为目标类型允许这条宽化路径。输出中的 `.0` 是 `double` 的显示形式，不代表发生了
四舍五入。

## 二、自动宽化不等于永远精确

### 1. 整数到整数通常保持值

从较窄的有符号整数到较宽的有符号整数，Java 会扩展符号位；从 `char` 到整数类型会补零。下面的
程序只观察 `char -> int` 和 `int -> long`：

```java
/**
 * 观察整数宽化时的数值保持。
 */
public final class IntegralWidening {
    /**
     * 输出 char 的数值和 int 宽化后的 long 值。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        char boardCode = 'B';
        int boardNumber = boardCode;
        long widerNumber = boardNumber;

        System.out.println(boardNumber);
        System.out.println(widerNumber);
    }
}
```

预期输出为两行 `66`。`'B'` 是一个 `char` code unit，宽化到 `int` 后得到它的数值 66，再宽化到
`long` 仍然是 66。这里没有把 `char` 当成字符串，也没有把字符编码扩展成字符处理课程。

### 2. 宽化到浮点类型可能丢失低位精度

`int -> float`、`long -> float` 和 `long -> double` 允许自动宽化，但浮点数的有效精度有限。下面的
值只差 1，转成 `float` 后可能得到同一个结果：

```java
/**
 * 观察整数宽化到 float 时的精度变化。
 */
public final class FloatingWidening {
    /**
     * 输出原始整数和宽化后的浮点值。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        int exactInteger = 16_777_216;
        int nextInteger = 16_777_217;
        float exactFloat = exactInteger;
        float roundedFloat = nextInteger;

        System.out.println(exactFloat);
        System.out.println(roundedFloat);
    }
}
```

在 JDK 25 和 Java 8 中，预期输出都是两行 `1.6777216E7`。`nextInteger` 的低位在 `float` 中没有
足够位置保存，所以它与相邻可表示值对齐。这不是运行期异常，而是允许的宽化结果；需要完整整数精度
时，应保留 `int` 或选择能够满足范围与精度的类型，而不是只看“目标类型更宽”几个字。

**社区补充：** Stack Overflow 的真实提问反复出现“既然是 widening，为什么 `int` 转 `float` 还会
变值”的疑问。本节把这个疑问压缩为可运行的 16,777,216/16,777,217 对照，并以 JLS 25/8 的宽化
规则和本地输出核验；社区问答本身不替代语言规范。

### 3. TeamFlow 中的选择顺序

遇到一个待转换的值时按三步判断：

1. 先确认业务值的真实范围和是否必须保留小数，而不是先挑一个“看起来更大”的类型。
2. 如果目标类型在宽化路径上，直接赋值并检查是否存在浮点精度风险。
3. 如果目标类型更窄，先决定允许怎样的损失，再写显式 cast，并用边界值观察结果。

例如累计事件编号从 `int` 放到 `long` 可以直接赋值；把它压回 `int` 则必须证明编号不会超出 `int`
范围。强制转换只改变表达式的目标类型，不会替你检查业务范围。

## 三、显式窄化与强制转换

### 1. cast 写法表达了一个有损决定

强制转换的基本形状是：

```java
目标类型 新变量 = (目标类型) 原表达式;
```

下面把 `double` 变成 `int`，再把 `int` 变成 `byte`：

```java
/**
 * 观察两次显式窄化的结果。
 */
public final class NarrowingAssignment {
    /**
     * 输出 double 到 int 以及 int 到 byte 的窄化结果。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        double reportedRate = 87.9;
        int wholeRate = (int) reportedRate;
        int packetValue = 300;
        byte wireValue = (byte) packetValue;

        System.out.println(wholeRate);
        System.out.println(wireValue);
    }
}
```

预期输出为 `87` 和 `44`。第一行去掉小数部分；第二行保留 `300` 的低 8 位，得到 `44`。两次
转换都不会因为信息损失抛出运行期异常，因此 cast 前必须先判断这个损失是否可接受。

### 2. 整数窄化只保留目标类型的低位

整数窄化不是“找一个最接近的值”。Java 会保留目标类型能够容纳的低位，必要时结果的符号也会改变：

```java
/**
 * 观察整数窄化的低位结果。
 */
public final class IntegralNarrowing {
    /**
     * 将两个超出 byte 范围的值窄化后输出。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        int threeHundred = 300;
        int twoHundredFiftyFive = 255;

        System.out.println((byte) threeHundred);
        System.out.println((byte) twoHundredFiftyFive);
    }
}
```

预期输出为 `44` 和 `-1`。`300` 的低 8 位对应 44，`255` 的低 8 位全为 1，在有符号 `byte` 中
解释为 -1。若 TeamFlow 的编号来自外部输入，不能把这种结果当作校验；本课只观察语言规定，范围
校验会在后续输入契约课程处理。

### 3. 浮点转整数按向零截断

从 `float` 或 `double` 到整数类型时，Java 先按“向零”取得整数部分：正数去掉小数，负数也向 0
靠近，而不是向负无穷方向取整。

```java
/**
 * 对照正负浮点值的向零截断。
 */
public final class FloatingNarrowing {
    /**
     * 将正负浮点值窄化为 int 并输出。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        double positive = 7.9;
        double negative = -7.9;

        System.out.println((int) positive);
        System.out.println((int) negative);
    }
}
```

预期输出为 `7` 和 `-7`。如果业务需要“最近整数”或“始终向下”，不能把 cast 当作舍入工具；应在
学习舍入 API 后明确选择规则，再进行可能的整数转换。本课不提前教授舍入 API。

### 4. NaN、无穷大和超范围值也有固定结果

浮点转 `int` 或 `long` 时，NaN 先变成 0；超出目标整数范围的正值取目标最大值，负值取目标最小值。
再转成 `byte`、`short` 或 `char` 时，还会继续执行整数窄化：

```java
/**
 * 观察浮点特殊值转为整数的规定结果。
 */
public final class FloatingBoundary {
    /**
     * 输出 NaN、正无穷大和负无穷大的窄化结果。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        System.out.println((int) Double.NaN);
        System.out.println((int) Double.POSITIVE_INFINITY);
        System.out.println((int) Double.NEGATIVE_INFINITY);
        System.out.println((byte) Double.POSITIVE_INFINITY);
    }
}
```

预期输出为 `0`、`2147483647`、`-2147483648` 和 `-1`。最后一行先得到 `int` 最大值，再保留低
8 位成为 `byte` 的 -1。这些结果是语言规则，不是范围检查；不要用 cast 代替输入验证。

### 5. 可表示的整型常量有一条赋值例外

没有后缀的整数文字通常是 `int`，但在赋值上下文中，值能表示在 `byte`、`short` 或 `char` 时，
编译器允许对**常量表达式**做一次隐式窄化：

```java
/**
 * 对照常量表达式和普通变量的赋值规则。
 */
public final class ConstantNarrowing {
    /**
     * 输出可以直接赋值的整型常量和显式窄化结果。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        byte retryLimit = 3;
        char boardCode = 66;
        int configuredLimit = 3;
        byte copiedLimit = (byte) configuredLimit;

        System.out.println(retryLimit);
        System.out.println(boardCode);
        System.out.println(copiedLimit);
    }
}
```

预期输出为 `3`、`B` 和 `3`。`3`、`66` 是编译期可确定且在目标范围内的常量，所以前两次赋值不写
cast；`configuredLimit` 是普通 `int` 变量，即使当前值也是 3，仍需显式 `(byte)`。这个例外只解释
赋值规则，不延伸到运算符中的数值提升。

## 四、哪些“转换”不属于本课

### 1. boolean 不是数值类型

Java 不把 `0`、`1` 当成布尔别名，也不存在 `(boolean) 1` 这样的基本类型 cast。需要真假状态时直接
使用 `true` 或 `false`，不要复制其他语言的约定。

### 2. String 不是基本类型

`String` 是引用类型。`int` 和 `String` 之间不能用 `(int)` 或 `(String)` 互相强转；把文本解析成数值
需要后续字符串与输入课程中的专门 API。当前先保持边界清楚：源码字面量 `"42"` 是文本，`42` 是整数，
它们不是同一个值的两种 cast 写法。

### 3. 包装类型和引用类型强转另有规则

`Integer`、`Double` 等包装类涉及装箱与拆箱，普通对象之间的强转还可能在运行期抛出异常。它们不属于
本课的基本类型转换地图，后续课程会单独说明，当前不要把“数值 cast”和“对象 cast”混为一谈。

## 五、易错示例

**社区补充：** Stack Overflow 的可核验问答分别记录了 `int -> float` 精度变化、整数转 `byte` 后符号
变化和 `double -> int` 截断与舍入混淆。本节的错误项保留这些真实误区，但每条规则仍以 JLS 25/8 和本地
可运行输出为准。

:::pitfalls
### 普通 int 变量直接赋给 byte

**现象：** 编译器报告可能发生有损转换，即使变量当前保存的数值是 3。

**触发条件：** 把普通 `int` 变量直接赋给 `byte`、`short` 或 `char`，并以为运行时值足够小就可以。

**原因：** 赋值判断使用变量的编译期类型；只有可表示的整型常量表达式有特殊的隐式窄化规则。

**后果：** 程序编译失败；强行改成 cast 后若未来值越界，还可能静默得到错误结果。

**错误示例：**

```java
int retryLimit = 3;
byte configuredLimit = retryLimit;
```

**正确写法：**

```java
int retryLimit = 3;
byte configuredLimit = (byte) retryLimit;
```

**影响版本：** JDK 25 与 Java 8 都适用。

**验证方式：** 错误版应在编译阶段失败；正确版运行后输出 3，并检查 cast 前是否已经确认范围。

**来源：** JLS 25/8 第 5.2 节赋值上下文。

### 把向零截断误认为四舍五入

**现象：** `(int) 7.9` 得到 7，`(int) -7.9` 得到 -7，而不是按业务期待的舍入结果。

**触发条件：** 使用浮点到整数的 cast 代替“最近整数”或“始终向下”等明确舍入规则。

**原因：** 浮点转整数按向零规则取得整数部分，cast 没有附加的舍入策略。

**后果：** 任务完成率、时长或金额等指标可能出现边界误差；负数尤其容易和“向下”混淆。

**错误示例：**

```java
double completionRate = 7.9;
double negativeRate = -7.9;
int wholeRate = (int) completionRate;
int negativeWholeRate = (int) negativeRate;

System.out.println(wholeRate);
System.out.println(negativeWholeRate);
```

**正确写法：**

```java
double completionRate = 87.9;
long roundedRate = Math.round(completionRate);
double negativeRate = -7.9;
long roundedNegativeRate = Math.round(negativeRate);

System.out.println(roundedRate);
System.out.println(roundedNegativeRate);
```

**影响版本：** JDK 25 与 Java 8 都适用。

**验证方式：** 错误版分别输出 7、-7；正确版分别输出 88、-8。先确认需求是向零截断还是取最近整数，
再选择 cast 或 `Math.round`。本课只用它做最近整数的结果对照，不展开其他舍入策略；不要用“输出看起来接近”
代替规则判断。

**来源：** JLS 25/8 第 5.1.3 节；社区问题 `6468730`。

### 直接窄化超出 byte 范围的编号

**现象：** 程序可以编译运行，但 300 变成 44，255 变成 -1，没有异常提醒。

**触发条件：** 对未经范围检查的 `int` 直接执行 `(byte)`。

**原因：** 整数窄化保留目标类型的低位，超出的高位被丢弃；结果仍是合法的 `byte`。

**后果：** 编号、状态码或重试次数可能静默改变，造成难以察觉的数据错误。

**错误示例：**

```java
int taskCode = 300;
byte wireCode = (byte) taskCode;
```

**正确写法：**

```java
int taskCode = 100; // 已确认在 byte 范围内
byte wireCode = (byte) taskCode;
System.out.println(wireCode);
```

**影响版本：** JDK 25 与 Java 8 都适用。

**验证方式：** 正确版使用已确认安全的 100 并输出 100；再把错误版的 `taskCode` 分别改为 127、128、255、
300，记录低位结果。尚未确认范围的 300 应先保留为 `int`，不要继续当作已验证的 `byte`；范围处理留到
后续输入校验课程。

**来源：** JLS 25/8 第 5.1.3 节；社区问题 `39172902`。

### 以为宽化到 float 一定精确

**现象：** `int` 可以直接赋给 `float`，但 16,777,217 转换后显示为 16,777,216。

**触发条件：** 看到“widening”就推断每一位都能保留，使用 float 保存必须精确的整数编号。

**原因：** `float` 的有效精度小于大范围 `int` 的全部整数位，JLS 允许正确舍入但不保证低位精确。

**后果：** 事件编号、金额最小单位或去重键可能发生碰撞，且没有运行期异常。

**错误示例：**

```java
int eventId = 16_777_217;
float storedId = eventId;
System.out.println(storedId);
```

**正确写法：**

```java
int eventId = 16_777_217;
long exactId = eventId;
System.out.println(exactId);
```

**影响版本：** JDK 25 与 Java 8 都适用。

**验证方式：** 同时输出原始 int 和 float；需要精确整数时改用 int 或 long，并确认范围后再选择。

**来源：** JLS 25/8 第 5.1.2 节；社区问题 `11908429`。

### 试图把数字或文本强转成 boolean

**现象：** `(boolean) 1`、`boolean ready = 1` 或 `(int) "42"` 在编译阶段失败。

**触发条件：** 把其他语言的真假数字约定，或把字符串文本，误当成 Java 基本类型 cast。

**原因：** boolean 不在数值转换图中，String 也不是基本类型；文本解析和对象转换需要其他 API 与规则。

**后果：** 程序无法编译；盲目添加 cast 只会掩盖真正需要的输入解析或数据建模问题。

**错误示例：**

```java
boolean serviceReady = (boolean) 1;
int taskId = (int) "42";
```

**正确写法：**

```java
boolean serviceReady = true;
int taskId = 42;
String taskIdText = "42";

System.out.println(serviceReady);
System.out.println(taskId);
System.out.println(taskIdText);
```

**影响版本：** JDK 25 与 Java 8 都适用。

**验证方式：** 错误版必须编译失败；正确版分别输出 true、42 和 42，并记住文本解析不在本课范围内。

**来源：** JLS 25/8 第 4.2 节和第 5 章；Dev.java Numbers and Strings。
:::

## 六、完整程序

### 1. TeamFlow 中的文件位置

沿用前置课程已经建立的两份独立 Maven 工程，在各自的 app 模块中打开并修改现有的
`com.teamflow.app.TeamFlowApplication`，不要重复创建同名类：

```text
teamflow-maven-jdk25/
└── app/src/main/java/com/teamflow/app/TeamFlowApplication.java

teamflow-maven-java8/
└── app/src/main/java/com/teamflow/app/TeamFlowApplication.java
```

JDK 25 工程的编译目标保持 `release=25`，Java 8 工程保持 `release=8`。两份源码有意保持完整且相同，
这样可以先学习转换规则，再单独核对版本环境，而不把版本差异误认为类型转换差异。

### 2. JDK 25 完整程序

```java
package com.teamflow.app;

/**
 * 展示 TeamFlow 任务指标中的基本类型转换。
 */
public final class TeamFlowApplication {
    /**
     * 观察自动宽化、显式窄化和常量赋值的结果。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        int activeTaskCount = 17;
        long eventCount = activeTaskCount;
        int eventId = 16_777_217;
        float approximateEventId = eventId;
        double completionRate = 87.9;
        int wholeRate = (int) completionRate;
        int externalCode = 300;
        byte wireCode = (byte) externalCode;
        byte retryLimit = 3;
        char boardCode = 66;

        System.out.println("任务数宽化为 long：" + eventCount);
        System.out.println("任务编号宽化为 float：" + approximateEventId);
        System.out.println("完成率窄化为 int：" + wholeRate);
        System.out.println("外部编号窄化为 byte：" + wireCode);
        System.out.println("常量重试上限：" + retryLimit);
        System.out.println("常量看板代号：" + boardCode);
    }
}
```

### 3. JDK 25 的配置、运行和预期输出

1. 打开前置课程的 `teamflow-maven-jdk25/pom.xml`，选择 **Open as Project**；确认根 POM 的
   `maven.compiler.release` 为 `25`。
2. 在 **File | Project Structure | Project** 把 Project SDK 设为 JDK 25；在 **Modules | app |
   Dependencies** 确认模块 SDK 也指向 JDK 25。
3. 在 **Settings | Build, Execution, Deployment | Build Tools | Maven | Runner** 确认 Maven Runner
   JRE 为 JDK 25，Reload Maven Projects。
4. 打开已有 `TeamFlowApplication.java`，从当前类 `main` 左侧运行。运行配置应指向
   `com.teamflow.app.TeamFlowApplication`，不要运行前置课程的旧类。

预期输出为：

```text
任务数宽化为 long：17
任务编号宽化为 float：1.6777216E7
完成率窄化为 int：87
外部编号窄化为 byte：44
常量重试上限：3
常量看板代号：B
```

### 4. Java 8 完整程序

Java 8 使用同一份完整源码。这里仍然给出全部内容，不能用“同上”替代可运行代码：

```java
package com.teamflow.app;

/**
 * 展示 TeamFlow 任务指标中的基本类型转换。
 */
public final class TeamFlowApplication {
    /**
     * 观察自动宽化、显式窄化和常量赋值的结果。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        int activeTaskCount = 17;
        long eventCount = activeTaskCount;
        int eventId = 16_777_217;
        float approximateEventId = eventId;
        double completionRate = 87.9;
        int wholeRate = (int) completionRate;
        int externalCode = 300;
        byte wireCode = (byte) externalCode;
        byte retryLimit = 3;
        char boardCode = 66;

        System.out.println("任务数宽化为 long：" + eventCount);
        System.out.println("任务编号宽化为 float：" + approximateEventId);
        System.out.println("完成率窄化为 int：" + wholeRate);
        System.out.println("外部编号窄化为 byte：" + wireCode);
        System.out.println("常量重试上限：" + retryLimit);
        System.out.println("常量看板代号：" + boardCode);
    }
}
```

### 5. Java 8 的配置、运行和预期输出

1. 打开独立的 `teamflow-maven-java8/pom.xml`，选择 **Open as Project**；确认根 POM 的
   `maven.compiler.release` 为 `8`，不要把 JDK 25 工程临时改成 Java 8。
2. 在 **File | Project Structure | SDKs** 中选择真实的 JDK 8 安装目录；在 **Project** 和
   **Modules | app | Dependencies** 中都设为 Java 8。
3. 在 Maven Runner 中把 JRE 设为 JDK 8，Reload Maven Projects；运行前从终端执行 `mvn -version`，
   确认 Java version 是 1.8，再从当前类的 `main` 左侧运行。
4. 核对 Main class 为 `com.teamflow.app.TeamFlowApplication`，并得到与 JDK 25 完全相同的六行输出。

### 6. 按执行顺序解释结果

程序进入 `main` 后，先把 `int` 的任务数自动宽化为 `long`；再把大整数自动宽化为 `float`，因此丢掉
了无法表示的低位；随后显式把 `double` 的小数截去并把 300 的低位放进 `byte`。最后两个常量可以在
赋值上下文中直接窄化到 `byte` 和 `char`。每一行输出只观察上一步的值，不涉及运算、HTTP、数据库或
Spring Boot。

## 七、练习

:::exercise
### 记录 TeamFlow 转换快照

**要求：** 在 JDK 25 和 Java 8 两份工程的 app 模块中创建 `TaskConversionSnapshot`。声明
`int activeTasks = 16_777_217`、`long eventCount`、`float approximateTasks`、`double rate = 92.6`、
`int wholeRate`、`int rawCode = 255`、`byte wireCode`、`byte retryLimit = 4` 和 `char boardCode = 67`。
只使用本课讲过的赋值和 cast，不使用输入、条件、循环、包装类型或第三方依赖。

**验收：** 两个版本都从 `TaskConversionSnapshot` 的 `main` 运行并输出 `16777217`、`1.6777216E7`、
`92`、`-1`、`4`、`C` 六行；能说明 `activeTasks` 到 `float` 有精度风险、`rate` 到 `int` 是向零截断，
以及 `rawCode` 到 `byte` 为什么得到 -1。public 类名必须与文件名一致。
:::

### 1. JDK 25 完整参考实现

在 `teamflow-maven-jdk25/app/src/main/java/com/teamflow/app/TaskConversionSnapshot.java` 中创建：

```java
package com.teamflow.app;

/**
 * 输出 TeamFlow 任务转换练习的结果。
 */
public final class TaskConversionSnapshot {
    /**
     * 执行练习要求的六项转换并输出结果。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        int activeTasks = 16_777_217;
        long eventCount = activeTasks;
        float approximateTasks = activeTasks;
        double rate = 92.6;
        int wholeRate = (int) rate;
        int rawCode = 255;
        byte wireCode = (byte) rawCode;
        byte retryLimit = 4;
        char boardCode = 67;

        System.out.println(eventCount);
        System.out.println(approximateTasks);
        System.out.println(wholeRate);
        System.out.println(wireCode);
        System.out.println(retryLimit);
        System.out.println(boardCode);
    }
}
```

### 2. Java 8 完整参考实现

Java 8 没有本练习使用的语法差异，完整参考实现如下：

```java
package com.teamflow.app;

/**
 * 输出 TeamFlow 任务转换练习的结果。
 */
public final class TaskConversionSnapshot {
    /**
     * 执行练习要求的六项转换并输出结果。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        int activeTasks = 16_777_217;
        long eventCount = activeTasks;
        float approximateTasks = activeTasks;
        double rate = 92.6;
        int wholeRate = (int) rate;
        int rawCode = 255;
        byte wireCode = (byte) rawCode;
        byte retryLimit = 4;
        char boardCode = 67;

        System.out.println(eventCount);
        System.out.println(approximateTasks);
        System.out.println(wholeRate);
        System.out.println(wireCode);
        System.out.println(retryLimit);
        System.out.println(boardCode);
    }
}
```

### 3. 两个版本的运行步骤和输出

在 JDK 25 工程中把 Project SDK、app 模块 SDK、Maven Runner JRE 和 POM `release` 都核对为 25；在
Java 8 工程中把这四处都核对为 8。Reload 对应 Maven 工程后，分别从当前 `TaskConversionSnapshot`
类的 `main` 左侧运行，不要只切换一个全局 SDK，也不要继续运行 `TeamFlowApplication`。

两个版本都应输出：

```text
16777217
1.6777216E7
92
-1
4
C
```

完成练习后，能够解释每个输出来自哪条转换路径，并能在独立工程中重复得到结果，才算完成本课的转换
反馈环。

## 八、本节小结

- 先看编译期类型，再看目标类型是否在自动宽化路径上；不要依据变量当前值猜测转换是否允许。
- 宽化到浮点类型仍可能丢失低位精度；窄化会显式表达可能的范围、精度或小数损失。
- 整数窄化保留低位，浮点转整数向零截断，NaN 和无穷大遵循固定边界结果。
- 可表示的整型常量表达式可以直接赋给 `byte`、`short`、`char`，普通变量仍需 cast。
- `boolean`、`String`、包装类型和引用强转不属于本课的基本数值转换。
- JDK 25 与 Java 8 在本课规则和代码上没有真实差异；两份工程仍需分别配置、运行和核对输出。
