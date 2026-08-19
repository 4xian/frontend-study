---
id: backend.java.learn.basics.bigdecimal
type: lesson
title: BigDecimal
summary: 用精确十进制表示 TeamFlow 工时与预算，明确构造、运算、scale、舍入和比较合同
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 115
prerequisites:
  - backend.java.learn.basics.date-time-and-time-zones
objectives:
  - 能说明 BigDecimal 适合精确十进制业务值，而 double 适合允许二进制近似的科学计算。
  - 能使用字符串构造精确输入，并解释 double 构造器与 valueOf 的不同结果。
  - 能根据 unscaled value、scale 和 precision 读懂一个 BigDecimal 的值与表示形式。
  - 能使用 add、subtract、multiply 和 divide 完成计算，并接住方法返回的新对象。
  - 能区分 scale 与 MathContext precision，并为除法和小数位缩减显式选择舍入规则。
  - 能根据业务意图区分 compareTo 与 equals，避免用 equals 判断数值为零。
  - 能在 JDK 25 与 Java 8 中运行通用的 TeamFlow 预算程序和练习参考实现。
recap:
  - BigDecimal 是不可变的任意精度有符号十进制数，值可以理解为 unscaled value 乘以十的负 scale 次方。
  - 精确文本优先使用字符串构造；已经成为 double 的值只能保留或转换那个近似值，不能恢复丢失的信息。
  - add、subtract、multiply、divide 和 setScale 都返回结果，原对象不会被原地修改。
  - scale 管理小数点右侧位数，MathContext precision 管理从首个非零数字开始的有效数字总数。
  - 不能有限表示的精确除法会失败；调用方必须按业务合同给出结果 scale 和 RoundingMode。
  - compareTo 比较数值，equals 同时比较数值与 scale；两者不能在集合键和业务相等判断中随意互换。
related: []
tags:
  - Java
  - BigDecimal
  - 精确十进制
  - scale
  - precision
  - RoundingMode
  - MathContext
  - TeamFlow
appliesTo: JDK 25 主线；本课使用的 BigDecimal、RoundingMode 与 MathContext 核心能力在 Java 8 也可使用
verifiedAt: 2026-08-18
sources:
  - id: java-25-bigdecimal
    title: Java SE 25 API - BigDecimal
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/math/BigDecimal.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - BigDecimal 的不可变性、任意精度、unscaled value、scale 与 precision 合同
      - 字符串和 double 构造器、valueOf、算术运算、除法、setScale、比较与文本输出行为
      - 旧整数舍入常量已弃用，应使用 RoundingMode 枚举
  - id: java-8-bigdecimal
    title: Java SE 8 API - BigDecimal
    url: https://docs.oracle.com/javase/8/docs/api/java/math/BigDecimal.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 具有本课使用的 BigDecimal 构造、运算、scale、precision、舍入和比较合同
      - Java 8 已建议使用 RoundingMode 枚举替代旧整数舍入常量
  - id: java-25-rounding-mode
    title: Java SE 25 API - RoundingMode
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/math/RoundingMode.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - HALF_UP、HALF_EVEN、CEILING、FLOOR 与 UNNECESSARY 等舍入方向的含义
      - UNNECESSARY 在精确结果无法满足时抛出 ArithmeticException
  - id: java-8-rounding-mode
    title: Java SE 8 API - RoundingMode
    url: https://docs.oracle.com/javase/8/docs/api/java/math/RoundingMode.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 提供与本课相同的 RoundingMode 枚举和舍入方向
  - id: java-25-math-context
    title: Java SE 25 API - MathContext
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/math/MathContext.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - MathContext 由有效数字 precision 和 RoundingMode 组成
      - MathContext 的 precision 与结果小数位 scale 是不同合同
  - id: java-8-math-context
    title: Java SE 8 API - MathContext
    url: https://docs.oracle.com/javase/8/docs/api/java/math/MathContext.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 提供与本课相同的 MathContext precision 和 roundingMode 设置
  - id: stackoverflow-bigdecimal-double-valueof
    title: Stack Overflow - BigDecimal to use new or valueOf
    url: https://stackoverflow.com/questions/7186204/bigdecimal-to-use-new-or-valueof
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 与 JDK 25；正文构造结果已在两版复现
    claims:
      - 开发者会真实混淆 BigDecimal double 构造器与 valueOf 的结果语义
  - id: stackoverflow-bigdecimal-divide
    title: Stack Overflow - ArithmeticException thrown during BigDecimal.divide
    url: https://stackoverflow.com/questions/2749375/arithmeticexception-thrown-during-bigdecimal-divide
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 与 JDK 25；正文除法失败与正确写法已在两版复现
    claims:
      - 对非终止小数执行无舍入策略的精确除法是可复现的真实误区
  - id: stackoverflow-bigdecimal-equals
    title: Stack Overflow - Why BigDecimal 5.50 Is Not Equal to 5.5
    url: https://stackoverflow.com/questions/3866514/why-bigdecimal5-50-not-equals-to-bigdecimal5-5-and-how-to-work-around-th
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 与 JDK 25；正文 equals 与 compareTo 结果已在两版复现
    claims:
      - 开发者会真实把 equals 当成忽略 scale 的数值相等比较
