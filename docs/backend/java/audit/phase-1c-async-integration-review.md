# `dzzz-app` Phase 1C 异步能力复核

> 批次：Phase 1C 第 7 批<br>
> 源码快照：`dzzz-app-20260803-179e722831ab`<br>
> 自动分析：`dzzz-app-analysis-20260803-958d37cf1be1`<br>
> 状态：已完成，191/191 个 Java 文件、29485/29485 LOC<br>
> 结构化事实源：[phase-1c-async-integration/manifest.json](./reviews/phase-1c-async-integration/manifest.json)<br>
> 人工签核：[phase-1c-async-integration-signoff.json](./reviews/phase-1c-async-integration-signoff.json)

## 1. 本批边界

本批从冻结清单领取四个物理目录，并排除前六批已经复核的同目录文件：

```text
dzzz-app/src/main/java/com/tdh/bdzz/handler/**/*.java
dzzz-app/src/main/java/com/tdh/bdzz/listener/**/*.java
dzzz-app/src/main/java/com/tdh/bdzz/timer/**/*.java
dzzz-app/src/main/java/com/tdh/bdzz/ws/**/*.java
```

| 根目录    | 库存索引区间                                                 | 文件数 |   LOC |
| --------- | ------------------------------------------------------------ | -----: | ----: |
| `handler` | `1141..1143`、`1147..1167`                                  |     24 |  5763 |
| `listener`| `1168..1173`                                                  |      6 |   384 |
| `timer`   | `2102..2114`、`2124..2270`                                  |    160 | 22804 |
| `ws`      | `3423`                                                       |      1 |   534 |
| 合计      | 5 个连续库存区间                                             |    191 | 29485 |

明确排除：

- 第 2 批已复核的 `LoginHandler`、`StackHandler`、`ThreadHandler` 和 9 个
  `timer/controller` HTTP 适配器；
- 第 1 批已复核的 `config/websocket` 端点和配置；
- 第 3 批业务层中的 `@Async`、`CompletableFuture` 和裸线程；它们只保留为调用证据；
- 第 6 批的 6 个应用事件和 1 个发布器；
- 能力矩阵、项目示例、课程正文、菜单、Markdown adapter 和前端代码；
- 对 `/Users/jian/Desktop/work/TDH/dzzz/dzzz-app` 的任何修改。

191 个文件与前六批 2928 个已复核路径零重叠。Phase 1B 按目录把其中 190 个标为
`async-integration`，`ws/ReTransmissionService.java` 为 `unclassified`；这些都只是待复核机器候选。

## 2. 复核方法

1. 运行全量只读检查并确认库存、提取记录、前六批台账和当前源码仍绑定同一冻结快照。
2. 用前六批台账的唯一路径集合从四个物理目录扣除已领取文件，冻结 191 个路径、29485 LOC、
   库存索引和 SHA-256。
3. 逐文件读取当前源码，核对声明、字段、公开方法、注解、框架信号和限定在 `dzzz-app` 的
   CodeGraph 使用候选；CodeGraph 跨模块或同名误命中时回到精确路径和源码行验证。
4. 分别登记 `@Scheduled`、`@Async`、`@PostConstruct`、`ApplicationListener`、
   `CompletableFuture`、裸线程、阻塞等待和并发映射信号，不用目录或类名代替执行证据。
5. 按真实职责把模型、枚举、MyBatis TypeHandler 和刻录打印适配器纠正到对应语义角色。
6. 把 191 条结论写入 4 个 JSONL 分片，并由独立签核文件绑定全部分片 SHA-256。
7. 使用不导入生成器的 validator 重新读取库存、源码、Phase 1B 和前六批台账，独立复算物理
   范围、24 种职责形态、113 个角色纠正、执行信号、风险类别、精确行号和累计状态。

`AI-0001..AI-0264` 是 Phase 2 的归一化输入，不代表 264 个已定性的独立缺陷。重复模式将在
能力矩阵中合并；需要运行态或框架配置才能确认的行为继续保留为边界候选。

## 3. 当前状态叠加

Phase 1A 和 Phase 1B 保留自动提取时的历史状态。当前状态由前七批 Phase 1C 台账按唯一路径覆盖：

