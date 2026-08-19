# 日期时间、时区与 legacy Date 映射研究记录

## 冻结课程合同

- `courseId`：`backend.java.learn.basics.date-time-and-time-zones`
- `title`：日期时间、时区与 legacy Date 映射
- `purpose / collection / level / depth`：`learn / basics / beginner / lesson`
- `sequence`：`250`
- `prerequisites`：`[backend.java.learn.basics.null-optional-and-failure-semantics]`
- `related`：`[]`
- `sourceCapabilityIds`：`[JAVA-STDLIB-010, JAVA-STDLIB-011, JAVA-STDLIB-012]`
- `origin`：`[legacy-migration, project-observed]`
- `selectionReason`：项目使用传统日期 API；主线先教 java.time，再建立 Java 8 与旧 Date 的迁移边界。
- `projectEvidenceCount`：`JAVA-STDLIB-010: 5`、`JAVA-STDLIB-011: 2`、
  `JAVA-STDLIB-012: 2`
- `modernBaseline`：`Java 25 LTS`
- `legacyBaseline`：`Java 8`，只作冻结项目补充
- Phase 2 冻结状态：`researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`
- `snapshotId`：`dzzz-app-20260803-179e722831ab`
- `analysisId`：`dzzz-app-analysis-20260803-958d37cf1be1`

本课只建立时间线、日历值、区域时区、格式化解析、可测试时钟与 legacy 迁移合同。任务调度、数据库
字段映射、HTTP 日期头、国际历法与框架序列化不在本课展开。

## 核验基线

| 项目 | 核验结果 |
| --- | --- |
| 核验日期 | 2026-08-15 |
| 现代主线 | Java 25 LTS |
| legacy 补充 | Java 8；java.time 的本课核心已在 Java 8 提供 |
| 发现方式 | Tavily 用于发现并提取 Oracle 与 Dev.java 直接页面；搜索摘要不作最终依据 |
| 最终证据 | Java 25/8 java.time、Date、Calendar、TimeZone、SimpleDateFormat API 与 Dev.java 直接页面 |
| 项目证据 | 只读取冻结矩阵与 inventory，不读取、运行或修改 `dzzz-app` 当前源码 |
| 验证边界 | Java 25/8 共同反馈环；固定 Clock、DST gap/overlap、严格解析与 Date 往返 |

## 一手来源与结论

### 1. 先区分机器时间和人类日历时间

