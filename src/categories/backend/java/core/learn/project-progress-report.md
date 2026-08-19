---
id: backend.java.learn.basics.project-progress-report
type: lesson
title: 实战：项目进度报告
summary: 串联集合、循环、排序、日期与精确十进制，生成可重复核对的 TeamFlow 项目进度报告
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 125
prerequisites:
  - backend.java.learn.basics.bigdecimal
objectives:
  - 能先定义统计日期、任务范围和报告指标，再组织项目进度计算。
  - 能使用 List 保存任务、使用 Map 汇总状态数量，并在一次循环中累计工时和逾期任务。
  - 能结合 LocalDate 与任务状态判断逾期，而不把已经完成的任务误报为逾期。
  - 能使用 BigDecimal 汇总工时并按明确 scale 和 RoundingMode 计算完成率。
  - 能复制任务列表后使用 Comparator 排序报告项，保持调用方原始顺序不变。
  - 能使用固定统计日期生成确定性输出，并逐项核对汇总值与明细。
  - 能在 JDK 25 与 Java 8 中运行同一份完整程序和练习参考实现。
recap:
  - 进度报告先固定统计口径，再把任务集合转换为状态数量、工时合计、完成率和逾期明细。
  - List 负责保存任务顺序，Map 负责关联状态与数量，一次循环可以同步完成多项汇总。
  - 逾期要求截止日期早于统计日期，并且任务尚未完成；只比较日期会误报已完成任务。
  - BigDecimal 的加法和除法返回新值，完成率还必须明确结果小数位与舍入方式。
  - List.sort 会改变接收者的元素顺序；报告需要独立排序时，应先复制列表再排序副本。
  - 固定统计日期使示例、测试和人工验收在不同运行日期得到相同结果。
related:
  - backend.java.learn.basics.maps-and-key-value-associations
  - backend.java.learn.basics.comparable-and-comparator
  - backend.java.learn.basics.date-time-and-time-zones
  - backend.java.learn.basics.bigdecimal
tags:
  - Java
  - TeamFlow
  - 项目进度报告
  - List
  - Map
  - Comparator
  - LocalDate
  - BigDecimal
appliesTo: JDK 25 主线；本课使用的集合、Comparator、LocalDate 与 BigDecimal API 在 Java 8 也可使用
verifiedAt: 2026-08-18
sources:
  - id: java-25-list
    title: Java SE 25 API - List
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - List 保存有序元素，sort 按 Comparator 对当前可修改列表重新排序
  - id: java-8-list
    title: Java SE 8 API - List
    url: https://docs.oracle.com/javase/8/docs/api/java/util/List.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 已提供本课使用的 List 遍历、读取与 sort 合同
  - id: java-25-array-list
    title: Java SE 25 API - ArrayList
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - ArrayList 可以按来源集合的迭代顺序创建独立列表结构
  - id: java-8-array-list
    title: Java SE 8 API - ArrayList
    url: https://docs.oracle.com/javase/8/docs/api/java/util/ArrayList.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 的 ArrayList(Collection) 可用于复制任务列表结构后独立排序
  - id: java-25-map
    title: Java SE 25 API - Map
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - Map 通过键关联值，get 与 put 可用于读取并更新状态计数
  - id: java-8-map
    title: Java SE 8 API - Map
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Map.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 已提供本课使用的 Map 读取和写入合同
  - id: java-25-comparator
    title: Java SE 25 API - Comparator
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Comparator.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - comparing 与 thenComparing 可以依次按截止日期和任务编号建立确定顺序
  - id: java-8-comparator
    title: Java SE 8 API - Comparator
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 已提供本课使用的 comparing、thenComparing 与方法引用写法
  - id: java-25-local-date
    title: Java SE 25 API - LocalDate
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/LocalDate.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - LocalDate 表示不含时区的日期，isBefore 可判断截止日期是否早于统计日期
      - now 使用默认时区的当前日期，固定报告不应把它当成可重复输入
  - id: java-8-local-date
    title: Java SE 8 API - LocalDate
    url: https://docs.oracle.com/javase/8/docs/api/java/time/LocalDate.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 已提供本课使用的 LocalDate.of、isBefore 和日期比较合同
  - id: java-25-bigdecimal
    title: Java SE 25 API - BigDecimal
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/math/BigDecimal.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - BigDecimal 不可变，add 与 divide 返回新值，除法可指定 scale 和 RoundingMode
  - id: java-8-bigdecimal
    title: Java SE 8 API - BigDecimal
    url: https://docs.oracle.com/javase/8/docs/api/java/math/BigDecimal.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 已提供本课工时汇总和完成率计算使用的 BigDecimal 合同
  - id: stackoverflow-integer-percentage
    title: 'Stack Overflow - Calculating percent "x/y * 100" always results in 0?'
    url: https://stackoverflow.com/questions/13338531/calculating-percent-x-y-100-always-results-in-0
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 与 JDK 25；整数除法现象已在两版复现
    claims:
      - 开发者会真实遇到先执行整数除法导致百分比被截断为零的问题
  - id: stackoverflow-sort-copy
    title: Stack Overflow - How to sort a list without mutating it
    url: https://stackoverflow.com/questions/52011712/how-to-sort-a-list-without-mutating-it
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 与 JDK 25；列表复制和排序结果已在两版复现
    claims:
      - 需要保留原列表顺序时可以复制列表结构后排序副本
      - 浅复制会共享元素引用，不等于复制每个元素对象
