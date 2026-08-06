# `dzzz-app` Java 自动提取报告

> 版本：v1.0<br>
> 源码快照：`dzzz-app-20260803-179e722831ab`<br>
> 分析 ID：`dzzz-app-analysis-20260803-958d37cf1be1`<br>
> 状态：Phase 1B 自动提取、Phase 1C 十批人工复核及 Phase 1D 五批均已完成，Gate 1 已通过
> 身份清单：[`dzzz-app-file-inventory.md`](./dzzz-app-file-inventory.md)<br>
> 机器 manifest：[`extracted/manifest.json`](./extracted/manifest.json)
> 人工复核：[`phase-1c-startup-config-review.md`](./phase-1c-startup-config-review.md)、
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

本批在 Phase 1A 冻结的 3436 个 Java 文件上建立可重复的结构化初稿，为后续人工逐文件复核和
能力矩阵提供输入。自动结果只表示“解析器或索引观察到了什么”，不表示代码正确、角色分类正确，
也不表示 CodeGraph 候选关系已经得到语义确认。

Phase 1B 没有：

- 把任何文件标记为 `reviewed`；
- 创建最终 Java 知识点或能力矩阵；
- 把项目实现当作推荐写法；
- 复制方法体、字段初始化值、字符串字面量或注解参数；
- 读取或修改 `dzzz-app` 之外模块的源码内容；
- 修改 `dzzz-app`、前端 `src/`、菜单、Markdown adapter 或课程正文。

## 2. 输入身份

| 项目                    | 冻结值                                                             |
| ----------------------- | ------------------------------------------------------------------ |
| 源码快照 ID             | `dzzz-app-20260803-179e722831ab`                                   |
| Source manifest SHA-256 | `179e722831ab66d55208618ba1db959c431505ec6b32ab492fb9232916ba60e1` |
| Java 文件               | 3436：主代码 3429，测试 7                                          |
| 源码 LOC                | 357568                                                             |
| 自动分析 ID             | `dzzz-app-analysis-20260803-958d37cf1be1`                          |
| 分片内容 SHA-256        | `958d37cf1be19e43bd5ef4c088d4f3c2c9fad18b3188b3df8aa38a4438c736f6` |
| Manifest SHA-256        | `6fbab2cd2b60a78481f8d6302ef28c25b2463cfabb13b7666593078b40bbc22c` |

自动提取开始前逐个复核了源码大小和 SHA-256。CodeGraph 的 3436 条目标文件记录也逐个与
Phase 1A 身份清单匹配，索引版本为 `1.4.1`，提取版本为 `24`。

## 3. 工具与输出

工具位于：

```text
docs/backend/java/audit/tooling/
├── audit-rules.mjs
├── async-integration-review-ledger-validator.mjs
├── build-async-integration-review.mjs
├── build-business-layer-review.mjs
├── build-cross-cutting-review.mjs
├── build-data-access-review.mjs
├── build-data-model-review.mjs
├── build-engineering-pattern-capability-matrix.mjs
├── build-framework-capability-matrix.mjs
├── build-infrastructure-review.mjs
├── build-java-language-capability-matrix.mjs
├── build-common-code-review.mjs
├── build-standard-library-capability-matrix.mjs
├── build-test-review.mjs
├── codegraph-extractor.mjs
├── build-web-entry-review.mjs
├── business-layer-review-ledger-validator.mjs
├── cross-cutting-review-ledger-validator.mjs
├── data-access-review-ledger-validator.mjs
├── data-model-review-ledger-validator.mjs
├── engineering-pattern-capability-catalog.mjs
├── engineering-pattern-capability-matrix-validator.mjs
├── extract-dzzz-app.mjs
├── framework-capability-catalog.mjs
├── framework-capability-matrix-validator.mjs
├── infrastructure-review-catalog.mjs
├── infrastructure-review-content-contract.mjs
├── infrastructure-review-ledger-validator.mjs
├── java-language-capability-catalog.mjs
├── java-language-capability-matrix-validator.mjs
├── common-code-review-catalog.mjs
├── common-code-review-content-contract.mjs
├── common-code-review-ledger-validator.mjs
├── standard-library-capability-catalog.mjs
├── standard-library-capability-matrix-validator.mjs
├── test-review-ledger-validator.mjs
├── record-validator.mjs
├── review-ledger-validator.mjs
├── web-entry-review-ledger-validator.mjs
├── package.json
└── package-lock.json
```

