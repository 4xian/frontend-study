---
id: backend.java.learn.intermediate.verification-code
type: lesson
title: 验证码
summary: 使用 SecureRandom 与 Redis 短状态实现可限速、成功即消费的一次性数字验证码
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 180
prerequisites:
  - backend.java.learn.intermediate.cache-invalidation
objectives:
  - 能区分一次性验证码、密码和完整身份认证，并为本课固定正确的业务边界。
  - 能使用 SecureRandom 生成保留前导零的六位数字验证码。
  - 能使用 Redis 的带 TTL 字符串值保存验证码，并为失败次数建立独立窗口。
  - 能实现错误不消费、成功后删除和过期后不可用的验证状态机。
  - 能解释重新签发为什么覆盖旧验证码却不能重置连续失败次数。
  - 能通过 INCR 限制猜测次数，并说明 GET、比较、DEL 之间尚未原子化的并发窗口。
  - 能在 Spring Boot 4.1.x 与 2.3.12.RELEASE 两条版本线上保持相同的服务控制流。
recap:
  - 验证码是短生命周期、一次成功即消费的业务状态，不是密码，也不是完整登录认证。
  - 六位数字码使用 SecureRandom 生成，Redis 的验证码 key 与失败计数 key 分开命名并分别设置 TTL。
  - 错误验证码只增加失败计数，不删除正确验证码；正确验证码先删除 code，再清理计数。
  - 重新签发用 set 覆盖旧 code，用 setIfAbsent 保留失败窗口内已有的计数。
  - INCR 是原子计数，但本课的 GET、比较、DEL 仍存在并发双验窗口。
  - Redis 连接失败是依赖故障，不能伪装成验证码错误，也不能偷偷回退到本机内存。
  - Lua 的比较后原子删除、事务、锁和完整身份认证留给后续课程。
related:
  - backend.java.learn.intermediate.cache-invalidation
  - backend.java.learn.intermediate.redis-web-integration
tags:
  - Java
  - Spring Boot
  - Redis
  - SecureRandom
  - 一次性验证码
  - 限速
  - TeamFlow
appliesTo: JDK 25 与 Spring Boot 4.1.x 主线；Java 8 与 Spring Boot 2.3.12.RELEASE 兼容线；Redis Open Source 8.x
verifiedAt: 2026-08-21
sources:
  - id: java-25-securerandom
    title: Java SE 25 SecureRandom API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/security/SecureRandom.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - SecureRandom 提供适合安全用途的强随机数生成器。
      - nextInt(bound) 返回从零含、bound 不含的均匀整数。
  - id: java-8-securerandom
    title: Java SE 8 SecureRandom API
    url: https://docs.oracle.com/javase/8/docs/api/java/security/SecureRandom.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 同样提供 SecureRandom 与 nextInt(int) API。
  - id: nist-800-63b-otp
    title: 'NIST SP 800-63B: Digital Identity Guidelines'
    url: https://pages.nist.gov/800-63-4/sp800-63b.html
    sourceOrigin: official
    sourceType: security-standard
    appliesTo: NIST 数字身份验证器指导；本课仅采用短数字秘密的通用安全约束
    claims:
      - 少于 64 bit 的随机秘密必须限速，随机数字秘密至少使用六位十进制数字。
      - 随机秘密有效期不应超过十分钟，并且同一个秘密只能成功接受一次。
      - 生成新秘密不能重置已有的失败计数。
      - 本课邮箱变更确认码不是 NIST 定义的完整带外身份认证流程。
  - id: owasp-forgot-password
    title: OWASP Forgot Password Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html
    sourceOrigin: official
    sourceType: security-standard
    appliesTo: Web 短期恢复码和重置流程的安全建议
    claims:
      - 短期 code 应使用密码学安全随机源、合理过期、单次使用和失败限速。
      - 成功使用后应立即使 code 失效，错误尝试不能泄露有效秘密。
  - id: redis-set-command-verification
    title: Redis SET Command
    url: https://redis.io/docs/latest/commands/set/
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Redis Open Source 8.x
    claims:
      - SET 可以在写入字符串值时同时设置过期时间。
  - id: redis-incr-command-verification
    title: Redis INCR Command
    url: https://redis.io/docs/latest/commands/incr/
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Redis Open Source 8.x
    claims:
      - INCR 对字符串整数执行原子递增，适合记录失败次数。
      - INCR 与 EXPIRE 分开执行时存在异常中断后留下永久 key 的风险。
  - id: spring-data-redis-41-value-operations
    title: Spring Data Redis ValueOperations API - Spring Data Redis 4.1
    url: https://docs.spring.io/spring-data/redis/docs/4.1.x/api/org/springframework/data/redis/core/ValueOperations.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Data Redis 4.1.x
    claims:
      - get、set 的 Duration 重载和 setIfAbsent(key, value, Duration) 可用于本课状态写入。
      - getAndDelete 是较新版本 API，不能据此推断兼容线可用。
  - id: spring-data-redis-239-value-operations
    title: Spring Data Redis ValueOperations API - Spring Data Redis 2.3.9.RELEASE
    url: https://docs.spring.io/spring-data/redis/docs/2.3.9.RELEASE/api/org/springframework/data/redis/core/ValueOperations.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Data Redis 2.3.9.RELEASE
    claims:
      - Java 8 兼容线提供 get、set 的 Duration 重载和 setIfAbsent(key, value, Duration)。
      - 该版本没有 getAndDelete，因此两版不能声称共享原子消费 API。
  - id: redis-getdel-command
    title: Redis GETDEL Command
    url: https://redis.io/docs/latest/commands/getdel/
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Redis Open Source 6.2 及以上
    claims:
      - GETDEL 从 6.2.0 起提供读取并删除的原子操作，但它不包含验证码比较条件。
---

# 验证码