---

# BigDecimal

TeamFlow 已经能保存任务、排序集合和安排日期。接下来一旦要记录“计划工时为 12.5 小时”“每小时成本为
80.00 元”或“预算使用率为 91.8%”，数值就不再只是一个大概范围。账面上的 `0.10` 必须能按十进制规则
参与计算，舍弃哪一位也必须由业务明确决定。

本课使用 `BigDecimal` 建立这份精确十进制合同。重点是值从哪里来、每次运算返回什么、何时必须舍入，以及
相同数值为什么可能具有不同 scale。币种、JSON、数据库字段、财务法规和报表汇总属于后续边界，这里只处理
单个 TeamFlow 任务成本和预算值。

## 一、先确定是否需要精确十进制

### 1. BigDecimal 表达十进制值与规则

`double` 使用二进制浮点表示有限范围内的近似值，适合允许误差的测量、图形和科学计算。许多十进制小数无法
用有限二进制位精确表示，因此下面的结果不是数学上直观的 `0.3`：

```java
double total = 0.1 + 0.2;
System.out.println(total);
```

预期输出：

```text
0.30000000000000004
```

`BigDecimal` 保存任意精度的有符号十进制数。使用精确文本构造后，同一计算遵循十进制规则：

```java
BigDecimal total = new BigDecimal("0.1").add(new BigDecimal("0.2"));
System.out.println(total.toPlainString());
```

输出是 `0.3`。这不表示 `BigDecimal` 能自动猜出所有业务规则；它只让十进制值和舍入动作显式可控。若任务
成本必须准确到分，选择结果小数位和舍入方向仍是调用方的责任。

### 2. 精确文本直接交给字符串构造器

页面输入、配置或协议已经给出十进制文本时，直接使用 `BigDecimal(String)`：

```java
BigDecimal plannedHours = new BigDecimal("12.5");
BigDecimal hourlyRate = new BigDecimal("80.00");
BigDecimal plannedCost = plannedHours.multiply(hourlyRate);

System.out.println(plannedCost.toPlainString());
```

输出为 `1000.000`。乘法先得到精确结果，结果 scale 是两个操作数 scale 的和：`12.5` 的 scale 为 1，
`80.00` 的 scale 为 2，因此结果保留 3 位小数。数值正确不等于展示格式已经满足“金额两位小数”的合同，
后面还要明确使用 `setScale`。

字符串必须只包含构造器允许的数字形式。把货币符号、分组逗号或中文单位一起传入不会自动清洗：

```java
BigDecimal amount = new BigDecimal("19.90");
// BigDecimal invalid = new BigDecimal("¥19.90");
```

第一行得到精确值；第二行会抛出 `NumberFormatException`。本课只确认输入应先满足十进制文本合同，如何捕获和
恢复异常留到“异常处理”。

### 3. double 构造器与 valueOf 保留的是不同表示

如果先写出 `0.1`，这个字面量已经是 `double`。`new BigDecimal(0.1)` 会精确保存该二进制浮点值对应的十进制
展开，而不是重新猜成数学文本 `0.1`：

```java
BigDecimal fromDoubleConstructor = new BigDecimal(0.1);
BigDecimal fromValueOf = BigDecimal.valueOf(0.1);
BigDecimal fromText = new BigDecimal("0.1");

System.out.println(fromDoubleConstructor.toPlainString());
System.out.println(fromValueOf.toPlainString());
System.out.println(fromText.toPlainString());
```

输出：

```text
0.1000000000000000055511151231257827021181583404541015625
0.1
0.1
```

