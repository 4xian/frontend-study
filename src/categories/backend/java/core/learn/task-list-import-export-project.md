---
id: backend.java.learn.basics.task-list-import-export-project
type: lesson
title: 实战：任务清单导入导出
summary: 为小型 TeamFlow 任务清单定义严格的行式文本合同，并用显式 UTF-8 完成可验证的导出与导入
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 150
prerequisites:
  - backend.java.learn.basics.text-building-and-formatting
objectives:
  - 能为任务清单定义包含版本头、字段顺序、状态取值和字符边界的行式文本合同。
  - 能使用 split 的正则表达式与负 limit 准确保留并校验三个字段。
  - 能在导入时报告行号、拒绝重复编号，并把业务格式错误与文件读写失败区分开。
  - 能在完成业务校验和文本构建后，再以 UTF-8 覆盖写入目标文件。
  - 能分别使用 JDK 25 与 Java 8 完成 TeamFlow 任务清单的导出、导入和往返核对。
recap:
  - 可交换文本先定义合同再写代码；版本头、字段数量、分隔符、状态和重复编号都必须有明确规则。
  - String.split 接收正则表达式；管道符要写成 \\|，负 limit 才会保留末尾空字段供校验。
  - 导入应把物理行号带入错误消息，遇到未知状态、空字段或重复编号时立即拒绝整批结果。
  - 导出先校验并构建完整文本，再打开目标文件，可以避免业务校验失败提前截断旧文件。
  - 普通覆盖写入仍可能在 I/O 失败时留下不完整文件，本课不把它描述成原子替换。
  - JDK 25 使用 Path.of 与 Files.writeString；Java 8 使用 Paths.get 与 Files.write 字节数组。
related:
  - backend.java.learn.basics.file-reading-and-writing
  - backend.java.learn.basics.strings-encoding-and-text-matching
  - backend.java.learn.basics.exceptions-and-cause-chains
tags:
  - Java
  - Files
  - UTF-8
  - 文本协议
  - 导入导出
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 兼容写法见正文
verifiedAt: 2026-08-18
sources:
  - id: java-25-files
    title: Java SE 25 API - Files
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Files.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - readAllLines 使用指定字符集读取小型文本，writeString 使用指定字符集覆盖写入文本
      - 未传写入选项时采用 CREATE、TRUNCATE_EXISTING 与 WRITE，并且 I/O 失败不保证目标文件保持原样
  - id: java-8-files
    title: Java Platform SE 8 API - Files
    url: https://docs.oracle.com/javase/8/docs/api/java/nio/file/Files.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 提供 readAllLines Path Charset 与 write Path byte array 重载
      - Java 8 的默认覆盖选项和写入失败边界与本课兼容实现
  - id: java-25-string
    title: Java SE 25 API - String
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - split 的参数是正则表达式，负 limit 会保留所有结果字段，包括末尾空字符串
  - id: java-8-string
    title: Java Platform SE 8 API - String
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/String.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 已提供与本课相同的 split regex limit 合同
  - id: java-25-pattern
    title: Java SE 25 API - Pattern
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/regex/Pattern.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - 管道符在正则表达式中表示选择分支，作为普通分隔符时必须转义
  - id: java-8-pattern
    title: Java Platform SE 8 API - Pattern
    url: https://docs.oracle.com/javase/8/docs/api/java/util/regex/Pattern.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 的正则表达式同样把管道符解释为选择分支，字面管道符需要转义
  - id: java-25-path
    title: Java SE 25 API - Path
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Path.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - JDK 25 使用 Path.of 从字符串构造文件路径，Path.of 自 Java 11 提供
  - id: java-8-paths
    title: Java Platform SE 8 API - Paths
    url: https://docs.oracle.com/javase/8/docs/api/java/nio/file/Paths.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 使用 Paths.get 从字符串构造 Path
  - id: stackoverflow-pipe-split
    title: Splitting strings based on a delimiter
    url: https://stackoverflow.com/questions/8547940/splitting-strings-based-on-a-delimiter
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 及以上；本课已在 JDK 25 与 Java 8 复现
    claims:
      - 开发者把管道符直接传给 split 后得到错误字段是真实误区，转义分隔符可恢复预期结果
---

# 实战：任务清单导入导出

TeamFlow 已经能在内存中保存任务、处理异常、读写 UTF-8 文件并构建多行文本。现在要把这些能力连接
起来：把一组任务导出为一个其他人也能理解的文件，再从这个文件还原出同样的任务。

本课处理的是数量受控的小型交换文件。重点是“写入什么合同、如何拒绝坏数据、怎样证明往返结果一致”。
完整 CSV、JSON、超大文件流式处理、原子文件替换和并发写入都有独立复杂度，不在这次实战中展开。

## 一、先固定交换文件合同

### 1. 第一行标识文件版本

本课使用下面这份完整文件：

```text
TEAMFLOW_TASKS_V1
TASK-101|准备项目周报|DONE
TASK-102|整理评审记录|TODO
```

第一行必须逐字等于 `TEAMFLOW_TASKS_V1`。它不是一条任务，而是告诉导入程序：“后续每行都按第 1 版
合同解释。”如果首行缺失或拼写不同，程序应拒绝导入，不能猜测文件格式。

版本头也为以后修改合同留出边界。若将来真的出现第 2 版，应显式编写新的解析规则；不能在同一解析器里
根据字段数量暗自猜版本。

### 2. 每条任务固定为三个字段

数据行依次保存编号、标题和状态，字段之间使用一个管道符：

```text
id|title|status
```

本课合同逐项限制如下：

1. `id` 与 `title` 不能是空字符串。
2. `id` 与 `title` 不能包含管道符、回车 `\r` 或换行 `\n`。
3. `status` 只接受逐字匹配的 `TODO` 或 `DONE`。
4. 同一文件中的 `id` 不能重复。
5. 数据行必须恰好拆成三个字段，多一个或少一个都不合法。

这些限制故意让格式保持简单。标题若需要包含管道符、换行或复杂转义，就应改用正式的 CSV 或 JSON
合同，而不是继续给这份入门格式叠加私有规则。

### 3. 导出和导入是相反的数据流

导出从 `Task` 对象出发，先检查每项数据，再构建完整文本，最后以 UTF-8 写入文件：

```text
List<Task> -> 校验 -> 行式文本 -> UTF-8 文件
```

导入从 UTF-8 文件出发，先核对版本头，再逐行拆字段、校验并创建任务：

```text
UTF-8 文件 -> 文本行 -> 校验 -> List<Task>
```

两条路径共享同一份合同。只有“导出后再导入，得到同样的任务文本”成立，才能称为一次可验证的往返。

## 二、准确拆出三个字段

### 1. split 接收的是正则表达式

