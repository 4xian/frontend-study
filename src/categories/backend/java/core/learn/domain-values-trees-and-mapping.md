---
id: backend.java.learn.intermediate.domain-values-trees-and-mapping
type: lesson
title: 领域值对象、树结构与对象映射
summary: 用不可变值表达领域规则，用显式映射隔离数据边界，并一步步构建、校验和遍历树结构
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 150
objectives:
  - 区分值对象、实体和普通数据传输对象，并为值对象写出可验证的不变量
  - 在 Java 25 中使用 record 和不可变集合，在 Java 8 中用 final 类表达相同合同
  - 通过显式映射保护输入 DTO、领域对象和输出 DTO 的字段边界
  - 将扁平父子数据构造成树，检查重复、孤儿和循环并安全遍历
  - 根据映射复杂度选择手写 mapper、生成式 mapper 或框架工具，而不是盲目复制属性
prerequisites:
  - backend.java.learn.intermediate.service-design-patterns
related: []
tags:
  - Java
  - 值对象
  - record
  - DTO 映射
  - 树结构
  - 不可变性
appliesTo: Java 25、Spring Boot 4.1.0 与 Spring Framework 7.0.8 主线；Java 8、Spring Boot 2.3.12.RELEASE 与 Spring Framework 5.2.15.RELEASE 兼容补充
modernBaseline:
  java: '25'
  springBoot: 4.1.0
  springFramework: 7.0.8
legacyBaseline:
  java: '8'
  springBoot: 2.3.12.RELEASE
  springFramework: 5.2.15.RELEASE
verifiedAt: 2026-08-16
sources:
  - id: jls25-record-classes
    title: JLS 25 - Record Classes
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.10
    sourceType: specification
    appliesTo: Java 25
    claims:
      - record header 声明组件并生成对应访问器、规范构造器和成员合同
      - record 不能通过继承普通类扩展状态
  - id: jep395-records
    title: OpenJDK JEP 395 - Records
    url: https://openjdk.org/jeps/395
    sourceType: official-reference
    appliesTo: Java 16 及以上
    claims:
      - record 是透明、浅不可变的数据载体
      - record 组件引用的可变对象仍需调用方自行复制或封装
  - id: java25-object
    title: Java 25 Object API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - equals 与 hashCode 必须保持一致，才能在哈希集合中稳定工作
  - id: java25-record-api
    title: Java 25 Record API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Record.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - 所有 record 都直接继承 Record，不能再继承其他类
  - id: java25-list-copyof
    title: Java 25 List.copyOf API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#copyOf(java.util.Collection)
    sourceType: api-doc
    appliesTo: Java 10 及以上
    claims:
      - copyOf 返回不可修改快照，源集合后续结构变化不会反映到结果
      - null 集合或 null 元素会被拒绝
  - id: java25-unmodifiable-list
    title: Java 25 Collections.unmodifiableList API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Collections.html#unmodifiableList(java.util.List)
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - unmodifiableList 是底层列表的只读视图，不是独立快照
  - id: java25-enum
    title: Java 25 Enum API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Enum.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - enum 的 name 与 ordinal 具有不同合同，ordinal 不能代替外部业务编码
  - id: java25-deque
    title: Java 25 Deque API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Deque.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - Deque 同时支持队列和栈操作，可分别实现 BFS 和 DFS
  - id: jls25-equality
    title: JLS 25 - Equality Operators
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.21
    sourceType: specification
    appliesTo: Java 25
    claims:
      - == 对引用类型比较引用身份，值相等需要类型定义 equals 合同
  - id: jackson-databind
    title: Jackson Databind 2.20.2 ObjectMapper
    url: https://github.com/FasterXML/jackson-databind/blob/jackson-databind-2.20.2/src/main/java/com/fasterxml/jackson/databind/ObjectMapper.java
    sourceType: official-reference
    appliesTo: Jackson Databind 2.20.2
    claims:
      - ObjectMapper 负责 JSON 与 Java 类型之间的序列化和反序列化
      - convertValue 不面向多态和对象身份等高级映射场景
  - id: mapstruct-reference
    title: MapStruct 1.6 官方参考指南
    url: https://mapstruct.org/documentation/1.6/reference/html/
    sourceType: official-reference
    appliesTo: MapStruct 1.6.x，按 1.6.3 核验
    claims:
      - MapStruct 在编译期生成类型安全的映射实现
      - 显式字段映射可使源目标字段差异在编译期暴露
  - id: java8-object
    title: Java 8 Object API
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/Object.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 的 equals 与 hashCode 合同和现代 Java 一致
  - id: java8-unmodifiable-list
    title: Java 8 Collections.unmodifiableList API
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Collections.html#unmodifiableList-java.util.List-
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 可通过先复制再包装只读列表建立集合快照
  - id: spring-boot-23-system-requirements
    title: Spring Boot 2.3.12 System Requirements
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - legacy 线要求 Java 8 并使用 Spring Framework 5.2.15.RELEASE 或以上
  - id: spring-framework-5215-bean-utils
    title: Spring Framework 5.2.15 BeanUtils API
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/beans/BeanUtils.html
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - copyProperties 只复制匹配 bean 属性，目标缺失属性会被忽略
      - convenience method 不提供深复制或领域语义映射保证
  - id: jvms25-class-version
    title: JVMS 25 - ClassFile Structure
    url: https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-4.html#jvms-4.1
    sourceType: specification
    appliesTo: Java 25
    claims:
      - Java 25 class major version 为 69
  - id: jvms8-class-version
    title: JVMS 8 - ClassFile Structure
    url: https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.1
    sourceType: specification
    appliesTo: Java 8
    claims:
      - Java 8 class major version 为 52
projectEvidence:
  - file: dzzz-app/src/main/java/com/tdh/bdzz/timer/enums/YjStatus.java
    symbol: com.tdh.bdzz.timer.enums.YjStatus
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/enums/AJFL.java
    symbol: com.tdh.bdzz.enums.AJFL
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/enums/AymsJc.java
    symbol: com.tdh.bdzz.enums.AymsJc
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/BeanUtil.java
    symbol: com.tdh.bdzz.util.BeanUtil
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/constant/TuDmKzCategoryConstant.java
    symbol: com.tdh.bdzz.constant.TuDmKzCategoryConstant
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/aixntj/AiXntjMetricsCalculator.java
    symbol: com.tdh.bdzz.util.aixntj.AiXntjMetricsCalculator
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/DqUtils.java
    symbol: com.tdh.bdzz.util.DqUtils
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/TsjdStageUtil.java
    symbol: com.tdh.bdzz.util.TsjdStageUtil
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/aixntj/AiXntjCourtTreeHelper.java
    symbol: com.tdh.bdzz.util.aixntj.AiXntjCourtTreeHelper
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/PdfKeywordPositionUtil.java
    symbol: com.tdh.bdzz.util.PdfKeywordPositionUtil
    usage: observed
---

# 领域值对象、树结构与对象映射

## 为什么需要学习