`valueOf(double)` 先使用该 `double` 的标准文本表示再构造，所以结果通常更符合人看到的文本；它仍然不能恢复
这个值在进入 `double` 之前已经丢失的信息。精确输入能以字符串或整数最小单位进入程序时，不要先绕经
`double`。已有系统只能交付 `double` 时，则必须明确是在转换那个近似值，而不是获得原始精确小数。

## 二、读懂值、scale 与不可变性

### 1. 值由 unscaled value 和 scale 共同决定

可以把 `BigDecimal` 的值理解为：

```text
unscaled value × 10 的负 scale 次方
```

例如 `123.45` 的 unscaled value 是 `12345`，scale 是 `2`：

```java
BigDecimal amount = new BigDecimal("123.45");

System.out.println(amount.unscaledValue());
System.out.println(amount.scale());
System.out.println(amount.precision());
```

输出：

```text
12345
2
5
```

`scale()` 为 2，表示小数点右侧有两位；`precision()` 为 5，表示 unscaled value 中有五个数字。precision
不是“小数位数”，也不是 Java 能保存的固定上限。`BigDecimal` 会按需要扩大用于保存数字的整数表示，实际
可用范围仍受内存约束。

同一个数值可以有不同表示：

```java
BigDecimal first = new BigDecimal("5.5");
BigDecimal second = new BigDecimal("5.50");

System.out.println(first.scale());
System.out.println(second.scale());
```

输出分别为 `1` 和 `2`。两个对象表示相同数值大小，但第二个值还携带“两位小数”的表示信息。

### 2. 算术方法返回新对象

`BigDecimal` 不可变。`add`、`subtract`、`multiply`、`divide` 和 `setScale` 都不会改写接收者，而是返回结果：

```java
BigDecimal total = new BigDecimal("100.00");
BigDecimal increment = new BigDecimal("25.50");

BigDecimal updated = total.add(increment);

System.out.println(total.toPlainString());
System.out.println(updated.toPlainString());
```

输出：

```text
100.00
125.50
```

原对象仍是 `100.00`。如果业务变量代表不断累积的总额，就必须把返回值重新赋给变量：

```java
BigDecimal total = BigDecimal.ZERO;
total = total.add(new BigDecimal("100.00"));
total = total.add(new BigDecimal("25.50"));
```

这里变化的是变量 `total` 指向哪个不可变对象，不是某个 `BigDecimal` 对象在内部被修改。

### 3. 加减乘法先产生精确结果

没有传入 `MathContext` 时，加法、减法和乘法会按官方定义的首选 scale 返回精确结果：

```java
BigDecimal budget = new BigDecimal("1500.00");
BigDecimal designCost = new BigDecimal("1000.000");
BigDecimal reviewCost = new BigDecimal("390.0000");

BigDecimal plannedCost = designCost.add(reviewCost);
BigDecimal remaining = budget.subtract(plannedCost);

System.out.println(plannedCost.toPlainString());
System.out.println(remaining.toPlainString());
```

输出：

```text
1390.0000
110.0000
```

加减法结果使用两个操作数中较大的 scale，所以较多的尾随零会继续保留。业务最终要求金额两位小数时，应在
明确边界进行一次规范化，而不是看到尾随零就改用 `double`。

## 三、把舍入写成业务合同

### 1. setScale 决定结果的小数位

`setScale(2, RoundingMode.HALF_UP)` 表示结果保留两位小数；若需要丢弃数字，则选择最接近的结果，正好位于
中点时向远离零的方向舍入：

```java
BigDecimal rawCost = new BigDecimal("1275.455");
BigDecimal money = rawCost.setScale(2, RoundingMode.HALF_UP);

System.out.println(rawCost.toPlainString());
System.out.println(money.toPlainString());
```

输出：

```text
1275.455
1275.46
```

原值仍有三位小数，返回值才是两位小数。`setScale` 名称虽然以 `set` 开头，也不修改原对象。

若只增加 scale，不需要丢弃非零数字，可以不提供舍入模式：

```java
BigDecimal normalized = new BigDecimal("19.9").setScale(2);
System.out.println(normalized.toPlainString());
```

输出 `19.90`。但把 `19.999` 缩到两位必然丢失数字，无舍入模式的重载会抛出 `ArithmeticException`。只要业务
可能缩减小数位，就应显式传入已经确认的 `RoundingMode`。

### 2. RoundingMode 不能靠名字猜测

舍入方向对负数尤其容易被误解。下面固定保留整数位：

