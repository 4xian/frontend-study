---
id: backend.java.learn.basics.text-building-and-formatting
type: lesson
title: 文本构建与格式化
summary: 使用 StringBuilder 分步组装文本，并用明确的占位符和 Locale 生成稳定、可核对的 TeamFlow 报告
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 110
prerequisites:
  - backend.java.learn.basics.null-optional-and-failure-semantics
objectives:
  - 能根据文本是否需要分步修改，在 String、StringBuilder 和格式字符串之间做出选择。
  - 能使用 append、insert、delete、replace、length 与 toString 完成文本构建。
  - 能解释格式说明符中的转换符、宽度和精度，并正确输出百分号与换行。
  - 能使用显式 Locale 固定数值格式，并识别参数数量、参数类型和 null 带来的风险。
  - 能分别在 JDK 25 与 Java 8 中完成 TeamFlow 文本报告程序。
recap:
  - StringBuilder 保存可变字符序列，适合在循环或分支中逐步追加；最终通过 toString 取得 String。
  - append、insert、delete 和 replace 都修改当前 builder，区间操作仍使用左闭右开边界。
  - 格式说明符由百分号开头并以转换符结束；%s、%d、%f、%% 和 %n 各有明确合同。
  - 格式化不会自动修正参数数量和类型，合同不匹配会抛出 IllegalFormatException 的具体子类。
  - 默认格式 Locale 会影响小数符号等结果，固定文本合同应显式传入 Locale.ROOT。
  - JDK 25 可使用 String.formatted，Java 8 使用 String.format；StringBuilder 核心写法在两版一致。
related:
  - backend.java.learn.basics.strings-encoding-and-text-matching
  - backend.java.learn.basics.null-optional-and-failure-semantics
tags:
  - Java
  - StringBuilder
  - String.format
  - Formatter
  - Locale
  - 文本报告
appliesTo: JDK 25 主线；Java 8 兼容写法见正文
verifiedAt: 2026-08-18
sources:
  - id: java-25-string-builder
    title: Java SE 25 API - StringBuilder
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/StringBuilder.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - StringBuilder 的可变字符序列、容量、线程边界以及 append、insert、delete、replace、length 和 toString 合同
      - append String 或 CharSequence 时 null 会被转换为四个字符 null
      - StringBuilder 没有覆盖 equals，不能用它比较字符序列内容
  - id: java-8-string-builder
    title: Java Platform SE 8 API - StringBuilder
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/StringBuilder.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 已提供本课使用的 StringBuilder 核心构建、区间修改、容量与 toString 合同
      - Java 8 的 append null 与内容比较边界和 JDK 25 一致
  - id: java-25-string-format
    title: Java SE 25 API - String
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - String.format 的显式 Locale 重载以及默认格式 Locale 行为
      - String.formatted 等价于以当前字符串作为格式模板调用 String.format，并自 Java 15 提供
  - id: java-8-string-format
    title: Java Platform SE 8 API - String
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/String.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 提供 String.format 的默认 Locale 与显式 Locale 重载
      - Java 8 的 String API 尚未提供实例方法 formatted
  - id: java-25-formatter
    title: Java SE 25 API - Formatter
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Formatter.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - 格式说明符、常用转换符、宽度、精度、百分号、平台换行与 Locale 规则
      - 参数类型或数量不匹配时的格式异常，以及多数常用转换对 null 的输出行为
  - id: java-8-formatter
    title: Java Platform SE 8 API - Formatter
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Formatter.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 已提供本课采用的 Formatter 说明符、Locale 和异常合同
  - id: dev-java-string-builders
    title: Dev.java - String Builders
    url: https://dev.java/learn/numbers-strings/string-builders
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java SE
    claims:
      - String 与 StringBuilder 的可修改性区别以及构建器的长度、容量和主要操作
      - 应根据代码清晰度和实际构建过程选择 String 或 StringBuilder
  - id: stack-overflow-format-locale
    title: Force point as decimal separator in Java
    url: https://stackoverflow.com/questions/5236056/force-point-as-decimal-separator-in-java
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 6 及以上；本课已在 JDK 25 与 Java 8 复现
    claims:
      - 默认 Locale 导致相同 String.format 模板输出逗号小数符号是真实环境误区
  - id: stack-overflow-string-builder-null
    title: StringBuilder appends null as null
    url: https://stackoverflow.com/questions/17315631/stringbuilder-appends-null-as-null
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 及以上；本课已在 JDK 25 与 Java 8 复现
    claims:
      - 开发者会误以为 StringBuilder.append 会忽略 null，实际输出文字 null
---

# 文本构建与格式化

