# Java 基础、中级、高级课程覆盖审计

> 审计日期：2026-08-14
> 审计对象：当前仓库 Java 基础 18 课、中级 17 课、高级 16 课，共 51 课
> 审计范围：Java 后端开发者的语言与核心库、初学者学习路径、企业实战与生产工程
> 外部证据：22 个唯一官方直接 URL；Tavily 只用于候选发现，结论均回到官方原文核验
> 边界：只读 `backend-java-track.ts` 与 51 篇当前课程正文；未读取或搜索 `dzzz-app`

## 1. 结论先行

不能声称当前 51 课“包含 Java 的全部知识点”。Java SE 本身包含大量模块，后端生态还包含多种数据库、
消息系统、身份协议、容器平台和交付方式；“全部 Java”既不是可验证的有限分母，也不是初学者应追求的
课程目标。

在“Java 后端主线”这个有限范围内，当前课程质量和广度已经较高：

- **Java 语言与常用核心库：总体充分。** 运行过程、语法、对象模型、异常、泛型、文本、集合、空值、
  日期时间、I/O、Lambda/Stream、并发、反射、HTTP Client、进程和 JVM 观测均已有课程。
- **常规 Spring Web 后端开发：总体充分。** HTTP/JSON/SQL/JDBC、分层、错误与日志、JUnit/Mockito、
  Spring Boot、依赖注入、MVC/Servlet、校验、MyBatis、事务、缓存、认证授权和输入安全已形成连续主线。
- **初学者路径：知识主体充分，但“如何调试、如何查 API、如何把多课串成一个可运行项目”仍偏弱。**
- **生产实战：明显未闭环。** 真实依赖集成测试、版本化数据库迁移、应用镜像与容器运行、自动化交付，
  以及健康探针与优雅停机的可部署反馈环没有独立主线；消息代理也尚未进入课程。

因此建议保留现有 51 课，不做大规模重排；先补 4 个 P0 实战闭环，再补少量 P1 扩展。JPMS、JPA、
Gradle、Reactive、gRPC 等放入 P2 可选分支，不应阻塞初学者主线。

## 2. 审计方法与当前事实

### 2.1 当前仓库事实

`src/categories/backend/java/core/backend-java-track.ts` 当前列出：

| 阶段 | 课程数 | 当前状态 | “零基础知识点详解”三级标题数 |
| --- | ---: | --- | ---: |
| 基础 | 18 | 18 个 `available` | 91 |
| 中级 | 17 | 17 个 `available` | 278 |
| 高级 | 16 | 16 个 `available` | 229 |
| 合计 | 51 | 51 个 `available` | 598 |

数量只能证明正文规模，不能证明学习效果或覆盖全部 Java。覆盖判断同时读取了每篇正文的标题、学习目标和
“零基础知识点详解”，并用精确文本搜索检查候选缺口。

### 2.2 外部对照方法

外部对照只采用一手官方资料：Oracle/Java 官方学习入口、JLS/JDK API，Apache Maven、JUnit、Spring、
Testcontainers、Docker、Kubernetes 与 Jakarta 规范。官方 Java 学习入口本身覆盖语言基础、类、records、
泛型、集合和 Stream 等不同层次，说明课程应建立一条有限的后端路径，而不应把 Java SE API 索引中的每个
模块都变成必修课。[S1][S2][S3]

优先级定义：

- **P0**：不补就无法形成从学习到可交付后端服务的最小闭环。
- **P1**：多数企业后端会遇到，应在主线完成后继续学习。
- **P2**：按技术栈选择；不纳入通用主线也不构成缺陷。

## 3. 当前 51 课盘点

以下按 live track 顺序列出，避免以旧计划或文件名排序代替当前课程路径。

### 3.1 基础 18 课