| 状态         | 主代码 | 测试 | 总数 |
| ------------ | -----: | ---: | ---: |
| `unreviewed` |    310 |    7 |  317 |
| `reviewing`  |      0 |    0 |    0 |
| `reviewed`   |   3119 |    0 | 3119 |
| `blocked`    |      0 |    0 |    0 |

累计人工复核为 3119/3436；Phase 1 Gate 尚未通过。

## 4. 职责形态与角色纠正

| 职责组                       | 文件数 | 最终角色             | 说明                                   |
| ---------------------------- | -----: | -------------------- | -------------------------------------- |
| 应用事件监听器               |      6 | `async-integration`  | 默认同步；2 个显式提交 Future          |
| 任务触发器和定时任务         |     13 | `async-integration`  | 只有 2 个文件存在 `@Scheduled`         |
| 清理合同和处理器             |     10 | `async-integration`  | 6 个文件存在 `@Async`                  |
| 数据同步链、合同和处理器     |     13 | `async-integration`  | 责任链、外部调用和同步步骤             |
| 文件处理合同、工厂和处理器   |      6 | `async-integration`  | 文件、事务和策略边界                   |
| 任务领域服务                 |     13 | `async-integration`  | 1 个文件存在 `@Async`                  |
| 数据上报合同、工厂和适配器   |      6 | `async-integration`  | 可由监听器或任务调用                   |
| 语音转写合同、工厂和适配器   |     12 | `async-integration`  | 外部连接和流式会话边界                 |
| 数据重传端点                 |      1 | `async-integration`  | 显式 Executor 的 CompletableFuture     |
| 任务 `bo`、`dto`、`eo`       |    102 | `data-model`         | 目录误判，不拥有线程或调度生命周期     |
| 任务枚举                     |      4 | `common`             | 有限状态和外部编码映射                 |
| MyBatis TypeHandler          |      3 | `data-access`        | JDBC 与枚举/JSON 的持久化转换          |
| 刻录打印合同、工厂和适配器   |      3 | `infrastructure`     | 外部设备和任务状态映射                 |
| 合计                         |    191 | 5 种最终角色         | 24 种结构化 `asyncShape`               |

最终角色为 `async-integration=79`、`data-model=102`、`common=4`、`data-access=3`、
`infrastructure=3`。相对机器候选共有 113 个角色纠正，其中包含把唯一 `unclassified` 的
`ReTransmissionService` 纠正为 `async-integration`。

## 5. 真实执行模式

### 5.1 Spring 调度与异步代理

源码中只有 `ZjqdFileOperateTask` 和 `CheckCameraTask` 两个文件存在 `@Scheduled`。其他名称包含
`Task` 的组件只是可被外部调度、Controller 或其他服务调用的入口，不能仅凭命名宣称周期执行。

8 个文件存在 `@Async`：`JzDataSyncTask`、`TslxDataSyncService` 和 6 个清理处理器；
`DealBusinessDataHandler` 内有 4 个异步方法。所有异步注解都指定了具名 Executor。课程必须说明：

- 只有经过 Spring 代理的外部调用才触发异步拦截，同类自调用不会自动切换线程；
- 事务和请求/线程上下文不会自动跨线程传播；
- `void` 异步方法不能通过返回值向调用方传播失败；
- 执行器容量、队列、拒绝、关闭和异常观察必须作为同一个合同讲解。

### 5.2 事件与 CompletableFuture

6 个 listener 都实现 Spring `ApplicationListener`。其中 4 个没有另行调度，默认在事件发布线程
同步执行；`DataReportListener` 和 `ZnfzNoticeListener` 分别把工作提交到具名线程池，并设置完成
阶段异常处理。`ReTransmissionService` 使用 `supplyAsync(..., hxDataReportExecutor)` 后继续反馈，
但没有完成阶段失败处理候选。

三个 Future 都显式指定 Executor，本批没有使用公共 `ForkJoinPool` 的证据。课程不能把
`ApplicationListener`、`publishEvent` 或 `CompletableFuture` 名称本身等同于可靠异步消息；必须
分别验证执行器、返回时机、失败观察、上下文清理和进程退出行为。

### 5.3 裸线程、阻塞和生命周期

`TslxDataSyncTask`、`TslxDataSyncService` 和 `DealBusinessDataHandler` 三个文件直接创建裸线程；
6 个文件使用 `Thread.sleep`。这些写法绕过或占用受管执行器，现代示例必须改为有界线程池、可取消
调度或明确的重试策略，并用可观察结果验证容量和失败。

