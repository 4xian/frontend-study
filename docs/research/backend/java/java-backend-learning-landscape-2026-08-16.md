# Java 后端完整学习版图与 Spring Boot Web 项目能力链

> 调研日期：2026-08-16  
> 文档性质：课程池研究稿，不是课程实施计划  
> 调研目标：先回答 Java 后端可以学什么、普通 Spring Boot Web 项目实际需要什么，再讨论最终分类、
> 必修范围、课程数量和教学顺序。

## 1. 结论

“Java 全家桶”不是一个有官方固定边界的产品名称。Java SE、Spring、数据库、缓存、消息系统、容器平台
和云平台都可以继续向外扩展，因此不能把生态中存在的每项技术都设为普通后端开发者的必修课。

更可执行的课程分母是：

1. 能独立编写和调试 Java 程序；
2. 能独立完成一个常规 Spring Boot Web 项目的设计、开发、测试和交付；
3. 能理解生产环境中的配置、安全、观测、性能和故障边界；
4. 能根据项目选择 Redis、消息队列、WebSocket、微服务或云原生等专项，而不是提前全学。

课程应同时使用两套维度：

- **知识分类**决定课程放在哪里，例如 Java 基础、面向对象、集合、异常、I/O、Spring MVC、数据库；
- **使用层级**决定普通开发者学到什么深度，例如日常必需、项目常用、生产进阶、专项选修。

“基础、中级、高级”只能描述学习深度，不能代替知识分类。

## 2. 使用层级

| 层级 | 判断标准 | 学习结果 |
| --- | --- | --- |
| 日常必需 | 几乎每个 Spring Boot Web 项目都会直接使用 | 能独立开发普通 CRUD 与业务接口 |
| 项目常用 | 多数企业项目会使用，但不是每个功能每天都写 | 能处理数据库、测试、安全、文件、外部接口等常见需求 |
| 生产进阶 | 服务进入真实环境后才会集中遇到 | 能部署、观测、排障、调优并处理可靠性问题 |
| 专项选修 | 由架构、流量、行业或平台选型决定 | 在需要时进入对应技术分支，不阻塞普通项目主线 |

## 3. 一个 Spring Boot Web 项目的完整能力链

下面不是框架 API 清单，而是开发一个项目时真实发生的工作顺序。

| 项目环节 | 主要工作 | 需要的知识与能力 |
| --- | --- | --- |
| 理解需求 | 识别用户、业务动作、数据、规则和失败情况 | 需求拆分、领域术语、面向对象、数据建模、异常场景 |
| 创建项目 | 选择 JDK、Spring Boot、依赖和目录结构 | JDK、IDE、Maven、Git、Spring Initializr、依赖管理 |
| 设计接口 | 确定资源、URL、方法、状态码、请求和响应 | HTTP、REST、JSON、DTO、校验、错误响应、OpenAPI |
| 设计数据 | 设计表、主键、关联、约束、索引和迁移 | SQL、关系模型、事务、索引、Flyway 或 Liquibase |
| 编写业务 | 实现 Controller、Service、Repository/Mapper | Java、集合、异常、Spring MVC、依赖注入、分层设计 |
| 接入数据库 | 配置连接池并实现查询、写入和事务 | JDBC、DataSource、MyBatis 或 JPA、事务、分页 |
| 处理边界 | 处理空值、并发请求、重复提交和外部失败 | Optional、异常、幂等、锁、超时、重试、事务边界 |
| 编写测试 | 验证业务、Web 边界和真实数据库行为 | JUnit、Mockito、MockMvc、Spring Boot Test、Testcontainers |
| 接入安全 | 认证用户、判断权限并保护输入和秘密 | Spring Security、会话或 JWT、OAuth2/OIDC、CORS、CSRF |
| 联调交付 | 输出接口文档，完成前后端和外部系统联调 | OpenAPI、日志、HTTP 客户端、契约测试、版本管理 |
| 打包部署 | 构建 JAR 或镜像，注入环境配置并启动服务 | Maven、配置、Docker、CI/CD、健康检查、优雅停机 |
| 运行维护 | 观察请求、错误、资源和依赖，定位线上问题 | 日志、指标、链路追踪、Actuator、JVM、告警和故障排查 |

