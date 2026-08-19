---
id: backend.java.learn.basics.collections-and-iteration-contracts
type: lesson
title: List
summary: 用有序、可重复的列表保存 TeamFlow 任务，并正确处理索引、实现选择、视图与不可修改边界
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 100
prerequisites:
  - backend.java.learn.basics.generics-and-type-safety
objectives:
  - 能说明 List 的顺序、重复元素、索引和具体实现分别承担什么职责。
  - 能使用 add、get、set、remove、size 完成列表的基本增删改查。
  - 能准确判断读取、替换、删除与插入位置的合法索引边界。
  - 能根据索引访问和结构变化选择 ArrayList 或 LinkedList，不套用片面的性能结论。
  - 能区分可变列表、固定大小列表、不可修改视图、不可修改副本和 subList 视图。
  - 能在 JDK 25 与 Java 8 中分别运行完整的 TeamFlow List 程序。
recap:
  - List 按位置保存有序元素，索引从 0 开始，通常允许重复元素。
  - 变量优先声明为 List 接口，普通列表默认从 ArrayList 开始选择。
  - get、set、remove 的有效索引小于 size，按位置 add 还允许在 size 处追加。
  - List.of 与 List.copyOf 返回不可修改且不接受 null 的列表，Java 8 没有这两个工厂方法。
  - Arrays.asList 返回固定大小列表；需要增删时应把它复制进新的 ArrayList。
  - Collections.unmodifiableList 返回只读视图，复制后再包装才能隔离原列表的结构变化。
  - subList 使用左闭右开区间并共享原列表，独立结果需要显式复制。
related: []
tags:
  - Java
  - List
  - ArrayList
  - LinkedList
  - 索引
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 使用 Arrays.asList 与复制后包装的兼容写法
verifiedAt: 2026-08-17
sources:
  - id: java-25-list
    title: Java SE 25 API - List
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - List 的顺序、重复元素、索引边界与可选修改操作合同
      - List.of、List.copyOf 的不可修改与 null 限制
      - subList 的左闭右开区间和视图合同
  - id: java-25-arraylist
    title: Java SE 25 API - ArrayList
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - ArrayList 的可增长数组实现、null 支持与核心操作成本
  - id: java-25-linkedlist
    title: Java SE 25 API - LinkedList
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/LinkedList.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - LinkedList 的双向链表结构和按索引访问需要遍历节点
  - id: dev-java-lists
    title: Lists - Dev.java
    url: https://dev.java/learn/api/collections-framework/lists
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java 集合教程；核心合同已与 Java SE 25 API 核对
    claims:
      - List 的入门使用、索引操作与 subList 视图
      - 不确定具体实现时优先从 ArrayList 开始选择
  - id: dev-java-arraylist-vs-linkedlist
    title: ArrayList vs. LinkedList - Dev.java
    url: https://dev.java/learn/api/collections-framework/arraylist-vs-linkedlist
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java 集合教程；实现合同已与 Java SE 25 API 核对
    claims:
      - 普通列表场景下 ArrayList 与 LinkedList 的实现选择依据
      - 不能把链表插入删除简单概括为始终更快
  - id: java-8-list
    title: Java SE 8 API - List
    url: https://docs.oracle.com/javase/8/docs/api/java/util/List.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 的 List 顺序、索引、重复元素与可选操作合同
      - Java 8 的 List 接口没有 of 与 copyOf 工厂方法
  - id: java-8-arrays
    title: Java SE 8 API - Arrays
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Arrays.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Arrays.asList 返回由数组支持的固定大小列表
  - id: java-8-collections
    title: Java SE 8 API - Collections
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Collections.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Collections.unmodifiableList 返回指定列表的不可修改视图
  - id: java-10-list
    title: Java SE 10 API - List
    url: https://docs.oracle.com/javase/10/docs/api/java/util/List.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 10 及以上
    claims:
      - List.copyOf 静态工厂方法在 Java 10 API 中提供不可修改副本
  - id: baeldung-list-unsupported-operation
    title: UnsupportedOperationException when Modifying a List
    url: https://www.baeldung.com/java-list-unsupported-operation-exception
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 及以上；技术结论已与 Arrays.asList 官方合同核对
    claims:
      - 把 Arrays.asList 当成可增删 ArrayList 是常见的 UnsupportedOperationException 来源
  - id: coderanch-sublist-view
    title: ConcurrentModificationException
    url: https://coderanch.com/t/648420/java/ConcurrentModificationException
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 及以上；技术结论已与 List.subList 官方合同核对
    claims:
      - 持有 subList 视图时结构性修改原列表会让后续视图操作失去可靠语义
