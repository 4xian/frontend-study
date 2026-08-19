---
id: backend.java.learn.basics.stream-processing
type: lesson
title: Stream
summary: 把集合数据组织成一次性流水线，使用中间操作完成筛选与转换，并用终止操作聚合或收集结果
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 120
prerequisites:
  - backend.java.learn.intermediate.lambda-stream-and-collectors
objectives:
  - 能区分 Collection 保存数据与 Stream 传递数据的职责。
  - 能用数据源、中间操作和终止操作解释一条 Stream 流水线。
  - 能组合 filter、map、flatMap、distinct、sorted 和 limit 处理任务数据。
  - 能用 count、match、带初始值的 reduce 和 collect 得到可观察结果。
  - 能选择 toList、joining、groupingBy、toMap 和 toCollection 处理不同结果合同。
  - 能识别惰性执行、单次消费、重复键、顺序变化和共享副作用等主要风险。
recap:
  - Collection 负责保存元素，Stream 负责让元素经过一条声明式流水线，本身不存储数据。
  - 一条流水线由数据源、零个或多个惰性中间操作和一个终止操作组成。
  - filter 选择元素，map 一对一转换，flatMap 把多个子流摊平成一条流。
  - count、match、reduce 和 collect 都会触发流水线执行，并消费当前 Stream。
  - encounter order 会影响 sorted、limit、joining 等结果，操作顺序也是业务语义的一部分。
  - 行为参数应当无干扰且通常无状态，不要在 Lambda 中修改数据源或累积共享结果。
  - JDK 25 可以使用 Stream.toList() 得到不可修改列表，Java 8 使用 collect(Collectors.toList())。
related: []
tags:
  - Java
  - Stream
  - 流水线
  - 数据处理
  - Collectors
appliesTo: JDK 25 主线；Java 8 兼容说明
verifiedAt: 2026-08-18
sources:
  - id: java25-stream-package
    title: Java SE 25 API - java.util.stream Package
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/package-summary.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - Stream 与数据源的区别、流水线结构、惰性执行和单次消费合同
      - 行为参数的无干扰、无状态要求以及 encounter order
  - id: java25-stream-api
    title: Java SE 25 API - Stream
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - 常用中间操作和终止操作的行为合同
      - Stream.toList 返回不可修改列表且自 Java 16 提供
  - id: java25-collectors-api
    title: Java SE 25 API - Collectors
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Collectors.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - toList、toCollection、joining、groupingBy 与 toMap 的收集合同
      - toMap 重复键失败和合并函数重载
  - id: java8-stream-package
    title: Java SE 8 API - java.util.stream Package
    url: https://docs.oracle.com/javase/8/docs/api/java/util/stream/package-summary.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 已支持 Stream 流水线、惰性执行、单次消费、无干扰和无状态合同
  - id: java8-stream-api
    title: Java SE 8 API - Stream
    url: https://docs.oracle.com/javase/8/docs/api/java/util/stream/Stream.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 中本课核心中间操作、终止操作和 collect 的可用范围
  - id: java8-collectors-api
    title: Java SE 8 API - Collectors
    url: https://docs.oracle.com/javase/8/docs/api/java/util/stream/Collectors.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 收集器的可用范围以及 Collectors.toList 不承诺结果列表具体属性
  - id: stackoverflow-stream-reuse
    title: Copy a stream to avoid stream has already been operated upon or closed
    url: https://stackoverflow.com/questions/23860533/copy-a-stream-to-avoid-stream-has-already-been-operated-upon-or-closed
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 及以上
    claims:
      - 重复消费同一 Stream 的真实误区以及重新创建流水线的处理思路
  - id: stackoverflow-tomap-duplicate-key
    title: Java 8 Collectors.toMap Duplicate key
    url: https://stackoverflow.com/questions/57311435/java-8-collectors-tomap-duplicate-key
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 及以上
    claims:
      - toMap 遇到重复键时的真实异常现象和冲突处理选择
---

# Stream

TeamFlow 已经能够把任务放进 `List`，也能用 Lambda 描述“保留未完成任务”或“把任务变成标题”等行为。
当一次查询同时需要筛选、排序、截取和汇总时，继续手写多个临时集合会让数据处理步骤散落在循环中。

Stream 把这些步骤连成一条可以阅读的数据流水线。本课只处理内存中的顺序流：从集合取得数据，组合常用
中间操作，再用终止操作得到列表、数字、布尔值、字符串或分组结果。Optional、并行流调优、Gatherer 和
自定义 Collector 都留在后续或专项内容中。

## 一、先建立流水线模型

### 1. Collection 保存数据，Stream 传递数据

`List`、`Set` 和 `Map` 等集合拥有元素，可以反复读取，也能按各自合同增加或删除元素。Stream 不拥有另一份
数据，它只描述元素从数据源经过哪些操作。调用 `tasks.stream()` 不会复制 `tasks`，也不会自动修改它。

| 对比点 | Collection | Stream |
| --- | --- | --- |
| 主要职责 | 保存和组织元素 | 描述元素的处理过程 |
| 是否拥有数据 | 是 | 否，元素来自数据源 |
| 能否反复遍历 | 可以按集合合同再次遍历 | 一条 Stream 通常只能消费一次 |
| 操作时机 | 集合方法通常立即改变或查询集合 | 中间操作惰性，终止操作触发执行 |
| 对原数据的默认影响 | 修改方法可以改变集合 | 正常流水线不修改数据源 |

下面的 `openTitles` 是新结果，原来的 `tasks` 仍保留三条记录：

