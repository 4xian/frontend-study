---
id: backend.java.learn.advanced.async-notification-pipeline
type: lesson
title: "实战：异步通知链路"
summary: 在任务完成后可靠地产生、发布和消费通知，并用幂等、重试与状态观测处理失败
domain: backend
technology: java
module: core
stage: advanced
level: advanced
estimatedMinutes: 240
prerequisites:
  - backend.java.learn.advanced.events-async-scheduling-and-retry
  - backend.java.learn.advanced.message-queue-boundaries
  - backend.java.learn.advanced.rabbitmq-message-send-receive
  - backend.java.learn.advanced.reliable-consumption-and-idempotency
  - backend.java.learn.advanced.concurrent-updates-and-consistency
objectives:
  - 能把任务完成、通知意图、消息发布、通知副作用和最终状态画成独立边界。
  - 能解释 @TransactionalEventListener、@Async 与 transactional outbox 在提交时机和可靠性上的差异。
  - 能在同一数据库事务中写入业务状态和 outbox 事件，并为事件设计稳定的 eventId 与不可变快照。
  - 能实现由 relay 领取、发布、确认和更新 outbox 状态组成的有界流程，并接受 at-least-once 语义。
  - 能在消费端用 eventId 和唯一约束把去重记录与通知副作用放进同一事务。
  - 能区分瞬态错误、永久错误和重复消息，为重试设置上限、退避和 DEAD/补偿出口。
  - 能用状态、结构化日志和低基数指标定位 backlog、延迟、重复和死信，而不是只看一条成功日志。
  - 能在 JDK 25/Spring Boot 4.1.1 与 Java 8/Spring Boot 2.3.12.RELEASE 中保持同一链路合同。
recap:
  - "@TransactionalEventListener(AFTER_COMMIT) 只是事务钩子，无事务或进程崩溃时不能代替持久化队列。"
  - "裸 @Async 只能把调用交给执行器，不能保证事务提交、消息送达或失败重试。"
  - 业务表和 outbox 行必须在同一本地事务中提交；relay 先发布再标记，因此端到端是 at-least-once。
  - eventId 在 relay 重试中保持不变，correlationId 只关联链路，不能用来去重。
  - 消费端把 inbox 唯一记录和通知写入放在同一事务，重复键表示跳过副作用并确认消息。
  - 重试只覆盖可恢复故障，必须有预算、退避和 DEAD/人工补偿状态，不能无限循环。
  - outbox 状态机和指标分别回答“现在在哪里”和“系统是否变慢”，日志不能替代持久状态。
  - Java 8 兼容线复用 Java 8 语法和 JDBC 控制流；不要把 Framework 7 resilience 或 Java 25 API 带入旧工程。
related:
  - backend.java.learn.advanced.events-async-scheduling-and-retry
  - backend.java.learn.advanced.rabbitmq-message-send-receive
  - backend.java.learn.advanced.reliable-consumption-and-idempotency
  - backend.java.learn.advanced.concurrent-updates-and-consistency
tags:
  - Java
  - Spring Boot
  - 事务事件
  - Transactional Outbox
  - RabbitMQ
  - 幂等
  - 重试
  - 异步通知
  - 可观测性