普通开发者并不是只写 Controller。一个完整项目至少会贯穿 Java 语言、对象建模、集合、异常、I/O、
HTTP、Spring、数据库、测试、安全和交付。

## 4. 候选课程池

以下先追求分类完整，不代表最终每一项都要独立成课。后续应根据教学负担把紧密相关的小主题合并，
把过大的主题拆开。

### 4.1 Java 基础

默认层级：日常必需。

1. 开发环境、JDK、IDE 与第一个 Java 程序
2. 源文件、类、`main` 方法、编译与运行过程
3. 变量、常量、基本类型与引用类型
4. 字面量、类型转换、装箱与拆箱
5. 算术、比较、逻辑和赋值运算符
6. 表达式、语句、代码块与作用域
7. 条件判断与 `switch`
8. 循环、跳转和循环调试
9. 方法、参数、返回值与值传递
10. 方法重载、可变参数和递归基础
11. 一维数组、二维数组与常用数组操作
12. `String`、字符串比较、不可变性与字符串池
13. `StringBuilder` 与文本拼接
14. 包、`import`、访问路径与源码目录
15. 编译错误、运行错误、断点调试与阅读 Javadoc

### 4.2 面向对象编程

默认层级：日常必需。

1. 类、对象与引用
2. 字段、方法和对象状态
3. 构造方法、`this` 与对象初始化
4. 封装与访问控制
5. `static`、类成员与实例成员
6. `final`、常量与不可变对象
7. 继承、`super` 与方法重写
8. 抽象类与抽象方法
9. 接口、默认方法与接口实现
10. 多态、向上转型与运行时方法选择
11. `Object`、`equals`、`hashCode` 与 `toString`
12. 枚举与有限状态
13. 内部类、匿名类和局部类
14. record、sealed class 与现代数据建模
15. 组合优先、职责划分与基础设计原则

### 4.3 异常处理

异常基础应在文件 I/O 之前完成，因为文件、网络和数据库 API 都会产生异常。

1. `Throwable`、`Error`、`Exception` 与 `RuntimeException`
2. `try`、`catch`、`finally` 与异常传播
3. `throw`、`throws` 与方法失败合同
4. checked exception 与 unchecked exception
5. 多个 `catch`、multi-catch 与捕获顺序
6. 自定义异常与业务异常
7. cause 链、异常翻译与保留原始原因
8. try-with-resources 与 suppressed exception
9. 堆栈跟踪、异常日志与问题定位
10. 不吞异常、不过度捕获与边界处理

前六项属于日常必需，后四项属于项目常用。

### 4.4 泛型与集合框架

默认层级：日常必需。泛型基础放在集合具体实现之前。

1. 泛型类、泛型接口与泛型方法
2. 类型参数、上界、下界与通配符
3. 类型擦除、原始类型与类型安全边界
4. `Iterable`、`Collection` 与集合层级
5. `List`、`ArrayList` 与顺序数据
6. `Set`、`HashSet` 与元素唯一性
7. `Map`、`HashMap` 与键值数据
8. `Queue`、`Deque` 与任务顺序
9. Iterator、for-each 与安全删除
10. `Comparable`、`Comparator` 与稳定排序
11. 不可修改集合、不可变元素与防御性复制
12. ArrayList、LinkedList、HashMap、TreeMap 的选择与成本
13. `Collections`、`Arrays` 与常用集合算法
14. 并发集合概览

并发集合的内部原理属于 Java 并发分类，不在本分类提前展开。

### 4.5 I/O 与文件操作