TeamFlow 已经能够查询任务并处理可能缺失的结果。接下来要把任务编号、标题、状态和完成率组织成一段
稳定文本：字段顺序要清楚，多行内容要逐步累积，数字在不同电脑上也要保持约定的样子。

本课只解决“怎样构建并格式化文本”。字符串查找与截取已经在前面的字符串课程完成；文件、字符编码、
CSV、JSON 和导入导出协议留给下一课，不在这里提前设计。

## 一、先按构建过程选择工具

### 1. 固定短文本继续使用 String

一条表达式就能看懂的短文本，直接使用 `String` 和 `+` 更清楚。不要因为看到“拼接”就机械创建
`StringBuilder`：

```java
String taskId = "TASK-101";
String status = "已完成";
String label = taskId + " - " + status;

System.out.println(label); // TASK-101 - 已完成
```

这里的字段数量固定，没有循环，也不需要回到中间位置修改。`String` 的不可变性让最终值直接可用，
`StringBuilder` 不会带来额外的表达力。

### 2. 分支和循环中的累积使用 StringBuilder

一份报告会先写标题，再根据任务数量追加若干行，最后追加汇总。此时内容在同一个构建过程中逐步增长，
`StringBuilder` 能明确表达“修改当前字符序列”：

```java
StringBuilder report = new StringBuilder();
report.append("TeamFlow 任务周报").append('\n');
report.append("TASK-101").append(" | ").append("已完成").append('\n');

System.out.print(report.toString());
```

`append` 返回当前 builder，因此可以连续调用。每次调用都改变 `report` 的内容；最后的 `toString()` 才
取得通常交给日志、文件或接口边界的不可变 `String`。

### 3. toString 得到当前时刻的文本快照

`toString()` 返回调用时字符序列对应的 `String`。之后继续修改 builder，不会反过来改掉已经取得的
字符串：

```java
StringBuilder builder = new StringBuilder("TASK-101");
String taskId = builder.toString();

builder.append(" | 已完成");

System.out.println(taskId); // TASK-101
System.out.println(builder); // TASK-101 | 已完成
```

这条边界很重要：builder 是构建期间的可变工作区，`String` 是某一时刻的结果。不要把 builder 长期
暴露给只需要读取最终文本的调用方。

## 二、用 StringBuilder 精确修改字符序列

### 1. append 和 insert 分别处理末尾与中间位置

`append(value)` 把值放在末尾；`insert(offset, value)` 在指定偏移位置前插入。两者都返回当前 builder：

```java
StringBuilder label = new StringBuilder("TASK-101");
label.append(" - 修复登录页");
label.insert(0, "[P1] ");

System.out.println(label); // [P1] TASK-101 - 修复登录页
```

插入位置可以等于 `length()`，此时效果与追加相同；小于 0 或大于当前长度会越界。偏移量描述的是
`char` 位置，和 `String` 的索引规则一致。

### 2. delete 和 replace 使用左闭右开区间

`delete(start, end)` 删除从 `start` 开始、到 `end` 之前的内容；`replace(start, end, text)` 用新文本
替换同样的左闭右开区间：

```java
StringBuilder line = new StringBuilder("TASK-101 | 待处理");
int start = line.indexOf("待处理");
line.replace(start, line.length(), "已完成");

System.out.println(line); // TASK-101 | 已完成
```

若要删除末尾多余的分隔符，可以保存追加前的位置，再把 `[start, length())` 删除；不要凭肉眼写一个
容易随内容变化的固定数字。

```java
StringBuilder ids = new StringBuilder("TASK-101, TASK-102, ");
ids.delete(ids.length() - 2, ids.length());

System.out.println(ids); // TASK-101, TASK-102
```

### 3. length 是内容长度，capacity 是当前容量

`length()` 是已经写入的 `char` 数量，`capacity()` 是无需立即扩容即可容纳的数量。追加后如果长度超过
当前容量，builder 会自动扩大容量：

```java
StringBuilder text = new StringBuilder(4);
text.append("TeamFlow");

System.out.println(text.length()); // 8
System.out.println(text.capacity() >= text.length()); // true
```

业务判断应使用 `length()`，不要用 `capacity()` 判断文本是否为空或已经写了多少内容。只有通过实际
测量确认扩容成本值得优化时，才需要预估初始容量；本课不靠手工容量制造“性能优化”。

### 4. 每次报告拥有自己的 builder

builder 适合由一个方法在一次构建过程中独占。下一份报告应创建新的 builder；确实复用同一个局部对象
时，要先用 `setLength(0)` 清空已有字符：

```java
StringBuilder line = new StringBuilder();
line.append("TASK-101");
System.out.println(line); // TASK-101

line.setLength(0);
line.append("TASK-102");
System.out.println(line); // TASK-102
```

