---
id: backend.java.learn.advanced.authentication-authorization-and-jwt
type: lesson
title: 认证、授权、资源边界与 JWT
summary: 用可验证的身份、请求规则和资源所有权边界保护 Java Web 资源，并正确处理 JWT 生命周期
domain: backend
technology: java
module: core
stage: advanced
level: advanced
estimatedMinutes: 260
objectives:
  - 能区分认证、请求授权、方法授权和逐资源授权，并用 deny-by-default 收束未知入口。
  - 能在 Spring Security 中组织 SecurityFilterChain、SecurityContext 和方法授权边界。
  - 能根据浏览器是否自动携带凭据判断 session、CSRF 和 CORS 风险。
  - 能使用固定算法、issuer、audience、时间窗和 key registry 验证 JWT。
  - 能设计 key 轮换、撤销、Bearer 失败响应和不泄露凭据的审计日志。
  - 能解释 Spring Security 7.1 与 5.3.9、Java 25 与 Java 8 的迁移边界。
prerequisites:
  - backend.java.learn.intermediate.spring-mvc-and-servlet-boundaries
  - backend.java.learn.intermediate.errors-results-and-logging
related: []
tags:
  - Java
  - Spring Security
  - 认证
  - 授权
  - 资源所有权
  - JWT
  - Bearer
  - CSRF
  - CORS
  - JWK
  - 撤销
appliesTo: Java 25 / Spring Boot 4.1.0 / Spring Framework 7.0.8 / Spring Security 7.1.0 / Auth0 java-jwt 4.6.0 主线；项目补充适用于 Java 8 / Spring Boot 2.3.12.RELEASE / Spring Framework 5.2.15.RELEASE / Spring Security 5.3.9.RELEASE
modernBaseline:
  java: '25'
  springBoot: 4.1.0
  springFramework: 7.0.8
  springSecurity: 7.1.0
  auth0JavaJwt: 4.6.0
legacyBaseline:
  java: '8'
  springBoot: 2.3.12.RELEASE
  springFramework: 5.2.15.RELEASE
  springSecurity: 5.3.9.RELEASE
verifiedAt: 2026-08-13
sources:
  - id: openjdk-25
    title: OpenJDK JDK 25
    url: https://openjdk.org/projects/jdk/25/
    sourceType: release-note
    appliesTo: JDK 25
    claims: ['JDK 25 的交付状态与 GA 日期；运行验证需单独记录实际补丁版本']
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
  - id: auth0-java-jwt-release
    title: Auth0 java-jwt 4.6.0 release
    url: https://github.com/auth0/java-jwt/releases/tag/4.6.0
    sourceType: release-note
    appliesTo: Auth0 java-jwt 4.6.0
    claims: ['4.6.0 的固定发布版本与发布时间']
  - id: auth0-java-jwt-readme
    title: Auth0 java-jwt 4.6.0 README
    url: https://raw.githubusercontent.com/auth0/java-jwt/4.6.0/README.md
    sourceType: official-reference
    appliesTo: Auth0 java-jwt 4.6.0
    claims: ['JWT.create 签发、JWT.require 验证、Algorithm 与 required claims 的 API 合同']
  - id: auth0-java-jwt-examples
    title: Auth0 java-jwt 4.6.0 examples
    url: https://raw.githubusercontent.com/auth0/java-jwt/4.6.0/EXAMPLES.md
    sourceType: official-reference
    appliesTo: Auth0 java-jwt 4.6.0
    claims: ['默认校验 iat、exp、nbf，leeway 单位为秒，KeyProvider 可按 kid 选择 key']
  - id: security71-authentication-architecture
    title: Spring Security 7.1 authentication architecture
    url: https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/authentication/architecture.adoc
    sourceType: official-reference
    appliesTo: Spring Security 7.1.0
    claims: ['AuthenticationManager 处理认证，成功结果进入 SecurityContext，认证不等于授权']
  - id: security71-servlet-architecture
    title: Spring Security 7.1 servlet architecture
    url: https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/architecture.adoc
    sourceType: official-reference
    appliesTo: Spring Security 7.1.0
    claims: ['FilterChainProxy 选择首个匹配 SecurityFilterChain，过滤器顺序承载安全边界']
  - id: security71-request-authorization
    title: Spring Security 7.1 authorize HTTP requests
    url: https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/authorization/authorize-http-requests.adoc
    sourceType: official-reference
    appliesTo: Spring Security 7.1.0
    claims: ['AuthorizationManager 提供请求级决策，permitAll 保留安全过滤器，规则应 deny by default']
  - id: security71-method-authorization
    title: Spring Security 7.1 method security
    url: https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/authorization/method-security.adoc
    sourceType: official-reference
    appliesTo: Spring Security 7.1.0
    claims: ['EnableMethodSecurity、PreAuthorize 与 PostAuthorize 支持参数和返回对象的服务层授权']
  - id: security71-anonymous
    title: Spring Security 7.1 anonymous authentication
    url: https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/authentication/anonymous.adoc
    sourceType: official-reference
    appliesTo: Spring Security 7.1.0
    claims: ['AnonymousAuthenticationToken 便于统一授权，但不是真实登录主体']
  - id: security71-context-persistence
    title: Spring Security 7.1 context persistence
    url: https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/authentication/persistence.adoc
    sourceType: official-reference
    appliesTo: Spring Security 7.1.0
    claims: ['SecurityContextHolderFilter 只读取 context，跨请求保存需要显式 repository']
  - id: security71-context-concurrency
    title: Spring Security 7.1 concurrency support
    url: https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/integrations/concurrency.adoc
    sourceType: official-reference
    appliesTo: Spring Security 7.1.0
    claims: ['SecurityContext 默认按线程隔离，DelegatingSecurityContextExecutor 负责显式传播和清理']
  - id: security71-session-management
    title: Spring Security 7.1 session management
    url: https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/authentication/session-management.adoc
    sourceType: official-reference
    appliesTo: Spring Security 7.1.0
    claims: ['STATELESS 不保存 session，状态会话仍需处理 fixation、并发会话和 logout']
  - id: security71-csrf
    title: Spring Security 7.1 CSRF
    url: https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/exploits/csrf.adoc
    sourceType: official-reference
    appliesTo: Spring Security 7.1.0
    claims: ['浏览器自动携带 cookie 或 Basic 凭据时，stateless 也不能自动消除 CSRF']
  - id: security71-cors
    title: Spring Security 7.1 CORS
    url: https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/integrations/cors.adoc
    sourceType: official-reference
    appliesTo: Spring Security 7.1.0
    claims: ['CORS preflight 应先于认证链，credentialed 请求不能使用任意来源']
  - id: security71-bearer-token
    title: Spring Security 7.1 bearer token
    url: https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/oauth2/resource-server/bearer-tokens.adoc
    sourceType: official-reference
    appliesTo: Spring Security 7.1.0
    claims: ['Bearer 认证失败经 entry point 返回 WWW-Authenticate，不把 token 写入响应或日志']
  - id: security71-resource-server-jwt
    title: Spring Security 7.1 resource server JWT
    url: https://raw.githubusercontent.com/spring-projects/spring-security/7.1.0/docs/modules/ROOT/pages/servlet/oauth2/resource-server/jwt.adoc
    sourceType: official-reference
    appliesTo: Spring Security 7.1.0
    claims: ['JwtDecoder 验签并验证 JWT，默认 clock skew 为 60 秒，issuer/audience 需按合同设置']
  - id: security539-legacy-reference
    title: Spring Security 5.3.9 reference
    url: https://docs.spring.io/spring-security/site/docs/5.3.9.RELEASE/reference/html5/
    sourceType: official-reference
    appliesTo: Spring Security 5.3.9.RELEASE
    claims: ['旧线使用 WebSecurityConfigurerAdapter、authorizeRequests、antMatchers 与 EnableGlobalMethodSecurity']
  - id: rfc7519-jwt
    title: RFC 7519 JSON Web Token
    url: https://www.rfc-editor.org/rfc/rfc7519.html
    sourceType: specification
    appliesTo: JWT
    claims: ['iss、sub、aud、exp、nbf、iat、jti 的注册声明与时间偏差边界']
  - id: rfc8725-jwt-bcp
    title: RFC 8725 JWT Best Current Practices
    url: https://www.rfc-editor.org/rfc/rfc8725.html
    sourceType: specification
    appliesTo: JWT implementations
    claims: ['算法 allowlist、key 匹配、issuer/audience/type 验证与 cross-JWT confusion 防护']
  - id: rfc6750-bearer
    title: RFC 6750 OAuth 2.0 Bearer Token
    url: https://www.rfc-editor.org/rfc/rfc6750.html
    sourceType: specification
    appliesTo: OAuth 2.0 Bearer Token
    claims: ['TLS、禁止 URI token、WWW-Authenticate 和 invalid_request/invalid_token/insufficient_scope 合同']
  - id: rfc9068-jwt-access-token
    title: RFC 9068 JWT access token profile
    url: https://www.rfc-editor.org/rfc/rfc9068.html
    sourceType: specification
    appliesTo: OAuth 2.0 JWT Access Token Profile
    claims: ['typ=at+jwt、禁止 none、资源服务器验证 typ/iss/aud/signature/exp']
  - id: rfc7517-jwk
    title: RFC 7517 JSON Web Key
    url: https://www.rfc-editor.org/rfc/rfc7517.html
    sourceType: specification
    appliesTo: JWK and JWK Set
    claims: ['kid 用于受信 JWK Set 的 key 匹配，但不建立 issuer、算法或 URL 信任']
  - id: rfc7009-token-revocation
    title: RFC 7009 token revocation
    url: https://www.rfc-editor.org/rfc/rfc7009.html
    sourceType: specification
    appliesTo: OAuth 2.0 token revocation
    claims: ['撤销有传播延迟，自包含 JWT 立即失效需要服务端状态或短 TTL']
  - id: owasp-api1-bola
    title: OWASP API1 Broken Object Level Authorization
    url: https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/
    sourceType: security-standard
    appliesTo: API object authorization
    claims: ['每次对象访问都验证主体对对象和动作的权限，UUID 不能替代授权']
  - id: cwe639-user-controlled-key
    title: CWE-639 Authorization Bypass Through User-Controlled Key
    url: https://cwe.mitre.org/data/definitions/639.html
    sourceType: security-standard
    appliesTo: IDOR/authorization bypass
    claims: ['用户可控对象 key 必须在服务端访问前绑定主体权限']
  - id: owasp-authorization-cheat-sheet
    title: OWASP Authorization Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: application authorization
    claims: ['least privilege、deny by default、每次请求验证资源与动作权限']
  - id: owasp-logging-cheat-sheet
    title: OWASP Logging Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: security audit logging
    claims: ['记录认证与授权结果，不记录 token、session ID、密码或密钥']