---

# List

TeamFlow 的任务有自然顺序：产品确认需求后，开发实现接口，最后再联调。程序不仅要保存这些任务，
还要能回答“现在有几项”“第一个是什么”“把第二项替换成什么”。数组也能按位置保存数据，但长度固定；
`List` 把“按顺序保存一组同类型元素”做成了更适合持续增删的标准库合同。

本课只学习 `List`。你会使用索引操作、比较 `ArrayList` 与 `LinkedList`，并区分几种容易混淆的只读和
视图边界。`Set`、`Map`、完整遍历方式、遍历期间安全删除与排序分别留给后续课程。

## 一、先建立列表心智模型

### 1. List 是按位置排列的序列

`List<E>` 中的 `E` 是上一课学过的类型参数。`List<String>` 表示这份列表只能按合同保存字符串，元素
按照加入位置形成稳定序列。列表的第一个索引是 `0`，最后一个索引是 `size() - 1`。

下面的最小程序依次加入三个任务，再读取数量和首项：

```java
import java.util.ArrayList;
import java.util.List;

/** 演示 List 的顺序、数量和索引。 */
public class ListOrderDemo {
    /**
     * 创建任务列表并读取首项。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        List<String> tasks = new ArrayList<>();
        tasks.add("确认需求");
        tasks.add("实现接口");
        tasks.add("准备联调");

        System.out.println("任务数量：" + tasks.size());
        System.out.println("首个任务：" + tasks.get(0));
        System.out.println("全部任务：" + tasks);
    }
}
```

运行结果：

```text
任务数量：3
首个任务：确认需求
全部任务：[确认需求, 实现接口, 准备联调]
```

三次 `add` 按调用顺序把元素放到列表尾部，因此 `get(0)` 读取“确认需求”。`size()` 返回当前元素
数量 `3`，它不是最后一个索引；此时最后一个合法读取索引是 `2`。

### 2. 顺序不等于排序

`List` 保证的是位置顺序，不会自动按照文字、编号或优先级排序。下面的列表允许把同一任务编号加入
两次，并保留原始加入顺序：

```java
List<String> taskIds = new ArrayList<>();
taskIds.add("TF-302");
taskIds.add("TF-101");
taskIds.add("TF-302");

System.out.println(taskIds);
```

输出为：

```text
[TF-302, TF-101, TF-302]
```

第二个 `TF-302` 不会被自动去重，`TF-101` 也不会因为编号更小而移动到开头。本课需要顺序和允许重复
这两个语义；唯一性与排序规则不在 `List` 自己的合同中。

### 3. null 是否允许由实现决定

`List` 接口没有要求所有实现都接受 `null`。`ArrayList` 可以保存 `null`，而 JDK 25 的 `List.of` 和
`List.copyOf` 明确拒绝 `null`。这只是选择列表工厂时需要核对的合同，不把本课扩展成缺失值处理：

```java
List<String> draftOwners = new ArrayList<>();
draftOwners.add(null);

System.out.println("ArrayList 中的 null：" + draftOwners.get(0));
```

输出为 `ArrayList 中的 null：null`。如果把同样的 `null` 交给 `List.of` 或 `List.copyOf`，创建调用会
抛出 `NullPointerException`。因此不能只看到变量类型是 `List`，就推断所有实现拥有相同的 `null` 合同。

### 4. 接口变量与实现对象各有职责

推荐让变量使用接口类型，让创建表达式选择具体实现：

```java
List<String> tasks = new ArrayList<>();
```

左侧 `List<String>` 说明调用代码依赖“有序列表”合同；右侧 `new ArrayList<>()` 决定数据在内存中采用
可增长数组实现。以后确实需要换实现时，依赖 `List` 合同的基本调用通常不必改写。

这并不意味着具体实现不重要。`ArrayList` 和 `LinkedList` 都是 `List`，但内部结构和操作成本不同。
先按接口写调用代码，再根据真实访问方式选择实现，二者并不冲突。

## 二、用索引完成基本操作

### 1. add 在尾部或指定位置插入

单参数 `add(element)` 把元素追加到尾部；双参数 `add(index, element)` 把元素插入指定位置，并让该位置
及其后的元素向后移动：

```java
List<String> tasks = new ArrayList<>();
tasks.add("实现接口");
tasks.add("准备联调");
tasks.add(0, "确认需求");

System.out.println(tasks);
```

