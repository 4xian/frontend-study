# Java 高级第 4 门：事件、异步执行、调度与重试研究

> 课程 ID：`backend.java.learn.advanced.events-async-scheduling-and-retry`  
> 冻结顺序：530  
> 锚点：`JAVA-FRAMEWORK-005`  
> 研究日期：2026-08-10  
> 冻结快照：`dzzz-app-20260803-179e722831ab`  
> 边界：只读取 Phase 2 冻结审计产物，不重新读取或运行 `dzzz-app`，不读取后续课程研究稿或正文

## 冻结课程合同

- 标题：事件、异步执行、调度与重试。
- 阶段：`advanced`，深度：`lesson`。
- 前置课程：线程池、并发集合、锁与共享状态；事务与幂等；依赖注入与 Bean 生命周期。
- 来源能力：
  1. `JAVA-FRAMEWORK-005`：Spring 异步执行与任务调度。
  2. `JAVA-FRAMEWORK-003`：Spring 应用事件。
  3. `JAVA-FRAMEWORK-006`：Spring Retry。
  4. `JAVA-ENGINEERING-016`：异步执行与线程边界。
  5. `JAVA-ENGINEERING-038`：任务调度、上下文与执行状态。
  6. `JAVA-RISK-031`：异步事务、上下文与失败观测断裂。
  7. `JAVA-RISK-043`：事件发布线程、载荷可变性与监听副作用。
  8. `JAVA-RISK-047`：阻塞等待与分散调度开关。
- 冻结矩阵继续保持 `researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`；本研究稿不修改矩阵、track、manifest 或 signoff。

## 研究范围与版本基线

### 现代主线

- Java 25 LTS/current-supported-stable-at-research-time。
- Spring Framework 7.0.8。
- Framework 7.0 已把常用 resilience 能力纳入核心，包含 `@Retryable`、`@ConcurrencyLimit` 和
  `RetryTemplate`；正文应以 Framework 7 核心能力为现代主线，不把已归档的 Spring Retry
  第三方项目当作新项目默认依赖。

### 兼容线

- Java 8。
- Spring Boot 2.3.12.RELEASE；其冻结依赖表管理 Spring Retry `1.2.5.RELEASE`，冻结 Spring Framework
  线为 5.2.15.RELEASE。
- 兼容示例只使用 Java 8 与 Framework 5.2.15/Boot 2.3.12 共同可用的 API；不把 Framework 7 的
  reactive `@Scheduled`、`RetryTemplate` 新包、Java 25 `ExecutorService.close()` 或即时 Future
  状态方法回填旧线。

## 核验方法与已核验的官方直接来源

以下 URL 均在 2026-08-10 通过 Tavily 首轮定位后，以官方页面、官方 Javadoc、官方 GitHub 仓库或
Oracle 规范/API 直接核验。`official-reference`、`api-doc`、`specification` 和 `release-note` 用于
区分来源性质；所有条目的 `accessed` 均为 `2026-08-10`。

### Spring Framework 7.0.8

1. **`spring7-event-publisher`**：Spring Framework 7.0.8 `ApplicationEventPublisher` Javadoc，
   <https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/context/ApplicationEventPublisher.html>；
   `api-doc`；`appliesTo: Spring Framework 7.0.8`；`accessed: 2026-08-10`。发布只是把事件交给
   multicaster，不承诺同步、异步或立即执行；监听器应保持高效，阻塞工作应自行异步化。
2. **`spring7-simple-multicaster`**：`SimpleApplicationEventMulticaster` Javadoc，
   <https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/context/event/SimpleApplicationEventMulticaster.html>；
   `api-doc`；`appliesTo: Spring Framework 7.0.8`；`accessed: 2026-08-10`。默认等价于
   `SyncTaskExecutor`，监听器在发布线程执行；设置 executor 才会切换线程。异步执行默认不携带发布者的
   class-loader/transaction context；声明不支持异步的监听器（例如事务同步监听器）仍在原线程运行。
