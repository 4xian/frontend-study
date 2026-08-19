---
id: backend.java.learn.basics.command-line-task-manager-project
type: lesson
title: 实战：命令行任务清单
summary: 综合条件、循环、方法、参数、数组和字符串，完成一个固定容量的 TeamFlow 命令行任务清单
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 120
prerequisites:
  - backend.java.learn.basics.strings-encoding-and-text-matching
objectives:
  - 能用 String[]、boolean[] 和 taskCount 表达固定容量任务清单的状态。
  - 能用 Scanner 逐行读取输入，并解析 add、list、done 和 exit 四条命令。
  - 能把容量、编号、空标题和重复完成等边界转成清楚的控制分支。
  - 能把条件、循环、方法、参数、数组和字符串连接成一个可运行的单类程序。
  - 能分别运行 JDK 25 与 Java 8 版本，并解释两版空白处理 API 的真实差异。
recap:
  - titles、completed 和 taskCount 共同维护固定容量任务清单，两个数组的同一索引表示同一任务。
  - hasNextLine 与 nextLine 组成逐行输入循环，命令和参数从同一行中解析。
  - add 先检查标题和容量，list 只遍历已使用区间，done 先校验用户编号再换算数组索引。
  - 未知命令、非法编号、重复完成和输入结束都给出可观察结果，且不破坏已有状态。
  - JDK 25 使用 strip、isBlank，Java 8 使用 trim、isEmpty；传统 main 入口在两版中都可运行。
related: []
tags:
  - Java
  - 命令行程序
  - Scanner
  - 数组
  - 综合实战
appliesTo: Java 25；兼容示例适用于 Java 8
verifiedAt: 2026-08-17
sources:
  - id: java-25-scanner-api
    title: Java SE 25 API - Scanner
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Scanner.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - hasNextLine 不推进扫描位置，nextLine 返回当前行余下内容且不包含行分隔符
      - 没有可读行时 nextLine 会失败，逐行循环应先检查 hasNextLine
  - id: java-8-scanner-api
    title: Java SE 8 API - Scanner
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Scanner.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 支持相同的 hasNextLine 与 nextLine 逐行读取合同
  - id: java-25-integer-api
    title: Java SE 25 API - Integer
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Integer.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - Integer.parseInt 把合法十进制文本解析为 int，非法文本不能得到编号
  - id: java-8-integer-api
    title: Java SE 8 API - Integer
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/Integer.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 的 Integer.parseInt 具备本课使用的相同十进制解析合同
  - id: dev-java-arrays
    title: Dev.java - Creating Arrays in Your Programs
    url: https://dev.java/learn/creating-arrays-in-your-programs
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java SE
    claims:
      - 数组保存固定数量的同类型值，长度在创建时确定且不会改变
  - id: oracle-java-arrays-tutorial
    title: Oracle Java Tutorials - Arrays
    url: https://docs.oracle.com/javase/tutorial/java/nutsandbolts/arrays.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java 8 数组基础语义；同样适用于 Java 25
    claims:
      - 数组索引从 0 开始，循环访问时必须保持在合法索引范围内
  - id: dev-java-control-flow
    title: Dev.java - Control Flow Statements
    url: https://dev.java/learn/language-basics/controlling-flow
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java SE
    claims:
      - while 根据布尔条件重复执行，for 适合遍历明确的索引范围
  - id: java-25-string-api
    title: Java SE 25 API - String
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - equalsIgnoreCase、indexOf、substring、strip 与 isBlank 支撑命令解析和空白校验
      - strip 与 isBlank 自 Java 11 起提供
  - id: java-8-string-api
    title: Java SE 8 API - String
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/String.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 提供 equalsIgnoreCase、indexOf、substring、trim 与 isEmpty
      - trim 的空白范围与 JDK 25 的 strip 不完全相同
  - id: jls-25-main-method
    title: Java Language Specification 25 - Invoke a main Method
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html#jls-12.1.4
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - public static void main(String[] args) 仍是 Java 25 可直接调用的入口形式
  - id: jls-8-main-method
    title: Java Language Specification 8 - Invoke Test.main
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-12.html#jls-12.1.4
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 支持 public static void main(String[] args) 传统入口
  - id: stackoverflow-scanner-nextline
    title: Scanner is skipping nextLine after using next or nextFoo
    url: https://stackoverflow.com/questions/13102045/scanner-is-skipping-nextline-after-using-next-or-nextfoo
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java Scanner 混用 token 读取与整行读取的常见初学者问题
    claims:
      - 混用 nextInt 等 token 读取与 nextLine 容易让下一次整行读取看似被跳过
      - 统一 nextLine 后再解析数字是一条可复现的简化方案
---

# 实战：命令行任务清单

到目前为止，条件、循环、方法、参数、数组和字符串都已经分别出现过。本课把它们放进同一个小程序：
用户在控制台输入命令，TeamFlow 在内存中保存最多五项任务，并立即显示添加、查看和完成操作的结果。

这仍然是一个普通 Java 单类程序。任务只在本次运行期间存在，不使用对象模型、集合、文件、Maven、
测试框架或 Spring Boot。重点是让前面的语法第一次形成一条完整、可观察的工作流。

## 一、先确定程序保存什么状态

### 1. 四条命令组成最小工作流

程序只识别下面四种输入：

| 命令 | 例子 | 结果 |
| --- | --- | --- |
| `add <标题>` | `add 完成登录页联调` | 在清单末尾添加一项待办任务 |
| `list` | `list` | 按编号列出已有任务和统计 |
| `done <编号>` | `done 1` | 把指定任务标记为已完成 |
| `exit` | `exit` | 正常结束输入循环 |

命令故意保持很少。`edit`、`delete`、搜索、持久化和网络请求都会引出新的独立能力，不属于这次语法
综合练习。

### 2. 两个数组按同一索引保存一项任务

`titles[index]` 保存标题，`completed[index]` 保存完成状态。两个数组的同一个索引必须始终描述同一
项任务：

```java
String[] titles = new String[5];
boolean[] completed = new boolean[5];

titles[0] = "完成登录页联调";
completed[0] = false;
```

