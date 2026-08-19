---
id: backend.java.learn.advanced.events-async-scheduling-and-retry
type: lesson
title: 事件、异步执行、调度与重试
summary: 为事件、异步任务、周期调度和有限重试建立线程、事务、失败与生命周期合同
domain: backend
technology: java
module: core
stage: advanced
level: advanced
estimatedMinutes: 240
objectives:
  - 能证明 Spring 事件的执行线程由 multicaster 与 listener 配置决定，而不是由发布方法或包名决定。
  - 能为 @Async 任务选择命名有界执行器，并显式观察 Future、void 异常、取消和关闭结果。
  - 能区分 fixedRate、fixedDelay 与 cron，设计时区、重入、单飞和任务状态边界。
  - 能只对瞬态失败做有限退避重试，并把幂等、事务尝试和耗尽恢复纳入同一合同。
  - 能区分 Spring Framework 7 resilience 与 Java 8 / Spring Retry 1.2.5 的 API 和次数语义。
prerequisites:
  - backend.java.learn.advanced.concurrency-locks-and-shared-state
  - backend.java.learn.intermediate.transactions-and-idempotency
  - backend.java.learn.intermediate.dependency-injection-and-bean-lifecycle
related: []
tags:
  - ApplicationEventPublisher
  - EventListener
  - TransactionalEventListener
  - Async
  - CompletableFuture
  - ThreadPoolTaskExecutor
  - Scheduled
  - fixedRate
  - fixedDelay
  - cron
  - Retryable
  - RetryTemplate
  - 幂等
  - 失败观测
appliesTo: Java 25 / Spring Framework 7.0.8 主线；项目补充适用于 Java 8 / Spring Boot 2.3.12.RELEASE / Spring Framework 5.2.15.RELEASE / Spring Retry 1.2.5.RELEASE
modernBaseline:
  java: '25'
  springFramework: 7.0.8
  springRetry: Framework 7 core resilience
legacyBaseline:
  java: '8'
  springBoot: 2.3.12.RELEASE
  springFramework: 5.2.15.RELEASE
  springRetry: 1.2.5.RELEASE
