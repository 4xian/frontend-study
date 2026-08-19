---
id: backend.java.learn.advanced.concurrency-locks-and-shared-state
type: lesson
title: 线程池、并发集合、锁与共享状态
summary: 为并发任务建立可见性、生命周期、背压和状态保护边界，并观察任务结果与失败
domain: backend
technology: java
module: core
stage: advanced
level: advanced
estimatedMinutes: 240
objectives:
  - 能用 happens-before 解释共享字段的可见性，并区分可见性与复合操作原子性。
  - 能配置有界 ThreadPoolExecutor，解释队列、最大线程和拒绝策略的顺序。
  - 能用 Future、CompletableFuture、并发集合、原子类型和显式锁观察并保护共享状态。
  - 能说明虚拟线程、外部资源限流与 Spring 托管执行器的版本边界。
prerequisites:
  - backend.java.learn.intermediate.lambda-stream-and-collectors
  - backend.java.learn.intermediate.testing-with-junit-and-mocks
related: []
tags:
  - Java
  - Java Memory Model
  - ExecutorService
  - ThreadPoolExecutor
  - Future
  - CompletableFuture
  - ConcurrentHashMap
  - BlockingQueue
  - AtomicInteger
  - ReentrantLock
  - ReadWriteLock
  - 虚拟线程
  - 共享状态
appliesTo: Java 25 主线；项目补充适用于 Java 8 / Spring Boot 2.3.12.RELEASE / Spring Framework 5.2.15.RELEASE
modernBaseline:
  java: '25'
  springFramework: 7.0.8
legacyBaseline:
  java: '8'
  springBoot: 2.3.12.RELEASE
  springFramework: 5.2.15.RELEASE
verifiedAt: 2026-08-10
sources:
  - id: jls25-memory-model
    title: Java Language Specification 25 - Threads and Locks
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html
    sourceType: specification
    appliesTo: Java 25
    claims:
      - program order、synchronizes-with 与 happens-before 的关系
      - volatile、monitor、Thread.start 和 Thread.join 的可见性合同
      - data race 不提供顺序一致性保证
  - id: jls8-memory-model
    title: Java Language Specification 8 - Threads and Locks
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-17.html
    sourceType: specification
    appliesTo: Java 8
    claims:
      - Java 8 仍遵守基本 happens-before 与同步语义
  - id: java25-executor-service
    title: Java SE 25 API - ExecutorService
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ExecutorService.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - 提交前动作 happens-before 任务动作，任务动作 happens-before Future.get 后动作
      - shutdown、shutdownNow、awaitTermination 与 close 的生命周期合同
  - id: java8-executor-service
    title: Java SE 8 API - ExecutorService
    url: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ExecutorService.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 的提交、关闭、等待和中断合同
      - Java 8 没有 ExecutorService.close
  - id: java25-thread-pool-executor
    title: Java SE 25 API - ThreadPoolExecutor
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - corePoolSize、workQueue、maximumPoolSize 和拒绝处理的执行顺序
      - 无界队列会使 maximumPoolSize 基本不起预期作用
  - id: java8-thread-pool-executor
    title: Java SE 8 API - ThreadPoolExecutor
    url: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ThreadPoolExecutor.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 线程池建线程、入队和拒绝顺序
      - submit 捕获任务异常，不能只依赖 afterExecute 观察
  - id: java25-future
    title: Java SE 25 API - Future
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/Future.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - get 的内存一致性、超时、取消和异常合同
      - state、resultNow 和 exceptionNow 只属于 Java 25
  - id: java8-future
    title: Java SE 8 API - Future
    url: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/Future.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 的 get、取消、超时和异常观察 API
  - id: java25-completable-future
    title: Java SE 25 API - CompletableFuture
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/CompletableFuture.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - join 与 get 的异常包装差异
      - handle、whenComplete 和 exceptionally 的结果保留规则
      - 未显式传入执行器时的默认执行策略
  - id: java8-completable-future
    title: Java SE 8 API - CompletableFuture
    url: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/CompletableFuture.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 可使用共同的结果和异常观察 API
  - id: java25-executors
    title: Java SE 25 API - Executors
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/Executors.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - 固定池、单线程执行器和 virtual-thread-per-task 工厂的选择边界
      - 虚拟线程不是固定池成员
  - id: java8-executors
    title: Java SE 8 API - Executors
    url: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/Executors.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 固定线程池、单线程执行器和工作窃取工厂
  - id: java25-concurrent-hash-map
    title: Java SE 25 API - ConcurrentHashMap
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - putIfAbsent、compute 和 merge 提供每键原子更新
      - 禁止 null；bulk 操作不是全局快照；remapping 不应回写同一 map
  - id: java8-concurrent-hash-map
    title: Java SE 8 API - ConcurrentHashMap
    url: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ConcurrentHashMap.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 的并发集合和复合更新合同
  - id: java25-blocking-queue
    title: Java SE 25 API - BlockingQueue
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/BlockingQueue.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - add、offer、put 与定时操作的差异
      - 禁止 null；单项入队可见性与 bulk 非原子边界
  - id: java8-blocking-queue
    title: Java SE 8 API - BlockingQueue
    url: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/BlockingQueue.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 的 BlockingQueue 操作合同
  - id: java25-reentrant-lock
    title: Java SE 25 API - ReentrantLock
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/locks/ReentrantLock.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - 获取锁后立即进入 try，并在 finally 中释放
      - 公平性是竞争偏好，tryLock 可以忽略公平
  - id: java8-reentrant-lock
    title: Java SE 8 API - ReentrantLock
    url: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/locks/ReentrantLock.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 的锁释放、中断和公平性合同
  - id: java25-read-write-lock
    title: Java SE 25 API - ReadWriteLock
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/locks/ReadWriteLock.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - 没有 writer 时读锁可并行，写锁独占
      - 升级、降级、偏好和性能必须按实现与负载验证
  - id: java8-read-write-lock
    title: Java SE 8 API - ReadWriteLock
    url: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/locks/ReadWriteLock.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 的读写锁合同
  - id: java25-atomic-integer
    title: Java SE 25 API - AtomicInteger
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/atomic/AtomicInteger.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - incrementAndGet 等复合更新方法提供原子计数
      - 原子类型不替代更大范围的状态不变量
  - id: java8-atomic-integer
    title: Java SE 8 API - AtomicInteger
    url: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/atomic/AtomicInteger.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 的原子计数 API 和可见性合同
  - id: java25-virtual-threads
    title: Java 25 Virtual Threads Reference
    url: https://docs.oracle.com/en/java/javase/25/core/virtual-threads.html
    sourceType: official-reference
    appliesTo: Java 25
    claims:
      - 虚拟线程适合大量等待型任务，不应作为固定大小线程池池化
      - 外部资源并发由 Semaphore 或连接池限制
  - id: jep-444-virtual-threads
    title: JEP 444 - Virtual Threads
    url: https://openjdk.org/jeps/444
    sourceType: release-note
    appliesTo: Java 21 定稿及 Java 25
    claims:
      - 虚拟线程追求规模，不让单个任务更快，也不是资源池
  - id: jep-491-synchronized-virtual-threads
    title: JEP 491 - Synchronize Virtual Threads without Pinning
    url: https://openjdk.org/jeps/491
    sourceType: release-note
    appliesTo: Java 24 定稿及 Java 25
    claims:
      - Java 25 不能照搬 Java 21 的 synchronized 一律 pinning 结论
      - native/foreign 调用和类初始化仍有边界
  - id: spring7-task-execution
    title: Spring Framework 7.0.8 Task Execution and Scheduling
    url: https://docs.spring.io/spring-framework/reference/integration/scheduling.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - 容器托管 TaskExecutor/ThreadPoolTaskExecutor 的线程、队列和生命周期
  - id: spring5-task-execution
    title: Spring Framework 5.2.15 Task Execution and Scheduling
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/integration.html#scheduling
    sourceType: official-reference
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 旧线兼容配置和显式关闭边界
projectEvidence:
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/ThreadPoolConfig.java
    symbol: ThreadPoolConfig
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/service/impl/CameraServiceImpl.java
    symbol: CameraServiceImpl
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/utils/Pdf2ImageComparablePriorityTaskPoolExecutor.java
    symbol: Pdf2ImageComparablePriorityTaskPoolExecutor
    usage: corrected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientZzWsServer.java
    symbol: ClientZzWsServer
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/AppFrontYyzxWsServer.java
    symbol: AppFrontYyzxWsServer
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/constant/JzglConstant.java
    symbol: JzglConstant
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/BlOperationWsServer.java
    symbol: BlOperationWsServer
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/common/LoggingTailReadResult.java
    symbol: LoggingTailReadResult
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/aspect/AppAspect.java
    symbol: AppAspect
    usage: rejected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FtjlServiceImpl.java
    symbol: FtjlServiceImpl
    usage: corrected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/Voice2TextWsServer.java
    symbol: Voice2TextWsServer
    usage: corrected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientChatWsServer.java
    symbol: ClientChatWsServer
    usage: corrected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/service/impl/Fyb4WindowsImpl.java
    symbol: Fyb4WindowsImpl
    usage: corrected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/utils/CommonUtil.java
    symbol: CommonUtil
    usage: corrected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/ConverterFactories.java
    symbol: ConverterFactories
    usage: corrected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/cache/DzzzDxpzCacheLoader.java
    symbol: DzzzDxpzCacheLoader
    usage: corrected