这是一组固定容量的并行数组。创建后长度就是 5，不会自动扩容；清单满时，程序应拒绝新增，而不是
写入不存在的索引。

### 3. taskCount 划出真正使用的区间

数组长度表示最多能放多少项，`taskCount` 表示现在已经放了多少项。初始值为 0；添加第一项后为 1，
此时只有索引 0 属于已使用区间。

```java
int taskCount = 0;

titles[taskCount] = "完成登录页联调";
completed[taskCount] = false;
taskCount++;
```

因此三个状态必须一起理解：

- `titles.length` 是固定容量 5；
- 合法任务数据位于 `0` 到 `taskCount - 1`；
- 下一个可写位置是 `taskCount`，但前提是 `taskCount < titles.length`。

空字符串或 `null` 不承担计数职责。程序只信任 `taskCount`，这样列表循环和容量判断都有明确边界。

## 二、从控制台逐行读取命令

### 1. hasNextLine 与 nextLine 配合处理输入

`Scanner` 可以从 `System.in` 读取控制台输入。本课每条命令占一整行，所以循环先用 `hasNextLine()`
判断是否还有一行，再用 `nextLine()` 取得不含行尾分隔符的文本：

```java
Scanner scanner = new Scanner(System.in);

while (scanner.hasNextLine()) {
    String input = scanner.nextLine();
    System.out.println("收到：" + input);
}
```

用户按回车后，`nextLine()` 返回刚才输入的整行并把读取位置移到下一行开头。若标准输入结束，
`hasNextLine()` 返回 `false`，循环可以自然退出；无条件调用 `nextLine()` 则可能在没有下一行时失败。

### 2. 只在第一个空格处分开命令和参数

任务标题可能包含多个空格，不能把整行按所有空格拆碎。先寻找第一个空格：它前面是命令，后面完整
保留为参数。

```java
String input = "add 完成 登录页 联调";
int separator = input.indexOf(' ');
String command = separator == -1 ? input : input.substring(0, separator);
String argument = separator == -1 ? "" : input.substring(separator + 1).strip();

System.out.println(command); // add
System.out.println(argument); // 完成 登录页 联调
```

精确命令还要检查参数是否为空。例如 `list extra` 不是 `list`；`addx 标题` 也不能因为看起来以
`add` 开头就被当作新增任务。

### 3. JDK 25 与 Java 8 的空白处理不同

JDK 25 使用 `strip()` 清理首尾空白，用 `isBlank()` 拒绝空行和只有空白的标题。Java 8 没有这两个
方法，对本课常见的控制台空格使用 `trim()` 和 `isEmpty()`：

```java
// JDK 25
String modernInput = scanner.nextLine().strip();
boolean modernBlank = modernInput.isBlank();

// Java 8
String legacyInput = scanner.nextLine().trim();
boolean legacyBlank = legacyInput.isEmpty();
```

`trim()` 处理的字符范围与 `strip()` 的 Unicode 空白定义不完全相同，所以 Java 8 写法是本课输入的
兼容实现，不是所有文本上完全等价的替代品。

### 4. 整行读取后再解析编号

`done 2` 也是一整行。程序先取出参数文本，确认它是本课容量范围内的一位正整数形式，再用
`Integer.parseInt()` 得到编号：

```java
String numberText = "2";
char digit = numberText.charAt(0);
boolean valid = numberText.length() == 1 && digit >= '1' && digit <= '9';

if (valid) {
    int taskNumber = Integer.parseInt(numberText);
    System.out.println(taskNumber); // 2
}
```

这条路径不会把 `nextInt()` 混进输入循环，也不会让非法文本直接进入数组索引。编号格式正确之后，仍要
继续判断任务是否真的存在。

**社区补充：** Stack Overflow 的真实问题记录了一个常见现象：先用 `nextInt()` 或 `next()` 读取
token，再调用 `nextLine()` 时，后者可能立即读到前一步留下的行尾，表现得像“跳过了一次输入”。这个
现象在 Java 8 与 JDK 25 的 Scanner 合同下都成立。本课已用两个版本验证“统一 `nextLine()`，再解析
数字”的流程，因此完整程序不混用两套读取方式。

## 三、让每条命令只改变应改变的状态

### 1. add 先检查容量再写两个数组

添加方法接收数组、当前数量和标题。容量已满时返回原数量；成功时同时写入标题和 `false` 状态，再
返回新数量。

```java
/**
 * 在固定容量数组的下一个空位置添加任务。
 *
 * @param titles 任务标题数组
 * @param completed 任务完成状态数组
 * @param taskCount 当前任务数量
 * @param title 新任务标题
 * @return 添加成功后的任务数量；容量已满时返回原数量
 */
static int addTask(String[] titles, boolean[] completed, int taskCount, String title) {
    if (taskCount >= titles.length) {
        return taskCount;
    }
    titles[taskCount] = title;
    completed[taskCount] = false;
    return taskCount + 1;
}
```

调用方比较返回值与旧数量，就能区分“添加成功”和“容量已满”。方法不隐藏计数变化，也不创建新的
数据结构。

### 2. list 只遍历已使用区间

列表循环的边界是 `index < taskCount`，不是整个数组长度。显示给用户的编号从 1 开始，所以输出使用
`index + 1`；数组访问仍使用从 0 开始的 `index`。

```java
for (int index = 0; index < taskCount; index++) {
    String mark = completed[index] ? "[x]" : "[ ]";
    System.out.println("#" + (index + 1) + " " + mark + " " + titles[index]);
}
```

当 `taskCount` 为 0 时，程序明确输出“任务清单为空”。这能区分“清单真的为空”和“程序没有执行”。

### 3. done 先验证用户编号再换算索引

用户看到编号 1，数组使用索引 0。正确顺序是先确认编号在 `1..taskCount`，再计算
`index = taskNumber - 1`，最后访问两个数组：

```java
int taskNumber = 1;
if (taskNumber >= 1 && taskNumber <= taskCount) {
    int index = taskNumber - 1;
    completed[index] = true;
}
```

