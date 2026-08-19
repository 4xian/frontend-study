---
id: backend.java.learn.basics.interfaces-inheritance-and-polymorphism
type: lesson
title: 继承与方法重写
summary: 用 TeamFlow 工作项示例理解 extends、super 和 @Override，建立清晰的父子类边界
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 90
prerequisites:
  - backend.java.learn.basics.task-domain-modeling-project
objectives:
  - 能用 extends 表达一个直接的父子类关系，并指出父类与子类各自承担的职责。
  - 能区分可继承成员、构造器和 private 成员的边界。
  - 能在子类构造器中用 super(...) 初始化父类部分，并解释 Java 8 第一条语句限制与 JDK 25 的差异。
  - '能用 super.method() 保留父类行为，再用 @Override 替换需要变化的实例方法。'
  - 能检查重写的方法签名、返回类型和可见性，并与重载做最小区分。
  - 能说明 final 类和 final 方法为什么不能继续扩展或重写，并在 JDK 25 与 Java 8 中运行完整程序。
recap:
  - extends 建立单一直接父类关系；子类可以复用可见成员并补充自己的状态和行为。
  - 构造器不属于可继承成员；子类构造器用 super(...) 先初始化父类部分。
  - private 成员不能在子类中直接访问，子类应调用父类提供的可见方法。
  - '@Override 让编译器检查重写意图；重写保持方法签名和不降低可见性。'
  - super.method() 可以在重写后继续使用父类实现；重载只是新增不同参数的方法。
  - final 类不能被 extends，final 方法不能被子类重写；本课示例在两个版本中使用相同传统语法。
related: []
tags:
  - Java
  - 继承
  - 方法重写
  - super
  - Override
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 使用同一组传统继承语法
verifiedAt: 2026-08-17
sources:
  - id: dev-java-inheritance
    title: Inheritance - Dev.java
    url: https://dev.java/learn/inheritance/what-is-inheritance
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java；Java SE
    claims:
      - 子类可以继承父类的可见成员，构造器不是成员，不会被继承
      - private 成员不能由子类直接访问，子类可以通过父类提供的可见方法使用相关状态
      - 子类可以添加成员，也可以声明同签名实例方法进行重写
  - id: dev-java-overriding
    title: Overriding and Hiding Methods - Dev.java
    url: https://dev.java/learn/inheritance/overriding/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java；Java SE
    claims:
      - 实例方法重写要求名称、参数个数和参数类型相同，返回类型相同或为协变返回类型
      - '@Override 会让编译器检查方法是否真的重写了超类型方法'
      - 不同参数的方法属于重载，不是重写
  - id: oracle-java-subclasses
    title: Inheritance - Oracle Java Tutorials
    url: https://docs.oracle.com/javase/tutorial/java/IandI/subclasses.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java 8 教程；本课使用的继承成员边界
    claims:
      - Java 8 中父类和子类的单类继承、可见成员和 private 边界与本课示例一致
  - id: oracle-java-super
    title: Using the Keyword super - Oracle Java Tutorials
    url: https://docs.oracle.com/javase/tutorial/java/IandI/super.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java 8 教程；super 构造器与父类方法调用
    claims:
      - super(...) 调用父类构造器且必须是子类构造器的第一句
      - super.method() 可以调用被子类重写的父类实例方法
  - id: oracle-java-override
    title: Overriding and Hiding Methods - Oracle Java Tutorials
    url: https://docs.oracle.com/javase/tutorial/java/IandI/override.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java 8 教程；重写签名与访问权限
    claims:
      - 重写方法应保持父类方法的签名和返回类型合同
      - 重写方法可以扩大但不能缩小父类方法的可见性
  - id: jls-25-classes
    title: Java Language Specification 25 - Classes
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - extends、构造器调用、方法重写、final 类和 final 方法的语言规则
  - id: jls-8-classes
    title: Java Language Specification 8 - Classes
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - 本课使用的 extends、super、@Override 和 final 规则在 Java 8 中成立
  - id: jep-513-flexible-constructor-bodies
    title: "JEP 513: Flexible Constructor Bodies"
    url: https://openjdk.org/jeps/513
    sourceOrigin: official
    sourceType: release-note
    appliesTo: JDK 25；Java 25 语言变化
    claims:
      - JDK 25 允许在显式 super(...) 或 this(...) 前放置受限的安全语句，并允许简单赋值给本类声明且没有初始化器的字段
      - 为兼容 Java 8，本课主示例仍把 super(...) 写成构造器第一句
  - id: stackoverflow-super-first-statement
    title: call to super() must be the first statement in constructor body - Stack Overflow
    url: https://stackoverflow.com/questions/26169044/call-to-super-must-be-the-first-statement-in-constructor-body
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 构造器常见误用；JDK 25 差异由 JEP 513 核验
    claims:
      - Java 8 在 super(...) 前写普通语句会触发构造器调用必须为第一句的编译错误
  - id: stackoverflow-override-annotation
    title: When do you use Java's @Override annotation and why? - Stack Overflow
    url: https://stackoverflow.com/questions/94361/when-do-you-use-java-s-override-annotation-and-why
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 重写签名的真实初学者误区
    claims:
      - '@Override 能把方法名或参数签名偏差尽早暴露为编译错误'
