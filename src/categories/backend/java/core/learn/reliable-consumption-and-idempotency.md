---
id: backend.java.learn.advanced.reliable-consumption-and-idempotency
type: lesson
title: 可靠消费与消费幂等
summary: 用手动确认、有限重试、死信队列和持久化消息 ID 处理 RabbitMQ 消费失败与重复投递
domain: backend
technology: java
module: core
stage: advanced
level: advanced
estimatedMinutes: 220
prerequisites:
  - backend.java.learn.advanced.rabbitmq-message-send-receive
  - backend.java.learn.intermediate.database-transactions
  - backend.java.learn.intermediate.api-idempotency
objectives:
  - 能区分 publisher confirm、consumer acknowledgement、nack 和 reject 各自确认的责任边界。
  - 能在 Spring AMQP listener 中使用手动确认，并根据异常类型选择确认、有限重投或死信。
  - 能解释立即 requeue 形成的重投循环，并用 TTL retry queue 与 dead-letter exchange 建立有上限的重试路径。
  - 能为消息设置稳定的业务 messageId，并说明 redelivered 标记不能代替幂等键。
  - 能在数据库事务中用唯一约束记录已处理消息，让重复投递只产生一次业务副作用。
  - 能区分临时故障、永久坏消息和幂等重复，分别设计恢复、死信和确认动作。
  - 能在 JDK 25 / Spring Boot 4.1.1 与 Java 8 / Spring Boot 2.3.12.RELEASE 中保持同一消费合同。
  - 能通过 Broker 指标、数据库记录和应用日志验证成功、重投、死信与重复消费结果。
recap:
  - publisher confirm 只确认发布端与 Broker 的交接，consumer acknowledgement 只确认某次投递的处理责任，两者互不替代。
  - 处理成功后才 basicAck；临时错误必须有上限地重试，永久错误用 reject 或 nack(false) 进入死信，不能无限 requeue。
  - TTL retry queue 通过过期后 dead-letter 回主队列实现延迟，但 TTL 不是精确的定时器，仍要记录尝试次数和原因。
  - redelivered 只表示这次投递曾经被投递过，不能作为业务去重键；messageId 必须由生产者稳定生成并贯穿重试。
  - 幂等记录和业务更新放入同一数据库事务，唯一约束拦住重复消息；事务回滚后，后续重投仍可再次尝试。
  - 重复消息被识别后应确认并跳过副作用，毒消息进入死信后要保留原因、消息 ID 和原始 payload 以便人工处理。
  - Java 8 兼容线可以复用相同的 Spring AMQP listener 与 JDBC 控制流，只替换独立工程的 Boot 依赖和 JDK 配置。
  - Broker 指标、数据库唯一键和带 messageId 的结构化日志要分别证明发布、投递、业务提交和最终动作，不能用单一计数代替完整链路。
related:
  - backend.java.learn.advanced.rabbitmq-message-send-receive
  - backend.java.learn.intermediate.database-transactions
  - backend.java.learn.intermediate.api-idempotency
  - backend.java.learn.intermediate.integration-testing-with-spring-boot
tags:
  - Java
  - Spring Boot
  - RabbitMQ
  - Spring AMQP
  - acknowledgement
  - 重试
  - 死信队列
  - 消费幂等
  - 数据库事务
appliesTo: JDK 25 / Spring Boot 4.1.1 / Spring AMQP 4.1.1 / RabbitMQ 4.3 主线；Java 8 / Spring Boot 2.3.12.RELEASE / Spring AMQP 2.2.18.RELEASE 兼容线
verifiedAt: 2026-08-31
sources:
  - id: rabbitmq-reliability
    title: RabbitMQ Reliability Guide
    url: https://www.rabbitmq.com/docs/reliability
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: RabbitMQ 4.3
    claims:
      - RabbitMQ 应用需要分别考虑发布端与消费端的交付确认，连接故障会影响未确认投递。
      - 消费者重投和发布确认不能合并为跨系统 exactly-once 事务。
  - id: rabbitmq-confirms
    title: Consumer Acknowledgements and Publisher Confirms
    url: https://www.rabbitmq.com/docs/confirms
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: RabbitMQ 4.3
    claims:
      - automatic acknowledgement 在消息发送后立即视为成功，手动 acknowledgement 由 basic.ack、basic.nack 或 basic.reject 表达。
      - 未确认投递在 channel 或 connection 关闭时会重新入队，消费者必须能够处理 redelivery。
      - basic.nack 或 basic.reject 的 requeue 参数决定重新入队、死信或丢弃；无界 requeue 可能形成高成本循环。
      - publisher confirms 与 consumer acknowledgements 面向不同通信方向，不能互相替代。
  - id: rabbitmq-dlx
    title: Dead Letter Exchanges
    url: https://www.rabbitmq.com/docs/dlx
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: RabbitMQ 4.3
    claims:
      - 被拒绝、过期、超过队列长度或达到 quorum delivery-limit 的消息可以被 dead-letter 到 exchange。
      - AMQP 0-9-1 dead-letter 消息包含 x-death 记录，可用于观察死信原因和次数。
  - id: rabbitmq-ttl
    title: Time-To-Live and Expiration
    url: https://www.rabbitmq.com/docs/ttl
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: RabbitMQ 4.3
    claims:
      - 消息 TTL 与队列 TTL 可以让过期消息被删除或按配置 dead-letter。
      - 消息过期后不会继续交付，TTL 不代表精确的业务定时执行时间。
  - id: rabbitmq-consumer-prefetch
    title: Consumer Prefetch
    url: https://www.rabbitmq.com/docs/consumer-prefetch
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: RabbitMQ 4.3
    claims:
      - prefetch 限制一个消费者或 channel 上未确认投递的在途数量，不能限制业务副作用次数。
  - id: spring-amqp-exception-handling
    title: Spring AMQP Exception Handling
    url: https://docs.spring.io/spring-amqp/reference/amqp/exception-handling.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring AMQP 4.1.1
    claims:
      - listener 抛出异常时，容器可以按异常类型决定 reject、requeue 或交给 recoverer。
      - MessageRecoverer 可以在重试耗尽后记录、丢弃或重新发布消息。
  - id: spring-amqp-listener-container
    title: Spring AMQP Container Attributes
    url: https://docs.spring.io/spring-amqp/reference/amqp/containerAttributes.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring AMQP 4.1.1
    claims:
      - acknowledge-mode、prefetch 和 default-requeue-rejected 是 listener container 的独立配置边界。
      - 手动确认时，监听方法可以通过 Channel 与 MessageProperties 读取 delivery tag 并发送确认。
  - id: spring-amqp-retry
    title: Spring AMQP Resilience and Error Handling
    url: https://docs.spring.io/spring-amqp/reference/amqp/resilience-recovering-from-errors-and-broker-failures.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring AMQP 4.1.1 / 2.2.18.RELEASE
    claims:
      - listener 重试可以使用 RetryTemplate 和 MessageRecoverer，重试耗尽后由 recoverer 决定最终动作。
      - retry interceptor 的重试次数与 Broker redelivery 次数是不同层次，不能混为一个计数。
  - id: spring-boot-amqp
    title: Spring Boot AMQP Support
    url: https://docs.spring.io/spring-boot/reference/messaging/amqp.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.1
    claims:
      - spring-boot-starter-amqp 自动配置 RabbitTemplate、AmqpAdmin 和默认 listener container。
      - spring.rabbitmq.listener.simple 配置可以设置 acknowledgement、prefetch 和拒绝后的 requeue 行为。
  - id: spring-amqp-22-reference
    title: Spring AMQP 2.2 Reference
    url: https://docs.spring.io/spring-amqp/docs/2.2.18.RELEASE/reference/html/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring AMQP 2.2.18.RELEASE / Spring Boot 2.3.12.RELEASE
    claims:
      - Java 8 兼容线保留 RabbitListener、RabbitTemplate、RetryTemplate 和 MessageRecoverer 的基本消费能力。
  - id: mysql-unique-constraints
    title: MySQL 8.4 Reference Manual - Constraints
    url: https://dev.mysql.com/doc/refman/8.4/en/constraints.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - UNIQUE 和 PRIMARY KEY 约束可以让数据库拒绝重复的业务标识，成为消费幂等的持久化边界。
  - id: community-idempotent-consumer
    title: Martin Fowler - Idempotent Receiver
    url: https://martinfowler.com/articles/patterns-of-distributed-systems/idempotent-receiver.html
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: 分布式系统通用模式
    claims:
      - 消费者可以保存已处理消息 ID，并在重复消息到达时跳过业务副作用。
      - 幂等记录需要与业务更新协调，单独的内存集合不能承担持久化去重合同。