重复执行 `done 1` 时，状态应继续保持 `true` 并提示“任务已完成”。若写成取反操作，第二次命令反而
会把已完成任务改回待办，这与命令含义不一致。

### 4. 输入循环负责分派，方法负责单一动作

完整程序把添加、完成、列出和用法提示拆成小方法。`main` 保留输入循环和命令分支，因为它需要持有
最新的 `taskCount`。数据流如下：

```text
读取一整行
-> 分出 command 与 argument
-> 校验当前命令的输入
-> 调用数组操作方法
-> 更新 taskCount 或 completed
-> 输出本次结果
-> 等待下一行
```

未知命令只输出提示，不改变数组或计数；`exit` 把循环状态改为 `false`，随后结束程序。

## 四、两个 Java 版本采用同一启动形态

### 1. 传统 main 在两版中都能运行

JDK 25 支持比 Java 8 更简洁的启动形式，但本课不需要这些新版入口。两个版本都采用共同的传统入口：

```java
/**
 * 启动当前命令行程序。
 *
 * @param args 启动参数，本课不使用
 */
public static void main(String[] args) {
    // 从这里开始运行程序
}
```

`public static void` 是固定入口形式，`main` 是入口名称，`String[] args` 接收启动参数。本课不使用启动
参数，也不展开方法修饰符或数组类型的更多规则。

### 2. 版本差异只发生在字符串清理处

数组长度、循环、方法、`Scanner.hasNextLine()`、`Scanner.nextLine()`、`Integer.parseInt()` 和传统
`main` 在本课所需范围内都能使用相同写法。JDK 25 完整程序使用 `strip/isBlank`；Java 8 完整程序使用
`trim/isEmpty`。不能只切换 IDEA 的 JDK，却保留 Java 8 不存在的 API。

### 3. 这次实战不跨越后续课程

任务标题和完成状态直接保存在两个数组中，这是为了综合已经学过的语法。后续课程会分别学习如何用
对象和集合表达更复杂状态；本课不提前把程序改造成那些版本，也不讨论文件保存、异常体系或自动化测试。

## 五、常见错误

:::pitfalls
### 混用 nextInt 和 nextLine

**触发条件：** 先用 `scanner.nextInt()` 读取 `done` 编号，再用 `scanner.nextLine()` 等待下一条命令。

**原因：** token 读取可能把当前行的行尾留在 Scanner 中，下一次 `nextLine()` 会先读到这段剩余内容。

**后果：** 程序看起来跳过一次输入，空命令分支被意外触发，交互节奏与用户操作不一致。

**错误示例：**

```java
int taskNumber = scanner.nextInt();
String nextCommand = scanner.nextLine();
```

**正确写法：**

```java
String numberText = scanner.nextLine().strip();
int taskNumber = Integer.parseInt(numberText);
```

**验证方式：** 依次输入 `1`、回车和 `list`；错误版本第一次 `nextLine()` 得到空的行尾，正确版本每次
都消费一整行。完整程序还会先检查编号文本，再调用 `parseInt`。

### 不检查输入结束就读取下一行

**触发条件：** 循环中无条件调用 `nextLine()`，然后从终端发送 EOF，或用输入文件读取到末尾。

**原因：** `nextLine()` 需要存在下一行；没有可读行时 Scanner 不能返回命令文本。

**后果：** 程序不是按“输入结束”路径退出，而是在读取处失败。

**错误示例：**

```java
while (true) {
    String input = scanner.nextLine();
}
```

**正确写法：**

```java
while (true) {
    if (!scanner.hasNextLine()) {
        break;
    }
    String input = scanner.nextLine();
}
```

**验证方式：** 用只含一行的输入文件运行；正确版本处理一条命令后自然结束，错误版本会继续读取
不存在的下一行。

### 把标题按所有空格拆开

**触发条件：** 用 `input.split(" ")` 取得命令和标题，并假定标题永远只有一个单词。

**原因：** `add` 后面的整段文本才是标题，标题内部空格属于数据，不是新的命令字段。

**后果：** `add 完成 登录页 联调` 只保存“完成”或产生多个意外片段，用户输入被截断。

**错误示例：**

```java
String[] parts = input.split(" ");
String title = parts[1];
```

**正确写法：**

```java
int separator = input.indexOf(' ');
String title = input.substring(separator + 1).strip();
```

**验证方式：** 输入 `add 完成 登录页 联调` 后执行 `list`；正确版本完整显示三个词组成的标题。

### 空标题仍增加 taskCount

**触发条件：** 收到 `add` 或 `add   ` 时，先写数组并增加计数，之后才检查标题。

**原因：** 状态变化发生在输入校验之前，空标题已经占用了一个数组位置。

**后果：** 列表出现没有可识别内容的任务，容量和实际有效任务数不再一致。

**错误示例：**

```java
titles[taskCount] = argument;
taskCount++;
if (argument.isBlank()) {
    System.out.println("任务标题不能为空");
}
```

**正确写法：**

```java
if (argument.isBlank()) {
    System.out.println("任务标题不能为空");
} else {
    titles[taskCount] = argument;
    taskCount++;
}
```

**验证方式：** 对空清单依次输入 `add   ` 和 `list`；正确版本仍输出“任务清单为空”，且下一次有效
添加得到编号 1。

### 容量已满后继续写数组

**触发条件：** 已经保存五项任务，仍直接执行 `titles[taskCount] = title`。

**原因：** 长度为 5 的数组合法索引只有 0 到 4；满容量时 `taskCount` 已经等于 5。

**后果：** 第六次新增访问索引 5，程序在更新清单时失败，已有状态无法继续交互查看。

**错误示例：**

```java
titles[taskCount] = title;
completed[taskCount] = false;
taskCount++;
```

**正确写法：**

```java
if (taskCount < titles.length) {
    titles[taskCount] = title;
    completed[taskCount] = false;
    taskCount++;
}
```

**验证方式：** 连续输入六条不同的 `add` 命令；正确版本保存前五项，第六次明确输出容量已满，随后
`list` 仍显示五项。

