# Java 高级第 1 门：反射、Spring AOP 与横切合同研究

> 课程 ID：`backend.java.learn.advanced.reflection-aop-and-cross-cutting-contracts`  
> 冻结顺序：500  
> 研究日期：2026-08-10  
> 冻结快照：`dzzz-app-20260803-179e722831ab`  
> 边界：只读取 Phase 2 冻结审计产物，不重新读取或运行 `dzzz-app`

## 冻结课程合同

- 标题：反射、Spring AOP 与横切合同。
- 阶段：`advanced`，深度：`lesson`。
- 前置课程：注解与元数据、依赖注入与 Bean 生命周期、JUnit 与 Mock 测试。
- 来源能力：
  1. `JAVA-STDLIB-020`：反射、动态实例化与注解读取。
  2. `JAVA-FRAMEWORK-004`：Spring AOP 与 AspectJ。
  3. `JAVA-RISK-013`：切面扩大行为范围或改写控制流，只作纠错证据。
- 冻结矩阵继续保持 `researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`；本研究稿不修改矩阵、track、manifest 或 signoff。

## 研究范围与版本基线

### 现代主线

- Java 25 LTS。
- Spring Boot 4.1.0，官方支持 Java 17 至 Java 26。
- Spring Framework 7.0.8。
- 先建立反射、JDK 动态代理和 Spring AOP 三个不同层次的合同，再讲组合用法。

### 兼容线

- Java 8。
- Spring Boot 2.3.12.RELEASE，官方支持 Java 8 至 Java 15。
- Spring Framework 5.2.15.RELEASE。
- 旧线只解释冻结项目场景；不能把 Java 25 写成 Boot 2.3.12 的官方支持运行时。

## 核验方法与已核验的官方直接来源

以下来源均在 2026-08-10 通过官方直接 URL 核验。Spring 当前参考页的适用补丁版本由同日
Boot 4.1.0 系统要求锁定为 Framework 7.0.8；精确旧线使用版本化归档页。

1. **`java25-class`**
   - 来源名称：Java SE 25 `Class` API；官方 URL：
     <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Class.html>。
   - 版本：Java 25；`sourceType: api-doc`；`appliesTo: Java 25`；
     `verifiedAt: 2026-08-10`。
   - `claims`：`getMethods()` 查 public 方法及继承成员；`getDeclaredMethods()` 查当前类型声明的
     各可见性方法但不含继承成员；现代实例化使用 `getDeclaredConstructor().newInstance()`。
2. **`java25-method`**
   - 来源名称：Java SE 25 `Method` API；官方 URL：
     <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/reflect/Method.html>。
   - 版本：Java 25；`sourceType: api-doc`；`appliesTo: Java 25`；
     `verifiedAt: 2026-08-10`。
   - `claims`：`invoke` 执行底层方法并做方法调用转换；目标抛出的异常包装为
     `InvocationTargetException`。
3. **`java25-accessible-object`**
   - 来源名称：Java SE 25 `AccessibleObject` API；官方 URL：
     <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/reflect/AccessibleObject.html>。
   - 版本：Java 25；`sourceType: api-doc`；`appliesTo: Java 25`；
     `verifiedAt: 2026-08-10`。
   - `claims`：访问受成员可见性及模块 `reads`、`exports`、`opens` 约束；
     `trySetAccessible()` 可返回失败，`setAccessible(true)` 可抛 `InaccessibleObjectException`。
4. **`java25-proxy`**
   - 来源名称：Java SE 25 `Proxy` 与 `InvocationHandler` API；官方 URL：
     <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/reflect/Proxy.html>、
     <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/reflect/InvocationHandler.html>。
   - 版本：Java 25；`sourceType: api-doc`；`appliesTo: Java 25`；
     `verifiedAt: 2026-08-10`。
   - `claims`：JDK 动态代理在运行时实现接口并把调用分派给 `InvocationHandler.invoke()`；
     `invokeDefault()` 可调用代理接口默认方法；代理类的模块与可访问性受被代理接口约束。
5. **`java8-class`**
   - 来源名称：Java SE 8 `Class` API；官方 URL：
     <https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html>。
   - 版本：Java 8；`sourceType: api-doc`；`appliesTo: Java 8`；
     `verifiedAt: 2026-08-10`。
   - `claims`：方法发现和 `getDeclaredConstructor()` 合同已存在；`Class.newInstance()` 仍存在，
     但兼容示例采用同样可用于 Java 8 的 `Constructor.newInstance()`。
6. **`java8-method`**
   - 来源名称：Java SE 8 `Method` API；官方 URL：
     <https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/Method.html>。
   - 版本：Java 8；`sourceType: api-doc`；`appliesTo: Java 8`；
     `verifiedAt: 2026-08-10`。
   - `claims`：`invoke` 的核心调用与异常包装合同和现代线一致。