---

# 实战：项目进度报告

TeamFlow 已经能够把任务放进集合、按业务规则排序、判断日期先后，并用 `BigDecimal` 保存精确工时。单项
能力都能运行之后，还需要回答一个更接近真实协作的问题：在指定统计日，项目有多少任务、各状态分别多少、
工时完成率是多少、哪些未完成任务已经逾期？

本课把这些前置能力连接成一份控制台进度报告。报告使用固定数据和固定统计日期，因此每次运行都能得到相同
结果。这里只做内存中的统计与输出，不提前引入异常处理、文件读写、Lambda、Stream、Optional、Maven、
Spring 或数据库。

## 一、先固定报告口径

### 1. 报告日期是输入，不是隐藏的当前时间

“是否逾期”必须相对于某一天判断。同一任务在 `2026-08-14` 可能尚未到期，在 `2026-08-18` 可能已经
逾期。因此完整程序把统计日期显式写成一个值：

```java
LocalDate reportDate = LocalDate.of(2026, 8, 18);
```

`LocalDate` 只表示年月日，适合“截止日期”和“统计日期”这类日历值。它不包含时区和一天中的时刻，本课也
不需要回答“具体几点过期”。把统计日期作为输入后，逾期判断只依赖任务和这一天，学习者在任何日期运行都
能观察同一结果。

### 2. 一份报告只统计同一批任务

本课的输入是一份 `List<Task>`。每个任务提供六个已经讲过的值：

- 任务编号和标题用于识别明细。
- 状态用于分类计数，也参与逾期判断。
- 截止日期用于判断是否早于统计日期。
- 计划工时和完成工时用于汇总完成率。

报告的任务总数、状态数量、工时合计和逾期清单必须来自同一个列表。若一部分指标读取旧列表，另一部分读取
新列表，即使每段代码单独正确，最终报告也会自相矛盾。

### 3. 先写出可核对的输出合同

完整程序固定输出以下项目：任务总数、三个状态的数量、计划与完成工时、工时完成率、按截止日期排列的
逾期任务，以及原列表的第一项。最后一项看似不是业务指标，却能直接证明报告排序没有改变调用方的任务顺序。

完成率使用下面的明确公式：

```text
完成率 = 完成工时 / 计划工时 × 100
```

结果保留一位小数并使用 `HALF_UP`。这份口径确定以后，`33.0 / 48.0 × 100` 的报告值应为 `68.8%`，而
不是由显示工具临时决定保留几位。

## 二、用集合组织统计状态

### 1. List 保留输入顺序

创建任务时按编号顺序放入 `ArrayList`：

```java
List<Task> tasks = new ArrayList<>();
tasks.add(new Task("TF-101", "设计登录页", TaskStatus.IN_PROGRESS));
tasks.add(new Task("TF-102", "编写任务接口", TaskStatus.DONE));
```

列表的第一个元素是 `TF-101`，第二个元素是 `TF-102`。这个顺序可以代表调用方传入任务的顺序，但它不一定
适合逾期报告。后面会创建一个独立列表结构承担报告排序，原列表继续保持不变。

这里省略的日期和工时字段会在完整程序中补齐。局部片段只用于观察 List 的顺序职责，不是另一个可以直接
运行的程序。

### 2. Map 把任务状态关联到数量

状态计数适合使用 `Map<TaskStatus, Integer>`：键是状态，值是当前数量。先为三个已知状态放入零，后续每
遇到一个任务就读取旧值并写回新值：

```java
Map<TaskStatus, Integer> statusCounts = new LinkedHashMap<>();
statusCounts.put(TaskStatus.TODO, 0);
statusCounts.put(TaskStatus.IN_PROGRESS, 0);
statusCounts.put(TaskStatus.DONE, 0);

TaskStatus status = TaskStatus.IN_PROGRESS;
statusCounts.put(status, statusCounts.get(status) + 1);

System.out.println(statusCounts.get(TaskStatus.IN_PROGRESS));
```

输出为 `1`。`get` 取得原来的零，`+ 1` 产生新整数，`put` 再把状态关联到新值。预先放入全部状态后，
`get` 不会因为尚未出现某状态而得到 `null`。

### 3. 一次循环同步累计多项指标

每个任务只需访问一次，就可以同时更新状态数量、计划工时、完成工时和逾期列表：

```java
for (Task task : tasks) {
    TaskStatus status = task.getStatus();
    statusCounts.put(status, statusCounts.get(status) + 1);
    totalPlannedHours = totalPlannedHours.add(task.getPlannedHours());
    totalCompletedHours = totalCompletedHours.add(task.getCompletedHours());

    if (isOverdue(task, reportDate)) {
        overdueTasks.add(task);
    }
}
```

