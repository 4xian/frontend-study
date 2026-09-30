package dev.teamflow.application;

import dev.teamflow.domain.Project;
import dev.teamflow.domain.Task;
import dev.teamflow.domain.TaskPriority;
import dev.teamflow.domain.Team;
import dev.teamflow.domain.TeamMember;
import dev.teamflow.domain.User;

/** 运行 C0 领域对象和基础命令的无基础设施验收场景。 */
public final class TeamFlowDomainApplication {
  private TeamFlowDomainApplication() {}

  /**
   * 执行固定输入并输出稳定领域结果。
   *
   * @param args 启动参数，本场景不使用
   */
  public static void main(String[] args) {
    TeamFlowDomainCommands commands = new TeamFlowDomainCommands();
    User user = new User("USR-1", "林澄", "lin@example.com");
    Team team = new Team("TEAM-1", "课程平台组");
    TeamMember member = commands.addMember("MEM-1", team, user, "OWNER");
    Project project = commands.createProject("PRJ-1", team, "课程平台");
    Task task =
        commands.createTask(
            "TASK-1", project, member, "补齐课程目录", TaskPriority.HIGH);

    System.out.println("checkpoint=C0");
    System.out.println("user=" + user);
    System.out.println("team=" + team);
    System.out.println("member=" + member);
    System.out.println("project=" + project);
    System.out.println("task.before=" + task);
    System.out.println("task.start=" + task.start());
    System.out.println("task.repeatStart=" + task.start());
    System.out.println("task.complete=" + task.complete());
    System.out.println("task.after=" + task);
    System.out.println(
        "contract.user=" + user.equals(new User("USR-1", "不同名称", "other@example.com")));
    System.out.println(
        "contract.task="
            + task.equals(
                new Task(
                    "TASK-1",
                    "PRJ-OTHER",
                    "另一标题",
                    TaskPriority.LOW,
                    "USR-OTHER")));
  }
}
