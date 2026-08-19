---
id: backend.java.learn.basics.task-api-design-project
type: lesson
title: 实战：任务 API 设计
summary: 把 HTTP、REST 资源和 JSON 数据合同组合成一份可核对的 TeamFlow 任务 API 设计
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 150
prerequisites:
  - backend.java.learn.intermediate.json-and-data-contracts
objectives:
  - 能把任务需求拆成 method、URI、请求 JSON、成功状态、响应字段和响应 JSON。
  - 能为列表、成员查询、创建、完整替换和删除形成一致的最小任务 API。
  - 能把创建请求、替换请求和任务响应设计为职责不同的数据对象。
  - 能为资源创建返回 201、Location 和新资源表示，为删除成功返回不带正文的 204。
  - 能让空任务列表稳定返回 JSON 空数组，并保持成员字段名在各端点一致。
  - 能用 Jackson 在不启动服务器的情况下核对固定请求与响应样本。
  - 能运行 JDK 25 / Jackson 3.2.1 与 Java 8 / Jackson 2.12.7.1 的完整合同演示。
recap:
  - 一条可执行核对的 API 合同至少同时固定 method、URI、请求、状态、关键响应头和响应表示。
  - TeamFlow 最小任务 API 使用集合 URI /tasks 和成员 URI /tasks/{taskId}，由 HTTP 方法表达意图。
  - 创建请求不接收服务端生成的 id 和默认 status；任务响应可以包含这些服务端事实。
  - 创建成功使用 201 Created，Location 指向新成员，同时可以返回该任务的 JSON 表示。
  - 列表没有元素时返回 []；204 No Content 成功响应不携带 JSON 正文。
  - 本课的 Java 程序核对合同样本，不是 HTTP 服务器，也不替代后续的统一响应与 Spring Boot 实现。
  - JDK 25 使用 record、文本块和 List.of，Java 8 使用普通不可变类、字符串拼接和 Collections.singletonList。
related:
  - backend.java.learn.intermediate.http-uri-and-request-response-basics
  - backend.java.learn.intermediate.transactions-and-idempotency
  - backend.java.learn.intermediate.json-and-data-contracts
tags:
  - Java
  - HTTP
  - REST
  - JSON
  - API 设计
  - TeamFlow
appliesTo: JDK 25 与 Jackson 3.2.1 主线；Java 8 与 Jackson 2.12.7.1 兼容写法；HTTP 语义按 RFC 9110 与 RFC 9112
verifiedAt: 2026-08-18
sources:
  - id: rfc9110-task-api-semantics
    title: RFC 9110 - HTTP Semantics
    url: https://www.rfc-editor.org/rfc/rfc9110.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: HTTP semantics
    claims:
      - GET、POST、PUT、DELETE 的方法语义
      - 200、201、204 的最低含义
      - POST 创建资源时使用 201，并可通过 Location 指向新资源
  - id: rfc9112-no-content-body
    title: RFC 9112 - HTTP/1.1
    url: https://www.rfc-editor.org/rfc/rfc9112.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: HTTP/1.1 message framing
    claims:
      - 204 响应不能包含消息体或 trailer
  - id: rfc8259-task-json
    title: RFC 8259 - The JavaScript Object Notation (JSON) Data Interchange Format
    url: https://www.rfc-editor.org/rfc/rfc8259.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: JSON
    claims:
      - JSON 对象由名称和值组成，数组保持元素顺序
      - API 样本中的对象、数组、字符串、布尔和 null 语法
  - id: jackson32-task-contract
    title: Jackson Databind 3.2.1 README
    url: https://github.com/FasterXML/jackson-databind/blob/jackson-databind-3.2.1/README.md
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Jackson Databind 3.2.1
    claims:
      - tools.jackson.core Maven 坐标
      - readValue 与 writeValueAsString 的对象映射方向
  - id: jackson212-task-contract
    title: Jackson Databind 2.12.7.1 README
    url: https://github.com/FasterXML/jackson-databind/blob/jackson-databind-2.12.7.1/README.md
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Jackson Databind 2.12.7.1
    claims:
      - com.fasterxml.jackson.core Maven 坐标
      - Java 8 普通类的 readValue 与 writeValueAsString 用法
  - id: jls25-task-api-records
    title: Java Language Specification 25 - Record Classes
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.10
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - record 适合声明固定数据载体并提供组件访问器
  - id: jep395-task-api-records
    title: JEP 395 - Records
    url: https://openjdk.org/jeps/395
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: JDK 16 and later
    claims:
      - record 在 JDK 16 正式交付，因此 JDK 25 可用而 Java 8 不支持
  - id: java25-list-of
    title: Java SE 25 API - List.of
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - List.of() 与 List.of(E) 分别创建空的、单元素的不可修改列表，并自 Java 9 提供
  - id: java8-collections-singleton-list
    title: Java Platform SE 8 API - Collections list factories
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Collections.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Collections.emptyList 与 Collections.singletonList 在 Java 8 中创建空的、单元素的不可修改列表
  - id: community-created-response-confusion
    title: Stack Overflow - Create request with POST, which response codes 200 or 201 and content
    url: https://stackoverflow.com/questions/1860645/create-request-with-post-which-response-codes-200-or-201-and-content
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: HTTP resource creation discussion；技术结论已按 RFC 9110 核验
    claims:
      - 创建响应带 JSON 正文时应该使用 200 还是 201 是实际开发中的常见疑问
---

# 实战：任务 API 设计

TeamFlow 已经分别确定了 HTTP 消息结构、任务资源 URI 和单个任务的 JSON 字段合同。现在需要把三份成果
放到同一张设计表里：客户端向哪里发送什么请求，服务端成功后返回哪个状态，创建后的任务在哪里，以及
响应 JSON 是否仍使用同一组字段名。

