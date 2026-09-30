---
id: backend.java.learn.advanced.scheduled-tasks
type: lesson
title: 定时任务
summary: 用 Spring 调度器按完成间隔、固定节拍或 cron 触发任务，并明确线程、失败、事务、关闭与多实例边界
domain: backend
technology: java
module: core
stage: advanced
level: advanced
estimatedMinutes: 190
prerequisites:
  - backend.java.learn.advanced.events-async-scheduling-and-retry
objectives:
  - 能用开始、完成和下一次开始三个时间点区分 fixedDelay、fixedRate 与 initialDelay。
  - 能编写 Spring 六段 cron 表达式，显式指定 zone，并通过外部配置禁用触发器。
  - 能使用 EnableScheduling 和零参数 Scheduled 方法注册单实例内的定时任务。
  - 能配置名为 taskScheduler 的 ThreadPoolTaskScheduler，并解释默认单线程与池大小的影响。
  - 能区分同一周期任务、独立触发器和多应用实例三种并发来源。
  - 能记录每次运行的成功或失败，并说明重复任务默认异常策略与后续触发的关系。
  - 能把调度入口与事务服务拆到不同 Bean，不依赖请求线程的上下文或事务。
  - 能定义容器关闭时的有限等待边界，并说明它不等于任务持久化或可靠投递。
  - 能将现代示例改写为 Spring Framework 5.2.15 可用的毫秒配置。
recap:
  - fixedDelay 从上次完成到下次开始计时，fixedRate 按开始节拍推进，initialDelay 只影响首次执行。
  - Spring cron 有秒、分、时、日、月、星期六段；业务时刻应显式指定 zone。
  - Scheduled 方法由后处理器注册给调度器，不接收业务参数，普通同步返回值也不会交给调用方。
  - 默认 scheduler 只有一个线程；增大池只允许不同任务或独立触发器并行，不会让同一周期实例自我重叠。
  - 重复任务的默认错误策略会记录并抑制异常，使后续触发继续；业务仍需保存可查询的失败状态。
  - 调度线程没有 HTTP 请求上下文，也不继承请求事务；薄调度入口应调用另一个 Bean 的事务服务。
  - 每个应用实例都会注册自己的计划，线程池配置不能提供集群唯一执行。
  - Spring 5.2 没有 Scheduled.timeUnit，兼容线应使用毫秒或字符串配置，而不是把差异归因于 Java 8。
related:
  - backend.java.learn.basics.date-time-and-time-zones
  - backend.java.learn.intermediate.spring-boot-and-configuration
  - backend.java.learn.intermediate.database-transactions
  - backend.java.learn.advanced.events-async-scheduling-and-retry
tags:
  - Java
  - Spring Boot
  - 定时任务
  - Scheduled
  - cron
  - TaskScheduler
  - 线程池
  - 事务边界
  - 生命周期