前七项属于项目常用，压缩、归档和网络流按项目选择。

1. `Path`、`Files` 与现代文件系统 API
2. 字节流、`InputStream` 与 `OutputStream`
3. 字符流、`Reader` 与 `Writer`
4. 字符集、UTF-8 与文本/字节转换
5. 缓冲流、短读、EOF 与分块处理
6. 文件创建、复制、移动、删除与元数据
7. 目录遍历与批量文件处理
8. try-with-resources 与资源所有权
9. 临时文件与安全文件名
10. ZIP/GZIP 压缩与归档
11. 大文件、流式处理与内存边界
12. Java 网络 I/O 与 Socket 概览

Java 原生对象序列化只需要认识兼容性和安全风险，不应作为新项目推荐的数据合同。

### 4.6 常用 Java 标准库

1. 包装类型、`Number` 与数值转换（日常必需）
2. `BigDecimal`、精度、scale 与舍入（日常必需）
3. `LocalDate`、`LocalDateTime`、`Instant` 与时区（日常必需）
4. 正则表达式、`Pattern` 与 `Matcher`（项目常用）
5. `UUID`、随机数与标识生成（项目常用）
6. `Optional`、空值与缺失语义（日常必需）
7. Base64、URL 编码与字符编码边界（项目常用）
8. `Math`、`Objects` 与常用工具 API（日常必需）
9. `ResourceBundle`、Locale 与国际化（专项选修）

### 4.7 函数式编程与现代 Java

1. Lambda 表达式
2. 函数式接口
3. 方法引用
4. Stream 的创建、中间操作与终止操作
5. `map`、`filter`、`reduce` 与数据转换
6. Collectors、分组、分区与聚合
7. Stream 的惰性、短路和副作用
8. 并行 Stream 的适用边界
9. switch expression 与模式匹配
10. record、sealed type 与现代领域模型

前七项属于日常必需或项目常用；并行 Stream 和语言演进深度属于生产进阶。

### 4.8 Java 工程化基础

1. Maven 项目结构、坐标与生命周期
2. Maven 依赖、scope、传递依赖与冲突
3. BOM、dependency management 与版本统一
4. Maven plugin、资源、profile 与打包
5. 多模块项目与模块依赖
6. Git 基础、分支、合并与代码评审
7. Linux/Shell、进程、端口、权限和环境变量
8. SLF4J、Logback 与日志级别
9. IDE 调试、远程调试与最小复现
10. 代码格式、静态分析和依赖检查

Maven 是通用主线；Gradle 作为替代构建工具单独选修，不要求同时精通两套。

### 4.9 Web、网络与接口基础

1. DNS、IP、端口、TCP 与 TLS 基础
2. HTTP 请求、响应和报文结构
3. HTTP 方法、状态码、Header 与 Content-Type
4. URI、路径、查询参数与 URL 编码
5. REST 资源设计与统一接口
6. JSON 语法、类型和数据合同
7. 分页、过滤、排序和搜索参数
8. 幂等请求、重复提交和并发更新
9. Cookie、Session 与无状态接口
10. CORS、缓存 Header 与代理基础
11. curl、Postman 类工具与接口联调
12. OpenAPI 与接口文档基础

前八项属于普通 Spring Boot Web 开发的日常必需。

### 4.10 关系数据库与 SQL

1. 关系模型、表、行、列和数据类型
2. 主键、外键、唯一约束和非空约束
3. `SELECT`、`INSERT`、`UPDATE` 与 `DELETE`
4. 条件、排序、分页与聚合
5. JOIN、子查询与公共表表达式
6. 数据库设计、范式与业务冗余
7. 索引、执行计划与慢查询基础
8. ACID、事务提交和回滚
9. 隔离级别、锁、死锁和并发更新
10. JDBC、`DataSource` 与连接池
11. 数据库迁移、Flyway 或 Liquibase
12. 时间、金额、JSON 等数据类型映射
13. 批量操作与大数据量边界
14. 备份、恢复和高可用概览

