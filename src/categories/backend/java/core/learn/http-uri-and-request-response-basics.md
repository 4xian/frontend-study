---
id: backend.java.learn.intermediate.http-uri-and-request-response-basics
type: lesson
title: HTTP 请求与响应
summary: 读取一组固定的 HTTP/1.1 报文，分清请求行、状态行、字段、空行和内容，并用字节边界核对 TeamFlow 响应
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 120
prerequisites:
  - backend.java.learn.basics.task-list-import-export-project
objectives:
  - 能按客户端发送请求、服务端返回响应的方向描述一次最小 HTTP 交换。
  - 能从 HTTP/1.1 请求行和状态行中读出方法、目标、版本、状态码与原因短语。
  - 能识别字段区、结束字段区的空行和可选内容，并说明 CRLF 在固定报文中的作用。
  - 能从 origin-form 请求目标中分开 path 与 query，并核对 HTTP/1.1 的 Host 字段。
  - 能区分 Accept 表达的响应格式偏好与 Content-Type 描述的实际内容格式。
  - 能按 2xx、4xx、5xx 分类状态，并正确处理 204 无内容响应。
  - 能用显式 UTF-8 字节数核对 Content-Length，不把 Java 字符串长度当作内容长度。
  - 能分别使用 JDK 25 与 Java 8 读取同一组 TeamFlow 固定报文并得到一致结果。
recap:
  - HTTP 客户端发送请求，服务端返回响应；本课的一次请求和一个最终响应是入门简化模型。
  - HTTP/1.1 报文由起始行、字段行、结束字段区的空行和可选消息体组成，课程示例统一生成 CRLF。
  - 请求行包含方法、request-target 和版本，状态行包含版本、三位状态码和可选原因短语。
  - origin-form 中问号分开 path 与 query，HTTP/1.1 请求必须提供 Host。
  - Accept 表达希望收到的格式，Content-Type 描述当前关联表示的实际格式。
  - Content-Length 按字节数计算；中文 UTF-8 内容不能使用 String.length 代替。
  - 2xx 不只包含 200，204 成功但没有内容，也不能携带 Content-Length。
  - JDK 25 可用文本块书写固定多行报文，Java 8 使用字符串拼接；两版 HTTP 结果相同。
related:
  - backend.java.learn.basics.strings-encoding-and-text-matching
  - backend.java.learn.basics.text-building-and-formatting
  - backend.java.learn.basics.task-list-import-export-project
tags:
  - Java
  - HTTP
  - HTTP/1.1
  - 请求响应
  - Content-Length
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 兼容写法见正文；报文线格式限定为 HTTP/1.1
verifiedAt: 2026-08-18
sources:
  - id: rfc9110-http-semantics
    title: RFC 9110 - HTTP Semantics
    url: https://www.rfc-editor.org/rfc/rfc9110.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: HTTP semantics
    claims:
      - 请求与响应的角色、方法和状态码类别
      - Content-Type、Accept 与 Content-Length 的语义
      - 204 成功且无内容，并且禁止发送 Content-Length
  - id: rfc9112-http11-message-syntax
    title: RFC 9112 - HTTP/1.1
    url: https://www.rfc-editor.org/rfc/rfc9112.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: HTTP/1.1 message syntax
    claims:
      - HTTP/1.1 起始行、CRLF、字段区、空行与可选消息体的线格式
      - request-line、status-line、origin-form、Host 与 204 消息边界
  - id: jls25-text-blocks
    title: Java Language Specification 25 - Text Blocks
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-3.html#jls-3.10.6
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 文本块会规范化源码行终止符、处理缩进并在最后解释转义
      - 行尾回车转义可以与规范化后的换行组成 CRLF
  - id: jls8-string-literals
    title: Java Language Specification 8 - String Literals and Escape Sequences
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-3.html#jls-3.10.5
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 普通字符串字面量不能直接跨物理行
      - Java 8 使用字符串拼接和回车换行转义表达固定多行报文
  - id: java25-string-utf8-bytes
    title: Java SE 25 API - String.getBytes(Charset)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html#getBytes(java.nio.charset.Charset)
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - String 可以按指定字符集编码成字节数组
  - id: java25-standard-charsets
    title: Java SE 25 API - StandardCharsets
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/charset/StandardCharsets.html#UTF_8
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - StandardCharsets.UTF_8 提供标准 UTF-8 字符集常量
  - id: java8-string-utf8-bytes
    title: Java Platform SE 8 API - String.getBytes(Charset)
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/String.html#getBytes-java.nio.charset.Charset-
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 已支持按指定字符集获取字符串字节
      - Java 8 与 JDK 25 使用相同的 UTF-8 内容长度算法
  - id: java8-standard-charsets
    title: Java Platform SE 8 API - StandardCharsets
    url: https://docs.oracle.com/javase/8/docs/api/java/nio/charset/StandardCharsets.html#UTF_8
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 已提供 StandardCharsets.UTF_8 常量
  - id: community-content-length-string-length
    title: Stack Overflow - Correct Content-Length for UTF-8 payloads
    url: https://stackoverflow.com/questions/17922748/what-is-the-correct-method-for-calculating-the-content-length-header-in-node-js
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: UTF-8 HTTP content；技术结论已按 RFC 9110 核验
    claims:
      - 把字符串字符数直接写入 Content-Length 是真实存在的开发误区
  - id: community-accept-content-type-confusion
    title: Stack Overflow - Accept and Content-Type confusion
    url: https://stackoverflow.com/questions/35722586/http-headers-accept-and-content-type-in-a-rest-context
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: HTTP media type fields；技术结论已按 RFC 9110 核验
    claims:
      - 开发者会真实混淆响应格式偏好与当前内容格式的字段职责
  - id: community-204-body
    title: Stack Overflow - Body in a 204 response
    url: https://stackoverflow.com/questions/56042139/is-it-possible-for-a-server-to-return-a-body-with-a-code-of-204
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: HTTP 204 response；技术结论已按 RFC 9110 和 RFC 9112 核验
    claims:
      - 204 后是否还能继续读取内容是实际开发中的常见疑问
  - id: community-only-200
    title: Stack Overflow - Checking 2xx instead of only 200
    url: https://stackoverflow.com/questions/9759826/is-checking-http-status-100-2-better-than-http-status-200
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: HTTP status classification；技术结论已按 RFC 9110 核验
    claims:
      - 只把 200 当作成功会漏掉其他合法 2xx 响应是真实误区
