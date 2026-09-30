package dev.teamflow.cache;

import java.util.Collections;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

/** 在成员关系变更期间阻止读取或写入可能过期的授权缓存。 */
@Service
public class MembershipChangeGuard {
  private static final String KEY = "teamflow:cache:membership-change-guard:v1";
  private static final long TTL_MILLIS = 120000L;
  private static final DefaultRedisScript<Long> RELEASE_SCRIPT =
      new DefaultRedisScript<>(
          "if redis.call('get', KEYS[1]) == ARGV[1] then "
              + "return redis.call('del', KEYS[1]) else return 0 end",
          Long.class);

  private final StringRedisTemplate redisTemplate;

  /**
   * 保存 Redis 字符串访问入口。
   *
   * @param redisTemplate Redis 访问入口
   */
  public MembershipChangeGuard(StringRedisTemplate redisTemplate) {
    this.redisTemplate = redisTemplate;
  }

  /**
   * 以唯一 token 建立长于全部授权缓存 TTL 的成员变更护栏。
   *
   * @return 当前变更持有的唯一 token
   */
  public String acquire() {
    String token = UUID.randomUUID().toString();
    Boolean acquired =
        redisTemplate.opsForValue().setIfAbsent(KEY, token, TTL_MILLIS, TimeUnit.MILLISECONDS);
    if (!Boolean.TRUE.equals(acquired)) {
      throw new DataAccessResourceFailureException(
          "Membership authorization cache is temporarily guarded");
    }
    return token;
  }

  /** 当前存在成员变更护栏时失败关闭缓存访问。 */
  public void requireStable() {
    if (Boolean.TRUE.equals(redisTemplate.hasKey(KEY))) {
      throw new DataAccessResourceFailureException(
          "Membership authorization cache is temporarily guarded");
    }
  }

  /**
   * 仅由仍持有同一 token 的变更释放护栏。
   *
   * @param token 当前变更的唯一 token
   */
  public void release(String token) {
    redisTemplate.execute(RELEASE_SCRIPT, Collections.singletonList(KEY), token);
  }
}