appliesTo: JDK 25 / Spring Boot 4.1.1 / Spring Framework 7.0.9 主线；Java 8 / Spring Boot 2.3.12.RELEASE / Spring Framework 5.2.15.RELEASE 兼容线
verifiedAt: 2026-08-31
sources:
  - id: spring-transaction-events
    title: Spring Framework Reference - Transaction-bound Events
    url: https://docs.spring.io/spring-framework/reference/data-access/transaction/event.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.x；命令式事务语义同样适用于 5.2.x
    claims:
      - "@TransactionalEventListener 默认在 AFTER_COMMIT 阶段处理，没有事务时默认不执行。"
      - 事务事件监听器是事务同步回调，不是持久化消息队列。
  - id: spring7-transactional-event-listener
    title: TransactionalEventListener (Spring Framework 7.0.9)
    url: https://docs.spring.io/spring-framework/docs/7.0.9/javadoc-api/org/springframework/transaction/event/TransactionalEventListener.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.9
    claims:
      - AFTER_COMMIT 之后事务资源可能仍可访问，但后续数据库写入不会再提交到原事务。
      - fallbackExecution=true 才会允许无事务时回退执行，不能隐含可靠投递。
  - id: spring5-transactional-event-listener
    title: TransactionalEventListener (Spring Framework 5.2.15)
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/transaction/event/TransactionalEventListener.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Java 8 兼容线同样支持事务阶段监听，默认 AFTER_COMMIT 且无事务不执行。
  - id: spring-events-reference
    title: Spring Framework Reference - Application Events
    url: https://docs.spring.io/spring-framework/reference/core/beans/context-introduction.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.x / 5.2.x
    claims:
      - 普通事件监听默认在发布线程同步执行，配置异步执行器后才切换线程。
      - 异步监听不自动传播调用方事务和 ThreadLocal 上下文，异常也不会回传发布者。
  - id: mysql-transactions
    title: MySQL 8.4 Reference Manual - InnoDB Transaction Model
    url: https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-model.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4 InnoDB
    claims:
      - InnoDB 事务中的修改在 COMMIT 后持久化，ROLLBACK 撤销当前事务修改。
      - 本地事务只能原子地覆盖同一数据库连接管理的资源。
  - id: rabbitmq-confirms
    title: RabbitMQ - Consumer Acknowledgements and Publisher Confirms
    url: https://www.rabbitmq.com/docs/confirms
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: RabbitMQ 4.3
    claims:
      - publisher confirm 与 consumer acknowledgement 是相反方向的独立确认。
      - 未确认消息可能在连接故障后重新投递，消费者必须能处理重复。
  - id: spring-boot-amqp
    title: Spring Boot Reference - AMQP Support
    url: https://docs.spring.io/spring-boot/reference/messaging/amqp.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.x；基本 listener 能力适用于 2.3.x
    claims:
      - starter-amqp 提供 RabbitTemplate 和 listener container 的自动配置入口。
      - 发送确认、监听确认和拒绝后的重入队策略属于不同配置边界。
  - id: spring-modulith-events
    title: Spring Modulith Reference - Event Externalization and Publication Registry
    url: https://docs.spring.io/spring-modulith/reference/events.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Modulith 2.x / Spring Boot 4.x
    claims:
      - publication registry 在业务事务内保存事件发布记录，并能记录完成或失败。
      - 框架化 publication registry 仍应明确重试与重复发布语义。
  - id: transactional-outbox-pattern
    title: Microservices.io - Transactional Outbox
    url: https://microservices.io/patterns/data/transactional-outbox.html
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: 通用本地事务与消息发布模式
    claims:
      - 业务更新和待发布消息在同一事务中写入，再由独立 relay 发布。
      - relay 可能重复发布，因此消费者必须幂等；该模式不使用 2PC。
  - id: idempotent-consumer-pattern
    title: Microservices.io - Idempotent Consumer
    url: https://microservices.io/patterns/communication-style/idempotent-consumer.html
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: at-least-once 消费系统
    claims:
      - 消费端可用 subscriberId 与 messageId 的唯一记录拦截重复副作用。
      - 去重记录和业务更新需要放在同一事务中。
---

# 实战：异步通知链路

任务从 `IN_PROGRESS` 变成 `DONE` 时，用户希望收到通知。把一行数据库更新和一次远程发送写在同一个方法里，会同时遇到两个窗口：事务回滚后通知可能已经发出，通知成功后进程又可能来不及记录结果。

本课把 TeamFlow 的通知改成一条可恢复链路：业务事务写入任务和 outbox，提交后由 relay 读取已提交事件并发布到已学过的 RabbitMQ，消费者用稳定 `eventId` 去重后再写通知记录。课程不承诺 exactly-once；它要让重复、重试和人工补偿都成为可解释的状态。

## 一、先冻结通知的业务合同

### 1. 把“已完成”和“已通知”分开

任务状态与通知状态属于两个不同的事实。一个任务可以已经完成，但通知仍在 `RETRY_WAIT`；也可以消息已经被 Broker 接收，消费者还没有提交通知记录。不要把 `notificationSent=true` 直接塞进任务更新里来掩盖这些中间状态。

本课使用以下最小事件快照：

```text
TaskCompleted {
  eventId: "evt-7f2c"          // 逻辑事件的稳定幂等键
  aggregateId: "task-42"       // 任务公开 ID
  recipient: "user-7@example.test"
  templateVersion: "task-done-v1"
  correlationId: "req-91"      // 只用于关联一次请求链路
  occurredAt: "2026-08-31T09:00:00Z"
}
```

`eventId` 在 relay 失败重试、Broker 重投和人工补偿中都不变；`correlationId` 可以在下一次请求中变化，因此不能拿它去重。事件还应保存模板版本和收件人快照，避免消费者晚几分钟运行时重新读取到已经变化的任务资料。

