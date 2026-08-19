---
id: backend.java.learn.basics.maps-and-key-value-associations
type: lesson
title: Map
summary: 用 Map 建立 TeamFlow 任务编号与业务信息的关联，并根据顺序、排序和可修改边界选择合适实现
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 100
prerequisites:
  - backend.java.learn.basics.sets-and-uniqueness
objectives:
  - 能说明 Map 中键唯一、值可重复以及键值关联的含义。
  - 能使用 put、get、containsKey、remove 和 size 管理任务映射。
  - 能区分缺失键与显式映射到 null 的键。
  - 能根据顺序要求选择 HashMap、LinkedHashMap 和 TreeMap。
  - 能识别重复键覆盖、可变键、比较规则和顺序假设带来的错误。
  - 能区分 Map.of、Map.copyOf 与 Collections.unmodifiableMap 的版本和语义。
  - 能在 JDK 25 与 Java 8 中分别运行完整的 TeamFlow Map 程序。
recap:
  - Map 让每个键最多关联一个值；不同键可以关联相同值，重复 put 会替换旧值。
  - get 返回 null 不能独自证明键不存在；允许 null 值时应使用 containsKey 区分两种状态。
  - HashMap 不承诺顺序，LinkedHashMap 保留插入顺序，TreeMap 按键的自然顺序或比较规则排序。
  - 键驻留在 Map 期间不应改变参与 equals 或 hashCode 的状态。
  - Map.of 与 Map.ofEntries 从 Java 9 提供，Map.copyOf 从 Java 10 提供；Java 8 没有这些 API。
  - Collections.unmodifiableMap 直接包装源 Map 得到的是只读视图，先复制再包装才是与源结构隔离的 Java 8 写法。
related: []
tags:
  - Java
  - Map
  - HashMap
  - LinkedHashMap
  - TreeMap
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 使用共同的 Map 操作和复制后 Collections.unmodifiableMap 兼容写法
verifiedAt: 2026-08-17
sources:
  - id: java-25-map
    title: Java SE 25 API - Map
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - Map 的键唯一和值可重复合同
      - put、get、containsKey、remove 和 size 的返回语义
      - get 返回 null 时存在缺失键与显式 null 值歧义
      - 修改影响 equals 的键状态会使 Map 行为未指定
      - Map.of、Map.ofEntries 与 Map.copyOf 的不可修改、null、重复键和顺序边界
  - id: java-25-hashmap
    title: Java SE 25 API - HashMap
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashMap.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - HashMap 允许一个 null 键和多个 null 值
      - HashMap 不保证映射顺序
  - id: java-25-linkedhashmap
    title: Java SE 25 API - LinkedHashMap
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/LinkedHashMap.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - LinkedHashMap 通常按键的首次插入顺序维持可预测顺序
      - 普通 put 更新已有键不会改变其插入顺序位置
  - id: java-25-treemap
    title: Java SE 25 API - TreeMap
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/TreeMap.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - TreeMap 按键的自然顺序或 Comparator 排序
      - 比较结果为 0 的键会被 TreeMap 视为同一键
      - 排序规则应与 equals 一致以满足普通 Map 合同
  - id: dev-java-maps
    title: Using Maps to Store Key Value Pairs - Dev.java
    url: https://dev.java/learn/api/collections-framework/maps/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Dev.java Collections Framework 教程；2026-08-17 核验
    claims:
      - Map 的键值关联与常用操作
      - Map.of 最多直接接收十组键值，更多条目使用 Map.ofEntries
      - 固定 Map 工厂拒绝 null 和重复键
  - id: dev-java-choosing-map-keys
    title: Choosing Immutable Types for Your Key - Dev.java
    url: https://dev.java/learn/api/collections-framework/choosing-keys/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Dev.java Collections Framework 教程；2026-08-17 核验
    claims:
      - 修改参与 equals 或 hashCode 的键状态可能让映射无法再被找到
      - 不可修改的键更适合长期作为 Map 键
  - id: java-8-map
    title: Java SE 8 API - Map
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Map.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 已提供本课使用的基本 Map 操作和 null 歧义合同
      - Java 8 的 Map 接口没有 of、ofEntries、entry 和 copyOf
  - id: java-8-collections
    title: Java SE 8 API - Collections
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Collections.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Collections.unmodifiableMap 返回会读穿到底层 Map 的不可修改视图
  - id: java-10-map
    title: Java SE 10 API - Map
    url: https://docs.oracle.com/javase/10/docs/api/java/util/Map.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 10 及以上
    claims:
      - Map.copyOf 从 Java 10 提供不可修改副本
      - 源 Map 后续结构变化不会反映到 Map.copyOf 的结果
  - id: stackoverflow-map-null-ambiguity
    title: Is using java Map.containsKey redundant when using map.get
    url: https://stackoverflow.com/questions/14601016/is-using-java-map-containskey-redundant-when-using-map-get
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 与 JDK 25；结论已与两个版本的 Map API 核验
    claims:
      - 初学者容易把 get 返回 null 直接解释为键不存在
  - id: stackoverflow-mutable-hashmap-key
    title: Mutation of the keys in HashMap causes wrong results
    url: https://stackoverflow.com/questions/45977296/mutation-of-the-keys-in-hashmap-causes-wrong-results
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 与 JDK 25；失败条件已与官方键合同和可执行探针核验
    claims:
      - 修改参与 equals 或 hashCode 的键状态会造成已存映射查找异常
  - id: stackoverflow-hashmap-order
    title: Java HashMap iteration order behavior seems consistent despite documentation stating otherwise
    url: https://stackoverflow.com/questions/79218335/java-hashmap-iteration-order-behavior-seems-consistent-despite-documentation-s
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 与 JDK 25；顺序结论已与 HashMap API 核验
    claims:
      - 一次或多次观察到相同顺序不代表 HashMap 提供顺序合同
  - id: stackoverflow-duplicate-hashmap-key
    title: What happens when a duplicate key is put into a HashMap
    url: https://stackoverflow.com/questions/1669885/what-happens-when-a-duplicate-key-is-put-into-a-hashmap
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 与 JDK 25；覆盖行为已与 Map API 核验
    claims:
      - 初学者容易误以为同一键可以通过重复 put 保留多个值