---

# HTTP 请求与响应

TeamFlow 已经能把任务写入文本文件。下一步先不接入服务器，而是读懂客户端与服务端在网络边界交换的
两封“信”：客户端发送请求消息，服务端根据请求返回响应消息。只要能指出每一行承担什么职责，就已经
建立了后续开发 Web 接口所需的协议底座。

本课只读取代码中固定、格式受控的 HTTP/1.1 报文，不发送真实网络请求，也不编写通用 HTTP 解析器。
REST 资源设计、JSON 数据合同、Spring Boot 和 HTTP 客户端都不在本课展开。真实应用必须让成熟的
服务器或客户端库解析不可信网络字节。

## 一、先看清一次消息往返

### 1. 客户端发请求，服务端回响应

最小的数据方向是：

```text
TeamFlow 客户端 -> HTTP 请求 -> TeamFlow 服务端
TeamFlow 客户端 <- HTTP 响应 <- TeamFlow 服务端
```

请求说明“想做什么、目标是什么、还带了哪些条件”；响应说明“处理结果怎样、返回内容是什么格式、
有没有内容”。本课每个示例只观察一条请求和对应的一条最终响应，先建立可操作的最小模型。

HTTP 规范允许最终响应前出现 `1xx` 临时响应，因此“一次请求、一个响应”只是本课示例的简化，不能
推广成所有 HTTP 交换都永远只有一个响应。本课不会继续展开临时响应。

### 2. 请求和响应都不只是一段正文

先看 TeamFlow 查询开放任务的固定请求：

```http
GET /tasks?status=OPEN&assignee=lin HTTP/1.1
Host: api.teamflow.example
Accept: text/plain

```

再看服务端返回的固定响应：

```http
HTTP/1.1 200 OK
Content-Type: text/plain; charset=UTF-8
Content-Length: 29

TASK-101|修复登录页|OPEN
```

空行不是排版装饰。它结束字段区，空行之后才是可选内容。请求没有内容；响应内容是
`TASK-101|修复登录页|OPEN`。代码中的实际固定字符串会使用 HTTP/1.1 规定的 CRLF，也就是回车
加换行；上面的代码块只是把逻辑行展示出来。

## 二、拆开 HTTP/1.1 报文

### 1. 起始行决定消息的方向

HTTP/1.1 消息由起始行开始。请求的起始行叫请求行，顺序固定为：

```text
method SP request-target SP HTTP-version CRLF
```

对下面这一行：

```http
GET /tasks?status=OPEN&assignee=lin HTTP/1.1
```

- `GET` 是方法，说明当前请求希望读取目标信息。
- `/tasks?status=OPEN&assignee=lin` 是 request-target，指出本次请求的目标。
- `HTTP/1.1` 是这条报文采用的协议版本。

响应的起始行叫状态行，顺序固定为：

```text
HTTP-version SP status-code SP [ reason-phrase ] CRLF
```

`HTTP/1.1 200 OK` 中，`200` 是程序判断结果时应使用的三位状态码；`OK` 是可选的原因短语，主要帮助
人阅读，可能被修改或省略，程序不应依赖它做分支。

### 2. 字段补充目标、偏好和内容信息

起始行后可以有零个或多个字段行，基本形态是 `字段名: 字段值`。本课只使用四个字段：

- `Host` 给出 HTTP/1.1 请求的目标主机信息；本课请求必须带它。
- `Accept` 在当前请求中表达客户端希望收到 `text/plain` 响应。
- `Content-Type` 说明当前响应的实际内容是 UTF-8 文本。
- `Content-Length` 声明当前响应内容占用多少个字节。

字段名大小写不敏感，但示例采用常见写法以便阅读。字段值的语义各不相同，不能因为它们都写在冒号
右侧就交换使用。

### 3. 第一个双 CRLF 结束字段区

HTTP/1.1 发送方应使用 CRLF 结束每一行。字段区后的第一个 `CRLF CRLF` 是关键边界：

```text
起始行 CRLF
字段行 CRLF
字段行 CRLF
CRLF
可选消息体
```

本课程序用 `raw.indexOf("\r\n\r\n")` 找到这个边界。若找不到，就拒绝这条固定报文。规范允许接收方
在有限情况下兼容单独 LF，不代表发送方应该主动生成 LF；课程样例始终生成规范的 CRLF。

报文在协议层是字节序列。为了让初学者能聚焦结构，本课把已经解码好的固定 Java 字符串作为输入，
不会处理网络读取、压缩、分块传输或不同字符编码的自动探测。

### 4. 消息体存在与否要服从消息语义

消息体是可选部分，不是每条响应都必然有正文。本课的 `200` 响应有一段文本内容，而下面的 `204`
响应在字段区结束处就结束：

```http
HTTP/1.1 204 No Content

```