本课完成的是一份能用 Java 程序核对的任务 API 合同，不会启动端口，也不会编写 Controller。统一响应包、
业务错误码、字段校验详情、分页、追踪标识和 Spring Boot 实现都有各自的后续课程，本课只把最小成功路径
与必要失败边界连接起来。

## 一、把三个局部决定合成一条合同

### 1. method 和 URI 只回答请求目标与意图

`POST /tasks` 表示让任务集合处理一份创建请求，`GET /tasks/TASK-104` 表示读取一个已知任务。它们还没有
说明请求体有哪些字段、成功状态是什么、响应是否有正文。因此“有一条路由”不等于“API 已经设计完成”。

本课把每条操作写成六个可以逐项核对的部分：

1. 用户要完成的场景；
2. HTTP method；
3. 资源 URI；
4. 请求 JSON；
5. 成功状态和关键响应头；
6. 响应 JSON。

任何一项单独改变，都可能让客户端与服务端理解不同。例如 URI 仍是 `/tasks`，但请求字段从 `title` 改成
`taskTitle`，这已经是数据合同变化，不是“路径没变所以接口没变”。

### 2. 请求和响应是同一次往返的两个方向

创建任务时，客户端发送自己知道的事实：标题、截止时间和负责人。任务 ID 由服务端生成，初始状态由
服务端决定，所以它们只出现在成功响应中：

```http
POST /tasks HTTP/1.1
Content-Type: application/json

{"title":"整理课程合同","dueAt":"2026-08-22T18:00:00+08:00","assignee":"lin"}
```

```http
HTTP/1.1 201 Created
Location: /tasks/TASK-104
Content-Type: application/json

{"id":"TASK-104","title":"整理课程合同","status":"TODO","dueAt":"2026-08-22T18:00:00+08:00","assignee":"lin"}
```

响应不是把请求原样退回。它增加了服务端生成的 `id` 和确定的 `status`，`Location` 则给出新成员的 URI。
调用方可以把响应 JSON 当作新任务的当前表示，也可以按 `Location` 再次读取它。

### 3. 设计表必须能够读出完整往返

TeamFlow 本课固定以下最小成功合同：

| 场景 | method 与 URI | 请求 JSON | 成功结果 |
| --- | --- | --- | --- |
| 按状态列出任务 | `GET /tasks?status=TODO` | 无 | `200` + 任务数组 |
| 读取一个任务 | `GET /tasks/{taskId}` | 无 | `200` + 任务对象 |
| 创建任务 | `POST /tasks` | `CreateTaskRequest` | `201` + `Location` + 任务对象 |
| 完整替换任务 | `PUT /tasks/{taskId}` | `ReplaceTaskRequest` | `200` + 替换后的任务对象 |
| 删除任务 | `DELETE /tasks/{taskId}` | 无 | `204`，无正文 |

表中的 `{taskId}` 是占位符，不是实际请求中的大括号。请求任务 `TASK-104` 时应使用
`/tasks/TASK-104`。列表筛选继续使用 query，不把 `TODO` 伪装成成员层级。

## 二、固定每条任务操作的成功结果

### 1. 列表和成员查询都使用 GET

列表返回 JSON 数组，成员返回 JSON 对象：

```json
[
  {
    "id": "TASK-104",
    "title": "整理课程合同",
    "status": "TODO",
    "dueAt": "2026-08-22T18:00:00+08:00",
    "assignee": "lin"
  }
]
```

```json
{
  "id": "TASK-104",
  "title": "整理课程合同",
  "status": "TODO",
  "dueAt": "2026-08-22T18:00:00+08:00",
  "assignee": "lin"
}
```

两条响应中的任务对象字段必须一致。客户端不应因为从列表进入详情，就把 `id` 改读成 `taskId`。当筛选
没有命中任何任务时，列表仍是数组，只是元素数量为零：

```json
[]
```

`[]` 表示“查询成功，当前没有结果”。`null` 表示整个值为空，`{}` 表示一个没有字段的对象，它们都不是
空任务集合。

### 2. 创建成功使用 201 和 Location

RFC 9110 规定，POST 成功创建一个或多个资源时，应发送 `201 Created`，并通过 `Location` 标识主要新资源。
`201` 的响应正文通常描述并链接已创建资源，因此“返回任务 JSON”并不会把状态强制变成 `200`。

创建合同同时提供三份证据：

- `201 Created` 说明这次请求产生了新资源；
- `Location: /tasks/TASK-104` 说明主要新资源的 URI；
- 响应 JSON 给出该资源当前可见的字段。

**社区补充：** Stack Overflow 的真实问答集中讨论“创建后返回对象时应使用 200 还是 201”，说明正文与状态
的关系很容易被混淆。社区答案用于发现这个教学难点；本课最终以 RFC 9110 为准：是否创建资源决定是否使用
`201`，有无响应正文不是二选一条件。

### 3. PUT 替换的是已知成员

客户端已经知道 `TASK-104`，所以把完整可编辑状态发送到成员 URI：

```http
PUT /tasks/TASK-104 HTTP/1.1
Content-Type: application/json

{"title":"整理课程合同","status":"DONE","dueAt":"2026-08-22T18:00:00+08:00","assignee":"lin"}
```

本课的 `ReplaceTaskRequest` 不包含 `id`。成员身份已经由 URI 确定，省略 body 中的重复 ID 可以避免
`/tasks/TASK-104` 与 `{"id":"TASK-999"}` 相互冲突。成功后返回 `200 OK` 和替换后的任务对象，让程序能
直接观察 `status` 已变为 `DONE`。

PUT 的完整替换语义不等于只改一个字段。本课为了覆盖前置课已学的 PUT，要求客户端发送全部可编辑字段；
部分更新需要单独定义语义，不在这个最小合同中引入。

### 4. DELETE 成功后用 204 结束

