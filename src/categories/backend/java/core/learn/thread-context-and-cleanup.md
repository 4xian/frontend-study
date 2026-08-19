---
id: backend.java.learn.advanced.thread-context-and-cleanup
type: lesson
title: ThreadLocal、请求上下文传播与清理
summary: 为线程本地状态、请求上下文和异步任务建立显式传播、恢复与清理边界
domain: backend
technology: java
module: core
stage: advanced
level: advanced
estimatedMinutes: 210
objectives:
  - 能解释 ThreadLocal 是线程副本而不是任务副本，并在复用线程池中用 finally 恢复或清理。
  - 能区分 InheritableThreadLocal、请求上下文、显式参数和任务装饰器的传播边界。
  - 能用 ScopedValue 表达 Java 25 的有界只读上下文，并说明它不替代任意执行器的自动传播。
  - 能设计异步任务的上下文快照、恢复、异常观察和关闭顺序。
  - 能为 Java 8 / Spring Framework 5.2.15 写不依赖 Java 25 API 的兼容实现。
prerequisites:
  - backend.java.learn.intermediate.spring-mvc-and-servlet-boundaries
  - backend.java.learn.advanced.concurrency-locks-and-shared-state
related: []
tags:
  - ThreadLocal
  - InheritableThreadLocal
  - ScopedValue
  - RequestContextHolder
  - TaskDecorator
  - ContextPropagatingTaskDecorator
  - 线程池复用
  - 请求上下文
  - finally 清理
  - 异步任务
  - 生命周期
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
  - id: java25-thread-local
    title: Java SE 25 ThreadLocal API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ThreadLocal.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - 每个线程拥有独立副本，get 会按需初始化
      - remove 删除当前线程副本，下一次 get 可重新初始化
  - id: java8-thread-local
    title: Java SE 8 ThreadLocal API
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/ThreadLocal.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 保留独立副本、set、get 和 remove 的基本合同
  - id: java25-inheritable-thread-local
    title: Java SE 25 InheritableThreadLocal API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/InheritableThreadLocal.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - 值在创建子线程时通过 childValue 复制
      - Java 25 线程构建器可以选择不继承 inheritable thread-local
  - id: java8-inheritable-thread-local
    title: Java SE 8 InheritableThreadLocal API
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/InheritableThreadLocal.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - 默认 childValue 返回父值引用
      - 继承发生在创建子线程时，不是提交线程池任务时
  - id: java25-scoped-value
    title: Java SE 25 ScopedValue API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ScopedValue.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - where、run 和 call 形成动态作用域并自动解除绑定
      - 与结构化并发结合时子任务可以继承绑定
  - id: jep-506-scoped-values
    title: JEP 506 Scoped Values
    url: https://openjdk.org/jeps/506
    sourceType: release-note
    appliesTo: JDK 25
    claims:
      - Scoped Values 在 JDK 25 Closed/Delivered
      - 它提供有界、只写一次的上下文，不承诺任意 Executor 自动传播
  - id: java25-executor-service
    title: Java SE 25 ExecutorService API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ExecutorService.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - 提交前动作 happens-before 任务动作，任务动作 happens-before Future.get 后动作
      - close 会按序关闭并等待终止，shutdownNow 只是 best effort
  - id: java8-executor-service
    title: Java SE 8 ExecutorService API
    url: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ExecutorService.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 使用 shutdown、shutdownNow 和 awaitTermination
      - Java 8 没有 ExecutorService.close
  - id: java25-thread-pool-executor
    title: Java SE 25 ThreadPoolExecutor API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - beforeExecute 可重新初始化 ThreadLocal，afterExecute 在任务完成后运行
      - submit 包装的 FutureTask 会保存异常，需要读取 Future
  - id: java8-thread-pool-executor
    title: Java SE 8 ThreadPoolExecutor API
    url: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ThreadPoolExecutor.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 线程池 worker 也会复用，beforeExecute 和 afterExecute 不能替代任务级清理
  - id: spring7-request-context-holder
    title: Spring Framework 7.0.8 RequestContextHolder Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/context/request/RequestContextHolder.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - 请求属性绑定到当前线程，未绑定时 get 可返回 null
      - resetRequestAttributes 清理当前线程，inheritable 选项需要显式开启
  - id: spring5-request-context-holder
    title: Spring Framework 5.2.15 RequestContextHolder Javadoc
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/context/request/RequestContextHolder.html
    sourceType: official-reference
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 旧线同样提供 set、get、current、reset 和 inheritable 选项
  - id: spring7-request-context-filter
    title: Spring Framework 7.0.8 RequestContextFilter Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/filter/RequestContextFilter.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - threadContextInheritable 默认关闭
      - 官方警告不要把继承打开给可复用线程池 worker
  - id: spring5-request-context-filter
    title: Spring Framework 5.2.15 RequestContextFilter Javadoc
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/filter/RequestContextFilter.html
    sourceType: official-reference
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 旧线默认也不向子线程继承请求上下文
      - 异步 dispatch 与线程池复用仍需单独清理
  - id: spring7-task-decorator
    title: Spring Framework 7.0.8 TaskDecorator Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/core/task/TaskDecorator.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - decorate 包裹实际执行 callback，可在前后设置和恢复上下文
      - Future wrapper 的异常仍需通过 Future 观察
  - id: spring5-task-decorator
    title: Spring Framework 5.2.15 TaskDecorator Javadoc
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/core/task/TaskDecorator.html
    sourceType: official-reference
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 旧线可以使用自定义 decorator 做显式捕获、设置、恢复和清理
  - id: spring7-context-propagating-task-decorator
    title: Spring Framework 7.0.8 ContextPropagatingTaskDecorator Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/core/task/support/ContextPropagatingTaskDecorator.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - 通过 Micrometer ContextSnapshotFactory 恢复日志或 observation context
      - 只在线程切换时有意义，并有额外开销
  - id: spring7-task-execution-reference
    title: Spring Framework 7.0.8 Task Execution and Scheduling
    url: https://docs.spring.io/spring-framework/reference/integration/scheduling.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - TaskExecutor 和 ThreadPoolTaskExecutor 可以配置 TaskDecorator
      - 托管执行器的线程、队列和关闭由容器负责
  - id: spring5-task-execution-reference
    title: Spring Framework 5.2.15 Task Execution and Scheduling
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/integration.html#scheduling
    sourceType: official-reference
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 旧线可配置 TaskExecutor 和线程池队列
      - 上下文传播需显式 decorator 或参数传递
