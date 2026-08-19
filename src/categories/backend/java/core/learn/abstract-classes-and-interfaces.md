---
id: backend.java.learn.basics.abstract-classes-and-interfaces
type: lesson
title: 抽象类与接口
summary: 用抽象类复用对象共有状态与实现，用接口声明可由不同类共同遵守的行为合同
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 90
prerequisites:
  - backend.java.learn.basics.interfaces-inheritance-and-polymorphism
objectives:
  - 能声明不能直接实例化的抽象类，并让具体子类补齐抽象方法。
  - 能通过抽象类构造器初始化共有状态，并复用已有实现。
  - 能用 interface 和 implements 建立编译器可检查的行为合同。
  - 能区分接口的抽象、default、static、private 方法与常量字段。
  - 能根据状态复用、构造过程和行为组合选择抽象类或接口。
  - 能处理 JDK 25 私有接口方法与 Java 8 不支持该语法的真实差异。
recap:
  - 抽象类不能直接 new，但可以保存实例状态、声明构造器并提供已有实现。
  - 抽象方法只有声明；具体子类必须实现继承到的全部抽象方法。
  - 接口描述行为合同，实现类必须用 public 方法完成公开合同。
  - 接口字段恒为 public static final，不能保存每个对象各自变化的状态。
  - 一个类只能直接 extends 一个类，却可以 implements 多个接口。
  - Java 8 支持接口的抽象、default 和 static 方法，但不支持 private 接口方法。
related: []
tags:
  - Java
  - 抽象类
  - 接口
  - abstract
  - interface
  - implements
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 的 private 接口方法差异在对应位置说明
verifiedAt: 2026-08-17
sources:
  - id: dev-java-abstract-classes
    title: Abstract Methods and Classes - Dev.java
    url: https://dev.java/learn/inheritance/abstract-classes/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java；Java SE
    claims:
      - 抽象类不能直接实例化，但可以包含实例字段、构造器、抽象方法和已有实现的方法
      - 具体子类必须实现继承到的抽象方法，否则子类也必须声明为 abstract
      - 抽象类与接口在状态、实现复用和继承数量上的主要差异
  - id: dev-java-defining-interfaces
    title: Interfaces - Dev.java
    url: https://dev.java/learn/interfaces/defining-interfaces/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java；Java SE
    claims:
      - 接口可以声明常量、抽象方法、default 方法、static 方法和 private 辅助方法
      - 接口常量隐式为 public static final，一个类可以实现多个接口
  - id: dev-java-oop-interface-contract
    title: Objects, Classes, Interfaces, Packages, and Inheritance - Dev.java
    url: https://dev.java/learn/oop/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java；Java SE
    claims:
      - implements 表示类承诺提供接口声明的行为，编译器会检查合同是否完成
      - 实现接口抽象方法时需要使用 public 可见性
  - id: jls-25-classes
    title: Java Language Specification 25 - Classes
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - abstract 类、abstract 方法、具体子类和单类继承的语言规则
  - id: jls-25-interfaces
    title: Java Language Specification 25 - Interfaces
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 接口字段、接口方法修饰符、implements 和多接口实现的语言规则
      - private 接口方法只能在接口内部帮助有方法体的方法复用实现
  - id: jls-8-classes
    title: Java Language Specification 8 - Classes
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 的抽象类、抽象方法和具体子类规则与本课传统写法一致
  - id: jls-8-interfaces
    title: Java Language Specification 8 - Interfaces
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-9.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 接口支持抽象、default 和 static 方法，但不支持 private 接口方法
  - id: jep-213-private-interface-methods
    title: JEP 213 - Milling Project Coin
    url: https://openjdk.org/jeps/213
    sourceOrigin: official
    sourceType: release-note
    appliesTo: Java 9 及以上；JDK 25 可用
    claims:
      - private 接口方法在 Java 9 交付，用于让接口中已有方法体的方法共享内部实现
  - id: stackoverflow-instantiate-abstract-class
    title: Why cannot use new keyword to initialize abstract class in Java? - Stack Overflow
    url: https://stackoverflow.com/questions/7335329/why-cannot-use-new-keyword-to-initialize-abstract-class-in-java
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 抽象类的真实初学者误区
    claims:
      - 不能直接 new 抽象类不等于具体子类对象中没有抽象父类声明的状态
  - id: stackoverflow-interface-public-method
    title: Java attempting to assign weaker class privileges - Stack Overflow
    url: https://stackoverflow.com/questions/24773080/java-attempting-to-assign-weaker-class-privileges
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 接口实现方法可见性的真实编译错误
    claims:
      - 实现接口方法时漏写 public 会触发降低公开合同可见性的编译错误
