---
id: backend.java.learn.basics.sets-and-uniqueness
type: lesson
title: Set
summary: 用 Set 保证 TeamFlow 标识唯一，并根据顺序、排序和可变性要求选择合适的实现
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 95
prerequisites:
  - backend.java.learn.basics.collections-and-iteration-contracts
objectives:
  - 能说明 Set 的唯一性、无索引和 equals 合同。
  - 能使用 add、contains、remove、size 处理唯一任务标识。
  - 能根据是否需要顺序或排序选择 HashSet、LinkedHashSet 和 TreeSet。
  - 能识别 HashSet 顺序、可变元素和 TreeSet 比较规则带来的边界。
  - 能区分 Set.of、Set.copyOf 与 Collections.unmodifiableSet 的不可修改和快照语义。
  - 能在 JDK 25 与 Java 8 中分别运行完整的 TeamFlow Set 程序。
recap:
  - Set 不允许两个互相 equals 的元素同时存在，不提供 List 式索引。
  - add 的返回值可以说明元素是新加入还是已经存在；contains、remove 和 size 分别回答存在性、删除结果和数量。
  - HashSet 不承诺迭代顺序，LinkedHashSet 保留插入顺序，TreeSet 按自然顺序或 Comparator 排序。
  - 放入 Set 的对象不应在加入后改变影响 equals 或 hashCode 的状态。
  - Set.of 与 Set.copyOf 在现代 JDK 中返回不可修改集合并拒绝 null；Set.of 拒绝重复参数，Set.copyOf 对重复输入只保留一个；Java 8 没有这两个工厂方法。
  - Collections.unmodifiableSet 只是只读视图，先复制再包装才能隔离源集合的后续结构变化。
related: []
tags:
  - Java
  - Set
  - HashSet
  - LinkedHashSet
  - TreeSet
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 使用 Set 的共同接口和 Collections.unmodifiableSet 兼容写法
verifiedAt: 2026-08-17
sources:
  - id: java-25-set
    title: Java SE 25 API - Set
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Set.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - Set 不包含重复元素，唯一性按 equals 判断
      - Set 没有 List 式索引，add、contains、remove 和 size 的基本合同
      - Set.of 与 Set.copyOf 返回不可修改集合并拒绝 null
      - Set.of 拒绝重复参数，Set.copyOf 从重复输入中只保留一个元素
      - 修改影响 equals 的元素状态会使 Set 行为未定义
  - id: java-25-hashset
    title: Java SE 25 API - HashSet
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashSet.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - HashSet 由哈希表支撑且不保证迭代顺序
      - HashSet 的基本操作合同适合用来表达唯一性查询
  - id: java-25-linkedhashset
    title: Java SE 25 API - LinkedHashSet
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/LinkedHashSet.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - LinkedHashSet 维护可预测的插入顺序
      - LinkedHashSet 结合哈希表和链表来提供顺序与唯一性
  - id: java-25-treeset
    title: Java SE 25 API - TreeSet
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/TreeSet.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - TreeSet 按自然顺序或提供的 Comparator 排列元素
      - TreeSet 的排序应与 equals 保持一致，否则会违背 Set 的一般合同
      - TreeSet 对不具备可比较规则的元素不能完成正常插入
  - id: dev-java-sets
    title: Extending Collection with Set, SortedSet and NavigableSet - Dev.java
    url: https://dev.java/learn/api/collections-framework/sets
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Dev.java Collections Framework 教程；核心合同已与 Java SE 25 API 核对
    claims:
      - HashSet、LinkedHashSet 和 TreeSet 的顺序选择依据
      - Set 通过禁止重复元素区别于 List
  - id: java-8-set
    title: Java SE 8 API - Set
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Set.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 已提供 Set 的唯一性、equals、add、contains、remove 和 size 合同
      - Java 8 的 Set 接口没有 of 与 copyOf 工厂方法
  - id: java-8-collections
    title: Java SE 8 API - Collections
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Collections.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Collections.unmodifiableSet 返回指定 Set 的不可修改视图
  - id: java-10-set
    title: Java SE 10 API - Set
    url: https://docs.oracle.com/javase/10/docs/api/java/util/Set.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 10 及以上
    claims:
      - Set.copyOf 静态工厂方法在 Java 10 API 中提供不可修改副本
  - id: stackoverflow-hashset-order
    title: Iteration order of HashSet
    url: https://stackoverflow.com/questions/2704597/iteration-order-of-hashset
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 集合常见误用；问答结论已回到 Java SE HashSet API 核验
    claims:
      - 即使插入顺序和元素 hashCode 看起来稳定，也不能把 HashSet 的观察顺序当成合同
      - 需要可预测插入顺序时应选择 LinkedHashSet
  - id: stackoverflow-treeset-comparator
    title: TreeSet custom comparator doesn't work with equal objects
    url: https://stackoverflow.com/questions/50315333/treeset-custom-comparator-doesnt-work-with-equal-objects
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 及以上；案例中的比较器错误已与 Java SE TreeSet API 核验
    claims:
      - TreeSet 比较器返回 0 的元素会被视为同一排序位置
      - 比较器不具备稳定、传递且与 equals 相容的规则时，查找和删除可能表现异常