后端程序经常把同一份信息放在请求 DTO、数据库对象、领域对象和响应 DTO 中。若只按字段名复制，
单位、可空性、权限和父子关系很容易在边界处丢失。树数据还会遇到重复节点、孤儿节点和循环引用。
本课从“目录节点 + 坐标 + 页面响应”的小例子开始，先建立值对象的不变量，再把数据明确映射到不同
模型，最后构造并遍历一棵可验证的树。所有代码先用 Java 25 演示，Java 8 只补充等价写法。

## 学习目标

- 能解释值对象、实体和 DTO 的差异，并说出每个对象的所有权边界。
- 能写出带校验的 record，以及 Java 8 兼容的 final 值类。
- 能用 equals/hashCode 表达值相等，并避免把可变集合直接暴露出去。
- 能手写字段白名单 mapper，处理 null、未知枚举和嵌套列表。
- 能从扁平父子记录构树，拒绝重复 ID、孤儿、环和多根异常数据。
- 能用 DFS 或 BFS 得到稳定顺序，并为序列化设计不会无限递归的 DTO。

## 前置术语

“类”是数据和方法的模板，`List` 是有顺序的集合，`Map` 是键到值的查找表。DTO 是只在边界
传输的数据类；不变量是对象必须始终满足的条件；映射是把一个模型转换成另一个模型。若集合遍历还不
熟悉，先回看基础课程的集合与迭代合同。

## 零基础知识点详解

### 1. 值对象是什么

**概念：** 值对象用属性表示“是什么”，而不是靠数据库 ID 表示“哪一个”。例如两个金额和币种都
相同的 Money，可以视为同一个值。

**作用：** 把单位、范围和组合规则放在一个小类型里，调用方不用在每个方法里重复检查。

**什么时候用：** 邮箱、金额、坐标、日期范围、页面大小等有明确格式和不变量的概念适合值对象。只有
一个字段、没有规则的临时结构不必强行包装。

**怎么用：** 先列出字段，再写对象创建时必须成立的条件；创建成功后不允许改变字段。

```java
public record PageSize(int value) {
    /** 创建页面大小并拒绝无效值。 */
    public PageSize {
        if (value < 1 || value > 100) {
            throw new IllegalArgumentException("page size must be 1..100");
        }
    }
}
```

**结果：** `new PageSize(20).value()` 返回 20；`new PageSize(0)` 立即失败，而不是等查询数据库
时才失败。record 生成的访问器叫 `value()`，不是 JavaBean 的 `getValue()`。

**容易错：** 值对象不是“所有字段都 public”，record 也不是自动深度不可变。如果组件是列表，还要
复制列表；如果值含敏感字段，响应 DTO 也不能直接复用它。

### 2. 值对象与实体、DTO 的区别

**概念：** 实体靠稳定身份和生命周期识别，例如 `User(id)`；值对象靠属性识别；DTO 只负责跨层
传递，可以为了输入或输出拥有不同字段。

**作用：** 区分三者可以阻止数据库字段、内部状态和客户端输入互相泄漏。

**什么时候用：** Controller 接收请求时用输入 DTO；Service 内部使用领域对象；返回 HTTP 时用输出
DTO。实体需要持久化 ID 时不要假装成值对象。

**怎么用：** 先问“调用方是否可以写这个字段”和“对象是否有独立生命周期”，再决定类型。

```java
public record CreateFolderRequest(String name, String parentId) {}
public record FolderId(String value) {}
public record FolderView(String id, String name, int childCount) {}
```

**结果：** 请求没有 id 和 childCount，客户端不能顺便写服务端生成的数据；响应也没有数据库内部字段。
三个类型即使字段相似，也不能互相直接赋值，映射步骤会被迫写出来。

**容易错：** “字段一样就复用一个类”会让以后增加内部字段时自动扩大 API；把 entity 当 DTO 返回还
可能触发懒加载或泄漏权限字段。

### 3. record 的组件与紧凑构造器

**概念：** record 在声明头部列出组件，编译器生成 private final 字段、访问器、`equals`、
`hashCode` 和 `toString`。紧凑构造器不写参数列表，但可以在赋值前校验和规范化。

**作用：** 对小型、透明数据载体减少样板代码，同时把创建规则集中在一个入口。

**什么时候用：** Java 25 中的请求命令、坐标、树节点快照适合 record；需要继承已有类、隐藏大量状态
或拥有可变生命周期时使用普通类。

**怎么用：** 在紧凑构造器中拒绝 null 和非法范围，不要在 getter 中临时修正无效数据。

```java
public record Point(int x, int y) {
    /** 创建坐标并保证坐标值非负。 */
    public Point {
        if (x < 0 || y < 0) {
            throw new IllegalArgumentException("point must be non-negative");
        }
    }
}
```

**结果：** `new Point(3, 4)` 可以安全传递；`new Point(-1, 4)` 在边界立即报错。调用者不能重新
给 x 赋值，因为 record 组件没有 setter。

**容易错：** record 构造器仍可能被序列化框架调用，不能把它当权限检查。record 不能 extends 业务
基类，只能实现接口；需要共享行为时使用组合或接口。

### 4. 不可变集合与浅、深复制

**概念：** `List.copyOf` 创建不允许结构修改的快照，但元素对象仍可能可变，这叫浅不可变。深不可变
还要求元素类型自己不可变或逐个复制。

**作用：** 防止调用方通过持有的原列表改变值对象内部顺序，降低并发读写和调试难度。

**什么时候用：** 构造值对象、响应 DTO、树节点 children 时先复制集合。只有明确需要共享实时视图时
才使用视图，并把所有权写进合同。

**怎么用：** Java 25 用 `List.copyOf`；Java 8 先 `new ArrayList<>(items)`，再
`Collections.unmodifiableList`。

```java
public record TagSet(List<String> values) {
    /** 复制标签并拒绝空元素，建立不可修改快照。 */
    public TagSet {
        values = List.copyOf(values);
        if (values.stream().anyMatch(Objects::isNull)) {
            throw new IllegalArgumentException("tag cannot be null");
        }
    }
}
```

**结果：** 外部执行 `source.add("new")` 不会影响 TagSet；对 `tagSet.values()` 执行 add 会抛
`UnsupportedOperationException`。如果元素是可变对象，仍要提供不可变元素或复制元素。

**容易错：** `Collections.unmodifiableList(source)` 只是只读视图，source 后续清空时视图也会变；
`List.copyOf` 和 unmodifiable view 的所有权语义不同。

### 5. equals、hashCode 与值相等

**概念：** `==` 对引用比较是否同一个对象；`equals` 表达逻辑相等；`hashCode` 为哈希容器分桶。
若两个对象 equals 为 true，hashCode 必须相同。

**作用：** 让 HashSet 去重、HashMap 查找和测试断言符合领域语义。

**什么时候用：** 值对象按参与值语义的全部组件比较；实体通常按稳定 ID 比较。不要把可变字段放进已
作为 HashMap key 的对象。

**怎么用：** record 自动按组件实现；普通类使用相同字段实现 equals 和 hashCode。

