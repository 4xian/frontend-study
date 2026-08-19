---
id: backend.java.learn.basics.file-reading-and-writing
type: lesson
title: 文件读写
summary: 用 Path 与 Files 明确文件位置、字符集和写入方式，完成可重复验证的文本与小型二进制读写
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 90
prerequisites:
  - backend.java.learn.basics.io-files-and-resource-ownership
objectives:
  - 能区分 Path 描述的位置与 Files 执行的文件系统操作。
  - 能解释相对路径如何受当前工作目录影响，并核对 IDEA 的 Working directory。
  - 能使用显式 UTF-8 写入、追加和读取文本文件。
  - 能根据覆盖、追加或拒绝覆盖的意图选择 StandardOpenOption。
  - 能区分适合整文件读取的小文件与需要缓冲逐行处理的较大文本。
  - 能为 JDK 25 与 Java 8 选择完整、可运行的文件读写实现。
recap:
  - Path 只描述位置，Files 才执行创建目录、打开、读取和写入等操作。
  - 相对路径从进程的当前工作目录开始解析，IDEA 与终端可能使用不同工作目录。
  - 文本读写应显式使用 UTF-8，避免把运行环境的默认字符集变成文件格式。
  - CREATE、TRUNCATE_EXISTING、APPEND 与 CREATE_NEW 表达不同的写入合同。
  - 整文件便利方法适合受控小文件，较大文本应使用可关闭的 BufferedReader 逐行处理。
  - JDK 25 可使用 Path.of、readString 和 writeString，Java 8 使用 Paths.get 与缓冲 Reader/Writer。
related: []
tags:
  - Java
  - Path
  - Files
  - UTF-8
  - StandardOpenOption
  - BufferedReader
appliesTo: JDK 25；Java 8
verifiedAt: 2026-08-18
sources:
  - id: java-25-path
    title: Java SE 25 API - Path
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Path.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - Path 表达文件系统位置、相对路径与 resolve 组合规则，Path.of 自 Java 11 提供
  - id: java-25-files
    title: Java SE 25 API - Files
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Files.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - 目录创建、文本与字节读写、缓冲打开方法以及 readString 和 writeString 的合同
  - id: java-25-standard-open-option
    title: Java SE 25 API - StandardOpenOption
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/StandardOpenOption.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - CREATE、CREATE_NEW、APPEND 与 TRUNCATE_EXISTING 的写入语义
  - id: java-8-files
    title: Java SE 8 API - Files
    url: https://docs.oracle.com/javase/8/docs/api/java/nio/file/Files.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 的 readAllLines、readAllBytes、write、newBufferedReader 与 newBufferedWriter 合同
  - id: java-8-paths
    title: Java SE 8 API - Paths
    url: https://docs.oracle.com/javase/8/docs/api/java/nio/file/Paths.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 使用 Paths.get 从默认文件系统构造 Path
  - id: dev-java-buffered-text
    title: Dev.java - Reading and Writing Text Files
    url: https://dev.java/learn/java-io/reading-writing/buffered-text/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java SE 8 及以上
    claims:
      - BufferedReader 逐行读取、EOF 与 BufferedWriter 文本写入方式
  - id: jep-400
    title: JEP 400 - UTF-8 by Default
    url: https://openjdk.org/jeps/400
    sourceOrigin: official
    sourceType: release-note
    appliesTo: JDK 18 及以上
    claims:
      - JDK 18 起默认字符集统一为 UTF-8，而更早版本可能随系统与区域设置变化
  - id: stackoverflow-relative-working-directory
    title: Is the relative path for a java project different for Intellij and cmd?
    url: https://stackoverflow.com/questions/75042131/is-the-relative-path-for-a-java-project-different-for-intellij-and-cmd
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: IntelliJ IDEA 与命令行 Java
    claims:
      - IDEA 运行配置与命令行所在目录不同会让同一相对路径落到不同位置
  - id: stackoverflow-missing-parent-directory
    title: NoSuchFileException when creating a file using nio
    url: https://stackoverflow.com/questions/30735735/nosuchfileexception-when-creating-a-file-using-nio
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 7 及以上
    claims:
      - 创建文件不会自动创建缺失的父目录，应先创建目录层级
---

# 文件读写

TeamFlow 需要把任务清单保存下来，下次运行时再读回来。第一次接触文件时，最容易把“文件放在哪里”、
“文字怎样变成字节”和“再次写入会覆盖还是追加”混在一起。本课把这三个决定拆开，让每次运行都有可观察、
可解释的结果。