---

# Set

TeamFlow 需要维护一组不会重复的任务编号：同一编号可能从不同输入渠道到达，但系统只能把它登记一次。
`List` 适合回答“第几项”，`Set` 适合回答“这个成员是否已经出现”。理解这个区别后，才能在去重、白名单和
已处理标识等场景中选对集合。

本课只围绕 `Set` 的唯一性、基本操作、三种常见实现和不可修改边界展开。完整集合遍历与安全删除留给后续
课程，`Map`、Stream、复杂排序策略和并发集合也不在本课范围内。

## 一、先建立 Set 心智模型

### 1. Set 保证唯一性，但没有位置索引

`Set<E>` 表示一组不重复的元素。按照 Java 的合同，如果两个元素满足 `e1.equals(e2)`，Set 中最多保留其中
一个；同一个对象也不能因为重复调用 `add` 而出现两次。Set 没有 `get(0)` 这样的按位置读取方法，所以它与
上一课的 `List` 解决的是不同问题。

```java
import java.util.HashSet;
import java.util.Set;

/** 演示 Set 的唯一性和无索引特征。 */
public class SetUniquenessDemo {
    /**
     * 加入重复任务编号并报告集合状态。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        Set<String> taskIds = new HashSet<>();
        boolean firstAdded = taskIds.add("TF-101");
        boolean secondAdded = taskIds.add("TF-101");

        System.out.println("第一次加入：" + firstAdded);
        System.out.println("第二次加入：" + secondAdded);
        System.out.println("唯一编号数量：" + taskIds.size());
        System.out.println("是否包含 TF-101：" + taskIds.contains("TF-101"));
    }
}
```

预期输出为：

```text
第一次加入：true
第二次加入：false
唯一编号数量：1
是否包含 TF-101：true
```

第一次 `add` 成功改变了集合，返回 `true`；第二次发现等值元素已经存在，没有新增成员，返回 `false`。这就是
Set 与 List 的关键差别：List 会保留两个字符串，Set 会把第二次加入视为重复。

### 2. 基本操作围绕成员资格

Set 最常用的操作不是索引读写，而是成员资格和数量：

| 操作 | 含义 | 观察结果 |
| --- | --- | --- |
| `add(value)` | 尝试加入元素 | 新元素返回 `true`，重复元素返回 `false` |
| `contains(value)` | 查询是否存在等值元素 | 返回 `true` 或 `false` |
| `remove(value)` | 删除一个等值元素 | 删除成功返回 `true`，不存在返回 `false` |
| `size()` | 读取当前基数 | 返回唯一元素数量 |

下面的程序用这四个操作登记、确认和撤销一个 TeamFlow 标识：

```java
import java.util.LinkedHashSet;
import java.util.Set;

/** 演示 Set 的成员资格操作。 */
public class SetMembershipDemo {
    /**
     * 登记一个任务标识并撤销它。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        Set<String> taskIds = new LinkedHashSet<>();
        taskIds.add("TF-101");
        taskIds.add("TF-202");

        System.out.println("登记前数量：" + taskIds.size());
        System.out.println("是否已登记 TF-202：" + taskIds.contains("TF-202"));
        System.out.println("撤销 TF-202：" + taskIds.remove("TF-202"));
        System.out.println("撤销后数量：" + taskIds.size());
        System.out.println("再次撤销 TF-202：" + taskIds.remove("TF-202"));
    }
}
```

预期输出为：

```text
登记前数量：2
是否已登记 TF-202：true
撤销 TF-202：true
撤销后数量：1
再次撤销 TF-202：false
```

`remove` 的参数是要删除的值，不是 List 的整数索引。不存在的值不会把数量减到负数，而是返回 `false`。
本课先使用这些直接操作完成成员资格判断；循环读取每个成员的写法放到集合遍历课程。

