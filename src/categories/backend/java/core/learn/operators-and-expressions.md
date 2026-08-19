---
id: backend.java.learn.basics.operators-and-expressions
type: lesson
title: 运算符与表达式
summary: 在 TeamFlow 任务指标中组合算术、比较、逻辑和赋值运算，并读懂表达式的值与求值顺序
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 75
prerequisites:
  - backend.java.learn.basics.type-conversion
objectives:
  - 能区分操作数、运算符和表达式结果，并说明表达式可能同时产生值和副作用。
  - 能正确使用算术、关系、相等、逻辑、条件和赋值运算符。
  - 能解释整数除法、余数符号、前缀与后缀自增以及复合赋值的结果。
  - 能使用括号表达优先级意图，并说明普通二元运算从左到右求值和逻辑短路。
  - 能在 JDK 25 和 Java 8 中运行 TeamFlow 指标表达式程序并核对输出。
recap:
  - 表达式会计算出一个值，赋值、递增等表达式还会改变变量状态。
  - 整数相除仍是整数除法；需要小数时必须在除法前提升操作数。
  - 关系和逻辑运算产生 boolean，&& 和 || 会按需跳过右侧表达式。
  - 复合赋值会回到左侧类型，左侧只求值一次；不要把它误读成无条件安全的普通赋值。
  - 优先级决定默认分组，括号应当用来表达业务意图而不是依赖读者记忆。
  - 本课使用的基础运算符规则在 JDK 25 与 Java 8 中相同。
related: []
tags:
  - Java
  - 运算符
  - 表达式
  - 求值顺序
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 使用相同的基础运算符语法与规则
verifiedAt: 2026-08-17
sources:
  - id: jls-25-expressions
    title: Java Language Specification 25 - Expressions
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 表达式可产生值或副作用，运算符按语法层级组成表达式
      - 算术、关系、相等、条件和赋值运算符的语言规则
      - 普通运算的求值顺序、优先级和赋值结合方向
  - id: jls-25-evaluation-order
    title: Java Language Specification 25 - Evaluation Order
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.7
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 二元运算左操作数先完整求值，再求右操作数
  - id: jls-25-remainder
    title: Java Language Specification 25 - Remainder Operator
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.17.3
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 整数余数满足除法和余数恒等式，余数符号跟随被除数
  - id: jls-25-short-circuit
    title: Java Language Specification 25 - Conditional-And and Conditional-Or
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.23
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - && 在左侧为 true 时才求值右侧，|| 在左侧为 false 时才求值右侧
  - id: jls-25-conditional-operator
    title: Java Language Specification 25 - Conditional Operator
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.25
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 条件运算符只求值被选择的分支
  - id: jls-25-compound-assignment
    title: Java Language Specification 25 - Compound Assignment Operators
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.26.2
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 复合赋值包含回到左侧类型的隐式转换，并且左侧表达式只求值一次
  - id: jls-8-expressions
    title: Java Language Specification 8 - Expressions
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - 本课涉及的算术、比较、逻辑、条件、赋值和求值顺序规则在 Java 8 已存在
  - id: jls-8-floating-expressions
    title: Java Language Specification 8 - Floating-Point Expressions
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html#jls-15.4
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 非 strictfp 浮点表达式允许扩展指数值集的历史规则
  - id: dev-java-using-operators
    title: Using Operators in Your Programs - Dev.java
    url: https://dev.java/learn/language-basics/using-operators
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Java 入门资料
    claims:
      - 初学者语境下的算术、单目、赋值和优先级示例
  - id: oracle-java8-operator-tutorial
    title: Operators - The Java Tutorials
    url: https://docs.oracle.com/javase/tutorial/java/nutsandbolts/operators.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java Tutorials，面向 JDK 8
    claims:
      - Java 8 运算符优先级、结合方向和运算符分类
  - id: stackoverflow-integer-division
    title: 'Integer division: How do you produce a double?'
    url: https://stackoverflow.com/questions/3144610/integer-division-how-do-you-produce-a-double
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 初学者的整数除法误区
    claims:
      - 社区中真实出现了除法完成后再转 double 导致 0.0 的问题
  - id: stackoverflow-compound-assignment
    title: Why don't Java's compound assignment operators require casting?
    url: https://stackoverflow.com/questions/8710619/why-dont-javas-compound-assignment-operators-require-casting
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 初学者的复合赋值误区
    claims:
      - 社区中真实出现了复合赋值隐式转换与普通赋值差异的问题
  - id: stackoverflow-short-circuit
    title: Java logical operator short-circuiting
    url: https://stackoverflow.com/questions/8759868/java-logical-operator-short-circuiting
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 初学者的逻辑短路误区
    claims:
      - 社区中真实出现了短路导致右侧副作用不执行的问题
  - id: stackoverflow-negative-remainder
    title: How does Java do modulus calculations with negative numbers?
    url: https://stackoverflow.com/questions/4403542/how-does-java-do-modulus-calculations-with-negative-numbers
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 初学者的负余数误区
    claims:
      - 社区中真实出现了把 Java 余数误认为总是非负 modulo 的问题
