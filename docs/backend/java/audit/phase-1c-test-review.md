# `dzzz-app` Phase 1C 测试复核

> 批次：Phase 1C 第 10 批
> 源码快照：`dzzz-app-20260803-179e722831ab`
> 自动分析：`dzzz-app-analysis-20260803-958d37cf1be1`
> 状态：已完成，7/7 个 Java 文件、1840/1840 LOC
> 结构化事实源：[phase-1c-test/manifest.json](./reviews/phase-1c-test/manifest.json)
> 人工签核：[phase-1c-test-signoff.json](./reviews/phase-1c-test-signoff.json)

## 1. 本批边界

本批只领取冻结库存中 `src/test` 的连续索引 `3430..3436`：

| 文件 | LOC | `@Test` | 反馈环形态 |
| ---- | --: | ------: | ---------- |
| `TsFileSignNewDragServiceImplTest` | 711 | 9 | 服务状态、持久化协作与 PDF 回归 |
| `TsAiTranscriptDiffServiceTest` | 138 | 7 | 纯文本差分合同 |
| `TsLegalReasoningResultParserTest` | 71 | 4 | 结构化结果解析合同 |
| `TscwhModelConfigTest` | 102 | 5 | 配置映射合同 |
| `TscwhRuntimePromptServiceTest` | 31 | 1 | 运行态提示词合同 |
| `KeywordSignatureMergeTest` | 676 | 18 | PDF 与图片合成回归 |
| `PdfKeywordPositionUtilTest` | 111 | 2 | PDF 关键词坐标回归 |
| 合计 | 1840 | 46 | 7 种形态 |

7 个文件与前九批 3429 个主代码路径零重叠。明确排除：

- 对测试或生产源码的修复、重构和补测；
- 能力归一化、知识点筛选、项目示例和拒绝模式登记；
- Java 课程正文、菜单、Markdown adapter 和 Java 高亮；
- 其他 Maven 模块和 `/Users/jian/Desktop/work/TDH/dzzz` 的任何修改。

## 2. 复核方法

1. 运行全量只读检查，确认冻结库存、Phase 1B 与前九批台账没有漂移。
2. 逐文件核对源码 SHA-256、LOC、测试方法、断言、fixture、资源所有权和真实生产入口。
3. CodeGraph 对外部仓库源码的查询没有返回目标测试关系，因此正式证据回退到冻结路径、Phase 1B
   记录和目标源码；机器 outbound 误关联不写入真实覆盖结论。
4. 先生成 7 条 `reviewing` 候选；人工签核绑定候选分片 SHA-256 后，才生成 `reviewed` 完成态。
5. 独立 validator 不导入生成器，重新从库存、源码和独立职责目录推导测试数、断言、生产入口、
   风险行号、签核绑定、前九批零重叠和累计状态。

风险项 `TST-0001..TST-0020` 是 Phase 2 的归一化输入，不是 20 个已经定性的独立缺陷。候选按
“文件和类别”计数，同一类别中的多行只属于一条候选。

## 3. 当前状态叠加

Phase 1A 和 Phase 1B 保留生成时的历史状态。十批 Phase 1C 台账叠加后的当前状态是：

| 状态 | 主代码 | 测试 | 总数 |
| ---- | -----: | ---: | ---: |
| `unreviewed` | 0 | 0 | 0 |
| `reviewing` | 0 | 0 | 0 |
| `reviewed` | 3429 | 7 | 3436 |
| `blocked` | 0 | 0 | 0 |

Phase 1C 的逐文件人工复核已经完成，但 Gate 1 仍未通过：9.4 的能力归一化矩阵尚未建立。

## 4. 反馈环与真实入口

7 个文件共含 46 个测试方法和 148 次显式断言。全部使用 JUnit 4，其中 1 个文件使用 Mockito、
3 个文件使用反射测试访问、3 个文件使用 `TemporaryFolder`。人工确认 19 个文件级生产入口：

| 测试 | 真实入口 |
| ---- | -------- |
| `TsFileSignNewDragServiceImplTest` | `TsFileSignNewDragServiceImpl` 的 2 个公开方法、3 个私有方法，以及 `ConvertPdf.calculateLastPageKeywordSignPosition` |
| `TsAiTranscriptDiffServiceTest` | `TsAiTranscriptDiffService.buildInput` |
| `TsLegalReasoningResultParserTest` | `TsLegalReasoningResultParser.parseFinalContent` |
| `TscwhModelConfigTest` | `TscwhModelConfig.fromRecord`、私有 `TscwhServiceImpl.buildListVO` |
| `TscwhRuntimePromptServiceTest` | `TscwhRuntimePromptService.buildTestPrompt` |
| `KeywordSignatureMergeTest` | `ConvertPdf` 的 6 个公开或私有入口，以及私有 `TsblSjyServiceImpl.filterKeywordSignList` |
| `PdfKeywordPositionUtilTest` | `PdfKeywordPositionUtil.findLastPageKeywordPosition` |

这里的 19 是“每个测试文件声明的唯一入口数之和”，不是全应用的生产方法覆盖率；同一生产入口可在
多个测试方法中反复调用。

## 5. Fixture、资源与覆盖边界