### 混淆用户编号和数组索引

**触发条件：** 对用户输入的 `done 1` 直接访问 `completed[1]`，或在验证范围之前访问数组。

**原因：** 用户编号从 1 开始，数组索引从 0 开始，两者相差 1。

**后果：** 完成了错误任务；对最后一项还可能访问越界位置。

**错误示例：**

```java
completed[taskNumber] = true;
```

**正确写法：**

```java
if (taskNumber >= 1 && taskNumber <= taskCount) {
    completed[taskNumber - 1] = true;
}
```

**验证方式：** 只添加一项后输入 `done 1`；正确版本把索引 0 标记完成，再执行 `list` 显示 `#1 [x]`。

### 循环多访问一次或遍历未使用区间

**触发条件：** 列表循环写成 `index <= taskCount`，或总是遍历到 `titles.length`。

**原因：** 已使用区间是左闭右开范围 `[0, taskCount)`，停止位置 `taskCount` 本身不属于任务数据。

**后果：** `<=` 会多访问一次；遍历整个容量则会显示尚未使用的 `null` 标题。

**错误示例：**

```java
for (int index = 0; index <= taskCount; index++) {
    System.out.println(titles[index]);
}
```

**正确写法：**

```java
for (int index = 0; index < taskCount; index++) {
    System.out.println(titles[index]);
}
```

**验证方式：** 只添加一项任务；正确版本循环一次，错误版本还会读取索引 1。空清单时正确循环一次也
不会执行。

### 用 == 或宽松前缀判断命令

**触发条件：** 用 `command == "list"` 比较用户输入，或用 `command.startsWith("add")` 匹配新增命令。

**原因：** `==` 比较引用身份；宽松前缀还会把 `addx` 当成 `add`。

**后果：** 正确命令可能无法命中，错误命令又可能修改任务状态。

**错误示例：**

```java
if (command == "list" || command.startsWith("add")) {
    System.out.println("已识别");
}
```

**正确写法：**

```java
if ("list".equalsIgnoreCase(command)) {
    System.out.println("列出任务");
} else if ("add".equalsIgnoreCase(command)) {
    System.out.println("新增任务");
}
```

**验证方式：** 分别输入运行期读取的 `list` 与 `addx 标题`；正确版本只识别 `list`，并把 `addx` 作为
未知命令且不增加 `taskCount`。

### 非法编号和重复完成改变了状态

**触发条件：** `done x`、`done 8` 或再次执行 `done 1` 时，未验证就访问数组，或用
`completed[index] = !completed[index]` 修改状态。

**原因：** 文本能否解析、编号是否存在、任务是否已完成是三个不同条件；`done` 的含义也不是切换状态。

**后果：** 非法输入可能导致读取错误位置，重复命令则把已完成任务改回待办。

**错误示例：**

```java
int taskNumber = Integer.parseInt(argument);
completed[taskNumber - 1] = !completed[taskNumber - 1];
```

**正确写法：**

```java
if (!hasTaskNumberFormat(argument)) {
    System.out.println("任务编号格式错误");
} else {
    int taskNumber = Integer.parseInt(argument);
    if (taskNumber > taskCount) {
        System.out.println("任务不存在");
    } else if (completed[taskNumber - 1]) {
        System.out.println("任务已完成");
    } else {
        completed[taskNumber - 1] = true;
    }
}
```

**验证方式：** 添加一项后依次输入 `done x`、`done 8`、`done 1`、`done 1` 和 `list`；前两条不改变
状态，第一次合法命令标记完成，第二次只提示已完成，最终仍显示 `[x]`。

### 在 Java 8 中保留 strip 和 isBlank

**触发条件：** IDEA 已把 Project SDK 改成 Java 8，源码仍调用 `input.strip()` 或 `input.isBlank()`。

**原因：** 这两个 String 方法自 Java 11 才提供，Java 8 API 中不存在。

**后果：** 兼容版在编译阶段无法通过，不能开始读取命令。

**错误示例：**

```java
String input = scanner.nextLine().strip();
if (input.isBlank()) {
    System.out.println("命令不能为空");
}
```

**正确写法：**

```java
String input = scanner.nextLine().trim();
if (input.isEmpty()) {
    System.out.println("命令不能为空");
}
```

**验证方式：** 分别用 JDK 25 编译现代版、Java 8 编译兼容版；两版对普通空格输入都输出“命令不能为空”，
Java 8 源码中不出现 `strip/isBlank`。

:::

## 六、运行 JDK 25 完整程序

### 1. 在 IDEA 中创建和配置程序

1. 在 IntelliJ IDEA 中打开此前的普通 Java 学习项目，把 Project SDK 和当前模块 SDK 都设为 JDK 25。
2. 在 `src` 下创建 Java 类 `TeamFlowTaskList`；不要添加包声明，也不要创建 Maven 项目。
3. 用下面的完整代码替换类内容，确认文件名是 `TeamFlowTaskList.java`。
4. 点击 `main` 左侧的运行图标，选择运行 `TeamFlowTaskList.main()`；若已有同名运行配置，确认它的 JRE
   仍是 JDK 25。
5. 在 Run 控制台看到提示符后逐行输入命令，每行按一次回车。

### 2. 完整代码