`String.split` 的第一个参数不是普通字符串分隔符，而是正则表达式。管道符在正则中表示“左边或右边
任选一个分支”，所以必须转义成字面量：

```java
String line = "TASK-101|准备项目周报|DONE";
String[] fields = line.split("\\|", -1);

System.out.println(fields.length); // 3
System.out.println(fields[0]); // TASK-101
System.out.println(fields[1]); // 准备项目周报
System.out.println(fields[2]); // DONE
```

Java 源码里的 `"\\|"` 经过字符串转义后，交给正则引擎的是 `\|`，正则引擎再把它解释为普通管道符。

### 2. 负 limit 保留末尾空字段

第二个参数写成 `-1`，表示应用分隔规则任意次，并保留所有结果，包括末尾空字符串。下面这行缺少状态：

```java
String line = "TASK-101|准备项目周报|";

System.out.println(line.split("\\|").length); // 2
System.out.println(line.split("\\|", -1).length); // 3
```

默认的 `split("\\|")` 等价于使用零 limit，会丢弃末尾空字符串。这样“第三个字段存在但为空”会伪装成
“只有两个字段”。使用负 limit 后，解析器可以先确认字段数为 3，再明确报告状态为空或非法。

### 3. 字段数量和字段内容要分别检查

拆分后的第一道检查是 `fields.length == 3`，第二道检查才处理每个字段：

```java
String[] fields = line.split("\\|", -1);
if (fields.length != 3) {
    throw new IllegalArgumentException("第 2 行必须恰好包含三个字段");
}

if (fields[0].isEmpty() || fields[1].isEmpty()) {
    throw new IllegalArgumentException("第 2 行的编号和标题不能为空");
}
```

不能只取前三个字段而忽略其余内容。`TASK-101|标题|DONE|EXTRA` 说明生产者和消费者没有遵守同一合同，
继续导入会悄悄丢数据。

### 4. 状态使用有限取值而不是宽松布尔转换

课程前面已经学过枚举。这里让文件中的 `TODO`、`DONE` 与 `TaskStatus` 一一对应：

```java
TaskStatus status = TaskStatus.valueOf(fields[2]);
```

`valueOf` 只接受与枚举常量名称逐字一致的文本。`done`、`WAITING` 和空字符串都会失败，正好符合严格
合同。完整程序会捕获这次失败并补上物理行号，让用户知道该修改哪一行。

## 三、导入时整批验证

### 1. 先核对文件不为空和版本头正确

`Files.readAllLines(path, UTF_8)` 适合本课数量受控的小文件。读取后先处理整个文件的入口条件：

```java
List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);
if (lines.isEmpty()) {
    throw new IllegalArgumentException("任务文件为空");
}
if (!"TEAMFLOW_TASKS_V1".equals(lines.get(0))) {
    throw new IllegalArgumentException("不支持的任务文件版本: " + lines.get(0));
}
```

`lines.get(0)` 是物理第 1 行。数据从索引 1 开始，因此循环中的物理行号应为 `index + 1`；错误消息展示
物理行号，而不是从零开始的集合索引。

### 2. 每行先解析，成功后才加入结果

导入循环应先得到一条完整、合法的 `Task`，确认编号没有重复，再加入结果集合：

```java
List<Task> tasks = new ArrayList<Task>();
Set<String> ids = new HashSet<String>();

for (int index = 1; index < lines.size(); index++) {
    int lineNumber = index + 1;
    Task task = parseTask(lines.get(index), lineNumber);
    if (!ids.add(task.getId())) {
        throw new IllegalArgumentException("第 " + lineNumber + " 行编号重复: " + task.getId());
    }
    tasks.add(task);
}
```

`Set.add` 第一次看到编号时返回 `true`，重复时返回 `false`。失败发生在 `tasks.add` 之前，因此坏行不会
混入暂存结果。调用方只有在整个方法正常返回后才得到集合，不会拿到一半成功、一半失败的任务清单。

### 3. 格式错误与 I/O 错误承担不同职责

文件不存在、无权限或读取中断属于 `IOException`；版本头错误、字段数量错误、非法状态和重复编号属于
本课格式合同错误，用 `IllegalArgumentException` 表达。完整程序让两类异常继续交给调用入口统一报告，
但错误消息仍保留“哪个文件、哪一行、哪个字段”的上下文。

这里不建立完整错误分类体系，也不吞掉异常。目标只是让一次导入失败时能知道该检查文件系统，还是修改
交换文件内容。

## 四、导出前先完成业务校验

### 1. 编号、标题和状态都要先验证

导出程序不能假设内存对象天然合法。它要使用和导入相同的字段约束，并通过 `Set` 拒绝重复编号：

```java
Set<String> ids = new HashSet<String>();
for (Task task : tasks) {
    validateField("任务编号", task.getId());
    validateField("任务标题", task.getTitle());
    if (task.getStatus() == null) {
        throw new IllegalArgumentException("任务状态不能为空");
    }
    if (!ids.add(task.getId())) {
        throw new IllegalArgumentException("任务编号重复: " + task.getId());
    }
}
```

`validateField` 同时拒绝空字符串、管道符、回车和换行。校验通过后，每条任务才一定能安全映射为一行。

### 2. 先构建完整文本，再打开目标文件

本课的导出方法把校验与构建放在文件写入之前：

```java
String content = serializeTasks(tasks);
Files.writeString(path, content, StandardCharsets.UTF_8);
```

`serializeTasks` 完全在内存中运行。若发现重复编号或非法标题，方法会在调用 `writeString` 之前失败，旧文件
不会因为这次业务校验失败而被截断。这是调用顺序带来的明确保证。

### 3. 这不等于原子文件替换

默认覆盖写入会创建不存在的文件，并截断已存在的文件。即使业务校验已经通过，真正写入时仍可能遇到
磁盘空间不足、权限变化或设备错误；普通 `writeString` / `write` 不承诺失败后旧文件完整保留。

所以本课只能说“业务校验失败不会提前碰目标文件”，不能说“任何失败都不会破坏旧文件”。需要临时文件、
刷盘、原子移动与恢复策略的可靠替换流程，属于后续文件存储专项。

### 4. 固定 UTF-8 和换行合同

两个版本都显式使用 `StandardCharsets.UTF_8`。构建交换文本时固定追加 `\n`，让文件字节合同不随 Windows、
macOS 或 Linux 的平台换行改变：

```java
StringBuilder output = new StringBuilder();
output.append("TEAMFLOW_TASKS_V1").append('\n');
output.append("TASK-101|准备项目周报|DONE").append('\n');
```

这和面向人类控制台输出时使用 `System.lineSeparator()` 的目标不同。交换文件需要稳定字节，控制台文本通常
遵循当前平台显示习惯。

## 五、常见错误

下面的错误只覆盖本课合同的主要风险，不扩张成通用文件恢复或错误诊断课程。