projectEvidence:
  - file: dzzz-app/src/main/java/com/tdh/bdzz/controller/CommController.java
    symbol: com.tdh.bdzz.controller.CommController
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/aixntj/AiXntjCourtTreeHelper.java
    symbol: com.tdh.bdzz.util.aixntj.AiXntjCourtTreeHelper
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/NlzxUtil.java
    symbol: com.tdh.bdzz.util.NlzxUtil
    usage: observed
  - file: dzzz-app/src/main/java/tdh/uim/client/vo/LoginRequest.java
    symbol: tdh.uim.client.vo.LoginRequest
    usage: observed
  - file: dzzz-app/src/main/java/tdh/uim/client/vo/LoginData.java
    symbol: tdh.uim.client.vo.LoginData
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/JWTUtil.java
    symbol: com.tdh.bdzz.util.JWTUtil
    usage: observed
---
# 认证、授权、资源边界与 JWT

## 为什么需要学习

登录成功只回答“凭据代表谁”，并没有回答“这个人能否读取当前订单”。后端还必须决定哪些路径公开、哪些动作需要什么权限，以及请求中的对象 ID 是否属于当前主体。JWT 只是承载已签发声明的一种格式，能解析并不等于可信。

本课把一次受保护请求拆成连续的 Gate：先认证主体，再做请求和方法授权，最后在资源查询处绑定主体、租户、动作与对象。这样即使同角色用户互换对象 ID，也会在资源边界被拒绝。

## 学习目标

- 能用自己的话区分认证与四类授权边界。
- 能阅读现代 Spring Security 的最小过滤链和方法授权配置。
- 能判断浏览器凭据、session、CSRF 和 CORS 的真实关系。
- 能按固定 profile 验证 JWT，而不是只 decode 或只看签名。
- 能为轮换、撤销、失败响应和安全审计写出可测试合同。

## 前置术语

认证是把凭据转换成可信主体；授权是对主体、动作和资源做允许/拒绝决策。`SecurityContext` 是当前请求使用的安全上下文，Bearer token 是放在 `Authorization` 请求头中的持有者凭据。HTTP 方法、过滤器和请求生命周期见前置课程。

## 零基础知识点详解

### 认证只建立主体，不授予所有资源权限

**它是什么：** 认证校验凭据并产出主体；授权再判断主体是否能执行某个动作。

**有什么作用：** 把“是谁”和“能做什么”拆开，避免登录成功后直接访问所有数据。

**什么时候使用：** 任何受保护 HTTP、消息或后台任务都要先确定可信主体，再进入授权。

**怎么使用：**

1. 接收 session、Bearer 或其他明确凭据并执行完整校验。
2. 将通过校验的主体写入当前请求的 `SecurityContext`。
3. 在控制器、服务和资源查询处继续执行授权，而不是只检查 context 非空。

**最小示例：**

```java
/** 表示认证后的最小主体。 */
public record AuthenticatedPrincipal(String subject, String tenantId) {}

/** 封装凭据验证与主体创建边界。 */
public final class AuthenticationBoundary {
    /** 只在认证成功后创建主体。 */
    public AuthenticatedPrincipal authenticate(String subject, String tenantId, boolean verified) {
        if (!verified) {
            throw new IllegalArgumentException("凭据未通过验证");
        }
        return new AuthenticatedPrincipal(subject, tenantId);
    }
}
```

