---
id: backend.java.learn.basics.comparable-and-comparator
type: lesson
title: Comparable 与 Comparator
summary: 为 TeamFlow 任务建立自然顺序和业务场景顺序，写出满足比较合同的稳定排序规则
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 110
prerequisites:
  - backend.java.learn.basics.task-collection-query-project
objectives:
  - 能解释 Comparable 的自然顺序和 Comparator 的场景顺序各自放在哪里。
  - 能根据比较结果的负数、0、正数读懂先后关系，并写出反对称、传递的比较规则。
  - 能使用多字段比较和稳定唯一的 tie-breaker 建立可复现顺序。
  - 能使用 Integer.compare 避免用数值相减比较时的整数溢出。
  - 能说明 List 排序的稳定性与 TreeSet 将比较结果 0 视为同一排序位置的区别。
  - 能识别比较器漏掉相等情况、忽略唯一字段、修改排序字段等常见错误。
  - 能分别运行 JDK 25 与 Java 8 的完整 TeamFlow 排序程序和练习参考实现。
recap:
  - Comparable 把类型的长期默认顺序写进类的 compareTo，Comparator 在调用处表达某个业务场景的顺序。
  - 比较方法只需要返回负数、0 或正数来表达小于、相等或大于，不要求返回值恰好是 -1、0、1。
  - 主排序字段相同时追加稳定且唯一的 tie-breaker，才能让同一批任务得到可复现的精确顺序。
  - 数值比较使用 Integer.compare 或 Long.compare，不用 left - right 冒险制造溢出。
  - List.sort 对比较为 0 的元素保持原有先后；TreeSet 则把比较为 0 的元素当成同一排序位置。
  - 排序规则和 equals 应尽量一致；放入 TreeSet 的对象不要再改变参与排序的字段。
related: []
tags:
  - Java
  - Comparable
  - Comparator
  - List.sort
  - TreeSet
  - 稳定排序
  - TeamFlow
appliesTo: JDK 25 主线；Comparable、Comparator、List.sort 与 Integer.compare 在 Java 8 也可使用
verifiedAt: 2026-08-17
sources:
  - id: java-25-comparable
    title: Java SE 25 API - Comparable
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Comparable.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - compareTo 返回负数、0 或正数表达小于、相等或大于
      - 自然顺序必须满足反对称、传递和零值关系合同
      - 自然顺序通常应与 equals 一致
  - id: java-8-comparable
    title: Java SE 8 API - Comparable
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/Comparable.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 使用相同的 compareTo 合同和自然顺序语义
  - id: java-25-comparator
    title: Java SE 25 API - Comparator
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Comparator.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - compare 返回负数、0 或正数，并要求比较关系满足合同
      - Comparator 可以把与类型无关的场景顺序放在调用处
      - compare 为 0 的关系应清楚说明是否与 equals 一致
  - id: java-8-comparator
    title: Java SE 8 API - Comparator
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 已提供 Comparator、thenComparing、reversed 和 comparingInt 等核心能力
      - Java 8 的比较合同与 JDK 25 相同
  - id: java-25-list-sort
    title: Java SE 25 API - List.sort
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#sort(java.util.Comparator)
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - List.sort 是稳定排序，并且列表迭代器必须支持 set 操作以写回结果
      - 传入 null 时使用元素的自然顺序
  - id: java-8-list-sort
    title: Java SE 8 API - List.sort
    url: https://docs.oracle.com/javase/8/docs/api/java/util/List.html#sort(java.util.Comparator)
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 已提供稳定的 List.sort 和自然顺序回退
  - id: java-25-collections-sort
    title: Java SE 25 API - Collections.sort
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Collections.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - Collections.sort 提供自然顺序和 Comparator 重载，并保持稳定排序
  - id: java-8-collections-sort
    title: Java SE 8 API - Collections.sort
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Collections.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 的 Collections.sort 具有相同的稳定排序，列表迭代器必须支持 set 操作
  - id: java-25-tree-set
    title: Java SE 25 API - TreeSet
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/TreeSet.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - TreeSet 通过 compareTo 或 Comparator 的 compare 判断元素位置
      - 若排序与 equals 不一致，TreeSet 仍可能违反 Set 的一般合同
  - id: java-8-tree-set
    title: Java SE 8 API - TreeSet
    url: https://docs.oracle.com/javase/8/docs/api/java/util/TreeSet.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 的 TreeSet 也把比较为 0 的元素视为同一排序位置
  - id: java-25-integer-compare
    title: Java SE 25 API - Integer.compare
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Integer.html#compare(int,int)
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - Integer.compare 按两个 int 的数值关系返回比较结果
  - id: java-8-integer-compare
    title: Java SE 8 API - Integer.compare
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/Integer.html#compare(int,int)
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 已提供 Integer.compare，适合替代 int 相减比较
  - id: jls-25-integer-overflow
    title: Java Language Specification 25 - Integer Operations
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.2.2
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 内置整数运算不会以异常方式报告溢出或下溢
  - id: java-tutorial-object-ordering
    title: The Java Tutorials - Object Ordering
    url: https://docs.oracle.com/javase/tutorial/collections/interfaces/order.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java SE 8 及后续兼容实现
    claims:
      - 多字段比较应先比较主要字段，再使用唯一属性解决相等情况
      - 与 equals 不一致的 Comparator 用于 TreeSet 时可能忽略后加入的元素
  - id: stackoverflow-comparison-contract-zero
    title: Stack Overflow - Comparison method violates its general contract
    url: https://stackoverflow.com/questions/8327514/comparison-method-violates-its-general-contract
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 与 JDK 25；正文错误示例已在两个版本中复现
    claims:
      - 比较器分支必须允许真正相等的输入返回 0，不能用大于等于后仍返回正数
---

# Comparable 与 Comparator

TeamFlow 的任务列表已经能够保存和查询，但“按什么顺序展示”仍然是一个需要明确回答的问题。任务编号适合
作为默认顺序，发布看板又可能更关心优先级、标题和编号。把这些规则写成一次性的交换逻辑，下一次换一个页面
就容易复制出不一致的结果。本课把顺序写成 Java 能检查和复用的比较合同，并在后面的任务集合中观察这个合同
怎样影响排序和去重。

本课只使用已经学过的类、集合、枚举和方法。比较器的 Lambda、Stream、日期、金额、数据库和 Spring Boot
会在各自课程中展开；这里使用普通类和匿名比较器，让注意力集中在“两个对象如何比较”。

## 一、先把“先后”说成比较结果

### 1. 负数、0 和正数表达三种关系