projectEvidence:
  - file: dzzz-app/src/main/java/com/tdh/bdzz/context/TableShardContext.java
    symbol: com.tdh.bdzz.context.TableShardContext
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/service/tsaiassistant/TsAiTraceContextHolder.java
    symbol: com.tdh.bdzz.service.tsaiassistant.TsAiTraceContextHolder
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/Pdf2ImageComparablePriorityTaskPoolExecutor.java
    symbol: com.tdh.bdzz.config.Pdf2ImageComparablePriorityTaskPoolExecutor
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/context/WebAppContext.java
    symbol: com.tdh.bdzz.context.WebAppContext
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/shard/AjbsShardStrategy.java
    symbol: com.tdh.bdzz.shard.AjbsShardStrategy
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/aop/DzzzAspect.java
    symbol: com.tdh.bdzz.aop.DzzzAspect
    usage: observed
---

# ThreadLocal、请求上下文传播与清理

## 为什么需要学习

请求线程里能读到的用户、租户、trace 或分表信息，到了异步任务里不一定存在。更危险的是，线程池 worker
会执行多个请求的任务：一个任务留下的 `ThreadLocal` 值可能被下一个任务看到。可靠的方案不是“把值放进
一个静态 holder”，而是明确谁捕获、谁恢复、谁清理、谁拥有线程池，以及异常和关闭如何完成。

## 学习目标

- 能区分线程隔离与任务隔离，并证明线程池复用为何要求任务级清理。
- 能选择显式参数、`ThreadLocal`、`InheritableThreadLocal`、Spring `TaskDecorator` 或 Java 25 `ScopedValue`。
- 能在请求线程和异步线程之间只传播最小、不可变、可审计的业务上下文。
- 能在 Java 25 与 Java 8 之间保持同一清理责任，不把新 API 写回旧线。
- 能用临时程序验证串租户、无请求异步、异常恢复和关闭等待。

## 前置术语

线程是执行单元，任务是提交给执行器的工作，worker 是执行多个任务的线程。上下文是任务完成工作所需的
最小信息，例如租户 ID、用户 ID 或 trace ID；请求对象、数据库连接和安全凭据不应默认当作可跨线程上下文。
快照是提交时捕获的不可变值集合，恢复是 worker 开始时把快照放入当前执行边界，清理是任务结束时恢复
worker 原值或删除副本。

## 零基础知识点详解

每个知识点按“是什么、作用、场景、步骤、最小示例、结果、误区”展开。代码只演示当前合同，并在每个方法上方
保留简洁中文注释。

### 显式参数是最清晰的传播方式

**是什么：** 显式参数把上下文作为不可变值传给被调用方。**作用：** 让依赖出现在方法签名中，便于测试和审查。**场景：**
服务调用、消息任务和跨进程边界。

**步骤：** 定义只读上下文；提交任务时捕获；任务方法只接收所需字段；不要传递请求对象。

```java
public record TaskContext(String tenantId, String traceId) {
}

public final class ExplicitContext {
    /** 使用显式上下文执行查询。 */
    static String query(TaskContext context, String key) {
        return context.tenantId() + ":" + context.traceId() + ":" + key;
    }
}
```

**结果：** 调用者可以为每个任务构造独立快照。**误区：** 为了少写一个参数而引入全局 holder，会把上下文所有权隐藏起来。

### ThreadLocal 是线程副本

**是什么：** `ThreadLocal<T>` 为每个线程保存独立副本；`get()` 可触发 `initialValue()`，`set()` 只影响当前线程。
**作用：** 在同步调用链中隐藏稳定的线程范围状态。**场景：** 适配旧 API 时保存当前 trace ID。

**步骤：** 创建 holder；主线程设置值；新线程读取自己的初始值；最后清理主线程副本。