### 2. 用状态机表示每一个持久边界

```text
NEW -> PROCESSING -> PUBLISHED -> COMPLETED
  \-> RETRY_WAIT -> PROCESSING
  \-> DEAD
```

`NEW` 表示业务事务已经提交且事件意图存在；`PROCESSING` 是 relay 的短租约；`PUBLISHED` 表示远端发布已确认但本地标记可能还没提交；`COMPLETED` 表示本地已记录完成。可恢复错误进入 `RETRY_WAIT`，永久错误或超过预算进入 `DEAD`。这些是应用合同，不是 Spring 自动提供的枚举。

### 3. 先写验收矩阵再写实现

| 故障位置 | 必须观察到的结果 | 不应作出的承诺 |
| --- | --- | --- |
| 业务事务回滚 | 任务不变、outbox 没有新行、没有通知 | “提交后 listener 一定执行” |
| relay 尚未运行 | outbox 保留 `NEW`，恢复后仍可发布 | “请求返回就已送达” |
| 发布失败后恢复 | attempts 增加，进入 `RETRY_WAIT` 后再次使用同一 eventId | 无限重试 |
| 永久错误 | 进入 `DEAD`，保留最后错误和人工入口 | 把错误消息静默丢弃 |
| 发布成功、标记前崩溃 | 可能再次发布同一 eventId，消费者副作用仍只有一次 | exactly-once |
| 两个消费者同时处理 | 唯一 inbox 记录只有一个成功，另一个跳过 | 只用内存 Set 去重 |

## 二、选择正确的提交后触发点

### 1. `@TransactionalEventListener` 只负责时机

```java
/** 表示任务已经完成的进程内事件。 */
public final class TaskCompletedEvent {
    private final TaskCompleted message;

    /** 创建任务完成事件。 */
    public TaskCompletedEvent(TaskCompleted message) {
        this.message = message;
    }

    /** 返回不可变事件快照。 */
    public TaskCompleted message() {
        return message;
    }
}
```

```java
/** 只在原事务成功提交后唤醒 relay。 */
@Component
public class NotificationWakeup {
    private final OutboxRelay relay;

    /** 创建提交后唤醒器。 */
    public NotificationWakeup(OutboxRelay relay) {
        this.relay = relay;
    }

    /** 提交成功后请求一次非持久化唤醒。 */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void wake(TaskCompletedEvent event) {
        relay.requestScan(event.message().eventId());
    }
}
```

这个 listener 只是一条“现在可以扫描”的提示。没有活动事务时，默认不会调用；进程在提交后、执行回调前崩溃时，提示也会丢失。真正可靠的待办记录必须已经在 outbox 表中，relay 还要有定时扫描作为兜底。

### 2. 裸 `@Async` 不承担可靠投递

```java
/** 在任务完成事务中触发异步通知发送。 */
@Transactional
public void complete(Task task) {
    taskRepository.markDone(task.id());
    notificationService.sendAsync(task.id());
}
```

这段代码无法保证发送发生在提交之后，也无法在进程退出时恢复未完成任务。`@Async` 的线程、事务和请求上下文边界属于前置课；本课只复用结论，改用 outbox 保留待办事实。不要把 `@Async`、普通事件监听器或全局事件执行器误写成消息持久化。

### 3. Spring Modulith 是可选扩展，不是两条基线的共同实现

Spring Modulith 的 publication registry 能把事件发布记录接入业务事务，但 2.x 面向 Spring Boot 4.x。本课的主实现使用显式 outbox 表，保证 Boot 4.1.1 和 Boot 2.3.12 都能看见相同字段、状态和故障矩阵；现代项目可以把 registry 当作替代实现单独评估，不能把它带入 Java 8 工程。

## 三、在一个本地事务里产生 outbox

### 1. 表结构必须能留下失败现场

```sql
CREATE TABLE notification_outbox (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(80) NOT NULL,
    aggregate_id VARCHAR(64) NOT NULL,
    payload JSON NOT NULL,
    status VARCHAR(20) NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    next_attempt_at TIMESTAMP NULL,
    last_error VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,
    lease_until TIMESTAMP NULL,
    UNIQUE KEY uk_notification_event (event_id)
);
```

`event_id` 的唯一约束防止同一个逻辑事件被业务层意外插入两次；`attempts`、`next_attempt_at` 和 `last_error` 让运维能查询“为什么还没送出”。`payload` 是发送时使用的快照，不应把密码、访问令牌或完整请求头写入其中。

### 2. 业务更新和事件插入必须同一个事务