```java
List<String> tasks = Arrays.asList("OPEN|整理需求", "DONE|修复登录", "OPEN|发布检查");

List<String> openTitles = tasks.stream()
    .filter(task -> task.startsWith("OPEN|"))
    .map(task -> task.substring(5))
    .toList();

System.out.println(openTitles);
System.out.println(tasks.size());
```

JDK 25 的结果是：

```text
[整理需求, 发布检查]
3
```

`filter` 只让两条 `OPEN` 记录继续向后传递，`map` 再去掉状态前缀。流水线没有调用 `tasks` 的修改方法，
所以数据源数量仍是 `3`。

### 2. 一条流水线有三个位置

一条 Stream 流水线由数据源、零个或多个中间操作、一个终止操作组成：

```text
数据源 tasks
    -> stream()
中间操作 filter(...)
    -> map(...)
终止操作 toList()
    -> 结果 openTitles
```

- `tasks.stream()` 从集合建立顺序流，`tasks` 是数据源。
- `filter`、`map` 返回新的 Stream，可以继续接操作，属于中间操作。
- `toList` 结束流水线并返回列表，属于终止操作。

中间操作只记录“将来怎样处理”，终止操作才向数据源请求元素并推动它们经过整条流水线。因此流水线不是
先创建一整个过滤结果，再创建一整个转换结果；实现可以让一个元素连续通过多个步骤后再处理下一个元素。

### 3. 中间操作是惰性的

下面的筛选 Lambda 会输出观察信息，但第一条流水线没有终止操作：

```java
import java.util.stream.Stream;

public class LazyStreamDemo {
    /**
     * 演示终止操作如何触发惰性流水线。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        Stream<String> pending = Stream.of("TASK-101", "TASK-102")
            .filter(taskId -> {
                System.out.println("检查 " + taskId);
                return taskId.endsWith("2");
            });

        System.out.println("流水线已创建");
        long matched = pending.count();
        System.out.println("匹配数量: " + matched);
    }
}
```

运行结果是：

```text
流水线已创建
检查 TASK-101
检查 TASK-102
匹配数量: 1
```

先出现“流水线已创建”，证明构造 `pending` 时筛选体没有执行。`count()` 是终止操作，它需要知道匹配数量，
于是数据才依次经过 `filter`。这里的输出只用于观察惰性，不应把打印或修改外部状态当成筛选逻辑的一部分。

## 二、用中间操作塑造数据

### 1. filter 选择，map 转换

`filter` 接收 `Predicate<T>`：返回 `true` 的元素继续前进，返回 `false` 的元素被排除。`map` 接收
`Function<T, R>`：每个输入产生一个输出，输出类型可以与输入不同。

假设 `tasks` 是 `List<Task>`，以下流水线先选择未完成任务，再把 `Task` 转成用于控制台展示的 `String`：

```java
List<String> pendingLines = tasks.stream()
    .filter(task -> !"DONE".equals(task.status()))
    .map(task -> task.id() + " | " + task.title())
    .toList();
```

`filter` 不改变任务对象，`map` 也不是修改任务，而是建立“一个任务对应一行文本”的转换。若四条任务中有
三条未完成，`pendingLines` 就有三行；这是一对一转换，但只作用于筛选后留下的元素。

### 2. flatMap 摊平嵌套元素

一条任务可能有多个标签。只使用 `map(Task::tags)` 得到的是 `Stream<List<String>>`，其中每个流元素仍是一整
个标签列表。若要把所有标签放进同一条 `Stream<String>`，需要让每个列表产生一个子流，再由 `flatMap`
摊平：

```java
List<String> tags = tasks.stream()
    .flatMap(task -> task.tags().stream())
    .distinct()
    .sorted()
    .toList();
```

例如标签列表依次为 `[backend, api]`、`[api, test]`，摊平后元素依次是 `backend`、`api`、`api`、`test`。
后续 `distinct` 去重，最终得到 `[api, backend, test]`。`flatMap` 解决的是“一条输入对应零条或多条输出”的
结构问题，不是把字符串手工拼起来。

### 3. distinct、sorted 和 limit 控制结果集合

这三个操作仍然返回 Stream：

- `distinct()` 按元素的 `equals` 合同去重。
- `sorted()` 使用自然顺序；`sorted(comparator)` 使用给定比较器。
- `limit(n)` 最多保留前 `n` 个元素，`n` 必须大于等于零。

```java
List<String> focusTasks = tasks.stream()
    .filter(task -> !"DONE".equals(task.status()))
    .sorted(Comparator.comparingInt(Task::priority).thenComparing(Task::id))
    .limit(2)
    .map(task -> task.id() + " | " + task.title())
    .toList();
```

这里先按较小的优先级数字排在前面，同优先级再按任务编号排序，最后截取两条。`limit(2)` 取的是当前
encounter order 中的前两条；如果把它移到 `sorted` 前面，含义会变成“先取数据源前两条，再只排序这两条”。

`distinct` 对自定义对象是否能正确去重，取决于对象的 `equals` 和 `hashCode` 合同。本课示例主要对字符串
去重，避免把对象相等合同重新展开成另一课。

## 三、用终止操作得到答案

### 1. count 和 match 回答查询问题

`count()` 返回流水线中的元素数量。`anyMatch`、`allMatch`、`noneMatch` 接收判断 Lambda，并返回布尔值：

```java
long completedCount = tasks.stream()
    .filter(task -> "DONE".equals(task.status()))
    .count();

boolean hasBlockedTask = tasks.stream()
    .anyMatch(task -> "BLOCKED".equals(task.status()));

boolean allHaveTitles = tasks.stream()
    .allMatch(task -> !task.title().isEmpty());

boolean noneHasNegativePriority = tasks.stream()
    .noneMatch(task -> task.priority() < 0);
```

