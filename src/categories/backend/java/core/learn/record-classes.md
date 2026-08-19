---
id: backend.java.learn.basics.record-classes
type: lesson
title: record
summary: 用 record 表达透明的数据载体，并在 Java 8 中用不可变 final class 保持兼容
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 90
prerequisites:
  - backend.java.learn.basics.object-equals-and-hashcode
objectives:
  - 能读懂 record header 中组件、类型和组件名组成的声明。
  - 能使用组件访问器、canonical constructor 和 compact constructor。
  - 能解释 record 自动生成的 equals、hashCode、toString 和访问器。
  - 能区分 record 的浅不可变与组件对象本身的可变性。
  - 能判断 record 适合值对象还是不适合需要身份和可变生命周期的对象。
  - 能在 JDK 25 中运行 TeamFlow record，并用 Java 8 的 final class 写出等价程序。
recap:
  - record header 声明一组固定组件，组件名同时成为访问器方法名。
  - record 隐式继承 java.lang.Record 并且隐式 final，不能再继承普通类或被继承。
  - 未显式声明时，编译器提供 canonical constructor、访问器以及按组件生成的 equals、hashCode、toString。
  - compact constructor 适合校验和规范化参数，不能在其体内直接给组件字段赋值。
  - record 只保证组件引用不被重新赋值；List、数组等组件仍需防御性复制才能避免外部修改。
  - Java 8 不支持 record 语法，应使用 final 字段、构造器、访问器和对象合同组成兼容实现。
related: []
tags:
  - Java
  - record
  - Record
  - 数据载体
  - 不可变性
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 不支持 record，使用 final class 兼容实现
verifiedAt: 2026-08-17
sources:
  - id: jls25-record-classes
    title: "Java Language Specification 25 - Record Classes"
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.10
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - record header 声明组件并确定 record descriptor
      - record 的 canonical constructor、组件字段和访问器具有约定的签名
      - record 不能声明 extends，且隐式为 final
  - id: jep395-records
    title: "JEP 395: Records"
    url: https://openjdk.org/jeps/395
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: JDK 16 及以上
    claims:
      - record 在 Java 16 正式交付
      - record 自动提供访问器、canonical constructor 以及 equals、hashCode、toString
      - compact constructor 用于校验或规范化参数，组件字段在构造器结束时赋值
  - id: jdk25-record-api
    title: "Record (Java SE 25 & JDK 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Record.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - java.lang.Record 是所有 record class 的共同抽象基类
      - record 是浅不可变且透明的数据载体
      - 隐式成员从所有 record components 派生
  - id: dev-java-records
    title: "Using Records to Model Immutable Data - Dev.java"
    url: https://dev.java/learn/records/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java SE 16 及以上
    claims:
      - 组件访问器使用组件名而不是 get 前缀
      - 可通过 compact constructor 校验参数或复制可变组件
      - record 可以声明额外构造器、方法和自定义访问器
  - id: jetbrains-project-structure
    title: "Project structure settings - IntelliJ IDEA"
    url: https://www.jetbrains.com/help/idea/project-settings-and-structure.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: IntelliJ IDEA 2026.2
    claims:
      - Project SDK 与 language level 可以分别配置
      - 模块可以继承项目设置，也可以使用模块级 language level
  - id: jdk25-object-api
    title: "Object (Java SE 25 & JDK 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - equals、hashCode 和 toString 是 Object 的基础方法合同
      - record 生成的对象合同仍需按 Object 的相等与哈希规则理解
  - id: jdk8-object-api
    title: "Object (Java Platform SE 8)"
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/Object.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 final class 兼容实现可使用 Object 的 equals、hashCode 和 toString 合同
  - id: jdk8-objects-api
    title: "Objects (Java Platform SE 8)"
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Objects.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 已提供 Objects.requireNonNull、Objects.equals 和 Objects.hash
  - id: jdk8-character-api
    title: "Character (Java Platform SE 8)"
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/Character.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 可用 Character.isWhitespace(int) 按 Unicode code point 判断 Java 空白字符
  - id: jls8-class-declarations
    title: "Java Language Specification 8 - Class Declarations"
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html#jls-8.1
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 的兼容写法使用普通 class 声明、字段和构造器，不使用 record 声明
  - id: stackoverflow-record-accessors
    title: "Post Java-14 (records) getter/setter naming convention"
    url: https://stackoverflow.com/questions/59981081/post-java-14-records-getter-setter-naming-convention
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 14 及以上的迁移疑问
    claims:
      - 社区真实问答集中出现把 record 访问器误认为 getName() 的迁移困惑
  - id: stackoverflow-shallow-immutable
    title: "Meaning of shallowly immutable in the documentation of Record in Java 14"
    url: https://stackoverflow.com/questions/62057172/meaning-of-shallowly-immutable-in-the-documentation-of-record-in-java-14
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java record 初学者的可变组件疑问
    claims:
      - 社区真实问答显示 shallowly immutable 与可变组件是初学者高频困惑
---

# record

