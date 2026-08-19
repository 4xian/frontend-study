---
id: backend.java.learn.basics.collection-iteration-and-safe-removal
type: lesson
title: 集合遍历与安全删除
summary: 遍历 TeamFlow 的 List、Set 和 Map，并在遍历过程中使用 Iterator 或 removeIf 安全删除匹配元素
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 105
prerequisites:
  - backend.java.learn.basics.maps-and-key-value-associations
objectives:
  - 能使用增强 for 逐个读取 List 和 Set，并使用 entrySet 同时读取 Map 的键和值。
  - 能说明 hasNext、next 和 remove 在 Iterator 遍历中的分工与调用顺序。
  - 能使用当前 Iterator 删除最近一次 next 返回的元素。
  - 能在可修改集合上使用 removeIf 完成简洁的条件删除。
  - 能解释直接修改原集合、正向索引删除和重复调用 remove 的错误结果。
  - 能准确说明 fail-fast 只是尽力检测错误，不能作为程序正确性的保证。
  - 能在 JDK 25 与 Java 8 中分别运行完整的 TeamFlow 集合清理程序。
recap:
  - 增强 for 适合逐个读取元素；遍历 Map 的键值对时使用 entrySet。
  - hasNext 只检查是否还有元素，next 才推进位置并返回元素。
  - Iterator.remove 删除最近一次 next 返回的元素，每次 next 后最多调用一次。
  - 遍历期间需要删除当前元素时，应使用当前 Iterator 的 remove，而不是直接修改原集合。
  - removeIf 从 Java 8 起就可用，返回值表示集合是否真的发生了删除。
  - 正向索引删除会让后续元素左移，连续匹配时可能静默跳项。
  - fail-fast 只能尽力暴露错误，单线程也可能触发 ConcurrentModificationException。
related: []
tags:
  - Java
  - 集合遍历
  - Iterator
  - removeIf
  - Map entrySet
  - TeamFlow
appliesTo: JDK 25 与 Java 8；本课采用的增强 for、Iterator、entrySet 和 removeIf 在两版中的合同一致
verifiedAt: 2026-08-17
sources:
  - id: jls-25-enhanced-for
    title: Java Language Specification 25 - The enhanced for statement
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.14.2
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 增强 for 遍历 Iterable 时使用 Iterator 的 hasNext 与 next 逐个取得元素
  - id: java-25-iterator
    title: Java SE 25 API - Iterator
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Iterator.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - hasNext、next 与 remove 的职责
      - remove 删除最近一次 next 返回的元素且每次 next 后最多调用一次
      - 不支持删除、调用时序错误和绕过迭代器修改集合的边界
  - id: java-25-collection
    title: Java SE 25 API - Collection
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Collection.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - removeIf 删除所有满足条件的元素并返回集合是否改变
      - removeIf 默认通过 Iterator.remove 完成删除且从 Java 8 起提供
  - id: java-25-map
    title: Java SE 25 API - Map
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - keySet、values 和 entrySet 是由 Map 支撑的集合视图
      - entrySet 迭代器的 remove 会删除原 Map 中对应的映射
  - id: java-25-concurrent-modification-exception
    title: Java SE 25 API - ConcurrentModificationException
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ConcurrentModificationException.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - 单线程违反迭代合同也可能触发 ConcurrentModificationException
      - fail-fast 只能尽力检测错误，不能作为程序正确性的保证
  - id: jls-8-enhanced-for
    title: Java Language Specification 8 - The enhanced for statement
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html#jls-14.14.2
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 增强 for 对 Iterable 使用与本课相同的迭代器语义
  - id: java-8-iterator
    title: Java SE 8 API - Iterator
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Iterator.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 的 hasNext、next、remove、调用时序和可选删除合同与本课 JDK 25 写法一致
  - id: java-8-collection
    title: Java SE 8 API - Collection
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Collection.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 已提供 removeIf 且返回值与默认删除行为和本课示例一致
  - id: java-8-map
    title: Java SE 8 API - Map
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Map.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 已提供 keySet、values、entrySet 及由 Map 支撑的视图合同
  - id: stackoverflow-remove-while-iterating
    title: Removing objects from a collection in a loop without causing ConcurrentModificationException
    url: https://stackoverflow.com/questions/223918/removing-objects-from-a-collection-in-a-loop-without-causing-concurrentmodificat
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 与 JDK 25；技术合同已与 Oracle Iterator API 和双版本探针核验
    claims:
      - 增强 for 中直接调用原集合 remove 是反复出现的真实误用
  - id: stackoverflow-forward-index-removal
    title: Delete data from ArrayList with a for-loop
    url: https://stackoverflow.com/questions/10738634/delete-data-from-arraylist-with-a-for-loop
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 与 JDK 25；相邻元素左移和残留结果已由双版本探针核验
    claims:
      - 正向索引删除连续匹配元素会静默跳过左移后的元素
  - id: stackoverflow-double-iterator-remove
    title: Java Iterator remove throws IllegalStateException
    url: https://stackoverflow.com/questions/60017952/java-iterator-remove-throws-illegalstateexception
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 与 JDK 25；调用合同已与 Oracle Iterator API 和双版本探针核验
    claims:
      - 嵌套条件可能让同一次 next 对应两次 remove 并触发 IllegalStateException
