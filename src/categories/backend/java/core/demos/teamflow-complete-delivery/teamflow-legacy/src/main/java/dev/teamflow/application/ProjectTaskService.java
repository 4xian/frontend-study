package dev.teamflow.application;

import dev.teamflow.persistence.TeamFlowMapper;
import dev.teamflow.persistence.TeamFlowRows;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 提供项目、任务和交付状态的应用用例。 */
@Service
public class ProjectTaskService {
  private final TeamFlowMapper mapper;

  /**
   * 注入 MyBatis 持久化入口。
   *
   * @param mapper TeamFlow Mapper
   */
  public ProjectTaskService(TeamFlowMapper mapper) {
    this.mapper = mapper;
  }

  /**
   * 按当前主体的成员或管理员范围查询项目分页。
   *
   * @param userId 当前主体的用户 ID
   * @param administrator 当前主体是否为管理员
   * @param pageSize 单页数量
   * @param offset 零起始偏移量
   * @return 当前主体可访问的项目分页
   */
  public PageResult<ProjectResult> listProjects(
      String userId, boolean administrator, int pageSize, int offset) {
    long count = administrator ? mapper.countProjects() : mapper.countAccessibleProjects(userId);
    requireOffset(offset, count);
    List<TeamFlowRows.ProjectRow> rows =
        administrator
            ? mapper.listProjects(pageSize, offset)
            : mapper.listAccessibleProjects(userId, pageSize, offset);
    List<ProjectResult> items = new ArrayList<ProjectResult>();
    for (TeamFlowRows.ProjectRow row : rows) {
      items.add(new ProjectResult(row.id, row.name));
    }
    return new PageResult<ProjectResult>(items, nextOffset(offset, pageSize, count));
  }

  /** 查询单个项目。 */
  public ProjectResult findProject(String projectId) {
    TeamFlowRows.ProjectRow row = mapper.findProject(projectId);
    if (row == null) throw new TeamFlowNotFoundException("Project not found: " + projectId);
    return new ProjectResult(row.id, row.name);
  }

  /** 创建项目，并在当前事务中分配稳定递增 ID。 */
  @Transactional
  public ProjectResult createProject(String teamId, String name) {
    if (mapper.findTeam(teamId) == null) {
      throw new TeamFlowNotFoundException("Team not found: " + teamId);
    }
    long value = mapper.lockNextDirectoryId("PROJECT");
    mapper.advanceDirectoryId("PROJECT");
    String id = "PRJ-" + value;
    mapper.insertProject(id, teamId, name);
    return new ProjectResult(id, name);
  }

  /** 按项目、状态和已解析偏移量查询任务分页。 */
  public PageResult<TaskResult> listTasks(
      String projectId, String status, int pageSize, int offset) {
    requireProject(projectId);
    long count = mapper.countTasks(projectId, status);
    requireOffset(offset, count);
    List<TaskResult> items = new ArrayList<TaskResult>();
    for (TeamFlowRows.TaskRow row : mapper.listTasks(projectId, status, pageSize, offset)) {
      items.add(task(row));
    }
    return new PageResult<TaskResult>(items, nextOffset(offset, pageSize, count));
  }

  /** 删除项目内任务，关联的 outbox 与通知由数据库级联清理。 */
  @Transactional
  public void deleteTask(String projectId, String taskId) {
    if (mapper.deleteTask(projectId, taskId) == 0) {
      throw new TeamFlowNotFoundException("Task not found: " + taskId);
    }
  }

  /** 查询项目内单个任务。 */
  public TaskResult findTask(String projectId, String taskId) {
    TeamFlowRows.TaskRow row = mapper.findTask(projectId, taskId);
    if (row == null) throw new TeamFlowNotFoundException("Task not found: " + taskId);
    return task(row);
  }

  /** 查询任务的通知交付状态。 */
  public DeliveryResult findDelivery(String projectId, String taskId) {
    TeamFlowRows.DeliveryRow row = mapper.findDelivery(projectId, taskId);
    if (row == null) {
      throw new TeamFlowNotFoundException("No delivery event exists for task " + taskId);
    }
    return new DeliveryResult(row.eventId, row.status, row.attempts, row.notificationCount);
  }

  /** 确认项目真实存在。 */
  private void requireProject(String projectId) {
    if (mapper.countProject(projectId) == 0) {
      throw new TeamFlowNotFoundException("Project not found: " + projectId);
    }
  }

  /** 拒绝超出当前集合的已解析偏移量。 */
  private void requireOffset(int offset, long itemCount) {
    if (offset < 0 || (offset > 0 && offset >= itemCount)) {
      throw new TeamFlowBadRequestException(
          "INVALID_PAGE_TOKEN", "pageToken is outside the result set");
    }
  }

  /** 仅在存在下一页时返回下一页偏移量。 */
  private Integer nextOffset(int offset, int pageSize, long itemCount) {
    long next = (long) offset + pageSize;
    return next < itemCount ? Integer.valueOf((int) next) : null;
  }

  /** 把数据库任务行映射为应用结果。 */
  private TaskResult task(TeamFlowRows.TaskRow row) {
    return new TaskResult(
        row.id, row.projectId, row.title, row.dueAt, row.assignee, row.status, row.version);
  }

  /** 项目应用结果。 */
  public static final class ProjectResult {
    public final String id;
    public final String name;

    /** 保存项目公开字段。 */
    public ProjectResult(String id, String name) {
      this.id = id;
      this.name = name;
    }
  }

  /** 任务应用结果。 */
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

  /** 交付状态应用结果。 */
  public static final class DeliveryResult {
    public final String eventId;
    public final String status;
    public final int attempts;
    public final int notificationCount;

    /** 保存交付状态公开字段。 */
    public DeliveryResult(String eventId, String status, int attempts, int notificationCount) {
      this.eventId = eventId;
      this.status = status;
      this.attempts = attempts;
      this.notificationCount = notificationCount;
    }
  }

  /** 已解析分页的应用结果。 */
  public static final class PageResult<T> {
    private final List<T> items;
    private final Integer nextOffset;

    /** 保存分页项和下一页偏移量。 */
    public PageResult(List<T> items, Integer nextOffset) {
      this.items = items;
      this.nextOffset = nextOffset;
    }

    /** @return 当前页项目 */
    public List<T> items() {
      return items;
    }

    /** @return 下一页偏移量，无下一页时为空 */
    public Integer nextOffset() {
      return nextOffset;
    }
  }
}
