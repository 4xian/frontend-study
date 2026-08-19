---
id: backend.java.learn.advanced.reflection-aop-and-cross-cutting-contracts
type: lesson
title: 反射、Spring AOP 与横切合同
summary: 分清反射、JDK 动态代理与 Spring AOP 的能力边界，并用可验证的切点和通知保护业务合同
domain: backend
technology: java
module: core
stage: advanced
level: advanced
estimatedMinutes: 300
objectives:
  - 能区分 Class、反射成员、JDK 动态代理与 Spring AOP 代理的职责
  - 能在 Java 25 中安全发现、构造和调用成员，并正确处理模块访问与目标异常
  - 能根据服务入口选择 JDK 或 CGLIB 代理，并解释 private、final 与自调用边界
  - 能把 pointcut 写成可审查的行为范围合同，并为 advice 定义执行、返回值和异常语义
  - 能运行 Boot 4.1.0 / 2.3.12 与 Spring 7.0.8 / 5.2.15 双版本反馈环，验证五类 advice 和代理入口
prerequisites:
  - backend.java.learn.basics.annotations-and-metadata
  - backend.java.learn.intermediate.dependency-injection-and-bean-lifecycle
  - backend.java.learn.intermediate.testing-with-junit-and-mocks
related: []
tags:
  - Java
  - 反射
  - 动态代理
  - Spring AOP
  - pointcut
  - advice
appliesTo: Java 25、Spring Boot 4.1.0 与 Spring Framework 7.0.8 主线；Java 8、Spring Boot 2.3.12.RELEASE 与 Spring Framework 5.2.15.RELEASE 兼容补充
modernBaseline:
  java: '25'
  springBoot: 4.1.0
  springFramework: 7.0.8
  aspectjWeaver: 1.9.25.1
legacyBaseline:
  java: '8'
  springBoot: 2.3.12.RELEASE
  springFramework: 5.2.15.RELEASE
  aspectjWeaver: 1.9.6
verifiedAt: 2026-08-10
sources:
  - id: java25-class
    title: Java SE 25 Class API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Class.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - getMethods 返回 public 与继承方法，getDeclaredMethods 返回当前类型声明的方法
      - 现代动态构造使用 getDeclaredConstructor().newInstance()
  - id: java25-method
    title: Java SE 25 Method API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/reflect/Method.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - invoke 执行底层方法并把目标异常包装为 InvocationTargetException
  - id: java25-accessible-object
    title: Java SE 25 AccessibleObject API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/reflect/AccessibleObject.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - 深反射访问受成员可见性以及模块 reads、exports、opens 约束
      - trySetAccessible 以布尔值报告能否取消访问检查
  - id: java25-proxy
    title: Java SE 25 Proxy API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/reflect/Proxy.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - JDK 动态代理在运行时实现一组接口
  - id: java25-invocation-handler
    title: Java SE 25 InvocationHandler API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/reflect/InvocationHandler.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - 接口代理调用分派给 InvocationHandler.invoke
      - Java 25 可用 invokeDefault 调用代理接口默认方法
  - id: java8-class
    title: Java SE 8 Class API
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 已具有成员发现与 getDeclaredConstructor 合同
  - id: java8-method
    title: Java SE 8 Method API
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/Method.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - invoke 执行底层方法并把目标异常包装为 InvocationTargetException
  - id: java8-accessible-object
    title: Java SE 8 AccessibleObject API
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/AccessibleObject.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 没有 JPMS 与 trySetAccessible
  - id: java8-proxy
    title: Java SE 8 Proxy API
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/Proxy.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 动态代理同样只实现接口
  - id: java8-invocation-handler
    title: Java SE 8 InvocationHandler API
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/InvocationHandler.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 接口代理调用同样分派给 InvocationHandler.invoke
  - id: spring7-aop-concepts
    title: Spring Framework AOP Concepts
    url: https://docs.spring.io/spring-framework/reference/core/aop/introduction-defn.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - Spring AOP 的 join point 是方法执行，pointcut 选择 join point
  - id: spring7-pointcuts
    title: Spring Framework Declaring a Pointcut
    url: https://docs.spring.io/spring-framework/reference/core/aop/ataspectj/pointcuts.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - Spring AOP 只匹配 Spring bean 的方法执行
      - JDK 与 CGLIB 代理具有不同的方法可见性边界
  - id: spring7-advice
    title: Spring Framework Declaring Advice
    url: https://docs.spring.io/spring-framework/reference/core/aop/ataspectj/advice.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - before、returning、throwing、after 与 around 具有不同执行时机
      - around 是否调用 proceed 决定目标方法是否执行
  - id: spring7-proxying
    title: Spring Framework Proxying Mechanisms
    url: https://docs.spring.io/spring-framework/reference/core/aop/proxying.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - Framework 根据接口与配置选择 JDK 或 CGLIB 代理
      - final、private 与自调用受代理机制限制
  - id: spring5-core-aop
    title: Spring Framework 5.2.15 Core Technologies
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/core.html
    sourceType: official-reference
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - legacy 线同样采用 JDK 或 CGLIB 代理并存在自调用边界
  - id: boot41-system-requirements
    title: Spring Boot 4.1.0 System Requirements
    url: https://docs.spring.io/spring-boot/system-requirements.html
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Boot 4.1.0 支持 Java 17 至 26并要求 Framework 7.0.8 以上
  - id: boot41-aop
    title: Spring Boot 4.1.0 Aspect-Oriented Programming
    url: https://docs.spring.io/spring-boot/reference/features/aop.html
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Boot 提供 AOP 自动配置且默认使用 CGLIB
  - id: boot41-dependencies
    title: Spring Boot 4.1.0 Managed Dependency Coordinates
    url: https://docs.spring.io/spring-boot/appendix/dependency-versions/coordinates.html
    sourceType: official-reference
    appliesTo: AspectJ Weaver 1.9.25.1
    claims:
      - Boot 4.1.0 管理 aspectjweaver 1.9.25.1
  - id: boot2312-system-requirements
    title: Spring Boot 2.3.12 Getting Started
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements
    sourceType: official-reference
    appliesTo: Java 8-15 与 Spring Framework 5.2.15+
    claims:
      - Boot 2.3.12 要求 Java 8 且不支持推出 Java 25 兼容性
  - id: boot2312-dependencies
    title: Spring Boot 2.3.12 Dependency Versions
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/appendix-dependency-versions.html
    sourceType: official-reference
    appliesTo: Spring Framework 5.2.15.RELEASE 与 AspectJ Weaver 1.9.6
    claims:
      - Boot 2.3.12 管理 spring-aop 5.2.15.RELEASE 与 aspectjweaver 1.9.6
  - id: boot2312-aop-auto-configuration
    title: Spring Boot 2.3.12 AopAutoConfiguration API
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/api/org/springframework/boot/autoconfigure/aop/AopAutoConfiguration.html
    sourceType: api-doc
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - spring.aop.proxy-target-class 缺省或为 true 时自动配置 CGLIB，为 false 时配置 JDK 代理
projectEvidence:
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/ReflectionCacheUtil.java
    symbol: com.tdh.bdzz.util.ReflectionCacheUtil
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/shard/DefaultAutowiredShardData.java
    symbol: com.tdh.bdzz.shard.DefaultAutowiredShardData
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/aop/AppAspect.java
    symbol: com.tdh.bdzz.aop.AppAspect
    usage: corrected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/aop/DzzzAspect.java
    symbol: com.tdh.bdzz.aop.DzzzAspect
    usage: corrected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/aop/PointCuts.java
    symbol: com.tdh.bdzz.aop.PointCuts
    usage: corrected
