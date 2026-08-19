# Java 高级第 3 门：ThreadLocal、请求上下文传播与清理研究

> 课程 ID：`backend.java.learn.advanced.thread-context-and-cleanup`  
> 冻结顺序：520  
> 研究日期：2026-08-10  
> 冻结快照：`dzzz-app-20260803-179e722831ab`  
> 边界：只读取 Phase 2 冻结审计产物，不重新读取或运行 `dzzz-app`；不读取后续课程研究稿或正文

## 冻结课程合同

- 标题：ThreadLocal、请求上下文传播与清理。
- 阶段：`advanced`，深度：`lesson`。
- 前置课程：线程池、并发集合、锁与共享状态；Spring MVC 与 Servlet 边界。
- 来源能力：
  1. `JAVA-STDLIB-026`：ThreadLocal 上下文与清理。
  2. `JAVA-ENGINEERING-017`：请求、用户与线程上下文传播。
  3. `JAVA-RISK-032`：请求与 ThreadLocal 上下文清理和传播责任。
- 选择理由：冻结审计确认项目在线程本地和请求上下文中传递状态；课程必须明确传播边界与 `finally` 清理责任。
- 冻结矩阵继续保持 `researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`；本研究稿不修改矩阵、track、manifest 或 signoff。

## 研究范围与版本基线

### 现代主线

- Java 25 LTS。
- Spring Framework 7.0.8；课程只讲请求线程边界、`TaskDecorator` 和显式上下文恢复。
- `ScopedValue` 作为 Java 25 已交付的有界、只写一次上下文合同；不把它扩展成任意执行器的自动传播机制。
- 线程池复用、上下文覆盖和清理用可重复的单 worker 场景验证，不给没有测量依据的性能数字。

### 兼容线

- Java 8。
- Spring Boot 2.3.12.RELEASE，冻结项目对应 Spring Framework 5.2.15.RELEASE。
- Java 8 继续使用 `ThreadLocal`、`InheritableThreadLocal`、显式参数或自定义装饰器；没有 `ScopedValue`、
  Java 25 `ExecutorService.close()` 或 Spring 7.0.8 的 `ContextPropagatingTaskDecorator`。
- 旧线只解释冻结项目场景，不能把 Java 25 API 回填成 Java 8 合同。

## 核验方法与已核验的官方直接来源

以下 19 个直接 URL 均在 2026-08-10 通过 `curl -L --fail` 返回 HTTP 200。`api-doc` 为 Oracle Java
API，`release-note` 为 OpenJDK JEP 演进合同，`official-reference` 为 Spring 官方参考或 Javadoc。

1. **`java25-thread-local`**
   - 来源名称：Java SE 25 `ThreadLocal` API；官方 URL：
     <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ThreadLocal.html>。
   - 版本：Java 25；`sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-10`。
   - `claims`：每个线程拥有该变量的独立副本；`get()` 在需要时调用 `initialValue()`，`set()` 写入当前线程副本，
     `remove()` 删除当前线程副本且下一次 `get()` 可重新初始化；线程结束后其副本通常可被回收。

2. **`java8-thread-local`**
   - 来源名称：Java SE 8 `ThreadLocal` API；官方 URL：
     <https://docs.oracle.com/javase/8/docs/api/java/lang/ThreadLocal.html>。
   - 版本：Java 8；`sourceType: api-doc`；`appliesTo: Java 8`；`verifiedAt: 2026-08-10`。
   - `claims`：独立副本、初始化、`set`、`get`、`remove` 的基本合同与 Java 25 相同；旧线没有 Java 25 的新线程构建器
     选项或 `ScopedValue`。

3. **`java25-inheritable-thread-local`**
   - 来源名称：Java SE 25 `InheritableThreadLocal` API；官方 URL：
     <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/InheritableThreadLocal.html>。
   - 版本：Java 25；`sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-10`。
   - `claims`：适用于需要在创建子线程时自动传递用户 ID、事务 ID 等属性的场景；子线程创建时获得初始值，
     `childValue` 默认返回父值；Java 25 的线程构建器可选择不继承 inheritable thread-locals。