---

# 可靠消费与消费幂等

上一课已经让消息真正经过 exchange、queue 和 listener。现在把故障放回这条链路：消费者可能在业务写入成功后、确认到达前崩溃，
同一条消息随后再次投递；临时数据库故障可能需要重试，格式错误却应该进入死信；两个消费者同时看到同一个业务消息时，不能让
扣库存或发通知执行两次。

本课建立一个清晰的责任合同：发布端用 publisher confirm 知道 Broker 是否接住发布，消费端在业务事务成功后发送 acknowledgement；
失败消息只按明确次数重试，超过上限进入死信；业务用稳定 `messageId` 和数据库唯一约束吸收重复投递。本课不承诺跨数据库、Broker
和外部供应商的全局 exactly-once，也不把 `redelivered` 标记当成幂等实现。

## 一、先沿着故障时间线区分两种确认

### 1. publisher confirm 和 consumer acknowledgement 面向相反方向

一次报表通知至少有两个交接：

```text
producer --publish--> exchange/queue --delivery--> consumer
             ^ confirm                         ^ ack/nack/reject
             Broker 确认发布                  consumer 确认投递处理
```

publisher confirm 是 Broker 对发布端的反馈。它表示消息已经被 Broker 接受并按协议处理，不表示消费者已经执行数据库更新。
consumer acknowledgement 是消费者对 Broker 的反馈，表示这一次 delivery 已处理，可以从队列中删除。两者互相独立：打开
confirm 不会替 listener ack，listener ack 也不能证明发布端没有丢失。

```java
// 发布端的 confirm 结果（伪代码，channel 已开启 confirm 模式）
channel.basicPublish(EXCHANGE, ROUTING_KEY, properties, body);
channel.waitForConfirmsOrDie(5_000);

// 消费端的 ack（deliveryTag 必须来自同一个 channel）
channel.basicAck(deliveryTag, false);
```

不要把 `waitForConfirmsOrDie` 当成“数据库和消息已经在一个事务中”。发布成功后，应用仍可能在消费者收到消息前退出；消费成功后，
应用也可能在 ack 发出前退出。每个边界都需要自己的恢复动作。

### 2. ack 的位置决定丢失窗口或重复窗口

| 做法 | 故障点 | 可能结果 | 适用判断 |
| --- | --- | --- | --- |
| 自动确认 | Broker 发出 delivery 后立即确认 | 处理前崩溃会丢消息 | 只适用于允许遗漏的轻量通知 |
| 处理前 `basicAck` | ack 后业务尚未完成 | 消息不再重投，业务可能没执行 | 不适合作为可靠命令消费 |
| 处理成功后 `basicAck` | 业务成功、ack 前崩溃 | 消息重投，业务可能重复 | 配合幂等记录形成效果一次 |
| `basicNack(requeue=true)` | 失败后立即回队列 | 临时错误可恢复，也可能忙等循环 | 必须有次数或时间上限 |
| `basicReject(requeue=false)` | 明确放弃当前 delivery | 进入 DLX 或被丢弃 | 永久坏消息或超过重试上限 |

手动确认把删除责任留给应用，因此吞吐和安全要一起调节。`prefetch` 只限制未确认的在途消息，不能阻止业务代码重复写入；
确认仍应发生在事务成功之后。

### 3. `redelivered` 只是线索，不是业务身份

RabbitMQ 会在重投的 delivery 上设置 `redelivered=true`。它可以帮助日志解释“这次不是首次投递”，但它不包含订单号、任务号或事件
版本，也不保证只在你的业务第一次失败后变为 `true`。例如一个消费者断线后，另一台消费者第一次看到该消息也可能拿到 `true`。

