---
id: backend.java.learn.basics.date-time-and-time-zones
type: lesson
title: 日期与时间
summary: 用 java.time 为 TeamFlow 区分截止日期、本地计划和事件时刻，并正确处理格式、时区与时间量
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 115
prerequisites:
  - backend.java.learn.basics.comparable-and-comparator
objectives:
  - 能根据业务含义选择 LocalDate、LocalTime、LocalDateTime、Instant 或 ZonedDateTime。
  - 能解释 LocalDateTime 为什么不能单独表示时间线上的唯一事件。
  - 能使用显式 ZoneId 在本地时间、地区规则与 Instant 之间转换。
  - 能使用 DateTimeFormatter 和严格解析规则处理固定格式的日期时间文本。
  - 能区分 Duration 的固定经过时间与 Period 的日历时间。
  - 能识别 DST gap、overlap、默认时区和格式字母大小写带来的常见错误，并显式处理歧义本地时间。
  - 能分别运行 JDK 25 与 Java 8 的完整 TeamFlow 日期时间程序和练习参考实现。
recap:
  - LocalDate、LocalTime 和 LocalDateTime 保存日历或钟表字段，不自带地区规则。
  - Instant 表示时间线上的唯一时刻，ZonedDateTime 同时包含本地字段、ZoneId 和解析出的 offset。
  - DateTimeFormatter 的模式字母区分大小写，外部文本应固定 Locale 并按合同选择严格解析。
  - Duration 表示固定秒数和纳秒数，Period 表示日历年、月、日，跨夏令时不能混用。
  - Period.getDays 只是 days 分量；需要两个日期之间的总天数时可以使用 ChronoUnit.DAYS.between。
  - 本地时间在 gap 中没有有效 offset，应拒绝创建计划；在 overlap 中应按业务规则显式选择 offset。
  - java.time 的本课核心类型在 JDK 25 与 Java 8 中都可使用，完整示例采用两版共有 API。
related: []
tags:
  - Java
  - java.time
  - LocalDate
  - Instant
  - ZoneId
  - DateTimeFormatter
  - Duration
  - Period
  - TeamFlow
appliesTo: JDK 25 主线；本课使用的核心 java.time API 同样适用于 Java 8
verifiedAt: 2026-08-18
sources:
  - id: java-25-time-package
    title: Java SE 25 API - java.time Package
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/package-summary.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - 日期、时间、瞬时、时区和时间量类型的整体分工
      - java.time 核心类型不可变且线程安全
  - id: java-8-time-package
    title: Java SE 8 API - java.time Package
    url: https://docs.oracle.com/javase/8/docs/api/java/time/package-summary.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 已提供本课采用的核心日期时间模型
      - Java 8 的 java.time 核心类型同样不可变且线程安全
  - id: java-25-local-date-time
    title: Java SE 25 API - LocalDateTime
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/LocalDateTime.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - LocalDateTime 不含 offset 或 zone，不能独立表示唯一时刻
      - LocalDateTime 的日期时间计算返回新对象
  - id: java-8-local-date-time
    title: Java SE 8 API - LocalDateTime
    url: https://docs.oracle.com/javase/8/docs/api/java/time/LocalDateTime.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 具有相同的 LocalDateTime 本地字段合同
  - id: java-25-instant
    title: Java SE 25 API - Instant
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/Instant.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - Instant 表示时间线上的瞬时并适合记录事件发生时间
  - id: java-8-instant
    title: Java SE 8 API - Instant
    url: https://docs.oracle.com/javase/8/docs/api/java/time/Instant.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 支持本课使用的 Instant 解析和时区投影
  - id: java-25-zone-id
    title: Java SE 25 API - ZoneId
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/ZoneId.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - ZoneId 表示用于解析 offset 的地区规则标识
      - systemDefault 会读取当前 JVM 的默认时区
  - id: java-8-zone-id
    title: Java SE 8 API - ZoneId
    url: https://docs.oracle.com/javase/8/docs/api/java/time/ZoneId.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 支持相同的显式地区时区和系统默认时区合同
  - id: java-25-zoned-date-time
    title: Java SE 25 API - ZonedDateTime
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/ZonedDateTime.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - ZonedDateTime 结合本地日期时间、ZoneId 和解析出的 ZoneOffset
      - DST gap 与 overlap 的有效 offset 数量、默认解析行为和显式选择较晚 offset 的方法
      - 本地日历计算与固定经过时间计算跨 DST 时可能不同
  - id: java-8-zoned-date-time
    title: Java SE 8 API - ZonedDateTime
    url: https://docs.oracle.com/javase/8/docs/api/java/time/ZonedDateTime.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 具有相同的 ZonedDateTime、gap、overlap、显式 offset 选择和计算合同
  - id: java-25-date-time-formatter
    title: Java SE 25 API - DateTimeFormatter
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/format/DateTimeFormatter.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - DateTimeFormatter 不可变且线程安全
      - u、y、Y、M、m 等模式字母的含义和大小写区别
      - ResolverStyle 控制解析阶段的日期解析规则
  - id: java-8-date-time-formatter
    title: Java SE 8 API - DateTimeFormatter
    url: https://docs.oracle.com/javase/8/docs/api/java/time/format/DateTimeFormatter.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 支持本课使用的模式、Locale 和严格解析 API
  - id: java-25-duration
    title: Java SE 25 API - Duration
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/Duration.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - Duration 是基于秒和纳秒的固定时间量
      - Duration 中的一天固定按 24 小时处理
  - id: java-8-duration
    title: Java SE 8 API - Duration
    url: https://docs.oracle.com/javase/8/docs/api/java/time/Duration.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 支持相同的 Duration 时间量合同
  - id: java-25-period
    title: Java SE 25 API - Period
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/Period.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - Period 是基于年、月、日的日历时间量
      - getDays 只返回 Period 的 days 分量
  - id: java-8-period
    title: Java SE 8 API - Period
    url: https://docs.oracle.com/javase/8/docs/api/java/time/Period.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 支持相同的 Period 与分量访问合同
  - id: java-25-chrono-unit
    title: Java SE 25 API - ChronoUnit
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/temporal/ChronoUnit.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - ChronoUnit.DAYS.between 返回两个日期之间完整的日单位数量
  - id: java-8-chrono-unit
    title: Java SE 8 API - ChronoUnit
    url: https://docs.oracle.com/javase/8/docs/api/java/time/temporal/ChronoUnit.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 支持相同的 DAYS.between 日期间隔合同
  - id: oracle-tzdata-versions
    title: Oracle Timezone Data Versions in the JRE Software
    url: https://www.oracle.com/java/technologies/tzdata-versions.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Oracle JDK 与 Oracle JRE 时区数据更新说明
    claims:
      - 地区时区规则数据会随 JDK 更新而变化
  - id: stackoverflow-duration-period-dst
    title: Stack Overflow - Duration.ofDays and Period.ofDays Across DST
    url: https://stackoverflow.com/questions/53287725/difference-between-adding-duration-ofdays1-and-period-ofdays1-to-zoneddateti
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 与 JDK 25；正文示例已在两版复现
    claims:
      - 跨 DST 时把固定 24 小时误认为下一个本地日的真实易错场景
  - id: baeldung-period-days-component
    title: Baeldung - Difference Between Two Dates in Java
    url: https://www.baeldung.com/java-date-difference
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 与 JDK 25；正文边界已在两版复现
    claims:
      - 把 Period.getDays 误认为两个日期总天数的真实易错场景
