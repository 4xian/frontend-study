# Java 高级第 15 门：责任链、注册表、工厂与状态机研究

> 课程 ID：`backend.java.learn.advanced.chains-registries-and-state-machines`
>
> 冻结顺序：640
>
> 研究日期：2026-08-14
>
> 冻结快照：`dzzz-app-20260803-179e722831ab`
>
> 边界：只使用 Phase 2 冻结矩阵与本稿核验的一手资料；不读取、搜索、运行或修改 `dzzz-app`。

## 冻结课程合同

- 标题：责任链、注册表、工厂与状态机。
- 阶段：`advanced`；深度：`lesson`；顺序：640。
- 前置课程：`backend.java.learn.intermediate.service-design-patterns`、`backend.java.learn.advanced.concurrency-locks-and-shared-state`。
- `sourceCapabilityIds` 仅为 `JAVA-ENGINEERING-009`、`JAVA-ENGINEERING-010`、`JAVA-ENGINEERING-013`。
- 选择原因：项目冻结证据同时出现处理器链、服务定位/工厂和有限状态流转，需要统一讲清顺序、唯一性、生命周期与迁移合同。
- 现代主线：Java 25 LTS；Spring Boot 4.1.0 / Spring Framework 7.0.8 只在需要框架排序或事务边界时说明。
- Legacy 隔离线：Java 8；Spring Boot 2.3.12.RELEASE；Spring Framework 5.2.15.RELEASE；Spring Security 5.3.9.RELEASE。旧 API 不回填现代主线。
- 本稿不授权正文、track、loader、signoff、Reference、项目实践或第 16 课；研究闭环后才允许开始正文批次。

## 研究范围与方法

本课只研究五个相互连接的边界：请求或任务如何按固定顺序经过责任链；实现如何按唯一 key 注册；工厂如何把 key 映射到实现；状态如何由显式事件合法迁移；并发发布和持久化版本如何避免丢更新。完整工作流引擎、消息 broker、分布式锁、跨节点状态和业务事务实现不在范围内。

按仓库规则先用 Tavily 定位一手入口，再回到 Jakarta EE、Oracle、OpenJDK、Spring 官方页面核验正文结论。Tavily 搜索摘要不作为证据；以下 26 个 URL 是本批实际使用的唯一直接来源，均在 `2026-08-14` 做可达性核验。性能部分只冻结 JFR/JMH 测量方法，不给未经测量的普遍性能结论。

## 一手来源卡