3. **`spring7-event-listener`**：`@EventListener` Javadoc，
   <https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/context/event/EventListener.html>；
   `api-doc`；`appliesTo: Spring Framework 7.0.8`；`accessed: 2026-08-10`。检查异常会包装为
   `UndeclaredThrowableException`；`@Async` 监听器的异常不会传播给发布者，不能通过返回值发布后续事件，
   必须显式注入 `ApplicationEventPublisher`。
4. **`spring7-transactional-event-listener`**：`@TransactionalEventListener` Javadoc，
   <https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/transaction/event/TransactionalEventListener.html>；
   `api-doc`；`appliesTo: Spring Framework 7.0.8`；`accessed: 2026-08-10`。没有活动事务时默认丢弃，
   除非明确 `fallbackExecution=true`；默认阶段是 `AFTER_COMMIT`。提交/回滚后资源可能仍可访问，
   但此时数据访问仍参与原事务且变更不会再提交；需要写入时必须显式开启新的事务边界。
5. **`spring7-event-reference`**：Application events 与 transaction-bound events 参考文档，
   <https://docs.spring.io/spring-framework/reference/core/beans/context-introduction.html#context-functionality-events>
   和 <https://docs.spring.io/spring-framework/reference/data-access/transaction/event.html>；
   `official-reference`；页面元数据为 `7.0.8`；`accessed: 2026-08-10`。用于核对事件注册、
   `@EventListener` 与事务阶段的整体用法。
6. **`spring7-scheduling-reference`**：TaskExecutor、TaskScheduler、`@Async`、`@Scheduled` 参考文档，
   <https://docs.spring.io/spring-framework/reference/integration/scheduling.html>；
   `official-reference`；页面元数据为 `7.0.8`；`accessed: 2026-08-10`。Spring 用
   `TaskExecutor` 抽象异步执行、用 `TaskScheduler` 抽象未来调度；`ThreadPoolTaskExecutor` 暴露池配置，
   `ThreadPoolTaskScheduler` 代理 `ScheduledExecutorService`；默认 advice mode 为 proxy，类内自调用不拦截。
7. **`spring7-async`**：`@Async` Javadoc，
   <https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/scheduling/annotation/Async.html>；
   `api-doc`；`appliesTo: Spring Framework 7.0.8`；`accessed: 2026-08-10`。返回类型只能是 `void` 或
   `Future`（可用更具体的 `CompletableFuture`）；代理返回的 Future 才是实际异步结果；`value` 可按 bean 名
   选择指定 executor。
8. **`spring7-enable-async`**：`@EnableAsync` Javadoc，
   <https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/scheduling/annotation/EnableAsync.html>；
   `api-doc`；`appliesTo: Spring Framework 7.0.8`；`accessed: 2026-08-10`。先找唯一 `TaskExecutor`，
   再找名为 `taskExecutor` 的 `Executor`，否则使用 `SimpleAsyncTaskExecutor`；`void` 异常默认只记录日志，
   应提供 `AsyncConfigurer`/`AsyncUncaughtExceptionHandler` 和受管 executor。
9. **`spring7-async-error-handler`**：`AsyncUncaughtExceptionHandler` Javadoc，
   <https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/aop/interceptor/AsyncUncaughtExceptionHandler.html>；
   `api-doc`；`appliesTo: Spring Framework 7.0.8`；`accessed: 2026-08-10`。专门处理 `void` 异步方法未传回
   调用方的异常；有返回值的方法应观察其 Future。
10. **`spring7-scheduled`**：`@Scheduled` Javadoc，
    <https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/scheduling/annotation/Scheduled.html>；
    `api-doc`；`appliesTo: Spring Framework 7.0.8`；`accessed: 2026-08-10`。周期任务必须从
    `cron`、`fixedDelay`、`fixedRate` 中选一个；方法不能有参数；`zone` 指定 cron 时区；可重复声明会产生
    独立触发器并可能并行重叠；`CRON_DISABLED` 为 `"-"`。Framework 7 还支持可重复订阅的 reactive
    `Publisher`，其错误只记录并继续后续迭代。