appliesTo: JDK 25 / Spring Boot 4.1.1 / Spring Framework 7.0.9 主线；Java 8 / Spring Boot 2.3.12.RELEASE / Spring Framework 5.2.15.RELEASE 兼容线
verifiedAt: 2026-08-30
sources:
  - id: spring-scheduling-reference
    title: Spring Framework Task Execution and Scheduling Reference
    url: https://docs.spring.io/spring-framework/reference/integration/scheduling.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.x
    claims:
      - Spring 提供 TaskScheduler 抽象、注解驱动调度和 cron 触发配置。
      - Scheduled 方法由调度基础设施按声明的触发条件调用。
  - id: spring-scheduled-javadoc
    title: Spring Framework 7.0.9 Scheduled Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.9/javadoc-api/org/springframework/scheduling/annotation/Scheduled.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.9
    claims:
      - "@Scheduled 支持 cron、fixedDelay、fixedRate、initialDelay、timeUnit 和 zone。"
      - fixedDelay 从上次完成到下次开始计时，fixedRate 按周期调用。
      - 同一方法上的多个 Scheduled 声明会注册独立触发器。
      - 普通同步方法不接收参数，普通返回值会被忽略。
  - id: spring-enable-scheduling-javadoc
    title: Spring Framework 7.0.9 EnableScheduling Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.9/javadoc-api/org/springframework/scheduling/annotation/EnableScheduling.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.9
    claims:
      - "@EnableScheduling 开启对 Spring Bean 中 Scheduled 方法的检测。"
      - 框架优先选择唯一 TaskScheduler 或名为 taskScheduler 的 Bean，否则使用本地单线程调度器。
      - 自建 ScheduledExecutorService 需要定义随容器关闭的销毁方法。
  - id: spring-thread-pool-task-scheduler
    title: Spring Framework 7.0.9 ThreadPoolTaskScheduler Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.9/javadoc-api/org/springframework/scheduling/concurrent/ThreadPoolTaskScheduler.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.9
    claims:
      - ThreadPoolTaskScheduler 默认池大小为一，任务在调度器线程上运行。
      - 调度器支持线程名前缀、错误处理器和关闭策略。
  - id: spring-task-utils
    title: Spring Framework 7.0.9 TaskUtils Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.9/javadoc-api/org/springframework/scheduling/support/TaskUtils.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.9
    claims:
      - 重复任务默认记录并抑制异常，使后续执行继续。
      - 传播异常的错误处理策略通常会阻止后续周期执行。
  - id: spring-scheduled-processor
    title: Spring Framework 7.0.9 ScheduledAnnotationBeanPostProcessor Javadoc
    url: https://docs.spring.io/spring-framework/docs/7.0.9/javadoc-api/org/springframework/scheduling/annotation/ScheduledAnnotationBeanPostProcessor.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.9
    claims:
      - ScheduledAnnotationBeanPostProcessor 把注解方法注册为调度任务。
      - 上下文关闭和 Bean 销毁时会取消并清理已注册任务。
  - id: spring-boot-scheduling
    title: Spring Boot 4.1 Task Execution and Scheduling
    url: https://docs.spring.io/spring-boot/4.1/reference/features/task-execution-and-scheduling.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.1
    claims:
      - Spring Boot 可自动配置 ThreadPoolTaskScheduler，默认使用一个线程。
      - 显式启用虚拟线程会改变现代线的调度器实现，本课示例不启用该选项。
  - id: java-25-scheduled-executor
    title: Java SE 25 ScheduledThreadPoolExecutor API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ScheduledThreadPoolExecutor.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - 同一个 fixed-rate 或 fixed-delay 周期任务的连续执行不会重叠。
      - 前一次执行的效果 happens-before 后一次执行。
  - id: java-25-scheduled-executor-service
    title: Java SE 25 ScheduledExecutorService API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ScheduledExecutorService.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - fixed-rate 按计划周期推进，fixed-delay 在前一次完成后等待固定延迟。
      - 周期任务的执行抛出异常并逃逸时，后续执行会被抑制。
  - id: spring-transaction-proxy
    title: Spring Framework Declarative Transaction Annotations
    url: https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.x
    claims:
      - 默认代理模式只拦截从代理外部进入的调用，同类内部调用不会触发事务 advice。
      - 事务边界应放在通过 Spring 代理调用的业务服务方法上。
  - id: spring-legacy-scheduled
    title: Spring Framework 5.2.15 Scheduled Javadoc
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/scheduling/annotation/Scheduled.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Java 8 兼容线支持 cron、zone、fixedDelay、fixedRate、initialDelay 和字符串占位符。
      - Spring Framework 5.2 没有 timeUnit 属性，数值周期按毫秒解释。
  - id: spring-legacy-enable-scheduling
    title: Spring Framework 5.2.15 EnableScheduling Javadoc
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/scheduling/annotation/EnableScheduling.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Java 8 兼容线具有相同的调度器查找顺序和本地单线程回退行为。
  - id: spring-legacy-task-utils
    title: Spring Framework 5.2.15 TaskUtils Javadoc
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/scheduling/support/TaskUtils.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Java 8 兼容线对重复任务同样默认记录并抑制异常。
  - id: spring-boot-legacy-scheduling
    title: Spring Boot 2.3.12 Task Execution and Scheduling
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/spring-boot-features.html#boot-features-task-execution-scheduling
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Java 8 兼容线可自动配置默认一个线程的 ThreadPoolTaskScheduler。
---

# 定时任务

有些工作不是由一次 HTTP 请求直接触发，而是要在某个时刻主动开始：扫描即将到期的任务、清理临时数据、
生成每日汇总。定时任务解决的是“何时调用一个方法”，不是“怎样让一项工作最终必达”。

本课只建立单个 Spring Boot 实例内的调度合同。消息队列、可靠投递、分布式锁和集群调度都不在本课范围内。
先把一次运行的开始、完成与下一次开始讲清，再处理 cron、线程、失败、事务和关闭边界。

## 一、先画出一次运行的三个时间点

### 1. fixedDelay 从完成时刻重新计时

`fixedDelay` 保证的是“上一次完成以后，再等待一段时间”。假设任务执行四秒，延迟三秒：

```text
第一次开始 00:00:00
第一次完成 00:00:04
第二次开始 00:00:07
第二次完成 00:00:11
第三次开始 00:00:14
```

任务本身变慢时，下一次开始也会跟着后移。它适合轮询、扫描和清理等不希望连续挤在一起的工作。

