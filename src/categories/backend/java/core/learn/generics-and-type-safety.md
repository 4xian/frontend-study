---
id: backend.java.learn.basics.generics-and-type-safety
type: lesson
title: 泛型
summary: 用类型参数建立可复用的编译期合同，并准确处理边界、通配符与 raw type 风险
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 105
prerequisites:
  - backend.java.learn.basics.task-notification-strategy
objectives:
  - 能区分类型参数、类型实参与参数化类型，并声明简单的泛型类。
  - 能声明泛型方法，理解方法类型参数与类类型参数的作用范围。
  - 能用上界限制类型实参，并调用上界提供的方法。
  - 能解释参数化类型不变性，并根据读写方向选择 extends 或 super 通配符。
  - 能识别 raw type、unchecked warning 和常见擦除限制，不用强制转换伪造类型安全。
  - 能在 JDK 25 和 Java 8 中运行同一份 TeamFlow 泛型程序。
recap:
  - 类型参数把会变化的类型写进类或方法的合同，类型实参在使用时确定具体类型。
  - 泛型类在类名后声明类型参数；泛型方法在返回类型前声明自己的类型参数。
  - 上界让类型参数只能接收指定父类型及其子类型，并允许方法体使用上界合同。
  - 参数化类型默认不变，类型实参之间的继承关系不会自动传递给外层泛型类型。
  - extends 通配符适合读取，super 通配符适合写入；精确读写同一类型时使用命名类型参数。
  - raw type 和 unchecked warning 表示编译器失去了部分类型证据，不能靠隐藏警告解决。
  - 本课使用的泛型语法在 JDK 25 与 Java 8 中相同，两个版本都能运行完整程序。
related: []
tags:
  - Java
  - 泛型
  - 类型参数
  - 通配符
  - 类型安全
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 支持本课采用的同一套泛型语法
verifiedAt: 2026-08-17
sources:
  - id: dev-java-generics-intro
    title: Introducing Generics - Dev.java
    url: https://dev.java/learn/generics/intro/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java 泛型教程；本课结论已与 Java SE 25 和 Java SE 8 规范核对
    claims:
      - 泛型类、类型参数、类型实参和参数化类型的基础合同
      - 泛型方法在返回类型前声明自己的类型参数
      - raw type 会绕过部分类型检查并产生 unchecked warning
  - id: dev-java-generics-type-inference
    title: Type Inference - Dev.java
    url: https://dev.java/learn/generics/type-inference/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java 泛型教程；菱形运算符结论适用于 Java 7 及以上
    claims:
      - 编译器可以根据调用实参和目标上下文推断泛型方法的类型实参
      - 菱形运算符在能够推断类型实参时省略构造器右侧的重复类型文字
  - id: dev-java-generics-wildcards
    title: Wildcards - Dev.java
    url: https://dev.java/learn/generics/wildcards/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java SE 25 与 Java SE 8 的共同通配符合同
    claims:
      - 上界通配符把未知类型限制为上界或其子类型
      - 下界通配符把未知类型限制为下界或其父类型
      - 通配符应根据参数的输入与输出职责选择
  - id: dev-java-generics-erasure
    title: Type Erasure - Dev.java
    url: https://dev.java/learn/generics/type-erasure/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java SE 25 与 Java SE 8 的共同擦除机制
    claims:
      - 无界类型参数擦除为 Object，有界类型参数擦除为首个边界
      - 编译器按需插入转换并可能生成桥接方法
      - raw type 或 unchecked 操作可能破坏参数化类型合同
  - id: dev-java-generics-restrictions
    title: Restriction on Generics - Dev.java
    url: https://dev.java/learn/generics/restrictions/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java SE 25 与 Java SE 8 的共同泛型限制
    claims:
      - 类型实参不能直接使用基本类型，也不能直接创建类型参数实例
      - 运行时不能检查完整参数化类型，也不能直接创建参数化类型数组
  - id: jls25-generic-types
    title: Java Language Specification 25 - Types, Values, and Variables
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 参数化类型、类型实参、通配符、不变性、擦除和可具体化类型的语言规则
      - raw type、unchecked warning 与 heap pollution 的规范定义
  - id: jls8-generic-types
    title: Java Language Specification 8 - Types, Values, and Variables
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-4.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 已具有本课采用的参数化类型、通配符、擦除和 raw type 核心合同
  - id: stackoverflow-pecs
    title: What is PECS (Producer Extends Consumer Super)?
    url: https://stackoverflow.com/questions/2723397/what-is-pecs-producer-extends-consumer-super
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java SE 8 与 Java SE 25；仅用于纯读取来源与纯写入目标的记忆辅助
    claims:
      - Producer Extends、Consumer Super 可以帮助记忆通配符的读写方向
      - 类型既要精确读取又要写入时不能机械套用这一简写
---

# 泛型

TeamFlow 里有许多“结构相同、数据类型不同”的小问题：一个槽位可能暂存任务，也可能暂存负责人名称；
一个辅助方法可能格式化任务编号，也可能格式化数字。如果把这些位置都写成 `Object`，调用方就要自己
记住真实类型并反复强制转换，写入错误也可能到很晚才暴露。