```java
import java.util.Scanner;

public final class TeamFlowTaskList {
    /**
     * 在固定容量数组的下一个空位置添加任务。
     *
     * @param titles 任务标题数组
     * @param completed 任务完成状态数组
     * @param taskCount 当前任务数量
     * @param title 新任务标题
     * @return 添加成功后的任务数量；容量已满时返回原数量
     */
    static int addTask(String[] titles, boolean[] completed, int taskCount, String title) {
        if (taskCount >= titles.length) {
            return taskCount;
        }
        titles[taskCount] = title;
        completed[taskCount] = false;
        return taskCount + 1;
    }

    /**
     * 按用户看到的任务编号标记完成状态。
     *
     * @param completed 任务完成状态数组
     * @param taskNumber 从 1 开始的任务编号
     */
    static void completeTask(boolean[] completed, int taskNumber) {
        completed[taskNumber - 1] = true;
    }

    /**
     * 列出已使用区间中的任务并输出统计结果。
     *
     * @param titles 任务标题数组
     * @param completed 任务完成状态数组
     * @param taskCount 当前任务数量
     */
    static void listTasks(String[] titles, boolean[] completed, int taskCount) {
        if (taskCount == 0) {
            System.out.println("任务清单为空");
            return;
        }

        int completedCount = 0;
        for (int index = 0; index < taskCount; index++) {
            String mark = completed[index] ? "[x]" : "[ ]";
            System.out.println("#" + (index + 1) + " " + mark + " " + titles[index]);
            if (completed[index]) {
                completedCount++;
            }
        }
        System.out.println(
            "合计=" + taskCount
                + "，已完成=" + completedCount
                + "，待办=" + (taskCount - completedCount)
        );
    }

    /**
     * 判断文本是否满足一位正整数的任务编号格式。
     *
     * @param text 待检查的编号文本
     * @return 文本只包含 1 到 9 中的一个数字时返回 true
     */
    static boolean hasTaskNumberFormat(String text) {
        if (text.length() != 1) {
            return false;
        }
        char digit = text.charAt(0);
        return digit >= '1' && digit <= '9';
    }

    /**
     * 输出当前程序支持的四条命令。
     */
    static void printUsage() {
        System.out.println("命令：add <标题> | list | done <编号> | exit");
    }

    /**
     * 运行 JDK 25 TeamFlow 命令行任务清单。
     *
     * @param args 启动参数，本课不使用
     */
    public static void main(String[] args) {
        String[] titles = new String[5];
        boolean[] completed = new boolean[5];
        int taskCount = 0;
        boolean running = true;
        Scanner scanner = new Scanner(System.in);

        System.out.println("TeamFlow 命令行任务清单");
        printUsage();

        while (running) {
            System.out.print("> ");
            System.out.flush();
            if (!scanner.hasNextLine()) {
                System.out.println();
                System.out.println("输入结束，程序退出");
                break;
            }

            String input = scanner.nextLine().strip();
            if (input.isBlank()) {
                System.out.println("命令不能为空");
                continue;
            }

            int separator = input.indexOf(' ');
            String command = separator == -1 ? input : input.substring(0, separator);
            String argument = separator == -1 ? "" : input.substring(separator + 1).strip();

            if ("add".equalsIgnoreCase(command)) {
                if (argument.isBlank()) {
                    System.out.println("任务标题不能为空");
                    continue;
                }
                int newCount = addTask(titles, completed, taskCount, argument);
                if (newCount == taskCount) {
                    System.out.println("任务清单已满，最多 5 项");
                    continue;
                }
                taskCount = newCount;
                System.out.println("已添加 #" + taskCount + ": " + argument);
                continue;
            }

            if ("list".equalsIgnoreCase(command) && argument.isBlank()) {
                listTasks(titles, completed, taskCount);
                continue;
            }

            if ("done".equalsIgnoreCase(command)) {
                if (!hasTaskNumberFormat(argument)) {
                    System.out.println("任务编号格式错误，请输入 1 到 9 中的一个数字");
                    continue;
                }
                int taskNumber = Integer.parseInt(argument);
                if (taskNumber > taskCount) {
                    System.out.println("任务不存在: #" + taskNumber);
                    continue;
                }
                if (completed[taskNumber - 1]) {
                    System.out.println("任务已完成: #" + taskNumber);
                    continue;
                }
                completeTask(completed, taskNumber);
                System.out.println("已完成 #" + taskNumber + ": " + titles[taskNumber - 1]);
                continue;
            }

            if ("exit".equalsIgnoreCase(command) && argument.isBlank()) {
                running = false;
                System.out.println("TeamFlow 任务清单已退出");
                continue;
            }

            System.out.println("未知命令: " + command);
            printUsage();
        }

        scanner.close();
    }
}
```

### 3. 预期控制台过程

依次输入 `list`、两条 `add`、`done 1`、再次 `done 1`、`list`、`exit`，关键输出如下：

```text
TeamFlow 命令行任务清单
命令：add <标题> | list | done <编号> | exit
> list
任务清单为空
> add 完成登录页联调
已添加 #1: 完成登录页联调
> add 整理 API 文档
已添加 #2: 整理 API 文档
> done 1
已完成 #1: 完成登录页联调
> done 1
任务已完成: #1
> list
#1 [x] 完成登录页联调
#2 [ ] 整理 API 文档
合计=2，已完成=1，待办=1
> exit
TeamFlow 任务清单已退出
```

第一次 `list` 证明已使用区间为空；两次 `add` 让 `taskCount` 依次变为 1 和 2；`done 1` 把
`completed[0]` 设为 `true`；重复完成不再改变状态。最后的统计来自同一个两项区间，因此总数 2、已完成
1、待办 1 相互一致。

### 4. 用终端核对同一程序

在源码目录先运行 `java -version` 和 `javac -version`，两条命令都应显示 25。然后执行：

```bash
javac TeamFlowTaskList.java
java TeamFlowTaskList
```

传统启动命令使用类名，不带 `.java`。终端 JDK 与 IDEA 项目 JDK 是两处独立选择；一处显示 25 不能
证明另一处也使用 25。

## 七、运行 Java 8 完整程序

### 1. 在 IDEA 中切换兼容项目

1. 为兼容练习使用独立的普通 Java 项目或独立模块，把 Project SDK 和模块 SDK 都设为已安装的 JDK 8。
2. 创建 `TeamFlowTaskList.java`，填入下面完整代码；不要只在 JDK 25 文件中临时改两行后混用运行配置。
3. 打开 `TeamFlowTaskList.main()` 的运行配置，把 JRE 明确设为项目的 Java 8 SDK。
4. 运行后输入与现代版相同的命令，核对输出；终端验证前另行确认 `java -version`、`javac -version`
   都显示 1.8。

### 2. 完整兼容代码

