package dev.teamflow.cache;

import dev.teamflow.application.TeamFlowBadRequestException;
import dev.teamflow.application.TeamFlowConflictException;
import dev.teamflow.application.TaskCreationService;
import dev.teamflow.application.TaskCreationService.CreateTaskCommand;
import dev.teamflow.application.TaskCreationService.TaskResult;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.concurrent.TimeUnit;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/** 使用带 TTL 的 Redis 状态机原子占用任务创建请求。 */
@Service
public class IdempotentTaskCreator {
  private static final long PROCESSING_TTL_MILLIS = 120000L;
  private static final long RESULT_TTL_MILLIS = 86400000L;
  private static final String KEY_PREFIX = "teamflow:idempotency:v1:task-create:";

  private final TaskCreationService taskCreationService;
  private final StringRedisTemplate redisTemplate;
  private final TaskCacheCoordinator taskCacheCoordinator;

  /**
   * 注入任务真相源和幂等状态存储。
   *
   * @param taskCreationService 事务内任务创建用例
   * @param redisTemplate Redis 访问入口
   * @param taskCacheCoordinator 任务缓存协调器
   */
  public IdempotentTaskCreator(
      TaskCreationService taskCreationService,
      StringRedisTemplate redisTemplate,
      TaskCacheCoordinator taskCacheCoordinator) {
    this.taskCreationService = taskCreationService;
    this.redisTemplate = redisTemplate;
    this.taskCacheCoordinator = taskCacheCoordinator;
  }

  /**
   * 竞争首次执行权，并创建或回放完整任务响应。
   *
   * @param projectId 项目 ID
   * @param idempotencyKey 客户端幂等键
   * @param command 创建命令
   * @param actor 当前认证用户
   * @return 首次或重放结果
   */
  public CreationResult create(
      String projectId,
      String idempotencyKey,
      CreateTaskCommand command,
      String actor) {
    validateKey(idempotencyKey);
    String redisKey = redisKey(actor, projectId, idempotencyKey);
    String fingerprint = requestFingerprint(command);
    String existing = redisTemplate.opsForValue().get(redisKey);
    if (existing != null) {
      return resolve(existing, fingerprint, projectId);
    }
    taskCreationService.validateProject(projectId);

    String pending = "PENDING|" + fingerprint;
    if (claim(redisKey, pending)) {
      return executeFirstRequest(redisKey, fingerprint, command);
    }
    existing = redisTemplate.opsForValue().get(redisKey);
    if (existing != null) {
      return resolve(existing, fingerprint, projectId);
    }
    if (claim(redisKey, pending)) {
      return executeFirstRequest(redisKey, fingerprint, command);
    }
    existing = redisTemplate.opsForValue().get(redisKey);
    if (existing == null) {
      throw new TeamFlowConflictException(
          "IDEMPOTENCY_STATE_MISSING", "Idempotency state disappeared during claim");
    }
    return resolve(existing, fingerprint, projectId);
  }

  /** 只有获得 SET NX 的请求才进入数据库副作用。 */
  private CreationResult executeFirstRequest(
      String redisKey,
      String fingerprint,
      CreateTaskCommand command) {
    TaskResult task;
    try {
      task = taskCreationService.create(command);
    } catch (TeamFlowConflictException exception) {
      saveFailed(redisKey, fingerprint, exception.getCode());
      throw exception;
    }
    taskCacheCoordinator.advanceTaskList(command.projectId);
    redisTemplate
        .opsForValue()
        .set(redisKey, completedState(fingerprint, task), RESULT_TTL_MILLIS, TimeUnit.MILLISECONDS);
    return new CreationResult(task, false);
  }

  /** 根据已有有限状态决定回放或冲突。 */
  private CreationResult resolve(String stored, String fingerprint, String projectId) {
    String[] parts = stored.split("\\|", -1);
    if (parts.length < 2) {
      throw new TeamFlowConflictException(
          "IDEMPOTENCY_STATE_INVALID", "Stored idempotency state is invalid");
    }
    if (!parts[1].equals(fingerprint)) {
      throw new TeamFlowConflictException(
          "IDEMPOTENCY_KEY_REUSED", "Idempotency-Key is bound to another request");
    }
    if ("PENDING".equals(parts[0]) && parts.length == 2) {
      throw new TeamFlowConflictException(
          "IDEMPOTENCY_IN_PROGRESS", "Idempotent request is still being processed");
    }
    if ("FAILED".equals(parts[0]) && parts.length == 3) {
      try {
        String errorCode = decode(parts[2]);
        if (!errorCode.matches("[A-Z][A-Z0-9_]{0,63}")) {
          throw new IllegalArgumentException("error code is invalid");
        }
        throw new TeamFlowConflictException(
            errorCode, "Idempotent request previously failed", true);
      } catch (IllegalArgumentException exception) {
        throw new TeamFlowConflictException(
            "IDEMPOTENCY_STATE_INVALID", "Stored idempotency state is invalid");
      }
    }
    if (!"COMPLETED".equals(parts[0]) || parts.length != 3) {
      throw new TeamFlowConflictException(
          "IDEMPOTENCY_STATE_INVALID", "Stored idempotency state is invalid");
    }
    try {
      String[] response = decode(parts[2]).split("\\|", -1);
      if (response.length != 7) {
        throw new IllegalArgumentException("response field count is invalid");
      }
      TaskResult task =
          new TaskResult(
              decode(response[0]),
              decode(response[1]),
              decode(response[2]),
              decode(response[3]),
              decode(response[4]),
              decode(response[5]),
              Long.parseLong(response[6]));
      if (!validTask(task, projectId)) {
        throw new IllegalArgumentException("response fields are invalid");
      }
      return new CreationResult(task, true);
    } catch (IllegalArgumentException exception) {
      throw new TeamFlowConflictException(
          "IDEMPOTENCY_STATE_INVALID", "Stored idempotency state is invalid");
    }
  }

