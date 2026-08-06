# `dzzz-app` Java 后端课程实施计划

> 版本：v1.17
> 日期：2026-08-05
> 状态：Phase 4 第一课已完成；内容架构迁移已完成，下一课尚未开始
> 目标项目：`/Users/jian/Desktop/work/TDH/dzzz/dzzz-app`<br>
> 课程仓库：`/Users/jian/Desktop/tools/vue3-study`

## 1. 目标

为零基础学习者建立一条“现代 Java 后端优先、`dzzz-app` 旧项目补充”的系统课程。课程只选择
`dzzz-app` 已使用的语言、标准库、框架和工程能力，以及理解这些能力不可缺少的前置知识；不先
罗列整套 Java 百科。

课程需要让学习者最终能够：

1. 从零理解 Java 语言和常用标准库。
2. 理解现代 Spring 后端的请求、业务、数据和基础设施分层。
3. 阅读 `dzzz-app` 的 Controller、Service、Mapper、PO/DTO/VO 和配置代码。
4. 识别项目中的旧版本限制和不规范习惯，不把它们继续当作推荐写法。
5. 在现代正确用法与 Java 8、Spring Boot 2.3.12 兼容实现之间建立明确映射。
6. 沿真实项目调用链定位问题，并用最小验证确认理解。

## 2. 权威关系

本计划与以下文档共同构成后端课程的 authoring contract：

- [IT 学习站架构设计](../../architecture/IT学习站架构设计.md)
- [后端课程研究与来源规范](../research-source-standard.md)
- [后端知识点 Markdown 模板](../knowledge-point-template.md)

冲突时按以下顺序处理：

1. 用户最新确认的范围和 stop boundary；
2. 全站架构；
3. 本计划的执行阶段与 Gate；
4. 研究与来源规范；
5. 知识点 Markdown 模板；
6. 课程站通用内容规范。

## 3. 已确认决策

| 决策     | 结果                                                            |
| -------- | --------------------------------------------------------------- |
| 仓库     | Java 课程放入现有 `vue3-study`，不复制学习站                    |
| 导航     | `技术中心 -> 后端 -> Java -> Core`；未来技术必须单独调研准入    |
| 内容源   | 前后端课程与 Reference 最终统一使用 Markdown                    |
| 展示     | Markdown 转换为统一内容接口，复用目录、搜索、进度和详情页       |
| 现代基线 | 当前受支持的 Java LTS 和兼容的稳定 Spring Boot GA；每批实时复核 |
| 项目补充 | Java 8、Spring Boot 2.3.12.RELEASE，使用 `dzzz-app` 场景        |
| 示例策略 | 现代正确示例在前；项目示例去敏、最小化并纠正后展示              |
| 课程阶段 | 基础、中级、高级只用于学习顺序，不进入 URL                      |
| Demo     | 使用真实本地源码，或在新标签页打开外部 HTTPS Demo               |
| 研究方式 | 每个知识点单独完成官方核验、易错点取证和验证闭环                |
| 当前范围 | 只处理 `dzzz-app`                                               |

## 4. 范围与硬边界

### 4.1 纳入范围

- `dzzz-app/src/main/java/**/*.java` 的全部 Java 文件；
- `dzzz-app/src/test/**/*.java` 的全部 Java 测试文件；
- `dzzz-app/src/main/resources` 中理解 Java 配置、Mapper 和框架行为所必需的资源；
- `dzzz-app/pom.xml` 的依赖、插件、打包和编译配置；
- 根 `pom.xml` 与 `dzzz-parent/pom.xml` 仅用于解析 `dzzz-app` 继承的版本和构建事实，不作为
  其他模块课程入口。

### 4.2 排除范围

- `dzzz-quartz`；
- `dzzz-net`；
- `dzzzLicenseTool`；
- 其他 Maven 模块的 Java、资源、测试和业务能力；
- 对 `dzzz-app` 后端代码进行重构或修复；
- 将项目业务代码整段复制到课程仓库；
- 与 `dzzz-app` 当前能力无关的 Java 全量 API 百科；
- preview、incubator、experimental 特性；
- Go 或其他后端语言课程正文。

同包名、同类名可能在其他模块重复。CodeGraph 或文本检索返回其他模块结果时，必须检查物理路径并
拒绝非 `dzzz-app/` 命中，不能把重复代码计入覆盖。

## 5. 2026-08-03 只读基线

以下数据是计划阶段的初始参考值。Phase 1A 已重新生成并冻结相同分母；后续以
[`dzzz-app-file-inventory.md`](./audit/dzzz-app-file-inventory.md) 的快照身份和机器清单为准：

| 项目                        | 当前值 |
| --------------------------- | -----: |
| `src/main/java` Java 文件   |   3429 |
| `src/main/java` Java 总行数 | 355728 |
| `src/test` Java 文件        |      7 |
| Controller 目录 Java 文件   |    126 |
| Service 目录 Java 文件      |    338 |
| DAO 目录 Java 文件          |    134 |
| PO 目录 Java 文件           |    578 |
| DTO 目录 Java 文件          |    283 |
| VO 目录 Java 文件           |   1049 |
| Timer 目录 Java 文件        |    169 |
| Enum 目录 Java 文件         |    162 |
| Util 目录 Java 文件         |     84 |