```http
DELETE /tasks/TASK-104 HTTP/1.1
```

成功结果为：

```http
HTTP/1.1 204 No Content
```

`204 No Content` 表示操作已经成功，且没有额外响应内容。RFC 9110 和 RFC 9112 都明确 204 在字段区结束，
不能再附加 JSON 正文。若产品希望返回删除后的任务表示，应重新选择允许正文的成功状态并写进合同，不能
保留 204 又偷偷发送 `{}`。

## 三、让三个数据对象各守一条边界

### 1. 创建请求只保存调用方可决定的字段

```java
public record CreateTaskRequest(String title, String dueAt, String assignee) {}
```

创建请求没有 `id` 和 `status`。这不是因为两个字段不重要，而是因为当前合同把它们交给服务端决定。调用方
若擅自发送 `id`，完整程序启用的未知字段失败会拒绝这份输入，避免看似接收却实际忽略。

### 2. 替换请求包含全部可编辑状态

```java
public record ReplaceTaskRequest(
        String title,
        TaskStatus status,
        String dueAt,
        String assignee
) {}
```

`status` 使用枚举承接 JSON 字符串 `TODO` 或 `DONE`。请求仍不包含 ID；URI 已经确定被替换的任务。
标题非空、截止时间范围、负责人是否存在属于字段校验和业务规则，本课只固定形状，不提前实现校验框架。

### 3. 响应保存调用方需要看到的资源表示

```java
public record TaskResponse(
        String id,
        String title,
        TaskStatus status,
        String dueAt,
        String assignee
) {}
```

同一个 `TaskResponse` 可以作为成员响应，也可以成为列表数组中的元素。创建、替换和查询都沿用相同字段名，
减少“同一个任务在不同端点长得不一样”的合同漂移。它仍不是数据库实体；本课没有数据库，也没有让客户端
看到内部字段。

### 4. 失败状态只固定最低边界

非法 JSON 或无法映射的请求至少属于 `400 Bad Request` 边界，找不到 `/tasks/TASK-999` 至少属于
`404 Not Found` 边界。本课只记录 status，不设计错误 JSON：

| 失败场景 | 本课固定的结果 | 留待后续统一的内容 |
| --- | --- | --- |
| 请求 JSON 语法错误或字段形状不匹配 | `400 Bad Request` | 错误码、字段详情、消息结构 |
| 目标任务不存在 | `404 Not Found` | 业务错误码、追踪标识、错误正文 |

这样既能让 API 表覆盖失败路径，又不会在统一 API 契约形成前制造一套临时错误包。

## 四、用无服务器程序核对设计

### 1. 程序模拟的是边界，不是网络

完整程序执行以下数据流：

```text
创建请求 JSON
-> Jackson 读取 CreateTaskRequest
-> 程序模拟服务端分配 TASK-104 和 TODO
-> Jackson 写出 TaskResponse
-> 同一 TaskResponse 用于查询和列表样本
-> ReplaceTaskRequest 生成 DONE 响应
-> DELETE 样本确认 204 的正文长度为 0
```

程序不会监听端口，也没有真正收发 HTTP 报文。method、URI、status 和 `Location` 是被核对的合同数据；
Jackson 只负责证明请求和响应 JSON 能按上一课的固定对象映射方式生成。

### 2. 每行输出都对应设计表的一列

运行结果必须同时出现 `POST /tasks`、`201 Created`、`Location: /tasks/TASK-104` 和带 `id` 的响应 JSON。
只看到“JSON 生成成功”仍不足以证明创建合同，因为状态或新资源位置可能遗漏。

列表输出必须以 `[` 开头，成员输出必须以 `{` 开头；替换响应中 `status` 必须是 `DONE`；删除输出必须
显示正文 UTF-8 字节数为 0。这里计算字节数只是形成可观察结果，不手工构造 HTTP `Content-Length`。

### 3. 两个 Java 版本保持同一外部合同

JDK 25 版使用 record、文本块和 `List.of`。Java 8 没有 record 和文本块，也没有 Java 9 才加入的
`List.of`，所以兼容版使用普通不可变类、字符串拼接和 `Collections.singletonList`。这些是实现差异，不能
改变 method、URI、JSON 字段、状态或输出顺序。

## 五、常见错误

### 七个典型合同错误

:::pitfalls
### 让创建请求携带服务端字段

**触发条件：** 客户端把响应样本原样当作创建请求，主动发送 `id` 和默认 `status`。

**原因：** 创建请求与资源响应共用了一个字段集合，没有区分谁负责产生业务事实。

**后果：** 服务端要么静默忽略字段，要么接受调用方伪造 ID 或初始状态，合同含义变得不确定。

**错误示例：**

```json
{"id":"TASK-999","title":"整理课程合同","status":"DONE","dueAt":"2026-08-22T18:00:00+08:00","assignee":"lin"}
```

**正确写法：**

```json
{"title":"整理课程合同","dueAt":"2026-08-22T18:00:00+08:00","assignee":"lin"}
```

**验证方式：** 使用完整程序的严格 mapper 读取两份输入；正确输入映射为 `CreateTaskRequest`，错误输入因
`id` 和 `status` 是未知字段而失败。

### 把创建动作重复写进 URI

**触发条件：** 已经使用 POST，又把路径写成 `/tasks/create`。

**原因：** 把函数调用命名习惯带进资源 URI，忽略 POST 已经表达“让集合处理创建内容”的意图。

**后果：** 同一资源逐渐出现 `/getTask`、`/createTask`、`/deleteTask` 等平行动作路径，前置课形成的资源
标识失去一致性。

**错误示例：**

```http
POST /tasks/create HTTP/1.1
```

**正确写法：**

```http
POST /tasks HTTP/1.1
```

**验证方式：** 核对 API 设计表；创建、列表都以 `/tasks` 表示同一个集合，只由 method 区分意图。