`204` 属于成功的 2xx，但不能携带内容、消息体或 trailer，也不能发送 `Content-Length`。它仍可以带
符合规范的其他元数据字段，所以“204 没有内容”不等于“204 后什么字段都不能出现”。

## 三、读懂目标、格式和长度

### 1. 问号把 path 与 query 分开

本课使用 HTTP/1.1 直连源站常见的 origin-form：

```text
absolute-path [ "?" query ]
```

对 `/tasks?status=OPEN&assignee=lin`：

- path 是 `/tasks`，表示本次访问的目标路径。
- query 是 `status=OPEN&assignee=lin`，承载本示例约定的筛选条件。

问号是两者的分界，不属于 path。这里的 query 文本看起来像键值对，但 HTTP/1.1 的 origin-form 规则
并没有替程序完成参数解码，也没有把它自动转换成 Java `Map`。本课只在第一个问号处分开两段文本。

HTTP/1.1 请求还必须提供 `Host`。缺失、重复或非法的 Host 会让请求不符合这项合同；服务端应按规范
返回 `400 Bad Request`。本课只核对字段是否存在，不展开代理和虚拟主机。

### 2. Accept 与 Content-Type 回答不同问题

可以用一句话记住两者最常见的职责：

```text
Accept：我希望收到什么格式。
Content-Type：当前关联表示实际是什么格式。
```

本课请求没有消息体，所以它只用 `Accept: text/plain` 表达响应偏好。`200` 响应实际携带文本，因此用
`Content-Type: text/plain; charset=UTF-8` 描述这段内容。若请求将来也携带内容，`Content-Type`
同样可以描述请求内容，不能把它记成“只属于响应”。

`Accept` 表达偏好，不保证服务端一定返回该格式；规范也允许它出现在特定响应中。本课只处理请求中最
常见的用法，不展开完整内容协商。

### 3. Content-Length 计算 UTF-8 字节而不是字符

固定响应内容是：

```text
TASK-101|修复登录页|OPEN
```

Java 的 `body.length()` 得到 `19`，它统计的是 UTF-16 code unit。使用 UTF-8 编码后，这段内容占
`29` 个字节，所以响应必须声明 `Content-Length: 29`：

```java
String body = "TASK-101|修复登录页|OPEN";
int javaLength = body.length();
int utf8Length = body.getBytes(StandardCharsets.UTF_8).length;
```

预期 `javaLength` 为 `19`，`utf8Length` 为 `29`。`Content-Length` 只计算内容字节，不把状态行、
字段或分隔空行算进去。本课没有压缩或 transfer coding，因此可以直接把固定内容的 UTF-8 字节数与声明
值比较；这不是所有 HTTP framing 场景的通用实现。

## 四、状态码先看类别，再看具体合同

### 1. 2xx 表示成功，不只包含 200

状态码的第一位给出类别。本课只建立三个立即可用的分类：

- `200` 到 `299` 属于 2xx，表示请求已成功接收、理解并接受。
- `400` 到 `499` 属于 4xx，表示请求看起来存在客户端侧问题。
- `500` 到 `599` 属于 5xx，表示服务端知道自己出错或暂时无法执行。

判断成功可以写成：

```java
boolean success = status >= 200 && status < 300;
```

这会同时接纳 `200 OK`、`201 Created` 和 `204 No Content`。具体接口仍要规定它允许哪些状态；“属于
2xx”不等于所有成功响应都能用同一种方式读取内容。

### 2. 常见状态只记最低含义

- `200 OK`：请求成功；本课 GET 响应携带任务文本。
- `201 Created`：请求成功并创建了新资源；本课只识别它属于 2xx。
- `204 No Content`：请求成功，但没有内容可读。
- `400 Bad Request`：服务端认为请求存在语法或消息边界等客户端错误。
- `404 Not Found`：当前没有找到目标表示，或服务端不愿透露它是否存在。
- `405 Method Not Allowed`：服务端认识该方法，但目标资源不支持它。
- `415 Unsupported Media Type`：请求内容格式不受当前目标或方法支持。
- `500 Internal Server Error`：意外情况阻止服务端完成请求。
- `503 Service Unavailable`：服务端因临时过载或维护暂时无法处理。

本课只观察这些状态的类别与最低语义，不在这里设计资源、选择接口方法、实现重试或定义错误 JSON。

### 3. 204 必须先结束读取内容的动作

当状态码是 `204` 时，程序不应该继续尝试解析内容。正确的最小顺序是：

```text
读取状态码 -> 发现 204 -> 确认无 Content-Length 和无内容 -> 结束
```

对其他允许有内容的响应，再根据具体接口合同核对 `Content-Type`、长度和内容。本课完整练习会分别输入
`200`、`204`、`404` 和 `503`，让四条分支都产生可观察结果。

## 五、常见错误

**社区补充：** 实际问答中反复出现四类问题：把字符串字符数写入 `Content-Length`、混淆 `Accept`
与 `Content-Type`、在 `204` 后继续寻找 body、以及只把 `200` 当成功。本课只采用这些问题作为真实的
教学信号，最终规则均已回到 RFC 9110、RFC 9112 和 Java API 核验。

:::pitfalls
### 漏掉 HTTP/1.1 字段结束空行

**触发条件：** 只在每个字段后写一个 CRLF，却没有再写一个 CRLF 结束整个字段区。

**原因：** 混淆“结束当前字段行”和“结束字段区”两个边界。

**后果：** 本课固定解析器找不到 `CRLF CRLF`，无法确定内容从哪里开始。

**错误示例：**

```java
String response = "HTTP/1.1 200 OK\r\nContent-Length: 0\r\n";
```

**正确写法：**

```java
String response = "HTTP/1.1 200 OK\r\nContent-Length: 0\r\n\r\n";
```

