package dev.teamflow.cache;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Arrays;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

/** 管理邮箱变更验证码的短生命周期 Redis 状态。 */
@Service
public class VerificationCodeService {
  private static final Duration CODE_TTL = Duration.ofMinutes(5);
  private static final Duration ATTEMPT_TTL = Duration.ofMinutes(10);
  private static final long MAX_FAILURES = 5L;
  private static final DefaultRedisScript<String> VERIFY_SCRIPT =
      new DefaultRedisScript<>(
          "local attempts = redis.call('GET', KEYS[2])\n"
              + "if attempts then\n"
              + "  if not string.match(attempts, '^[0-5]$') then return 'STATE_INVALID' end\n"
              + "  if tonumber(attempts) >= tonumber(ARGV[2]) then return 'TOO_MANY_ATTEMPTS' end\n"
              + "end\n"
              + "local code = redis.call('GET', KEYS[1])\n"
              + "if not code then return 'EXPIRED' end\n"
              + "if string.match(ARGV[1], '^%d%d%d%d%d%d$') and code == ARGV[1] then\n"
              + "  redis.call('DEL', KEYS[1], KEYS[2])\n"
              + "  return 'VERIFIED'\n"
              + "end\n"
              + "if not attempts then\n"
              + "  redis.call('SET', KEYS[2], '0', 'PX', ARGV[3], 'NX')\n"
              + "end\n"
              + "local failures = redis.call('INCR', KEYS[2])\n"
              + "if failures >= tonumber(ARGV[2]) then return 'TOO_MANY_ATTEMPTS' end\n"
              + "return 'INVALID'",
          String.class);

  private final StringRedisTemplate redisTemplate;
  private final VerificationCodeSender codeSender;
  private final SecureRandom secureRandom = new SecureRandom();
  private final String codePrefix;
  private final String attemptPrefix;

  /** 保存 Redis、发送适配器和 key 命名边界。 */
  public VerificationCodeService(
      StringRedisTemplate redisTemplate,
      VerificationCodeSender codeSender,
      @Value("${teamflow.verification.code-prefix}") String codePrefix,
      @Value("${teamflow.verification.attempt-prefix}") String attemptPrefix) {
    this.redisTemplate = redisTemplate;
    this.codeSender = codeSender;
    this.codePrefix = codePrefix;
    this.attemptPrefix = attemptPrefix;
  }

  /** 生成并发送新验证码，同时保留仍在失败窗口内的计数。 */
  public void issue(String userId) {
    String code = nextCode();
    redisTemplate.opsForValue().set(codeKey(userId), code, CODE_TTL);
    redisTemplate.opsForValue().setIfAbsent(attemptKey(userId), "0", ATTEMPT_TTL);
    codeSender.send(userId, code);
  }

  /** @return 当前验证码的校验结果 */
  public VerificationResult verify(String userId, String submittedCode) {
    String result =
        redisTemplate.execute(
            VERIFY_SCRIPT,
            Arrays.asList(codeKey(userId), attemptKey(userId)),
            submittedCode == null ? "" : submittedCode,
            Long.toString(MAX_FAILURES),
            Long.toString(ATTEMPT_TTL.toMillis()));
    if (result == null) {
      throw new IllegalStateException("Verification state cannot be evaluated");
    }
    if ("STATE_INVALID".equals(result)) {
      throw new TeamFlowCacheStateException(
          "Verification attempt counter is invalid",
          new IllegalArgumentException("attempt counter is not canonical"));
    }
    try {
      return VerificationResult.valueOf(result);
    } catch (IllegalArgumentException exception) {
      throw new TeamFlowCacheStateException("Verification result is invalid", exception);
    }
  }

  /** 生成保留前导零的六位数字验证码。 */
  private String nextCode() {
    return String.format(java.util.Locale.ROOT, "%06d", secureRandom.nextInt(1_000_000));
  }

  /** @return 当前用户的验证码 key */
  private String codeKey(String userId) {
    return codePrefix + ":" + userId;
  }

  /** @return 当前用户的失败计数 key */
  private String attemptKey(String userId) {
    return attemptPrefix + ":" + userId;
  }

  /** 验证码公开结果。 */
  public enum VerificationResult {
    VERIFIED,
    INVALID,
    EXPIRED,
    TOO_MANY_ATTEMPTS
  }
}
