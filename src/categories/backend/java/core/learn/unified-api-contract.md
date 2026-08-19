---
id: backend.java.learn.basics.unified-api-contract
type: lesson
title: 统一 API 契约
summary: 为 TeamFlow 冻结可跨端复用的路径、JSON、成功响应、Problem Details、分页与幂等约定
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 180
prerequisites:
  - backend.java.learn.basics.task-api-design-project
objectives:
  - 能为 TeamFlow 统一确定 API 基础路径、资源命名和主版本位置。
  - 能固定 lowerCamelCase 字段、字符串 ID、带偏移时间及缺失、null、空数组和空字符串的语义。
  - 能按表示类型设计成员、分页列表和无正文成功响应，而不重复包装 HTTP 状态。
  - 能用 RFC 9457 Problem Details 表达稳定业务错误码、字段错误和追踪标识。
  - 能为常用 HTTP 方法选择成功与失败状态，并保持响应状态和错误 body 一致。
  - 能固定分页、排序与 POST 幂等键的最小项目合同。
  - 能判断文件上传、文件下载和登录响应为什么不能机械套用普通 JSON 表示。
  - 能用 IntelliJ IDEA .http 文件和 curl 保存可复用的请求样本。
  - 能运行 JDK 25 / Jackson 3.2.1 与 Java 8 / Jackson 2.12.7.1 的完整合同程序。
recap:
  - TeamFlow 的稳定 API 前缀是 /api/v1，资源路径使用小写复数名词，主版本位于路径第一段。
  - JSON 字段使用 lowerCamelCase，ID 使用字符串，业务时间使用包含 Z 或偏移量的 RFC 3339 字符串。
  - 缺失表示未提供或不适用，null 表示明确没有值，空数组表示集合存在但当前没有元素，空字符串不是缺失值。
  - 成员成功直接返回资源表示，列表返回 items 和 nextPageToken，204 响应没有正文。
  - 错误响应使用 application/problem+json；type、title、status、detail、instance 是标准成员，code、traceId 和 errors 是 TeamFlow 扩展。
  - HTTP 状态表达协议结果，稳定 code 供客户端分支，title、detail 和字段 message 供人阅读，三者不能互相替代。
  - pageToken 是不透明游标；TeamFlow 的 Idempotency-Key 是项目约定，不是 HTTP 自动提供的 POST 幂等保证。
  - JDK 25 与 Java 8 对外合同相同，差异只留在 record、文本块、集合工厂和 Jackson 坐标与包名中。
related:
  - backend.java.learn.intermediate.http-uri-and-request-response-basics
  - backend.java.learn.intermediate.transactions-and-idempotency
  - backend.java.learn.intermediate.json-and-data-contracts
  - backend.java.learn.basics.task-api-design-project
tags:
  - Java
  - HTTP
  - REST
  - JSON
  - API 契约
  - Problem Details
  - 分页
  - 幂等
  - TeamFlow
appliesTo: JDK 25 与 Jackson 3.2.1 主线；Java 8 与 Jackson 2.12.7.1 兼容写法；HTTP 语义按 RFC 9110，错误格式按 RFC 9457
verifiedAt: 2026-08-18
sources:
  - id: rfc9110-unified-api
    title: RFC 9110 - HTTP Semantics
    url: https://www.rfc-editor.org/rfc/rfc9110.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: HTTP semantics
    claims:
      - GET、POST、PUT、DELETE 的方法语义及安全与幂等属性
      - 200、201、204、400、401、403、404、409 与 500 的协议语义
      - 204 响应不包含内容，POST 本身不具有幂等方法语义
      - 服务端生成 401 响应时必须发送包含至少一个 challenge 的 WWW-Authenticate
  - id: rfc9457-teamflow-problems
    title: RFC 9457 - Problem Details for HTTP APIs
    url: https://www.rfc-editor.org/rfc/rfc9457.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: HTTP Problem Details
    claims:
      - application/problem+json 媒体类型与 type、title、status、detail、instance 成员
      - status 成员必须与实际 HTTP 状态一致，且问题类型可以定义扩展成员
      - errors 数组可以作为字段校验问题类型的扩展示例
  - id: rfc3339-teamflow-time
    title: 'RFC 3339 - Date and Time on the Internet: Timestamps'
    url: https://www.rfc-editor.org/rfc/rfc3339.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Internet timestamps
    claims:
      - 日期时间字符串使用 T 分隔日期与时间，并使用 Z 或数值偏移表达 UTC 关系
  - id: trace-context-teamflow-trace-id
    title: W3C Recommendation - Trace Context
    url: https://www.w3.org/TR/trace-context/
    sourceOrigin: official
    sourceType: specification
    appliesTo: W3C Trace Context
    claims:
      - traceparent 携带 16 字节 trace-id，32 个小写十六进制字符用于跨服务关联一次追踪
      - trace-id 不能全为零，追踪字段不应承载个人或敏感信息
  - id: aip158-teamflow-pagination
    title: AIP-158 - Pagination
    url: https://google.aip.dev/158
    sourceOrigin: official
    sourceType: engineering-reference
    appliesTo: Google API Improvement Proposals
    claims:
      - 分页请求与响应使用 page size、page token 和 next page token 形成连续合同
      - page token 应是不透明且 URL 安全的字符串，后续页必须保留其他查询条件
  - id: aip185-teamflow-versioning
    title: AIP-185 - API Versioning
    url: https://google.aip.dev/185
    sourceOrigin: official
    sourceType: engineering-reference
    appliesTo: Google API Improvement Proposals
    claims:
      - REST API 可把主版本放在 URI 路径第一段，并让不同主版本在迁移期并存
      - 稳定版本使用 v1 而不是在路径中暴露次版本和补丁版本
  - id: jetbrains-http-client-contract-samples
    title: IntelliJ IDEA Documentation - HTTP Client
    url: https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: IntelliJ IDEA 2026.2 Help
    claims:
      - .http 和 .rest 文件可以直接保存、编辑并执行 HTTP 请求
      - 请求样本由 method、URI、headers 和可选 body 组成，并可用三个井号分隔
  - id: curl-http-contract-samples
    title: everything curl - Command line HTTP
    url: https://everything.curl.dev/http/index.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: curl HTTP command line
    claims:
      - curl 可以从命令行设置 HTTP method、headers、请求 body 并观察响应
  - id: rfc7578-teamflow-upload
    title: RFC 7578 - Returning Values from Forms multipart/form-data
    url: https://www.rfc-editor.org/rfc/rfc7578.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: multipart/form-data uploads
    claims:
      - multipart/form-data 使用 boundary 分隔各个 part，每个 part 使用 Content-Disposition 描述字段
      - 文件 part 可以携带 filename 和自己的 Content-Type
  - id: rfc6266-teamflow-download
    title: RFC 6266 - Content-Disposition in HTTP
    url: https://www.rfc-editor.org/rfc/rfc6266.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: HTTP download responses
    claims:
      - 响应可以用 Content-Disposition 的 attachment disposition type 提示保存内容
      - filename 参数为接收方提供建议文件名，但接收方仍需安全处理
  - id: jackson32-unified-contract
    title: Jackson Databind 3.2.1 README
    url: https://github.com/FasterXML/jackson-databind/blob/jackson-databind-3.2.1/README.md
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Jackson Databind 3.2.1
    claims:
      - Jackson 3 使用 tools.jackson.core Maven 坐标与 tools.jackson.databind 包名
      - JsonMapper 可以把固定数据对象写成 JSON，Jackson 3 要求 JDK 17 或以上
  - id: jackson212-unified-contract
    title: Jackson Databind 2.12.7.1 README
    url: https://github.com/FasterXML/jackson-databind/blob/jackson-databind-2.12.7.1/README.md
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Jackson Databind 2.12.7.1
    claims:
      - Jackson 2 使用 com.fasterxml.jackson.core Maven 坐标与 com.fasterxml.jackson.databind 包名
      - Java 8 普通类可以使用 ObjectMapper 输出相同 JSON 合同
  - id: jep395-unified-contract-records
    title: JEP 395 - Records
    url: https://openjdk.org/jeps/395
    sourceOrigin: official
    sourceType: release-note
    appliesTo: JDK 16 and later
    claims:
      - record 在 JDK 16 正式交付，因此 JDK 25 可用而 Java 8 不支持
  - id: community-multiple-validation-errors
    title: Stack Overflow - REST API error codes return structure
    url: https://stackoverflow.com/questions/18470136/rest-api-error-codes-return-structure
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: 多字段校验错误响应的真实设计讨论；技术结论已按 RFC 9457 核验
    claims:
      - 一次请求可能同时产生多个字段错误，如何让客户端稳定定位各字段是实际开发中的常见问题
