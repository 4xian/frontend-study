---
id: backend.java.learn.intermediate.json-and-data-contracts
type: lesson
title: JSON 数据契约
summary: 读懂 JSON 的基本结构，明确字段名、类型和空值规则，并用 Jackson 在 JSON 与固定 Java 数据对象之间转换
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 120
prerequisites:
  - backend.java.learn.intermediate.transactions-and-idempotency
objectives:
  - 能区分 JSON 的对象、数组、字符串、数字、布尔和 null。
  - 能把字段名、JSON 类型、是否必填、是否允许 null 和格式约束写成可核对的数据合同。
  - 能区分字段缺失、JSON null、空字符串和空数组表达的不同状态。
  - 能使用 Jackson 把一份固定 JSON 映射为 Java 数据对象，再把对象写回 JSON。
  - 能正确处理字符串 ID、十进制金额、带偏移时间和未知字段。
  - 能写出 JDK 25 / Jackson 3.2.1 与 Java 8 / Jackson 2.12.7.1 的完整程序。
recap:
  - JSON 由对象、数组、字符串、数字、布尔和 null 组成，字段名必须使用双引号。
  - 数据合同需要同时约定字段名、类型、必填性、null、空值和格式，只有语法合法还不够。
  - 缺失、null 和空字符串是三种状态；简单 Java 引用字段可能把缺失与 null 都映射成 null。
  - 字符串适合保存跨系统 ID，BigDecimal 适合接收十进制金额，时间文本应明确偏移量。
  - Jackson 的 readValue 读取 JSON，writeValueAsString 写回 JSON；本课显式拒绝未知字段。
  - JDK 25 使用 record、文本块和 Jackson 3，Java 8 使用普通不可变类、字符串拼接和 Jackson 2。
related: []
tags:
  - Java
  - JSON
  - Jackson
  - 数据契约
  - TeamFlow
appliesTo: JDK 25 与 Jackson 3.2.1 主线；Java 8 与 Jackson 2.12.7.1 兼容写法
verifiedAt: 2026-08-18
sources:
  - id: rfc8259-json
    title: RFC 8259 - The JavaScript Object Notation (JSON) Data Interchange Format
    url: https://www.rfc-editor.org/rfc/rfc8259.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: JSON
    claims:
      - JSON 的对象、数组、字符串、数字、布尔和 null 语法
      - 对象成员名应唯一，NaN 与 Infinity 不是合法 JSON 数字
      - 跨系统整数互操作范围
  - id: jackson32-databind-readme
    title: Jackson Databind 3.2.1 README
    url: https://github.com/FasterXML/jackson-databind/blob/jackson-databind-3.2.1/README.md
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Jackson Databind 3.2.1
    claims:
      - tools.jackson.core Maven 坐标、tools.jackson.databind 包与 JDK 17 基线
      - JsonMapper 构建、readValue、writeValueAsString 与未知字段配置方式
  - id: jackson32-record-test
    title: Jackson Databind 3.2.1 RecordBasicsTest
    url: https://github.com/FasterXML/jackson-databind/blob/jackson-databind-3.2.1/src/test/java/tools/jackson/databind/records/RecordBasicsTest.java
    sourceOrigin: official
    sourceType: official-test
    appliesTo: Jackson Databind 3.2.1
    claims:
      - Jackson 3.2.1 的官方测试覆盖 record 的基本读取与写出
  - id: jackson212-databind-readme
    title: Jackson Databind 2.12.7.1 README
    url: https://github.com/FasterXML/jackson-databind/blob/jackson-databind-2.12.7.1/README.md
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Jackson Databind 2.12.7.1
    claims:
      - com.fasterxml.jackson.databind 包、ObjectMapper 与未知字段配置方式
      - Java 类与 JSON 之间的 readValue、writeValueAsString 映射方式
  - id: java25-bigdecimal
    title: Java SE 25 API - BigDecimal
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/math/BigDecimal.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25；相关构造行为同样适用于 Java 8
    claims:
      - 从 double 构造 BigDecimal 可能得到浮点值的精确十进制展开
      - 从字符串构造可以保留可预测的十进制值
  - id: java25-offset-date-time
    title: Java SE 25 API - OffsetDateTime
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/OffsetDateTime.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25；OffsetDateTime.parse 同样适用于 Java 8
    claims:
      - OffsetDateTime.parse 使用带偏移的 ISO 日期时间文本
  - id: community-jackson-unknown-field
    title: "Stack Overflow - Jackson with JSON: Unrecognized field, not marked as ignorable"
    url: https://stackoverflow.com/questions/4486787/jackson-with-json-unrecognized-field-not-marked-as-ignorable
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Jackson 未知字段排查；配置结论已按 Jackson 官方文档核验
    claims:
      - JSON 字段名与 Java 数据对象不一致会真实触发未知字段问题
      - 直接忽略未知字段可能掩盖调用方拼错字段名