用户修改邮箱时，系统需要确认“这次操作确实收到了发送到目标邮箱的短消息”。这枚验证码只承担一次短期确认：
它不是用户密码，不代表用户已经登录，也不替代后续课程中的会话、JWT、角色和权限。

本课使用 TeamFlow 的邮箱变更确认作为场景。服务为稳定的用户 ID 签发六位数字码，把短状态放进 Redis，错误输入
保留正确码，成功输入立即消费；连续猜错达到上限后，在失败窗口内拒绝继续尝试。这样一个小流程同时连接了随机数、
TTL、计数和 Web 状态，但不会把 Redis 变成身份认证系统。

## 一、先固定验证码合同

### 1. 一次性验证码不等于密码

密码是长期凭据，通常由用户主动设置并由专门的密码存储策略保护。验证码是服务端临时生成、通过外部渠道发送、
在很短时间内只接受一次的随机秘密。两者都不能直接说明“请求已经有权修改任意用户数据”：邮箱地址、当前会话、
CSRF 防护和真正的授权边界仍由其他层负责。

本课只验证一个已确定场景：用户 ID 是 `USR-1` 这样的稳定内部标识，发送端口把 code 交给邮箱适配器，Redis 记录
该场景的短状态。不要把完整邮箱地址直接拼进 key，也不要把验证码放进 HTTP 响应；示例的本地发送适配器会在日志中
打印 code 只是为了观察，不能复制到生产环境。

### 2. 把流程写成状态机

一枚验证码经历的状态变化如下：

| 时刻 | Redis code 状态 | 失败计数 | 可以发生的动作 |
| --- | --- | --- | --- |
| 签发后 | 六位 code，TTL 约五分钟 | 不存在时初始化为 `0`，窗口约十分钟 | 发送 code |
| 错误验证 | code 保留 | 原子加一 | 返回错误，仍可继续直到上限 |
| 成功验证 | 删除 code | 删除计数 | 返回成功；再次提交只能失败 |
| TTL 到期 | key 不存在 | 失败窗口也会到期 | 返回已失效 |
| 达到上限 | code 可以仍存在 | 计数达到 `5` | 拒绝继续猜测，直到失败窗口结束 |

“成功即消费”和“错误不消费”是两个同时存在的条件。只使用 Redis 的 `GETDEL` 会无条件删除，无法满足第二个条件；
本课因此采用容易读懂的 `GET -> 比较 -> DEL`，并诚实标注它尚未覆盖并发双验。

### 3. 两个 key 表达两个不同状态

验证码和失败次数不能共用一个字符串值。采用稳定的场景前缀、schema 版本和内部 ID：

```text
teamflow:verification-code:v1:email-change:USR-1
teamflow:verification-attempts:v1:email-change:USR-1
```

第一个 key 的值是六位数字字符串，第二个 key 的值是十进制失败次数。key 不含邮箱等 PII；如果将来更换 code 的
格式或 JSON 结构，只递增 `v1` 这一段即可避免新旧状态互读。

## 二、生成并保存短状态

### 1. SecureRandom 和六位数字

`Random` 适合一般模拟，不适合验证码。`SecureRandom` 是 JDK 提供的安全用途随机源；`nextInt(1_000_000)` 的上界
不包含在结果中，因此完整范围是 `0` 到 `999999`。再用 `%06d` 格式化，`42` 会变成 `000042`，不会因为前导零被当成
短码或整数丢失一位。

```java
import java.security.SecureRandom;
import java.util.Locale;

/** 生成保留前导零的六位数字验证码。 */
public final class VerificationCodeGeneratorDemo {
    private final SecureRandom secureRandom = new SecureRandom();

    /** @return 一枚六位数字验证码 */
    public String nextCode() {
        return String.format(Locale.ROOT, "%06d", secureRandom.nextInt(1_000_000));
    }

    /** 输出一枚验证码的形状，不输出真实业务状态。 */
    public static void main(String[] args) {
        String code = new VerificationCodeGeneratorDemo().nextCode();
        System.out.println("code=" + code + ", length=" + code.length());
    }
}
```

每次运行的数字不同，但 `length` 必须是 `6`，并且只包含 `0` 到 `9`。`SecureRandom` 在 Java 8 已存在，因此生成器
两条版本线相同；版本差异不在随机数 API，而在 Spring Data Redis 的依赖版本。

### 2. 一次写入同时带 TTL

验证码不应先 `SET` 再补 `EXPIRE`。两条命令之间如果进程崩溃，就可能留下没有过期时间的验证码。Spring Data Redis 的
`set(key, value, Duration)` 将值和 TTL 一起交给 Redis；本课固定 code TTL 为五分钟，低于十分钟的安全上界。

```java
private static final Duration CODE_TTL = Duration.ofMinutes(5);

/** 写入一枚五分钟后自动失效的验证码。 */
private void saveCode(String key, String code) {
    redisTemplate.opsForValue().set(key, code, CODE_TTL);
}
```

Redis 中观察到的 `TTL` 是动态剩余秒数，不应断言它永远等于 `300`。刚写入后应当大于 `0` 且不超过 `300`；睡眠、
网络往返和 Redis 调度都会让读到的数值继续下降。

### 3. 重新签发不重置失败计数

重新签发时直接 `set(codeKey, newCode, CODE_TTL)`，旧 code 立即被覆盖。失败计数则使用
`setIfAbsent(attemptKey, "0", ATTEMPT_TTL)`：只有 key 尚不存在时才初始化，已有的 `4` 不会被写回 `0`。

```java
/** 覆盖旧码，并只在失败窗口不存在时建立零计数。 */
private void saveIssuedState(String codeKey, String attemptKey, String code) {
    redisTemplate.opsForValue().set(codeKey, code, CODE_TTL);
    redisTemplate.opsForValue().setIfAbsent(attemptKey, "0", ATTEMPT_TTL);
}
```