`compareTo` 和 `compare` 的返回值不是要显示给用户的分数，而是一个方向信号：负数表示左边排在右边前面，
0 表示当前规则无法区分两者，正数表示左边排在右边后面。返回 `-7` 和返回 `-1` 在排序方向上没有区别，
因此不要依赖某个具体数值。

```java
int first = "TF-101".compareTo("TF-202");
int same = "TF-101".compareTo("TF-101");
int last = "TF-202".compareTo("TF-101");

System.out.println(first < 0);
System.out.println(same == 0);
System.out.println(last > 0);
```

预期输出是三个 `true`。`String` 已经提供自然顺序，所以这里可以直接观察比较结果；自定义任务只需要遵守
同一个方向约定。

### 2. 比较规则必须能重复回答同一个问题

一个可用的比较规则至少要满足三个直观检查：如果把左右对象交换，结果方向应交换；如果 A 在 B 前、B 在 C
前，A 也应在 C 前；如果规则说 A 与 B 相等，那么把它们分别与第三个对象比较时，方向不能突然不同。官方 API
把它们称为反对称、传递和零值关系。学习者暂时不需要计算公式，只要用成对数据和三项数据检查这些现象即可。

```java
int ab = Integer.compare(2, 5);
int ba = Integer.compare(5, 2);
int bc = Integer.compare(5, 8);
int ac = Integer.compare(2, 8);

System.out.println(ab < 0 && ba > 0);
System.out.println(ab < 0 && bc < 0 && ac < 0);
```

输出为两个 `true`。`Integer.compare` 直接按数值关系返回结果，不把两个数先相减，因此可以安全地处理整个
`int` 范围。

### 3. 排序会改变 List 的元素位置

`List.sort` 在原列表上重新排列元素；它不是复制方法。排序要求列表迭代器允许通过 `set` 把结果写回原位置，
不要求列表一定能够增删元素。排序是稳定的：比较结果为 0 的元素不会被交换。稳定不等于“自动产生唯一顺序”，
同值元素的先后仍然取决于排序前的输入顺序。

```java
List<String> ids = new ArrayList<String>();
ids.add("TF-202");
ids.add("TF-101");
ids.sort(null);
System.out.println(ids);
```

预期输出为 `[TF-101, TF-202]`。传入 `null` 表示使用元素的自然顺序；如果列表不允许替换当前位置的元素，
排序会因不能写回结果而失败，所以要先创建允许写回的副本。

## 二、用 Comparable 定义类型的自然顺序

### 1. 只有一个长期默认顺序时实现 Comparable

`Comparable<T>` 是类型自身实现的接口，核心方法是 `compareTo(T other)`。它适合“无论在哪个调用处，都希望
默认按同一种方式排序”的顺序，例如 TeamFlow 任务按编号、标题和优先级组成的稳定自然顺序。

```java
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public final class TaskKey implements Comparable<TaskKey> {
    private final String value;

    /** 创建一个任务编号值。 */
    public TaskKey(String value) {
        this.value = Objects.requireNonNull(value, "value");
    }

    /** 返回任务编号文本。 */
    public String getValue() {
        return value;
    }

    /** 按任务编号的字符串自然顺序比较两个编号。 */
    @Override
    public int compareTo(TaskKey other) {
        return value.compareTo(other.value);
    }

    /** 演示 List.sort(null) 使用 Comparable 的自然顺序。 */
    public static void main(String[] args) {
        List<TaskKey> keys = new ArrayList<TaskKey>();
        keys.add(new TaskKey("TF-202"));
        keys.add(new TaskKey("TF-101"));
        keys.sort(null);
        System.out.println(keys.get(0).getValue());
    }
}
```

这个类的 `compareTo` 只负责编号顺序，`main` 把 `null` 传给 `List.sort`，所以排序器会回到自然顺序。输出
`TF-101`，说明类型自身提供的规则被调用了。示例省略了 `toString`，因此通过 getter 观察结果，不把打印格式
混进比较合同。

### 2. 多个字段要按重要性逐个比较

实际任务往往不只有一个字段。写自然顺序时，先比较最重要的字段；如果结果不是 0，立即返回；只有相等才
进入下一个字段。最后一个字段应当能区分仍需共存的任务。下面的 `Task` 使用编号、标题、优先级三层顺序，
并让 `equals`、`hashCode` 包含同一组字段，因此 `compareTo` 返回 0 时正好表示两个任务值相同。

```java
import java.util.Objects;

public final class Task implements Comparable<Task> {
    private final String id;
    private final String title;
    private final int priority;

    /** 创建一个用于排序的任务值。 */
    public Task(String id, String title, int priority) {
        this.id = Objects.requireNonNull(id, "id");
        this.title = Objects.requireNonNull(title, "title");
        this.priority = priority;
    }

    /** 返回任务编号。 */
    public String getId() {
        return id;
    }

    /** 返回任务标题。 */
    public String getTitle() {
        return title;
    }

    /** 返回任务优先级数值。 */
    public int getPriority() {
        return priority;
    }

    /** 按编号、标题、优先级定义稳定自然顺序。 */
    @Override
    public int compareTo(Task other) {
        int byId = id.compareTo(other.id);
        if (byId != 0) {
            return byId;
        }
        int byTitle = title.compareTo(other.title);
        if (byTitle != 0) {
            return byTitle;
        }
        return Integer.compare(priority, other.priority);
    }

    /** 按任务的三个值判断相等。 */
    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof Task)) {
            return false;
        }
        Task task = (Task) other;
        return priority == task.priority && id.equals(task.id) && title.equals(task.title);
    }

    /** 根据参与相等判断的字段生成哈希值。 */
    @Override
    public int hashCode() {
        return Objects.hash(id, title, priority);
    }
}
```

这里使用 `Integer.compare` 比较数值字段。`priority` 相同才返回到前面的字符串比较结果；因此不能把字段顺序
随意打乱，否则得到的就不是同一个自然顺序。

### 3. 使用自然顺序的集合操作

当列表元素实现 `Comparable` 后，可以用 `list.sort(null)` 或 `Collections.sort(list)`。二者都要求元素之间
可以相互比较；如果列表混入不兼容类型，排序时会抛出 `ClassCastException`。本课只使用同一种 `Task`，因此
重点放在顺序本身，不把异常分类提前扩展成排错课程。

```java
List<Task> tasks = new ArrayList<Task>();
tasks.add(new Task("TF-202", "登录", 1));
tasks.add(new Task("TF-101", "需求", 2));
tasks.sort(null);
System.out.println(tasks.get(0).getId());
```

输出 `TF-101`。传入 `null` 不是“不排序”，而是明确选择元素的自然顺序。

## 三、用 Comparator 表达业务场景顺序

### 1. 同一类型存在多种顺序时把规则移到调用处

