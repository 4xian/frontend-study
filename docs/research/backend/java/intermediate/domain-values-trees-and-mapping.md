# 领域值对象、树结构与对象映射研究稿

## 冻结课程合同

| 项目 | Phase C I-19 冻结值 |
| --- | --- |
| 课程编号 | `I-19` |
| 课程 ID | `backend.java.learn.intermediate.domain-values-trees-and-mapping` |
| 标题 | 领域值对象、树结构与对象映射 |
| 性质 | 中级必修；复用既有稳定 ID、URL、正文和去敏示例 |
| 预计时间 | 150 分钟 |
| 唯一前置 | `backend.java.learn.intermediate.service-design-patterns`（I-18） |
| 来源能力 | `JAVA-ENGINEERING-031`、`JAVA-ENGINEERING-032` |
| 现代基线 | Java 25 LTS；Spring Boot 4.1.0 / Spring Framework 7.0.8 只作平台边界 |
| legacy 基线 | Java 8；Spring Boot 2.3.12.RELEASE / Spring Framework 5.2.15.RELEASE 隔离补充 |
| 冻结快照 | `dzzz-app-20260803-179e722831ab`；分析 `dzzz-app-analysis-20260803-958d37cf1be1` |
| 项目边界 | 只引用已冻结审计产物，不读取、运行或修改 `dzzz-app` |
| 批次边界 | 只完成 Phase C I-19 研究；不修改课程、track、loader、signoff 或后续课程资产 |

Phase A 路线是本批唯一课程顺序权威。旧研究稿中的“顺序 460、中级第 17/17 批、两个旧前置”只属于
调整前审计快照，不能继续作为 Phase C 发布合同。现有课程初始快照仍为 300 分钟、两个旧前置和
`verifiedAt: 2026-08-09`；这些差异留给 I-19 实施批最小调整，本研究批不改正文。

## 研究范围与相邻课程边界

I-19 只保留四条相互依赖的教学主线：

1. 用 Java 25 record 或 Java 8 final 类表达带不变量的领域值。
2. 用字段白名单 mapper 隔离输入、领域、持久化和输出边界。
3. 把扁平 `id` / `parentId` 数据构造成单根、单父、全覆盖、无环树。
4. 用显式 `Deque` 完成稳定 DFS/BFS，并映射为不含 parent 回指的单向响应树。

以下内容明确排除：

- I-02 已建立的一般标识符、`equals`/`hashCode` 与稳定排序基础，本课只应用到值对象。
- I-03 已建立的 JSON、Jackson 和外部数据合同，本课只说明对象图进入响应前的单向映射边界。
- I-10 的 Bean Validation 输入合同，本课不重讲约束注解，只区分校验级联与映射/序列化循环。
- I-11 的分层、DTO、Service 与仓储职责，本课只深化不同边界间的字段转换。
- 完整领域驱动设计、聚合、领域事件、ORM entity 生命周期、MapStruct 全量语法、Jackson 全量配置、
  通用图算法、PDF 库坐标 API 和性能基准。

“值对象”“单根树”“孤儿是否失败”不是 Java 语言自动规定的产品语义。课程必须把它们标为本课设计
合同，再用 Java 类型和集合 API 实现，不能把课程取舍写成 JLS 或框架保证。

## 核验基线与研究方法

- 核验日期：2026-08-16。
- 先用 Tavily 对 Oracle、Spring、MapStruct、Jackson、Jakarta 官方域执行 5 个查询；5 个查询均因
  当前套餐额度上限被拒绝，未返回搜索结果。
- 按仓库固定接替顺序改用 Exa 发现入口，再回到 JLS、JVMS、Oracle/OpenJDK API、Spring Javadoc、
  MapStruct 官方指南与源码示例、FasterXML 固定标签源码、Jakarta/Bean Validation 规范核验。
