---
id: backend.java.learn.advanced.events-async-scheduling-and-retry
type: lesson
title: 异步任务
summary: 使用 @Async 与具名执行器提交后台任务，观察成功和失败，并守住代理、线程上下文与关闭边界
domain: backend
technology: java
module: core
stage: advanced
level: advanced
estimatedMinutes: 190
prerequisites:
  - backend.java.learn.advanced.http-clients-and-integration-resilience
objectives:
  - 能区分同步方法返回、异步任务提交和异步任务完成三个不同时间点。
  - 能使用 @EnableAsync、独立 Spring Bean 和 @Async 建立真实的代理调用边界。
  - 能通过 @Async 的 value 明确选择具名 ThreadPoolTaskExecutor，而不依赖默认候选推断。
  - 能使用 CompletableFuture 观察正常结果和原始失败，并为等待设置有限超时。
  - 能说明 void 异步方法无法向调用方返回异常，并使用 AsyncUncaughtExceptionHandler 集中观测。
  - 能解释 ThreadLocal 与命令式事务为何不会自动传播到工作线程，并显式传递业务输入。
  - 能把执行器交给 Spring 容器管理，并区分完成剩余任务与关闭等待上限。
  - 能在 Java 8 兼容线保持相同的代理和执行合同，并正确替代 failedFuture。
recap:
  - '@Async 表示把一次代理方法调用提交给执行器，不承诺任务一定成功、重试或在事务提交后执行。'
  - 默认代理模式只拦截经过 Spring 代理的外部调用，同类自调用仍在当前线程同步执行。
  - '@Async 方法可以接收任意参数，但只能返回 void 或 Future 系列；业务入口优先返回 CompletableFuture。'
  - 具名业务执行器让线程名称、生命周期和使用者保持明确，不与 applicationTaskExecutor 的 Web 职责混淆。
  - Future 正常返回只代表业务成功；异常完成、等待超时和提交被拒绝是不同结果，必须分别处理。
  - ThreadLocal 与命令式事务绑定当前线程，工作线程需要的业务 ID 应作为不可变参数显式传入。
  - waitForTasksToCompleteOnShutdown 决定是否完成剩余任务，awaitTerminationSeconds 决定容器最多等待多久。
  - Java 8 已支持 CompletableFuture；没有 failedFuture 时可创建实例并调用 completeExceptionally。
related:
  - backend.java.learn.intermediate.dependency-injection-and-bean-lifecycle
tags:
  - Java
  - Spring Boot
  - 异步任务
  - EnableAsync
  - Async
  - CompletableFuture
  - ThreadPoolTaskExecutor
  - 代理
  - ThreadLocal
  - 优雅关闭
