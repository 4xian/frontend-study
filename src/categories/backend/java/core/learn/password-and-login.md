---
id: backend.java.learn.intermediate.password-and-login
type: lesson
title: 密码与登录
summary: 用自适应密码编码器保存凭据，并让 Spring Security 通过 Session 建立可验证的登录状态
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 150
prerequisites:
  - backend.java.learn.intermediate.integration-testing-with-spring-boot
objectives:
  - 能解释密码哈希、盐值、编码器和加密之间的区别，并拒绝保存明文密码。
  - 能使用 DelegatingPasswordEncoder 编码和匹配密码，读懂 `{id}` 前缀及升级策略。
  - 能说明 UserDetailsService、DaoAuthenticationProvider、AuthenticationManager 与 SecurityContext 的登录链路。
  - 能配置基于 Session 的表单登录、退出登录和会话固定攻击防护。
  - 能根据 CSRF 的凭据传输方式判断登录与退出请求的保护边界。
  - 能在 Spring Boot 4.1/Java 25 与 Spring Boot 2.3.12/Java 8 中分别运行同一登录反馈环。
recap:
  - 密码只保存自适应单向验证值；盐值、算法参数和编码器 id 都属于验证合同。
  - PasswordEncoder.encode 每次产生不同编码值，matches 才是验证明文的正确入口，不能直接比较字符串。
  - DelegatingPasswordEncoder 使用 `{id}encodedPassword` 选择算法，可在成功登录时安排旧格式升级。
  - DaoAuthenticationProvider 依次读取 UserDetails、调用 PasswordEncoder，再把成功认证放入 SecurityContext。
  - Session 登录必须保留 CSRF；默认退出是带 CSRF 的 POST，登录后要更换 Session ID。
  - Boot 4 使用 jakarta 包和 Security 7 的 lambda 配置，Boot 2.3 使用 javax 包和 WebSecurityConfigurerAdapter。
  - 本课只建立 Session 登录，不实现 JWT、角色矩阵或逐资源授权。
related:
  - backend.java.learn.intermediate.integration-testing-with-spring-boot
tags:
  - Java
  - Spring Boot
  - Spring Security
  - PasswordEncoder
  - DelegatingPasswordEncoder
  - UserDetailsService
  - Session 登录
  - CSRF
appliesTo: JDK 25 / Spring Boot 4.1.1 / Spring Security 7.1.x 主线；Java 8 / Spring Boot 2.3.12.RELEASE / Spring Security 5.3.9.RELEASE 兼容线
verifiedAt: 2026-08-27
sources:
  - id: spring-security-password-storage-71
    title: Password Storage
    url: https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Security 7.1.x
    claims:
      - PasswordEncoder 对密码执行单向转换，DelegatingPasswordEncoder 使用 `{id}encodedPassword` 格式并支持未来升级。
      - User.withDefaultPasswordEncoder 只适合示例，不应作为生产密码存储方案。
  - id: spring-security-username-password-71
    title: Username/Password Authentication
    url: https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/index.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Security 7.1.x
    claims:
      - DaoAuthenticationProvider 使用 UserDetailsService 和 PasswordEncoder 处理用户名密码认证。
      - SecurityFilterChain 可以显式启用 formLogin 并要求未知请求认证。
  - id: spring-security-dao-provider-71
    title: DaoAuthenticationProvider
    url: https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/dao-authentication-provider.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Security 7.1.x
    claims:
      - 认证过滤器把 UsernamePasswordAuthenticationToken 交给 AuthenticationManager，DaoAuthenticationProvider 读取用户并匹配密码。
      - 成功认证的 Authentication 最终进入 SecurityContextHolder。
  - id: spring-security-session-management-71
    title: Authentication Persistence and Session Management
    url: https://docs.spring.io/spring-security/reference/servlet/authentication/session-management.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Security 7.1.x
    claims:
      - 默认 Session fixation 保护使用 changeSessionId，登录成功后应更换会话标识。
      - HttpSessionSecurityContextRepository 负责在请求之间保存非匿名 SecurityContext。
  - id: spring-security-form-login-71
    title: Form Login
    url: https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/form.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Security 7.1.x
    claims:
      - 表单默认提交到 `/login`，字段名为 `username` 和 `password`，并需要 CSRF token。
      - Spring Security 可以生成默认登录页面，但生产应用通常提供自己的页面。
  - id: spring-security-logout-api-71
    title: LogoutConfigurer API
    url: https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/config/annotation/web/configurers/LogoutConfigurer.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Security 7.1.x
    claims:
      - CSRF 开启时默认退出请求必须使用 POST。
  - id: spring-security-legacy-539
    title: Spring Security 5.3.9 Reference
    url: https://docs.spring.io/spring-security/site/docs/5.3.9.RELEASE/reference/html5/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Security 5.3.9.RELEASE
    claims:
      - Java 8 兼容线使用 WebSecurityConfigurerAdapter、authorizeRequests、antMatchers 和旧包路径。
      - 旧线默认启用 CSRF，并支持 DaoAuthenticationProvider 与 formLogin。
  - id: owasp-password-storage
    title: Password Storage Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
    sourceOrigin: official
    sourceType: security-standard
    appliesTo: OWASP Password Storage Cheat Sheet
    claims:
      - 密码应使用带盐的自适应哈希；Argon2id 是首选，bcrypt 仅作为遗留兼容方案并受 72 字节输入限制。
      - 工作因子应依据服务器性能调高，不能把快速哈希或可逆加密当作密码存储。
