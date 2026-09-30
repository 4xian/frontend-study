---
id: backend.java.learn.advanced.message-queue-boundaries
type: lesson
title: 消息队列使用边界
summary: 从 HTTP 长任务交接开始，判断何时使用消息队列，并建立交付语义、顺序、积压与双写边界的正确预期
domain: backend
technology: java
module: core
stage: advanced
level: advanced
estimatedMinutes: 195
prerequisites:
  - backend.java.learn.advanced.scheduled-tasks
objectives:
  - 能判断一次 Web 请求应同步完成，还是在校验后以 HTTP 202 交给后台处理。
  - 能说明 producer、exchange、binding、queue 与 consumer 在 RabbitMQ 模型中的职责和消息流向。
  - 能为单次命令选择工作队列，为多个独立反应选择各自队列的事件广播。
  - 能区分 at-most-once、at-least-once 与效果一次，不把 exactly-once 当成一项 Broker 配置。
  - 能解释多消费者、重投、优先级和并发处理为什么会破坏可观察的全局完成顺序。
  - 能根据生产与消费速率差识别积压，并说明扩容、prefetch、限流和队列长度上限各自的代价。
  - 能识别数据库更新与发布消息之间的双写窗口，并说明 outbox 解决的是哪一段一致性问题。
  - 能使用 Java 25 与 Java 8 都可运行的内存模拟，验证工作队列和事件广播的不同合同。
recap:
  - HTTP 202 只表示服务接受了异步处理请求；状态 URL 用于查询后续状态，不能把它描述为任务成功。
  - producer 先把消息交给 exchange，exchange 依 binding 路由到一个或多个 queue，consumer 从 queue 领取消息。
  - 同一工作队列的竞争消费者分担任务；要让多个订阅者都收到同一事实，必须给每个订阅者独立队列。
  - 自动确认或处理前确认可能丢失消息；处理成功后再确认通常带来至少一次和重复处理风险。
  - queue 的入队顺序不是跨连接、重投、多个消费者和并发处理后的全局完成顺序保证。
  - 消费慢于生产时积压会增加；prefetch、扩容、限流和限长分别约束不同环节，也各有吞吐或拒绝代价。
  - 数据库提交和 Broker 发布是两个写入边界；outbox 把业务记录与待发事件放入同一数据库事务，relay 与幂等仍需后续实现。
related:
  - backend.java.learn.intermediate.response-and-status-codes
  - backend.java.learn.intermediate.database-transactions
  - backend.java.learn.intermediate.api-idempotency
  - backend.java.learn.advanced.events-async-scheduling-and-retry
tags:
  - Java
  - Spring Boot
  - RabbitMQ
  - 消息队列
  - HTTP 202
  - 工作队列
  - 事件广播
  - 消费语义
  - 背压
  - Outbox
appliesTo: JDK 25 / Spring Boot 4.1.1 / Spring AMQP 4.1.1 主线；Java 8 / Spring Boot 2.3.12.RELEASE / Spring AMQP 2.2.18.RELEASE 兼容线
verifiedAt: 2026-08-31
sources:
  - id: rfc-9110-202-accepted
    title: RFC 9110 HTTP Semantics - 202 Accepted
    url: https://www.rfc-editor.org/rfc/rfc9110.html#name-202-accepted
    sourceOrigin: official
    sourceType: specification
    appliesTo: RFC 9110
    claims:
      - 202 表示请求已被接受处理但尚未完成，响应应说明当前状态并可指向状态监视器。
  - id: azure-asynchronous-request-reply
    title: Asynchronous Request-Reply Pattern
    url: https://learn.microsoft.com/en-us/azure/architecture/patterns/asynchronous-request-reply
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Azure Architecture Center
    claims:
      - 长任务可以在 API 校验后返回 202 和状态 URL，由后台处理完成。
  - id: spring-amqp-abstractions
    title: Spring AMQP Abstractions
    url: https://docs.spring.io/spring-amqp/reference/amqp/abstractions.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring AMQP 4.1.1
    claims:
      - Spring AMQP 使用 Message、Exchange、Queue 和 Binding 表达 AMQP 的基础对象模型。
      - 生产者发送至 exchange，消费者从 queue 接收消息。
  - id: rabbitmq-work-queues
    title: RabbitMQ Work Queues Tutorial
    url: https://www.rabbitmq.com/tutorials/tutorial-two-java
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: RabbitMQ 4.3
    claims:
      - 同一队列的多个 worker 竞争处理任务，增加 worker 可以分担积压。
      - prefetch 限制未确认消息可改善处理速度不一致时的分发。
  - id: rabbitmq-publish-subscribe
    title: RabbitMQ Publish Subscribe Tutorial
    url: https://www.rabbitmq.com/tutorials/tutorial-three-java
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: RabbitMQ 4.3
    claims:
      - fanout exchange 会把消息路由到所有绑定队列。
      - 每个订阅者应拥有独立队列，才能独立获得完整事件流。
  - id: rabbitmq-reliability
    title: RabbitMQ Reliability Guide
    url: https://www.rabbitmq.com/docs/reliability
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: RabbitMQ 4.3
    claims:
      - consumer acknowledgement 和 publisher confirm 分别表示不同的责任转移。
      - 至少一次投递可能重投，因此消费者应能处理重复消息。
  - id: rabbitmq-confirms
    title: Consumer Acknowledgements and Publisher Confirms
    url: https://www.rabbitmq.com/docs/confirms
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: RabbitMQ 4.3
    claims:
      - 自动确认可能在处理完成前丢失消息，手动确认和发布确认是正交机制。
  - id: rabbitmq-queues
    title: RabbitMQ Queues
    url: https://www.rabbitmq.com/docs/queues
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: RabbitMQ 4.3
    claims:
      - queue 是有序消息集合，但多个消费者、重投、优先级和多连接会改变有效顺序。
  - id: rabbitmq-consumers-prefetch
    title: RabbitMQ Consumer Prefetch
    url: https://www.rabbitmq.com/docs/consumer-prefetch
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: RabbitMQ 4.3
    claims:
      - prefetch_count 限制消费者未确认的在途消息，零表示不限制。
  - id: rabbitmq-flow-control
    title: RabbitMQ Flow Control
    url: https://www.rabbitmq.com/docs/flow-control
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: RabbitMQ 4.3
    claims:
      - 发布速度超过节点或队列能力时，Broker 会对发布连接施加流控。
  - id: rabbitmq-queue-length-limit
    title: RabbitMQ Queue Length Limit
    url: https://www.rabbitmq.com/docs/maxlength
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: RabbitMQ 4.3
    claims:
      - 队列可以限制 ready 消息数量或字节数，达到上限时需要明确丢弃、拒绝或死信语义。
  - id: aws-transactional-outbox
    title: Transactional Outbox Pattern
    url: https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: AWS Prescriptive Guidance
    claims:
      - 业务更新与通知发布的双写会出现部分成功窗口。
      - outbox 将业务记录和待发事件写入同一数据库事务，relay 发布仍可能带来重复。
---

# 消息队列使用边界

一次 Web 请求并不一定要把所有工作留在同一条 HTTP 连接中完成。生成大报表、发送批量通知或把一个事实交给多个独立系统时，
请求线程持续等待会占住连接和应用资源，也会让客户端把“请求已受理”误解成“所有后续工作已成功”。

