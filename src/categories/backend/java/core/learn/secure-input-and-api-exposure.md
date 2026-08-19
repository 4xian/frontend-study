---
id: backend.java.learn.advanced.secure-input-and-api-exposure
type: lesson
title: 输入安全、过滤链、CORS 与 API 暴露边界
summary: 用分层输入合同、单次过滤链、精确跨域策略和部署 Gate 收束 Java Web 接口暴露面
domain: backend
technology: java
module: core
stage: advanced
level: advanced
estimatedMinutes: 280
objectives:
  - 能按来源、语法、语义和 sink 分类不可信输入，并保持验证、保存与输出编码职责分离。
  - 能用参数绑定与服务端 allowlist 替代输入变异和关键词黑名单。
  - 能为 Servlet dispatch、FilterChain 和 SecurityFilterChain 写出可测试的单次执行与顺序合同。
  - 能区分 CORS、认证、授权与 CSRF，并精确配置 credentialed CORS。
  - 能用固定注册表收束动态 view 与 redirect，并隔离客户端错误和内部审计信息。
  - 能分别治理 API 文档生成、UI、路由、Actuator 暴露、访问控制和环境开关。
prerequisites:
  - backend.java.learn.intermediate.bean-validation-and-input-contracts
  - backend.java.learn.advanced.authentication-authorization-and-jwt
related: []
tags:
  - Java
  - 输入验证
  - FilterChain
  - Spring Security
  - CORS
  - CSRF
  - OpenAPI
  - Actuator
  - API 暴露
appliesTo: Java 25 / Spring Boot 4.1.0 / Spring Framework 7.0.8 / Spring Security 7.1.0 / Jakarta Servlet 6.2 主线；项目补充适用于 Java 8 / Spring Boot 2.3.12.RELEASE / Spring Framework 5.2.15.RELEASE / Spring Security 5.3.9.RELEASE / javax.servlet
modernBaseline:
  java: '25'
  springBoot: 4.1.0
  springFramework: 7.0.8
  springSecurity: 7.1.0
  jakartaServlet: '6.2'
legacyBaseline:
  java: '8'
  springBoot: 2.3.12.RELEASE
  springFramework: 5.2.15.RELEASE
  springSecurity: 5.3.9.RELEASE
  servletPackage: javax.servlet
verifiedAt: 2026-08-14
sources:
  - id: boot410-bom
    title: Spring Boot 4.1.0 dependency BOM
    url: https://repo1.maven.org/maven2/org/springframework/boot/spring-boot-dependencies/4.1.0/spring-boot-dependencies-4.1.0.pom
    sourceType: release-note
    appliesTo: Spring Boot 4.1.0
    claims: ['Boot 4.1.0 管理 Spring Framework 7.0.8 与 Spring Security 7.1.0']
  - id: boot2312-bom
    title: Spring Boot 2.3.12 dependency BOM
    url: https://repo1.maven.org/maven2/org/springframework/boot/spring-boot-dependencies/2.3.12.RELEASE/spring-boot-dependencies-2.3.12.RELEASE.pom
    sourceType: release-note
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims: ['旧线管理 Spring Framework 5.2.15.RELEASE 与 Spring Security 5.3.9.RELEASE']
  - id: servlet62-filter-chain
    title: Jakarta Servlet 6.2 FilterChain API
    url: https://jakarta.ee/specifications/servlet/6.2/apidocs/jakarta.servlet/jakarta/servlet/filterchain
    sourceType: api-doc
    appliesTo: Jakarta Servlet 6.2
    claims: ['doFilter 调用链中下一个 filter 或目标资源，不调用会阻断下游，多次调用会多次进入下游']
  - id: security71-servlet-architecture
    title: Spring Security 7.1 Servlet Architecture
    url: https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/architecture.adoc
    sourceType: official-reference
    appliesTo: Spring Security 7.1.0
    claims: ['FilterChainProxy 选择首个匹配 SecurityFilterChain，过滤器顺序承载安全合同']
  - id: security71-cors
    title: Spring Security 7.1 CORS
    url: https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/integrations/cors.adoc
    sourceType: official-reference
    appliesTo: Spring Security 7.1.0
    claims: ['CORS 必须先于 Spring Security 处理 preflight']
  - id: security71-csrf
    title: Spring Security 7.1 CSRF
    url: https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/exploits/csrf.adoc
    sourceType: official-reference
    appliesTo: Spring Security 7.1.0
    claims: ['浏览器自动携带 cookie 或 Basic 凭据时仍有 CSRF 语义，CORS 不能替代 CSRF']
  - id: framework708-once-per-request-filter
    title: Spring Framework 7.0.8 OncePerRequestFilter API
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/filter/OncePerRequestFilter.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims: ['基类提供每个请求 dispatch 一次的语义，并允许选择 async 和 error dispatch 行为']
  - id: framework708-cors-configuration
    title: Spring Framework 7.0.8 CorsConfiguration API
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/cors/CorsConfiguration.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims: ['origin、method、header、credentials、private network 与 max age 是不同配置轴']
  - id: fetch-cors
    title: Fetch Standard HTTP CORS Protocol
    url: https://fetch.spec.whatwg.org/#http-cors-protocol
    sourceType: specification
    appliesTo: browser Fetch CORS protocol
    claims: ['credentialed response 不能使用通配 Access-Control-Allow-Origin，CORS 不是服务器认证']
  - id: owasp-input-validation
    title: OWASP Input Validation Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: untrusted input validation
    claims: ['尽早执行语法和语义 allowlist 校验，validation 不替代输出编码与参数化查询']
  - id: owasp-xss-prevention
    title: OWASP Cross Site Scripting Prevention Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: XSS prevention
    claims: ['输出编码取决于 HTML、attribute、JavaScript、CSS 与 URL 上下文']
  - id: owasp-rest-security
    title: OWASP REST Security Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: REST API exposure
    claims: ['HTTPS、method、输入、content type、管理端点、错误与安全头需要分别治理']
  - id: cwe20-input-validation
    title: CWE-20 Improper Input Validation
    url: https://cwe.mitre.org/data/definitions/20.html
    sourceType: security-standard
    appliesTo: improper input validation
    claims: ['输入需按结构、长度、范围与语义合同验证']
  - id: cwe79-xss
    title: CWE-79 Cross-site Scripting
    url: https://cwe.mitre.org/data/definitions/79.html
    sourceType: security-standard
    appliesTo: cross-site scripting
    claims: ['不可信输入进入 Web 页面时需要按输出上下文中和']
  - id: cwe209-error-disclosure
    title: CWE-209 Error Message Information Exposure
    url: https://cwe.mitre.org/data/definitions/209.html
    sourceType: security-standard
    appliesTo: error information exposure
    claims: ['外部错误合同与包含内部细节的审计信息必须分离']
  - id: framework708-redirect-view
    title: Spring Framework 7.0.8 RedirectView API
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/servlet/view/RedirectView.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8 MVC
    claims: ['外部输入不能无 allowlist 地决定完整 view 或 redirect target']
  - id: cwe601-open-redirect
    title: CWE-601 Open Redirect
    url: https://cwe.mitre.org/data/definitions/601.html
    sourceType: security-standard
    appliesTo: user-controlled redirects
    claims: ['用户可控重定向目标应改为稳定 ID 到服务端固定目标的映射']
  - id: boot410-actuator-exposure-api
    title: Spring Boot 4.1 WebEndpointProperties Exposure API
    url: https://docs.spring.io/spring-boot/4.1/api/java/org/springframework/boot/actuate/autoconfigure/endpoint/web/WebEndpointProperties.Exposure.html
    sourceType: api-doc
    appliesTo: Spring Boot 4.1.0 Actuator
    claims: ['include 和 exclude 决定 Web 暴露，与 endpoint enabled 状态不同']
  - id: boot410-actuator-endpoints
    title: Spring Boot 4.1 Actuator Endpoints
    url: https://docs.spring.io/spring-boot/reference/actuator/endpoints.html
    sourceType: official-reference
    appliesTo: Spring Boot 4.1
    claims: ['endpoint enablement、exposure 与访问控制是三个边界']
  - id: springdoc-properties
    title: springdoc-openapi Properties
    url: https://springdoc.org/properties
    sourceType: official-reference
    appliesTo: springdoc-openapi property surface
    claims: ['API docs 与 Swagger UI 有独立开关，路由 404 不等于停止生成']
