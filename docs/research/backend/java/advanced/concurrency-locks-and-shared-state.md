# Java 高级第 2 门：线程池、并发集合、锁与共享状态研究

> 课程 ID：`backend.java.learn.advanced.concurrency-locks-and-shared-state`  
> 冻结顺序：510  
> 研究日期：2026-08-10  
> 冻结快照：`dzzz-app-20260803-179e722831ab`  
> 边界：只读取 Phase 2 冻结审计产物，不重新读取或运行 `dzzz-app`

## 冻结课程合同

- 标题：线程池、并发集合、锁与共享状态。
- 阶段：`advanced`，深度：`lesson`。
- 前置课程：Lambda、Stream 与 Collectors；使用 JUnit 与 Mock 测试。
- 来源能力：
  1. `JAVA-STDLIB-023`：Executor、Future、Callable 与 CompletableFuture。
  2. `JAVA-LANG-013`：`synchronized` 同步块。
  3. `JAVA-STDLIB-024`：并发集合与阻塞队列。
  4. `JAVA-STDLIB-025`：原子类型与原子计数。
  5. `JAVA-ENGINEERING-014`：共享状态、静态初始化与可变性。
  6. `JAVA-ENGINEERING-015`：锁、可见性与并发状态保护。
  7. `JAVA-RISK-030`：裸线程、临时执行器与拒绝策略失控。
  8. `JAVA-RISK-033`：进程级可变共享状态与测试复位。
  9. `JAVA-RISK-034`：非原子复合操作与非线程安全容器值。
  10. `JAVA-RISK-035`：字符串池锁与仅进程内同步边界。
- 冻结矩阵继续保持 `researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`；本研究稿不修改矩阵、track、manifest 或 signoff。

## 研究范围与版本基线

### 现代主线

- Java 25 LTS。
- Java 25 的 `ExecutorService`、并发集合、锁、原子类型和内存模型合同。
- 虚拟线程只用于说明现代执行器选择和资源限流边界，不把它们当成需要池化的稀缺线程。
- Spring Framework 7.0.8 的 `TaskExecutor` 映射只讲容器托管、队列和关闭责任，不进入 `@Async`、事件、
  调度或重试编排。

### 兼容线

- Java 8。
- Spring Framework 5.2.15.RELEASE 的 `TaskExecutor` 兼容写法。
- 旧线只解释冻结项目场景；不能把 Java 25 的虚拟线程或 Java 25 新增 `ExecutorService.close()`
  回填到 Java 8。

## 官方直接来源核验

以下 URL 在 2026-08-10 通过官方直接地址核验，HTTP 状态均为 200。A 级规范/API 来源用于语言、
内存模型和标准库合同；Spring 官方参考用于容器执行器行为；JEP 与 Oracle 指南只用于虚拟线程演进和
适用边界。

### Java 语言与内存模型

1. **`jls25-memory-model`**：
   <https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html>；Java 25；`specification`。
   `17.4`、`17.4.5`、`17.4.6`、`17.4.7` 支持 program order、synchronizes-with、happens-before、
   volatile、monitor、`Thread.start`/`join` 和 data race 的合同。
2. **`jls8-memory-model`**：
   <https://docs.oracle.com/javase/specs/jls/se8/html/jls-17.html>；Java 8；`specification`。
   用于确认旧线仍遵守同一 happens-before 基本合同，且没有 Java 25 的虚拟线程 API。

### Executor、Future 与异步结果

3. **`java25-executor-service`**：
   <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ExecutorService.html>；
   Java 25；`api-doc`。提交前动作 happens-before 任务动作，任务动作 happens-before `Future.get()` 后动作；
   `shutdown`、`shutdownNow`、`awaitTermination` 和 Java 25 `close()` 的等待/中断合同。
4. **`java8-executor-service`**：
   <https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ExecutorService.html>；Java 8；`api-doc`。
   用于旧线的提交、关闭、等待和中断合同；Java 8 没有 `close()`。
5. **`java25-thread-pool-executor`**：
   <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html>；
   Java 25；`api-doc`。核心线程、队列、最大线程和拒绝处理的顺序，以及无界队列使最大线程基本不起作用的边界。