---

# 密码与登录

登录不是把一张“已登录”标签贴到请求上，而是让凭据经过可解释的验证链，最后在明确的生命周期内保存认证结果。
密码存储解决的是数据库泄露后的离线猜测风险；登录流程解决的是一次请求怎样从用户名和密码得到可信主体。两者
相互配合，但不能互相替代。

本课选择 Spring Security 的 Session 表单登录作为基础实现。你会先把密码变成不可逆的验证值，再观察
`UserDetailsService -> DaoAuthenticationProvider -> AuthenticationManager -> SecurityContext` 这条链，最后用
浏览器验证登录、访问受保护资源和退出。JWT、角色权限与对象所有权属于后续能力。

在 TeamFlow 中，本课不改动已有用户、团队、项目和任务接口合同，只增加一条认证边界：用户记录保存密码验证值，
登录成功后由 Session 关联当前主体，未登录请求不能进入受保护的业务接口。JWT 和角色判断将在后续课程替换或扩展
这条边界。

## 一、先把密码和登录分开

### 1. 数据库里保存的是验证值

明文密码可以直接被攻击者使用；可逆加密只需要拿到密钥就能还原；快速哈希又便于攻击者用大量硬件离线猜测。密码
存储需要的是带随机盐的自适应单向函数：同一个密码的两次编码通常不同，验证时由编码值中的参数重现计算过程。

`PasswordEncoder` 的 `encode` 和 `matches` 正好对应这两个动作。应用不需要、也不应该从编码值“解密”回明文。
生产参数应依据真实硬件调优，OWASP 当前建议优先使用 Argon2id；本课使用 Spring Security 默认的委托编码器，
因为它能把算法标识和参数一起保存在验证值中，并提供迁移旧格式的入口。

### 2. 一次登录只产生一个认证结果

登录链可以画成四个责任点：

```text
POST /login
    |
    v
UsernamePasswordAuthenticationFilter
    |
    v
AuthenticationManager -> DaoAuthenticationProvider
                          |              |
                          v              v
                  UserDetailsService  PasswordEncoder.matches
                          |
                          v
                 SecurityContext + Session
```

过滤器读取表单字段并创建未认证的 `UsernamePasswordAuthenticationToken`。`AuthenticationManager` 选择合适的
Provider；`DaoAuthenticationProvider` 读取用户，再让 `PasswordEncoder` 比较提交的明文和已存验证值。只有整条链
成功，过滤器才把已认证的 `Authentication` 放入 `SecurityContext` 并交给 Session 持久化。

### 3. Session 是凭据载体，CSRF 是另一条边界

浏览器会自动携带 Session Cookie，所以登录后的写操作不能因为“应用是 REST”就全局关闭 CSRF。默认登录表单带有
CSRF token，默认退出也要求带 token 的 POST。对只在 `Authorization` header 中手动携带 Bearer 的无状态 API，
CSRF 判断可以不同，但那是 JWT 课程的边界。

登录成功时更换 Session ID 可以防止攻击者预先固定一个会话标识。它不会删除用户的业务数据，也不等于每次请求都
重新登录；它只改变会话标识并继续保存已认证上下文。

## 二、编码器的实际合同

### 1. `DelegatingPasswordEncoder` 的前缀