---

# 统一 API 契约

TeamFlow 已经能为单个任务写出 method、URI、请求 JSON 和成功响应，但一个系统不会永远只有一个接口。
如果任务接口把列表放在 `data`，项目接口直接返回数组，错误接口又始终返回 200，前端就必须为每条路由
重新猜规则。统一契约的作用，是在真正编写 Web 代码前先冻结这些跨接口都要遵守的决定。

本课只设计并离线核对合同，不启动服务器，也不编写 Controller、校验器或全局异常处理器。后续实现可以
选择不同内部类和框架 API，但 `/api/v1`、字段语义、HTTP 状态和公开 JSON 不能因此悄悄改变。

## 一、先冻结地址和资源名称

### 1. 基础路径把 API 与页面地址分开

TeamFlow 的所有业务 API 都从 `/api/v1` 开始：

```text
/api/v1/tasks
/api/v1/projects/PRJ-7/tasks
/api/v1/users/USR-8
```

`/api` 表明这是程序使用的接口空间，`v1` 是主版本，后面的复数名词才是业务资源。客户端把基础路径
配置成一个值，便能在开发、测试和生产环境中只替换主机名，而不为每个资源拼一套前缀。

主版本放在 REST URI 的第一段业务路径中。兼容变化继续留在 `v1`；只有无法保持兼容的合同变化才准备
`v2`，并让两个版本在迁移期并存。路径不写 `v1.1` 或 `v1.4.2`，因为客户端依赖的是主合同，而不是服务
内部每次发布的版本号。

### 2. 资源路径使用稳定名词

资源段使用小写复数名词，多个单词用连字符连接。动作由 HTTP 方法表达，不把普通 CRUD 动词塞进路径：

| 场景 | 合同路径 | 不采用的路径 |
| --- | --- | --- |
| 查询任务列表 | `GET /api/v1/tasks` | `GET /api/v1/getTasks` |
| 创建任务 | `POST /api/v1/tasks` | `POST /api/v1/createTask` |
| 查询单个任务 | `GET /api/v1/tasks/TASK-104` | `GET /api/v1/task?id=TASK-104` |
| 删除任务 | `DELETE /api/v1/tasks/TASK-104` | `POST /api/v1/deleteTask` |

项目内任务只有在“所属项目”决定资源范围时才使用
`/api/v1/projects/PRJ-7/tasks/TASK-104`。不要为了展示对象关系无限嵌套路径；客户端需要稳定找到资源，
不需要从 URI 复原整个数据库模型。

### 3. 查询条件不改变资源身份

筛选、排序和分页属于列表查询条件，放在 query 中：

```http
GET /api/v1/tasks?status=TODO&sort=dueAt,title&pageSize=20&pageToken=pgn_4fQ8yN7kL2cV9wX3
Accept: application/json, application/problem+json
```

TeamFlow 约定 `sort=dueAt,title` 表示先按截止时间升序，再按标题升序；前导减号是降序，没有减号是
升序。`pageSize` 只表达期望页大小，服务端可以按公开上限收窄；`pageToken` 是服务端签发的不透明字符串，
客户端只负责原样带回，不能解码后修改其中内容。

请求下一页时，除 `pageToken` 外的筛选和排序条件必须保持不变。否则游标描述的顺序与新查询不一致，
结果可能重复或遗漏。

## 二、统一 JSON 字段语义

### 1. 字段名和 ID 不随实现语言变化

JSON 字段统一使用 lowerCamelCase：

```json
{
  "id": "TASK-104",
  "projectId": "PRJ-7",
  "dueAt": "2026-08-22T18:00:00+08:00",
  "assignee": null
}
```

Java 中的类名、数据库列名或前端变量可以采用各自约定，但公开 JSON 不能有时写 `projectId`、有时写
`project_id`。所有公开 ID 都使用 JSON 字符串，即使数据库当前使用数字，也不让客户端依赖数值范围、
自增规则或 JavaScript 安全整数边界。

### 2. 业务时间必须包含 UTC 关系

需要跨机器传递的时间使用 RFC 3339 日期时间字符串，并明确写出 `Z` 或数值偏移：

```json
{"dueAt":"2026-08-22T10:00:00Z"}
```

```json
{"dueAt":"2026-08-22T18:00:00+08:00"}
```

这两个值都能说明本地时钟与 UTC 的关系。`2026-08-22 18:00:00` 没有 `T` 和偏移，接收方无法判断它是
上海时间、UTC 还是服务器本地时间，因此不进入 TeamFlow API。

日期时间先作为已经核验格式的字符串传输。本课不提前展开 Java 时间对象映射、数据库时区或序列化模块。

### 3. 缺失、null、空集合和空字符串分别有含义

四种看起来都像“没有”的状态不能混用：

| JSON 状态 | TeamFlow 含义 | 例子 |
| --- | --- | --- |
| 字段缺失 | 调用方未提供，或该表示不适用此字段 | 更新请求没有 `assignee` |
| `null` | 字段适用，但当前明确没有值 | `"assignee": null` 表示未指派 |
| `[]` | 集合存在，但当前没有元素 | `"items": []` 表示本页没有任务 |
| `""` | 提供了一个长度为 0 的字符串 | 标题中属于无效输入，不代表缺失 |

因此查询空列表仍返回 `items: []`，而不是 `items: null`；可选负责人可以返回 `null`；标题为空字符串时
进入校验错误，不会被自动解释成“没有提交 title”。这些决定让前端不必根据每条接口重新猜测。

## 三、成功响应按表示类型保持一致

### 1. 成员成功直接返回资源表示

读取或创建单个任务时，成功 body 直接是任务表示：

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "TASK-104",
  "title": "冻结统一合同",
  "status": "TODO",
  "dueAt": "2026-08-22T18:00:00+08:00",
  "assignee": null
}
```

不再添加 `success: true`、`code: 200` 和 `message: ok`。HTTP 状态已经表达成功，重复字段既不能增加
语义，还可能出现 HTTP 是 500、body 却写 200 的矛盾。

创建资源继续使用 `201 Created` 和 `Location`，body 可以返回同一个成员表示：

```http
HTTP/1.1 201 Created
Location: /api/v1/tasks/TASK-104
Content-Type: application/json