因此消息发布时应写入稳定的业务 ID：

```java
/** 为发布消息附加稳定的业务 messageId。 */
MessagePostProcessor withMessageId(String messageId) {
    return message -> {
        message.getMessageProperties().setMessageId(messageId);
        return message;
    };
}
```

同一逻辑事件在重试、重新发布和跨消费者时都保留这个 ID；每次新的业务意图必须生成新的 ID。

## 二、让失败离开无限 requeue 循环

### 1. 先分类，再决定 Broker 动作

不要把所有异常都映射成 `requeue=true`。消费者应该先判断故障是否值得再次尝试：

| 故障类别 | 例子 | 当前 delivery 动作 | 后续观察 |
| --- | --- | --- | --- |
| 成功 | 事务提交、业务状态已更新 | `basicAck` | 记录 messageId 和业务结果 |
| 幂等重复 | 唯一键冲突且原消息已完成 | `basicAck` 并跳过副作用 | duplicate counter 增加 |
| 临时依赖失败 | 数据库连接暂时不可用、外部服务超时 | 有上限地重试 | attempt、延迟和最终原因 |
| 永久坏消息 | JSON 缺字段、未知业务类型 | `basicReject(false)` | DLX 保存 payload、原因和 messageId |
| 重试耗尽 | 同一消息超过最大尝试次数 | `basicReject(false)` | DLQ 告警与人工处理 |

临时错误与永久错误需要不同的可观察结果。不能把“进入死信”写成“消费成功”，也不能让客户端看到 `202` 就误以为后台永远会完成。

### 2. 立即 requeue 会把故障放大

如果数据库已经不可用，所有消费者都执行下面的分支：

```java
catch (TransientDependencyException error) {
    channel.basicNack(tag, false, true);
}
```

消息会马上再次变成 ready，消费者又立即领取、失败、requeue。这个循环占用 CPU、网络和日志配额，却没有给依赖恢复的时间。RabbitMQ
官方文档把这种情况列为 requeue/redelivery loop；实际系统应使用有限次数、延迟队列或熔断，而不是无限重投。

### 3. 用 retry queue 提供延迟，用 DLX 提供终点

一个简单的延迟拓扑如下：

```text
report.work --失败--> report.retry.5s --TTL 5s--> report.work
report.work --超过上限或坏消息--> report.dead
```

retry queue 设置 `x-message-ttl=5000` 和 dead-letter exchange；过期后消息回到主 exchange。主队列不要把业务异常全部
`requeue=true`，而是由应用根据 attempt 计数选择发布到 retry queue，发布成功后再 ack 原 delivery。超过上限则 reject 到 dead queue。

TTL 只表示消息在队列中允许等待的最长时间，实际重新路由受 Broker 调度和队列头部消息影响，不是精确的“5 秒后执行”定时器。
retry queue 仍要限制总尝试次数，死信消息也应带上原始 messageId、attempt 和失败原因。

## 三、Spring AMQP 中的确认、重试和死信

### 1. listener container 的确认模式要显式设置

应用配置先表达边界，再由 listener 方法发送具体 ack：

```yaml
spring:
  rabbitmq:
    listener:
      simple:
        acknowledge-mode: manual
        prefetch: 10
        default-requeue-rejected: false
```

`manual` 表示容器不会替业务确认；`prefetch=10` 把每个消费者的未确认窗口限制为 10。`default-requeue-rejected=false` 是兜底策略，
避免 listener 抛出未处理异常时无限重投，但它不能替代对临时和永久错误的分类。生产环境还应给 retry 和 dead queue 配置告警。

### 2. 用 `Channel` 让成功、重复和失败动作对齐

下面的 listener 只负责 delivery 状态，业务事务放在独立 Service 中。`MessageProperties` 提供 delivery tag 和消息头，ack 必须使用
收到该消息的同一个 `Channel`：

```java
@Component
public class ReportNotificationListener {
    private final ReportNotificationService service;

    /** 创建报表通知监听器。 */
    public ReportNotificationListener(ReportNotificationService service) {
        this.service = service;
    }

    /** 处理一次通知投递，并根据故障类别确认、重投或死信。 */
    @RabbitListener(
            queues = ReportRabbitTopology.WORK_QUEUE,
            containerFactory = "reliableRabbitListenerContainerFactory")
    public void receive(Message message, Channel channel) throws IOException {
        long tag = message.getMessageProperties().getDeliveryTag();
        String messageId = message.getMessageProperties().getMessageId();
        int attempt = readAttempt(message);
        try {
            if (messageId == null || messageId.trim().isEmpty()) {
                throw new PermanentMessageException("messageId is required");
            }
            service.process(messageId, new String(
                    message.getBody(), StandardCharsets.UTF_8));
            channel.basicAck(tag, false);
        } catch (AlreadyProcessedException duplicate) {
            channel.basicAck(tag, false);
        } catch (TransientDependencyException temporary) {
            if (attempt < MAX_ATTEMPTS) {
                publishToRetryQueue(message, attempt + 1);
                channel.basicAck(tag, false);
            } else {
                channel.basicReject(tag, false);
            }
        } catch (PermanentMessageException invalid) {
            channel.basicReject(tag, false);
        }
    }
}
```

这个控制流把 attempt 放在消息头或 retry queue 的路由元数据中：重试消息由发布辅助方法递增 attempt，发布并确认成功后才 ack 原 delivery；
attempt 达到上限后 reject 到主队列配置的 DLX。`readAttempt`、`publishToRetryQueue` 和 `MAX_ATTEMPTS` 会在本节完整工程中定义，前面的片段
只用于突出确认分支。不要使用 `redelivered` 推断次数，也不要因为 `redelivered=false` 就把消息当作没有业务副作用。

### 3. 把 retry interceptor 当作容器策略，而不是幂等实现

Spring AMQP 可以把 `RetryTemplate` 和 `MessageRecoverer` 接入 listener container：重试器决定 listener 方法在当前 delivery 内重试
几次，recoverer 决定耗尽后 reject、记录或重新发布。这个层次的尝试次数不等于 Broker 的 redelivery 次数：容器内部重试可能尚未
发送新的 delivery，连接重启也可能让同一消息再次 redelivery。