---

# 日期与时间

TeamFlow 中至少有三种看起来都像“时间”的数据：任务在某一天到期、团队约定当地几点同步、任务在时间线上的
某一刻被创建。它们不能全部塞进同一种类型。截止日不需要时区，团队同步需要地区规则，已经发生的事件则必须
能够在全球时间线上落到唯一位置。

本课从业务含义出发选择 `java.time` 类型，再处理文本格式、地区时区和时间量。数据库字段、JSON 格式、定时
任务、Spring Boot 映射和旧 `Date` 迁移都有各自的边界，不在这里提前展开。

## 一、先判断业务值表示什么

### 1. 日期、时间和本地日期时间只保存日历字段

`LocalDate` 只保存年、月、日，适合“任务在 2025-04-02 到期”这种按日历解释的值：

```java
LocalDate dueDate = LocalDate.of(2025, 4, 2);
```

`LocalTime` 只保存时、分、秒和更细精度，适合“团队每天 `09:30` 提醒”：

```java
LocalTime dailyReminder = LocalTime.of(9, 30);
```

`LocalDateTime` 把两组字段合在一起，适合“巴黎当地 `2025-03-29 09:00` 同步”中的日期和钟表时间部分：

```java
LocalDateTime localStart = LocalDateTime.of(2025, 3, 29, 9, 0);
```

这三个类型都没有 `ZoneId` 或 `ZoneOffset`。最后一行只写出了墙上钟表字段，还没有回答这是巴黎、上海还是
其他地区的 `09:00`，因此也没有确定唯一事件时刻。

### 2. Instant 表示时间线上的唯一时刻

任务创建、提交和审计记录关心的是“事件究竟何时发生”。`Instant` 用 UTC 时间线表达唯一时刻：

```java
Instant createdAt = Instant.parse("2025-03-29T06:00:00Z");
```

末尾的 `Z` 表示零偏移。一个 `Instant` 在巴黎和上海会显示成不同本地时间，但两个显示结果都能还原为同一个
`Instant`。这正适合跨地区排序和比较事件先后。

`LocalDateTime` 不能替代这个角色。同一个 `2025-03-29T09:00` 放入 `Europe/Paris` 和
`Asia/Shanghai` 会得到两个不同的 `Instant`；没有地区规则时，程序没有足够信息判断是哪一个。

### 3. java.time 对象不会被原地改写

本课使用的核心类型不可变。调用 `plusDays` 会返回一个新对象，原对象保持不变：

```java
LocalDate originalDueDate = LocalDate.of(2025, 4, 2);
LocalDate postponedDueDate = originalDueDate.plusDays(2);

System.out.println(originalDueDate);
System.out.println(postponedDueDate);
```

输出：

```text
2025-04-02
2025-04-04
```

第一行没有变成 `2025-04-04`，因为 `plusDays` 的结果被写入了另一个变量。忘记接收返回值不会修改原日期。
不可变对象也让共享的日期时间值更容易推理，但变量本身仍然可以重新指向另一个对象。

## 二、把文本转换成明确的日期时间

### 1. 固定协议优先使用 ISO 格式

`LocalDate.parse` 和 `Instant.parse` 可以直接读取各自的标准 ISO 文本：

```java
LocalDate dueDate = LocalDate.parse("2025-04-02");
Instant createdAt = Instant.parse("2025-03-29T06:00:00Z");
```

两个结果之所以不同，不是字符串长度不同，而是目标类型的合同不同。日期文本没有时间和地区信息；带 `Z` 的
瞬时文本已经能确定时间线位置。

`toString()` 适合观察这些标准表示，但界面文案或外部协议不应依赖“看起来差不多”。格式一旦成为输入输出合同，
就应明确选择 formatter。

### 2. 自定义格式必须读懂模式字母

TeamFlow 的导入文本约定为 `2025-03-29 09:00`，可以创建共享 formatter：