---

# 集合遍历与安全删除

TeamFlow 已经能用 `List` 保存有顺序的任务、用 `Set` 保存不重复的成员、用 `Map` 关联任务编号与状态。
数据真正进入业务流程后，还要逐项读取：展示待办、通知成员、输出任务编号和状态。只读取时，增强 `for`
足够直接；如果遍历过程中还要删除当前元素，就需要显式掌握迭代器的状态。

本课只解决“怎样逐个读取集合，以及怎样在遍历期间安全删除匹配元素”。Lambda 的语法体系、Stream、排序、
并发集合与下一课的任务查询实战都留在后续课程。

## 一、先把集合逐项读出来

### 1. 用增强 for 读取 List 和 Set

增强 `for` 的固定结构是 `for (元素类型 变量 : 可遍历对象)`。冒号右侧提供一组元素；每轮循环把下一个
元素交给左侧变量。下面先按 List 的位置顺序打印任务，再读取 Set 中不重复的评审人：

```java
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/** 演示 List 与 Set 的只读遍历。 */
public class CollectionReadDemo {
    /**
     * 创建两种集合并逐项输出。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        List<String> tasks = new ArrayList<>();
        tasks.add("确认需求");
        tasks.add("实现接口");

        Set<String> reviewers = new LinkedHashSet<>();
        reviewers.add("小林");
        reviewers.add("小周");

        for (String task : tasks) {
            System.out.println("任务：" + task);
        }

        for (String reviewer : reviewers) {
            System.out.println("评审人：" + reviewer);
        }
    }
}
```

预期输出为：

```text
任务：确认需求
任务：实现接口
评审人：小林
评审人：小周
```

List 的迭代器按列表顺序取值，因此两个任务保持加入顺序。本例特意使用 `LinkedHashSet`，所以评审人也按
插入顺序出现；不能把这个结果推广为所有 Set 都承诺相同顺序。循环只读取元素，没有改变集合结构。

### 2. 用 entrySet 同时读取 Map 的键和值

`Map` 不是 `Iterable`，不能直接放在增强 `for` 的冒号右侧。它提供三种集合视图：只需要键时使用
`keySet()`，只需要值时使用 `values()`，同时需要键和值时使用 `entrySet()`。

```java
import java.util.LinkedHashMap;
import java.util.Map;

/** 演示使用 entrySet 读取 Map 的键和值。 */
public class MapEntryReadDemo {
    /**
     * 输出 TeamFlow 任务编号和状态。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        Map<String, String> statusById = new LinkedHashMap<>();
        statusById.put("TF-101", "进行中");
        statusById.put("TF-102", "已完成");

        for (Map.Entry<String, String> entry : statusById.entrySet()) {
            System.out.println(entry.getKey() + " -> " + entry.getValue());
        }
    }
}
```

控制台输出：

```text
TF-101 -> 进行中
TF-102 -> 已完成
```

每个 `Map.Entry` 代表一组键值关系，`getKey()` 读取任务编号，`getValue()` 读取状态。`entrySet()` 不是
复制出来的新数据，它是由原 Map 支撑的集合视图；后面正是通过这个视图的迭代器安全删除映射。

### 3. 增强 for 隐藏了迭代器