消息队列把交接点放在 producer 和 consumer 之间。它能够解耦时间、分担负载并暂存突发流量，却不能自动承诺全局顺序、
恰好一次或数据库与消息的一致事务。本课先建立这些判断边界；RabbitMQ 的连接、声明和实际收发留给下一课，确认、重试、
死信和消费幂等留给可靠消费课。

## 一、先把长任务从 HTTP 响应中交出去

### 1. 202 是接收处理，不是处理完成

假设用户请求导出一年报表。若 API 在 HTTP 请求内读取大量数据、生成文件、发送邮件，再返回结果，慢任务会长期占住服务器线程和
反向代理连接。更合适的流程是先校验参数、创建任务记录、交给后台工作者，然后立即把当前已知状态返回给客户端。

```text
POST /reports
    -> 校验账户和导出范围
    -> 创建 job-42，状态为 queued
    -> 发布 ReportRequested(job-42)
    -> 202 Accepted，返回 /reports/job-42

GET /reports/job-42
    -> queued -> running -> succeeded 或 failed
```

`202 Accepted` 的含义很窄：服务器已经接受后续处理，不表示报表已经生成，也不表示它最终必然成功。状态 URL 让客户端在
合适的节奏查询真实终态；也可以由后续课程的通知链路主动告知结果。请求被接受前的参数错误仍应在当前请求中返回 `400` 等
确定错误，不能把所有失败都塞进异步任务。

### 2. 同步、进程内异步和队列解决的不是同一问题

| 方式 | 交接位置 | 适合的工作 | 不能保证的事 |
| --- | --- | --- | --- |
| 同步 HTTP | Controller 调用完成后再响应 | 很快、结果必须立即返回的查询或写入 | 长任务的资源隔离和削峰 |
| 进程内异步 | 同一应用的执行器 | 短暂的本地后台工作 | 进程重启后的任务留存、跨服务交接 |
| 消息队列 | producer 与 Broker 之间 | 可排队的命令、多个独立订阅者、跨进程削峰 | 业务最终成功、全局顺序或跨系统恰好一次 |

前一课的 `@Async` 只是把工作交给本进程的执行器。消息队列可以在明确启用 durable queue 与 persistent message 时提供重启后的消息保存，
同时拥有独立消费边界；未启用这两项时不能把 Broker 当成天然持久化存储。它也不是“更快的 HTTP”，不是把任何
同步调用改成异步的理由。若操作必须立即告诉用户余额是否扣除、库存是否充足，仍要先设计清楚同步业务结果和事务边界。

### 3. 接收前后的失败必须分开表达

在消息交接前，API 还拥有当前请求的直接反馈能力。它应完成鉴权、字段校验、幂等键检查和任务登记。若任务连记录都没有
创建成功，就不应返回 `202`。交接成功后，worker 的失败必须更新任务状态或产生可查询的错误信息；HTTP 响应不能回到过去
改写成失败状态。

这要求 `queued`、`running`、`succeeded` 和 `failed` 是可观察的业务状态，而不是只依赖日志里的某一行文字。日志和指标解释
为什么慢，状态端点回答用户的任务走到了哪里。

## 二、消息流向决定谁会看到一条消息

### 1. 五个对象组成最小路由模型

RabbitMQ 中的消息不会由 producer 直接交给 consumer。更准确的心智模型如下：

```text
producer
   -> exchange
       -> binding -> queue: report-work -> consumer worker-A 或 worker-B
       -> binding -> queue: audit-events -> consumer audit-service
       -> binding -> queue: email-events -> consumer email-service
```

producer 负责创建消息并发布到 exchange。exchange 根据类型和 binding 决定哪些 queue 接收消息；queue 保存等待处理的消息；
consumer 从 queue 领取并处理。`direct`、`topic`、`fanout` 和 `headers` 是不同路由规则，当前先只需要认识“路由到一个队列”
和“路由到多个独立队列”两个结果。

binding 不是 consumer 的订阅记录。它是 exchange 到 queue 的路由关系。消费者离线时，已绑定 queue 中的消息仍可以等待；
反过来，一个没有独立 queue 的订阅者并不能要求收到其他消费者已经领取的消息。

### 2. 一次命令应由一个竞争消费者执行

`ReportRequested` 表示“请生成这份报表”，它是要求系统完成一次工作的 command。把它放进 `report-work` 后，worker-A 和
worker-B 都可以监听同一队列，但一条消息通常只会被其中一个消费者领取。多个 worker 的意义是负载分担，不是让同一报表被
生成两次。

```text
report-work: job-41, job-42, job-43, job-44

worker-A 领取 job-41、job-43
worker-B 领取 job-42、job-44
```

这类竞争消费适合耗时明确、一个处理者就足够的命令。worker 数量增加通常能提升吞吐，但每个 worker 都需要能独立取得处理
所需数据，不能依赖某个 HTTP 请求线程的 `ThreadLocal`、事务或临时文件。

### 3. 一个事实可以让多个独立队列各自处理

`ReportSucceeded` 不是“再执行一次报表”，而是“报表已经生成”这一事实。审计系统要记录它，邮件系统要通知用户，它们彼此
不应抢同一条消息。exchange 把同一事件路由到 `audit-events` 和 `email-events` 两个 queue 后，两边各自消费一次，某一边
暂时停止也不应从另一边拿走消息。

| 需求 | 正确队列关系 | 错误理解 |
| --- | --- | --- |
| 一份报表只生成一次 | 多个 worker 竞争一个工作队列 | 给每个 worker 一份相同 command |
| 审计和邮件都收到完成事件 | 每个订阅者一个独立队列 | 两个服务监听同一个 queue 就能广播 |
| 新增短信订阅者 | 新建短信 queue 并建立 binding | 让短信服务从审计 queue 读取 |

command 与 event 不是由 Java 类名或 exchange 名称决定的。前者表达请求执行，通常有一个业务处理责任；后者表达已经发生的事实，
可以让多个订阅者以各自节奏反应。一个消息的命名、状态和队列关系必须和这个意图一致。

## 三、交付语义是一段故障时间线

### 1. 确认的位置决定可能丢失还是可能重复

consumer 领取消息、处理业务和发出确认是三个不同动作。把确认放在处理之前，崩溃时 Broker 会认为工作已经交付，消息可能丢失；
把确认放在处理之后，崩溃可能发生在业务成功之后、确认到达之前，Broker 会再次投递同一条消息。

```text
处理前确认
  receive -> acknowledge -> 进程崩溃 -> 业务没有完成，消息不再重投

处理后确认
  receive -> 业务写入成功 -> 进程崩溃 -> 未确认消息重投，业务可能再次执行
```

这两条时间线对应常见的交付合同：

| 合同 | 典型行为 | 主要风险 | 业务要求 |
| --- | --- | --- | --- |
| at-most-once | 不等待处理完成就确认，或故障时不重投 | 消息可能丢失 | 可以容忍遗漏，或另有补偿来源 |
| at-least-once | 成功处理后再确认，故障时可重投 | 同一消息可能重复 | 消费端按业务键去重或幂等更新 |
| 效果一次 | 重复投递被业务幂等吸收 | 仍需设计状态与唯一约束 | 对外可观察结果只产生一次 |