6. **`java8-thread-pool-executor`**：
   <https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ThreadPoolExecutor.html>；Java 8；`api-doc`。
   用于旧线同样的建线程、入队和拒绝顺序；`submit` 捕获异常而不是让 `afterExecute` 直接看到计算异常。
7. **`java25-future`**：
   <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/Future.html>；Java 25；
   `api-doc`。`get` 的内存一致性和异常合同，以及 Java 25 新增的 `state`、`resultNow`、`exceptionNow`。
8. **`java8-future`**：
   <https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/Future.html>；Java 8；`api-doc`。
   用于旧线 `get`、取消、超时和异常观察；不使用 Java 25 的即时结果方法。
9. **`java25-completable-future`**：
   <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/CompletableFuture.html>；
   Java 25；`api-doc`。`join`/`get` 的异常包装、`handle`/`whenComplete`/`exceptionally` 的结果保留规则，
   以及未显式传入执行器时的默认执行策略。本课不扩展到复杂异步编排。
10. **`java8-completable-future`**：
    <https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/CompletableFuture.html>；Java 8；
    `api-doc`。确认旧线可使用同一基本结果和异常观察 API。
11. **`java25-executors`**：
    <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/Executors.html>；Java 25；
    `api-doc`。固定池、单线程执行器、工作窃取池和 virtual-thread-per-task 工厂的选择边界；虚拟线程不作为固定池成员池化。
12. **`java8-executors`**：
    <https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/Executors.html>；Java 8；`api-doc`。
    用于旧线固定线程池、单线程执行器和工作窃取工厂的共同 API；不包含虚拟线程工厂。

### 并发集合、队列、原子类型与锁

13. **`java25-concurrent-hash-map`**：
    <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html>；
    Java 25；`api-doc`。检索通常不阻塞，`putIfAbsent`/`compute`/`merge` 的每键原子合同，禁止 null，
    bulk 操作不提供整体快照，remapping 函数不能递归修改同一 map。
14. **`java8-concurrent-hash-map`**：
    <https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ConcurrentHashMap.html>；Java 8；`api-doc`。
    用于旧线同一并发集合和复合更新合同。
15. **`java25-blocking-queue`**：
    <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/BlockingQueue.html>；
    Java 25；`api-doc`。`add`、`offer`、`put`、定时操作的差异，null 禁止，单项入队的可见性与 bulk 非原子边界。
16. **`java8-blocking-queue`**：
    <https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/BlockingQueue.html>；Java 8；`api-doc`。
    用于旧线同一队列操作合同。
17. **`java25-reentrant-lock`**：
    <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/locks/ReentrantLock.html>；
    Java 25；`api-doc`。公平性只是竞争偏好，`tryLock()` 可忽略公平；官方建议获取后立即进入 `try`，
    并把 `unlock()` 放在 `finally` 的第一条语句。
18. **`java8-reentrant-lock`**：
    <https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/locks/ReentrantLock.html>；Java 8；`api-doc`。
    用于旧线锁释放、中断和公平性合同。
19. **`java25-read-write-lock`**：
    <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/locks/ReadWriteLock.html>；
    Java 25；`api-doc`。无 writer 时读锁可并行、写锁独占；升级/降级、读写偏好和性能必须按实现与负载验证。
20. **`java8-read-write-lock`**：
    <https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/locks/ReadWriteLock.html>；Java 8；`api-doc`。
    用于旧线同一读写锁合同。

21. **`java25-atomic-integer`**：
    <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/atomic/AtomicInteger.html>；
    Java 25；`api-doc`。`incrementAndGet` 等复合更新方法提供原子计数；原子类型不替代更大范围的状态不变量。
22. **`java8-atomic-integer`**：
    <https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/atomic/AtomicInteger.html>；Java 8；`api-doc`。
    用于旧线同一原子计数 API 和可见性合同。

### 虚拟线程与 Spring 执行器边界

23. **`java25-virtual-threads`**：
    <https://docs.oracle.com/en/java/javase/25/core/virtual-threads.html>；Java 25；`official-reference`。
    虚拟线程适合大量等待型任务，不应作为固定大小的线程池池化；外部资源并发应由 semaphore 或连接池限制。
24. **`jep-444-virtual-threads`**：
    <https://openjdk.org/jeps/444>；Java 21 定稿且适用于 Java 25；`release-note`。
    说明虚拟线程追求规模和吞吐，不是让单个任务更快，也不应把线程本身作为资源池。