4. **`java8-inheritable-thread-local`**
   - 来源名称：Java SE 8 `InheritableThreadLocal` API；官方 URL：
     <https://docs.oracle.com/javase/8/docs/api/java/lang/InheritableThreadLocal.html>。
   - 版本：Java 8；`sourceType: api-doc`；`appliesTo: Java 8`；`verifiedAt: 2026-08-10`。
   - `claims`：父值只在创建子线程时通过 `childValue` 计算；默认实现返回同一引用；继承不是对已经存在的 worker
     线程的实时传播，也没有 Java 25 的构建器 opt-out API。

5. **`java25-scoped-value`**
   - 来源名称：Java SE 25 `ScopedValue` API；官方 URL：
     <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ScopedValue.html>。
   - 版本：Java 25；`sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-10`。
    - `claims`：`where(key, value).run/call` 在动态作用域内绑定值；作用域正常返回或抛异常后自动恢复为未绑定或
      先前值；绑定按线程区分；普通 `ExecutorService` 任务不会因提交发生在绑定作用域内就自动继承；共享跨线程的值仍需不可变或同步。

6. **`jep-506-scoped-values`**
   - 来源名称：OpenJDK JEP 506 Scoped Values；官方 URL：<https://openjdk.org/jeps/506>。
   - 版本：JDK 25；`sourceType: release-note`；`appliesTo: Java 25`；`verifiedAt: 2026-08-10`。
   - `claims`：Scoped Values 在 JDK 25 Closed/Delivered；目标是以有界、只写一次的方式在调用者、被调用者和子线程间
     共享不可变数据；JEP 506 不要求迁移或废弃既有 `ThreadLocal`，且不承诺普通线程池自动传播。

7. **`java25-executor-service`**
   - 来源名称：Java SE 25 `ExecutorService` API；官方 URL：
     <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ExecutorService.html>。
   - 版本：Java 25；`sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-10`。
   - `claims`：提交前动作 happens-before 任务动作，任务动作再 happens-before `Future.get()` 后动作；`shutdown()`
     不等待任务完成；`shutdownNow()` 只是 best-effort，通常依赖中断；Java 25 的 `close()` orderly shutdown 并等待终止。

8. **`java8-executor-service`**
   - 来源名称：Java SE 8 `ExecutorService` API；官方 URL：
     <https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ExecutorService.html>。
   - 版本：Java 8；`sourceType: api-doc`；`appliesTo: Java 8`；`verifiedAt: 2026-08-10`。
   - `claims`：提交、`Future.get()` 的 happens-before、`shutdown`、`shutdownNow` 和 `awaitTermination` 合同存在；
     Java 8 没有 `AutoCloseable` 形式的 `ExecutorService.close()`。

9. **`java25-thread-pool-executor`**
   - 来源名称：Java SE 25 `ThreadPoolExecutor` API；官方 URL：
     <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html>。
   - 版本：Java 25；`sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-10`。
   - `claims`：`beforeExecute` 可用于重新初始化 ThreadLocal；`afterExecute` 在任务完成后运行；`submit` 包装的
     `FutureTask` 会保存计算异常而不直接传给 `afterExecute`，需要读取 `Future`；线程池 worker 会复用，因此任务必须在
     自己的执行边界恢复或清理上下文。

10. **`java8-thread-pool-executor`**
    - 来源名称：Java SE 8 `ThreadPoolExecutor` API；官方 URL：
      <https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ThreadPoolExecutor.html>。
    - 版本：Java 8；`sourceType: api-doc`；`appliesTo: Java 8`；`verifiedAt: 2026-08-10`。
    - `claims`：核心线程、队列、最大线程和拒绝顺序与现代线的核心合同相同；`beforeExecute` 明确可用于重新初始化
      ThreadLocal；`afterExecute` 对 `submit` 的 Future 异常仍需额外 `get()`；没有 Java 25 `close()`。

