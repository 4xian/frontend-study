# 类、对象、构造过程、封装与不可变性研究记录

## 冻结课程合同

- `courseId`：`backend.java.learn.basics.classes-objects-and-immutability`
- `title`：类、对象、构造过程、封装与不可变性
- `required`：必修
- `estimatedMinutes`：`90`
- `purpose / collection / level / depth`：`learn / basics / beginner / lesson`
- `batch`：B-07
- `prerequisites`：`[backend.java.learn.basics.arrays-and-varargs]`
- `唯一前置`：B-06；不得把 B-05、B-08 或其他课程追加为直接前置
- `related`：`[]`
- `modernBaseline`：`Java 25 LTS`
- `legacyBaseline`：`Java 8 legacy supplement only`
- `verifiedAt`：`2026-08-14`

本课固定为 7 个知识点：类与对象引用、字段与实例状态、`new` 与构造过程、`this`、封装与访问
控制、静态成员与实例成员边界、不可变对象入门合同。只使用 B-06 已学数组演示可变成员的复制，
不引入尚未学习的集合或泛型。

接口、继承、抽象类型和多态属于 B-08，不得进入本课；同样不进入 record 深入、枚举、注解、异常
体系、泛型、集合、并发、反射、序列化、Spring 或其他框架。构造失败只用编译期负向案例验证，
不在本课提前讲异常处理。

## 核验基线

| 项目 | 核验结果 |
| --- | --- |
| 核验日期 | 2026-08-14 |
| 现代主线 | Java 25 LTS；OpenJDK JDK 25 已于 2025-09-16 GA |
| legacy 补充 | Java 8；不引入框架 API |
| 发现方式 | Tavily 搜索官方域名，只把结果作为直接页面入口 |
| 正文核验 | Tavily Extract 回到 OpenJDK、Oracle JLS 和 Dev.java 官方页面正文 |
| 最终证据 | 只采用 OpenJDK、Oracle JLS 与 Dev.java 一手来源 |
| 验证环境 | 固定 Eclipse Temurin 25.0.3+9 与 8u492-b09 Docker 镜像 |

Tavily 结果中出现的社区文章、视频和搜索摘要均未进入来源卡。Java 25 结论以 JLS 25 为规范依据，
Dev.java 只负责现代入门表述；Java 8 兼容边界逐项回查 JLS 8。

## 官方来源卡

以下 18 张来源卡均在本批次重新核验。每张卡只绑定实际使用的直接页面和页内范围；`sourceType`
使用后端来源规范允许的值。