7. **`java8-accessible-object`**
   - 来源名称：Java SE 8 `AccessibleObject` API；官方 URL：
     <https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/AccessibleObject.html>。
   - 版本：Java 8；`sourceType: api-doc`；`appliesTo: Java 8`；
     `verifiedAt: 2026-08-10`。
   - `claims`：`setAccessible` 主要受 Java 访问检查和
     `ReflectPermission("suppressAccessChecks")` 约束；没有 JPMS 与 `trySetAccessible()`。
8. **`java8-proxy`**
   - 来源名称：Java SE 8 `Proxy` 与 `InvocationHandler` API；官方 URL：
     <https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/Proxy.html>、
     <https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/InvocationHandler.html>。
   - 版本：Java 8；`sourceType: api-doc`；`appliesTo: Java 8`；
     `verifiedAt: 2026-08-10`。
   - `claims`：旧线同样把接口调用分派给 `InvocationHandler.invoke()`；没有 `invokeDefault()`，
     也不存在 Java 25 的 JPMS 代理规则。
9. **`spring7-aop-concepts`**
   - 来源名称：Spring Framework AOP Concepts；官方 URL：
     <https://docs.spring.io/spring-framework/reference/core/aop/introduction-defn.html>。
   - 版本：Spring Framework 7.0.8 当前参考快照；`sourceType: official-reference`；
     `appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-10`。
   - `claims`：join point 在 Spring AOP 中总是方法执行；pointcut 选择 join point；around advice
     可以继续、短路、返回值或抛异常。
10. **`spring7-pointcuts`**
    - 来源名称：Spring Framework Declaring a Pointcut；官方 URL：
      <https://docs.spring.io/spring-framework/reference/core/aop/ataspectj/pointcuts.html>。
    - 版本：Spring Framework 7.0.8 当前参考快照；`sourceType: official-reference`；
      `appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-10`。
    - `claims`：Spring AOP 只支持 Spring bean 的方法执行 join point；JDK 代理只拦截 public
      接口入口，CGLIB 可拦截代理入口的 public、protected 及必要时包可见方法。
11. **`spring7-advice`**
    - 来源名称：Spring Framework Declaring Advice；官方 URL：
      <https://docs.spring.io/spring-framework/reference/core/aop/ataspectj/advice.html>。
    - 版本：Spring Framework 7.0.8 当前参考快照；`sourceType: official-reference`；
      `appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-10`。
    - `claims`：before、after returning、after throwing、after finally、around 的时机不同；
      around 只有调用 `proceed()` 才执行目标，返回值就是调用方所见值。
12. **`spring7-proxying`**
    - 来源名称：Spring Framework Proxying Mechanisms；官方 URL：
      <https://docs.spring.io/spring-framework/reference/core/aop/proxying.html>。
    - 版本：Spring Framework 7.0.8 当前参考快照；`sourceType: official-reference`；
      `appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-10`。
    - `claims`：Framework 在 JDK 与 CGLIB 代理间选择；final 类不能做类代理，final/private 方法
      不能 advice；显式或隐式 `this` 自调用绕过 advice。
13. **`spring5-core-aop`**
    - 来源名称：Spring Framework 5.2.15 Core Technologies；官方 URL：
      <https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/core.html>。
    - 版本：Spring Framework 5.2.15.RELEASE；`sourceType: official-reference`；
      `appliesTo: Spring Framework 5.2.15.RELEASE`；`verifiedAt: 2026-08-10`。
    - `claims`：旧线同样使用 JDK/CGLIB 代理、CGLIB public/protected 入口和自调用绕过合同；
      final 方法不可 advice，private 方法不能通过子类覆写形成代理入口。
14. **`boot41-system-requirements`**
    - 来源名称：Spring Boot System Requirements；官方 URL：
      <https://docs.spring.io/spring-boot/system-requirements.html>。
    - 版本：Spring Boot 4.1.0；`sourceType: official-reference`；
      `appliesTo: Spring Boot 4.1.0 / Spring Framework 7.0.8+`；`verifiedAt: 2026-08-10`。
    - `claims`：Boot 4.1.0 支持 Java 17 至 26并要求 Framework 7.0.8 以上，Java 25 在范围内。
15. **`boot41-aop`**
    - 来源名称：Spring Boot Aspect-Oriented Programming；官方 URL：
      <https://docs.spring.io/spring-boot/reference/features/aop.html>。
    - 版本：Spring Boot 4.1.0；`sourceType: official-reference`；
      `appliesTo: Spring Boot 4.1.0`；`verifiedAt: 2026-08-10`。
    - `claims`：Boot 提供 AOP 自动配置且默认 CGLIB；设置
      `spring.aop.proxy-target-class=false` 才改为 JDK 代理。