`StringBuilder` 不是多线程安全容器。本课只把它放在方法局部变量中，不把一个静态 builder 分享给多个
请求；线程同步和并发集合属于后续专项内容。

## 三、用格式说明符固定文本结构

### 1. 占位符把模板和数据分开

`String.format(locale, template, arguments)` 按模板生成新字符串。格式说明符以 `%` 开头，以转换符
结束；转换符决定参数应当是什么类型以及如何显示：

| 写法 | 当前课程中的含义 | 示例结果 |
| --- | --- | --- |
| `%s` | 通用文本 | `TASK-101` |
| `%d` | 十进制整数 | `3` |
| `%.2f` | 保留两位小数的浮点格式 | `66.67` |
| `%%` | 输出一个百分号，不消费参数 | `%` |
| `%n` | 输出当前平台的行分隔符，不消费参数 | 换行 |

```java
String summary = String.format(
    java.util.Locale.ROOT,
    "%s：%d/%d，完成率：%.2f%%%n",
    "TeamFlow",
    Integer.valueOf(2),
    Integer.valueOf(3),
    Double.valueOf(66.666)
);

System.out.print(summary); // TeamFlow：2/3，完成率：66.67%
```

模板里有四个消费参数的说明符，对应四个实参；`%%` 和 `%n` 不消费实参。格式化只负责展示，不会把
字符串 `"3"` 自动当成 `%d` 所需的整数。

### 2. 宽度和精度解决的是不同问题

宽度表示结果至少占多少个位置，精度的含义由转换符决定。对 `%f`，`.2` 表示小数点后两位；宽度不足
时不会截断更长的值：

```java
String row = String.format(
    java.util.Locale.ROOT,
    "| %-8s | %6.2f |",
    "TASK-1",
    Double.valueOf(7.5)
);

System.out.println(row); // | TASK-1   |   7.50 |
```

`-` 让文本在给定宽度内左对齐，`6.2f` 让数值至少占 6 个位置并保留两位小数。Formatter 的宽度按
字符数量工作，不保证中文、表情或终端字体一定产生像素级对齐；面向网页的布局仍应交给前端样式。

### 3. Locale 决定数值的本地化形式

不传 Locale 的 `String.format(template, args)` 使用 JVM 当前的默认格式 Locale。相同的 `%.2f` 在
不同 Locale 下可能使用点或逗号作为小数符号：

```java
String root = String.format(java.util.Locale.ROOT, "%.2f", Double.valueOf(12.5));
String german = String.format(java.util.Locale.GERMANY, "%.2f", Double.valueOf(12.5));

System.out.println(root); // 12.50
System.out.println(german); // 12,50
```

两种输出都符合各自 Locale。给用户看的本地化文本应选择目标地区；要写入固定日志、测试期望或机器间
交换的文本时，应显式使用合同指定的 Locale。本课的 TeamFlow 示例选择 `Locale.ROOT`，因此在不同机器
上都使用点作为小数符号。

## 四、处理 JDK 25 与 Java 8 的真实差异

### 1. StringBuilder 与 String.format 的核心写法相同

本课使用的 `StringBuilder` 构造器、`append`、`insert`、`delete`、`replace`、`length`、`capacity`、
`setLength` 和 `toString` 在 JDK 25 与 Java 8 中都可用。两版也都支持带 Locale 的
`String.format`、本课列出的说明符以及相同的格式异常合同。

因此，Java 8 不需要把 builder 改成别的容器，也不需要删除显式 Locale。版本差异集中在下面的
`String.formatted` 实例方法。

### 2. JDK 25 可以从模板调用 formatted

JDK 25 可以让字符串模板直接调用 `formatted(arguments)`：

```java
String title = "%s %s".formatted("TeamFlow", "任务周报");
System.out.println(title); // TeamFlow 任务周报
```

Oracle API 说明该方法等价于把当前字符串作为模板调用 `String.format(this, args)`，并标明它自 Java 15
提供。它没有接收 Locale 的重载，所以会使用默认格式 Locale；只要输出包含小数等本地化值，本课仍优先
使用 `String.format(Locale.ROOT, template, args)`。

### 3. Java 8 使用 String.format

Java 8 的 `String` 没有 `formatted`。同一标题使用静态方法，并保留完整模板与参数：

```java
String title = String.format(
    java.util.Locale.ROOT,
    "%s %s",
    "TeamFlow",
    "任务周报"
);
System.out.println(title); // TeamFlow 任务周报
```

这不是把所有现代代码机械改旧，只替换真实不存在的实例方法。两版都继续使用传统 `main` 入口和
相同的 builder 流程。