```java
public final class ThreadLocalBasics {
    // 初始化未绑定时的默认 trace。
    private static final ThreadLocal<String> TRACE = ThreadLocal.withInitial(() -> "none");

    /** 返回当前线程的 trace 值。 */
    static String currentTrace() {
        return TRACE.get();
    }

    /** 运行线程隔离示例。 */
    public static void main(String[] args) throws Exception {
        TRACE.set("request-1");
        // 在子线程读取自己的 trace 副本。
        Thread child = new Thread(() -> System.out.println("child=" + currentTrace()));
        child.start();
        child.join();
        System.out.println("owner=" + currentTrace());
        TRACE.remove();
    }
}
```

**结果：** 子线程看到自己的初始值 `none`，不会自动看到主线程的 `request-1`。**误区：** 线程副本不是任务副本；
若线程被复用，副本会跨任务存在。

### 线程池 worker 复用会放大污染

**是什么：** `ThreadPoolExecutor` 的 worker 可以连续执行多个任务。**作用：** 说明为什么只在请求开始 `set` 而不清理
会串租户。**场景：** 一个固定线程处理多个 HTTP 请求的后台工作。

**步骤：** 建一个单 worker；第一个任务设置租户但故意不清理；等待它结束；第二个任务读取同一个 worker 的当前值。

:::compare{before="未清理的完整 fixture" after="第二个任务的实际输出"}
### 未清理的完整 fixture

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class WorkerContamination {
    private static final ThreadLocal<String> TENANT = new ThreadLocal<>();

    /** 运行两个串行任务并显示 worker 残留。 */
    public static void main(String[] args) throws Exception {
        ExecutorService executor = Executors.newSingleThreadExecutor();
        try {
            // 第一个 callback 故意留下租户值，用于复现污染。
            executor.submit(() -> TENANT.set("tenant-a")).get();
            // 第二个 callback 读取同一个 worker 上残留的租户值。
            String leaked = executor.submit(() -> TENANT.get()).get();
            System.out.println("leaked=" + leaked);
        } finally {
            executor.shutdown();
        }
    }
}
```

### 第二个任务的实际输出

```text
leaked=tenant-a
```
:::

**结果：** 第二个任务输出 `leaked=tenant-a`，证明线程隔离没有提供任务隔离。**误区：** 请求结束或执行器关闭
不会替某个仍被复用的 worker 建立任务级清理；恢复动作必须包住每次任务调用。

### finally 保存、恢复与 remove

**是什么：** `remove()` 删除当前线程的副本；没有旧值时，下一次 `get()` 可以重新初始化。**作用：** 把清理责任
绑定到任务边界。**场景：** 修复前一个 fixture 暴露的 worker 污染，并支持嵌套调用。

**步骤：** 进入任务前保存旧值；设置任务值；调用工作；无论成功失败都在 `finally` 恢复旧值或 `remove()`。

```java
public final class ContextScope {
    private static final ThreadLocal<String> TENANT = new ThreadLocal<>();

    /** 在当前线程执行一个带租户上下文的任务。 */
    static void runWithTenant(String tenant, Runnable work) {
        String previous = TENANT.get();
        TENANT.set(tenant);
        try {
            work.run();
        } finally {
            if (previous == null) TENANT.remove();
            else TENANT.set(previous);
        }
    }

    /** 返回当前租户或空值。 */
    static String currentTenant() {
        return TENANT.get();
    }
}
```

**结果：** 嵌套调用结束后外层值保持，最外层没有旧值时 worker 回到未绑定状态。**误区：** 无条件 `set(null)` 不是
可靠清理；它会让“未绑定”和“绑定了 null”难以区分。

### InheritableThreadLocal 只在创建子线程时复制

**是什么：** `InheritableThreadLocal` 在子线程创建时调用 `childValue`，默认复制父值引用。**作用：** 适用于短命、
明确创建的子线程。**场景：** 不适用于已经存在的线程池 worker。

**步骤：** 绑定父值；创建子线程并读取；在线程创建后修改父值；观察子线程仍使用创建时的副本。

```java
public final class InheritanceBoundary {
    private static final InheritableThreadLocal<String> TRACE = new InheritableThreadLocal<>();

    /** 运行创建时继承示例。 */
    public static void main(String[] args) throws Exception {
        TRACE.set("created-value");
        // 子线程读取创建时复制的值。
        Thread child = new Thread(() -> System.out.println(TRACE.get()));
        TRACE.set("changed-after-create");
        child.start();
        child.join();
        TRACE.remove();
    }
}
```

**结果：** 输出 `created-value`。**误区：** 任务提交不是子线程创建；Spring 官方也警告不要向可复用线程池打开继承。

### RequestContextHolder 不是通用业务上下文

**是什么：** Spring `RequestContextHolder` 将 `RequestAttributes` 绑定到当前线程；未绑定时 `getRequestAttributes()`
可返回 `null`。**作用：** 读取当前 Servlet 请求边界。**场景：** Controller 或同步调用链需要读取请求属性。

**步骤：** 在请求线程读取 holder；异步任务把“最小业务值”显式传入；异步任务不假定存在 HTTP 请求。

```java
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

public final class RequestBoundary {
    /** 返回当前请求属性，未绑定时返回空值。 */
    static RequestAttributes currentRequest() {
        return RequestContextHolder.getRequestAttributes();
    }

