---
id: backend.java.learn.intermediate.jwt-authentication
type: lesson
title: JWT 认证
summary: 从用户名密码认证签发短期 Bearer access token，并由资源服务器验证签名、签发者、受众和时间声明
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 150
prerequisites:
  - backend.java.learn.intermediate.password-and-login
objectives:
  - 能拆解 JWT 的 header、payload 和 signature，并说明 JWS 不提供 payload 加密。
  - 能从用户名密码认证结果签发包含 issuer、audience、subject、issuedAt 和 expiration 的短期 access token。
  - 能配置资源服务器只接受固定 HS256 算法，并在建立主体前验证签名、issuer、audience 和时间声明。
  - '能使用 Authorization: Bearer <token> 访问受保护 API，并解释它与上一课 Session/CSRF 边界的差异。'
  - 能在 Spring Boot 4.1.1/Java 25 与 Spring Boot 2.3.12/Java 8 中保持同一 Bearer 请求反馈环。
  - 能识别明文 payload、算法放宽、只验签名不验声明、超长 token 和把 refresh token 混入本课边界等错误。
recap:
  - JWT 常见序列化由 header、payload、signature 三段组成，Base64URL 编码不等于加密。
  - 签发端先用上一课的 AuthenticationManager 验证密码，再写入固定 issuer、audience、subject 和有限有效期。
  - 资源服务器固定允许的 HS256，并由 JwtDecoder 同时验证签名、issuer、audience、exp、nbf 等时间声明。
  - Bearer token 由客户端显式放进 Authorization header，示例应用采用 STATELESS，不创建 Session Cookie。
  - audience 是资源边界，不是角色；本课不实现 refresh token、撤销列表、密钥轮换、OAuth 授权服务器或角色矩阵。
  - 过期判断允许时钟偏差，验证过期令牌时应让 exp 明显早于当前时间，不能只早一秒。
  - Java 8 线没有 Spring Security 5.3 的签发 API，使用 Nimbus JOSE JWT SignedJWT；解码和声明验证合同保持一致。
related:
  - backend.java.learn.intermediate.password-and-login
tags:
  - Java
  - Spring Boot
  - Spring Security
  - JWT
  - JWS
  - Bearer Token
  - JwtEncoder
  - JwtDecoder
  - 无状态 API
appliesTo: JDK 25 / Spring Boot 4.1.1 / Spring Security 7.1.x 主线；Java 8 / Spring Boot 2.3.12.RELEASE / Spring Security 5.3.9.RELEASE 兼容线
verifiedAt: 2026-08-27
sources:
  - id: rfc-7519-jwt
    title: JSON Web Token (JWT)
    url: https://www.rfc-editor.org/rfc/rfc7519
    sourceOrigin: official
    sourceType: specification
    appliesTo: RFC 7519
    claims:
      - JWT 使用 claims 表达 subject、issuer、audience、issued-at、expiration 和 not-before 等声明。
      - JWS 序列化由受保护 header、payload 和 signature 组成，签名不等于加密。
  - id: rfc-8725-jwt-bcp
    title: JSON Web Token Best Current Practices
    url: https://www.rfc-editor.org/rfc/rfc8725
    sourceOrigin: official
    sourceType: security-standard
    appliesTo: RFC 8725
    claims:
      - 验证端应固定允许算法，并验证 issuer、audience 及其他安全相关声明。
      - 不同用途的 token 应使用明确的验证规则，不能把一个 token 当成所有资源的凭据。
  - id: spring-security-resource-server-jwt-71
    title: OAuth 2.0 Resource Server JWT
    url: https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Security 7.1.x
    claims:
      - Bearer token 由资源服务器提取，JwtDecoder 负责验证并建立已认证主体。
      - SecurityFilterChain 可以启用 oauth2ResourceServer(jwt()) 并保护未允许的请求。
  - id: spring-security-jwt-api-71
    title: Spring Security JWT API
    url: https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/oauth2/jwt/JwtEncoder.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Security 7.1.x
    claims:
      - JwtEncoder 根据 JwtEncoderParameters 生成签名后的 access token。
      - JwtClaimsSet 和 JwsHeader 用于明确声明内容与 JWS 算法。
  - id: spring-security-jwt-api-539
    title: Spring Security 5.3.9 API
    url: https://docs.spring.io/spring-security/site/docs/5.3.9.RELEASE/api/
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Security 5.3.9.RELEASE
    claims:
      - Java 8 兼容线可以使用 NimbusJwtDecoder 验证 HMAC JWT，但没有现代 JwtEncoder 签发 API。
  - id: nimbus-jose-jwt-signedjwt
    title: Nimbus JOSE + JWT SignedJWT API
    url: https://javadoc.io/doc/com.nimbusds/nimbus-jose-jwt/latest/com/nimbusds/jwt/SignedJWT.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Nimbus JOSE + JWT
    claims:
      - SignedJWT 与 JWTClaimsSet、MACSigner 组合后可以在 Java 8 线上签发 HS256 JWS。
---

# JWT 认证

上一课的表单登录把认证结果放进 Session，浏览器自动携带 Cookie；前后端分离的 API 通常希望客户端明确携带一次请求
所需的凭据，并让服务端不保存每个客户端的会话状态。JWT 认证把这个凭据编码成一个可验证的 JWS，客户端发送
`Authorization: Bearer <token>`，资源服务器在进入 Controller 前完成验证。

本课只建立“密码认证换取短期 access token，再访问受保护 API”的边界。你会看到令牌怎样签发、怎样验证以及失败时
为什么返回 401；不会把角色权限、refresh token、撤销列表或 OAuth 授权服务器混进这个最小能力。示例使用固定 HMAC
密钥只是为了让反馈环可复现，生产环境必须从受管密钥存储读取，并通过轮换流程管理。