前十二项属于日常必需或项目常用；数据库运维深度属于专项。

### 4.11 Spring Core 与 Spring Boot

1. Spring Framework、Spring Boot 与 Spring 生态关系
2. IoC、依赖注入与容器
3. 构造器注入、组件扫描和 Bean 注册
4. Bean 生命周期、scope 与初始化/销毁
5. Java 配置、`@Bean` 与条件配置
6. Spring Boot starter、自动配置与条件装配
7. 配置文件、profile、环境变量与配置优先级
8. 类型安全配置与配置校验
9. 应用启动过程与启动失败分析
10. Spring 事件与应用生命周期事件
11. AOP、代理与横切关注点
12. 调度任务和异步方法基础

前十项属于日常必需；AOP 深度、调度和异步按项目需求进入。

### 4.12 Spring MVC 与 REST API

1. Servlet、Filter、DispatcherServlet 与请求生命周期
2. `@Controller`、`@RestController` 与请求映射
3. 路径变量、查询参数、Header 与请求体绑定
4. Jackson JSON 序列化与反序列化
5. Bean Validation 与输入校验
6. 响应模型、HTTP 状态码和响应 Header
7. 全局异常处理与 Problem Details
8. Controller、Service、Repository/Mapper 分层
9. DTO、领域对象与持久化对象的边界
10. REST 分页、过滤、排序和幂等实现
11. 文件上传、下载和内容类型
12. 外部 HTTP 接口调用、超时和资源关闭
13. OpenAPI、接口示例与前后端联调
14. WebMvc 配置、消息转换器与参数解析器
15. 拦截器、Filter 与请求上下文

前十三项覆盖普通 Spring Boot Web 项目的主要开发工作。

### 4.13 数据访问与事务

通用主线可以选择 MyBatis；JPA/Hibernate 是另一条等价但心智模型不同的持久化分支。

1. Spring `DataSource`、连接池和数据库配置
2. JDBC 参数绑定、结果读取和资源关闭
3. MyBatis Mapper 接口、XML 与注解映射
4. 参数映射、结果映射和对象关系
5. 动态 SQL、批量操作和分页
6. MyBatis-Spring 与 Spring Boot 集成
7. MyBatis-Plus 常用能力与边界
8. `@Transactional`、事务代理和回滚规则
9. 事务传播、隔离级别和只读事务
10. 事务与文件、HTTP、消息等外部副作用
11. 乐观锁、悲观锁与并发更新
12. 数据库迁移与应用版本协同

### 4.14 后端架构与业务建模

1. 需求拆分、用例和业务规则
2. 分层架构与依赖方向
3. DTO、VO、实体和值对象
4. Service 职责与业务编排
5. Repository/Mapper 抽象边界
6. 模块化单体与包结构
7. SOLID 原则与可测试设计
8. 策略、模板方法、适配器与工厂
9. 领域事件与事务边界
10. 重构、技术债和 Legacy 隔离
11. 领域驱动设计基础
12. 架构决策记录与接口演进

前六项属于日常必需；设计模式和 DDD 应在已有业务代码后学习，不能替代基础开发。

### 4.15 测试与质量保障

1. 测试目的、测试金字塔与反馈速度
2. JUnit 测试结构、断言与生命周期
3. 参数化测试、异常测试和边界测试
4. fixture、测试数据和可重复测试
5. Mockito、stub、mock 与交互验证
6. Service 单元测试
7. Spring TestContext 与应用上下文测试
8. MockMvc 与 Web 测试切片
9. Repository/Mapper 集成测试
10. Testcontainers 与真实数据库测试
11. 事务、迁移和约束回归测试
12. WireMock 与外部 HTTP 合同测试
13. Spring Security 测试
14. 端到端测试、冒烟测试与发布验收
15. 覆盖率、静态分析和缺陷定位
16. 性能测试与容量基线