---

# 反射、Spring AOP 与横切合同

## 为什么需要学习

订单、鉴权、日志和指标常常需要围绕许多服务方法执行相似动作。把这些动作复制进每个方法，会让
业务代码难读；用一个过宽切面统一处理，又可能让新增方法在无人注意时改变行为。本课从“运行时如何
找到一个方法”开始，逐层讲清反射、JDK 动态代理和 Spring AOP。重点不是背注解，而是让每个代理
入口、切点范围、`proceed()` 次数、返回值和异常都成为可验证合同。

## 学习目标
- 能用自己的话区分反射、动态代理和 Spring AOP。
- 能在 Java 25 中安全读取成员、构造对象并调用方法。
- 能解释 JDK 与 CGLIB 代理的选择和限制。
- 能写出范围明确的 pointcut 和不改写业务结果的观察型 advice。
- 能用双版本 fixture 证明代理入口、自调用和异常传播行为。

## 前置术语
- **元数据：** 描述类型、方法或字段的数据，例如类名、参数类型和运行时注解。
- **代理：** 调用方实际持有的中间对象。它先处理调用，再决定是否把调用交给目标对象。
- **横切关注点：** 同时影响多类业务的规则，例如审计、指标、事务或权限检查。
- **业务合同：** 调用方可以依赖的输入、返回值、异常类型和副作用。

本课假设你已经完成注解、依赖注入和测试前置课程，但不会假设你已经会反射或 AOP。

## 零基础知识点详解
### 1. `Class` 对象与运行时类型
**它是什么：** 每个已加载 Java 类型都有一个 `Class<?>` 对象，它描述类型名称、成员、父类型和注解。

**有什么作用：** 当编译期不知道具体类型时，程序仍可读取元数据并选择构造器或方法。

**什么时候使用：** 框架启动、序列化、依赖注入和插件发现需要它；普通业务分支有明确类型时优先直接调用。

**怎么使用：**

1. 从对象的 `getClass()` 或类型字面量 `OrderService.class` 得到 `Class<?>`。
2. 读取名称或成员，但先明确要查公开继承成员还是当前类型声明成员。
3. 对找到的结果做精确类型和数量断言，不按数组顺序猜测。

**最小示例：** `Class<?> type = OrderService.class;`，随后用 `type.getName()` 读取全限定名。

**运行结果：** 结果描述同一个已加载类型，不会创建 `OrderService` 实例。

**常见误区：** `Class` 是元数据入口，不是业务对象，也不能证明目标一定由 Spring 管理。

### 2. `getMethods` 与 `getDeclaredMethods`
**它是什么：** 两个 API 都返回 `Method`，但搜索范围不同。

**有什么作用：** 它们决定框架能看见哪些候选方法，避免把“继承的 public 方法”和“本类声明成员”混为一谈。

**什么时候使用：** 面向公开调用合同用 `getMethods()`；检查当前类声明细节用 `getDeclaredMethods()`。

**怎么使用：**

1. 先写出要找的方法名与参数类型。
2. 公开入口使用 `getMethod(name, parameterTypes)` 做精确查找。
3. 声明成员使用 `getDeclaredMethod`，随后独立处理访问权限。

**最小示例：** `type.getMethod("charge", String.class)` 只匹配一个 public 签名。

**运行结果：** 找不到精确签名时抛出 `NoSuchMethodException`，而不是返回 `null`。

**常见误区：** `getDeclaredMethods()` 能发现 private 方法，不代表 Spring AOP 能拦截它。

### 3. 构造器与动态实例化
**它是什么：** `Constructor<T>` 描述一个构造器，`newInstance` 才真正执行构造。

**有什么作用：** 框架可以根据配置选择类型，同时保留构造失败的准确原因。

