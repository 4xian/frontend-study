---
id: backend.java.learn.basics.strings-encoding-and-text-matching
type: lesson
title: 字符串处理
summary: 掌握 String 的不可变值、内容比较、索引查找与简单文本解析，并兼顾 Java 8 的兼容写法
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 75
prerequisites:
  - backend.java.learn.basics.arrays-and-varargs
objectives:
  - 能创建字符串并解释 String 不可变、内容比较与引用比较的区别。
  - 能使用 length、charAt、indexOf、contains、substring 和 replace 完成基础文本处理。
  - 能处理查找失败、半开区间、空文本和一个 Unicode 字符占用多个 char 的边界。
  - 能在 JDK 25 使用 strip、isBlank，并写出 Java 8 使用 trim、isEmpty 的兼容版本。
  - 能把字符串操作串联成一个可运行的 TeamFlow 命令解析程序。
recap:
  - String 保存不可变文本值，修改方法返回新字符串；内容比较使用 equals，不用 ==。
  - length 和 charAt 使用 char 索引；substring 的结束位置不包含在结果中。
  - indexOf 找不到内容返回 -1，使用结果前必须先判断；replace 也不会修改原字符串。
  - JDK 25 的 strip、isBlank 与 Java 8 的 trim、isEmpty 有真实版本差异，兼容代码要就近替换。
  - TeamFlow 示例用分隔符、查找、截取、清理和状态比较组成一个最小文本处理流程。
related: []
tags:
  - Java
  - String
  - 文本处理
  - 字符串比较
  - 子串
appliesTo: Java 25；兼容示例适用于 Java 8
verifiedAt: 2026-08-17
sources:
  - id: java-25-string-api
    title: Java SE 25 API - String
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - String 的不可变值以及 equals、length、charAt、indexOf、contains、substring、replace 等方法合同
      - char 索引、substring 左闭右开边界、indexOf 未找到返回 -1
      - strip、isBlank 与 trim 的文本处理语义
  - id: java-8-string-api
    title: Java SE 8 API - String
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/String.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 提供本课共同的 String 比较、查找、截取、替换和 trim API
      - Java 8 的 String API 没有 JDK 25 的 strip、isBlank 方法
  - id: dev-java-strings
    title: Dev.java - Strings
    url: https://dev.java/learn/numbers-strings/strings
    sourceOrigin: official
    sourceType: engineering-reference
    appliesTo: Java SE
    claims:
      - String 是对象且不可变，操作方法返回包含结果的新字符串
      - 官方入门示例覆盖字符串创建、长度、字符提取、子串、查找和替换
  - id: jls-25-string-literals
    title: Java Language Specification 25 - String Literals
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-3.html#jls-3.10.5
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 字符串字面量会被 intern，编译期常量拼接可能共享字面量引用，运行期拼接可能产生新引用
  - id: jls-25-string-concatenation
    title: Java Language Specification 25 - String Concatenation
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.18.1
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 字符串加法按左结合顺序执行，数字与字符串混合时运算结果取决于出现字符串的位置
  - id: jls-8-string-literals
    title: Java Language Specification 8 - String Literals
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-3.html#jls-3.10.5
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 的字符串字面量共享和常量拼接规则与 Java 25 的共同核心一致
  - id: jls-8-string-concatenation
    title: Java Language Specification 8 - String Concatenation
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html#jls-15.18.1
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 的字符串加法左结合规则与 Java 25 一致
---

# 字符串处理

后端程序经常要从一段文本中读出项目名、任务标题和状态，再把清理后的结果交给下一步。字符串看起来
像一串字符，实际却是一个不可变对象；比较、索引和截取的边界如果没有说清楚，程序就会在最小的输入上
产生错误。本课先建立这几个稳定合同，不提前进入正则、字符编码、集合或文本构建器。

示例围绕 TeamFlow 的一条简单命令展开：`task|  修复_登录页  |done`。我们会读出三个字段、清理标题、
判断状态并输出摘要。这个场景只承担字符串处理，暂不引入对象模型、文件或 Spring Boot。

## 一、先理解 String 保存的值

### 1. 字符串字面量是文本值