```java
DateTimeFormatter localDateTimeFormatter = DateTimeFormatter
    .ofPattern("uuuu-MM-dd HH:mm", Locale.ROOT)
    .withResolverStyle(ResolverStyle.STRICT);

LocalDateTime localStart = LocalDateTime.parse(
    "2025-03-29 09:00",
    localDateTimeFormatter
);
```

这里的模式字母区分大小写：

| 模式 | 含义 | 本课用法 |
| --- | --- | --- |
| `u` | 年 | 严格公历日期使用 `uuuu` |
| `y` | 纪元年 | 单独严格解析时还涉及纪元语义 |
| `Y` | 基于周的年 | 不能当普通日历年使用 |
| `M` | 月 | 两位月份写 `MM` |
| `m` | 分钟 | 两位分钟写 `mm` |
| `H` | 0 到 23 的小时 | 两位小时写 `HH` |

把 `MM` 写成 `mm` 不是风格差异，而是把“月份”换成了“分钟”。把 `uuuu` 写成 `YYYY` 则会引入基于周的年，
在年末附近尤其容易产生与日历年不同的结果。

### 3. 严格解析拒绝不存在的日期

`ofPattern` 创建的 formatter 默认使用 `SMART` 解析。外部输入要求真实日历日期时，显式添加
`ResolverStyle.STRICT`：

```java
DateTimeFormatter strictDateFormatter = DateTimeFormatter
    .ofPattern("uuuu-MM-dd", Locale.ROOT)
    .withResolverStyle(ResolverStyle.STRICT);

LocalDate leapDay = LocalDate.parse("2024-02-29", strictDateFormatter);
```

这段代码得到合法的闰日。把文本改为 `2025-02-29` 会抛出 `DateTimeParseException`，程序不会偷偷把它
修正成另一天。本课只观察失败现象；如何捕获、转换和传播异常属于后续异常课程。

`Locale.ROOT` 表示不跟随用户语言环境。当前纯数字格式看不出语言差异，但显式 Locale 能让 formatter 的合同
完整；如果以后格式包含月份名称，则必须改用业务真正要求的 Locale。

## 三、用地区规则确定唯一时刻

### 1. ZoneId 表示地区规则，不是一个固定小时差

`ZoneId.of("Europe/Paris")` 表示巴黎地区的时区规则。该规则会根据具体日期解析出当时有效的
`ZoneOffset`：

```java
ZoneId paris = ZoneId.of("Europe/Paris");
ZonedDateTime parisStart = LocalDateTime
    .of(2025, 3, 29, 9, 0)
    .atZone(paris);
```

`parisStart` 同时保存本地字段、`Europe/Paris` 和解析出的 offset，因此可以调用 `toInstant()` 得到唯一时刻。
固定 `+01:00` 只表达一个小时差，不能表达巴黎在不同日期使用哪一个 offset。

地区规则数据会随 JDK 的时区数据更新。代码中的 `ZoneId` 不变，不代表某个地区未来所有日期的 offset 永远不变。
业务应保存地区身份，并使用当前受支持的运行时规则解释它。

### 2. 同一 Instant 可以投影成多个本地显示

同一个创建时刻在上海和巴黎会显示成不同钟表时间：

```java
Instant createdAt = Instant.parse("2025-03-29T06:00:00Z");
ZonedDateTime parisView = createdAt.atZone(ZoneId.of("Europe/Paris"));
ZonedDateTime shanghaiView = createdAt.atZone(ZoneId.of("Asia/Shanghai"));

System.out.println(parisView.toInstant().equals(shanghaiView.toInstant()));
```

输出：

```text
true
```

两个 `ZonedDateTime` 的本地字段不同，但 `toInstant()` 都回到 `createdAt`。存储事件身份和展示本地时间是两个
步骤：前者用 `Instant`，后者在边界选择明确的 `ZoneId`。

`ZoneId.systemDefault()` 会读取当前 JVM 的默认时区。除非业务要求“跟随运行机器”，不要把它当成跨环境合同；
同一程序在不同电脑或容器中可能显示不同日期和小时。

### 3. 本地时间可能不存在，也可能出现两次

地区进入夏令时时，钟表向前拨会产生 gap；退出夏令时时，钟表向后拨会产生 overlap。以巴黎已核验的 2025 年
日期为例：

```java
ZoneId paris = ZoneId.of("Europe/Paris");
LocalDateTime normal = LocalDateTime.of(2025, 3, 29, 9, 0);
LocalDateTime gap = LocalDateTime.of(2025, 3, 30, 2, 30);
LocalDateTime overlap = LocalDateTime.of(2025, 10, 26, 2, 30);

int normalOffsetCount = paris.getRules().getValidOffsets(normal).size();
int gapOffsetCount = paris.getRules().getValidOffsets(gap).size();
int overlapOffsetCount = paris.getRules().getValidOffsets(overlap).size();

System.out.println("正常时间有效 offset 数：" + normalOffsetCount);
if (gapOffsetCount == 0) {
    System.out.println("gap 已拒绝");
}

ZonedDateTime selectedOverlap = overlap
    .atZone(paris)
    .withLaterOffsetAtOverlap();
System.out.println("overlap 有效 offset 数：" + overlapOffsetCount);
System.out.println("overlap 选用较晚 offset：" + selectedOverlap);
```

输出：

```text
正常时间有效 offset 数：1
gap 已拒绝
overlap 有效 offset 数：2
overlap 选用较晚 offset：2025-10-26T02:30+01:00[Europe/Paris]
```

