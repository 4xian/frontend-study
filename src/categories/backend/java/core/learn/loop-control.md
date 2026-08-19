---
id: backend.java.learn.basics.loop-control
type: lesson
title: 循环控制
summary: 使用 while、do-while、for、break 和 continue 控制 TeamFlow 中有终点的重复过程
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 75
prerequisites:
  - backend.java.learn.basics.control-flow
objectives:
  - 能从初始状态、继续条件、循环体和状态推进四个部分推演一次循环。
  - 能根据判断时机选择 while、do-while 或传统 for，并预测循环体执行次数。
  - 能使用 break 结束循环、使用 continue 跳过当前一轮，并识别它们在嵌套循环中的目标。
  - 能为循环写出可验证的终止条件，避免无限循环和边界多一次或少一次。
  - 能解释 JDK 25 与 Java 8 的基础循环语义相同，并在 Java 8 中把 var 改为显式类型。
  - 能定位额外分号、漏写推进、continue 跳过推进和混淆 break/continue 等常见问题。
recap:
  - while 先判断再执行，可能执行零次；do-while 先执行再判断，至少执行一次。
  - 传统 for 按初始化、条件、循环体、更新的顺序推进，适合次数或边界清楚的重复过程。
  - break 结束目标循环，continue 只结束当前一轮；无标签写法只影响最内层循环。
  - 每个循环都应能指出状态如何接近终点，边界要从期望处理的值推导，而不是凭感觉选择小于号。
  - JDK 25 与 Java 8 的基础循环合同一致；Java 8 不支持在循环初始化器中使用 var。
related: []
tags:
  - Java
  - 循环控制
  - while
  - for
  - break
  - continue
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 在 var 的对应写法处说明
verifiedAt: 2026-08-17
sources:
  - id: jls-25-iteration-statements
    title: Java Language Specification 25 - Blocks, Statements, and Patterns
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25，§14.12 至 §14.16
    claims:
      - while、do 和传统 for 的语法、布尔条件、执行顺序与终止规则。
      - break 与 continue 的目标以及传统 for 遇到 continue 后仍执行更新部分的规则。
      - JDK 25 可以在传统 for 的局部变量声明中使用 var。
  - id: jls-8-iteration-statements
    title: Java Language Specification 8 - Blocks and Statements
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8，§14.12 至 §14.16
    claims:
      - Java 8 的 while、do、传统 for、break 和 continue 与本课基础合同一致。
      - Java 8 的局部变量声明语法不支持 var 类型推断。
  - id: dev-java-controlling-flow
    title: Control Flow Statements
    url: https://dev.java/learn/language-basics/controlling-flow
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java Java 语言基础
    claims:
      - while、do-while 和 for 的官方入门解释与典型使用边界。
      - for 循环变量的作用域以及 break、continue 的基本行为。
  - id: stack-overflow-off-by-one
    title: What is an off-by-one error and how do I fix it?
    url: https://stackoverflow.com/questions/2939869/what-is-an-off-by-one-error-and-how-do-i-fix-it
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: 循环边界的通用初学者误区
    claims:
      - 初始值或结束条件写错会让循环多执行一次或少执行一次。
  - id: stack-overflow-continue-counter
    title: "Why is 'continue' statement ignoring the loop counter increment in 'while' loop, but not in 'for' loop?"
    url: https://stackoverflow.com/questions/16598222/why-is-continue-statement-ignoring-the-loop-counter-increment-in-while-loop
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java while 与传统 for 的 continue 行为
    claims:
      - while 中的 continue 可能跳过写在循环体末尾的手动推进，而传统 for 会进入更新部分。
  - id: stack-overflow-while-semicolon
    title: while loop with semicolon java
    url: https://stackoverflow.com/questions/51303439/while-loop-with-semicolon-java
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 循环头后额外分号的初学者误区
    claims:
      - 循环头后的分号会成为空语句，并改变学习者以为的循环体边界。
---

# 循环控制