---

# 运算符与表达式

TeamFlow 的任务指标不是一排已经算好的数字：系统要计算完成率、判断积压是否达到提醒线、更新重试次数，
还要把几个简单结果组合成一次可读的输出。Java 用表达式完成这些计算。表达式可以只产生一个值，也可以
在产生值的同时改变变量状态，所以读懂一行代码时不能只看符号，还要看它的求值顺序和副作用。

本课只处理零基础最常用的算术、比较、逻辑、条件和赋值运算。位运算、对象相等、字符串方法、分支语句和
循环控制留到后续课程；这里会指出边界，但不把它们提前讲完。所有示例都使用传统 `main` 入口，保证 JDK 25
和 Java 8 都能运行。

## 一、把表达式看成“值和状态变化”

### 1. 操作数、运算符和结果

表达式由操作数和运算符按 Java 语法组合而成，并计算出一个结果。例如 `activeTasks + queuedTasks` 的
结果是一个整数，`activeTasks > 10` 的结果是一个 `boolean`。把结果赋给变量时，赋值语句会进一步改变
变量保存的状态：

```java
int activeTasks = 12;
int queuedTasks = 5;
int totalTasks = activeTasks + queuedTasks;
boolean hasBacklog = totalTasks > 10;

System.out.println(totalTasks);
System.out.println(hasBacklog);
```

预期输出为 `17` 和 `true`。加法表达式先得到 17，比较表达式再把 17 与 10 比较并产生布尔值；最后两条
输出只是读取变量，不会再次计算前面的表达式。

### 2. 赋值本身也会产生结果

简单赋值先计算右侧，再把结果写入左侧变量；赋值表达式的结果就是写入后的值。因此下面的写法能运行，
但连续赋值应只在含义清楚时使用：

```java
int activeTasks;
int totalTasks = activeTasks = 17;

System.out.println(activeTasks);
System.out.println(totalTasks);
```

预期输出为两行 `17`。最内层先给 `activeTasks` 写入 17，该赋值表达式再把 17 提供给 `totalTasks`。这不
会改变变量类型；两边仍然是 `int`。

### 3. 先区分本课会用到的类别

| 类别 | 代表运算符 | 结果或作用 |
| --- | --- | --- |
| 算术 | `+`、`-`、`*`、`/`、`%` | 计算数值 |
| 一元 | `+`、`-`、`!`、`++`、`--` | 只需要一个操作数或更新一个变量 |
| 关系与相等 | `<`、`>=`、`==`、`!=` | 产生 `boolean` |
| 逻辑 | `&&`、`\|\|`、`!` | 组合或反转 `boolean`，可能跳过右侧 |
| 条件 | `条件 ? 值1 : 值2` | 只计算被选中的一个值 |
| 赋值 | `=`、`+=`、`-=`、`*=`、`/=`、`%=` | 更新左侧变量并产生赋值结果 |