若任务中有一条 `DONE` 和一条 `BLOCKED`，并且所有标题非空、优先级都非负，结果依次是 `1`、`true`、
`true`、`true`。match 操作可以短路：`anyMatch` 找到第一个满足条件的元素后就能得到 `true`，不必继续请求
后续元素；`allMatch` 遇到第一个不满足项也能立即得到 `false`。

### 2. 带初始值的 reduce 把多个值合成一个值

`reduce` 反复使用同一种合并规则，把多个流元素归约为一个结果。本课只使用带 identity 的重载，避免提前
引入下一课才讲的 Optional：

```java
int pendingPriorityTotal = tasks.stream()
    .filter(task -> !"DONE".equals(task.status()))
    .map(Task::priority)
    .reduce(0, Integer::sum);
```

`0` 是 identity：没有未完成任务时结果仍是 `0`；有元素时，合并过程可以理解为从 `0` 开始依次加上每个
优先级。`Integer::sum` 接收当前累计值和下一个元素，返回新的累计值。

identity 必须与合并规则匹配。求和用 `0`，若误用 `10`，任何非空结果都会额外多出 `10`，空流也会得到
不符合业务含义的 `10`。

### 3. 终止操作会消费当前 Stream

`count`、match、`reduce`、`collect`、`toList` 都是终止操作。终止后不能在同一个 Stream 对象上启动第二次
计算；需要另一个答案时，从可重复读取的数据源创建一条新流水线：

```java
long openCount = tasks.stream()
    .filter(task -> "OPEN".equals(task.status()))
    .count();

boolean hasOpenTask = tasks.stream()
    .anyMatch(task -> "OPEN".equals(task.status()));
```

上面两次 `tasks.stream()` 创建了两个 Stream，数据源仍是同一个集合。这不同于把第一次得到的 Stream 保存
下来并终止两次。

**社区补充：** Stack Overflow 的真实问题询问如何复制 Stream 以反复处理同一批数据。适用于 Java 8 及以上
的官方合同与社区高票解释一致：Stream 面向一次消费；需要反复处理时，应保留可重复读取的数据，或用每次都
创建新 Stream 的工厂，而不是试图复制已经消费的流水线。本课的集合数据源直接再次调用 `stream()` 即可。

## 四、把流水线收集成业务结果

### 1. toList 与 Collectors.toList 的版本差异

JDK 25 可以直接调用 `Stream.toList()`。这个方法自 Java 16 提供，返回的 List 不可修改；对它调用 `add`、
`remove` 等修改方法会抛出 `UnsupportedOperationException`。

Java 8 没有 `Stream.toList()`，使用 `collect(Collectors.toList())`。官方合同不保证结果列表的具体实现、
可修改性、可序列化性或线程安全性，所以不要把“某次运行恰好得到可修改 ArrayList”写进业务合同。

:::compare{before="Java 8" after="JDK 25"}
### Java 8

```java
List<String> titles = tasks.stream()
    .map(Task::getTitle)
    .collect(Collectors.toList());
```

### JDK 25

```java
List<String> titles = tasks.stream()
    .map(Task::title)
    .toList();
```
:::

两段都收集任务标题，但“结果是否可修改”的合同不同：JDK 25 的 `toList()` 明确不可修改，Java 8 的
`Collectors.toList()` 则不作保证。若业务确实需要一个明确的 `ArrayList`，两版都可以写：

```java
List<String> editableTitles = tasks.stream()
    .map(Task::title)
    .collect(Collectors.toCollection(ArrayList::new));
```

Java 8 只需把访问器改为 `Task::getTitle`。`toCollection(ArrayList::new)` 明确了结果集合工厂，因此调用方
可以依据 `ArrayList` 的合同继续修改它。

### 2. joining 和 groupingBy 生成汇总视图

`Collectors.joining(delimiter)` 把字符序列按分隔符连接成一个字符串：

```java
String taskIds = tasks.stream()
    .map(Task::id)
    .sorted()
    .collect(Collectors.joining(", "));
```

若编号是 `TASK-103`、`TASK-101`、`TASK-102`，排序后结果是：

```text
TASK-101, TASK-102, TASK-103
```

`groupingBy` 用分类函数计算每个元素的键，把相同键的元素放入同一列表：

```java
Map<String, List<Task>> tasksByStatus = tasks.stream()
    .collect(Collectors.groupingBy(Task::status));

System.out.println(tasksByStatus.get("OPEN").size());
```

如果有两条 `OPEN` 任务，输出 `2`。分组结果 Map 本身不承诺业务展示顺序；需要固定输出时，应按明确键
读取，或把要展示的键另行排序，而不是依赖当前 Map 的打印顺序。

### 3. toMap 必须先定义重复键策略

`toMap(keyMapper, valueMapper)` 把每个元素转换成一个键值对。任务编号唯一时，可以建立快速查询视图：

```java
Map<String, String> titleById = tasks.stream()
    .collect(Collectors.toMap(Task::id, Task::title));
```

如果两个元素产生同一个键，两参数重载会抛出 `IllegalStateException`。这不是 Stream 自动替你选择旧值或
新值，而是业务尚未定义冲突语义。确实允许重复键时，使用三参数重载明确选择：

```java
Map<String, String> latestTitleById = tasks.stream()
    .collect(Collectors.toMap(
        Task::id,
        Task::title,
        (existingTitle, replacementTitle) -> replacementTitle
    ));
```

合并函数表示重复编号时保留后遇到的标题。若一个键本来就允许多个值，应改用 `groupingBy` 得到
`Map<K, List<T>>`，不要用合并函数悄悄丢掉数据。