25. **`jep-491-synchronized-virtual-threads`**：
    <https://openjdk.org/jeps/491>；Java 24 定稿且适用于 Java 25；`release-note`。
    Java 25 不能照搬 Java 21 的“普通 synchronized 一律 pinning”结论；剩余边界包括 native/foreign 调用和类初始化。
26. **`spring7-task-execution`**：
    <https://docs.spring.io/spring-framework/reference/integration/scheduling.html>；Spring Framework 7.0.8；
    `official-reference`。容器托管的 `TaskExecutor`/`ThreadPoolTaskExecutor` 负责线程、队列和生命周期；本课只保留最小执行器映射。
27. **`spring5-task-execution`**：
    <https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/integration.html#scheduling>；
    Spring Framework 5.2.15.RELEASE；`official-reference`。用于旧线兼容配置和显式关闭边界，不把旧 API 限制当作现代建议。

## 关键合同与教学边界

1. **可见性先于原子性。** happens-before 解决“能否看到”，不能把 `count++` 这样的读改写变成原子操作；
   普通共享字段必须用明确同步边、原子类型或锁保护。
2. **执行器是资源边界。** 有界队列、最大线程数和拒绝策略共同决定背压；无界队列会使最大线程设置失去预期作用。
3. **Future 是结果合同。** 任务完成不等于成功；必须读取 `Future` 处理取消、超时和 `ExecutionException`，
   `submit` 捕获的任务异常不能只靠 worker 日志推断。
4. **复合更新要用原子 API。** `ConcurrentHashMap` 的单键 `compute`/`merge` 和原子类型更新适合单个状态项，
   不能把 map 的 bulk 操作当成全局快照。
5. **锁的释放是结构合同。** 显式锁获取后立即进入 `try/finally`；读写锁升级不能靠猜测，收益也必须测量。
6. **执行器生命周期属于所有权。** Java 25 可用 `close()` 等待托管执行器结束，Java 8 需要 `shutdown` 与 `awaitTermination`；
   `shutdownNow` 只是协作中断请求。
7. **虚拟线程不替代限流。** 大量等待型任务可使用 virtual-thread-per-task；数据库连接、远端配额等外部资源仍需 semaphore 或连接池。
8. **Spring 只做托管映射。** 本课展示托管 `ThreadPoolTaskExecutor` 的核心/最大线程、队列和关闭，
   不提前讲 `@Async`、事件、调度和重试。

## 冻结项目证据

以下只摘录 Phase 2 矩阵中的代表符号，未读取项目源码。计数之间可能重叠，不能相加为独立文件数。

| sourceId | 冻结计数与代表符号 | usage | 仅能支持的结论 |
| --- | --- | --- | --- |
| `JAVA-STDLIB-023` | 77；`ThreadPoolConfig`、`CameraServiceImpl`、`Pdf2ImageComparablePriorityTaskPoolExecutor` | observed | 项目存在执行器、任务池和任务提交场景 |
| `JAVA-LANG-013` | 12；`AppAspect`、`Pdf2ImageComparablePriorityTaskPoolExecutor`、`ClientZzWsServer` | observed | 项目出现 synchronized/线程同步能力 |
| `JAVA-STDLIB-024` | 12；`AppFrontYyzxWsServer`、`JzglConstant`、`LockStringUtil` | observed | 项目存在并发容器、队列或锁相关标准库使用 |
| `JAVA-STDLIB-025` | 5；`BlOperationWsServer`、`CodeGenerator`、`UniqueIDGeneratorUtil` | observed | 项目存在原子计数或唯一值生成场景 |
| `JAVA-ENGINEERING-014` | 9；`LoggingTailReadResult`、`VidyoDataCommon`、`JzglConstant` | observed | 项目有进程级共享状态和可变性场景 |
| `JAVA-ENGINEERING-015` | 12；`Pdf2ImageComparablePriorityTaskPoolExecutor`、`FtjlServiceImpl`、`LockStringUtil` | corrected | 课程需要讲清锁、可见性和保护责任 |
| `JAVA-RISK-030` | 27；`LoggingWSServer`、`Fyb4WindowsImpl`、`CommonUtil` | corrected | 裸线程、临时执行器和拒绝策略应建立可审查边界，不宣称当前代码必有缺陷 |
| `JAVA-RISK-033` | 39；`BlOperationWsServer`、`ConverterFactories`、`DzzzDxpzCacheLoader` | corrected | 进程级共享状态需要初始化、隔离和测试复位合同 |
| `JAVA-RISK-034` | 8；`Voice2TextWsServer`、`AppFrontYyzxWsServer`、`ClientChatWsServer` | corrected | 非原子复合操作和非线程安全容器值只作纠错边界 |
| `JAVA-RISK-035` | 11；`AppAspect`、`FtjlServiceImpl`、`ClientZzWsServer` | rejected | 字符串池锁不作为推荐同步边界，只说明其进程内和生命周期风险 |