任务按编号排序适合查找和调试，但看板通常需要“高优先级在前，再按标题，最后按编号”。这不是 `Task` 的唯一
身份，因此不应为了某一个页面改写 `compareTo`。`Comparator<T>` 把两个参数都交给比较规则，类型可以保留
自然顺序，同时在不同场景创建不同的比较器。

```java
import java.util.Comparator;

public final class PriorityThenId implements Comparator<Task> {
    /** 按优先级升序，再按编号升序比较任务。 */
    @Override
    public int compare(Task left, Task right) {
        int byPriority = Integer.compare(left.getPriority(), right.getPriority());
        if (byPriority != 0) {
            return byPriority;
        }
        return left.getId().compareTo(right.getId());
    }
}
```

调用处可以写 `tasks.sort(new PriorityThenId())`。结果会改变列表的当前位置，但不会改变任务对象的字段。
匿名类是 Java 8 和 JDK 25 都能理解的写法；以后学习 Lambda 后，可以把同一条比较规则写得更短，但那不是
本课的前置要求。

### 2. 主要字段相同后必须追加 tie-breaker

如果比较器只比较优先级，同一优先级的任务会返回 0。对 `List` 来说，稳定排序会保留输入时的先后；当输入顺序
来自不同查询或重试时，精确结果也会随之变化。要得到可复现顺序，就继续比较标题，最后比较稳定且唯一的任务
编号。

```java
public final class BoardOrder implements Comparator<Task> {
    /** 按优先级、标题、编号建立 TeamFlow 看板的确定性顺序。 */
    @Override
    public int compare(Task left, Task right) {
        int byPriority = Integer.compare(left.getPriority(), right.getPriority());
        if (byPriority != 0) {
            return byPriority;
        }
        int byTitle = left.getTitle().compareTo(right.getTitle());
        if (byTitle != 0) {
            return byTitle;
        }
        return left.getId().compareTo(right.getId());
    }
}
```

比较顺序是从左到右的词典序：前一个字段非 0 时就决定结果，后面的字段只处理平局。这个规则让两个不同编号
的任务不会因为优先级相同而被合并。

### 3. 逆序时明确整个规则的范围

`Comparator.reversed()` 会把整个比较器的方向反转。若需求是“优先级降序、编号升序”，不能先构造优先级和编号
的完整升序规则，再整体调用 `reversed()`，否则编号也会变成降序。当前阶段使用命名比较器分别实现需要的字段
方向，避免把范围误读成后续函数式写法的细节。

```java
public final class HighPriorityFirst implements Comparator<Task> {
    /** 按优先级降序、编号升序比较任务。 */
    @Override
    public int compare(Task left, Task right) {
        int byPriority = Integer.compare(right.getPriority(), left.getPriority());
        if (byPriority != 0) {
            return byPriority;
        }
        return left.getId().compareTo(right.getId());
    }
}
```

预期是优先级较大的任务先出现，而同优先级仍按编号升序。字段方向写在对应的 `Integer.compare` 参数中，比
事后对整个比较器反转更容易核对。

## 四、排序集合怎样理解比较结果

### 1. List 的稳定性不等于唯一顺序

下面两个任务只按优先级比较。第一次输入顺序是 A、B，第二次输入顺序是 B、A；因为比较结果都是 0，稳定排序
会分别保留两次输入顺序。

```java
public final class PriorityOnly implements Comparator<Task> {
    /** 只按优先级比较任务，用于观察相同键的稳定排序。 */
    @Override
    public int compare(Task left, Task right) {
        return Integer.compare(left.getPriority(), right.getPriority());
    }
}
```

```java
List<Task> first = new ArrayList<Task>();
first.add(new Task("TF-101", "整理需求", 1));
first.add(new Task("TF-202", "修复登录", 1));
first.sort(new PriorityOnly());

List<Task> second = new ArrayList<Task>();
second.add(new Task("TF-202", "修复登录", 1));
second.add(new Task("TF-101", "整理需求", 1));
second.sort(new PriorityOnly());

System.out.println(first.get(0).getId() + "," + first.get(1).getId());
System.out.println(second.get(0).getId() + "," + second.get(1).getId());
```

若 `PriorityOnly` 在相同优先级返回 0，输出分别是 `TF-101,TF-202` 和 `TF-202,TF-101`。这不是排序失效，
而是比较规则没有要求它们进一步区分。需要固定结果时，换用包含编号 tie-breaker 的 `BoardOrder`。

### 2. TreeSet 把 compare 为 0 当成同一元素

`TreeSet` 不能像 `HashSet` 那样先用 `equals` 再排序；它使用自然顺序或构造时传入的 `Comparator` 寻找位置。
如果比较器只看优先级，两个不同编号的任务比较为 0，第二次 `add` 会返回 `false`，集合大小仍为 1。

```java
Set<Task> tasks = new TreeSet<Task>(new PriorityOnly());
tasks.add(new Task("TF-101", "整理需求", 1));
tasks.add(new Task("TF-202", "修复登录", 1));
System.out.println(tasks.size());
```

输出 `1`。若业务要求两个任务都保留，必须使用能区分它们的比较器，例如 `BoardOrder`，或改用不承担排序的
`HashSet` 并另行排序。

### 3. 放入排序集合后不要修改排序字段

`TreeSet` 的内部位置是根据加入时的比较结果决定的。若任务已经加入集合，随后修改标题或优先级，集合不会
自动把它移到新位置，`contains`、`remove` 和遍历结果就可能与直觉不符。本课的完整程序使用 final 字段，
业务数据需要变化时创建新任务并走新的写入路径，避免把排序键做成可变状态。

## 五、为比较器保留可检查的合同

### 1. 交换、传递和相等三项检查

编写比较器时可以按下面顺序自检：

（1）交换同一对对象，正负方向必须相反；两边都是同值时都应为 0。

（2）选择 A、B、C，如果 A 小于 B 且 B 小于 C，A 也必须小于 C；不要让字段优先级互相打架。

（3）如果 A 与 B 比较为 0，它们分别与 C 比较时方向也应相同；否则排序算法或排序集合无法稳定工作。

这三点不是测试框架的额外要求，而是 `Comparable` 和 `Comparator` API 对比较关系的基本定义。最小验证可以
直接打印布尔表达式，先确认比较器本身，再把它交给 `List.sort` 或 `TreeSet`。

### 2. 不要用相减代替数值比较

`return left - right` 看起来短，但合法的两个 `int` 相减可能越过范围。Java 整数运算不会自动抛出溢出异常，
结果绕回后，比较方向就可能颠倒。使用 `Integer.compare(left, right)` 只检查数值关系，不产生中间差值。