```java
PasswordEncoder encoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();
String encoded = encoder.encode("correct horse battery staple");
System.out.println(encoded);
System.out.println(encoded.startsWith("{"));
System.out.println(encoder.matches("correct horse battery staple", encoded));
```

一次可能的输出如下，具体随机盐每次都会不同：

```text
{bcrypt}$2a$10$...
true
true
```

`{bcrypt}` 是委托选择器，不是密码的一部分。把它删掉、把编码值截断或把原始密码拿来直接比较，都会破坏匹配合同。
`matches` 的第一个参数是用户这次提交的明文，第二个参数是完整存储值，顺序不能交换。

### 2. 新用户和改密流程只编码一次

```java
/** 在保存用户前把一次性明文转换成验证值。 */
public UserRecord register(String username, String rawPassword, PasswordEncoder encoder) {
    if (rawPassword == null || rawPassword.length() < 12) {
        throw new IllegalArgumentException("密码至少需要 12 个字符");
    }
    return new UserRecord(username, encoder.encode(rawPassword));
}

record UserRecord(String username, String passwordHash) {}
```

`encode` 的结果只能写入密码字段，不能写入日志、响应或异常消息。改密时必须先验证当前密码，再对新密码重新
调用 `encode`；不能把新明文和旧验证值放在同一条记录里，也不能复用旧盐值来手工拼接字符串。

### 3. 旧算法的升级是登录后的写操作

委托编码器可以识别多个 `{id}`。当 `upgradeEncoding(encoded)` 返回 `true` 时，应用可以在一次成功登录后用当前编码器
重新编码并更新记录：

```java
/** 登录成功后按当前策略升级旧密码验证值。 */
public String maybeUpgrade(String rawPassword, String storedHash, PasswordEncoder encoder) {
    if (!encoder.matches(rawPassword, storedHash)) {
        throw new IllegalArgumentException("密码不匹配");
    }
    return encoder.upgradeEncoding(storedHash) ? encoder.encode(rawPassword) : storedHash;
}
```

升级写入必须在认证成功之后进行，并且要处理并发改密：更新时使用用户版本号或等价条件，不能让旧登录请求覆盖
刚刚设置的新密码。这个课程只展示编码边界，不把并发更新策略扩展成数据库事务课的内容。

## 三、Spring Security 怎样建立登录状态

### 1. `UserDetailsService` 只负责查找

`UserDetailsService` 是用户 DAO 策略，不负责解析 HTTP 表单，也不负责决定某个 URL 是否允许访问。它只需要根据
用户名返回 `UserDetails`；找不到用户时抛出 `UsernameNotFoundException`。在生产中实现可以查询 MySQL，本课完整工程
用 `InMemoryUserDetailsManager` 保持反馈环最小。

### 2. `DaoAuthenticationProvider` 负责核对

Provider 从 `UserDetails` 取得验证值和账户状态，再调用 `PasswordEncoder.matches`。成功结果包含主体和权限，失败
只应返回稳定的认证失败，不把“用户不存在”还是“密码错误”暴露给登录页面。控制器不应自己查询用户后比较字符串，
否则会绕过 Provider 的账户锁定、凭据擦除和事件边界。

### 3. `SecurityFilterChain` 负责入口和会话

现代配置使用 Bean 和 lambda：

```java
/** 配置公开入口、表单登录、会话保护和退出。 */
@Bean
SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(authorize -> authorize
            .requestMatchers("/api/v1/public/**", "/login").permitAll()
            .anyRequest().authenticated())
        .formLogin(Customizer.withDefaults())
        .sessionManagement(session -> session
            .sessionFixation(fixation -> fixation.changeSessionId()))
        .logout(logout -> logout
            .logoutUrl("/logout")
            .logoutSuccessUrl("/api/v1/public/logout")
            .permitAll());
    return http.build();
}
```

`permitAll` 只改变授权决策，仍然保留安全过滤器。默认 `/login` 页面由 Spring Security 生成，生产应用可以提供自定义
页面，但表单字段和 CSRF 合同不能随意改变。未知路径由 `authenticated()` 收束，不应留下意外公开入口。

### 4. 成功页面和 API 响应是两个选择

表单登录成功后默认会重定向到原始请求或根路径。完整示例把成功地址设置为 `/api/v1/me`，该接口返回当前主体的最小
JSON；这不是 JWT，也不是把密码放进响应。前端若需要纯 JSON 登录，应显式编写认证过滤器和
`SecurityContextRepository`，并继续处理 CSRF、失败响应与会话保存，不能只在 Controller 里调用 `authenticate` 后
忽略上下文持久化。