**运行结果：** `verified=false` 会拒绝，不能产生主体；成功主体仍需要后续资源授权。

**常见误区：** 只判断 `Authentication != null`，把 anonymous token 当成已登录用户。

### 请求授权要有首个匹配链和最终拒绝

**它是什么：** Spring Security 使用 `FilterChainProxy` 为请求选择首个匹配的 `SecurityFilterChain`，链内规则按声明顺序决策。

**有什么作用：** 明确公开面、认证面和最终 fallback，减少新增路由遗忘保护的机会。

**什么时候使用：** 有多个 API、静态资源、健康检查或管理端点时，先画出 matcher 矩阵。

**怎么使用：**

1. 用 `securityMatcher` 划分每条链的范围，并把公开路径列入清单。
2. 在链内先写最具体的 `permitAll` 或权限规则。
3. 用 `anyRequest().authenticated()` 或显式 deny 作为未知路径的收束。

**最小示例：**

```java
/** 为 API 请求配置首个匹配的安全过滤链。 */
@Bean
SecurityFilterChain apiChain(HttpSecurity http) throws Exception {
    return http
        .securityMatcher("/api/**")
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/health").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/orders/**").hasAuthority("order:read")
            .anyRequest().authenticated())
        .build();
}
```

**运行结果：** `/api/health` 保留安全过滤器但不要求登录；未匹配或缺少权限的请求不会进入业务方法。

**常见误区：** 多条链 matcher 重叠却没有测试首个匹配结果。

### `permitAll` 与 anonymous 不是跳过安全处理

**它是什么：** `permitAll` 只改变授权决策；anonymous filter 可为未认证请求放入匿名对象。

**有什么作用：** 公开端点仍能获得安全头、context 清理和统一审计行为。

**什么时候使用：** 公开登录页、健康检查或静态资源时优先使用明确的 `permitAll`，而非 ignoring。

**怎么使用：**

1. 对公开路径记录允许的 method、dispatcher 和响应要求。
2. 用 `permitAll` 保留过滤链。
3. 对业务资源断言匿名主体仍然被拒绝，并验证响应头没有被绕过。

**最小示例：**

```java
/** 判断当前主体是否为真实认证主体。 */
public static boolean isRealUser(Authentication authentication) {
    return authentication != null && authentication.isAuthenticated()
        && !(authentication instanceof AnonymousAuthenticationToken);
}
```

**运行结果：** 匿名对象即使 `isAuthenticated()` 返回 true，也不会被当成真实用户。

**常见误区：** 用“context 非空”代替主体身份判断。

### 方法授权保护服务层参数和返回对象

**它是什么：** 方法授权在服务层根据参数、返回值或表达式再次决策。

**有什么作用：** 请求路径授权无法表达 owner、tenant、状态和动作组合时，方法授权提供更窄的边界。

**什么时候使用：** 同一服务被多个入口调用，或资源 ID 只在方法参数中出现时使用。

**怎么使用：**

1. 用 `@EnableMethodSecurity` 开启方法授权。
2. 在方法入口检查主体、租户和动作参数。
3. 对返回对象再做可见性检查，拒绝不属于主体的对象。

**最小示例：**

```java
@EnableMethodSecurity
@Configuration
class SecurityMethodConfiguration {}

/** 仅允许当前主体读取自己的订单。 */
@PreAuthorize("@orderPolicy.canRead(authentication, #orderId)")
public OrderView readOrder(String orderId) {
    return orderRepository.findVisible(orderId);
}
```

**运行结果：** policy 在进入方法前拒绝不匹配主体的订单；数据库查询仍应使用 owner-aware 条件。

**常见误区：** 把 URL 角色规则当成逐对象授权。

### 资源查询必须绑定主体、租户和动作

**它是什么：** owner-aware query 将不可信对象 ID 与已验证主体、租户和动作同时作为访问条件。

**有什么作用：** 防止同角色用户通过替换 ID 读取或修改他人的资源。

**什么时候使用：** 每次 `findById`、下载、更新、删除或批量查询都应检查资源关系。

**怎么使用：**

1. 从已验证 context 读取 subject 和 tenant，不接受请求体中的同名字段覆盖。
2. 把 `resourceId + subject + tenant + action` 传给 repository 或 policy。
3. 将“不存在”和“无权访问”映射为统一外部结果，并记录受控审计分类。

**最小示例：**

```java
/** 只返回当前租户和主体可读的订单。 */
public Optional<Order> findVisible(String tenantId, String subject, String orderId) {
    return jdbc.queryOne(
        "select * from orders where id = ? and tenant_id = ? and owner_id = ?",
        orderId, tenantId, subject);
}
```

**运行结果：** 即使攻击者知道另一个订单 ID，租户或 owner 不匹配也只能得到空结果。

**常见误区：** 先全局 `findById`，再忘记在服务层补 owner 检查。

### 主体不能来自 header、query 或 WebSocket 参数

**它是什么：** 请求中的 `userId`、`tenantId`、`role` 只是输入，不是身份事实。

**有什么作用：** 防止攻击者把自己的请求伪装成管理员或其他租户。

**什么时候使用：** 登录请求可以提交待验证凭据；业务请求必须以已验证 context 为主体来源。

**怎么使用：**

1. 从可信认证器取得 subject、issuer、tenant 和 authorities。
2. 忽略或拒绝请求体中的冲突身份字段。
3. 为异步消息和长连接保存受验证的会话绑定，并在敏感动作前重新授权。

**最小示例：**

```java
/** 拒绝客户端伪造的主体字段。 */
public void update(String trustedSubject, UpdateCommand command) {
    if (command.requestedOwner() != null && !trustedSubject.equals(command.requestedOwner())) {
        throw new AccessDeniedException("主体字段冲突");
    }
    service.updateOwned(trustedSubject, command);
}
```

**运行结果：** 冲突的 `requestedOwner` 不会改变实际授权主体。

**常见误区：** 认为 HTTPS 能让客户端声明的 userId 变可信。

### `SecurityContext` 必须按请求加载、保存和清理

**它是什么：** `SecurityContextHolder` 保存当前线程的认证上下文；Security 7.1 的 `SecurityContextHolderFilter` 只读取，显式 repository 才负责保存。

**有什么作用：** 避免跨请求残留旧主体，也让无状态 API 的持久化策略清晰可见。

**什么时候使用：** 自定义认证 filter、session 登录、无状态 Bearer 和异步任务都要定义 owner。

**怎么使用：**

1. 请求开始从明确 repository 加载 context。
2. 认证失败时清空 context，并立即结束认证流程。
3. 请求结束清理线程状态；需要跨请求保存时显式调用 repository。

**最小示例：**

