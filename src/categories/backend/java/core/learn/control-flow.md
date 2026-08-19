---
id: backend.java.learn.basics.control-flow
type: lesson
title: 条件分支
summary: 使用 if/else 和 switch 为 TeamFlow 的局部状态选择一条明确执行路径
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 65
prerequisites:
  - backend.java.learn.basics.operators-and-expressions
objectives:
  - 能使用 if、else if 和 else 根据 boolean 条件选择一条执行路径。
  - 能按条件从具体到一般的顺序组织分支，并用大括号明确嵌套边界。
  - 能使用传统 switch 的 case、default 和显式 break，预测贯穿时的输出。
  - 能在 JDK 25 中使用 switch expression、arrow rule 和 yield 计算一个值。
  - 能写出 Java 8 对应的传统 switch 完整程序，并解释两种版本的真实语法差异。
  - 能定位非布尔条件、分支后变量未赋值、意外贯穿和错误使用现代 switch 的问题。
recap:
  - if 条件必须产生 boolean 或 Boolean；else if 按从上到下的顺序判断，一次只会选中一条路径。
  - 大括号同时表达语句边界和嵌套关系，避免 else 绑定到错误的 if。
  - 传统 switch 从匹配的 case 或 default 开始执行；省略 break 会继续执行后续语句组。
  - JDK 25 的 switch expression 产生一个值，arrow rule 不会隐式贯穿，块分支使用 yield。
  - Java 8 没有 switch expression、arrow rule 和 yield，必须使用传统 switch 完成同一选择。
related: []
tags:
  - Java
  - 条件分支
  - if
  - switch
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 在 switch expression 及其对应写法处说明
verifiedAt: 2026-08-17
sources:
  - id: jls-25-statements
    title: Java Language Specification 25 - Blocks, Statements, and Patterns
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25，§14.9、§14.11
    claims:
      - if 条件必须是 boolean 或 Boolean，且 if/else 在运行时选择相应语句。
      - 传统 switch 从适用标签开始执行，冒号语句组可能继续到后续语句组。
  - id: jls-25-switch-expressions
    title: Java Language Specification 25 - Switch Expressions
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.28
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25，§15.28
    claims:
      - switch expression 会产生一个值，switch rule 可以使用表达式或块。
      - 使用块的分支通过 yield 提供 switch expression 的值，分支需要穷尽。
  - id: jls-25-definite-assignment
    title: Java Language Specification 25 - Definite Assignment
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-16.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 局部变量在读取前必须在每条可达路径上确定已赋值。
  - id: jls-8-statements
    title: Java Language Specification 8 - Blocks and Statements
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8，§14.9、§14.11
    claims:
      - Java 8 支持 if/else 和传统 switch 的共享语法与执行规则。
  - id: jls-8-definite-assignment
    title: Java Language Specification 8 - Definite Assignment
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-16.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 也要求局部变量在读取前确定已赋值。
  - id: jep-361-switch-expressions
    title: JEP 361 - Switch Expressions
    url: https://openjdk.org/jeps/361
    sourceOrigin: official
    sourceType: release-note
    appliesTo: Java 14 及以上
    claims:
      - switch expression 和 yield 在 Java 14 成为正式语言特性。
  - id: dev-java-controlling-flow
    title: Control Flow Statements
    url: https://dev.java/learn/language-basics/controlling-flow
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java Java 语言基础
    claims:
      - if/else 和传统 switch 用于根据条件选择执行路径。
  - id: stack-overflow-switch-default-fall-through
    title: Switch Statement Default Case Fall Through - Java
    url: https://stackoverflow.com/questions/28073899/switch-statement-default-case-fall-through
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: 传统 Java switch 的初学者误区
    claims:
      - default 标签位置与传统 switch 的贯穿行为是常见的实际理解误区。
---

# 条件分支

TeamFlow 后续会根据任务数量、优先级和状态决定展示什么信息。现在还没有任务对象、接口或数据库，但已经
可以先解决一个更小的问题：当程序得到一个条件或固定代码时，如何只选择正确的一条路径执行。