11. **`spring7-thread-pool-task-executor`**：`ThreadPoolTaskExecutor` Javadoc，
    <https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/scheduling/concurrent/ThreadPoolTaskExecutor.html>；
    `api-doc`；`appliesTo: Spring Framework 7.0.8`；`accessed: 2026-08-10`。默认 core=1、max=`Integer.MAX_VALUE`、
    queue=`Integer.MAX_VALUE`；正数 queue 使用 `LinkedBlockingQueue`，否则使用 `SynchronousQueue`；因此课程必须
    显式设定有界队列、最大线程、命名和拒绝处理，并定义关闭等待/取消策略。
12. **`spring7-resilience`**：Framework 7 resilience reference，
    <https://docs.spring.io/spring-framework/reference/core/resilience.html>；`official-reference`；页面元数据为
    `7.0.8`；`accessed: 2026-08-10`。7.0 起核心包含 `@Retryable`、`@ConcurrencyLimit` 与编程式
    `RetryTemplate`；默认最多 3 次重试（初次调用之外）和 1 秒固定退避，失败后把最后一次原始异常交给调用者，
    并发布 `MethodRetryEvent` 供观测。
13. **`spring7-resilience-retryable`**：Framework 7.0.8 `org.springframework.resilience.annotation.Retryable`，
    <https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/resilience/annotation/Retryable.html>；
    `api-doc`；`appliesTo: Spring Framework 7.0.8`；`accessed: 2026-08-10`。`includes`/`excludes` 匹配异常及
    cause；`maxRetries` 不含初次调用；`delay`、`jitter`、`multiplier`、`maxDelay` 和 timeout 形成可配置的
    退避上限；用 `@EnableResilientMethods` 或对应 BeanPostProcessor 才启用。

### Spring Framework 5.2.15.RELEASE 与 Boot 2.3.12.RELEASE

14. **`spring5-simple-multicaster`**：
    <https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/context/event/SimpleApplicationEventMulticaster.html>；
    `api-doc`；`appliesTo: Spring Framework 5.2.15.RELEASE`；`accessed: 2026-08-10`。默认发布线程同步，
    配 executor 才异步，且不会自动参加调用方 class-loader/transaction association。
15. **`spring5-event-listener`** 与 **`spring5-transactional-event-listener`**：
    <https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/context/event/EventListener.html>、
    <https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/transaction/event/TransactionalEventListener.html>；
    `api-doc`；`appliesTo: Spring Framework 5.2.15.RELEASE`；`accessed: 2026-08-10`。异步 listener 失败不回传、
    返回值不能接着发布事件；事务 listener 无事务默认丢弃，默认阶段 `AFTER_COMMIT`，只支持 thread-bound
    `PlatformTransactionManager`，不具备 6.1 以后 reactive transaction 支持。
16. **`spring5-scheduling-reference`**：
    <https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/integration.html#scheduling>；
    `official-reference`；`appliesTo: Spring Framework 5.2.15.RELEASE`；`accessed: 2026-08-10`。旧线同样提供
    TaskExecutor/TaskScheduler、`@Async`、`@Scheduled`、命名 executor/scheduler 与 proxy 自调用边界。
17. **`spring5-async`、`spring5-enable-async`、`spring5-scheduled`**：
    <https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/scheduling/annotation/Async.html>、
    <https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/scheduling/annotation/EnableAsync.html>、
    <https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/scheduling/annotation/Scheduled.html>；
    `api-doc`；`appliesTo: Spring Framework 5.2.15.RELEASE`；`accessed: 2026-08-10`。旧线 `@Async` 返回
    `void`/`Future`（含 `ListenableFuture`/`CompletableFuture`），`@Scheduled` 方法无参数且通常 `void`，
    `zone` 默认服务器时区；没有 Framework 7 的 reactive Publisher 调度合同。
18. **`boot2312-dependency-versions`**：Boot 2.3.12 managed dependency versions，
    <https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/appendix-dependency-versions.html>；
    `official-reference`；`appliesTo: Spring Boot 2.3.12.RELEASE`；`accessed: 2026-08-10`。确认
    `org.springframework.retry:spring-retry` 为 `1.2.5.RELEASE`；这是 legacy 项目的适配线，不是现代最新线。

### Spring Retry 版本核验

