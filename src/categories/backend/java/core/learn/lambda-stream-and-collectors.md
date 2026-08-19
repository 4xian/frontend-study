---
id: backend.java.learn.intermediate.lambda-stream-and-collectors
type: lesson
title: Lambda
summary: 用函数式接口确定行为合同，编写、传递并调用 Lambda，理解目标类型、变量捕获和方法引用
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 95
prerequisites:
  - backend.java.learn.basics.file-reading-and-writing
objectives:
  - 能解释函数式接口、唯一抽象方法和 Lambda 目标类型之间的关系。
  - 能根据参数和返回值合同编写表达式体或块体 Lambda。
  - 能使用 Predicate、Function、Consumer 和 Supplier 表达常见行为。
  - 能把 Lambda 作为变量和参数传递，并通过函数式接口方法触发执行。
  - 能判断局部变量是否满足 effectively final，并解释变量捕获的边界。
  - 能把只委托一次调用的 Lambda 改写为签名匹配的方法引用。
recap:
  - Lambda 本身没有脱离上下文的独立类型，赋值、传参或强制转换处的函数式接口提供目标类型。
  - 创建 Lambda 只得到函数式接口实例，调用它的唯一抽象方法时才执行 Lambda 体。
  - Predicate、Function、Consumer 和 Supplier 分别表达判断、转换、消费和提供结果。
  - Lambda 捕获的局部变量必须是 final 或 effectively final，捕获后不能重新赋值。
  - 方法引用只是特定 Lambda 的简写，仍要由目标类型决定参数和返回合同。
  - JDK 25 与 Java 8 都支持本课核心写法，JDK 25 额外支持未命名 Lambda 参数。
related: []
tags:
  - Java
  - Lambda
  - 函数式接口
  - 方法引用
  - 变量捕获
appliesTo: JDK 25 主线；Java 8 兼容说明
verifiedAt: 2026-08-18
sources:
  - id: jls25-functional-interfaces
    title: Java Language Specification 25 - Functional Interfaces
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.8
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 函数式接口的唯一抽象方法合同以及 Lambda 可以创建其实例
  - id: jls25-lambda-expressions
    title: Java Language Specification 25 - Lambda Expressions
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.27
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - Lambda 的语法、目标类型、参数与返回匹配、延迟执行和变量捕获规则
  - id: jls25-effective-final
    title: Java Language Specification 25 - final Variables
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.12.4
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - effectively final 局部变量的判定规则
  - id: java25-function-package
    title: Java SE 25 API - java.util.function
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/function/package-summary.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - Predicate、Function、Consumer 与 Supplier 的参数和返回合同
  - id: dev-java-method-references
    title: Dev.java - Writing Lambda Expressions as Method References
    url: https://dev.java/learn/lambdas/method-references/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java 教学页
    claims:
      - 静态、绑定实例、未绑定实例和构造器方法引用的等价 Lambda
  - id: jep-456-unnamed-variables
    title: JEP 456 - Unnamed Variables and Patterns
    url: https://openjdk.org/jeps/456
    sourceOrigin: official
    sourceType: release-note
    appliesTo: JDK 22 及以上
    claims:
      - 下划线可以声明不可读取的未命名 Lambda 参数
  - id: jep-286-local-variable-type-inference
    title: JEP 286 - Local-Variable Type Inference
    url: https://openjdk.org/jeps/286
    sourceOrigin: official
    sourceType: release-note
    appliesTo: JDK 10 及以上
    claims:
      - 局部 var 初始化器没有目标类型，不能直接接收需要目标类型的 Lambda
  - id: jls8-functional-interfaces
    title: Java Language Specification 8 - Functional Interfaces
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-9.html#jls-9.8
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 函数式接口与唯一抽象方法规则
  - id: jls8-lambda-expressions
    title: Java Language Specification 8 - Lambda Expressions
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html#jls-15.27
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 已支持 Lambda、目标类型和 effectively final 变量捕获
  - id: stackoverflow-var-lambda-target-type
    title: Why can't the var keyword in Java be assigned a lambda expression?
    url: https://stackoverflow.com/questions/49578553/why-cant-the-var-keyword-in-java-be-assigned-a-lambda-expression
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 10 及以上
    claims:
      - 初学者会尝试用局部 var 保存 Lambda，并由此暴露目标类型缺失问题
---

# Lambda

前面的课程已经让 TeamFlow 程序能够保存任务、遍历集合、处理异常和读写文件。接下来会出现另一类需求：
“怎样处理数据”不再固定写死在方法里，而是由调用者把一小段行为交给方法。例如，同一个筛选方法可以接收
“只看未完成任务”或“只看某位成员任务”两条不同规则。