Broker 的 publisher confirm 回答的是“发布端是否收到 Broker 确认”，consumer acknowledgement 回答的是“消费端何时承担处理结果”。
它们不是同一个确认。即使两边都开启，也不能自动把 HTTP、数据库、Broker 和邮件服务变成一次不可分割的全局事务。

### 2. exactly-once 不是一句配置承诺

“消息恰好一次”常把三个问题混在一起：消息是否只从 Broker 投递一次、消费者的函数是否只运行一次、外部可观察效果是否只发生
一次。网络中断、进程崩溃和确认丢失使前两个问题很难同时绝对成立；跨数据库和外部系统时更不能只凭一项 Broker 设置承诺
exactly-once。

更诚实的目标是选择 at-least-once，再让消费者以 `messageId`、业务唯一键或状态机条件更新吸收重复，得到效果一次。具体的
手动确认、重投、死信和消费幂等会在“可靠消费与消费幂等”课程完整实现，本课只要求能够识别这项后续责任。

### 3. 发布成功也不等于所有订阅者已完成

producer 得到发布确认后，消息可能只是进入 Broker。一个事件即使已经路由到两个 queue，也可能出现审计已处理而邮件仍在积压的
状态。状态查询要描述谁的哪一步完成，不能把“消息已发布”写成“用户已经收到邮件”。

同样，工作队列中一条 command 的成功状态应由实际业务处理写入，而不是由 Controller 发布消息后立即改成 `succeeded`。

## 四、顺序、并发和积压需要同时取舍

### 1. FIFO 只描述受限条件下的队列顺序

queue 可以按入队顺序保存消息，但这不是“所有业务效果严格按发送顺序完成”的保证。多个发布连接或 channel 可以交错；优先级消息
会改变取出次序；消费者失败后的重投会回到队列；多个消费者领取后，快任务可能先完成。客户端再用并发线程处理时，完成顺序会
进一步与领取顺序脱离。

```text
入队顺序: account-7-1, account-7-2
worker-A 领取 account-7-1，处理较慢
worker-B 领取 account-7-2，处理较快
完成顺序: account-7-2, account-7-1
```

如果同一账户的状态必须严格按顺序改变，先明确选择较低并发的办法，例如单活跃消费者，或按账户键把消息稳定分区。不能只因
队列被称为 FIFO 就让任意多个 worker 并发更新同一实体。按实体顺序和整体吞吐之间的取舍，需要在业务合同中写明。

### 2. prefetch 控制的是在途窗口

consumer 领取而尚未确认的消息称为 in-flight。prefetch 限制一个消费者允许拥有的未确认消息数量。例如两个 worker 都设为
`prefetch=1` 时，一个慢 worker 最多压住一条未完成消息，其他 ready 消息更容易分给空闲 worker。它不能让单条任务更快，
也不能减少系统的总工作量。

过大的 prefetch 会让慢消费者提前拿走许多消息，其他 worker 可能空闲；过小则会增加交接次数和网络往返。它应结合任务时长、
消费者并发、内存预算和积压观测调整，而不是作为固定的“高性能数值”复制到每个队列。

### 3. 积压是速率差留下的库存

若 producer 每秒发布五条报表任务，而所有 consumer 每秒只能完成两条，ready backlog 每秒大约增加三条。队列把峰值推迟到
以后处理，但不会消灭工作量。持续积压会拉长用户等待时间、增加磁盘或内存压力，并最终碰到业务过期或容量边界。

| 手段 | 改变的位置 | 代价或前提 |
| --- | --- | --- |
| 增加可横向扩展的 consumer | 提升处理能力 | 下游数据库或外部 API 也必须承受更高并发 |
| 限流、合并或拒绝新请求 | 降低生产速率 | 用户需要看到明确的稍后重试或排队语义 |
| 调整 prefetch | 控制每个 consumer 的在途窗口 | 不会提升单条任务本身的处理速度 |
| 限制 queue 长度 | 约束 ready 消息容量 | 必须选定丢弃、拒绝发布或死信的业务后果 |
| 观察 Broker 流控 | 防止节点失去控制 | 发布端变慢是保护信号，不是无成本扩容 |

队列长度上限不是可靠性开关。达到上限时，如果策略是丢弃旧消息，系统必须知道哪些任务允许丢；如果策略是拒绝发布，API 或
producer 必须能把拒绝转成可重试或明确失败。无论哪种策略，业务都不能继续假装所有请求已经可靠受理。

## 五、数据库和消息之间还有一道双写窗口

### 1. 两次写入之间总能出现故障

处理创建订单、生成报表或更新任务状态时，常见的直觉代码是先提交数据库，再发布事件：

```java
saveReportStatus(jobId, "succeeded");
publishReportSucceeded(jobId);
```

若数据库提交成功后进程在发布前崩溃，用户可以查到报表成功，但邮件和审计事件永远没有发出。反过来，先发布再提交数据库，
则可能让订阅者看到一个最终回滚的事实。这不是简单的 `try-catch` 漏写，而是数据库事务和 Broker 发布属于两个独立写入系统。

### 2. outbox 把哪两个动作放在一起

outbox 的方向是在一次数据库事务中同时写入业务数据和一条待发布记录：

```text
数据库事务
  -> report_job 状态改为 succeeded
  -> outbox_event 写入 ReportSucceeded(job-42)
  -> commit

独立 relay
  -> 读取已提交 outbox_event
  -> 发布到 Broker
  -> 记录已发送或按策略重试
```

这样可以避免“业务已提交但待发事件根本没有留下记录”。它没有让 relay 天然只发布一次，relay 在发布后、标记发送前崩溃仍可能
再次发布。因此 outbox 和消费者幂等是相邻能力，不应在当前课用一个伪事务注解声称已经全部解决。

### 3. 当前课先记录边界，后续课再实现可靠性

本课的内存示例只演示 command 与 event 的分流，不连接 Broker，也不伪造数据库事务。下一课负责 RabbitMQ connection、
exchange、queue、binding、`RabbitTemplate` 和 `@RabbitListener` 的真实收发；可靠消费课再处理 acknowledgement、重投、
dead-letter、幂等与 outbox 的落地方式。把边界提前说清，能避免在第一段 Broker 配置出现时就形成错误承诺。

## 六、用内存模拟观察两种队列合同

### 1. 程序先接受报表任务，再由一个 worker 完成

下面的程序不依赖 RabbitMQ 或 Spring API，目的是让消息流向和状态变化可运行、可观察。`submit` 模拟 `POST /reports`：
空账户返回 `400`，有效请求创建 queued 状态并返回 `202`。两个 worker 共同监听同一个 `report-work`，但此处只让 worker-A
领取一条消息，便于观察一份 command 只被一个竞争消费者处理。

`publish` 模拟 exchange 到两个独立事件队列的 binding。`audit` 和 `email` 各自领取同一份完成事件，证明广播不是两个消费者
竞争一个 queue。代码只使用 Java 8 已有的类和语法，所以 JDK 25 与 Java 8 可以使用同一份源码和同一组输出。

