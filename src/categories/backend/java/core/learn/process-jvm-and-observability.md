---
id: backend.java.learn.advanced.process-jvm-and-observability
type: lesson
title: 外部进程、JVM 环境、JMX 与可观测性
summary: 把外部命令作为受监督资源运行，并以有界、低敏的 JVM 信号完成诊断和生命周期验证
domain: backend
technology: java
module: core
stage: advanced
level: advanced
estimatedMinutes: 260
objectives:
  - 能用固定程序、结构化参数、最小环境和受控工作目录启动外部进程。
  - 能并发消费标准输出与错误输出，并在输入结束后显式关闭 stdin。
  - 能在 timeout、取消和中断路径中执行终止、等待、回收和残留报告。
  - 能区分环境变量、System properties、平台 MXBeans 与远程 JMX 的边界。
  - 能用低基数、低敏的日志、指标、追踪和 JFR 信号解释进程与 JVM 状态。
  - 能隔离 Java 25 与 Java 8 的 ProcessHandle、JFR 和 Spring 可观测 API 差异。
prerequisites:
  - backend.java.learn.basics.io-files-and-resource-ownership
  - backend.java.learn.intermediate.errors-results-and-logging
related: []
tags:
  - Java
  - ProcessBuilder
  - ProcessHandle
  - System properties
  - JMX
  - MXBean
  - JFR
  - 可观测性
  - 生命周期
appliesTo: Java 25 / Spring Boot 4.1.0 / Spring Framework 7.0.8 / Micrometer 1.17.0 / JMH 1.37 主线；项目补充适用于 Java 8 / Spring Boot 2.3.12.RELEASE / Spring Framework 5.2.15.RELEASE
modernBaseline:
  java: '25'
  springBoot: 4.1.0
  springFramework: 7.0.8
  micrometer: 1.17.0
  jmh: '1.37'
legacyBaseline:
  java: '8'
  springBoot: 2.3.12.RELEASE
  springFramework: 5.2.15.RELEASE