按照语言规范，增强 `for` 遍历 `Iterable` 时，效果相当于先取得迭代器，再反复调用 `hasNext()` 与
`next()`。这种写法省去了样板代码，适合逐项读取，却没有把内部迭代器变量暴露给循环体。

这也是安全删除的分界：只读时优先使用增强 `for`；需要删除“当前读到的元素”时，改用显式
`Iterator`，让删除动作和正在推进的迭代状态属于同一个对象。

## 二、用 Iterator 控制遍历状态

### 1. hasNext 只检查，next 才推进

调用集合的 `iterator()` 会得到一个 `Iterator<E>`。它开始时位于第一个元素之前，循环的固定顺序是：

1. `hasNext()` 检查是否还有元素，不移动位置。
2. `next()` 向前推进，并返回这次到达的元素。
3. 处理当前元素，然后回到下一轮检查。

```java
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/** 演示 Iterator 的检查与推进顺序。 */
public class IteratorReadDemo {
    /**
     * 使用显式迭代器读取任务。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        List<String> tasks = new ArrayList<>();
        tasks.add("确认需求");
        tasks.add("实现接口");

        Iterator<String> iterator = tasks.iterator();
        while (iterator.hasNext()) {
            String task = iterator.next();
            System.out.println("当前任务：" + task);
        }
    }
}
```

输出两行任务后，`hasNext()` 返回 `false`，循环结束。先检查再取值，避免在没有下一个元素时调用
`next()`；异常分类属于后续课程，本课只固定这套正确遍历骨架。

### 2. remove 删除最近一次 next 返回的元素

`Iterator.remove()` 不接收参数。它只删除最近一次由同一个迭代器的 `next()` 返回的元素，因此删除动作
与当前遍历位置保持同步。

```java
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/** 演示使用 Iterator 安全删除当前任务。 */
public class IteratorRemoveDemo {
    /**
     * 删除所有已取消任务状态。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        List<String> statuses = new ArrayList<>();
        statuses.add("待处理");
        statuses.add("已取消");
        statuses.add("处理中");
        statuses.add("已取消");

        Iterator<String> iterator = statuses.iterator();
        while (iterator.hasNext()) {
            String status = iterator.next();
            if ("已取消".equals(status)) {
                iterator.remove();
            }
        }

        System.out.println("清理后：" + statuses);
    }
}
```

预期输出为 `清理后：[待处理, 处理中]`。两个“已取消”元素都由当前迭代器删除；集合缩短后，迭代器仍
知道下一次应该从哪里继续。每次 `next()` 后最多调用一次 `remove()`，下一轮必须再次调用 `next()` 才能
删除另一个元素。

### 3. entrySet 的迭代器可以删除原 Map 映射

Map 的安全删除也遵循同一条规则，只是迭代对象换成 `entrySet()` 返回的键值项视图：

```java
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;

/** 演示遍历 Map 时安全删除当前映射。 */
public class MapIteratorRemoveDemo {
    /**
     * 删除状态为已取消的任务映射。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        Map<String, String> statusById = new LinkedHashMap<>();
        statusById.put("TF-101", "进行中");
        statusById.put("TF-102", "已取消");
        statusById.put("TF-103", "待处理");

        Iterator<Map.Entry<String, String>> iterator = statusById.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, String> entry = iterator.next();
            if ("已取消".equals(entry.getValue())) {
                iterator.remove();
            }
        }

        System.out.println("清理后：" + statusById);
    }
}
```

输出为 `清理后：{TF-101=进行中, TF-103=待处理}`。`entrySet()` 由 `statusById` 支撑，所以从它的迭代器
删除当前 entry，会同步删除原 Map 中的 `TF-102` 映射。循环中不能改用 `statusById.remove(...)`，那会
绕开正在工作的迭代器。

## 三、根据删除意图选择写法

### 1. removeIf 适合直接表达删除条件

如果操作只有“删除所有满足条件的元素”，`removeIf` 比显式迭代器更短。它从 Java 8 起就存在，接收一个
判断条件，删除所有让条件得到 `true` 的元素，并返回集合是否发生了变化。

