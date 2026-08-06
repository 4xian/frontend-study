# 拒绝模式与风险纠错登记

## 完全拒绝项

本批没有为了凑统计制造 `rejected`；167 个规范来源均可在受限深度下进入课程、参考或项目候选。

## 合并纠正的高风险旧写法

> 以下来源的 `evidencePolicy` 必须保持 `project-risk-evidence-only`。它们只证明需要纠错或验证，不构成推荐依据。

### JAVA-RISK-001 Web 入口职责过载

- 处置：`merged` -> `backend.java.learn.intermediate.layers-dto-and-service-boundaries`
- 原因：项目的 Controller、Service、Mapper 和多类模型需要明确职责；超大类只作拆分边界的反例。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.intermediate.layers-dto-and-service-boundaries` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-002 业务服务职责过载

- 处置：`merged` -> `backend.java.learn.intermediate.layers-dto-and-service-boundaries`
- 原因：项目的 Controller、Service、Mapper 和多类模型需要明确职责；超大类只作拆分边界的反例。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.intermediate.layers-dto-and-service-boundaries` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-003 数据访问合同职责过载

- 处置：`merged` -> `backend.java.learn.advanced.database-sharding-and-sql-boundaries`
- 原因：项目存在反射分片与 SQL 文本改写；课程主线以类型化边界和可验证 SQL 为准。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.database-sharding-and-sql-boundaries` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-004 层次边界与模型职责混合

- 处置：`merged` -> `backend.java.learn.intermediate.layers-dto-and-service-boundaries`
- 原因：项目的 Controller、Service、Mapper 和多类模型需要明确职责；超大类只作拆分边界的反例。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.intermediate.layers-dto-and-service-boundaries` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-005 隐式依赖与容器生命周期绕过

- 处置：`merged` -> `backend.java.learn.intermediate.dependency-injection-and-bean-lifecycle`
- 原因：项目大量依赖 Spring Bean；静态服务定位与容器绕过只用于说明显式依赖和测试 seam。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.intermediate.dependency-injection-and-bean-lifecycle` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-006 未生效、冗余或伪关闭配置

- 处置：`merged` -> `backend.java.learn.intermediate.spring-boot-and-configuration`
- 原因：项目启动、Bean 和配置事实都依赖 Boot；未生效配置和状态背离仅作为纠错边界。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.intermediate.spring-boot-and-configuration` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-007 空值、缺失与失败语义混淆

- 处置：`merged` -> `backend.java.learn.basics.null-optional-and-failure-semantics`
- 原因：项目存在 Optional 使用和大量空值风险；课程必须区分缺失、失败与合法空结果。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.basics.null-optional-and-failure-semantics` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-008 原始类型与非类型化合同

- 处置：`merged` -> `backend.java.learn.basics.generics-and-type-safety`
- 原因：集合、Mapper、结果对象和回调都依赖泛型；原始类型风险仅作为纠错证据。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.basics.generics-and-type-safety` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-009 Bean Validation 约束未被触发

- 处置：`merged` -> `backend.java.learn.intermediate.bean-validation-and-input-contracts`
- 原因：项目有标准与私有校验体系；主线讲标准触发链，私有语义只作为纠错对照。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.intermediate.bean-validation-and-input-contracts` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-010 自定义校验器与非标准约束语义

- 处置：`merged` -> `backend.java.learn.intermediate.bean-validation-and-input-contracts`
- 原因：项目有标准与私有校验体系；主线讲标准触发链，私有语义只作为纠错对照。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.intermediate.bean-validation-and-input-contracts` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-011 异常吞没、宽泛捕获与不透明传播

