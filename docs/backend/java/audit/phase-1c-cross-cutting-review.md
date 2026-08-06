# `dzzz-app` Phase 1C 横切能力复核

> 批次：Phase 1C 第 6 批<br>
> 源码快照：`dzzz-app-20260803-179e722831ab`<br>
> 自动分析：`dzzz-app-analysis-20260803-958d37cf1be1`<br>
> 状态：已完成，40/40 个 Java 文件、1773/1773 LOC<br>
> 结构化事实源：[phase-1c-cross-cutting/manifest.json](./reviews/phase-1c-cross-cutting/manifest.json)<br>
> 人工签核：[phase-1c-cross-cutting-signoff.json](./reviews/phase-1c-cross-cutting-signoff.json)

## 1. 本批边界

本批领取冻结清单中的五个物理范围：

```text
dzzz-app/src/main/java/com/tdh/bdzz/annoation/**/*.java
dzzz-app/src/main/java/com/tdh/bdzz/aop/**/*.java
dzzz-app/src/main/java/com/tdh/bdzz/context/**/*.java
dzzz-app/src/main/java/com/tdh/bdzz/exception/**/*.java
dzzz-app/src/main/java/com/tdh/bdzz/validator/**/*.java
```

| 根目录       | 库存索引区间 | 文件数 |  LOC |
| ------------ | ------------ | -----: | ---: |
| `annoation`  | `2..15`      |     14 |  376 |
| `aop`        | `16..18`     |      3 |  281 |
| `context`    | `124..134`   |     11 |  390 |
| `exception`  | `1122..1125` |      4 |  294 |
| `validator`  | `2366..2373` |      8 |  432 |
| 合计         | 4 个区间     |     40 | 1773 |

`validator` 下 8 个文件与 `annoation/impl` 下 1 个实现共同构成项目私有校验链路，不能因目录名不含
`aop` 或 `context` 而排除。40 个文件恰好覆盖 Phase 1B 的全部 `cross-cutting` 机器候选，与前五批
2888 个已复核路径零重叠。

明确排除：

- `timer`、listener、handler、WebSocket 和其他第 7 批异步能力文件；
- cache、upload、storage、shard、util、enums、常量和测试文件；
- 能力矩阵、项目示例登记、拒绝模式登记和课程知识点正文；
- 对 `/Users/jian/Desktop/work/TDH/dzzz/dzzz-app` 的任何修改。

## 2. 复核方法

1. 先运行全量只读检查，确认 Phase 1A、Phase 1B 和前五批产物仍绑定同一冻结快照。
2. 按五个物理根目录领取 40 个文件，逐个核对源码哈希、LOC、声明、字段、公开方法、注解、框架
   信号和 CodeGraph 使用边。
3. 按真实职责区分注解合同、校验器、切面、切点、上下文访问器、事件、异常和校验结果模型，不用
   目录名代替最终角色。
4. 对注解目标与保留策略、反射参数合同、AOP 异常流、`ThreadLocal` 清理、静态上下文、事件可变性、
   HTTP 错误映射和自定义校验语义登记精确源码行号。
5. 把 40 条人工结论写入 1 个 JSONL 分片，并以独立签核文件的分片 SHA-256 绑定全部记录；只有
   签核状态和分母完整匹配时，生成器才写出 `reviewed`。
6. 用不导入生成器的独立校验器重新读取当前源码、Phase 1B 记录和前五批台账，复算物理范围、
   14 种职责形态、7 个角色纠正、使用出现次数、75 条风险类别及行号和全局状态。

风险项 `XC-0001` 至 `XC-0075` 是 Phase 2 归一化输入，不是 75 个已经定性的独立缺陷。同一模式
会合并为课程知识点或拒绝模式；没有运行态证据的行为保持为边界候选。

## 3. 当前状态叠加

Phase 1A 和 Phase 1B 继续保留生成时的历史状态。当前状态由前六批 Phase 1C 台账按唯一路径覆盖：

| 状态         | 主代码 | 测试 | 总数 |
| ------------ | -----: | ---: | ---: |
| `unreviewed` |    501 |    7 |  508 |
| `reviewing`  |      0 |    0 |    0 |
| `reviewed`   |   2928 |    0 | 2928 |
| `blocked`    |      0 |    0 |    0 |