这意味着达到五次失败后重新签发仍不能立即绕过封锁。失败窗口自然到期后，下一次签发才会建立新的 `0`。不要在“发送
新码”的代码里无条件执行 `DEL attemptKey` 或 `set(..., "0", ...)`。

## 三、验证与消费顺序

### 1. 先看失败上限，再读取 code

验证入口首先读取失败计数。如果计数已经达到 `5`，直接返回 `TOO_MANY_ATTEMPTS`，即使 Redis 中旧 code 还剩几分钟也
不能继续猜测。这样重新签发只替换秘密，不会重置节流窗口。

计数 key 不存在时再读取 code。不存在可能代表从未签发、已经过期或成功消费。本课保留 `EXPIRED` 结果，让学习者能从
HTTP 反馈区分“值还在但不匹配”和“值已经不存在”；正式身份接口若不应暴露内部历史，可以在 Web adapter 中把
`INVALID` 与 `EXPIRED` 映射成同一安全文案，但不能改变 Service 的删除顺序。

### 2. 错误输入只增加计数

取出 code 后比较提交值。空值、不是六位数字或数字不相等，都走同一个失败计数入口：

```java
/** 记录一次错误输入，并在达到上限时返回封锁结果。 */
private VerificationResult registerFailure(String attemptKey) {
    redisTemplate.opsForValue().setIfAbsent(attemptKey, "0", ATTEMPT_TTL);
    Long failures = redisTemplate.opsForValue().increment(attemptKey);
    return failures != null && failures >= MAX_FAILURES
            ? VerificationResult.TOO_MANY_ATTEMPTS
            : VerificationResult.INVALID;
}
```

`setIfAbsent` 先补齐 TTL，避免异常重启或旧数据造成“只 INCR、不设置过期”的永久计数；随后 `INCR` 在 Redis 中是原子
递增。两条命令仍不是一个 Lua 脚本；当前课只建立短窗口和可观察结果，不把它描述成完整限流原子协议。

### 3. 成功后删除两个 key

正确 code 只接受一次。服务先删除 code，再删除失败计数，最后返回 `VERIFIED`：

```java
/** 比较成功后消费验证码状态。 */
private VerificationResult consume(String codeKey, String attemptKey) {
    redisTemplate.delete(codeKey);
    redisTemplate.delete(attemptKey);
    return VerificationResult.VERIFIED;
}
```

第二次提交会先读到不存在的 code，并返回 `EXPIRED`。错误 code 不调用 `consume`，所以同一枚正确 code 仍然可以在错误
尝试后使用。

### 4. GET、比较、DEL 不是并发原子消费

如果两个请求同时验证同一枚正确 code，两个请求都可能在删除发生前完成 `GET` 和比较，然后都执行 `DEL` 并返回成功。
本课明确把这称为“并发双验窗口”，不称为强一致或原子一次性消费。

Redis 6.2 的 `GETDEL` 只能无条件读取并删除；错误输入如果先 GETDEL，会把有效 code 消耗掉。Spring Data Redis 4.1
有较新的 `getAndDelete`，但兼容线管理的 2.3.9 没有它，而且它同样没有“比较后才删除”的条件。需要关闭这个窗口时，
应在 Lua 中让 Redis 服务端完成读取、比较、计数和匹配后删除，或在已经确认的原子协议课程中实现；不要在本课偷偷加入
Lua、事务或分布式锁。

## 四、建立现代版验证码服务

### 1. 从缓存失效工程继续

复制上一课已经完成的 `teamflow-cache-invalidation-modern`，命名为 `teamflow-verification-code-modern`。已有
`TeamFlowApplication`、MySQL、MyBatis、Flyway、任务 Controller 和 Redis 配置全部保留，不创建第二个启动类。
本课新增的文件集中在已有启动类的子包中：

```text
teamflow-verification-code-modern/
├── pom.xml                                      # 保留上一课，已有 Redis starter
├── src/main/java/com/teamflow/api/verification/
│   ├── VerificationCodeGenerator.java
│   ├── SecureRandomVerificationCodeGenerator.java
│   ├── VerificationCodeSender.java
│   ├── CourseVerificationCodeSender.java
│   ├── VerificationResult.java
│   ├── VerificationCodeService.java
│   ├── VerificationCodeRequest.java
│   ├── VerificationCodeResponse.java
│   └── VerificationCodeController.java
└── src/main/resources/application.properties
```

POM 不需要新增依赖：上一课已经加入 `spring-boot-starter-data-redis`，本课使用同一个 `StringRedisTemplate`。如果
实际副本缺少该 starter，应先按上一课的 POM 补齐；不要在本课换成另一个 Redis 客户端。

### 2. 配置 Redis key 前缀

在现代工程的 `application.properties` 追加：

```properties
spring.data.redis.host=${TEAMFLOW_REDIS_HOST:127.0.0.1}
spring.data.redis.port=${TEAMFLOW_REDIS_PORT:6379}
spring.data.redis.password=${TEAMFLOW_REDIS_PASSWORD:}
spring.data.redis.connect-timeout=2s
spring.data.redis.timeout=2s
teamflow.verification.code-prefix=${TEAMFLOW_VERIFICATION_CODE_PREFIX:teamflow:verification-code:v1:email-change}
teamflow.verification.attempt-prefix=${TEAMFLOW_VERIFICATION_ATTEMPT_PREFIX:teamflow:verification-attempts:v1:email-change}
```

属性值中的 `v1` 是状态 schema 版本，不是课程编号。连接失败必须让请求暴露依赖故障；不要捕获
`RedisConnectionFailureException` 后改用 `ConcurrentHashMap`，否则现代线与兼容线会在生产中出现两种完全不同的状态语义。

### 3. 编写服务端口与结果

`VerificationCodeGenerator.java`：

```java
package com.teamflow.api.verification;

/** 生成可发送的一次性验证码。 */
public interface VerificationCodeGenerator {
    /** @return 一枚新的六位数字验证码 */
    String nextCode();
}
```

