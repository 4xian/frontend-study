# Java 高级第 14 门：输入安全、过滤链、CORS 与 API 暴露边界研究

> 课程 ID：`backend.java.learn.advanced.secure-input-and-api-exposure`
>
> 冻结顺序：630
>
> 研究日期：2026-08-14
>
> 冻结快照：`dzzz-app-20260803-179e722831ab`
> 边界：只使用 Phase 2 冻结清单与本稿核验的一手资料；不读取、搜索、运行或修改 `dzzz-app`。

## 冻结课程合同

- 标题：输入安全、过滤链、CORS 与 API 暴露边界。
- 阶段：`advanced`；深度：`lesson`；sequence：`630`。
- 前置课程：
  1. `backend.java.learn.intermediate.bean-validation-and-input-contracts`。
  2. `backend.java.learn.advanced.authentication-authorization-and-jwt`。
- 来源能力只包含：
  1. `JAVA-RISK-023`：过滤链、黑名单与输入变异式安全控制。
  2. `JAVA-RISK-024`：CORS、动态视图与 API 文档暴露边界。
- 两项 evidence policy 都是 `project-risk-evidence-only`。正文可转录被冻结的风险文件和稳定符号，但
  `usage` 必须是 `rejected`，不得把旧项目实现包装成 observed 能力或推荐写法。
- 冻结选择理由：理解过滤器重复执行、输入变异、关键字黑名单、跨域凭据、动态视图和文档暴露风险，
  需要一门把输入用途、过滤链生命周期和部署暴露面连接起来的现代安全课程。
- 本稿不修改 Phase 2 manifest、课程正文、track、loader、signoff、依赖或测试，也不授权第 15 课。

## 版本基线

### 现代主线

- Java 25；临时反馈环使用实际安装的 OpenJDK `25.0.4` 或同线 Temurin 25 镜像并记录补丁版本。
- Spring Boot `4.1.0` BOM 精确管理 Spring Framework `7.0.8` 与 Spring Security `7.1.0`。
- Jakarta Servlet `6.2` 作为 `jakarta.servlet` 过滤器合同；Spring Security 7.1 的 servlet 文档用于
  `FilterChainProxy`、`SecurityFilterChain`、CORS 与 CSRF 顺序。
- OpenAPI 文档能力使用部署时实际选择的现代实现；课程只讲“是否生成、是否暴露、谁能访问、生产如何关闭”
  的合同，不把 springdoc 当作 JDK 或 Spring Framework 内置能力。

### Legacy 隔离线

- Java 8、Spring Boot `2.3.12.RELEASE`、Spring Framework `5.2.15.RELEASE`、Spring Security
  `5.3.9.RELEASE`，仍使用 `javax.servlet`。
- Boot 2.3 与 Security 5.3 的配置 DSL、默认属性和命名不能原样当作 Boot 4.1/Security 7.1 主线；旧线
  Springfox Swagger 2 只用于迁移说明。
- Servlet 过滤链“每次 dispatch 如何进入、成功或异常后不能再次调用同一 chain”的基本责任不因包名迁移而
  改变，但异步、ERROR dispatch 与具体框架默认值必须按实际版本核验。

## 搜索与核验说明

- 按仓库规则先用 Tavily 发现 Spring、Jakarta、OWASP、CWE 与 springdoc 一手入口；搜索摘要不作为证据。
- 候选结论回到固定 tag、固定版本 Javadoc、官方规范或官方安全标准直接核验。本稿保留 20 张最小充分来源卡，
  不用来源数量替代课程范围判断。
- 固定 tag、BOM、Servlet API、CWE 定义和 OWASP Cheat Sheet 于 `2026-08-14` 核验；living page 发布前仍需
  重查。Tavily 足够，未进入后续搜索链路。

## 一手来源卡

### 平台与框架版本

1. **`boot410-bom`**
   - URL：<https://repo1.maven.org/maven2/org/springframework/boot/spring-boot-dependencies/4.1.0/spring-boot-dependencies-4.1.0.pom>。
   - `sourceType: release-note`；`appliesTo: Spring Boot 4.1.0`；`verifiedAt: 2026-08-14`。
   - `claims`：Boot 4.1.0 管理 Spring Framework 7.0.8 与 Spring Security 7.1.0。
