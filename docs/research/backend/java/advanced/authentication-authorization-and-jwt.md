# Java 高级第 12 门：认证、授权、资源边界与 JWT 研究

> 课程 ID：`backend.java.learn.advanced.authentication-authorization-and-jwt`
>
> 冻结顺序：610
>
> 研究日期：2026-08-13
>
> 冻结快照：`dzzz-app-20260803-179e722831ab`
> 边界：只使用 Phase 2 冻结矩阵/清单与本稿核验的官方资料；不读取、运行或修改 `dzzz-app`。

## 冻结课程合同

- 标题：认证、授权、资源边界与 JWT。
- 阶段：`advanced`，深度：`lesson`，课程顺序：`610`。
- 前置课程：
  1. `backend.java.learn.intermediate.spring-mvc-and-servlet-boundaries`。
  2. `backend.java.learn.intermediate.errors-results-and-logging`。
- 来源能力只能覆盖：
  1. `JAVA-ENGINEERING-025`：认证、授权与匿名访问边界。
  2. `JAVA-FRAMEWORK-032`：Java JWT。
  3. `JAVA-RISK-017`：匿名面、认证排除与认证绕过。
  4. `JAVA-RISK-018`：不可信身份输入与缺失资源授权。
- 选择理由：项目存在匿名面、用户上下文和 JWT；主线从资源授权与不可信身份输入建立安全边界。
- 冻结来源处置为 `JAVA-ENGINEERING-025: lesson`，其余三个能力为 `merged`。
- `JAVA-RISK-017`、`JAVA-RISK-018` 的 evidence policy 都是
  `project-risk-evidence-only`：只能进入研究审计与易错边界，不得作为课程正文项目证据。
- 冻结状态保持 `researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`。本稿不修改矩阵、课程正文、track、loader、signoff、测试或依赖。

## 研究范围与版本基线

### 现代主线

- Java 25 是课程语言与运行时基线。JDK 25 已于 2025-09-16 GA；最新 25u 补丁会漂移，课程正文只锁定
  Java 25 语言线，运行验证必须记录实际 `java -version`，不能把研究时的补丁号写成永久合同。
- Spring Boot 4.1.0 BOM 精确管理 Spring Framework 7.0.8 与 Spring Security 7.1.0；课程使用
  `SecurityFilterChain`、`authorizeHttpRequests`、`requestMatchers` 和 `@EnableMethodSecurity`。
- Auth0 `com.auth0:java-jwt` 当前稳定版锁定为 4.6.0。官方 4.6.0 文档列出的受支持 LTS 是 Java
  8/11/17/21；Java 25 集成必须由本课临时反馈环实测，不能由“Java 8+”或当前构建成功反推官方支持声明。
- Spring Security Resource Server 的 JWT 支持与 Auth0 `java-jwt` 是两套不同实现。本课可用前者解释标准
  Bearer/JWT 入口，用后者承接冻结 `JAVA-FRAMEWORK-032`，不得把两套 API、默认值或异常类型混称。

### Legacy 隔离线

- Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE、Spring Security
  5.3.9.RELEASE；Boot BOM 同时管理 Nimbus JOSE + JWT 8.19。
- 旧线使用 `WebSecurityConfigurerAdapter`、`authorizeRequests`、`antMatchers` 与
  `@EnableGlobalMethodSecurity` 解释既有项目；不得把 Security 7.1 的现代配置直接写成 5.3.9 可编译代码。
- Phase 2 冻结清单只记录项目存在 `com.auth0.jwt` 能力，没有冻结 Auth0 artifact 的精确版本；本稿不读取
  项目 POM，也不猜测 legacy `java-jwt` 版本。兼容验证若使用 4.6.0，必须明确它是当前库对 Java 8 的
  兼容验证，不是冻结项目依赖复原。
- Legacy 只用于读旧项目和迁移对照；认证排除、硬编码密钥、宽泛异常合并与只校验签名都不能包装成推荐。

## 外部搜索与直接核验说明

- 先使用 Tavily 搜索 Spring Security、JWT 与版本候选；部分版本搜索返回浮动文档或无关结果，因此按仓库
  顺位窄范围切换 Exa 发现 RFC、OWASP 与固定版本入口。搜索摘要只用于找 URL，不作为结论证据。
- 所有结论均回到 OpenJDK、Maven Central、Spring Security 固定 `7.1.0` tag、Spring 5.3.9 归档文档、
  RFC Editor、OWASP、MITRE 或 Auth0 固定 `4.6.0` tag 核验。
- 本稿共有 29 个唯一官方直接 URL；`verifiedAt` 均为 `2026-08-13`。固定 tag、固定 BOM、RFC、CWE 和
  固定 OWASP edition 的 `driftRisk` 为 low；“JDK 25u 最新补丁”判断为 high，正文不锁定漂移补丁。
- 未进入 Parallel 或 Perplexity：Exa 后备已找到足够的一手来源，继续接替没有必要。

## 已核验的官方来源卡

### 版本与实现基线

1. **`openjdk-25`**
   - URL：<https://openjdk.org/projects/jdk/25/>。
   - `sourceType: release-note`；`appliesTo: JDK 25`；`verifiedAt: 2026-08-13`。
   - `claims`：JDK 25 的 GA 日期与交付状态；课程可锁定 Java 25，但补丁版本需在验证时重新记录。
   - `driftRisk: low`：已交付版本页；“当前最新补丁”不由本卡承担。
