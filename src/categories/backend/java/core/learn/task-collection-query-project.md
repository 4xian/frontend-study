---
id: backend.java.learn.basics.task-collection-query-project
type: lesson
title: 实战：任务集合查询
summary: 组合 List、Set、Map 和集合遍历，为 TeamFlow 建立可查询、可校验且不会泄露内部状态的任务目录
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 115
prerequisites:
  - backend.java.learn.basics.collection-iteration-and-safe-removal
objectives:
  - 能根据任务展示、唯一编号和条件成员判断分别选择 List、Map 与 Set。
  - 能在写入前拒绝重复任务编号，并让 List 与 Map 保持一致。
  - 能按编号、状态、负责人、标题关键词和多组候选条件查询任务。
  - 能说明查询结果快照、不可修改视图和内部可变集合之间的区别。
  - 能使用 Iterator 同步删除 List 与 Map 中的同一项任务。
  - 能识别暴露内部 List、重复编号覆盖和只更新一个集合等常见错误。
  - 能分别运行 JDK 25 与 Java 8 的完整 TeamFlow 任务集合查询程序。
recap:
  - List 保存任务录入顺序，Map 建立编号索引，Set 适合表达一组候选条件。
  - 同一批任务由多个集合表示时，所有写入和删除都必须经过同一条受控路径。
  - 按编号查询使用 Map，按任务字段筛选则按 List 的顺序逐项检查。
  - JDK 25 使用 List.copyOf 创建不可修改快照，Java 8 先复制再用 Collections.unmodifiableList 包装。
  - 不可修改只限制集合结构；本课同时使用不可变 Task，避免元素状态从结果中被改写。
  - Iterator.remove 负责删除当前 List 元素，随后用同一编号删除 Map 索引。
  - 查询只读取源集合并返回结果，不应借用 removeIf 破坏原任务目录。
related: []
tags:
  - Java
  - List
  - Set
  - Map
  - 集合查询
  - 防御性复制
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 使用防御性复制加不可修改包装创建查询快照
verifiedAt: 2026-08-17
sources:
  - id: java-25-list-task-query
    title: Java SE 25 API - List
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - List 按自身顺序迭代元素
      - List.copyOf 返回不跟随来源结构变化的不可修改 List，并从 Java 10 起提供
  - id: java-8-list-task-query
    title: Java SE 8 API - List
    url: https://docs.oracle.com/javase/8/docs/api/java/util/List.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 的 List 保持有序元素序列并支持本课的线性查询
  - id: java-25-map-task-query
    title: Java SE 25 API - Map
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - 一个键最多对应一个映射，重复 put 会替换旧映射
      - containsKey 与 get 分别判断键是否存在和读取键对应的值
  - id: java-8-map-task-query
    title: Java SE 8 API - Map
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Map.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 的 Map 键唯一、containsKey、get、put 与 remove 合同支持本课兼容实现
  - id: java-25-set-task-query
    title: Java SE 25 API - Set
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Set.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - Set 适合通过 contains 判断某个值是否属于候选集合
      - Set 接口本身不承诺固定迭代顺序
  - id: java-8-set-task-query
    title: Java SE 8 API - Set
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Set.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 的 Set 成员判断合同支持本课兼容实现
  - id: java-25-iterator-task-query
    title: Java SE 25 API - Iterator
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Iterator.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - Iterator.remove 删除最近一次 next 返回的元素并受调用时序约束
  - id: java-8-iterator-task-query
    title: Java SE 8 API - Iterator
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Iterator.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 的 Iterator.remove 合同支持相同的同步删除流程
  - id: java-25-collection-task-query
    title: Java SE 25 API - Collection
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Collection.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - removeIf 会删除满足条件的元素，因此不能把它当成只读查询
  - id: java-8-collections-task-query
    title: Java SE 8 API - Collections
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Collections.html#unmodifiableList-java.util.List-
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - unmodifiableList 返回读取来源 List 的不可修改视图
      - Java 8 查询快照需要先复制来源结构再包装
  - id: jls-25-enhanced-for-task-query
    title: Java Language Specification 25 - The enhanced for statement
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.14.2
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 增强 for 对 Iterable 使用 Iterator 顺序读取元素
  - id: jls-8-enhanced-for-task-query
    title: Java Language Specification 8 - The enhanced for statement
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html#jls-14.14.2
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 的增强 for 具有本课使用的相同迭代语义
  - id: stackoverflow-unmodifiable-list-defensive-copy
    title: Collections.unmodifiableList and defensive copy
    url: https://stackoverflow.com/questions/15111073/collections-unmodifiablelist-and-defensive-copy
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 与 JDK 25；视图行为已用 Oracle Collections API 和双版本探针核验
    claims:
      - 把不可修改视图误认为防御性副本是会导致旧查询结果随来源变化的真实误区
  - id: stackoverflow-remove-while-iterating-task-query
    title: Removing objects from a collection in a loop without causing ConcurrentModificationException
    url: https://stackoverflow.com/questions/223918/removing-objects-from-a-collection-in-a-loop-without-causing-concurrentmodificat
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 与 JDK 25；删除方式已用 Oracle Iterator API 和双版本探针核验
    claims:
      - 遍历期间直接修改原集合与使用当前 Iterator 删除的混淆是反复出现的真实误用
---

# 实战：任务集合查询

TeamFlow 现在已经能保存任务，也掌握了 `List`、`Set`、`Map` 和安全遍历。真正的任务看板不能只把集合打印
出来：用户会按编号打开一项任务，按状态查看待办，按负责人筛选工作，还会搜索标题中的关键词。不同查询
需要不同集合能力，但它们必须看到同一批任务。

本课把前面的集合知识连接成一个纯内存任务目录。我们只处理录入、查询、结果快照和同步删除，不引入排序、
日期、金额、Stream、Optional、Maven、Spring 或数据库。完整程序仍然可以直接在 IDEA 的普通 Java 项目中运行。

## 一、把一批任务组织成可查询目录

### 1. List 保存展示顺序