---

# 继承与方法重写

前置实战已经建立了一个不能被继承的 `final Task`，本课不会修改或重复创建它。为了只观察继承规则，
我们会另建一组相互隔离的 `WorkItem`、`TaskItem` 示例：把确实共有的部分放进父类，再让子类增加自己的
信息或重写需要变化的行为。学完后，两组示例仍各自独立。

本课只建立一条简单的父子类关系。我们会看到 `extends`、`private` 边界、`super(...)`、`super.method()`、
`@Override` 和 `final`，并在最后运行一个完整的 TeamFlow 工作项程序。接口、抽象类、父类型引用、动态
分派、向上或向下转换属于后续课程，本课不展开。

## 一、从 TeamFlow 工作项划分父子类

### 1. 先找真正共享的部分

假设 TeamFlow 现在有两种工作项：普通任务和发布任务。两者都需要编号、标题和一行摘要，但发布任务还
需要版本号。可以把共同资料放进 `WorkItem`，把发布专属资料放进 `ReleaseItem`：

```java
/** 保存所有 TeamFlow 工作项共有的身份和标题。 */
public class WorkItem {
    private final int id;
    private final String title;

    /**
     * 创建一个工作项。
     *
     * @param id 工作项编号
     * @param title 工作项标题
     */
    public WorkItem(int id, String title) {
        this.id = id;
        this.title = title;
    }

    /**
     * 返回工作项编号。
     *
     * @return 工作项编号
     */
    public int id() {
        return id;
    }

    /**
     * 返回工作项标题。
     *
     * @return 工作项标题
     */
    public String title() {
        return title;
    }

    /**
     * 返回共同的摘要文字。
     *
     * @return 工作项摘要
     */
    public String summary() {
        return "工作项 #" + id + "：" + title;
    }
}
```

子类声明为 `class ReleaseItem extends WorkItem`。这表示一个发布工作项也是一个工作项，并可以使用父类
提供的 `public` 方法。`id` 和 `title` 仍由父类保存，子类只增加版本号，避免重复维护相同字段。

### 2. `extends` 只建立一个直接父类

Java 类只能声明一个直接父类：

```java
/** 表示带版本号的 TeamFlow 发布工作项。 */
public class ReleaseItem extends WorkItem {
    private final String version;

    /**
     * 创建一个发布工作项。
     *
     * @param id 工作项编号
     * @param title 工作项标题
     * @param version 发布版本号
     */
    public ReleaseItem(int id, String title, String version) {
        super(id, title);
        this.version = version;
    }
}
```

`ReleaseItem` 只能写一个 `extends WorkItem`，不能同时 `extends WorkItem, OtherItem`。本课先把父子关系保持
在一个很短的链条里：父类负责共同身份和标题，子类负责版本号及其展示。多种能力的组合留到接口课程。

### 3. 可继承成员、构造器和 `private`

父类的 `public`、`protected` 成员可以按 Java 的访问规则在子类中使用；同包的包级成员还受包边界影响。父类
构造器不是成员，所以不会被子类继承，子类必须通过 `super(...)` 调用它。父类的 `private` 字段也不能在
子类中直接写：

```java
/** 说明 private 字段只能由 WorkItem 自己直接访问。 */
public class ReleaseItem extends WorkItem {
    /**
     * 错误示例：子类不能直接读取父类的 private id。
     *
     * @return 说明文字
     */
    public String wrongSummary() {
        // return "#" + id; // 编译错误：id 在 WorkItem 中是 private
        return "请调用父类提供的 id() 方法";
    }
}
```

这里的正确做法是调用 `id()`、`title()` 或其他父类明确公开的行为。这样父类仍然能决定身份的保存方式，子类
不需要依赖父类的内部字段布局。

## 二、用 `super` 初始化父类并复用父类行为

### 1. `super(...)` 先完成父类构造

创建子类对象时，先要把父类那一部分初始化完成。Java 8 要求子类构造器中的 `super(...)` 是第一句；JDK 25
通过 JEP 513 支持“灵活构造器体”，允许在显式 `super(...)` 前放置不访问当前对象的安全语句。为了让同一份
代码也能在 Java 8 中运行，本课所有主程序都采用两版共同支持的传统写法，把 `super(...)` 保持为第一句：

```java
/** 表示带版本号的发布工作项。 */
public class ReleaseItem extends WorkItem {
    private final String version;

    /**
     * 先初始化 WorkItem，再初始化 ReleaseItem 自己的字段。
     *
     * @param id 工作项编号
     * @param title 工作项标题
     * @param version 发布版本号
     */
    public ReleaseItem(int id, String title, String version) {
        super(id, title);
        this.version = version;
    }
}
```