本课只处理普通本地文件：小型 UTF-8 文本、少量原始字节和较大文本的逐行读取。随机访问、文件锁、压缩、
上传安全、符号链接边界与流式背压都留给后续专项课程。

## 一、先确定文件在哪里

### 1. Path 描述位置，Files 执行动作

`Path` 是一条文件系统位置描述。它可以表示尚不存在的目录或文件，并不因为变量创建出来就访问磁盘。
`Files` 才负责创建目录、读取、写入和检查属性：

```java
Path dataDirectory = Path.of("teamflow-data");
Path taskFile = dataDirectory.resolve("tasks.txt");
Files.createDirectories(dataDirectory);
```

第一行只得到路径 `teamflow-data`，第二行在它下面组合出 `tasks.txt`，第三行才执行文件系统操作。
`resolve` 让路径分段保持清楚，也避免手工拼接 Windows 与 macOS/Linux 不同的分隔符。

### 2. 相对路径从当前工作目录开始

`Path.of("teamflow-data", "tasks.txt")` 是相对路径。程序真正访问它时，会从当前进程的工作目录开始解析。
先输出下面的值，就能知道本次运行的起点：

```java
Path workingDirectory = Path.of("").toAbsolutePath().normalize();
System.out.println("工作目录: " + workingDirectory);
```

在 IntelliJ IDEA 中，打开 **Run -> Edit Configurations**，查看当前运行配置的 **Working directory**。
在终端中运行程序时，工作目录通常是执行 `java` 命令时所在的目录。两者不同，同一个相对路径就可能指向
不同文件；这不是 `Path` 随机变化，而是解析起点不同。

### 3. 创建文件前先准备父目录

写入方法可以按选项创建目标文件，但不会自动补齐所有父目录。先明确创建目录层级：

```java
Path taskFile = Path.of("teamflow-data", "tasks.txt");
Files.createDirectories(taskFile.getParent());
```

`createDirectories` 会创建缺失的层级；目录已经存在时不会因此失败。这里的 `getParent()` 是
`teamflow-data`，准备完成后才写 `tasks.txt`。

## 二、完成第一次文本读写

### 1. 用 JDK 25 写入并读回小文本

JDK 25 可以用 `Files.writeString` 和 `Files.readString` 处理受控的小文本：

```java
Path taskFile = Path.of("teamflow-data", "tasks.txt");
Files.createDirectories(taskFile.getParent());

String task = "TASK-101 | 准备迭代演示";
Files.writeString(taskFile, task, StandardCharsets.UTF_8);

String savedTask = Files.readString(taskFile, StandardCharsets.UTF_8);
System.out.println(savedTask);
```

运行后控制台输出 `TASK-101 | 准备迭代演示`。写入时字符按 UTF-8 编码成字节，读取时同样按 UTF-8
解码回来，所以中文保持一致。便利方法内部负责打开和关闭文件，本段没有需要调用者继续关闭的对象。

### 2. 为什么字符集必须成为文件合同

文本文件保存的是编码后的字节，不会自动携带“应该用哪种字符集读取”的 Java 变量。写入与读取必须约定
同一字符集。本课程统一显式使用：

```java
StandardCharsets.UTF_8
```

JDK 18 起，多数依赖默认字符集的标准 API 以 UTF-8 为默认；Java 8 的默认字符集仍可能随操作系统与区域
设置变化。即使某台电脑省略字符集后暂时正常，也不能据此证明另一台电脑会得到相同文字。显式参数让两个
版本都遵守同一文件格式。

### 3. 观察磁盘和控制台结果

运行最小程序后做三项核对：

1. 控制台输出与写入字符串逐字一致。
2. Working directory 下出现 `teamflow-data/tasks.txt`。
3. 用支持 UTF-8 的编辑器打开文件，看到同一行中文。

三项同时成立，才能区分“Java 已正确读回”和“编辑器碰巧用另一种方式显示”。若文件没有出现在预期目录，
先输出绝对路径并核对 Working directory，不要反复修改 `../` 猜位置。

## 三、让写入行为符合意图

### 1. 覆盖、追加与拒绝覆盖不是一回事

写文件之前先回答：已有文件应该被替换、追加，还是视为冲突？`StandardOpenOption` 把这个决定写进代码：

| 业务意图 | 关键选项 | 已有文件 | 文件不存在 |
| --- | --- | --- | --- |
| 重新生成快照 | `CREATE`、`TRUNCATE_EXISTING` | 清空后重写 | 创建 |
| 追加一条记录 | `CREATE`、`APPEND` | 写到末尾 | 创建 |
| 只允许首次创建 | `CREATE_NEW` | 抛出异常 | 创建 |