## 一、先建立 JWT 的数据模型

### 1. 三段序列化不是三层加密

一个紧凑 JWT 通常看起来像下面这样：

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.
eyJpc3MiOiJodHRwczovL2FwaS5leGFtcGxlLnRlc3QiLCJzdWIiOiJkZW1vIiwiYXVkIjoidGVhbWZsb3ctYXBpIiwiZXhwIjoxNz...
.
签名摘要
```

第一段 header 说明序列化类型和算法，例如 `alg=HS256`；第二段 payload 放 claims；第三段 signature 覆盖前两段的
原始 Base64URL 文本。Base64URL 只是可传输的编码，任何拿到 token 的人都可以解码 payload，所以不要把密码、身份证号、
内部密钥或其他需要保密的内容写进 claim。JWS 解决的是完整性与签发方验证，TLS 才是传输保密边界；需要 payload 保密时
应另行使用加密方案，而不是把 JWT 当作密文。

### 2. 声明要服务于资源边界

本课使用的最小 claims 如下：

| claim | 作用 | 本课示例 |
| --- | --- | --- |
| `iss` | 谁签发了 token | `https://api.example.test` |
| `sub` | token 代表的主体 | `demo` |
| `aud` | 哪个资源服务器可以接受 | `teamflow-api` |
| `iat` | 签发时间 | 当前时间 |
| `exp` | 到期时间 | 签发后 5 分钟 |

`aud` 不是角色，也不表示“用户可以做什么”；它先回答“这个 token 是否给当前 API 使用”。角色和对象所有权需要
在后续授权课程中单独建模。`nbf` 若出现，也必须满足“当前时间已经到达 not-before”；示例没有添加它，但默认验证器
仍会处理标准时间声明。

### 3. access token 是短期凭据

令牌被复制后，拿到它的人可以在过期前尝试访问允许的资源。因此 access token 的 TTL 应保持有限，本课设为 5 分钟，
响应只返回 token、类型和 `expiresIn` 秒数。短 TTL 不会自动提供撤销能力；用户退出、设备丢失和主动失效需要后续的
服务端策略。`exp` 使用 NumericDate 语义，实际验证还会考虑配置的时钟偏差，测试过期 token 时应让它早于当前时间足够多。

## 二、从密码认证签发令牌

### 1. 先认证，再组装 claims

签发端点不能只检查请求体里用户名非空就生成 token。正确顺序是：

```text
POST /api/v1/auth/token
  -> AuthenticationManager.authenticate(username + password)
  -> 成功后读取 authentication.getName()
  -> 写入 issuer / audience / subject / iat / exp
  -> 用固定 HS256 签名并返回 Bearer 响应
```

密码匹配仍然使用上一课的 `PasswordEncoder` 和 `UserDetailsService`。认证失败应停止在 `authenticate`，不能为未知用户
签发 token，也不要在响应中区分“用户名不存在”和“密码错误”。

### 2. Spring Boot 4 的签发 API

现代 Spring Security 提供 `JwtEncoder`，它只负责按给定参数签名，不替你决定 claims 是否完整。`JwsHeader.with(...)`
固定本课允许的算法，`JwtClaimsSet.builder()` 写入资源服务器会验证的声明：

```java
/** 根据已经通过密码认证的主体签发短期 access token。 */
TokenResponse issue(Authentication authentication, JwtEncoder jwtEncoder) {
    Instant issuedAt = Instant.now();
    Instant expiresAt = issuedAt.plus(Duration.ofMinutes(5));
    JwtClaimsSet claims = JwtClaimsSet.builder()
            .issuer("https://api.example.test")
            .subject(authentication.getName())
            .audience(List.of("teamflow-api"))
            .issuedAt(issuedAt)
            .expiresAt(expiresAt)
            .build();
    String value = jwtEncoder.encode(JwtEncoderParameters.from(
            JwsHeader.with(MacAlgorithm.HS256).type("JWT").build(), claims)).getTokenValue();
    return new TokenResponse(value, "Bearer", 300);
}
```

这里的 `authentication` 必须来自 `AuthenticationManager.authenticate` 的成功返回值，而不是客户端自己提交的 subject。
`JwtEncoder` 使用应用配置的签名密钥；密钥不应出现在日志、响应之外的调试输出或源码仓库中。

### 3. Java 8 线使用 Nimbus 签发

Spring Security 5.3.9 的 `NimbusJwtDecoder` 能验证 JWT，但没有现代线的 `JwtEncoder`、`JwtClaimsSet` 和 `JwsHeader` 签发
API。兼容线仍可保持同一协议合同，改用 Nimbus JOSE + JWT：

```java
/** 在 Java 8 兼容线上用 Nimbus 签发 HS256 JWT。 */
String issueJava8(Authentication authentication, byte[] secret) throws JOSEException {
    Instant issuedAt = Instant.now();
    JWTClaimsSet claims = new JWTClaimsSet.Builder()
            .issuer("https://api.example.test")
            .subject(authentication.getName())
            .audience(Collections.singletonList("teamflow-api"))
            .issueTime(Date.from(issuedAt))
            .expirationTime(Date.from(issuedAt.plusSeconds(300)))
            .build();
    SignedJWT signed = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
    signed.sign(new MACSigner(secret));
    return signed.serialize();
}
```

这是签发 API 的版本差异，不是 JWT 合同差异：两条线都输出三段 JWS，并使用同一 issuer、audience、subject 和 TTL。
Java 8 线的配置还使用 `WebSecurityConfigurerAdapter`、`authorizeRequests` 和 `antMatchers`；不能把这些配置类名直接
复制到 Security 7 工程。

## 三、在资源服务器边界验证令牌