```java
import java.util.ArrayList;
import java.util.List;

/** 演示使用 removeIf 清理任务状态。 */
public class RemoveIfDemo {
    /**
     * 按固定条件删除已取消状态。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        List<String> statuses = new ArrayList<>();
        statuses.add("待处理");
        statuses.add("已取消");
        statuses.add("处理中");

        boolean changed = statuses.removeIf(status -> "已取消".equals(status));

        System.out.println("发生删除：" + changed);
        System.out.println("清理后：" + statuses);
    }
}
```

预期输出：

```text
发生删除：true
清理后：[待处理, 处理中]
```

这里先把 `status -> "已取消".equals(status)` 作为“当前状态是否应删除”的固定条件来读。Lambda 的组成、
函数式接口和更多组合方式会在后续课程单独学习。本例集合可修改，所以 `removeIf` 能完成结构删除；它的
默认实现仍会使用迭代器的 `remove()`，不能因此绕过集合本身的可修改边界。

### 2. 三种写法解决不同问题

| 目标 | 合适写法 | 原因 |
| --- | --- | --- |
| 逐项读取 List 或 Set | 增强 `for` | 语义直接，不需要手动维护迭代器 |
| 同时读取 Map 的键和值 | 增强 `for` + `entrySet()` | 一次取得同一条映射的键和值 |
| 遍历时根据多步逻辑删除当前元素 | 显式 `Iterator` | 可以在处理当前元素后调用同一迭代器的 `remove()` |
| 只需删除所有满足条件的元素 | `removeIf` | 直接表达删除条件，并返回集合是否改变 |

正向索引循环看起来也能删除 List 元素，但删除会让后面的元素立即左移。只要连续两个元素都匹配，循环仍把
索引加一，就可能跳过刚移动过来的元素。本课统一使用 Iterator 或 `removeIf`，避免把索引移动当成删除策略。

### 3. Java 8 与 JDK 25 不需要分叉

增强 `for`、`Iterator.hasNext()`、`next()`、`remove()`、`Map.entrySet()` 和 `Collection.removeIf()` 在
Java 8 已经存在，本课采用的合同与 JDK 25 一致。后面的两个完整版本都使用显式类型、可修改集合和传统
入口方法；即使代码结构相同，也分别给出完整代码，便于在两个 Project SDK 下独立运行。

## 四、易错点

**社区补充：** 社区问答中反复出现三种真实症状：增强 `for` 中直接删除会触发
`ConcurrentModificationException`，正向索引删除会静默残留元素，同一次 `next()` 后重复删除会触发
`IllegalStateException`。这些线索已用同一份探针在 JDK 25 与 Java 8 中复现，具体规则仍以官方 Iterator
和 Collection 合同为准。

六个典型错误

:::pitfalls
### 增强 for 中直接修改原 List

**现象：** 本例 ArrayList 在循环继续时抛出 `ConcurrentModificationException`，清理没有正常完成。

**触发条件：** 增强 `for` 正在使用内部迭代器，却在循环体中调用原 List 的 `remove()`。

**原因：** 结构变化绕开了当前迭代器。常见 fail-fast 实现会尽力发现这种错误，但不保证所有集合和所有
时机都抛出异常。

**后果：** 循环可能提前结束或产生不可靠结果；不能靠捕获异常来完成删除。

**错误示例：**

```java
List<String> statuses = new ArrayList<>();
statuses.add("已取消");
statuses.add("处理中");
statuses.add("待处理");

for (String status : statuses) {
    if ("已取消".equals(status)) {
        statuses.remove(status);
    }
}
```

**正确写法：**

```java
Iterator<String> iterator = statuses.iterator();
while (iterator.hasNext()) {
    String status = iterator.next();
    if ("已取消".equals(status)) {
        iterator.remove();
    }
}
System.out.println(statuses);
```

**影响版本：** JDK 25 与 Java 8 都适用；CME 的 best-effort 限定也相同。

**验证方式：** 该输入的错误示例在 Temurin 25 和 8u492 都复现
`ConcurrentModificationException`；正确示例稳定输出 `[处理中, 待处理]`。只把异常结果描述为本例复现，
不推广为通用保证。

### 正向索引删除连续匹配项

**现象：** 两个相邻的“已取消”只删除了一个，循环没有报错。

**触发条件：** 索引从小到大递增，并在当前索引直接删除元素。

**原因：** 删除第一个元素后，第二个元素左移到相同索引；循环末尾又把索引加一，因此跳过它。