累计人工复核为 2928/3436；Phase 1 Gate 尚未通过。

## 4. 职责形态与角色纠正

| `crossCuttingShape`          | 文件数 | 主要职责                         |
| ---------------------------- | -----: | -------------------------------- |
| `annotation-contract`        |     13 | 运行时自定义注解合同             |
| `annotation-validator`       |      6 | 项目私有注解校验器               |
| `application-context-bridge` |      1 | Spring 容器静态桥接              |
| `application-event`          |      6 | Spring 应用事件载体              |
| `application-event-publisher`|      1 | Spring 应用事件发布器            |
| `aspect`                     |      2 | Spring AOP 切面                  |
| `exception-type`             |      3 | 项目运行时异常类型               |
| `global-exception-handler`   |      1 | Spring MVC 全局异常处理器        |
| `pointcut-declaration`       |      1 | AspectJ 切点声明                 |
| `request-context-accessor`   |      1 | 当前请求和会话上下文访问器       |
| `startup-hook`               |      1 | Spring Boot 启动回调             |
| `thread-context-holder`      |      1 | 线程分片上下文持有者             |
| `validation-contract`        |      1 | 项目私有校验器接口               |
| `validation-result-model`    |      2 | 项目私有校验结果模型             |

Phase 1B 按物理目录把 40 个文件都标为 `cross-cutting`。本批确认其中 6 个应用事件和
`EventPublisher` 的最终语义角色是 `async-integration`，其余 33 个仍为 `cross-cutting`。

这个角色纠正只说明事件属于异步集成课程边界，不能证明监听器实际异步执行。Spring 事件是同步还是
异步取决于 `ApplicationEventMulticaster` 的执行器配置；仅看到 `publishEvent` 不足以下结论。

## 5. 注解与项目私有校验

13 个注解合同都使用运行时元数据描述方法、参数或字段行为。10 条风险候选指出 `@Inherited` 被
用于非类级目标；Java 的 `@Inherited` 只影响类级注解沿父类继承，对字段、方法和参数不起作用。
现代课程示例应先按实际读取位置选择最小 `@Target`，再决定是否需要运行时 `@Retention`，不能把
`@Inherited` 当成通用的注解传播机制。

项目私有 `Min`、`NotBlank`、`NotNull`、`Size`、`Valid` 和 `Constraint` 与标准校验名称重合，
形成 6 条导入碰撞候选。课程主线必须使用 Jakarta Validation 标准合同；项目私有实现只作为 legacy
补充，明确展示完整包名、调用入口、空值语义和错误消息差异。

6 个注解校验器和 1 个私有 `ConstraintValidator` 不能被当成标准 Bean Validation 实现教授。
独立复核确认：2 个实现对不支持的值类型可能直接通过，1 个实现假设值为对象数组或集合，错误模型
还可能在 `toString` 中输出原始输入。现代示例需要用标准扩展点、明确泛型和值类型，并用最少的
正向与负向用例固定 `null`、空值、错误类型和消息边界。

## 6. AOP、反射与横切异常流

`AppAspect`、`DzzzAspect` 和 `PointCuts` 提供切面、环绕通知和业务实现层切点。复核登记的关键边界：

- 1 个切点覆盖业务实现类的公开方法，新增方法可能自动进入横切行为；
- 1 个切面通过反射恢复参数与对象合同，代理类型、重载和构造要求需要单独验证；
- 2 处通知可能改变异常传播，一处捕获失败后返回 `null`，另一处重新包装异常；
- 1 个切面记录参数或返回对象，必须建立字段级去敏和大小限制；
- 以外部字符串 `intern()` 结果作为锁会扩大共享监视器和字符串池边界；
- 按调用方标识缓存限流器但没有回收策略，会形成无界基数候选；
- 上下文清理代码被注释，不能证明线程复用前一定完成清理。

课程示例应从代理边界、连接点、切点和 advice 顺序讲起。环绕通知必须原样返回成功结果，在失败时
保留 cause 并遵守稳定异常合同；不能以记录日志为由吞掉异常或输出未经筛选的参数。