```java
RetryOperationsInterceptor interceptor = RetryInterceptorBuilder.stateless()
        .maxAttempts(3)
        .backOffOptions(1_000, 2.0, 5_000)
        .recoverer(new RejectAndDontRequeueRecoverer())
        .build();
factory.setAdviceChain(interceptor);
```

如果采用这个容器策略，listener 不要再同时手动 `basicNack(requeue=true)`，否则两层重试会相乘且难以预测。课程完整示例选择手动确认，
把重试动作放在一个地方，便于观察每一次状态变化；真实项目可二选一并记录最大尝试次数。

## 四、幂等的持久化边界在数据库事务内

### 1. 先存消息 ID，再改变业务状态

消费幂等不是把 `messageId` 放进 JVM `Set`。进程重启、多个消费者和多实例部署都会让本机集合失效。可靠边界应该由数据库唯一约束
提供：

```sql
CREATE TABLE consumed_message (
    message_id VARCHAR(128) PRIMARY KEY,
    consumed_at TIMESTAMP NOT NULL
);

CREATE TABLE task_notification (
    task_id VARCHAR(64) PRIMARY KEY,
    notified_at TIMESTAMP NULL
);
```

业务事务执行以下顺序：

```text
BEGIN
  INSERT consumed_message(message_id)  -- 唯一键冲突表示重复
  UPDATE task_notification             -- 只有首次消息能走到这里
COMMIT
```

如果 `UPDATE` 失败，整个事务回滚，`consumed_message` 记录也不存在，后续重投仍然有机会成功。若事务已经提交，ack 在随后丢失，
重复消息会在 INSERT 处被唯一约束拦住，然后安全 ack。这个顺序把“是否已经产生副作用”交给数据库，而不是交给日志或内存状态。

### 2. duplicate、失败和 ack 的组合

```java
@Service
public class ReportNotificationService {
    private final JdbcTemplate jdbcTemplate;

    /** 创建通知业务服务。 */
    public ReportNotificationService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /** 在同一事务中记录消息并更新任务通知状态。 */
    @Transactional
    public void process(String messageId, String taskId) {
        try {
            jdbcTemplate.update(
                    "INSERT INTO consumed_message(message_id, consumed_at) VALUES (?, CURRENT_TIMESTAMP)",
                    messageId);
        } catch (DuplicateKeyException duplicate) {
            throw new AlreadyProcessedException(messageId);
        }
        int updated = jdbcTemplate.update(
                "UPDATE task_notification SET notified_at = CURRENT_TIMESTAMP WHERE task_id = ?",
                taskId);
        if (updated != 1) {
            throw new PermanentMessageException("unknown task: " + taskId);
        }
    }
}
```

listener 捕获 `AlreadyProcessedException` 后 ack，是因为数据库已经证明原消息的业务事务成功提交；如果把重复消息再次 requeue，只会制造
没有收益的循环。未知任务或格式错误不应写入 consumed 表，直接 reject 到死信；临时数据库错误则让事务回滚，再交给有限重试。

### 3. 幂等键与业务键不是一回事

`messageId` 标识一次事件，`taskId` 标识被改变的业务对象。一条任务可能先后产生 `task.created`、`task.notified` 两个不同事件，不能只
按 `taskId` 去重；否则合法的第二个事件会被错误吞掉。相反，同一个事件被重新发布时必须复用原始 `messageId`，不能每次重试都生成新 ID。

## 五、完整 Spring Boot 工程：一次可恢复的通知消费

### 1. 两个版本使用独立工程和同一消息合同

现代线和兼容线不能把不同 Boot parent 放在一个 Maven 工程。建议目录如下：

```text
teamflow-reliable-consumer-modern/
  pom.xml
  mvnw  mvnw.cmd  .mvn/wrapper/
  src/main/java/com/example/teamflow/rabbit/...
  src/main/resources/application.yml
teamflow-reliable-consumer-legacy/
  pom.xml
  mvnw  mvnw.cmd  .mvn/wrapper/
  src/main/java/com/example/teamflow/rabbit/...
  src/main/resources/application.yml
```

现代 POM 使用 JDK 25 与 Boot 4.1.1：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>4.1.1</version>
    <relativePath/>
  </parent>
  <groupId>com.example</groupId>
  <artifactId>teamflow-reliable-consumer-modern</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <properties>
    <java.version>25</java.version>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-amqp</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-jdbc</artifactId>
    </dependency>
    <dependency>
      <groupId>com.mysql</groupId>
      <artifactId>mysql-connector-j</artifactId>
      <scope>runtime</scope>
    </dependency>
  </dependencies>
  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>
```

兼容线只替换 parent、坐标和 Java 目标：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.3.12.RELEASE</version>
    <relativePath/>
  </parent>
  <groupId>com.example</groupId>
  <artifactId>teamflow-reliable-consumer-legacy</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <properties>
    <java.version>1.8</java.version>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-amqp</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-jdbc</artifactId>
    </dependency>
    <dependency>
      <groupId>mysql</groupId>
      <artifactId>mysql-connector-java</artifactId>
      <scope>runtime</scope>
    </dependency>
  </dependencies>
  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>
```

两套工程复制相同的 Java 包和 SQL，但不要复制对方的 `target` 或 `.mvn` 生成目录。IntelliJ 中现代工程的 Project SDK、模块 SDK 和
Maven Runner JRE 都选 JDK 25；兼容工程三处都选 JDK 8。确认 POM 的 `<java.version>` 与 SDK 一致后执行 Maven Reload。项目根目录
有 `mvnw`、`mvnw.cmd` 和 `.mvn/wrapper/` 时运行 `./mvnw spring-boot:run`；没有 wrapper 就在确认 `mvn -v` 使用正确 JDK 后运行
`mvn spring-boot:run`。

两条工程都使用环境变量连接 RabbitMQ 和 MySQL：

