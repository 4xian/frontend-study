package dev.teamflow.cache;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/** 负责项目分页缓存的键、值和 TTL 合同。 */
@Service
public class ProjectPageCache {
  private static final Duration TTL = Duration.ofSeconds(60);
  private static final String KEY_PREFIX = "teamflow:cache:project-list:v1:";
  private static final String GENERATION_KEY = "teamflow:cache:project-list-generation:v1";

  private final StringRedisTemplate redisTemplate;
  private final MembershipChangeGuard membershipChangeGuard;

  /**
   * 注入 Redis 字符串访问入口。
   *
   * @param redisTemplate Redis 访问入口
   * @param membershipChangeGuard 成员变更护栏
   */
  public ProjectPageCache(
      StringRedisTemplate redisTemplate, MembershipChangeGuard membershipChangeGuard) {
    this.redisTemplate = redisTemplate;
    this.membershipChangeGuard = membershipChangeGuard;
  }

  /** @return 当前项目列表代次；缺失 key 表示 0 且不会创建 key */
  public long currentGeneration() {
    String stored = redisTemplate.opsForValue().get(GENERATION_KEY);
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
      throw new TeamFlowCacheStateException("Project list cache generation is invalid", exception);
    }
  }

  /** @return Redis 原子推进后的项目列表代次 */
  public long advance() {
    currentGeneration();
    Long next = redisTemplate.opsForValue().increment(GENERATION_KEY);
    if (next == null || next < 1L) {
      throw new IllegalStateException("Project list cache generation cannot advance");
    }
    return next;
  }

  /**
   * 读取指定主体和代次缓存的项目页 JSON。
   *
   * @param scope 当前主体的缓存作用域
   * @param generation 项目列表代次
   * @param pageSize 单页数量
   * @param pageToken 不透明分页令牌
   * @return 缓存的项目页 JSON，未命中时为空
   */
  public String get(String scope, long generation, int pageSize, String pageToken) {
    membershipChangeGuard.requireStable();
    return redisTemplate.opsForValue().get(key(scope, generation, pageSize, pageToken));
  }

  /**
   * 写入与公开响应同形的项目页 JSON。
   *
   * @param scope 当前主体的缓存作用域
   * @param generation 项目列表代次
   * @param pageSize 单页数量
   * @param pageToken 不透明分页令牌
   * @param value 项目页 JSON
   */
  public void put(
      String scope, long generation, int pageSize, String pageToken, String value) {
    membershipChangeGuard.requireStable();
    redisTemplate.opsForValue().set(key(scope, generation, pageSize, pageToken), value, TTL);
  }

  /** @return 不暴露原始主体与分页参数的缓存键 */
  private String key(String scope, long generation, int pageSize, String pageToken) {
    String encodedScope =
        Base64.getUrlEncoder()
            .withoutPadding()
            .encodeToString(scope.getBytes(StandardCharsets.UTF_8));
    String encodedToken =
        pageToken == null
            ? "~"
            : Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(pageToken.getBytes(StandardCharsets.UTF_8));
    return KEY_PREFIX
        + "scope:"
        + encodedScope
        + ":g"
        + generation
        + ":size:"
        + pageSize
        + ":token:"
        + encodedToken;
  }
}