上一课已经把 `equals`、`hashCode` 和不可变键的对象合同分开讲清楚。本课继续处理一个更具体的建模问题：
当一个类型只是“几项数据放在一起”，是否还需要手写字段、构造器、访问器和对象合同？Java 25 的 `record`
把这组意图直接写进声明，同时保留校验、规范化和少量行为的扩展位置。

本课只学习 record 作为透明数据载体的语言能力。集合如何遍历、JSON 如何映射、数据库实体如何持久化，以及
TeamFlow 的通知策略都留在对应课程；这里用一个任务摘要完成从声明到运行的闭环。

## 一、把数据载体写成 record

### 1. 先看普通 final class 的重复部分

下面的类只保存团队和任务标题，却要重复声明两个字段、构造器、访问器、`equals`、`hashCode` 和 `toString`。
这些方法并非业务行为，而是在描述“这个值由哪些组件组成”：

```java
import java.util.Objects;

/** 表示一个只由团队和标题决定的任务摘要。 */
final class ClassTaskSummary {
    private final String teamId;
    private final String title;

    /** 创建任务摘要。
     *
     * @param teamId 团队标识
     * @param title 任务标题
     */
    ClassTaskSummary(String teamId, String title) {
        this.teamId = teamId;
        this.title = title;
    }

    /** 返回团队标识。
     *
     * @return 团队标识
     */
    String teamId() {
        return teamId;
    }

    /** 返回任务标题。
     *
     * @return 任务标题
     */
    String title() {
        return title;
    }

    /** 按两个组件判断值是否相等。
     *
     * @param obj 待比较对象
     * @return 两个组件都相等则为 true
     */
    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof ClassTaskSummary)) {
            return false;
        }
        ClassTaskSummary other = (ClassTaskSummary) obj;
        return Objects.equals(teamId, other.teamId) && Objects.equals(title, other.title);
    }

    /** 根据两个组件计算哈希值。
     *
     * @return 组件哈希值
     */
    @Override
    public int hashCode() {
        return Objects.hash(teamId, title);
    }

    /** 返回任务摘要的文字表示。
     *
     * @return 任务摘要文字
     */
    @Override
    public String toString() {
        return "ClassTaskSummary[teamId=" + teamId + ", title=" + title + "]";
    }
}
```

这里的重复不是错误：Java 8 必须这样表达这类值对象。但如果类型的主要意图确实是“由这些组件透明描述”，
`record` 可以让声明本身成为这份合同。

### 2. 用 header 声明组件

```java
/** 表示一个由团队和标题组成的任务摘要。 */
record TaskSummary(String teamId, String title) {
}
```

`TaskSummary` 是类型名；圆括号中的 `String teamId` 和 `String title` 是 record components，合起来称为
record header。组件同时确定构造器参数、组件字段、访问器和对象合同的输入。创建对象时仍然使用 `new`：

```java
TaskSummary summary = new TaskSummary("team-7", "release");
System.out.println(summary.teamId());
System.out.println(summary.title());
```

输出分别是 `team-7` 和 `release`。访问器的方法名就是组件名，因此写 `summary.teamId()`，不是普通 JavaBean
常见的 `summary.getTeamId()`。这是语言生成的访问方式，不是命名偏好开关。

### 3. record 的身份边界

record 隐式继承 `java.lang.Record`，并且隐式为 `final`。它没有 `extends` 子句，不能再继承一个普通类；其他
类型也不能继承这个 record。这个限制让 record 的公开状态只能来自 header 中的组件，避免子类偷偷增加会改变对象
意义的状态。

record 仍然可以实现接口，也可以声明静态字段、静态方法和与组件相关的实例方法。它适合任务摘要、坐标、金额等
值对象；如果一个对象需要通过稳定 ID 识别、经历多次状态变化，或者必须由框架无参创建后再写入字段，就先使用普通
类。选择 record 不是把所有 class 自动缩短，而是声明“组件已经完整描述这个值”。

## 二、组件会带来哪些成员

### 1. 访问器、字段和 canonical constructor

对 `record TaskSummary(String teamId, String title)`，可以先记住四个可观察结果：

1. 有两个 private、final 的组件字段。
2. 有 `String teamId()` 和 `String title()` 两个 public 访问器。
3. 有一个参数签名与 header 对应的 canonical constructor。
4. 如果没有自己声明，以上成员由编译器提供。

因此下面的调用能够直接编译：

```java
TaskSummary first = new TaskSummary("team-7", "release");
TaskSummary second = new TaskSummary("team-7", "release");
System.out.println(first.teamId());
System.out.println(first.equals(second));
System.out.println(first.hashCode() == second.hashCode());
System.out.println(first);
```

预期输出是：

```text
team-7
true
true
TaskSummary[teamId=team-7, title=release]
```

`equals`、`hashCode` 和 `toString` 都从全部组件派生。两个组件值都相等时，两个独立创建的 record 相等；改变任意
一个组件值就会得到不同的值判断。哈希合同仍然沿用上一课：相等对象必须拥有相同的 `hashCode`，不相等对象允许
发生碰撞。

### 2. 组件不是 get/set 属性

record 没有为组件生成 `getTeamId()` 或 `setTeamId(...)`。组件字段是 final，不能通过 setter 改写。下面的错误
访问会在编译时找不到方法：