1. 开发环境、JDK 与 Java 运行过程
2. 包、import 与源码目录
3. 变量、类型、赋值与运算符
4. 条件、switch 与循环控制
5. 方法、参数、返回值、作用域与值传递
6. 数组、可变参数与索引边界
7. 类、对象、构造过程、封装与不可变性
8. 接口、继承、抽象类型与多态
9. 枚举与有限值建模
10. 注解、元注解与运行时元数据
11. 异常层级、传播、捕获与 cause 链
12. 泛型、类型边界与类型安全
13. 字符串、字符编码、正则与 Base64
14. Collection、List、Set、Map 与迭代合同
15. null、Optional、缺失与失败语义
16. 日期时间、时区与 legacy Date 映射
17. I/O、文件系统、资源所有权与关闭
18. Maven 坐标、依赖、生命周期与多模块结构

### 3.2 中级 17 课

1. Lambda、方法引用、Stream 与 Collectors
2. 标识符、相等性、排序与分页参数
3. JSON、对象映射与外部数据合同
4. HTTP、URI、请求响应与 URL 编码基础
5. 关系数据、SQL 与事务基础
6. 分层架构、DTO 与业务编排边界
7. 错误合同、结果对象与结构化日志
8. 最小反馈环、JUnit 与 Mockito
9. Spring Boot 启动、自动配置与配置建模
10. IoC、构造器注入与 Bean 生命周期
11. Spring MVC、Servlet 与 API 合同
12. Bean Validation、参数绑定与输入合同
13. MyBatis、Mapper XML 与 MyBatis-Plus
14. 事务边界、幂等与失败回退
15. Lombok、可变模型与生成合同
16. 策略、模板方法、适配器与回调
17. 领域值对象、树结构与对象映射

### 3.3 高级 16 课

1. 反射、Spring AOP 与横切合同
2. 线程池、并发集合、锁与共享状态
3. ThreadLocal、请求上下文传播与清理
4. 事件、异步执行、调度与重试
5. 进程内缓存、Redis、失效与一致性
6. WebSocket 会话、广播、心跳与回收
7. 分片、动态 SQL 与数据访问边界
8. HTTP 客户端、超时、资源生命周期与集成韧性
9. 文件上传、存储、下载与归档安全边界
10. 随机访问、压缩、图像与流式背压
11. 外部进程、JVM 环境、JMX 与可观测性
12. 认证、授权、资源边界与 JWT
13. 密码学 API、秘密管理、签名与许可证校验
14. 输入安全、过滤链、CORS 与 API 暴露边界
15. 责任链、注册表、工厂与状态机
16. Legacy 隔离、javax/jakarta 与现代化迁移

## 4. 覆盖判断

### 4.1 已充分覆盖

| 后端能力域 | 判断依据 |
| --- | --- |
| Java 编译运行与基本语法 | JDK/JVM、源码与 class、类型、控制流、方法、数组均有独立基础课。 |
| 对象与类型系统 | 类、不可变性、接口、多态、枚举、注解、异常、泛型均有独立课；record、sealed 等现代语法也在中级正文实际使用。 |
| 常用核心库 | 字符串/Unicode/正则/Base64、集合、Optional、java.time、I/O/Path/Files 已覆盖后端高频合同。 |
| 函数式与集合处理 | Lambda、方法引用、Stream、Collectors、排序与相等性已有中级主线。 |
| 构建与依赖基础 | Maven 坐标、scope、传递依赖、生命周期、plugin goal、reactor 和多模块均已覆盖，与 Maven 官方模型相符。[S8][S9] |
| Web 与数据入口 | URI、HTTP、JSON、JDBC/SQL、参数绑定、关系模型、事务基础连续覆盖。 |
| Spring Web 主线 | Boot 配置、DI/Bean 生命周期、MVC/Servlet、Validation、错误响应与日志均有独立课程。 |
| MyBatis 持久化主线 | JDBC 前置、Mapper/XML、MyBatis-Plus、分页、事务和动态 SQL 边界均已覆盖。 |
| 单元测试基础 | JUnit、参数化、断言、fixture、Mockito、Surefire 已覆盖；JUnit 官方指南支持这些能力。[S10] |
| 并发、集成与安全 | happens-before、线程池、锁、上下文、重试、缓存、WebSocket、HTTP Client、JWT、密码学和输入安全已形成高级主线。 |
| JVM 诊断与迁移 | MXBeans/JMX、JFR/JMH 边界、依赖与版本迁移、javax/jakarta 隔离已有高级课程。 |

