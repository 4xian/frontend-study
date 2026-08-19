---
id: backend.java.learn.intermediate.identifiers-equality-and-pagination
type: lesson
title: 标识符、相等性与稳定排序
summary: 用稳定标识和相等合同管理对象，并用唯一 tie-breaker 建立可复现的确定性顺序
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 120
prerequisites:
  - backend.java.learn.intermediate.lambda-stream-and-collectors
objectives:
  - 能区分稳定标识符与姓名、标题等普通业务属性。
  - 能创建、解析和传递 UUID，并识别无效字符串。
  - 能解释 ==、equals、Objects.equals 和 hashCode 的不同职责。
  - 能为 HashMap、HashSet 选择不可变且合同一致的键。
  - 能区分 Comparable 自然顺序与 Comparator 场景顺序。
  - 能使用无溢出比较和唯一 ID tie-breaker 建立确定性总序。
recap:
  - 标识符回答对象是哪一个，普通属性描述对象当前是什么样。
  - == 比较引用，equals 比较类型定义的值，hashCode 必须与 equals 保持一致。
  - 哈希键在容器存活期间不能改变参与相等和哈希的字段。
  - 自然顺序属于类型，场景顺序属于调用位置，两者不能混为一谈。
  - 只按可重复字段排序不完整，必须使用稳定唯一字段作为最后的 tie-breaker。
related: []
tags:
  - Java
  - UUID
  - equals
  - hashCode
  - Comparable
  - Comparator
  - 稳定排序
appliesTo: Java 25 主线；Java 8 兼容补充
modernBaseline:
  java: '25'
legacyBaseline:
  java: '8'
verifiedAt: 2026-08-15
sources:
  - id: jls25-reference-equality
    title: Java Language Specification 25 - Reference Equality Operators
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.21.3
    sourceType: specification
    appliesTo: Java 25
    claims:
      - == 与 != 对引用类型比较对象身份或 null 的语言规则
  - id: jls25-records
    title: Java Language Specification 25 - Record Classes
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.10
    sourceType: specification
    appliesTo: Java 25
    claims:
      - record 根据声明组件生成 equals 与 hashCode 合同
  - id: api25-object
    title: Java 25 API - Object
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - equals 的等价关系与 hashCode 一致性合同
  - id: api25-objects
    title: Java 25 API - Objects
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Objects.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - null-safe 相等、哈希与范围检查辅助方法
  - id: api25-uuid
    title: Java 25 API - UUID
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/UUID.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - 128 位 UUID、随机创建、字符串表示、解析、相等与自然排序合同
  - id: api25-comparable
    title: Java 25 API - Comparable
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Comparable.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - 自然顺序与 compareTo 的合同
  - id: api25-comparator
    title: Java 25 API - Comparator
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Comparator.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - 外部比较器、链式排序、逆序、null 策略与相等一致性合同
  - id: api25-list
    title: Java 25 API - List
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - List.sort 使用稳定排序，且比较器必须满足 Comparator 合同
  - id: api25-map
    title: Java 25 API - Map
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - 修改键中影响 equals 的状态后，Map 行为未定义
  - id: api25-set
    title: Java 25 API - Set
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Set.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - 修改元素中影响 equals 的状态后，Set 行为未定义
  - id: api25-hash-map
    title: Java 25 API - HashMap
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashMap.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - HashMap 的键、相等、哈希与无迭代顺序保证
  - id: api25-hash-set
    title: Java 25 API - HashSet
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashSet.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - HashSet 由 HashMap 支撑，并按哈希与 equals 合同识别元素
  - id: api25-integer
    title: Java 25 API - Integer.compare
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Integer.html#compare(int,int)
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - Integer.compare 按数值关系返回负数、0 或正数
  - id: jls25-integer-overflow
    title: Java Language Specification 25 - Integer Operations
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.2.2
    sourceType: specification
    appliesTo: Java 25
    claims:
      - 整数运算不会报告溢出或下溢
  - id: owasp-idor
    title: OWASP Cheat Sheet Series - IDOR Prevention
    url: https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: Web API
    claims:
      - GUID 只能降低猜测难度，不能替代逐对象授权检查
  - id: api8-object
    title: Java 8 API - Object
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/Object.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 equals 与 hashCode 核心合同
  - id: api8-objects
    title: Java 8 API - Objects
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Objects.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 已提供 Objects.equals 与 Objects.hash
  - id: api8-uuid
    title: Java 8 API - UUID
    url: https://docs.oracle.com/javase/8/docs/api/java/util/UUID.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 UUID 创建、解析、相等、哈希与比较能力
  - id: openjdk-8159339
    title: OpenJDK JDK-8159339 - UUID.fromString accepts non-canonical text
    url: https://bugs.openjdk.org/browse/JDK-8159339
    sourceType: official-reference
    appliesTo: Java 8 compatibility boundary
    claims:
      - 至少 Java 8u92 的 fromString 可接受部分非规范 UUID 文本
  - id: api8-comparator
    title: Java 8 API - Comparator
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 comparing、thenComparing、reversed 与 null 排序能力
projectEvidence: []
---