执行 `new ReleaseItem(2001, "发布看板", "2026.08")` 时，`super(id, title)` 先把 `WorkItem` 的 `id` 和
`title` 设好，然后当前构造器才设置 `version`。JDK 25 的前置语句不能读取 `this`、调用实例方法或访问
`super`；如果需要兼容 Java 8，直接把准备工作写在 `super(...)` 后面或使用本课的传统顺序。如果父类有一个
无参数构造器而子类没有写 `super(...)`，Java 会隐式尝试调用 `super()`；但只要父类没有可访问的无参数构造器，
就必须显式传入所需参数。

### 2. `super.method()` 保留父类摘要

子类可以用相同签名的方法替换父类行为，同时通过 `super.method()` 复用父类已经完成的部分：

```java
/** 表示带版本号的发布工作项。 */
public class ReleaseItem extends WorkItem {
    private final String version;

    /**
     * 创建发布工作项。
     *
     * @param id 工作项编号
     * @param title 工作项标题
     * @param version 发布版本号
     */
    public ReleaseItem(int id, String title, String version) {
        super(id, title);
        this.version = version;
    }

    /**
     * 在共同摘要后补充发布版本。
     *
     * @return 带版本号的发布摘要
     */
    @Override
    public String summary() {
        return super.summary() + "，版本 " + version;
    }
}
```

运行 `summary()` 时会先得到父类的“工作项编号和标题”，再拼接子类自己的版本号。`super.summary()` 是
明确指定父类实现的调用，不会再次调用当前这个重写方法。

### 3. `final` 保护不应被改写的规则

如果某个类的规则必须保持完整，可以声明为 `final`，任何类都不能再 `extends` 它。如果某个方法的行为不
允许被子类替换，可以声明为 `final`：

```java
/** 不允许再扩展的系统工作项。 */
public final class SystemWorkItem {
    /**
     * 返回固定的来源标记。
     *
     * @return 系统来源标记
     */
    public final String source() {
        return "system";
    }
}

// class CustomSystemWorkItem extends SystemWorkItem {} // 编译错误：final 类不能被继承
```

`final` 不是“所有类都应该加”的装饰。只有当父类明确不允许扩展时才使用；本课用它帮助你读懂已有类的
扩展边界。

## 三、正确重写方法并区分重载

### 1. `@Override` 检查重写意图

重写要求方法名、参数列表和返回类型合同与父类一致。推荐始终写 `@Override`，让编译器检查拼写和签名：

```java
/** 表示普通 TeamFlow 任务。 */
public class TaskItem extends WorkItem {
    private final String assignee;

    /**
     * 创建普通任务。
     *
     * @param id 工作项编号
     * @param title 工作项标题
     * @param assignee 负责人
     */
    public TaskItem(int id, String title, String assignee) {
        super(id, title);
        this.assignee = assignee;
    }

    /**
     * 在共同摘要后补充负责人。
     *
     * @return 带负责人的任务摘要
     */
    @Override
    public String summary() {
        return super.summary() + "，负责人 " + assignee;
    }
}
```

如果把方法写成 `summray()`，加上 `@Override` 后编译器会直接指出它没有重写父类方法。没有注解时，这个
拼写错误可能只是一个新方法，调用父类已有的 `summary()` 时仍然看到旧输出。

**社区补充：** Stack Overflow 上的真实问题反复出现两种情况：Java 8 构造器把普通语句放到
`super(...)` 前面，以及以为拼错名称的方法已经重写父类。需要兼容 JDK 25 与 Java 8 时，把
`super(...)` 写在第一句最直接；JDK 25 对安全前置语句的放宽见后文版本对照。名称或参数写错时则应保留
`@Override` 并按父类签名修正，而不是删除注解绕过检查。

### 2. 重写不能缩小可见性

父类公开的 `public` 方法在子类中仍必须至少公开；不能把它改成 `protected` 或 `private`。重写方法的返回
类型可以与父类方法相同，也可以是父类返回类型的子类型，这叫协变返回类型；除此之外不能随意换成不兼容
类型。本课的 `summary()` 使用完全相同的 `String` 返回类型：

```java
/** 展示可见性合同。 */
public class VisibleTaskItem extends WorkItem {
    /**
     * 创建公开的任务摘要。
     *
     * @param id 工作项编号
     * @param title 工作项标题
     */
    public VisibleTaskItem(int id, String title) {
        super(id, title);
    }

    /**
     * 错误示例不能把 public 重写成 protected。
     *
     * @return 摘要文字
     */
    @Override
    public String summary() {
        return super.summary() + "，已核对";
    }
}
```

将上面的 `public` 改成 `protected` 或 `private` 后，编译器会拒绝代码。实际项目中，IDEA 的“Override
Methods”生成动作可以减少手写签名时的拼写错误，但它不会替你决定父子类是否真的合理。

如果父类方法返回 `WorkItem`，子类可以把返回类型收窄为 `TaskItem`，因为 `TaskItem` 是 `WorkItem` 的
子类。下面两个方法分别放在对应类中时，就是最小的协变返回示例：