```java
    /** 在自定义请求边界中保证 context 不泄漏。 */
    public void doFilter(Runnable next) {
        try {
            next.run();
        } finally {
            SecurityContextHolder.clearContext();
        }
}
```

**运行结果：** 无论成功、异常还是取消，请求结束都不会把主体留给下一个任务。

**常见误区：** 认证异常被 catch 后继续 chain，形成半认证状态。

### 异步任务需要显式传播并在 finally 清理

**它是什么：** 新线程不会自动获得调用线程的 context；Spring 提供 `DelegatingSecurityContextExecutor` 等包装器。

**有什么作用：** 让后台任务使用明确的主体快照，而不是偶然读取共享线程状态。

**什么时候使用：** 邮件、审计、异步写入和线程池执行敏感操作时使用。

**怎么使用：**

1. 在提交任务时捕获最小、不可变的已验证主体。
2. 使用 SecurityContext 委托 executor 执行任务。
3. 任务结束后恢复或清空 context，并在高风险动作前重新检查权限。

**最小示例：**

```java
/** 让异步任务在受控上下文中运行。 */
public void submit(Executor delegate, Runnable work) {
    new DelegatingSecurityContextExecutor(delegate).execute(work);
}
```

**运行结果：** worker 看到提交时的 context；包装器负责清理，不把原始 bearer token 当任务参数。

**常见误区：** 只在主线程测试通过，就假设线程池自动传播。

### `STATELESS` 仍需根据凭据传输方式评估 CSRF

**它是什么：** `STATELESS` 表示不使用 session 保存认证，不代表浏览器不会自动携带 cookie 或 Basic 凭据。

**有什么作用：** 让 CSRF 判断基于浏览器行为，而不是 REST 标签。

**什么时候使用：** session、认证 cookie、Basic 或浏览器自动发送的凭据存在时保留 unsafe method 防护。

**怎么使用：**

1. 列出每种客户端凭据是手动 header 还是浏览器自动附带。
2. 对自动附带凭据的 unsafe method 启用 CSRF token 和 same-site 策略。
3. 对纯 header Bearer API 以 matcher 范围证明禁用 CSRF，并测试跨站请求不会复用自动凭据。

**最小示例：**

```java
/** 只对明确的纯 header API 关闭 CSRF。 */
http.csrf(csrf -> csrf.ignoringRequestMatchers("/api/header-only/**"));
```

**运行结果：** 关闭范围只影响该 matcher；cookie 会话的写操作仍受保护。

**常见误区：** 把 `SessionCreationPolicy.STATELESS` 写成全局“无 CSRF”。

### CORS 预检必须先于认证链

**它是什么：** 浏览器的 `OPTIONS` 预检通常不携带认证 cookie；安全链先拒绝它会阻断合法跨域请求。

**有什么作用：** 让浏览器先完成来源、方法和 header 协商，再进入真正资源授权。

**什么时候使用：** 前端域名与 API 域名不同，且请求带自定义 header 或凭据时使用。

**怎么使用：**

1. 为每条链声明有限的 allowed origins、methods 和 headers。
2. 让 CORS 处理器在 Spring Security 前响应预检。
3. credentialed 请求禁止 `*`，并用浏览器和非浏览器客户端分别验证。

**最小示例：**

```java
/** 为受信前端来源创建有限的 CORS 配置。 */
@Bean
CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("https://app.example.test"));
    config.setAllowedMethods(List.of("GET", "POST"));
    config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    return request -> config;
}
```

**运行结果：** 受信来源预检得到明确允许列表；其他来源不会被反射回响应。

**常见误区：** 以为浏览器拒绝读取就等于服务端不会执行请求。

### JWT 必须验证 profile、算法、key 和声明

**它是什么：** JWT 是结构化 token；可信性来自完整验证链，而非 base64 解码。

**有什么作用：** 防止算法混淆、跨服务复用、错误 issuer 和过期 token 进入授权流程。

**什么时候使用：** 资源服务器接收 JWT access token 时，按固定 issuer、audience 和算法合同验证。

**怎么使用：**

1. 检查结构、大小和 `typ`，OAuth JWT access token 使用 `at+jwt` profile。
2. 以服务器配置的算法 allowlist 和 key registry 验签，不接受 token 自报算法。
3. 顺序校验 `iss`、`aud`、`exp`、`nbf`、`iat`、必需 claims、撤销状态，再映射 authorities。

**最小示例：**

```java
/** 使用固定算法、issuer 和 audience 创建 verifier。 */
public JWTVerifier verifier(Algorithm algorithm) {
    return JWT.require(algorithm)
        .withIssuer("https://issuer.example.test/")
        .withAudience("orders-api")
        .build();
}

/** 只有完整验证成功后才读取主体。 */
public String verifiedSubject(String token, JWTVerifier verifier) {
    return verifier.verify(token).getSubject();
}
```

**运行结果：** `JWT.decode` 不在此流程中；错误签名、issuer、audience 或时间声明都会抛出验证异常并拒绝请求。

**常见误区：** 先 decode 取 userId，再在后面补一个不完整的签名判断。

### `kid` 只选择受信 key，不能动态打开信任边界

**它是什么：** `kid` 是 JWK Set 中选择 key 的提示，不是 URL、文件路径或算法来源。

**有什么作用：** 支持轮换而不让旧 token 瞬间全部失效。

**什么时候使用：** key registry 有多个受信公钥，且每个 key 绑定 issuer、算法和用途时使用。

**怎么使用：**

1. 先从受信 issuer 配置加载 JWK Set，并限制刷新、缓存和大小。
2. 用 `kid` 在本地 registry 选择候选 key，再检查 key 类型、算法和用途。
3. 未知或恶意 `kid` 稳定失败，不能拼接网络 URL、SQL 或文件路径。

**最小示例：**

```java
/** 只在预先加载的 key registry 中选择 key。 */
public PublicKey select(Map<String, PublicKey> registry, String kid) {
    if (kid == null || kid.length() > 64) {
        throw new IllegalArgumentException("kid 不合法");
    }
    PublicKey key = registry.get(kid);
    if (key == null) {
        throw new IllegalArgumentException("未知 key");
    }
    return key;
}
```

**运行结果：** registry 之外的 key 永远不会被接受；key 命中仍需继续验签和声明校验。

**常见误区：** 把 token 的 `jku` 或 `x5u` 当成可信下载地址。

### 轮换与撤销必须有服务端状态策略

**它是什么：** 轮换更换签发 key；撤销让仍未过期的 token 失效。

**有什么作用：** 降低泄露 key 和被盗 token 的持续影响。

**什么时候使用：** 所有长期运行的 issuer、refresh token 和高风险权限变更都需要明确策略。

**怎么使用：**

1. 先发布新公钥，再切换到新私钥签发。
2. 等旧 token 的最大 TTL 加 clock skew 结束后再移除旧公钥。
3. 对即时失效使用短 TTL、`jti` denylist、主体版本、introspection 或等价状态，并规定状态服务不可用时 fail-closed。

**最小示例：**