这一课只处理条件分支。它不会引入循环、输入、方法设计或复杂业务规则。学完后，你能看着一个条件从上到
下推演程序会走向哪里，也能把同一个选择分别写成 JDK 25 和 Java 8 可运行的版本。

## 一、先让程序根据条件选择路径

### 1. `if` 只接受布尔结果

`if` 括号中的表达式先被计算。结果为 `true` 时，花括号中的语句执行；结果为 `false` 时，程序跳过这一
块，继续执行后面的语句。条件不能直接写数字或字符串，必须是 `boolean` 或 `Boolean`。

前一课的比较运算已经可以得到布尔结果，因此可以直接把比较式放进 `if`：

```java
int pendingTaskCount = 2;

if (pendingTaskCount > 0) {
    System.out.println("看板还有待处理任务");
}
```

这里 `pendingTaskCount > 0` 的结果是 `true`，所以输出一行文字。把初始值改成 `0` 后，比较结果变为
`false`，这条输出不会发生。`if` 不会把 `2` 自动理解成“真”，必须把“任务数是否大于零”明确写出来。

下面的完整程序把两个分支都变成可观察的结果：

```java
/**
 * 根据待处理任务数量输出看板状态。
 */
public final class IfBranchDemo {
    /**
     * 输出任务数量大于零时的分支结果。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        int pendingTaskCount = 2;

        if (pendingTaskCount > 0) {
            System.out.println("看板还有待处理任务");
        } else {
            System.out.println("看板已清空");
        }
    }
}
```

运行结果是：

```text
看板还有待处理任务
```

`else` 不是第二次独立判断，而是第一个条件为 `false` 时的替代路径。因此一次执行只会输出其中一行。

### 2. `else if` 的顺序就是业务优先级

多个范围需要分类时，`else if` 按书写顺序继续判断；一旦某个条件为 `true`，后面的分支不再检查。把更
具体或优先级更高的条件放在前面，才能让范围不互相遮挡。

```java
int pendingTaskCount = 5;
String boardStatus;

if (pendingTaskCount == 0) {
    boardStatus = "已清空";
} else if (pendingTaskCount <= 3) {
    boardStatus = "可以开始";
} else {
    boardStatus = "需要安排";
}

System.out.println(boardStatus);
```

输出为：

```text
需要安排
```

程序先检查是否为 `0`，结果为 `false`；再检查是否不大于 `3`，结果仍为 `false`；最后进入 `else`。如果
把第二个条件错误地写成 `pendingTaskCount >= 0` 并放在中间，它会接住所有非负数，最后的 `else` 就不会有
机会执行。条件链的顺序不是排版问题，而是规则本身的一部分。

### 3. 用大括号保留分支边界

Java 允许 `if` 后只跟一条语句，但初学阶段应始终写大括号。这样既能看清哪几条语句属于当前分支，也能
避免嵌套时把 `else` 误解为属于外层 `if`。

```java
boolean hasProject = true;
boolean hasOwner = false;

if (hasProject) {
    if (hasOwner) {
        System.out.println("任务可以开始");
    } else {
        System.out.println("任务还没有负责人");
    }
}
```

输出是 `任务还没有负责人`。内层 `else` 紧跟内层 `if (hasOwner)`，因此它描述的是“项目存在，但负责人缺失”。
如果想表达“没有项目”的路径，就需要把它写成外层 `if` 的 `else`，并用大括号把两层关系固定下来。

## 二、用传统 `switch` 处理固定代码

### 1. `case` 匹配固定值，`default` 接住其余值

当判断的是一个固定代码，而不是一个数值范围时，传统 `switch` 可以把候选项集中在一起。`switch` 先计算
括号中的选择值，再从匹配的 `case` 标签开始；没有任何 `case` 匹配时，才从 `default` 标签开始。