2. **`boot410-bom`**
   - URL：<https://repo1.maven.org/maven2/org/springframework/boot/spring-boot-dependencies/4.1.0/spring-boot-dependencies-4.1.0.pom>。
   - `sourceType: release-bom`；`appliesTo: Spring Boot 4.1.0`；`verifiedAt: 2026-08-13`。
   - `claims`：精确管理 Spring Framework 7.0.8、Spring Security 7.1.0。
   - `driftRisk: low`：不可变版本坐标。
3. **`boot2312-bom`**
   - URL：<https://repo1.maven.org/maven2/org/springframework/boot/spring-boot-dependencies/2.3.12.RELEASE/spring-boot-dependencies-2.3.12.RELEASE.pom>。
   - `sourceType: release-bom`；`appliesTo: Spring Boot 2.3.12.RELEASE`；
     `verifiedAt: 2026-08-13`。
   - `claims`：精确管理 Framework 5.2.15.RELEASE、Security 5.3.9.RELEASE、Nimbus 8.19。
   - `driftRisk: low`。
4. **`auth0-java-jwt-release`**
   - URL：<https://github.com/auth0/java-jwt/releases/tag/4.6.0>。
   - `sourceType: release-note`；`appliesTo: Auth0 java-jwt 4.6.0`；`verifiedAt: 2026-08-13`。
   - `claims`：4.6.0 是 2026-07-13 发布的稳定版，新增 PS256 与 NumericDate 错误分类。
   - `driftRisk: low`：固定 release；“当前最新”本身需发布时重查。
5. **`auth0-java-jwt-readme`**
   - URL：<https://raw.githubusercontent.com/auth0/java-jwt/4.6.0/README.md>。
   - `sourceType: official-reference`；`appliesTo: Auth0 java-jwt 4.6.0`；
     `verifiedAt: 2026-08-13`。
   - `claims`：受支持 LTS 列表、支持的 JWS 算法、`JWT.create` 签发与 `JWT.require` 验证入口；
     verifier 必须显式绑定 Algorithm 和所需 claims，失败抛 `JWTVerificationException`。
   - `driftRisk: low`：固定 tag。
6. **`auth0-java-jwt-examples`**
   - URL：<https://raw.githubusercontent.com/auth0/java-jwt/4.6.0/EXAMPLES.md>。
   - `sourceType: official-reference`；`appliesTo: Auth0 java-jwt 4.6.0`；
     `verifiedAt: 2026-08-13`。
   - `claims`：默认验证 `iat`、`exp`、`nbf`，leeway 单位为秒；custom claim 可成为 verifier 要求；
     `KeyProvider` 可按 `kid` 选择轮换公钥，但 key 来源与信任不由该库自动决定。
   - `driftRisk: low`。

### Spring Security 7.1.0 边界

7. **`security71-authentication-architecture`**
   - URL：<https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/authentication/architecture.adoc>。
   - `sourceType: official-reference`；`appliesTo: Spring Security 7.1.0`；
     `verifiedAt: 2026-08-13`。
   - `claims`：`AuthenticationManager` 处理认证，成功结果进入 `SecurityContext`；principal、credentials、
     authorities 的角色不同，认证成功不等于任意资源授权。
   - `driftRisk: low`：固定 tag。
8. **`security71-servlet-architecture`**
   - URL：<https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/architecture.adoc>。
   - `sourceType: official-reference`；`appliesTo: Spring Security 7.1.0`；
     `verifiedAt: 2026-08-13`。
   - `claims`：`FilterChainProxy` 为请求选择首个匹配 `SecurityFilterChain`，过滤器顺序承载 exploit
     protection、authentication、authorization；请求结束清理 `SecurityContext`。
   - `driftRisk: low`。
9. **`security71-request-authorization`**
   - URL：<https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/authorization/authorize-http-requests.adoc>。
   - `sourceType: official-reference`；`appliesTo: Spring Security 7.1.0`；
     `verifiedAt: 2026-08-13`。
   - `claims`：请求级规则由 `AuthorizationManager` 决策；应显式匹配公开/受限面并以 deny-by-default
     收束；`permitAll` 保留安全链能力，不能把匿名入口等同于跳过过滤器。
   - `driftRisk: low`。
10. **`security71-method-authorization`**
    - URL：<https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/authorization/method-security.adoc>。
    - `sourceType: official-reference`；`appliesTo: Spring Security 7.1.0`；
      `verifiedAt: 2026-08-13`。
    - `claims`：`@EnableMethodSecurity` 启用方法授权；`@PreAuthorize` 可检查参数，`@PostAuthorize` 可检查
      返回对象；方法授权适合服务层与细粒度资源决策，Boot starter 不会默认启用它。
    - `driftRisk: low`。
11. **`security71-anonymous`**
    - URL：<https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/authentication/anonymous.adoc>。
    - `sourceType: official-reference`；`appliesTo: Spring Security 7.1.0`；
      `verifiedAt: 2026-08-13`。
    - `claims`：无现有认证时 anonymous filter 可放入 `AnonymousAuthenticationToken`；这是统一授权与审计
      的便利对象，不是真实登录，Servlet `getCallerPrincipal` 仍可为 null。
    - `driftRisk: low`。
12. **`security71-context-persistence`**
    - URL：<https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/authentication/persistence.adoc>。
    - `sourceType: official-reference`；`appliesTo: Spring Security 7.1.0`；
      `verifiedAt: 2026-08-13`。
    - `claims`：`SecurityContextHolderFilter` 只读取 context，不自动保存；需要跨请求持久化时必须显式保存；
      `NullSecurityContextRepository` 表示不保存。
    - `driftRisk: low`。
