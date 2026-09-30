package dev.teamflow.domain;

import java.util.Objects;

/** 表示归属于一个团队的 TeamFlow 项目。 */
public final class Project {
  private final String id;
  private final String teamId;
  private final String name;

  /**
   * 创建项目。
   *
   * @param id 项目 ID
   * @param teamId 所属团队 ID
   * @param name 项目名称
   */
  public Project(String id, String teamId, String name) {
    this.id = DomainValues.identifier(id, "project id");
    this.teamId = DomainValues.identifier(teamId, "team id");
    this.name = DomainValues.text(name, "project name", 80);
  }

  /** @return 项目 ID */
  public String id() {
    return id;
  }

  /** @return 所属团队 ID */
  public String teamId() {
    return teamId;
  }

  /** @return 项目名称 */
  public String name() {
    return name;
  }

  /** 按稳定项目 ID 判断身份相等。 */
  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    }
    if (!(other instanceof Project)) {
      return false;
    }
    Project project = (Project) other;
    return id.equals(project.id);
  }

  /** @return 稳定项目 ID 的哈希值 */
  @Override
  public int hashCode() {
    return Objects.hash(id);
  }

  /** @return 适合命令行验收的稳定摘要 */
  @Override
  public String toString() {
    return id + "|" + teamId + "|" + name;
  }
}