```java
BigDecimal value = new BigDecimal("-1.1");

System.out.println(value.setScale(0, RoundingMode.UP));
System.out.println(value.setScale(0, RoundingMode.DOWN));
System.out.println(value.setScale(0, RoundingMode.CEILING));
System.out.println(value.setScale(0, RoundingMode.FLOOR));
```

输出：

```text
-2
-1
-1
-2
```

`UP` 是远离零，`DOWN` 是靠近零；`CEILING` 朝正无穷，`FLOOR` 朝负无穷。它们不是正数场景中的“向上”和
“向下”四种别名。`HALF_UP` 与 `HALF_EVEN` 都先找最近邻居，但中点规则不同。选择哪一个必须来自具体业务
合同，不能因为名称熟悉就全项目统一猜一个。

`RoundingMode.UNNECESSARY` 表示调用方断言不需要舍入。若实际需要丢弃非零数字，它会以
`ArithmeticException` 暴露合同不成立，适合验证“输入最多两位小数”这类已经明确的边界，不适合代替真正的
舍入策略。

### 3. 非终止除法必须给出结束规则

十进制中的 `1 / 4` 可以有限写成 `0.25`，`1 / 3` 却需要无限重复。无参数舍入策略的 `divide` 要求精确结果：

```java
BigDecimal exact = BigDecimal.ONE.divide(new BigDecimal("4"));
System.out.println(exact.toPlainString());

// BigDecimal repeating = BigDecimal.ONE.divide(new BigDecimal("3"));
```

第一行输出 `0.25`。被注释的除法会抛出 `ArithmeticException`，因为不存在有限的精确十进制结果。正确做法
不是随便捕获并忽略错误，而是先确定结果需要几位小数和怎样舍入：

```java
BigDecimal third = BigDecimal.ONE.divide(
    new BigDecimal("3"),
    2,
    RoundingMode.HALF_UP
);

System.out.println(third.toPlainString());
```

输出 `0.33`。这里的 `2` 是结果 scale，不是“最多试两次”或 precision。

除数为零也会抛出 `ArithmeticException`。它与非终止小数是不同触发条件；本课通过调用前的业务约束避免零
除数，后续异常课再处理失败恢复。

### 4. MathContext 管理有效数字总数

`MathContext` 由 precision 和舍入模式组成。precision 从精确结果最左侧的非零数字开始计算有效数字总数：

```java
BigDecimal value = new BigDecimal("123.45");
MathContext context = new MathContext(3, RoundingMode.HALF_UP);

System.out.println(value.round(context));
System.out.println(value.setScale(3, RoundingMode.HALF_UP));
```

输出：

```text
123
123.450
```

第一行保留三个有效数字，第二行保留三位小数。金额展示通常更直接地使用 scale；需要限制一次计算的有效数字
时才使用 `MathContext`。不要把 `MathContext(2)` 解释成“保留两位小数”。

## 四、比较数值与表示形式

### 1. compareTo 判断数值先后

`compareTo` 忽略表示中的尾随零，返回负数、0 或正数：

```java
BigDecimal first = new BigDecimal("5.5");
BigDecimal second = new BigDecimal("5.50");

System.out.println(first.compareTo(second));
System.out.println(first.compareTo(second) == 0);
```

输出为 `0` 和 `true`。判断预算是否超出时，只关心数值大小：

```java
boolean overBudget = actualCost.compareTo(plannedCost) > 0;
```

这与前一课的 `Comparable` 合同一致，不能依赖返回值恰好是 `-1` 或 `1`。

### 2. equals 同时比较数值和 scale

`equals` 要求数值与 scale 都相等：

```java
BigDecimal first = new BigDecimal("5.5");
BigDecimal second = new BigDecimal("5.50");

System.out.println(first.equals(second));
System.out.println(first.compareTo(second) == 0);
```

输出：

```text
false
true
```

这不是 `equals` 出错，而是两个方法回答不同问题。`equals` 适合把表示形式也纳入对象合同的场景，并与
`hashCode` 保持一致；`compareTo` 适合只判断十进制数值大小。若 `BigDecimal` 作为 `HashSet` 元素或 `HashMap`
键，`5.5` 和 `5.50` 会成为两个不同键。业务若要求统一表示，应在进入集合前先按同一 scale 规范化。

判断数值是否为零也应使用数值比较：

```java
BigDecimal divisor = new BigDecimal("0.00");
boolean isZero = divisor.compareTo(BigDecimal.ZERO) == 0;
```

