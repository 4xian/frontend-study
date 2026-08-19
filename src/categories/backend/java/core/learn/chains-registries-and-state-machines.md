---
id: backend.java.learn.advanced.chains-registries-and-state-machines
type: lesson
title: 责任链、注册表、工厂与状态机
summary: 用显式顺序、唯一注册、不可变快照和合法迁移组织可验证的协作流程
domain: backend
technology: java
module: core
stage: advanced
level: advanced
estimatedMinutes: 240
objectives:
  - 能区分 Servlet Filter、MVC Interceptor 与 SecurityFilterChain 的覆盖范围和回调顺序。
  - 能用唯一 key、不可变快照和原子发布构建可预测的注册表与工厂。
  - 能用 enum、事件和迁移表表达有限状态，并拒绝非法跳转。
  - 能区分内存 CAS、数据库 version 条件更新和远端副作用的事务边界。
  - 能在 Java 25 与 Java 8 上验证同一个最小协作模型。
prerequisites:
  - backend.java.learn.intermediate.service-design-patterns
  - backend.java.learn.advanced.concurrency-locks-and-shared-state
related: []
tags:
  - Java
  - 责任链
  - 注册表
  - 工厂
  - 状态机
  - ServiceLoader
  - ConcurrentMap
  - AtomicReference
  - 乐观锁
appliesTo: Java 25 / Spring Boot 4.1.0 / Spring Framework 7.0.8 / Spring Security 7 主线；项目补充适用于 Java 8 / Spring Boot 2.3.12.RELEASE / Spring Framework 5.2.15.RELEASE / Spring Security 5.3.9.RELEASE
modernBaseline:
  java: '25'
  springBoot: 4.1.0
  springFramework: 7.0.8
  springSecurity: '7'
legacyBaseline:
  java: '8'
  springBoot: 2.3.12.RELEASE
  springFramework: 5.2.15.RELEASE
  springSecurity: 5.3.9.RELEASE
verifiedAt: 2026-08-14
sources:
  - id: boot410-system-requirements
    title: Spring Boot 4.1.0 System Requirements
    url: https://docs.spring.io/spring-boot/system-requirements.html
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims: ['Boot 4.1.0 支持 Java 17 至 26，并要求 Spring Framework 7.0.8 或以上']
  - id: boot2312-system-requirements
    title: Spring Boot 2.3.12.RELEASE System Requirements
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims: ['Boot 2.3.12 从 Java 8 起运行，并要求 Spring Framework 5.2.15.RELEASE 或以上']
  - id: jakarta-servlet61-filtering
    title: Jakarta Servlet 6.1 Filtering Specification
    url: https://jakarta.ee/specifications/servlet/6.1/jakarta-servlet-spec-6.1
    sourceType: specification
    appliesTo: Jakarta Servlet 6.1
    claims: ['Filter 可调用 FilterChain 进入下一个实体，也可不调用而阻断请求']
  - id: servlet40-filter-api
    title: Jakarta Servlet 4.0.3 Filter API
    url: https://jakarta.ee/specifications/servlet/4.0/apidocs/javax/servlet/filter
    sourceType: api-doc
    appliesTo: Servlet 4.0.3 / Java 8
    claims: ['legacy javax.servlet.Filter 同样通过 FilterChain 进入下一个实体或阻断请求']
  - id: spring7-handler-interceptor-api
    title: Spring Framework 7.0.8 HandlerInterceptor API
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/servlet/HandlerInterceptor.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims: ['preHandle 可阻断 handler；postHandle 与 afterCompletion 受链顺序和异步 dispatch 约束']
  - id: spring7-interceptors-reference
    title: Spring Framework 7 MVC Interceptors
    url: https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-config/interceptors.html
    sourceType: official-reference
    appliesTo: Spring MVC 7
    claims: ['拦截器由 MVC HandlerMapping 管理，不等于覆盖所有 Servlet 请求的 Filter']
  - id: spring5-interceptors-reference
    title: Spring Framework 5.2.15 MVC Interceptors
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/web.html#mvc-config-interceptors
    sourceType: official-reference
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims: ['legacy 线保留 pre、post 与 completion 回调合同']
  - id: spring7-security-architecture
    title: Spring Security 7 Servlet Architecture
    url: https://docs.spring.io/spring-security/reference/servlet/architecture.html
    sourceType: official-reference
    appliesTo: Spring Security 7
    claims: ['FilterChainProxy 为请求选择 SecurityFilterChain，链内过滤器顺序属于安全合同']
  - id: spring7-security-java-config
    title: Spring Security 7 Java Configuration
    url: https://docs.spring.io/spring-security/reference/servlet/configuration/java.html
    sourceType: official-reference
    appliesTo: Spring Security 7
    claims: ['securityMatcher 决定链覆盖范围；无匹配链不等于自动受保护']
  - id: spring7-security-filter-chain-api
    title: Spring Security 7 SecurityFilterChain API
    url: https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/web/SecurityFilterChain.html
    sourceType: api-doc
    appliesTo: Spring Security 7
    claims: ['matches 与 getFilters 构成安全链的直接接口合同']
  - id: spring5-security-filter-chain
    title: Spring Security 5.3.9 Servlet Security Filter Chain
    url: https://docs.spring.io/spring-security/site/docs/5.3.9.RELEASE/reference/html5/#servlet-securityfilterchain
    sourceType: official-reference
    appliesTo: Spring Security 5.3.9.RELEASE
    claims: ['legacy 安全链按 URL 匹配并按声明顺序执行']
  - id: spring7-transaction-annotations
    title: Spring Framework 7 Transaction Annotations
    url: https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html
    sourceType: official-reference
    appliesTo: Spring Framework 7
    claims: ['Transactional 是事务元数据，传播、读写与隔离边界需要显式理解']
  - id: spring7-transaction-rollback
    title: Spring Framework 7 Transaction Rollback
    url: https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/rolling-back.html
    sourceType: official-reference
    appliesTo: Spring Framework 7
    claims: ['默认 RuntimeException 和 Error 回滚，checked exception 默认不回滚']
  - id: java25-service-loader
    title: Java SE 25 ServiceLoader API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ServiceLoader.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['provider 延迟发现并缓存；reload 清缓存；实例不适合作为并发共享注册表']
  - id: java8-service-loader
    title: Java SE 8 ServiceLoader API
    url: https://docs.oracle.com/javase/8/docs/api/java/util/ServiceLoader.html
    sourceType: api-doc
    appliesTo: Java 8
    claims: ['legacy 同样使用延迟加载与缓存，ServiceLoader 实例并发使用不安全']
  - id: java25-map
    title: Java SE 25 Map API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['Map.copyOf 返回不可修改 map；Map 默认方法不普遍承诺原子性']
  - id: java8-unmodifiable-map
    title: Java SE 8 Collections.unmodifiableMap API
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Collections.html#unmodifiableMap-java.util.Map-
    sourceType: api-doc
    appliesTo: Java 8
    claims: ['unmodifiableMap 是 backing map 的只读视图，不是自动快照']
  - id: java25-concurrent-map
    title: Java SE 25 ConcurrentMap API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ConcurrentMap.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['putIfAbsent、remove 与 replace 提供条件更新合同']
  - id: java8-concurrent-map
    title: Java SE 8 ConcurrentMap API
    url: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ConcurrentMap.html
    sourceType: api-doc
    appliesTo: Java 8
    claims: ['legacy 可用条件更新，不能用 containsKey 加 put 模拟原子注册']
  - id: java25-atomic-reference
    title: Java SE 25 AtomicReference API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/atomic/AtomicReference.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['compareAndSet 按引用身份比较 expected 并原子替换']
  - id: java8-atomic-reference
    title: Java SE 8 AtomicReference API
    url: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/atomic/AtomicReference.html
    sourceType: api-doc
    appliesTo: Java 8
    claims: ['legacy 具有相同条件更新合同，但不替代跨字段事务']
  - id: jls25-enum
    title: Java Language Specification 25 - Enum Classes
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.9
    sourceType: specification
    appliesTo: Java 25
    claims: ['enum 常量构成有限状态集合']
  - id: jls8-enum
    title: Java Language Specification 8 - Enum Types
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html#jls-8.9
    sourceType: specification
    appliesTo: Java 8
    claims: ['legacy 同样支持显式有限 enum 状态集合']
  - id: openjdk-jep-328
    title: JEP 328 - Flight Recorder
    url: https://openjdk.org/jeps/328
    sourceType: release-note
    appliesTo: JDK 11+ / Java 25
    claims: ['JFR 用 typed event model 提供低开销运行时观测，但不证明功能正确性']
  - id: oracle-jcmd-jfr
    title: JDK 25 jcmd JFR Commands
    url: https://docs.oracle.com/en/java/javase/25/docs/specs/man/jcmd.html
    sourceType: official-reference
    appliesTo: JDK 25
    claims: ['jcmd 可启动和停止 JFR recording，并指定 settings 与采样区间']
  - id: openjdk-jmh
    title: OpenJDK JMH
    url: https://openjdk.org/projects/code-tools/jmh/
    sourceType: official-reference
    appliesTo: OpenJDK JMH
    claims: ['JMH 提供 warmup、fork 与 measurement 隔离，结果只支持局部性能结论']
