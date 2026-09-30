package dev.teamflow.persistence;

/** MyBatis 查询映射使用的不可变数据库行。 */
public final class TeamFlowRows {
  private TeamFlowRows() {}

  /** 项目行。 */
  public static final class ProjectRow {
    public final String id;
    public final String teamId;
    public final String name;

    public ProjectRow(String id, String teamId, String name) {
      this.id = id;
      this.teamId = teamId;
      this.name = name;
    }
  }

  /** 任务行。 */
  public static final class TaskRow {
    public final String id;
    public final String projectId;
    public final String title;
    public final String dueAt;
    public final String assignee;
    public final String status;
    public final long version;

    public TaskRow(
        String id,
        String projectId,
        String title,
        String dueAt,
        String assignee,
        String status,
        long version) {
      this.id = id;
      this.projectId = projectId;
      this.title = title;
      this.dueAt = dueAt;
      this.assignee = assignee;
      this.status = status;
      this.version = version;
    }
  }

  /** 交付行。 */
  public static final class DeliveryRow {
    public final String eventId;
    public final String status;
    public final int attempts;
    public final int notificationCount;

    public DeliveryRow(String eventId, String status, int attempts, int notificationCount) {
      this.eventId = eventId;
      this.status = status;
      this.attempts = attempts;
      this.notificationCount = notificationCount;
    }
  }

  /** 用户行。 */
  public static final class UserRow {
    public final String id;
    public final String displayName;
    public final String email;

    public UserRow(String id, String displayName, String email) {
      this.id = id;
      this.displayName = displayName;
      this.email = email;
    }
  }

  /** 团队行。 */
  public static final class TeamRow {
    public final String id;
    public final String name;

    public TeamRow(String id, String name) {
      this.id = id;
      this.name = name;
    }
  }

  /** 成员行。 */
  public static final class MemberRow {
    public final String id;
    public final String userId;
    public final String displayName;
    public final String role;

    public MemberRow(String id, String userId, String displayName, String role) {
      this.id = id;
      this.userId = userId;
      this.displayName = displayName;
      this.role = role;
    }
  }

  /** 待发布 outbox 行。 */
  public static final class OutboxRow {
    public final String eventId;
    public final String taskId;

    public OutboxRow(String eventId, String taskId) {
      this.eventId = eventId;
      this.taskId = taskId;
    }
  }
}