```java
int unsafe = Integer.MIN_VALUE - 1;
int safe = Integer.compare(Integer.MIN_VALUE, 1);
System.out.println(unsafe > 0);
System.out.println(safe < 0);
```

输出是 `true`、`true`：第一行展示了相减后的溢出结果，第二行仍正确判断最小值小于 1。这里不是要记住某
个溢出数字，而是要在比较器中完全避免这种中间运算。

### 3. 本课的版本选择

`Comparable`、`Comparator`、`List.sort`、匿名比较器和 `Integer.compare` 在 Java 8 已经存在，因此本课没有
为了制造差异而改写 API。JDK 25 和 Java 8 两版完整程序使用同一套兼容写法；在 IntelliJ IDEA 中只需为各自
项目选择对应 Project SDK，并让运行配置使用该项目的 JDK。没有真实差异的位置，不需要增加版本分叉。

在终端可以先分别核对工具链：

```text
java -version
javac -version
```

JDK 25 环境的两条输出应以 `25` 开头，Java 8 环境应显示 `1.8.0`。如果终端和 IDEA 显示不同版本，分别检查
IDEA 的 Project SDK、模块 SDK 和运行配置 JRE；不要只根据终端结果推断 IDEA 项目已经切换。

## 六、五个典型错误

**社区补充：** Stack Overflow 的一个可复现案例指出，比较器在相等分支仍返回正数（例如把 `>=` 写进“大于”
判断）会导致“比较方法违反一般合同”。本课把这个错误缩小成最小输入，并在 JDK 25 与 Java 8 中分别运行，
用 `0` 的观察结果核验修复；社区案例只用于发现误区，规则本身以 Java 官方 Comparator 合同为准。

:::pitfalls
### 比较 int 时直接相减

**触发条件：** 用 `left - right` 作为升序比较结果。

**原因：** 两个合法 `int` 相减可能溢出，而 Java 不会为内置整数运算自动抛出溢出异常。

**后果：** 本应更小的数字可能被判断为更大，排序方向错误，进一步破坏比较器合同。

**错误示例：**

```java
Comparator<Integer> unsafe = new Comparator<Integer>() {
    /** 使用错误的相减方式比较整数。 */
    @Override
    public int compare(Integer left, Integer right) {
        return left - right;
    }
};
System.out.println(unsafe.compare(Integer.MIN_VALUE, 1) > 0);
```

**正确写法：**

```java
Comparator<Integer> safe = new Comparator<Integer>() {
    /** 使用标准库按数值比较整数。 */
    @Override
    public int compare(Integer left, Integer right) {
        return Integer.compare(left, right);
    }
};
System.out.println(safe.compare(Integer.MIN_VALUE, 1) < 0);
```

**验证方式：** 错误版输出 `true`，正确版输出 `true`；两行的判断方向不同，说明前者已经溢出。

### 相等输入永远返回正数

**触发条件：** 先判断 `left >= right`，然后在分支中返回正数，没有为相等值留下 `0`。

**原因：** 比较合同要求同一个对象与自身比较为 0，交换相等输入也不能改变关系。

**后果：** 排序算法可能报告比较方法违反一般合同；即使短列表暂时没有报错，结果也不能依赖。

**错误示例：**

```java
Comparator<Integer> unsafe = new Comparator<Integer>() {
    /** 错误地把相等值归入大于分支。 */
    @Override
    public int compare(Integer left, Integer right) {
        if (left < right) {
            return -1;
        }
        return 1;
    }
};
System.out.println(unsafe.compare(4, 4));
```

**正确写法：**

```java
Comparator<Integer> safe = new Comparator<Integer>() {
    /** 为相等输入返回 0，并保持数值方向。 */
    @Override
    public int compare(Integer left, Integer right) {
        if (left < right) {
            return -1;
        }
        if (left > right) {
            return 1;
        }
        return 0;
    }
};
System.out.println(safe.compare(4, 4));
```

**验证方式：** 错误版输出 `1`，正确版输出 `0`；再用 `safe.compare(4, 6)` 和 `safe.compare(6, 4)` 检查交换
后的方向相反。

### 只按主要字段排序却要求唯一结果

**触发条件：** Comparator 只比较优先级、状态或时间，遇到相同值直接返回 0。

**原因：** 比较规则没有继续读取能区分任务的稳定字段。

**后果：** List 的稳定排序只保留输入先后；输入顺序变化时，导出、展示或后续分页的精确顺序也会变化。

**错误示例：**

```java
Comparator<Task> unsafe = new Comparator<Task>() {
    /** 只比较优先级，无法区分同优先级任务。 */
    @Override
    public int compare(Task left, Task right) {
        return Integer.compare(left.getPriority(), right.getPriority());
    }
};
```

**正确写法：**

```java
Comparator<Task> safe = new BoardOrder();
```

**验证方式：** 用相同优先级但不同编号的两条任务，先以 A、B 输入再以 B、A 输入排序；错误版首元素会改变，
正确版在两次输入中都按标题和编号得到同一顺序。

### 让 TreeSet 的比较结果 0 合并不同任务

**触发条件：** 使用只比较优先级的 Comparator 创建 TreeSet。

**原因：** TreeSet 用 compareTo 或 compare 查找位置，不会再调用 equals 为比较结果 0 的第二个元素“补回去”。

**后果：** 不同编号的任务被静默当成同一元素，`add` 返回 `false`，集合数量少于录入数量。

**错误示例：**

```java
Set<Task> tasks = new TreeSet<Task>(new PriorityOnly());
tasks.add(new Task("TF-101", "整理需求", 1));
tasks.add(new Task("TF-202", "修复登录", 1));
System.out.println(tasks.size());
```

**正确写法：**

```java
Set<Task> tasks = new TreeSet<Task>(new BoardOrder());
tasks.add(new Task("TF-101", "整理需求", 1));
tasks.add(new Task("TF-202", "修复登录", 1));
System.out.println(tasks.size());
```

**验证方式：** 错误版输出 `1`，正确版输出 `2`；两条任务都需要保留时，比较器必须把编号等唯一字段纳入规则。

### 放入 TreeSet 后修改排序字段

**触发条件：** 任务进入 TreeSet 后，通过 setter 改变标题、优先级或编号。

**原因：** 树中的位置不会因为对象字段变化而自动重算。

**后果：** 遍历看似仍有旧位置，`contains` 或 `remove` 可能找不到当前值；排序集合与对象状态失去一致。

**错误示例：**