---

# JSON 数据契约

上一课为 TeamFlow 选出了 `/tasks/TASK-101` 这样的资源 URI，但“一个任务的表示里有什么”仍然没有答案。
客户端和服务端即使都使用 JSON，也可能对 `budget` 是数字还是字符串、`assignee` 缺失还是为 `null`、时间
有没有时区偏移产生不同理解。语法合法只说明文本可以被解析，不代表双方已经形成相同合同。

本课先读懂 JSON 的基本结构，再把一份 TeamFlow 任务样本整理成字段合同，最后用 Jackson 在 JSON 与固定
Java 数据对象之间来回映射。这里只处理一份数据，不设计任务 API，不编写 Controller，也不引入统一响应、
校验框架或 Spring Boot。

## 一、读懂 JSON 的值与结构

### 1. 六类值组成一份 JSON

JSON 中可以出现对象、数组、字符串、数字、布尔和 `null`。下面是一份任务快照：

```json
{
  "id": "TASK-101",
  "title": "整理课程合同",
  "budget": 128.5,
  "dueAt": "2026-08-20T18:00:00+08:00",
  "archived": false,
  "assignee": null,
  "labels": ["java", "json"]
}
```

逐项观察它的结构：

- 最外层 `{}` 是对象，对象由字段名和值组成。
- `id`、`title`、`dueAt` 是字符串，字符串使用双引号。
- `budget` 是数字。JSON 只规定数字语法，不自带 Java 的 `int`、`double` 或 `BigDecimal` 类型名。
- `archived` 是布尔值，只能写小写的 `true` 或 `false`。
- `assignee` 的值是 `null`，表示合同明确允许这里没有负责人。
- `labels` 是数组，数组 `[]` 中按顺序放了两个字符串。

对象和数组可以继续包含任意 JSON 值，因此能够形成更深结构。本课只使用上面这一层任务对象和一个字符串
数组，不提前设计复杂的嵌套 API。

### 2. 字段名和字符串都必须使用双引号

JSON 不是 Java 的 `Map.toString()`，也不是可以随意省略引号的配置文本。下面三段看起来相近，只有第一段
是合法 JSON：

```json
{"id": "TASK-101"}
```

```text
{id=TASK-101}
```

```text
{'id': 'TASK-101'}
```

第一段使用冒号分隔字段名和值，并用双引号包住两段字符串。第二段是 Java Map 常见的显示结果，第三段使用
了 JSON 不接受的单引号。只有真正的 JSON 序列化器生成的文本，才能稳定处理引号、反斜杠和换行等转义。

### 3. 数字能写出来不等于能跨系统精确保留

JSON 数字可以包含整数、小数和指数，但不允许 Java 中的 `NaN` 或 `Infinity`。RFC 8259 还指出，不超出
`[-(2^53)+1, (2^53)-1]` 的整数在常见实现之间具有更好的精确互操作性。

TeamFlow 的 `TASK-101` 是标识符，不参与算术，因此合同把它写成字符串。这样即使未来编号变长，JavaScript
等使用 IEEE 754 双精度数的客户端也不会先把编号舍入。金额 `128.50` 需要保留十进制含义，Java 目标字段
使用 `BigDecimal`，不让金额先经过 `double`。

### 4. 对象成员名应保持唯一

下面的对象重复了 `title`：

```json
{
  "title": "整理课程",
  "title": "整理课程合同"
}
```

不同实现可能保留第一个、保留最后一个或直接拒绝。数据合同不能依赖这种不可移植行为，因此每个对象中的
成员名都应唯一。字段顺序不表达业务含义，调用方也不应依靠 `id` 一定排在 `title` 前面。

## 二、把任务样本写成字段合同

### 1. 合同需要同时约定名称、类型和空值

只给一段样本容易让人猜规则。把它整理成表格后，调用双方才能逐列核对：