---

# Map

TeamFlow 已经能用 Set 登记不重复的任务编号，但编号本身还不能回答“这项任务叫什么”或“由谁负责”。当程序
需要从一个唯一标识找到对应信息时，适合使用 `Map`：键像查询入口，值是通过这个入口取得的业务信息。

本课只建立键到值的关联，使用 `put`、`get`、`containsKey`、`remove` 和 `size` 完成最小增查改删。完整
遍历与安全删除、复杂比较器、Stream、并发 Map、Spring、HTTP 和数据库都留在本课之外。

## 一、先建立键值关联

### 1. 键唯一，值可以重复

`Map<K, V>` 中的 `K` 是键类型，`V` 是值类型。一个键最多关联一个值，因此 `TF-101` 不能同时占据两条
独立映射；不同键可以拥有相同值，例如两个任务都可以由“林青”负责。Map 也没有“第 0 项对应什么值”的
位置查询，它回答的是“这个键当前关联什么值”。

```java
import java.util.HashMap;
import java.util.Map;

/** 演示 Map 中键唯一而值可以重复。 */
public class MapAssociationDemo {
    /**
     * 建立任务编号到负责人的关联。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        Map<String, String> taskOwners = new HashMap<>();
        taskOwners.put("TF-101", "林青");
        taskOwners.put("TF-202", "林青");

        System.out.println("任务数量：" + taskOwners.size());
        System.out.println("TF-101 负责人：" + taskOwners.get("TF-101"));
        System.out.println("TF-202 负责人：" + taskOwners.get("TF-202"));
    }
}
```

预期输出：

```text
任务数量：2
TF-101 负责人：林青
TF-202 负责人：林青
```

两个键不同，所以 `size()` 是 `2`；值相同不会触发去重。这里的 `size()` 统计键值映射数量，不是不同值的
数量。

### 2. 五个基本操作围绕键工作

`put(key, value)` 新建或更新关联，`get(key)` 按键取值，`containsKey(key)` 判断键是否存在，
`remove(key)` 删除关联，`size()` 返回当前映射数量。`put` 和 `remove` 都会返回旧值，因此程序可以观察
“更新前是什么”或“实际删掉了什么”。

```java
import java.util.LinkedHashMap;
import java.util.Map;

/** 演示 Map 的五个基本操作。 */
public class MapOperationsDemo {
    /**
     * 新建、查询、更新并删除任务映射。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        Map<String, String> taskTitles = new LinkedHashMap<>();
        String firstPrevious = taskTitles.put("TF-101", "整理需求");
        taskTitles.put("TF-202", "实现登录");
        String replacedTitle = taskTitles.put("TF-101", "确认需求");

        System.out.println("首次放入的旧值：" + firstPrevious);
        System.out.println("覆盖前标题：" + replacedTitle);
        System.out.println("当前标题：" + taskTitles.get("TF-101"));
        System.out.println("包含 TF-202：" + taskTitles.containsKey("TF-202"));
        System.out.println("删除的标题：" + taskTitles.remove("TF-202"));
        System.out.println("剩余数量：" + taskTitles.size());
    }
}
```

预期输出：

```text
首次放入的旧值：null
覆盖前标题：整理需求
当前标题：确认需求
包含 TF-202：true
删除的标题：实现登录
剩余数量：1
```