输出为：

```text
[确认需求, 实现接口, 准备联调]
```

插入前列表大小是 `2`，合法插入位置是 `0`、`1`、`2`。在 `0` 处插入成为首项；在 `size()` 处插入
等同于追加到尾部。插入位置不能大于当前 `size()`。

### 2. get 读取，set 替换

`get(index)` 只读取指定位置的元素，不改变列表；`set(index, element)` 替换已有位置，并返回被替换的
旧元素：

```java
List<String> tasks = new ArrayList<>();
tasks.add("确认需求");
tasks.add("配置测试环境");
tasks.add("准备联调");

String oldTask = tasks.set(1, "实现登录接口");

System.out.println("替换前：" + oldTask);
System.out.println("替换后：" + tasks.get(1));
System.out.println("当前列表：" + tasks);
```

输出为：

```text
替换前：配置测试环境
替换后：实现登录接口
当前列表：[确认需求, 实现登录接口, 准备联调]
```

`set` 不会新增位置，所以列表大小仍然是 `3`。如果目的是在索引 `1` 前增加一项，应使用
`add(1, element)`；如果目的是替换索引 `1` 的值，才使用 `set(1, element)`。

### 3. remove 有按索引和按对象两种重载

`remove(int index)` 删除指定位置并返回被删除的元素；`remove(Object value)` 删除第一次匹配的值并
返回是否找到。字符串列表中两者容易从实参类型区分：

```java
List<String> tasks = new ArrayList<>();
tasks.add("确认需求");
tasks.add("实现接口");
tasks.add("准备联调");
tasks.add("实现接口");

String removedByIndex = tasks.remove(0);
boolean removedByValue = tasks.remove("实现接口");

System.out.println("按位置删除：" + removedByIndex);
System.out.println("按值删除成功：" + removedByValue);
System.out.println("剩余任务：" + tasks);
```

输出为：

```text
按位置删除：确认需求
按值删除成功：true
剩余任务：[准备联调, 实现接口]
```

按值删除只移除了第一次匹配的“实现接口”，所以重复元素仍可能保留。整数列表中的实参本身也是
`int`，会优先匹配按索引重载，这个风险会在易错项中单独验证。

### 4. 每种索引操作的上界不同

假设列表大小是 `3`：

| 操作 | 合法索引 | 原因 |
| --- | --- | --- |
| `get(index)` | `0` 到 `2` | 只能读取已有元素 |
| `set(index, value)` | `0` 到 `2` | 只能替换已有元素 |
| `remove(index)` | `0` 到 `2` | 只能删除已有元素 |
| `add(index, value)` | `0` 到 `3` | `3` 表示插入到尾部 |

因此不能把 `size()` 当成读取索引。列表为空时 `size()` 是 `0`，没有任何合法的 `get`、`set` 或
`remove` 索引，但 `add(0, value)` 合法。

## 三、选择 ArrayList 还是 LinkedList

### 1. ArrayList 适合普通列表

`ArrayList` 内部使用可增长数组。数组位置能够直接定位，所以 `size`、`get`、`set` 等操作是常量时间；
尾部 `add` 是摊销常量时间。容量不足时它会偶尔分配更大数组并复制已有引用，因此“摊销”表示把少数
扩容成本分散到多次追加操作后，平均仍保持常量级。

在中间插入或删除时，后面的元素需要移动，成本大致随受影响元素数量增长。这不妨碍 `ArrayList` 成为
普通业务列表的默认起点：任务页面通常频繁按位置读取，绝大多数新增也发生在尾部。

```java
List<String> tasks = new ArrayList<>();
tasks.add("确认需求");
tasks.add("实现接口");
System.out.println(tasks.get(1));
```

这里连续追加后直接读取索引 `1`，与 `ArrayList` 的结构特征一致。

### 2. LinkedList 的索引访问需要走过节点

`LinkedList` 使用双向链表保存节点。调用 `get(index)` 时，它会从距离目标更近的一端开始，逐个走过
节点，因此访问成本会随索引位置变化。下面代码在语法和结果上完全合法，但若大量重复按索引读取，
不能把它当成数组式直接定位：

```java
List<String> tasks = new java.util.LinkedList<>();
tasks.add("确认需求");
tasks.add("实现接口");
tasks.add("准备联调");
System.out.println(tasks.get(2));
```

程序仍输出“准备联调”。差异不是功能对错，而是实现找到该位置所经过的步骤不同。