2. **`boot2312-bom`**
   - URL：<https://repo1.maven.org/maven2/org/springframework/boot/spring-boot-dependencies/2.3.12.RELEASE/spring-boot-dependencies-2.3.12.RELEASE.pom>。
   - `sourceType: release-note`；`appliesTo: Spring Boot 2.3.12.RELEASE`；
     `verifiedAt: 2026-08-14`。
   - `claims`：旧线管理 Spring Framework 5.2.15.RELEASE 与 Spring Security 5.3.9.RELEASE。
3. **`servlet62-filter-chain`**
   - URL：<https://jakarta.ee/specifications/servlet/6.2/apidocs/jakarta.servlet/jakarta/servlet/filterchain>。
   - `sourceType: api-doc`；`appliesTo: Jakarta Servlet 6.2`；`verifiedAt: 2026-08-14`。
   - `claims`：`doFilter` 让链中下一个 filter 或目标资源执行；不调用会阻断下游，调用多次会多次进入下游。

### 过滤链、CORS 与浏览器请求

4. **`security71-servlet-architecture`**
   - URL：<https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/architecture.adoc>。
   - `sourceType: official-reference`；`appliesTo: Spring Security 7.1.0`；
     `verifiedAt: 2026-08-14`。
   - `claims`：`FilterChainProxy` 为请求选择首个匹配 `SecurityFilterChain`；过滤器顺序承载安全合同。
5. **`security71-cors`**
   - URL：<https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/integrations/cors.adoc>。
   - `sourceType: official-reference`；`appliesTo: Spring Security 7.1.0`；
     `verifiedAt: 2026-08-14`。
   - `claims`：CORS 必须先于 Spring Security 处理 preflight；可由 `CorsFilter` 或 MVC 配置集成。
6. **`security71-csrf`**
   - URL：<https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/exploits/csrf.adoc>。
   - `sourceType: official-reference`；`appliesTo: Spring Security 7.1.0`；
     `verifiedAt: 2026-08-14`。
   - `claims`：浏览器自动携带 cookie 或 Basic 凭据时仍有 CSRF 语义；CORS 不能替代 CSRF 防护。
7. **`framework708-once-per-request-filter`**
   - URL：<https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/filter/OncePerRequestFilter.html>。
   - `sourceType: api-doc`；`appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-14`。
   - `claims`：该基类提供每个请求 dispatch 一次的语义，并允许显式选择 async/error dispatch 行为。
8. **`framework708-cors-configuration`**
   - URL：<https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/cors/CorsConfiguration.html>。
   - `sourceType: api-doc`；`appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-14`。
   - `claims`：origin、method、header、credentials、private network 与 max age 是不同配置轴；默认不开放来源。
9. **`fetch-cors`**
   - URL：<https://fetch.spec.whatwg.org/#http-cors-protocol>。
   - `sourceType: specification`；`appliesTo: browser Fetch CORS protocol`；
     `verifiedAt: 2026-08-14`。
   - `claims`：credentialed response 不能把 `Access-Control-Allow-Origin` 写成 `*`；CORS 是浏览器读响应策略，
     不是服务器认证或网络访问控制。

### 输入、输出与错误边界

10. **`owasp-input-validation`**
    - URL：<https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html>。
    - `sourceType: security-standard`；`appliesTo: untrusted input validation`；
      `verifiedAt: 2026-08-14`。
    - `claims`：尽早执行语法和语义 allowlist 校验；validation 不能替代输出编码与参数化查询。
11. **`owasp-xss-prevention`**
    - URL：<https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html>。
    - `sourceType: security-standard`；`appliesTo: XSS prevention`；`verifiedAt: 2026-08-14`。
    - `claims`：输出编码取决于 HTML、attribute、JavaScript、CSS、URL 等上下文；通用输入替换和 interceptor
      不能可靠解决所有上下文。
12. **`owasp-rest-security`**
    - URL：<https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html>。
    - `sourceType: security-standard`；`appliesTo: REST API exposure`；`verifiedAt: 2026-08-14`。
    - `claims`：HTTPS、method allowlist、输入验证、content type、管理端点、错误消息与安全头分别治理。
13. **`cwe20-input-validation`**
    - URL：<https://cwe.mitre.org/data/definitions/20.html>。
    - `sourceType: security-standard`；`appliesTo: improper input validation`；
      `verifiedAt: 2026-08-14`。
    - `claims`：输入需按期望属性验证，拒绝不符合结构、长度、范围与语义合同的值。