```java
/**
 * 返回当前工作项。
 *
 * @return 当前工作项
 */
public WorkItem currentItem() {
    return this;
}
```

```java
/**
 * 返回当前任务项。
 *
 * @return 当前任务项
 */
@Override
public TaskItem currentItem() {
    return this;
}
```

若把子类返回类型改成与 `WorkItem` 没有父子关系的类型，编译器会拒绝重写。本课只用这个片段说明返回类型
合同，不展开父类型引用和多态调用。

### 3. 重载只是另一组参数

同一个类可以同时拥有 `summary()` 和 `summary(String prefix)`，后者是重载，不会替换前者：

```java
/** 展示重载与重写的最小差别。 */
public class LabelledTaskItem extends WorkItem {
    /**
     * 创建带标签的任务。
     *
     * @param id 工作项编号
     * @param title 工作项标题
     */
    public LabelledTaskItem(int id, String title) {
        super(id, title);
    }

    /**
     * 重写父类的无参数摘要。
     *
     * @return 任务摘要
     */
    @Override
    public String summary() {
        return super.summary() + "，类型任务";
    }

    /**
     * 新增带前缀的重载方法。
     *
     * @param prefix 展示前缀
     * @return 带前缀的摘要
     */
    public String summary(String prefix) {
        return prefix + summary();
    }
}
```

调用方传不传 `prefix` 会选择不同参数列表；这不是父子类之间的替换关系。更复杂的调用选择和多态规则留
给后续课程。

## 四、运行独立的 TeamFlow 继承程序

### 1. 文件位置与运行目标

保留前置实战的 `Task`、`TaskStatus` 和启动类不动，在同一个普通 Java 项目中新增以下三个文件。它们是
专门观察继承的独立示例，不会替换已有任务模型，也不引入 Spring、Maven、HTTP 或数据库：

```text
src/teamflow/WorkItem.java
src/teamflow/TaskItem.java
src/teamflow/TeamFlowInheritanceApplication.java
```

先确认每个 `public` 类都放在同名文件中。运行入口是 `teamflow.TeamFlowInheritanceApplication`，不要选中
父类或实体类的文件直接运行。

### 2. JDK 25 完整程序

`src/teamflow/WorkItem.java`：

```java
package teamflow;

/** 保存 TeamFlow 工作项共有的编号、标题和摘要行为。 */
public class WorkItem {
    private final int id;
    private final String title;

    /**
     * 创建一个基础工作项。
     *
     * @param id 工作项编号
     * @param title 工作项标题
     */
    public WorkItem(int id, String title) {
        this.id = id;
        this.title = title;
    }

    /**
     * 读取父类保存的编号。
     *
     * @return 工作项编号
     */
    public int id() {
        return id;
    }

    /**
     * 读取父类保存的标题。
     *
     * @return 工作项标题
     */
    public String title() {
        return title;
    }

    /**
     * 生成共有的工作项摘要。
     *
     * @return 工作项摘要
     */
    public String summary() {
        return "工作项 #" + id + "：" + title;
    }
}
```

`src/teamflow/TaskItem.java`：

```java
package teamflow;

/** 表示需要负责人跟进的 TeamFlow 任务。 */
public class TaskItem extends WorkItem {
    private final String assignee;

    /**
     * 创建一个普通任务，并先初始化父类部分。
     *
     * @param id 工作项编号
     * @param title 工作项标题
     * @param assignee 负责人
     */
    public TaskItem(int id, String title, String assignee) {
        super(id, title);
        this.assignee = assignee;
    }

    /**
     * 在父类摘要后补充负责人。
     *
     * @return 完整任务摘要
     */
    @Override
    public String summary() {
        return super.summary() + "，负责人 " + assignee;
    }

    /**
     * 返回负责人名称。
     *
     * @return 负责人
     */
    public String assignee() {
        return assignee;
    }
}
```

`src/teamflow/TeamFlowInheritanceApplication.java`：

```java
package teamflow;

/** 运行 TeamFlow 继承与方法重写示例。 */
public class TeamFlowInheritanceApplication {
    /**
     * 创建工作项并打印父类和子类的摘要。
     *
     * @param args 命令行参数，本例不读取
     */
    public static void main(String[] args) {
        WorkItem baseItem = new WorkItem(2001, "整理发布说明");
        TaskItem taskItem = new TaskItem(2002, "实现任务筛选", "小林");

        System.out.println(baseItem.summary());
        System.out.println(taskItem.summary());
        System.out.println("编号仍由父类方法提供：" + taskItem.id());
    }
}
```

### 3. IDEA 中配置并运行 JDK 25

1. 在 IntelliJ IDEA 中打开普通 Java 项目，进入 `File -> Project Structure -> Project`，把 Project SDK 设为
   已安装的 JDK 25；若列表没有它，使用 `Add SDK -> JDK` 选择 JDK 25 的目录。
