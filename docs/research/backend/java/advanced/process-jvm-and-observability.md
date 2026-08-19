# Java 高级第 11 门：外部进程、JVM 环境、JMX 与可观测性研究

> 课程 ID：`backend.java.learn.advanced.process-jvm-and-observability`
>
> 冻结顺序：600
>
> 研究日期：2026-08-13
>
> 冻结快照：`dzzz-app-20260803-179e722831ab`
> 边界：只使用 Phase 2 冻结矩阵/清单和本稿核验的官方资料；不读取、运行或修改 `dzzz-app`。

## 冻结课程合同

- 标题：外部进程、JVM 环境、JMX 与可观测性。
- 阶段：`advanced`，深度：`lesson`，课程顺序：`600`。
- 前置课程：
  1. `backend.java.learn.basics.io-files-and-resource-ownership`。
  2. `backend.java.learn.intermediate.errors-results-and-logging`。
- 来源能力只能覆盖：
  1. `JAVA-STDLIB-018`：`ProcessBuilder`、`Process`、`Runtime.exec` 与外部进程生命周期。
  2. `JAVA-STDLIB-030`：System properties 与运行环境信息。
  3. `JAVA-STDLIB-031`：JMX 与 JVM 指标读取。
  4. `JAVA-RISK-029`：启动关键路径、进程控制与 JVM 全局副作用。
- 选择理由：项目启动外部进程并读取运行环境；课程强调生命周期、全局副作用和可观测验证。
- 冻结来源处置为 `JAVA-STDLIB-018: lesson`，其余三个能力为 `merged`；不得扩张到容器编排、
  通用 Shell 教程、监控平台选型或生产容量规划。
- 冻结状态保持 `researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`。本稿不修改矩阵、课程正文、track、loader、signoff 或测试。

## 研究范围与版本基线

### 现代主线

- Java 25 LTS 是语言、标准库、JMX 和 JFR 示例基线。
- 外部进程以 `ProcessBuilder` 明确表达程序、参数、工作目录、环境和重定向；`Process` 负责三个标准
  流、等待、退出码和终止；Java 9+ 的 `ProcessHandle` 补充 PID、进程信息、子孙快照和退出通知。
- JVM 内部诊断以平台 MXBeans、JFR 录制和 JMC 分析为主；三者不替代应用级日志、指标和追踪。
- Spring Boot 4.1.0、Spring Framework 7.0.8 与 Boot 管理的 Micrometer 1.17.0 用于核验 Actuator、
  Observation 和 Tracing 边界；正文锁定固定版本页，不把后续文档线行为倒推到本课基线。
- JMH 1.37 仅用于隔离、受控的 JVM 微基准，不属于生产观测，不提供生产 SLO、容量或根因证据。

### Legacy 隔离线

- Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE。
- Java 8 已有 `ProcessBuilder`、`Process.waitFor(long, TimeUnit)`、`destroyForcibly()`、System properties、
  环境变量、JMX 与平台 MXBeans；没有 Java 9 才加入的 `ProcessHandle`、`Process.onExit()`、
  `pid()`、`children()`、`descendants()` 和字符 reader/writer 便利 API。
- Java 8 标准 API 没有 Java 11 交付的 `jdk.jfr` 模块。部分 JDK 8 发行版可能提供特定 JFR 能力，
  但正文只能标为发行版相关能力，不能让 Java 8 示例编译依赖 `jdk.jfr`。
- Spring Boot 2.3 Actuator 已使用 Micrometer 管理指标，但不能把 Boot 4.1.0 的统一 Observation、
  Tracing 属性名或自动配置复制到旧线。
- Legacy 只解释读旧项目所需差异，不把 `Runtime.exec`、未受控全局属性或无认证远程 JMX 包装成推荐。

## 外部搜索与直接核验说明

- 按仓库顺位先调用 Tavily 搜索和提取；所有请求均返回套餐用量上限错误，因此 Tavily 本批不可用。
- 随后按固定顺位使用 Exa 发现候选 URL；搜索摘要不作为结论证据。所有来源卡均回到 Oracle、
  OpenJDK、Spring、Micrometer、MITRE 官方固定版本页、tag 或 release 读取并核验。
- 本稿共有 28 个唯一官方直接 URL，每个 URL 只归属一个来源卡；`verifiedAt` 均为 `2026-08-13`。
- Oracle JMC 的一个旧候选深链接无法抓取，已改用可直连的 Release 9 用户指南入口；失败候选不进入
  来源集合。Spring 与 Micrometer 的 rendered-doc 版本路径会重定向到浮动内容，因此本课改用固定 Git tag
  源页；不保留 living documentation 或 GitHub `master` URL。
- 未进入 Parallel 或 Perplexity：Exa 已找到并读取足以支持本课合同的官方直接页。

## 已核验的官方来源卡

### 外部进程与 I/O 生命周期