11. **`spring7-request-context-holder`**
    - 来源名称：Spring Framework 7.0.8 `RequestContextHolder` Javadoc；官方 URL：
      <https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/context/request/RequestContextHolder.html>。
    - 版本：Spring Framework 7.0.8；`sourceType: official-reference`；`appliesTo: Spring Framework 7.0.8`；
      `verifiedAt: 2026-08-10`。
    - `claims`：请求属性绑定到当前线程；`getRequestAttributes()` 可返回 null，`currentRequestAttributes()` 无绑定时可抛
      `IllegalStateException`；`setRequestAttributes(attributes, true)` 使用 inheritable holder；`resetRequestAttributes()`
      清理当前线程；`DispatcherServlet` 默认已暴露请求。

12. **`spring5-request-context-holder`**
    - 来源名称：Spring Framework 5.2.15.RELEASE `RequestContextHolder` Javadoc；官方 URL：
      <https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/context/request/RequestContextHolder.html>。
    - 版本：Spring Framework 5.2.15.RELEASE；`sourceType: official-reference`；`appliesTo: Spring Framework 5.2.15.RELEASE`；
      `verifiedAt: 2026-08-10`。
    - `claims`：`set`、`get`、`current`、`reset` 与 inheritable 选项的核心合同已存在；默认 `setRequestAttributes` 不向
      子线程暴露；旧线没有 Java 25 的 ScopedValue 选择。

13. **`spring7-request-context-filter`**
    - 来源名称：Spring Framework 7.0.8 `RequestContextFilter` Javadoc；官方 URL：
      <https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/filter/RequestContextFilter.html>。
    - 版本：Spring Framework 7.0.8；`sourceType: official-reference`；`appliesTo: Spring Framework 7.0.8`；
      `verifiedAt: 2026-08-10`。
    - `claims`：默认 `threadContextInheritable=false`；设为 true 只适合请求期间创建且不复用的短命子线程；官方明确警告
      不要把继承用于可能按需创建 worker 的线程池；Filter 可为异步 dispatch 重新设置请求上下文。

14. **`spring5-request-context-filter`**
    - 来源名称：Spring Framework 5.2.15.RELEASE `RequestContextFilter` Javadoc；官方 URL：
      <https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/filter/RequestContextFilter.html>。
    - 版本：Spring Framework 5.2.15.RELEASE；`sourceType: official-reference`；`appliesTo: Spring Framework 5.2.15.RELEASE`；
      `verifiedAt: 2026-08-10`。
    - `claims`：旧线同样把 inheritable 默认设为 false，并明确警告线程池复用会暴露继承上下文；请求线程和异步 dispatch
      的边界不能替代任务自身清理。

15. **`spring7-task-decorator`**
    - 来源名称：Spring Framework 7.0.8 `TaskDecorator` Javadoc；官方 URL：
      <https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/core/task/TaskDecorator.html>。
    - 版本：Spring Framework 7.0.8；`sourceType: official-reference`；`appliesTo: Spring Framework 7.0.8`；
      `verifiedAt: 2026-08-10`。
    - `claims`：装饰器包裹的是实际执行 callback，未必是用户原始 `Runnable`；主要用途是任务调用前后设置执行上下文；
      对 Future-based 操作，装饰器看到的 wrapper 可能不直接传播异常，结果仍需读取 Future。

16. **`spring5-task-decorator`**
    - 来源名称：Spring Framework 5.2.15.RELEASE `TaskDecorator` Javadoc；官方 URL：
      <https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/core/task/TaskDecorator.html>。
    - 版本：Spring Framework 5.2.15.RELEASE；`sourceType: official-reference`；`appliesTo: Spring Framework 5.2.15.RELEASE`；
      `verifiedAt: 2026-08-10`。
    - `claims`：`TaskDecorator.decorate` 和实际 callback 包装合同已存在；旧线可用自定义 decorator 做显式上下文捕获、
      设置、恢复和清理，但框架不会替应用决定哪些上下文可传播。