`CREATE_NEW` 将“检查不存在并创建”作为一次文件系统操作表达，比先 `Files.exists` 再写更准确。

### 2. 明确写出覆盖与追加

先生成文件，再追加第二行：

```java
Files.writeString(
    taskFile,
    "TASK-101 | 准备迭代演示" + System.lineSeparator(),
    StandardCharsets.UTF_8,
    StandardOpenOption.CREATE,
    StandardOpenOption.TRUNCATE_EXISTING
);

Files.writeString(
    taskFile,
    "TASK-102 | 检查发布说明" + System.lineSeparator(),
    StandardCharsets.UTF_8,
    StandardOpenOption.APPEND
);
```

第一次调用使每次演示都从确定内容开始；第二次调用只追加。`APPEND` 负责写入位置，换行仍由程序自己写，
因此每条记录都显式添加 `System.lineSeparator()`。

### 3. 用输出验证选择是否正确

连续运行程序两次，文件都应只有两行，而不是增长到四行。若第二次运行出现四行，说明第一次写入没有执行
截断；若只剩第二行，说明追加调用使用了覆盖选项。验证写入合同要看重复运行后的文件内容，不能只看首次
运行成功。

## 四、根据数据选择文本或字节

### 1. 文本 API 负责字符编码

任务清单、配置和说明是文本，应使用 `readString`、`writeString`、`BufferedReader` 或
`BufferedWriter`，并明确字符集。文本读取的结果是字符，不应再把其中每个 `char` 当作文件原始字节。

### 2. 小型二进制数据保持原始字节

图片、压缩包或协议载荷不是文本。小型、大小受控的二进制内容可以直接读写 `byte[]`：

```java
Path statusFile = Path.of("teamflow-data", "status.bin");
byte[] expected = new byte[] {1, 0, 1};
Files.write(statusFile, expected);

byte[] actual = Files.readAllBytes(statusFile);
System.out.println(Arrays.toString(actual));
```

预期输出是 `[1, 0, 1]`。这里没有字符集，因为程序保存和读取的是原始字节。不要用 Reader 读取图片，也
不要用 `new String(bytes)` 猜测二进制内容。

### 3. 整文件便利方法只用于受控大小

`readString`、`readAllLines` 和 `readAllBytes` 都会把完整内容放入内存。课程生成的几行任务和三个状态字节
适合这种方式；几百 MB 的日志或未知大小的上传文件不适合。文件大小增长时，改用缓冲 Reader 或流分批
处理，而不是为整文件分配一个巨大对象。

## 五、用缓冲 Reader 和 Writer 处理多行文本

### 1. BufferedReader 逐行读到 EOF

`Files.newBufferedReader` 返回需要关闭的 Reader。沿用上一课的所有权规则，在当前方法创建，就在当前
方法用 try-with-resources 关闭：

```java
try (BufferedReader reader = Files.newBufferedReader(taskFile, StandardCharsets.UTF_8)) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }
}
```

`readLine()` 返回一行时不包含行尾字符；到达文件末尾才返回 `null`。这里的 `null` 是 API 的固定结束信号，
本课只按合同判断，不展开下一课的缺失值建模。

### 2. BufferedWriter 仍要选择打开方式

缓冲 Writer 不会替你决定覆盖还是追加：

```java
try (
    BufferedWriter writer = Files.newBufferedWriter(
        taskFile,
        StandardCharsets.UTF_8,
        StandardOpenOption.CREATE,
        StandardOpenOption.APPEND
    )
) {
    writer.write("TASK-103 | 回顾演示结果");
    writer.newLine();
}
```

`newLine()` 写入当前平台合适的行分隔符。离开 try 时 Writer 先把缓冲内容交给底层文件，再关闭资源，因此
不要为了“保险”在 try 外重复调用 `close()`。

### 3. 选择便利方法还是缓冲方法

- 内容很小、边界受控，并且需要整个字符串或字节数组时，使用整文件便利方法。
- 文本可能增长，只需逐行消费时，使用 `BufferedReader`。
- 需要分多次写入同一个已打开文件时，使用 `BufferedWriter`。
- 无论选择哪种方法，都先固定 Path、字符集、打开选项和资源所有者。

本课不宣称某个固定文件大小是全局分界线；是否适合整文件读取取决于输入上限与程序可用内存。

## 六、JDK 25 与 Java 8 的真实差异

### 1. 两版共同具备的能力