Java 结构解析使用 `java-parser@3.0.1` 的 CST，而不是正则表达式；Mapper XML 结构解析使用精确锁定的
`fast-xml-parser@5.10.1`。工具包通过 overrides 固定 `lodash@4.18.1` 和 `lodash-es@4.18.1`，本批
`npm audit` 为 0 个已知漏洞。

机器结果位于：

```text
docs/backend/java/audit/extracted/
├── manifest.json
├── dzzz-app-files-0001-0500.jsonl
├── dzzz-app-files-0501-1000.jsonl
├── dzzz-app-files-1001-1500.jsonl
├── dzzz-app-files-1501-2000.jsonl
├── dzzz-app-files-2001-2500.jsonl
├── dzzz-app-files-2501-3000.jsonl
└── dzzz-app-files-3001-3436.jsonl
```

JSONL 每行对应一个 Java 文件，每个分片最多 500 行。路径和 `inventoryIndex` 与 Phase 1A 清单
严格一一对应，避免把超过 3000 条记录维护在单个超长 JSON 数组中。

## 4. 单文件记录合同

每条记录包含：

| 字段           | 内容                                           | 自动结果边界                            |
| -------------- | ---------------------------------------------- | --------------------------------------- |
| 身份           | index、路径、source set、源码 SHA-256          | 必须与 Phase 1A 相同                    |
| package/import | package、普通/静态/通配符 import、行号         | CST 结构事实                            |
| 类型           | class、interface、enum、annotation、record     | 包含修饰符、泛型、继承/实现和枚举成员名 |
| 字段           | owner、名称、类型、修饰符、可见性、行号        | 不记录初始化表达式或值                  |
| 构造方法       | owner、参数类型、异常、签名和行号              | 不记录方法体或参数名                    |
| public 方法    | owner、返回类型、参数类型、异常、签名和行号    | 不记录非 public 方法清单或方法体        |
| 注解           | 名称、作用位置、目标和行号                     | 不记录注解参数值                        |
| 语言特征       | Lambda、方法引用、泛型、异常、并发、I/O 等信号 | 语义类信号仍需人工确认                  |
| 框架使用       | import 和注解支持的框架候选                    | 不能仅凭候选认定业务能力                |
| 角色           | 自动推断的主要角色和命中规则                   | 状态固定为 `candidate-needs-review`     |
| CodeGraph      | 模块内入/出边候选、未解析候选、清单外排除计数  | 同名解析可能误连，必须人工复核          |

所有记录的 `extractionStatus` 均为 `parsed-needs-review`。Phase 1A 和 Phase 1B 产物中的历史
审计状态仍为：

| 状态         | 文件数 |
| ------------ | -----: |
| `unreviewed` |   3436 |
| `reviewing`  |      0 |
| `reviewed`   |      0 |
| `blocked`    |      0 |

Phase 1C 不改写这份自动提取历史。当前状态由人工复核台账叠加：3436 个 `reviewed`、0 个
`unreviewed`。Phase 1D 五批已经归一化全部 906 个原始输入，详情见 Java 语言、标准库、框架、
工程模式能力矩阵和风险反例矩阵；Gate 1 已通过。

## 5. 全量提取结果

### 5.1 声明

| 项目        |  数量 |
| ----------- | ----: |
| 类型声明    |  3489 |
| class       |  3007 |
| interface   |   298 |
| enum        |   171 |
| annotation  |    13 |
| record      |     0 |
| 字段        | 17821 |
| 构造方法    |   510 |
| public 方法 | 11859 |
| 注解使用    | 21483 |

这些数量是源码声明数，不包含 Lombok 在编译期可能生成的方法，也不是课程数量。

### 5.2 Java 语言与标准库信号