**什么时候使用：** 只在类型确实由运行时配置决定时使用；依赖明确时让容器或普通 `new` 负责。

**怎么使用：**

1. 用 `getDeclaredConstructor` 指定参数类型。
2. 先确认构造器可访问，不无条件关闭访问检查。
3. 调用 `newInstance` 并区分反射层异常与构造器自身异常。

**最小示例：** `DefaultBillingService.class.getDeclaredConstructor().newInstance()` 调用无参构造器。

**运行结果：** 成功时返回一个新对象；构造器抛出的异常会被反射异常包装。

**常见误区：** 不要继续使用已弃用的 `Class.newInstance()`，Java 8 兼容代码也可用 `Constructor`。

### 4. Java 25 模块访问与 `trySetAccessible`
**它是什么：** Java 25 的深反射同时受 Java 可见性和 JPMS 模块开放关系约束。

**有什么作用：** 它阻止库在没有模块授权时任意读取实现细节。

**什么时候使用：** 只有维护框架适配层且没有公开 API 时才考虑深反射；业务代码优先公开合同。

**怎么使用：**

1. 先尝试公开成员或模块导出的 API。
2. 必须探测时调用 `trySetAccessible()` 并检查返回值。
3. 失败时给出模块 `opens` 或 API 迁移方案，不循环强制调用。

**最小示例：** `if (!method.trySetAccessible()) throw new IllegalStateException("模块未开放");`。

**运行结果：** 可取消检查时返回 `true`；不能取消时返回 `false`，调用方仍要处理。

**常见误区：** Java 8 没有 `trySetAccessible`，也没有 JPMS，但这不表示旧线可以无边界地读取私有状态。

### 5. `Method.invoke` 与目标异常
**它是什么：** `Method.invoke` 通过元数据调用底层方法，并把目标抛出的异常包装起来。

**有什么作用：** 调用方可以区分“反射调用方式错误”和“业务方法执行失败”。

**什么时候使用：** 通用调度器、框架适配器或测试工具需要动态方法时使用。

**怎么使用：**

1. 检查接收者和参数类型。
2. 调用 `invoke`。
3. 捕获 `InvocationTargetException`，读取 `getCause()`，按既定边界传播或映射。

**最小示例：** `method.invoke(target, "A-100")` 调用一个接收字符串的方法。

**运行结果：** 正常时返回目标结果；目标异常位于 `InvocationTargetException.getCause()`。

**常见误区：** 直接记录包装异常而丢掉 cause，会让上层看不到真实失败类型。

### 6. JDK 动态代理与 `InvocationHandler`
**它是什么：** JDK `Proxy` 在运行时创建一个实现指定接口的对象，所有接口入口交给 handler。

**有什么作用：** 不修改目标类即可在接口调用前后加入观察或策略逻辑。

**什么时候使用：** 服务已有稳定接口且横切行为只需要接口公开方法时使用。

**怎么使用：**

1. 固定代理要实现的接口集合。
2. handler 记录调用并把方法转发给目标。
3. 调用方只依赖接口，不向目标实现类型强制转换。

**最小示例：** `Proxy.newProxyInstance(loader, new Class<?>[] { BillingService.class }, handler)`。

**运行结果：** 返回对象实现 `BillingService`，但不是 `DefaultBillingService` 的子类。

**常见误区：** Java 25 的 `invokeDefault` 和模块规则不能直接复制到 Java 8。

### 7. AOP、join point、pointcut 与 advice
**它是什么：** join point 是可被横切的执行位置；Spring AOP 中它就是 Spring bean 的方法执行。

**有什么作用：** pointcut 选择哪些执行位置，advice 定义命中后做什么。

**什么时候使用：** 多个服务共享审计、指标、事务或权限规则，并且规则可独立描述时使用。

**怎么使用：**

1. 先写业务入口与预期行为。
2. 用 pointcut 精确选择入口。
3. 选择完成需求所需的最窄 advice，并验证未命中的方法。

**最小示例：** `execution(public * example.BillingService.charge(..))` 只描述一个公开服务方法。

**运行结果：** 只有调用 Spring 代理上匹配的方法时 advice 才执行。

**常见误区：** 构造器、字段读写和普通对象方法调用不是 Spring AOP 的方法执行 join point。

### 8. JDK 代理与 CGLIB 代理
**它是什么：** JDK 代理实现接口；CGLIB 代理创建目标类的运行时子类。

**有什么作用：** 两者让 Spring 在不同服务设计下提供方法拦截入口。

**什么时候使用：** 有接口时可以选 JDK；需要按类代理且类可继承时选 CGLIB。Boot 默认 CGLIB，
Framework 的 `@EnableAspectJAutoProxy` 默认接口代理，必须区分配置来源。

**怎么使用：**

1. 先确认调用方依赖接口还是实现类。
2. 明确 Boot 属性或 Framework 注解的代理策略。
3. 在测试中断言实际代理类型，不凭配置名猜测。

**最小示例：** `@EnableAspectJAutoProxy(proxyTargetClass = false)` 明确选择 JDK 接口代理。

**运行结果：** JDK 代理可由 `Proxy.isProxyClass` 识别；CGLIB 代理是目标类子类。

**常见误区：** 把 Boot 默认值当成裸 Framework 默认值，会让类型转换和可见性判断失真。

### 9. 把 pointcut 当成行为范围合同
**它是什么：** pointcut 是一条可审查的选择规则，决定哪些 bean 方法进入横切行为。

**有什么作用：** 它让“谁会被影响”在发布前可见，降低新增方法被宽泛切点自动覆盖的风险。

**什么时候使用：** 每个 advice 都必须依赖 pointcut；即使只有一个方法，也要能说明选择理由。