appliesTo: JDK 25 / Spring Boot 4.1.1 / Spring Framework 7.0.9 主线；Java 8 / Spring Boot 2.3.12.RELEASE / Spring Framework 5.2.15.RELEASE 兼容线
verifiedAt: 2026-08-30
sources:
  - id: spring-task-execution-reference
    title: Spring Framework Task Execution and Scheduling
    url: https://docs.spring.io/spring-framework/reference/integration/scheduling.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.x
    claims:
      - TaskExecutor 抽象负责接收任务，@Async 可以把方法调用提交给指定执行器。
      - ThreadPoolTaskExecutor 由 Spring 生命周期管理并支持优雅关闭。
  - id: spring-async-javadoc
    title: Spring Framework 7.0.9 Async Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.9/javadoc-api/org/springframework/scheduling/annotation/Async.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.9
    claims:
      - 异步方法参数类型不限，返回类型只能是 void 或 Future 系列。
      - value 可以按 qualifier 或 Bean 名选择具体执行器。
      - 目标方法返回临时 Future，代理向调用方返回真正承载异步结果的 Future。
  - id: spring-enable-async-javadoc
    title: Spring Framework 7.0.9 EnableAsync Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.9/javadoc-api/org/springframework/scheduling/annotation/EnableAsync.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.9
    claims:
      - EnableAsync 开启注解驱动的异步方法执行。
      - 默认代理模式只拦截经过代理的调用，同类内部调用不会被拦截。
      - void 方法的异常不能返回给调用方，可通过 AsyncConfigurer 自定义处理器。
  - id: spring-async-configurer
    title: Spring Framework 7.0.9 AsyncConfigurer Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.9/javadoc-api/org/springframework/scheduling/annotation/AsyncConfigurer.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.9
    claims:
      - AsyncConfigurer 可以定制默认执行器与 void 异步方法的未捕获异常处理器。
  - id: spring-async-uncaught-handler
    title: Spring Framework 7.0.9 AsyncUncaughtExceptionHandler Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.9/javadoc-api/org/springframework/aop/interceptor/AsyncUncaughtExceptionHandler.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.9
    claims:
      - void 异步方法的处理器可以取得异常、目标方法和方法参数。
  - id: spring-executor-shutdown
    title: Spring Framework 7.0.9 ExecutorConfigurationSupport Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.9/javadoc-api/org/springframework/scheduling/concurrent/ExecutorConfigurationSupport.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.9
    claims:
      - waitForTasksToCompleteOnShutdown 决定关闭时是否继续完成运行中和队列中的任务。
      - awaitTerminationSeconds 决定容器关闭时等待执行器终止的最长时间。
  - id: spring-transactional-thread-boundary
    title: Spring Framework 7.0.9 Transactional Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.9/javadoc-api/org/springframework/transaction/annotation/Transactional.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.9
    claims:
      - 命令式事务绑定当前执行线程，不会传播到方法内新启动的线程。
  - id: spring-boot-task-execution
    title: Spring Boot 4.1 Task Execution and Scheduling
    url: https://docs.spring.io/spring-boot/4.1/reference/features/task-execution-and-scheduling.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.x
    claims:
      - 没有自定义 Executor 时，Spring Boot 自动配置 AsyncTaskExecutor。
      - Java 21 以上启用虚拟线程后，自动配置执行器的具体实现会变化。
      - applicationTaskExecutor 还可能服务于 MVC、WebFlux 等框架集成。
  - id: java-25-completable-future
    title: Java SE 25 CompletableFuture API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/CompletableFuture.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - CompletableFuture 可以正常完成、异常完成并通过带超时的 get 取得结果。
      - failedFuture 可以创建已经异常完成的 CompletableFuture。
  - id: java-25-thread-local
    title: Java SE 25 ThreadLocal API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ThreadLocal.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - 每个线程访问自己的线程局部变量副本。
  - id: spring-legacy-async
    title: Spring Framework 5.2.15 Async Javadoc
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/scheduling/annotation/Async.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Java 8 兼容线同样支持 void、Future 与 CompletableFuture 返回类型和具名执行器。
  - id: spring-legacy-enable-async
    title: Spring Framework 5.2.15 EnableAsync Javadoc
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/scheduling/annotation/EnableAsync.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Java 8 兼容线具有相同的默认代理、自调用和 void 异常处理边界。
  - id: spring-legacy-executor-shutdown
    title: Spring Framework 5.2.15 ExecutorConfigurationSupport Javadoc
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/scheduling/concurrent/ExecutorConfigurationSupport.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Java 8 兼容线同样支持完成剩余任务和有限等待终止。
  - id: spring-legacy-transactional
    title: Spring Framework 5.2.15 Transactional Javadoc
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/transaction/annotation/Transactional.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Java 8 兼容线的命令式事务同样绑定当前线程且不传播到新线程。
  - id: spring-boot-legacy-task-execution
    title: Spring Boot 2.3.12 Task Execution and Scheduling
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/spring-boot-features.html#boot-features-task-execution-scheduling
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Java 8 兼容线没有自定义 Executor 时会自动配置 ThreadPoolTaskExecutor。
  - id: java-8-completable-future
    title: Java SE 8 CompletableFuture API
    url: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/CompletableFuture.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 已支持 completedFuture、completeExceptionally 和带超时的 get。
      - Java 8 没有 failedFuture。
---

# 异步任务

同步方法只有一条直接时间线：调用者进入方法，方法完成或抛出异常，然后调用者继续执行。异步任务多了一个
提交边界。调用者先把工作交给执行器并取得句柄，真正的业务方法可能稍后才在另一个线程开始，成功或失败也
会在更晚的时间出现。

本课使用 Spring `@Async` 建立这条边界，并把每个结果都变成可观察事实。定时触发属于下一课；事件、重试、
消息队列和可靠投递解决的是其他问题，不会在这里混入异步方法调用。

## 一、把方法调用拆成提交与完成

### 1. 返回 Future 不等于业务已经完成

普通调用的返回值就是本次执行结果；`@Async` 调用返回的是未来结果的句柄。三个时间点必须分开：

| 时间点 | 发生的事情 | 调用方能够确认什么 |
| --- | --- | --- |
| 提交前 | 仍在调用线程准备参数 | 还没有异步任务 |
| 代理返回 | 任务已经交给执行器 | 只确认取得了 Future，或提交当场失败 |
| Future 完成 | 工作线程结束业务方法 | 读取正常结果，或观察异常完成 |

下面的调用拿到 `future` 后可以继续做其他工作，不能据此把通知标记成已经发送：

```java
CompletableFuture<NotificationResult> future = notificationService.send("task-42", false);
System.out.println("futureReturned=" + (future != null));
```

`@Async` 只负责调用交接。它不承诺任务一定执行、不自动重试，也不表示任务会等调用方事务提交后才开始。

### 2. EnableAsync 安装异步方法处理器

