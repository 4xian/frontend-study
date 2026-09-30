package dev.teamflow.persistence;

import java.util.List;
import org.apache.ibatis.annotations.Param;

/** TeamFlow MySQL 查询、写入和事务协作的 Mapper 边界。 */
public interface TeamFlowMapper {
  /** @return 项目总数 */
  long countProjects();

  /**
   * 查询项目分页。
   *
   * @param pageSize 单页数量
   * @param offset 零起始偏移量
   * @return 项目行
   */
  List<TeamFlowRows.ProjectRow> listProjects(@Param("pageSize") int pageSize, @Param("offset") int offset);

  /**
   * 统计用户通过团队成员关系可访问的项目。
   *
   * @param userId 用户 ID
   * @return 可访问项目总数
   */
  long countAccessibleProjects(@Param("userId") String userId);

  /**
   * 查询用户通过团队成员关系可访问的项目分页。
   *
   * @param userId 用户 ID
   * @param pageSize 单页数量
   * @param offset 零起始偏移量
   * @return 可访问项目行
   */
  List<TeamFlowRows.ProjectRow> listAccessibleProjects(
      @Param("userId") String userId,
      @Param("pageSize") int pageSize,
      @Param("offset") int offset);

  /**
   * 查询单个项目。
   *
   * @param projectId 项目 ID
   * @return 项目行；不存在时为空
   */
  TeamFlowRows.ProjectRow findProject(@Param("projectId") String projectId);

  /**
   * 插入项目。
   *
   * @param id 项目 ID
   * @param teamId 团队 ID
   * @param name 项目名称
   * @return 影响行数
   */
  int insertProject(
      @Param("id") String id, @Param("teamId") String teamId, @Param("name") String name);

  /**
   * 统计项目内指定状态的任务。
   *
   * @param projectId 项目 ID
   * @param status 可选任务状态
   * @return 任务数量
   */
  long countTasks(@Param("projectId") String projectId, @Param("status") String status);

  /**
   * 查询项目任务分页。
   *
   * @param projectId 项目 ID
   * @param status 可选任务状态
   * @param pageSize 单页数量
   * @param offset 零起始偏移量
   * @return 任务行
   */
  List<TeamFlowRows.TaskRow> listTasks(
      @Param("projectId") String projectId,
      @Param("status") String status,
      @Param("pageSize") int pageSize,
      @Param("offset") int offset);

  /**
   * 删除项目内任务。
   *
   * @param projectId 项目 ID
   * @param taskId 任务 ID
   * @return 影响行数
   */
  int deleteTask(@Param("projectId") String projectId, @Param("taskId") String taskId);

  /**
   * 统计指定项目。
   *
   * @param projectId 项目 ID
   * @return 匹配数量
   */
  long countProject(@Param("projectId") String projectId);

  /**
   * 统计用户对指定项目的团队成员资格。
   *
   * @param projectId 项目 ID
   * @param userId 用户 ID
   * @return 匹配数量
   */
  long countProjectAccess(
      @Param("projectId") String projectId, @Param("userId") String userId);

  /**
   * 查询项目内任务。
   *
   * @param projectId 项目 ID
   * @param taskId 任务 ID
   * @return 任务行；不存在时为空
   */
  TeamFlowRows.TaskRow findTask(
      @Param("projectId") String projectId, @Param("taskId") String taskId);

  /**
   * 查询任务通知交付事实。
   *
   * @param projectId 项目 ID
   * @param taskId 任务 ID
   * @return 交付行；不存在时为空
   */
  TeamFlowRows.DeliveryRow findDelivery(
      @Param("projectId") String projectId, @Param("taskId") String taskId);

  /** @return 用户总数 */
  long countUsers();

  /**
   * 查询用户分页。
   *
   * @param pageSize 单页数量
   * @param offset 零起始偏移量
   * @return 用户行
   */
  List<TeamFlowRows.UserRow> listUsers(
      @Param("pageSize") int pageSize, @Param("offset") int offset);

  /**
   * 查询单个用户。
   *
   * @param userId 用户 ID
   * @return 用户行；不存在时为空
   */
  TeamFlowRows.UserRow findUser(@Param("userId") String userId);

  /**
   * 按邮箱查询用户。
   *
   * @param email 邮箱
   * @return 用户行；不存在时为空
   */
  TeamFlowRows.UserRow findUserByEmail(@Param("email") String email);

  /**
   * 插入用户。
   *
   * @param id 用户 ID
   * @param displayName 展示名称
   * @param email 邮箱
   * @return 影响行数
   */
  int insertUser(
      @Param("id") String id,
      @Param("displayName") String displayName,
      @Param("email") String email);

  /** @return 团队总数 */
  long countTeams();

  /**
   * 查询团队分页。
   *
   * @param pageSize 单页数量
   * @param offset 零起始偏移量
   * @return 团队行
   */
  List<TeamFlowRows.TeamRow> listTeams(
      @Param("pageSize") int pageSize, @Param("offset") int offset);

  /**
   * 查询单个团队。
   *
   * @param teamId 团队 ID
   * @return 团队行；不存在时为空
   */
  TeamFlowRows.TeamRow findTeam(@Param("teamId") String teamId);

