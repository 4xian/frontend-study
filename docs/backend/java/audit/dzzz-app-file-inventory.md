# `dzzz-app` Java 文件审计清单

> 版本：v1.0<br>
> 快照 ID：`dzzz-app-20260803-179e722831ab`<br>
> 生成时间：2026-08-03T19:49:18+08:00<br>
> 状态：Phase 1A 快照已冻结，Phase 1C 十批及 Phase 1D 五批已完成，Gate 1 已通过
> 实施计划：[`dzzz-app-course-plan.md`](../dzzz-app-course-plan.md)<br>
> 身份事实源：[`dzzz-app-file-inventory.json`](./dzzz-app-file-inventory.json)<br>
> 自动提取报告：[`dzzz-app-source-analysis.md`](./dzzz-app-source-analysis.md)
> 当前复核台账：[`phase-1c-startup-config-review.md`](./phase-1c-startup-config-review.md)、
> [`phase-1c-web-entry-review.md`](./phase-1c-web-entry-review.md)、
> [`phase-1c-business-layer-review.md`](./phase-1c-business-layer-review.md)、
> [`phase-1c-data-access-review.md`](./phase-1c-data-access-review.md)、
> [`phase-1c-data-model-review.md`](./phase-1c-data-model-review.md)、
> [`phase-1c-cross-cutting-review.md`](./phase-1c-cross-cutting-review.md)、
> [`phase-1c-async-integration-review.md`](./phase-1c-async-integration-review.md)、
> [`phase-1c-infrastructure-review.md`](./phase-1c-infrastructure-review.md)、
> [`phase-1c-common-code-review.md`](./phase-1c-common-code-review.md)、
> [`phase-1c-test-review.md`](./phase-1c-test-review.md)
> 当前能力矩阵：[`java-language-capability-matrix.md`](./java-language-capability-matrix.md)、
> [`java-standard-library-capability-matrix.md`](./java-standard-library-capability-matrix.md)、
> [`java-framework-capability-matrix.md`](./java-framework-capability-matrix.md)、
> [`java-engineering-pattern-capability-matrix.md`](./java-engineering-pattern-capability-matrix.md)、
> [`java-review-risk-matrix.md`](./java-review-risk-matrix.md)

## 1. 目的

本文件冻结 `dzzz-app` Java 课程审计的首个输入快照。它只回答“本次审计包含哪些文件”和“这些
文件在冻结时是什么内容”，不代表已经理解、分类或认可任何项目写法。

逐文件的完整机器记录保存在 JSON 中，Markdown 只保留范围、统计、生成规则和验证结论，避免人工
维护 3436 行清单造成漂移。

Phase 1B 的 package、import、声明、注解、语法信号、框架信号、角色候选和 CodeGraph 关系候选
保存在独立的自动提取分片中。身份清单不混入这些会被人工复核修正的数据，详情见
[`dzzz-app-source-analysis.md`](./dzzz-app-source-analysis.md)。

## 2. 范围

纳入：

```text
dzzz-app/src/main/java/**/*.java
dzzz-app/src/test/**/*.java
```

明确排除：

- `dzzz-quartz`；
- `dzzz-net`；
- `dzzzLicenseTool`；
- 其他 Maven 模块；
- `target`、生成产物和非 Java 文件。

根 `pom.xml`、`dzzz-parent/pom.xml` 和 `dzzz-app/pom.xml` 只作为构建基线证据记录哈希，不计入
Java 文件分母。

## 3. Git 快照

| 项目                        | 冻结值                                                             |
| --------------------------- | ------------------------------------------------------------------ |
| 仓库                        | `/Users/jian/Desktop/work/TDH/dzzz`                                |
| 分支                        | `master`                                                           |
| HEAD                        | `167ca8aa91ca3a6b101246964ef4fddec3d21da0`                         |
| HEAD 时间                   | `2026-08-03T17:03:07+08:00`                                        |
| 内容基线                    | 当前工作树的实际文件内容                                           |
| 仓库整体状态                | dirty：1 个 unstaged、2 个 untracked、0 个冲突                     |
| `dzzz-app` 状态             | clean：0 个 staged、unstaged、untracked 或冲突                     |
| 仓库状态摘要 SHA-256        | `679d62d0805ff9d1b0597967a86f3e10dc8a16ddc6d1a4670df9eee5b22ad34e` |
| `dzzz-app` 状态摘要 SHA-256 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |

仓库整体的 3 个变更位于 `dzzz-app` 之外。本清单没有读取或改写这些变更，也没有把它们计入课程
范围。即使目标模块当前为 clean，仍以逐文件内容哈希作为后续审计身份，不只依赖 HEAD。

## 4. Java 文件分母

| Source set      | 文件数 |    LOC |   字节数 | 初始状态     |
| --------------- | -----: | -----: | -------: | ------------ |
| `src/main/java` |   3429 | 355728 | 13075546 | `unreviewed` |
| `src/test`      |      7 |   1840 |    93387 | `unreviewed` |
| 合计            |   3436 | 357568 | 13168933 | `unreviewed` |

这里的 LOC 使用文件中的 LF 字节数，与本次 `wc -l` 结果一致。它用于冻结统计，不代表有效代码行
或复杂度。

冻结清单中的初始审计状态分布：

| 状态         | 文件数 |
| ------------ | -----: |
| `unreviewed` |   3436 |
| `reviewing`  |      0 |
| `reviewed`   |      0 |
| `blocked`    |      0 |

Phase 1A JSON 保持不可改写，表中状态表示冻结时基线。当前状态由已完成的 Phase 1C 复核台账叠加
计算：`unreviewed=0`、`reviewing=0`、`reviewed=3436`、`blocked=0`。Phase 1D 五批已把
906/906 个原始输入归一化为 15 个语言能力、33 个标准库能力、34 个框架与第三方库能力、38 个
工程模式能力和 47 个规范风险模式；Phase 1 Gate 已通过。

## 5. 构建基线

| 项目                      | 冻结值                        | 证据                                               |
| ------------------------- | ----------------------------- | -------------------------------------------------- |
| Java 预期基线             | Java 8                        | 同级 parent 配置与 Spring Boot 2.3.12 官方系统要求 |
| Spring Boot 预期基线      | `2.3.12.RELEASE`              | 同级 `dzzz-parent/pom.xml` 的 parent               |
| Spring Framework 预期基线 | `5.2.15.RELEASE`              | Spring Boot 2.3.12 官方依赖版本                    |
| 打包                      | WAR                           | `dzzz-app/pom.xml`                                 |
| 启动类                    | `com.tdh.DzzzAreaApplication` | `start-class` 与源码入口                           |

构建文件身份：

| 文件                  | 字节数 | SHA-256                                                            |
| --------------------- | -----: | ------------------------------------------------------------------ |
| `pom.xml`             |    732 | `8df05baea8e007129e23aed6b77ccac887e511554b528071ff913b5c7acd6123` |
| `dzzz-parent/pom.xml` |   7004 | `42684a9a3008a1f38bc66c42b8c0240b8064755b97c3f2a0a164463f466e0bfd` |
| `dzzz-app/pom.xml`    |  53452 | `737fd4dfa0c1a2554c53c20260deb64f7f210b824bbf637648e3be877a78ac15` |

官方版本证据：

- [Spring Boot 2.3.12 系统要求](https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements)
- [Spring Boot 2.3.12 依赖版本](https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/appendix-dependency-versions.html)

`dzzz-app` 声明的 parent 为 `com.tdh:dzzz-parent:2.1.0`，并使用空 `relativePath` 禁止 Maven
自动读取同级 parent。本机既没有可执行的 Java Runtime 和 `mvn`，也没有本地安装的对应 parent
POM，因此本批无法生成 `effective-pom`。表中的 Java、Spring Boot 和 Spring Framework 是由同级
parent 与官方归档交叉得到的预期仓库基线，不是当前机器已经解析或编译确认的结果。