### 3. 唯一性依赖 equals 和 hashCode

对字符串、整数这类标准类型，Java 已经提供了稳定的 `equals` 和 `hashCode`。如果把自定义对象放入
`HashSet`，Set 会用它们判断两个对象是否代表同一成员。因此，业务唯一键必须进入对象的相等性合同，且
`equals` 返回 `true` 时 `hashCode` 必须相同。

```java
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

/** 表示一个拥有稳定编号的任务。 */
final class TaskKey {
    private final String id;

    /**
     * 创建任务键。
     *
     * @param id 任务唯一编号
     */
    TaskKey(String id) {
        this.id = id;
    }

    /**
     * 按任务编号判断相等性。
     *
     * @param other 待比较对象
     * @return 编号相同则为 true
     */
    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof TaskKey)) return false;
        TaskKey taskKey = (TaskKey) other;
        return Objects.equals(id, taskKey.id);
    }

    /**
     * 返回与 equals 一致的哈希值。
     *
     * @return 任务编号的哈希值
     */
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

/** 演示自定义对象在 Set 中按值去重。 */
public class SetEqualityDemo {
    /**
     * 创建两个相同编号的对象并观察 Set 结果。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        Set<TaskKey> taskKeys = new HashSet<>();
        taskKeys.add(new TaskKey("TF-101"));
        taskKeys.add(new TaskKey("TF-101"));

        System.out.println("唯一任务键数量：" + taskKeys.size());
    }
}
```

预期输出为 `唯一任务键数量：1`。如果只重写 `equals` 而没有同步重写 `hashCode`，哈希集合可能把逻辑上相等
的对象放入不同位置，去重和查找就不可靠。对象一旦加入 Set，也不要再改变参与 `equals` 或 `hashCode` 的字段。

## 二、根据顺序要求选择实现

### 1. HashSet 只表达唯一性

`HashSet` 是普通 Set 的起点：它用哈希结构保存成员，适合主要关心 `contains`、`add` 和 `remove` 的场景。
它不承诺迭代顺序。一次运行中打印出来的顺序看似稳定，也不能变成程序合同；容量变化、元素哈希值或 JDK
实现变化都可能让顺序改变。

```java
import java.util.HashSet;
import java.util.Set;

/** 演示 HashSet 的职责是去重而非排序。 */
public class HashSetDemo {
    /**
     * 加入任务编号并查询其存在性。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        Set<String> taskIds = new HashSet<>();
        taskIds.add("TF-302");
        taskIds.add("TF-101");
        taskIds.add("TF-202");

        System.out.println("数量：" + taskIds.size());
        System.out.println("包含 TF-202：" + taskIds.contains("TF-202"));
        System.out.println("集合内容（顺序不作合同）：" + taskIds);
    }
}
```

确定的是数量和成员资格，而不是最后一行中三个编号的显示顺序。需要在日志、界面或测试中复现加入顺序时，
应改用 `LinkedHashSet`；需要排序时，改用 `TreeSet` 或在独立排序课程中明确排序步骤。

### 2. LinkedHashSet 同时保留唯一性和插入顺序

`LinkedHashSet` 在哈希集合的基础上维护链接关系，因此遍历或打印时会按插入顺序呈现成员。重复加入已存在的
成员不会把它移动到末尾：Set 仍然只有一个成员，顺序也不会因重复调用而重新排队。

```java
import java.util.LinkedHashSet;
import java.util.Set;

/** 演示 LinkedHashSet 的插入顺序。 */
public class LinkedHashSetDemo {
    /**
     * 按到达顺序登记任务编号。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        Set<String> taskIds = new LinkedHashSet<>();
        taskIds.add("TF-302");
        taskIds.add("TF-101");
        taskIds.add("TF-302");
        taskIds.add("TF-202");

        System.out.println("登记顺序：" + taskIds);
    }
}
```

预期输出为：

```text
登记顺序：[TF-302, TF-101, TF-202]
```

`LinkedHashSet` 解决的是“去重后仍要保留到达顺序”，不是“按照编号排序”。不要看到输出有顺序，就把它替换
成需要比较规则的 `TreeSet`。

### 3. TreeSet 用比较规则维持排序

`TreeSet` 实现有序 Set。元素必须具备自然顺序，或者创建集合时提供 `Comparator`；否则集合无法判断新元素应
放在什么位置。TreeSet 把比较结果为 `0` 的两个元素看成同一排序位置，所以比较规则如果忽略了业务唯一键，
可能在加入时丢掉本来不同的对象。