**验证方式：** 对两段字符串调用 `indexOf("\r\n\r\n")`；错误版得到 `-1`，正确版得到非负索引。

### 把 query 当成 path 的一部分

**触发条件：** 直接把完整 request-target 保存为 path，不在第一个问号处分段。

**原因：** 忽略 origin-form 中 `absolute-path` 与可选 query 的结构。

**后果：** 资源路径和筛选条件混在一起，程序无法分别观察两者。

**错误示例：**

```java
String path = "/tasks?status=OPEN";
```

**正确写法：**

```java
String target = "/tasks?status=OPEN";
int queryStart = target.indexOf('?');
String path = queryStart < 0 ? target : target.substring(0, queryStart);
String query = queryStart < 0 ? "" : target.substring(queryStart + 1);
```

**验证方式：** 输出应分别为 `path=/tasks` 和 `query=status=OPEN`；没有问号时 query 应为空字符串。

### 交换 Accept 与 Content-Type

**触发条件：** 在无内容的 GET 请求中写 `Content-Type: text/plain`，却没有表达希望收到的响应格式；
或把响应的实际内容格式误写成 Accept。

**原因：** 把“格式偏好”和“当前实际格式”当成同一件事。

**后果：** 调用双方无法正确表达或验证媒体类型合同。

**错误示例：**

```http
GET /tasks HTTP/1.1
Host: api.teamflow.example
Content-Type: text/plain
```

**正确写法：**

```http
GET /tasks HTTP/1.1
Host: api.teamflow.example
Accept: text/plain
```

**验证方式：** 请求解析结果应包含 `Accept=text/plain`；有内容的响应应包含
`Content-Type=text/plain; charset=UTF-8`。

### 用 String.length 生成 Content-Length

**触发条件：** 内容包含中文，却把 `body.length()` 的返回值直接写进响应字段。

**原因：** `String.length()` 统计 UTF-16 code unit，`Content-Length` 统计字节。

**后果：** 本例会把应为 `29` 的长度写成 `19`，接收方可能只读取部分内容或破坏后续消息边界。

**错误示例：**

```java
int contentLength = body.length();
```

**正确写法：**

```java
int contentLength = body.getBytes(StandardCharsets.UTF_8).length;
```

**验证方式：** 对 `TASK-101|修复登录页|OPEN` 同时打印两个值，必须观察到 `19` 和 `29`；把声明值
改为 `19` 后，长度核对必须返回 false。

### 只把 200 当作成功

**触发条件：** 使用 `status == 200` 判断全部成功响应。

**原因：** 把一个具体状态误当成整个 2xx 类别。

**后果：** `201` 和 `204` 等合法成功响应会被错误地归入失败分支。

**错误示例：**

```java
boolean success = status == 200;
```

**正确写法：**

```java
boolean success = status >= 200 && status < 300;
```

**验证方式：** 分别输入 `200`、`201`、`204`、`404`，正确写法前三次为 true，最后一次为 false。

### 给 204 添加 Content-Length 或正文

**触发条件：** 为了保持所有响应“形状一致”，给 `204` 写入长度字段和占位文本。

**原因：** 忽略 `204` 在字段区结束处终止的消息边界。

**后果：** 响应违反 HTTP 合同，额外字节还可能污染连接上的下一条消息。

**错误示例：**

```http
HTTP/1.1 204 No Content
Content-Length: 4

NONE
```

**正确写法：**

```http
HTTP/1.1 204 No Content

```

**验证方式：** 对 `204` 固定报文检查 `Content-Length` 不存在且内容字节数为 0；只要任一条件不满足，
就判定该练习报文无效。

### 漏掉 HTTP/1.1 必需的 Host

**触发条件：** 从 HTTP/1.1 请求中删除 Host，只留下方法、目标和响应格式偏好。

**原因：** 忽略 HTTP/1.1 使用 Host 提供目标主机信息的必需合同。

**后果：** 请求不符合 HTTP/1.1 合同，本课程序也无法输出目标主机。

**错误示例：**

```http
GET /tasks HTTP/1.1
Accept: text/plain

```

**正确写法：**

```http
GET /tasks HTTP/1.1
Host: api.teamflow.example
Accept: text/plain

```

**验证方式：** 删除 Host 后运行完整程序，必须得到 `缺少字段：Host`；恢复正确字段后，程序输出的
请求 Host 必须是 `api.teamflow.example`。
:::

## 六、JDK 25 完整程序

### 1. 在 IDEA 中准备现代版项目

1. 创建普通 Java 项目，Project SDK 选择 JDK 25。
2. 在 `src` 下创建类 `TeamFlowHttpBasics`，IDEA 会创建同名文件
   `TeamFlowHttpBasics.java`。
3. 把下面完整代码放入文件。public 类名与文件名必须逐字一致。
4. 打开 `File -> Project Structure -> Project`，再次确认 Project SDK 为 25，Language level 使用
   项目 SDK 对应级别。
5. 点击 `main` 左侧运行图标，选择运行 `TeamFlowHttpBasics.main()`。

本机终端没有安装或没有选中 JDK 25，不影响 IDEA 项目已经选择自己的 JDK。需要核对时，可在 IDEA 的
Project Structure 看项目 SDK，在 IDEA Terminal 中运行 `java -version` 与 `javac -version`；两处结果
不一致说明它们使用了不同的 JDK 路径。

### 2. 完整现代版代码

