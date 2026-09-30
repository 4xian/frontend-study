package dev.teamflow.cache;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.teamflow.web.TeamFlowController.TaskPage;
import dev.teamflow.web.TeamFlowController.TaskResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.TimeUnit;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/** 管理带项目代次的任务列表 cache-aside 副本。 */
@Service
public class TaskListCache {
  private static final long TTL_MILLIS = 90000L;
  private static final String KEY_PREFIX = "teamflow:cache:task-list:v1:";

  private final StringRedisTemplate redisTemplate;
  private final ObjectMapper objectMapper;
  private final TaskListCacheGeneration generation;
  private final MembershipChangeGuard membershipChangeGuard;

  /**
   * 保存 Redis、JSON、代次 owner 和成员变更护栏。
   *
   * @param redisTemplate Redis 访问入口
   * @param objectMapper JSON 编解码入口
   * @param generation 任务列表代次
   * @param membershipChangeGuard 成员变更护栏
   */
  public TaskListCache(
      StringRedisTemplate redisTemplate,
      ObjectMapper objectMapper,
      TaskListCacheGeneration generation,
      MembershipChangeGuard membershipChangeGuard) {
    this.redisTemplate = redisTemplate;
    this.objectMapper = objectMapper;
    this.generation = generation;
    this.membershipChangeGuard = membershipChangeGuard;
  }

  /**
   * 读取当前主体作用域内的缓存任务页。
   *
   * @param projectId 项目 ID
   * @param scope 当前主体的缓存作用域
   * @param status 可选任务状态
   * @param pageSize 单页数量
   * @param pageToken 不透明分页令牌
   * @return 缓存任务页；仅 null 表示未命中
   */
  public TaskPage get(
      String projectId, String scope, String status, int pageSize, String pageToken) {
    membershipChangeGuard.requireStable();
    long currentGeneration = generation.current(projectId);
    String json =
        redisTemplate
            .opsForValue()
            .get(key(projectId, scope, currentGeneration, status, pageSize, pageToken));
    if (json == null) {
      return null;
    }
    try {
      CacheValue value = objectMapper.readValue(json, CacheValue.class);
      return value.toPage(projectId, status, pageSize);
    } catch (JsonProcessingException | IllegalArgumentException exception) {
      throw new TeamFlowCacheStateException("Task list cache is invalid", exception);
    }
  }

  /**
   * 从数据库结果写入当前主体和项目代次的列表副本。
   *
   * @param projectId 项目 ID
   * @param scope 当前主体的缓存作用域
   * @param status 可选任务状态
   * @param pageSize 单页数量
   * @param pageToken 不透明分页令牌
   * @param page 任务分页响应
   */
  public void put(
      String projectId,
      String scope,
      String status,
      int pageSize,
      String pageToken,
      TaskPage page) {
    membershipChangeGuard.requireStable();
    long currentGeneration = generation.current(projectId);
    try {
      String json = objectMapper.writeValueAsString(CacheValue.from(page));
      redisTemplate
          .opsForValue()
          .set(
              key(projectId, scope, currentGeneration, status, pageSize, pageToken),
              json,
              TTL_MILLIS,
              TimeUnit.MILLISECONDS);
    } catch (JsonProcessingException exception) {
      throw new IllegalStateException("Task list cache cannot be encoded", exception);
    }
  }

  /** @return 包含主体、项目、代次和查询摘要的固定 key */
  private String key(
      String projectId,
      String scope,
      long currentGeneration,
      String status,
      int pageSize,
      String pageToken) {
    return KEY_PREFIX
        + "scope:"
        + encodeField(scope)
        + ":"
        + projectId
        + ":g"
        + currentGeneration
        + ":"
        + queryHash(status, pageSize, pageToken);
  }