循环结束后，所有汇总值都对应同一份任务快照。这里不是为了追求“只循环一次”的技巧，而是让指标来自同一条
清晰的数据路径。循环中的每个赋值都能在报告输出中找到对应观察点。

## 三、连接日期与精确工时

### 1. 逾期由日期和状态共同决定

截止日期早于统计日期，只说明时间已经过去；已完成任务不应继续进入待处理的逾期清单。完整判断包含两个
条件：

```java
boolean overdue = task.getStatus() != TaskStatus.DONE
        && task.getDeadline().isBefore(reportDate);
```

`isBefore` 只在截止日期严格早于统计日期时返回 `true`。截止日期等于统计日期的任务在本课口径中不算逾期。
状态条件再排除 `DONE`，因此 `TF-102` 即使截止日期是 `2026-08-17`，也不会在 `2026-08-18` 的逾期清单中
出现。

### 2. BigDecimal 累计时必须接住返回值

计划工时和完成工时都从精确的零开始：

```java
BigDecimal totalPlannedHours = BigDecimal.ZERO;
BigDecimal totalCompletedHours = BigDecimal.ZERO;

totalPlannedHours = totalPlannedHours.add(task.getPlannedHours());
totalCompletedHours = totalCompletedHours.add(task.getCompletedHours());
```

`BigDecimal` 不可变，`add` 不会修改左侧对象，而是返回计算结果。循环每次都把返回值重新赋给累计变量，最后
才能得到全部任务的合计。完整程序使用字符串构造任务工时，避免先产生 `double` 近似值。

### 3. 完成率必须处理零计划工时

正常公式先乘以 `100`，再除以计划工时，并明确一位小数和舍入方式：

```java
BigDecimal progress = completedHours
        .multiply(new BigDecimal("100"))
        .divide(plannedHours, 1, RoundingMode.HALF_UP);
```

乘法先发生不会丢失十进制信息。若计划工时为零，除法没有有效业务结果，完整程序按本课约定返回 `0.0`：

```java
if (plannedHours.compareTo(BigDecimal.ZERO) == 0) {
    return new BigDecimal("0.0");
}
```

这不是所有系统都必须采用的规则。真实产品也可以把“没有计划工时”显示成未设置，但那需要后续的数据合同。
本课选择 `0.0%`，是为了让控制台报告具有明确且可运行的口径。

## 四、为报告排序而不改动输入

### 1. List.sort 会改变接收者顺序

调用 `tasks.sort(comparator)` 后，`tasks` 自身的元素位置会变化。若调用方还要按录入顺序使用同一列表，直接
排序会产生隐藏副作用。报告先创建新的列表结构：

```java
List<Task> overdueTasks = new ArrayList<>();
// 循环把逾期任务加入 overdueTasks
```

完整程序只排序 `overdueTasks`，原始 `tasks` 从未调用 `sort`。另一种常见场景是需要排序全部任务，此时也
可以用 `new ArrayList<>(tasks)` 先复制列表结构。

**社区补充：** 社区问答中，开发者真实提出了“不改变原列表怎样排序”的问题。经 Java 8 与 JDK 25 实跑
核验，复制列表结构后排序副本可以保留原列表顺序；但复制的是元素引用，如果元素本身可变，通过任一列表修改
同一个任务对象仍会影响另一边。本课任务字段使用 `final`，报告过程也不修改任务对象。

### 2. 截止日期相同后继续比较编号

逾期任务先按截止日期升序排列，同一天再按编号排列：

```java
overdueTasks.sort(
        Comparator.comparing(Task::getDeadline)
                .thenComparing(Task::getId)
);
```

只比较日期时，同一天任务会保留进入列表时的相对顺序，但报告的唯一顺序仍依赖输入。追加编号后，相同任务集
无论以什么顺序到达，都能得到确定的逾期明细顺序。

### 3. 汇总顺序与明细顺序分开负责

状态数量、工时合计与任务顺序无关，因此在原列表的一次循环中计算。逾期明细需要给人阅读，才对筛选后的列表
排序。这种分工让“统计什么”和“怎样展示”互不干扰，也避免为排序而重复计算汇总值。

## 五、JDK 25 与 Java 8 使用同一实现

### 1. 本课采用的 API 在 Java 8 已经可用

本课使用的增强 for 循环、泛型集合、`List.sort`、`Comparator.comparing`、`thenComparing`、方法引用、
`LocalDate`、`BigDecimal` 和 `RoundingMode` 都可在 Java 8 中使用。它们在本课范围没有需要分叉的行为，
因此完整程序和练习只展示一份通用源码，避免把相同代码伪装成版本差异。

### 2. 两个项目仍要分别核对 SDK

在 IntelliJ IDEA 中准备两个独立普通 Java 项目。JDK 25 项目的 Project SDK 与模块 SDK 都选择 JDK 25；
Java 8 项目的 Project SDK 与模块 SDK 都选择已安装的 JDK 8。分别运行同名类时，还要在 Run 窗口核对实际
命令使用的 Java 路径，不能只看编辑器右下角显示。

