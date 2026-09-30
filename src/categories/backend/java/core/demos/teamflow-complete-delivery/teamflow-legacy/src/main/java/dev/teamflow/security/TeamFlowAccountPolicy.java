package dev.teamflow.security;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.springframework.stereotype.Service;

/** 把已验证的本地账号映射为服务端控制的 JWT 身份与权限。 */
@Service
public class TeamFlowAccountPolicy {

  /**
   * 返回账号对应的受控声明。
   *
   * @param username 已验证用户名
   * @return 账号声明
   */
  public Account account(String username) {
    if ("demo".equals(username)) {
      return new Account(
          "USR-1",
          Collections.singletonList("USER"),
          Arrays.asList("project:read", "task:read", "task:write"));
    }
    if ("outsider".equals(username)) {
      return new Account(
          "USR-2",
          Collections.singletonList("USER"),
          Arrays.asList("project:read", "task:read", "task:write"));
    }
    if ("admin".equals(username)) {
      return new Account(
          "USR-2",
          Arrays.asList("USER", "ADMIN"),
          Arrays.asList("project:read", "task:read", "task:write"));
    }
    throw new IllegalArgumentException("Unknown TeamFlow account: " + username);
  }

  /** 服务端账号声明。 */
  public static final class Account {
    public final String userId;
    public final List<String> roles;
    public final List<String> permissions;

    /**
     * 保存不可变账号声明。
     *
     * @param userId 关联用户 ID
     * @param roles 角色声明
     * @param permissions 动作权限声明
     */
    public Account(String userId, List<String> roles, List<String> permissions) {
      this.userId = userId;
      this.roles = Collections.unmodifiableList(new ArrayList<String>(roles));
      this.permissions = Collections.unmodifiableList(new ArrayList<String>(permissions));
    }
  }
}