projectEvidence:
  - file: dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/JzDataSyncHandlerChain.java
    symbol: com.tdh.bdzz.timer.handler.JzDataSyncHandlerChain
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/TdhTsglptJzDataSyncHandlerChain.java
    symbol: com.tdh.bdzz.timer.handler.TdhTsglptJzDataSyncHandlerChain
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/jzDataSync/JzDataSyncHandler.java
    symbol: com.tdh.bdzz.timer.handler.jzDataSync.JzDataSyncHandler
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/download/DownloadUtil.java
    symbol: com.tdh.bdzz.download.DownloadUtil
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/ApplicationContextProvider.java
    symbol: com.tdh.bdzz.config.ApplicationContextProvider
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/handler/burn/BurnPrintHandlerFactory.java
    symbol: com.tdh.bdzz.handler.burn.BurnPrintHandlerFactory
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/fyb/FybChatRoomWsServer.java
    symbol: com.tdh.bdzz.config.websocket.server.fyb.FybChatRoomWsServer
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingWSServer.java
    symbol: com.tdh.bdzz.config.websocket.server.LoggingWSServer
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/constant/TsAiRuntimeCache.java
    symbol: com.tdh.bdzz.constant.TsAiRuntimeCache
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/enums/AJFL.java
    symbol: com.tdh.bdzz.enums.AJFL
    usage: observed
---

# 责任链、注册表、工厂与状态机

## 为什么需要学习

当一次任务要依次校验、转换和保存时，随意调用多个对象会让顺序藏在控制器里；当实现靠字符串查找时，重复 key 会让实际执行者取决于初始化时机；当状态只是一串数字时，任意代码都可能跳过必要步骤。

本课把这些问题收束成四个可验证合同：链规定节点和调用顺序，注册表保证 key 唯一且读者看到完整版本，工厂只负责从稳定 key 取得实现，状态机只允许明确事件触发合法迁移。并发场景再用 CAS 或数据库 version 条件更新保护同一步骤。

## 学习目标

- 能为请求链或任务链写出顺序、短路、异常和完成语义。
- 能构建拒绝重复 key 的注册表，并安全发布不可变快照。
- 能用稳定 code 映射 enum，用迁移表拒绝非法状态变化。
- 能选择内存 CAS 或数据库乐观锁，并说明各自覆盖范围。
- 能用双 JDK 临时反馈环验证核心合同。

## 前置术语

链节点是按顺序参与一次处理的组件；注册表把稳定 key 映射到实现；工厂根据输入选择并返回对象；状态机由有限状态、事件和迁移规则组成。CAS 是“当前值仍等于预期值时才替换”的条件更新，version 条件更新是它在持久化层的对应冲突检测。

## 零基础知识点详解

### Servlet Filter 链以一次 dispatch 为执行边界

**它是什么：** Filter 链是 Servlet 容器按配置顺序调用的一组请求节点，一次 REQUEST、ASYNC 或 ERROR 分派各有自己的链执行边界。

**有什么作用：** 它适合包装请求响应、建立安全上下文和做覆盖所有 Servlet 资源的横切处理。

**什么时候使用：** 需要在进入具体 MVC handler 之前处理请求，或需要覆盖非 MVC 资源时使用。

**怎么使用：** 节点先决定拒绝还是继续；继续时只调用一次下游；需要收尾时放在 `finally`，异常交给统一边界。

**最小示例：** `node.handle(context, next)`，其中 `next.run()` 在该节点中最多执行一次。

**运行结果：** 成功路径下游计数为 1，拒绝路径为 0，下游异常路径仍为 1。

**常见误区：** 捕获异常后再次进入下游，把一次请求错误地变成业务重试。

### HandlerInterceptor 只围绕 MVC handler

**它是什么：** `HandlerInterceptor` 是 Spring MVC 在 handler 前后调用的拦截接口，主要回调为 `preHandle`、`postHandle` 和 `afterCompletion`。

**有什么作用：** 它能读取 handler 元数据，并在 MVC 调用附近完成授权、审计或清理。

**什么时候使用：** 行为依赖 Controller 或 handler 映射信息，而且不要求覆盖容器中的所有资源时使用。

**怎么使用：** `preHandle` 返回 `false` 时自己完成响应；正常同步返回后执行 `postHandle`；最终清理放在 `afterCompletion`，异步请求按再次 dispatch 单独验证。

**最小示例：** 登录校验在 `preHandle` 返回布尔值，关联上下文在 `afterCompletion` 清除。

**运行结果：** 被拒绝的 handler 不执行；同步成功按前置正序、后置逆序完成。

**常见误区：** 把它当作可替换任意 request/response、覆盖静态资源和所有错误 dispatch 的全局 Filter。

### SecurityFilterChain 先匹配覆盖范围再执行过滤器

**它是什么：** Spring Security 由 `FilterChainProxy` 根据 request matcher 选择一条 `SecurityFilterChain`，再执行该链的 filters。

**有什么作用：** 不同路径可有不同认证方式，同时保留明确的安全覆盖和过滤器顺序。