---

# 抽象类与接口

上一课已经能让具体子类继承父类并重写方法。如果父类只汇集共享规则，本身并不代表完整业务对象，
允许直接创建它就会得到含义不完整的对象；如果没有父子关系的类都要提供同一种能力，只复制同名方法，
编译器也无法确认它们遵守了同一份合同。

抽象类解决第一类问题，接口解决第二类问题。本课把两者连接进 TeamFlow 工作项通知程序。父类型变量、
运行时选择具体实现和类型转换属于下一课，本课始终使用具体类型调用对象，只建立声明与实现合同。

## 一、让不完整的父类保持抽象

### 1. 抽象类不能直接创建对象

所有 TeamFlow 工作项都有编号和标题，但不同工作项的摘要细节不同。只保存公共部分的父类还不完整，
可以在 `class` 前加 `abstract`：

```java
/** 保存工作项共有状态。 */
public abstract class AbstractWorkItem {
    private final int id;

    /**
     * 初始化工作项编号。
     *
     * @param id 工作项编号
     */
    protected AbstractWorkItem(int id) {
        this.id = id;
    }

    /**
     * 返回工作项编号。
     *
     * @return 工作项编号
     */
    public int id() {
        return id;
    }
}
```

`new AbstractWorkItem(...)` 会在编译阶段被拒绝，但抽象类仍能声明字段、构造器和已有实现的方法。限制的
是直接创建这种不完整类型，不是禁止它保存数据。

**社区补充：** Stack Overflow 上有初学者把这一限制解释成“抽象类不会分配内存”。这个解释不准确。
创建具体子类对象时，对象仍包含抽象父类声明的字段，并会执行父类构造器；JDK 25 与 Java 8 都如此。

### 2. 抽象方法把未完成部分交给子类

抽象方法没有方法体，以分号结束。父类可以提供公共摘要，同时要求每种具体工作项补充自己的细节：

```java
/** 保存工作项共有状态和摘要合同。 */
public abstract class AbstractWorkItem {
    private final int id;
    private final String title;

    /**
     * 初始化共有状态。
     *
     * @param id 工作项编号
     * @param title 工作项标题
     */
    protected AbstractWorkItem(int id, String title) {
        this.id = id;
        this.title = title;
    }

    /**
     * 返回可供子类复用的基础摘要。
     *
     * @return 基础摘要
     */
    protected String baseSummary() {
        return "工作项 #" + id + "：" + title;
    }

    /**
     * 返回具体工作项的完整摘要。
     *
     * @return 完整摘要
     */
    public abstract String summary();
}
```

`baseSummary()` 已经有实现，子类可以复用；`summary()` 只有合同，具体子类必须实现。否则子类也必须标记
为 `abstract`，不能创建对象。`@Override` 能让编译器检查实现的方法名和参数是否准确匹配合同。

### 3. 抽象类构造器仍会执行

抽象类不能直接 `new`，但具体子类构造器会通过 `super(...)` 调用它的构造器，先初始化 `id` 和 `title`，
再初始化子类自己的字段。把抽象类构造器写成 `protected`，表示它服务于子类构造过程。

构造器不能声明为 `abstract`：子类构造器不会重写父类构造器，只会在自己的构造过程中调用它。这个执行
顺序解释了为什么具体对象能复用父类字段，同时又不能直接创建抽象父类对象。

## 二、用接口声明行为合同

### 1. interface 与 implements 连接合同和实现

通知能力不要求所有实现类共享同一组字段，只需要承诺“能发送消息”：

```java
/** 声明通知发送合同。 */
public interface TaskNotifier {
    /**
     * 发送通知。
     *
     * @param message 通知内容
     */
    void send(String message);
}

/** 把通知写到控制台。 */
public class ConsoleTaskNotifier implements TaskNotifier {
    /**
     * 输出通知。
     *
     * @param message 通知内容
     */
    @Override
    public void send(String message) {
        System.out.println("TeamFlow 通知：" + message);
    }
}
```

接口中的 `send` 隐式为 `public abstract`。`implements TaskNotifier` 是编译器会检查的承诺，实现类必须
补齐方法，而且不能缩小公开合同的可见性。