```java
/**
 * 根据任务优先级代码输出传统 switch 的分类结果。
 */
public final class TraditionalSwitchDemo {
    /**
     * 输出优先级代码对应的文字。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        int priorityCode = 2;
        String priorityLabel;

        switch (priorityCode) {
            case 1:
                priorityLabel = "普通";
                break;
            case 2:
                priorityLabel = "紧急";
                break;
            default:
                priorityLabel = "未分类";
        }

        System.out.println(priorityLabel);
    }
}
```

运行结果：

```text
紧急
```

`priorityCode` 的值为 `2`，所以从 `case 2` 开始，给 `priorityLabel` 赋值。这里的 `break` 只表示当前
传统 `switch` 的这组语句到此结束，避免继续进入下一个语句组；本课不展开它在循环中的另一种用法。

### 2. 冒号 `case` 会贯穿，除非明确结束当前语句组

传统 `switch` 的冒号标签不会自动停止。命中某个 `case` 后，如果没有 `break`，程序会继续执行紧接着的
语句组。这叫贯穿。有意共享处理时可以使用它，但必须让输出和后续路径保持清楚。

```java
/**
 * 观察传统 switch 未结束语句组时的贯穿结果。
 */
public final class FallThroughDemo {
    /**
     * 输出命中第一个 case 后继续执行第二个 case 的结果。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        String result = "";

        switch (1) {
            case 1:
                result = "普通";
            case 2:
                result = result + "|紧急";
                break;
            default:
                result = "未分类";
        }

        System.out.println(result);
    }
}
```

输出为：

```text
普通|紧急
```

`case 1` 赋值后没有 `break`，所以紧接着又执行了 `case 2`。在第一个语句组末尾补上 `break` 后，输出才会
变成 `普通`。

**社区补充：** 传统 `switch` 的贯穿，尤其是 `default` 标签放在中间时从哪里开始执行，是实际初学者提问中
反复出现的误区。标签的书写位置不改变规则：无匹配时从 `default` 开始，然后仍按源码顺序继续执行，直到
遇到 `break` 或整个 `switch` 结束。把 `default` 放在最后、并在不需要贯穿的语句组末尾写 `break`，最容易
让读者核对意图。

### 3. `if` 与传统 `switch` 的选择边界

`if/else if/else` 适合范围、大小比较或需要按优先级判断的条件，例如“待处理任务是否不大于三条”。传统
`switch` 适合一个选择值对应若干固定代码，例如优先级 `1`、`2` 或其他值。

不要为了使用 `switch` 而把范围判断绕成很多离散值，也不要把一长串“值是否等于某个常量”的 `if` 写得
难以阅读。选择结构的目标是让输入与路径的对应关系更直接，而不是追求某一种语法更多。

## 三、JDK 25 用 `switch expression` 直接得到结果

### 1. `switch statement` 执行动作，`switch expression` 产生值

前面的传统 `switch` 是语句：先声明 `priorityLabel`，再在不同 `case` 中为它赋值。JDK 25 还支持
`switch expression`，它像其他表达式一样直接产生一个值，因此可以写在赋值号右边。

```java
/**
 * 使用 JDK 25 switch expression 计算优先级文字。
 */
public final class SwitchExpressionDemo {
    /**
     * 输出选择值对应的优先级文字。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        int priorityCode = 1;
        String priorityLabel = switch (priorityCode) {
            case 1 -> "普通";
            case 2 -> "紧急";
            default -> "未分类";
        };

        System.out.println(priorityLabel);
    }
}
```

输出为：

```text
普通
```

每一个 `case ... ->` 都是 arrow rule。它直接给出当前 `switch expression` 的结果，不会像传统冒号 `case`
那样自动进入下一条规则。`priorityCode` 是普通整数，可能取到本例没有列出的值，所以 `default` 负责让
所有可能值都有结果。

### 2. 分支需要多条语句时用 `yield` 交出结果

arrow rule 的右侧也可以是一个块。块中先执行需要的语句，最后用 `yield` 把当前分支的结果交给外层
`switch expression`；`yield` 不是打印，也不会离开整个程序。

