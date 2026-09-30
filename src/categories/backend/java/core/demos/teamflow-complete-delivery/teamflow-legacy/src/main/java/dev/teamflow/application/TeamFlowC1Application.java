package dev.teamflow.application;

import dev.teamflow.domain.Money;
import dev.teamflow.domain.Project;
import dev.teamflow.domain.Task;
import dev.teamflow.domain.TaskPriority;
import dev.teamflow.domain.TaskStatus;
import dev.teamflow.domain.Team;
import dev.teamflow.domain.TeamMember;
import dev.teamflow.domain.User;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.List;

/** 运行 C1 查询、统计、金额、时间和导入导出验收场景。 */
public final class TeamFlowC1Application {
  private TeamFlowC1Application() {}

  /**
   * 执行固定输入并输出稳定应用结果。
   *
   * @param args 启动参数，本场景不使用
   * @throws Exception 临时交换文件读写失败
   */
  public static void main(String[] args) throws Exception {
    TeamFlowDomainCommands commands = new TeamFlowDomainCommands();
    User user = new User("USR-1", "林澄", "lin@example.com");
    Team team = new Team("TEAM-1", "课程平台组");
    TeamMember member = commands.addMember("MEM-1", team, user, "OWNER");
    Project project = commands.createProject("PRJ-1", team, "课程平台");
    TaskBoard board = new TaskBoard();
    board.add(task(commands, project, member, "TASK-101", "设计登录页", TaskPriority.HIGH, "2026-08-16", "16.0", "10.0", "1000.00"));
    Task done = task(commands, project, member, "TASK-102", "编写任务接口", TaskPriority.MEDIUM, "2026-08-17", "20.0", "20.0", "2000.00");
    done.start();
    done.complete();
    board.add(done);
    Task inProgress = task(commands, project, member, "TASK-103", "补充集成测试", TaskPriority.LOW, "2026-08-20", "8.0", "0.0", "600.00");
    inProgress.start();
    board.add(inProgress);
    board.add(task(commands, project, member, "TASK-104", "修复进度统计", TaskPriority.HIGH, "2026-08-15", "4.0", "3.0", "300.00"));

    List<Task> filtered = board.query(new TaskFilter(EnumSet.of(TaskStatus.BACKLOG, TaskStatus.IN_PROGRESS), "USR-1", ""));
    List<Task> keywordFiltered = board.query(new TaskFilter(null, null, "任务"));
    TaskStatistics statistics = board.statistics(LocalDate.of(2026, 8, 18));
    System.out.println("checkpoint=C1");
    System.out.println("query.ids=" + ids(filtered));
    System.out.println("query.keywordIds=" + ids(keywordFiltered));
    System.out.println("stats.total=" + statistics.totalCount());
    System.out.println("stats.status=" + statistics.statusCounts());
    System.out.println("stats.hours=" + statistics.plannedHours().toPlainString() + "/" + statistics.completedHours().toPlainString());
    System.out.println("stats.rate=" + statistics.completionRate().toPlainString() + "%");
    System.out.println("stats.cost=" + statistics.costSummary().total());
    System.out.println("stats.overdue=" + ids(statistics.overdueTasks()));

    Path exchange = Files.createTempFile("teamflow-c1-", ".txt");
    Path roundTrip = Files.createTempFile("teamflow-c1-roundtrip-", ".txt");
    try {
      board.exportTo(exchange);
      TaskBoard imported = new TaskBoard();
      imported.importFrom(exchange);
      imported.exportTo(roundTrip);
      System.out.println(
          "exchange.roundTrip="
              + Arrays.equals(Files.readAllBytes(exchange), Files.readAllBytes(roundTrip)));
      byte[] beforeFailure = Files.readAllBytes(roundTrip);
      Files.write(exchange, "TEAMFLOW_TASKS_V2\nTASK-101|PRJ-1|坏|HIGH|UNKNOWN|USR-1|2026-08-16|16.0|10.0|CNY|1000.00|0\n".getBytes(StandardCharsets.UTF_8));
      try {
        imported.importFrom(exchange);
      } catch (IllegalArgumentException expected) {
        imported.exportTo(roundTrip);
        System.out.println(
            "exchange.failurePreservesBoard="
                + Arrays.equals(beforeFailure, Files.readAllBytes(roundTrip)));
      }
    } finally {
      Files.deleteIfExists(exchange);
      Files.deleteIfExists(roundTrip);
    }
  }

  /** 创建含 C1 字段的任务。 */
  private static Task task(TeamFlowDomainCommands commands, Project project, TeamMember member, String id, String title, TaskPriority priority, String dueDate, String planned, String completed, String cost) {
    return commands.createTask(id, project, member, title, priority, LocalDate.parse(dueDate), new BigDecimal(planned), new BigDecimal(completed), new Money("CNY", new BigDecimal(cost)));
  }

  /** 返回任务 ID 列表。 */
  private static String ids(List<Task> tasks) {
    StringBuilder result = new StringBuilder("[");
    for (int index = 0; index < tasks.size(); index++) {
      if (index > 0) {
        result.append(", ");
      }
      result.append(tasks.get(index).id());
    }
    return result.append(']').toString();
  }

}