### 创建成功返回 200 且遗漏 Location

**触发条件：** 新任务已经创建，因为响应带 JSON 就统一返回 `200 OK`。

**原因：** 把正文是否存在误当成选择 200 或 201 的条件，没有按请求实际结果选择状态。

**后果：** 调用方无法从状态直接确认创建事实，也缺少一个明确的新资源 URI。

**错误示例：**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"id":"TASK-104"}
```

**正确写法：**

```http
HTTP/1.1 201 Created
Location: /tasks/TASK-104
Content-Type: application/json

{"id":"TASK-104"}
```

**验证方式：** 运行完整程序，创建响应必须同时包含 `201 Created`、正确的 `Location` 和任务 JSON；再按
RFC 9110 的 POST、201 与 Location 章节逐项核对。

### 空列表返回 null 或空对象

**触发条件：** 查询没有命中任务时，服务端把没有结果写成 `null` 或 `{}`。

**原因：** 把“集合中没有元素”与“整个值不存在”混为一谈。

**后果：** 客户端必须为同一个列表端点处理数组、null 和对象三种互不相容的顶层类型。

**错误示例：**

```json
null
```

**正确写法：**

```json
[]
```

**验证方式：** 用 Jackson 分别读取为 `List<TaskResponse>`；`[]` 得到大小为 0 的列表，`null` 得到空引用，
两者后续调用 `size()` 的行为不同。

### 同一字段在列表和详情中改名

**触发条件：** 列表元素使用 `taskId`，成员详情却使用 `id`。

**原因：** 两个端点各自设计响应，没有复用同一个任务表示合同。

**后果：** 客户端需要为同一业务事实维护两套读取逻辑，字段重构也容易漏改一处。

**错误示例：**

```json
[{"taskId":"TASK-104","title":"整理课程合同"}]
```

**正确写法：**

```json
[{"id":"TASK-104","title":"整理课程合同"}]
```

**验证方式：** 比较完整程序的列表元素与成员响应；两者都由同一个 `TaskResponse` 生成，字段名必须一致。

### 给 204 响应追加 JSON

**触发条件：** 删除成功后先选择 `204 No Content`，又为了“格式统一”追加 `{}` 或成功消息。

**原因：** 只把 204 当成普通成功数字，没有遵守它不能包含消息体的报文合同。

**后果：** 响应违反 HTTP 消息语义，客户端或中间件可能忽略正文，也可能出现解析边界问题。

**错误示例：**

```http
HTTP/1.1 204 No Content
Content-Type: application/json

{}
```

**正确写法：**

```http
HTTP/1.1 204 No Content
```

**验证方式：** 完整程序把删除响应正文设为空字符串，并按 UTF-8 计算字节数；结果必须为 0，再对照
RFC 9112 的消息体长度规则。

### 在 Java 8 项目中直接复制 record

**触发条件：** 把 JDK 25 的 `CreateTaskRequest` record 原样放进 Java 8 项目。

**原因：** record 在 JDK 16 才正式交付，Java 8 编译器不认识 record 声明。

**后果：** 兼容工程在解析源码阶段失败，尚未执行任何 JSON 合同代码。

**错误示例：**

```java
public record CreateTaskRequest(String title) {}
```

**正确写法：**

```java
public final class CreateTaskRequest {
    private final String title;

    /**
     * 创建 Java 8 版本的任务创建请求。
     *
     * @param title 任务标题
     */
    public CreateTaskRequest(String title) {
        this.title = title;
    }
}
```

**验证方式：** 分别使用 `javac 25` 和 `javac 8` 编译错误示例，前者成功、后者失败；Java 8 正确类应成功
编译。外部 API 的 method、URI 和 JSON 字段不因类写法改变。
:::

## 六、JDK 25 完整程序

### 1. 准备现代版 Maven 项目

在 IDEA 中创建独立 Maven 项目，Project SDK 选择 JDK 25，Maven Runner 的 JRE 选择 Project JDK。
`pom.xml` 使用 Jackson 3.2.1：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.teamflow</groupId>
    <artifactId>task-api-design-jdk25</artifactId>
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

Maven Reload 后确认 Project SDK、Module SDK 和 Maven Runner JRE 都指向 25。三处不一致时，IDEA 可能
能识别 record，但 Maven 仍使用旧 JDK 编译。

### 2. 创建现代版合同演示

在 `src/main/java/com/teamflow/api` 下创建 `TeamFlowTaskApiDesign.java`：

```java
package com.teamflow.api;

import java.nio.charset.StandardCharsets;
import java.util.List;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.json.JsonMapper;

/**
 * 串联并输出 TeamFlow 最小任务 API 的成功合同。
 */