正常本地时间有 1 个有效 offset，gap 有 0 个，overlap 有 2 个。代码发现 gap 没有有效 offset 后只输出拒绝结果，
没有继续创建 `ZonedDateTime`。overlap 分支先让 `atZone` 建立对象，再调用 `withLaterOffsetAtOverlap()` 明确选择
较晚的 `+01:00`。如果 TeamFlow 的规则要求较早 offset，可以调用 `withEarlierOffsetAtOverlap()`；也可以暂停
创建并要求用户确认。

直接调用 `atZone` 时，gap 默认向前调整，overlap 默认选择其中一个 offset；这只是 API 默认行为，不自动等于
TeamFlow 的预约规则。业务代码必须先决定“拒绝、选较早、选较晚或要求确认”，不能假装本地文本天然唯一。

## 四、区分日历时间和经过时间

### 1. Period 表示年、月、日的日历变化

`Period` 适合回答“从报告日到截止日在日历上相隔多少年、月、日”：

```java
LocalDate reportDate = LocalDate.of(2025, 3, 29);
LocalDate dueDate = LocalDate.of(2025, 4, 2);
Period calendarAmount = Period.between(reportDate, dueDate);

System.out.println(calendarAmount);
```

输出：

```text
P4D
```

`P4D` 是 ISO 表示，意思是 4 个日历日。月份长度不同，因此 `Period` 不把所有年月日先换成固定秒数。

### 2. Duration 表示固定秒数和纳秒数

`Duration` 适合回答两个瞬时之间实际经过了多久：

```java
Instant createdAt = Instant.parse("2025-03-29T06:00:00Z");
Instant meetingAt = Instant.parse("2025-03-29T08:00:00Z");
Duration preparation = Duration.between(createdAt, meetingAt);

System.out.println(preparation);
```

输出：

```text
PT2H
```

`PT2H` 表示固定经过 2 小时。`Duration.ofDays(1)` 固定等于 24 小时，不会根据地区规则自动变成 23 或 25 小时。

### 3. 跨 DST 时“明天”和“24 小时后”可能不同

**社区补充：** Stack Overflow 的真实问题展示了开发者把 `Duration.ofDays(1)` 和 `Period.ofDays(1)` 当成
同一种“一天”的误区。该行为已回到 `ZonedDateTime`、`Duration`、`Period` 官方合同核验，并在 JDK 25 与
Java 8 中用固定巴黎日期复现。

```java
ZoneId paris = ZoneId.of("Europe/Paris");
ZonedDateTime firstSync = LocalDateTime
    .of(2025, 3, 29, 9, 0)
    .atZone(paris);

ZonedDateTime nextLocalDay = firstSync.plus(Period.ofDays(1));
ZonedDateTime after24Hours = firstSync.plus(Duration.ofHours(24));
```

巴黎在这两个日期之间进入夏令时。`nextLocalDay` 是当地第二天 `09:00`，保持本地日程；`after24Hours` 是真实经过
24 小时后的 `10:00`，保持时间线长度。先说明业务要的是“下一个本地日”还是“固定经过 24 小时”，再选择 API。

### 4. Period.getDays 不是两个日期的总天数

**社区补充：** 社区文章中出现过把 `Period.getDays()` 当总天数的真实用法。官方合同说明它只返回 days 分量，
例如下面的期间是 2 个月，因此 days 分量为 0：

```java
LocalDate start = LocalDate.of(2025, 8, 1);
LocalDate end = LocalDate.of(2025, 10, 1);
Period period = Period.between(start, end);
long totalDays = ChronoUnit.DAYS.between(start, end);

System.out.println(period);
System.out.println(period.getDays());
System.out.println(totalDays);
```

输出：

```text
P2M
0
61
```

`getDays()` 只读取 `P2M` 中没有出现的 days 分量，所以是 0。若问题明确是“忽略年月分组后，两日期相隔多少整天”，
使用 `ChronoUnit.DAYS.between` 表达这个问题。

## 五、两条版本线使用同一组核心 API

### 1. JDK 25 与 Java 8 的本课合同相同

`java.time` 从 Java 8 起就提供本课使用的核心类型。JDK 25 与 Java 8 都支持：

- `LocalDate`、`LocalTime`、`LocalDateTime` 与 `Instant`；
- `ZoneId`、`ZonedDateTime`、gap 和 overlap；
- `DateTimeFormatter`、`Locale` 与 `ResolverStyle.STRICT`；
- `Duration`、`Period` 与 `ChronoUnit.DAYS`。

因此主程序和练习在两版中使用相同源码，但两版仍分别给出完整代码和运行步骤。JDK 25 包含 Java 9 以后新增的
便利 API，本课不依赖它们，以免把便利方法误写成核心能力差异。

### 2. API 相同不代表所有地区规则数据永远相同

时区数据库会随着法规和 JDK 更新而变化。两版程序都能调用相同 API，但很旧的 Java 8 update 与当前 JDK 25
可能携带不同版本的地区规则。本课使用固定、已核验的历史日期说明 gap 和 overlap；生产环境仍应使用受支持的
JDK 更新，并把 `ZoneId` 明确保存在业务边界。

### 3. 本课不替外部系统决定时间合同

本课只决定 Java 内部值的含义。数据库列保存哪种类型、JSON 是否带 offset、HTTP 如何传输、定时任务怎样处理
DST，都必须由对应课程和具体组件合同决定。不能仅因为 Java 对象叫 `LocalDateTime`，就推断数据库或前端会用
相同方式解释它。

## 六、六个典型错误

:::pitfalls
### 用 LocalDateTime 保存已发生事件

**触发条件：** 任务创建、提交或审计事件只记录 `LocalDateTime`，没有地区或 offset。

**原因：** `LocalDateTime` 只有日历和钟表字段，不能单独确定时间线上的唯一位置。