| 字段 | JSON 类型 | Java 目标类型 | 必填 | 允许 null | 本课约束 |
| --- | --- | --- | --- | --- | --- |
| `id` | 字符串 | `String` | 是 | 否 | 非空，格式示例 `TASK-101` |
| `title` | 字符串 | `String` | 是 | 否 | 非空字符串 |
| `budget` | 数字 | `BigDecimal` | 是 | 否 | 十进制金额 |
| `dueAt` | 字符串 | `String` 后解析为 `OffsetDateTime` | 是 | 否 | 必须带偏移，如 `+08:00` |
| `archived` | 布尔 | `boolean` | 是 | 否 | `true` 或 `false` |
| `assignee` | 字符串 | `String` | 否 | 是 | 未分配时使用 `null` |
| `labels` | 数组 | `List<String>` | 是 | 否 | 可以是空数组，元素都是字符串 |

表格没有自动执行这些规则。Jackson 负责形状映射，完整程序再用 `OffsetDateTime.parse` 检查时间格式；标题
非空、预算范围等业务约束留给后续输入校验课程。本课先学会把约束说清楚，并观察类型映射。

### 2. 缺失、null 和空字符串不是同一种状态

以下三段文本表达三个不同事实：

```json
{}
```

```json
{"assignee": null}
```

```json
{"assignee": ""}
```

- 字段缺失：调用方没有提供 `assignee`。
- JSON `null`：调用方明确提供了字段，并表示当前没有负责人。
- 空字符串：调用方提供了一个长度为 0 的字符串。

本课的简单 `String` 字段会把“缺失”和“显式 null”都映射为 Java `null`，因此 Java 对象中无法再区分这
两种输入。若业务必须区分“没有提交”和“主动清空”，数据模型需要额外保存字段是否出现；这属于具体 API
更新合同，本课不展开。空字符串不会自动变成 `null`，不要把它当作通用的“没有值”。

空数组 `[]` 也不同于 `null`。`"labels": []` 表示标签集合存在但没有元素；`"labels": null` 表示整个
标签值为空，而本课合同不允许后一种写法。

### 3. 时间字符串必须说明偏移

`2026-08-20T18:00:00` 只描述墙上时间，没有说明它位于哪个偏移量。TeamFlow 使用：

```text
2026-08-20T18:00:00+08:00
```

`+08:00` 让时间含义完整。程序先把 JSON 字段映射为 `String`，再执行：

```java
OffsetDateTime dueAt = OffsetDateTime.parse(task.dueAt());
```

解析成功后，`dueAt.getOffset()` 输出 `+08:00`。如果删除偏移量，`OffsetDateTime.parse` 会拒绝这段
文本，因为它不能构造一个带偏移的日期时间。

### 4. 未知字段策略要由合同明确选择

假设调用方把 `archived` 拼成 `archive`，而 mapper 静默忽略未知字段，Java 的 `boolean` 字段就可能保留
默认值 `false`。程序看似成功，却没有按调用方预期读取数据。本课在两个版本中都显式启用：

```java
mapper.enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
```

这样 JSON 中出现数据对象没有声明的字段时，映射立即失败。这个策略适合本课用固定样本学习严格合同；真实
API 是否为了向前兼容而允许新增字段，需要双方另行约定，不能在没有合同的情况下随意切换。

**社区补充：** Stack Overflow 的真实问题中，字段名与 Java 属性不一致会触发
`UnrecognizedPropertyException`，常见回答是关闭未知字段失败。Jackson 官方文档确认该配置确实存在；
但对本课的固定输入，直接关闭会掩盖拼写错误，所以保留严格策略并先核对字段名。这个经验适用于 Jackson
2 和 Jackson 3，两个版本的配置 API 包名不同。

## 三、用 Jackson 连接 JSON 与 Java 对象

### 1. 两个方向是读取与写出

Jackson 映射可以先记住两个操作：

```java
TaskSnapshot task = mapper.readValue(json, TaskSnapshot.class);
String encoded = mapper.writeValueAsString(task);
```

`readValue` 接收 JSON 文本和目标类型。解析器先读对象字段，再按字段名把值交给目标类型：`budget` 进入
`BigDecimal`，`labels` 进入 `List<String>`。字段名、形状或目标类型不兼容时，读取失败。

`writeValueAsString` 走相反方向：读取 Java 数据对象的属性，生成合法 JSON 字符串。它不会把 Java 对象的
内存布局原样暴露出去，输出只包含 Jackson 识别到的数据属性。

### 2. JDK 25 使用 record 表达固定数据

JDK 25 主线使用 record：

```java
public record TaskSnapshot(
        String id,
        String title,
        BigDecimal budget,
        String dueAt,
        boolean archived,
        String assignee,
        List<String> labels
) {
}
```

record 的组件名正好对应 JSON 字段名。Jackson 3.2.1 官方测试覆盖基本 record 读写，因此不需要为每个
组件再写 setter。record 只负责固定数据形状；“标题不能为空”等合同仍需要单独检查，不能因为映射成功就
认为业务数据有效。