Lambda 用简短表达式描述这种行为，但它不是一个脱离类型系统的“随手函数”。本课只建立函数式接口、目标
类型、Lambda 语法、变量捕获和方法引用，不使用 Stream，也不展开后续的数据流水线。

## 一、先用函数式接口写清行为合同

### 1. 一个抽象方法代表一种行为

函数式接口是只具有一个有效抽象方法的接口。这个方法规定行为需要什么参数、返回什么结果，Lambda 则提供
该方法的实现。`@FunctionalInterface` 不是成为函数式接口的必要条件，但它能让编译器及时发现误加第二个
抽象方法的问题。

下面的 `TaskRule` 规定：接收一个任务标题，返回是否匹配。

```java
@FunctionalInterface
interface TaskRule {
    /**
     * 判断任务标题是否符合规则。
     */
    boolean test(String title);
}

public final class FirstLambdaExample {
    /**
     * 创建并调用第一条任务规则。
     */
    public static void main(String[] args) {
        TaskRule containsRelease = title -> title.contains("发布");

        System.out.println(containsRelease.test("检查发布清单"));
        System.out.println(containsRelease.test("整理需求文档"));
    }
}
```

预期输出：

```text
true
false
```

等号左侧的 `TaskRule` 是目标类型。编译器据此知道 `title` 是 `String`，Lambda 的结果必须能作为
`boolean` 返回。调用 `containsRelease.test(...)` 时，参数进入 `title`，表达式结果成为 `test` 的返回值。

### 2. 默认方法和静态方法不增加行为数量

“一个抽象方法”不等于“接口里只能写一个方法”。接口可以有默认方法和静态方法，因为它们已经具有实现，
不会要求 Lambda 再补一份实现。判断一个接口能否接收 Lambda 时，应看它最终需要实现的抽象合同，而不是
只数源码中的方法行数。

```java
@FunctionalInterface
interface TaskRule {
    /**
     * 判断任务标题是否符合规则。
     */
    boolean test(String title);

    /**
     * 返回规则的展示名称。
     */
    default String label() {
        return "任务规则";
    }
}
```

这仍是函数式接口，Lambda 只需实现 `test`。`label` 已有默认实现，不会形成第二个待实现合同。

### 3. 创建 Lambda 不会立即执行正文

求值 Lambda 表达式会得到函数式接口实例，不会同时执行 Lambda 体。只有调用对应的抽象方法，正文才执行。

```java
public final class DeferredLambdaExample {
    /**
     * 展示 Lambda 的创建和执行时机。
     */
    public static void main(String[] args) {
        Runnable prepare = () -> System.out.println("TeamFlow 规则已执行");

        System.out.println("规则已创建");
        prepare.run();
        System.out.println("程序继续运行");
    }
}
```

预期输出：

```text
规则已创建
TeamFlow 规则已执行
程序继续运行
```

第一行先出现，证明赋值只保存行为；`run()` 才进入 Lambda 体；正文执行结束后，程序回到调用点继续向下。

## 二、读懂参数、箭头和方法体

### 1. 三部分共同实现抽象方法

Lambda 的基本形状是 `参数 -> 方法体`。

| 部分 | 示例 | 含义 |
| --- | --- | --- |
| 参数 | `title` | 接收函数式接口方法传入的值 |
| 箭头 | `->` | 分隔参数和实现正文 |
| 方法体 | `title.length()` | 计算返回值或执行动作 |

参数数量必须与目标方法一致。零个参数写空括号；一个推断类型的参数可以省略括号；两个及以上参数必须使用
括号。

```java
Runnable noArgument = () -> System.out.println("开始检查");
java.util.function.Predicate<String> oneArgument = title -> title.isEmpty();
java.util.function.BiPredicate<String, String> twoArguments =
    (title, keyword) -> title.contains(keyword);
```

调用 `noArgument.run()` 输出“开始检查”；`oneArgument.test("")` 返回 `true`；
`twoArguments.test("发布检查", "发布")` 返回 `true`。

### 2. 表达式体会直接产生结果

当正文只有一个表达式时，不写花括号，也不写 `return`。表达式的值就是抽象方法的返回值。

```java
java.util.function.Function<String, Integer> titleLength = title -> title.length();
System.out.println(titleLength.apply("发布检查"));
```

输出 `4`。目标类型 `Function<String, Integer>` 规定输入是 `String`、返回是 `Integer`，所以编译器会检查
`title.length()` 能否产生兼容结果。

### 3. 块体适合多步计算