任务看板通常希望按录入顺序展示，所以用 `List<Task>` 保存全部任务。增强 `for` 按 List 的顺序读取元素，
按状态、负责人或关键词筛选时，只要把匹配项依次加入新的结果 List，查询结果就自然保留录入顺序。

```java
List<Task> matches = new ArrayList<>();
for (Task task : tasks) {
    if (task.getStatus() == TaskStatus.TODO) {
        matches.add(task);
    }
}
```

这段循环只读取 `tasks`。它没有删除或改写源集合；命中任务进入局部的 `matches`，因此查询与原目录的结构
变化分开了。

### 2. Map 建立编号索引

按编号查询不需要每次从头扫描 List。`Map<String, Task>` 用任务编号作为键，让调用方直接读取对应任务：

```java
Task task = tasksById.get("TF-102");
System.out.println(task.toDisplayText());
```

输出为：

```text
TF-102|修复登录接口|小周|IN_PROGRESS
```

List 和 Map 不是两批任务，而是同一批 `Task` 对象的两种访问路径：List 回答“按什么顺序展示”，Map 回答
“这个编号对应谁”。正因为数据被表示了两次，写入和删除必须同时维护两个结构。

### 3. Set 表达多个候选条件

当筛选条件是“状态属于 TODO 或 IN_PROGRESS，并且负责人属于小林或小周”时，`Set.contains` 可以直接表达
成员资格：

```java
Set<TaskStatus> statuses = new LinkedHashSet<>();
statuses.add(TaskStatus.TODO);
statuses.add(TaskStatus.IN_PROGRESS);

Set<String> owners = new LinkedHashSet<>();
owners.add("小林");
owners.add("小周");

for (Task task : tasks) {
    if (statuses.contains(task.getStatus()) && owners.contains(task.getOwner())) {
        matches.add(task);
    }
}
```

两个 `contains` 之间使用 `&&`，所以任务必须同时满足状态和负责人条件。Set 在这里不负责输出顺序，只负责
回答“是否属于候选集合”；最终顺序仍由 List 的扫描顺序决定。

## 二、让写入路径守住两个集合

### 1. 先拒绝重复编号，再同时写入

Map 的一个键最多对应一个值，重复 `put` 会替换旧任务；List 却会继续追加。因此不能先写 List，再寄希望于
Map 自动去重。受控写入方法先检查编号，通过后才同时更新两个结构：

```java
/**
 * 登记一项编号尚未出现的任务。
 *
 * @param task 待登记任务
 * @return 登记成功返回 true，编号重复返回 false
 */
public boolean addTask(Task task) {
    if (tasksById.containsKey(task.getId())) {
        return false;
    }
    tasks.add(task);
    tasksById.put(task.getId(), task);
    return true;
}
```

`containsKey` 判断的是键是否存在。只有返回 `false` 时才执行后面两次写入，所以方法返回 `true` 后，List 与
Map 都增加一项；编号重复时，两者都保持不变。

### 2. 不让调用方绕开受控写入

`tasks` 和 `tasksById` 都声明为 `private final`。`final` 固定的是字段保存的集合引用，集合内容仍可由
`TaskBoard` 内部方法修改；`private` 则阻止外部代码直接调用 `tasks.add` 或 `tasksById.put`，所有任务只能从
`addTask` 进入。

```java
private final List<Task> tasks = new ArrayList<>();
private final Map<String, Task> tasksById = new LinkedHashMap<>();
```

这不是数据库事务，也不能解决多个线程同时写入的问题。本课只建立单线程内存程序中的一致写入边界。

### 3. 用可观察结果核对写入

依次写入 `TF-101` 和 `TF-102` 后，再写一次新的 `TF-102`，第三次调用返回 `false`：

```text
DUPLICATE_ADDED=false
```

验证时还要确认 List 和 Map 的数量都仍为 `2`，按编号查询仍得到第一次登记的对象。只看返回值而不观察两个
集合，无法证明目录没有发生局部写入。

## 三、为单项和多项查询选择路径

### 1. 按编号从 Map 读取单项

```java
/**
 * 按任务编号查询一项任务。
 *
 * @param taskId 任务编号
 * @return 对应任务；不存在时返回 null
 */
public Task findById(String taskId) {
    return tasksById.get(taskId);
}
```

本课只把 `null` 作为 `Map.get` 没有命中的可观察结果，例如删除 `TF-104` 后输出
`CANCELLED_BY_ID=null`。空值与失败的完整返回合同属于后续课程，这里不展开 Optional 或异常体系。

### 2. 按字段从 List 筛选多项

状态、负责人和标题都不是本课 Map 的键，所以按 List 顺序逐项判断。以负责人为例：

```java
/**
 * 按负责人查询任务。
 *
 * @param owner 负责人
 * @return 保持录入顺序的查询结果快照
 */
public List<Task> findByOwner(String owner) {
    List<Task> matches = new ArrayList<>();
    for (Task task : tasks) {
        if (task.getOwner().equals(owner)) {
            matches.add(task);
        }
    }
    return snapshotOf(matches);
}
```

字符串用 `equals` 比较内容；枚举状态可以用 `==` 比较固定常量。标题关键词查询则使用
`task.getTitle().contains(keyword)`。本课把关键词定义为大小写敏感的连续文本，不引入正则表达式或搜索引擎。

### 3. 空结果也是一次成功查询

没有任何任务命中时，多项查询返回空 List，而不是返回内部集合，也不把“零项”改写成错误。调用方可以直接
读取 `size()` 或增强 `for`；循环会执行零次。单项查询与多项查询的返回形状不同：前者最多一项，后者始终是
一个结果集合。

## 四、把查询结果固定成快照

### 1. JDK 25 使用 List.copyOf

```java
/**
 * 创建不可修改的查询结果快照。
 *
 * @param source 当前查询命中项
 * @return 与来源后续结构变化隔离的结果
 */
private List<Task> snapshotOf(List<Task> source) {
    return List.copyOf(source);
}
```

`List.copyOf` 从 Java 10 起提供。它按来源迭代顺序创建不可修改 List，来源 List 后续新增或删除不会反映到旧
结果。本课不会把 `null` 放进任务集合，因为 `List.copyOf` 会拒绝空元素。