## 7. 上下文与生命周期

`SpringContext`、`TableShardContext` 和 `WebAppContext` 的 CodeGraph 入站使用出现次数分别为 28、
143 和 704，说明它们是跨模块共享边界，而不是孤立工具类。

- `SpringContext` 保存静态可变的 `ApplicationContext` 并提供 service locator；现代示例优先构造器
  注入，静态桥接只作为框架边界的受限兼容方案。
- `TableShardContext` 使用 `ThreadLocal` 保存分表数据。值必须在设置它的同一调用边界内通过
  `finally` 清理；只提供可选 `clean` 方法不能证明线程池复用安全。实例化还应保留泛型参数。
- `WebAppContext` 静态读取当前请求、会话和用户，异步线程或无请求调用没有这个环境。无会话时
  返回空用户对象还会混淆“匿名”与“字段为空的已登录用户”。现代示例应显式传递所需上下文。
- `InitializeYjbjWord` 在启动回调中初始化外部组件，课程需要说明失败策略、幂等性和关闭责任。

## 8. 事件与异常边界

6 个事件和 1 个发布器形成发布边界；其中 4 个事件使用 Lombok `@Data` 暴露可变载荷。事件一旦
发布，监听者观察到的值不应再因 setter 调用变化。现代示例使用不可变事件载荷，并分别验证同步
默认行为和显式配置执行器后的异步行为。

3 个运行时异常和 `GloableExceptionHandler` 构成 Web 错误转换边界。全局处理器包含兜底
`Exception` 处理、直接返回消息以及未显式声明 HTTP 状态的候选。课程需要区分可预期业务错误与
系统错误，保留 cause，使用稳定错误码和协议化 HTTP 状态，并避免把内部异常文本直接暴露给客户端。

## 9. 风险候选汇总

| 类别                                   | 候选数 |
| -------------------------------------- | -----: |
| 历史拼写错误的包或公开合同             |     25 |
| 对非类级目标无效的 `@Inherited`        |     10 |
| 私有校验注解与标准名称碰撞             |      6 |
| 项目私有校验器合同                     |      6 |
| 可变 Spring 应用事件                   |      4 |
| 切面改变异常流                         |      2 |
| 静态可变上下文                         |      2 |
| 不支持的校验值类型直接通过             |      2 |
| 请求会话环境依赖                       |      1 |
| 匿名用户回退为空对象                   |      1 |
| 切面记录参数或结果                     |      1 |
| 全局异常兜底过宽                       |      1 |
| 业务切点范围过宽                       |      1 |
| 上下文清理被注释                       |      1 |
| 事件发布模式不能由本地代码确定         |      1 |
| 异常消息直接进入响应                   |      1 |
| 错误响应未表达 HTTP 状态               |      1 |
| 原始 `ThreadLocal` 类型                |      1 |
| 反射驱动参数合同                       |      1 |
| 启动期外部初始化                       |      1 |
| 静态 service locator                   |      1 |
| 字符串池对象作为监视器                 |      1 |
| `ThreadLocal` 清理义务                 |      1 |
| 无界限流器缓存                         |      1 |
| 校验错误输出原始值                     |      1 |
| 校验器假设数组或集合类型               |      1 |
| 合计                                   |     75 |

25 条历史拼写候选包括 `annoation` 等现有公开路径。为保持项目兼容，Phase 1 不修改源码；现代课程只用
正确拼写，并在 legacy 补充中说明现有名称。风险候选必须在 Phase 2 合并、取证和筛选后才能成为拒绝
模式或课程结论。

## 10. 后续课程约束