13. **`security71-context-concurrency`**
    - URL：<https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/integrations/concurrency.adoc>。
    - `sourceType: official-reference`；`appliesTo: Spring Security 7.1.0`；
      `verifiedAt: 2026-08-13`。
    - `claims`：默认安全上下文是 per-thread；新线程不会自动获得 context；
      `DelegatingSecurityContextRunnable`/`Executor` 显式设置并在 `finally` 清理。
    - `driftRisk: low`。
14. **`security71-session-management`**
    - URL：<https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/authentication/session-management.adoc>。
    - `sourceType: official-reference`；`appliesTo: Spring Security 7.1.0`；
      `verifiedAt: 2026-08-13`。
    - `claims`：`STATELESS` 不使用 session 保存认证；有状态认证必须考虑 session fixation、并发会话、
      invalid/expired session 与 logout 清理。
    - `driftRisk: low`。
15. **`security71-csrf`**
    - URL：<https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/exploits/csrf.adoc>。
    - `sourceType: official-reference`；`appliesTo: Spring Security 7.1.0`；
      `verifiedAt: 2026-08-13`。
    - `claims`：unsafe HTTP methods 默认受 CSRF 保护；只要浏览器自动附带 cookie、自定义认证 cookie 或
      Basic credentials，“服务端 stateless”也不自动消除 CSRF。
    - `driftRisk: low`。
16. **`security71-cors`**
    - URL：<https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/integrations/cors.adoc>。
    - `sourceType: official-reference`；`appliesTo: Spring Security 7.1.0`；
      `verifiedAt: 2026-08-13`。
    - `claims`：CORS preflight 不含 `JSESSIONID`，需在 Spring Security 前处理；每条 chain 的 CORS 来源需
      明确，禁用 security CORS 并不会关闭浏览器同源策略。
    - `driftRisk: low`。
17. **`security71-bearer-token`**
    - URL：<https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/oauth2/resource-server/bearer-tokens.adoc>。
    - `sourceType: official-reference`；`appliesTo: Spring Security 7.1.0`；
      `verifiedAt: 2026-08-13`。
    - `claims`：Bearer filter 从 HTTP 请求读取 token，经 `AuthenticationManager` 认证，成功后设置 context；
      失败通过 entry point 返回 `WWW-Authenticate`，token 本身不能被写入日志或错误响应。
    - `driftRisk: low`。
18. **`security71-resource-server-jwt`**
    - URL：<https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/oauth2/resource-server/jwt.adoc>。
    - `sourceType: official-reference`；`appliesTo: Spring Security 7.1.0 Resource Server`；
      `verifiedAt: 2026-08-13`。
    - `claims`：Resource Server JWT 由 `JwtDecoder` 解码、验签并验证；默认验证时间窗口与 issuer 配置，
      audience/custom claims 需按合同补充；默认 clock skew 是 60 秒，不能把 skew 当 token 续期。
    - `driftRisk: low`。
19. **`security539-legacy-reference`**
    - URL：<https://docs.spring.io/spring-security/site/docs/5.3.9.RELEASE/reference/html5/>。
    - `sourceType: official-reference`；`appliesTo: Spring Security 5.3.9.RELEASE`；
      `verifiedAt: 2026-08-13`。
    - `claims`：旧线采用 `WebSecurityConfigurerAdapter`、`authorizeRequests`、`antMatchers`、
      `@EnableGlobalMethodSecurity`，已有 anonymous、CSRF、CORS、session、Bearer/JWT 与并发 context 支持；
      不具备 Security 7.1 的配置 API 合同。
    - `driftRisk: low`：归档版本页。

### JWT、Bearer 与资源授权标准

20. **`rfc7519-jwt`**
    - URL：<https://www.rfc-editor.org/rfc/rfc7519.html>。
    - `sourceType: specification`；`appliesTo: JWT`；`verifiedAt: 2026-08-13`。
    - `claims`：定义 registered claims `iss`、`sub`、`aud`、`exp`、`nbf`、`iat`、`jti`；`exp`/`nbf`
      可允许很小的时钟偏差；JWT 可由 JWS 签名/MAC 或 JWE 加密，签名不等于保密。
    - `driftRisk: low`。
21. **`rfc8725-jwt-bcp`**
    - URL：<https://www.rfc-editor.org/rfc/rfc8725.html>。
    - `sourceType: specification`；`appliesTo: JWT implementations and deployments`；
      `verifiedAt: 2026-08-13`。
    - `claims`：算法必须由应用 allowlist 决定并与 key 匹配；全部加密操作必须成功；HMAC key 需足够熵；
      验证 issuer、audience、subject/claims，必要时使用明确 `typ` 与互斥验证规则，防止 cross-JWT confusion。
    - `driftRisk: low`：BCP 225。
22. **`rfc6750-bearer`**
    - URL：<https://www.rfc-editor.org/rfc/rfc6750.html>。
    - `sourceType: specification`；`appliesTo: OAuth 2.0 Bearer Token`；`verifiedAt: 2026-08-13`。
    - `claims`：Bearer token 由持有者即可使用，必须以 TLS 保护且避免出现在 URI；失败以
      `WWW-Authenticate` 表达，`invalid_request`/`invalid_token`/`insufficient_scope` 分别映射不同合同。
    - `driftRisk: low`。
23. **`rfc9068-jwt-access-token`**
    - URL：<https://www.rfc-editor.org/rfc/rfc9068.html>。
    - `sourceType: specification`；`appliesTo: OAuth 2.0 JWT Access Token Profile`；
      `verifiedAt: 2026-08-13`。
    - `claims`：JWT access token 必须签名、不能使用 `none`，header 使用 `typ=at+jwt`；资源服务器验证
      `typ`、`iss`、`aud`、signature、`exp`，并将权限 claims 解释为本资源服务器的授权输入。
    - `driftRisk: low`。