```java
/** 判断 token 版本是否仍与主体当前版本一致。 */
public boolean isCurrent(long tokenVersion, long currentVersion) {
    return tokenVersion == currentVersion;
}
```

**运行结果：** 密码重置或权限撤销递增主体版本后，旧 token 不再通过授权。

**常见误区：** 把短 TTL 当成即时撤销，或先删除旧公钥再等待旧 token 过期。

### Bearer 失败和审计日志要稳定且不泄密

**它是什么：** 缺失凭据、格式错误、无效 token 和权限不足是不同外部结果。

**有什么作用：** 客户端可以正确处理，审计系统也能区分攻击信号，而不会暴露内部校验细节。

**什么时候使用：** 所有 Bearer API、登录、撤销和高风险权限变更路径都应统一错误合同。

**怎么使用：**

1. 缺失或无效认证返回 401 和 `WWW-Authenticate` challenge。
2. malformed request 使用 400 `invalid_request`；权限不足使用 403 `insufficient_scope`。
3. 日志只保留 outcome、reason category、受控 subject/tenant、action 和 trace id，不写 token、密码或 key。

**最小示例：**

```java
/** 将认证失败映射为不泄露内部细节的响应。 */
public ResponseEntity<String> bearerFailure(AuthenticationException exception) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .header(HttpHeaders.WWW_AUTHENTICATE, "Bearer error=\"invalid_token\"")
        .body("认证失败");
}
```

**运行结果：** 客户端得到稳定分类，不会看到 verifier exception、key id 或 token 片段。

**常见误区：** 用 200 加 boolean 表示失败，或把 Authorization header 写入 debug 日志。

## 现代版本中的正确用法

现代主线使用 Spring Security 7.1 的 `SecurityFilterChain`、`authorizeHttpRequests`、`requestMatchers` 和 `@EnableMethodSecurity`。资源服务器默认以 Nimbus 解码 JWT；Auth0 `java-jwt` 4.6.0 只作为本课明确冻结的签发/验证库示例，两者 API 和默认行为不能混称。

认证链只负责建立可信主体，业务服务仍需执行 owner-aware query。公开入口使用 `permitAll` 保留安全处理；未知路径默认拒绝。算法、issuer、audience、type、时间、撤销和权限映射必须是同一验证合同。

## 基本语法

```java
/** 配置现代资源服务器的请求授权规则。 */
@Bean
SecurityFilterChain applicationSecurity(HttpSecurity http) throws Exception {
    return http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/login", "/health").permitAll()
            .anyRequest().authenticated())
        .oauth2ResourceServer(oauth -> oauth.jwt(Customizer.withDefaults()))
        .build();
}
```

请求级授权决定是否进入控制器；`@PreAuthorize` 和资源查询决定是否能操作具体对象。不要把角色列表当成 owner 关系。

## 核心接口与完整示例

下面的完整示例只使用 Java 8 与 Java 25 共有的 JDK API，不访问网络，也不把测试密钥当成生产配置。它固定 `HS256`、issuer、audience 和时间声明，验证通过后再执行 owner-aware 授权。生产系统可以把相同的验证合同交给 Auth0 `java-jwt` 或 Spring Resource Server，但不能放宽这些检查。

```java
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/** 演示 JWT 验证、资源所有权和 Bearer 失败分类的完整反馈示例。 */
public final class AuthenticationAuthorizationJwtExample {
    private static final String ISSUER = "https://issuer.example.test/";
    private static final String AUDIENCE = "orders-api";
    // 仅用于本地反馈环；生产密钥必须来自受控秘密管理系统。
    private static final byte[] TEST_KEY = Base64.getDecoder().decode(
        "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=");

    /** 表示认证失败或资源授权失败的稳定外部分类。 */
    enum Failure { NONE, INVALID_TOKEN, FORBIDDEN }

    /** 保存验证后的主体和租户，不接受请求参数覆盖。 */
    static final class Principal {
        final String subject;
        final String tenant;

        /** 创建已验证主体。 */
        Principal(String subject, String tenant) {
            this.subject = subject;
            this.tenant = tenant;
        }
    }

    /** 保存资源所属关系。 */
    static final class Order {
        final String id;
        final String owner;
        final String tenant;

        /** 创建订单所属关系。 */
        Order(String id, String owner, String tenant) {
            this.id = id;
            this.owner = owner;
            this.tenant = tenant;
        }
    }

    /** 保存验证和授权的最终结果。 */
    static final class Result {
        final Principal principal;
        final Failure failure;

        /** 创建结构化结果。 */
        Result(Principal principal, Failure failure) {
            this.principal = principal;
            this.failure = failure;
        }
    }

    /** 使用固定算法签发仅供测试的短时 token。 */
    static String issue(String subject, String tenant, long nowSeconds) throws Exception {
        String header = "{\"alg\":\"HS256\",\"typ\":\"at+jwt\"}";
        String payload = "{\"iss\":\"" + ISSUER + "\",\"aud\":\"" + AUDIENCE
            + "\",\"sub\":\"" + subject + "\",\"tenant\":\"" + tenant
            + "\",\"iat\":" + nowSeconds + ",\"nbf\":" + nowSeconds
            + ",\"exp\":" + (nowSeconds + 60) + "}";
        String encodedHeader = encode(header);
        String encodedPayload = encode(payload);
        String signingInput = encodedHeader + "." + encodedPayload;
        return signingInput + "." + encodeBytes(sign(signingInput));
    }

    /** 验证结构、算法、签名、issuer、audience 和时间声明。 */
    static Result verifyAndAuthorize(String token, Order order, long nowSeconds) throws Exception {
        try {
            String[] parts = token.split("\\.", -1);
            if (parts.length != 3 || !headerIsAllowed(parts[0])) {
                return new Result(null, Failure.INVALID_TOKEN);
            }
            String signingInput = parts[0] + "." + parts[1];
            byte[] expected = sign(signingInput);
            byte[] actual = Base64.getUrlDecoder().decode(parts[2]);
            if (!MessageDigest.isEqual(expected, actual)) {
                return new Result(null, Failure.INVALID_TOKEN);
            }
            String payload = decode(parts[1]);
            if (!ISSUER.equals(stringClaim(payload, "iss"))
                || !AUDIENCE.equals(stringClaim(payload, "aud"))
                || nowSeconds < numberClaim(payload, "nbf")
                || nowSeconds >= numberClaim(payload, "exp")) {
                return new Result(null, Failure.INVALID_TOKEN);
            }
            Principal principal = new Principal(
                stringClaim(payload, "sub"), stringClaim(payload, "tenant"));
            boolean ownerMatches = principal.subject.equals(order.owner)
                && principal.tenant.equals(order.tenant);
            return ownerMatches
                ? new Result(principal, Failure.NONE)
                : new Result(principal, Failure.FORBIDDEN);
        } catch (RuntimeException exception) {
            return new Result(null, Failure.INVALID_TOKEN);
        }
    }

    /** 检查 access token profile 的固定 header。 */
    private static boolean headerIsAllowed(String encodedHeader) {
        return "{\"alg\":\"HS256\",\"typ\":\"at+jwt\"}".equals(decode(encodedHeader));
    }

    /** 对签名输入计算 HMAC-SHA256。 */
    private static byte[] sign(String input) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(TEST_KEY, "HmacSHA256"));
        return mac.doFinal(input.getBytes(StandardCharsets.UTF_8));
    }

    /** 编码 UTF-8 文本为无填充 Base64URL。 */
    private static String encode(String value) {
        return encodeBytes(value.getBytes(StandardCharsets.UTF_8));
    }

    /** 编码字节为无填充 Base64URL。 */
    private static String encodeBytes(byte[] value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }

    /** 解码 Base64URL 文本。 */
    private static String decode(String value) {
        return new String(Base64.getUrlDecoder().decode(value), StandardCharsets.UTF_8);
    }

    /** 读取本示例使用的字符串声明。 */
    private static String stringClaim(String payload, String name) {
        String marker = "\"" + name + "\":\"";
        int start = payload.indexOf(marker);
        if (start < 0) throw new IllegalArgumentException("missing claim");
        start += marker.length();
        int end = payload.indexOf('"', start);
        if (end < 0) throw new IllegalArgumentException("invalid claim");
        return payload.substring(start, end);
    }

    /** 读取本示例使用的数值声明。 */
    private static long numberClaim(String payload, String name) {
        String marker = "\"" + name + "\":";
        int start = payload.indexOf(marker);
        if (start < 0) throw new IllegalArgumentException("missing claim");
        start += marker.length();
        int end = start;
        while (end < payload.length() && Character.isDigit(payload.charAt(end))) end++;
        return Long.parseLong(payload.substring(start, end));
    }

    /** 运行正例、篡改、过期和跨 owner 负例。 */
    public static void main(String[] args) throws Exception {
        long now = Instant.now().getEpochSecond();
        String token = issue("alice", "tenant-a", now);
        Order ownOrder = new Order("order-1", "alice", "tenant-a");
        Order otherOrder = new Order("order-2", "bob", "tenant-a");
        Result allowed = verifyAndAuthorize(token, ownOrder, now + 1);
        Result forbidden = verifyAndAuthorize(token, otherOrder, now + 1);
        Result expired = verifyAndAuthorize(token, ownOrder, now + 61);
        String[] parts = token.split("\\.", -1);
        String tamperedPayload = decode(parts[1]).replace("alice", "mallory");
        String tampered = parts[0] + "." + encode(tamperedPayload) + "." + parts[2];
        Result invalid = verifyAndAuthorize(tampered, ownOrder, now + 1);
        if (allowed.failure != Failure.NONE || forbidden.failure != Failure.FORBIDDEN
            || expired.failure != Failure.INVALID_TOKEN || invalid.failure != Failure.INVALID_TOKEN) {
            throw new AssertionError("authorization contract failed");
        }
        System.out.println("AUTHORIZATION_JWT_PASS allowed=1 forbidden=1 expired=1 tampered=1");
    }
}
```