### 2. Java 8 先复制再包装

Java 8 没有 `List.copyOf`，需要明确完成两步：

```java
/**
 * 创建 Java 8 可用的不可修改查询结果快照。
 *
 * @param source 当前查询命中项
 * @return 与来源后续结构变化隔离的结果
 */
private List<Task> snapshotOf(List<Task> source) {
    return Collections.unmodifiableList(new ArrayList<>(source));
}
```

`new ArrayList<>(source)` 先复制结构，`Collections.unmodifiableList` 再阻止调用方通过结果执行 `add`、`remove`
或 `clear`。如果省略前面的复制，得到的只是读取来源 List 的视图，不是快照。

### 3. 集合结构和元素状态分别处理

两个版本都只复制 List 结构，里面仍是原来的 `Task` 对象引用。因此本课的 `Task` 使用 `final` 字段且不提供
setter：调用方既不能改变结果 List 的结构，也不能通过任务对象改写标题、负责人或状态。若元素本身可变，
“不可修改 List”不会自动变成深复制。

## 五、删除时同步维护列表和索引

### 1. 用当前 Iterator 删除 List 元素

删除已取消任务时，先显式取得 List 的 Iterator。每次 `next` 返回当前任务，命中后由同一个 Iterator 删除：

```java
Iterator<Task> iterator = tasks.iterator();
while (iterator.hasNext()) {
    Task task = iterator.next();
    if (task.getStatus() == TaskStatus.CANCELLED) {
        iterator.remove();
        tasksById.remove(task.getId());
    }
}
```

Iterator 只负责正在遍历的 List；Map 没有处于这次迭代中，所以随后用同一个任务编号删除 Map 索引。这样
一次命中会让两个结构各减少一项。

### 2. 删除之后验证同一批对象

仅比较数量仍不够：两个集合可能数量相同却保存不同任务。完整程序的 `isIndexConsistent` 会先比较数量，再
逐项确认 `tasksById.get(task.getId()) == task`。这里比较引用，是为了证明 Map 指向 List 中的同一个不可变
任务对象，而不是另一个恰好字段相同的副本。

### 3. 查询与删除的职责不要混用

`removeIf` 会真正删除命中项，所以它适合明确的清理命令，不适合实现“查出已取消任务”。查询应建立新的
`matches`；只有 `removeCancelledTasks` 才改变目录。方法名称、返回值和集合状态必须表达同一个意图。

## 六、易错点

**社区补充：** Stack Overflow 的真实提问反复混淆“不可修改视图”和“防御性副本”，也常在增强 `for` 中
直接修改正在遍历的集合。本课结论已经用 Java 8、JDK 25 的 Oracle API 和双版本探针核验：视图禁止从返回
引用修改，但会看到来源变化；遍历删除必须使用当前 Iterator。以下错误都适用于 Java 8 与 JDK 25。

:::pitfalls
### 重复编号分别写入 List 和 Map

**现象：** List 中出现两个 `TF-102`，Map 只有一个，按编号查询得到后写入的任务。

**触发条件：** 不检查编号就先追加 List，再对同一个键调用 Map.put。

**原因：** List 允许重复元素，Map 的重复键会替换旧映射，两种结构不会自动协商唯一规则。

**后果：** 列表展示与详情查询互相矛盾，后续删除一项时还可能留下同编号任务。

**错误示例：**

```java
/** 错误地让重复编号进入两个结构。 */
public void addTask(Task task) {
    tasks.add(task);
    tasksById.put(task.getId(), task);
}
```

**正确写法：**

```java
/** 只在编号不存在时同时写入两个结构。 */
public boolean addTask(Task task) {
    if (tasksById.containsKey(task.getId())) {
        return false;
    }
    tasks.add(task);
    tasksById.put(task.getId(), task);
    return true;
}
```

**验证方式：** 连续登记两个编号相同、标题不同的任务；错误版输出 List/Map 数量 `2/1`，正确版第二次返回
`false` 且数量保持 `1/1`。

### 直接返回内部可变 List

**现象：** 调用方执行 `board.getTasks().clear()` 后列表为空，按编号的 Map 仍保留任务。

**触发条件：** getter 原样返回 `tasks` 字段。

**原因：** 调用方拿到了内部 List 的同一个可变引用，可以绕开 `TaskBoard` 的受控方法。

**后果：** 两个结构立即漂移，目录无法再判断哪一个结果可信。

**错误示例：**

```java
/** 错误地暴露内部可变列表。 */
public List<Task> getTasks() {
    return tasks;
}
```

**正确写法：**

```java
/** 返回与内部列表结构隔离的 JDK 25 快照。 */
public List<Task> getTasks() {
    return List.copyOf(tasks);
}
```

**验证方式：** 错误版清空返回值后观察 List/Map 数量为 `0/2`；JDK 25 正确版调用 `clear` 抛出
`UnsupportedOperationException`。Java 8 正确版应使用复制后包装的完整写法。

### 把 unmodifiableList 视图当成快照

**现象：** 旧查询结果不能直接修改，但目录新增任务后，旧结果的数量也跟着增加。

**触发条件：** 只用 `Collections.unmodifiableList(source)` 包装仍会继续变化的来源 List。

**原因：** 该 API 返回 read-through 视图，没有复制来源结构。

**后果：** 调用方无法保存某次查询当时的结果，后续输出和验收会悄悄变化。

**错误示例：**

```java
/** 错误地把只读视图当作独立快照。 */
private List<Task> snapshotOf(List<Task> source) {
    return Collections.unmodifiableList(source);
}
```

**正确写法：**

```java
/** 先复制来源结构，再创建 Java 8 只读结果。 */
private List<Task> snapshotOf(List<Task> source) {
    return Collections.unmodifiableList(new ArrayList<>(source));
}
```

**验证方式：** 来源最初一项，保存返回值后再向来源加入一项；错误视图的数量变为 `2`，复制后包装的旧结果
仍为 `1`。JDK 25 使用 `List.copyOf` 得到相同的隔离效果。