**怎么使用：**

1. 优先按明确服务、方法、注解或 bean 名称限定。
2. 同时准备一个应命中和一个不应命中的调用。
3. 修改方法或包结构后重跑同一组命中断言。

**最小示例：** `bean(billingService) && execution(public * *(..))` 只覆盖指定 bean 的 public 入口。

**运行结果：** 同包其他 bean 不会因为包通配符而自动进入横切逻辑。

**常见误区：** `execution(* com.example..service..*(..))` 容易让未来新增方法在没有评审时改变行为。

### 10. 五类 advice 的执行时机
**它是什么：** before、after returning、after throwing、after finally 与 around 观察调用的时机不同。

**有什么作用：** 选择最窄 advice 可以减少意外短路、替换返回值或吞掉异常的机会。

**什么时候使用：** 前置校验用 before；成功记录用 returning；失败记录用 throwing；清理用 after；
确实要包围调用时才用 around。

**怎么使用：**

1. 为成功与失败路径分别写出期望计数。
2. around 明确调用一次 `proceed()`。
3. 对 returning、throwing 和 finally 的互斥或共同执行关系做断言。

**最小示例：** `@AfterThrowing(pointcut = "serviceOperation()", throwing = "failure")` 只观察失败。

**运行结果：** 成功不执行 throwing，失败不执行 returning，但 after finally 两条路径都执行。

**常见误区：** 为了“统一”全部使用 around，会把原本只读的观察逻辑升级为控制流修改者。

### 11. `proceed()`、返回值与执行次数
**它是什么：** `ProceedingJoinPoint.proceed()` 把 around advice 的控制权交给下一层代理或目标方法。

**有什么作用：** 它明确目标是否执行、执行几次，以及调用方最终看到哪个返回值。

**什么时候使用：** 计时、显式重试、缓存短路或受控结果转换确实需要包围调用时使用。

**怎么使用：**

1. 在代码审查中写明允许的 `proceed()` 次数。
2. 保存并原样返回业务结果，除非产品合同明确要求转换。
3. 不捕获宽泛 `Throwable` 后返回 `null` 冒充成功。

**最小示例：** `Object result = joinPoint.proceed(); return result;` 保留下一层结果。

**运行结果：** fixture 中每个代理入口只执行一次目标，失败仍以原业务异常离开代理。

**常见误区：** 忘记 `proceed()` 会短路业务；调用两次会重复扣款、写库或发送消息。

### 12. 自调用为什么绕过代理
**它是什么：** 目标方法中的 `this.otherMethod()` 直接调用当前目标对象，不会重新经过外部代理。

**有什么作用：** 理解这一点可以解释“外部调用有 advice，类内调用却没有”的现象。

**什么时候使用：** 设计事务、缓存、审计等代理边界，或排查 advice 次数不符时必须检查。

**怎么使用：**

1. 同时准备外部代理调用和目标内部调用。
2. 记录目标执行次数与 advice 执行次数。
3. 需要独立横切边界时拆出协作者，通过另一个 bean 的代理入口调用。

**最小示例：** `batch()` 内部连续调用两次 `charge()`，目标计数增加两次而 charge advice 不增加。

**运行结果：** fixture 能看到 batch 入口 advice 一次，内部两次 charge 不重新进入代理。

**常见误区：** 不要优先依赖 `AopContext.currentProxy()`，它会把业务代码绑死在 Spring AOP 上。

### 13. public、protected、private 与 final 边界
**它是什么：** 代理机制决定哪些方法可以形成可覆写或接口分派入口。

**有什么作用：** 它防止把“反射能找到成员”错误地当成“Spring 一定能 advice”。

**什么时候使用：** 选择切点和代理类型前，必须核对类、方法和调用入口的可见性与 final 状态。

**怎么使用：**

1. JDK 代理把横切合同放在 public 接口方法上。
2. CGLIB 可覆盖 public、protected 及特定包可见入口，但不能覆写 final 或 private 方法。
3. 通用服务 API 仍优先 public，不把 protected 能力当默认设计。

**最小示例：** 同一 CGLIB advisor 匹配 `charge`、`protectedCharge` 和 `finalCharge`。

**运行结果：** 前两个代理入口可计数，final 方法直接执行目标实现而不进入 advisor。

**常见误区：** private 方法即使能被 `getDeclaredMethod` 找到，也不能被 CGLIB 子类覆写。

### 14. 异常与返回值也是横切合同
**它是什么：** 业务方法的异常类型、cause 和返回值是调用方依赖的公开行为。

**有什么作用：** 观察型 advice 保留这些行为，上层仍能按原类型回滚、重试或返回错误。

**什么时候使用：** 日志、指标、鉴权和审计 advice 都要明确是否允许改变业务结果。

**怎么使用：**

1. 为正常结果做精确断言。
2. 为失败路径断言原始异常类型和消息。
3. 只有在明确的边界映射层才包装异常，并保留 cause。

**最小示例：** around 不捕获 `IllegalStateException`，让它穿过代理。

**运行结果：** `charge("FAIL")` 仍抛出 `IllegalStateException`，不会变成 `null`。

**常见误区：** 捕获 `Throwable` 后打印日志并返回空值，会把失败改写成看似成功的响应。

### 15. 用目标对象和代理对象分别测试

**它是什么：** 目标测试验证业务规则，代理测试验证 pointcut、advice、代理类型和控制流。

**有什么作用：** 两层测试能快速判断失败来自业务实现还是横切接线。

**什么时候使用：** 新增或修改任何切面、代理配置或受影响服务入口时使用。

**怎么使用：**