**社区补充：** Stack Overflow 的真实编译错误显示，实现类漏写 `public` 会被判定为使用更弱的访问权限。
JDK 25 与 Java 8 都会拒绝这种写法；正确实现必须显式保留 `public`。

### 2. 接口可以提供有限的已有实现

JDK 25 的接口可以包含本课用到的四类方法：

- 无方法体的普通声明是公开的抽象合同。
- `default` 方法有方法体，实现类可以直接获得这段行为。
- `static` 方法属于接口本身，使用接口名调用。
- `private` 方法只供接口内部有方法体的方法复用，不能由实现类调用或重写。

```java
/** 声明通知合同和通用格式。 */
public interface TaskNotifier {
    /**
     * 发送通知。
     *
     * @param message 通知内容
     */
    void send(String message);

    /**
     * 发送准备完成通知。
     *
     * @param id 工作项编号
     * @param title 工作项标题
     */
    default void sendReady(int id, String title) {
        send(formatReady(id, title));
    }

    /**
     * 返回通道名称。
     *
     * @return 通道名称
     */
    static String channelName() {
        return "控制台";
    }

    /**
     * 生成准备完成消息。
     *
     * @param id 工作项编号
     * @param title 工作项标题
     * @return 准备完成消息
     */
    private String formatReady(int id, String title) {
        return "工作项 #" + id + " 已准备：" + title;
    }
}
```

Java 8 已支持抽象、`default` 和 `static` 接口方法，但私有接口方法从 Java 9 才可用。Java 8 兼容写法
应把格式拼接内联进 `default` 方法，而不是把内部辅助方法改成 `public`、扩大接口合同：

```java
/** 声明 Java 8 可用的通知合同和通用格式。 */
public interface TaskNotifier {
    /**
     * 发送通知。
     *
     * @param message 通知内容
     */
    void send(String message);

    /**
     * 发送准备完成通知。
     *
     * @param id 工作项编号
     * @param title 工作项标题
     */
    default void sendReady(int id, String title) {
        send("工作项 #" + id + " 已准备：" + title);
    }

    /**
     * 返回通道名称。
     *
     * @return 通道名称
     */
    static String channelName() {
        return "控制台";
    }
}
```

### 3. 一个类可以实现多项接口

类只能 `extends` 一个直接父类，却可以在 `implements` 后用逗号列出多个接口：

```java
/** 声明通道就绪检查合同。 */
public interface ReadyCheck {
    /**
     * 返回通道是否可用。
     *
     * @return 可用时返回 true
     */
    boolean ready();
}

/** 同时提供发送和就绪检查。 */
public class ConsoleTaskNotifier implements TaskNotifier, ReadyCheck {
    /**
     * 输出通知。
     *
     * @param message 通知内容
     */
    @Override
    public void send(String message) {
        System.out.println(message);
    }

    /**
     * 返回控制台通道是否可用。
     *
     * @return 本例固定返回 true
     */
    @Override
    public boolean ready() {
        return true;
    }
}
```

多个接口表示一个具体类同时完成多项行为合同，并不会获得多份父类实例状态。接口字段隐式为
`public static final`，必须在声明时赋值且不能修改；每个对象各自变化的值应放进类或抽象类。

## 三、在抽象类与接口之间选择

### 1. 先判断要复用状态还是组合行为

| 判断点 | 抽象类 | 接口 |
| --- | --- | --- |
| 保存每个对象自己的字段 | 可以 | 不可以，字段只能是常量 |
| 提供构造器 | 可以，由子类构造器调用 | 不可以 |
| 提供已有实现 | 普通具体方法 | default、static 和受版本限制的 private 方法 |
| 一个类可同时采用的数量 | 只能直接 extends 一个类 | 可以 implements 多个接口 |
| 适合表达 | 同一家族共享状态、构造过程和实现 | 不同类都能承诺的行为能力 |

TeamFlow 工作项要统一保存编号和标题，适合抽象类；通知发送与就绪检查只约束行为，适合接口。同一个
具体类也可以先 `extends` 一个父类，再 `implements` 多个接口，语法顺序不能颠倒。

### 2. 不为每个类机械创建接口

抽象类和接口都用于表达真实边界。只有一个具体实现、没有对外合同价值时，普通方法通常已经足够；
仅为了“看起来更面向对象”增加接口，会让学习者多追踪一层声明。

