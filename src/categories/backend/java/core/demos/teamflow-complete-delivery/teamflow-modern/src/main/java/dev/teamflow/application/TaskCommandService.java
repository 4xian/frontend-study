package dev.teamflow.application;

import dev.teamflow.persistence.TeamFlowMapper;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 在方法权限边界内提交任务状态和 outbox。 */
@Service
public class TaskCommandService {
  private final TeamFlowMapper mapper;

  /**
   * 注入任务真相源。
   *
   * @param mapper MyBatis 持久化入口
   */
  public TaskCommandService(TeamFlowMapper mapper) {
    this.mapper = mapper;
  }

  /**
   * 使用乐观版本完成任务，并在同一事务写入 outbox。
   *
   * @param projectId 项目 ID
   * @param taskId 任务 ID
   * @param version 客户端读取到的任务版本
   * @param status 目标任务状态
   */
  @PreAuthorize("hasAuthority('task:write')")
  @Transactional
  public void complete(String projectId, String taskId, long version, String status) {
    if (!"DONE".equals(status)) {
      throw new TeamFlowConflictException("INVALID_TASK_STATE", "Only DONE is accepted here");
    }
    int updated = mapper.completeTask(projectId, taskId, version);
    if (updated == 0) {
      throw new TeamFlowConflictException(
          "TASK_VERSION_CONFLICT", "Task state or version no longer matches");
    }
    mapper.insertOutbox(UUID.randomUUID().toString(), taskId);
  }
}