### 1. `JwtDecoder` 先验证签名

资源服务器收到 Bearer token 后，过滤器先提取 header 中的值，再交给 `JwtDecoder`。解码器必须固定使用与签发端一致的
HMAC 密钥和 `HS256`，不能根据 token 自己声明的 `alg` 任意切换算法。签名覆盖 header 和 payload，只要其中任一字符被改动，
验证就应失败并返回 401。

现代配置的核心片段如下：

```java
/** 创建只接受 HS256 的 JWT 解码器。 */
@Bean
JwtDecoder jwtDecoder(SecretKey key, OAuth2TokenValidator<Jwt> audienceValidator) {
    NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(key)
            .macAlgorithm(MacAlgorithm.HS256)
            .build();
    decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<Jwt>(
            JwtValidators.createDefaultWithIssuer("https://api.example.test"), audienceValidator));
    return decoder;
}
```

`JwtValidators.createDefaultWithIssuer` 会覆盖 issuer、exp、nbf 等默认时间和签发者检查；`audienceValidator` 再明确拒绝
不包含 `teamflow-api` 的 token。只有全部验证器成功，Spring Security 才会把 `Jwt` 放进 `SecurityContext`，Controller 才能
通过 `@AuthenticationPrincipal Jwt` 读取主体。

### 2. audience 验证器是资源隔离，不是授权

```java
/** 只接受发给 TeamFlow API 的 token。 */
@Bean
OAuth2TokenValidator<Jwt> audienceValidator() {
    return jwt -> jwt.getAudience().contains("teamflow-api")
            ? OAuth2TokenValidatorResult.success()
            : OAuth2TokenValidatorResult.failure(new OAuth2Error(
                    "invalid_token", "缺少本 API 的 audience 声明", null));
}
```

同一签名密钥下，另一个 API 的 token 仍可能拥有合法签名；如果不检查 audience，资源边界就会被错误放宽。反过来，
audience 正确也不能替代角色和权限判断。后续课程会在认证主体已经建立后再讨论这些授权条件。

### 3. 过滤器建立主体，Controller 只读取结果

```java
/** 配置无状态 Bearer API。 */
@Bean
SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
                    .requestMatchers(HttpMethod.POST, "/api/v1/auth/token").permitAll()
                    .requestMatchers("/api/v1/public/**").permitAll()
                    .anyRequest().authenticated())
            .oauth2ResourceServer(resourceServer -> resourceServer.jwt(Customizer.withDefaults()));
    return http.build();
}
```

受保护请求没有有效 Bearer token 时，过滤器链在 Controller 之前返回 401；Controller 不需要重复解析三段字符串，也不需要
自己验证签名。示例关闭 CSRF 是因为凭据只在客户端显式设置的 `Authorization` header 中发送，并且会话策略是 `STATELESS`。
这不是 Session 应用的通用关闭开关：上一课的 Cookie 表单登录仍需保留 CSRF，浏览器自动携带 Cookie 的写请求边界不能照搬。

## 四、客户端怎样使用和排查反馈

### 1. 先换取令牌，再携带 Bearer

```bash
curl -sS -H 'Content-Type: application/json' \
  -d '{"username":"demo","password":"Passw0rd!Pass"}' \
  http://localhost:8080/api/v1/auth/token
```

响应形状是：

```json
{"accessToken":"<三段 JWT>","tokenType":"Bearer","expiresIn":300}
```

把响应中的 `accessToken` 作为完整字符串放入下一次请求：

```bash
curl -i -H "Authorization: Bearer $ACCESS_TOKEN" \
  http://localhost:8080/api/v1/me
```

合法响应示例为 `200` 和 `{"username":"demo","audience":["teamflow-api"]}`。不要把 `Bearer` 重复写进 token 值，也不要
把 token 放进 URL 查询参数；URL 更容易进入历史记录、代理日志和分析系统。

### 2. 401 要按验证层定位

| 现象 | 首先检查 |
| --- | --- |
| 没有 `Authorization` | 是否访问了需要认证的路径，是否误以为公开探针也需要 token |
| 篡改后 401 | header、payload 或 signature 是否被改动，是否截断了 token |
| audience 错误 401 | 当前 API 的 audience 是否与签发端完全一致 |
| issuer 错误 401 | `iss` 是否为配置的 canonical URL，是否有尾斜杠差异 |
| 刚签发却过期 | 系统时钟、`exp` 单位和 TTL 计算是否正确 |

不要为了让请求通过而把 `any()`、关闭 issuer/audience 校验或允许所有算法加入配置。先读取服务端稳定的 `invalid_token` 类别，
再对照签发和验证两端的同一事实。日志可以记录失败类别和 request id，但不能记录完整 token、密钥或密码。

## 五、Java 8 与现代线的真实差异

### 1. 协议和安全合同保持相同

两条线都使用：

- HS256 HMAC 签名；
- `https://api.example.test` issuer；
- `teamflow-api` audience；
- `demo` subject；
- 300 秒 access token TTL；
- `JwtDecoder` 验证签名、issuer、audience 和时间声明；
- `STATELESS` 资源服务器，不设置 Session Cookie。

版本差异只发生在 Java/Spring API 表面：现代线用 `JwtEncoder`、`JwtClaimsSet`、`JwsHeader` 和 lambda 配置；Java 8 线用
`SignedJWT`、`JWTClaimsSet`、`MACSigner`、`WebSecurityConfigurerAdapter` 和旧式授权配置。Java 8 线经过独立容器运行验证，
不能只在 Java 25 上使用 `--release 8` 编译就宣称旧运行时兼容。

:::compare{before="Spring Boot 4.1.1 / Java 25" after="Spring Boot 2.3.12 / Java 8"}
### Spring Boot 4.1.1 / Java 25