`LinkedList` 还实现了双端队列合同，但那是另一种使用需求。本课不展开队列 API；只需要记住：不要因为
“链表插入删除快”这句脱离位置和访问方式的口号，就把普通索引列表全部换成 `LinkedList`。

### 3. 从实际访问方式做选择

| 真实需求 | 建议起点 | 判断依据 |
| --- | --- | --- |
| 经常按索引读取、替换 | `ArrayList` | 数组位置可直接定位 |
| 主要在尾部追加并读取 | `ArrayList` | 尾部追加为摊销常量时间 |
| 不确定该选哪个 | `ArrayList` | 普通列表的稳妥默认值 |
| 需要明确的双端队列语义 | 后续再评估 `LinkedList` | 需求已经不只是普通索引列表 |

实现选择应来自真实操作，而不是只比较一次理论步骤。列表规模很小、操作次数很少时，可读性和正确的
数据语义通常比微小性能差异更重要。

## 四、分清可变、固定大小与不可修改

### 1. ArrayList 默认可以改变结构和元素

“改变结构”指元素数量变化，例如 `add` 或 `remove`；“替换元素”指数量不变，例如 `set`。
普通 `ArrayList` 两者都允许：

```java
List<String> tasks = new ArrayList<>();
tasks.add("确认需求");
tasks.add("准备联调");
tasks.set(1, "实现接口");
tasks.remove(0);

System.out.println(tasks);
```

输出为 `[实现接口]`。先替换索引 `1`，列表大小仍为 `2`；再删除索引 `0`，大小变为 `1`。

### 2. List.of 和 List.copyOf 创建不可修改列表

JDK 25 可以用 `List.of` 直接创建少量已知元素，用 `List.copyOf` 从现有集合创建不可修改副本：

```java
List<String> stages = List.of("待处理", "进行中", "已完成");

List<String> draftTasks = new ArrayList<>();
draftTasks.add("确认需求");
draftTasks.add("实现接口");
List<String> publishedTasks = List.copyOf(draftTasks);

draftTasks.add("准备联调");

System.out.println("草稿：" + draftTasks);
System.out.println("发布副本：" + publishedTasks);
```

输出为：

```text
草稿：[确认需求, 实现接口, 准备联调]
发布副本：[确认需求, 实现接口]
```

`List.copyOf` 在复制时取得元素引用，此后草稿列表再增删不会改变发布列表的结构。`List.of` 和
`List.copyOf` 都不接受 `null`，也不允许 `add`、`remove` 或 `set`。这里的“不可修改”只约束列表结构和
列表中保存的引用；如果元素对象自身可变，它不会自动把对象变成不可变对象。

### 3. Java 8 的 Arrays.asList 是固定大小列表

Java 8 没有 `List.of` 和 `List.copyOf`。`Arrays.asList` 可以把一组已知元素包装为列表，但返回的是由
数组支持的固定大小列表：允许 `set`，不允许改变元素数量。

```java
import java.util.Arrays;
import java.util.List;

List<String> fixedTasks = Arrays.asList("确认需求", "实现接口");
fixedTasks.set(1, "实现登录接口");
System.out.println(fixedTasks);
```

输出为 `[确认需求, 实现登录接口]`。若随后调用 `fixedTasks.add("准备联调")`，运行时会抛出
`UnsupportedOperationException`。需要可增删列表时，应显式复制：

```java
List<String> tasks = new ArrayList<>(Arrays.asList("确认需求", "实现接口"));
tasks.add("准备联调");
System.out.println(tasks);
```

此时输出 `[确认需求, 实现接口, 准备联调]`，因为实际接收新增操作的是新的 `ArrayList`。

### 4. 不可修改视图不等于独立副本

JDK 25 和 Java 8 都有 `Collections.unmodifiableList(source)`。它禁止通过返回结果修改列表，却仍然观察
同一个底层列表：

```java
import java.util.Collections;

List<String> source = new ArrayList<>();
source.add("确认需求");
List<String> view = Collections.unmodifiableList(source);

source.add("实现接口");
System.out.println(view);
```

输出 `[确认需求, 实现接口]`。虽然不能调用 `view.add(...)`，通过 `source` 增加的元素仍会出现在视图中。

如果 Java 8 代码需要“原列表后续变化不影响发布结果”，先复制，再包装：

```java
List<String> snapshot = Collections.unmodifiableList(new ArrayList<>(source));
source.add("准备联调");
System.out.println(snapshot);
```

`snapshot` 不出现后来加入的“准备联调”，因为它包装的是新的 `ArrayList`，不再与 `source` 共用列表结构。