`VerificationCodeSender.java`：

```java
package com.teamflow.api.verification;

/** 把验证码交给外部发送渠道。 */
public interface VerificationCodeSender {
    /** 向指定用户发送验证码。 */
    void send(String userId, String code);
}
```

`VerificationResult.java`：

```java
package com.teamflow.api.verification;

/** 描述一次验证码校验的公开结果。 */
public enum VerificationResult {
    VERIFIED,
    INVALID,
    EXPIRED,
    TOO_MANY_ATTEMPTS
}
```

### 4. 使用 SecureRandom 生成 code

`SecureRandomVerificationCodeGenerator.java`：

```java
package com.teamflow.api.verification;

import java.security.SecureRandom;
import java.util.Locale;
import org.springframework.stereotype.Component;

/** 使用密码学安全随机源生成六位数字验证码。 */
@Component
public class SecureRandomVerificationCodeGenerator implements VerificationCodeGenerator {
    private final SecureRandom secureRandom = new SecureRandom();

    /** @return 保留前导零的六位数字验证码 */
    @Override
    public String nextCode() {
        return String.format(Locale.ROOT, "%06d", secureRandom.nextInt(1_000_000));
    }
}
```

不要把 `SecureRandom` 换成 `Random`、时间戳或 `Math.random()`。生成器单独成为端口，也让临时验证可以提供确定序列；
正式 Spring Bean 仍然只使用 `SecureRandom`。

### 5. 实现公开服务 seam

`VerificationCodeService.java` 的两个公开方法是本课观察边界：`issue` 只负责签发和发送，`verify` 只返回公开结果。
Redis key 拼接、计数和删除都留在服务内部，不让 Controller 读取 Redis：

```java
package com.teamflow.api.verification;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/** 管理邮箱变更验证码的短生命周期 Redis 状态。 */
@Service
public class VerificationCodeService {
    private static final Duration CODE_TTL = Duration.ofMinutes(5);
    private static final Duration ATTEMPT_TTL = Duration.ofMinutes(10);
    private static final long MAX_FAILURES = 5;
    private final StringRedisTemplate redisTemplate;
    private final VerificationCodeGenerator codeGenerator;
    private final VerificationCodeSender codeSender;
    private final String codePrefix;
    private final String attemptPrefix;

    /** 保存 Redis、随机生成、发送与 key 命名边界。 */
    public VerificationCodeService(
            StringRedisTemplate redisTemplate,
            VerificationCodeGenerator codeGenerator,
            VerificationCodeSender codeSender,
            @Value("${teamflow.verification.code-prefix}") String codePrefix,
            @Value("${teamflow.verification.attempt-prefix}") String attemptPrefix) {
        this.redisTemplate = redisTemplate;
        this.codeGenerator = codeGenerator;
        this.codeSender = codeSender;
        this.codePrefix = codePrefix;
        this.attemptPrefix = attemptPrefix;
    }

    /** 生成并发送新验证码，同时保留仍在失败窗口内的计数。 */
    public void issue(String userId) {
        String code = codeGenerator.nextCode();
        redisTemplate.opsForValue().set(codeKey(userId), code, CODE_TTL);
        redisTemplate.opsForValue().setIfAbsent(attemptKey(userId), "0", ATTEMPT_TTL);
        codeSender.send(userId, code);
    }

    /** @return 当前验证码的校验结果 */
    public VerificationResult verify(String userId, String submittedCode) {
        String attemptKey = attemptKey(userId);
        String attempts = redisTemplate.opsForValue().get(attemptKey);
        if (attempts != null && Long.parseLong(attempts) >= MAX_FAILURES) {
            return VerificationResult.TOO_MANY_ATTEMPTS;
        }

        String codeKey = codeKey(userId);
        String storedCode = redisTemplate.opsForValue().get(codeKey);
        if (storedCode == null) {
            return VerificationResult.EXPIRED;
        }
        if (submittedCode != null && submittedCode.matches("[0-9]{6}")
                && matches(storedCode, submittedCode)) {
            redisTemplate.delete(codeKey);
            redisTemplate.delete(attemptKey);
            return VerificationResult.VERIFIED;
        }

        return registerFailure(attemptKey);
    }

    /** 记录一次错误输入，并在达到上限时返回封锁结果。 */
    private VerificationResult registerFailure(String attemptKey) {
        redisTemplate.opsForValue().setIfAbsent(attemptKey, "0", ATTEMPT_TTL);
        Long failures = redisTemplate.opsForValue().increment(attemptKey);
        return failures != null && failures >= MAX_FAILURES
                ? VerificationResult.TOO_MANY_ATTEMPTS
                : VerificationResult.INVALID;
    }

    /** @return 两个验证码的 UTF-8 字节是否一致 */
    private boolean matches(String storedCode, String submittedCode) {
        return MessageDigest.isEqual(
                storedCode.getBytes(StandardCharsets.UTF_8),
                submittedCode.getBytes(StandardCharsets.UTF_8));
    }

    /** @return 当前用户在邮箱变更场景中的验证码 key */
    private String codeKey(String userId) {
        return codePrefix + ":" + userId;
    }

    /** @return 当前用户在邮箱变更场景中的失败计数 key */
    private String attemptKey(String userId) {
        return attemptPrefix + ":" + userId;
    }
}
```

`MessageDigest.isEqual` 只负责比较两个已经得到的字节数组，不会把本课变成完整密码学课程；这里真正要观察的是
状态顺序。Redis 中仍保存短期 code，访问 Redis 的凭据、网络隔离和日志脱敏必须由部署环境负责。

### 6. 本地发送适配器不等于生产日志

真实应用应把 `VerificationCodeSender` 接到邮件供应商或消息队列。本课只提供一个带 `course` profile 的观察适配器，
让学习者能够从应用日志复制刚生成的 code：