```java
public final class Coordinate {
    private final int x;
    private final int y;

    /** 创建不可变坐标。 */
    public Coordinate(int x, int y) {
        this.x = x;
        this.y = y;
    }

    /** 判断两个坐标的值是否相同。 */
    @Override
    public boolean equals(Object other) {
        return other instanceof Coordinate coordinate && x == coordinate.x && y == coordinate.y;
    }

    /** 返回与 equals 使用相同字段的哈希值。 */
    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }
}
```

**结果：** 两个 `new Coordinate(2, 3)` 放入 HashSet 后只有一个元素。Java 8 不支持 pattern
matching，需要显式强制转换。

**容易错：** 只覆写 equals 不覆写 hashCode 会让 HashSet 查不到“相等”对象；用可变坐标作 key 后
再修改坐标会让对象落在错误的桶中。

### 6. 带单位的坐标值对象

**概念：** 坐标不是两个裸 double 参数，而是带坐标系、单位和范围的完整值。`x=10` 在像素、毫米
和 PDF point 中含义不同。

**作用：** 把单位换算和范围检查集中起来，避免把宽度当高度、把页面坐标当图片坐标。

**什么时候用：** 图像、PDF、拖拽布局和比例计算都应先建立明确的 Point、Size 或 Rect。

**怎么用：** 让类型固定一种单位，并提供命名转换方法。

```java
public record PixelPoint(int x, int y) {
    /** 创建像素坐标并拒绝负值。 */
    public PixelPoint {
        if (x < 0 || y < 0) {
            throw new IllegalArgumentException("pixel coordinate must be non-negative");
        }
    }

    /** 将像素坐标按比例缩放并四舍五入。 */
    public PixelPoint scale(double factor) {
        if (!(factor > 0)) {
            throw new IllegalArgumentException("scale must be positive");
        }
        return new PixelPoint((int) Math.round(x * factor), (int) Math.round(y * factor));
    }
}
```

**结果：** `new PixelPoint(10, 20).scale(0.5)` 得到坐标 5、10；传入零、负数或 NaN 会立即失败。

**容易错：** 不要在调用点偷偷乘比例却不写单位，否则读者无法判断换算方向；整数除法还可能提前截断。

### 7. 枚举与外部代码的映射

**概念：** Java enum 的常量名是源码符号，外部系统常用数字或字符串编码。映射表把两者隔离，不能把
`ordinal()` 当协议值。

**作用：** 外部代码变化时只改映射入口；未知代码可以产生清晰错误或明确兼容分支。

**什么时候用：** 数据库状态、HTTP 参数、消息类型和分类常量都需要显式映射。

**怎么用：** 给 enum 一个显式 code，并提供抛出明确错误的解析方法。

```java
public enum NodeKind {
    ROOT("root"), FOLDER("folder"), FILE("file");

    private final String code;

    /** 创建带外部编码的节点类型。 */
    NodeKind(String code) {
        this.code = code;
    }

    /** 返回稳定外部编码。 */
    public String code() {
        return code;
    }

    /** 按外部编码解析节点类型。 */
    public static NodeKind fromCode(String code) {
        return Arrays.stream(values())
            .filter(kind -> kind.code.equals(code))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("unknown node kind: " + code));
    }
}
```

**结果：** `NodeKind.fromCode("folder")` 返回 FOLDER；未知值不会误用枚举声明顺序。

**容易错：** 调整 enum 顺序会改变 ordinal；`Enum.valueOf` 匹配 Java 常量名而不是外部 code；未知
值若静默变成 null，问题会在更深层才暴露。

### 8. 为什么要显式映射 DTO

**概念：** mapper 是只负责“源字段到目标字段”的函数。它不查询数据库、不做权限判断，也不把整个
对象图无条件复制。

**作用：** 显式代码形成字段白名单，编译器和审查者都能看见数据流向。

**什么时候用：** 输入 DTO、领域命令、数据库 PO、输出 DTO 和消息载荷只要属于不同边界，就写 mapper。

**怎么用：** 每个目标字段明确来源；无法转换的字段显式给出默认值或抛错。

```java
public record FolderRow(String id, String displayName, String internalNote) {}
public record FolderView(String id, String name) {}

public final class FolderMapper {
    /** 将数据库行映射为不暴露内部备注的响应。 */
    public FolderView toView(FolderRow row) {
        Objects.requireNonNull(row, "row");
        return new FolderView(row.id(), row.displayName());
    }
}
```

**结果：** internalNote 不会出现在响应；若 FolderView 新增必填字段，编译器会提醒 mapper 更新。

**容易错：** 反射式“同名全复制”无法表达字段重命名、脱敏、单位转换和嵌套策略；mapper 中访问
Repository 会让纯转换变成不可测试的业务服务。

### 9. 手写、生成式与反射 mapper

**概念：** 手写 mapper 是普通 Java；MapStruct 等生成式工具在编译期生成实现；反射工具在运行时按
属性名复制。三者的错误发现时机不同。

**作用：** 按字段数量和转换复杂度选择工具，而不是因为项目存在 BeanUtil 就复制所有属性。

**什么时候用：** 少量复杂规则用手写；大量稳定同名 DTO 可评估生成式 mapper；反射只适合边界清楚且
有字段测试的场景。

**怎么用：** 先用手写 mapper 固定行为和断言，再替换工具；替换后继续验证字段集合、null 和错误分支。

**结果：** 手写和生成式 mapper 能在编译期暴露类型差异；反射工具通常把错误推迟到运行时。

**容易错：** copy 成功不代表业务正确。同名字段可能单位不同，敏感字段也可能被带出。工具只能执行
映射合同，不能替你定义合同。

### 10. null、默认值与未知字段

**概念：** null 可能表示“未提供”“明确清空”或“数据缺失”，默认值也可能掩盖错误。映射前必须
规定每个字段的缺失语义。

**作用：** 区分部分更新和清空操作，避免数据库状态被无意覆盖。

**什么时候用：** 输入 DTO、PATCH、旧消息和跨系统同步都必须显式处理 null。

**怎么用：** 必需字段在构造器中拒绝 null 或空白；未知枚举返回明确错误；只有协议规定时才补默认值。

```java
public record RenameFolder(String id, String name) {
    /** 创建重命名命令并拒绝空白字段。 */
    public RenameFolder {
        if (id == null || id.isBlank() || name == null || name.isBlank()) {
            throw new IllegalArgumentException("id and name are required");
        }
    }
}
```

**结果：** 空白名称在进入 Service 前失败，mapper 不会把 null 静默变成合法名称。

**容易错：** 把未知 enum 默认成第一项会制造数据损坏；Optional 也不是所有实体字段的替代品。

### 11. 嵌套 DTO 与集合映射

**概念：** 嵌套映射先转换父对象，再逐个转换子对象；集合还要规定顺序、重复项和空集合语义。

**作用：** 保持响应结构稳定，同时避免把内部可变集合引用泄漏给调用方。

**什么时候用：** 目录、订单明细、菜单和权限树都常见嵌套 DTO；子项需要脱敏或重命名时必须写规则。