第一次 `put` 没有可返回的旧关联，所以返回 `null`。第二次对 `TF-101` 调用 `put` 时，键没有增加，旧值
“整理需求”被“确认需求”替换。删除 `TF-202` 后只剩一条映射。

### 3. get 返回 null 不一定表示键不存在

`HashMap` 允许值为 `null`，因此下面两种状态调用 `get` 都会得到 `null`：键根本不存在，或者键存在但
明确映射到 `null`。只有 `containsKey` 能在这个前提下区分它们。

```java
import java.util.HashMap;
import java.util.Map;

/** 演示缺失键与 null 值的区别。 */
public class MapNullLookupDemo {
    /**
     * 分别查询显式 null 值和缺失键。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        Map<String, String> taskOwners = new HashMap<>();
        taskOwners.put("TF-101", null);

        System.out.println("TF-101 取值为 null：" + (taskOwners.get("TF-101") == null));
        System.out.println("TF-101 键存在：" + taskOwners.containsKey("TF-101"));
        System.out.println("TF-999 取值为 null：" + (taskOwners.get("TF-999") == null));
        System.out.println("TF-999 键存在：" + taskOwners.containsKey("TF-999"));
    }
}
```

预期输出：

```text
TF-101 取值为 null：true
TF-101 键存在：true
TF-999 取值为 null：true
TF-999 键存在：false
```

业务代码通常可以直接禁止 `null` 值，让状态更简单；但只要所选 Map 实现允许 `null`，就不能把
`get(key) == null` 单独当成存在性判断。`remove` 返回 `null` 时也有相同歧义，必要时应先核对键是否存在。

### 4. 键的匹配依赖 equals 与 hashCode 合同

HashMap 不是按变量名或对象地址查找业务键。两个键按 `equals` 相等时，它们代表同一个 Map 键；相等对象还
必须拥有相同的 `hashCode`。字符串已经正确实现这两个合同，所以内容相同的两个字符串能命中同一关联。

```java
import java.util.HashMap;
import java.util.Map;

/** 演示内容相同的字符串命中同一个 Map 键。 */
public class MapKeyContractDemo {
    /**
     * 使用两个不同字符串对象写入并查询同一任务编号。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        Map<String, String> taskTitles = new HashMap<>();
        String storedKey = new String("TF-101");
        String lookupKey = new String("TF-101");

        taskTitles.put(storedKey, "整理需求");
        System.out.println("是同一个对象：" + (storedKey == lookupKey));
        System.out.println("内容相等：" + storedKey.equals(lookupKey));
        System.out.println("查询标题：" + taskTitles.get(lookupKey));
    }
}
```

输出依次是 `false`、`true` 和 `查询标题：整理需求`。这说明 Map 的业务键合同来自 `equals`，而不是要求查询
时必须持有原来的同一个对象。自定义键的 `equals` 与 `hashCode` 设计已经在前置课程建立，本课只强调：键
放入 Map 后，不要修改参与这两个合同的状态。

## 二、根据顺序要求选择实现

### 1. HashMap 只承诺键值查找

当业务只需要按键查询，不需要展示顺序时，通常先考虑 `HashMap`。它允许一个 `null` 键和多个 `null` 值，
但不保证映射顺序，也不保证当前观察到的顺序以后保持不变。

```java
Map<String, String> taskTitles = new HashMap<>();
taskTitles.put("TF-302", "发布版本");
taskTitles.put("TF-101", "整理需求");
System.out.println("包含 TF-101：" + taskTitles.containsKey("TF-101"));
System.out.println("任务数量：" + taskTitles.size());
```

这里可以稳定期待 `true` 和 `2`，不能稳定期待打印整个 HashMap 时谁排在前面。顺序不是 HashMap 的调用合同。

### 2. LinkedHashMap 保留插入顺序

当 TeamFlow 需要按首次登记顺序展示键值时，可以选择 `LinkedHashMap`。默认情况下，它通常保留键的插入
顺序；用普通 `put` 更新已有键只替换值，不会把这个键移动到末尾。

```java
Map<String, String> taskTitles = new LinkedHashMap<>();
taskTitles.put("TF-302", "准备发布");
taskTitles.put("TF-101", "整理需求");
taskTitles.put("TF-302", "完成发布");
System.out.println(taskTitles);
```

预期输出是 `{TF-302=完成发布, TF-101=整理需求}`。`TF-302` 的值已更新，但它仍处在首次插入的位置。

### 3. TreeMap 按键排序

当结果需要按键的自然顺序排列时，可以使用 `TreeMap`。字符串具备自然顺序，因此下面的任务编号会按
`TF-101`、`TF-202`、`TF-302` 排列。