projectEvidence:
  - file: dzzz-app/src/main/java/com/tdh/bdzz/filter/XssHttpServletRequestWrapper.java
    symbol: com.tdh.bdzz.filter.XssHttpServletRequestWrapper
    usage: rejected
  - file: dzzz-app/src/main/java/tdh/commons/security/web/utils/SqlFilterUtil.java
    symbol: tdh.commons.security.web.utils.SqlFilterUtil
    usage: rejected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/filter/AccessFilter.java
    symbol: com.tdh.bdzz.filter.AccessFilter
    usage: rejected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/SwaggerAccessBlockController.java
    symbol: com.tdh.bdzz.config.SwaggerAccessBlockController
    usage: rejected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/CorsConfig.java
    symbol: com.tdh.bdzz.config.CorsConfig
    usage: rejected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/SwaggerConfig.java
    symbol: com.tdh.bdzz.config.SwaggerConfig
    usage: rejected
  - file: dzzz-app/src/main/java/com/tdh/DzzzAreaApplication.java
    symbol: com.tdh.DzzzAreaApplication
    usage: rejected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/controller/ViewController.java
    symbol: com.tdh.bdzz.controller.ViewController
    usage: rejected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/SpringMvcConfig.java
    symbol: com.tdh.bdzz.config.SpringMvcConfig
    usage: rejected
---

# 输入安全、过滤链、CORS 与 API 暴露边界

## 为什么需要学习

把 `<` 替换掉不等于解决 XSS，把 `select` 删掉不等于阻止 SQL 注入，让浏览器通过 CORS 也不等于完成认证和授权。更危险的是，过滤器在异常后再次调用下游，可能让同一个请求重复执行业务。

本课把接口安全拆成连续 Gate：入口按用途验证、数据保持原义、sink 使用专用控制、过滤链最多进入一次、浏览器跨域策略精确匹配，最后从生成、路由、UI、管理端点和访问控制多层收束部署暴露面。

## 学习目标

- 能画出输入从 transport 到业务值再到 sink 的完整数据流。
- 能为 SQL、HTML、view 和 redirect 选择各自的专用控制。
- 能验证 REQUEST、ASYNC、ERROR dispatch 和多条安全链的执行结果。
- 能解释 preflight、credentials、CSRF 与资源授权之间的关系。
- 能证明生产环境没有生成或暴露不需要的文档与管理端点。

## 前置术语

不可信输入是调用者能够影响的值；sink 是 SQL、HTML、URL、日志等解释该值的目标。allowlist 定义允许的结构或有限集合，canonicalization 把多种等价表示收敛成一种。dispatch 表示 Servlet 容器对 REQUEST、ASYNC、ERROR 等一次分派，preflight 是浏览器在实际跨源请求前发送的 `OPTIONS` 探测。

## 零基础知识点详解

### 不可信输入要按来源、语法、语义和 sink 分类

**它是什么：** 为每个外部值记录来源、允许结构、业务含义和最终解释位置，而不是只贴“字符串”标签。

**有什么作用：** 同一文本进入数据库值、排序字段、HTML 或重定向时需要不同控制，分类能防止通用清洗器越权。

**什么时候使用：** 设计 HTTP、消息、文件或批处理入口时，在 DTO 约束前先建立输入清单。

**怎么使用：**

1. 标记 path、query、header、body、cookie 与持久化数据的信任来源。
2. 分别冻结长度、字符集、格式、范围和业务状态。
3. 追踪值进入 SQL value、identifier、HTML、URL、日志或其他 sink 的路径。

**最小示例：**

```java
/** 描述一个外部排序参数的用途合同。 */
record InputUse(String source, int maxLength, String sink) {}
```

**运行结果：** `sort` 被识别为有限 SQL identifier，而 `keyword` 被识别为参数值，两者不再走同一处理器。

**常见误区：** 只写 `@NotBlank` 就认为该值在所有 sink 都安全。

### 验证、规范化、业务保存与输出编码是不同阶段

**它是什么：** 验证决定是否接受；规范化收敛合法表示；保存保留业务值；输出编码在具体 sink 前中和控制字符。

**有什么作用：** 避免入口替换字符破坏姓名、公式或富文本，也避免把 HTML 编码后的字符串误存为业务事实。

**什么时候使用：** 一个值可能被保存并在多个输出上下文复用时必须分层。

**怎么使用：** 先限定解码次数和规范形式，再重新验证长度与语义，保存业务值，最后由 HTML/URL/JSON 渲染器按上下文处理。

**最小示例：**

```java
String businessText = requestText;
String htmlText = htmlEncoder.encode(businessText);
```