双引号中的内容是字符串字面量，变量保存对 `String` 对象的引用。字符串可以是空字符串，也可以包含
空格、数字和 Unicode 文本；`length()` 返回当前字符串的 `char` 数量。

```java
String project = "TeamFlow";
String empty = "";
String title = "修复登录页";

System.out.println(project); // TeamFlow
System.out.println(empty.length()); // 0
System.out.println(title.length()); // 5
```

### 2. String 不可变，方法返回新值

`String` 对象创建后内容不会原地改变。`replace`、`substring`、大小写转换等方法会返回另一个结果；
如果不接住返回值，原变量仍然是原来的文本。

```java
String title = "修复_登录页";
title.replace('_', ' ');
System.out.println(title); // 修复_登录页

title = title.replace('_', ' ');
System.out.println(title); // 修复 登录页
```

第二次赋值不是多余步骤，它把方法返回的新字符串重新交给 `title`。这也是为什么字符串处理通常写成
“读出旧值、计算新值、保存新值”。

### 3. 内容比较使用 equals

`==` 比较两个引用是否指向同一个对象，`equals` 才比较字符串内容。字符串字面量可能共享对象，不能
因为一次 `==` 恰好返回 `true` 就把它当作文本比较规则。

```java
String left = new String("TeamFlow");
String right = "TeamFlow";

System.out.println(left == right); // false
System.out.println(left.equals(right)); // true
System.out.println("done".equalsIgnoreCase("DONE")); // true
```

`equalsIgnoreCase` 只在业务明确忽略大小写时使用。状态值可以这样比较；任务标题通常仍应保留原始大小写。

## 二、按位置读取和查找

### 1. length 与 charAt 的索引边界

字符串索引从 `0` 开始，最大合法索引是 `length() - 1`。`charAt(index)` 返回一个 `char`；传入
`length()` 会越过最后一个位置。

```java
String status = "done";
System.out.println(status.length()); // 4
System.out.println(status.charAt(0)); // d
System.out.println(status.charAt(status.length() - 1)); // e
```

Java 的 `char` 是 UTF-16 code unit。`"A😀"` 的 `length()` 是 3，而 Unicode code point 数量是 2；
因此本课把 `length` 和索引准确称为 `char` 位置，不把它们包装成用户感知的“字符数”。

```java
String text = "A😀";
System.out.println(text.length()); // 3
System.out.println(text.codePointCount(0, text.length())); // 2
```

### 2. 用 indexOf、contains 和 startsWith 找内容

`contains` 直接回答“是否包含”；`startsWith` 直接回答“是否以某段开头”；`indexOf` 返回第一次出现
的位置，找不到时返回 `-1`。`-1` 不是合法索引，使用它之前必须分支处理。

```java
String command = "task|修复登录页|done";
int separator = command.indexOf('|');

System.out.println(command.startsWith("task|")); // true
System.out.println(command.contains("登录")); // true
System.out.println(separator); // 4
System.out.println(command.indexOf("missing")); // -1
```

### 3. substring 使用左闭右开区间

`substring(begin, end)` 包含 `begin` 位置，不包含 `end` 位置。若分隔符在索引 4，字段内容通常从
`separator + 1` 开始；结束位置可以直接使用下一个分隔符的位置。

```java
String command = "task|修复登录页|done";
int first = command.indexOf('|');
int last = command.lastIndexOf('|');

String kind = command.substring(0, first);
String title = command.substring(first + 1, last);
String state = command.substring(last + 1);

System.out.println(kind); // task
System.out.println(title); // 修复登录页
System.out.println(state); // done
```

这段代码成立的前提是两个分隔符都找到了且顺序正确；真实输入应先检查位置，再调用 `substring`。

### 4. 用一个小方法表达字段截取

下面的方法只负责从已知格式中取出标题，调用方仍应先确认分隔符存在。方法上方的 Javadoc 说明了参数
和返回值，避免把索引含义留给猜测。

```java
public final class TextSliceDemo {
    /**
     * 从 task|title|state 格式的命令中提取中间标题。
     *
     * @param command 已包含两个竖线分隔符的命令
     * @return 两个分隔符之间的标题
     */
    static String extractTitle(String command) {
        int first = command.indexOf('|');
        int last = command.lastIndexOf('|');
        return command.substring(first + 1, last);
    }
}
```