```java
package com.teamflow.api.verification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/** 仅在一次性本地课程 profile 中观察发送结果。 */
@Component
@Profile("course")
public class CourseVerificationCodeSender implements VerificationCodeSender {
    private static final Logger LOGGER = LoggerFactory.getLogger(CourseVerificationCodeSender.class);

    /** 输出本地观察所需的发送结果；生产实现不得记录 code。 */
    @Override
    public void send(String userId, String code) {
        LOGGER.info("course-only verification delivery userId={} code={}", userId, code);
    }
}
```

不要在生产 profile 激活这个类。日志、APM、异常追踪和 HTTP body 都不能出现验证码；这里的明文只服务于可重复的本地
反馈环，课程结束后应删除或替换该适配器。

## 五、把服务接入 Web

### 1. 请求与响应 DTO

验证码不是资源详情，不需要把 Redis key 或 TTL 直接暴露给前端。请求只携带提交的六位字符串，响应只携带服务结果。

`VerificationCodeRequest.java`：

```java
package com.teamflow.api.verification;

/** 表示一次验证码验证请求。 */
public final class VerificationCodeRequest {
    private String code;

    /** 创建供 JSON 绑定使用的空请求。 */
    public VerificationCodeRequest() {
    }

    /** 创建带验证码的请求。 */
    public VerificationCodeRequest(String code) {
        this.code = code;
    }

    /** @return 客户端提交的验证码 */
    public String getCode() {
        return code;
    }

    /** 保存客户端提交的验证码。 */
    public void setCode(String code) {
        this.code = code;
    }
}
```

`VerificationCodeResponse.java`：

```java
package com.teamflow.api.verification;

/** 表示一次验证码验证的公开结果。 */
public final class VerificationCodeResponse {
    private final VerificationResult result;

    /** 保存服务端校验结果。 */
    public VerificationCodeResponse(VerificationResult result) {
        this.result = result;
    }

    /** @return 校验结果 */
    public VerificationResult getResult() {
        return result;
    }
}
```

### 2. 增加两个 HTTP 方法

`VerificationCodeController.java`：

```java
package com.teamflow.api.verification;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 提供邮箱变更验证码的签发与验证入口。 */
@RestController
@RequestMapping("/api/v1/users/{userId}/email-change-verification-code")
public class VerificationCodeController {
    private final VerificationCodeService service;

    /** 保存验证码服务。 */
    public VerificationCodeController(VerificationCodeService service) {
        this.service = service;
    }

    /** 签发新码并返回无正文的受理结果。 */
    @PostMapping
    public ResponseEntity<Void> issue(@PathVariable("userId") String userId) {
        service.issue(userId);
        return ResponseEntity.accepted().build();
    }

    /** 验证提交的 code，并返回可观察的业务结果。 */
    @PostMapping("/verification")
    public ResponseEntity<VerificationCodeResponse> verify(
            @PathVariable("userId") String userId,
            @RequestBody VerificationCodeRequest request) {
        VerificationResult result = service.verify(userId, request.getCode());
        return ResponseEntity.ok(new VerificationCodeResponse(result));
    }
}
```

签发请求 `202` 没有 body，不会把 secret 回显给客户端；验证请求处理成功时返回 `200`，`result` 表达
`VERIFIED`、`INVALID`、`EXPIRED` 或 `TOO_MANY_ATTEMPTS`。如果 Redis 连接失败，请让已有全局错误边界报告依赖不可用，
不要把它转换成 `INVALID`。请求体不可读、路径参数和错误响应继续复用前置 Web 课程的合同，本课不另造错误 JSON。

### 3. 先在公开 seam 上观察行为

服务公开的 `issue` 和 `verify` 是本课最小测试 seam。不要测试私有 `codeKey`、`registerFailure` 或 Redis 调用次数；
只从发送端口收到的 code 和 `verify` 返回值判断行为。真实 Redis 反馈还可以用 CLI 查看 TTL 和 key，但它是部署观察，
不能替代服务公开结果的测试。

## 六、建立 Java 8 兼容线

### 1. 复制同一组新增文件

从上一课的 `teamflow-cache-invalidation-java8` 复制为 `teamflow-verification-code-java8`，保留既有启动类、MySQL、
MyBatis、Flyway、Controller 和 Redis starter。把第四、第五章的九个 Java 文件原样放入兼容工程；它们只使用 Java 8
已有的普通类、接口、枚举、`Duration`、`SecureRandom` 和 Spring MVC 注解，没有 record、文本块或 Java 25 专属 API。

### 2. 只调整真实属性前缀

Java 8 `application.properties` 追加：

```properties
spring.redis.host=${TEAMFLOW_REDIS_HOST:127.0.0.1}
spring.redis.port=${TEAMFLOW_REDIS_PORT:6379}
spring.redis.password=${TEAMFLOW_REDIS_PASSWORD:}
spring.redis.timeout=2s
teamflow.verification.code-prefix=${TEAMFLOW_VERIFICATION_CODE_PREFIX:teamflow:verification-code:v1:email-change}
teamflow.verification.attempt-prefix=${TEAMFLOW_VERIFICATION_ATTEMPT_PREFIX:teamflow:verification-attempts:v1:email-change}
```

Boot 2.3.12 管理的是 Spring Data Redis 2.3.9。它有 `get`、带 `Duration` 的 `set` 和 `setIfAbsent`，但没有现代线的
`getAndDelete`；因此新文件不需要也不能把服务替换成那个不存在的 API。两条版本线的 `VerificationCodeService`、
HTTP path、请求字段和响应 JSON 应保持同形。

### 3. 两条线的边界不是只切换 Project SDK

现代工程使用 JDK 25、Spring Boot 4.1.x 与 `spring.data.redis.*`，兼容工程使用真实 Java 8、Spring Boot 2.3.12.RELEASE
与 `spring.redis.*`。切换 IntelliJ Project SDK 不能替代 POM 父版本、Maven Runner JRE 和 Spring Data 依赖的切换。
两套工程要用不同的端口；如果共享 Redis，必须在验证前清理本课 key，不能读到另一条线遗留的 code。

