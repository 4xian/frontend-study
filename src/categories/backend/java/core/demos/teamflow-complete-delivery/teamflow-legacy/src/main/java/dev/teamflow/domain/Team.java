package dev.teamflow.domain;

import java.util.Objects;

/** 表示独立存在并可承载成员与项目的团队。 */
public final class Team {
  private final String id;
  private final String name;

  /**
   * 创建团队。
   *
   * @param id 团队 ID
   * @param name 团队名称
   */
  public Team(String id, String name) {
    this.id = DomainValues.identifier(id, "team id");
    this.name = DomainValues.text(name, "team name", 60);
  }

  /** @return 团队 ID */
  public String id() {
    return id;
  }

  /** @return 团队名称 */
  public String name() {
    return name;
  }

  /** 按稳定团队 ID 判断身份相等。 */
  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    }
    if (!(other instanceof Team)) {
      return false;
    }
    Team team = (Team) other;
    return id.equals(team.id);
  }

  /** @return 稳定团队 ID 的哈希值 */
  @Override
  public int hashCode() {
    return Objects.hash(id);
  }

  /** @return 适合命令行验收的稳定摘要 */
  @Override
  public String toString() {
    return id + "|" + name;
  }
}