  /** 保存可稳定回放的业务失败态；写入失败直接暴露依赖故障。 */
  private void saveFailed(String redisKey, String fingerprint, String errorCode) {
    redisTemplate
        .opsForValue()
        .set(
            redisKey,
            "FAILED|" + fingerprint + "|" + encode(errorCode),
            RESULT_TTL_MILLIS,
            TimeUnit.MILLISECONDS);
  }

  /** 使用 SET NX 与处理 TTL 原子占用。 */
  private boolean claim(String redisKey, String pending) {
    Boolean claimed =
        redisTemplate
            .opsForValue()
            .setIfAbsent(redisKey, pending, PROCESSING_TTL_MILLIS, TimeUnit.MILLISECONDS);
    return Boolean.TRUE.equals(claimed);
  }

  /** 生成可完整回放且不受字段分隔符影响的完成态。 */
  private String completedState(String fingerprint, TaskResult task) {
    String response =
        encode(task.id)
        + "|"
        + encode(task.projectId)
        + "|"
        + encode(task.title)
        + "|"
        + encode(task.dueAt)
        + "|"
        + encode(task.assignee)
        + "|"
        + encode(task.status)
        + "|"
        + task.version;
    return "COMPLETED|" + fingerprint + "|" + encode(response);
  }

  /** 确认回放响应仍属于当前项目且字段完整。 */
  private boolean validTask(TaskResult task, String projectId) {
    return task.id != null
        && !task.id.isEmpty()
        && projectId.equals(task.projectId)
        && task.title != null
        && !task.title.isEmpty()
        && task.dueAt != null
        && !task.dueAt.isEmpty()
        && task.assignee != null
        && !task.assignee.isEmpty()
        && "IN_PROGRESS".equals(task.status)
        && task.version == 0L;
  }

  /** 校验客户端幂等键的长度和可见 ASCII 合同。 */
  private void validateKey(String idempotencyKey) {
    if (idempotencyKey == null || idempotencyKey.length() < 1 || idempotencyKey.length() > 128) {
      throw new TeamFlowBadRequestException(
          "INVALID_IDEMPOTENCY_KEY", "Idempotency-Key must contain 1 to 128 visible ASCII characters");
    }
    for (int index = 0; index < idempotencyKey.length(); index++) {
      char value = idempotencyKey.charAt(index);
      if (value < 0x21 || value > 0x7e) {
        throw new TeamFlowBadRequestException(
            "INVALID_IDEMPOTENCY_KEY", "Idempotency-Key must contain 1 to 128 visible ASCII characters");
      }
    }
  }

  /** @return 不暴露原始用户和幂等键的 Redis key */
  private String redisKey(String actor, String projectId, String idempotencyKey) {
    String scope =
        "v1|actor="
            + encode(actor)
            + "|project="
            + encode(projectId)
            + "|key="
            + encode(idempotencyKey);
    return KEY_PREFIX + sha256(scope);
  }

  /** @return 固定字段顺序和版本的请求指纹 */
  private String requestFingerprint(CreateTaskCommand request) {
    String canonical =
        "v1|title="
            + encodeNullable(request.title)
            + "|dueAt="
            + encodeNullable(request.dueAt)
            + "|assignee="
            + encodeNullable(request.assignee);
    return sha256(canonical);
  }

  /** @return 保留 null 语义的 Base64URL 字段 */
  private String encodeNullable(String value) {
    return value == null ? "~" : encode(value);
  }

  /** @return 不含状态分隔符的 UTF-8 Base64URL 字段 */
  private String encode(String value) {
    return Base64.getUrlEncoder()
        .withoutPadding()
        .encodeToString(value.getBytes(StandardCharsets.UTF_8));
  }

  /** @return Base64URL 字段对应的 UTF-8 文本 */
  private String decode(String value) {
    return new String(Base64.getUrlDecoder().decode(value), StandardCharsets.UTF_8);
  }

  /** @return 小写十六进制 SHA-256 */
  private String sha256(String value) {
    try {
      byte[] digest =
          MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
      StringBuilder result = new StringBuilder(digest.length * 2);
      for (byte item : digest) {
        result.append(String.format("%02x", item & 0xff));
      }
      return result.toString();
    } catch (NoSuchAlgorithmException exception) {
      throw new IllegalStateException("SHA-256 is required by the Java runtime", exception);
    }
  }

  /** 描述首次创建或完成态回放。 */
  public static final class CreationResult {
    public final TaskResult task;
    public final boolean replayed;

    /**
     * 创建幂等结果。
     *
     * @param task 完整任务响应
     * @param replayed 是否来自已完成状态
     */
    private CreationResult(TaskResult task, boolean replayed) {
      this.task = task;
      this.replayed = replayed;
    }
  }
}