泛型把这种类型关系交给编译器检查。本课只学习泛型本身，不提前展开 `List`、`Set`、`Map` 的创建、
增删改查或遍历，也不使用异常处理、反射、Maven、Spring 或网络能力。示例继续使用普通 Java 项目，
把注意力放在尖括号中的类型合同上。

## 一、把类型写进容器合同

### 1. 只使用 Object 会失去什么

先看一个没有泛型的槽位。它可以保存任何对象，读取时也只能返回 `Object`：

```java
/** 保存一个没有明确类型合同的值。 */
final class ObjectSlot {
    private final Object value;

    /**
     * 创建一个对象槽位。
     *
     * @param value 要保存的对象
     */
    ObjectSlot(Object value) {
        this.value = value;
    }

    /**
     * 返回槽位中的对象。
     *
     * @return 保存的对象
     */
    Object get() {
        return value;
    }
}
```

调用方可以写入字符串，却错误地把读取结果当成整数：

```java
ObjectSlot slot = new ObjectSlot("TF-301");
Integer taskNumber = (Integer) slot.get();
```

编译器只看到“`Object` 可以被显式转换为 `Integer`”，无法证明槽位里实际保存的是字符串。程序运行到
转换位置才失败。问题不在于转换语法写错，而在于容器声明从一开始就没有保存“写入类型与读取类型必须
一致”这条关系。

### 2. T 是声明中的类型参数

把变化的类型写成 `T`，槽位就成为泛型类：

```java
/** 保存一种由调用方指定类型的值。 */
final class TaskSlot<T> {
    private T value;

    /**
     * 创建指定类型的槽位。
     *
     * @param value 初始值
     */
    TaskSlot(T value) {
        this.value = value;
    }

    /**
     * 返回槽位中的值。
     *
     * @return 当前值
     */
    T get() {
        return value;
    }

    /**
     * 替换槽位中的值。
     *
     * @param value 新值
     */
    void set(T value) {
        this.value = value;
    }
}
```

`TaskSlot<T>` 中的 `T` 是类型参数，只在这个类的合同中充当类型占位符。它同时出现在字段、构造器参数、
返回类型和方法参数上，表达的是同一条关系：放进去的类型和取出来的类型一致。

`T` 不是运行时变量，也不是某个固定类名。类型参数通常使用简短的大写名称，例如 `T` 表示 type、`E`
表示 element、`K` 和 `V` 表示 key 与 value；名称只是约定，真正重要的是它在合同中的位置保持一致。

### 3. 类型实参把 T 变成具体合同

使用泛型类时，尖括号里的 `TaskSnapshot` 或 `String` 是类型实参：

```java
TaskSlot<TaskSnapshot> taskSlot = new TaskSlot<TaskSnapshot>(task);
TaskSlot<String> titleSlot = new TaskSlot<String>("编写泛型课程");
```

`TaskSlot<TaskSnapshot>` 与 `TaskSlot<String>` 都是参数化类型。前者的 `set` 只接收 `TaskSnapshot`，
`get` 直接返回 `TaskSnapshot`；后者则只接收和返回 `String`。错误类型会在编译阶段被拒绝，不需要在读取
位置补一次强制转换。

右侧重复的类型实参可以使用菱形运算符省略：

```java
TaskSlot<TaskSnapshot> taskSlot = new TaskSlot<>(task);
TaskSlot<String> titleSlot = new TaskSlot<>("编写泛型课程");
```

`<>` 不是 raw type。它要求编译器根据左侧目标类型和构造器实参推断类型；完全省略尖括号的
`new TaskSlot(task)` 才是在使用 raw type。菱形运算符从 Java 7 起已经可用，因此 JDK 25 和 Java 8
都能使用上面的写法。

类型实参必须是引用类型，不能写 `TaskSlot<int>`。需要保存基本数值时使用包装类型，例如
`TaskSlot<Integer>`。自动装箱的完整规则不属于本课，这里只需记住尖括号里不能直接放基本类型名。

## 二、让方法也保留类型关系

### 1. 泛型方法在返回类型前声明参数

一个类本身不是泛型类，也可以拥有泛型方法。方法自己的类型参数列表写在返回类型之前：

```java
/**
 * 为任意类型的值添加标签。
 *
 * @param label 标签
 * @param value 要展示的值
 * @param <T> 值的类型
 * @return 标签和值组成的文本
 */
static <T> String label(String label, T value) {
    return label + "：" + value;
}
```

第一个 `<T>` 是声明，参数位置的 `T value` 是使用。调用 `label("任务编号", "TF-301")` 时，编译器根据
实参推断 `T` 为 `String`；调用 `label("优先级", 3)` 时，`T` 为 `Integer`。两次调用复用同一个方法体，
但每次调用都保留自己的类型检查。

如果方法参数和返回值需要保持同一种类型，类型参数可以同时出现在两处：