    /** 只把租户 ID 传入异步任务。 */
    static Runnable asyncWork(String tenantId) {
        // callback 只捕获显式租户 ID。
        return () -> System.out.println("tenant=" + tenantId);
    }
}
```

**结果：** 异步任务即使没有请求对象也能完成自己的业务工作。**误区：** 把 `HttpServletRequest` 或凭据对象塞进
通用线程池会扩大生命周期和泄露风险。

### RequestContextFilter 的继承开关默认关闭

**是什么：** `RequestContextFilter` 默认 `threadContextInheritable=false`，异步 dispatch 时会重新设置请求上下文。
**作用：** 让请求线程边界保持可预测。**场景：** 只有请求期间创建的短命子线程才有理由评估继承。

**步骤：** 保持默认关闭；如果确需继承，先证明子线程不会进入复用池；请求结束仍执行清理。

```java
import org.springframework.web.filter.RequestContextFilter;

public final class RequestFilterConfig {
    /** 创建保持默认非继承语义的请求过滤器。 */
    static RequestContextFilter create() {
        return new RequestContextFilter();
    }
}
```

**结果：** 普通线程池 worker 不会因请求 filter 自动得到旧请求属性。**误区：** 把 `setThreadContextInheritable(true)`
当作跨请求传播方案会把父请求暴露给复用线程。

### 捕获、设置、恢复的任务装饰器

**是什么：** 装饰器在提交线程捕获快照，在 worker 设置快照，结束时恢复 worker 原值。**作用：** 把传播策略集中到
一个执行边界。**场景：** 现有接口只能接收 `Runnable`，又需要保留少量 ThreadLocal 值。

**步骤：** 提交时读取快照；包装 callback；在 `finally` 中恢复；异常继续向执行器传播。

```java
public final class ContextDecorator {
    private static final ThreadLocal<String> TRACE = new ThreadLocal<>();

    /** 返回捕获当前 trace 的任务包装器。 */
    static Runnable decorate(Runnable task) {
        String captured = TRACE.get();
        // callback 在 worker 内恢复快照并最终还原原值。
        return () -> {
            String previous = TRACE.get();
            if (captured == null) TRACE.remove();
            else TRACE.set(captured);
            try {
                task.run();
            } finally {
                if (previous == null) TRACE.remove();
                else TRACE.set(previous);
            }
        };
    }
}
```

**结果：** 同一个 worker 连续执行任务时，每个任务看到自己的 trace，结束后不污染下一个任务。**误区：** 只 `set`
不恢复会覆盖 worker 原值；只恢复不处理 `null` 会留下伪绑定。

### Spring TaskDecorator 包裹实际 callback

**是什么：** Spring `TaskDecorator.decorate` 接收实际执行的 callback，不一定是用户最初提交的 `Runnable`。**作用：**
集中放置上下文恢复与清理。**场景：** `ThreadPoolTaskExecutor` 管理的后台任务。

**步骤：** 注入装饰器；配置托管执行器；在装饰器前后做设置/恢复；对 `Future` 任务仍读取结果。

```java
import org.springframework.core.task.TaskDecorator;

public final class TraceTaskDecorator implements TaskDecorator {
    private static final ThreadLocal<String> TRACE = new ThreadLocal<>();

    /** 包装实际 callback 并恢复 worker 原值。 */
    @Override
    public Runnable decorate(Runnable task) {
        String captured = TRACE.get();
        // callback 在 Spring 执行器内恢复快照并最终还原原值。
        return () -> {
            String previous = TRACE.get();
            if (captured == null) TRACE.remove();
            else TRACE.set(captured);
            try {
                task.run();
            } finally {
                if (previous == null) TRACE.remove();
                else TRACE.set(previous);
            }
        };
    }
}
```

**结果：** 传播责任在一个可测试组件中，任务异常仍由调用方的 `Future` 或执行器合同观察。**误区：** decorator 不是
异常收集器，也不会自动知道哪些自定义 ThreadLocal 应该传播。

### ContextPropagatingTaskDecorator 的范围

**是什么：** Spring 7 的 `ContextPropagatingTaskDecorator` 使用 Micrometer `ContextSnapshotFactory` 恢复日志或
observation context。**作用：** 处理框架已注册的上下文类型。**场景：** 已明确引入 Micrometer context propagation 的
Spring 7 应用。

**步骤：** 确认上下文注册表；只在线程切换时启用；测量额外开销；业务租户值仍使用显式参数或自定义策略。

```java
import org.springframework.core.task.TaskDecorator;
import org.springframework.core.task.support.ContextPropagatingTaskDecorator;

public final class SpringContextChoice {
    /** 返回 Spring 7 的框架上下文装饰器。 */
    static TaskDecorator create() {
        return new ContextPropagatingTaskDecorator();
    }
}
```

**结果：** 框架上下文可以随任务切换恢复。**误区：** 不能把该类当成 Spring 5.2.15 的内置 API，也不能假设它会传播
所有自定义 `ThreadLocal`。

### ScopedValue 的动态作用域

**是什么：** Java 25 `ScopedValue.where(key, value).run/call` 在动态作用域内绑定只读值，作用域返回后自动恢复。
**作用：** 用结构化边界表达调用链上下文。**场景：** Java 25 主线中的不可变请求标识或权限快照。

**步骤：** 定义静态 key；在 `where` 作用域中运行；只读访问；不要在任意 executor 中假设自动传播。

```java
public final class ScopedValueDemo {
    private static final ScopedValue<String> TENANT = ScopedValue.newInstance();