构建与启动事实：

| 项目          | 当前值                           |
| ------------- | -------------------------------- |
| 启动类        | `com.tdh.DzzzAreaApplication`    |
| Java 预期基线 | Java 8；effective model 尚未验证 |
| Spring Boot   | 2.3.12.RELEASE                   |
| 打包          | WAR                              |
| 主要 Web 能力 | Spring MVC                       |
| 数据访问      | MyBatis-Plus / MyBatis           |

`dzzz-app` 的 parent 使用空 `relativePath`，当前机器又缺少 Java、Maven 和已安装的 parent POM，
因此 Java 8、Spring Boot 2.3.12 与 Spring Framework 5.2.15 是由同级 parent 配置和官方归档
交叉得到的预期仓库基线。依赖解析或编译课程开始前仍需验证 effective model。

依赖与源码初步证明项目还使用 Spring AOP、事务、缓存、Redis、Integration、WebSocket、
Actuator、Retry、Swagger 2、Bean Validation、Lombok、Jackson/Fastjson、XML/JAXB、文件上传、
定时任务、异步执行和外部 HTTP 调用。这里只作为审计种子，不等同于最终知识点清单。

当前高频 import 还显示大量 `lombok.Data`、`java.util.List`、`@Autowired`、旧
`org.hibernate.validator.constraints.NotBlank`、`java.util.Date`、MyBatis-Plus Wrapper、
Servlet 请求和事务注解。这些事实同时说明项目示例必须经过现代规范校正。

## 6. 完成定义

“了解全部 Java 代码”不能用少量代表文件代替。完成 Phase 1 前必须满足：

1. 每个 `dzzz-app` Java 文件在审计清单中恰好有一条记录。
2. 每条记录包含路径、包、主要符号、代码角色、LOC、import、注解、继承/实现、公开方法和主要
   调用关系。
3. 每个文件具有明确审计状态：`unreviewed`、`reviewing`、`reviewed` 或 `blocked`。
4. 每个 `reviewed` 文件已经人工检查其提取结果和主要实现，不只依赖关键词计数。
5. 所有唯一语法、标准库、框架能力、工程模式和高风险反例均已进入能力矩阵。
6. 每个候选知识点能够追溯到项目文件，或被标记为理解项目能力所需的必要前置知识。
7. 课程编写前冻结最终知识点、前置关系、阶段、示例状态和来源计划。

Phase 1 未通过 Gate 前，不开始批量写课程正文。

## 7. 规划产物

### 7.1 审计产物

计划在执行阶段建立：

```text
docs/backend/java/audit/
├── dzzz-app-file-inventory.md
├── dzzz-app-file-inventory.json
├── dzzz-app-source-analysis.md
├── extracted/
├── tooling/
├── java-language-capability-matrix.md
├── java-standard-library-capability-matrix.md
├── java-framework-capability-matrix.md
├── java-engineering-pattern-capability-matrix.md
├── architecture-and-call-paths.md
├── project-example-register.md
├── rejected-pattern-register.md
└── course-coverage-matrix.md
```

如果逐文件清单超过适合人工阅读的规模，可增加结构化数据文件作为机器事实源，但必须保留 Markdown
摘要、生成规则和覆盖统计。机器数据不能替代人工审计状态。

### 7.2 研究与课程产物

```text
docs/research/backend/java/<collection>/<topic>.md
src/categories/backend/java/core/learn/<topic>.md
src/categories/backend/java/core/reference/<topic>.md
src/categories/backend/java/core/demos/<topic>/...
```

每个知识点先有研究记录，再有课程正文。研究记录可以比课程更详细，但课程中的关键结论必须能够
反向定位到研究来源。

## 8. Phase 0：计划与规则冻结

### 目标

在读取和分类大型后端项目之前，冻结范围、来源规则、知识点模板和 stop boundary。

### 当前任务

- [x] 确认课程与现有学习站共存。
- [x] 确认当时的 `backend -> java` 目录和菜单模型；目标模型现由全站架构替代。
- [x] 确认后端 Markdown 能接入课程站；前后端统一 Markdown 与目标目录迁移已经完成。
- [x] 确认现代稳定版优先、`dzzz-app` 旧版补充。
- [x] 确认来源等级和易错点取证规则。
- [x] 确认统一后端知识点模板。
- [x] 确认只处理 `dzzz-app`。
- [x] 形成正式计划。

### Gate 0

- 三份规划文档相互引用且没有范围冲突；
- `src/`、菜单、解析器和课程正文均未修改；
- Markdown 格式检查通过。

## 9. Phase 1：`dzzz-app` 全量 Java 审计