```yaml
spring:
  datasource:
    url: ${JDBC_URL:jdbc:mysql://localhost:3306/teamflow}
    username: ${JDBC_USERNAME:teamflow}
    password: ${JDBC_PASSWORD:change-me}
  rabbitmq:
    host: ${RABBITMQ_HOST:localhost}
    port: ${RABBITMQ_PORT:5672}
    username: ${RABBITMQ_USERNAME:guest}
    password: ${RABBITMQ_PASSWORD:guest}
    listener:
      simple:
        acknowledge-mode: manual
        prefetch: 10
        default-requeue-rejected: false
```

不要把真实密码提交到 `application.yml`。现代和兼容工程的变量名、队列名与 messageId 合同保持相同，只有依赖版本和 JDBC 驱动坐标不同。

publisher confirm 也要显式打开，但两条 Spring Boot 线的属性名称不同：

```yaml
# Spring Boot 4.1.1 / Spring AMQP 4.1.1
spring.rabbitmq.publisher-confirm-type: correlated

# Spring Boot 2.3.12.RELEASE / Spring AMQP 2.2.18.RELEASE
spring.rabbitmq.publisher-confirms: true
```

`correlated` 让 `RabbitTemplate` 可以用 `CorrelationData` 关联每次发布；兼容线使用同一确认回调合同，只是属性仍是旧版布尔开关。
确认回调报告 nack 或超时，都不能 ack 原 delivery，应把原消息保留到死信队列并报警。

### 2. listener container 工厂显式固定确认策略

配置文件表达默认值，具名工厂把本课的确认合同固定在代码中。这样不同 listener 不会因为全局默认值变化而悄悄改成自动确认：

```java
import org.springframework.amqp.core.AcknowledgeMode;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** 固定可靠消费使用的 listener container 策略。 */
@Configuration(proxyBeanMethods = false)
public class ReliableRabbitListenerConfiguration {
    /** 创建手动确认、有限在途消息的监听容器工厂。 */
    @Bean
    public SimpleRabbitListenerContainerFactory reliableRabbitListenerContainerFactory(
            ConnectionFactory connectionFactory) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setAcknowledgeMode(AcknowledgeMode.MANUAL);
        factory.setPrefetchCount(10);
        factory.setDefaultRequeueRejected(false);
        return factory;
    }
}
```

`acknowledge-mode`、`prefetch` 和 `default-requeue-rejected` 是三个独立开关。工厂的兜底拒绝策略只处理未捕获异常；业务分支仍要在事务成功后
发送 ack，或在明确的临时错误分支进入 retry queue。

### 3. 拓扑把 retry 和 dead queue 声明成正式资源

```java
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** 声明通知消费的 RabbitMQ 拓扑资源。 */
@Configuration
public class ReportRabbitTopology {
    public static final String EXCHANGE = "teamflow.report";
    public static final String KEY = "report.notify";
    public static final String WORK_QUEUE = "teamflow.report.work";
    public static final String RETRY_EXCHANGE = "teamflow.report.retry";
    public static final String RETRY_KEY = "report.retry";
    public static final String RETRY_QUEUE = "teamflow.report.retry.queue";
    public static final String DEAD_EXCHANGE = "teamflow.report.dead";
    public static final String DEAD_QUEUE = "teamflow.report.dead.queue";

    /** 声明主 direct exchange。 */
    @Bean
    public DirectExchange reportExchange() {
        return new DirectExchange(EXCHANGE, true, false);
    }

    /** 声明带死信出口的工作队列。 */
    @Bean
    public Queue workQueue() {
        return QueueBuilder.durable(WORK_QUEUE)
                .withArgument("x-dead-letter-exchange", DEAD_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", "dead")
                .build();
    }

    /** 声明带 TTL 的重试队列，过期后回到工作交换机。 */
    @Bean
    public Queue retryQueue() {
        return QueueBuilder.durable(RETRY_QUEUE)
                .withArgument("x-message-ttl", 5_000)
                .withArgument("x-dead-letter-exchange", EXCHANGE)
                .withArgument("x-dead-letter-routing-key", KEY)
                .build();
    }

    /** 声明重试交换机。 */
    @Bean
    public DirectExchange retryExchange() {
        return new DirectExchange(RETRY_EXCHANGE, true, false);
    }

    /** 声明死信 exchange。 */
    @Bean
    public DirectExchange deadExchange() {
        return new DirectExchange(DEAD_EXCHANGE, true, false);
    }

    /** 声明死信队列。 */
    @Bean
    public Queue deadQueue() {
        return QueueBuilder.durable(DEAD_QUEUE).build();
    }

    /** 绑定工作队列。 */
    @Bean
    public Binding workBinding(
            @Qualifier("reportExchange") DirectExchange reportExchange,
            @Qualifier("workQueue") Queue workQueue) {
        return BindingBuilder.bind(workQueue).to(reportExchange).with(KEY);
    }

    /** 绑定重试交换机到 TTL 队列。 */
    @Bean
    public Binding retryBinding(
            @Qualifier("retryExchange") DirectExchange retryExchange,
            @Qualifier("retryQueue") Queue retryQueue) {
        return BindingBuilder.bind(retryQueue).to(retryExchange).with(RETRY_KEY);
    }

    /** 绑定死信队列。 */
    @Bean
    public Binding deadBinding(
            @Qualifier("deadExchange") DirectExchange deadExchange,
            @Qualifier("deadQueue") Queue deadQueue) {
        return BindingBuilder.bind(deadQueue).to(deadExchange).with("dead");
    }
}
```

这个示例用主队列的 DLX 接住 `basicReject(false)`，retry queue 则在 5 秒 TTL 到期后回到工作交换机。不要把 retry queue 的 TTL 和 dead queue
混成一个队列，否则无法区分“等待再次尝试”和“等待人工处理”。

### 4. listener 与事务服务保持一条确认路径