本课没有 Maven 配置。若 Project SDK 是 JDK 8，而模块 SDK 或运行配置仍指向 JDK 25，代码可能运行成功，
却不能证明 Java 8 兼容性。

### 3. 不用后续 API 重写当前流程

Stream 可以完成筛选、排序和聚合，但它属于后续独立课程。这里保留普通循环，让每次状态更新和
`BigDecimal` 重新赋值都可直接观察。异常恢复、文件导出和文本格式化也分别留给后续课程，本课只输出固定的
控制台文本。

## 六、六个典型错误

以下错误都能在 JDK 25 与 Java 8 中复现。社区资料帮助定位了整数百分比和列表副作用两类真实误用，技术
结论同时由官方 API 合同与本课双版本运行结果核对。

:::pitfalls
### 用 LocalDate.now 隐藏统计日期

**触发条件：** 示例或验收要求固定报告，却在计算入口直接读取运行当天。

**原因：** `LocalDate.now()` 从默认时区取得当前日期，结果会随运行日期和环境变化。

**后果：** 同一批任务今天与明天得到不同逾期清单，课程输出和自动核对都不稳定。

**错误示例：**

```java
LocalDate reportDate = LocalDate.now();
```

**正确写法：**

```java
LocalDate reportDate = LocalDate.of(2026, 8, 18);
```

**验证方式：** 在不同日期运行正确片段，`reportDate` 都打印为 `2026-08-18`；需要实时报告时，应由调用方
显式传入“今天”，而不是把时间来源藏在统计方法里。

### 先做整数除法再计算百分比

**触发条件：** 计划工时和完成工时使用 `int`，并写出 `completed / planned * 100`。

**原因：** 两个整数相除先执行整数除法，`33 / 48` 的小数部分被截断，得到零后再乘 `100` 仍是零。

**后果：** 实际已经完成一部分工作，报告却显示 `0%`。

**错误示例：**

```java
int plannedHours = 48;
int completedHours = 33;
int progress = completedHours / plannedHours * 100;
System.out.println(progress);
```

**正确写法：**

```java
BigDecimal plannedHours = new BigDecimal("48.0");
BigDecimal completedHours = new BigDecimal("33.0");
BigDecimal progress = completedHours
        .multiply(new BigDecimal("100"))
        .divide(plannedHours, 1, RoundingMode.HALF_UP);
System.out.println(progress.toPlainString());
```

**验证方式：** 错误版输出 `0`，正确版输出 `68.8`。本课使用 `BigDecimal`，不以浮点近似替代精确工时合同。

### 忘记接住 BigDecimal.add 的结果

**触发条件：** 在循环中调用 `total.add(value)`，却没有重新赋值。

**原因：** `BigDecimal` 不可变，`add` 返回新对象，原来的 `total` 仍是零。

**后果：** 每个任务都被遍历了，报告中的计划工时和完成工时却始终为零。

**错误示例：**

```java
BigDecimal total = BigDecimal.ZERO;
total.add(new BigDecimal("8.0"));
System.out.println(total.toPlainString());
```

**正确写法：**

```java
BigDecimal total = BigDecimal.ZERO;
total = total.add(new BigDecimal("8.0"));
System.out.println(total.toPlainString());
```

**验证方式：** 错误版输出 `0`，正确版输出 `8.0`。

### 直接排序调用方的任务列表

**触发条件：** 为了输出截止日期顺序，直接对传入的 `tasks` 调用 `sort`。

**原因：** `List.sort` 在当前可修改列表上重新排列元素，不会自动创建报告专用副本。

**后果：** 报告生成后，调用方原来的录入顺序也被改变，后续界面或逻辑可能出现意外顺序。

**错误示例：**

```java
tasks.sort(Comparator.comparing(Task::getDeadline));
System.out.println(tasks.get(0).getId());
```

**正确写法：**

```java
List<Task> sortedTasks = new ArrayList<>(tasks);
sortedTasks.sort(Comparator.comparing(Task::getDeadline));
System.out.println(tasks.get(0).getId());
```

**验证方式：** 准备首项为 `TF-101`、但它不是最早截止项的列表；错误版改变 `tasks` 首项，正确版仍输出
`TF-101`，排序结果只存在于 `sortedTasks`。

### 只看日期就把已完成任务报为逾期

**触发条件：** 截止日期早于统计日期，但任务状态已经是 `DONE`。

**原因：** 判断只调用 `deadline.isBefore(reportDate)`，遗漏了“尚未完成”这一业务条件。

**后果：** 已按时完成或已经关闭的任务继续出现在逾期清单，状态数量与逾期明细互相矛盾。

**错误示例：**

```java
boolean overdue = task.getDeadline().isBefore(reportDate);
```

**正确写法：**

```java
boolean overdue = task.getStatus() != TaskStatus.DONE
        && task.getDeadline().isBefore(reportDate);
```

**验证方式：** 使用截止日期 `2026-08-17`、状态 `DONE` 和统计日期 `2026-08-18`；错误版为 `true`，正确版
为 `false`。

### 相同截止日期没有稳定的次级顺序