4 个轻量合同测试只使用内存字符串、Map 或普通对象，适合讲解输入、行为和输出合同。两个大型测试
类组合了服务协作、状态流转、PDF、图片、反射和私有辅助方法；它们证明复杂业务回归可以用自造
fixture 复现，也说明单个测试类聚合过多反馈环会增加定位成本。

`TemporaryFolder` 为 3 个文件提供默认清理；`KeywordSignatureMergeTest` 还允许通过系统属性把产物
保留到外部目录进行人工检查。PDF 和图片用例依赖显式 `close`，现代课程应优先使用 JUnit Jupiter
`@TempDir` 和适用的 try-with-resources，并明确谁拥有产物、流和文档对象。

`TsFileSignNewDragServiceImplTest` 手工创建 mock、反射注入依赖并读写进程级缓存，虽然有 `@After`
清理，仍必须作为共享状态复位案例。反射访问的私有方法只能说明实现级回归，不等同于通过公开行为
seam 证明整个调用链。

46 个现有测试只证明台账中记录的合同。它们不能推出 Controller、事务、数据库、外部 HTTP、并发、
定时任务或应用整体已经充分测试，也不能作为课程示例无需另建反馈环的依据。

## 6. 风险候选汇总

| 类别 | 候选数 |
| ---- | -----: |
| JUnit 4 旧框架 | 7 |
| 私有实现或字段反射耦合 | 3 |
| 资源手工关闭 | 3 |
| 大型测试 fixture | 2 |
| `@Test(expected=...)` 宽泛异常边界 | 1 |
| PDF 产物断言粒度较粗 | 1 |
| 手工创建并反射注入 mock | 1 |
| 进程级共享状态 | 1 |
| 可选外部产物目录 | 1 |
| 合计 | 20 |

## 7. 后续课程约束

1. 现代测试课程优先使用 JUnit Jupiter，再补充项目 JUnit 4 的注解和迁移差异。
2. 临时目录使用 `@TempDir`，异常使用 `assertThrows` 并把抛出位置限制到最小可执行语句。
3. 优先通过公开行为 seam 验证合同；确需访问私有实现时，先判断是否暴露了职责过深或模块边界不清。
4. mock 只替换当前反馈环不拥有的协作者，依赖通过构造器或明确 fixture 注入，避免字符串字段名反射。
5. 文件、PDF 和图片测试必须明确输入自造、资源关闭、输出清理及确定性断言；视觉正确性不能只用
   “文件存在”和“页数正确”代替。
6. 全局缓存、静态注册表和系统属性必须在每个测试后复位，避免测试顺序依赖。
7. 现有 46 个测试只作为项目 legacy 反馈环补充；每个课程示例仍需独立的最小编译或测试闭环。

## 8. 验证与 Stop Boundary

当前正式完成态的稳定 SHA-256：

```text
phase-1c-test-signoff.json       a5f62dc8cf63811eb23274485a3a678de5347f2c2b2112b6d0726c63a222ccc5
manifest.json                    c5ff6f816b5c2cada981194d1e09ccddb70edb517853d50bd98b9e8936b60aac
records-0001-0007.jsonl          19c00528b2ba9a9092048ba0900f2490e8f127479ec3a5335aa16d6637270f19
reviewing candidate shard        485f923c5548272f47d8c00a1fcbc0f8e2c2875a5ef0f0744a6e7c91d5cc88ea
```

最终验证结果：

- 第 10 批生成器 `--check` 和独立 validator 均通过；独立 validator 从冻结库存、源码和职责目录
  重新推导 7 个文件、46 个测试方法、148 次断言、19 个生产入口和 20 个风险候选。
- 两个全新目录的完成态重建均与正式产物逐字节一致；未签核准备态保持
  `reviewed=3429`、`reviewing=7`，7 条候选记录均为 `reviewing`。
- 源码 SHA、测试数、生产入口、风险候选、审计状态、覆盖边界、累计状态和签核绑定篡改均被拒绝；
  在同步重算记录分片、reviewing 候选、签核与 manifest 哈希后，能力候选和风险说明篡改仍由
  独立内容合同拒绝。
- 全量 `npm --prefix docs/backend/java/audit/tooling run check` 通过，覆盖 3436 个冻结文件、7 个
  提取分片和十批复核台账；`npm audit --audit-level=low` 为 0 个漏洞。
- 定向 Prettier、tracked 与本批 untracked 文件的空白检查均通过；`dzzz-app` 限定路径状态为空。
- 独立复评结论为 Standards `PASS / 0 finding`、Spec `PASS / 0 finding`。

本机 `/usr/bin/java` 无法定位 Java Runtime，且没有 `mvn` 命令，因此没有执行生产仓库中的 46 个
JUnit 测试。上述 PASS 证明冻结源码、审计台账、生成器与 validator 的确定性和合同一致性，不代替
Maven/JUnit 运行结果。

本阶段明确不执行：

- 能力归一化、知识点筛选和阶段排序；
- 项目示例、拒绝模式、课程覆盖矩阵和正式 Java 课程；
- 菜单、Markdown adapter、Java 高亮或任何 `src/` 改动；
- `dzzz-app` 源码修改、暂存、提交或其他后续任务。

第 10 批完成并通过复评后，本轮停止。下一阶段只能从 Phase 1 的能力归一化开始；不能把
`reviewed=3436` 误写成 Gate 1 已通过。