```java
/**
 * 演示 JDK 25 在 switch expression 块分支中使用 yield。
 */
public final class YieldDemo {
    /**
     * 输出紧急任务的计算结果。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        int priorityCode = 2;
        String priorityLabel = switch (priorityCode) {
            case 1 -> "普通";
            case 2 -> {
                String result = "紧急";
                yield result;
            }
            default -> "未分类";
        };

        System.out.println(priorityLabel);
    }
}
```

运行结果仍是 `紧急`。执行到 `case 2` 时，块先把文字保存到 `result`，`yield result` 再把这份文字作为
整个 `switch expression` 的值，最后完成对 `priorityLabel` 的初始化。少了 `yield`，这个块就没有提供
必须产生的结果，编译器会拒绝源码。

### 3. Java 8 必须回到传统写法

`switch expression`、arrow rule 和 `yield` 在 Java 14 成为正式语言特性，JDK 25 可以使用，Java 8 不
支持。Java 8 不是在运行时跳过这些分支，而是在编译这份源码时就无法识别语法。

需要兼容 Java 8 时，先声明结果变量，再使用传统 `switch` 在每个 `case` 中赋值，并在不需要贯穿时写
`break`。下面“完整程序”会为同一项 TeamFlow 选择分别提供两份完整源码，而不是只给出差异行。

## 四、让分支后的状态仍然可靠

### 1. 分支外读取的变量必须覆盖所有路径

变量与赋值课已经建立了“读取前必须已赋值”的规则。条件分支会让这个规则变得具体：如果分支外要读取
局部变量，所有可能走到读取点的路径都必须先为它赋值。

```java
boolean hasOwner = true;
String assignmentStatus;

if (hasOwner) {
    assignmentStatus = "已分配";
} else {
    assignmentStatus = "待分配";
}

System.out.println(assignmentStatus);
```

无论 `hasOwner` 是 `true` 还是 `false`，程序都会进入其中一个分支并完成赋值，因此最后可以安全输出。
如果删除 `else`，当条件为 `false` 时 `assignmentStatus` 没有值，编译器不能允许后面的读取。

### 2. 用分支本身表达默认含义

给局部变量先随意写一个初值，确实有时能避免编译错误，但可能把“没有负责人”和“已经分配”的业务含义
混在一起。更可靠的做法是先判断哪个分支应该赋什么值，只有当某个初值本来就有明确含义时才直接初始化。

在传统 `switch` 中，`default` 是固定代码没有匹配时的明确路径；在整数 `switch expression` 中，`default`
也常用来让每个可能输入都有一个结果。这些都不是为了让编译器沉默，而是把剩余情况写进程序规则。

### 3. 本课只把路径选择清楚

本课的程序从上到下检查一次条件、选中一次路径并输出结果。重复执行一段代码、提前跳出重复过程或跳过某
一轮，属于下一课的循环控制；把一段选择逻辑抽成可复用的方法，属于后续的方法课程。

## 五、常见易错情况

:::pitfalls
### 把数字直接写进 if 条件

**触发条件：** 直接写出 `if (1)`，希望 Java 把非零数字当成 `true`。

**原因：** Java 的 if 条件必须产生 `boolean` 或 `Boolean`，不会把整数自动转换成真假值。

**后果：** JDK 25 与 Java 8 都在编译阶段拒绝源码，程序不会开始运行。

**错误示例：**

```java
if (1) {
    System.out.println("有任务");
}
```

**正确写法：**

```java
int pendingTaskCount = 1;
if (pendingTaskCount > 0) {
    System.out.println("有任务");
}
```

**验证方式：** 分别用 JDK 25 和 Java 8 编译错误片段，两个编译器都应非零退出；把它改成比较表达式后，两个版本都应输出 `有任务`。

### 只在一个分支赋值却在分支外读取

**触发条件：** 局部变量只在 if 为真时赋值，随后无条件读取它。

**原因：** 条件为 false 时没有任何语句为变量提供值，编译器无法证明读取位置前已经完成赋值。