  /** @return status、pageSize、pageToken 的 SHA-256 摘要 */
  private String queryHash(String status, int pageSize, String pageToken) {
    String canonical =
        "v1|status="
            + (status == null ? "~" : status)
            + "|pageSize="
            + pageSize
            + "|pageToken="
            + encodeField(pageToken);
    try {
      byte[] digest = MessageDigest.getInstance("SHA-256").digest(canonical.getBytes(StandardCharsets.UTF_8));
      StringBuilder result = new StringBuilder(64);
      for (byte item : digest) {
        result.append(String.format(Locale.ROOT, "%02x", item & 0xff));
      }
      return result.toString();
    } catch (NoSuchAlgorithmException exception) {
      throw new IllegalStateException("SHA-256 is required by the Java runtime", exception);
    }
  }

  /** @return null 标记或 Base64URL 查询字段 */
  private String encodeField(String value) {
    return value == null
        ? "~"
        : Base64.getUrlEncoder()
            .withoutPadding()
            .encodeToString(value.getBytes(StandardCharsets.UTF_8));
  }

  /** Redis 中使用的可校验列表结构。 */
  public static final class CacheValue {
    public List<Item> items;
    public String nextPageToken;

    /** 供 Jackson 创建缓存值。 */
    public CacheValue() {}

    /** 从公开任务页复制字段。 */
    private static CacheValue from(TaskPage page) {
      CacheValue value = new CacheValue();
      value.items = new ArrayList<Item>();
      for (TaskResponse task : page.items) {
        value.items.add(Item.from(task));
      }
      value.nextPageToken = page.nextPageToken;
      return value;
    }

    /** 校验项目、筛选和分页 token 后恢复公开页。 */
    private TaskPage toPage(String projectId, String status, int pageSize) {
      if (items == null || items.size() > pageSize || (items.isEmpty() && nextPageToken != null)) {
        throw new IllegalArgumentException("Task list cache page is invalid");
      }
      List<TaskResponse> tasks = new ArrayList<TaskResponse>();
      for (Item item : items) {
        if (item == null
            || item.id == null
            || item.projectId == null
            || item.title == null
            || item.dueAt == null
            || item.assignee == null
            || item.status == null
            || !projectId.equals(item.projectId)
            || (status != null && !status.equals(item.status))
            || item.version < 0) {
          throw new IllegalArgumentException("Task list cache item is invalid");
        }
        tasks.add(
            new TaskResponse(
                item.id,
                item.projectId,
                item.title,
                item.dueAt,
                item.assignee,
                item.status,
                item.version));
      }
      validateNextToken(nextPageToken, projectId, status);
      return new TaskPage(tasks, nextPageToken);
    }

    /** 校验下一页 token 仍属于当前项目和筛选。 */
    private void validateNextToken(String token, String projectId, String status) {
      if (token == null) {
        return;
      }
      String prefix = "TASK-PAGE-" + projectId + "-" + (status == null ? "ALL" : status) + "-";
      if (!token.startsWith(prefix)) {
        throw new IllegalArgumentException("Task list cache token is invalid");
      }
      String position = token.substring(prefix.length());
      try {
        int value = Integer.parseInt(position);
        if (value <= 1 || !position.equals(Integer.toString(value))) {
          throw new IllegalArgumentException("Task list cache token is invalid");
        }
      } catch (NumberFormatException exception) {
        throw new IllegalArgumentException("Task list cache token is invalid", exception);
      }
    }
  }

  /** 任务页中的公开字段。 */
  public static final class Item {
    public String id;
    public String projectId;
    public String title;
    public String dueAt;
    public String assignee;
    public String status;
    public long version;

    /** 供 Jackson 创建列表项。 */
    public Item() {}

    /** 从任务响应复制字段。 */
    private static Item from(TaskResponse task) {
      Item item = new Item();
      item.id = task.id;
      item.projectId = task.projectId;
      item.title = task.title;
      item.dueAt = task.dueAt;
      item.assignee = task.assignee;
      item.status = task.status;
      item.version = task.version;
      return item;
    }
  }
}