24. **`rfc7517-jwk`**
    - URL：<https://www.rfc-editor.org/rfc/rfc7517.html>。
    - `sourceType: specification`；`appliesTo: JWK and JWK Set`；`verifiedAt: 2026-08-13`。
    - `claims`：JWK 表达密码学 key，JWK Set 可包含多把 key；`kid` 用于匹配特定 key，尤其轮换期间，
      但 `kid` 本身不建立 issuer、算法、URL 或 key 的信任。
    - `driftRisk: low`。
25. **`rfc7009-token-revocation`**
    - URL：<https://www.rfc-editor.org/rfc/rfc7009.html>。
    - `sourceType: specification`；`appliesTo: OAuth 2.0 token revocation`；
      `verifiedAt: 2026-08-13`。
    - `claims`：定义客户端向 authorization server 请求撤销 token；撤销可能存在传播延迟。自包含 JWT 若需
      立即失效，仍需要服务端 denylist、subject/token version、短 TTL、introspection 或等价状态设计。
    - `driftRisk: low`。
26. **`owasp-api1-bola`**
    - URL：<https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/>。
    - `sourceType: security-standard`；`appliesTo: API object authorization`；
      `verifiedAt: 2026-08-13`。
    - `claims`：每个使用客户端对象 ID 的函数都要验证当前主体对该对象与动作的权限；UUID 不能替代授权；
      只比较 JWT userId 与请求参数不能解决通用 BOLA。
    - `driftRisk: low`：固定 2023 edition。
27. **`cwe639-user-controlled-key`**
    - URL：<https://cwe.mitre.org/data/definitions/639.html>。
    - `sourceType: security-standard`；`appliesTo: IDOR/authorization bypass`；
      `verifiedAt: 2026-08-13`。
    - `claims`：用户可控 key 若未绑定当前主体权限，会造成横向或纵向越权；控制点必须在服务端资源访问前。
    - `driftRisk: low`。
28. **`owasp-authorization-cheat-sheet`**
    - URL：<https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html>。
    - `sourceType: security-standard`；`appliesTo: application authorization`；
      `verifiedAt: 2026-08-13`。
    - `claims`：least privilege、deny by default、每次请求验证权限；应测试角色、属性、关系与资源所有权，
      隐藏/随机化标识不能替代控制。
    - `driftRisk: low`。
29. **`owasp-logging-cheat-sheet`**
    - URL：<https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html>。
    - `sourceType: security-standard`；`appliesTo: security audit logging`；
      `verifiedAt: 2026-08-13`。
    - `claims`：记录认证成功/失败、授权失败、session 异常和高风险操作；不得记录 access token、session ID、
      密码、密钥或敏感个人数据；日志本身需防注入、未授权读取与篡改。
    - `driftRisk: low`。

## 本课结论与正文建议

### 1. 认证、授权和资源所有权是三个连续但不同的 Gate

1. 认证回答“凭据是否可信、当前主体是谁”，产出经过验证的 `Authentication`；授权回答“该主体对当前
   action/resource 是否允许”，不能由 `authenticated=true` 自动推出。
2. 请求级授权在进入控制器前按 method/path/dispatcher/authority 收窄攻击面；方法级授权在服务层按参数、返回值、
   租户、owner 和业务状态继续决策。两层互补，不应以控制器路径规则替代资源授权。
3. 每次加载或变更资源都必须把不可信资源 ID 与可信主体、租户和动作绑定查询或授权；“对象存在”与“当前用户可见”
   是不同事实。推荐 owner-aware repository query 或集中 `AuthorizationManager`，不要先全局 `findById` 再遗漏检查。
4. 权限模型采用 least privilege、deny by default；角色只是粗粒度输入。水平越权通常发生在同角色用户互换资源 ID，
   因此“拥有相同角色”不能证明 owner、tenant 或 case relationship 相同。

### 2. `SecurityFilterChain` 与匿名面必须可枚举、可测试

1. 多条 chain 按顺序首个匹配；每条 chain 的 `securityMatcher`、业务 endpoints、框架生成 endpoints、
   dispatcher types 与最终 fallback 都要列入矩阵。至少保留一个 deny-all 或 authenticated fallback，避免漏网请求。
2. 公开接口用显式 `permitAll`，使 CSRF、CORS、安全响应头、context 清理和审计仍在链内执行；只有经过威胁模型证明
   完全不需要任何 security filter 的静态资源才讨论 ignoring。
3. anonymous authentication 是内部统一对象，不是凭据证明。业务代码应通过 trust resolver 或明确的 authenticated
   contract 区分 anonymous、remember-me 与 fully authenticated，不能只判断 `Authentication != null`。
4. 自定义认证 filter 必须位于 exploit protection 之后、authorization 之前；失败只建立稳定的外部错误合同，
   不应继续 filter chain 或留下半认证 context。

### 3. `SecurityContext` 有请求、持久化和异步三种生命周期

1. 请求进入时加载 context，请求结束必须清理；持久化到 session/repository 是单独动作。
   `SecurityContextHolderFilter` 不会替自定义登录逻辑自动保存。
2. stateless API 使用 `NullSecurityContextRepository` 或等价显式配置，不保存跨请求认证；这不代表 token 可撤销、
   浏览器不会自动携带凭据，也不代表没有 CSRF 风险。