verifiedAt: 2026-08-10
sources:
  - id: spring7-event-publisher
    title: Spring Framework 7.0.8 ApplicationEventPublisher Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/context/ApplicationEventPublisher.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 发布只是交给 multicaster，不承诺同步、异步或立即执行
      - 阻塞工作应由监听器显式交给异步执行边界
  - id: spring7-simple-multicaster
    title: Spring Framework 7.0.8 SimpleApplicationEventMulticaster Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/context/event/SimpleApplicationEventMulticaster.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 默认使用发布线程同步调用监听器
      - 设置 executor 后不会自动传播发布者事务和线程上下文
  - id: spring7-event-listener
    title: Spring Framework 7.0.8 EventListener Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/context/event/EventListener.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 异步监听器异常不会传播给发布者
      - 异步监听器不能依赖返回值发布后续事件
  - id: spring7-transactional-event-listener
    title: Spring Framework 7.0.8 TransactionalEventListener Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/transaction/event/TransactionalEventListener.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 默认阶段是 AFTER_COMMIT，无事务时默认不执行
      - 提交后的新写入需要显式的新事务边界
  - id: spring7-events-reference
    title: Spring Framework 7.0.8 Application Events Reference
    url: https://docs.spring.io/spring-framework/reference/core/beans/context-introduction.html#context-functionality-events
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - 应用事件用于同一 ApplicationContext 内的解耦通知
  - id: spring7-transaction-events-reference
    title: Spring Framework 7.0.8 Transaction-bound Events Reference
    url: https://docs.spring.io/spring-framework/reference/data-access/transaction/event.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - 事务事件按提交、回滚或完成阶段绑定处理
  - id: spring7-scheduling-reference
    title: Spring Framework 7.0.8 Task Execution and Scheduling
    url: https://docs.spring.io/spring-framework/reference/integration/scheduling.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - TaskExecutor 与 TaskScheduler 分别抽象异步执行和未来调度
      - 默认 proxy advice 不拦截同类自调用
  - id: spring7-async
    title: Spring Framework 7.0.8 Async Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/scheduling/annotation/Async.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 返回类型只能是 void 或 Future 兼容类型
      - value 可以选择命名 executor
  - id: spring7-enable-async
    title: Spring Framework 7.0.8 EnableAsync Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/scheduling/annotation/EnableAsync.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 可通过 AsyncConfigurer 提供 executor 与 void 异常处理器
  - id: spring7-async-error-handler
    title: Spring Framework 7.0.8 AsyncUncaughtExceptionHandler Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/aop/interceptor/AsyncUncaughtExceptionHandler.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - void 异步方法的未捕获异常需要专门处理
  - id: spring7-scheduled
    title: Spring Framework 7.0.8 Scheduled Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/scheduling/annotation/Scheduled.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - fixedRate、fixedDelay 与 cron 三选一并且方法不能有参数
      - zone 指定 cron 时区，重复声明可能重叠
  - id: spring7-thread-pool-task-executor
    title: Spring Framework 7.0.8 ThreadPoolTaskExecutor Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/scheduling/concurrent/ThreadPoolTaskExecutor.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 默认 core 为 1 且 max 和 queue 都近似无界
      - 有界容量和拒绝策略必须显式配置
  - id: spring7-resilience
    title: Spring Framework 7.0.8 Resilience Reference
    url: https://docs.spring.io/spring-framework/reference/core/resilience.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - Framework 7 核心提供 Retryable 与 RetryTemplate
      - 重试耗尽后传播最后一次原始异常并发布重试事件
  - id: spring7-resilience-retryable
    title: Spring Framework 7.0.8 Resilience Retryable Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/resilience/annotation/Retryable.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - maxRetries 不包含初次调用
      - delay、jitter、multiplier 与 maxDelay 共同限定退避
  - id: spring5-simple-multicaster
    title: Spring Framework 5.2.15 SimpleApplicationEventMulticaster Javadoc
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/context/event/SimpleApplicationEventMulticaster.html
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 旧线同样默认在发布线程同步执行
  - id: spring5-event-listener
    title: Spring Framework 5.2.15 EventListener Javadoc
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/context/event/EventListener.html
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 异步 listener 失败不回传且不能靠返回值继续发布
  - id: spring5-transactional-event-listener
    title: Spring Framework 5.2.15 TransactionalEventListener Javadoc
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/transaction/event/TransactionalEventListener.html
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 旧线默认 AFTER_COMMIT 且无事务时默认不执行
  - id: spring5-scheduling-reference
    title: Spring Framework 5.2.15 Task Execution and Scheduling
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/integration.html#scheduling
    sourceType: official-reference
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 旧线提供 TaskExecutor、TaskScheduler、Async 与 Scheduled
  - id: spring5-async
    title: Spring Framework 5.2.15 Async Javadoc
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/scheduling/annotation/Async.html
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 旧线支持 void、Future、ListenableFuture 与 CompletableFuture
  - id: spring5-enable-async
    title: Spring Framework 5.2.15 EnableAsync Javadoc
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/scheduling/annotation/EnableAsync.html
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 旧线默认也是 proxy advice 并支持 AsyncConfigurer
  - id: spring5-scheduled
    title: Spring Framework 5.2.15 Scheduled Javadoc
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/scheduling/annotation/Scheduled.html
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 旧线任务无参数且返回值被忽略
  - id: boot2312-dependency-versions
    title: Spring Boot 2.3.12 Managed Dependency Versions
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/appendix-dependency-versions.html
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Boot 2.3.12 管理 Spring Retry 1.2.5.RELEASE
  - id: spring-retry-latest-release
    title: Spring Retry 2.0.13 Release
    url: https://github.com/spring-attic/spring-retry/releases/tag/v2.0.13
    sourceType: release-note
    appliesTo: Spring Retry 2.0.13
    claims:
      - 2.0.13 是 2026-08-10 可核验的最新稳定标签
  - id: spring-retry-status
    title: Spring Retry Archived Project README
    url: https://github.com/spring-attic/spring-retry/blob/main/README.md
    sourceType: official-reference
    appliesTo: Spring Retry archived main
    claims:
      - 项目已归档并由 Spring Framework 7 resilience 取代
  - id: spring-retry-legacy-pom
    title: Spring Retry 1.2.5 POM
    url: https://github.com/spring-attic/spring-retry/blob/1.2.5/pom.xml
    sourceType: source-code
    appliesTo: Spring Retry 1.2.5.RELEASE
    claims:
      - 归档 tag 确认 artifact 版本和旧线编译基线
  - id: spring-retry-legacy-retryable
    title: Spring Retry 1.2.5 Retryable Source
    url: https://github.com/spring-attic/spring-retry/blob/1.2.5/src/main/java/org/springframework/retry/annotation/Retryable.java
    sourceType: source-code
    appliesTo: Spring Retry 1.2.5.RELEASE
    claims:
      - maxAttempts 包含初次调用且默认是 3
  - id: spring-retry-legacy-recover
    title: Spring Retry 1.2.5 Recover Source
    url: https://github.com/spring-attic/spring-retry/blob/1.2.5/src/main/java/org/springframework/retry/annotation/Recover.java
    sourceType: source-code
    appliesTo: Spring Retry 1.2.5.RELEASE
    claims:
      - Recover 方法处理匹配类型的耗尽恢复
  - id: java25-executor-service
    title: Java SE 25 ExecutorService API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ExecutorService.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - shutdown、shutdownNow 与 awaitTermination 定义协作关闭
      - close 会有序关闭并等待终止
  - id: java8-executor-service
    title: Java SE 8 ExecutorService API
    url: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ExecutorService.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 使用 shutdown 与 awaitTermination 且没有 close
  - id: java25-future
    title: Java SE 25 Future API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/Future.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - get 暴露取消、中断、超时和执行异常
      - Java 25 增加即时状态读取方法
  - id: java8-future
    title: Java SE 8 Future API
    url: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/Future.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 通过 get 观察异步结果与 ExecutionException
  - id: java25-completable-future
    title: Java SE 25 CompletableFuture API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/CompletableFuture.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - async 方法未指定 executor 时使用默认异步设施
      - handle 与 exceptionally 可以恢复失败
  - id: java8-completable-future
    title: Java SE 8 CompletableFuture API
    url: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/CompletableFuture.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 已有显式 executor 和终端失败处理能力
  - id: java25-scheduled-executor-service
    title: Java SE 25 ScheduledExecutorService API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ScheduledExecutorService.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - fixedRate 按启动节拍而 fixedDelay 按上次结束计时
      - 周期执行抛异常会抑制后续执行
  - id: java8-scheduled-executor-service
    title: Java SE 8 ScheduledExecutorService API
    url: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ScheduledExecutorService.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 保留相同的 fixedRate、fixedDelay 与取消合同
  - id: java25-thread
    title: Java SE 25 Thread API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Thread.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - sleep 只暂停当前线程且不会表达可取消调度
  - id: java8-thread
    title: Java SE 8 Thread API
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/Thread.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - sleep 不释放 monitor 且可能被中断
  - id: jls25-records
    title: Java Language Specification 25 Record Classes
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.10
    sourceType: specification
    appliesTo: Java 25
    claims:
      - record 组件是浅层 final 而不是可变对象的深拷贝
  - id: jls8-classes
    title: Java Language Specification 8 Classes
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html
    sourceType: specification
    appliesTo: Java 8
    claims:
      - Java 8 没有 record 并需用 final 字段表达不可变快照