Spring 容器需要先开启注解驱动的异步处理：

```java
@Configuration(proxyBeanMethods = false)
@EnableAsync
public class AsyncConfiguration {
}
```

`@EnableAsync` 注册处理 `@Async` 的基础设施。只有由 Spring 容器创建并经过后处理的 Bean 才能获得这项能力；
手工 `new TaskNotificationService()` 得到的普通对象没有 Spring 代理，注解不会自行创建线程。

### 3. 默认代理只拦截外部调用

默认 `AdviceMode.PROXY` 需要调用先经过代理。把异步入口放在独立 Bean，并从另一个 Bean 或容器取得的引用调用，
会经过代理：

```java
@Service
public class TaskNotificationService {

    /** 在具名执行器中发送任务通知。 */
    @Async("notificationExecutor")
    public CompletableFuture<String> send(String taskId) {
        return CompletableFuture.completedFuture(Thread.currentThread().getName());
    }
}
```

同一个对象内部使用 `this.send(...)` 时，调用没有离开目标对象，也没有再次经过代理，因此仍在当前线程执行：

```java
/** 演示不会经过代理的同类内部调用。 */
public CompletableFuture<String> sendInternally(String taskId) {
    return this.send(taskId);
}
```

修复方式不是给方法再加一次注解，而是让同步编排与异步执行属于不同 Spring Bean，再从外部调用异步 Bean。

## 二、让具名执行器拥有任务

### 1. value 把方法绑定到明确的 Bean

`@Async("notificationExecutor")` 中的值是执行器 qualifier 或 Bean 名。显式命名能回答“谁执行这类任务”，也
避免多个执行器存在时依赖默认候选推断：

```java
/** 创建只处理通知任务的具名执行器。 */
@Bean("notificationExecutor")
public ThreadPoolTaskExecutor notificationExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(2);
    executor.setMaxPoolSize(2);
    executor.setQueueCapacity(4);
    executor.setThreadNamePrefix("notify-");
    return executor;
}
```

这里的小容量只为让本地示例容易观察，不是生产容量公式。真实容量要根据任务耗时、到达速率、下游限制和
压测结果决定，不能复制示例数字。

### 2. 业务执行器不要冒充 Web 执行器

Spring Boot 在没有自定义执行器时可以自动配置 `AsyncTaskExecutor`。`applicationTaskExecutor` 这个特殊名字还
可能被 Spring MVC、WebFlux 等框架集成使用。业务通知任务使用单独的 `notificationExecutor`，可以避免 Web
异步请求与后台任务无意共享同一职责。

Boot 4.1 在 Java 21 以上开启 `spring.threads.virtual.enabled=true` 时，自动配置执行器的实现还会变化。因此
不要把“Boot 当前默认是什么线程池”当作业务合同。本课显式选择执行器，也不展开虚拟线程或容量规划。

### 3. 提交也可能在业务执行前失败

Future 只会在提交成功后返回。执行器已经关闭或没有能力接收任务时，代理调用本身就可能抛出任务拒绝异常，
此时没有 Future 可以等待。提交失败、Future 异常完成和等待超时是三个不同阶段：

```text
调用代理
  -> 提交失败：调用处直接得到异常
  -> 提交成功：取得 Future
       -> 正常完成：Future 中有结果
       -> 异常完成：Future 中有原始失败
       -> 仍未完成：有限等待可以超时，但任务未必停止
```

本课只要求识别这些状态。队列规划、拒绝策略选择和动态调参需要结合完整系统负载，不在这里用一个固定答案
替代工程验证。

## 三、用 CompletableFuture 观察终态

### 1. 方法签名必须保留 Future 合同

`@Async` 方法参数类型不限，返回类型只能是 `void` 或 Future 系列。业务调用方需要结果或失败信息时，优先
声明 `CompletableFuture<T>`：

```java
/** 异步生成可观察的通知结果。 */
@Async("notificationExecutor")
public CompletableFuture<NotificationResult> send(String taskId, boolean fail) {
    if (fail) {
        throw new IllegalStateException("notification failed: " + taskId);
    }
    NotificationResult result = new NotificationResult(
            taskId,
            "SENT",
            Thread.currentThread().getName(),
            RequestContext.currentRequestId());
    return CompletableFuture.completedFuture(result);
}
```

目标方法返回的 `completedFuture` 是为了满足方法签名并交出本次方法结果。调用方拿到的是代理创建的异步
Future；不要在方法内部再调用没有指定执行器的 `supplyAsync`，否则会多出一套默认执行器和上下文边界。

### 2. 有限等待同时处理成功与失败

`get(2, TimeUnit.SECONDS)` 最多等待两秒。正常完成时返回结果；业务方法抛错时抛出 `ExecutionException`，
其 cause 是原始失败；超时只表示等待预算用完，不代表工作线程已经停止：