```java
JwtClaimsSet claims = JwtClaimsSet.builder()
        .issuer(ISSUER)
        .subject(authentication.getName())
        .audience(List.of(AUDIENCE))
        .issuedAt(issuedAt)
        .expiresAt(expiresAt)
        .build();
String token = jwtEncoder.encode(JwtEncoderParameters.from(
        JwsHeader.with(MacAlgorithm.HS256).type("JWT").build(), claims)).getTokenValue();
```

### Spring Boot 2.3.12 / Java 8

```java
JWTClaimsSet claims = new JWTClaimsSet.Builder()
        .issuer(ISSUER)
        .subject(authentication.getName())
        .audience(Collections.singletonList(AUDIENCE))
        .issueTime(Date.from(issuedAt))
        .expirationTime(Date.from(expiresAt))
        .build();
SignedJWT signed = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
signed.sign(new MACSigner(secretBytes));
String token = signed.serialize();
```
:::

两段代码的输出都是 JWS compact serialization；差异是签发 API 与日期类型，不是可以放宽验证的理由。Java 8 线还要使用
`javax.crypto.SecretKey` 和 `javax` 时代的 Spring 包路径，生产迁移时应按 POM 依赖与编译反馈逐项改写。

## 六、集中排查常见错误

下面的错误都能通过最小输入稳定复现。先判断失败发生在 token 内容、签名、声明验证还是会话边界，再修正对应一层。

:::pitfalls
### 把 Base64URL 当成加密

**触发条件：** 把用户密码、密钥或内部业务秘密写入 payload，并认为别人无法读取。

**原因：** header 和 payload 只是 Base64URL 编码，拿到 token 的人可以直接解码；签名只保护完整性和来源。

**后果：** 凭据和隐私进入日志、浏览器存储或第三方系统后会直接泄露。

**错误示例：**

```java
claims.put("password", rawPassword);
```

**正确写法：**

```java
claims.put("sub", authentication.getName());
claims.put("aud", "teamflow-api");
```

**验证方式：** 解码一枚示例 token 的第二段，确认只能看到必要 claims；扫描源码和响应日志，不得出现密码或签名密钥。

### 让 token 自己决定算法

**触发条件：** 根据收到的 `alg` 动态选择验证器，或为了兼容把算法列表配置成任意算法。

**原因：** 验证规则必须由资源服务器的信任配置决定，不能把不受信任的 header 当成算法授权。

**后果：** 不同算法、错误密钥或未签名输入可能绕过原本的签名边界。

**错误示例：**

```java
String algorithm = decodedHeader.get("alg");
return verifierFor(algorithm).verify(token);
```

**正确写法：**

```java
NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(key)
        .macAlgorithm(MacAlgorithm.HS256)
        .build();
```

**验证方式：** 用 header 声明非 HS256 或篡改 signature 的 token 请求 `/api/v1/me`，两者都必须返回 401。

### 只验签名，不验 issuer 和 audience

**触发条件：** `JwtDecoder` 只配置密钥，未配置 issuer 和 audience validator。

**原因：** 合法签名只说明 token 由某个持有密钥的一方生成，不说明它发给当前 API，也不说明仍在有效时间内。

**后果：** 发给其他服务的 token 或错误环境 token 可以进入当前资源边界。

**错误示例：**

```java
JwtDecoder decoder = NimbusJwtDecoder.withSecretKey(key).build();
```

**正确写法：**

```java
decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<Jwt>(
        JwtValidators.createDefaultWithIssuer(ISSUER), audienceValidator));
```

**验证方式：** 使用正确签名但错误 `iss`、错误 `aud` 或过期时间至少早 120 秒的 token 请求 `/api/v1/me`，均应返回 401。

### 把 access token 放入 Cookie 或 URL

**触发条件：** 把本课的 token 放进自动发送的 Cookie，或拼到 `?access_token=` 查询参数。

**原因：** 本课选择 header-only Bearer；Cookie 会重新引入浏览器自动携带和 CSRF 边界，URL 会进入历史、代理和日志。

**后果：** 凭据暴露面扩大，且开发者误以为 STATELESS 已经解决了 CSRF 和泄露问题。

**错误示例：**

```java
response.addCookie(new Cookie("access_token", accessToken));
```

**正确写法：**

```text
Authorization: Bearer <access-token>
```

**验证方式：** 合法 Bearer 请求的响应不应设置 `Set-Cookie`；移除 header 后访问受保护 API 必须返回 401。

### 用过期一秒的 token 测试失效

**触发条件：** 测试 `exp = now - 1` 就断言一定返回 401。

**原因：** JWT 验证器通常允许小幅 clock skew，网络和进程时钟也存在边界误差。

**后果：** 验证器偶尔返回 200，测试误以为过期检查失效，随后错误地修改生产时钟策略。

**错误示例：**

```java
long exp = Instant.now().minusSeconds(1).getEpochSecond();
```

**正确写法：**

```java
long exp = Instant.now().minusSeconds(120).getEpochSecond();
```

**验证方式：** 使用固定密钥签发 `exp` 至少早 120 秒的 token；现代线和 Java 8 线请求 `/api/v1/me` 都应返回 401。
:::

## 七、把认证边界接回 TeamFlow

### 1. 令牌端点和业务接口分开

本课增加两个入口：公开的 `GET /api/v1/public/ping` 用于确认服务已经启动，公开的 `POST /api/v1/auth/token` 用于把上一课
的用户名密码认证结果换成短期 token。`GET /api/v1/me` 是受保护探针，只有资源服务器验证完成后才会进入 Controller。真实
TeamFlow 接入时，可以把 token 签发放进独立认证模块，但用户、团队、项目和任务的 JSON 合同不应被 token 字段污染。

