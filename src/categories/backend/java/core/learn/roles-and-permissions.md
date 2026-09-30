---
id: backend.java.learn.intermediate.roles-and-permissions
type: lesson
title: 角色与权限
summary: 将已认证主体的角色和动作权限映射为稳定的授权规则，并在请求与服务两个边界拒绝越权操作
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 170
prerequisites:
  - backend.java.learn.intermediate.jwt-authentication
objectives:
  - 能区分认证与授权，并根据主体是否已认证和是否具备授权条件判断 401 与 403。
  - 能用 GrantedAuthority 建模带 ROLE_ 前缀的角色和精确匹配的动作权限。
  - 能在 SecurityFilterChain 中按正确顺序声明公开、受限和默认拒绝的请求规则。
  - 能启用方法安全，并在 Spring 管理的服务方法上用 PreAuthorize 保护动作权限。
  - 能把 JWT 的 roles 与 permissions claim 显式映射为项目约定的 authority 字符串。
  - 能分别在 Spring Boot 4.1.1/Java 25 与 Spring Boot 2.3.12.RELEASE/Java 8 中配置同一授权矩阵。
  - 能识别重复 ROLE_ 前缀、宽泛规则抢先匹配、漏开方法安全、信任客户端权限和把角色当作资源归属等错误。
recap:
  - 认证回答“你是谁”，授权回答“你在这个操作上是否被允许”；匿名受保护请求通常得到 401，已认证但权限不足通常得到 403。
  - Spring Security 从 Authentication 的 GrantedAuthority 集合读取授权事实；角色和动作权限都是 authority，但命名与匹配方式不同。
  - hasRole('ADMIN') 会按默认约定检查 ROLE_ADMIN；hasAuthority('task:approve') 精确检查字符串，不会添加前缀。
  - 请求规则按声明顺序采用首个匹配项，具体规则在宽泛规则之前，未知 API 用 denyAll 收口。
  - EnableMethodSecurity 让 PreAuthorize 在 Spring 管理的服务 Bean 边界生效；本类 self-invocation 不会经过代理。
  - JWT claim 只是一段输入数据，必须由服务端 converter 显式转换为受控 authority；客户端请求参数不能授予自己角色。
  - Java 8 与现代线的角色和权限语义相同，差异在 WebSecurityConfigurerAdapter、authorizeRequests、antMatchers 和 EnableGlobalMethodSecurity 等配置入口。
related:
  - backend.java.learn.intermediate.jwt-authentication
  - backend.java.learn.intermediate.password-and-login
tags:
  - Java
  - Spring Boot
  - Spring Security
  - Authorization
  - GrantedAuthority
  - Role
  - Permission
  - PreAuthorize
  - JWT
appliesTo: JDK 25 / Spring Boot 4.1.1 / Spring Security 7.1.x 主线；Java 8 / Spring Boot 2.3.12.RELEASE / Spring Security 5.3.9.RELEASE 兼容线
verifiedAt: 2026-08-27
sources:
  - id: spring-security-request-authorization-71
    title: Authorize HttpServletRequests
    url: https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Security 7.1.x
    claims:
      - authorizeHttpRequests 按声明顺序处理 request matcher，并使用首个匹配的授权规则。
      - hasRole 是为 hasAuthority 增加默认 ROLE_ 前缀的快捷写法。
      - 被拒绝的已认证请求由 AccessDeniedException 和异常转换过滤器形成 403 响应。
  - id: spring-security-authorization-architecture-71
    title: Authorization Architecture
    url: https://docs.spring.io/spring-security/reference/servlet/authorization/architecture.html#authz-authorities
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Security 7.1.x
    claims:
      - Authentication 持有 GrantedAuthority 集合，授权管理器据此作出决定。
      - SimpleGrantedAuthority 用字符串表示普通授权事实。
  - id: spring-security-method-security-71
    title: Method Security
    url: https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Security 7.1.x
    claims:
      - EnableMethodSecurity 显式开启方法安全，PreAuthorize 可以在方法调用前检查授权表达式。
      - 方法安全作用于 Spring 管理的 Bean 调用边界。
  - id: spring-framework-aop-proxying-70
    title: Understanding AOP Proxies
    url: https://docs.spring.io/spring-framework/reference/core/aop/proxying.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.x
    claims:
      - Spring AOP 的 self-invocation 不经过代理，因此不会触发代理提供的横切行为。
  - id: spring-security-jwt-authorities-converter-71
    title: JwtGrantedAuthoritiesConverter
    url: https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/oauth2/server/resource/authentication/JwtGrantedAuthoritiesConverter.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Security 7.1.x
    claims:
      - JwtGrantedAuthoritiesConverter 支持指定 authority claim 名称和 authority prefix。
  - id: spring-security-resource-server-jwt-71
    title: OAuth 2.0 Resource Server JWT
    url: https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html#oauth2resourceserver-jwt-authorization-extraction
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Security 7.1.x
    claims:
      - JwtAuthenticationConverter 可以通过 setJwtGrantedAuthoritiesConverter 接收自定义 authority converter。
      - Servlet 资源服务器 DSL 通过 jwtAuthenticationConverter 注册 JWT 到 Authentication 的转换规则。
  - id: spring-security-resource-server-jwt-539
    title: Spring Security 5.3 Resource Server JWT
    url: https://docs.spring.io/spring-security/site/docs/5.3.9.RELEASE/reference/html5/#oauth2resourceserver-jwt-authorization-extraction
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Security 5.3.9.RELEASE
    claims:
      - Java 8 兼容线同样可以设置 JwtAuthenticationConverter 的 authority converter。
      - Spring Security 5.3 的 JWT DSL 可以注册 jwtAuthenticationConverter。
  - id: spring-security-request-authorization-539
    title: Spring Security 5.3 Request Authorization
    url: https://docs.spring.io/spring-security/site/docs/5.3.9.RELEASE/reference/html5/#jc-authorize-requests
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Security 5.3.9.RELEASE
    claims:
      - Java 8 兼容线使用 authorizeRequests 与 antMatchers 配置 URL 授权规则。
  - id: spring-security-method-security-539
    title: EnableGlobalMethodSecurity
    url: https://docs.spring.io/spring-security/site/docs/5.3.9.RELEASE/api/org/springframework/security/config/annotation/method/configuration/EnableGlobalMethodSecurity.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Security 5.3.9.RELEASE
    claims:
      - Java 8 兼容线通过 EnableGlobalMethodSecurity 的 prePostEnabled 开关启用 PreAuthorize。