```java
/**
 * 原样返回输入值。
 *
 * @param value 输入值
 * @param <T> 输入和输出共享的类型
 * @return 原输入值
 */
static <T> T identity(T value) {
    return value;
}
```

这里用命名类型参数表达“输入是什么类型，返回就是什么类型”。若只写 `Object identity(Object value)`，
返回类型与输入的具体类型关系就会丢失，调用方又要强制转换。

### 2. 方法类型参数有自己的作用范围

类上的 `T` 可以用于实例字段和实例方法；方法上的 `<T>` 只在该方法声明和方法体内有效。静态方法不能
直接使用外围泛型类的实例类型参数，因为静态方法属于类本身，不属于某个已经选定类型实参的对象。

```java
/** 保存一种指定类型的值。 */
final class TaskSlot<T> {
    private final T value;

    /**
     * 创建槽位。
     *
     * @param value 初始值
     */
    TaskSlot(T value) {
        this.value = value;
    }

    /**
     * 使用方法自己的类型参数返回输入值。
     *
     * @param input 输入值
     * @param <R> 当前方法使用的类型
     * @return 原输入值
     */
    static <R> R identity(R input) {
        return input;
    }
}
```

这里使用 `R`，是为了让读者看出它与类上的 `T` 没有自动关系。即使都写成字母 `T`，作用范围也由声明
位置决定；命名相同不会让静态方法获得某个实例的类型实参。

### 3. 上界限制允许的类型实参

有时方法不只是保存和返回值，还要调用某个共同方法。可以用上界说明调用方选择的类型必须遵守什么
合同：

```java
/** 提供任务编号和标题的最小只读合同。 */
interface TaskView {
    /**
     * 返回任务编号。
     *
     * @return 任务编号
     */
    String id();

    /**
     * 返回任务标题。
     *
     * @return 任务标题
     */
    String title();
}

/**
 * 格式化任意 TaskView 实现。
 *
 * @param task 任务视图
 * @param <T> TaskView 或其实现类型
 * @return 任务摘要
 */
static <T extends TaskView> String summarize(T task) {
    return task.id() + " / " + task.title();
}
```

`T extends TaskView` 表示 `T` 必须是 `TaskView` 或它的实现类型。由于上界提供了 `id` 和 `title` 合同，
方法体可以安全调用这两个方法。这里的 `extends` 同时用于“继承类”和“实现接口”的上界语法，不要求
实际类型一定通过类继承得到。

上界应该只写方法真正需要的最小合同。若 `summarize` 只读取任务编号和标题，就不应为了显得严格而把
类型限制为某个具体实现类。

## 三、处理参数化类型之间的关系

### 1. 类型实参有继承关系，外层泛型仍然不变

假设 `TaskSnapshot` 实现了 `TaskView`，下面的普通赋值成立：

```java
TaskSnapshot task = new TaskSnapshot("TF-301", "编写泛型课程");
TaskView view = task;
```

但 `TaskSlot<TaskSnapshot>` 不能赋给 `TaskSlot<TaskView>`：

```java
TaskSlot<TaskSnapshot> taskSlot = new TaskSlot<>(task);
// TaskSlot<TaskView> viewSlot = taskSlot;
```

原因是 `viewSlot` 如果成立，就允许调用 `viewSlot.set(otherTaskView)`，把另一个只实现 `TaskView` 的对象
写入原本只允许 `TaskSnapshot` 的槽位。编译器拒绝赋值，是为了保护原槽位的精确类型合同。这叫参数化
类型不变性：类型实参的继承关系不会自动变成外层泛型类型的继承关系。

### 2. extends 通配符表达只读来源

方法只需要从槽位读取一个 `TaskView` 时，可以接受未知的具体子类型：

```java
/**
 * 从任意任务视图槽位读取标题。
 *
 * @param source 任务视图来源
 * @return 任务标题
 */
static String readTitle(TaskSlot<? extends TaskView> source) {
    return source.get().title();
}
```

`? extends TaskView` 表示“某一种当前未知、但不会超出 `TaskView` 上界的类型”。因此读取结果至少可以当作
`TaskView`，但不能安全写入一个新的 `TaskSnapshot`：真实槽位可能是另一个 `TaskView` 子类型的槽位。

上界通配符不是“完全只读对象”。方法仍可能调用与类型参数无关的操作；这里说“适合读取”，特指不能把
某个具体的上界对象安全写入未知子类型位置。

### 3. super 通配符表达可写目标

方法需要写入 `TaskSnapshot` 时，可以接受 `TaskSnapshot` 本身或它的任意父类型槽位：

```java
/**
 * 把任务快照写入能够接收它的槽位。
 *
 * @param target 可接收任务快照的目标
 * @param replacement 新任务快照
 */
static void replaceTask(
        TaskSlot<? super TaskSnapshot> target,
        TaskSnapshot replacement) {
    target.set(replacement);
}
```

`TaskSlot<TaskSnapshot>`、`TaskSlot<TaskView>` 和 `TaskSlot<Object>` 都可以作为目标，因为它们都能安全
接收 `TaskSnapshot`。但从 `target.get()` 读取时只能保证得到 `Object`，因为调用方实际传入的槽位类型
可能比 `TaskSnapshot` 更宽。