### 2. 无状态不等于没有安全状态

服务端不保存每个 access token 的 Session，并不表示密钥、时钟、issuer、audience 和过期策略可以随请求变化。密钥仍是
高价值秘密，必须进入受管存储；系统时钟必须可靠；部署环境应使用 HTTPS；日志和链路追踪应过滤 `Authorization` header。
本课不实现撤销列表和轮换，但生产设计不能因为“JWT 无状态”就忽略这些运营能力。

### 3. 本课明确留给后续课程的主题

- `delivery-06` 再讨论角色、权限和资源所有权；`audience` 不替代这些授权判断。
- refresh token、设备会话、撤销和密钥轮换需要更完整的生命周期设计，本课不提供伪实现。
- OAuth 2.0 授权码、客户端凭据和授权服务器属于协议角色问题，不能把本课的用户名密码端点称为 OAuth 授权服务器。

## 八、完整程序与运行结果

### 1. 创建现代线 Maven 工程

下面的工程使用 Spring Boot 4.1.1、Java 25 和资源服务器 starter。完整源码把启动类、配置、签发端点和受保护探针放在
一个文件中，便于先观察反馈环；真实项目应按职责拆分文件。

```text
jwt-modern/
  pom.xml
  src/main/java/example/jwt/JwtApplication.java
```

`pom.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>4.1.1</version>
    <relativePath/>
  </parent>
  <groupId>example</groupId>
  <artifactId>jwt-modern</artifactId>
  <version>1.0.0</version>
  <properties><java.version>25</java.version></properties>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-webmvc</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
    </dependency>
  </dependencies>
  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>
```

`JwtApplication.java`：

```java
package example.jwt;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 启动只使用 Bearer access token 的最小资源服务器。 */
@SpringBootApplication
public class JwtApplication {
    private static final String ISSUER = "https://api.example.test";
    private static final String AUDIENCE = "teamflow-api";
    private static final Duration ACCESS_TOKEN_TTL = Duration.ofMinutes(5);

    /** 启动应用。 */
    public static void main(String[] args) {
        SpringApplication.run(JwtApplication.class, args);
    }

    /** 创建只用于示例的 HMAC 签名密钥，生产环境应从受管密钥存储读取。 */
    @Bean
    SecretKey tokenSigningKey() {
        return new SecretKeySpec(
                "change-this-example-key-to-a-managed-32-byte-secret".getBytes(StandardCharsets.UTF_8),
                "HmacSHA256");
    }

    /** 使用固定的 HS256 算法签发令牌。 */
    @Bean
    JwtEncoder jwtEncoder(SecretKey tokenSigningKey) {
        return new NimbusJwtEncoder(new ImmutableSecret<SecurityContext>(tokenSigningKey));
    }

    /** 同时验证签名、签发者、时间声明和受众。 */
    @Bean
    JwtDecoder jwtDecoder(SecretKey tokenSigningKey, OAuth2TokenValidator<Jwt> audienceValidator) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(tokenSigningKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<Jwt>(
                JwtValidators.createDefaultWithIssuer(ISSUER), audienceValidator));
        return decoder;
    }

    /** 拒绝未包含本 API 受众的令牌。 */
    @Bean
    OAuth2TokenValidator<Jwt> audienceValidator() {
        return jwt -> jwt.getAudience().contains(AUDIENCE)
                ? OAuth2TokenValidatorResult.success()
                : OAuth2TokenValidatorResult.failure(new OAuth2Error(
                        "invalid_token", "缺少本 API 的 audience 声明", null));
    }

    /** 仅为本课的用户名密码换取令牌入口提供演示用户。 */
    @Bean
    UserDetailsService users(PasswordEncoder passwordEncoder) {
        return new InMemoryUserDetailsManager(User.withUsername("demo")
                .password(passwordEncoder.encode("Passw0rd!Pass"))
                .authorities("TOKEN_ISSUE")
                .build());
    }

    /** 对登录入口使用上一课已经建立的密码编码合同。 */
    @Bean
    PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    /** 取得 Spring Security 组装好的用户名密码认证器。 */
    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    /** 配置无状态 Bearer API 和资源服务器 JWT 解码器。 */
    @Bean
    org.springframework.security.web.SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/token").permitAll()
                        .requestMatchers("/api/v1/public/**").permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(resourceServer -> resourceServer.jwt(Customizer.withDefaults()));
        return http.build();
    }

    /** 暴露令牌签发和主体读取两个可观察端点。 */
    @RestController
    @RequestMapping("/api/v1")
    static class TokenController {
        private final AuthenticationManager authenticationManager;
        private final JwtEncoder jwtEncoder;

        /** 接收认证器和签发器。 */
        TokenController(AuthenticationManager authenticationManager, JwtEncoder jwtEncoder) {
            this.authenticationManager = authenticationManager;
            this.jwtEncoder = jwtEncoder;
        }

        /** 返回无需认证的健康探针。 */
        @GetMapping("/public/ping")
        Map<String, String> ping() {
            return Map.of("status", "ok");
        }

        /** 用上一课的用户名密码认证结果换取短期 access token。 */
        @PostMapping("/auth/token")
        TokenResponse token(@RequestBody TokenRequest request) {
            Authentication authentication = authenticationManager.authenticate(
                    org.springframework.security.authentication.UsernamePasswordAuthenticationToken
                            .unauthenticated(request.username(), request.password()));
            Instant issuedAt = Instant.now();
            Instant expiresAt = issuedAt.plus(ACCESS_TOKEN_TTL);
            JwtClaimsSet claims = JwtClaimsSet.builder()
                    .issuer(ISSUER)
                    .subject(authentication.getName())
                    .audience(List.of(AUDIENCE))
                    .issuedAt(issuedAt)
                    .expiresAt(expiresAt)
                    .build();
            String accessToken = jwtEncoder.encode(JwtEncoderParameters.from(
                    JwsHeader.with(MacAlgorithm.HS256).type("JWT").build(), claims)).getTokenValue();
            return new TokenResponse(accessToken, "Bearer", ACCESS_TOKEN_TTL.toSeconds());
        }

        /** 读取已完成验证的 JWT 主体。 */
        @GetMapping("/me")
        Map<String, Object> me(@AuthenticationPrincipal Jwt jwt) {
            return Map.of("username", jwt.getSubject(), "audience", jwt.getAudience());
        }
    }

    /** 接收换取令牌所需的用户名密码。 */
    record TokenRequest(String username, String password) {
    }

    /** 返回 access token 本身、类型和有效秒数。 */
    record TokenResponse(String accessToken, String tokenType, long expiresIn) {
    }
}
```