```java
try {
    NotificationResult result = future.get(2, TimeUnit.SECONDS);
    System.out.println("status=" + result.status());
} catch (ExecutionException exception) {
    Throwable cause = exception.getCause();
    System.out.println("failureCause=" + cause.getClass().getSimpleName());
} catch (InterruptedException exception) {
    Thread.currentThread().interrupt();
    throw new IllegalStateException("waiting thread interrupted", exception);
} catch (TimeoutException exception) {
    throw new IllegalStateException("notification did not finish in time", exception);
}
```

中断表示当前等待线程被要求停止协作，捕获后应恢复中断标记。超时后的取消、补偿或状态查询要由业务合同决定，
不能把一个等待超时直接写成“任务已失败并停止”。

### 3. void 失败需要独立处理器

真正不需要调用方结果的入口可以返回 `void`，但它没有 Future 传回异常。`AsyncConfigurer` 可以集中安装
`AsyncUncaughtExceptionHandler`：

```java
@Configuration(proxyBeanMethods = false)
@EnableAsync
public class AsyncConfiguration implements AsyncConfigurer {

    /** 记录无法通过 Future 返回的 void 异步异常。 */
    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (exception, method, parameters) -> System.out.println(
                "voidFailure=" + method.getName() + ":"
                        + exception.getClass().getSimpleName());
    }
}
```

默认处理并不是绝对静默，Spring 会记录这类异常；自定义处理器可以把方法名、参数标识和异常交给应用已有的
日志或监控边界。只要调用方需要确认成功，仍应返回 `CompletableFuture`，而不是依赖日志猜测结果。

## 四、显式传递工作线程所需信息

### 1. ThreadLocal 每个线程各有一份

`ThreadLocal` 值属于设置它的线程。请求线程写入 `request-7` 后，执行器中的 `notify-1` 是另一个线程，读取
同一个 `ThreadLocal` 对象通常得到自己的初始值：

```java
RequestContext.setRequestId("request-7");
CompletableFuture<NotificationResult> future =
        notificationService.send("task-42", false);
```

任务真正需要的 `taskId` 已作为参数传入，因此不依赖请求线程仍然存在。用户 ID、租户 ID 等业务输入也应经过
校验后进入明确的不可变命令，而不是让后台任务任意读取调用线程的临时状态。

MDC 或 trace 等技术上下文确实需要跨线程时，可以为指定执行器使用受控的 `TaskDecorator`；捕获哪些字段、
何时恢复和清理都必须明确。直接复制所有 `ThreadLocal` 会扩大秘密数据和过期上下文的传播范围。

### 2. 调用方事务不会跟随到工作线程

命令式 `@Transactional` 事务绑定当前线程。调用方在请求线程开启的事务不会因为参数传给 `@Async` 方法，就
自动出现在工作线程中：

```java
/** 更新任务状态，并把通知调用提交到独立异步边界。 */
@Transactional
public void updateAndNotify(long taskId) {
    taskRepository.updateStatus(taskId, "DONE");
    notificationService.send(Long.toString(taskId), false);
}
```

上面代码不能证明异步任务一定在提交后运行，也不能证明它能读取调用方尚未提交的数据。异步任务若需要自己的
数据库事务，应在工作线程执行的业务 Bean 中建立独立事务边界；何时提交后再触发属于事件或可靠消息设计，
不由 `@Async` 自动解决。

### 3. 任务输入在提交前形成快照

异步方法可能晚于调用处执行。传入可变集合后继续修改，会让工作线程看到不稳定数据。优先传递不可变值对象，
或在提交前复制本次任务需要的字段：

```java
public record NotificationCommand(long taskId, long userId, String requestId) {
}

NotificationCommand command = new NotificationCommand(taskId, userId, requestId);
notificationService.send(command);
```

Java 8 没有 record，可使用字段为 `final` 的普通类表达同一份固定输入；这只是数据对象写法差异，不改变异步
代理、线程或 Future 合同。这里的异步入口接收完整命令对象；后面的最小可运行工程只需要任务编号，所以保留
`send(String, boolean)` 这条更小的教学签名。

在 TeamFlow 中，本课能力位于任务状态更新后的通知调用边界：业务 Service 提交已经固定的通知输入，调用方
通过 Future 观察成功或失败，容器负责执行器关闭。`@Async` 不保证事务提交后触发或可靠投递，这两项责任留给
后续异步通知链路实战补齐。

## 五、运行一条完整异步通知链

### 1. 建立非 Web Spring Boot 工程

创建目录 `async-task-demo`，使用 JDK 25 作为 Project SDK、模块 SDK 和 Maven Runner JRE。`pom.xml` 只需要
Spring Boot 基础 starter：

