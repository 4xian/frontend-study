package dev.teamflow.application;

import dev.teamflow.domain.Money;
import dev.teamflow.domain.Task;
import dev.teamflow.domain.TaskPriority;
import dev.teamflow.domain.TaskStatus;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/** 负责 TeamFlow 任务的版本化文本导入导出。 */
public final class TaskExchange {
  private static final String VERSION_HEADER = "TEAMFLOW_TASKS_V2";

  private TaskExchange() {}

  /**
   * 把任务列表编码为稳定的 UTF-8 文本合同。
   *
   * @param tasks 待导出任务
   * @return 完整文本
   */
  public static String serialize(List<Task> tasks) {
    if (tasks == null) {
      throw new IllegalArgumentException("tasks cannot be null");
    }
    StringBuilder output = new StringBuilder(VERSION_HEADER).append('\n');
    Set<String> ids = new HashSet<>();
    for (Task task : tasks) {
      validateTask(task, ids);
      output
          .append(task.id())
          .append('|')
          .append(task.projectId())
          .append('|')
          .append(task.title())
          .append('|')
          .append(task.priority())
          .append('|')
          .append(task.status())
          .append('|')
          .append(task.assigneeUserId())
          .append('|')
          .append(task.dueDate())
          .append('|')
          .append(task.plannedHours().toPlainString())
          .append('|')
          .append(task.completedHours().toPlainString())
          .append('|')
          .append(task.cost().currency())
          .append('|')
          .append(task.cost().amount().toPlainString())
          .append('|')
          .append(task.version())
          .append('\n');
    }
    return output.toString();
  }

  /**
   * 先完成完整业务校验，再以 UTF-8 写文件。
   *
   * @param path 输出文件
   * @param tasks 待导出任务
   * @throws IOException 文件写入失败
   */
  public static void write(Path path, List<Task> tasks) throws IOException {
    if (path == null) {
      throw new IllegalArgumentException("export path cannot be null");
    }
    Files.write(path, serialize(tasks).getBytes(StandardCharsets.UTF_8));
  }

  /**
   * 从 UTF-8 文件读取并整批验证任务。
   *
   * @param path 输入文件
   * @return 文件中的任务顺序
   * @throws IOException 文件读取失败
   */
  public static List<Task> read(Path path) throws IOException {
    if (path == null) {
      throw new IllegalArgumentException("import path cannot be null");
    }
    List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);
    if (lines.isEmpty() || !VERSION_HEADER.equals(lines.get(0))) {
      throw new IllegalArgumentException("unsupported task file version");
    }
    List<Task> tasks = new ArrayList<>();
    Set<String> ids = new HashSet<>();
    for (int index = 1; index < lines.size(); index++) {
      Task task = parse(lines.get(index), index + 1);
      if (!ids.add(task.id())) {
        throw new IllegalArgumentException("line " + (index + 1) + ": duplicate task id");
      }
      tasks.add(task);
    }
    return tasks;
  }

  /** 将一行文本解析为任务对象。 */
  private static Task parse(String line, int lineNumber) {
    String[] fields = line.split("\\|", -1);
    if (fields.length != 12) {
      throw new IllegalArgumentException("line " + lineNumber + ": expected 12 fields");
    }
    try {
      TaskStatus status = TaskStatus.valueOf(fields[4]);
      return Task.restore(
              fields[0],
              fields[1],
              fields[2],
              TaskPriority.valueOf(fields[3]),
              fields[5],
              LocalDate.parse(fields[6]),
              new BigDecimal(fields[7]),
              new BigDecimal(fields[8]),
              new Money(fields[9], new BigDecimal(fields[10])),
              status,
              Long.parseLong(fields[11]));
    } catch (RuntimeException exception) {
      throw new IllegalArgumentException("line " + lineNumber + ": invalid task", exception);
    }
  }

  /** 校验导出任务和文本保留字符。 */
  private static void validateTask(Task task, Set<String> ids) {
    if (task == null || !ids.add(task.id())) {
      throw new IllegalArgumentException("task is null or duplicate");
    }
    validateField(task.id(), "task id");
    validateField(task.projectId(), "project id");
    validateField(task.title(), "task title");
    validateField(task.assigneeUserId(), "assignee user id");
  }

  /** 拒绝空值和会破坏单行合同的字符。 */
  private static void validateField(String value, String name) {
    if (value == null || value.isEmpty() || value.indexOf('|') >= 0 || value.indexOf('\n') >= 0 || value.indexOf('\r') >= 0) {
      throw new IllegalArgumentException(name + " contains invalid characters");
    }
  }
}