projectEvidence:
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/ThreadPoolConfig.java
    symbol: com.tdh.bdzz.config.ThreadPoolConfig
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/context/event/EventPublisher.java
    symbol: com.tdh.bdzz.context.event.EventPublisher
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/service/impl/MessageServiceImpl.java
    symbol: com.tdh.bdzz.service.impl.MessageServiceImpl
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/listener/DataReportListener.java
    symbol: com.tdh.bdzz.listener.DataReportListener
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/timer/ClearExpiredDataTask.java
    symbol: com.tdh.bdzz.timer.ClearExpiredDataTask
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/handler/ThreadHandler.java
    symbol: com.tdh.bdzz.handler.ThreadHandler
    usage: corrected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/context/event/DataReportEvent.java
    symbol: com.tdh.bdzz.context.event.DataReportEvent
    usage: corrected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/factories/flv/ConverterFactories.java
    symbol: com.tdh.bdzz.factories.flv.ConverterFactories
    usage: corrected
---

# 事件、异步执行、调度与重试

## 为什么需要学习

事件、`@Async`、`@Scheduled` 和重试解决的是四个不同问题：通知、换线程、按时间触发和再次尝试。把它们堆在
一个方法上，不会自动得到正确的事务、上下文或失败处理。可靠设计必须逐条回答：代码在哪个线程执行、数据在哪个
事务可见、失败由谁观察、任务是否会重入、重试是否重放副作用，以及应用关闭时谁停止接收并等待任务。

## 学习目标

- 能用线程名和执行器配置证明事件同步或异步，而不是根据类名猜测。
- 能为每个异步入口返回可观察结果，处理异常、取消、超时和关闭。
- 能为调度任务选择正确时间模型，并显式处理时区、重叠和多实例。
- 能把一次 retry attempt 与一个事务边界对齐，限制次数、退避和总耗时。
- 能在现代 Spring 7 与项目 Java 8 兼容线之间保持清晰的包名和次数语义。

## 前置术语

publisher 发布领域内已经发生的事实，multicaster 决定把事件交给哪些 listener 以及在哪个 executor 执行。
executor 负责接收任务和管理 worker；scheduler 负责决定任务未来何时进入执行器。attempt 是一次真实调用，retry
是失败后再创建 attempt 的策略。幂等键用于识别同一业务动作，恢复路径负责在重试耗尽后留下可处理结果。

## 零基础知识点详解

每个知识点都按“是什么、作用、场景、步骤、最小示例、结果、误区”展开。示例只证明当前合同；实际容量、超时和
重试预算必须根据下游配额、任务耗时与业务容忍度测量。

### 先分开事件、异步、调度和重试四条边界

**是什么：** 四条边界分别回答通知谁、在哪执行、何时执行和失败后是否再试。**作用：** 让线程、事务和失败所有权
可审计。**场景：** 订单提交后生成报表、定时扫描待处理任务、调用临时不可用的下游。

**步骤：** 先写稳定业务键；记录触发来源；选择执行器；定义 attempt；最后为成功、失败和耗尽记录状态。

```java
public record TaskCommand(String taskId, String reportId, int attempt) {
    /** 创建下一次尝试的不可变命令。 */
    public TaskCommand nextAttempt() {
        return new TaskCommand(taskId, reportId, attempt + 1);
    }
}
```

**结果：** 同一任务跨事件、队列和重试仍可用 `taskId` 关联。**误区：** 把四种注解叠在同一方法上，却没有定义
执行顺序、失败归属与幂等键。

### 应用事件默认在发布线程同步执行

**是什么：** `SimpleApplicationEventMulticaster` 默认使用同步执行器。**作用：** 让发布者能在同一调用栈观察
普通 listener 的完成或异常。**场景：** 同一上下文内的轻量通知。

**步骤：** 记录发布线程；listener 再记录线程；不配置 executor 时断言两者相同；配置后重新验证。

```java
public final class ThreadProbeListener {
    private String listenerThread;

    /** 记录监听器实际运行线程。 */
    public void onReportReady(ReportReady event) {
        listenerThread = Thread.currentThread().getName();
    }

    /** 返回最近一次监听线程。 */
    public String listenerThread() {
        return listenerThread;
    }
}
```

**结果：** 是否异步由 multicaster 或 `@Async` 的真实配置证明。**误区：** 看到 `listener` 包、`publishEvent` 或
事件类就宣称已经异步。

### 事件载荷必须是发布时的不可变快照

**是什么：** 事件载荷表示已经发生的事实，而不是共享中的可变工作区。**作用：** 防止不同线程看到发布后的修改。
**场景：** 异步 listener、延迟处理和多个 listener 并行读取。

**步骤：** 只保留必要字段；复制集合；不暴露 setter；发布后不再修改原始对象。

```java
import java.util.List;

public record ReportReady(String reportId, List<String> recipients) {
    /** 防御性复制可变集合。 */
    public ReportReady {
        recipients = List.copyOf(recipients);
    }
}
```

**结果：** 每个 listener 观察到相同快照。**误区：** `record` 只让组件引用浅层 final，传入可变集合并不会自动
深拷贝。

### EventListener 的返回值与异步失败有明确限制

**是什么：** 同步 `@EventListener` 可以用返回值发布后续事件，但异步 listener 不支持该返回路径，异常也不会
回到发布者。**作用：** 避免把提交成功误判为处理成功。**场景：** listener 需要触发后续通知或可能失败。

**步骤：** 异步 listener 显式注入 publisher；使用命名 executor；失败写日志、指标和任务状态；不要只依赖调用方。

```java
public final class ReportListener {
    private final ApplicationEventPublisher publisher;

    /** 注入显式的后续事件发布器。 */
    public ReportListener(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    /** 完成异步处理后显式发布下一事件。 */
    @Async("reportExecutor")
    public void onReportReady(ReportReady event) {
        publisher.publishEvent(new DeliveryRequested(event.reportId()));
    }
}
```