### 删除时只更新一个结构

**现象：** 已取消任务不再显示在 List 中，但 `findById` 仍能从 Map 查到它。

**触发条件：** Iterator 删除当前 List 元素后，没有删除对应 Map 键。

**原因：** List 与 Map 是两个独立容器，修改其中一个不会通知另一个。

**后果：** 列表、详情和后续统计看到不同任务集。

**错误示例：**

```java
if (task.getStatus() == TaskStatus.CANCELLED) {
    iterator.remove();
}
```

**正确写法：**

```java
if (task.getStatus() == TaskStatus.CANCELLED) {
    iterator.remove();
    tasksById.remove(task.getId());
}
```

**验证方式：** 删除 `TF-104` 后同时检查 List 中不含该编号、`findById("TF-104") == null`，最后执行
`isIndexConsistent()` 应返回 `true`。

### 用 removeIf 实现只读查询

**现象：** 方法返回了“非待办任务”，但源目录中的待办任务已经永久消失。

**触发条件：** 为了留下目标结果，先在内部任务 List 上调用 `removeIf`。

**原因：** `removeIf` 是结构修改操作，不是筛选结果的只读操作。

**后果：** 一次查询改变后续所有查询，并让 Map 索引与 List 不一致。

**错误示例：**

```java
/** 错误地通过删除源数据实现查询。 */
public List<Task> findNonTodoTasks() {
    tasks.removeIf(task -> task.getStatus() == TaskStatus.TODO);
    return tasks;
}
```

**正确写法：**

```java
/** 通过新结果列表完成只读查询。 */
public List<Task> findNonTodoTasks() {
    List<Task> matches = new ArrayList<>();
    for (Task task : tasks) {
        if (task.getStatus() != TaskStatus.TODO) {
            matches.add(task);
        }
    }
    return snapshotOf(matches);
}
```

**验证方式：** 查询前后分别输出目录总数；错误版数量减少，正确版总数不变且结果只包含非 TODO 任务。
:::

## 七、完整的 TeamFlow 任务集合查询程序

### 1. JDK 25 版本

在 JDK 25 项目中创建 `TeamFlowTaskQuery.java`，填入完整代码：