TeamFlow 的任务看板会遇到很多“继续做，直到满足条件”的小过程：逐个检查三条待办、最多尝试三次同步，
或者跳过暂时不能处理的一轮。条件分支只能选择一次路径；循环则让同一段语句按清楚的规则重复。

本课只使用已经学过的变量、表达式和条件分支，处理有明确边界的计数过程。数组遍历、增强 `for`、集合、
Stream、方法抽取、异常重试和并发任务都有自己的后续课程，这里不提前展开。

## 一、先看清一次循环如何推进

### 1. 循环由四个相互配合的部分组成

一个可控循环至少要回答四个问题：开始时状态是什么，什么条件下继续，每一轮执行什么，以及哪条语句让
状态接近终点。下面的 `while` 从第 `1` 条任务开始，每轮输出后把编号增加 `1`：

```java
int taskNumber = 1;

while (taskNumber <= 3) {
    System.out.println("检查任务：" + taskNumber);
    taskNumber++;
}
```

输出为：

```text
检查任务：1
检查任务：2
检查任务：3
```

`taskNumber = 1` 是初始状态，`taskNumber <= 3` 是继续条件，打印语句是本轮动作，`taskNumber++` 是状态
推进。第三轮结束后变量变为 `4`，下一次判断得到 `false`，循环自然结束。少了推进语句，条件会一直为
`true`，程序就没有到达终点的路径。

### 2. 条件决定次数，花括号决定循环体

循环条件必须产生 `boolean` 或 `Boolean`。条件为 `true` 时执行花括号内的整个块；块结束后，程序回到
对应循环的继续点，再决定是否开始下一轮。条件为 `false` 时，程序进入循环后的第一条语句。

初学阶段始终保留大括号。Java 虽然允许循环体只写一条语句，但新增第二条语句时很容易误以为它也会重复。
循环头、花括号和缩进共同表达真正边界，不能只靠肉眼看到的对齐判断。

### 3. 先写出期望值，再推导边界

如果期望处理任务编号 `1、2、3`，起点是 `1`，终点 `3` 也要被处理，因此条件是 `taskNumber <= 3`。
如果期望处理“从 `0` 开始的三次”，合法值是 `0、1、2`，条件则是 `attempt < 3`。

不要把 `<` 或 `<=` 当成固定偏好。先列出第一轮和最后一轮应该使用的值，再选择能包含这些值、又能在下一
个值停止的条件。这样才能从需求解释循环次数。

## 二、用 `while` 和 `do-while` 控制未知次数

### 1. `while` 在每轮开始前判断

`while` 适合“可能一次也不用做”的过程。程序先判断条件，只有结果为 `true` 才进入循环体：

```java
/**
 * 使用 while 检查 TeamFlow 待处理任务。
 */
public final class WhileTaskDemo {
    /**
     * 输出从第一条到最后一条待处理任务的编号。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        int pendingTaskCount = 3;
        int taskNumber = 1;

        while (taskNumber <= pendingTaskCount) {
            System.out.println("检查任务：" + taskNumber);
            taskNumber++;
        }

        System.out.println("检查结束");
    }
}
```

前三行依次输出任务编号，最后输出 `检查结束`。把 `pendingTaskCount` 改成 `0` 后，首次判断
`1 <= 0` 就是 `false`，循环体执行零次，但循环后的结束提示仍会输出。这正是 `while` 的入口检查特征。

### 2. `do-while` 保证先执行一次

有些过程无论条件如何都需要先做一次，再决定是否重复。`do-while` 先执行 `do` 块，最后才判断条件，所以
循环体至少执行一次：

```java
/**
 * 使用 do-while 完成至少一次 TeamFlow 同步尝试。
 */
public final class DoWhileSyncDemo {
    /**
     * 输出一次同步尝试并在块末判断是否继续。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        int attempt = 1;
        int maxAttempts = 1;

        do {
            System.out.println("同步尝试：" + attempt);
            attempt++;
        } while (attempt <= maxAttempts);
    }
}
```