单元、Web、真实数据库集成测试属于普通项目主线；性能和大规模端到端测试属于生产进阶。

### 4.16 安全

1. 身份认证、权限授权与最小权限
2. Spring Security Filter Chain
3. 密码存储、会话和登录状态
4. JWT Resource Server
5. OAuth2 与 OpenID Connect
6. 方法级授权与资源级权限
7. CSRF、CORS 和安全 Header
8. SQL 注入、命令注入和输出编码
9. 输入校验、文件上传和路径安全
10. TLS、证书和服务间身份基础
11. 配置秘密、密钥轮换和日志脱敏
12. 依赖漏洞、供应链与镜像安全
13. 限流、暴力破解防护和审计日志

认证授权、输入安全和秘密管理属于项目常用；OAuth2/OIDC 深度取决于身份平台。

### 4.17 Java 并发、JVM 与性能

1. 线程、任务和线程生命周期
2. `ExecutorService`、线程池和任务队列
3. `Future`、`CompletableFuture` 与异步组合
4. Java Memory Model 与 happens-before
5. `synchronized`、`volatile` 与原子类
6. `Lock`、条件变量和并发集合
7. ThreadLocal、请求上下文与清理
8. 虚拟线程与阻塞任务
9. 类加载、字节码和运行时数据区
10. 堆、栈、对象生命周期和垃圾回收
11. JIT、逃逸分析与常见性能误区
12. `jcmd`、`jstack`、`jmap`、JFR 与问题诊断
13. heap dump、线程 dump 与内存泄漏分析
14. JMH 与可靠微基准
15. 反射、动态代理和方法句柄

并发正确性和线程池属于项目常用；JVM 内部和性能工具属于生产进阶。

### 4.18 缓存、消息与系统集成

1. 进程内缓存、生命周期与容量
2. Redis 数据类型、序列化和 TTL
3. Cache Aside、缓存失效和一致性
4. 分布式锁的适用边界
5. 定时任务、异步任务和失败观测
6. Kafka 或 RabbitMQ 的基本生产与消费
7. 重复投递、幂等消费、重试和死信
8. 外部 HTTP 客户端、连接池、超时和取消
9. 重试、退避、熔断、隔离和降级
10. WebSocket 与会话生命周期
11. Server-Sent Events 与服务端推送
12. 文件存储、对象存储和大文件传输
13. 搜索引擎与 Elasticsearch 基础
14. MongoDB 等文档数据库基础

Redis 和外部 HTTP 调用是项目常用；消息、实时通信、搜索和 NoSQL 按项目选修。

### 4.19 生产交付与可观测性

1. 环境配置、外部化配置和秘密注入
2. 结构化日志、MDC 与请求关联标识
3. Spring Boot Actuator 与管理端点
4. 指标、Micrometer 与低基数标签
5. 分布式追踪与 OpenTelemetry
6. 健康检查、startup、readiness 与 liveness
7. JAR 打包、分层 JAR 与启动参数
8. Dockerfile、Buildpacks 与容器镜像
9. 非 root、只读文件系统和容器资源限制
10. CI/CD、自动测试、构建和发布
11. 优雅停机、流量摘除和在途请求
12. 回滚、roll-forward 与数据库兼容发布
13. 告警、SLI/SLO 与运行手册
14. 线上故障定位与故障演练
15. 性能基线、容量规划和压测

日志、配置、健康检查、镜像和自动交付应进入普通项目的交付主线；Kubernetes 平台管理深度另设专项。

### 4.20 分布式系统与微服务专项

1. 单体、模块化单体与微服务的选择
2. 服务边界、同步调用与异步消息
3. 服务发现、配置中心与 API Gateway
4. 超时、重试、熔断和舱壁隔离
5. 分布式事务、最终一致性与 Saga
6. 幂等、去重和全局标识
7. 分布式锁、租约和时钟问题
8. 消息顺序、分区、消费组和重平衡
9. 跨服务日志、指标和链路追踪
10. Kubernetes 工作负载、配置和滚动发布
11. 限流、容量保护和多级降级
12. 灾备、多区域和故障恢复概览