下面使用字符串的自然顺序，只展示 TreeSet 的选择结果，不展开 `Comparable` 和 `Comparator` 的完整设计：

```java
import java.util.Set;
import java.util.TreeSet;

/** 演示 TreeSet 按自然顺序保存字符串。 */
public class TreeSetDemo {
    /**
     * 保存并按自然顺序显示任务编号。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        Set<String> taskIds = new TreeSet<>();
        taskIds.add("TF-302");
        taskIds.add("TF-101");
        taskIds.add("TF-202");

        System.out.println("排序后的编号：" + taskIds);
    }
}
```

预期输出为 `排序后的编号：[TF-101, TF-202, TF-302]`。TreeSet 的详细比较器合同属于后续排序课程；本课只需
记住三个边界：没有可比较规则时不能正常加入；比较为 `0` 会被视为重复；排序顺序不能与业务相等性冲突。

### 4. 先声明 Set 接口，再选择右侧实现

常见写法是：

```java
Set<String> taskIds = new LinkedHashSet<>();
```

左侧说的是当前代码需要的最低合同：唯一成员集合。右侧才决定是否保留插入顺序、是否排序或是否允许修改。
如果调用方只依赖 `add`、`contains`、`remove` 和 `size`，以后从 `HashSet` 换成 `LinkedHashSet` 通常不需要
改动调用代码；但顺序一旦成为需求，就应在选择实现时显式记录，而不是依赖 HashSet 的偶然输出。

## 三、可修改与不可修改的边界

### 1. Set.of 和 Set.copyOf 适合固定成员

JDK 25 提供两个常用的不可修改工厂：

- `Set.of("TF-101", "TF-202")` 直接创建固定成员集合。
- `Set.copyOf(source)` 从已有集合创建不可修改副本；如果 `source` 是带重复值的 `List`，结果只保留其中一个。

它们都拒绝 `null`；`Set.of` 在参数重复时会拒绝创建，`Set.copyOf` 则从重复输入中任意保留一个。成功创建后，任何改变集合结构
的操作都会抛出 `UnsupportedOperationException`。工厂集合的迭代顺序没有合同，不能用它替代
`LinkedHashSet` 的插入顺序。

```java
import java.util.HashSet;
import java.util.Set;

/** 演示 JDK 25 的不可修改 Set 工厂。 */
public class UnmodifiableSetDemo {
    /**
     * 创建固定白名单并尝试修改它。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        Set<String> releaseMembers = Set.of("产品", "开发", "测试");
        Set<String> copiedMembers = Set.copyOf(new HashSet<>(releaseMembers));

        System.out.println("发布成员数量：" + releaseMembers.size());
        System.out.println("副本包含测试：" + copiedMembers.contains("测试"));

        try {
            releaseMembers.add("运维");
        } catch (UnsupportedOperationException error) {
            System.out.println("固定集合不能修改：" + error.getClass().getSimpleName());
        }
    }
}
```

预期输出的前两行分别是 `发布成员数量：3` 和 `副本包含测试：true`，最后一行是
`固定集合不能修改：UnsupportedOperationException`。`Set.copyOf` 会读取创建时的成员并产生副本，之后源集合的
结构变化不会把新成员带入副本；但元素对象本身仍可能是可变的，因此不可修改只针对集合结构。

### 2. Java 8 没有 Set.of 和 Set.copyOf

`Set` 的唯一性、`HashSet`、`LinkedHashSet`、`TreeSet` 以及 `Collections.unmodifiableSet` 在 Java 8 已经存在。
真实差异只出现在工厂方法：Java 8 编译器找不到 `Set.of` 和 `Set.copyOf`。需要兼容 Java 8 时，先复制到可变
集合，再用 `Collections.unmodifiableSet` 包装：

```java
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Set;

/** 演示 Java 8 创建固定成员集合的兼容写法。 */
public class Java8UnmodifiableSetDemo {
    /**
     * 复制成员并返回 Java 8 可用的只读视图。
     *
     * @return 独立的不可修改成员集合
     */
    private static Set<String> createMembers() {
        Set<String> copy = new LinkedHashSet<>(
                Arrays.asList("产品", "开发", "测试")
        );
        return Collections.unmodifiableSet(copy);
    }

    /**
     * 运行 Java 8 兼容示例。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        Set<String> releaseMembers = createMembers();
        System.out.println("发布成员数量：" + releaseMembers.size());
        try {
            releaseMembers.add("运维");
        } catch (UnsupportedOperationException error) {
            System.out.println("固定集合不能修改：" + error.getClass().getSimpleName());
        }
    }
}
```