本课到此只建立合同。后面的完整程序仍使用 `ReleaseWorkItem` 和 `ConsoleTaskNotifier` 等具体类型；同一个
父类型变量如何接收不同对象、调用时如何选择实际实现，将由下一课单独解释。

## 四、运行完整的 TeamFlow 抽象程序

### 1. JDK 25 完整程序

在 JDK 25 项目的 `src/teamflow` 中创建 `TeamFlowAbstractApplication.java`，填入完整代码：

```java
package teamflow;

/** 保存 TeamFlow 工作项共有状态和摘要合同。 */
abstract class AbstractWorkItem {
    private final int id;
    private final String title;

    /**
     * 初始化工作项共有状态。
     *
     * @param id 工作项编号
     * @param title 工作项标题
     */
    protected AbstractWorkItem(int id, String title) {
        this.id = id;
        this.title = title;
    }

    /**
     * 返回可供子类复用的基础摘要。
     *
     * @return 基础摘要
     */
    protected String baseSummary() {
        return "工作项 #" + id + "：" + title;
    }

    /**
     * 返回完整摘要。
     *
     * @return 完整摘要
     */
    public abstract String summary();
}

/** 表示带版本号的发布工作项。 */
final class ReleaseWorkItem extends AbstractWorkItem {
    private final String version;

    /**
     * 创建发布工作项。
     *
     * @param id 工作项编号
     * @param title 工作项标题
     * @param version 发布版本
     */
    ReleaseWorkItem(int id, String title, String version) {
        super(id, title);
        this.version = version;
    }

    /**
     * 返回带版本号的摘要。
     *
     * @return 发布摘要
     */
    @Override
    public String summary() {
        return baseSummary() + "，版本 " + version;
    }
}

/** 声明通知发送合同和通用格式。 */
interface TaskNotifier {
    /**
     * 发送通知。
     *
     * @param message 通知内容
     */
    void send(String message);

    /**
     * 发送准备完成通知。
     *
     * @param id 工作项编号
     * @param title 工作项标题
     */
    default void sendReady(int id, String title) {
        send(formatReady(id, title));
    }

    /**
     * 返回通道名称。
     *
     * @return 通道名称
     */
    static String channelName() {
        return "控制台";
    }

    /**
     * 生成准备完成消息。
     *
     * @param id 工作项编号
     * @param title 工作项标题
     * @return 准备完成消息
     */
    private String formatReady(int id, String title) {
        return "工作项 #" + id + " 已准备：" + title;
    }
}

/** 声明通道就绪检查合同。 */
interface ReadyCheck {
    /**
     * 返回通道是否可用。
     *
     * @return 可用时返回 true
     */
    boolean ready();
}

/** 提供控制台通知和就绪检查。 */
final class ConsoleTaskNotifier implements TaskNotifier, ReadyCheck {
    /**
     * 输出通知。
     *
     * @param message 通知内容
     */
    @Override
    public void send(String message) {
        System.out.println("TeamFlow 通知：" + message);
    }

    /**
     * 返回控制台通道是否可用。
     *
     * @return 本例固定返回 true
     */
    @Override
    public boolean ready() {
        return true;
    }
}

/** 运行 TeamFlow 抽象类与接口示例。 */
public class TeamFlowAbstractApplication {
    /**
     * 创建发布工作项并发送准备完成通知。
     *
     * @param args 命令行参数，本例不读取
     */
    public static void main(String[] args) {
        ReleaseWorkItem item = new ReleaseWorkItem(4001, "发布 TeamFlow 1.0", "1.0.0");
        ConsoleTaskNotifier notifier = new ConsoleTaskNotifier();

        System.out.println(item.summary());
        System.out.println("通知通道：" + TaskNotifier.channelName());
        if (notifier.ready()) {
            notifier.sendReady(4001, "发布 TeamFlow 1.0");
        }
    }
}
```

确认 IDEA 的 Project SDK、模块 SDK 和运行配置 JRE 都是 JDK 25，再运行
`teamflow.TeamFlowAbstractApplication`。也可在项目根目录执行：

```bash
mkdir -p out-25-abstract
javac -encoding UTF-8 -d out-25-abstract src/teamflow/TeamFlowAbstractApplication.java
java -cp out-25-abstract teamflow.TeamFlowAbstractApplication
```

预期输出：

```text
工作项 #4001：发布 TeamFlow 1.0，版本 1.0.0
通知通道：控制台
TeamFlow 通知：工作项 #4001 已准备：发布 TeamFlow 1.0
```