这一整类属于生产进阶或专项选修。没有先完成可测试、可部署的单体服务，不应直接进入微服务。

### 4.21 可选技术分支

以下技术不能全部放入通用必修线：

- JPA、Hibernate 与 Spring Data JPA；
- Gradle；
- Spring WebFlux、Reactor 与 R2DBC；
- Spring Cloud；
- Kafka、RabbitMQ、Pulsar 深入；
- Elasticsearch、MongoDB 与其他 NoSQL；
- GraphQL、gRPC；
- Spring Batch；
- WebSocket、SSE 深入；
- GraalVM Native Image；
- JPMS、`jlink` 与自定义运行时；
- Kubernetes、Service Mesh 与云平台；
- 工作流引擎、规则引擎、报表和搜索平台；
- 大数据、Flink、Spark 等独立技术体系。

它们应依据目标岗位和项目选型组成分支课程。

### 4.22 综合项目

知识点课程必须通过逐步项目组合，否则学习者仍然只会阅读概念。

1. Java 控制台项目：方法、数组、字符串和基础对象
2. Java 文件项目：对象、集合、异常、I/O 和 JUnit
3. Spring Boot 内存版 REST API：HTTP、DTO、校验、分层和错误处理
4. Spring Boot 数据库版业务系统：MySQL、MyBatis、事务和迁移
5. 可交付服务：安全、测试、OpenAPI、Docker、健康检查和观测
6. 生产进阶项目：缓存、消息、外部接口、故障注入和恢复

## 5. 普通 Java 后端开发者的建议主线

如果目标是独立完成常规 Spring Boot Web 项目，建议先覆盖以下分类：

```text
Java 基础
-> 面向对象
-> 异常
-> 泛型与集合
-> I/O 与常用标准库
-> 函数式与现代 Java
-> Maven、Git、Linux 和日志
-> HTTP、REST 和 JSON
-> SQL 与关系数据库
-> Spring Core 与 Spring Boot
-> Spring MVC 与 REST API
-> MyBatis 与事务
-> 分层架构与业务建模
-> JUnit、MockMvc 和数据库集成测试
-> 基础安全与接口文档
-> Docker、健康检查、日志与指标
-> 完整项目
```

Redis、消息队列、WebSocket、微服务、响应式和 Kubernetes 可以在这条主线之后按项目选择。

## 6. 对现有课程结构的客观判断

现有课程已经接触上述多数知识点，但分类和教学表达存在两个不同问题：

1. 以基础、中级、高级为主要目录，弱化了面向对象、集合、异常、I/O、Spring Web、数据库等知识域；
2. 一门课程经常同时承担概念说明、兼容性、项目证据和验收脚本，导致课程标题和正文负担过大。

后续重新规划时不应简单删除已有内容，而应先把知识点重新归类，再决定：

- 哪些知识点合并为一门教学课；
- 哪些大课需要拆分；
- 哪些内容只保留为 Reference；
- 哪些工程验证只留在内部文档；
- 哪些专项不进入普通后端主线。

## 7. 下一轮需要讨论的决策

1. 主导航是否完全按知识分类，不再按基础、中级、高级分组；
2. 普通 Spring Boot Web 主线应包含到 Docker 与观测，还是先停在可运行项目；
3. MyBatis 与 JPA 是选择一条主线，还是两条平行分支；
4. Redis、安全、消息和微服务分别放在主线还是专项；
5. 一个课程适合承载多少知识点，何时必须拆课；
6. 现有稳定 URL、学习进度和正文如何迁移。

## 8. 官方来源

