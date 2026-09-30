package dev.teamflow.application;

import dev.teamflow.domain.Project;
import dev.teamflow.domain.Task;
import dev.teamflow.domain.TaskPriority;
import dev.teamflow.domain.Team;
import dev.teamflow.domain.TeamMember;
import dev.teamflow.domain.User;
import java.math.BigDecimal;
import java.time.LocalDate;
import dev.teamflow.domain.Money;

/** 提供不依赖框架或外部基础设施的 C0 基础命令。 */
public final class TeamFlowDomainCommands {
  /**
   * 建立用户加入团队的成员关系。
   *
   * @param memberId 成员关系 ID
   * @param team 目标团队
   * @param user 目标用户
   * @param role 团队内角色
   * @return 新成员关系
   */
  public TeamMember addMember(String memberId, Team team, User user, String role) {
    require(team, "team");
    require(user, "user");
    return new TeamMember(memberId, team.id(), user.id(), role);
  }

  /**
   * 在指定团队下建立项目。
   *
   * @param projectId 项目 ID
   * @param team 所属团队
   * @param name 项目名称
   * @return 新项目
   */
  public Project createProject(String projectId, Team team, String name) {
    require(team, "team");
    return new Project(projectId, team.id(), name);
  }

  /**
   * 为项目内的现有团队成员建立任务。
   *
   * @param taskId 任务 ID
   * @param project 所属项目
   * @param member 负责人团队成员关系
   * @param title 任务标题
   * @param priority 任务优先级
   * @return 新任务
   */
  public Task createTask(
      String taskId,
      Project project,
      TeamMember member,
      String title,
      TaskPriority priority) {
    require(project, "project");
    require(member, "member");
    if (!project.teamId().equals(member.teamId())) {
      throw new IllegalArgumentException("assignee must belong to the project team");
    }
    return new Task(taskId, project.id(), title, priority, member.userId());
  }

  /**
   * 为项目内成员建立包含 C1 计划字段的任务。
   *
   * @param taskId 任务 ID
   * @param project 所属项目
   * @param member 负责人团队成员关系
   * @param title 任务标题
   * @param priority 任务优先级
   * @param dueDate 截止日期
   * @param plannedHours 计划工时
   * @param completedHours 已完成工时
   * @param cost 任务成本
   * @return 新任务
   */
  public Task createTask(
      String taskId,
      Project project,
      TeamMember member,
      String title,
      TaskPriority priority,
      LocalDate dueDate,
      BigDecimal plannedHours,
      BigDecimal completedHours,
      Money cost) {
    require(project, "project");
    require(member, "member");
    if (!project.teamId().equals(member.teamId())) {
      throw new IllegalArgumentException("assignee must belong to the project team");
    }
    return new Task(
        taskId,
        project.id(),
        title,
        priority,
        member.userId(),
        dueDate,
        plannedHours,
        completedHours,
        cost);
  }

  /**
   * 拒绝缺失的命令目标。
   *
   * @param value 命令目标
   * @param name 目标名称
   */
  private static void require(Object value, String name) {
    if (value == null) {
      throw new IllegalArgumentException(name + " cannot be null");
    }
  }
}