```xml
<?xml version="1.0" encoding="UTF-8"?>
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

    <groupId>example</groupId>
    <artifactId>async-task-demo</artifactId>
    <version>1.0.0</version>

    <properties>
        <java.version>25</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
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

创建 `src/main/resources/application.properties`，关闭与本课无关的启动输出：

```properties
spring.main.web-application-type=none
spring.main.banner-mode=off
logging.level.root=ERROR
```

### 2. 配置具名执行器与 void 失败观测

创建 `src/main/java/example/async/AsyncConfiguration.java`：

```java
package example.async;

import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration(proxyBeanMethods = false)
@EnableAsync
public class AsyncConfiguration implements AsyncConfigurer {

    /** 创建只属于通知任务的受管执行器。 */
    @Bean("notificationExecutor")
    public ThreadPoolTaskExecutor notificationExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(2);
        executor.setQueueCapacity(4);
        executor.setThreadNamePrefix("notify-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(5);
        return executor;
    }

    /** 把 void 异步方法的未捕获异常交给统一观测入口。 */
    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (exception, method, parameters) -> System.out.println(
                "voidFailure=" + method.getName() + ":"
                        + exception.getClass().getSimpleName());
    }
}
```

`setWaitForTasksToCompleteOnShutdown(true)` 允许关闭时继续完成运行中和队列中的任务；
`setAwaitTerminationSeconds(5)` 让容器最多等待五秒。前者决定是否排空剩余工作，后者限制关闭阻塞时间，
不能把其中任意一个描述成两项职责都已完成。

### 3. 定义结果与最小线程上下文

创建 `src/main/java/example/async/NotificationResult.java`：

```java
package example.async;

public record NotificationResult(
        String taskId,
        String status,
        String threadName,
        String requestContext) {
}
```

创建 `src/main/java/example/async/RequestContext.java`：

```java
package example.async;

public final class RequestContext {

    private static final ThreadLocal<String> REQUEST_ID = new ThreadLocal<>();

    /** 禁止创建只提供静态线程上下文方法的工具类实例。 */
    private RequestContext() {
    }

    /** 保存当前线程的请求编号。 */
    public static void setRequestId(String requestId) {
        REQUEST_ID.set(requestId);
    }

    /** 读取当前线程自己的请求编号。 */
    public static String currentRequestId() {
        return REQUEST_ID.get();
    }

    /** 清理当前线程的请求编号。 */
    public static void clear() {
        REQUEST_ID.remove();
    }
}
```

`RequestContext` 只用于证明线程边界，不是建议在业务代码中建立全局状态。主程序会在调用线程写入值，工作线程
则读取不到；真正需要的任务编号继续通过参数传递。

### 4. 在独立 Bean 中实现异步方法

创建 `src/main/java/example/async/TaskNotificationService.java`：

```java
package example.async;

import java.util.concurrent.CompletableFuture;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class TaskNotificationService {

    /** 在具名执行器中发送通知，并返回可观察结果。 */
    @Async("notificationExecutor")
    public CompletableFuture<NotificationResult> send(String taskId, boolean fail) {
        pauseBriefly();
        if (fail) {
            throw new IllegalStateException("notification failed: " + taskId);
        }

        NotificationResult result = new NotificationResult(
                taskId,
                "SENT",
                Thread.currentThread().getName(),
                RequestContext.currentRequestId());
        return CompletableFuture.completedFuture(result);
    }

    /** 演示同类内部调用不会再次经过异步代理。 */
    public CompletableFuture<NotificationResult> sendInternally(String taskId) {
        return this.send(taskId, false);
    }

    /** 制造一个交给 AsyncUncaughtExceptionHandler 的 void 失败。 */
    @Async("notificationExecutor")
    public void failWithoutFuture(String taskId) {
        throw new IllegalArgumentException("void notification failed: " + taskId);
    }

    /** 用短暂停顿让提交与完成的先后关系稳定可见。 */
    private static void pauseBriefly() {
        try {
            Thread.sleep(150);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("notification interrupted", exception);
        }
    }
}
```

`sendInternally` 是刻意保留的反例。它调用同一个对象的 `send`，因此等待发生在调用线程，返回结果也记录
`main`；从 Spring 容器取得 `TaskNotificationService` 后直接调用 `send` 才会进入 `notify-` 线程。

### 5. 从容器外部调用并观察所有结果

创建 `src/main/java/example/async/AsyncTaskApplication.java`：

```java
package example.async;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

@SpringBootApplication
public class AsyncTaskApplication {

    /** 启动非 Web 容器并观察代理、Future、异常与线程上下文。 */
    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(AsyncTaskApplication.class);
        application.setBannerMode(Banner.Mode.OFF);