```java
Map<String, String> taskTitles = new TreeMap<>();
taskTitles.put("TF-302", "准备发布");
taskTitles.put("TF-101", "整理需求");
taskTitles.put("TF-202", "实现登录");
System.out.println(taskTitles);
```

预期输出是 `{TF-101=整理需求, TF-202=实现登录, TF-302=准备发布}`。TreeMap 也可以接收 Comparator，但
比较结果为 `0` 的两个键会被视为同一个键。完整比较器设计留给排序课程，本课只用自然可比较的字符串键。

### 4. 变量声明使用 Map 接口

左侧写 `Map<String, String>`，右侧根据合同选择实现，能让代码明确依赖的是键值操作，而不是某个实现的
额外能力。

```java
Map<String, String> lookupTable = new HashMap<>();
Map<String, String> insertionOrdered = new LinkedHashMap<>();
Map<String, String> keySorted = new TreeMap<>();
```

三者都能使用本课的五个基本操作。选择标准不是“哪个更高级”，而是业务是否要求插入顺序或键排序。

## 三、建立不可修改边界

### 1. Map.of 与 Map.ofEntries 创建固定映射

JDK 25 可以用 `Map.of` 创建不超过十组的固定键值，用 `Map.ofEntries` 表达更多条目或逐项组织映射。这些
工厂从 Java 9 开始提供，结果不可修改，拒绝 `null` 键、`null` 值和重复键，也不承诺迭代顺序。

```java
import java.util.Map;

/** 演示 JDK 25 的固定 Map 工厂。 */
public class FixedMapDemo {
    /**
     * 创建 TeamFlow 的固定状态与标题映射。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        Map<String, String> statusNames = Map.of(
                "TODO", "待处理",
                "DONE", "已完成"
        );
        Map<String, String> taskTitles = Map.ofEntries(
                Map.entry("TF-101", "整理需求"),
                Map.entry("TF-202", "实现登录"),
                Map.entry("TF-302", "准备发布")
        );

        System.out.println("TODO 中文名：" + statusNames.get("TODO"));
        System.out.println("TF-202 标题：" + taskTitles.get("TF-202"));
        System.out.println("固定任务数量：" + taskTitles.size());
    }
}
```

预期输出依次是 `TODO 中文名：待处理`、`TF-202 标题：实现登录` 和 `固定任务数量：3`。示例按键查询，
没有依赖固定 Map 未承诺的显示顺序。超过十组键值时应使用 `Map.ofEntries(Map.entry(...), ...)`，而不是寻找
不存在的第十一个 `Map.of` 重载。

### 2. Map.copyOf 创建结构快照

`Map.copyOf(source)` 从 Java 10 开始提供。它读取调用时的键值建立不可修改 Map；源 Map 后续增加、删除或
替换映射，不会改变已经得到的结果。它不是深拷贝：如果键或值对象本身可变，对象内部状态仍可能变化。

```java
import java.util.LinkedHashMap;
import java.util.Map;

/** 演示 Map.copyOf 的结构快照语义。 */
public class MapCopyDemo {
    /**
     * 发布任务映射后继续修改草稿。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        Map<String, String> draft = new LinkedHashMap<>();
        draft.put("TF-101", "整理需求");

        Map<String, String> published = Map.copyOf(draft);
        draft.put("TF-202", "实现登录");

        System.out.println("发布副本数量：" + published.size());
        System.out.println("草稿数量：" + draft.size());
        System.out.println("发布副本包含 TF-202：" + published.containsKey("TF-202"));
    }
}
```

预期输出为 `1`、`2` 和 `false`。`published` 与源结构隔离，但 Map.copyOf 不承诺保留源 Map 的具体实现或
顺序；需要按键读取时应直接调用 `get`，需要插入顺序时应继续明确使用 `LinkedHashMap`。

### 3. Java 8 使用复制后再包装

Java 8 没有 `Map.of`、`Map.ofEntries`、`Map.entry` 和 `Map.copyOf`。它可以先创建普通 Map，再复制到新的
`LinkedHashMap`，最后用 `Collections.unmodifiableMap` 包装。关键是“先复制”：直接包装源 Map 只会得到
读穿到底层 Map 的只读视图。

```java
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

/** 演示 Java 8 的不可修改 Map 副本写法。 */
public class FixedMapJava8Demo {
    /**
     * 复制草稿并包装为与源结构隔离的只读 Map。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        Map<String, String> draft = new LinkedHashMap<>();
        draft.put("TF-101", "整理需求");

        Map<String, String> published = Collections.unmodifiableMap(
                new LinkedHashMap<>(draft)
        );
        draft.put("TF-202", "实现登录");

        System.out.println("发布副本数量：" + published.size());
        System.out.println("草稿数量：" + draft.size());
        System.out.println("发布副本包含 TF-202：" + published.containsKey("TF-202"));
    }
}
```