**社区补充：** 社区常用 Producer Extends、Consumer Super（PECS）记忆这两个方向。这个记忆法适用于
Java SE 8 与 Java SE 25，成立条件是参数在当前 API 中主要充当纯读取来源或纯写入目标；本课分别用
`readTitle` 和 `replaceTask` 编译运行核验。若同一个位置既要精确读取又要写入同一种类型，应使用
`TaskSlot<T>` 和命名类型参数，不能机械套用通配符。

## 四、知道泛型在运行时的边界

### 1. 编译期类型不同，不代表产生不同运行时类

泛型首先是编译期合同。编译器检查类型关系后会应用类型擦除：无界类型参数通常擦除为 `Object`，有界
类型参数擦除为第一个边界，并在需要时插入转换或桥接方法。

```java
TaskSlot<String> textSlot = new TaskSlot<>("泛型");
TaskSlot<Integer> numberSlot = new TaskSlot<>(25);
boolean sameRuntimeClass = textSlot.getClass() == numberSlot.getClass();
```

`sameRuntimeClass` 为 `true`。两个变量在源码中具有不同的参数化类型，编译器分别检查它们的读写；运行时
却没有为 `TaskSlot<String>` 和 `TaskSlot<Integer>` 各生成一份新类。本课只需要用这个结果解释常见限制，
不展开字节码细节。

### 2. 运行时不能证明完整类型实参

由于运行时没有保留足够信息，不能检查一个对象是否为 `TaskSlot<String>`：

```java
Object value = new TaskSlot<>("泛型");
// boolean isTextSlot = value instanceof TaskSlot<String>;
boolean isSomeSlot = value instanceof TaskSlot<?>;
```

`TaskSlot<?>` 只要求运行时确认外层是 `TaskSlot`，不要求证明未知类型实参，所以可以用于 `instanceof`。
同理，不能直接创建 `new TaskSlot<String>[2]`；数组需要在运行时检查元素类型，而完整参数化类型在运行时
不可用。

类型参数也不能直接实例化，`new T()` 不合法，因为擦除后的运行时不知道调用哪个具体构造器。若业务确实
需要创建对象，应由调用方传入已经创建的对象或明确的创建合同；本课不引入反射或函数式工厂。

### 3. raw type 与 unchecked warning 都是风险信号

`TaskSlot raw = new TaskSlot("TF-301")` 使用的是 raw type：泛型类名后完全没有类型实参。raw type 主要为
旧代码兼容保留，会放弃部分泛型检查。把 raw 引用再赋给参数化类型时，编译器只能给出 unchecked warning，
不能证明里面的值真的符合目标类型。

```java
TaskSlot raw = new TaskSlot("TF-301");
TaskSlot<Integer> numberSlot = raw;
```

不要把警告理解成“编译器太严格”，也不要先用 `@SuppressWarnings` 把它隐藏。正确方向是补上类型实参，
让数据从写入开始就具有明确合同：

```java
TaskSlot<String> taskIdSlot = new TaskSlot<>("TF-301");
String taskId = taskIdSlot.get();
```

使用 `javac -Xlint:rawtypes,unchecked` 可以显示这两类警告。本课不要求掌握完整编译参数体系，只把这条命令
作为可重复验证：正确泛型代码应在这两项检查下保持无警告。

## 五、运行完整的 TeamFlow 程序

### 1. JDK 25 项目配置与运行

1. 在 IntelliJ IDEA 中打开普通 Java 项目，把 **Project SDK** 和模块 SDK 设为 JDK 25。
2. 在 `src` 下创建 `GenericsApplication.java`，文件名与公共类名保持一致。
3. 粘贴下面完整代码，运行 `main`，观察四行输出。
4. 若 IDEA 与终端版本不一致，分别检查项目 SDK，并在终端运行 `java -version`、`javac -version`；本课不修改系统 JDK。

### 2. JDK 25 完整程序