1. 先直接测试目标对象的输入、输出和异常。
2. 再从 Spring 容器取代理，验证命中与未命中入口。
3. 同时断言 advice 计数、目标计数、代理类型和异常传播。

**最小示例：** `Proxy.isProxyClass(service.getClass())` 只用于确认 JDK 代理，不代替行为断言。

**运行结果：** 完整 fixture 输出代理类型、五类 advice 计数、目标次数和失败类型。

**常见误区：** 只 new 目标对象进行测试，永远不会触发 Spring AOP。

## 现代版本中的正确用法
Java 25 主线先使用公开 API 和构造器合同；确需深反射时，把模块开放当成部署合同，并检查
`trySetAccessible()` 结果。Spring 7.0.8 主线把 AOP 放在 public 服务入口，用精确 pointcut 和最窄
advice 表达横切意图。日志与指标保持观察型，不改变业务参数、返回值或异常。

推荐决策顺序如下：

1. 普通 Java 调用能否解决问题？能则不使用反射。
2. 只需要按运行时元数据选择成员吗？使用受控反射适配层。
3. 已有稳定服务接口吗？优先考虑 JDK 代理入口。
4. 必须按类代理吗？确认类和方法可继承，并显式选择 CGLIB。
5. pointcut 是否能列出命中与未命中样例？不能则继续缩小范围。
6. before 或 after advice 能否完成需求？能则不升级为 around。

:::tip
把 pointcut 当作受影响 API 清单审查。每次新增服务方法时，都运行“应命中 / 不应命中”反馈环，
比只看切点字符串更容易发现范围漂移。
:::

## 基本语法与核心接口
反射调用由 `Class` 定位 `Constructor` 或 `Method`，执行 `Method.invoke` 时再从
`InvocationTargetException.getCause()` 取回真实业务异常。`@AspectJ` 风格用 `@Pointcut` 声明范围，
再用 `@Before`、`@AfterReturning`、`@AfterThrowing`、`@After` 或 `@Around` 声明行为。下面的完整
fixture 把这些接口放进同一个可运行反馈环，避免短代码片段和最终执行源码重复。

## 从零跟着做

下面的完整 fixture 同时验证 Java 反射、JDK 代理、CGLIB、五类 advice、自调用和异常传播。

1. 创建一个 `/tmp` 临时 Maven 项目。
2. 写入下面的 `pom.xml`。
3. 把 Java 文件放到 `src/main/java/course/ReflectionAopFeedback.java`。
4. 在 Java 25 Maven 容器中编译并运行。
5. 核对唯一成功标记及各计数。

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>4.1.0</version>
    <relativePath/>
  </parent>
  <groupId>course</groupId>
  <artifactId>reflection-aop-feedback</artifactId>
  <version>1.0.0</version>
  <properties>
    <maven.compiler.release>25</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-aspectj</artifactId>
    </dependency>
  </dependencies>
  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId><artifactId>maven-compiler-plugin</artifactId>
        <configuration>
          <compilerArgs><arg>-Xlint:all</arg><arg>-Werror</arg></compilerArgs>
        </configuration>
      </plugin>
    </plugins>
  </build>
</project>
```

```java
package course;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.aop.MethodBeforeAdvice;
import org.springframework.aop.framework.ProxyFactory;
import org.springframework.aop.support.NameMatchMethodPointcutAdvisor;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;