19. **`spring-retry-latest-release`**：官方 GitHub Releases API 返回的最新非预发布 release，
    <https://github.com/spring-attic/spring-retry/releases/tag/v2.0.13>；`release-note`；
    `appliesTo: Spring Retry 2.0.13`；发布 `2026-06-08`；`accessed: 2026-08-10`。v2.0.13 升级到
    Spring Framework 6.2.19；它是当前可核验的最新稳定标签，但仓库已归档。
20. **`spring-retry-status`**：官方项目 README，
    <https://github.com/spring-attic/spring-retry/blob/main/README.md>；`official-reference`；
    `appliesTo: Spring Retry archived main`；`accessed: 2026-08-10`。明确声明 Spring Retry 不再维护，
    已被 Spring Framework 7 的 resilience features 取代；2.0.13 的构建要求 Java 17、Spring Framework 6.2.19。
21. **`spring-retry-legacy-pom`、`spring-retry-legacy-api`**：
    <https://github.com/spring-attic/spring-retry/blob/1.2.5/pom.xml>、
    <https://github.com/spring-attic/spring-retry/blob/1.2.5/src/main/java/org/springframework/retry/annotation/Retryable.java>、
    <https://github.com/spring-attic/spring-retry/blob/1.2.5/src/main/java/org/springframework/retry/annotation/Recover.java>；
    `api-doc/source`；`appliesTo: artifact 1.2.5.RELEASE`；`accessed: 2026-08-10`。POM 的 artifact 版本为
    `1.2.5.RELEASE`，编译 source/target 为 1.6，依赖基线为 Framework 4.3.22；`@Retryable.maxAttempts` 默认 3
    且包含初次调用，`include`/`exclude`、`backoff`、`stateful` 可选；`@Recover` 用于耗尽后的恢复。Boot
    2.3.12 的管理版本是该 artifact，因此旧线应保留 `@EnableRetry`/`@Retryable`/`@Recover` 合同，不能使用
    Framework 7 的 `org.springframework.resilience` 包。

### Java 25 与 Java 8 标准库/规范

22. **`java25-executor-service`** 与 **`java8-executor-service`**：
    <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ExecutorService.html>、
    <https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ExecutorService.html>；`api-doc`；
    `appliesTo: Java 25 / Java 8`；`accessed: 2026-08-10`。`shutdown` 拒绝新任务但让已提交任务完成；
    `shutdownNow` 只是尽力中断正在执行任务并返回排队任务，必须配合 `awaitTermination`；Java 25 的
    `close()` 等待终止，Java 8 没有该方法。
23. **`java25-future`、`java8-future`**：
    <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/Future.html>、
    <https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/Future.html>；`api-doc`；
    `appliesTo: Java 25 / Java 8`；`accessed: 2026-08-10`。`get` 必须处理取消、超时、中断和
    `ExecutionException`；Java 25 新增 `state`/`resultNow`/`exceptionNow`，不能回填 Java 8。
24. **`java25-completable-future`、`java8-completable-future`**：
    <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/CompletableFuture.html>、
    <https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/CompletableFuture.html>；`api-doc`；
    `appliesTo: Java 25 / Java 8`；`accessed: 2026-08-10`。无显式 executor 的 async 方法使用默认异步执行设施；
    `get` 抛 `ExecutionException`，`join` 抛 `CompletionException`；`whenComplete` 观察结果但保留原结果/异常，
    `exceptionally`/`handle` 才是显式失败恢复。
25. **`java25-scheduled-executor-service`、`java8-scheduled-executor-service`**：
    <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ScheduledExecutorService.html>、
    <https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ScheduledExecutorService.html>；`api-doc`；
    `appliesTo: Java 25 / Java 8`；`accessed: 2026-08-10`。`scheduleAtFixedRate` 按连续启动时间测量，任务过长
    时会晚启动但同一周期任务不并发；`scheduleWithFixedDelay` 按上次终止到下次开始测量；任一执行抛异常会抑制
    后续执行，返回的 `ScheduledFuture` 可取消。
26. **`java25-thread-sleep`、`java8-thread-sleep`**：
    <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Thread.html>、
    <https://docs.oracle.com/javase/8/docs/api/java/lang/Thread.html>；`api-doc`；`appliesTo: Java 25 / Java 8`；
    `accessed: 2026-08-10`。`sleep` 只是让当前线程暂时停止执行且保留 monitor 所有权，不是可取消的调度/退避
    资源；课程禁止用它表达任务间隔或重试退避。