{"id":"TASK-104","title":"冻结统一合同","status":"TODO","dueAt":"2026-08-22T18:00:00+08:00","assignee":null}
```

### 2. 分页列表固定为 items 和 nextPageToken

列表响应使用对象承载数组和下一页游标：

```json
{
  "items": [
    {
      "id": "TASK-104",
      "title": "冻结统一合同",
      "status": "TODO",
      "dueAt": "2026-08-22T18:00:00+08:00",
      "assignee": null
    }
  ],
  "nextPageToken": "pgn_4fQ8yN7kL2cV9wX3"
}
```

最后一页固定返回 `nextPageToken: null`，空页同时保持 `items: []`：

```json
{
  "items": [],
  "nextPageToken": null
}
```

TeamFlow 在这里选择显式 `null` 表示没有下一页。采用“字段缺失”也可以形成合同，但同一 API 不能两种
写法随机切换。示例 token 不编码任务 ID、页码或排序字段；游标只供服务端解释，客户端是否继续请求只
判断它是否为 `null`。

### 3. 无表示成功就不制造 JSON

删除成功且不需要返回新状态时使用 204，响应没有 body：

```http
HTTP/1.1 204 No Content
```

不能为了外形统一而返回 `{}`、`null` 或 `{"success":true}`。这些内容都会把“没有表示”改成“存在一个
JSON 表示”，也与 204 的协议语义冲突。

## 四、错误响应使用 Problem Details

### 1. 标准成员和扩展成员各司其职

TeamFlow 错误响应使用 `application/problem+json`。字段校验失败的完整样本如下：

```http
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{
  "type": "https://api.teamflow.example/problems/validation-error",
  "title": "请求参数校验失败",
  "status": 400,
  "detail": "有 2 个字段不符合任务创建合同",
  "instance": "/api/v1/tasks",
  "code": "TASK_VALIDATION_FAILED",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "errors": [
    {"field": "title", "code": "NOT_BLANK", "message": "标题不能为空"},
    {"field": "dueAt", "code": "INVALID_TIME", "message": "截止时间必须包含时区偏移"}
  ]
}
```

RFC 9457 的标准成员承担通用语义：

| 成员 | 本课合同 |
| --- | --- |
| `type` | 问题类型的稳定 URI，是问题类型的主标识 |
| `title` | 同一问题类型的简短人类摘要 |
| `status` | 本次响应使用的 HTTP 状态数字，必须与状态行一致 |
| `detail` | 针对这一次失败的安全说明 |
| `instance` | 标识这一次问题发生位置的 URI 引用 |

`code`、`traceId` 和 `errors` 是 TeamFlow 扩展。`code` 给客户端稳定分支，`traceId` 帮助支持人员关联
一次请求，`errors` 让表单逐字段展示问题。扩展不会改变 HTTP 状态，也不能把内部异常类名、SQL、路径、
stack trace 或令牌暴露给客户端。

### 2. 错误码稳定，文案可以改进

客户端可以判断 `code == TASK_NOT_FOUND`，不能依赖“任务不存在”这句中文做程序分支：

```json
{
  "type": "https://api.teamflow.example/problems/task-not-found",
  "title": "任务不存在",
  "status": 404,
  "detail": "没有找到编号为 TASK-404 的任务",
  "instance": "/api/v1/tasks/TASK-404",
  "code": "TASK_NOT_FOUND",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "errors": []
}
```

错误码使用大写下划线形式并表达业务语义。人类文案可以修正或本地化，稳定 code 不因措辞变化而改名。
`errors` 在非字段错误中仍返回空数组，客户端可以统一遍历而不用先判断 null。

**社区补充：** 多字段校验错误如何同时返回，是实际 API 设计中反复出现的问题。社区讨论帮助定位了这个
需求；最终结构不照搬某个回答，而是采用 RFC 9457 已给出的 `errors` 扩展示例，并冻结为字段、错误码和
人类消息三个属性。这样既允许同一字段有多个错误，也不会把一整段文案当成机器协议。

### 3. traceId 只用于关联，不承载业务数据

W3C Trace Context 中的 trace-id 是 16 字节，也就是 32 个小写十六进制字符；全零值无效。TeamFlow 把
本次请求采用的 trace-id 同时放进错误扩展 `traceId`，便于用户把它交给支持人员。

`traceId` 不是用户 ID、订单号或权限凭据，也不保证调用者传来的任意值都可信。后续实现需要校验或生成
追踪上下文；本课只冻结公开字段及其格式，不提前实现分布式追踪。

## 五、方法、状态和写入重放

### 1. 状态码必须与真实结果匹配

TeamFlow 使用下面的最小映射：

| 场景 | HTTP 结果 | body |
| --- | --- | --- |
| 查询成员成功 | `200 OK` | 资源表示 |
| 查询分页列表成功 | `200 OK` | `items` 与 `nextPageToken` |
| 创建成功 | `201 Created` | 资源表示，并返回 `Location` |
| 替换或局部更新成功 | `200 OK` | 更新后的资源表示 |
| 删除成功且无返回表示 | `204 No Content` | 无 body |
| 请求语法或字段校验失败 | `400 Bad Request` | Problem Details |
| 缺少有效认证 | `401 Unauthorized` | Problem Details |
| 身份已知但不允许操作 | `403 Forbidden` | Problem Details |
| 资源不存在 | `404 Not Found` | Problem Details |
| 当前资源状态冲突 | `409 Conflict` | Problem Details |
| 未预期的服务端失败 | `500 Internal Server Error` | 去敏后的 Problem Details |

状态码先告诉通用 HTTP 软件失败属于哪一类，`code` 再告诉 TeamFlow 客户端具体业务原因。所有失败都返回
200 会让缓存、监控和调用库得到错误信号；所有失败都返回 500 又会把可修正的客户端输入问题伪装成服务故障。

### 2. HTTP 的幂等方法不等于每次响应完全相同

RFC 9110 把 PUT、DELETE 和安全方法定义为幂等：多次发送相同意图，服务端预期效果与发送一次相同。
这不保证两次响应字节完全一样，也不保证网络中断后客户端已经收到第一次结果。

POST 不具备这种方法级保证。TeamFlow 为创建类 POST 额外接受项目约定请求头：

```http
POST /api/v1/tasks HTTP/1.1
Content-Type: application/json
Idempotency-Key: create-task-20260818-001

{"title":"冻结统一合同","dueAt":"2026-08-22T18:00:00+08:00","assignee":null}
```

同一调用方、method、路径和 `Idempotency-Key` 再次提交相同 JSON 时，应得到第一次创建结果，而不是创建
第二个任务；同一个 key 搭配不同 JSON 时返回 `409 Conflict`。键的存储与过期以后实现，但保留期必须在
服务文档中明确，客户端不能假设永久有效。

`Idempotency-Key` 在本课是 TeamFlow 项目合同，不声称它已经由 RFC 9110 自动赋予 POST 幂等语义。

## 六、三个不能机械套用 JSON 的接口

### 1. 文件上传使用 multipart

上传文件时，请求 `Content-Type` 是 `multipart/form-data`，每个 part 分别携带文件或元数据。不能把大文件
先转成 JSON 字符串再塞进普通任务请求。上传成功后的元数据仍可以返回普通 JSON 资源表示，失败仍使用
Problem Details。

下面的边界字符串只用于展示协议形状；真实客户端会生成 boundary，并让请求头与 body 保持一致：

```http
POST /api/v1/tasks/TASK-104/attachments HTTP/1.1
Content-Type: multipart/form-data; boundary=teamflow-boundary
Accept: application/json, application/problem+json

--teamflow-boundary
Content-Disposition: form-data; name="file"; filename="contract.pdf"
Content-Type: application/pdf

<PDF 字节>
--teamflow-boundary--
```

创建成功后返回附件元数据，而不是把文件字节塞回 JSON：

```http
HTTP/1.1 201 Created
Location: /api/v1/tasks/TASK-104/attachments/ATT-7
Content-Type: application/json

{"id":"ATT-7","fileName":"contract.pdf","contentType":"application/pdf","size":24576}
```

`Location` 可以继续读取附件元数据；上传格式错误时改用 400 与 Problem Details。由此可以分别观察请求的
multipart 媒体类型、文件 part 的类型以及成功响应的 JSON 类型。

### 2. 文件下载返回字节流

下载成功返回文件字节，并使用准确的 `Content-Type`；需要提示文件名时使用 `Content-Disposition`。不能给
字节再包一层 `{data: ...}`。如果下载前就发生业务失败，响应才切换为 `application/problem+json`。

```http
GET /api/v1/tasks/TASK-104/attachments/ATT-7/content HTTP/1.1
Accept: application/pdf, application/problem+json

HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="contract.pdf"

<PDF 字节>
```

检查响应时应看到 `application/pdf` 和文件字节；若附件不存在，则应看到 404 与 Problem Details，而不是
一个伪装成文件的 JSON 成功响应。

### 3. 登录成功与受保护接口失败各有合同

登录请求与成功响应仍是 JSON，但令牌字段有自己的安全边界，不能放进 query 或错误详情：

```http
POST /api/v1/sessions HTTP/1.1
Content-Type: application/json
Accept: application/json, application/problem+json

{"username":"lin","password":"<用户输入>"}

HTTP/1.1 200 OK
Content-Type: application/json

{"accessToken":"<访问令牌>","tokenType":"Bearer","expiresIn":3600}
```

TeamFlow 把用户名或密码不匹配固定为 400 与 `INVALID_CREDENTIALS` Problem Details，不在 detail 中说明
究竟是哪一项错误：

```http
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{"type":"https://api.teamflow.example/problems/invalid-credentials","title":"登录失败","status":400,"detail":"用户名或密码不正确","instance":"/api/v1/sessions","code":"INVALID_CREDENTIALS","traceId":"4bf92f3577b34da6a3ce929d0e0e4736","errors":[]}
```

受保护接口缺少有效 Bearer 令牌时才返回 401；RFC 9110 要求 401 同时发送 `WWW-Authenticate`：

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer realm="teamflow"
Content-Type: application/problem+json

{"type":"https://api.teamflow.example/problems/authentication-required","title":"需要认证","status":401,"detail":"请提供有效的访问令牌","instance":"/api/v1/tasks/TASK-104","code":"AUTHENTICATION_REQUIRED","traceId":"4bf92f3577b34da6a3ce929d0e0e4736","errors":[]}
```