输出仍然是数量 `3` 和 `UnsupportedOperationException`。菱形运算符在 Java 8 中已经可用，这里无需重复写出
`String` 类型参数。

### 3. 只读视图和不可修改副本不是一回事

`Collections.unmodifiableSet(source)` 不会复制 `source`，它返回一个不能通过自身修改的视图。若其他代码
仍然持有 `source` 并加入成员，视图会看到变化。要把发布时的成员冻结下来，应先复制，再包装：

```java
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Set;

/** 演示只读视图与独立副本的差异。 */
public class SetViewDemo {
    /**
     * 比较视图和复制后包装的集合。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        Set<String> source = new LinkedHashSet<>();
        source.add("TF-101");

        Set<String> view = Collections.unmodifiableSet(source);
        Set<String> snapshot = Collections.unmodifiableSet(new LinkedHashSet<>(source));
        source.add("TF-202");

        System.out.println("视图数量：" + view.size());
        System.out.println("副本数量：" + snapshot.size());
    }
}
```

预期输出为：

```text
视图数量：2
副本数量：1
```

“不可修改”只说明调用方不能通过该引用调用 `add` 或 `remove`；它没有自动把源集合变成快照。发布配置、白名单
等需要稳定成员的场景，应明确使用 `Set.copyOf`（JDK 25）或“复制后 `unmodifiableSet`”（Java 8）。

## 四、完整 TeamFlow 程序

### 1. JDK 25 版本

TeamFlow 要登记从不同渠道到达的任务编号，重复编号只保留一次；发布时还要固定一份成员快照。程序使用
`LinkedHashSet` 让控制台显示保留到达顺序，再使用 `Set.copyOf` 创建发布快照：

```java
import java.util.LinkedHashSet;
import java.util.Set;

/** 汇总 TeamFlow 的唯一任务登记。 */
public class TeamFlowSetApplication {
    /**
     * 登记任务编号并创建发布快照。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        Set<String> draftTaskIds = new LinkedHashSet<>();
        boolean first = draftTaskIds.add("TF-302");
        boolean duplicate = draftTaskIds.add("TF-302");
        draftTaskIds.add("TF-101");
        draftTaskIds.add("TF-202");

        Set<String> publishedTaskIds = Set.copyOf(draftTaskIds);
        draftTaskIds.add("TF-404");

        System.out.println("首次登记：" + first);
        System.out.println("重复登记：" + duplicate);
        System.out.println("草稿数量：" + draftTaskIds.size());
        System.out.println("发布快照数量：" + publishedTaskIds.size());
        System.out.println("发布快照包含 TF-202：" + publishedTaskIds.contains("TF-202"));
        System.out.println("草稿登记顺序：" + draftTaskIds);
    }
}
```

在 IntelliJ IDEA 中新建普通 Java 项目，Project SDK 选择 JDK 25；在 `src` 下创建
`TeamFlowSetApplication.java`，粘贴完整代码，右键类名选择 **Run 'TeamFlowSetApplication.main()'**。
也可以在终端进入保存该文件的目录，执行 `javac TeamFlowSetApplication.java` 后运行
`java TeamFlowSetApplication`。预期输出为：

```text
首次登记：true
重复登记：false
草稿数量：4
发布快照数量：3
发布快照包含 TF-202：true
草稿登记顺序：[TF-302, TF-101, TF-202, TF-404]
```

`draftTaskIds` 在快照创建后加入 `TF-404`，所以草稿有四项；`publishedTaskIds` 只保留创建时的三项。这段程序
同时展示了 `add` 的重复反馈、插入顺序和不可修改快照。它没有依赖 Spring Boot、Maven 或 HTTP。

### 2. Java 8 版本

Java 8 保留相同的 Set、LinkedHashSet 和成员资格操作，只把 `Set.copyOf` 替换成“复制后包装”的兼容写法：