1. **`jdk25-process-builder`**
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ProcessBuilder.html>。
   - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-13`。
   - `claims`：builder 分别持有程序/参数列表、环境、工作目录与三路标准流重定向；环境初值是当前
     进程环境的副本；`redirectErrorStream(true)` 合并 stderr 到 stdout；builder 非线程安全。
   - `driftRisk: low`：固定 Java 25 API。
2. **`jdk25-process`**
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Process.html>。
   - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-13`。
   - `claims`：父进程必须及时写 stdin、读取 stdout/stderr，否则有限 native pipe 可能阻塞甚至死锁；
     `waitFor(timeout)` 只等待，不终止；进程和流要分别关闭/回收；退出码只能在终止后读取。
   - `driftRisk: low`。
3. **`jdk25-process-handle`**
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ProcessHandle.html>。
   - `sourceType: api-doc`；`appliesTo: Java 25, since Java 9`；`verifiedAt: 2026-08-13`。
   - `claims`：process info、children/descendants 都是异步变化下的快照；PID 可复用；状态检查与操作
     存在竞态；取消 `onExit()` 返回的 future 不会影响原生进程；终止权限和语义受 OS 限制。
   - `driftRisk: low`。
4. **`jdk8-process-builder`**
   - URL：<https://docs.oracle.com/javase/8/docs/api/java/lang/ProcessBuilder.html>。
   - `sourceType: api-doc`；`appliesTo: Java 8`；`verifiedAt: 2026-08-13`。
   - `claims`：Java 8 已支持参数列表、环境副本、工作目录、重定向和 stderr 合并；命令解释仍依赖
     操作系统，不能把任意字符串当成跨平台命令协议。
   - `driftRisk: low`：归档 API。
5. **`jdk8-process`**
   - URL：<https://docs.oracle.com/javase/8/docs/api/java/lang/Process.html>。
   - `sourceType: api-doc`；`appliesTo: Java 8`；`verifiedAt: 2026-08-13`。
   - `claims`：Java 8 同样存在三路 pipe 阻塞/死锁风险，并已有 timed wait 与强制终止；但没有
     `ProcessHandle` 进程树和异步退出 API。
   - `driftRisk: low`：归档 API。

### System properties、环境与 JVM MXBeans

6. **`jdk25-system`**
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/System.html>。
   - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-13`。
   - `claims`：`getenv()` 给出不可修改的当前进程环境视图；`getProperties()` 返回当前全局 properties；
     `setProperty`/`clearProperty` 改变整个 JVM 可见状态，不是请求或线程局部配置。
   - `driftRisk: low`。
7. **`jdk8-system`**
   - URL：<https://docs.oracle.com/javase/8/docs/api/java/lang/System.html>。
   - `sourceType: api-doc`；`appliesTo: Java 8`；`verifiedAt: 2026-08-13`。
   - `claims`：Java 8 已有相同的环境读取与 JVM 全局属性读写边界；legacy 代码也必须恢复临时变更，
     不得枚举并记录整份环境或 properties。
   - `driftRisk: low`：归档 API。
8. **`jdk25-management-factory`**
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.management/java/lang/management/ManagementFactory.html>。
   - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-13`。
   - `claims`：`ManagementFactory` 提供本地平台 MXBeans 和平台 MBeanServer；远程访问通过
     `MBeanServerConnection`/proxy；不同 MXBean 的数量、属性与能力需按运行 JVM 查询。
   - `driftRisk: low`。
9. **`jdk25-runtime-mxbean`**
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.management/java/lang/management/RuntimeMXBean.html>。
   - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-13`。
   - `claims`：提供 JVM 启动时间、uptime、PID、实现版本、输入参数和 system properties 快照；输入
     参数与 properties 可能包含敏感值，不能未经筛选导出。
   - `driftRisk: low`。
10. **`jdk25-memory-mxbean`**
    - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.management/java/lang/management/MemoryMXBean.html>。
    - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-13`。
    - `claims`：heap/non-heap 数值是运行时快照；阈值支持取决于具体 memory pool；内存阈值通知适合
      负载控制，不是从 low-memory 中自愈的保证；调用 `gc()` 也不构成回收承诺。
    - `driftRisk: low`。