```java
/** 任务完成与通知意图的本地事务边界。 */
@Service
public class TaskCompletionService {
    private final TaskMapper taskMapper;
    private final NotificationOutboxMapper outboxMapper;
    private final ApplicationEventPublisher publisher;

    /** 创建任务完成服务。 */
    public TaskCompletionService(
            TaskMapper taskMapper,
            NotificationOutboxMapper outboxMapper,
            ApplicationEventPublisher publisher) {
        this.taskMapper = taskMapper;
        this.outboxMapper = outboxMapper;
        this.publisher = publisher;
    }

    /** 在一个事务中更新任务并保存待发布事件。 */
    @Transactional
    public void complete(Task task, String correlationId) {
        int changed = taskMapper.markDone(task.id(), task.version());
        if (changed != 1) {
            throw new ConcurrentUpdateException(task.id());
        }
        TaskCompleted message = TaskCompleted.create(task, correlationId);
        outboxMapper.insert(message.eventId(), "TaskCompleted", message.aggregateId(), message.toJson());
        publisher.publishEvent(new TaskCompletedEvent(message));
    }
}
```

如果 `markDone` 或 `insert` 任意一步失败，事务一起回滚；提交成功后才会留下 `NEW` 行。`publishEvent` 只用于尽快唤醒扫描，不是可靠性的依据。`TaskCompleted.create` 应一次生成 eventId 并把相同值写入 outbox 和后续消息，不能每次 relay 尝试重新生成 UUID。

### 3. 用条件更新避免重复完成

```sql
UPDATE task
SET status = 'DONE', version = version + 1
WHERE id = ? AND version = ? AND status = 'IN_PROGRESS';
```

受影响行数为 0 时可能是版本冲突或状态已经改变；服务应重新读取并返回稳定业务结果，不要仍然插入一条“完成通知”。这复用了上一课的 version 合同：outbox 只能原子保存发布意图，不能替代业务状态校验。

## 四、让 relay 以至少一次方式发布

### 1. 领取和发布要分开

relay 不应在持有数据库锁时等待网络。先用短事务按条件把有限行从 `NEW` 或到期的 `RETRY_WAIT` 改成 `PROCESSING`，提交租约后在事务外发布；发布确认后，再用新的短事务把行改成 `PUBLISHED` 或 `COMPLETED`。

```sql
UPDATE notification_outbox
SET status = 'PROCESSING', lease_until = CURRENT_TIMESTAMP + INTERVAL 30 SECOND,
    attempts = attempts + 1
WHERE id = ?
  AND status IN ('NEW', 'RETRY_WAIT')
  AND (next_attempt_at IS NULL OR next_attempt_at <= CURRENT_TIMESTAMP);
```

返回 1 才说明当前 relay 获得租约；返回 0 说明另一 worker 已领取、任务尚未到时间或状态已经变化。两个 relay 不能只依靠各自 JVM 的锁来协调。

### 2. 先确认远端，再标记本地

```java
/** 抽象已学过的 RabbitMQ 发布端口。 */
public interface NotificationPublisher {
    /** 发布携带稳定 eventId 的消息，并返回 Broker 确认结果。 */
    boolean publish(TaskCompleted message);
}

/** 执行一次 outbox 发布尝试。 */
@Service
public class OutboxRelay {
    private final OutboxRepository repository;
    private final NotificationPublisher publisher;

    /** 创建 relay。 */
    public OutboxRelay(OutboxRepository repository, NotificationPublisher publisher) {
        this.repository = repository;
        this.publisher = publisher;
    }

    /** 请求扫描；提示丢失时由定时扫描再次发现 NEW 行。 */
    public void requestScan(String eventId) {
        repository.enqueueScanHint(eventId);
    }

    /** 领取一行、发布并记录可恢复或永久失败。 */
    public void process(OutboxEntry entry) {
        if (!repository.claim(entry.id())) {
            return;
        }
        try {
            boolean confirmed = publisher.publish(entry.message());
            if (!confirmed) {
                throw new TemporaryDeliveryException("publisher did not confirm");
            }
            repository.markPublished(entry.id(), entry.eventId());
        } catch (PermanentDeliveryException failure) {
            repository.markDead(entry.id(), failure.getMessage());
        } catch (RuntimeException failure) {
            if (entry.attempts() >= 5) {
                repository.markDead(entry.id(), failure.getMessage());
            } else {
                repository.scheduleRetry(
                        entry.id(), nextDelay(entry.attempts()), failure.getMessage());
            }
        }
    }

    /** 计算有上限的下一次尝试时间。 */
    private Duration nextDelay(int attempts) {
        return Duration.ofSeconds(Math.min(60, 1L << attempts));
    }
}
```