| 信号                 | 文件数 | CST/证据出现数 |
| -------------------- | -----: | -------------: |
| 注解使用             |   3099 |          21483 |
| 方法引用             |    170 |           3628 |
| 增强 for             |    380 |           2210 |
| catch                |    318 |           1797 |
| Lambda               |    178 |           1229 |
| throw                |    124 |            372 |
| Stream API           |    174 |            174 |
| 并发包               |     66 |             66 |
| switch               |     30 |             51 |
| try-with-resources   |     28 |             34 |
| 泛型声明             |     67 |             76 |
| 匿名类或枚举常量类体 |     35 |             47 |
| I/O                  |    326 |            326 |
| synchronized 块      |     12 |             13 |
| 反射                 |     11 |             11 |
| Optional             |      4 |              4 |

`Stream API`、并发、I/O、反射和 Optional 是 import 或调用信号；表中第二个数字是信号数，不应
解释为完整语义使用次数。其他语法项来自 CST 节点计数。匿名类和枚举常量类体中的方法不计入外层
命名类型的 `publicMethods`；其中的方法和参数注解使用独立的匿名目标，留待人工复核。

### 5.3 框架信号

| 框架候选     | 文件数 | 框架候选                          | 文件数 |
| ------------ | -----: | --------------------------------- | -----: |
| Lombok       |   2328 | Bean Validation                   |    562 |
| MyBatis-Plus |    488 | Spring Core                       |    432 |
| XML/JAXB     |    454 | Fastjson                          |    209 |
| Swagger 2    |    194 | Spring MVC                        |    160 |
| Servlet      |    133 | Spring Transaction                |    114 |
| HTTP Client  |     73 | MyBatis                           |     58 |
| Spring Boot  |     31 | Spring Scheduling/Async           |     20 |
| Jackson      |     14 | Spring WebSocket                  |     12 |
| JUnit        |      8 | Spring AOP                        |      6 |
| Spring Retry |      2 | Spring Data Redis                 |      1 |
| Mockito      |      1 | Spring Cache/Integration/Actuator |      0 |

这里统计的是至少命中一条 import 或注解证据的文件数。0 不证明运行时不存在对应能力，例如依赖可能
通过配置、间接封装或资源文件使用；资源审计和人工调用链复核仍然需要继续。

### 5.4 文件角色候选

| 角色候选          | 文件数 | 角色候选          | 文件数 |
| ----------------- | -----: | ----------------- | -----: |
| data-model        |   1649 | persistence-model |    578 |
| business          |    338 | common            |    255 |
| async-integration |    216 | web-entry         |    145 |
| data-access       |    134 | cross-cutting     |     40 |
| infrastructure    |     39 | startup-config    |     20 |
| test              |      7 | unclassified      |     15 |

`unclassified` 不会在自动阶段强行归类。Phase 1C 必须读取这 15 个文件，并检查其他目录规则是否把
同名目录误判为角色。

## 6. CodeGraph 边界

第一次 `codegraph explore` 即使明确要求只处理 `dzzz-app`，仍返回了其他 Maven 模块的同名符号。
因此本批没有直接采纳 explore 的输出，而是：

1. 先逐个确认 CodeGraph 文件内容哈希与 Phase 1A 快照一致；
2. 只保留来源路径和目标路径都存在于 3436 条冻结清单中的边；
3. 对 7322 次清单外端点只记录排除计数，不保存外部路径或符号；其中其他模块 6096 次，
   `dzzz-app` 内未纳入 Java 清单的资源端点 1226 次；
4. 将 80110 次模块内索引边和 77759 次符号型未解析边命名为 `candidate`；
5. 排除 31101 次包含表达式、参数或值的未解析候选，只在 manifest 中保存排除计数；
6. 不把同名方法解析、动态代理、Spring 注入或 MyBatis 映射推断成已确认调用链。

CodeGraph 候选用于 Phase 1C 定位调用者和被调用者。人工复核必须回到源码和精确路径验证，不能只看
候选边关闭文件。

## 7. 数据保护

生成记录没有保存：

- 方法体；
- 字段初始化表达式和值；
- 字符串、字符或数字字面量；
- 注解参数；
- 注释正文；
- 配置文件内容；
- 其他 Maven 模块的关系明细。

未解析 CodeGraph 关系只接受 Java 限定符号、方法引用或类型引用；表达式、调用参数和值型内容在写入
前排除。生成器还会递归拒绝任何包含引号、反引号或换行的记录字符串。全量质量检查确认生成记录中
此类受限内容数为 0，类型字符串中的 `unknown` 数为 0，package 注解目标均与规范包名一致。

