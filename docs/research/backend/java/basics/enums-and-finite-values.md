# 枚举与有限值建模研究记录

## 冻结课程合同

- `batch`：`B-09`
- `courseId`：`backend.java.learn.basics.enums-and-finite-values`
- `title`：枚举与有限值建模
- `nature`：必修
- `estimatedMinutes`：`60`
- `purpose / collection / level / depth`：`learn / basics / beginner / lesson`
- `sequence`：`180`
- 唯一前置：B-08 `backend.java.learn.basics.interfaces-inheritance-and-polymorphism`
- `related`：`[]`
- `sourceCapabilityIds`：`[JAVA-LANG-005]`
- `origin`：`[project-observed]`
- `selectionReason`：项目包含大量枚举和状态值；课程只教类型化有限值，不复制业务枚举清单。
- `projectEvidenceCount`：`162`
- `modernBaseline`：`Java 25 LTS`
- `legacyBaseline`：`Java 8 legacy supplement only`
- `verifiedAt`：`2026-08-14`
- Phase 2 冻结状态：`researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`
- `snapshotId`：`dzzz-app-20260803-179e722831ab`
- `analysisId`：`dzzz-app-analysis-20260803-958d37cf1be1`

Phase A live 冻结明确要求复用上述稳定 ID、标题和必修性质，并把本课调整为 60 分钟、唯一前置 B-08。
本研究稿不改变 URL、稳定 ID、B-09 状态或历史 signoff；浏览器首次验收发现既有导航仍把旧顺序作为下一篇，
因此本批仅在既有 track 与 loader 中同步 Phase A 已冻结的相邻顺序，使 B-09 的下一篇为 B-10。
该同步不读取或改变 B-10 的研究、正文、课程状态或 loader 语义，也不预登记 B-11。

本课只覆盖封闭有限值集合、枚举常量、字段、构造器、实例方法、`values()`、`valueOf()`、`name()`、
`toString()`、`ordinal()` 的边界，以及稳定外部 code 的最小建模方式。注解、异常体系、泛型展开、
`EnumSet`、`EnumMap`、反射、序列化框架映射和状态机属于后续课程。

本批关闭必须同时满足：

- 冻结 5 个相互独立的零基础知识点，每点完整回答“是什么、作用、场景、怎么用、最小示例、运行结果、
  常见误区”。
- 冻结恰好 5 步从零实践。
- 正文只包含一个 `lang: bash`、`meta: b09-feedback-loop` 的可执行反馈节点。
- 固定 Temurin 25/8 digest，校验实际 `javac` 版本、共享输出、可变枚举风险和非法公开构造器。
- 所有源码、class 与日志只进入容器临时目录，并由 `find -depth -delete` 清理。

## 核验基线

| 项目 | 核验结果 |
| --- | --- |
| 核验日期 | 2026-08-14 |
| 现代主线 | Java 25 LTS；OpenJDK JDK 25 已 GA |
| legacy 补充 | Java 8；Spring Boot 2.3.12.RELEASE 只作项目背景 |
| 发现方式 | Tavily 搜索 Oracle、OpenJDK 与 Dev.java 官方域名，只把结果当作直接页面入口 |
| 最终证据 | JLS 25/8、Java SE 25/8 `Enum` API、OpenJDK、Oracle Roadmap 与 Dev.java 正文 |
| 项目证据 | 冻结 inventory 中五个代表文件及其既有 SHA-256 保持只读证据边界 |
| 验证环境 | 固定 Eclipse Temurin 25 与 8 Docker 镜像 |

Tavily 发现结果同时包含旧版 Java Tutorials、旧 JLS 和非目标版本 API；最终只采用下表中的直接官方
正文。2026-08-14 重新直连 7 个 URL 均成功；OpenJDK 页面需正常浏览器 User-Agent。搜索摘要、
社区文章和 AI 输出均未进入来源卡。

## 官方来源卡与直接证据