- 处置：`merged` -> `backend.java.learn.basics.exceptions-and-cause-chains`
- 原因：项目直接抛出、捕获和转换异常；风险证据只用于纠正吞没、宽泛捕获和 cause 丢失。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.basics.exceptions-and-cause-chains` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-012 HTTP 错误状态、错误码与详情泄露

- 处置：`merged` -> `backend.java.learn.intermediate.errors-results-and-logging`
- 原因：项目的异常、HTTP 错误和日志存在跨层边界；敏感内容风险只用于去敏与稳定错误合同。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.intermediate.errors-results-and-logging` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-013 切面扩大行为范围或改写控制流

- 处置：`merged` -> `backend.java.learn.advanced.reflection-aop-and-cross-cutting-contracts`
- 原因：项目切面依赖反射和代理；风险项只说明切点扩大与控制流改写的纠错边界。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.reflection-aop-and-cross-cutting-contracts` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-014 敏感数据进入日志与字符串化输出

- 处置：`merged` -> `backend.java.learn.intermediate.errors-results-and-logging`
- 原因：项目的异常、HTTP 错误和日志存在跨层边界；敏感内容风险只用于去敏与稳定错误合同。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.intermediate.errors-results-and-logging` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-015 凭据模型、回显与生命周期过宽

- 处置：`merged` -> `backend.java.learn.advanced.cryptography-secrets-and-license-verification`
- 原因：项目存在多种密码学和凭据处理；旧算法、硬编码秘密、TLS 绕过和 fail-open 只作纠错。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.cryptography-secrets-and-license-verification` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-016 源码硬编码秘密与不可轮换凭据

- 处置：`merged` -> `backend.java.learn.advanced.cryptography-secrets-and-license-verification`
- 原因：项目存在多种密码学和凭据处理；旧算法、硬编码秘密、TLS 绕过和 fail-open 只作纠错。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.cryptography-secrets-and-license-verification` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-017 匿名面、认证排除与认证绕过

- 处置：`merged` -> `backend.java.learn.advanced.authentication-authorization-and-jwt`
- 原因：项目存在匿名面、用户上下文和 JWT；主线从资源授权与不可信身份输入建立安全边界。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.authentication-authorization-and-jwt` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-018 不可信身份输入与缺失资源授权

- 处置：`merged` -> `backend.java.learn.advanced.authentication-authorization-and-jwt`
- 原因：项目存在匿名面、用户上下文和 JWT；主线从资源授权与不可信身份输入建立安全边界。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.authentication-authorization-and-jwt` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-019 令牌、签名与许可证校验未闭环或 fail-open

- 处置：`merged` -> `backend.java.learn.advanced.cryptography-secrets-and-license-verification`
- 原因：项目存在多种密码学和凭据处理；旧算法、硬编码秘密、TLS 绕过和 fail-open 只作纠错。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.cryptography-secrets-and-license-verification` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-020 弱密码学、不安全 TLS 与非安全随机数

- 处置：`merged` -> `backend.java.learn.advanced.cryptography-secrets-and-license-verification`
- 原因：项目存在多种密码学和凭据处理；旧算法、硬编码秘密、TLS 绕过和 fail-open 只作纠错。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.cryptography-secrets-and-license-verification` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-021 不可信反序列化与旧序列化合同

- 处置：`merged` -> `backend.java.learn.intermediate.json-and-data-contracts`
- 原因：项目同时存在 Jackson、Fastjson 和外部合同；现代安全映射在主线，旧解析方式只作迁移纠错。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.intermediate.json-and-data-contracts` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-022 HTTP 方法、请求体与 Servlet 流合同不完整

- 处置：`merged` -> `backend.java.learn.intermediate.spring-mvc-and-servlet-boundaries`
- 原因：项目的 Controller、Filter、Interceptor 和 Servlet 流都属于请求边界，必须先讲协议合同。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.intermediate.spring-mvc-and-servlet-boundaries` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-023 过滤链、黑名单与输入变异式安全控制