**社区补充：** Stack Overflow 的真实问题曾把 `split("|")` 用于管道分隔数据，结果没有得到预期字段。
该问题的核心结论已用 JDK 25 与 Java 8 复现，并由官方 `String.split` 与 `Pattern` 合同核对：参数是正则
表达式，普通管道符必须转义。

:::pitfalls
### 接受错误或缺失的版本头

**触发条件：** 不检查首行，直接从第 1 行开始按任务记录解析，或使用 `startsWith` 接受近似版本名。

**原因：** 解析器失去了判断文件合同的唯一入口，其他文本可能碰巧也含有三个管道分隔字段。

**后果：** 版本头被当成坏任务，或未知版本被旧解析器错误接收，后续字段含义无法保证。

**错误示例：** 直接遍历全部行，没有逐字核对第 1 行。

```java
for (String line : lines) {
    String[] fields = line.split("\\|", -1);
}
```

**正确写法：** 先拒绝空文件，再逐字比较版本头，数据从索引 1 开始。

```java
if (lines.isEmpty() || !"TEAMFLOW_TASKS_V1".equals(lines.get(0))) {
    throw new IllegalArgumentException("任务文件版本错误");
}
for (int index = 1; index < lines.size(); index++) {
    String line = lines.get(index);
}
```

**验证方式：** 分别使用空文件、首行为 `TEAMFLOW_TASKS_V2` 的文件和正确文件；前两次必须在读取任务前
失败，正确文件只处理第 2 行及之后的数据。

### 把管道符直接传给 split

**触发条件：** 使用 `line.split("|")`，认为参数就是普通分隔字符串。

**原因：** `split` 接收正则表达式，未转义的管道符表示正则选择分支，而不是一个普通字符。

**后果：** 一条记录被拆成许多意外片段，字段数量不再是 3，后续索引和状态解析都失去意义。

**错误示例：** 直接传入未转义的管道符。

```java
String line = "TASK-101|准备项目周报|DONE";
String[] fields = line.split("|");
System.out.println(fields.length == 3); // false
```

**正确写法：** 在 Java 字符串和正则两个层次完成转义，并保留空字段。

```java
String line = "TASK-101|准备项目周报|DONE";
String[] fields = line.split("\\|", -1);
System.out.println(fields.length == 3); // true
```

**验证方式：** 在 JDK 25 和 Java 8 中分别运行两段代码；错误版输出 `false`，正确版输出 `true` 且三个
字段逐项等于编号、标题和状态。

### 省略负 limit 丢失空状态

**触发条件：** 使用单参数 `split("\\|")` 解析以管道符结尾的记录。

**原因：** 单参数形式使用零 limit，结果末尾的空字符串会被丢弃。

**后果：** `TASK-101|标题|` 只得到两个字段，程序无法准确说明第三个字段存在但为空。

**错误示例：** 依赖默认 limit。

```java
String[] fields = "TASK-101|标题|".split("\\|");
System.out.println(fields.length); // 2
```

**正确写法：** 使用负 limit 保留末尾空字符串，再按状态合同拒绝它。

```java
String[] fields = "TASK-101|标题|".split("\\|", -1);
System.out.println(fields.length); // 3
System.out.println(fields[2].isEmpty()); // true
```

**验证方式：** 两段代码应依次输出 2，以及 3 和 `true`；完整导入程序随后报告第 2 行状态非法。

### 依赖默认字符集交换中文文件

**触发条件：** 使用无字符集的 `getBytes()`、`new String(bytes)` 或旧式 Reader/Writer 处理交换文件。

**原因：** Java 8 的默认字符集可能随系统和启动参数变化；即使 JDK 25 默认 UTF-8，省略参数也没有把
文件格式写进调用合同。

**后果：** 中文标题可能变成问号或乱码，同一文件在不同运行环境中不能稳定往返。

**错误示例：** 让运行环境决定编码。

```java
byte[] bytes = "TASK-101|准备项目周报|DONE".getBytes();
Files.write(path, bytes);
```

**正确写法：** 两个版本都逐次传入 UTF-8。

```java
byte[] bytes = "TASK-101|准备项目周报|DONE".getBytes(StandardCharsets.UTF_8);
Files.write(path, bytes);
List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);
```

**验证方式：** 在 Java 8 中用默认 UTF-8 和 `-Dfile.encoding=US-ASCII` 分别运行错误版，可观察字节与读回
标题发生变化；正确版两次都按 UTF-8 保存。JDK 25 仍核对源码明确传入 UTF-8。

### 允许字段带入分隔符或换行

**触发条件：** 把包含管道符、回车或换行的标题直接追加到单行记录。

**原因：** 本课格式没有定义引用和转义，保留字符会被解释成字段或记录边界。

**后果：** 标题中的管道符制造第四个字段，换行把一项任务拆成两条物理记录，导入无法无歧义还原。

**错误示例：** 将保留字符当成普通标题内容。

```java
String title = "准备周报|邀请评审";
String line = "TASK-101|" + title + "|TODO";
System.out.println(line.split("\\|", -1).length); // 4
```

**正确写法：** 在导出前拒绝保留字符，或由上游提供符合本合同的单行标题。

```java
String title = "准备周报并邀请评审";
if (title.indexOf('|') >= 0 || title.indexOf('\r') >= 0 || title.indexOf('\n') >= 0) {
    throw new IllegalArgumentException("任务标题包含保留字符");
}
```

**验证方式：** 依次输入包含 `|`、回车和换行的标题，正确校验都必须在文件写入前失败；普通中文标题应
生成恰好三个字段的一行。

### 用 Boolean.parseBoolean 吞掉未知状态

**触发条件：** 把第三个字段交给 `Boolean.parseBoolean`，再把 `true` 当成已完成、`false` 当成待办。

**原因：** 该方法只有忽略大小写等于 `true` 时返回 `true`，其他任意文本都会安静地返回 `false`。

**后果：** `WAITING`、`DONE` 的拼写错误甚至空字符串都可能被伪装成待办，坏数据没有被拒绝。

**错误示例：** 使用宽松布尔转换解释有限状态。

```java
boolean completed = Boolean.parseBoolean("WAITING");
System.out.println(completed); // false
```

**正确写法：** 直接按本课枚举合同解析。

```java
TaskStatus status = TaskStatus.valueOf("DONE");
System.out.println(status); // DONE
```

**验证方式：** 传入 `TODO` 和 `DONE` 时得到对应枚举；传入 `WAITING`、`done` 或空字符串时必须抛出异常，
不能悄悄变成另一种状态。

### 导入时忽略重复任务编号

**触发条件：** 每解析一行就直接加入 List，没有维护本文件已经出现的编号。

**原因：** List 允许重复元素，字段格式正确不代表任务身份唯一。

