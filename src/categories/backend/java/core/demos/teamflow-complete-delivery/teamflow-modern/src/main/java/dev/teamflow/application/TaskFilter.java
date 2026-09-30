package dev.teamflow.application;

import dev.teamflow.domain.TaskStatus;
import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

/** 表示任务筛选条件的不可变值对象。 */
public final class TaskFilter {
  private final Set<TaskStatus> statuses;
  private final String assigneeUserId;
  private final String titleKeyword;

  /**
   * 创建任务筛选条件。
   *
   * @param statuses 可接受状态，为空表示不限制
   * @param assigneeUserId 负责人用户 ID，为空表示不限制
   * @param titleKeyword 标题关键词，为空表示不限制
   */
  public TaskFilter(Set<TaskStatus> statuses, String assigneeUserId, String titleKeyword) {
    EnumSet<TaskStatus> copied = EnumSet.noneOf(TaskStatus.class);
    if (statuses != null) {
      copied.addAll(statuses);
    }
    this.statuses = Collections.unmodifiableSet(copied);
    this.assigneeUserId = normalizeOptional(assigneeUserId);
    this.titleKeyword = normalizeOptional(titleKeyword);
  }

  /** @return 只读状态条件 */
  public Set<TaskStatus> statuses() {
    return statuses;
  }

  /** @return 负责人条件 */
  public String assigneeUserId() {
    return assigneeUserId;
  }

  /** @return 标题关键词条件 */
  public String titleKeyword() {
    return titleKeyword;
  }

  /** 判断任务是否满足全部筛选条件。 */
  public boolean matches(dev.teamflow.domain.Task task) {
    return (statuses.isEmpty() || statuses.contains(task.status()))
        && (assigneeUserId == null || assigneeUserId.equals(task.assigneeUserId()))
        && (titleKeyword == null || task.title().contains(titleKeyword));
  }

  /** 清理可选文本条件。 */
  private static String normalizeOptional(String value) {
    if (value == null) {
      return null;
    }
    String normalized = value.trim();
    return normalized.isEmpty() ? null : normalized;
  }
}