**触发条件：** 两个逾期任务截止日期相同，而比较器只比较日期。

**原因：** 日期相等时比较结果为零，最终相对顺序继续依赖输入顺序。

**后果：** 相同任务集以不同顺序传入时，报告明细也不同，不利于逐行比较结果。

**错误示例：**

```java
Comparator<Task> order = Comparator.comparing(Task::getDeadline);
```

**正确写法：**

```java
Comparator<Task> order = Comparator.comparing(Task::getDeadline)
        .thenComparing(Task::getId);
```

**验证方式：** 准备两个截止日期相同、编号分别为 `TF-102` 和 `TF-101` 的任务并交换输入顺序；正确版两次
都把 `TF-101` 排在前面。
:::

## 七、完整的 TeamFlow 项目进度报告

### 1. 程序要解决的问题

下面的程序在 `2026-08-18` 统计四个任务。它用 Map 汇总三个状态，用 BigDecimal 累计工时并计算完成率，
筛选尚未完成且已经过期的任务，再按截止日期和编号排序逾期副本。程序最后打印原列表首项，验证报告没有
改变调用方顺序。

### 2. JDK 25 与 Java 8 通用完整程序

在普通 Java 项目的 `src` 下创建 `TeamFlowProgressReportApplication.java`，填写完整代码：

```java
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class TeamFlowProgressReportApplication {
    /**
     * 创建固定任务并输出指定日期的项目进度报告。
     *
     * @param args 命令行参数，本程序不使用
     */
    public static void main(String[] args) {
        List<Task> tasks = createTasks();
        LocalDate reportDate = LocalDate.of(2026, 8, 18);

        printReport(tasks, reportDate);
    }

    /**
     * 创建本课用于统计的固定 TeamFlow 任务。
     *
     * @return 按任务编号排列的任务列表
     */
    private static List<Task> createTasks() {
        List<Task> tasks = new ArrayList<>();
        tasks.add(new Task(
                "TF-101",
                "设计登录页",
                TaskStatus.IN_PROGRESS,
                LocalDate.of(2026, 8, 16),
                new BigDecimal("16.0"),
                new BigDecimal("10.0")
        ));
        tasks.add(new Task(
                "TF-102",
                "编写任务接口",
                TaskStatus.DONE,
                LocalDate.of(2026, 8, 17),
                new BigDecimal("20.0"),
                new BigDecimal("20.0")
        ));
        tasks.add(new Task(
                "TF-103",
                "补充接口文档",
                TaskStatus.TODO,
                LocalDate.of(2026, 8, 20),
                new BigDecimal("8.0"),
                new BigDecimal("0.0")
        ));
        tasks.add(new Task(
                "TF-104",
                "修复进度统计",
                TaskStatus.IN_PROGRESS,
                LocalDate.of(2026, 8, 15),
                new BigDecimal("4.0"),
                new BigDecimal("3.0")
        ));
        return tasks;
    }

    /**
     * 汇总并输出一份不改变输入列表顺序的项目进度报告。
     *
     * @param tasks 要统计的任务
     * @param reportDate 报告统计日期
     */
    private static void printReport(List<Task> tasks, LocalDate reportDate) {
        Map<TaskStatus, Integer> statusCounts = createStatusCounts();
        BigDecimal totalPlannedHours = BigDecimal.ZERO;
        BigDecimal totalCompletedHours = BigDecimal.ZERO;
        List<Task> overdueTasks = new ArrayList<>();

        for (Task task : tasks) {
            TaskStatus status = task.getStatus();
            statusCounts.put(status, statusCounts.get(status) + 1);
            totalPlannedHours = totalPlannedHours.add(task.getPlannedHours());
            totalCompletedHours = totalCompletedHours.add(task.getCompletedHours());

            if (isOverdue(task, reportDate)) {
                overdueTasks.add(task);
            }
        }

        overdueTasks.sort(
                Comparator.comparing(Task::getDeadline)
                        .thenComparing(Task::getId)
        );

        BigDecimal progress = calculateProgress(totalCompletedHours, totalPlannedHours);

        System.out.println("=== TeamFlow 项目进度报告 ===");
        System.out.println("统计日期: " + reportDate);
        System.out.println("任务总数: " + tasks.size());
        System.out.println("待处理: " + statusCounts.get(TaskStatus.TODO));
        System.out.println("进行中: " + statusCounts.get(TaskStatus.IN_PROGRESS));
        System.out.println("已完成: " + statusCounts.get(TaskStatus.DONE));
        System.out.println("计划工时: " + totalPlannedHours.toPlainString() + " 小时");
        System.out.println("完成工时: " + totalCompletedHours.toPlainString() + " 小时");
        System.out.println("工时完成率: " + progress.toPlainString() + "%");
        System.out.println("逾期任务:");

        for (Task task : overdueTasks) {
            System.out.println(
                    "- " + task.getId()
                            + " | " + task.getTitle()
                            + " | " + task.getDeadline()
            );
        }

        System.out.println("原列表首项: " + tasks.get(0).getId());
    }

    /**
     * 创建包含全部任务状态且初始值为零的计数表。
     *
     * @return 按报告显示顺序排列的状态计数表
     */
    private static Map<TaskStatus, Integer> createStatusCounts() {
        Map<TaskStatus, Integer> statusCounts = new LinkedHashMap<>();
        statusCounts.put(TaskStatus.TODO, 0);
        statusCounts.put(TaskStatus.IN_PROGRESS, 0);
        statusCounts.put(TaskStatus.DONE, 0);
        return statusCounts;
    }

    /**
     * 按一位小数和 HALF_UP 规则计算工时完成百分比。
     *
     * @param completedHours 已完成工时
     * @param plannedHours 计划工时
     * @return 工时完成百分比，计划工时为零时返回 0.0
     */
    private static BigDecimal calculateProgress(
            BigDecimal completedHours,
            BigDecimal plannedHours
    ) {
        if (plannedHours.compareTo(BigDecimal.ZERO) == 0) {
            return new BigDecimal("0.0");
        }

        return completedHours
                .multiply(new BigDecimal("100"))
                .divide(plannedHours, 1, RoundingMode.HALF_UP);
    }

    /**
     * 判断任务在统计日期是否尚未完成且已经超过截止日期。
     *
     * @param task 要判断的任务
     * @param reportDate 报告统计日期
     * @return 尚未完成且截止日期早于统计日期时返回 true
     */
    private static boolean isOverdue(Task task, LocalDate reportDate) {
        return task.getStatus() != TaskStatus.DONE
                && task.getDeadline().isBefore(reportDate);
    }

    private enum TaskStatus {
        TODO,
        IN_PROGRESS,
        DONE
    }

    private static class Task {
        private final String id;
        private final String title;
        private final TaskStatus status;
        private final LocalDate deadline;
        private final BigDecimal plannedHours;
        private final BigDecimal completedHours;

        /**
         * 创建一项用于项目进度统计的固定任务。
         *
         * @param id 任务编号
         * @param title 任务标题
         * @param status 任务状态
         * @param deadline 截止日期
         * @param plannedHours 计划工时
         * @param completedHours 已完成工时
         */
        private Task(
                String id,
                String title,
                TaskStatus status,
                LocalDate deadline,
                BigDecimal plannedHours,
                BigDecimal completedHours
        ) {
            this.id = id;
            this.title = title;
            this.status = status;
            this.deadline = deadline;
            this.plannedHours = plannedHours;
            this.completedHours = completedHours;
        }

        /**
         * 返回任务编号。
         *
         * @return 任务编号
         */
        private String getId() {
            return id;
        }

        /**
         * 返回任务标题。
         *
         * @return 任务标题
         */
        private String getTitle() {
            return title;
        }

        /**
         * 返回任务状态。
         *
         * @return 任务状态
         */
        private TaskStatus getStatus() {
            return status;
        }

        /**
         * 返回任务截止日期。
         *
         * @return 截止日期
         */
        private LocalDate getDeadline() {
            return deadline;
        }

        /**
         * 返回计划工时。
         *
         * @return 计划工时
         */
        private BigDecimal getPlannedHours() {
            return plannedHours;
        }

        /**
         * 返回已完成工时。
         *
         * @return 已完成工时
         */
        private BigDecimal getCompletedHours() {
            return completedHours;
        }
    }
}
```