2. 在 `Modules` 页面确认模块 SDK 没有覆盖成别的版本；运行配置的 JRE 也应显示项目 JDK 25。
3. 按目录创建 `teamflow` 包和上面的三个同名 Java 文件，把各段完整代码分别放入对应文件。
4. 打开 `TeamFlowInheritanceApplication`，点击 `main` 方法旁的运行按钮。控制台应出现三行输出。

也可以在项目根目录的终端核对并运行：

```bash
java -version
javac -version
mkdir -p out-25-inheritance
javac -encoding UTF-8 -d out-25-inheritance src/teamflow/WorkItem.java src/teamflow/TaskItem.java src/teamflow/TeamFlowInheritanceApplication.java
java -cp out-25-inheritance teamflow.TeamFlowInheritanceApplication
```

`java -version` 和 `javac -version` 是终端当前 PATH 找到的 JDK；IDEA 的 Project SDK 和运行配置还可能指向
另一个 JDK。两个地方都核对为 25，才能确认本次运行的版本一致。

预期输出：

```text
工作项 #2001：整理发布说明
工作项 #2002：实现任务筛选，负责人 小林
编号仍由父类方法提供：2002
```

第二行来自 `TaskItem.summary()`。它先用 `super.summary()` 得到父类的编号和标题，再拼接负责人；第三行
通过父类公开的 `id()` 读取 `private` 字段，而不是让子类直接碰 `id`。

### 4. Java 8 完整程序与运行步骤

本课的 `extends`、构造器 `super(...)`、`super.method()`、`@Override` 和 `final` 在 Java 8 中都可用。
因此 Java 8 版本不需要改写语法，但仍要提供独立源码和独立输出目录，避免 IDEA 或终端误用另一套 JDK。

`src/teamflow/WorkItem.java`：

```java
package teamflow;

/** 保存 TeamFlow 工作项共有的编号、标题和摘要行为。 */
public class WorkItem {
    private final int id;
    private final String title;

    /**
     * 创建一个基础工作项。
     *
     * @param id 工作项编号
     * @param title 工作项标题
     */
    public WorkItem(int id, String title) {
        this.id = id;
        this.title = title;
    }

    /**
     * 读取父类保存的编号。
     *
     * @return 工作项编号
     */
    public int id() {
        return id;
    }

    /**
     * 读取父类保存的标题。
     *
     * @return 工作项标题
     */
    public String title() {
        return title;
    }

    /**
     * 生成共有的工作项摘要。
     *
     * @return 工作项摘要
     */
    public String summary() {
        return "工作项 #" + id + "：" + title;
    }
}
```

`src/teamflow/TaskItem.java`：

```java
package teamflow;

/** 表示需要负责人跟进的 TeamFlow 任务。 */
public class TaskItem extends WorkItem {
    private final String assignee;

    /**
     * 创建一个普通任务，并先初始化父类部分。
     *
     * @param id 工作项编号
     * @param title 工作项标题
     * @param assignee 负责人
     */
    public TaskItem(int id, String title, String assignee) {
        super(id, title);
        this.assignee = assignee;
    }

    /**
     * 在父类摘要后补充负责人。
     *
     * @return 完整任务摘要
     */
    @Override
    public String summary() {
        return super.summary() + "，负责人 " + assignee;
    }

    /**
     * 返回负责人名称。
     *
     * @return 负责人
     */
    public String assignee() {
        return assignee;
    }
}
```

`src/teamflow/TeamFlowInheritanceApplication.java`：

```java
package teamflow;

/** 运行 TeamFlow 继承与方法重写示例。 */
public class TeamFlowInheritanceApplication {
    /**
     * 创建工作项并打印父类和子类的摘要。
     *
     * @param args 命令行参数，本例不读取
     */
    public static void main(String[] args) {
        WorkItem baseItem = new WorkItem(2001, "整理发布说明");
        TaskItem taskItem = new TaskItem(2002, "实现任务筛选", "小林");

        System.out.println(baseItem.summary());
        System.out.println(taskItem.summary());
        System.out.println("编号仍由父类方法提供：" + taskItem.id());
    }
}
```

在 IDEA 中创建另一个普通 Java 项目，或复制项目到独立目录后，把 Project SDK、模块 SDK 和运行配置的 JRE
都选择 JDK 8，再分别创建三个文件并粘贴上面完整源码。终端验证使用独立目录：

```bash
java -version
javac -version
mkdir -p out-8-inheritance
javac -encoding UTF-8 -d out-8-inheritance src/teamflow/WorkItem.java src/teamflow/TaskItem.java src/teamflow/TeamFlowInheritanceApplication.java
java -cp out-8-inheritance teamflow.TeamFlowInheritanceApplication
```

预期输出与 JDK 25 完全相同。若 IDEA 运行结果和终端版本不一致，先分别查看运行配置 JRE、Project SDK、
`java -version` 和 `javac -version`，不要把“终端是 8、IDEA 是 25”误认为继承语法存在版本差异。

## 五、集中处理继承中的常见错误