## 易错点取证计划

每个易错点都按“现象 -> 触发条件 -> 原因 -> 后果 -> 错误示例 -> 正确写法 -> 版本 -> 验证方式 -> 来源”
编写。正文至少覆盖以下 10 个可重复错误：

1. 普通共享 flag 或 count 没有 happens-before。
2. 把 `volatile int` 的 `n++` 当成原子计数。
3. 只观察 `submit` 日志，不读取 `Future.get()`。
4. 把 `Future.isDone()` 当成成功。
5. 混淆 `CompletableFuture.join()` 的 `CompletionException` 与 `get()` 的 `ExecutionException`。
6. 把非 async continuation 当成一定运行在调用线程，或把默认 common pool 当成业务隔离执行器。
7. 误以为无界队列会让 `maximumPoolSize` 扩容。
8. 把 `shutdownNow()` 当成强制杀线程，忽略协作中断和终止等待。
9. 把 `ConcurrentHashMap` bulk 操作当成全局快照，或在 remapping 函数中回写同一 map。
10. 忘记 `finally` 解锁、误判公平 `tryLock()`，或把虚拟线程池化并忽略外部资源限流。

性能只写官方指出的影响因素和验证方法，不给没有 JMH/JFR 环境、硬件、负载和结果支撑的吞吐结论。

## 课程设计与反馈环合同

1. 正文按“共享状态与 happens-before -> 执行器生命周期 -> 队列/拒绝 -> Future/CompletableFuture 结果 ->
   并发集合 -> 原子类型 -> synchronized/Lock/ReadWriteLock -> 虚拟线程与 Spring 托管映射”的顺序展开。
2. Java 25 正例使用 bounded `ThreadPoolExecutor`、`ConcurrentHashMap.compute`、`AtomicInteger`、
   `ReentrantLock`/`ReadWriteLock`、Future 异常观察和 virtual-thread-per-task；Java 8 正例使用共同 API，
   显式 `shutdown`/`awaitTermination`，不调用 Java 25 独有方法。
3. 负例至少覆盖拒绝策略被静默丢弃、非原子复合更新、异常路径未释放锁和未处理中断；负例必须以可观察断言失败结束。
4. 反馈环使用 `/tmp` 的 Java 25 与 Java 8 容器各连续通过两次；任何 fixture 不写回仓库。
5. Spring 示例只验证精确版本的 `ThreadPoolTaskExecutor` 配置和关闭，不引入后续课程的 `@Async`、事件、调度或重试。

## 研究 Gate 自检

- [x] 课程 ID、顺序、两个前置与十个来源能力来自冻结 Phase 2 矩阵。
- [x] 27 个官方直接 URL 已记录名称、适用版本、来源类型、支持结论和核验日期。
- [x] Java 25 / Java 8 的 API 合同分开；Java 25 `close()`、即时 Future 状态方法和虚拟线程没有回填旧线。
- [x] JEP 491 的 Java 25 pinning 边界已纠正，未把 Java 21 旧表述当当前结论。
- [x] 项目证据只来自冻结矩阵，使用 `observed` 或 `corrected`/`rejected`，没有读取或运行 `dzzz-app`。
- [x] Future/CompletableFuture 只覆盖结果、异常和执行器选择；复杂异步编排、事件、调度和重试留给后续课程。
- [x] 反馈环、负例、双版本和清理要求已先于正文冻结。

## 发布结论与 Stop Boundary

本文件只完成 Java 高级第 2 门课程的官方资料研究。课程正文、临时反馈环、发布接线、页面证据、独立
signoff 与双轴复审均未执行；不得据此开始任何后续高级课程。