输出只有 `同步尝试：1`。循环体执行后 `attempt` 变为 `2`，底部条件得到 `false`，因此不再重复。注意
`while (条件)` 后面的分号是 `do-while` 语法的一部分，不能删除。

### 3. 根据第一次判断发生的位置做选择

需要先确认“是否还有任务”时用 `while`，因为零条任务应该执行零次。必须先尝试一次再决定是否重试时用
`do-while`，因为第一次动作不依赖底部条件。

两种循环都不是“知道次数”和“不知道次数”的绝对分类。真正区别是第一次条件判断发生在循环体之前还是
之后。无论选择哪一种，都必须能指出哪个状态会变化，以及什么值让条件最终变为 `false`。

## 三、用传统 `for` 集中表达计数过程

### 1. 三个位置分别负责初始化、条件和更新

次数或数值范围清楚时，传统 `for` 把计数器的三个部分集中在循环头：

```java
for (int attempt = 1; attempt <= 3; attempt++) {
    System.out.println("发布检查：" + attempt);
}
```

执行顺序是：

1. `int attempt = 1` 只执行一次。
2. 判断 `attempt <= 3`；为 `false` 时直接结束。
3. 条件为 `true` 时执行循环体。
4. 执行 `attempt++`，再回到第二步。

因此输出 `发布检查：1`、`发布检查：2`、`发布检查：3`。第三轮更新后 `attempt` 变为 `4`，下一次判断
结束循环。循环头声明的 `attempt` 只在循环头和循环体范围内可见，循环结束后不能再读取它。

### 2. JDK 25 可以使用 `var`，Java 8 必须写显式类型

JDK 25 可以沿用变量课学过的局部变量类型推断，把初始化器写成 `var attempt = 1`：

```java
for (var attempt = 1; attempt <= 3; attempt++) {
    System.out.println("发布检查：" + attempt);
}
```

初始化值 `1` 让编译器推断 `attempt` 是 `int`，循环执行规则没有改变。Java 8 不支持 `var` 局部变量，
对应代码必须写成完整的 `int attempt = 1`。为了让两个版本的循环逻辑容易比较，本课大部分短示例使用
显式 `int`；末尾完整程序会分别给出两份完整源码。

### 3. 省略部分不是省略终止设计

传统 `for` 的三个部分在语法上都可以省略，例如 `for (;;) { ... }` 会不断重复，直到循环体通过其他路径
结束。初学阶段不要把这种形式当作默认写法。看到没有条件的循环时，必须立即找到可以到达的 `break`，
并说明它在什么状态下发生。

本课的主示例都优先把边界写在循环头，让阅读者直接看出最多执行几次。等待事件、读取资源或服务重试等
开放式循环还涉及资源、异常、超时和并发边界，留到相应课程处理。

## 四、用 `break` 和 `continue` 改变当前循环

### 1. `break` 立即结束目标循环

`break` 适合已经找到结果或满足停止条件，不需要继续剩余轮次的情况：

```java
for (int attempt = 1; attempt <= 5; attempt++) {
    System.out.println("检查轮次：" + attempt);

    if (attempt == 3) {
        System.out.println("已找到可发布版本");
        break;
    }
}

System.out.println("继续执行循环后的语句");
```

程序输出第 `1、2、3` 轮，在第三轮执行 `break` 后不再进入第四轮，而是直接执行循环后的提示。`break`
结束的是循环，不是整个 Java 程序。

### 2. `continue` 只跳过当前一轮的剩余语句

`continue` 表示当前轮不再执行后面的语句，但循环仍有机会进入下一轮：

```java
for (int batch = 1; batch <= 4; batch++) {
    if (batch == 2) {
        System.out.println("跳过批次：" + batch);
        continue;
    }

    System.out.println("处理批次：" + batch);
}
```

输出为：

```text
处理批次：1
跳过批次：2
处理批次：3
处理批次：4
```