```java
List<Integer> moving = new ArrayList<Integer>();
moving.add(1);
Set<List<Integer>> tasks = new TreeSet<List<Integer>>(new Comparator<List<Integer>>() {
    /** 按列表中的第一个数字比较可变元素。 */
    @Override
    public int compare(List<Integer> left, List<Integer> right) {
        return Integer.compare(left.get(0), right.get(0));
    }
});
tasks.add(moving);
List<Integer> middle = new ArrayList<Integer>();
middle.add(2);
tasks.add(middle);
List<Integer> high = new ArrayList<Integer>();
high.add(3);
tasks.add(high);
moving.set(0, 4);
System.out.println(tasks.contains(moving));
```

**正确写法：**

```java
Set<Task> tasks = new TreeSet<Task>(new BoardOrder());
tasks.add(new Task("TF-101", "整理需求", 1));
tasks.remove(new Task("TF-101", "整理需求", 1));
tasks.add(new Task("TF-101", "整理需求", 3));
System.out.println(tasks.size());
```

**验证方式：** 正确版输出 `1`，表示先移除旧值，再以新值插入；完整程序使用 final 字段，因此不存在 setter 绕过
排序集合的路径。
:::

## 七、完整的 TeamFlow 任务排序程序

下面的程序把自然顺序、看板场景顺序、唯一 tie-breaker、TreeSet 保留数量和比较合同检查串在一起。类名是
`TeamFlowTaskSorting`，可在普通 Java 项目中直接运行。它不依赖 Lambda 或第三方库，JDK 25 与 Java 8 使用
完整相同的兼容实现。

### 1. JDK 25 版本

在 IntelliJ IDEA 中创建或打开普通 Java 项目，Project SDK 选择 JDK 25。在 `src` 下创建文件
`TeamFlowTaskSorting.java`，把下面完整内容粘贴进去。右键类名选择 Run，控制台应出现四行输出。

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;

public final class TeamFlowTaskSorting {
    /** 表示 TeamFlow 的三个看板优先级。 */
    private enum Priority {
        LOW(1),
        MEDIUM(2),
        HIGH(3);

        private final int rank;

        /** 创建带有排序等级的优先级。 */
        Priority(int rank) {
            this.rank = rank;
        }

        /** 返回用于排序的优先级等级。 */
        public int getRank() {
            return rank;
        }
    }

    private static final class Task implements Comparable<Task> {
        private final String id;
        private final String title;
        private final Priority priority;

        /** 创建不可变任务值。 */
        private Task(String id, String title, Priority priority) {
            this.id = Objects.requireNonNull(id, "id");
            this.title = Objects.requireNonNull(title, "title");
            this.priority = Objects.requireNonNull(priority, "priority");
        }

        /** 返回任务编号。 */
        private String getId() {
            return id;
        }

        /** 返回任务标题。 */
        private String getTitle() {
            return title;
        }

        /** 返回任务优先级。 */
        private Priority getPriority() {
            return priority;
        }

        /** 按编号、标题、优先级定义自然顺序。 */
        @Override
        public int compareTo(Task other) {
            int byId = id.compareTo(other.id);
            if (byId != 0) {
                return byId;
            }
            int byTitle = title.compareTo(other.title);
            if (byTitle != 0) {
                return byTitle;
            }
            return Integer.compare(priority.getRank(), other.priority.getRank());
        }

        /** 按任务的三个值判断相等。 */
        @Override
        public boolean equals(Object other) {
            if (this == other) {
                return true;
            }
            if (!(other instanceof Task)) {
                return false;
            }
            Task task = (Task) other;
            return id.equals(task.id) && title.equals(task.title) && priority == task.priority;
        }

        /** 根据参与相等判断的字段生成哈希值。 */
        @Override
        public int hashCode() {
            return Objects.hash(id, title, priority);
        }

        /** 返回便于观察排序结果的任务文本。 */
        @Override
        public String toString() {
            return priority + "|" + id + "|" + title;
        }
    }

    private static final class BoardOrder implements Comparator<Task> {
        /** 按优先级降序、标题升序、编号升序建立看板顺序。 */
        @Override
        public int compare(Task left, Task right) {
            int byPriority = Integer.compare(right.priority.getRank(), left.priority.getRank());
            if (byPriority != 0) {
                return byPriority;
            }
            int byTitle = left.title.compareTo(right.title);
            if (byTitle != 0) {
                return byTitle;
            }
            return left.id.compareTo(right.id);
        }
    }

    /** 运行自然排序、看板排序和 TreeSet 保留数量示例。 */
    public static void main(String[] args) {
        List<Task> tasks = sampleTasks();

        List<Task> natural = new ArrayList<Task>(tasks);
        Collections.sort(natural);

        List<Task> board = new ArrayList<Task>(tasks);
        Collections.sort(board, new BoardOrder());

        Set<Task> sortedSet = new TreeSet<Task>(new BoardOrder());
        sortedSet.addAll(tasks);

        boolean contractPass = comparisonContractPass();
        System.out.println("自然顺序：" + ids(natural));
        System.out.println("看板顺序：" + board);
        System.out.println("TreeSet 数量：" + sortedSet.size());
        System.out.println("比较合同：" + (contractPass ? "PASS" : "FAIL"));
    }

    /** 创建一组故意打乱输入顺序的 TeamFlow 任务。 */
    private static List<Task> sampleTasks() {
        List<Task> tasks = new ArrayList<Task>();
        tasks.add(new Task("TF-302", "整理需求", Priority.MEDIUM));
        tasks.add(new Task("TF-101", "整理需求", Priority.MEDIUM));
        tasks.add(new Task("TF-401", "准备发布", Priority.HIGH));
        tasks.add(new Task("TF-202", "修复登录", Priority.HIGH));
        return tasks;
    }

    /** 返回任务编号列表，便于观察自然顺序。 */
    private static List<String> ids(List<Task> tasks) {
        List<String> values = new ArrayList<String>();
        for (Task task : tasks) {
            values.add(task.id);
        }
        return values;
    }