如果输入没有第二个分隔符，这个方法就不满足前置条件；完整程序会在调用前检查，而不是用一个捕获
异常的模板掩盖边界。

## 三、把读取结果变成新文本

### 1. replace 适合固定文字替换

`replace(char, char)` 和 `replace(CharSequence, CharSequence)` 按字面内容替换，不会把替换内容当成
另一套表达式。它们仍返回新字符串，因此可以把清理动作串起来。

```java
String rawTitle = "  修复_登录页  ";
String title = rawTitle.trim().replace('_', ' ');

System.out.println("原始=[" + rawTitle + "]"); // 原始=[  修复_登录页  ]
System.out.println(title); // 修复 登录页
```

本课只使用固定文字替换；正则替换和 `StringBuilder` 留到后续课程，避免让两个不同合同混在一个入门
方法里。

### 2. 加号拼接要注意左结合

字符串与数字混合时，`+` 从左向右计算。先出现字符串时，后面的数字会变成文本；先计算数字时，才会
得到数字和。

```java
int done = 1;
int total = 2;

System.out.println("进度=" + done + total); // 进度=12
System.out.println("进度=" + (done + total)); // 进度=3
```

这个规则在状态摘要中很常见：需要数字和时先加括号，需要逐项展示时才直接连续拼接。

### 3. JDK 25 使用 strip 与 isBlank

JDK 25 的 `strip()` 按 Unicode 空白处理首尾，`isBlank()` 判断字符串为空或只包含 Unicode 空白；两者
都返回结果，不修改原字符串。

```java
String input = "  TeamFlow  ";
String clean = input.strip();

System.out.println(clean); // TeamFlow
System.out.println(" \t".isBlank()); // true
System.out.println("原始=[" + input + "]"); // 原始=[  TeamFlow  ]
```

`isEmpty()` 只判断长度是否为 0，`" "` 并不 empty；不要用它代替 `isBlank()`。

### 4. Java 8 用 trim 与 isEmpty

Java 8 没有 `strip()` 和 `isBlank()`。兼容代码可用 `trim()` 清理示例中的普通空格，并用
`trim().isEmpty()` 判断清理后是否为空：

```java
String input = "  TeamFlow  ";
String clean = input.trim();
boolean blank = clean.isEmpty();

System.out.println(clean); // TeamFlow
System.out.println(blank); // false
```

`trim()` 的范围不是 `strip()` 的完整 Unicode 空白范围；若输入包含非 ASCII 空白，Java 8 需要另行
设计兼容策略。本课的 Java 8 完整程序使用普通空格，并明确选择 `trim()`。

## 四、完成一次 TeamFlow 文本解析

### 1. 先写清楚输入格式

示例命令固定为 `类型|标题|状态`，例如 `task|  修复_登录页  |done`。三个字段的职责如下：

| 片段 | 例子 | 处理动作 |
| --- | --- | --- |
| 类型 | `task` | 用 `equalsIgnoreCase` 判断是否为任务 |
| 标题 | `  修复_登录页  ` | 去首尾空白，再把下划线替换为空格 |
| 状态 | `done` | 忽略大小写映射为中文状态 |

解析顺序固定为：找到第一个和最后一个分隔符、检查顺序、分别 `substring`、清理标题、比较状态、输出
摘要。把每一步的中间值打印出来，初学者就能观察每个字符串方法的结果。

### 2. 运行时观察每个中间值

对 `task|  修复_登录页  |done`，第一个竖线索引是 4，最后一个竖线索引是 15；中间字段是两个索引
之间的文本。`strip()` 后标题变成 `修复_登录页`，`replace` 后变成 `修复 登录页`，状态比较得到
`已完成`。这三个结果共同构成最终摘要。

### 3. 不把当前课扩展成命令行框架

完整程序直接使用一个字符串常量，目的是观察 `String` 的值流。命令行参数数组、文件输入、对象封装、
正则分割和异常恢复都属于后续课程；这里先把一条可信输入处理正确。