# 标识符、相等性与稳定排序

## 为什么需要学习

后端程序经常同时处理很多“看起来一样”的对象。例如两个学员都叫小林，不代表他们是同一个人；同一
学员修改昵称后，也不应该突然变成另一个人。程序需要一个稳定标识回答“它是哪一个”，再用相等合同回答
“两个值是否应被当成相同”。

排序同样需要明确合同。如果数据只按分数排序，两个同分记录的先后仍由输入顺序决定；只要输入来源或顺序
改变，同一批对象就可能得到不同结果。本课把标识符、相等和排序放在一起，因为稳定 ID 既能定义对象身份，
也能在主要排序字段相同时完成唯一 tie-breaker。

分页参数、分页响应和越界行为将在 I-09 单独讲解。本课只建立它所依赖的确定性总序，不提前教授分页合同。

## 学习目标

- 能区分标识符、普通属性和值对象。
- 能正确使用 UUID 类型和标准字符串。
- 能解释引用相等、值相等与哈希合同。
- 能设计不可变的 Map/Set 键。
- 能区分 Comparable 自然顺序和 Comparator 场景顺序。
- 能写出无溢出、包含唯一 tie-breaker 的 Comparator。

## 前置术语

- **对象身份**：某个运行时对象本身，不等同于对象字段内容。
- **值相等**：两个对象虽然不是同一个实例，但按类型定义的字段应被视为同一个值。
- **哈希值**：把对象映射为 int 的结果，用于帮助哈希容器缩小查找范围，不是唯一编号。
- **自然顺序**：类型自身通过 Comparable 定义的默认顺序。
- **场景顺序**：某个调用位置通过 Comparator 指定的排序方式。
- **tie-breaker**：主要排序字段相同时，用来继续区分先后的字段。

## 零基础知识点详解

### 标识符与普通业务属性

**它是什么：** 标识符是在约定范围内持续指向同一业务对象的值。姓名、标题、状态、价格等字段描述对象
当前“长什么样”，通常允许重复或修改，因此是普通业务属性。

**有什么作用：** 标识符让请求、数据库记录、缓存键和日志可以谈论同一个对象。没有稳定标识时，修改
姓名可能被误认为新对象，两个同名对象也可能被错误合并。

**什么时候使用：** 对象需要跨方法、跨请求或跨存储继续被识别时使用。只在一次局部计算中存在的临时值
不一定需要业务 ID。

**怎么使用：**

1. 先写清唯一范围，例如“在整个系统内唯一”或“只在同一个订单内唯一”。
2. 决定由谁生成、何时生成，以及对象删除后是否允许复用。
3. 在 Java 内部尽量保持明确类型，不要过早把所有 ID 都降为无语义 String。
4. 在 HTTP 或 JSON 边界再按合同序列化，并对输入执行解析和校验。

**最小示例：**

```java
import java.util.UUID;

public record CourseId(UUID value) {
    /** 创建课程标识，并拒绝缺失值。 */
    public CourseId {
        if (value == null) {
            throw new IllegalArgumentException("课程 ID 不能为空");
        }
    }
}
```

**运行结果：** `CourseId` 和普通 String 在编译期就是不同类型，调用者不容易把课程标题误传成课程 ID。

**常见误区：** “看起来随机”不等于“适合作为安全令牌”。ID 只解决识别，授权仍需根据当前用户和资源
关系单独判断。

### UUID 创建、解析与字符串边界

**它是什么：** UUID 是由两个 long 组成的 128 位值。`UUID.randomUUID()` 创建随机型 UUID，
`toString()` 生成标准连字符文本，`fromString()` 把文本解析回 UUID。

**有什么作用：** UUID 可以在不知道数据库自增序列的情况下先创建标识，并能稳定地在 Java、JSON 和
数据库边界间传递。

**什么时候使用：** 需要非顺序标识、多个节点独立生成或在持久化前就需要 ID 时可考虑使用。是否采用
UUID 仍是数据模型选择，不是所有表都必须使用。

**怎么使用：**

1. 创建对象时调用 `UUID.randomUUID()` 得到 UUID 类型。
2. 只在输出边界调用 `toString()`。
3. 接收外部字符串时先校验 `8-4-4-4-12` 十六进制形状，再调用 `UUID.fromString()`。
4. 将解析结果的 `toString()` 与输入做大小写无关的完整比对，兼容 Java 8 的宽松解析差异。
5. 捕获 `IllegalArgumentException`，把无效输入转换成稳定的参数错误，而不是 500 错误。

**最小示例：**