14. **`cwe79-xss`**
    - URL：<https://cwe.mitre.org/data/definitions/79.html>。
    - `sourceType: security-standard`；`appliesTo: cross-site scripting`；`verifiedAt: 2026-08-14`。
    - `claims`：不可信输入进入 Web 页面而未按输出上下文中和会产生脚本执行；输入变异不是通用修复。
15. **`cwe209-error-disclosure`**
    - URL：<https://cwe.mitre.org/data/definitions/209.html>。
    - `sourceType: security-standard`；`appliesTo: error information exposure`；
      `verifiedAt: 2026-08-14`。
    - `claims`：错误响应暴露异常、路径、查询或内部状态会帮助攻击者；外部错误合同与内部审计必须分离。

### 动态视图、API 文档与管理端点

16. **`framework708-redirect-view`**
    - URL：<https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/servlet/view/RedirectView.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Framework 7.0.8 MVC`；
      `verifiedAt: 2026-08-14`。
    - `claims`：重定向 URL 会由 view 处理；外部输入不能无 allowlist 地决定完整 view 或 redirect target。
17. **`cwe601-open-redirect`**
    - URL：<https://cwe.mitre.org/data/definitions/601.html>。
    - `sourceType: security-standard`；`appliesTo: user-controlled redirects`；
      `verifiedAt: 2026-08-14`。
    - `claims`：用户可控目标进入 redirect 会把可信域变成跳板；应映射稳定 ID 到服务端固定目标。
18. **`boot410-actuator-exposure-api`**
    - URL：<https://docs.spring.io/spring-boot/4.1/api/java/org/springframework/boot/actuate/autoconfigure/endpoint/web/WebEndpointProperties.Exposure.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Boot 4.1.0 Actuator`；
      `verifiedAt: 2026-08-14`。
    - `claims`：include/exclude 决定通过 Web 暴露哪些 endpoint；暴露选择与 endpoint 自身 enabled 状态不同。
19. **`boot410-actuator-endpoints`**
    - URL：<https://docs.spring.io/spring-boot/reference/actuator/endpoints.html>。
    - `sourceType: official-reference`；`appliesTo: Spring Boot 4.1 current reference`；
      `verifiedAt: 2026-08-14`。
    - `claims`：endpoint enablement、exposure 和访问控制是三层边界；HTTP 暴露后仍须纳入安全链。
20. **`springdoc-properties`**
    - URL：<https://springdoc.org/properties>。
    - `sourceType: official-reference`；`appliesTo: springdoc-openapi property surface`；
      `verifiedAt: 2026-08-14`。
    - `claims`：`springdoc.api-docs.enabled` 与 `springdoc.swagger-ui.enabled` 分别控制 API docs 和 UI；仅覆盖
      一个 URL 或给 Controller 返回 404 不等于停止 Bean、扫描和文档生成。

## 冻结风险与项目证据

下表只转录 Phase 2 冻结清单，不打开项目文件，也不由类名断言当前漏洞。10 条 normalized risk 落在 9 个
唯一代表文件上，全部 `usage: rejected`。