```java
import java.util.Scanner;

public final class TeamFlowTaskList {
    /**
     * 在固定容量数组的下一个空位置添加任务。
     *
     * @param titles 任务标题数组
     * @param completed 任务完成状态数组
     * @param taskCount 当前任务数量
     * @param title 新任务标题
     * @return 添加成功后的任务数量；容量已满时返回原数量
     */
    static int addTask(String[] titles, boolean[] completed, int taskCount, String title) {
        if (taskCount >= titles.length) {
            return taskCount;
        }
        titles[taskCount] = title;
        completed[taskCount] = false;
        return taskCount + 1;
    }

    /**
     * 按用户看到的任务编号标记完成状态。
     *
     * @param completed 任务完成状态数组
     * @param taskNumber 从 1 开始的任务编号
     */
    static void completeTask(boolean[] completed, int taskNumber) {
        completed[taskNumber - 1] = true;
    }

    /**
     * 列出已使用区间中的任务并输出统计结果。
     *
     * @param titles 任务标题数组
     * @param completed 任务完成状态数组
     * @param taskCount 当前任务数量
     */
    static void listTasks(String[] titles, boolean[] completed, int taskCount) {
        if (taskCount == 0) {
            System.out.println("任务清单为空");
            return;
        }

        int completedCount = 0;
        for (int index = 0; index < taskCount; index++) {
            String mark = completed[index] ? "[x]" : "[ ]";
            System.out.println("#" + (index + 1) + " " + mark + " " + titles[index]);
            if (completed[index]) {
                completedCount++;
            }
        }
        System.out.println(
            "合计=" + taskCount
                + "，已完成=" + completedCount
                + "，待办=" + (taskCount - completedCount)
        );
    }

    /**
     * 判断文本是否满足一位正整数的任务编号格式。
     *
     * @param text 待检查的编号文本
     * @return 文本只包含 1 到 9 中的一个数字时返回 true
     */
    static boolean hasTaskNumberFormat(String text) {
        if (text.length() != 1) {
            return false;
        }
        char digit = text.charAt(0);
        return digit >= '1' && digit <= '9';
    }

    /**
     * 输出当前程序支持的四条命令。
     */
    static void printUsage() {
        System.out.println("命令：add <标题> | list | done <编号> | exit");
    }

    /**
     * 运行 Java 8 TeamFlow 命令行任务清单。
     *
     * @param args 启动参数，本课不使用
     */
    public static void main(String[] args) {
        String[] titles = new String[5];
        boolean[] completed = new boolean[5];
        int taskCount = 0;
        boolean running = true;
        Scanner scanner = new Scanner(System.in);

        System.out.println("TeamFlow 命令行任务清单");
        printUsage();

        while (running) {
            System.out.print("> ");
            System.out.flush();
            if (!scanner.hasNextLine()) {
                System.out.println();
                System.out.println("输入结束，程序退出");
                break;
            }

            String input = scanner.nextLine().trim();
            if (input.isEmpty()) {
                System.out.println("命令不能为空");
                continue;
            }

            int separator = input.indexOf(' ');
            String command = separator == -1 ? input : input.substring(0, separator);
            String argument = separator == -1 ? "" : input.substring(separator + 1).trim();

            if ("add".equalsIgnoreCase(command)) {
                if (argument.isEmpty()) {
                    System.out.println("任务标题不能为空");
                    continue;
                }
                int newCount = addTask(titles, completed, taskCount, argument);
                if (newCount == taskCount) {
                    System.out.println("任务清单已满，最多 5 项");
                    continue;
                }
                taskCount = newCount;
                System.out.println("已添加 #" + taskCount + ": " + argument);
                continue;
            }

            if ("list".equalsIgnoreCase(command) && argument.isEmpty()) {
                listTasks(titles, completed, taskCount);
                continue;
            }

            if ("done".equalsIgnoreCase(command)) {
                if (!hasTaskNumberFormat(argument)) {
                    System.out.println("任务编号格式错误，请输入 1 到 9 中的一个数字");
                    continue;
                }
                int taskNumber = Integer.parseInt(argument);
                if (taskNumber > taskCount) {
                    System.out.println("任务不存在: #" + taskNumber);
                    continue;
                }
                if (completed[taskNumber - 1]) {
                    System.out.println("任务已完成: #" + taskNumber);
                    continue;
                }
                completeTask(completed, taskNumber);
                System.out.println("已完成 #" + taskNumber + ": " + titles[taskNumber - 1]);
                continue;
            }

            if ("exit".equalsIgnoreCase(command) && argument.isEmpty()) {
                running = false;
                System.out.println("TeamFlow 任务清单已退出");
                continue;
            }

            System.out.println("未知命令: " + command);
            printUsage();
        }

        scanner.close();
    }
}
```

### 3. 兼容版输出与终端命令

Java 8 版使用与 JDK 25 版相同的输入时，预期控制台过程完全相同：空列表、两次新增、完成、重复完成、
统计和退出都应得到上一节展示的输出。它并未省略任何方法或分支，只把现代空白 API 改成兼容写法。

在 Java 8 源码目录执行：

```bash
javac TeamFlowTaskList.java
java TeamFlowTaskList
```

如果 `javac -version` 显示 1.8、`java -version` 却显示 25，编译器和启动器并不是同一套 JDK。先修正
终端选择，再判断兼容程序是否通过；IDEA 中也要分别核对 Project SDK、模块 SDK 和运行配置 JRE。

### 4. 逐步解释执行结果

程序启动时创建两个长度为 5 的数组，`taskCount` 为 0。每读到一行，字符串分支只选择一条命令路径；
成功新增才让计数增加，完成任务只修改同索引布尔值，列表循环只读取 `[0, taskCount)` 的已使用区间。
`exit` 让 `running` 变为 `false`，下一次循环条件检查失败，程序关闭 Scanner 后结束。整个过程没有隐藏
对象、文件或框架状态。

## 八、练习与参考实现

:::exercise
### 练习：让待办任务优先显示

**要求：** 保持 `add`、`list`、`done`、`exit` 四条命令不变，修改 `listTasks`：先按原顺序显示全部
待办任务，再按原顺序显示全部已完成任务。显示编号必须仍是任务最初的编号，不得移动数组元素，也不得
新增数组、对象、集合、文件或第三方库。

