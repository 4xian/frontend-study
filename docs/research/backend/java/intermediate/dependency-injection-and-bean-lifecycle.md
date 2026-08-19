# Phase C I-06：IoC、构造器注入与 Bean 生命周期研究

> 课程 ID：`backend.java.learn.intermediate.dependency-injection-and-bean-lifecycle`  
> 冻结顺序：I-06
> 研究日期：2026-08-15
> 冻结快照：`dzzz-app-20260803-179e722831ab`  
> 边界：只核验 I-06、Phase A 冻结路线和既有 Phase 2 证据，不读取或运行 `dzzz-app`，不研究 I-07

## 冻结课程合同

- 标题：IoC、构造器注入与 Bean 生命周期。
- 阶段：`intermediate`，深度：`lesson`。
- 前置课程：`backend.java.learn.intermediate.first-spring-boot-web-api`。
- 冻结时长：150 分钟。
- 来源能力：
  1. `JAVA-FRAMEWORK-002`：Spring Core、IoC、依赖注入与 Bean 生命周期。
  2. `JAVA-RISK-005`：隐式依赖与容器生命周期绕过，只作纠错证据。
- Phase 2 的 `researchStatus: not-started`、`exampleStatus: not-started`、`courseStatus: planned` 是历史冻结
  口径；当前 Phase C 完成态只进入本课 signoff，不回写旧冻结清单。

## 版本基线

### 现代主线

- Java 25 LTS。
- Spring Boot 4.1.0。
- Spring Framework 7.0.8。
- 生命周期注解来自 `jakarta.annotation`。
- 单构造器不需要 `@Autowired`；必需依赖采用构造器参数。

### 兼容线

- Java 8。
- Spring Boot 2.3.12.RELEASE。
- Spring Framework 5.2.15.RELEASE。
- 生命周期注解来自 `javax.annotation`。
- 核心 IoC 心智模型一致，但包名、AOT 能力和部分候选选择注解不同。

## 已核验的官方直接来源

2026-08-15 使用 Tavily 定位 Spring 官方候选页，再逐一回到当前 Spring Reference、精确 7.0.8 API
和 5.2.15.RELEASE 归档原文核验。下列 12 个 URL 本次均返回 HTTP 200，未使用社区资料支撑结论。

1. `spring-di`：
   <https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html>，
   支持 IoC、构造器与 setter 注入、必需依赖和构造器循环依赖结论。
2. `spring-autowired`：
   <https://docs.spring.io/spring-framework/reference/core/beans/annotation-config/autowired.html>，支持单构造器、
   可选依赖、集合注入和解析规则。
3. `spring-qualifiers`：
   <https://docs.spring.io/spring-framework/reference/core/beans/annotation-config/autowired-qualifiers.html>，
   支持 `@Primary`、`@Fallback`、`@Qualifier` 和自定义限定符。
4. `spring-scopes`：
   <https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html>，支持 singleton、prototype、
   Web 作用域、短生命周期代理和 prototype 销毁责任。
5. `spring-lifecycle`：
   <https://docs.spring.io/spring-framework/reference/core/beans/factory-nature.html>，支持初始化、销毁、
   `Lifecycle` 和多种回调组合顺序。
6. `spring-postconstruct-predestroy`：
   <https://docs.spring.io/spring-framework/reference/core/beans/annotation-config/postconstruct-and-predestroy-annotations.html>，
   支持现代 `@PostConstruct` 与 `@PreDestroy` 用法。
7. `spring-lazy`：
   <https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-lazy-init.html>，支持
   `@Lazy` 的创建时机与被非延迟 singleton 依赖时的边界。
8. `spring-standard-annotations`：
   <https://docs.spring.io/spring-framework/reference/core/beans/standard-annotations.html>，支持
   `jakarta.inject.Inject`、`Named` 与 `Provider` 对照。
9. `spring-object-provider-api`：
   <https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/beans/factory/ObjectProvider.html>，
   支持按需、可选和唯一候选访问。