第二轮遇到 `continue` 后跳过本轮的处理语句。传统 `for` 随后仍执行循环头的更新部分 `batch++`，再判断
是否开始第三轮。这一点与把推进语句手写在 `while` 循环体末尾不同。

### 3. 无标签写法只影响最内层循环

循环嵌套时，无标签 `break` 和 `continue` 都以最内层循环为目标。下面的 `break` 只结束当前看板的内部
轮次，外层看板循环仍会继续：

```java
for (int board = 1; board <= 2; board++) {
    for (int task = 1; task <= 3; task++) {
        if (task == 2) {
            break;
        }
        System.out.println("看板 " + board + "，任务 " + task);
    }
}
```

输出两行，分别是两个看板的任务 `1`。Java 也支持带标签的 `break` 或 `continue` 去指定外层目标，但标签
会增加阅读负担。本课只要求先能确定无标签写法的最内层目标；确实需要一次结束多层循环时，标签必须紧邻
目标循环，并使用表达意图的名称，不能把它理解成可以跳到任意源码位置的 `goto`。

## 五、把循环终点写成可检查的规则

### 1. 每轮都要保留到达终点的进展

判断一个循环是否可能结束，先找条件中会变化的变量，再检查每一条会返回循环顶部的路径是否保留了推进。
尤其是 `continue` 之前，不能把唯一的更新语句放在一定会被跳过的位置。

对于最多尝试三次的过程，可以使用传统 `for` 把更新固定在循环头；使用 `while` 时，则要让正常路径和
跳过路径都能改变 `attempt`。这不是格式偏好，而是循环能否退出的执行条件。

### 2. `break` 不能替代明确的正常边界

如果循环本来就有固定上限，把上限写进条件，例如 `attempt <= maxAttempts`。`break` 用于提前成功、遇到
明确停止标志等额外路径，不要用一串分散的 `if` 和 `break` 隐藏本来可以直接表达的次数。

反过来，已找到目标后也不要只修改条件变量并让本轮剩余语句继续执行。`break` 能明确表示“当前循环到此
结束”，让循环后的语句成为下一步。

### 3. 社区误区要回到执行顺序验证

**社区补充：** 实际问答中反复出现三类问题：边界让循环多一次或少一次，`while` 中的 `continue` 跳过
手写更新，以及循环头后额外分号形成空语句。它们看起来不同，核对方法却相同：列出初始化、条件、本轮
动作、更新和下一次条件的顺序，再用少量固定值观察输出。下面的易错区会给出可直接对照的代码。

## 六、常见易错情况

:::pitfalls
### 忘记推进导致条件永远成立

**触发条件：** while 条件依赖 attempt，但循环体没有修改 attempt。

**原因：** 每轮结束后仍用同一个值判断，`attempt <= 3` 一直是 true。

**后果：** 程序持续输出同一轮，无法自然到达循环后的语句。

**错误示例：**

```java
int attempt = 1;
while (attempt <= 3) {
    System.out.println("同步尝试：" + attempt);
}
```

**正确写法：**

```java
int attempt = 1;
while (attempt <= 3) {
    System.out.println("同步尝试：" + attempt);
    attempt++;
}
```

**验证方式：** 不要长时间运行错误片段；若误运行并看到 `同步尝试：1` 重复出现，立即在 IDEA 中停止。正确片段只输出 `1、2、3` 三轮并自然结束，JDK 25 与 Java 8 结果相同。

### 边界多一次或少一次

**触发条件：** 期望处理第 1 到第 3 轮，却把结束条件写成 attempt 小于 3。

**原因：** 小于号排除了终点 3，循环只包含 1 和 2。

**后果：** 最后一轮没有执行；另一方向把不应包含的值写进条件时，也可能多执行一轮。

**错误示例：**

```java
for (int attempt = 1; attempt < 3; attempt++) {
    System.out.println(attempt);
}
```

**正确写法：**