**社区补充：** Stack Overflow 上的 Java 8 真实问题把货币数据按数值代码收集为 Map 时遇到
`IllegalStateException: Duplicate key`。该案例说明“看起来应唯一”的外部数据也可能冲突。适用于 Java 8
及以上的处理方式是先确认业务语义，再选择拒绝重复、显式合并或分组；具体 API 合同以官方 Collectors 文档
为准。

## 五、让流水线保持可预测

### 1. encounter order 会进入结果语义

从 `List` 创建的顺序流通常具有与列表相同的 encounter order。`filter` 和 `map` 保留留下元素之间的相对
顺序，`sorted` 建立新的排序，`limit` 截取当前顺序的前若干项，`joining` 按遇到元素的顺序连接文本。

```java
List<Integer> priorities = Arrays.asList(3, 1, 2);

System.out.println(priorities.stream().limit(2).sorted().toList());
System.out.println(priorities.stream().sorted().limit(2).toList());
```

输出是：

```text
[1, 3]
[1, 2]
```

第一条先取数据源前两个值 `3`、`1`，再排序；第二条先把全部值排序，再取最小两个值。两条都合法，但回答
的是不同问题，因此重排操作不能只看“结果类型相同”。

### 2. 行为参数不能干扰数据源

传给 `filter`、`map`、`sorted` 等操作的 Lambda 不应在流水线执行期间修改数据源。下面的代码一边遍历
`tasks`，一边从同一个列表删除元素，违反无干扰要求：

```java
tasks.stream()
    .filter(task -> {
        tasks.remove(task);
        return true;
    })
    .count();
```

结果可能是异常、漏处理或其他不可依赖的行为。正确做法是让流水线产生新结果，再在流水线之外按照清晰的
集合合同决定是否替换原引用：

```java
List<Task> activeTasks = tasks.stream()
    .filter(task -> !"DONE".equals(task.status()))
    .toList();
```

### 3. 行为参数通常应当无状态

“无状态”表示当前元素的结果不依赖 Lambda 在处理其他元素时写入的可变共享状态。不要用外部 `List`、数组
计数器或 Map 充当隐藏累加器：

```java
List<String> titles = new ArrayList<>();
tasks.stream()
    .filter(task -> !"DONE".equals(task.status()))
    .forEach(task -> titles.add(task.title()));
```

这段顺序代码可能得到看似正确的结果，却把数据流和外部修改混在一起；操作重排、复用逻辑或以后改变执行
方式时都更难推理。需要列表就使用 `toList` 或 `collect`，需要数值就使用 `count` 或 `reduce`，需要 Map 就
选择 `groupingBy` 或 `toMap`。本课不展开并行流，但从一开始去掉共享副作用，会让顺序流也更容易验证。

## 六、JDK 25 与 Java 8 的兼容选择

### 1. 核心 Stream 能力从 Java 8 起已经可用

本课的 `stream`、`filter`、`map`、`flatMap`、`distinct`、`sorted`、`limit`、`count`、match、`reduce`、
`collect` 以及所用 Collectors 都已在 Java 8 提供。两版的流水线心智模型、惰性、单次消费、无干扰和通常
无状态的要求相同，不需要为 Java 8 改回手写循环。

### 2. 差异集中在结果收集和数据对象写法

JDK 25 完整程序使用 record 表示固定任务数据，并用 `Stream.toList()` 收集不可修改结果。Java 8 不支持
record，也没有 `Stream.toList()`，因此使用带构造器和访问器的普通类，并调用
`collect(Collectors.toList())`。这两项都是前面课程已经出现过的真实版本差异。

若结果后续必须修改，不应依赖两个版本默认收集结果的差异；两版都显式使用
`Collectors.toCollection(ArrayList::new)`，把可修改集合写成看得见的合同。

### 3. IDEA 必须分别核对项目 JDK 和运行 JRE

JDK 25 版本把 Project SDK、Module SDK 和运行配置 JRE 都设为 JDK 25。Java 8 版本分别设为已添加的 JDK 8，
语言级别设为 8。只改编辑器语言级别或只改终端 `JAVA_HOME`，都不能证明 IDEA 当前项目使用了对应版本。

两版运行时都应先看 Run 工具窗口第一行中的 Java 可执行文件路径，再核对程序输出。Java 8 源码若误放进
JDK 25 版本的 record 文件，或在 JDK 8 项目里复制了 `.toList()`，都会让兼容验证失真。

## 七、集中排除典型错误

下面的错误集中在流水线是否执行、能否再次消费、版本 API、数据冲突、顺序和副作用，不扩展成 Optional 或
并行流课程。

:::pitfalls
### 只有中间操作，没有终止操作

**触发条件：** 创建包含 `filter` 的 Stream 后直接结束方法，期待筛选 Lambda 已经执行。

**原因：** 中间操作是惰性的，只记录流水线步骤；没有终止操作请求元素，数据不会流过 `filter`。

**后果：** 预期日志、计数或转换结果都不会出现，容易误以为 Lambda 没有生效。

**错误示例：** 下面的程序不会输出“检查任务”。

```java
Stream.of("TASK-101", "TASK-102")
    .filter(taskId -> {
        System.out.println("检查任务: " + taskId);
        return true;
    });
```

**正确写法：** 用当前查询真正需要的终止操作取得结果。

```java
long count = Stream.of("TASK-101", "TASK-102")
    .filter(taskId -> {
        System.out.println("检查任务: " + taskId);
        return true;
    })
    .count();
System.out.println("任务数: " + count);
```

**验证方式：** 错误版无输出；正确版依次输出两条“检查任务”，最后输出 `任务数: 2`。