> 当前状态：Phase 1D 五批已完成，906/906 个原始输入已唯一归一化；Gate 1 已通过
> 冻结快照：`dzzz-app-20260803-179e722831ab`<br>
> 文件清单：[`dzzz-app-file-inventory.md`](./audit/dzzz-app-file-inventory.md)<br>
> 自动提取：[`dzzz-app-source-analysis.md`](./audit/dzzz-app-source-analysis.md)<br>
> 人工复核：[`phase-1c-startup-config-review.md`](./audit/phase-1c-startup-config-review.md)、
> [`phase-1c-web-entry-review.md`](./audit/phase-1c-web-entry-review.md)、
> [`phase-1c-business-layer-review.md`](./audit/phase-1c-business-layer-review.md)、
> [`phase-1c-data-access-review.md`](./audit/phase-1c-data-access-review.md)、
> [`phase-1c-data-model-review.md`](./audit/phase-1c-data-model-review.md)、
> [`phase-1c-cross-cutting-review.md`](./audit/phase-1c-cross-cutting-review.md)、
> [`phase-1c-async-integration-review.md`](./audit/phase-1c-async-integration-review.md)、
> [`phase-1c-infrastructure-review.md`](./audit/phase-1c-infrastructure-review.md)、
> [`phase-1c-common-code-review.md`](./audit/phase-1c-common-code-review.md)、
> [`phase-1c-test-review.md`](./audit/phase-1c-test-review.md)
> 能力矩阵：[`java-language-capability-matrix.md`](./audit/java-language-capability-matrix.md)、
> [`java-standard-library-capability-matrix.md`](./audit/java-standard-library-capability-matrix.md)、
> [`java-framework-capability-matrix.md`](./audit/java-framework-capability-matrix.md)、
> [`java-engineering-pattern-capability-matrix.md`](./audit/java-engineering-pattern-capability-matrix.md)、
> [`java-review-risk-matrix.md`](./audit/java-review-risk-matrix.md)
> 批次 manifest：[`phase-1d-java-language-manifest.json`](./audit/phase-1d-java-language-manifest.json)、
> [`phase-1d-standard-library-manifest.json`](./audit/phase-1d-standard-library-manifest.json)、
> [`phase-1d-framework-manifest.json`](./audit/phase-1d-framework-manifest.json)、
> [`phase-1d-engineering-pattern-manifest.json`](./audit/phase-1d-engineering-pattern-manifest.json)、
> [`phase-1d-review-risk-manifest.json`](./audit/phase-1d-review-risk-manifest.json)

### 9.1 冻结快照

1. [x] 记录 Git 分支、工作区状态和 `dzzz-app` 文件清单。
2. [x] 记录所有纳入文件的路径、大小和内容哈希。
3. [x] 记录 Java、Spring Boot、Maven、依赖和打包基线。
4. [x] 冻结审计日期和快照 ID；后续矩阵必须使用该 ID，不跨快照混用计数。

### 9.2 自动提取

> 完成状态：已完成<br>
> 分析 ID：`dzzz-app-analysis-20260803-958d37cf1be1`<br>
> 分片内容 SHA-256：`958d37cf1be19e43bd5ef4c088d4f3c2c9fad18b3188b3df8aa38a4438c736f6`<br>
> Manifest SHA-256：`6fbab2cd2b60a78481f8d6302ef28c25b2463cfabb13b7666593078b40bbc22c`

对每个 Java 文件提取：

- [x] package、import 和静态 import；
- [x] class、interface、enum、annotation、record 等类型；
- [x] 修饰符、泛型参数、继承和实现关系；
- [x] 字段、构造方法、公开方法和异常声明；
- [x] 注解及其作用位置；
- [x] Lambda、Stream、反射、I/O、并发和资源管理语法信号；
- [x] Spring、MyBatis、Redis、WebSocket 等框架使用候选；
- [x] 文件对应的 Controller、Service、DAO、模型、配置或基础设施角色候选；
- [x] CodeGraph 提供的调用者、被调用者和影响路径候选。

结构问题优先使用 CodeGraph，精确注解、import、字符串和配置键使用 `rg`。CodeGraph 返回模糊或
跨模块结果时，回退到限定 `dzzz-app/` 的文本检索和目标文件读取。

本批实际验证了 CodeGraph explore 会命中其他 Maven 模块的同名类，因此机器提取先逐文件校验
CodeGraph 内容哈希，再在数据层只保留两端均属于冻结清单的边；清单外端点只计排除数，未解析
关系只保留符号型候选，表达式、参数和值型候选也只计排除数。匿名类和枚举常量类体的方法不归入
外层命名类型的公开方法，其注解使用带参数类型的独立目标。所有关系、框架和文件角色仍为
`candidate-needs-review`，不能代替 9.3 的人工复核。Phase 1A 的 3436 个审计状态保持
`unreviewed`，作为自动提取发生时的历史基线；当前状态由后续复核台账叠加计算。

### 9.3 人工逐文件复核批次