Java 8 版本也输出 `1`、`2` 和 `false`。基本 Map 操作在 Java 8 与 JDK 25 中相同，真实差异只出现在固定
工厂和不可修改副本 API。

## 四、完整 TeamFlow 程序

### 1. JDK 25 版本

下面的程序把本课步骤连成一条可观察路径：登记任务负责人，覆盖已有键，按键查询并删除，然后发布不可修改
快照。它不遍历 Map，也不引入后续课程的业务结构。

```java
import java.util.LinkedHashMap;
import java.util.Map;

/** 管理 TeamFlow 任务编号与负责人的关联。 */
public class TeamFlowTaskDirectory {
    /**
     * 登记、更新、查询、删除并发布任务负责人映射。
     *
     * @param args 启动参数，本程序不使用
     */
    public static void main(String[] args) {
        Map<String, String> draftOwners = new LinkedHashMap<>();
        draftOwners.put("TF-101", "余敏");
        draftOwners.put("TF-202", "周航");

        String previousOwner = draftOwners.put("TF-101", "林青");
        System.out.println("覆盖前负责人：" + previousOwner);
        System.out.println("TF-101 当前负责人：" + draftOwners.get("TF-101"));
        System.out.println("包含 TF-202：" + draftOwners.containsKey("TF-202"));

        String removedOwner = draftOwners.remove("TF-202");
        System.out.println("删除的负责人：" + removedOwner);
        System.out.println("删除后任务数：" + draftOwners.size());

        Map<String, String> publishedOwners = Map.copyOf(draftOwners);
        draftOwners.put("TF-303", "陈晨");
        System.out.println("发布版 TF-101：" + publishedOwners.get("TF-101"));
        System.out.println("发布版任务数：" + publishedOwners.size());
        System.out.println("草稿任务数：" + draftOwners.size());
    }
}
```

### 2. Java 8 版本

Java 8 使用相同的键值操作，只把发布快照改成“复制后 `Collections.unmodifiableMap`”。代码完整独立，不能
与 JDK 25 源文件混在同一个 public 类中。

```java
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

/** 管理 Java 8 兼容的 TeamFlow 任务负责人映射。 */
public class TeamFlowTaskDirectoryJava8 {
    /**
     * 登记、更新、查询、删除并发布 Java 8 任务负责人映射。
     *
     * @param args 启动参数，本程序不使用
     */
    public static void main(String[] args) {
        Map<String, String> draftOwners = new LinkedHashMap<>();
        draftOwners.put("TF-101", "余敏");
        draftOwners.put("TF-202", "周航");

        String previousOwner = draftOwners.put("TF-101", "林青");
        System.out.println("覆盖前负责人：" + previousOwner);
        System.out.println("TF-101 当前负责人：" + draftOwners.get("TF-101"));
        System.out.println("包含 TF-202：" + draftOwners.containsKey("TF-202"));

        String removedOwner = draftOwners.remove("TF-202");
        System.out.println("删除的负责人：" + removedOwner);
        System.out.println("删除后任务数：" + draftOwners.size());

        Map<String, String> publishedOwners = Collections.unmodifiableMap(
                new LinkedHashMap<>(draftOwners)
        );
        draftOwners.put("TF-303", "陈晨");
        System.out.println("发布版 TF-101：" + publishedOwners.get("TF-101"));
        System.out.println("发布版任务数：" + publishedOwners.size());
        System.out.println("草稿任务数：" + draftOwners.size());
    }
}
```

### 3. 运行结果与执行过程

把两个类分别放进同名 `.java` 文件，在 IDEA 中选择对应项目 JDK 后运行各自的 `main`。两个版本的预期
控制台输出完全一致：

```text
覆盖前负责人：余敏
TF-101 当前负责人：林青
包含 TF-202：true
删除的负责人：周航
删除后任务数：1
发布版 TF-101：林青
发布版任务数：1
草稿任务数：2
```

前两次 `put` 建立两条映射，第三次 `put` 命中已有键，所以返回“余敏”并把当前值换成“林青”。删除
`TF-202` 后草稿只剩 `TF-101`。发布副本在这一刻记录一条映射，随后草稿加入 `TF-303`，发布副本数量仍是
`1`，说明两个版本都建立了结构快照。

## 五、易错点

**社区补充：** Stack Overflow 的真实问题集中反映了四种误解：把 `get` 的 `null` 当成键必然缺失、认为
重复 `put` 能保留多个值、依赖 HashMap 的一次观察顺序，以及修改已经作为 HashMap 键的状态。这些案例适用
于 Java 8 与 JDK 25；下面的技术结论和结果均已回到官方 API 并用对应输入核验。