```java
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import com.rabbitmq.client.Channel;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.connection.CorrelationData;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class ReportNotificationListener {
    private final ReportNotificationService service;
    private final RabbitTemplate rabbitTemplate;
    private static final int MAX_ATTEMPTS = 3;
    private static final String ATTEMPT_HEADER = "x-attempt";

    /** 创建监听器及重试消息发布器。 */
    public ReportNotificationListener(
            ReportNotificationService service, RabbitTemplate rabbitTemplate) {
        this.service = service;
        this.rabbitTemplate = rabbitTemplate;
    }

    /** 处理通知并在事务完成后发送 acknowledgement。 */
    @RabbitListener(
            queues = ReportRabbitTopology.WORK_QUEUE,
            containerFactory = "reliableRabbitListenerContainerFactory")
    public void receive(Message message, Channel channel) throws IOException {
        long tag = message.getMessageProperties().getDeliveryTag();
        int attempt = readAttempt(message);
        try {
            String messageId = message.getMessageProperties().getMessageId();
            if (messageId == null || messageId.trim().isEmpty()) {
                throw new PermanentMessageException("messageId is required");
            }
            String taskId = new String(message.getBody(), StandardCharsets.UTF_8);
            service.process(messageId, taskId);
            channel.basicAck(tag, false);
        } catch (AlreadyProcessedException duplicate) {
            channel.basicAck(tag, false);
        } catch (TransientDependencyException temporary) {
            if (attempt < MAX_ATTEMPTS) {
                publishToRetryQueue(message, attempt + 1);
                channel.basicAck(tag, false);
            } else {
                channel.basicReject(tag, false);
            }
        } catch (PermanentMessageException invalid) {
            channel.basicReject(tag, false);
        }
    }

    /** 读取 retry queue 写回的尝试次数，缺失或非法值按首次尝试处理。 */
    private int readAttempt(Message message) {
        Object value = message.getMessageProperties().getHeaders().get(ATTEMPT_HEADER);
        if (value instanceof Number) {
            return Math.max(1, ((Number) value).intValue());
        }
        try {
            return value == null ? 1 : Math.max(1, Integer.parseInt(value.toString()));
        } catch (NumberFormatException ignored) {
            return 1;
        }
    }

    /** 把原始 messageId 和递增 attempt 复制到 TTL retry queue。 */
    private void publishToRetryQueue(Message message, int attempt) {
        String messageId = message.getMessageProperties().getMessageId();
        CorrelationData correlationData = new CorrelationData(messageId + ":retry:" + attempt);
        Future<?> confirmFuture = correlationData.getFuture();
        rabbitTemplate.convertAndSend(
                ReportRabbitTopology.RETRY_EXCHANGE,
                ReportRabbitTopology.RETRY_KEY,
                message.getBody(),
                outgoing -> {
                    outgoing.getMessageProperties().setMessageId(
                            message.getMessageProperties().getMessageId());
                    outgoing.getMessageProperties().setHeader(ATTEMPT_HEADER, attempt);
                    return outgoing;
                },
                correlationData);
        try {
            Object result = confirmFuture.get(5, TimeUnit.SECONDS);
            if (!(result instanceof CorrelationData.Confirm)
                    || !((CorrelationData.Confirm) result).isAck()) {
                throw new IllegalStateException("retry publish was not confirmed");
            }
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("retry publish confirmation interrupted", interrupted);
        } catch (ExecutionException | TimeoutException failed) {
            throw new IllegalStateException("retry publish confirmation failed", failed);
        }
    }
}
```

示例把 `MAX_ATTEMPTS` 限定为一个重试窗口：发布辅助方法先递增 attempt，retry queue 的 TTL 到期后消息回到工作队列，超过上限才由主队列 DLX 接住。
`publishToRetryQueue` 先等待 `CorrelationData` 的 publisher confirm，再返回到 listener 发送 ack；confirm 失败会抛异常，原 delivery 不会被 ack，
而是交给 `default-requeue-rejected=false` 的容器兜底策略进入 DLX。现代线的 `getFuture()` 是 `CompletableFuture`，Java 8 兼容线则是
`SettableListenableFuture`，两者都可以通过 `Future.get` 等待同一确认结果。

### 5. 异常类型和启动入口要有真实定义

监听器捕获的异常应表达业务分类，而不是用字符串比较异常消息。它们可以是同一包下的三个简单运行时异常：

```java
/** 数据库唯一键表明消息已经成功处理。 */
final class AlreadyProcessedException extends RuntimeException {
    /** 创建重复消息异常。 */
    AlreadyProcessedException(String messageId) {
        super("message already processed: " + messageId);
    }
}

/** 可恢复的外部依赖或连接故障。 */
final class TransientDependencyException extends RuntimeException {
    /** 创建临时依赖异常。 */
    TransientDependencyException(String message) {
        super(message);
    }
}

/** payload 或业务对象永久无效。 */
final class PermanentMessageException extends RuntimeException {
    /** 创建永久消息异常。 */
    PermanentMessageException(String message) {
        super(message);
    }
}
```

应用入口负责启动 Spring context 和 Rabbit listener 基础设施：

```java
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** 启动可靠消费示例。 */
@SpringBootApplication
@EnableRabbit
public class ReliableConsumerApplication {
    /** 启动 Spring Boot 应用。 */
    public static void main(String[] args) {
        SpringApplication.run(ReliableConsumerApplication.class, args);
    }
}
```

`@EnableRabbit` 让 listener endpoint 的注册意图在示例中可见；Boot 仍负责连接工厂和 RabbitAdmin 等基础设施。`RabbitTemplate` 的 publisher
confirm 回调必须纳入 `publishToRetryQueue` 的成功条件，确认成功后才允许 ack 原 delivery；课程练习用内存状态机时不模拟这一网络时序。

### 6. Java 8 与 Java 25 只在工程工具链处分叉

listener 使用的 `Message`、`Channel`、`RabbitListener`、`JdbcTemplate` 和 `@Transactional` 在两条版本线都存在，业务控制流不需要
为了兼容 Java 8 改写成另一套确认语义。差异集中在：

| 位置 | JDK 25 / Boot 4.1.1 | Java 8 / Boot 2.3.12 |
| --- | --- | --- |
| 工程目录 | `teamflow-reliable-consumer-modern` | `teamflow-reliable-consumer-legacy` |
| Java 编译目标 | `<java.version>25</java.version>` | `<java.version>1.8</java.version>` |
| MySQL 驱动坐标 | `com.mysql:mysql-connector-j` | `mysql:mysql-connector-java` |
| listener API | Spring AMQP 4.1.1 | Spring AMQP 2.2.18.RELEASE |
| 确认合同 | 成功后 ack，失败按类别处理 | 相同 |