---

# 角色与权限

上一课已经把用户名密码认证结果转换为可验证的 Bearer token。token 通过签名、签发者、受众和时间检查后，
Spring Security 才知道请求主体是谁；但“已认证”只是一张通行证，不会自动允许主体读取所有任务、审批所有事项或进入管理入口。

本课把认证后的授权事实组织成角色和动作权限，并放在两个边界检查：请求级规则先决定请求能否进入业务入口，
服务方法再保护真正改变业务状态的动作。示例用 HTTP Basic 固定认证层，目的是把注意力留给授权；JWT 只演示 claim
如何接入，不重新实现签发和验签。

## 一、把授权看成一次有上下文的决定

### 1. 401 与 403 分别说明什么

认证与授权是两步不同的判断。

| 请求状态 | 服务端已知事实 | 典型结果 | 应先检查 |
| --- | --- | --- | --- |
| 没有凭据或凭据无效 | 无法建立 Authentication | 401 Unauthorized | Authorization header、token 验证或登录凭据 |
| 凭据有效，但缺少规则需要的 authority | 已有 Authentication | 403 Forbidden | 角色、权限、matcher 顺序或方法安全表达式 |
| 凭据与 authority 都满足 | 主体与授权事实完整 | 进入 Controller 或服务方法 | 业务输入和资源自身规则 |

本课的 HTTP Basic 示例能稳定得到这两个状态：匿名请求受保护 API 时，安全链发起认证挑战并返回 401；
已经使用正确用户名密码认证、但没有所需 authority 的请求，才返回 403。把未认证的 401 误当作“权限不够”，
会让排查从错误的层开始。

### 2. Authentication 不是权限判断本身

认证成功后，`Authentication` 包含主体名称和 `GrantedAuthority` 集合。请求到达授权点时，Spring Security 的
`AuthorizationManager` 根据当前请求或方法调用读取这些 authority，再允许或拒绝这一次操作。

因此不要把权限写进 Controller 参数、请求体或前端路由状态。以下结构由服务端创建，客户端只能提交凭据，不能声称自己是管理员：

```text
用户名密码或 Bearer token
        ↓ 认证成功
Authentication(username, authorities)
        ↓ 请求规则或 PreAuthorize
允许进入业务操作 / 拒绝为 403
```

`SimpleGrantedAuthority` 是最常用的字符串实现。课程示例显式使用四类字符串，名称本身就是可审查的授权合同：

| authority | 表达的事实 | 适合放在哪里 |
| --- | --- | --- |
| `ROLE_USER` | 普通已认证用户角色 | 粗粒度页面或管理区分 |
| `ROLE_ADMIN` | 管理员角色 | 管理入口 |
| `task:read` | 可以读取任务 | 读取动作 |
| `task:approve` | 可以审批任务 | 会改变状态的动作 |

角色是较粗的分类，权限是可精确匹配的动作能力。两者都属于 authority，不能因为角色名看起来更高级，
就让 `ROLE_ADMIN` 自动代表所有 `task:*` 权限。是否授予审批权限，应由服务端的角色权限策略明确产生。

## 二、让角色和动作权限使用不同的匹配方式

### 1. hasRole 会补上默认前缀

Spring Security 的 `hasRole('ADMIN')` 是 `hasAuthority('ROLE_ADMIN')` 的快捷写法。默认前缀是 `ROLE_`，
所以传给 `hasRole` 的参数必须是不带前缀的业务角色名。

```java
// 检查 ROLE_ADMIN
.requestMatchers("/api/admin/**").hasRole("ADMIN")

// 精确检查 task:approve，不增加任何前缀
/** 执行受动作权限保护的审批。 */
@PreAuthorize("hasAuthority('task:approve')")
public TaskView approve(String taskId) {
    // ...
}
```

`hasAuthority` 不会猜测命名约定，适合动作权限和需要完整字符串的角色检查。选择规则很简单：角色使用
`hasRole('ADMIN')`，原子动作使用 `hasAuthority('task:approve')`；若必须直接检查角色字符串，则写
`hasAuthority('ROLE_ADMIN')`。

:::compare{before="错误的角色匹配" after="与 authority 合同一致的匹配"}
### 错误的角色匹配

```java
.requestMatchers("/api/admin/**").hasRole("ROLE_ADMIN")
```

### 与 authority 合同一致的匹配

```java
.requestMatchers("/api/admin/**").hasRole("ADMIN")
```
:::

现代 Spring Security 会在创建规则时直接拒绝已经带 `ROLE_` 的参数，应用无法按预期启动；旧版表达式入口的
兼容行为也不应成为继续使用含混写法的理由。不要在基础课程中关闭或修改默认前缀来绕过这个现象；
只有对接一个已经固定命名的外部身份源时，才需要专门评估
`GrantedAuthorityDefaults` 的迁移影响。

### 2. JWT claim 必须显式转换

JWT payload 中的 `roles` 和 `permissions` 只是签发方放入的 claim。资源服务器建立 `Authentication` 时，
需要显式规定每个 claim 怎样变成 authority，不能依赖前端展示名称，也不能让一个未约定的 claim 自动生效。