优先级只是默认分组规则，不是业务意图的替代品。表达式较长时，使用括号比背完整运算符表更可靠。

## 二、算术运算先看操作数类型

### 1. 加减乘除和余数

四个基本数值运算符的含义与数学符号相近，`%` 返回除法后的余数：

```java
int completed = 17;
int failed = 3;
int total = completed + failed;
int remaining = total - completed;
int batches = total * 2;
int remainder = total % 4;

System.out.println(total);
System.out.println(remaining);
System.out.println(batches);
System.out.println(remainder);
```

预期输出为 `20`、`3`、`40` 和 `0`。每个运算都先读取当前操作数，再把结果交给左侧变量。

### 2. 整数除法向零截断

当两个操作数都是整数时，`/` 的结果仍是整数，小数部分会向 0 截去：

```java
int completed = 5;
int total = 20;
int integerRate = completed / total;
double decimalRate = (double) completed / total;

System.out.println(integerRate);
System.out.println(decimalRate);
```

预期输出为 `0` 和 `0.25`。第一行在除法时两个操作数都是 `int`，所以先得到整数 0；第二行在除法前把
`completed` 提升为 `double`，计算过程才保留小数。除法完成后再写 `(double) (completed / total)` 已经
来不及恢复被截去的小数。

### 3. 余数的符号跟随被除数

Java 的 `%` 是余数，不保证像某些数学 modulo 定义那样总是非负。整数除法和余数满足：

```text
(a / b) * b + (a % b) == a
```

观察正负被除数：

```java
int positiveRemainder = 13 % 5;
int negativeRemainder = -13 % 5;

System.out.println(positiveRemainder);
System.out.println(negativeRemainder);
```

预期输出为 `3` 和 `-3`。`-13 / 5` 向 0 得到 -2，`-2 * 5 + -3` 恰好回到 -13。需要非负环绕索引时，
必须另行定义并验证业务规则，不能把 `%` 直接当作总返回正数的工具。

### 4. 一元正负和自增自减

一元 `+`、`-` 只接收一个操作数；`++` 和 `--` 会把变量加 1 或减 1，并且表达式本身还有一个值。前缀
先更新再产生新值，后缀先产生旧值再更新：

```java
int pendingTasks = 2;
int beforeUpdate = pendingTasks++;
int afterUpdate = ++pendingTasks;

System.out.println(beforeUpdate);
System.out.println(afterUpdate);
System.out.println(pendingTasks);
```

预期输出为 `2`、`4` 和 `4`。第一次后缀 `++` 让变量从 2 变成 3，但表达式值仍是旧值 2；第二次前缀 `++`
先把 3 变成 4，再产生 4。把自增塞进长表达式会增加阅读成本，实际代码中应保持副作用单一。

## 三、比较和逻辑运算产生 boolean

### 1. 关系运算一次只比较两边

`<`、`<=`、`>`、`>=` 先对两个数值操作数进行比较，结果是 `boolean`：

```java
int completed = 17;
int target = 20;
boolean belowTarget = completed < target;
boolean targetReached = completed >= target;

System.out.println(belowTarget);
System.out.println(targetReached);
```

预期输出为 `true` 和 `false`。Java 不支持把 `a < b < c` 当成数学中的连续比较；需要多个条件时，分别写出
比较结果，再用 `&&` 或 `||` 组合。

### 2. 基本类型的相等和不等

对本课使用的基本类型，`==` 比较两个值是否相等，`!=` 比较是否不同：

```java
int retryLimit = 3;
int configuredLimit = 3;
boolean sameLimit = retryLimit == configuredLimit;
boolean changedLimit = retryLimit != 4;

System.out.println(sameLimit);
System.out.println(changedLimit);
```