**运行结果：** 数据库仍保存 `a < b`，HTML 响应安全呈现相同文字而不执行标签。

**常见误区：** 在 servlet wrapper 中永久删除 `<`、`>`、引号或关键字。

### allowlist 结构校验优先于关键词 blacklist

**它是什么：** allowlist 描述可接受形状或有限值；blacklist 只能识别少量已知坏片段。

**有什么作用：** 降低大小写、编码、注释、分隔符和未来语法绕过带来的不确定性。

**什么时候使用：** 排序 key、状态、locale、文件类型、页面 ID 与长度有限的业务字段。

**怎么使用：** 用枚举、正则、parser 或固定映射接受已知结构；拒绝未知值，并把黑名单命中仅作为审计信号。

**最小示例：**

```java
Set<String> allowed = Set.of("created", "name");
if (!allowed.contains(sortKey)) throw new IllegalArgumentException("未知排序字段");
```

**运行结果：** `created` 被接受，`created desc` 和经过编码的变体都被拒绝。

**常见误区：** 黑名单没有命中就直接拼接字符串。

### SQL 值参数化，动态标识符由服务端映射

**它是什么：** 值通过 prepared parameter 传输；无法参数化的表名、列名和方向由稳定业务 key 映射成固定 SQL 片段。

**有什么作用：** 数据库把值当数据而非语法，同时阻止客户端控制 identifier。

**什么时候使用：** 搜索、分页、排序、报表列和多租户分表选择。

**怎么使用：** 使用 `WHERE name = ?` 绑定值，并以 `created -> created_at` 的服务端 map 选择列；未知 key 立即拒绝。

**最小示例：**

```java
String column = Map.of("created", "created_at", "name", "display_name").get(sortKey);
if (column == null) throw new IllegalArgumentException("未知排序字段");
String sql = "select * from account where tenant_id = ? order by " + column;
```

**运行结果：** tenant ID 始终是参数，排序只能落到两个固定列名之一。

**常见误区：** 对完整 SQL 做关键字替换后继续执行。

### XSS 控制位于具体输出上下文

**它是什么：** 在 HTML text、attribute、JavaScript、CSS 或 URL 位置使用对应编码或安全 API。

**有什么作用：** 同一个字符在不同 parser 中含义不同，sink 邻近控制能保持业务数据并正确中和语法。

**什么时候使用：** 服务端模板、富文本渲染、DOM 更新、邮件 HTML 或动态 URL。

**怎么使用：** 优先让模板默认转义；把值放入文本节点；富文本用专用 sanitizer；禁止把不可信值拼进脚本源码。

**最小示例：**

```html
<p th:text="${displayName}"></p>
```

**运行结果：** `<img onerror=...>` 作为文字显示，不成为元素或事件处理器。

**常见误区：** 用一个输入 filter 宣称覆盖所有 HTML、attribute 与 JavaScript 上下文。

### Servlet FilterChain 每个 dispatch 最多调用一次

**它是什么：** filter 在一个 dispatch 中选择阻断，或调用一次 `chain.doFilter` 把控制权交给下游。

**有什么作用：** 避免重复写响应、重复扣款、重复更新与难以推断的异常流程。

**什么时候使用：** 所有认证、日志、输入校验、限流与包装器 filter。

**怎么使用：** 前置检查失败直接返回；成功只调用一次；下游异常传播或统一映射，禁止 catch 后重试整条 chain。

**最小示例：**

```java
if (!requestAllowed(request)) {
    response.sendError(400);
    return;
}
chain.doFilter(request, response);
```

**运行结果：** 拒绝路径调用零次，成功和下游异常路径都只调用一次。

**常见误区：** 在 `catch` 中再次调用 `chain.doFilter` 试图“恢复”。

### OncePerRequestFilter 的 dispatch 策略必须显式决定

**它是什么：** Spring 基类用请求属性避免同一 dispatch 重复执行，并提供 async/error dispatch 选择点。

**有什么作用：** 让校验、context 初始化和清理在容器重新分派时仍有确定语义。

**什么时候使用：** 应用存在异步 MVC、异常转发或容器 ERROR dispatch 时。

**怎么使用：** 记录 REQUEST、ASYNC、ERROR 是否执行以及状态如何传播；覆盖对应方法，并用真实 dispatcher 测试次数。

**最小示例：**

```java
/** 指定异步再次分派时不重复执行当前过滤器。 */
@Override
protected boolean shouldNotFilterAsyncDispatch() {
    return true;
}
```

**运行结果：** 主 REQUEST 执行一次，ASYNC redispatch 不重复执行该 filter；ERROR 行为由另一条明确策略决定。

**常见误区：** 把类名中的 once 理解为跨所有线程和所有 dispatch 只运行一次。

### SecurityFilterChain 的 matcher 与顺序需要矩阵测试

**它是什么：** `FilterChainProxy` 按配置顺序选择首个匹配链，链内过滤器再按安全顺序执行。

**有什么作用：** 防止宽 matcher 抢先匹配，或新增路径落到较弱链。

**什么时候使用：** API、静态资源、文档和 management 使用多条链时。

**怎么使用：** 为每条链列 method/path/dispatcher/认证要求；从最具体到 fallback 排序；测试首个匹配和最终拒绝。

**最小示例：**

```java
/** 为管理端点创建优先匹配且要求运维权限的安全链。 */
@Bean @Order(1)
SecurityFilterChain management(HttpSecurity http) throws Exception {
    return http.securityMatcher("/actuator/**")
        .authorizeHttpRequests(a -> a.anyRequest().hasAuthority("ops:read"))
        .build();
}
```

**运行结果：** management 路径先进入专用链，未知业务路径仍由后续 fallback 认证或拒绝。

**常见误区：** 只验证每条配置能启动，不验证同一路径实际选中了哪条链。

### CORS 是浏览器跨源读取协议

**它是什么：** 浏览器根据 origin、preflight 和响应头决定脚本能否读取跨源响应。

**有什么作用：** 允许受控前端调用 API，但不会阻止 curl、后端服务或攻击者向服务器发送请求。

**什么时候使用：** 浏览器页面需要从另一个 origin 调用接口时。

**怎么使用：** 先完成服务器认证和资源授权，再配置允许的 origin/method/header；让 CORS 在安全认证链前处理 preflight。

**最小示例：**

```java
configuration.setAllowedOrigins(List.of("https://console.example.test"));
configuration.setAllowedMethods(List.of("GET", "POST"));
```