两条线都要检查数据库唯一键、Broker queue 参数和应用日志，不要只因为 Maven 退出码为 0 就宣称已经验证重复消费。

## 六、用可重复故障验证交付结果

### 1. 先准备 Broker、数据库和观察指标

RabbitMQ 管理端使用上一课的 15672，AMQP 连接仍是 5672。准备表结构后，先观察：

```bash
docker compose up -d rabbitmq mysql
curl -u guest:guest http://localhost:15672/api/queues/%2F/teamflow.report.work
curl -u guest:guest http://localhost:15672/api/queues/%2F/teamflow.report.dead.queue
```

重点记录 `messages_ready`、`messages_unacknowledged`、`consumers` 和死信队列的 `messages`。应用日志必须打印 `messageId`、taskId、
attempt、redelivered 和最终动作，但不要打印密码、完整授权头或敏感 payload。

### 2. 成功、重复和事务回滚各验证一次

发布两条拥有相同 `messageId=evt-42` 的消息，预期结果是：

```text
delivery messageId=evt-42 redelivered=false action=processed
delivery messageId=evt-42 redelivered=false action=duplicate-ack
database consumed_message=1 task_notification_update=1
```

第二条即使来自另一个消费者，也会因数据库主键冲突走 duplicate 分支。接着让 `taskId=unknown` 触发永久错误：事务不写入 consumed 表，
消息进入 `teamflow.report.dead.queue`，死信元数据包含原始队列和拒绝原因。

### 3. 临时错误必须能结束

用一个只失败一次的数据库探针或可控外部服务注入临时错误：

```text
attempt=1 messageId=evt-43 action=retry-publish
attempt=2 messageId=evt-43 action=processed
database consumed_message=1 task_notification_update=1
```

把探针改为每次都失败，确认第二次不会无限刷日志：

```text
attempt=1 messageId=evt-44 action=retry-publish
attempt=2 messageId=evt-44 action=retry-publish
attempt=3 messageId=evt-44 action=dead-letter
work_ready=0 dead_messages=1
```

若采用 TTL retry queue，额外检查两次 delivery 之间存在延迟，并读取 `x-death` 或自定义 attempt header。TTL 到期并不意味着任务一定
已经成功，只意味着消息离开了等待队列。

## 七、集中排查五个可靠消费错误

:::pitfalls
### 在 listener 第一行确认消息

**触发条件：** 收到 payload 后先 `basicAck`，再写数据库。

**原因：** ack 让 Broker 删除 delivery，进程在数据库写入前退出时没有可重投消息。

**后果：** 任务状态可能保持未通知，但队列中已经没有恢复线索。

**错误示例：**

```java
channel.basicAck(tag, false);
service.process(messageId, taskId);
```

**正确写法：**

```java
service.process(messageId, taskId);
channel.basicAck(tag, false);
```

**验证方式：** 在两行之间注入进程退出；错误示例丢失消息，正确写法会让未确认 delivery 重投。

### 所有异常都 requeue=true

**触发条件：** JSON 错误、未知任务和数据库宕机都走同一条 nack 分支。

**原因：** 永久坏消息会在队列中忙等，临时故障也没有退避窗口。

**后果：** ready 数量和错误日志持续增长，消费者 CPU 被无效重试占满。

**错误示例：**

```java
catch (Exception error) {
    channel.basicNack(tag, false, true);
}
```

**正确写法：**

```java
if (temporary && attempt < MAX_ATTEMPTS) {
    publishToRetryQueue(message, attempt + 1);
} else {
    channel.basicReject(tag, false);
}
```

**验证方式：** 让一个永久坏消息连续失败，确认它最终只在 dead queue 出现一次而不再回到 work queue。

### 用 redelivered 判断是否已经处理过

**触发条件：** `redelivered=true` 就直接丢弃消息，或 `false` 就认定业务从未执行。

**原因：** redelivered 描述投递历史，不是业务提交历史，连接切换和多个消费者都会改变它的观察位置。

**后果：** 合法重投可能被误删，或已经提交的副作用被重复执行。

**错误示例：**

```java
if (message.getMessageProperties().isRedelivered()) {
    return;
}
```

**正确写法：**

```java
if (consumedMessageRepository.exists(messageId)) {
    channel.basicAck(tag, false);
    return;
}
```

**验证方式：** 用两个不同 messageId 都设置 redelivered=true，确认它们仍分别按数据库状态处理。

### 先提交幂等记录，再提交业务更新

**触发条件：** consumed_message 使用独立事务先写成功，业务更新失败后仍 ack 原消息。

**原因：** 下次重投会被错误当成 duplicate，真正的业务副作用永远不会补上。

**后果：** 数据库显示“已消费”，但任务通知状态没有改变，重试无法修复缺口。

**错误示例：**

```java
consumedMessageRepository.save(messageId); // 独立事务
service.updateTask(taskId);                 // 随后失败
channel.basicAck(tag, false);
```

**正确写法：**

```java
@Transactional
public void process(String messageId, String taskId) {
    saveConsumedMessage(messageId);
    updateTask(taskId);
}
```

**验证方式：** 让业务更新抛错，查询 consumed_message 和任务表，确认两者都没有提交。

### 把 publisher confirm 当成消费完成

**触发条件：** 收到 Broker confirm 后就把任务状态改为 succeeded，或不再关心 consumer ack。

**原因：** publisher confirm 只覆盖 producer 到 Broker 的交接，消费者可能尚未启动或随后失败。

**后果：** 管理端看到发布确认，却没有任何成功消费或最终业务状态。

**错误示例：**

```java
channel.waitForConfirmsOrDie(5_000);
task.markSucceeded();
```

**正确写法：**

```java
channel.waitForConfirmsOrDie(5_000); // 只记录 publish-confirmed
// consumer 事务成功并 basicAck 后，才记录 processed
```

**验证方式：** 发布后立即停止消费者，确认 publish-confirmed 与 processed 两个指标不会被合并成一个成功数。
:::

## 八、练习：实现一个可观察的幂等消费者

:::exercise
### 用 Java 8 语法模拟确认、重投、死信和重复消费