```java
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** 运行 TeamFlow 任务集合查询示例。 */
public class TeamFlowTaskQuery {
    /**
     * 登记任务并观察单项查询、多项查询、快照和同步删除。
     *
     * @param args 命令行参数，本程序不使用
     */
    public static void main(String[] args) {
        TaskBoard board = new TaskBoard();
        board.addTask(new Task("TF-101", "设计登录页面", "小林", TaskStatus.TODO));
        board.addTask(new Task("TF-102", "修复登录接口", "小周", TaskStatus.IN_PROGRESS));
        board.addTask(new Task("TF-103", "编写测试用例", "小林", TaskStatus.DONE));
        board.addTask(new Task("TF-104", "清理登录日志", "小陈", TaskStatus.CANCELLED));
        board.addTask(new Task("TF-105", "对接支付页面", "小周", TaskStatus.TODO));

        boolean duplicateAdded = board.addTask(
                new Task("TF-102", "重复任务", "小陈", TaskStatus.TODO));
        System.out.println("DUPLICATE_ADDED=" + duplicateAdded);
        System.out.println("BY_ID=" + board.findById("TF-102").toDisplayText());
        System.out.println("BY_STATUS=" + formatIds(board.findByStatus(TaskStatus.TODO)));
        System.out.println("BY_OWNER=" + formatIds(board.findByOwner("小林")));
        System.out.println("BY_KEYWORD=" + formatIds(board.findByKeyword("登录")));

        Set<TaskStatus> statuses = new LinkedHashSet<>();
        statuses.add(TaskStatus.TODO);
        statuses.add(TaskStatus.IN_PROGRESS);
        Set<String> owners = new LinkedHashSet<>();
        owners.add("小林");
        owners.add("小周");
        System.out.println("BY_CANDIDATES=" + formatIds(
                board.findByCandidates(statuses, owners)));

        List<Task> oldSnapshot = board.findByOwner("小周");
        board.addTask(new Task("TF-106", "联调支付接口", "小周", TaskStatus.IN_PROGRESS));
        System.out.println("OLD_SNAPSHOT=" + formatIds(oldSnapshot));
        System.out.println("FRESH_QUERY=" + formatIds(board.findByOwner("小周")));
        try {
            oldSnapshot.clear();
        } catch (UnsupportedOperationException error) {
            System.out.println("SNAPSHOT_UNMODIFIABLE=" + error.getClass().getSimpleName());
        }

        System.out.println("REMOVED_CANCELLED=" + board.removeCancelledTasks());
        System.out.println("CANCELLED_BY_ID=" + board.findById("TF-104"));
        System.out.println("AFTER_REMOVAL=" + formatIds(board.getTasks()));
        System.out.println("INDEX_CONSISTENT=" + board.isIndexConsistent());
    }

    /**
     * 把任务列表格式化为只包含编号的文本。
     *
     * @param tasks 待格式化任务
     * @return 任务编号列表文本
     */
    private static String formatIds(List<Task> tasks) {
        List<String> ids = new ArrayList<>();
        for (Task task : tasks) {
            ids.add(task.getId());
        }
        return ids.toString();
    }

    /** 限定任务在本示例中的处理状态。 */
    private enum TaskStatus {
        TODO,
        IN_PROGRESS,
        DONE,
        CANCELLED
    }

    /** 保存一项不可变的 TeamFlow 任务。 */
    private static final class Task {
        private final String id;
        private final String title;
        private final String owner;
        private final TaskStatus status;

        /**
         * 创建一项字段固定的任务。
         *
         * @param id 任务编号
         * @param title 任务标题
         * @param owner 负责人
         * @param status 任务状态
         */
        private Task(String id, String title, String owner, TaskStatus status) {
            this.id = id;
            this.title = title;
            this.owner = owner;
            this.status = status;
        }

        /** @return 任务编号 */
        private String getId() {
            return id;
        }

        /** @return 任务标题 */
        private String getTitle() {
            return title;
        }

        /** @return 负责人 */
        private String getOwner() {
            return owner;
        }

        /** @return 任务状态 */
        private TaskStatus getStatus() {
            return status;
        }

        /** @return 便于观察全部字段的文本 */
        private String toDisplayText() {
            return id + "|" + title + "|" + owner + "|" + status;
        }
    }

    /** 同时维护任务展示列表和编号索引。 */
    private static final class TaskBoard {
        private final List<Task> tasks = new ArrayList<>();
        private final Map<String, Task> tasksById = new LinkedHashMap<>();

        /**
         * 登记一项编号尚未出现的任务。
         *
         * @param task 待登记任务
         * @return 登记成功返回 true，编号重复返回 false
         */
        private boolean addTask(Task task) {
            if (tasksById.containsKey(task.getId())) {
                return false;
            }
            tasks.add(task);
            tasksById.put(task.getId(), task);
            return true;
        }

        /**
         * 按编号查询任务。
         *
         * @param taskId 任务编号
         * @return 对应任务；不存在时返回 null
         */
        private Task findById(String taskId) {
            return tasksById.get(taskId);
        }

        /**
         * 按状态查询任务。
         *
         * @param status 目标状态
         * @return 查询结果快照
         */
        private List<Task> findByStatus(TaskStatus status) {
            List<Task> matches = new ArrayList<>();
            for (Task task : tasks) {
                if (task.getStatus() == status) {
                    matches.add(task);
                }
            }
            return snapshotOf(matches);
        }

        /**
         * 按负责人查询任务。
         *
         * @param owner 负责人
         * @return 查询结果快照
         */
        private List<Task> findByOwner(String owner) {
            List<Task> matches = new ArrayList<>();
            for (Task task : tasks) {
                if (task.getOwner().equals(owner)) {
                    matches.add(task);
                }
            }
            return snapshotOf(matches);
        }

        /**
         * 按标题关键词查询任务。
         *
         * @param keyword 标题关键词
         * @return 查询结果快照
         */
        private List<Task> findByKeyword(String keyword) {
            List<Task> matches = new ArrayList<>();
            for (Task task : tasks) {
                if (task.getTitle().contains(keyword)) {
                    matches.add(task);
                }
            }
            return snapshotOf(matches);
        }

        /**
         * 查询状态和负责人都属于候选集合的任务。
         *
         * @param statuses 候选状态
         * @param owners 候选负责人
         * @return 查询结果快照
         */
        private List<Task> findByCandidates(Set<TaskStatus> statuses, Set<String> owners) {
            List<Task> matches = new ArrayList<>();
            for (Task task : tasks) {
                if (statuses.contains(task.getStatus()) && owners.contains(task.getOwner())) {
                    matches.add(task);
                }
            }
            return snapshotOf(matches);
        }

        /**
         * 同步删除 List 与 Map 中的已取消任务。
         *
         * @return 删除数量
         */
        private int removeCancelledTasks() {
            int removedCount = 0;
            Iterator<Task> iterator = tasks.iterator();
            while (iterator.hasNext()) {
                Task task = iterator.next();
                if (task.getStatus() == TaskStatus.CANCELLED) {
                    iterator.remove();
                    tasksById.remove(task.getId());
                    removedCount++;
                }
            }
            return removedCount;
        }

        /** @return 当前任务列表快照 */
        private List<Task> getTasks() {
            return snapshotOf(tasks);
        }

        /** @return List 与 Map 保存同一批任务时返回 true */
        private boolean isIndexConsistent() {
            if (tasks.size() != tasksById.size()) {
                return false;
            }
            for (Task task : tasks) {
                if (tasksById.get(task.getId()) != task) {
                    return false;
                }
            }
            return true;
        }

        /**
         * 创建 JDK 25 不可修改结果快照。
         *
         * @param source 当前结果
         * @return 与来源后续结构变化隔离的 List
         */
        private List<Task> snapshotOf(List<Task> source) {
            return List.copyOf(source);
        }
    }
}
```

### 2. Java 8 版本

在独立的 Java 8 项目中同样创建 `TeamFlowTaskQuery.java`。完整代码必须保留，只把快照实现换成 Java 8
可用的复制后包装：

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** 运行 Java 8 兼容的 TeamFlow 任务集合查询示例。 */
public class TeamFlowTaskQuery {
    /**
     * 登记任务并观察单项查询、多项查询、快照和同步删除。
     *
     * @param args 命令行参数，本程序不使用
     */
    public static void main(String[] args) {
        TaskBoard board = new TaskBoard();
        board.addTask(new Task("TF-101", "设计登录页面", "小林", TaskStatus.TODO));
        board.addTask(new Task("TF-102", "修复登录接口", "小周", TaskStatus.IN_PROGRESS));
        board.addTask(new Task("TF-103", "编写测试用例", "小林", TaskStatus.DONE));
        board.addTask(new Task("TF-104", "清理登录日志", "小陈", TaskStatus.CANCELLED));
        board.addTask(new Task("TF-105", "对接支付页面", "小周", TaskStatus.TODO));

        boolean duplicateAdded = board.addTask(
                new Task("TF-102", "重复任务", "小陈", TaskStatus.TODO));
        System.out.println("DUPLICATE_ADDED=" + duplicateAdded);
        System.out.println("BY_ID=" + board.findById("TF-102").toDisplayText());
        System.out.println("BY_STATUS=" + formatIds(board.findByStatus(TaskStatus.TODO)));
        System.out.println("BY_OWNER=" + formatIds(board.findByOwner("小林")));
        System.out.println("BY_KEYWORD=" + formatIds(board.findByKeyword("登录")));

        Set<TaskStatus> statuses = new LinkedHashSet<>();
        statuses.add(TaskStatus.TODO);
        statuses.add(TaskStatus.IN_PROGRESS);
        Set<String> owners = new LinkedHashSet<>();
        owners.add("小林");
        owners.add("小周");
        System.out.println("BY_CANDIDATES=" + formatIds(
                board.findByCandidates(statuses, owners)));

        List<Task> oldSnapshot = board.findByOwner("小周");
        board.addTask(new Task("TF-106", "联调支付接口", "小周", TaskStatus.IN_PROGRESS));
        System.out.println("OLD_SNAPSHOT=" + formatIds(oldSnapshot));
        System.out.println("FRESH_QUERY=" + formatIds(board.findByOwner("小周")));
        try {
            oldSnapshot.clear();
        } catch (UnsupportedOperationException error) {
            System.out.println("SNAPSHOT_UNMODIFIABLE=" + error.getClass().getSimpleName());
        }

        System.out.println("REMOVED_CANCELLED=" + board.removeCancelledTasks());
        System.out.println("CANCELLED_BY_ID=" + board.findById("TF-104"));
        System.out.println("AFTER_REMOVAL=" + formatIds(board.getTasks()));
        System.out.println("INDEX_CONSISTENT=" + board.isIndexConsistent());
    }