```java
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Set;

/** 汇总 Java 8 兼容的 TeamFlow 唯一任务登记。 */
public class TeamFlowSetApplicationJava8 {
    /**
     * 创建发布时的独立只读快照。
     *
     * @param source 发布时的草稿成员
     * @return 不受 source 后续结构变化影响的只读集合
     */
    private static Set<String> copyAsUnmodifiable(Set<String> source) {
        Set<String> copy = new LinkedHashSet<>(source);
        return Collections.unmodifiableSet(copy);
    }

    /**
     * 登记任务编号并创建 Java 8 发布快照。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        Set<String> draftTaskIds = new LinkedHashSet<>();
        boolean first = draftTaskIds.add("TF-302");
        boolean duplicate = draftTaskIds.add("TF-302");
        draftTaskIds.add("TF-101");
        draftTaskIds.add("TF-202");

        Set<String> publishedTaskIds = copyAsUnmodifiable(draftTaskIds);
        draftTaskIds.add("TF-404");

        System.out.println("首次登记：" + first);
        System.out.println("重复登记：" + duplicate);
        System.out.println("草稿数量：" + draftTaskIds.size());
        System.out.println("发布快照数量：" + publishedTaskIds.size());
        System.out.println("发布快照包含 TF-202：" + publishedTaskIds.contains("TF-202"));
        System.out.println("草稿登记顺序：" + draftTaskIds);
    }
}
```

在 IntelliJ IDEA 中把 Project SDK 改为已安装的 Java 8，再运行 `TeamFlowSetApplicationJava8`；终端版本可以
执行 `javac TeamFlowSetApplicationJava8.java` 与 `java TeamFlowSetApplicationJava8`。预期输出与 JDK 25 版本
完全一致，说明这里替换的是工厂 API，不是 Set 的唯一性合同：

```text
首次登记：true
重复登记：false
草稿数量：4
发布快照数量：3
发布快照包含 TF-202：true
草稿登记顺序：[TF-302, TF-101, TF-202, TF-404]
```

## 五、易错点

**社区补充：** 社区问答中最常见的 Set 误判是把一次运行中观察到的 HashSet 顺序当成稳定合同，或让
TreeSet 比较器在相等位置返回 `0`、却没有把业务唯一键纳入比较。下面的每个结论都已回到 Java SE 25
Set/HashSet/TreeSet API 核验；社区案例只用于展示触发方式。

:::pitfalls
### 把 Set 当成有索引的 List

**现象：** 尝试调用 `taskIds.get(0)`，编译器提示 `Set` 没有 `get` 方法。

**触发条件：** 需要判断成员是否存在，却仍按上一课的 List 索引思路访问集合。

**原因：** Set 的合同只保证成员资格和唯一性，不定义第一个、第二个成员的位置。

**后果：** 代码无法编译；即使改成依赖打印顺序，也会把无顺序实现的偶然结果写进业务逻辑。

**错误示例：**

```java
Set<String> taskIds = new HashSet<>();
taskIds.add("TF-101");
System.out.println(taskIds.get(0));
```

**正确写法：**

```java
Set<String> taskIds = new HashSet<>();
taskIds.add("TF-101");
System.out.println(taskIds.contains("TF-101"));
```

**影响版本：** JDK 25 与 Java 8 都适用。

**验证方式：** 错误示例在任一版本编译失败；正确示例输出 `true`。

### 依赖 HashSet 的显示顺序

**现象：** 本地打印 HashSet 时看起来总是同一顺序，但换数据量或运行环境后，日志顺序改变，快照测试失败。

**触发条件：** 把当前实现的观察结果误写成 HashSet 的 API 合同。

**原因：** HashSet 不保证迭代顺序，哈希桶、容量和实现细节都不是调用方可依赖的顺序规则。

**后果：** 展示、导出、测试或签名输入出现不稳定差异；问题可能只在扩容或更换 JDK 后暴露。

**错误示例：**

```java
Set<String> taskIds = new HashSet<>();
taskIds.add("TF-302");
taskIds.add("TF-101");
String firstPrintedId = taskIds.iterator().next();
```

**正确写法：**

```java
Set<String> taskIds = new LinkedHashSet<>();
taskIds.add("TF-302");
taskIds.add("TF-101");
String firstInsertedId = taskIds.iterator().next();
```

**影响版本：** JDK 25 与 Java 8 都不允许依赖 HashSet 顺序。

**验证方式：** 使用相同元素分别构造 HashSet 与 LinkedHashSet，断言只有后者的迭代结果符合插入顺序合同。

### 加入 Set 后改变影响 equals 的字段

**现象：** 对象已经加入 HashSet，修改它的编号后，`contains` 返回 `false`，甚至 `remove` 也无法找到它。

**触发条件：** Set 元素的 `equals` 或 `hashCode` 依赖可变字段，加入后又调用 setter 或其他修改方法。