**怎么用：** 逐项调用子 mapper，最后复制结果；不要在 mapper 中修改源集合。

```java
public record ChildRow(String id, String name) {}
public record ChildView(String id, String label) {}

public final class ChildMapper {
    /** 映射子节点并只暴露需要的字段。 */
    public List<ChildView> toViews(List<ChildRow> source) {
        return source.stream()
            .map(child -> new ChildView(child.id(), child.name()))
            .toList();
    }
}
```

**结果：** 子节点保持输入顺序，Java 25 的 `Stream.toList()` 返回不可修改结果。

**容易错：** 直接返回源列表会产生别名；在 stream 中修改源列表会导致并发修改或难以理解的顺序。

### 12. 树节点与扁平父子记录

**概念：** 树节点有 id、parentId 和 children；数据库常给出扁平记录，每条记录只知道父 ID。构树就是
把这些父子边连接起来。

**作用：** 目录、组织和分类可以按层级展示、查找和聚合。

**什么时候用：** 每个节点最多一个父节点且能从根覆盖全部节点时使用树；允许多个父节点时应建图。

**怎么用：** 输入记录保持不可变；构建阶段使用临时可变节点，完成校验后递归冻结为不可变节点。

```java
public record FlatNode(String id, String parentId, String label) {}

public record TreeNode(String id, String label, List<TreeNode> children) {
    /** 创建不可变树节点快照。 */
    public TreeNode {
        Objects.requireNonNull(id, "id");
        Objects.requireNonNull(label, "label");
        children = List.copyOf(children);
    }
}
```

**结果：** 构建器丢弃临时可变节点后，调用方既不能修改 children，也没有 `addChild` 入口；不保存
parent 对象可避免双向环。

**容易错：** 同时暴露 parent 和 children setter 会允许多父节点；把 ORM entity 直接当 API 树会混合
持久化、遍历和序列化职责。

### 13. 从扁平数据构建树

**概念：** 构树分三步：创建 ID 索引、建立父子链接、验证根和覆盖率。索引避免每挂一个节点都扫描全表。

**作用：** 重复、孤儿和多根数据在边界一次失败，不让半棵树进入页面。

**什么时候用：** Service 从 Repository 或消息收到 flat rows 时调用构建器；Controller 不负责拼树。

**怎么用：** 先拒绝空 ID 和重复 ID，再要求非空 parentId 命中索引，最后只允许一个根。

```java
public final class TreeBuilder {
    private static final class MutableNode {
        private final String id;
        private final String label;
        private final List<MutableNode> children = new ArrayList<>();

        /** 创建仅供构树阶段使用的可变节点。 */
        private MutableNode(String id, String label) {
            this.id = id;
            this.label = label;
        }

        /** 递归复制为不再暴露修改入口的树节点。 */
        private TreeNode freeze() {
            List<TreeNode> frozenChildren = children.stream()
                .map(MutableNode::freeze)
                .toList();
            return new TreeNode(id, label, frozenChildren);
        }
    }

    /** 从扁平记录构建单根树。 */
    public TreeNode build(List<FlatNode> rows) {
        new FlatTreeValidator().validate(rows);
        Map<String, MutableNode> nodes = new LinkedHashMap<>();
        for (FlatNode row : rows) {
            nodes.put(row.id(), new MutableNode(row.id(), row.label()));
        }
        MutableNode root = null;
        for (FlatNode row : rows) {
            if (row.parentId() == null) {
                root = nodes.get(row.id());
            } else {
                MutableNode parent = nodes.get(row.parentId());
                parent.children.add(nodes.get(row.id()));
            }
        }
        return root.freeze();
    }
}
```

**结果：** `root -> docs -> readme` 得到三层不可变树；校验通过后，连接阶段只处理已经确认存在的节点。

**容易错：** 不能先递归冻结再查环，否则坏数据可能先触发深递归；校验失败时必须丢弃整个临时结构。

### 14. 在冻结前检测循环与不可达节点

**概念：** 沿 parentId 链再次遇到同一 ID 就形成环。只允许一个根、所有父 ID 都存在且每条父链都能
结束于根时，全部节点才可达。

**作用：** 防止递归遍历无限调用、JSON 序列化栈溢出和页面缺节点。

**什么时候用：** 导入、用户可编辑目录和外部同步数据在发布前都要检查。

**怎么用：** 先建立 `id -> parentId` 索引并检查重复、孤儿和根数量，再从每个节点沿父链向上走；同一条
路径第二次遇到某个 ID 就立即失败。校验必须发生在可变草稿节点递归冻结之前。

```java
public final class FlatTreeValidator {
    /** 检查扁平记录能否组成单根、无环且全覆盖的树。 */
    public void validate(List<FlatNode> rows) {
        Map<String, String> parents = new LinkedHashMap<>();
        int rootCount = 0;
        for (FlatNode row : rows) {
            if (row.id() == null || row.id().isBlank() || parents.containsKey(row.id())) {
                throw new IllegalArgumentException("duplicate or empty node id: " + row.id());
            }
            parents.put(row.id(), row.parentId());
            if (row.parentId() == null) {
                rootCount++;
            }
        }
        if (rootCount != 1) {
            throw new IllegalArgumentException("exactly one root is required");
        }
        for (FlatNode row : rows) {
            if (row.parentId() != null && !parents.containsKey(row.parentId())) {
                throw new IllegalArgumentException("orphan parent: " + row.parentId());
            }
        }
        for (String start : parents.keySet()) {
            Set<String> path = new HashSet<>();
            String current = start;
            while (current != null) {
                if (!path.add(current)) {
                    throw new IllegalArgumentException("cycle at node: " + current);
                }
                current = parents.get(current);
            }
        }
    }
}
```

**结果：** 重复 ID、零个或多个根、未知父 ID 和 `a -> b -> a` 都会在冻结前得到明确异常。

**容易错：** 把“找到了一个根”当成全覆盖；单根之外仍可能存在一个独立环，必须检查每个节点的父链。

### 15. DFS 与 BFS

**概念：** DFS 深度优先，先走到底；BFS 广度优先，按层访问。两者只改变输出顺序，不改变树。

**作用：** DFS 适合路径和后代计算；BFS 适合最近节点和分层展示。

**什么时候用：** 最短层级距离用 BFS；后序聚合或路径回溯用 DFS；深度未知时使用显式栈。

**怎么用：** BFS 用 `addLast/removeFirst`，DFS 用 `addLast/removeLast`。

```java
public final class TreeTraversal {
    /** 按层返回节点 ID。 */
    public List<String> breadthFirst(TreeNode root) {
        List<String> result = new ArrayList<>();
        Deque<TreeNode> queue = new ArrayDeque<>();
        queue.addLast(root);
        while (!queue.isEmpty()) {
            TreeNode current = queue.removeFirst();
            result.add(current.id());
            current.children().forEach(queue::addLast);
        }
        return List.copyOf(result);
    }

    /** 用显式栈返回深度优先 ID。 */
    public List<String> depthFirst(TreeNode root) {
        List<String> result = new ArrayList<>();
        Deque<TreeNode> stack = new ArrayDeque<>();
        stack.addLast(root);
        while (!stack.isEmpty()) {
            TreeNode current = stack.removeLast();
            result.add(current.id());
            List<TreeNode> children = current.children();
            for (int index = children.size() - 1; index >= 0; index--) {
                stack.addLast(children.get(index));
            }
        }
        return List.copyOf(result);
    }
}
```