## 五、Java 25 与 Java 8 的选择

### 1. 两个版本共同支持的核心

Java 25 和 Java 8 都支持字符串字面量、`equals`、`equalsIgnoreCase`、`length`、`charAt`、
`indexOf`、`lastIndexOf`、`contains`、`startsWith`、`substring`、`replace`、`trim` 和 `+` 拼接。
本课的字段解析算法在两版中保持相同，差异只发生在空白判断和清理 API。

### 2. 只在真实差异处替换 API

JDK 25 版本使用 `strip`、`isBlank`；Java 8 版本使用 `trim`、`trim().isEmpty()`。不能在 Java 8
代码里写出 `isBlank()` 后再声称只切换 Project SDK 就能运行。也不能把 `trim()` 宣称为对所有 Unicode
空白完全等价的替代品。

### 3. IDEA 和终端都要选对版本

在 IntelliJ IDEA 中，现代示例把 Project SDK、Module SDK 和运行配置的 JRE 设为 JDK 25；兼容示例
选择 Java 8，并重新确认运行配置没有沿用旧 JRE。终端分别用 `java -version`、`javac -version` 核对
实际命令版本。若两处版本不同，应先修正选择再判断代码是否兼容。

## 六、常见错误

:::pitfalls
### 错误：用 == 比较字符串内容

**触发条件：** 两个变量打印出的文本相同，却用 `left == right` 判断它们是否相等。

**原因：** `==` 比较引用身份；字符串字面量可能共享对象，运行期创建的结果也可能是新对象。

**后果：** 同样的 TeamFlow 状态在某些输入上被判定为不同，程序表现受字符串创建方式影响。

**错误示例：**

```java
String expected = new String("done");
String actual = "done";
boolean matched = expected == actual;
```

**正确写法：**

```java
boolean matched = expected.equals(actual);
boolean done = "done".equalsIgnoreCase(actual);
```

**验证方式：** 用上面的 `new String` 和字面量运行；错误版本为 `false`，正确版本的内容比较为 `true`。

### 错误：忽略不可变方法的返回值

**触发条件：** 调用 `title.replace('_', ' ')` 或 `title.strip()` 后直接读取 `title`。

**原因：** `String` 不可变，方法计算并返回新字符串，不会修改原对象。

**后果：** 输出仍带下划线或首尾空格，后续状态摘要使用了未经清理的标题。

**错误示例：**

```java
String title = "  修复_登录页  ";
title.strip().replace('_', ' ');
System.out.println(title);
```

**正确写法：**

```java
title = title.strip().replace('_', ' ');
System.out.println(title); // 修复 登录页
```

**验证方式：** 分别输出调用前后的变量；只有接住返回值的版本没有首尾空格且下划线变为空格。

### 错误：把 length 当作最后一个合法索引

**触发条件：** 用 `text.charAt(text.length())` 读取最后一个字符。

**原因：** 索引从 0 开始，最后一个合法位置是 `length() - 1`。

**后果：** 运行时抛出 `StringIndexOutOfBoundsException`，程序在读取状态前结束。

**错误示例：**

```java
String status = "done";
char last = status.charAt(status.length());
```

**正确写法：**

```java
char last = status.charAt(status.length() - 1);
```

**验证方式：** 对长度为 4 的 `done` 运行两版；错误索引 4 失败，正确索引 3 输出 `e`。

### 错误：把 substring 的结束位置当成包含边界

**触发条件：** 计算字段范围时把 `substring(first + 1, last)` 误解为包含 `last` 位置。

**原因：** Java 的 substring 使用左闭右开区间，结束位置只表示停止位置。

**后果：** 输出少一个字符，或把分隔符错误地拼进标题。

**错误示例：**

```java
String command = "task|修复登录页|done";
int first = command.indexOf('|');
int last = command.lastIndexOf('|');
String title = command.substring(first, last + 1);
```

**正确写法：**

```java
String title = command.substring(first + 1, last);
```

**验证方式：** 正确版本输出 `修复登录页` 且不含竖线；错误版本会多出分隔符或偏移一个字符。

### 错误：不检查 indexOf 的 -1 结果