`divisor.equals(BigDecimal.ZERO)` 为 `false`，因为两者 scale 不同；拿它做除零检查会漏掉 `0.00`。

### 3. toPlainString 保持普通十进制文本

`toString()` 允许使用科学记数法，`toPlainString()` 则返回不带指数部分的普通十进制文本：

```java
BigDecimal value = new BigDecimal("1000.00").stripTrailingZeros();

System.out.println(value.toString());
System.out.println(value.toPlainString());
System.out.println(value.scale());
```

输出：

```text
1E+3
1000
-3
```

`stripTrailingZeros()` 返回数值相等的新对象，但它可能得到负 scale。不要把“去掉尾随零”当成固定金额格式化
工具；对外需要 `1000.00` 时，使用明确的两位 scale 和 `toPlainString()`。本课只生成程序文本，地区化的货币
符号与分组格式属于文本格式化边界。

## 五、两条版本线采用相同计算合同

### 1. 本课核心 API 在 Java 8 已经可用

本课使用的字符串构造、`valueOf`、四则运算、`setScale`、`RoundingMode`、`MathContext`、`compareTo`、
`equals` 和 `toPlainString` 在 Java 8 与 JDK 25 中都可用。因此后文给出一份通用完整源码，并分别说明两个
Project SDK 下的创建和运行步骤。

JDK 25 中 `BigDecimal.ROUND_HALF_UP` 这类整数常量已经弃用；Java 8 文档也把这种形式称为过时用法，并已经
提供 `RoundingMode.HALF_UP` 枚举。本课两条版本线都使用枚举，不为了制造差异保留旧整数常量。

### 2. API 一致不等于舍入规则可以省略

切换 JDK 不会替业务决定金额 scale 或舍入模式。同一份输入和同一份明确合同应在两个版本得到相同结果；若
结果不同，先核对是否有一条版本线经过 `double`、是否漏接不可变返回值，以及每次除法和 scale 缩减是否使用
同一规则，而不是用版本标签解释数据差异。

### 3. 本课不建立完整货币模型

`BigDecimal` 只表示数值，不携带人民币、美元等币种，也不知道某项业务应保留几位小数。TeamFlow 当前示例
固定使用一套已经给定的两位成本合同。多币种、汇率、税费、法规和跨系统金额合同需要独立设计，不能仅靠
更换一个 Java 数值类型解决。

## 六、六个典型错误

**社区补充：** Stack Overflow 上关于 `double` 构造、非终止除法和 `equals` 的高票问题说明，这三类错误都
来自真实使用场景。下面的触发输入已在 Java 8 与 JDK 25 复现，修正依据仍是对应版本的官方 API 合同。

:::pitfalls
### 用 double 构造器接收精确金额

**触发条件：** 业务原本需要十进制 `0.1`，却先写成 `double`，再调用 `new BigDecimal(0.1)`。

**原因：** 构造器精确保留传入的二进制浮点近似值，不会把它猜回源码中看见的十进制文本。

**后果：** 金额携带大量意外小数位，后续比较、汇总和舍入都从错误输入开始。

**错误示例：**

```java
BigDecimal amount = new BigDecimal(0.1);
System.out.println(amount.toPlainString());
```

**正确写法：**

```java
BigDecimal amount = new BigDecimal("0.1");
System.out.println(amount.toPlainString());
```

**验证方式：** 错误代码输出以 `0.10000000000000000555` 开头的长小数，正确代码逐字输出 `0.1`。

### 忘记接住不可变运算结果

**触发条件：** 调用 `total.add(increment)` 后仍读取 `total`，以为方法已经原地累加。

**原因：** `BigDecimal` 不可变，`add` 返回一个表示结果的对象，接收者保持不变。

**后果：** 程序继续使用旧总额，预算累计看起来没有生效。

**错误示例：**

```java
BigDecimal total = new BigDecimal("100.00");
total.add(new BigDecimal("25.50"));
System.out.println(total.toPlainString());
```

**正确写法：**

```java
BigDecimal total = new BigDecimal("100.00");
total = total.add(new BigDecimal("25.50"));
System.out.println(total.toPlainString());
```

**验证方式：** 错误代码输出 `100.00`，正确代码输出 `125.50`。

### 对非终止小数要求精确除法

**触发条件：** 直接执行 `BigDecimal.ONE.divide(new BigDecimal("3"))`，没有结果 scale 或舍入规则。

**原因：** 三分之一没有有限十进制表示，无参数舍入策略的重载只接受精确结果。