以下页面均在 `2026-08-14` 直接核验：

| 结论 | 直接来源 | 页内范围 | 适用版本 | 验证设计 |
| --- | --- | --- | --- | --- |
| Java 25 已 GA，并被 Oracle 列为 LTS | [OpenJDK JDK 25](https://openjdk.org/projects/jdk/25/)、[Oracle Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) | 发布状态、LTS 列表 | Java 25 | 固定 Java 25 容器身份 |
| 枚举类定义一组命名实例；常量是该枚举类的实例，且对应隐式 `public static final` 字段 | [JLS 25 §8.9](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html) | §8.9、§8.9.1、§8.9.3 | Java 25 | 常量身份与 `values()` 行为 |
| 枚举可声明字段、构造器和方法；不能由调用方显式创建额外实例 | [JLS 25 §8.9.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html) | enum body declarations | Java 25 | 正向构造与非法公开构造器负向编译 |
| 每个枚举隐式拥有按声明顺序返回常量的 `values()` 与按精确名称查找的 `valueOf(String)` | [JLS 25 §8.9.3](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html) | enum members | Java 25 | 数组隔离、精确名称与非法名称 |
| `name()` 返回声明名称；`ordinal()` 只是声明位置，主要供 `EnumSet`、`EnumMap` 等设施使用 | [Java SE 25 `Enum`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Enum.html) | `name()`、`ordinal()`、`valueOf()` | Java 25 | 名称、顺序与非法查找反馈 |
| Java 8 已具有相同的枚举常量、成员、`values()`、精确 `valueOf()` 核心合同 | [JLS 8 §8.9](https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html)、[Java SE 8 `Enum`](https://docs.oracle.com/javase/8/docs/api/java/lang/Enum.html) | §8.9、`Enum` methods | Java 8 | 同一源码在 Java 8 编译运行 |
| 枚举适合固定少量可能值；变更常量名称或顺序会影响依赖旧值的代码和持久化数据 | [Dev.java Enums](https://dev.java/learn/classes-objects/enums) | What are enums、Special methods、Precautions | 当前 Dev.java | 稳定外部 code 与名称/顺序解耦 |

## 现代心智模型与课程取舍

### 枚举是封闭实例集合，不是字符串常量袋

`enum` 声明创建一个受限的类。每个常量都是该类预先声明的实例，调用方不能通过 `new` 增加第六种
状态。这让方法参数和返回值直接表达“只能是这些值之一”，编译器也能阻止任意字符串混入。

课程示例使用三个订单状态，每个常量携带 `private final` 的稳定外部 code 和展示文本。字段只在枚举
构造过程中赋值，不记录请求次数、当前用户或重试次数等运行期状态。

### 名称、展示文本和外部 code 是三个合同

- `name()` 是源码声明的精确常量名，适合需要精确声明身份的内部场景。
- `toString()` 默认返回名称但可以被覆写，不作为协议或数据库合同。
- `ordinal()` 由声明位置决定，插入或重排常量就会变化，不用于持久化或网络传输。
- 外部系统需要稳定值时使用显式 `code` 字段，并通过受控方法解析。

“外部 code 与常量名分离”是工程建议，不是 JLS 强制规则。适用条件是值会进入数据库、消息、配置或
外部 API；只在单一进程内比较枚举身份时不必额外发明 code。

### 查找失败必须具有明确语义

隐式 `valueOf(String)` 只接受精确常量名，未知值抛出 `IllegalArgumentException`。课程自定义
`fromCode` 同样在未知 code 时立即抛出明确异常，不返回 `null`，也不在本课提前引入后续标准库课程的
`Optional`。受控 `UNKNOWN` 只适合业务合同明确把未知值定义为合法有限值的场景，不能作为吞掉错误的
默认分支。

### `values()` 返回数组不等于枚举本身可变

调用方可以改写自己拿到的数组元素，但不能改写枚举常量集合。反馈环会改写第一次 `values()` 的结果，
再确认下一次调用仍按声明顺序返回完整常量。代码不依赖两个数组对象的引用身份。

## `dzzz-app` 冻结证据

外部仓库 `HEAD` 为 `167ca8aa91ca3a6b101246964ef4fddec3d21da0`，
`git status --short -- dzzz-app` 为空。矩阵的五个代表文件与 inventory、当前源码逐项匹配：

| 文件与符号 | 冻结 SHA-256 | 状态 | 可支持的结论 | 不支持的结论 |
| --- | --- | --- | --- | --- |
| `dzzz-app/src/main/java/com/tdh/bdzz/enums/AJFL.java` / `com.tdh.bdzz.enums.AJFL` | `bdfe5fa9885bb90549f133c309260ea355f83d53f42ee2d0576c3f07009549c2` | `corrected` | 枚举常量可携带不可变文本和值字段，并通过 `values()` 遍历 | 未命中返回 `null` 是推荐失败语义 |
| `dzzz-app/src/main/java/com/tdh/bdzz/enums/IEnum.java` / `com.tdh.bdzz.enums.IEnum` | `a396a9a4a41dbd2137d1e01a0e747581e976b0d9c1636db9f18eea9a8f7f9dcb` | `observed` | 项目用统一合同暴露枚举值与说明 | 该泛型接口的全部设计、序列化边界或命名是现代推荐实践 |
| `dzzz-app/src/main/java/com/tdh/bdzz/enums/BjmMs.java` / `com.tdh.bdzz.enums.BjmMs` | `f3a4a202aa3619f4447811bc2cb7acb8a253bbb00e5a57e361bfac8fb0476ca9` | `corrected` | 多个常量可共享不可变字段和查找行为 | 未命中返回 `null` 是推荐实践 |
| `dzzz-app/src/main/java/com/tdh/bdzz/enums/AymsJc.java` / `com.tdh.bdzz.enums.AymsJc` | `fc2fc184c713af9f37a92aad2b53d8af2926ca72b0562d2ef780ef365e56bdef` | `rejected` | 只证明项目存在带字段和查找方法的枚举 | 可变字段、宽松文本包含匹配和 `null` 返回均不进入推荐示例 |
| `dzzz-app/src/main/java/com/tdh/bdzz/enums/vidyo/common/VidyoDataCommon.java` / `com.tdh.bdzz.enums.vidyo.common.VidyoDataCommon` | `5a44eb3e478e19a1fa53fca510229760456cc1b714f097c26b6d90b9be78bfeb` | `rejected` | 只证明旧代码中存在嵌套枚举 | 凭证式常量、反编译结构、共享可变状态和可变枚举字段全部排除 |

CodeGraph 同时命中 `dzzz-quartz`、`dzzzLicenseTool` 等其他 Maven 模块的同名枚举，均按物理路径排除。
课程不复制业务枚举常量、业务文本、凭证式值或反编译代码，不修改或运行 `dzzz-app`。

## 易错点研究

### 用 `ordinal()` 持久化或传输

- 触发条件：把 `ordinal()` 写入数据库、消息或接口。
- 原因：ordinal 只是声明位置，重排或插入常量会改变数字含义。
- 后果：旧数据被解释为另一种状态，且类型系统无法发现。
- 修正：使用独立、明确、稳定的外部 code。
- 版本：Java 25 / Java 8。
- 验证：反馈环只观察 ordinal，不把它作为解析输入；课程示例用 `code()` 往返。

### 对外部 code 直接调用 `valueOf()`

- 触发条件：外部系统传入 `A`，代码却调用 `OrderState.valueOf("A")`。
- 原因：`valueOf()` 匹配的是精确常量名，不是自定义 code 或展示文本。
- 后果：合法业务 code 被拒绝；大小写、空白或重命名也会造成运行时异常。
- 修正：只在输入合同就是声明名时使用 `valueOf()`；外部 code 使用 `fromCode()`。
- 版本：Java 25 / Java 8。
- 验证：`valueOf("PAID")` 成功，`valueOf("paid")` 与非法 code 按预期失败。

### 查找未命中返回 `null`

- 触发条件：遍历 `values()` 后直接 `return null`。
- 原因：失败从解析边界泄漏到后续调用方。
- 后果：错误延迟为距离输入更远的 `NullPointerException`，上下文丢失。
- 修正：在边界立即抛出带领域上下文的 `IllegalArgumentException`；只有合法缺失才考虑后续课程的
  `Optional`。
- 版本：Java 25 / Java 8。
- 验证：非法 code 在 `fromCode()` 处抛出预期异常。

### 在枚举实例中保存运行期可变状态

- 触发条件：枚举字段记录请求次数、当前用户或最近一次时间，并由实例方法递增或覆盖。
- 原因：同一常量实例在进程内被所有调用方共享。
- 后果：请求间状态串扰，并发读写产生竞态，测试相互污染。
- 修正：枚举只保存构造期不可变元数据；运行期状态放入普通对象或明确所有权的服务。
- 版本：Java 25 / Java 8。
- 验证：负向行为例确认两个引用观察到同一递增值。

## 临时反馈环设计

正文只能有一个带 `b09-feedback-loop` 元数据的 Bash AST 节点。所有验证资产只进入容器内 `/tmp` 的
`mktemp -d` 目录，并由 `find -depth -delete` 清理：

1. Java 25 与 Java 8 编译运行同一枚举，验证稳定 code、展示文本、`name()`、`values()` 顺序与数组隔离。
2. 两个版本都验证 `valueOf()` 精确匹配，错误大小写抛出 `IllegalArgumentException`。
3. 两个版本都验证自定义 `fromCode()` 正向与非法 code 失败语义。
4. 两个版本都拒绝带 `public` 枚举构造器的负向源码。
5. 两个版本都运行可变枚举反例，精确输出 `1|1`，证明状态由同一常量实例共享。

两个版本分别输出版本、共享正向、可变状态风险和非法构造器拒绝标记，外层最终输出
`B09_FEEDBACK_PASS`，合计 9 个唯一 `B09_` 标记。

课程反馈环中的每个 Java 构造器和方法定义上方都提供规范中文注释。研究记录只冻结验证合同，不把
尚未执行的命令写成已通过。

## 被排除或尚未证实的说法

- B-09 关闭前不讲 B-10 异常课程，也不读取或修改其研究、正文、课程状态或 loader 语义；本批仅同步既有清单顺序，
  让 B-09 的下一篇指向 B-10。
- 不讲异常体系、泛型细节、集合、`EnumSet`、`EnumMap`、反射、JSON/JPA/MyBatis 枚举映射或状态机。
- 不把 `ordinal()` 描述为稳定业务编号，不把 `toString()` 描述为持久化合同。
- 不复制 `dzzz-app` 的业务枚举清单、宽松包含匹配、空返回、共享可变状态或凭证式常量。
- 不进入标准库、中级、高级、Reference 或项目实战。

## 官方来源清单

- [OpenJDK JDK 25](https://openjdk.org/projects/jdk/25/)
- [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html)
- [JLS 25 Chapter 8 - Enum Classes](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html)
- [Enum - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Enum.html)
- [Dev.java Enums](https://dev.java/learn/classes-objects/enums)
- [JLS 8 Chapter 8 - Enum Types](https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html)
- [Enum - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/lang/Enum.html)

## Stop Boundary

本研究记录只授权第九批 `enums-and-finite-values`。只有本课研究、正文、Java 25/8 反馈环、catalog、
搜索、进度、浏览器、完整 Gate、signoff 及 Standards / Spec 审查全部通过后，才可宣布第九批关闭。
关闭前不得读取或启动 B-10；关闭后才可按 Phase A 冻结路线进入 B-10，不得越过 B-10 读取或启动
后续课程，也不进入 Reference 或项目实战。
