package dev.teamflow.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

/** 表示归属于项目并维护自身状态迁移的任务。 */
public final class Task {
  private final String id;
  private final String projectId;
  private final String assigneeUserId;
  private String title;
  private TaskPriority priority;
  private TaskStatus status;
  private long version;
  private final LocalDate dueDate;
  private final BigDecimal plannedHours;
  private final BigDecimal completedHours;
  private final Money cost;

  /**
   * 创建处于待开始状态的任务。
   *
   * @param id 任务 ID
   * @param projectId 项目 ID
   * @param title 任务标题
   * @param priority 任务优先级
   * @param assigneeUserId 负责人用户 ID
   */
  public Task(
      String id,
      String projectId,
      String title,
      TaskPriority priority,
      String assigneeUserId) {
    this(
        id,
        projectId,
        title,
        priority,
        assigneeUserId,
        LocalDate.MAX,
        BigDecimal.ZERO,
        BigDecimal.ZERO,
        new Money("CNY", BigDecimal.ZERO));
  }

  /**
   * 创建包含日期、工时和金额信息的任务。
   *
   * @param id 任务 ID
   * @param projectId 项目 ID
   * @param title 任务标题
   * @param priority 任务优先级
   * @param assigneeUserId 负责人用户 ID
   * @param dueDate 截止日期
   * @param plannedHours 计划工时
   * @param completedHours 已完成工时
   * @param cost 任务成本
   */
  public Task(
      String id,
      String projectId,
      String title,
      TaskPriority priority,
      String assigneeUserId,
      LocalDate dueDate,
      BigDecimal plannedHours,
      BigDecimal completedHours,
      Money cost) {
    this.id = DomainValues.identifier(id, "task id");
    this.projectId = DomainValues.identifier(projectId, "project id");
    this.title = DomainValues.text(title, "task title", 120);
    if (priority == null) {
      throw new IllegalArgumentException("task priority cannot be null");
    }
    this.priority = priority;
    this.assigneeUserId = DomainValues.identifier(assigneeUserId, "assignee user id");
    if (dueDate == null || plannedHours == null || completedHours == null || cost == null) {
      throw new IllegalArgumentException("task schedule, hours and cost cannot be null");
    }
    if (plannedHours.signum() < 0
        || completedHours.signum() < 0
        || completedHours.compareTo(plannedHours) > 0) {
      throw new IllegalArgumentException("completed hours must be between zero and planned hours");
    }
    this.dueDate = dueDate;
    this.plannedHours = plannedHours;
    this.completedHours = completedHours;
    this.cost = cost;
    this.status = TaskStatus.BACKLOG;
    this.version = 0L;
  }

  /**
   * 从版本化交换格式恢复任务状态和领域版本。
   *
   * @param id 任务 ID
   * @param projectId 所属项目 ID
   * @param title 任务标题
   * @param priority 任务优先级
   * @param assigneeUserId 负责人用户 ID
   * @param dueDate 截止日期
   * @param plannedHours 计划工时
   * @param completedHours 已完成工时
   * @param cost 任务成本
   * @param status 当前任务状态
   * @param version 当前领域版本
   * @return 恢复后的任务
   */
  public static Task restore(
      String id,
      String projectId,
      String title,
      TaskPriority priority,
      String assigneeUserId,
      LocalDate dueDate,
      BigDecimal plannedHours,
      BigDecimal completedHours,
      Money cost,
      TaskStatus status,
      long version) {
    if (status == null || version < 0L) {
      throw new IllegalArgumentException("task status and version are invalid");
    }
    Task task =
        new Task(
            id,
            projectId,
            title,
            priority,
            assigneeUserId,
            dueDate,
            plannedHours,
            completedHours,
            cost);
    long minimumVersion =
        status == TaskStatus.BACKLOG ? 0L : status == TaskStatus.IN_PROGRESS ? 1L : 2L;
    if (version < minimumVersion) {
      throw new IllegalArgumentException("task version is behind its status");
    }
    task.status = status;
    task.version = version;
    return task;
  }

  /** @return 任务 ID */
  public String id() {
    return id;
  }

  /** @return 所属项目 ID */
  public String projectId() {
    return projectId;
  }

  /** @return 任务标题 */
  public String title() {
    return title;
  }

  /** @return 任务优先级 */
  public TaskPriority priority() {
    return priority;
  }

  /** @return 当前任务状态 */
  public TaskStatus status() {
    return status;
  }

  /** @return 负责人用户 ID */
  public String assigneeUserId() {
    return assigneeUserId;
  }

  /** @return 当前领域版本 */
  public long version() {
    return version;
  }

  /** @return 截止日期 */
  public LocalDate dueDate() {
    return dueDate;
  }

  /** @return 计划工时 */
  public BigDecimal plannedHours() {
    return plannedHours;
  }

  /** @return 已完成工时 */
  public BigDecimal completedHours() {
    return completedHours;
  }

  /** @return 任务成本 */
  public Money cost() {
    return cost;
  }

  /**
   * 判断任务在指定统计日是否逾期。
   *
   * @param reportDate 统计日期
   * @return 尚未完成且截止日期早于统计日时返回 true
   */
  public boolean isOverdue(LocalDate reportDate) {
    if (reportDate == null) {
      throw new IllegalArgumentException("report date cannot be null");
    }
    return status != TaskStatus.DONE && dueDate.isBefore(reportDate);
  }

  /**
   * 修改任务标题。
   *
   * @param newTitle 新标题
   */
  public void rename(String newTitle) {
    title = DomainValues.text(newTitle, "task title", 120);
    version++;
  }

  /**
   * 修改任务优先级。
   *
   * @param newPriority 新优先级
   */
  public void changePriority(TaskPriority newPriority) {
    if (newPriority == null) {
      throw new IllegalArgumentException("task priority cannot be null");
    }
    if (priority != newPriority) {
      priority = newPriority;
      version++;
    }
  }

  /** @return 从待开始进入进行中时返回 true，否则返回 false */
  public boolean start() {
    if (status != TaskStatus.BACKLOG) {
      return false;
    }
    status = TaskStatus.IN_PROGRESS;
    version++;
    return true;
  }

  /** @return 从进行中进入已完成时返回 true，否则返回 false */
  public boolean complete() {
    if (status != TaskStatus.IN_PROGRESS) {
      return false;
    }
    status = TaskStatus.DONE;
    version++;
    return true;
  }

  /** 按稳定任务 ID 判断身份相等。 */
  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    }
    if (!(other instanceof Task)) {
      return false;
    }
    Task task = (Task) other;
    return id.equals(task.id);
  }

  /** @return 稳定任务 ID 的哈希值 */
  @Override
  public int hashCode() {
    return Objects.hash(id);
  }

  /** @return 适合命令行验收的稳定摘要 */
  @Override
  public String toString() {
    return id
        + "|"
        + projectId
        + "|"
        + title
        + "|"
        + priority
        + "|"
        + status
        + "|"
        + assigneeUserId
        + "|"
        + version;
  }
}