| 官方来源 | 用途 |
| --- | --- |
| [Dev.java Learn Java](https://dev.java/learn/) | Java 语言、类、泛型、异常、集合、I/O、Stream、JVM 工具的官方学习版图 |
| [Java Language Basics](https://dev.java/learn/language-basics/) | 变量、运算符、表达式、数组与控制流 |
| [Classes and Objects](https://dev.java/learn/classes-objects/) | 类、对象、字段、方法、构造器和枚举 |
| [Exceptions](https://dev.java/learn/exceptions/) | 异常捕获、抛出和 checked/unchecked 边界 |
| [Collections Framework](https://dev.java/learn/api/collections-framework/) | Collection、List、Set、Map、Queue 与实现选择 |
| [Java I/O API](https://dev.java/learn/java-io/) | Path、Files、字节流、字符流与文件操作 |
| [Spring Framework Core](https://docs.spring.io/spring-framework/reference/core.html) | IoC、AOP 与 Spring 核心容器 |
| [Spring Web MVC](https://docs.spring.io/spring-framework/reference/web/webmvc.html) | Servlet 栈 Web MVC 与请求处理 |
| [Spring Boot Servlet Web](https://docs.spring.io/spring-boot/reference/web/servlet.html) | Spring Boot 中的 Controller、REST 与 Web 自动配置 |
| [Spring Boot SQL Databases](https://docs.spring.io/spring-boot/reference/data/sql.html) | DataSource、JDBC、ORM 与 SQL 数据访问 |
| [Spring Boot Testing](https://docs.spring.io/spring-boot/reference/testing/index.html) | Boot 测试支持和测试切片 |
| [Spring Boot Testcontainers](https://docs.spring.io/spring-boot/reference/testing/testcontainers.html) | 真实外部依赖集成测试 |
| [Spring Security Servlet](https://docs.spring.io/spring-security/reference/servlet/index.html) | Servlet 应用认证授权与安全过滤链 |
| [Apache Maven Getting Started](https://maven.apache.org/guides/getting-started/) | 构建、依赖、插件和项目结构 |
| [JUnit User Guide](https://docs.junit.org/current/user-guide/) | JVM 测试平台、Jupiter 与测试编程模型 |
| [Testcontainers for Java](https://java.testcontainers.org/) | 数据库、消息系统和外部依赖的容器化测试 |
| [MyBatis 3](https://mybatis.org/mybatis-3/) | SQL 映射、参数和结果对象 |
| [Spring Boot Observability](https://docs.spring.io/spring-boot/reference/actuator/observability.html) | 日志、指标、链路和上下文传播 |
| [Spring Boot Container Images](https://docs.spring.io/spring-boot/reference/packaging/container-images/) | Dockerfile、Buildpacks 和容器镜像 |
| [Spring Boot Graceful Shutdown](https://docs.spring.io/spring-boot/reference/web/graceful-shutdown.html) | 在途请求和关闭超时 |
| [Spring Data Redis](https://docs.spring.io/spring-data/redis/reference/) | Redis 连接、模板、序列化与缓存基础 |
| [Spring for Apache Kafka](https://docs.spring.io/spring-kafka/reference/) | Kafka 生产、消费、重试和错误处理 |
| [Docker Java Guide](https://docs.docker.com/guides/java/) | Java 应用容器化实践 |
| [Kubernetes Probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/) | startup、readiness 与 liveness 探针 |
| [OpenTelemetry Java](https://opentelemetry.io/docs/languages/java/) | Java 指标、链路和日志关联 |
| [OWASP REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html) | REST API 的认证、授权、输入与传输安全 |

## 9. 调研边界

- 本文没有把 Java SE API 的每个包变成课程；
- 本文没有把所有数据库、消息系统和云平台设为必修；
- 本文没有确定最终课程数量或 URL；
- 本文没有授权修改现有课程、导航、进度和执行计划；
- 下一步应先讨论分类和主线范围，再形成新的课程规划。