### 3. Java 8 使用普通不可变类

Java 8 不支持 record，也不支持文本块；它使用普通类、`final` 字段和带注解的构造器：

```java
@JsonCreator
public TaskSnapshot(
        @JsonProperty("id") String id,
        @JsonProperty("title") String title
) {
    this.id = id;
    this.title = title;
}
```

`@JsonCreator` 告诉 Jackson 2 使用这个构造器创建对象，`@JsonProperty` 把构造参数和 JSON 字段对应。
完整兼容程序还在字段上保留 `@JsonProperty`，让同一个不可变对象能够写回 JSON。

两个版本的数据合同相同，差异来自可用语言特性和 Jackson 大版本：

| 环境 | 固定数据对象 | JSON 字符串 | Jackson |
| --- | --- | --- | --- |
| JDK 25 | record | 文本块 | `tools.jackson.*` 3.2.1 |
| Java 8 | 普通不可变类 | 字符串拼接 | `com.fasterxml.jackson.*` 2.12.7.1 |

Jackson 3 要求 JDK 17 及以上，不能放进 Java 8 项目。Java 8 兼容程序必须使用 Jackson 2 的坐标和包名，
不能只改项目 SDK 而保留 Jackson 3 代码。

## 四、常见错误

### 六个典型合同错误

下面只定位 JSON 与映射边界中的直接问题，不建立后续课程的完整错误分类。

:::pitfalls
### 用单引号和尾随逗号书写 JSON

**现象：** `readValue` 在读取对象前报告 JSON 语法错误。

**触发条件：** 把 JavaScript 对象字面量习惯带进标准 JSON，同时使用单引号并在最后一个成员后保留逗号。

**原因：** RFC 8259 要求字符串使用双引号，标准对象语法不接受最后一个成员后的多余逗号。

**后果：** 整份文本无法进入字段映射，任何 Java 数据对象都得不到。

**错误示例：**

```text
{'id': 'TASK-101',}
```

**正确写法：**

```json
{"id": "TASK-101"}
```

**影响版本：** Java 8 / Jackson 2 与 JDK 25 / Jackson 3 都适用。

**验证方式：** 分别把两段文本传给 `readValue`；错误文本应解析失败，正确文本能够继续映射。

**来源：** RFC 8259 对对象、字符串和分隔符的语法规定。

### 把 Map 的显示文本当成 JSON

**现象：** 控制台看到了 `{id=TASK-101}`，但 JSON 解析器拒绝读取。

**触发条件：** 对 Map 调用 `toString()`，再把结果当作 JSON 发送或保存。

**原因：** Map 的显示格式使用等号且不会按 JSON 规则处理字段名和字符串转义。

**后果：** 其他语言和标准 JSON 工具无法可靠读取这段文本。

**错误示例：**

```java
String json = data.toString();
```

**正确写法：**

```java
String json = mapper.writeValueAsString(data);
```

**影响版本：** Java 8 / Jackson 2 与 JDK 25 / Jackson 3 都适用。

**验证方式：** 打印两段结果；错误写法包含 `=`，正确写法应产生 `{"id":"TASK-101"}` 形式的合法 JSON。

**来源：** RFC 8259 与 Jackson 官方 `writeValueAsString` 用法。

### 拼错字段名后直接关闭未知字段失败

**现象：** 严格 mapper 报告未知字段；关闭严格策略后程序不报错，但目标字段没有获得预期值。

**触发条件：** JSON 写成 `archive`，Java 数据对象声明的是 `archived`，随后用忽略未知字段掩盖异常。

**原因：** Jackson 按合同名称映射字段；两个名称不是同一属性。

**后果：** `boolean` 可能保留默认值，调用方的真实意图静默丢失。

**错误示例：**

```json
{"archive": true}
```

**正确写法：**

```json
{"archived": true}
```

**影响版本：** Java 8 / Jackson 2 与 JDK 25 / Jackson 3 都适用。

**验证方式：** 保持 `FAIL_ON_UNKNOWN_PROPERTIES` 启用并分别读取；错误字段应失败，正确字段映射为 `true`。

**来源：** Jackson 官方未知字段配置；社区真实问题用于确认这一误区具有教学价值。

### 混淆缺失、null 与空字符串

**现象：** 页面显示一个空白负责人，程序却把它解释成“未分配”。

**触发条件：** 合同规定未分配使用 `null`，调用方却发送空字符串。

**原因：** `null` 是 JSON 的空值，`""` 是一个真实字符串，字段缺失又表示调用方没有提供该字段。

