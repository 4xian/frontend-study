# 变量与赋值研究记录

## 研究目标与边界

本文为“变量与赋值”课程提供事实依据和教学拆解，主线版本为 JDK 25，并在确有差异的位置补充
Java 8。研究范围只包括：

- 局部变量的声明、初始化和重新赋值；
- 局部变量的确定赋值；
- 简单赋值表达式的结果、结合方向和求值步骤；
- 基本类型变量之间赋值时最小必要的赋值转换规则；
- 引用变量赋值不会复制对象这一常见误区；
- `var` 的能力、限制和 Java 8 差异。

本文不展开基本类型的取值范围、完整运算符体系、强制类型转换、字段、作用域、对象模型、数组、
方法设计等后续课程。为纠正“引用赋值会复制对象”的误区，文中会使用一个最小引用示例，但不把
它扩展成面向对象教学。

核验日期：2026-08-16。

## 调研方法与来源层级

1. 首选 Tavily 搜索候选资料，但本次请求因套餐用量上限失败。
2. 按仓库搜索顺序切换到 Exa，查找 JLS、OpenJDK、dev.java 和少量社区页面。
3. 所有关键语言规则重新回到 JLS 25、JLS 8、OpenJDK JEP 286 和 dev.java 原文核验。
4. OpenJDK 的 `var` 风格指南和 FAQ 属于 Java 团队一手设计资料，可用于解释设计意图和可读性
   取舍，但语言是否合法仍以 JLS 为准。
5. Baeldung 和 Stack Overflow 只用于识别初学者经常混淆的问题，不能证明语言规则。

## 官方结论总表