- A 级事实来自语言、虚拟机或 Validation 规范；B 级事实来自版本化 API、官方参考指南、发布页或
  固定标签源码；“单根、单父、全覆盖、无环”属于 D 级课程设计合同。
- 本研究只设计 fixture 验收，不执行课程代码，不把预期输出写成已经通过。
- 最终研究稿包含 36 个唯一来源 URL。31 个可直连官网来源经 `curl -L --fail` 跟随
  重定向后最终 HTTP 状态均为 200；5 个固定 GitHub 源码 URL 在当前机器三轮直连中均于连接阶段超时，
  没有收到 HTTP 状态。随后用 Exa 的已知 URL 抽取成功读取对应 tag/commit 源码；本稿把它们记为
  “搜索提供方可读、当前机器直连超时”，不虚报为 curl HTTP 200。

## 官方来源卡与直接证据

### 现代 Java 25 与平台基线

| ID | 第一方来源 | 类型 | 版本/时间 | 直接支持的结论 |
| --- | --- | --- | --- | --- |
| `oracle-java-support-roadmap` | [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) | `official-reference` | 2026-08-16 页面状态 | Java 25 是 LTS；Java 26 是后续 non-LTS，课程以 Java 25 作为稳定主线。 |
| `spring-boot-4-1-system-requirements` | [Spring Boot 4.1.0 System Requirements](https://docs.spring.io/spring-boot/system-requirements.html) | `official-reference` | 2026-08-16 页面状态 | Spring Boot 4.1.0 至少要求 Java 17、兼容至 Java 26，并要求 Spring Framework 7.0.8 或以上。 |
| `jls25-record-classes` | [JLS 25 §8.10 Record Classes](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.10) | `specification` | Java 25 | record 隐式 final；组件对应字段和访问器；规范构造器初始化组件；派生 `equals`、`hashCode`、`toString`。 |
| `jep395-records` | [JEP 395 Records](https://openjdk.org/jeps/395) | `official-reference` | JDK 16+ | record 用于透明数据载体并提供浅不可变语义；组件引用的对象不会自动深度不可变。 |
| `java25-record-api` | [Java 25 `Record`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Record.html) | `api-doc` | Java 25 | 所有 record 直接继承 `Record`，且不能显式扩展其他类。 |
| `java25-object` | [Java 25 `Object`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html) | `api-doc` | Java 25 | `equals` 有自反、对称、传递和一致合同；相等对象必须产生相同 `hashCode`。 |
| `jls25-equality` | [JLS 25 §15.21 Equality Operators](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.21) | `specification` | Java 25 | 引用类型的 `==` 比较对象身份；值语义必须由类型的 `equals` 合同表达。 |
| `java25-list-copyof` | [Java 25 `List.copyOf`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#copyOf%28java.util.Collection%29) | `api-doc` | Java 25 | 返回不可修改列表且不反映源集合后续结构变化；拒绝 null 集合和 null 元素；可变元素仍可变化。 |
| `java25-map-copyof` | [Java 25 `Map.copyOf`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html#copyOf%28java.util.Map%29) | `api-doc` | Java 25 | 返回不可修改 Map 并拒绝 null 键值；不会把可变键和值自动变成不可变。 |
| `java25-unmodifiable-list` | [Java 25 `Collections.unmodifiableList`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Collections.html#unmodifiableList%28java.util.List%29) | `api-doc` | Java 25 | 返回指定列表的不可修改视图；底层列表变化仍可通过该视图观察。 |
| `java25-enum` | [Java 25 `Enum`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Enum.html) | `api-doc` | Java 25 | `name` 与 `ordinal` 有语言平台含义；`ordinal` 主要服务 EnumSet/EnumMap，不能自动充当外部业务编码。 |
| `java25-deque` | [Java 25 `Deque`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Deque.html) | `api-doc` | Java 25 | 同一接口可表达 FIFO 队列和 LIFO 栈；官方建议优先于旧 `Stack` 类。 |
| `java25-array-deque` | [Java 25 `ArrayDeque`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayDeque.html) | `api-doc` | Java 25 | 不允许 null、非线程安全，适合作为单线程构树或遍历过程中的临时队列/栈。 |
| `java25-compute-if-absent` | [Java 25 `Map.computeIfAbsent`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html#computeIfAbsent%28K%2Cjava.util.function.Function%29) | `api-doc` | Java 25 | 可按缺失键建立索引/多值映射；mapping function 不应修改当前 Map，默认实现不承诺原子性。 |
| `java25-stack-overflow` | [Java 25 `StackOverflowError`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/StackOverflowError.html) | `api-doc` | Java 25 | 应用递归过深可能耗尽调用栈；是否改用显式 `Deque` 仍由输入深度和课程合同决定。 |
| `jvms25-class-version` | [JVMS 25 §4.1 ClassFile Structure](https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-4.html#jvms-4.1) | `specification` | Java 25 | Java 25 class major version 为 69。 |
| `spring7-bean-utils` | [Spring Framework 7.0.8 `BeanUtils`](https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/beans/BeanUtils.html) | `api-doc` | Spring Framework 7.0.8 | `copyProperties` 是复制匹配 bean 属性的便利方法；目标不存在的属性会被忽略，API 不承诺领域规则或深复制。 |

### 映射、对象图与级联边界

| ID | 第一方来源 | 类型 | 版本 | 直接支持的结论 |
| --- | --- | --- | --- | --- |
| `mapstruct-1-6-3-release` | [MapStruct 1.6.3 bug fix released](https://mapstruct.org/news/2024-11-09-mapstruct-1_6_3_bug-fix-released/) | `release-note` | MapStruct 1.6.3 | 固定现代研究使用的稳定发布版本，不把 `stable` 漂移链接当版本证据。 |
| `mapstruct-1-6-reference` | [MapStruct 1.6 Reference Guide](https://mapstruct.org/documentation/1.6/reference/html/) | `official-reference` | MapStruct 1.6.3 | 通过注解处理器生成普通 Java 映射代码；支持嵌套路径，未映射目标字段可配置 ERROR/WARN/IGNORE。 |
| `mapstruct-1-6-context` | [MapStruct 1.6 `Context`](https://mapstruct.org/documentation/1.6/api/org/mapstruct/Context.html) | `api-doc` | MapStruct 1.6.3 | context 参数会传给嵌套映射和生命周期方法；官方示例用调用方提供的上下文跟踪循环，不是自动消环。 |
| `mapstruct-cycle-example` | [MapStruct 循环映射示例固定快照](https://github.com/mapstruct/mapstruct-examples/blob/3f9fd5ffe9e2272b6219a4216e842f8c009d1005/mapstruct-mapping-with-cycles/src/main/java/org/mapstruct/example/mapper/CycleAvoidingMappingContext.java) | `official-source` | 固定 commit | 示例通过 `IdentityHashMap` 记录已映射实例；只能证明该显式方案，不能写成 MapStruct 自动处理任意循环。 |
| `jackson-object-mapper-2-20-2` | [Jackson Databind 2.20.2 `ObjectMapper`](https://github.com/FasterXML/jackson-databind/blob/jackson-databind-2.20.2/src/main/java/com/fasterxml/jackson/databind/ObjectMapper.java) | `official-source` | Jackson Databind 2.20.2 | 覆盖 POJO/JSON Tree 读写与转换；首次读写后配置应保持稳定；`convertValue` 不支持对象身份等高级转换场景。 |
| `jackson-managed-reference-2-20` | [Jackson 2.20 `JsonManagedReference`](https://github.com/FasterXML/jackson-annotations/blob/jackson-annotations-2.20/src/main/java/com/fasterxml/jackson/annotation/JsonManagedReference.java) | `official-source` | Jackson Annotations 2.20 | 标记双向链接的前向、正常序列化一侧。 |
| `jackson-back-reference-2-20` | [Jackson 2.20 `JsonBackReference`](https://github.com/FasterXML/jackson-annotations/blob/jackson-annotations-2.20/src/main/java/com/fasterxml/jackson/annotation/JsonBackReference.java) | `official-source` | Jackson Annotations 2.20 | 标记反向一侧；该属性不按普通属性序列化。 |
| `jackson-identity-info-2-20` | [Jackson 2.20 `JsonIdentityInfo`](https://github.com/FasterXML/jackson-annotations/blob/jackson-annotations-2.20/src/main/java/com/fasterxml/jackson/annotation/JsonIdentityInfo.java) | `official-source` | Jackson Annotations 2.20 | 首次输出完整对象、后续可输出对象 ID；对象身份合同不直接支持数组、List 或 Map 类型本身。 |
| `jakarta-validation-3-1` | [Jakarta Validation 3.1 Specification](https://jakarta.ee/specifications/bean-validation/3.1/jakarta-validation-spec-3.1.html) | `specification` | Jakarta Validation 3.1 | `@Valid` 级联关联与容器元素；同一导航路径上已访问实例不再级联，避免校验遍历无限循环。 |
| `jakarta-valid-3-1` | [Jakarta Validation 3.1 `Valid`](https://jakarta.ee/specifications/bean-validation/3.1/apidocs/jakarta/validation/valid) | `api-doc` | Jakarta Validation 3.1 | 标记属性、参数或返回值进行递归级联校验；它不定义 mapper 或 JSON 序列化行为。 |

### Java 8 与 Spring Boot 2.3 legacy 线

| ID | 第一方来源 | 类型 | 版本 | 直接支持的结论 |
| --- | --- | --- | --- | --- |
| `java8-object` | [Java 8 `Object`](https://docs.oracle.com/javase/8/docs/api/java/lang/Object.html) | `api-doc` | Java 8 | Java 8 的 `equals`/`hashCode` 合同与现代线一致。 |
| `java8-unmodifiable-list` | [Java 8 `Collections.unmodifiableList`](https://docs.oracle.com/javase/8/docs/api/java/util/Collections.html#unmodifiableList-java.util.List-) | `api-doc` | Java 8 | 返回底层列表的不可修改视图；独立快照需要先复制再包装。 |
| `java8-deque` | [Java 8 `Deque`](https://docs.oracle.com/javase/8/docs/api/java/util/Deque.html) | `api-doc` | Java 8 | Java 8 已支持用 FIFO/LIFO 操作表达 BFS/DFS。 |
| `java8-enum` | [Java 8 `Enum`](https://docs.oracle.com/javase/8/docs/api/java/lang/Enum.html) | `api-doc` | Java 8 | `name`/`ordinal` 合同与现代线相同，外部 code 仍需显式映射。 |
| `jvms8-class-version` | [JVMS 8 §4.1 ClassFile Structure](https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.1) | `specification` | Java 8 | Java 8 class major version 为 52。 |
| `spring-boot-2-3-system-requirements` | [Spring Boot 2.3.12 System Requirements](https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements) | `official-reference` | Spring Boot 2.3.12.RELEASE | 要求 Java 8、兼容至 Java 15，并要求 Spring Framework 5.2.15.RELEASE 或以上。 |
| `spring-boot-2-3-dependencies` | [Spring Boot 2.3.12 Dependency Versions](https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/appendix-dependency-versions.html) | `official-reference` | Spring Boot 2.3.12.RELEASE | 受管线包含 Jackson 2.11.4、`javax.validation-api` 2.0.1.Final 和 Hibernate Validator 6.1.7.Final。 |
| `spring5-bean-utils` | [Spring Framework 5.2.15 `BeanUtils`](https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/beans/BeanUtils.html) | `api-doc` | Spring Framework 5.2.15.RELEASE | legacy 版本同样只复制匹配 bean 属性；不提供深复制、字段授权或领域映射保证。 |
| `bean-validation-2-0` | [Bean Validation 2.0 Specification](https://beanvalidation.org/2.0/spec/) | `specification` | Bean Validation 2.0 | Java 8 / `javax.validation` 线支持级联和容器元素约束，并定义对象图的循环防护。 |

## 关键合同与课程结论

### 值对象：先冻结语义，再选择 record 或 final 类

1. 本课把“按全部属性判断相等、创建后不改变、构造时满足不变量”的小类型称为值对象；这是课程建模
   约定，不是 `record` 自动授予的领域身份。
2. record 固定组件引用并生成按组件工作的派生方法，但不会复制组件指向的集合或可变对象。
3. `List.copyOf` 提供不可修改快照，不会让元素深度不可变；`unmodifiableList` 只是底层列表视图。
4. 普通 final 类必须让 `equals` 和 `hashCode` 使用同一组值字段；对象作为哈希键后不能改变参与哈希的
   状态。
5. 坐标、金额或范围必须把单位、范围和换算方向写进类型/方法合同；冻结项目场景不证明任何具体单位。

### 对象映射：目标字段列表就是边界合同

1. 手写 mapper 把允许进入目标对象的字段显式列出，可表达重命名、脱敏、单位与 enum code 转换。
2. Spring `BeanUtils.copyProperties` 只说明匹配 bean 属性的便利复制，不证明字段权限相同、没有别名、
   已完成深复制或满足领域规则。
3. MapStruct 可把未映射目标属性提升为编译错误；是否启用 `ERROR` 是课程/项目配置决定，不是默认保证。
4. `ObjectMapper.convertValue` 不能替代领域 mapper，尤其不承诺对象身份、多态、权限或跨边界不变量。
5. 本课响应 mapper 固定不输出 `internalNote` 与 parent 对象；fixture 应对目标值和字段白名单做可观察断言。

### 树结构：先验证扁平关系，再生成可遍历快照

1. `TreeMap` 是按键排序的 Map，不是领域层级树；本课树由 `id`、`parentId`、`children` 表达。
2. 课程合同固定单根、单父、全部节点可从根到达且无环，因此重复 ID、孤儿、多根和循环均必须失败。
3. 构建过程先建立唯一 ID 索引，再验证 parent 存在性和每条父链，最后才连接并发布结果。
4. BFS 使用 FIFO `Deque`；迭代 DFS 使用 LIFO `Deque`，反向压入 children 以保持兄弟顺序。
5. 递归冻结/映射代码更短，但外部可控深度可能耗尽调用栈；本批只验证小型示例，不声称已证明任意深度。
6. `Map.computeIfAbsent` 可用于索引或分组，但映射函数不应反向修改同一 Map；课程主线用显式循环更利于
   初学者观察重复、孤儿和连接步骤。

### 对象图、校验与序列化不能混为一谈

1. Validation 规范对级联校验路径做循环防护，不等于 Jackson、手写递归或 MapStruct 自动安全。
2. Jackson 的 managed/back reference 与 identity 是版本化序列化工具；本课主线更简单：领域节点不持有
   parent 对象，输出 DTO 只沿 children 单向展开。
3. MapStruct 官方循环示例依赖显式 context 和 identity map；调用方不传 context 时不能假设框架补建。
4. 本课 fixture 不解析 JSON，也不加载 MapStruct/Spring；相关框架结论由直接来源支撑，运行证据只覆盖
   纯 Java 值合同、白名单映射、构树与遍历。

## I-19 知识点冻结

正式课程复用现有 16 个递进知识点，不再新增第五条主线：

1. 值对象是什么，以及它与实体、DTO 的身份/边界差异。
2. record 组件、紧凑构造器和创建时不变量。
3. 浅不可变、集合快照、只读视图与元素可变性。
4. 值相等、`equals`/`hashCode` 一致和可变哈希键风险。
5. 带单位坐标/范围值与命名转换方法。
6. enum 稳定外部 code，为什么不使用 `ordinal` 或直接依赖 `name`。
7. DTO 字段白名单与输入/领域/持久化/输出所有权。
8. 手写、编译期生成和反射 mapper 的适用边界。
9. null、默认值、未知 code 与部分更新语义。
10. 嵌套 DTO、集合顺序、重复项和结果快照。
11. 扁平父子记录、临时可变节点与最终只读节点。
12. ID 索引、两遍连接和为什么校验发生在发布之前。
13. 重复 ID、空 ID、孤儿、多根、环和不可达数据的失败合同。
14. BFS/DFS、FIFO/LIFO 与稳定兄弟顺序。
15. 单向响应树、parent ID 与对象回指的区别。
16. Java 8 final 类、显式 getter、复制后只读包装与传统控制流的等价合同。

每个知识点仍需覆盖“是什么、作用、什么时候用、怎么用、结果、常见误区”，但不得重复相邻课程的
基础章节，也不得以继续延长 `estimatedMinutes` 解决内容负担。

## 易错点取证矩阵

| 易错点 | 现象与触发条件 | 原因与后果 | 正确写法与验证 | 直接来源 |
| --- | --- | --- | --- | --- |
| 把 record 当深度不可变 | 保存外部可变 List 后，源列表变化进入 record；或元素状态继续变化 | record 只固定组件引用；缓存键、响应和并发读取可能漂移 | 对集合建立快照，并让元素也不可变或逐项复制；分别修改源列表、返回列表和可变元素 | `jls25-record-classes`、`jep395-records`、`java25-list-copyof` |
| 把只读视图当快照 | `unmodifiableList(source)` 后修改 source，视图同步变化 | wrapper 禁止通过视图修改，不接管底层所有权 | Java 25 用 `List.copyOf`；Java 8 先 `new ArrayList<>(source)` 再包装 | `java25-unmodifiable-list`、`java8-unmodifiable-list` |
| 用 enum ordinal/name 当外部 code | 调整声明顺序或重命名后历史数据错配 | 平台字段不是产品协议，未知值还可能被静默吞掉 | 保存显式稳定 code，未知 code 抛带原值的异常；运行 UNKNOWN 负例 | `java25-enum`、`java8-enum` |
| 同名属性全复制 | `internalNote` 或权限字段进入响应 | 同名不表示单位、权限和生命周期相同 | 手写白名单或显式 MapStruct mapping，精确断言目标字段；不把 copy 成功当业务正确 | `spring7-bean-utils`、`spring5-bean-utils`、`mapstruct-1-6-reference` |
| 误以为生成式 mapper 自动消环 | 映射 parent/children 双向图时递归不止 | 官方方案依赖显式 `@Context` 和已映射实例表 | 本课输出改成单向 DTO；确需保留图身份时显式传 context 并单独验收 | `mapstruct-1-6-context`、`mapstruct-cycle-example` |
| 构树只找一个 root | 页面缺节点、孤儿被丢弃，或独立环未被访问 | 找到根不证明所有节点可达且无环 | 在连接/冻结前检查唯一 ID、parent 存在、根数和每条父链；逐个运行负例 | 本课 D 级合同、`java25-deque` |
| DFS 兄弟顺序反转 | 显式栈正序压入 children 后输出与输入相反 | LIFO 会先弹最后压入的节点 | 逆序压栈，固定 `root,a,a1,b`；BFS 固定 `root,a,b,a1` | `java25-deque`、`java8-deque` |
| 把校验防环当序列化防环 | `@Valid` 正常结束，却仍在 JSON 或 mapper 中递归 | 三个子系统拥有不同遍历合同 | 分别设计校验、映射和响应结构；fixture 只声称证明自己运行过的边界 | `jakarta-validation-3-1`、Jackson/MapStruct 直接来源 |

## 冻结项目证据边界

本批只读取冻结矩阵，不重新扫描项目源码：

| 来源能力 | 冻结证据 | 代表符号 | 课程用途与限制 |
| --- | --- | --- | --- |
| `JAVA-ENGINEERING-031` 对象映射与值转换 | `projectEvidenceCount: 175`；来源含编码、查找、对象/分类/类型/值转换与 BeanUtils | `YjStatus`、`AJFL`、`AymsJc`、`BeanUtil`、`TuDmKzCategoryConstant` | `observed`：证明映射场景丰富，不证明反射复制、枚举编码或字段选择正确 |
| `JAVA-ENGINEERING-032` 领域规则、树结构与坐标值对象 | `projectEvidenceCount: 15`；来源含比例、领域规则、树、坐标与换算合同 | `AiXntjMetricsCalculator`、`DqUtils`、`TsjdStageUtil`、`AiXntjCourtTreeHelper`、`PdfKeywordPositionUtil` | `observed`：证明建模优先级，不证明具体单位、树不变量或算法正确 |

项目路径、符号和数量来自审计快照，只能作为课程选题证据。正式示例继续使用中性的 `Point`、
`FlatNode`、`FolderRow`、`FolderView` 与 `NodeKind`，不得复制业务字段、包名、权限信息或输入载荷。

## 实施阶段临时 fixture 验收合同

研究阶段不执行 fixture。实施阶段必须在 `/tmp` 的 `mktemp -d` 目录建立现代和 legacy 两个独立
fixture；成功后删除整个临时目录，并以路径不存在性检查证明没有向仓库保留测试文件。

### Java 25 待执行反馈环

从课程完整代码提取或最小调整 `DomainValuesFeedback.java`，使用真实 Java 25 工具链：

1. `javac -Xlint:all -Werror --release 25` 编译通过，`javap -verbose` 显示 major 69。
2. `Point(10, 20).scale(0.5)` 等于 `Point(5, 10)`，两个相等值产生相同 hash code。
3. 值对象复制源 List；修改源列表不影响结果，对结果列表调用修改方法明确失败。
4. `NodeKind` 按显式 code 解析，`UNKNOWN` 模式非零退出并保留原始 code。
5. `FolderRow(id, name, internalNote)` 映射为 `FolderView(id, name)`，可观察结果不含内部备注。
6. 合法 4 节点树输出稳定 BFS `root,a,b,a1` 和 DFS `root,a,a1,b`。
7. `DUPLICATE`、`ORPHAN`、`MULTI_ROOT`、`CYCLE` 分别非零退出；消息保留重复 ID、缺失 parent、
   根数量或循环节点，不能只断言“抛了异常”。
8. 正向流程连续运行两次，输出和节点计数一致，不在仓库生成任何文件。

稳定正向证据固定为：

```text
DOMAIN_VALUES_PASS nodes=4 bfs=4 dfs=4
```

研究批检查的实施前课程快照已经覆盖 Point、白名单映射、BFS/DFS 和
UNKNOWN/DUPLICATE/ORPHAN/CYCLE，但尚未在同一完整反馈环中可观察地证明集合快照，也没有
`MULTI_ROOT` 模式。实施批应补最小断言/模式，或在 signoff 中如实缩小声明；不能让知识点示例替代
完整反馈环证据。

### Java 8 待执行兼容反馈环

在真实 Java 8 runtime 中编译运行 `DomainValuesLegacyFeedback.java`：

1. 使用 final 类、构造器、getter、显式 `equals`/`hashCode`、复制后
   `Collections.unmodifiableList`、传统 `if/switch`，不使用 record、`List.copyOf`、switch expression
   或模式匹配。
2. 复跑现代线同一组值、快照、显式 code、白名单映射、BFS/DFS 和五个失败合同。
3. `javac -Xlint:all -Werror` 编译通过，`javap -verbose` 显示 major 52。
4. 正向流程连续运行两次，固定输出：

```text
DOMAIN_VALUES_LEGACY_PASS nodes=4 bfs=4 dfs=4
```

研究批检查的实施前 legacy 完整代码已覆盖 Point、树与 UNKNOWN/DUPLICATE/ORPHAN/CYCLE，但没有
白名单映射、集合快照可观察断言或 `MULTI_ROOT` 模式。实施批应补齐同一教学合同。Java 25 上的
`--release 8` 只能证明源/字节码目标兼容，不能冒充真实 Java 8 runtime 证据。

### 框架声明边界

- 纯 Java fixture 不解析 Maven/Spring/Jackson/MapStruct 依赖，因此不能写成这些框架版本已编译运行。
- Spring Boot 4.1.0 / 2.3.12、Spring Framework 7.0.8 / 5.2.15、Jackson 2.20.2/2.20 和
  Validation 3.1/2.0 只由相应官方来源绑定。
- 如实施批决定增加框架 fixture，必须另行冻结依赖和精确输出，不能扩大本研究批的完成声明。

## 课程编写约束

1. 保留稳定 ID、slug、标题和现有页面；只按 Phase C 修正 150 分钟、唯一前置 I-18 与核验日期。
2. 先解释值/实体/DTO 所有权，再讲 record；先定义映射字段合同，再比较手写、生成式与反射工具。
3. 构树必须按“索引 -> 关系校验 -> 连接 -> 遍历/映射”呈现，不让坏数据先进入递归冻结。
4. 现代主线使用 Java 25；Java 8 写法独立放在 legacy 章节，不把 Boot 2.3 声称为支持 Java 25。
5. Java 方法和构造器定义上方保留规范中文注释；错误代码只放在易错点/对比语境。
6. frontmatter `sources` 只选择正文实际使用的直接来源；正文不再追加重复参考资料列表。
7. `projectEvidence` 只使用冻结矩阵的代表符号并保持 `observed`，不得把项目候选场景写成已验证实现。
8. 不写“MapStruct/手写必然更快”或“索引构树已经满足任意规模”；本批没有 JMH/JFR 或深树测量。

## 研究 Gate

- [x] I-19 标题、稳定 ID、150 分钟、唯一前置 I-18 与 Phase A 冻结路线一致。
- [x] 旧顺序 460、17/17 和两个旧前置已降级为历史审计快照，不再作为发布合同。
- [x] 现代 Java 25 / Boot 4.1.0 / Spring 7.0.8 与 Java 8 / Boot 2.3.12 / Spring 5.2.15 隔离。
- [x] 36 个唯一来源 URL 覆盖 record、不可变集合、相等性、enum、Deque、MapStruct、Jackson、
  Validation、BeanUtils、class major 与双平台版本边界；31/36 curl HTTP 200，5/36 GitHub 固定源码
  由 Exa 成功读取且当前机器 curl 连接超时。
- [x] 16 个知识点只围绕值对象、字段映射、树校验/遍历和单向响应，没有扩展相邻课程。
- [x] 八个易错点具备触发条件、原因、后果、修正方式、验证与直接来源。
- [x] 双版本 fixture 仅写成实施验收合同，并如实标出当前完整代码尚缺的快照、白名单/多根证据。
- [x] 本批只修改 I-19 研究稿，不修改课程、track、loader、signoff、Phase 文档或后续课程资产。

## Stop Boundary

本文件只完成 Phase C I-19 的官方研究冻结。研究完成不等于课程正文完成、双版本 fixture 通过、
runtime 发布、浏览器验收或 signoff 关闭。父任务必须继续完成 I-19 最小课程调整、临时反馈环、定向与
工程 Gate、桌面/390px 浏览器验证以及按风险要求的独立复审与原位 signoff；I-19 完整关闭前不得进入
下一课程批次，也不得进入 Phase D。
