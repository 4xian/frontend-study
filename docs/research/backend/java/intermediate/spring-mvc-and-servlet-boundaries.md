# Phase C I-08：Spring MVC、Servlet 与请求生命周期研究

> 课程 ID：`backend.java.learn.intermediate.spring-mvc-and-servlet-boundaries`<br>
> Phase C 顺序：I-08<br>
> 预计学习时长：150 分钟<br>
> verifiedAt：2026-08-15<br>
> 现代基线：Java 25、Spring Boot 4.1.0、Spring Framework 7.0.8、Jakarta Servlet 6.1<br>
> 兼容基线：Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE、Servlet 4.0<br>
> 边界：只核验 I-08、Phase A 冻结路线、当前 I-08 资产与必要规范，不读取或研究 I-09

## 冻结课程合同

| 项目 | 冻结值 |
| --- | --- |
| 标题 | Spring MVC、Servlet 与请求生命周期 |
| 性质 | 必修、重排、复用；稳定 ID 与既有 URL 不变 |
| 预计学习时长 | 150 分钟 |
| 唯一前置课程 | `backend.java.learn.intermediate.spring-boot-and-configuration`（Phase C I-07） |
| 来源能力 | `JAVA-FRAMEWORK-008`、`JAVA-FRAMEWORK-010`、`JAVA-ENGINEERING-036`、`JAVA-RISK-022` |
| 选择原因 | Controller、Filter、Interceptor 和 Servlet 流都属于请求边界，必须先理解协议和调用顺序 |
| 项目读取边界 | 只使用冻结矩阵的路径、符号、计数和风险分类，不重新读取 `dzzz-app` |
| 历史正文状态 | 研究开始时仍为“API 合同”、260 分钟、三个旧前置与 `verifiedAt: 2026-08-09`；不是 Phase C 目标状态 |
| 历史 signoff 缺口 | 旧 signoff 只有 artifact 路径列表，没有当前正文路径与 SHA-256 对；本批关闭前必须补做绑定与对应验证 |
| 后继边界 | I-08 完整关闭前不得读取或研究 I-09 `backend.java.learn.intermediate.transactions-and-idempotency` |

## 官方来源核验