这里的“充分”只表示足以支撑通用 Java 后端主线，不表示覆盖对应 API 的每个类或每个框架实现。

### 4.2 部分覆盖

| 能力 | 当前已有 | 仍缺什么 | 建议 |
| --- | --- | --- | --- |
| 精确数值与金额 | 多课已使用 `BigDecimal`，并提醒不要用 `double` 表达金额 | `String` 构造、scale、`equals`/`compareTo`、除法与显式 `RoundingMode`/`MathContext` 没有形成完整学习合同；JDK API 明确要求调用方控制精度与舍入。[S6] | P1，扩展“变量、类型”与“JSON/领域值”课，不新增课程 |
| 现代 Java 语言演进 | 已使用 record、sealed、switch expression、模式匹配、虚拟线程 | 知识分散；没有从 Java 8 到 25 的语言特性地图，也没有系统讲 `module-info.java`、exports/opens；Oracle 变更摘要和 JLS 明确列出这些能力。[S4][S5] | P2，扩展“Legacy 现代化”和“包与源码结构” |
| 调试与官方 API 阅读 | 课程能区分编译、启动、运行失败，也大量链接 Javadoc | 没有独立训练断点、线程/异常停点、变量检查、最小复现与查 API；`jdb` 官方工具明确提供 breakpoint、thread、exception 调试能力。[S7] | P0，扩展“开发环境”和“异常”课，并在基础阶段加入练习 |
| 测试层次 | 有 JUnit/Mockito、MockMvc 和少量 `@SpringBootTest` 示例 | 单元、slice、集成、端到端边界未串成一条主线；当前测试课还明确把真实外部资源留给后续 | P0，新增集成测试课 |
| OAuth2/OIDC | 已覆盖 Bearer/JWT Resource Server、issuer/audience、授权与撤销边界 | 缺少 authorization code/OIDC 登录、client credentials、客户端注册、introspection 与端到端身份提供方集成；Spring Security 官方将 Client、Resource Server、Authorization Server 分开。[S18] | P1，扩展安全课或新增“OAuth2/OIDC 集成”课 |
| 生产观测 | 已覆盖结构化日志、MDC、metrics/traces、JMX/JFR、Actuator 暴露 | 缺少服务级 SLI/SLO、告警、部署变更关联与故障演练；这些更适合项目实践而不是再讲一遍 API | P1，放入实战项目验收，不新增纯理论课 |

### 4.3 明显缺口