**运行结果：** 程序输出 `AUTHORIZATION_JWT_PASS allowed=1 forbidden=1 expired=1 tampered=1`；任何签名或声明失败都不会产生主体，跨 owner 访问返回 `FORBIDDEN`。

## 从零跟着做

1. 在 `/tmp` 创建独立反馈目录，把 `AuthenticationAuthorizationJwtExample` 从本文提取为同名 `.java` 文件。
2. 使用 Java 25 或 Java 8 编译并运行，确认输出 `AUTHORIZATION_JWT_PASS allowed=1 forbidden=1 expired=1 tampered=1`。
3. 写公开路径、认证路径、管理路径和未知路径的矩阵，确认每个请求都有唯一首个匹配链。
4. 为资源服务器配置固定 issuer、audience、算法 allowlist 和受信 JWK 来源，禁止根据 token 改变这些值。
5. 在服务层实现 `resourceId + subject + tenant + action` 的 owner-aware 查询，并为同角色交换 ID 写一个拒绝场景。
6. 分别用 header Bearer、认证 cookie 和匿名浏览器请求验证 CSRF/CORS 行为，不用“前后端分离”替代证据。
7. 对缺失、malformed、过期、错误签名和权限不足请求记录 status、challenge 和 reason category，并确认输出不含凭据。

## 如何使用

认证器先验证凭据，过滤链再完成请求级授权，服务方法完成细粒度授权，repository 最终绑定 owner/tenant。异步任务只传播最小主体快照；长任务开始和敏感动作前重新授权。JWT 验证失败直接停止，不把部分 claims 传给业务层。

## 适用与不适用场景

JWT access token 适合跨服务传递短时、可验证的授权事实；需要即时撤销、隐私 payload 或强 sender binding 时，应考虑 opaque introspection、短 TTL 加服务端状态或其他约束。`STATELESS` 适合不保存认证 session 的 API，不是 CSRF 或浏览器安全的总开关。`permitAll` 适合公开入口，不适合代替资源授权。

:::tip
先建立“主体、动作、资源、租户”的授权决策输入，再选择 URL、方法注解或 repository 查询的落点；这样新增入口时不会只补一个角色 matcher。
:::

## 当前项目补充

冻结清单只证明 `CommController`、`AiXntjCourtTreeHelper`、`NlzxUtil`、`LoginRequest`、`LoginData` 和 `JWTUtil` 存在对应使用面。它们用于说明匿名入口、权限过滤、认证请求/数据模型和 JWT 关注点，不证明版本、密钥、claims、撤销或实现安全。`JAVA-RISK-017` 与 `JAVA-RISK-018` 的路径只保留在研究审计中，本课不把它们当作项目正确性证据。

## Java 8 / Spring Boot 2.3 兼容写法

旧线使用 `WebSecurityConfigurerAdapter`、`authorizeRequests`、`antMatchers` 和 `@EnableGlobalMethodSecurity`；这些 API 不能与 Security 7.1 的现代配置混写。Java 8 可以运行本课的固定 Auth0 4.6.0 兼容示例，但这是当前库的临时验证，不是冻结项目依赖版本复原。

```java
/** Java 8 / Security 5.3.9 的旧线配置示意。 */
@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class LegacySecurityConfig extends WebSecurityConfigurerAdapter {
    /** 配置 Security 5.3.9 的旧版请求授权规则。 */
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
            .antMatchers("/health").permitAll()
            .anyRequest().authenticated();
    }
}
```

## 新旧版本差异

现代 Security 7.1 使用 `SecurityFilterChain` bean、`authorizeHttpRequests` 和 `requestMatchers`；Security 5.3.9 使用继承式 `WebSecurityConfigurerAdapter`、`authorizeRequests` 和 `antMatchers`。现代 `SecurityContextHolderFilter` 的显式保存语义也不能倒推旧线默认行为。迁移时按 BOM、API 和测试逐项核对，不要只替换方法名。

## 易错点

:::pitfalls
### 错误：把 anonymous token 当成登录主体