### 3. 两个版本的 IDEA 配置与运行步骤

**JDK 25 项目：**

1. 打开 Project Structure，把 Project SDK 和当前模块 SDK 都设为 JDK 25。
2. 确认文件名与 public 类名都是 `TeamFlowProgressReportApplication`。
3. 点击 `main` 左侧运行图标，选择运行 `TeamFlowProgressReportApplication.main()`。
4. 在 Run 窗口核对启动命令的 Java 路径指向 JDK 25，并观察完整报告。

**Java 8 项目：**

1. 新建独立普通 Java 项目，把 Project SDK 和模块 SDK 都设为已安装的 JDK 8。
2. 创建同名 `TeamFlowProgressReportApplication.java`，填写上面的完整通用源码。
3. 点击 `main` 左侧运行图标，运行同一个入口。
4. 在 Run 窗口核对 Java 路径指向 JDK 8，并将输出与 JDK 25 项目逐行比较。

### 4. 预期控制台输出

两个版本都应逐字输出：

```text
=== TeamFlow 项目进度报告 ===
统计日期: 2026-08-18
任务总数: 4
待处理: 1
进行中: 2
已完成: 1
计划工时: 48.0 小时
完成工时: 33.0 小时
工时完成率: 68.8%
逾期任务:
- TF-104 | 修复进度统计 | 2026-08-15
- TF-101 | 设计登录页 | 2026-08-16
原列表首项: TF-101
```

### 5. 从输出还原执行过程

四个任务依次进入循环，状态计数最终成为待处理 `1`、进行中 `2`、已完成 `1`，三项之和等于任务总数
`4`。计划工时为 `16.0 + 20.0 + 8.0 + 4.0 = 48.0`，完成工时为
`10.0 + 20.0 + 0.0 + 3.0 = 33.0`，按一位小数舍入后完成率为 `68.8%`。