    /**
     * 把任务列表格式化为只包含编号的文本。
     *
     * @param tasks 待格式化任务
     * @return 任务编号列表文本
     */
    private static String formatIds(List<Task> tasks) {
        List<String> ids = new ArrayList<>();
        for (Task task : tasks) {
            ids.add(task.getId());
        }
        return ids.toString();
    }

    /** 限定任务在本示例中的处理状态。 */
    private enum TaskStatus {
        TODO,
        IN_PROGRESS,
        DONE,
        CANCELLED
    }

    /** 保存一项不可变的 TeamFlow 任务。 */
    private static final class Task {
        private final String id;
        private final String title;
        private final String owner;
        private final TaskStatus status;

        /**
         * 创建一项字段固定的任务。
         *
         * @param id 任务编号
         * @param title 任务标题
         * @param owner 负责人
         * @param status 任务状态
         */
        private Task(String id, String title, String owner, TaskStatus status) {
            this.id = id;
            this.title = title;
            this.owner = owner;
            this.status = status;
        }

        /** @return 任务编号 */
        private String getId() {
            return id;
        }

        /** @return 任务标题 */
        private String getTitle() {
            return title;
        }

        /** @return 负责人 */
        private String getOwner() {
            return owner;
        }

        /** @return 任务状态 */
        private TaskStatus getStatus() {
            return status;
        }

        /** @return 便于观察全部字段的文本 */
        private String toDisplayText() {
            return id + "|" + title + "|" + owner + "|" + status;
        }
    }

    /** 同时维护任务展示列表和编号索引。 */
    private static final class TaskBoard {
        private final List<Task> tasks = new ArrayList<>();
        private final Map<String, Task> tasksById = new LinkedHashMap<>();

        /**
         * 登记一项编号尚未出现的任务。
         *
         * @param task 待登记任务
         * @return 登记成功返回 true，编号重复返回 false
         */
        private boolean addTask(Task task) {
            if (tasksById.containsKey(task.getId())) {
                return false;
            }
            tasks.add(task);
            tasksById.put(task.getId(), task);
            return true;
        }

        /**
         * 按编号查询任务。
         *
         * @param taskId 任务编号
         * @return 对应任务；不存在时返回 null
         */
        private Task findById(String taskId) {
            return tasksById.get(taskId);
        }

        /**
         * 按状态查询任务。
         *
         * @param status 目标状态
         * @return 查询结果快照
         */
        private List<Task> findByStatus(TaskStatus status) {
            List<Task> matches = new ArrayList<>();
            for (Task task : tasks) {
                if (task.getStatus() == status) {
                    matches.add(task);
                }
            }
            return snapshotOf(matches);
        }

        /**
         * 按负责人查询任务。
         *
         * @param owner 负责人
         * @return 查询结果快照
         */
        private List<Task> findByOwner(String owner) {
            List<Task> matches = new ArrayList<>();
            for (Task task : tasks) {
                if (task.getOwner().equals(owner)) {
                    matches.add(task);
                }
            }
            return snapshotOf(matches);
        }

        /**
         * 按标题关键词查询任务。
         *
         * @param keyword 标题关键词
         * @return 查询结果快照
         */
        private List<Task> findByKeyword(String keyword) {
            List<Task> matches = new ArrayList<>();
            for (Task task : tasks) {
                if (task.getTitle().contains(keyword)) {
                    matches.add(task);
                }
            }
            return snapshotOf(matches);
        }

        /**
         * 查询状态和负责人都属于候选集合的任务。
         *
         * @param statuses 候选状态
         * @param owners 候选负责人
         * @return 查询结果快照
         */
        private List<Task> findByCandidates(Set<TaskStatus> statuses, Set<String> owners) {
            List<Task> matches = new ArrayList<>();
            for (Task task : tasks) {
                if (statuses.contains(task.getStatus()) && owners.contains(task.getOwner())) {
                    matches.add(task);
                }
            }
            return snapshotOf(matches);
        }

        /**
         * 同步删除 List 与 Map 中的已取消任务。
         *
         * @return 删除数量
         */
        private int removeCancelledTasks() {
            int removedCount = 0;
            Iterator<Task> iterator = tasks.iterator();
            while (iterator.hasNext()) {
                Task task = iterator.next();
                if (task.getStatus() == TaskStatus.CANCELLED) {
                    iterator.remove();
                    tasksById.remove(task.getId());
                    removedCount++;
                }
            }
            return removedCount;
        }

        /** @return 当前任务列表快照 */
        private List<Task> getTasks() {
            return snapshotOf(tasks);
        }

        /** @return List 与 Map 保存同一批任务时返回 true */
        private boolean isIndexConsistent() {
            if (tasks.size() != tasksById.size()) {
                return false;
            }
            for (Task task : tasks) {
                if (tasksById.get(task.getId()) != task) {
                    return false;
                }
            }
            return true;
        }