**后果：** 清理结果静默残留，后续业务仍会处理本应删除的任务。

**错误示例：**

```java
List<String> statuses = new ArrayList<>();
statuses.add("已取消");
statuses.add("已取消");
statuses.add("处理中");

for (int index = 0; index < statuses.size(); index++) {
    if ("已取消".equals(statuses.get(index))) {
        statuses.remove(index);
    }
}
System.out.println(statuses);
```

**正确写法：**

```java
Iterator<String> iterator = statuses.iterator();
while (iterator.hasNext()) {
    if ("已取消".equals(iterator.next())) {
        iterator.remove();
    }
}
System.out.println(statuses);
```

**影响版本：** JDK 25 与 Java 8 的 List 删除都会让后续元素左移。

**验证方式：** 错误示例输出 `[已取消, 处理中]`，正确示例输出 `[处理中]`；两版探针结果一致。

### 在 next 之前或同一次 next 后删除两次

**现象：** `Iterator.remove()` 抛出 `IllegalStateException`。

**触发条件：** 尚未调用 `next()` 就调用 `remove()`，或者一次 `next()` 后连续调用两次 `remove()`。

**原因：** remove 只对应最近一次 next 返回的元素，而且每次 next 最多允许删除一次。

**后果：** 循环中止，后续元素没有继续处理。

**错误示例：**

```java
Iterator<String> iterator = statuses.iterator();
iterator.next();
iterator.remove();
iterator.remove();
```

**正确写法：**

```java
Iterator<String> iterator = statuses.iterator();
while (iterator.hasNext()) {
    String status = iterator.next();
    if ("已取消".equals(status)) {
        iterator.remove();
    }
}
System.out.println(statuses);
```

**影响版本：** JDK 25 与 Java 8 的 Iterator 调用时序相同。

**验证方式：** 同一次 next 后第二次删除在两版都抛出 `IllegalStateException`；正确示例中一次 next 只对应
零次或一次 remove，能够输出最终列表。

### 遍历 entrySet 时调用 Map.remove

**现象：** 本例 LinkedHashMap 在继续迭代时抛出 `ConcurrentModificationException`。

**触发条件：** 已取得 `entrySet()` 的迭代器，却使用原 Map 的 `remove(key)` 删除当前映射。

**原因：** entrySet 是原 Map 的支撑视图，`statusById.remove(...)` 绕开了当前视图迭代器。

**后果：** Map 清理提前终止，剩余映射没有按条件检查。

**错误示例：**

```java
Iterator<Map.Entry<String, String>> iterator = statusById.entrySet().iterator();
while (iterator.hasNext()) {
    Map.Entry<String, String> entry = iterator.next();
    if ("已取消".equals(entry.getValue())) {
        statusById.remove(entry.getKey());
    }
}
```

**正确写法：**

```java
Iterator<Map.Entry<String, String>> iterator = statusById.entrySet().iterator();
while (iterator.hasNext()) {
    Map.Entry<String, String> entry = iterator.next();
    if ("已取消".equals(entry.getValue())) {
        iterator.remove();
    }
}
System.out.println(statusById);
```

**影响版本：** JDK 25 与 Java 8 都应通过当前 entrySet 迭代器删除当前映射。

**验证方式：** 给 Map 放入“进行中、已取消、待处理”三条映射；错误示例在本例 LinkedHashMap 上复现 CME，
正确示例输出只含“进行中、待处理”的两条映射。

### 在不支持结构删除的集合上调用 removeIf

**现象：** 条件首次匹配时抛出 `UnsupportedOperationException`。

**触发条件：** 对 `Arrays.asList(...)` 返回的固定大小列表调用会命中元素的 `removeIf()`。

**原因：** removeIf 的默认实现最终调用迭代器的 remove，而固定大小列表不支持结构删除。

**后果：** 程序无法完成清理；removeIf 并不会把只读或固定大小集合自动变成可修改集合。

**错误示例：**

```java
List<String> statuses = Arrays.asList("待处理", "已取消");
statuses.removeIf(status -> "已取消".equals(status));
```

**正确写法：**

```java
List<String> statuses = new ArrayList<>(Arrays.asList("待处理", "已取消"));
boolean changed = statuses.removeIf(status -> "已取消".equals(status));
System.out.println(changed + ":" + statuses);
```