这个环境边界不影响文件哈希冻结；进入依赖解析或编译验证批次前，必须先补齐对应工具链和可解析的
parent，再确认 effective model。

## 6. 机器清单合同

JSON 顶层记录：

- `snapshotId`、生成时间和时区；
- 纳入与排除范围；
- Git 分支、提交和工作树摘要；
- 构建版本与 POM 哈希；
- 主代码、测试和审计状态统计；
- 规范化 source manifest 的 SHA-256；
- 按路径排序的 `files` 数组。

每个 Java 文件记录：

```text
index
path
sourceSet
relativeDirectory
sizeBytes
loc
sha256
auditStatus
```

当前 JSON 文件 SHA-256：

```text
e90677ac25b4254d367c66c4642763c84c44128d42b2591e5022815ea6b901a4
```

规范化 source manifest SHA-256：

```text
179e722831ab66d55208618ba1db959c431505ec6b32ab492fb9232916ba60e1
```

## 7. 生成规则

1. 从两个纳入目录递归选择物理存在的 `.java` 普通文件。
2. 路径统一为以 `dzzz-app/` 开头、使用 `/` 分隔的仓库相对路径。
3. 按路径的字节序升序排列，再从 1 连续编号。
4. `sizeBytes` 使用原始文件字节数；`loc` 统计 LF 字节；`sha256` 对原始字节计算。
5. 所有新记录初始化为 `unreviewed`。
6. source manifest 每行依次连接 `path`、`sourceSet`、`sizeBytes`、`loc`、`sha256`，字段
   使用 Tab，记录使用 LF；不包含后续会变化的 `auditStatus`。
7. `snapshotId` 使用日期和 source manifest SHA-256 的前 12 位组成。
8. 生成时重新读取 Git 状态和三个 POM，不能复用旧统计。

任何纳入文件的路径、source set、内容、大小、LOC 或分母改变，都必须生成新的 snapshot ID。
`auditStatus` 可以在同一源码快照下从 `unreviewed` 迁移，但不同源码快照的审计状态不得混用。

## 8. Phase 1A 验证

- [x] `rg --files --hidden --no-ignore` 与物理文件遍历都得到 3429 个主代码文件和 7 个测试文件。
- [x] JSON 中恰好有 3436 个连续、唯一的文件记录。
- [x] 主代码和测试路径分别位于声明的 source set。
- [x] 每个文件都有 64 位 SHA-256、非负字节数、LOC 和 `unreviewed` 状态。
- [x] 重新聚合的文件数、LOC、字节数和状态数与顶层摘要一致。
- [x] 重新计算的规范化 source manifest SHA-256 与快照 ID 一致。
- [x] 非 `dzzz-app/` 记录数为 0。
- [x] 三个构建 POM 的大小与 SHA-256 已冻结。
- [x] `dzzz-app` 工作树在冻结时为 clean，仓库外部 dirty 状态已单独记录。

## 9. Phase 1C 衔接状态

Phase 1A 的身份文件保持不变。Phase 1B 已在同一 snapshot ID 上完成全量自动提取，分析 ID 为：

```text
dzzz-app-analysis-20260803-958d37cf1be1
```

对应分片内容 SHA-256 为
`958d37cf1be19e43bd5ef4c088d4f3c2c9fad18b3188b3df8aa38a4438c736f6`，机器 manifest SHA-256 为
`6fbab2cd2b60a78481f8d6302ef28c25b2463cfabb13b7666593078b40bbc22c`。

自动结果没有改变冻结时的审计状态。Phase 1C 十批随后在同一快照上完成人工逐文件复核：

- 批次分母：34 个 Java 文件、3949 LOC；
- 人工状态：34 个 `reviewed`、0 个 `blocked`；
- 当前全局状态：34 个 `reviewed`、3402 个 `unreviewed`；
- 角色纠正：9 个机器目录候选被改为源码语义角色；
- 风险候选：86 个，只进入复核台账，尚未形成拒绝模式或课程结论。