```java
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** 演示 HTTP 接收、工作队列和事件广播的边界。 */
public final class MessageQueueBoundaryDemo {

    /** 运行可观察的内存消息流程。 */
    public static void main(String[] args) {
        WorkQueue<ReportRequested> workQueue = new WorkQueue<ReportRequested>();
        EventExchange<ReportSucceeded> eventExchange = new EventExchange<ReportSucceeded>();
        WorkQueue<ReportSucceeded> auditQueue = new WorkQueue<ReportSucceeded>();
        WorkQueue<ReportSucceeded> emailQueue = new WorkQueue<ReportSucceeded>();
        JobStore jobStore = new JobStore();
        eventExchange.bind(auditQueue);
        eventExchange.bind(emailQueue);

        ReportApi api = new ReportApi(workQueue, jobStore);
        System.out.println("POST invalid status=" + api.submit(" ").statusCode);
        AcceptedResponse response = api.submit("account-7");
        System.out.println("POST status=" + response.statusCode + " location=" + response.statusUrl);
        System.out.println("GET status=" + jobStore.statusOf(response.jobId));

        ReportWorker workerA = new ReportWorker("worker-A", workQueue, eventExchange, jobStore);
        ReportWorker workerB = new ReportWorker("worker-B", workQueue, eventExchange, jobStore);
        workerA.processOne();
        workerB.processOne();
        System.out.println("GET status=" + jobStore.statusOf(response.jobId));

        printEvent("audit", auditQueue.receive());
        printEvent("email", emailQueue.receive());

        System.out.println("at-most-once lost=" + DeliveryProbe.atMostOnceLost());
        System.out.println("at-least-once redelivery=" + DeliveryProbe.atLeastOnceRedelivery());
        System.out.println("single-order=" + OrderProbe.singleConsumerOrder());
        System.out.println("completion-order=" + OrderProbe.parallelCompletionOrder());
        System.out.println("ready-backlog=" + BacklogProbe.afterThreeRounds(5, 2));
        System.out.println("backlog-response=scale-consumers-or-rate-limit-producers");
        System.out.println("prefetch=in-flight-window-not-work-reduction");
        System.out.println("db-first failure=" + DoubleWriteProbe.databaseFirstFailure());
        System.out.println("message-first failure=" + DoubleWriteProbe.messageFirstFailure());
        System.out.println("outbox=" + DoubleWriteProbe.outboxDirection());
    }

    /** 输出一个独立订阅者看到的事件。 */
    private static void printEvent(String subscriber, ReportSucceeded event) {
        System.out.println(subscriber + " received=" + event.jobId);
    }

    /** 用确认时机模拟最多一次可能丢失的故障结果。 */
    private static final class DeliveryProbe {
        /** 禁止创建只提供静态故障探针的工具类实例。 */
        private DeliveryProbe() {
        }

        /** 处理前确认后注入崩溃，观察消息从队列中消失。 */
        private static boolean atMostOnceLost() {
            DeliveryState state = new DeliveryState();
            state.receive();
            state.acknowledge();
            state.crash();
            return state.isLost();
        }

        /** 处理完成但确认前注入崩溃，观察消息重新进入队列。 */
        private static boolean atLeastOnceRedelivery() {
            DeliveryState state = new DeliveryState();
            state.receive();
            state.process();
            state.crash();
            return state.isRedelivered();
        }
    }

    /** 记录领取、处理、确认和崩溃之间的消息状态。 */
    private static final class DeliveryState {
        private boolean queued = true;
        private boolean inFlight;
        private boolean acknowledged;
        private boolean processed;

        /** 将一条消息从 ready 队列移到在途状态。 */
        private void receive() {
            queued = false;
            inFlight = true;
        }

        /** 在业务处理前确认消息。 */
        private void acknowledge() {
            acknowledged = true;
            inFlight = false;
        }

        /** 标记业务处理已经完成，但不发送确认。 */
        private void process() {
            processed = true;
        }

        /** 模拟进程崩溃，并让未确认的在途消息重新排队。 */
        private void crash() {
            if (inFlight && !acknowledged) {
                queued = true;
            }
            inFlight = false;
        }

        /** 判断消息是否已确认却没有完成业务。 */
        private boolean isLost() {
            return !queued && !processed;
        }

        /** 判断已处理但未确认的消息是否可以再次领取。 */
        private boolean isRedelivered() {
            return queued && processed;
        }
    }

    /** 用固定耗时顺序演示并发完成顺序不等于入队顺序。 */
    private static final class OrderProbe {
        /** 禁止创建只提供静态顺序探针的工具类实例。 */
        private OrderProbe() {
        }

        /** 单消费者依次领取时保持入队顺序。 */
        private static String singleConsumerOrder() {
            ArrayDeque<String> queue = new ArrayDeque<String>();
            queue.addLast("job-1");
            queue.addLast("job-2");
            StringBuilder result = new StringBuilder();
            while (queue.size() > 0) {
                if (result.length() > 0) {
                    result.append(',');
                }
                result.append(queue.removeFirst());
            }
            return result.toString();
        }

        /** 返回第二条更快完成时的可观察顺序。 */
        private static String parallelCompletionOrder() {
            List<Task> inFlight = new ArrayList<Task>();
            inFlight.add(new Task("job-1", 2));
            inFlight.add(new Task("job-2", 1));
            StringBuilder result = new StringBuilder();
            while (inFlight.size() > 0) {
                Task fastest = inFlight.get(0);
                for (Task task : inFlight) {
                    if (task.duration < fastest.duration) {
                        fastest = task;
                    }
                }
                if (result.length() > 0) {
                    result.append(',');
                }
                result.append(fastest.jobId);
                inFlight.remove(fastest);
            }
            return result.toString();
        }

        /** 表示一条具有确定处理耗时的在途任务。 */
        private static final class Task {
            private final String jobId;
            private final int duration;

            /** 创建任务并记录其模拟处理耗时。 */
            private Task(String jobId, int duration) {
                this.jobId = jobId;
                this.duration = duration;
            }
        }
    }

    /** 用生产速率与消费速率的差值模拟 ready backlog。 */
    private static final class BacklogProbe {
        /** 禁止创建只提供静态积压探针的工具类实例。 */
        private BacklogProbe() {
        }

        /** 运行三轮并返回每轮积压数量。 */
        private static String afterThreeRounds(int produced, int consumed) {
            int backlog = 0;
            StringBuilder result = new StringBuilder();
            for (int round = 1; round <= 3; round++) {
                backlog = backlog + produced - consumed;
                if (round > 1) {
                    result.append(',');
                }
                result.append(backlog);
            }
            return result.toString();
        }
    }

    /** 用字符串结果记录数据库写入和消息发布的两个故障窗口。 */
    private static final class DoubleWriteProbe {
        /** 禁止创建只提供静态双写探针的工具类实例。 */
        private DoubleWriteProbe() {
        }

        /** 驱动数据库先提交、发布前崩溃的状态转换。 */
        private static String databaseFirstFailure() {
            DoubleWriteState state = new DoubleWriteState();
            state.commitDatabase();
            state.crash();
            state.publishMessage();
            return "database-committed=" + state.databaseCommitted
                    + ",message-published=" + state.messagePublished;
        }

        /** 驱动发布先成功、数据库提交前崩溃的状态转换。 */
        private static String messageFirstFailure() {
            DoubleWriteState state = new DoubleWriteState();
            state.publishMessage();
            state.crash();
            state.commitDatabase();
            return "message-published=" + state.messagePublished
                    + ",database-committed=" + state.databaseCommitted;
        }

        /** 驱动 outbox 将业务记录和待发事件一起提交。 */
        private static String outboxDirection() {
            OutboxState state = new OutboxState();
            state.commitBusinessAndPendingEvent();
            return state.description();
        }

        /** 记录数据库提交与消息发布各自是否完成。 */
        private static final class DoubleWriteState {
            private boolean databaseCommitted;
            private boolean messagePublished;
            private boolean crashed;

            /** 提交数据库写入，崩溃后不再执行。 */
            private void commitDatabase() {
                if (!crashed) {
                    databaseCommitted = true;
                }
            }

            /** 发布消息，崩溃后不再执行。 */
            private void publishMessage() {
                if (!crashed) {
                    messagePublished = true;
                }
            }

            /** 模拟第一次写入后的进程崩溃。 */
            private void crash() {
                crashed = true;
            }
        }

        /** 记录业务记录和待发事件是否在同一事务中提交。 */
        private static final class OutboxState {
            private boolean businessCommitted;
            private boolean pendingEventCommitted;

            /** 一次提交业务记录和待发事件。 */
            private void commitBusinessAndPendingEvent() {
                businessCommitted = true;
                pendingEventCommitted = true;
            }

            /** 返回 outbox 方向的可观察描述。 */
            private String description() {
                return businessCommitted && pendingEventCommitted
                        ? "business-and-pending-event-commit-together"
                        : "outbox-transaction-incomplete";
            }
        }
    }

    /** 表示 API 已接受但尚未完成的异步请求。 */
    private static final class AcceptedResponse {
        private final int statusCode;
        private final String jobId;
        private final String statusUrl;

        /** 保存本次响应可立即确认的字段。 */
        private AcceptedResponse(int statusCode, String jobId, String statusUrl) {
            this.statusCode = statusCode;
            this.jobId = jobId;
            this.statusUrl = statusUrl;
        }
    }

    /** 模拟只负责接收请求的 HTTP API。 */
    private static final class ReportApi {
        private final WorkQueue<ReportRequested> workQueue;
        private final JobStore jobStore;
        private int sequence;

        /** 注入任务队列和状态存储。 */
        private ReportApi(WorkQueue<ReportRequested> workQueue, JobStore jobStore) {
            this.workQueue = workQueue;
            this.jobStore = jobStore;
        }

        /** 校验请求，登记任务并返回 202 接收状态。 */
        private AcceptedResponse submit(String accountId) {
            if (accountId == null || accountId.trim().isEmpty()) {
                return new AcceptedResponse(400, "", "");
            }
            sequence++;
            String jobId = "job-" + sequence;
            jobStore.mark(jobId, "queued");
            workQueue.send(new ReportRequested(jobId, accountId));
            return new AcceptedResponse(202, jobId, "/reports/" + jobId);
        }
    }

    /** 模拟从同一工作队列竞争领取 command 的 worker。 */
    private static final class ReportWorker {
        private final String workerName;
        private final WorkQueue<ReportRequested> workQueue;
        private final EventExchange<ReportSucceeded> eventExchange;
        private final JobStore jobStore;

        /** 注入本 worker 所需的队列和状态依赖。 */
        private ReportWorker(
                String workerName,
                WorkQueue<ReportRequested> workQueue,
                EventExchange<ReportSucceeded> eventExchange,
                JobStore jobStore) {
            this.workerName = workerName;
            this.workQueue = workQueue;
            this.eventExchange = eventExchange;
            this.jobStore = jobStore;
        }

        /** 领取至多一条 command，完成后发布事实事件。 */
        private void processOne() {
            ReportRequested request = workQueue.receive();
            if (request == null) {
                return;
            }
            jobStore.mark(request.jobId, "running");
            System.out.println(workerName + " handled=" + request.jobId);
            jobStore.mark(request.jobId, "succeeded");
            eventExchange.publish(new ReportSucceeded(request.jobId));
        }
    }

    /** 保存报告请求的最小 command 数据。 */
    private static final class ReportRequested {
        private final String jobId;
        private final String accountId;

        /** 创建一条等待执行的报告请求。 */
        private ReportRequested(String jobId, String accountId) {
            this.jobId = jobId;
            this.accountId = accountId;
        }
    }

    /** 保存报告已经完成的事件数据。 */
    private static final class ReportSucceeded {
        private final String jobId;

        /** 创建一条报告成功事件。 */
        private ReportSucceeded(String jobId) {
            this.jobId = jobId;
        }
    }

    /** 用先进先出的内存结构表示一个 queue。 */
    private static final class WorkQueue<T> {
        private final ArrayDeque<T> messages = new ArrayDeque<T>();

        /** 向队尾加入一条等待处理的消息。 */
        private void send(T message) {
            messages.addLast(message);
        }

        /** 从队头领取一条消息，没有消息时返回 null。 */
        private T receive() {
            return messages.pollFirst();
        }
    }

    /** 用多个独立队列模拟 exchange 的广播路由。 */
    private static final class EventExchange<T> {
        private final List<WorkQueue<T>> bindings = new ArrayList<WorkQueue<T>>();

        /** 建立一个 exchange 到 queue 的 binding。 */
        private void bind(WorkQueue<T> queue) {
            bindings.add(queue);
        }

        /** 将同一事件分别写入每个已绑定的独立队列。 */
        private void publish(T event) {
            for (WorkQueue<T> queue : bindings) {
                queue.send(event);
            }
        }
    }

    /** 用任务编号保存可查询的业务状态。 */
    private static final class JobStore {
        private final Map<String, String> statuses = new LinkedHashMap<String, String>();

        /** 记录一次任务状态转换。 */
        private void mark(String jobId, String status) {
            statuses.put(jobId, status);
        }

        /** 返回当前已登记的状态。 */
        private String statusOf(String jobId) {
            return statuses.get(jobId);
        }
    }
}
```