        try (ConfigurableApplicationContext context = application.run(args)) {
            TaskNotificationService service = context.getBean(TaskNotificationService.class);
            String callerThread = Thread.currentThread().getName();

            RequestContext.setRequestId("request-7");
            try {
                CompletableFuture<NotificationResult> success = service.send("task-42", false);
                System.out.println("returnedBeforeDone=" + !success.isDone());

                CompletableFuture<NotificationResult> failure = service.send("task-99", true);
                NotificationResult internal = await(service.sendInternally("task-internal"));
                NotificationResult result = await(success);

                System.out.println("callerThread=" + callerThread);
                System.out.println("workerThread=" + result.threadName());
                System.out.println("differentThread="
                        + !callerThread.equals(result.threadName()));
                System.out.println("status=" + result.status());
                System.out.println("workerRequestContext=" + result.requestContext());
                System.out.println("explicitTaskId=" + result.taskId());
                System.out.println("selfInvocationThread=" + internal.threadName());
                System.out.println("failureCause=" + failureCause(failure));
            } finally {
                RequestContext.clear();
            }

            service.failWithoutFuture("task-void");
        }
    }

    /** 在有限时间内取得正常异步结果。 */
    private static NotificationResult await(
            CompletableFuture<NotificationResult> future) {
        try {
            return future.get(2, TimeUnit.SECONDS);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("waiting thread interrupted", exception);
        } catch (ExecutionException exception) {
            throw new IllegalStateException("expected a successful result", exception.getCause());
        } catch (TimeoutException exception) {
            throw new IllegalStateException("notification did not finish in time", exception);
        }
    }

    /** 在有限时间内取得异常完成的原始失败类型。 */
    private static String failureCause(
            CompletableFuture<NotificationResult> future) {
        try {
            future.get(2, TimeUnit.SECONDS);
            return "NONE";
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("waiting thread interrupted", exception);
        } catch (ExecutionException exception) {
            return exception.getCause().getClass().getSimpleName();
        } catch (TimeoutException exception) {
            throw new IllegalStateException("failure did not arrive in time", exception);
        }
    }
}
```

在工程根目录执行：

```bash
mvn -q spring-boot:run
```

预期输出中的两个工作线程编号可能互换，但线程前缀和其余结果稳定：

```text
returnedBeforeDone=true
callerThread=main
workerThread=notify-1
differentThread=true
status=SENT
workerRequestContext=null
explicitTaskId=task-42
selfInvocationThread=main
failureCause=IllegalStateException
voidFailure=failWithoutFuture:IllegalArgumentException
```

`workerRequestContext=null` 证明调用线程的 `ThreadLocal` 没有自动传播；`explicitTaskId=task-42` 证明业务输入
不依赖该上下文。try-with-resources 最终关闭 Spring 容器，执行器按配置完成已提交任务并在等待上限内终止。

## 六、Java 8 兼容线保持同一合同

### 1. 只替换真实不兼容部分

在独立目录 `async-task-demo-java8` 中使用 Java 8、Spring Boot 2.3.12.RELEASE。把 POM 的版本属性改为：

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.3.12.RELEASE</version>
    <relativePath/>
</parent>

<properties>
    <java.version>8</java.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
</properties>
```

前一节的配置、Service、主程序、ThreadLocal 辅助类和 `application.properties` 都是 Java 8 可用写法，可以
原样保留。只有 record 数据类需要替换。创建普通的 `NotificationResult.java`：

```java
package example.async;

public final class NotificationResult {

    private final String taskId;
    private final String status;
    private final String threadName;
    private final String requestContext;

    /** 保存本示例需要读取的固定通知结果。 */
    public NotificationResult(
            String taskId,
            String status,
            String threadName,
            String requestContext) {
        this.taskId = taskId;
        this.status = status;
        this.threadName = threadName;
        this.requestContext = requestContext;
    }

    /** 返回任务编号。 */
    public String taskId() {
        return taskId;
    }

    /** 返回通知状态。 */
    public String status() {
        return status;
    }

    /** 返回实际执行线程名。 */
    public String threadName() {
        return threadName;
    }

    /** 返回工作线程自己的请求上下文。 */
    public String requestContext() {
        return requestContext;
    }
}
```

这个普通类只承载本示例读取的固定字段，不宣称完整等价于 record 的对象合同。用 Java 8 执行同一条
`mvn -q spring-boot:run`，应得到相同的代理、线程、Future、异常和关闭结果。

### 2. failedFuture 是真实 API 差异

JDK 25 可以创建已经异常完成的 Future：

```java
return CompletableFuture.failedFuture(new IllegalStateException("failed"));
```

Java 8 没有 `failedFuture`。确实需要构造这种结果时，创建实例后显式完成：

```java
CompletableFuture<String> failed = new CompletableFuture<>();
failed.completeExceptionally(new IllegalStateException("failed"));
return failed;
```