| 顺序 | 批次       | 主要目录/内容                         | 复核重点                        | 状态                                               |
| ---: | ---------- | ------------------------------------- | ------------------------------- | -------------------------------------------------- |
|    1 | 启动与配置 | 启动类、`config`、properties、Bean    | 生命周期、配置、依赖和环境      | 已完成：34/34，3949/3949 LOC                       |
|    2 | Web 入口   | `controller`、filter、interceptor     | HTTP、参数、校验、响应、异常    | 已完成：150/150，29713/29713 LOC                   |
|    3 | 业务层     | `service`、`service/impl`             | 接口、实现、事务和外部依赖      | 已完成：338/338，154161/154161 LOC                 |
|    4 | 数据访问   | `dao`、Mapper XML、`po`               | MyBatis、Wrapper、映射和分页    | 已完成：712/712，38330/38330 LOC，另核对 14 份 XML |
|    5 | 数据模型   | `dto`、`vo`、`bo`、`eo`               | 类型、校验、序列化和对象边界    | 已完成：1654/1654，58427/58427 LOC                 |
|    6 | 横切能力   | `aop`、自定义注解、异常、context      | AOP、反射、线程上下文和错误处理 | 已完成：40/40，1773/1773 LOC                       |
|    7 | 异步能力   | `timer`、listener、handler、WebSocket | 并发、调度、生命周期和重试      | 已完成：191/191，29485/29485 LOC                   |
|    8 | 基础设施   | cache、upload、storage、shard         | 缓存、文件、策略和拦截器        | 已完成：53/53，6175/6175 LOC                       |
|    9 | 通用代码   | util、enums、常量及其调用者           | 标准库、重复模式和错误候选      | 已完成：257/257，33715/33715 LOC                   |
|   10 | 测试       | `src/test` 全部 Java 文件             | 当前反馈环和缺失边界            | 已完成：7/7，1840/1840 LOC，46 个测试              |

每批完成后更新“文件数已复核 / 快照文件总数”。没有达到分母不能关闭批次。

第 1 批使用启动类和 `config/**/*.java` 的物理范围作为分母；目录中的 Web、数据访问、模型和异步
文件仍在本批完整复核，并由人工最终角色纠正。结构化台账把这 34 个路径覆盖为 `reviewed`，当前
第 2 批使用 126 个主 Controller、12 个顶层 Filter、3 个真实 MVC HandlerInterceptor 和 9 个
任务 HTTP 适配器作为物理分母。第 3 批使用 `service/**/*.java` 的连续库存索引 `1754..2091`
作为物理分母，并把 338 个文件区分为 148 个接口合同、182 个 Spring 托管类和 8 个普通支持类。
第 4 批使用 `dao/**/*.java` 和 `po/**/*.java` 的库存索引 `261..394`、`1174..1751` 作为 Java
分母，并把同目录 14 份 Mapper XML 作为独立哈希的支持证据；712 个 Java 文件被区分为 132 个
Mapper 接口、2 个托管持久化服务、128 个持久化模型、3 个普通数据对象和 447 个生成 XML 模型。
第 5 批使用 `bo/**/*.java`、`dto/**/*.java`、`eo/**/*.java` 和 `vo/**/*.java` 的库存索引
`19..65`、`402..684`、`847..1121`、`2374..3422` 作为物理分母；1654 个文件被区分为 8 种模型
形态，把 7 个误判为 `web-entry` 的查询条件对象纠正为 `data-model`，并登记 928 个文件级风险候选。
第 6 批使用 `annoation/**/*.java`、`aop/**/*.java`、`context/**/*.java`、
`exception/**/*.java` 和 `validator/**/*.java` 的库存索引 `2..18`、`124..134`、
`1122..1125`、`2366..2373` 作为物理分母；40 个文件被区分为 14 种横切职责形态，把 6 个应用
事件和 1 个发布器纠正为 `async-integration`，并登记 75 个文件级风险候选。角色名称不代表事件
已异步执行，实际模式取决于 `ApplicationEventMulticaster` 配置。前六批路径保持零重叠。
第 7 批从 `handler/**/*.java`、`listener/**/*.java`、`timer/**/*.java` 和 `ws/**/*.java` 扣除
前六批已复核路径，以库存索引 `1141..1143`、`1147..1173`、`2102..2114`、`2124..2270`、
`3423` 作为物理分母；191 个文件被区分为 24 种职责形态和 5 种最终角色，登记 113 个角色纠正与
264 个文件级风险候选。真实执行证据与目录或类名分开记录，前七批路径保持零重叠。
第 8 批使用缓存、下载、媒体、日志、分表、存储、上传和许可证兼容范围的库存索引 `66..83`、
`395..401`、`1126..1128`、`1752..1753`、`2092..2101`、`2271..2281`、`3426..3427`
作为物理分母；53 个文件被区分为 25 种职责形态和 4 种最终角色，登记 24 个角色纠正与 126 个
文件级风险候选。本批确认的是进程内启动缓存，没有 Redis 客户端实现证据，不能由 `cache` 包名
推断 Redis。前八批路径保持零重叠。
第 9 批使用 `constant/**/*.java`、`enums/**/*.java`、`util/**/*.java` 和 4 个历史兼容文件的库存
索引 `117..123`、`685..846`、`2282..2365`、`3424..3425`、`3428..3429` 作为物理分母；
257 个文件被区分为 59 种职责形态和 6 种最终角色，登记 77 个角色纠正与 378 个文件级风险候选。
其中 156 个文件是普通代码枚举，其余 101 个文件使用显式职责映射；旧密码学、硬编码秘密、全信任
TLS、原生反序列化和黑名单过滤只作为 legacy 纠错证据。前九批路径保持零重叠。当前总状态为
`reviewed=3429`、`unreviewed=7`、`reviewing=0`、`blocked=0`。
第 10 批使用 `src/test/**/*.java` 的连续库存索引 `3430..3436` 作为物理分母；7 个文件被区分为
7 种反馈环形态，共含 46 个测试方法、148 次显式断言和 19 个文件级生产入口，登记 20 个文件级
风险候选。十批累计状态为 `reviewed=3436`、`unreviewed=0`、`reviewing=0`、`blocked=0`。
Phase 1C 已完成。Phase 1D 五批已完成 Java 语言、标准库、框架、工程模式与风险反例归一化；
906 个原始输入已全部获得唯一归属，Phase 1 Gate 已通过。