**结果：** 后续事件和失败观测都有明确入口。**误区：** 认为异步 listener 的返回对象会被框架自动继续发布。

### TransactionalEventListener 绑定事务阶段而不等于异步

**是什么：** `@TransactionalEventListener` 把处理时机绑定到提交、回滚或完成阶段。**作用：** 防止事务尚未提交时
读取未稳定结果。**场景：** 提交成功后发送通知或创建独立后续命令。

**步骤：** 选择 phase；决定无事务时是否 fallback；需要写库时调用带新事务的独立 bean；单独定义失败恢复。

```java
public final class ReportCommittedListener {
    private final DeliveryCommandService commands;

    /** 注入拥有独立事务的命令服务。 */
    public ReportCommittedListener(DeliveryCommandService commands) {
        this.commands = commands;
    }

    /** 提交后创建独立的投递命令。 */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onCommitted(ReportReady event) {
        commands.createInNewTransaction(event.reportId());
    }
}
```

**结果：** 原事务提交与后续写入不会混成一个模糊边界。**误区：** `AFTER_COMMIT` 时资源可能仍可访问，但继续写入
不会自动形成可提交的新事务。

### 受管有界执行器定义容量和背压

**是什么：** `ThreadPoolTaskExecutor` 是由 Spring 生命周期管理的执行器。**作用：** 集中声明线程数、队列、命名、
拒绝和关闭。**场景：** 报表、文件转换和外部集成等隔离工作负载。

**步骤：** 按测量设置 core/max；使用有限 queue；命名线程；选择可见的拒绝策略；等待已提交任务关闭。

```java
@Configuration
public class AsyncInfrastructure {
    /** 创建报表专用的有界执行器。 */
    @Bean("reportExecutor")
    ThreadPoolTaskExecutor reportExecutor() {
        var executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("report-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.AbortPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        return executor;
    }
}
```

**结果：** 过载会成为可观察失败，而不是无限堆积。**误区：** 默认 queue 近似无界，此时调大 `maxPoolSize` 不会按
直觉解决积压。

### Async 依赖代理并应选择命名执行器

**是什么：** `@Async` 默认由 Spring 代理拦截外部调用并提交任务。**作用：** 把业务入口与受管 executor 连接。
**场景：** 调用方不需要占用当前线程等待结果。

**步骤：** 在独立 bean 暴露入口；外部调用代理；用 `value` 选择 executor；禁止 `this.method()` 自调用。

```java
public class ReportGenerator {
    /** 在报表执行器中生成结果。 */
    @Async("reportExecutor")
    public CompletableFuture<String> generate(String reportId) {
        return CompletableFuture.completedFuture("ready:" + reportId);
    }
}

public class ReportFacade {
    private final ReportGenerator generator;

    /** 注入经过容器代理的异步服务。 */
    public ReportFacade(ReportGenerator generator) {
        this.generator = generator;
    }

    /** 通过外部 bean 边界提交任务。 */
    public CompletableFuture<String> submit(String reportId) {
        return generator.generate(reportId);
    }
}
```

**结果：** 线程名、队列和失败策略都可归属到 `reportExecutor`。**误区：** 类内自调用不经过默认 proxy advice，方法
仍在当前线程执行。

`void` 异步方法没有 Future 可以让调用方观察，因此还必须在异步配置中提供异常处理器：

```java
@Configuration
@EnableAsync
public class AsyncFailureConfiguration implements AsyncConfigurer {
    private final Executor reportExecutor;
    private final AsyncFailureRecorder recorder;

    /** 注入报表执行器和异步失败记录器。 */
    public AsyncFailureConfiguration(
        @Qualifier("reportExecutor") Executor reportExecutor,
        AsyncFailureRecorder recorder
    ) {
        this.reportExecutor = reportExecutor;
        this.recorder = recorder;
    }

    /** 为 @Async 选择命名执行器。 */
    @Override
    public Executor getAsyncExecutor() {
        return reportExecutor;
    }

    /** 记录 void 异步方法的未捕获异常。 */
    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (error, method, parameters) -> recorder.record(method.getName(), parameters, error);
    }
}

public class ReportNotifier {
    /** 提交一个失败也必须可追踪的通知任务。 */
    @Async("reportExecutor")
    public void notify(String reportId) {
        throw new IllegalStateException("delivery failed: " + reportId);
    }
}
```

`notify` 抛出的异常会进入记录器，调用方仍可通过任务 ID 查询失败。**误区：** 只写 `@Async void` 并不会让异常自动
回传给发布者，也不会替代业务状态记录。

### Future 和 CompletableFuture 必须有终端观测

**是什么：** Future 是异步结果、失败、取消和等待的句柄。**作用：** 让调用方区分“已提交”和“已成功”。**场景：**
需要回执、组合多个异步步骤或在超时后取消。

**步骤：** 保存句柄；设置超时；展开 cause；恢复中断；为 CompletableFuture 添加终端处理。

```java
public final class FutureObserver {
    /** 把异步失败转换成可追踪结果。 */
    static CompletableFuture<String> observe(CompletableFuture<String> stage, String taskId) {
        // callback 同时观察成功和失败并保留任务标识。
        return stage.handle((value, error) ->
            error == null ? value : "failed:" + taskId + ":" + error.getClass().getSimpleName()
        );
    }
}
```

**结果：** 每条链都有可查询的终态。**误区：** `isDone()` 只表示完成，不表示成功；无 executor 的 `*Async` 还会
进入默认共享设施。

### 异步线程不会继承事务和任意 ThreadLocal