运行 `mvn spring-boot:run` 后执行：

```bash
curl -sS http://localhost:8080/api/v1/public/ping
# {"status":"ok"}

curl -i http://localhost:8080/api/v1/me
# HTTP/1.1 401

curl -sS -H 'Content-Type: application/json' \
  -d '{"username":"demo","password":"Passw0rd!Pass"}' \
  http://localhost:8080/api/v1/auth/token
# 返回三段 accessToken、Bearer 和 expiresIn=300

curl -i -H "Authorization: Bearer $ACCESS_TOKEN" \
  http://localhost:8080/api/v1/me
# HTTP/1.1 200
# {"username":"demo","audience":["teamflow-api"]}
```

### 2. 创建 Java 8 独立工程

Java 8 不能把现代工程只改成 `--release 8`：`record`、`Map.of`、`List.of`、`JwtEncoder` 和 lambda 配置都不成立。
下面使用独立目录、Spring Boot `2.3.12.RELEASE`、Java 8 和 Nimbus 签发，但请求路径、claims、401 行为与现代线保持相同。
在 IDE 中将 Project SDK、模块 SDK 和 Maven Runner JRE 都指向 Java 8 后重新导入这个工程。

```text
jwt-java8/
  pom.xml
  src/main/java/example/jwt/JwtApplication.java
```

`pom.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.3.12.RELEASE</version>
    <relativePath/>
  </parent>
  <groupId>example</groupId>
  <artifactId>jwt-java8</artifactId>
  <version>1.0.0</version>
  <properties><java.version>1.8</java.version></properties>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
    </dependency>
    <dependency>
      <groupId>com.nimbusds</groupId>
      <artifactId>nimbus-jose-jwt</artifactId>
    </dependency>
  </dependencies>
  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>
```

`JwtApplication.java`：

```java
package example.jwt;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Collections;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 启动 Java 8 兼容的 Bearer access token 示例。 */
@SpringBootApplication
public class JwtApplication {
    /** 启动应用。 */
    public static void main(String[] args) {
        SpringApplication.run(JwtApplication.class, args);
    }
}

/** 使用 Spring Security 5.3 的 Java 8 配置 API。 */
@Configuration
@EnableWebSecurity
class SecurityConfig extends WebSecurityConfigurerAdapter {
    static final String ISSUER = "https://api.example.test";
    static final String AUDIENCE = "teamflow-api";

    /** 创建只用于示例的 HMAC 签名密钥，生产环境应从受管密钥存储读取。 */
    @Bean
    SecretKey tokenSigningKey() {
        return new SecretKeySpec(
                "change-this-example-key-to-a-managed-32-byte-secret".getBytes(StandardCharsets.UTF_8),
                "HmacSHA256");
    }

    /** 同时验证签名、签发者、时间声明和受众。 */
    @Bean
    JwtDecoder jwtDecoder(SecretKey tokenSigningKey, OAuth2TokenValidator<Jwt> audienceValidator) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(tokenSigningKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<Jwt>(
                JwtValidators.createDefaultWithIssuer(ISSUER), audienceValidator));
        return decoder;
    }

    /** 拒绝未包含本 API 受众的令牌。 */
    @Bean
    OAuth2TokenValidator<Jwt> audienceValidator() {
        return jwt -> jwt.getAudience().contains(AUDIENCE)
                ? OAuth2TokenValidatorResult.success()
                : OAuth2TokenValidatorResult.failure(new OAuth2Error(
                        "invalid_token", "缺少本 API 的 audience 声明", null));
    }

    /** 提供登录演示用户。 */
    @Bean
    UserDetailsService users(PasswordEncoder passwordEncoder) {
        return new InMemoryUserDetailsManager(User.withUsername("demo")
                .password(passwordEncoder.encode("Passw0rd!Pass"))
                .authorities("TOKEN_ISSUE")
                .build());
    }

    /** 对登录入口使用上一课已经建立的密码编码合同。 */
    @Bean
    PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    /** 组装 Java 8 时代的用户名密码认证器。 */
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(users(passwordEncoder())).passwordEncoder(passwordEncoder());
    }

    /** 暴露认证器给令牌签发端点。 */
    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }

    /** 配置无状态 Bearer API 和资源服务器 JWT 解码器。 */
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.csrf().disable()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
                .authorizeRequests()
                .antMatchers(HttpMethod.POST, "/api/v1/auth/token").permitAll()
                .antMatchers("/api/v1/public/**").permitAll()
                .anyRequest().authenticated().and()
                .oauth2ResourceServer().jwt();
    }
}

/** 暴露令牌签发和主体读取两个可观察端点。 */
@RestController
@RequestMapping("/api/v1")
class TokenController {
    private static final long ACCESS_TOKEN_TTL_SECONDS = 300L;
    private final AuthenticationManager authenticationManager;
    private final SecretKey tokenSigningKey;

    /** 接收认证器和签名密钥。 */
    TokenController(AuthenticationManager authenticationManager, SecretKey tokenSigningKey) {
        this.authenticationManager = authenticationManager;
        this.tokenSigningKey = tokenSigningKey;
    }

    /** 返回无需认证的健康探针。 */
    @GetMapping("/public/ping")
    Map<String, String> ping() {
        return Collections.singletonMap("status", "ok");
    }

    /** 用用户名密码认证结果换取短期 access token。 */
    @PostMapping("/auth/token")
    TokenResponse token(@RequestBody TokenRequest request) throws JOSEException {
        Authentication authentication = authenticationManager.authenticate(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        request.getUsername(), request.getPassword()));
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plusSeconds(ACCESS_TOKEN_TTL_SECONDS);
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer(SecurityConfig.ISSUER)
                .subject(authentication.getName())
                .audience(Collections.singletonList(SecurityConfig.AUDIENCE))
                .issueTime(Date.from(issuedAt))
                .expirationTime(Date.from(expiresAt))
                .build();
        SignedJWT signedJwt = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
        signedJwt.sign(new MACSigner(tokenSigningKey.getEncoded()));
        return new TokenResponse(signedJwt.serialize(), "Bearer", ACCESS_TOKEN_TTL_SECONDS);
    }

    /** 读取已完成验证的 JWT 主体。 */
    @GetMapping("/me")
    Map<String, Object> me(@AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> response = new LinkedHashMap<String, Object>();
        response.put("username", jwt.getSubject());
        response.put("audience", jwt.getAudience());
        return response;
    }
}

/** 描述换取令牌的请求体。 */
class TokenRequest {
    private String username;
    private String password;

    /** 返回用户名。 */
    public String getUsername() {
        return username;
    }

    /** 设置用户名。 */
    public void setUsername(String username) {
        this.username = username;
    }

    /** 返回密码。 */
    public String getPassword() {
        return password;
    }

    /** 设置密码。 */
    public void setPassword(String password) {
        this.password = password;
    }
}

/** 描述令牌签发结果。 */
class TokenResponse {
    private final String accessToken;
    private final String tokenType;
    private final long expiresIn;

    /** 创建令牌响应。 */
    TokenResponse(String accessToken, String tokenType, long expiresIn) {
        this.accessToken = accessToken;
        this.tokenType = tokenType;
        this.expiresIn = expiresIn;
    }

    /** 返回 access token。 */
    public String getAccessToken() {
        return accessToken;
    }

    /** 返回令牌类型。 */
    public String getTokenType() {
        return tokenType;
    }

    /** 返回有效秒数。 */
    public long getExpiresIn() {
        return expiresIn;
    }
}
```