### 对同一个 Stream 执行两次终止操作

**触发条件：** 把 Stream 保存到变量，先调用 `count()`，再对同一变量调用另一个终止操作。

**原因：** 一条 Stream 流水线只能被消费一次，第一次终止操作已经消耗它。

**后果：** 第二次终止通常抛出 `IllegalStateException`，后续业务结果无法生成。

**错误示例：** `taskIds` 被 `count()` 消费后再次调用 `anyMatch`。

```java
Stream<String> taskIds = Stream.of("TASK-101", "TASK-102");
System.out.println(taskIds.count());
System.out.println(taskIds.anyMatch(id -> id.endsWith("2")));
```

**正确写法：** 保留可重复读取的数据源，每个答案创建一条新 Stream。

```java
List<String> taskIds = Arrays.asList("TASK-101", "TASK-102");
System.out.println(taskIds.stream().count());
System.out.println(taskIds.stream().anyMatch(id -> id.endsWith("2")));
```

**验证方式：** 错误版第一行输出 `2`，随后抛出 `IllegalStateException`；正确版依次输出 `2` 和 `true`。

### 在 Java 8 中调用 Stream.toList

**触发条件：** 把 JDK 25 示例中的 `.toList()` 原样复制到 Project SDK 为 JDK 8 的项目。

**原因：** `Stream.toList()` 自 Java 16 才提供，Java 8 的 Stream 类型没有这个方法。

**后果：** Java 8 编译失败，IDEA 也会标记无法解析 `toList`。

**错误示例：** 下面的终止操作不属于 Java 8 API。

```java
List<String> ids = Stream.of("TASK-101", "TASK-102").toList();
```

**正确写法：** Java 8 使用 `Collectors.toList()` 收集。

```java
List<String> ids = Stream.of("TASK-101", "TASK-102")
    .collect(Collectors.toList());
```

**验证方式：** 使用 JDK 8 编译错误版会报告找不到 `toList()`；正确版编译运行后得到包含两个编号的列表。

### 把 toList 结果一律当成可修改 ArrayList

**触发条件：** 收集结果后立即调用 `add`，并假设所有 JDK 和所有收集方式都返回可修改的 ArrayList。

**原因：** JDK 25 的 `Stream.toList()` 明确返回不可修改 List；`Collectors.toList()` 也不承诺具体实现和
可修改性。

**后果：** JDK 25 的直接 `toList()` 结果会在修改时抛出 `UnsupportedOperationException`，代码还会依赖
未写入合同的实现细节。

**错误示例：** 对不可修改结果追加任务。

```java
List<String> ids = Stream.of("TASK-101").toList();
ids.add("TASK-102");
```

**正确写法：** 需要修改时显式指定集合工厂。

```java
List<String> ids = Stream.of("TASK-101")
    .collect(Collectors.toCollection(ArrayList::new));
ids.add("TASK-102");
```

**验证方式：** 在 JDK 25 运行错误版会抛出 `UnsupportedOperationException`；正确版输出列表时包含两个编号。

### toMap 的键并不唯一

**触发条件：** 按状态收集 Map，却有多条任务都处于 `OPEN`，仍使用不带合并函数的两参数 `toMap`。

**原因：** Map 的一个键只能对应一个值，而两参数 `toMap` 遇到重复键时按合同抛出异常。

**后果：** 终止操作以 `IllegalStateException` 失败，整个 Map 都无法作为查询结果返回。

**错误示例：** 两条记录都会产生键 `OPEN`。

```java
Map<String, String> titleByStatus = Stream.of("OPEN|整理需求", "OPEN|发布检查")
    .collect(Collectors.toMap(
        record -> record.substring(0, record.indexOf('|')),
        record -> record.substring(record.indexOf('|') + 1)
    ));
```

**正确写法：** 状态天然对应多条任务，使用 `groupingBy` 保留全部记录。

```java
Map<String, List<String>> recordsByStatus = Stream.of("OPEN|整理需求", "OPEN|发布检查")
    .collect(Collectors.groupingBy(record -> record.substring(0, record.indexOf('|'))));
System.out.println(recordsByStatus.get("OPEN").size());
```

**验证方式：** 错误版抛出 `IllegalStateException`；正确版输出 `2`，两条记录都保留在 `OPEN` 分组中。

### 在行为参数中修改数据源

**触发条件：** Stream 正在遍历 `taskIds` 时，在 `filter` 中从同一个列表删除当前元素。

**原因：** 行为参数干扰了流水线正在读取的数据源，后续元素和内部遍历状态不再稳定。

**后果：** 可能抛出 `ConcurrentModificationException`、漏处理元素或产生其他不可依赖结果。

**错误示例：** 筛选 Lambda 同时删除数据源元素。

```java
List<String> taskIds = new ArrayList<>(Arrays.asList("TASK-101", "TASK-102"));
long count = taskIds.stream()
    .filter(taskId -> {
        taskIds.remove(taskId);
        return true;
    })
    .count();
```

**正确写法：** 让流水线产生新列表，不在遍历期间改动原列表。

```java
List<String> taskIds = new ArrayList<>(Arrays.asList("TASK-101", "TASK-102"));
List<String> retained = taskIds.stream()
    .filter(taskId -> !taskId.endsWith("1"))
    .collect(Collectors.toList());
System.out.println(retained);
```

**验证方式：** 错误版的结果不可依赖，并可在当前 ArrayList 输入下观察到运行异常；正确版稳定输出
`[TASK-102]`，原数据源仍有两项。

### 把 limit 放在排序前却期待全局最优结果

**触发条件：** 想取优先级最小的两项，却先对原顺序调用 `limit(2)`，之后才排序。