## 五、理解 subList 的视图边界

### 1. 区间是左闭右开

`subList(fromIndex, toIndex)` 返回从 `fromIndex` 开始、到 `toIndex` 之前结束的列表视图。下面索引 `1`
包含在结果中，索引 `3` 不包含：

```java
List<String> tasks = new ArrayList<>();
tasks.add("确认需求");
tasks.add("实现接口");
tasks.add("编写测试");
tasks.add("准备联调");

List<String> developmentTasks = tasks.subList(1, 3);
System.out.println(developmentTasks);
```

输出为 `[实现接口, 编写测试]`。区间写成 `[1, 3)`，长度正好是 `3 - 1 = 2`。

### 2. 视图修改会反映到原列表

`subList` 不是复制。通过视图替换元素，原列表相同位置也会变化：

```java
List<String> tasks = new ArrayList<>();
tasks.add("确认需求");
tasks.add("实现接口");
tasks.add("编写测试");
tasks.add("准备联调");

List<String> developmentTasks = tasks.subList(1, 3);
developmentTasks.set(0, "实现登录接口");

System.out.println("视图：" + developmentTasks);
System.out.println("原列表：" + tasks);
```

输出为：

```text
视图：[实现登录接口, 编写测试]
原列表：[确认需求, 实现登录接口, 编写测试, 准备联调]
```

两份变量描述的是同一段列表结构。持有视图期间，不要绕过视图去对原列表做结构性修改；官方合同规定
此后视图语义未定义。如果调用方需要独立结果，立即复制：

```java
List<String> independentTasks = new ArrayList<>(tasks.subList(1, 3));
tasks.add("准备演示");
System.out.println(independentTasks);
```

`independentTasks` 仍是复制时的两个元素，不受原列表新增操作影响。

## 易错点

**社区补充：** 真实问答案例中，`Arrays.asList` 被误当成普通可变列表，以及创建 `subList` 后又直接
改变原列表结构，是两类反复出现的问题。本节的技术结论已经分别回到 Java 8 `Arrays` 和 Java 25
`List` 官方合同核验；这里只用社区案例帮助识别常见触发方式，不把问答经验当成独立规则。

:::pitfalls
### 把 size 当成最后一个索引

**现象：** 列表已有两项，读取 `get(tasks.size())` 时抛出 `IndexOutOfBoundsException`。

**触发条件：** 把元素数量误当成最后一个元素的位置。

**原因：** 索引从 `0` 开始，大小为 `2` 时合法读取索引只有 `0` 和 `1`。

**后果：** 程序无法取得预期任务，并在该读取位置终止当前执行路径。

**错误示例：**

```java
List<String> tasks = new ArrayList<>(List.of("确认需求", "实现接口"));
System.out.println(tasks.get(tasks.size()));
```

**正确写法：**

```java
List<String> tasks = new ArrayList<>(List.of("确认需求", "实现接口"));
System.out.println(tasks.get(tasks.size() - 1));
```

**影响版本：** JDK 25 与 Java 8 都受影响；Java 8 初始化时改用 `Arrays.asList` 即可复现同一索引规则。

**验证方式：** 错误代码在索引 `2` 处失败；正确代码输出“实现接口”。

### 在整数列表中把值传给 remove

**现象：** 想删除整数 `20`，却尝试删除索引 `20`，列表较短时抛出 `IndexOutOfBoundsException`。

**触发条件：** 在 `List<Integer>` 上调用 `remove(20)`。

**原因：** 字面量 `20` 的类型是 `int`，因此匹配 `remove(int index)`，不是 `remove(Object value)`。

**后果：** 删除目标错误；即使索引碰巧合法，也会删除错误位置的元素。

**错误示例：**

```java
List<Integer> estimates = new ArrayList<>(List.of(10, 20, 30));
estimates.remove(20);
```

**正确写法：**

```java
List<Integer> estimates = new ArrayList<>(List.of(10, 20, 30));
estimates.remove(Integer.valueOf(20));
System.out.println(estimates);
```

**影响版本：** JDK 25 与 Java 8 都受影响；Java 8 初始化时使用 `Arrays.asList(10, 20, 30)`。

**验证方式：** 错误代码尝试访问索引 `20` 并失败；正确代码输出 `[10, 30]`。

### 把 Arrays.asList 当成可增删列表

**现象：** `set` 可以工作，但调用 `add` 或 `remove` 时抛出 `UnsupportedOperationException`。