**后果：** 程序抛出 `ArithmeticException` 并在未处理时停止，预算比例无法生成。

**错误示例：**

```java
BigDecimal result = BigDecimal.ONE.divide(new BigDecimal("3"));
```

**正确写法：**

```java
BigDecimal result = BigDecimal.ONE.divide(
    new BigDecimal("3"),
    2,
    RoundingMode.HALF_UP
);
System.out.println(result.toPlainString());
```

**验证方式：** 错误代码稳定抛出非终止十进制相关的 `ArithmeticException`，正确代码输出 `0.33`。

### 缩减小数位却没有舍入模式

**触发条件：** 对 `19.999` 调用 `setScale(2)`，认为该方法会自动四舍五入。

**原因：** 缩减 scale 需要丢弃非零数字；没有舍入模式的重载要求结果必须精确。

**后果：** 程序抛出 `ArithmeticException`，或者开发者临时改用不一致的舍入规则。

**错误示例：**

```java
BigDecimal amount = new BigDecimal("19.999").setScale(2);
```

**正确写法：**

```java
BigDecimal amount = new BigDecimal("19.999")
    .setScale(2, RoundingMode.HALF_UP);
System.out.println(amount.toPlainString());
```

**验证方式：** 错误代码抛出需要舍入相关的 `ArithmeticException`，正确代码输出 `20.00`。

### 把 precision 当成小数位数

**触发条件：** 为了保留两位小数，对 `123.45` 使用 `new MathContext(2, RoundingMode.HALF_UP)`。

**原因：** MathContext precision 限制全部有效数字，而 scale 才描述小数点右侧位数。

**后果：** `123.45` 被舍入为 `1.2E+2`，数值变成 120，而不是预期的两位小数金额。

**错误示例：**

```java
BigDecimal amount = new BigDecimal("123.45")
    .round(new MathContext(2, RoundingMode.HALF_UP));
System.out.println(amount);
```

**正确写法：**

```java
BigDecimal amount = new BigDecimal("123.45")
    .setScale(2, RoundingMode.HALF_UP);
System.out.println(amount.toPlainString());
```

**验证方式：** 错误代码输出 `1.2E+2`，正确代码输出 `123.45`。

### 用 equals 判断数值相等或数值为零

**触发条件：** 用 `equals` 比较 `5.5` 与 `5.50`，或用 `value.equals(BigDecimal.ZERO)` 检查 `0.00`。

**原因：** `equals` 同时比较数值和 scale；`compareTo` 才按数值大小比较并忽略尾随零表示差异。

**后果：** 相同数值被当成不同值，`0.00` 还可能漏过除零检查并在后续除法中失败。

**错误示例：**

```java
BigDecimal divisor = new BigDecimal("0.00");
boolean isZero = divisor.equals(BigDecimal.ZERO);
System.out.println(isZero);
```

**正确写法：**

```java
BigDecimal divisor = new BigDecimal("0.00");
boolean isZero = divisor.compareTo(BigDecimal.ZERO) == 0;
System.out.println(isZero);
```

**验证方式：** 错误代码输出 `false`，正确代码输出 `true`；两个版本的结果相同。
:::

## 七、完整的 TeamFlow 预算程序

### 1. 程序要解决的问题

TeamFlow 需要根据两个任务的计划工时和小时成本计算计划总成本，把实际成本统一为两位小数，再计算剩余预算、
使用率和是否超支。输入全部来自精确文本；金额使用两位 scale，百分比使用一位 scale，舍入统一写在对应业务
边界中。

### 2. JDK 25 与 Java 8 通用完整程序

在 JDK 25 或 Java 8 项目中新建 `TeamFlowBudgetDemo.java`，填入完整代码：