运行 `mvn spring-boot:run` 后，继续使用上一节的请求顺序。Java 8 反馈环应得到同一组固定事实：公开探针 200、缺失令牌
401、合法令牌 200、篡改/错误 audience/错误 issuer/过期令牌均 401，并确认响应没有 `Set-Cookie`。

## 九、独立练习

:::exercise
### 为 Bearer API 增加签发与验证反馈环

**要求：** 创建一个独立的现代 Spring Boot 工程，公开 `GET /api/v1/public/ping` 和 `POST /api/v1/auth/token`，保护
`GET /api/v1/me`。使用上一课的 `PasswordEncoder` 认证 `demo / Passw0rd!Pass`，签发 HS256 JWT，固定 issuer 为
`https://api.example.test`、audience 为 `teamflow-api`、TTL 为 300 秒。资源服务器必须验证签名、issuer、audience 和时间声明，
并使用 `STATELESS`。不要实现角色权限、refresh token、Cookie token 或 URL token。

**验收：** 依次执行请求并得到 `ping=200`、`missing=401`、`token=200`、`valid=200`、`tampered=401`、
`wrongAudience=401`、`wrongIssuer=401`、`expired=401`、`setCookie=0`。过期 token 的 `exp` 至少早于当前时间 120 秒；
输出中不得出现密码、完整 token 或签名密钥。再把签发 API 按 Java 8 线替换为 `SignedJWT` 与 `MACSigner`，确认同一组 HTTP 结果。
:::

### 1. 完整参考实现

现代参考实现就是本课“完整程序”中的 `JwtApplication.java`。为了测试“签名正确但声明错误”的 401，不能给应用增加
测试签发端点；在本地工程的 `src/test/java/example/jwt/JwtFixtureGenerator.java` 创建下面的临时类。它只用 JDK 8 已有的
`Mac` 和 `Base64`，所以两个版本的工程都能使用。它生成的 token 只保存在 shell 变量中，运行后删除该临时测试源码和
`target/jwt-fixtures` 目录，不要提交到应用工程。

```java
package example.jwt;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/** 只为本地反馈环生成带有指定声明的 HS256 JWT。 */
public final class JwtFixtureGenerator {
    private static final String ISSUER = "https://api.example.test";
    private static final String AUDIENCE = "teamflow-api";
    private static final String SECRET = "change-this-example-key-to-a-managed-32-byte-secret";

    private JwtFixtureGenerator() {
    }

    /** 输出三种签名正确但必须被资源服务器拒绝的 token。 */
    public static void main(String[] args) throws Exception {
        long now = System.currentTimeMillis() / 1000L;
        print("wrongAudience", create(ISSUER, "other-api", now, now + 300L));
        print("wrongIssuer", create("https://other.example.test", AUDIENCE, now, now + 300L));
        print("expired", create(ISSUER, AUDIENCE, now - 420L, now - 120L));
    }

    /** 按名称输出 token，便于 shell 保存到变量而不回显完整凭据。 */
    private static void print(String name, String token) {
        System.out.println(name + "=" + token);
    }

    /** 使用示例 HMAC 密钥签发固定 subject 的紧凑 JWS。 */
    private static String create(String issuer, String audience, long issuedAt, long expiresAt) throws Exception {
        String header = encode("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
        String payload = encode(String.format(
                "{\"iss\":\"%s\",\"sub\":\"demo\",\"aud\":[\"%s\"],\"iat\":%d,\"exp\":%d}",
                issuer, audience, issuedAt, expiresAt));
        String signingInput = header + "." + payload;
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return signingInput + "." + encode(mac.doFinal(signingInput.getBytes(StandardCharsets.US_ASCII)));
    }

    /** 将文本编码为不带填充的 Base64URL。 */
    private static String encode(String value) {
        return encode(value.getBytes(StandardCharsets.UTF_8));
    }

    /** 将签名字节编码为不带填充的 Base64URL。 */
    private static String encode(byte[] value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }
}
```