    /** 检查自然顺序的交换方向、传递性和零值关系。 */
    private static boolean comparisonContractPass() {
        Task first = new Task("TF-101", "整理需求", Priority.MEDIUM);
        Task equalFirst = new Task("TF-101", "整理需求", Priority.MEDIUM);
        Task middle = new Task("TF-202", "修复登录", Priority.HIGH);
        Task last = new Task("TF-302", "整理需求", Priority.MEDIUM);

        int forward = first.compareTo(middle);
        int backward = middle.compareTo(first);
        boolean exchangeDirection =
                forward != 0 && Integer.signum(forward) == -Integer.signum(backward);
        boolean transitive =
                forward < 0 && middle.compareTo(last) < 0 && first.compareTo(last) < 0;
        boolean zeroRelation =
                first.compareTo(equalFirst) == 0
                        && first.equals(equalFirst)
                        && Integer.signum(first.compareTo(last))
                                == Integer.signum(equalFirst.compareTo(last))
                        && Integer.signum(last.compareTo(first))
                                == Integer.signum(last.compareTo(equalFirst));
        return exchangeDirection && transitive && zeroRelation;
    }
}
```

预期输出为：

```text
自然顺序：[TF-101, TF-202, TF-302, TF-401]
看板顺序：[HIGH|TF-202|修复登录, HIGH|TF-401|准备发布, MEDIUM|TF-101|整理需求, MEDIUM|TF-302|整理需求]
TreeSet 数量：4
比较合同：PASS
```

程序先复制列表再分别排序，所以自然顺序和看板顺序可以同时观察。`BoardOrder` 先比较高优先级，再比较标题，
最后比较编号；两个中优先级的“整理需求”因此按编号区分。TreeSet 的数量仍是 4，说明比较器没有把不同任务
压成同一个位置。最后一行用三项递增任务和一个等值副本，分别检查交换方向、传递性和零值关系。

### 2. Java 8 版本

创建另一个普通 Java 项目，Project SDK 选择 JDK 8；在 `src` 下同样创建 `TeamFlowTaskSorting.java`，完整
粘贴下面代码后运行。这个版本保留与 JDK 25 版本相同的普通类、匿名比较器替代方式和 `Collections.sort`，
因为本课使用的 API 在 Java 8 已存在；不要只把 Project SDK 改成 8 却继续运行旧项目的 class 输出。

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;

public final class TeamFlowTaskSorting {
    /** 表示 TeamFlow 的三个看板优先级。 */
    private enum Priority {
        LOW(1),
        MEDIUM(2),
        HIGH(3);

        private final int rank;

        /** 创建带有排序等级的优先级。 */
        Priority(int rank) {
            this.rank = rank;
        }

        /** 返回用于排序的优先级等级。 */
        public int getRank() {
            return rank;
        }
    }

    private static final class Task implements Comparable<Task> {
        private final String id;
        private final String title;
        private final Priority priority;

        /** 创建不可变任务值。 */
        private Task(String id, String title, Priority priority) {
            this.id = Objects.requireNonNull(id, "id");
            this.title = Objects.requireNonNull(title, "title");
            this.priority = Objects.requireNonNull(priority, "priority");
        }

        /** 返回任务编号。 */
        private String getId() {
            return id;
        }

        /** 返回任务标题。 */
        private String getTitle() {
            return title;
        }

        /** 返回任务优先级。 */
        private Priority getPriority() {
            return priority;
        }

        /** 按编号、标题、优先级定义自然顺序。 */
        @Override
        public int compareTo(Task other) {
            int byId = id.compareTo(other.id);
            if (byId != 0) {
                return byId;
            }
            int byTitle = title.compareTo(other.title);
            if (byTitle != 0) {
                return byTitle;
            }
            return Integer.compare(priority.getRank(), other.priority.getRank());
        }

        /** 按任务的三个值判断相等。 */
        @Override
        public boolean equals(Object other) {
            if (this == other) {
                return true;
            }
            if (!(other instanceof Task)) {
                return false;
            }
            Task task = (Task) other;
            return id.equals(task.id) && title.equals(task.title) && priority == task.priority;
        }

        /** 根据参与相等判断的字段生成哈希值。 */
        @Override
        public int hashCode() {
            return Objects.hash(id, title, priority);
        }

        /** 返回便于观察排序结果的任务文本。 */
        @Override
        public String toString() {
            return priority + "|" + id + "|" + title;
        }
    }

    private static final class BoardOrder implements Comparator<Task> {
        /** 按优先级降序、标题升序、编号升序建立看板顺序。 */
        @Override
        public int compare(Task left, Task right) {
            int byPriority = Integer.compare(right.priority.getRank(), left.priority.getRank());
            if (byPriority != 0) {
                return byPriority;
            }
            int byTitle = left.title.compareTo(right.title);
            if (byTitle != 0) {
                return byTitle;
            }
            return left.id.compareTo(right.id);
        }
    }

    /** 运行自然排序、看板排序和 TreeSet 保留数量示例。 */
    public static void main(String[] args) {
        List<Task> tasks = sampleTasks();

        List<Task> natural = new ArrayList<Task>(tasks);
        Collections.sort(natural);

        List<Task> board = new ArrayList<Task>(tasks);
        Collections.sort(board, new BoardOrder());

        Set<Task> sortedSet = new TreeSet<Task>(new BoardOrder());
        sortedSet.addAll(tasks);

        boolean contractPass = comparisonContractPass();
        System.out.println("自然顺序：" + ids(natural));
        System.out.println("看板顺序：" + board);
        System.out.println("TreeSet 数量：" + sortedSet.size());
        System.out.println("比较合同：" + (contractPass ? "PASS" : "FAIL"));
    }

    /** 创建一组故意打乱输入顺序的 TeamFlow 任务。 */
    private static List<Task> sampleTasks() {
        List<Task> tasks = new ArrayList<Task>();
        tasks.add(new Task("TF-302", "整理需求", Priority.MEDIUM));
        tasks.add(new Task("TF-101", "整理需求", Priority.MEDIUM));
        tasks.add(new Task("TF-401", "准备发布", Priority.HIGH));
        tasks.add(new Task("TF-202", "修复登录", Priority.HIGH));
        return tasks;
    }

    /** 返回任务编号列表，便于观察自然顺序。 */
    private static List<String> ids(List<Task> tasks) {
        List<String> values = new ArrayList<String>();
        for (Task task : tasks) {
            values.add(task.id);
        }
        return values;
    }

    /** 检查自然顺序的交换方向、传递性和零值关系。 */
    private static boolean comparisonContractPass() {
        Task first = new Task("TF-101", "整理需求", Priority.MEDIUM);
        Task equalFirst = new Task("TF-101", "整理需求", Priority.MEDIUM);
        Task middle = new Task("TF-202", "修复登录", Priority.HIGH);
        Task last = new Task("TF-302", "整理需求", Priority.MEDIUM);

        int forward = first.compareTo(middle);
        int backward = middle.compareTo(first);
        boolean exchangeDirection =
                forward != 0 && Integer.signum(forward) == -Integer.signum(backward);
        boolean transitive =
                forward < 0 && middle.compareTo(last) < 0 && first.compareTo(last) < 0;
        boolean zeroRelation =
                first.compareTo(equalFirst) == 0
                        && first.equals(equalFirst)
                        && Integer.signum(first.compareTo(last))
                                == Integer.signum(equalFirst.compareTo(last))
                        && Integer.signum(last.compareTo(first))
                                == Integer.signum(last.compareTo(equalFirst));
        return exchangeDirection && transitive && zeroRelation;
    }
}
```

预期输出与 JDK 25 版本逐字相同：