**原因：** `limit` 只保留当前 encounter order 的前两项，后续 `sorted` 看不到已经被截掉的元素。

**后果：** 结果只是“数据源前两项中的最优项”，可能漏掉真正的高优先级任务。

**错误示例：** 输入 `3、1、2` 时先截取 `3、1`。

```java
List<Integer> priorities = Stream.of(3, 1, 2)
    .limit(2)
    .sorted()
    .collect(Collectors.toList());
```

**正确写法：** 先对全部候选排序，再截取前两项。

```java
List<Integer> priorities = Stream.of(3, 1, 2)
    .sorted()
    .limit(2)
    .collect(Collectors.toList());
```

**验证方式：** 错误版输出 `[1, 3]`；正确版输出 `[1, 2]`。
:::

## 八、完整程序串联 TeamFlow 查询

### 1. JDK 25 完整程序

在 JDK 25 项目中创建 `TeamFlowStreamApplication.java`。程序从固定任务列表建立多条独立流水线，分别生成
优先任务、完成数量、紧急状态、优先级合计、状态、标签、分组和编号查询结果：

```java
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class TeamFlowStreamApplication {
    /**
     * 运行 TeamFlow 任务流查询。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        List<Task> tasks = Arrays.asList(
            new Task("TASK-101", "整理迭代需求", "OPEN", 3, Arrays.asList("backend", "docs")),
            new Task("TASK-102", "补充接口文档", "OPEN", 2, Arrays.asList("docs")),
            new Task("TASK-103", "回归登录流程", "DONE", 4, Arrays.asList("test")),
            new Task("TASK-104", "发布检查", "BLOCKED", 1, Arrays.asList("backend", "release"))
        );

        List<String> focusTasks = tasks.stream()
            .filter(task -> !"DONE".equals(task.status()))
            .sorted(Comparator.comparingInt(Task::priority).thenComparing(Task::id))
            .limit(2)
            .map(task -> task.id() + " | " + task.title() + " | P" + task.priority())
            .toList();

        long completedCount = tasks.stream()
            .filter(task -> "DONE".equals(task.status()))
            .count();

        boolean hasUrgentPendingTask = tasks.stream()
            .anyMatch(task -> !"DONE".equals(task.status()) && task.priority() <= 1);

        int pendingPriorityTotal = tasks.stream()
            .filter(task -> !"DONE".equals(task.status()))
            .map(Task::priority)
            .reduce(0, Integer::sum);

        String statuses = tasks.stream()
            .map(Task::status)
            .distinct()
            .sorted()
            .collect(Collectors.joining(", "));

        String tags = tasks.stream()
            .flatMap(task -> task.tags().stream())
            .distinct()
            .sorted()
            .collect(Collectors.joining(", "));

        Map<String, List<Task>> tasksByStatus = tasks.stream()
            .collect(Collectors.groupingBy(Task::status));

        Map<String, String> titleById = tasks.stream()
            .collect(Collectors.toMap(Task::id, Task::title));

        System.out.println("TeamFlow Stream 处理结果");
        System.out.println("优先任务:");
        focusTasks.forEach(System.out::println);
        System.out.println("已完成: " + completedCount);
        System.out.println("存在紧急未完成任务: " + hasUrgentPendingTask);
        System.out.println("未完成优先级合计: " + pendingPriorityTotal);
        System.out.println("状态: " + statuses);
        System.out.println("标签: " + tags);
        System.out.println("OPEN 数量: " + tasksByStatus.get("OPEN").size());
        System.out.println("TASK-103 标题: " + titleById.get("TASK-103"));
    }

    private record Task(String id, String title, String status, int priority, List<String> tags) {}
}
```

### 2. Java 8 完整程序

Java 8 使用普通固定数据类和 `Collectors.toList()`，其余 Stream 处理能力保持一致。创建同名
`TeamFlowStreamApplication.java`：