```java
/** 在上一次扫描完成三十秒后开始下一次扫描。 */
@Scheduled(fixedDelay = 30, timeUnit = TimeUnit.SECONDS)
public void scanDueTasks() {
    reminderService.scanDueTasks();
}
```

这里的 `timeUnit` 属于 Spring Framework 5.3.10 以后提供的注解属性。数值 `30` 因此表示三十秒，而不是
默认的三十毫秒。

### 2. fixedRate 按开始节拍推进

`fixedRate` 以相邻两次计划开始之间的周期为基准。周期三秒、任务执行一秒时，开始节拍保持整齐：

```text
计划开始 00:00:00  00:00:03  00:00:06
实际开始 00:00:00  00:00:03  00:00:06
实际完成 00:00:01  00:00:04  00:00:07
```

如果任务要执行四秒，前一次还没完成时，同一个周期任务不会为追赶节拍而自我重叠。后续运行会延迟，并
可能在前一次完成后紧接着开始：

```text
计划开始 00:00:00  00:00:03  00:00:06
实际开始 00:00:00  00:00:04  00:00:08
实际完成 00:00:04  00:00:08  00:00:12
```

因此，`fixedRate` 表达的是目标节拍，不是“每到周期就新建一个并发任务”。如果业务要求完成后留出恢复
时间，应选择 `fixedDelay`，而不是依靠任务偶尔足够快。

### 3. initialDelay 只推迟第一次

`initialDelay` 不会改变后续周期，只决定容器启动后多久开始第一次运行：

```java
/** 启动五秒后首次执行，之后每次完成再等待三十秒。 */
@Scheduled(
        fixedDelay = 30,
        initialDelay = 5,
        timeUnit = TimeUnit.SECONDS)
public void scanAfterStartup() {
    reminderService.scanDueTasks();
}
```

现代线还允许只设置 `initialDelay` 来注册一次性任务，但 Spring Framework 5.2 要求同时存在一个周期属性。
为了让两条版本线保持同一合同，本课完整示例始终把首次延迟和 `fixedDelay` 配合使用。

## 二、让日历时刻成为明确合同

### 1. Spring cron 比常见 Unix cron 多一段秒

Spring cron 从左到右是秒、分、时、日、月、星期，共六段。每天 `09:30` 触发可以写成：

```properties
teamflow.reminder.cron=0 30 9 * * *
```

第一个 `0` 是秒。把五段 Unix 表达式 `30 9 * * *` 直接复制过来会缺少一段，应用启动时无法注册计划。

```java
/** 每天按配置时区扫描一次临期任务。 */
@Scheduled(
        cron = "${teamflow.reminder.cron:-}",
        zone = "${teamflow.reminder.zone:UTC}")
public void scanByCalendar() {
    reminderService.scanDueTasks();
}
```

占位符把具体时刻移出源码。修改配置后需要重启应用，注解才会按新值重新注册；本课不实现运行时动态增删
计划。

### 2. zone 决定业务时刻落在哪条时间线

cron 中的 `09:30` 只是一个本地时间，必须配合时区才能落到确定瞬间。`zone` 为空时使用调度器的默认时区，
部署机器的时区变化就可能让同一表达式在不同瞬间触发。

```properties
teamflow.reminder.zone=Asia/Shanghai
```

如果业务定义的是统一世界时，可以显式使用 `UTC`；如果业务定义的是某地每天早上九点半，就写该业务地区的
IANA 时区。不要用固定偏移替代存在夏令时规则的地区时区。

### 3. 一个连字符可以在配置中关闭 cron

`@Scheduled` 把单个连字符 `-` 定义为禁用值。上面的占位符默认值就是 `-`，因此没有提供业务 cron 时不会
注册该触发器：

```properties
teamflow.reminder.cron=-
```

这适合按环境启用或关闭一个已有计划。它不会取消已经开始的业务方法，也不是运行时开关；更新配置后仍需让
应用重新创建上下文。

## 三、从注解走到真实调度器

### 1. EnableScheduling 安装注解处理器

把 `@EnableScheduling` 放在配置类上，Spring 才会发现容器内 Bean 的 `@Scheduled` 方法并注册任务：

```java
@SpringBootApplication
@EnableScheduling
public class TeamFlowApplication {

    /** 启动 TeamFlow 应用。 */
    public static void main(String[] args) {
        SpringApplication.run(TeamFlowApplication.class, args);
    }
}
```

这里不是在每次普通方法调用时临时判断注解。`ScheduledAnnotationBeanPostProcessor` 在 Bean 建立后发现方法，
把它包装成任务交给 `TaskScheduler`。手工调用 `scanDueTasks()` 只会在当前线程同步执行一次方法体，不会创建
新的计划，也不会改变下次触发时间。