**触发条件：** 对不含分隔符的输入直接把 `indexOf` 结果交给 `substring`。

**原因：** `indexOf` 找不到目标时返回 -1，而 -1 不是 substring 的合法位置。

**后果：** 格式错误的命令进入截取步骤后抛出边界异常，真正的输入问题被隐藏。

**错误示例：**

```java
String command = "task-without-separators";
int separator = command.indexOf('|');
String kind = command.substring(0, separator);
```

**正确写法：**

```java
int separator = command.indexOf('|');
if (separator == -1) {
    System.out.println("命令格式错误");
} else {
    String kind = command.substring(0, separator);
    System.out.println(kind);
}
```

**验证方式：** 用不含竖线的输入运行；错误版本失败，正确版本输出格式错误且不调用 substring。

### 错误：把 isEmpty 当成 isBlank

**触发条件：** 用 `isEmpty()` 判断输入 `"   "` 是否没有有效内容。

**原因：** `isEmpty()` 只判断长度为 0；空格仍然是字符串中的字符。

**后果：** 标题只有空格时仍被当成有效字段，TeamFlow 摘要出现空标题。

**错误示例：**

```java
String title = "   ";
boolean valid = !title.isEmpty();
```

**正确写法：**

```java
boolean valid = !title.isBlank(); // JDK 25
```

**验证方式：** 对 `""` 和 `"   "` 分别运行；JDK 25 正确版本都判为无有效内容，错误版本把空格判为有效。

### 错误：在 Java 8 代码中调用 JDK 25 方法

**触发条件：** 为兼容项目只把 Project SDK 改成 Java 8，却保留 `strip()` 或 `isBlank()`。

**原因：** 这些方法在 Java 8 的 String API 中不存在；版本切换不会自动改写源码。

**后果：** Java 8 编译失败，不能运行兼容示例。

**错误示例：**

```java
String title = rawTitle.strip();
if (title.isBlank()) {
    System.out.println("空标题");
}
```

**正确写法：**

```java
String title = rawTitle.trim();
if (title.isEmpty()) {
    System.out.println("空标题");
}
```

**验证方式：** 分别用 JDK 25 和 Java 8 编译；现代版本可用 `strip/isBlank`，Java 8 版本必须使用
`trim/isEmpty`，并在非 ASCII 空白场景单独确认语义。

:::

## 七、完整 TeamFlow 程序

### 1. 程序目标与运行步骤

程序接收固定格式 `task|  修复_登录页  |done`，先检查两个分隔符，再取出三个字段；标题去掉首尾
空白并把下划线替换为空格，状态用忽略大小写的比较映射成中文，最后输出摘要。

在 IntelliJ IDEA 中创建普通 Java 类 `TeamFlowStringApplication`，Project SDK、Module SDK 和运行
配置 JRE 选择 JDK 25，把下面代码完整放入同名文件后运行 `main`。终端验证使用：
`javac -encoding UTF-8 TeamFlowStringApplication.java`，然后 `java TeamFlowStringApplication`。

### 2. JDK 25 完整代码

```java
public final class TeamFlowStringApplication {
    /**
     * 判断命令是否包含按顺序出现的两个分隔符。
     *
     * @param command TeamFlow 命令文本
     * @return 两个分隔符存在且顺序正确时返回 true
     */
    static boolean hasTwoSeparators(String command) {
        int first = command.indexOf('|');
        int last = command.lastIndexOf('|');
        return first > 0 && last > first;
    }

    /**
     * 取出 task|title|state 命令的标题字段。
     *
     * @param command 已通过格式检查的命令文本
     * @return 两个分隔符之间的标题
     */
    static String extractTitle(String command) {
        int first = command.indexOf('|');
        int last = command.lastIndexOf('|');
        return command.substring(first + 1, last);
    }

    /**
     * 清理标题首尾空白并把 TeamFlow 示例中的下划线换成空格。
     *
     * @param rawTitle 原始标题
     * @return 可展示的标题
     */
    static String cleanTitle(String rawTitle) {
        return rawTitle.strip().replace('_', ' ');
    }

    /**
     * 把命令状态转换成面向学习者的中文状态。
     *
     * @param rawState 原始状态文本
     * @return done 对应已完成，其余状态对应进行中
     */
    static String displayState(String rawState) {
        if ("done".equalsIgnoreCase(rawState.strip())) {
            return "已完成";
        }
        return "进行中";
    }

    /**
     * 运行 TeamFlow 字符串处理示例。
     */
    public static void main(String[] args) {
        String command = "task|  修复_登录页  |done";
        if (!hasTwoSeparators(command)) {
            System.out.println("命令格式错误");
            return;
        }

        int first = command.indexOf('|');
        int last = command.lastIndexOf('|');
        String kind = command.substring(0, first);
        String title = cleanTitle(extractTitle(command));
        String state = displayState(command.substring(last + 1));

        if (!"task".equalsIgnoreCase(kind) || title.isBlank()) {
            System.out.println("命令内容错误");
            return;
        }

        System.out.println("项目=TeamFlow");
        System.out.println("类型=" + kind);
        System.out.println("标题=" + title);
        System.out.println("状态=" + state);
        System.out.println("摘要=TeamFlow - " + title + " - " + state);
    }
}
```