### 2. Java 8 完整程序

Java 8 项目把 Project SDK、模块 SDK 和运行配置 JRE 都选为 JDK 8。源文件路径和类名不变，完整代码如下：

```java
package teamflow;

/** 保存 TeamFlow 工作项共有状态和摘要合同。 */
abstract class AbstractWorkItem {
    private final int id;
    private final String title;

    /**
     * 初始化工作项共有状态。
     *
     * @param id 工作项编号
     * @param title 工作项标题
     */
    protected AbstractWorkItem(int id, String title) {
        this.id = id;
        this.title = title;
    }

    /**
     * 返回可供子类复用的基础摘要。
     *
     * @return 基础摘要
     */
    protected String baseSummary() {
        return "工作项 #" + id + "：" + title;
    }

    /**
     * 返回完整摘要。
     *
     * @return 完整摘要
     */
    public abstract String summary();
}

/** 表示带版本号的发布工作项。 */
final class ReleaseWorkItem extends AbstractWorkItem {
    private final String version;

    /**
     * 创建发布工作项。
     *
     * @param id 工作项编号
     * @param title 工作项标题
     * @param version 发布版本
     */
    ReleaseWorkItem(int id, String title, String version) {
        super(id, title);
        this.version = version;
    }

    /**
     * 返回带版本号的摘要。
     *
     * @return 发布摘要
     */
    @Override
    public String summary() {
        return baseSummary() + "，版本 " + version;
    }
}

/** 声明 Java 8 可用的通知合同和通用格式。 */
interface TaskNotifier {
    /**
     * 发送通知。
     *
     * @param message 通知内容
     */
    void send(String message);

    /**
     * 发送准备完成通知。
     *
     * @param id 工作项编号
     * @param title 工作项标题
     */
    default void sendReady(int id, String title) {
        send("工作项 #" + id + " 已准备：" + title);
    }

    /**
     * 返回通道名称。
     *
     * @return 通道名称
     */
    static String channelName() {
        return "控制台";
    }
}

/** 声明通道就绪检查合同。 */
interface ReadyCheck {
    /**
     * 返回通道是否可用。
     *
     * @return 可用时返回 true
     */
    boolean ready();
}

/** 提供控制台通知和就绪检查。 */
final class ConsoleTaskNotifier implements TaskNotifier, ReadyCheck {
    /**
     * 输出通知。
     *
     * @param message 通知内容
     */
    @Override
    public void send(String message) {
        System.out.println("TeamFlow 通知：" + message);
    }

    /**
     * 返回控制台通道是否可用。
     *
     * @return 本例固定返回 true
     */
    @Override
    public boolean ready() {
        return true;
    }
}

/** 运行 TeamFlow 抽象类与接口示例。 */
public class TeamFlowAbstractApplication {
    /**
     * 创建发布工作项并发送准备完成通知。
     *
     * @param args 命令行参数，本例不读取
     */
    public static void main(String[] args) {
        ReleaseWorkItem item = new ReleaseWorkItem(4001, "发布 TeamFlow 1.0", "1.0.0");
        ConsoleTaskNotifier notifier = new ConsoleTaskNotifier();

        System.out.println(item.summary());
        System.out.println("通知通道：" + TaskNotifier.channelName());
        if (notifier.ready()) {
            notifier.sendReady(4001, "发布 TeamFlow 1.0");
        }
    }
}
```

Java 8 不含私有接口方法，格式拼接已内联到 `sendReady()`，其他代码保持相同。运行命令使用独立输出目录：

```bash
mkdir -p out-8-abstract
javac -encoding UTF-8 -d out-8-abstract src/teamflow/TeamFlowAbstractApplication.java
java -cp out-8-abstract teamflow.TeamFlowAbstractApplication
```

预期仍输出上面的三行。IDEA 的 Project SDK、模块 SDK、运行配置 JRE 任一仍指向其他版本，都可能让
编辑器检查与实际运行结果不一致；运行前应分别核对这三处，而不是只看终端的 `java -version`。

### 3. 读懂关键执行过程

创建 `ReleaseWorkItem` 时先执行抽象父类构造器，保存编号和标题，再保存子类版本号。调用具体对象的
`summary()` 时，子类实现复用 `baseSummary()` 并追加版本。`ConsoleTaskNotifier` 同时完成发送和就绪
检查合同，还直接获得接口的 `sendReady()` 默认实现；接口静态方法则用 `TaskNotifier.channelName()` 调用。