### 2. Scheduled 方法不接收每次运行的业务参数

调度器只有“到点调用”的触发信息，没有控制器请求那样的参数绑定过程。普通同步方法应保持零参数，并通常
返回 `void`：

```java
/** 从持久化数据中自行取得本次扫描输入。 */
@Scheduled(fixedDelayString = "${teamflow.reminder.delay-ms}")
public void scanDueTasks() {
    reminderService.scanDueTasks();
}
```

参数、租户和当前用户不能凭空来自调度器。普通返回值即使写出来也不会交给某个调用方处理；需要观测结果时，
应记录运行状态、指标或结构化日志。

### 3. taskScheduler 让调度资源有明确 owner

Spring 会优先选择唯一的 `TaskScheduler`，或者名为 `taskScheduler` 的 Bean。显式使用这个名字可以让线程数、
线程名和关闭策略集中在一个位置：

```java
@Configuration(proxyBeanMethods = false)
public class SchedulingConfiguration {

    /** 创建由 Spring 管理的 TeamFlow 定时任务调度器。 */
    @Bean("taskScheduler")
    public ThreadPoolTaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(2);
        scheduler.setThreadNamePrefix("teamflow-schedule-");
        scheduler.setWaitForTasksToCompleteOnShutdown(true);
        scheduler.setAwaitTerminationSeconds(10);
        return scheduler;
    }
}
```

把调度器声明为 Spring Bean 后，由容器负责初始化和销毁，不再手工调用 `initialize()`。十秒是关闭等待上限，
不是每个任务的执行超时；超过上限后，外部运行环境仍可能继续终止进程。

## 四、线程数不等于执行唯一性

### 1. 默认单线程会让不同任务互相排队

Spring Framework 的本地回退调度器和 Spring Boot 默认自动配置都使用一个线程。一个慢任务占住该线程时，
同一调度器上的其他任务只能等待：

```text
00:00:00 任务 A 开始
00:00:02 任务 B 到达计划时刻，但没有可用线程
00:00:08 任务 A 完成
00:00:08 任务 B 才开始
```

如果多个独立任务确实需要同时推进，可以按已知任务数和资源限制设置小而明确的池大小。增加线程之前要先
确认数据库连接、远端服务和任务本身允许相应并发，而不是只追求日志看起来准时。

### 2. 同一周期实例不会自我重叠

一个 `fixedRate` 或 `fixedDelay` 声明会创建一个底层周期任务。即使线程池有多个线程，同一个周期实例的相邻
运行也不会同时执行。池大小主要影响不同任务之间的并行能力。

如果同一方法声明了多个 `@Scheduled`，每个声明会注册独立触发器；它们是不同周期实例，可能在不同线程上
同时进入同一个方法。若方法修改共享状态，就必须把这种并发视为真实输入，而不能因为方法名相同就假定串行。

```java
/** 两个独立触发器可能在相近时刻进入同一方法。 */
@Scheduled(cron = "0 0 9 * * *", zone = "UTC")
@Scheduled(cron = "0 0 18 * * *", zone = "UTC")
public void generateSummary() {
    summaryService.generate();
}
```

### 3. 每个应用实例都有自己的计划

部署三个 TeamFlow 实例，就会建立三个 Spring 上下文，也会注册三份相同计划。把池大小设为一只能约束一个
进程内的线程，不能让三个实例只执行一次。

本课的示例因此只承诺“单实例内按计划调用”。跨实例唯一执行需要另外选择所有权、锁或集群调度方案；这些
方案不在本课实现范围内。业务扫描仍应尽量做到重复执行不会破坏数据，但完整并发一致性留到后续课程。

## 五、把一次运行当成独立业务边界

### 1. 调度线程没有 HTTP 请求上下文

定时方法运行在 `teamflow-schedule-*` 线程上，不是某次请求的处理线程。请求 ThreadLocal、当前用户和请求事务
不会自动出现在这里。

调度工作应使用系统身份和显式配置取得范围；如果任务需要租户 ID，就从持久化配置读取或在注册任务时形成
明确输入，不能读取“当前请求用户”。

### 2. 薄调度入口跨 Bean 调用事务服务

把定时方法限制为触发、计时与结果记录，把数据库工作放到另一个 Spring Bean：

```java
@Component
public class DeadlineReminderScheduler {
    private final DeadlineReminderService reminderService;

    /** 注入真正承担一次业务运行的服务。 */
    public DeadlineReminderScheduler(DeadlineReminderService reminderService) {
        this.reminderService = reminderService;
    }

    /** 按完成间隔触发一次临期任务扫描。 */
    @Scheduled(fixedDelayString = "${teamflow.reminder.delay-ms}")
    public void scan() {
        reminderService.collectCandidates();
    }
}
```

