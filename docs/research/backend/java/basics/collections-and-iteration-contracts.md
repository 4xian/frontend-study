# Collection、List、Set、Map 与迭代合同研究记录

## 冻结课程合同

- `courseId`：`backend.java.learn.basics.collections-and-iteration-contracts`
- `title`：Collection、List、Set、Map 与迭代合同
- `purpose / collection / level / depth`：`learn / basics / beginner / lesson`
- `phaseBatch`：`B-15`
- `estimatedMinutes`：`90`
- `sequence`：`230`
- `prerequisites`：`[backend.java.learn.basics.strings-encoding-and-text-matching]`（唯一前置 B-14）
- `related`：`[]`
- `sourceCapabilityIds`：`[JAVA-STDLIB-005, JAVA-STDLIB-006, JAVA-STDLIB-007]`
- `origin`：`[project-observed]`
- `selectionReason`：项目广泛传递集合；删除、只读视图、比较与去重需要作为同一组合同理解。
- `projectEvidenceCount`：`JAVA-STDLIB-005: 30`、`JAVA-STDLIB-006: 3`、
  `JAVA-STDLIB-007: 1`
- `modernBaseline`：`Java 25 LTS`
- `legacyBaseline`：`Java 8`，只作冻结项目兼容补充
- Phase 2 冻结状态：`researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`
- `snapshotId`：`dzzz-app-20260803-179e722831ab`
- `analysisId`：`dzzz-app-analysis-20260803-958d37cf1be1`

本课只建立集合主接口、相等性与哈希、迭代删除、不可修改边界和排序合同。Stream、Collectors、
并发集合、框架数据映射与性能基准不在本课展开。

## 核验基线

| 项目 | 核验结果 |
| --- | --- |
| 核验日期 | 2026-08-15 |
| 现代主线 | Java 25 LTS；OpenJDK JDK 25 页面确认已 GA，Oracle 支持路线将 Java 25 列为 LTS |
| legacy 补充 | Java 8，只作冻结项目背景 |
| 发现方式 | Tavily 只用于发现并提取 Oracle、OpenJDK 与 Dev.java 直接页面；搜索摘要不作最终依据 |
| 最终证据 | Java 25/8 API、JLS 25/8、OpenJDK JEP 431 与 Dev.java Collections Framework 直接页面 |
| 项目证据 | 只读取冻结矩阵与 inventory，不读取、运行或修改 `dzzz-app` 当前源码 |
| 验证边界 | 研究阶段只设计 Java 25/8 反馈环，不执行 Java、容器、构建或浏览器验证 |

Java 25 与 Java 8 共享本课核心的 `Collection`、`List`、`Set`、`Map`、`Iterator`、`Comparable`
和 `Comparator` 合同。现代主线额外说明 Java 9/10 的不可修改工厂与 Java 21 的 sequenced
interfaces，但共同课程示例必须能明确标注哪些写法不能在 Java 8 编译。

## 官方来源卡与直接证据

以下页面均在 `2026-08-15` 直接核验：