### 9.4 能力归一化

同一知识点可能在数百个文件出现，只建立一个课程候选，并把多个项目证据挂到同一矩阵项。能力项
至少包含：

```text
capabilityId
name
kind
observedFiles
representativeSymbols
modernBaseline
legacyBaseline
prerequisites
recommendedStage
exampleStatus
researchStatus
courseStatus
```

第 1 批只处理明确属于 Java 语言语义的输入，批次 ID 为 `phase-1d-java-language`：

- 从十批人工复核台账和 7 个自动提取分片冻结 906 个唯一原始输入，保留 27731 条
  “原始输入 -> 项目文件”关联；
- 原始输入包含 550 个文件级能力候选、16 个语言信号、21 个框架信号和 319 个唯一风险说明；
- 40 个语言输入已归一化为 15 个 `JAVA-LANG-001..015` 能力，覆盖 3414 个唯一项目文件，登记
  74 个代表符号；
- 866 个输入保持 `pending`，留给标准库、框架、工程模式和风险反例批次，未因别名合并丢失文件
  证据；
- 15 个能力的 `researchStatus` 和 `exampleStatus` 均为 `not-started`，`courseStatus` 均为
  `candidate`；版本字段只冻结后续研究基线，不表示已经完成线上研究；
- 原始输入清单、结构化矩阵、Markdown 摘要和人工签核由
  [`phase-1d-java-language-manifest.json`](./audit/phase-1d-java-language-manifest.json) 绑定哈希。

第 2 批只处理具有明确 JDK 类型或 API 证据的标准库输入，批次 ID 为
`phase-1d-standard-library`：

- 以上一批全部 866 个 `pending` 输入和 20746 条文件关联为新分母，不改写第 1 批已签核产物；
- 112 个输入已归一化为 33 个 `JAVA-STDLIB-001..033` 能力，覆盖 580 个唯一项目文件，登记
  123 个代表符号；
- 5 个剩余语言信号 `concurrency`、`io`、`optional`、`reflection`、`stream-api` 已全部进入
  标准库能力，没有回填 `JAVA-LANG-*`；
- 754 个输入继续保持 `pending`：414 个文件级能力候选、21 个框架信号和 319 个风险说明；
- `URLConnection`、`SSL`、Spring 静态资源编码、纯 `synchronized`、`volatile`、默认方法和
  名实不符的 `ReentrantLock` 候选均未伪装成标准库能力；
- 33 个能力的研究、示例和课程编写状态均未启动；结构化矩阵、Markdown 摘要和人工签核由
  [`phase-1d-standard-library-manifest.json`](./audit/phase-1d-standard-library-manifest.json) 绑定哈希。

第 3 批只处理具有直接 import、注解或配置 API 证据的框架与第三方库输入，批次 ID 为 `phase-1d-framework`：

- 以上一批全部 754 个 `pending` 输入为新分母；保留 19471 条文件关联，不改写前两批已签核产物；
- 235 个输入已归一化为 34 个 `JAVA-FRAMEWORK-001..034` 能力，覆盖 3085 个唯一项目文件，登记 137 个代表符号；
- 21 个框架信号全部进入本批；200 个文件级能力候选与 319 个风险说明继续保持 `pending`；
- `Builder 模式` 的项目证据直接使用 Lombok `@Builder`，因此只归入 Lombok 能力；混合场景留给工程模式批次；
- 34 个能力的研究、示例和课程编写状态均未启动；manifest 绑定输入清单、结构化矩阵、Markdown 摘要和人工签核哈希。

第 4 批只处理经人工复核的文件级工程候选，批次 ID 为 `phase-1d-engineering-pattern`：

- 以上一批全部 519 个 `pending` 输入和 6665 条文件关联为新分母，不改写前三批已签核产物；
- 200 个工程候选已归一化为 38 个 `JAVA-ENGINEERING-001..038` 能力，覆盖 2742 个唯一项目
  文件并登记 179 个代表符号；
- 319 个风险说明全部继续保持 `pending`，没有伪装成推荐能力或提前形成拒绝模式；
- 服务定位器、共享状态、锁、敏感数据和 legacy 兼容只作为后续正确实践选题证据，不认可项目旧
  写法；
- 38 个能力的研究、示例和课程编写状态均未启动；manifest 绑定输入清单、结构化矩阵、Markdown
  摘要和人工签核哈希。

第 5 批只处理上一批保留的风险说明，批次 ID 为 `phase-1d-review-risk`：