```java
import java.util.UUID;

public final class UuidDemo {
    /** 演示 UUID 的创建、序列化与解析。 */
    public static void main(String[] args) {
        UUID created = UUID.randomUUID();
        String text = created.toString();
        UUID parsed = parseCanonical(text);

        System.out.println(created.equals(parsed));
    }

    /** 只接受规范 UUID 文本，并兼容 Java 8 的宽松解析差异。 */
    private static UUID parseCanonical(String text) {
        if (text == null
                || !text.matches("(?i)[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")) {
            throw new IllegalArgumentException("UUID 格式不规范");
        }
        UUID parsed = UUID.fromString(text);
        if (!parsed.toString().equalsIgnoreCase(text)) {
            throw new IllegalArgumentException("UUID 格式不规范");
        }
        return parsed;
    }
}
```

**运行结果：** 输出 `true`。解析后可能得到新的对象实例，但它表达同一个 128 位值。

**常见误区：** 不要只用“`fromString` 没抛异常”判断输入规范。至少部分 Java 8 更新版会接受某些非规范
文本；跨版本边界应同时校验形状和规范化 round-trip。

### ==、equals 与 null-safe 比较

**它是什么：** 对引用类型，`==` 判断两边是否指向同一个对象或是否都为 null；`equals` 判断类型定义的
值相等。`Objects.equals(a, b)` 在调用 equals 前处理 null。

**有什么作用：** 身份比较适合确认是否就是同一个实例，值比较适合判断两个独立创建的业务值是否相同。

**什么时候使用：** 枚举常量和明确要求对象身份时可用 `==`。String、UUID、值对象和大多数业务字段比较
应使用 `equals` 或 `Objects.equals`。

**怎么使用：**

1. 先问业务问题是“同一个实例”还是“字段表达同一个值”。
2. 需要值相等时确认类型是否正确实现 equals。
3. 任一操作数可能为 null 时使用 `Objects.equals(a, b)`。
4. 自定义 equals 时同时复核 hashCode。

**最小示例：**

```java
import java.util.Objects;

public final class EqualityDemo {
    /** 对比引用相等和值相等。 */
    public static void main(String[] args) {
        String left = new String("java");
        String right = new String("java");

        System.out.println(left == right);
        System.out.println(left.equals(right));
        System.out.println(Objects.equals(null, null));
    }
}
```

**运行结果：** 依次输出 `false`、`true`、`true`。前两个 String 是不同实例，但字符内容相同。

**常见误区：** 字符串字面量可能被 JVM 复用，使某些 `==` 示例偶然得到 true；这不改变 `==` 的身份
语义，也不能把它当成 String 值比较方式。

### hashCode、HashMap、HashSet 与不可变键

**它是什么：** hashCode 是对象的 int 摘要。相等对象必须返回相同 hashCode，不相等对象允许发生哈希
碰撞。HashMap 和 HashSet 先用哈希定位候选位置，再用 equals 确认是否同一个键。

**有什么作用：** 正确的 equals/hashCode 让等值对象可以查到同一 Map 条目，也让 Set 正确去重。

**什么时候使用：** 对象作为 HashMap 键、HashSet 元素，或框架按哈希组织对象时必须遵守合同。

**怎么使用：**

1. 先决定哪些字段共同定义值相等。
2. equals 和 hashCode 使用完全相同的一组字段。
3. 对象放进哈希容器后，不修改这些字段。
4. 不把 hashCode 当成唯一 ID、数据库主键或安全校验值。

**最小示例：**

```java
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

public final class CourseKey {
    private final UUID id;

    /** 创建不可变课程键。 */
    public CourseKey(UUID id) {
        this.id = Objects.requireNonNull(id);
    }

    /** 按课程 ID 判断值相等。 */
    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof CourseKey)) {
            return false;
        }
        CourseKey that = (CourseKey) other;
        return id.equals(that.id);
    }

    /** 使用与 equals 相同的课程 ID 计算哈希。 */
    @Override
    public int hashCode() {
        return id.hashCode();
    }

    /** 演示等值键可以查到同一个 Map 条目。 */
    public static void main(String[] args) {
        UUID id = UUID.randomUUID();
        Map<CourseKey, String> names = new HashMap<CourseKey, String>();
        names.put(new CourseKey(id), "Java 中级");

        System.out.println(names.get(new CourseKey(id)));
    }
}
```

**运行结果：** 输出 `Java 中级`。查询键不是放入 Map 的同一个实例，但 equals/hashCode 合同一致。

**常见误区：** 不相等对象的 hashCode 可以相同。哈希碰撞是合法情况，容器会继续调用 equals。

### Comparable 自然顺序与 Comparator 场景顺序

**它是什么：** `Comparable<T>` 把默认顺序写在类型里；`Comparator<T>` 在调用处描述某个具体场景的
顺序。比较结果只看负数、0、正数，不要求恰好返回 -1、0、1。

**有什么作用：** 排序让展示、导出、TreeSet 和 TreeMap 可以稳定决定先后。外部 Comparator 还能让同一
类型按姓名、分数或创建时间采用不同顺序。

**什么时候使用：** 类型确实存在唯一、长期稳定的自然顺序时实现 Comparable；场景存在多种排序方式时
优先使用 Comparator。

**怎么使用：**