        /**
         * 创建 Java 8 不可修改结果快照。
         *
         * @param source 当前结果
         * @return 与来源后续结构变化隔离的 List
         */
        private List<Task> snapshotOf(List<Task> source) {
            return Collections.unmodifiableList(new ArrayList<>(source));
        }
    }
}
```

### 3. 运行步骤、输出和执行过程

JDK 25 项目把 Project SDK 和模块 SDK 设为 25；Java 8 项目把两处都设为 8。分别打开对应项目中的
`TeamFlowTaskQuery.java`，点击 `main` 左侧运行图标并选择 **Run 'TeamFlowTaskQuery.main()'**。两个控制台
都应完整输出：

```text
DUPLICATE_ADDED=false
BY_ID=TF-102|修复登录接口|小周|IN_PROGRESS
BY_STATUS=[TF-101, TF-105]
BY_OWNER=[TF-101, TF-103]
BY_KEYWORD=[TF-101, TF-102, TF-104]
BY_CANDIDATES=[TF-101, TF-102, TF-105]
OLD_SNAPSHOT=[TF-102, TF-105]
FRESH_QUERY=[TF-102, TF-105, TF-106]
SNAPSHOT_UNMODIFIABLE=UnsupportedOperationException
REMOVED_CANCELLED=1
CANCELLED_BY_ID=null
AFTER_REMOVAL=[TF-101, TF-102, TF-103, TF-105, TF-106]
INDEX_CONSISTENT=true
```

程序先拒绝重复编号，再分别从 Map 和 List 完成查询。`OLD_SNAPSHOT` 在 `TF-106` 写入前创建，所以仍只有
两项；新查询能看到三项。清空旧结果被拒绝，没有改变内部目录。最后 Iterator 从 List 删除 `TF-104`，同一
编号也从 Map 移除，一致性检查因此为 `true`。

## 八、独立练习

### 1. 发布前任务查询

:::exercise
### TeamFlow 发布任务目录

**要求：** 创建 `TeamFlowReleaseQuery`，用私有 List 保存录入顺序、私有 Map 建立编号索引；拒绝重复编号，
按负责人查询并返回不可修改快照，再用 Iterator 同步删除 DONE 任务。依次加入 `TF-201`、`TF-202`、
`TF-203`、重复 `TF-202`，先保存小林的旧查询结果，再加入小林负责的 `TF-204`。不得使用 Stream、排序、
日期、Optional、Spring 或数据库。

**验收：**

```text
DUPLICATE_ADDED=false
OLD_OWNER_QUERY=[TF-201, TF-203]
FRESH_OWNER_QUERY=[TF-201, TF-203, TF-204]
REMOVED_DONE=1
DONE_BY_ID=null
TASKS=[TF-201, TF-203, TF-204]
INDEX_CONSISTENT=true
```
:::

### 2. JDK 25 参考实现

```java
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** 完成 TeamFlow 发布前任务查询练习。 */
public class TeamFlowReleaseQuery {
    /**
     * 运行任务登记、查询快照和同步删除流程。
     *
     * @param args 命令行参数，本程序不使用
     */
    public static void main(String[] args) {
        ReleaseTasks releaseTasks = new ReleaseTasks();
        releaseTasks.add(new Task("TF-201", "检查发布清单", "小林", Status.TODO));
        releaseTasks.add(new Task("TF-202", "完成回归测试", "小周", Status.DONE));
        releaseTasks.add(new Task("TF-203", "确认部署窗口", "小林", Status.IN_PROGRESS));
        boolean duplicateAdded = releaseTasks.add(
                new Task("TF-202", "重复任务", "小林", Status.TODO));

        List<Task> oldOwnerQuery = releaseTasks.findByOwner("小林");
        releaseTasks.add(new Task("TF-204", "发送发布通知", "小林", Status.TODO));
        System.out.println("DUPLICATE_ADDED=" + duplicateAdded);
        System.out.println("OLD_OWNER_QUERY=" + ids(oldOwnerQuery));
        System.out.println("FRESH_OWNER_QUERY=" + ids(releaseTasks.findByOwner("小林")));
        System.out.println("REMOVED_DONE=" + releaseTasks.removeDone());
        System.out.println("DONE_BY_ID=" + releaseTasks.findById("TF-202"));
        System.out.println("TASKS=" + ids(releaseTasks.all()));
        System.out.println("INDEX_CONSISTENT=" + releaseTasks.isConsistent());
    }

    /**
     * 返回任务编号列表文本。
     *
     * @param tasks 待格式化任务
     * @return 编号列表文本
     */
    private static String ids(List<Task> tasks) {
        List<String> result = new ArrayList<>();
        for (Task task : tasks) {
            result.add(task.id);
        }
        return result.toString();
    }

    /** 限定练习中的任务状态。 */
    private enum Status {
        TODO,
        IN_PROGRESS,
        DONE
    }

    /** 保存练习所需的不可变任务数据。 */
    private static final class Task {
        private final String id;
        private final String title;
        private final String owner;
        private final Status status;

        /**
         * 创建一项发布任务。
         *
         * @param id 任务编号
         * @param title 任务标题
         * @param owner 负责人
         * @param status 任务状态
         */
        private Task(String id, String title, String owner, Status status) {
            this.id = id;
            this.title = title;
            this.owner = owner;
            this.status = status;
        }
    }

    /** 维护发布任务的列表和编号索引。 */
    private static final class ReleaseTasks {
        private final List<Task> tasks = new ArrayList<>();
        private final Map<String, Task> byId = new LinkedHashMap<>();

        /**
         * 登记编号不重复的任务。
         *
         * @param task 待登记任务
         * @return 登记成功返回 true
         */
        private boolean add(Task task) {
            if (byId.containsKey(task.id)) {
                return false;
            }
            tasks.add(task);
            byId.put(task.id, task);
            return true;
        }

        /**
         * 按负责人查询任务。
         *
         * @param owner 负责人
         * @return 查询结果快照
         */
        private List<Task> findByOwner(String owner) {
            List<Task> matches = new ArrayList<>();
            for (Task task : tasks) {
                if (task.owner.equals(owner)) {
                    matches.add(task);
                }
            }
            return List.copyOf(matches);
        }

        /**
         * 按编号查询任务。
         *
         * @param id 任务编号
         * @return 对应任务；不存在时返回 null
         */
        private Task findById(String id) {
            return byId.get(id);
        }