```java
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * 演示 TeamFlow 任务成本与预算的精确十进制计算。
 */
public class TeamFlowBudgetDemo {
    private static final int MONEY_SCALE = 2;
    private static final int RATE_SCALE = 1;

    /**
     * 计算并输出计划成本、实际成本与预算状态。
     *
     * @param args 启动参数，本程序不使用
     */
    public static void main(String[] args) {
        BigDecimal designCost = calculateTaskCost(
                new BigDecimal("12.5"),
                new BigDecimal("80.00"));
        BigDecimal reviewCost = calculateTaskCost(
                new BigDecimal("3.25"),
                new BigDecimal("120.00"));

        BigDecimal plannedCost = designCost.add(reviewCost);
        BigDecimal actualCost = toMoney(new BigDecimal("1275.455"));
        BigDecimal remainingBudget = plannedCost.subtract(actualCost);
        BigDecimal usageRate = calculatePercentage(actualCost, plannedCost);
        boolean overBudget = actualCost.compareTo(plannedCost) > 0;

        System.out.println("设计任务成本：" + designCost.toPlainString());
        System.out.println("评审任务成本：" + reviewCost.toPlainString());
        System.out.println("计划总成本：" + plannedCost.toPlainString());
        System.out.println("实际成本：" + actualCost.toPlainString());
        System.out.println("剩余预算：" + remainingBudget.toPlainString());
        System.out.println("预算使用率：" + usageRate.toPlainString() + "%");
        System.out.println("是否超出预算：" + overBudget);
    }

    /**
     * 根据计划工时和小时成本计算两位小数的任务成本。
     *
     * @param plannedHours 计划工时
     * @param hourlyRate 小时成本
     * @return 两位小数的任务成本
     */
    private static BigDecimal calculateTaskCost(
            BigDecimal plannedHours,
            BigDecimal hourlyRate) {
        return toMoney(plannedHours.multiply(hourlyRate));
    }

    /**
     * 把十进制值规范成两位小数的成本金额。
     *
     * @param value 原始十进制值
     * @return 使用 HALF_UP 舍入的两位小数结果
     */
    private static BigDecimal toMoney(BigDecimal value) {
        return value.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
    }

    /**
     * 计算部分占总数的百分比并保留一位小数。
     *
     * @param part 部分数值
     * @param total 总数，必须大于零
     * @return 一位小数的百分比数值
     */
    private static BigDecimal calculatePercentage(BigDecimal part, BigDecimal total) {
        return part.multiply(new BigDecimal("100"))
                .divide(total, RATE_SCALE, RoundingMode.HALF_UP);
    }
}
```

### 3. 两个版本的 IDEA 配置与运行步骤

JDK 25：

1. 打开 JDK 25 普通 Java 项目，在 **File -> Project Structure -> Project** 中确认 Project SDK 为 25。
2. 在 `src` 中创建 `TeamFlowBudgetDemo` 类，粘贴 JDK 25 完整代码。
3. 点击 `main` 左侧运行图标，选择 **Run 'TeamFlowBudgetDemo.main()'**。
4. 在 Run 控制台核对七行输出，并确认实际成本从 `1275.455` 舍入为 `1275.46`。

Java 8：

1. 打开独立 Java 8 普通 Java 项目，在 Project Structure 中确认 Project SDK 与 Language level 都是 8。
2. 在 `src` 中创建 `TeamFlowBudgetDemo` 类，粘贴上面的通用完整代码，不要引用另一个项目的 class 输出目录。
3. 点击 `main` 左侧运行图标，运行 `TeamFlowBudgetDemo.main()`。
4. 在 Run 控制台核对同样七行输出；若 IDEA 使用的 JDK 与预期不同，回到 Project SDK 和模块 SDK 逐项确认。

### 4. 预期控制台输出

两个版本都应逐字输出：

```text
设计任务成本：1000.00
评审任务成本：390.00
计划总成本：1390.00
实际成本：1275.46
剩余预算：114.54
预算使用率：91.8%
是否超出预算：false
```

### 5. 从输出还原计算过程

设计任务先精确计算 `12.5 × 80.00`，再由 `toMoney` 规范成 `1000.00`；评审任务同样得到 `390.00`。两项
金额使用相同 scale，相加得到 `1390.00`。实际成本的第三位小数为 5，`HALF_UP` 将两位结果舍入为
`1275.46`，因此剩余预算是 `114.54`。

百分比先计算 `1275.46 × 100`，再以一位 scale 除以 `1390.00`，得到 `91.8`。最后 `compareTo` 返回负数，
所以“是否超出预算”为 `false`。每个中间对象都保持不变，变量只接收下一步返回的新结果。

## 八、独立练习

### 1. 计算含预留成本的项目预算

:::exercise
### 项目预算预留

**要求：** 开发任务计划 18.75 小时、小时成本 96.00；测试任务计划 6.4 小时、小时成本 88.50。分别把
任务成本规范成两位小数并求基础成本，再按基础成本的 7.5% 计算两位小数预留成本。输出含预留的计划成本、
2600.00 预算下的剩余金额和一位小数使用率。所有输入使用字符串构造；运算结果必须接回变量；金额采用
`HALF_UP` 两位小数，百分比采用 `HALF_UP` 一位小数；不得经过 `double`。