- 以上一批全部 319 个 `pending` 风险输入和 3152 条文件关联为分母，不改写前四批已签核产物；
- 319 条风险已显式归一化为 47 个 `JAVA-RISK-001..047` 规范风险模式，覆盖 1568 个唯一项目
  文件并登记 225 个代表符号；
- 86 条未分类风险和 1 条多类别风险均得到唯一归属，旧 category 只作为候选证据，不决定最终目录；
- 五批分别归一化 `40 + 112 + 235 + 200 + 319 = 906` 个输入，全局 sourceId 重复、遗漏和额外
  映射均为 0；
- 风险模式统一标记为 `project-risk-evidence-only`，只用于后续正确实践、易错点和拒绝模式，不认可
  项目旧写法；研究、示例和课程编写状态均未启动；
- manifest 绑定输入清单、结构化矩阵、Markdown 摘要和人工签核哈希，独立 validator 不导入人工
  catalog，并重述全部 319 条来源映射。

Phase 1D 到此完成。下一阶段只允许进入 Phase 2“知识点与学习路径冻结”，不得提前编写课程正文
或实现前端平台。

### Gate 1

- [x] 当前 Java 文件参考总数为 3436（3429 个主代码文件和 7 个测试文件）；Gate 使用执行快照的
      两类真实分母并分别达到全覆盖；
- [x] 所有文件审计状态均为 `reviewed`，或有用户确认的明确 `blocked` 记录；
- [x] 所有唯一能力和风险反例已进入矩阵，没有仅凭包名推断的空项；906/906 个输入均有唯一归属；
- [x] 能力归一化正式证据中的其他 Maven 模块命中数为 0；
- [x] 五个归一化批次的最终统计、哈希、全局去重和抽查结果一致。

Gate 1 当前为 `passed`。这只允许进入 Phase 2 知识点与学习路径冻结，不表示线上研究、项目示例
改写或课程正文已经开始。

## 10. Phase 2：知识点与学习路径冻结

> 当前状态：Phase 2A 至 2E 的目录、映射、依赖图、来源计划和候选项目链已冻结；用户已明确确认
> Gate 2 为 `passed`。完整目录见
> [`course-coverage-matrix.md`](./audit/course-coverage-matrix.md)，机器事实源见
> [`course-coverage-matrix.json`](./audit/course-coverage-matrix.json)。

### 10.1 选择规则

候选知识点只有满足以下任一条件才进入课程：

1. `dzzz-app` 直接使用；
2. 是理解一个已使用能力不可绕过的前置知识；
3. 是项目旧写法迁移到现代正确用法必须理解的差异；
4. 是审计确认的高风险易错点、安全边界或验证方法。

以下内容不进入课程：

- 只出现于生成代码且没有学习价值的重复结构；
- 纯业务枚举值、表字段清单和第三方厂商协议细节；
- 无法从官方来源或可重复验证确认的猜测；
- 项目中的错误习惯本身；
- 与 `dzzz-app` 无关的“为了完整”补充。

### 10.2 深度等级

| 等级           | 适用条件                           | 内容要求                         |
| -------------- | ---------------------------------- | -------------------------------- |
| `lesson`       | 高频、前置性强或需要建立心智模型   | 完整知识点、示例、易错点、练习   |
| `reference`    | 需要检索，但不值得单独长课         | 定义、签名、版本、注意事项和链接 |
| `merged`       | 依附于另一个核心概念               | 合并进主课的小节                 |
| `project-only` | 只用于理解 `dzzz-app` 特定兼容实现 | 只作为课程补充或 Demo 候选证据   |
| `rejected`     | 错误、敏感、重复或无教学价值       | 只留审计记录                     |

### 10.3 最终课程目录摘要

| 区段     | 节点数 | 边界                                   |
| -------- | -----: | -------------------------------------- |
| 基础     |     18 | 从开发环境连续到 I/O、资源和 Maven     |
| 中级     |     17 | 数据合同、分层、测试、Spring 与持久化  |
| 高级     |     16 | 并发、集成、安全、可观测性和现代化迁移 |
| 参考     |      5 | 低频或 legacy 能力的独立检索条目       |
| 证据候选 |      8 | 只登记去敏调用链，不代表站内内容类型   |

共 64 个节点，其中 7 个是具有 `JAVA-PREREQ-001..007` 稳定身份的必要前置；114 条依赖边已经
通过 DAG、顺序和阶段单调校验。167 个 Phase 1 来源的唯一处置为：43 个 `lesson`、108 个
`merged`、6 个 `reference`、10 个 `project-only`、0 个 `rejected`。47 个风险项全部以
`project-risk-evidence-only` 合并为纠错或验证边界。

### Gate 2

- [x] 每个最终知识点都有能力矩阵 ID、项目证据或必要前置身份、阶段和前置关系；
- [x] 必要前置知识与“项目直接使用”明确区分；
- [x] 没有为了百科完整性加入的无证据课程；
- [x] 课程顺序能从零基础连续到项目调用链；
- [x] 用户明确确认冻结后的课程目录，才进入 Phase 3。

Gate 2 已由用户通过本次 Phase 3 执行请求明确确认为 `passed`。该确认只授权 Phase 3 平台能力，
不授权进入 Phase 4 的逐知识点研究或课程正文编写。