正文需要多条语句时使用花括号。目标方法有返回值，所有能够正常返回的路径都要写 `return`；目标方法返回
`void`，块体只执行动作，不返回业务结果。

```java
java.util.function.Function<String, String> normalizeTitle = title -> {
    String trimmed = title.trim();
    return trimmed.isEmpty() ? "未命名任务" : trimmed;
};

java.util.function.Consumer<String> printer = title -> {
    System.out.println("任务: " + title);
};
```

`normalizeTitle.apply("  发布检查  ")` 返回“发布检查”，`printer.accept("发布检查")` 输出
“任务: 发布检查”。前者需要结果，所以块体有 `return`；后者的合同是消费一个值，不返回结果。

### 4. 参数类型要么全部显式写出，要么全部推断

通常让目标类型推断参数即可。需要显式写类型时，每个参数都要写，不能只写一半。

```java
java.util.function.BiPredicate<String, String> inferred =
    (title, keyword) -> title.contains(keyword);

java.util.function.BiPredicate<String, String> explicit =
    (String title, String keyword) -> title.contains(keyword);
```

两条规则行为相同。调用 `test("发布检查", "发布")` 都返回 `true`。显式类型不是更安全的另一种 Lambda，
只是把目标类型已经提供的信息写到参数位置。

## 三、用标准函数式接口表达常见行为

### 1. 先按参数和结果选择接口

`java.util.function` 提供了常用函数式接口。不要按名字猜用途，先判断输入和输出形状。

| 接口 | 抽象方法 | 输入 | 输出 | TeamFlow 用途 |
| --- | --- | --- | --- | --- |
| `Predicate<T>` | `test(T)` | 一个 `T` | `boolean` | 判断任务是否符合条件 |
| `Function<T, R>` | `apply(T)` | 一个 `T` | 一个 `R` | 把任务转换成展示文本 |
| `Consumer<T>` | `accept(T)` | 一个 `T` | 无 | 输出或接收一条结果 |
| `Supplier<T>` | `get()` | 无 | 一个 `T` | 按需提供标题或初始数据 |

这四个接口从 Java 8 起就存在，JDK 25 延续相同的核心合同。

### 2. Predicate 只回答是否符合条件

```java
java.util.function.Predicate<String> unfinished =
    status -> !status.equals("DONE");

System.out.println(unfinished.test("TODO"));
System.out.println(unfinished.test("DONE"));
```

输出依次为 `true`、`false`。`Predicate` 的结果必须是布尔值，适合把“判断”从后续动作中分离出来。

两个判断可以用接口已有的 `and` 组合，仍然得到一条 `Predicate`：

```java
java.util.function.Predicate<String> hasTaskPrefix = id -> id.startsWith("TASK-");
java.util.function.Predicate<String> isReleaseTask = id -> id.endsWith("101");
java.util.function.Predicate<String> visible = hasTaskPrefix.and(isReleaseTask);

System.out.println(visible.test("TASK-101"));
```

输出 `true`，因为两个判断都成立。这里仍然只是组合行为，没有开始数据流水线。

### 3. Function 把一个值转换成另一个值

```java
java.util.function.Function<String, String> taskLine =
    title -> "TeamFlow 任务: " + title.trim();

System.out.println(taskLine.apply("  发布检查  "));
```

输出“TeamFlow 任务: 发布检查”。输入和输出可以是同一种类型，也可以不同；由 `Function<T, R>` 的两个
类型参数分别决定。

### 4. Consumer 执行动作，Supplier 提供结果

```java
java.util.function.Supplier<String> heading = () -> "TeamFlow 待办任务";
java.util.function.Consumer<String> output = text -> System.out.println(text);

output.accept(heading.get());
```

输出“TeamFlow 待办任务”。`get()` 不接收参数但产生字符串，`accept(...)` 接收字符串并输出。两者职责
相反：一个提供值，一个消费值。

## 四、把行为交给方法

### 1. 方法参数可以接收不同规则

下面的方法不知道具体筛选条件，只依赖 `Predicate<String>` 合同。调用者可以把任意签名匹配的规则传进来。

```java
/**
 * 按调用者提供的规则筛选任务标题。
 */
private static java.util.List<String> filterTasks(
    java.util.List<String> tasks,
    java.util.function.Predicate<String> rule
) {
    java.util.List<String> result = new java.util.ArrayList<>();
    for (String task : tasks) {
        if (rule.test(task)) {
            result.add(task);
        }
    }
    return result;
}
```

调用 `filterTasks(tasks, title -> title.contains("发布"))` 时，循环把每个标题交给 `rule.test`。方法负责遍历
与收集，Lambda 只负责判断，因此以后更换规则不需要复制整个循环。