```java
/** 运行 TeamFlow 泛型合同示例。 */
public final class GenericsApplication {
    /**
     * 创建任务槽位并观察泛型方法、边界和通配符。
     *
     * @param args 命令行参数，本示例不使用
     */
    public static void main(String[] args) {
        TaskSnapshot draft = new TaskSnapshot("TF-301", "编写泛型课程");
        TaskSlot<TaskSnapshot> current = new TaskSlot<>(draft);

        System.out.println(label("当前任务", summarize(current.get())));
        System.out.println(label("读取标题", readTitle(current)));

        TaskSlot<TaskView> target = new TaskSlot<>(draft);
        TaskSnapshot reviewed = new TaskSnapshot("TF-302", "复核泛型课程");
        replaceTask(target, reviewed);
        System.out.println(label("替换结果", summarize(target.get())));

        boolean sameRuntimeClass = new TaskSlot<String>("泛型").getClass()
                == new TaskSlot<Integer>(25).getClass();
        System.out.println(label("运行时同类", sameRuntimeClass));
    }

    /**
     * 为任意类型的值添加标签。
     *
     * @param name 标签
     * @param value 要展示的值
     * @param <T> 值的类型
     * @return 标签和值组成的文本
     */
    private static <T> String label(String name, T value) {
        return name + "：" + value;
    }

    /**
     * 格式化任意任务视图。
     *
     * @param task 任务视图
     * @param <T> TaskView 或其实现类型
     * @return 任务编号与标题
     */
    private static <T extends TaskView> String summarize(T task) {
        return task.id() + " / " + task.title();
    }

    /**
     * 从任意任务视图槽位读取标题。
     *
     * @param source 任务视图来源
     * @return 任务标题
     */
    private static String readTitle(TaskSlot<? extends TaskView> source) {
        return source.get().title();
    }

    /**
     * 把任务快照写入可接收它的槽位。
     *
     * @param target 写入目标
     * @param replacement 新任务快照
     */
    private static void replaceTask(
            TaskSlot<? super TaskSnapshot> target,
            TaskSnapshot replacement) {
        target.set(replacement);
    }
}

/** 提供任务编号和标题的最小只读合同。 */
interface TaskView {
    /**
     * 返回任务编号。
     *
     * @return 任务编号
     */
    String id();

    /**
     * 返回任务标题。
     *
     * @return 任务标题
     */
    String title();
}

/** 保存 TeamFlow 任务的只读快照。 */
final class TaskSnapshot implements TaskView {
    private final String id;
    private final String title;

    /**
     * 创建任务快照。
     *
     * @param id 任务编号
     * @param title 任务标题
     */
    TaskSnapshot(String id, String title) {
        this.id = id;
        this.title = title;
    }

    /**
     * 返回任务编号。
     *
     * @return 任务编号
     */
    @Override
    public String id() {
        return id;
    }

    /**
     * 返回任务标题。
     *
     * @return 任务标题
     */
    @Override
    public String title() {
        return title;
    }
}

/** 保存一种由调用方指定类型的值。 */
final class TaskSlot<T> {
    private T value;

    /**
     * 创建指定类型的槽位。
     *
     * @param value 初始值
     */
    TaskSlot(T value) {
        this.value = value;
    }

    /**
     * 返回槽位中的值。
     *
     * @return 当前值
     */
    T get() {
        return value;
    }

    /**
     * 替换槽位中的值。
     *
     * @param value 新值
     */
    void set(T value) {
        this.value = value;
    }
}
```

预期控制台输出：

```text
当前任务：TF-301 / 编写泛型课程
读取标题：编写泛型课程
替换结果：TF-302 / 复核泛型课程
运行时同类：true
```

第一行由泛型方法 `label` 与有界泛型方法 `summarize` 共同产生；第二行证明 `? extends TaskView` 可以安全
读取；第三行证明 `? super TaskSnapshot` 可以安全写入父类型槽位；第四行把不同的编译期参数化类型与相同的
运行时外层类区分开。

### 3. Java 8 项目配置与运行

1. 为兼容版本使用独立普通 Java 项目或模块，把 **Project SDK**、模块 SDK 和 **Language level** 设为 Java 8。
2. 创建 `GenericsApplication.java`，不要与 JDK 25 项目共用编译输出目录。
3. 粘贴下面完整代码并运行 `main`；菱形运算符、泛型方法、边界和通配符都已在 Java 8 中可用。
4. 预期输出与 JDK 25 逐字相同；终端版本仍需用 `java -version`、`javac -version` 单独核对。

### 4. Java 8 完整程序