---

# 线程池、并发集合、锁与共享状态

## 为什么需要学习

后端请求经常同时到达：一个请求更新计数，另一个请求读取缓存，第三个请求把工作交给线程池。若只把
“多线程”理解成多开几个 `Thread`，就无法回答三个关键问题：更新何时对其他线程可见、任务失败在哪里观察、
以及系统过载时如何停止继续接收工作。本课把这些问题拆成明确的 API 合同，让并发代码有可审查的资源和状态边界。

## 学习目标

- 能用 happens-before 解释共享字段何时可见，并指出可见性不等于复合操作原子性。
- 能创建有界 `ThreadPoolExecutor`，解释核心线程、队列、最大线程和拒绝策略的先后顺序。
- 能用 `Future`、`CompletableFuture` 观察成功、异常、取消和中断结果。
- 能选择 `ConcurrentHashMap`、`BlockingQueue`、`AtomicInteger`、`synchronized`、显式锁或读写锁。
- 能设计共享状态的所有权、初始化和测试复位，并为 Java 8 / Spring Boot 2.3 写兼容实现。
- 能说明虚拟线程与外部资源限流的边界，不把线程池化当成默认答案。

## 前置术语

你需要会读 lambda、Stream 和 `Collectors`，并会用 JUnit 写一个最小断言。任务是 `Runnable` 或
`Callable`，执行器是接收任务的对象，线程是实际运行任务的执行单元；“共享状态”指多个线程都能读写的
字段或对象。前置课程已经介绍的集合、异常和测试生命周期不在此重复展开。

## 零基础知识点详解

每个小点都按“是什么、作用、场景、步骤、最小示例、结果、误区”展开；示例只保留当前概念需要的 API。

### happens-before 与可见性
**是什么：** hb 是内存模型中的顺序关系，保证一个线程的写在另一个线程读前可见。**作用：** 普通 flag/count 没有 hb，不能靠偶然调度证明正确。**场景：** 发布状态、线程启动/连接、锁交接。

**步骤：**
1. 先启动读取线程，让它在同一监视器上等待。
2. 写入线程在监视器内更新值并唤醒读取线程。
3. 读取线程重新取得监视器后打印值，确认跨线程发布。