**触发条件：** 只判断 `Authentication != null` 或 `isAuthenticated()`。

**原因：** anonymous filter 会为未登录请求提供统一对象。

**后果：** 匿名请求进入需要真实主体的服务。

**错误示例：**

```java
if (authentication != null) allow();
```

**正确写法：**

```java
if (!(authentication instanceof AnonymousAuthenticationToken)) allowVerified(authentication);
```

**影响版本：** Security 5.3.9 与 7.1.0 均需注意。

**验证方式：** 匿名请求应得到 401/403，且不进入业务方法。

**来源：** `security71-anonymous`、`security539-legacy-reference`。

### 错误：重叠 SecurityFilterChain 没有 fallback

**触发条件：** matcher 重叠、顺序变化或未知路径没有最终规则。

**原因：** FilterChainProxy 只选择首个匹配链。

**后果：** 请求命中错误策略或没有保护。

**错误示例：**

```java
securityMatcher("/api/**"); // 两条链使用相同 matcher，且没有最终收束规则
```

**正确写法：**

```java
authorizeHttpRequests(auth -> auth.anyRequest().denyAll());
```

**影响版本：** Security 7.1.0。

**验证方式：** 为每条路径断言命中的 chain、status 和响应头。

**来源：** `security71-servlet-architecture`、`security71-request-authorization`。

### 错误：公开入口使用 ignoring 绕过整个安全链

**触发条件：** 为减少配置把静态或登录路径从过滤器完全排除。

**原因：** ignoring 不只是允许授权，还跳过安全头、context 清理和审计。

**后果：** 公开面漂移且安全行为不一致。

**错误示例：**

```java
web.ignoring().requestMatchers("/login");
```

**正确写法：**

```java
authorizeHttpRequests(auth -> auth.requestMatchers("/login").permitAll());
```

**影响版本：** Security 5.3.9 与 7.1.0。

**验证方式：** 公开请求仍有预期安全头，未知路径仍拒绝。

**来源：** `security71-request-authorization`、`security71-servlet-architecture`。

### 错误：认证异常后继续 chain

**触发条件：** catch 验证异常后返回 true 或保留旧 context。

**原因：** 失败分支没有清空 context 和停止请求。

**后果：** fail-open、跨请求污染或伪造主体。

**错误示例：**

```java
catch (Exception ignored) { filterChain.doFilter(request, response); }
```

**正确写法：**

```java
SecurityContextHolder.clearContext();
authenticationEntryPoint.commence(request, response, failure);
```

**影响版本：** 所有 Servlet Security 版本。

**验证方式：** malformed、过期和错误 key token 都不能到达控制器。

**来源：** `security71-authentication-architecture`、`security71-context-persistence`、`security71-bearer-token`。

### 错误：只做 URL/role 检查，不做 BOLA

**触发条件：** 同角色用户可交换资源 ID。

**原因：** 角色是粗粒度输入，不代表 owner 或 tenant 关系。

**后果：** 横向越权、数据泄露或越权修改。

**错误示例：**

```java
if (role.equals("USER")) return orderRepository.findById(id);
```

**正确写法：**

```java
return orderRepository.findVisible(id, subject, tenant, action);
```

**影响版本：** 与框架无关的业务边界。

**验证方式：** 两个同角色主体交换 ID 必须稳定拒绝。

**来源：** `owasp-api1-bola`、`cwe639-user-controlled-key`、`owasp-authorization-cheat-sheet`。

### 错误：从请求参数构造身份

**触发条件：** 使用 query/body/header 中的 userId、tenantId 或 role。

**原因：** 客户端输入没有认证器背书。

**后果：** 冒充、串租户和权限提升。

**错误示例：**

```java
subject = request.getParameter("userId");
```

**正确写法：**

```java
subject = SecurityContextHolder.getContext().getAuthentication().getName();
```

**影响版本：** 所有 API 和长连接入口。

**验证方式：** 修改客户端身份字段不应改变授权结果。

**来源：** `owasp-api1-bola`、`cwe639-user-controlled-key`。

### 错误：线程池自动获得或永久保留 context

**触发条件：** 直接在 worker 读取 ThreadLocal，或手动传播不清理。

**原因：** context 默认按线程隔离，线程池会复用线程。

**后果：** 任务看见错误主体或跨租户污染。

**错误示例：**

```java
executor.execute(() -> service.run(SecurityContextHolder.getContext()));
```

**正确写法：**

```java
delegatingExecutor.execute(() -> service.run(verifiedPrincipalSnapshot));
```

**影响版本：** Security 5.3.9 与 7.1.0。

**验证方式：** 交替提交两个主体任务，断言每次看到对应主体。

**来源：** `security71-context-concurrency`、`security539-legacy-reference`。

### 错误：把 STATELESS 当成无 CSRF

**触发条件：** 浏览器仍自动携带 cookie 或 Basic 凭据。

**原因：** stateless 只描述服务端 session 保存方式。

**后果：** 跨站 unsafe method 被执行。

**错误示例：**

```java
http.csrf(csrf -> csrf.disable()); // 同时接受浏览器自动携带的认证 cookie
```

**正确写法：**

```java
http.csrf(csrf -> csrf.ignoringRequestMatchers(headerOnlyApiMatcher));
```

**影响版本：** Security 5.3.9 与 7.1.0。

**验证方式：** 跨站 POST/DELETE 在无 token 时被拒绝。

**来源：** `security71-csrf`、`security71-session-management`。

### 错误：credentialed CORS 反射任意 Origin

**触发条件：** `*`、请求 Origin 原样回显或预检先被认证拒绝。

**原因：** 来源和凭据策略没有形成有限 allowlist。

**后果：** 恶意站点借浏览器凭据发起请求或造成可见数据泄露。

**错误示例：**

```java
configuration.setAllowedOrigins(List.of("*"));
configuration.setAllowCredentials(true);
```

**正确写法：**

```java
configuration.setAllowedOrigins(List.of("https://app.example.test"));
configuration.setAllowCredentials(true);
```

**影响版本：** Security 5.3.9 与 7.1.0。

**验证方式：** 受信来源预检成功，未知来源不被反射。

**来源：** `security71-cors`。

### 错误：只 decode 或只验签 JWT

**触发条件：** 未检查 typ、issuer、audience、时间或 required claims。

**原因：** JWS 签名只保证 key 对 payload 的完整性，不保证业务上下文正确。

**后果：** 跨服务复用、算法混淆或过期 token 被接受。

**错误示例：**

```java
String userId = JWT.decode(token).getSubject();
```

**正确写法：**

```java
DecodedJWT verified = verifier.verify(token);
String userId = verified.getSubject();
```

**影响版本：** Auth0 java-jwt 4.6.0 与 Resource Server。

**验证方式：** wrong signature、wrong issuer、wrong audience、expired 和 missing claim 全部拒绝。

**来源：** `auth0-java-jwt-readme`、`auth0-java-jwt-examples`、`security71-resource-server-jwt`、`rfc8725-jwt-bcp`、`rfc9068-jwt-access-token`。