17. **`spring7-context-propagating-task-decorator`**
    - 来源名称：Spring Framework 7.0.8 `ContextPropagatingTaskDecorator` Javadoc；官方 URL：
      <https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/core/task/support/ContextPropagatingTaskDecorator.html>。
    - 版本：Spring Framework 7.0.8；`sourceType: official-reference`；`appliesTo: Spring Framework 7.0.8`；
      `verifiedAt: 2026-08-10`。
    - `claims`：使用 Micrometer `ContextSnapshotFactory` 在跨线程执行时恢复日志或 observation context；只在任务确实切换
      线程时有意义，并有额外开销；该类不属于 Spring Framework 5.2.15.RELEASE API。

18. **`spring7-task-execution-reference`**
    - 来源名称：Spring Framework 任务执行与调度参考；官方 URL：
      <https://docs.spring.io/spring-framework/reference/integration/scheduling.html>。
    - 版本：Spring Framework 7.0.8 当前参考快照；`sourceType: official-reference`；`appliesTo: Spring Framework 7.0.8`；
      `verifiedAt: 2026-08-10`。
    - `claims`：`TaskExecutor` 实现可配置 `TaskDecorator`，装饰器应委托原任务并在前后执行自定义行为；
      `ThreadPoolTaskExecutor` 是容器托管的执行器映射，本课只使用其上下文恢复能力。

19. **`spring5-task-execution-reference`**
    - 来源名称：Spring Framework 5.2.15.RELEASE Integration Reference；官方 URL：
      <https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/integration.html#scheduling>。
    - 版本：Spring Framework 5.2.15.RELEASE；`sourceType: official-reference`；`appliesTo: Spring Framework 5.2.15.RELEASE`；
      `verifiedAt: 2026-08-10`。
    - `claims`：旧线仍有 Spring `TaskExecutor`、线程池队列与拒绝配置；上下文传播需显式 decorator 或参数传递；
      不能把 Spring 7 的 Micrometer context decorator 当成 Boot 2.3 内置合同。

## 关键合同与版本差异

1. **ThreadLocal 是线程隔离，不是任务隔离。** 一个 worker 执行多个任务时，线程副本会跨任务存活；任务边界必须
   `try/finally` 恢复之前值或 `remove()`。这是由 API 的“当前线程副本”和 `ThreadPoolExecutor` 的 worker 复用合同共同推导的
   工程规则，不是 `ThreadLocal` 自动清理承诺。
2. **InheritableThreadLocal 只在创建子线程时复制。** `childValue` 默认返回父引用；它不会把请求开始时的值实时同步到已存在
   的线程池 worker，也不会因为任务提交而重新复制。Spring 5.2.15 与 7.0.8 都明确禁止在可复用线程池上打开继承。
3. **ScopedValue 的生命周期由作用域控制。** Java 25 的 `where(...).run/call` 在作用域返回时自动解除绑定；普通
   `ExecutorService` 任务不会自动继承绑定，因此它不是“把任意 Executor 的上下文自动带过去”的 API。稳定主线不引入预览结构化并发。
4. **请求上下文与业务上下文分开。** `RequestContextHolder` 只能说明当前请求线程是否有 `RequestAttributes`；跨线程任务需要显式
   传递用户 ID、租户 ID、trace ID 等最小不可变值，或由 `TaskDecorator` 捕获/恢复/清理，不能把 Servlet request 对象本身当作通用任务上下文。
5. **恢复必须成对。** 装饰器或手写 wrapper 应先保存 worker 原值，再设置任务值，最后在 `finally` 恢复原值；原值不存在时使用
   `remove()`，不能无条件 `set(null)` 来冒充清理。