public final class TeamFlowTaskApiDesign {
    /**
     * 读取创建与替换请求，并生成可核对的任务响应样本。
     *
     * @param args 启动参数，本示例不使用
     * @throws Exception JSON 无法映射时抛出异常
     */
    public static void main(String[] args) throws Exception {
        JsonMapper mapper = JsonMapper.builder()
                .enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                .build();

        String createJson = """
                {"title":"整理课程合同","dueAt":"2026-08-22T18:00:00+08:00","assignee":"lin"}
                """;
        CreateTaskRequest createRequest = mapper.readValue(
                createJson,
                CreateTaskRequest.class
        );
        TaskResponse createdTask = new TaskResponse(
                "TASK-104",
                createRequest.title(),
                TaskStatus.TODO,
                createRequest.dueAt(),
                createRequest.assignee()
        );
        String createdJson = mapper.writeValueAsString(createdTask);

        System.out.println("创建请求：POST /tasks");
        System.out.println("创建请求 JSON：" + mapper.writeValueAsString(createRequest));
        System.out.println("创建响应：201 Created");
        System.out.println("Location：/tasks/TASK-104");
        System.out.println("创建响应 JSON：" + createdJson);

        System.out.println("查询请求：GET /tasks/TASK-104");
        System.out.println("查询响应：200 OK");
        System.out.println("查询响应 JSON：" + createdJson);

        List<TaskResponse> tasks = List.of(createdTask);
        System.out.println("列表请求：GET /tasks?status=TODO");
        System.out.println("列表响应：200 OK");
        System.out.println("列表响应 JSON：" + mapper.writeValueAsString(tasks));

        List<TaskResponse> emptyTasks = List.of();
        System.out.println("空列表请求：GET /tasks?status=DONE");
        System.out.println("空列表响应：200 OK");
        System.out.println("空列表响应 JSON：" + mapper.writeValueAsString(emptyTasks));

        String replaceJson = """
                {"title":"整理课程合同","status":"DONE","dueAt":"2026-08-22T18:00:00+08:00","assignee":"lin"}
                """;
        ReplaceTaskRequest replaceRequest = mapper.readValue(
                replaceJson,
                ReplaceTaskRequest.class
        );
        TaskResponse replacedTask = new TaskResponse(
                "TASK-104",
                replaceRequest.title(),
                replaceRequest.status(),
                replaceRequest.dueAt(),
                replaceRequest.assignee()
        );

        System.out.println("替换请求：PUT /tasks/TASK-104");
        System.out.println("替换请求 JSON：" + mapper.writeValueAsString(replaceRequest));
        System.out.println("替换响应：200 OK");
        System.out.println("替换响应 JSON：" + mapper.writeValueAsString(replacedTask));

        String deleteBody = "";
        System.out.println("删除请求：DELETE /tasks/TASK-104");
        System.out.println("删除响应：204 No Content");
        System.out.println(
                "删除响应体 UTF-8 字节数："
                        + deleteBody.getBytes(StandardCharsets.UTF_8).length
        );
    }

    /**
     * 保存客户端创建任务时能够决定的字段。
     *
     * @param title 任务标题
     * @param dueAt 带偏移的截止时间
     * @param assignee 可为空的负责人
     */
    public record CreateTaskRequest(String title, String dueAt, String assignee) {
    }

    /**
     * 保存完整替换任务时需要提交的可编辑字段。
     *
     * @param title 任务标题
     * @param status 任务状态
     * @param dueAt 带偏移的截止时间
     * @param assignee 可为空的负责人
     */
    public record ReplaceTaskRequest(
            String title,
            TaskStatus status,
            String dueAt,
            String assignee
    ) {
    }

    /**
     * 保存任务 API 对调用方公开的任务表示。
     *
     * @param id 服务端生成的任务编号
     * @param title 任务标题
     * @param status 任务状态
     * @param dueAt 带偏移的截止时间
     * @param assignee 可为空的负责人
     */
    public record TaskResponse(
            String id,
            String title,
            TaskStatus status,
            String dueAt,
            String assignee
    ) {
    }

    /**
     * 描述本课任务 API 使用的有限状态。
     */
    public enum TaskStatus {
        TODO,
        DONE
    }
}
```

点击 `main` 左侧运行图标，或在项目目录执行：

```shell
mvn -q compile exec:java -Dexec.mainClass=com.teamflow.api.TeamFlowTaskApiDesign
```

### 3. 核对现代版输出

```text
创建请求：POST /tasks
创建请求 JSON：{"title":"整理课程合同","dueAt":"2026-08-22T18:00:00+08:00","assignee":"lin"}
创建响应：201 Created
Location：/tasks/TASK-104
创建响应 JSON：{"id":"TASK-104","title":"整理课程合同","status":"TODO","dueAt":"2026-08-22T18:00:00+08:00","assignee":"lin"}
查询请求：GET /tasks/TASK-104
查询响应：200 OK
查询响应 JSON：{"id":"TASK-104","title":"整理课程合同","status":"TODO","dueAt":"2026-08-22T18:00:00+08:00","assignee":"lin"}
列表请求：GET /tasks?status=TODO
列表响应：200 OK
列表响应 JSON：[{"id":"TASK-104","title":"整理课程合同","status":"TODO","dueAt":"2026-08-22T18:00:00+08:00","assignee":"lin"}]
空列表请求：GET /tasks?status=DONE
空列表响应：200 OK
空列表响应 JSON：[]
替换请求：PUT /tasks/TASK-104
替换请求 JSON：{"title":"整理课程合同","status":"DONE","dueAt":"2026-08-22T18:00:00+08:00","assignee":"lin"}
替换响应：200 OK
替换响应 JSON：{"id":"TASK-104","title":"整理课程合同","status":"DONE","dueAt":"2026-08-22T18:00:00+08:00","assignee":"lin"}
删除请求：DELETE /tasks/TASK-104
删除响应：204 No Content
删除响应体 UTF-8 字节数：0
```

创建请求先映射为不含 ID 和状态的 record，程序再模拟服务端补充 `TASK-104` 与 `TODO`。同一个
`TaskResponse` 生成创建、查询和列表 JSON，因此字段名不会在三个端点之间漂移。第二次列表查询发生在
替换前，此时没有 `DONE` 任务；`List.of()` 被 Jackson 实际序列化为 `[]`，证明空集合仍保持数组形状。
替换请求随后把完整可编辑状态变为 `DONE`；最后的 0 证明 204 样本没有偷偷附加正文。

## 七、Java 8 完整程序

### 1. 准备兼容版 Maven 项目

兼容项目单独选择已安装的 JDK 8：Project SDK、Module SDK、Language level 和 Maven Runner JRE 都使用
Java 8。不要只把 JDK 25 项目的 Language level 改成 8；Maven 实际 JRE 和依赖包名也需要一起切换。

Java 8 版完整 `pom.xml` 为：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.teamflow</groupId>
    <artifactId>task-api-design-java8</artifactId>
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

### 2. 创建完整兼容代码

文件路径和 main class 与现代版保持一致：
`src/main/java/com/teamflow/api/TeamFlowTaskApiDesign.java`。

```java
package com.teamflow.api;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;