## 七、用真实 Redis 和 HTTP 观察状态

### 1. 启动本课独立 Redis

下面的密码和端口只用于本地课程实例。先确认名字和端口没有被未知容器占用，再创建独立网络和容器：

```bash
docker network create teamflow-verification-code-net
docker run -d --name teamflow-verification-code-redis \
  --network teamflow-verification-code-net -p 16383:6379 \
  redis:8-alpine redis-server --requirepass course-pass
docker exec teamflow-verification-code-redis \
  redis-cli -a course-pass --no-auth-warning PING
```

必须得到 `PONG`。如果名称或端口已被占用，换成本课唯一值并同步后续命令；不要停止不属于本课的容器。

### 2. 启动现代工程

保持上一课的 MySQL 容器与 schema，先从 `teamflow-verification-code-modern` 根目录启动。下面的 `18093` 只用于本地
验证，完整数据库变量继续沿用上一课已经验证的值：

```bash
SPRING_PROFILES_ACTIVE=course \
TEAMFLOW_DB_URL='jdbc:mysql://127.0.0.1:33320/teamflow_modern?useSSL=false&allowPublicKeyRetrieval=true' \
TEAMFLOW_DB_USER=teamflow \
TEAMFLOW_DB_PASSWORD=teamflow-pass \
TEAMFLOW_PORT=18093 \
TEAMFLOW_REDIS_HOST=127.0.0.1 \
TEAMFLOW_REDIS_PORT=16383 \
TEAMFLOW_REDIS_PASSWORD=course-pass \
mvn spring-boot:run
```

应用启动后签发一枚 code：

```bash
curl -i -X POST \
  'http://127.0.0.1:18093/api/v1/users/USR-1/email-change-verification-code'
```

响应必须是 `202` 且没有响应正文。应用日志的 `course-only verification delivery` 行只用于本地复制 code，例如
`123456`；真实部署不能记录该值。

### 3. 观察签发后的两个 key

把日志中的 code 替换成当前值，先在 Redis 中检查 TTL 和 key：

```bash
CODE_KEY='teamflow:verification-code:v1:email-change:USR-1'
ATTEMPT_KEY='teamflow:verification-attempts:v1:email-change:USR-1'
docker exec teamflow-verification-code-redis \
  redis-cli -a course-pass --no-auth-warning GET "$CODE_KEY"
docker exec teamflow-verification-code-redis \
  redis-cli -a course-pass --no-auth-warning TTL "$CODE_KEY"
docker exec teamflow-verification-code-redis \
  redis-cli -a course-pass --no-auth-warning GET "$ATTEMPT_KEY"
```

输出应依次是日志中的六位 code、`1` 到 `300` 之间的整数和 `0`。Redis key 中只有稳定用户 ID，没有邮箱地址。

### 4. 错误不消费，成功只消费一次

用一个确定错误先验证状态仍在：

```bash
curl -sS -X POST \
  'http://127.0.0.1:18093/api/v1/users/USR-1/email-change-verification-code/verification' \
  -H 'Content-Type: application/json' \
  -d '{"code":"000000"}'
docker exec teamflow-verification-code-redis \
  redis-cli -a course-pass --no-auth-warning GET "$CODE_KEY"
```

响应是 `{"result":"INVALID"}`，第二条命令仍得到原 code。然后提交日志中的正确 code：

```bash
curl -sS -X POST \
  'http://127.0.0.1:18093/api/v1/users/USR-1/email-change-verification-code/verification' \
  -H 'Content-Type: application/json' \
  -d '{"code":"123456"}'
docker exec teamflow-verification-code-redis \
  redis-cli -a course-pass --no-auth-warning EXISTS "$CODE_KEY"
curl -sS -X POST \
  'http://127.0.0.1:18093/api/v1/users/USR-1/email-change-verification-code/verification' \
  -H 'Content-Type: application/json' \
  -d '{"code":"123456"}'
```

第一次响应是 `{"result":"VERIFIED"}`，`EXISTS` 是 `0`，第二次响应是 `{"result":"EXPIRED"}`。这三步分别证明
错误不消费、成功删除和重复提交不能再次成功。

### 5. 失败次数会封锁并跨越重新签发

清理本课两个 key 后重新签发；不能用前一节已经消费的 code 继续判断：

```bash
docker exec teamflow-verification-code-redis \
  redis-cli -a course-pass --no-auth-warning DEL "$CODE_KEY" "$ATTEMPT_KEY"
curl -sS -X POST \
  'http://127.0.0.1:18093/api/v1/users/USR-1/email-change-verification-code'
```

用四次错误请求让计数到 `4`，再签发一次新 code。新日志 code 覆盖旧 code，但第五次错误仍返回
`{"result":"TOO_MANY_ATTEMPTS"}`，提交新日志 code 也返回同样结果。随后检查：

```bash
docker exec teamflow-verification-code-redis \
  redis-cli -a course-pass --no-auth-warning GET "$ATTEMPT_KEY"
docker exec teamflow-verification-code-redis \
  redis-cli -a course-pass --no-auth-warning TTL "$ATTEMPT_KEY"
```

计数至少是 `5`，TTL 是正数且不超过 `600`。不要为了让新 code 立即成功而删除计数 key；这正是“重新生成不能重置
失败计数”的要求。

### 6. Java 8 复跑相同 HTTP 反馈

停止现代应用后，从 `teamflow-verification-code-java8` 根目录使用兼容环境启动：

```bash
SPRING_PROFILES_ACTIVE=course \
TEAMFLOW_DB_URL='jdbc:mysql://127.0.0.1:33320/teamflow_java8?useSSL=false&allowPublicKeyRetrieval=true' \
TEAMFLOW_DB_USER=teamflow \
TEAMFLOW_DB_PASSWORD=teamflow-pass \
TEAMFLOW_PORT=18094 \
TEAMFLOW_REDIS_HOST=127.0.0.1 \
TEAMFLOW_REDIS_PORT=16383 \
TEAMFLOW_REDIS_PASSWORD=course-pass \
mvn spring-boot:run
```