- 处置：`merged` -> `backend.java.learn.advanced.secure-input-and-api-exposure`
- 原因：理解项目过滤器、动态视图和文档暴露风险需要一门现代输入与接口安全课程。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.secure-input-and-api-exposure` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-024 CORS、动态视图与 API 文档暴露边界

- 处置：`merged` -> `backend.java.learn.advanced.secure-input-and-api-exposure`
- 原因：理解项目过滤器、动态视图和文档暴露风险需要一门现代输入与接口安全课程。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.secure-input-and-api-exposure` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-025 文件路径、上传与归档展开边界

- 处置：`merged` -> `backend.java.learn.advanced.file-storage-and-archive-boundaries`
- 原因：项目有上传下载、对象存储和压缩处理；路径、大小、类型与展开边界必须优先于厂商细节。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.file-storage-and-archive-boundaries` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-026 无界整载荷缓冲与慢消费者背压

- 处置：`merged` -> `backend.java.learn.advanced.binary-streams-media-and-backpressure`
- 原因：文档和媒体链路需要字节偏移、压缩、图像与流式处理；无界缓冲只作为背压反例。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.binary-streams-media-and-backpressure` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-027 可关闭资源所有权与异常路径清理

- 处置：`merged` -> `backend.java.learn.basics.io-files-and-resource-ownership`
- 原因：上传下载、文档处理和网络客户端都依赖流与关闭责任；风险证据只用于异常路径纠错。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.basics.io-files-and-resource-ownership` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-028 网络客户端生命周期、超时与连接状态

- 处置：`merged` -> `backend.java.learn.advanced.http-clients-and-integration-resilience`
- 原因：项目有大量外部 HTTP 调用；超时、连接复用、关闭、重试和失败回退必须成组验证。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.http-clients-and-integration-resilience` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-029 启动关键路径、进程控制与 JVM 全局副作用

- 处置：`merged` -> `backend.java.learn.advanced.process-jvm-and-observability`
- 原因：项目启动外部进程并读取运行环境；课程强调生命周期、全局副作用和可观测验证。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.process-jvm-and-observability` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-030 裸线程、临时执行器与拒绝策略失控

- 处置：`merged` -> `backend.java.learn.advanced.concurrency-locks-and-shared-state`
- 原因：项目存在执行器、并发容器和进程级共享状态；裸线程与字符串池锁只作反例。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.concurrency-locks-and-shared-state` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-031 异步事务、上下文与失败观测断裂

- 处置：`merged` -> `backend.java.learn.advanced.events-async-scheduling-and-retry`
- 原因：项目直接使用事件、@Async、调度、执行器和重试；同步/异步与失败观测必须显式验证。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.events-async-scheduling-and-retry` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-032 请求与 ThreadLocal 上下文清理和传播责任

- 处置：`merged` -> `backend.java.learn.advanced.thread-context-and-cleanup`
- 原因：项目在线程本地和请求上下文中传递状态；课程明确传播与 finally 清理责任。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.thread-context-and-cleanup` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-033 进程级可变共享状态与测试复位

- 处置：`merged` -> `backend.java.learn.advanced.concurrency-locks-and-shared-state`
- 原因：项目存在执行器、并发容器和进程级共享状态；裸线程与字符串池锁只作反例。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.concurrency-locks-and-shared-state` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-034 非原子复合操作与非线程安全容器值

- 处置：`merged` -> `backend.java.learn.advanced.concurrency-locks-and-shared-state`
- 原因：项目存在执行器、并发容器和进程级共享状态；裸线程与字符串池锁只作反例。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.concurrency-locks-and-shared-state` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-035 字符串池锁与仅进程内同步边界

- 处置：`merged` -> `backend.java.learn.advanced.concurrency-locks-and-shared-state`
- 原因：项目存在执行器、并发容器和进程级共享状态；裸线程与字符串池锁只作反例。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.concurrency-locks-and-shared-state` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-036 实时会话回收、幂等与慢客户端隔离

- 处置：`merged` -> `backend.java.learn.advanced.websocket-and-realtime-lifecycle`
- 原因：项目存在 WebSocket 端点与会话表；连接、慢客户端、回收和幂等必须作为一个生命周期理解。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.websocket-and-realtime-lifecycle` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-037 数据库事务包裹不可回滚外部副作用

