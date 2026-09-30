package dev.teamflow.application;

import dev.teamflow.domain.Task;
import dev.teamflow.domain.TaskPriority;
import java.io.IOException;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** 在内存中同时维护任务展示顺序和稳定 ID 索引。 */
public final class TaskBoard {
  private final List<Task> tasks = new ArrayList<Task>();
  private final Map<String, Task> tasksById = new LinkedHashMap<String, Task>();

  /**
   * 登记一项编号尚未出现的任务。
   *
   * @param task 待登记任务
   * @return 登记成功返回 true，编号重复返回 false
   */
  public boolean add(Task task) {
    if (task == null || tasksById.containsKey(task.id())) {
      return false;
    }
    tasks.add(task);
    tasksById.put(task.id(), task);
    return true;
  }

  /**
   * 按稳定 ID 查询任务。
   *
   * @param taskId 任务 ID
   * @return 命中的任务，不存在时返回 null
   */
  public Task findById(String taskId) {
    return tasksById.get(taskId);
  }

  /**
   * 按筛选条件查询，并按优先级、截止日期和 ID 建立确定性顺序。
   *
   * @param filter 筛选条件
   * @return 不暴露内部结构的查询结果
   */
  public List<Task> query(TaskFilter filter) {
    if (filter == null) {
      throw new IllegalArgumentException("task filter cannot be null");
    }
    List<Task> matches = new ArrayList<Task>();
    for (Task task : tasks) {
      if (filter.matches(task)) {
        matches.add(task);
      }
    }
    Collections.sort(
        matches,
        Comparator.comparingInt((Task task) -> priorityRank(task.priority()))
            .reversed()
            .thenComparing(Task::dueDate)
            .thenComparing(Task::id));
    return Collections.unmodifiableList(new ArrayList<Task>(matches));
  }

  /**
   * 计算固定日期下的任务统计。
   *
   * @param reportDate 统计日期
   * @return 统计快照
   */
  public TaskStatistics statistics(LocalDate reportDate) {
    return new TaskStatistics(new ArrayList<Task>(tasks), reportDate);
  }

  /**
   * 导出当前目录，并在业务校验完成后才写入文件。
   *
   * @param path 导出文件路径
   * @throws IOException 文件写入失败
   */
  public void exportTo(Path path) throws IOException {
    TaskExchange.write(path, tasks);
  }

  /**
   * 从文件整批替换任务目录；解析失败时保留原目录。
   *
   * @param path 导入文件路径
   * @throws IOException 文件读取失败
   */
  public void importFrom(Path path) throws IOException {
    List<Task> imported = TaskExchange.read(path);
    Map<String, Task> importedById = new LinkedHashMap<String, Task>();
    for (Task task : imported) {
      if (importedById.put(task.id(), task) != null) {
        throw new IllegalArgumentException("duplicate task id: " + task.id());
      }
    }
    tasks.clear();
    tasks.addAll(imported);
    tasksById.clear();
    tasksById.putAll(importedById);
  }

  /** @return 当前任务数量 */
  public int size() {
    return tasks.size();
  }

  /** @return 查询目录的内部索引与顺序是否一致 */
  public boolean isIndexConsistent() {
    if (tasks.size() != tasksById.size()) {
      return false;
    }
    for (Task task : tasks) {
      if (tasksById.get(task.id()) != task) {
        return false;
      }
    }
    return true;
  }

  /** 将高优先级排在前面。 */
  private static int priorityRank(TaskPriority priority) {
    return priority.ordinal();
  }
}