**后果：** 同一字段在巴黎和上海会映射成不同 `Instant`，跨地区排序和审计失去稳定含义。

**错误示例：**

```java
LocalDateTime createdAt = LocalDateTime.of(2025, 3, 29, 9, 0);
```

**正确写法：**

```java
Instant createdAt = Instant.parse("2025-03-29T08:00:00Z");
```

**验证方式：** 把同一个 `LocalDateTime` 分别放入 `Europe/Paris` 与 `Asia/Shanghai`，两次
`toInstant()` 不相等；同一个 `Instant` 投影到两区后再 `toInstant()` 仍相等。

### 把格式字母大小写当成同义写法

**触发条件：** 用 `YYYY-mm-dd` 解析普通日期，认为大小写只影响显示风格。

**原因：** `Y` 是基于周的年，`m` 是分钟；普通年和月份分别是 `u` 与 `M`。

**后果：** 严格解析失败，或年末日期出现错误年份，导入结果不再满足日期合同。

**错误示例：**

```java
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("YYYY-mm-dd");
```

**正确写法：**

```java
DateTimeFormatter formatter = DateTimeFormatter
    .ofPattern("uuuu-MM-dd", Locale.ROOT)
    .withResolverStyle(ResolverStyle.STRICT);
```

**验证方式：** 使用严格 formatter 解析 `2025-08-17`；错误模式不能得到目标 `LocalDate`，正确模式输出
`2025-08-17`。

### 依赖 JVM 默认时区解释业务时间

**触发条件：** 使用 `ZoneId.systemDefault()` 显示协议事件，却没有规定部署机器时区。

**原因：** 系统默认时区属于当前 JVM 环境，不是事件数据的一部分。

**后果：** 相同 `Instant` 在开发机、容器或服务器上可能显示成不同日期和小时。

**错误示例：**

```java
ZonedDateTime view = createdAt.atZone(ZoneId.systemDefault());
```

**正确写法：**

```java
ZonedDateTime view = createdAt.atZone(ZoneId.of("Asia/Shanghai"));
```

**验证方式：** 对同一固定 `Instant` 分别使用 `UTC` 和 `Asia/Shanghai`，观察本地时间不同；再确认显式
`Asia/Shanghai` 不受 JVM 默认时区变化影响。

### 把明天同一时间写成固定加 24 小时

**触发条件：** 地区日程使用 `plus(Duration.ofHours(24))` 计算下一天的相同钟表时间。

**原因：** `Duration` 保持固定经过时间，而 DST 可能让一个本地日包含 23 或 25 小时。

**后果：** 夏令时切换后，本应在 `09:00` 的同步会变成 `08:00` 或 `10:00`。

**错误示例：**

```java
ZonedDateTime nextSync = firstSync.plus(Duration.ofHours(24));
```

**正确写法：**

```java
ZonedDateTime nextSync = firstSync.plus(Period.ofDays(1));
```

**验证方式：** 从巴黎 `2025-03-29 09:00` 出发，固定 24 小时得到次日 `10:00`，日历一天得到次日
`09:00`。

### 把 Period.getDays 当作总天数

**触发条件：** 用 `Period.between(start, end).getDays()` 计算任意两个日期之间的全部天数。

**原因：** `getDays()` 只读取 Period 的 days 分量，不会把 years 和 months 换算成天。

**后果：** `2025-08-01` 到 `2025-10-01` 被错误报告为 0 天，业务统计失真。

**错误示例：**

```java
int totalDays = Period.between(start, end).getDays();
```

**正确写法：**

```java
long totalDays = ChronoUnit.DAYS.between(start, end);
```

**验证方式：** 固定上述两个日期，观察 Period 为 `P2M`、`getDays()` 为 `0`，而总天数为 `61`。

### 期待严格解析自动修正非法日期

**触发条件：** 输入 `2025-02-29`，同时要求“必须是实际存在的日期”，却仍期待程序给出一个日期结果。

**原因：** 2025 年不是闰年，严格 resolver 不会替调用方猜测修正规则。

**后果：** 程序抛出 `DateTimeParseException` 并在未处理时停止，导入流程不能继续。

**错误示例：**

```java
LocalDate dueDate = LocalDate.parse("2025-02-29", strictDateFormatter);
```

**正确写法：**

```java
LocalDate dueDate = LocalDate.parse("2025-02-28", strictDateFormatter);
```

**验证方式：** 同一严格 formatter 解析 `2024-02-29` 成功，解析 `2025-02-29` 抛出
`DateTimeParseException`；本课只观察错误，异常处理留到后续课程。
:::

## 七、完整的 TeamFlow 日期时间程序

### 1. 程序要解决的问题

TeamFlow 要生成一次稳定的任务计划观察结果：报告日和截止日属于日历日期，每日提醒属于本地时间，任务创建时间
属于唯一事件，巴黎团队同步则需要地区规则。程序会拒绝 gap 中不存在的本地时间，为 overlap 明确选择较晚
offset，还会比较“下一个本地日”和“固定 24 小时后”，让 DST 差异在控制台中可见。

### 2. JDK 25 完整程序

在 JDK 25 项目中创建 `TeamFlowDateTimeApplication.java`：