- 处置：`merged` -> `backend.java.learn.intermediate.transactions-and-idempotency`
- 原因：项目存在声明式事务和外部副作用；课程明确数据库原子性不能覆盖外部系统。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.intermediate.transactions-and-idempotency` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-038 反射绕过类型合同与分片参数脆弱性

- 处置：`merged` -> `backend.java.learn.advanced.database-sharding-and-sql-boundaries`
- 原因：项目存在反射分片与 SQL 文本改写；课程主线以类型化边界和可验证 SQL 为准。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.database-sharding-and-sql-boundaries` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-039 SQL 文本改写、动态标识符与厂商耦合

- 处置：`merged` -> `backend.java.learn.advanced.database-sharding-and-sql-boundaries`
- 原因：项目存在反射分片与 SQL 文本改写；课程主线以类型化边界和可验证 SQL 为准。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.database-sharding-and-sql-boundaries` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-040 Mapper XML 与 Java 合同和资源布局漂移

- 处置：`merged` -> `backend.java.learn.intermediate.mybatis-and-mybatis-plus`
- 原因：项目直接使用 Mapper、XML 和 MyBatis-Plus；资源布局漂移作为合同校验的反例。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.intermediate.mybatis-and-mybatis-plus` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-041 旧 API、平台默认与历史命名兼容污染

- 处置：`merged` -> `backend.java.learn.advanced.legacy-isolation-and-modernization`
- 原因：Java 8、Boot 2.3、旧 API 和历史命名必须与现代主线隔离并提供迁移地图。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.legacy-isolation-and-modernization` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-042 可变模型、Lombok 生成合同与继承构建

- 处置：`merged` -> `backend.java.learn.intermediate.lombok-and-generated-contracts`
- 原因：项目大量使用 Lombok；课程必须显式说明生成方法、继承构建和可变性合同。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.intermediate.lombok-and-generated-contracts` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-043 事件发布线程、载荷可变性与监听副作用

- 处置：`merged` -> `backend.java.learn.advanced.events-async-scheduling-and-retry`
- 原因：项目直接使用事件、@Async、调度、执行器和重试；同步/异步与失败观测必须显式验证。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.events-async-scheduling-and-retry` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-044 无界缓存与限流器键空间回收

- 处置：`merged` -> `backend.java.learn.advanced.cache-and-consistency`
- 原因：项目确认进程内启动缓存并仅有极少 Redis 证据；课程必须区分两者并讲清回收边界。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.cache-and-consistency` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-045 配置、注释、setter 与结果状态背离

- 处置：`merged` -> `backend.java.learn.intermediate.spring-boot-and-configuration`
- 原因：项目启动、Bean 和配置事实都依赖 Boot；未生效配置和状态背离仅作为纠错边界。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.intermediate.spring-boot-and-configuration` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-046 脆弱测试结构、粗粒度断言与共享 fixture

- 处置：`merged` -> `backend.java.learn.intermediate.testing-with-junit-and-mocks`
- 原因：项目只有少量 JUnit 4 测试；主线建立现代可观察断言，旧测试结构只作迁移补充。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.intermediate.testing-with-junit-and-mocks` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`

### JAVA-RISK-047 阻塞等待与分散调度开关

- 处置：`merged` -> `backend.java.learn.advanced.events-async-scheduling-and-retry`
- 原因：项目直接使用事件、@Async、调度、执行器和重试；同步/异步与失败观测必须显式验证。
- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。
- 未来归属：作为 `backend.java.learn.advanced.events-async-scheduling-and-retry` 的易错点、验证边界或安全边界。
- 证据政策：`project-risk-evidence-only`