```java
for (int attempt = 1; attempt <= 3; attempt++) {
    System.out.println(attempt);
}
```

**验证方式：** 错误片段只输出 `1、2`，正确片段输出 `1、2、3`。先列出期望值再核对条件是否同时包含起点和终点，不根据习惯盲选小于号。

### 循环头后多写分号

**触发条件：** 在 for 循环右括号后立即写分号，再另起一个看似属于循环的代码块。

**原因：** 这个分号本身就是空循环体；后面的花括号只是普通代码块，不会随循环重复。

**后果：** 计数循环空转三次，后面的输出只执行一次，程序行为与缩进造成的印象不同。

**错误示例：**

```java
for (int batch = 1; batch <= 3; batch++);
{
    System.out.println("处理批次");
}
```

**正确写法：**

```java
for (int batch = 1; batch <= 3; batch++) {
    System.out.println("处理批次：" + batch);
}
```

**验证方式：** 错误片段只输出一次 `处理批次`，正确片段输出三个带编号的批次。检查循环右括号与左花括号之间没有分号。

### while 中的 continue 跳过唯一推进语句

**触发条件：** attempt 等于 2 时先执行 continue，而 attempt++ 写在循环体末尾。

**原因：** continue 立即结束当前一轮，末尾的推进语句没有机会执行；下一轮仍从 attempt 等于 2 开始。

**后果：** 循环停在第二轮，无法自然结束。

**错误示例：**

```java
int attempt = 1;
while (attempt <= 3) {
    if (attempt == 2) {
        continue;
    }
    attempt++;
}
```

**正确写法：**

```java
for (int attempt = 1; attempt <= 3; attempt++) {
    if (attempt == 2) {
        continue;
    }
    System.out.println("执行尝试：" + attempt);
}
```

**验证方式：** 错误片段会停在 attempt 等于 2 的状态，不要长时间运行。正确片段由 for 的更新部分推进，输出 `执行尝试：1` 和 `执行尝试：3` 后结束。

### 混淆 break 与 continue

**触发条件：** 只想跳过第二轮，却在条件分支中写 break。

**原因：** break 结束整个目标循环；continue 才是跳过当前轮的剩余语句并尝试下一轮。

**后果：** 第三轮永远不会开始，实际处理数量少于预期。

**错误示例：**

```java
for (int batch = 1; batch <= 3; batch++) {
    if (batch == 2) {
        break;
    }
    System.out.println(batch);
}
```

**正确写法：**

```java
for (int batch = 1; batch <= 3; batch++) {
    if (batch == 2) {
        continue;
    }
    System.out.println(batch);
}
```

**验证方式：** 错误片段只输出 `1`；正确片段输出 `1、3`。如果需求是“找到结果后不再检查”，才应使用 break。

### 漏掉 do-while 末尾分号

**触发条件：** 把 do-while 写成普通 while 块的外观，删除底部条件后的分号。

**原因：** `do Statement while (Expression);` 的末尾分号属于语法，不是可选装饰。

**后果：** JDK 25 与 Java 8 都在编译阶段拒绝源码。

**错误示例：**

```java
int attempt = 1;
do {
    System.out.println(attempt);
    attempt++;
} while (attempt <= 1)
```

**正确写法：**

```java
int attempt = 1;
do {
    System.out.println(attempt);
    attempt++;
} while (attempt <= 1);
```

**验证方式：** 两个版本编译错误片段都应失败；补上分号后都应只输出 `1`，同时证明 do-while 即使底部条件首次为 false 也已经执行过一轮。

:::

## 七、在 TeamFlow 首程序中串联循环

### 1. JDK 25 完整程序

这个普通 Java 程序先逐条检查待办，再至少执行一次同步，最后按批次处理任务。它只使用本课和前置课已经
学过的变量、表达式、条件分支与循环，不读取输入，也不连接 Spring Boot 或数据库。

文件：`TeamFlowLoopApplication.java`