```java
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

public final class TeamFlowHttpBasics {
    /**
     * 读取固定 TeamFlow 请求与响应并打印协议要素。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        ParsedMessage request = parseMessage(buildRequestMessage());
        ParsedMessage response = parseMessage(buildResponseMessage());

        String[] requestParts = request.startLine.split(" ", 3);
        String target = requestParts[1];
        int queryStart = target.indexOf('?');
        String path = queryStart < 0 ? target : target.substring(0, queryStart);
        String query = queryStart < 0 ? "" : target.substring(queryStart + 1);

        int status = statusCode(response.startLine);
        int declaredLength = Integer.parseInt(header(response, "Content-Length"));
        int actualLength = utf8Length(response.body);

        System.out.println("请求方法：" + requestParts[0]);
        System.out.println("请求路径：" + path);
        System.out.println("查询字符串：" + query);
        System.out.println("请求 Host：" + header(request, "Host"));
        System.out.println("请求 Accept：" + header(request, "Accept"));
        System.out.println("响应状态：" + status + " " + reasonPhrase(response.startLine));
        System.out.println("响应 Content-Type：" + header(response, "Content-Type"));
        System.out.println("声明内容字节数：" + declaredLength);
        System.out.println("Java 字符串长度：" + response.body.length());
        System.out.println("实际内容字节数：" + actualLength);
        System.out.println("长度匹配：" + (declaredLength == actualLength));
        System.out.println("内容：" + response.body);
    }

    /**
     * 使用 JDK 25 文本块创建带 CRLF 的固定请求。
     *
     * @return 固定 HTTP/1.1 请求
     */
    private static String buildRequestMessage() {
        return """
                GET /tasks?status=OPEN&assignee=lin HTTP/1.1\r
                Host: api.teamflow.example\r
                Accept: text/plain\r
                \r
                """;
    }

    /**
     * 使用 JDK 25 文本块创建带 CRLF 的固定响应。
     *
     * @return 固定 HTTP/1.1 响应
     */
    private static String buildResponseMessage() {
        return """
                HTTP/1.1 200 OK\r
                Content-Type: text/plain; charset=UTF-8\r
                Content-Length: 29\r
                \r
                TASK-101|修复登录页|OPEN""";
    }

    /**
     * 按本课固定格式拆分起始行、字段与内容。
     *
     * @param raw 固定且已经解码的 HTTP/1.1 报文
     * @return 拆分后的消息
     */
    private static ParsedMessage parseMessage(String raw) {
        int separator = raw.indexOf("\r\n\r\n");
        if (separator < 0) {
            throw new IllegalArgumentException("缺少 HTTP/1.1 字段结束空行");
        }

        String head = raw.substring(0, separator);
        String body = raw.substring(separator + 4);
        String[] lines = head.split("\r\n", -1);
        Map<String, String> headers = new LinkedHashMap<>();
        for (int index = 1; index < lines.length; index++) {
            int colon = lines[index].indexOf(':');
            if (colon <= 0) {
                throw new IllegalArgumentException("字段行缺少冒号：" + lines[index]);
            }
            headers.put(lines[index].substring(0, colon), lines[index].substring(colon + 1).trim());
        }
        return new ParsedMessage(lines[0], headers, body);
    }

    /**
     * 按不区分大小写的字段名读取字段值。
     *
     * @param message 已拆分消息
     * @param name 字段名
     * @return 字段值
     */
    private static String header(ParsedMessage message, String name) {
        for (Map.Entry<String, String> entry : message.headers.entrySet()) {
            if (entry.getKey().equalsIgnoreCase(name)) {
                return entry.getValue();
            }
        }
        throw new IllegalArgumentException("缺少字段：" + name);
    }

    /**
     * 从状态行读取三位状态码。
     *
     * @param statusLine HTTP/1.1 状态行
     * @return 状态码
     */
    private static int statusCode(String statusLine) {
        return Integer.parseInt(statusLine.split(" ", 3)[1]);
    }

    /**
     * 从状态行读取供人查看的原因短语。
     *
     * @param statusLine HTTP/1.1 状态行
     * @return 原因短语
     */
    private static String reasonPhrase(String statusLine) {
        String[] parts = statusLine.split(" ", 3);
        return parts.length == 3 ? parts[2] : "";
    }

    /**
     * 计算字符串使用 UTF-8 编码后的字节数。
     *
     * @param value 待编码文本
     * @return UTF-8 字节数
     */
    private static int utf8Length(String value) {
        return value.getBytes(StandardCharsets.UTF_8).length;
    }

    private static final class ParsedMessage {
        private final String startLine;
        private final Map<String, String> headers;
        private final String body;

        /**
         * 保存本课固定报文的三个已拆分部分。
         *
         * @param startLine 起始行
         * @param headers 字段集合
         * @param body 消息体
         */
        private ParsedMessage(String startLine, Map<String, String> headers, String body) {
            this.startLine = startLine;
            this.headers = headers;
            this.body = body;
        }
    }
}
```

### 3. 预期控制台输出

```text
请求方法：GET
请求路径：/tasks
查询字符串：status=OPEN&assignee=lin
请求 Host：api.teamflow.example
请求 Accept：text/plain
响应状态：200 OK
响应 Content-Type：text/plain; charset=UTF-8
声明内容字节数：29
Java 字符串长度：19
实际内容字节数：29
长度匹配：true
内容：TASK-101|修复登录页|OPEN
```

### 4. 从启动到输出经历了什么

`main` 是本程序的入口。JDK 25 先执行两个构建方法，把源码中的文本块变成实际包含 CRLF 的请求与响应
字符串。文本块只是让源码更易读，不会改变 HTTP/1.1 的换行合同；每个物理行末的 `\r` 与文本块规范化
得到的换行共同形成 CRLF。