这里没有创建抽象类或接口对象，也没有把具体对象赋给父类型变量。输出来自各个已经完成的具体类，验证的
是抽象合同已补齐、共有实现可复用、多个接口合同可同时完成。

## 五、处理抽象合同中的常见错误

### 七个典型错误

:::pitfalls
### 直接创建抽象类对象

**触发条件：** 对带 `abstract` 的类使用 `new`。

**原因：** 抽象类表示尚未完整实现的类型，语言禁止直接实例化。

**后果：** 编译失败，程序无法启动。

**错误示例：**

```java
abstract class WorkItem {}
WorkItem item = new WorkItem();
```

**正确写法：**

```java
abstract class WorkItem {}
final class ReleaseWorkItem extends WorkItem {}
ReleaseWorkItem item = new ReleaseWorkItem();
```

**验证方式：** JDK 25 与 Java 8 都应拒绝错误写法；创建补齐合同的具体子类应编译通过。

### 具体子类漏掉抽象方法

**触发条件：** 具体子类继承抽象方法，却没有实现它，也没有把自身声明为 `abstract`。

**原因：** 可创建对象的具体类必须完成继承到的全部抽象合同。

**后果：** 编译器指出子类不是抽象类，却没有覆盖指定方法。

**错误示例：**

```java
abstract class WorkItem {
    /** @return 工作项摘要 */
    public abstract String summary();
}
final class ReleaseWorkItem extends WorkItem {}
```

**正确写法：**

```java
abstract class WorkItem {
    /** @return 工作项摘要 */
    public abstract String summary();
}
final class ReleaseWorkItem extends WorkItem {
    /** @return 发布摘要 */
    @Override
    public String summary() {
        return "发布工作项";
    }
}
```

**验证方式：** 两个版本都应拒绝错误子类；补上签名完全一致的 `summary()` 后应编译通过。

### 实现接口方法时漏写 public

**触发条件：** 实现公开接口方法时省略 `public`。

**原因：** 省略访问修饰符会得到包可见方法，比接口的公开合同更弱。

**后果：** 编译器报告正在尝试分配更弱的访问权限。

**错误示例：**

```java
interface Notifier {
    /** @param message 通知内容 */
    void send(String message);
}
final class ConsoleNotifier implements Notifier {
    /** @param message 通知内容 */
    @Override
    void send(String message) {}
}
```

**正确写法：**

```java
interface Notifier {
    /** @param message 通知内容 */
    void send(String message);
}
final class ConsoleNotifier implements Notifier {
    /** @param message 通知内容 */
    @Override
    public void send(String message) {}
}
```

**验证方式：** 两个版本都应拒绝错误实现；加回 `public` 后应编译通过。

### 把接口常量当成可变字段

**触发条件：** 声明接口常量后尝试重新赋值。

**原因：** 接口字段隐式为 `public static final`，不是对象各自拥有的可变状态。

**后果：** 编译器报告不能给 final 变量重新赋值。

**错误示例：**

```java
interface RetryPolicy {
    int MAX_RETRIES = 3;
}
RetryPolicy.MAX_RETRIES = 5;
```

**正确写法：**

```java
interface RetryPolicy {
    int MAX_RETRIES = 3;
}
System.out.println(RetryPolicy.MAX_RETRIES);
```

**验证方式：** 把赋值或输出语句放进最小入口；两个版本都应拒绝重新赋值，仅读取时输出 `3`。

### 给接口普通抽象方法添加方法体

**触发条件：** 接口方法带大括号，却没有 `default`、`static` 或版本允许的 `private` 修饰符。

**原因：** 普通接口方法声明是抽象合同，不能直接带方法体。

**后果：** 编译器拒绝非法的方法体。

**错误示例：**

```java
interface Notifier {
    /** @param message 通知内容 */
    void send(String message) {
        System.out.println(message);
    }
}
```

**正确写法：**

```java
interface Notifier {
    /** @param message 通知内容 */
    default void send(String message) {
        System.out.println(message);
    }
}
```

**验证方式：** 两个版本都应拒绝错误接口；加上 `default` 后应编译通过并能由具体实现类对象调用。

### 把私有接口方法复制到 Java 8

**触发条件：** Java 8 项目的接口包含 `private` 方法。

**原因：** 私有接口方法从 Java 9 才可用，Java 8 尚未支持。