27. **`jls25-records`、`jls8-classes`**：
    <https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.10>、
    <https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html>；`specification`；
    `appliesTo: Java 25 / Java 8`；`accessed: 2026-08-10`。Java 25 可用 record 作为固定组件载荷的语法合同；
    record 只保证组件字段的浅层 final，不自动深拷贝可变对象。Java 8 没有 record，使用 final 字段和防御性
    拷贝实现相同的不可变快照合同。

## 关键合同与版本差异

### 1. 事件：发布线程由 multicaster 决定

1. `ApplicationEventPublisher.publishEvent` 只是把事件交给 `ApplicationEventMulticaster`，调用点本身不能
   证明同步或异步。
2. `SimpleApplicationEventMulticaster` 默认在发布线程同步调用 listener；只有显式配置 executor 才异步。
   配置异步后，发布线程的 transaction、class-loader、ThreadLocal 等上下文不会自动跨线程。
3. 事件 payload 是发布时的事实快照：用 Java 25 `record` 但不放可变集合/数组引用，或在 Java 8 用 final 字段、
   不可变集合和防御性拷贝。不要在 `publishEvent` 后修改同一实例；异步 listener 可能在另一线程看到修改。
4. `@EventListener` 的异步失败不能回到发布者；`void` 事件处理必须由 `AsyncUncaughtExceptionHandler`、日志、
   指标或告警显式观测。需要产生后续事件时在 listener 中显式 `publishEvent`，不要依赖返回值。
5. `@TransactionalEventListener` 默认 `AFTER_COMMIT`，无事务默认丢弃。它解决“何时允许处理”的事务阶段问题，
   不会把 listener 自动变成异步，也不把提交后的写入变成新的事务。异步事务 listener 必须在 listener 自身显式
   开启新事务，并说明失败如何重试或进入恢复路径。

### 2. 异步执行：代理、结果和上下文都必须显式

| 入口 | 返回/失败合同 | 课程要求 |
| --- | --- | --- |
| `@Async void` | 调用者只拿到提交完成；异常不回传，默认仅日志 | 提供 `AsyncUncaughtExceptionHandler`，记录任务 id、异常和 executor；不可把日志当业务确认 |
| `@Async Future` | 代理返回真实异步 Future；`get` 观察异常、取消、超时、中断 | 调用方必须保存并处理 Future，或转换成明确的 completion pipeline |
| `@Async CompletableFuture` | 支持 `whenComplete`/`handle`/`exceptionally`；`join` 与 `get` 包装异常不同 | 每条链必须有终端观测或恢复；不把 `isDone` 当成功 |
| `CompletableFuture.*Async` 无 executor | 使用默认异步执行设施（通常 common pool） | 业务隔离任务显式传入命名 executor，避免隐式共享池 |

- `@EnableAsync` 默认 proxy mode，类内 `this.foo()` 不经过代理；把异步入口放到另一个 bean 或使用明确的
  外部代理调用。
- `@Async`、`@Transactional`、ThreadLocal 是不同的代理/线程边界；事务不会因为 `@Async` 自动传播，ThreadLocal
  也不会自动复制。必须在新线程显式构造所需上下文，并在任务自身 `finally` 清理。
- 使用 `@Async("namedExecutor")` 或等价的显式 executor qualifier；不要让不同业务共享未命名的默认执行器。

### 3. 执行器：集中配置有界容量、拒绝、取消、关闭

推荐把 executor 当作基础设施 bean，而不是在业务方法中 `new Thread`/`new Executor`：

```java
@Bean("reportExecutor")
ThreadPoolTaskExecutor reportExecutor() {
    var executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(4);
    executor.setMaxPoolSize(8);
    executor.setQueueCapacity(100);
    executor.setThreadNamePrefix("report-");
    executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
    executor.setWaitForTasksToCompleteOnShutdown(true);
    executor.setAwaitTerminationSeconds(30);
    return executor;
}
```

这是教学合同而非固定容量答案：容量应以任务耗时、下游配额和可接受延迟测量。必须说明：