### 4. 构建器与格式模板可以分工

一份多行报告可以让 `String.format` 负责“每一行长什么样”，让 `StringBuilder` 负责“有多少行以及按
什么顺序出现”：

```java
StringBuilder report = new StringBuilder("TeamFlow 任务周报").append(System.lineSeparator());

for (int index = 1; index <= 2; index++) {
    report.append(String.format(
        java.util.Locale.ROOT,
        "TASK-%03d | 待处理%n",
        Integer.valueOf(index)
    ));
}

System.out.print(report.toString());
```

循环决定两行，`%03d` 决定编号至少三位并在左侧补零，builder 保留标题与任务行的顺序。不要把整个
报告硬塞进一个不断增长的格式模板，也不要为了一个固定短句创建复杂构建器。

## 五、集中排除文本构建中的真实误用

**社区补充：** Stack Overflow 中有开发者在另一台设备上观察到 `String.format("%.2f", value)` 输出
逗号小数符号，也有人以为 `StringBuilder.append(null)` 会什么都不做。两项现象都已在 JDK 25 与
Java 8 的独立环境复现；下面同时给出官方合同和可重复验证方式。

:::pitfalls
### 用 equals 比较两个 StringBuilder 的内容

**触发条件：** 两个 builder 打印结果相同，直接调用 `left.equals(right)`。

**原因：** `StringBuilder` 没有覆盖基于字符内容的 `equals`；继承的方法比较对象身份。

**后果：** 同样的报告内容被判为不同，缓存或验收分支得到错误结果。

**错误示例：**

```java
StringBuilder left = new StringBuilder("TASK-101");
StringBuilder right = new StringBuilder("TASK-101");
System.out.println(left.equals(right)); // false
```

**正确写法：**

```java
boolean same = left.toString().equals(right.toString());
System.out.println(same); // true
```

**验证方式：** 分别运行两段比较；错误版输出 `false`，先取得两个 String 快照的正确版输出 `true`。

### 复用 builder 却没有清空旧内容

**触发条件：** 用同一个局部 builder 生成第二条任务行时直接继续 append。

**原因：** builder 是可变对象，第一条结果在 `toString()` 后仍保留在当前对象中。

**后果：** 第二行意外带上第一行，报告出现重复或黏连文本。

**错误示例：**

```java
StringBuilder line = new StringBuilder();
line.append("TASK-101");
String first = line.toString();
line.append("TASK-102");
String second = line.toString();
```

**正确写法：**

```java
StringBuilder line = new StringBuilder();
line.append("TASK-101");
String first = line.toString();
line.setLength(0);
line.append("TASK-102");
String second = line.toString();
```

**验证方式：** 输出 `first` 和 `second`；错误版第二项是 `TASK-101TASK-102`，正确版依次是
`TASK-101` 与 `TASK-102`。

### 把 delete 的结束位置当成包含边界

**触发条件：** 删除末尾逗号时使用 `delete(length - 2, length - 1)`，却期望同时删除逗号和空格。

**原因：** delete 的结束位置不包含在删除范围内，规则与 substring 相同。

**后果：** 报告末尾残留一个空格或分隔符；继续减错索引还可能越界。

**错误示例：**

```java
StringBuilder ids = new StringBuilder("TASK-101, ");
ids.delete(ids.length() - 2, ids.length() - 1);
System.out.println("[" + ids + "]"); // [TASK-101 ]
```

**正确写法：**

```java
StringBuilder ids = new StringBuilder("TASK-101, ");
ids.delete(ids.length() - 2, ids.length());
System.out.println("[" + ids + "]"); // [TASK-101]
```

**验证方式：** 使用方括号显示文本边界；错误版右方括号前仍有空格，正确版没有逗号和尾随空格。

### 误以为 append 会忽略 null

**触发条件：** 可能缺失的负责人直接传给 `builder.append(owner)`。

**原因：** StringBuilder 对 String 或 CharSequence 的 null 参数追加四个字符 `null`，不会自动跳过。

**后果：** 面向用户的报告静默出现 `负责人：null`，缺失值合同被伪装成普通文本。

**错误示例：**

```java
String owner = null;
StringBuilder line = new StringBuilder("负责人：");
line.append(owner);
System.out.println(line); // 负责人：null
```

**正确写法：**

```java
String owner = null;
String displayOwner = owner == null ? "待分配" : owner;
StringBuilder line = new StringBuilder("负责人：");
line.append(displayOwner);
System.out.println(line); // 负责人：待分配
```

**验证方式：** 分别传入 null 和 `"林夏"`；正确版明确输出 `待分配` 或真实姓名，不出现意外的
`null` 文本。