public final class ReflectionAopFeedback {
    public interface BillingService {
        /** 扣款并返回订单标记。 */
        String charge(String orderId);
        /** 在目标对象内部连续执行两次扣款。 */
        String batch(String firstOrderId, String secondOrderId);
    }
    public static class DefaultBillingService implements BillingService {
        private int targetCalls;
        /** 创建默认扣款服务。 */
        public DefaultBillingService() {}
        /** 执行一次可观察的扣款调用。 */
        @Override
        public String charge(String orderId) {
            targetCalls++;
            if ("FAIL".equals(orderId)) {
                throw new IllegalStateException("charge failed: " + orderId);
            }
            return "charged:" + orderId;
        }
        /** 证明目标对象内部调用不会重新经过外部代理。 */
        @Override
        public String batch(String firstOrderId, String secondOrderId) {
            return charge(firstOrderId) + "," + charge(secondOrderId);
        }
        /** 返回目标方法实际执行次数。 */
        public int targetCalls() { return targetCalls; }
    }
    public static class ClassBillingService {
        /** 提供可由 CGLIB 覆写的公开入口。 */
        public String charge() { return "public"; }
        /** 提供可由 CGLIB 覆写的受保护入口。 */
        protected String protectedCharge() { return "protected"; }
        /** 通过未映射的公开入口调用私有实现。 */
        public String callPrivateCharge() { return privateCharge(); }
        /** 提供不能由 CGLIB 覆写的私有实现。 */
        private String privateCharge() { return "private"; }
        /** 提供不能由 CGLIB 覆写的最终入口。 */
        public final String finalCharge() { return "final"; }
    }
    public static final class ReflectionSample {
        /** 创建反射样例。 */
        public ReflectionSample() {}
        /** 返回传入值。 */
        public String echo(String value) { return "echo:" + value; }
        /** 抛出可由反射包装的业务异常。 */
        public void fail() { throw new IllegalArgumentException("reflection failure"); }
    }
    @Aspect
    public static final class ContractAspect {
        private int beforeCount;
        private int returningCount;
        private int throwingCount;
        private int finallyCount;
        private int aroundCount;
        /** 选择 billingService bean 的公开方法入口。 */
        @Pointcut("bean(billingService) && execution(public * *(..))")
        public void serviceOperation() {}
        /** 记录方法开始。 */
        @Before("serviceOperation()")
        public void before() { beforeCount++; }
        /** 记录成功返回。 */
        @AfterReturning("serviceOperation()")
        public void afterReturning() { returningCount++; }
        /** 记录业务失败。 */
        @AfterThrowing(pointcut = "serviceOperation()", throwing = "failure")
        public void afterThrowing(Throwable failure) {
            if (!(failure instanceof IllegalStateException)) {
                throw new AssertionError("unexpected failure type", failure);
            }
            throwingCount++;
        }
        /** 记录成功和失败都会执行的清理阶段。 */
        @After("serviceOperation()")
        public void afterFinally() { finallyCount++; }
        /** 只调用一次目标并原样返回结果。 */
        @Around("serviceOperation()")
        public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
            aroundCount++;
            return joinPoint.proceed();
        }
    }
    @SpringBootConfiguration
    @EnableAutoConfiguration
    public static class AppConfig {
        /** 提供待代理的业务服务。 */
        @Bean
        BillingService billingService() { return new DefaultBillingService(); }
        /** 提供横切合同切面。 */
        @Bean
        ContractAspect contractAspect() { return new ContractAspect(); }
    }
    /** 验证反射构造、调用和异常包装。 */
    private static void verifyReflection() throws Exception {
        Constructor<ReflectionSample> constructor = ReflectionSample.class.getDeclaredConstructor();
        ReflectionSample sample = constructor.newInstance();
        Method echo = ReflectionSample.class.getMethod("echo", String.class);
        if (!"echo:A-100".equals(echo.invoke(sample, "A-100"))) {
            throw new AssertionError("reflection result mismatch");
        }
        Method fail = ReflectionSample.class.getMethod("fail");
        try {
            fail.invoke(sample);
            throw new AssertionError("reflection failure expected");
        } catch (InvocationTargetException failure) {
            if (!(failure.getCause() instanceof IllegalArgumentException)) {
                throw new AssertionError("reflection cause mismatch", failure);
            }
        }
    }
    /** 验证 CGLIB 对公开、受保护、私有和最终方法的边界。 */
    private static int verifyClassProxy() {
        int[] calls = {0};
        MethodBeforeAdvice counter = (method, arguments, target) -> calls[0]++;
        NameMatchMethodPointcutAdvisor advisor = new NameMatchMethodPointcutAdvisor(counter);
        advisor.setMappedNames("charge", "protectedCharge", "privateCharge", "finalCharge");
        ProxyFactory factory = new ProxyFactory(new ClassBillingService());
        factory.setProxyTargetClass(true);
        factory.addAdvisor(advisor);
        ClassBillingService proxy = (ClassBillingService) factory.getProxy();
        proxy.charge();
        proxy.protectedCharge();
        if (!"private".equals(proxy.callPrivateCharge())) {
            throw new AssertionError("private method result mismatch");
        }
        proxy.finalCharge();
        if (calls[0] != 2) {
            throw new AssertionError("CGLIB boundary mismatch: " + calls[0]);
        }
        return calls[0];
    }
    /** 通过 Boot 自动配置按属性选择代理类型。 */
    private static ConfigurableApplicationContext startBoot(boolean cglib) {
        return new SpringApplicationBuilder(AppConfig.class).web(WebApplicationType.NONE)
                .logStartupInfo(false).bannerMode(org.springframework.boot.Banner.Mode.OFF)
                .properties("logging.level.root=OFF", "spring.aop.proxy-target-class=" + cglib).run();
    }
    /** 运行全部反馈环并输出唯一成功标记。 */
    public static void main(String[] args) throws Exception {
        verifyReflection();
        int classProxyCalls = verifyClassProxy();
        try (ConfigurableApplicationContext context = startBoot(true)) {
            if (!org.springframework.aop.support.AopUtils.isCglibProxy(context.getBean(BillingService.class))) {
                throw new AssertionError("Boot CGLIB proxy expected");
            }
        }
        try (ConfigurableApplicationContext context = startBoot(false)) {
            BillingService service = context.getBean(BillingService.class);
            ContractAspect aspect = context.getBean(ContractAspect.class);
            if (!Proxy.isProxyClass(service.getClass())) {
                throw new AssertionError("JDK proxy expected");
            }
            if (!"charged:A-100".equals(service.charge("A-100"))) {
                throw new AssertionError("charge result mismatch");
            }
            String batch = service.batch("B-100", "B-200");
            if (!"charged:B-100,charged:B-200".equals(batch)) {
                throw new AssertionError("batch result mismatch");
            }
            String failureType;
            try {
                service.charge("FAIL");
                throw new AssertionError("business failure expected");
            } catch (IllegalStateException failure) {
                failureType = failure.getClass().getSimpleName();
            }
            DefaultBillingService target =
                    (DefaultBillingService) ((org.springframework.aop.framework.Advised) service)
                            .getTargetSource().getTarget();
            if (target.targetCalls() != 4
                    || aspect.beforeCount != 3
                    || aspect.returningCount != 2
                    || aspect.throwingCount != 1
                    || aspect.finallyCount != 3
                    || aspect.aroundCount != 3) {
                throw new AssertionError("advice or self-invocation count mismatch");
            }
            System.out.println(
                    "REFLECTION_AOP_PASS bootProxies=JDK,CGLIB classAdvice=" + classProxyCalls
                            + " before=" + aspect.beforeCount
                            + " returning=" + aspect.returningCount
                            + " throwing=" + aspect.throwingCount
                            + " finally=" + aspect.finallyCount
                            + " around=" + aspect.aroundCount
                            + " target=" + target.targetCalls()
                            + " failure=" + failureType);
        }
    }
}
```

预期输出：

```text
REFLECTION_AOP_PASS bootProxies=JDK,CGLIB classAdvice=2 before=3 returning=2 throwing=1 finally=3 around=3 target=4 failure=IllegalStateException
```

Boot 的 `spring.aop.proxy-target-class=true/false` 已分别建立 CGLIB/JDK 代理。这组计数同时证明：CGLIB 的
public、protected 映射入口各执行一次 advice，未映射的 public 入口调用 private
方法以及 final 映射入口都不增加计数；三次外部 JDK 代理入口都执行 before、around、finally；两次成功
执行 returning；一次失败执行 throwing；`batch` 内部两次 `charge` 只增加目标计数，不重新增加 advice 计数。

## 如何使用
在真实服务中按以下顺序落地：

1. 写出服务公开接口、返回值和异常合同。
2. 判断横切规则是观察、前置拒绝还是控制流修改。
3. 用 bean、类型、方法或注解建立最小 pointcut。
4. 选最窄 advice；around 必须记录 `proceed()` 次数和失败传播方式。
5. 从容器取得代理进行行为测试，同时直接测试目标业务。
6. 修改服务方法后重跑命中、未命中、自调用和失败反馈环。

## 适用与不适用场景
适合使用 Spring AOP 的场景：

- 多个 Spring bean 共享方法级日志、指标、事务、鉴权或审计规则。
- 横切规则能以明确 pointcut 表达，且调用来自代理外部。
- 调用方只依赖稳定 public 服务合同。

不适合直接使用 Spring AOP 的场景：

- 需要拦截构造器、字段读写或任意对象调用。
- 业务逻辑主要发生在 private、final 或类内自调用中。
- 只有一个调用点，普通方法组合更直接。
- 需要无边界深反射读取第三方模块内部状态。

## 当前项目补充
冻结矩阵只证明 `dzzz-app` 存在反射、AOP、切点和代理场景，并记录“范围扩大或控制流改写”风险
候选。本批没有重新读取项目源码，因此不能断言代表类当前一定有缺陷。课程把代表风险转成三条纠正合同：

1. 切点必须列出命中与未命中入口。
2. 观察型 advice 不改变业务参数、返回值或异常。
3. around 必须显式约束 `proceed()` 次数，禁止失败后返回 `null` 冒充成功。

## Java 8 / Spring Boot 2.3 兼容写法
完整 Java 源码刻意只使用 Java 8 共同语法，因此 legacy 反馈环复用同一文件，不复制第二份易漂移
实现。旧线只替换精确依赖与编译目标：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.3.12.RELEASE</version>
    <relativePath/>
  </parent>
  <groupId>course</groupId>
  <artifactId>reflection-aop-feedback-legacy</artifactId>
  <version>1.0.0</version>
  <properties>
    <maven.compiler.source>1.8</maven.compiler.source>
    <maven.compiler.target>1.8</maven.compiler.target>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-aop</artifactId>
    </dependency>
  </dependencies>
  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId><artifactId>maven-compiler-plugin</artifactId>
        <configuration>
          <compilerArgs><arg>-Xlint:all</arg><arg>-Werror</arg></compilerArgs>
        </configuration>
      </plugin>
    </plugins>
  </build>
</project>
```