1. 选择主要排序字段。
2. 数值使用 `Integer.compare` 或 `Long.compare`，不要直接相减。
3. 对象字段使用 `Comparator.comparing`。
4. 用 `thenComparing` 处理主要字段相同的情况。

**最小示例：**

```java
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

public record Score(UUID id, String name, int value) implements Comparable<Score> {
    /** 按姓名、分数和 ID 定义与 equals 一致的自然顺序。 */
    @Override
    public int compareTo(Score other) {
        int byName = name.compareTo(other.name);
        if (byName != 0) {
            return byName;
        }
        int byValue = Integer.compare(value, other.value);
        if (byValue != 0) {
            return byValue;
        }
        return id.compareTo(other.id);
    }

    /** 按分数降序，再按 ID 建立稳定顺序。 */
    public static Comparator<Score> rankingOrder() {
        return Comparator.comparingInt(Score::value)
                .reversed()
                .thenComparing(Score::id);
    }

    /** 演示自然顺序、场景顺序和相等一致性。 */
    public static void main(String[] args) {
        List<Score> values = new ArrayList<Score>();
        Score li = new Score(
                UUID.fromString("00000000-0000-0000-0000-000000000002"), "Li", 90);
        values.add(li);
        values.add(new Score(UUID.fromString("00000000-0000-0000-0000-000000000001"), "Lin", 90));
        values.sort(null);
        String naturalFirst = values.get(0).name();

        values.sort(rankingOrder());
        String rankingFirst = values.get(0).name();
        Score sameLi = new Score(li.id(), li.name(), li.value());

        System.out.println(naturalFirst + "|" + rankingFirst + "|"
                + (li.compareTo(sameLi) == 0 && li.equals(sameLi)));
    }
}
```

**运行结果：** 输出 `Li|Lin|true`。自然顺序先按姓名得到 Li；排行榜改按分数和 ID，同分时 UUID
较小的 Lin 先出现；同一个值的 `compareTo` 为 0 且 equals 为 true。

**常见误区：** `return left - right` 可能发生 int 溢出，使本应更小的值被判断为更大。

### 确定性总序与唯一 tie-breaker

**它是什么：** 确定性总序能够对任意两条记录给出一致先后。tie-breaker 是主要字段相同时继续比较的字段，
最后通常使用稳定且唯一的 ID。

**有什么作用：** 只按可重复字段排序时，同值记录仍没有唯一先后。追加稳定 ID 后，展示、导出和后续分页
都能在输入对象集合相同的情况下复现同一顺序。

**什么时候使用：** 所有要求可复现顺序的列表、导出、签名计算和后续分页查询都应建立完整顺序。

**怎么使用：**

1. 按业务要求选择主要排序字段，例如分数降序。
2. 明确 null 在前还是在后，不依赖数据库或比较器默认猜测。
3. 追加一个稳定、唯一且不会随展示字段修改的 ID。
4. 对同一数据集重复排序，检查每个位置都一致。

**最小示例：**

```java
Comparator<Score> order = Comparator.comparingInt(Score::value)
        .reversed()
        .thenComparing(Score::id);
```

**运行结果：** 同分记录不再依赖集合原始顺序，重复排序会得到相同结果。

**常见误区：** `List.sort` 的稳定性只会保留“比较结果为 0”的元素原始先后；它不会凭空补出唯一顺序。
如果输入顺序变化，缺少唯一 tie-breaker 的结果仍会变化。

## 现代版本中的正确用法

现代 Java 中优先让 ID 保持 UUID 或专用值类型，让不可变对象自动形成稳定 equals/hashCode 合同；排序在
调用处通过 Comparator 显式组合。主要字段可重复时，最后追加稳定且唯一的 ID，使比较结果为 0 只表示
两个对象在排序合同中确实无法区分。

下面这个现代值对象用 record 表达不可变课程条目。record 自动根据组件生成 equals 和 hashCode，仍需要
开发者决定哪些字段应成为组件；“自动生成”不会替代领域建模。[来源：`jls25-records`]

```java
import java.util.UUID;

public record CourseSummary(UUID id, String title, int score) {
    /** 校验课程摘要的必要字段。 */
    public CourseSummary {
        if (id == null || title == null || title.isBlank()) {
            throw new IllegalArgumentException("id 和 title 不能为空");
        }
    }
}
```

## 核心合同速查

| 问题 | 正确工具 | 关键边界 |
| --- | --- | --- |
| 是否同一个实例 | `a == b` | 只比较引用身份 |
| 是否表达同一个值 | `a.equals(b)` | 类型负责定义合同 |
| 任一边可能为 null | `Objects.equals(a, b)` | null-safe |
| 放入 HashMap/HashSet | `equals` + `hashCode` | 相等字段保持不可变 |
| 类型默认排序 | `Comparable` | 建议与 equals 一致 |
| 场景排序 | `Comparator` | 追加唯一 tie-breaker |
| 比较 int 或 long | `Integer.compare` / `Long.compare` | 不直接相减 |
| 需要 null 顺序 | `nullsFirst` / `nullsLast` | 策略必须显式 |