### 多个典型错误

:::pitfalls
### 子类直接访问父类 private 字段

**触发条件：** 在 `TaskItem` 中直接写 `return "#" + id;`。

**原因：** `id` 在 `WorkItem` 中声明为 `private`，它只允许 `WorkItem` 自己直接访问。

**后果：** 编译器报告 `id has private access in WorkItem`，类无法运行。

**错误示例：**

```java
/**
 * 错误地直接读取父类私有编号。
 *
 * @return 编号文字
 */
public String wrongId() {
    return "#" + id;
}
```

**正确写法：**

```java
/**
 * 通过父类公开方法读取编号。
 *
 * @return 编号文字
 */
public String correctId() {
    return "#" + id();
}
```

**验证方式：** 用正文的 `WorkItem` 和 `TaskItem` 编译；错误片段应失败，改为调用 `id()` 后应能输出 `#2002`。

### 把 Java 8 的 super 第一条规则机械套到 JDK 25

**触发条件：** 在 JDK 25 中看到子类构造器先做参数校验，就直接断定代码一定非法；或者把这种 JDK 25
写法复制到 Java 8 项目。也不要反向推断成“所有字段赋值都非法”：简单赋值给本类声明且没有初始化器的
字段，是 JEP 513 明确允许的例外。

**原因：** Java 8 要求显式的 `super(...)` 是第一句；JDK 25 的 JEP 513 允许在它前面放置不访问当前对象的安全
语句，但这种语法不能被 Java 8 编译器接受。

**后果：** 传统写法在两个版本都可用；把前置语句复制到 Java 8 时会报告构造器调用必须是第一句，而 JDK 25 对
不访问实例的前置语句可以编译通过。

**错误示例：**

```java
/**
 * 这个写法对 Java 8 不兼容，但 JDK 25 可以接受安全的参数校验。
 *
 * @param id 工作项编号
 * @param title 工作项标题
 * @param assignee 负责人
 */
public TaskItem(int id, String title, String assignee) {
    if (assignee == null || assignee.isEmpty()) {
        throw new IllegalArgumentException("负责人不能为空");
    }
    super(id, title);
    this.assignee = assignee;
}
```

**正确写法：**

```java
/**
 * 先构造父类部分，再初始化子类字段。
 *
 * @param id 工作项编号
 * @param title 工作项标题
 * @param assignee 负责人
 */
public TaskItem(int id, String title, String assignee) {
    super(id, title);
    this.assignee = assignee;
}
```

**验证方式：** 用 JDK 8 编译版本对照片段，应在 `super(...)` 位置失败；用 JDK 25 编译同一段，安全的参数
校验可以通过。若前置代码读取当前对象的字段、使用 `this`、调用当前对象的实例方法、访问 `super` 的实例
成员，或给已有初始化器的字段赋值，JDK 25 仍会拒绝；简单赋值给本类声明且没有初始化器的字段可以通过。
将代码用于两个版本都要支持的课程主程序时使用正确写法，分别运行后都应打印负责人。

### 父类没有无参构造器却省略 super 参数

**触发条件：** `WorkItem` 只有 `WorkItem(int, String)`，子类构造器却没有写 `super(...)`。

**原因：** 省略时编译器会尝试调用 `super()`；父类没有可访问的无参构造器。

**后果：** 编译器报告找不到适合的 `WorkItem()` 构造器。

**错误示例：**

```java
/**
 * 错误地依赖父类不存在的无参构造器。
 *
 * @param id 工作项编号
 * @param title 工作项标题
 * @param assignee 负责人
 */
public TaskItem(int id, String title, String assignee) {
    // 隐式 super() 不存在
    this.assignee = assignee;
}
```

**正确写法：**

```java
/**
 * 显式传入父类构造器需要的参数。
 *
 * @param id 工作项编号
 * @param title 工作项标题
 * @param assignee 负责人
 */
public TaskItem(int id, String title, String assignee) {
    super(id, title);
    this.assignee = assignee;
}
```

**验证方式：** 保留父类的双参数构造器，编译错误版应失败；补上 `super(id, title)` 后应成功输出完整摘要。

### @Override 下的方法名或参数写错

**触发条件：** 想重写 `summary()`，却写成 `summray()` 或 `summary(String prefix)` 并保留 `@Override`。

**原因：** 方法签名已经改变，编译器找不到与之对应的父类实例方法。

**后果：** `@Override` 处产生编译错误；若删除注解，错误拼写会悄悄变成一个新方法。

**错误示例：**

```java
/**
 * 错误拼写的摘要方法。
 *
 * @return 错误摘要
 */
@Override
public String summray() {
    return "错误拼写";
}
```

**正确写法：**

```java
/**
 * 正确重写父类摘要方法。
 *
 * @return 带负责人的摘要
 */
@Override
public String summary() {
    return super.summary() + "，负责人 小林";
}
```

**验证方式：** 错误版应被 `@Override` 拒绝；正确版运行 `summary()` 应输出包含“负责人 小林”的摘要。