6. **清理责任属于执行任务的一方。** MVC `afterCompletion` 只能清理处理请求的线程；冻结项目审计明确异步线程必须自行清理。线程池关闭也不等于已经清掉每个 worker 的业务上下文。
7. **Java 25/8 的主要差异是 API 可用性，不是旧线自动安全。** 两条线都保留 ThreadLocal、InheritableThreadLocal、
   `TaskDecorator`、`beforeExecute`/`afterExecute` 和显式 `shutdown`；只有 Java 25 提供 ScopedValue 和 `ExecutorService.close()`，
   Spring 7.0.8 才提供 `ContextPropagatingTaskDecorator`。

## 冻结项目证据

以下 6 条只摘录 Phase 2 冻结矩阵与 Phase 1C 审计摘要，未读取项目源码。矩阵中的 4、6、85 是各来源计数，
代表文件会重叠，不能相加为独立文件数。

| sourceId | 冻结路径与稳定符号 | usage | 仅能支持的结论 |
| --- | --- | --- | --- |
| `JAVA-STDLIB-026` | `dzzz-app/src/main/java/com/tdh/bdzz/context/TableShardContext.java`；`com.tdh.bdzz.context.TableShardContext` | `observed` | 项目存在分表线程上下文读写场景；架构调用链只证明 set/get 与分表策略的静态连接，不证明实现适合复制。 |
| `JAVA-STDLIB-026` | `dzzz-app/src/main/java/com/tdh/bdzz/service/tsaiassistant/TsAiTraceContextHolder.java`；`com.tdh.bdzz.service.tsaiassistant.TsAiTraceContextHolder` | `observed` | 项目存在 trace 上下文 holder 候选；冻结矩阵没有证明其跨线程传播或清理完整性。 |
| `JAVA-STDLIB-026` | `dzzz-app/src/main/java/com/tdh/bdzz/config/Pdf2ImageComparablePriorityTaskPoolExecutor.java`；`com.tdh.bdzz.config.Pdf2ImageComparablePriorityTaskPoolExecutor` | `observed` | 项目存在自定义任务池与 ThreadLocal 相关场景；不能从类名推出任务结束后已清理上下文。 |
| `JAVA-ENGINEERING-017` | `dzzz-app/src/main/java/com/tdh/bdzz/context/WebAppContext.java`；`com.tdh.bdzz.context.WebAppContext` | `observed` | Phase 1C 统计到 81 个静态读取点，涉及请求、用户、法院或权限上下文；只证明使用面，不证明传播安全。 |
| `JAVA-ENGINEERING-017` | `dzzz-app/src/main/java/com/tdh/bdzz/shard/AjbsShardStrategy.java`；`com.tdh.bdzz.shard.AjbsShardStrategy` | `observed` | 冻结调用链证明分片策略读取 `TableShardContext` 参与表名生成；不能推导所有 SQL 路径都正确。 |
| `JAVA-RISK-032` | `dzzz-app/src/main/java/com/tdh/bdzz/aop/DzzzAspect.java`；`com.tdh.bdzz.aop.DzzzAspect` | `observed` | 冻结矩阵将其列为请求与 ThreadLocal 上下文风险的代表符号；只证明存在切面上下文使用面，不证明跨线程传播或清理完整。 |

清理责任的 `ThreadHandler` 修正记录属于相邻的 `JAVA-RISK-031` 审计来源；本课证据表不将其误标为
`JAVA-RISK-032`，正文只引用该摘要所确认的“请求线程清理不能代替异步任务清理”边界。

## 不能推出的结论

