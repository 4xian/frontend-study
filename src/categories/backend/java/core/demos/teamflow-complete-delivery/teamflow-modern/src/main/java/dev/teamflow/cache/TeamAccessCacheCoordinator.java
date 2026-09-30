package dev.teamflow.cache;

import dev.teamflow.application.MembershipAccessCache;
import dev.teamflow.persistence.TeamFlowMapper;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/** 在团队成员关系变化后失效项目与任务授权缓存。 */
@Service
public class TeamAccessCacheCoordinator implements MembershipAccessCache {
  private final TeamFlowMapper mapper;
  private final ProjectPageCache projectPageCache;
  private final TaskCacheCoordinator taskCacheCoordinator;
  private final MembershipChangeGuard membershipChangeGuard;

  /**
   * 保存项目、任务事实查询和缓存协调入口。
   *
   * @param mapper TeamFlow Mapper
   * @param projectPageCache 项目分页缓存
   * @param taskCacheCoordinator 任务缓存协调器
   * @param membershipChangeGuard 成员变更护栏
   */
  public TeamAccessCacheCoordinator(
      TeamFlowMapper mapper,
      ProjectPageCache projectPageCache,
      TaskCacheCoordinator taskCacheCoordinator,
      MembershipChangeGuard membershipChangeGuard) {
    this.mapper = mapper;
    this.projectPageCache = projectPageCache;
    this.taskCacheCoordinator = taskCacheCoordinator;
    this.membershipChangeGuard = membershipChangeGuard;
  }

  /**
   * 在事务写入前建立护栏并失效旧缓存，提交后再次失效并释放护栏。
   *
   * @param teamId 成员关系发生变化的团队 ID
   */
  @Override
  public void guardChange(String teamId) {
    if (!TransactionSynchronizationManager.isSynchronizationActive()) {
      throw new IllegalStateException("Membership cache guard requires an active transaction");
    }
    String token = membershipChangeGuard.acquire();
    TransactionSynchronizationManager.registerSynchronization(
        new TransactionSynchronization() {
          @Override
          public void afterCommit() {
            invalidateTeam(teamId);
            membershipChangeGuard.release(token);
          }

          @Override
          public void afterCompletion(int status) {
            if (status != TransactionSynchronization.STATUS_COMMITTED) {
              membershipChangeGuard.release(token);
            }
          }
        });
    invalidateTeam(teamId);
  }

  /** 失效团队成员可见的项目分页、任务列表和任务详情。 */
  private void invalidateTeam(String teamId) {
    projectPageCache.advance();
    for (String projectId : mapper.listProjectIdsByTeam(teamId)) {
      List<String> taskIds = mapper.listTaskIdsByProject(projectId);
      taskCacheCoordinator.invalidateProject(projectId, taskIds);
    }
  }
}