| 缺口 | 为什么属于后端主线 | 官方依据 | 优先级与落点 |
| --- | --- | --- | --- |
| 真实依赖集成测试与 Testcontainers | Mock 不能证明 SQL 方言、迁移、Redis 序列化、网络和事务边界；Spring Boot 提供测试模块、test slices 与 Testcontainers 集成，Testcontainers JUnit 扩展管理容器生命周期。[S11][S12][S13] | Spring Boot Testing、Spring Boot Testcontainers、Testcontainers JUnit 5 | **P0**；新增中级课“Spring Boot 集成测试、Testcontainers 与测试分层” |
| 版本化数据库迁移 | 当前 SQL/事务课会建表，但没有 schema history、migration ordering、启动失败、向前兼容、回滚/roll-forward；Spring Boot 官方把 Flyway/Liquibase 作为高层迁移工具并建议只用一种初始化机制。[S14] | Spring Boot Database Initialization | **P0**；新增中级课“数据库迁移、兼容发布与数据变更” |
| 应用打包、容器镜像与运行合同 | 课程用 Docker 做过临时验证，但没有教授 Dockerfile、非 root、分层镜像、JVM 容器资源、配置/secret、只读文件系统，以及自动执行测试、构建和镜像验收的交付 Gate；Spring Boot 与 Docker 均提供 Java 镜像官方路径。[S15][S16] | Spring Boot Container Images、Docker Java Guide | **P0**；新增高级课“Java 应用镜像、容器资源与运行合同” |
| 健康探针、优雅停机与部署验收 | 当前可观测性课程已经解释 readiness、shutdown 阶段和 owner，但没有形成 Spring Boot/Kubernetes 下可复跑的部署反馈环；Kubernetes 区分 startup/liveness/readiness，Spring Boot 也单独定义 graceful shutdown。[S17][S20] | Kubernetes Probes、Spring Boot Graceful Shutdown | **P0**；与容器课合并，实战项目必须验证启动、readiness、流量摘除、在途请求和超时退出 |
| 外部消息代理与可靠消费 | 当前“事件、异步、调度与重试”主要是进程内 Spring 事件与执行器，不覆盖 broker partition/offset、consumer group、重复投递、死信、重平衡和事务边界；Spring Kafka 官方把 retry 与 dead-letter/error handling 作为独立消费合同。[S19] | Spring for Apache Kafka Error Handling | **P1**；新增高级课“Kafka 消息、可靠消费、重试与死信” |

## 5. 初学者必修增补

### P0：先补学习能力和第一条完整反馈环

1. **在“开发环境、JDK 与 Java 运行过程”中增加调试与 API 阅读。**
   - 学会从编译错误、异常 stack trace 到最小复现，再用断点、单步、变量和异常停点确认假设。
   - 学会从编译器签名跳到 JDK Javadoc，区分语言规则、API 合同与实现行为。[S3][S7]
   - 不需要新增一课；现有环境课与异常课各增加一个可运行练习即可。
2. **把一个最小 JUnit 行为测试前置到基础阶段末尾。**
   - 不是把完整 Mockito 课搬到基础阶段，而是让初学者能为字符串、集合、日期或文件行为写一个断言。
   - 完整 JUnit/Mockito 课仍保留在中级。[S10]
3. **在基础 18 课后增加一个小型综合练习。**
   - 只使用 JDK + Maven：读取文件、解析输入、用集合建模、输出结果、处理异常并测试。
   - 目的不是增加知识点，而是证明 18 课能组合成一个可运行程序。

### P1：补齐后端常见基础合同

1. **精确数值：** 在变量课说明二进制浮点边界，在 JSON/领域值课程系统补齐 `BigDecimal` 的构造、
   scale、比较、舍入和数据库/JSON 往返。[S6]
2. **集合成本与基本算法：** 在集合课补充按访问模式选择 ArrayList/HashMap/TreeMap、时间/空间成本、
   排序与查找；不需要扩展成算法竞赛课程。
3. **现代语法地图：** 把 record、sealed、模式匹配、switch expression、虚拟线程的“引入版本、适用场景、
   Java 8 替代写法”整理成一张路线图，继续分散到对应行为课中讲深。[S4]

### P2：基础主线不必加入

- JPMS 深度模块化、`jlink` 自定义 runtime image：普通 Spring Boot 服务可后学；只需在包/反射/迁移课
  说明 `exports` 与 `opens` 的边界。[S5]
- Swing/JavaFX、Applet、RMI、CORBA、打印、音频、桌面打包：不属于本次 Java 后端必修分母。
- Java 原生序列化：应认识风险和兼容边界，不应作为新项目推荐的数据合同。

## 6. 实战与生产工程增补路线

建议按下面顺序添加，避免一次把课程扩成无法验证的“全栈大全”。