**是什么：** 事务与线程上下文通常绑定当前线程，换 worker 后不会自动存在。**作用：** 防止把请求线程状态误当成
任务输入。**场景：** `@Async` 方法访问数据库、租户、用户或 trace。

**步骤：** 捕获最小不可变参数；任务内建立新事务；需要的上下文在 worker 设置；`finally` 恢复或清理。

```java
public record DeliveryCommand(String taskId, String tenantId, String reportId) {
}

public class DeliveryWorker {
    /** 在异步线程自己的事务中处理命令。 */
    @Async("deliveryExecutor")
    @Transactional
    public CompletableFuture<Void> deliver(DeliveryCommand command) {
        persistAttempt(command.taskId(), command.tenantId(), command.reportId());
        return CompletableFuture.completedFuture(null);
    }
}
```

**结果：** 数据库提交与上下文清理都属于 worker 的调用边界。**误区：** 认为调用方事务会跨线程传播，或把 Servlet
request、连接对象放入任务载荷。

### fixedRate 和 fixedDelay 使用不同时间轴

**是什么：** fixedRate 从计划启动节拍计算，fixedDelay 从上次结束后计算。**作用：** 为节拍任务和非重叠轮询选择
正确语义。**场景：** 固定采样与外部系统轮询。

**步骤：** 画出开始/结束时间；选择模式；记录实际延迟；为超时和取消定义状态。

```java
public class PollingTasks {
    /** 上一次轮询结束五秒后再开始。 */
    @Scheduled(fixedDelayString = "${poll.delay:PT5S}")
    public void poll() {
        fetchNextBatch();
    }

    /** 按一分钟启动节拍采样。 */
    @Scheduled(fixedRateString = "${sample.rate:PT1M}")
    public void sample() {
        recordQueueDepth();
    }
}
```

**结果：** 轮询不会把处理耗时误算成下一次等待。**误区：** fixedRate 不是“无论如何并发补跑”；标准库同一个周期
任务不会与自己并发，但迟到执行仍需观测。

### cron 必须显式时区、开关和重叠策略

**是什么：** cron 按日历和时区计算触发时间。**作用：** 表达每日、每周等业务时间。**场景：** 每日结算、法定时区
报表和运维窗口。

**步骤：** 写 `zone`；把表达式外置；用 `-` 关闭；记录夏令时决定；为重复声明和多实例定义单飞方案。

```java
public class DailyReportTask {
    /** 按上海时区执行，可用横线配置关闭。 */
    @Scheduled(cron = "${report.cron:-}", zone = "Asia/Shanghai")
    public void createDailyReport() {
        // callback 在获得租约后生成报表。
        runWithLease("daily-report", this::generate);
    }

    /** 生成当天报表。 */
    private void generate() {
        // 真实实现使用稳定业务日期作为幂等键。
    }
}
```

**结果：** 服务器时区变化不会悄悄改变业务时间。**误区：** 单 JVM 默认 scheduler 不代表集群全局唯一；同一方法
重复 `@Scheduled` 还可能产生重叠触发。

### 周期任务必须记录执行状态并处理顶层失败

**是什么：** 任务状态至少包含计划、开始、成功、失败、取消和耗尽。**作用：** 防止一次异常让周期执行静默停止。
**场景：** 批处理、清理、同步与后台轮询。

**步骤：** 进入时写 running；顶层捕获异常；写 failed 和 cause；交由告警或恢复；只在成功后写完成游标。

```java
public final class ObservedTask {
    private final TaskStateRepository states;

    /** 注入任务状态仓库。 */
    public ObservedTask(TaskStateRepository states) {
        this.states = states;
    }

    /** 执行并记录任务终态。 */
    public void run(String taskId, Runnable work) {
        states.running(taskId);
        try {
            work.run();
            states.succeeded(taskId);
        } catch (RuntimeException error) {
            states.failed(taskId, error);
            throw error;
        }
    }
}
```

**结果：** 即使调度器不再触发，也能从状态和告警发现。**误区：** 在任务内部吞掉异常后继续推进游标，会把失败数据
伪装成成功。

### 重试只接受可分类的瞬态失败和有限预算

**是什么：** retry policy 决定哪些异常可以再试、最多几次和总共多久。**作用：** 给短暂故障恢复机会，同时限制
资源占用。**场景：** 短暂网络断开、可恢复锁竞争或下游临时不可用。

**步骤：** includes 白名单；excludes 确定性错误；写次数；设置 delay、multiplier、jitter、maxDelay 和 timeout。

```java
public class RemoteReportClient {
    /** 对瞬态异常执行最多两次额外重试。 */
    @org.springframework.resilience.annotation.Retryable(
        includes = TransientRemoteException.class,
        maxRetries = 2,
        delay = 200,
        multiplier = 2,
        maxDelay = 1000
    )
    public Report fetch(String reportId) {
        return callRemote(reportId);
    }
}
```

**结果：** 总调用次数最多是三次，延迟有上限。**误区：** 参数错误、权限拒绝和代码缺陷不会因重复调用变正确。

### 每次重试都要幂等并拥有独立事务尝试

**是什么：** 重试会重放方法内的所有副作用。**作用：** 防止重复扣款、重复消息和在 rollback-only 事务中继续操作。
**场景：** 写库后调用下游、消费事件或提交外部命令。

**步骤：** 使用稳定幂等键；先占用唯一记录；每次 attempt 新开事务；成功写终态；耗尽进入恢复或人工队列。

```java
public final class IdempotentDelivery {
    private final AttemptService attempts;

    /** 注入按次开启事务的服务。 */
    public IdempotentDelivery(AttemptService attempts) {
        this.attempts = attempts;
    }

    /** 用稳定键执行一次可重放尝试。 */
    public DeliveryResult attempt(String taskId, String reportId) {
        return attempts.runInNewTransaction(taskId, reportId);
    }
}
```