**结果：** 对 `root(a,b)` 且 a 有 a1 的树，BFS 是 root,a,b,a1，DFS 是 root,a,a1,b。

**容易错：** DFS 按 children 正序压栈会反转兄弟顺序；使用 Deque 比旧 `Stack` 类更清楚。

### 16. 序列化边界与单向响应树

**概念：** JSON 序列化是另一个边界。响应 DTO 应是单向、有限、可版本化的结构，不直接暴露内部节点。

**作用：** 避免 parent/children 循环、无限递归和内部字段泄漏。

**什么时候用：** Controller 返回树、发送消息或持久化 JSON 时，先构造专用输出类型。

**怎么用：** 输出只含 id、label、children；需要回指时只输出 parentId 字符串。

```java
public record NodeResponse(String id, String label, List<NodeResponse> children) {
    /** 创建单向且不可修改的节点响应。 */
    public NodeResponse {
        children = List.copyOf(children);
    }
}

public final class NodeResponseMapper {
    /** 将内部树转换为单向响应树。 */
    public NodeResponse toResponse(TreeNode node) {
        List<NodeResponse> children = node.children().stream()
            .map(this::toResponse)
            .toList();
        return new NodeResponse(node.id(), node.label(), children);
    }
}
```

**结果：** 序列化器只沿 children 向下走，不会因 parent 回指循环；测试可精确断言响应字段。

**容易错：** `@JsonIgnore` 只能解决一个序列化视图，不能替代领域边界；领域对象不应依赖 ObjectMapper。

## 现代版本中的正确用法

Java 25 主线使用 record 表达小型值和 DTO，使用 `List.copyOf` 建立集合快照，使用显式 mapper 让字段
变化在编译期可见。树构建器完成索引、挂接和校验后，才把只读结果交给 Service。这里不使用 preview
API，也不把反射复制工具当作类型安全保证。

## 基本语法或核心接口

本课的转换边界可以先抽象成一个最小函数接口。接口只描述输入和输出，不包含数据库或 HTTP 依赖。

```java
@FunctionalInterface
public interface Mapper<S, T> {
    /** 把一个源对象转换为目标对象。 */
    T map(S source);
}
```

`Mapper<FolderRow, FolderView> mapper = row -> new FolderView(row.id(), row.displayName());` 只做转换，
不修改输入、不查询数据库，也不记录副作用。

## 从零跟着做

1. 在 `/tmp` 创建临时目录和 `DomainValuesFeedback.java`，仓库内不要保留测试文件。

2. 定义 `Point` 值对象，先验证范围，再实现返回新对象的 scale 方法。

3. 定义 `FlatNode` 和内部 `Node`，用 LinkedHashMap 先建立 ID 索引。

4. 第二遍连接 parentId；拒绝重复 ID、孤儿、多根和循环。

5. 分别用队列和栈遍历同一棵树，记录 BFS 与 DFS 顺序。

6. 把含 internalNote 的源对象映射为只含 id、name 的响应。

7. 运行合法分支后，再依次运行 UNKNOWN、DUPLICATE、ORPHAN、MULTI_ROOT 和 CYCLE。

8. 最后检查 class major，并清理临时目录。

下面是可直接编译的完整现代反馈环：

```java
import java.util.*;

public final class DomainValuesFeedback {
    record Point(int x, int y) {
        /** 创建非负坐标。 */
        Point {
            if (x < 0 || y < 0) throw new IllegalArgumentException("negative point");
        }

        /** 返回按比例缩放的新坐标。 */
        Point scale(double factor) {
            if (!(factor > 0)) throw new IllegalArgumentException("invalid scale");
            return new Point((int) Math.round(x * factor), (int) Math.round(y * factor));
        }
    }

    record TagSet(List<String> values) {
        /** 复制标签列表，建立不可修改快照。 */
        TagSet {
            values = List.copyOf(values);
        }
    }

    record FlatNode(String id, String parentId, String label) {}
    record FolderRow(String id, String name, String internalNote) {}
    record FolderView(String id, String name) {}

    enum NodeKind {
        ROOT("root"), FOLDER("folder");

        private final String code;

        /** 保存稳定的外部编码。 */
        NodeKind(String code) {
            this.code = code;
        }

        /** 按稳定编码解析节点类型。 */
        static NodeKind fromCode(String code) {
            return Arrays.stream(values())
                .filter(kind -> kind.code.equals(code))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("unknown node kind: " + code));
        }
    }

    static final class Node {
        final String id;
        final List<Node> children = new ArrayList<>();

        /** 创建临时树节点。 */
        Node(String id) {
            this.id = id;
        }
    }

    /** 启动值、映射和树反馈环。 */
    public static void main(String[] args) {
        String mode = args.length == 0 ? "PASS" : args[0];
        if ("UNKNOWN".equals(mode)) {
            NodeKind.fromCode(mode);
        }
        List<FlatNode> rows = rowsFor(mode);
        Node root = build(rows);
        List<String> bfs = bfs(root);
        List<String> dfs = dfs(root);
        List<String> sourceTags = new ArrayList<>(List.of("java"));
        TagSet tagSet = new TagSet(sourceTags);
        sourceTags.add("mutable-source");
        FolderRow source = new FolderRow("docs", "文档", "secret");
        FolderView view = new FolderView(source.id(), source.name());
        require(new Point(10, 20).scale(0.5).equals(new Point(5, 10)), "point");
        require(new Point(5, 10).hashCode() == new Point(5, 10).hashCode(), "hash");
        require(tagSet.values().equals(List.of("java")), "snapshot");
        require(isUnmodifiable(tagSet.values()), "unmodifiable snapshot");
        require(NodeKind.fromCode("folder") == NodeKind.FOLDER, "node kind");
        require(view.toString().equals("FolderView[id=docs, name=文档]"), "mapping");
        require(!view.toString().contains("secret"), "mapping whitelist");
        require(bfs.equals(List.of("root", "a", "b", "a1")), "bfs");
        require(dfs.equals(List.of("root", "a", "a1", "b")), "dfs");
        System.out.printf("DOMAIN_VALUES_PASS nodes=%d bfs=%d dfs=%d%n",
            rows.size(), bfs.size(), dfs.size());
    }

    /** 按验证模式准备扁平节点。 */
    private static List<FlatNode> rowsFor(String mode) {
        return switch (mode) {
            case "DUPLICATE" -> List.of(
                new FlatNode("root", null, "root"),
                new FlatNode("root", null, "again"));
            case "ORPHAN" -> List.of(
                new FlatNode("root", null, "root"),
                new FlatNode("a", "missing", "a"));
            case "MULTI_ROOT" -> List.of(
                new FlatNode("root", null, "root"),
                new FlatNode("other", null, "other"));
            case "CYCLE" -> List.of(
                new FlatNode("a", "b", "a"),
                new FlatNode("b", "a", "b"));
            default -> List.of(
                new FlatNode("root", null, "root"),
                new FlatNode("a", "root", "a"),
                new FlatNode("b", "root", "b"),
                new FlatNode("a1", "a", "a1"));
        };
    }

    /** 构建并校验单根树。 */
    private static Node build(List<FlatNode> rows) {
        Map<String, Node> nodes = new LinkedHashMap<>();
        for (FlatNode row : rows) {
            if (row.id() == null || row.id().isBlank() || nodes.containsKey(row.id())) {
                throw new IllegalArgumentException("duplicate or empty node id: " + row.id());
            }
            nodes.put(row.id(), new Node(row.id()));
        }
        List<Node> roots = new ArrayList<>();
        for (FlatNode row : rows) {
            if (row.parentId() == null) {
                roots.add(nodes.get(row.id()));
            } else {
                Node parent = nodes.get(row.parentId());
                if (parent == null) {
                    throw new IllegalArgumentException("orphan parent: " + row.parentId());
                }
                parent.children.add(nodes.get(row.id()));
            }
        }
        validateParentChains(rows);
        if (roots.size() != 1) throw new IllegalArgumentException("root count: " + roots.size());
        return roots.getFirst();
    }

    /** 沿父链检查所有节点都不会回到当前路径。 */
    private static void validateParentChains(List<FlatNode> rows) {
        Map<String, String> parents = new HashMap<>();
        rows.forEach(row -> parents.put(row.id(), row.parentId()));
        for (FlatNode row : rows) {
            Set<String> path = new HashSet<>();
            String current = row.id();
            while (current != null) {
                if (!path.add(current)) {
                    throw new IllegalArgumentException("cycle at node: " + current);
                }
                current = parents.get(current);
            }
        }
    }

    /** 按层返回节点 ID。 */
    private static List<String> bfs(Node root) {
        List<String> result = new ArrayList<>();
        Deque<Node> queue = new ArrayDeque<>();
        queue.add(root);
        while (!queue.isEmpty()) {
            Node node = queue.removeFirst();
            result.add(node.id);
            queue.addAll(node.children);
        }
        return List.copyOf(result);
    }

    /** 用显式栈返回深度优先 ID。 */
    private static List<String> dfs(Node root) {
        List<String> result = new ArrayList<>();
        Deque<Node> stack = new ArrayDeque<>();
        stack.add(root);
        while (!stack.isEmpty()) {
            Node node = stack.removeLast();
            result.add(node.id);
            for (int i = node.children.size() - 1; i >= 0; i--) {
                stack.add(node.children.get(i));
            }
        }
        return List.copyOf(result);
    }

    /** 验证列表拒绝通过结果引用修改。 */
    private static boolean isUnmodifiable(List<String> values) {
        try {
            values.add("forbidden");
            return false;
        } catch (UnsupportedOperationException expected) {
            return true;
        }
    }

    /** 检查反馈环条件。 */
    private static void require(boolean condition, String message) {
        if (!condition) throw new IllegalStateException(message);
    }
}
```