**后果：** 同一任务可能在后续统计、更新或再次导出时出现两次，文件的业务含义不再确定。

**错误示例：** 只累计结果，不核对身份。

```java
Task task = parseTask(line, lineNumber);
tasks.add(task);
```

**正确写法：** 先让 Set 接受编号，成功后再加入结果。

```java
Task task = parseTask(line, lineNumber);
if (!ids.add(task.getId())) {
    throw new IllegalArgumentException("第 " + lineNumber + " 行编号重复: " + task.getId());
}
tasks.add(task);
```

**验证方式：** 准备两行都使用 `TASK-101` 的文件；正确程序必须报告第二次出现的物理行号，且不返回
部分任务集合。

### 校验前就截断目标文件

**触发条件：** 为了“准备导出”，先覆盖写入空内容或先打开 Writer，再校验任务字段。

**原因：** 默认覆盖会在真正生成合法文本前处理目标文件；后续业务校验失败时，旧内容已经丢失。

**后果：** 一个含非法标题或重复编号的内存集合不仅导出失败，还把上一份可用快照清空。

**错误示例：** 先清空文件，再做可能失败的校验。

```java
Files.writeString(path, "", StandardCharsets.UTF_8);
validateTasks(tasks);
String content = serializeTasks(tasks);
```

**正确写法：** 先在内存中完成校验与构建，最后只调用一次写入。

```java
String content = serializeTasks(tasks);
Files.writeString(path, content, StandardCharsets.UTF_8);
```

**验证方式：** 先准备一份已知旧文件，再用重复编号调用两段逻辑；错误版会清空文件，正确版应在业务
异常后保持旧文件字节不变。该验证不模拟真正的 I/O 中途失败，也不证明原子写入。

### 吞掉导入异常或丢失行号

**触发条件：** 使用空 catch 继续运行，或只抛出“格式错误”而不记录物理行号和坏值。

**原因：** 调用方既不知道导入失败，也不知道应修改哪一行；返回空集合还会伪装成合法的零任务文件。

**后果：** 用户可能继续处理不完整状态，排查时只能逐行猜测。

**错误示例：** 吞掉所有失败并伪造空结果。

```java
try {
    tasks = importTasks(path);
} catch (Exception ignored) {
    tasks = new ArrayList<Task>();
}
```

**正确写法：** 解析点补充行号，入口保留异常消息并让运行失败可见。

```java
try {
    tasks = importTasks(path);
} catch (IOException | IllegalArgumentException exception) {
    System.err.println("导入失败: " + exception.getMessage());
    throw exception;
}
```

**验证方式：** 把第 3 行状态改成 `WAITING`；程序应明确输出“第 3 行状态非法”并以失败结束，不能输出
“导入任务数：0”后继续成功运行。
:::

## 六、JDK 25 完整程序

### 1. 在 IDEA 中准备现代版

1. 创建普通 Java 项目，或在现有练习项目中新建独立目录，确认 Project SDK 与 Module SDK 都是 JDK 25。
2. 新建 `TeamFlowTaskExchangeApplication` 类，文件名必须是
   `TeamFlowTaskExchangeApplication.java`。
3. 把运行配置 JRE 设为同一个 JDK 25，并把 Working directory 设为这个练习目录。
4. 粘贴下面的完整代码，运行 `main`。
5. 在 Working directory 中打开 `teamflow-tasks.txt`，核对它是三行 UTF-8 文本。

终端验证时，在源码目录执行：

```bash
javac -encoding UTF-8 TeamFlowTaskExchangeApplication.java
java TeamFlowTaskExchangeApplication
```

### 2. 完整现代版代码

```java
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public final class TeamFlowTaskExchangeApplication {
    private static final String VERSION_HEADER = "TEAMFLOW_TASKS_V1";
    private static final Charset UTF_8 = StandardCharsets.UTF_8;

    private enum TaskStatus {
        TODO,
        DONE
    }

    private static final class Task {
        private final String id;
        private final String title;
        private final TaskStatus status;

        /**
         * 创建一条可交换的 TeamFlow 任务。
         *
         * @param id 任务编号
         * @param title 任务标题
         * @param status 任务状态
         */
        private Task(String id, String title, TaskStatus status) {
            this.id = id;
            this.title = title;
            this.status = status;
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
         * 返回任务状态。
         *
         * @return TODO 或 DONE
         */
        private TaskStatus getStatus() {
            return status;
        }
    }

    /**
     * 校验一个字段是否适合写入本课的单行文本合同。
     *
     * @param fieldName 字段名称
     * @param value 字段值
     */
    private static void validateField(String fieldName, String value) {
        if (value == null || value.isEmpty()) {
            throw new IllegalArgumentException(fieldName + "不能为空");
        }
        if (value.indexOf('|') >= 0 || value.indexOf('\r') >= 0 || value.indexOf('\n') >= 0) {
            throw new IllegalArgumentException(fieldName + "包含保留字符");
        }
    }

    /**
     * 在写文件前校验全部任务和编号唯一性。
     *
     * @param tasks 准备导出的任务
     */
    private static void validateTasks(List<Task> tasks) {
        if (tasks == null) {
            throw new IllegalArgumentException("任务清单不能为空");
        }

        Set<String> ids = new HashSet<String>();
        for (Task task : tasks) {
            if (task == null) {
                throw new IllegalArgumentException("任务项不能为空");
            }
            validateField("任务编号", task.getId());
            validateField("任务标题", task.getTitle());
            if (task.getStatus() == null) {
                throw new IllegalArgumentException("任务状态不能为空");
            }
            if (!ids.add(task.getId())) {
                throw new IllegalArgumentException("任务编号重复: " + task.getId());
            }
        }
    }

    /**
     * 把完整任务清单序列化为固定换行的版本化文本。
     *
     * @param tasks 准备序列化的任务
     * @return 可直接写入 UTF-8 文件的完整文本
     */
    private static String serializeTasks(List<Task> tasks) {
        validateTasks(tasks);

        StringBuilder output = new StringBuilder();
        output.append(VERSION_HEADER).append('\n');
        for (Task task : tasks) {
            output.append(task.getId())
                .append('|')
                .append(task.getTitle())
                .append('|')
                .append(task.getStatus().name())
                .append('\n');
        }
        return output.toString();
    }

    /**
     * 先构建完整文本，再以 UTF-8 覆盖导出任务文件。
     *
     * @param path 导出路径
     * @param tasks 准备导出的任务
     * @throws IOException 文件写入失败时抛出
     */
    private static void exportTasks(Path path, List<Task> tasks) throws IOException {
        String content = serializeTasks(tasks);
        Files.writeString(path, content, UTF_8);
    }

    /**
     * 解析并校验一个任务数据行。
     *
     * @param line 数据行文本
     * @param lineNumber 文件中的物理行号
     * @return 校验通过的任务
     */
    private static Task parseTask(String line, int lineNumber) {
        String[] fields = line.split("\\|", -1);
        if (fields.length != 3) {
            throw new IllegalArgumentException(
                "第 " + lineNumber + " 行必须恰好包含三个字段"
            );
        }

        try {
            validateField("任务编号", fields[0]);
            validateField("任务标题", fields[1]);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                "第 " + lineNumber + " 行" + exception.getMessage(),
                exception
            );
        }

        TaskStatus status;
        try {
            status = TaskStatus.valueOf(fields[2]);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                "第 " + lineNumber + " 行状态非法: " + fields[2],
                exception
            );
        }
        return new Task(fields[0], fields[1], status);
    }

    /**
     * 从 UTF-8 文件导入并整批校验任务。
     *
     * @param path 导入路径
     * @return 保持文件顺序的任务清单
     * @throws IOException 文件读取失败时抛出
     */
    private static List<Task> importTasks(Path path) throws IOException {
        List<String> lines = Files.readAllLines(path, UTF_8);
        if (lines.isEmpty()) {
            throw new IllegalArgumentException("任务文件为空");
        }
        if (!VERSION_HEADER.equals(lines.get(0))) {
            throw new IllegalArgumentException("不支持的任务文件版本: " + lines.get(0));
        }

        List<Task> tasks = new ArrayList<Task>();
        Set<String> ids = new HashSet<String>();
        for (int index = 1; index < lines.size(); index++) {
            int lineNumber = index + 1;
            Task task = parseTask(lines.get(index), lineNumber);
            if (!ids.add(task.getId())) {
                throw new IllegalArgumentException(
                    "第 " + lineNumber + " 行编号重复: " + task.getId()
                );
            }
            tasks.add(task);
        }
        return tasks;
    }

    /**
     * 按文件顺序输出导入后的任务。
     *
     * @param tasks 已导入的任务
     */
    private static void printTasks(List<Task> tasks) {
        for (Task task : tasks) {
            System.out.println(
                task.getId() + " | " + task.getTitle() + " | " + task.getStatus()
            );
        }
    }

    /**
     * 导出、导入并核对 TeamFlow 任务清单。
     *
     * @param args 未使用的命令行参数
     * @throws IOException 文件读写失败时抛出
     */
    public static void main(String[] args) throws IOException {
        Path taskFile = Path.of("teamflow-tasks.txt");
        List<Task> originalTasks = Arrays.asList(
            new Task("TASK-101", "准备项目周报", TaskStatus.DONE),
            new Task("TASK-102", "整理评审记录", TaskStatus.TODO)
        );

        exportTasks(taskFile, originalTasks);
        List<Task> importedTasks = importTasks(taskFile);
        boolean sameContent = serializeTasks(originalTasks).equals(serializeTasks(importedTasks));

        System.out.println("已导出：" + taskFile.getFileName());
        System.out.println("导入任务数：" + importedTasks.size());
        printTasks(importedTasks);
        System.out.println("往返一致：" + sameContent);
    }
}
```