### 占位符与参数类型不匹配

**触发条件：** 模板使用 `%d`，实参却是看起来像数字的字符串 `"3"`。

**原因：** `%d` 要求整数类别参数，Formatter 不负责把 String 解析成整数。

**后果：** 运行时抛出 `IllegalFormatConversionException`，报告在生成途中失败。

**错误示例：**

```java
String progress = String.format(java.util.Locale.ROOT, "%d", "3");
```

**正确写法：**

```java
String progress = String.format(
    java.util.Locale.ROOT,
    "%d",
    Integer.valueOf(3)
);
System.out.println(progress); // 3
```

**验证方式：** 运行错误版应得到 `IllegalFormatConversionException`；正确版输出 `3`。

### 占位符数量多于参数数量

**触发条件：** 模板包含两个 `%s`，调用时只提供一个实参。

**原因：** 第二个说明符找不到对应参数，Formatter 不会自动补空文本。

**后果：** 运行时抛出 `MissingFormatArgumentException`，无法得到部分结果。

**错误示例：**

```java
String line = String.format("%s | %s", "TASK-101");
```

**正确写法：**

```java
String line = String.format(
    java.util.Locale.ROOT,
    "%s | %s",
    "TASK-101",
    "已完成"
);
System.out.println(line); // TASK-101 | 已完成
```

**验证方式：** 运行错误版应得到 `MissingFormatArgumentException`；正确版逐字输出
`TASK-101 | 已完成`。

### 把普通百分号直接写进格式模板

**触发条件：** 在格式模板末尾写 `"完成率：%.1f%"`。

**原因：** 模板中的 `%` 会开始新的格式说明符；要输出普通百分号必须写成 `%%`。

**后果：** 运行时得到未知或不完整格式转换异常，完成率文本无法生成。

**错误示例：**

```java
String rate = String.format(
    java.util.Locale.ROOT,
    "完成率：%.1f%",
    Double.valueOf(66.7)
);
```

**正确写法：**

```java
String rate = String.format(
    java.util.Locale.ROOT,
    "完成率：%.1f%%",
    Double.valueOf(66.7)
);
System.out.println(rate); // 完成率：66.7%
```

**验证方式：** 错误版应以格式异常结束；正确版输出一个且仅一个百分号。

### 依赖默认 Locale 生成固定合同文本

**触发条件：** 使用 `String.format("%.2f", value)` 生成要比较、记录或交换的固定文本。

**原因：** 没有显式 Locale 时会使用当前 JVM 的默认格式 Locale，小数符号可能随运行环境改变。

**后果：** 同一程序在一台机器输出 `12.50`，在另一台机器输出 `12,50`，测试和下游解析不稳定。

**错误示例：**

```java
String amount = String.format("%.2f", Double.valueOf(12.5));
```

**正确写法：**

```java
String amount = String.format(
    java.util.Locale.ROOT,
    "%.2f",
    Double.valueOf(12.5)
);
System.out.println(amount); // 12.50
```

**验证方式：** 分别把默认格式 Locale 设为 `Locale.ROOT` 和 `Locale.GERMANY` 运行错误版，可观察点与
逗号两种结果；正确版两次都输出 `12.50`。验证后不要在应用中遗留全局 Locale 修改。

### 在 Java 8 中调用 String.formatted

**触发条件：** 项目 SDK 和编译器使用 Java 8，却保留模板的 `formatted` 调用。

**原因：** `String.formatted` 自 Java 15 才提供，Java 8 的 String API 没有该方法。

**后果：** Java 8 编译器报告找不到 `formatted`，程序不能启动。

**错误示例：**

```java
String title = "%s 任务周报".formatted("TeamFlow");
```

**正确写法：**

```java
String title = String.format(
    java.util.Locale.ROOT,
    "%s 任务周报",
    "TeamFlow"
);
System.out.println(title); // TeamFlow 任务周报
```

**验证方式：** 用 Java 8 编译两段代码；错误版应报告找不到方法，正确版编译运行并输出预期标题。
:::

## 六、完整程序：生成 TeamFlow 任务周报

### 1. 程序目标与运行配置

程序使用三条固定任务数据。每一行由 `String.format` 负责字段顺序，整份多行报告由
`StringBuilder` 负责累积；最后计算已完成数量和完成率，并使用 `Locale.ROOT` 固定小数点。

JDK 25 版本在 IntelliJ IDEA 中创建 `TeamFlowTextReportApplication`，把 Project SDK、Module SDK 和
运行配置 JRE 设为 JDK 25，粘贴完整代码后运行 `main`。终端可执行
`javac -encoding UTF-8 TeamFlowTextReportApplication.java`，再执行
`java TeamFlowTextReportApplication`。