**运行结果：** 受信页面可读取响应，未列出的浏览器 origin 不能读取，但服务器仍需拒绝未授权请求。

**常见误区：** 认为没有 `Access-Control-Allow-Origin` 就能保护服务器 API。

### credentialed CORS 必须精确匹配策略轴

**它是什么：** 携带 cookie 或其他 credentials 的跨源请求，需要显式 origin，且 method、header、credentials 与 max age 分别决定。

**有什么作用：** 避免任意站点借用用户浏览器凭据读取敏感响应。

**什么时候使用：** 跨源前端确实依赖 session cookie 或浏览器凭据时。

**怎么使用：** 枚举完整可信 origin；只开放必要 method/header；决定 `allowCredentials`；把 preflight 与 actual request 都纳入测试。

**最小示例：**

```java
configuration.setAllowedOrigins(List.of("https://console.example.test"));
configuration.setAllowCredentials(true);
configuration.setAllowedHeaders(List.of("Content-Type", "X-CSRF-TOKEN"));
```

**运行结果：** evil origin 的 preflight 被拒绝，可信 origin 仍须通过 CSRF、认证和授权。

**常见误区：** 使用任意 origin 或宽泛 pattern，同时打开 credentials。

### 动态 view 与 redirect 使用稳定注册表

**它是什么：** 客户端只提交稳定页面 ID，服务端把 ID 映射到固定模板或相对跳转目标。

**有什么作用：** 阻止路径、协议、外部域名和模板表达式进入 view resolver。

**什么时候使用：** 登录后跳转、帮助页、通知链接或少量可选模板。

**怎么使用：** 建立不可变 map；未知 ID 拒绝；redirect 只使用固定同站目标，外部 URL 走独立审计流程。

**最小示例：**

```java
String view = Map.of("home", "pages/home", "help", "pages/help").get(pageId);
if (view == null) throw new IllegalArgumentException("未知页面");
return view;
```

**运行结果：** `home` 返回固定模板，`../admin`、`https://evil.test` 与未知值全部拒绝。

**常见误区：** `return request.getParameter("view")` 或拼接 `redirect:`。

### API 文档需要分别治理生成、路由与 UI

**它是什么：** OpenAPI 扫描/Bean、JSON route、Swagger UI/static resources、认证授权与环境开关是不同层。

**有什么作用：** 防止“页面 404”掩盖后台仍生成 schema 或另一个路径仍可下载 JSON。

**什么时候使用：** 应用引入 springdoc、Springfox 或其他接口文档生成器时。

**怎么使用：** 生产 profile 在配置与 Bean 条件层关闭 docs 和 UI；非生产也使用专用安全链；检查路由、Bean 与资源都符合合同。

**最小示例：**

```properties
springdoc.api-docs.enabled=false
springdoc.swagger-ui.enabled=false
```

**运行结果：** 生产环境不创建所禁用的文档能力，JSON 与 UI 路由均不存在；不是由额外 Controller 伪装 404。

**常见误区：** 只关闭 UI，或用同路径 Controller 覆盖生成器路由。

### Actuator 的启用、暴露与访问是三层 Gate

**它是什么：** endpoint 是否 enabled、是否通过 Web/JMX 暴露、调用者是否有权访问是三个独立决策。

**有什么作用：** 最小化生产攻击面，同时保留必要的健康与运维能力。

**什么时候使用：** 引入 Spring Boot Actuator 的所有服务。

**怎么使用：** 先决定必须启用的 endpoint，再按 transport include/exclude，最后配置网络边界和专用认证授权。

**最小示例：**

```properties
management.endpoints.web.exposure.include=health,info
management.endpoint.env.access=none
```

**运行结果：** Web 只暴露必要端点，敏感 endpoint 未启用；对 `health/info` 的访问策略仍由安全链决定。

**常见误区：** 配置 include/exclude 后就认为不再需要认证和网络隔离。

### 外部错误、内部日志与安全审计分离

**它是什么：** 客户端获得稳定 code、message 与 trace ID；内部日志保留受控诊断；安全审计记录主体、动作、资源与结果。

**有什么作用：** 既能排障和追责，又不向客户端泄露路径、查询、stack trace、token 或内部状态。

**什么时候使用：** 输入拒绝、认证失败、下游异常和管理端点错误。

**怎么使用：** 外部响应使用枚举错误码；日志按字段 allowlist 脱敏；审计与应用诊断分开授权、保留和告警。

**最小示例：**

```java
return new ApiError("INVALID_INPUT", "请求不符合输入合同", traceId);
```

**运行结果：** 客户端只看到稳定错误，内部可通过 trace ID 定位受保护日志。

**常见误区：** 把异常 message、SQL、绝对路径或 Authorization header 原样回显。

## 现代版本中的正确用法

现代主线使用 `jakarta.servlet`、Spring Framework 7.0.8 与 Spring Security 7.1.0。`CorsFilter` 或 MVC CORS 配置必须先于认证处理 preflight；多条 `SecurityFilterChain` 使用明确 matcher、顺序和 fallback。文档和 Actuator 由部署配置决定是否生成与暴露，安全链只承担已暴露端点的访问控制，不能替代关闭能力。

## 基本语法

```java
CorsConfiguration cors = new CorsConfiguration();
cors.setAllowedOrigins(List.of("https://console.example.test"));
cors.setAllowedMethods(List.of("GET", "POST"));
cors.setAllowedHeaders(List.of("Content-Type", "X-CSRF-TOKEN"));
cors.setAllowCredentials(true);
```

## 核心接口与完整示例

下面的纯 Java 模型不冒充 Spring 集成测试。它把输入、SQL identifier、filter chain、CORS、view 和暴露策略压成一个 Java 8 兼容反馈环；同一文件应分别在 Java 25 与 Java 8 编译运行两次。