## 如何使用

1. 在 Controller 或消息入口先把外部载荷解析为输入 DTO。

2. 在 Service 边界调用显式 mapper，把 DTO 转成值对象和领域命令。

3. 从 Repository 取得 flat rows 后，在 TreeBuilder 中完成索引、挂接和校验。

4. 输出时映射为单向响应 DTO 并复制集合，需要缓存时只缓存已验证快照。

5. 新增字段时先更新目标 DTO、mapper 和断言，再更新序列化合同。

## 适用与不适用场景

| 适用 | 不适用 |
| --- | --- |
| 有单位、范围或组合规则的值 | 没有独立规则的一次性局部变量 |
| 输入、领域、输出模型字段不同 | 真正共享同一生命周期和权限合同的对象 |
| 单父节点且从根可覆盖的目录 | 多父节点、任意回边或跨根连接的图 |
| 需要字段白名单与版本演进的 API | 没有跨边界传递的内部调试对象 |

## 当前项目补充

冻结审计中的十个代表符号只证明项目存在对象转换、外部编码、数值、规则、树和坐标处理场景，不证明
原实现语义，也不证明反射复制是推荐实现。本课示例是独立的去敏教学模型，不声称保留或纠正项目代码；
课程推荐显式命名类型、边界校验和单向 DTO。

## 旧版兼容写法

Java 8 没有 record、`List.copyOf`、`Stream.toList`、switch expression 和模式匹配 instanceof。用
final 字段、构造器、getter、复制后 unmodifiable 包装和普通 if/switch 表达本课的值对象与构树合同。

```java
public final class LegacyPageSize {
    private final int value;

    /** 创建 Java 8 兼容的页面大小。 */
    public LegacyPageSize(int value) {
        if (value < 1 || value > 100) {
            throw new IllegalArgumentException("page size must be 1..100");
        }
        this.value = value;
    }

    /** 返回页面大小。 */
    public int getValue() {
        return value;
    }
}
```

下面是可直接编译的完整 Java 8 反馈环：