Java 8 已支持 `Path`、`Files`、`StandardCharsets.UTF_8`、`StandardOpenOption`、`readAllBytes`、
`readAllLines`、`newBufferedReader`、`newBufferedWriter` 和 try-with-resources。本课的路径合同、字符集合同、
覆盖与追加语义在两个版本中相同。

### 2. JDK 25 的便利入口

`Path.of`、`Files.readString` 和 `Files.writeString` 都是在 Java 8 之后加入的 API。JDK 25 可以直接写：

```java
Path taskFile = Path.of("teamflow-data", "tasks.txt");
Files.writeString(taskFile, "TeamFlow", StandardCharsets.UTF_8);
String text = Files.readString(taskFile, StandardCharsets.UTF_8);
```

### 3. Java 8 的完整兼容入口

Java 8 用 `Paths.get` 创建 Path，并通过缓冲 Reader/Writer 读写字符串：

```java
Path taskFile = Paths.get("teamflow-data", "tasks.txt");
try (BufferedWriter writer = Files.newBufferedWriter(taskFile, StandardCharsets.UTF_8)) {
    writer.write("TeamFlow");
}

String text;
try (BufferedReader reader = Files.newBufferedReader(taskFile, StandardCharsets.UTF_8)) {
    text = reader.readLine();
}
```

:::compare{before="Java 8" after="JDK 25"}
### Java 8

```java
Path taskFile = Paths.get("teamflow-data", "tasks.txt");
```

### JDK 25

```java
Path taskFile = Path.of("teamflow-data", "tasks.txt");
```
:::

这是真实 API 可用性差异，不改变最终文件的位置与内容。需要同一份源码兼容 Java 8 时，选用 Java 8 已有
的 API，不要只把 IDEA 的 Project SDK 改成 8 而保留 `Path.of` 或 `writeString`。

## 七、易错示例

**社区补充：** IntelliJ IDEA 与命令行产生不同文件位置、写文件时报父目录不存在，是两个可复现的初学者
问题。核对工作目录并显式创建父目录后，行为与官方 Path/Files 合同一致；以下条目把这两个现象和其他常见
误用集中处理。

:::pitfalls
### 相对路径在 IDEA 正常，终端却找不到

**触发条件：** IDEA 的 Working directory 是项目根目录，终端却从 class 输出目录运行相同程序。

**原因：** 相对 Path 从当前进程工作目录开始解析，两次运行的解析起点不同。

**后果：** 程序把文件写到不同目录，或读取时得到 `NoSuchFileException`。

**错误示例：** 不输出绝对路径，只反复把 `data` 改成 `../data` 猜测位置。

```java
Path taskFile = Path.of("teamflow-data", "tasks.txt");
Files.readString(taskFile, StandardCharsets.UTF_8);
```

**正确写法：** 保持业务相对路径稳定，先输出 `path.toAbsolutePath().normalize()`，再统一 IDEA 与终端的
工作目录。

```java
Path taskFile = Path.of("teamflow-data", "tasks.txt");
System.out.println(taskFile.toAbsolutePath().normalize());
```

**验证方式：** 两种运行方式都打印绝对路径，确认它们指向同一个 `teamflow-data/tasks.txt`。

### 直接写文件却没有创建父目录

**触发条件：** 目标是 `teamflow-data/reports/tasks.txt`，两个父目录尚不存在。

**原因：** 写入方法可以创建目标文件，但不会递归创建缺失的父目录。

**后果：** 首次运行抛出 `NoSuchFileException`，已有目录的电脑却可能无法复现。

**错误示例：** 直接调用 `Files.writeString(target, text, UTF_8)`。

```java
Path target = Path.of("teamflow-data", "reports", "tasks.txt");
Files.writeString(target, "TASK-101", StandardCharsets.UTF_8);
```

**正确写法：** 先调用 `Files.createDirectories(target.getParent())`，再写目标文件。

```java
Path target = Path.of("teamflow-data", "reports", "tasks.txt");
Files.createDirectories(target.getParent());
Files.writeString(target, "TASK-101", StandardCharsets.UTF_8);
```

**验证方式：** 从一个不存在的练习目录开始运行，确认目录和文件都被创建；再次运行仍成功。

### 省略字符集并依赖本机默认值

**触发条件：** 使用依赖默认字符集的旧 Reader/Writer 构造器读写中文。

**原因：** Java 8 的默认字符集可能受操作系统与区域设置影响，文件格式没有在代码中固定。

**后果：** 同一文件换电脑或换 JDK 后出现乱码或不可映射字符。

**错误示例：** 使用 `new FileReader("tasks.txt")` 和 `new FileWriter("tasks.txt")` 传递文件格式。