```java
public final class HappensBeforeDemo {
    private static final Object LOCK = new Object();
    private static int value;
    /** 发布受保护的值。 */
    static void publish() { synchronized (LOCK) { value = 42; LOCK.notifyAll(); } }
    /** 等待并读取受保护的值。 */
    static int awaitValue() throws InterruptedException {
        synchronized (LOCK) { while (value == 0) { LOCK.wait(); } return value; }
    }
    /** 运行示例。 */
    public static void main(String[] args) throws Exception {
        Thread reader = new Thread(() -> {
            try { System.out.println(awaitValue()); }
            catch (InterruptedException interrupted) { Thread.currentThread().interrupt(); }
        });
        reader.start();
        new Thread(HappensBeforeDemo::publish).start();
        reader.join();
    }
}
```
**结果：** 读取线程输出 `42`。监视器释放 happens-before 后续重新获取。**误区：** 普通字段没有同步边；“这次看到了”不是合同。

### volatile 非原子性
**是什么：** volatile 读写可见，但 `n++` 仍是读、改、写。**作用：** 单次停止标志可用；计数要用原子 API。**场景：** 循环停止或状态发布。

**步骤：**
1. 将独立标志声明为 `volatile`。
2. 将计数改为 `AtomicInteger`。
3. 运行并打印两个结果。

```java
import java.util.concurrent.atomic.AtomicInteger;
public final class VolatileDemo {
    private static volatile boolean stop;
    private static final AtomicInteger count = new AtomicInteger();
    /** 记录一次工作。 */
    static int add() { return count.incrementAndGet(); }
    /** 运行示例。 */
    public static void main(String[] args) { stop = true; System.out.println(stop + "," + add()); }
}
```
**结果：** `true,1`。**误区：** `volatile int n; n++` 不是原子计数。

### ExecutorService 生命周期
**是什么：** 执行器拥有任务提交、拒绝和关闭。**作用：** 把线程所有权集中到一个对象。**场景：** 服务组件拥有后台任务。

**步骤：**
1. 在所有者作用域创建池。
2. 保存 `Future` 并 `get`。
3. Java 25 用 `close` 等待结束。

```java
import java.util.concurrent.*;
public final class ExecutorLifecycleDemo {
    /** 运行并关闭 Java 25 执行器。 */
    public static void main(String[] args) throws Exception {
        try (ExecutorService e = Executors.newSingleThreadExecutor()) { e.submit(() -> 1).get(); }
        System.out.println("closed");
    }
}
```
**结果：** 输出 `closed`。**误区：** `shutdownNow` 只是 best effort，仍需中断协作和终止确认。

### ThreadPoolExecutor 的 core、queue、max 与 rejection
**是什么：** 线程池按核心线程、队列、最大线程、拒绝器的顺序接收任务。**作用：** 建立容量边界。**场景：** 需要可审查的过载行为。

**步骤：**
1. 设置核心/最大线程。
2. 使用有界 `ArrayBlockingQueue`。
3. 用三个阻塞任务占满两个 worker 和一个队列位置，再提交第四项观察拒绝。

```java
import java.util.concurrent.*;
public final class PoolShapeDemo {
    /** 创建一个等待释放信号的任务。 */
    static Runnable blocked(CountDownLatch started, CountDownLatch release) {
        return () -> { started.countDown(); try { release.await(); }
            catch (InterruptedException interrupted) { Thread.currentThread().interrupt(); } };
    }
    /** 创建有界池并观察过载拒绝。 */
    public static void main(String[] args) throws Exception {
        ThreadPoolExecutor e = new ThreadPoolExecutor(1, 2, 1, TimeUnit.SECONDS,
                new ArrayBlockingQueue<>(1), new ThreadPoolExecutor.AbortPolicy());
        CountDownLatch started = new CountDownLatch(2);
        CountDownLatch release = new CountDownLatch(1);
        try {
            e.execute(blocked(started, release));
            e.execute(blocked(started, release));
            e.execute(blocked(started, release));
            started.await();
            e.execute(() -> {});
        } catch (RejectedExecutionException expected) {
            System.out.println("rejected");
        } finally {
            release.countDown(); e.shutdown(); e.awaitTermination(1, TimeUnit.SECONDS);
        }
    }
}
```
**结果：** 第四项抛出 `RejectedExecutionException`，输出 `rejected`。**误区：** 无界队列会让 maximumPoolSize 基本不起作用。

### 有界队列与背压
**是什么：** 有界队列满时，生产者必须等待、降级或失败。**作用：** 把内存和外部配额压力传回调用方。**场景：** 可估计成本的任务。

**步骤：**
1. 创建容量为一的队列。
2. 放入第一项。
3. 用定时 `offer` 观察超时。

```java
import java.util.concurrent.*;
public final class BackpressureDemo {
    /** 在有限时间内入队。 */
    public static void main(String[] args) throws Exception {
        BlockingQueue<String> q = new ArrayBlockingQueue<>(1); q.add("first");
        System.out.println(q.offer("second", 10, TimeUnit.MILLISECONDS));
    }
}
```
**结果：** 输出 `false`。**误区：** `put` 可能无限等待，不能无条件放进请求线程。

### Future 的 get、异常与取消
**是什么：** `Future` 是结果句柄，可等待、取消和查询状态。**作用：** `submit` 捕获的异常由 `get` 传播。**场景：** 必须区分成功、取消、超时和失败。

**步骤：**
1. 提交失败任务并保存句柄。
2. 捕获 `ExecutionException`。
3. 从 `getCause` 读取原异常。