```java
/** 运行 TeamFlow Java 8 泛型合同示例。 */
public final class GenericsApplication {
    /**
     * 创建任务槽位并观察泛型方法、边界和通配符。
     *
     * @param args 命令行参数，本示例不使用
     */
    public static void main(String[] args) {
        TaskSnapshot draft = new TaskSnapshot("TF-301", "编写泛型课程");
        TaskSlot<TaskSnapshot> current = new TaskSlot<>(draft);

        System.out.println(label("当前任务", summarize(current.get())));
        System.out.println(label("读取标题", readTitle(current)));

        TaskSlot<TaskView> target = new TaskSlot<>(draft);
        TaskSnapshot reviewed = new TaskSnapshot("TF-302", "复核泛型课程");
        replaceTask(target, reviewed);
        System.out.println(label("替换结果", summarize(target.get())));

        boolean sameRuntimeClass = new TaskSlot<String>("泛型").getClass()
                == new TaskSlot<Integer>(25).getClass();
        System.out.println(label("运行时同类", sameRuntimeClass));
    }

    /**
     * 为任意类型的值添加标签。
     *
     * @param name 标签
     * @param value 要展示的值
     * @param <T> 值的类型
     * @return 标签和值组成的文本
     */
    private static <T> String label(String name, T value) {
        return name + "：" + value;
    }

    /**
     * 格式化任意任务视图。
     *
     * @param task 任务视图
     * @param <T> TaskView 或其实现类型
     * @return 任务编号与标题
     */
    private static <T extends TaskView> String summarize(T task) {
        return task.id() + " / " + task.title();
    }

    /**
     * 从任意任务视图槽位读取标题。
     *
     * @param source 任务视图来源
     * @return 任务标题
     */
    private static String readTitle(TaskSlot<? extends TaskView> source) {
        return source.get().title();
    }

    /**
     * 把任务快照写入可接收它的槽位。
     *
     * @param target 写入目标
     * @param replacement 新任务快照
     */
    private static void replaceTask(
            TaskSlot<? super TaskSnapshot> target,
            TaskSnapshot replacement) {
        target.set(replacement);
    }
}

/** 提供任务编号和标题的最小只读合同。 */
interface TaskView {
    /**
     * 返回任务编号。
     *
     * @return 任务编号
     */
    String id();

    /**
     * 返回任务标题。
     *
     * @return 任务标题
     */
    String title();
}

/** 保存 TeamFlow 任务的只读快照。 */
final class TaskSnapshot implements TaskView {
    private final String id;
    private final String title;

    /**
     * 创建任务快照。
     *
     * @param id 任务编号
     * @param title 任务标题
     */
    TaskSnapshot(String id, String title) {
        this.id = id;
        this.title = title;
    }

    /**
     * 返回任务编号。
     *
     * @return 任务编号
     */
    @Override
    public String id() {
        return id;
    }

    /**
     * 返回任务标题。
     *
     * @return 任务标题
     */
    @Override
    public String title() {
        return title;
    }
}

/** 保存一种由调用方指定类型的值。 */
final class TaskSlot<T> {
    private T value;

    /**
     * 创建指定类型的槽位。
     *
     * @param value 初始值
     */
    TaskSlot(T value) {
        this.value = value;
    }

    /**
     * 返回槽位中的值。
     *
     * @return 当前值
     */
    T get() {
        return value;
    }

    /**
     * 替换槽位中的值。
     *
     * @param value 新值
     */
    void set(T value) {
        this.value = value;
    }
}
```

Java 8 预期输出：

```text
当前任务：TF-301 / 编写泛型课程
读取标题：编写泛型课程
替换结果：TF-302 / 复核泛型课程
运行时同类：true
```

两个版本的源码相同不是省略差异，而是本课结论的一部分：这里使用的泛型能力在 Java 8 已经存在。
本课没有为了制造对比而引入 JDK 25 专属语法，也没有把 Java 7 已有的菱形运算符误写成新特性。

## 六、常见错误

下面的错误都集中在泛型合同本身，只观察编译结果、警告或直接运行结果，不展开后续课程的完整异常诊断。

:::pitfalls
### 把 raw type 当成更灵活的泛型

**现象：** 编译器同时报告 `rawtypes` 与 `unchecked` 警告，读取 `Integer` 时可能在运行中失败。

**触发条件：** 创建 `TaskSlot` 时完全省略类型实参，再把它赋给 `TaskSlot<Integer>`。

**原因：** raw type 为旧代码兼容保留，会绕过写入位置的类型检查；后续赋给参数化类型时，编译器无法证明内容正确。

**后果：** 编译产生 `rawtypes` 与 `unchecked` 警告，错误值可能到读取位置才导致运行失败。

**错误示例：**

```java
TaskSlot raw = new TaskSlot("TF-301");
TaskSlot<Integer> numbers = raw;
Integer number = numbers.get();
```

**正确写法：**

```java
TaskSlot<String> taskIds = new TaskSlot<>("TF-301");
String taskId = taskIds.get();
```

**验证方式：** 使用 `javac -Xlint:rawtypes,unchecked` 编译；错误示例必须出现两类警告，正确示例应无这两类警告并读出 `TF-301`。
### 把类型实参的继承关系搬给外层泛型

**现象：** `TaskSlot<TaskSnapshot>` 不能直接赋值给 `TaskSlot<TaskView>`，两个版本的编译器都会拒绝。

**触发条件：** 因为 `TaskSnapshot` 实现 `TaskView`，就把 `TaskSlot<TaskSnapshot>` 赋给 `TaskSlot<TaskView>`。

**原因：** 参数化类型默认不变；若允许赋值，父类型槽位引用就能写入其他 `TaskView` 实现，破坏原槽位合同。

**后果：** 赋值在 JDK 25 与 Java 8 中都编译失败。

**错误示例：**

```java
TaskSlot<TaskSnapshot> source = new TaskSlot<>(
        new TaskSnapshot("TF-301", "编写泛型课程"));
TaskSlot<TaskView> target = source;
```

**正确写法：**

```java
TaskSlot<TaskSnapshot> source = new TaskSlot<>(
        new TaskSnapshot("TF-301", "编写泛型课程"));
TaskSlot<? extends TaskView> readable = source;
TaskView task = readable.get();
```

**验证方式：** 分别编译两段；错误赋值必须失败，正确版本应能读取并输出 `TF-301`。
### 向 extends 通配符槽位写入具体对象