  /**
   * 统计用户对指定团队的成员资格。
   *
   * @param teamId 团队 ID
   * @param userId 用户 ID
   * @return 匹配数量
   */
  long countTeamAccess(@Param("teamId") String teamId, @Param("userId") String userId);

  /**
   * 插入团队。
   *
   * @param id 团队 ID
   * @param name 团队名称
   * @return 影响行数
   */
  int insertTeam(@Param("id") String id, @Param("name") String name);

  /**
   * 统计团队成员。
   *
   * @param teamId 团队 ID
   * @return 成员数量
   */
  long countMembers(@Param("teamId") String teamId);

  /**
   * 查询团队成员分页。
   *
   * @param teamId 团队 ID
   * @param pageSize 单页数量
   * @param offset 零起始偏移量
   * @return 成员行
   */
  List<TeamFlowRows.MemberRow> listMembers(
      @Param("teamId") String teamId,
      @Param("pageSize") int pageSize,
      @Param("offset") int offset);

  /**
   * 查询单个成员关系。
   *
   * @param teamId 团队 ID
   * @param memberId 成员关系 ID
   * @return 成员行；不存在时为空
   */
  TeamFlowRows.MemberRow findMember(
      @Param("teamId") String teamId, @Param("memberId") String memberId);

  /**
   * 按用户查询团队成员关系。
   *
   * @param teamId 团队 ID
   * @param userId 用户 ID
   * @return 成员行；不存在时为空
   */
  TeamFlowRows.MemberRow findMemberByUser(
      @Param("teamId") String teamId, @Param("userId") String userId);

  /**
   * 插入成员关系。
   *
   * @param id 成员关系 ID
   * @param teamId 团队 ID
   * @param userId 用户 ID
   * @param role 团队内角色
   * @return 影响行数
   */
  int insertMember(
      @Param("id") String id,
      @Param("teamId") String teamId,
      @Param("userId") String userId,
      @Param("role") String role);

  /**
   * 删除成员关系。
   *
   * @param teamId 团队 ID
   * @param memberId 成员关系 ID
   * @return 影响行数
   */
  int deleteMember(@Param("teamId") String teamId, @Param("memberId") String memberId);

  /**
   * 查询团队的全部项目 ID。
   *
   * @param teamId 团队 ID
   * @return 项目 ID
   */
  List<String> listProjectIdsByTeam(@Param("teamId") String teamId);

  /**
   * 查询项目的全部任务 ID。
   *
   * @param projectId 项目 ID
   * @return 任务 ID
   */
  List<String> listTaskIdsByProject(@Param("projectId") String projectId);

  /**
   * 锁定并读取目录资源的下一 ID。
   *
   * @param resourceType 资源类型
   * @return 下一数值 ID
   */
  long lockNextDirectoryId(@Param("resourceType") String resourceType);

  /**
   * 推进目录资源 ID。
   *
   * @param resourceType 资源类型
   * @return 影响行数
   */
  int advanceDirectoryId(@Param("resourceType") String resourceType);

  /**
   * 插入任务。
   *
   * @param id 任务 ID
   * @param projectId 项目 ID
   * @param title 任务标题
   * @param dueAt 截止时间
   * @param assignee 负责人
   * @return 影响行数
   */
  int insertTask(
      @Param("id") String id,
      @Param("projectId") String projectId,
      @Param("title") String title,
      @Param("dueAt") String dueAt,
      @Param("assignee") String assignee);

  /**
   * 乐观完成任务。
   *
   * @param projectId 项目 ID
   * @param taskId 任务 ID
   * @param version 客户端版本
   * @return 影响行数
   */
  int completeTask(
      @Param("projectId") String projectId,
      @Param("taskId") String taskId,
      @Param("version") long version);

  /**
   * 插入 outbox 事件。
   *
   * @param eventId 事件 ID
   * @param taskId 任务 ID
   * @return 影响行数
   */
  int insertOutbox(
      @Param("eventId") String eventId, @Param("taskId") String taskId);

  /** @return 待发布的 outbox 行 */
  List<TeamFlowRows.OutboxRow> listPendingOutbox();

  /**
   * 标记 outbox 发布成功。
   *
   * @param eventId 事件 ID
   * @return 影响行数
   */
  int markOutboxPublished(@Param("eventId") String eventId);

  /**
   * 标记 outbox 等待重试。
   *
   * @param eventId 事件 ID
   * @return 影响行数
   */
  int markOutboxRetry(@Param("eventId") String eventId);

  /** 将超过重试预算的 outbox 事件标记为死信。 */
  int markOutboxDead(
      @Param("eventId") String eventId, @Param("failureReason") String failureReason);

  /**
   * 查询 outbox 当前重试次数。
   *
   * @param eventId 事件 ID
   * @return 重试次数
   */
  int findOutboxAttempts(@Param("eventId") String eventId);

  /**
   * 插入 inbox 记录。
   *
   * @param eventId 事件 ID
   * @return 影响行数
   */
  int insertInbox(@Param("eventId") String eventId);

  /**
   * 插入通知副作用。
   *
   * @param eventId 事件 ID
   * @param taskId 任务 ID
   * @param message 通知内容
   * @return 影响行数
   */
  int insertNotification(
      @Param("eventId") String eventId,
      @Param("taskId") String taskId,
      @Param("message") String message);
}