本节直接打开上一课的 `jwt-modern` 与 `jwt-java8` 资源服务器工程继续修改，不重复创建同名工程。两个工程
都使用 `example.jwt` package。分别新建
`src/main/java/example/jwt/RolePermissionConverter.java`，并把下面的完整 converter 放入文件；随后打开已有的
`src/main/java/example/jwt/JwtApplication.java` 修改安全配置、token claims 和探针端点。两个工程的
`pom.xml` 已经包含下面的依赖；把本节代码接入其他工程时，也必须先保留它：

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
```

下面的 converter 保持一个清晰合同：`roles` 的每个值由服务端补成 `ROLE_` 前缀，`permissions` 的每个值保持原样。
它只负责转换，不重新处理上一课已经完成的 JWT 签名、issuer、audience 和过期验证。使用
`Collections.emptyList()` 后，同一份 converter 可以在现代线和 Java 8 兼容线中编译。

```java
package example.jwt;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

/** 把受信任 JWT 的角色和动作权限转换为项目 authority。 */
public final class RolePermissionConverter
        implements Converter<Jwt, Collection<GrantedAuthority>> {

    /** 转换已完成验证的 JWT，不从 HTTP 请求参数读取权限。 */
    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = new ArrayList<>();

        for (String role : claimValues(jwt, "roles")) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
        }
        for (String permission : claimValues(jwt, "permissions")) {
            authorities.add(new SimpleGrantedAuthority(permission));
        }
        return authorities;
    }

    /** 在 claim 缺失时返回空列表，避免把缺少可选授权事实当成解析失败。 */
    private List<String> claimValues(Jwt jwt, String claimName) {
        List<String> values = jwt.getClaimAsStringList(claimName);
        return values == null ? Collections.emptyList() : values;
    }
}
```

`claimValues` 让缺少 `roles` 或 `permissions` 的 token 得到空 authority，而不是触发空指针。只有把 converter
注册到资源服务器，返回值才会进入 `Authentication`。现代线打开 `jwt-modern` 已有的
`JwtApplication.java`，在 `JwtApplication` 类中增加 `JwtAuthenticationConverter` Bean，并用下面的完整方法
替换原 `securityFilterChain`：

```java
import org.springframework.context.annotation.Bean;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;

/** 使用项目约定的角色与权限 claim 创建 JWT 认证转换器。 */
@Bean
JwtAuthenticationConverter jwtAuthenticationConverter() {
    JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
    converter.setJwtGrantedAuthoritiesConverter(new RolePermissionConverter());
    return converter;
}

/** 配置上一课已经建立的 Bearer token 资源服务器。 */
@Bean
SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        JwtAuthenticationConverter jwtAuthenticationConverter) throws Exception {
    http.csrf(csrf -> csrf.disable())
        .sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(authorize -> authorize
            .requestMatchers(HttpMethod.POST, "/api/v1/auth/token").permitAll()
            .requestMatchers("/api/v1/public/**").permitAll()
            .requestMatchers("/api/v1/role-check").hasRole("USER")
            .requestMatchers("/api/v1/me").hasAuthority("task:read")
            .anyRequest().authenticated())
        .oauth2ResourceServer(resourceServer -> resourceServer
            .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter)));
    return http.build();
}
```

Java 8 兼容线打开 `jwt-java8` 已有的 `JwtApplication.java`，在其中的 `SecurityConfig` 类增加同一个
`JwtAuthenticationConverter` Bean，并用下面的方法替换原 `configure(HttpSecurity)`：

```java
/** 使用 Java 8 兼容入口注册同一个 JWT authority 转换器。 */
@Override
protected void configure(HttpSecurity http) throws Exception {
    http.csrf().disable()
        .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
        .authorizeRequests()
            .antMatchers(HttpMethod.POST, "/api/v1/auth/token").permitAll()
            .antMatchers("/api/v1/public/**").permitAll()
            .antMatchers("/api/v1/role-check").hasRole("USER")
            .antMatchers("/api/v1/me").hasAuthority("task:read")
            .anyRequest().authenticated().and()
        .oauth2ResourceServer().jwt()
            .jwtAuthenticationConverter(jwtAuthenticationConverter());
}
```

最后打开上一课签发 token 的 claim builder。现代线在 `build()` 前增加：

```java
.claim("roles", List.of("USER"))
.claim("permissions", List.of("task:read"))
```

Java 8 兼容线写成：

```java
.claim("roles", Collections.singletonList("USER"))
.claim("permissions", Collections.singletonList("task:read"))
```

为了分别观察角色和动作权限，在现代 `TokenController` 中增加：

```java
/** 返回只有 ROLE_USER 才能进入的角色探针。 */
@GetMapping("/role-check")
Map<String, String> roleCheck() {
    return Map.of("role", "ROLE_USER");
}
```

Java 8 的同一位置使用兼容返回值：

```java
/** 返回只有 ROLE_USER 才能进入的角色探针。 */
@GetMapping("/role-check")
Map<String, String> roleCheck() {
    return Collections.singletonMap("role", "ROLE_USER");
}
```

先使用同时包含两个 claims 的 token，请求 `/api/v1/role-check` 和 `/api/v1/me` 都应返回 200。再分别验证：

| token claims | `/api/v1/role-check` | `/api/v1/me` | 证明的映射 |
| --- | --- | --- | --- |
| 只有 `permissions: [task:read]` | 403 | 200 | 缺少 `roles` 时不会产生 `ROLE_USER` |
| 只有 `roles: [USER]` | 200 | 403 | `USER` 被映射为 `ROLE_USER`，但不会产生 `task:read` |
| 两个 claims 都存在 | 200 | 200 | 角色和动作权限都已进入 `Authentication` |

三个请求对照证明签名与声明验证之后，两个 claims 才经过已注册的 converter 分别变成 `ROLE_USER` 和
`task:read`。如果身份提供方只提供一个 scope 风格的字符串 claim，可以改用
`JwtGrantedAuthoritiesConverter` 配置 claim 名称和前缀；无论哪种方式，都要让最终 authority 与
`hasRole`、`hasAuthority` 中的字符串逐项对齐。第八章的 HTTP Basic 工程用于隔离验证请求级与方法级授权，
因此不重复混入 JWT 依赖和签发逻辑。

## 三、请求级规则先缩小入口

### 1. 顺序决定哪个规则被采用

`authorizeHttpRequests` 中的 matcher 按声明顺序匹配，一条请求只使用首个匹配的规则。因此公开路径、
特殊写操作、读取规则和管理规则都要放在宽泛兜底规则之前。

```java
http.authorizeHttpRequests(authorize -> authorize
    .requestMatchers("/public/ping").permitAll()
    .requestMatchers(HttpMethod.POST, "/api/tasks/*/approve").authenticated()
    .requestMatchers(HttpMethod.GET, "/api/tasks/**").hasAuthority("task:read")
    .requestMatchers("/api/admin/**").hasRole("ADMIN")
    .anyRequest().denyAll());