/**
 * 使用 Java 8 串联并输出 TeamFlow 最小任务 API 的成功合同。
 */
public final class TeamFlowTaskApiDesign {
    /**
     * 读取创建与替换请求，并生成可核对的任务响应样本。
     *
     * @param args 启动参数，本示例不使用
     * @throws Exception JSON 无法映射时抛出异常
     */
    public static void main(String[] args) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        mapper.enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

        String createJson = "{\"title\":\"整理课程合同\","
                + "\"dueAt\":\"2026-08-22T18:00:00+08:00\","
                + "\"assignee\":\"lin\"}";
        CreateTaskRequest createRequest = mapper.readValue(
                createJson,
                CreateTaskRequest.class
        );
        TaskResponse createdTask = new TaskResponse(
                "TASK-104",
                createRequest.title,
                TaskStatus.TODO,
                createRequest.dueAt,
                createRequest.assignee
        );
        String createdJson = mapper.writeValueAsString(createdTask);

        System.out.println("创建请求：POST /tasks");
        System.out.println("创建请求 JSON：" + mapper.writeValueAsString(createRequest));
        System.out.println("创建响应：201 Created");
        System.out.println("Location：/tasks/TASK-104");
        System.out.println("创建响应 JSON：" + createdJson);

        System.out.println("查询请求：GET /tasks/TASK-104");
        System.out.println("查询响应：200 OK");
        System.out.println("查询响应 JSON：" + createdJson);

        List<TaskResponse> tasks = Collections.singletonList(createdTask);
        System.out.println("列表请求：GET /tasks?status=TODO");
        System.out.println("列表响应：200 OK");
        System.out.println("列表响应 JSON：" + mapper.writeValueAsString(tasks));

        List<TaskResponse> emptyTasks = Collections.emptyList();
        System.out.println("空列表请求：GET /tasks?status=DONE");
        System.out.println("空列表响应：200 OK");
        System.out.println("空列表响应 JSON：" + mapper.writeValueAsString(emptyTasks));

        String replaceJson = "{\"title\":\"整理课程合同\","
                + "\"status\":\"DONE\","
                + "\"dueAt\":\"2026-08-22T18:00:00+08:00\","
                + "\"assignee\":\"lin\"}";
        ReplaceTaskRequest replaceRequest = mapper.readValue(
                replaceJson,
                ReplaceTaskRequest.class
        );
        TaskResponse replacedTask = new TaskResponse(
                "TASK-104",
                replaceRequest.title,
                replaceRequest.status,
                replaceRequest.dueAt,
                replaceRequest.assignee
        );

        System.out.println("替换请求：PUT /tasks/TASK-104");
        System.out.println("替换请求 JSON：" + mapper.writeValueAsString(replaceRequest));
        System.out.println("替换响应：200 OK");
        System.out.println("替换响应 JSON：" + mapper.writeValueAsString(replacedTask));

        String deleteBody = "";
        System.out.println("删除请求：DELETE /tasks/TASK-104");
        System.out.println("删除响应：204 No Content");
        System.out.println(
                "删除响应体 UTF-8 字节数："
                        + deleteBody.getBytes(StandardCharsets.UTF_8).length
        );
    }

    /**
     * 保存客户端创建任务时能够决定的字段。
     */
    public static final class CreateTaskRequest {
        @JsonProperty("title")
        private final String title;
        @JsonProperty("dueAt")
        private final String dueAt;
        @JsonProperty("assignee")
        private final String assignee;

        /**
         * 创建 Java 8 版本的任务创建请求。
         *
         * @param title 任务标题
         * @param dueAt 带偏移的截止时间
         * @param assignee 可为空的负责人
         */
        @JsonCreator
        public CreateTaskRequest(
                @JsonProperty("title") String title,
                @JsonProperty("dueAt") String dueAt,
                @JsonProperty("assignee") String assignee
        ) {
            this.title = title;
            this.dueAt = dueAt;
            this.assignee = assignee;
        }
    }

    /**
     * 保存完整替换任务时需要提交的可编辑字段。
     */
    public static final class ReplaceTaskRequest {
        @JsonProperty("title")
        private final String title;
        @JsonProperty("status")
        private final TaskStatus status;
        @JsonProperty("dueAt")
        private final String dueAt;
        @JsonProperty("assignee")
        private final String assignee;

        /**
         * 创建 Java 8 版本的任务替换请求。
         *
         * @param title 任务标题
         * @param status 任务状态
         * @param dueAt 带偏移的截止时间
         * @param assignee 可为空的负责人
         */
        @JsonCreator
        public ReplaceTaskRequest(
                @JsonProperty("title") String title,
                @JsonProperty("status") TaskStatus status,
                @JsonProperty("dueAt") String dueAt,
                @JsonProperty("assignee") String assignee
        ) {
            this.title = title;
            this.status = status;
            this.dueAt = dueAt;
            this.assignee = assignee;
        }
    }

    /**
     * 保存任务 API 对调用方公开的任务表示。
     */
    public static final class TaskResponse {
        @JsonProperty("id")
        private final String id;
        @JsonProperty("title")
        private final String title;
        @JsonProperty("status")
        private final TaskStatus status;
        @JsonProperty("dueAt")
        private final String dueAt;
        @JsonProperty("assignee")
        private final String assignee;

        /**
         * 创建 Java 8 版本的任务响应。
         *
         * @param id 服务端生成的任务编号
         * @param title 任务标题
         * @param status 任务状态
         * @param dueAt 带偏移的截止时间
         * @param assignee 可为空的负责人
         */
        public TaskResponse(
                String id,
                String title,
                TaskStatus status,
                String dueAt,
                String assignee
        ) {
            this.id = id;
            this.title = title;
            this.status = status;
            this.dueAt = dueAt;
            this.assignee = assignee;
        }
    }

    /**
     * 描述本课任务 API 使用的有限状态。
     */
    public enum TaskStatus {
        TODO,
        DONE
    }
}
```

等待 Maven Reload 后，使用 `main` 左侧运行图标，或执行：

```shell
mvn -q compile exec:java -Dexec.mainClass=com.teamflow.api.TeamFlowTaskApiDesign
```

### 3. 核对兼容结果

Java 8 版必须逐行得到现代版相同输出。普通类只实现本示例需要的固定数据字段和构造过程，没有补齐 record
自动提供的完整 `equals`、`hashCode` 与 `toString` 合同，因此这里只称为兼容的数据对象实现。

两版真正不同的是 record、文本块、`List.of`、Jackson 坐标和包名；任务 API 的 method、URI、JSON 字段、
状态与 `Location` 完全相同。Java 8 用 `Collections.emptyList()` 生成同一个 `[]` 结果。若输出字段顺序或
字段名不同，应先检查两个版本的字段声明和注解，而不是修改预期合同迁就实现。

## 八、独立练习

### 1. 任务与验收

:::exercise
### 设计项目内任务的创建与查询合同

**要求：** 创建 `ProjectTaskApiDesignExercise`，为项目 `PRJ-7` 设计创建、成员查询和删除三条操作。创建
使用 `POST /projects/PRJ-7/tasks`，请求只含标题“补齐课程目录”和负责人 `lin`；服务端生成 `TASK-205`、
默认状态 `TODO`，返回 `201`、成员 `Location` 和含 `projectId` 的任务 JSON。查询返回同一任务表示，删除
返回 204 且正文长度为 0。JDK 25 使用 record 与 Jackson 3，Java 8 使用普通不可变类与 Jackson 2。

**验收：** 两版都能完整编译运行；创建、查询、删除的 method 与 URI 逐字正确；请求 JSON 不包含 id、
projectId 或 status；响应 JSON 包含 `TASK-205`、`PRJ-7` 和 `TODO`；`Location` 与成员查询 URI 相同；最终
输出“合同核对：true”和删除响应体字节数 0。

**参考答案：** 两个版本的完整实现见后文。先独立写请求与响应数据对象，再比较外部合同是否逐字一致。
:::

### 2. JDK 25 参考实现

```java
package com.teamflow.api;