## 从零跟着做

目标是让两份独立创建的课程 ID 成为等值 Map 键，再把四条课程记录按分数降序、ID 升序稳定排序。

1. 创建固定 UUID，并验证字符串 round-trip。
2. 用不可变 CourseId 实现配套的 equals/hashCode。
3. 用一个实例 put，再用独立创建的等值实例 get。
4. 用 Comparator.comparingInt 建立分数降序。
5. 用 thenComparing 追加 UUID，确保同分记录顺序唯一。
6. 反转输入后再次排序，验证精确结果仍一致。

```java
// I02_SHARED_FIXTURE_START
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

public final class I02Verification {
    /** 运行标识、相等、哈希、稳定算法与确定性总序的完整示例。 */
    public static void main(String[] args) {
        boolean type4Uuid = UUID.randomUUID().version() == 4;
        UUID rawId = id(1);
        boolean canonicalRoundTrip = rawId.equals(parseCanonical(rawId.toString()));
        boolean nonCanonicalRejected = rejectsNonCanonicalUuid();

        CourseId firstKey = new CourseId(rawId);
        CourseId equalKey = new CourseId(rawId);
        Map<CourseId, String> names = new HashMap<CourseId, String>();
        names.put(firstKey, "Java 中级");
        Set<CourseId> uniqueIds = new HashSet<CourseId>();
        uniqueIds.add(firstKey);
        uniqueIds.add(equalKey);

        Comparator<Integer> subtractingComparator = (left, right) -> left - right;
        boolean overflowExposed = subtractingComparator.compare(Integer.MIN_VALUE, 1) > 0
                && Integer.compare(Integer.MIN_VALUE, 1) < 0;

        List<CourseScore> equalScoreInput = equalScoreInput();
        Collections.sort(equalScoreInput, CourseScore.byScoreDescending());
        String stableAlgorithmOrder = labels(equalScoreInput);

        List<CourseScore> partialFirst = equalScorePair(false);
        List<CourseScore> partialSecond = equalScorePair(true);
        Collections.sort(partialFirst, CourseScore.byScoreDescending());
        Collections.sort(partialSecond, CourseScore.byScoreDescending());
        String partialOrders = ids(partialFirst) + ";" + ids(partialSecond);

        List<CourseScore> source = new ArrayList<CourseScore>();
        source.add(new CourseScore(id(4), "HTTP", 80));
        source.add(new CourseScore(id(2), "Stream", 90));
        source.add(new CourseScore(id(3), "SQL", 80));
        source.add(new CourseScore(id(1), "集合", 90));

        List<CourseScore> reversed = new ArrayList<CourseScore>(source);
        Collections.reverse(reversed);
        Collections.sort(source, CourseScore.rankingOrder());
        Collections.sort(reversed, CourseScore.rankingOrder());
        String totalOrder = ids(source);

        boolean passed = type4Uuid
                && canonicalRoundTrip
                && nonCanonicalRejected
                && firstKey != equalKey
                && firstKey.equals(equalKey)
                && firstKey.hashCode() == equalKey.hashCode()
                && "Java 中级".equals(names.get(equalKey))
                && uniqueIds.size() == 1
                && overflowExposed
                && "A,B,C".equals(stableAlgorithmOrder)
                && "1,2;2,1".equals(partialOrders)
                && "1,2,3,4".equals(totalOrder)
                && totalOrder.equals(ids(reversed));

        System.out.println("I02|" + (passed ? "PASS" : "FAIL")
                + "|uuidV4=" + type4Uuid
                + "|canonical=" + canonicalRoundTrip
                + "|nonCanonical=" + nonCanonicalRejected
                + "|refDistinct=" + (firstKey != equalKey)
                + "|equals=" + firstKey.equals(equalKey)
                + "|sameHash=" + (firstKey.hashCode() == equalKey.hashCode())
                + "|map=" + names.get(equalKey)
                + "|setSize=" + uniqueIds.size()
                + "|overflow=" + overflowExposed
                + "|stableAlgorithm=" + stableAlgorithmOrder
                + "|partialOrders=" + partialOrders
                + "|totalOrder=" + totalOrder);
        if (!passed) {
            throw new AssertionError("I-02 contract failed");
        }
    }

    /** 从固定尾号创建教学 UUID。 */
    private static UUID id(int tail) {
        return UUID.fromString(String.format("00000000-0000-0000-0000-%012d", tail));
    }

    /** 只接受规范 UUID 文本。 */
    private static UUID parseCanonical(String text) {
        if (text == null
                || !text.matches("(?i)[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")) {
            throw new IllegalArgumentException("UUID 格式不规范");
        }
        UUID parsed = UUID.fromString(text);
        if (!parsed.toString().equalsIgnoreCase(text)) {
            throw new IllegalArgumentException("UUID 格式不规范");
        }
        return parsed;
    }

    /** 验证非规范 UUID 文本被拒绝。 */
    private static boolean rejectsNonCanonicalUuid() {
        try {
            parseCanonical("1-1-1-1-1");
            return false;
        } catch (IllegalArgumentException expected) {
            return true;
        }
    }

    /** 创建同分且标签顺序固定的稳定排序输入。 */
    private static List<CourseScore> equalScoreInput() {
        List<CourseScore> values = new ArrayList<CourseScore>();
        values.add(new CourseScore(id(3), "A", 90));
        values.add(new CourseScore(id(1), "B", 90));
        values.add(new CourseScore(id(2), "C", 90));
        return values;
    }

    /** 创建顺序可反转的同分记录。 */
    private static List<CourseScore> equalScorePair(boolean reversed) {
        List<CourseScore> values = new ArrayList<CourseScore>();
        values.add(new CourseScore(id(reversed ? 2 : 1), "first", 90));
        values.add(new CourseScore(id(reversed ? 1 : 2), "second", 90));
        return values;
    }

    /** 连接排序后的 UUID 尾号。 */
    private static String ids(List<CourseScore> values) {
        StringBuilder result = new StringBuilder();
        for (CourseScore value : values) {
            if (result.length() > 0) {
                result.append(',');
            }
            result.append(value.id().getLeastSignificantBits());
        }
        return result.toString();
    }

    /** 连接排序后的标签。 */
    private static String labels(List<CourseScore> values) {
        StringBuilder result = new StringBuilder();
        for (CourseScore value : values) {
            if (result.length() > 0) {
                result.append(',');
            }
            result.append(value.title());
        }
        return result.toString();
    }

    private static final class CourseId {
        private final UUID id;

        /** 创建不可变课程 ID。 */
        private CourseId(UUID id) {
            this.id = Objects.requireNonNull(id, "id");
        }

        /** 按 UUID 值判断课程 ID 相等。 */
        @Override
        public boolean equals(Object other) {
            return this == other
                    || other instanceof CourseId && id.equals(((CourseId) other).id);
        }

        /** 使用与 equals 相同的 UUID 计算哈希。 */
        @Override
        public int hashCode() {
            return id.hashCode();
        }
    }

    private static final class CourseScore {
        private final UUID id;
        private final String title;
        private final int score;

        /** 创建课程分数。 */
        private CourseScore(UUID id, String title, int score) {
            this.id = id;
            this.title = title;
            this.score = score;
        }

        /** 只按分数降序比较，允许同分记录比较为 0。 */
        private static Comparator<CourseScore> byScoreDescending() {
            return Comparator.comparingInt((CourseScore value) -> value.score).reversed();
        }

        /** 返回分数降序、ID 升序的确定性总序。 */
        private static Comparator<CourseScore> rankingOrder() {
            return byScoreDescending().thenComparing(value -> value.id);
        }

        /** 返回稳定 ID。 */
        private UUID id() {
            return id;
        }

        /** 返回课程标题。 */
        private String title() {
            return title;
        }
    }
}
// I02_SHARED_FIXTURE_END
```