### 2. 方法也可以返回行为

```java
/**
 * 创建一条匹配指定负责人名称的规则。
 */
private static java.util.function.Predicate<String> ownerRule(String owner) {
    return taskLine -> taskLine.contains(owner);
}
```

`ownerRule("林夏")` 返回一条已经记住负责人名称的规则。调用者仍要通过 `test(...)` 执行它；返回 Lambda
并不等于已经检查了某条任务。

### 3. 目标类型决定可调用的方法

Lambda 保存到 `Predicate<String>` 后，通过 `test` 调用；保存到 `Function<String, Integer>` 后，通过
`apply` 调用。Java 不提供统一的 `lambda()` 调用语法，因为实际方法名和返回合同来自函数式接口。

```java
java.util.function.Predicate<String> rule = title -> title.contains("发布");
java.util.function.Function<String, Integer> length = title -> title.length();

System.out.println(rule.test("发布检查"));
System.out.println(length.apply("发布检查"));
```

输出为 `true` 和 `4`。同一个参数名不决定行为类型，等号左侧的接口才决定调用入口。

## 五、理解局部变量捕获

### 1. 未重新赋值的局部变量是 effectively final

Lambda 可以使用外层方法中的局部变量，但该变量必须显式声明为 `final`，或初始化后从未再次赋值。后一种
情况称为 effectively final。

```java
String owner = "林夏";
java.util.function.Predicate<String> ownedBy = taskLine -> taskLine.contains(owner);

System.out.println(ownedBy.test("TASK-101 | 林夏 | 发布检查"));
```

输出 `true`。`owner` 没写 `final`，但初始化后没有改变，因此可以被捕获。

### 2. 捕获后重新赋值会导致编译失败

```java
String owner = "林夏";
java.util.function.Predicate<String> ownedBy = taskLine -> taskLine.contains(owner);
owner = "周宁";
```

最后一行使 `owner` 不再 effectively final。即使重新赋值发生在 Lambda 之后，编译器仍会检查整个局部变量
的赋值历史，不能让 Lambda 捕获一个会变化的局部绑定。

### 3. 不能重绑引用，不代表对象绝对不可变

如果捕获的是集合引用，局部变量本身不能重新指向另一个集合，但集合内容仍可能被修改。这是“引用没有重绑”
和“对象不可变”的区别。

```java
java.util.List<String> audit = new java.util.ArrayList<>();
java.util.function.Consumer<String> recorder = title -> audit.add(title);

recorder.accept("发布检查");
System.out.println(audit.size());
```

输出 `1`。这段代码可以编译，因为 `audit` 没有重新赋值；但 Lambda 会改变外部集合。小范围记录可以这样写，
跨越复杂调用边界时应优先返回结果，让副作用保持可见。

## 六、用方法引用表达一次委托

### 1. 只有“收到参数后立刻调用现有方法”才适合缩写

下面两条 `Consumer<String>` 行为相同：

```java
java.util.function.Consumer<String> lambda = text -> System.out.println(text);
java.util.function.Consumer<String> reference = System.out::println;
```

`reference.accept("规则已加载")` 输出“规则已加载”。方法引用没有隐藏另一套执行机制，它只是让编译器把
`accept` 收到的参数转交给 `println`。

### 2. 四种形式都能还原成 Lambda

| 形式 | 方法引用 | 等价 Lambda | 参数从哪里来 |
| --- | --- | --- | --- |
| 静态方法 | `Type::staticMethod` | `value -> Type.staticMethod(value)` | 函数式接口参数 |
| 已绑定实例 | `object::method` | `value -> object.method(value)` | 实例已确定，参数来自接口 |
| 未绑定实例 | `Type::method` | `value -> value.method()` | 第一个接口参数作为实例 |
| 构造器 | `Type::new` | `value -> new Type(value)` | 构造参数来自接口 |

阅读方法引用时，先看目标类型，再把它还原成右侧 Lambda。只看 `Type::method` 无法确定参数数量和返回值。

构造器引用同样由目标类型决定参数和结果。下面的 `Function<String, StringBuilder>` 要求接收一个字符串并
返回 `StringBuilder`，因此 `StringBuilder::new` 会匹配接收字符串的构造器：

```java
java.util.function.Function<String, StringBuilder> labelFactory = StringBuilder::new;
StringBuilder taskLabel = labelFactory.apply("TASK-101");
System.out.println(taskLabel.append(" 已创建"));
```

预期输出：

```text
TASK-101 已创建
```