本课主示例在 `@Async` 目标方法中直接抛异常，代理返回的 Future 会记录这次失败，所以两条版本线不需要为
失败路径写两套逻辑。两版都支持 `completedFuture`、带超时的 `get`、具名执行器和 void 异常处理器。

## 七、集中排除异步边界错误

下面六类错误会让代码看似使用了 `@Async`，实际却没有可靠的线程、结果或生命周期合同。

:::pitfalls
### 在同一个对象内调用异步方法

**触发条件：** 一个方法使用 `this.send(...)` 调用同类中标注 `@Async` 的方法。

**原因：** 默认代理只拦截经过 Spring 代理的外部调用，同类内部调用没有重新进入代理。

**后果：** 工作在调用线程同步执行，耗时和 ThreadLocal 行为都与预期不同。

**错误示例：**

```java
/** 演示同类内部调用无法经过异步代理。 */
public CompletableFuture<NotificationResult> submit(String taskId) {
    return this.send(taskId, false);
}
```

**正确写法：**

```java
public final class NotificationFacade {
    private final TaskNotificationService service;

    /** 注入真正的异步 Spring Bean。 */
    public NotificationFacade(TaskNotificationService service) {
        this.service = service;
    }

    /** 从另一个 Bean 经过代理调用异步入口。 */
    public CompletableFuture<NotificationResult> submit(String taskId) {
        return service.send(taskId, false);
    }
}
```

**影响版本：** Spring Framework 7.0.9 与 5.2.15.RELEASE 的默认代理模式。

**验证方式：** 分别输出调用线程和方法线程；错误版线程相同，跨 Bean 代理调用进入具名执行器线程。

### 给异步方法声明普通业务返回类型

**触发条件：** 把 `@Async` 方法声明为 `String send(...)`，希望代理稍后再填充字符串。

**原因：** 异步方法只能返回 `void` 或 Future 系列，普通返回值无法表达尚未完成的结果。

**后果：** Spring 在调用时拒绝无效返回类型，调用方也没有合法的终态句柄。

**错误示例：**

```java
/** 演示异步方法不能返回普通业务类型。 */
@Async("notificationExecutor")
public String send(String taskId) {
    return "SENT";
}
```

**正确写法：**

```java
/** 使用 Future 表达尚未完成的异步结果。 */
@Async("notificationExecutor")
public CompletableFuture<String> send(String taskId) {
    return CompletableFuture.completedFuture("SENT");
}
```

**影响版本：** Spring Framework 7.0.9 与 5.2.15.RELEASE。

**验证方式：** 从容器取得 Bean 后调用两版方法；错误版报告无效异步返回类型，正确版返回可读取的 Future。

### 丢弃 Future 后仍把提交当成成功

**触发条件：** 调用返回 Future 的方法后不保存句柄，立即把业务状态写成完成。

**原因：** 代理返回只代表任务已经提交，真正的成功或失败仍在 Future 中。

**后果：** 后台失败没有对应状态，调用方可能向用户报告并不存在的成功。

**错误示例：**

```java
notificationService.send(taskId, false);
taskRepository.markNotificationSent(taskId);
```

**正确写法：**

```java
CompletableFuture<NotificationResult> future =
        notificationService.send(taskId, false);
NotificationResult result = future.get(2, TimeUnit.SECONDS);
System.out.println(result.status());
```

**影响版本：** Java 25、Java 8 与本课两条 Spring 版本线。

**验证方式：** 让异步方法确定抛错；错误版仍执行完成标记，正确版从 ExecutionException 的 cause 观察失败。

### 在 Async 方法内再次使用默认 supplyAsync

**触发条件：** `@Async("notificationExecutor")` 方法内部又调用无 Executor 参数的 `supplyAsync`。

**原因：** 外层已经切换到具名执行器，内层无参 `supplyAsync` 又把工作提交给 CompletableFuture 默认执行器。

**后果：** 实际业务离开 `notificationExecutor`，线程命名、上下文和关闭责任再次变得不明确。

**错误示例：**

```java
/** 演示无参 supplyAsync 会再次切换到默认执行器。 */
@Async("notificationExecutor")
public CompletableFuture<String> send(String taskId) {
    return CompletableFuture.supplyAsync(() -> Thread.currentThread().getName());
}
```

**正确写法：**

```java
/** 直接返回当前异步线程已经产生的结果。 */
@Async("notificationExecutor")
public CompletableFuture<String> send(String taskId) {
    return CompletableFuture.completedFuture(Thread.currentThread().getName());
}
```

**影响版本：** Java 25、Java 8 与本课两条 Spring 版本线。

**验证方式：** 输出线程名；错误版可能出现公共池线程，正确版稳定使用 `notificationExecutor` 的前缀。

### 假定请求上下文与事务会自动传播