3. 新线程/线程池默认不传播 `SecurityContextHolder`。异步任务只捕获最小必要身份快照，执行前设置，`finally` 清理或
   恢复 worker 原 context；禁止把可变 Servlet request、原始 token 或整个 session 当任务上下文。
4. 认证上下文传播不等于授权快照永久有效。长任务对高风险操作应重新检查账号状态、租户关系或授权版本，避免权限撤销后
   继续沿用旧 context。

### 4. session、CSRF 与 CORS 不能由“前后端分离”一句话决定

1. session 登录在认证成功时更新 session ID，定义并发会话、过期、invalid session、logout 和 cookie 属性；失败路径
   不得复用攻击者预置 session。
2. CSRF 的判定取决于浏览器是否自动附带认证材料，而非后端是否声称 stateless。Cookie、Basic auth 或客户端证书都
   可能自动附带；只有 Bearer 只在受控 header 中显式发送且威胁模型成立时，才为相应 API 窄范围禁用 CSRF。
3. CORS 是浏览器读取权限，不是服务端认证/授权。preflight 必须先处理；credentialed CORS 只能列出有限可信 origin，
   origin、method、header 与暴露 header 都用 allowlist，不能用 `*` 扩大信任。
4. CORS 通过、CSRF token 有效或 session 存在，都不能替代资源授权。

### 5. JWT 签发与验证要以 token profile 为合同

1. 签发器先定义 token type、issuer、audience、subject、scope/authority、`iat`、`nbf`、`exp`、`jti` 与 key id；
   只放最小、非敏感、可失效的 claims。JWS payload 可读，不能放密码、密钥、身份证明原文或内部敏感对象。
2. 验证器由本地配置固定允许算法、可信 issuer/audience、token type、required claims 与 key source。token header 的
   `alg`、`kid`、`jku`、`x5u` 和 payload claims 都是不可信输入，不能反向决定允许算法或任意远程 key URL。
3. 验证顺序至少包括结构/大小 -> token profile/`typ` -> key 与算法 allowlist -> 完整签名 -> `iss`/`aud` ->
   `exp`/`nbf`/必要的 `iat` -> required claims -> revocation/version -> authority mapping；任一步失败整体拒绝。
4. clock skew 只容忍可测量的时钟误差，应小且配置化；它不能延长签发 TTL，也不能把 expired token 改成成功响应。
5. Auth0 `JWT.decode` 只解析，不验证。课程示例必须使用可复用 `JWTVerifier` 并显式要求 issuer、audience 和必要 claims；
   解析出的值只有在完整验证成功后才能进入 `Authentication`。

### 6. `kid`、轮换、撤销与 Bearer 失败是运行时合同

1. `kid` 只在受信 JWK Set/key registry 内选择候选 key；未知、重复、超长或恶意 `kid` 必须稳定拒绝，不能拼 SQL、
   文件路径或任意 URL。缓存要有容量、刷新、超时与 stale-key 策略。
2. 轮换顺序为先发布新验证公钥，再用新私钥签发，在旧 token 最长有效期和允许 skew 结束后移除旧公钥；紧急泄露场景
   需要立即停签、撤销/denylist 或 issuer key set 更新，不能只等自然过期。
3. 自包含 JWT 不提供天然即时撤销。按风险选择短 access-token TTL、refresh-token rotation、`jti` denylist、
   subject/token version、opaque introspection 或 sender-constrained token；状态化控制要定义一致性与不可用时 fail-closed。
4. Bearer 外部失败保持稳定：无凭据对受保护资源返回 401 与 challenge；malformed request 对应
   `invalid_request`；过期、撤销、签名或 claims 无效对应 401 `invalid_token`；认证成功但 scope/权限不足对应
   403 `insufficient_scope`。客户端不接收内部异常、key id 细节或逐 claim 攻击 oracle。
5. 审计记录 outcome、reason category、endpoint/action、subject/tenant 的不可逆或受控标识、trace id、issuer 与 key
   version；绝不记录 access/refresh token、session ID、Authorization header、密码或 key material。

## `JAVA-RISK-017` / `JAVA-RISK-018` 风险合同

以下风险只作为研究审计与易错边界。正文可讲通用风险与控制，但不得把冻结 rejected 路径作为项目证据：

| 风险类 | 触发条件 | 主要后果 | 正文最小控制与验证 |
| --- | --- | --- | --- |
| 匿名面漂移 | 排除路径、annotation、filter matcher 与 MVC mapping 各自维护；新 endpoint 未进入默认拒绝 | 未认证访问、绕过审计或安全头 | 单一公开面清单；`permitAll` + deny fallback；逐 endpoint/dispatcher 未认证矩阵 |
| 半认证与 fail-open | token 缺失/异常后继续 chain，context 保留旧值，catch 后返回 true | 伪造主体、跨请求污染、认证绕过 | 失败清空 context 并停止；验证 malformed/expired/wrong-key/exception 均不可达业务 |
| 不可信身份输入 | 从 header/query/body/WebSocket 参数直接构造 user/tenant/role | 冒充、串租户、权限提升 | 只从已验证 credential 建立主体；验证客户端同名字段被忽略或拒绝 |
| 缺失资源授权 | 只做 authenticated/role 检查，按用户 ID 直接加载任意对象 | IDOR/BOLA、数据泄露或篡改 | 每个对象与动作检查 owner/tenant/policy；双用户交换 ID 的负例 |
| JWT 验证不足 | 只 decode/验签，信任 token `alg/kid`，漏验 issuer/audience/time/type | token 替换、跨服务复用、算法混淆 | 固定 profile 与 key registry；逐项 negative fixture，任一失败整体拒绝 |
| 撤销与异步漂移 | 长 TTL JWT 或已传播 context 在账号/权限撤销后继续使用 | 被盗 token 持续有效、后台越权 | 短 TTL + version/denylist/introspection；高风险异步动作重新授权 |