这样可以分别观察登录成功的令牌 JSON 和受保护接口失败的 challenge。令牌生成、密码校验和权限将在对应
课程实现，本课只冻结公开请求与响应。

## 七、保存可复用请求样本

### 1. IntelliJ IDEA 的 .http 文件

在项目中创建 `teamflow-api.http`，写入：

```http
@baseUrl = http://localhost:8080/api/v1

### 查询第一页任务
GET {{baseUrl}}/tasks?status=TODO&sort=dueAt,title&pageSize=20
Accept: application/json, application/problem+json

### 创建任务
POST {{baseUrl}}/tasks
Content-Type: application/json
Accept: application/json, application/problem+json
Idempotency-Key: create-task-20260818-001

{
  "title": "冻结统一合同",
  "dueAt": "2026-08-22T18:00:00+08:00",
  "assignee": null
}
```

IDEA 会在请求行旁显示运行图标；`###` 分隔两条独立请求。当前课程没有启动服务，所以现在点击运行应得到
连接失败，而不是伪造的 200。先核对文件中的 method、路径、headers 与 JSON；后续服务启动后再使用同一
文件观察真实状态、headers 和 body。

### 2. curl 使用同一份合同

等服务实际监听 8080 端口后，等价的创建请求是：

```shell
curl --verbose \
  --request POST \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json, application/problem+json' \
  --header 'Idempotency-Key: create-task-20260818-001' \
  --data '{"title":"冻结统一合同","dueAt":"2026-08-22T18:00:00+08:00","assignee":null}' \
  'http://localhost:8080/api/v1/tasks'
```

`.http` 与 curl 不是两套 API。二者的 method、URI、headers 和 body 必须逐字对应；一个适合跟项目一起维护，
另一个适合终端和自动化环境。当前仍只保存样本，不把“连接失败”误判成合同错误。

## 八、易错示例

### 八个典型合同错误

:::pitfalls
### 把发布版本写进每条资源路径

**现象：** 同一主合同出现 `/api/v1.1/tasks`、`/api/v1.2/projects` 等互不一致的基础路径。

**触发条件：** 把服务每次发布号都当成客户端必须使用的 API 主版本。

**原因：** 次版本与补丁发布不等于不兼容合同；路径漂移会让客户端无法共享基础地址。

**后果：** 路由、文档和前端配置不断复制，两个资源甚至无法确定属于哪一套合同。

**错误示例：**

```http
GET /api/v1.2/tasks
GET /api/v1.3/projects
```

**正确写法：**

```http
GET /api/v1/tasks
GET /api/v1/projects
```

**影响版本：** JDK 25 与 Java 8 对外合同相同。

**验证方式：** 搜索所有请求样本；业务资源都必须以 `/api/v1/` 开头，路径中不得出现次版本或补丁版本。

**来源：** AIP-185 的 REST 主版本路径与兼容版本并行说明。

### 用 200 和 success=false 表达所有失败

**现象：** HTTP 状态显示成功，body 才写 `success: false` 或 `code: 404`。

**触发条件：** 只追求 JSON 外形统一，忽略 HTTP 状态已经承担协议结果。

**原因：** 通用客户端、代理与监控首先读取状态行，不会理解项目自造的 success 字段。

**后果：** 失败会进入成功分支，监控漏报，body 与状态还可能互相矛盾。

**错误示例：**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"success":false,"code":404,"message":"任务不存在"}
```

**正确写法：**

```http
HTTP/1.1 404 Not Found
Content-Type: application/problem+json

{"type":"https://api.teamflow.example/problems/task-not-found","title":"任务不存在","status":404,"detail":"没有找到编号为 TASK-404 的任务","instance":"/api/v1/tasks/TASK-404","code":"TASK_NOT_FOUND","traceId":"4bf92f3577b34da6a3ce929d0e0e4736","errors":[]}
```

**影响版本：** 所有 HTTP 客户端都适用，与 Java 版本无关。

**验证方式：** 同时读取状态行和 body；两处都必须为 404，`Content-Type` 必须是 `application/problem+json`。

**来源：** RFC 9110 状态码语义与 RFC 9457 status 一致性要求。

### 把空列表改成 null

**现象：** 有数据时 `items` 是数组，没有数据时却变成 null 或整个字段消失。

**触发条件：** 服务端把“集合没有元素”误当成“这个字段没有值”。

**原因：** 空集合与可空单值表达不同状态；调用方不能稳定遍历 null。

**后果：** 前端需要为每次列表遍历增加特殊分支，类型定义也无法保持一致。

**错误示例：**

```json
{"items":null,"nextPageToken":null}
```

**正确写法：**

```json
{"items":[],"nextPageToken":null}
```

**影响版本：** JDK 25 与 Java 8 的外部 JSON 都适用。

**验证方式：** 让完整程序序列化空页；解析后 `items` 必须是长度为 0 的数组，不能是 JSON null。

**来源：** 本课冻结的 TeamFlow 空集合语义与 AIP-158 分页响应模型。

### 错误 body 的 status 与状态行不一致

**现象：** 状态行是 400，Problem Details 的 status 却写 500。

**触发条件：** HTTP adapter 与错误对象分别硬编码状态，修改时只更新其中一处。

**原因：** RFC 9457 的 status 是实际响应状态的便捷副本，不是第二套结果来源。

**后果：** 通用 HTTP 软件和业务客户端会对同一次失败得到相反分类。

**错误示例：**

```http
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{"title":"请求参数校验失败","status":500}
```

**正确写法：**

```http
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{"title":"请求参数校验失败","status":400}
```

**影响版本：** 所有 HTTP 实现都适用。

**验证方式：** 对每个失败样本同时断言状态行与 `status` 数字；二者必须相等。

**来源：** RFC 9457 第 3.1.2 节。

### 把多个字段错误压成一段文案

**现象：** title 与 dueAt 都错误时，客户端只得到一段无法定位字段的长字符串。

**触发条件：** 用 message 同时承担机器定位、错误分类和人类说明。

**原因：** 字段错误是重复结构，单一字符串没有稳定字段边界。

**后果：** 前端不能把消息放到对应输入框，也无法稳定处理同一字段的多个问题。

**错误示例：**

```json
{"code":"INVALID_REQUEST","message":"title 不能为空并且 dueAt 格式错误"}
```

**正确写法：**

```json
{"code":"TASK_VALIDATION_FAILED","errors":[{"field":"title","code":"NOT_BLANK","message":"标题不能为空"},{"field":"dueAt","code":"INVALID_TIME","message":"截止时间必须包含时区偏移"}]}
```

**影响版本：** JDK 25 与 Java 8 的外部 JSON 都适用。

**验证方式：** 解析完整错误 JSON；`errors` 数组长度必须为 2，每项都同时包含 field、code 和 message。

**来源：** RFC 9457 的 errors 扩展示例；社区问答用于确认这是实际反复出现的设计困难。

### 把 pageToken 当成可编辑页码

**现象：** 客户端解码 token、修改其中 ID，或换了排序条件后继续使用旧 token。

**触发条件：** 把服务端游标当成公开页码或业务数据结构。

**原因：** token 的内部结构由服务端拥有，只在签发它的筛选和排序上下文中有效。

**后果：** 分页结果可能重复、遗漏或因 token 无效而失败。

**错误示例：**

```http
GET /api/v1/tasks?status=DONE&sort=title&pageToken=edited-token
```

**正确写法：**

```http
GET /api/v1/tasks?status=TODO&sort=dueAt,title&pageToken=pgn_4fQ8yN7kL2cV9wX3
```

**影响版本：** 所有 API 客户端都适用。

**验证方式：** 请求下一页时比较筛选与排序参数；除 pageToken 外必须与第一页一致，token 必须原样回传。

**来源：** AIP-158 的不透明 token 与后续请求一致性要求。

### 把 Idempotency-Key 当成 HTTP 自动保证

**现象：** 客户端给 POST 随便加一个 key，就假设任何服务都会自动去重；实际重试后出现了新的
`Location: /api/v1/tasks/TASK-105`。

**触发条件：** 混淆 RFC 9110 的方法幂等语义与 TeamFlow 自己实现的请求头合同。

**原因：** POST 本身不是幂等方法；只有服务端明确保存并比较请求时，项目约定才生效。

**后果：** 网络重试可能重复创建任务，同 key 不同 body 还可能被错误复用。

**错误示例：**

```http
POST /api/v1/tasks
Idempotency-Key: repeated