```java
try (FileWriter writer = new FileWriter("tasks.txt")) {
    writer.write("准备迭代演示");
}
try (FileReader reader = new FileReader("tasks.txt")) {
    char[] content = new char[32];
    int length = reader.read(content);
    System.out.println(new String(content, 0, length));
}
```

**正确写法：** 使用 `Files.newBufferedReader(path, StandardCharsets.UTF_8)` 与对应 Writer。

```java
Path path = Paths.get("tasks.txt");
try (BufferedWriter writer = Files.newBufferedWriter(path, StandardCharsets.UTF_8)) {
    writer.write("准备迭代演示");
}
try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
    System.out.println(reader.readLine());
}
```

**验证方式：** Java 8 反馈环用 `-Dfile.encoding=US-ASCII` 重跑错误代码，确认读回内容不等于原文；JDK 25
即使默认字符集是 UTF-8，也不能把一次正常结果当成跨环境证明。两个 JDK 都运行正确代码并断言 UTF-8
读回字符串逐字一致。

### 把默认写入误认为追加

**触发条件：** 第二次调用 `writeString` 或 `Files.write` 时没有传 `APPEND`。

**原因：** 常用默认写入会创建或截断已有文件，不会自动保留旧内容。

**后果：** 原任务清单被新记录覆盖，只剩最后一次写入。

**错误示例：** 两次都使用无选项的 `Files.writeString(taskFile, text, UTF_8)`。

```java
Files.writeString(taskFile, "TASK-101", StandardCharsets.UTF_8);
Files.writeString(taskFile, "TASK-102", StandardCharsets.UTF_8);
```

**正确写法：** 首次明确 `CREATE + TRUNCATE_EXISTING`，后续明确 `APPEND`。

```java
Files.writeString(
    taskFile,
    "TASK-101" + System.lineSeparator(),
    StandardCharsets.UTF_8,
    StandardOpenOption.CREATE,
    StandardOpenOption.TRUNCATE_EXISTING
);
Files.writeString(
    taskFile,
    "TASK-102" + System.lineSeparator(),
    StandardCharsets.UTF_8,
    StandardOpenOption.APPEND
);
```

**验证方式：** 连续写入 TASK-101 与 TASK-102 后读回，确认顺序正确且共有两行。

### 追加记录时忘记行分隔符

**触发条件：** 每次 APPEND 只写任务文字，不写换行。

**原因：** `APPEND` 只改变写入位置，不会自动添加记录边界。

**后果：** 两条任务粘成一行，逐行读取只能得到一条记录。

**错误示例：** `Files.writeString(path, task, UTF_8, APPEND)`。

```java
Files.writeString(
    path,
    "TASK-101",
    StandardCharsets.UTF_8,
    StandardOpenOption.CREATE,
    StandardOpenOption.TRUNCATE_EXISTING
);
Files.writeString(path, "TASK-102", StandardCharsets.UTF_8, StandardOpenOption.APPEND);
```

**正确写法：** 便利方法追加 `task + System.lineSeparator()`，BufferedWriter 调用 `newLine()`。

```java
Files.writeString(
    path,
    "TASK-101" + System.lineSeparator(),
    StandardCharsets.UTF_8,
    StandardOpenOption.CREATE,
    StandardOpenOption.TRUNCATE_EXISTING
);
Files.writeString(
    path,
    "TASK-102" + System.lineSeparator(),
    StandardCharsets.UTF_8,
    StandardOpenOption.APPEND
);
```

**验证方式：** 用 BufferedReader 逐行计数，结果必须为 2。

### 用整文件方法读取未知大文件

**触发条件：** 对没有大小上限的日志直接调用 `readString`、`readAllLines` 或 `readAllBytes`。

**原因：** 整个内容需要同时进入内存，文件增长会直接增加内存占用。

**后果：** 响应变慢，甚至因为无法分配足够内存而失败。

**错误示例：** `String log = Files.readString(logPath, UTF_8)`。

```java
String log = Files.readString(logPath, StandardCharsets.UTF_8);
System.out.println(log.length());
```

**正确写法：** 使用 try-with-resources 打开 BufferedReader，并在循环中逐行处理后立即丢弃已处理行。

```java
int lineCount = 0;
try (BufferedReader reader = Files.newBufferedReader(logPath, StandardCharsets.UTF_8)) {
    while (reader.readLine() != null) {
        lineCount++;
    }
}
System.out.println(lineCount);
```

**验证方式：** 临时生成多行文件，逐行计数但不把所有行放入集合，确认结果与实际行数一致。

### 在 Java 8 中使用现代便利 API