如果 Broker 已接受消息、进程却在 `markPublished` 前崩溃，恢复后的 relay 可能再次发布同一 eventId。这是可接受的 at-least-once 行为，消费端必须去重；不能为了消除重复而把数据库锁一直持有到远端返回。

### 3. 重试预算要能被检查

```text
attempt 1 -> 1s
attempt 2 -> 2s
attempt 3 -> 4s
attempt 4 -> 8s
attempt 5 -> DEAD
```

真实系统应在退避上加受控 jitter，避免多个 worker 同时醒来；总次数、总时长和延迟上限由业务容量决定。参数无效、模板不存在或收件人被永久拒绝时直接进 `DEAD`；连接超时、Broker 暂不可用等瞬态错误才进入 `RETRY_WAIT`。不要在 worker 中无限 `sleep` 或捕获所有异常后继续循环。

## 五、消费端让副作用只发生一次

### 1. inbox 和通知记录使用同一个事务

```sql
CREATE TABLE notification_inbox (
    consumer_name VARCHAR(80) NOT NULL,
    event_id VARCHAR(64) NOT NULL,
    received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (consumer_name, event_id)
);

CREATE TABLE notification_delivery (
    event_id VARCHAR(64) PRIMARY KEY,
    aggregate_id VARCHAR(64) NOT NULL,
    recipient VARCHAR(160) NOT NULL,
    status VARCHAR(20) NOT NULL,
    delivered_at TIMESTAMP NULL
);
```

```java
/** 处理已确认的任务完成通知。 */
@Service
public class NotificationConsumer {
    private final InboxMapper inboxMapper;
    private final DeliveryMapper deliveryMapper;

    /** 创建消费服务。 */
    public NotificationConsumer(InboxMapper inboxMapper, DeliveryMapper deliveryMapper) {
        this.inboxMapper = inboxMapper;
        this.deliveryMapper = deliveryMapper;
    }

    /** 记录去重键并写入一次通知副作用。 */
    @Transactional
    public ConsumptionResult consume(TaskCompleted message) {
        int inserted = inboxMapper.insert("email-notifier", message.eventId());
        if (inserted == 0) {
            return ConsumptionResult.DUPLICATE;
        }
        deliveryMapper.insertPending(message.eventId(), message.aggregateId(), message.recipient());
        deliveryMapper.markDelivered(message.eventId());
        return ConsumptionResult.COMPLETED;
    }
}
```

唯一键竞争由数据库仲裁：第一个事务插入 inbox 并写通知；重复消息插入 0 行，直接确认并跳过。若通知写入失败，inbox 和副作用一起回滚，后续投递仍可重试。不要先写 inbox 再在另一个事务发送邮件，否则失败时会把尚未完成的事件永久当成重复。

### 2. Broker 确认和业务幂等是两件事

publisher confirm 只说明 Broker 接收了发布，consumer acknowledgement 只说明本次投递的处理责任已经结束；它们都不能单独证明邮件已送达。监听器应在 `consume` 成功或确定跳过重复后 ack；异常则交给前一课的有限重试/死信策略。`prefetch` 只限制在途消息数，不限制业务副作用次数。

### 3. 外部邮件或 HTTP 仍需自己的幂等合同

如果 `deliveryMapper.markDelivered` 之后才调用邮件服务，数据库事务无法回滚远端已经接受的邮件。更稳妥的做法是让通知记录成为下一个发送 outbox，或者调用支持幂等键的提供方，并把 `eventId` 作为请求幂等键。不要把“本地记录已提交”改写成“收件人已经看到邮件”。

## 六、把失败变成可查询的结果

### 1. 每次迁移都记录同一组字段

结构化日志至少包含：

```json
{
  "eventId": "evt-7f2c",
  "aggregateId": "task-42",
  "eventType": "TaskCompleted",
  "status": "RETRY_WAIT",
  "attempt": 2,
  "correlationId": "req-91",
  "nextAttemptAt": "2026-08-31T09:00:04Z",
  "errorClass": "ConnectTimeout"
}
```

日志字段不要包含密码、授权头或完整 payload。`eventId`、`aggregateId`、状态和错误类别适合低基数标签；不要把每个用户邮箱或异常堆栈全文直接作为指标标签。

### 2. 指标回答积压和恢复速度