预期输出为两行 `true`。不要把 `=` 当成比较符号：`=` 会把右侧结果写入左侧，`==` 才产生比较结果。引用
类型的身份比较和 `equals` 方法属于对象与字符串课程，本课不提前展开。

### 3. 逻辑非、与、或

`!` 把 `true` 变成 `false`，`&&` 要求两侧都为真，`||` 只要求一侧为真：

```java
boolean serviceReady = true;
boolean hasBacklog = false;
boolean canDispatch = serviceReady && !hasBacklog;
boolean needsAttention = !serviceReady || hasBacklog;

System.out.println(canDispatch);
System.out.println(needsAttention);
```

预期输出为 `true` 和 `false`。逻辑表达式的结果仍然是 `boolean`；它不会把 `0` 或其他整数自动当成真假。

### 4. 短路是求值规则，不只是优化

`&&` 只有在左侧为 `true` 时才求值右侧，`||` 只有在左侧为 `false` 时才求值右侧。右侧如果有自增、
赋值或异常等副作用，可能完全不会发生：

```java
int checks = 0;
boolean firstResult = false && (++checks > 0);
boolean secondResult = true || (++checks > 0);

System.out.println(firstResult);
System.out.println(secondResult);
System.out.println(checks);
```

预期输出为 `false`、`true` 和 `0`。两个右侧 `++checks` 都被跳过，`checks` 没有改变。不要把短路误写成
“右边一定执行”；需要右侧表达式发生时，应把它单独写成清楚的语句。

## 四、条件表达式和赋值表达式

### 1. 条件运算符只选择一个值

`条件 ? 值1 : 值2` 会先求值条件，然后只求值被选中的一侧。它可以在需要一个值的地方完成简单选择，
但不应替代下一课的多步分支：

```java
int activeTasks = 7;
int warningLimit = 5;
String status = activeTasks > warningLimit ? "需要关注" : "正常";

System.out.println(status);
```

预期输出为 `需要关注`。条件为真时选择冒号前的文本，冒号后的表达式不会求值。这里的字符串只作为输出
结果，不展开字符串对象和文本比较规则。

### 2. 复合赋值包含一次隐式回转

`x += y` 等复合赋值运算符把运算结果写回 `x`。语言规则可以概括为：

```text
E1 op= E2  ≈  E1 = (T) ((E1) op (E2))
```

其中 `T` 是左侧变量的类型，且左侧表达式只求值一次。下面的 `short` 示例能编译：

```java
short retryCount = 3;
retryCount += 4.6;

System.out.println(retryCount);
```

预期输出为 `7`。`retryCount + 4.6` 的中间结果是 `double`，复合赋值再按左侧 `short` 类型写回；小数部分
按浮点转整数规则向零截断。普通写法 `retryCount = retryCount + 4.6` 则因为结果是 `double` 而不能直接赋给
`short`，需要显式转换。

### 3. 赋值从右向左结合

多个赋值运算符从右向左结合，因此 `first = second = 9` 等价于 `first = (second = 9)`：

```java
int firstCount;
int secondCount;
firstCount = secondCount = 9;

System.out.println(firstCount);
System.out.println(secondCount);
```

预期输出为两行 `9`。右侧赋值先完成，再把它的结果交给左侧。为了便于阅读，业务代码仍应优先使用单独的
赋值语句。

## 五、用括号和求值顺序表达意图

### 1. 常见优先级先记五层

本课只需要稳定掌握以下从高到低的部分：

| 优先级（高到低） | 运算符 | 说明 |
| --- | --- | --- |
| 一元/后缀 | `++`、`--`、`+`、`-`、`!` | 先处理单个操作数 |
| 乘除余 | `*`、`/`、`%` | 先于加减 |
| 加减 | `+`、`-` | 形成加法或减法结果 |
| 比较与逻辑 | `<`、`>=`、`==`、`&&`、`\|\|` | 逐层产生布尔结果 |
| 条件与赋值 | `?:`、`=`、`+=` 等 | 最后选择或写回 |