```java
TaskSummary summary = new TaskSummary("team-7", "release");
// System.out.println(summary.getTeamId()); // 错误：record 访问器叫 teamId()
// summary.setTitle("done");               // 错误：record 没有 setter
```

正确写法是调用 `summary.teamId()`，如果需要另一个标题就创建新的 `TaskSummary`。创建新值不是修改原对象，这也是
record 适合值对象的原因。

### 3. 可以添加接口实现和小型行为

record 可以实现接口，也可以声明不改变组件合同的实例方法：

```java
/** 为可显示对象提供摘要文字。 */
interface Displayable {
    /** 返回展示文字。
     *
     * @return 展示文字
     */
    String displayText();
}

/** 实现 Displayable 的任务摘要。 */
record DisplayTask(String teamId, String title) implements Displayable {
    /** 返回团队与标题组成的展示文字。
     *
     * @return 展示文字
     */
    @Override
    public String displayText() {
        return teamId + " / " + title;
    }
}
```

实例方法可以根据组件计算结果，但不应藏入没有出现在 header 中的实例状态。静态工厂方法同样可以放在 record
体内；本课只用直接构造器，避免把工厂模式提前变成新的主题。

## 三、用构造器守住组件合同

### 1. 显式 canonical constructor

没有校验时，让隐式 canonical constructor 接收参数并赋值即可。有输入约束时，可以完整写出同样签名的构造器：

```java
import java.util.Objects;

/** 表示已经通过最小输入校验的任务摘要。 */
record ValidatedTask(String teamId, String title) {
    /** 创建任务摘要并拒绝空引用。
     *
     * @param teamId 团队标识
     * @param title 任务标题
     */
    public ValidatedTask(String teamId, String title) {
        this.teamId = Objects.requireNonNull(teamId, "teamId");
        this.title = Objects.requireNonNull(title, "title");
    }
}
```

这里写的是完整形式的 canonical constructor：参数列表与 header 逐项对应，并显式给两个组件字段赋值。下一节的
compact canonical constructor 才会省略参数列表，并由编译器在构造器体正常结束后完成字段赋值。两种形式只能选一种。

### 2. compact constructor 适合校验和规范化

compact 形式的重点是处理隐式参数，而不是重复 `this.field = parameter`：

```java
import java.util.Objects;

/** 表示一个标题会被规范化的任务摘要。 */
record NormalizedTask(String teamId, String title) {
    /** 校验团队并去除标题两端空白。
     *
     * @param teamId 团队标识
     * @param title 原始标题
     */
    public NormalizedTask {
        Objects.requireNonNull(teamId, "teamId");
        Objects.requireNonNull(title, "title");
        title = title.trim();
        if (title.isEmpty()) {
            throw new IllegalArgumentException("title 不能为空");
        }
    }
}
```

构造器结束时，record 才把当前参数值赋给组件字段，所以传入 `"  release  "` 后，`title()` 返回 `release`。
如果传入空标题，构造器抛出 `IllegalArgumentException`，对象不会被创建。规范化只改变参数变量，不需要手写字段
赋值；这也是 compact 形式比普通类构造器短的地方。

### 3. 构造器中不要把访问器当成参数

组件字段在 compact constructor 结束前还没有完成最终赋值。因此校验和规范化应直接使用参数名：

```java
/** 展示 compact constructor 中参数的正确使用位置。 */
record Range(int start, int end) {
    /** 拒绝反向区间。
     *
     * @param start 起点
     * @param end 终点
     */
    public Range {
        if (start > end) {
            throw new IllegalArgumentException("start 不能大于 end");
        }
    }
}
```

`start` 和 `end` 是构造器参数，可以直接用于校验；不要在 compact constructor 中用 `start()`、`end()` 代替它们。
如果需要调用辅助逻辑，给辅助方法传参数，仍然保持校验发生在组件被固定之前。

## 四、不可变性与适用边界

### 1. record 是浅不可变

record 的每个组件字段是 final，表示组件引用在构造后不会换成另一个引用。但 final 引用指向的对象仍可能可变：

```java
import java.util.ArrayList;
import java.util.List;

/** 只展示 record 对可变列表的浅不可变语义。 */
public final class MutableOwnersExample {
    /** 观察外部列表修改会进入 record。
     *
     * @param args 命令行参数，本程序不使用
     */
    public static void main(String[] args) {
        List<String> owners = new ArrayList<>();
        owners.add("alice");
        MutableOwners value = new MutableOwners(owners);
        owners.add("bob");
        System.out.println(value.owners().size()); // 2
    }
}

/** 保存负责人列表引用的示例 record。 */
record MutableOwners(List<String> owners) {
}
```

输出是 `2`，因为 record 只保存了列表引用，外部列表仍然能改变。数组、`Date`、可变 Map 和含可变元素的自定义
对象也有同样风险。不能看到 `record` 就直接宣称“对象内部所有东西都不可变”。

### 2. 对可变组件做防御性复制

如果业务确实需要把列表作为组件，应在 compact constructor 中复制并限制结构修改。JDK 25 可以使用 `List.copyOf`：