### 3. 预期文件与控制台输出

生成的 `teamflow-tasks.txt` 内容逐字为：

```text
TEAMFLOW_TASKS_V1
TASK-101|准备项目周报|DONE
TASK-102|整理评审记录|TODO
```

控制台输出逐字为：

```text
已导出：teamflow-tasks.txt
导入任务数：2
TASK-101 | 准备项目周报 | DONE
TASK-102 | 整理评审记录 | TODO
往返一致：true
```

### 4. 从启动到往返核对经历了什么

`main` 先创建两条内存任务。`exportTasks` 调用 `serializeTasks`，后者先检查对象、字段、状态与重复编号，
再生成完整文本；只有这个调用成功，`Files.writeString` 才打开目标文件。

随后 `importTasks` 以 UTF-8 读出所有行，第 1 行确认版本，第 2、3 行分别解析。每一行先检查字段数和字段
内容，再把状态转换成枚举，并由 `Set` 做本批唯一性判断。全部成功后，方法才返回两条任务。

最后，程序把原始任务与导入任务分别重新序列化，比较两份合同文本。输出 `true` 说明本次关注的编号、
标题、状态和顺序都完成了往返；它不是对任意文件损坏、并发或磁盘故障的保证。

## 七、Java 8 完整程序

### 1. 在 IDEA 中准备兼容版

1. 在 **File -> Project Structure -> SDKs** 中添加本机已有的 JDK 8，不要下载或替换系统 JDK。
2. 把 Project SDK、Module SDK 和 Language level 都设为 8，运行配置 JRE 也选择同一个 JDK 8。
3. 在独立兼容目录创建同名 Java 文件，避免和 JDK 25 编译产物混在一起。
4. 粘贴下面的完整代码，确认导入的是 `java.nio.file.Paths`，源码没有 `Path.of` 或 `writeString`。
5. 运行 `main`，再核对文件内容和控制台五行输出与现代版逐字一致。

终端可在兼容源码目录执行：

```bash
javac -encoding UTF-8 TeamFlowTaskExchangeApplication.java
java TeamFlowTaskExchangeApplication
```

### 2. 完整兼容代码