运行结果：

```text
I02|PASS|uuidV4=true|canonical=true|nonCanonical=true|refDistinct=true|equals=true|sameHash=true|map=Java 中级|setSize=1|overflow=true|stableAlgorithm=A,B,C|partialOrders=1,2;2,1|totalOrder=1,2,3,4
```

`stableAlgorithm=A,B,C` 单独证明比较结果为 0 时保留输入顺序；`partialOrders=1,2;2,1` 证明稳定算法
不会补出缺失的排序键；`totalOrder=1,2,3,4` 才是追加 UUID 后与输入顺序无关的确定性总序。

## 如何使用

在真实后端中可按以下顺序落地：

1. 在对象创建时生成稳定 ID，并在 Java 内部保持 UUID 或专用值类型。
2. 决定哪些不可变字段定义值相等，并让 equals/hashCode 使用同一组字段。
3. 只有存在唯一、长期默认顺序时才实现 Comparable。
4. 业务列表使用命名清楚的 Comparator，主字段之后追加唯一 ID。
5. 用极值、同值记录和不同输入顺序验证比较器合同。

## 适用与不适用场景

适用场景：

- 需要跨请求识别对象。
- 需要在 Map/Set 中稳定查找或去重。
- 列表、导出或后续分页需要可复现顺序。
- 同一类型需要多种业务排序方式。

不适用场景：

- UUID 不替代登录、授权或防猜测令牌。
- Comparator 不替代集合去重或业务相等判断。
- 只有局部生命周期的临时值不一定需要全局 ID。
- 本课不实现分页参数、分页响应、分布式 ID 或数据库排序。

## Java 8 兼容写法

Java 8 已支持 UUID、Objects.equals、Objects.hash、Comparator.comparing、thenComparing、reversed 和
nullsFirst/nullsLast。本课的 final 值对象和链式排序器可以使用同一份 Java 8 源码。