```java
import java.util.List;
import java.util.Objects;

/** 保存稳定的负责人快照。 */
record OwnerSnapshot(List<String> owners) {
    /** 复制并冻结负责人列表。
     *
     * @param owners 外部负责人列表
     */
    public OwnerSnapshot {
        Objects.requireNonNull(owners, "owners");
        owners = List.copyOf(owners);
    }
}
```

这次复制只保证列表结构不再从外部改变；如果列表元素本身是可变对象，还要继续复制或选择不可变元素。组件的
`owners()` 返回不可修改的列表，调用 `owners().add(...)` 会被拒绝。防御性复制是本课的设计边界示例，不展开
集合 API 的完整分类。

### 3. 什么时候不要使用 record

可以用下面三问判断：

1. 类型的身份是否完全由 header 中的组件值决定？如果需要数据库 ID 之外的生命周期身份，record 往往不合适。
2. 创建后是否应保持组件引用稳定？如果必须无参创建后再逐个 setter 写入，record 不合适。
3. 组件是否能在构造时完成校验和复制？如果不能保证值合同，先设计清楚普通类的状态边界。

TeamFlow 的任务摘要、通知内容快照和简单请求值都可能是 record；正在执行的任务实体、需要变更状态的服务对象
则不应仅为少写几行代码而改成 record。本课不实现通知策略，也不在 record 中塞入业务流程。

**社区补充：** Stack Overflow 关于 `name()` 访问器和 “shallowly immutable” 的问答，分别反映了 JavaBean
迁移和可变组件两个真实困惑。这里的结论以 Java 25 JLS、`Record` API 和 Dev.java 为准；社区问题只帮助我们把
这两个误区放进可复现的错误对照。

## 五、在 TeamFlow 中运行完整 record

### 1. 先确定任务摘要的组件

本例把一个任务摘要定义为团队、标题和负责人列表。团队与标题不能为空，负责人列表在构造时复制；摘要显示方法
只读取组件，不维护额外实例字段。这样 record 的透明数据载体语义与 TeamFlow 场景对应，但不引入 HTTP、数据库或
通知策略。

### 2. JDK 25 完整程序

把下面代码保存为 `TeamFlowRecordApplication.java`。文件名对应 public 类名；record 可以与入口类放在同一源文件，
但只有入口类需要与文件名一致：

```java
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/** 运行 TeamFlow record 任务摘要示例。 */
public final class TeamFlowRecordApplication {
    /** 运行任务摘要示例并打印可观察结果。
     *
     * @param args 命令行参数，本程序不使用
     */
    public static void main(String[] args) {
        List<String> owners = new ArrayList<>(List.of("alice", "bob"));
        TeamFlowTaskSummary first = new TeamFlowTaskSummary("team-7", "release", owners);
        owners.add("changed-outside");
        TeamFlowTaskSummary same = new TeamFlowTaskSummary(
                "team-7",
                "release",
                List.of("alice", "bob")
        );

        System.out.println("团队：" + first.teamId());
        System.out.println("标题：" + first.title());
        System.out.println("负责人数量：" + first.owners().size());
        System.out.println("同一任务：" + first.equals(same));
        System.out.println("记录：" + first);
    }
}

/** 保存不可变 TeamFlow 任务摘要。 */
record TeamFlowTaskSummary(String teamId, String title, List<String> owners) {
    /** 校验组件并复制负责人列表。
     *
     * @param teamId 团队标识
     * @param title 任务标题
     * @param owners 负责人列表
     */
    public TeamFlowTaskSummary {
        Objects.requireNonNull(teamId, "teamId");
        Objects.requireNonNull(title, "title");
        Objects.requireNonNull(owners, "owners");
        if (teamId.isBlank() || title.isBlank()) {
            throw new IllegalArgumentException("teamId 和 title 不能为空");
        }
        owners = List.copyOf(owners);
    }
}
```

运行：在 IntelliJ IDEA 中选择 Project SDK 为 JDK 25，确认 `TeamFlowRecordApplication.java` 位于普通 Java
项目的 source root 下，打开文件中的 `main` 方法并点击运行图标。也可以在项目根目录执行：

```sh
javac --release 25 TeamFlowRecordApplication.java
java TeamFlowRecordApplication
```

预期输出：

```text
团队：team-7
标题：release
负责人数量：2
同一任务：true
记录：TeamFlowTaskSummary[teamId=team-7, title=release, owners=[alice, bob]]
```

`first` 构造后，原始 `owners` 增加了第三个元素；负责人数量仍为 `2`，证明 compact constructor 保存的是复制结果。
`same` 是另一个对象，但三个组件都相等，所以生成的 `equals` 返回 `true`。最后一行是当前 JDK 25 对自动
`toString` 的可观察结果；程序不应依赖这段文字的精确格式做解析。

### 3. Java 8 完整程序