```java
import java.util.concurrent.*;
public final class FutureDemo {
    /** 观察 submit 保存的异常。 */
    public static void main(String[] args) throws Exception {
        ExecutorService e = Executors.newSingleThreadExecutor();
        try { e.submit(() -> { throw new IllegalStateException("bad"); }).get(); }
        catch (ExecutionException ex) { System.out.println(ex.getCause().getClass().getSimpleName()); }
        finally { e.shutdown(); }
    }
}
```
**结果：** 输出 `IllegalStateException`。**误区：** `isDone` 不等于成功，`shutdownNow` 不保证业务回滚。

### CompletableFuture 的结果与异常观察
**是什么：** `CompletableFuture` 提供完成和异常观察；本课只使用单链。**作用：** `handle` 同时看值和异常。**场景：** 一个明确异步结果的转换。

**步骤：**
1. 用显式执行器 `supplyAsync`。
2. 用 `handle` 产生成功/失败文本。
3. `join` 失败捕获 `CompletionException`，`get` 捕获 `ExecutionException`。

```java
import java.util.concurrent.*;
public final class CompletableDemo {
    /** 观察并转换异步异常。 */
    public static void main(String[] args) {
        ExecutorService e = Executors.newSingleThreadExecutor();
        try { System.out.println(CompletableFuture.supplyAsync(() -> { throw new IllegalArgumentException(); }, e)
                .handle((v, x) -> x == null ? v : x.getCause().getClass().getSimpleName()).join()); }
        finally { e.shutdown(); }
    }
}
```
**结果：** 输出 `IllegalArgumentException`。**误区：** continuation 不保证调用线程；默认 common pool 不是业务隔离池。

### ConcurrentHashMap 每键原子更新
**是什么：** `compute`/`merge` 对单键原子更新。**作用：** 解决同 key 的读改写。**场景：** 每键状态独立，不能放 `null`。

**步骤：**
1. 创建 `ConcurrentHashMap`。
2. 用 `merge` 累加。
3. remapping 只返回新值，不回写同一 map。

```java
import java.util.concurrent.*;
public final class MapDemo {
    /** 运行单键原子计数。 */
    public static void main(String[] args) { ConcurrentHashMap<String, Integer> m = new ConcurrentHashMap<>();
        m.merge("java", 1, Integer::sum); m.merge("java", 1, Integer::sum); System.out.println(m.get("java")); }
}
```
**结果：** `2`。**误区：** bulk 操作不是全局快照，remapping 中回写同 map 有递归限制。

### BlockingQueue 四类操作
**是什么：** 入队/出队分别有抛异常、特殊值、阻塞、定时四类。**作用：** 把生产消费等待写进合同。**场景：** 生产速度与消费速度不同。

**步骤：**
1. 用 `add/offer/put/定时 offer` 选择入队。
2. 用 `remove/poll/take/定时 poll` 选择出队。
3. 不放入 `null`。

```java
import java.util.concurrent.*;
public final class QueueDemo {
    /** 观察出队和定时入队。 */
    public static void main(String[] args) throws Exception { BlockingQueue<String> q = new ArrayBlockingQueue<>(1);
        q.add("job"); System.out.println(q.poll()); System.out.println(q.offer("next", 10, TimeUnit.MILLISECONDS)); }
}
```
**结果：** `job`、`true`。**误区：** `add` 满时抛异常，`offer` 返回 `false`，`put` 可能等待；队列拒绝 `null`。

### AtomicInteger 原子计数
**是什么：** `AtomicInteger` 提供原子读改写。**作用：** 保护单数值计数。**场景：** 成功数、重试数等；多字段不变量仍需锁。

**步骤：**
1. 以零创建原子数。
2. 调用 `incrementAndGet`。
3. 用 `get` 读取并在测试间新建实例。

```java
import java.util.concurrent.atomic.AtomicInteger;
public final class AtomicDemo {
    /** 运行原子计数。 */
    public static void main(String[] args) { AtomicInteger n = new AtomicInteger(); System.out.println(n.incrementAndGet()); }
}
```
**结果：** `1`。**误区：** 原子数不能把多个字段变成一次事务。

### synchronized 与 ReentrantLock
**是什么：** `synchronized` 用监视器；`ReentrantLock` 提供显式、可中断和可定时获取。**作用：** 二者都建立互斥与可见性。**场景：** 需要 `tryLock` 时才选显式锁。

**步骤：**
1. 标出临界区。
2. `lock()` 后立即进入 `try`。
3. `finally` 第一条语句 `unlock()`。

```java
import java.util.concurrent.locks.ReentrantLock;
public final class LockDemo {
    private final ReentrantLock lock = new ReentrantLock(); private int value;
    /** 在锁内递增。 */
    void add() { lock.lock(); try { value++; } finally { lock.unlock(); } }
    /** 运行锁示例。 */
    public static void main(String[] args) { LockDemo d = new LockDemo(); d.add(); System.out.println(d.value); }
}
```
**结果：** `1`。**误区：** 公平性只是偏好，无参 `tryLock()` 可插队；不在 finally 解锁会死锁。

### ReadWriteLock 的读写边界
**是什么：** 无 writer 时读锁可并行，写锁独占。**作用：** 表达读写边界。**场景：** 读多写少且读不改状态；收益需测量。

**步骤：**
1. 读方法取 `readLock`。
2. 写方法取 `writeLock`。
3. 升级先释放读锁，再获取写锁并重新检查。

```java
import java.util.concurrent.locks.*;
public final class ReadWriteDemo {
    private final ReadWriteLock lock = new ReentrantReadWriteLock(); private String value = "old";
    /** 写入共享值。 */
    void replace(String next) { lock.writeLock().lock(); try { value = next; } finally { lock.writeLock().unlock(); } }
    /** 读取共享值。 */
    String read() { lock.readLock().lock(); try { return value; } finally { lock.readLock().unlock(); } }
    /** 运行示例。 */
    public static void main(String[] args) { ReadWriteDemo d = new ReadWriteDemo(); d.replace("new"); System.out.println(d.read()); }
}
```
**结果：** `new`。**误区：** 读锁升级不能猜；读写锁不自动保护跨对象不变量。