调用 `apply("TASK-101")` 时，参数被交给 `new StringBuilder("TASK-101")`，返回的新对象再追加状态文字。把
方法引用改写成 `value -> new StringBuilder(value)`，编译和输出都相同；JDK 25 与 Java 8 均支持这段代码。

### 3. 签名不匹配时保留 Lambda 更清楚

方法引用必须能完成目标接口要求的参数传递和结果适配。Lambda 还包含额外判断、拼接或多步处理时，不要为了
缩短字符强行改写。

```java
java.util.function.Function<String, String> label =
    title -> "任务: " + title.trim();
```

这里既调用 `trim` 又拼接前缀，不是对单个现有方法的一次委托，保留 Lambda 更直接。

## 七、JDK 25 与 Java 8 的写法边界

### 1. 核心 Lambda 能力没有版本分叉

Java 8 已经支持函数式接口、目标类型、Lambda、方法引用和 effectively final 捕获。本课完整程序刻意使用
两版共享的语法和 `java.util.function` API，因此在 JDK 25 与 Java 8 中代码相同。不能把“现代主线”误解为
Lambda 只属于较新的 JDK。

### 2. JDK 25 可以用下划线表示未使用参数

JDK 25 中，Lambda 参数位置的 `_` 表示未命名参数，正文不能读取它。Java 8 不支持这种含义，兼容代码应给
未使用参数一个普通名称。

:::compare{before="Java 8" after="JDK 25"}
### Java 8

```java
java.util.function.BiConsumer<String, String> reporter =
    (taskId, ignoredStatus) -> System.out.println(taskId);
```

### JDK 25

```java
java.util.function.BiConsumer<String, String> reporter =
    (taskId, _) -> System.out.println(taskId);
```
:::

两版调用 `reporter.accept("TASK-101", "DONE")` 都输出 `TASK-101`。本课主示例仍使用命名参数，避免让兼容
项目意外采用 Java 8 无法编译的语法。

### 3. 局部 var 不能替代目标类型

JDK 25 支持局部变量类型推断，但 `var rule = title -> ...` 仍然无法编译。`var` 需要从初始化器推断类型，
Lambda 又需要等号左侧先提供目标类型，两边都在等待对方，无法形成合同。Java 8 则根本没有局部 `var` 语法。

**社区补充：** Stack Overflow 上的真实问题显示，初学者常把普通对象的 `var` 写法直接套到 Lambda。该问题
适用于 Java 10 及以上，JDK 25 编译验证与 JEP 286 均确认应改为显式函数式接口类型；社区线索只帮助定位误区，
语言结论仍以官方规则为准。

## 八、集中排除典型错误

下面的错误只用于识别 Lambda 合同是否建立和执行，不扩展成后续数据处理课程。

:::pitfalls
### 接口有两个待实现的抽象方法

**触发条件：** 给接口添加第二个抽象方法后，仍尝试用一个 Lambda 创建实例。

**原因：** 一个 Lambda 只能实现一个函数方法，两个不同抽象合同无法由同一参数和方法体同时表达。

**后果：** `@FunctionalInterface` 声明和 Lambda 赋值都会在编译期失败。

**错误示例：** 接口同时要求 `test` 和 `label`。

```java
@FunctionalInterface
interface TaskRule {
    /** 判断任务是否匹配。 */
    boolean test(String title);

    /** 返回规则名称。 */
    String label();
}
```

**正确写法：** 只保留一个抽象方法，已有实现的辅助行为写成默认方法。

```java
@FunctionalInterface
interface TaskRule {
    /** 判断任务是否匹配。 */
    boolean test(String title);

    /** 返回规则名称。 */
    default String label() {
        return "任务规则";
    }
}
```

**验证方式：** 用 `TaskRule rule = title -> true;` 编译；正确版通过，错误版报告不是函数式接口。

### 用 var 保存没有目标类型的 Lambda

**触发条件：** 在 JDK 25 中把普通局部变量的 `var` 写法直接用于 Lambda。

**原因：** Lambda 是需要目标类型的多态表达式，局部 `var` 不会先提供一个函数式接口合同。

**后果：** 编译器无法推断参数和返回类型；Java 8 还会先报告不支持局部 `var`。

**错误示例：** 让初始化器自行决定 Lambda 类型。

```java
var rule = title -> title.contains("发布");
```

**正确写法：** 在等号左侧写出实际需要的函数式接口。

```java
java.util.function.Predicate<String> rule = title -> title.contains("发布");
```

**验证方式：** 用 JDK 25 编译两段代码，错误版报告 Lambda 需要显式目标类型，正确版调用 `test` 返回结果。