```java
@Service
public class DeadlineReminderService {

    /** 在本次运行自己的只读事务中查询临期任务。 */
    @Transactional(readOnly = true)
    public void collectCandidates() {
        // 查询即将到期且未完成的任务，并记录候选数量。
    }
}
```

从调度 Bean 进入另一个 Bean 的公开方法会经过事务代理。本类中的 `this.collectCandidates()` 自调用不会重新
经过代理，不能用来建立新的事务边界。每次触发都应独立完成或回滚，不要把事务跨到下一次运行。

### 3. 失败需要业务状态，而不只是异常日志

Spring 对重复任务的默认错误策略是记录并抑制异常，后续计划仍会触发。这与直接使用 JDK 调度器时“异常从
周期任务逃逸会抑制后续执行”的底层合同不同；Spring 在外层增加了错误处理。

默认日志能帮助排错，却不能回答“今天九点的扫描是否成功、处理了多少条、失败原因是什么”。重要任务应为
每次运行保存开始时间、结束时间、状态和错误摘要，或者至少产生可检索的结构化日志和指标。

```java
/** 执行一次扫描并记录明确终态。 */
public void runOnce() {
    long startedAt = System.nanoTime();
    try {
        reminderService.collectCandidates();
        runRecorder.success(System.nanoTime() - startedAt);
    } catch (RuntimeException exception) {
        runRecorder.failure(exception.getClass().getSimpleName());
        throw exception;
    }
}
```

重新抛出异常可以保留 Spring 默认错误日志；由于重复任务的默认处理器会抑制它，下一次仍会触发。若自定义
`ErrorHandler` 改成传播异常，底层周期任务可能停止，必须把这种改变当作显式运行合同验证。

### 4. 关闭等待不是可靠投递

上下文关闭时，Spring 会取消已注册计划，不再开始新的周期。正在执行的任务是否等待完成，由调度器关闭配置
决定。`setWaitForTasksToCompleteOnShutdown(true)` 配合有限的 `setAwaitTerminationSeconds(...)` 可以为短任务
留出收尾时间。

这个等待只覆盖正常关闭窗口。进程崩溃、机器断电或被强制终止时，内存中的执行仍会消失；下一次启动也不会
自动补跑错过的时刻。不要把优雅关闭描述成持久化、重试或最终送达保证。

## 六、运行一条完整的提醒扫描计划

### 1. 建立非 Web Spring Boot 工程

新建 `scheduled-task-demo`，现代线使用以下 `pom.xml`：

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
    <artifactId>scheduled-task-demo</artifactId>
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

`src/main/resources/application.properties` 关闭 Web 服务器，并把演示周期外置：

```properties
spring.main.web-application-type=none
spring.main.banner-mode=off
logging.level.root=OFF
teamflow.reminder.initial-delay-ms=100
teamflow.reminder.delay-ms=200
```

毫秒级周期只用于快速形成可重复反馈，不是生产推荐值。

### 2. 配置一个可辨认且可关闭的调度器

创建 `src/main/java/example/scheduling/SchedulingConfiguration.java`：

```java
package example.scheduling;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

@Configuration(proxyBeanMethods = false)
public class SchedulingConfiguration {

    /** 创建由 Spring 管理的 TeamFlow 定时任务调度器。 */
    @Bean("taskScheduler")
    public ThreadPoolTaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("teamflow-schedule-");
        scheduler.setWaitForTasksToCompleteOnShutdown(true);
        scheduler.setAwaitTerminationSeconds(3);
        return scheduler;
    }
}
```

本示例只有一个周期任务，池大小一已经足够。线程名前缀用来证明方法没有运行在 `main` 线程。

### 3. 用有限等待观察三次真实触发

创建 `src/main/java/example/scheduling/ReminderSchedule.java`：

```java
package example.scheduling;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ReminderSchedule {

    private final AtomicInteger completedRuns = new AtomicInteger();
    private final CountDownLatch firstThreeRuns = new CountDownLatch(3);

    /** 在上一次扫描完成后等待配置的时间，并只记录前三次扫描。 */
    @Scheduled(
            fixedDelayString = "${teamflow.reminder.delay-ms}",
            initialDelayString = "${teamflow.reminder.initial-delay-ms}")
    public void scanDueReminders() {
        if (completedRuns.get() >= 3) {
            return;
        }
        int currentRun = completedRuns.incrementAndGet();
        System.out.println("run=" + currentRun
                + " thread=" + Thread.currentThread().getName());
        firstThreeRuns.countDown();
    }

    /** 在有限时间内等待前三次扫描结束。 */
    public boolean awaitThreeRuns(long timeout, TimeUnit unit) throws InterruptedException {
        return firstThreeRuns.await(timeout, unit);
    }

    /** 返回当前已经完成的扫描次数。 */
    public int completedRuns() {
        return completedRuns.get();
    }
}
```