## 11. Phase 3：后端 Markdown 内容能力

### 目标

本阶段证明了 Markdown 可以接入课程 interface；后续全站迁移已将该能力收敛为前后端共用的
`common/markdown` adapter。

### 任务

1. [x] 建立后端 Java 的目录与模块入口；最终入口现由 Domain/Technology/Module manifest 提供。
2. [x] 增加 Java learning track 的 `basics`、`intermediate`、`advanced` 三阶段，并按冻结顺序登记
       18 / 17 / 16 个 `planned` 学习节点。
3. [x] 定义并校验后端 frontmatter，转换为现有 `ContentMeta`。
4. [x] 内容联合类型最终只保留 `lesson` 与 `reference`，旧第三类型及其字段已经删除。
5. [x] 使用结构化 Markdown parser 生成受控 AST 或 `ContentBlock[]`。
6. [x] 实现模板约定的 tip、warning、pitfalls、compare、exercise、steps、demo 和 interactive。
7. [x] 禁止未经清理的任意 HTML 和任意 Vue 模板执行。
8. [x] 在 Shiki 中按需增加 Java 语言，不改变现有语言行为。
9. [x] 让统一 Markdown loader 满足 `loadEntry(id)` interface。
10. [x] 保持目录、搜索、上一篇/下一篇、进度和详情布局对内容来源无感知。
11. [x] 移除系统学习入口对 `module: 'core'` 的固定假设，按生态选择可用默认模块，并为 `backend`
        提供明确的展示标识，使 Java 路线的推荐起点和继续学习状态可达。
12. [x] 在 catalog 初始化阶段校验已发布条目的 `prerequisites`、`related` 目标存在性，避免拼写错误
        在详情页被静默过滤。
13. [x] 使用 `?catalog-meta` 与 `?content-entry` 分离轻量元数据和正文模块，插件不接管裸 `.md`
        或 Vite 的其他 query。

### 最少测试

- [x] 一个 Markdown fixture 验证 frontmatter、正文和特殊内容块转换；
- [x] 一个 catalog 测试验证 TS 与 Markdown 条目可以通过稳定 ID 并存加载；
- [x] 一个错误 fixture 验证缺少来源或非法 HTML 时 fail closed；
- [x] 一个渲染测试验证 Java code block 和 pitfalls；
- [x] 一条目标路由 Playwright 验证真实 Markdown 的详情、目录、搜索和上一篇/下一篇；迁移期专用
      fixture 已在最终清理中删除；
- [x] 一条入口进度回归验证 Java 的推荐起点、继续学习或已完成状态，且 Vue 入口不回归。

### Gate 3

- [x] 当时现有 Vue 课程无需迁移且全量单测、全量 E2E 保持通过；该历史 Gate 不替代当前全站迁移；
- [x] Markdown 正文仍由现有内容块展示，不建立第二套详情页；
- [x] Java 高亮、来源、项目补充和易错点能正确显示；
- [x] 非法 frontmatter、未知 directive、未知资产 ID 和任意 HTML 明确失败；
- [x] `prerequisites`、`related` 的不存在目标在 catalog 初始化阶段明确失败；
- [x] Markdown 正文仅由 `?content-entry` query 加载，裸 `.md` 不归后端插件处理；
- [x] 当时的 E2E fixture 未进入普通 production 产物，并已在内容架构迁移后删除；
- [x] Phase 2 check、focused tests、type-check、全量单测、build、目标 Playwright 与全量 E2E 通过；
- [x] root lint 通过：修复 `codegraph-extractor.mjs` 的 `no-useless-escape`；
- [x] root format 通过：在 `.prettierignore` 中明确排除 Playwright 输出和既有生成 fixture；
- [x] root audit 通过：将 `brace-expansion` 从 `2.1.2` 更新到 `2.1.4`；
- [x] backend audit tooling 为 0 vulnerability，Git whitespace checks 通过，`dzzz-app` 保持只读。

Gate 3 当前为 `implementation-complete / gate3-passed`。三个原有 Spec finding、规范中文注释和
Shiki 版本一致性问题均已关闭；root lint、format、audit 门禁也已通过。本次只修改了明确归属
于课程能力和门禁配置的文件，未改写用户的 Playwright/output 产物。Standards 与 Spec 双轴复审
结论记录在
[`phase-3-markdown-capability-signoff.json`](./audit/reviews/phase-3-markdown-capability-signoff.json)。

## 12. Phase 4：逐知识点实施

截至 2026-08-05，Phase 4 已开始；第一课
`backend.java.learn.basics.development-environment-and-runtime` 已完成单课闭环并关闭。基础阶段其余
课程仍保持 planned，不据此宣布基础阶段完成。

### 单知识点闭环

每次只实施一个知识点：

1. 从冻结矩阵领取一个 `courseStatus: planned` 项。
2. 冻结 ID、阶段、前置课程、现代版本、项目版本和项目证据。
3. 创建 `docs/research/backend/java/.../<topic>.md`。
4. 按来源规范完成官方查询、易错点取证和版本差异。
5. 先写现代最小正确示例，并建立可重复验证。
6. 再写 `dzzz-app` 项目补充；原实现错误时标记 `corrected`。
7. 使用统一模板创建课程 Markdown。
8. 只在 `/tmp` 的 `mktemp` 目录创建覆盖本知识点的最少临时反馈环或编译 fixture，验证后删除。
9. 登记 manifest、前后课程和搜索元数据。
10. 运行同一反馈环、格式检查和目标页面验证。
11. 更新能力矩阵与课程覆盖矩阵，关闭该知识点后再领取下一项。