`parseMessage` 找到第一个双 CRLF，把字段区与内容分开，再把起始行和字段保存起来。随后程序在第一个
问号处分开 path 与 query，读取 Host、Accept、状态和 Content-Type。最后，它分别计算字符串长度和
UTF-8 字节数，只有 `29 == 29` 才输出 `长度匹配：true`。

这个解析器只认识本课固定报文。生产环境面对分块传输、压缩、代理输入和恶意字节时，应由成熟 HTTP
协议栈完成解析，不能复制这段教学代码充当通用服务器解析器。

## 七、Java 8 完整程序

### 1. 在 IDEA 中准备兼容版项目

1. 另建一个普通 Java 项目，Project SDK 选择已经安装并在 IDEA 中登记的 JDK 8；不要只修改终端 PATH。
2. 打开 `File -> Project Structure -> Project`，确认 Project SDK 为 1.8，Language level 为 8。
3. 在 `src` 下创建 `TeamFlowHttpBasics.java`，放入下面完整代码。
4. 打开运行配置，确认 Main class 是 `TeamFlowHttpBasics`，运行所用 JRE 也是项目 JDK 8。
5. 运行 `main` 并逐行核对控制台输出。

如果 IDEA 列表里没有 JDK 8，应在 SDK 配置中选择本机真实 JDK 8 安装目录；选择普通 JRE 或只把语言级别
改成 8 都不能替代完整 JDK。终端与 IDEA 仍可能指向不同版本，应分别核对。

### 2. 完整兼容代码

Java 8 不支持文本块，所以只把多行固定报文改成普通字符串和 `\r\n` 拼接。解析、UTF-8 字节计算和输出
合同保持不变。

```java
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

public final class TeamFlowHttpBasics {
    /**
     * 读取固定 TeamFlow 请求与响应并打印协议要素。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        ParsedMessage request = parseMessage(buildRequestMessage());
        ParsedMessage response = parseMessage(buildResponseMessage());

        String[] requestParts = request.startLine.split(" ", 3);
        String target = requestParts[1];
        int queryStart = target.indexOf('?');
        String path = queryStart < 0 ? target : target.substring(0, queryStart);
        String query = queryStart < 0 ? "" : target.substring(queryStart + 1);

        int status = statusCode(response.startLine);
        int declaredLength = Integer.parseInt(header(response, "Content-Length"));
        int actualLength = utf8Length(response.body);

        System.out.println("请求方法：" + requestParts[0]);
        System.out.println("请求路径：" + path);
        System.out.println("查询字符串：" + query);
        System.out.println("请求 Host：" + header(request, "Host"));
        System.out.println("请求 Accept：" + header(request, "Accept"));
        System.out.println("响应状态：" + status + " " + reasonPhrase(response.startLine));
        System.out.println("响应 Content-Type：" + header(response, "Content-Type"));
        System.out.println("声明内容字节数：" + declaredLength);
        System.out.println("Java 字符串长度：" + response.body.length());
        System.out.println("实际内容字节数：" + actualLength);
        System.out.println("长度匹配：" + (declaredLength == actualLength));
        System.out.println("内容：" + response.body);
    }

    /**
     * 使用 Java 8 字符串拼接创建带 CRLF 的固定请求。
     *
     * @return 固定 HTTP/1.1 请求
     */
    private static String buildRequestMessage() {
        return "GET /tasks?status=OPEN&assignee=lin HTTP/1.1\r\n"
                + "Host: api.teamflow.example\r\n"
                + "Accept: text/plain\r\n"
                + "\r\n";
    }

    /**
     * 使用 Java 8 字符串拼接创建带 CRLF 的固定响应。
     *
     * @return 固定 HTTP/1.1 响应
     */
    private static String buildResponseMessage() {
        return "HTTP/1.1 200 OK\r\n"
                + "Content-Type: text/plain; charset=UTF-8\r\n"
                + "Content-Length: 29\r\n"
                + "\r\n"
                + "TASK-101|修复登录页|OPEN";
    }

    /**
     * 按本课固定格式拆分起始行、字段与内容。
     *
     * @param raw 固定且已经解码的 HTTP/1.1 报文
     * @return 拆分后的消息
     */
    private static ParsedMessage parseMessage(String raw) {
        int separator = raw.indexOf("\r\n\r\n");
        if (separator < 0) {
            throw new IllegalArgumentException("缺少 HTTP/1.1 字段结束空行");
        }

        String head = raw.substring(0, separator);
        String body = raw.substring(separator + 4);
        String[] lines = head.split("\r\n", -1);
        Map<String, String> headers = new LinkedHashMap<String, String>();
        for (int index = 1; index < lines.length; index++) {
            int colon = lines[index].indexOf(':');
            if (colon <= 0) {
                throw new IllegalArgumentException("字段行缺少冒号：" + lines[index]);
            }
            headers.put(lines[index].substring(0, colon), lines[index].substring(colon + 1).trim());
        }
        return new ParsedMessage(lines[0], headers, body);
    }

    /**
     * 按不区分大小写的字段名读取字段值。
     *
     * @param message 已拆分消息
     * @param name 字段名
     * @return 字段值
     */
    private static String header(ParsedMessage message, String name) {
        for (Map.Entry<String, String> entry : message.headers.entrySet()) {
            if (entry.getKey().equalsIgnoreCase(name)) {
                return entry.getValue();
            }
        }
        throw new IllegalArgumentException("缺少字段：" + name);
    }

    /**
     * 从状态行读取三位状态码。
     *
     * @param statusLine HTTP/1.1 状态行
     * @return 状态码
     */
    private static int statusCode(String statusLine) {
        return Integer.parseInt(statusLine.split(" ", 3)[1]);
    }

    /**
     * 从状态行读取供人查看的原因短语。
     *
     * @param statusLine HTTP/1.1 状态行
     * @return 原因短语
     */
    private static String reasonPhrase(String statusLine) {
        String[] parts = statusLine.split(" ", 3);
        return parts.length == 3 ? parts[2] : "";
    }

    /**
     * 计算字符串使用 UTF-8 编码后的字节数。
     *
     * @param value 待编码文本
     * @return UTF-8 字节数
     */
    private static int utf8Length(String value) {
        return value.getBytes(StandardCharsets.UTF_8).length;
    }

    private static final class ParsedMessage {
        private final String startLine;
        private final Map<String, String> headers;
        private final String body;

        /**
         * 保存本课固定报文的三个已拆分部分。
         *
         * @param startLine 起始行
         * @param headers 字段集合
         * @param body 消息体
         */
        private ParsedMessage(String startLine, Map<String, String> headers, String body) {
            this.startLine = startLine;
            this.headers = headers;
            this.body = body;
        }
    }
}
```