### 错误：信任 token 的 alg、kid、jku 或 x5u

**触发条件：** 用 token header 决定算法或任意下载 key。

**原因：** token header 是不可信输入。

**后果：** 算法混淆、SSRF、路径/SQL 注入或错误 key 信任。

**错误示例：**

```java
Key key = loadKey(header.get("jku"));
```

**正确写法：**

```java
Key key = trustedKeyRegistry.require(header.get("kid"));
```

**影响版本：** JWT 所有实现。

**验证方式：** unknown kid、外部 URL 和不匹配算法均返回 invalid_token。

**来源：** `rfc8725-jwt-bcp`、`rfc7517-jwk`。

### 错误：轮换先删除旧公钥或使用弱密钥

**触发条件：** 新私钥先签发，旧验证 key 立即移除，或使用短硬编码 HMAC。

**原因：** 未按最大 token TTL 和 key 强度设计轮换。

**后果：** 有效 token 突然失败，或攻击者可猜测签名 key。

**错误示例：**

```java
secret = "123456";
remove(oldKey);
issue(newKey);
```

**正确写法：**

```java
publish(newPublicKey);
issue(newPrivateKey);
removeAfter(oldPublicKey, maximumTokenLifetimePlusSkew);
```

**影响版本：** JWT 所有实现。

**验证方式：** 轮换窗口内新旧 token 都按预期工作，过窗后旧 token 失败。

**来源：** `rfc8725-jwt-bcp`、`rfc7517-jwk`。

### 错误：把 clock skew 当续期或撤销

**触发条件：** 用大 leeway 延长 token，或认为自包含 JWT 可瞬时撤销。

**原因：** 时钟容差、TTL 和服务端撤销状态是不同合同。

**后果：** 被盗 token 生命周期扩大，撤销延迟未被识别。

**错误示例：**

```java
verifier.acceptLeeway(3600);
```

**正确写法：**

```java
verifier.acceptLeeway(configuredClockSkewSeconds);
revocationStore.requireActive(jwtId, subjectVersion);
```

**影响版本：** Auth0 java-jwt 4.6.0 与 Security 7.1.0。

**验证方式：** skew 边界、撤销状态服务异常和旧 jti 都有明确 fail-closed 结果。

**来源：** `auth0-java-jwt-examples`、`security71-resource-server-jwt`、`rfc7009-token-revocation`。

### 错误：合并 400/401/403 或记录敏感凭据

**触发条件：** 所有失败返回 200/false，或日志包含 Authorization header、token、session ID、密码和 key。

**原因：** 没有把 RFC 6750 失败合同和日志脱敏作为接口的一部分。

**后果：** 客户端无法处理，日志泄露后可直接重放凭据。

**错误示例：**

```java
log.warn("auth failed {}", request.getHeader("Authorization"));
```

**正确写法：**

```java
log.warn("auth failed category={} requestId={}", category, requestId);
```

**影响版本：** 所有 Bearer API。

**验证方式：** 扫描响应和日志，确认不含 token、header、session、密码和 key material。

**来源：** `rfc6750-bearer`、`security71-bearer-token`、`owasp-logging-cheat-sheet`。
:::

## 错误与正确写法对比

:::compare
### 错误写法

```text
JWT.decode 后直接取主体
findById(resourceId)
STATELESS 就关闭所有 CSRF
kid 拼接 URL
所有失败返回 200
```

### 正确写法

```text
固定 profile、算法、key、issuer、audience、时间和撤销后再映射
findVisible(resourceId, subject, tenant, action)
按凭据是否自动携带和 matcher 范围决定
仅在预加载的受信 registry 中查找
400/401/403 与 WWW-Authenticate 分类稳定
```
:::

## 安全注意

Bearer token 必须使用 TLS 传输，不放在 URI、日志、异常、任务载荷或浏览器可读的非必要存储中。JWT 签名不提供 payload 保密；需要保密时应使用受信加密协议并单独验证密钥管理。权限变更、撤销服务不可用和 key registry 不一致时默认 fail-closed，并限制重试、审计访问和日志保留。

## 性能注意

授权检查的性能取决于 policy 查询、JWK 缓存、撤销状态和审计写入。记录验证耗时、cache hit/miss、撤销查询和拒绝分类，在受控负载下测量；不要用一次本机请求或 JWT 的短字符串长度推断生产容量。JWK 刷新、denylist 和审计应设置有界超时与容量。

## 如何验证

1. 从本文提取 Auth0 verifier 示例，在 Java 25 与 Java 8 各连续运行两次，覆盖 valid、错误签名、错误 issuer/audience、过期、未来 nbf 和缺失 claim。
2. 用两个同角色主体交换资源 ID，验证请求级、方法级和 owner-aware query 都拒绝越权。
3. 验证多条 SecurityFilterChain 的首个匹配、公开入口的安全头和未知路径 fallback。
4. 分别验证 header-only Bearer、认证 cookie 和 Basic 的 CSRF/CORS 预检、来源和凭据行为。
5. 验证 key rotation 的新旧窗口、未知 kid、算法不匹配、撤销/版本失败和 clock skew 边界。
6. 验证 400/401/403、`WWW-Authenticate` 和审计字段，并扫描输出确认没有 token、Authorization header、session ID、密码或 key material。
7. 所有源码、依赖缓存、日志、token、key、截图和报告只放 `/tmp`，完成后精确删除并用 `test ! -e` 确认。

:::exercise
### 练习：设计一个订单 API 的授权矩阵

**要求：** 为匿名、普通用户、订单审核员和管理员分别定义 `GET /orders/{id}`、`POST /orders/{id}/approve` 和 `DELETE /orders/{id}` 的认证、scope、owner、tenant、状态和审计条件。再为 valid、wrong audience、expired、unknown kid、同角色交换 ID 和撤销状态不可用写出预期 status、challenge 和 reason category。最后说明为什么 URL 角色规则不能替代 repository 的 owner-aware 查询。

**验收：** 矩阵覆盖公开面和未知路径；每个对象动作都有服务端授权；任何 JWT 部分验证失败都不会到达业务；错误响应和日志不泄露 token 或 key。
:::

## 本节小结

- 认证只建立可信主体；请求、方法和资源授权共同决定动作是否允许。
- `permitAll` 保留安全链，anonymous 不是真实登录，未知路径必须有 deny-by-default fallback。
- 资源 ID 必须与主体、租户和动作绑定查询，角色或 UUID 不能替代 BOLA 防护。
- context 的加载、保存、线程传播和清理是不同生命周期；异步任务必须显式传播和回收。
- `STATELESS` 不等于无 CSRF；credentialed CORS 必须使用有限来源且预检先行。
- JWT 验证要固定 profile、算法、key、typ、issuer、audience、时间、必需声明和撤销状态。
- 轮换先发布新公钥再签发，撤销需要短 TTL 加服务端状态或等价策略。
- 401/400/403 和 `WWW-Authenticate` 是客户端合同，日志只记录脱敏的审计分类。