## 四、两条版本线的迁移边界

现代线以 JDK 25、Spring Boot 4.1.1 和 Spring Security 7.1 为主。Servlet 包使用 `jakarta.servlet`，校验包使用
`jakarta.validation`，安全配置以 `SecurityFilterChain` Bean 为中心。

兼容线以 Java 8、Spring Boot 2.3.12.RELEASE 和 Spring Security 5.3.9 为目标。Servlet 和校验包仍是 `javax.*`，
安全配置使用当时仍可用的 `WebSecurityConfigurerAdapter`、`authorizeRequests` 与 `antMatchers`。两条线的密码存储
概念和 `/login` 表单合同相同，不能仅把现代 POM 的 `release` 改成 8 就声称兼容。

## 五、完整工程：现代线

下面的工程使用内存用户，方便先观察密码和登录链路；真实项目应把 `UserDetailsService` 换成数据库实现，但仍保留
相同的 `PasswordEncoder` 和 Provider 边界。

### 1. 文件和依赖

```text
password-login-modern/
  pom.xml
  src/main/java/example/login/LoginApplication.java
  src/main/java/example/login/SecurityConfig.java
  src/main/java/example/login/AuthController.java
```

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
  <artifactId>password-login-modern</artifactId>
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

### 2. 启动类和安全配置

```java
package example.login;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** 启动密码与 Session 登录示例。 */
@SpringBootApplication
public class LoginApplication {
    /** 启动 Spring Boot 应用。 */
    public static void main(String[] args) {
        SpringApplication.run(LoginApplication.class, args);
    }
}
```

```java
package example.login;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/** 配置密码编码器、内存用户和 Session 表单登录。 */
@Configuration
public class SecurityConfig {
    /** 创建带算法 id 的委托密码编码器。 */
    @Bean
    PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    /** 创建用于演示的已编码内存用户。 */
    @Bean
    UserDetailsManager userDetailsService(PasswordEncoder passwordEncoder) {
        return new InMemoryUserDetailsManager(User.withUsername("demo")
            .password(passwordEncoder.encode("Passw0rd!Pass"))
            .roles("USER")
            .build());
    }

    /** 配置公开路径、表单登录、Session fixation 防护和退出。 */
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/api/v1/public/**", "/login").permitAll()
                .anyRequest().authenticated())
            .formLogin(Customizer.withDefaults())
            .sessionManagement(session -> session
                .sessionFixation(fixation -> fixation.changeSessionId()))
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/api/v1/public/logout")
                .permitAll());
        return http.build();
    }
}
```

### 3. 公开探针和当前主体接口

```java
package example.login;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 暴露登录前后的最小可观察 API。 */
@RestController
@RequestMapping("/api/v1")
public class AuthController {
    /** 返回无需登录的服务探针。 */
    @GetMapping("/public/ping")
    public Map<String, String> ping() {
        return Map.of("status", "ok");
    }

    /** 返回 Spring Security 已确认的主体名称。 */
    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> me(Authentication authentication) {
        return ResponseEntity.ok(Map.of("username", authentication.getName()));
    }

    /** 返回退出后的公开结果。 */
    @GetMapping("/public/logout")
    public Map<String, String> logoutResult() {
        return Map.of("status", "logged-out");
    }
}
```

### 4. 运行与观察

在 IntelliJ IDEA 中把 Project SDK、模块 SDK 和 Maven Runner JRE 都设为 JDK 25，执行 Maven Reload 后运行：

```bash
cd password-login-modern
mvn spring-boot:run
```

另开终端检查公开入口：

```bash
curl --silent --show-error http://localhost:8080/api/v1/public/ping
curl --silent --show-error --include http://localhost:8080/api/v1/me
```

第一条返回 `{"status":"ok"}`；第二条返回 `302` 并指向 `/login`。再按下面的浏览器反馈环检查登录和退出：

1. 打开 `http://localhost:8080/login`，输入用户名 `demo` 和密码 `Passw0rd!Pass`，登录后访问
   `http://localhost:8080/api/v1/me`，应得到 `{"username":"demo"}`。
2. 打开浏览器开发者工具的 Network 面板，再访问 `http://localhost:8080/logout`。此时显示的是退出确认页，页面表单
   包含新的隐藏字段 `_csrf`，访问这个 GET 页面本身不会退出。