### 3. 预期结果与现代版一致

Java 8 程序必须逐字输出与 JDK 25 相同的 12 行结果，包括 `Java 字符串长度：19`、
`实际内容字节数：29` 和 `长度匹配：true`。如果结果不同，先比较两个 `build...Message` 方法最终生成
的字符串是否都使用 CRLF，而不是修改解析逻辑制造两个版本。

### 4. 两个版本真正不同的地方

JDK 25 支持文本块，Java 8 不支持。Java 8 若复制 `"""` 代码会直接编译失败，因此兼容版必须给出完整
字符串拼接。`StandardCharsets.UTF_8` 和 `String.getBytes(Charset)` 在 Java 8 已经存在，长度算法没有
版本差异，不需要退回平台默认字符集。

两版都使用传统入口 `public static void main(String[] args)`，所以同一启动形式可以在 JDK 25 和 Java 8
运行。文本块只改变源码表达，不能改变最终 HTTP/1.1 报文字节边界。

## 八、独立练习

:::exercise
### 检查四种 TeamFlow 固定响应

**要求：** 编写 `TeamFlowHttpStatusPractice`，依次读取课程内固定的 `200`、`204`、`404` 和 `503`
响应。2xx 使用范围判断；200 读取并打印文本与 UTF-8 字节数；204 必须确认没有 Content-Length 且内容
为空；4xx 与 5xx 分别输出客户端错误和服务端错误。不得发送网络请求，不得引入 JSON、Spring 或第三方库。

**验收：**

```text
200 -> 成功，内容=TASK-101|修复登录页|OPEN，字节数=29
204 -> 成功，无内容
404 -> 客户端错误
503 -> 服务端错误
```
:::

### 1. JDK 25 参考实现

创建 `TeamFlowHttpStatusPractice.java`，Project SDK 选择 JDK 25，运行当前类的 `main`：

```java
import java.nio.charset.StandardCharsets;

public final class TeamFlowHttpStatusPractice {
    /**
     * 检查四条固定响应的状态与内容边界。
     *
     * @param args 启动参数，本练习不使用
     */
    public static void main(String[] args) {
        String ok = """
                HTTP/1.1 200 OK\r
                Content-Type: text/plain; charset=UTF-8\r
                Content-Length: 29\r
                \r
                TASK-101|修复登录页|OPEN""";
        String noContent = """
                HTTP/1.1 204 No Content\r
                \r
                """;
        String notFound = """
                HTTP/1.1 404 Not Found\r
                Content-Type: text/plain; charset=UTF-8\r
                Content-Length: 3\r
                \r
                NOT""";
        String unavailable = """
                HTTP/1.1 503 Service Unavailable\r
                Content-Type: text/plain; charset=UTF-8\r
                Content-Length: 4\r
                \r
                DOWN""";

        inspect(ok);
        inspect(noContent);
        inspect(notFound);
        inspect(unavailable);
    }

    /**
     * 按状态类别检查一条固定响应。
     *
     * @param raw 固定 HTTP/1.1 响应
     */
    private static void inspect(String raw) {
        int separator = raw.indexOf("\r\n\r\n");
        if (separator < 0) {
            throw new IllegalArgumentException("缺少 HTTP/1.1 字段结束空行");
        }

        String head = raw.substring(0, separator);
        String body = raw.substring(separator + 4);
        String[] lines = head.split("\r\n", -1);
        int status = statusCode(lines[0]);

        if (status >= 200 && status < 300) {
            if (status == 204) {
                if (header(lines, "Content-Length") != null || !body.isEmpty()) {
                    throw new IllegalArgumentException("204 不能包含 Content-Length 或内容");
                }
                System.out.println("204 -> 成功，无内容");
                return;
            }
            System.out.println(status + " -> 成功，内容=" + body + "，字节数=" + utf8Length(body));
            return;
        }

        if (status >= 400 && status < 500) {
            System.out.println(status + " -> 客户端错误");
            return;
        }
        System.out.println(status + " -> 服务端错误");
    }

    /**
     * 从状态行读取状态码。
     *
     * @param statusLine HTTP/1.1 状态行
     * @return 三位状态码
     */
    private static int statusCode(String statusLine) {
        return Integer.parseInt(statusLine.split(" ", 3)[1]);
    }

    /**
     * 从字段行中查找指定字段。
     *
     * @param lines 起始行与字段行
     * @param name 字段名
     * @return 字段值，不存在时返回 null
     */
    private static String header(String[] lines, String name) {
        for (int index = 1; index < lines.length; index++) {
            int colon = lines[index].indexOf(':');
            if (colon > 0 && lines[index].substring(0, colon).equalsIgnoreCase(name)) {
                return lines[index].substring(colon + 1).trim();
            }
        }
        return null;
    }

    /**
     * 计算文本使用 UTF-8 编码后的字节数。
     *
     * @param value 待编码文本
     * @return UTF-8 字节数
     */
    private static int utf8Length(String value) {
        return value.getBytes(StandardCharsets.UTF_8).length;
    }
}
```