**触发条件：** 只把 IDEA Project SDK 改成 8，却保留 `Path.of`、`readString` 或 `writeString`。

**原因：** 这些 API 自 Java 11 才提供，不属于 Java 8 标准库。

**后果：** JDK 25 编译成功，Java 8 报找不到符号。

**错误示例：** Java 8 源码调用 `Path.of("tasks.txt")`。

```java
Path taskFile = Path.of("tasks.txt");
String text = Files.readString(taskFile, StandardCharsets.UTF_8);
```

**正确写法：** Java 8 使用 `Paths.get`，并使用 BufferedReader/BufferedWriter 或 Java 8 的 Files 方法。

```java
Path taskFile = Paths.get("tasks.txt");
String text;
try (BufferedReader reader = Files.newBufferedReader(taskFile, StandardCharsets.UTF_8)) {
    text = reader.readLine();
}
```

**验证方式：** 分别用 JDK 25 与 Java 8 编译对应完整程序，两版输出必须一致。

### 打开 BufferedReader 后没有关闭

**触发条件：** 方法创建 BufferedReader，读取结束后直接返回。

**原因：** 创建者拥有资源，却没有把它放进 try-with-resources。

**后果：** 文件句柄不能在方法边界及时释放，失败路径也会跳过关闭。

**错误示例：** `BufferedReader reader = Files.newBufferedReader(path, UTF_8);` 后直接循环读取。

```java
BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8);
while (reader.readLine() != null) {
    // 处理一行
}
```

**正确写法：** 把 Reader 声明在 try-with-resources 资源头中，在最窄使用范围自动关闭。

```java
try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
    while (reader.readLine() != null) {
        // 处理一行
    }
}
```

**验证方式：** 在正常读取和中途抛出异常两条路径都记录关闭探针，关闭次数都必须为 1。
:::

## 八、完整的 TeamFlow 文件程序

### 1. 程序要解决的问题

程序创建 `teamflow-data`，覆盖写入第一条任务，再追加第二条任务；随后读回 UTF-8 文本，保存并读取三个
状态字节。重复运行不会累积旧任务，控制台输出在两个 Java 版本中一致。

### 2. JDK 25 完整程序

创建 `TeamFlowFileApplication.java`：

```java
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Arrays;
import java.util.List;

public final class TeamFlowFileApplication {
    private static final Path DATA_DIRECTORY = Path.of("teamflow-data");
    private static final Path TASK_FILE = DATA_DIRECTORY.resolve("tasks.txt");
    private static final Path STATUS_FILE = DATA_DIRECTORY.resolve("status.bin");

    /**
     * 覆盖写入第一条任务，再追加第二条任务。
     */
    private static void writeTasks() throws IOException {
        Files.createDirectories(DATA_DIRECTORY);
        Files.writeString(
            TASK_FILE,
            "TASK-101 | 准备迭代演示" + System.lineSeparator(),
            StandardCharsets.UTF_8,
            StandardOpenOption.CREATE,
            StandardOpenOption.TRUNCATE_EXISTING
        );
        Files.writeString(
            TASK_FILE,
            "TASK-102 | 检查发布说明" + System.lineSeparator(),
            StandardCharsets.UTF_8,
            StandardOpenOption.APPEND
        );
    }

    /**
     * 读取并输出任务文件，返回任务行数。
     */
    private static int readTasks() throws IOException {
        String content = Files.readString(TASK_FILE, StandardCharsets.UTF_8);
        List<String> tasks = Files.readAllLines(TASK_FILE, StandardCharsets.UTF_8);
        System.out.print(content);
        return tasks.size();
    }

    /**
     * 写入并读回任务状态字节。
     */
    private static byte[] saveStatus() throws IOException {
        byte[] status = new byte[] {1, 0, 1};
        Files.write(
            STATUS_FILE,
            status,
            StandardOpenOption.CREATE,
            StandardOpenOption.TRUNCATE_EXISTING
        );
        return Files.readAllBytes(STATUS_FILE);
    }

    /**
     * 运行 TeamFlow 文件读写示例。
     */
    public static void main(String[] args) throws IOException {
        writeTasks();
        System.out.println("数据目录: " + DATA_DIRECTORY);
        System.out.println("已保存任务: 2");
        int taskCount = readTasks();
        System.out.println("状态字节: " + Arrays.toString(saveStatus()));
        System.out.println("读取任务: " + taskCount);
    }
}
```

### 3. 在 JDK 25 中配置并运行