`TF-102` 虽然截止日期早于统计日期，但状态是 `DONE`，所以被排除。`TF-104` 与 `TF-101` 尚未完成且已经
过期，按日期升序输出。最后仍显示 `原列表首项: TF-101`，证明逾期排序没有改变输入列表。

## 八、独立练习

### 1. 生成发布准备进度报告

:::exercise
### TeamFlow 发布准备报告

**要求：** 使用固定统计日期 `2026-08-18` 和三个任务生成发布准备报告。必须使用 List 保存任务、Map 统计
`TODO`、`IN_PROGRESS`、`DONE` 数量，用 BigDecimal 汇总计划与完成工时并按一位小数、`HALF_UP` 计算
百分比。逾期任务必须尚未完成且截止日期早于统计日期，并在独立列表中按日期、编号排序；禁止使用 Stream、
Optional、文件 API 或第三方库。JDK 25 与 Java 8 使用同一份源码。

**验收：** 输出任务总数 `3`，三个状态各 `1`，计划工时 `20.0`、完成工时 `13.5`、完成率 `67.5%`；逾期
清单只有 `TF-202`，原列表首项仍为 `TF-201`。状态数量之和必须等于任务总数。
:::

### 2. JDK 25 与 Java 8 通用参考实现

创建 `TeamFlowReleaseProgressApplication.java`：

```java
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class TeamFlowReleaseProgressApplication {
    /**
     * 创建固定发布任务并输出发布准备进度报告。
     *
     * @param args 命令行参数，本程序不使用
     */
    public static void main(String[] args) {
        List<Task> tasks = createTasks();
        LocalDate reportDate = LocalDate.of(2026, 8, 18);

        printReport(tasks, reportDate);
    }

    /**
     * 创建练习使用的固定发布任务。
     *
     * @return 按任务编号排列的发布任务列表
     */
    private static List<Task> createTasks() {
        List<Task> tasks = new ArrayList<>();
        tasks.add(new Task(
                "TF-201",
                "完成验收清单",
                TaskStatus.DONE,
                LocalDate.of(2026, 8, 19),
                new BigDecimal("6.0"),
                new BigDecimal("6.0")
        ));
        tasks.add(new Task(
                "TF-202",
                "修复移动端导航",
                TaskStatus.IN_PROGRESS,
                LocalDate.of(2026, 8, 17),
                new BigDecimal("10.0"),
                new BigDecimal("7.5")
        ));
        tasks.add(new Task(
                "TF-203",
                "补充部署说明",
                TaskStatus.TODO,
                LocalDate.of(2026, 8, 20),
                new BigDecimal("4.0"),
                new BigDecimal("0.0")
        ));
        return tasks;
    }

    /**
     * 汇总并输出发布准备进度报告。
     *
     * @param tasks 要统计的发布任务
     * @param reportDate 报告统计日期
     */
    private static void printReport(List<Task> tasks, LocalDate reportDate) {
        Map<TaskStatus, Integer> statusCounts = createStatusCounts();
        BigDecimal totalPlannedHours = BigDecimal.ZERO;
        BigDecimal totalCompletedHours = BigDecimal.ZERO;
        List<Task> overdueTasks = new ArrayList<>();

        for (Task task : tasks) {
            TaskStatus status = task.getStatus();
            statusCounts.put(status, statusCounts.get(status) + 1);
            totalPlannedHours = totalPlannedHours.add(task.getPlannedHours());
            totalCompletedHours = totalCompletedHours.add(task.getCompletedHours());

            if (isOverdue(task, reportDate)) {
                overdueTasks.add(task);
            }
        }

        overdueTasks.sort(
                Comparator.comparing(Task::getDeadline)
                        .thenComparing(Task::getId)
        );

        BigDecimal progress = calculateProgress(totalCompletedHours, totalPlannedHours);

        System.out.println("=== TeamFlow 发布准备进度报告 ===");
        System.out.println("统计日期: " + reportDate);
        System.out.println("任务总数: " + tasks.size());
        System.out.println("待处理: " + statusCounts.get(TaskStatus.TODO));
        System.out.println("进行中: " + statusCounts.get(TaskStatus.IN_PROGRESS));
        System.out.println("已完成: " + statusCounts.get(TaskStatus.DONE));
        System.out.println("计划工时: " + totalPlannedHours.toPlainString() + " 小时");
        System.out.println("完成工时: " + totalCompletedHours.toPlainString() + " 小时");
        System.out.println("工时完成率: " + progress.toPlainString() + "%");
        System.out.println("逾期任务:");

        for (Task task : overdueTasks) {
            System.out.println(
                    "- " + task.getId()
                            + " | " + task.getTitle()
                            + " | " + task.getDeadline()
            );
        }

        System.out.println("原列表首项: " + tasks.get(0).getId());
    }

    /**
     * 创建包含全部任务状态且初始值为零的计数表。
     *
     * @return 按报告显示顺序排列的状态计数表
     */
    private static Map<TaskStatus, Integer> createStatusCounts() {
        Map<TaskStatus, Integer> statusCounts = new LinkedHashMap<>();
        statusCounts.put(TaskStatus.TODO, 0);
        statusCounts.put(TaskStatus.IN_PROGRESS, 0);
        statusCounts.put(TaskStatus.DONE, 0);
        return statusCounts;
    }

    /**
     * 按一位小数和 HALF_UP 规则计算工时完成百分比。
     *
     * @param completedHours 已完成工时
     * @param plannedHours 计划工时
     * @return 工时完成百分比，计划工时为零时返回 0.0
     */
    private static BigDecimal calculateProgress(
            BigDecimal completedHours,
            BigDecimal plannedHours
    ) {
        if (plannedHours.compareTo(BigDecimal.ZERO) == 0) {
            return new BigDecimal("0.0");
        }

        return completedHours
                .multiply(new BigDecimal("100"))
                .divide(plannedHours, 1, RoundingMode.HALF_UP);
    }

    /**
     * 判断发布任务在统计日期是否尚未完成且已经超过截止日期。
     *
     * @param task 要判断的发布任务
     * @param reportDate 报告统计日期
     * @return 尚未完成且截止日期早于统计日期时返回 true
     */
    private static boolean isOverdue(Task task, LocalDate reportDate) {
        return task.getStatus() != TaskStatus.DONE
                && task.getDeadline().isBefore(reportDate);
    }

    private enum TaskStatus {
        TODO,
        IN_PROGRESS,
        DONE
    }

    private static class Task {
        private final String id;
        private final String title;
        private final TaskStatus status;
        private final LocalDate deadline;
        private final BigDecimal plannedHours;
        private final BigDecimal completedHours;

        /**
         * 创建一项用于发布准备统计的固定任务。
         *
         * @param id 任务编号
         * @param title 任务标题
         * @param status 任务状态
         * @param deadline 截止日期
         * @param plannedHours 计划工时
         * @param completedHours 已完成工时
         */
        private Task(
                String id,
                String title,
                TaskStatus status,
                LocalDate deadline,
                BigDecimal plannedHours,
                BigDecimal completedHours
        ) {
            this.id = id;
            this.title = title;
            this.status = status;
            this.deadline = deadline;
            this.plannedHours = plannedHours;
            this.completedHours = completedHours;
        }

        /**
         * 返回任务编号。
         *
         * @return 任务编号
         */
        private String getId() {
            return id;
        }

        /**
         * 返回任务标题。
         *
         * @return 任务标题
         */
        private String getTitle() {
            return title;
        }

        /**
         * 返回任务状态。
         *
         * @return 任务状态
         */
        private TaskStatus getStatus() {
            return status;
        }

        /**
         * 返回任务截止日期。
         *
         * @return 截止日期
         */
        private LocalDate getDeadline() {
            return deadline;
        }

        /**
         * 返回计划工时。
         *
         * @return 计划工时
         */
        private BigDecimal getPlannedHours() {
            return plannedHours;
        }

        /**
         * 返回已完成工时。
         *
         * @return 已完成工时
         */
        private BigDecimal getCompletedHours() {
            return completedHours;
        }
    }
}
```