**后果：** 清空、未提交和空文本三种操作被混成同一状态，后续更新语义不清楚。

**错误示例：**

```json
{"assignee": ""}
```

**正确写法：**

```json
{"assignee": null}
```

**影响版本：** JSON 合同本身与 Java 版本无关。

**验证方式：** 分别映射 `{}`、`{"assignee":null}` 和 `{"assignee":""}`；本课模型前两者得到 Java
`null`，第三者得到长度为 0 的字符串。

**来源：** RFC 8259 的字符串与 null 语法；映射结果由双版本程序验证。

### 让金额先经过 double

**现象：** 期望 `0.1`，却得到一串更长的十进制小数。

**触发条件：** 先用二进制浮点数保存十进制金额，再执行 `new BigDecimal(doubleValue)`。

**原因：** 构造器精确保留的是传入 double 的实际二进制浮点值，不是源码中看起来的十进制文字。

**后果：** 金额比较、显示或后续计算携带非预期误差。

**错误示例：**

```java
BigDecimal budget = new BigDecimal(0.1);
```

**正确写法：**

```java
BigDecimal budget = new BigDecimal("0.1");
```

**影响版本：** Java 8 与 JDK 25 都适用。

**验证方式：** 对两者调用 `toPlainString()`；错误写法输出很长的小数，正确写法输出 `0.1`。完整程序则
让 Jackson 直接把 JSON 数字映射到 `BigDecimal`。

**来源：** Java SE `BigDecimal` API 文档。

### 时间文本没有偏移量

**现象：** `OffsetDateTime.parse` 拒绝截止时间。

**触发条件：** `dueAt` 只写本地日期和时间，没有 `Z` 或 `+08:00` 等偏移信息。

**原因：** `OffsetDateTime` 同时需要日期、时间和 UTC 偏移，纯本地时间缺少其中一部分。

**后果：** 不同地区无法确定同一个截止瞬间。

**错误示例：**

```json
{"dueAt": "2026-08-20T18:00:00"}
```

**正确写法：**

```json
{"dueAt": "2026-08-20T18:00:00+08:00"}
```

**影响版本：** Java 8 与 JDK 25 都适用。

**验证方式：** 把两个字段值分别传给 `OffsetDateTime.parse`；错误值解析失败，正确值的偏移输出 `+08:00`。

**来源：** Java SE `OffsetDateTime` API 文档。

:::

## 五、JDK 25 完整程序

### 1. 准备 Maven 项目

在 IDEA 中创建或打开 Maven 项目，Project SDK 选择 JDK 25，Maven Runner 的 JRE 选择 Project JDK。
`pom.xml` 使用 Jackson 3.2.1：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.teamflow</groupId>
    <artifactId>json-contract-jdk25</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.release>25</maven.compiler.release>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>tools.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>3.2.1</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>exec-maven-plugin</artifactId>
                <version>3.5.0</version>
            </plugin>
        </plugins>
    </build>
</project>
```

等待 IDEA 完成 Maven Reload。打开 Project Structure，确认 Project SDK 显示 25；再打开 Maven Runner，
确认它没有指向 JDK 8。项目 SDK 决定源码可用的语言特性，Maven Runner JRE 决定 Maven 实际在哪个 JDK
上运行，两处不一致会产生“IDEA 能识别 record，但 Maven 不能编译”的现象。

### 2. 创建并运行现代版

在 `src/main/java/com/teamflow/contract` 下创建 `TeamFlowJsonDemo.java`：

```java
package com.teamflow.contract;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.json.JsonMapper;

/**
 * 读取并回写一份 TeamFlow 任务 JSON 数据。
 */
public class TeamFlowJsonDemo {
    /**
     * 映射任务快照并输出可观察的合同结果。
     *
     * @param args 启动参数，本示例不使用
     * @throws Exception JSON 无法映射时抛出异常
     */
    public static void main(String[] args) throws Exception {
        String json = """
                {
                  "id": "TASK-101",
                  "title": "整理课程合同",
                  "budget": 128.50,
                  "dueAt": "2026-08-20T18:00:00+08:00",
                  "archived": false,
                  "assignee": null,
                  "labels": ["java", "json"]
                }
                """;

        JsonMapper mapper = JsonMapper.builder()
                .enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                .build();
        TaskSnapshot task = mapper.readValue(json, TaskSnapshot.class);
        OffsetDateTime dueAt = OffsetDateTime.parse(task.dueAt());
        String encoded = mapper.writeValueAsString(task);

        System.out.println("任务编号：" + task.id());
        System.out.println("任务标题：" + task.title());
        System.out.println("预算：" + task.budget().toPlainString());
        System.out.println("截止时间偏移：" + dueAt.getOffset());
        System.out.println("已归档：" + task.archived());
        System.out.println("负责人为空：" + (task.assignee() == null));
        System.out.println("标签数量：" + task.labels().size());
        System.out.println("回写 JSON 包含任务编号：" + encoded.contains("TASK-101"));
    }