**触发条件：** 直接在 `Arrays.asList(...)` 的返回值上改变元素数量。

**原因：** 该返回值由原数组支持，大小固定，不是普通的可增长 `ArrayList`。

**后果：** Java 8 初始化代码看似得到 `List`，运行到第一次结构修改才失败。

**错误示例：**

```java
List<String> tasks = Arrays.asList("确认需求", "实现接口");
tasks.add("准备联调");
```

**正确写法：**

```java
List<String> tasks = new ArrayList<>(Arrays.asList("确认需求", "实现接口"));
tasks.add("准备联调");
System.out.println(tasks);
```

**影响版本：** Java 8 及以上的 `Arrays.asList` 都具有固定大小合同。

**验证方式：** 错误代码在 `add` 处失败；正确代码输出 `[确认需求, 实现接口, 准备联调]`。

### 修改 List.of 或 List.copyOf 的结果

**现象：** 调用 `add`、`remove` 或 `set` 时抛出 `UnsupportedOperationException`。

**触发条件：** 把不可修改列表当成可编辑草稿。

**原因：** `List.of` 与 `List.copyOf` 明确返回不可修改列表，修改方法只是接口中的可选操作。

**后果：** 代码可以编译，却在运行到修改调用时失败。

**错误示例：**

```java
List<String> stages = List.of("待处理", "已完成");
stages.set(0, "进行中");
```

**正确写法：**

```java
List<String> stages = new ArrayList<>(List.of("待处理", "已完成"));
stages.set(0, "进行中");
System.out.println(stages);
```

**影响版本：** `List.of` 从 Java 9 可用，`List.copyOf` 从 Java 10 可用；Java 8 没有这两个方法。

**验证方式：** 错误代码在 `set` 处失败；正确代码输出 `[进行中, 已完成]`。

### 把不可修改视图当成独立快照

**现象：** 没有通过只读变量修改数据，但原列表新增元素后，只读结果也跟着变化。

**触发条件：** 直接包装原列表后，仍保留并修改原列表引用。

**原因：** `Collections.unmodifiableList` 返回指定列表的不可修改视图，不会自动复制底层列表。

**后果：** 已发布或已交付的列表内容可能被原列表的后续结构修改悄悄改变。

**错误示例：**

```java
List<String> source = new ArrayList<>();
source.add("确认需求");
List<String> published = Collections.unmodifiableList(source);
source.add("实现接口");
System.out.println(published);
```

**正确写法：**

```java
List<String> source = new ArrayList<>();
source.add("确认需求");
List<String> published = Collections.unmodifiableList(new ArrayList<>(source));
source.add("实现接口");
System.out.println(published);
```

**影响版本：** JDK 25 与 Java 8 都受影响。

**验证方式：** 错误代码输出 `[确认需求, 实现接口]`；正确代码只输出 `[确认需求]`。

### 创建 subList 后结构性修改原列表

**现象：** 创建视图后对原列表调用 `add`，再访问视图时可能抛出 `ConcurrentModificationException`。

**触发条件：** 持有 `subList` 视图期间，绕过视图对原列表执行结构性修改。

**原因：** `subList` 与原列表共享结构；官方合同规定这种修改后的视图语义未定义。

**后果：** 视图不再是可靠结果，后续读取、替换或其他操作可能失败。

**错误示例：**

```java
List<String> tasks = new ArrayList<>(List.of("确认需求", "实现接口", "准备联调"));
List<String> view = tasks.subList(0, 2);
tasks.add("准备演示");
System.out.println(view);
```

**正确写法：**

```java
List<String> tasks = new ArrayList<>(List.of("确认需求", "实现接口", "准备联调"));
List<String> independent = new ArrayList<>(tasks.subList(0, 2));
tasks.add("准备演示");
System.out.println(independent);
```

**影响版本：** JDK 25 与 Java 8 都受影响；Java 8 初始化时改用 `Arrays.asList`。

**验证方式：** 在 `ArrayList` 上运行错误代码可观察到视图访问失败；正确代码稳定输出 `[确认需求, 实现接口]`。
:::

## 七、完整的 TeamFlow List 程序

### 1. JDK 25 版本

在 JDK 25 普通 Java 项目中创建 `TeamFlowListApplication.java`。这个程序用 `ArrayList` 维护草稿任务，
使用索引插入和替换，再用 `List.copyOf` 发布不受草稿后续新增影响的列表副本。