**原因：** 元素原来被放在旧哈希位置；字段变化后，查询按新哈希寻找，集合内部位置没有自动重排。

**后果：** 元素仍占据集合空间，却无法按当前值可靠查询或删除，集合状态与业务认知背离。

**错误示例：**

```java
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

Set<List<String>> tasks = new HashSet<>();
List<String> task = new ArrayList<>();
task.add("TF-101");
tasks.add(task);
task.set(0, "TF-202");
System.out.println(tasks.contains(task));
```

**正确写法：**

```java
Set<String> taskIds = new HashSet<>();
taskIds.add("TF-101");
taskIds.remove("TF-101");
taskIds.add("TF-202");
System.out.println(taskIds.contains("TF-202"));
```

**影响版本：** JDK 25 与 Java 8 的 Set API 都要求避免这种改变；这里用可变 `List` 作为 Set 元素复现同一边界。

**验证方式：** 使用不可变编号或“先删除旧值、再加入新值”的方式，分别验证 `contains` 和 `remove` 能找到新成员。

### 让 TreeSet 接收没有比较规则的对象

**现象：** 第一次加入自定义对象时抛出 `ClassCastException`，或 TreeSet 无法决定元素位置。

**触发条件：** 元素没有实现自然比较，也没有在构造 TreeSet 时传入 Comparator。

**原因：** TreeSet 必须比较新元素与已有元素，普通 Object 没有可用于排序的通用关系。

**后果：** 插入在运行时失败；如果错误地把 TreeSet 当成只负责去重的 HashSet，故障会出现在业务路径上。

**错误示例：**

```java
Set<Object> taskKeys = new TreeSet<>();
taskKeys.add(new Object());
```

**正确写法：**

```java
Set<String> taskIds = new TreeSet<>();
taskIds.add("TF-101");
taskIds.add("TF-202");
System.out.println(taskIds);
```

**影响版本：** JDK 25 与 Java 8 都适用；自定义比较器的完整设计留给排序课程。

**验证方式：** 用没有比较规则的自定义对象复现 `ClassCastException`，再用字符串自然顺序版本确认输出按升序排列。

### TreeSet 比较器忽略业务唯一键

**现象：** 两个任务编号不同，但加入 TreeSet 后数量没有增加；按编号查找或删除时也可能得到意外结果。

**触发条件：** Comparator 忽略了用于区分元素的信息，对两个不同任务编号也返回 `0`。

**原因：** TreeSet 把比较结果为 `0` 视为同一排序位置；它不能再根据 equals 自动保留第二个对象。

**后果：** 数据被静默去重，或者搜索路径因不满足稳定、传递和相容合同而表现异常。

**错误示例：**

```java
Set<String> taskIds = new TreeSet<>((left, right) -> 0);
taskIds.add("TF-101");
taskIds.add("TF-202");
System.out.println("错误集合数量：" + taskIds.size());
```

**正确写法：**

```java
Set<String> taskIds = new TreeSet<>();
taskIds.add("TF-101");
taskIds.add("TF-202");
System.out.println("正确集合数量：" + taskIds.size());
```

**影响版本：** JDK 25 与 Java 8 都适用；比较器与业务相等性的完整取舍留给排序课程。

**验证方式：** 错误示例输出 `错误集合数量：1`；正确示例输出 `正确集合数量：2`，说明比较规则必须能区分
仍需共存的元素。

### 把 Set.of 当成可变集合或传入重复值

**现象：** 调用 `add` 或 `remove` 时抛出 `UnsupportedOperationException`，`Set.of` 创建时传入 `null` 或重复值时抛出异常。

**触发条件：** 把 JDK 25 的固定集合工厂误当成 `HashSet` 构造器，或把 `Set.of` 与 `Set.copyOf` 的重复输入规则混为一谈。

**原因：** `Set.of` 创建不可修改集合，禁止 `null`，并在创建阶段拒绝重复元素；`Set.copyOf` 虽然也不可修改，但对重复输入只保留一个。

**后果：** 程序在配置初始化或请求处理路径中失败，错误被误判为 Set 的随机行为。

**错误示例：**

```java
try {
    Set.of("owner", "owner");
} catch (IllegalArgumentException error) {
    System.out.println("重复值：" + error.getClass().getSimpleName());
}

Set<String> fixedRoles = Set.of("owner", "reviewer");
try {
    fixedRoles.add("tester");
} catch (UnsupportedOperationException error) {
    System.out.println("修改固定集合：" + error.getClass().getSimpleName());
}
```

**正确写法：**