```java
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public final class TeamFlowTaskExchangeApplication {
    private static final String VERSION_HEADER = "TEAMFLOW_TASKS_V1";
    private static final Charset UTF_8 = StandardCharsets.UTF_8;

    private enum TaskStatus {
        TODO,
        DONE
    }

    private static final class Task {
        private final String id;
        private final String title;
        private final TaskStatus status;

        /**
         * 创建一条可交换的 TeamFlow 任务。
         *
         * @param id 任务编号
         * @param title 任务标题
         * @param status 任务状态
         */
        private Task(String id, String title, TaskStatus status) {
            this.id = id;
            this.title = title;
            this.status = status;
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
         * 返回任务状态。
         *
         * @return TODO 或 DONE
         */
        private TaskStatus getStatus() {
            return status;
        }
    }

    /**
     * 校验一个字段是否适合写入本课的单行文本合同。
     *
     * @param fieldName 字段名称
     * @param value 字段值
     */
    private static void validateField(String fieldName, String value) {
        if (value == null || value.isEmpty()) {
            throw new IllegalArgumentException(fieldName + "不能为空");
        }
        if (value.indexOf('|') >= 0 || value.indexOf('\r') >= 0 || value.indexOf('\n') >= 0) {
            throw new IllegalArgumentException(fieldName + "包含保留字符");
        }
    }

    /**
     * 在写文件前校验全部任务和编号唯一性。
     *
     * @param tasks 准备导出的任务
     */
    private static void validateTasks(List<Task> tasks) {
        if (tasks == null) {
            throw new IllegalArgumentException("任务清单不能为空");
        }

        Set<String> ids = new HashSet<String>();
        for (Task task : tasks) {
            if (task == null) {
                throw new IllegalArgumentException("任务项不能为空");
            }
            validateField("任务编号", task.getId());
            validateField("任务标题", task.getTitle());
            if (task.getStatus() == null) {
                throw new IllegalArgumentException("任务状态不能为空");
            }
            if (!ids.add(task.getId())) {
                throw new IllegalArgumentException("任务编号重复: " + task.getId());
            }
        }
    }

    /**
     * 把完整任务清单序列化为固定换行的版本化文本。
     *
     * @param tasks 准备序列化的任务
     * @return 可直接写入 UTF-8 文件的完整文本
     */
    private static String serializeTasks(List<Task> tasks) {
        validateTasks(tasks);

        StringBuilder output = new StringBuilder();
        output.append(VERSION_HEADER).append('\n');
        for (Task task : tasks) {
            output.append(task.getId())
                .append('|')
                .append(task.getTitle())
                .append('|')
                .append(task.getStatus().name())
                .append('\n');
        }
        return output.toString();
    }

    /**
     * 先构建完整文本，再以 UTF-8 覆盖导出任务文件。
     *
     * @param path 导出路径
     * @param tasks 准备导出的任务
     * @throws IOException 文件写入失败时抛出
     */
    private static void exportTasks(Path path, List<Task> tasks) throws IOException {
        String content = serializeTasks(tasks);
        Files.write(path, content.getBytes(UTF_8));
    }

    /**
     * 解析并校验一个任务数据行。
     *
     * @param line 数据行文本
     * @param lineNumber 文件中的物理行号
     * @return 校验通过的任务
     */
    private static Task parseTask(String line, int lineNumber) {
        String[] fields = line.split("\\|", -1);
        if (fields.length != 3) {
            throw new IllegalArgumentException(
                "第 " + lineNumber + " 行必须恰好包含三个字段"
            );
        }

        try {
            validateField("任务编号", fields[0]);
            validateField("任务标题", fields[1]);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                "第 " + lineNumber + " 行" + exception.getMessage(),
                exception
            );
        }

        TaskStatus status;
        try {
            status = TaskStatus.valueOf(fields[2]);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                "第 " + lineNumber + " 行状态非法: " + fields[2],
                exception
            );
        }
        return new Task(fields[0], fields[1], status);
    }

    /**
     * 从 UTF-8 文件导入并整批校验任务。
     *
     * @param path 导入路径
     * @return 保持文件顺序的任务清单
     * @throws IOException 文件读取失败时抛出
     */
    private static List<Task> importTasks(Path path) throws IOException {
        List<String> lines = Files.readAllLines(path, UTF_8);
        if (lines.isEmpty()) {
            throw new IllegalArgumentException("任务文件为空");
        }
        if (!VERSION_HEADER.equals(lines.get(0))) {
            throw new IllegalArgumentException("不支持的任务文件版本: " + lines.get(0));
        }

        List<Task> tasks = new ArrayList<Task>();
        Set<String> ids = new HashSet<String>();
        for (int index = 1; index < lines.size(); index++) {
            int lineNumber = index + 1;
            Task task = parseTask(lines.get(index), lineNumber);
            if (!ids.add(task.getId())) {
                throw new IllegalArgumentException(
                    "第 " + lineNumber + " 行编号重复: " + task.getId()
                );
            }
            tasks.add(task);
        }
        return tasks;
    }

    /**
     * 按文件顺序输出导入后的任务。
     *
     * @param tasks 已导入的任务
     */
    private static void printTasks(List<Task> tasks) {
        for (Task task : tasks) {
            System.out.println(
                task.getId() + " | " + task.getTitle() + " | " + task.getStatus()
            );
        }
    }

    /**
     * 导出、导入并核对 TeamFlow 任务清单。
     *
     * @param args 未使用的命令行参数
     * @throws IOException 文件读写失败时抛出
     */
    public static void main(String[] args) throws IOException {
        Path taskFile = Paths.get("teamflow-tasks.txt");
        List<Task> originalTasks = Arrays.asList(
            new Task("TASK-101", "准备项目周报", TaskStatus.DONE),
            new Task("TASK-102", "整理评审记录", TaskStatus.TODO)
        );

        exportTasks(taskFile, originalTasks);
        List<Task> importedTasks = importTasks(taskFile);
        boolean sameContent = serializeTasks(originalTasks).equals(serializeTasks(importedTasks));

        System.out.println("已导出：" + taskFile.getFileName());
        System.out.println("导入任务数：" + importedTasks.size());
        printTasks(importedTasks);
        System.out.println("往返一致：" + sameContent);
    }
}
```

### 3. API 差异和共同合同

Java 8 版只把 `Path.of("teamflow-tasks.txt")` 改为 `Paths.get("teamflow-tasks.txt")`，并把
`Files.writeString(path, content, UTF_8)` 改为
`Files.write(path, content.getBytes(UTF_8))`。这两个现代便利入口自 Java 11 才提供。

`Files.readAllLines(path, UTF_8)`、`String.split("\\|", -1)`、集合、枚举和异常处理在 Java 8 已经可用，
不需要制造另一套业务合同。对本课示例中的正常 Unicode 文本，两版写出的 UTF-8 字节、导入顺序、校验
规则和控制台输出应逐字一致；畸形 UTF-16 字符序列的编码替换或失败策略不在这份入门合同中。

## 八、独立练习

:::exercise
### 完成发布任务清单的往返检查

**要求：** 创建 `TeamFlowTaskExchangePractice`，按同一个 `TEAMFLOW_TASKS_V1` 合同导出三条发布任务：
`TASK-201|确认发布清单|DONE`、`TASK-202|同步接口说明|TODO`、
`TASK-203|通知验收人员|TODO`。导入后分别统计 TODO 与 DONE 数量，并比较导出前后的合同文本。编号和
标题必须非空且不包含管道符、回车或换行；状态严格使用枚举；重复编号必须失败。JDK 25 与 Java 8
分别给出完整实现，写入前必须完成业务校验与文本构建。

**验收：** 两版都生成逐字相同的四行 UTF-8 文件，并依次输出练习文件名、任务总数 3、TODO 数量 2、
DONE 数量 1 和合同往返 `true`。把第三条状态改成 `WAITING`，再用 `--import-only` 参数运行，程序必须
报告第 4 行状态非法，不能在导入前覆盖文件，也不能把它计入 TODO。

**参考答案：** 参考实现继续使用负 limit、行号、Set 和显式 UTF-8；现代版只在 Path 与写入便利 API
上使用 JDK 25 能力，兼容版保持同一文件与统计合同。
:::

### 1. JDK 25 参考实现