16. **`boot41-dependencies`**
    - 来源名称：Spring Boot Managed Dependency Coordinates；官方 URL：
      <https://docs.spring.io/spring-boot/appendix/dependency-versions/coordinates.html>。
    - 版本：Spring Boot 4.1.0；`sourceType: official-reference`；
      `appliesTo: AspectJ Weaver 1.9.25.1`；`verifiedAt: 2026-08-10`。
    - `claims`：Boot 4.1.0 的依赖管理坐标将 `aspectjweaver` 固定为 1.9.25.1。
17. **`boot2312-system-requirements`**
    - 来源名称：Spring Boot 2.3.12 Getting Started；官方 URL：
      <https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements>。
    - 版本：Spring Boot 2.3.12.RELEASE；`sourceType: official-reference`；
      `appliesTo: Java 8-15 / Spring Framework 5.2.15+`；`verifiedAt: 2026-08-10`。
    - `claims`：旧 Boot 的官方 Java 范围与最低 Framework 版本；不支持推出 Java 25 兼容性。
18. **`boot2312-dependencies`**
    - 来源名称：Spring Boot 2.3.12 Dependency Versions；官方 URL：
      <https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/appendix-dependency-versions.html>。
    - 版本：Spring Boot 2.3.12.RELEASE；`sourceType: official-reference`；
      `appliesTo: Spring Framework 5.2.15.RELEASE`；`verifiedAt: 2026-08-10`。
    - `claims`：受管依赖中的 `spring-aop` 和 `spring-aspects` 为 5.2.15.RELEASE，
      `aspectjweaver` 为 1.9.6。
19. **`boot2312-aop-auto-configuration`**
    - 来源名称：Spring Boot 2.3.12 `AopAutoConfiguration` API；官方 URL：
      <https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/api/org/springframework/boot/autoconfigure/aop/AopAutoConfiguration.html>。
    - 版本：Spring Boot 2.3.12.RELEASE；`sourceType: api-doc`；
      `appliesTo: Spring Boot 2.3.12.RELEASE`；`verifiedAt: 2026-08-10`。
    - `claims`：旧 Boot 也根据 `spring.aop.proxy-target-class` 在 JDK 与 CGLIB 自动配置间选择。

## 关键合同与版本差异

### 三个不能混淆的层次

1. 核心反射负责发现类型成员、读取元数据、动态构造和调用；能发现 private 方法不表示可以无条件访问。
2. JDK `Proxy` 只创建接口代理，把代理入口调用交给 `InvocationHandler`。
3. Spring AOP 只为 Spring bean 的方法执行建立代理拦截；反射能调用某方法，不表示 AOP 能 advice 它。

### Spring AOP 横切合同

- pointcut 是行为范围合同。课程采用可读的命名 pointcut，并用 `execution`、注解或 `bean` 约束范围，
  不用宽泛包通配符暗中覆盖无关业务。
- 优先选择 before、after returning、after throwing 等更窄 advice；只有确需包围调用、短路、重试或
  替换结果时才使用 around，并显式说明 `proceed()` 次数、异常和返回值合同。
- 横切逻辑不得让调用方无法判断业务方法是否执行。日志、指标等观察型 advice 不改写参数、返回值或异常。
- 自调用通过 `this` 直接到目标对象，不经过代理；课程以拆分协作者为首选修正，不推荐把业务代码绑定到
  `AopContext.currentProxy()`。

### 方法边界矩阵

| 场景 | Spring 7.0.8 | Spring 5.2.15 | 课程合同 |
| --- | --- | --- | --- |
| JDK 代理上的 public 接口方法 | 可拦截 | 可拦截 | 推荐的稳定入口 |
| CGLIB 代理上的 public 方法 | 可拦截 | 可拦截 | 推荐的稳定入口 |
| CGLIB 代理上的 protected/可见包方法 | 可拦截 | 可拦截 | 仅解释能力，通用 API 仍用 public |
| private 或等效不可见方法 | 不可 advice | 不可 advice | 不把反射访问当成 AOP 能力 |
| final 方法 | 不可由 CGLIB advice | 不可由 CGLIB advice | 不以 final 方法承载代理切点 |
| 目标对象内部自调用 | 绕过 advice | 绕过 advice | 通过代理入口或拆分职责 |
| 构造器、字段读写 | 非 Spring AOP join point | 非 Spring AOP join point | 需要时另行研究 AspectJ weaving |

### Java 25 与 Java 8 差异