| 指标 | 含义 |
| --- | --- |
| `notification.outbox.backlog` | `NEW`、`PROCESSING`、`RETRY_WAIT` 的数量 |
| `notification.outbox.oldest_age` | 最早未完成事件的年龄 |
| `notification.publish.latency` | relay 发布确认耗时 |
| `notification.retry.count` | 进入重试的次数 |
| `notification.duplicate.count` | inbox 拦截的重复数量 |
| `notification.dead.count` | 进入 `DEAD` 的事件数量 |

现代 Boot 可用 Micrometer Observation 连接日志、指标和追踪；兼容 Boot 2.3 使用 MeterRegistry 和相同的业务字段。指标存在不等于链路正确，仍要用事务回滚、重复投递和发布后崩溃场景验证状态。

### 3. 人工补偿不能覆盖历史

人工重放应保留原 `eventId`、原始 attempts 和最后错误，新增一次 `RESUBMITTED` 或把状态置回 `RETRY_WAIT` 并记录操作者。这样消费者仍能去重，审计也能看见“为什么再次发送”。直接删除 DEAD 行并生成新 UUID 会破坏排查和重复保护。

## 七、两条版本线只分叉真正不同的依赖

### 1. 现代主线

```xml
<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>4.1.1</version>
</parent>
<properties>
  <java.version>25</java.version>
</properties>
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
  </dependency>
</dependencies>
```

可以使用 Framework 7 的 resilience API，但本课用显式状态和预算表达重试，以便兼容线共享同一行为。Spring Modulith 只作为现代替代方案，不改变主示例的 outbox 字段。

### 2. Java 8 兼容线

```xml
<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>2.3.12.RELEASE</version>
</parent>
<properties>
  <java.version>1.8</java.version>
</properties>
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
  </dependency>
</dependencies>
```

旧工程可以使用 Boot 管理的 `spring-retry`，但 `@Retryable.maxAttempts` 包含初次调用；现代 Framework resilience 的 `maxRetries` 不包含初次调用。为了避免把计数写错，本课的主示例直接在 Java 8 语法下维护 `attempts` 和状态。不要导入 `org.springframework.resilience`，也不要在 Java 8 工程调用 `CompletableFuture.failedFuture`。

## 八、集中排查通知链路中的六个错误

:::pitfalls
### 用 AFTER_COMMIT 监听器直接发送远端通知

**触发条件：** 事务事件 listener 中直接调用邮件服务或 RabbitTemplate，并把回调完成当成持久化成功。

**原因：** listener 是提交后的进程内回调，没有待办行；无事务时默认不执行，进程可在回调前退出。

**后果：** 任务已提交但通知永久消失，或者远端成功后本地没有可查询状态。

**错误示例：**

```java
/** 在提交后发送一次通知的错误示例。 */
@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
public void send(TaskCompleted event) {
    mailClient.send(event.recipient(), event.message());
}
```

**正确写法：**

```java
/** 完成任务并保存待发布事件的正确事务边界。 */
@Transactional
public void complete(Task task) {
    taskMapper.markDone(task.id(), task.version());
    outboxMapper.insert(task.completedEvent());
}
```

**验证方式：** 在提交后回调前终止进程，重启后仍能从 `NEW` outbox 行发布同一事件；回滚事务则不存在 outbox 行。

### 每次 relay 重试都生成新的 eventId

**触发条件：** publisher 超时后重新构造消息，并在构造函数中再次生成 UUID。

**原因：** eventId 没有被当作逻辑事件身份保存，重试被错误地当成新事件。

**后果：** inbox 唯一约束无法拦住重复副作用，收件人可能收到多封通知。

**错误示例：**

```java
/** 使用原始事件身份执行一次重试。 */
void retry(OutboxEntry entry) {
    publisher.publish(new TaskCompleted(UUID.randomUUID().toString(), entry.aggregateId()));
}
```

**正确写法：**

```java
/** 重试时继续使用 outbox 保存的事件身份。 */
void retry(OutboxEntry entry) {
    publisher.publish(entry.messageWithOriginalEventId());
}
```

**验证方式：** 注入“发布成功、标记前崩溃”，恢复后比较两次消息的 eventId 完全相同，并确认消费端只新增一条 inbox 记录。

### 只在内存 Set 中做消费去重

**触发条件：** 每个消费者进程维护 `Set<String> processedIds`，处理消息前只检查这个集合。

**原因：** 进程重启会丢失集合，多个实例之间也没有共享的原子约束。

**后果：** 重启或扩容后重复消息再次执行邮件、积分等副作用。

**错误示例：**