第 2 批 Web 入口：

- 批次分母：150 个 Java 文件、29713 LOC；
- 人工状态：150 个 `reviewed`、0 个 `blocked`；
- 当前全局状态：184 个 `reviewed`、3252 个 `unreviewed`；
- 角色纠正：5 个 Filter 配置和 3 个 MVC Interceptor 被改为源码语义角色；
- 风险候选：490 个文件级类别证据，尚未归一化为独立缺陷、拒绝模式或课程结论。

第 3 批业务层：

- 批次分母：338 个 Java 文件、154161 LOC；
- 人工状态：338 个 `reviewed`、0 个 `blocked`；
- 当前全局状态：522 个 `reviewed`、2914 个 `unreviewed`；
- 服务形态：148 个接口合同、182 个 Spring 托管类、8 个普通支持类；
- 风险候选：715 个文件级类别证据，尚未归一化为独立缺陷、拒绝模式或课程结论。

第 4 批数据访问：

- 批次分母：712 个 Java 文件、38330 LOC，另核对 14 份 Mapper XML、373 LOC；
- 人工状态：712 个 `reviewed`、0 个 `blocked`；
- 当前全局状态：1234 个 `reviewed`、2202 个 `unreviewed`；
- 形态纠正：128 个持久化模型，450 个目录误分类的数据模型，另确认 132 个 Mapper 接口和 2 个
  托管持久化服务；
- 风险候选：70 个 Java/XML 类别证据，尚未归一化为独立缺陷、拒绝模式或课程结论。

第 5 批数据模型：

- 批次分母：1654 个 Java 文件、58427 LOC；
- 人工状态：1654 个 `reviewed`、0 个 `blocked`；
- 当前全局状态：2888 个 `reviewed`、548 个 `unreviewed`；
- 模型形态：区分业务传输、外部合同、查询条件、请求输入、资源包装、响应封装、响应视图和通用传输；
- 风险候选：928 个文件级类别证据，尚未归一化为独立缺陷、拒绝模式或课程结论。

第 6 批横切能力：

- 批次分母：40 个 Java 文件、1773 LOC；
- 人工状态：40 个 `reviewed`、0 个 `blocked`；
- 当前全局状态：2928 个 `reviewed`、508 个 `unreviewed`；
- 职责形态：区分 13 个注解合同、6 个注解校验器、2 个切面、1 个切点、7 个事件边界和其他
  上下文、异常、启动与校验模型；
- 角色纠正：6 个应用事件和 1 个发布器改为 `async-integration`，但是否异步仍取决于 multicaster；
- 风险候选：75 个文件级类别证据，尚未归一化为独立缺陷、拒绝模式或课程结论。

第 7 批异步能力：

- 批次分母：191 个 Java 文件、29485 LOC；
- 人工状态：191 个 `reviewed`、0 个 `blocked`；
- 当前全局状态：3119 个 `reviewed`、317 个 `unreviewed`；
- 最终角色：79 个异步集成、102 个数据模型、4 个通用代码、3 个数据访问和 3 个基础设施文件；
- 执行信号：2 个 `@Scheduled`、8 个 `@Async`、2 个 `@PostConstruct`、6 个
  `ApplicationListener` 和 3 个显式 Executor 的 `CompletableFuture` 文件；
- 风险候选：264 个文件级类别证据，尚未归一化为独立缺陷、拒绝模式或课程结论。

第 8 批基础设施：

- 批次分母：53 个 Java 文件、6175 LOC；
- 人工状态：53 个 `reviewed`、0 个 `blocked`；
- 当前全局状态：3172 个 `reviewed`、264 个 `unreviewed`；
- 最终角色：38 个基础设施、7 个数据模型、5 个数据访问和 3 个异步集成文件；
- 职责形态：区分启动缓存、上传下载策略、存储客户端、媒体线程、日志适配、分表和许可证兼容；
- 风险候选：126 个文件级类别证据，尚未归一化为独立缺陷、拒绝模式或课程结论；
- Redis 边界：本批没有 Redis 客户端实现证据，`cache` 包名只表示进程内启动缓存。