```java
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class TeamFlowStreamApplication {
    /**
     * 运行 TeamFlow 任务流查询。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        List<Task> tasks = Arrays.asList(
            new Task("TASK-101", "整理迭代需求", "OPEN", 3, Arrays.asList("backend", "docs")),
            new Task("TASK-102", "补充接口文档", "OPEN", 2, Arrays.asList("docs")),
            new Task("TASK-103", "回归登录流程", "DONE", 4, Arrays.asList("test")),
            new Task("TASK-104", "发布检查", "BLOCKED", 1, Arrays.asList("backend", "release"))
        );

        List<String> focusTasks = tasks.stream()
            .filter(task -> !"DONE".equals(task.getStatus()))
            .sorted(Comparator.comparingInt(Task::getPriority).thenComparing(Task::getId))
            .limit(2)
            .map(task -> task.getId() + " | " + task.getTitle() + " | P" + task.getPriority())
            .collect(Collectors.toList());

        long completedCount = tasks.stream()
            .filter(task -> "DONE".equals(task.getStatus()))
            .count();

        boolean hasUrgentPendingTask = tasks.stream()
            .anyMatch(task -> !"DONE".equals(task.getStatus()) && task.getPriority() <= 1);

        int pendingPriorityTotal = tasks.stream()
            .filter(task -> !"DONE".equals(task.getStatus()))
            .map(Task::getPriority)
            .reduce(0, Integer::sum);

        String statuses = tasks.stream()
            .map(Task::getStatus)
            .distinct()
            .sorted()
            .collect(Collectors.joining(", "));

        String tags = tasks.stream()
            .flatMap(task -> task.getTags().stream())
            .distinct()
            .sorted()
            .collect(Collectors.joining(", "));

        Map<String, List<Task>> tasksByStatus = tasks.stream()
            .collect(Collectors.groupingBy(Task::getStatus));

        Map<String, String> titleById = tasks.stream()
            .collect(Collectors.toMap(Task::getId, Task::getTitle));

        System.out.println("TeamFlow Stream 处理结果");
        System.out.println("优先任务:");
        focusTasks.forEach(System.out::println);
        System.out.println("已完成: " + completedCount);
        System.out.println("存在紧急未完成任务: " + hasUrgentPendingTask);
        System.out.println("未完成优先级合计: " + pendingPriorityTotal);
        System.out.println("状态: " + statuses);
        System.out.println("标签: " + tags);
        System.out.println("OPEN 数量: " + tasksByStatus.get("OPEN").size());
        System.out.println("TASK-103 标题: " + titleById.get("TASK-103"));
    }

    private static final class Task {
        private final String id;
        private final String title;
        private final String status;
        private final int priority;
        private final List<String> tags;

        /**
         * 创建固定任务数据。
         *
         * @param id 任务编号
         * @param title 任务标题
         * @param status 任务状态
         * @param priority 优先级，数字越小越紧急
         * @param tags 任务标签
         */
        private Task(String id, String title, String status, int priority, List<String> tags) {
            this.id = id;
            this.title = title;
            this.status = status;
            this.priority = priority;
            this.tags = tags;
        }

        /**
         * 获取任务编号。
         *
         * @return 任务编号
         */
        private String getId() {
            return id;
        }

        /**
         * 获取任务标题。
         *
         * @return 任务标题
         */
        private String getTitle() {
            return title;
        }

        /**
         * 获取任务状态。
         *
         * @return 任务状态
         */
        private String getStatus() {
            return status;
        }

        /**
         * 获取任务优先级。
         *
         * @return 优先级
         */
        private int getPriority() {
            return priority;
        }

        /**
         * 获取任务标签。
         *
         * @return 任务标签列表
         */
        private List<String> getTags() {
            return tags;
        }
    }
}
```

### 3. 在 IDEA 中分别运行两个版本

JDK 25 版本：

1. 新建普通 Java 项目，把 Project SDK 和 Module SDK 设为 JDK 25。
2. 创建 `TeamFlowStreamApplication`，填入 JDK 25 完整代码。
3. 打开 Run Configuration，确认 JRE 是项目的 JDK 25。
4. 运行 `main`，先核对 Run 工具窗口中的 Java 路径，再核对下方完整输出。

Java 8 版本：

1. 在 IDEA 的 SDK 列表中添加本机已有的 JDK 8，不要把语言级别当成 JDK 安装。
2. 为兼容项目同时选择 Project SDK 8、Module SDK 8 和语言级别 8。
3. 创建 `TeamFlowStreamApplication`，填入完整 Java 8 代码。
4. 把 Run Configuration 的 JRE 设为项目 JDK 8，运行 `main` 并核对 Java 路径与输出。

两个版本的预期控制台输出完全相同：

```text
TeamFlow Stream 处理结果
优先任务:
TASK-104 | 发布检查 | P1
TASK-102 | 补充接口文档 | P2
已完成: 1
存在紧急未完成任务: true
未完成优先级合计: 6
状态: BLOCKED, DONE, OPEN
标签: backend, docs, release, test
OPEN 数量: 2
TASK-103 标题: 回归登录流程
```

每个答案都从 `tasks.stream()` 开始，因此不存在重复消费同一 Stream。中间操作先描述选择、排序、转换或
摊平过程，终止操作再触发执行。`focusTasks` 使用当前顺序取前两项；各统计查询使用独立流水线；分组保留
同状态的全部任务；编号 Map 依赖示例中任务编号唯一这一前提。

## 九、独立练习

### 1. 生成任务工作量摘要

:::exercise
### TeamFlow 工作量摘要

**要求：** 编写 `TeamFlowStreamExercise`。固定创建四条任务：`TASK-201 / OPEN / 接口校验 / 3 小时 /
backend、api`，`TASK-202 / DONE / 回归首页 / 2 小时 / frontend、test`，`TASK-203 / OPEN / 补充文档 /
1 小时 / docs`，`TASK-204 / BLOCKED / 发布检查 / 4 小时 / release、test`。使用 Stream 完成以下结果：排除
`DONE` 后按工时从大到小、编号从小到大排序并输出前三项；用带 identity 的 `reduce` 汇总未完成工时；用
`flatMap`、`distinct`、`sorted` 和 `joining` 汇总全部标签；用 `groupingBy` 输出三个状态的数量；用
`toMap` 按编号查询 `TASK-202` 标题。不要修改数据源，不复用已经终止的 Stream，不使用 Optional 或并行流。
JDK 25 使用 record 和 `Stream.toList()`；Java 8 使用完整普通类和 `Collectors.toList()`。

**验收：**

```text
TeamFlow 工作量摘要
待处理任务:
TASK-204 | 发布检查 | 4h
TASK-201 | 接口校验 | 3h
TASK-203 | 补充文档 | 1h
待处理工时: 8h
标签: api, backend, docs, frontend, release, test
OPEN 数量: 2
DONE 数量: 1
BLOCKED 数量: 1
TASK-202 标题: 回归首页
```
:::

### 2. JDK 25 参考实现