1. 在 IntelliJ IDEA 中打开普通 Java 项目。
2. 在 **File -> Project Structure -> Project** 把 **Project SDK** 设为 JDK 25。
3. 在 **Modules -> Dependencies** 核对模块 SDK 跟随 Project SDK。
4. 在 **Run -> Edit Configurations** 查看 Working directory，记住生成目录会出现在这里。
5. 创建 `TeamFlowFileApplication.java`，填入 JDK 25 完整代码。
6. 运行 `main`，再在 Working directory 下检查 `teamflow-data/tasks.txt` 与 `status.bin`。
7. 再运行一次，确认任务仍是两行。

### 4. JDK 25 预期输出与过程

```text
数据目录: teamflow-data
已保存任务: 2
TASK-101 | 准备迭代演示
TASK-102 | 检查发布说明
状态字节: [1, 0, 1]
读取任务: 2
```

程序先创建目录；第一次文本写入覆盖旧快照，第二次追加；读取方法把两行原样输出并统计行数；二进制方法
保持三个原始字节。便利方法在每次调用内部完成文件资源的打开与关闭。

### 5. Java 8 完整程序

Java 8 版使用 `Paths.get` 和缓冲 Reader/Writer，业务步骤与输出保持一致：

```java
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Arrays;

public final class TeamFlowFileApplication {
    private static final Path DATA_DIRECTORY = Paths.get("teamflow-data");
    private static final Path TASK_FILE = DATA_DIRECTORY.resolve("tasks.txt");
    private static final Path STATUS_FILE = DATA_DIRECTORY.resolve("status.bin");

    /**
     * 覆盖写入第一条任务，再追加第二条任务。
     */
    private static void writeTasks() throws IOException {
        Files.createDirectories(DATA_DIRECTORY);
        try (
            BufferedWriter writer = Files.newBufferedWriter(
                TASK_FILE,
                StandardCharsets.UTF_8,
                StandardOpenOption.CREATE,
                StandardOpenOption.TRUNCATE_EXISTING
            )
        ) {
            writer.write("TASK-101 | 准备迭代演示");
            writer.newLine();
        }
        try (
            BufferedWriter writer = Files.newBufferedWriter(
                TASK_FILE,
                StandardCharsets.UTF_8,
                StandardOpenOption.APPEND
            )
        ) {
            writer.write("TASK-102 | 检查发布说明");
            writer.newLine();
        }
    }

    /**
     * 逐行读取并输出任务文件，返回任务行数。
     */
    private static int readTasks() throws IOException {
        int taskCount = 0;
        try (
            BufferedReader reader = Files.newBufferedReader(
                TASK_FILE,
                StandardCharsets.UTF_8
            )
        ) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
                taskCount++;
            }
        }
        return taskCount;
    }

    /**
     * 写入并读回任务状态字节。
     */
    private static byte[] saveStatus() throws IOException {
        byte[] status = new byte[] {1, 0, 1};
        Files.write(
            STATUS_FILE,
            status,
            StandardOpenOption.CREATE,
            StandardOpenOption.TRUNCATE_EXISTING
        );
        return Files.readAllBytes(STATUS_FILE);
    }

    /**
     * 运行 TeamFlow 文件读写示例。
     */
    public static void main(String[] args) throws IOException {
        writeTasks();
        System.out.println("数据目录: " + DATA_DIRECTORY);
        System.out.println("已保存任务: 2");
        int taskCount = readTasks();
        System.out.println("状态字节: " + Arrays.toString(saveStatus()));
        System.out.println("读取任务: " + taskCount);
    }
}
```

### 6. 在 Java 8 中配置并运行

1. 在 **File -> Project Structure -> SDKs** 添加本机已有的 JDK 8 目录。
2. 把 Project SDK 和 Module SDK 都设为 JDK 8，语言级别设为 8。
3. 核对运行配置的 JRE 与 Working directory，不要只修改终端 `JAVA_HOME`。
4. 使用 Java 8 完整代码，确认导入的是 `Paths`，源码中没有 `Path.of`、`readString` 或 `writeString`。
5. 运行同一个 `main`，核对六行输出和两个生成文件。
6. 再运行一次，确认第一条写入仍会清空旧快照，文件没有重复累积。

## 九、独立练习

### 1. 保存一次迭代检查记录

:::exercise
### 迭代检查记录

**要求：** 编写 `TeamFlowNoteExercise`，在相对目录 `teamflow-practice` 中创建 `sprint-notes.txt`。先覆盖
写入“演示环境已确认”，再追加“发布清单已检查”；两行都使用 UTF-8。读回后输出文件名、两行内容和总行数。
不得使用绝对路径，不得依赖默认字符集；需要关闭的 Reader/Writer 必须使用 try-with-resources。