下面集中列出七个典型错误。每项只建立本课所需的最小反馈，不扩展为集合遍历或完整错误诊断课程。

:::pitfalls
### 把 get 返回 null 直接解释为键不存在

**现象：** `TF-101` 已登记，但程序仍打印“任务不存在”。

**触发条件：** HashMap 明确保存了值为 `null` 的 `TF-101`，代码只检查 `get("TF-101") == null`。

**原因：** 对允许 null 值的 Map，缺失键和显式 null 值都会让 `get` 返回 `null`。

**后果：** 已存在的任务被误判为缺失，新增、权限或状态逻辑可能走错分支。

**错误示例：**

```java
Map<String, String> taskOwners = new HashMap<>();
taskOwners.put("TF-101", null);
System.out.println("任务不存在：" + (taskOwners.get("TF-101") == null));
```

**正确写法：**

```java
Map<String, String> taskOwners = new HashMap<>();
taskOwners.put("TF-101", null);
System.out.println("任务存在：" + taskOwners.containsKey("TF-101"));
```

**影响版本：** JDK 25 与 Java 8 都适用。

**验证方式：** 同一输入下，错误示例输出 `任务不存在：true`，正确示例输出 `任务存在：true`；两行同时成立，
证明不能用 get 的 null 结果替代 containsKey。

### 误以为重复 put 会保留两个值

**现象：** 连续给 `TF-101` 放入两个标题后，Map 数量仍是 `1`，旧标题也无法再通过该键取得。

**触发条件：** 把 Map 当成“一个键可保存多个值”的容器，忽略 `put` 的替换合同和返回值。

**原因：** 一个键最多关联一个当前值；重复 `put` 会替换旧值，并返回被替换的值。

**后果：** 旧数据被覆盖，程序却仍按两条记录计算数量或生成结果。

**错误示例：**

```java
Map<String, String> taskTitles = new HashMap<>();
taskTitles.put("TF-101", "整理需求");
taskTitles.put("TF-101", "实现登录");
System.out.println("错误预期数量：" + taskTitles.size());
```

**正确写法：**

```java
Map<String, String> taskTitles = new HashMap<>();
taskTitles.put("TF-101", "整理需求");
String previousTitle = taskTitles.put("TF-101", "实现登录");
System.out.println("覆盖前标题：" + previousTitle);
System.out.println("当前数量：" + taskTitles.size());
```

**影响版本：** JDK 25 与 Java 8 都适用。

**验证方式：** 错误示例实际输出 `错误预期数量：1`；正确示例输出 `覆盖前标题：整理需求` 和
`当前数量：1`，与同一键的覆盖合同一致。

### 依赖 HashMap 的显示顺序

**现象：** 本机日志看起来按插入顺序显示，换数据或 JDK 后顺序变化。

**触发条件：** 把一次打印结果当成 HashMap 的保证，并据此编写展示或断言。

**原因：** HashMap 不提供映射顺序合同；当前实现细节造成的稳定外观不等于 API 承诺。

**后果：** 展示、导出或测试产生不稳定结果，问题可能直到数据增长后才暴露。

**错误示例：**

```java
Map<String, String> taskTitles = new HashMap<>();
taskTitles.put("TF-302", "准备发布");
taskTitles.put("TF-101", "整理需求");
System.out.println(taskTitles);
```

**正确写法：**

```java
Map<String, String> taskTitles = new LinkedHashMap<>();
taskTitles.put("TF-302", "准备发布");
taskTitles.put("TF-101", "整理需求");
System.out.println(taskTitles);
```

**影响版本：** JDK 25 与 Java 8 的 HashMap 都不保证顺序，LinkedHashMap 都提供插入顺序合同。

**验证方式：** 不为错误示例声明固定顺序；正确示例稳定输出
`{TF-302=准备发布, TF-101=整理需求}`，验证的对象是 LinkedHashMap 而不是 HashMap。

### 放入 HashMap 后修改键的相等状态

**现象：** Map 的 `size()` 仍是 `1`，但用已经修改过的键调用 `get` 或 `containsKey` 可能找不到映射。

**触发条件：** 使用可变 List 作为键，并在 `put` 后修改参与 `equals` 和 `hashCode` 的列表内容。

**原因：** 映射按键原来的哈希与相等状态放置；状态变化后，Map 不会自动重新定位这条映射。官方合同将这种
行为规定为未指定。

**后果：** 映射占用数量却无法可靠读取或删除，内部状态与业务认知不一致。

**错误示例：**

```java
Map<List<String>, String> taskTitles = new HashMap<>();
List<String> taskKey = new ArrayList<>();
taskKey.add("TF-A");
taskTitles.put(taskKey, "整理需求");
taskKey.set(0, "TF-B");
System.out.println("修改后标题：" + taskTitles.get(taskKey));
```