```java
import java.util.*;

public final class DomainValuesLegacyFeedback {
    static final class Point {
        private final int x;
        private final int y;

        /** 创建非负坐标。 */
        Point(int x, int y) {
            if (x < 0 || y < 0) throw new IllegalArgumentException("negative point");
            this.x = x;
            this.y = y;
        }

        /** 返回按比例缩放的新坐标。 */
        Point scale(double factor) {
            if (!(factor > 0)) throw new IllegalArgumentException("invalid scale");
            return new Point((int) Math.round(x * factor), (int) Math.round(y * factor));
        }

        /** 判断坐标值是否相等。 */
        @Override
        public boolean equals(Object other) {
            if (!(other instanceof Point)) return false;
            Point point = (Point) other;
            return x == point.x && y == point.y;
        }

        /** 返回坐标哈希值。 */
        @Override
        public int hashCode() {
            return Objects.hash(x, y);
        }
    }

    static final class TagSet {
        private final List<String> values;

        /** 复制标签列表，建立 Java 8 不可修改快照。 */
        TagSet(List<String> values) {
            this.values = Collections.unmodifiableList(new ArrayList<String>(values));
        }

        /** 返回标签快照。 */
        List<String> getValues() {
            return values;
        }
    }

    static final class FlatNode {
        final String id;
        final String parentId;

        /** 创建 Java 8 扁平节点。 */
        FlatNode(String id, String parentId) {
            this.id = id;
            this.parentId = parentId;
        }
    }

    static final class FolderRow {
        final String id;
        final String name;
        final String internalNote;

        /** 创建包含内部字段的 Java 8 数据行。 */
        FolderRow(String id, String name, String internalNote) {
            this.id = id;
            this.name = name;
            this.internalNote = internalNote;
        }
    }

    static final class FolderView {
        final String id;
        final String name;

        /** 只复制允许输出的 Java 8 字段。 */
        FolderView(FolderRow source) {
            this.id = source.id;
            this.name = source.name;
        }

        /** 返回不含内部字段的稳定文本。 */
        @Override
        public String toString() {
            return "FolderView[id=" + id + ", name=" + name + "]";
        }
    }

    enum NodeKind {
        ROOT("root"), FOLDER("folder");

        private final String code;

        /** 保存 Java 8 稳定外部编码。 */
        NodeKind(String code) {
            this.code = code;
        }

        /** 按稳定编码解析 Java 8 节点类型。 */
        static NodeKind fromCode(String code) {
            for (NodeKind kind : values()) {
                if (kind.code.equals(code)) return kind;
            }
            throw new IllegalArgumentException("unknown node kind: " + code);
        }
    }

    static final class Node {
        final String id;
        final List<Node> children = new ArrayList<Node>();

        /** 创建 Java 8 树节点。 */
        Node(String id) {
            this.id = id;
        }
    }

    /** 启动 Java 8 值、映射和树反馈环。 */
    public static void main(String[] args) {
        String mode = args.length == 0 ? "PASS" : args[0];
        if ("UNKNOWN".equals(mode)) {
            NodeKind.fromCode(mode);
        }
        List<FlatNode> rows = rowsFor(mode);
        Node root = build(rows);
        List<String> bfs = bfs(root);
        List<String> dfs = dfs(root);
        List<String> sourceTags = new ArrayList<String>(Arrays.asList("java"));
        TagSet tagSet = new TagSet(sourceTags);
        sourceTags.add("mutable-source");
        FolderView view = new FolderView(new FolderRow("docs", "文档", "secret"));
        require(new Point(10, 20).scale(0.5).equals(new Point(5, 10)), "point");
        require(new Point(5, 10).hashCode() == new Point(5, 10).hashCode(), "hash");
        require(tagSet.getValues().equals(Arrays.asList("java")), "snapshot");
        require(isUnmodifiable(tagSet.getValues()), "unmodifiable snapshot");
        require(NodeKind.fromCode("folder") == NodeKind.FOLDER, "node kind");
        require(view.toString().equals("FolderView[id=docs, name=文档]"), "mapping whitelist");
        require(!view.toString().contains("secret"), "mapping whitelist");
        require(bfs.equals(Arrays.asList("root", "a", "b", "a1")), "bfs");
        require(dfs.equals(Arrays.asList("root", "a", "a1", "b")), "dfs");
        System.out.println("DOMAIN_VALUES_LEGACY_PASS nodes=4 bfs=4 dfs=4");
    }

    /** 按验证模式准备 Java 8 扁平节点。 */
    private static List<FlatNode> rowsFor(String mode) {
        if ("DUPLICATE".equals(mode)) {
            return Arrays.asList(new FlatNode("root", null), new FlatNode("root", null));
        }
        if ("ORPHAN".equals(mode)) {
            return Arrays.asList(new FlatNode("root", null), new FlatNode("a", "missing"));
        }
        if ("MULTI_ROOT".equals(mode)) {
            return Arrays.asList(new FlatNode("root", null), new FlatNode("other", null));
        }
        if ("CYCLE".equals(mode)) {
            return Arrays.asList(new FlatNode("a", "b"), new FlatNode("b", "a"));
        }
        return Arrays.asList(
            new FlatNode("root", null),
            new FlatNode("a", "root"),
            new FlatNode("b", "root"),
            new FlatNode("a1", "a"));
    }

    /** 构建 Java 8 单根树。 */
    private static Node build(List<FlatNode> rows) {
        Map<String, Node> nodes = new LinkedHashMap<String, Node>();
        Node root = null;
        int rootCount = 0;
        for (FlatNode row : rows) {
            if (row.id == null || nodes.containsKey(row.id)) {
                throw new IllegalArgumentException("duplicate or empty node id");
            }
            nodes.put(row.id, new Node(row.id));
        }
        for (FlatNode row : rows) {
            if (row.parentId == null) {
                rootCount++;
                root = nodes.get(row.id);
            } else {
                Node parent = nodes.get(row.parentId);
                if (parent == null) throw new IllegalArgumentException("orphan: " + row.parentId);
                parent.children.add(nodes.get(row.id));
            }
        }
        validateParentChains(rows);
        if (rootCount != 1) throw new IllegalArgumentException("root count: " + rootCount);
        return root;
    }

    /** 沿父链检查 Java 8 节点不会回到当前路径。 */
    private static void validateParentChains(List<FlatNode> rows) {
        Map<String, String> parents = new HashMap<String, String>();
        for (FlatNode row : rows) {
            parents.put(row.id, row.parentId);
        }
        for (FlatNode row : rows) {
            Set<String> path = new HashSet<String>();
            String current = row.id;
            while (current != null) {
                if (!path.add(current)) {
                    throw new IllegalArgumentException("cycle at node: " + current);
                }
                current = parents.get(current);
            }
        }
    }

    /** 按层返回 Java 8 节点 ID。 */
    private static List<String> bfs(Node root) {
        List<String> result = new ArrayList<String>();
        Deque<Node> queue = new ArrayDeque<Node>();
        queue.addLast(root);
        while (!queue.isEmpty()) {
            Node node = queue.removeFirst();
            result.add(node.id);
            queue.addAll(node.children);
        }
        return Collections.unmodifiableList(new ArrayList<String>(result));
    }

    /** 返回 Java 8 深度优先节点 ID。 */
    private static List<String> dfs(Node root) {
        List<String> result = new ArrayList<String>();
        Deque<Node> stack = new ArrayDeque<Node>();
        stack.addLast(root);
        while (!stack.isEmpty()) {
            Node node = stack.removeLast();
            result.add(node.id);
            for (int i = node.children.size() - 1; i >= 0; i--) {
                stack.addLast(node.children.get(i));
            }
        }
        return Collections.unmodifiableList(new ArrayList<String>(result));
    }

    /** 验证 Java 8 列表拒绝通过结果引用修改。 */
    private static boolean isUnmodifiable(List<String> values) {
        try {
            values.add("forbidden");
            return false;
        } catch (UnsupportedOperationException expected) {
            return true;
        }
    }

    /** 检查 Java 8 反馈环条件。 */
    private static void require(boolean condition, String message) {
        if (!condition) throw new IllegalStateException(message);
    }
}
```

预期输出为 `DOMAIN_VALUES_LEGACY_PASS nodes=4 bfs=4 dfs=4`。UNKNOWN、DUPLICATE、ORPHAN、
MULTI_ROOT、CYCLE 五个模式必须明确失败。必须在 Java 8 容器实际编译运行，不能只用 Java 25 的
`--release 8` 代替
运行时验证。

## 新旧版本差异