### 2. JDK 25 完整代码

```java
import java.util.Locale;

public final class TeamFlowTextReportApplication {
    /**
     * 把一组任务构建成完整的 TeamFlow 周报。
     *
     * @param tasks 本次报告中的任务
     * @return 包含标题、任务行和汇总行的文本
     */
    private static String buildReport(Task[] tasks) {
        StringBuilder report = new StringBuilder();
        String heading = "%s %s".formatted("TeamFlow", "任务周报");
        report.append(heading).append(System.lineSeparator());

        int completedCount = 0;
        for (Task task : tasks) {
            report.append(formatTask(task));
            if (task.isCompleted()) {
                completedCount++;
            }
        }

        double rate = tasks.length == 0
            ? 0.0
            : completedCount * 100.0 / tasks.length;
        report.append(String.format(
            Locale.ROOT,
            "完成进度：%d/%d（%.1f%%）%n",
            Integer.valueOf(completedCount),
            Integer.valueOf(tasks.length),
            Double.valueOf(rate)
        ));
        return report.toString();
    }

    /**
     * 把一条任务格式化为周报中的一行。
     *
     * @param task 要展示的任务
     * @return 带平台换行符的任务行
     */
    private static String formatTask(Task task) {
        String status = task.isCompleted() ? "已完成" : "进行中";
        return String.format(
            Locale.ROOT,
            "%s | %s | %s%n",
            task.getId(),
            task.getTitle(),
            status
        );
    }

    /**
     * 创建固定任务并输出 TeamFlow 周报。
     */
    public static void main(String[] args) {
        Task[] tasks = {
            new Task("TASK-101", "准备项目周报", true),
            new Task("TASK-102", "整理评审记录", false),
            new Task("TASK-103", "确认发布清单", true)
        };

        System.out.print(buildReport(tasks));
    }

    private static final class Task {
        private final String id;
        private final String title;
        private final boolean completed;

        /**
         * 创建一条用于文本报告的固定任务。
         *
         * @param id 任务编号
         * @param title 任务标题
         * @param completed 是否已经完成
         */
        private Task(String id, String title, boolean completed) {
            this.id = id;
            this.title = title;
            this.completed = completed;
        }

        /**
         * 返回任务编号。
         *
         * @return 任务编号
         */
        private String getId() {
            return id;
        }

        /**
         * 返回任务标题。
         *
         * @return 任务标题
         */
        private String getTitle() {
            return title;
        }

        /**
         * 返回任务是否完成。
         *
         * @return 已完成时返回 true
         */
        private boolean isCompleted() {
            return completed;
        }
    }
}
```

### 3. 运行结果与关键过程

预期控制台输出：

```text
TeamFlow 任务周报
TASK-101 | 准备项目周报 | 已完成
TASK-102 | 整理评审记录 | 进行中
TASK-103 | 确认发布清单 | 已完成
完成进度：2/3（66.7%）
```

程序先把标题写入 builder。循环每次调用 `formatTask` 得到一条结构一致的字符串，再按任务顺序追加；
同时只在已完成分支增加计数。循环结束后，`2 * 100.0 / 3` 得到约 `66.666...`，`%.1f` 把展示结果
舍入为 `66.7`，`%%` 输出百分号，`%n` 写入当前平台的行分隔符。最后一次 `toString()` 才取得完整周报。

标题中的两个 `%s` 不受小数 Locale 影响，因此 JDK 25 用 `formatted` 展示现代写法；完成率使用带
`Locale.ROOT` 的 `String.format`，避免默认环境改变小数符号。

### 4. Java 8 完整代码

为兼容版本使用独立的 IDEA 项目或源码目录，把 Project SDK、Module SDK 和运行配置 JRE 都设为
Java 8。下面是完整代码，不能只把现代项目的运行 JRE 改成 8；代码中的标题格式化也必须同步替换。
终端命令仍是 `javac -encoding UTF-8 TeamFlowTextReportApplication.java` 和
`java TeamFlowTextReportApplication`。