```text
自然顺序：[TF-101, TF-202, TF-302, TF-401]
看板顺序：[HIGH|TF-202|修复登录, HIGH|TF-401|准备发布, MEDIUM|TF-101|整理需求, MEDIUM|TF-302|整理需求]
TreeSet 数量：4
比较合同：PASS
```

配置 Project SDK 时选择 JDK 8；运行配置的 JRE 也应显示 JDK 8。终端核对 `java -version` 和 `javac -version`
后，再从 IDEA 运行同一类，两个地方都应对应 Java 8。不要把 JDK 25 编译出的输出目录交给 Java 8 运行，两个
版本的源码副本和 class 输出目录应分开。

### 3. 两个版本的观察路径

先看第一行：它只调用 `Comparable` 的自然顺序。第二行是在同一批对象的副本上使用 `BoardOrder`，因此可以看到
类型默认规则和看板规则互不覆盖。第三行说明 TreeSet 使用的是比较规则而不是输入顺序；第四行把交换方向、
三项传递关系和等值副本相对第三个任务的方向放进最小合同检查。

如果 IDEA 的运行配置使用了错误的类，控制台不会出现预期的 `比较合同：PASS`。此时先确认文件名、public 类名、
运行配置的主类和当前模块 SDK，再比较 IDEA 的 Project SDK 与终端的 `java -version`/`javac -version`；这仍然
只是环境核对，不需要进入下一课的完整错误诊断。

## 八、独立练习

### 1. 发布队列排序

请创建 `TeamFlowReleaseSorting`，使用本课已经讲过的普通类和 `Comparator`，完成一份发布前任务队列：

:::exercise
### 发布队列

**要求：** 创建四个任务值，每个任务包含编号、标题、是否阻塞发布和预计分钟数。实现 `Comparable`，依次按
编号、标题、阻塞状态和预计分钟数定义与 `equals` 一致的自然顺序；再实现一个比较器，按“阻塞任务在前、
预计分钟数升序、编号升序”排序。用两个不同输入顺序的列表分别验证 tie-breaker，并打印自然
顺序和发布顺序。不得使用 Lambda、Stream、日期、金额、Maven 或 Spring。两个 Java 版本都应打印下面两行，
且发布顺序在交换输入顺序后仍完全一致。

**验收：**

```text
自然顺序：[TF-501, TF-502, TF-503, TF-504]
发布顺序：[阻塞|TF-501|15, 阻塞|TF-503|15, 普通|TF-504|10, 普通|TF-502|20]
```
:::

### 2. JDK 25 参考实现

配置 Project SDK 为 JDK 25，创建 `TeamFlowReleaseSorting.java` 并运行：

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

public final class TeamFlowReleaseSorting {
    private static final class ReleaseTask implements Comparable<ReleaseTask> {
        private final String id;
        private final String title;
        private final boolean blocking;
        private final int minutes;

        /** 创建发布队列任务。 */
        private ReleaseTask(String id, String title, boolean blocking, int minutes) {
            this.id = Objects.requireNonNull(id, "id");
            this.title = Objects.requireNonNull(title, "title");
            this.blocking = blocking;
            this.minutes = minutes;
        }

        /** 按编号、标题、阻塞状态和耗时定义自然顺序。 */
        @Override
        public int compareTo(ReleaseTask other) {
            int byId = id.compareTo(other.id);
            if (byId != 0) {
                return byId;
            }
            int byTitle = title.compareTo(other.title);
            if (byTitle != 0) {
                return byTitle;
            }
            int byBlocking = Boolean.compare(blocking, other.blocking);
            if (byBlocking != 0) {
                return byBlocking;
            }
            return Integer.compare(minutes, other.minutes);
        }

        /** 返回任务编号。 */
        private String getId() {
            return id;
        }

        /** 按任务的四个值判断相等。 */
        @Override
        public boolean equals(Object other) {
            if (this == other) {
                return true;
            }
            if (!(other instanceof ReleaseTask)) {
                return false;
            }
            ReleaseTask task = (ReleaseTask) other;
            return blocking == task.blocking
                    && minutes == task.minutes
                    && id.equals(task.id)
                    && title.equals(task.title);
        }

        /** 根据参与相等判断的字段生成哈希值。 */
        @Override
        public int hashCode() {
            return Objects.hash(id, title, blocking, minutes);
        }

        /** 返回发布队列的可读行。 */
        @Override
        public String toString() {
            return (blocking ? "阻塞" : "普通") + "|" + id + "|" + minutes;
        }
    }

    private static final class ReleaseOrder implements Comparator<ReleaseTask> {
        /** 按阻塞状态、预计分钟数和编号建立发布顺序。 */
        @Override
        public int compare(ReleaseTask left, ReleaseTask right) {
            int byBlocking = Boolean.compare(right.blocking, left.blocking);
            if (byBlocking != 0) {
                return byBlocking;
            }
            int byMinutes = Integer.compare(left.minutes, right.minutes);
            if (byMinutes != 0) {
                return byMinutes;
            }
            return left.id.compareTo(right.id);
        }
    }

    /** 运行练习参考程序。 */
    public static void main(String[] args) {
        List<ReleaseTask> tasks = sampleTasks();
        List<ReleaseTask> natural = new ArrayList<ReleaseTask>(tasks);
        Collections.sort(natural);
        List<ReleaseTask> release = new ArrayList<ReleaseTask>(tasks);
        Collections.sort(release, new ReleaseOrder());
        List<ReleaseTask> reorderedRelease = sampleTasksReordered();
        Collections.sort(reorderedRelease, new ReleaseOrder());
        if (!release.equals(reorderedRelease)) {
            throw new IllegalStateException("输入顺序改变后，发布顺序不一致");
        }
        System.out.println("自然顺序：" + ids(natural));
        System.out.println("发布顺序：" + release);
    }

    /** 创建练习所需的四个任务。 */
    private static List<ReleaseTask> sampleTasks() {
        List<ReleaseTask> tasks = new ArrayList<ReleaseTask>();
        tasks.add(new ReleaseTask("TF-504", "准备发布", false, 10));
        tasks.add(new ReleaseTask("TF-501", "修复登录", true, 15));
        tasks.add(new ReleaseTask("TF-502", "整理日志", false, 20));
        tasks.add(new ReleaseTask("TF-503", "迁移数据", true, 15));
        return tasks;
    }

    /** 创建内容相同但输入顺序不同的任务列表。 */
    private static List<ReleaseTask> sampleTasksReordered() {
        List<ReleaseTask> tasks = new ArrayList<ReleaseTask>();
        tasks.add(new ReleaseTask("TF-502", "整理日志", false, 20));
        tasks.add(new ReleaseTask("TF-503", "迁移数据", true, 15));
        tasks.add(new ReleaseTask("TF-501", "修复登录", true, 15));
        tasks.add(new ReleaseTask("TF-504", "准备发布", false, 10));
        return tasks;
    }