重复签发、错误、正确、重复正确和五次失败反馈，URL 只把端口换成 `18094`。两条线应得到相同的 JSON 结果；Redis
key 仍使用同一个稳定前缀，必须在两条线之间按顺序清理本课 key，不能并行复用同一枚 code。异常的 Redis 连接必须以
非零启动或请求失败暴露，不能退回本机内存后继续返回 `VERIFIED`。

## 八、集中排查四个验证码错误

### 四个典型错误

:::pitfalls
### 使用 Random 或把验证码放进响应

**触发条件：** 用 `new Random()`、`Math.random()` 或 `return code` 让客户端直接取得刚生成的验证码。

**原因：** 一般伪随机源不满足安全随机要求；响应回显让任何能读取 HTTP 响应的中间层或脚本直接得到秘密。

**后果：** 猜测成本和泄露面都失去验证码存在的意义，日志和浏览器缓存还可能继续保存 code。

**错误示例：**

```java
/** 错误地使用一般随机源并把秘密交给响应。 */
public String issue() {
    String code = String.valueOf(new java.util.Random().nextInt(1000000));
    return code;
}
```

**正确写法：**

```java
/** 使用安全随机源生成六位 code，并把发送交给外部端口。 */
public void issue(String userId) {
    String code = codeGenerator.nextCode();
    codeSender.send(userId, code);
}
```

**验证方式：** 编译正确生成器并运行其 `main`，输出长度必须为 `6`；HTTP 签发响应必须是 `202` 且正文为空，
code 只能在本地 `course` profile 的观察日志出现。

### 先删除再比较，导致错误输入消费正确码

**触发条件：** 使用 `getAndDelete` 或 Redis `GETDEL` 读取后直接判断提交值，错误输入也执行了删除。

**原因：** 读取并删除是无条件操作，删除动作没有等待比较结果。

**后果：** 攻击者只需提交一次错误值，就能让真正用户拿到的有效 code 失效；兼容线还没有对应的 `getAndDelete` API。

**错误示例：**

```java
/** 错误地在比较之前消费 code。 */
public VerificationResult verify(String userId, String submittedCode) {
    String stored = redisTemplate.opsForValue().getAndDelete(codeKey(userId));
    return submittedCode.equals(stored)
            ? VerificationResult.VERIFIED
            : VerificationResult.INVALID;
}
```

**正确写法：**

```java
/** 只有比较成功才删除 code。 */
public VerificationResult verify(String userId, String submittedCode) {
    String stored = redisTemplate.opsForValue().get(codeKey(userId));
    if (stored == null) {
        return VerificationResult.EXPIRED;
    }
    if (submittedCode != null && stored.equals(submittedCode)) {
        redisTemplate.delete(codeKey(userId));
        return VerificationResult.VERIFIED;
    }
    return VerificationResult.INVALID;
}
```

**验证方式：** 先签发，再提交错误值并读取同一个 code key；key 必须仍存在。随后提交正确值，响应为 `VERIFIED`，
再次提交返回 `EXPIRED`。正确示例展示的是本课顺序语义，不是并发原子消费。

### 重新签发时把失败次数写回零

**触发条件：** 每次 issue 都执行 `set(attemptKey, "0", ATTEMPT_TTL)` 或删除失败计数 key。

**原因：** 新 code 的生命周期和失败窗口是两个状态；重新生成秘密不能抹掉同一窗口中的猜测历史。

**后果：** 攻击者可以反复请求新 code，把五次限制变成每次签发重新获得五次猜测。

**错误示例：**

```java
/** 错误地让重新签发重置防猜测计数。 */
public void issue(String userId) {
    redisTemplate.opsForValue().set(codeKey(userId), codeGenerator.nextCode(), CODE_TTL);
    redisTemplate.opsForValue().set(attemptKey(userId), "0", ATTEMPT_TTL);
}
```

**正确写法：**

```java
/** 只在不存在时初始化失败窗口。 */
public void issue(String userId) {
    String code = codeGenerator.nextCode();
    redisTemplate.opsForValue().set(codeKey(userId), code, CODE_TTL);
    redisTemplate.opsForValue().setIfAbsent(attemptKey(userId), "0", ATTEMPT_TTL);
    codeSender.send(userId, code);
}
```

**验证方式：** 连续四次提交错误值后重新签发；新 code 必须覆盖旧 code，但下一次错误和新 code 都不能越过
`TOO_MANY_ATTEMPTS`，失败 key 的 TTL 必须仍为正数。

### 把 Redis 故障当作验证码错误并回退内存

**触发条件：** Redis 连接异常时捕获所有异常，改用 `Map<String, String>` 保存 code，或统一返回 `INVALID`。

**原因：** 本机内存只在当前进程可见，无法保持多实例共享、重启恢复和 TTL 语义；依赖不可用与用户输入错误是两种
不同故障。

**后果：** 一台实例可能返回成功，另一台实例返回失败；重启会丢状态，客户端还会得到误导性的错误提示。

**错误示例：**

```java
/** 错误地在 Redis 失败后使用本机副本。 */
public VerificationResult verify(String userId, String submittedCode) {
    try {
        return verifyWithRedis(userId, submittedCode);
    } catch (RuntimeException exception) {
        return inMemoryCodes.get(userId).equals(submittedCode)
                ? VerificationResult.VERIFIED
                : VerificationResult.INVALID;
    }
}
```

**正确写法：**

```java
/** 让 Redis 依赖故障向上层传播，由统一错误边界转换。 */
public VerificationResult verify(String userId, String submittedCode) {
    return verifyWithRedis(userId, submittedCode);
}
```