**验收：** 依次输入 `add 完成登录页联调`、`add 整理 API 文档`、`add 准备演示`、`done 2`、
`list`、`exit`。`list` 必须依次显示 `#1 [ ] 完成登录页联调`、`#3 [ ] 准备演示`、
`#2 [x] 整理 API 文档`，最后输出 `合计=3，已完成=1，待办=2`。空清单执行 `list` 时仍输出
“任务清单为空”；JDK 25 与 Java 8 都必须通过相同输入。

**参考答案：** `listTasks` 先用一次循环输出 `completed[index]` 为 `false` 的任务，再用第二次循环
输出为 `true` 的任务并统计完成数。两次都使用原索引计算 `index + 1`，所以显示顺序改变，数组对应关系
和用户编号不会改变。

:::

### 1. JDK 25 参考实现

```java
import java.util.Scanner;

public final class TeamFlowTaskListPractice {
    /**
     * 在固定容量数组的下一个空位置添加任务。
     *
     * @param titles 任务标题数组
     * @param completed 任务完成状态数组
     * @param taskCount 当前任务数量
     * @param title 新任务标题
     * @return 添加成功后的任务数量；容量已满时返回原数量
     */
    static int addTask(String[] titles, boolean[] completed, int taskCount, String title) {
        if (taskCount >= titles.length) {
            return taskCount;
        }
        titles[taskCount] = title;
        completed[taskCount] = false;
        return taskCount + 1;
    }

    /**
     * 按用户看到的任务编号标记完成状态。
     *
     * @param completed 任务完成状态数组
     * @param taskNumber 从 1 开始的任务编号
     */
    static void completeTask(boolean[] completed, int taskNumber) {
        completed[taskNumber - 1] = true;
    }

    /**
     * 输出指定索引处的一项任务。
     *
     * @param titles 任务标题数组
     * @param completed 任务完成状态数组
     * @param index 待输出的数组索引
     */
    static void printTask(String[] titles, boolean[] completed, int index) {
        String mark = completed[index] ? "[x]" : "[ ]";
        System.out.println("#" + (index + 1) + " " + mark + " " + titles[index]);
    }

    /**
     * 先列出待办任务，再列出已完成任务并输出统计结果。
     *
     * @param titles 任务标题数组
     * @param completed 任务完成状态数组
     * @param taskCount 当前任务数量
     */
    static void listTasks(String[] titles, boolean[] completed, int taskCount) {
        if (taskCount == 0) {
            System.out.println("任务清单为空");
            return;
        }

        for (int index = 0; index < taskCount; index++) {
            if (!completed[index]) {
                printTask(titles, completed, index);
            }
        }

        int completedCount = 0;
        for (int index = 0; index < taskCount; index++) {
            if (completed[index]) {
                printTask(titles, completed, index);
                completedCount++;
            }
        }

        System.out.println(
            "合计=" + taskCount
                + "，已完成=" + completedCount
                + "，待办=" + (taskCount - completedCount)
        );
    }

    /**
     * 判断文本是否满足一位正整数的任务编号格式。
     *
     * @param text 待检查的编号文本
     * @return 文本只包含 1 到 9 中的一个数字时返回 true
     */
    static boolean hasTaskNumberFormat(String text) {
        if (text.length() != 1) {
            return false;
        }
        char digit = text.charAt(0);
        return digit >= '1' && digit <= '9';
    }

    /**
     * 输出练习程序支持的命令。
     */
    static void printUsage() {
        System.out.println("命令：add <标题> | list | done <编号> | exit");
    }

    /**
     * 运行 JDK 25 TeamFlow 练习参考实现。
     *
     * @param args 启动参数，本练习不使用
     */
    public static void main(String[] args) {
        String[] titles = new String[5];
        boolean[] completed = new boolean[5];
        int taskCount = 0;
        boolean running = true;
        Scanner scanner = new Scanner(System.in);

        System.out.println("TeamFlow 命令行任务清单");
        printUsage();

        while (running) {
            System.out.print("> ");
            System.out.flush();
            if (!scanner.hasNextLine()) {
                System.out.println();
                System.out.println("输入结束，程序退出");
                break;
            }

            String input = scanner.nextLine().strip();
            if (input.isBlank()) {
                System.out.println("命令不能为空");
                continue;
            }

            int separator = input.indexOf(' ');
            String command = separator == -1 ? input : input.substring(0, separator);
            String argument = separator == -1 ? "" : input.substring(separator + 1).strip();

            if ("add".equalsIgnoreCase(command)) {
                if (argument.isBlank()) {
                    System.out.println("任务标题不能为空");
                    continue;
                }
                int newCount = addTask(titles, completed, taskCount, argument);
                if (newCount == taskCount) {
                    System.out.println("任务清单已满，最多 5 项");
                    continue;
                }
                taskCount = newCount;
                System.out.println("已添加 #" + taskCount + ": " + argument);
                continue;
            }

            if ("list".equalsIgnoreCase(command) && argument.isBlank()) {
                listTasks(titles, completed, taskCount);
                continue;
            }

            if ("done".equalsIgnoreCase(command)) {
                if (!hasTaskNumberFormat(argument)) {
                    System.out.println("任务编号格式错误，请输入 1 到 9 中的一个数字");
                    continue;
                }
                int taskNumber = Integer.parseInt(argument);
                if (taskNumber > taskCount) {
                    System.out.println("任务不存在: #" + taskNumber);
                    continue;
                }
                if (completed[taskNumber - 1]) {
                    System.out.println("任务已完成: #" + taskNumber);
                    continue;
                }
                completeTask(completed, taskNumber);
                System.out.println("已完成 #" + taskNumber + ": " + titles[taskNumber - 1]);
                continue;
            }

            if ("exit".equalsIgnoreCase(command) && argument.isBlank()) {
                running = false;
                System.out.println("TeamFlow 任务清单已退出");
                continue;
            }

            System.out.println("未知命令: " + command);
            printUsage();
        }

        scanner.close();
    }
}
```