```java
import java.util.ArrayList;
import java.util.List;

/** 串联 TeamFlow 任务列表的创建、修改、读取和发布。 */
public class TeamFlowListApplication {
    /**
     * 启动 TeamFlow 列表示例。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        List<String> pendingTasks = new ArrayList<>(
                List.of("设计首页", "配置测试环境", "准备联调")
        );

        pendingTasks.add(0, "确认需求");
        String replacedTask = pendingTasks.set(1, "编写登录接口");
        pendingTasks.add("编写测试");

        List<String> publishedTasks = List.copyOf(pendingTasks);
        pendingTasks.add("准备演示");

        System.out.println("待办数量：" + pendingTasks.size());
        System.out.println("下一个任务：" + pendingTasks.get(1));
        System.out.println("替换前：" + replacedTask);
        System.out.println("发布快照：" + publishedTasks);
        System.out.println("当前草稿：" + pendingTasks);
    }
}
```

运行步骤：

1. 在 IntelliJ IDEA 的 Project Structure 中确认 Project SDK 是 JDK 25。
2. 打开 `TeamFlowListApplication.java`，确认文件名与 public 类名一致。
3. 点击 `main` 左侧运行图标，选择 Run 'TeamFlowListApplication.main()'。
4. 在 Run 控制台核对下面五行输出；若输出来自其他类，先停止并重新选择当前类。

预期输出：

```text
待办数量：6
下一个任务：编写登录接口
替换前：设计首页
发布快照：[确认需求, 编写登录接口, 配置测试环境, 准备联调, 编写测试]
当前草稿：[确认需求, 编写登录接口, 配置测试环境, 准备联调, 编写测试, 准备演示]
```

执行顺序决定每一行结果。初始列表有三项，在索引 `0` 插入后变为四项；`set(1, ...)` 只替换
“设计首页”，所以数量不变；两次尾部新增让草稿最终有六项。`publishedTasks` 在第二次新增之前完成复制，
因此发布快照只有五项。

### 2. Java 8 版本

在 Java 8 项目中创建同名文件。Project SDK 选择已安装的 JDK 8；如果项目还设置了模块 SDK 或语言级别，
也要确认它们指向 8。Java 8 没有 `List.of` 与 `List.copyOf`，因此使用 `Arrays.asList` 提供初始元素，再
复制进可增长的 `ArrayList`；发布时先复制，再用 `Collections.unmodifiableList` 包装。

```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/** 串联 Java 8 中 TeamFlow 任务列表的创建、修改、读取和发布。 */
public class TeamFlowListApplication {
    /**
     * 启动 Java 8 的 TeamFlow 列表示例。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        List<String> pendingTasks = new ArrayList<>(
                Arrays.asList("设计首页", "配置测试环境", "准备联调")
        );

        pendingTasks.add(0, "确认需求");
        String replacedTask = pendingTasks.set(1, "编写登录接口");
        pendingTasks.add("编写测试");

        List<String> publishedTasks = Collections.unmodifiableList(
                new ArrayList<>(pendingTasks)
        );
        pendingTasks.add("准备演示");

        System.out.println("待办数量：" + pendingTasks.size());
        System.out.println("下一个任务：" + pendingTasks.get(1));
        System.out.println("替换前：" + replacedTask);
        System.out.println("发布快照：" + publishedTasks);
        System.out.println("当前草稿：" + pendingTasks);
    }
}
```

运行步骤：

1. 在 IntelliJ IDEA 的 Project Structure 中把 Project SDK 和当前模块 SDK 设为 JDK 8。
2. 确认代码没有 `List.of`、`List.copyOf` 或其他 Java 8 不存在的 API。
3. 点击 `main` 左侧运行图标并运行当前类。
4. 在 Run 控制台核对输出；结果应与 JDK 25 版本逐行相同。

预期输出：

```text
待办数量：6
下一个任务：编写登录接口
替换前：设计首页
发布快照：[确认需求, 编写登录接口, 配置测试环境, 准备联调, 编写测试]
当前草稿：[确认需求, 编写登录接口, 配置测试环境, 准备联调, 编写测试, 准备演示]
```

两版的 `List`、`ArrayList`、索引操作和输出合同相同。差异只在创建少量元素和发布不可修改副本的 API：
JDK 25 直接使用 `List.of`、`List.copyOf`，Java 8 使用 `Arrays.asList`、复制和
`Collections.unmodifiableList` 组合出本示例需要的行为。

## 八、独立练习

### 1. 编写迭代计划列表

请创建一个列表，初始依次包含“需求评审”“接口开发”“前后端联调”。然后完成以下变化：