Java 8 没有 `trySetAccessible()`、`canAccess()` 和 JPMS。若 legacy 适配层必须访问非 public 成员，
只能隔离使用 `setAccessible(true)`，记录安全与升级债务；课程完整示例只使用 public 合同，不需要关闭
访问检查。Boot 2.3.12 官方运行范围止于 Java 15，不能用 Java 25 容器代替真实 Java 8 验证。

## 新旧版本差异
| 对比项 | Java 25 / Boot 4.1 | Java 8 / Boot 2.3 | 迁移注意 |
| --- | --- | --- | --- |
| 深反射 | 受 JPMS 和 `trySetAccessible` 约束 | 无 JPMS 与该 API | 优先迁移到公开 API 或显式 opens |
| JDK 代理 | 有模块规则和 `invokeDefault` | 无这两项 | 共同主线只依赖接口 `invoke` |
| Framework | 7.0.8 | 5.2.15.RELEASE | 核心代理与自调用合同一致 |
| Boot 默认代理 | 默认 CGLIB | 默认 CGLIB | 裸 Framework 注解默认值不同 |
| AspectJ Weaver | 1.9.25.1 | 1.9.6 | 使用各自 Boot 管理版本 |
| 运行时范围 | Java 17-26 | Java 8-15 | legacy 不宣称支持 Java 25 |

## 易错点

:::pitfalls
### 易错点 1：发现 private 方法就认为 AOP 能拦截
**触发条件：** `getDeclaredMethod` 找到 private 方法后，把它写进 Spring pointcut；**现象：**
private 方法正常运行，但代理的 advice 计数没有增加。

**原因：** 反射发现成员与代理覆写或接口分派是两个不同机制。

**后果：** private 方法正常执行，但 advice 永远不运行，审计或事务边界缺失。

**错误示例：**
```java
/** 错误地把私有方法当成代理入口。 */
private void settle() {}
```
**正确写法：**
```java
/** 暴露可由代理拦截的服务入口。 */
public void settle() {}
```
**验证方式：** 同时断言代理入口 advice 计数和目标内部计数；**影响版本：** 本课核验的 Spring
Framework 7.0.8 与 5.2.15.RELEASE；**来源依据：** `spring7-pointcuts`、`spring7-proxying`、
`spring5-core-aop`。
### 易错点 2：使用过宽包切点
**触发条件：** pointcut 覆盖整个 service 包的所有方法；**现象：** 新增的无关服务方法也执行了
advice。

**原因：** 新增方法自动命中，评审无法从业务改动看出横切行为变化。

**后果：** 日志泄露、意外校验、性能开销或控制流改变扩散到无关入口。