Java 8 没有 `record` 关键字，也没有 `List.copyOf` 和 `String.isBlank`。将下面完整代码保存为
`TeamFlowRecordApplicationJava8.java`，用 final 字段、构造器、访问器、对象合同和 `Collections.unmodifiableList`
表达同一份业务事实：

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/** 运行 Java 8 兼容的 TeamFlow 任务摘要示例。 */
public final class TeamFlowRecordApplicationJava8 {
    /** 运行任务摘要示例并打印可观察结果。
     *
     * @param args 命令行参数，本程序不使用
     */
    public static void main(String[] args) {
        List<String> owners = asList("alice", "bob");
        TeamFlowTaskSummaryJava8 first = new TeamFlowTaskSummaryJava8("team-7", "release", owners);
        owners.add("changed-outside");
        TeamFlowTaskSummaryJava8 same = new TeamFlowTaskSummaryJava8(
                "team-7",
                "release",
                asList("alice", "bob")
        );

        System.out.println("团队：" + first.teamId());
        System.out.println("标题：" + first.title());
        System.out.println("负责人数量：" + first.owners().size());
        System.out.println("同一任务：" + first.equals(same));
        System.out.println("记录：" + first);
    }

    /** 创建固定内容的负责人列表。
     *
     * @param first 第一位负责人
     * @param second 第二位负责人
     * @return 包含两位负责人的列表
     */
    private static List<String> asList(String first, String second) {
        List<String> owners = new ArrayList<>();
        owners.add(first);
        owners.add(second);
        return owners;
    }
}

/** 使用 Java 8 语法表达 TeamFlow 任务摘要。 */
final class TeamFlowTaskSummaryJava8 {
    private final String teamId;
    private final String title;
    private final List<String> owners;

    /** 校验组件并复制负责人列表。
     *
     * @param teamId 团队标识
     * @param title 任务标题
     * @param owners 负责人列表
     */
    TeamFlowTaskSummaryJava8(String teamId, String title, List<String> owners) {
        this.teamId = Objects.requireNonNull(teamId, "teamId");
        this.title = Objects.requireNonNull(title, "title");
        Objects.requireNonNull(owners, "owners");
        if (isBlank(teamId) || isBlank(title)) {
            throw new IllegalArgumentException("teamId 和 title 不能为空");
        }
        this.owners = Collections.unmodifiableList(new ArrayList<>(owners));
    }

    /** 判断文本是否为空或只包含 Java 空白字符。
     *
     * @param value 已完成非空校验的文本
     * @return 为空或只包含空白字符则为 true
     */
    private static boolean isBlank(String value) {
        if (value.isEmpty()) {
            return true;
        }
        for (int index = 0; index < value.length(); ) {
            int codePoint = value.codePointAt(index);
            if (!Character.isWhitespace(codePoint)) {
                return false;
            }
            index += Character.charCount(codePoint);
        }
        return true;
    }

    /** 返回团队标识。
     *
     * @return 团队标识
     */
    public String teamId() {
        return teamId;
    }

    /** 返回任务标题。
     *
     * @return 任务标题
     */
    public String title() {
        return title;
    }

    /** 返回不可修改的负责人列表。
     *
     * @return 负责人列表
     */
    public List<String> owners() {
        return owners;
    }

    /** 按全部组件判断值是否相等。
     *
     * @param obj 待比较对象
     * @return 三个组件都相等则为 true
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof TeamFlowTaskSummaryJava8)) {
            return false;
        }
        TeamFlowTaskSummaryJava8 other = (TeamFlowTaskSummaryJava8) obj;
        return Objects.equals(teamId, other.teamId)
                && Objects.equals(title, other.title)
                && Objects.equals(owners, other.owners);
    }

    /** 根据全部组件计算哈希值。
     *
     * @return 组件哈希值
     */
    @Override
    public int hashCode() {
        return Objects.hash(teamId, title, owners);
    }