| 顺序 | 增补 | 形式 | 最小验收 |
| ---: | --- | --- | --- |
| 1 | Spring Boot 集成测试、Testcontainers 与测试分层 | 新增中级课，接在 JUnit/Mockito 和 SQL/MyBatis 之后 | 真实数据库容器；migration 后测试；success/constraint/rollback；容器启动与清理；单元与集成命令分离 |
| 2 | 数据库迁移、兼容发布与数据变更 | 新增中级课，接在 SQL/MyBatis/事务之后 | 空库升级、已有数据升级、重复启动、失败 migration、向前/向后兼容、roll-forward 演练 |
| 3 | Java 应用镜像、自动化交付、健康探针与优雅停机 | 新增高级课 | 自动执行测试/构建/镜像验收；非 root；配置外置；startup/readiness/liveness；流量摘除；在途请求完成或超时；退出码可解释 |
| 4 | 贯穿式 CRUD 服务 | 新增实战项目，不重复写理论 | REST + Validation + SQL/MyBatis + migration + auth + error/log + integration tests + image + probes，并由自动化 Gate 验收；Spring 官方 REST guide 可作为最小入口。[S21] |
| 5 | Kafka 消息、可靠消费、重试与死信 | P1 新增高级课 | duplicate delivery、consumer restart、poison message、retry budget、DLT、幂等写入、事务边界 |
| 6 | OAuth2/OIDC 外部身份集成 | P1 新增安全实践或扩展现有安全课 | authorization code/OIDC 或 client credentials；issuer/JWK rotation；wrong audience；logout/revocation/introspection 边界 |
| 7 | 生产观测与故障演练 | P1 实战项目验收 | request correlation、低基数指标、trace、告警、依赖超时、数据库不可用、缓存不可用、滚动发布证据 |

另外，Git/代码评审工作流，以及 Shell/Linux 下的进程、端口、环境变量、权限和日志排障，也是后端开发者
的通用必修能力。它们不属于 Java 语言或 Spring 专属知识，建议作为跨技术栈工程基础，并设为贯穿式项目
的前置条件；本次审计不判断仓库中的其他技术轨是否已经覆盖。

## 7. 可选分支，不建议塞入通用主线

| 可选主题 | 建议定位 | 原因 |
| --- | --- | --- |
| Jakarta Persistence / JPA / Hibernate | P2 持久化替代分支 | 当前 MyBatis 主线已足够完整；JPA 是另一套持久化模型，不是所有 Java 后端都必须使用。需要时按 Jakarta Persistence 规范单独开课。[S22] |
| Gradle | P2 构建替代分支 | Maven 已覆盖坐标、依赖、生命周期和多模块；同时把两套工具设为必修会增加认知负担。 |
| WebFlux / Reactive Streams 深度实践 | P2 高并发 I/O 分支 | 当前已有背压概念，但完整 reactive 调试、上下文与数据库驱动应在真实技术选型后学习。 |
| gRPC / GraphQL | P2 协议分支 | REST/HTTP 已满足通用入门；按业务通信模型选学。 |
| GraalVM Native Image | P2 构建部署分支 | 对反射、资源、代理和构建链有额外约束，不应阻塞 JVM 主线。 |
| 微服务治理平台、服务发现、配置中心 | P2 平台分支 | 属于组织与平台选择；先完成单体服务的测试、迁移、镜像和可观测闭环。 |

## 8. 推荐决策

1. **不新增“Java 全知识点”总课程。** 该目标无有限验收分母，也会把非后端模块误判为缺口。
2. **现有 51 课全部保留。** 没有发现需要删除的主线课程；其深度已高于普通零基础目录。
3. **先完成 4 个 P0：** 调试/API 阅读扩展、真实依赖集成测试、数据库迁移、容器/自动化交付/探针/优雅停机。
4. **新增一个贯穿式实战项目。** 单课中的完整示例不能替代跨层、可部署、可回归的应用。
5. **再按实际技术栈选择 P1/P2。** 消息代理与 OAuth2/OIDC 通常比 JPMS、JPA 替代线、Reactive 或
   GraalVM 更值得优先投入。