10. `spring-bean-post-processor-api`：
    <https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/beans/factory/config/BeanPostProcessor.html>，
    支持初始化前后扩展点边界。
11. `spring-application-context-api`：
    <https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/context/ApplicationContext.html>，
    支持上下文关闭与 BeanFactory 能力边界。
12. `spring-5-core`：
    <https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/core.html>，支持
    Java 8 兼容线的注入、候选选择、`javax.annotation` 与生命周期顺序。

## 关键结论

### IoC 与显式依赖

对象只声明“我需要什么”，容器负责选择实例并传入，这是控制反转。依赖注入是 IoC 的一种实现。
业务对象不应主动从全局 `ApplicationContext` 查询服务，因为静态查询隐藏构造条件、扩大容器耦合并使普通
单元测试难以创建对象。框架边界偶尔需要查找时，应把查找限制在基础设施适配器，不传播进领域代码。

### 构造器、setter 与字段注入

必需依赖放在构造器中：对象创建后立即满足不变量，测试可以直接传入替身。单构造器由 Spring 自动识别，
无需 `@Autowired`。setter 或配置方法适合真正可选且允许运行前配置的依赖。字段注入虽可工作，却隐藏依赖、
妨碍不可变字段与普通构造测试，因此课程只用作待修正示例。

### 候选解析

按类型没有候选时，必需注入失败；一个候选时直接选择；多个候选时需要更精确合同。`@Primary` 表示未限定
注入点的默认候选，`@Qualifier` 在注入点缩小候选集合。限定符是语义标签，不应被解释为“总是按 Bean 名
查找”。需要全部实现时注入 `List<T>`，需要可选或延迟访问时使用 `ObjectProvider<T>`。

### 作用域与跨作用域依赖

singleton 表示每个容器、每个 Bean 定义一个共享实例，不是 JVM 全局单例。prototype 每次容器请求创建新实例，
容器执行初始化但不负责完整销毁。共享 singleton 直接注入 prototype 只会在 singleton 创建时解析一次；需要每次
获取新对象时使用 `ObjectProvider` 或作用域代理。request/session 作用域只在 Web 上下文中有效。

### 生命周期与关闭

Bean 经历实例化、依赖填充、初始化前处理、初始化回调、初始化后处理、可用、关闭时销毁。应用自己的初始化
优先使用 `@PostConstruct` 或 `@Bean(initMethod=...)`，释放资源使用 `@PreDestroy`、
`@Bean(destroyMethod=...)` 或 `AutoCloseable` 适配。初始化失败应阻止上下文完成刷新；不要启动无法停止的裸线程。

`BeanPostProcessor` 是容器扩展点，不是每个业务 Bean 都该实现的接口。它可在初始化前后包装 Bean，AOP 代理也
依赖类似阶段，因此构造器或 `@PostConstruct` 中的 `this` 调用不能假定已经经过最终代理。

### 延迟与循环依赖

`@Lazy` 推迟创建，不会删除依赖，也不会保证首次请求一定成功。非延迟 singleton 直接依赖延迟 Bean 时，为满足
依赖仍可能在启动阶段创建。构造器循环依赖没有合法创建顺序，会抛出 `BeanCurrentlyInCreationException`；优先
拆分职责或引入单向端口，不用 setter 或全局查找掩盖设计问题。

## Java 8 / Spring Framework 5.2 差异

1. 生命周期注解是 `javax.annotation.PostConstruct` 与 `javax.annotation.PreDestroy`。
2. Java 8 不支持 record，注入示例使用普通 final 字段类。
3. 单构造器省略 `@Autowired`、`@Primary`、`@Qualifier`、作用域和生命周期核心语义均可用。
4. 当前文档中的 `@Fallback` 不属于 5.2 兼容线，旧线用 `@Primary` 或 `@Qualifier` 明确候选。
5. 旧线不可照搬现代 AOT/native 提示；本课不把 AOT 作为 IoC 基础合同。
6. `javax.inject.Provider` 与现代 `jakarta.inject.Provider` 包名不同，混用会编译失败。

## 零基础课程拆分