```

审批 URL 只要求已认证，是因为下一节的服务方法会精确检查 `task:approve`。读取 URL 则直接在请求边界检查
`task:read`。最后的 `denyAll` 不是把应用“锁死”，而是让遗漏的 API 立即以 403 显现，避免新建入口意外继承
宽泛的 `authenticated` 或 `permitAll`。

把 `/**` 或 `/api/**` 的宽泛规则放在前面，会让后面的细规则永远没有机会执行。规则改变后应重新运行完整的
请求矩阵，不能只确认管理员请求仍然返回 200。

### 2. 请求授权不替代业务动作保护

同一项服务能力可能被 HTTP Controller、定时任务、消息消费者或另一个服务调用。只在 Controller 或 URL matcher
上保护审批，会让新的调用入口绕开真正的约束。方法安全在 Spring 管理的业务 Bean 调用处再做一次授权决定，
适合保护“批准任务”这种业务动作。

```java
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

@Service
public class TaskApprovalService {

    private final TaskStore taskStore;

    /** 注入唯一负责更新任务状态的存储。 */
    public TaskApprovalService(TaskStore taskStore) {
        this.taskStore = taskStore;
    }

    /** 只有具备任务审批权限的已认证主体才能改变任务状态。 */
    @PreAuthorize("hasAuthority('task:approve')")
    public TaskView approve(String taskId) {
        return taskStore.approve(taskId);
    }
}
```

现代配置必须显式启用 `@EnableMethodSecurity`。该注解通过 Spring AOP 代理拦截从 Bean 外部进入的调用，所以 Controller
需要注入 `TaskApprovalService` 并调用它，不能在同一个类里用 `this.approve(...)` 期待注解生效。`new TaskApprovalService(...)`
也不受 Spring 管理，同样没有方法安全。

角色不是资源所有权。`ROLE_ADMIN`、`task:approve` 只能表达全局授权事实；某个用户能否修改“自己的项目”，
还需要在业务服务中根据资源 owner、团队成员关系或租户边界判断。这些细粒度模型不在本课实现，不能用角色字符串伪装成归属校验。

## 四、先用一组可观察请求验证授权矩阵

### 1. 固定三个主体的 authority

完整示例定义三个内存用户，密码只用于本地反馈环：

| 用户 | authority | 能做什么 |
| --- | --- | --- |
| `alice` | `ROLE_USER`、`task:read` | 读取任务，不能审批 |
| `auditor` | `ROLE_ADMIN`、`task:read` | 读取任务和访问审计入口，不能审批 |
| `marco` | `ROLE_ADMIN`、`task:read`、`task:approve` | 读取、审计和审批 |

这组数据刻意让 `auditor` 具有管理员角色但没有审批权限。它证明角色与动作权限需要分别判断，而不是以为
`ROLE_ADMIN` 自动拥有任意写操作。

### 2. 逐项检查状态码和业务结果

服务启动后，按下面顺序执行。第一条审批请求必须失败且任务仍是 `PENDING`，最后一条才将状态改成 `APPROVED`：

```bash
curl -sS -o /dev/null -w 'public=%{http_code}\n' http://127.0.0.1:8080/public/ping
curl -sS -o /dev/null -w 'anonymousTask=%{http_code}\n' http://127.0.0.1:8080/api/tasks/T-100
curl -sS -u alice:alice-pass -o /dev/null -w 'aliceRead=%{http_code}\n' \
  http://127.0.0.1:8080/api/tasks/T-100
curl -sS -u alice:alice-pass -X POST -o /dev/null -w 'aliceApprove=%{http_code}\n' \
  http://127.0.0.1:8080/api/tasks/T-100/approve
curl -sS -u auditor:auditor-pass -o /dev/null -w 'auditorAdmin=%{http_code}\n' \
  http://127.0.0.1:8080/api/admin/audit
curl -sS -u auditor:auditor-pass -X POST -o /dev/null -w 'auditorApprove=%{http_code}\n' \
  http://127.0.0.1:8080/api/tasks/T-100/approve
curl -sS -u marco:marco-pass -X POST -w 'marcoApprove=%{http_code}\n' \
  http://127.0.0.1:8080/api/tasks/T-100/approve
curl -sS -u marco:marco-pass -o /dev/null -w 'unknown=%{http_code}\n' \
  http://127.0.0.1:8080/api/not-listed
