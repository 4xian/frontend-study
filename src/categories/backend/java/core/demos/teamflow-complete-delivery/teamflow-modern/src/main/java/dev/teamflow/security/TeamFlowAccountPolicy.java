package dev.teamflow.security;

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
    return switch (username) {
      case "demo" ->
          new Account(
              "USR-1",
              List.of("USER"),
              List.of("project:read", "task:read", "task:write"));
      case "outsider" ->
          new Account(
              "USR-2",
              List.of("USER"),
              List.of("project:read", "task:read", "task:write"));
      case "admin" ->
          new Account(
              "USR-2",
              List.of("USER", "ADMIN"),
              List.of("project:read", "task:read", "task:write"));
      default -> throw new IllegalArgumentException("Unknown TeamFlow account: " + username);
    };
  }

  /** 服务端账号声明。 */
  public record Account(String userId, List<String> roles, List<String> permissions) {
    /** 复制角色与权限，避免签发后被调用方修改。 */
    public Account {
      roles = List.copyOf(roles);
      permissions = List.copyOf(permissions);
    }
  }
}
