package dev.teamflow.cache;

import dev.teamflow.web.TeamFlowController.TaskResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import org.springframework.stereotype.Service;
import org.springframework.data.redis.core.StringRedisTemplate;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

/** 管理任务详情的 cache-aside 副本。 */
@Service
public class TaskDetailCache {
  private static final Duration TTL = Duration.ofSeconds(60);
  private static final String KEY_PREFIX = "teamflow:cache:task-detail:v1:";
  private static final String ACCESS_KEY_PREFIX = "teamflow:cache:task-detail-access:v1:";

  private final StringRedisTemplate redisTemplate;
  private final ObjectMapper objectMapper;
  private final MembershipChangeGuard membershipChangeGuard;

  /**
   * 保存 Redis、JSON 编解码入口和成员变更护栏。
   *
   * @param redisTemplate Redis 访问入口
   * @param objectMapper JSON 编解码入口
   * @param membershipChangeGuard 成员变更护栏
   */
  public TaskDetailCache(
      StringRedisTemplate redisTemplate,
      ObjectMapper objectMapper,
      MembershipChangeGuard membershipChangeGuard) {
    this.redisTemplate = redisTemplate;
    this.objectMapper = objectMapper;
    this.membershipChangeGuard = membershipChangeGuard;
  }

  /**
   * 读取当前主体已获授权的任务详情副本。
   *
   * @param projectId 项目 ID
   * @param scope 当前主体的缓存作用域
   * @param taskId 任务 ID
   * @return 缓存中的任务；授权标记或详情 key 不存在时返回 null
   */
  public TaskResponse get(String projectId, String scope, String taskId) {
    membershipChangeGuard.requireStable();
    if (!Boolean.TRUE.equals(redisTemplate.hasKey(accessKey(projectId, scope, taskId)))) {
      return null;
    }
    String json = redisTemplate.opsForValue().get(key(projectId, taskId));
    if (json == null) {
      return null;
    }
    try {
      return CacheValue.fromJson(objectMapper.readValue(json, CacheValue.class), projectId, taskId);
    } catch (JacksonException | IllegalArgumentException exception) {
      throw new TeamFlowCacheStateException("Task detail cache is invalid", exception);
    }
  }

  /**
   * 写入详情副本和当前主体的同寿命授权标记。
   *
   * @param projectId 项目 ID
   * @param scope 当前主体的缓存作用域
   * @param taskId 任务 ID
   * @param task 公开任务响应
   */
  public void put(String projectId, String scope, String taskId, TaskResponse task) {
    membershipChangeGuard.requireStable();
    try {
      redisTemplate
          .opsForValue()
          .set(key(projectId, taskId), objectMapper.writeValueAsString(CacheValue.from(task)), TTL);
      redisTemplate.opsForValue().set(accessKey(projectId, scope, taskId), "allowed", TTL);
    } catch (JacksonException exception) {
      throw new IllegalStateException("Task detail cache cannot be encoded", exception);
    }
  }

  /** 精确删除一个任务详情 key。 */
  public void evict(String projectId, String taskId) {
    redisTemplate.delete(key(projectId, taskId));
  }

  /** @return 任务详情缓存 key */
  private String key(String projectId, String taskId) {
    return KEY_PREFIX + projectId + ":" + taskId;
  }

  /** @return 不暴露原始主体的任务详情授权标记 key */
  private String accessKey(String projectId, String scope, String taskId) {
    String encodedScope =
        Base64.getUrlEncoder()
            .withoutPadding()
            .encodeToString(scope.getBytes(StandardCharsets.UTF_8));
    return ACCESS_KEY_PREFIX + "scope:" + encodedScope + ":" + projectId + ":" + taskId;
  }

  /** Redis 中使用的可校验 JSON 结构。 */
  public static final class CacheValue {
    public String id;
    public String projectId;
    public String title;
    public String dueAt;
    public String assignee;
    public String status;
    public long version;

    /** 供 Jackson 创建缓存值。 */
    public CacheValue() {}

    /** 从公开任务响应复制缓存字段。 */
    private static CacheValue from(TaskResponse task) {
      CacheValue value = new CacheValue();
      value.id = task.id;
      value.projectId = task.projectId;
      value.title = task.title;
      value.dueAt = task.dueAt;
      value.assignee = task.assignee;
      value.status = task.status;
      value.version = task.version;
      return value;
    }

    /** 校验缓存归属后恢复公开任务响应。 */
    private static TaskResponse fromJson(CacheValue value, String projectId, String taskId) {
      if (value == null
          || value.id == null
          || value.projectId == null
          || value.title == null
          || value.dueAt == null
          || value.assignee == null
          || value.status == null
          || !taskId.equals(value.id)
          || !projectId.equals(value.projectId)
          || value.version < 0) {
        throw new IllegalArgumentException("Task detail cache fields are invalid");
      }
      return new TaskResponse(
          value.id,
          value.projectId,
          value.title,
          value.dueAt,
          value.assignee,
          value.status,
          value.version);
    }
  }
}