- 不能由一次 `ThreadLocal.set` 或项目存在 holder 就推出上下文会自动跨线程传播。
- 不能由 `InheritableThreadLocal` 的名称推出线程池任务安全；线程池 worker 可能早于请求创建并被后续请求复用。
- 不能把 Spring `RequestContextHolder` 的 inheritable 开关用于通用租户、权限或凭据传播；官方警告已覆盖线程池污染风险。
- 不能把 `afterCompletion`、executor `afterExecute` 或 executor shutdown 当成所有上下文已正确恢复的证明；恢复点必须包住每个任务调用。
- 不能把 Java 25 `ScopedValue` 用于任意第三方 executor、消息系统或远端请求的自动传播；普通 executor 仍需显式 carrier 或 decorator。
- 不能把 `ContextPropagatingTaskDecorator` 当成 Spring Boot 2.3/Framework 5.2 的内置 API，也不能据此假设所有自定义 ThreadLocal 都会被捕获。
- 不能把冻结项目的请求、用户、租户或 trace 字段值写入研究稿；项目证据只保留路径、符号和抽象边界。
- 不能从官方 Javadoc 推导普适内存、吞吐或泄漏数字；性能与保留风险必须通过受控 fixture、JFR 或 JMH 单独验证。

## 易错点取证与验证计划

每个易错点按“现象 -> 触发条件 -> 原因 -> 后果 -> 错误示例 -> 正确写法 -> 影响版本 -> 验证方式 -> 来源”组织。

1. **worker 串租户** -> 单 worker 先设置租户再执行下一任务 -> ThreadLocal 是线程副本且 worker 被复用 -> 第二任务看到前一租户 -> 任务只 `set` 不清理 -> `try/finally` 保存旧值并恢复或 `remove` -> Java 8/25 -> `/tmp` 两次串行任务断言第二次为空 -> `java25-thread-local`、`java25-thread-pool-executor`。
2. **把 inheritable 当提交传播** -> 请求线程先绑定再把任务提交到已有线程池 -> 继承只发生在线程创建 -> worker 得到旧值或无值 -> 认证/租户错配 -> 显式 carrier 或 decorator -> Java 8/25 -> 预热 worker 后再提交对照 -> `java25-inheritable-thread-local`、`spring7-request-context-filter`。
3. **请求线程清理代替异步清理** -> MVC `afterCompletion` 清掉父线程，异步任务仍持有上下文 -> 清理发生在不同线程 -> worker 污染后续任务 -> 只在拦截器清理 -> 任务自身 `finally` 清理 -> Java 8/25、Spring 5.2/7.0 -> 单 worker 复用验证 -> 冻结 `ThreadHandler` 证据、`java25-thread-pool-executor`。
4. **无条件 `set(null)`** -> worker 原本有自己的上下文 -> 直接写 null 丢失嵌套调用前值且可能触发错误初始化语义 -> 下一层任务看到错误状态 -> 任务结束 `set(null)` -> 保存旧值，旧值不存在时 `remove` -> Java 8/25 -> 嵌套 wrapper 恢复顺序断言 -> `java25-thread-local`。
5. **开启 Spring inheritable 访问线程池** -> `RequestContextFilter.setThreadContextInheritable(true)` 与按需建线程池组合 -> 新 worker 继承创建时请求，随后被复用 -> 请求属性泄漏到其他请求 -> 开启 true 作为通用方案 -> 保持 false，使用显式 decorator/参数 -> Spring 5.2.15/7.0.8 -> 官方警告对照 -> `spring7-request-context-filter`、`spring5-request-context-filter`。
6. **把 TaskDecorator 当异常处理器** -> 使用 `submit`，只观察装饰器或 `afterExecute` 的 Throwable -> Future wrapper 保存计算异常 -> 失败未被观测 -> 只在 decorator 中记录 -> 通过 Future.get 读取并处理，装饰器专注上下文 -> Java 8/25、Spring 5.2/7.0 -> `submit` 异常最小复现 -> `spring7-task-decorator`、`java25-thread-pool-executor`。
7. **把 ScopedValue 当任意线程池 ThreadLocal** -> 用 `where` 绑定后提交普通 Executor 任务 -> 普通任务不会自动继承绑定 -> worker 未绑定或设计不受控 -> 隐式假设自动传播 -> 显式 carrier/decorator -> Java 25 only -> 普通 executor 绑定状态对照 -> `java25-scoped-value`、`jep-506-scoped-values`。
8. **把 Spring 7 能力回填旧线** -> 在 Boot 2.3/Framework 5.2 代码中引用 `ContextPropagatingTaskDecorator` -> 类不属于旧线 API -> 编译或运行期失败 -> 直接复制现代示例 -> 自定义 `TaskDecorator` 或参数传递 -> Java 8/Spring 5.2.15 -> 版本化编译检查 -> `spring7-context-propagating-task-decorator`、`spring5-task-decorator`。