| 结论 | 官方直接来源 | 课程落点 |
| --- | --- | --- |
| 局部变量声明会声明并可选择初始化变量；初始化器在声明执行时求值并把值赋给变量 | [JLS 25 §14.4、§14.4.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.4) | 对照“只声明”“声明并初始化”“声明后赋值” |
| 局部变量没有可供读取的默认值，读取前必须以编译器能证明的方式显式获得值 | [JLS 25 §4.12.5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.12.5)、[§16](https://docs.oracle.com/javase/specs/jls/se25/html/jls-16.html) | 把确定赋值作为本课重点，而不是一句提醒 |
| 确定赋值按语句和表达式结构分析，通常不根据普通变量的运行时值推理 | [JLS 25 §16，Example 16-1、16-2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-16.html) | 对照单分支、两个互补 `if` 与完整 `if/else` |
| `=` 的左侧必须是变量；赋值表达式的结果是赋值后的值，不是变量本身 | [JLS 25 §15.26](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.26) | 解释为什么链式赋值能工作 |
| 赋值运算符从右向左结合，因此 `a = b = 10` 等价于 `a = (b = 10)` | [JLS 25 §15.26](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.26) | 用一组可观察输出说明，不鼓励滥用链式写法 |
| 简单赋值先确定左侧变量，再求右侧；右侧成功后进行赋值转换并存入左侧变量 | [JLS 25 §15.26.1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.26.1) | 区分“结合方向”和“运行时求值步骤” |
| Java 表达式遵守规定的求值顺序；包含多个副作用的表达式虽然可预测，但可读性差 | [JLS 25 §15.7、§15.7.1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.7) | 设置“能够读懂，但不要模仿”的警示示例 |
| 赋值上下文允许同类型、基本类型宽化等转换；可表示的整型常量另有窄化特例 | [JLS 25 §5.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.2) | 对照 `byte level = 100` 与 `byte level = score` |
| 基本类型变量保存基本类型值；引用类型变量保存引用值或 `null` | [JLS 25 §4.12.1、§4.12.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.12.1) | 解释值复制与引用值复制，不提前展开对象模型 |
| `var` 从初始化器推断一个固定的静态类型，不会让 Java 变成动态类型 | [JLS 25 §14.4.1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.4.1)、[OpenJDK LVTI FAQ](https://openjdk.org/projects/amber/guides/lvti-faq) | 用重新赋值成功/失败证明类型已固定 |
| `var` 只覆盖受支持的局部声明，必须有可独立确定类型的初始化器，并有多项明确禁用形式 | [JLS 25 §14.4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.4)、[JEP 286](https://openjdk.org/jeps/286)、[dev.java](https://dev.java/learn/language-basics/using-var/) | 至少列出无初始化器、`null`、多变量、数组初始化器等错误 |
| Java 8 没有局部变量类型推断的 `var`；该能力在 Java 10 交付 | [JLS 8 §14.4](https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html#jls-14.4)、[JEP 286](https://openjdk.org/jeps/286) | 只在 `var` 小节就地给出显式类型替代写法 |

## 一、声明、初始化与重新赋值

### 官方结论

`int score;` 只声明一个名为 `score`、静态类型为 `int` 的局部变量。`int score = 60;` 在声明
时执行初始化器并把结果赋给变量。`score = 80;` 是声明后的简单赋值，改变变量保存的值，不改变
变量的类型。[JLS 25 §14.4、§14.4.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.4)
规定声明器按从左到右处理，有初始化器时先求值再赋给对应变量。

课程必须明确区分三个动作：

```java
int score;       // 声明：确定名称和静态类型
score = 60;      // 首次赋值：变量从这里开始有可读取的值
score = 80;      // 重新赋值：替换原来保存的值，类型仍是 int
```

初始化不是一种与赋值完全无关的“特殊存值机制”。局部变量初始化器同样会求值，并把结果赋给
刚声明的变量。教学上仍应保留“初始化”这个词，因为它表达的是变量第一次在声明处获得值。

### 应讲清的深度

- 变量的类型在编译期确定，普通局部变量能换值但不能换类型。
- 只声明不初始化在语法上合法；真正的限制是读取之前必须满足确定赋值。
- 不应把“变量已经声明”说成“变量已经有值”。
- 多变量声明虽然合法，例如 `int first = 1, second = first + 1;`，但一课一个重点时宜优先使用
  一行一个变量，让类型、名称和初始化器一眼对应。

### 易错示例

```java
int score = 60;
score = 80;       // 正确：仍然赋 int 值
// score = "80"; // 编译错误：String 不能赋给 int 变量
```

错误的核心不是“变量不允许变化”，而是“变化后的值仍必须与变量已确定的类型兼容”。

## 二、确定赋值

### 官方结论

[JLS 25 §16](https://docs.oracle.com/javase/specs/jls/se25/html/jls-16.html) 要求每次读取局部变量
的值之前，该变量必须确定已赋值。这里的“确定”是编译器按规范化控制流分析证明：到达读取点的
每条可能执行路径上都已经发生赋值。它不是对程序运行结果的猜测，也不是“开发者知道这个条件
一定成立”就足够。

局部变量没有字段那样的默认值。`int score;` 后直接读取会在编译期失败，而不是运行时随机得到
`0`。[JLS 25 §4.12.5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.12.5)
明确要求局部变量在使用前通过初始化或赋值显式获得值。

### 三层示例

第一层，完全没有赋值：

```java
int score;
System.out.println(score); // 编译错误：score 可能尚未初始化
```

第二层，只在一条路径赋值：

```java
boolean passed = true;
int score;

if (passed) {
    score = 60;
}

System.out.println(score); // 编译错误：规范仍存在 passed 为 false 的路径
```

第三层，每条路径都赋值：

```java
boolean passed = true;
int score;

if (passed) {
    score = 60;
} else {
    score = 0;
}

System.out.println(score); // 正确
```

### 更深一层：两个互补判断不等于一个完整分支

[JLS 25 §16，Example 16-2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-16.html) 明确说明，
确定赋值通常不依据普通表达式的具体值进行推理。因此下面的代码即使人能看出两个条件互补，
编译器也不会据此认定 `score` 确定已赋值：

```java
boolean passed = true;
int score;

if (passed) {
    score = 60;
}
if (!passed) {
    score = 0;
}

System.out.println(score); // 编译错误
```

课程不能把解决方法简化成“先随便写 `int score = 0` 消除报错”。如果 `0` 没有业务含义，这会
掩盖遗漏路径。更好的教学顺序是先让分支结构完整；只有 `0` 本身就是合理初始状态时，才在声明处
初始化为 `0`。

## 三、简单赋值表达式

### 官方结论

`=` 不只是语句中的分隔符，它构成一个有结果的表达式。[JLS 25 §15.26](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.26)
规定：

- 左侧必须产生一个变量；`10 = score` 因左侧不是变量而编译失败。
- 赋值表达式的类型是被赋值变量的类型。
- 赋值表达式的运行时结果是赋值完成后变量中的值；这个结果本身不是变量。
- 赋值运算符从右向左结合。

因此：

```java
int first;
int second;

first = second = 10;
```

等价于：

```java
second = 10;
first = second;
```

更精确地说，`first = second = 10` 按语法分组为 `first = (second = 10)`。内层赋值完成后产生
值 `10`，该值再赋给 `first`。

### 结合方向不等于“所有东西都从右向左执行”

赋值运算符右结合描述的是表达式如何分组，不应被教成“Java 赋值总是从右向左执行”。
[JLS 25 §15.26.1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.26.1)
给出简单赋值的运行时步骤：先确定左侧变量，再求右侧；右侧正常完成后，把值转换为左侧类型并
存入变量。对于普通局部变量名，确定左侧几乎没有可观察副作用，所以初学者常看到的是“先算右边
的值，再存到左边”。课程可先使用这句直观描述，再补充准确步骤。

### 不鼓励把副作用塞进计算

[JLS 25 §15.7、§15.7.1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.7)
保证表达式的求值顺序，并给出以下同类示例：

```java
int quantity = 2;
int total = (quantity = 3) * quantity;

System.out.println(total); // 9
```

这段代码有确定结果，但不适合日常业务代码。课程应把它标成“用来理解规则，不要模仿”，并给出
清晰版本：

```java
int quantity = 2;
quantity = 3;
int total = quantity * quantity;
```

官方规范同样指出，代码通常在每个表达式中最多保留一个、且位于最外层的副作用时更清晰。

## 四、基本类型变量之间的赋值

### 官方结论

[JLS 25 §5.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.2) 定义赋值上下文
允许的转换。本课只需要建立三条能力：

1. 相同类型可以直接赋值。
2. 较窄基本数值类型可按规范宽化到较宽类型，例如 `int` 赋给 `long`。
3. `byte`、`short`、`char` 或 `int` 的常量表达式在目标是 `byte`、`short`、`char` 且值可表示时，
   存在窄化特例。

```java
int requestCount = 120;
long totalRequestCount = requestCount; // 正确：int 宽化为 long

byte level = 100;                      // 正确：可表示的 int 常量特例
```

初学者最容易误以为“变量当前值只有 100，所以也应自动变成 byte”：

```java
int score = 100;
// byte level = score; // 编译错误：普通 int 变量不是该常量窄化特例
```

这里应讲清：编译器检查的是表达式类型和规范允许的转换，不会因为某个普通变量当前碰巧保存小值，
就为它开放隐式窄化。强制类型转换的写法、截断和溢出风险留到“类型转换”课程。

另一个值得保留的边界是 `char` 与 `short` 不能直接互相赋值；它们并不是彼此的宽化方向。具体范围
仍留给“基本类型”课程。

## 五、基本值复制与引用值复制

### 官方结论

[JLS 25 §4.12.1、§4.12.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.12.1)
区分基本类型变量和引用类型变量：前者保存基本类型值，后者保存引用值或 `null`。简单赋值会把
右侧表达式的值存入左侧变量。因此：

- 基本类型变量之间赋值，复制的是基本类型值；随后改写一个变量不会改变另一个。
- 引用类型变量之间赋值，复制的是引用值；不会自动创建或复制一个新对象。

### 纠正对象复制误区的最小示例

```java
StringBuilder original = new StringBuilder("Java");
StringBuilder alias = original;

alias.append(" 25");

System.out.println(original); // Java 25
System.out.println(alias);    // Java 25
```

这里只需说明 `original` 与 `alias` 保存了指向同一对象的引用值，所以通过任一引用修改该对象，另一
引用再次访问时会看到对象的新状态。不要把 `alias = original` 描述成“复制了一个 StringBuilder
对象”。对象创建、可变对象、不可变对象和深浅复制应在面向对象课程继续讲。

社区中长期高热度的 [Stack Overflow：Is Java pass-by-reference or pass-by-value?](https://stackoverflow.com/questions/40480/is-java-pass-by-reference-or-pass-by-value)
说明“变量保存对象”和“变量保存对象引用”是高频语言误区。该页面只证明这个问题常见；上述语义仍
以 JLS §4.12.2 和 §15.26.1 为依据。

## 六、`var` 的能力与限制

### 官方结论

`var` 在受支持的局部变量声明中代替显式类型，编译器从初始化器推断静态类型。类型一旦推断便
固定，不会随着后续赋值改变。[JLS 25 §14.4.1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.4.1)、
[dev.java](https://dev.java/learn/language-basics/using-var/) 和
[OpenJDK LVTI FAQ](https://openjdk.org/projects/amber/guides/lvti-faq) 都明确支持这一点。

```java
var score = 60; // 推断为 int
score = 80;     // 正确
// score = "80"; // 编译错误：score 的类型不会重新推断
```

`var` 是保留类型名而不是普通关键字。这个术语只需一行说明，不应抢走“类型固定”的教学重点。

### 必须覆盖的限制

[JLS 25 §14.4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.4) 和
[JEP 286](https://openjdk.org/jeps/286) 给出了明确边界：

```java
// var score;                  // 错：没有初始化器
// var result = null;          // 错：null 不能提供可用的推断类型
// var first = 1, second = 2;  // 错：一个 var 声明不能列多个声明器
// var numbers = {1, 2, 3};    // 错：数组初始化器需要目标类型
// var value = value;          // 错：初始化器引用正在声明的变量
```

还应列出但不展开以下限制：

- 不能用 `var` 声明字段、方法或构造器参数、方法返回类型、`catch` 参数。
- 没有目标类型时，lambda 表达式和方法引用不能直接作为 `var` 初始化器。
- `var` 可以出现在 JEP 286 规定的局部变量、传统 `for` 的局部索引、增强 `for` 索引和资源变量
  等位置；循环和资源管理等语法在各自课程再讲。

### 可读性不是“能编译就使用”

[OpenJDK 的局部变量类型推断风格指南](https://openjdk.org/projects/amber/guides/lvti-style-guide)
强调没有一条“永远用”或“永远不用”的规则。适合本课提炼为三个判断：

- 初始化器已经清楚展示类型时，`var` 可减少重复。
- 变量名必须传达意义；`var x = load();` 同时丢失类型和用途信息。
- 变量声明与使用距离越远，省略显式类型越可能增加理解成本。

Baeldung 的 [Guide to var in Java](https://www.baeldung.com/java-10-local-variable-type-inference)
也集中列举了初学者常把 `var` 当动态类型、忽略初始化器限制、在返回类型不明显的方法调用上损害
可读性等问题。它可用于选择反例，但合法性和推断规则必须回到 JLS、JEP 286 核验。

### Java 8 就地差异

Java 8 不支持这里的 `var`。JEP 286 标记该能力在 Java 10 交付，
[JLS 8 §14.4](https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html#jls-14.4) 的局部变量声明
语法也没有该形式。兼容 Java 8 时直接写显式类型：

```java
int score = 60;
```

本课其余声明、初始化、重新赋值、确定赋值、简单赋值结果和基本赋值转换规则，在 Java 8 与 JDK 25
的课程范围内一致，不需要重复插入版本提示。

## 社区教学补充

以下资料只用来识别教学痛点，不作为语言规范：

| 社区现象 | 可转化的课程设计 | 官方回证 |
| --- | --- | --- |
| Stack Overflow 多次出现“局部变量为什么没有默认值”的提问 | 单独放置“局部变量不会自动得到 0”错误对照，并解释这是编译错误而非运行结果 | JLS 25 §4.12.5、§16 |
| Stack Overflow 多次出现“我知道条件一定成立，编译器为什么仍报未初始化”的提问 | 使用单分支、两个互补 `if`、完整 `if/else` 三组递进示例 | JLS 25 §16 Example 16-2 |
| 社区文章常把 `var` 简化成“少写类型” | 同时讲类型固定、禁用形式和可读性判断，不把 `var` 类比为 JavaScript 动态变量 | JLS 25 §14.4.1、JEP 286、OpenJDK LVTI FAQ |
| “把引用赋给另一个变量等于复制对象”是长期高频误区 | 只用一个可变对象展示两个变量引用同一对象，并明确对象复制另课再讲 | JLS 25 §4.12.2、§15.26.1 |

可参考的社区页面：

- [In Java, what exactly constitutes initializing a local variable?](https://stackoverflow.com/questions/23207471/in-java-what-exactly-constitutes-as-initializing-a-local-variable)
- [Why am I required to initialize a primitive local variable?](https://stackoverflow.com/questions/11165485/java-why-am-i-required-to-initialize-a-primitive-local-variable)
- [Guide to var in Java](https://www.baeldung.com/java-10-local-variable-type-inference)

这些页面中的解释可能混入实现猜测或不严谨术语。课程不得引用“局部变量在栈上，所以没有默认值”
之类未经规范支持的因果解释；只使用 JLS 明确规定的可观察语言合同。

## 课程应包含的易错示例清单

一门完整的“变量与赋值”课至少应覆盖以下错误与修复，而不是只放一个笼统警告：

| 错误 | 初学者误解 | 正确修复方向 |
| --- | --- | --- |
| 声明后直接读取 | 以为局部变量自动得到 `0` | 在声明处给出有意义的初值，或在读取前每条路径赋值 |
| 单个 `if` 中赋值后在外部读取 | 只考虑条件为真的路径 | 补全 `else`，或把使用移动到已确定赋值的路径 |
| 两个互补 `if` 后读取 | 以为编译器会证明一般布尔关系 | 使用结构明确的 `if/else` |
| 给已声明变量赋另一种类型 | 以为重新赋值会改变变量类型 | 赋与固定类型兼容的值 |
| `int` 变量直接赋给 `byte` | 以为运行时小值会自动窄化 | 在类型转换课选择正确目标类型或明确转换风险 |
| `var score;` | 以为类型可以从未来赋值推断 | 声明时提供初始化器，或写显式类型 |
| `var result = null;` | 以为编译器默认推断为 `Object` | 写出实际需要的引用类型 |
| `var first = 1, second = 2;` | 以为 `var` 与显式类型的多声明完全等价 | 拆成两个声明 |
| `var values = {1, 2};` | 忽略数组初始化器需要目标类型 | 在数组课程写显式数组类型或完整创建表达式 |
| `alias = original` 后期待两个独立对象 | 把引用值复制误认为对象复制 | 明确两个变量引用同一对象；复制对象另课学习 |
| 在计算表达式中嵌入多次赋值 | 只追求少写代码，忽略副作用顺序 | 将赋值拆成独立、可读的语句 |

## 完整示例建议

课程结尾的完整示例应串起本课能力，但不引入后续课程的大量新语法：

```java
public class VariableAssignmentDemo {
    public static void main(String[] args) {
        int initialScore = 60;
        int currentScore = initialScore;

        currentScore = 85;

        boolean passed = currentScore >= 60;
        String result;
        if (passed) {
            result = "通过";
        } else {
            result = "未通过";
        }

        int first;
        int second;
        first = second = 10;

        long archivedScore = currentScore;
        byte level = 5;

        var message = "本次结果：" + result;
        message = message + "，当前分数：" + currentScore;

        System.out.println("初始分数：" + initialScore);
        System.out.println(message);
        System.out.println("链式赋值：" + first + ", " + second);
        System.out.println("归档分数：" + archivedScore);
        System.out.println("等级：" + level);
    }
}
```

说明：示例中的比较和 `if/else` 只服务于确定赋值的可观察路径，不在本课展开控制流或运算符体系。
正文应在代码前解释每个变量承担的业务含义，代码后逐行对应预期输出。

## 练习与完整参考代码建议

练习可要求学习者记录商品库存的首次值、入库后的值和状态文本，并满足：

- 使用显式类型完成一次初始化和一次重新赋值；
- 使用完整 `if/else` 保证状态变量在输出前确定已赋值；
- 使用一次合法的基本类型宽化赋值；
- 使用一次 `var`，并能说出它的实际静态类型；
- 输出每个中间结果。

参考代码不能只给片段，应提供可独立运行的完整类：

```java
public class InventoryPractice {
    public static void main(String[] args) {
        int initialStock = 12;
        int currentStock = initialStock;

        currentStock = 20;

        String stockState;
        if (currentStock > 0) {
            stockState = "有库存";
        } else {
            stockState = "无库存";
        }

        long stockForReport = currentStock;
        var summary = "库存状态：" + stockState;

        System.out.println("初始库存：" + initialStock);
        System.out.println("当前库存：" + currentStock);
        System.out.println("报表库存：" + stockForReport);
        System.out.println(summary);
    }
}
```

验收不只判断“能运行”，还应让学习者解释：

1. `currentStock` 为什么可以重新赋值但不能改成字符串；
2. 删除 `else` 后，`stockState` 为什么不能保证可读取；
3. `stockForReport` 的赋值发生了什么转换；
4. `summary` 被推断成什么类型，为什么 Java 8 需要改成显式类型。

## 课程编写结论

本课不能停留在“变量是什么、怎么声明”两三个段落。合格正文至少形成以下能力闭环：

1. 能区分声明、初始化、首次赋值和重新赋值。
2. 能根据所有可能路径判断局部变量在读取前是否确定已赋值。
3. 能解释简单赋值表达式的结果和链式赋值的右结合，而不把结合方向误说成执行顺序。
4. 能判断同类型、宽化赋值和整型常量窄化特例，并把强制转换风险留给后续课程。
5. 能区分基本值复制与引用值复制，知道引用赋值不等于对象复制。
6. 能使用 `var`，也能识别至少五种非法写法和 Java 8 的显式类型替代方案。
7. 能完成包含确定赋值分支的独立练习，并对照完整参考代码解释每一步。

## 官方来源

- [JLS 25 Chapter 4: Types, Values, and Variables](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html)
- [JLS 25 Chapter 5: Conversions and Contexts](https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html)
- [JLS 25 Chapter 14: Blocks, Statements, and Patterns](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html)
- [JLS 25 Chapter 15: Expressions](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html)
- [JLS 25 Chapter 16: Definite Assignment](https://docs.oracle.com/javase/specs/jls/se25/html/jls-16.html)
- [JLS 8 Chapter 14: Blocks and Statements](https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html)
- [JEP 286: Local-Variable Type Inference](https://openjdk.org/jeps/286)
- [OpenJDK Local Variable Type Inference: Style Guidelines](https://openjdk.org/projects/amber/guides/lvti-style-guide)
- [OpenJDK Local Variable Type Inference: FAQ](https://openjdk.org/projects/amber/guides/lvti-faq)
- [dev.java: Creating Variables and Naming Them](https://dev.java/learn/language-basics/variables/)
- [dev.java: Using the Var Type Identifier](https://dev.java/learn/language-basics/using-var/)