### 重写时缩小 public 可见性

**触发条件：** 父类的 `summary()` 是 `public`，子类把它改为 `protected` 或 `private`。

**原因：** 子类不能让父类已经公开的行为对调用方变得更不可见。

**后果：** 编译器报告 attempting to assign weaker access privileges，类无法编译。

**错误示例：**

```java
/**
 * 错误地缩小摘要方法的可见性。
 *
 * @return 摘要文字
 */
@Override
protected String summary() {
    return super.summary();
}
```

**正确写法：**

```java
/**
 * 保持父类公开摘要的可见性。
 *
 * @return 摘要文字
 */
@Override
public String summary() {
    return super.summary() + "，已核对";
}
```

**验证方式：** 两段分别编译；缩小可见性版应失败，保持 `public` 的版本应输出摘要。

### 把重载误认为重写

**触发条件：** 只新增 `summary(String prefix)`，却以为无参数的父类 `summary()` 已经被替换。

**原因：** 参数列表不同，重载是另一个方法；它不会替代父类的无参数方法。

**后果：** 调用 `summary()` 仍得到父类原文，调用 `summary("任务：")` 才会进入新方法。

**错误示例：**

```java
/**
 * 新增带前缀参数的重载方法。
 *
 * @param prefix 摘要前缀
 * @return 带前缀的摘要
 */
public String summary(String prefix) {
    return prefix + title();
}
```

**正确写法：**

```java
/**
 * 正确重写父类无参数摘要。
 *
 * @return 任务摘要
 */
@Override
public String summary() {
    return super.summary() + "，类型任务";
}
```

**验证方式：** 同时调用无参数和带参数方法；只有带 `@Override` 的无参数版本才会改变 `summary()` 的输出。

### 扩展 final 类或重写 final 方法

**触发条件：** 对声明为 `final` 的 `SystemWorkItem` 写 `extends`，或尝试改写其 `final` 方法。

**原因：** `final` 明确表示该类不再接受子类，或该方法的实现不允许被替换。

**后果：** 编译器报告 cannot inherit from final class 或 cannot override final method。

**错误示例：**

```java
class CustomSystemWorkItem extends SystemWorkItem {
}

class LockedSourceItem {
    /**
     * 返回不可重写的来源。
     *
     * @return 来源标记
     */
    public final String source() {
        return "locked";
    }
}

class CustomSourceItem extends LockedSourceItem {
    /**
     * 错误地重写 final 方法。
     *
     * @return 自定义来源
     */
    @Override
    public String source() {
        return "custom";
    }
}
```

**正确写法：**

```java
SystemWorkItem item = new SystemWorkItem();
System.out.println(item.source());

LockedSourceItem sourceItem = new LockedSourceItem();
System.out.println(sourceItem.source());
```

**验证方式：** 错误扩展代码应报告不能继承 final 类，错误重写代码应报告不能重写 final 方法；直接创建两个
父类并调用 `source()` 应依次输出 `system` 和 `locked`。
:::

## 六、练习：扩展 TeamFlow 审计工作项

:::exercise
### TeamFlow 审计工作项

**要求：** 创建 `AuditedWorkItem extends WorkItem`，增加创建后不变的 `reviewer` 字段；构造器用
`super(id, title)` 初始化父类；重写 `summary()`，先保留 `super.summary()`，再追加“，复核人 <名字>”。
不要直接访问父类的 `private` 字段，不要修改 `WorkItem`，不要使用接口、抽象类、集合或父类型引用。

**验收：** 运行入口创建编号 `3001`、标题“核对发布清单”、复核人“阿宁”的对象，输出必须是
`工作项 #3001：核对发布清单，复核人 阿宁`。为了让同一份参考实现兼容两版，`super(...)` 必须写在构造器
第一句：Java 8 在它前面加入普通语句会编译失败；JDK 25 允许安全的前置语句，也允许简单赋值给本类声明
且没有初始化器的字段，但读取当前对象、调用其实例方法、访问 `super` 实例成员或给已有初始化器的字段
赋值仍会失败。把 `summary()` 写成其他参数或降低可见性也应编译失败。

**参考答案：** JDK 25 和 Java 8 的完整源码、IDEA 配置与预期输出见下方。
:::

### 1. JDK 25 参考实现

`src/teamflow/WorkItem.java`：

```java
package teamflow;

/** 保存 TeamFlow 工作项共有的编号、标题和摘要行为。 */
public class WorkItem {
    private final int id;
    private final String title;

    /**
     * 创建一个基础工作项。
     *
     * @param id 工作项编号
     * @param title 工作项标题
     */
    public WorkItem(int id, String title) {
        this.id = id;
        this.title = title;
    }

    /**
     * 读取工作项编号。
     *
     * @return 工作项编号
     */
    public int id() {
        return id;
    }

    /**
     * 读取工作项标题。
     *
     * @return 工作项标题
     */
    public String title() {
        return title;
    }

    /**
     * 生成父类摘要。
     *
     * @return 工作项摘要
     */
    public String summary() {
        return "工作项 #" + id + "：" + title;
    }
}
```

