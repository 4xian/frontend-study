# REST 资源、状态码、分页参数与幂等请求官方研究稿

## 冻结课程合同

| 项目 | 冻结值 |
| --- | --- |
| 执行阶段 | Phase C / I-09 官方调研 |
| 课程 ID | `backend.java.learn.intermediate.transactions-and-idempotency` |
| 标题 | REST 资源、状态码、分页参数与幂等请求 |
| 阶段 | `intermediate`；I-09 |
| 预计时长 | 150 分钟 |
| 唯一前置 | `backend.java.learn.intermediate.spring-mvc-and-servlet-boundaries`（I-08） |
| 现代基线 | Java 25、Spring Boot 4.1.0、Spring Framework 7.0.8 |
| 兼容基线 | Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE |
| 本批唯一写入 | `docs/research/backend/java/intermediate/transactions-and-idempotency.md` |
| 本批不授权 | 正文、track、loader、manifest、signoff、fixture、浏览器或下一课改动 |

本课复用稳定 ID，但不复用旧标题、旧前置、旧时长或旧知识边界。Phase A 已把原课程中的数据库事务与
回滚移出 I-09，并把原标识符课程中的分页合同移入 I-09。本研究只冻结 HTTP 与 Spring MVC 层的资源、
响应和重复请求合同；研究完成不表示当前运行时页面已经迁移。

## Live 快照核对

| 证据 | 当前事实 | 对本批的含义 |
| --- | --- | --- |
| Phase A freeze | I-09 标题、150 分钟、稳定 ID 与唯一前置 I-08 已冻结 | 新研究稿以此为最高课程边界 |
| Phase A 5.1 | 分页参数、稳定排序要求、分页响应和越界行为进入 I-09 | 只研究接口合同，不研究数据库分页实现 |
| 当前正文 | 仍是 1057 行、300 分钟的“事务边界、幂等与失败回退”，且前置为 MyBatis 与异常课 | 正文属于待后续重写的旧实现，本批不修改 |
| 当前 track | 同一稳定 ID 仍为 `available` | 只记录现状，不把研究稿误报为运行时发布 |
| 当前 loader | 仍加载 `learn/transactions-and-idempotency.md` | 本批不删除、不重排、不重新注册 |
| 当前 signoff | 记录旧事务课程的 `implementation-complete / lesson-passed` | 只证明旧快照，不证明新 I-09 已实现或验收 |
| 当前旧研究稿 | 以事务、JDBC、PostgreSQL 与 Redis 为主 | 本文件按 Phase A 新边界完全覆盖 |

旧 signoff、track 的 `available` 和 loader 的存在都不能替代本轮课程迁移证据。后续正文批必须重新冻结
正文 SHA、重新执行反馈环与页面 Gate，并生成绑定新标题和新范围的独立 signoff。

## 范围与排除项

### 本课必须覆盖

1. 用集合资源 `/tasks` 与成员资源 `/tasks/{id}` 建立 REST 资源模型。
2. 让 HTTP 方法表达读取、创建与替换语义，不把动作名称堆进 URI。
3. 为成功、输入错误、资源不存在、状态冲突和条件失败选择稳定状态码。
4. 创建成功返回 `201 Created`、新资源 `Location` 与当前强 ETag。
5. 冻结 `page`、`size`、稳定排序、分页响应字段和越界行为。
6. 使用 ETag 与 `If-Match` 防止旧表示覆盖新状态。
7. 为必须携带条件头的更新冻结 `428`，为条件不匹配冻结 `412`。
8. 为 POST 冻结应用级幂等键、请求指纹、首次处理、完成后重放和冲突语义。
9. 使用 Spring MVC `@RequestParam`、`@RequestHeader`、`ResponseEntity` 与 `MockMvc` 建立双版本反馈环。

### 本课明确不包含

- SQL `offset`、keyset/cursor、索引、`EXPLAIN` 或查询计划；
- JDBC 或 Spring 数据库事务、提交、回滚、隔离级别、锁与 outbox；
- Redis 去重、缓存、分布式锁或过期策略；
- 数据库持久化幂等记录、唯一约束或跨实例并发实现；
- 认证授权、Problem Details 完整教学、Bean Validation 注解细节；
- 吞吐、缓存命中率或分页性能结论。

后续实现可以用单进程内存仓储形成 HTTP 合同反馈，不得把该 fixture 宣称为生产级幂等或并发保证。

## 调研方法与来源等级