{"title":"第一次内容"}

HTTP/1.1 201 Created
Location: /api/v1/tasks/TASK-104

POST /api/v1/tasks
Idempotency-Key: repeated

{"title":"第一次内容"}

HTTP/1.1 201 Created
Location: /api/v1/tasks/TASK-105
```

**正确写法：**

```http
POST /api/v1/tasks
Idempotency-Key: create-task-20260818-001

{"title":"冻结统一合同","dueAt":"2026-08-22T18:00:00+08:00","assignee":null}

HTTP/1.1 201 Created
Location: /api/v1/tasks/TASK-104

POST /api/v1/tasks
Idempotency-Key: create-task-20260818-001

{"title":"冻结统一合同","dueAt":"2026-08-22T18:00:00+08:00","assignee":null}

HTTP/1.1 201 Created
Location: /api/v1/tasks/TASK-104

POST /api/v1/tasks
Idempotency-Key: create-task-20260818-001

{"title":"另一份内容","dueAt":"2026-08-22T18:00:00+08:00","assignee":null}

HTTP/1.1 409 Conflict
Content-Type: application/problem+json

{"type":"https://api.teamflow.example/problems/idempotency-conflict","title":"幂等键冲突","status":409,"detail":"同一幂等键不能用于不同请求内容","instance":"/api/v1/tasks","code":"IDEMPOTENCY_KEY_REUSED","traceId":"4bf92f3577b34da6a3ce929d0e0e4736","errors":[]}
```

**影响版本：** 与 Java 版本无关；只有实现并公开该合同的 TeamFlow 写接口适用。

**验证方式：** 先离线核对三段样本：同 key 同 body 的两次 `Location` 都是 `TASK-104`，同 key 不同 body
得到 409 和 `IDEMPOTENCY_KEY_REUSED`。服务实现后再原样发送三次请求，实际结果必须与样本一致。

**来源：** RFC 9110 的幂等方法定义；Idempotency-Key 的具体处理是本课项目约定。

### 在 Java 8 项目中复制 record 和 Jackson 3 包名

**现象：** Java 8 编译器不认识 record，或提示找不到 tools.jackson.databind。

**触发条件：** 只修改 Maven compiler target，没有替换语言写法、依赖坐标和 import。

**原因：** record 在 JDK 16 正式交付；Jackson 3 要求较新 JDK，并更换了 Maven groupId 与 Java 包名。

**后果：** 兼容工程在读取合同前就无法编译。

**错误示例：**

```java
import tools.jackson.databind.json.JsonMapper;

public record TaskResponse(String id, String title) {
}
```

**正确写法：**

```java
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public final class TaskResponse {
    @JsonProperty("id")
    private final String id;
    @JsonProperty("title")
    private final String title;

    /**
     * 创建 Java 8 任务响应。
     *
     * @param id 任务编号
     * @param title 任务标题
     */
    @JsonCreator
    public TaskResponse(
            @JsonProperty("id") String id,
            @JsonProperty("title") String title
    ) {
        this.id = id;
        this.title = title;
    }
}
```

**影响版本：** 错误写法可用于 JDK 25 / Jackson 3，但不适用于 Java 8 / Jackson 2。

**验证方式：** 分别在 JDK 25 与 Java 8 工程编译对应版本；Java 8 版必须只出现 com.fasterxml.jackson 包名。

**来源：** JEP 395 与 Jackson 2.x、3.x 官方 README。
:::

## 九、JDK 25 完整合同程序

### 1. 准备现代版 Maven 项目

在 IDEA 中创建独立 Maven 项目，Project SDK、Module SDK 和 Maven Runner 的 JRE 都选择 JDK 25。
三处要指向同一个 JDK；只改变 Language level 不会改变 Maven 实际使用的 Java。`pom.xml` 使用 Jackson 3.2.1：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.teamflow</groupId>
    <artifactId>unified-api-contract-jdk25</artifactId>
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

在 `src/main/java/com/teamflow/api/TeamFlowUnifiedContract.java` 创建下面的文件。它模拟请求映射、
响应构造和 Problem Details 序列化，不监听端口；打印结果就是可观察的合同核对反馈。

### 2. 创建现代版完整程序

```java
package com.teamflow.api;

import java.util.List;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.json.JsonMapper;

/**
 * 串联并输出 TeamFlow 统一 API 契约的成功与失败表示。
 */
public final class TeamFlowUnifiedContract {
    /**
     * 读取请求样本并输出路径、状态和 JSON 结果。
     *
     * @param args 启动参数，本示例不使用
     * @throws Exception JSON 无法映射时抛出异常
     */
    public static void main(String[] args) throws Exception {
        JsonMapper mapper = JsonMapper.builder()
                .enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                .build();

        String createJson = """
                {"title":"冻结统一合同","dueAt":"2026-08-22T18:00:00+08:00","assignee":null}
                """;
        CreateTaskRequest request = mapper.readValue(createJson, CreateTaskRequest.class);
        TaskResponse task = new TaskResponse(
                "TASK-104",
                request.title(),
                TaskStatus.TODO,
                request.dueAt(),
                request.assignee()
        );
        PageResponse page = new PageResponse(List.of(task), "pgn_4fQ8yN7kL2cV9wX3");
        PageResponse emptyPage = new PageResponse(List.of(), null);
        int errorHttpStatus = 400;
        ProblemResponse problem = new ProblemResponse(
                "https://api.teamflow.example/problems/validation-error",
                "请求参数校验失败",
                errorHttpStatus,
                "有 2 个字段不符合任务创建合同",
                "/api/v1/tasks",
                "TASK_VALIDATION_FAILED",
                "4bf92f3577b34da6a3ce929d0e0e4736",
                List.of(
                        new FieldError("title", "NOT_BLANK", "标题不能为空"),
                        new FieldError("dueAt", "INVALID_TIME", "截止时间必须包含时区偏移")
                )
        );

        String taskJson = mapper.writeValueAsString(task);
        String pageJson = mapper.writeValueAsString(page);
        String emptyPageJson = mapper.writeValueAsString(emptyPage);
        String problemJson = mapper.writeValueAsString(problem);

        System.out.println("基础路径：/api/v1");
        System.out.println("创建请求：POST /api/v1/tasks");
        System.out.println("请求 JSON：" + mapper.writeValueAsString(request));
        System.out.println("创建响应：201 Created");
        System.out.println("Location：/api/v1/tasks/TASK-104");
        System.out.println("成员 JSON：" + taskJson);
        System.out.println("列表响应：200 OK");
        System.out.println("列表 JSON：" + pageJson);
        System.out.println("空列表 JSON：" + emptyPageJson);
        System.out.println("错误 Content-Type：application/problem+json");
        System.out.println("错误状态：" + errorHttpStatus + " Bad Request");
        System.out.println("错误响应：" + problemJson);
        System.out.println("删除响应：204 No Content");
        System.out.println("删除响应体字节数：0");
        System.out.println(
                "状态与正文匹配："
                        + (errorHttpStatus == problem.status() && emptyPage.items().isEmpty())
        );
    }

    /**
     * 保存客户端创建任务时可以决定的字段。
     *
     * @param title 任务标题
     * @param dueAt 带偏移的截止时间
     * @param assignee 可为空的负责人
     */
    public record CreateTaskRequest(String title, String dueAt, String assignee) {
    }

    /**
     * 保存任务对调用方公开的资源表示。
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
     * 保存分页列表的数组和下一页游标。
     *
     * @param items 当前页任务
     * @param nextPageToken 下一页游标，没有下一页时为 null
     */
    public record PageResponse(List<TaskResponse> items, String nextPageToken) {
    }