        /** @return 同步删除的 DONE 任务数量 */
        private int removeDone() {
            int count = 0;
            Iterator<Task> iterator = tasks.iterator();
            while (iterator.hasNext()) {
                Task task = iterator.next();
                if (task.status == Status.DONE) {
                    iterator.remove();
                    byId.remove(task.id);
                    count++;
                }
            }
            return count;
        }

        /** @return 当前全部任务的快照 */
        private List<Task> all() {
            return List.copyOf(tasks);
        }

        /** @return List 与 Map 保存同一批对象时返回 true */
        private boolean isConsistent() {
            if (tasks.size() != byId.size()) {
                return false;
            }
            for (Task task : tasks) {
                if (byId.get(task.id) != task) {
                    return false;
                }
            }
            return true;
        }
    }
}
```

### 3. Java 8 参考实现

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** 完成 Java 8 兼容的 TeamFlow 发布前任务查询练习。 */
public class TeamFlowReleaseQuery {
    /**
     * 运行任务登记、查询快照和同步删除流程。
     *
     * @param args 命令行参数，本程序不使用
     */
    public static void main(String[] args) {
        ReleaseTasks releaseTasks = new ReleaseTasks();
        releaseTasks.add(new Task("TF-201", "检查发布清单", "小林", Status.TODO));
        releaseTasks.add(new Task("TF-202", "完成回归测试", "小周", Status.DONE));
        releaseTasks.add(new Task("TF-203", "确认部署窗口", "小林", Status.IN_PROGRESS));
        boolean duplicateAdded = releaseTasks.add(
                new Task("TF-202", "重复任务", "小林", Status.TODO));

        List<Task> oldOwnerQuery = releaseTasks.findByOwner("小林");
        releaseTasks.add(new Task("TF-204", "发送发布通知", "小林", Status.TODO));
        System.out.println("DUPLICATE_ADDED=" + duplicateAdded);
        System.out.println("OLD_OWNER_QUERY=" + ids(oldOwnerQuery));
        System.out.println("FRESH_OWNER_QUERY=" + ids(releaseTasks.findByOwner("小林")));
        System.out.println("REMOVED_DONE=" + releaseTasks.removeDone());
        System.out.println("DONE_BY_ID=" + releaseTasks.findById("TF-202"));
        System.out.println("TASKS=" + ids(releaseTasks.all()));
        System.out.println("INDEX_CONSISTENT=" + releaseTasks.isConsistent());
    }

    /**
     * 返回任务编号列表文本。
     *
     * @param tasks 待格式化任务
     * @return 编号列表文本
     */
    private static String ids(List<Task> tasks) {
        List<String> result = new ArrayList<>();
        for (Task task : tasks) {
            result.add(task.id);
        }
        return result.toString();
    }

    /** 限定练习中的任务状态。 */
    private enum Status {
        TODO,
        IN_PROGRESS,
        DONE
    }

    /** 保存练习所需的不可变任务数据。 */
    private static final class Task {
        private final String id;
        private final String title;
        private final String owner;
        private final Status status;

        /**
         * 创建一项发布任务。
         *
         * @param id 任务编号
         * @param title 任务标题
         * @param owner 负责人
         * @param status 任务状态
         */
        private Task(String id, String title, String owner, Status status) {
            this.id = id;
            this.title = title;
            this.owner = owner;
            this.status = status;
        }
    }

    /** 维护发布任务的列表和编号索引。 */
    private static final class ReleaseTasks {
        private final List<Task> tasks = new ArrayList<>();
        private final Map<String, Task> byId = new LinkedHashMap<>();

        /**
         * 登记编号不重复的任务。
         *
         * @param task 待登记任务
         * @return 登记成功返回 true
         */
        private boolean add(Task task) {
            if (byId.containsKey(task.id)) {
                return false;
            }
            tasks.add(task);
            byId.put(task.id, task);
            return true;
        }

        /**
         * 按负责人查询任务。
         *
         * @param owner 负责人
         * @return 查询结果快照
         */
        private List<Task> findByOwner(String owner) {
            List<Task> matches = new ArrayList<>();
            for (Task task : tasks) {
                if (task.owner.equals(owner)) {
                    matches.add(task);
                }
            }
            return Collections.unmodifiableList(new ArrayList<>(matches));
        }

        /**
         * 按编号查询任务。
         *
         * @param id 任务编号
         * @return 对应任务；不存在时返回 null
         */
        private Task findById(String id) {
            return byId.get(id);
        }

        /** @return 同步删除的 DONE 任务数量 */
        private int removeDone() {
            int count = 0;
            Iterator<Task> iterator = tasks.iterator();
            while (iterator.hasNext()) {
                Task task = iterator.next();
                if (task.status == Status.DONE) {
                    iterator.remove();
                    byId.remove(task.id);
                    count++;
                }
            }
            return count;
        }

        /** @return 当前全部任务的快照 */
        private List<Task> all() {
            return Collections.unmodifiableList(new ArrayList<>(tasks));
        }

        /** @return List 与 Map 保存同一批对象时返回 true */
        private boolean isConsistent() {
            if (tasks.size() != byId.size()) {
                return false;
            }
            for (Task task : tasks) {
                if (byId.get(task.id) != task) {
                    return false;
                }
            }
            return true;
        }
    }
}
```

两个项目分别选择 JDK 25 和 JDK 8，运行 `TeamFlowReleaseQuery.main()`。输出必须与验收文本逐行一致。
旧的负责人查询只有 `TF-201` 和 `TF-203`，证明结果是快照；删除 DONE 后，List 和 Map 都不再包含
`TF-202`，最终一致性检查为 `true`。

## 九、让查询结果和目录状态各自可信

任务集合查询不是把五个 API 堆在一起，而是让每种结构承担明确职责：List 决定扫描与展示顺序，Map 提供
编号索引，Set 表达候选成员，Iterator 保证删除当前元素时不破坏遍历。写入与删除集中维护多个结构，查询则
只读取并返回快照，调用方才能相信“这次查到的结果”和“目录现在的状态”各自表达什么。