### 混用显式类型和推断类型

**触发条件：** 多参数 Lambda 只给其中一个参数写类型。

**原因：** 同一参数列表必须全部使用显式类型，或全部由目标类型推断。

**后果：** 编译器无法按 Lambda 参数语法解析这份混合列表。

**错误示例：** 第一个参数写 `String`，第二个只写名称。

```java
java.util.function.BiPredicate<String, String> rule =
    (String title, keyword) -> title.contains(keyword);
```

**正确写法：** 两个参数都交给目标类型推断。

```java
java.util.function.BiPredicate<String, String> rule =
    (title, keyword) -> title.contains(keyword);
```

**验证方式：** 编译后调用 `rule.test("发布检查", "发布")`，正确版输出 `true`。

### 有返回值的块体漏写 return

**触发条件：** 把表达式体扩成花括号块，却没有显式返回结果。

**原因：** 块体不会自动把最后一条表达式当作返回值。

**后果：** Lambda 与 `Function` 的返回合同不兼容，编译失败。

**错误示例：** 计算了长度但没有返回。

```java
java.util.function.Function<String, Integer> length = title -> {
    title.length();
};
```

**正确写法：** 在块体中显式返回长度。

```java
java.util.function.Function<String, Integer> length = title -> {
    return title.length();
};
```

**验证方式：** 调用 `length.apply("发布检查")`，正确版输出 `4`。

### 捕获局部变量后又重新赋值

**触发条件：** Lambda 使用外层局部变量，而同一方法稍后又给该变量赋新值。

**原因：** 被捕获的局部变量必须是 final 或 effectively final，检查范围覆盖整个变量生命周期。

**后果：** 编译器拒绝捕获，程序无法构建。

**错误示例：** 创建规则后更换 `owner`。

```java
String owner = "林夏";
java.util.function.Predicate<String> rule = line -> line.contains(owner);
owner = "周宁";
```

**正确写法：** 为每条稳定规则使用一个不再重新赋值的局部变量。

```java
String owner = "林夏";
java.util.function.Predicate<String> rule = line -> line.contains(owner);
System.out.println(rule.test("TASK-101 | 林夏"));
```

**验证方式：** 分别编译两段代码；错误版报告捕获变量不是 final 或 effectively final，正确版输出 `true`。

### 只保存 Lambda 却没有调用

**触发条件：** 期望赋值语句立刻输出内容，却从未调用函数式接口方法。

**原因：** 创建 Lambda 实例与执行 Lambda 体是两个步骤。

**后果：** 程序正常结束但没有预期输出，容易误以为运行了错误类。

**错误示例：** 创建 `Runnable` 后直接结束 `main`。

```java
Runnable action = () -> System.out.println("规则已执行");
```

**正确写法：** 在需要执行的位置调用目标接口方法。

```java
Runnable action = () -> System.out.println("规则已执行");
action.run();
```

**验证方式：** 运行两段代码；错误版没有输出，正确版精确输出“规则已执行”。

### 方法引用与目标接口签名不匹配

**触发条件：** 只因方法名看起来合适，就把返回 `void` 的 `println` 赋给需要返回值的 `Function`。

**原因：** 方法引用仍必须满足目标接口的参数数量和返回合同。

**后果：** 编译器无法把 `void` 适配成 `Integer`。

**错误示例：** 用 `Function` 接收打印动作。

```java
java.util.function.Function<String, Integer> output = System.out::println;
```

**正确写法：** 打印动作使用返回 `void` 的 `Consumer`。

```java
java.util.function.Consumer<String> output = System.out::println;
```

**验证方式：** 编译并调用 `output.accept("发布检查")`，正确版输出“发布检查”。

### 把函数式接口变量当成可直接调用的函数

**触发条件：** 写成 `rule("发布检查")`，忽略了目标接口定义的方法名。

**原因：** Java 变量没有统一调用运算符，Lambda 通过函数式接口的抽象方法执行。

**后果：** 编译器把 `rule(...)` 视为不存在的方法调用。

**错误示例：** 直接在变量名后写括号。

```java
java.util.function.Predicate<String> rule = title -> title.contains("发布");
boolean matched = rule("发布检查");
```

**正确写法：** 调用 `Predicate` 的 `test` 方法。

```java
java.util.function.Predicate<String> rule = title -> title.contains("发布");
boolean matched = rule.test("发布检查");
```

**验证方式：** 编译正确版并输出 `matched`，结果必须为 `true`。
:::

## 九、完整的 TeamFlow Lambda 程序

### 1. 程序要解决的问题