    /**
     * 保存 RFC 9457 标准成员和 TeamFlow 扩展成员。
     *
     * @param type 问题类型 URI
     * @param title 问题摘要
     * @param status HTTP 状态
     * @param detail 本次失败说明
     * @param instance 问题实例 URI
     * @param code 稳定业务错误码
     * @param traceId 追踪标识
     * @param errors 字段错误列表
     */
    public record ProblemResponse(
            String type,
            String title,
            int status,
            String detail,
            String instance,
            String code,
            String traceId,
            List<FieldError> errors
    ) {
    }

    /**
     * 保存一项可定位的字段错误。
     *
     * @param field 字段名
     * @param code 稳定字段错误码
     * @param message 人类可读说明
     */
    public record FieldError(String field, String code, String message) {
    }

    /**
     * 描述 TeamFlow 的有限任务状态。
     */
    public enum TaskStatus {
        TODO,
        DONE
    }
}
```

在 IDEA 中点击 `main` 左侧的运行图标，或在项目目录执行：

```shell
mvn -q compile exec:java -Dexec.mainClass=com.teamflow.api.TeamFlowUnifiedContract
```

### 3. 观察现代版输出

```text
基础路径：/api/v1
创建请求：POST /api/v1/tasks
请求 JSON：{"title":"冻结统一合同","dueAt":"2026-08-22T18:00:00+08:00","assignee":null}
创建响应：201 Created
Location：/api/v1/tasks/TASK-104
成员 JSON：{"id":"TASK-104","title":"冻结统一合同","status":"TODO","dueAt":"2026-08-22T18:00:00+08:00","assignee":null}
列表响应：200 OK
列表 JSON：{"items":[{"id":"TASK-104","title":"冻结统一合同","status":"TODO","dueAt":"2026-08-22T18:00:00+08:00","assignee":null}],"nextPageToken":"pgn_4fQ8yN7kL2cV9wX3"}
空列表 JSON：{"items":[],"nextPageToken":null}
错误 Content-Type：application/problem+json
错误状态：400 Bad Request
错误响应：{"type":"https://api.teamflow.example/problems/validation-error","title":"请求参数校验失败","status":400,"detail":"有 2 个字段不符合任务创建合同","instance":"/api/v1/tasks","code":"TASK_VALIDATION_FAILED","traceId":"4bf92f3577b34da6a3ce929d0e0e4736","errors":[{"field":"title","code":"NOT_BLANK","message":"标题不能为空"},{"field":"dueAt","code":"INVALID_TIME","message":"截止时间必须包含时区偏移"}]}
删除响应：204 No Content
删除响应体字节数：0
状态与正文匹配：true
```

程序先把创建 JSON 读成不含 `id` 与 `status` 的请求 record，再由服务端模拟补齐任务事实，并把前置合同中的
`dueAt` 原样带入资源表示。成员 JSON、分页 JSON 和空分页 JSON 都由同一个 mapper 序列化；所以空集合实际
输出 `[]`，可选负责人实际输出 `null`，并非把两个概念混为一谈。`errorHttpStatus` 独立模拟 HTTP 状态，
Problem Details 只保存正文中的 `status`；最后的 `true` 证明两个值相等，而不是拿正文常量与自身比较。

## 十、Java 8 完整合同程序

### 1. 准备兼容版 Maven 项目

兼容项目要独立选择 JDK 8：Project SDK、Module SDK、Language level 和 Maven Runner 的 JRE 都使用 Java 8。
不能只把 JDK 25 项目的 Language level 改成 8。Java 8 使用 Jackson 2.12.7.1 的坐标和包名：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.teamflow</groupId>
    <artifactId>unified-api-contract-java8</artifactId>
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

在 Java 8 工程的相同路径创建 `TeamFlowUnifiedContract.java`。它保留现代程序的外部输出和数据流，只有
record、文本块、`List.of`、依赖坐标与包名被替换。

### 2. 创建 Java 8 完整程序

```java
package com.teamflow.api;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * 使用 Java 8 串联并输出 TeamFlow 统一 API 契约的成功与失败表示。
 */
public final class TeamFlowUnifiedContract {
    /**
     * 读取请求样本并输出路径、状态和 JSON 结果。
     *
     * @param args 启动参数，本示例不使用
     * @throws Exception JSON 无法映射时抛出异常
     */
    public static void main(String[] args) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        mapper.enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

        String createJson = "{\"title\":\"冻结统一合同\","
                + "\"dueAt\":\"2026-08-22T18:00:00+08:00\","
                + "\"assignee\":null}";
        CreateTaskRequest request = mapper.readValue(createJson, CreateTaskRequest.class);
        TaskResponse task = new TaskResponse(
                "TASK-104",
                request.title,
                TaskStatus.TODO,
                request.dueAt,
                request.assignee
        );
        PageResponse page = new PageResponse(
                Collections.singletonList(task),
                "pgn_4fQ8yN7kL2cV9wX3"
        );
        PageResponse emptyPage = new PageResponse(Collections.<TaskResponse>emptyList(), null);
        int errorHttpStatus = 400;
        ProblemResponse problem = new ProblemResponse(
                "https://api.teamflow.example/problems/validation-error",
                "请求参数校验失败",
                errorHttpStatus,
                "有 2 个字段不符合任务创建合同",
                "/api/v1/tasks",
                "TASK_VALIDATION_FAILED",
                "4bf92f3577b34da6a3ce929d0e0e4736",
                Arrays.asList(
                        new FieldError("title", "NOT_BLANK", "标题不能为空"),
                        new FieldError("dueAt", "INVALID_TIME", "截止时间必须包含时区偏移")
                )
        );

        String taskJson = mapper.writeValueAsString(task);
        String pageJson = mapper.writeValueAsString(page);
        String emptyPageJson = mapper.writeValueAsString(emptyPage);
        String problemJson = mapper.writeValueAsString(problem);