    /** 读取当前作用域的租户。 */
    static String currentTenant() {
        return TENANT.get();
    }

    /** 在有界作用域内执行工作。 */
    public static void main(String[] args) {
        // 在作用域内打印当前租户。
        ScopedValue.where(TENANT, "tenant-a").run(() -> System.out.println(currentTenant()));
        System.out.println(TENANT.isBound());
    }
}
```

**结果：** 作用域内输出租户，作用域外 `isBound()` 为 `false`。**误区：** 它不是可变上下文，也不是任意消息系统或
第三方执行器的自动传播协议。

### ScopedValue 不会自动传播到普通 Executor

**是什么：** `ScopedValue` 的绑定受动态作用域限制；普通 `ExecutorService` 任务不会因为提交发生在绑定作用域内就自动继承。
**作用：** 强制异步边界选择显式参数或任务装饰器。**场景：** 需要把请求快照提交给普通线程池时。

**步骤：** 先预热单 worker；在 `where` 作用域中提交读取任务；观察 worker 没有绑定，再用显式值完成任务。

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class ScopedValueExecutorBoundary {
    private static final ScopedValue<String> TRACE = ScopedValue.newInstance();

    /** 验证普通执行器不会自动继承 ScopedValue。 */
    public static void main(String[] args) throws Exception {
        try (ExecutorService executor = Executors.newSingleThreadExecutor()) {
            // 预热 worker，固定普通执行器的线程边界。
            executor.submit(() -> null).get();
            // 在绑定作用域中检查普通 worker 是否自动继承。
            boolean workerBound = ScopedValue.where(TRACE, "trace-1")
                .call(() -> executor.submit(TRACE::isBound).get());
            System.out.println("workerBound=" + workerBound);
        }
    }
}
```

**结果：** 输出 `workerBound=false`；作用域外的绑定仍会自动解除。**误区：** 这不否定结构化子任务的继承合同，但本课稳定主线
不引入 Java 25 的预览结构化并发 API，也不能把该语义扩展到普通 `ExecutorService.submit`。

### 异步线程不应假定存在 HTTP 请求

**是什么：** 请求上下文只在绑定它的线程有效；后台任务可能由定时器、消息或重试触发。**作用：** 让异步代码的输入
完整且可测试。**场景：** 图片处理、消息消费和批量刷新。

**步骤：** 把任务输入建模为值对象；在请求边界完成校验；异步方法只接收值对象；需要回调请求时显式建新协议。

```java
public record ImageJob(String tenantId, String objectKey, String traceId) {
}

public final class AsyncBoundary {
    /** 处理不依赖 Servlet 请求对象的图片任务。 */
    static String process(ImageJob job) {
        return job.tenantId() + ":" + job.objectKey() + ":" + job.traceId();
    }
}
```

**结果：** 同一任务可在线程池、消息消费者或测试线程执行。**误区：** 在异步线程调用 `currentRequestAttributes()` 并
把异常当成偶发问题，说明边界设计缺失。

### beforeExecute、afterExecute 与 Future 异常

**是什么：** `ThreadPoolExecutor` 的 hook 可做 worker 级初始化和观测，但 `submit` 返回的 `FutureTask` 会保存异常。
**作用：** hook 适合记录指标和兜底初始化，不能替代任务级恢复。**场景：** 自定义执行器需要统一记录任务完成。

**步骤：** 在 `beforeExecute` 观察线程；在任务中设置和清理上下文；在调用方读取 `Future.get()`；不要只看 hook 的参数。

```java
import java.util.concurrent.Future;
import java.util.concurrent.ThreadPoolExecutor;

public final class HookBoundary {
    /** 读取失败任务的真实 cause。 */
    static Throwable failure(Future<?> future) throws Exception {
        try {
            future.get();
            return null;
        } catch (java.util.concurrent.ExecutionException failure) {
            return failure.getCause();
        }
    }
}
```

**结果：** 异常被纳入结果合同，清理仍在任务 `finally` 内完成。**误区：** `afterExecute` 看到的 `Throwable` 不能保证包含
`submit` 任务的计算异常。

### 执行器所有权与关闭

**是什么：** 创建执行器的一方负责关闭；Java 25 可用 `close()`，Java 8 使用 `shutdown`、`awaitTermination` 和必要时
`shutdownNow`。**作用：** 让上下文清理和线程生命周期都有明确终点。**场景：** 独立组件或应用容器的后台执行器。

