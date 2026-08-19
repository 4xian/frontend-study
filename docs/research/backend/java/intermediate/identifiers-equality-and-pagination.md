# 标识符、相等性与稳定排序研究记录

## 冻结课程合同

- `courseId`：`backend.java.learn.intermediate.identifiers-equality-and-pagination`
- `title`：标识符、相等性与稳定排序
- `purpose / collection / level / depth`：`learn / intermediate / intermediate / lesson`
- `sequence`：`310`
- `prerequisites`：
  `[backend.java.learn.intermediate.lambda-stream-and-collectors]`
- `related`：`[]`
- `sourceCapabilityIds`：`[JAVA-STDLIB-032, JAVA-ENGINEERING-033]`
- Phase 2 历史 `origin`：`[project-observed]`；它只说明路线来自项目场景，不等于本批已有可登记的
  `projectEvidence`
- `modernBaseline`：Java 25 LTS
- `legacyBaseline`：Java 8，只作兼容边界
- Phase C 状态：本文件完成 `research-frozen`；课程正文、示例、manifest、浏览器验收与
  signoff 均未在本批执行。

本课只回答三组问题：如何生成、解析和传递稳定标识符；Java 如何区分引用相等、值相等与哈希合同；
如何建立可复用、无溢出且结果确定的排序合同。现有 `courseId` 与文件名中的 `pagination` 是当前规划记录，
本研究批不授权修改 track、loader 或路由标识，也不把该历史命名解释为本课仍教授分页。

## 范围冻结与迁移边界

### I-02 纳入

1. `UUID.randomUUID()`、`UUID.fromString()`、`UUID.toString()` 与类型/字符串边界。
2. 标识符、可变业务属性、显示编号和授权凭证之间的边界。
3. 引用类型的 `==` / `!=` 与 `Object.equals` / `hashCode` 合同。
4. `HashMap` 键、`HashSet` 元素参与相等性的字段被修改后的风险。
5. `Comparable` 自然排序、`Comparator` 场景排序及 `thenComparing`。
6. 避免用减法实现数值比较，改用 `Integer.compare` / `Long.compare`。
7. 稳定排序的准确语义，以及“稳定算法”与“确定性总序”的区别。
8. 主排序字段相同时必须追加非空、唯一、稳定 ID 作为最终 tie-breaker。
9. Java 25 主线与 Java 8 可共同实现的 API、语义和已知解析差异。

### 从 I-02 移出

| 内容 | 去向 | 本课保留的唯一接口 |
| --- | --- | --- |
| 页码、页大小、0/1 基、默认值、上限、参数校验与 offset 计算 | I-09 | I-09 复用本课的确定性排序前置合同 |
| items、total、hasNext 等响应字段与 total 不可得语义 | I-09 | 不在 I-02 定义分页响应 |
| 请求页超出范围后的空结果、报错或归一化策略 | I-09 | 不在 I-02 决定越界行为 |
| SQL offset、keyset/cursor、索引设计与查询计划 | 数据库专项课程 | 不在内存排序示例中推导数据库保证 |

I-02 不再引用 Spring Data、PageHelper 或 `OptionalLong` 证明分页语义，也不保留任何分页 DTO、分页结果或
分页 fixture。稳定排序本身不能证明未声明完整排序键的数据库查询具有确定顺序。

## 核验基线

| 项目 | 核验结果 |
| --- | --- |
| 核验日期 | 2026-08-15 |
| 搜索链路 | 先用 Tavily 定位候选，再回到 Oracle Java API、JLS、OpenJDK Bug System 与 OWASP 官方原文核验 |
| 现代主线 | Java 25 的 `UUID`、`Object`、集合与排序合同 |
| 兼容线 | Java 8 官方 API 与 OpenJDK 已知缺陷记录；实际验证绑定 Eclipse Temurin 8u492 固定镜像 |
| 研究边界 | 仅重冻本文件；未读取其他课程，未改正文、track、loader、signoff，未创建测试 |

## 官方来源卡