运行结果如下。worker-B 没有处理任何 command，因为 worker-A 已经从唯一工作队列领取了它；audit 和 email 却都看到了相同的
完成事实，因为它们拥有不同的队列。

```text
POST invalid status=400
POST status=202 location=/reports/job-1
GET status=queued
worker-A handled=job-1
GET status=succeeded
audit received=job-1
email received=job-1
at-most-once lost=true
at-least-once redelivery=true
single-order=job-1,job-2
completion-order=job-2,job-1
ready-backlog=3,6,9
backlog-response=scale-consumers-or-rate-limit-producers
prefetch=in-flight-window-not-work-reduction
db-first failure=database-committed,message-published=false
message-first failure=message-published=true,database-committed=false
outbox=business-and-pending-event-commit-together
```

### 2. 这个程序刻意没有模拟的部分

内存 `WorkQueue` 不会在进程关闭后保存消息，也没有 acknowledgement、redelivery、prefetch、发布确认或限长策略。因此它只能
证明 command 竞争消费和 event 独立广播的模型，不能证明任何 RabbitMQ 配置正确。真实 Broker 接入后，还必须通过 queue 指标、
consumer 状态和故障注入确认交付语义。

Java 25 与 Java 8 在本程序使用的 `ArrayDeque`、集合、内部类和泛型语法上没有本课需要处理的差异。为了避免制造虚假的版本对照，
两条版本线都运行同一份源码；实际 Spring AMQP 的连接与注解差异在下一课按对应版本 API 就近说明。

## 七、集中排除常见的消息边界错误

:::pitfalls
### 返回 202 后立刻宣称业务成功