    /** 返回与现代示例相同形状的文字表示。
     *
     * @return 任务摘要文字
     */
    @Override
    public String toString() {
        return "TeamFlowTaskSummaryJava8[teamId=" + teamId
                + ", title=" + title + ", owners=" + owners + "]";
    }
}
```

在 IDEA 中把 Project SDK、模块 SDK、language level 和运行配置的 JRE 都选择 Java 8，再运行
`TeamFlowRecordApplicationJava8.main`。如果项目里保留了 JDK 25 配置，先查看运行配置实际使用的 JRE；只改
Project SDK 而不改运行配置，可能仍由另一套 JDK 启动。命令行兼容验证是：

```sh
javac -source 8 -target 8 TeamFlowRecordApplicationJava8.java
java TeamFlowRecordApplicationJava8
```

预期输出：

```text
团队：team-7
标题：release
负责人数量：2
同一任务：true
记录：TeamFlowTaskSummaryJava8[teamId=team-7, title=release, owners=[alice, bob]]
```

两版都打印相同的业务事实；差异只在类型声明和 Java 8 可用的列表复制、空白检查写法。Java 8 代码不能把
`record`、`List.copyOf` 或 `String.isBlank` 直接粘贴进去，因此兼容版用 `Character.isWhitespace` 逐个检查
Unicode code point，保持“空字符串或全空白都拒绝”的同一合同。

### 4. 两版运行位置与核对顺序

1. 创建普通 Java 项目并确认源文件位于 source root；本课不需要 Maven 或第三方依赖。
2. JDK 25 版选择 Project SDK 25 和 language level 25，运行 `TeamFlowRecordApplication`；Java 8 版使用独立文件、
   SDK 8 和 language level 8。
3. 同时核对 IDEA 的 Project SDK、Module SDK、运行配置 JRE，以及终端中的 `java -version` 和 `javac -version`。
4. 先看团队、标题和负责人数量，再看 `同一任务：true`；最后观察 `toString` 是否包含全部组件。
5. 若两版输出不同，先确认是否运行了错误的 main 类或错误 JRE，再检查组件字段、列表复制和对象合同。

## 六、集中处理 record 的常见错误

### 六个典型错误

:::pitfalls
### 把 record 访问器写成 getXxx

**触发条件：** 从 JavaBean 或 Lombok 类迁移到 record 后，调用 `summary.getTitle()`。

**原因：** record 为每个组件生成与组件同名的访问器，例如 `title()`；它不会生成 `getTitle()` 或 setter。

**后果：** 编译器报告找不到方法；如果为了迁就旧调用强行增加 get 方法，还会混淆当前类型的公开合同。

**错误示例：**

```java
/** 展示 record 访问器名称的简化任务摘要。 */
record TaskSummary(String title) {}
TaskSummary summary = new TaskSummary("release");
// System.out.println(summary.getTitle());
```

**正确写法：**

```java
/** 展示 record 访问器名称的简化任务摘要。 */
record TaskSummary(String title) {}
TaskSummary summary = new TaskSummary("release");
System.out.println(summary.title());
```

**验证方式：** 用 JDK 25 编译两个片段，错误写法应因没有 `getTitle()` 失败，正确写法应输出 `release`；Java 8
兼容类则按它实际声明的访问器名称调用。

### 误以为 record 会深度冻结组件

**触发条件：** 把 `List<String>`、数组或可变对象直接放入 record，就认为外部不能改变其中内容。

**原因：** record 的 final 字段只锁定引用，不能锁定引用指向的对象；这就是浅不可变。

**后果：** 外部修改列表后，record 的 `equals`、`hashCode`、输出和业务观察结果都会变化。

**错误示例：**

```java
import java.util.ArrayList;
import java.util.List;

List<String> owners = new ArrayList<>();
owners.add("alice");
/** 保存列表引用的错误示例 record。 */
record Owners(List<String> value) {}
Owners snapshot = new Owners(owners);
owners.add("bob");
System.out.println(snapshot.value().size()); // 2
```

**正确写法：**

```java
import java.util.List;

/** 保存不可变列表快照的正确示例 record。 */
record Owners(List<String> value) {
    /** 复制列表组件。
     *
     * @param value 外部列表
     */
    public Owners {
        value = List.copyOf(value);
    }
}
```

**验证方式：** 先构造一个包含 `alice` 的列表，再在外部加入 `bob`；防御性复制版本仍应输出 `1`，并且对返回列表
调用 `add` 应被拒绝。组件元素若可变，仍需单独处理元素复制。

### 在 record 中添加普通实例字段或 extends

**触发条件：** 想给 record 增加一个未写在 header 中的实例字段，或写成 `record Task extends BaseTask(...)`。

**原因：** record 的实例状态必须由 header 透明描述，父类固定为 `java.lang.Record`，record 也隐式 final。

**后果：** 编译失败；即使需求需要额外生命周期状态，也不能通过隐藏字段绕过 record 的数据合同。

**错误示例：**

```java
/** 错误地给 record 增加 header 之外的实例状态。 */
record Task(String title) {
    private final int internalState = 0;
}
```

**正确写法：**

```java
record Task(String title) {
    static final int VERSION = 1;
}
```

**验证方式：** 直接用 JDK 25 编译错误示例，编译器应拒绝额外实例字段；再尝试把声明写成
`record Task(String title) extends BaseTask {}`，同样应被拒绝。正确示例中的静态字段不属于实例状态，可以保留。

### 在 compact constructor 中给组件字段赋值

**触发条件：** 看到 compact constructor 没有参数列表，就把它当成无参构造器，调用 `new Task()`；或者为了校验
参数，在构造器体内写 `this.title = title`。

**原因：** compact constructor 仍然隐式接收 header 中的全部参数，并不是无参构造器；组件字段由语言在构造器结束
时自动赋值，构造器体只能处理隐式参数，不能直接给组件字段赋值。

**后果：** 编译失败；如果需要显式字段赋值，应改写为带完整参数列表的 canonical constructor。

**错误示例：**

```java
/** 展示不能直接给 record 组件字段赋值的错误示例。 */
record Task(String title) {
    /** 错误地尝试给组件字段赋值。
     *
     * @param title 任务标题
     */
    public Task {
        this.title = title;
    }
}
```

**正确写法：**

```java
import java.util.Objects;