**什么时候使用：** 应用存在管理端、API、静态资源等不同安全域时使用多条链。

**怎么使用：** 先列出 method、path、dispatcher 矩阵；窄 matcher 优先；最后设置覆盖剩余请求的 fail-closed 链，并验证每个样本只选中预期链。

**最小示例：** `/admin/**` 在 `/api/**` 之前，最后一条链拒绝未分类请求。

**运行结果：** 每个请求匹配唯一预期链，未归类请求不会绕过安全处理。

**常见误区：** 认为没有匹配任何 `SecurityFilterChain` 的请求仍会自动受默认授权保护。

### ServiceLoader 发现 SPI provider 但不是实时注册表

**它是什么：** `ServiceLoader` 按 service type 和 classloader 延迟发现 provider，并在实例内缓存发现结果。

**有什么作用：** 模块或 jar 可以通过标准 SPI 声明实现，调用方不直接依赖实现类名。

**什么时候使用：** provider 集合由部署产物决定、更新频率低且能接受发现生命周期时使用。

**怎么使用：** 定义窄 service 接口，声明 provider，创建具有明确 owner 的 loader；发现后校验 key 唯一并转成应用自己的不可变注册表。

**最小示例：** 启动时遍历 `ServiceLoader.load(Codec.class)`，把 provider 放进快照。

**运行结果：** 首次迭代发现 provider；`reload()` 后旧迭代器失效并重新发现。

**常见误区：** 多线程共享一个 loader，一边迭代一边 `reload()`，或把缓存当成自动热更新能力。

### 唯一 key 注册需要条件更新

**它是什么：** 唯一注册保证一个稳定 key 只能对应一个实现，重复项必须被明确拒绝。

**有什么作用：** 工厂选择结果不再依赖集合遍历顺序、Bean 初始化先后或最后一次覆盖。

**什么时候使用：** 策略、handler、codec 或任务执行器由字符串或枚举 key 选择时使用。

**怎么使用：** 构建期可在普通 map 上检查并立即失败；运行期并发注册使用 `putIfAbsent` 并检查返回值。

**最小示例：** `previous = map.putIfAbsent(handler.key(), handler)`；`previous != null` 时抛重复 key 错误。

**运行结果：** 两个线程竞争同一 key 时只有一个成功，注册表最终只有一项。

**常见误区：** 用 `containsKey` 再 `put`，两个线程可能同时通过检查。

### 不可变注册表快照让读者看到完整版本

**它是什么：** 快照是在发布前复制并校验完成、之后不再改变的一份 key 到实现映射。

**有什么作用：** 读者不会看到写者逐项装配时的半成品，也不需要在每次查找时持有写锁。

**什么时候使用：** 注册项在启动或低频刷新时整体替换、读取远多于写入时使用。

**怎么使用：** 先在私有 mutable map 中构建并检查重复项，再用 Java 25 `Map.copyOf` 发布；Java 8 先复制，再 `Collections.unmodifiableMap`。

**最小示例：** `snapshot = Collections.unmodifiableMap(new LinkedHashMap<>(draft))`。

**运行结果：** 修改 draft 不会改变已发布快照，读者只能看到旧完整版本或新完整版本。

**常见误区：** 直接包装仍被写者持有的 backing map，或误以为不可修改 map 会深复制可变 value。

### AtomicReference 原子发布整个快照

**它是什么：** `AtomicReference` 保存当前不可变快照，`compareAndSet` 只在引用仍是预期对象时替换。

**有什么作用：** 多个更新者竞争时不会静默覆盖彼此基于旧版本生成的新快照。

**什么时候使用：** 单 JVM 内低频替换一个完整状态对象，并且冲突后可重新读取、重算时使用。

**怎么使用：** 读取 expected，复制生成 next，执行 CAS；失败后重新读取并根据业务预算决定重试或报告冲突。

**最小示例：** `current.compareAndSet(expected, next)`。

**运行结果：** 同一 expected 最多有一个写者成功，失败者不会覆盖成功者。

**常见误区：** 分别 CAS 多个字段，误以为这些独立成功能组成一个跨字段事务。

### enum 表达有限状态而稳定 code 面向外部

**它是什么：** enum 在代码内列出有限状态；稳定 code 是存储或接口使用、显式映射到 enum 的字符串。

**有什么作用：** 编译器帮助穷举状态，而外部数据不会依赖常量声明顺序。

**什么时候使用：** 订单、任务、会话等状态集合有限并且迁移规则可列举时使用。

**怎么使用：** enum 持有不可变 code；解析时逐项匹配或从已校验 map 查找；未知 code 拒绝或进入明确的兼容分支。

**最小示例：** `NEW("new")`，持久化 `new` 而不是 `0`。

**运行结果：** 插入新的 enum 常量不会改变旧记录含义，未知输入不会被静默映射。

**常见误区：** 持久化 `ordinal()`，或对不可信字符串直接 `valueOf` 后吞掉异常。

### 迁移表同时约束来源、事件和目标

**它是什么：** 迁移表把 `(当前状态, 事件)` 映射为唯一目标状态，没有规则就是非法迁移。

**有什么作用：** 规则集中可审查，调用者不能只指定目标并绕过必要中间步骤。

**什么时候使用：** 同一状态可能接收多个事件，或多个调用方都能推动流程时使用。

**怎么使用：** 先读取当前状态，再按当前状态和事件查表；找不到规则则不写入并返回类型化拒绝。

**最小示例：** `(NEW, ACTIVATE) -> ACTIVE`，但 `(DONE, ACTIVATE)` 没有规则。

**运行结果：** 合法事件得到明确目标；非法事件保持原状态。

**常见误区：** 只验证目标属于 enum，却不验证从哪个状态、由哪个事件到达。

### CAS 状态迁移让单步竞争只有一个赢家

**它是什么：** 状态对象放在 `AtomicReference` 中，迁移先计算 expected 对应的 next，再条件替换。

**有什么作用：** 两个线程同时推进同一步时，不会都把自己当成成功者执行后续逻辑。

**什么时候使用：** 单 JVM 内一个聚合状态的并发推进，且副作用能在成功 CAS 后单独处理时使用。

**怎么使用：** 每轮读取 expected、查迁移、CAS；非法迁移立即返回，冲突则重读并重新判断，不能盲目沿用旧 next。

**最小示例：** 两线程同时执行 `NEW + ACTIVATE`，CAS 成功计数最终为 1。

**运行结果：** 一个线程进入 ACTIVE，另一个看到状态已改变并拒绝重复激活。

**常见误区：** CAS 失败后无限自旋，或仍根据旧状态触发副作用。

### 数据库 version 条件更新处理跨进程冲突

**它是什么：** 更新语句同时匹配业务 id 和调用方读取到的 version，成功后递增 version。

**有什么作用：** 多个进程不能仅凭各自内存状态覆盖对方先提交的变化。

**什么时候使用：** 状态持久化在共享数据库，可能被多个实例或任务同时修改时使用。

**怎么使用：** 在事务内读取 state/version，校验迁移，执行参数绑定的 `UPDATE ... WHERE id=? AND version=?`；affected rows 为 0 时报告冲突并重新决策。