第 9 批通用代码：

- 批次分母：257 个 Java 文件、33715 LOC；
- 人工状态：257 个 `reviewed`、0 个 `blocked`；
- 当前全局状态：3429 个 `reviewed`、7 个 `unreviewed`；
- 最终角色：178 个通用代码、60 个基础设施、10 个数据模型、5 个业务层、3 个异步集成和 1 个
  横切能力文件；
- 职责形态：101 个文件显式映射到 58 种特殊职责，另有 156 个顶层普通代码枚举；
- 风险候选：378 个文件级类别证据，尚未归一化为独立缺陷、拒绝模式或课程结论。

第 10 批测试：

- 批次分母：7 个 Java 文件、1840 LOC；
- 人工状态：7 个 `reviewed`、0 个 `blocked`；
- 当前全局状态：3436 个 `reviewed`、0 个 `unreviewed`；
- 反馈环：46 个 JUnit 4 测试、148 次显式断言、7 种测试形态和 19 个文件级生产入口；
- 风险候选：20 个文件级类别证据，尚未归一化为独立缺陷、拒绝模式或课程结论。

身份 JSON 和 Phase 1B 分片保持原样，当前状态见
[`phase-1c-startup-config-review.md`](./phase-1c-startup-config-review.md) 和
[`phase-1c-web-entry-review.md`](./phase-1c-web-entry-review.md)、
[`phase-1c-business-layer-review.md`](./phase-1c-business-layer-review.md) 和
[`phase-1c-data-access-review.md`](./phase-1c-data-access-review.md) 和
[`phase-1c-data-model-review.md`](./phase-1c-data-model-review.md) 和
[`phase-1c-cross-cutting-review.md`](./phase-1c-cross-cutting-review.md) 和
[`phase-1c-async-integration-review.md`](./phase-1c-async-integration-review.md) 和
[`phase-1c-infrastructure-review.md`](./phase-1c-infrastructure-review.md) 和
[`phase-1c-common-code-review.md`](./phase-1c-common-code-review.md) 和
[`phase-1c-test-review.md`](./phase-1c-test-review.md)。Phase 1D 第 1 批从这些台账和 7 个自动提取
分片冻结 906 个原始输入及 27731 条文件关联，并把 40 个语言输入归一化为 15 个能力。第 2 批以
剩余 866 个输入及 20746 条文件关联为分母，把 112 个标准库输入归一化为 33 个能力；754 个输入
保持 `pending`。第 3 批再以这 754 个输入及 19471 条文件关联为分母，把 235 个框架与第三方库
输入归一化为 34 个能力，覆盖 3085 个唯一项目文件并登记 137 个代表符号；519 个输入保持
`pending`。第 4 批再以这 519 个输入及 6665 条文件关联为分母，把 200 个工程候选归一化为 38 个
能力，覆盖 2742 个唯一项目文件并登记 179 个代表符号；319 个风险说明保持 `pending`。第 5 批
再把这 319 条风险归一化为 47 个规范风险模式，覆盖 1568 个唯一项目文件并登记 225 个代表符号；
五批 sourceId 全局重复、遗漏和额外映射均为 0。

Phase 2 已在同一冻结身份上把 167 个规范来源唯一映射到 64 个课程、参考或项目节点，补入 7 个
必要前置，冻结 114 条依赖边和 8 条代表性静态调用链。独立 validator 已确认来源覆盖、DAG、阶段
单调、风险证据政策和正式产物 SHA 一致；项目示例实现、Java 课程、菜单和 Markdown adapter 仍未
开始。

Gate 2 已由用户明确确认为 `passed`，当前只授权进入 Phase 3 平台能力实施；不得进入 Phase 4
逐知识点研究或课程正文。若任一目标 Java 文件变化，必须回到 Phase 1A 重新冻结，不能迁移本快照
结论。