### 共享状态的所有权、初始化与测试复位
**是什么：** 所有权回答谁创建、修改、关闭和复位共享状态。**作用：** 防止静态可变值跨测试污染。**场景：** 缓存、计数器、执行器、连接池。

**步骤：**
1. 将状态和保护机制封装在一个实例。
2. 构造时初始化默认值。
3. 每个测试新建实例，结束时关闭资源。

```java
import java.util.concurrent.atomic.AtomicInteger;
public final class OwnedStateDemo {
    private final AtomicInteger count = new AtomicInteger();
    /** 增加当前实例计数。 */
    void add() { count.incrementAndGet(); }
    /** 运行隔离示例。 */
    public static void main(String[] args) { OwnedStateDemo a = new OwnedStateDemo(); a.add(); System.out.println(a.count.get()); }
}
```
**结果：** `1`，新实例从零开始。**误区：** 静态共享状态没有初始化/失效/复位合同就不能称为缓存设计。

### 虚拟线程不池化与资源限流
**是什么：** 虚拟线程适合大量等待，不是固定池成员。**作用：** 降低等待型任务的线程占用，但不增加连接或远端配额。**场景：** 阻塞 I/O 且客户端允许阻塞。

**步骤：**
1. 用 `newVirtualThreadPerTaskExecutor` 按任务创建。
2. 访问外部资源前 `Semaphore.acquire`。
3. 在 `finally` 释放许可。

```java
import java.util.concurrent.*;
public final class VirtualDemo {
    /** 在资源许可内执行任务。 */
    static void work(Semaphore s) throws InterruptedException { s.acquire(); try { System.out.println("resource"); } finally { s.release(); } }
    /** 运行虚拟线程示例。 */
    public static void main(String[] args) throws Exception { Semaphore s = new Semaphore(1); try (ExecutorService e = Executors.newVirtualThreadPerTaskExecutor()) { e.submit(() -> { try { work(s); } catch (InterruptedException x) { Thread.currentThread().interrupt(); } }).get(); } }
}
```
**结果：** `resource`。**误区：** JEP 444 追求规模而非单任务加速；Java 25 不能照搬 Java 21 的 synchronized 一律 pinning 结论，native/foreign 和类初始化仍有边界。

### Spring ThreadPoolTaskExecutor 托管边界
**是什么：** Spring 托管线程、队列和 Bean 生命周期。**作用：** 把容量与关闭责任集中到容器。**场景：** 已使用 Spring 且需要托管池；本课不进入 `@Async`、事件、调度、重试。

**步骤：**
1. 设置核心、最大线程和有界队列。
2. 配置拒绝和关闭等待。
3. 不在请求中创建或关闭 Bean。

```java
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
public class TaskExecutorConfig {
    /** 创建 Spring 托管的有界执行器。 */
    @Bean ThreadPoolTaskExecutor taskExecutor() { ThreadPoolTaskExecutor e = new ThreadPoolTaskExecutor();
        e.setCorePoolSize(2); e.setMaxPoolSize(4); e.setQueueCapacity(16); e.setWaitForTasksToCompleteOnShutdown(true); return e; }
}
```
**结果：** 容器启动初始化、关闭时等待。**误区：** 业务方法不能随意 `shutdown` 托管 Bean。

## 现代版本中的正确用法

Java 25 主线按四层建立边界：先用 happens-before 证明可见性，再用原子 API 或锁证明复合更新，接着用
有界执行器和队列证明资源上限，最后用 `Future` 或 `CompletableFuture` 证明结果已被观察。优先使用
显式拥有的执行器；只有等待型任务且外部客户端允许阻塞时，才选择虚拟线程。`synchronized` 在 Java 25
不能套用 Java 21 的一律 pinning 说法，但 native/foreign 调用与类初始化仍应缩小临界区并验证。

## 基本语法与核心接口

| 目标 | 核心接口/方法 | 关键合同 |
| --- | --- | --- |
| 提交任务 | `ExecutorService.submit(Callable)` | 返回 `Future`，异常由 `get` 观察 |
| 管理池 | `ThreadPoolExecutor` | 核心线程、队列、最大线程、拒绝策略按顺序生效 |
| 观察结果 | `Future.get`、`CompletableFuture.handle` | 区分成功、取消、超时和异常 |
| 单键更新 | `ConcurrentHashMap.compute/merge` | 单键原子，不是全局快照 |
| 生产消费 | `BlockingQueue.put/take` | 满时等待、空时等待，禁止 `null` |
| 单数值计数 | `AtomicInteger.incrementAndGet` | 原子单字段更新 |
| 互斥保护 | `synchronized`、`ReentrantLock` | 互斥和可见性；显式锁必须 `finally` 释放 |
| 读写分离 | `ReadWriteLock` | 读可并行，写独占；升级需重新检查 |
| 轻量执行 | `newVirtualThreadPerTaskExecutor` | 不池化线程，另行限制外部资源 |

一个最小线程池的构造顺序如下：`corePoolSize`、`maximumPoolSize`、空闲超时、工作队列、线程工厂、拒绝处理器。
当运行线程少于核心数时先建线程；达到核心数后先入队；队列满了才继续建线程直到最大数；最大数也满了才执行拒绝策略。

## 从零跟着做