    /**
     * 描述本课固定的任务 JSON 数据合同。
     *
     * @param id 字符串任务编号
     * @param title 非空任务标题
     * @param budget 十进制预算
     * @param dueAt 带时区偏移的截止时间文本
     * @param archived 是否归档
     * @param assignee 可为空的负责人
     * @param labels 标签数组
     */
    public record TaskSnapshot(
            String id,
            String title,
            BigDecimal budget,
            String dueAt,
            boolean archived,
            String assignee,
            List<String> labels
    ) {
    }
}
```

点击 `main` 左侧运行图标，或在项目目录执行：

```shell
mvn -q compile exec:java -Dexec.mainClass=com.teamflow.contract.TeamFlowJsonDemo
```

### 3. 核对输出和执行过程

```text
任务编号：TASK-101
任务标题：整理课程合同
预算：128.50
截止时间偏移：+08:00
已归档：false
负责人为空：true
标签数量：2
回写 JSON 包含任务编号：true
```

程序先创建一份 JSON 字符串，再创建只配置一次的 `JsonMapper`。`readValue` 按 record 组件名和类型创建
`TaskSnapshot`；`OffsetDateTime.parse` 证明时间包含偏移；各行输出证明数字、布尔、null 和数组已经进入
对应 Java 字段。最后 `writeValueAsString` 把对象重新生成 JSON，`contains` 为 `true` 证明任务编号没有在
往返映射中丢失。

## 六、Java 8 完整程序

### 1. 切换项目 SDK 与依赖

为兼容项目单独选择已安装的 JDK 8：Project Structure 的 Project SDK 选 JDK 8，Language level 选 8；
Maven Runner 的 JRE 同样选 Project JDK。不要把 JDK 25 项目的 SDK 全局改掉来“模拟”兼容，两个项目应
分别配置。

Java 8 项目的完整 `pom.xml` 使用 Jackson 2：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.teamflow</groupId>
    <artifactId>json-contract-java8</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>2.12.7.1</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>exec-maven-plugin</artifactId>
                <version>3.5.0</version>
            </plugin>
        </plugins>
    </build>
</project>
```

### 2. 创建并运行兼容版

文件路径和类名仍是 `src/main/java/com/teamflow/contract/TeamFlowJsonDemo.java`：

```java
package com.teamflow.contract;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * 使用 Java 8 读取并回写一份 TeamFlow 任务 JSON 数据。
 */
public class TeamFlowJsonDemo {
    /**
     * 映射任务快照并输出可观察的合同结果。
     *
     * @param args 启动参数，本示例不使用
     * @throws Exception JSON 无法映射时抛出异常
     */
    public static void main(String[] args) throws Exception {
        String json = "{\n"
                + "  \"id\": \"TASK-101\",\n"
                + "  \"title\": \"整理课程合同\",\n"
                + "  \"budget\": 128.50,\n"
                + "  \"dueAt\": \"2026-08-20T18:00:00+08:00\",\n"
                + "  \"archived\": false,\n"
                + "  \"assignee\": null,\n"
                + "  \"labels\": [\"java\", \"json\"]\n"
                + "}";

        ObjectMapper mapper = new ObjectMapper();
        mapper.enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        TaskSnapshot task = mapper.readValue(json, TaskSnapshot.class);
        OffsetDateTime dueAt = OffsetDateTime.parse(task.dueAt);
        String encoded = mapper.writeValueAsString(task);

        System.out.println("任务编号：" + task.id);
        System.out.println("任务标题：" + task.title);
        System.out.println("预算：" + task.budget.toPlainString());
        System.out.println("截止时间偏移：" + dueAt.getOffset());
        System.out.println("已归档：" + task.archived);
        System.out.println("负责人为空：" + (task.assignee == null));
        System.out.println("标签数量：" + task.labels.size());
        System.out.println("回写 JSON 包含任务编号：" + encoded.contains("TASK-101"));
    }

    /**
     * 描述 Java 8 版本的固定任务 JSON 数据合同。
     */
    public static final class TaskSnapshot {
        @JsonProperty("id")
        private final String id;
        @JsonProperty("title")
        private final String title;
        @JsonProperty("budget")
        private final BigDecimal budget;
        @JsonProperty("dueAt")
        private final String dueAt;
        @JsonProperty("archived")
        private final boolean archived;
        @JsonProperty("assignee")
        private final String assignee;
        @JsonProperty("labels")
        private final List<String> labels;

        /**
         * 创建一份不可变任务快照。
         *
         * @param id 字符串任务编号
         * @param title 非空任务标题
         * @param budget 十进制预算
         * @param dueAt 带时区偏移的截止时间文本
         * @param archived 是否归档
         * @param assignee 可为空的负责人
         * @param labels 标签数组
         */
        @JsonCreator
        public TaskSnapshot(
                @JsonProperty("id") String id,
                @JsonProperty("title") String title,
                @JsonProperty("budget") BigDecimal budget,
                @JsonProperty("dueAt") String dueAt,
                @JsonProperty("archived") boolean archived,
                @JsonProperty("assignee") String assignee,
                @JsonProperty("labels") List<String> labels
        ) {
            this.id = id;
            this.title = title;
            this.budget = budget;
            this.dueAt = dueAt;
            this.archived = archived;
            this.assignee = assignee;
            this.labels = labels;
        }
    }
}
```