运行时可用下面的完整 shell 反馈环观察关键结果。它先断言每个实际 HTTP 状态，再测试签名被改动、三种签名正确但声明错误的
token，以及资源接口没有写入 Cookie：

```bash
#!/usr/bin/env bash
set -e
BASE_URL=${BASE_URL:-http://localhost:8080}

http_status() {
  curl -sS -o /dev/null -w '%{http_code}' "$@"
}

test "$(http_status "$BASE_URL/api/v1/public/ping")" = 200
test "$(http_status "$BASE_URL/api/v1/me")" = 401

TOKEN_RESPONSE=$(curl -sS -w $'\n%{http_code}' -H 'Content-Type: application/json' \
  -d '{"username":"demo","password":"Passw0rd!Pass"}' \
  "$BASE_URL/api/v1/auth/token")
TOKEN_STATUS=${TOKEN_RESPONSE##*$'\n'}
TOKEN_JSON=${TOKEN_RESPONSE%$'\n'*}
test "$TOKEN_STATUS" = 200
ACCESS_TOKEN=$(printf '%s' "$TOKEN_JSON" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
test "$(printf '%s' "$ACCESS_TOKEN" | awk -F. '{print NF}')" = 3

test "$(http_status -H "Authorization: Bearer $ACCESS_TOKEN" "$BASE_URL/api/v1/me")" = 200
TOKEN_PREFIX=${ACCESS_TOKEN%.*}
TOKEN_SIGNATURE=${ACCESS_TOKEN##*.}
if [ "${TOKEN_SIGNATURE#A}" != "$TOKEN_SIGNATURE" ]; then
  TAMPERED_SIGNATURE="B${TOKEN_SIGNATURE#?}"
else
  TAMPERED_SIGNATURE="A${TOKEN_SIGNATURE#?}"
fi
test "$(http_status -H "Authorization: Bearer $TOKEN_PREFIX.$TAMPERED_SIGNATURE" "$BASE_URL/api/v1/me")" = 401

mkdir -p target/jwt-fixtures
javac -d target/jwt-fixtures src/test/java/example/jwt/JwtFixtureGenerator.java
FIXTURES=$(java -cp target/jwt-fixtures example.jwt.JwtFixtureGenerator)
WRONG_AUDIENCE=$(printf '%s\n' "$FIXTURES" | sed -n 's/^wrongAudience=//p')
WRONG_ISSUER=$(printf '%s\n' "$FIXTURES" | sed -n 's/^wrongIssuer=//p')
EXPIRED=$(printf '%s\n' "$FIXTURES" | sed -n 's/^expired=//p')
test -n "$WRONG_AUDIENCE" && test -n "$WRONG_ISSUER" && test -n "$EXPIRED"
test "$(http_status -H "Authorization: Bearer $WRONG_AUDIENCE" "$BASE_URL/api/v1/me")" = 401
test "$(http_status -H "Authorization: Bearer $WRONG_ISSUER" "$BASE_URL/api/v1/me")" = 401
test "$(http_status -H "Authorization: Bearer $EXPIRED" "$BASE_URL/api/v1/me")" = 401

VALID_HEADERS=$(curl -sS -D - -o /dev/null -H "Authorization: Bearer $ACCESS_TOKEN" "$BASE_URL/api/v1/me")
if printf '%s\n' "$VALID_HEADERS" | grep -q '^Set-Cookie:'; then
  exit 1
fi

printf 'ping=200 missing=401 token=200 valid=200 tampered=401 wrongAudience=401 wrongIssuer=401 expired=401 setCookie=0\n'
```

### 2. 运行结果与自检

主反馈环的可观察结果为：

```text
ping=200
missing=401
token=200
valid=200
tampered=401
wrongAudience=401
wrongIssuer=401
expired=401
setCookie=0
```

`valid=200` 只能说明这枚 token 通过当前资源服务器的全部验证；它不表示用户已经拥有任何角色或业务资源权限。
`setCookie=0` 说明本课的凭据没有重新落入 Session Cookie；它也不代表可以在 Session 表单登录应用里全局关闭 CSRF。

## 十、本课小结

JWT 认证的核心不是把 JSON 拼成三段字符串，而是建立一条可验证的凭据边界：密码认证成功后签发短期 token，资源服务器
固定算法和信任配置，在建立主体前同时检查签名、issuer、audience 与时间声明。header、payload 可被读取，JWS 不提供加密；
Bearer header 的显式传输让示例可以采用无状态会话策略，但密钥、时钟、TLS、日志过滤和生命周期管理仍然是安全责任。
现代 Spring Security 使用 `JwtEncoder`/`JwtDecoder`，Java 8 线使用 Nimbus `SignedJWT` 签发并保持同一验证合同。下一课会
在这个已验证主体之上讨论角色与权限，不会把 audience 误当成授权规则。