| Risk | 冻结路径 / 稳定符号 | 冻结问题 | 正文纠正合同 |
| --- | --- | --- | --- |
| `RISK-0135` / `JAVA-RISK-023` | `.../filter/XssHttpServletRequestWrapper.java` / `com.tdh.bdzz.filter.XssHttpServletRequestWrapper` | 替换输入字符会改变业务数据，不能替代上下文输出编码 | 保留原始业务值；入口做结构校验；输出 sink 按上下文编码 |
| `RISK-0247` / `JAVA-RISK-023` | `.../security/web/utils/SqlFilterUtil.java` / `tdh.commons.security.web.utils.SqlFilterUtil` | 关键字黑名单不能替代参数绑定 | 参数化 SQL + 字段 allowlist；黑名单只可作受控检测信号 |
| `RISK-0261` / `JAVA-RISK-023` | `.../filter/AccessFilter.java` / `com.tdh.bdzz.filter.AccessFilter` | 下游异常后再次调用 chain，可能重复执行业务 | 每个 dispatch 最多调用一次；异常直接传播或映射，禁止 retry chain |
| `RISK-0076` / `JAVA-RISK-024` | `.../config/SwaggerAccessBlockController.java` / `com.tdh.bdzz.config.SwaggerAccessBlockController` | 覆盖路径不等于禁用文档生成 | 在配置与 Bean 条件层关闭生成，再验证路由、Bean 和资源都缺失 |
| `RISK-0109` / `JAVA-RISK-024` | `.../config/CorsConfig.java` / `com.tdh.bdzz.config.CorsConfig` | 任意源与凭据组合不安全 | 精确 origin allowlist；只开放必要 method/header；凭据按用例决定 |
| `RISK-0168` / `JAVA-RISK-024` | `.../config/SwaggerConfig.java` / `com.tdh.bdzz.config.SwaggerConfig` | 文档能力仍显式启用 | 生产 profile 禁用 docs/UI；非生产也需认证和授权 |
| `RISK-0238` / `JAVA-RISK-024` | `.../DzzzAreaApplication.java` / `com.tdh.DzzzAreaApplication` | 旧 Swagger 全局启用 | 将旧 Springfox 隔离为 legacy；现代生成器使用条件化配置 |
| `RISK-0259` / `JAVA-RISK-024` | `.../controller/ViewController.java` / `com.tdh.bdzz.controller.ViewController` | 路径变量参与 view 名选择 | 由稳定页面 ID 映射固定 view；未知值拒绝，不拼路径/协议 |
| `RISK-0299` / `JAVA-RISK-024` | `.../config/SwaggerConfig.java` / `com.tdh.bdzz.config.SwaggerConfig` | Springfox Swagger 2 是旧兼容内容 | 现代 OpenAPI 方案单独选型；迁移时先冻结公开合同与关闭开关 |
| `RISK-0309` / `JAVA-RISK-024` | `.../config/SpringMvcConfig.java` / `com.tdh.bdzz.config.SpringMvcConfig` | 任意源与凭据组合不安全 | CORS 配置保持单一所有者并测试 preflight/actual request |

## 不能推出与明确非目标

- 不能由项目存在 `XssHttpServletRequestWrapper` 推出系统已经安全或必然存在可利用 XSS；只证明有被冻结的
  输入变异风险证据。
- 不能由关键词命中推出 SQL 注入，也不能由关键词未命中推出安全；SQL 安全依赖参数绑定、标识符 allowlist
  和数据库权限，而不是字符串替换。
- 不能由 `OncePerRequestFilter` 类名推出整个业务只执行一次；dispatch 选择、chain 调用次数、下游幂等性和
  异常路径仍需测试。
- 不能由浏览器 CORS 通过推出服务器已认证、已授权或 CSRF 安全；非浏览器客户端不受同一读取限制。
- 不能由 URL 返回 404 推出文档生成已关闭；需同时检查配置、Bean、扫描、JSON route、UI/static resources。
- 不能由 Actuator endpoint 未暴露推出其功能未启用，也不能由 endpoint 暴露推出调用者自动有权访问。
- SSRF、文件路径穿越和不安全反序列化属于“所有输入在进入专用 sink 前需专用控制”的相邻边界，本课只用
  一句话标出，分别由 HTTP 集成、文件存储和 JSON/数据合同课程承担，不新增 Phase 2 能力或深挖示例。
- 本课不重讲 Bean Validation、JWT 认证授权、文件上传、HTTP 客户端或加密，只复用前置课程结果。

## 正文知识点合同

正文应使用 14 个独立三级知识点，每个完整包含“它是什么、有什么作用、什么时候使用、怎么使用、最小示例、
运行结果、常见误区”七字段：

1. 不可信输入要先按来源、语法、语义和 sink 分类。
2. 输入验证、规范化、业务保存与输出编码是四个不同阶段。
3. allowlist 结构校验优先于关键词 blacklist。
4. SQL 值使用参数绑定，动态标识符使用服务端 allowlist。
5. XSS 控制位于输出上下文，不应全局变异业务输入。
6. Servlet `FilterChain` 每个 dispatch 只调用一次。
7. `OncePerRequestFilter` 的 REQUEST、ASYNC、ERROR dispatch 要显式决定。
8. Security filter chain 的 matcher 与顺序必须可测试且最终拒绝未知面。
9. CORS 是浏览器跨源读取协议，不是认证、授权或 CSRF 控制。
10. credentialed CORS 必须精确列出可信 origin、method 与 header。
11. 动态 view/redirect 只能由稳定 ID 映射固定服务端目标。
12. API 文档的生成、路由、UI、认证和环境开关要分别关闭或保护。
13. Actuator endpoint 的 enablement、exposure 与 access 是三层 Gate。
14. 外部错误响应、内部日志与安全审计必须隔离敏感细节。