- 核验日期：2026-08-15。
- 严格使用 Tavily 定位候选，再回到 RFC Editor、IANA、IETF Datatracker 与 Spring 官方直接页面。
- 最终采用 22 个直接 URL；每个 URL 都以
  `curl -L --fail --silent --show-error` 单独核验，结果全部为 HTTP 200。
- HTTP 语义以 RFC 9110、RFC 6585、RFC 8288 与 IANA 注册表为 A 级证据。
- Spring MVC API、测试方式和版本边界以当前与 5.2.15 归档官方文档为 B 级证据。
- Idempotency-Key `-07` 是已过期 Internet-Draft，只能作为设计线索，不能写成 RFC 或现行强制协议。
- 分页字段、页码起点、越界响应和幂等记录生命周期没有通用 HTTP 强制格式，必须明确标为本课应用合同。

## 官方来源与可达性

| ID | 直接页面 | 等级与适用范围 | HTTP | 支持的结论 |
| --- | --- | --- | ---: | --- |
| `rfc9110-resources` | [RFC 9110 3.1 Resources](https://www.rfc-editor.org/rfc/rfc9110.html#section-3.1) | A；HTTP Semantics | 200 | 请求目标是资源；资源标识与方法语义分离 |
| `rfc9110-methods` | [RFC 9110 9 Methods](https://www.rfc-editor.org/rfc/rfc9110.html#section-9) | A；HTTP Semantics | 200 | GET、POST、PUT、DELETE 与幂等方法的协议语义 |
| `rfc9110-location` | [RFC 9110 10.2.2 Location](https://www.rfc-editor.org/rfc/rfc9110.html#section-10.2.2) | A；HTTP Semantics | 200 | 201 的 Location 指向请求创建的主要资源 |
| `rfc9110-status` | [RFC 9110 15 Status Codes](https://www.rfc-editor.org/rfc/rfc9110.html#section-15) | A；HTTP Semantics | 200 | 200、201、400、404、409、412 与 422 的含义 |
| `rfc9110-etag` | [RFC 9110 8.8.3 ETag](https://www.rfc-editor.org/rfc/rfc9110.html#section-8.8.3) | A；HTTP Semantics | 200 | ETag 是不透明、带引号的表示验证器；强验证器是默认形式 |
| `rfc9110-if-match` | [RFC 9110 13.1.1 If-Match](https://www.rfc-editor.org/rfc/rfc9110.html#section-13.1.1) | A；HTTP Semantics | 200 | If-Match 使用强比较，条件为假时不得执行更新，可返回 412 |
| `rfc6585-428` | [RFC 6585 3 428 Precondition Required](https://www.rfc-editor.org/rfc/rfc6585.html#section-3) | A；HTTP 扩展状态码 | 200 | 服务端可要求请求带条件，以防止 lost update |
| `rfc8288-links` | [RFC 8288 2 Links](https://www.rfc-editor.org/rfc/rfc8288.html#section-2) | A；Web Linking | 200 | 链接由上下文、目标与关系类型组成，可表达分页导航 |
| `iana-link-relations` | [IANA Link Relation Types](https://www.iana.org/assignments/link-relations/link-relations.xhtml) | A；IANA 注册表 | 200 | `next` 与 `prev` 是已登记关系类型 |
| `idempotency-key-status` | [IETF Datatracker status](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/) | E；状态事实 | 200 | 最新修订为 `-07`，已于 2026-04-18 过期并归档 |
| `idempotency-key-07` | [Idempotency-Key draft -07](https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-idempotency-key-header-07) | E；过期工作草案 | 200 | 键唯一性、指纹、已完成重放、不同载荷 422 与处理中冲突 409 的设计线索 |
| `spring-request-param` | [Spring MVC RequestParam](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestparam.html) | B；Spring Framework 7.0.8 | 200 | 请求参数绑定与类型转换 |
| `spring-response-entity` | [Spring MVC ResponseEntity](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/responseentity.html) | B；Spring Framework 7.0.8 | 200 | Controller 可同时控制状态、响应头与响应体 |
| `spring-servlet-web-request` | [ServletWebRequest API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/context/request/ServletWebRequest.html) | B；Spring Framework 7.0.8 | 200 | 条件 GET/HEAD 与 POST/PUT/DELETE 可由 `checkNotModified` 处理 |
| `spring-mockmvc` | [Spring MockMvc](https://docs.spring.io/spring-framework/reference/testing/mockmvc.html) | B；Spring Framework 7.0.8 | 200 | 使用 mock 请求响应执行完整 Spring MVC 请求处理 |
| `spring-5-web` | [Spring Framework 5.2.15 Web](https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/web.html#mvc-ann-requestparam) | B；Spring Framework 5.2.15 | 200 | 旧线存在 RequestParam、ResponseEntity 与条件请求能力 |
| `spring-5-testing` | [Spring Framework 5.2.15 Testing](https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/testing.html#spring-mvc-test-framework) | B；Spring Framework 5.2.15 | 200 | 旧线可用 MockMvc 执行同一 MVC 合同矩阵 |
| `boot-4-system` | [Spring Boot System Requirements](https://docs.spring.io/spring-boot/system-requirements.html) | B；Spring Boot 4.1.0 | 200 | 至少 Java 17，支持至 Java 26，要求 Spring Framework 7.0.8+ |
| `boot-4-build-systems` | [Spring Boot Build Systems](https://docs.spring.io/spring-boot/4.1/reference/using/build-systems.html) | B；Spring Boot 4.1 | 200 | `spring-boot-starter-web` 已弃用，现代 MVC 工程使用 `spring-boot-starter-webmvc` |
| `boot-2-3-system` | [Spring Boot 2.3.12 System Requirements](https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#system-requirements) | B；Spring Boot 2.3.12.RELEASE | 200 | Java 8 与 Spring Framework 5.2.15.RELEASE 的旧线边界 |
| `owasp-input-validation` | [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) | 安全标准；不可信输入 | 200 | 结构化字符串应限制长度并使用覆盖完整输入的允许字符规则 |
| `owasp-logging` | [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) | 安全标准；日志数据 | 200 | 日志通常不应直接记录访问令牌、认证口令和敏感个人数据 |

## 规范事实与应用选择

### 规范直接规定的事实

1. URI 标识目标资源，HTTP 方法表达对资源执行的请求语义；URI 文本本身不能改变方法语义。
2. POST 可以请求集合资源创建一个由服务端分配标识的新资源。
3. POST 创建成功时应返回 `201 Created`，并用 `Location` 标识主要新资源。
4. GET、PUT、DELETE 和安全方法具有 RFC 9110 定义的幂等语义；POST 只有在应用另行建立合同后才可安全重试。
5. ETag 是表示的验证器，不是数据库锁；强 ETag 使用带引号的不透明值。
6. `If-Match` 使用强比较；条件不匹配时服务端不得应用更新，可返回 `412 Precondition Failed`。
7. 服务端要求条件请求但客户端没提供条件时，可返回 `428 Precondition Required`。
8. `409 Conflict` 表示请求与目标资源当前状态冲突，响应应给出足够信息帮助客户端识别冲突。
9. `next` 与 `prev` 是 IANA 已登记的链接关系，但 HTTP 没有规定分页 JSON 必须有哪些字段。

### 本课冻结的应用合同

以下内容是本课为了可学习、可复跑而选择的 API 合同，不得包装成 HTTP 通用规则：

- 集合路径为 `/tasks`，成员路径为 `/tasks/{id}`；
- 页码从 0 开始，默认 `page=0`、`size=20`，`size` 合法范围为 1 至 100；
- 列表始终按唯一整数 `id` 升序，避免相同排序值造成跨页重复或遗漏；
- 分页响应固定包含 `items`、`page`、`size`、`totalItems`、`totalPages` 与 `links`；
- 空集合的 `page=0` 返回 200 和空 `items`；非负但不存在的页返回 404；负页码或非法 `size` 返回 400；
- `links.self` 始终存在，`links.next` 与 `links.prev` 不存在时为 `null`；
- POST `/tasks` 强制携带应用自定义的 `Idempotency-Key`；本课不声称它已经标准化；
- 幂等作用域固定为“同一个 POST `/tasks` 操作 + 同一个键”，fixture 不引入租户或认证维度；
- 首次请求保存请求指纹、处理中状态和最终响应；已完成重复请求重放第一次的状态、Location、ETag 与响应体；
- 同一键配不同请求指纹返回 422；同一键仍在处理时返回 409；缺少或格式非法的键返回 400；
- 更新成员资源必须携带 `If-Match`；缺少返回 428，不匹配返回 412，匹配后更新并返回新 ETag。

### 分页请求与响应冻结

请求示例：

```http
GET /tasks?page=0&size=2 HTTP/1.1
Host: api.example.test
Accept: application/json
```

响应示例：

```json
{
  "items": [
    { "id": 1, "title": "read RFC", "completed": false, "version": 1 },
    { "id": 2, "title": "write contract", "completed": false, "version": 1 }
  ],
  "page": 0,
  "size": 2,
  "totalItems": 3,
  "totalPages": 2,
  "links": {
    "self": "/tasks?page=0&size=2",
    "next": "/tasks?page=1&size=2",
    "prev": null
  }
}
```

越界矩阵：

| 输入 | 响应 | 稳定含义 |
| --- | --- | --- |
| `page=0&size=20`，集合为空 | 200，`items=[]`、`totalPages=0` | 第一个集合视图合法 |
| `page=1&size=20`，集合为空 | 404，`code=PAGE_OUT_OF_RANGE` | 合法参数，但请求页不存在 |
| `page=2&size=2`，总页数为 2 | 404，`code=PAGE_OUT_OF_RANGE` | 页码等于总页数已经越界 |
| `page=-1` | 400，`code=INVALID_PAGE` | 参数值本身非法 |
| `size=0` 或 `size=101` | 400，`code=INVALID_SIZE` | 超出本课冻结范围 |

本课不使用 SQL 解释这些结果。fixture 先对内存列表按 `id` 排序，再按页码切片；这只验证 HTTP 合同。

### 创建、重放与冲突冻结

首次创建：

```http
POST /tasks HTTP/1.1
Host: api.example.test
Content-Type: application/json
Idempotency-Key: task-create-001

{ "title": "read RFC", "completed": false }
```

```http
HTTP/1.1 201 Created
Location: /tasks/1
ETag: "task-1-v1"
Content-Type: application/json

{ "id": 1, "title": "read RFC", "completed": false, "version": 1 }
```

请求指纹按以下顺序生成：

1. JSON 先绑定为明确 DTO，本课不对原始 JSON 文本直接哈希。
2. 使用固定字段顺序 `title`、`completed` 生成长度前缀的规范字符串。
3. 使用 Java 8 已有的 `MessageDigest` SHA-256 与 URL-safe Base64 生成摘要。
4. 幂等记录保存 `key`、`fingerprint`、`PROCESSING|COMPLETED` 与第一次完整响应快照。
5. 相同键和相同指纹在完成后返回第一次响应；相同键但不同指纹返回 422。

同一业务 JSON 即使空白或字段顺序不同，也会得到相同 DTO 指纹；业务字段不同一定进入冲突路径。哈希只用于稳定
比较，不是身份认证，也不应包含令牌、口令或其他秘密。

Idempotency-Key `-07` 草案采用 Structured Field String 语法，但它已经过期。本课只借鉴“键 + 指纹 +
重放/冲突”的概念，示例 header 值与生命周期均属于本 API 自定义合同，正文必须公开说明这一点。

### ETag 与 If-Match 冻结

成员资源的强 ETag 固定为 `"task-{id}-v{version}"`。它由服务端生成，客户端只能原样回传，不能解析后猜测
下一版本。读取或创建返回当前 ETag；匹配更新成功后版本加一并返回新 ETag。

```http
PUT /tasks/1 HTTP/1.1
Host: api.example.test
Content-Type: application/json
If-Match: "task-1-v1"

{ "title": "read RFC", "completed": true }
```

| 条件 | 响应 | 状态变化 |
| --- | --- | --- |
| 缺少 `If-Match` | 428 | 不执行更新 |
| ETag 已过期或为弱验证器 | 412 | 不执行更新 |
| 强 ETag 匹配 | 200 + `ETag: "task-1-v2"` | 原子比较后更新一次 |
| 资源不存在 | 404 | 不创建新成员资源 |

实现反馈环优先让 Spring 的 `ServletWebRequest.checkNotModified(currentEtag)` 处理完整条件头语义，避免用
简单字符串拆分错误处理合法的 ETag 列表。缺少 `If-Match` 的 428 检查必须发生在修改前。内存 service 的
比较与写入放在同一个同步方法中；这仍不代表跨进程或数据库原子保证。

## 零基础知识点拆分

正式正文必须把以下 11 个小点逐一展开，不得合并成一段术语堆叠。

### 1. 资源与表示

- **它是什么：** 资源是请求的目标，表示是某一时刻用于传输该资源状态的数据。
- **有什么作用：** 区分“任务本身”和“返回的 JSON”，避免把 DTO 当作资源唯一形态。
- **什么时候使用：** 设计任何 URI、状态码或缓存/条件请求前。
- **怎么使用：** 先命名业务资源，再选择 URI，最后定义请求和响应表示。
- **最小示例：** `/tasks/1` 是资源标识，JSON 是它的一个表示。
- **运行结果：** 同一 URI 可在状态变化后返回不同表示与不同 ETag。
- **常见误区：** 把 Controller 方法名或数据库表名直接等同于 HTTP 资源。

### 2. 集合资源与成员资源

- **它是什么：** 集合资源表示一组任务，成员资源表示其中一个稳定 ID 对应的任务。
- **有什么作用：** 让创建、列表、读取和更新各有清晰目标。
- **什么时候使用：** 一个 API 同时需要管理多个对象和单个对象时。
- **怎么使用：** `/tasks` 接受列表和创建，`/tasks/{id}` 接受读取和替换。
- **最小示例：** `POST /tasks` 创建后得到 `Location: /tasks/1`。
- **运行结果：** 客户端可跟随 Location 读取刚创建的成员资源。
- **常见误区：** 使用 `/createTask`、`/getTask` 把方法动作重复写进 URI。

### 3. 方法语义与幂等方法

- **它是什么：** GET 读取，POST 按目标资源自定义语义处理，PUT 创建或替换目标资源。
- **有什么作用：** 让客户端、网关和测试依据标准方法理解请求意图。
- **什么时候使用：** 为每条路由选择 HTTP 方法时。
- **怎么使用：** 列表用 GET，服务端分配 ID 的创建用 POST，成员替换用 PUT。
- **最小示例：** 相同 `PUT /tasks/1` 的预期服务器效果与执行一次相同。
- **运行结果：** 方法语义稳定，但每次响应内容仍可能不同。
- **常见误区：** 认为 PUT 会自动提供数据库并发控制，或认为 POST 永远不能建立幂等合同。

### 4. 状态码与 Location

- **它是什么：** 状态码概括请求处理结果，Location 在 201 中指向主要新资源。
- **有什么作用：** 客户端不解析任意文本就能区分成功、输入错误、缺失和冲突。
- **什么时候使用：** 每个 Controller 分支返回响应时。
- **怎么使用：** 创建返回 201 + Location；读取/更新成功返回 200；缺失返回 404。
- **最小示例：** `ResponseEntity.created(URI.create("/tasks/1")).body(task)`。
- **运行结果：** MockMvc 同时断言状态、Location 与 JSON。
- **常见误区：** 所有结果都返回 200，再把失败藏进 `success=false`。

### 5. 分页 query 参数

- **它是什么：** `page` 选择页码，`size` 选择每页最多返回多少项。
- **有什么作用：** 限制单次响应大小，并允许客户端稳定导航。
- **什么时候使用：** 集合可能超过一个合理响应大小时。
- **怎么使用：** `@RequestParam(defaultValue = "0") int page` 与默认 20 的 `size`，随后检查冻结范围。
- **最小示例：** `GET /tasks?page=1&size=2` 请求第三、第四个排序项。
- **运行结果：** 响应回显页码、大小、总项数与总页数。
- **常见误区：** 不声明页码从 0 还是 1 开始，导致客户端整体偏移一页。

### 6. 稳定排序、分页响应与越界

- **它是什么：** 稳定分页要求每次都使用完整且唯一的总顺序，并明确请求页不存在时的响应。
- **有什么作用：** 避免相同排序值让条目在相邻页之间重复或遗漏。
- **什么时候使用：** 在切片之前，且必须与分页响应合同一起设计。
- **怎么使用：** fixture 固定 `id ASC`，返回 totals 与 next/prev；按冻结矩阵处理空集合和越界。
- **最小示例：** 三项、size 2 时总页数为 2，page 2 返回 `PAGE_OUT_OF_RANGE`。
- **运行结果：** 连续两次相同快照请求得到相同 ID 顺序和导航链接。
- **常见误区：** 只写 `page`/`size`，不冻结排序、总数字段或越界行为。

### 7. ETag 表示验证器

- **它是什么：** ETag 是服务端生成的、不透明的表示版本标识。
- **有什么作用：** 客户端可以证明自己基于哪个表示发起更新。
- **什么时候使用：** 资源会被多个客户端读取并修改时。
- **怎么使用：** GET、POST 创建与 PUT 成功响应都返回带引号的强 ETag。
- **最小示例：** `ETag: "task-1-v1"`。
- **运行结果：** 任务更新后 ETag 从 v1 变成 v2。
- **常见误区：** 去掉引号、使用弱 ETag 做 If-Match，或让客户端自己递增版本。

### 8. If-Match 乐观条件更新

- **它是什么：** `If-Match` 让更新只在当前强 ETag 匹配时执行。
- **有什么作用：** 防止较早读取的客户端覆盖较新的修改。
- **什么时候使用：** PUT、DELETE 等状态变更需要 lost update 保护时。
- **怎么使用：** 先确认头存在，再在写入前强比较；不匹配立即返回 412。
- **最小示例：** 客户端读取 v1，另一客户端更新到 v2，旧客户端再提交 v1 得到 412。
- **运行结果：** 412 路径中版本和业务字段都不变化。
- **常见误区：** 先写入再比较，或把 409 与 412 当作任意互换的错误码。

### 9. POST 幂等键

- **它是什么：** 幂等键是客户端为同一个创建意图重复使用的稳定键。
- **有什么作用：** 网络超时后重试不会再次创建任务。
- **什么时候使用：** POST 可能被客户端、网关或用户重复发送且重复创建有副作用时。
- **怎么使用：** 服务端按操作和键查找幂等记录；首次占位并处理，完成后保存完整响应。
- **最小示例：** 两次 `Idempotency-Key: task-create-001` 与相同请求体。
- **运行结果：** 两次响应相同，任务总数仍为 1。
- **常见误区：** 每次重试生成新键，或认为 HTTP 已经标准化所有 Idempotency-Key 行为。

### 10. 请求指纹、重放与冲突

- **它是什么：** 指纹是服务端从规范化业务字段生成的稳定摘要。
- **有什么作用：** 防止同一键被错误用于两个不同创建意图。
- **什么时候使用：** 任何允许幂等键重放的写请求。
- **怎么使用：** 相同键先比较指纹；相同且完成则重放，不同则 422，处理中则 409。
- **最小示例：** 同一键把标题从 `read RFC` 改成 `delete data` 会进入 422。
- **运行结果：** 冲突请求不增加任务数，也不覆盖第一次响应。
- **常见误区：** 只比较键不比较请求内容，或直接对原始 JSON 文本哈希导致字段顺序变化被误判。

### 11. Spring MVC 响应与 MockMvc 反馈

- **它是什么：** 注解负责绑定 HTTP 输入，`ResponseEntity` 负责状态/头/体，MockMvc 负责执行 MVC 链路。
- **有什么作用：** 把协议合同写成可重复断言，而不是只人工阅读 Controller。
- **什么时候使用：** 实现每个路由分支后立即验证。
- **怎么使用：** 同时断言 status、Location、ETag、JSON、资源计数和冲突后的不变状态。
- **最小示例：** POST 首次 201、重放仍为原响应、不同指纹 422 且计数为 1。
- **运行结果：** 现代与 legacy 两套临时工程输出同一合同证据。
- **常见误区：** 只断言状态码，或把 MockMvc 的 mock Servlet 环境冒充真实网络端到端测试。

## 现代与 Java 8 / Boot 2.3 兼容边界

| 对比项 | 现代主线 | Java 8 / Boot 2.3 兼容线 | 冻结策略 |
| --- | --- | --- | --- |
| Java | Java 25 | Java 8 | 共享示例使用普通类、getter、`String.format`、`MessageDigest` 与 `Base64` |
| Spring Boot | 4.1.0 | 2.3.12.RELEASE | 两个独立 Maven 工程，不混用 BOM 或依赖版本 |
| Spring Framework | 7.0.8 | 5.2.15.RELEASE | 只用两线共有的 MVC、ResponseEntity、WebRequest 与 MockMvc API |
| Servlet 命名空间 | `jakarta.servlet` | `javax.servlet` | 示例不直接导入 Servlet 类型，避免把迁移噪声混入本课 |
| DTO | 可用 record，但本课不使用 | 普通 JavaBean | 保持两套响应 JSON 与指纹字段完全一致 |
| 422/428 枚举名 | 新线命名可能演进 | 旧线枚举名不同 | 使用 `ResponseEntity.status(422)` 与 `status(428)` 保持行为一致 |
| ETag | 强验证器与条件请求 | 同一 HTTP 合同 | ETag 始终传入完整带引号值，交给 Spring 条件请求处理 |

现代版本优先讲协议心智模型；legacy 章节只说明同一合同如何使用 Java 8 语法与旧依赖运行。不得把
Java 8 的语法限制写成 REST 规则，也不得把 MockMvc 版本差异写成 HTTP 差异。

## 可执行双版本反馈环

本研究只冻结反馈环，不创建或运行 fixture。正式正文批在 `/tmp` 创建两个独立工程，成功后清理；仓库中
不得保留测试文件。

### 共同 fixture 结构

两套工程都只使用 MVC starter 与 `spring-boot-starter-test`：现代线使用
`spring-boot-starter-webmvc`，Java 8 兼容线使用 `spring-boot-starter-web`。文件职责固定为：

1. `CourseApplication.java`：最小 Boot 入口。
2. `TaskController.java`：声明四条路由并组装 ResponseEntity。
3. `TaskService.java`：内存资源、稳定排序、同步 If-Match 比较和幂等记录状态机。
4. `TaskRequest.java`、`TaskResponse.java`、`PageResponse.java`：普通 Java 类，现代线也不使用 record。
5. `RestContractTest.java`：通过 Spring Boot 上下文创建 MockMvc，执行同一合同矩阵。

fixture 不引入 JPA、JDBC、H2、Redis 或第三方幂等库。内存状态在每个测试前重置，避免测试顺序影响结果。

### 最小合同矩阵

| 编号 | 请求 | 必须断言 |
| ---: | --- | --- |
| 1 | 首次 POST + key A + body A | 201、Location、ETag、body、任务数 1 |
| 2 | 重复 POST + key A + body A | 与第一次完整响应相同，任务数仍为 1 |
| 3 | POST + key A + body B | 422，任务数仍为 1 |
| 4 | POST + 标记为 PROCESSING 的 key B | 409，任务数不变 |
| 5 | POST 缺少 key | 400，任务数不变 |
| 6 | GET `page=0&size=2` | 200、ID 升序、字段与 next/prev 正确 |
| 7 | 空集合 GET page 0 | 200、空 items、totalPages 0 |
| 8 | GET 非法 page/size | 400 与稳定错误码 |
| 9 | GET 越界页 | 404 `PAGE_OUT_OF_RANGE` |
| 10 | GET 成员 | 200 与当前强 ETag |
| 11 | PUT 缺少 If-Match | 428，资源未变化 |
| 12 | PUT 过期 If-Match | 412，资源未变化 |
| 13 | PUT 匹配 If-Match | 200、新 ETag、版本只增加 1 |
| 14 | PUT 不存在成员 | 404，不隐式创建 |

每套 fixture 连续运行两次，固定输出：

```text
resource|create=201|location=true|get=200|missing=404
pagination|order=1,2,3|emptyPage0=200|invalid=400|outOfRange=404|links=true
conditional|missing=428|stale=412|matched=200|newEtag=task-1-v2
idempotency|first=201|replay=201|payloadConflict=422|processingConflict=409|tasks=1
```

### 现代反馈环

1. 用 `mktemp -d /tmp/java-rest-contract-modern.XXXXXX` 创建临时目录。
2. `pom.xml` 固定父版本 Spring Boot `4.1.0` 与 `<java.version>25</java.version>`。
3. 使用官方 Maven JDK 25 镜像运行
   `docker run --rm -v "$modern_dir:/workspace" -w /workspace maven:3.9.12-eclipse-temurin-25 mvn -q test`。
4. 连续执行两次，比较四行固定证据与 surefire 的 tests/failures/errors。
5. 记录 `java.version=25`、Boot 4.1.0 与 Spring 7.0.8 实际解析版本。

### Java 8 / Boot 2.3 反馈环

1. 用 `mktemp -d /tmp/java-rest-contract-legacy.XXXXXX` 创建另一个临时目录。
2. `pom.xml` 固定父版本 Spring Boot `2.3.12.RELEASE` 与 `<java.version>8</java.version>`。
3. 使用官方 Maven JDK 8 镜像运行
   `docker run --rm -v "$legacy_dir:/workspace" -w /workspace maven:3.9.12-eclipse-temurin-8 mvn -q test`。
4. 连续执行两次，必须得到与现代线相同的 HTTP 合同证据。
5. 检查 class major version 52，证明没有误用 Java 9+ API 或字节码。

### 清理与证据边界

只有在两个变量都匹配 `/tmp/java-rest-contract-*` 且目录真实存在时，才执行
`rm -R -- "$modern_dir" "$legacy_dir"`，随后用两个 `test ! -e` 证明清理。MockMvc 证明 Spring MVC
绑定、Controller、序列化与响应合同，但不经过真实网络或 Servlet 容器；正式课程页面验收不能把它写成 E2E。

## 易错点取证候选

| 错误 | 触发条件 | 后果 | 正确方向 | 反馈证据 |
| --- | --- | --- | --- | --- |
| 创建返回 200 且没有 Location | POST 实际创建新资源 | 客户端无法稳定定位新成员 | 201 + Location + ETag | MockMvc 同时断言三个值 |
| 分页没有唯一总顺序 | 只按可重复字段排序 | 跨页重复或遗漏 | 固定 `id ASC` | 连续两次比较 ID 序列 |
| 把越界页和非法参数混为一谈 | 所有异常统一返回 400 | 客户端无法区分修正参数还是回到有效页 | 400 非法；404 越界 | 对照越界矩阵 |
| 先更新再检查 If-Match | 条件判断发生在写入后 | 412 仍然污染资源 | 写前强比较，失败不执行 | 断言旧字段与版本不变 |
| 用弱 ETag 做 If-Match | `W/` 值参与强条件更新 | 无法满足强比较 | 返回并要求强 ETag | 弱值请求得到 412 |
| 同一 key 不比较指纹 | 重试携带不同业务内容 | 错误重放或覆盖首次结果 | DTO 规范化 + SHA-256 指纹 | body B 得到 422且计数不变 |
| 直接哈希原始 JSON | 只改变空白或字段顺序 | 同一业务内容被误判冲突 | 对绑定后的稳定字段生成指纹 | 等价 JSON 得到同一重放结果 |
| 用内存 fixture 宣称生产幂等 | 进程重启或多实例 | 记录丢失、重复创建 | 明确只验证 HTTP 合同 | 文档边界检查 |

## 未决事项与限制

1. Idempotency-Key 尚无有效 RFC。后续正文必须把 `-07` 标为“已过期工作草案”，不能使用规范性措辞。
2. 本课冻结的 422/409 分工借鉴 `-07`，但最终仍是应用合同；若产品另选 409，必须先修订本研究与反馈矩阵。
3. 分页越界返回 404 是本课程选择，不是 Spring 或 HTTP 的唯一正确答案；客户端合同必须同步公开。
4. MockMvc 不经过真实 socket、代理或容器；它适合本批 Controller 合同反馈，不证明部署链路。
5. 内存同步只能证明单 JVM 示例的比较与更新顺序。持久化、跨实例原子性和数据库实现全部留在本课范围外。
6. 本课不产出性能结论。稳定排序是正确性合同，不表示任何数据库查询更快。
7. 当前旧正文和旧 signoff 仍在 live worktree。只有后续实现、验证和新 signoff 完成后，才能声称 I-09 已迁移。

## 研究 Gate

- [x] 稳定 ID、标题、I-09、150 分钟和唯一前置 I-08 与 Phase A freeze 一致。
- [x] Phase A 5.1 的分页移入边界与 SQL offset/keyset/索引/查询计划排除边界已记录。
- [x] REST 资源建模、状态码、Location、分页、ETag/If-Match 与 POST 幂等全部有明确研究结论。
- [x] 数据库事务/回滚、Redis 与数据库分页实现均未进入新课程范围。
- [x] Tavily 只用于定位；22 个官方直接 URL 均逐一 curl 核验为 HTTP 200。
- [x] 规范事实、过期草案线索与本课应用选择已分层，未把草案或分页格式伪装成通用标准。
- [x] 11 个零基础知识点均预留“是什么、作用、场景、用法、示例、结果、误区”。
- [x] 现代 Java 25 / Boot 4.1 与 Java 8 / Boot 2.3 的可执行反馈环、共同合同矩阵和清理边界已冻结。
- [x] 当前旧正文、track、loader 与 signoff 只读核对，未作为新 I-09 完成证据。
- [x] 本批只覆盖本研究文件，未修改正文、运行时状态、signoff 或后续课程。

研究 Gate：`PASS`。这只表示 I-09 官方研究与实施输入已冻结，不表示正文、反馈环、运行时发布或页面验收通过。

## Stop Boundary

本文件是 Phase C I-09 的唯一产物。到此硬停止：不得在本批修改课程正文、track、loader、manifest、计划、
signoff 或任何其他研究稿；不得创建持久 fixture；不得开始 I-10 或后续课程。

下一步只有在父任务明确授权 I-09 正文实现后，才能按本研究稿重写同一稳定 ID 的 lesson，执行现代/legacy
临时反馈环、定向工程 Gate、桌面与 390px 页面验证和独立 review/signoff。研究 Gate PASS 不自动授予这些
动作，更不授予下一课。