| ID | 一手来源 | sourceType | 支持结论 |
| --- | --- | --- | --- |
| `api25-uuid` | [Java 25 UUID](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/UUID.html) | `api-doc` | 128 位不可变值、type 4 生成、标准字符串、解析、相等、哈希与自然排序 |
| `jls25-reference-equality` | [JLS 25 §15.21.3](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.21.3) | `specification` | 引用 `==` / `!=` 判断是否指向同一对象或同为 `null` |
| `jls25-records` | [JLS 25 §8.10 Record Classes](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.10) | `specification` | record 组件与自动生成的 `equals`、`hashCode` 合同 |
| `api25-object` | [Java 25 Object](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html) | `api-doc` | `equals` 等价关系与 `hashCode` 一致性合同 |
| `api25-map` | [Java 25 Map](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html) | `api-doc` | 修改键中影响 `equals` 的状态后，Map 行为未定义 |
| `api25-set` | [Java 25 Set](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Set.html) | `api-doc` | 修改元素中影响 `equals` 的状态后，Set 行为未定义 |
| `api25-hash-map` | [Java 25 HashMap](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashMap.html) | `api-doc` | 键查找按键相等合同识别映射，迭代顺序不作保证 |
| `api25-hash-set` | [Java 25 HashSet](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashSet.html) | `api-doc` | 基本操作依赖哈希分散，内部由 `HashMap` 支撑 |
| `api25-comparable` | [Java 25 Comparable](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Comparable.html) | `api-doc` | 自然总序及与 `equals` 一致性的建议 |
| `api25-comparator` | [Java 25 Comparator](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Comparator.html) | `api-doc` | 外部总序、比较器合同和词典式 `thenComparing` |
| `api25-list` | [Java 25 List](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#sort(java.util.Comparator)) | `api-doc` | `List.sort` 保证比较结果为 0 的元素保留相对顺序 |
| `api25-collections` | [Java 25 Collections](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Collections.html) | `api-doc` | `sort` 保证稳定，相等元素不会因排序而重排 |
| `api25-integer` | [Java 25 Integer](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Integer.html#compare(int,int)) | `api-doc` | `Integer.compare` 正确返回负数、0 或正数 |
| `jls25-integer-overflow` | [JLS 25 §4.2.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.2.2) | `specification` | 整数运算不会以任何方式报告溢出或下溢 |
| `owasp-idor` | [OWASP IDOR Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html) | `security-standard` | GUID 只能降低猜测难度，不能替代逐对象授权检查 |
| `api8-uuid` | [Java 8 UUID](https://docs.oracle.com/javase/8/docs/api/java/util/UUID.html) | `api-doc` | Java 8 已有本课所需 UUID 核心 API |
| `api8-object` | [Java 8 Object](https://docs.oracle.com/javase/8/docs/api/java/lang/Object.html) | `api-doc` | Java 8 的 `equals/hashCode` 核心合同一致 |
| `api8-objects` | [Java 8 Objects](https://docs.oracle.com/javase/8/docs/api/java/util/Objects.html) | `api-doc` | Java 8 已有 null-safe `Objects.equals` 与多字段 `Objects.hash` |
| `api8-map` | [Java 8 Map](https://docs.oracle.com/javase/8/docs/api/java/util/Map.html) | `api-doc` | Java 8 同样警告不得修改键中影响 `equals` 的状态 |
| `api8-set` | [Java 8 Set](https://docs.oracle.com/javase/8/docs/api/java/util/Set.html) | `api-doc` | Java 8 同样警告不得修改元素中影响 `equals` 的状态 |
| `api8-comparable` | [Java 8 Comparable](https://docs.oracle.com/javase/8/docs/api/java/lang/Comparable.html) | `api-doc` | Java 8 的自然排序与 equals 一致性合同 |
| `api8-comparator` | [Java 8 Comparator](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html) | `api-doc` | Java 8 已有 `comparing` 与 `thenComparing` |
| `api8-list` | [Java 8 List](https://docs.oracle.com/javase/8/docs/api/java/util/List.html#sort-java.util.Comparator-) | `api-doc` | Java 8 的 `List.sort` 已保证稳定 |
| `api8-integer` | [Java 8 Integer](https://docs.oracle.com/javase/8/docs/api/java/lang/Integer.html#compare-int-int-) | `api-doc` | Java 8 已有 `Integer.compare` |
| `api8-collections` | [Java 8 Collections](https://docs.oracle.com/javase/8/docs/api/java/util/Collections.html) | `api-doc` | Java 8 的 `Collections.sort` 已保证稳定 |
| `openjdk-8159339` | [JDK-8159339](https://bugs.openjdk.org/browse/JDK-8159339) | `official-reference` | Java 8u92 的 `UUID.fromString` 可接受部分非规范文本，结论为 Won't Fix |

## 研究结论

### 1. UUID 负责标识，不负责业务授权

`UUID` 是不可变的 128 位值。`UUID.randomUUID()` 返回 type 4 伪随机 UUID，并使用密码学强度的伪随机
数生成器；这支持课程把它作为无中心协调示例中的标识符，但不能据此宣称绝对无碰撞、单调递增、按时间
有序或适合数据库局部性。[来源：`api25-uuid`]

`toString()` 输出由五段十六进制字段和四个连字符组成的标准表示，`fromString()` 从该标准表示构造
`UUID`，不符合时按 API 合同抛出 `IllegalArgumentException`。课程内部保持 `UUID` 类型，仅在 HTTP、
JSON、日志或文本存储等序列化边界转为字符串；解析失败属于边界输入错误，不应降级为新 ID 或 `null`。
[来源：`api25-uuid`]

标识符回答“是哪一个对象”，姓名、标题、状态等可变或可重复属性回答“对象现在是什么样”。标识符也不
等于登录身份、权限或安全 token。OWASP 明确指出，即使 GUID 难以猜测，每次对象访问仍必须执行授权
检查；因此“拿到 UUID”不构成访问许可。[来源：`owasp-idor`]

课程实体在创建时生成一次非空 UUID，此后跨 DTO、持久化与展示边界原样传递，不在查询、映射或渲染时
重新生成，也不设计“尚未分配 ID”的中间状态。实体身份由该不可变 ID 表达；值对象的相等性则由全部
不可变语义字段表达，不能把两种模型机械混用。`UUID.compareTo` 可作为确定的 tie-breaker，但其顺序不
表示 UUID 的创建时间。[来源：`api25-uuid`]

### 2. `==` 是引用相等，`equals` 是类型定义的值合同

对引用类型，`a == b` 只在两者指向同一对象或都为 `null` 时为 `true`；它不读取对象字段，也不调用
`equals`。JLS 以 `String` 为例说明：两个不同对象即使字符内容相同，引用比较仍可为 `false`。
[来源：`jls25-reference-equality`]

`Object.equals` 的默认实现是身份相等。类只有在需要值语义时才覆盖它；覆盖后的关系必须满足：

- 自反：`x.equals(x)` 为 `true`。
- 对称：`x.equals(y)` 与 `y.equals(x)` 结果相同。
- 传递：`x.equals(y)` 且 `y.equals(z)` 时，`x.equals(z)`。
- 一致：参与相等判断的信息不变时，多次调用结果不变。
- 非空对象与 `null` 比较为 `false`。

课程使用不可变、边界清晰的值对象演示该合同，不在可扩展继承层级中增加不必要的跨类型相等规则。
[来源：`api25-object`]

### 3. 覆盖 `equals` 时必须同步覆盖 `hashCode`

在一次程序执行中，只要 `equals` 使用的信息未改变，同一对象的 `hashCode` 应保持一致；两个对象若
`equals` 为 `true`，哈希值必须相同。反向不成立：不同对象允许拥有相同哈希值，所以 `hashCode` 不是
唯一 ID、去重凭证或授权 token。[来源：`api25-object`]

值对象必须先冻结“哪些不可变字段定义相等”，再让 `equals` 与 `hashCode` 使用同一组字段。课程验收必须
同时展示：分别构造的等值对象可相等、等值对象哈希相同、`HashMap` 可用等值键取回值、`HashSet` 可识别
重复值；不把“所有不等对象哈希都不同”列为断言。Java 8 已提供 null-safe 的 `Objects.equals` 与多字段
`Objects.hash`，可用于实现共同示例，但它们不会替代“哪些字段定义相等”的建模决定。
[来源：`api8-objects`]

### 4. HashMap 键和 HashSet 元素的相等字段不得在驻留期间变化

`Map` 官方合同明确说明：对象作为键期间，若对象变化会影响 `equals`，Map 的行为未定义；`Set` 对集合
元素给出同样警告。`HashMap.get` 按键相等合同寻找映射，`HashSet` 的实现由 `HashMap` 支撑。
[来源：`api25-map`、`api25-set`、`api25-hash-map`、`api25-hash-set`]

因此，放入 `HashMap` / `HashSet` 后再修改参与 `equals/hashCode` 的字段，可能导致 `get`、`contains`、
`remove` 或去重结果异常。课程把这种代码作为负例，不承诺某个特定失败形态；正确做法是使用不可变键，
或先移除、修改后再按新值重新插入。修改完全不参与相等与哈希的展示字段不触发这条集合合同，但仍应由
对象设计明确区分。`HashMap` / `HashSet` 也不提供可作为排序输入合同的固定迭代顺序。

### 5. Comparable 定义自然排序，Comparator 定义场景排序

`Comparable<T>` 把单一、长期稳定的自然顺序放在类型内部；`Comparator<T>` 在调用方表达某个列表、
报表或业务场景的排序。二者都必须形成可传递、符号对称的总序；返回值只表达负数、0 或正数，数值大小
本身没有额外含义。[来源：`api25-comparable`、`api25-comparator`]

自然排序强烈建议与 `equals` 一致：`a.compareTo(b) == 0` 与 `a.equals(b)` 应表达相同等价类。否则
`SortedSet` / `SortedMap` 会把 `equals` 不同但比较结果为 0 的对象视为同一排序位置，产生违反普通
Set/Map 直觉的结果。场景 `Comparator` 可以与 `equals` 不一致，但必须明确其用途，且不能把它误用为
对象身份判断。[来源：`api25-comparable`、`api25-comparator`]

### 6. 比较器不得用减法返回结果

`return leftScore - rightScore` 会在两个 `int` 相差超过范围时溢出；JLS 明确规定整数运算不会以任何方式
报告溢出，因此结果可能反号并破坏排序合同。数值字段使用 `Integer.compare(left, right)` 或
`Long.compare(left, right)`；对象字段使用 `Comparator.comparing`，不要用扩大到 `long` 后再强转
`int` 的变体伪装修复。[来源：`jls25-integer-overflow`、`api25-integer`]

课程负例必须覆盖 `Integer.MIN_VALUE` 与正数/`Integer.MAX_VALUE` 的比较，使减法实现暴露反号；正例
只断言比较结果的符号，不断言固定返回 `-1` 或 `1`。

### 7. 稳定排序不等于确定性总序

`List.sort` / `Collections.sort` 的“稳定”含义很窄：当 `compare(a, b) == 0` 时，排序不会改变这两个
元素在输入列表中的相对顺序。这里的“相等”是比较结果为 0，不要求 `a.equals(b)` 为 `true`。
[来源：`api25-list`、`api25-collections`]

这项保证不能补全缺失的排序键。如果两次输入的原始顺序不同，只按重复的分数、状态或时间排序，稳定
算法仍可能给出不同结果。任何要求跨次读取顺序确定的列表，在主排序字段相同时都必须追加唯一、稳定 ID
作为最终 tie-breaker，例如：

```java
Comparator<Entry> order = Comparator.comparingInt(Entry::score)
    .reversed()
    .thenComparing(Entry::id);
```

`thenComparing` 只在前一个比较器返回 0 时使用后一个比较器，正好表达该规则。最终 ID 必须非空、在该
结果域中唯一且生命周期内不变；否则比较器仍可能对两个不同对象返回 0，确定性总序并未建立。课程示例
冻结为“分数降序，再按 UUID 自然顺序升序”；其他场景必须显式写出主字段方向、ID 方向和 null 策略，
不得依赖默认或来源顺序。
[来源：`api25-comparator`]

本课只在内存 `List` 上证明该合同。I-09 可复用它作为稳定切片的前置条件，但分页参数、响应和越界策略
仍由 I-09 自己定义；SQL 是否真正采用同一完整排序键，留给数据库专项验证。

record 示例只用于说明 Java 25 如何根据声明组件生成值相等与哈希合同，依据 `jls25-records`；本批没有
准入任何可以安全公开的 `dzzz-app` 文件或符号，所以课程正文必须显式使用 `projectEvidence: []`。Phase 2
历史 `origin: [project-observed]` 不能替代具体文件、符号和用途三者齐全的项目证据。

## Java 25 / Java 8 兼容边界

本轮 Java 8 兼容证据绑定实际运行的 Eclipse Temurin 8u492 固定镜像
`eclipse-temurin:8-jdk@sha256:c8b86f2c0a9bd6cc1b7fabc5d1a097501a166eea7cad3b2764e90e96178bea9b`。
以下兼容结论只覆盖官方合同与该不可变镜像上的验收结果，不从浮动标签或其他 Java 8 更新版外推行为。

| 能力 | Java 25 主线 | Java 8 兼容结论 | 课程约束 |
| --- | --- | --- | --- |
| UUID 生成与标准字符串 | `randomUUID/fromString/toString` | 核心 API 已存在 | 共同示例保留 `UUID` 类型至序列化边界 |
| 引用与值相等 | JLS 25、Object 25 | 核心合同一致，已有 `Objects.equals/hash` | 同一值对象实现可双版本编译 |
| HashMap/HashSet 可变键风险 | Map/Set 明确警告 | Java 8 同类合同一致 | 键和集合元素的相等字段保持不可变 |
| 数值比较 | `Integer.compare/Long.compare` | Java 8 已支持 | 禁止减法比较器 |
| Comparator 组合 | `comparing/thenComparing` | 这些 API 自 Java 8 提供 | 主字段后追加稳定唯一 ID |
| 稳定排序 | `Collections.sort` 保证稳定 | Java 8 已有同一保证 | 不把稳定算法等同于确定性总序 |
| UUID 文本严格性 | Java 25 API 要求标准表示 | 官方缺陷证明至少 Java 8u92 可接受部分非规范文本 | 跨版本边界先校验规范形状，或解析后做规范化 round-trip 核对 |

Java 8 的 `UUID.fromString` 文档同样声称非标准表示应抛 `IllegalArgumentException`，但 OpenJDK
`JDK-8159339` 记录了 8u92 可吞掉额外前导十六进制位，并以 Won't Fix 关闭。因此课程不能把“
`fromString` 未抛异常”作为跨 Java 8/25 的唯一格式校验。兼容示例应先限制为 8-4-4-4-12 的十六进制
形状，并在解析后将 `toString()` 与输入做大小写无关的完整 round-trip 比较。
[来源：`api8-uuid`、`openjdk-8159339`]

共同示例只使用 Java 8 已存在的类与方法，不使用 record、模式匹配、`HashMap.newHashMap` 或
`HashSet.newHashSet` 等后续版本能力。Java 25 是解释与验证主线，Java 8 只证明同一教学合同可以落地，
不把旧运行时的实现差异提升为现代推荐行为。

## 正文与示例验收合同

后续实现必须用最小示例覆盖以下行为；本研究批不创建或运行测试：

1. type 4 UUID 生成、标准字符串 round-trip、非法文本被拒绝，且 UUID 不被当作授权凭证。
2. 两个字段相同但分别创建的值对象：`==` 为 `false`，`equals` 为 `true`，哈希相同。
3. 等值键可从 `HashMap` 取值、`HashSet` 可去重；修改相等字段的负例只说明风险，不依赖固定失败表现。
4. `Comparable` 只承担一种自然顺序，场景顺序用 `Comparator` 组合。
5. 减法比较器在整数极值上失败，`Integer.compare` 修正。
6. 单独证明稳定排序保留等价元素的输入顺序，再证明打乱输入时仅靠重复主字段不能产生确定顺序。
7. 主字段后追加非空、唯一、稳定 UUID，打乱输入后仍得到完全一致的顺序。
8. 示例源码保持 Java 8 可编译；Java 25 运行同一行为，不引入分页参数或结果类型。

## 未决风险

1. `courseId` 与文件名仍含 `pagination`，而冻结标题和正文范围已移除分页；本批无权修改 track、loader
   或路由，后续实施必须核对展示标题与稳定 ID 的迁移策略。
2. Java 8 `UUID.fromString` 的实际行为随具体更新版可能不同；本轮只绑定上述 Temurin 8u492 digest，
   不能从 Java 25 或该镜像的结果外推其他 Java 8 更新版。
3. 唯一 ID tie-breaker 依赖“结果域内唯一且生命周期稳定”的上游数据合同；若该前提未被数据模型保证，
   I-02 只能报告前提缺失，不能宣称已形成确定性总序。
4. 本课没有证明任何 SQL 排序、索引或并发快照行为；这些结论不得从内存 `List` 示例外推。

## 研究 Gate 自检

- [x] UUID 生成、解析、标准字符串与身份/授权边界均有官方来源。
- [x] `==`、`equals/hashCode` 以及 HashMap/HashSet 可变键风险已冻结。
- [x] Comparable、Comparator、减法溢出与稳定排序语义已冻结。
- [x] 相同主排序字段必须追加唯一稳定 ID tie-breaker 已写成硬性教学合同。
- [x] Java 25 主线与 Java 8 兼容 API、解析差异已分层记录。
- [x] 分页参数、响应、越界迁入 I-09；SQL offset/keyset、索引与查询计划留数据库专项。
- [x] 未读取或修改 I-03 及任何其他课程，未改正文、track、loader、signoff，未创建测试。

## Stop Boundary

本文件只完成 Phase C I-02 官方资料研究重冻。课程正文、manifest、示例、浏览器验证、signoff、I-09
或数据库专项均不在本批授权范围内；关闭本批不自动授权下一课程。