公开方法以 `owner + signature` 验证文件内唯一性；普通方法、构造方法、匿名类方法和枚举常量类体
方法的注解目标均包含参数类型，可区分重载，枚举常量注解还会定位到常量名。匿名类和枚举常量类体
的方法不会冒充外层类型方法。枚举无显式修饰符的构造器按 Java 语义记录为 `private`。符号名和
包名仍属于项目证据，只能用于本课程审计，正式课程示例还必须最小化、去敏和改写。

## 8. 复现与验证

安装独立工具依赖：

```bash
npm --prefix docs/backend/java/audit/tooling install
```

重新生成：

```bash
npm --prefix docs/backend/java/audit/tooling run extract
```

只读重算、逐字节比较自动产物，并校验当前人工复核台账：

```bash
npm --prefix docs/backend/java/audit/tooling run check
```

验证要求：

- 所有 3436 个文件的路径、大小和 SHA-256 仍等于 Phase 1A；
- CodeGraph 中全部目标文件的内容哈希匹配且无额外目标 Java 文件；
- 3436 个 CST 均成功解析；
- 7 个 JSONL 分片路径连续、每行可解析且身份一一对应；
- 分片哈希和 analysis content SHA-256 与 manifest 一致；
- package、注解目标、公开方法归属、枚举构造器可见性和受限内容检查通过；
- manifest 生成时间直接取自 Phase 1A 冻结清单，相同冻结输入从空目录重建仍保持确定；
- `npm audit` 为 0；
- 目标 `dzzz-app` 工作树保持 clean。
- Phase 1C 第 1 批恰好覆盖 34 个目标文件和 3949 LOC；索引、哈希、机器候选与最终角色汇总一致。
- Phase 1C 第 2 批恰好覆盖 150 个目标文件和 29713 LOC，3 个台账分片哈希与 manifest 一致；
  与第 1 批路径零重叠。
- Phase 1C 第 3 批恰好覆盖 338 个业务层文件和 154161 LOC，7 个台账分片哈希与 manifest 一致；
  前三批路径零重叠。
- Phase 1C 第 4 批恰好覆盖 712 个数据访问 Java 文件和 38330 LOC，15 个台账分片哈希与 manifest
  一致；14 份 Mapper XML 的 namespace 和 38 个 statement 作为独立哈希证据纳入，前四批路径
  零重叠。
- Phase 1C 第 5 批恰好覆盖 1654 个数据模型文件和 58427 LOC，34 个台账分片哈希与 manifest
  一致；登记 928 个文件级风险候选，前五批路径零重叠，累计状态覆盖完整冻结分母。
- Phase 1C 第 6 批恰好覆盖 40 个横切能力文件和 1773 LOC，1 个台账分片与人工签核哈希一致；
  登记 14 种职责形态、7 个角色纠正和 75 个文件级风险候选，前六批路径零重叠。
- Phase 1C 第 7 批恰好覆盖 191 个异步能力物理范围文件和 29485 LOC，4 个台账分片与人工签核
  哈希一致；登记 24 种职责形态、113 个角色纠正和 264 个文件级风险候选，前七批路径零重叠。
- Phase 1C 第 8 批恰好覆盖 53 个基础设施物理范围文件和 6175 LOC，2 个台账分片与人工签核哈希
  一致；登记 25 种职责形态、24 个角色纠正和 126 个文件级风险候选，前八批路径零重叠。
- Phase 1C 第 9 批恰好覆盖 257 个通用代码物理范围文件和 33715 LOC，6 个台账分片与人工签核哈希
  一致；登记 59 种职责形态、77 个角色纠正和 378 个文件级风险候选，前九批路径零重叠。
- Phase 1C 第 10 批恰好覆盖 7 个测试文件和 1840 LOC，1 个台账分片与人工签核哈希一致；登记
  7 种反馈环形态、46 个测试、148 次显式断言、19 个文件级生产入口和 20 个风险候选，十批路径
  零重叠，累计 3436 个文件全部为 `reviewed`。