Maven Reload 完成后，使用 `main` 左侧运行图标，或执行：

```shell
mvn -q compile exec:java -Dexec.mainClass=com.teamflow.contract.TeamFlowJsonDemo
```

### 3. 核对兼容结果

Java 8 版预期输出与 JDK 25 版逐行相同。相同输出证明数据合同没有因为语言版本改变：ID 仍是字符串，预算
仍是 `BigDecimal`，时间仍要求偏移，未知字段仍会失败。

Java 8 不能使用 record 和文本块，所以普通类代码更长；Jackson 2 的坐标以 `com.fasterxml.jackson` 开头，
类是 `ObjectMapper`。不要只把 `record` 改成 `class`，却继续使用 `tools.jackson` 包，否则 JDK 8 无法使用
Jackson 3。

## 七、独立练习

### 1. 任务与验收

:::exercise
### 建立项目摘要 JSON 合同

**要求：** 创建 `ProjectSummaryJsonDemo`，读取项目编号 `PRJ-7`、项目名“课程改版”、任务总数 12、已完成
5、启用状态 true、负责人 null 和两个里程碑。项目编号使用字符串，里程碑使用字符串数组；开启未知字段
失败，计算剩余任务，再把项目对象写回 JSON。JDK 25 使用 record 和 Jackson 3；Java 8 使用普通不可变类和
Jackson 2。

**验收：** 两个版本都能完整编译运行；输出项目编号、名称、剩余任务 7、启用状态 true、负责人为空 true、
里程碑数量 2，并证明回写 JSON 包含 `PRJ-7`。把 `name` 拼成 `projectName` 后，两个版本都应因未知字段
失败。

**参考答案：** 两个版本的完整参考实现见后文；先独立写字段合同和程序，再对照类形状、mapper 配置与输出。
:::

### 2. JDK 25 参考实现

```java
package com.teamflow.contract;

import java.util.List;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.json.JsonMapper;

/**
 * 读取并回写一份 TeamFlow 项目摘要 JSON 数据。
 */
public class ProjectSummaryJsonDemo {
    /**
     * 映射项目摘要并输出练习验收结果。
     *
     * @param args 启动参数，本示例不使用
     * @throws Exception JSON 无法映射时抛出异常
     */
    public static void main(String[] args) throws Exception {
        String json = """
                {
                  "projectId": "PRJ-7",
                  "name": "课程改版",
                  "totalTasks": 12,
                  "completedTasks": 5,
                  "active": true,
                  "owner": null,
                  "milestones": ["基础课", "Web 课"]
                }
                """;

        JsonMapper mapper = JsonMapper.builder()
                .enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                .build();
        ProjectSummary project = mapper.readValue(json, ProjectSummary.class);
        int remainingTasks = project.totalTasks() - project.completedTasks();
        String encoded = mapper.writeValueAsString(project);

        System.out.println("项目编号：" + project.projectId());
        System.out.println("项目名称：" + project.name());
        System.out.println("剩余任务：" + remainingTasks);
        System.out.println("项目启用：" + project.active());
        System.out.println("负责人为空：" + (project.owner() == null));
        System.out.println("里程碑数量：" + project.milestones().size());
        System.out.println("回写 JSON 包含项目编号：" + encoded.contains("PRJ-7"));
    }

    /**
     * 描述本课练习使用的项目摘要 JSON 数据合同。
     *
     * @param projectId 字符串项目编号
     * @param name 项目名称
     * @param totalTasks 任务总数
     * @param completedTasks 已完成任务数
     * @param active 项目是否启用
     * @param owner 可为空的负责人
     * @param milestones 里程碑数组
     */
    public record ProjectSummary(
            String projectId,
            String name,
            int totalTasks,
            int completedTasks,
            boolean active,
            String owner,
            List<String> milestones
    ) {
    }
}
```