程序按需创建三条任务，用 `Predicate` 选择林夏负责的未完成任务，用 `Function` 转成展示文本，再由
`Consumer` 输出。它同时使用 Lambda 和方法引用，但不依赖 Stream。

### 2. JDK 25 完整程序

创建 `TeamFlowLambdaApplication.java`：

```java
import java.util.Arrays;
import java.util.List;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;

public final class TeamFlowLambdaApplication {
    private static final class Task {
        private final String id;
        private final String title;
        private final String owner;
        private final boolean completed;

        /**
         * 创建一条固定的 TeamFlow 任务。
         */
        private Task(String id, String title, String owner, boolean completed) {
            this.id = id;
            this.title = title;
            this.owner = owner;
            this.completed = completed;
        }

        /**
         * 判断任务是否应展示给指定负责人。
         */
        private boolean isVisibleFor(String expectedOwner) {
            return !completed && owner.equals(expectedOwner);
        }

        /**
         * 生成任务的控制台展示文本。
         */
        private String displayText() {
            return id + " | " + title + " | " + owner;
        }
    }

    /**
     * 创建本次演示使用的任务数据。
     */
    private static List<Task> createTasks() {
        return Arrays.asList(
            new Task("TASK-101", "准备迭代演示", "林夏", false),
            new Task("TASK-102", "检查发布说明", "周宁", false),
            new Task("TASK-103", "归档完成记录", "林夏", true)
        );
    }

    /**
     * 运行 TeamFlow Lambda 示例。
     */
    public static void main(String[] args) {
        Supplier<List<Task>> taskSource = TeamFlowLambdaApplication::createTasks;
        Predicate<Task> visible = task -> task.isVisibleFor("林夏");
        Function<Task, String> formatter = Task::displayText;
        Consumer<String> output = System.out::println;

        List<Task> tasks = taskSource.get();
        output.accept("TeamFlow 待办任务");
        int matchedCount = 0;
        for (Task task : tasks) {
            if (visible.test(task)) {
                output.accept(formatter.apply(task));
                matchedCount++;
            }
        }
        output.accept("命中数量: " + matchedCount);
    }
}
```

### 3. 在 JDK 25 中配置并运行

1. 在 IntelliJ IDEA 中打开普通 Java 项目。
2. 在 **File -> Project Structure -> Project** 把 **Project SDK** 设为 JDK 25。
3. 在 **Modules -> Dependencies** 核对模块 SDK 跟随 Project SDK，语言级别使用 25。
4. 创建 `TeamFlowLambdaApplication.java`，填入 JDK 25 完整代码。
5. 运行 `main`，确认运行配置使用项目的 JDK 25，而不是另一个终端 JDK。
6. 在控制台核对标题、一条任务和命中数量。

### 4. JDK 25 预期输出与执行过程

```text
TeamFlow 待办任务
TASK-101 | 准备迭代演示 | 林夏
命中数量: 1
```

`Supplier.get()` 先调用 `createTasks`；循环逐条调用 `Predicate.test`；只有第一条同时满足“未完成”和“负责人
为林夏”；随后 `Function.apply` 生成文本，`Consumer.accept` 输出。已完成的第三条不会进入输出分支。

### 5. Java 8 完整程序

Java 8 已支持程序使用的全部 Lambda 与方法引用，完整代码如下：

```java
import java.util.Arrays;
import java.util.List;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;

public final class TeamFlowLambdaApplication {
    private static final class Task {
        private final String id;
        private final String title;
        private final String owner;
        private final boolean completed;

        /**
         * 创建一条固定的 TeamFlow 任务。
         */
        private Task(String id, String title, String owner, boolean completed) {
            this.id = id;
            this.title = title;
            this.owner = owner;
            this.completed = completed;
        }

        /**
         * 判断任务是否应展示给指定负责人。
         */
        private boolean isVisibleFor(String expectedOwner) {
            return !completed && owner.equals(expectedOwner);
        }

        /**
         * 生成任务的控制台展示文本。
         */
        private String displayText() {
            return id + " | " + title + " | " + owner;
        }
    }

    /**
     * 创建本次演示使用的任务数据。
     */
    private static List<Task> createTasks() {
        return Arrays.asList(
            new Task("TASK-101", "准备迭代演示", "林夏", false),
            new Task("TASK-102", "检查发布说明", "周宁", false),
            new Task("TASK-103", "归档完成记录", "林夏", true)
        );
    }

    /**
     * 运行 TeamFlow Lambda 示例。
     */
    public static void main(String[] args) {
        Supplier<List<Task>> taskSource = TeamFlowLambdaApplication::createTasks;
        Predicate<Task> visible = task -> task.isVisibleFor("林夏");
        Function<Task, String> formatter = Task::displayText;
        Consumer<String> output = System.out::println;

        List<Task> tasks = taskSource.get();
        output.accept("TeamFlow 待办任务");
        int matchedCount = 0;
        for (Task task : tasks) {
            if (visible.test(task)) {
                output.accept(formatter.apply(task));
                matchedCount++;
            }
        }
        output.accept("命中数量: " + matchedCount);
    }
}
```