**验收：** 连续运行两次都精确得到下方四行，文件始终只有两条记录。
:::

预期输出：

```text
文件: sprint-notes.txt
第一行: 演示环境已确认
第二行: 发布清单已检查
总行数: 2
```

### 2. JDK 25 参考实现

```java
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.List;

public final class TeamFlowNoteExercise {
    /**
     * 写入、读回并验收迭代检查记录。
     */
    public static void main(String[] args) throws IOException {
        Path directory = Path.of("teamflow-practice");
        Path noteFile = directory.resolve("sprint-notes.txt");
        Files.createDirectories(directory);

        Files.writeString(
            noteFile,
            "演示环境已确认" + System.lineSeparator(),
            StandardCharsets.UTF_8,
            StandardOpenOption.CREATE,
            StandardOpenOption.TRUNCATE_EXISTING
        );
        Files.writeString(
            noteFile,
            "发布清单已检查" + System.lineSeparator(),
            StandardCharsets.UTF_8,
            StandardOpenOption.APPEND
        );

        List<String> notes = Files.readAllLines(noteFile, StandardCharsets.UTF_8);
        if (notes.size() != 2) {
            throw new AssertionError("记录数量错误: " + notes.size());
        }
        System.out.println("文件: " + noteFile.getFileName());
        System.out.println("第一行: " + notes.get(0));
        System.out.println("第二行: " + notes.get(1));
        System.out.println("总行数: " + notes.size());
    }
}
```

### 3. Java 8 参考实现

```java
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.List;

public final class TeamFlowNoteExercise {
    /**
     * 写入、读回并验收迭代检查记录。
     */
    public static void main(String[] args) throws IOException {
        Path directory = Paths.get("teamflow-practice");
        Path noteFile = directory.resolve("sprint-notes.txt");
        Files.createDirectories(directory);

        try (
            BufferedWriter writer = Files.newBufferedWriter(
                noteFile,
                StandardCharsets.UTF_8,
                StandardOpenOption.CREATE,
                StandardOpenOption.TRUNCATE_EXISTING
            )
        ) {
            writer.write("演示环境已确认");
            writer.newLine();
        }
        try (
            BufferedWriter writer = Files.newBufferedWriter(
                noteFile,
                StandardCharsets.UTF_8,
                StandardOpenOption.APPEND
            )
        ) {
            writer.write("发布清单已检查");
            writer.newLine();
        }

        List<String> notes = new ArrayList<>();
        try (
            BufferedReader reader = Files.newBufferedReader(
                noteFile,
                StandardCharsets.UTF_8
            )
        ) {
            String line;
            while ((line = reader.readLine()) != null) {
                notes.add(line);
            }
        }

        if (notes.size() != 2) {
            throw new AssertionError("记录数量错误: " + notes.size());
        }
        System.out.println("文件: " + noteFile.getFileName());
        System.out.println("第一行: " + notes.get(0));
        System.out.println("第二行: " + notes.get(1));
        System.out.println("总行数: " + notes.size());
    }
}
```

### 4. 分别运行并检查

在 JDK 25 项目运行现代版，在 Java 8 项目运行兼容版。两次都检查控制台、文件实际行数和重复运行结果。
能解释为什么父目录先创建、第一次写入会截断、第二次写入会追加、两版都显式使用 UTF-8，才算通过练习。

## 十、把文件合同带回 TeamFlow

### 1. 每次读写前做四个决定

面对新的文件需求，先依次确认：

1. Path 是相对哪个工作目录解析的？
2. 内容是带字符集的文本，还是必须原样保留的字节？
3. 文件已存在时应该覆盖、追加，还是失败？
4. 内容大小适合整文件读取，还是要缓冲逐行处理？

这四个决定写清后，再选择 API。不要从“哪个方法最短”倒推业务合同。

### 2. 自我检查

不看代码，尝试回答：

1. 为什么创建 Path 不等于创建文件？
2. IDEA 和终端怎样让同一相对路径落到不同目录？
3. `CREATE`、`APPEND`、`TRUNCATE_EXISTING` 和 `CREATE_NEW` 分别表达什么？
4. 为什么两个 Java 版本都显式传 `StandardCharsets.UTF_8`？
5. 什么时候用整文件便利方法，什么时候用 BufferedReader？
6. Java 8 为什么不能直接编译 `Path.of`、`readString` 与 `writeString`？

能重复运行完整程序和练习，得到稳定文件内容，并独立定位上述易错现象，才算真正完成文件读写。