`HyJzDataSyncHandler` 和 `HyKtpqDataSyncService` 在 `@PostConstruct` 执行初始化。Bean 创建期外部
工作必须有超时、幂等和失败策略；不能让无法控制的网络等待隐式进入应用启动关键路径。

## 6. 模型、注册表和外部集成

`timer` 下的 4 个 `bo`、35 个 `dto` 和 63 个 `eo` 只承载任务或外部交换数据，因此全部纠正为
`data-model`。其中 101 个使用 Lombok `@Data`，跨线程传递可变模型时需要在提交任务前构造完成，
并避免提交后继续修改；19 个文件含身份、令牌或密钥类字段候选，禁止整体记录或回显。

4 个 handler factory 和 `HmBurnPrintHandler` 实际创建 `ConcurrentHashMap`，共 5 个文件；
`JzDataSyncHandlerChain` 只有未使用的 import，不计为并发映射信号。并发映射只保证单次 Map 操作的
线程安全，不替代重复键、未知键、初始化完成和变更时机合同。`JtVoice2TextHandler` 还保存一个普通
可变 Map，是单例适配器中的共享状态候选。

3 个根目录 handler 实际是 MyBatis TypeHandler；其中旧 Fastjson 转换只作为 legacy 兼容证据，
不能进入现代推荐示例。3 个刻录打印文件属于外部设备基础设施，也不能因类名包含 Handler 就归入
异步执行课程。

## 7. 风险候选汇总

| 类别                                      | 候选数 |
| ----------------------------------------- | -----: |
| 可变任务模型                              |    101 |
| 字段注入                                  |     67 |
| 宽泛捕获 `Exception`/`Throwable`          |     42 |
| 敏感模型字段                              |     19 |
| 工作线程阻塞等待                          |      6 |
| 历史拼写错误合同                          |      4 |
| 可变处理器注册表                          |      4 |
| 静态可变状态                              |      4 |
| 异步与事务代理边界                        |      3 |
| 裸线程                                    |      3 |
| 局部启用 Spring Scheduling                |      2 |
| `@PostConstruct` 外部初始化               |      2 |
| 同步 ApplicationListener                  |      4 |
| 旧 Fastjson 持久化                        |      1 |
| 单例适配器共享会话状态                    |      1 |
| Future 完成失败未观察                     |      1 |
| 合计                                      |    264 |

风险项只是后续研究和课程筛选输入。现代课程先讲 JDK Executor、Future、并发可见性和资源生命周期，
再讲 Spring Scheduling、`@Async`、事件和任务编排；项目旧写法只放入纠正后的 legacy 补充。

## 8. 后续课程约束

1. 线程、任务、Executor、Future 和线程安全必须先于 Spring `@Async` 与 `@Scheduled`。
2. 每个异步示例必须同时说明执行器、返回时机、异常观察、上下文、取消和关闭责任。
3. Spring 事件先讲默认同步语义，再讲显式异步配置；包名和事件发布不作为异步证据。
4. 调度示例使用集中配置和明确 cron/时区，不在业务任务类分散 `@EnableScheduling`。
5. 禁止把裸线程、阻塞 sleep、未观察 Future、共享可变模型或字段注入写入推荐示例。
6. 并发集合要与复合操作、键生命周期和容量一起讲，不能简化为“换成 ConcurrentHashMap 即安全”。
7. `@PostConstruct` 只做快速、确定的本地初始化；外部协作需要独立生命周期和失败策略。
8. TypeHandler、刻录打印和 102 个模型按真实角色进入相应课程，不为保持目录结构而归入异步课。
9. 正式知识点开始前仍按研究来源规范查询当前 JDK、Spring Framework 和 Spring Boot 官方资料，
   再补充项目 Java 8 / Spring Boot 2.3.12 的兼容差异。

## 9. 验证与 Stop Boundary

本批定向正向验证已覆盖：

- 191 个路径、29485 LOC、5 个库存区间和 4 个签核分片；
- 198 个类型声明、1758 个字段、412 个显式公开方法；
- 24 种职责形态、113 个角色纠正、2823 个入站和 7953 个出站使用出现次数；
- `AI-0001..AI-0264` 的类别、路径和行号由独立 validator 读取源码复算；
- 前七批零路径重叠，累计 `reviewed=3119`、`unreviewed=317`。