`src/teamflow/AuditedWorkItem.java`：

```java
package teamflow;

/** 表示已经指定复核人的 TeamFlow 审计工作项。 */
public class AuditedWorkItem extends WorkItem {
    private final String reviewer;

    /**
     * 创建审计工作项。
     *
     * @param id 工作项编号
     * @param title 工作项标题
     * @param reviewer 复核人
     */
    public AuditedWorkItem(int id, String title, String reviewer) {
        super(id, title);
        this.reviewer = reviewer;
    }

    /**
     * 在父类摘要后追加复核人。
     *
     * @return 审计工作项摘要
     */
    @Override
    public String summary() {
        return super.summary() + "，复核人 " + reviewer;
    }
}
```

`src/teamflow/TeamFlowAuditApplication.java`：

```java
package teamflow;

/** 运行 TeamFlow 审计工作项练习。 */
public class TeamFlowAuditApplication {
    /**
     * 创建审计工作项并打印验收输出。
     *
     * @param args 命令行参数，本例不读取
     */
    public static void main(String[] args) {
        AuditedWorkItem item = new AuditedWorkItem(3001, "核对发布清单", "阿宁");
        System.out.println(item.summary());
    }
}
```

在 Project SDK、模块 SDK 和运行配置 JRE 都选择 JDK 25 后运行 `TeamFlowAuditApplication`。也可以在终端
执行：

```bash
java -version
javac -version
mkdir -p out-25-audit
javac -encoding UTF-8 -d out-25-audit src/teamflow/WorkItem.java src/teamflow/AuditedWorkItem.java src/teamflow/TeamFlowAuditApplication.java
java -cp out-25-audit teamflow.TeamFlowAuditApplication
```

预期输出：

```text
工作项 #3001：核对发布清单，复核人 阿宁
```

### 2. Java 8 参考实现

Java 8 版本仍需独立粘贴完整源码。

`src/teamflow/WorkItem.java`：

```java
package teamflow;

/** 保存 TeamFlow 工作项共有的编号、标题和摘要行为。 */
public class WorkItem {
    private final int id;
    private final String title;

    /**
     * 创建一个基础工作项。
     *
     * @param id 工作项编号
     * @param title 工作项标题
     */
    public WorkItem(int id, String title) {
        this.id = id;
        this.title = title;
    }

    /**
     * 读取工作项编号。
     *
     * @return 工作项编号
     */
    public int id() {
        return id;
    }

    /**
     * 读取工作项标题。
     *
     * @return 工作项标题
     */
    public String title() {
        return title;
    }

    /**
     * 生成父类摘要。
     *
     * @return 工作项摘要
     */
    public String summary() {
        return "工作项 #" + id + "：" + title;
    }
}
```

`src/teamflow/AuditedWorkItem.java`：

```java
package teamflow;

/** 表示已经指定复核人的 TeamFlow 审计工作项。 */
public class AuditedWorkItem extends WorkItem {
    private final String reviewer;

    /**
     * 创建审计工作项。
     *
     * @param id 工作项编号
     * @param title 工作项标题
     * @param reviewer 复核人
     */
    public AuditedWorkItem(int id, String title, String reviewer) {
        super(id, title);
        this.reviewer = reviewer;
    }

    /**
     * 在父类摘要后追加复核人。
     *
     * @return 审计工作项摘要
     */
    @Override
    public String summary() {
        return super.summary() + "，复核人 " + reviewer;
    }
}
```

`src/teamflow/TeamFlowAuditApplication.java`：

```java
package teamflow;

/** 运行 TeamFlow 审计工作项练习。 */
public class TeamFlowAuditApplication {
    /**
     * 创建审计工作项并打印验收输出。
     *
     * @param args 命令行参数，本例不读取
     */
    public static void main(String[] args) {
        AuditedWorkItem item = new AuditedWorkItem(3001, "核对发布清单", "阿宁");
        System.out.println(item.summary());
    }
}
```

在独立 Java 8 项目中把 Project SDK、模块 SDK 和运行配置 JRE 都选为 JDK 8，再运行同名入口。终端使用
独立输出目录：

```bash
java -version
javac -version
mkdir -p out-8-audit
javac -encoding UTF-8 -d out-8-audit src/teamflow/WorkItem.java src/teamflow/AuditedWorkItem.java src/teamflow/TeamFlowAuditApplication.java
java -cp out-8-audit teamflow.TeamFlowAuditApplication
```

预期输出同样是：

```text
工作项 #3001：核对发布清单，复核人 阿宁
```

JDK 25 和 Java 8 的参考实现只使用两版共有的传统入口与继承语法，因此代码相同；差异只在 IDEA 的
Project SDK、模块 SDK、运行配置 JRE，以及终端实际使用的 JDK 和 class 输出目录。下一课再讨论抽象类和
接口，不要在本练习中自行加入它们。