```java
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

/** 验证输入、过滤链、跨域与部署暴露的最小可运行模型。 */
public final class SecureInputExposureExample {
    /** 保留原始业务文本，只验证结构与语义。 */
    static final class InputContract {
        private final Set<String> fields = set("comment", "displayName");

        /** 接受允许字段中的可打印业务文本，不变异其内容。 */
        String accept(String field, String value) {
            if (!fields.contains(field)) {
                throw new IllegalArgumentException("unknown field");
            }
            if (value == null || value.length() == 0 || value.length() > 80) {
                throw new IllegalArgumentException("invalid text");
            }
            for (int index = 0; index < value.length(); index++) {
                char current = value.charAt(index);
                if (Character.isISOControl(current)) {
                    throw new IllegalArgumentException("control character");
                }
            }
            return value;
        }
    }

    /** 将客户端排序 key 映射到固定 SQL identifier。 */
    static final class QueryOrder {
        private final Map<String, String> columns;

        /** 保存固定 SQL 文本与独立绑定参数。 */
        static final class QueryPlan {
            final String sql;
            final List<String> parameters;

            /** 创建参数化查询计划。 */
            QueryPlan(String sql, List<String> parameters) {
                this.sql = sql;
                this.parameters = parameters;
            }
        }

        /** 创建不可变的排序字段注册表。 */
        QueryOrder() {
            Map<String, String> mapping = new LinkedHashMap<String, String>();
            mapping.put("created", "created_at");
            mapping.put("name", "display_name");
            columns = Collections.unmodifiableMap(mapping);
        }

        /** 返回固定 identifier，未知 key 直接拒绝。 */
        String column(String key) {
            String column = columns.get(key);
            if (column == null) throw new IllegalArgumentException("unknown sort key");
            return column;
        }

        /** 使用固定 identifier 与占位符创建查询计划。 */
        QueryPlan plan(String key, String status) {
            String sql = "SELECT id FROM account WHERE status = ? ORDER BY " + column(key);
            return new QueryPlan(sql, Collections.singletonList(status));
        }
    }

    interface CheckedWork {
        /** 执行业务工作。 */
        void run();
    }

    /** 模拟每个 dispatch 最多调用一次下游。 */
    static final class FilterBoundary {
        /** 拒绝时不调用，允许时只调用一次，并原样传播异常。 */
        void apply(boolean allowed, CheckedWork downstream) {
            if (!allowed) return;
            downstream.run();
        }
    }

    /** 对 origin、method、headers 与 credentials 逐轴校验。 */
    static final class CorsPolicy {
        private final Set<String> origins = set("https://console.example.test");
        private final Set<String> methods = set("GET", "POST");
        private final Set<String> headers = set("content-type", "x-csrf-token");

        /** 只允许精确来源、必要方法和请求头，凭据策略不接受 wildcard。 */
        boolean allows(String origin, String method, Set<String> requestedHeaders,
                boolean credentials, boolean wildcardOrigin) {
            if (wildcardOrigin && credentials) return false;
            return origins.contains(origin) && methods.contains(method)
                    && headers.containsAll(lowercase(requestedHeaders));
        }

        /** 处理预检或实际请求，只有允许的实际请求才进入下游。 */
        boolean handle(boolean preflight, String origin, String method,
                Set<String> requestedHeaders, boolean credentials, boolean wildcardOrigin,
                CheckedWork downstream) {
            boolean allowed = allows(origin, method, requestedHeaders, credentials, wildcardOrigin);
            if (allowed && !preflight) downstream.run();
            return allowed;
        }
    }

    /** 将稳定页面 ID 映射到固定服务端 view。 */
    static final class ViewRegistry {
        private final Map<String, String> views;

        /** 创建不可变页面注册表。 */
        ViewRegistry() {
            Map<String, String> mapping = new LinkedHashMap<String, String>();
            mapping.put("home", "pages/home");
            mapping.put("help", "pages/help");
            views = Collections.unmodifiableMap(mapping);
        }

        /** 未知、路径或协议输入都没有映射，直接拒绝。 */
        String resolve(String pageId) {
            String view = views.get(pageId);
            if (view == null) throw new IllegalArgumentException("unknown page");
            return view;
        }
    }

    /** 分别表达文档生成、UI 与管理端点暴露。 */
    static final class ExposurePolicy {
        final boolean docsGenerated;
        final boolean docsUi;
        final boolean managementExposed;

        /** 构造三轴暴露合同。 */
        ExposurePolicy(boolean docsGenerated, boolean docsUi, boolean managementExposed) {
            this.docsGenerated = docsGenerated;
            this.docsUi = docsUi;
            this.managementExposed = managementExposed;
        }

        /** 生产环境只有三层都关闭才满足本示例合同。 */
        boolean productionClosed() {
            return !docsGenerated && !docsUi && !managementExposed;
        }
    }

    /** 创建 Java 8 兼容的集合。 */
    static Set<String> set(String... values) {
        return new LinkedHashSet<String>(Arrays.asList(values));
    }

    /** 把请求头名称收敛为策略使用的小写形式。 */
    static Set<String> lowercase(Set<String> values) {
        Set<String> result = new LinkedHashSet<String>();
        for (String value : values) result.add(value.toLowerCase(java.util.Locale.ROOT));
        return result;
    }

    /** 断言反馈环合同。 */
    static void require(boolean condition, String message) {
        if (!condition) throw new IllegalStateException(message);
    }

    /** 断言输入被拒绝。 */
    static void expectRejected(CheckedWork work) {
        try {
            work.run();
            throw new IllegalStateException("expected rejection");
        } catch (IllegalArgumentException expected) {
            // 预期拒绝。
        }
    }

    /** 运行成功、拒绝和异常路径。 */
    public static void main(String[] args) {
        InputContract input = new InputContract();
        String preserved = input.accept("comment", "a < b and select is ordinary text");
        require(preserved.indexOf('<') >= 0 && preserved.indexOf("select") >= 0, "preserve text");
        expectRejected(new CheckedWork() {
            /** 验证未知业务字段被 allowlist 拒绝。 */
            public void run() { input.accept("adminNote", "ordinary text"); }
        });

        QueryOrder order = new QueryOrder();
        QueryOrder.QueryPlan plan = order.plan("created", "active");
        require(plan.sql.indexOf('?') >= 0, "business value uses placeholder");
        require(plan.sql.indexOf("active") < 0, "business value absent from SQL");
        require(plan.parameters.equals(Collections.singletonList("active")), "bound value retained");
        require(plan.sql.endsWith("created_at"), "known identifier mapped");
        expectRejected(new CheckedWork() {
            /** 验证未知排序 identifier 被拒绝。 */
            public void run() { order.plan("created desc", "active"); }
        });

        final AtomicInteger calls = new AtomicInteger();
        FilterBoundary filter = new FilterBoundary();
        filter.apply(false, new CheckedWork() {
            /** 记录拒绝路径是否错误进入下游。 */
            public void run() { calls.incrementAndGet(); }
        });
        require(calls.get() == 0, "rejected dispatch avoids downstream");
        filter.apply(true, new CheckedWork() {
            /** 记录允许路径进入下游一次。 */
            public void run() { calls.incrementAndGet(); }
        });
        require(calls.get() == 1, "accepted dispatch enters downstream once");
        try {
            filter.apply(true, new CheckedWork() {
                /** 记录异常路径进入下游一次并抛出原异常。 */
                public void run() {
                    calls.incrementAndGet();
                    throw new IllegalStateException("downstream failure");
                }
            });
        } catch (IllegalStateException expected) {
            require("downstream failure".equals(expected.getMessage()), "propagate failure");
        }
        require(calls.get() == 2, "failed dispatch enters downstream once");

        CorsPolicy cors = new CorsPolicy();
        final AtomicInteger businessCalls = new AtomicInteger();
        CheckedWork business = new CheckedWork() {
            /** 记录实际请求进入业务下游。 */
            public void run() { businessCalls.incrementAndGet(); }
        };
        boolean trustedPreflight = cors.handle(true, "https://console.example.test", "POST",
                set("Content-Type", "X-CSRF-TOKEN"), true, false, business);
        require(trustedPreflight && businessCalls.get() == 0, "preflight avoids business");
        boolean trustedActual = cors.handle(false, "https://console.example.test", "POST",
                set("Content-Type", "X-CSRF-TOKEN"), true, false, business);
        require(trustedActual && businessCalls.get() == 1, "trusted actual enters business once");
        require(!cors.handle(false, "https://evil.test", "POST", set("Content-Type"),
                true, false, business) && businessCalls.get() == 1,
                "reject evil origin");
        require(!cors.handle(false, "https://console.example.test", "POST",
                set("Content-Type"), true, true, business) && businessCalls.get() == 1,
                "reject wildcard credentials");

        ViewRegistry views = new ViewRegistry();
        require("pages/home".equals(views.resolve("home")), "known view");
        expectRejected(new CheckedWork() {
            /** 验证路径输入不能充当页面 ID。 */
            public void run() { views.resolve("../admin"); }
        });
        expectRejected(new CheckedWork() {
            /** 验证协议输入不能充当页面 ID。 */
            public void run() { views.resolve("https://evil.test"); }
        });
        expectRejected(new CheckedWork() {
            /** 验证普通未知页面 ID 也会被拒绝。 */
            public void run() { views.resolve("missing"); }
        });

        ExposurePolicy production = new ExposurePolicy(false, false, false);
        require(production.productionClosed(), "production exposure closed");
        require(!new ExposurePolicy(true, false, false).productionClosed(),
                "route 404 does not disable generation");
        require(!new ExposurePolicy(false, true, false).productionClosed(),
                "disabled generation does not close docs UI");
        require(!new ExposurePolicy(false, false, true).productionClosed(),
                "disabled docs do not close management exposure");

        System.out.println("SECURE_INPUT_EXPOSURE_PASS preserved=1 blacklistRejected=1 "
                + "chainOnce=1 corsRejected=1 viewRejected=1 docsOff=1");
    }
}
```