1. 先讲 Java 注解类型、元注解、反射和异常，再讲 Spring AOP、自定义校验和事件。
2. Jakarta Validation 是现代主线；项目私有同名注解与 Java 8 旧生态只放在版本明确的补充中。
3. AOP 示例必须固定代理入口、切点范围、返回值、异常 cause、日志去敏和 advice 顺序。
4. `ThreadLocal` 必须与线程池复用和 `try/finally` 清理一起讲；不能只演示 `set/get`。
5. 当前用户、租户或分片信息优先作为显式参数传递；环境上下文只用于边界明确的适配层。
6. Spring 事件先讲默认发布语义，再讲 multicaster 和执行器配置；发布器调用本身不等于异步。
7. 异常课程同时覆盖异常层级、cause、稳定错误码、HTTP 状态和响应去敏。
8. 项目片段只作为去敏、最小化并纠正后的 legacy 补充；正式知识点开始前仍按研究规范查询现代
   Java、Spring、Jakarta Validation 和 Servlet 官方资料。

## 11. 验证与 Stop Boundary

本批正向验证覆盖：

- 3436 个冻结 Java 文件和 7 个 Phase 1B 分片逐字节一致；
- 前五批保持 2888 个已复核路径，第 6 批与其零重叠；
- 第 6 批覆盖 4 个库存区间的 40 个 Java 文件、1773 LOC 和 1 个签核分片；
- 40 个类型声明、18 个字段、78 个显式公开方法与 Phase 1B 结构一致；
- 14 种职责形态、7 个角色纠正、2258 个入站和 38 个出站使用出现次数可独立复算；
- `XC-0001..XC-0075` 的类别、路径和行号由独立校验器读取源码复算；
- 前六批路径零重叠，累计状态为 `reviewed=2928`、`unreviewed=508`。

2026-08-04 的实施验证结果：

| 验证                                                     | 结果                                                                 |
| -------------------------------------------------------- | -------------------------------------------------------------------- |
| `npm --prefix docs/backend/java/audit/tooling run check` | 退出码 `0`；Phase 1A、Phase 1B 和前 6 批人工台账均为 `PASS`           |
| `npm --prefix docs/backend/java/audit/tooling audit --audit-level=low` | 退出码 `0`；`found 0 vulnerabilities`                    |
| 在两个全新空目录重建第 6 批并分别运行独立校验器          | 两次退出码均为 `0`，正式产物与两次重建彼此逐字节一致                 |
| 三份 manifest SHA-256                                    | 均为 `0221687875f938deddd371b4eaf3b2aaca7cbd1cecc0d645a4f7c6e14c0c5aff` |
| 三份 JSONL 分片 SHA-256                                  | 均为 `64984878f6d5551c15106848eeec048df49717b09e75eab1f4177d76c8b1f0fb` |
| 人工签核文件 SHA-256                                     | `55d3aa6b88803fb10d0303dbf6ab742c1d5fc5df57016dccedb5b6582a5390d4` |
| 篡改记录但不更新分片 SHA-256                             | 独立校验器退出码 `1`，按预期拒绝分片 SHA-256 不一致                  |
| 伪造事件 `finalRole` 并同步全部完整性哈希                | 独立校验器退出码 `1`，按源码职责拒绝最终角色不一致                   |
| 伪造风险类别并同步全部完整性哈希                         | 独立校验器退出码 `1`，按源码拒绝风险类别或行号不一致                 |
| 使用不存在的人工签核运行生成器                           | 生成器退出码 `1`，按预期拒绝缺失签核                                |
| 把人工签核状态改为 `tampered`                            | 独立校验器退出码 `1`，按预期拒绝非 `approved` 状态                   |
| `git -C /Users/jian/Desktop/work/TDH/dzzz status --short -- dzzz-app` | 无输出，目标模块保持 clean                               |

独立 Standards / Spec 初次双轴复审发现 3 个低严重度问题：两个嵌套具名回调缺少中文注释，自动
提取报告缺少第 6 批报告链接和工具树入口。三处均已按点名范围修复，并重跑语法、Prettier、第 6 批
定向检查和全量检查。最终结论为 Standards `PASS / 0 finding`、Spec `PASS / 0 finding`。

本阶段当前未执行：

- Phase 1C 第 7 批“异步能力”或其他后续批次；
- 能力矩阵、项目示例登记、拒绝模式登记和课程覆盖矩阵；
- 外部知识点研究、Java 课程正文、菜单或 Markdown adapter；
- `dzzz-app` 源码修改、暂存或任何代码提交。