`CountDownLatch` 只为演示程序提供有限等待，不参与业务调度。每次运行都由真实 `@Scheduled` 触发，没有使用
`sleep` 模拟计划。

### 4. 启动容器并在观察完成后关闭

创建 `src/main/java/example/scheduling/ScheduledTaskApplication.java`：

```java
package example.scheduling;

import java.util.concurrent.TimeUnit;

import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ScheduledTaskApplication {

    /** 启动容器，等待三次扫描完成后有序关闭。 */
    public static void main(String[] args) throws InterruptedException {
        SpringApplication application = new SpringApplication(ScheduledTaskApplication.class);
        application.setBannerMode(Banner.Mode.OFF);

        try (ConfigurableApplicationContext context = application.run(args)) {
            ReminderSchedule schedule = context.getBean(ReminderSchedule.class);
            if (!schedule.awaitThreeRuns(3, TimeUnit.SECONDS)) {
                throw new IllegalStateException("scheduled task did not finish in time");
            }
            System.out.println("completedRuns=" + schedule.completedRuns());
        }
    }
}
```

运行：

```bash
mvn -q spring-boot:run
```

预期输出中的时间间隔可能略有调度误差，但运行次数与线程前缀应稳定：

```text
run=1 thread=teamflow-schedule-1
run=2 thread=teamflow-schedule-1
run=3 thread=teamflow-schedule-1
completedRuns=3
```

程序只在三次运行都完成后关闭上下文。若三秒内没有完成，有限等待会明确失败，避免演示程序永久挂起。

## 七、Java 8 兼容线只替换真实差异

### 1. Spring 5.2 没有 timeUnit 注解属性

Java 8 本身已经有 `TimeUnit`，差异来自 Spring Framework 版本。现代写法：

```java
/** 使用现代 Spring 的 timeUnit 表达三十秒完成间隔。 */
@Scheduled(fixedDelay = 30, timeUnit = TimeUnit.SECONDS)
public void scanDueTasks() {
    reminderService.scanDueTasks();
}
```

Spring Framework 5.2.15 必须换算成毫秒，或者使用外部字符串：

```java
/** 使用 Spring 5.2 可识别的毫秒占位符。 */
@Scheduled(fixedDelayString = "${teamflow.reminder.delay-ms:30000}")
public void scanDueTasks() {
    reminderService.scanDueTasks();
}
```

`cron`、`zone` 和用 `-` 禁用 cron 在两条版本线都可用，不需要为了 Java 8 删除这些合同。

### 2. 完整示例可以共用同一份 Java 源码

完整示例没有使用 `timeUnit`，所以 Java 文件和 `application.properties` 不变。兼容工程只把 POM 的 parent 与
Java 目标改为：

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

仍然执行 `mvn -q spring-boot:run`，应得到同样的四行关键输出。两版都使用默认平台线程，不启用现代线的虚拟
线程选项，因而线程模型和验收结果可以直接比较。

## 八、集中排除调度边界错误

下面六类错误分别破坏时间语义、方法合同、时区、失败状态、实例边界或并发所有权。

:::pitfalls
### 用 fixedRate 表达完成后的休息时间

**触发条件：** 业务要求一次扫描结束三十秒后再开始，却使用固定开始节拍。

**原因：** fixedRate 以计划开始周期推进，不会在完成时重新建立完整间隔。

**后果：** 慢任务完成后可能立刻追赶下一次运行，远端或数据库得不到预期恢复时间。

**错误示例：**

```java
/** 错误地用开始节拍表达完成间隔。 */
@Scheduled(fixedRateString = "${teamflow.reminder.delay-ms}")
public void scan() {
    reminderService.scanDueTasks();
}
```

**正确写法：**

```java
/** 在上一次完成后等待完整间隔。 */
@Scheduled(fixedDelayString = "${teamflow.reminder.delay-ms}")
public void scan() {
    reminderService.scanDueTasks();
}
```

**影响版本：** Spring Framework 7.0.9 与 5.2.15.RELEASE。

**验证方式：** 让方法耗时超过周期并记录开始、完成时间；正确版的下一次开始始终晚于前一次完成一个完整间隔。

### 给 Scheduled 方法添加业务参数

**触发条件：** 希望调度器自动传入任务 ID、当前用户或运行时间，给方法增加参数。