同一层的多数二元运算从左向右结合，赋值从右向左结合。真实业务表达式应优先加括号，避免把视觉顺序交给
优先级表：

```java
int activeTasks = 6;
int queuedTasks = 4;
int defaultWeight = 2;
int withoutParentheses = activeTasks + queuedTasks * defaultWeight;
int withParentheses = (activeTasks + queuedTasks) * defaultWeight;

System.out.println(withoutParentheses);
System.out.println(withParentheses);
```

预期输出为 `14` 和 `20`。乘法优先于加法，所以第一行先算 `4 * 2`；第二行括号把加法明确放在前面。

### 2. 普通二元运算从左到右求值

JLS 保证二元运算的左操作数先完整求值，再求右操作数。可以用一个很短的赋值表达式观察这一点：

```java
int activeTasks = 1;
int result = (activeTasks = 3) * activeTasks;

System.out.println(result);
System.out.println(activeTasks);
```

预期输出为 `9` 和 `3`。左侧先把 `activeTasks` 改为 3，右侧读取到的就是 3；这不是鼓励把赋值藏在乘法里，
而是说明求值顺序确实会影响带副作用表达式的结果。普通代码应把状态更新拆成独立语句。

### 3. JDK 25 与 Java 8 的浮点边界

本课的整数除法、比较、逻辑短路、条件表达式和赋值规则在 JDK 25 与 Java 8 中相同。一个真实但不影响
这些基础示例的历史差异是：Java 8 允许非 `strictfp` 浮点表达式使用扩展指数值集，而 Java 17 起浮点表达式
始终严格求值。本课不依赖扩展精度，也不使用 `strictfp`，所以同一份源码可在两个版本运行；不要把这条历史
差异泛化成整数运算不同。

## 六、易错示例

**社区补充：** Stack Overflow 的可复现问题集中暴露了整数除法、复合赋值、短路副作用和负余数四种误区。
以下每条规则都回到 JLS 25/8 核对，社区问答只用于确认这些问题确实会困扰初学者。

:::pitfalls
### 除法完成后才转换成 double

**现象：** `double rate = (double) (5 / 20);` 得到 `0.0`，而不是 `0.25`。

**触发条件：** 把强制转换放在整数除法括号外，误以为目标变量类型会反过来改变除法过程。

**原因：** 括号内两个操作数都是 `int`，除法先向零截断为 0；转换只能改变已经得到的 0 的类型。

**后果：** 完成率、比例或平均值被静默截断，后续输出看似合法却失去小数信息。

**错误示例：**

```java
double rate = (double) (5 / 20);
System.out.println(rate);
```

**正确写法：**

```java
double rate = (double) 5 / 20;
System.out.println(rate);
```

**影响版本：** JDK 25 与 Java 8 都适用。

**验证方式：** 错误版输出 `0.0`，正确版输出 `0.25`；确认提升发生在 `/` 之前。

**来源：** JLS 25/8 第 15.17.2 节；社区问题 `3144610`。

### 把复合赋值当成普通加法再赋值

**现象：** `short x = 3; x += 4.6;` 能编译并输出 `7`，而 `x = x + 4.6;` 不能直接编译。

**触发条件：** 看到 `+=` 就把它当成纯文本缩写，忽略了复合赋值会回到左侧类型。

**原因：** `x + 4.6` 的中间结果是 `double`；复合赋值按左侧 `short` 类型隐式转换后再写回。

**后果：** 代码可能编译通过却丢失小数或溢出，若把它误认为无损运算就会写出错误指标。

**错误示例：**

```java
short x = 3;
x = x + 4.6;
```

**正确写法：**

```java
short x = 3;
x += 4.6;
System.out.println(x);
```