**现象：** 调用 `set` 时出现编译错误，即使写入对象实现了通配符的上界接口。

**触发条件：** 方法参数是 `TaskSlot<? extends TaskView>`，却调用 `set(new TaskSnapshot(...))`。

**原因：** 通配符代表某个未知子类型，真实槽位不一定是 `TaskSnapshot` 槽位。

**后果：** 编译器拒绝写入，避免把错误实现类型放进调用方的槽位。

**错误示例：**

```java
/**
 * 错误地向未知子类型槽位写入任务快照。
 *
 * @param target 未知任务视图槽位
 */
static void replace(TaskSlot<? extends TaskView> target) {
    target.set(new TaskSnapshot("TF-302", "复核泛型课程"));
}
```

**正确写法：**

```java
/**
 * 向能够接收任务快照的槽位写入新值。
 *
 * @param target 写入目标
 */
static void replace(TaskSlot<? super TaskSnapshot> target) {
    target.set(new TaskSnapshot("TF-302", "复核泛型课程"));
}
```

**验证方式：** 错误方法必须编译失败；正确方法应能接收 `TaskSlot<TaskSnapshot>` 或 `TaskSlot<TaskView>`。
### 把 super 通配符的读取结果直接当成下界类型

**现象：** `source.get()` 不能直接赋给 `TaskSnapshot`，强制转换会重新引入运行时风险。

**触发条件：** 从 `TaskSlot<? super TaskSnapshot>` 调用 `get`，直接赋给 `TaskSnapshot`。

**原因：** 真实槽位可能是 `TaskSlot<TaskView>` 或 `TaskSlot<Object>`，编译器只能保证读取结果是 `Object`。

**后果：** 直接赋值编译失败；强制转换则把本应存在的类型证据交给运行时猜测。

**错误示例：**

```java
/**
 * 错误地把下界槽位的结果当成任务快照。
 *
 * @param source 下界槽位
 * @return 任务快照
 */
static TaskSnapshot read(TaskSlot<? super TaskSnapshot> source) {
    return source.get();
}
```

**正确写法：**

```java
/**
 * 从精确类型槽位读取任务快照。
 *
 * @param source 精确任务快照槽位
 * @return 任务快照
 */
static TaskSnapshot read(TaskSlot<TaskSnapshot> source) {
    return source.get();
}
```

**验证方式：** 错误方法应编译失败；正确方法编译通过，并且不需要 unchecked cast。
### 忘记声明泛型方法自己的类型参数

**现象：** 编译器报告找不到符号 `T`，方法声明无法通过编译。

**触发条件：** 在非泛型类的静态方法中直接把 `T` 写成参数和返回类型。

**原因：** `T` 只有在类、接口、方法或构造器声明了类型参数后才有作用范围。

**后果：** 编译器报告找不到符号 `T`，方法无法使用。

**错误示例：**

```java
/**
 * 缺少类型参数声明的错误方法。
 *
 * @param value 输入值
 * @return 原输入值
 */
static T identity(T value) {
    return value;
}
```

**正确写法：**

```java
/**
 * 声明并使用方法自己的类型参数。
 *
 * @param value 输入值
 * @param <T> 输入和输出共享的类型
 * @return 原输入值
 */
static <T> T identity(T value) {
    return value;
}
```

**验证方式：** 错误版本应编译失败；正确版本调用 `identity("TF-301")` 时直接返回 `String`。
### 在运行时检查完整参数化类型

**现象：** `instanceof TaskSlot<String>` 不能通过编译，运行时无法用它确认元素类型。

**触发条件：** 写出 `value instanceof TaskSlot<String>`，希望运行时确认槽位里的类型实参。

**原因：** 类型擦除后，运行时没有足够信息区分 `TaskSlot<String>` 与 `TaskSlot<Integer>`。

**后果：** 完整参数化类型检查编译失败，不能作为数据验证手段。

**错误示例：**

```java
/**
 * 错误地检查完整类型实参。
 *
 * @param value 待检查对象
 * @return 是否为字符串槽位
 */
static boolean isTextSlot(Object value) {
    return value instanceof TaskSlot<String>;
}
```

**正确写法：**

```java
/**
 * 只检查运行时可确认的外层泛型类。
 *
 * @param value 待检查对象
 * @return 是否为某种任务槽位
 */
static boolean isTaskSlot(Object value) {
    return value instanceof TaskSlot<?>;
}
```

**验证方式：** 错误版本必须编译失败；正确版本对 `new TaskSlot<>("TF-301")` 返回 `true`，但不声称知道元素类型。
:::

## 七、练习：设计类型安全的任务封套

:::exercise
### 完成任务封套

**要求：** 声明泛型类 `TaskEnvelope<T>`，用构造器保存一个 `T` 并通过 `value()` 返回；声明
`<T extends TaskView> String describe(T task)`，使用 `id()` 和 `title()` 组成摘要；创建
`TaskEnvelope<TaskSnapshot>` 并输出 `验收任务：TF-401 / 完成泛型练习`。不得使用 raw type、unchecked cast、
`Object` 返回值或集合类型。JDK 25 与 Java 8 都要使用完整可运行代码。