### 2. Java 8 参考实现

另建 Java 8 项目或模块，Project SDK 与运行 JRE 都选 JDK 8，创建同名文件并放入下面完整源码：

```java
import java.nio.charset.StandardCharsets;

public final class TeamFlowHttpStatusPractice {
    /**
     * 检查四条固定响应的状态与内容边界。
     *
     * @param args 启动参数，本练习不使用
     */
    public static void main(String[] args) {
        String ok = "HTTP/1.1 200 OK\r\n"
                + "Content-Type: text/plain; charset=UTF-8\r\n"
                + "Content-Length: 29\r\n"
                + "\r\n"
                + "TASK-101|修复登录页|OPEN";
        String noContent = "HTTP/1.1 204 No Content\r\n"
                + "\r\n";
        String notFound = "HTTP/1.1 404 Not Found\r\n"
                + "Content-Type: text/plain; charset=UTF-8\r\n"
                + "Content-Length: 3\r\n"
                + "\r\n"
                + "NOT";
        String unavailable = "HTTP/1.1 503 Service Unavailable\r\n"
                + "Content-Type: text/plain; charset=UTF-8\r\n"
                + "Content-Length: 4\r\n"
                + "\r\n"
                + "DOWN";

        inspect(ok);
        inspect(noContent);
        inspect(notFound);
        inspect(unavailable);
    }

    /**
     * 按状态类别检查一条固定响应。
     *
     * @param raw 固定 HTTP/1.1 响应
     */
    private static void inspect(String raw) {
        int separator = raw.indexOf("\r\n\r\n");
        if (separator < 0) {
            throw new IllegalArgumentException("缺少 HTTP/1.1 字段结束空行");
        }

        String head = raw.substring(0, separator);
        String body = raw.substring(separator + 4);
        String[] lines = head.split("\r\n", -1);
        int status = statusCode(lines[0]);

        if (status >= 200 && status < 300) {
            if (status == 204) {
                if (header(lines, "Content-Length") != null || !body.isEmpty()) {
                    throw new IllegalArgumentException("204 不能包含 Content-Length 或内容");
                }
                System.out.println("204 -> 成功，无内容");
                return;
            }
            System.out.println(status + " -> 成功，内容=" + body + "，字节数=" + utf8Length(body));
            return;
        }

        if (status >= 400 && status < 500) {
            System.out.println(status + " -> 客户端错误");
            return;
        }
        System.out.println(status + " -> 服务端错误");
    }

    /**
     * 从状态行读取状态码。
     *
     * @param statusLine HTTP/1.1 状态行
     * @return 三位状态码
     */
    private static int statusCode(String statusLine) {
        return Integer.parseInt(statusLine.split(" ", 3)[1]);
    }

    /**
     * 从字段行中查找指定字段。
     *
     * @param lines 起始行与字段行
     * @param name 字段名
     * @return 字段值，不存在时返回 null
     */
    private static String header(String[] lines, String name) {
        for (int index = 1; index < lines.length; index++) {
            int colon = lines[index].indexOf(':');
            if (colon > 0 && lines[index].substring(0, colon).equalsIgnoreCase(name)) {
                return lines[index].substring(colon + 1).trim();
            }
        }
        return null;
    }

    /**
     * 计算文本使用 UTF-8 编码后的字节数。
     *
     * @param value 待编码文本
     * @return UTF-8 字节数
     */
    private static int utf8Length(String value) {
        return value.getBytes(StandardCharsets.UTF_8).length;
    }
}
```

### 3. 运行与验收

两版都在各自文件中运行 `TeamFlowHttpStatusPractice.main()`，必须得到练习中给出的四行输出。然后把
`204` 固定报文改成下面这个错误版本再运行：

```http
HTTP/1.1 204 No Content
Content-Length: 4

NONE
```

程序必须停止并报告 `204 不能包含 Content-Length 或内容`。恢复正确报文后，四行成功输出应重新出现。
这条失败路径直接由练习入口触发，不需要修改解析器或借助课程外代码。

## 九、把本课放回 TeamFlow

### 1. 当前增量是看懂边界，不是建立服务器

本课给 TeamFlow 增加的是一组可读、可核对的固定请求与响应样本。它让你能在接入框架前回答：请求的
目标在哪里、服务端返回什么状态、内容是什么格式、长度是否与 UTF-8 字节一致、无内容响应何时停止。

没有网络连接、Controller、JSON 或数据库也没有关系。先理解协议消息，后续使用成熟 HTTP 栈时才能从
日志、IDEA 客户端或浏览器开发工具中读懂真实请求和响应。

### 2. 完成本课后的自检

你应当能够独立完成以下检查：

1. 指出请求行和状态行中每个部分的含义。
2. 在固定报文中找到字段结束空行，并说明为什么是双 CRLF。
3. 把 `/tasks?status=OPEN` 拆成 path 与 query。
4. 说明 Host、Accept、Content-Type 与 Content-Length 各自回答什么问题。
5. 解释为什么中文内容的 Java 字符串长度不能直接作为 Content-Length。
6. 把 `200`、`204`、`404` 和 `503` 放进正确类别，并在 `204` 时停止读取内容。
7. 在 IDEA 中分别选择 JDK 25 与 JDK 8，运行完整程序和练习并得到规定输出。
8. 说明文本块与字符串拼接只改变源码写法，不改变最终 HTTP/1.1 报文。