阶段收尾验证命令：

```bash
npx prettier --check \
  docs/backend/java/audit/dzzz-app-file-inventory.md \
  docs/backend/java/audit/dzzz-app-source-analysis.md \
  docs/backend/java/dzzz-app-course-plan.md \
  docs/backend/java/audit/phase-1c-async-integration-review.md \
  docs/backend/java/audit/tooling/build-async-integration-review.mjs \
  docs/backend/java/audit/tooling/async-integration-review-ledger-validator.mjs \
  docs/backend/java/audit/tooling/package.json \
  docs/backend/java/audit/reviews/phase-1c-async-integration-signoff.json \
  docs/backend/java/audit/reviews/phase-1c-async-integration/manifest.json
npm --prefix docs/backend/java/audit/tooling run check
npm --prefix docs/backend/java/audit/tooling audit --audit-level=low
```

结果均为 PASS：Prettier 覆盖本批 Markdown、MJS 和 JSON；全量检查重新解析 3436 个冻结 Java
文件并校验前七批台账，最终退出码为 0；依赖审计为 0 个已知漏洞。

独立双轴复审结论为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。复审确认两份工具脚本
均满足具名方法中文注释和文件规模约束；签核前 `reviewing`、签核后 `reviewed` 的状态转换合同、
当前源码语义复算、确定性重建、负向篡改拒绝及第 8 批未开始的边界均成立。

`--prepare` 还单独验证了签核前状态：manifest 为 `review-candidate`，191 条分片记录均为
`reviewing`，累计状态为 `reviewed=2928`、`reviewing=191`。人工签核绑定这些候选分片的哈希；
签核通过后，生成器才把完成态记录晋升为 `reviewed`。

确定性验证在两个独立临时目录分别运行生成器和独立 validator，并把每个结果与正式目录逐字节
比较。两次重建的完成态 manifest 和 4 个 `reviewed` 分片均一致：

```text
manifest.json              ebba0ec4fad49aacff623b8a395183574bed7856b181b35ad8af326fa4c12fc6
records-0001-0050.jsonl    68c8ebbad5c28956e8dc36c852a72e01a9782717690b24741e87fda0ded019c7
records-0051-0100.jsonl    bb0da1f574108b15a0fc4884ef69864eb8629abc8c32368ba32e58552bbd35c9
records-0101-0150.jsonl    b21f661c0a43813b5dbed1b14f4fd2fd581d12d6f12e79cadcc360050956ce87
records-0151-0191.jsonl    f7fa02f751b9416781c0a898809c04bf32dafcd021f8e96d004df3074081d0b0
```

人工签核绑定的 4 个 `reviewing` 候选分片 SHA-256 为：

```text
records-0001-0050.jsonl    f7d6ad4572cc6f5b3c6bf275e66fe371364d84ab772cbc982c75998cbd967674
records-0051-0100.jsonl    0959473164e5bc5c293e31a955ab7bd3f697448d60a02d84ab917d757f7c59de
records-0101-0150.jsonl    fd2eb388ac1f8a91e57fe58916b3da2b06ed5f2b8619bab4a9b2701d472fbe6a
records-0151-0191.jsonl    e8844567001c710b334740a8b5bda63a7d1d11cec1be489dfcb256a6bef80ded
```

独立 validator 还拒绝了 5 个临时负向样本：未同步哈希的分片内容篡改、同步全部完整性哈希后的
`finalRole` 篡改、同步全部完整性哈希后的风险类别篡改、缺失人工签核，以及签核状态不是
`approved`。语义篡改同步覆盖完成态分片、候选签核和签核文件哈希，仍分别在最终角色和风险语义
边界被拒绝；其他失败落在分片哈希、签核存在性和签核批准状态边界。

本阶段明确不执行：

- Phase 1C 第 8 批“基础设施”或其他后续批次；
- 能力矩阵、项目示例、拒绝模式和课程覆盖矩阵；
- 外部知识点研究、Java 课程正文、菜单或 Markdown adapter；
- `dzzz-app` 源码修改、暂存或任何代码提交。

下一阶段只能从 Phase 1C 第 8 批“基础设施”开始，并继续使用当前 snapshot ID；若目标源码哈希、
库存或前七批台账发生变化，必须先处理漂移，不能直接进入后续批次。