```java
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public final class TeamFlowTaskExchangePractice {
    private static final String VERSION_HEADER = "TEAMFLOW_TASKS_V1";

    private enum TaskStatus {
        TODO,
        DONE
    }

    private static final class Task {
        private final String id;
        private final String title;
        private final TaskStatus status;

        /**
         * 创建一条发布任务。
         *
         * @param id 任务编号
         * @param title 任务标题
         * @param status 任务状态
         */
        private Task(String id, String title, TaskStatus status) {
            this.id = id;
            this.title = title;
            this.status = status;
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
         * 返回任务状态。
         *
         * @return 任务状态
         */
        private TaskStatus getStatus() {
            return status;
        }
    }

    /**
     * 校验字段能够无歧义地进入单行合同。
     *
     * @param name 字段名称
     * @param value 字段值
     */
    private static void validateField(String name, String value) {
        if (value == null || value.isEmpty()) {
            throw new IllegalArgumentException(name + "不能为空");
        }
        if (value.indexOf('|') >= 0 || value.indexOf('\r') >= 0 || value.indexOf('\n') >= 0) {
            throw new IllegalArgumentException(name + "包含保留字符");
        }
    }

    /**
     * 校验并构建完整任务文件文本。
     *
     * @param tasks 准备导出的任务
     * @return 固定换行的版本化文本
     */
    private static String toText(List<Task> tasks) {
        Set<String> ids = new HashSet<String>();
        for (Task task : tasks) {
            validateField("任务编号", task.getId());
            validateField("任务标题", task.getTitle());
            if (task.getStatus() == null) {
                throw new IllegalArgumentException("任务状态不能为空");
            }
            if (!ids.add(task.getId())) {
                throw new IllegalArgumentException("任务编号重复: " + task.getId());
            }
        }

        StringBuilder text = new StringBuilder(VERSION_HEADER).append('\n');
        for (Task task : tasks) {
            text.append(task.getId())
                .append('|')
                .append(task.getTitle())
                .append('|')
                .append(task.getStatus())
                .append('\n');
        }
        return text.toString();
    }

    /**
     * 解析一行任务并保留物理行号上下文。
     *
     * @param line 数据行
     * @param lineNumber 物理行号
     * @return 解析后的任务
     */
    private static Task parseTask(String line, int lineNumber) {
        String[] fields = line.split("\\|", -1);
        if (fields.length != 3) {
            throw new IllegalArgumentException("第 " + lineNumber + " 行字段数量错误");
        }
        try {
            validateField("任务编号", fields[0]);
            validateField("任务标题", fields[1]);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                "第 " + lineNumber + " 行内容非法: " + exception.getMessage(),
                exception
            );
        }

        TaskStatus status;
        try {
            status = TaskStatus.valueOf(fields[2]);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                "第 " + lineNumber + " 行状态非法: " + fields[2],
                exception
            );
        }
        return new Task(fields[0], fields[1], status);
    }

    /**
     * 从 UTF-8 小文件导入并验证任务。
     *
     * @param path 导入路径
     * @return 保持文件顺序的任务
     * @throws IOException 文件读取失败时抛出
     */
    private static List<Task> importTasks(Path path) throws IOException {
        List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);
        if (lines.isEmpty() || !VERSION_HEADER.equals(lines.get(0))) {
            throw new IllegalArgumentException("任务文件版本错误");
        }

        List<Task> tasks = new ArrayList<Task>();
        Set<String> ids = new HashSet<String>();
        for (int index = 1; index < lines.size(); index++) {
            Task task = parseTask(lines.get(index), index + 1);
            if (!ids.add(task.getId())) {
                throw new IllegalArgumentException("第 " + (index + 1) + " 行编号重复");
            }
            tasks.add(task);
        }
        return tasks;
    }

    /**
     * 统计指定状态的任务数量。
     *
     * @param tasks 任务清单
     * @param expected 需要统计的状态
     * @return 匹配数量
     */
    private static int countStatus(List<Task> tasks, TaskStatus expected) {
        int count = 0;
        for (Task task : tasks) {
            if (task.getStatus() == expected) {
                count++;
            }
        }
        return count;
    }

    /**
     * 完成发布任务的导出、导入和统计验收。
     *
     * @param args 可选的 --import-only 参数，用于只导入现有文件
     * @throws IOException 文件读写失败时抛出
     */
    public static void main(String[] args) throws IOException {
        Path path = Path.of("teamflow-release-tasks.txt");
        boolean importOnly = args.length == 1 && "--import-only".equals(args[0]);
        if (args.length > 1 || (args.length == 1 && !importOnly)) {
            throw new IllegalArgumentException("只支持 --import-only 参数");
        }
        List<Task> original = Arrays.asList(
            new Task("TASK-201", "确认发布清单", TaskStatus.DONE),
            new Task("TASK-202", "同步接口说明", TaskStatus.TODO),
            new Task("TASK-203", "通知验收人员", TaskStatus.TODO)
        );

        String content = toText(original);
        if (!importOnly) {
            Files.writeString(path, content, StandardCharsets.UTF_8);
        }
        List<Task> imported = importTasks(path);

        System.out.println("练习文件：" + path.getFileName());
        System.out.println("任务总数：" + imported.size());
        System.out.println("TODO：" + countStatus(imported, TaskStatus.TODO));
        System.out.println("DONE：" + countStatus(imported, TaskStatus.DONE));
        System.out.println("合同往返：" + content.equals(toText(imported)));
    }
}
```

### 2. Java 8 参考实现