- 正数有限 queue 才形成可见背压；无界 queue 会让 `maxPoolSize` 很难按预期扩容。
- 拒绝策略是业务合同：抛错、调用方执行、丢弃或丢弃最旧任务必须有明确告警和重试/补偿语义，不能静默。
- `Future.cancel(true)` 和 `shutdownNow` 都是协作取消；任务要检查中断、释放资源并保持中断状态，不能把它们当强杀。
- 关闭顺序是停止接收、等待已提交任务、必要时协作取消并 `awaitTermination`；Java 25 可用 `close()` 等待，
  Java 8 使用 `shutdown`/`awaitTermination`。Spring executor 的 lifecycle 关闭选项要集中配置和记录。
- executor 名称、线程名前缀、队列深度、active count、拒绝数、取消数和关闭耗时应可观测。

### 4. 调度：fixedRate、fixedDelay、cron 不可互换

| 模式 | 时间基准 | 适用合同 |
| --- | --- | --- |
| `fixedRate` | 连续两次启动时间 | 期望节拍；单次执行过长会延迟后续开始，不应假设并发重叠 |
| `fixedDelay` | 上次执行结束到下次开始 | 必须等待上次完成后再计时；适合不重叠的轮询/清理 |
| `cron` | 日历表达式 | 业务时区、夏令时和配置开关必须明确；`zone` 不写时使用 scheduler/server 时区 |

- 同一 `@Scheduled` 方法上多个可重复声明会各自创建 trigger，Spring 明确允许它们并行重叠或连续触发；
  多实例部署还需要分布式锁/租约等单飞策略，本课不假设单 JVM 调度就是全局唯一。
- `scheduleAtFixedRate`/`scheduleWithFixedDelay` 任一执行抛异常都可能抑制后续执行，因此周期任务必须有
  顶层失败观测和恢复策略，不能让异常悄悄终止任务。
- `sleep` 占用当前 worker，不能表达 `ScheduledFuture` 的取消和关闭；定时任务与退避都使用集中配置的
  `TaskScheduler`/`ScheduledExecutorService` 或框架 backoff 策略。

### 5. 重试：只处理瞬态失败，并控制重试边界

1. 先按异常类型/原因分类：网络短暂断开、可恢复的锁竞争或下游临时不可用才可能重试；参数错误、权限拒绝、
   schema/代码错误等确定性失败不重试。Spring Retry README 明确提醒：总会抛同一异常的操作重试只是在浪费时间。
2. 每个 retry policy 必须写出最大次数（初次调用是否计入）、总耗时、指数/固定退避、最大退避和 jitter。退避
   由 Spring Retry/Framework `RetryTemplate` 或调度器实现，不在工作线程 `sleep`。
3. 耗尽后必须有恢复动作：返回可识别失败、记录可检索的任务 id、进入补偿/死信/人工处理，或调用 `@Recover`。
   “最后一次异常被记录”不等于业务已恢复。
4. 重试会重放副作用，调用必须幂等：使用稳定业务键、幂等表/唯一约束、upsert 或下游幂等 token，并把幂等键
   贯穿事件、异步任务和恢复记录。
5. 事务边界按一次尝试设计：数据库异常使当前事务回滚后，再由外层 retry 开始下一次事务。不要在已标记
   rollback-only 的同一事务中继续重试；`AFTER_COMMIT` 事件 listener 的新写入要用显式 `REQUIRES_NEW` 或独立
   command 边界。
6. Framework 7 `@Retryable.maxRetries` 是“初次调用之外”的次数；Spring Retry 1.2.5 `@Retryable.maxAttempts`
   是“包含初次调用”的总次数。正文必须用两个不同命名和例子，避免把 `3` 解释成同一件事。

## 版本差异决策表