| 来源 | 适用版本 | 支撑结论 |
| --- | --- | --- |
| [Spring Boot System Requirements](https://docs.spring.io/spring-boot/4.1/system-requirements.html) | Spring Boot 4.1.0 | Boot 4.1.0 支持 Java 17 至 26，并要求 Spring Framework 7.0.8 或以上 |
| [Spring MVC DispatcherServlet](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html) | Spring Framework 7.0.8 | 前端控制器委托 HandlerMapping、HandlerAdapter、异常解析和视图处理 |
| [Annotated Controllers](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller.html) | Spring Framework 7.0.8 | Controller 用注解声明输入、映射、响应和异常处理 |
| [Mapping Requests](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html) | Spring Framework 7.0.8 | 路径、HTTP 方法、参数、请求头、consumes 和 produces 共同组成映射条件 |
| [Method Arguments](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/arguments.html) | Spring Framework 7.0.8 | PathVariable、RequestParam、RequestHeader、RequestBody 与 Servlet 对象参数合同 |
| [Return Values](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/return-types.html) | Spring Framework 7.0.8 | ResponseBody、ResponseEntity、ProblemDetail、异步和流式返回边界 |
| [Exceptions](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-exceptionhandler.html) | Spring Framework 7.0.8 | ExceptionHandler 与 ControllerAdvice 的匹配和响应职责 |
| [Interception](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/handlermapping-interceptor.html) | Spring Framework 7.0.8 | Interceptor 位于 HandlerMapping 链，不适合作为首要安全边界 |
| [HandlerInterceptor API](https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/servlet/HandlerInterceptor.html) | Spring Framework 7.0.8 | preHandle、postHandle、afterCompletion 的顺序及 Filter 分工 |
| [CORS](https://docs.spring.io/spring-framework/reference/web/webmvc-cors.html) | Spring Framework 7.0.8 | 预检、实际请求与全局/局部跨域配置 |
| [Filters / Forwarded Headers](https://docs.spring.io/spring-framework/reference/web/webmvc/filters.html#filters-forwarded-headers) | Spring Framework 7.0.8 | 应用无法判断转发头来自可信代理还是恶意客户端；边界代理应删除外部不可信转发头，`ForwardedHeaderFilter(removeOnly=true)` 可只删除而不使用 |
| [Asynchronous Requests](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-ann-async.html) | Spring Framework 7.0.8 | Callable、DeferredResult 与 Servlet 异步派发 |
| [Spring Boot Servlet Web Applications](https://docs.spring.io/spring-boot/reference/web/servlet.html) | Spring Boot 4.1.0 | Boot 的 MVC 自动配置、WebMvcConfigurer 和 CORS 扩展点 |
| [Spring Boot Starters](https://docs.spring.io/spring-boot/reference/using/build-systems.html#using.build-systems.starters) | Spring Boot 4.1.0 | `spring-boot-starter-webmvc` 是 Boot 4 的 MVC 与 Tomcat starter；旧 `spring-boot-starter-web` 已弃用 |
| [Jakarta Servlet 6.1 Specification](https://jakarta.ee/specifications/servlet/6.1/jakarta-servlet-spec-6.1) | Jakarta Servlet 6.1 | Filter chain、dispatcher type、请求/响应包装、异步和错误派发规范 |
| [Spring Boot 2.3.12 System Requirements](https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements) | Spring Boot 2.3.12.RELEASE | Java 8、Spring Framework 5.2.15、Tomcat 9 与 Servlet 4.0 的旧线基线 |
| [Spring Framework 5.2.15 Web](https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/web.html) | Spring Framework 5.2.15 | `javax.servlet` 兼容线的 MVC、Filter、Interceptor、CORS 与异步行为 |

外部发现只使用 Tavily 定位，正式结论全部回到以上 17 个第一方直接来源。2026-08-15 使用
`curl -L --fail` 逐条复核，17 个唯一 URL 均返回 HTTP 200；未使用博客、搜索摘要或问答站作为证据。

## 冻结项目证据

| 文件与符号 | 证据能力 | 教学用法 |
| --- | --- | --- |
| `config.SpringMvcConfig` | MVC 配置 | observed：说明项目存在 MVC 扩展点 |
| `controller.BaseOuterController` | Controller | observed：说明请求映射是项目主调用入口 |
| `filter.AccessFilter` | Servlet Filter | observed：说明容器级请求链 |
| `filter.BodyRequestWrapper` | 请求包装 | corrected：说明 body 只能安全缓存一次并需保持 Servlet 合同 |
| `config.HeaderRequestInterceptor` | 请求头处理 | corrected：说明转发头和客户端地址不能无条件信任 |

风险计数只决定教学优先级，不证明某个冻结文件当前一定存在可利用缺陷。

## 核心合同

### 请求调用链

Servlet 容器先创建 `HttpServletRequest` 与 `HttpServletResponse`，再按 URL pattern 和 dispatcher type
调用 Filter chain。进入 `DispatcherServlet` 后，HandlerMapping 选择 handler 与 interceptor，
HandlerAdapter 解析参数并调用 Controller，返回值处理器和 HttpMessageConverter 生成响应；异常先交给
HandlerExceptionResolver。响应提交后，状态与部分 header 已不能可靠重写。

### Filter 与 Interceptor

Filter 属于 Servlet 容器，可包裹请求/响应并覆盖所有匹配资源；Interceptor 属于 Spring MVC，只围绕
已映射 handler。`preHandle` 返回 false 会停止 handler 链；只有当该 interceptor 的 `preHandle` 成功完成并返回
true 时，`afterCompletion` 才会被调用；`postHandle` 不保证在响应体已经写出后还能修改内容；满足调用条件时
`afterCompletion` 适合释放本请求拥有的资源。若资源可能在 `preHandle` 返回 false 或抛异常前取得，应在
Filter 的 `finally` 或本地异常路径清理。安全边界优先放在早期 Filter/Spring Security 链，
不能只依赖可能与路径匹配规则不一致的 MVC interceptor。

### 输入与输出合同

映射条件必须显式包含 HTTP method；路径变量标识资源，查询参数表达筛选/分页，请求头表达元数据，body
表达实体。`@RequestBody` 通过 HttpMessageConverter 读取流，不能假定可重复读取。响应使用明确状态码、
header 和 body；创建资源返回 201 与 Location，空成功可返回 204，参数错误归 4xx，未处理服务错误归 5xx。

### 异常、CORS 与异步

局部 `@ExceptionHandler` 处理当前 Controller，`@ControllerAdvice` 建立跨 Controller 的外部错误合同。
CORS 是浏览器跨源读取许可，不是身份认证；带凭据时不能把任意 origin 与 credentials 组合。异步返回释放
原 Servlet 线程但不会让阻塞操作消失，完成或超时后会再次 dispatch，Filter 必须明确 dispatcher type。

## Java 8 / Spring 5.2 差异

1. Servlet 类型位于 `javax.servlet.*`，现代线位于 `jakarta.servlet.*`。
2. Boot 4.1 使用 `spring-boot-starter-webmvc`；Boot 2.3 使用旧 `spring-boot-starter-web`。
3. Boot 2.3.12 要求 Java 8 与 Framework 5.2.15；其默认 Tomcat 9 使用 Servlet 4.0。
4. 旧线常返回自定义错误 DTO；现代线可使用 `ProblemDetail`，但字段仍需定义稳定外部合同。
5. `HandlerInterceptorAdapter` 在旧线常见；现代线直接实现带默认方法的 `HandlerInterceptor`。
6. 两条线都支持单构造器 Controller、ResponseEntity、ControllerAdvice、CORS 和 Servlet 异步。
7. 旧线不使用现代 Jakarta import，包名不能混搭。

## 零基础课程拆分

正式课程按 18 个独立小知识点展开：

1. Servlet 容器、request 和 response。
2. Filter chain 与 dispatcher type。
3. DispatcherServlet 前端控制器。
4. HandlerMapping、HandlerAdapter 与参数解析。
5. Controller 与 RestController。
6. 路径和 HTTP 方法映射。
7. 路径变量、查询参数与请求头。
8. RequestBody 与 HttpMessageConverter。
9. ResponseEntity、状态码与响应头。
10. consumes、produces 与内容协商。
11. ExceptionHandler 与 ControllerAdvice。
12. Filter 和 Interceptor 的职责边界。
13. preHandle、postHandle 与 afterCompletion。
14. CORS 预检与许可边界。
15. 请求 body 一次读取与 wrapper。
16. Servlet 异步、Callable 与 DeferredResult。
17. Forwarded 头、代理与客户端地址信任。
18. 响应提交、流式输出与错误恢复边界。

## 可执行反馈环设计

### 现代 fixture

在 `/tmp/java-spring-mvc-course.XXXXXX` 使用 Java 25、Boot 4.1.0、
`spring-boot-starter-webmvc` 与真实嵌入式容器：

1. GET 路径变量和查询参数绑定成功。
2. POST JSON 经 message converter 读取并返回 201、Location 和 JSON。
3. 错误 method、媒体类型和 Accept 分别得到 405、415、406。
4. ControllerAdvice 把领域异常映射为稳定 404 ProblemDetail。
5. Filter 和 Interceptor 记录真实顺序，Filter 包围 MVC 链。
6. CORS 预检只允许配置 origin。
7. 全量测试连续通过两次。

### legacy fixture

在真实 Java 8、Boot 2.3.12、Spring 5.2.15 与 `spring-boot-starter-web` 使用 MockMvc：

1. 使用 `javax.servlet.Filter` 记录请求链。
2. 验证路径/查询参数、JSON、ResponseEntity 和 ControllerAdvice。
3. 验证旧线仍使用自定义错误 DTO 而非 ProblemDetail。
4. 全量测试连续通过两次。

## 易错点取证

1. `@RequestMapping` 不限 method：扩大 API 可调用面；改用具体映射注解。
2. Filter 不调用 `chain.doFilter`：请求永远到不了 Controller；只在明确短路响应时停止。
3. Interceptor 承担唯一认证：路径匹配差异可能绕过；使用安全 Filter chain。
4. 多次读取 body：第二次得到空流；只缓存一次并正确代理输入流。
5. 无条件信任 `X-Forwarded-For`：客户端可伪造；只信任受控代理写入的转发信息。
6. 响应提交后再改状态：客户端可能已收到 header；在写 body 前完成错误映射。

## 研究 Gate 自检

- [x] Phase C I-08、150 分钟、I-07 唯一前置、四个来源能力与 I-09 停止边界已核对。
- [x] 现代线与真实 Java 8 兼容线版本已固定，并由两条精确系统要求页支撑。
- [x] 17 个直接来源覆盖版本、starter、请求链、映射、转换、异常、拦截、CORS、转发头、异步和旧版差异，17/17 返回 HTTP 200。
- [x] 五个项目代表符号只来自冻结矩阵。
- [x] 18 个零基础小点和双版本反馈环已定义。
- [x] 风险项只作为纠错边界，不推导当前确定缺陷。
- [x] 旧 signoff 的正文 SHA 绑定缺口已记录为本批关闭前必须补做的证据。
- [x] 本次只修改 I-08 研究稿，未修改正文、track、loader、signoff 或后续课程资产。

## Stop Boundary

本研究稿只完成 Phase C I-08 研究。父任务必须继续完成课程正文、双版本 `/tmp` 反馈环、必要的 track
同步、当前正文 SHA 绑定、工程 Gate、桌面/390px 页面证据、独立 signoff 与双轴
`PASS / 0 finding`；全部关闭后，才能进入 I-09
`backend.java.learn.intermediate.transactions-and-idempotency`。在此之前不得读取、研究或修改 I-09
正文、研究稿及其运行时资产。