```java
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public final class TeamFlowTaskExchangePractice {
    private static final String VERSION_HEADER = "TEAMFLOW_TASKS_V1";

    private enum TaskStatus {
        TODO,
        DONE
    }

    private static final class Task {
        private final String id;
        private final String title;
        private final TaskStatus status;

        /**
         * 创建一条发布任务。
         *
         * @param id 任务编号
         * @param title 任务标题
         * @param status 任务状态
         */
        private Task(String id, String title, TaskStatus status) {
            this.id = id;
            this.title = title;
            this.status = status;
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
         * 返回任务状态。
         *
         * @return 任务状态
         */
        private TaskStatus getStatus() {
            return status;
        }
    }

    /**
     * 校验字段能够无歧义地进入单行合同。
     *
     * @param name 字段名称
     * @param value 字段值
     */
    private static void validateField(String name, String value) {
        if (value == null || value.isEmpty()) {
            throw new IllegalArgumentException(name + "不能为空");
        }
        if (value.indexOf('|') >= 0 || value.indexOf('\r') >= 0 || value.indexOf('\n') >= 0) {
            throw new IllegalArgumentException(name + "包含保留字符");
        }
    }

    /**
     * 校验并构建完整任务文件文本。
     *
     * @param tasks 准备导出的任务
     * @return 固定换行的版本化文本
     */
    private static String toText(List<Task> tasks) {
        Set<String> ids = new HashSet<String>();
        for (Task task : tasks) {
            validateField("任务编号", task.getId());
            validateField("任务标题", task.getTitle());
            if (task.getStatus() == null) {
                throw new IllegalArgumentException("任务状态不能为空");
            }
            if (!ids.add(task.getId())) {
                throw new IllegalArgumentException("任务编号重复: " + task.getId());
            }
        }

        StringBuilder text = new StringBuilder(VERSION_HEADER).append('\n');
        for (Task task : tasks) {
            text.append(task.getId())
                .append('|')
                .append(task.getTitle())
                .append('|')
                .append(task.getStatus())
                .append('\n');
        }
        return text.toString();
    }

    /**
     * 解析一行任务并保留物理行号上下文。
     *
     * @param line 数据行
     * @param lineNumber 物理行号
     * @return 解析后的任务
     */
    private static Task parseTask(String line, int lineNumber) {
        String[] fields = line.split("\\|", -1);
        if (fields.length != 3) {
            throw new IllegalArgumentException("第 " + lineNumber + " 行字段数量错误");
        }
        try {
            validateField("任务编号", fields[0]);
            validateField("任务标题", fields[1]);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                "第 " + lineNumber + " 行内容非法: " + exception.getMessage(),
                exception
            );
        }

        TaskStatus status;
        try {
            status = TaskStatus.valueOf(fields[2]);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                "第 " + lineNumber + " 行状态非法: " + fields[2],
                exception
            );
        }
        return new Task(fields[0], fields[1], status);
    }

    /**
     * 从 UTF-8 小文件导入并验证任务。
     *
     * @param path 导入路径
     * @return 保持文件顺序的任务
     * @throws IOException 文件读取失败时抛出
     */
    private static List<Task> importTasks(Path path) throws IOException {
        List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);
        if (lines.isEmpty() || !VERSION_HEADER.equals(lines.get(0))) {
            throw new IllegalArgumentException("任务文件版本错误");
        }

        List<Task> tasks = new ArrayList<Task>();
        Set<String> ids = new HashSet<String>();
        for (int index = 1; index < lines.size(); index++) {
            Task task = parseTask(lines.get(index), index + 1);
            if (!ids.add(task.getId())) {
                throw new IllegalArgumentException("第 " + (index + 1) + " 行编号重复");
            }
            tasks.add(task);
        }
        return tasks;
    }

    /**
     * 统计指定状态的任务数量。
     *
     * @param tasks 任务清单
     * @param expected 需要统计的状态
     * @return 匹配数量
     */
    private static int countStatus(List<Task> tasks, TaskStatus expected) {
        int count = 0;
        for (Task task : tasks) {
            if (task.getStatus() == expected) {
                count++;
            }
        }
        return count;
    }

    /**
     * 完成发布任务的导出、导入和统计验收。
     *
     * @param args 可选的 --import-only 参数，用于只导入现有文件
     * @throws IOException 文件读写失败时抛出
     */
    public static void main(String[] args) throws IOException {
        Path path = Paths.get("teamflow-release-tasks.txt");
        boolean importOnly = args.length == 1 && "--import-only".equals(args[0]);
        if (args.length > 1 || (args.length == 1 && !importOnly)) {
            throw new IllegalArgumentException("只支持 --import-only 参数");
        }
        List<Task> original = Arrays.asList(
            new Task("TASK-201", "确认发布清单", TaskStatus.DONE),
            new Task("TASK-202", "同步接口说明", TaskStatus.TODO),
            new Task("TASK-203", "通知验收人员", TaskStatus.TODO)
        );

        String content = toText(original);
        if (!importOnly) {
            Files.write(path, content.getBytes(StandardCharsets.UTF_8));
        }
        List<Task> imported = importTasks(path);

        System.out.println("练习文件：" + path.getFileName());
        System.out.println("任务总数：" + imported.size());
        System.out.println("TODO：" + countStatus(imported, TaskStatus.TODO));
        System.out.println("DONE：" + countStatus(imported, TaskStatus.DONE));
        System.out.println("合同往返：" + content.equals(toText(imported)));
    }
}
```

### 3. 练习文件和预期输出

两版生成的文件逐字为：

```text
TEAMFLOW_TASKS_V1
TASK-201|确认发布清单|DONE
TASK-202|同步接口说明|TODO
TASK-203|通知验收人员|TODO
```

控制台逐字输出：

```text
练习文件：teamflow-release-tasks.txt
任务总数：3
TODO：2
DONE：1
合同往返：true
```

练习把同一合同用于另一组数据，并增加了导入后的状态统计。`TODO：2` 与 `DONE：1` 来自已经成功导入的
三条任务；若任何一行非法，`importTasks` 会在统计前失败，因此输出不会掩盖坏数据。

验证失败路径时，先不带参数运行一次，让程序生成合法文件。然后打开 `teamflow-release-tasks.txt`，把第
4 行末尾的 `TODO` 改成 `WAITING` 并保存。在 JDK 25 工程的运行配置中，把 **Program arguments** 设置为
`--import-only` 后再次运行；程序会跳过写入，直接读取刚才修改的文件。控制台堆栈中的关键消息是：

```text
java.lang.IllegalArgumentException: 第 4 行状态非法: WAITING
```

Java 8 工程使用 JDK 8 Project SDK，执行同样两次运行：第一次保持 **Program arguments** 为空，第二次
设置为 `--import-only`。Java 8 参考实现也会跳过写入并报告同一条关键消息。行号和调用栈位置可能因代码
位置而不同，但“第 4 行状态非法”及原值 `WAITING` 必须出现；重新验证正常路径时，清空参数再运行即可。

## 九、把往返合同带回 TeamFlow

### 1. 一次可靠的小文件交换需要五个决定

开始编码前，先回答：文件用什么版本头、每行有哪些字段、哪些字符被保留、允许哪些状态、遇到整批中
任意坏行时怎样失败。代码里的 `split`、枚举、Set、UTF-8 和行号都应能追溯到其中一个决定。

### 2. 自我检查

1. 为什么 `split("|")` 不是按普通管道符拆分？
2. 为什么本课使用负 limit，`TASK-101|标题|` 会被检查成什么？
3. 为什么版本头必须逐字比较，而不能靠字段数量猜格式？
4. 为什么重复编号在字段数和状态都合法时仍要拒绝？
5. 先序列化再写入避免了哪一种失败，又没有解决哪一种失败？
6. JDK 25 与 Java 8 的 Path 和写入入口分别是什么，哪些业务合同保持不变？

能够独立修改任务数据、运行两个完整版本、核对文件字节与控制台输出，并让多个坏文件稳定触发对应
行号后，才算真正完成这次任务清单导入导出实战。