**正确写法：**

```java
Map<String, String> taskTitles = new HashMap<>();
taskTitles.put("TF-A", "整理需求");
taskTitles.remove("TF-A");
taskTitles.put("TF-B", "整理需求");
System.out.println("新键标题：" + taskTitles.get("TF-B"));
```

**影响版本：** JDK 25 与 Java 8 都应避免修改影响键 equals 或 hashCode 的状态。

**验证方式：** 在 Temurin 25 和该组输入上，错误示例输出 `修改后标题：null`；这只是可复现失败形态，不是
所有实现的固定输出。正确示例在两个版本都输出 `新键标题：整理需求`。

### 让 TreeMap 比较规则合并不同键

**现象：** `TF-101` 和 `TF-202` 明明是不同字符串，放入 TreeMap 后数量却只有 `1`。

**触发条件：** Comparator 只比较字符串长度，使两个等长任务编号的比较结果为 `0`。

**原因：** TreeMap 用比较结果判断键的位置和等同性；结果为 `0` 时，第二次 `put` 被视为更新同一个键。

**后果：** 不同业务键被静默合并，旧值被覆盖。

**错误示例：**

```java
Map<String, String> taskTitles = new TreeMap<>(
        (left, right) -> Integer.compare(left.length(), right.length())
);
taskTitles.put("TF-101", "整理需求");
String previousTitle = taskTitles.put("TF-202", "实现登录");
System.out.println("覆盖前标题：" + previousTitle);
System.out.println("错误数量：" + taskTitles.size());
```

**正确写法：**

```java
Map<String, String> taskTitles = new TreeMap<>();
taskTitles.put("TF-101", "整理需求");
taskTitles.put("TF-202", "实现登录");
System.out.println("正确数量：" + taskTitles.size());
```

**影响版本：** JDK 25 与 Java 8 都适用；完整 Comparator 合同留给排序课程。

**验证方式：** 错误示例输出 `覆盖前标题：整理需求` 和 `错误数量：1`；正确示例输出 `正确数量：2`。

### 把 Map.of 当成可变 Map 或传入非法数据

**现象：** 创建时因重复键或 null 值失败，或者创建成功后调用 `put` 抛出异常。

**触发条件：** 在 JDK 25 中把固定 Map 工厂当成 HashMap 构造器使用。

**原因：** `Map.of` 创建不可修改 Map，拒绝重复键、null 键和 null 值。

**后果：** 程序在配置初始化或修改路径中抛出异常；Java 8 则会在编译阶段找不到这个 API。

**错误示例：**

```java
try {
    Map.of("TF-101", "整理需求", "TF-101", "实现登录");
} catch (IllegalArgumentException error) {
    System.out.println("重复键：" + error.getClass().getSimpleName());
}

try {
    Map.of("TF-101", null);
} catch (NullPointerException error) {
    System.out.println("null 值：" + error.getClass().getSimpleName());
}

Map<String, String> fixed = Map.of("TF-101", "整理需求");
try {
    fixed.put("TF-202", "实现登录");
} catch (UnsupportedOperationException error) {
    System.out.println("修改固定 Map：" + error.getClass().getSimpleName());
}
```

**正确写法：**

```java
Map<String, String> editable = new LinkedHashMap<>();
editable.put("TF-101", "整理需求");
editable.put("TF-202", "实现登录");
System.out.println("可修改数量：" + editable.size());
```

**影响版本：** `Map.of` 是 Java 9+ API；Java 8 使用普通 Map 或复制后包装的兼容写法。

**验证方式：** JDK 25 的错误示例依次输出 `IllegalArgumentException`、`NullPointerException` 和
`UnsupportedOperationException`，正确示例输出 `可修改数量：2`。Java 8 编译 `Map.of` 会报告找不到方法。

### 把 unmodifiableMap 视图误当成快照

**现象：** 只读 Map 无法通过自身修改，但源 Map 新增任务后，它的数量仍跟着变化。

**触发条件：** 直接调用 `Collections.unmodifiableMap(source)`，却期待结果与 source 后续变化隔离。

**原因：** 该 API 返回读穿到底层 Map 的不可修改视图，不会复制源映射。

**后果：** 已发布配置或任务目录被草稿的后续修改间接改变。

**错误示例：**

```java
Map<String, String> source = new LinkedHashMap<>();
source.put("TF-101", "整理需求");
Map<String, String> view = Collections.unmodifiableMap(source);
source.put("TF-202", "实现登录");
System.out.println("视图数量：" + view.size());
```

**正确写法：**

```java
Map<String, String> source = new LinkedHashMap<>();
source.put("TF-101", "整理需求");
Map<String, String> snapshot = Collections.unmodifiableMap(
        new LinkedHashMap<>(source)
);
source.put("TF-202", "实现登录");
System.out.println("副本数量：" + snapshot.size());
```