        System.out.println("基础路径：/api/v1");
        System.out.println("创建请求：POST /api/v1/tasks");
        System.out.println("请求 JSON：" + mapper.writeValueAsString(request));
        System.out.println("创建响应：201 Created");
        System.out.println("Location：/api/v1/tasks/TASK-104");
        System.out.println("成员 JSON：" + taskJson);
        System.out.println("列表响应：200 OK");
        System.out.println("列表 JSON：" + pageJson);
        System.out.println("空列表 JSON：" + emptyPageJson);
        System.out.println("错误 Content-Type：application/problem+json");
        System.out.println("错误状态：" + errorHttpStatus + " Bad Request");
        System.out.println("错误响应：" + problemJson);
        System.out.println("删除响应：204 No Content");
        System.out.println("删除响应体字节数：0");
        System.out.println(
                "状态与正文匹配："
                        + (errorHttpStatus == problem.status && emptyPage.items.isEmpty())
        );
    }

    /**
     * 保存客户端创建任务时可以决定的字段。
     */
    public static final class CreateTaskRequest {
        @JsonProperty("title")
        private final String title;
        @JsonProperty("dueAt")
        private final String dueAt;
        @JsonProperty("assignee")
        private final String assignee;

        /**
         * 创建 Java 8 任务创建请求。
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
     * 保存任务对调用方公开的资源表示。
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
         * 创建 Java 8 任务响应。
         *
         * @param id 服务端生成的任务编号
         * @param title 任务标题
         * @param status 任务状态
         * @param dueAt 带偏移的截止时间
         * @param assignee 可为空的负责人
         */
        @JsonCreator
        public TaskResponse(
                @JsonProperty("id") String id,
                @JsonProperty("title") String title,
                @JsonProperty("status") TaskStatus status,
                @JsonProperty("dueAt") String dueAt,
                @JsonProperty("assignee") String assignee
        ) {
            this.id = id;
            this.title = title;
            this.status = status;
            this.dueAt = dueAt;
            this.assignee = assignee;
        }
    }

    /**
     * 保存分页列表的数组和下一页游标。
     */
    public static final class PageResponse {
        @JsonProperty("items")
        private final List<TaskResponse> items;
        @JsonProperty("nextPageToken")
        private final String nextPageToken;

        /**
         * 创建 Java 8 分页响应。
         *
         * @param items 当前页任务
         * @param nextPageToken 下一页游标，没有下一页时为 null
         */
        @JsonCreator
        public PageResponse(
                @JsonProperty("items") List<TaskResponse> items,
                @JsonProperty("nextPageToken") String nextPageToken
        ) {
            this.items = items;
            this.nextPageToken = nextPageToken;
        }
    }

    /**
     * 保存 RFC 9457 标准成员和 TeamFlow 扩展成员。
     */
    public static final class ProblemResponse {
        @JsonProperty("type")
        private final String type;
        @JsonProperty("title")
        private final String title;
        @JsonProperty("status")
        private final int status;
        @JsonProperty("detail")
        private final String detail;
        @JsonProperty("instance")
        private final String instance;
        @JsonProperty("code")
        private final String code;
        @JsonProperty("traceId")
        private final String traceId;
        @JsonProperty("errors")
        private final List<FieldError> errors;

        /**
         * 创建 Java 8 Problem Details 响应。
         *
         * @param type 问题类型 URI
         * @param title 问题摘要
         * @param status HTTP 状态
         * @param detail 本次失败说明
         * @param instance 问题实例 URI
         * @param code 稳定业务错误码
         * @param traceId 追踪标识
         * @param errors 字段错误列表
         */
        @JsonCreator
        public ProblemResponse(
                @JsonProperty("type") String type,
                @JsonProperty("title") String title,
                @JsonProperty("status") int status,
                @JsonProperty("detail") String detail,
                @JsonProperty("instance") String instance,
                @JsonProperty("code") String code,
                @JsonProperty("traceId") String traceId,
                @JsonProperty("errors") List<FieldError> errors
        ) {
            this.type = type;
            this.title = title;
            this.status = status;
            this.detail = detail;
            this.instance = instance;
            this.code = code;
            this.traceId = traceId;
            this.errors = errors;
        }
    }

    /**
     * 保存一项可定位的字段错误。
     */
    public static final class FieldError {
        @JsonProperty("field")
        private final String field;
        @JsonProperty("code")
        private final String code;
        @JsonProperty("message")
        private final String message;

        /**
         * 创建 Java 8 字段错误。
         *
         * @param field 字段名
         * @param code 稳定字段错误码
         * @param message 人类可读说明
         */
        @JsonCreator
        public FieldError(
                @JsonProperty("field") String field,
                @JsonProperty("code") String code,
                @JsonProperty("message") String message
        ) {
            this.field = field;
            this.code = code;
            this.message = message;
        }
    }

    /**
     * 描述 TeamFlow 的有限任务状态。
     */
    public enum TaskStatus {
        TODO,
        DONE
    }
}
```

使用 Java 8 项目的相同命令运行：

```shell
mvn -q compile exec:java -Dexec.mainClass=com.teamflow.api.TeamFlowUnifiedContract
```

### 3. 两版差异和预期结果

Java 8 版完整程序必须逐行得到上一节相同的控制台输出。对外合同没有因为兼容实现而改变：路径仍是
`/api/v1`，字段仍是 lowerCamelCase，空页仍是 `items: []` 与 `nextPageToken: null`，错误仍是
`application/problem+json`。

真实差异只有以下几处：

| 位置 | JDK 25 | Java 8 |
| --- | --- | --- |
| 数据载体 | `record` | 带 final 字段和构造器的普通类 |
| 多行 JSON | 文本块 | 字符串拼接和转义 |
| 集合工厂 | `List.of` | `Collections.singletonList` 与 `Collections.emptyList` |
| Jackson | `tools.jackson.core:jackson-databind:3.2.1` | `com.fasterxml.jackson.core:jackson-databind:2.12.7.1` |
| mapper 包名 | `tools.jackson.databind` | `com.fasterxml.jackson.databind` |

普通 Java 8 类只实现本程序需要的字段读取和 JSON 映射，没有声称复制 record 自动提供的全部
`equals`、`hashCode` 和 `toString` 合同。两版都能输出相同 JSON，才足以证明本课要求的外部数据合同一致。

## 十一、独立练习

### 1. 任务与验收

:::exercise
### 设计项目任务的统一响应

**要求：** 创建 `ProjectTaskContractExercise`，为项目 `PRJ-7` 设计三条可核对的合同：
`POST /api/v1/projects/PRJ-7/tasks` 创建任务，`GET /api/v1/projects/PRJ-7/tasks/TASK-205` 查询成员，
`DELETE /api/v1/projects/PRJ-7/tasks/TASK-205` 删除成员。创建请求只包含 title“补齐课程目录”和 assignee
`lin`，服务端生成字符串 ID `TASK-205`、所属项目 `PRJ-7` 和 `TODO` 状态；创建返回 201 与 `Location`，
查询返回同一任务 JSON，删除返回 204 且正文长度为 0。响应还要输出一个字段校验错误对象，要求状态行与
Problem Details 的 status 都为 400。JDK 25 使用 record 与 Jackson 3，Java 8 使用普通不可变类与 Jackson 2。

**验收：** 两版都能完整编译运行；请求 JSON 不包含 id、projectId 或 status；响应 JSON 包含 TASK-205、PRJ-7
和 TODO；Location 与成员查询 URI 逐字相同；最终输出 `合同核对：true` 和 `删除响应体字节数：0`。

**参考答案：** 两个版本的完整实现见后文。先独立写请求与响应对象，再逐行比较两个版本的外部合同。
:::

### 2. JDK 25 完整参考实现

```java
package com.teamflow.api;

import java.nio.charset.StandardCharsets;
import java.util.List;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.json.JsonMapper;

/**
 * 核对项目任务创建、查询、错误和删除合同。
 */
public final class ProjectTaskContractExercise {
    /**
     * 生成项目任务的请求、响应和错误样本。
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
        String memberUri = "/api/v1/projects/PRJ-7/tasks/TASK-205";
        ProjectTaskResponse response = new ProjectTaskResponse(
                "TASK-205",
                "PRJ-7",
                request.title(),
                TaskStatus.TODO,
                request.assignee()
        );
        String responseJson = mapper.writeValueAsString(response);
        int errorHttpStatus = 400;
        ProblemResponse problem = new ProblemResponse(
                "https://api.teamflow.example/problems/validation-error",
                "请求参数校验失败",
                errorHttpStatus,
                "项目任务标题不能为空",
                "/api/v1/projects/PRJ-7/tasks",
                "TASK_VALIDATION_FAILED",
                "4bf92f3577b34da6a3ce929d0e0e4736",
                List.of(new FieldError("title", "NOT_BLANK", "标题不能为空"))
        );
        boolean contractMatches = memberUri.equals(
                        "/api/v1/projects/PRJ-7/tasks/" + response.id()
                )
                && responseJson.contains("\"projectId\":\"PRJ-7\"")
                && responseJson.contains("\"status\":\"TODO\"")
                && !mapper.writeValueAsString(request).contains("TASK-205")
                && errorHttpStatus == problem.status();

        System.out.println("创建项目任务：POST /api/v1/projects/PRJ-7/tasks");
        System.out.println("请求 JSON：" + mapper.writeValueAsString(request));
        System.out.println("创建响应：201 Created");
        System.out.println("Location：" + memberUri);
        System.out.println("响应 JSON：" + responseJson);
        System.out.println("成员查询：GET " + memberUri);
        System.out.println("查询响应：200 OK");
        System.out.println("查询 JSON：" + responseJson);
        System.out.println(
                "错误响应："
                        + errorHttpStatus
                        + " Bad Request / "
                        + mapper.writeValueAsString(problem)
        );
        System.out.println("删除项目任务：DELETE " + memberUri);
        System.out.println("删除响应：204 No Content");
        System.out.println("删除响应体字节数：" + "".getBytes(StandardCharsets.UTF_8).length);
        System.out.println("合同核对：" + contractMatches);
    }

    /**
     * 保存创建项目任务时客户端提交的字段。
     *
     * @param title 任务标题
     * @param assignee 负责人
     */
    public record CreateProjectTaskRequest(String title, String assignee) {
    }

    /**
     * 保存项目任务公开表示。
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
     * 保存一项 Problem Details 字段错误。
     *
     * @param field 字段名
     * @param code 稳定错误码
     * @param message 人类消息
     */
    public record FieldError(String field, String code, String message) {
    }

