# HTTP、URI、请求响应与 URL 编码基础研究稿

## 冻结课程合同

| 项目 | 冻结值 |
| --- | --- |
| 课程 ID | `backend.java.learn.intermediate.http-uri-and-request-response-basics` |
| 标题 | HTTP、URI、请求响应与 URL 编码基础 |
| 阶段 | intermediate |
| 顺序 | 中级第 4 批；上一批为 `json-and-data-contracts` |
| 前置课程 | `backend.java.learn.intermediate.json-and-data-contracts` |
| 能力范围 | `JAVA-STDLIB-019`：URL 编解码 |
| 现代主线 | Java 25 LTS；协议以 RFC 3986、RFC 6570、RFC 9110、RFC 9112 和 WHATWG URL Standard 为准 |
| 项目补充 | Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE |
| 项目边界 | `dzzz-app` 只读；不运行、不修改、不把现状当推荐写法 |
| 后继边界 | 本批关闭前不领取 I-05 `backend.java.learn.intermediate.first-spring-boot-web-api` |

## 核验基线

- 核验日期：2026-08-15。
- 冻结快照：`dzzz-app-20260803-179e722831ab`；矩阵 `JAVA-STDLIB-019` 记录 1 个项目文件。
- 现代 Java：Java 25 LTS。`java.net.http` 的 `HttpClient`、`HttpRequest` 和 `HttpResponse` 均自 Java 11 起提供，本课只讲基础构造与读取边界，不提前扩展超时、重试、连接池和韧性设计。
- 项目线：Java 8；Spring Boot 2.3.12.RELEASE 官方系统要求 Java 8，且要求 Spring Framework 5.2.15.RELEASE 或以上。旧 API 只解释兼容和迁移边界。
- 研究方法：Tavily 仅用于发现关键词和第一方页面；正文结论全部回到 RFC Editor、WHATWG、Oracle、Spring 或 OWASP 的直接页面核验。未采用搜索摘要、社区文章或项目数量作为正确性证明。

## 官方来源卡与直接证据