## 冻结项目证据映射

以下仅转录 Phase 2 冻结清单的 sourceId、计数、路径、稳定符号与 evidence policy；未打开项目路径，也不从
类名推断实现。正文项目证据只能使用下列 6 条 `observed`：

| sourceId | 冻结计数 | 冻结路径与稳定符号 | usage | 仅能支持的教学结论 |
| --- | ---: | --- | --- | --- |
| `JAVA-ENGINEERING-025` | 25 | `dzzz-app/src/main/java/com/tdh/bdzz/controller/CommController.java`；`com.tdh.bdzz.controller.CommController` | `observed` | 存在匿名/认证边界候选，不证明入口配置完整或安全 |
| `JAVA-ENGINEERING-025` | 25 | `dzzz-app/src/main/java/com/tdh/bdzz/util/aixntj/AiXntjCourtTreeHelper.java`；`com.tdh.bdzz.util.aixntj.AiXntjCourtTreeHelper` | `observed` | 存在权限过滤候选，不证明逐资源授权完整 |
| `JAVA-ENGINEERING-025` | 25 | `dzzz-app/src/main/java/com/tdh/bdzz/util/NlzxUtil.java`；`com.tdh.bdzz.util.NlzxUtil` | `observed` | 存在认证候选，不证明凭据、失败或上下文合同正确 |
| `JAVA-ENGINEERING-025` | 25 | `dzzz-app/src/main/java/tdh/uim/client/vo/LoginRequest.java`；`tdh.uim.client.vo.LoginRequest` | `observed` | 存在认证请求模型，不证明字段可信或输入已验证 |
| `JAVA-ENGINEERING-025` | 25 | `dzzz-app/src/main/java/tdh/uim/client/vo/LoginData.java`；`tdh.uim.client.vo.LoginData` | `observed` | 存在认证数据模型，不证明数据可直接成为授权主体 |
| `JAVA-FRAMEWORK-032` | 1 | `dzzz-app/src/main/java/com/tdh/bdzz/util/JWTUtil.java`；`com.tdh.bdzz.util.JWTUtil` | `observed` | 存在 Auth0 Java JWT 使用面，不证明版本、密钥、claims 或撤销安全 |

以下 10 条只能保留在研究审计中，usage 固定为 `rejected`，不得进入正文项目证据卡：