3. 点击 `Log Out`，在 Network 中确认浏览器提交 `POST /logout`，Form Data 中的 `_csrf` 非空，响应重定向到
   `/api/v1/public/logout` 并显示 `{"status":"logged-out"}`。
4. 再访问 `/api/v1/me`，应重新得到指向 `/login` 的 `302`。在 Console 中执行
   `fetch('/logout', { method: 'POST' }).then(response => response.status)` 可验证同源 Cookie 会自动携带，但缺少 token 的
   POST 返回 `403`。

整个过程只观察请求元数据和状态，不在响应、Network 日志或应用日志中记录密码。

## 六、完整工程：Java 8 兼容线

兼容工程与现代工程放在不同目录，避免 IDEA、Maven 和测试运行器混用 JDK。Project SDK、模块 SDK、Maven Runner
JRE 均选择 Java 8，POM 目标也明确为 8；Reload 后再执行命令。

### 1. POM 和文件

```text
password-login-java8/
  pom.xml
  src/main/java/example/login/LoginApplication.java
  src/main/java/example/login/SecurityConfig.java
  src/main/java/example/login/AuthController.java
```

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
  <artifactId>password-login-java8</artifactId>
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

### 2. Java 8 源码

```java
package example.login;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** 启动 Java 8 密码与 Session 登录示例。 */
@SpringBootApplication
public class LoginApplication {
    /** 启动 Spring Boot 应用。 */
    public static void main(String[] args) {
        SpringApplication.run(LoginApplication.class, args);
    }
}
```

```java
package example.login;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.context.annotation.Bean;

/** 使用 Spring Security 5.3 的 Java 8 配置方式。 */
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    /** 创建带算法 id 的委托密码编码器。 */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    /** 注册内存用户并在创建时编码密码。 */
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.inMemoryAuthentication()
            .withUser("demo")
            .password(passwordEncoder().encode("Passw0rd!Pass"))
            .roles("USER");
    }

    /** 配置公开路径、表单登录、Session fixation 防护和退出。 */
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .authorizeRequests()
                .antMatchers("/api/v1/public/**", "/login").permitAll()
                .anyRequest().authenticated()
            .and()
            .formLogin()
            .and()
            .sessionManagement()
                .sessionFixation().changeSessionId()
            .and()
            .logout()
                .logoutUrl("/logout")
                .logoutSuccessUrl("/api/v1/public/logout")
                .permitAll();
    }
}
```

```java
package example.login;

import java.util.Collections;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 暴露 Java 8 兼容线的最小可观察 API。 */
@RestController
@RequestMapping("/api/v1")
public class AuthController {
    /** 返回无需登录的服务探针。 */
    @GetMapping("/public/ping")
    public Map<String, String> ping() {
        return Collections.singletonMap("status", "ok");
    }

    /** 返回 Spring Security 已确认的主体名称。 */
    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> me(Authentication authentication) {
        return ResponseEntity.ok(Collections.singletonMap("username", authentication.getName()));
    }

    /** 返回退出后的公开结果。 */
    @GetMapping("/public/logout")
    public Map<String, String> logoutResult() {
        return Collections.singletonMap("status", "logged-out");
    }
}
```

### 3. Java 8 运行结果

```bash
cd password-login-java8
mvn spring-boot:run
```

用浏览器访问 `/login`，输入相同的 `demo` 和 `Passw0rd!Pass`，登录后的 `/api/v1/me` 输出：

```text
{"username":"demo"}
```

Java 8 线的 `WebSecurityConfigurerAdapter` 和 `authorizeRequests` 已在 Security 5.3.9 中验证；它们不能直接复制到
Security 7.1 工程。密码编码值的 `{id}` 和 Session、CSRF 行为保持一致。

## 七、集中排查常见错误

下面的每项都给出触发条件、机制原因、后果和可重复验证命令。版本差异只在确实影响行为的位置说明。

:::pitfalls
### 明文或快速哈希保存密码

**触发条件：** 把注册请求中的 `password` 原样写入数据库，或使用 MD5、SHA-1 等快速摘要代替自适应密码编码。

**原因：** 明文和可逆加密可以直接恢复凭据；快速摘要降低了攻击者离线尝试的成本，也没有提供每条记录独立的盐值合同。

**后果：** 数据库泄露后可直接登录或高速撞库，且无法通过 `PasswordEncoder.matches` 统一验证。