**原因：** 注解处理器注册的是零参数方法调用，没有 Web 参数绑定或业务参数提供者。

**后果：** 应用启动时无法创建有效的定时任务。

**错误示例：**

```java
/** 错误地等待调度器提供任务编号。 */
@Scheduled(fixedDelay = 1000)
public void scan(String taskId) {
    reminderService.scan(taskId);
}
```

**正确写法：**

```java
/** 由业务服务在每次运行中查询本次输入。 */
@Scheduled(fixedDelay = 1000)
public void scan() {
    reminderService.scanDueTasks();
}
```

**影响版本：** Spring Framework 7.0.9 与 5.2.15.RELEASE。

**验证方式：** 启动包含错误方法的最小上下文会报告无效 Scheduled 方法；零参数版本可以成功注册并触发。

### 省略业务 cron 的时区

**触发条件：** cron 表达式包含每天固定时刻，但注解没有 `zone`，部署环境使用不同系统时区。

**原因：** 未指定 zone 时，cron 按调度器默认时区解析。

**后果：** 同一配置在不同环境的实际触发瞬间不同，夏令时地区还会出现季节性变化。

**错误示例：**

```java
/** 错误地依赖部署机器默认时区。 */
@Scheduled(cron = "0 30 9 * * *")
public void scanEveryMorning() {
    reminderService.scanDueTasks();
}
```

**正确写法：**

```java
/** 用显式业务时区解释每天九点半。 */
@Scheduled(cron = "0 30 9 * * *", zone = "Asia/Shanghai")
public void scanEveryMorning() {
    reminderService.scanDueTasks();
}
```

**影响版本：** Spring Framework 7.0.9 与 5.2.15.RELEASE。

**验证方式：** 分别用 UTC 与上海时区启动；显式 zone 版本对应同一业务地区时刻，省略版本会随默认时区变化。

### 无论是否抛错都把运行标成成功

**触发条件：** 在 `finally` 中统一写入成功状态，希望保证每次运行都有结束记录。

**原因：** `finally` 在成功和失败路径都会执行，无法代表业务终态。

**后果：** 异常日志与运行记录相互矛盾，运维查询会把失败当成成功。

**错误示例：**

```java
/** 错误地在所有路径写入成功。 */
public void runOnce() {
    try {
        reminderService.scanDueTasks();
    } finally {
        runRecorder.success();
    }
}
```

**正确写法：**

```java
/** 分别保存成功与失败终态。 */
public void runOnce() {
    try {
        reminderService.scanDueTasks();
        runRecorder.success();
    } catch (RuntimeException exception) {
        runRecorder.failure(exception.getClass().getSimpleName());
        throw exception;
    }
}
```

**影响版本：** Java 25、Java 8 与本课两条 Spring 版本线。

**验证方式：** 让服务确定抛出 IllegalStateException；正确版保存失败状态，Spring 默认记录异常且下一周期继续。

### 用单线程调度器假定集群只运行一次

**触发条件：** 应用部署多个副本，仅把每个副本的池大小设为一，就认为计划全局唯一。

**原因：** 每个 Spring 应用上下文独立注册任务，线程池只管理当前进程。

**后果：** 三个实例会分别执行同一业务扫描，可能产生重复状态或重复外部副作用。

**错误示例：**

```java
/** 这个配置只能限制当前实例，不能选出集群唯一 owner。 */
@Bean("taskScheduler")
public ThreadPoolTaskScheduler taskScheduler() {
    ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
    scheduler.setPoolSize(1);
    return scheduler;
}
```

**正确写法：**

```java
/** 当前课程只执行可重复的候选扫描，不宣称跨实例唯一。 */
@Scheduled(fixedDelayString = "${teamflow.reminder.delay-ms}")
public void scan() {
    reminderService.collectCandidatesWithoutSending();
}
```

**影响版本：** 所有 Spring Framework 与 Spring Boot 版本。

**验证方式：** 同时启动两个不同端口或非 Web 进程；两者都会输出扫描日志，证明池大小不是分布式锁。

### 给定时方法再加 Async 以追赶进度

**触发条件：** 看到 fixedRate 落后后给同一个方法叠加 `@Async`，却没有定义允许多少次并发运行。

**原因：** 调度器只负责提交，真正工作转移到异步执行器；多个触发可以在前一次业务尚未完成时继续提交。

**后果：** 同一业务扫描可能重叠，队列持续增长，关闭和失败分别落到两个执行器 owner。

**错误示例：**

```java
/** 错误地用无界业务重叠追赶固定节拍。 */
@Async("notificationExecutor")
@Scheduled(fixedRate = 1000)
public void scan() {
    reminderService.scanDueTasks();
}
```