**验收：** 两个版本均能编译运行，控制台逐字输出一行预期文本；使用
`javac -Xlint:rawtypes,unchecked` 编译时没有这两类警告；把封套类型实参改成 `String` 后不能调用有界的
`describe` 方法。
:::

## 八、练习参考实现

### 1. JDK 25 参考实现

```java
/** 运行 TeamFlow 泛型封套练习。 */
public final class GenericsExercise {
    /**
     * 创建任务封套并输出任务摘要。
     *
     * @param args 命令行参数，本练习不使用
     */
    public static void main(String[] args) {
        TaskSnapshot task = new TaskSnapshot("TF-401", "完成泛型练习");
        TaskEnvelope<TaskSnapshot> envelope = new TaskEnvelope<>(task);
        System.out.println("验收任务：" + describe(envelope.value()));
    }

    /**
     * 描述任意任务视图。
     *
     * @param task 任务视图
     * @param <T> TaskView 或其实现类型
     * @return 任务编号与标题
     */
    private static <T extends TaskView> String describe(T task) {
        return task.id() + " / " + task.title();
    }
}

/** 提供任务编号和标题的最小合同。 */
interface TaskView {
    /**
     * 返回任务编号。
     *
     * @return 任务编号
     */
    String id();

    /**
     * 返回任务标题。
     *
     * @return 任务标题
     */
    String title();
}

/** 保存练习使用的任务快照。 */
final class TaskSnapshot implements TaskView {
    private final String id;
    private final String title;

    /**
     * 创建任务快照。
     *
     * @param id 任务编号
     * @param title 任务标题
     */
    TaskSnapshot(String id, String title) {
        this.id = id;
        this.title = title;
    }

    /**
     * 返回任务编号。
     *
     * @return 任务编号
     */
    @Override
    public String id() {
        return id;
    }

    /**
     * 返回任务标题。
     *
     * @return 任务标题
     */
    @Override
    public String title() {
        return title;
    }
}

/** 保存一个由调用方指定类型的值。 */
final class TaskEnvelope<T> {
    private final T value;

    /**
     * 创建任务封套。
     *
     * @param value 封套中的值
     */
    TaskEnvelope(T value) {
        this.value = value;
    }

    /**
     * 返回封套中的值。
     *
     * @return 当前值
     */
    T value() {
        return value;
    }
}
```

JDK 25 预期输出：

```text
验收任务：TF-401 / 完成泛型练习
```

### 2. Java 8 参考实现

```java
/** 运行 TeamFlow Java 8 泛型封套练习。 */
public final class GenericsExercise {
    /**
     * 创建任务封套并输出任务摘要。
     *
     * @param args 命令行参数，本练习不使用
     */
    public static void main(String[] args) {
        TaskSnapshot task = new TaskSnapshot("TF-401", "完成泛型练习");
        TaskEnvelope<TaskSnapshot> envelope = new TaskEnvelope<>(task);
        System.out.println("验收任务：" + describe(envelope.value()));
    }

    /**
     * 描述任意任务视图。
     *
     * @param task 任务视图
     * @param <T> TaskView 或其实现类型
     * @return 任务编号与标题
     */
    private static <T extends TaskView> String describe(T task) {
        return task.id() + " / " + task.title();
    }
}

/** 提供任务编号和标题的最小合同。 */
interface TaskView {
    /**
     * 返回任务编号。
     *
     * @return 任务编号
     */
    String id();

    /**
     * 返回任务标题。
     *
     * @return 任务标题
     */
    String title();
}

/** 保存练习使用的任务快照。 */
final class TaskSnapshot implements TaskView {
    private final String id;
    private final String title;

    /**
     * 创建任务快照。
     *
     * @param id 任务编号
     * @param title 任务标题
     */
    TaskSnapshot(String id, String title) {
        this.id = id;
        this.title = title;
    }

    /**
     * 返回任务编号。
     *
     * @return 任务编号
     */
    @Override
    public String id() {
        return id;
    }

    /**
     * 返回任务标题。
     *
     * @return 任务标题
     */
    @Override
    public String title() {
        return title;
    }
}

/** 保存一个由调用方指定类型的值。 */
final class TaskEnvelope<T> {
    private final T value;

    /**
     * 创建任务封套。
     *
     * @param value 封套中的值
     */
    TaskEnvelope(T value) {
        this.value = value;
    }

    /**
     * 返回封套中的值。
     *
     * @return 当前值
     */
    T value() {
        return value;
    }
}
```

Java 8 预期输出：

```text
验收任务：TF-401 / 完成泛型练习
```

两份练习代码都让 `TaskEnvelope<TaskSnapshot>` 的写入类型、读取类型和 `describe` 上界在编译期对齐。
若改用 raw `TaskEnvelope`，这种关系会退化为警告；若改成 `TaskEnvelope<String>`，`String` 不满足
`TaskView` 上界，调用 `describe` 会被编译器拒绝。