| sourceId | 冻结计数 | 冻结路径与稳定符号 | usage | 只用于提示的风险 |
| --- | ---: | --- | --- | --- |
| `JAVA-RISK-017` | 21 | `dzzz-app/src/main/java/com/tdh/bdzz/controller/TokenController.java`；`com.tdh.bdzz.controller.TokenController` | `rejected` | token 入口、匿名面或失败合同漂移 |
| `JAVA-RISK-017` | 21 | `dzzz-app/src/main/java/com/tdh/bdzz/filter/TokenLoginFilter.java`；`com.tdh.bdzz.filter.TokenLoginFilter` | `rejected` | filter 顺序、排除与 fail-open |
| `JAVA-RISK-017` | 21 | `dzzz-app/src/main/java/com/tdh/bdzz/handler/LoginHandler.java`；`com.tdh.bdzz.handler.LoginHandler` | `rejected` | 登录处理与 context 生命周期 |
| `JAVA-RISK-017` | 21 | `dzzz-app/src/main/java/com/tdh/bdzz/controller/CommController.java`；`com.tdh.bdzz.controller.CommController` | `rejected` | 匿名接口范围扩大 |
| `JAVA-RISK-017` | 21 | `dzzz-app/src/main/java/com/tdh/bdzz/config/SpringMvcConfig.java`；`com.tdh.bdzz.config.SpringMvcConfig` | `rejected` | MVC exclude 与 security chain 分裂 |
| `JAVA-RISK-018` | 11 | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/AppFrontYyzxWsServer.java`；`com.tdh.bdzz.config.websocket.server.AppFrontYyzxWsServer` | `rejected` | WebSocket 身份参数不可信 |
| `JAVA-RISK-018` | 11 | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/Voice2TextWsServer.java`；`com.tdh.bdzz.config.websocket.server.Voice2TextWsServer` | `rejected` | 长连接身份与资源绑定缺失 |
| `JAVA-RISK-018` | 11 | `dzzz-app/src/main/java/com/tdh/bdzz/controller/PdfjsStampController.java`；`com.tdh.bdzz.controller.PdfjsStampController` | `rejected` | 文件/印章资源 ID 越权 |
| `JAVA-RISK-018` | 11 | `dzzz-app/src/main/java/com/tdh/bdzz/controller/PdfjsSignatureController.java`；`com.tdh.bdzz.controller.PdfjsSignatureController` | `rejected` | 签名资源缺少 owner/action 检查 |
| `JAVA-RISK-018` | 11 | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/fyb/jdyh/NoteSignWsServer.java`；`com.tdh.bdzz.config.websocket.server.fyb.jdyh.NoteSignWsServer` | `rejected` | WebSocket 资源授权与重认证漂移 |

## 不能推出与不得声称

- 不能由 endpoint 返回 200、存在登录接口或 context 非空推出认证成功；anonymous token 也可能使 context 非空。
- 不能由 `permitAll`、CORS allow 或 CSRF token 有效推出业务资源已授权。
- 不能由角色、scope 或同一租户推出当前用户拥有任意对象；每个对象与动作都需要授权。
- 不能由不可预测 UUID 推出没有 BOLA；UUID 只降低猜测概率，不控制已知 ID 的访问。
- 不能由 JWT 可 decode、签名有效或 `exp` 未到推出 token 可接受；还需 type、算法、key、issuer、audience、
  时间、required claims、撤销状态和当前资源授权。
- 不能由 JWS 签名推出 payload 保密；不能把 token、Authorization header、session ID 或 key 写入日志。
- 不能信任 token 自报的 `alg`、`kid`、`jku`、`x5u` 或 claims 去选择任意算法、文件、数据库语句或 URL。
- 不能由 `kid` 命中、JWK 可下载或 HTTPS 成功推出 key 属于可信 issuer。
- 不能由 short TTL 推出无需撤销，也不能由 denylist 推出所有节点已即时一致。
- 不能由 `STATELESS` 推出无 session、无 cookie、无 CSRF、无请求缓存或无浏览器自动凭据。
- 不能由 CORS 配置拒绝浏览器读取推出服务端接口不会被调用；非浏览器客户端不受 CORS 限制。
- 不能由请求线程 context 正确推出异步 worker 自动传播或清理；也不能把原始 bearer token作为任务载荷。
- 不能把 Security 7.1 的 `SecurityFilterChain`/`authorizeHttpRequests` 代码声明为 Security 5.3.9 可直接编译。
- 不能由 Auth0 `java-jwt` 4.6.0 在 Java 25 临时验证通过推出该版本官方支持 Java 25。
- 不能由 6 条 observed 路径推出冻结项目实现安全；10 条 rejected 路径不得作为推荐实现或正文项目证据。

## 易错点取证合同

正文至少覆盖以下 14 个可观察错误，每项按“现象 -> 触发条件 -> 原因 -> 后果 -> 错误示例 ->
正确写法 -> 影响版本 -> 验证方式 -> 来源”组织：

1. 只判断 `Authentication != null`，把 anonymous token 当真实登录主体。
2. 多条 `SecurityFilterChain` matcher/order 重叠或缺 fallback，使请求命中错误链或完全未受保护。
3. 为公开入口使用 ignoring/exclude，连同安全头、CSRF/CORS、context 清理和审计一起绕过。
4. 认证 filter 捕获异常后继续 chain、返回成功或未清空 context，形成 fail-open/半认证状态。
5. 只做 URL/role/scope 准入，不按当前主体、租户、资源与动作验证 IDOR/BOLA。
6. 从 header/query/body/WebSocket 参数直接构造 user、tenant、role 或 owner。
7. 新线程/线程池直接读取 `SecurityContextHolder`，或传播后不在 `finally` 清理恢复。
8. 把 `STATELESS` 当成无 CSRF；Cookie/Basic 等浏览器自动凭据仍能被跨站利用。
9. credentialed CORS 使用 `*`、反射任意 Origin，或让 preflight 先被认证链拒绝。
10. 用 `JWT.decode` 或仅验签后信任 claims，漏验 type、issuer、audience、时间窗和 required claims。
11. 根据 token 的 `alg` 动态选择算法，或把 `kid/jku/x5u` 拼到 SQL、文件路径或任意网络 URL。
12. 使用弱 HMAC 字符串、源码内嵌 key，或轮换时先删除旧验证 key 导致仍有效 token 全部失败。
13. 把 clock skew 当续期，把长 TTL 自包含 JWT 当可即时撤销，或撤销服务异常时 fail-open。
14. 将 401/403/400 合并为 200/boolean，向客户端泄漏逐 claim/key 失败细节，或把 token/session/key 写日志。

## Java 25 / Java 8 临时验证设计

所有验证资产放在 `/tmp` 的 `mktemp` 目录，成功后以精确 `find <dir> -depth -delete` 清理并用
`test ! -e` 确认不存在；不得向仓库添加测试文件、fixture、key、token、session 或构建产物。

1. **纯 Java token profile fixture**：临时生成 RSA key pair 与固定时钟 token；在 Java 25 使用 Auth0
   `java-jwt` 4.6.0 覆盖 valid、malformed、wrong signature、wrong algorithm、missing/wrong `iss/aud`、
   expired、future `nbf`、required claim 缺失和 wrong type。任何失败都不得返回 claims。
2. **Java 8 兼容 fixture**：同一 profile 改写为 Java 8 语法，在 Java 8 编译运行 Auth0 4.6.0；覆盖 valid、
   invalid signature、expired、wrong issuer/audience 与 leeway 边界。输出必须声明“当前库兼容验证”，不伪装成冻结
   项目版本复原。
3. **key rotation fixture**：受信 registry 同时发布 old/new public key，分别验证旧/新 token；切换签发 key 后旧 token
   仍在 TTL 内通过；移除旧 key 后稳定得到 `UNKNOWN_KID`。覆盖 null、unknown、超长与 path/URL-like `kid`，证明
   registry 只做精确 map lookup。
4. **revocation fixture**：用固定 `jti`/subject token version 演示 active、revoked、version stale 和 revocation store
   unavailable；高风险操作一律 fail-closed，错误结果不回显 `jti` 或 token。
5. **资源授权 fixture**：两个同角色、同租户/不同租户用户与各自资源；对 read/update/delete 交换 ID，断言只有
   owner/policy 允许的组合通过。再验证 UUID 与顺序 ID 的授权结论完全相同。
6. **Spring 7.1 临时应用**：Boot 4.1.0 + Security 7.1.0，建立两条 `SecurityFilterChain`、显式
   `permitAll`、authenticated fallback、deny-all fallback 与 `@EnableMethodSecurity`；验证无凭据 401、权限不足
   403、method owner 拒绝、ERROR/ASYNC dispatch、CORS preflight 和安全头仍存在。
7. **context fixture**：单 worker 先执行已认证任务再执行匿名任务；未包装对照应看不到自动传播，使用
   `DelegatingSecurityContextExecutor` 后任务内看到精确主体，完成/异常/取消后 worker context 均为空或恢复原值。
8. **session/CSRF/CORS fixture**：分别建立 session login、header-only bearer、认证 cookie 三种威胁模型；验证 session
   fixation protection、unsafe method CSRF、受信/非受信 Origin、credentialed preflight。禁用 CSRF 只能作用于已证明
   header-only 的 API matcher。
9. **legacy compile fixture**：Boot 2.3.12.RELEASE + Security 5.3.9.RELEASE + Java 8，仅编译并运行最小
   `WebSecurityConfigurerAdapter`/`authorizeRequests`/`antMatchers`/`@EnableGlobalMethodSecurity` 配置；禁止引用
   Security 7.1 API，记录 BOM 解析版本。
10. **失败与审计 fixture**：统一映射 missing credential、malformed、invalid/expired/revoked、insufficient scope、
    object denied；断言 status、`WWW-Authenticate`、稳定 reason category 和审计字段，同时扫描输出确认不含 token、
    Authorization header、session ID、password、private/public key 编码或 verifier exception 细节。
11. Java 25 与 Java 8 核心 fixture 各连续运行两次，记录 runtime/dependency 版本和稳定摘要；第二次不得依赖第一次的
    static context、key cache、denylist、session 或临时文件。

研究阶段只设计反馈环，不创建或运行临时应用、测试、key、token、浏览器或 `dzzz-app`。

## 课程结构与发布 Gate

### 正文建议顺序

1. 用“同角色用户交换订单 ID”区分认证、请求授权与资源授权，先建立 deny-by-default 决策模型。
2. 解释 `FilterChainProxy`、首个匹配 chain、filter 顺序、`permitAll` 与 anonymous 的真实语义。
3. 用请求级 + 方法级 + owner-aware query 三层示例覆盖 URL、action、tenant 与 object relationship。
4. 建立 `SecurityContext` 请求加载/清理、显式持久化与异步传播三个生命周期。
5. 按认证材料是否由浏览器自动附带，分别推导 session fixation、CSRF 与 CORS，而不是按“REST”标签判断。
6. 从 JWT profile 开始签发，随后按结构、算法/key、签名、claims、撤销与 authority mapping 顺序验证。
7. 补充 `kid`/JWK/key rotation、短 TTL/denylist/version/introspection 与 Bearer 400/401/403 失败合同。
8. 最后以 legacy 对照说明 Security 5.3.9 配置与 Auth0 精确版本未知边界，不复制 rejected 项目实现。

### 发布前必须通过

- [x] ID、标题、顺序 610、两个前置、四个来源能力、选择理由与 planned/not-started 状态已核对。
- [x] 29 个唯一官方 URL 均有来源卡，记录 `claims`、`appliesTo`、`driftRisk`、`verifiedAt`。
- [x] 锁定 Boot 4.1.0 / Framework 7.0.8 / Security 7.1.0 / Auth0 java-jwt 4.6.0；legacy
  锁定 Boot 2.3.12 / Framework 5.2.15 / Security 5.3.9，未猜测冻结 Auth0 版本。
- [x] 覆盖认证/授权分离、FilterChain、anonymous/permitAll、请求/方法/资源授权、BOLA/IDOR、context 生命周期、
  session/CSRF/CORS、JWT 签发验证/claims/alg/kid/轮换/撤销/skew、Bearer、失败与审计。
- [x] 正文项目证据只冻结 6 条 observed；`JAVA-RISK-017/018` 的 10 条 rejected 只保留研究审计。
- [x] 14 个易错点与 Java 25/8、Spring 7.1/5.3 临时验证设计已冻结。
- [ ] 课程正文按本稿合同创建，frontmatter 来源只保留实际支撑正文的直接页。
- [ ] Java 25/8 临时反馈环连续两次通过，临时资产已清理且没有 secret/token 输出。
- [ ] 内容合同、Catalog 三次冷启动、Phase 2 validator、根质量 Gate 与 build 全部通过。
- [ ] 桌面/390px 浏览器验收及独立 Standards/Spec 双轴复审通过，signoff 写入最终 SHA。

## 研究 Gate 自检

- [x] 本文件是本任务唯一写入；未修改正文、track、loader、manifest、signoff、依赖或测试。
- [x] Tavily 首选与 Exa 窄后备已记录；所有最终证据均来自官方直接页。
- [x] 未读取、运行或修改 `dzzz-app`；项目事实只来自 Phase 2 冻结清单。
- [x] `project-risk-evidence-only` 未降级为正文 observed；没有从路径或类名推断实现。
- [x] 现代与 legacy API 已隔离；Nimbus Resource Server 与 Auth0 `java-jwt` 已消歧。
- [x] token、session、key、身份字段、审计与错误响应均有 negative contract。
- [x] 行数、Prettier、唯一 URL、URL 可达性、scoped diff 和 SHA-256 由写入后的外部命令核验。

## 发布结论与 Stop Boundary

本文件只完成 Java 高级第 12 门课程的官方资料研究。研究稿通过格式、URL、冻结映射、行数、SHA 与唯一文件
差异核验后，主流程才可进入本课正文 Gate；本任务不授权正文、track/loader/manifest、测试、浏览器、signoff、
下一课、commit、stage 或 push。