```java
if (!processedIds.add(message.eventId())) {
    return;
}
sendMail(message);
```

**正确写法：**

```java
/** 使用持久化 inbox 记录一次通知消费。 */
@Transactional
public void consume(TaskCompleted message) {
    if (inboxMapper.insert("email-notifier", message.eventId()) == 0) {
        return;
    }
    deliveryMapper.insertAndMarkDelivered(message);
}
```

**验证方式：** 清空消费者进程并启动两个实例，同时投递两次相同 eventId；数据库唯一键只允许一次副作用提交。

### 把所有异常都放进无限重试

**触发条件：** relay 捕获 `Exception` 后立即再次处理，没有 attempts、延迟或终态。

**原因：** 没有区分连接暂时失败、参数错误和永久拒绝。

**后果：** 毒消息占满 worker，backlog 不断增长，真实故障被重试日志淹没。

**错误示例：**

```java
/** 在一次调用中不断重试，形成无界重试的错误示例。 */
void publishForever(OutboxEntry entry) {
    for (;;) {
        try {
            publish(entry);
            break;
        } catch (Exception failure) {
            // 立即无限重试
        }
    }
}
```

**正确写法：**

```java
if (isPermanent(failure) || entry.attempts() >= 5) {
    repository.markDead(entry.id(), failure.getMessage());
} else {
    repository.scheduleRetry(entry.id(), boundedBackoff(entry.attempts()), failure.getMessage());
}
```

**验证方式：** 让发布端连续失败，确认最多 5 次后进入 DEAD；让它在第 3 次恢复，确认只在退避后成功且 attempts 可查询。

### 在持有数据库锁时等待远端

**触发条件：** 事务中 `SELECT ... FOR UPDATE` 领取 outbox 行，然后在同一事务里等待 RabbitMQ 或 HTTP。

**原因：** 网络延迟被扩大成数据库锁持有时间，其他 worker 无法推进领取。

**后果：** 锁等待、连接池耗尽和级联超时，仍不能获得跨资源原子提交。

**错误示例：**

```java
/** 在同一事务锁住行并等待远端的错误示例。 */
@Transactional
public void publishLocked(long id) {
    OutboxEntry entry = repository.findForUpdate(id);
    publisher.publish(entry.message());
    repository.markPublished(id);
}
```

**正确写法：**

```java
/** 先提交领取事务，再在事务外完成发布。 */
void publishAfterClaim(long id) {
    OutboxEntry entry = repository.find(id);
    if (entry != null && repository.claim(id)) {
        publisher.publish(entry.message());
        repository.markPublished(id);
    }
}
```

**验证方式：** 用两个 relay 和一个慢速 publisher 运行，确认领取事务快速提交，第二个 worker 不会长时间持有同一数据库锁。

### 把 correlationId 当成去重键

**触发条件：** inbox 只保存请求的 correlationId，认为同一请求链路中的事件不会重复。

**原因：** correlationId 表示一次调用关联，多个逻辑事件可能共享它，重试也可能由新请求产生新的值。

**后果：** 不同事件被误跳过，或同一事件因关联 ID 改变而重复执行。

**错误示例：**

```java
String dedupeKey = message.correlationId();
```

**正确写法：**

```java
String dedupeKey = message.eventId();
```

**验证方式：** 让两个不同任务共享一个 correlationId，再让同一任务的 relay 重试；断言前者都执行、后者只执行一次。
:::

## 九、练习：让一条通知经历成功、重复和死信

:::exercise
### 实现有界的内存通知管道

**要求：** 使用 Java 8 语法创建 `AsyncNotificationPipelineExercise`。实现不可变 `TaskCompleted`、带 `NEW/PROCESSING/RETRY_WAIT/COMPLETED/DEAD` 状态的 outbox、最多 3 次发布尝试和按 eventId 去重的 inbox。主程序依次模拟：事务提交产生一行；第一次发布失败、第二次成功；同一消息再次消费；另一个消息永久失败。不得使用真实 RabbitMQ、邮件服务、无限循环或 `synchronized`；所有结果从标准输出可观察。

**验收：**

```text
event=evt-1 status=COMPLETED attempts=2 deliveries=1
event=evt-1 duplicate=true deliveries=1
event=evt-2 status=DEAD attempts=3 deliveries=1
```
:::

### 参考实现

