package dev.teamflow.security;

import dev.teamflow.web.ProblemSupport;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
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
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/** Java 8 线验证 JWT，并按角色和动作权限保护 TeamFlow API。 */
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {
  public static final String ISSUER = "https://api.teamflow.test";
  public static final String AUDIENCE = "teamflow-api";

  private final String jwtSecret;

  /**
   * 接收环境提供的本地演示密钥。
   *
   * @param jwtSecret JWT HMAC 密钥
   */
  public SecurityConfiguration(@Value("${teamflow.jwt-secret}") String jwtSecret) {
    this.jwtSecret = jwtSecret;
  }

  /** @return 固定使用 HMAC SHA-256 的签名密钥 */
  @Bean
  public SecretKey tokenSigningKey() {
    byte[] value = jwtSecret.getBytes(StandardCharsets.UTF_8);
    if (value.length < 32) {
      throw new IllegalArgumentException("teamflow.jwt-secret must contain at least 32 UTF-8 bytes");
    }
    return new SecretKeySpec(value, "HmacSHA256");
  }

  /**
   * 创建同时验证签名、签发者、时间声明和受众的解码器。
   *
   * @param tokenSigningKey JWT 签名密钥
   * @param audienceValidator 受众校验器
   * @param userIdValidator 用户 ID 声明校验器
   * @param authorizationClaimsValidator 授权声明校验器
   * @return JWT 解码器
   */
  @Bean
  public JwtDecoder jwtDecoder(
      SecretKey tokenSigningKey,
      OAuth2TokenValidator<Jwt> audienceValidator,
      OAuth2TokenValidator<Jwt> userIdValidator,
      OAuth2TokenValidator<Jwt> authorizationClaimsValidator) {
    NimbusJwtDecoder decoder =
        NimbusJwtDecoder.withSecretKey(tokenSigningKey).macAlgorithm(MacAlgorithm.HS256).build();
    decoder.setJwtValidator(
        new DelegatingOAuth2TokenValidator<Jwt>(
            JwtValidators.createDefaultWithIssuer(ISSUER),
            audienceValidator,
            userIdValidator,
            authorizationClaimsValidator));
    return decoder;
  }

  /** @return 只接受 TeamFlow API 受众的校验器 */
  @Bean
  public OAuth2TokenValidator<Jwt> audienceValidator() {
    return jwt ->
        jwt.getAudience().contains(AUDIENCE)
            ? OAuth2TokenValidatorResult.success()
            : OAuth2TokenValidatorResult.failure(
                new OAuth2Error("invalid_token", "JWT audience is not teamflow-api", null));
  }

  /** @return 只接受包含非空白 userId 的校验器 */
  @Bean
  public OAuth2TokenValidator<Jwt> userIdValidator() {
    return jwt ->
        TeamFlowActor.hasText(jwt.getClaimAsString("userId"))
            ? OAuth2TokenValidatorResult.success()
            : OAuth2TokenValidatorResult.failure(
                new OAuth2Error("invalid_token", "JWT userId claim is required", null));
  }

  /** @return 只接受同时包含字符串数组 roles 和 permissions 的校验器 */
  @Bean
  public OAuth2TokenValidator<Jwt> authorizationClaimsValidator() {
    return jwt ->
        hasStringListClaim(jwt, "roles") && hasStringListClaim(jwt, "permissions")
            ? OAuth2TokenValidatorResult.success()
            : OAuth2TokenValidatorResult.failure(
                new OAuth2Error(
                    "invalid_token", "JWT roles and permissions claims are required", null));
  }

  /** @return 将 roles 和 permissions claims 转成受控 authority 的转换器 */
  @Bean
  public JwtAuthenticationConverter jwtAuthenticationConverter() {
    JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
    converter.setJwtGrantedAuthoritiesConverter(new RolePermissionConverter());
    return converter;
  }

  /** @return 声明存在且全部元素均为字符串 */
  private boolean hasStringListClaim(Jwt jwt, String claimName) {
    Object claim = jwt.getClaims().get(claimName);
    if (!(claim instanceof Collection<?>)) {
      return false;
    }
    for (Object value : (Collection<?>) claim) {
      if (!(value instanceof String)) {
        return false;
      }
    }
    return true;
  }

  /**
   * 提供只用于本地交付反馈环的登录用户。
   *
   * @param passwordEncoder 密码编码器
   * @return 用户查询服务
   */
  @Bean
  public UserDetailsService users(PasswordEncoder passwordEncoder) {
    return new InMemoryUserDetailsManager(
        User.withUsername("demo")
            .password(passwordEncoder.encode("Passw0rd!Pass"))
            .authorities("TOKEN_ISSUE")
            .build(),
        User.withUsername("outsider")
            .password(passwordEncoder.encode("OutsiderPassw0rd!"))
            .authorities("TOKEN_ISSUE")
            .build(),
        User.withUsername("admin")
            .password(passwordEncoder.encode("AdminPassw0rd!"))
            .authorities("TOKEN_ISSUE")
            .build());
  }

  /** @return 与登录课程一致的委托式密码编码器 */
  @Bean
  public PasswordEncoder passwordEncoder() {
    return PasswordEncoderFactories.createDelegatingPasswordEncoder();
  }

  /**
   * 组装 Java 8 时代的用户名密码认证器。
   *
   * @param auth 认证管理器构建器
   * @throws Exception 用户认证配置失败
   */
  @Override
  protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    auth.userDetailsService(users(passwordEncoder())).passwordEncoder(passwordEncoder());
  }

  /**
   * 暴露认证器给令牌签发端点。
   *
   * @return 用户名密码认证器
   * @throws Exception 无法创建认证器
   */
  @Bean
  @Override
  public AuthenticationManager authenticationManagerBean() throws Exception {
    return super.authenticationManagerBean();
  }

  /**
   * 配置公开端点、JWT 权限矩阵和默认拒绝规则。
   *
   * @param http Spring Security 配置入口
   * @throws Exception 配置失败
   */
  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http.csrf()
        .disable()
        .cors()
        .and()
        .sessionManagement()
        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        .and()
        .authorizeRequests()
        .antMatchers(HttpMethod.POST, "/api/v1/auth/token")
        .permitAll()
        .antMatchers("/actuator/health/**")
        .permitAll()
        .antMatchers("/slow")
        .permitAll()
        .antMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html")
        .permitAll()
        .antMatchers(HttpMethod.GET, "/api/v1/me")
        .hasRole("USER")
        .antMatchers(HttpMethod.GET, "/api/v1/users/**", "/api/v1/teams/**")
        .hasRole("USER")
        .antMatchers(HttpMethod.POST, "/api/v1/users", "/api/v1/teams/**")
        .hasRole("USER")
        .antMatchers(
            HttpMethod.POST,
            "/api/v1/users/*/email-change-verification-code",
            "/api/v1/users/*/email-change-verification-code/verification")
        .hasRole("USER")
        .antMatchers(HttpMethod.DELETE, "/api/v1/teams/**")
        .hasRole("USER")
        .antMatchers(HttpMethod.GET, "/api/v1/projects")
        .hasAuthority("project:read")
        .antMatchers(HttpMethod.GET, "/api/v1/projects/*")
        .hasAuthority("project:read")
        .antMatchers(HttpMethod.POST, "/api/v1/projects")
        .hasAuthority("project:read")
        .antMatchers(HttpMethod.GET, "/api/v1/projects/*/tasks/**")
        .hasAuthority("task:read")
        .antMatchers(HttpMethod.POST, "/api/v1/projects/*/tasks")
        .hasAuthority("task:write")
        .antMatchers(HttpMethod.PUT, "/api/v1/projects/*/tasks/*")
        .hasAuthority("task:write")
        .antMatchers(HttpMethod.DELETE, "/api/v1/projects/*/tasks/*")
        .hasAuthority("task:write")
        .antMatchers(HttpMethod.POST, "/api/v1/projects/*/tasks/*/attachments")
        .hasAuthority("task:write")
        .antMatchers(HttpMethod.GET, "/api/v1/projects/*/tasks/*/attachments/*")
        .hasAuthority("task:read")
        .antMatchers(HttpMethod.GET, "/api/v1/partner/projects/**")
        .hasAuthority("project:read")
        .antMatchers(HttpMethod.POST, "/api/v1/partner/projects")
        .hasAuthority("project:read")
        .anyRequest()
        .denyAll()
        .and()
        .exceptionHandling()
        .authenticationEntryPoint(
            (request, response, exception) ->
                ProblemSupport.write(
                    response,
                    401,
                    "Unauthorized",
                    "AUTH_REQUIRED",
                    request.getRequestURI()))
        .accessDeniedHandler(
            (request, response, exception) ->
                ProblemSupport.write(
                    response, 403, "Forbidden", "ACCESS_DENIED", request.getRequestURI()))
        .and()
        .oauth2ResourceServer()
        .authenticationEntryPoint(
            (request, response, exception) ->
                ProblemSupport.write(
                    response,
                    401,
                    "Unauthorized",
                    "AUTH_REQUIRED",
                    request.getRequestURI()))
        .jwt()
        .jwtAuthenticationConverter(jwtAuthenticationConverter());
  }

  /** @return 允许本地 Vite 联调项目调用 API 的 CORS 配置 */
  @Bean
  public CorsConfigurationSource corsConfigurationSource(
      @Value("${TEAMFLOW_CORS_ALLOWED_ORIGINS:http://localhost:5173,http://127.0.0.1:5173}")
          String allowedOrigins) {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(
        Arrays.asList("Authorization", "Content-Type", "Idempotency-Key"));
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", configuration);
    return source;
  }
}

/** 把受信任 JWT 的角色和动作权限转换为项目 authority。 */
final class RolePermissionConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

  /**
   * 转换已完成验证的 JWT，不从请求参数读取权限。
   *
   * @param jwt 已验证 JWT
   * @return 角色与动作权限
   */
  @Override
  public Collection<GrantedAuthority> convert(Jwt jwt) {
    Collection<GrantedAuthority> authorities = new ArrayList<GrantedAuthority>();
    for (String role : claimValues(jwt, "roles")) {
      authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
    }
    for (String permission : claimValues(jwt, "permissions")) {
      authorities.add(new SimpleGrantedAuthority(permission));
    }
    return authorities;
  }

  /** @return claim 缺失时为空的字符串列表 */
  private List<String> claimValues(Jwt jwt, String claimName) {
    List<String> values = jwt.getClaimAsStringList(claimName);
    return values == null ? Collections.<String>emptyList() : values;
  }
}