## 从零跟着做

1. 为每个入口列出来源、解码次数、结构、长度、业务状态和 sink。
2. 删除通用输入变异责任，改为入口 allowlist、SQL 参数绑定和输出上下文编码。
3. 为每个 filter 写出拒绝、成功、下游异常与 REQUEST/ASYNC/ERROR dispatch 表。
4. 为安全链列 matcher 顺序和 fallback，再验证 CORS preflight 先于认证处理。
5. 把动态 view/redirect 改为稳定 ID 注册表。
6. 分别检查文档生成、JSON、UI、Actuator enablement、exposure、access 和网络边界。
7. 用完整示例跑双 JDK，再用临时框架 fixture 或浏览器验证真实路由和响应头。

## 如何使用

在 Spring 应用中，让 DTO/validator 拥有语法和业务输入约束，让 repository 拥有参数绑定，让 renderer 拥有输出编码，让安全配置拥有 filter/CORS/docs/management 边界。每个责任只有一个 owner，避免 wrapper、interceptor、controller 和 view resolver 重复改写同一值。

## 适用与不适用场景

适用于 Java Web API、服务端模板、浏览器跨域调用、OpenAPI 文档与 Actuator 暴露治理。SSRF、路径穿越和不安全反序列化需要各自 sink 的专用控制，分别由 HTTP 集成、文件存储和 JSON 数据合同课程承担；本课不扩展这些主题。

## 当前项目补充

冻结矩阵只证明项目中存在输入 wrapper、关键字过滤器、访问 filter、CORS、动态 view 和 Swagger 配置等风险证据。9 个唯一文件全部标记为 `rejected`：它们不能证明当前系统必然可利用，也不能作为推荐实现。本课只转录冻结路径与稳定符号，不读取项目源文件，不把类名包装成 observed 能力。

## Java 8 / Spring Boot 2.3 兼容写法

旧线使用 `javax.servlet.Filter` 与 Spring Security 5.3.9；现代线使用 `jakarta.servlet` 与 Security 7.1。Boot 2.3 常见 `WebSecurityConfigurerAdapter`、`authorizeRequests` 和 `antMatchers` 不能原样复制到现代主线。Java 8 完整示例使用显式泛型和匿名类，不依赖 record、`Map.of` 或 `Set.of`；迁移时先保持 matcher、dispatch、CORS 与暴露行为，再替换 API 形态。

## 新旧版本差异

- **Servlet 包名：** 旧线是 `javax.servlet`，现代线是 `jakarta.servlet`；不能混用依赖或 import。
- **安全配置：** 旧线以 adapter DSL 为主，现代线使用 `SecurityFilterChain` Bean 与新的授权 DSL。
- **默认值：** CORS、CSRF、dispatcher 与 endpoint 默认行为都按具体版本核验，不靠旧配置推断。
- **文档生成：** Springfox Swagger 2 是 legacy 能力；现代 OpenAPI 实现需单独选型和条件化配置。
- **迁移策略：** 先冻结行为矩阵，再迁移包名与配置 API，最后验证路由、响应头、Bean 和浏览器行为。

## 易错点

:::pitfalls
### 错误：统一替换字符清洗所有输入

**触发条件：** wrapper 全局删除 `<`、`>`、引号或其他字符。

**原因：** 输入验证和输出编码被混为一个与 sink 无关的变异步骤。

**后果：** 业务数据损坏，且 attribute、JavaScript 等上下文仍可能不安全。

**错误示例：**

```java
value = value.replace("<", "");
```

**正确写法：**

```java
String stored = validateBusinessText(value);
```

**影响版本：** Java 8/25 与所有 Web 框架。

**验证方式：** 危险但合法文本保持原义；每个输出 sink 单独验证编码结果。

