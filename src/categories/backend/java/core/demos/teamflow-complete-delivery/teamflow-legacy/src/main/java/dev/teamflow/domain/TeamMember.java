package dev.teamflow.domain;

import java.util.Objects;

/** 表示用户加入团队后形成的成员关系。 */
public final class TeamMember {
  private final String id;
  private final String teamId;
  private final String userId;
  private final String role;

  /**
   * 创建团队成员关系。
   *
   * @param id 成员关系 ID
   * @param teamId 团队 ID
   * @param userId 用户 ID
   * @param role 团队内角色
   */
  public TeamMember(String id, String teamId, String userId, String role) {
    this.id = DomainValues.identifier(id, "member id");
    this.teamId = DomainValues.identifier(teamId, "team id");
    this.userId = DomainValues.identifier(userId, "user id");
    this.role = DomainValues.text(role, "member role", 30);
  }

  /** @return 成员关系 ID */
  public String id() {
    return id;
  }

  /** @return 团队 ID */
  public String teamId() {
    return teamId;
  }

  /** @return 用户 ID */
  public String userId() {
    return userId;
  }

  /** @return 团队内角色 */
  public String role() {
    return role;
  }

  /** 按稳定成员关系 ID 判断身份相等。 */
  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    }
    if (!(other instanceof TeamMember)) {
      return false;
    }
    TeamMember member = (TeamMember) other;
    return id.equals(member.id);
  }

  /** @return 稳定成员关系 ID 的哈希值 */
  @Override
  public int hashCode() {
    return Objects.hash(id);
  }

  /** @return 适合命令行验收的稳定摘要 */
  @Override
  public String toString() {
    return id + "|" + teamId + "|" + userId + "|" + role;
  }
}