**影响版本：** JDK 25 与 Java 8 的 Arrays.asList 都是固定大小列表，removeIf 都从 Java 8 起可用。

**验证方式：** 匹配“已取消”时错误示例在两版都抛出 `UnsupportedOperationException`；正确示例输出
`true:[待处理]`。

### 把 Map 直接放进增强 for

**现象：** 编译器拒绝增强 `for`，程序不能运行。

**触发条件：** 误以为 Map 本身也是 Collection 或 Iterable。

**原因：** Map 表示键值关联，不实现 Iterable；它通过 keySet、values 和 entrySet 暴露可遍历视图。

**后果：** 无法编译，也没有机会读取任务编号和状态。

**错误示例：**

```java
for (Map.Entry<String, String> entry : statusById) {
    System.out.println(entry.getKey() + "=" + entry.getValue());
}
```

**正确写法：**

```java
for (Map.Entry<String, String> entry : statusById.entrySet()) {
    System.out.println(entry.getKey() + "=" + entry.getValue());
}
```

**影响版本：** JDK 25 与 Java 8 的 Map 都不实现 Iterable。

**验证方式：** 错误示例在两个编译器中都因增强 for 不适用于 Map 而失败；正确示例逐行输出 Map 中的键和值。
:::

## 五、完整的 TeamFlow 集合清理程序

### 1. JDK 25 版本

下面的程序把本课步骤串起来：先只读遍历任务队列、评审人和状态 Map，再用 Iterator 同步清理队列与状态
映射，最后用 `removeIf` 删除已完成任务的提醒。

```java
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** 在 JDK 25 中完成 TeamFlow 集合遍历与安全清理。 */
public class TeamFlowCollectionCleanup {
    /**
     * 展示任务数据并删除不再需要的元素。
     *
     * @param args 启动参数，本程序不使用
     */
    public static void main(String[] args) {
        List<String> reviewQueue = new ArrayList<>();
        reviewQueue.add("TF-101");
        reviewQueue.add("TF-102");
        reviewQueue.add("TF-103");
        reviewQueue.add("TF-104");

        Set<String> reviewers = new LinkedHashSet<>();
        reviewers.add("小林");
        reviewers.add("小周");

        Map<String, String> statusById = new LinkedHashMap<>();
        statusById.put("TF-101", "进行中");
        statusById.put("TF-102", "已取消");
        statusById.put("TF-103", "待处理");
        statusById.put("TF-104", "已完成");

        List<String> reminders = new ArrayList<>();
        reminders.add("TF-101:补充说明");
        reminders.add("TF-103:确认范围");
        reminders.add("TF-104:完成回顾");

        for (String taskId : reviewQueue) {
            System.out.println("待检查：" + taskId);
        }
        for (String reviewer : reviewers) {
            System.out.println("评审人：" + reviewer);
        }
        for (Map.Entry<String, String> entry : statusById.entrySet()) {
            System.out.println("状态：" + entry.getKey() + "=" + entry.getValue());
        }

        Iterator<String> queueIterator = reviewQueue.iterator();
        while (queueIterator.hasNext()) {
            String taskId = queueIterator.next();
            if ("已取消".equals(statusById.get(taskId))) {
                queueIterator.remove();
                System.out.println("Iterator 删除：" + taskId);
            }
        }

        Iterator<Map.Entry<String, String>> statusIterator = statusById.entrySet().iterator();
        while (statusIterator.hasNext()) {
            Map.Entry<String, String> entry = statusIterator.next();
            if ("已取消".equals(entry.getValue())) {
                statusIterator.remove();
            }
        }

        boolean reminderChanged = reminders.removeIf(
                reminder -> reminder.startsWith("TF-104:")
        );

        System.out.println("提醒已清理：" + reminderChanged);
        System.out.println("最终队列：" + reviewQueue);
        System.out.println("最终状态：" + statusById);
        System.out.println("最终提醒：" + reminders);
    }
}
```

### 2. Java 8 版本

本课 API 在 Java 8 已经齐备。把 IDEA 的 Project SDK 与模块 SDK 设为 Java 8 后，使用下面这份完整代码；
它不依赖 JDK 25 独有语法。