**错误示例：**

```java
user.setPassword(rawPassword);
user.setPasswordDigest(MessageDigest.getInstance("MD5").digest(rawPassword.getBytes()));
```

**正确写法：**

```java
user.setPasswordHash(passwordEncoder.encode(rawPassword));
```

**验证方式：** Java 25 / Spring Security 7.1 与 Java 8 / Spring Security 5.3.9 分别执行 `encode` 两次，两个结果应不同且
`matches(raw, encoded)` 为 `true`；源码和日志中不得出现原始密码。

### 直接比较两次编码结果

**触发条件：** 登录时执行 `passwordEncoder.encode(input).equals(storedHash)`。

**原因：** 自适应编码器每次使用新盐，正确的合同是从存储值读取盐和参数后由 `matches` 比较，而不是期待编码字符串相同。

**后果：** 即使用户输入正确密码，登录也会稳定失败；开发者可能因此退回明文比较。

**错误示例：**

```java
boolean ok = passwordEncoder.encode(input).equals(user.getPasswordHash());
```

**正确写法：**

```java
boolean ok = passwordEncoder.matches(input, user.getPasswordHash());
```

**验证方式：** 对同一明文调用两次 `encode`，断言结果不相等；再用每个结果调用 `matches`，两次都应为 `true`。

### 用 `withDefaultPasswordEncoder` 初始化生产用户

**触发条件：** 把源码中的 `User.withDefaultPasswordEncoder()` 当成生产用户创建 API，或把生成的密码值提交到仓库。

**原因：** 官方 API 明确把它限定为示例用途，密码仍会暴露在内存和编译产物中；它不能替代注册、改密和秘密配置流程。

**后果：** 凭据进入源码、构建日志或制品，轮换和审计无法独立进行。

**错误示例：**

```java
User.withDefaultPasswordEncoder().username("demo").password("Passw0rd!Pass").roles("USER").build();
```

**正确写法：**

```java
User.withUsername("demo").password(passwordEncoder.encode(rawPassword)).roles("USER").build();
```

**验证方式：** 分别在 Boot 4.1.1 和 2.3.12 工程执行 `mvn dependency:tree` 与源码扫描；生产源码不得出现
`withDefaultPasswordEncoder` 或明文密码常量。

### 登录后没有保存 `SecurityContext`

**触发条件：** 自定义 Controller 调用 `AuthenticationManager.authenticate` 后只返回 200，不设置上下文或保存到
`SecurityContextRepository`。

**原因：** 认证对象只存在于当前调用栈；没有持久化合同，下一次请求不会从 Session 恢复主体。

**后果：** 登录响应看似成功，随后访问受保护资源仍被重定向到登录页。

**错误示例：**

```java
authenticationManager.authenticate(token);
return ResponseEntity.ok().build();
```

**正确写法：**

```java
SecurityContext context = SecurityContextHolder.createEmptyContext();
context.setAuthentication(authentication);
SecurityContextHolder.setContext(context);
securityContextRepository.saveContext(context, request, response);
```

**验证方式：** Spring Security 7.1 使用 `MockMvc` 或浏览器先登录再请求 `/api/v1/me`；第二个请求必须识别同一用户。
Boot 2.3 的内置 formLogin 会自动保存，只有自定义认证入口才需要手工执行这段保存。

### 用 GET 退出或全局关闭 CSRF

**触发条件：** 把退出改成可被图片、链接触发的 GET，或为“方便 curl”在整个应用上调用 `csrf().disable()`。

**原因：** 浏览器会自动携带 Session Cookie；GET 退出或无 CSRF 的写操作可被跨站页面伪造，且关闭范围会影响登录后的业务写入。

**后果：** 用户可能被强制退出，业务状态可能被跨站请求修改；问题通常只在浏览器环境出现。

**错误示例：**

```java
http.csrf().disable();
http.logout().logoutRequestMatcher(new AntPathRequestMatcher("/logout", "GET"));
```

**正确写法：**

```java
http.formLogin().and().logout().logoutUrl("/logout");
// 由表单提交带 CSRF token 的 POST /logout
```

**验证方式：** Boot 4.1.1 与 2.3.12 分别从默认登录页登录；无 token 的 POST `/logout` 应被拒绝，带 token 的 POST
才能清理 Session。不要用关闭 CSRF 后的 200 作为成功证据。
:::