```java
/**
 * 使用多种循环输出 TeamFlow 的任务处理过程。
 */
public final class TeamFlowLoopApplication {
    /**
     * 依次执行任务检查、同步尝试和批次处理。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        int pendingTaskCount = 3;
        int taskNumber = 1;

        while (taskNumber <= pendingTaskCount) {
            System.out.println("检查任务：" + taskNumber);
            taskNumber++;
        }

        var syncAttempt = 1;
        do {
            System.out.println("同步尝试：" + syncAttempt);
            syncAttempt++;
        } while (syncAttempt <= 1);

        int processedBatchCount = 0;
        for (var batch = 1; batch <= 5; batch++) {
            if (batch == 2) {
                System.out.println("跳过批次：" + batch);
                continue;
            }
            if (batch == 5) {
                System.out.println("停止批次：" + batch);
                break;
            }

            processedBatchCount++;
            System.out.println("处理批次：" + batch);
        }

        System.out.println("已检查任务：" + pendingTaskCount);
        System.out.println("已处理批次：" + processedBatchCount);
    }
}
```

在 IntelliJ IDEA 中打开现有 JDK 25 学习项目，确认 **Project SDK** 与当前 Application 运行配置的 JRE
都是 JDK 25。创建同名 Java 文件，从 `main` 左侧运行图标启动，控制台应输出：

```text
检查任务：1
检查任务：2
检查任务：3
同步尝试：1
处理批次：1
跳过批次：2
处理批次：3
处理批次：4
停止批次：5
已检查任务：3
已处理批次：3
```

### 2. Java 8 对应的完整程序

Java 8 的循环结构、执行顺序、`break` 和 `continue` 都不需要改写。真实差异只是 Java 8 不认识局部变量
`var`，因此把 `syncAttempt` 和 `batch` 的声明改为显式 `int`。完整代码如下：

文件：`TeamFlowLoopApplication.java`

```java
/**
 * 使用 Java 8 兼容循环输出 TeamFlow 的任务处理过程。
 */
public final class TeamFlowLoopApplication {
    /**
     * 依次执行任务检查、同步尝试和批次处理。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        int pendingTaskCount = 3;
        int taskNumber = 1;

        while (taskNumber <= pendingTaskCount) {
            System.out.println("检查任务：" + taskNumber);
            taskNumber++;
        }

        int syncAttempt = 1;
        do {
            System.out.println("同步尝试：" + syncAttempt);
            syncAttempt++;
        } while (syncAttempt <= 1);

        int processedBatchCount = 0;
        for (int batch = 1; batch <= 5; batch++) {
            if (batch == 2) {
                System.out.println("跳过批次：" + batch);
                continue;
            }
            if (batch == 5) {
                System.out.println("停止批次：" + batch);
                break;
            }

            processedBatchCount++;
            System.out.println("处理批次：" + batch);
        }

        System.out.println("已检查任务：" + pendingTaskCount);
        System.out.println("已处理批次：" + processedBatchCount);
    }
}
```

在 IntelliJ IDEA 的 **File | Project Structure | Project** 中选择已安装的 JDK 8 作为 **Project SDK**，
并确认当前 Application 运行配置的 JRE 使用 **Project SDK**。运行同名类后，预期输出与 JDK 25 完全
相同。

### 3. 按状态变化解释完整输出

第一个 `while` 让 `taskNumber` 从 `1` 增加到 `4`，因此恰好输出三条任务。`do-while` 先输出第一次
同步，再把 `syncAttempt` 增加为 `2`；底部条件为 `false`，所以只执行一次。

最后的 `for` 从批次 `1` 开始。批次 `2` 执行 `continue`，因此不计入处理数量；批次 `3、4` 正常处理；
批次 `5` 执行 `break`，不再进入后续轮次。真正完成处理的是 `1、3、4` 三个批次，最终计数为 `3`。

## 八、练习：完成发布前倒序检查

### 1. 任务与验收