**验收：**

```text
开发任务成本：1800.00
测试任务成本：566.40
基础成本：2366.40
预留成本：177.48
含预留计划成本：2543.88
剩余预算：56.12
预算使用率：97.8%
```
:::

### 2. JDK 25 与 Java 8 通用参考实现

```java
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * 计算 TeamFlow 项目的任务成本与预算预留。
 */
public class TeamFlowBudgetExercise {
    private static final int MONEY_SCALE = 2;
    private static final int RATE_SCALE = 1;

    /**
     * 计算并输出含预留成本的项目预算。
     *
     * @param args 启动参数，本程序不使用
     */
    public static void main(String[] args) {
        BigDecimal developmentCost = calculateTaskCost(
                new BigDecimal("18.75"),
                new BigDecimal("96.00"));
        BigDecimal testingCost = calculateTaskCost(
                new BigDecimal("6.4"),
                new BigDecimal("88.50"));

        BigDecimal baseCost = developmentCost.add(testingCost);
        BigDecimal reserveCost = toMoney(
                baseCost.multiply(new BigDecimal("0.075")));
        BigDecimal plannedCost = baseCost.add(reserveCost);
        BigDecimal budget = new BigDecimal("2600.00");
        BigDecimal remainingBudget = budget.subtract(plannedCost);
        BigDecimal usageRate = calculatePercentage(plannedCost, budget);

        System.out.println("开发任务成本：" + developmentCost.toPlainString());
        System.out.println("测试任务成本：" + testingCost.toPlainString());
        System.out.println("基础成本：" + baseCost.toPlainString());
        System.out.println("预留成本：" + reserveCost.toPlainString());
        System.out.println("含预留计划成本：" + plannedCost.toPlainString());
        System.out.println("剩余预算：" + remainingBudget.toPlainString());
        System.out.println("预算使用率：" + usageRate.toPlainString() + "%");
    }

    /**
     * 根据工时和小时成本计算两位小数的任务成本。
     *
     * @param hours 计划工时
     * @param hourlyRate 小时成本
     * @return 两位小数的任务成本
     */
    private static BigDecimal calculateTaskCost(BigDecimal hours, BigDecimal hourlyRate) {
        return toMoney(hours.multiply(hourlyRate));
    }

    /**
     * 把数值规范为两位小数的金额。
     *
     * @param value 原始数值
     * @return 两位小数金额
     */
    private static BigDecimal toMoney(BigDecimal value) {
        return value.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
    }

    /**
     * 计算一位小数的百分比。
     *
     * @param part 部分数值
     * @param total 总数，必须大于零
     * @return 一位小数的百分比数值
     */
    private static BigDecimal calculatePercentage(BigDecimal part, BigDecimal total) {
        return part.multiply(new BigDecimal("100"))
                .divide(total, RATE_SCALE, RoundingMode.HALF_UP);
    }
}
```

### 3. 两个版本的运行与验收

JDK 25 项目选择 Project SDK 25，Java 8 项目选择 Project SDK 8 和 Language level 8；分别创建
`TeamFlowBudgetExercise.java`，运行各自的 `main`。两个版本都应逐字得到 exercise 中的七行验收输出。

执行顺序是：先把两个乘法结果规范为两位金额，得到 `1800.00` 与 `566.40`；相加得到 `2366.40`；再以精确
小数 `0.075` 计算预留并舍入为 `177.48`。计划成本为 `2543.88`，从预算中相减得到 `56.12`，最后用显式
scale 和舍入模式计算出 `97.8%`。

## 九、把精确数值放回 TeamFlow

### 1. 本课为项目增加的数值合同

TeamFlow 现在可以用字符串构造精确的工时、小时成本和预算输入，用不可变运算获得任务成本，并在金额与百分比
边界分别决定 scale 和舍入模式。后续项目进度报告可以复用这些已经明确的计算函数，但会自行负责汇总布局，
不会回头重新定义 BigDecimal 的数值合同。

### 2. 自我检查

完成本课后，应能独立回答并验证：为什么精确文本不应先变成 `double`；一次 `add` 为什么不会修改原对象；
`1 / 3` 为什么需要结束规则；scale 与 precision 分别限制什么；`5.5` 与 `5.50` 在 `equals` 和 `compareTo`
下为什么得到不同答案；以及 JDK 25 与 Java 8 为什么可以运行同一份本课代码。
