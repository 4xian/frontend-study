package dev.teamflow.cache;

/** 表示 Redis 中的受控缓存值不符合当前 schema。 */
public class TeamFlowCacheStateException extends RuntimeException {
  /** 保存稳定说明与根因。 */
  public TeamFlowCacheStateException(String message, Throwable cause) {
    super(message, cause);
  }
}