1. 新建临时目录和 `ConcurrencyDemo.java`，只放本课一个 `main` 示例。
2. 先创建容量为 `1` 的 `ArrayBlockingQueue` 和核心数 `1`、最大数 `2` 的 `ThreadPoolExecutor`。
3. 提交一个 `Callable<Integer>`，保存返回的 `Future`，用 `get()` 打印结果或异常。
4. 把共享计数改成 `AtomicInteger`，把 map 更新改成 `merge`，并在每个锁路径加入 `finally`。
5. 在 `finally` 中调用 `shutdown`；Java 25 的所有者作用域可使用 `close()`，Java 8 则调用 `awaitTermination`。
6. 用一次失败任务确认 `ExecutionException.getCause()` 可观察，再用一次取消任务确认中断状态被保留。
7. 删除 `/tmp` 临时目录并检查路径不存在，仓库不留下 fixture 或测试文件。

## 如何使用

先写出资源图：谁创建执行器、谁向队列提交、谁消费、谁关闭。然后写状态图：哪些字段共享、每个字段由哪
个原子操作或锁保护。最后写结果图：每个提交点都保存句柄并决定何时 `get`、`join` 或 `handle`。这三张图
都能在代码审查中转化为问题，而不是依赖线程名或日志猜测。

## 适用与不适用场景

适合：有明确任务边界的批处理、有限并发的后台工作、单键缓存计数、生产者消费者交接和读多写少的内存快照。

不适合：用无界队列掩盖容量问题、用静态字段跨请求传递业务状态、用字符串池锁协调不同进程、用虚拟线程替代
数据库连接池、用复杂 `CompletableFuture` 链提前实现事件或重试编排。

:::tip
将“有界池 + 可观察拒绝 + 明确关闭”作为一个整体评审。队列容量、超时和拒绝策略应由业务延迟预算决定；没有
负载测量时，只说明待用 JFR/JMH 验证，不声称某个参数更快。
:::

## 当前项目补充

冻结 Phase 2 矩阵只证明项目出现这些能力，不证明现有写法正确：`ThreadPoolConfig`、`CameraServiceImpl` 和
`Pdf2ImageComparablePriorityTaskPoolExecutor` 对应执行器与任务提交（`JAVA-STDLIB-023`，`observed`）；
`AppAspect`、`Pdf2ImageComparablePriorityTaskPoolExecutor` 和 `ClientZzWsServer` 对应同步能力
（`JAVA-LANG-013`，`observed`）；`AppFrontYyzxWsServer`、`JzglConstant` 和 `LockStringUtil` 对应
并发容器、队列或锁（`JAVA-STDLIB-024`，`observed`）；`BlOperationWsServer`、`CodeGenerator` 和
`UniqueIDGeneratorUtil` 对应原子计数场景（`JAVA-STDLIB-025`，`observed`）。

矩阵把共享状态、锁、裸线程、测试复位和非原子复合操作分别标为 `corrected`，字符串池锁标为 `rejected`。
因此课程只给出纠正后的最小模式，不宣称当前代码必有缺陷，也不把 `AppAspect`、`FtjlServiceImpl` 或
`ClientZzWsServer` 的字符串锁用法作为推荐同步边界。

## Java 8 / Spring Boot 2.3 兼容写法