```java
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Period;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.ResolverStyle;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

public final class TeamFlowDateTimeApplication {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter
        .ofPattern("uuuu-MM-dd", Locale.ROOT)
        .withResolverStyle(ResolverStyle.STRICT);

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter
        .ofPattern("uuuu-MM-dd HH:mm", Locale.ROOT)
        .withResolverStyle(ResolverStyle.STRICT);

    private static final DateTimeFormatter SCHEDULE_FORMATTER = DateTimeFormatter
        .ofPattern("uuuu-MM-dd HH:mm VV xxx", Locale.ROOT);

    /**
     * 把带地区规则的计划时间格式化为可观察文本。
     */
    private static String formatSchedule(ZonedDateTime schedule) {
        return SCHEDULE_FORMATTER.format(schedule);
    }

    /**
     * 运行 TeamFlow 的日期、事件时刻和跨时区计划示例。
     */
    public static void main(String[] args) {
        LocalDate reportDate = LocalDate.parse("2025-03-29", DATE_FORMATTER);
        LocalDate dueDate = LocalDate.parse("2025-04-02", DATE_FORMATTER);
        LocalDate postponedDueDate = dueDate.plusDays(2);
        LocalTime dailyReminder = LocalTime.of(9, 30);

        Instant createdAt = Instant.parse("2025-03-29T06:00:00Z");
        ZoneId paris = ZoneId.of("Europe/Paris");
        ZoneId shanghai = ZoneId.of("Asia/Shanghai");
        LocalDateTime localStart = LocalDateTime.parse(
            "2025-03-29 09:00",
            DATE_TIME_FORMATTER
        );
        ZonedDateTime firstSync = localStart.atZone(paris);
        ZonedDateTime nextLocalDay = firstSync.plus(Period.ofDays(1));
        ZonedDateTime after24Hours = firstSync.plus(Duration.ofHours(24));
        ZonedDateTime shanghaiCreatedView = createdAt.atZone(shanghai);

        LocalDateTime gapLocal = LocalDateTime.parse(
            "2025-03-30 02:30",
            DATE_TIME_FORMATTER
        );
        LocalDateTime overlapLocal = LocalDateTime.parse(
            "2025-10-26 02:30",
            DATE_TIME_FORMATTER
        );
        int normalOffsetCount = paris.getRules().getValidOffsets(localStart).size();
        int gapOffsetCount = paris.getRules().getValidOffsets(gapLocal).size();
        int overlapOffsetCount = paris.getRules().getValidOffsets(overlapLocal).size();
        String gapDecision;
        if (gapOffsetCount == 0) {
            gapDecision = "已拒绝";
        } else {
            gapDecision = "允许创建";
        }
        ZonedDateTime selectedOverlap = overlapLocal
            .atZone(paris)
            .withLaterOffsetAtOverlap();

        Period calendarAmount = Period.between(reportDate, dueDate);
        long totalDays = ChronoUnit.DAYS.between(reportDate, dueDate);
        Duration preparation = Duration.between(createdAt, firstSync.toInstant());

        System.out.println("报告日期：" + reportDate);
        System.out.println("每日提醒：" + dailyReminder);
        System.out.println("原截止日期：" + dueDate);
        System.out.println("延期后日期：" + postponedDueDate);
        System.out.println("日历跨度：" + calendarAmount);
        System.out.println("剩余整天：" + totalDays);
        System.out.println("任务创建时刻：" + createdAt);
        System.out.println("上海创建时间：" + formatSchedule(shanghaiCreatedView));
        System.out.println("首次同步：" + formatSchedule(firstSync));
        System.out.println("正常时间有效 offset 数：" + normalOffsetCount);
        System.out.println("不存在时间处理结果：" + gapDecision);
        System.out.println("重复时间有效 offset 数：" + overlapOffsetCount);
        System.out.println("重复时间选择较晚 offset：" + formatSchedule(selectedOverlap));
        System.out.println("下一个本地日：" + formatSchedule(nextLocalDay));
        System.out.println("固定 24 小时后：" + formatSchedule(after24Hours));
        System.out.println("同步准备时长：" + preparation);
    }
}
```

### 3. Java 8 完整程序

Java 8 使用相同核心 API。Java 8 项目中的 `TeamFlowDateTimeApplication.java` 完整代码如下：