本课的兼容验证绑定固定镜像
`eclipse-temurin:8-jdk@sha256:c8b86f2c0a9bd6cc1b7fabc5d1a097501a166eea7cad3b2764e90e96178bea9b`，
运行时为 Eclipse Temurin 8u492-b09。其他 Java 8 更新版需要重新验证，不从这一个镜像外推实现细节。

Java 8 没有 record。兼容代码使用 final 类、final 字段、构造器、getter，以及配套 equals/hashCode。
如果使用 IDE 或代码生成器生成方法，仍要人工确认两者使用相同字段。

## 新旧版本差异

| 对比项 | Java 25 / 现代线 | Java 8 / 兼容线 |
| --- | --- | --- |
| UUID 核心 API | 支持 | 支持 |
| equals/hashCode | 核心合同一致 | 核心合同一致 |
| Comparator 链式 API | 支持 | 支持 |
| record 值对象 | 支持 | 不支持，使用 final 类 |
| 本课推荐主线 | record 或不可变 final 类 | 不可变 final 类 |

## 易错点

:::pitfalls
### 错误：用 == 比较值对象

**触发条件：** 两个对象分别 new 出来，但字段内容相同。

**原因：** `==` 比较引用身份，不调用 equals。

**后果：** String、UUID 或业务值明明相等却被判断为不同。

**错误示例：**

```java
boolean same = new String("java") == new String("java");
```

**正确写法：**

```java
boolean same = new String("java").equals(new String("java"));
```

**验证方式：** 分别 new 两个等值对象，断言 `==` 为 false、equals 为 true。

### 错误：只覆盖 equals，不覆盖 hashCode

**触发条件：** 对象按字段相等，但仍继承 Object 的身份哈希。

**原因：** 相等对象返回了不同 hashCode，违反容器合同。

**后果：** HashMap 和 HashSet 可能无法按等值对象查找或去重。

**错误示例：**

```java
/** 按课程 ID 判断两个键的值是否相等。 */
@Override
public boolean equals(Object other) {
    return other instanceof CourseKey && id.equals(((CourseKey) other).id);
}
// 错误：没有覆盖 hashCode。
```

**正确写法：** equals 和 hashCode 使用同一组不可变字段。

```java
/** 使用与 equals 相同的课程 ID 计算哈希。 */
@Override
public int hashCode() {
    return id.hashCode();
}
```

**验证方式：** 用一个对象 put，再用独立创建的等值对象 get。

### 错误：对象放入 HashMap 后修改键字段

**触发条件：** 参与 equals/hashCode 的字段可变，put 后又被修改。

**原因：** 对象的新 hash 指向另一个 bucket，旧条目仍留在原位置。

**后果：** Map 官方合同将这种情况定义为行为未定义，`get`、`containsKey` 或 `remove` 可能出现异常结果，
但不能承诺某一次运行必然查找失败。

**错误示例：**

```java
map.put(key, "课程");
key.setId(newId); // 错误：put 后改变参与哈希的字段。
```

**正确写法：** 哈希键使用不可变值对象；需要变化时创建新键并重新放入。

```java
CourseKey replacement = new CourseKey(newId);
map.put(replacement, "课程");
```

**验证方式：** 负向 fixture 先 put、再修改字段，只记录固定镜像中的观察值，不把观察值作为通过条件；
随后改成 final 字段并验证等值键查找。

### 错误：比较器直接相减

**触发条件：** 用 `left - right` 表示 int 升序。

**原因：** 两个合法 int 相减可能溢出。

**后果：** 排序方向错误，甚至破坏比较器传递性。

**错误示例：**

```java
Comparator<Integer> unsafe = (left, right) -> left - right;
```

**正确写法：**

```java
Comparator<Integer> safe = Integer::compare;
```

**验证方式：** 比较 `Integer.MIN_VALUE` 和正数，安全比较器应判断前者更小。

### 错误：要求确定性总序却缺少唯一 tie-breaker

**触发条件：** 只按分数、时间或状态等可重复字段排序。

**原因：** 同值记录没有确定先后。

**后果：** 展示、导出或重试时，同一组对象可能得到不同的精确顺序。

**错误示例：**

```java
Comparator<Score> partialOrder = Comparator.comparingInt(Score::value).reversed();
```

**正确写法：** 主要排序后追加稳定唯一 ID，使相同对象集合得到唯一顺序。

```java
Comparator<Score> deterministicOrder = Comparator.comparingInt(Score::value)
        .reversed()
        .thenComparing(Score::id);
```

**验证方式：** 多次打乱输入后排序，精确结果仍应一致。

:::

## 性能与安全边界

本课不声称 UUID 或 long 自增 ID 普遍更快。HashMap 的哈希值也不是唯一编号：不同对象允许产生相同
hashCode，容器会继续使用 equals 区分。比较器应该先满足正确性合同，再针对真实数据量测量排序成本。

标识符不是授权凭据，hashCode 也不是签名、密码摘要或防篡改校验。即使 ID 难猜，服务仍要单独判断当前
主体是否允许访问目标对象。

## 如何验证

