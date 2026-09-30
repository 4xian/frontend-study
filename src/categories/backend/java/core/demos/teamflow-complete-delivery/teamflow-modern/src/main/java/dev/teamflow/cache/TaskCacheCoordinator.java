package dev.teamflow.cache;

import java.util.List;
import org.springframework.stereotype.Service;

/** 在数据库事务返回成功后协调任务详情和列表缓存。 */
@Service
public class TaskCacheCoordinator {
  private final TaskDetailCache detailCache;
  private final TaskListCacheGeneration generation;

  /** 保存两类缓存 owner。 */
  public TaskCacheCoordinator(TaskDetailCache detailCache, TaskListCacheGeneration generation) {
    this.detailCache = detailCache;
    this.generation = generation;
  }

  /** 先删除详情副本，再推进项目列表代次。 */
  public void invalidateTask(String projectId, String taskId) {
    detailCache.evict(projectId, taskId);
    generation.advance(projectId);
  }

  /** 首次真实创建后只推进一次项目列表代次。 */
  public void advanceTaskList(String projectId) {
    generation.advance(projectId);
  }

  /**
   * 删除项目内全部任务详情，并只推进一次任务列表代次。
   *
   * @param projectId 项目 ID
   * @param taskIds 当前项目的任务 ID
   */
  public void invalidateProject(String projectId, List<String> taskIds) {
    for (String taskId : taskIds) {
      detailCache.evict(projectId, taskId);
    }
    generation.advance(projectId);
  }
}