**错误示例：**
```java
String pointcut = "execution(* com.example..service..*(..))";
```
**正确写法：**
```java
String pointcut = "bean(billingService) && execution(public * *.charge(..))";
```
**验证方式：** 加入同包无关 bean，确认其 advice 计数始终为 0；**影响版本：** 本课核验的 Spring
Framework 7.0.8 与 5.2.15.RELEASE；**来源依据：** `spring7-pointcuts` 与课程的切点范围反馈环。
### 易错点 3：around 吞掉业务异常
**触发条件：** around 捕获 `Throwable`、打印日志并返回 `null`；**现象：** 调用方收到 `null`，
没有收到原本的业务异常。

**原因：** advice 改写了服务公开异常和返回值合同。

**后果：** 调用方把失败当成功，事务、重试或错误响应判断失效。

**错误示例：**
```java
catch (Throwable failure) { return null; }
```
**正确写法：**
```java
catch (Throwable failure) { throw failure; }
```
**验证方式：** 断言代理仍抛出 `IllegalStateException`，且 throwing 计数为 1；**影响版本：** 本课
核验的 Spring Framework 7.0.8 与 5.2.15.RELEASE；**来源依据：** `spring7-advice` 与双版本
`proceed()` 负向反馈环。
### 易错点 4：依赖自调用触发 advice
**触发条件：** 同一目标对象的一个方法通过 `this` 调另一个匹配方法；**现象：** 目标方法执行，
但对应的 advice 计数没有增加。

**原因：** 调用没有重新经过外部代理。

**后果：** 缓存、事务、审计或权限行为只在部分路径生效。

**错误示例：**
```java
this.audit();
```
**正确写法：**
```java
auditService.audit();
```
**验证方式：** 比较 batch 的目标调用次数与 advice 次数；**影响版本：** 本课核验的 Spring
Framework 7.0.8 与 5.2.15.RELEASE；**来源依据：** `spring7-proxying`、`spring5-core-aop`。
### 易错点 5：把 Boot 默认值当成所有 Spring 默认值
**触发条件：** 看到 Boot 默认 CGLIB，就认为 `@EnableAspectJAutoProxy` 也默认类代理；**现象：**
实际 bean 是 JDK 代理，向实现类强制转换时失败。

**原因：** Boot 自动配置与 Framework 注解是不同配置层。

**后果：** 强制转换、代理可见性与测试断言在换环境后失败。

**错误示例：**
```java
DefaultBillingService service = (DefaultBillingService) context.getBean(BillingService.class);
```
**正确写法：**
```java
BillingService service = context.getBean(BillingService.class);
```
**验证方式：** 对 JDK 使用 `Proxy.isProxyClass`，对 CGLIB 验证子类代理和 final 边界；
**影响版本：** 本课核验的 Spring Boot 4.1.0 与 Spring Framework 7.0.8 配置层；**来源依据：**
`boot41-aop`、`spring7-proxying`。
:::

## 安全注意
- 反射和 advice 日志不得输出令牌、密码、完整请求体或敏感返回值。
- 不使用无条件 `setAccessible(true)` 绕过模块与封装边界。
- 鉴权 advice 的 pointcut 必须采用允许列表思路，并覆盖未授权失败路径。
- 异常日志保留诊断信息但不把内部堆栈直接返回客户端。

## 性能注意
本课不声称代理或反射“更快”或“更慢”。需要优化时，先用 JFR/JMC 定位真实热点，再在固定 JDK、
依赖、硬件和负载下用 JMH 比较直接调用、反射和代理；一次循环计时不能支撑结论。常用反射元数据
可以在明确生命周期内缓存，但缓存键、类加载器所有权和失效策略必须单独设计。

## 如何验证
1. 从完整代码块创建现代 `/tmp` fixture。
2. 使用 `maven:3.9.12-eclipse-temurin-25` 编译，开启 `-Xlint:all -Werror`。
3. 运行主类并核对 `REFLECTION_AOP_PASS` 全部计数。
4. 使用相同源码和 legacy POM 在 `maven:3.9.12-eclipse-temurin-8` 重跑。
5. 增加一个宽切点负例，确认无关 bean 的 advice 计数会暴露错误范围。
6. 把 around 的 `proceed()` 临时删除，确认成功标记失败，再恢复正确实现。
7. 对课程 Markdown 运行 frontmatter、知识点、易错点和方法中文注释校验。
8. 发布后连续三次冷启动 Catalog，并检查桌面端与 390px 页面。
9. 删除 `/tmp` fixture、Maven 缓存副本和浏览器资产，再检查路径不存在。

:::exercise
### 练习：为退款服务建立最小审计切点

**要求：** 定义 `RefundService.refund` public 接口，只让 `refundService` bean 命中；成功记录订单号掩码，
失败保留原异常；再增加一个 `preview` 方法证明其不命中。

**验收：** 成功时 returning 为 1，失败时 throwing 为 1，finally 为 2；`preview` 不改变任何 advice
计数；目标异常类型保持不变。

**参考答案：** 使用 `bean(refundService) && execution(public * *.refund(..))`，before 只记录脱敏标识，
returning/throwing 分开观察，避免不必要的 around。
:::

## 本节小结
- 反射发现与调用成员，JDK Proxy 实现接口，Spring AOP 拦截 Spring bean 方法执行，三者不能混淆。
- pointcut 决定影响范围，advice 决定控制流；范围、次数、返回值和异常都必须可验证。
- JDK 与 CGLIB 有不同入口，private、final 和自调用不能靠反射能力推导为可 advice。
- Java 25 先尊重模块边界；Java 8 与 Boot 2.3 只作为真实旧环境的隔离补充。