```

预期状态如下：

```text
public=200
anonymousTask=401
aliceRead=200
aliceApprove=403
auditorAdmin=200
auditorApprove=403
{"id":"T-100","title":"发布审批说明","status":"APPROVED"}marcoApprove=200
unknown=403
```

`aliceApprove` 和 `auditorApprove` 都是已认证后的 403，共同原因是两人都缺少 `task:approve`，因此都没有进入
`TaskApprovalService.approve`。区别体现在管理入口：`auditor` 具有 `ROLE_ADMIN`，所以 `auditorAdmin=200`；
`alice` 没有管理员角色。`unknown=403` 证明最后的默认拒绝确实覆盖没有被清单列出的 API。

## 五、Java 8 只更换配置入口

### 1. 授权语义不因 Java 版本改变

JDK 25 与 Java 8 都使用 `Authentication`、`GrantedAuthority`、`ROLE_`、`hasRole`、`hasAuthority` 和
`@PreAuthorize`。没有必要为了制造版本差异而改变 authority 名称、放宽权限检查或将角色换成请求参数。

真正的差异来自 Spring Security 配置 API：现代线用 `SecurityFilterChain`、`authorizeHttpRequests`、
`requestMatchers` 和 `@EnableMethodSecurity`；Java 8 兼容线仍用 `WebSecurityConfigurerAdapter`、
`authorizeRequests`、`antMatchers` 和 `@EnableGlobalMethodSecurity(prePostEnabled = true)`。

:::compare{before="Spring Boot 2.3.12.RELEASE / Java 8" after="Spring Boot 4.1.1 / Java 25"}
### Spring Boot 2.3.12.RELEASE / Java 8

```java
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
class SecurityConfiguration extends WebSecurityConfigurerAdapter {
    /** 使用旧配置入口声明同一授权矩阵。 */
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
            .antMatchers("/public/ping").permitAll()
            .antMatchers(HttpMethod.POST, "/api/tasks/*/approve").authenticated()
            .antMatchers(HttpMethod.GET, "/api/tasks/**").hasAuthority("task:read")
            .antMatchers("/api/admin/**").hasRole("ADMIN")
            .anyRequest().denyAll()
            .and().httpBasic();
    }
}
```

### Spring Boot 4.1.1 / Java 25

```java
@Configuration
@EnableMethodSecurity
class SecurityConfiguration {
    /** 使用现代配置入口声明同一授权矩阵。 */
    @Bean
    SecurityFilterChain apiSecurity(HttpSecurity http) throws Exception {
        return http.authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/public/ping").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/tasks/*/approve").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/tasks/**").hasAuthority("task:read")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().denyAll())
            .httpBasic(Customizer.withDefaults())
            .build();
    }
}
```
:::

迁移时不要把两套 DSL 混在同一个工程。Java 8 线的 starter 与 `javax` Servlet 生态、现代线的 Jakarta 生态也不能交叉导入；
本课的 Controller 没有直接依赖 Servlet API，因此两条完整程序的业务代码保持同一授权矩阵。

## 六、集中排查常见错误

下面的错误会让授权模型比预期更宽或更窄。每项都应在完整示例的 HTTP 矩阵中复现，而不是只凭代码外观判断。

:::pitfalls
### 给 hasRole 再写一次 ROLE_ 前缀

**触发条件：** authority 实际为 `ROLE_ADMIN`，规则却写成 `hasRole('ROLE_ADMIN')`。

**原因：** 现代 `hasRole` 要求传入不带默认前缀的角色名，并拒绝以 `ROLE_` 开头的参数。

**后果：** 现代应用在构建安全规则时启动失败；不同旧版入口还可能表现不同，迁移结果不再一致。

**错误示例：**

```java
.requestMatchers("/api/admin/**").hasRole("ROLE_ADMIN")
```

**正确写法：**

```java
.requestMatchers("/api/admin/**").hasRole("ADMIN")
```

**验证方式：** 现代线使用错误写法时启动失败；恢复正确写法后应用启动成功，`auditor` 请求
`/api/admin/audit` 返回 200。

### 让宽泛 matcher 抢先匹配

**触发条件：** 在 `POST /api/tasks/*/approve` 之前先写 `/api/**` 的 `permitAll` 或 `authenticated`。

**原因：** 请求规则只采用声明顺序中的首个匹配项，后面的精确规则不会再参与决定。

**后果：** 审批可能绕过预期的入口条件，或方法安全还没启用时直接暴露写操作。

**错误示例：**

```java
.requestMatchers("/api/**").permitAll()
.requestMatchers(HttpMethod.POST, "/api/tasks/*/approve").authenticated()
```

**正确写法：**

```java
.requestMatchers(HttpMethod.POST, "/api/tasks/*/approve").authenticated()
.requestMatchers("/api/**").denyAll()
```

**验证方式：** 匿名 POST 审批应为 401；若返回 200 或进入业务日志，说明宽泛规则的位置错误。

### 只写 PreAuthorize，却没有启用方法安全

**触发条件：** 服务方法添加 `@PreAuthorize`，配置类遗漏 `@EnableMethodSecurity`，或 Java 8 线遗漏
`@EnableGlobalMethodSecurity(prePostEnabled = true)`。

**原因：** Spring Security 不会仅凭发现注解就自动注册方法安全拦截器。

**后果：** URL 规则未来一旦改变，缺少 `task:approve` 的调用者可能直接执行审批服务。

**错误示例：**

```java
@Configuration
class SecurityConfiguration {
    // 没有 EnableMethodSecurity
}
```

**正确写法：**

```java
@Configuration
@EnableMethodSecurity
class SecurityConfiguration {
}
```

**验证方式：** 使用 `alice` 调用审批入口应为 403，且再次读取 `T-100` 时状态仍为 `PENDING`。

### 在同一个类中 self-invocation

**触发条件：** 受保护方法和调用代码位于同一个 Bean 中，并使用 `this.approve(taskId)` 调用。

**原因：** Spring AOP 代理只拦截经过代理对象的外部调用，本类内部调用不会离开目标对象。

**后果：** `@PreAuthorize` 看起来存在，却没有在这条调用路径执行。

**错误示例：**

```java
/** 演示不会经过代理的错误内部调用。 */
public TaskView approveFromBatch(String taskId) {
    return this.approve(taskId);
}
```

**正确写法：**

```java
private final TaskApprovalService taskApprovalService;

/** 通过注入的代理对象执行审批。 */
public TaskView approveFromController(String taskId) {
    return taskApprovalService.approve(taskId);
}
```

**验证方式：** 从 Controller 注入的服务 Bean 调用审批；缺少 `task:approve` 的 `alice` 必须被拒绝，状态保持不变。

### 从客户端请求中读取角色或权限

**触发条件：** Controller 从 JSON、查询参数或自定义 header 读取 `role=ADMIN`、`permission=task:approve` 后决定放行。

**原因：** 请求数据由调用者控制，不是认证系统建立的可信 authority。

**后果：** 任意登录用户可以伪造管理员或审批权限，授权边界完全失效。

**错误示例：**

```java
if (request.getHeader("X-Role").equals("ADMIN")) {
    return taskStore.approve(taskId);
}
```

**正确写法：**

```java
/** 只接受服务端 Authentication 中的审批权限。 */
@PreAuthorize("hasAuthority('task:approve')")
public TaskView approve(String taskId) {
    return taskStore.approve(taskId);
}
```

**验证方式：** 给 `alice` 附加 `X-Role: ADMIN` 后请求审批仍应为 403；只有认证后建立的 authority 能改变结果。
:::

## 七、把授权规则接入 TeamFlow API

### 1. 先建立小而稳定的权限词汇

TeamFlow 后续可以将任务读取、任务审批、项目管理等动作整理为可审查的权限词汇，例如 `task:read`、
`task:approve`、`project:write`。同一个权限名称必须在 token 映射、数据库角色策略、请求规则、方法表达式和审计记录中
保持完全一致；随意把 `task:approve` 改成 `approveTask`，会让规则悄悄变成永久 403。

角色策略是“哪些人通常获得哪组权限”的服务端规则，权限检查才是具体操作的最终条件。管理员需要批准任务时，
应该同时赋予 `ROLE_ADMIN` 和 `task:approve`，而不是依靠 Controller 中的 `if (isAdmin)` 临时扩大权限。

### 2. 不要让 API 路径承担所有业务判断

`/api/admin/**` 适合放角色守卫，但 `/api/tasks/{id}/approve` 这种动作需要服务层的权限守卫。若下一课增加批处理、
消息消费或内部调用，应复用同一个 `TaskApprovalService` Bean，而不是复制一份不带 `@PreAuthorize` 的审批逻辑。

资源所有权、团队成员资格、租户隔离和动态权限管理都有各自的数据与一致性问题。它们不是在字符串上再加一个角色就能完成的能力，
本课只保留清晰边界：角色和权限表达全局授权事实，资源归属由相应业务服务单独验证。

## 八、独立练习

:::exercise
### 为任务审批建立授权反馈环

**要求：** 创建现代与 Java 8 两个独立 Spring Boot 工程。公开 `GET /public/ping`；读取 `GET /api/tasks/{taskId}`
必须要求 `task:read`；审计 `GET /api/admin/audit` 必须使用 `hasRole('ADMIN')`；审批
`POST /api/tasks/{taskId}/approve` 必须经过带 `@PreAuthorize("hasAuthority('task:approve')")` 的独立服务 Bean。
定义 `alice`、`auditor` 和 `marco` 三个用户，authority 与本课表格保持一致。不得从 HTTP 请求体、查询参数或 header
授予角色或权限；不得用角色代替项目 owner、团队成员或租户判断。

**验收：** 分别启动两条版本线，获得 `public=200`、`anonymousTask=401`、`aliceRead=200`、
`aliceApprove=403`、`auditorAdmin=200`、`auditorApprove=403`、`marcoApprove=200` 和 `unknown=403`。
在 `marcoApprove` 前后读取同一任务，确认失败审批没有改动状态，成功审批才把状态从 `PENDING` 改为 `APPROVED`。

**参考答案：** 下文给出两个独立工程的完整 POM、完整入口类、运行命令与预期输出。参考实现通过 Controller
注入 `TaskApprovalService`，保证 `@PreAuthorize` 调用经过 Spring 代理，而不是依赖本类调用。
:::

## 九、参考实现与运行结果

### 1. 创建现代线 Maven 工程

在 IntelliJ IDEA 中把 Project SDK、模块 SDK 和 Maven Runner JRE 都设为 JDK 25，确认 POM 的
`java.version` 为 `25`，再执行 Maven Reload。这样 IDE 语法级别、Maven 运行时和编译目标使用同一条现代线。

在 `/tmp/role-permission-modern` 创建目录结构：

```text
role-permission-modern/
├── pom.xml
└── src/main/java/example/authorization/AuthorizationApplication.java
```

创建 `pom.xml`：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>4.1.1</version>
    </parent>
    <groupId>example</groupId>
    <artifactId>role-permission-modern</artifactId>
    <version>1.0.0</version>
    <properties>
        <java.version>25</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
    </dependencies>
</project>
```

创建 `src/main/java/example/authorization/AuthorizationApplication.java`：

```java
package example.authorization;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.access.prepost.PreAuthorize;

/** 启动角色与动作权限示例应用。 */
@SpringBootApplication
public class AuthorizationApplication {