11. **`jdk25-thread-mxbean`**
    - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.management/java/lang/management/ThreadMXBean.html>。
    - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-13`。
    - `claims`：CPU time、contention monitoring 与锁信息要先检查支持/启用状态；精度不等于准确度；
      Java 25 标准 `ThreadMXBean` 只管理 platform threads，不覆盖 virtual threads。
    - `driftRisk: low`。
12. **`jdk8-management-package`**
    - URL：<https://docs.oracle.com/javase/8/docs/api/java/lang/management/package-summary.html>。
    - `sourceType: api-doc`；`appliesTo: Java 8`；`verifiedAt: 2026-08-13`。
    - `claims`：Java 8 已能本地或远程访问平台 MXBeans；其接口与属性按 Java 8 归档合同解释，不能
      假定后续 JDK 的默认方法、virtual-thread 语义或 vendor 扩展存在。
    - `driftRisk: low`：归档 API。
13. **`jdk25-jmx-management-guide`**
    - URL：<https://docs.oracle.com/en/java/javase/25/management/monitoring-and-management-using-jmx-technology.html>。
    - `sourceType: official-reference`；`appliesTo: JDK 25 management agent`；
      `verifiedAt: 2026-08-13`。
    - `claims`：本地与远程 JMX 的启用方式不同；远程 JMX 使用 RMI 并需固定/规划端口；生产需认证、
      TLS 与网络收窄，官方建议同时使用客户端证书和密码认证。
    - `driftRisk: low`：固定 JDK 25 指南。

### JFR、JMC 与诊断工具

14. **`jdk25-jfr-package`**
    - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/jdk.jfr/jdk/jfr/package-summary.html>。
    - `sourceType: api-doc`；`appliesTo: Java 25 jdk.jfr`；`verifiedAt: 2026-08-13`。
    - `claims`：JFR 以带时间、持续时间和 payload 的事件记录 JVM/应用行为；可通过阈值、周期和
      stack trace 等设置控制成本；昂贵 payload 应先用 `shouldCommit()` 判断。
    - `driftRisk: low`。
15. **`jdk25-jfr-guide`**
    - URL：<https://docs.oracle.com/en/java/javase/25/jfapi/why-use-jfr-api.html>。
    - `sourceType: official-reference`；`appliesTo: Java 25 Flight Recorder API`；
      `verifiedAt: 2026-08-13`。
    - `claims`：JFR 可关联应用事件、JVM 与 OS 事件做问题后诊断；它比普通日志保留更多执行上下文，
      但不替代业务日志、持续指标、trace 或告警。
    - `driftRisk: low`：固定 Java 25 指南。
16. **`openjdk-jep-328`**
    - URL：<https://openjdk.org/jeps/328>。
    - `sourceType: release-note`；`appliesTo: JDK 11 delivery of JFR`；`verifiedAt: 2026-08-13`。
    - `claims`：标准 `jdk.jfr`/`jdk.management.jfr` 模块在 JDK 11 交付；JEP 的低开销目标和基准仅是
      该交付的目标，不是任意自定义事件、任意配置、任意生产负载都低于固定百分比的承诺。
    - `driftRisk: low`：已交付 JEP。
17. **`jdk25-jcmd`**
    - URL：<https://docs.oracle.com/en/java/javase/25/docs/specs/man/jcmd.html>。
    - `sourceType: official-reference`；`appliesTo: JDK 25 tool`；`verifiedAt: 2026-08-13`。
    - `claims`：`jcmd` 要在目标 JVM 所在机器、相同有效用户/组下运行；不同诊断命令有不同影响；
      容器内 PID/可见性需要单独处理，不能以宿主机列表猜目标。
    - `driftRisk: low`。
18. **`jdk25-jfr-tool`**
    - URL：<https://docs.oracle.com/en/java/javase/25/docs/specs/man/jfr.html>。
    - `sourceType: official-reference`；`appliesTo: JDK 25 tool`；`verifiedAt: 2026-08-13`。
    - `claims`：`jfr` 可查看、过滤、汇总和 scrub 录制文件；录制内容仍可能携带类名、线程、参数或
      业务事件 payload，离开受控环境前必须执行数据分类和脱敏。
    - `driftRisk: low`。
19. **`jmc9-user-guide`**
    - URL：<https://docs.oracle.com/en/java/java-components/jdk-mission-control/9/user-guide/jdk-mission-control.html>。
    - `sourceType: official-reference`；`appliesTo: JDK Mission Control 9`；
      `verifiedAt: 2026-08-13`。
    - `claims`：JMC 是生产时 profiling/diagnostics 工具，可分析 JFR；JMC 不属于常规 JDK 安装，工具
      版本、目标 JDK 支持和部署访问仍需单独核验。
    - `driftRisk: low`：固定 Release 9 用户指南。

### Spring Boot、Micrometer 与进程安全

20. **`spring-boot-410-observability`**
    - URL：<https://github.com/spring-projects/spring-boot/blob/v4.1.0/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/observability.adoc>。
    - `sourceType: official-reference`；`appliesTo: Spring Boot 4.1.0`；
      `verifiedAt: 2026-08-13`。
    - `claims`：Boot 以日志、指标、trace 描述可观测性，指标和 trace 使用 Micrometer Observation；
      low-cardinality key 同时进入指标和 trace，high-cardinality key 只进入 trace；异步/reactive context
      传播需要显式配置；Boot 的 OpenTelemetry 支持不等于所有 OTel signal 自动导出。
    - `driftRisk: low`：固定 Spring Boot 4.1.0 页面。
21. **`spring-boot-410-metrics`**
    - URL：<https://github.com/spring-projects/spring-boot/blob/v4.1.0/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/metrics.adoc>。
    - `sourceType: official-reference`；`appliesTo: Spring Boot 4.1.0`；
      `verifiedAt: 2026-08-13`。
    - `claims`：Actuator 对 Micrometer registry 做依赖管理和自动配置；metrics endpoint 用于诊断且
      需要暴露；registry、export、common tags 与 meter filters 是配置合同，不是“加依赖即生产就绪”。
    - `driftRisk: low`：固定 Spring Boot 4.1.0 页面。
22. **`spring-boot-410-tracing`**
    - URL：<https://github.com/spring-projects/spring-boot/blob/v4.1.0/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/tracing.adoc>。
    - `sourceType: official-reference`；`appliesTo: Spring Boot 4.1.0`；
      `verifiedAt: 2026-08-13`。
    - `claims`：Boot 提供 OpenTelemetry/OTLP 等 tracing 组合；采样会丢弃一部分 trace，默认或示例值
      不能外推为业务策略；propagation、export endpoint、limits 与失败可见性都需验证。
    - `driftRisk: low`：固定 Spring Boot 4.1.0 页面。
23. **`spring-boot-410-endpoints`**
    - URL：<https://github.com/spring-projects/spring-boot/blob/v4.1.0/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/endpoints.adoc>。
    - `sourceType: official-reference`；`appliesTo: Spring Boot 4.1.0`；
      `verifiedAt: 2026-08-13`。
    - `claims`：endpoint 的 enabled、exposed 与访问授权是不同条件；heap dump、env、configprops、
      loggers、threaddump 等会暴露敏感或高影响能力，必须按最小集合、独立管理网络和认证授权处理。
    - `driftRisk: low`：固定 Spring Boot 4.1.0 页面。
24. **`spring-boot-410-jmx`**
    - URL：<https://github.com/spring-projects/spring-boot/blob/v4.1.0/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/jmx.adoc>。
    - `sourceType: official-reference`；`appliesTo: Spring Boot 4.1.0`；
      `verifiedAt: 2026-08-13`。
    - `claims`：Spring JMX 默认未启用；启用后可暴露标注的 managed resource 和 Actuator MBeans；
      MBeanServer 选择、ObjectName 与远程 connector 的安全仍是部署合同。
    - `driftRisk: low`：固定 Spring Boot 4.1.0 页面。
25. **`micrometer-observation-components`**
    - URL：<https://github.com/micrometer-metrics/micrometer/blob/v1.17.0/docs/modules/ROOT/pages/observation/components.adoc>。
    - `sourceType: official-reference`；`appliesTo: Micrometer 1.17.0`；
      `verifiedAt: 2026-08-13`。
    - `claims`：一个 Observation 经 registry、context、convention、predicate、handler、filter 生命周期
      产生不同 signal；必须在所有 success/error/cancel 分支停止 scope/observation，且控制 tag 基数。
    - `driftRisk: low`：固定 Micrometer 1.17 文档线；Boot 4.1.0 依赖清单锁定 1.17.0。
26. **`cwe-78-os-command-injection`**
    - URL：<https://cwe.mitre.org/data/definitions/78.html>。
    - `sourceType: official-reference`；`appliesTo: CWE-78`；`verifiedAt: 2026-08-13`。
    - `claims`：未正确限制进入 OS 命令的特殊元素会改变预期命令；优先使用不调用 shell 的结构化 API，
      并以固定程序和允许列表约束输入，而不是尝试枚举危险字符。
    - `driftRisk: low`：固定 CWE 条目；页面可能补充示例，但弱点定义与最小缓解方向稳定。
27. **`spring-boot-2312-actuator`**
    - URL：<https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/production-ready-features.html>。
    - `sourceType: official-reference`；`appliesTo: Spring Boot 2.3.12.RELEASE`；
      `verifiedAt: 2026-08-13`。
    - `claims`：legacy Actuator 已提供 HTTP/JMX endpoints、health 与 Micrometer metrics；endpoint 必须
      同时 enabled/exposed 才可用；旧线属性、endpoint 名称和 tracing 生态按 2.3 文档独立处理。
    - `driftRisk: low`：固定归档版本。

### JMH 的隔离边界

28. **`openjdk-jmh`**
    - URL：<https://github.com/openjdk/jmh/releases/tag/1.37>。
    - `sourceType: engineering-reference`；`appliesTo: JMH 1.37`；
      `verifiedAt: 2026-08-13`。
    - `claims`：JMH 是 JVM nano/micro/milli/macro benchmark harness；官方建议独立 Maven benchmark
      工程、命令行、生成代码、fork 和样例审查；IDE/同进程结果更难可靠。它不采集生产遥测。
    - `driftRisk: low`：固定 JMH 1.37 release；实际基准仍须保存完整参数。

## 本课结论与正文建议

### 1. 外部进程是受监督资源，不是一次方法调用

- 把一次调用建模为 `admit -> start -> exchange I/O -> await -> terminate if needed -> reap -> publish result`。
  每一步都必须有 owner、deadline、最终状态和可观察结果。
- `ProcessBuilder` 的 command list 第一项是程序，其余是参数；不要先拼成含引号的整串再交给 shell。
  直接执行仍不是安全边界：程序路径、参数、工作目录和环境都必须来自受控策略。
- 使用绝对、受信程序路径或受控安装目录，验证工作目录存在且权限符合预期。不要依赖 PATH、当前目录、
  用户 shell profile 或宿主默认 locale 形成隐式协议。
- `start()` 成功只表示 OS 接受创建，不表示程序已就绪、输出有效或业务成功。业务结果同时检查启动
  异常、deadline、退出原因、退出码、受限 stdout/stderr 和预期产物。

### 2. stdin/stdout/stderr 必须并行推进且有容量上限

- 子进程可能同时写 stdout/stderr 并等待 stdin EOF。父进程只读取一路或先 `waitFor()`，另一 pipe
  填满后可形成死锁。需要保留两路语义时并发 drain；无需区分时在启动前合并/重定向。
- 写完输入后 flush 并关闭子进程 stdin，用 EOF 明确结束协议。超时或取消时也关闭三路流，让阻塞的
  I/O 任务得到终止信号；流关闭不等于原生进程一定结束。
- 内存 capture 使用每路字节/行数上限和截断标志，持续落盘则使用受控文件、轮转、权限和清理策略。
  不能 `readAllBytes()` 吞下不可信输出，也不能把 stdout/stderr 原文无条件写应用日志。
- 显式指定字符集和协议；locale、换行与编码属于子进程合同。exit code 是程序定义的有限状态，不把
  任意非零统一重试，也不把 0 当作产物完整性的唯一证明。

### 3. timeout、取消与进程树要分层收束

- `waitFor(timeout)` 返回 `false` 只说明等待超时，不会自动 terminate；取消 `onExit` future 同样不
  影响进程。超时处理必须显式进入 `TIMED_OUT`，先请求正常终止，等待有限 grace，再强制终止。
- `destroy()` 是否为正常终止依赖实现；`destroyForcibly()` 也需再次等待并确认最终状态。所有等待都
  响应线程中断，恢复 interrupt flag，并把“调用者取消”和“子进程失败”分开记录。
- Java 25 可从本次 `Process` 的 handle 获取 children/descendants 快照，但进程树会并发变化、PID 会
  复用，单次枚举不保证覆盖 daemon/re-parent/双 fork 后代。不要根据外部 PID 字符串无条件 kill。
- 对必须无孤儿的生产工作负载，优先交给具有 process group/job object/cgroup/container 生命周期的
  supervisor；纯 JDK 示例只证明 best-effort 收束并诚实记录残留。

### 4. System properties 与环境变量属于不同配置域

- `System.getenv()` 读取当前 JVM 的宿主环境；`ProcessBuilder.environment()` 是为新子进程准备的可变
  副本。清空后建立 allowlist 才是最小继承，不能把当前进程的全部 secret 自动透传。
- System properties 在 JVM 内全局共享。库代码、请求处理和并行测试不要用 `setProperty` 传请求态；
  必须临时修改时保存“原值/原先不存在”状态，并在 `finally` 精确恢复。
- 只按 allowlist 读取/导出非敏感配置。环境、properties、JVM input arguments、完整命令行和工作目录
  都可能包含 token、密码、内部路径或个人数据，日志、metrics label、trace attribute 和 JFR payload
  默认不得收录原值。
- 配置来源要记录来源类别和是否存在，不记录 secret 值；启动时冻结不可变应用配置，运行中变更走
  显式配置组件和审计，不让任意调用方修改 JVM 全局状态。

### 5. JMX/MXBeans 是采样与管理接口，不是常量真相

- `RuntimeMXBean`、`MemoryMXBean`、`ThreadMXBean` 的值是观测时快照。先检查 `is*Supported` 和
  `is*Enabled`，再读取；明确单位、采样时刻、JVM 实现和池/收集器名称。
- heap used/max、线程数、CPU time、GC 数等不能单点判故障。使用时间序列、速率、分位数与工作负载
  上下文；JMX 与 Micrometer 对同一概念的命名/采样窗口不同，不逐值强求相等。
- 采集 thread dump、锁信息、heap dump 或高频 CPU time 有成本；频率、stack depth、并发和最大响应
  需受控。Java 25 的标准 `ThreadMXBean` 不覆盖 virtual threads，不能据此宣称总线程全量。
- 本地平台 MBeanServer 不等于已安全开放远程管理。远程 JMX 收窄地址和端口，使用认证、TLS、最小
  权限与网络控制；禁止 `authenticate=false`/`ssl=false` 暴露到不可信网络。

### 6. JFR/JMC、应用遥测与 JMH 各自回答不同问题

- 日志说明离散事件，metrics 说明聚合趋势和告警，traces 说明请求因果路径，JFR 说明 JVM/OS/应用
  事件上下文，JMC 分析录制。正文用同一 `operation/result/reason` 词汇相关联，但不互相冒充。
- 自定义 Observation/JFR event 只记录稳定、低敏字段。metrics tag 保持低基数；userId、requestId、
  文件路径、完整 command 等不进入 meter identity。高基数 trace 字段仍受采样、成本和隐私约束。
- `Observation` 必须在 success/error/cancel/timeout 全部停止并记录类型化 outcome；异步 executor、
  reactive pipeline 和外部进程 drain 线程的 context propagation 需要显式验证，不能假定 ThreadLocal
  自动跨越。
- JFR 以生产诊断配置运行时要固定 event settings、阈值、stack trace、文件大小/时长/保留和访问权限；
  JMC 是分析工具，不把 GUI 截图当成可复查的生产指标基线。
- JMH 在隔离工程中用 warmup、measurement、fork、明确 state 和结果消费验证一个窄性能假设；记录
  JDK、JMH、JVM 参数、硬件、负载和误差。生产 latency/throughput 回归先由真实遥测/JFR 定位，JMH
  只能验证缩小后的微观假设，不能证明生产更快。

## `JAVA-RISK-029` 六类风险合同

以下六类风险必须进入正文，每类按“触发条件 -> 后果 -> 控制 -> 验证”说明；不得只列 API：

| 风险类 | 触发条件 | 主要后果 | 正文最小控制与验证 |
| --- | --- | --- | --- |
| 1. 启动关键路径阻塞 | 在 Spring 初始化、单线程 scheduler 或请求线程同步启动慢/不可用程序，无 admission/deadline | 应用启动卡死、readiness 虚假、线程池耗尽、重启风暴 | 将必需/可选任务分级；异步不等于无界；验证 program absent、permission denied、慢启动、启动后未 ready |
| 2. 三路 I/O 死锁与资源泄漏 | 先 wait、只 drain stdout、stdin 不关闭、输出无界、异常路径不关 stream | pipe 填满互等、FD/handle/线程/磁盘/堆耗尽、日志泄密 | 同时 drain 或显式 redirect；输入 EOF；每路上限；验证双路超 pipe 容量、截断、close-on-all-outcomes |
| 3. timeout/取消/进程树失控 | 把 timed wait/future cancel 当 kill，只终止根进程，强杀后不 reap | orphan/daemon 继续占 CPU/文件，PID 复用误杀，任务状态与真实进程不一致 | grace + force + 再等待；只控制本次 handle；记录残留；验证 child/grandchild、忽略 TERM、调用线程中断 |
| 4. 命令、参数、环境与工作目录越界 | 拼 shell 字符串、用户选择 executable、继承 PATH/secret、可写工作目录 | 命令注入、执行替换程序、秘密外泄、输出/产物写错位置 | 避免 shell；程序/参数/目录 allowlist；最小环境；验证空格/引号/换行、恶意 PATH、symlink/无权限目录 |
| 5. JVM 全局状态污染 | 请求/测试用 `System.setProperty`，并发覆盖、不恢复；全量记录 env/properties/input args | 跨请求串扰、测试顺序依赖、启动行为漂移、凭据泄漏 | 不可变配置快照；必要时 finally 恢复；allowlist/redaction；并发与原值不存在两种恢复测试 |
| 6. 观测与管理面反成风险 | 远程 JMX/Actuator 过度暴露，高频 dump，tag 高基数，trace/JFR 写入敏感 payload | 未授权管理、信息泄露、遥测成本/OOM、诊断反向拖垮应用 | 最小 endpoint/MBean、认证/TLS/管理网、采样/预算/基数和保留；验证未授权、限流、脱敏、backend 失败 |

## 冻结项目证据映射

以下只转录 Phase 2 冻结矩阵中的路径、稳定符号、计数与 evidence policy；未打开项目路径，也不从
类名推断实现。4 条 `observed` 只证明课程主题在项目中出现，5 条 `rejected` 只作为风险纠正入口。

| sourceId | 冻结计数 | 冻结路径与稳定符号 | usage | 仅能支持的教学结论 |
| --- | ---: | --- | --- | --- |
| `JAVA-STDLIB-018` | 3 | `dzzz-app/src/main/java/com/tdh/bdzz/util/SystemMonitorUtil.java`；`com.tdh.bdzz.util.SystemMonitorUtil` | `observed` | 存在外部进程/监测候选，不证明流、timeout 或进程树正确 |
| `JAVA-STDLIB-018` | 3 | `dzzz-app/src/main/java/com/tdh/bdzz/util/ConvertPdf.java`；`com.tdh.bdzz.util.ConvertPdf` | `observed` | 存在转换进程候选，不证明命令与文件安全 |
| `JAVA-STDLIB-018` | 3 | `dzzz-app/src/main/java/com/tdh/bdzz/util/PptUtil.java`；`com.tdh.bdzz.util.PptUtil` | `observed` | 存在演示文档处理候选，不证明退出码/产物协议 |
| `JAVA-STDLIB-030` / `JAVA-STDLIB-031` | 1 / 1 | `dzzz-app/src/main/java/com/tdh/bdzz/config/AppStarter.java`；`com.tdh.bdzz.config.AppStarter`，以及冻结矩阵中复用的 `SystemMonitorUtil` JMX 候选 | `observed` | 只证明环境/JVM 指标读取面存在；不证明全局副作用或远程暴露安全 |
| `JAVA-RISK-029` | 23 | `dzzz-app/src/main/java/com/tdh/bdzz/cache/DzzzDxpzCacheLoader.java`；`com.tdh.bdzz.cache.DzzzDxpzCacheLoader` | `rejected` | 启动/加载候选只提示关键路径风险，不复制实现 |
| `JAVA-RISK-029` | 23 | `dzzz-app/src/main/java/com/tdh/bdzz/config/AppStarter.java`；`com.tdh.bdzz.config.AppStarter` | `rejected` | 全局配置/启动候选只提示副作用，不作为推荐 owner |
| `JAVA-RISK-029` | 23 | `dzzz-app/src/main/java/com/tdh/bdzz/context/InitializeYjbjWord.java`；`com.tdh.bdzz.context.InitializeYjbjWord` | `rejected` | 初始化候选只提示 readiness/失败隔离风险 |
| `JAVA-RISK-029` | 23 | `dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/hyJzDataSync/HyJzDataSyncHandler.java`；`com.tdh.bdzz.timer.handler.hyJzDataSync.HyJzDataSyncHandler` | `rejected` | 调度候选只提示阻塞、取消和重入风险 |
| `JAVA-RISK-029` | 23 | `dzzz-app/src/main/java/com/tdh/bdzz/util/SystemMonitorUtil.java`；`com.tdh.bdzz.util.SystemMonitorUtil` | `rejected` | 进程/JMX 候选只提示管理面与资源风险，不复制实现 |

## 不能推出与不得声称

- 不能由 `ProcessBuilder(List<String>)` 推出命令安全；它减少 shell parsing，并不验证 executable、参数、
  环境、PATH、工作目录、文件或业务权限。
- 不能由 `waitFor(timeout)` 返回、`destroyForcibly()` 已调用或根进程退出推出全部后代已停止、FD 已
  释放或产物可发布。
- 不能由并发读取 stdout/stderr 推出内存有界、编码正确、日志已脱敏或不会泄漏 secret。
- 不能由 exit code 0 推出业务成功，也不能把所有非零码统一映射为可重试系统错误。
- 不能由 `System.getenv`/`getProperties` 可读推出适合完整导出；不能把 `setProperty` 当线程局部配置。
- 不能由 MXBean 数值推出精确实时全景；不能用 Java 25 `ThreadMXBean` 证明 virtual-thread 数量或状态。
- 不能由 JMX 本地可用推出远程安全；不能由 Actuator endpoint enabled 推出 exposed 或 authorized。
- 不能由 Micrometer 或 tracing 依赖存在推出所有路径已观测、上下文已传播、export 成功或 tag 基数受控。
- 不能由一次 JFR/JMC 分析推出永久容量阈值；不能把 JFR 的设计开销目标写成任意配置的固定上限。
- 不能由 JMH 分数推出生产吞吐、尾延迟、资源成本或用户体验；JMH 不能混入生产观测章节作为 signal。
- 不能把 Java 25 `ProcessHandle`/JFR、Boot 4.1.0 Observation/Tracing 属性复制到 Java 8 / Boot 2.3。

## 易错点取证合同

正文至少覆盖以下 14 个可观察错误，每项按“现象 -> 触发条件 -> 原因 -> 后果 -> 错误示例 ->
正确写法 -> 影响版本 -> 验证方式 -> 来源”组织：

1. 把用户输入拼入 `sh -c`/`cmd /c`，或依赖 PATH 选择程序。
2. 先 `waitFor()` 再读取输出，或只读取 stdout 导致 stderr pipe 填满。
3. 写完 stdin 不关闭，子进程永久等待 EOF。
4. `readAllBytes()`/无限行列表捕获输出，导致 heap 或日志存储失控。
5. 未固定 charset/locale，解析在不同主机产生不同结果。
6. timed wait 超时后直接返回，不关闭流、不终止、不 reap。
7. 取消 `onExit()` future 后误以为原生进程已取消。
8. 只 kill 根 PID，或用陈旧 PID/单次 descendants 快照误控制其他进程。
9. 只看 exit code，忽略启动失败、stderr 分类、产物原子发布和协议校验。
10. 子进程继承整份环境与 secret，或把 command/env/input arguments 写日志。
11. 请求/并行测试修改 System property 后不恢复，造成顺序依赖。
12. 不检查 MXBean 能力与单位，高频 dump/CPU time 反向放大负载。
13. 远程 JMX/Actuator 暴露过宽或关闭认证/TLS，泄漏配置、heap、线程与管理操作。
14. 将 request/user/file path 设为 metrics tag，或用 JMH/JFR 单次结果宣称生产性能提升。

## Java 临时验证设计

所有验证资产放在 `/tmp` 的 `mktemp` 目录，成功后删除目录并以 `test ! -e` 确认不存在；不向仓库
添加测试文件、fixture、JMH module、JFR 或日志产物。

1. Java 25 进程 runner：临时 helper 同时向 stdout/stderr 写入超过常见 pipe 容量的数据，读取 stdin
   到 EOF 后以脚本化退出码结束；验证两路并发 drain、每路 capture 上限、截断标志、charset、EOF、
   exit code 与所有流关闭。
2. Java 25 timeout runner：覆盖正常结束、超时后 normal/grace/force、忽略 normal termination、
   child/grandchild、调用线程中断和 `onExit` future cancel；只断言 JDK 可证明的 handle 状态，对残留
   以显式 `residualProcess=true` 报告，不伪造“整树必然终止”。
3. Java 8 runner：使用同一 helper 验证双路 drain、timed wait、`destroy`/`destroyForcibly` 和退出码；
   编译期禁止引用 `ProcessHandle`、`onExit`、`pid`、`inputReader` 或 `jdk.jfr`。
4. 配置 runner：并发读取固定 property，临时覆盖“已有值”和“原先不存在”两种情况并 finally 恢复；
   `ProcessBuilder.environment().clear()` 后只加入 allowlist，输出只展示 key 与 presence/redacted 状态。
5. MXBean runner：读取 runtime uptime/PID、heap/non-heap 和 thread count；对 CPU/contended/threshold 先
   检查 support/enabled；记录单位和采样时间，Java 25 明确不把结果称为 virtual-thread 全量。
6. Java 25 JFR runner：创建低敏自定义事件，覆盖 `shouldCommit`、threshold、success/error/timeout，
   写入受限临时 `.jfr` 并用 `jfr summary/print` 验证；输出不含命令原文、secret、用户标识或绝对路径。
7. 观测 fake：用内存 `ObservationRegistry`/handler 验证 operation 在 success/error/cancel/timeout 均
   stop 一次，low-cardinality outcome 有限，高基数字段不成为 meter tag；不连接真实 collector。
8. JMH 仅作可选隔离验证：在临时独立 Maven 项目锁定版本，包含 warmup、measurement、fork、baseline
   与结果消费，记录完整环境；结果标题必须为“微基准”，不得作为本课生产观测验收条件。
9. Java 25 与 Java 8 核心 runner 各连续运行两次，验证无残留进程、线程、临时文件和 secret 输出；
   若 OS 无法保证后代收束，测试必须报告平台边界而不是降低断言或跳过 Gate。

研究阶段只设计这些反馈环，不创建或运行 runner、JMH、JFR、Spring context、浏览器或 `dzzz-app`。

## 课程结构与发布 Gate

### 正文建议顺序

1. 从一次外部命令为何不是普通方法调用切入，建立 supervisor 状态机。
2. 分别解释 program/arguments、环境、工作目录和 stdin/stdout/stderr 方向。
3. 用会写双路输出并等待 EOF 的 helper 展示死锁，再改为并发 drain + 有界 capture。
4. 加入 deadline、interrupt、normal/grace/force、退出码与产物发布合同。
5. 现代线补充 `ProcessHandle` 快照/PID 复用/后代边界，legacy 线展示没有进程树 API 的隔离策略。
6. 区分环境变量、System properties 与不可变应用配置，演示精确恢复全局属性。
7. 从本地 MXBeans 进入 JMX，再说明远程 connector 与 Actuator 管理面的安全边界。
8. 按 logs -> metrics -> traces -> JFR/JMC 说明互补信号、context、基数、采样、脱敏和成本。
9. 最后用独立小节隔离 JMH：只验证微观性能假设，不加入“三大支柱”或生产监控流程。

### 发布前必须通过

- [x] ID、标题、顺序 600、两个前置、四个来源能力、选择理由和 planned/not-started 状态已核对。
- [x] 28 个唯一官方 URL 均有来源卡，记录 `claims`、`appliesTo`、`driftRisk`、`verifiedAt`。
- [x] 覆盖 ProcessBuilder/Process/ProcessHandle、三路 I/O 与死锁、命令/参数/环境/目录安全、timeout、
  取消、进程树、退出码、System properties/env 全局副作用、JMX/MXBeans、JFR/JMC。
- [x] 覆盖 Spring Boot 4.1.0 / Micrometer 1.17.0 的 Actuator/Observation/Tracing 与 Boot 2.3
  legacy 边界；JMH 1.37 明确不是
  生产观测。
- [x] `JAVA-RISK-029` 已拆成六类可验证风险；正文必须覆盖/不得声称与 14 个易错点已冻结。
- [x] 项目证据转录 Phase 2 冻结矩阵的 4 条 observed、5 条 rejected；rejected 只留在本研究审计记录，
  不进入课程正文；未读取、运行或修改 `dzzz-app`。
- [x] Java 25/8、JFR、Observation 和可选 JMH 的临时验证设计只在 `/tmp`，本批没有创建测试资产。
- [x] 正文已锁定 Spring Boot 4.1.0、Spring Framework 7.0.8、Micrometer 1.17.0 与 JMH 1.37；
  独立 OTel starter 结论已移除，所有原 high-drift URL 已改为固定页或稳定 CWE 条目。
- [x] 正文 frontmatter 来源卡仅保留实际支撑正文结论的直接页，不复制搜索说明或本稿目录。
- [x] 正文完成后运行 Java 25/8 临时反馈环、内容合同、Catalog 三次冷启动、Phase 2 validator、根质量
  Gate、build、桌面/390px 浏览器验收与独立双轴复审。

## 研究 Gate 自检

- [x] 本文件是本批唯一新增文件；未修改正文、track、loader、manifest、signoff、依赖或测试。
- [x] Tavily 用量上限和 Exa 后备边界已记录；所有最终证据均来自官方直接页。
- [x] 现代 Java 25 主线和 Java 8 / Boot 2.3 legacy 线已隔离，未把发行版特有 JFR 当 Java 8 标准 API。
- [x] 进程安全、全局状态、管理面暴露、敏感 telemetry、观测成本与基数均有明确 negative contract。
- [x] 行数、Prettier、唯一 URL、scoped diff 和 SHA-256 由写入后的外部命令核验，不在本文写自引用哈希。

## 发布结论与 Stop Boundary

本文件只完成 Java 高级第 11 门课程的官方资料研究。研究稿通过格式、URL、冻结映射、行数、SHA 和
唯一文件差异核验后，主流程才可进入本课正文 Gate；本任务不授权正文、track/loader/manifest、测试、
浏览器、signoff、下一课、commit、stage 或 push。