**触发条件：** Controller 发布 command 后，不等待 worker 的真实结果就把任务状态写成 `succeeded`。

**原因：** 代码把 HTTP acceptance 和后台业务 completion 当成同一个时间点。

**后果：** worker 稍后失败时，用户已经查询到错误的成功状态，无法决定重试或查看失败原因。

**错误示例：**

```java
/** 错误地把消息发布视为业务完成。 */
public AcceptedResponse submit(String jobId) {
    workQueue.send(new ReportRequested(jobId));
    jobStore.mark(jobId, "succeeded");
    return new AcceptedResponse(202, jobId);
}
```

**正确写法：**

```java
/** 只登记已排队状态，等待 worker 写入终态。 */
public AcceptedResponse submit(String jobId) {
    jobStore.mark(jobId, "queued");
    workQueue.send(new ReportRequested(jobId));
    return new AcceptedResponse(202, jobId);
}
```

**影响版本：** HTTP 语义、Java 25、Java 8 与所有 Spring Boot 版本。

**验证方式：** 让 worker 在领取后确定失败；正确版的首次查询是 `queued`，终态变为 `failed`，不会在 `202` 时提前显示成功。

### 让两个订阅者竞争同一个队列来实现广播

**触发条件：** 审计和邮件服务都监听 `report-events`，却只创建一个 queue。

**原因：** 同一 queue 的多个 consumer 是竞争关系，不会把每条消息复制给每个 consumer。

**后果：** 每个事件只有审计或邮件中的一个处理，另一个订阅者随机漏掉事实。

**错误示例：**

```java
/** 两个消费者抢同一条事件，不能得到广播。 */
WorkQueue<ReportSucceeded> reportEvents = new WorkQueue<ReportSucceeded>();
auditConsumer.listen(reportEvents);
emailConsumer.listen(reportEvents);
```

**正确写法：**

```java
/** exchange 为每个独立订阅者路由一份事件。 */
exchange.bind(auditEvents);
exchange.bind(emailEvents);
auditConsumer.listen(auditEvents);
emailConsumer.listen(emailEvents);
```

**影响版本：** RabbitMQ 4.3、Spring AMQP 4.1.1 与 Spring AMQP 2.2.18.RELEASE。

**验证方式：** 发布一条 `ReportSucceeded`；正确版在 audit 和 email 的独立消费记录中各出现一次。

### 把自动确认当成 exactly-once

**触发条件：** consumer 领取消息后立刻确认，并宣称消息不会重复也不会丢失。

**原因：** 确认只表示 Broker 不再负责重投；处理尚未完成时进程崩溃会留下丢失窗口。

**后果：** 报表、邮件或库存更新可能根本没有执行，且队列中已没有可重试消息。

**错误示例：**

```java
/** 错误地在业务处理前放弃重投机会。 */
public void handle(ReportRequested request) {
    acknowledge(request);
    generateReport(request);
}
```

**正确写法：**

```java
/** 成功处理后再确认，并准备接受重复投递。 */
public void handle(ReportRequested request) {
    generateReport(request);
    acknowledge(request);
}
```

**影响版本：** RabbitMQ 4.3、Java 25 与 Java 8。

**验证方式：** 在两行之间注入进程崩溃；错误版允许消息丢失，正确版会产生可重投的至少一次语义，消费端还需幂等处理重复。

### 用 FIFO 名称承诺全局完成顺序

**触发条件：** 同一账户的两条更新由多个 worker 并发处理，却断言先入队的消息一定先完成。

**原因：** 多个 consumer 的领取、处理耗时、重投和客户端并发都会让完成次序独立于入队次序。

**后果：** 较新的状态可能先落库，较旧的消息随后覆盖它，形成错误业务状态。

**错误示例：**

```java
/** 错误地让同一实体的命令任意并发完成。 */
workerPool.submit(() -> updateAccount("account-7", 1));
workerPool.submit(() -> updateAccount("account-7", 2));
```

**正确写法：**

```java
/** 为需要顺序的实体选择稳定分区或单活跃处理者。 */
accountQueueFor("account-7").send(new AccountUpdate("account-7", 1));
accountQueueFor("account-7").send(new AccountUpdate("account-7", 2));
```

**影响版本：** RabbitMQ 4.3、Java 25 与 Java 8。

**验证方式：** 让第一条处理更慢；任意并发版可以观察到第二条先完成，稳定分区版由同一顺序 owner 依次处理。

### 把队列上限当作可靠接收保证

**触发条件：** 配置最大长度后，API 仍然无条件返回任务已被可靠受理。

**原因：** 到达长度上限时，Broker 可能丢弃 ready 消息、拒绝发布或执行死信策略，不同策略具有不同业务后果。

**后果：** 用户看到 `202`，但任务可能已被丢弃，或 producer 实际收到拒绝却没有转换为可见状态。

**错误示例：**

```java
/** 错误地忽略发布被拒绝或容量耗尽。 */
publisher.publish(request);
return AcceptedResponse.accepted(request.jobId());
```

**正确写法：**

```java
/** 将发布结果映射为可查询的受理或拒绝状态。 */
if (publisher.tryPublish(request)) {
    return AcceptedResponse.accepted(request.jobId());
}
return AcceptedResponse.rejected(request.jobId());
```

**影响版本：** RabbitMQ 4.3、Spring AMQP 4.1.1 与 Spring AMQP 2.2.18.RELEASE。

**验证方式：** 用超过队列上限的输入测试选定策略；客户端必须看到与丢弃、拒绝或死信策略一致的状态，不能一律显示已接受。
:::

## 八、练习：为报表导出选择正确的交接合同

:::exercise
### 完成命令和事件的分流模拟

**要求：** 编写一个不连接外部 Broker 的 Java 程序。空账户必须得到 `400`；有效 `POST /reports` 模拟返回 `202`、jobId 和状态 URL，`GET` 状态先为 `queued`，worker 完成后变为 `succeeded`，未知 job 返回 `not-found`。将 `ReportRequested` 放入一个工作队列，两个 worker 竞争处理四条 command，每条只能输出一次。每次成功都要把 `ReportSucceeded` 广播到 audit 与 email 两个独立队列。用确定性故障探针输出处理前确认可能丢失、处理后确认可能重投；分别输出单消费者领取顺序和并发完成顺序。额外输出 producer 每轮五条、consumer 每轮两条时连续三轮的 ready backlog，给出扩容消费者和限流 producer 两种治理动作的代价，并说明 prefetch 只限制在途窗口。记录数据库先提交/消息先发布两类双写窗口和 outbox 方向。不得实现真实 acknowledgement、重试、死信、RabbitMQ 连接或 outbox relay。

**验收：**

```text
invalid status=400
accepted status=202 location=/reports/job-1 jobId=job-1
GET status=queued
GET unknown=not-found
work handled=4 uniqueJobs=4 worker-A=2 worker-B=2
GET status=succeeded
audit events=4
email events=4
at-most-once lost=true
at-least-once redelivery=true
single-order=job-1,job-2
completion-order=job-2,job-1
round=1 readyBacklog=3
round=2 readyBacklog=6
round=3 readyBacklog=9
scale-consumers tradeoff=downstream-load
rate-limit-producer tradeoff=rejected-or-delayed-requests
prefetch=in-flight-window-not-work-reduction
db-first failure=database-committed,message-published=false
message-first failure=message-published=true,database-committed=false
outbox=business-and-pending-event-commit-together
boundary=database-commit-and-publish-are-separate-writes
```
:::