完成上述 P0 后，可以严谨地描述为：**“覆盖 Java 后端初学者到常规生产服务所需的主要主线知识”**；
仍然不能描述为“涵盖 Java 全部知识”。

## 9. 官方来源

以下 22 个唯一 URL 均为官方或规范原始来源，已于 2026-08-14 直接核验；未把搜索摘要或二手教程作为
结论证据。

| 编号 | 官方来源 | 本审计用途 |
| --- | --- | --- |
| S1 | [Learn Java](https://dev.java/learn/) | 现代 Java 学习主题总览 |
| S2 | [Oracle Java Tutorials - Learning Paths](https://docs.oracle.com/javase/tutorial/tutorialLearningPaths.html) | 语言、核心库和学习路径的官方归类 |
| S3 | [Java SE 25 API](https://docs.oracle.com/en/java/javase/25/docs/api/index.html) | Java SE 模块/API 的实际广度与查阅入口 |
| S4 | [Java 25 Language Changes Summary](https://docs.oracle.com/en/java/javase/25/language/java-language-changes-summary.html) | record、sealed、模式匹配、模块 import 等现代语法版本线 |
| S5 | [JLS 25 Chapter 7 - Packages and Modules](https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html) | package、module declaration、requires/exports/opens 合同 |
| S6 | [BigDecimal - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/math/BigDecimal.html) | 精度、scale、舍入、MathContext 与比较合同 |
| S7 | [jdb - JDK 25](https://docs.oracle.com/en/java/javase/25/docs/specs/man/jdb.html) | 断点、线程、异常与运行时调试能力 |
| S8 | [Maven Dependency Mechanism](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html) | 传递依赖、scope、dependency management |
| S9 | [Maven Multiple Modules](https://maven.apache.org/guides/mini/guide-multiple-modules.html) | reactor、排序与多模块构建 |
| S10 | [JUnit 6.1.2 User Guide](https://docs.junit.org/6.1.2/user-guide/index.html) | 测试模型、断言、参数化、扩展与构建集成 |
| S11 | [Spring Boot Testing](https://docs.spring.io/spring-boot/reference/testing/index.html) | Boot 测试模块、测试基础设施与 slices |
| S12 | [Spring Boot Testcontainers](https://docs.spring.io/spring-boot/reference/testing/testcontainers.html) | Boot 与 Testcontainers 的 service connection 和生命周期 |
| S13 | [Testcontainers JUnit 5](https://java.testcontainers.org/test_framework_integration/junit_5/) | `@Testcontainers`、`@Container` 与容器生命周期 |
| S14 | [Spring Boot Database Initialization](https://docs.spring.io/spring-boot/how-to/data-initialization.html) | Flyway/Liquibase 与 schema 初始化边界 |
| S15 | [Spring Boot Container Images](https://docs.spring.io/spring-boot/reference/packaging/container-images/) | Dockerfile、Buildpacks 与镜像分层 |
| S16 | [Docker Java Guide](https://docs.docker.com/guides/java/) | Java 应用容器化官方路径 |
| S17 | [Kubernetes Probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/) | startup、liveness、readiness 探针职责 |
| S18 | [Spring Security Servlet OAuth2](https://docs.spring.io/spring-security/reference/servlet/oauth2/) | OAuth2 Client、Resource Server、Authorization Server 分工 |
| S19 | [Spring for Apache Kafka Error Handling](https://docs.spring.io/spring-kafka/reference/kafka/annotation-error-handling.html) | 消费失败、重试与 dead-letter 处理 |
| S20 | [Spring Boot Graceful Shutdown](https://docs.spring.io/spring-boot/reference/web/graceful-shutdown.html) | 在途请求与关闭超时合同 |
| S21 | [Spring Guide: Building a RESTful Web Service](https://spring.io/guides/gs/rest-service) | 贯穿式 REST 实战的官方最小入口 |
| S22 | [Jakarta Persistence 3.2 Specification](https://jakarta.ee/specifications/persistence/3.2/) | JPA 作为可选持久化分支的规范依据 |