import java.nio.charset.StandardCharsets;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.json.JsonMapper;

/**
 * 核对 TeamFlow 项目内任务的创建、查询与删除合同。
 */
public final class ProjectTaskApiDesignExercise {
    /**
     * 生成项目任务的请求、响应和成员位置。
     *
     * @param args 启动参数，本练习不使用
     * @throws Exception JSON 无法映射时抛出异常
     */
    public static void main(String[] args) throws Exception {
        JsonMapper mapper = JsonMapper.builder()
                .enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                .build();
        String requestJson = """
                {"title":"补齐课程目录","assignee":"lin"}
                """;
        CreateProjectTaskRequest request = mapper.readValue(
                requestJson,
                CreateProjectTaskRequest.class
        );

        String memberUri = "/projects/PRJ-7/tasks/TASK-205";
        ProjectTaskResponse response = new ProjectTaskResponse(
                "TASK-205",
                "PRJ-7",
                request.title(),
                TaskStatus.TODO,
                request.assignee()
        );
        String responseJson = mapper.writeValueAsString(response);
        boolean contractMatches = memberUri.equals("/projects/PRJ-7/tasks/" + response.id())
                && responseJson.contains("\"projectId\":\"PRJ-7\"")
                && !mapper.writeValueAsString(request).contains("TASK-205");

        System.out.println("创建项目任务：POST /projects/PRJ-7/tasks");
        System.out.println("请求 JSON：" + mapper.writeValueAsString(request));
        System.out.println("创建响应：201 Created");
        System.out.println("Location：" + memberUri);
        System.out.println("响应 JSON：" + responseJson);
        System.out.println("成员查询：GET " + memberUri);
        System.out.println("查询响应：200 OK");
        System.out.println("查询 JSON：" + responseJson);
        System.out.println("删除项目任务：DELETE " + memberUri);
        System.out.println("删除响应：204 No Content");
        System.out.println(
                "删除响应体 UTF-8 字节数："
                        + "".getBytes(StandardCharsets.UTF_8).length
        );
        System.out.println("合同核对：" + contractMatches);
    }

    /**
     * 保存创建项目任务时由客户端提交的字段。
     *
     * @param title 任务标题
     * @param assignee 负责人
     */
    public record CreateProjectTaskRequest(String title, String assignee) {
    }

    /**
     * 保存项目任务对调用方公开的表示。
     *
     * @param id 任务编号
     * @param projectId 所属项目编号
     * @param title 任务标题
     * @param status 任务状态
     * @param assignee 负责人
     */
    public record ProjectTaskResponse(
            String id,
            String projectId,
            String title,
            TaskStatus status,
            String assignee
    ) {
    }

    /**
     * 描述练习使用的任务状态。
     */
    public enum TaskStatus {
        TODO
    }
}
```

使用现代版 POM，运行：

```shell
mvn -q compile exec:java -Dexec.mainClass=com.teamflow.api.ProjectTaskApiDesignExercise
```

### 3. Java 8 参考实现

```java
package com.teamflow.api;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;

/**
 * 使用 Java 8 核对 TeamFlow 项目内任务的创建、查询与删除合同。
 */