1. 在列表开头插入“创建迭代”。
2. 把“需求评审”替换为“确认验收标准”，并保存被替换的旧值。
3. 在末尾加入“发布复盘”。
4. 在发布副本创建后，再给草稿列表加入“整理文档”。
5. 输出旧值、第二项、草稿数量、发布副本和当前草稿。

:::exercise
### TeamFlow 迭代计划

**要求：** 只能使用本课已经讲过的 `List`、`ArrayList`、索引操作和不可修改副本；发布副本必须与草稿后续新增隔离。JDK 25 使用 `List.of` 与 `List.copyOf`；Java 8 使用完整的兼容写法，不得直接修改 `Arrays.asList` 返回值。

**验收：** 两个版本都能独立编译运行，控制台逐行输出“替换前：需求评审”“第二项：确认验收标准”“草稿数量：6”“发布计划：[创建迭代, 确认验收标准, 接口开发, 前后端联调, 发布复盘]”和“当前草稿：[创建迭代, 确认验收标准, 接口开发, 前后端联调, 发布复盘, 整理文档]”。
:::

### 2. JDK 25 参考实现

```java
import java.util.ArrayList;
import java.util.List;

/** 完成 TeamFlow 迭代计划列表练习。 */
public class TeamFlowIterationPlan {
    /**
     * 创建、调整并发布迭代计划。
     *
     * @param args 启动参数，本练习不使用
     */
    public static void main(String[] args) {
        List<String> draftPlan = new ArrayList<>(
                List.of("需求评审", "接口开发", "前后端联调")
        );

        draftPlan.add(0, "创建迭代");
        String replacedTask = draftPlan.set(1, "确认验收标准");
        draftPlan.add("发布复盘");

        List<String> publishedPlan = List.copyOf(draftPlan);
        draftPlan.add("整理文档");

        System.out.println("替换前：" + replacedTask);
        System.out.println("第二项：" + draftPlan.get(1));
        System.out.println("草稿数量：" + draftPlan.size());
        System.out.println("发布计划：" + publishedPlan);
        System.out.println("当前草稿：" + draftPlan);
    }
}
```

### 3. Java 8 参考实现

```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/** 完成 Java 8 的 TeamFlow 迭代计划列表练习。 */
public class TeamFlowIterationPlan {
    /**
     * 创建、调整并发布 Java 8 迭代计划。
     *
     * @param args 启动参数，本练习不使用
     */
    public static void main(String[] args) {
        List<String> draftPlan = new ArrayList<>(
                Arrays.asList("需求评审", "接口开发", "前后端联调")
        );

        draftPlan.add(0, "创建迭代");
        String replacedTask = draftPlan.set(1, "确认验收标准");
        draftPlan.add("发布复盘");

        List<String> publishedPlan = Collections.unmodifiableList(
                new ArrayList<>(draftPlan)
        );
        draftPlan.add("整理文档");

        System.out.println("替换前：" + replacedTask);
        System.out.println("第二项：" + draftPlan.get(1));
        System.out.println("草稿数量：" + draftPlan.size());
        System.out.println("发布计划：" + publishedPlan);
        System.out.println("当前草稿：" + draftPlan);
    }
}
```

两个参考实现的预期输出完全相同：

```text
替换前：需求评审
第二项：确认验收标准
草稿数量：6
发布计划：[创建迭代, 确认验收标准, 接口开发, 前后端联调, 发布复盘]
当前草稿：[创建迭代, 确认验收标准, 接口开发, 前后端联调, 发布复盘, 整理文档]
```

逐步核对时，先确认三项初始数据；开头插入后“需求评审”移动到索引 `1`，所以 `set(1, ...)` 返回它；
发布前共有五项，发布后只给草稿增加“整理文档”，因此草稿数量是六，而发布副本仍保持五项。

## 九、把 List 用在明确的数据语义上

当数据需要保留位置顺序并允许重复时，`List` 是清晰的接口选择。先根据业务动作确认需要读取、替换、
插入还是删除，再按照对应索引边界调用 API；普通列表优先从 `ArrayList` 开始，不用 `LinkedList` 的名字
替代真实访问分析。

向外提供数据时，还要说清它是可变列表、固定大小列表、共享底层数据的只读视图，还是与原结构隔离的
不可修改副本。JDK 25 和 Java 8 都能表达这些边界，但使用的工厂和组合方式不同。能够解释这份列表的
顺序、可变性和所有权，比只记住一组方法名更重要。