:::exercise
### 完成发布前倒序检查

**要求：** 创建 `TeamFlowReleaseLoop.java`。使用 while 把剩余任务数从 3 倒序输出到 1；使用 do-while 完成两次准备检查；使用传统 for 从第 1 轮开始检查，跳过 5 之前的偶数轮，在第 5 轮停止，并统计真正发布的轮次。JDK 25 版至少在一个循环初始化器中使用 var，Java 8 版使用显式 int。

**验收：** 两个版本都依次输出剩余任务 3、2、1，两次准备检查，发布轮次 1、跳过轮次 2、发布轮次 3、跳过轮次 4、停止轮次 5，最后输出 `已发布轮次：2`；程序必须自然结束，不能使用数组、集合、输入、方法抽取或框架。

**参考答案：** 先分别写出递减状态、底部判断次数以及偶数轮和停止轮的控制路径，再与下面两份完整实现逐行对照。
:::

### 2. JDK 25 完整参考实现

```java
/**
 * 生成 TeamFlow 发布前的循环检查记录。
 */
public final class TeamFlowReleaseLoop {
    /**
     * 输出剩余任务、准备检查和发布轮次。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        int remainingTaskCount = 3;
        while (remainingTaskCount > 0) {
            System.out.println("剩余任务：" + remainingTaskCount);
            remainingTaskCount--;
        }

        int preparationCheck = 1;
        do {
            System.out.println("准备检查：" + preparationCheck);
            preparationCheck++;
        } while (preparationCheck <= 2);

        int releasedRoundCount = 0;
        for (var round = 1; round <= 6; round++) {
            if (round == 5) {
                System.out.println("停止轮次：" + round);
                break;
            }
            if (round % 2 == 0) {
                System.out.println("跳过轮次：" + round);
                continue;
            }

            releasedRoundCount++;
            System.out.println("发布轮次：" + round);
        }

        System.out.println("已发布轮次：" + releasedRoundCount);
    }
}
```

在 JDK 25 项目中运行 `TeamFlowReleaseLoop`，预期输出：

```text
剩余任务：3
剩余任务：2
剩余任务：1
准备检查：1
准备检查：2
发布轮次：1
跳过轮次：2
发布轮次：3
跳过轮次：4
停止轮次：5
已发布轮次：2
```

### 3. Java 8 完整参考实现

Java 8 版只把 `var round` 改为 `int round`，完整代码如下：

```java
/**
 * 生成 Java 8 兼容的 TeamFlow 发布前循环检查记录。
 */
public final class TeamFlowReleaseLoop {
    /**
     * 输出剩余任务、准备检查和发布轮次。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        int remainingTaskCount = 3;
        while (remainingTaskCount > 0) {
            System.out.println("剩余任务：" + remainingTaskCount);
            remainingTaskCount--;
        }

        int preparationCheck = 1;
        do {
            System.out.println("准备检查：" + preparationCheck);
            preparationCheck++;
        } while (preparationCheck <= 2);

        int releasedRoundCount = 0;
        for (int round = 1; round <= 6; round++) {
            if (round == 5) {
                System.out.println("停止轮次：" + round);
                break;
            }
            if (round % 2 == 0) {
                System.out.println("跳过轮次：" + round);
                continue;
            }

            releasedRoundCount++;
            System.out.println("发布轮次：" + round);
        }

        System.out.println("已发布轮次：" + releasedRoundCount);
    }
}
```

把 Project SDK 和运行配置 JRE 都切换为 JDK 8，运行 `TeamFlowReleaseLoop`。控制台应得到与 JDK 25
相同的十一行输出。若输出次数不同，回到递减状态、底部条件、偶数判断、`continue`、`break` 和更新位置
逐步核对。

完成后，你应该能够不运行代码就说明每一轮使用的状态、下一轮如何到达、何时自然结束，以及提前跳转的
目标。下一课会把这些成段的行为命名为方法；本课到此不提前展开方法定义、参数或返回值。