```java
Set<String> roles = new LinkedHashSet<>();
roles.add("owner");
roles.add("reviewer");
System.out.println("角色数量：" + roles.size());
```

**影响版本：** `Set.of` 是 Java 9+ API；Java 8 代码应使用可变 Set 或复制后包装的只读集合。

**验证方式：** JDK 25 运行错误示例，依次输出 `重复值：IllegalArgumentException` 和
`修改固定集合：UnsupportedOperationException`；正确示例输出 `角色数量：2`。Java 8 编译 `Set.of` 应失败。
:::

## 六、练习：登记唯一任务编号

:::exercise
### TeamFlow 唯一登记

**要求：** 创建一个 `TeamFlowUniqueTasks` 类。使用 `LinkedHashSet<String>` 登记
`TF-101`、`TF-202`、重复的 `TF-101` 和 `TF-303`；输出重复加入的返回值、登记数量、是否包含 `TF-202`，
然后删除 `TF-202` 并输出删除结果和删除后的数量。最后创建一个固定成员集合，确认源集合后续新增不会改变
发布副本。JDK 25 使用 `Set.copyOf`；Java 8 使用复制后 `Collections.unmodifiableSet` 的完整兼容写法。

**验收：** 两个版本都能独立编译运行，逐行输出“重复加入：false”“登记数量：3”“包含 TF-202：true”“删除 TF-202：true”
“删除后数量：2”“发布副本数量：2”“草稿数量：3”。
:::

### 1. JDK 25 参考实现

```java
import java.util.LinkedHashSet;
import java.util.Set;

/** 完成 TeamFlow 唯一任务登记练习。 */
public class TeamFlowUniqueTasks {
    /**
     * 登记任务并创建发布副本。
     *
     * @param args 启动参数，本练习不使用
     */
    public static void main(String[] args) {
        Set<String> draft = new LinkedHashSet<>();
        draft.add("TF-101");
        draft.add("TF-202");
        boolean duplicateAdded = draft.add("TF-101");
        draft.add("TF-303");

        System.out.println("重复加入：" + duplicateAdded);
        System.out.println("登记数量：" + draft.size());
        System.out.println("包含 TF-202：" + draft.contains("TF-202"));
        System.out.println("删除 TF-202：" + draft.remove("TF-202"));
        System.out.println("删除后数量：" + draft.size());

        Set<String> published = Set.copyOf(draft);
        draft.add("TF-404");
        System.out.println("发布副本数量：" + published.size());
        System.out.println("草稿数量：" + draft.size());
    }
}
```

### 2. Java 8 参考实现

```java
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Set;

/** 完成 Java 8 兼容的 TeamFlow 唯一任务登记练习。 */
public class TeamFlowUniqueTasksJava8 {
    /**
     * 复制 Set 并包装为不可修改副本。
     *
     * @param source 发布时的草稿集合
     * @return 独立的只读副本
     */
    private static Set<String> copyAsUnmodifiable(Set<String> source) {
        return Collections.unmodifiableSet(new LinkedHashSet<>(source));
    }

    /**
     * 登记任务并创建 Java 8 发布副本。
     *
     * @param args 启动参数，本练习不使用
     */
    public static void main(String[] args) {
        Set<String> draft = new LinkedHashSet<>();
        draft.add("TF-101");
        draft.add("TF-202");
        boolean duplicateAdded = draft.add("TF-101");
        draft.add("TF-303");

        System.out.println("重复加入：" + duplicateAdded);
        System.out.println("登记数量：" + draft.size());
        System.out.println("包含 TF-202：" + draft.contains("TF-202"));
        System.out.println("删除 TF-202：" + draft.remove("TF-202"));
        System.out.println("删除后数量：" + draft.size());

        Set<String> published = copyAsUnmodifiable(draft);
        draft.add("TF-404");
        System.out.println("发布副本数量：" + published.size());
        System.out.println("草稿数量：" + draft.size());
    }
}
```

两个版本的预期输出完全一致：

```text
重复加入：false
登记数量：3
包含 TF-202：true
删除 TF-202：true
删除后数量：2
发布副本数量：2
草稿数量：3
```

练习的关键不是把编号打印出来，而是验证三条合同：重复加入不会增加数量，删除返回值反映成员是否存在，
发布副本在草稿继续加入 `TF-404` 后仍然保持两项。Java 8 的变化只在不可修改副本创建 API，Set 的成员资格
行为和 `LinkedHashSet` 的插入顺序没有变化。