/** 保存任务标题的正确 record 示例。 */
record Task(String title) {
    /** 校验并规范化任务标题。
     *
     * @param title 原始标题
     */
    public Task {
        title = Objects.requireNonNull(title, "title").trim();
    }
}
```

**验证方式：** 用 JDK 25 编译错误版本应提示不能给 record component field 赋值；正确版本创建 `" release "` 后，
`title()` 应输出 `release`。另把调用改成 `new Task()`，编译器应提示实际参数列表与 header 不匹配。

### 只重写部分对象合同

**触发条件：** 自定义 `equals` 只比较 `teamId`，却保留自动或自写的 `hashCode` 对全部组件计算。

**原因：** record 的默认对象合同使用全部组件；自定义其中一个方法后，其他方法不会替你重新理解业务相等字段。

**后果：** `equals` 与 `hashCode` 可能不一致，哈希容器查找和去重行为不可靠。

**错误示例：**

```java
/** 展示 record 默认对象合同的任务值。 */
record Task(String teamId, String title) {
    /** 错误地只比较团队标识。
     *
     * @param obj 待比较对象
     * @return 只按团队标识比较的结果
     */
    @Override
    public boolean equals(Object obj) {
        return obj instanceof Task other && teamId.equals(other.teamId);
    }
}
```

**正确写法：**

```java
/** 保留全部组件自动对象合同的正确任务 record。 */
record Task(String teamId, String title) {
    // 如果全部组件定义值相等，保留 record 自动生成的 equals/hashCode。
}
```

**验证方式：** 创建相同 `teamId`、不同 `title` 的两个对象，检查是否真的应该相等；若不应该，删除部分重写。把
相等对象放入 `HashMap` 后用独立等值对象查询，必须得到同一条记录。

### 在 Java 8 项目中直接粘贴 record

**触发条件：** IDEA 项目或构建环境仍选择 Java 8，却把 `record Task(...) {}` 当成普通 class 编译；或者只把
Project SDK 改成 25，模块 language level 仍覆盖为 8。

**原因：** record 是 Java 16 正式交付的语言特性，Java 8 编译器不认识这种声明；IDEA 的 Project SDK 与 language
level 可以不同，模块也能覆盖项目级设置。Java 8 还没有 `List.copyOf`。

**后果：** 编译阶段失败，或者切换到 JDK 25 后运行的不是原本核对过的 Java 8 代码。

**错误示例：**

```java
public record Task(String title) {
}
```

**正确写法：**

```java
public final class Task {
    private final String title;

    /** 创建 Java 8 兼容任务。
     *
     * @param title 任务标题
     */
    public Task(String title) {
        this.title = title;
    }

    /** 返回任务标题。
     *
     * @return 任务标题
     */
    public String title() {
        return title;
    }

    /** 运行 Java 8 兼容访问器示例。
     *
     * @param args 命令行参数，本程序不使用
     */
    public static void main(String[] args) {
        Task task = new Task("release");
        System.out.println(task.title());
    }
}
```

**验证方式：** 在独立输出目录用 Java 8 `javac` 编译 record 片段，应被拒绝；再把正确代码保存为 `Task.java`，编译
并运行后应输出 `release`。IDEA 中同时查看 Project SDK、Project language level、Modules 下的 language level 与
运行配置 JRE；JDK 25 版本必须都允许 Java 25，Java 8 兼容版则保持 Java 8。
:::

## 七、练习：实现 TeamFlow 任务摘要 record

### 1. 独立完成任务

:::exercise
### 为任务摘要建立稳定的数据合同

**要求：** JDK 25 定义 `TaskSnapshot` record，包含 `teamId`、`title`、`labels` 三个组件；拒绝空引用和空白
团队/标题，在 compact constructor 中复制 `labels`。增加 `summary()` 方法返回 `teamId + " / " + title`，并
用 `TaskSnapshotExercise` 的 `main` 创建两个等值对象、打印摘要和标签数量。Java 8 使用 final class 完成同一
合同，不能使用 `record`、`List.copyOf` 或 `String.isBlank`。两版都应打印相等、摘要和标签数量三行；修改构造前
的原始标签列表后，已创建对象仍保持两个标签；空白标题应拒绝创建。

**验收：**

```text
相等：true
摘要：team-7 / release
标签数量：2
```
:::

### 2. JDK 25 参考实现

```java
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/** 运行 TaskSnapshot record 练习参考实现。 */
public final class TaskSnapshotExercise {
    /** 运行练习验收输出。
     *
     * @param args 命令行参数，本程序不使用
     */
    public static void main(String[] args) {
        List<String> labels = new ArrayList<>(List.of("backend", "ready"));
        TaskSnapshot first = new TaskSnapshot("team-7", "release", labels);
        labels.add("changed-outside");
        TaskSnapshot same = new TaskSnapshot("team-7", "release", List.of("backend", "ready"));

        System.out.println("相等：" + first.equals(same));
        System.out.println("摘要：" + first.summary());
        System.out.println("标签数量：" + first.labels().size());
    }
}

/** 保存经过校验的不可变任务快照。 */
record TaskSnapshot(String teamId, String title, List<String> labels) {
    /** 校验组件并复制标签列表。
     *
     * @param teamId 团队标识
     * @param title 任务标题
     * @param labels 标签列表
     */
    public TaskSnapshot {
        Objects.requireNonNull(teamId, "teamId");
        Objects.requireNonNull(title, "title");
        Objects.requireNonNull(labels, "labels");
        if (teamId.isBlank() || title.isBlank()) {
            throw new IllegalArgumentException("teamId 和 title 不能为空");
        }
        labels = List.copyOf(labels);
    }