### 3. 两个版本的运行与验收

JDK 25 项目把 Project SDK 和模块 SDK 设为 JDK 25；Java 8 项目把两处都设为 JDK 8。分别创建同名文件、
运行 `main`，并核对 Run 窗口中的 Java 路径。两个版本都应输出：

```text
=== TeamFlow 发布准备进度报告 ===
统计日期: 2026-08-18
任务总数: 3
待处理: 1
进行中: 1
已完成: 1
计划工时: 20.0 小时
完成工时: 13.5 小时
工时完成率: 67.5%
逾期任务:
- TF-202 | 修复移动端导航 | 2026-08-17
原列表首项: TF-201
```

验收时先检查三个状态数量相加是否为 `3`，再手算工时 `6.0 + 10.0 + 4.0 = 20.0` 和
`6.0 + 7.5 + 0.0 = 13.5`。`TF-202` 是唯一尚未完成且截止日期早于统计日期的任务。最后的 `TF-201`
证明逾期排序没有改变原列表。

## 九、把报告能力放回 TeamFlow

### 1. 本课形成的是内存统计边界

TeamFlow 现在可以接收一批已经存在的任务，在固定日期生成状态、工时和逾期报告。后续接入 Web 和数据库时，
任务可能来自请求或持久化查询，但“同一批任务、明确统计日期、精确完成率、排序不污染输入”仍是可以保留的
核心规则。

### 2. 自我检查

完成本课后，应能独立解释并验证：

- 为什么统计日期要显式传入，固定示例不能直接依赖 `LocalDate.now()`。
- 为什么状态计数之和必须等于任务总数。
- 为什么逾期判断必须同时检查日期和完成状态。
- 为什么 `BigDecimal.add` 的结果要重新赋值，除法要明确舍入规则。
- 为什么报告排序应操作副本，以及浅复制并没有复制任务对象本身。
- 为什么本课在 JDK 25 与 Java 8 中使用同一份源码，却仍要分别核对 Project SDK、模块 SDK 和运行路径。