**结果：** 上一次失败回滚后，下一 attempt 不复用已失效事务。**误区：** 在一个被标记 rollback-only 的大事务内部
循环重试，最终仍会整体回滚。

### 重试耗尽必须进入显式恢复路径

**是什么：** recovery 是有限重试仍失败后的业务终态。**作用：** 让失败可查询、可补偿、可人工处理。**场景：**
下游长时间不可用或数据需要人工修复。

**步骤：** 保留 taskId 和最后 cause；写 exhausted；创建补偿/死信记录；告警；禁止返回伪成功。

```java
public final class RecoveryService {
    private final FailedTaskRepository failedTasks;

    /** 注入失败任务仓库。 */
    public RecoveryService(FailedTaskRepository failedTasks) {
        this.failedTasks = failedTasks;
    }

    /** 记录耗尽并返回可识别失败。 */
    public DeliveryResult exhausted(String taskId, RuntimeException cause) {
        failedTasks.record(taskId, cause.getClass().getName());
        return DeliveryResult.failed(taskId);
    }
}
```

**结果：** 运维可以按任务标识恢复，而不是翻找零散日志。**误区：** “已经打印最后一次异常”不等于业务恢复完成。

### Framework 7 与 Spring Retry 1.2.5 不能混用次数语义

**是什么：** 现代线使用 Framework 7 `org.springframework.resilience`，旧线使用归档 Spring Retry
`org.springframework.retry`。**作用：** 防止迁移时包名和调用次数偏一。**场景：** 同时维护现代示例和 Java 8 项目。

**步骤：** 标明依赖线；现代 `maxRetries` 只数额外次数；旧线 `maxAttempts` 包含初次调用；分别验证总调用次数。

```java
public class LegacyRemoteClient {
    /** Java 8 兼容线总共最多调用三次。 */
    @org.springframework.retry.annotation.Retryable(
        value = TransientRemoteException.class,
        maxAttempts = 3
    )
    public Report fetch(String reportId) {
        return callRemote(reportId);
    }

    /** 旧线耗尽后记录恢复结果。 */
    @org.springframework.retry.annotation.Recover
    public Report recover(TransientRemoteException error, String reportId) {
        return Report.failed(reportId, error.getMessage());
    }
}
```

**结果：** 两条线都最多调用三次，但配置名称和包完全不同。**误区：** Spring Retry 最新稳定标签虽是 2.0.13，项目
已经归档；现代新项目应使用 Framework 7 resilience，而不是继续引入该第三方项目。

## 现代版本中的正确用法

现代主线优先使用 Framework 7 核心 resilience、命名有界 executor 和不可变事件。事件负责通知，不负责隐藏事务；
异步入口返回 `CompletableFuture` 并有终端处理；调度器只触发短入口，真实工作用稳定 `taskId` 进入任务服务；retry
只包住瞬态远程操作，每次尝试的事务与幂等记录可独立验证。

## 基本语法与核心接口

| 能力 | 核心接口或注解 | 必须回答的问题 |
| --- | --- | --- |
| 事件 | `ApplicationEventPublisher`、`@EventListener` | 哪个 multicaster、哪个线程、异常回到谁 |
| 事务事件 | `@TransactionalEventListener` | 哪个 phase、无事务是否执行、后续写入用哪个事务 |
| 异步 | `@Async`、`TaskExecutor`、`Future` | 是否经过代理、用哪个 executor、谁观察终态 |
| 调度 | `@Scheduled`、`TaskScheduler` | rate/delay/cron、zone、重叠、取消和多实例 |
| 重试 | `@Retryable`、`RetryTemplate` | 哪些异常、次数、总耗时、幂等和耗尽恢复 |

## 从零跟着做

1. 为业务动作创建包含 `taskId` 与幂等键的不可变 command。
2. 在原事务内完成核心写入，只发布已经发生的事实。
3. 用事务事件 listener 在正确 phase 创建后续命令，不在提交后的旧事务继续写。
4. 通过独立 bean 的 `@Async("namedExecutor")` 提交，并保留 Future。
5. 为 executor 配置有限 queue、命名、拒绝、指标和关闭等待。
6. 调度只负责按 fixedDelay、fixedRate 或 cron 产生 command，并显式写 zone。
7. retry 只围绕瞬态调用，限定次数、退避、总时长和每次独立事务。
8. 对成功、失败、取消、拒绝、超时和耗尽分别断言任务状态。

## 如何使用

先从同步事件开始，通过线程名证明合同；只有 listener 确实阻塞发布者且业务允许最终一致时，才引入异步边界。
调度任务先画时间线再选模式。重试先列可重试异常白名单，再写幂等键与恢复动作；顺序反过来通常会隐藏副作用。

## 适用与不适用场景

应用事件适合同一进程内组件通知，不是持久消息或跨服务交付保证。`@Async` 适合可隔离的后台工作，不适合需要
立即确认的强一致调用。`@Scheduled` 适合单应用触发入口，多实例唯一性需要额外租约或协调。retry 适合瞬态失败，
不适合数据校验、权限拒绝、schema 不匹配或无限等待。

## 当前项目补充

冻结矩阵确认项目存在事件、异步、调度、执行器和 Spring Retry 使用；代表路径只用于说明课程为何必要。风险条目
属于 `corrected` 证据：它们提示必须验证发布线程、载荷可变性、事务传播、Future 失败、`sleep` 和调度开关，不能
据此断言冻结源码中的某个具体方法现在必然存在缺陷，更不能把旧写法复制为推荐方案。

## Java 8 / Spring Boot 2.3 兼容写法