## 易错点合同

正文至少覆盖以下 14 项，并按“触发条件、原因、后果、错误示例、正确写法、影响版本、验证方式、来源”完整
组织；可以增加“现象”，不得减少 adapter 必填字段：

1. 用统一字符替换“清洗”所有输入。
2. 用 SQL 关键字黑名单代替参数绑定。
3. 先 decode/normalize 后不重新做长度与语义校验。
4. filter 捕获下游异常后再次调用 `chain.doFilter`。
5. 忽略 ASYNC/ERROR dispatch 导致校验漏跑或重复跑。
6. 多条 `SecurityFilterChain` matcher 重叠且未测试首个匹配。
7. 把 CORS 当成服务器访问控制。
8. credentialed CORS 使用任意 origin 或宽泛 origin pattern。
9. 允许请求参数直接成为 view 名或 redirect URL。
10. 用额外 Controller 返回 404 假装关闭 OpenAPI/Swagger。
11. 只关闭 Swagger UI，却继续暴露 OpenAPI JSON。
12. Actuator 只配 include/exclude，不配置认证授权和网络边界。
13. 把异常类名、路径、查询、token 或 stack trace 回显给客户端。
14. 将 Springfox/`javax.servlet` 旧配置复制到 Boot 4.1/Security 7.1 主线。

## Java 25 / Java 8 临时反馈环

正式正文应包含一个纯 Java 8 语法兼容的完整示例，使同一文件能在 Java 25 和 Java 8 各编译运行两次：

1. `InputContract` 保留业务文本，单独验证长度、字符类别和业务 allowlist；断言危险但合法文本不被变异。
2. `QueryOrder` 将客户端排序 key 映射到固定 SQL identifier，值始终作为参数；未知 key 拒绝。
3. `FilterBoundary` 用计数器模拟 chain；成功、拒绝与下游异常三条路径都断言调用次数最多一次。
4. `CorsPolicy` 精确校验 origin、method、requested headers 与 credentials；evil origin 和 wildcard credentials
   均拒绝，preflight 不进入业务计数器。
5. `ViewRegistry` 将 `home/help` 等固定 ID 映射 view；路径、协议、`..` 和未知值拒绝。
6. `ExposurePolicy` 在 production 同时关闭 docs JSON、UI 和 management exposure；仅返回 404 但生成器仍启用
   的配置必须失败。
7. 输出固定摘要：
   `SECURE_INPUT_EXPOSURE_PASS preserved=1 blacklistRejected=1 chainOnce=1 corsRejected=1 viewRejected=1 docsOff=1`。
8. 所有 fixture 放在专属 `/tmp/java-advanced-14-*` 目录，成功后精确 `find <target> -depth -delete`；不向仓库
   留测试、class、日志、截图或报告。

框架级合同再用临时 Spring fixture 或真实 Catalog/浏览器验证，不把纯 Java 模型冒充 Spring filter 集成测试。

## 发布 Gate

- [x] ID、标题、sequence 630、两个前置、两个 source risk 与 planned 状态已核对。
- [x] 20 张一手来源卡覆盖固定版本、filter chain、输入/输出、CORS、CSRF、view、docs 和 Actuator。
- [x] 10 条 normalized risk、9 个唯一冻结文件全部为 rejected，未访问外部项目。
- [x] Java 25 / Java 8 与 Boot 4.1 / 2.3、`jakarta` / `javax` 边界已隔离。
- [x] 14 个七字段知识点、14 个易错点与双 JDK 反馈环已冻结。
- [ ] 正文 frontmatter 使用研究稿实际支持正文的同一 URL 集合，不增加重复来源章节。
- [ ] 双 JDK 示例各运行两次，关键负例通过，临时资产清理。
- [ ] 当前课才可切 `available` 并增加唯一 loader；第 15/16 课仍 planned 且无资产。
- [ ] Catalog 连续三次、知识路径、根 Gate、build、桌面/390px 浏览器、复杂课程独立双轴复审通过。
- [ ] signoff 绑定最终 SHA 与清理证据后，才允许开始第 15 课。

## 研究结论与 Stop Boundary

本稿只完成 Java 高级第 14 课研究 Gate。研究文件通过格式、来源、冻结映射、SHA 和 scoped diff 核验后，
主流程才可创建本课正文；当前不授权 track/loader/signoff、第 15/16 课、Reference、项目实践、提交或暂存。