先在仓库根目录创建临时文件。第一条 `sed` 命令会从本课上方的标记间提取完整共同源码，不需要在仓库中
保留测试文件：

```sh
fixture_dir=$(mktemp -d /tmp/java-i02-phase-c.XXXXXX)
lesson_file='src/categories/backend/java/core/learn/identifiers-equality-and-pagination.md'
sed -n '/^\/\/ I02_SHARED_FIXTURE_START$/,/^\/\/ I02_SHARED_FIXTURE_END$/p' "$lesson_file" \
  | sed '1d;$d' > "$fixture_dir/I02Verification.java"
cat > "$fixture_dir/ModernRecord.java" <<'JAVA'
import java.util.UUID;

/** 验证现代 record 自动生成值相等合同。 */
public record ModernRecord(UUID id, String title) {
    /** 运行 record 等值验证。 */
    public static void main(String[] args) {
        UUID id = UUID.fromString("00000000-0000-0000-0000-000000000001");
        boolean equal = new ModernRecord(id, "Java").equals(new ModernRecord(id, "Java"));
        System.out.println("record|equal=" + equal);
        if (!equal) {
            throw new AssertionError("record equality failed");
        }
    }
}
JAVA
```

然后分别运行固定 Java 25 与 Java 8 镜像。共同源码必须在两个版本都编译并得到相同输出；record 只在
Java 25 成功，Java 8 必须拒绝其语法：

```sh
java25_image='eclipse-temurin:25-jdk@sha256:12e44624adee6808a36d962717e1656e0afeeeff5a100f9cb00e0136513558f0'
java8_image='eclipse-temurin:8-jdk@sha256:c8b86f2c0a9bd6cc1b7fabc5d1a097501a166eea7cad3b2764e90e96178bea9b'

docker run --rm -v "$fixture_dir:/work:ro" -w /work "$java25_image" sh -c \
  'mkdir /tmp/i02-classes && javac -encoding UTF-8 -d /tmp/i02-classes -Xlint:all -Werror --release 25 I02Verification.java && java -cp /tmp/i02-classes I02Verification'
docker run --rm -v "$fixture_dir:/work:ro" -w /work "$java8_image" sh -c \
  'mkdir /tmp/i02-classes && javac -encoding UTF-8 -d /tmp/i02-classes -Xlint:all -Werror I02Verification.java && java -cp /tmp/i02-classes I02Verification'
docker run --rm -v "$fixture_dir:/work:ro" -w /work "$java25_image" sh -c \
  'mkdir /tmp/i02-record && javac -encoding UTF-8 -d /tmp/i02-record -Xlint:all -Werror --release 25 ModernRecord.java && java -cp /tmp/i02-record ModernRecord'
docker run --rm -v "$fixture_dir:/work:ro" -w /work "$java8_image" sh -c \
  'if javac -encoding UTF-8 ModernRecord.java >/tmp/i02-record8.txt 2>&1; then exit 1; else echo "record8|rejected=true"; fi'
```

前两条共同源码命令的预期输出完全相同：

```text
I02|PASS|uuidV4=true|canonical=true|nonCanonical=true|refDistinct=true|equals=true|sameHash=true|map=Java 中级|setSize=1|overflow=true|stableAlgorithm=A,B,C|partialOrders=1,2;2,1|totalOrder=1,2,3,4
```

后两条命令依次输出 `record|equal=true` 与 `record8|rejected=true`。最后用精确路径清理并确认临时目录
已经不存在：

```sh
find "$fixture_dir" -depth -delete
test ! -e "$fixture_dir"
unset fixture_dir lesson_file java25_image java8_image
```

固定镜像中的可变哈希键负例若观察到 `get=null`，只能记录为该镜像的观察值；由于 Map 合同将修改键中
影响 `equals` 的状态定义为行为未定义，不得把 `null` 作为跨运行时必然结果或课程通过条件。

:::exercise
### 练习：实现稳定课程排行榜

**要求：** 定义不可变课程分数，使用 UUID 作为 ID；让独立创建的等值 ID 可以查询同一 Map 条目；按分数
降序、ID 升序排序。不得用整数相减实现比较器。

**验收：** 两条同分记录在输入顺序反转后仍按同一 ID 顺序出现；等值 Map 键查询成功；用
Integer.MIN_VALUE 和正数验证比较器方向正确；修改普通标题不改变课程 ID。

**参考答案：** equals/hashCode 只使用不可变 UUID；使用
`Comparator.comparingInt(...).reversed().thenComparing(...)` 建立完整顺序。
:::

## 本节小结

- 标识符、普通属性和权限解决不同问题，不能相互替代。
- UUID 在 Java 内部保持类型，外部字符串必须解析和校验。
- equals、hashCode 和键不可变性共同决定哈希容器是否正确。
- Comparable 表达类型自然顺序，Comparator 表达具体场景顺序。
- 比较器要避免相减溢出，并用稳定唯一 ID 完成确定性总序。
- 分页合同将在 I-09 讲解，本课只提供它依赖的稳定排序基础。