```java
import java.util.Locale;

public final class TeamFlowTextReportApplication {
    /**
     * 把一组任务构建成完整的 TeamFlow 周报。
     *
     * @param tasks 本次报告中的任务
     * @return 包含标题、任务行和汇总行的文本
     */
    private static String buildReport(Task[] tasks) {
        StringBuilder report = new StringBuilder();
        String heading = String.format(
            Locale.ROOT,
            "%s %s",
            "TeamFlow",
            "任务周报"
        );
        report.append(heading).append(System.lineSeparator());

        int completedCount = 0;
        for (Task task : tasks) {
            report.append(formatTask(task));
            if (task.isCompleted()) {
                completedCount++;
            }
        }

        double rate = tasks.length == 0
            ? 0.0
            : completedCount * 100.0 / tasks.length;
        report.append(String.format(
            Locale.ROOT,
            "完成进度：%d/%d（%.1f%%）%n",
            Integer.valueOf(completedCount),
            Integer.valueOf(tasks.length),
            Double.valueOf(rate)
        ));
        return report.toString();
    }

    /**
     * 把一条任务格式化为周报中的一行。
     *
     * @param task 要展示的任务
     * @return 带平台换行符的任务行
     */
    private static String formatTask(Task task) {
        String status = task.isCompleted() ? "已完成" : "进行中";
        return String.format(
            Locale.ROOT,
            "%s | %s | %s%n",
            task.getId(),
            task.getTitle(),
            status
        );
    }

    /**
     * 创建固定任务并输出 TeamFlow 周报。
     */
    public static void main(String[] args) {
        Task[] tasks = {
            new Task("TASK-101", "准备项目周报", true),
            new Task("TASK-102", "整理评审记录", false),
            new Task("TASK-103", "确认发布清单", true)
        };

        System.out.print(buildReport(tasks));
    }

    private static final class Task {
        private final String id;
        private final String title;
        private final boolean completed;

        /**
         * 创建一条用于文本报告的固定任务。
         *
         * @param id 任务编号
         * @param title 任务标题
         * @param completed 是否已经完成
         */
        private Task(String id, String title, boolean completed) {
            this.id = id;
            this.title = title;
            this.completed = completed;
        }

        /**
         * 返回任务编号。
         *
         * @return 任务编号
         */
        private String getId() {
            return id;
        }

        /**
         * 返回任务标题。
         *
         * @return 任务标题
         */
        private String getTitle() {
            return title;
        }

        /**
         * 返回任务是否完成。
         *
         * @return 已完成时返回 true
         */
        private boolean isCompleted() {
            return completed;
        }
    }
}
```

### 5. 两个版本的差异落点

两份程序的任务数据、builder 生命周期、任务行模板、Locale、完成率计算和输出完全相同。唯一 API
差异是标题：JDK 25 使用 `"%s %s".formatted(...)`，Java 8 使用完整的
`String.format(Locale.ROOT, "%s %s", ...)`。两版都应得到上面逐字相同的控制台内容。

## 七、练习：构建发布任务清单

:::exercise
### 生成带优先级的发布清单

**要求：** 创建 `TeamFlowReleaseListApplication`。使用两个固定任务对象；每一行先用一个局部
StringBuilder 追加任务编号和标题，再用 insert 把优先级放到行首。使用另一个 StringBuilder 累积标题、
两条任务行和总数；固定数值格式必须显式传入 Locale.ROOT。JDK 25 标题至少使用一次 formatted，
Java 8 给出完整的 String.format 替代。不得读写文件、生成 CSV 或 JSON，也不得共享静态 builder。

**验收：** 两版都按固定顺序输出标题、`[P1]` 与 `[P2]` 两条任务以及总数 2；每条任务只出现一次，
不包含意外的 null 或尾随分隔符。所有方法和构造器上方保留中文 Javadoc。

**参考答案：** 每条任务由 formatTask 创建并返回 String 快照，buildList 只负责按顺序追加这些结果；
完整双版本实现如下。
:::

### 1. JDK 25 参考实现

```java
import java.util.Locale;

public final class TeamFlowReleaseListApplication {
    /**
     * 构建包含标题、任务行和总数的发布清单。
     *
     * @param tasks 发布任务
     * @return 完整发布清单文本
     */
    private static String buildList(ReleaseTask[] tasks) {
        StringBuilder output = new StringBuilder();
        output.append("%s %s".formatted("TeamFlow", "发布清单"));
        output.append(System.lineSeparator());

        for (ReleaseTask task : tasks) {
            output.append(formatTask(task));
        }

        output.append(String.format(
            Locale.ROOT,
            "任务总数：%d%n",
            Integer.valueOf(tasks.length)
        ));
        return output.toString();
    }

    /**
     * 使用追加和插入构建一条发布任务行。
     *
     * @param task 要展示的发布任务
     * @return 带平台换行符的任务行
     */
    private static String formatTask(ReleaseTask task) {
        StringBuilder line = new StringBuilder();
        line.append(task.getId()).append(" - ").append(task.getTitle());
        line.insert(0, "[" + task.getPriority() + "] ");
        line.append(System.lineSeparator());
        return line.toString();
    }

    /**
     * 创建固定发布任务并输出清单。
     */
    public static void main(String[] args) {
        ReleaseTask[] tasks = {
            new ReleaseTask("TASK-201", "修复登录页", "P1"),
            new ReleaseTask("TASK-202", "编写接口说明", "P2")
        };

        System.out.print(buildList(tasks));
    }

    private static final class ReleaseTask {
        private final String id;
        private final String title;
        private final String priority;

        /**
         * 创建一条固定发布任务。
         *
         * @param id 任务编号
         * @param title 任务标题
         * @param priority 优先级
         */
        private ReleaseTask(String id, String title, String priority) {
            this.id = id;
            this.title = title;
            this.priority = priority;
        }

        /**
         * 返回任务编号。
         *
         * @return 任务编号
         */
        private String getId() {
            return id;
        }

        /**
         * 返回任务标题。
         *
         * @return 任务标题
         */
        private String getTitle() {
            return title;
        }

        /**
         * 返回任务优先级。
         *
         * @return P1 或 P2 优先级
         */
        private String getPriority() {
            return priority;
        }
    }
}
```