Java 8 没有 `ExecutorService.close()`、`Executors.newVirtualThreadPerTaskExecutor()` 以及 Future 的
即时结果方法。兼容写法仍使用 `ExecutorService`、`ThreadPoolExecutor`、`Future.get`、并发集合、原子类型和
锁，并显式关闭：

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public final class Java8ExecutorExample {
    /** 执行并关闭 Java 8 兼容执行器。 */
    public static void run() throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            executor.submit(new Runnable() {
                /** 执行一个兼容 Java 8 的任务。 */
                @Override
                public void run() {
                    System.out.println("java8");
                }
            }).get();
        } finally {
            executor.shutdown();
            if (!executor.awaitTermination(5, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        }
    }
}
```

Spring Boot 2.3 使用 Spring Framework 5.2.15 的 `ThreadPoolTaskExecutor` 属性配置，保留显式队列容量和
关闭等待。它是项目兼容线，不改变现代主线，也不引入 `@Async`。

## 新旧版本差异

| 对比项 | Java 25 / Spring 7.0.8 | Java 8 / Spring 5.2.15 | 迁移注意 |
| --- | --- | --- | --- |
| 执行器关闭 | `ExecutorService.close()` 可等待并关闭 | `shutdown` + `awaitTermination` | 不把 `close()` 写回 Java 8 |
| Future | 可用 `state`、`resultNow`、`exceptionNow` | 只用 `get`、`isDone`、`isCancelled` | 兼容线使用阻塞结果合同 |
| 虚拟线程 | `newVirtualThreadPerTaskExecutor` | 不存在 | 旧线继续使用有界平台线程池 |
| synchronized 解释 | 结合 JEP 491 说明剩余 pinning 边界 | 遵循 Java 8 monitor 合同 | 不把 Java 21 旧结论当 Java 25 结论 |
| Spring 托管池 | Framework 7.0.8 参考线 | Framework 5.2.15 / Boot 2.3.12 | 精确核对属性和关闭回调 |

## 易错点

:::pitfalls
### 错误：普通 flag 或 count 没有 happens-before

**触发条件：** 一个线程写普通字段，另一个线程无锁读取。

**原因：** 没有 volatile、锁、线程启动/连接或 Future 结果建立同步边。

**后果：** 读线程可能看到旧值，测试也会出现不稳定结果。

**错误示例：**

```java
// 错误：普通字段读写没有 hb。
boolean ready;
int count;
```

**正确写法：** 使用锁、volatile 单标志或原子计数，并让复合不变量归同一保护边界。

```java
volatile boolean ready;
```

**验证方式：** 用临时 Java 25 程序重复启动读写线程；以锁保护的版本每次都在 join 后观察到发布值。影响版本：Java 25 与 Java 8；来源依据：`jls25-memory-model`、`jls8-memory-model`。

### 错误：把 volatile n++ 当成原子计数

**触发条件：** 多个线程同时执行 `volatile int n; n++`。

**原因：** `n++` 是读、修改、写回的复合操作，volatile 只保证单次读写可见。

**后果：** 更新丢失，计数小于提交次数。

**错误示例：**

```java
// 错误：可见但不原子。
volatile int n;
/** 错误地把可见字段的读改写当成原子操作。 */
void add() { n++; }
```

**正确写法：** 使用 `AtomicInteger.incrementAndGet()` 或在锁内完成读改写。

```java
java.util.concurrent.atomic.AtomicInteger n = new java.util.concurrent.atomic.AtomicInteger();
n.incrementAndGet();
```

**验证方式：** 用固定任务数比较最终计数与任务数，正确版本必须相等。影响版本：Java 25 与 Java 8；来源依据：`jls25-memory-model`、`java25-atomic-integer`、`java8-atomic-integer`。

### 错误：submit 后只看日志不读取 Future

**触发条件：** `submit` 返回后立即认为任务成功。

**原因：** `submit` 把异常保存到 Future，worker 线程未必打印堆栈。

**后果：** 失败任务被静默吞掉，调用方继续使用不存在的结果。

**错误示例：**

```java
// 错误：没有读取 Future。
executor.submit(() -> { throw new IllegalStateException(); });
```

**正确写法：** 保存 Future 并调用 `get()`，处理 `ExecutionException` 的 cause、取消、超时和中断。

```java
java.util.concurrent.Future<?> future = executor.submit(() -> runWork());
future.get();
```

**验证方式：** 让任务抛异常，断言 `get()` 抛 `ExecutionException` 且 cause 类型正确。影响版本：Java 25 与 Java 8；来源依据：`java25-thread-pool-executor`、`java8-thread-pool-executor`、`java25-future`、`java8-future`。

### 错误：把 Future.isDone 当成成功

**触发条件：** `isDone()` 为 true 后直接读取业务结果。

**原因：** done 同时包括正常结束、异常结束和取消。

**后果：** 失败状态被误报为成功。

**错误示例：**

```java
// 错误：done 不等于 success。
if (future.isDone()) {
    System.out.println("success");
}
```

**正确写法：** 通过 `get()` 或 Java 25 的明确状态/即时结果 API 区分结果状态。

```java
if (!future.isCancelled()) {
    future.get();
}
```

**验证方式：** 分别提交成功、失败和取消任务，验证三种状态输出不同。影响版本：Java 25 与 Java 8；`state`、`resultNow`、`exceptionNow` 只适用于 Java 25；来源依据：`java25-future`、`java8-future`。

### 错误：混淆 join 与 get 的异常包装

**触发条件：** 用同一种 catch 处理 `CompletableFuture.join()` 和 `get()`。

**原因：** `join` 抛 `CompletionException`，`get` 抛受检的 `ExecutionException`。

**后果：** 异常处理分支无法编译或丢失原始 cause。

**错误示例：**

```java
// 错误：join 不抛 ExecutionException。
try { future.join(); } catch (java.util.concurrent.ExecutionException ignored) { }
```

**正确写法：** 按调用 API 捕获包装类型，再检查 `getCause()`。

```java
try {
    future.get();
} catch (java.util.concurrent.ExecutionException failure) {
    failure.getCause();
}
```

**验证方式：** 让阶段失败，分别观察 `CompletionException` 与 `ExecutionException` 的类型。影响版本：Java 25 与 Java 8；来源依据：`java25-completable-future`、`java8-completable-future`。

### 错误：把默认 continuation 当业务隔离执行器

**触发条件：** 使用 `thenApplyAsync` 却没有显式传执行器。

**原因：** 默认执行策略可能使用公共池；非 async 阶段也不保证永远在调用线程。

**后果：** 业务任务争用公共资源，延迟和关闭责任不可审查。

**错误示例：**

```java
// 错误：没有业务执行器边界。
future.thenApplyAsync(this::transform);
```

**正确写法：** 传入拥有明确生命周期的 `Executor`，并在结果末端观察失败。

```java
future.thenApplyAsync(this::transform, businessExecutor);
```

**验证方式：** 记录线程名和执行器关闭过程，确认任务只运行在约定资源边界内。影响版本：Java 25 与 Java 8；来源依据：`java25-completable-future`、`java8-completable-future`。

### 错误：无界队列使 maximumPoolSize 失效

**触发条件：** 使用 `LinkedBlockingQueue` 默认无界容量，同时把最大线程数设得很大。

**原因：** 达到核心线程后任务优先入队，队列未满就不会创建超过核心数的线程。

**后果：** 队列持续增长，延迟和内存压力被隐藏。

**错误示例：**

```java
// 错误：最大线程数没有预期扩容机会。
new java.util.concurrent.ThreadPoolExecutor(2, 20, 1, java.util.concurrent.TimeUnit.SECONDS,
        new java.util.concurrent.LinkedBlockingQueue<>());
```

**正确写法：** 使用有界队列并明确拒绝/等待策略，按负载验证容量。

```java
new java.util.concurrent.ThreadPoolExecutor(2, 4, 1, java.util.concurrent.TimeUnit.SECONDS,
        new java.util.concurrent.ArrayBlockingQueue<>(16));