预期输出：

```text
项目=TeamFlow
类型=task
标题=修复 登录页
状态=已完成
摘要=TeamFlow - 修复 登录页 - 已完成
```

### 3. Java 8 完整代码

新建或打开同名普通 Java 类，把 Project SDK、Module SDK 和运行配置 JRE 都改为 Java 8，再完整放入
下面代码。终端仍使用 `javac -encoding UTF-8 TeamFlowStringApplication.java` 和
`java TeamFlowStringApplication`；这份代码把 `strip` 换成 `trim`、把 `isBlank` 换成
`trim().isEmpty()`，其余处理顺序保持相同。

```java
public final class TeamFlowStringApplication {
    /**
     * 判断命令是否包含按顺序出现的两个分隔符。
     *
     * @param command TeamFlow 命令文本
     * @return 两个分隔符存在且顺序正确时返回 true
     */
    static boolean hasTwoSeparators(String command) {
        int first = command.indexOf('|');
        int last = command.lastIndexOf('|');
        return first > 0 && last > first;
    }

    /**
     * 取出 task|title|state 命令的标题字段。
     *
     * @param command 已通过格式检查的命令文本
     * @return 两个分隔符之间的标题
     */
    static String extractTitle(String command) {
        int first = command.indexOf('|');
        int last = command.lastIndexOf('|');
        return command.substring(first + 1, last);
    }

    /**
     * 清理标题首尾普通空格并把 TeamFlow 示例中的下划线换成空格。
     *
     * @param rawTitle 原始标题
     * @return 可展示的标题
     */
    static String cleanTitle(String rawTitle) {
        return rawTitle.trim().replace('_', ' ');
    }

    /**
     * 把命令状态转换成面向学习者的中文状态。
     *
     * @param rawState 原始状态文本
     * @return done 对应已完成，其余状态对应进行中
     */
    static String displayState(String rawState) {
        String state = rawState.trim();
        if ("done".equalsIgnoreCase(state)) {
            return "已完成";
        }
        return "进行中";
    }

    /**
     * 运行 TeamFlow 字符串处理示例。
     */
    public static void main(String[] args) {
        String command = "task|  修复_登录页  |done";
        if (!hasTwoSeparators(command)) {
            System.out.println("命令格式错误");
            return;
        }

        int first = command.indexOf('|');
        int last = command.lastIndexOf('|');
        String kind = command.substring(0, first);
        String title = cleanTitle(extractTitle(command));
        String state = displayState(command.substring(last + 1));

        if (!"task".equalsIgnoreCase(kind) || title.trim().isEmpty()) {
            System.out.println("命令内容错误");
            return;
        }

        System.out.println("项目=TeamFlow");
        System.out.println("类型=" + kind);
        System.out.println("标题=" + title);
        System.out.println("状态=" + state);
        System.out.println("摘要=TeamFlow - " + title + " - " + state);
    }
}
```

Java 8 的预期输出与 JDK 25 完全相同。现代版本的 `strip/isBlank` 和兼容版本的 `trim/isEmpty` 都只
承担空白清理与判断；本例输入使用普通空格，所以两版结果一致。