**后果：** JDK 25 与 Java 8 都报告变量可能尚未初始化，无法编译。

**错误示例：**

```java
boolean hasOwner = true;
String assignmentStatus;

if (hasOwner) {
    assignmentStatus = "已分配";
}

System.out.println(assignmentStatus);
```

**正确写法：**

```java
boolean hasOwner = true;
String assignmentStatus;

if (hasOwner) {
    assignmentStatus = "已分配";
} else {
    assignmentStatus = "待分配";
}

System.out.println(assignmentStatus);
```

**验证方式：** 两个版本编译错误片段都应失败；正确片段在 `hasOwner` 为 true 时输出 `已分配`，改为 false 时输出 `待分配`。

### 省略大括号后把 else 绑定到错误的 if

**触发条件：** 嵌套 if 时省略大括号，并把 else 当成外层 if 的替代路径。

**原因：** 没有大括号时，else 总是绑定到最近一个尚未匹配 else 的 if。

**后果：** 程序能够编译，却进入与阅读者预期不同的分支，错误更难从编译器提示中发现。

**错误示例：**

```java
boolean hasProject = true;
boolean hasOwner = false;

if (hasProject)
    if (hasOwner)
        System.out.println("可以开始");
    else
        System.out.println("没有项目");
```

**正确写法：**

```java
boolean hasProject = true;
boolean hasOwner = false;

if (hasProject) {
    if (hasOwner) {
        System.out.println("可以开始");
    } else {
        System.out.println("没有负责人");
    }
} else {
    System.out.println("没有项目");
}
```

**验证方式：** 错误片段会输出 `没有项目`，正确片段会输出 `没有负责人`；把两个布尔值改成不同组合，再确认每种输出都与花括号表达的路径对应。

### 忘记传统 switch 的 break 导致意外贯穿

**触发条件：** 冒号 case 完成赋值后没有写 break，却只期待一个 case 的结果。

**原因：** 传统 switch 从匹配标签开始顺序执行，冒号 case 本身不会自动结束当前语句组。

**后果：** 一个固定代码可能执行后续 case 的语句，输出或变量值包含额外结果。

**错误示例：**

```java
String priorityLabel = "";
switch (1) {
    case 1:
        priorityLabel = "普通";
    case 2:
        priorityLabel = priorityLabel + "|紧急";
        break;
    default:
        priorityLabel = "未分类";
}
System.out.println(priorityLabel);
```

**正确写法：**

```java
String priorityLabel;
switch (1) {
    case 1:
        priorityLabel = "普通";
        break;
    case 2:
        priorityLabel = "紧急";
        break;
    default:
        priorityLabel = "未分类";
}
System.out.println(priorityLabel);
```

**验证方式：** 两个 Java 版本运行错误片段都输出 `普通|紧急`；正确片段在两个版本都只输出 `普通`。

### 把 JDK 25 switch expression 交给 Java 8 编译

**触发条件：** 用 Java 8 编译包含 arrow rule 或 yield 的 switch expression。

**原因：** switch expression 在 Java 14 才成为正式语法，Java 8 只有传统 switch。

**后果：** Java 8 编译失败；这不是调整运行配置就能绕过的运行时差异。

**错误示例：**

```java
String priorityLabel = switch (2) {
    case 1 -> "普通";
    default -> "未分类";
};
```

**正确写法：**

```java
String priorityLabel;
switch (2) {
    case 1:
        priorityLabel = "普通";
        break;
    default:
        priorityLabel = "未分类";
}
```

**验证方式：** 现代片段在 JDK 25 编译通过、在 Java 8 编译失败；传统写法在两个版本都能编译，且输出对应的文字。

:::

## 六、在 TeamFlow 首程序中组合两种分支

### 1. JDK 25 完整程序

在最终 TeamFlow 项目中，这段程序会位于启动类附近，用来把最小的任务数量和优先级代码转换成可读状态。
现在它还是普通 Java 源文件，不会连接服务、读取数据或创建复杂业务对象。