## 八、错误与正确的最小对比

密码编码器的输入和存储值必须保持完整，验证动作必须调用 `matches`：

:::compare{before="错误写法" after="正确写法"}
### 错误写法

```java
boolean authenticated = encoder.encode(input).equals(storedHash);
```

### 正确写法

```java
boolean authenticated = encoder.matches(input, storedHash);
```
:::

## 九、把登录边界接回 TeamFlow

### 1. 本课增加认证状态，不重写资源合同

TeamFlow 的用户记录在本课增加密码验证值，`UserDetailsService` 按用户名读取用户，Spring Security 负责匹配密码并把
成功结果保存到 Session。已有用户、团队、项目和任务 URL、请求字段及响应结构保持不变；变化只发生在入口之前：
公开探针和登录页继续可访问，业务接口在没有认证主体时重定向到 `/login`。

完整工程用内存用户隔离教学重点。接入 TeamFlow 时应把 `InMemoryUserDetailsManager` 替换为读取 C4 持久化用户记录的
实现，并只把 `username`、密码验证值和最小账户状态映射为 `UserDetails`。本课不添加角色矩阵，不根据项目或团队归属
做授权，也不定义新的业务响应格式。

### 2. 上线边界同时约束密码、Cookie 和容量

- 密码输入只在需要的生命周期内存在；不要在 DTO `toString`、异常、访问日志或埋点中输出它。
- 用户名是否区分大小写必须成为明确合同；本课示例使用 Spring Security 默认的字符串匹配，不自行做大小写折叠。
- 登录失败消息保持一致，避免通过“用户不存在”和“密码错误”的差异枚举账户；速率限制和锁定属于后续安全课程。
- Session Cookie 应在部署层设置 `Secure`、`HttpOnly` 和合适的 `SameSite`；本地 HTTP 示例不代表生产 TLS 配置。
- `PasswordEncoder` 参数升级需要可观测但不记录密码，数据库更新需要和改密并发策略一起设计。

自适应哈希故意消耗 CPU 或内存，不能用一次本机请求的耗时推断生产容量。应在目标硬件上测量登录峰值、线程池、
超时和失败重试；优先限制暴力尝试，而不是把工作因子调到无法服务正常用户。Session 查询通常比重新计算密码便宜，
但 Session 存储和失效策略会影响多实例部署。

### 3. 用同一条请求反馈环验收两条版本线

1. 分别用 JDK 25 / Boot 4.1.1 和 Java 8 / Boot 2.3.12 执行 `mvn spring-boot:run`，确认 `/api/v1/public/ping` 返回 200。
2. 未登录访问 `/api/v1/me`，确认响应为指向 `/login` 的 302；登录后再次访问必须返回当前用户名。
3. 使用错误密码登录，确认仍停留在失败结果，响应和日志不泄露用户是否存在、密码或编码值。
4. 按现代工程的退出步骤访问 `/logout` 确认页并点击 `Log Out`，在 Network 中确认实际请求是带非空 `_csrf` 的
   `POST /logout`；退出后 `/api/v1/me` 必须重新返回 302，无 token 的同源 POST 必须返回 403。
5. 在临时 Java 程序中对同一明文执行两次 `encode`，验证结果不同但两次 `matches` 都为 `true`；验证未知 `{id}` 会失败。
6. 运行 `mvn -DskipTests package` 检查两条线的 POM 和 JDK 目标，完成后删除临时目录、日志和凭据。

## 十、独立练习

:::exercise
### 为登录增加可验证的密码更换服务

**要求：** 在现代工程中新增 `PasswordChangeService`，接收表示当前用户的 `UserDetails`、旧密码、新密码和保存回调；
只有旧密码匹配且新密码至少 12 个字符时，才用同一个 `PasswordEncoder` 编码新密码，并把用户名和新验证值交给回调。
服务只返回成功标志，不得返回明文或编码值，也不得直接比较两次 `encode` 结果。为成功、旧密码错误、新密码过短各
准备一个最小调用。

**验收：** 连续运行两次 `mvn -DskipTests package` 均成功；运行参考入口得到 `wrongPasswordRejected=true`、
`shortPasswordRejected=true`、`changed=true`、`oldMatches=false` 和 `newMatches=true`，且控制台输出不包含明文密码或
完整编码值。此实现使用的 API 也存在于 Spring Security 5.3，可在 Java 8 工程中保持同一合同。
:::