### 4. 观察执行过程

`hasTwoSeparators` 先得到索引 4 和 15，格式通过后才允许截取；`extractTitle` 使用左闭右开区间取出
中间文本；`cleanTitle` 接住两个连续操作返回的新字符串；`displayState` 用内容比较映射状态。最后五
条输出都是由这些中间字符串拼接而成，而不是由框架或隐藏的业务对象产生。

## 八、练习与参考实现

:::exercise
### 练习：解析 TeamFlow 项目标识

**要求：** 创建 `TeamFlowStringPractice.java`，处理固定输入 `project|  API_联调  |active`。使用
`indexOf`、`lastIndexOf` 和 `substring` 取出类型、标题、状态；标题去掉首尾空白并把下划线换成空格；
使用内容比较把 `active` 映射为 `进行中`。不得使用正则、集合或 `StringBuilder`。

**验收：** JDK 25 与 Java 8 都能运行并精确输出 `类型=project`、`标题=API 联调`、`状态=进行中` 三行；
如果输入没有两个分隔符，程序必须输出 `命令格式错误`，不能把 `-1` 传给 `substring`。

**参考答案：** 先保存第一个和最后一个竖线索引并检查 `first > 0 && last > first`；现代版本使用
`strip/isBlank`，Java 8 版本使用 `trim/isEmpty`，其余算法保持相同。

:::

### 1. JDK 25 参考实现

```java
public final class TeamFlowStringPractice {
    /**
     * 把练习状态转换成中文状态。
     *
     * @param state 原始状态
     * @return active 对应进行中，其余状态对应未开始
     */
    static String displayState(String state) {
        if ("active".equalsIgnoreCase(state.strip())) {
            return "进行中";
        }
        return "未开始";
    }

    /**
     * 运行 JDK 25 练习参考实现。
     */
    public static void main(String[] args) {
        String command = "project|  API_联调  |active";
        int first = command.indexOf('|');
        int last = command.lastIndexOf('|');
        if (first <= 0 || last <= first) {
            System.out.println("命令格式错误");
            return;
        }

        String kind = command.substring(0, first);
        String title = command.substring(first + 1, last).strip().replace('_', ' ');
        String state = displayState(command.substring(last + 1));
        if (title.isBlank()) {
            System.out.println("命令格式错误");
            return;
        }

        System.out.println("类型=" + kind);
        System.out.println("标题=" + title);
        System.out.println("状态=" + state);
    }
}
```

### 2. Java 8 参考实现

```java
public final class TeamFlowStringPractice {
    /**
     * 把练习状态转换成中文状态。
     *
     * @param state 原始状态
     * @return active 对应进行中，其余状态对应未开始
     */
    static String displayState(String state) {
        if ("active".equalsIgnoreCase(state.trim())) {
            return "进行中";
        }
        return "未开始";
    }

    /**
     * 运行 Java 8 练习参考实现。
     */
    public static void main(String[] args) {
        String command = "project|  API_联调  |active";
        int first = command.indexOf('|');
        int last = command.lastIndexOf('|');
        if (first <= 0 || last <= first) {
            System.out.println("命令格式错误");
            return;
        }

        String kind = command.substring(0, first);
        String title = command.substring(first + 1, last).trim().replace('_', ' ');
        String state = displayState(command.substring(last + 1));
        if (title.trim().isEmpty()) {
            System.out.println("命令格式错误");
            return;
        }

        System.out.println("类型=" + kind);
        System.out.println("标题=" + title);
        System.out.println("状态=" + state);
    }
}
```

两版参考实现的预期输出都是：

```text
类型=project
标题=API 联调
状态=进行中
```

完成后再把输入改成 `project-without-separators`，两版都应只输出 `命令格式错误`；这验证的是
`indexOf` 返回 `-1` 后的分支，而不是靠运行时异常判断格式。

本课完成后，看到一段 Java 文本时，你应该能说明它是否需要内容比较、哪个位置合法、查找失败如何处理、
截取边界是否左闭右开，以及 JDK 25 和 Java 8 应该选择哪套空白 API。