| 对比项 | Java 25 / Spring Boot 4.1.0 | Java 8 / Spring Boot 2.3.12.RELEASE |
| --- | --- | --- |
| 值对象 | record 与紧凑构造器 | final 类、构造器、getter、equals/hashCode |
| 集合快照 | `List.copyOf`、`Map.copyOf` | 复制后 `Collections.unmodifiable*` |
| Stream 收集 | `toList()` 返回不可修改结果 | `collect(Collectors.toList())` 后自行包装 |
| 控制流 | switch expression、模式匹配 instanceof | 传统 switch、显式强制转换 |
| 映射 | 手写或编译期生成 mapper | 同样可手写；项目工具仍需字段白名单测试 |

## 易错点

### 易错点 1：把 record 当作深度不可变对象

1. **现象**：源列表改变后，record 中的 children 也变化。
2. **触发条件**：直接保存 List 引用或只创建只读视图。
3. **原因**：record 只让组件引用不可重新赋值，不复制可变对象。
4. **后果**：缓存键、响应和并发读取变得不稳定。
5. **错误示例**：`record Menu(List<String> items) {}`。
6. **正确写法**：Java 25 用 `List.copyOf`；Java 8 先复制再包装。
7. **影响版本**：Java 25 与 Java 8 均适用。
8. **验证方式**：分别修改源列表和返回列表，断言值不变且修改被拒绝。
9. **来源依据**：`jep395-records`、`java25-list-copyof`、`java25-unmodifiable-list`。

### 易错点 2：用 ordinal 或 name 代替外部编码

1. **现象**：调整 enum 顺序后，旧数据含义改变。
2. **触发条件**：持久化 `ordinal()` 或用 `Enum.valueOf` 解析业务 code。
3. **原因**：ordinal 是声明位置，name 是源码符号，都不是业务协议。
4. **后果**：历史数据、消息和接口静默错配。
5. **错误示例**：`int code = kind.ordinal();`。
6. **正确写法**：声明稳定 code 并显式处理未知值。
7. **影响版本**：Java 25 与 Java 8 均适用。
8. **验证方式**：交换声明顺序后 code 测试仍通过，未知 code 明确失败。
9. **来源依据**：`java25-enum` 与课程负向反馈环。

### 易错点 3：同名属性自动复制敏感字段

1. **现象**：内部备注或权限字段出现在响应中。
2. **触发条件**：对 entity、PO、DTO 调用无配置反射 copy。
3. **原因**：名称相同不代表权限、单位和生命周期相同。
4. **后果**：数据泄漏，客户端依赖内部结构。
5. **错误示例**：`BeanUtil.copyProperties(entity, response)`。
6. **正确写法**：手写字段白名单或显式生成式 mapping。
7. **影响版本**：与 Java 版本无关。
8. **验证方式**：精确断言响应字段集合不含 internalNote 和 permission。
9. **来源依据**：`mapstruct-reference`、`spring-framework-5215-bean-utils`；项目 BeanUtil 仅作
   observed 证据。

### 易错点 4：构树只检查根，不检查孤儿和环

1. **现象**：页面只显示半棵树或遍历卡死。
2. **触发条件**：找到一个 root 后直接返回。
3. **原因**：存在根不代表每个节点可达且关系无环。
4. **后果**：错误树被缓存或写回数据库。
5. **错误示例**：`return roots.get(0);`。
6. **正确写法**：拒绝重复、未知 parent、多根，并检查所有父链。
7. **影响版本**：算法与 Java 版本无关。
8. **验证方式**：分别输入孤儿、多根和 a 到 b 到 a，断言明确异常。
9. **来源依据**：`java25-deque` 与完整构树反馈环。

### 易错点 5：双向节点直接交给 JSON 序列化器

1. **现象**：序列化无限递归、响应过大或泄漏 parent。
2. **触发条件**：子节点保存 parent 对象，Controller 直接返回领域树。
3. **原因**：领域导航关系和外部响应方向不同。
4. **后果**：栈溢出、字段泄漏和客户端合同不稳定。
5. **错误示例**：`return repository.loadTree();`。
6. **正确写法**：映射为只有 id、label、children 的单向响应。
7. **影响版本**：Jackson 2.x 和 Java 8/25 均适用。
8. **验证方式**：断言三层 JSON 的字段集合固定且没有 parent。
9. **来源依据**：`jackson-databind` 与 `java25-list-copyof`。

## 安全注意

1. 输入 DTO 只允许必要字段，权限、租户和审核状态必须由服务端决定。
2. 构树前限制节点数量、标签长度和最大深度，避免耗尽内存或递归栈。
3. 序列化前执行字段白名单和资源级授权，`@JsonIgnore` 不能替代授权。
4. 错误日志只保留稳定节点 ID 和错误类型，不记录完整业务载荷。

## 性能注意

本课不宣称某个 mapper 必然更快。索引构树和 BFS/DFS 的目标复杂度都是 O(n)，但集合复制和序列化
会产生额外内存。需要优化时，应固定 JDK、节点数量、深度、堆大小和载荷后使用 JMH 或 JFR 测量。

## 如何验证

1. 在 `/tmp` 使用 `mktemp -d` 创建现代和 legacy 目录。
2. Java 25 用 `javac -Xlint:all -Werror --release 25` 编译完整反馈环。
3. 正常运行必须输出 `DOMAIN_VALUES_PASS nodes=4 bfs=4 dfs=4`。
4. UNKNOWN、DUPLICATE、ORPHAN、MULTI_ROOT、CYCLE 必须非零退出并保留 code、节点或根数量。
5. `javap -verbose` 必须显示现代 class major 69。
6. Java 8 用 `javac -Xlint:all -Werror` 编译 legacy fixture 并输出 legacy PASS。
7. Java 8 的 UNKNOWN、DUPLICATE、ORPHAN、MULTI_ROOT、CYCLE 也必须非零退出并保留对应上下文。
8. `javap -verbose` 必须显示 legacy class major 52。
9. 清理临时目录并确认不存在，再运行 Catalog、知识路径和全仓质量 Gate。

## 练习

:::exercise
### 练习：把扁平菜单转换成安全响应树

**要求：** 定义 `MenuRow(id, parentId, code, label, hidden)`，构建单根树；把 code 映射为显式
MenuKind；输出 `MenuView(id, label, children)`，不暴露 hidden 和内部审计字段。

**验收：** 合法输入得到稳定 BFS 顺序；重复 ID、孤儿、循环和未知 code 都明确失败；修改源列表后
输出不变；序列化结果没有 parent 回指。

**参考答案：** 先索引和校验，再按字段白名单映射；树节点保持单向 children；在边界复制列表。
:::

## 本节小结

- 值对象用属性和不变量表达概念，实体靠稳定身份，DTO 表达某个边界允许的字段。
- record 只是浅不可变载体，集合和元素的复制合同仍需手写。
- equals/hashCode、enum 显式 code 和单位值对象让数据保持稳定语义。
- 显式 mapper 是字段白名单，工具应按复杂度与错误发现时机选择。
- 构树必须检查重复、根、孤儿、循环和覆盖率，DFS/BFS 负责不同访问顺序。
- 领域树与响应树分离，单向 DTO 避免循环序列化和内部字段泄漏。