| 主题 | Spring Framework 7.0.8 / Java 25 | Spring 5.2.15 / Boot 2.3.12 / Java 8 | 教学决策 |
| --- | --- | --- | --- |
| 事件默认线程 | multicaster 默认同步；listener 可声明不支持异步 | 同样默认同步；无 6.1 reactive transaction 语义 | 两线都先证明 multicaster，再谈异步 |
| 事务事件 | thread-bound 与 reactive transaction 均有支持；默认 `AFTER_COMMIT` | 仅 thread-bound `PlatformTransactionManager`；默认 `AFTER_COMMIT` | 异步 listener 自己开新事务 |
| `@Async` | `void`/`Future`/`CompletableFuture`；proxy、自选 executor | `void`/`Future`，并有 `ListenableFuture`；proxy、自选 executor | 两线都显式观察失败 |
| `@Scheduled` | 支持 reactive Publisher；重复声明可重叠；`zone`/`CRON_DISABLED` | 返回值忽略；重复声明、`zone`/`CRON_DISABLED` 已有 | 只讲共同的周期语义，reactive 留在现代边界 |
| 执行器关闭 | Java 25 `ExecutorService.close()` 等待终止；Spring 7 有更细的 lifecycle flags | Java 8 `shutdown` + `awaitTermination`；没有 `close()` | 正文不依赖 `close()` |
| Retry | Framework 7 core `org.springframework.resilience`，最新 Spring Retry 项目已归档 | Boot 管理 `spring-retry:1.2.5.RELEASE` | 现代主线用 Framework 7；旧线保留 `@EnableRetry/@Retryable/@Recover` |
| Retry 次数 | `maxRetries` 不含初次调用 | `maxAttempts` 含初次调用 | 每个示例标出总调用次数 |

## 冻结项目证据映射

以下只摘录冻结矩阵中的计数与代表符号，未读取项目源码；计数可能重叠，不能相加成独立文件数。

| sourceId | 冻结计数与代表符号 | usage | 研究映射 |
| --- | --- | --- | --- |
| `JAVA-FRAMEWORK-005` | 23；`DzzzAreaApplication`、`ThreadPoolConfig`、`InitHyServiceImpl`、`CheckCameraTask` | observed | `@Async`、`@Scheduled`、线程池和任务调度需要集中配置与失败观测 |
| `JAVA-FRAMEWORK-003` | 13；`EventPublisher`、`DataReportEvent`、`ApplicationStartedEventListener`、`DataReportListener` | observed | 事件发布线程、listener 选择和载荷快照合同 |
| `JAVA-FRAMEWORK-006` | 2；`DzzzAreaApplication`、`MessageServiceImpl` | observed | 旧线 Spring Retry 兼容 API 与恢复动作 |
| `JAVA-ENGINEERING-016` | 9；`ApplicationStartedEventListener`、`ClearExpireDataHandler`、`DataReportListener` | observed | 异步入口、线程边界和结果传递 |
| `JAVA-ENGINEERING-038` | 44；`ClearExpiredDataTask`、`DxReportTask`、`EndYchyTask`、`ClearExpiredDataController` | observed | 任务状态、调度重入、集中 scheduler 与关闭 |
| `JAVA-RISK-031` | 5；`JzDataSyncTask`、`ReTransmissionService`、`ThreadHandler`、`TslxDataSyncService` | corrected | `@Async`/事务不传播、Future/void 失败必须观测；不宣称当前实现必有缺陷 |
| `JAVA-RISK-043` | 9；`EventPublisher`、`DataReportEvent`、`ApplicationStartedEventListener`、`SendMessageEvent` | corrected | 默认同步由 multicaster 决定；事件载荷不可变；不把 listener 包名当异步证据 |
| `JAVA-RISK-047` | 10；`ConverterFactories`、`ZjqdFileOperateTask`、`KtpqDataSyncTask`、`HyJzDataSyncHandler` | corrected | 禁止 `sleep` 表达调度/退避；有界、可观测、集中配置的 scheduler/executor |

矩阵的 `origin` 为 `project-observed` 与 `risk-correction`；风险条目只用于纠错边界，不能复制为推荐实现。

## 课程正文可直接使用的结论

1. 先画四条边界：事件发布线程、异步 executor、事务生命周期、retry attempt。每次跨边界都复制所需输入、
   返回可观察结果并在拥有边界的一方清理资源。
2. 事件类只承载不可变快照；listener 是否异步由 `ApplicationEventMulticaster`/`@Async` 的实际配置证明，
   不能靠类名、包名或发布器方法名推断。
3. 默认只使用命名且有界的 `ThreadPoolTaskExecutor`；在配置处同时声明 core/max/queue/thread prefix、
   rejection、cancel 和 shutdown policy。调用方不在业务方法里创建临时执行器。