**影响版本：** JDK 25 与 Java 8 的 `Collections.unmodifiableMap` 都是视图；JDK 25 还可用 Map.copyOf 建立快照。

**验证方式：** 同一输入下，错误示例输出 `视图数量：2`，正确示例输出 `副本数量：1`，区别只来自是否先复制。
:::

## 六、练习：维护任务状态表

:::exercise
### TeamFlow 任务状态登记

**要求：** 创建一个任务编号到状态的 `LinkedHashMap<String, String>`。先登记 `TF-101=待处理` 和
`TF-202=已完成`，再把 `TF-101` 更新为“进行中”并保存旧状态；查询当前状态和 `TF-202` 是否存在，删除
`TF-202` 并保存返回值。删除后创建不可修改发布副本，再向草稿加入 `TF-303=待处理`。JDK 25 使用
`Map.copyOf`，Java 8 使用复制后 `Collections.unmodifiableMap`。不得使用循环、Stream、第三方库或 null 值。

**验收：** 两个版本都能独立编译运行，逐行输出“覆盖前状态：待处理”“TF-101 当前状态：进行中”
“包含 TF-202：true”“删除的状态：已完成”“剩余任务数：1”“发布状态：进行中”“发布任务数：1”
“草稿任务数：2”。
:::

### 1. JDK 25 参考实现

```java
import java.util.LinkedHashMap;
import java.util.Map;

/** 完成 JDK 25 的 TeamFlow 任务状态练习。 */
public class TeamFlowTaskStatusRegistry {
    /**
     * 登记、更新、删除并发布任务状态。
     *
     * @param args 启动参数，本练习不使用
     */
    public static void main(String[] args) {
        Map<String, String> draftStatuses = new LinkedHashMap<>();
        draftStatuses.put("TF-101", "待处理");
        draftStatuses.put("TF-202", "已完成");

        String previousStatus = draftStatuses.put("TF-101", "进行中");
        System.out.println("覆盖前状态：" + previousStatus);
        System.out.println("TF-101 当前状态：" + draftStatuses.get("TF-101"));
        System.out.println("包含 TF-202：" + draftStatuses.containsKey("TF-202"));

        String removedStatus = draftStatuses.remove("TF-202");
        System.out.println("删除的状态：" + removedStatus);
        System.out.println("剩余任务数：" + draftStatuses.size());

        Map<String, String> publishedStatuses = Map.copyOf(draftStatuses);
        draftStatuses.put("TF-303", "待处理");
        System.out.println("发布状态：" + publishedStatuses.get("TF-101"));
        System.out.println("发布任务数：" + publishedStatuses.size());
        System.out.println("草稿任务数：" + draftStatuses.size());
    }
}
```

### 2. Java 8 参考实现

```java
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

/** 完成 Java 8 兼容的 TeamFlow 任务状态练习。 */
public class TeamFlowTaskStatusRegistryJava8 {
    /**
     * 登记、更新、删除并发布 Java 8 任务状态。
     *
     * @param args 启动参数，本练习不使用
     */
    public static void main(String[] args) {
        Map<String, String> draftStatuses = new LinkedHashMap<>();
        draftStatuses.put("TF-101", "待处理");
        draftStatuses.put("TF-202", "已完成");

        String previousStatus = draftStatuses.put("TF-101", "进行中");
        System.out.println("覆盖前状态：" + previousStatus);
        System.out.println("TF-101 当前状态：" + draftStatuses.get("TF-101"));
        System.out.println("包含 TF-202：" + draftStatuses.containsKey("TF-202"));

        String removedStatus = draftStatuses.remove("TF-202");
        System.out.println("删除的状态：" + removedStatus);
        System.out.println("剩余任务数：" + draftStatuses.size());

        Map<String, String> publishedStatuses = Collections.unmodifiableMap(
                new LinkedHashMap<>(draftStatuses)
        );
        draftStatuses.put("TF-303", "待处理");
        System.out.println("发布状态：" + publishedStatuses.get("TF-101"));
        System.out.println("发布任务数：" + publishedStatuses.size());
        System.out.println("草稿任务数：" + draftStatuses.size());
    }
}
```

### 3. 练习结果说明

两个版本的预期输出完全一致：

```text
覆盖前状态：待处理
TF-101 当前状态：进行中
包含 TF-202：true
删除的状态：已完成
剩余任务数：1
发布状态：进行中
发布任务数：1
草稿任务数：2
```

验收重点是状态变化而不是 Map 的整体打印顺序：重复键更新返回旧状态，按键查询取得新状态，删除返回被移除
状态，发布副本在草稿新增 `TF-303` 后仍保持一条映射。Java 8 的差异只在发布副本的创建方式。