使用现代版 POM，运行：

```shell
mvn -q compile exec:java -Dexec.mainClass=com.teamflow.contract.ProjectSummaryJsonDemo
```

### 3. Java 8 参考实现

```java
package com.teamflow.contract;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;

/**
 * 使用 Java 8 读取并回写一份 TeamFlow 项目摘要 JSON 数据。
 */
public class ProjectSummaryJsonDemo {
    /**
     * 映射项目摘要并输出练习验收结果。
     *
     * @param args 启动参数，本示例不使用
     * @throws Exception JSON 无法映射时抛出异常
     */
    public static void main(String[] args) throws Exception {
        String json = "{\n"
                + "  \"projectId\": \"PRJ-7\",\n"
                + "  \"name\": \"课程改版\",\n"
                + "  \"totalTasks\": 12,\n"
                + "  \"completedTasks\": 5,\n"
                + "  \"active\": true,\n"
                + "  \"owner\": null,\n"
                + "  \"milestones\": [\"基础课\", \"Web 课\"]\n"
                + "}";

        ObjectMapper mapper = new ObjectMapper();
        mapper.enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        ProjectSummary project = mapper.readValue(json, ProjectSummary.class);
        int remainingTasks = project.totalTasks - project.completedTasks;
        String encoded = mapper.writeValueAsString(project);

        System.out.println("项目编号：" + project.projectId);
        System.out.println("项目名称：" + project.name);
        System.out.println("剩余任务：" + remainingTasks);
        System.out.println("项目启用：" + project.active);
        System.out.println("负责人为空：" + (project.owner == null));
        System.out.println("里程碑数量：" + project.milestones.size());
        System.out.println("回写 JSON 包含项目编号：" + encoded.contains("PRJ-7"));
    }

    /**
     * 描述 Java 8 练习使用的项目摘要 JSON 数据合同。
     */
    public static final class ProjectSummary {
        @JsonProperty("projectId")
        private final String projectId;
        @JsonProperty("name")
        private final String name;
        @JsonProperty("totalTasks")
        private final int totalTasks;
        @JsonProperty("completedTasks")
        private final int completedTasks;
        @JsonProperty("active")
        private final boolean active;
        @JsonProperty("owner")
        private final String owner;
        @JsonProperty("milestones")
        private final List<String> milestones;

        /**
         * 创建一份不可变项目摘要。
         *
         * @param projectId 字符串项目编号
         * @param name 项目名称
         * @param totalTasks 任务总数
         * @param completedTasks 已完成任务数
         * @param active 项目是否启用
         * @param owner 可为空的负责人
         * @param milestones 里程碑数组
         */
        @JsonCreator
        public ProjectSummary(
                @JsonProperty("projectId") String projectId,
                @JsonProperty("name") String name,
                @JsonProperty("totalTasks") int totalTasks,
                @JsonProperty("completedTasks") int completedTasks,
                @JsonProperty("active") boolean active,
                @JsonProperty("owner") String owner,
                @JsonProperty("milestones") List<String> milestones
        ) {
            this.projectId = projectId;
            this.name = name;
            this.totalTasks = totalTasks;
            this.completedTasks = completedTasks;
            this.active = active;
            this.owner = owner;
            this.milestones = milestones;
        }
    }
}
```

使用 Java 8 版 POM，以同样的 main class 命令运行。两个版本的预期输出都是：

```text
项目编号：PRJ-7
项目名称：课程改版
剩余任务：7
项目启用：true
负责人为空：true
里程碑数量：2
回写 JSON 包含项目编号：true
```

### 4. 完成后的合同自检

独立完成后再回答：

1. 为什么 `projectId` 使用 JSON 字符串，而任务数量使用数字？
2. `owner` 缺失、为 `null`、为空字符串时，各自表达什么？
3. 为什么 `milestones` 没有元素时应写 `[]`，而不是 `null`？
4. 把 `projectName` 当成新增字段忽略，会掩盖什么问题？
5. Java 8 版为什么不能继续使用 record、文本块和 `tools.jackson` 包？

能够在修改样本后仍逐字段解释映射结果，才说明你掌握的是数据合同，而不是只记住一次运行输出。