### 6. 在 Java 8 中配置并运行

1. 在 **File -> Project Structure -> SDKs** 添加本机已有的 JDK 8，不要下载或安装新环境。
2. 把 Project SDK 和 Module SDK 都设为 JDK 8，语言级别设为 8。
3. 在运行配置中把 JRE 设为项目 JDK 8，避免只改 SDK 却仍由 JDK 25 启动。
4. 使用上面的 Java 8 完整代码；不要把对比示例中的 `_` 未命名参数复制进来。
5. 运行 `main`，核对三行输出与 JDK 25 完全一致。

两版程序都使用 Java 8 已有的函数式接口和 Lambda 核心语法，因此执行步骤与结果一致。这里的兼容来自真实
语言能力，而不是省略了 Java 8 实现。

## 十、独立练习

### 1. 输出已完成任务

:::exercise
### TeamFlow 完成任务清单

**要求：** 编写 `TeamFlowLambdaExercise`。使用 `Supplier<List<String>>` 提供三条固定记录，记录格式分别为
`DONE|TASK-201|发布检查`、`OPEN|TASK-202|整理需求`、`DONE|TASK-203|回归验证`。使用 `Predicate` 选择
`DONE|` 开头的记录，使用 `Function` 转为 `任务编号 | 标题`，使用 `Consumer` 输出。必须通过各接口的抽象
方法执行 Lambda，不使用 Stream，不修改数据源集合。JDK 25 和 Java 8 都使用命名参数的兼容写法。

**验收：**

```text
TeamFlow 已完成任务
TASK-201 | 发布检查
TASK-203 | 回归验证
完成数量: 2
```
:::

### 2. JDK 25 参考实现

```java
import java.util.Arrays;
import java.util.List;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;

public final class TeamFlowLambdaExercise {
    /**
     * 筛选并输出 TeamFlow 已完成任务。
     */
    public static void main(String[] args) {
        Supplier<List<String>> taskSource = () -> Arrays.asList(
            "DONE|TASK-201|发布检查",
            "OPEN|TASK-202|整理需求",
            "DONE|TASK-203|回归验证"
        );
        Predicate<String> completed = record -> record.startsWith("DONE|");
        Function<String, String> display = record -> {
            String[] fields = record.split("\\|");
            return fields[1] + " | " + fields[2];
        };
        Consumer<String> output = System.out::println;

        output.accept("TeamFlow 已完成任务");
        int completedCount = 0;
        for (String task : taskSource.get()) {
            if (completed.test(task)) {
                output.accept(display.apply(task));
                completedCount++;
            }
        }
        output.accept("完成数量: " + completedCount);
    }
}
```

在 IDEA 中选择 JDK 25 Project SDK 和运行 JRE，运行 `main`。筛选规则命中第一、第三条记录，转换函数取出
任务编号和标题，因此输出必须与练习验收的四行完全一致。

### 3. Java 8 参考实现

```java
import java.util.Arrays;
import java.util.List;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;

public final class TeamFlowLambdaExercise {
    /**
     * 筛选并输出 TeamFlow 已完成任务。
     */
    public static void main(String[] args) {
        Supplier<List<String>> taskSource = () -> Arrays.asList(
            "DONE|TASK-201|发布检查",
            "OPEN|TASK-202|整理需求",
            "DONE|TASK-203|回归验证"
        );
        Predicate<String> completed = record -> record.startsWith("DONE|");
        Function<String, String> display = record -> {
            String[] fields = record.split("\\|");
            return fields[1] + " | " + fields[2];
        };
        Consumer<String> output = System.out::println;

        output.accept("TeamFlow 已完成任务");
        int completedCount = 0;
        for (String task : taskSource.get()) {
            if (completed.test(task)) {
                output.accept(display.apply(task));
                completedCount++;
            }
        }
        output.accept("完成数量: " + completedCount);
    }
}
```

在 IDEA 中把 Project SDK、Module SDK、语言级别和运行 JRE 都设为 Java 8，再运行完整代码。Java 8 版没有
使用局部 `var` 或 `_` 未命名参数，预期输出仍与 JDK 25 版逐字一致。