**触发条件：** 工作线程只从 ThreadLocal 或调用方事务读取任务所需的用户、租户或尚未提交数据。

**原因：** ThreadLocal 与命令式事务都绑定当前线程，执行器线程拥有不同的线程状态。

**后果：** 后台任务读到 null、旧上下文或看不到调用方未提交的数据，行为随执行时机变化。

**错误示例：**

```java
/** 演示工作线程不能直接读取调用线程的请求上下文。 */
@Async("notificationExecutor")
public CompletableFuture<String> send() {
    return CompletableFuture.completedFuture(RequestContext.currentRequestId());
}
```

**正确写法：**

```java
/** 显式接收工作线程真正需要的任务与请求编号。 */
@Async("notificationExecutor")
public CompletableFuture<String> send(String taskId, String requestId) {
    return CompletableFuture.completedFuture(taskId + ":" + requestId);
}
```

**影响版本：** Java 25、Java 8、Spring Framework 7.0.9 与 5.2.15.RELEASE。

**验证方式：** 在调用线程设置 ThreadLocal 后执行两版代码；错误版工作线程读不到值，正确版始终取得显式参数。

### 关闭容器时没有定义剩余任务边界

**触发条件：** 手工创建执行器且不关闭，或关闭 Spring 容器时没有决定是否完成队列中的任务和最多等待多久。

**原因：** 任务 owner 与关闭合同缺失，应用退出时只能依赖线程实现和外部强制终止时机。

**后果：** 本地程序可能不退出，部署停止时也可能丢弃已接受任务或无限拖延关闭。

**错误示例：**

```java
ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
executor.initialize();
executor.execute(this::sendNow);
```

**正确写法：**

```java
/** 创建由 Spring 管理并具有明确关闭合同的执行器。 */
@Bean("notificationExecutor")
public ThreadPoolTaskExecutor notificationExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setWaitForTasksToCompleteOnShutdown(true);
    executor.setAwaitTerminationSeconds(5);
    return executor;
}
```

**影响版本：** Spring Framework 7.0.9 与 5.2.15.RELEASE。

**验证方式：** 提交一个短任务后关闭 ApplicationContext；正确版在五秒上限内完成任务并结束执行器。
:::

## 八、练习：统一观察一批通知结果

:::exercise
### 为三个异步任务生成确定结果

**要求：** 在完整示例工程中打开并修改 `AsyncTaskApplication.java`。依次提交 `task-101`、`task-102` 和 `task-103`，其中只有 `task-102` 传入失败标记。必须保存每个 Future，使用两秒有限等待，把正常结果转换为 `任务号=状态`，把异常结果转换为 `任务号=原始异常类型`；不得修改 `TaskNotificationService`，也不得在异步方法内增加重试或另一层 `supplyAsync`。

**验收：** 程序依次输出 `task-101=SENT`、`task-102=IllegalStateException` 和 `task-103=SENT`，随后关闭 Spring 容器。Java 8 兼容工程使用同一份主类。
:::

参考实现完整替换已有的 `AsyncTaskApplication.java`，其余文件保持第五节的实现：

```java
package example.async;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

@SpringBootApplication
public class AsyncTaskApplication {

    /** 启动容器并依次观察三个异步任务的终态。 */
    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(AsyncTaskApplication.class);
        application.setBannerMode(Banner.Mode.OFF);

        try (ConfigurableApplicationContext context = application.run(args)) {
            TaskNotificationService service = context.getBean(TaskNotificationService.class);

            CompletableFuture<NotificationResult> first = service.send("task-101", false);
            CompletableFuture<NotificationResult> second = service.send("task-102", true);
            CompletableFuture<NotificationResult> third = service.send("task-103", false);

            printOutcome("task-101", first);
            printOutcome("task-102", second);
            printOutcome("task-103", third);
        }
    }

    /** 在有限时间内把正常结果或原始异常转换成一行输出。 */
    private static void printOutcome(
            String taskId,
            CompletableFuture<NotificationResult> future) {
        try {
            NotificationResult result = future.get(2, TimeUnit.SECONDS);
            System.out.println(taskId + "=" + result.status());
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("waiting thread interrupted", exception);
        } catch (ExecutionException exception) {
            System.out.println(taskId + "="
                    + exception.getCause().getClass().getSimpleName());
        } catch (TimeoutException exception) {
            throw new IllegalStateException(taskId + " did not finish in time", exception);
        }
    }
}
```

执行：

```bash
mvn -q spring-boot:run
```

预期输出为：

```text
task-101=SENT
task-102=IllegalStateException
task-103=SENT
```

三个调用都先返回 Future，练习只是在调用方依次观察终态。第二个结果来自 Future 的异常完成，不是同步提交
失败；第三个任务仍能正常执行，说明一个业务任务失败不等于执行器或后续任务自动停止。