```java
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Period;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.ResolverStyle;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

public final class TeamFlowDateTimeApplication {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter
        .ofPattern("uuuu-MM-dd", Locale.ROOT)
        .withResolverStyle(ResolverStyle.STRICT);

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter
        .ofPattern("uuuu-MM-dd HH:mm", Locale.ROOT)
        .withResolverStyle(ResolverStyle.STRICT);

    private static final DateTimeFormatter SCHEDULE_FORMATTER = DateTimeFormatter
        .ofPattern("uuuu-MM-dd HH:mm VV xxx", Locale.ROOT);

    /**
     * 把带地区规则的计划时间格式化为可观察文本。
     */
    private static String formatSchedule(ZonedDateTime schedule) {
        return SCHEDULE_FORMATTER.format(schedule);
    }

    /**
     * 运行 TeamFlow 的日期、事件时刻和跨时区计划示例。
     */
    public static void main(String[] args) {
        LocalDate reportDate = LocalDate.parse("2025-03-29", DATE_FORMATTER);
        LocalDate dueDate = LocalDate.parse("2025-04-02", DATE_FORMATTER);
        LocalDate postponedDueDate = dueDate.plusDays(2);
        LocalTime dailyReminder = LocalTime.of(9, 30);

        Instant createdAt = Instant.parse("2025-03-29T06:00:00Z");
        ZoneId paris = ZoneId.of("Europe/Paris");
        ZoneId shanghai = ZoneId.of("Asia/Shanghai");
        LocalDateTime localStart = LocalDateTime.parse(
            "2025-03-29 09:00",
            DATE_TIME_FORMATTER
        );
        ZonedDateTime firstSync = localStart.atZone(paris);
        ZonedDateTime nextLocalDay = firstSync.plus(Period.ofDays(1));
        ZonedDateTime after24Hours = firstSync.plus(Duration.ofHours(24));
        ZonedDateTime shanghaiCreatedView = createdAt.atZone(shanghai);

        LocalDateTime gapLocal = LocalDateTime.parse(
            "2025-03-30 02:30",
            DATE_TIME_FORMATTER
        );
        LocalDateTime overlapLocal = LocalDateTime.parse(
            "2025-10-26 02:30",
            DATE_TIME_FORMATTER
        );
        int normalOffsetCount = paris.getRules().getValidOffsets(localStart).size();
        int gapOffsetCount = paris.getRules().getValidOffsets(gapLocal).size();
        int overlapOffsetCount = paris.getRules().getValidOffsets(overlapLocal).size();
        String gapDecision;
        if (gapOffsetCount == 0) {
            gapDecision = "已拒绝";
        } else {
            gapDecision = "允许创建";
        }
        ZonedDateTime selectedOverlap = overlapLocal
            .atZone(paris)
            .withLaterOffsetAtOverlap();

        Period calendarAmount = Period.between(reportDate, dueDate);
        long totalDays = ChronoUnit.DAYS.between(reportDate, dueDate);
        Duration preparation = Duration.between(createdAt, firstSync.toInstant());

        System.out.println("报告日期：" + reportDate);
        System.out.println("每日提醒：" + dailyReminder);
        System.out.println("原截止日期：" + dueDate);
        System.out.println("延期后日期：" + postponedDueDate);
        System.out.println("日历跨度：" + calendarAmount);
        System.out.println("剩余整天：" + totalDays);
        System.out.println("任务创建时刻：" + createdAt);
        System.out.println("上海创建时间：" + formatSchedule(shanghaiCreatedView));
        System.out.println("首次同步：" + formatSchedule(firstSync));
        System.out.println("正常时间有效 offset 数：" + normalOffsetCount);
        System.out.println("不存在时间处理结果：" + gapDecision);
        System.out.println("重复时间有效 offset 数：" + overlapOffsetCount);
        System.out.println("重复时间选择较晚 offset：" + formatSchedule(selectedOverlap));
        System.out.println("下一个本地日：" + formatSchedule(nextLocalDay));
        System.out.println("固定 24 小时后：" + formatSchedule(after24Hours));
        System.out.println("同步准备时长：" + preparation);
    }
}
```

### 4. 两个版本的 IDEA 配置与运行步骤

JDK 25 版本：

1. 打开 `File -> Project Structure -> Project`，把 `Project SDK` 设为已配置的 JDK 25。
2. 在 `Modules` 中确认当前模块的 SDK 使用 Project SDK，语言级别不低于 25。
3. 打开 `TeamFlowDateTimeApplication.java`，确认编辑器没有红色导入错误。
4. 点击 `main` 左侧运行图标，选择 `Run 'TeamFlowDateTimeApplication.main()'`。
5. 在 Run 控制台核对完整输出，并在运行配置中确认 JRE 显示 JDK 25。

Java 8 版本：

1. 为兼容项目单独选择已安装的 JDK 8，不要只修改另一个 JDK 25 项目的显示名称。
2. 在 `Project Structure` 中把 Project SDK、模块 SDK 和 Language level 都设为 Java 8。
3. 放入上面的完整 Java 8 源码；它没有使用 Java 9 以后新增的便利 API。
4. 运行同一个 `main`，并在运行配置中确认 JRE 确实指向 JDK 8。
5. 两版输出应逐行一致；若地区 offset 不同，先核对运行时版本和时区数据，不要修改系统时区迎合结果。

### 5. 预期控制台输出

JDK 25 与 Java 8 的完整程序都应输出：

```text
报告日期：2025-03-29
每日提醒：09:30
原截止日期：2025-04-02
延期后日期：2025-04-04
日历跨度：P4D
剩余整天：4
任务创建时刻：2025-03-29T06:00:00Z
上海创建时间：2025-03-29 14:00 Asia/Shanghai +08:00
首次同步：2025-03-29 09:00 Europe/Paris +01:00
正常时间有效 offset 数：1
不存在时间处理结果：已拒绝
重复时间有效 offset 数：2
重复时间选择较晚 offset：2025-10-26 02:30 Europe/Paris +01:00
下一个本地日：2025-03-30 09:00 Europe/Paris +02:00
固定 24 小时后：2025-03-30 10:00 Europe/Paris +02:00
同步准备时长：PT2H
```

### 6. 从输出还原执行过程

1. 严格 formatter 把两个日期文本解析为 `LocalDate`，延期操作生成新日期，因此原截止日仍为
   `2025-04-02`。
2. `Period` 以日历单位得到 `P4D`，`ChronoUnit.DAYS` 针对这组输入得到 4 个整天。
3. 创建事件直接使用 `Instant`，投影到上海后变成当地 `14:00`，但事件身份没有改变。
4. 巴黎本地 `09:00` 有 1 个有效 offset，结合 `ZoneId` 后得到首次同步的唯一 `Instant`，它比创建时刻晚
   2 小时。
5. `2025-03-30 02:30` 没有有效 offset，程序进入拒绝分支，没有为不存在的本地时间创建计划；
   `2025-10-26 02:30` 有 2 个有效 offset，程序明确选择较晚的 `+01:00`。
6. 巴黎在两个同步日之间进入夏令时。日历一天保持当地 `09:00`，固定 24 小时保持经过时长，所以当地显示
   变成 `10:00`。

## 八、独立练习

### 1. 安排跨夏令时的每日复盘

:::exercise
### 每日复盘计划