| ID | 直接来源 | sourceType | 适用版本 | claims |
| --- | --- | --- | --- | --- |
| `openjdk-jdk25` | [OpenJDK JDK 25](https://openjdk.org/projects/jdk/25/) | `official-reference` | JDK 25 | JDK 25 是 Java SE 25 参考实现，并于 2025-09-16 GA。 |
| `oracle-java-roadmap` | [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) | `official-reference` | 2026-08-15 页面状态 | Java SE 25 被列为 LTS。 |
| `api25-collection` | [Collection](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Collection.html) | `api-doc` | Java 25 | 集合根接口、optional operation、view collection 与 unmodifiable collection 合同。 |
| `api25-list` | [List](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html) | `api-doc` | Java 25 | 有序序列、重复元素、索引、相等性、`sort`、`of` 与 `copyOf`。 |
| `api25-set` | [Set](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Set.html) | `api-doc` | Java 25 | 唯一性、集合相等性与不可修改工厂。 |
| `api25-map` | [Map](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html) | `api-doc` | Java 25 | 键值映射、collection views、相等性、`of` 与 `copyOf`。 |
| `api25-iterator` | [Iterator](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Iterator.html) | `api-doc` | Java 25 | `next`、一次性 `remove`、optional operation 与迭代期间修改边界。 |
| `api25-collections` | [Collections](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Collections.html) | `api-doc` | Java 25 | 不可修改视图、同步包装与排序工具。 |
| `api25-object` | [Object](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html) | `api-doc` | Java 25 | `equals` 等价关系与“相等对象必须有相同 hash code”的合同。 |
| `api25-comparable` | [Comparable](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Comparable.html) | `api-doc` | Java 25 | 自然顺序与一致于 `equals` 的建议。 |
| `api25-comparator` | [Comparator](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Comparator.html) | `api-doc` | Java 25 | 外部全序、组合器与一致于 `equals` 的边界。 |
| `api25-arraylist` | [ArrayList](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html) | `api-doc` | Java 25 | 可调整数组实现、具体操作的复杂度预期、结构修改与 fail-fast 限制。 |
| `api25-hashset` | [HashSet](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashSet.html) | `api-doc` | Java 25 | 无顺序保证；基本操作和迭代成本均带哈希分布、容量等实现前提；fail-fast 只作 best effort。 |
| `api25-hashmap` | [HashMap](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashMap.html) | `api-doc` | Java 25 | 无顺序保证；基本操作和迭代成本均带哈希分布、容量等实现前提；fail-fast 只作 best effort。 |
| `jls25-enhanced-for` | [JLS 25 Chapter 14](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html) | `specification` | Java 25 | enhanced `for` 遍历 `Iterable` 时按 `Iterator` 翻译。 |
| `jep431` | [JEP 431: Sequenced Collections](https://openjdk.org/jeps/431) | `official-reference` | Java 21+ | 引入统一的 encounter order、首尾访问和反向视图接口。 |
| `api25-sequenced` | [SequencedCollection](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/SequencedCollection.html) | `api-doc` | Java 25 | `getFirst`、`getLast` 与 `reversed` 视图合同。 |
| `api8-collection` | [Collection](https://docs.oracle.com/javase/8/docs/api/java/util/Collection.html) | `api-doc` | Java 8 | Java 8 集合根接口、optional operation 与 `removeIf` 默认实现。 |
| `api8-list` | [List](https://docs.oracle.com/javase/8/docs/api/java/util/List.html) | `api-doc` | Java 8 | Java 8 有序序列、相等性、索引与 `List.sort`。 |
| `api8-set` | [Set](https://docs.oracle.com/javase/8/docs/api/java/util/Set.html) | `api-doc` | Java 8 | Java 8 唯一性与 Set 相等性合同。 |
| `api8-map` | [Map](https://docs.oracle.com/javase/8/docs/api/java/util/Map.html) | `api-doc` | Java 8 | Java 8 键值映射及 `keySet`、`values`、`entrySet` 视图。 |
| `api8-iterator` | [Iterator](https://docs.oracle.com/javase/8/docs/api/java/util/Iterator.html) | `api-doc` | Java 8 | Java 8 `Iterator.remove`、`IllegalStateException` 与 `UnsupportedOperationException`。 |
| `api8-collections` | [Collections](https://docs.oracle.com/javase/8/docs/api/java/util/Collections.html) | `api-doc` | Java 8 | Java 8 不可修改视图、同步包装与排序工具。 |
| `api8-object` | [Object](https://docs.oracle.com/javase/8/docs/api/java/lang/Object.html) | `api-doc` | Java 8 | Java 8 `equals` / `hashCode` 核心合同。 |
| `api8-comparable` | [Comparable](https://docs.oracle.com/javase/8/docs/api/java/lang/Comparable.html) | `api-doc` | Java 8 | Java 8 自然顺序和 sorted collection 一致性要求。 |
| `api8-comparator` | [Comparator](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html) | `api-doc` | Java 8 | Java 8 外部排序、`naturalOrder`、`reversed` 与组合器。 |
| `api8-arraylist` | [ArrayList](https://docs.oracle.com/javase/8/docs/api/java/util/ArrayList.html) | `api-doc` | Java 8 | Java 8 可调整数组实现、具体操作的复杂度预期与 fail-fast 限制。 |
| `api8-hashset` | [HashSet](https://docs.oracle.com/javase/8/docs/api/java/util/HashSet.html) | `api-doc` | Java 8 | Java 8 基本操作和迭代成本的条件化预期；fail-fast 只作 best-effort。 |
| `api8-hashmap` | [HashMap](https://docs.oracle.com/javase/8/docs/api/java/util/HashMap.html) | `api-doc` | Java 8 | Java 8 基本操作和迭代成本的条件化预期；fail-fast 只作 best-effort。 |
| `jls8-enhanced-for` | [JLS 8 Chapter 14](https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html) | `specification` | Java 8 | Java 8 enhanced `for` 的 Iterator 翻译。 |
| `dev-organization` | [Getting to Know the Collection Hierarchy](https://dev.java/learn/api/collections-framework/organization/) | `official-reference` | 当前 Dev.java | `List`、`Set`、sorted collections 与 ordering / sorting 区别。 |
| `dev-iterating` | [Iterating over the Elements of a Collection](https://dev.java/learn/api/collections-framework/iterating/) | `official-reference` | 当前 Dev.java | for-each、Iterator 删除与单线程也可能出现的并发修改异常。 |
| `dev-factories` | [Collections Factory Methods](https://dev.java/learn/api/collections-framework/factory-methods/) | `official-reference` | 当前 Dev.java | 不可修改工厂、copy、null 边界和同步包装遍历要求。 |
| `dev-lists` | [Extending Collection with List](https://dev.java/learn/api/collections-framework/lists/) | `official-reference` | 当前 Dev.java | `subList` 视图、`List.sort` 与 `Comparator`。 |
| `dev-map-views` | [Managing the Content of a Map](https://dev.java/learn/api/collections-framework/working-with-keys-and-values/) | `official-reference` | 当前 Dev.java | Map 的 keys、values、entries 都是 backed views。 |
| `dev-immutable-keys` | [Choosing Immutable Types for Your Key](https://dev.java/learn/api/collections-framework/choosing-keys/) | `official-reference` | 当前 Dev.java | 修改 hash/equality 相关键状态会让映射或集合元素失去可达性。 |

## 现代主线结论

### 先选语义接口，再选实现

`Collection<E>` 是 `List<E>`、`Set<E>` 等集合接口的共同根；`Map<K, V>` 表达键到值的映射，
不是 `Collection` 的子类型。调用方应先声明所需语义：

- `List` 保存有位置的序列，通常允许相等元素重复，适合需要顺序和索引的结果。
- `Set` 不允许两个元素按 `equals` 相等，适合唯一性和成员判断。
- `Map` 每个键最多关联一个值；需要遍历键值对时直接使用 `entrySet()`。
- `Collection` 只表达最小集合能力，不承诺索引、唯一性、排序或具体遍历顺序。

这些接口中的许多修改方法是 optional operation。接口出现 `add`、`remove` 或 `clear` 不代表所有
实现都支持；不支持时可以抛出 `UnsupportedOperationException`。null、元素类型限制和遍历顺序也由
更具体的接口、实现或工厂合同决定，不能从 `Collection` 一概推导。

常用实现也必须按自己的合同选择：`ArrayList` 是可调整数组形式的 `List`；`HashSet` 以哈希表实现
`Set`，不保证迭代顺序；`HashMap` 以哈希表实现 `Map`，同样不保证映射顺序。声明接口可以隔离不必要的
实现细节，但调用方若依赖顺序、可修改性或成本特征，仍必须把这些依赖写清楚并核对具体实现。

### 复杂度是具体实现的条件化预期，不是语言保证

Java 25 的 `ArrayList` Javadoc 将 `size`、`get`、`set`、iterator 等列为常数时间，将 `add` 列为
摊还常数时间，并把其余操作概括为大致线性时间；Java 8 页面给出相同的核心描述。这是 `ArrayList`
实现文档中的复杂度预期，不是 JLS 对 Java 程序的保证，也不能外推到任意 `List`。例如 `List` 接口
明确提醒，某些实现的索引访问可能与索引值成正比。

`HashSet` 的 `add`、`remove`、`contains`、`size` 和 `HashMap` 的 `get`、`put` 只有在哈希函数能把
元素适当分散到 buckets 的前提下，才有 Javadoc 所述的常数时间预期。两者的迭代成本还与 size 加
backing table capacity 成正比，因此初始容量、load factor、键的 `hashCode` 和实际输入分布都会影响
结果。Java 25 与 Java 8 的 Javadoc 都保留这些前提。

因此课程只教授“在文档前提成立时如何预期和选择”，不承诺特定请求一定达到某个耗时，也不把一次
本地运行当作普遍性能证据。需要作真实性能判断时，应固定 JDK、实现、输入分布和参数后再用基准测量。

### 相等性和哈希决定去重与键的可达性

`Object.equals` 必须满足自反、对称、传递、一致和对 null 返回 false；两个对象若 `equals` 为 true，
它们的 `hashCode` 必须相等。反过来不成立：hash code 相同不证明对象相等。

`List.equals` 比较相同位置的元素，顺序参与合同；`Set.equals` 比较成员集合，遍历顺序不参与；
`Map.equals` 比较键值映射。对象进入 hash-based Set 或作为 Map key 后，不应再修改参与
`equals` / `hashCode` 的状态，否则对象可能仍在容器中，却无法按新的或旧的逻辑稳定找回。

可变 value 不会自动破坏 key 的查找合同；真正危险的是 key 或 Set element 的相等性相关状态变化。
课程示例应优先使用不可变值作为键，并同时实现一致的 `equals` 与 `hashCode`。

### 遍历期间删除必须走允许的修改通道

enhanced `for` 遍历 `Iterable` 时本质上使用 `Iterator`，但循环语法不暴露 iterator 本身。只读遍历
优先使用 for-each；若必须边遍历边删除，使用显式 iterator，并遵守：

- 先成功调用一次 `next()`，才能对该元素调用一次 `remove()`；否则抛
  `IllegalStateException`。
- `remove()` 是 optional operation；只读或不支持删除的 iterator 可抛
  `UnsupportedOperationException`。
- 遍历期间绕过 iterator 直接结构性修改底层普通集合，其后 iterator 行为未指定，除非实现另有并发
  修改策略。
- `Collection.removeIf` 的默认实现也通过 iterator 删除，因此底层 iterator 不支持删除时仍可能失败。

先收集待删项再统一删除也可以，但必须明确额外内存和相等性语义。不能把捕获
`ConcurrentModificationException` 当作删除协议。

### 不可修改视图、不可修改副本和元素不可变是三件事

`Collections.unmodifiableList(source)` 等方法返回 read-through view：调用者不能通过该 view 修改，
但持有 `source` 的代码修改底层集合后，view 会看到变化。它不是快照，也没有让元素本身变成不可变。

Java 10+ 的 `List.copyOf`、`Set.copyOf`、`Map.copyOf` 返回不可修改结果，后续修改原集合不会反映到
结果中；这些工厂拒绝 null。`List.of`、`Set.of`、`Map.of` 同样返回不可修改集合，其中 Set / Map
还会拒绝重复元素或重复键。copy 仍是浅层的，元素对象若可变，其内部状态仍可变化。

Java 8 要表达“不可修改快照”，需先复制所有权，再包装，例如
`Collections.unmodifiableList(new ArrayList<>(source))`。只调用 `unmodifiableList(source)` 仍是共享
底层数据的 view。类似地，`subList` 和 Map 的 `keySet` / `values` / `entrySet` 都是 backed views，
不是独立副本。

### 自然顺序与外部比较器必须形成稳定全序

`Comparable<T>` 把自然顺序放在类型内部；`Comparator<T>` 把某一使用场景的顺序放在类型外部。
`List.sort(comparator)` 原地排序，Java 8 已支持；调用方若不拥有该 list 的修改权，先复制再排序。

比较合同要求符号反对称、传递，并且当 `compare(x, y) == 0` 时，对第三个值的比较结果保持一致。
自然顺序和 comparator 最好与 `equals` 一致。若 sorted Set / Map 认为两个不相等对象比较结果为 0，
第二个对象可能按排序容器的等价类被视为重复，出现与普通 Set / Map 直觉不同的结果。

多字段排序应显式写出主键、次键和 null 策略，例如使用 `Comparator.comparing(...).thenComparing(...)`
与 `nullsFirst` / `nullsLast`。不要用两个整数相减作为比较器，避免溢出破坏顺序合同。

### 顺序、排序和 Java 25 的 sequenced interfaces 不应混淆

encounter order 表示遍历时有定义的先后；sorted 表示该先后由比较规则决定。List 有 encounter order，
但不必处于排序状态；HashMap 不承诺遍历顺序；SortedSet / SortedMap 则由自然顺序或 comparator
维护排序。

JEP 431 自 Java 21 引入 `SequencedCollection`、`SequencedSet` 与 `SequencedMap`。Java 25 可以通过统一
接口访问首尾元素并获得 `reversed()` 反向视图。该返回值是 view，不是 copy；Java 8 没有这些接口，
共同示例不能无标注使用它们。

### fail-fast 是诊断线索，不是并发正确性机制

`ArrayList`、`HashMap` 等常用实现的 iterator 通常在检测到非 iterator 通道的结构修改时快速抛出
`ConcurrentModificationException`。这个异常不等于“只会在多线程出现”，单线程边遍历边直接删除也
可能触发。

官方 `HashMap` 合同明确说明 fail-fast 只能 best effort，程序不得依赖“一定抛异常”来保证正确性。
真正的跨线程共享必须使用明确的所有权、同步或适合的并发数据结构；这些方案留到后续课程。本课只
验证普通集合的单线程修改合同，并说明 `Collections.synchronizedX` 遍历仍要求调用方按文档在 wrapper
上同步。

## 当前项目补充

以下证据只来自冻结矩阵和 inventory。`observed` 只证明能力场景存在；文件
`auditStatus: unreviewed` 表示本研究没有把自动抽取提升成人工源码复审，也没有读取 `dzzz-app` 当前
文件。

| 文件 | 稳定符号 | 冻结 SHA-256 | 状态 | 课程边界 |
| --- | --- | --- | --- | --- |
| `dzzz-app/src/main/java/com/tdh/bdzz/util/JzTabUtils.java` | `com.tdh.bdzz.util.JzTabUtils` | `bcd4fd6258012199f2bb33fea27bf94064ccebfab722eed532401c8e145ab564` | `observed` | `JAVA-STDLIB-005` 的集合能力代表；不从文件名推断具体 List / Set / Map 语义。 |
| `dzzz-app/src/main/java/com/tdh/bdzz/util/CacheUtil.java` | `com.tdh.bdzz.util.CacheUtil` | `30a1127a6bc74beb10bd41d970d6dacd5b53596d705962e722996dda981ddca6` | `observed` | `JAVA-STDLIB-005` 的集合传递代表；缓存所有权与并发策略不在本课评价。 |
| `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/fyb/jdyh/NoteSignWsServer.java` | `com.tdh.bdzz.config.websocket.server.fyb.jdyh.NoteSignWsServer` | `34a02597c46ffdf102b380a0fa8a299ee780bcbc1aa7db9db1de1949be896370` | `observed` | `JAVA-STDLIB-006` 的迭代删除/只读视图能力代表；不声称冻结抽取已证明具体删除路径正确。 |
| `dzzz-app/src/main/java/com/tdh/bdzz/constant/TuDmKzCategoryConstant.java` | `com.tdh.bdzz.constant.TuDmKzCategoryConstant` | `cca14e4a2dce17b4e40ccbaafed6c0cce2e985ffd776cb1a8eeacb1afe5dc0cc` | `observed` | `JAVA-STDLIB-006` 的只读集合边界代表；不把项目常量内容带入课程。 |
| `dzzz-app/src/main/java/com/tdh/bdzz/util/ComparableFutureTask.java` | `com.tdh.bdzz.util.ComparableFutureTask` | `63e70feeebcebc81a2c38d5e958ea823d9f46dd6556c8ef156edd3be6c09dd8a` | `observed` | `JAVA-STDLIB-007` 的自然顺序代表；不提升项目任务优先级规则为通用比较合同。 |

## Java 8 / Spring Boot 2.3 兼容写法

- Java 8 已支持 diamond、for-each、`Iterator.remove`、`Collection.removeIf`、`List.sort` 和
  `Comparator.comparing` / `thenComparing`，共同核心反馈环不需要第三方库。
- Java 8 没有 `List.of` / `Set.of` / `Map.of`、`copyOf` 或 sequenced interfaces。不可修改快照采用
  “防御性复制后 `Collections.unmodifiableX` 包装”。
- Java 8 的 `Collections.unmodifiableX` 与 Java 25 一样是 read-through view；不能把 legacy 写法描述成
  深不可变。
- Java 8 的 hash、equals、iterator 删除、optional operation、自然顺序与 comparator 核心合同与
  Java 25 一致。
- Java 8 的 `ArrayList`、`HashSet`、`HashMap` Javadoc 也给出与现代线相同类别的复杂度预期；这些
  结论仍绑定具体实现及其哈希分布、容量等前提，不是语言或接口保证。
- Spring Boot 2.3.12.RELEASE 不改变 Java 集合合同；框架返回集合是否可修改、是否有顺序必须由具体
  API 另行说明。

## 新旧版本差异

| 对比项 | Java 25 现代线 | `dzzz-app` Java 8 补充线 | 课程处理 |
| --- | --- | --- | --- |
| `Collection` / `List` / `Set` / `Map` | 核心接口可用 | 核心接口一致 | 使用共同语义 |
| `ArrayList` / `HashSet` / `HashMap` | 具体实现及条件化复杂度预期 | 同类实现与核心前提一致 | 不外推为语言或接口保证 |
| `Iterator.remove` 与 fail-fast | 核心合同 | 核心合同一致 | 双版本设计同一正负反馈环 |
| 不可修改工厂 | `of`、`copyOf` 可用并拒绝 null | 无这些工厂 | Java 8 先复制再 `unmodifiableX` |
| sequenced interfaces | Java 21+ 可用 | 不可用 | 只作现代补充，不进入共同源码 |
| `List.sort` / Comparator 组合 | 可用 | Java 8 已可用 | 共同示例使用 Java 8 API |
| `reversed()` | 返回反向 view | 无统一 API | 不把 view 写成独立副本 |

## 易错点取证

| 现象 | 原因 | 后果 | 修正 | 计划验证 |
| --- | --- | --- | --- | --- |
| 声明 `Collection` 却依赖索引或顺序 | 根接口不承诺 List 语义 | 实现替换后行为漂移 | 按所需语义声明 `List` / `Set` / `Map` | 编译期接口能力检查 |
| 只改 `equals` 不改 `hashCode` | 破坏相等对象同 hash 合同 | HashSet 去重和 HashMap 查找异常 | 同时实现并验证二者 | equal pair 的 hash 断言 |
| 插入后修改 key / Set element | hash/equality 状态变化 | 已有条目无法稳定找回 | 使用不可变 key 或删除后重插 | 修改前后 lookup 负例 |
| for-each 内直接 `list.remove` | 绕过当前 iterator 结构修改 | 可能抛 CME 或行为未指定 | 显式 iterator remove 或 `removeIf` | 普通 ArrayList 失败反馈环 |
| 连续两次 `iterator.remove` | 每次 `next` 只允许一次 remove | `IllegalStateException` | 每个返回元素最多删除一次 | 双版本异常断言 |
| 把 `unmodifiableList(source)` 当快照 | 包装结果是 read-through view | source 修改仍泄漏给调用者 | 复制所有权后包装或现代 `copyOf` | view / copy 对照 |
| 认为不可修改集合会冻结元素 | 集合不可修改是浅层边界 | 元素内部仍可变化 | 使用不可变元素或深复制策略 | 可变元素对照，不宣称 deep immutable |
| 依赖 HashMap 遍历顺序 | HashMap 不承诺 order | 输出、签名或分页不稳定 | 显式选择有序实现或排序结果 | 多输入只验证“不依赖”，不测偶然顺序 |
| comparator 用整数相减 | 溢出可能反转比较符号 | 排序违反传递性 | `Integer.compare` 或 key extractor | 极值比较负例 |
| comparator 与 equals 不一致却用于 TreeSet | 排序等价类决定唯一性 | 不相等对象被视为重复 | 对齐合同或记录有意差异 | compare==0 / equals=false 对照 |
| 捕获 CME 后继续 | fail-fast 只是 best effort | 正确性依赖不保证的异常 | 修正所有权和修改协议 | 不编写依赖 CME 的成功路径 |

## 可重复验证设计

实现阶段的验证资产只能写入 `/tmp` 下的 `mktemp -d` 目录，并用
`find "$work_dir" -depth -delete` 清理；研究阶段没有执行以下命令或产生 PASS：

| 反馈环 | Java 25 | Java 8 | 预期合同 |
| --- | --- | --- | --- |
| 正向统一样例 | 编译并运行 | 同一 Java 8 兼容源码编译并运行 | List 保序可重复、Set 去重、Map 键值覆盖、iterator 安全删除、Comparator 多字段排序 |
| equals/hash 样例 | 编译并运行 | 同源码编译并运行 | 相等值 hash 相同，hash collision 不代表相等 |
| iterator 状态负例 | 编译并运行 | 同源码编译并运行 | `next` 前或单次 `next` 后二次 `remove` 抛 `IllegalStateException` |
| 不支持删除负例 | 编译并运行 | 同源码编译并运行 | 不可修改 view 的 iterator remove 抛 `UnsupportedOperationException` |
| view / snapshot 对照 | `unmodifiableList` 与 `List.copyOf` | `unmodifiableList` 与“copy 后 wrapper” | view 反映 source 变化，snapshot 不反映；二者都阻止结构修改 |
| 结构修改负例 | 普通 ArrayList 运行 | 同源码运行 | 非 iterator 通道修改触发诊断；结果不用于证明所有实现必抛 CME |
| comparator 极值负例 | 编译并运行 | 同源码编译并运行 | 减法 comparator 暴露溢出，`Integer.compare` 保持符号合同 |
| sorted equality 对照 | 编译并运行 | 同源码编译并运行 | compare==0 可让 TreeSet 视为同一排序等价类 |
| modern-only 样例 | 编译 `copyOf` 与 sequenced API | 标记 not-run / not-applicable | 证明现代 API，不误写为 Java 8 可用 |

所有 Java 方法和构造器必须在定义上方提供规范中文注释。最终输出应只包含去敏的固定短值与异常类，
不得包含真实项目数据、内部地址或凭据。

## 被排除或尚未证实的说法

- 不讲 Stream、Collectors、parallel stream 或 collector 合并策略。
- 不讲 ConcurrentHashMap、CopyOnWriteArrayList 等并发集合的弱一致或快照迭代语义。
- 不把 `ArrayList`、`HashSet`、`HashMap` Javadoc 的条件化复杂度预期写成语言保证、最坏情况保证或
  实测性能结论；本研究没有运行基准测试。
- 不把 `UnsupportedOperationException` 写成所有不可修改操作都必然在无状态变化时抛出；以具体 API
  合同为准。
- 不把 `ConcurrentModificationException` 写成线程安全保证、必现异常或恢复机制。
- 不把 unmodifiable view、unmodifiable copy、immutable element 与 deep immutable 混为一谈。
- 不声称 frozen representative symbol 已通过本批人工源码复审。
- 不读取或修改 `dzzz-app` 来证明冻结 inventory 已记录的事实。

## 发布前自检

- [x] 冻结标题、B-15、90 分钟和唯一前置 B-14 已对齐；旧 Phase 2 序号、来源能力、证据计数和状态
  仅保留为历史冻结字段。
- [x] 现代 Java 25 主线与 Java 8 项目补充分开。
- [x] Collection、List、Set、Map、equals/hash、iterator 删除、不可修改边界和排序均绑定第一方来源。
- [x] fail-fast 明确限定为 best effort，不替代并发正确性。
- [x] ArrayList、HashSet、HashMap 的复杂度只按具体实现和输入前提表述，不写成语言保证。
- [x] 5 个 observed 项目证据只绑定冻结路径、符号和 SHA，没有读取当前源码。
- [x] Stream、并发集合和性能主题明确排除。
- [x] 验证结果均标为研究设计，未写成已执行 PASS。
- [x] 不包含真实业务数据、内部地址或凭据。

## Stop Boundary

本研究阶段只授权更新 `collections-and-iteration-contracts` 研究文件；不创建或修改课程正文，不注册
manifest，不更新计划或 signoff，不执行 Java、容器、根级 build 或浏览器验证，也不进入 B-16、
Stream、中级、高级、Reference、项目实战或其他后端技术。