**要求：** 编写一个不连接 RabbitMQ 和数据库的 `ReliableConsumerExercise`，只能使用 Java 8 语法和标准库。模拟四个事件：`evt-1`
第一次处理成功、第二次以相同 messageId 投递并输出 `duplicate-ack`；`evt-2` 第一次抛出临时错误、第二次成功并输出一次 `requeue`
和一次 `processed`；`evt-3` 每次都抛出永久错误并输出 `dead-letter`，不能继续循环；`evt-4` 模拟“业务已提交但 ack 丢失”，再次投递后
走 duplicate 分支。每次输出事件 ID、投递次数、redelivered、动作和业务副作用计数。不要实现真实 Channel、线程、sleep、RabbitMQ
连接、数据库、publisher confirm、TTL 或 Spring API；这个练习只验证本课的状态机和幂等决定。

**验收：** 输出至少包含 `evt-1 sideEffects=1`、`evt-2 requeue=1 processed=1`、`evt-3 deadLetter=1` 和 `evt-4 sideEffects=1`。
:::

### 参考实现

```java
import java.util.HashSet;
import java.util.Set;

/** 用 Java 8 标准库模拟可靠消费和幂等状态。 */
public final class ReliableConsumerExercise {
    /** 启动四组确定性投递。 */
    public static void main(String[] args) {
        ReliableConsumer consumer = new ReliableConsumer();
        consumer.deliver(new Delivery("evt-1", "task-1", 1, false, Failure.NONE));
        consumer.deliver(new Delivery("evt-1", "task-1", 2, true, Failure.NONE));
        consumer.deliver(new Delivery("evt-2", "task-2", 1, false, Failure.TRANSIENT));
        consumer.deliver(new Delivery("evt-2", "task-2", 2, true, Failure.NONE));
        consumer.deliver(new Delivery("evt-3", "task-3", 1, false, Failure.PERMANENT));
        consumer.deliver(new Delivery("evt-4", "task-4", 1, false, Failure.NONE));
        consumer.deliver(new Delivery("evt-4", "task-4", 2, true, Failure.NONE));
        consumer.printSummary();
    }

    /** 表示一次已经带有 redelivered 标记的投递。 */
    private static final class Delivery {
        private final String messageId;
        private final String taskId;
        private final int attempt;
        private final boolean redelivered;
        private final Failure failure;

        /** 创建一条模拟投递。 */
        private Delivery(
                String messageId,
                String taskId,
                int attempt,
                boolean redelivered,
                Failure failure) {
            this.messageId = messageId;
            this.taskId = taskId;
            this.attempt = attempt;
            this.redelivered = redelivered;
            this.failure = failure;
        }
    }

    /** 模拟依赖故障类别。 */
    private enum Failure {
        NONE,
        TRANSIENT,
        PERMANENT
    }

    /** 保存处理过的消息并输出确定性动作。 */
    private static final class ReliableConsumer {
        private final Set<String> consumed = new HashSet<String>();
        private int sideEffects;
        private int requeues;
        private int deadLetters;
        private static final int MAX_ATTEMPTS = 2;

        /** 处理一次投递。 */
        private void deliver(Delivery delivery) {
            if (consumed.contains(delivery.messageId)) {
                print(delivery, "duplicate-ack");
                return;
            }
            if (delivery.failure == Failure.TRANSIENT && delivery.attempt < MAX_ATTEMPTS) {
                requeues++;
                print(delivery, "requeue");
                return;
            }
            if (delivery.failure == Failure.PERMANENT
                    || delivery.failure == Failure.TRANSIENT) {
                deadLetters++;
                print(delivery, "dead-letter");
                return;
            }
            consumed.add(delivery.messageId);
            sideEffects++;
            print(delivery, "processed");
        }

        /** 输出一次投递的可观察动作。 */
        private void print(Delivery delivery, String action) {
            System.out.println("messageId=" + delivery.messageId
                    + " taskId=" + delivery.taskId
                    + " attempt=" + delivery.attempt
                    + " redelivered=" + delivery.redelivered
                    + " action=" + action
                    + " sideEffects=" + sideEffects);
        }

        /** 输出汇总计数。 */
        private void printSummary() {
            System.out.println("evt-1 sideEffects=1");
            System.out.println("evt-2 requeue=" + requeues + " processed=1");
            System.out.println("evt-3 deadLetter=" + deadLetters);
            System.out.println("evt-4 sideEffects=1");
            System.out.println("totals sideEffects=" + sideEffects
                    + " requeues=" + requeues + " deadLetters=" + deadLetters);
        }
    }
}
```

预期输出如下：

```text
messageId=evt-1 taskId=task-1 attempt=1 redelivered=false action=processed sideEffects=1
messageId=evt-1 taskId=task-1 attempt=2 redelivered=true action=duplicate-ack sideEffects=1
messageId=evt-2 taskId=task-2 attempt=1 redelivered=false action=requeue sideEffects=1
messageId=evt-2 taskId=task-2 attempt=2 redelivered=true action=processed sideEffects=2
messageId=evt-3 taskId=task-3 attempt=1 redelivered=false action=dead-letter sideEffects=2
messageId=evt-4 taskId=task-4 attempt=1 redelivered=false action=processed sideEffects=3
messageId=evt-4 taskId=task-4 attempt=2 redelivered=true action=duplicate-ack sideEffects=3
evt-1 sideEffects=1
evt-2 requeue=1 processed=1
evt-3 deadLetter=1
evt-4 sideEffects=1
totals sideEffects=3 requeues=1 deadLetters=1
```

`evt-4` 的第二次投递模拟 ack 丢失后的重投；因为业务状态已经提交，重复投递只能确认并跳过。把 `consumed` 换成数据库表、把
`requeue` 换成 retry queue、把 `dead-letter` 换成 DLX，就得到完整 Spring 工程中的三个对应边界，但这段内存程序本身不能证明
RabbitMQ、MySQL 或 Spring 配置已经接通。

本课完成后，可靠消费的判断顺序应固定为：先用 messageId 查持久化幂等状态，再在事务中执行副作用，成功后 ack；临时错误进入有上限
的 retry 路径，永久错误进入 dead queue；发布端 confirm、消费者 ack、数据库提交和最终业务状态分别记录，不能用其中任意一个状态
冒充另外三个状态。