Java 8 没有 record、`ExecutorService.close()` 或 Framework 7 resilience。事件快照使用 final 字段和防御性复制；
执行器用 `shutdown`、两次 `awaitTermination` 与协作中断；重试使用 Boot 管理的 Spring Retry
`1.2.5.RELEASE`，通过 `@EnableRetry`、`@Retryable(maxAttempts = 3)` 和 `@Recover` 表达总共三次调用。

```java
public final class Java8ReportReady {
    private final String reportId;
    private final List<String> recipients;

    /** 创建 Java 8 兼容的不可变事件快照。 */
    public Java8ReportReady(String reportId, List<String> recipients) {
        this.reportId = reportId;
        this.recipients = Collections.unmodifiableList(new ArrayList<>(recipients));
    }

    /** 返回报表标识。 */
    public String getReportId() {
        return reportId;
    }

    /** 返回不可变收件人列表。 */
    public List<String> getRecipients() {
        return recipients;
    }
}
```

## 新旧版本差异

| 主题 | Java 25 / Spring 7.0.8 | Java 8 / Spring 5.2.15 / Boot 2.3.12 |
| --- | --- | --- |
| 不可变载荷 | record 加组件防御性复制 | final 字段、无 setter、防御性复制 |
| 事件默认线程 | multicaster 默认同步 | 同样默认同步 |
| 事务事件 | 支持 thread-bound 与 reactive transaction | 只讲 thread-bound PlatformTransactionManager |
| 调度返回 | 可支持 reactive Publisher | 返回值被忽略，通常 void |
| 执行器关闭 | 可用 `close()` 等待终止 | `shutdown` + `awaitTermination` |
| Retry 包 | `org.springframework.resilience` | `org.springframework.retry` 1.2.5 |
| Retry 次数 | `maxRetries` 不含初次调用 | `maxAttempts` 包含初次调用 |

## 易错点

:::pitfalls
### 错误：把发布事件当成天然异步

**触发条件：** 调用 `publishEvent` 后直接声称 listener 在后台线程执行。

**原因：** 执行线程由 multicaster 和 listener 配置决定，默认是发布线程。

**后果：** 重 listener 阻塞事务或请求线程，延迟和异常归属被误判。

**错误示例：**

```java
publisher.publishEvent(event); // 假定这里已经异步。
```

**正确写法：**

```java
String publisherThread = Thread.currentThread().getName();
publisher.publishEvent(event);
assertEquals(publisherThread, listener.listenerThread());
```

**验证方式：** 分别在默认 multicaster 和显式 executor 下记录线程名。影响版本：Spring 7/5.2；来源：
`spring7-event-publisher`、`spring7-simple-multicaster`、`spring5-simple-multicaster`。

### 错误：发布后继续修改事件载荷

**触发条件：** 事件持有可变列表，发布者随后增删元素。

**原因：** record 或 final 只固定引用，不会深拷贝集合。

**后果：** 异步 listener 看到不稳定或越权数据。

**错误示例：**

```java
ReportReady event = new ReportReady(id, mutableRecipients);
publisher.publishEvent(event);
mutableRecipients.clear();
```

**正确写法：**

```java
ReportReady event = new ReportReady(id, List.copyOf(mutableRecipients));
publisher.publishEvent(event);
```

**验证方式：** 发布后修改原列表，断言 listener 快照不变。影响版本：Java 25/8；来源：`jls25-records`、
`jls8-classes`。

### 错误：把 AFTER_COMMIT 中的写入当作原事务提交内容

**触发条件：** 事务 listener 在提交后直接继续写库。

**原因：** 原事务已经提交，仍可访问资源不表示后续写入会再次提交。

**后果：** 通知记录或任务状态没有持久化。

**错误示例：**

```java
/** 提交后直接写入，错误地复用事务资源。 */
@TransactionalEventListener
void onReady(ReportReady event) { repository.save(next(event)); }
```

**正确写法：**

```java
/** 提交后委托给拥有新事务的服务。 */
@TransactionalEventListener
void onReady(ReportReady event) { commandService.createInNewTransaction(event.reportId()); }
```

**验证方式：** 提交后从新连接读取后续记录。影响版本：Spring 7/5.2；来源：
`spring7-transactional-event-listener`、`spring5-transactional-event-listener`。

### 错误：用 this 调用 Async 方法

**触发条件：** 同类方法调用 `this.generate()`。

**原因：** 默认 proxy advice 只拦截经过代理的外部调用。

**后果：** 工作仍在请求线程执行，超时和事务边界与预期不同。

**错误示例：**

```java
this.generate(reportId);
```

**正确写法：**

```java
reportGenerator.generate(reportId);
```

**验证方式：** 记录调用线程与 `report-` worker 线程。影响版本：Spring 7/5.2；来源：
`spring7-scheduling-reference`、`spring5-scheduling-reference`。

### 错误：忽略 void 异步异常或未观察 Future

**触发条件：** 提交后丢弃返回值，或使用 `@Async void` 却没有异常处理器。

**原因：** 异步失败不会自动回到原调用栈。

**后果：** 业务失败只剩一条日志，调用方继续报告成功。

**错误示例：**

```java
generator.generate(reportId);
```

**正确写法：**

```java
CompletableFuture<String> result = generator.generate(reportId);
// callback 记录异步终态。
result.whenComplete((value, error) -> taskState.finish(reportId, value, error));
```

**验证方式：** 让任务抛异常，分别断言 Future cause 与 void handler。影响版本：Java 25/8、Spring 7/5.2；来源：
`spring7-async-error-handler`、`java25-completable-future`、`java8-completable-future`。

### 错误：依赖默认无界执行器配置

**触发条件：** 只声明 `new ThreadPoolTaskExecutor()`，不设置 queue 与 max。

**原因：** 默认 core 为 1，max 与 queue 近似无界。

**后果：** 积压持续占内存，过载没有及时反馈。

**错误示例：**

```java
ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
executor.initialize();
```

**正确写法：**