    /**
     * 保存练习需要的错误响应。
     *
     * @param type 问题类型
     * @param title 摘要
     * @param status HTTP 状态
     * @param detail 失败说明
     * @param instance 问题位置
     * @param code 业务错误码
     * @param traceId 追踪标识
     * @param errors 字段错误
     */
    public record ProblemResponse(
            String type,
            String title,
            int status,
            String detail,
            String instance,
            String code,
            String traceId,
            List<FieldError> errors
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
mvn -q compile exec:java -Dexec.mainClass=com.teamflow.api.ProjectTaskContractExercise
```

### 3. Java 8 完整参考实现

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
 * 使用 Java 8 核对项目任务创建、查询、错误和删除合同。
 */
public final class ProjectTaskContractExercise {
    /**
     * 生成项目任务的请求、响应和错误样本。
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
        String memberUri = "/api/v1/projects/PRJ-7/tasks/TASK-205";
        ProjectTaskResponse response = new ProjectTaskResponse(
                "TASK-205",
                "PRJ-7",
                request.title,
                TaskStatus.TODO,
                request.assignee
        );
        String responseJson = mapper.writeValueAsString(response);
        int errorHttpStatus = 400;
        ProblemResponse problem = new ProblemResponse(
                "https://api.teamflow.example/problems/validation-error",
                "请求参数校验失败",
                errorHttpStatus,
                "项目任务标题不能为空",
                "/api/v1/projects/PRJ-7/tasks",
                "TASK_VALIDATION_FAILED",
                "4bf92f3577b34da6a3ce929d0e0e4736",
                Collections.singletonList(new FieldError("title", "NOT_BLANK", "标题不能为空"))
        );
        boolean contractMatches = memberUri.equals(
                        "/api/v1/projects/PRJ-7/tasks/" + response.id
                )
                && responseJson.contains("\"projectId\":\"PRJ-7\"")
                && responseJson.contains("\"status\":\"TODO\"")
                && !mapper.writeValueAsString(request).contains("TASK-205")
                && errorHttpStatus == problem.status;

        System.out.println("创建项目任务：POST /api/v1/projects/PRJ-7/tasks");
        System.out.println("请求 JSON：" + mapper.writeValueAsString(request));
        System.out.println("创建响应：201 Created");
        System.out.println("Location：" + memberUri);
        System.out.println("响应 JSON：" + responseJson);
        System.out.println("成员查询：GET " + memberUri);
        System.out.println("查询响应：200 OK");
        System.out.println("查询 JSON：" + responseJson);
        System.out.println(
                "错误响应："
                        + errorHttpStatus
                        + " Bad Request / "
                        + mapper.writeValueAsString(problem)
        );
        System.out.println("删除项目任务：DELETE " + memberUri);
        System.out.println("删除响应：204 No Content");
        System.out.println("删除响应体字节数：" + "".getBytes(StandardCharsets.UTF_8).length);
        System.out.println("合同核对：" + contractMatches);
    }

    /**
     * 保存创建项目任务时客户端提交的字段。
     */
    public static final class CreateProjectTaskRequest {
        @JsonProperty("title")
        private final String title;
        @JsonProperty("assignee")
        private final String assignee;

        /**
         * 创建 Java 8 项目任务请求。
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
     * 保存项目任务公开表示。
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
         * 创建 Java 8 项目任务响应。
         *
         * @param id 任务编号
         * @param projectId 所属项目编号
         * @param title 任务标题
         * @param status 任务状态
         * @param assignee 负责人
         */
        @JsonCreator
        public ProjectTaskResponse(
                @JsonProperty("id") String id,
                @JsonProperty("projectId") String projectId,
                @JsonProperty("title") String title,
                @JsonProperty("status") TaskStatus status,
                @JsonProperty("assignee") String assignee
        ) {
            this.id = id;
            this.projectId = projectId;
            this.title = title;
            this.status = status;
            this.assignee = assignee;
        }
    }

    /**
     * 保存练习需要的字段错误。
     */
    public static final class FieldError {
        @JsonProperty("field")
        private final String field;
        @JsonProperty("code")
        private final String code;
        @JsonProperty("message")
        private final String message;

        /**
         * 创建 Java 8 字段错误。
         *
         * @param field 字段名
         * @param code 稳定错误码
         * @param message 人类消息
         */
        @JsonCreator
        public FieldError(
                @JsonProperty("field") String field,
                @JsonProperty("code") String code,
                @JsonProperty("message") String message
        ) {
            this.field = field;
            this.code = code;
            this.message = message;
        }
    }

    /**
     * 保存练习需要的错误响应。
     */
    public static final class ProblemResponse {
        @JsonProperty("type")
        private final String type;
        @JsonProperty("title")
        private final String title;
        @JsonProperty("status")
        private final int status;
        @JsonProperty("detail")
        private final String detail;
        @JsonProperty("instance")
        private final String instance;
        @JsonProperty("code")
        private final String code;
        @JsonProperty("traceId")
        private final String traceId;
        @JsonProperty("errors")
        private final List<FieldError> errors;

        /**
         * 创建 Java 8 Problem Details 响应。
         *
         * @param type 问题类型
         * @param title 摘要
         * @param status HTTP 状态
         * @param detail 失败说明
         * @param instance 问题位置
         * @param code 业务错误码
         * @param traceId 追踪标识
         * @param errors 字段错误
         */
        @JsonCreator
        public ProblemResponse(
                @JsonProperty("type") String type,
                @JsonProperty("title") String title,
                @JsonProperty("status") int status,
                @JsonProperty("detail") String detail,
                @JsonProperty("instance") String instance,
                @JsonProperty("code") String code,
                @JsonProperty("traceId") String traceId,
                @JsonProperty("errors") List<FieldError> errors
        ) {
            this.type = type;
            this.title = title;
            this.status = status;
            this.detail = detail;
            this.instance = instance;
            this.code = code;
            this.traceId = traceId;
            this.errors = errors;
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

使用 Java 8 版 POM，以相同的 main class 命令运行。两个版本都应输出：

```text
创建项目任务：POST /api/v1/projects/PRJ-7/tasks
请求 JSON：{"title":"补齐课程目录","assignee":"lin"}
创建响应：201 Created
Location：/api/v1/projects/PRJ-7/tasks/TASK-205
响应 JSON：{"id":"TASK-205","projectId":"PRJ-7","title":"补齐课程目录","status":"TODO","assignee":"lin"}
成员查询：GET /api/v1/projects/PRJ-7/tasks/TASK-205
查询响应：200 OK
查询 JSON：{"id":"TASK-205","projectId":"PRJ-7","title":"补齐课程目录","status":"TODO","assignee":"lin"}
错误响应：400 Bad Request / {"type":"https://api.teamflow.example/problems/validation-error","title":"请求参数校验失败","status":400,"detail":"项目任务标题不能为空","instance":"/api/v1/projects/PRJ-7/tasks","code":"TASK_VALIDATION_FAILED","traceId":"4bf92f3577b34da6a3ce929d0e0e4736","errors":[{"field":"title","code":"NOT_BLANK","message":"标题不能为空"}]}
删除项目任务：DELETE /api/v1/projects/PRJ-7/tasks/TASK-205
删除响应：204 No Content
删除响应体字节数：0
合同核对：true
```

## 十二、把合同带回 TeamFlow

### 1. 本课新增的是边界，不是服务器

完成本课后，TeamFlow 的 Web 基础阶段拥有一份可以交给后续实现的最小合同：

```text
请求 method + URI + headers + JSON
              |
              v
       HTTP 状态与响应 headers
              |
              v
       资源表示 / 分页表示 / Problem Details
```

后续 Controller 可以把这份合同映射成 DTO，校验器可以产生 `errors`，统一异常处理器可以填充
`application/problem+json`，但它们都不能重新发明 `/api/v1`、`items`、`traceId` 或状态选择。

### 2. 完成本课后的自检

- 我能说明为什么所有业务路径从 `/api/v1` 开始，而不是把每次发布号写进路径。
- 我能区分缺失、null、空数组和空字符串，并为每种状态给出 JSON 样本。
- 我知道成员、分页列表和 204 成功响应各自的 body 形状。
- 我能同时读取 HTTP 状态和 Problem Details 的 `status`，并确保它们相等。
- 我知道 `code` 适合机器分支，`title`、`detail` 和字段 message 不能替代稳定 code。
- 我会把 `pageToken` 当成不透明游标，下一页保持原筛选和排序条件。
- 我知道 TeamFlow 的 `Idempotency-Key` 是项目约定，不是 HTTP 自动提供的 POST 保证。
- 我能用 .http 或 curl 写出同一条创建请求，并在服务尚未启动时区分连接失败和合同错误。
- 我能分别运行 JDK 25 与 Java 8 程序，并得到逐行一致的外部合同输出。