**来源：** `owasp-input-validation`、`owasp-xss-prevention`、`cwe79-xss`。

### 错误：SQL 关键词黑名单代替参数绑定

**触发条件：** 删除 `select`、`union`、空格或注释后拼接 SQL。

**原因：** blacklist 无法覆盖编码、语法与数据库方言，值和标识符边界仍未建立。

**后果：** 绕过、误杀正常文本或形成注入风险。

**错误示例：**

```java
String sql = "select * from account where name='" + clean(name) + "'";
```

**正确写法：**

```java
PreparedStatement statement = connection.prepareStatement("select * from account where name=?");
statement.setString(1, name);
```

**影响版本：** Java 8/25 与 JDBC。

**验证方式：** 值只经 bind 参数传入；动态 identifier 只能来自固定服务端 map。

**来源：** `owasp-input-validation`、`owasp-rest-security`、`cwe20-input-validation`。

### 错误：规范化后不重新验证

**触发条件：** decode、trim、Unicode normalize 或大小写收敛后直接使用。

**原因：** 规范化可能改变长度、字符与业务语义，旧验证结论已不再对应当前值。

**后果：** 绕过长度/allowlist，或不同组件对同一值产生歧义。

**错误示例：**

```java
return URLDecoder.decode(value, "UTF-8");
```

**正确写法：**

```java
String normalized = normalizeOnce(value);
return validateLengthAndMeaning(normalized);
```

**影响版本：** Java 8/25。

**验证方式：** 对规范化前后长度、字符、等价表示和拒绝路径分别断言。

**来源：** `owasp-input-validation`、`cwe20-input-validation`。

### 错误：filter 捕获异常后再次调用 chain

**触发条件：** 下游抛异常后在 `catch` 中执行第二次 `doFilter`。

**原因：** 把整条业务链当作可安全重试的函数。

**后果：** 同一请求重复写响应、更新数据或产生副作用。

**错误示例：**

```java
try { chain.doFilter(request, response); }
catch (Exception ignored) { chain.doFilter(request, response); }
```

**正确写法：**

```java
chain.doFilter(request, response); // 异常传播给统一边界
```

**影响版本：** javax/jakarta Servlet 全版本。

**验证方式：** 拒绝、成功和下游异常路径分别断言调用次数为 0、1、1。

**来源：** `servlet62-filter-chain`。

### 错误：忽略 ASYNC 与 ERROR dispatch

**触发条件：** 只测普通 REQUEST，默认所有 redispatch 都有相同执行次数。

**原因：** 容器可在不同线程或异常路径重新分派，请求属性与 context 生命周期不同。

**后果：** 安全校验漏跑、重复审计或 thread context 泄漏。

**错误示例：**

```java
class AuditFilter extends OncePerRequestFilter { /* 使用所有默认值 */ }
```

**正确写法：**

```java
/** 指定错误再次分派时仍执行当前过滤器。 */
@Override protected boolean shouldNotFilterErrorDispatch() { return false; }
```

**影响版本：** Spring Framework 5.2/7.0 与 Servlet 容器。

**验证方式：** 用真实 REQUEST、ASYNC、ERROR dispatcher 记录执行次数、线程和清理结果。

**来源：** `framework708-once-per-request-filter`、`servlet62-filter-chain`。

### 错误：多条安全链 matcher 重叠

**触发条件：** 宽 `/api/**` 链排在更具体的 `/api/admin/**` 链前。

**原因：** `FilterChainProxy` 只选择首个匹配链。

**后果：** 管理端点进入较弱规则，或必要 filter 没有执行。

**错误示例：**

```java
@Order(1) securityMatcher("/api/**");
```

**正确写法：**

```java
@Order(1) securityMatcher("/api/admin/**");
```

**影响版本：** Spring Security 5.3/7.1，配置 API 不同。

**验证方式：** 对 method/path/dispatcher 矩阵断言首个链、filter 顺序和最终拒绝。

**来源：** `security71-servlet-architecture`。

### 错误：把 CORS 当服务器访问控制

**触发条件：** 只依赖浏览器没有允许头，服务器接口本身没有认证授权。

**原因：** CORS 约束浏览器脚本读取，不约束 curl 或服务端客户端发送请求。

**后果：** 非浏览器调用者直接访问敏感 API。

**错误示例：**

```java
if (originNotAllowed) return; // 此后没有资源授权
```

**正确写法：**

```java
authorize(principal, action, resource);
```

**影响版本：** 所有浏览器和服务器版本。

**验证方式：** 无 Origin 的非浏览器请求仍必须经过认证和资源授权。

**来源：** `fetch-cors`、`security71-cors`、`security71-csrf`。

### 错误：credentialed CORS 使用宽泛 origin

**触发条件：** credentials 开启，同时使用任意 origin 或可被攻击者匹配的 pattern。

**原因：** 浏览器凭据可能随跨源请求发送，响应读取权被授予不可信页面。

**后果：** 用户会话数据被恶意站点读取，或配置被浏览器拒绝。

**错误示例：**

```java
cors.setAllowedOriginPatterns(List.of("*"));
cors.setAllowCredentials(true);
```

**正确写法：**

```java
cors.setAllowedOrigins(List.of("https://console.example.test"));
cors.setAllowCredentials(true);
```

**影响版本：** Fetch CORS；Spring 5.2/7.0 API 与校验行为需分别核验。

**验证方式：** evil/trusted origin 的 preflight 与 actual request 都测试 method、header、credentials 和 CSRF。

**来源：** `fetch-cors`、`framework708-cors-configuration`、`security71-cors`。

### 错误：请求值直接成为 view 或 redirect

**触发条件：** path/query 参数直接返回给 view resolver，或拼进 `redirect:`。

**原因：** 客户端获得模板名、路径、协议或外部域名选择权。

**后果：** 任意模板解析、路径混淆或开放重定向。

**错误示例：**

```java
return request.getParameter("next");
```

**正确写法：**

```java
return views.resolve(pageId);
```

**影响版本：** Spring MVC 5.2/7.0。

**验证方式：** 固定 ID 成功；路径、协议、`..`、编码变体和未知值全部拒绝。

**来源：** `framework708-redirect-view`、`cwe601-open-redirect`。

### 错误：用 Controller 404 假装关闭文档

**触发条件：** 增加同路径 Controller，却保留文档 Bean、扫描和生成器。

**原因：** 路由表象与能力生命周期被混为一层。

**后果：** schema 仍生成、其他路径仍暴露，启动和内存成本仍存在。