| 对比项 | Java 25 | Java 8 | 教学决策 |
| --- | --- | --- | --- |
| 深反射访问 | 受模块 `reads/exports/opens` 约束 | 无 JPMS | 现代线先检查模块开放合同 |
| 访问探测 | `canAccess`、`trySetAccessible` | 无 `trySetAccessible` | 旧线隔离兼容写法 |
| 访问失败 | 可见 `InaccessibleObjectException` | 以访问检查和权限异常为主 | 不用无条件 `setAccessible(true)` |
| 动态实例化 | 避免已弃用 `Class.newInstance()` | 该 API 仍存在 | 两线统一用 `Constructor.newInstance()` |
| JDK 代理 | 接口代理并带模块规则 | 接口代理，无模块规则 | 示例只依赖共同的接口分派合同 |

## 冻结项目证据

| sourceId | 冻结计数与代表符号 | usage | 能支持的结论 |
| --- | --- | --- | --- |
| `JAVA-STDLIB-020` | 15；`ReflectionCacheUtil`、`DefaultAutowiredShardData`、`CxfClientUtil`、`AppAspect`、`DzzzAspect` | observed | 项目存在反射、动态实例化或注解读取场景 |
| `JAVA-FRAMEWORK-004` | 6；`AppAspect`、`PointCuts`、`DzzzAspect`、`DefaultAutowiredShardData`、`IAutowiredShardData` | observed | 项目存在 AOP、切点与代理相关能力 |
| `JAVA-RISK-013` | 3；`AppAspect`、`DzzzAspect`、`PointCuts` | corrected | 课程只提炼“范围扩大或控制流改写”的纠错边界 |

以上路径和符号只来自冻结矩阵。本批未读取项目源码；计数之间存在重叠，不能相加为独立证据总数。

## 易错点取证与禁止错误表述

1. 不能断言任一代表类当前存在缺陷、切点必然过宽或 advice 已改写控制流。
2. 不能从反射证据推出项目绕过访问控制，也不能从 private 可发现推出 private 可被 AOP advice。
3. 不能从 CGLIB 的 protected 能力推出某次调用实际经过代理；还需代理类型、可见性和入口调用证据。
4. 不能把冻结项目的切面写法当推荐；风险场景只能 `corrected`，不复制旧实现。
5. 不能把 Boot 自动配置文档当作核心 AOP 语义来源；代理、pointcut 与 advice 合同归 Framework 所有。
6. 不能宣称 Boot 2.3.12 支持 Java 25，也不能把当前 Boot starter 或配置原样回填旧线。

## 课程设计决策、fixture 合同与反馈环

1. 正文先用普通 Java 展示 `Class`、`Method`、`Constructor` 和注解读取，再引入 JDK 接口代理，最后
   引入 Spring bean 代理，避免把三个层次揉成一个“魔法”概念。
2. Spring 示例使用 public 服务合同、命名 pointcut 和最窄 advice；protected/private/final 与自调用
   只放边界或易错点，不作为推荐设计。
3. 项目补充仅保留冻结矩阵中的业务意图，展示经纠正的 Java 8 / Framework 5.2.15 兼容实现。
4. 在 `/tmp` 创建 Java 25 fixture，验证成员发现、构造器调用、异常包装和 JDK 代理分派。
5. 在 `/tmp` 创建 Boot 4.1.0 / Framework 7.0.8 fixture，验证 JDK/CGLIB、pointcut、五类 advice、
   public/protected/private/final 和自调用结果。
6. 在真实 Java 8 的 `/tmp` fixture 使用 Boot 2.3.12 / Framework 5.2.15 重跑兼容合同；若 Java 8
   不可用则明确标记 Deferred，不能用 Java 25 结果替代。
7. 每个 fixture 只保留最少断言，连续运行两次；结束后删除临时目录并检查不存在。

## 研究 Gate 自检

- [x] 课程 ID、顺序、三个前置与三个来源能力已从冻结矩阵核对。
- [x] 21 个官方直接来源均记录名称、URL、版本、`sourceType`、`appliesTo`、`claims` 和日期。
- [x] Java 25 / Java 8、Framework 7.0.8 / 5.2.15、Boot 4.1.0 / 2.3.12 边界已分开。
- [x] 冻结项目证据只使用 `observed`、`corrected`，没有读取 `dzzz-app` 或宣称确定缺陷。
- [x] 已记录不能推出的结论、课程设计决策和双版本反馈环。

## 发布结论与 Stop Boundary

本文件只完成 Java 高级第 1 门课程的官方资料研究。课程正文、临时反馈环、发布接线、页面证据、
独立 signoff 与双轴复审均未执行；不得据此开始任何后续高级课程。