- [Java 25 java.time](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/package-summary.html)
  与 [Java 8 java.time](https://docs.oracle.com/javase/8/docs/api/java/time/package-summary.html) 都把
  `Instant`、`LocalDate`、`LocalTime`、`LocalDateTime` 和 `ZonedDateTime` 分成不同类型，并说明这些
  主类不可变且线程安全。
- `Instant` 表示时间线上的点，适合事件时间戳、排序和持久化的中立时间值。
- `LocalDate` 只有日期；`LocalTime` 只有时间；`LocalDateTime` 同时有日期和时间，但仍没有 offset 或
  zone。它们不能在缺少额外规则时唯一确定 Instant。
- `ZonedDateTime` 由 local date-time、`ZoneId` 和已解析的 `ZoneOffset` 共同确定，可映射到时间线。

### 2. 区域时区是规则，不只是固定偏移

- [Java 25 ZoneId](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/ZoneId.html) 和
  [Java 8 ZoneId](https://docs.oracle.com/javase/8/docs/api/java/time/ZoneId.html) 区分固定 offset 与区域
  ID。`Asia/Shanghai`、`Europe/Paris` 这类区域 ID 通过 ZoneRules 为不同 Instant 解析 offset。
- 固定 `+08:00` 只表达一个 offset，不包含历史或未来规则；需要按地区规则解释本地时间时应保存
  `ZoneId`，不能把当前 offset 当作区域时区的永久替代。
- `ZoneId.systemDefault()` 会查询可变化的系统默认时区。协议、存储和测试边界应显式传入 ZoneId，
  不让部署环境静默改写结果。

### 3. DST gap 和 overlap 必须成为可观察边界

- [Java 25 ZonedDateTime](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/ZonedDateTime.html)
  和 [Java 8 ZonedDateTime](https://docs.oracle.com/javase/8/docs/api/java/time/ZonedDateTime.html) 说明：
  常规 local date-time 只有一个有效 offset；时钟前拨的 gap 没有有效 offset；时钟回拨的 overlap 有
  两个有效 offset。
- `LocalDateTime.atZone(zone)` 在 gap 中会把本地时间向前调整 gap 长度，在 overlap 中默认选择较早
  offset。若业务必须拒绝歧义，应先查询 zone rules 或使用 `ZonedDateTime.ofStrict`。
- 同一 Instant 转到不同时区仍是同一时间线点，只是显示的本地日期时间和 offset 不同；同一个
  LocalDateTime 放进不同时区通常会得到不同 Instant。

### 4. 格式化器应固定 pattern、Locale、Zone 与解析严格度

- [Java 25 DateTimeFormatter](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/format/DateTimeFormatter.html)
  与 [Java 8 DateTimeFormatter](https://docs.oracle.com/javase/8/docs/api/java/time/format/DateTimeFormatter.html)
  都说明 formatter 不可变且线程安全。
- `DateTimeFormatter.ISO_INSTANT` 等预定义 formatter 适合协议化输出；自定义 pattern 必须同时确认
  Locale、Zone 和 `ResolverStyle`。
- 严格公历年份使用 `uuuu`。`yyyy` 是 year-of-era；在严格解析中缺少 era 时可能无法解析成
  `LocalDate`。课程使用 `uuuu-MM-dd`，并通过 `ResolverStyle.STRICT` 拒绝 2025-02-29。
- 解析字符串不等于获得 Instant。没有 offset/zone 的文本只能先得到 local value，再由显式规则映射。

### 5. 当前时间通过 Clock 注入

- [Java 25 Clock](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/Clock.html) 与
  [Java 8 Clock](https://docs.oracle.com/javase/8/docs/api/java/time/Clock.html) 都提供 `fixed`，官方直接
  将其主要用途描述为让测试不依赖当前时钟。
- 业务方法接收 Clock 后可调用 `Instant.now(clock)` 或 `LocalDate.now(clock)`；生产传系统时钟，反馈
  环传固定时钟。这样无需睡眠、修改系统时间或放宽断言。
- 需要当前 Instant 时优先使用 `Clock.systemUTC()`；本地日历值必须使用业务明确的 ZoneId。

### 6. legacy Date 能映射 Instant，Calendar 和格式化状态需隔离

- [Java 25 Date](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Date.html) 与
  [Java 8 Date](https://docs.oracle.com/javase/8/docs/api/java/util/Date.html) 提供 `toInstant()` 和
  `Date.from(instant)`。Date 精度为毫秒，Instant 可到纳秒；Instant 转 Date 会截断多余精度。
- Calendar 的 `toInstant()` 保持同一时间线点，但 Calendar 本身还携带可变的时区、宽松解析与周规则
  状态。迁移边界应尽快转换为 java.time 类型，不传播共享可变 Calendar。
- [Java 25 SimpleDateFormat](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/text/SimpleDateFormat.html)
  明确说明 date formats 不同步，多线程共享必须外部同步；API note 推荐不可变且线程安全的
  DateTimeFormatter。
- legacy 格式化若暂时保留，应每次创建独立实例并显式设置 Locale、TimeZone 和 lenient=false；新代码
  主线使用 DateTimeFormatter。

### 7. Dev.java 的概念分层与迁移建议一致

- [Dev.java Date Time API](https://dev.java/learn/date-time) 把 LocalDate/LocalDateTime、带 zone/offset
  的类型、Instant、格式化解析、Period/Duration、Clock 和 legacy 迁移分开讲解。
- 本课沿用其“先选概念，再选类型”的顺序，但不展开 Period、Duration、非 ISO 历法和 temporal
  adjuster，避免基础课程膨胀。

## 课程内容决策

1. 用类型选择表先区分 Instant、LocalDate、LocalDateTime、OffsetDateTime 与 ZonedDateTime。
2. 默认以 Instant 表示已经发生的事件，以显式 ZoneId 负责显示或业务日历解释。
3. 不依赖 `systemDefault()`，除非“跟随当前机器设置”本身就是明确需求。
4. 固定验证 `Europe/Paris` 2025-03-30 的 DST gap 与 2025-10-26 的 overlap。
5. 自定义日期解析使用 `uuuu-MM-dd` + `ResolverStyle.STRICT`，同时验证闰日正负路径。
6. Date 迁移只证明同一时间线点和毫秒精度，不把 Calendar/SimpleDateFormat 写成推荐主线。
7. 使用 `Clock.fixed` 代替真实时间等待。

## 项目证据边界

以下 5 项只覆盖冻结矩阵中的 legacy Date、java.time 和 Locale/时区能力，不复制业务代码：

| 能力 | 文件 | SHA-256 | 使用方式 |
| --- | --- | --- | --- |
| legacy Date/格式化 | `dzzz-app/src/main/java/com/tdh/bdzz/util/GenAuthorization.java` | `79ebf095a63f1c1a97573d32ebbf93d234247298cfdc793f038b962e58d1bd7c` | observed |
| legacy + java.time | `dzzz-app/src/main/java/com/tdh/bdzz/util/CompareDateUtils.java` | `3780b737f374adcf4b507075e14b035c3740b4a2e2fc3eaa0a3f44ffd849ca68` | observed |
| legacy + java.time | `dzzz-app/src/main/java/com/tdh/bdzz/util/DateUtil.java` | `15d3d7fe6df96c1b39b2d5c031e1dfe1ac61bb5c55f7f113bd9dc91c22f8f79d` | observed |
| GMT/时区 | `dzzz-app/src/main/java/com/tdh/bdzz/config/HeaderRequestInterceptor.java` | `c196b496017b54c8ebe172492bfbbb15505babb1cf1520a16f039167f392d86c` | observed |
| Locale | `dzzz-app/src/main/java/com/tdh/bdzz/config/AppStarter.java` | `9e0147da7946cf71b41e535bbf3d113b23a5b41328ee42637557ad2016f48a4e` | observed |

`JAVA-STDLIB-010/011/012` 的计数分别为 5、2、2，文件集合存在重叠，不能相加成 9 个唯一文件。五项
证据均保持 `observed`；本批没有读取当前源码，也不判断其中格式化器是否共享或迁移是否正确。

## 易错点取证

| 易错点 | 官方依据 | 反馈要求 |
| --- | --- | --- |
| 用 LocalDateTime 表示唯一事件 | java.time package 类型定义 | 同一 local value 在两时区得到不同 Instant |
| 把固定 offset 当区域时区 | ZoneId fixed/region 区分 | Paris 夏冬 offset 不同 |
| 忽略 DST gap/overlap | ZonedDateTime 解析规则 | gap 前移、overlap 两个有效 offset |
| 使用 `yyyy` 做严格公历解析 | DateTimeFormatter 字段与 resolver | 使用 `uuuu`，拒绝非法闰日 |
| 直接调用 now() 导致测试漂移 | Clock.fixed 合同 | 双版本固定输出 |
| 多线程共享 SimpleDateFormat | SimpleDateFormat synchronization | 主线替换为 DateTimeFormatter |
| 假设 Date 保留纳秒 | Date.from 精度合同 | 往返只比较毫秒精度 |

## 验证设计

- Java 25 与 Java 8 编译运行同一份源码，证明本课 java.time 核心不依赖新版 API。
- 固定 Clock 为 `2025-03-30T00:30:00Z`，ZoneId 使用 `Europe/Paris` 与 `Asia/Shanghai`。
- 断言 Paris gap `2025-03-30T02:30` 被调整到 03:30；overlap
  `2025-10-26T02:30` 有两个有效 offset。
- 严格解析接受 `2024-02-29`，拒绝 `2025-02-29`。
- Date/Instant 往返使用毫秒对齐 Instant；另行证明纳秒会被截断。
- 所有临时源码与 class 只进入 `/tmp` 的 `mktemp` 目录，并用 `find -depth -delete` 清理。

## 排除项

- 不展开调度、cron、数据库 timestamp、JDBC、JSON 或 HTTP 日期序列化。
- 不推断 Spring Boot 默认时区或容器部署时区。
- 不使用真实 sleep 验证当前时间。
- 不把 SimpleDateFormat、Calendar 或三字母时区 ID 作为现代推荐。
- 不读取、运行或修改当前 `dzzz-app` 源码。