- Phase 1D 第 1 批冻结 906 个唯一原始输入和 27731 条文件关联，把 40 个语言输入归一化为 15 个
  Java 语言能力，覆盖 3414 个唯一项目文件并登记 74 个代表符号；866 个输入保持 `pending`。
- 第 1 批的原始输入清单、JSON 矩阵、Markdown 摘要、manifest 和人工签核哈希一致；研究、示例和
  课程编写状态均未启动，Gate 1 仍为 `not-passed`。
- Phase 1D 第 2 批以上一批 866 个 `pending` 输入和 20746 条文件关联为分母，把 112 个标准库
  输入归一化为 33 个 `JAVA-STDLIB-001..033` 能力，覆盖 580 个唯一项目文件并登记 123 个代表
  符号；754 个输入保持 `pending`。
- 第 2 批的输入清单、JSON 矩阵、Markdown 摘要、manifest 和人工签核哈希一致；5 个标准库语言
  信号已全部处理，21 个框架信号与 319 个风险说明未提前归一化，Gate 1 仍为 `not-passed`。
- Phase 1D 第 3 批以上一批 754 个 `pending` 输入和 19471 条文件关联为分母，把 235 个框架与
  第三方库输入归一化为 34 个 `JAVA-FRAMEWORK-001..034` 能力，覆盖 3085 个唯一项目文件并
  登记 137 个代表符号；519 个输入保持 `pending`。
- 第 3 批的输入清单、JSON 矩阵、Markdown 摘要、manifest 和人工签核哈希一致；21 个框架信号
  已全部处理，200 个工程模式或残留候选与 319 个风险说明未提前归一化，Gate 1 仍为
  `not-passed`。
- Phase 1D 第 4 批以上一批 519 个 `pending` 输入和 6665 条文件关联为分母，把 200 个工程候选
  归一化为 38 个 `JAVA-ENGINEERING-001..038` 能力，覆盖 2742 个唯一项目文件并登记 179 个
  代表符号；319 个风险说明保持 `pending`。
- 第 4 批的输入清单、JSON 矩阵、Markdown 摘要、manifest 和人工签核哈希一致；服务定位器、共享
  状态、锁、敏感数据和 legacy 兼容只作为后续正确实践选题证据，Gate 1 仍为 `not-passed`。
- Phase 1D 第 5 批以上一批 319 个 `pending` 风险输入和 3152 条文件关联为分母，把 319 条风险
  归一化为 47 个 `JAVA-RISK-001..047` 规范风险模式，覆盖 1568 个唯一项目文件并登记 225 个
  代表符号；待处理输入降为 0。
- 第 5 批的输入清单、JSON 矩阵、Markdown 摘要、manifest 和人工签核哈希一致；独立 validator
  重述全部 319 条风险来源映射，并确认五批 906 个 sourceId 全局重复、遗漏和额外映射均为 0。
- 风险只作为后续正确实践、易错点与拒绝模式证据，不认可项目旧写法；Gate 1 已通过，线上研究、
  项目示例和课程正文仍未开始。

## 9. 当前 Stop Boundary

Phase 2A 至 2E 的可执行工作到此停止。已经执行：

- 重新验证五份 Phase 1 manifest、矩阵和 `15/33/34/38/47=167` 冻结分母；
- 为 167 个规范来源建立唯一 disposition，统计为 43 个 `lesson`、108 个 `merged`、6 个
  `reference` 和 10 个 `project-only`；
- 冻结 64 个课程节点、7 个必要前置、114 条依赖边和 8 条限定于 `dzzz-app/` 的代表性静态调用链；
- 生成来源清单、课程矩阵、完整目录、调用链、项目候选、风险纠错登记、manifest 和人工决策签核；
- 用独立 validator 校验完整覆盖、DAG、阶段单调、风险证据政策、状态和全部 SHA。

当前没有执行：

- 逐知识点线上研究或课程正文；
- 项目示例实现；
- Java 课程、菜单或 Markdown adapter 实现。

Gate 2 已由用户明确确认为 `passed`，当前只授权 Phase 3 平台能力实施；不得进入 Phase 4 的逐
知识点研究、课程正文或项目示例。若源码快照变化，必须回到 Phase 1A 重新冻结，不能把本分析结果
迁移到新快照。