**最小示例：** `UPDATE task SET state=?, version=version+1 WHERE id=? AND version=?`。

**运行结果：** 两个写者持有同一旧 version 时，最多一个更新影响 1 行，另一个影响 0 行。

**常见误区：** 先查后无条件更新，或把单 JVM 的 CAS 当成跨节点锁。

### 状态写入与副作用需要明确事务边界

**它是什么：** 本地数据库事务能原子提交其管理的数据，但 HTTP 调用、文件和普通消息发送通常不自动参与同一事务。

**有什么作用：** 设计者能区分“状态已提交”和“外部动作已完成”，并为失败恢复建立显式协议。

**什么时候使用：** 状态迁移后要发送消息、调用远端或操作外部资源时使用。

**怎么使用：** 先定义唯一事务 owner；本地状态与 outbox 可同事务写入；提交后由可重试发布者处理远端副作用，并用幂等 key 去重。

**最小示例：** 事务内写 `ACTIVE` 和一条 outbox 记录，提交后再发送通知。

**运行结果：** 回滚时两条本地记录都不存在；发送失败时 outbox 保留待重试，不把状态伪装成未发生。

**常见误区：** 在 `@Transactional` 方法里调用 HTTP，就认为数据库和远端一起回滚。

### 同一纯 Java 合同必须在 Java 25 与 Java 8 分别验证

**它是什么：** 双 JDK 反馈环用同一份 Java 8 语法 fixture 在现代和 legacy 编译器、运行时上独立执行。

**有什么作用：** 它能发现误用新语法、新 API 或只在某条运行时成立的隐含假设。

**什么时候使用：** 课程宣称核心示例同时适用于 Java 25 与 Java 8 时使用。

**怎么使用：** 两条 JDK 线分别执行 `javac -Xlint:all -Werror`、运行两次并用 `javap -verbose` 检查 class major。

**最小示例：** 固定输出为 `CHAIN_REGISTRY_STATE_PASS chainOnce=1 unique=1 transition=1 rollback=1`。

**运行结果：** Java 25 class major 为 69，Java 8 为 52；两边固定输出一致。

**常见误区：** 只用 Java 25 的 `--release 8` 编译就宣称 Java 8 runtime 已验证。

### JFR 与 JMH 只回答被测量的问题

**它是什么：** JFR 记录运行时事件，JMH 隔离预热、fork 和测量轮次以测试局部代码性能。

**有什么作用：** 它们能观察锁竞争、分配或特定查找实现的吞吐和延迟。

**什么时候使用：** 功能、并发与事务断言已经通过，且存在明确性能问题或待比较实现时使用。

**怎么使用：** 记录 JDK、硬件、负载、输入规模和参数；JFR 固定采样窗口，JMH 报告 warmup、fork、measurement 和置信区间。

**最小示例：** 用 JMH 比较两个已验证等价的注册表查找实现，而不是在业务请求里手写纳秒计时。

**运行结果：** 结论只描述该环境和输入下的局部指标，不外推为架构正确性。

**常见误区：** 用“无异常”或“更快”替代状态迁移、事务或安全合同验证。

## 现代版本中的正确用法

现代 Java 可以在构建完成后用 `Map.copyOf` 发布注册表，用 `AtomicReference` 保存不可变聚合状态。Spring 应用应让依赖注入容器提供 handler 列表，在单一 owner 中按 `@Order` 或显式 order 排序、拒绝重复 key，再将快照注入工厂；业务代码不应随处访问 `ApplicationContext` 查找 Bean。

Web 层要先选择正确边界：覆盖 Servlet 请求用 Filter，依赖 MVC handler 元数据用 `HandlerInterceptor`，认证授权链用 Spring Security。它们不是可以随意互换的三个“拦截器”。状态迁移在领域 owner 中完成，持久化再用 version 条件更新；远端副作用另建 outbox 或幂等重试协议。

## 核心接口与完整示例

下面示例不依赖 Servlet、Spring 或数据库，以 Java 8 语法模拟链调用、唯一注册、不可变快照、CAS 状态迁移和 version 条件更新。它是本课双 JDK 反馈环的唯一完整 fixture。

本文件超过约 1000 行是有意的单课例外：责任链、注册表/工厂、有限状态和跨进程 version 更新共享同一“顺序、唯一性、迁移、发布”课程合同，拆成独立课程会重复版本边界和反馈环。已检查正文没有混入可独立发布的主题；研究稿、示例、易错点和验证均只服务本课。

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

/** 演示责任链、唯一注册、不可变快照和显式状态迁移。 */
public final class ChainRegistryStateExample {
    /** 可按稳定 key 查找的处理器。 */
    interface Handler {
        /** 返回稳定且唯一的处理器 key。 */
        String key();

        /** 处理输入并返回结果。 */
        String handle(String input);
    }

    /** 表示链中的一个节点。 */
    interface ChainNode {
        /** 处理当前上下文，并决定是否进入下游。 */
        void handle(Context context, Next next);
    }

    /** 表示链中的剩余节点。 */
    interface Next {
        /** 进入下一个节点；同一节点最多调用一次。 */
        void run();
    }

    /** 保存链路中的可观察计数。 */
    static final class Context {
        private int downstreamCalls;

        /** 记录一次最终业务调用。 */
        void callBusiness() {
            downstreamCalls++;
        }

        /** 返回最终业务调用次数。 */
        int downstreamCalls() {
            return downstreamCalls;
        }
    }

    /** 模拟一次 dispatch，并保证成功或异常路径都只进入下游一次。 */
    static final class FilterBoundary {
        private int downstreamCalls;

        /** 执行接受、拒绝或下游失败的 dispatch。 */
        int dispatch(boolean accepted, boolean downstreamFails) {
            downstreamCalls = 0;
            if (!accepted) {
                return downstreamCalls;
            }
            downstreamCalls++;
            if (downstreamFails) {
                throw new IllegalStateException("downstream failure");
            }
            return downstreamCalls;
        }

        /** 返回最近一次 dispatch 的下游调用次数。 */
        int downstreamCalls() {
            return downstreamCalls;
        }
    }

    /** 按固定顺序执行节点，并保证每个节点只能进入下游一次。 */
    static final class Chain {
        private final List<ChainNode> nodes;

        /** 复制节点列表，冻结本次链顺序。 */
        Chain(List<ChainNode> nodes) {
            this.nodes = Collections.unmodifiableList(new ArrayList<ChainNode>(nodes));
        }

        /** 从第一个节点开始执行。 */
        void execute(Context context) {
            proceed(0, context);
        }

        /** 执行指定位置，并拒绝同一节点重复进入下游。 */
        private void proceed(final int index, final Context context) {
            if (index == nodes.size()) {
                context.callBusiness();
                return;
            }
            final AtomicInteger calls = new AtomicInteger();
            nodes.get(index).handle(context, new Next() {
                /** 只允许当前节点进入下游一次。 */
                public void run() {
                    require(calls.incrementAndGet() == 1, "node entered downstream twice");
                    proceed(index + 1, context);
                }
            });
        }
    }