```java
executor.setCorePoolSize(4);
executor.setMaxPoolSize(8);
executor.setQueueCapacity(100);
executor.setRejectedExecutionHandler(new ThreadPoolExecutor.AbortPolicy());
```

**验证方式：** 用栅栏占满 worker 与 queue，断言下一任务被显式拒绝。影响版本：Spring 7/5.2；来源：
`spring7-thread-pool-task-executor`。

### 错误：混淆 fixedRate 与 fixedDelay

**触发条件：** 希望每次完成后等待，却配置 fixedRate。

**原因：** fixedRate 按启动节拍，fixedDelay 从上次结束计时。

**后果：** 慢任务完成后几乎立即再次执行，持续压迫下游。

**错误示例：**

```java
/** 用错误的启动节拍执行慢轮询。 */
@Scheduled(fixedRate = 5000)
void poll() { fetchSlowRemote(); }
```

**正确写法：**

```java
/** 在上次完成后等待再轮询。 */
@Scheduled(fixedDelay = 5000)
void poll() { fetchSlowRemote(); }
```

**验证方式：** 记录连续开始与结束时间，比较两种时间轴。影响版本：Java 25/8、Spring 7/5.2；来源：
`java25-scheduled-executor-service`、`java8-scheduled-executor-service`、`spring7-scheduled`。

### 错误：用 sleep 表达调度或重试退避

**触发条件：** worker 捕获异常后直接 `Thread.sleep`。

**原因：** sleep 占用当前线程，不表达 `ScheduledFuture` 取消、统一预算或关闭。

**后果：** 执行器容量被阻塞，中断和停机响应变慢。

**错误示例：**

```java
catch (TransientRemoteException error) { Thread.sleep(1000); }
```

**正确写法：**

```java
/** 让框架按有限预算和退避执行瞬态调用。 */
@Retryable(includes = TransientRemoteException.class, maxRetries = 2, delay = 1000)
Report callRemote() { return client.fetch(); }
```

**验证方式：** 取消等待中的任务并断言不再占用业务 worker。影响版本：Java 25/8；来源：`java25-thread`、
`java8-thread`、`spring7-resilience`。

### 错误：对确定性失败无限重试

**触发条件：** 捕获所有异常并不断再次调用。

**原因：** 校验、权限、schema 和代码错误不会随时间自行恢复。

**后果：** 重复副作用、下游放大和线程长期占用。

**错误示例：**

```java
while (true) { callRemote(); }
```

**正确写法：**

```java
/** 只对瞬态异常执行两次额外重试。 */
@Retryable(includes = TransientRemoteException.class, maxRetries = 2)
Report callRemote() { return client.fetch(); }
```

**验证方式：** 瞬态异常最多三次，参数异常只调用一次。影响版本：Spring 7；来源：
`spring7-resilience-retryable`。

### 错误：把 maxRetries 与 maxAttempts 当成同一计数

**触发条件：** 迁移时把数值 3 原样复制到另一个包。

**原因：** Framework 7 `maxRetries` 不含初次调用，Spring Retry `maxAttempts` 包含初次调用。

**后果：** 实际调用次数从三次变成四次，超出下游配额和事务预算。

**错误示例：**

```java
@org.springframework.resilience.annotation.Retryable(maxRetries = 3)
```

**正确写法：**

```java
@org.springframework.resilience.annotation.Retryable(maxRetries = 2)
```

**验证方式：** 用原子计数器断言现代线和旧线都恰好总调用三次。影响版本：Spring 7 / Spring Retry 1.2.5；来源：
`spring7-resilience-retryable`、`spring-retry-legacy-retryable`。
:::

## 安全与性能边界

事件与任务只携带最小不可变标识，不携带密码、Servlet request、数据库连接或可变权限对象。executor 容量必须受
下游限流和内存约束；`CallerRunsPolicy` 会把压力转移给提交线程，不能未经评估用于 Web 请求。重试要有总时长、
最大退避和 jitter，避免多个实例同步冲击下游。任务状态和日志不得泄露事件载荷中的敏感字段。

## 如何验证

1. 默认事件与显式异步事件各记录线程名，并断言载荷快照不变。
2. 外部代理调用进入命名 executor，类内自调用作为负对照保持当前线程。
3. Future 任务故意失败，断言 `ExecutionException`/`CompletionException` cause 与终端状态。
4. `void` 任务故意抛异常，断言 `AsyncUncaughtExceptionHandler` 收到方法名、参数和原始 cause。
5. 有界 executor 占满后断言拒绝，取消后恢复中断，关闭后等待终止。
6. fixedRate 与 fixedDelay 各运行至少三次，比较开始/结束时间；取消后不再增加计数。
7. 瞬态异常按预算恢复，确定性异常不重试，耗尽进入可查询 recovery。
8. Java 25 与 Java 8 fixture 各连续运行两次；所有临时文件仅保存在 `/tmp` 并在结束后确认不存在。

## 练习

### 练习：设计一个可恢复的日报任务

为“每天凌晨 2 点生成报表并投递外部系统”设计 command、事件、cron zone、命名 executor、任务状态、幂等键、
瞬态异常白名单、三次总调用预算和耗尽恢复。

验收标准：能说明原事务何时提交、listener 在哪个线程、每次 attempt 的事务边界、重复触发如何单飞、取消与关闭
如何完成，以及 Java 8 兼容线为何使用 `maxAttempts = 3` 而现代线使用 `maxRetries = 2`。

## 本节小结

事件只负责通知，multicaster 决定线程；异步只负责换执行边界，Future 和异常处理器负责终态；调度只负责时间，
任务状态和单飞负责重入；重试只处理瞬态失败，幂等、独立事务和 recovery 负责副作用。把这四条边界分别验证，
才能得到可观察、可取消、可关闭且可恢复的后台工作流。