### 每课 Gate

本节只规定单课实施顺序和跨文档验收；字段、章节和来源细则分别以统一模板的 Authoring Gate 与来源
规范的发布 Gate 为准。

- [ ] 现代稳定版本先讲，项目旧版补充在后。
- [ ] 关键结论与直接来源、版本和日期绑定。
- [ ] 项目证据只来自 `dzzz-app`。
- [ ] 现代与旧版示例均通过对应反馈环，或明确说明不可运行边界。
- [ ] 错误项目写法没有进入推荐示例。
- [ ] 易错点具备原因、后果、修正和验证方式。
- [ ] 方法定义具有规范中文注释。
- [ ] 课程没有真实密钥、内网地址和敏感业务数据。
- [ ] 前置关系、搜索、进度和前后课程正确。
- [ ] 临时反馈环、type-check、lint 和 format 通过，且仓库内无新增测试资产。

### 阶段顺序

严格按以下顺序推进：

```text
基础课程全部关闭
  -> 中级课程全部关闭
    -> 高级课程全部关闭
      -> Reference 索引收口
```

不能因为某个高级框架知识点项目证据丰富，就跳过零基础前置课程。

## 13. Phase 5：Reference 覆盖

为项目中需要频繁检索但不适合重复长课的注解、接口和配置建立 reference 条目。参考覆盖追求可搜索
和可追溯，不要求每个低频注解都有一篇独立长文。

### Gate 5

- reference 索引覆盖能力矩阵中的全部可检索项；
- 课程覆盖矩阵中不存在无处归属的已确认能力。

## 14. 验证策略

### 14.1 文档阶段

Phase 0 当时只新增三份 Markdown 文档，使用以下命令验证；该命令保留为历史 Gate，不代表当前全站
架构文档或迁移计划的完整验证范围：

```bash
npx prettier --check \
  docs/backend/research-source-standard.md \
  docs/backend/knowledge-point-template.md \
  docs/backend/java/dzzz-app-course-plan.md
```

### 14.2 平台阶段

```bash
npm run type-check
npm run lint
npm run format:check
npm run build
```

只在 `/tmp` 的 `mktemp` 目录创建覆盖 Markdown adapter、catalog 并存和目标课程路由的最少临时反馈环。
页面验证使用一次性可重复浏览器脚本；不以截图代替内容和行为断言，完成后删除临时目录。

### 14.3 内容阶段

- Java 现代示例使用课程现代基线编译或临时行为检查；
- 项目补充使用 Java 8 和精确旧框架临时 fixture 验证；
- 纯片段无法独立运行时，必须说明外部上下文，并验证包含它的最小类；
- 安全课程增加负向输入；
- 并发、事务和缓存课程验证可观察结果，不只断言内部调用；
- 性能课程记录 JFR/JMH 环境和原始结果。

## 15. 风险与控制

| 风险                           | 控制                                                                      |
| ------------------------------ | ------------------------------------------------------------------------- |
| 3436 个 Java 文件导致漏审      | 分别冻结 3429 个主代码文件和 7 个测试文件的分母、状态、批次计数和哈希抽查 |
| CodeGraph 命中其他模块同名代码 | 每次验证 `dzzz-app/` 路径，非目标模块命中为 0                             |
| 项目旧写法被误教               | 项目只做证据，示例必须 `adapted`/`corrected`                              |
| 现代版本持续变化               | 每个知识点记录 `verifiedAt`，每批重查官方稳定线                           |
| 官方文档与项目依赖不匹配       | 现代和 legacy 两套精确来源，不跨版本推断                                  |
| 业务代码或配置泄露             | 最小改写、去敏检查、禁止密钥和内网数据                                    |
| Markdown 形成第二套页面        | 前后端统一 adapter 与内容接口                                             |
| 自定义 Markdown 可执行任意内容 | 受控 AST、directive allowlist、非法输入 fail closed                       |
| 课程为了完整无限扩张           | 只收录项目能力、必要前置和确认的迁移/风险知识                             |
| 项目测试稀少导致示例无证据     | 为课程示例建立独立的最小编译/测试反馈环                                   |

## 16. 当前 Stop Boundary

Phase 4 已开始，第一课 `backend.java.learn.basics.development-environment-and-runtime` 已完成并通过
单课 Gate。全站内容架构迁移已经完成，但本计划尚未授权第二课。

当前明确不做：

- 不开始第二课“包、import 与源码目录”；
- 不修改其余 50 个 planned 学习节点；
- 不进入 Phase 5 Reference 覆盖；
- 不修改 `/Users/jian/Desktop/work/TDH/dzzz`；
- 不暂存、提交或推送代码。

下一后端内容批次仍需重新确认 Java 第二课的范围与 Gate，不由架构迁移自动开始。