| ID | URL | sourceType | appliesTo | 支持结论 |
| --- | --- | --- | --- | --- |
| `boot410-system-requirements` | <https://docs.spring.io/spring-boot/system-requirements.html> | `official-reference` | Spring Boot 4.1.0 | Boot 4.1.0 需要 Java 17 至 26，并要求 Spring Framework 7.0.8 或以上；本课用 Java 25 / Framework 7.0.8 作为现代线。 |
| `boot2312-system-requirements` | <https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements> | `official-reference` | Spring Boot 2.3.12.RELEASE | Boot 2.3.12 要求 Java 8，兼容至 Java 15，并要求 Spring Framework 5.2.15.RELEASE 或以上。 |
| `jakarta-servlet61-filtering` | <https://jakarta.ee/specifications/servlet/6.1/jakarta-servlet-spec-6.1> | `specification` | Jakarta Servlet 6.1 | 容器构造过滤链；Filter 可以调用 `FilterChain.doFilter` 进入下一个实体，也可以不调用而阻断请求。 |
| `servlet40-filter-api` | <https://jakarta.ee/specifications/servlet/4.0/apidocs/javax/servlet/filter> | `api-doc` | Servlet 4.0.3 / Java 8 | legacy `javax.servlet.Filter` 同样明确一次调用进入下一个实体，或不调用而阻断请求。 |
| `spring7-handler-interceptor-api` | <https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/servlet/HandlerInterceptor.html> | `api-doc` | Spring Framework 7.0.8 | `preHandle` 可阻断 handler；`postHandle`、`afterCompletion` 受链顺序和异步 dispatch 约束。 |
| `spring7-interceptors-reference` | <https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-config/interceptors.html> | `official-reference` | Spring MVC 7 | 拦截器注册于 incoming request；`MappedInterceptor` 受 HandlerMapping 发现。 |
| `spring5-interceptors-reference` | <https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/web.html#mvc-config-interceptors> | `official-reference` | Spring Framework 5.2.15 | legacy 仍有 pre/post/after 回调，但不应复制 Jakarta/Spring 7 包名。 |
| `spring7-security-architecture` | <https://docs.spring.io/spring-security/reference/servlet/architecture.html> | `official-reference` | Spring Security 7 | `FilterChainProxy` 按请求选择 `SecurityFilterChain`，链内过滤器顺序属于安全合同。 |
| `spring7-security-java-config` | <https://docs.spring.io/spring-security/reference/servlet/configuration/java.html> | `official-reference` | Spring Security 7 | `securityMatcher` 决定链覆盖范围；没有匹配链的请求不会自动受 Spring Security 保护。 |
| `spring7-security-filter-chain-api` | <https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/web/SecurityFilterChain.html> | `api-doc` | Spring Security 7 | `matches(HttpServletRequest)` 与 `getFilters()` 是链的直接接口合同。 |
| `spring5-security-filter-chain` | <https://docs.spring.io/spring-security/site/docs/5.3.9.RELEASE/reference/html5/#servlet-securityfilterchain> | `official-reference` | Spring Security 5.3.9 | 旧链按 URL 最具体优先、链内声明顺序执行。 |
| `spring7-transaction-annotations` | <https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html> | `official-reference` | Spring Framework 7 | `@Transactional` 是事务元数据；默认传播、读写和异常回滚规则必须显式理解。 |
| `spring7-transaction-rollback` | <https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/rolling-back.html> | `official-reference` | Spring Framework 7 | 默认 RuntimeException/Error 回滚，checked exception 默认不回滚；可通过规则改变。 |
| `java25-service-loader` | <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ServiceLoader.html> | `api-doc` | Java 25 | provider 延迟发现并缓存；`reload` 清空缓存；ServiceLoader 实例不能当作多线程共享注册表。 |
| `java8-service-loader` | <https://docs.oracle.com/javase/8/docs/api/java/util/ServiceLoader.html> | `api-doc` | Java 8 | legacy 同样是延迟加载、缓存和 reload，实例并发使用不安全。 |
| `java25-map` | <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html> | `api-doc` | Java 25 | `Map.copyOf`/`Map.of` 返回不可修改 map；Map 默认方法本身不保证原子性。 |
| `java8-unmodifiable-map` | <https://docs.oracle.com/javase/8/docs/api/java/util/Collections.html#unmodifiableMap-java.util.Map-> | `api-doc` | Java 8 | `unmodifiableMap` 是 backing map 的只读视图，不是快照。 |
| `java25-concurrent-map` | <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ConcurrentMap.html> | `api-doc` | Java 25 | `putIfAbsent`、`remove`、`replace` 是条件更新合同；原子性由实现保证。 |
| `java8-concurrent-map` | <https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ConcurrentMap.html> | `api-doc` | Java 8 | legacy 同样支持条件更新，不能用 `containsKey` 加 `put` 模拟原子注册。 |
| `java25-atomic-reference` | <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/atomic/AtomicReference.html> | `api-doc` | Java 25 | `compareAndSet` 按对象身份比较 expected 并原子替换，可发布不可变快照或迁移单个状态。 |
| `java8-atomic-reference` | <https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/atomic/AtomicReference.html> | `api-doc` | Java 8 | legacy 具有相同 expected identity 与条件更新合同，但不替代跨字段事务。 |
| `jls25-enum` | <https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.9> | `specification` | Java 25 | enum 常量构成有限状态集合；状态值不应直接由任意外部字符串或 ordinal 表示。 |
| `jls8-enum` | <https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html#jls-8.9> | `specification` | Java 8 | legacy 同样支持显式有限 enum 状态集合。 |
| `openjdk-jep-328` | <https://openjdk.org/jeps/328> | `release-note` | JDK 11+ / Java 25 | JFR 使用 typed event model 做低侵入运行时观测和事后分析，不是功能正确性证明。 |
| `oracle-jcmd-jfr` | <https://docs.oracle.com/en/java/javase/25/docs/specs/man/jcmd.html> | `official-reference` | JDK 25 | `jcmd` 可启动和停止 JFR recording，支持指定 settings 和采样区间。 |
| `openjdk-jmh` | <https://openjdk.org/projects/code-tools/jmh/> | `official-reference` | OpenJDK JMH | JMH 提供 warmup、fork、measurement 隔离的微基准框架；结果只支持局部性能断言。 |