### 2. Java 8 参考实现

```java
import java.util.Locale;

public final class TeamFlowReleaseListApplication {
    /**
     * 构建包含标题、任务行和总数的发布清单。
     *
     * @param tasks 发布任务
     * @return 完整发布清单文本
     */
    private static String buildList(ReleaseTask[] tasks) {
        StringBuilder output = new StringBuilder();
        output.append(String.format(
            Locale.ROOT,
            "%s %s",
            "TeamFlow",
            "发布清单"
        ));
        output.append(System.lineSeparator());

        for (ReleaseTask task : tasks) {
            output.append(formatTask(task));
        }

        output.append(String.format(
            Locale.ROOT,
            "任务总数：%d%n",
            Integer.valueOf(tasks.length)
        ));
        return output.toString();
    }

    /**
     * 使用追加和插入构建一条发布任务行。
     *
     * @param task 要展示的发布任务
     * @return 带平台换行符的任务行
     */
    private static String formatTask(ReleaseTask task) {
        StringBuilder line = new StringBuilder();
        line.append(task.getId()).append(" - ").append(task.getTitle());
        line.insert(0, "[" + task.getPriority() + "] ");
        line.append(System.lineSeparator());
        return line.toString();
    }

    /**
     * 创建固定发布任务并输出清单。
     */
    public static void main(String[] args) {
        ReleaseTask[] tasks = {
            new ReleaseTask("TASK-201", "修复登录页", "P1"),
            new ReleaseTask("TASK-202", "编写接口说明", "P2")
        };

        System.out.print(buildList(tasks));
    }

    private static final class ReleaseTask {
        private final String id;
        private final String title;
        private final String priority;

        /**
         * 创建一条固定发布任务。
         *
         * @param id 任务编号
         * @param title 任务标题
         * @param priority 优先级
         */
        private ReleaseTask(String id, String title, String priority) {
            this.id = id;
            this.title = title;
            this.priority = priority;
        }

        /**
         * 返回任务编号。
         *
         * @return 任务编号
         */
        private String getId() {
            return id;
        }

        /**
         * 返回任务标题。
         *
         * @return 任务标题
         */
        private String getTitle() {
            return title;
        }

        /**
         * 返回任务优先级。
         *
         * @return P1 或 P2 优先级
         */
        private String getPriority() {
            return priority;
        }
    }
}
```

### 3. 练习输出与自检

两个版本都应输出：

```text
TeamFlow 发布清单
[P1] TASK-201 - 修复登录页
[P2] TASK-202 - 编写接口说明
任务总数：2
```

`formatTask` 每次创建自己的 builder，所以两条任务不会黏在一起；`insert(0, ...)` 把优先级放到已经
构建好的任务文本之前；`toString()` 返回一条任务行的快照，外层 builder 再负责合并所有行。JDK 25
与 Java 8 仍只在标题格式化入口存在真实差异。

## 八、完成文本输出前的判断顺序

### 1. 从文本合同反推写法

1. 一条固定短文本先用 String；需要在循环或分支中逐步累积时再用局部 StringBuilder。
2. builder 的区间修改先计算真实 `char` 边界，最终结果通过 toString 交出。
3. 重复结构使用格式模板，逐项核对说明符数量、参数类型、百分号和换行。
4. 数值结果是否允许随地区变化必须明确；固定合同显式传入 Locale。
5. 最后在目标 JDK 编译运行：Java 8 没有 formatted，但支持本课其余核心构建与格式化写法。

下一课会使用这些已经稳定的文本行完成任务清单导入导出，并单独处理文件、编码和数据格式边界。