**步骤：** 明确是自有执行器还是 Spring 托管 Bean；自有执行器在所有者作用域关闭；托管 Bean 不由业务方法关闭；关闭后
等待终止并记录未完成任务。

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public final class ExecutorOwnership {
    /** 使用 Java 8 兼容合同关闭自有执行器。 */
    static void close(ExecutorService executor) throws InterruptedException {
        executor.shutdown();
        if (!executor.awaitTermination(5, TimeUnit.SECONDS)) {
            int notStarted = executor.shutdownNow().size();
            if (!executor.awaitTermination(5, TimeUnit.SECONDS)) {
                throw new IllegalStateException("executor did not terminate; queued=" + notStarted);
            }
            System.out.println("notStarted=" + notStarted);
        }
    }
}
```

**结果：** 关闭顺序可在 Java 8 和 Java 25 复跑。**误区：** Spring 托管执行器由容器协调；业务方法调用 `shutdown()` 会
破坏其他调用者的任务。

## 现代版本中的正确用法

Java 25 主线优先使用显式不可变参数或 `ScopedValue` 表达结构化上下文。确需兼容旧 API 时，用装饰器保存提交线程快照，
在 worker 设置并在 `finally` 恢复。普通线程池任务不自动继承 `ScopedValue`；跨边界传播仍要写入协议。线程池必须有明确
所有者、容量和关闭等待，Spring 托管 Bean 的关闭权属于容器。

## 基本语法与核心接口

| 目标 | 核心接口/方法 | 关键合同 |
| --- | --- | --- |
| 当前线程局部值 | `ThreadLocal.get/set/remove` | 只影响当前线程，任务边界必须清理 |
| 创建时继承 | `InheritableThreadLocal.childValue` | 只在子线程创建时复制，不跟随任务提交 |
| 请求属性 | `RequestContextHolder` | 当前请求线程可读，未绑定可为 null |
| 任务传播 | `TaskDecorator.decorate` | 捕获、恢复和清理由装饰器明确实现 |
| Java 25 有界上下文 | `ScopedValue.where(...).run/call` | 作用域退出自动解除，值只读 |
| 关闭自有执行器 | `shutdown/awaitTermination/close` | 创建者负责等待和中断协作 |

## 从零跟着做

1. 用 `mktemp -d` 建立临时目录，只写一个 Java 25 源文件。
2. 先运行两个串行任务：第一个设置租户，第二个断言 worker 没看到旧值。
3. 删除 `finally` 再运行一次负例，确认第二个任务能读到污染值，然后恢复正确版本。
4. 用 `InheritableThreadLocal` 对照“创建线程”和“提交任务”的差异。
5. 用显式 `TaskContext` 和装饰器分别验证传播，故意让任务抛异常并确认 `Future.get()` 仍观察到 cause。
6. 用 Java 25 验证 `ScopedValue` 作用域退出自动解除，再用 Java 8 分支移除该 API。
7. 删除临时目录，并以不存在性检查确认没有 fixture 写入仓库。

## 如何使用

先画出线程边界：请求线程、提交线程、worker 和子线程分别是谁。再列出上下文字段的最小集合，区分可传播值和不可传播的
资源对象。最后写清每个字段的捕获点、设置点、恢复点、异常观察点和清理点。任何一个点没有负责人，都不应把它放进隐式 holder。

## 适用与不适用场景

适合：兼容旧接口的 trace 适配、结构化调用链中的只读值、Spring 托管执行器的可测试任务装饰器、明确的请求到任务快照。

不适合：用 `InheritableThreadLocal` 传播租户到复用池、把 Servlet request 放进异步队列、把所有自定义状态交给框架自动捕获、
用静态 holder 代替跨服务消息字段、在线程池关闭时才尝试清理任务状态。

:::tip
把上下文传播审查成一条闭环：提交时捕获、开始时设置、结束时恢复、异常时观察、关闭时等待。只要其中一步依赖线程名或偶然调度，
就还没有形成可验证合同。
:::

## 当前项目补充

冻结审计证据只证明项目存在相关使用面，不证明每条传播链都安全。六条正式证据中，`TableShardContext`、
`TsAiTraceContextHolder` 和 `Pdf2ImageComparablePriorityTaskPoolExecutor` 代表线程本地与任务池边界；
`WebAppContext`、`AjbsShardStrategy` 和 `DzzzAspect` 代表请求、分片与切面上下文使用面。相邻 `JAVA-RISK-031`
的 `ThreadHandler` 修正摘要只说明请求线程清理不能代替异步任务清理，不计入本课六条项目证据。课程只提炼显式传播和任务级清理，
不把静态 holder、请求对象或旧线程池写法当成推荐实现，也不声称冻结证据本身证明了缺陷。

## Java 8 / Spring Boot 2.3 兼容写法

Java 8 使用 `ThreadLocal`、`InheritableThreadLocal`、显式参数和自定义 `TaskDecorator`；没有 `ScopedValue`、Java 25
线程构建器的继承开关或 `ExecutorService.close()`。兼容实现仍然保存旧值并在 `finally` 恢复：

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public final class Java8ContextExecutor {
    private static final ThreadLocal<String> TRACE = new ThreadLocal<>();

    /** 执行一个 Java 8 兼容的上下文任务。 */
    static Runnable decorate(String captured, Runnable task) {
        // callback 在 worker 内恢复快照并最终还原原值。
        return () -> {
            String previous = TRACE.get();
            if (captured == null) TRACE.remove();
            else TRACE.set(captured);
            try {
                task.run();
            } finally {
                if (previous == null) TRACE.remove();
                else TRACE.set(previous);
            }
        };
    }

    /** 创建、使用并关闭 Java 8 执行器。 */
    public static void run() throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(1);
        try {
            // 任务读取 worker 中的 trace。
            executor.submit(decorate("trace-8", () -> System.out.println(TRACE.get()))).get();
        } finally {
            executor.shutdown();
            if (!executor.awaitTermination(5, TimeUnit.SECONDS)) {
                int notStarted = executor.shutdownNow().size();
                if (!executor.awaitTermination(5, TimeUnit.SECONDS)) {
                    throw new IllegalStateException("executor did not terminate; queued=" + notStarted);
                }
                System.out.println("notStarted=" + notStarted);
            }
        }
    }
}
```