**影响版本：** JDK 25 与 Java 8 都适用。

**验证方式：** 错误版应编译失败；正确版输出 `7`，并说明复合赋值不是“自动安全”，而是执行了隐式回转。

**来源：** JLS 25/8 第 15.26.2 节；社区问题 `8710619`。

### 误以为短路右侧一定会执行

**现象：** `false && (++checks > 0)` 与 `true || (++checks > 0)` 执行后，`checks` 仍是 0。

**触发条件：** 把 `&&`、`||` 当成总会计算两边的普通二元运算。

**原因：** `&&` 左侧为 false 时跳过右侧，`||` 左侧为 true 时跳过右侧；这是语言求值规则。

**后果：** 把日志、计数或必要更新放在右侧时，代码可能静默不执行这些副作用。

**错误示例：**

```java
int checks = 0;
boolean shouldCheck = false && (++checks > 0);
System.out.println(checks);
```

**正确写法：**

```java
int checks = 0;
boolean shouldCheck = true;
checks += shouldCheck ? 1 : 0;
System.out.println(checks);
```

**影响版本：** JDK 25 与 Java 8 都适用。

**验证方式：** 错误版输出 `0`；正确版输出 `1`，因为先用条件表达式得到要增加的值，再单独更新 `checks`。
把 `shouldCheck` 改为 `false` 后重跑应输出 `0`。本课只观察短路，不展开条件分支结构。

**来源：** JLS 25/8 第 15.23、15.24 节；社区问题 `8759868`。

### 把余数当成总是非负的 modulo

**现象：** `-13 % 5` 得到 `-3`，而不是期待的 `2`。

**触发条件：** 直接把 Java `%` 当成数学中总返回非负值的 modulo。

**原因：** Java 余数满足 `(a / b) * b + (a % b) == a`，结果符号跟随被除数。

**后果：** 用余数做环绕索引、分桶或页面偏移时可能产生负值，后续访问边界会出错。

**错误示例：**

```java
int bucket = -13 % 5;
System.out.println(bucket);
```

**正确写法：**

```java
int remainder = -13 % 5;
System.out.println(remainder);
// 需要非负环绕值时，先定义并验证专门的业务规则。
```

**影响版本：** JDK 25 与 Java 8 都适用。

**验证方式：** 错误版和正确版都输出 `-3`；正确版不再把结果描述成非负 modulo，后续业务规则应单独验收。

**来源：** JLS 25/8 第 15.17.2、15.17.3 节；社区问题 `4403542`。
:::

## 七、完整程序

### 1. TeamFlow 指标快照

下面的程序把本课的核心运算串起来：先计算总任务数，再计算小数完成率，使用比较和短路决定是否派发，
用条件表达式生成状态文本，最后用复合赋值更新重试次数。它不使用条件语句、循环、框架或第三方库。

```java
package com.teamflow.app;

/**
 * 计算 TeamFlow 任务指标表达式。
 */
public final class TeamFlowApplication {
    /**
     * 运行一组可观察的指标表达式。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        int completedTasks = 17;
        int queuedTasks = 3;
        int totalTasks = completedTasks + queuedTasks;
        double completionRate = (double) completedTasks / totalTasks;
        boolean serviceReady = true;
        boolean hasBacklog = queuedTasks > 5;
        boolean canDispatch = serviceReady && !hasBacklog;
        int retryCount = 1;
        retryCount += 2;
        String status = canDispatch ? "可派发" : "暂缓派发";

        System.out.println("总任务数：" + totalTasks);
        System.out.println("完成率：" + completionRate);
        System.out.println("状态：" + status);
        System.out.println("重试次数：" + retryCount);
    }
}
```

### 2. 运行步骤与预期输出