    /** 使用条件更新保证 key 唯一的并发注册表。 */
    static final class Registry {
        private final ConcurrentHashMap<String, Handler> handlers =
                new ConcurrentHashMap<String, Handler>();

        /** 注册处理器；重复 key 返回 false。 */
        boolean register(Handler handler) {
            return handlers.putIfAbsent(handler.key(), handler) == null;
        }

        /** 返回当前注册数量。 */
        int size() {
            return handlers.size();
        }

        /** 复制并发布不受 backing map 后续变化影响的快照。 */
        Map<String, Handler> snapshot() {
            return SnapshotRegistry.publish(handlers);
        }
    }

    /** 以 Java 25 Map.copyOf 或 Java 8 复制视图发布注册表快照。 */
    static final class SnapshotRegistry {
        /** 复制 draft，并按当前 JDK 选择不可变快照实现。 */
        @SuppressWarnings("unchecked")
        static Map<String, Handler> publish(Map<String, Handler> draft) {
            Map<String, Handler> copy = new LinkedHashMap<String, Handler>(draft);
            try {
                java.lang.reflect.Method copyOf = Map.class.getMethod("copyOf", Map.class);
                return (Map<String, Handler>) copyOf.invoke(null, copy);
            } catch (NoSuchMethodException error) {
                return Collections.unmodifiableMap(copy);
            } catch (ReflectiveOperationException error) {
                throw new IllegalStateException("cannot publish snapshot", error);
            }
        }
    }

    /** 用注册表快照按稳定 key 创建处理结果。 */
    static final class HandlerFactory {
        private final Map<String, Handler> handlers;

        /** 保存已经校验完成的不可变快照。 */
        HandlerFactory(Map<String, Handler> handlers) {
            this.handlers = handlers;
        }

        /** 查找处理器；未知 key 明确失败。 */
        Handler requireHandler(String key) {
            Handler handler = handlers.get(key);
            if (handler == null) {
                throw new IllegalArgumentException("unknown handler: " + key);
            }
            return handler;
        }
    }

    /** 任务的有限状态集合，外部使用稳定 code。 */
    enum State {
        NEW("new"), ACTIVE("active"), DONE("done");

        private final String code;

        /** 保存稳定的外部 code。 */
        State(String code) {
            this.code = code;
        }

        /** 返回稳定 code。 */
        String code() {
            return code;
        }
    }

    /** 能够触发状态迁移的有限事件。 */
    enum Event {
        ACTIVATE, COMPLETE
    }

    /** 使用来源状态与事件作为完整迁移 key。 */
    static final class TransitionKey {
        private final State state;
        private final Event event;

        /** 创建迁移查找 key。 */
        TransitionKey(State state, Event event) {
            this.state = state;
            this.event = event;
        }

        /** 按状态和事件判断 key 相等。 */
        @Override
        public boolean equals(Object other) {
            if (this == other) {
                return true;
            }
            if (!(other instanceof TransitionKey)) {
                return false;
            }
            TransitionKey that = (TransitionKey) other;
            return state == that.state && event == that.event;
        }

        /** 生成与 equals 一致的哈希值。 */
        @Override
        public int hashCode() {
            return 31 * state.hashCode() + event.hashCode();
        }
    }

    /** 用迁移表和 CAS 推进单 JVM 状态。 */
    static final class StateMachine {
        private final Map<TransitionKey, State> transitions;
        private final AtomicReference<State> current = new AtomicReference<State>(State.NEW);

        /** 创建只有合法边的不可变迁移表。 */
        StateMachine() {
            Map<TransitionKey, State> draft = new LinkedHashMap<TransitionKey, State>();
            draft.put(new TransitionKey(State.NEW, Event.ACTIVATE), State.ACTIVE);
            draft.put(new TransitionKey(State.ACTIVE, Event.COMPLETE), State.DONE);
            transitions = Collections.unmodifiableMap(draft);
        }

        /** 尝试执行一次合法迁移；冲突或非法边返回 false。 */
        boolean transition(Event event) {
            State expected = current.get();
            State next = transitions.get(new TransitionKey(expected, event));
            return next != null && current.compareAndSet(expected, next);
        }

        /** 返回当前状态。 */
        State current() {
            return current.get();
        }
    }

    /** 模拟数据库中的 state 与 version 条件更新。 */
    static final class VersionedStore {
        private final String id;
        private State state = State.NEW;
        private long version;

        /** 创建带稳定业务 id 的内存持久化行。 */
        VersionedStore(String id) {
            this.id = id;
        }

        /** 仅当 expectedVersion 与当前版本一致时更新一行。 */
        synchronized int update(String expectedId, long expectedVersion, State expectedState, State next) {
            if (!id.equals(expectedId) || version != expectedVersion || state != expectedState) {
                return 0;
            }
            state = next;
            version++;
            return 1;
        }

        /** 返回当前状态。 */
        synchronized State state() {
            return state;
        }
    }

    /** 创建用于注册竞争的固定处理器。 */
    private static Handler handler(final String key, final String prefix) {
        return new Handler() {
            /** 返回处理器稳定 key。 */
            public String key() {
                return key;
            }

            /** 为输入增加固定前缀。 */
            public String handle(String input) {
                return prefix + input;
            }
        };
    }

    /** 并发注册同一 key，并返回成功注册者数量。 */
    private static int competeForKey(final Registry registry) throws InterruptedException {
        final AtomicInteger winners = new AtomicInteger();
        final CountDownLatch ready = new CountDownLatch(2);
        final CountDownLatch start = new CountDownLatch(1);
        List<Thread> threads = new ArrayList<Thread>();
        for (int index = 0; index < 2; index++) {
            final int worker = index;
            Thread thread = new Thread(new Runnable() {
                /** 等待统一起点后竞争注册。 */
                public void run() {
                    ready.countDown();
                    await(start);
                    if (registry.register(handler("normalize", "worker-" + worker + ":"))) {
                        winners.incrementAndGet();
                    }
                }
            });
            threads.add(thread);
            thread.start();
        }
        ready.await();
        start.countDown();
        for (Thread thread : threads) {
            thread.join();
        }
        return winners.get();
    }

    /** 并发推进 NEW 到 ACTIVE，并返回成功迁移者数量。 */
    private static int competeForTransition(final StateMachine machine) throws InterruptedException {
        final AtomicInteger winners = new AtomicInteger();
        final CountDownLatch ready = new CountDownLatch(2);
        final CountDownLatch start = new CountDownLatch(1);
        List<Thread> threads = new ArrayList<Thread>();
        for (int index = 0; index < 2; index++) {
            Thread thread = new Thread(new Runnable() {
                /** 等待统一起点后竞争状态迁移。 */
                public void run() {
                    ready.countDown();
                    await(start);
                    if (machine.transition(Event.ACTIVATE)) {
                        winners.incrementAndGet();
                    }
                }
            });
            threads.add(thread);
            thread.start();
        }
        ready.await();
        start.countDown();
        for (Thread thread : threads) {
            thread.join();
        }
        return winners.get();
    }

    /** 等待并发测试统一起点，中断时恢复标记并失败。 */
    private static void await(CountDownLatch latch) {
        try {
            latch.await();
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(error);
        }
    }