**要求：** 使用严格的 `uuuu-MM-dd HH:mm` formatter 解析 `2025-11-01 09:00`，把它放入
`America/New_York`。分别计算一个日历日后的复盘和固定 24 小时后的时刻，并计算两次本地复盘实际经过的
`Duration`。不得使用系统默认时区，也不得使用 Java 9 以后新增的便利 API。

**验收：** 首次复盘为 `-04:00`，下一个本地日仍为 `09:00` 但 offset 变为 `-05:00`，固定 24 小时后的
本地显示为 `08:00`，两次本地复盘之间实际经过 `PT25H`。JDK 25 与 Java 8 输出必须一致。
:::

### 2. JDK 25 参考实现

```java
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.ResolverStyle;
import java.util.Locale;

public final class TeamFlowReviewScheduleApplication {
    private static final DateTimeFormatter INPUT_FORMATTER = DateTimeFormatter
        .ofPattern("uuuu-MM-dd HH:mm", Locale.ROOT)
        .withResolverStyle(ResolverStyle.STRICT);

    private static final DateTimeFormatter OUTPUT_FORMATTER = DateTimeFormatter
        .ofPattern("uuuu-MM-dd HH:mm VV xxx", Locale.ROOT);

    /**
     * 把复盘计划格式化为可验收文本。
     */
    private static String formatSchedule(ZonedDateTime schedule) {
        return OUTPUT_FORMATTER.format(schedule);
    }

    /**
     * 运行跨夏令时的 TeamFlow 每日复盘计划。
     */
    public static void main(String[] args) {
        LocalDateTime localStart = LocalDateTime.parse(
            "2025-11-01 09:00",
            INPUT_FORMATTER
        );
        ZoneId newYork = ZoneId.of("America/New_York");
        ZonedDateTime firstReview = localStart.atZone(newYork);
        ZonedDateTime nextLocalReview = firstReview.plus(Period.ofDays(1));
        ZonedDateTime after24Hours = firstReview.plus(Duration.ofHours(24));
        Duration elapsed = Duration.between(
            firstReview.toInstant(),
            nextLocalReview.toInstant()
        );

        System.out.println("首次复盘：" + formatSchedule(firstReview));
        System.out.println("下次本地复盘：" + formatSchedule(nextLocalReview));
        System.out.println("固定 24 小时后：" + formatSchedule(after24Hours));
        System.out.println("两次复盘实际时长：" + elapsed);
    }
}
```

### 3. Java 8 参考实现

```java
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.ResolverStyle;
import java.util.Locale;

public final class TeamFlowReviewScheduleApplication {
    private static final DateTimeFormatter INPUT_FORMATTER = DateTimeFormatter
        .ofPattern("uuuu-MM-dd HH:mm", Locale.ROOT)
        .withResolverStyle(ResolverStyle.STRICT);

    private static final DateTimeFormatter OUTPUT_FORMATTER = DateTimeFormatter
        .ofPattern("uuuu-MM-dd HH:mm VV xxx", Locale.ROOT);

    /**
     * 把复盘计划格式化为可验收文本。
     */
    private static String formatSchedule(ZonedDateTime schedule) {
        return OUTPUT_FORMATTER.format(schedule);
    }

    /**
     * 运行跨夏令时的 TeamFlow 每日复盘计划。
     */
    public static void main(String[] args) {
        LocalDateTime localStart = LocalDateTime.parse(
            "2025-11-01 09:00",
            INPUT_FORMATTER
        );
        ZoneId newYork = ZoneId.of("America/New_York");
        ZonedDateTime firstReview = localStart.atZone(newYork);
        ZonedDateTime nextLocalReview = firstReview.plus(Period.ofDays(1));
        ZonedDateTime after24Hours = firstReview.plus(Duration.ofHours(24));
        Duration elapsed = Duration.between(
            firstReview.toInstant(),
            nextLocalReview.toInstant()
        );

        System.out.println("首次复盘：" + formatSchedule(firstReview));
        System.out.println("下次本地复盘：" + formatSchedule(nextLocalReview));
        System.out.println("固定 24 小时后：" + formatSchedule(after24Hours));
        System.out.println("两次复盘实际时长：" + elapsed);
    }
}
```

### 4. 运行步骤与预期结果

JDK 25 项目选择 Project SDK 25，Java 8 项目选择 Project SDK 8；两边都确认模块 SDK 与运行配置 JRE 没有
串用另一个版本。分别创建 `TeamFlowReviewScheduleApplication.java`，运行 `main`，预期输出完全相同：

```text
首次复盘：2025-11-01 09:00 America/New_York -04:00
下次本地复盘：2025-11-02 09:00 America/New_York -05:00
固定 24 小时后：2025-11-02 08:00 America/New_York -05:00
两次复盘实际时长：PT25H
```

验收时不要只看日期是否变成第二天。还要同时核对本地小时、offset 和 `Duration`：它们共同证明程序区分了
“下一个本地日”与“固定经过 24 小时”。

## 九、把日期时间放回 TeamFlow

### 1. 本课为项目增加的三个明确值

- 任务截止日使用 `LocalDate`，表达“哪一天到期”。
- 创建、提交等已经发生的事件使用 `Instant`，表达全球时间线上的唯一时刻。
- 团队计划先保留 `LocalDateTime` 和 `ZoneId`，解析 gap 或 overlap 后再得到用于执行的 `Instant`。

这三个选择不会替后续课程决定数据库、JSON 或调度框架合同，却能避免在进入 Web 和持久化之前就把不同时间语义
混进同一个字符串。

### 2. 自我检查

完成本课后，拿到一个新的时间字段先回答三个问题：它是纯日历值、本地计划还是已经发生的事件；是否需要地区
规则；计算要求保持本地日历还是固定经过时长。能先回答这三点，再选择类型和 API，才算真正掌握本课能力。