在前置课程已经建立的 JDK 25 Maven 工程中打开现有 `com.teamflow.app.TeamFlowApplication`，将上面代码放入
`app/src/main/java/com/teamflow/app/TeamFlowApplication.java`。Project SDK、app 模块 SDK、Maven Runner JRE
和 POM 的 `release` 都保持为 25，Reload 后从当前类的 `main` 左侧运行。

预期输出为：

```text
总任务数：20
完成率：0.85
状态：可派发
重试次数：3
```

执行过程是：`17 + 3` 先得到 20；在除法前把 17 提升为 `double` 才得到 0.85；`queuedTasks > 5` 为 false，
所以 `serviceReady && !hasBacklog` 为 true；条件表达式选择“可派发”；`retryCount += 2` 把 1 更新为 3。

### 3. Java 8 兼容运行

本课没有真实的基础运算符语法差异，Java 8 可以直接编译运行上面的完整源码，不需要另写一份重复代码。打开
独立的 `teamflow-maven-java8/pom.xml`，把 Project SDK、app 模块 SDK、Maven Runner JRE 和 POM `release` 都
核对为 8，再从 `TeamFlowApplication` 的 `main` 运行；预期仍是同样的四行输出。不要把 JDK 25 工程临时改成
Java 8，也不要只切换一个全局 SDK。

## 八、练习

:::exercise
### 记录 TeamFlow 指标表达式

**要求：** 在 JDK 25 工程的 app 模块创建 `TaskExpressionSnapshot`。声明 `int completed = 18`、
`int queued = 2`、`double rate`、`boolean ready = true`、`boolean backlog`、`boolean dispatchable`、
`String status` 和 `int retries = 1`。使用本课的 `+`、`/`、`>`、`&&`、`!`、`?:` 和 `+=` 完成计算；不要使用
输入、循环、数组、包装类型、第三方依赖或条件分支语句。

**验收：** 从 `TaskExpressionSnapshot.main` 运行并依次输出 `20`、`0.9`、`true`、`可派发`、`3` 五行；
能说明除法前为什么要提升 `completed`，以及 `queued > 5` 如何影响 `dispatchable`。public 类名必须与文件名一致。
:::

### 1. 完整参考实现

在 `teamflow-maven-jdk25/app/src/main/java/com/teamflow/app/TaskExpressionSnapshot.java` 中创建：

```java
package com.teamflow.app;

/**
 * 输出 TeamFlow 指标表达式练习结果。
 */
public final class TaskExpressionSnapshot {
    /**
     * 执行练习中的算术、比较、逻辑、条件和复合赋值。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        int completed = 18;
        int queued = 2;
        int total = completed + queued;
        double rate = (double) completed / total;
        boolean ready = true;
        boolean backlog = queued > 5;
        boolean dispatchable = ready && !backlog;
        String status = dispatchable ? "可派发" : "暂缓派发";
        int retries = 1;
        retries += 2;

        System.out.println(total);
        System.out.println(rate);
        System.out.println(dispatchable);
        System.out.println(status);
        System.out.println(retries);
    }
}
```

Java 8 使用同一份参考实现即可；本课没有引入 Java 9 及以上语法。两个版本的 Project SDK、模块 SDK、Maven
Runner JRE 和 POM `release` 仍需分别核对为目标版本，运行结果都应为：

```text
20
0.9
true
可派发
3
```

## 九、本节小结

- 表达式会产生值，赋值、`++`、`--` 和复合赋值还会改变变量状态。
- 整数除法向零截断；要得到小数，必须在除法前提升操作数。
- `%` 是有符号余数；关系、相等和逻辑运算产生 `boolean`。
- `&&`、`||` 和 `?:` 会按条件跳过未选中的右侧表达式。
- 复合赋值包含隐式回到左侧类型的转换，普通赋值不能简单替换它。
- 先用括号表达意图，再依赖优先级；普通二元运算的左侧先求值。
- JDK 25 与 Java 8 的本课基础规则相同，浮点严格求值差异只作版本边界提示。