public final class ProjectTaskApiDesignExercise {
    /**
     * 生成项目任务的请求、响应和成员位置。
     *
     * @param args 启动参数，本练习不使用
     * @throws Exception JSON 无法映射时抛出异常
     */
    public static void main(String[] args) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        mapper.enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        String requestJson = "{\"title\":\"补齐课程目录\",\"assignee\":\"lin\"}";
        CreateProjectTaskRequest request = mapper.readValue(
                requestJson,
                CreateProjectTaskRequest.class
        );

        String memberUri = "/projects/PRJ-7/tasks/TASK-205";
        ProjectTaskResponse response = new ProjectTaskResponse(
                "TASK-205",
                "PRJ-7",
                request.title,
                TaskStatus.TODO,
                request.assignee
        );
        String responseJson = mapper.writeValueAsString(response);
        boolean contractMatches = memberUri.equals("/projects/PRJ-7/tasks/" + response.id)
                && responseJson.contains("\"projectId\":\"PRJ-7\"")
                && !mapper.writeValueAsString(request).contains("TASK-205");

        System.out.println("创建项目任务：POST /projects/PRJ-7/tasks");
        System.out.println("请求 JSON：" + mapper.writeValueAsString(request));
        System.out.println("创建响应：201 Created");
        System.out.println("Location：" + memberUri);
        System.out.println("响应 JSON：" + responseJson);
        System.out.println("成员查询：GET " + memberUri);
        System.out.println("查询响应：200 OK");
        System.out.println("查询 JSON：" + responseJson);
        System.out.println("删除项目任务：DELETE " + memberUri);
        System.out.println("删除响应：204 No Content");
        System.out.println(
                "删除响应体 UTF-8 字节数："
                        + "".getBytes(StandardCharsets.UTF_8).length
        );
        System.out.println("合同核对：" + contractMatches);
    }

    /**
     * 保存创建项目任务时由客户端提交的字段。
     */
    public static final class CreateProjectTaskRequest {
        @JsonProperty("title")
        private final String title;
        @JsonProperty("assignee")
        private final String assignee;

        /**
         * 创建 Java 8 版本的项目任务请求。
         *
         * @param title 任务标题
         * @param assignee 负责人
         */
        @JsonCreator
        public CreateProjectTaskRequest(
                @JsonProperty("title") String title,
                @JsonProperty("assignee") String assignee
        ) {
            this.title = title;
            this.assignee = assignee;
        }
    }

    /**
     * 保存项目任务对调用方公开的表示。
     */
    public static final class ProjectTaskResponse {
        @JsonProperty("id")
        private final String id;
        @JsonProperty("projectId")
        private final String projectId;
        @JsonProperty("title")
        private final String title;
        @JsonProperty("status")
        private final TaskStatus status;
        @JsonProperty("assignee")
        private final String assignee;

        /**
         * 创建 Java 8 版本的项目任务响应。
         *
         * @param id 任务编号
         * @param projectId 所属项目编号
         * @param title 任务标题
         * @param status 任务状态
         * @param assignee 负责人
         */
        public ProjectTaskResponse(
                String id,
                String projectId,
                String title,
                TaskStatus status,
                String assignee
        ) {
            this.id = id;
            this.projectId = projectId;
            this.title = title;
            this.status = status;
            this.assignee = assignee;
        }
    }

    /**
     * 描述练习使用的任务状态。
     */
    public enum TaskStatus {
        TODO
    }
}
```

使用 Java 8 版 POM，以同样的 main class 命令运行。

### 4. 练习预期输出

两个版本都应得到：

```text
创建项目任务：POST /projects/PRJ-7/tasks
请求 JSON：{"title":"补齐课程目录","assignee":"lin"}
创建响应：201 Created
Location：/projects/PRJ-7/tasks/TASK-205
响应 JSON：{"id":"TASK-205","projectId":"PRJ-7","title":"补齐课程目录","status":"TODO","assignee":"lin"}
成员查询：GET /projects/PRJ-7/tasks/TASK-205
查询响应：200 OK
查询 JSON：{"id":"TASK-205","projectId":"PRJ-7","title":"补齐课程目录","status":"TODO","assignee":"lin"}
删除项目任务：DELETE /projects/PRJ-7/tasks/TASK-205
删除响应：204 No Content
删除响应体 UTF-8 字节数：0
合同核对：true
```

`Location` 与成员查询 URI 相同，说明创建结果能自然进入后续读取。请求 JSON 没有服务端字段，响应 JSON
补齐 ID、所属项目和默认状态；删除继续保持空正文。这三个观察结果共同完成练习验收。

## 九、把合同带回 TeamFlow

### 1. 当前增量是一份可实现的边界说明

完成本课后，TeamFlow 的 Web 基础阶段增量不再是三份互相分离的知识样本，而是一份完整任务 API 设计：
资源 URI、
HTTP 方法、请求对象、响应对象、状态和 `Location` 已经能够逐项核对。Java 程序证明 JSON 数据形状可以
在两个版本中保持一致，但没有伪装成正在运行的 Web 服务。

后续实现 Controller 时必须遵守这份外部合同；统一响应和错误课程可以补充错误结构、分页和追踪字段，但
不能悄悄把任务字段、创建位置或 204 语义改成另一套结果。

### 2. 完成本课后的自检

- 我能从一条业务需求写出 method、URI、请求 JSON、成功状态、关键响应头和响应 JSON。
- 我知道创建请求为什么不包含服务端生成的 `id` 与默认 `status`。
- 我能说明 `201 Created` 可以同时携带 `Location` 和新资源 JSON。
- 我会让列表稳定返回数组，并让空列表使用 `[]`。
- 我不会给 `204 No Content` 添加 JSON 正文。
- 我能让创建、列表、成员查询和替换复用同一套任务响应字段名。
- 我知道本课程序只核对合同，Spring Boot、Controller、统一错误和数据库都尚未实现。
- 我能分别运行 JDK 25 与 Java 8 完整工程，并得到相同的外部合同输出。