```

**验证方式：** 提交阻塞任务并观察 pool size、queue size 和拒绝数量，而不是只看配置值。影响版本：Java 25 与 Java 8；来源依据：`java25-thread-pool-executor`、`java8-thread-pool-executor`、`java25-blocking-queue`、`java8-blocking-queue`。

### 错误：把 shutdownNow 当强制杀线程

**触发条件：** 调用 `shutdownNow()` 后立即假设任务停止且资源已释放。

**原因：** API 只尽力中断正在运行的任务并返回未开始任务；任务可能忽略中断。

**后果：** 文件、连接或锁仍被占用，进程退出顺序不确定。

**错误示例：**

```java
// 错误：没有协作中断和终止确认。
executor.shutdownNow();
```

**正确写法：** 任务捕获 `InterruptedException` 后恢复中断状态并退出；随后用 `awaitTermination` 确认。

```java
try {
    awaitWork();
} catch (InterruptedException interrupted) {
    Thread.currentThread().interrupt();
}
executor.shutdown();
executor.awaitTermination(5, java.util.concurrent.TimeUnit.SECONDS);
```

**验证方式：** 提交可中断任务，记录中断标志、清理动作和 `isTerminated()`。影响版本：Java 25 与 Java 8；来源依据：`java25-executor-service`、`java8-executor-service`。

### 错误：把 ConcurrentHashMap bulk 当全局快照或回写同一 map

**触发条件：** bulk `forEach/reduce` 期间要求所有键来自同一时刻，或在 `compute` remapping 中再次 `put`。

**原因：** bulk 操作允许并发变化，不承诺整体快照；remapping 函数有递归更新限制。

**后果：** 统计结果混合时刻，或更新递归、抛出异常。

**错误示例：**

```java
// 错误：remapping 函数回写同一 map。
map.compute("a", (key, old) -> { map.put("b", 1); return 2; });
```

**正确写法：** remapping 只返回该键新值；需要同一时刻的全局快照时，先停写或用外部同步保护复制过程，
也可把完整状态建模为带版本的不可变聚合并原子替换引用。单纯复制弱一致遍历结果仍不是全局快照。

```java
map.compute("a", (key, old) -> old == null ? 1 : old + 1);
```

**验证方式：** 并发更新期间分别检查每键结果和快照生成时刻，不把 bulk 输出当事务读。影响版本：Java 25 与 Java 8；来源依据：`java25-concurrent-hash-map`、`java8-concurrent-hash-map`。

### 错误：忘记 finally 解锁、误判公平 tryLock 或池化虚拟线程

**触发条件：** 异常路径直接返回、用公平锁无参 `tryLock` 推断严格排队，或把虚拟线程放进固定池。

**原因：** 显式锁释放是调用方责任；无参 `tryLock` 可忽略公平；虚拟线程的资源不是线程数。

**后果：** 死锁、插队、吞吐/延迟判断失真，外部连接仍被耗尽。

**错误示例：**

```java
// 错误：没有 finally，也没有外部资源许可。
lock.lock();
doWork();
lock.unlock();
```

**正确写法：** 获取后立即进入 `try/finally`；虚拟线程按任务创建，用 `Semaphore` 或连接池限制资源。

```java
lock.lock();
try {
    doWork();
} finally {
    lock.unlock();
}
```

**验证方式：** 注入异常确认锁仍可再次获取；记录许可数和连接池占用，检查没有超出外部上限。影响版本：Java 25 与 Java 8；虚拟线程仅适用于 Java 25；来源依据：`java25-reentrant-lock`、`java8-reentrant-lock`、`java25-virtual-threads`、`jep-444-virtual-threads`、`jep-491-synchronized-virtual-threads`。
:::

## 安全与性能边界

共享状态的安全边界是进程内的：字符串池锁只协调同一 JVM，不能保护跨进程或跨实例的数据；它还可能把
无关调用者意外绑在同一对象生命周期上。敏感数据不应放入共享日志或任务名称，取消和关闭路径必须释放连接、
许可、文件句柄和锁。这里没有 JMH/JFR 的固定硬件、负载和结果，因此不宣称任何池大小、锁类型或虚拟线程
“更快”。需要判断时，先用 JFR/JMC 定位阻塞和分配，再用包含 JDK、硬件、队列容量、任务比例和预热参数的
JMH 基准验证；结果只适用于记录的负载。

## 如何验证

1. 在 `/tmp` 用 `mktemp -d` 创建临时目录，写入一个只包含本课核心 API 的 Java 25 文件。
2. 编译并运行可见性、Future 异常、单键 `merge`、队列超时、锁释放和虚拟线程限流六个最小行为。
3. 将失败任务的 cause、拒绝异常、队列超时、最终计数和资源许可数写入标准输出。
4. 使用同一临时源在 Java 8 兼容分支改成 `shutdown` + `awaitTermination`，不调用 Java 25 独有 API。
5. Java 25 和 Java 8 各连续运行两次；任一结果不稳定就回到对应状态边界，而不是放宽断言。
6. 删除临时目录并检查该路径不存在；验证资产不写回仓库。

## 练习

:::exercise
### 练习：为批量计数服务画出并发边界

**要求：** 创建一个核心线程数为 `1`、最大线程数为 `2`、队列容量为 `2` 的有界池；提交五个任务，使用
`AtomicInteger` 记录成功数，使用 `ConcurrentHashMap.merge` 按业务键计数，并通过 `Future.get()` 观察失败。

**验收：** 输出必须包含成功任务数、至少一个明确的拒绝或超时结果、每个业务键的最终计数，以及已关闭的执行器状态；
异常路径不能留下锁或信号量许可。

**参考答案：** 先写所有权和关闭顺序，再实现单键原子更新；不要用 volatile `++`、无界队列或字符串池锁。
:::

## 本节小结

- happens-before 解决可见性；volatile 不能把 `n++` 变成原子操作。
- 执行器要有所有者、有界容量、可观察拒绝和明确关闭；`shutdownNow` 只是 best effort。
- `Future.get`、`CompletableFuture.handle` 才能把任务失败纳入结果合同。
- `ConcurrentHashMap` 的原子性按键，`BlockingQueue` 的四类操作按等待策略，`AtomicInteger` 只保护单数值。
- 显式锁必须在 `finally` 释放，读写锁升级要重新检查，字符串池锁不属于推荐边界。
- 虚拟线程不池化；用 `Semaphore` 或连接池限制外部资源，Spring 执行器只映射托管生命周期。