**后果：** 同一段代码在 JDK 25 编译通过，在 Java 8 编译失败。

**错误示例：**

```java
interface LegacyNotifier {
    /** @return 准备完成消息 */
    default String readyMessage() {
        return format();
    }

    /** @return 内部格式 */
    private String format() {
        return "工作项已准备";
    }
}
```

**正确写法：**

```java
interface LegacyNotifier {
    /** @return 准备完成消息 */
    default String readyMessage() {
        return "工作项已准备";
    }
}
```

**验证方式：** 错误栏用 JDK 25 编译应通过，用 Java 8 编译应失败；内联逻辑后两个版本都应通过。

### 尝试同时继承两个类

**触发条件：** 在一个类的 `extends` 后写两个父类。

**原因：** Java 类只有一个直接父类；独立行为组合应使用多个接口。

**后果：** 类声明语法无法通过编译。

**错误示例：**

```java
abstract class Sender {}
abstract class Checker {}
final class Combined extends Sender, Checker {}
```

**正确写法：**

```java
interface Sender {
    /** @param message 通知内容 */
    void send(String message);
}
interface Checker {
    /** @return 可用时返回 true */
    boolean ready();
}
final class Combined implements Sender, Checker {
    /** @param message 通知内容 */
    @Override
    public void send(String message) {}

    /** @return 本例固定返回 true */
    @Override
    public boolean ready() {
        return true;
    }
}
```

**验证方式：** 两个版本都应拒绝错误类声明；正确类完成两个公开方法后应编译通过。
:::

## 六、练习：建立 TeamFlow 复核消息合同

:::exercise
### TeamFlow 复核消息

**要求：** 创建抽象类 `AbstractTaskMessage`，保存任务编号和标题，提供 `protected baseMessage()`，并声明
抽象的公开 `message()`。具体类 `ReviewTaskMessage` 增加复核人并实现完整消息。接口 `MessagePrinter`
声明 `print(String)`，用 default 方法 `printTeamFlow(String)` 添加 `TeamFlow：` 前缀，由
`ConsoleMessagePrinter` 公开实现输出。不要使用父类型变量、类型转换、集合或后续框架。

**验收：** 入口使用编号 `5001`、标题“检查接口清单”、复核人“阿宁”，最终输出
`TeamFlow：任务 #5001：检查接口清单，复核人 阿宁`。抽象类不能直接创建，具体子类必须完成
`message()`，接口实现方法必须是 `public`。

**参考答案：** JDK 25 与 Java 8 的完整源码、运行步骤和预期输出见下方；练习只使用两版共有语法。
:::

### 1. JDK 25 参考实现

在 `src/teamflow` 中创建 `TeamFlowAbstractExerciseApplication.java`：

```java
package teamflow;

/** 保存任务消息共有状态和消息合同。 */
abstract class AbstractTaskMessage {
    private final int taskId;
    private final String title;

    /**
     * 初始化任务消息共有状态。
     *
     * @param taskId 任务编号
     * @param title 任务标题
     */
    protected AbstractTaskMessage(int taskId, String title) {
        this.taskId = taskId;
        this.title = title;
    }

    /**
     * 返回可供子类复用的基础消息。
     *
     * @return 基础消息
     */
    protected String baseMessage() {
        return "任务 #" + taskId + "：" + title;
    }

    /**
     * 返回完整消息。
     *
     * @return 完整消息
     */
    public abstract String message();
}

/** 表示带复核人的任务消息。 */
final class ReviewTaskMessage extends AbstractTaskMessage {
    private final String reviewer;

    /**
     * 创建复核任务消息。
     *
     * @param taskId 任务编号
     * @param title 任务标题
     * @param reviewer 复核人
     */
    ReviewTaskMessage(int taskId, String title, String reviewer) {
        super(taskId, title);
        this.reviewer = reviewer;
    }

    /**
     * 返回带复核人的完整消息。
     *
     * @return 复核消息
     */
    @Override
    public String message() {
        return baseMessage() + "，复核人 " + reviewer;
    }
}

/** 声明消息打印合同和默认前缀。 */
interface MessagePrinter {
    /**
     * 打印消息。
     *
     * @param message 消息内容
     */
    void print(String message);

    /**
     * 添加 TeamFlow 前缀后打印。
     *
     * @param message 消息内容
     */
    default void printTeamFlow(String message) {
        print("TeamFlow：" + message);
    }
}

/** 把消息打印到控制台。 */
final class ConsoleMessagePrinter implements MessagePrinter {
    /**
     * 输出消息。
     *
     * @param message 消息内容
     */
    @Override
    public void print(String message) {
        System.out.println(message);
    }
}

/** 运行 TeamFlow 复核消息练习。 */
public class TeamFlowAbstractExerciseApplication {
    /**
     * 创建复核消息并输出。
     *
     * @param args 命令行参数，本例不读取
     */
    public static void main(String[] args) {
        ReviewTaskMessage message = new ReviewTaskMessage(5001, "检查接口清单", "阿宁");
        ConsoleMessagePrinter printer = new ConsoleMessagePrinter();
        printer.printTeamFlow(message.message());
    }
}
```