```java
import java.util.HashSet;
import java.util.Set;

/** 用 Java 8 标准库模拟 outbox、有限重试和消费幂等。 */
public final class AsyncNotificationPipelineExercise {
    /** 表示通知事件的不可变快照。 */
    private static final class TaskCompleted {
        private final String eventId;
        private final String taskId;

        /** 创建事件快照。 */
        private TaskCompleted(String eventId, String taskId) {
            this.eventId = eventId;
            this.taskId = taskId;
        }
    }

    /** 表示 outbox 的有限状态。 */
    private enum Status {
        NEW, PROCESSING, RETRY_WAIT, COMPLETED, DEAD
    }

    /** 保存一个可重试的 outbox 条目。 */
    private static final class OutboxEntry {
        private final TaskCompleted event;
        private Status status = Status.NEW;
        private int attempts;

        /** 创建新的待发布条目。 */
        private OutboxEntry(TaskCompleted event) {
            this.event = event;
        }
    }

    /** 发布端按预设序列返回成功或失败。 */
    private static final class FakePublisher {
        private final boolean[] outcomes;
        private int index;

        /** 创建可控的发布结果。 */
        private FakePublisher(boolean[] outcomes) {
            this.outcomes = outcomes;
        }

        /** 执行一次发布尝试。 */
        private boolean publish(TaskCompleted event) {
            return outcomes[index++];
        }
    }

    /** 运行成功、重复和死信三条确定性路径。 */
    public static void main(String[] args) {
        Set<String> inbox = new HashSet<String>();
        int deliveries = 0;
        OutboxEntry first = new OutboxEntry(new TaskCompleted("evt-1", "task-1"));
        FakePublisher recovering = new FakePublisher(new boolean[] {false, true});
        while (first.status != Status.COMPLETED && first.status != Status.DEAD) {
            first.status = Status.PROCESSING;
            first.attempts++;
            if (recovering.publish(first.event)) {
                first.status = Status.COMPLETED;
                if (inbox.add(first.event.eventId)) {
                    deliveries++;
                }
            } else if (first.attempts >= 3) {
                first.status = Status.DEAD;
            } else {
                first.status = Status.RETRY_WAIT;
            }
        }
        System.out.println("event=" + first.event.eventId + " status=" + first.status
                + " attempts=" + first.attempts + " deliveries=" + deliveries);

        boolean duplicate = !inbox.add(first.event.eventId);
        System.out.println("event=" + first.event.eventId + " duplicate=" + duplicate
                + " deliveries=" + deliveries);

        OutboxEntry second = new OutboxEntry(new TaskCompleted("evt-2", "task-2"));
        FakePublisher broken = new FakePublisher(new boolean[] {false, false, false});
        while (second.status != Status.COMPLETED && second.status != Status.DEAD) {
            second.status = Status.PROCESSING;
            second.attempts++;
            if (broken.publish(second.event)) {
                second.status = Status.COMPLETED;
                if (inbox.add(second.event.eventId)) {
                    deliveries++;
                }
            } else if (second.attempts >= 3) {
                second.status = Status.DEAD;
            } else {
                second.status = Status.RETRY_WAIT;
            }
        }
        System.out.println("event=" + second.event.eventId + " status=" + second.status
                + " attempts=" + second.attempts + " deliveries=" + deliveries);
    }
}
```

运行结果中的 `deliveries=1` 说明重复消息没有再次产生副作用；`evt-2` 的三次失败进入 `DEAD`，没有无限循环。这个内存练习只验证状态机和幂等控制流，不能替代真实 MySQL 唯一约束、RabbitMQ confirm 或跨进程故障验证。

## 十、端到端复盘

完成 TeamFlow 的真实实现时，按下面顺序核对：

1. `@Transactional` 方法更新任务时，同一连接插入一行 `NEW` outbox；任一步失败都回滚。
2. 提交后 listener 只唤醒 relay，定时扫描仍能发现丢失的唤醒；不要把远端发送放进事务回调。
3. relay 用条件更新领取行，事务外发布带原始 eventId 的消息，收到 confirm 后再标记状态。
4. consumer 在本地事务中插入 inbox 唯一记录并写通知；重复键直接确认并跳过。
5. 瞬态错误按有限预算进入 `RETRY_WAIT`，永久错误进入 `DEAD`，人工重放保留事件身份和历史。
6. 用状态查询、结构化日志和 backlog/latency/retry/duplicate/dead 指标观察恢复，而不是只看 HTTP 202。

Java 8 与 JDK 25 应运行同一组故障矩阵。两条线只替换 POM、DTO 访问器和重试框架入口；outbox 字段、eventId 语义、状态迁移、幂等结果和 API 合同保持一致。本课至此闭合异步通知链路，下一课才进入 TeamFlow 完整交付。