| 来源 | 适用版本 | 支持的结论 |
| --- | --- | --- |
| [RFC 3986 URI Generic Syntax](https://www.rfc-editor.org/rfc/rfc3986.html) | URI 通用语法，2005-01 | `scheme`、`authority`、`path`、`query`、`fragment` 组成；相对引用与 RFC 5.2 解析；percent-encoding、reserved/unreserved 集合；不要在已分割组件后盲目解码。 |
| [RFC 6570 URI Template](https://www.rfc-editor.org/rfc/rfc6570.html) | URI Template，2012-03 | `{var}`、`{+var}`、`{/var}`、`{?var}`、`{&var}` 的扩展语义、变量编码和查询展开；模板不是普通字符串替换。 |
| [RFC 9110 HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html) | HTTP 语义，2022-06；核验 2026-08-15 | request method/target/version、字段和 content 边界；safe/idempotent 方法属性；Content-Type/media type；Accept 与 proactive negotiation；状态码类别与 200/201/204/400/401/403/404/405/406/413/414/415/422/5xx 语义；字段长度没有统一预设上限。 |
| [RFC 9112 HTTP/1.1](https://www.rfc-editor.org/rfc/rfc9112.html) | HTTP/1.1 消息语法与分帧，2022-06；已由 [RFC 9931](https://www.rfc-editor.org/rfc/rfc9931.html) 更新乐观协议切换安全规则；核验 2026-08-15 | start-line、header section、空行、可选 message body；请求 body 由 `Content-Length` 或 `Transfer-Encoding` 标示；HEAD/1xx/204/304 响应没有 body；不一致 framing 必须拒绝，避免 request smuggling；乐观协议切换不进入本课。 |
| [RFC 6585 Additional HTTP Status Codes](https://www.rfc-editor.org/rfc/rfc6585.html) | HTTP 附加状态码，2012-04 | 431 表示服务器因单个字段或字段总量过大而不愿处理请求；可在响应中说明具体过大的字段。 |
| [RFC 6838 Media Type Specifications and Registration Procedures](https://www.rfc-editor.org/rfc/rfc6838.html) | Media Type 注册规范，2013-01 | media type 的顶级类型、subtype、参数、注册与安全信息要求；不能仅凭文件扩展名猜测内容类型。 |
| [WHATWG URL Standard：application/x-www-form-urlencoded](https://url.spec.whatwg.org/#application-x-www-form-urlencoded) | WHATWG Living Standard；核验 2026-08-15 | 表单编码集合、UTF-8 percent-encode、空格转 `+`；`URLSearchParams` 使用此格式，不能与 RFC 3986 的通用组件编码混为一谈。 |
| [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) | 安全验证建议；核验 2026-08-15 | 服务端必须校验；结构化输入使用 allowlist；同时区分语法验证与业务语义验证。 |
| [OWASP Server-Side Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html) | 外部 URI/URL 输入；核验 2026-08-15 | URL 解析不等于可信；优先 allowlist，分别校验 scheme/domain/IP，并防止重定向和 DNS 解析绕过。 |
| [Java 25 `java.net` package](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/net/package-summary.html) | Java SE 25 | `URI` 只标识资源，不直接提供访问；`URL` 是历史访问导向概念，`URLConnection` 执行访问；`HttpURLConnection` 已被新 HTTP Client API 取代。 |
| [Java 25 `URI`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/net/URI.html) | Java SE 25 | URI 不可变；组件构造、解析、`getRaw*`/解码 `get*`、`normalize`、`resolve`、`relativize`；解析本身不访问网络，需另做 scheme/host 等策略校验。 |
| [Java 25 `URLEncoder`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/net/URLEncoder.html) / [`URLDecoder`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/net/URLDecoder.html) | Java SE 25 | 两者明确是 `application/x-www-form-urlencoded` 工具；空格与 `+` 互转；推荐显式 UTF-8；不能当作任意 URI path/query 组件编码器。 |
| [Java 25 `HttpClient`](https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/HttpClient.html)、[`HttpRequest`](https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/HttpRequest.html)、[`HttpResponse`](https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/HttpResponse.html) | Java SE 25（API since 11） | client 构建后不可变且可复用；同步/异步发送；request 的 URI、headers、method、body publisher；response 的 status、headers、body；每次发送必须提供 body handler。 |
| [Java 25 `BodyPublishers`](https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/HttpRequest.BodyPublishers.html) / [`BodyHandlers`](https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/HttpResponse.BodyHandlers.html) | Java SE 25 | `ofString` 使用 UTF-8；`BodyHandlers.ofString()` 按响应 `Content-Type` charset 解码，缺失或不支持时使用 UTF-8；`Content-Type` 仍须由请求方按合同设置。 |
| [Java 8 `URI`](https://docs.oracle.com/javase/8/docs/api/java/net/URI.html)、[`URLEncoder`](https://docs.oracle.com/javase/8/docs/api/java/net/URLEncoder.html)、[`URLDecoder`](https://docs.oracle.com/javase/8/docs/api/java/net/URLDecoder.html) | Java SE 8 | 旧线同样区分 raw/decoded URI 组件；表单编码需 `encode(String, String)` / `decode(String, String)` 显式指定字符集，默认字符集重载已标记不推荐。 |
| [Java 8 `HttpURLConnection`](https://docs.oracle.com/javase/8/docs/api/java/net/HttpURLConnection.html) | Java SE 8 | 旧线 HTTP 客户端的单请求连接、method、response code、error stream 和 `disconnect` 合同；没有 Java 11+ 的标准 `java.net.http` API。 |
| [Spring Framework 5.2.15 Web Reference：URI encoding](https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/web.html#web-uri-encoding) | Spring Framework 5.2.15.RELEASE | `UriComponentsBuilder` / `DefaultUriBuilderFactory` 的 URI 模板展开与编码模式；`RestTemplate` 历史默认 `URI_COMPONENT`，变量中保留字符的处理必须显式理解。 |
| [Spring Framework 5.2.15 Integration Reference：REST client](https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/integration.html#rest-client-access) | Spring Framework 5.2.15.RELEASE | `RestTemplate` 可使用 URI 模板、`RequestEntity`/`ResponseEntity`、headers/body；`HttpMessageConverter` 负责对象与 HTTP body 的读写；已编码字符串可能被重复编码。 |
| [Spring 5.2.15 `UriComponentsBuilder`](https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/util/UriComponentsBuilder.html)、[`RequestEntity`](https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/http/RequestEntity.html)、[`ResponseEntity`](https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/http/ResponseEntity.html)、[`MediaType`](https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/http/MediaType.html) | Spring Framework 5.2.15.RELEASE | 结构化构建 URI；请求实体携带 method/URI/headers/body；响应实体携带 status/headers/body；`MediaType` 是 type/subtype/parameters，并有 quality value。 |
| [Spring Boot 2.3.12 system requirements](https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#system-requirements) | Spring Boot 2.3.12.RELEASE | 项目补充线 Java 8 与 Spring Framework 5.2.15.RELEASE 基线。 |

## 冻结项目证据

矩阵 `JAVA-STDLIB-019` 的唯一代表证据为：

| 文件与符号 | 状态 | 课程用途 |
| --- | --- | --- |
| `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientChatWsServer.java`，`com.tdh.bdzz.config.websocket.server.ClientChatWsServer`；冻结 SHA-256 `73ea51927d7ae36903a4918c64061e34dce89b1534e51f246dce92304381368c` | `corrected` | 静态代码显示 Java 8 的 `URLEncoder.encode(String, "UTF-8")` 被用于一个查询参数值，同时 URL 其余部分仍通过字符串拼接。课程保留“WebSocket 连接建立时生成带查询参数的跳转地址”这一业务意图，改用 `URI`/结构化 query 构建，并明确表单编码不能覆盖整条 URI。 |

只读核验路径为冻结清单的 `target.repositoryRoot=/Users/jian/Desktop/work/TDH/dzzz`、`moduleRoot=dzzz-app`；未运行该项目、未读取其他业务文件、未复制真实参数，也未把项目现状当成协议合同。

## 现代主线结论

### URI 是分层标识，不等于“把字符串拼成 URL”

RFC 3986 的通用语法是：

```text
URI = scheme ":" hier-part [ "?" query ] [ "#" fragment ]
```

常见 HTTP URI 可以拆成 `https://example.test:8443/a/b?mode=full#result`：

- `scheme` 是 `https`，决定解释该 URI 的方案。
- `authority` 是 `example.test:8443`，可进一步拆成 userinfo、host、port；不可信 HTTP URI 出现 userinfo 应视为错误，避免把可信主机名伪装在 `@` 前面。
- `path` 是 `/a/b`，按斜杠分段，是分层资源标识的一部分。
- `query` 是 `mode=full`，其键值含义由具体 URI 方案或应用定义，不自动等于表单字段。
- `fragment` 是 `result`，用于客户端对已取得资源做二次定位；HTTP target URI 会排除 fragment，它不会作为请求目标发送到服务器。

URL 是历史上强调“如何定位并访问资源”的 URI 概念；现代协议规则先使用 URI/URI reference 描述标识和引用。Java 也把两者分开：`URI` 只解析和保存标识，`URL`/`URLConnection` 才进入访问动作；现代 HTTP 调用直接把 `URI` 交给 `HttpRequest`。

`URI` 只负责语法识别，不负责 DNS、TCP、TLS 或授权。`URI.create`/构造器成功不代表“地址安全”或“地址存在”；网络访问前仍须按应用 allowlist 校验 scheme、host、port、路径和重定向策略。

### 相对引用必须相对于明确 base 解析

RFC 3986 §5.2 的解析先取得 base 的 scheme/authority/path/query，再把相对引用合并并移除 `.`/`..` 段。Java `URI.resolve` 提供对应的相对解析操作；协议语义以 RFC 3986 为准，并用以下稳定样本验证 API 结果：

```java
URI base = URI.create("https://example.test/docs/index.html");
URI child = base.resolve("guide/start.html");
URI root = base.resolve("/guide/start.html");
```

结果分别是 `https://example.test/docs/guide/start.html` 和 `https://example.test/guide/start.html`。base 没有末尾 `/` 时，最后一个 path 段被视为文件并会被替换；因此“拼接 base + child”不是等价实现。相对引用只有在 base 明确且可信时才有意义。

### percent-encoding 作用于组件数据，不能盲目编码整条 URI

RFC 3986 §2.1 用 `%` 加两位十六进制表示一个数据 octet；新 URI 方案的 Unicode 文本应先以 UTF-8 得到 octets，再只对不在 unreserved 集合的 octet 编码。unreserved 是 `ALPHA / DIGIT / "-" / "." / "_" / "~"`；reserved 字符（如 `/`, `?`, `#`, `&`, `=`）可能是分隔符。

同一字符在不同组件职责不同：path 中的 `/` 是层级分隔符，query 中的 `&`/`=` 常是应用约定的字段分隔符。把完整 URI 交给表单编码器会把分隔符也变成数据，服务器就无法按原结构解析；先分割组件，再对“组件内的数据值”编码。

RFC 3986 §2.4 还要求不要在已经解析出组件后反复解码，也不要解码可能改变分隔符含义的 reserved 字符。`%2F` 在 path segment 中不能随意变成 `/`；`%26` 在 query value 中不能先解码后再按 `&` 切分。

### `application/x-www-form-urlencoded` 是表单格式，不是通用 URI 编码

WHATWG URL Standard 定义的表单编码集合只保留 ASCII 字母数字、`*`、`-`、`.`、`_`；其他字符先按 UTF-8 编码后 percent-encode，U+0020 SPACE 特别转换成 `+`。Java `URLEncoder`/`URLDecoder` 的 Javadoc 也明确把自己定义为 HTML form encoding/decoding 工具。

因此必须区分：

| 场景 | 空格 | `+` 的意义 | 推荐 API/规范 |
| --- | --- | --- | --- |
| RFC 3986 URI 组件数据 | 通常 `%20`（按组件规则） | 普通字符，是否保留由组件语法决定 | `URI` 组件构造；先定义组件边界 |
| HTML 表单 / `application/x-www-form-urlencoded` | `+` | 数据中的字面 `+` 必须编码为 `%2B` | `URLEncoder`/`URLDecoder`、WHATWG URL Standard |

`URLEncoder.encode("a+b c", UTF_8)` 的表单结果是 `a%2Bb+c`；`URLDecoder.decode` 会先把 `+` 还原为空格，再处理 `%HH`。如果 API 明确要求 RFC 3986 query component，不能直接套用该结果而不确认其格式合同。

### URI Template 是有运算符语义的模板

RFC 6570 把 `{var}` 定义为简单字符串扩展，`{+var}` 为保留字符扩展，`{/var}` 为路径段扩展，`{?var}`/`{&var}` 为 form-style query/continuation。变量值会依据运算符的编码规则展开；模板中的固定分隔符与变量数据不是同一层。这里的 “form-style” 不是 WHATWG `application/x-www-form-urlencoded` 的别名，URI Template 的空格 percent-encode 不能自动改写成 `+`。课程示例可以使用模板表达资源路径和可选 query，但仍须在展开后按目标组件进行验证。

### HTTP 消息有清晰的控制数据、头部、空行和 body 边界

RFC 9110 把请求控制数据定义为 method、request target、protocol version；响应控制数据为 status code、可选 reason phrase、protocol version。RFC 9112 的 HTTP/1.1 线格式为：

```text
start-line CRLF
field-line CRLF ...
CRLF
[message-body]
```

请求 body 的存在由 `Content-Length` 或 `Transfer-Encoding` 等 framing 信号决定，且 framing 与 method 语义独立；不能因为“这是 GET”就自创 body 规则。响应是否允许 body 还受请求 method 和状态码影响：HEAD 响应、1xx、204、304 没有 message body；2xx CONNECT 响应进入隧道语义。解析到无效或互相冲突的 framing 时必须拒绝请求并关闭连接，避免前后端对边界理解不同造成 request smuggling。

字段名大小写不敏感，但字段值的语法和参数仍由各字段定义。HTTP 没有统一的字段长度上限；服务必须按接口合同设置 URI、header、body 和单字段上限，超限返回适当 4xx，而不是静默截断。

### 方法语义不能只看“动词名字”

- `GET` 请求传输目标资源的当前 representation；GET 请求 content 没有通用定义语义，客户端不应在没有源站明确合同时生成；`HEAD` 与 GET 语义相同但响应不得含 content。
- `POST` 让目标资源按自己的语义处理请求 content，通常用于提交或触发处理；它不是规范意义上的 idempotent 方法。
- `PUT` 用请求 representation 创建或替换目标资源状态；`DELETE` 删除目标资源与当前功能的关联。
- safe 方法是基本只读的 GET、HEAD、OPTIONS、TRACE；idempotent 方法包括 safe 方法以及 PUT、DELETE。幂等只描述重复请求的预期服务器效果，不表示请求一定成功、无副作用或可以无条件重试。
- CONNECT 和 TRACE 有特殊安全/代理语义，本课只识别它们，不把它们当作普通业务 CRUD 动词。

### 状态码是结果合同，不能用 body 文本代替

RFC 9110 按首位分为 1xx 信息、2xx 成功、3xx 重定向、4xx 客户端错误、5xx 服务端错误。零基础课程至少要建立这些边界：

| 状态 | 适合表达的结果 |
| --- | --- |
| 200 | 请求成功，响应可带 representation |
| 201 | 创建成功；通常用 `Location` 指向新资源 |
| 204 | 成功但响应无 content |
| 400 | 请求语法或 framing 无效 |
| 401 | 缺少或无效认证凭据（不是“任何权限不足”） |
| 403 | 服务器理解请求但拒绝执行 |
| 404 | 目标资源当前不存在或不愿披露其存在 |
| 405 | 方法不允许；响应应带 `Allow` |
| 406 | 没有可满足请求 `Accept` 的 representation |
| 413 | 请求 content 超过服务器愿意处理的大小 |
| 414 | request-target 过长 |
| 415 | 请求 representation 的 media type 或 content coding 不被接受 |
| 422 | Content-Type 与语法可理解，但服务器无法处理其中的指令 |
| 431 | 一个或多个请求字段过大 |
| 5xx | 服务器知道自己出错或无法完成请求 |

`401`/`403`、`404`/`409`、`400`/`422` 不能仅凭项目习惯互换；课程应根据 RFC 9110 的精确语义和本接口错误合同选择。

### `Content-Type`、`Accept` 与 body 是三件不同的事

- `Content-Type` 描述随 message content 传输的 representation media type，例如 `application/json`；它不是“这个接口返回什么”的请求偏好。
- `Accept` 是客户端对响应 media type 的偏好列表，可含权重和通配符。服务器执行 proactive content negotiation 选择 representation；无法满足时可返回 406，也可按自己的合同忽略偏好。
- `Content-Encoding` 描述在 media type 之上施加的压缩等 content coding；不要把 gzip 写进 `Content-Type`。
- `Vary` 记录选择 representation 时使用的请求字段，使缓存不会把一种协商结果错误复用于另一种请求。
- Java `HttpClient.BodyPublishers.ofString` 只负责把字符串按 UTF-8 变成 body bytes，不会替调用者建立业务 media type 合同；请求应显式设置 `Content-Type`。`BodyHandlers.ofString()` 会按响应 `Content-Type` 的 charset 解码，缺失或不支持时回退 UTF-8。

### 输入限制和安全边界必须在解析前建立

OWASP 建议服务端执行 allowlist 验证；结构化字段先做语法验证，再做长度、范围、状态和权限等语义验证。对 HTTP 输入，至少应设置：

1. 只允许业务需要的 scheme、host、port 和 method；不接受含 userinfo 的外部 HTTP URI。
2. 对 request-target、每个 header、header 总量和 body 设置上限；超限明确返回 414、431 或 413。
3. 统一使用一个 HTTP 解析栈，不手工拼接原始 header；拒绝 CR/LF 注入、冲突 `Transfer-Encoding` 和不一致 framing。重复 `Content-Length` 只有在 RFC 9112 允许的“均为同一个有效值”条件下才能合并，其他情况必须拒绝。
4. 对 query、path segment、form field 分别选择编码/解码器；限制 percent-decoding 次数，避免解码后产生新的分隔符。
5. 对日志、异常和重定向做去敏；URI 可能包含 token、密码或个人数据，不能当作普通日志字段。

`URI.normalize()` 只处理 path 的点段，不是授权、SSRF 或 canonicalization 的完整安全方案。解析外部 URI 后必须重新检查规范化结果和允许的目标集合。

## Java 25 主线接口

### `URI`：先解析和构造，再访问

```java
URI base = URI.create("https://example.test/api/v1/index");
URI target = base.resolve("users?name=Lin%20Qi");
System.out.println(target.getRawQuery());
System.out.println(target.getQuery());
```

预期输出是先得到原始 `name=Lin%20Qi`，再得到解码后的 `name=Lin Qi`。需要保留 wire 级字节时使用 `getRaw*`；需要业务文本时使用对应解码 getter，并明确字符集和组件边界。

`URI.create` 适合已知常量，失败抛 `IllegalArgumentException`；需要把用户输入的解析失败作为可处理分支时使用 `new URI(String)` 并处理 `URISyntaxException`。多参数构造器会按组件职责引用非法字符和 `%`，但不会替你决定 query 是通用 URI 语法还是表单格式。

### `URLEncoder`/`URLDecoder`：明确写出表单语义和 UTF-8

```java
String encoded = URLEncoder.encode("a+b c", StandardCharsets.UTF_8);
String decoded = URLDecoder.decode(encoded, StandardCharsets.UTF_8);
```

输出为 `encoded=a%2Bb+c`、`decoded=a+b c`。Java 25 提供 `Charset` 重载；Java 8 应使用字符串重载 `encode(value, "UTF-8")` / `decode(value, "UTF-8")`，不要使用依赖平台默认字符集的旧重载。

### `HttpClient`：请求与响应分开建模

```java
HttpClient client = HttpClient.newBuilder()
        .followRedirects(HttpClient.Redirect.NEVER)
        .build();
HttpRequest request = HttpRequest.newBuilder(URI.create("https://example.test/api/items"))
        .header("Accept", "application/json")
        .header("Content-Type", "application/json")
        .POST(HttpRequest.BodyPublishers.ofString("{\"name\":\"demo\"}"))
        .build();
HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
```

该片段展示合同，不应在本课连接真实服务。`HttpClient` 构建后不可变，可复用；每个 request 选择 URI、headers、method 和 body publisher；`send`/`sendAsync` 必须提供 body handler，之后分别读取 `statusCode()`、`headers()` 和 `body()`。重定向、超时、连接池、重试、认证和资源韧性留给高级课程。

## Java 8 / Spring Boot 2.3 兼容线

Java 8 没有 `java.net.http` 模块。需要解释旧项目最低能力时使用 `URI`、`URLEncoder`/`URLDecoder` 和 `HttpURLConnection`：设置 method、请求属性和超时，按状态码选择输入流或 `getErrorStream()`，关闭流并在适当时 `disconnect()`。该 API 每个实例对应一次请求，底层持久连接可能由实现共享；不要把 `disconnect()` 当作全局连接池关闭。

Spring Framework 5.2.15 的 `RestTemplate` 以 `HttpMessageConverter` 在对象和 raw HTTP body 间转换；`RequestEntity` 携带 method、URI、headers、body，`ResponseEntity` 携带 status、headers、body。URI 模板应使用 `UriComponentsBuilder` / `DefaultUriBuilderFactory`。5.2.15 文档说明 `RestTemplate` 历史默认 `EncodingMode.URI_COMPONENT`，而 String URI 模板按“尚未编码”处理，已编码字符串可能被重复编码；已完成编码的 URI 应使用 `java.net.URI` 重载。

项目中需要保留的场景是“连接建立时生成带 query 的地址”，不是复制 WebSocket 实现。正确迁移步骤是：先把 query 名和值作为结构化数据；对单个值选择表单或 URI 组件编码；构造 `URI`；最后交给客户端或框架。不得继续拼接含 token、内网地址或个人数据的完整 URL。

## 新旧版本差异

| 对比项 | Java 25 主线 | Java 8 / Spring Boot 2.3 项目线 | 迁移注意 |
| --- | --- | --- | --- |
| URI 核心 | RFC 3986 作为协议主线；Java 25 `URI` 提供不可变组件、raw/decoded getter 和 resolve | Java 8 `URI` 同样支持组件和 resolve；两代 Javadoc 都以历史 RFC 2396 描述并列出偏差 | 不把 Java API 文档版本误称为 RFC 3986 完整实现；项目代码保持 Java 8 兼容 |
| 表单编码 | `URLEncoder.encode(String, Charset)` / `URLDecoder.decode(String, Charset)` | `encode(String, "UTF-8")` / `decode(String, "UTF-8")`；默认字符集重载不推荐 | 两条线都明确 `application/x-www-form-urlencoded`，不当通用 URI 编码器 |
| HTTP 客户端 | Java 11+ `java.net.http.HttpClient`，Java 25 课程基线 | Java 8 `HttpURLConnection`，或 Spring 5.2.15 `RestTemplate` | 新旧客户端不可混用 import；高级超时/重试另课讲 |
| body 编解码 | `BodyPublishers.ofString` 默认 UTF-8；`BodyHandlers.ofString` 看响应 charset | `HttpURLConnection` 需自行管理字节流；`RestTemplate` 交给 `HttpMessageConverter` | `Content-Type` 和字符集始终是边界合同 |
| URI 模板 | 先理解 RFC 6570，再使用 Java/Spring 结构化 API | `UriComponentsBuilder` / `DefaultUriBuilderFactory`；已编码 String 可能 double encode | 不手工拼接分隔符；编码模式要在版本迁移时重新核验 |

## 易错点与验证设计

| 易错点 | 触发条件与后果 | 正确写法 | 最小验证 |
| --- | --- | --- | --- |
| 用 `URLEncoder` 编整条 URI | `/`, `?`, `&`, `=` 被当作数据，服务器看不到原有层级或 query 字段 | 先拆组件；只编码一个 path segment、query value 或 form field | 输入含空格、`+`、`&`、`/` 的值，断言解析后组件边界不变；来源 RFC 3986 §2.1-2.4、Java 25 `URLEncoder` |
| 把 `+` 当作 URI 中的空格 | RFC 3986 数据中的 `+` 被错误还原为空格，搜索/签名值改变 | 只有表单格式使用 `+` 空格规则；通用 URI 组件按自身规则处理 | `a+b c` 经 URLEncoder/URLDecoder 回环；再与 URI query raw 值对比 |
| 已编码值再次交给 Spring String 模板 | `RestTemplate` 认为 String 模板未编码，`%2F` 等再次变成 `%252F` | 用 `URI` 重载，或只提供未编码变量给统一 `UriBuilderFactory` | 预先编码值走 String 与 URI 两条路径，断言 wire URI 不同并解释原因；来源 Spring 5.2.15 Reference |
| 依赖 `URI.create` 证明地址安全 | 解析成功被误当作 host、scheme、重定向和授权均安全，产生 SSRF/钓鱼风险 | parse 后 allowlist scheme/host/port，拒绝 userinfo，重定向逐跳复查 | 仅做离线 URI 样本验证，不连接网络；来源 Java 25 `URI` 安全提示、OWASP SSRF/Input Validation |
| 把 GET body 当作通用参数通道 | 不同中间件对 GET content 处理不一致，缓存/签名/代理语义不稳定 | 查询条件放 query；需要提交 content 时按资源合同使用 POST/PUT | 读取 RFC 9110 §9.3.1 与 §6.4.1；服务端合同测试拒绝未定义的 GET body |
| 只看 2xx 或只读 body | 失败响应的 status/headers 被吞掉，无法区分认证、权限、资源不存在和协议错误 | 先读取 status，再按状态处理 headers/body；204、HEAD 等不得期待 body | 用本地伪响应覆盖 200/201/204/400/401/403/404/415/431；不调用真实项目 |
| 只依赖默认输入大小 | RFC 不给统一字段上限；超长 header/body 可能触发资源耗尽或解析差异 | 在 HTTP 层设置 request-target、header 和 body 上限，统一拒绝冲突 framing | 逐项输入超限样本，断言映射为 413/414/431；来源 RFC 9110 §5.4、RFC 9112 §6/§11.2、OWASP |

## 最小 fixture 计划

验证资产仅在 `/tmp` 的 `mktemp -d` 目录中创建，完成后用 `find <dir> -depth -delete` 清理，并执行 `test ! -e <dir>`；本批研究阶段不创建仓库测试文件，也不运行 `dzzz-app`。

1. Java 25：`URI.resolve`、`getRawQuery`/`getQuery`、RFC 3986 相对解析样本。
2. Java 25：`URLEncoder`/`URLDecoder` 的 `+`、`%2B`、UTF-8 和 URI query 对比。
3. Java 25：离线构造 `HttpRequest`，核对 method、URI、Accept、Content-Type、body bytes；使用伪 `HttpResponse` 数据核对 status/headers/body 分层。
4. Java 8：`URI`、`URLEncoder.encode(String, "UTF-8")` 和 `HttpURLConnection` 的最小编译检查，不发送外部请求。
5. Spring 5.2.15：临时 `UriComponentsBuilder`/`RequestEntity`/`ResponseEntity` 编译检查，比较 URI 模板 String 与 URI 重载的编码边界。

## 课程小点建议

1. URI、URL、URI reference 与 HTTP request-target 的关系。
2. scheme、authority、path、query、fragment 的组成和相对解析。
3. RFC 3986 percent-encoding、reserved/unreserved 与组件边界。
4. `application/x-www-form-urlencoded`、`+`、`%20`、`URLEncoder`/`URLDecoder` 的差异。
5. RFC 6570 URI Template 的变量与 query 运算符。
6. HTTP request/response start-line、headers、空行、body 和 framing。
7. GET/POST/PUT/DELETE/HEAD 的方法语义、safe/idempotent 与重试边界。
8. 状态码类别和 200/201/204/400/401/403/404/405/406/413/414/415/422/431/5xx。
9. Content-Type、media type、charset、Content-Encoding、Accept、Vary 与 content negotiation。
10. Java 25 `URI` 与 `HttpClient` 最小请求响应；Java 8 `HttpURLConnection` 和 Spring 5.2.15 `RestTemplate` 迁移。
11. URI/header/body 输入上限、allowlist、CR/LF 与冲突 framing 的安全边界。

## 研究 Gate 自检

- [x] 冻结课程 ID、顺序、唯一能力、前置课程、现代版本和项目版本。
- [x] URI/percent-encoding 结论来自 RFC 3986；URI Template 来自 RFC 6570；表单编码来自 WHATWG URL Standard 和 Oracle API。
- [x] HTTP 语义来自 RFC 9110，HTTP/1.1 消息边界和 framing 来自 RFC 9112，431 来自 RFC 6585；媒体类型以 RFC 9110 §8.3 为主，RFC 6838 只作注册背景。
- [x] Java 25、Java 8 和 Spring 5.2.15 均绑定到精确第一方 API/Reference；Boot 2.3.12 系统要求已核验。
- [x] 项目证据只有冻结 `ClientChatWsServer`，静态 SHA 与快照一致；未运行或修改 `dzzz-app`，无敏感数据。
- [x] 易错点具备触发条件、后果、修正和最小验证设计。
- [x] 安全结论绑定 OWASP 与 RFC/Java API；未作无测量性能断言。
- [x] 课程正文来源应仅进入后续课程 frontmatter 的统一“官方来源”区域；本研究稿不新增文末链接堆放章节。

## Stop Boundary

本研究稿只授权 Phase C 的 I-04 `http-uri-and-request-response-basics`。必须完成正文、`/tmp` Java
25/8 反馈环、工程 Gate、桌面/390px 浏览器证据和当前课程 signoff 后，才能领取 I-05。简单路线元数据
更新按风险做定向验证，不冒用旧复审快照；不得提前修改 I-05 或 `dzzz-app`。