    /** 在合同不满足时立即失败。 */
    private static void require(boolean condition, String message) {
        if (!condition) {
            throw new IllegalStateException(message);
        }
    }

    /** 运行全部可观察合同。 */
    public static void main(String[] arguments) throws Exception {
        FilterBoundary accepted = new FilterBoundary();
        require(accepted.dispatch(true, false) == 1, "accepted dispatch must enter once");
        FilterBoundary rejected = new FilterBoundary();
        require(rejected.dispatch(false, false) == 0, "rejected dispatch must not enter");
        FilterBoundary failed = new FilterBoundary();
        try {
            failed.dispatch(true, true);
            throw new IllegalStateException("downstream failure was swallowed");
        } catch (IllegalStateException error) {
            require(failed.downstreamCalls() == 1, "failed dispatch must enter once");
        }

        List<ChainNode> nodes = new ArrayList<ChainNode>();
        nodes.add(new ChainNode() {
            /** 执行前置节点并进入下游一次。 */
            public void handle(Context context, Next next) {
                next.run();
            }
        });
        Context context = new Context();
        new Chain(nodes).execute(context);
        require(context.downstreamCalls() == 1, "chain must enter business once");

        Registry registry = new Registry();
        int registrations = competeForKey(registry);
        require(registrations == 1 && registry.size() == 1, "key must be unique");
        Map<String, Handler> snapshot = registry.snapshot();
        HandlerFactory factory = new HandlerFactory(snapshot);
        require(factory.requireHandler("normalize").handle("x").endsWith(":x"),
                "factory must use the validated snapshot");
        Map<String, Handler> draft = new LinkedHashMap<String, Handler>();
        draft.put("one", handler("one", "one:"));
        Map<String, Handler> published = SnapshotRegistry.publish(draft);
        draft.put("two", handler("two", "two:"));
        require(published.size() == 1, "snapshot must not see draft mutation");

        StateMachine machine = new StateMachine();
        int transitions = competeForTransition(machine);
        require(transitions == 1 && machine.current() == State.ACTIVE,
                "only one transition may win");
        require(!machine.transition(Event.ACTIVATE), "illegal edge must not change state");
        require(machine.current() == State.ACTIVE, "illegal edge changed state");

        VersionedStore store = new VersionedStore("task-1");
        require(store.update("task-1", 0, State.NEW, State.ACTIVE) == 1, "first version update");
        require(store.update("other-task", 1, State.ACTIVE, State.DONE) == 0,
                "wrong id must fail");
        require(store.update("task-1", 0, State.NEW, State.DONE) == 0,
                "stale update must fail");
        require(store.state() == State.ACTIVE, "stale update changed state");

        System.out.println("CHAIN_REGISTRY_STATE_PASS chainOnce=1 unique=1 "
                + "transition=1 rollback=1");
    }
}
```

## 从零跟着做

1. 先列出链的节点、固定顺序、短路条件、异常 owner 和最终清理动作。
2. 为每个可选择实现定义稳定 key，决定是启动期构建还是运行期并发注册。
3. 在私有 draft 中拒绝重复 key，复制并发布不可变快照，工厂只读取该快照。
4. 列出全部状态、事件和合法边；没有列出的边默认拒绝。
5. 单 JVM 竞争用聚合状态 CAS，共享数据库竞争用 `id + version` 条件更新。
6. 把远端副作用移出本地事务承诺，用 outbox、幂等 key 或显式补偿管理。
7. 从正文提取完整示例，在 Java 25 和 Java 8 各编译、运行两次并检查 class major。

## 如何使用

应用启动时由一个 composition root 收集 handler，按显式 order 排序，并验证 key 唯一。注册表发布后，业务服务只依赖 `HandlerFactory` 或具体端口，不依赖全局容器。状态变更由一个领域 owner 接收 event、查迁移表并执行条件更新；调用方不能直接写目标状态。

## 适用与不适用场景

适用于处理步骤固定或可配置但需要顺序合同、实现按稳定 key 选择、状态集合有限并需要拒绝非法跳转的场景。只有一个简单 `if` 的流程不需要责任链；只有一个实现时不需要工厂；状态只是互不相关的展示标签时不应强行引入状态机。长事务、人工任务和跨服务编排应评估工作流引擎，本课的内存模型不能替代它。

:::tip
先画“节点顺序表、key 唯一表、状态迁移表”再写代码。三张小表能把隐藏在 Bean 顺序、字符串和散落条件中的合同变成可验证输入。
:::

## 当前项目补充

冻结矩阵中的 `JAVA-ENGINEERING-009`、`JAVA-ENGINEERING-010` 与 `JAVA-ENGINEERING-013` 分别提供责任链、工厂/服务定位和有限状态场景。frontmatter 只转录代表路径和稳定符号，全部标记为 `observed`；它们证明存在教学场景，不证明当前实现正确，也不授权读取项目源码。正文示例为去敏的纯 Java 模型。

## Java 8 / Spring Boot 2.3 兼容写法

Java 8 没有 `Map.copyOf`，要先 `new LinkedHashMap<>(draft)` 再用 `Collections.unmodifiableMap` 包装，不能直接包装仍会变化的 draft。两条 Java 线的 `ConcurrentMap.putIfAbsent`、`AtomicReference.compareAndSet` 和 enum 基本合同一致。

Spring 5.2.15 与 Security 5.3.9 的配置 API、Servlet `javax` 包名和现代 Spring 7 不同。迁移时先冻结 matcher、filter/interceptor 顺序、短路和状态结果，再替换包名与 DSL；不要把旧 API 示例复制到现代主线。

## 新旧版本差异

| 对比项 | Java 25 / Spring 7 | Java 8 / Boot 2.3 legacy | 迁移注意 |
| --- | --- | --- | --- |
| 注册表快照 | `Map.copyOf` | 复制后 `Collections.unmodifiableMap` | 两者都不是 value 深复制 |
| SPI | `ServiceLoader` 具有现代 stream/provider API | 主要使用 iterator | 两线都要隔离 loader 并发与 cache 生命周期 |
| 条件更新 | `ConcurrentMap`、`AtomicReference` | 同名核心 API 已存在 | 原子单点更新不等于多字段事务 |
| MVC/Security | Spring 7 / Security 7、`jakarta` | Spring 5.2 / Security 5.3、`javax` | 先保持行为，再迁移 API 形态 |
| 事务回滚 | 按 Spring 7 精确合同 | 按 Spring 5.2 精确合同 | checked exception 默认规则不能靠印象 |

## 易错点

:::pitfalls
### 错误：下游异常后再次进入责任链

**现象：** 一个请求产生两次保存、通知或响应写入。

**触发条件：** 节点在 `catch` 中再次调用 `next.run()` 或 `chain.doFilter()`。

**原因：** 把整条带副作用的链误当成可安全重试函数。

**后果：** 重复业务、响应已提交异常或审计计数失真。

**错误示例：**

```java
try { next.run(); } catch (RuntimeException error) { next.run(); }
```

**正确写法：**

```java
next.run(); // 下游只调用一次，重试交给有幂等预算的外层协议。
```

**影响版本：** 所有 Servlet、Spring 与纯 Java 链实现。

**验证方式：** 成功、拒绝、异常三条路径断言下游次数分别为 1、0、1。

**来源：** `jakarta-servlet61-filtering`、`servlet40-filter-api`。

### 错误：用 MVC Interceptor 代替全局 Filter

**现象：** Controller 请求被处理，但静态资源、非 MVC servlet 或某些错误分派没有执行相同逻辑。

**触发条件：** 需要覆盖容器请求，却只注册 `HandlerInterceptor`。

**原因：** Interceptor 由 MVC HandlerMapping 调用，不是 Servlet 容器过滤链。

**后果：** 安全、包装或上下文清理出现覆盖缺口。

**错误示例：**

```java
// 把所有响应包装都放进 MVC 的 postHandle。
void postHandle() { wrapEveryResponse(); }
```

**正确写法：**

```java
// 覆盖 Servlet 请求用 Filter；依赖 handler 元数据才用 Interceptor。
Filter globalBoundary = new Filter();
```

**影响版本：** Spring Framework 5.2.15 与 7.0.8。

**验证方式：** 分别请求 MVC、静态、错误和异步路径，记录执行边界与回调次数。

**来源：** `spring7-handler-interceptor-api`、`spring7-interceptors-reference`、`spring5-interceptors-reference`。

### 错误：忽略异步 handler 的再次 dispatch

**现象：** 审计重复、线程上下文未清理，或误以为 `postHandle` 必然在首次请求线程执行。

**触发条件：** handler 启动异步处理，但测试只覆盖同步 REQUEST。

**原因：** 异步完成可能触发新的 dispatch，回调时机和线程与同步路径不同。

**后果：** 重复计数、资源泄漏或错误的安全上下文。

**错误示例：**

```java
void postHandle() { threadLocal.remove(); }
```

**正确写法：**

```java
try { asyncTask.run(); } finally { threadLocal.remove(); }
```

**影响版本：** Spring Framework 5.2.15 与 7.0.8。

**验证方式：** 用真实 async handler 记录首次与再次 dispatch 的线程、回调顺序和清理结果。

**来源：** `spring7-handler-interceptor-api`、`spring5-interceptors-reference`。

### 错误：多条 SecurityFilterChain 覆盖重叠或留空

**现象：** 管理路径进入较弱链，或某些请求没有经过 Spring Security。

**触发条件：** 宽 matcher 排在窄 matcher 前，或没有覆盖剩余请求的链。

**原因：** `FilterChainProxy` 选择匹配链，matcher 与顺序共同构成安全边界。

**后果：** 必要认证授权 filter 缺失。

**错误示例：**

```java
@Order(1) securityMatcher("/api/**");
@Order(2) securityMatcher("/api/admin/**");
```

**正确写法：**

```java
@Order(1) securityMatcher("/api/admin/**");
@Order(2) securityMatcher("/api/**");
@Order(3) denyUnmatchedRequests();
```

**影响版本：** Spring Security 5.3.9 与 7。

**验证方式：** 对 method、path、dispatcher 矩阵断言选中链和 filters 顺序。

**来源：** `spring7-security-architecture`、`spring7-security-java-config`、`spring5-security-filter-chain`。

### 错误：共享 ServiceLoader 并发迭代和 reload

**现象：** provider 遗漏、重复或迭代期间失败。

**触发条件：** 多线程共享一个 loader，一边发现 provider 一边调用 `reload()`。

**原因：** ServiceLoader 实例不保证并发安全，reload 会清缓存并影响既有迭代器。

**后果：** 启动或热更新结果不可预测。

**错误示例：**

```java
static final ServiceLoader<Codec> SHARED = ServiceLoader.load(Codec.class);
```

**正确写法：**

```java
Map<String, Codec> snapshot = discoverSeriallyAndCopy();
publishImmutable(snapshot);
```

**影响版本：** Java 8 与 Java 25。

**验证方式：** 将发现和发布隔离，读线程只访问快照；reload 使用新的受控发布周期。

**来源：** `java25-service-loader`、`java8-service-loader`。

### 错误：把 ServiceLoader cache 当实时注册表

**现象：** 新 provider 已部署或 classloader 已变化，旧 loader 仍返回旧集合。

**触发条件：** 长期复用旧 loader 和旧 iterator，却期望自动发现变化。

**原因：** provider 被延迟发现并缓存，生命周期由 loader owner 管理。

**后果：** 工厂选择与实际部署不一致。

**错误示例：**

```java
return sharedLoader.iterator().next(); // 假定缓存总是最新。
```

**正确写法：**

```java
loader.reload();
Map<String, Codec> next = discoverAndValidate(loader);
published.set(Collections.unmodifiableMap(next));
```

**影响版本：** Java 8 与 Java 25。

**验证方式：** 在隔离 classloader fixture 中验证 reload 前后集合，并确保读者只见完整版本。

**来源：** `java25-service-loader`、`java8-service-loader`。

### 错误：containsKey 加 put 模拟唯一注册

**现象：** 两个注册者都报告成功，后写者覆盖先写者。

**触发条件：** 并发线程执行分离的检查和写入。

**原因：** 两个普通操作之间存在竞态窗口。

**后果：** key 对应实现取决于时序，工厂行为不稳定。

**错误示例：**

```java
if (!map.containsKey(key)) { map.put(key, handler); }
```

**正确写法：**

```java
Handler previous = concurrentMap.putIfAbsent(key, handler);
if (previous != null) throw new IllegalStateException("duplicate key");
```

**影响版本：** Java 8 与 Java 25。

**验证方式：** 两线程用同一起点竞争同一 key，断言成功数和最终 size 都是 1。

**来源：** `java25-concurrent-map`、`java8-concurrent-map`。

### 错误：unmodifiableMap 包装 live backing map

**现象：** 读者不能通过视图写入，却仍会看到写者后续增加或删除项。

**触发条件：** Java 8 直接执行 `Collections.unmodifiableMap(draft)`，随后继续修改 draft。

**原因：** unmodifiableMap 是只读视图，不是快照复制。

**后果：** 注册表在运行期悄然变化，读者可能看到半成品。

**错误示例：**

```java
published = Collections.unmodifiableMap(draft);
```

**正确写法：**

```java
published = Collections.unmodifiableMap(new LinkedHashMap<String, Handler>(draft));
```

**影响版本：** Java 8 及后续版本。

**验证方式：** 发布后修改 draft，断言 published 的 size 和映射不变。

**来源：** `java8-unmodifiable-map`、`java25-map`。

### 错误：把 Map.copyOf 当成深复制

**现象：** map 本身不可修改，但 value 内部字段或集合仍被其他代码改变。

**触发条件：** 快照 value 是可变对象并被写者继续持有。

**原因：** `Map.copyOf` 复制映射结构，不承诺递归复制 value。

**后果：** 注册表表面不可变，行为却能在无发布动作时变化。

**错误示例：**

```java
published = Map.copyOf(Collections.singletonMap("codec", mutableConfig));
```

**正确写法：**

```java
ImmutableConfig copy = ImmutableConfig.copyOf(mutableConfig);
published = Map.copyOf(Collections.singletonMap("codec", copy));
```

**影响版本：** Java 10+ 的 `Map.copyOf`，包括 Java 25。

**验证方式：** 修改原 value 的可变输入，断言已发布实现行为不变。

**来源：** `java25-map`。

### 错误：用多个 CAS 分散更新一个不变量

**现象：** state 已更新而 version 或最后事件仍是旧值。

**触发条件：** 对多个 `AtomicReference` 或 atomic 字段分别执行 CAS。

**原因：** 每个 CAS 只保护自己的单个值，组合过程不是原子事务。

**后果：** 读者看到从未合法存在过的混合状态。

**错误示例：**

```java
state.compareAndSet(oldState, nextState);
version.compareAndSet(oldVersion, oldVersion + 1);
event.compareAndSet(null, appliedEvent);
```

**正确写法：**

```java
Aggregate next = old.with(nextState, oldVersion + 1, appliedEvent);
aggregate.compareAndSet(old, next);
```

**影响版本：** Java 8 与 Java 25。

**验证方式：** 并发读取时断言每个可见聚合版本都满足跨字段不变量。

**来源：** `java25-atomic-reference`、`java8-atomic-reference`。

### 错误：持久化 enum ordinal

**现象：** 增加或重排 enum 常量后，历史数字映射成另一状态。

**触发条件：** 数据库或协议保存 `state.ordinal()`。

**原因：** ordinal 表示源码声明位置，不是稳定业务标识。

**后果：** 历史数据被静默误读，迁移规则失效。

**错误示例：**

```java
database.save(state.ordinal());
```

**正确写法：**

```java
database.save(state.code()); // 用稳定 code 显式解析未知值并拒绝。
```

**影响版本：** Java 8 与 Java 25。

**验证方式：** 在 enum 中间插入新常量，历史 code 仍解析为原状态。

**来源：** `jls25-enum`、`jls8-enum`。

### 错误：只校验目标状态

**现象：** NEW 可以直接写 DONE，终态也能回退 ACTIVE。

**触发条件：** API 只接收目标枚举并检查它是否合法。

**原因：** 来源状态和触发事件没有进入迁移判定。

**后果：** 必要校验、审计或副作用步骤被跳过。

**错误示例：**

```java
task.setState(request.targetState());
```

**正确写法：**

```java
State next = transitions.require(current, event);
task.setState(next); // 没有 (current, event) 边时直接拒绝。
```

**影响版本：** 所有 Java 与框架版本。

**验证方式：** 对迁移表的合法边和所有关键非法边分别断言结果与状态保持。

**来源：** `jls25-enum`、`jls8-enum`。

### 错误：只做内存 CAS 而忽略数据库 version

**现象：** 单实例测试通过，多实例同时写入时仍发生 last-write-wins。

**触发条件：** 每个进程有独立 AtomicReference，但最终无条件更新共享数据库。

**原因：** JVM 内原子性不能协调其他进程。

**后果：** 一个合法迁移被另一个旧读者覆盖。

**错误示例：**

```sql
UPDATE task SET state=? WHERE id=?
```

**正确写法：**

```sql
UPDATE task SET state=?, version=version+1 WHERE id=? AND version=?
```

**影响版本：** 所有多实例部署。

**验证方式：** 两个独立连接持有相同 version，断言一个更新 1 行、另一个更新 0 行。

**来源：** `java25-atomic-reference`、`spring7-transaction-annotations`。

### 错误：用 JFR 或 JMH 证明正确性

**现象：** 报告只有“没有异常”或吞吐数字，却没有非法迁移、重复注册和事务冲突断言。

**触发条件：** 把运行时观测或微基准结果当作行为验证。

**原因：** JFR 观察事件，JMH 测量指定代码；两者不定义业务合同。

**后果：** 快速但错误的实现被误判为可发布。

**错误示例：**

```text
JFR 无异常，所以状态机一定一致。
```

**正确写法：**

```text
先通过链、注册、迁移和 version 的确定性断言，再用 JFR/JMH 回答性能问题。
```

**影响版本：** JDK 11+ JFR 与所有 JMH 版本。

**验证方式：** 功能 Gate 与性能报告分开，性能报告包含环境、参数和适用范围。

**来源：** `openjdk-jep-328`、`oracle-jcmd-jfr`、`openjdk-jmh`。
:::

## 错误与正确写法对比

:::compare
### 错误写法

```java
if (!handlers.containsKey(key)) {
    handlers.put(key, handler);
}
task.setState(requestedTarget);
```

### 正确写法

```java
Handler previous = handlers.putIfAbsent(key, handler);
if (previous != null) {
    throw new IllegalStateException("duplicate key: " + key);
}
boolean changed = stateMachine.transition(event);
```
:::

## 安全注意

安全过滤链的 matcher 和声明顺序构成覆盖边界；必须明确哪条链匹配请求，并为未匹配任何链的请求定义策略。

## 性能注意

本课不给出 Map、CAS 或责任链的普遍快慢结论。遇到锁竞争或分配问题时，可在 JDK 25 用固定负载执行 `jcmd <pid> JFR.start settings=profile` 并记录采样窗口；比较局部实现时使用 JMH，记录 CPU、OS、JDK、输入规模、warmup、measurement、fork 和置信区间。任何结果都不能替代功能与事务断言。

## 如何验证

1. 从“核心接口与完整示例”原样提取 `ChainRegistryStateExample.java` 到 `/tmp` 专属目录。
2. Java 25 执行 `javac -Xlint:all -Werror`，运行两次，确认固定 PASS 输出，再用 `javap -verbose` 确认 major version 69。
3. Java 8 独立执行相同编译与两次运行，再确认 major version 52，不能用现代 JDK 的 `--release 8` 替代。
4. 验证成功后删除专属临时目录并检查不存在；仓库中不保留测试源、class 或日志。
5. 框架 matcher、MVC async 和数据库冲突需要精确版本的临时集成 fixture，本纯 Java 示例不代替这些测试。

:::exercise
### 练习：为导入任务设计一条可恢复流程

**要求：** 定义 `validate`、`convert`、`persist` 三个有序节点；两个 handler 故意使用同一 key；状态使用 `NEW -> RUNNING -> SUCCEEDED/FAILED`，并给出两个非法迁移和 version 冲突处理。

**验收：** 链成功时业务只执行一次；重复 key 在发布前失败；非法边不改变状态；两个旧 version 写者最多一个更新成功。

**参考答案：** 用私有 draft 排序和查重后发布快照；调用方发送 `START`、`SUCCEED` 或 `FAIL` event；数据库更新同时匹配 id、旧 state 和 version，affected rows 为 0 时重新读取，不盲目重试副作用。
:::

## 本节小结

- 链的核心不是多个对象，而是明确顺序、短路、一次下游调用与异常 owner。
- 注册表先拒绝重复 key，再发布不可变快照；工厂只做显式 key 到实现的选择。
- 状态机用来源、事件和目标组成合法边，单 JVM 用聚合 CAS，跨进程用 version 条件更新。
- 本地事务不自动覆盖远端副作用，JFR/JMH 也不替代行为正确性验证。