正式课程按 18 个独立小知识点展开：

1. IoC 与依赖注入分别是什么。
2. BeanDefinition、BeanFactory 与 ApplicationContext 的关系。
3. 组件扫描和 `@Bean` 两种注册方式。
4. 构造器注入如何表达必需依赖。
5. setter 注入如何表达真正可选依赖。
6. 字段注入为何隐藏依赖。
7. 无候选、单候选和多候选的解析结果。
8. `@Primary` 如何提供默认候选。
9. `@Qualifier` 如何缩小候选集合。
10. 集合注入如何获得全部实现。
11. `ObjectProvider` 如何按需取得可选或短作用域 Bean。
12. singleton 的“每容器每定义”语义。
13. prototype 与销毁责任。
14. singleton 注入 prototype 的生命周期错配。
15. 实例化到销毁的完整顺序。
16. `@PostConstruct`、`@PreDestroy` 与 `@Bean` 回调。
17. `BeanPostProcessor`、代理与过早 `this` 调用边界。
18. `@Lazy`、循环依赖与 fail-fast 设计。

## 可执行反馈环设计

### 现代 fixture

在 `/tmp/java-spring-di-course.XXXXXX` 创建 Java 25、Spring Boot 4.1.0、Framework 7.0.8 工程：

1. 直接构造 Service，证明必需依赖显式且不需要容器。
2. 启动小型上下文，证明单构造器注入成功。
3. 注册两个实现，先证明未限定注入失败，再用 `@Primary` 和 `@Qualifier` 修复。
4. 注入 `List<Port>`，证明两个实现都被收集。
5. 用 `ObjectProvider<PrototypeTask>` 连续取两次，证明实例身份不同。
6. 记录构造、`@PostConstruct`、使用、`@PreDestroy` 顺序。
7. 建立 A/B 构造器循环负例，证明上下文启动失败。
8. 全量反馈环连续通过两次。

### legacy fixture

在 `/tmp/java-spring-di-legacy.XXXXXX` 使用真实 Java 8、Boot 2.3.12、Framework 5.2.15：

1. 使用普通 final 字段类和单构造器注入。
2. 使用 `javax.annotation` 生命周期回调。
3. 用 `@Primary` 与 `@Qualifier` 选择实现。
4. 上下文关闭后确认销毁回调执行。

## 易错点取证

1. 静态 `getBean`：依赖不可从构造签名看见，普通单元测试被迫启动容器；改为构造器参数。
2. 多实现未限定：触发 `NoUniqueBeanDefinitionException`；用语义明确的限定符修复。
3. 把 singleton 当线程安全：作用域只描述实例数量，不保证字段并发安全。
4. singleton 直接持有 prototype：每次调用仍是同一实例；改用 provider 或作用域代理。
5. prototype 等待 `@PreDestroy`：容器不负责完整销毁；调用方管理资源。
6. 用 `@Lazy` 掩盖循环依赖：错误推迟到首次访问；拆分职责并保持单向依赖。

## 研究 Gate 自检

- [x] 课程 ID、I-06 顺序、I-05 唯一前置、150 分钟时长与两个来源能力已核对。
- [x] 现代线固定 Java 25 / Boot 4.1.0 / Framework 7.0.8。
- [x] 兼容线固定 Java 8 / Boot 2.3.12 / Framework 5.2.15。
- [x] Tavily 定位后回到 12 个官方直接来源，覆盖注入、候选、作用域、生命周期、延迟和旧版差异。
- [x] 12 个最终来源 URL 在 2026-08-15 全部返回 HTTP 200。
- [x] 项目代表符号只来自冻结矩阵，没有读取项目源码。
- [x] 18 个零基础小点均有明确反馈环。
- [x] 风险证据只用于纠错，没有宣称冻结快照代表当前确定缺陷。

## Stop Boundary

本研究稿只完成 Phase C I-06 研究。课程、双版本反馈环、track 顺序、工程 Gate、桌面/390px 页面证据
和 signoff 通过后，才能进入 I-07 `spring-boot-and-configuration`。