在 JDK 25 配置下运行入口，或执行：

```bash
mkdir -p out-25-abstract-exercise
javac -encoding UTF-8 -d out-25-abstract-exercise src/teamflow/TeamFlowAbstractExerciseApplication.java
java -cp out-25-abstract-exercise teamflow.TeamFlowAbstractExerciseApplication
```

预期输出：

```text
TeamFlow：任务 #5001：检查接口清单，复核人 阿宁
```

### 2. Java 8 参考实现

Java 8 项目选择 JDK 8 后，使用完整源码：

```java
package teamflow;

/** 保存任务消息共有状态和消息合同。 */
abstract class AbstractTaskMessage {
    private final int taskId;
    private final String title;

    /**
     * 初始化任务消息共有状态。
     *
     * @param taskId 任务编号
     * @param title 任务标题
     */
    protected AbstractTaskMessage(int taskId, String title) {
        this.taskId = taskId;
        this.title = title;
    }

    /**
     * 返回可供子类复用的基础消息。
     *
     * @return 基础消息
     */
    protected String baseMessage() {
        return "任务 #" + taskId + "：" + title;
    }

    /**
     * 返回完整消息。
     *
     * @return 完整消息
     */
    public abstract String message();
}

/** 表示带复核人的任务消息。 */
final class ReviewTaskMessage extends AbstractTaskMessage {
    private final String reviewer;

    /**
     * 创建复核任务消息。
     *
     * @param taskId 任务编号
     * @param title 任务标题
     * @param reviewer 复核人
     */
    ReviewTaskMessage(int taskId, String title, String reviewer) {
        super(taskId, title);
        this.reviewer = reviewer;
    }

    /**
     * 返回带复核人的完整消息。
     *
     * @return 复核消息
     */
    @Override
    public String message() {
        return baseMessage() + "，复核人 " + reviewer;
    }
}

/** 声明消息打印合同和默认前缀。 */
interface MessagePrinter {
    /**
     * 打印消息。
     *
     * @param message 消息内容
     */
    void print(String message);

    /**
     * 添加 TeamFlow 前缀后打印。
     *
     * @param message 消息内容
     */
    default void printTeamFlow(String message) {
        print("TeamFlow：" + message);
    }
}

/** 把消息打印到控制台。 */
final class ConsoleMessagePrinter implements MessagePrinter {
    /**
     * 输出消息。
     *
     * @param message 消息内容
     */
    @Override
    public void print(String message) {
        System.out.println(message);
    }
}

/** 运行 TeamFlow 复核消息练习。 */
public class TeamFlowAbstractExerciseApplication {
    /**
     * 创建复核消息并输出。
     *
     * @param args 命令行参数，本例不读取
     */
    public static void main(String[] args) {
        ReviewTaskMessage message = new ReviewTaskMessage(5001, "检查接口清单", "阿宁");
        ConsoleMessagePrinter printer = new ConsoleMessagePrinter();
        printer.printTeamFlow(message.message());
    }
}
```

Java 8 版不需要改代码，因为练习没有私有接口方法。确认 Project SDK、模块 SDK 和运行配置 JRE 都是
JDK 8，再执行：

```bash
mkdir -p out-8-abstract-exercise
javac -encoding UTF-8 -d out-8-abstract-exercise src/teamflow/TeamFlowAbstractExerciseApplication.java
java -cp out-8-abstract-exercise teamflow.TeamFlowAbstractExerciseApplication
```

预期输出仍是 `TeamFlow：任务 #5001：检查接口清单，复核人 阿宁`，这同时证明抽象子类补齐了消息合同，
接口实现保留了公开可见性，默认方法也通过具体打印器完成了输出。