## 冻结项目证据映射

以下只转录 `course-coverage-matrix.json`、`course-knowledge-path-source-inventory.jsonl` 和 `engineering-pattern-capability-source-inventory.jsonl` 的冻结内容，不打开项目源码。代表路径是项目证据的稳定引用，不是推荐实现；全部 usage 固定为 `observed`，不由矩阵推断缺陷或正确性。

| sourceCapabilityId | projectEvidenceCount | 代表冻结路径与符号 | 教学用途 |
| --- | ---: | --- | --- |
| `JAVA-ENGINEERING-009` | 12 | `dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/JzDataSyncHandlerChain.java` / `com.tdh.bdzz.timer.handler.JzDataSyncHandlerChain`；`.../TdhTsglptJzDataSyncHandlerChain.java` / `com.tdh.bdzz.timer.handler.TdhTsglptJzDataSyncHandlerChain`；`.../jzDataSync/JzDataSyncHandler.java` / `com.tdh.bdzz.timer.handler.jzDataSync.JzDataSyncHandler`；`.../commonJzDataSync/CommonJzDataSyncHandler.java` / `com.tdh.bdzz.timer.handler.commonJzDataSync.CommonJzDataSyncHandler`；`.../hyJzDataSync/HyJzDataSyncHandler.java` / `com.tdh.bdzz.timer.handler.hyJzDataSync.HyJzDataSyncHandler` | 责任链、顺序和 Spring Order 的观察场景。 |
| `JAVA-ENGINEERING-010` | 10 | `dzzz-app/src/main/java/com/tdh/bdzz/download/DownloadUtil.java` / `com.tdh.bdzz.download.DownloadUtil`；`.../config/websocket/server/ClientChatWsServer.java` / `com.tdh.bdzz.config.websocket.server.ClientChatWsServer`；`.../config/ApplicationContextProvider.java` / `com.tdh.bdzz.config.ApplicationContextProvider`；`.../handler/burn/BurnPrintHandlerFactory.java` / `com.tdh.bdzz.handler.burn.BurnPrintHandlerFactory`；`.../config/websocket/server/Voice2TextWsServer.java` / `com.tdh.bdzz.config.websocket.server.Voice2TextWsServer` | 工厂、注册表和服务定位的观察场景；服务定位器反例只作边界提醒。 |
| `JAVA-ENGINEERING-013` | 164 | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/fyb/FybChatRoomWsServer.java` / `com.tdh.bdzz.config.websocket.server.fyb.FybChatRoomWsServer`；`.../config/websocket/server/LoggingWSServer.java` / `com.tdh.bdzz.config.websocket.server.LoggingWSServer`；`.../constant/TsAiRuntimeCache.java` / `com.tdh.bdzz.constant.TsAiRuntimeCache`；`.../enums/AJFL.java` / `com.tdh.bdzz.enums.AJFL`；`dzzz-app/src/test/java/com/tdh/bdzz/service/impl/TsFileSignNewDragServiceImplTest.java` / `com.tdh.bdzz.service.impl.TsFileSignNewDragServiceImplTest` | 有限状态、会话恢复、异步状态和迁移测试的观察场景。 |

冻结计数是审计覆盖量，存在文件重叠，不能相加成独立实现数。项目代码只用于选择场景，不证明实现正确；正文必须使用去敏、最小化、`adapted` 或 `corrected` 的纯 Java fixture。

## 正文知识点合同

正文必须使用 14 个独立三级知识点，每项完整包含“它是什么、有什么作用、什么时候使用、怎么使用、最小示例、运行结果、常见误区”七字段：

1. Servlet Filter 链的请求 dispatch 边界：节点可在前后处理请求，但一次 dispatch 只进入下游一次。
2. Spring MVC `HandlerInterceptor` 的前置、后置和完成回调顺序，以及异步 dispatch 的区别。
3. `FilterChainProxy` 如何按 matcher 选择唯一 `SecurityFilterChain`，以及无匹配链的拒绝边界。
4. `ServiceLoader` SPI 的 service type、classloader、延迟 provider 和缓存生命周期。
5. 唯一 key 注册：用 `putIfAbsent` 或构建期重复检查拒绝同 key 多实现。
6. 不可变注册表快照：复制、校验后发布 `Map.copyOf`，读者只看完整版本。
7. `AtomicReference.compareAndSet` 的并发发布与失败重试，不把 CAS 当多字段事务。
8. enum 显式有限状态集合：从外部输入映射到稳定 code，不持久化 `ordinal`。
9. 合法状态迁移表：`from + event -> to`，先验证来源和事件再写入目标。
10. CAS 状态迁移：一个并发单步只能由一个竞争者成功，失败者重新读取并决定是否重试。
11. 持久化 version 条件更新：`UPDATE ... WHERE id=? AND version=?` 是跨进程的冲突检测。
12. 状态与副作用的事务边界：本地持久化可同事务，远端调用和消息不自动成为同一事务。
13. Java 25/Java 8 纯语法反馈环：同一状态模型必须在两条 JDK 线上分别编译、运行并记录 class major。
14. JFR/JMH 测量边界：先用功能和并发断言证明合同，再独立测量局部吞吐、延迟和运行时事件。

## 易错点合同

正文至少覆盖以下 14 项，并为每项写出“现象、触发条件、原因、后果、错误示例、正确写法、影响版本、验证方式、来源”九字段：

1. 下游异常后捕获并再次 `chain.doFilter`，造成一次 dispatch 重复业务。
2. 把 `HandlerInterceptor` 当成能包装任意 request/response 的全局 Filter，漏掉非 MVC 资源。
3. 忽略异步 handler 的再次 dispatch，误判 `postHandle` 或 `afterCompletion` 次数。
4. 多条 `SecurityFilterChain` matcher 重叠，窄链遮蔽宽链或留下无匹配保护面。
5. 共享一个 `ServiceLoader` 并发迭代与 `reload`，触发竞态或失效迭代器。
6. 把 ServiceLoader cache 当成实时注册表，新增 provider 后仍复用旧 iterator。
7. 使用 `containsKey` 加 `put` 做唯一注册，两个线程同时通过检查造成覆盖。
8. 用 Java 8 `unmodifiableMap` 包装 live backing map，却宣称读者得到快照。
9. 把 `Map.copyOf` 当深复制，内部可变 value 仍与写者共享。
10. 用单个 CAS 分散更新 state、version、event，破坏跨字段不变量。
11. 将 enum `ordinal` 持久化，重排或插入常量后历史数据改变含义。
12. 只校验目标状态、不校验来源和事件，允许跳过中间步骤或终态回退。
13. 只在内存 CAS，不做数据库 version 条件更新，跨进程仍发生 last-write-wins。
14. 用 JMH/JFR 的“快”或“无异常”结果证明链路正确、事务安全或状态一致。

## 双 JDK 纯 Java 临时反馈环

实施正文时在 `/tmp/java-advanced-15-*` 下生成单文件 fixture，不向仓库保留测试或 class 文件。源代码必须只使用 Java 8 语法，并在每个方法和构造器定义前写规范中文 Javadoc；示例不得使用 `record`、`var`、switch expression、`Map.copyOf` 或其他 Java 9+ API。

1. `FilterBoundary` 用计数器模拟成功、拒绝、下游异常三条路径，断言 `chainOnce=1`，异常不重进链。
2. `Registry` 使用 `ConcurrentHashMap.putIfAbsent`，断言两个并发注册者只有一个获得唯一 key。
3. `SnapshotRegistry` 用普通 map 复制后发布只读视图；Java 25 使用等价 `Map.copyOf` 的现代对照，Java 8 保持复制加 `unmodifiableMap`，断言旧读者不会看到半成品。
4. `StateMachine` 使用 enum、显式 transition table 和 `AtomicReference`，断言合法迁移一次成功、非法边状态不变、两个竞争者只有一个完成 `NEW -> ACTIVE`。
5. `VersionedStore` 以内存 `id + version` 模拟 SQL 条件更新，断言 affected rows 为 1 或 0；说明真实数据库必须使用参数绑定和事务。
6. 输出固定为：`CHAIN_REGISTRY_STATE_PASS chainOnce=1 unique=1 transition=1 rollback=1`。
7. Java 25 和 Java 8 各编译运行两次；分别记录 `javac -Xlint:all -Werror`、主类输出和 `javap -verbose` class major，预期 Java 25 为 69、Java 8 为 52。
8. 若 Java 8 runtime 或依赖不可用，只能记录 `Deferred`，不能用 Java 25 结果替代；成功后使用 `find <target> -depth -delete` 删除专属临时目录并检查不存在。

该反馈环只证明固定模型中的可观察合同，不证明真实 Servlet/Spring 集成、数据库隔离级别、跨节点一致性、吞吐量或远端副作用。框架行为需要精确版本的临时 fixture，性能另用 JMH/JFR。

## 性能与观测边界

- JMH 报告必须记录 JDK、CPU、OS、代码变体、预热轮数、测量轮数、fork 数、输入规模和置信区间；只报告该基准的吞吐或延迟。
- JFR 使用 JDK 25 `jcmd <pid> JFR.start settings=profile`、固定负载和采样区间，记录线程、锁、分配等事件；停止后用 JMC 或 `jfr` 工具分析。
- “Map 查找很快”“CAS 总是更快”“责任链不会产生额外开销”等普遍结论没有本批测量支持，正文不得写入。
- JFR/JMH 不能替代状态、并发、事务和错误路径断言；先通过功能 Gate，再把性能结果作为独立观测证据。

## 新旧版本差异

| 对比项 | Java 25 / Spring 7 现代主线 | Java 8 / Boot 2.3 legacy | 迁移注意 |
| --- | --- | --- | --- |
| 注册表快照 | `Map.copyOf` 可表达不可修改 map | 复制后 `Collections.unmodifiableMap`；它是视图 | 先复制再发布，值对象仍需不可变或深复制 |
| 并发注册 | `ConcurrentMap` 条件更新与 `AtomicReference` 快照 | 同名 API 已存在 | 依赖具体实现原子性，不组合 `containsKey` + `put` |
| SPI | Java 25 `ServiceLoader` stream/provider API | Java 8 iterator/provider API | 两线都要管理 cache、reload 和并发边界 |
| MVC/Security | Spring 7 / Security 7 使用 `jakarta` 与现代 matcher | Spring 5.2.15 / Security 5.3.9 使用 legacy API | 不把旧包名、配置 DSL 和默认 matcher 复制到现代线 |
| 事务状态 | Framework 7 参考文档 | Boot 2.3.12 管理 Framework 5.2.15 | checked exception 回滚规则必须按精确版本验证 |

## 发布 Gate

- [x] ID、标题、sequence 640、两个前置和三个 `sourceCapabilityIds` 与冻结矩阵一致。
- [x] Java 25/Java 8、Boot 4.1/2.3.12、Spring 7/5.2.15 与 Security 7/5.3.9 边界已隔离。
- [x] 26 个唯一官方直接 URL 已记录 sourceType、适用版本、结论和核验日期。
- [x] 三个能力源共 186 条冻结项目证据计数（12 + 10 + 164），代表路径与稳定符号只来自现有矩阵。
- [x] 14 个七字段知识点、14 个九字段易错点、双 JDK 反馈环和 JFR/JMH 测量边界已冻结。
- [ ] 正文 frontmatter 使用本稿实际支持正文的同一 URL 集合，不增加“参考资料”章节。
- [ ] 双 JDK fixture 各运行两次，输出、class major、临时目录清理和 Deferred 边界写入正文批次证据。
- [ ] 当前课才可在正文、Catalog、track、loader、浏览器和独立 Standards/Spec 复审全部通过后切 `available`。
- [ ] 本课 signoff 绑定最终正文 SHA 后，才允许开始第 16 课；不得提前创建第 16 课资产。

## 研究结论与 Stop Boundary

本稿只完成 Java 高级第 15 课研究 Gate。研究稿通过 Prettier、来源 URL 可达性、冻结映射、SHA 和 scoped diff 核验后，主流程才可创建本课正文；当前不授权正文以外的发布变更，也不授权第 16 课、Reference、项目实践、提交或暂存。
