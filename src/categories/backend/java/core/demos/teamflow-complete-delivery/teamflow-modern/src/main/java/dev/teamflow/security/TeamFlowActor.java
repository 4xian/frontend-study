package dev.teamflow.security;

import dev.teamflow.application.TeamFlowAccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;

/** 从已验证 JWT 读取 TeamFlow 资源授权所需的最小主体。 */
public final class TeamFlowActor {
  private final String userId;
  private final boolean administrator;

  /** 保存已验证的用户 ID 和管理员标记。 */
  private TeamFlowActor(String userId, boolean administrator) {
    this.userId = userId;
    this.administrator = administrator;
  }

  /**
   * 从 Spring Security 建立的认证结果读取主体。
   *
   * @param authentication 当前认证结果
   * @return TeamFlow 主体
   */
  public static TeamFlowActor from(Authentication authentication) {
    if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
      throw new TeamFlowAccessDeniedException("Authenticated JWT principal is required");
    }
    String userId = jwt.getClaimAsString("userId");
    if (!hasText(userId)) {
      throw new TeamFlowAccessDeniedException("JWT userId claim is required");
    }
    boolean administrator =
        authentication.getAuthorities().stream()
            .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    return new TeamFlowActor(userId, administrator);
  }

  /** @return 字符串是否包含至少一个非 Unicode 空白字符 */
  static boolean hasText(String value) {
    if (value == null) {
      return false;
    }
    for (int offset = 0; offset < value.length(); ) {
      int codePoint = value.codePointAt(offset);
      if (!Character.isWhitespace(codePoint)) {
        return true;
      }
      offset += Character.charCount(codePoint);
    }
    return false;
  }

  /** @return 数据库用户 ID */
  public String userId() {
    return userId;
  }

  /** @return 是否具备管理员角色 */
  public boolean administrator() {
    return administrator;
  }

  /** @return 隔离项目列表缓存的主体作用域 */
  public String cacheScope() {
    return (administrator ? "admin:" : "member:") + userId;
  }
}