## 课程设计决策与反馈环合同

1. 正文顺序固定为：显式上下文 carrier 与边界 -> ThreadLocal 副本/初始化/`remove` -> worker 复用污染 fixture ->
   `finally` 保存与恢复 -> InheritableThreadLocal 的创建时复制限制 -> Spring 请求线程边界 -> `TaskDecorator` 捕获/恢复/清理 ->
   Java 25 ScopedValue 对照 -> Java 8 与 Spring Boot 2.3 兼容实现。
2. Java 25 正例使用不可变请求/用户/租户 carrier、`ThreadLocal` 的保存-恢复 wrapper、`ScopedValue.where(...).run` 和显式
   `TaskDecorator`。ScopedValue 只演示稳定的有界作用域与普通 executor 的不自动传播边界，不替代普通 executor 的 decorator。
3. Java 8 正例只使用共同 API；请求上下文默认不设 inheritable，跨线程只展示显式 carrier 或自定义 `TaskDecorator`，不调用
   ScopedValue、`ExecutorService.close()` 或 Spring 7 的 context decorator。
4. 负例至少覆盖：worker 串上下文、inheritable 污染池、缺失 `finally`、错误恢复旧值、Future 异常未读取和把 ScopedValue 当普通线程池传播。
5. 反馈环在 `/tmp` 创建最小 Java 25 与 Java 8 fixture，各自连续运行两次；断言同一 worker 的第二任务看不到第一任务的值，
   并验证异常路径也会清理。fixture 通过后删除并检查目录不存在，不写入仓库。
6. Spring 示例只验证 7.0.8 与 5.2.15 的版本差异和任务包装合同，不引入后续事件、调度、重试或消息编排。
7. 课程不把请求对象、Session、认证 token 或可变租户模型放入静态 ThreadLocal 示例；只使用脱敏的不可变 ID/trace 值。

## 研究 Gate 自检

- [x] 课程 ID、顺序 520、两个前置、3 个来源能力和冻结状态来自当前 Phase 2 矩阵。
- [x] 19 个官方直接 URL 已记录 URL、版本、`sourceType`、`appliesTo`、claims 和 `verifiedAt`；均返回 HTTP 200。
- [x] Java 25 与 Java 8 的 ThreadLocal、InheritableThreadLocal、ExecutorService、ThreadPoolExecutor 合同分开。
- [x] ScopedValue 仅按 Java 25 JEP 506/Oracle API 的已交付合同描述，未宣称普通线程池自动传播，也未把预览结构化并发放入稳定示例。
- [x] Spring Framework 7.0.8 与 5.2.15 的 RequestContextHolder、RequestContextFilter、TaskDecorator 差异已记录。
- [x] 冻结项目证据恰列 6 条，使用 `observed` 或 `corrected`，没有读取或运行 `dzzz-app` 源码。
- [x] 未读取或创建后续课程研究稿、正文、track、manifest 或 signoff；未改变矩阵状态。
- [x] 清理、异常观察和版本差异均给出可复跑验证边界；没有未经测量的性能结论。

## 发布结论与 Stop Boundary

本文件只完成 Java 高级第 3 门课程的官方资料研究。课程正文、临时反馈环、发布接线、页面证据、独立 signoff
与双轴复审均未执行；不得据此开始下一门高级课程。