    /** 启动 Spring Boot 应用。 */
    public static void main(String[] args) {
        SpringApplication.run(AuthorizationApplication.class, args);
    }

    /** 配置 HTTP 请求与服务方法的授权边界。 */
    @Configuration
    @EnableWebSecurity
    @EnableMethodSecurity
    static class SecurityConfiguration {

        /** 创建只服务于本地反馈环的密码编码器。 */
        @Bean
        PasswordEncoder passwordEncoder() {
            return PasswordEncoderFactories.createDelegatingPasswordEncoder();
        }

        /** 创建三个 authority 明确可见的内存用户。 */
        @Bean
        UserDetailsService users(PasswordEncoder passwordEncoder) {
            return new InMemoryUserDetailsManager(
                User.withUsername("alice")
                    .password(passwordEncoder.encode("alice-pass"))
                    .authorities("ROLE_USER", "task:read")
                    .build(),
                User.withUsername("auditor")
                    .password(passwordEncoder.encode("auditor-pass"))
                    .authorities("ROLE_ADMIN", "task:read")
                    .build(),
                User.withUsername("marco")
                    .password(passwordEncoder.encode("marco-pass"))
                    .authorities("ROLE_ADMIN", "task:read", "task:approve")
                    .build());
        }

        /** 让公开、读取、管理和未知请求按声明顺序接受授权。 */
        @Bean
        SecurityFilterChain apiSecurity(HttpSecurity http) throws Exception {
            return http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(Customizer.withDefaults())
                .authorizeHttpRequests(authorize -> authorize
                    .requestMatchers("/public/ping").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/tasks/*/approve").authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/tasks/**").hasAuthority("task:read")
                    .requestMatchers("/api/admin/**").hasRole("ADMIN")
                    .anyRequest().denyAll())
                .build();
        }
    }

    /** 暴露无需认证的存活探针。 */
    @RestController
    @RequestMapping("/public")
    static class PublicController {

        /** 返回应用已启动这一最小事实。 */
        @GetMapping("/ping")
        Map<String, String> ping() {
            return Map.of("status", "ok");
        }
    }

    /** 暴露由 URL 规则和服务方法共同保护的任务入口。 */
    @RestController
    @RequestMapping("/api/tasks")
    static class TaskController {

        private final TaskStore taskStore;
        private final TaskApprovalService taskApprovalService;

        /** 注入任务存储与受方法安全保护的服务 Bean。 */
        TaskController(TaskStore taskStore, TaskApprovalService taskApprovalService) {
            this.taskStore = taskStore;
            this.taskApprovalService = taskApprovalService;
        }

        /** 读取单个任务，URL 规则要求 task:read。 */
        @GetMapping("/{taskId}")
        TaskView read(@PathVariable String taskId) {
            return taskStore.read(taskId);
        }

        /** 从 Controller 外部调用受保护的服务 Bean。 */
        @PostMapping("/{taskId}/approve")
        TaskView approve(@PathVariable String taskId) {
            return taskApprovalService.approve(taskId);
        }
    }

    /** 暴露只允许管理员角色访问的审计入口。 */
    @RestController
    @RequestMapping("/api/admin")
    static class AdminController {

        /** 返回一个最小审计读模型。 */
        @GetMapping("/audit")
        Map<String, String> audit() {
            return Map.of("status", "audit-visible");
        }
    }

    /** 保存示例任务的内存状态。 */
    @Component
    static class TaskStore {

        private final Map<String, TaskView> tasks = new ConcurrentHashMap<>();

        /** 创建一条初始为待审批状态的示例任务。 */
        TaskStore() {
            tasks.put("T-100", new TaskView("T-100", "发布审批说明", "PENDING"));
        }

        /** 读取任务，不存在时明确返回 404。 */
        TaskView read(String taskId) {
            TaskView task = tasks.get(taskId);
            if (task == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "task not found");
            }
            return task;
        }

        /** 将存在的任务更新为已审批状态。 */
        TaskView approve(String taskId) {
            TaskView task = read(taskId);
            TaskView approved = new TaskView(task.id(), task.title(), "APPROVED");
            tasks.put(taskId, approved);
            return approved;
        }
    }

    /** 用方法安全保护真正改变状态的业务动作。 */
    @Service
    static class TaskApprovalService {

        private final TaskStore taskStore;

        /** 注入唯一负责更新任务状态的存储。 */
        TaskApprovalService(TaskStore taskStore) {
            this.taskStore = taskStore;
        }

        /** 只有 task:approve authority 才能批准任务。 */
        @PreAuthorize("hasAuthority('task:approve')")
        TaskView approve(String taskId) {
            return taskStore.approve(taskId);
        }
    }

    /** 作为 API 响应的不可变任务视图。 */
    record TaskView(String id, String title, String status) {
    }
}
```

运行 `mvn spring-boot:run` 后，使用上一节的请求矩阵。现代线的实际输出应包含所有 200、401 与 403 状态，
并且 `marco` 的审批响应为：

```json
{"id":"T-100","title":"发布审批说明","status":"APPROVED"}
```

### 2. 创建 Java 8 独立工程

Java 8 版本不能只把现代 POM 的编译目标改为 8；它必须使用 Spring Boot `2.3.12.RELEASE` 和旧版安全配置入口。
在 IntelliJ IDEA 中把 Project SDK、模块 SDK 和 Maven Runner JRE 都设为 Java 8，确认 POM 的
`java.version` 为 `1.8`，再执行 Maven Reload；不要在同一模块中来回覆盖现代线的 SDK 和 POM。
在 `/tmp/role-permission-legacy` 创建同名目录结构，并创建 `pom.xml`：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.3.12.RELEASE</version>
    </parent>
    <groupId>example</groupId>
    <artifactId>role-permission-legacy</artifactId>
    <version>1.0.0</version>
    <properties>
        <java.version>1.8</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
    </dependencies>
</project>
```

创建 `src/main/java/example/authorization/legacy/LegacyAuthorizationApplication.java`：

```java
package example.authorization.legacy;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** 启动 Java 8 兼容线的角色与权限示例。 */
@SpringBootApplication
public class LegacyAuthorizationApplication {

    /** 启动 Java 8 兼容应用。 */
    public static void main(String[] args) {
        SpringApplication.run(LegacyAuthorizationApplication.class, args);
    }

    /** 使用 Spring Security 5.3 的配置 API 建立同一授权矩阵。 */
    @Configuration
    @EnableWebSecurity
    @EnableGlobalMethodSecurity(prePostEnabled = true)
    static class SecurityConfiguration extends WebSecurityConfigurerAdapter {

        /** 创建本地 HTTP Basic 演示使用的密码编码器。 */
        @Bean
        public PasswordEncoder passwordEncoder() {
            return PasswordEncoderFactories.createDelegatingPasswordEncoder();
        }

        /** 注册三个具有固定 authority 的内存用户。 */
        @Override
        protected void configure(AuthenticationManagerBuilder auth) throws Exception {
            auth.inMemoryAuthentication()
                .withUser("alice")
                .password(passwordEncoder().encode("alice-pass"))
                .authorities("ROLE_USER", "task:read")
                .and()
                .withUser("auditor")
                .password(passwordEncoder().encode("auditor-pass"))
                .authorities("ROLE_ADMIN", "task:read")
                .and()
                .withUser("marco")
                .password(passwordEncoder().encode("marco-pass"))
                .authorities("ROLE_ADMIN", "task:read", "task:approve");
        }

        /** 按旧 DSL 的声明顺序匹配请求并默认拒绝未知路径。 */
        @Override
        protected void configure(HttpSecurity http) throws Exception {
            http.csrf().disable()
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .httpBasic()
                .and()
                .authorizeRequests()
                .antMatchers("/public/ping").permitAll()
                .antMatchers(HttpMethod.POST, "/api/tasks/*/approve").authenticated()
                .antMatchers(HttpMethod.GET, "/api/tasks/**").hasAuthority("task:read")
                .antMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().denyAll();
        }
    }

    /** 暴露无需认证的存活探针。 */
    @RestController
    @RequestMapping("/public")
    static class PublicController {

        /** 返回应用已启动这一最小事实。 */
        @GetMapping("/ping")
        public Map<String, String> ping() {
            Map<String, String> response = new LinkedHashMap<>();
            response.put("status", "ok");
            return response;
        }
    }

    /** 暴露由 URL 规则和方法安全共同保护的任务入口。 */
    @RestController
    @RequestMapping("/api/tasks")
    static class TaskController {

        private final TaskStore taskStore;
        private final TaskApprovalService taskApprovalService;

        /** 注入任务存储与受方法安全保护的服务 Bean。 */
        TaskController(TaskStore taskStore, TaskApprovalService taskApprovalService) {
            this.taskStore = taskStore;
            this.taskApprovalService = taskApprovalService;
        }

        /** 读取单个任务，URL 规则要求 task:read。 */
        @GetMapping("/{taskId}")
        public TaskView read(@PathVariable String taskId) {
            return taskStore.read(taskId);
        }

        /** 经由注入的服务 Bean 执行受保护的审批动作。 */
        @PostMapping("/{taskId}/approve")
        public TaskView approve(@PathVariable String taskId) {
            return taskApprovalService.approve(taskId);
        }
    }

    /** 暴露管理员角色才可读取的审计入口。 */
    @RestController
    @RequestMapping("/api/admin")
    static class AdminController {

        /** 返回最小审计读模型。 */
        @GetMapping("/audit")
        public Map<String, String> audit() {
            Map<String, String> response = new LinkedHashMap<>();
            response.put("status", "audit-visible");
            return response;
        }
    }

    /** 保存示例任务状态。 */
    @Component
    static class TaskStore {

        private final Map<String, TaskView> tasks = new ConcurrentHashMap<String, TaskView>();

        /** 创建一条初始为待审批状态的示例任务。 */
        TaskStore() {
            tasks.put("T-100", new TaskView("T-100", "发布审批说明", "PENDING"));
        }

        /** 读取任务，不存在时返回 404。 */
        public TaskView read(String taskId) {
            TaskView task = tasks.get(taskId);
            if (task == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "task not found");
            }
            return task;
        }

        /** 将任务状态更新为已审批。 */
        public TaskView approve(String taskId) {
            TaskView task = read(taskId);
            TaskView approved = new TaskView(task.getId(), task.getTitle(), "APPROVED");
            tasks.put(taskId, approved);
            return approved;
        }
    }

    /** 将审批动作放在可被 AOP 代理拦截的独立服务 Bean 中。 */
    @Service
    static class TaskApprovalService {

        private final TaskStore taskStore;

        /** 注入唯一负责更新任务状态的存储。 */
        TaskApprovalService(TaskStore taskStore) {
            this.taskStore = taskStore;
        }

        /** 只有 task:approve authority 才能批准任务。 */
        @PreAuthorize("hasAuthority('task:approve')")
        public TaskView approve(String taskId) {
            return taskStore.approve(taskId);
        }
    }

    /** Java 8 兼容线使用普通不可变类表达任务视图。 */
    static class TaskView {

        private final String id;
        private final String title;
        private final String status;

        /** 创建不可变任务视图。 */
        TaskView(String id, String title, String status) {
            this.id = id;
            this.title = title;
            this.status = status;
        }

        /** 返回任务标识。 */
        public String getId() {
            return id;
        }

        /** 返回任务标题。 */
        public String getTitle() {
            return title;
        }

        /** 返回当前任务状态。 */
        public String getStatus() {
            return status;
        }
    }
}
```

以 Java 8 启动 `mvn spring-boot:run` 后，运行同一组 curl 命令。除 JSON 字段来自普通 Java 类而非 record 外，
预期状态码和最终 `APPROVED` 结果完全相同。这证明兼容修改仅替换了配置入口，没有改变授权合同。

### 3. 运行结果与自检

完成练习后，先以 `alice` 执行失败审批，再读取任务：

```bash
curl -sS -u alice:alice-pass -X POST -o /dev/null -w '%{http_code}\n' \
  http://127.0.0.1:8080/api/tasks/T-100/approve
curl -sS -u alice:alice-pass http://127.0.0.1:8080/api/tasks/T-100
```

输出应为：

```text
403
{"id":"T-100","title":"发布审批说明","status":"PENDING"}
```

再由 `marco` 审批，同一资源才会返回 `APPROVED`。若 `alice` 也返回 200，先检查方法安全是否已启用、
Controller 是否调用了 Spring 管理的 `TaskApprovalService`，以及是否误把宽泛 `permitAll` 规则放在审批路径前。

## 十、本课小结

授权不是在请求里寻找一个“管理员”字符串，而是让认证系统建立 `Authentication`，再由请求规则与服务方法从
`GrantedAuthority` 集合作出可复现的决定。角色通过 `hasRole('ADMIN')` 匹配 `ROLE_ADMIN`，动作权限通过
`hasAuthority('task:approve')` 精确匹配；二者需要由服务端策略明确授予。请求规则按首个 matcher 生效，
默认拒绝帮助发现遗漏入口；`@EnableMethodSecurity` 与独立服务 Bean 则把真正改变状态的动作留在受保护边界内。

Java 8 与现代线的核心授权合同相同，差异只在 Spring Security 的配置入口。JWT 环境中，roles 与 permissions
claim 也必须显式映射为同一组 authority，不能让客户端提交的字段成为授权事实。后续课程将从运行日志、
健康检查和交付流程继续验证这些安全边界在生产环境中的可观察性。
