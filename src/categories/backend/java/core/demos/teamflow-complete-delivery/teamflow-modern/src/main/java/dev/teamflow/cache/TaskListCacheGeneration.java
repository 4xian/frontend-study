package dev.teamflow.cache;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/** 维护每个项目任务列表缓存的永久代次。 */
@Service
public class TaskListCacheGeneration {
  private static final String KEY_PREFIX = "teamflow:cache:task-list-generation:v1:";

  private final StringRedisTemplate redisTemplate;

  /** 保存 Redis 字符串操作入口。 */
  public TaskListCacheGeneration(StringRedisTemplate redisTemplate) {
    this.redisTemplate = redisTemplate;
  }

  /** @return 当前代次；缺失 key 表示 0 且不会创建 key */
  public long current(String projectId) {
    String stored = redisTemplate.opsForValue().get(key(projectId));
    if (stored == null) {
      return 0L;
    }
    try {
      long generation = Long.parseLong(stored);
      if (generation < 0L || !stored.equals(Long.toString(generation))) {
        throw new IllegalArgumentException("generation is not canonical");
      }
      return generation;
    } catch (IllegalArgumentException exception) {
      throw new TeamFlowCacheStateException("Task list cache generation is invalid", exception);
    }
  }

  /** @return Redis 原子推进后的代次 */
  public long advance(String projectId) {
    current(projectId);
    Long next = redisTemplate.opsForValue().increment(key(projectId));
    if (next == null || next < 1L) {
      throw new IllegalStateException("Task list cache generation cannot advance");
    }
    return next;
  }

  /** @return 项目代次 key */
  private String key(String projectId) {
    return KEY_PREFIX + projectId;
  }
}