    /** 返回自然顺序中的编号。 */
    private static List<String> ids(List<ReleaseTask> tasks) {
        List<String> values = new ArrayList<String>();
        for (ReleaseTask task : tasks) {
            values.add(task.getId());
        }
        return values;
    }
}
```

运行结果应是练习验收中的两行。程序还会把相同任务按另一种输入顺序再次排序；两次发布顺序不同就停止运行，
因此正常出现两行输出也证明 tie-breaker 没有依赖输入位置。第一个列表先放 `TF-504`，但发布比较器先筛出
阻塞任务；`TF-501` 与 `TF-503` 的预计分钟数同为 15，最终由编号把 `TF-501` 放在前面。非阻塞任务仍按
10、20 分钟排列。

### 3. Java 8 参考实现

配置 Project SDK 为 JDK 8，在另一个独立项目中创建同名文件。Java 8 的完整参考实现如下；它与 JDK 25 版
保持相同，是因为本练习使用的 `Boolean.compare`、`Integer.compare`、`Comparable`、`Comparator` 和
`Collections.sort` 都已在 Java 8 提供：

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

public final class TeamFlowReleaseSorting {
    private static final class ReleaseTask implements Comparable<ReleaseTask> {
        private final String id;
        private final String title;
        private final boolean blocking;
        private final int minutes;

        /** 创建发布队列任务。 */
        private ReleaseTask(String id, String title, boolean blocking, int minutes) {
            this.id = Objects.requireNonNull(id, "id");
            this.title = Objects.requireNonNull(title, "title");
            this.blocking = blocking;
            this.minutes = minutes;
        }

        /** 按编号、标题、阻塞状态和耗时定义自然顺序。 */
        @Override
        public int compareTo(ReleaseTask other) {
            int byId = id.compareTo(other.id);
            if (byId != 0) {
                return byId;
            }
            int byTitle = title.compareTo(other.title);
            if (byTitle != 0) {
                return byTitle;
            }
            int byBlocking = Boolean.compare(blocking, other.blocking);
            if (byBlocking != 0) {
                return byBlocking;
            }
            return Integer.compare(minutes, other.minutes);
        }

        /** 返回任务编号。 */
        private String getId() {
            return id;
        }

        /** 按任务的四个值判断相等。 */
        @Override
        public boolean equals(Object other) {
            if (this == other) {
                return true;
            }
            if (!(other instanceof ReleaseTask)) {
                return false;
            }
            ReleaseTask task = (ReleaseTask) other;
            return blocking == task.blocking
                    && minutes == task.minutes
                    && id.equals(task.id)
                    && title.equals(task.title);
        }

        /** 根据参与相等判断的字段生成哈希值。 */
        @Override
        public int hashCode() {
            return Objects.hash(id, title, blocking, minutes);
        }

        /** 返回发布队列的可读行。 */
        @Override
        public String toString() {
            return (blocking ? "阻塞" : "普通") + "|" + id + "|" + minutes;
        }
    }

    private static final class ReleaseOrder implements Comparator<ReleaseTask> {
        /** 按阻塞状态、预计分钟数和编号建立发布顺序。 */
        @Override
        public int compare(ReleaseTask left, ReleaseTask right) {
            int byBlocking = Boolean.compare(right.blocking, left.blocking);
            if (byBlocking != 0) {
                return byBlocking;
            }
            int byMinutes = Integer.compare(left.minutes, right.minutes);
            if (byMinutes != 0) {
                return byMinutes;
            }
            return left.id.compareTo(right.id);
        }
    }

    /** 运行练习参考程序。 */
    public static void main(String[] args) {
        List<ReleaseTask> tasks = sampleTasks();
        List<ReleaseTask> natural = new ArrayList<ReleaseTask>(tasks);
        Collections.sort(natural);
        List<ReleaseTask> release = new ArrayList<ReleaseTask>(tasks);
        Collections.sort(release, new ReleaseOrder());
        List<ReleaseTask> reorderedRelease = sampleTasksReordered();
        Collections.sort(reorderedRelease, new ReleaseOrder());
        if (!release.equals(reorderedRelease)) {
            throw new IllegalStateException("输入顺序改变后，发布顺序不一致");
        }
        System.out.println("自然顺序：" + ids(natural));
        System.out.println("发布顺序：" + release);
    }

    /** 创建练习所需的四个任务。 */
    private static List<ReleaseTask> sampleTasks() {
        List<ReleaseTask> tasks = new ArrayList<ReleaseTask>();
        tasks.add(new ReleaseTask("TF-504", "准备发布", false, 10));
        tasks.add(new ReleaseTask("TF-501", "修复登录", true, 15));
        tasks.add(new ReleaseTask("TF-502", "整理日志", false, 20));
        tasks.add(new ReleaseTask("TF-503", "迁移数据", true, 15));
        return tasks;
    }

    /** 创建内容相同但输入顺序不同的任务列表。 */
    private static List<ReleaseTask> sampleTasksReordered() {
        List<ReleaseTask> tasks = new ArrayList<ReleaseTask>();
        tasks.add(new ReleaseTask("TF-502", "整理日志", false, 20));
        tasks.add(new ReleaseTask("TF-503", "迁移数据", true, 15));
        tasks.add(new ReleaseTask("TF-501", "修复登录", true, 15));
        tasks.add(new ReleaseTask("TF-504", "准备发布", false, 10));
        return tasks;
    }

    /** 返回自然顺序中的编号。 */
    private static List<String> ids(List<ReleaseTask> tasks) {
        List<String> values = new ArrayList<String>();
        for (ReleaseTask task : tasks) {
            values.add(task.getId());
        }
        return values;
    }
}
```

Java 8 版的 IDEA 步骤仍是选择 Project SDK 为 JDK 8、创建该类、右键运行并观察两行输出。若终端显示 Java 25
而 IDEA 项目选择 JDK 8，这不是课程代码差异，应该分别查看 `Project Structure` 的 Project SDK、模块 SDK、
Run Configuration 的 JRE，以及两条版本命令的输出。

## 九、把顺序能力放回 TeamFlow

以后任务查询需要排序时，先问清楚这是类型的长期默认顺序还是某个页面的场景顺序：前者实现 Comparable，后者
创建 Comparator。列表需要可复现结果时，主要字段后追加稳定唯一编号；排序集合需要保留不同对象时，确保
`compare == 0` 与业务相等的含义一致。这样排序只是任务集合查询的一个明确步骤，尚未涉及日期、金额或数据库
查询语句。
