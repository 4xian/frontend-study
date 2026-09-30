package dev.teamflow.application;

import dev.teamflow.domain.Task;
import dev.teamflow.domain.TaskStatus;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/** 保存一次任务目录统计的不可变结果。 */
public final class TaskStatistics {
  private final int totalCount;
  private final Map<TaskStatus, Integer> statusCounts;
  private final BigDecimal plannedHours;
  private final BigDecimal completedHours;
  private final BigDecimal completionRate;
  private final MoneySummary costSummary;
  private final List<Task> overdueTasks;

  /**
   * 根据固定统计日计算任务统计结果。
   *
   * @param tasks 待统计任务
   * @param reportDate 统计日期
   */
  public TaskStatistics(List<Task> tasks, LocalDate reportDate) {
    if (tasks == null || reportDate == null) {
      throw new IllegalArgumentException("tasks and report date cannot be null");
    }
    EnumMap<TaskStatus, Integer> counts = new EnumMap<>(TaskStatus.class);
    for (TaskStatus status : TaskStatus.values()) {
      counts.put(status, 0);
    }
    BigDecimal planned = BigDecimal.ZERO;
    BigDecimal completed = BigDecimal.ZERO;
    MoneySummary costs = null;
    List<Task> overdue = new ArrayList<>();
    for (Task task : tasks) {
      counts.put(task.status(), counts.get(task.status()) + 1);
      planned = planned.add(task.plannedHours());
      completed = completed.add(task.completedHours());
      costs = costs == null ? new MoneySummary(task.cost()) : costs.add(task.cost());
      if (task.isOverdue(reportDate)) {
        overdue.add(task);
      }
    }
    overdue.sort(
        (left, right) -> {
          int byDate = left.dueDate().compareTo(right.dueDate());
          return byDate != 0 ? byDate : left.id().compareTo(right.id());
        });
    this.totalCount = tasks.size();
    this.statusCounts = Collections.unmodifiableMap(counts);
    this.plannedHours = planned;
    this.completedHours = completed;
    this.completionRate = completionRate(completed, planned);
    this.costSummary = costs == null ? new MoneySummary(new dev.teamflow.domain.Money("CNY", BigDecimal.ZERO)) : costs;
    this.overdueTasks = Collections.unmodifiableList(new ArrayList<>(overdue));
  }

  /** @return 任务总数 */
  public int totalCount() {
    return totalCount;
  }

  /** @return 指定状态的任务数 */
  public int count(TaskStatus status) {
    return statusCounts.get(status);
  }

  /** @return 只读状态计数 */
  public Map<TaskStatus, Integer> statusCounts() {
    return statusCounts;
  }

  /** @return 计划工时 */
  public BigDecimal plannedHours() {
    return plannedHours;
  }

  /** @return 已完成工时 */
  public BigDecimal completedHours() {
    return completedHours;
  }

  /** @return 按一位小数 HALF_UP 计算的完成率 */
  public BigDecimal completionRate() {
    return completionRate;
  }

  /** @return 成本合计 */
  public MoneySummary costSummary() {
    return costSummary;
  }

  /** @return 按截止日期和 ID 排序的逾期任务 */
  public List<Task> overdueTasks() {
    return overdueTasks;
  }

  /** 计算精确完成率。 */
  private static BigDecimal completionRate(BigDecimal completed, BigDecimal planned) {
    if (planned.signum() == 0) {
      return new BigDecimal("0.0");
    }
    return completed.multiply(new BigDecimal("100")).divide(planned, 1, RoundingMode.HALF_UP);
  }

  /** 保存同一币种的成本合计。 */
  public static final class MoneySummary {
    private final dev.teamflow.domain.Money total;

    /** 创建成本合计。 */
    private MoneySummary(dev.teamflow.domain.Money initial) {
      this.total = initial;
    }

    /** 累加同币种成本。 */
    private MoneySummary add(dev.teamflow.domain.Money other) {
      return new MoneySummary(total.add(other));
    }

    /** @return 成本总额 */
    public dev.teamflow.domain.Money total() {
      return total;
    }
  }
}