**正确写法：**

```java
/** 保持一个调度 owner，并按完成间隔串联扫描。 */
@Scheduled(fixedDelayString = "${teamflow.reminder.delay-ms}")
public void scan() {
    reminderService.scanDueTasks();
}
```

**影响版本：** Spring Framework 7.0.9 与 5.2.15.RELEASE。

**验证方式：** 让方法执行两秒、周期一秒并记录同时运行数；错误版可能大于一，正确版始终为一。
:::

## 九、练习：让一次失败留下确定终态

:::exercise
### 连续观察三次提醒扫描

**要求：** 在完整示例的同类工程中实现三次 fixedDelay 扫描；第二次运行必须确定抛出并捕获 IllegalStateException，三次分别记录 SUCCESS、IllegalStateException、SUCCESS。不得使用 Async，不得用 sleep 充当调度器，不得无限等待。

**验收：**

```text
run=1 status=SUCCESS
run=2 status=IllegalStateException
run=3 status=SUCCESS
completedRuns=3 statuses=SUCCESS,IllegalStateException,SUCCESS
```
:::

参考实现继续使用完整示例的 POM 和 `application.properties`，在独立的 `scheduled-task-exercise` 目录中创建
下面两个文件，避免与主示例的启动类同时存在。

`src/main/java/example/scheduling/SchedulingFailureExerciseApplication.java`：

```java
package example.scheduling;

import java.util.concurrent.TimeUnit;

import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

@SpringBootApplication
@EnableScheduling
public class SchedulingFailureExerciseApplication {

    /** 创建单线程练习调度器。 */
    @Bean("taskScheduler")
    public ThreadPoolTaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("teamflow-exercise-");
        scheduler.setWaitForTasksToCompleteOnShutdown(true);
        scheduler.setAwaitTerminationSeconds(3);
        return scheduler;
    }

    /** 启动容器，有限等待三次运行并输出最终状态。 */
    public static void main(String[] args) throws InterruptedException {
        SpringApplication application =
                new SpringApplication(SchedulingFailureExerciseApplication.class);
        application.setBannerMode(Banner.Mode.OFF);

        try (ConfigurableApplicationContext context = application.run(args)) {
            FailureRecordingSchedule schedule =
                    context.getBean(FailureRecordingSchedule.class);
            if (!schedule.awaitThreeRuns(3, TimeUnit.SECONDS)) {
                throw new IllegalStateException("scheduled task did not finish in time");
            }
            System.out.println("completedRuns=" + schedule.completedRuns()
                    + " statuses=" + schedule.joinedStatuses());
        }
    }
}
```

`src/main/java/example/scheduling/FailureRecordingSchedule.java`：

```java
package example.scheduling;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class FailureRecordingSchedule {

    private final AtomicInteger completedRuns = new AtomicInteger();
    private final CountDownLatch firstThreeRuns = new CountDownLatch(3);
    private final List<String> statuses = new ArrayList<>();

    /** 执行前三次扫描，并把成功或失败保存为可观察状态。 */
    @Scheduled(
            fixedDelayString = "${teamflow.reminder.delay-ms}",
            initialDelayString = "${teamflow.reminder.initial-delay-ms}")
    public void scan() {
        if (completedRuns.get() >= 3) {
            return;
        }
        int currentRun = completedRuns.incrementAndGet();
        String status = "SUCCESS";

        try {
            processRun(currentRun);
        } catch (RuntimeException exception) {
            status = exception.getClass().getSimpleName();
        }

        statuses.add(status);
        System.out.println("run=" + currentRun + " status=" + status);
        firstThreeRuns.countDown();
    }

    /** 让第二次运行产生确定业务失败。 */
    private void processRun(int currentRun) {
        if (currentRun == 2) {
            throw new IllegalStateException("planned failure");
        }
    }

    /** 在有限时间内等待前三次运行结束。 */
    public boolean awaitThreeRuns(long timeout, TimeUnit unit) throws InterruptedException {
        return firstThreeRuns.await(timeout, unit);
    }

    /** 返回已经完成的运行次数。 */
    public int completedRuns() {
        return completedRuns.get();
    }

    /** 按运行顺序连接三次终态。 */
    public String joinedStatuses() {
        return String.join(",", statuses);
    }
}
```

现代线与 Java 8 兼容线分别使用前文对应的 POM，执行同一条命令：

```bash
mvn -q spring-boot:run
```

第二次失败被转换成明确状态，因此第三次仍会运行；这里没有依赖默认日志来代表业务记录。`CountDownLatch`
保证主线程只在三次状态都写入后读取列表，两条版本线应得到完全相同的四行输出。