### 1. 完整参考实现

```java
package example.login;

import java.util.function.BiConsumer;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;

/** 执行一次带旧密码校验的密码更换。 */
public final class PasswordChangeService {
    private final PasswordEncoder passwordEncoder;

    /** 使用既有密码编码器创建服务。 */
    public PasswordChangeService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    /** 校验当前用户和新密码，并在成功时保存新的验证值。 */
    public boolean change(UserDetails currentUser, String oldPassword, String newPassword,
            BiConsumer<String, String> saveHash) {
        if (!passwordEncoder.matches(oldPassword, currentUser.getPassword())
                || newPassword == null || newPassword.length() < 12) {
            return false;
        }
        saveHash.accept(currentUser.getUsername(), passwordEncoder.encode(newPassword));
        return true;
    }

    /** 运行成功、旧密码错误和新密码过短三条反馈路径。 */
    public static void main(String[] args) {
        PasswordEncoder encoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();
        UserDetails currentUser = User.withUsername("demo")
            .password(encoder.encode("Passw0rd!Pass"))
            .roles("USER")
            .build();
        String[] savedHash = {currentUser.getPassword()};
        BiConsumer<String, String> saveHash = (username, hash) -> savedHash[0] = hash;
        PasswordChangeService service = new PasswordChangeService(encoder);

        boolean wrongPasswordAccepted = service.change(
            currentUser, "wrong-password", "NewPassw0rd!2026", saveHash);
        boolean shortPasswordAccepted = service.change(
            currentUser, "Passw0rd!Pass", "short", saveHash);
        boolean changed = service.change(
            currentUser, "Passw0rd!Pass", "NewPassw0rd!2026", saveHash);

        System.out.println("wrongPasswordRejected=" + !wrongPasswordAccepted);
        System.out.println("shortPasswordRejected=" + !shortPasswordAccepted);
        System.out.println("changed=" + changed);
        System.out.println("oldMatches=" + encoder.matches("Passw0rd!Pass", savedHash[0]));
        System.out.println("newMatches=" + encoder.matches("NewPassw0rd!2026", savedHash[0]));
    }
}
```

在 IDEA 中运行 `PasswordChangeService.main`。保存回调只在第三次调用中收到新验证值；真实 TeamFlow 实现应按用户名
更新数据库，并使用版本条件避免并发改密覆盖。当前 `UserDetails` 是改密前加载的快照，后续认证会重新读取存储值。

### 2. 运行结果与自检

预期输出为：

```text
wrongPasswordRejected=true
shortPasswordRejected=true
changed=true
oldMatches=false
newMatches=true
```

三个返回标志证明失败分支没有被当成成功；最后两个匹配结果证明保存回调接到的是新密码验证值，而不是明文。控制台
只输出状态，不输出两个密码或 `savedHash`。

## 十一、本课小结

密码存储只保留带盐、自适应、不可逆的验证值；`PasswordEncoder.matches` 负责验证，`DelegatingPasswordEncoder` 用
`{id}` 选择算法并为迁移留下空间。登录由过滤器创建凭据对象，Provider 读取用户并匹配密码，成功后由
`SecurityContext` 和 Session 保存认证状态。Session Cookie 自动随请求发送，因此登录、退出和业务写操作应继续评估
CSRF；Session fixation 防护则负责更换登录前后的会话标识。现代 Security 7.1 与兼容线 Security 5.3.9 的配置 API
不同，但密码、表单字段和可观察登录合同相同。下一课将把认证结果转换成 JWT，而不是在本课提前扩展 token 验证。

### 课程总结

- 密码只保存自适应单向验证值，注册和改密调用 `encode`，认证调用 `matches`。
- `DelegatingPasswordEncoder` 通过 `{id}` 选择算法，并允许在成功认证后升级旧存储格式。
- `DaoAuthenticationProvider` 组合用户读取和密码验证，认证成功后由 `SecurityContext` 与 Session 保存主体。
- Session Cookie 会被浏览器自动携带，因此登录后的写操作和退出请求必须继续保留 CSRF 防护。
- TeamFlow 在本课只增加登录状态和受保护入口，不改变已有资源合同，也不提前实现 JWT 与角色权限。

### 继续探索

下一课会把用户名密码认证的结果转换为可携带的 JWT，并重新判断无状态请求、token 生命周期和 CSRF 边界；之后再把
角色和资源权限接入 TeamFlow。