Spring Boot 2.3 使用 Framework 5.2.15 的 `TaskDecorator` 和 `ThreadPoolTaskExecutor` 配置。`RequestContextFilter` 的
继承开关保持关闭，业务上下文用参数或自定义 decorator 传播，不引用 Spring 7 的 `ContextPropagatingTaskDecorator`。

## 新旧版本差异

| 对比项 | Java 25 / Spring 7.0.8 | Java 8 / Spring 5.2.15 | 迁移注意 |
| --- | --- | --- | --- |
| 有界只读上下文 | `ScopedValue` 已交付 | 不存在 | 旧线使用显式参数或 ThreadLocal wrapper |
| 执行器关闭 | `ExecutorService.close()` 可等待终止 | `shutdown` + `awaitTermination` | 不把 `close()` 写回 Java 8 |
| 请求继承开关 | RequestContextFilter 默认关闭 | 同样默认关闭 | 线程池复用场景不要打开 |
| 框架上下文 | `ContextPropagatingTaskDecorator` 可用 | 需自定义 decorator | 只传播已注册框架上下文 |
| 线程继承选项 | Java 25 构建器可选择不继承 | 无该构建器 API | 不把创建时继承误判为任务传播 |

## 易错点

:::pitfalls
### 错误：把 ThreadLocal 当任务变量

**触发条件：** 单 worker 连续执行两个任务，第一个任务只 `set` 不清理。

**原因：** `ThreadLocal` 存在线程副本，worker 会复用。

**后果：** 第二个租户读到第一个租户。

**错误示例：**

```java
TENANT.set(id);
work();
```

**正确写法：**

```java
try {
    TENANT.set(id);
    work();
} finally {
    TENANT.remove();
}
```

**验证方式：** 临时单 worker 串行提交两次并断言第二次为空。影响版本：Java 25/8；来源：
`java25-thread-local`、`java25-thread-pool-executor`。

### 错误：用 InheritableThreadLocal 传播到线程池

**触发条件：** 请求线程设置值后向已有池提交任务。

**原因：** 继承发生在创建子线程，而不是提交任务。

**后果：** 任务看不到新值或继续看到旧值。

**错误示例：**

```java
inheritable.set(id);
executor.submit(work);
```

**正确写法：**

```java
// 使用显式 ID 执行任务。
executor.submit(() -> workWith(id));
```

**验证方式：** 先创建 worker，再修改父值并提交任务。影响版本：Java 25/8；来源：
`java25-inheritable-thread-local`、`java8-inheritable-thread-local`。

### 错误：把 RequestContextHolder 当异步输入

**触发条件：** 后台任务直接调用 `currentRequestAttributes()`。

**原因：** 请求属性只绑定请求线程。

**后果：** 定时或消息任务抛 `IllegalStateException`。

**错误示例：**

```java
RequestContextHolder.currentRequestAttributes();
```

**正确写法：**

```java
// 使用显式租户参数执行异步任务。
executor.submit(() -> process(tenantId));
```

**验证方式：** 没有请求绑定的 worker 运行任务并断言业务输入完整。影响版本：Spring 7/5.2；来源：
`spring7-request-context-holder`、`spring5-request-context-holder`。

### 错误：打开 RequestContextFilter 的继承开关

**触发条件：** 对可能复用的线程池设置 `threadContextInheritable=true`。

**原因：** 父请求值可能被 worker 长期持有。

**后果：** 跨请求数据污染。

**错误示例：**

```java
filter.setThreadContextInheritable(true);
```

**正确写法：**

```java
filter.setThreadContextInheritable(false);
```

**验证方式：** 创建池后连续提交不同请求值。影响版本：Spring 7/5.2；来源：`spring7-request-context-filter`、
`spring5-request-context-filter`。

### 错误：只设置不恢复 worker 原值

**触发条件：** decorator 在开始时 `set(captured)`，结束时不处理旧值。

**原因：** worker 可能已有嵌套上下文。

**后果：** 外层任务上下文被覆盖。

**错误示例：**

```java
TRACE.set(captured);
task.run();
```

**正确写法：**

```java
String previous = TRACE.get();
try {
    TRACE.set(captured);
    task.run();
} finally {
    if (previous == null) TRACE.remove();
    else TRACE.set(previous);
}
```

**验证方式：** 嵌套两个 decorator 并断言外层值保持。影响版本：Java 25/8；来源：`java25-thread-local`、
`spring7-task-decorator`。

### 错误：用 set(null) 代替 remove

**触发条件：** 清理时无条件 `threadLocal.set(null)`。

**原因：** 未绑定和绑定 null 被混为一谈，且可能触发后续逻辑误判。

**后果：** 初始化、审计和恢复分支不一致。

**错误示例：**

```java
TRACE.set(null);
```

**正确写法：**

```java
TRACE.remove();
```

**验证方式：** 清理后调用 `get`，确认初始化行为符合预期。影响版本：Java 25/8；来源：`java25-thread-local`、
`java8-thread-local`。