**错误示例：**

```java
/** 错误示例：只遮蔽文档路由，没有关闭文档生成能力。 */
@GetMapping("/v3/api-docs") ResponseEntity<Void> blocked() { return notFound(); }
```

**正确写法：**

```properties
springdoc.api-docs.enabled=false
```

**影响版本：** springdoc 属性面；legacy Springfox 需要独立迁移方案。

**验证方式：** 同时检查生成器 Bean、扫描、JSON route、UI 与静态资源不存在。

**来源：** `springdoc-properties`。

### 错误：只关闭 Swagger UI

**触发条件：** UI 返回 404，但 OpenAPI JSON 仍可访问。

**原因：** UI 和 docs JSON 是两个独立开关。

**后果：** 接口、模型和安全方案仍可被枚举。

**错误示例：**

```properties
springdoc.swagger-ui.enabled=false
```

**正确写法：**

```properties
springdoc.swagger-ui.enabled=false
springdoc.api-docs.enabled=false
```

**影响版本：** springdoc-openapi property surface。

**验证方式：** 生产 profile 下 UI、JSON、相关 route 与 Bean 都符合关闭合同。

**来源：** `springdoc-properties`、`owasp-rest-security`。

### 错误：Actuator 只配置 include/exclude

**触发条件：** 暴露少量 endpoint 后不再配置安全链和网络边界。

**原因：** exposure 不等于 endpoint access，enabled 也不等于 exposed。

**后果：** 管理信息或操作对未授权网络和主体开放。

**错误示例：**

```properties
management.endpoints.web.exposure.include=*
```

**正确写法：**

```properties
management.endpoints.web.exposure.include=health,info
```

**影响版本：** Spring Boot 4.1；Boot 2.3 默认值和属性按归档文档核验。

**验证方式：** 分别断言 endpoint enabled、Web exposed、网络可达和调用者 authority。

**来源：** `boot410-actuator-exposure-api`、`boot410-actuator-endpoints`。

### 错误：向客户端回显内部异常细节

**触发条件：** 把异常 message、stack trace、SQL、路径、token 或查询写入响应。

**原因：** 外部错误合同和内部诊断没有分层。

**后果：** 攻击者获得组件、数据和控制流信息，敏感凭据可能泄漏。

**错误示例：**

```java
return ResponseEntity.internalServerError().body(exception.toString());
```

**正确写法：**

```java
return ResponseEntity.internalServerError().body(new ApiError("INTERNAL", traceId));
```

**影响版本：** Java 8/25 与所有 Web 框架。

**验证方式：** 响应只含稳定 code/message/traceId；日志字段脱敏并有独立访问控制。

**来源：** `cwe209-error-disclosure`、`owasp-rest-security`。

### 错误：把旧 Springfox 与 javax 配置复制到现代主线

**触发条件：** 升级 Java/Boot 时直接复制 `javax.servlet`、adapter DSL 与 Swagger 2 全局配置。

**原因：** 包名、配置 API、默认值和文档生成器生命周期已经变化。

**后果：** 编译失败、错误链顺序、暴露面漂移或 legacy 依赖继续污染主线。

**错误示例：**

```java
import javax.servlet.Filter; // 直接放入 Boot 4.1 主线
```

**正确写法：**

```java
import jakarta.servlet.Filter;
```

**影响版本：** Java 8/Boot 2.3/Security 5.3 与 Java 25/Boot 4.1/Security 7.1。

**验证方式：** 两条依赖树隔离编译；对 matcher、dispatch、CORS、docs 和 Actuator 行为做迁移前后矩阵验证。

**来源：** `boot2312-bom`、`boot410-bom`、`security71-servlet-architecture`、`springdoc-properties`。
:::

## 错误与正确写法对比

### 错误写法

```java
String cleaned = raw.replace("<", "").replace("select", "");
return "redirect:" + cleaned;
```

### 正确写法

```java
String businessValue = inputContract.accept("comment", raw);
String view = viewRegistry.resolve(pageId);
```

## 安全注意

安全控制必须靠可验证 Gate，而不是类名或配置意图。未知输入、未知 chain、未知 origin、未知 view、未知 endpoint 和关闭状态不明的文档能力都应 fail closed；同时保留业务原值，避免安全层悄悄改变用户数据。

## 性能注意

本课不预设 map/set、输入校验或安全链的普遍性能结论。先用 JFR 记录真实负载下的分配、CPU 与锁等待，定位热点后再用 JMH 隔离比较候选实现；报告必须同时记录 JDK、硬件、数据规模、预热、并发度和分位结果。输入大小限制仍应放在读取与解析边界，因为它首先是资源使用合同，而不是未经测量的优化结论。

## 如何验证

- 从 Markdown 提取完整示例，在 Java 25 与 Java 8 各编译运行两次，核对固定摘要。
- 用临时 Spring fixture 验证 REQUEST/ASYNC/ERROR、首个安全链、preflight、actual request 和 CSRF。
- 在生产 profile 核对 docs/UI/Bean/static resources 以及 Actuator enablement/exposure/access。
- 用真实 Catalog 冷启动验证课程可加载、block 数稳定且下一课仍为 planned。
- 浏览器桌面和 390px 视口检查标题、来源、项目证据、代码与 14 个 pitfalls。

:::exercise
### 练习：为一个管理 API 设计输入与暴露 Gate

**要求：** 选择一个包含排序、动态帮助页、浏览器跨域和 Actuator 的 API，写出输入分类、SQL 参数化、filter dispatch、CORS、view registry、docs 与 management 的 owner 和失败合同。

**验收：** 至少覆盖一个危险但合法文本、未知排序 key、下游异常、evil origin、未知 view、docs 关闭和未授权 management 请求，并说明每个路径的预期调用次数或状态。

**参考答案：** 入口只验证结构和业务语义；SQL 值绑定、identifier 固定映射；filter 每 dispatch 最多一次；CORS 精确 origin 且不替代 CSRF/授权；view 使用稳定 ID；生产同时关闭 docs 生成与 UI；Actuator 分别验证 enabled、exposed、network 和 authority。
:::

## 本节小结

输入安全不是字符串清洗，而是从来源到 sink 的分层合同；过滤链不是异常重试器，而是每个 dispatch 最多交给下游一次；CORS 不是服务器授权；view、文档和管理端点都需要稳定注册表与多层部署 Gate。把这些边界分别交给明确 owner，才能在 Java 8 legacy 与 Java 25 现代主线中保持可迁移、可测试和 fail-closed。