verifiedAt: 2026-08-13
sources:
  - id: jdk25-process-builder
    title: ProcessBuilder (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ProcessBuilder.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['程序与参数、环境、工作目录和三路标准流是彼此独立的启动合同']
  - id: jdk25-process
    title: Process (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Process.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['三路 pipe 必须及时推进，timed wait 不负责终止，进程和流要分别收束']
  - id: jdk25-process-handle
    title: ProcessHandle (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ProcessHandle.html
    sourceType: api-doc
    appliesTo: Java 25, since Java 9
    claims: ['PID、进程信息和后代均为动态快照，取消 onExit future 不会终止原生进程']
  - id: jdk8-process-builder
    title: ProcessBuilder (Java Platform SE 8)
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/ProcessBuilder.html
    sourceType: api-doc
    appliesTo: Java 8
    claims: ['Java 8 已支持参数列表、环境副本、目录、重定向与 stderr 合并']
  - id: jdk8-process
    title: Process (Java Platform SE 8)
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/Process.html
    sourceType: api-doc
    appliesTo: Java 8
    claims: ['Java 8 已有 timed wait 与强制终止，但没有标准进程树 API']
  - id: jdk25-system
    title: System (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/System.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['环境视图不可修改，System properties 是整个 JVM 共享的可变状态']
  - id: jdk8-system
    title: System (Java Platform SE 8)
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/System.html
    sourceType: api-doc
    appliesTo: Java 8
    claims: ['Java 8 具有相同的环境读取与全局 property 污染边界']
  - id: jdk25-management-factory
    title: ManagementFactory (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.management/java/lang/management/ManagementFactory.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['平台 MXBeans 提供本 JVM 快照，数量、属性与支持能力要按运行 JVM 查询']
  - id: jdk25-runtime-mxbean
    title: RuntimeMXBean (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.management/java/lang/management/RuntimeMXBean.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['uptime、实现版本、输入参数和 properties 可读取，但后两者可能含敏感值']
  - id: jdk25-memory-mxbean
    title: MemoryMXBean (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.management/java/lang/management/MemoryMXBean.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['heap 与 non-heap 是采样快照，阈值能力依赖具体内存池']
  - id: jdk25-thread-mxbean
    title: ThreadMXBean (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.management/java/lang/management/ThreadMXBean.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['CPU 与争用监控需检查支持和启用状态，标准接口不覆盖 virtual threads']
  - id: jdk8-management-package
    title: java.lang.management (Java Platform SE 8)
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/management/package-summary.html
    sourceType: api-doc
    appliesTo: Java 8
    claims: ['Java 8 已提供平台 MXBeans，本课旧线按归档合同解释']
  - id: jdk25-jmx-management-guide
    title: Monitoring and Management Using JMX Technology
    url: https://docs.oracle.com/en/java/javase/25/management/monitoring-and-management-using-jmx-technology.html
    sourceType: official-reference
    appliesTo: JDK 25 management agent
    claims: ['远程 JMX 需要规划 RMI 端口、认证、TLS 与网络收窄']
  - id: jdk25-jfr-package
    title: jdk.jfr Package (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/jdk.jfr/jdk/jfr/package-summary.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['JFR 事件可配置阈值、周期和栈，昂贵 payload 应先判断 shouldCommit']
  - id: jdk25-jfr-guide
    title: Why Use the Flight Recorder API
    url: https://docs.oracle.com/en/java/javase/25/jfapi/why-use-jfr-api.html
    sourceType: official-reference
    appliesTo: Java 25 Flight Recorder API
    claims: ['JFR 关联应用、JVM 与 OS 事件用于诊断，但不替代日志、指标、追踪与告警']
  - id: openjdk-jep-328
    title: JEP 328 Flight Recorder
    url: https://openjdk.org/jeps/328
    sourceType: release-note
    appliesTo: JDK 11 delivery of JFR
    claims: ['标准 jdk.jfr 模块在 JDK 11 交付，低开销目标不是任意配置的固定承诺']
  - id: jdk25-jcmd
    title: jcmd (JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/specs/man/jcmd.html
    sourceType: official-reference
    appliesTo: JDK 25 tool
    claims: ['jcmd 需要目标机器和有效用户权限，不同诊断命令有不同影响']
  - id: jdk25-jfr-tool
    title: jfr (JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/specs/man/jfr.html
    sourceType: official-reference
    appliesTo: JDK 25 tool
    claims: ['JFR 文件可过滤和 scrub，但离开受控环境前仍需数据分类与脱敏']
  - id: jmc9-user-guide
    title: JDK Mission Control 9 User Guide
    url: https://docs.oracle.com/en/java/java-components/jdk-mission-control/9/user-guide/jdk-mission-control.html
    sourceType: official-reference
    appliesTo: JDK Mission Control 9
    claims: ['JMC 可分析 JFR，但不是常规 JDK 安装的一部分，版本兼容需独立核验']
  - id: spring-boot-410-observability
    title: Spring Boot 4.1.0 Observability
    url: https://github.com/spring-projects/spring-boot/blob/v4.1.0/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/observability.adoc
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims: ['low-cardinality key 可进入指标和 trace，异步上下文传播需要显式验证']
  - id: spring-boot-410-metrics
    title: Spring Boot 4.1.0 Metrics
    url: https://github.com/spring-projects/spring-boot/blob/v4.1.0/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/metrics.adoc
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims: ['registry、export、common tags 与 meter filters 是独立配置合同']
  - id: spring-boot-410-tracing
    title: Spring Boot 4.1.0 Tracing
    url: https://github.com/spring-projects/spring-boot/blob/v4.1.0/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/tracing.adoc
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims: ['采样、传播、export endpoint、limits 与失败可见性必须独立验证']
  - id: spring-boot-410-endpoints
    title: Spring Boot 4.1.0 Endpoints
    url: https://github.com/spring-projects/spring-boot/blob/v4.1.0/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/endpoints.adoc
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims: ['endpoint 的 enabled、exposed 与 authorized 是三个不同条件']
  - id: spring-boot-410-jmx
    title: Spring Boot 4.1.0 JMX
    url: https://github.com/spring-projects/spring-boot/blob/v4.1.0/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/jmx.adoc
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims: ['Spring JMX 默认未启用，启用和远程 connector 安全仍需分别配置']
  - id: micrometer-observation-components
    title: Micrometer 1.17.0 Observation Components
    url: https://github.com/micrometer-metrics/micrometer/blob/v1.17.0/docs/modules/ROOT/pages/observation/components.adoc
    sourceType: official-reference
    appliesTo: Micrometer 1.17.0
    claims: ['Observation 在所有结果路径都要停止，并限制低基数与高基数字段']
  - id: cwe-78-os-command-injection
    title: CWE-78 OS Command Injection
    url: https://cwe.mitre.org/data/definitions/78.html
    sourceType: official-reference
    appliesTo: CWE-78
    claims: ['把未受控输入拼入 OS 命令会改变预期命令；应使用不调用 shell 的结构化 API 与输入白名单']
  - id: spring-boot-2312-actuator
    title: Spring Boot 2.3.12 Production-ready Features
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/production-ready-features.html
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims: ['旧线已有 Actuator 与 Micrometer，但属性、端点和 tracing 生态按归档版本处理']
  - id: openjdk-jmh
    title: OpenJDK JMH 1.37 Release
    url: https://github.com/openjdk/jmh/releases/tag/1.37
    sourceType: engineering-reference
    appliesTo: JMH 1.37
    claims: ['JMH 是隔离微基准工具，不采集生产遥测，也不能证明生产性能']
projectEvidence:
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/SystemMonitorUtil.java
    symbol: com.tdh.bdzz.util.SystemMonitorUtil
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/ConvertPdf.java
    symbol: com.tdh.bdzz.util.ConvertPdf
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/PptUtil.java
    symbol: com.tdh.bdzz.util.PptUtil
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/AppStarter.java
    symbol: com.tdh.bdzz.config.AppStarter
    usage: observed
---
# 外部进程、JVM 环境、JMX 与可观测性

## 为什么需要学习

外部程序不在 JVM 的异常、线程和资源回收边界里。`start()` 成功只表示操作系统接受了创建请求；
子进程仍可能等待输入、堵在输出 pipe、超时后继续运行，或留下后代进程。与此同时，环境变量、
System properties、JMX、JFR 和 Actuator 能提供运行信号，也可能泄露凭据、制造高基数或开放管理面。

本课把一次进程调用建模为受监督状态机：固定工具和参数，准备最小环境，并发推进三路 I/O，有界等待，
按正常终止、强制终止、退出码和产物形成结构化结果。随后只从 JVM 导出支持、低敏、低基数的信号，
让启动、readiness、运行和 shutdown 都有明确 owner。

## 学习目标

- 解释为什么 `Process` 是独立资源，而不是普通方法返回值。
- 写出不会因 stdout/stderr pipe 填满而死锁的有界 runner。
- 区分等待超时、请求终止、强制终止、进程退出与进程树收束。
- 区分宿主环境、子进程环境副本和 JVM 全局 properties。
- 正确读取 MXBean 快照，并说明远程 JMX、JFR、日志、指标和 trace 的边界。
- 在 Spring 启动关键路径之外表达外部初始化、降级、readiness 和关闭策略。

## 前置术语

- **executable：** 操作系统直接启动的程序文件，不是包含引号和管道符的整段 shell 文本。
- **stdin/stdout/stderr：** 子进程的标准输入、标准输出和标准错误；父进程看到的流方向与子进程相反。
- **reap：** 等待并确认子进程已经退出，使 OS 和父进程能够回收其终止状态。
- **MXBean：** JVM 为管理和监控提供的标准管理接口，读到的是采样时刻的运行状态。
- **低基数：** 一个字段只会产生有限类别，例如 `success`、`timeout`、`exit_nonzero`。
- **readiness：** 当前实例是否可以接收流量；它不等于 Java 进程存在，也不等于所有可选依赖正常。

## 零基础知识点详解

### 程序与参数列表是两个合同

**它是什么：** `ProcessBuilder.command()` 的第一项是 executable，后续项是逐个传给程序的参数。

**有什么作用：** 参数列表避免应用自己模拟 shell 的引号和分词规则，并让 allowlist 能分别约束程序与参数。

**什么时候使用：** 必须调用受信任的本机工具时使用；已有 Java 库或服务 API 能完成同一任务时，优先不
启动 OS 命令。

**怎么使用：**

1. 从部署配置解析固定、绝对的 executable。
2. 将每个业务参数作为独立元素，并按长度、字符和业务范围校验。
3. 禁止用户选择 `sh`、`cmd` 或任意程序，也不依赖 PATH 猜测安装位置。

**最小示例：** `new ProcessBuilder(javaBin, "-version")` 有两个元素，不是一个含空格的字符串。

**运行结果：** OS 直接启动 `javaBin`，`-version` 作为单一参数传入；没有 shell 管道或重定向解释。

**常见误区：** 参数化只能减少 shell parsing，不能自动验证 executable、路径、文件或业务权限。

### 工作目录与最小环境

**它是什么：** `directory()` 决定子进程当前目录；`environment()` 是从父进程环境复制出的可变映射。

**有什么作用：** 显式目录和最小环境让 PATH、locale、临时目录和 secret 不再由宿主偶然决定。

**什么时候使用：** 工具会读取相对文件、locale 或环境开关时使用；目录必须是本任务已授权的受控位置。

**怎么使用：**

1. 校验目录存在、类型正确且权限符合任务合同。
2. 清空环境后只加入工具确实需要的 key；Windows 启动需要的系统项按平台适配器保留。
3. 将 charset、locale、输入输出路径和临时空间写入协议，不从用户 shell profile 继承。

**最小示例：** `builder.environment().clear()` 后只放入 `LANG=C` 和任务要求的非敏感开关。

**运行结果：** 子进程只能看到 allowlist 环境，父 JVM 的 token 或连接串不会被默认透传。

**常见误区：** 环境副本可修改不代表其中内容适合日志，也不代表完全清空在所有 OS 上都可启动。

### stdin 的方向与 EOF

**它是什么：** `process.getOutputStream()` 是父进程写向子进程 stdin 的流；关闭它会向子进程发送 EOF。

**有什么作用：** 很多命令只有读到 EOF 才开始处理或退出，因此“写完并关闭”是协议的一部分。

**什么时候使用：** 工具从标准输入读有限载荷时使用；大文件或敏感内容优先使用受控文件/专用协议。

**怎么使用：**

1. 按输入字节预算写入，并在每次写入中响应取消。
2. 完成后 flush 并关闭 stdin；失败、timeout 和取消也要关闭。
3. 关闭失败进入诊断结果，但不能阻止后续终止和 reap。

**最小示例：** `try (OutputStream in = process.getOutputStream()) { in.write(bytes); }`。

**运行结果：** try 块结束时子进程读到 EOF，可以继续计算和退出。

**常见误区：** 方法名 `getOutputStream()` 描述父进程方向，初学者容易把它错认成 stdout。

### stdout 与 stderr 必须并发、有界地消费

**它是什么：** 默认 stdout/stderr 是容量有限的 native pipe；子进程写满后会等待父进程读取。

**有什么作用：** 两路并发 drain 避免父进程等待退出、子进程等待 pipe 的互锁；capture 上限保护 heap。

**什么时候使用：** 需要分别分类正常输出和诊断输出时并发读取；不需区分时可在启动前合并或重定向。

**怎么使用：**

1. 在 `start()` 后立即为 stdout、stderr 各启动一个 drain 任务。
2. 每路持续读到 EOF，但只保留有限前缀并记录 `truncated`。
3. 主流程等待进程退出后，再以有限等待收束两个 collector。

**最小示例：** 完整示例用两个 `Future<Capture>` 同时消费两路，并把每路保留量限制为 8192 字节。

**运行结果：** 子进程可写出超过 capture 上限的数据而不堵塞；父进程只保留有限摘要。

**常见误区：** “开两个线程”只解决推进问题；若每个线程 `readAllBytes()`，内存仍然无界。

### timeout、取消与中断是不同终止原因

**它是什么：** `waitFor(timeout)` 只报告等待是否到期；调用者取消和线程中断是另外两种控制信号。

**有什么作用：** 分开结果后，系统才能决定是否重试、告警、降级，或把取消传播给上游。

**什么时候使用：** 所有跨进程工作都设置绝对 deadline；极短且受 OS 保证的本机调用也不依赖无限等待。

**怎么使用：**

1. 用剩余 deadline 等待，而不是让每一步重新获得完整 timeout。
2. 超时或取消时先关闭 stdin，调用 `destroy()`，等待有限 grace。
3. 仍存活才 `destroyForcibly()`，再次等待并报告是否残留；中断时恢复 interrupt flag。

**最小示例：** `if (!process.waitFor(10, SECONDS)) { process.destroy(); ... }`。

**运行结果：** timeout 不再伪装成普通非零退出；结果包含 `timedOut` 与最终存活状态。

**常见误区：** 调用 `destroyForcibly()` 不是完成屏障，之后仍要等待并确认。

### ProcessHandle 提供现代快照而非进程树事务

**它是什么：** Java 9+ `ProcessHandle` 提供 PID、信息、父子/后代快照和异步退出通知。

**有什么作用：** 它帮助观察本次进程及当时可见后代，并可对 handle 发出终止请求。

**什么时候使用：** Java 25 需要记录安全的进程身份或 best-effort 清理后代时使用；Java 8 不可使用。

**怎么使用：**

1. 从本次 `Process.toHandle()` 出发，不接受外部 PID 作为授权依据。
2. 在终止根进程前获取后代 handle 快照，但不要从流的遍历顺序推断进程树拓扑。
3. 对每个 handle 发出 best-effort 请求，再检查存活并记录残留；需要强保证时交给 OS supervisor。

**最小示例：** `process.toHandle().descendants().forEach(ProcessHandle::destroy)` 只是一次动态快照操作。

**运行结果：** 能请求终止当时可见后代，但 daemon、re-parent、权限和 PID 复用仍需平台协议处理。

**常见误区：** 取消 `onExit()` 返回的 future 只取消等待，不会取消原生进程。

### 退出码必须进入结构化结果

**它是什么：** exit code 是子程序定义的有限结果；启动失败、timeout、取消和产物错误不一定有退出码。

**有什么作用：** 结构化结果让重试、告警和业务错误映射基于明确状态，而不是解析一段日志文本。

**什么时候使用：** 每次外部调用都返回包含终止原因、退出码、耗时、输出摘要、截断和清理状态的结果。

**怎么使用：**

1. 先区分未启动、运行、timeout、取消、已退出与残留。
2. 仅在确认退出后读取 `exitValue()`，按工具合同解释已知码。
3. 再校验 stdout 协议和原子产物；只有所有条件满足才发布成功。

**最小示例：** `succeeded = !timedOut && exitCode == 0 && artifactValid`。

**运行结果：** 非零码不会被统一重试，零码也不会绕过产物校验。

**常见误区：** stderr 可以承载警告或进度，非空不等于失败；退出码 0 也不证明文件完整。

### 环境变量与 System properties 属于不同域

**它是什么：** `System.getenv()` 是宿主环境的只读视图；properties 是 JVM 内所有线程共享的可变映射。

**有什么作用：** 区分后才能避免用全局 property 传请求态，或把宿主 secret 自动传给子进程。

**什么时候使用：** 环境适合进程启动时注入；应用配置应在启动时解析成不可变对象并显式传递。

**怎么使用：**

1. 只读取 allowlist key，并把“来源、是否存在”与值分开。
2. 不向日志、tag 或 trace 写原始环境、properties、JVM 参数和完整命令。
3. 必须临时修改 property 时保存“原值”和“原先不存在”，在 `finally` 精确恢复。

**最小示例：** `String previous = System.getProperty(key)` 还要配合 `containsKey` 区分不存在与空值。

**运行结果：** 并行任务看不到本请求私有状态；测试结束后 JVM 全局状态回到原样。

**常见误区：** `System.getProperties()` 返回的是活动 properties，不是可以随意修改的隔离快照。

### Locale、JAXP 与静态开关也是 JVM 全局状态

**它是什么：** 默认 Locale、JAXP factory property、默认时区和部分静态注册表会影响同 JVM 其他代码。

**有什么作用：** 识别共享范围后，才能把编码、locale 和解析器选择固定在组件或进程边界。

**什么时候使用：** 启动阶段可以读取并冻结明确配置；请求、定时任务和库方法不得临时改默认值。

**怎么使用：**

1. 优先把 `Locale`、`Charset`、factory 或 formatter 作为参数/对象配置。
2. 隔离必须修改全局值的 legacy 工具，序列化调用并精确恢复只是过渡方案。
3. 无法证明隔离时，将工具放入独立 worker JVM，由进程生命周期回收状态。

**最小示例：** 使用 `DateTimeFormatter.ofPattern(pattern, Locale.ROOT)`，不调用 `Locale.setDefault()`。

**运行结果：** 一个转换任务不会改变并行请求的日期、数字或 XML 解析行为。

**常见误区：** 启动回调只执行一次，不代表它修改的静态全局值没有长期影响。

### 平台 MXBeans 是带单位的采样快照

**它是什么：** `ManagementFactory` 暴露 runtime、memory、thread、GC、class loading 等平台管理接口。

**有什么作用：** 它们为本 JVM 提供低成本基础信号，可用于趋势、告警上下文和诊断触发。

**什么时候使用：** 采集 heap used/max、uptime、platform thread 数等明确指标；复杂问题再触发受控 dump/JFR。

**怎么使用：**

1. 记录采样时间、单位、JVM 实现和 pool/collector 名称。
2. 读取可选能力前检查 `is*Supported`、`is*Enabled` 或负值合同。
3. 使用时间序列和工作负载上下文，不用单点数值直接判定根因。

**最小示例：** `ManagementFactory.getMemoryMXBean().getHeapMemoryUsage().getUsed()` 返回字节快照。

**运行结果：** 完整示例读取 uptime、heap used 与 platform thread count，并验证值落在合同范围。

**常见误区：** Java 25 标准 `ThreadMXBean` 不管理 virtual threads，不能当作进程全部线程数。

### 远程 JMX 是管理面而非普通指标端口

**它是什么：** 远程 JMX 通过 connector/RMI 暴露 MBeans，可能包含读属性、诊断甚至管理操作。

**有什么作用：** 它支持受控远程管理，但权限和信息量通常高于只读 metrics exporter。

**什么时候使用：** 只有运维确需远程 MBean 操作且能提供独立管理网络、身份和审计时使用。

**怎么使用：**

1. 固定 connector 与 RMI 端口，绑定受控地址并由网络策略收窄来源。
2. 同时启用认证、TLS 和最小授权，管理凭据进入 secret 管理而不是启动参数日志。
3. 对可见 MBean/operation 做 allowlist，并测试未授权、证书失败和审计路径。

**最小示例：** 本地 `ManagementFactory.getPlatformMBeanServer()` 不等于远程 connector 已经安全配置。

**运行结果：** 未授权网络无法连接；授权主体也只能访问批准的属性和操作。

**常见误区：** `authenticate=false` 与 `ssl=false` 不是“内网简化配置”，而是取消两层关键控制。

### 日志、指标与追踪回答不同问题

**它是什么：** 日志记录离散事件，metrics 聚合趋势，traces 连接一次请求的因果路径。

**有什么作用：** 同一 `operation/result/reason` 词汇让三类信号能关联，又不把高基数数据塞进 meter identity。

**什么时候使用：** 每个进程任务记录有限 outcome、duration、truncated、cleanup；trace 可带受限任务 ID。

**怎么使用：**

1. 为指标只选 `tool.type`、`result`、`reason` 等有限枚举。
2. 日志清洗 CR/LF、限制长度，不写命令、环境、原始输出或凭据。
3. 对异步 drain 和 executor 显式传播 observation context，并验证 exporter 失败可见。

**最小示例：** `process.duration{tool.type="converter",result="timeout"}` 不包含 PID、路径或 request ID。

**运行结果：** 指标序列数量有界，单次 trace 能定位任务，各信号都不暴露原始输入。

**常见误区：** high-cardinality 可进入 trace 不等于可以无限、未采样或携带敏感数据。

### JFR/JMC 与 JMH 不属于同一反馈环

**它是什么：** JFR 记录 JVM/OS/应用事件，JMC 分析录制；JMH 在隔离进程中执行受控微基准。

**有什么作用：** JFR/JMC 用于生产近似条件下诊断，JMH 用于验证缩小后的微观性能假设。

**什么时候使用：** 遥测发现 GC、锁或热点异常后用 JFR 深挖；需要比较一个小方法时再用 JMH。

**怎么使用：**

1. JFR 固定事件设置、阈值、stack、大小、时长、保留和访问权限。
2. 自定义事件先 `shouldCommit()`，payload 只含低敏稳定字段。
3. JMH 使用独立工程、warmup、measurement、fork、结果消费并记录完整环境。

**最小示例：** 一次 JMH 分数只能称为该 JDK/参数/硬件下的微基准结果。

**运行结果：** JFR 提供跨层事件上下文；JMH 不会被错误地当作生产 SLO 或容量证据。

**常见误区：** JEP 的低开销目标不是任意自定义事件和任意配置的固定百分比保证。

### 启动、readiness 与 shutdown 必须分层

**它是什么：** Bean 创建、应用启动、可接流量、后台任务运行和优雅停止是不同生命周期阶段。

**有什么作用：** 分层后，必需依赖可以 fail fast，可选依赖可以 degraded，关闭能停止新任务并回收在途进程。

**什么时候使用：** 启动缓存、转换器探测、JMX exporter、外部 worker 和周期任务都必须声明所属阶段。

**怎么使用：**

1. 将本地、快速、无外部 I/O 的对象初始化留在 Bean 创建阶段。
2. 外部初始化进入有 timeout、幂等、失败分类和 admission 的生命周期组件。
3. readiness 只反映承诺的服务能力；shutdown 先拒绝新任务，再取消、终止、reap 并等待 owner 完成。

**最小示例：** Spring `SmartLifecycle` 可表达自动启动、phase 和异步停止回调，但策略仍由应用定义。

**运行结果：** 可选工具不可用时实例能明确降级；必需工具失败时启动失败有原因且没有残留进程。

**常见误区：** `@PostConstruct` 或 runner 只规定回调时点，不自动提供 timeout、readiness 和关闭责任。

## 现代版本中的正确用法

把一次进程任务写成有限状态机：

`admit -> start -> exchange I/O -> await -> terminate if needed -> reap -> publish result`

每一步都有 owner、剩余 deadline 和可观察结果。Java 25 可用 `ProcessHandle` 补充当前 PID、后代快照与
退出通知，但需要“无孤儿”保证时仍应依赖 process group、job object、cgroup 或 container supervisor。
JVM 观测按 `MXBeans -> metrics/traces -> on-demand JFR` 逐级增加成本；远程 JMX 和 Actuator 管理端点
独立执行 enable、expose、authenticate、authorize 和 network policy，不能由“依赖已加入”推断可用或安全。

## 核心接口与完整示例

下面的主示例只使用 Java 8 标准 API，因此可在 Java 25 与 Java 8 同时编译。它用当前 JDK 的绝对
`java` executable 启动自身 child mode，并发 drain 双路输出、关闭 stdin、执行 timeout 终止升级，
最后读取本地 MXBeans。Java 25 的 `ProcessHandle` 作为单独现代补充，不污染 legacy 编译线。

```java
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryUsage;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.CancellationException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public final class ProcessJvmObservabilityExample {
    private static final Charset UTF_8 = Charset.forName("UTF-8");
    private static final int MAX_CAPTURE_BYTES = 8192;

    /**
     * 禁止创建纯工具示例实例。
     */
    private ProcessJvmObservabilityExample() {
    }

    /**
     * 运行父进程监督流程，或进入仅供本示例调用的子进程模式。
     */
    public static void main(String[] args) throws Exception {
        if (args.length == 1 && "--child".equals(args[0])) {
            runChild();
            return;
        }

        ProcessResult result = runSupervised(10, TimeUnit.SECONDS);
        JvmSnapshot snapshot = readJvmSnapshot();
        require(result.succeeded(), "child process did not complete successfully");
        require(result.stdout.text.contains("CHILD_READY"), "stdout marker missing");
        require(result.stderr.text.contains("CHILD_DIAGNOSTIC"), "stderr marker missing");
        require(result.stdout.truncated, "stdout capture was expected to truncate");
        require(result.stderr.truncated, "stderr capture was expected to truncate");
        require(snapshot.uptimeMillis >= 0L, "uptime must be non-negative");
        require(snapshot.heapUsedBytes >= 0L, "heap usage must be non-negative");
        require(snapshot.platformThreadCount > 0, "platform thread count must be positive");
        System.out.println("PROCESS_JVM_OBSERVABILITY_PASS");
    }

    /**
     * 运行会等待标准输入 EOF，并产生双路大输出的受控子进程。
     */
    private static void runChild() throws IOException {
        System.out.println("CHILD_READY");
        System.err.println("CHILD_DIAGNOSTIC");
        byte[] inputBuffer = new byte[256];
        while (System.in.read(inputBuffer) != -1) {
            // 仅消费受控父进程输入，EOF 才结束输入阶段。
        }
        for (int index = 0; index < 4096; index++) {
            System.out.println("OUT-" + index + "-bounded-output-line");
            System.err.println("ERR-" + index + "-bounded-error-line");
        }
    }

    /**
     * 启动当前 JDK 的子进程，并在所有结果路径中收束流、进程和读取线程。
     */
    private static ProcessResult runSupervised(long timeout, TimeUnit unit) throws Exception {
        long startedNanos = System.nanoTime();
        long timeoutNanos = unit.toNanos(timeout);
        long deadline = startedNanos + timeoutNanos;
        long cleanupReserve = Math.min(
            TimeUnit.SECONDS.toNanos(2),
            Math.max(0L, timeoutNanos / 5L)
        );
        long operationDeadline = deadline - cleanupReserve;
        if (timeoutNanos <= 0L || operationDeadline - System.nanoTime() <= 0L) {
            return timedOutResult(startedNanos);
        }

        ProcessBuilder builder = new ProcessBuilder(buildCommand());
        builder.directory(new File(System.getProperty("java.io.tmpdir")));
        configureMinimalEnvironment(builder.environment());
        if (operationDeadline - System.nanoTime() <= 0L) {
            return timedOutResult(startedNanos);
        }

        Process process = builder.start();
        ExecutorService drains = Executors.newFixedThreadPool(2);
        Future<Capture> stdout = drains.submit(capture(process.getInputStream()));
        Future<Capture> stderr = drains.submit(capture(process.getErrorStream()));
        boolean timedOut = false;
        boolean residualProcess = false;
        boolean restoreInterrupt = false;

        try {
            writeAndCloseInput(process);
            if (!waitForUntil(process, operationDeadline)) {
                timedOut = true;
                process.destroy();
                long graceDeadline = halfwayTo(deadline);
                if (!waitForUntil(process, graceDeadline)) {
                    process.destroyForcibly();
                    residualProcess = !waitForUntil(process, deadline);
                }
            }
            if (residualProcess) {
                closeQuietly(process.getInputStream());
                closeQuietly(process.getErrorStream());
            }
            int exitCode = process.isAlive() ? -1 : process.exitValue();
            Capture out = collectUntil(stdout, deadline);
            Capture err = collectUntil(stderr, deadline);
            long durationMillis = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - startedNanos);
            return new ProcessResult(timedOut, residualProcess, exitCode, durationMillis, out, err);
        } catch (InterruptedException interrupted) {
            restoreInterrupt = true;
            process.destroyForcibly();
            throw interrupted;
        } finally {
            cleanupResources(process, drains, stdout, stderr, deadline, restoreInterrupt);
        }
    }

    /**
     * 构造一个未启动进程时的结构化超时结果。
     */
    private static ProcessResult timedOutResult(long startedNanos) {
        long durationMillis = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - startedNanos);
        Capture incomplete = new Capture("", false, false);
        return new ProcessResult(true, false, -1, durationMillis, incomplete, incomplete);
    }

    /**
     * 把当前剩余预算平分为正常终止和强制终止两个阶段。
     */
    private static long halfwayTo(long deadline) {
        long now = System.nanoTime();
        long remainingNanos = Math.max(0L, deadline - now);
        return now + remainingNanos / 2L;
    }

    /**
     * 只使用绝对截止时刻的剩余预算等待进程退出。
     */
    private static boolean waitForUntil(Process process, long deadline) throws InterruptedException {
        long remainingNanos = deadline - System.nanoTime();
        return !process.isAlive()
            || (remainingNanos > 0L && process.waitFor(remainingNanos, TimeUnit.NANOSECONDS));
    }

    /**
     * 在共享截止时刻前取得输出；失败或超时返回显式的不完整摘要。
     */
    private static Capture collectUntil(Future<Capture> future, long deadline)
            throws InterruptedException {
        long remainingNanos = deadline - System.nanoTime();
        if (remainingNanos <= 0L) {
            future.cancel(true);
            return new Capture("", true, false);
        }
        try {
            return future.get(remainingNanos, TimeUnit.NANOSECONDS);
        } catch (CancellationException cancelled) {
            return new Capture("", true, false);
        } catch (ExecutionException failed) {
            return new Capture("", true, false);
        } catch (TimeoutException timedOut) {
            future.cancel(true);
            return new Capture("", true, false);
        }
    }

    /**
     * 在共享清理截止时刻内收束资源，并在全部步骤结束后恢复中断标记。
     */
    private static void cleanupResources(
            Process process,
            ExecutorService drains,
            Future<Capture> stdout,
            Future<Capture> stderr,
            long deadline,
            boolean restoreInterrupt) {
        closeQuietly(process.getOutputStream());
        closeQuietly(process.getInputStream());
        closeQuietly(process.getErrorStream());
        if (process.isAlive()) {
            process.destroyForcibly();
        }

        while (process.isAlive()) {
            long remainingNanos = deadline - System.nanoTime();
            if (remainingNanos <= 0L) {
                break;
            }
            try {
                process.waitFor(remainingNanos, TimeUnit.NANOSECONDS);
            } catch (InterruptedException interrupted) {
                restoreInterrupt = true;
            }
        }

        stdout.cancel(true);
        stderr.cancel(true);
        drains.shutdownNow();
        while (!drains.isTerminated()) {
            long remainingNanos = deadline - System.nanoTime();
            if (remainingNanos <= 0L) {
                break;
            }
            try {
                drains.awaitTermination(remainingNanos, TimeUnit.NANOSECONDS);
            } catch (InterruptedException interrupted) {
                restoreInterrupt = true;
            }
        }

        if (restoreInterrupt) {
            Thread.currentThread().interrupt();
        }
    }

    /**
     * 构造不经过 shell 的程序与参数列表。
     */
    private static List<String> buildCommand() throws IOException {
        File javaHome = new File(System.getProperty("java.home"));
        File executable = new File(new File(javaHome, "bin"), isWindows() ? "java.exe" : "java");
        File canonicalExecutable = executable.getCanonicalFile();
        require(canonicalExecutable.isFile(), "java executable is not a file");

        List<String> command = new ArrayList<String>();
        command.add(canonicalExecutable.getPath());
        command.add("-cp");
        command.add(buildAbsoluteClasspath());
        command.add(ProcessJvmObservabilityExample.class.getName());
        command.add("--child");
        return command;
    }

    /**
     * 在切换子进程工作目录前，把父进程 classpath 解析为绝对规范路径。
     */
    private static String buildAbsoluteClasspath() throws IOException {
        String[] entries = System.getProperty("java.class.path").split(File.pathSeparator, -1);
        File parentDirectory = new File(System.getProperty("user.dir")).getCanonicalFile();
        StringBuilder absoluteClasspath = new StringBuilder();
        for (String entry : entries) {
            File path = entry.length() == 0 ? parentDirectory : new File(entry);
            if (!path.isAbsolute()) {
                path = new File(parentDirectory, entry);
            }
            if (absoluteClasspath.length() > 0) {
                absoluteClasspath.append(File.pathSeparatorChar);
            }
            absoluteClasspath.append(path.getCanonicalPath());
        }
        return absoluteClasspath.toString();
    }

    /**
     * 为子进程建立最小环境，并保留 Windows 创建进程所需的系统根信息。
     */
    private static void configureMinimalEnvironment(Map<String, String> environment) {
        String systemRoot = System.getenv("SystemRoot");
        environment.clear();
        environment.put("LANG", "C");
        environment.put("PROCESS_EXAMPLE_MODE", "bounded");
        if (systemRoot != null) {
            environment.put("SystemRoot", systemRoot);
        }
    }

    /**
     * 写入有限握手内容，并通过关闭标准输入向子进程发送 EOF。
     */
    private static void writeAndCloseInput(Process process) throws IOException {
        OutputStream input = process.getOutputStream();
        try {
            input.write("ready\n".getBytes(UTF_8));
            input.flush();
        } finally {
            input.close();
        }
    }

    /**
     * 创建持续读取到 EOF、但只保留有限字节前缀的任务。
     */
    private static Callable<Capture> capture(final InputStream stream) {
        return new Callable<Capture>() {
            /**
             * 读取完整管道以保持推进，并记录是否发生截断。
             */
            @Override
            public Capture call() throws Exception {
                ByteArrayOutputStream retained = new ByteArrayOutputStream(MAX_CAPTURE_BYTES);
                byte[] buffer = new byte[1024];
                boolean truncated = false;
                try {
                    int read;
                    while ((read = stream.read(buffer)) != -1) {
                        int remaining = MAX_CAPTURE_BYTES - retained.size();
                        int keep = Math.min(remaining, read);
                        if (keep > 0) {
                            retained.write(buffer, 0, keep);
                        }
                        if (keep < read) {
                            truncated = true;
                        }
                    }
                } catch (IOException streamClosed) {
                    return new Capture(new String(retained.toByteArray(), UTF_8), true, false);
                }
                return new Capture(new String(retained.toByteArray(), UTF_8), truncated, true);
            }
        };
    }

    /**
     * 读取明确单位的本地 JVM 管理快照。
     */
    private static JvmSnapshot readJvmSnapshot() {
        MemoryUsage heap = ManagementFactory.getMemoryMXBean().getHeapMemoryUsage();
        return new JvmSnapshot(
            ManagementFactory.getRuntimeMXBean().getUptime(),
            heap.getUsed(),
            ManagementFactory.getThreadMXBean().getThreadCount()
        );
    }

    /**
     * 判断当前操作系统是否使用 Windows 可执行文件名。
     */
    private static boolean isWindows() {
        return System.getProperty("os.name", "").toLowerCase(Locale.ROOT).contains("win");
    }

    /**
     * 尝试关闭流，主清理流程不会被重复关闭失败中断。
     */
    private static void closeQuietly(java.io.Closeable closeable) {
        try {
            closeable.close();
        } catch (IOException ignored) {
            // 真实系统应把关闭失败写入结构化清理结果，而不是记录流内容。
        }
    }

    /**
     * 在示例合同不成立时立即失败。
     */
    private static void require(boolean condition, String message) {
        if (!condition) {
            throw new IllegalStateException(message);
        }
    }

    private static final class Capture {
        private final String text;
        private final boolean truncated;
        private final boolean complete;

        /**
         * 保存有限输出摘要、截断状态和 collector 完成状态。
         */
        private Capture(String text, boolean truncated, boolean complete) {
            this.text = text;
            this.truncated = truncated;
            this.complete = complete;
        }
    }

    private static final class ProcessResult {
        private final boolean timedOut;
        private final boolean residualProcess;
        private final int exitCode;
        private final long durationMillis;
        private final Capture stdout;
        private final Capture stderr;

        /**
         * 保存一次受监督调用的有限结果。
         */
        private ProcessResult(
            boolean timedOut,
            boolean residualProcess,
            int exitCode,
            long durationMillis,
            Capture stdout,
            Capture stderr
        ) {
            this.timedOut = timedOut;
            this.residualProcess = residualProcess;
            this.exitCode = exitCode;
            this.durationMillis = durationMillis;
            this.stdout = stdout;
            this.stderr = stderr;
        }

        /**
         * 判断子进程是否在本示例合同内成功完成。
         */
        private boolean succeeded() {
            return !timedOut
                && !residualProcess
                && exitCode == 0
                && durationMillis >= 0L
                && stdout.complete
                && stderr.complete;
        }
    }

    private static final class JvmSnapshot {
        private final long uptimeMillis;
        private final long heapUsedBytes;
        private final int platformThreadCount;

        /**
         * 保存带固定单位的本地 JVM 快照。
         */
        private JvmSnapshot(long uptimeMillis, long heapUsedBytes, int platformThreadCount) {
            this.uptimeMillis = uptimeMillis;
            this.heapUsedBytes = heapUsedBytes;
            this.platformThreadCount = platformThreadCount;
        }
    }
}
```

Java 25 的进程树补充必须单独编译，不能复制到 Java 8 主示例：

```java
ProcessHandle root = process.toHandle();
List<ProcessHandle> descendants = root.descendants().toList();
for (ProcessHandle descendant : descendants) {
    descendant.destroy();
}
root.destroy();
```

`descendants()` 不承诺拓扑顺序，因此这段代码只对当时可见 handle 做 best-effort 请求。生产系统仍需
记录权限失败、存活残留与平台 supervisor 结果，不能声称这几行实现了跨平台进程树事务。

## 从零跟着做

1. 先确定一个固定工具和允许参数，不要从用户输入拼整段命令。
2. 为工作目录、子进程环境、stdin、stdout、stderr 和输出字节分别写明上限与 owner。
3. 在 `start()` 后立即启动两路 drain，再写有限 stdin 并关闭它。
4. 用绝对 deadline 等待；timeout/取消按 normal、grace、force、reap 顺序收束。
5. 只在确认退出后解释 exit code，并校验协议输出与产物再发布成功。
6. 记录低基数 outcome、duration、truncated 和 residual，不记录原始命令、环境或输出。
7. 从 MXBeans 读取带单位快照；需要深度诊断时再触发有预算的 JFR/JMC 流程。

## 如何使用

应用层先通过 admission 限制同时运行的外部任务数，再调用长期共享的 supervisor。supervisor 只接受
`toolId + validatedArguments + deadline`，内部根据 toolId 解析 executable、环境、目录、退出码和产物
合同。调用方得到结构化结果后决定重试、降级或返回业务错误，不直接解析日志，也不自行 kill PID。

## 适用与不适用场景

适用于无法由库替代的文档转换、媒体工具、受控诊断和隔离 worker。若工具来源不可信、参数无法
allowlist、需要无孤儿强保证却没有平台 supervisor，或任务会改变同 JVM 全局状态而无法恢复，则不应
直接在 Web 进程启动。JMX 适合受控管理；只读趋势通常优先使用经过筛选的 metrics exporter。

:::tip
将 executable、参数规则、环境 allowlist、退出码、输出上限和关闭策略作为一个不可变 `ToolContract`，
由单一 supervisor 执行。这样安全审查、测试和观测都围绕同一合同，而不是散落在每个调用点。
:::

## 当前项目补充

冻结矩阵仅证明 `SystemMonitorUtil`、`ConvertPdf`、`PptUtil` 和 `AppStarter` 出现了外部进程、运行环境或
JMX 相关能力，不证明其生命周期正确。正文只据此说明能力边界，不从冻结证据推断当前实现缺陷。

## Java 8 / Spring Boot 2.3 兼容写法

Java 8 主线已有 `ProcessBuilder`、双路 pipe、`waitFor(long, TimeUnit)`、`isAlive()` 与
`destroyForcibly()`，因此完整示例保持相同 I/O、timeout 和退出合同。旧线没有 `ProcessHandle`、
`onExit()`、`pid()`、`children()` 或 `descendants()`：必须由 wrapper、process group、Windows Job、
容器或外部 supervisor 提供进程树保证。Boot 2.3 已有 Actuator 与 Micrometer，但属性名、端点暴露和
tracing 生态按 2.3.12 归档文档配置，不能复制 Boot 4.1.0 Observation/Tracing 示例。

## 新旧版本差异

| 对比项 | Java 25 / Boot 4.1.0 | Java 8 / Boot 2.3.12 | 迁移注意 |
| --- | --- | --- | --- |
| 进程身份 | `ProcessHandle`、PID、后代快照、`onExit()` | 无标准进程树 API | 不用外部 PID 模拟授权；强保证交给平台 supervisor |
| 基本监督 | timed wait、三路流、destroy/force | 已支持相同核心能力 | Java 8 可以保持同一有限状态机 |
| JFR | 标准 `jdk.jfr` 模块 | 标准 Java 8 API 没有该模块 | 发行版特有能力单独检测，不进入 Java 8 编译主线 |
| ThreadMXBean | 仅管理 platform threads | 传统平台线程 | Java 25 不能用它统计 virtual threads 全量 |
| 可观测 API | Boot 4.1.0 / Micrometer 1.17.0 的 Observation、Tracing 组合 | Boot 2.3 Actuator/Micrometer 旧合同 | 分别锁版本与属性，不混用自动配置结论 |
| 管理端点 | enabled/exposed/authorized 分离 | 旧线同样需启用与暴露 | 两线都需要独立认证、授权与网络边界 |

## 易错点

:::pitfalls
### 错误：把用户输入拼入 shell 或依赖 PATH

**现象：** 带空格、引号、分号或换行的输入改变了命令含义，或不同主机启动了不同程序。  

**触发条件：** 将输入拼进 `sh -c`/`cmd /c`，或只用程序短名依赖 PATH 查找。  

**原因：** shell 会再次解释元字符；PATH 和工作目录是可变的宿主状态。  

**后果：** 命令注入、执行替换程序、越权读写或不可复现行为。  

**错误示例：**

```java
new ProcessBuilder("sh", "-c", "convert " + userFile).start();
```

**正确写法：**

```java
new ProcessBuilder(trustedExecutable, "--input", validatedFileName).start();
```

**影响版本：** Java 25/8；具体命令解释还受操作系统影响。  

**验证方式：** 覆盖空格、引号、换行、shell 元字符、恶意 PATH、绝对/相对程序路径和未授权文件。  

**来源：** `jdk25-process-builder`、`jdk8-process-builder`、`cwe-78-os-command-injection`。

### 错误：先等待退出再读取输出

**现象：** 子进程没有退出，父进程永久停在 `waitFor()`。  

**触发条件：** 子进程同时大量写 stdout/stderr，而父进程等待退出后才读取，或只读一路。  

**原因：** 默认 pipe 容量有限；写满后子进程等待读取，父进程又等待子进程结束。  

**后果：** 死锁、线程耗尽、任务 timeout 和残留进程。  

**错误示例：**

```java
process.waitFor();
read(process.getInputStream());
```

**正确写法：**

```java
Future<Capture> stdout = drains.submit(capture(process.getInputStream()));
Future<Capture> stderr = drains.submit(capture(process.getErrorStream()));
boolean exited = process.waitFor(timeout, TimeUnit.SECONDS);
```

**影响版本：** Java 25/8。  

**验证方式：** helper 同时向两路写出超过常见 pipe 容量的数据，断言调用仍在 deadline 内退出。  

**来源：** `jdk25-process`、`jdk8-process`。

### 错误：写完 stdin 但不关闭

**现象：** 子进程已经收到全部内容却一直不处理或不退出。  

**触发条件：** 父进程 flush 后保留 `process.getOutputStream()` 打开。  

**原因：** 读取到 EOF 才结束输入的程序无法从 flush 推断输入已经完成。  

**后果：** 双方长期等待，任务误判 timeout，并触发不必要的强制终止。  

**错误示例：**

```java
process.getOutputStream().write(payload);
process.getOutputStream().flush();
```

**正确写法：**

```java
try (OutputStream input = process.getOutputStream()) {
    input.write(payload);
}
```

**影响版本：** Java 25/8。  

**验证方式：** helper 只在 EOF 后输出完成标记，分别验证正常、写失败、timeout 与取消路径都会关闭。  

**来源：** `jdk25-process`、`jdk8-process`。

### 错误：无界捕获 stdout 与 stderr

**现象：** 外部工具异常刷屏时 heap 或日志存储持续增长。  

**触发条件：** 使用 `readAllBytes()`、无限 `List<String>` 或把每行原样写应用日志。  

**原因：** drain 保证 pipe 推进，但没有为保留量、行长和日志速率提供容量合同。  

**后果：** OOM、GC 抖动、磁盘写满和敏感输出扩散。  

**错误示例：**

```java
byte[] output = readAll(process.getInputStream());
```

**正确写法：**

```java
// 持续读取到 EOF，只保留有限前缀并记录 truncated。
Capture output = captureWithLimit(process.getInputStream(), maxCaptureBytes);
```

**影响版本：** Java 25/8。  

**验证方式：** 输入超过上限的数据，断言保留字节精确有界、`truncated=true` 且 producer 不阻塞。  

**来源：** `jdk25-process`、`jdk8-process`、`spring-boot-410-observability`。

### 错误：不固定 charset 与 locale

**现象：** 同一输出在不同主机乱码，数字、日期或错误文本无法解析。  

**触发条件：** 子进程继承宿主 locale，父进程使用平台默认 charset 解码协议。  

**原因：** 默认编码和 locale 是部署状态，不是工具输出协议。  

**后果：** 结果误判、产物损坏、重试风暴或跨环境差异。  

**错误示例：**

```java
String text = new String(bytes);
```

**正确写法：**

```java
builder.environment().put("LANG", "C");
String text = new String(bytes, Charset.forName("UTF-8"));
```

**影响版本：** Java 25/8；locale 环境名受平台和工具支持范围约束。  

**验证方式：** 在至少两个 locale 下运行，覆盖非 ASCII、换行和协议字段，结果必须一致或明确拒绝。  

**来源：** `jdk25-process-builder`、`jdk8-process-builder`、`jdk25-system`。

### 错误：等待超时后直接返回

**现象：** 调用已经返回 timeout，但外部程序仍占用 CPU、文件和锁。  

**触发条件：** `waitFor(timeout)` 返回 `false` 后立即构造失败结果。  

**原因：** timed wait 只停止等待，不会关闭流、终止或 reap 子进程。  

**后果：** 残留进程、资源泄漏、产物继续被后台修改和后续任务冲突。  

**错误示例：**

```java
if (!process.waitFor(10, TimeUnit.SECONDS)) return timeoutResult();
```

**正确写法：**

```java
if (!process.waitFor(10, TimeUnit.SECONDS)) {
    process.destroy();
    if (!process.waitFor(1, TimeUnit.SECONDS)) process.destroyForcibly();
    process.waitFor(2, TimeUnit.SECONDS);
}
```

**影响版本：** Java 25/8。  

**验证方式：** helper 忽略普通终止，断言进入 force、再次等待并报告最终存活/残留状态。  

**来源：** `jdk25-process`、`jdk8-process`。

### 错误：取消 onExit future 等同取消进程

**现象：** Java future 已取消，但原生进程仍继续运行和写文件。  

**触发条件：** 调用 `process.onExit().cancel(true)` 后不执行进程终止流程。  

**原因：** `onExit()` future 只表示退出通知；取消它不会影响底层进程。  

**后果：** 任务状态与现实不一致，产生孤儿工作和重复发布。  

**错误示例：**

```java
process.onExit().cancel(true);
```

**正确写法：**

```java
process.destroy();
if (!process.waitFor(1, TimeUnit.SECONDS)) process.destroyForcibly();
```

**影响版本：** Java 9+；Java 8 没有 `onExit()`。  

**验证方式：** 取消 future 后先断言 helper 仍存活，再执行终止流程并确认退出。  

**来源：** `jdk25-process-handle`、`jdk25-process`。

### 错误：只杀根 PID 或信任陈旧快照

**现象：** 根进程退出后后代继续运行，或 PID 复用导致控制了无关进程。  

**触发条件：** 只调用根进程 `destroyForcibly()`，或稍后用保存的数字 PID 重新查找并终止。  

**原因：** 进程树会变化，后代可 re-parent，PID 可复用，权限和 OS 终止语义也不同。  

**后果：** 孤儿进程、数据破坏、越权终止和无法证明的清理结果。  

**错误示例：**

```java
ProcessHandle.of(savedPid).ifPresent(ProcessHandle::destroyForcibly);
```

**正确写法：**

```java
// 只从本次 Process handle 出发做 best-effort；强保证交给平台 supervisor。
ProcessHandle root = process.toHandle();
root.descendants().forEach(ProcessHandle::destroy);
root.destroy();
```

**影响版本：** Java 9+；Java 8 需要平台适配器。  

**验证方式：** 覆盖 child/grandchild、忽略终止、re-parent 和权限失败，残留必须成为显式失败字段。  

**来源：** `jdk25-process-handle`、`jdk25-process`。

### 错误：只用退出码判断业务成功

**现象：** 进程返回 0，但产物缺失/损坏；或 stderr 有警告却被误判为失败。  

**触发条件：** `exitCode == 0` 直接发布，或 `stderr.length() > 0` 直接重试。  

**原因：** exit code 和两路输出均由具体程序定义；启动失败、timeout、协议与产物是独立状态。  

**后果：** 发布半成品、重复副作用、无效重试或丢失可用结果。  

**错误示例：**

```java
return process.exitValue() == 0;
```

**正确写法：**

```java
boolean success = exited && exitCode == 0 && protocolValid && artifactValid;
```

**影响版本：** Java 25/8。  

**验证方式：** 覆盖启动失败、0+坏产物、非零已知业务码、stderr warning、timeout 和原子发布失败。  

**来源：** `jdk25-process`、`jdk8-process`。

### 错误：继承并记录整份环境与命令

**现象：** 日志、trace 或子进程环境中出现 token、密码、连接串、内部路径和 JVM 参数。  

**触发条件：** 默认继承所有环境，并记录 `builder.command()`、`System.getenv()` 或 input arguments。  

**原因：** 这些容器按运行需要承载配置，其中常有凭据与个人/基础设施信息。  

**后果：** secret 扩散、最小权限失效、日志注入和审计数据泄漏。  

**错误示例：**

```java
logger.info("command={} env={}", builder.command(), builder.environment());
```

**正确写法：**

```java
logger.info("tool={} result={} truncated={}", toolType, result, truncated);
```

**影响版本：** Java 25/8、所有观测后端。  

**验证方式：** 注入 canary secret 与 CR/LF，扫描 stdout、stderr、日志、tags、trace 和 JFR 均不得出现。  

**来源：** `jdk25-system`、`jdk25-runtime-mxbean`、`spring-boot-410-observability`、`jdk25-jfr-tool`。

### 错误：临时修改 JVM 全局状态后不恢复

**现象：** 请求或测试结果依赖执行顺序，另一个线程读取到错误 locale、factory 或 property。  

**触发条件：** 在库方法、请求或并行测试中调用 `System.setProperty`/`Locale.setDefault`。  

**原因：** 这些值由整个 JVM 共享，不是当前线程或调用栈的局部状态。  

**后果：** 跨请求串扰、解析行为漂移、测试偶发失败和安全配置被覆盖。  

**错误示例：**

```java
System.setProperty("example.mode", requestMode);
```

**正确写法：**

```java
ToolOptions options = new ToolOptions(requestMode);
runner.run(options);
```

**影响版本：** Java 25/8。  

**验证方式：** 并发运行不同配置，并覆盖 property 原先存在/不存在两种恢复路径，最终状态必须精确一致。  

**来源：** `jdk25-system`、`jdk8-system`、冻结 `JAVA-RISK-029`。

### 错误：假定 MXBean 能力、单位与覆盖面一致

**现象：** 指标出现 `-1`、异常或错误换算，并把 platform thread 数误报为全部线程数。  

**触发条件：** 不检查支持/启用状态，混用毫秒、纳秒、字节和计数，或跨 JVM 强求同名值相等。  

**原因：** 部分能力是可选的，数值是采样快照；Java 25 标准 ThreadMXBean 不管理 virtual threads。  

**后果：** 错误告警、错误容量结论，高频 dump/CPU time 还会反向增加负载。  

**错误示例：**

```java
long cpuMillis = threads.getCurrentThreadCpuTime();
```

**正确写法：**

```java
if (threads.isCurrentThreadCpuTimeSupported()) {
    long cpuNanos = threads.getCurrentThreadCpuTime();
}
```

**影响版本：** Java 25/8；virtual-thread 限制适用于 Java 25 标准接口。  

**验证方式：** 在能力启用/禁用和不同 JVM 下验证 unavailable 分支、单位元数据、采样频率与最大成本。  

**来源：** `jdk25-management-factory`、`jdk25-memory-mxbean`、`jdk25-thread-mxbean`、
`jdk8-management-package`。

### 错误：无保护地暴露远程 JMX 或管理端点

**现象：** 不可信网络可以读取 env、heap、线程，甚至调用管理操作。  

**触发条件：** 远程 JMX 关闭认证/TLS，或把敏感 Actuator endpoint 全量暴露且未授权。  

**原因：** enabled、exposed、authenticated、authorized 和 network reachable 是不同条件。  

**后果：** 配置泄漏、远程管理滥用、诊断 DoS 和凭据暴露。  

**错误示例：**

```text
com.sun.management.jmxremote.authenticate=false
com.sun.management.jmxremote.ssl=false
```

**正确写法：**

```text
固定端口与地址 + 管理网络 + TLS + 身份验证 + 最小授权 + 审计
```

**影响版本：** JDK 25/8 JMX；Spring Boot 4.1.0/2.3 管理端点。  

**验证方式：** 覆盖未授权、证书错误、越权 MBean/endpoint、端口扫描、审计与高影响操作限流。  

**来源：** `jdk25-jmx-management-guide`、`spring-boot-410-endpoints`、`spring-boot-410-jmx`、
`spring-boot-2312-actuator`。

### 错误：把高基数字段和单次测量当生产事实

**现象：** meter 序列数量随请求增长，或一次 JMH/JFR 结果被宣布为生产性能提升。  

**触发条件：** 将 request ID、用户、PID、路径作为 metric tag，或缺少基线/上下文就比较单次数字。  

**原因：** 指标 identity 需要有限类别；JFR 是诊断事件，JMH 是隔离微基准，都不代表生产 SLO。  

**后果：** 观测后端成本/OOM、告警噪声、错误优化和不可复现结论。  

**错误示例：**

```java
timer.tag("file", filePath).record(duration);
```

**正确写法：**

```java
timer.tag("tool.type", toolType).tag("result", outcome).record(duration);
```

**影响版本：** 本课核验的 Micrometer 1.17.0、JFR 与 JMH 1.37；具体 API 按锁定依赖核验。  

**验证方式：** 枚举最大 tag 集合并做基数上限检查；性能结论记录 JDK、参数、硬件、负载、误差与生产趋势。  

**来源：** `spring-boot-410-observability`、`spring-boot-410-metrics`、`jdk25-jfr-guide`、`openjdk-jmh`。
:::

## 安全与性能边界

外部工具的程序路径、参数、环境、工作目录、输入、输出、并发、运行时长和产物必须同时受控。参数列表
不是安全沙箱；最小权限账户、只读输入、受控临时目录、文件系统配额和 OS supervisor 才能收束 JVM
之外的权限与资源。禁止把命令、环境、JVM input arguments、stdout/stderr、JFR payload、heap/thread
dump 原样送入日志或外部遥测；诊断文件按敏感数据管理并限制保留、下载和访问审计。

性能值没有通用常量。记录启动等待、queue wait、运行、grace/force/reap、drain、截断和残留数量，并与
最大并发、CPU、heap、FD、临时磁盘和外部工具许可比较。MXBean/JFR/JMX 采样频率、stack depth、事件
阈值与录制保留必须压测；发现问题后再用隔离 JMH 验证一个窄假设，不能从本机单次运行推导生产收益。

## 如何验证

1. 从当前 Markdown 重新提取 `ProcessJvmObservabilityExample`，在 Java 25 与 Java 8 各编译运行两次。
2. 对进程 runner 覆盖双路超 pipe 输出、stdin EOF、capture 边界、charset、退出码和所有流关闭。
3. 覆盖正常退出、timeout、忽略 normal terminate、force、线程中断与 collector 失败，确认再次等待和残留。
4. Java 25 单独覆盖 `ProcessHandle` 的 future cancel、child/grandchild 快照和权限失败；不得降级断言。
5. 对环境与 property 覆盖 canary secret、最小 allowlist、已有/不存在两种恢复和并发串扰。
6. 对 MXBeans 覆盖支持/不支持/未启用、负值、单位、采样时间和 Java 25 virtual-thread 排除说明。
7. 对 JMX/Actuator 覆盖 enable、expose、认证、授权、TLS、管理网和高影响操作预算。
8. 对日志/metrics/traces/JFR 覆盖 success、error、timeout、cancel、context、脱敏、基数和 exporter 失败。
9. 临时源码、class、JFR、日志和截图只放 `/tmp`，验证后删除并确认目标不存在。

:::exercise
### 练习：设计一个受监督的文档转换合同

**要求：** 为一个固定转换器写出 executable、参数 allowlist、工作目录、最小环境、三路 I/O、输出上限、
deadline、normal/grace/force/reap、退出码、原子产物、低基数 outcome 和 shutdown owner。再说明 Java 8
没有 `ProcessHandle` 时，哪一层负责进程树强保证；不要引入未经本课讲解的容器编排实现。

**验收：** 能证明双路输出不会互锁、timeout 后没有被忽略的根进程、secret 不进入子环境或观测数据；
能分别解释退出码 0 但产物损坏、非零业务码、collector 失败和 shutdown 中断的最终状态与 owner。
:::

## 本节小结

- `ProcessBuilder` 的参数列表只表达启动协议；程序、参数、目录、环境和权限仍需分别校验。
- stdin EOF、stdout/stderr 并发 drain、有界 capture、deadline、终止升级和 reap 缺一不可。
- `ProcessHandle` 提供动态快照与通知，不提供跨平台进程树事务；Java 8 需外部 supervisor 补强。
- 环境变量和 System properties 作用域不同；Locale/JAXP 等 JVM 全局状态不应承载请求态。
- MXBeans 是带单位的采样快照，远程 JMX/Actuator 是需认证授权的管理面。
- 日志、metrics、traces、JFR/JMC 与 JMH 各有反馈边界，所有信号都要限制敏感性、基数和成本。
- 启动、readiness、degraded、运行和 shutdown 是不同阶段，外部失败必须有明确策略与 owner。