文件：`TeamFlowBranchingApplication.java`

```java
/**
 * 输出 TeamFlow 任务数量和优先级的分支结果。
 */
public final class TeamFlowBranchingApplication {
    /**
     * 根据固定的任务数量和优先级代码输出看板状态。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        int pendingTaskCount = 3;
        String boardStatus;

        if (pendingTaskCount == 0) {
            boardStatus = "已清空";
        } else if (pendingTaskCount <= 3) {
            boardStatus = "可以开始";
        } else {
            boardStatus = "需要安排";
        }

        int priorityCode = 2;
        String priorityLabel = switch (priorityCode) {
            case 1 -> "普通";
            case 2 -> {
                String result = "紧急";
                yield result;
            }
            default -> "未分类";
        };

        System.out.println("待处理任务：" + pendingTaskCount);
        System.out.println("看板状态：" + boardStatus);
        System.out.println("任务优先级：" + priorityLabel);
    }
}
```

在 IntelliJ IDEA 中新建普通 Java 项目或打开已有的 JDK 25 学习项目，确认 **Project SDK** 和当前运行配置的
JRE 都是 JDK 25。创建同名 Java 文件，粘贴代码后从 `main` 左侧运行图标启动。控制台应输出：

```text
待处理任务：3
看板状态：可以开始
任务优先级：紧急
```

### 2. Java 8 对应的完整程序

Java 8 项目中，`if/else if/else` 不需要改变；唯一的真实差异是优先级选择不能使用 `switch expression`。
下面给出完整可运行文件，传统 `switch` 先给 `priorityLabel` 赋值，再在每个不需要贯穿的分支写 `break`。

文件：`TeamFlowBranchingApplication.java`

```java
/**
 * 输出 TeamFlow 任务数量和优先级的 Java 8 分支结果。
 */
public final class TeamFlowBranchingApplication {
    /**
     * 根据固定的任务数量和优先级代码输出看板状态。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        int pendingTaskCount = 3;
        String boardStatus;

        if (pendingTaskCount == 0) {
            boardStatus = "已清空";
        } else if (pendingTaskCount <= 3) {
            boardStatus = "可以开始";
        } else {
            boardStatus = "需要安排";
        }

        int priorityCode = 2;
        String priorityLabel;
        switch (priorityCode) {
            case 1:
                priorityLabel = "普通";
                break;
            case 2:
                priorityLabel = "紧急";
                break;
            default:
                priorityLabel = "未分类";
        }

        System.out.println("待处理任务：" + pendingTaskCount);
        System.out.println("看板状态：" + boardStatus);
        System.out.println("任务优先级：" + priorityLabel);
    }
}
```

在 IntelliJ IDEA 的 **File | Project Structure | Project** 选择已经安装的 JDK 8 作为 **Project SDK**，再到
当前 Application 运行配置把 JRE 设为 **Project SDK**。运行同名类后，预期输出与 JDK 25 完全相同：

```text
待处理任务：3
看板状态：可以开始
任务优先级：紧急
```

### 3. 按执行顺序解释三行输出

程序首先根据 `pendingTaskCount` 选择 `boardStatus`。值为 `3`，第一个条件不成立，第二个条件成立，所以
得到 `可以开始`。然后根据 `priorityCode` 选择 `priorityLabel`：JDK 25 在 `case 2` 的块中 `yield` 出
`紧急`，Java 8 则在 `case 2` 赋值后由 `break` 结束传统 `switch`。

最后三条 `System.out.println` 只读取已经确定的变量值并显示它们。把 `pendingTaskCount` 改为 `0`，先
预测第二行会变成什么，再运行确认；把 `priorityCode` 改成 `9`，确认第三行走入 `default` 并输出 `未分类`。

## 七、练习：给发布看板选择提示

### 1. 任务与验收

:::exercise
### 给发布看板选择提示

**要求：** 创建 `TeamFlowReleaseDecision.java`。固定 `openTaskCount = 1` 和 `priorityCode = 2`，用 if/else if/else 产生发布提示，用 JDK 25 的 switch expression 产生优先级文字。代码输出待处理任务数、发布提示和优先级三行。