```java
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** 在 Java 8 中完成 TeamFlow 集合遍历与安全清理。 */
public class TeamFlowCollectionCleanupJava8 {
    /**
     * 展示任务数据并删除不再需要的元素。
     *
     * @param args 启动参数，本程序不使用
     */
    public static void main(String[] args) {
        List<String> reviewQueue = new ArrayList<>();
        reviewQueue.add("TF-101");
        reviewQueue.add("TF-102");
        reviewQueue.add("TF-103");
        reviewQueue.add("TF-104");

        Set<String> reviewers = new LinkedHashSet<>();
        reviewers.add("小林");
        reviewers.add("小周");

        Map<String, String> statusById = new LinkedHashMap<>();
        statusById.put("TF-101", "进行中");
        statusById.put("TF-102", "已取消");
        statusById.put("TF-103", "待处理");
        statusById.put("TF-104", "已完成");

        List<String> reminders = new ArrayList<>();
        reminders.add("TF-101:补充说明");
        reminders.add("TF-103:确认范围");
        reminders.add("TF-104:完成回顾");

        for (String taskId : reviewQueue) {
            System.out.println("待检查：" + taskId);
        }
        for (String reviewer : reviewers) {
            System.out.println("评审人：" + reviewer);
        }
        for (Map.Entry<String, String> entry : statusById.entrySet()) {
            System.out.println("状态：" + entry.getKey() + "=" + entry.getValue());
        }

        Iterator<String> queueIterator = reviewQueue.iterator();
        while (queueIterator.hasNext()) {
            String taskId = queueIterator.next();
            if ("已取消".equals(statusById.get(taskId))) {
                queueIterator.remove();
                System.out.println("Iterator 删除：" + taskId);
            }
        }

        Iterator<Map.Entry<String, String>> statusIterator = statusById.entrySet().iterator();
        while (statusIterator.hasNext()) {
            Map.Entry<String, String> entry = statusIterator.next();
            if ("已取消".equals(entry.getValue())) {
                statusIterator.remove();
            }
        }

        boolean reminderChanged = reminders.removeIf(
                reminder -> reminder.startsWith("TF-104:")
        );

        System.out.println("提醒已清理：" + reminderChanged);
        System.out.println("最终队列：" + reviewQueue);
        System.out.println("最终状态：" + statusById);
        System.out.println("最终提醒：" + reminders);
    }
}
```

### 3. 运行结果与执行过程

两个版本的预期输出完全一致：

```text
待检查：TF-101
待检查：TF-102
待检查：TF-103
待检查：TF-104
评审人：小林
评审人：小周
状态：TF-101=进行中
状态：TF-102=已取消
状态：TF-103=待处理
状态：TF-104=已完成
Iterator 删除：TF-102
提醒已清理：true
最终队列：[TF-101, TF-103, TF-104]
最终状态：{TF-101=进行中, TF-103=待处理, TF-104=已完成}
最终提醒：[TF-101:补充说明, TF-103:确认范围]
```

先运行三个增强 `for`，只读取数据，所以集合保持不变。第一个显式迭代器逐个查看队列，通过 Map 查询当前
任务状态，并删除 `TF-102`；第二个迭代器从 `entrySet()` 删除同一条已取消映射。最后 `removeIf` 命中
`TF-104:` 开头的提醒并返回 `true`。每次结构删除都通过当前集合允许的路径完成。

## 六、独立练习

### 1. 清理发布队列

:::exercise
### TeamFlow 发布队列清理

**要求：** 创建按顺序保存 `TF-201`、`TF-202`、`TF-203`、`TF-204` 的可修改 List，并创建对应状态
“待处理、已取消、进行中、已取消”的 LinkedHashMap。先用 `entrySet()` 增强 for 逐行输出初始状态；再用
List 的 Iterator 从发布队列删除两个已取消任务，并逐行输出被移出的编号；最后对 Map 的 `entrySet()` 调用
`removeIf` 删除已取消映射。不得使用 Stream、正向索引删除或在迭代器循环中直接调用 List.remove。

**验收：** JDK 25 与 Java 8 版本都能独立编译运行；初始状态按 TF-201 到 TF-204 输出，随后依次输出
“移出发布队列：TF-202”“移出发布队列：TF-204”“状态发生删除：true”“发布队列：[TF-201, TF-203]”和
“保留状态：{TF-201=待处理, TF-203=进行中}”。
:::