### 错误：以为 TaskDecorator 会自动传所有状态

**触发条件：** 只配置 Spring decorator，却未定义要传播的字段。

**原因：** decorator 包装 callback，框架不知道业务 `ThreadLocal` 的语义。

**后果：** trace 有值而租户为空，或传播了不该传播的对象。

**错误示例：**

```java
snapshot.put("request", request);
snapshot.put("connection", connection);
```

**正确写法：**

```java
TaskContext snapshot = new TaskContext(tenantId, traceId);
```

**验证方式：** 列出快照字段并逐项断言。影响版本：Spring 7/5.2；来源：`spring7-task-decorator`、
`spring5-task-decorator`。

### 错误：把 ScopedValue 当任意 Executor 的自动传播

**触发条件：** 在 `ScopedValue.where` 外提交普通 executor 任务并读取 key。

**原因：** 官方继承语义限于结构化子任务。

**后果：** worker 未绑定或读取失败。

**错误示例：**

```java
// 在普通 worker 中读取绑定状态。
executor.submit(() -> KEY.get());
```

**正确写法：**

```java
// 通过显式上下文传入异步任务。
executor.submit(() -> process(explicitContext));
```

**验证方式：** 对照普通 executor 与结构化作用域。影响版本：Java 25；来源：`java25-scoped-value`、
`jep-506-scoped-values`。

### 错误：异步线程假定有 HTTP 请求

**触发条件：** 定时、消息或重试任务读取请求 holder。

**原因：** 这些任务没有请求线程绑定。

**后果：** 失败或隐式使用旧值。

**错误示例：**

```java
RequestContextHolder.currentRequestAttributes();
```

**正确写法：**

```java
queue.add(new ImageJob(tenantId, objectKey, traceId));
```

**验证方式：** 无请求环境运行同一任务。影响版本：Spring 7/5.2；来源：`spring7-request-context-holder`、
`spring5-request-context-holder`。

### 错误：把 afterExecute 或业务关闭当异常和清理总线

**触发条件：** 只在 executor hook 中检查 Throwable、只依赖 hook 清理 `ThreadLocal`，或在业务方法中关闭托管执行器。

**原因：** `submit` 的 FutureTask 会保存异常，hook 参数不一定含真实 cause；hook 也不能表达每个任务的旧值，Bean 生命周期属于容器。

**后果：** 失败静默、嵌套上下文丢失，或其他调用者突然收到拒绝。

**错误示例：**

```java
executor.afterExecute(task, null);
```

**正确写法：**

```java
Future<?> future = executor.submit(work);
future.get();
```

**验证方式：** 提交抛异常的 Callable 并检查 cause；对托管 Bean 观察容器关闭而不是业务关闭。影响版本：Java 25/8、
Spring 7/5.2；来源：`java25-thread-pool-executor`、`java8-thread-pool-executor`、
`spring7-task-execution-reference`、`spring5-task-execution-reference`。
:::

## 安全与性能边界

上下文中只放完成任务所需的最小不可变标识，不放密码、Servlet request、数据库连接或可变权限对象。ThreadLocal 的保留风险
来自 worker 生命周期和未清理副本，不能用一次 GC 或一次请求测试证明“不会泄漏”。`ContextPropagatingTaskDecorator` 有额外捕获和
恢复开销，ScopedValue、显式参数和 decorator 的选择应按真实负载测量；没有 JMH/JFR 数据时，不宣称某种方式更快。

## 如何验证

1. 在 `/tmp` 用 `mktemp -d` 创建临时目录，编译串行 worker、继承边界、装饰器恢复和异常观察四个最小行为。
2. Java 25 额外验证 `ScopedValue` 作用域退出后未绑定；Java 8 分支不引用该 API。
3. Java 25 和 Java 8 反馈环各连续运行两次，输出任务值、清理后的值、异常 cause 和终止状态。
4. 负例保留一个“不清理 ThreadLocal”的版本，确认第二个任务读到污染值后删除负例源。
5. 删除临时目录并检查目录不存在，仓库不保留 fixture、runner 或浏览器输出。

## 练习

:::exercise
### 练习：为请求到异步任务建立上下文合同

**要求：** 定义不可变 `TaskContext(tenantId, traceId)`；实现一个保存、设置、恢复 ThreadLocal 的 decorator；使用单 worker
连续执行两个任务；让第一个任务抛异常；用 `Future.get()` 观察 cause，并断言第二个任务从空上下文开始。

**验收：** 任务输入不依赖 Servlet request；异常路径仍执行 `finally`；worker 原值被恢复；Java 8 兼容分支不出现
`ScopedValue` 或 `ExecutorService.close()`。
:::

## 本节小结

- `ThreadLocal` 是线程副本，线程池复用要求每个任务在 `finally` 恢复或 `remove`。
- `InheritableThreadLocal` 只在创建子线程时复制，Spring 请求上下文默认不向复用 worker 继承。
- 显式参数最透明；`TaskDecorator` 要捕获、设置、恢复并清理，且不能替代 `Future` 异常观察。
- Java 25 `ScopedValue` 只读且有界；普通 executor 不会自动传播，稳定主线不引入预览结构化并发 API。
- 异步线程不应假定存在 HTTP 请求；执行器和 Spring Bean 的关闭责任必须明确。