### 2. Java 8 参考实现

```java
import java.util.Scanner;

public final class TeamFlowTaskListPractice {
    /**
     * 在固定容量数组的下一个空位置添加任务。
     *
     * @param titles 任务标题数组
     * @param completed 任务完成状态数组
     * @param taskCount 当前任务数量
     * @param title 新任务标题
     * @return 添加成功后的任务数量；容量已满时返回原数量
     */
    static int addTask(String[] titles, boolean[] completed, int taskCount, String title) {
        if (taskCount >= titles.length) {
            return taskCount;
        }
        titles[taskCount] = title;
        completed[taskCount] = false;
        return taskCount + 1;
    }

    /**
     * 按用户看到的任务编号标记完成状态。
     *
     * @param completed 任务完成状态数组
     * @param taskNumber 从 1 开始的任务编号
     */
    static void completeTask(boolean[] completed, int taskNumber) {
        completed[taskNumber - 1] = true;
    }

    /**
     * 输出指定索引处的一项任务。
     *
     * @param titles 任务标题数组
     * @param completed 任务完成状态数组
     * @param index 待输出的数组索引
     */
    static void printTask(String[] titles, boolean[] completed, int index) {
        String mark = completed[index] ? "[x]" : "[ ]";
        System.out.println("#" + (index + 1) + " " + mark + " " + titles[index]);
    }

    /**
     * 先列出待办任务，再列出已完成任务并输出统计结果。
     *
     * @param titles 任务标题数组
     * @param completed 任务完成状态数组
     * @param taskCount 当前任务数量
     */
    static void listTasks(String[] titles, boolean[] completed, int taskCount) {
        if (taskCount == 0) {
            System.out.println("任务清单为空");
            return;
        }

        for (int index = 0; index < taskCount; index++) {
            if (!completed[index]) {
                printTask(titles, completed, index);
            }
        }

        int completedCount = 0;
        for (int index = 0; index < taskCount; index++) {
            if (completed[index]) {
                printTask(titles, completed, index);
                completedCount++;
            }
        }

        System.out.println(
            "合计=" + taskCount
                + "，已完成=" + completedCount
                + "，待办=" + (taskCount - completedCount)
        );
    }

    /**
     * 判断文本是否满足一位正整数的任务编号格式。
     *
     * @param text 待检查的编号文本
     * @return 文本只包含 1 到 9 中的一个数字时返回 true
     */
    static boolean hasTaskNumberFormat(String text) {
        if (text.length() != 1) {
            return false;
        }
        char digit = text.charAt(0);
        return digit >= '1' && digit <= '9';
    }

    /**
     * 输出练习程序支持的命令。
     */
    static void printUsage() {
        System.out.println("命令：add <标题> | list | done <编号> | exit");
    }

    /**
     * 运行 Java 8 TeamFlow 练习参考实现。
     *
     * @param args 启动参数，本练习不使用
     */
    public static void main(String[] args) {
        String[] titles = new String[5];
        boolean[] completed = new boolean[5];
        int taskCount = 0;
        boolean running = true;
        Scanner scanner = new Scanner(System.in);

        System.out.println("TeamFlow 命令行任务清单");
        printUsage();

        while (running) {
            System.out.print("> ");
            System.out.flush();
            if (!scanner.hasNextLine()) {
                System.out.println();
                System.out.println("输入结束，程序退出");
                break;
            }

            String input = scanner.nextLine().trim();
            if (input.isEmpty()) {
                System.out.println("命令不能为空");
                continue;
            }

            int separator = input.indexOf(' ');
            String command = separator == -1 ? input : input.substring(0, separator);
            String argument = separator == -1 ? "" : input.substring(separator + 1).trim();

            if ("add".equalsIgnoreCase(command)) {
                if (argument.isEmpty()) {
                    System.out.println("任务标题不能为空");
                    continue;
                }
                int newCount = addTask(titles, completed, taskCount, argument);
                if (newCount == taskCount) {
                    System.out.println("任务清单已满，最多 5 项");
                    continue;
                }
                taskCount = newCount;
                System.out.println("已添加 #" + taskCount + ": " + argument);
                continue;
            }

            if ("list".equalsIgnoreCase(command) && argument.isEmpty()) {
                listTasks(titles, completed, taskCount);
                continue;
            }

            if ("done".equalsIgnoreCase(command)) {
                if (!hasTaskNumberFormat(argument)) {
                    System.out.println("任务编号格式错误，请输入 1 到 9 中的一个数字");
                    continue;
                }
                int taskNumber = Integer.parseInt(argument);
                if (taskNumber > taskCount) {
                    System.out.println("任务不存在: #" + taskNumber);
                    continue;
                }
                if (completed[taskNumber - 1]) {
                    System.out.println("任务已完成: #" + taskNumber);
                    continue;
                }
                completeTask(completed, taskNumber);
                System.out.println("已完成 #" + taskNumber + ": " + titles[taskNumber - 1]);
                continue;
            }

            if ("exit".equalsIgnoreCase(command) && argument.isEmpty()) {
                running = false;
                System.out.println("TeamFlow 任务清单已退出");
                continue;
            }

            System.out.println("未知命令: " + command);
            printUsage();
        }

        scanner.close();
    }
}
```

### 3. 练习运行结果

两个版本都使用各自正确的 Project SDK、模块 SDK 和运行配置 JRE。按练习指定顺序输入后，关键输出为：

```text
已添加 #1: 完成登录页联调
已添加 #2: 整理 API 文档
已添加 #3: 准备演示
已完成 #2: 整理 API 文档
#1 [ ] 完成登录页联调
#3 [ ] 准备演示
#2 [x] 整理 API 文档
合计=3，已完成=1，待办=2
TeamFlow 任务清单已退出
```

上面只应出现一次 `#2`，且标记必须是 `[x]`；待办优先只是改变输出顺序，不能复制任务或改掉原编号。
Java 8 的完整修改已经在对应实现中给出：只有 `strip/isBlank` 改为 `trim/isEmpty`，其余练习逻辑与
JDK 25 保持一致。
