package dev.teamflow.application;

import dev.teamflow.persistence.TeamFlowMapper;
import java.util.UUID;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 在事务边界内创建任务并返回应用层结果。 */
@Service
public class TaskCreationService {
  private final TeamFlowMapper mapper;

  /**
   * 注入任务持久化入口。
   *
   * @param mapper TeamFlow Mapper
   */
  public TaskCreationService(TeamFlowMapper mapper) {
    this.mapper = mapper;
  }

  /**
   * 在幂等占用前确认项目存在。
   *
   * @param projectId 项目 ID
   */
  public void validateProject(String projectId) {
    if (mapper.countProject(projectId) == 0) {
      throw new TeamFlowNotFoundException("Project not found: " + projectId);
    }
  }

  /**
   * 创建任务；同一项目内的重复标题返回稳定业务冲突。
   *
   * @param command 任务创建命令
   * @return 已提交的任务结果
   */
  @Transactional
  public TaskResult create(CreateTaskCommand command) {
    String taskId = UUID.randomUUID().toString();
    try {
      mapper.insertTask(
          taskId,
          command.projectId,
          command.title,
          command.dueAt,
          command.assignee);
    } catch (DuplicateKeyException exception) {
      throw new TeamFlowConflictException(
          "TASK_CREATE_CONFLICT", "A task with this title already exists in the project");
    }
    return new TaskResult(
        taskId,
        command.projectId,
        command.title,
        command.dueAt,
        command.assignee,
        "IN_PROGRESS",
        0L);
  }

  /** 任务创建命令。 */
  public static final class CreateTaskCommand {
    public final String projectId;
    public final String title;
    public final String dueAt;
    public final String assignee;

    /** 保存已经通过 Web 校验的任务字段。 */
    public CreateTaskCommand(String projectId, String title, String dueAt, String assignee) {
      this.projectId = projectId;
      this.title = title;
      this.dueAt = dueAt;
      this.assignee = assignee;
    }
  }

  /** 已提交的任务应用结果。 */
  public static final class TaskResult {
    public final String id;
    public final String projectId;
    public final String title;
    public final String dueAt;
    public final String assignee;
    public final String status;
    public final long version;

    /** 保存任务公开字段。 */
    public TaskResult(
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
}