```java
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class TeamFlowStreamExercise {
    /**
     * 生成 TeamFlow 任务工作量摘要。
     *
     * @param args 启动参数，本练习不使用
     */
    public static void main(String[] args) {
        List<Task> tasks = Arrays.asList(
            new Task("TASK-201", "OPEN", "接口校验", 3, Arrays.asList("backend", "api")),
            new Task("TASK-202", "DONE", "回归首页", 2, Arrays.asList("frontend", "test")),
            new Task("TASK-203", "OPEN", "补充文档", 1, Arrays.asList("docs")),
            new Task("TASK-204", "BLOCKED", "发布检查", 4, Arrays.asList("release", "test"))
        );

        List<String> pendingLines = tasks.stream()
            .filter(task -> !"DONE".equals(task.status()))
            .sorted(Comparator.comparingInt(Task::hours).reversed().thenComparing(Task::id))
            .limit(3)
            .map(task -> task.id() + " | " + task.title() + " | " + task.hours() + "h")
            .toList();

        int pendingHours = tasks.stream()
            .filter(task -> !"DONE".equals(task.status()))
            .map(Task::hours)
            .reduce(0, Integer::sum);

        String tags = tasks.stream()
            .flatMap(task -> task.tags().stream())
            .distinct()
            .sorted()
            .collect(Collectors.joining(", "));

        Map<String, List<Task>> tasksByStatus = tasks.stream()
            .collect(Collectors.groupingBy(Task::status));

        Map<String, String> titleById = tasks.stream()
            .collect(Collectors.toMap(Task::id, Task::title));

        System.out.println("TeamFlow 工作量摘要");
        System.out.println("待处理任务:");
        pendingLines.forEach(System.out::println);
        System.out.println("待处理工时: " + pendingHours + "h");
        System.out.println("标签: " + tags);
        System.out.println("OPEN 数量: " + tasksByStatus.get("OPEN").size());
        System.out.println("DONE 数量: " + tasksByStatus.get("DONE").size());
        System.out.println("BLOCKED 数量: " + tasksByStatus.get("BLOCKED").size());
        System.out.println("TASK-202 标题: " + titleById.get("TASK-202"));
    }

    private record Task(String id, String status, String title, int hours, List<String> tags) {}
}
```

### 3. Java 8 参考实现

```java
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class TeamFlowStreamExercise {
    /**
     * 生成 TeamFlow 任务工作量摘要。
     *
     * @param args 启动参数，本练习不使用
     */
    public static void main(String[] args) {
        List<Task> tasks = Arrays.asList(
            new Task("TASK-201", "OPEN", "接口校验", 3, Arrays.asList("backend", "api")),
            new Task("TASK-202", "DONE", "回归首页", 2, Arrays.asList("frontend", "test")),
            new Task("TASK-203", "OPEN", "补充文档", 1, Arrays.asList("docs")),
            new Task("TASK-204", "BLOCKED", "发布检查", 4, Arrays.asList("release", "test"))
        );

        List<String> pendingLines = tasks.stream()
            .filter(task -> !"DONE".equals(task.getStatus()))
            .sorted(Comparator.comparingInt(Task::getHours).reversed().thenComparing(Task::getId))
            .limit(3)
            .map(task -> task.getId() + " | " + task.getTitle() + " | " + task.getHours() + "h")
            .collect(Collectors.toList());

        int pendingHours = tasks.stream()
            .filter(task -> !"DONE".equals(task.getStatus()))
            .map(Task::getHours)
            .reduce(0, Integer::sum);

        String tags = tasks.stream()
            .flatMap(task -> task.getTags().stream())
            .distinct()
            .sorted()
            .collect(Collectors.joining(", "));

        Map<String, List<Task>> tasksByStatus = tasks.stream()
            .collect(Collectors.groupingBy(Task::getStatus));

        Map<String, String> titleById = tasks.stream()
            .collect(Collectors.toMap(Task::getId, Task::getTitle));

        System.out.println("TeamFlow 工作量摘要");
        System.out.println("待处理任务:");
        pendingLines.forEach(System.out::println);
        System.out.println("待处理工时: " + pendingHours + "h");
        System.out.println("标签: " + tags);
        System.out.println("OPEN 数量: " + tasksByStatus.get("OPEN").size());
        System.out.println("DONE 数量: " + tasksByStatus.get("DONE").size());
        System.out.println("BLOCKED 数量: " + tasksByStatus.get("BLOCKED").size());
        System.out.println("TASK-202 标题: " + titleById.get("TASK-202"));
    }

    private static final class Task {
        private final String id;
        private final String status;
        private final String title;
        private final int hours;
        private final List<String> tags;

        /**
         * 创建固定任务数据。
         *
         * @param id 任务编号
         * @param status 任务状态
         * @param title 任务标题
         * @param hours 预计工时
         * @param tags 任务标签
         */
        private Task(String id, String status, String title, int hours, List<String> tags) {
            this.id = id;
            this.status = status;
            this.title = title;
            this.hours = hours;
            this.tags = tags;
        }

        /**
         * 获取任务编号。
         *
         * @return 任务编号
         */
        private String getId() {
            return id;
        }

        /**
         * 获取任务状态。
         *
         * @return 任务状态
         */
        private String getStatus() {
            return status;
        }

        /**
         * 获取任务标题。
         *
         * @return 任务标题
         */
        private String getTitle() {
            return title;
        }

        /**
         * 获取预计工时。
         *
         * @return 预计工时
         */
        private int getHours() {
            return hours;
        }

        /**
         * 获取任务标签。
         *
         * @return 任务标签列表
         */
        private List<String> getTags() {
            return tags;
        }
    }
}
```

在两个独立 IDEA 项目中分别使用 JDK 25 和 JDK 8 运行参考实现。验收时不仅比较最后的数字，还要核对三条
待处理任务的顺序、标签去重与排序、三个状态的数量以及编号 Map 的查询结果。全部输出与验收块逐字一致，
才说明筛选、排序、截取、摊平、归约、分组和映射使用了同一份业务事实。