**验收：** JDK 25 版的输出依次为 `待处理任务：1`、`发布提示：可发布`、`优先级：高`。Java 8 版必须把优先级部分改写为传统 switch，仍得到相同三行；两个版本都保留完整 `public static void main(String[] args)` 入口，不使用循环、框架或输入。

**参考答案：** 先独立写出条件的顺序和每个固定优先级的结果，再与下面的两份完整实现逐行对照。
:::

### 2. JDK 25 完整参考实现

```java
/**
 * 为 TeamFlow 发布看板选择提示和优先级文字。
 */
public final class TeamFlowReleaseDecision {
    /**
     * 输出待处理任务数量对应的发布提示。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        int openTaskCount = 1;
        String releaseHint;

        if (openTaskCount == 0) {
            releaseHint = "没有待处理任务";
        } else if (openTaskCount == 1) {
            releaseHint = "可发布";
        } else {
            releaseHint = "先处理任务";
        }

        int priorityCode = 2;
        String priorityLabel = switch (priorityCode) {
            case 1 -> "普通";
            case 2 -> "高";
            default -> "未分类";
        };

        System.out.println("待处理任务：" + openTaskCount);
        System.out.println("发布提示：" + releaseHint);
        System.out.println("优先级：" + priorityLabel);
    }
}
```

在 JDK 25 项目中确认 Project SDK 与 Application JRE 都为 JDK 25，运行 `TeamFlowReleaseDecision`。输出应为：

```text
待处理任务：1
发布提示：可发布
优先级：高
```

### 3. Java 8 完整参考实现

Java 8 版不认识 arrow rule，所以只把优先级选择改为传统 `switch`；完整代码如下：

```java
/**
 * 为 TeamFlow 发布看板选择 Java 8 兼容的提示和优先级文字。
 */
public final class TeamFlowReleaseDecision {
    /**
     * 输出待处理任务数量对应的发布提示。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        int openTaskCount = 1;
        String releaseHint;

        if (openTaskCount == 0) {
            releaseHint = "没有待处理任务";
        } else if (openTaskCount == 1) {
            releaseHint = "可发布";
        } else {
            releaseHint = "先处理任务";
        }

        int priorityCode = 2;
        String priorityLabel;
        switch (priorityCode) {
            case 1:
                priorityLabel = "普通";
                break;
            case 2:
                priorityLabel = "高";
                break;
            default:
                priorityLabel = "未分类";
        }

        System.out.println("待处理任务：" + openTaskCount);
        System.out.println("发布提示：" + releaseHint);
        System.out.println("优先级：" + priorityLabel);
    }
}
```

在 Java 8 项目中确认 Project SDK 与 Application JRE 都为 JDK 8，运行同名类。预期输出仍是：

```text
待处理任务：1
发布提示：可发布
优先级：高
```

### 4. 自我检查

完成后把 `openTaskCount` 依次改为 `0` 和 `4`，先写下你预期的第二行，再运行验证。再把 `priorityCode`
改为 `9`，确认两个版本都由 `default` 输出 `未分类`。若 Java 8 版本无法编译，先检查是否仍保留 `->` 或
`yield`，不要改变 `if/else if/else` 的条件顺序来回避版本差异。

## 八、把路径选择写得可预测

### 1. 回顾本课的判断顺序

- 用产生布尔结果的 `if` 选择条件路径，按从具体到一般的顺序书写 `else if`。
- 用大括号让嵌套关系和 `else` 的归属一眼可见。
- 用传统 `switch` 处理固定代码，并明确每个冒号 `case` 是否需要 `break` 防止贯穿。
- 在 JDK 25 中，值选择可以使用穷尽的 `switch expression`、arrow rule 和 `yield`；Java 8 则使用传统
  `switch` 完成同一结果。

条件分支解决的是“这一次应该走哪条路径”。下一课才会讨论同一段路径何时需要重复执行。