    /** 返回任务摘要。
     *
     * @return 团队和标题组成的摘要
     */
    public String summary() {
        return teamId + " / " + title;
    }
}
```

### 3. Java 8 参考实现

```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/** 运行 Java 8 任务快照练习参考实现。 */
public final class TaskSnapshotExerciseJava8 {
    /** 运行练习验收输出。
     *
     * @param args 命令行参数，本程序不使用
     */
    public static void main(String[] args) {
        List<String> labels = new ArrayList<>(Arrays.asList("backend", "ready"));
        TaskSnapshotJava8 first = new TaskSnapshotJava8("team-7", "release", labels);
        labels.add("changed-outside");
        TaskSnapshotJava8 same = new TaskSnapshotJava8(
                "team-7",
                "release",
                Arrays.asList("backend", "ready")
        );

        System.out.println("相等：" + first.equals(same));
        System.out.println("摘要：" + first.summary());
        System.out.println("标签数量：" + first.labels().size());
    }
}

/** 使用 Java 8 语法保存任务快照。 */
final class TaskSnapshotJava8 {
    private final String teamId;
    private final String title;
    private final List<String> labels;

    /** 校验组件并复制标签列表。
     *
     * @param teamId 团队标识
     * @param title 任务标题
     * @param labels 标签列表
     */
    TaskSnapshotJava8(String teamId, String title, List<String> labels) {
        this.teamId = Objects.requireNonNull(teamId, "teamId");
        this.title = Objects.requireNonNull(title, "title");
        Objects.requireNonNull(labels, "labels");
        if (isBlank(teamId) || isBlank(title)) {
            throw new IllegalArgumentException("teamId 和 title 不能为空");
        }
        this.labels = Collections.unmodifiableList(new ArrayList<>(labels));
    }

    /** 判断文本是否为空或只包含 Java 空白字符。
     *
     * @param value 已完成非空校验的文本
     * @return 为空或只包含空白字符则为 true
     */
    private static boolean isBlank(String value) {
        if (value.isEmpty()) {
            return true;
        }
        for (int index = 0; index < value.length(); ) {
            int codePoint = value.codePointAt(index);
            if (!Character.isWhitespace(codePoint)) {
                return false;
            }
            index += Character.charCount(codePoint);
        }
        return true;
    }

    /** 返回团队标识。
     *
     * @return 团队标识
     */
    public String teamId() {
        return teamId;
    }

    /** 返回任务标题。
     *
     * @return 任务标题
     */
    public String title() {
        return title;
    }

    /** 返回不可修改的标签列表。
     *
     * @return 标签列表
     */
    public List<String> labels() {
        return labels;
    }

    /** 返回任务摘要。
     *
     * @return 团队和标题组成的摘要
     */
    public String summary() {
        return teamId + " / " + title;
    }

    /** 按所有组件判断值是否相等。
     *
     * @param obj 待比较对象
     * @return 组件都相等则为 true
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof TaskSnapshotJava8)) {
            return false;
        }
        TaskSnapshotJava8 other = (TaskSnapshotJava8) obj;
        return Objects.equals(teamId, other.teamId)
                && Objects.equals(title, other.title)
                && Objects.equals(labels, other.labels);
    }

    /** 根据所有组件计算哈希值。
     *
     * @return 组件哈希值
     */
    @Override
    public int hashCode() {
        return Objects.hash(teamId, title, labels);
    }
}
```

Java 8 版本的 `Arrays.asList`、`Collections.unmodifiableList` 和基于 `Character.isWhitespace` 的 `isBlank`
辅助方法分别替代现代版本的 `List.of`、`List.copyOf` 和 `String.isBlank`。业务输出与空白校验合同都与现代版
一致，差异只来自语言和标准库可用能力。

### 4. 练习验收说明

先观察 `first.equals(same)` 为 `true`，说明三个组件共同决定值相等；再观察摘要和标签数量。构造前的 `labels` 增加
第三个元素后，输出仍为 `2`，证明构造器复制了列表。若把复制删除，外部修改会让对象状态变化，正是本课第二个易错项。

## 八、回顾与边界

record 把“组件就是值的全部公开状态”写进了类型声明：访问器使用组件名，默认对象合同覆盖全部组件，canonical
constructor 负责把输入变成合法状态。compact constructor 适合校验和规范化，但不能直接给组件字段赋值。

Java 25 可以用 record 简洁表达 TeamFlow 的任务摘要；Java 8 没有这项语法，需要 final class、final 字段、构造器、
访问器和 equals/hashCode 重新写出同一合同。两版都能表达值对象，但 record 不会自动让 List 或数组的元素深度不可变。

本课没有讲 record 与 JSON 映射、数据库实体、集合遍历或通知策略。后续需要这些能力时，先保留这里定义的组件和
不可变边界，再在各自课程中连接具体框架或业务流程。
