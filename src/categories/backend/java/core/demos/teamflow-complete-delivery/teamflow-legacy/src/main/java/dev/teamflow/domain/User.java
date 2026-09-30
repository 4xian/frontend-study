package dev.teamflow.domain;

import java.util.Objects;

/** 表示 TeamFlow 中具有稳定身份的用户。 */
public final class User {
  private final String id;
  private final String displayName;
  private final String email;

  /**
   * 创建用户。
   *
   * @param id 用户 ID
   * @param displayName 显示名称
   * @param email 邮箱
   */
  public User(String id, String displayName, String email) {
    this.id = DomainValues.identifier(id, "user id");
    this.displayName = DomainValues.text(displayName, "display name", 40);
    this.email = DomainValues.text(email, "email", 120);
  }

  /** @return 用户 ID */
  public String id() {
    return id;
  }

  /** @return 显示名称 */
  public String displayName() {
    return displayName;
  }

  /** @return 邮箱 */
  public String email() {
    return email;
  }

  /** 按稳定用户 ID 判断身份相等。 */
  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    }
    if (!(other instanceof User)) {
      return false;
    }
    User user = (User) other;
    return id.equals(user.id);
  }

  /** @return 稳定用户 ID 的哈希值 */
  @Override
  public int hashCode() {
    return Objects.hash(id);
  }

  /** @return 适合命令行验收的稳定摘要 */
  @Override
  public String toString() {
    return id + "|" + displayName + "|" + email;
  }
}