**验证方式：** 暂停本课 Redis 后提交验证请求；请求必须失败并进入依赖故障日志，不能返回 `INVALID` 或
`VERIFIED`，也不能在恢复前读取一份本机 Map 继续工作。
:::

## 九、独立练习

:::exercise
### 为邮箱变更确认实现一次性状态机

**要求：** 使用 `VerificationCodeService` 的公开 `issue` 和 `verify` seam，接入一个可观察的发送端口。实现并验证：
签发得到六位 code；错误提交不消费；成功提交只消费一次；五次失败封锁；重新签发覆盖旧 code 但不清零失败次数。
验证码 key 和失败 key 必须分开；真实 Redis 版本的 code TTL 约五分钟、失败窗口约十分钟，按前一章的
Redis/HTTP 验收核对。这个内存练习只模拟状态顺序和失败上限，不自行实现墙上时钟；不得增加 Lua、事务、锁、内存回退或登录认证。

**验收：**

```text
issue=202
wrong=INVALID
correct=VERIFIED
repeat=EXPIRED
after-five-failures=TOO_MANY_ATTEMPTS
reissue=TOO_MANY_ATTEMPTS
```
:::

### 1. 完整参考实现

下面的内存端口只用于独立练习，真实 Web 工程仍使用前文的 `StringRedisTemplate`。它不模拟墙上时钟或 Redis TTL，
TTL 已在前文真实 Redis/HTTP 反馈中验收；这里保留同一个公开状态顺序，方便在没有 Docker 的情况下先观察“错误不消费、
成功消费、失败封锁和重新签发不清零”：

```java
import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/** 在内存端口中演示一次性验证码状态机。 */
public final class VerificationCodeExercise {
    private static final int MAX_FAILURES = 5;
    private final SecureRandom random = new SecureRandom();
    private final Map<String, String> codes = new HashMap<>();
    private final Map<String, Integer> failures = new HashMap<>();

    /** 签发新 code，同时保留既有失败计数。 */
    public String issue(String userId) {
        String code = String.format(Locale.ROOT, "%06d", random.nextInt(1_000_000));
        codes.put(userId, code);
        if (!failures.containsKey(userId)) {
            failures.put(userId, 0);
        }
        return code;
    }

    /** @return 当前提交的公开结果 */
    public String verify(String userId, String submittedCode) {
        int failureCount = failures.containsKey(userId) ? failures.get(userId) : 0;
        if (failureCount >= MAX_FAILURES) {
            return "TOO_MANY_ATTEMPTS";
        }
        String storedCode = codes.get(userId);
        if (storedCode == null) {
            return "EXPIRED";
        }
        if (storedCode.equals(submittedCode)) {
            codes.remove(userId);
            failures.remove(userId);
            return "VERIFIED";
        }
        int nextFailures = failureCount + 1;
        failures.put(userId, nextFailures);
        return nextFailures >= MAX_FAILURES ? "TOO_MANY_ATTEMPTS" : "INVALID";
    }

    /** @return 与当前 code 必然不同的六位数字 */
    private static String wrongCode(String currentCode) {
        return "000000".equals(currentCode) ? "999999" : "000000";
    }

    /** 运行练习反馈并打印每个状态。 */
    public static void main(String[] args) {
        VerificationCodeExercise exercise = new VerificationCodeExercise();
        String oldCode = exercise.issue("USR-1");
        System.out.println("issue=202");
        System.out.println("wrong=" + exercise.verify("USR-1", wrongCode(oldCode)));
        System.out.println("correct=" + exercise.verify("USR-1", oldCode));
        System.out.println("repeat=" + exercise.verify("USR-1", oldCode));

        String limitedCode = exercise.issue("USR-1");
        for (int index = 0; index < MAX_FAILURES; index++) {
            exercise.verify("USR-1", wrongCode(limitedCode));
        }
        exercise.issue("USR-1");
        System.out.println(
                "after-five-failures=" + exercise.verify("USR-1", wrongCode(limitedCode)));
        System.out.println("reissue=" + exercise.verify("USR-1", exercise.issue("USR-1")));
    }
}
```

预期输出为：

```text
issue=202
wrong=INVALID
correct=VERIFIED
repeat=EXPIRED
after-five-failures=TOO_MANY_ATTEMPTS
reissue=TOO_MANY_ATTEMPTS
```

练习故意让 `issue` 返回 code，便于独立内存端口验收；这不是 Web Controller 的合同。真实 Controller 的签发方法返回
`202` 无正文，code 只能交给发送端口。

### 2. 自我检查

- 为什么 code key 用 `set`，失败 key 却用 `setIfAbsent`？
- 错误输入为什么不能执行 `DEL codeKey`？
- 如果 Redis 在 `INCR` 后断开，为什么不能把这次请求改答成 `INVALID`？
- 为什么 `GETDEL` 仍不能直接替换本课的比较后消费？
- 两个并发请求同时提交正确 code 时，本课代码可能出现什么窗口？哪一门后续课程应该关闭它？

## 十、本课小结

验证码的核心不是“随机打印六位数字”，而是把一枚短秘密放进一个可解释的状态机：`SecureRandom` 负责生成，Redis
用带 TTL 的字符串保存，独立 key 记录失败窗口，错误只增加计数，成功才删除 code，重新签发不清零已有失败。

本课的 Web 合同是签发 `202` 无正文、验证返回一个公开结果；它没有把 code 回显给客户端，也没有把 Redis 故障伪装成
用户输错。Spring Boot 4.1 与 2.3.12 的核心 Java 文件同形，但兼容线没有 `getAndDelete`，因此顺序
`GET -> 比较 -> DEL` 的并发双验窗口必须明确写出来。

Lua 比较后原子删除、Redis 事务、分布式锁、完整登录认证和供应商投递可靠性都属于独立能力。保持这些边界，读者才能
知道本课已经证明了什么，也知道下一次需要增加哪一个机制。