### 2. JDK 25 参考实现

```java
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** 完成 JDK 25 的 TeamFlow 发布队列清理练习。 */
public class TeamFlowReleaseQueueExercise {
    /**
     * 遍历状态并安全删除已取消任务。
     *
     * @param args 启动参数，本练习不使用
     */
    public static void main(String[] args) {
        List<String> releaseQueue = new ArrayList<>();
        releaseQueue.add("TF-201");
        releaseQueue.add("TF-202");
        releaseQueue.add("TF-203");
        releaseQueue.add("TF-204");

        Map<String, String> statusById = new LinkedHashMap<>();
        statusById.put("TF-201", "待处理");
        statusById.put("TF-202", "已取消");
        statusById.put("TF-203", "进行中");
        statusById.put("TF-204", "已取消");

        for (Map.Entry<String, String> entry : statusById.entrySet()) {
            System.out.println("初始状态：" + entry.getKey() + "=" + entry.getValue());
        }

        Iterator<String> queueIterator = releaseQueue.iterator();
        while (queueIterator.hasNext()) {
            String taskId = queueIterator.next();
            if ("已取消".equals(statusById.get(taskId))) {
                queueIterator.remove();
                System.out.println("移出发布队列：" + taskId);
            }
        }

        boolean statusChanged = statusById.entrySet().removeIf(
                entry -> "已取消".equals(entry.getValue())
        );

        System.out.println("状态发生删除：" + statusChanged);
        System.out.println("发布队列：" + releaseQueue);
        System.out.println("保留状态：" + statusById);
    }
}
```

### 3. Java 8 参考实现

```java
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** 完成 Java 8 的 TeamFlow 发布队列清理练习。 */
public class TeamFlowReleaseQueueExerciseJava8 {
    /**
     * 遍历状态并安全删除已取消任务。
     *
     * @param args 启动参数，本练习不使用
     */
    public static void main(String[] args) {
        List<String> releaseQueue = new ArrayList<>();
        releaseQueue.add("TF-201");
        releaseQueue.add("TF-202");
        releaseQueue.add("TF-203");
        releaseQueue.add("TF-204");

        Map<String, String> statusById = new LinkedHashMap<>();
        statusById.put("TF-201", "待处理");
        statusById.put("TF-202", "已取消");
        statusById.put("TF-203", "进行中");
        statusById.put("TF-204", "已取消");

        for (Map.Entry<String, String> entry : statusById.entrySet()) {
            System.out.println("初始状态：" + entry.getKey() + "=" + entry.getValue());
        }

        Iterator<String> queueIterator = releaseQueue.iterator();
        while (queueIterator.hasNext()) {
            String taskId = queueIterator.next();
            if ("已取消".equals(statusById.get(taskId))) {
                queueIterator.remove();
                System.out.println("移出发布队列：" + taskId);
            }
        }

        boolean statusChanged = statusById.entrySet().removeIf(
                entry -> "已取消".equals(entry.getValue())
        );

        System.out.println("状态发生删除：" + statusChanged);
        System.out.println("发布队列：" + releaseQueue);
        System.out.println("保留状态：" + statusById);
    }
}
```

两个参考实现的预期输出相同：

```text
初始状态：TF-201=待处理
初始状态：TF-202=已取消
初始状态：TF-203=进行中
初始状态：TF-204=已取消
移出发布队列：TF-202
移出发布队列：TF-204
状态发生删除：true
发布队列：[TF-201, TF-203]
保留状态：{TF-201=待处理, TF-203=进行中}
```

验收时先确认四条状态完整输出，再确认两个相邻或不相邻的已取消任务都被 Iterator 删除。`entrySet()` 的
`removeIf` 随后删除相同的两条 Map 映射并返回 `true`；最终 List 与 Map 都只保留 `TF-201` 和 `TF-203`。

## 七、把遍历与修改路径对齐

增强 `for` 让只读遍历保持简洁；显式 Iterator 让“当前元素”和“删除当前元素”属于同一份遍历状态；
`removeIf` 则把单一条件删除表达得更直接。安全并不是“这次刚好没有异常”，而是修改方式符合当前集合与
迭代器的合同。下一课会在这些已稳定的遍历能力上组合任务集合查询，本课不提前实现查询流程。