4. `@Async` 返回 `Future`/`CompletableFuture` 时保存并观察；`void` 时安装 `AsyncUncaughtExceptionHandler`
   并发送可检索的失败事件/指标。所有异步链都必须有成功、失败、取消、超时和关闭路径。
5. 轮询用 fixedDelay，节拍用 fixedRate，日历业务用 cron+明确 zone；顶层捕获和记录异常，避免周期任务因一次
   未观察异常停止。需要单飞时使用显式协调机制，而不是假设 scheduler 单线程或单实例。
6. 重试只包住可重试的瞬态操作，退避必须有上限和 jitter，次数和总耗时有限；恢复路径负责幂等补偿和人工可见性。
   每次尝试有独立事务边界，不能把回滚后的资源在同一事务里继续重放。

## 易错点与最少反馈环

正文至少用可观察断言覆盖：

1. 默认同步 multicaster 与显式 executor 的线程名差异。
2. 可变 payload 在异步 listener 中被修改的失败；改用 record/final 快照后通过。
3. `@Async` proxy 自调用不异步；外部 bean 调用后才进入指定 executor。
4. `void` 异常进入 `AsyncUncaughtExceptionHandler`；Future 用 `get`/`whenComplete` 观察异常和取消。
5. 有界 executor 的拒绝、`Future.cancel`、shutdown/awaitTermination 和中断恢复。
6. fixedRate/fixedDelay/cron 的时间轴、zone 和重复声明重叠；任务异常后有明确告警。
7. 瞬态异常按有限退避重试并恢复；确定性异常不重试；重试操作具有稳定幂等键且每次尝试新事务。

反馈环要求：在 `/tmp` 创建最少的 Java 25 + Spring Framework 7.0.8 fixture，以及 Java 8 + Boot 2.3.12 /
Framework 5.2.15 fixture；每个 fixture 连续运行两次，成功后删除临时目录并以不存在性检查为准。若真实
Java 8 或依赖下载不可用，标记 Deferred，不能用 Java 25 结果替代。该研究阶段不创建持久测试、demo 或正文。

## 明确非目标

- 不读取或运行 `dzzz-app`，不把冻结矩阵代表符号扩写成源码缺陷结论。
- 不研究或注册 `cache-and-consistency`，不修改任何后续课程文件。
- 不实现消息 broker、分布式事件总线、持久事件 outbox、Quartz 集群、分布式锁或跨节点 scheduler；这些需要
  独立课程和证据。
- 不把 `sleep`、无限 retry、无界队列、默认 common pool 或隐式 ThreadLocal 传播作为生产建议。
- 不在本阶段编写课程正文、demo、track/manifest 接线、页面验证或 signoff。

## 研究 Gate 自检

- [x] 课程 ID、顺序 530、锚点、3 个前置与 8 个 sourceCapabilityIds 已按冻结信息记录。
- [x] Spring Framework 7.0.8/5.2.15 的事件、事务事件、TaskExecutor、`@Async`、TaskScheduler、`@Scheduled` 已分别核验。
- [x] Java 25/8 的 ExecutorService、Future、CompletableFuture、ScheduledExecutorService 与 Thread.sleep 已分别核验。
- [x] Spring Retry 最新稳定标签核验为 2.0.13（已归档），Boot 2.3.12 适配线核验为 1.2.5.RELEASE；未凭印象写版本。
- [x] 已覆盖同步/异步 multicaster、不可变载荷、异步事务/ThreadLocal 边界、Future/void 失败观测、有界 executor、
  拒绝/取消/关闭、fixedRate/fixedDelay/cron/zone/重叠、禁止 sleep、瞬态重试/退避/恢复/幂等/事务边界。
- [x] 冻结项目证据只来自 JSON/Markdown 矩阵，风险使用 `corrected`，没有读取 `dzzz-app`。

## 发布结论与 Stop Boundary

本文件只完成 Java 高级第 4 门课程的官方资料研究。课程正文、临时反馈环、发布接线、页面证据、独立 signoff
与双轴复审均未执行；不得据此开始或读取任何后续高级课程。