| ID | 直接来源 | `sourceType` | 适用版本 | 支持结论 |
| --- | --- | --- | --- | --- |
| `openjdk-jdk-25` | [OpenJDK JDK 25](https://openjdk.org/projects/jdk/25/) | `release-note` | JDK 25 | Java SE 25 参考实现与 GA 日期 |
| `oracle-java-roadmap` | [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) | `official-reference` | 2026-08-14 页面状态 | Java 25 为 LTS |
| `dev-creating-classes` | [Creating Classes](https://dev.java/learn/classes-objects/creating-classes/) | `official-reference` | 当前 Dev.java | 类体、字段、方法和访问修饰符的入门术语 |
| `dev-defining-constructors` | [Providing Constructors](https://dev.java/learn/classes-objects/defining-constructors/) | `official-reference` | 当前 Dev.java | 构造器、默认构造器和构造器访问控制 |
| `dev-creating-objects` | [Creating and Using Objects](https://dev.java/learn/classes-objects/creating-objects/) | `official-reference` | 当前 Dev.java | 声明引用、`new` 创建对象、构造器初始化与返回引用 |
| `dev-more-on-classes` | [More on Classes](https://dev.java/learn/classes-objects/more-on-classes/) | `official-reference` | 当前 Dev.java / JDK 25 | `this`、访问级别、类成员与实例成员边界 |
| `jls25-types-values` | [JLS 25 Chapter 4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html) | `specification` | Java 25 | 对象、引用、实例变量、类变量、默认值与 `final` 引用 |
| `jls25-access` | [JLS 25 6.6](https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.6) | `specification` | Java 25 | 成员和构造器的访问控制 |
| `jls25-classes` | [JLS 25 Chapter 8](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html) | `specification` | Java 25 | 类成员、字段、静态上下文、构造器与默认构造器 |
| `jls25-arrays` | [JLS 25 10.7](https://docs.oracle.com/javase/specs/jls/se25/html/jls-10.html#jls-10.7) | `specification` | Java 25 | 数组对象的 `clone` 方法与复制结果 |
| `jls25-instance-creation` | [JLS 25 12.5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html#jls-12.5) | `specification` | Java 25 | 对象分配、字段默认值和实例初始化顺序 |
| `jls25-expressions` | [JLS 25 15.8.3、15.9](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.8.3) | `specification` | Java 25 | `this` 表达式与类实例创建表达式 |
| `jls8-types-values` | [JLS 8 Chapter 4](https://docs.oracle.com/javase/specs/jls/se8/html/jls-4.html) | `specification` | Java 8 | 对象、引用、字段与 `final` 的 legacy 合同 |
| `jls8-access` | [JLS 8 6.6](https://docs.oracle.com/javase/specs/jls/se8/html/jls-6.html#jls-6.6) | `specification` | Java 8 | 成员和构造器访问控制的 legacy 合同 |
| `jls8-classes` | [JLS 8 Chapter 8](https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html) | `specification` | Java 8 | 类成员、字段、构造器与默认构造器的 legacy 合同 |
| `jls8-arrays` | [JLS 8 10.7](https://docs.oracle.com/javase/specs/jls/se8/html/jls-10.html#jls-10.7) | `specification` | Java 8 | 数组复制示例共用的 `clone` 合同 |
| `jls8-instance-creation` | [JLS 8 12.5](https://docs.oracle.com/javase/specs/jls/se8/html/jls-12.html#jls-12.5) | `specification` | Java 8 | 对象分配、默认值和实例初始化的 legacy 合同 |
| `jls8-expressions` | [JLS 8 15.8.3、15.9](https://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html#jls-15.8.3) | `specification` | Java 8 | `this`、`new` 与构造器调用的 legacy 合同 |

## 结论与直接证据

| 结论 | 直接来源 | 验证设计 |
| --- | --- | --- |
| 类声明一种引用类型；对象是类实例或数组，引用可以指向对象 | `jls25-types-values`、`dev-creating-classes`、`dev-creating-objects` | 创建两个对象和一个别名，分别检查引用身份与实例状态 |
| 非 `static` 字段每个实例各有一份，字段在对象创建时先取得默认值 | `jls25-types-values`、`jls25-instance-creation` | 两个实例分别改变状态；构造器读取未显式初始化的 `int` 字段 |
| `new` 创建新实例、求值实参、调用选定构造器并返回引用 | `jls25-expressions`、`jls25-instance-creation` | 用构造器打印字段初始化和参数赋值后的状态 |
| 只有类未声明任何构造器时才隐式声明默认构造器 | `jls25-classes`、`jls8-classes` | 声明带参构造器后调用无参构造器，两个版本均编译失败 |
| `this` 表示当前对象，可消除字段与参数同名歧义；静态上下文没有 `this` | `jls25-expressions`、`jls25-classes`、`dev-more-on-classes` | 正向运行 `this.code = code`；静态方法中的 `this` 编译失败 |
| 访问控制在编译期限制成员使用；`private` 可收口外部状态修改入口 | `jls25-access`、`dev-more-on-classes` | 不相关外部顶层类直接读取私有字段时编译失败 |
| `static` 字段属于类级共享状态，实例字段随每个对象分别存在 | `jls25-types-values`、`jls25-classes`、`dev-more-on-classes` | 两个实例共享创建计数，同时保持各自编号 |
| `final` 引用不能再次赋值，但所指可变对象仍可能改变 | `jls25-types-values`、`jls8-types-values` | `final String[]` 仍可改元素；再用入参和出参复制隔离内部数组 |
| 本课共同子集在 Java 25 与 Java 8 一致，Java 25 构造器 prologue 是隔离的版本差异 | `jls25-classes`、`jls8-classes`、`dev-more-on-classes` | 共用源码双版本运行；prologue 仅在 Java 25 成功、Java 8 拒绝 |

## 逐知识点七段教学合同

后续正文必须完整实现以下 7 点。每点都冻结“它是什么、有什么作用、什么时候使用、怎么使用、
最小示例、运行结果、常见误区”七段，不得合并成概念清单。

### 知识点 1：类、对象与引用

**它是什么：** 类声明一种引用类型，并在类体中描述字段、构造器和方法；对象是运行时创建的类实例。
变量保存的是对象引用，不是把整个对象内容装进变量。两个变量可以引用同一个对象。

**有什么作用：** 类把一类数据和对这些数据的操作放在明确边界中；对象则承载某一次实际运行状态。
引用模型解释了为什么别名能观察到同一个对象的变化。

**什么时候使用：** 需要把“数据是什么”和“能对数据做什么”组合成一种可创建的程序类型时使用类；
需要一份具体状态时创建对象。本课不讨论类层级或多态。

**怎么使用：**

1. 用 `class` 声明类型，并把字段和方法写在类体内。
2. 用 `new 类型名(...)` 创建对象，把返回的引用赋给相同类型的变量。
3. 把引用赋给第二个变量，确认两个变量仍指向同一个对象，而不是自动复制对象。

**最小示例：**

```java
public final class ObjectReferenceExample {
    private String label;

    /**
     * 创建带初始标签的对象。
     */
    public ObjectReferenceExample(String label) {
        this.label = label;
    }

    /**
     * 修改当前对象的标签。
     */
    public void rename(String label) {
        this.label = label;
    }

    /**
     * 返回当前标签。
     */
    public String label() {
        return label;
    }

    /**
     * 展示两个变量引用同一个对象。
     */
    public static void main(String[] args) {
        ObjectReferenceExample first = new ObjectReferenceExample("draft");
        ObjectReferenceExample alias = first;
        alias.rename("ready");
        System.out.println(first.label() + ":" + (first == alias));
    }
}
```

**运行结果：** 输出 `ready:true`。`alias` 没有创建副本，它与 `first` 保存同一个对象的引用。

**常见误区：** 把引用赋值理解成对象复制，或把类本身理解成已经存在的一份对象状态。类是类型声明，
`new` 才创建具体对象；复制引用仍会共享同一对象。

### 知识点 2：字段、默认值与实例状态

**它是什么：** 字段是在类中声明的变量。没有 `static` 的字段是实例字段，每个新对象都有独立的一份；
对象分配后，字段会先取得语言规定的默认值，再执行显式初始化和构造器逻辑。

**有什么作用：** 实例字段保存单个对象自己的状态。默认初始化保证字段在构造期间已有确定的语言值，
但这些默认值不等于业务上一定有效。

**什么时候使用：** 某个值必须随对象分别保存时使用实例字段，例如每张任务卡自己的标题和完成数量。
临时计算仍使用局部变量，不要无条件提升成字段。

**怎么使用：**

1. 在类体内声明没有 `static` 的字段。
2. 在构造器中为业务必需字段赋入参数值。
3. 创建两个实例并分别修改，确认一个实例的字段变化不会改动另一个实例。

**最小示例：**

```java
public final class InstanceStateExample {
    private int completed;

    /**
     * 将当前对象的完成数量增加一。
     */
    public void completeOne() {
        completed++;
    }

    /**
     * 返回当前对象的完成数量。
     */
    public int completed() {
        return completed;
    }

    /**
     * 展示字段默认值和实例状态隔离。
     */
    public static void main(String[] args) {
        InstanceStateExample first = new InstanceStateExample();
        InstanceStateExample second = new InstanceStateExample();
        first.completeOne();
        System.out.println(first.completed() + ":" + second.completed());
    }
}
```

**运行结果：** 输出 `1:0`。两个 `completed` 字段最初都取得默认值 `0`，只修改 `first` 不会改变
`second`。

**常见误区：** 把字段默认值当成业务默认值，或误以为同一类的所有对象自动共享实例字段。业务有效
状态应由构造器和公开操作建立；真正共享的类字段必须显式使用 `static`。

### 知识点 3：`new`、构造器与构造过程

**它是什么：** `new Type(arguments)` 是类实例创建表达式；它创建新实例并调用匹配的构造器。构造器
名称与类名相同且没有返回类型，用于让新对象在返回给调用方前建立初始状态。

**有什么作用：** 构造器把“创建对象”和“提供必需初始值”绑定在一起，避免调用方拿到尚未完成基本
初始化的对象。

**什么时候使用：** 每次需要新实例时使用 `new`；对象创建时必须提供的状态写入构造器参数。只有类
完全没有声明构造器时，编译器才可能隐式提供默认无参构造器。

**怎么使用：**

1. 声明与类同名、没有返回类型的构造器，并列出必需参数。
2. 在构造器中把参数写入实例字段；需要另一条同类构造路径时可用 `this(...)` 委托。
3. 用参数匹配的 `new` 表达式创建对象，并通过公开方法观察构造后的状态。

**最小示例：**

```java
public final class ConstructionExample {
    private String code = "field-initializer";
    private int quantity;

    /**
     * 使用默认业务编号委托给主构造器。
     */
    public ConstructionExample() {
        this("A-1");
    }

    /**
     * 使用指定编号建立完整初始状态。
     */
    public ConstructionExample(String code) {
        System.out.println(this.code + ":" + quantity);
        this.code = code;
    }

    /**
     * 返回构造后的编号。
     */
    public String code() {
        return code;
    }

    /**
     * 展示字段初始化器、默认值和构造器赋值。
     */
    public static void main(String[] args) {
        ConstructionExample value = new ConstructionExample();
        System.out.println(value.code());
    }
}
```

**运行结果：** 先输出 `field-initializer:0`，再输出 `A-1`。对象空间分配后字段先取得默认值，字段
初始化器随后生效，主构造器最终把参数写入 `code`。

**常见误区：** 给构造器写返回类型而把它变成普通方法；或在已经声明带参构造器后仍假设无参构造器
会自动存在。调用不存在的 `new Type()` 会在编译期失败。

### 知识点 4：`this` 表示当前对象

**它是什么：** `this` 是对当前对象的引用，可出现在实例方法和构造器中。`this.field` 明确选择当前
对象的字段，`this(...)` 则调用同一类的另一个构造器，两者语法作用不同。

**有什么作用：** 当构造器参数和字段同名时，`this.code = code` 清楚地区分左侧实例字段与右侧参数；
构造器委托还能把共同初始化集中到一条路径。

**什么时候使用：** 字段与参数同名、需要把当前对象交给另一个操作，或同类构造器需要委托时使用。
静态方法不对应某个当前对象，因此不能使用 `this`。

**怎么使用：**

1. 在实例方法或构造器内写 `this.字段名` 选择当前对象字段。
2. 右侧继续使用参数名，完成 `this.code = code` 这样的明确赋值。
3. 在静态方法中改用具体对象引用访问实例成员，不写 `this`。

**最小示例：**

```java
public final class ThisExample {
    private final String code;

    /**
     * 使用 this 区分字段和同名参数。
     */
    public ThisExample(String code) {
        this.code = code;
    }

    /**
     * 返回当前对象的编号。
     */
    public String code() {
        return this.code;
    }

    /**
     * 展示 this 指向当前对象。
     */
    public static void main(String[] args) {
        ThisExample value = new ThisExample("B-07");
        System.out.println(value.code());
    }
}
```

**运行结果：** 输出 `B-07`。构造器左侧的 `this.code` 是对象字段，右侧 `code` 是传入参数。

**常见误区：** 写成 `code = code` 并以为字段已经赋值；该语句只把参数赋给自身。另一个错误是在
`static` 方法中写 `this.code`，静态上下文不存在当前对象，源码无法编译。

### 知识点 5：封装与访问控制

**它是什么：** 访问控制决定某段代码能否使用类、字段、方法或构造器。`private` 成员只对允许的本类
边界开放；无修饰符提供包访问，`protected` 和 `public` 逐步扩大访问范围。封装是把状态与维护规则
收进类的公开操作，访问修饰符只是实现手段。

**有什么作用：** 私有字段阻止不相关外部类绕过类的操作直接写状态，使类能够集中维护自己的不变量。
公开方法则形成调用方可依赖的最小接口。

**什么时候使用：** 实例状态不应由任意调用方直接改写时使用 `private`；确实需要跨类调用的稳定操作
才公开。本课只教授 `private`、包访问和 `public` 的直接边界；`protected` 的跨包子类分支留给 B-08。

**怎么使用：**

1. 先把对象内部状态声明为 `private`。
2. 只为合法读取或合法状态变化提供窄的公开方法。
3. 用不相关外部类直接访问私有字段做负向编译，确认修改入口已被收口。

**最小示例：**

```java
public final class EncapsulationExample {
    private int credits;

    /**
     * 通过受控操作增加一个积分。
     */
    public void addCredit() {
        credits++;
    }

    /**
     * 返回当前积分。
     */
    public int credits() {
        return credits;
    }

    /**
     * 只通过公开操作访问私有状态。
     */
    public static void main(String[] args) {
        EncapsulationExample value = new EncapsulationExample();
        value.addCredit();
        System.out.println(value.credits());
    }
}
```

**运行结果：** 输出 `1`。调用方只能经 `addCredit()` 改变 `credits`，不能在不相关外部类中直接读写
私有字段。

**常见误区：** 认为“字段私有，再为每个字段生成任意 setter”就自动完成封装。封装的重点是公开
业务允许的操作，而不是机械暴露所有写入口；同一顶层声明内的嵌套类还有规范允许的私有访问例外，
因此负向案例使用不相关顶层类。

### 知识点 6：静态成员与实例成员边界

**它是什么：** 带 `static` 的字段是类变量，属于类级状态；不带 `static` 的字段是实例变量，每个对象
各有一份。静态方法没有特定当前对象，只能直接使用静态成员。

**有什么作用：** 这个边界区分“所有对象共享的类级信息”和“单个对象自己的状态”，也解释了为什么
静态方法不能直接读取某一个对象的实例字段。

**什么时候使用：** 真正属于整个类且允许共享的计数或常量使用静态成员；编号、名称、余额等对象
自己的状态使用实例成员。不要为省去 `new` 就把业务状态改成 `static`。

**怎么使用：**

1. 把每个对象独立的字段保留为实例字段。
2. 只有明确共享语义的字段才声明为 `static`，并通过类名表达类级访问。
3. 静态方法若要读取实例状态，必须先接收或创建一个具体对象引用。

**最小示例：**

```java
public final class StaticInstanceExample {
    private static int createdCount;
    private final int number;

    /**
     * 为当前实例分配独立编号并更新共享计数。
     */
    public StaticInstanceExample() {
        createdCount++;
        this.number = createdCount;
    }

    /**
     * 返回当前实例的编号。
     */
    public int number() {
        return number;
    }

    /**
     * 返回类级共享的创建数量。
     */
    public static int createdCount() {
        return createdCount;
    }

    /**
     * 展示实例字段与类字段的不同归属。
     */
    public static void main(String[] args) {
        StaticInstanceExample first = new StaticInstanceExample();
        StaticInstanceExample second = new StaticInstanceExample();
        System.out.println(first.number() + ":" + second.number() + ":" + createdCount());
    }
}
```

**运行结果：** 输出 `1:2:2`。两个对象各自保存编号 `1` 和 `2`，类级 `createdCount` 被两次构造共享。

**常见误区：** 在静态方法中直接写实例字段或 `this`，或者把每个用户各自的数据放进静态字段。前者
编译失败，后者会让所有实例意外共享同一份状态。

### 知识点 7：不可变对象的入门合同

**它是什么：** 本课把“对象构造完成后，通过它公开的操作无法改变可观察状态”作为不可变对象的入门
合同。最小做法是私有 `final` 字段、构造器一次建立状态、不提供修改方法，并隔离可变数组的别名。

**有什么作用：** 调用方拿到对象后不能绕过类的接口改写内部状态，读取同一对象时更容易推理结果。
这不是并发安全或深不可变的完整证明。

**什么时候使用：** 值创建后只读取、不需要逐步修改时使用，例如一次生成的配置快照或任务摘要。
确实需要生命周期内变化的实体继续使用受控可变对象，不为追求标签而强行不可变。

**怎么使用：**

1. 把组成状态的字段设为 `private final`，并在构造器中完成一次赋值。
2. 对 B-06 已学的可变数组，在构造入口保存副本，不保存调用方原数组。
3. 返回数组时再次返回副本，且不提供修改内部字段的方法。

**最小示例：**

```java
public final class ImmutableSnapshotExample {
    private final String code;
    private final String[] labels;

    /**
     * 创建快照并复制调用方提供的标签数组。
     */
    public ImmutableSnapshotExample(String code, String[] labels) {
        this.code = code;
        this.labels = labels.clone();
    }

    /**
     * 返回快照编号。
     */
    public String code() {
        return code;
    }

    /**
     * 返回标签数组副本，避免暴露内部数组。
     */
    public String[] labels() {
        return labels.clone();
    }

    /**
     * 验证入参和出参别名都不能改写快照。
     */
    public static void main(String[] args) {
        String[] source = {"stable"};
        ImmutableSnapshotExample snapshot = new ImmutableSnapshotExample("A-1", source);
        source[0] = "input-changed";
        String[] returned = snapshot.labels();
        returned[0] = "output-changed";
        System.out.println(snapshot.code() + ":" + snapshot.labels()[0]);
    }
}
```

**运行结果：** 输出 `A-1:stable`。构造器和读取方法都返回独立数组，调用方修改输入或返回值都不会
改变快照内部数组。

**常见误区：** 认为字段加 `final` 就冻结了引用对象。`final String[]` 只能阻止字段再次指向另一数组，
不能阻止修改原数组元素；本例复制的是数组结构，若元素本身可变还需要额外设计，本课不展开对象图
深复制。

## 从零跟着做冻结合同

后续正文必须使用下面 7 个真实 Markdown 有序列表项。每一步都承接上一项，并以可观察结果结束：

1. 在 `/tmp` 的 `mktemp` 目录创建 `ClassesObjectsFeedback.java`，先声明一个普通快照类和传统
   `main(String[] args)` 入口，确认类声明本身与对象实例不是同一件事。
2. 为快照类增加私有实例字段，创建两个对象并分别打印编号，确认每个对象各自拥有实例状态。
3. 增加带参构造器，用 `new` 传入两个不同编号；再观察字段默认值、字段初始化器和构造器主体的顺序。
4. 把构造器参数改成与字段同名，并使用 `this.code = code`；删除 `this.` 做一次对照后恢复正确赋值。
5. 保持字段 `private`，只通过公开读取方法访问；用不相关顶层类直接读取私有字段，确认负向编译后
   恢复为公开方法调用。
6. 增加类级 `static createdCount` 和实例级 `number`，创建两个对象后观察独立编号与共享计数；再用
   静态方法中的 `this` 触发编译失败并恢复。
7. 把数组字段设为 `private final`，在构造入口和读取出口分别复制；运行输入、输出别名修改与 blank
   `final`、缺失无参构造器负向案例，最后恢复正确源码并在 Java 25/8 重跑一致输出。

## Java 25 与 Java 8 边界

| 对比项 | Java 25 现代线 | Java 8 legacy 线 | 课程处理 |
| --- | --- | --- | --- |
| 类、对象、引用和实例字段 | 本课合同适用 | 合同一致 | 同一兼容源码双版本运行 |
| `new`、构造器和默认构造器 | 本课合同适用 | 共同子集一致 | 正向运行与缺失无参构造器负向编译 |
| `this` 与静态上下文 | 实例上下文可用；静态上下文禁用 | 合同一致 | 同一正负向源码双版本验证 |
| 访问控制 | `private`、包访问、`protected`、`public` | 本课用到的边界一致 | 只展开 `private`、包访问、`public`；B-08 再讲继承分支 |
| `static` 与实例成员 | 静态成员属类，实例成员随对象 | 合同一致 | 两个实例观察共享计数和独立编号 |
| `final` 引用 | 不能重赋，但引用对象仍可能变 | 合同一致 | 使用 B-06 数组展示别名风险 |
| 数组入参和出参复制 | `clone()` 产生独立数组对象 | 合同一致 | 不引入集合或泛型 |
| 构造器显式调用前语句 | Java 25 允许受限 prologue | Java 8 要求 `this(...)` 为构造器主体第一条语句 | 单独版本反馈，不展开继承 |

Java 25 的 flexible constructor bodies 只作为构造过程的版本边界：本课用 `this(...)` 而不是
`super(...)` 验证，避免进入 B-08 的继承内容。共同教学主示例保持 Java 8 可编译。

## 易错点取证

| 现象 | 触发条件 | 原因 | 后果 | 错误示例 | 正确写法 | 影响版本 | 验证方式 | 来源 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 引用赋值被误认为对象复制 | `alias = original` 后经别名修改对象 | 赋值复制引用值，两个变量仍指向同一对象 | 一处修改会被另一变量观察到 | 期待 `alias` 自动独立 | 需要共享时明确使用别名；需要副本时显式创建 | Java 8、Java 25 | 正向输出包含 `same=true` 且能观察同一状态 | JLS 25/8 4.3.1 |
| 把字段默认值当成有效业务状态 | 构造器不建立必需状态 | 默认初始化只满足语言规则 | 对象创建后仍缺少业务需要的值 | 依赖引用字段默认 `null` | 构造器接收并写入必需值 | Java 8、Java 25 | 正向对象创建后立即读取指定值 | JLS 25/8 4.12.5、12.5 |
| 声明带参构造器后仍调用隐式无参构造器 | 类已有任意构造器声明，却写 `new Type()` | 默认构造器只在类没有构造器声明时产生 | 编译失败 | 只有 `Type(String)` 却调用 `new Type()` | 调用现有构造器，或确有合同需要时显式声明无参构造器 | Java 8、Java 25 | 两版本 `javac` 均要求非零 | JLS 25/8 8.8.9 |
| `code = code` 没有初始化字段 | 参数遮蔽同名字段 | 两侧简单名都选择局部参数 | 字段保持原值 | `code = code` | `this.code = code` | Java 8、Java 25 | 正向输出必须包含传入编号 | JLS 25/8 6.4.1、15.8.3 |
| 不相关外部类直接访问私有字段 | 调用方写 `value.credits` | `private` 访问控制拒绝该位置 | 编译失败，封装入口被证明生效 | `System.out.println(value.credits)` | 调用公开读取方法 | Java 8、Java 25 | 两版本 `javac` 均要求非零 | JLS 25/8 6.6.1 |
| 静态方法直接使用 `this` 或实例字段 | 静态上下文没有具体当前对象 | `this` 和无限定实例成员在静态上下文受限 | 编译失败 | `static int read() { return this.number; }` | 接收具体对象引用后访问实例方法 | Java 8、Java 25 | 两版本 `javac` 均要求非零 | JLS 25/8 8.4.3.2、15.8.3 |
| `final` 引用被误写成不可变对象 | 字段保存并返回调用方可变数组 | `final` 只限制字段再次赋值，不冻结数组元素 | 调用方可通过别名改写内部状态 | 直接保存并返回 `String[]` | 构造入口和读取出口都返回数组副本 | Java 8、Java 25 | 修改输入和返回数组后仍输出 `stable` | JLS 25/8 4.12.4、10.7 |
| blank `final` 字段漏赋值 | 构造器正常结束却未初始化字段 | blank `final` 实例字段受确定赋值规则约束 | 编译失败 | 构造器不写 `this.code` | 每条构造路径恰好赋值一次 | Java 8、Java 25 | 两版本 `javac` 均要求非零 | JLS 25/8 8.3.1.2、16 |

## 可重复验证设计

验证固定使用以下镜像，不把浮动 tag 当作最终复跑身份：

| 角色 | 固定镜像 | 实际工具版本 |
| --- | --- | --- |
| modern | `eclipse-temurin:25-jdk@sha256:12e44624adee6808a36d962717e1656e0afeeeff5a100f9cb00e0136513558f0` | `javac 25.0.3` |
| legacy | `eclipse-temurin:8-jdk@sha256:c8b86f2c0a9bd6cc1b7fabc5d1a097501a166eea7cad3b2764e90e96178bea9b` | `javac 1.8.0_492` |

所有源码只放在 `/tmp/b07-classes-objects.*` 的 `mktemp` 目录；验证结束用 `find -depth -delete`
清理。诊断全文不是稳定合同，只断言 `javac` 成功或失败、正向标准输出和必要错误类别。

### 反馈标记合同

| 标记 | 通过条件 |
| --- | --- |
| `B07_JAVA25_VERSION_PASS` | 固定 modern 镜像报告 `javac 25.0.3` |
| `B07_JAVA8_VERSION_PASS` | 固定 legacy 镜像报告 `javac 1.8.0_492` |
| `B07_SHARED_JAVA25_PASS` | 共用源码在 Java 25 输出精确正向结果 |
| `B07_SHARED_JAVA8_PASS` | 同一共用源码在 Java 8 输出相同结果 |
| `B07_PRIVATE_ACCESS_REJECTED_JAVA25` | 不相关顶层类访问私有字段时 Java 25 编译非零 |
| `B07_PRIVATE_ACCESS_REJECTED_JAVA8` | 同一私有访问源码在 Java 8 编译非零 |
| `B07_STATIC_BOUNDARY_REJECTED_JAVA25` | 静态方法使用 `this` 时 Java 25 编译非零 |
| `B07_STATIC_BOUNDARY_REJECTED_JAVA8` | 同一静态边界源码在 Java 8 编译非零 |
| `B07_FINAL_FIELD_REJECTED_JAVA25` | blank `final` 漏赋值时 Java 25 编译非零 |
| `B07_FINAL_FIELD_REJECTED_JAVA8` | 同一 blank `final` 源码在 Java 8 编译非零 |
| `B07_MISSING_CONSTRUCTOR_REJECTED_JAVA25` | 缺失无参构造器时 Java 25 编译非零 |
| `B07_MISSING_CONSTRUCTOR_REJECTED_JAVA8` | 同一构造器源码在 Java 8 编译非零 |
| `B07_PROLOGUE_JAVA25_PASS` | Java 25 允许局部值准备后再调用 `this(...)`，输出 `prologue-ok` |
| `B07_PROLOGUE_JAVA8_REJECTED` | 同一 prologue 源码在 Java 8 编译非零 |
| `B07_EARLY_THIS_REJECTED_JAVA25` | Java 25 prologue 过早使用当前对象时编译非零 |
| `B07_TMP_CLEAN_PASS` | 反馈目录完成后不存在 |

共用正向源码必须精确输出：

```text
B07_POSITIVE|first=A-1:stable|second=B-2:ready|created=2|same=true|isolated=true
```

该输出一次覆盖：两个对象的独立实例字段、引用别名、带参构造器与 `this`、私有状态的公开读取、
类级静态计数，以及数组构造入口和读取出口复制。

### 本批实际反馈证据

本批于 2026-08-14 在 `/tmp/b07-classes-objects.c3p0mC` 实际创建 9 份临时 Java 源码并执行固定镜像
反馈环；以下结果来自真实命令，不是预期值：

| 标记 | 实际证据 |
| --- | --- |
| `B07_JAVA25_VERSION_PASS` | `javac 25.0.3`，退出码 0 |
| `B07_JAVA8_VERSION_PASS` | `javac 1.8.0_492`，退出码 0 |
| `B07_SHARED_JAVA25_PASS` | 精确输出 `B07_POSITIVE|first=A-1:stable|second=B-2:ready|created=2|same=true|isolated=true` |
| `B07_SHARED_JAVA8_PASS` | 与 Java 25 精确输出一致 |
| `B07_PRIVATE_ACCESS_REJECTED_JAVA25` | 退出码 1；错误类别为私有字段不可访问 |
| `B07_PRIVATE_ACCESS_REJECTED_JAVA8` | 退出码 1；错误类别与 Java 25 一致 |
| `B07_STATIC_BOUNDARY_REJECTED_JAVA25` | 退出码 1；静态上下文不能引用 `this` |
| `B07_STATIC_BOUNDARY_REJECTED_JAVA8` | 退出码 1；错误类别与 Java 25 一致 |
| `B07_FINAL_FIELD_REJECTED_JAVA25` | 退出码 1；blank `final` 字段可能未初始化 |
| `B07_FINAL_FIELD_REJECTED_JAVA8` | 退出码 1；错误类别与 Java 25 一致 |
| `B07_MISSING_CONSTRUCTOR_REJECTED_JAVA25` | 退出码 1；带参构造器不适用于无参调用 |
| `B07_MISSING_CONSTRUCTOR_REJECTED_JAVA8` | 退出码 1；错误类别与 Java 25 一致 |
| `B07_PROLOGUE_JAVA25_PASS` | 编译与运行退出码均为 0；精确输出 `prologue-ok` |
| `B07_PROLOGUE_JAVA8_REJECTED` | 退出码 1；`this(...)` 在 Java 8 必须是构造器第一条语句 |
| `B07_EARLY_THIS_REJECTED_JAVA25` | 退出码 1；构造器链完成前不能引用当前 `this` |
| `B07_TMP_CLEAN_PASS` | `find -depth -delete` 后精确路径不存在 |

验证没有锁定完整英文诊断文本，只核对退出码与对应错误类别。仓库内未创建测试、fixture、class 或
浏览器产物。

## 被排除或尚未证实的说法

- 不讲接口、继承、抽象类、重写、动态分派或向上/向下转型；这些属于 B-08。
- 不讲 record 的声明、生成成员、相等性或迁移，只保留“本课不进入 record 深入”的边界。
- 不讲泛型、集合或 `List.copyOf`；不可变入门复用 B-06 数组完成别名隔离。
- 不讲异常层级、抛出、捕获或 cause 链；运行时校验留给 B-10。
- 不讲反射、序列化、ORM 实体、Spring Bean、代理或框架构造规则。
- 不把 `final` 字段、`final class` 或数组浅复制单独等同于完整深不可变。
- 不把不可变对象等同于线程安全，不提出未经并发验证的安全结论。
- 不记录性能结论，不讨论对象头、内存布局、逃逸分析、GC 或类加载优化。

## 发布自检

- [x] 冻结必修、90 分钟、稳定 ID 与唯一 B-06 前置。
- [x] Java 25 主线在前，Java 8 仅作 legacy 对照。
- [x] Tavily 只用于发现与官方正文提取，最终结论只绑定一手来源。
- [x] 18 张来源卡逐项记录直接页面、来源类型、适用版本和支持结论。
- [x] 7 个知识点均冻结七段教学合同和可编译最小示例。
- [x] “从零跟着做”固定为 7 个真实有序步骤。
- [x] 易错点包含现象、触发、原因、后果、错误与正确写法、版本、验证和来源。
- [x] 反馈合同同时覆盖 Java 25/8 正向、访问控制、静态边界、构造器和不可变性负向案例。
- [x] B-08、record 深入、泛型、异常、集合和框架均保持范围外。
- [x] 16 个 Java 25/8 反馈标记全部通过，且 `/tmp` 已清理。

## Stop Boundary

本文件只冻结 B-07 研究与反馈证据。在研究子任务交回主流程并通过验收前，研究执行者不得修改 B-07
课程正文、track、loader 或 signoff；研究结果通过验收后，主流程才可继续同一 B-07 批次的正文与 Gate。
整个 B-07 批次仍不得读取或修改 B-08 正文、Phase A 冻结文件或其他路径，也不得暂存、提交、推送、
stash、reset 或清理其他工作。