参考实现使用一条普通 Java 源文件，可在 Java 25 和 Java 8 分别执行 `javac MessageQueueBoundaryExercise.java` 与
`java MessageQueueBoundaryExercise`。这里用计数器模拟积压，目的不是构造 Broker 指标，而是验证“生产快于消费时库存上升”的
速率关系。

```java
import java.util.ArrayDeque;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

/** 练习参考实现，验证工作队列、事件广播和积压方向。 */
public final class MessageQueueBoundaryExercise {

    /** 执行完整练习反馈环。 */
    public static void main(String[] args) {
        WorkQueue<ReportRequested> workQueue = new WorkQueue<ReportRequested>();
        WorkQueue<ReportSucceeded> auditQueue = new WorkQueue<ReportSucceeded>();
        WorkQueue<ReportSucceeded> emailQueue = new WorkQueue<ReportSucceeded>();
        Set<String> handledJobs = new HashSet<String>();
        JobStore jobStore = new JobStore();
        ReportApi api = new ReportApi(workQueue, jobStore);
        System.out.println("invalid status=" + api.submit("").statusCode);
        AcceptedResponse accepted = api.submit("account-7");
        System.out.println("accepted status=" + accepted.statusCode
                + " location=" + accepted.statusUrl + " jobId=" + accepted.jobId);
        System.out.println("GET status=" + jobStore.statusOf(accepted.jobId));
        System.out.println("GET unknown=" + jobStore.statusOf("job-404"));
        for (int index = 2; index <= 4; index++) {
            api.submit("account-" + index);
        }

        Worker workerA =
                new Worker("worker-A", workQueue, auditQueue, emailQueue, handledJobs, jobStore);
        Worker workerB =
                new Worker("worker-B", workQueue, auditQueue, emailQueue, handledJobs, jobStore);
        while (workQueue.size() > 0) {
            workerA.processOne();
            workerB.processOne();
        }
        System.out.println("work handled=" + (workerA.processed + workerB.processed)
                + " uniqueJobs=" + handledJobs.size()
                + " worker-A=" + workerA.processed
                + " worker-B=" + workerB.processed);
        System.out.println("GET status=" + jobStore.statusOf(accepted.jobId));
        System.out.println("audit events=" + auditQueue.size());
        System.out.println("email events=" + emailQueue.size());

        System.out.println("at-most-once lost=" + DeliveryProbe.atMostOnceLost());
        System.out.println("at-least-once redelivery=" + DeliveryProbe.atLeastOnceRedelivery());
        System.out.println("single-order=" + OrderProbe.singleConsumerOrder());
        System.out.println("completion-order=" + OrderProbe.parallelCompletionOrder());

        int readyBacklog = 0;
        for (int round = 1; round <= 3; round++) {
            readyBacklog = readyBacklog + 5 - 2;
            System.out.println("round=" + round + " readyBacklog=" + readyBacklog);
        }
        System.out.println("scale-consumers tradeoff=downstream-load");
        System.out.println("rate-limit-producer tradeoff=rejected-or-delayed-requests");
        System.out.println("prefetch=in-flight-window-not-work-reduction");

        System.out.println("db-first failure=" + DoubleWriteProbe.databaseFirstFailure());
        System.out.println("message-first failure=" + DoubleWriteProbe.messageFirstFailure());
        System.out.println("outbox=" + DoubleWriteProbe.outboxDirection());
        // 数据库提交和消息发布是两次独立写入，outbox 用于记录待发事件。
        System.out.println("boundary=database-commit-and-publish-are-separate-writes");
    }

    /** 模拟接受报告请求的 API。 */
    private static final class ReportApi {
        private final WorkQueue<ReportRequested> workQueue;
        private final JobStore jobStore;
        private int sequence;

        /** 注入工作队列和状态存储，让请求进入可查询的后台交接边界。 */
        private ReportApi(WorkQueue<ReportRequested> workQueue, JobStore jobStore) {
            this.workQueue = workQueue;
            this.jobStore = jobStore;
        }

        /** 对有效账户返回 202，对空账户返回 400。 */
        private AcceptedResponse submit(String accountId) {
            if (accountId == null || accountId.trim().isEmpty()) {
                return new AcceptedResponse(400, "", "");
            }
            sequence++;
            String jobId = "job-" + sequence;
            jobStore.mark(jobId, "queued");
            workQueue.send(new ReportRequested(jobId, accountId));
            return new AcceptedResponse(202, jobId, "/reports/" + jobId);
        }
    }

    /** 保存练习需要的 HTTP 响应字段。 */
    private static final class AcceptedResponse {
        private final int statusCode;
        private final String jobId;
        private final String statusUrl;

        /** 创建一个状态码、任务编号和状态地址组成的响应。 */
        private AcceptedResponse(int statusCode, String jobId, String statusUrl) {
            this.statusCode = statusCode;
            this.jobId = jobId;
            this.statusUrl = statusUrl;
        }
    }

    /** 从共享工作队列领取任务，并向两个独立事件队列广播完成事实。 */
    private static final class Worker {
        private final String name;
        private final WorkQueue<ReportRequested> workQueue;
        private final WorkQueue<ReportSucceeded> auditQueue;
        private final WorkQueue<ReportSucceeded> emailQueue;
        private final Set<String> handledJobs;
        private final JobStore jobStore;
        private int processed;

        /** 注入 worker 参与竞争和广播所需的队列。 */
        private Worker(
                String name,
                WorkQueue<ReportRequested> workQueue,
                WorkQueue<ReportSucceeded> auditQueue,
                WorkQueue<ReportSucceeded> emailQueue,
                Set<String> handledJobs,
                JobStore jobStore) {
            this.name = name;
            this.workQueue = workQueue;
            this.auditQueue = auditQueue;
            this.emailQueue = emailQueue;
            this.handledJobs = handledJobs;
            this.jobStore = jobStore;
        }

        /** 领取至多一条 command，并把完成事件分别写入两个 queue。 */
        private void processOne() {
            if (workQueue.size() == 0) {
                return;
            }
            ReportRequested request = workQueue.receive();
            if (!handledJobs.add(request.jobId)) {
                throw new IllegalStateException(name + " handled duplicate " + request.jobId);
            }
            jobStore.mark(request.jobId, "running");
            processed++;
            jobStore.mark(request.jobId, "succeeded");
            auditQueue.send(new ReportSucceeded(request.jobId));
            emailQueue.send(new ReportSucceeded(request.jobId));
        }
    }

    /** 表示等待 worker 执行的报告 command。 */
    private static final class ReportRequested {
        private final String jobId;
        private final String accountId;

        /** 创建报告 command 的任务编号和账户字段。 */
        private ReportRequested(String jobId, String accountId) {
            this.jobId = jobId;
            this.accountId = accountId;
        }
    }

    /** 表示报告已完成并可广播给订阅者的 event。 */
    private static final class ReportSucceeded {
        private final String jobId;

        /** 创建报告完成事件。 */
        private ReportSucceeded(String jobId) {
            this.jobId = jobId;
        }
    }

    /** 保存练习中可查询的任务状态。 */
    private static final class JobStore {
        private final Map<String, String> statuses = new LinkedHashMap<String, String>();

        /** 记录任务状态转换。 */
        private void mark(String jobId, String status) {
            statuses.put(jobId, status);
        }

        /** 返回任务当前状态。 */
        private String statusOf(String jobId) {
            String status = statuses.get(jobId);
            return status == null ? "not-found" : status;
        }
    }

    /** 用确认时机返回本课的两种故障结果。 */
    private static final class DeliveryProbe {
        /** 禁止创建静态故障探针实例。 */
        private DeliveryProbe() {
        }

        /** 模拟处理前确认后的丢失窗口。 */
        private static boolean atMostOnceLost() {
            DeliveryState state = new DeliveryState();
            state.receive();
            state.acknowledge();
            state.crash();
            return state.isLost();
        }

        /** 模拟处理后确认前的重投窗口。 */
        private static boolean atLeastOnceRedelivery() {
            DeliveryState state = new DeliveryState();
            state.receive();
            state.process();
            state.crash();
            return state.isRedelivered();
        }

        /** 记录确认时机对应的可观察状态。 */
        private static final class DeliveryState {
            private boolean queued = true;
            private boolean inFlight;
            private boolean acknowledged;
            private boolean processed;

            /** 将消息移到在途状态。 */
            private void receive() {
                queued = false;
                inFlight = true;
            }

            /** 在处理前确认消息。 */
            private void acknowledge() {
                acknowledged = true;
                inFlight = false;
            }

            /** 标记业务处理完成。 */
            private void process() {
                processed = true;
            }

            /** 崩溃时让未确认消息重新进入 ready 队列。 */
            private void crash() {
                if (inFlight && !acknowledged) {
                    queued = true;
                }
                inFlight = false;
            }

            /** 判断已确认但业务尚未完成的消息是否丢失。 */
            private boolean isLost() {
                return !queued && !processed;
            }

            /** 判断处理完成但未确认的消息是否重投。 */
            private boolean isRedelivered() {
                return queued && processed;
            }
        }
    }

    /** 返回并发处理可能出现的完成顺序。 */
    private static final class OrderProbe {
        /** 禁止创建静态顺序探针实例。 */
        private OrderProbe() {
        }

        /** 单消费者依次领取时保持入队顺序。 */
        private static String singleConsumerOrder() {
            ArrayDeque<String> queue = new ArrayDeque<String>();
            queue.addLast("job-1");
            queue.addLast("job-2");
            StringBuilder result = new StringBuilder();
            while (queue.size() > 0) {
                if (result.length() > 0) {
                    result.append(',');
                }
                result.append(queue.removeFirst());
            }
            return result.toString();
        }

        /** 第二条任务更快完成，因此先于第一条完成。 */
        private static String parallelCompletionOrder() {
            ArrayDeque<Task> inFlight = new ArrayDeque<Task>();
            inFlight.addLast(new Task("job-1", 2));
            inFlight.addLast(new Task("job-2", 1));
            StringBuilder result = new StringBuilder();
            while (inFlight.size() > 0) {
                Task fastest = inFlight.peekFirst();
                for (Task task : inFlight) {
                    if (task.duration < fastest.duration) {
                        fastest = task;
                    }
                }
                if (result.length() > 0) {
                    result.append(',');
                }
                result.append(fastest.jobId);
                inFlight.remove(fastest);
            }
            return result.toString();
        }

        /** 表示一条具有确定处理耗时的在途任务。 */
        private static final class Task {
            private final String jobId;
            private final int duration;

            /** 创建任务并记录模拟处理耗时。 */
            private Task(String jobId, int duration) {
                this.jobId = jobId;
                this.duration = duration;
            }
        }
    }

    /** 返回两类数据库与消息双写故障的状态描述。 */
    private static final class DoubleWriteProbe {
        /** 禁止创建静态双写探针实例。 */
        private DoubleWriteProbe() {
        }

        /** 数据库先提交、发布前崩溃。 */
        private static String databaseFirstFailure() {
            DoubleWriteState state = new DoubleWriteState();
            state.commitDatabase();
            state.crash();
            state.publishMessage();
            return "database-committed=" + state.databaseCommitted
                    + ",message-published=" + state.messagePublished;
        }

        /** 发布先成功、数据库回滚。 */
        private static String messageFirstFailure() {
            DoubleWriteState state = new DoubleWriteState();
            state.publishMessage();
            state.crash();
            state.commitDatabase();
            return "message-published=" + state.messagePublished
                    + ",database-committed=" + state.databaseCommitted;
        }

        /** outbox 把业务更新和待发事件写入同一数据库事务。 */
        private static String outboxDirection() {
            OutboxState state = new OutboxState();
            state.commitBusinessAndPendingEvent();
            return state.description();
        }

        /** 记录两个独立写入及崩溃后的阻止状态。 */
        private static final class DoubleWriteState {
            private boolean databaseCommitted;
            private boolean messagePublished;
            private boolean crashed;

            /** 提交数据库写入，崩溃后不再执行。 */
            private void commitDatabase() {
                if (!crashed) {
                    databaseCommitted = true;
                }
            }

            /** 发布消息，崩溃后不再执行。 */
            private void publishMessage() {
                if (!crashed) {
                    messagePublished = true;
                }
            }

            /** 模拟第一次写入后的进程崩溃。 */
            private void crash() {
                crashed = true;
            }
        }

        /** 记录 outbox 事务中的业务记录和待发事件。 */
        private static final class OutboxState {
            private boolean businessCommitted;
            private boolean pendingEventCommitted;

            /** 一次提交业务记录和待发事件。 */
            private void commitBusinessAndPendingEvent() {
                businessCommitted = true;
                pendingEventCommitted = true;
            }

            /** 返回 outbox 事务的可观察描述。 */
            private String description() {
                return businessCommitted && pendingEventCommitted
                        ? "business-and-pending-event-commit-together"
                        : "outbox-transaction-incomplete";
            }
        }
    }

    /** 用 FIFO 内存队列保存等待处理的消息。 */
    private static final class WorkQueue<T> {
        private final ArrayDeque<T> messages = new ArrayDeque<T>();

        /** 追加一条消息。 */
        private void send(T message) {
            messages.addLast(message);
        }

        /** 领取最早的一条消息。 */
        private T receive() {
            return messages.removeFirst();
        }

        /** 返回当前 ready 消息数。 */
        private int size() {
            return messages.size();
        }
    }
}
```

预期输出如下。四条 command 只被工作队列处理一次，两个事件队列各保留四条事实；三轮速率差使 ready backlog 依次变为三、六、九。

```text
invalid status=400
accepted status=202 location=/reports/job-1 jobId=job-1
GET status=queued
GET unknown=not-found
work handled=4 uniqueJobs=4 worker-A=2 worker-B=2
GET status=succeeded
audit events=4
email events=4
at-most-once lost=true
at-least-once redelivery=true
single-order=job-1,job-2
completion-order=job-2,job-1
round=1 readyBacklog=3
round=2 readyBacklog=6
round=3 readyBacklog=9
scale-consumers tradeoff=downstream-load
rate-limit-producer tradeoff=rejected-or-delayed-requests
prefetch=in-flight-window-not-work-reduction
db-first failure=database-committed,message-published=false
message-first failure=message-published=true,database-committed=false
outbox=business-and-pending-event-commit-together
boundary=database-commit-and-publish-are-separate-writes
```
