---
id: backend.java.learn.basics.static-and-final
type: lesson
title: static 与 final
summary: 区分对象成员与类成员，并用 final 保护 TeamFlow 的一次性状态和共享常量
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 110
prerequisites:
  - backend.java.learn.basics.encapsulation-and-access-control
objectives:
  - 能区分实例字段、静态字段、实例方法和静态方法的归属对象。
  - 能使用类名调用静态字段和静态方法，并解释静态方法为什么不能直接使用实例成员。
  - 能说明 final 局部变量、参数、字段、方法和类分别限制了什么。
  - 能区分 final 引用不能重新指向与引用对象本身是否可变。
  - 能用 static final 声明共享常量，并遵守常量命名和访问习惯。
  - 能分别在 JDK 25 与 Java 8 中运行完整 TeamFlow 程序和练习参考实现。
recap:
  - 不写 static 的字段和方法属于对象实例；static 成员属于类，所有实例共享同一份静态字段。
  - 静态方法没有当前对象，不能直接访问实例字段、实例方法或使用 this；需要对象时必须显式传入或使用对象引用。
  - final 变量只能完成一次赋值，final 引用只能保持引用不变，不会自动冻结引用对象的内部状态。
  - final 方法不能被子类重写，final 类不能被继承；这些边界只在声明处生效，不改变方法的调用方式。
  - static final 适合表达类级常量，常量名通常使用全大写和下划线。
  - 本课普通顶层类使用的 static 与 final 写法在 JDK 25 和 Java 8 中一致，两版完整代码均采用兼容实现。
related: []
tags:
  - Java
  - static
  - final
  - 类成员
  - 实例成员
  - 常量
appliesTo: JDK 25 主线；本课完整示例兼容 Java 8
verifiedAt: 2026-08-17
sources:
  - id: dev-java-more-on-classes
    title: Dev.java - More on Classes
    url: https://dev.java/learn/classes-objects/more-on-classes/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java；Java SE
    claims:
      - static 字段和方法属于类并可通过类名使用，实例成员属于对象
      - 静态方法不能直接访问实例字段、实例方法或 this
      - static 与 final 组合可以声明常量，常量通常使用大写命名
  - id: jls-25-classes-static-final
    title: Java Language Specification 25 - Classes
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - static 字段是类变量，static 方法是类方法并处于没有当前实例的静态上下文
      - static 上下文禁止直接使用 this、super 和外围实例成员
      - final 字段、final 方法和 final 类分别限制重复赋值、方法重写和类继承
  - id: jls-25-final-variables
    title: Java Language Specification 25 - final Variables
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.12.4
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - final 变量必须在使用前完成一次明确赋值，之后不能再次赋值
      - final 引用变量保存的引用（指向）不能改变，但对象状态是否可变由对象类型决定
      - static final 的基本类型或 String 常量在满足条件时可作为编译期常量
  - id: jls-8-classes-static-final
    title: Java Language Specification 8 - Classes
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - 本课普通顶层类中的 static 字段、static 方法、final 字段、final 方法和 final 类写法兼容 Java 8
      - Java 8 顶层类的静态方法没有当前对象，不能使用 this 或直接访问实例成员
---

# static 与 final

TeamFlow 会同时面对两类状态：每个任务自己的编号、标题和完成状态，以及整个任务中心共享的项目名称和
编号计数器。如果把两类状态都放进每个对象，多个任务之间就会重复维护同一份信息；如果把所有状态都做成
共享变量，又会让不同任务互相覆盖。本课先用 `static` 分清“属于类”还是“属于对象”，再用 `final` 说明
哪些值只能在规定时机确定一次。

本课只建立这些修饰符的直接使用方式，不展开继承层次、线程安全、常量折叠或复杂初始化机制。示例会故意
保持普通 Java 类和控制台入口，让每个状态变化都能在输出中观察到。

## 一、先分清对象成员和类成员

### 1. 没有 static 的成员各有一份

上一课的 `TaskCard` 每创建一个对象，就有一份自己的字段。下面的两个任务各自保存标题，修改一个对象不会
改变另一个对象：

```java
public class TaskCard {
    private String title;

    /**
     * 使用标题创建任务卡。
     *
     * @param title 任务标题
     */
    public TaskCard(String title) {
        this.title = title;
    }

    /**
     * 修改当前任务卡的标题。
     *
     * @param title 新标题
     */
    public void renameTo(String title) {
        this.title = title;
    }

    /**
     * 读取当前任务标题。
     *
     * @return 任务标题
     */
    public String title() {
        return title;
    }
}
```

```java
TaskCard first = new TaskCard("整理需求");
TaskCard second = new TaskCard("编写接口");
first.renameTo("确认需求");

System.out.println(first.title());
System.out.println(second.title());
```

输出是：

```text
确认需求
编写接口
```

`title` 是实例字段。`first` 和 `second` 指向不同对象，所以每个对象拥有自己的字段值。没有 `static` 的
方法也属于实例，调用时需要一个对象作为当前对象，方法内部的 `this` 就指向这个对象。

### 2. static 字段只有一份共享状态

`static` 把字段的归属从“某个对象”改成“这个类”。下面的计数器不是某个任务的属性，而是所有任务共同
使用的编号来源：

```java
public class NumberedTask {
    private static int nextNumber = 1;
    private int number;

    /**
     * 创建任务并取得当前的下一个编号。
     */
    public NumberedTask() {
        number = nextNumber;
        nextNumber++;
    }

    /**
     * 读取当前任务编号。
     *
     * @return 当前任务编号
     */
    public int number() {
        return number;
    }

    /**
     * 读取已经创建的任务数量。
     *
     * @return 已创建任务数量
     */
    public static int createdCount() {
        return nextNumber - 1;
    }
}
```

```java
NumberedTask first = new NumberedTask();
NumberedTask second = new NumberedTask();

System.out.println(first.number());
System.out.println(second.number());
System.out.println(NumberedTask.createdCount());
```

预期输出：

```text
1
2
2
```

`first` 和 `second` 各有自己的 `number`，但都读写同一个 `NumberedTask.nextNumber`。构造第一个对象后，
共享计数器从 `1` 变成 `2`；构造第二个对象后再变成 `3`，所以两个对象得到不同编号，而类方法返回已经
创建的总数。

### 3. 用类名表达静态成员的归属

静态字段和静态方法不需要先创建对象，通常通过类名调用：

```java
System.out.println(NumberedTask.createdCount());
```

也可以写成 `first.createdCount()`，但这会让读者误以为方法属于 `first` 这个对象。Java 仍会按静态成员
处理它，但类名写法更准确地表达“所有对象共享同一个入口”。同理，静态字段应优先写成
`NumberedTask.nextNumber`，而不是通过某个对象变量访问。

### 4. static 方法没有当前对象

实例方法调用时，调用对象会成为当前对象；静态方法则直接属于类，没有可供 `this` 指向的实例。静态方法
可以直接使用同一个类的静态字段和其他静态方法：

```java
public class TeamFlowText {
    private static final String PREFIX = "TeamFlow";

    /**
     * 为任务标题添加项目名前缀。
     *
     * @param title 原始标题
     * @return 带项目名前缀的标题
     */
    public static String withProjectPrefix(String title) {
        return PREFIX + "：" + title;
    }
}
```

调用时不需要创建 `TeamFlowText`：

```java
System.out.println(TeamFlowText.withProjectPrefix("编写接口"));
```

输出：

```text
TeamFlow：编写接口
```

### 5. 静态方法不能直接读取实例字段

下面的代码不能编译：

```java
public class TaskReport {
    private String title;

    /**
     * 错误地尝试从静态方法读取实例标题。
     *
     * @return 任务标题
     */
    public static String titleText() {
        return title;
    }
}
```

原因是 `title` 属于某个具体的 `TaskReport` 对象，`titleText()` 却没有对象上下文。修复方式有两种：把方法
改成实例方法，或者显式接收一个对象：

```java
public class TaskReport {
    private String title;

    /**
     * 使用标题创建报告对象。
     *
     * @param title 任务标题
     */
    public TaskReport(String title) {
        this.title = title;
    }

    /**
     * 读取当前对象的标题。
     *
     * @return 当前任务标题
     */
    public String titleText() {
        return title;
    }

    /**
     * 读取给定对象的标题。
     *
     * @param report 要读取的报告对象
     * @return 给定对象的任务标题
     */
    public static String titleTextOf(TaskReport report) {
        return report.title;
    }
}
```

静态方法并不是“不能处理对象”，它只是不能凭空访问实例成员。把对象作为参数传入后，访问目标就明确了。

## 二、理解 final 的一次性约束

### 1. final 局部变量和参数只能赋值一次

`final` 放在局部变量前，表示该变量完成赋值后不能再次赋值：

```java
final int maxTasks = 100;
System.out.println(maxTasks);
```

下面的第二次赋值会被编译器拒绝：

```java
final int maxTasks = 100;
maxTasks = 200;
```

局部 `final` 变量也可以先声明、后完成一次赋值，但必须在使用前完成，而且不能走到第二次赋值：

```java
final String boardName;
boardName = "TeamFlow";
System.out.println(boardName);
```

方法参数也可以声明为 `final`。它不会改变调用者传入的对象，只是禁止方法体把参数变量重新指向另一个
值：

```java
/**
 * 输出固定的任务标题。
 *
 * @param title 调用者传入的标题
 */
public static void printTitle(final String title) {
    System.out.println(title);
    // title = "另一个标题"; // 编译错误：final 参数不能再次赋值
}
```

### 2. final 字段必须在规定时机确定

实例字段加上 `final` 后，每个对象仍然各有一份字段，但这份字段只能被赋值一次。常见做法是在声明处或
构造方法中赋值：

```java
public class TaskIdentity {
    private final int taskNumber;
    private final String title;

    /**
     * 使用编号和标题创建不可重新赋值的任务身份。
     *
     * @param taskNumber 任务编号
     * @param title 任务标题
     */
    public TaskIdentity(int taskNumber, String title) {
        this.taskNumber = taskNumber;
        this.title = title;
    }

    /**
     * 返回任务身份文本。
     *
     * @return 编号和标题
     */
    public String summary() {
        return "#" + taskNumber + " " + title;
    }
}
```

构造方法为每个新对象分别完成一次赋值，所以 `TaskIdentity(1, "整理需求")` 和
`TaskIdentity(2, "编写接口")` 仍然有不同的编号和标题。`final` 不是让所有对象共享字段，而是禁止同一个
对象的这份字段再次被改写。

### 3. final 引用不等于对象不可变

当 `final` 修饰引用变量时，不能改变的是“引用指向哪里”：

```java
final TaskCard task = new TaskCard("整理需求");
task.renameTo("确认需求");
// task = new TaskCard("编写接口"); // 编译错误：不能让 task 指向另一个对象
```

第一行让 `task` 永远指向第一个 `TaskCard`，但 `TaskCard.renameTo()` 仍然可以修改这个对象自己的标题。要让
对象本身也不可变，还需要对象类型提供不可变的设计；仅给引用加 `final` 不会自动冻结对象内部状态。

### 4. final 方法和 final 类提前划定扩展边界

`final` 也可以修饰方法和类：

```java
public class TaskPrinter {
    /**
     * 输出固定格式的任务前缀，子类不能重写这个方法。
     */
    public final void printPrefix() {
        System.out.println("TeamFlow");
    }
}
```

如果后续课程中的子类尝试声明同名方法，编译器会拒绝重写 `printPrefix()`。把类声明为 `final` 则表示该类
不能被继承：

```java
public final class FixedTaskCode {
}

// class CustomTaskCode extends FixedTaskCode { } // 编译错误：不能继承 final 类
```

本课只需要记住这两条声明边界，不展开继承、重写和多态的完整规则；这些能力将在后续面向对象课程中单独
练习。

## 三、用 static final 表达 TeamFlow 的共享常量

### 1. 常量属于类而不是某个任务

项目名称和任务上限是整个 TeamFlow 任务中心共同使用的值，不应该让每个任务对象各保存一份。用
`public static final` 声明后，它们可以通过类名读取且不能重新赋值：

```java
public class TeamFlowSettings {
    public static final String PROJECT_NAME = "TeamFlow";
    public static final int MAX_TASKS = 100;
}
```

```java
System.out.println(TeamFlowSettings.PROJECT_NAME);
System.out.println(TeamFlowSettings.MAX_TASKS);
```

常量名通常使用全大写，多个单词用下划线连接。`static` 说明全类共享一份值，`final` 说明这份字段不能
再次赋值，二者缺一不可：只有 `static` 仍可修改，只有 `final` 则每个对象可能各有一份不可改字段。

### 2. 共享计数器和常量可以同时存在

计数器需要随着新任务增长，因此只能是 `static`；项目名称不应变化，因此是 `static final`：

```java
public class TaskNumberSource {
    private static int nextNumber = 1;
    private static final String PREFIX = "TF-";

    /**
     * 取得下一个任务编号文本并推进共享计数器。
     *
     * @return 例如 TF-1 的任务编号
     */
    public static String nextCode() {
        String code = PREFIX + nextNumber;
        nextNumber++;
        return code;
    }
}
```

连续调用 `TaskNumberSource.nextCode()` 会得到 `TF-1`、`TF-2`。`PREFIX` 永远不改，`nextNumber` 则由静态
方法集中更新。这里没有为每个调用创建 `TaskNumberSource` 对象。

### 3. 常量的共享不代表引用对象一定安全

本课的常量使用 `String` 和基本类型，便于观察“不能重新赋值”的规则。若把可变对象声明为
`static final`，仍可能通过对象提供的修改方法改变对象内部状态；`final` 只锁住字段保存的引用，不能代替
封装和不可变对象设计。因此不要把 `static final` 自动理解成“任何内容都永远不能变化”。

## 四、在 TeamFlow 任务中组合两种修饰符

### 1. 先决定状态属于谁

一个任务对象需要自己的编号、标题和完成状态；任务中心则需要共享的下一个编号和项目名称：

| 状态或行为 | 修饰符 | 归属与原因 |
| --- | --- | --- |
| `taskNumber` | `final` | 每个任务自己的身份，构造时确定后不再改写 |
| `title`、`completed` | 无 `static` | 每个任务有独立标题和完成状态 |
| `nextTaskNumber` | `static` | 所有任务共同推进一个编号来源 |
| `PROJECT_NAME` | `static final` | 全类共享且不允许重新赋值的项目常量 |
| `createdCount()` | `static` | 查询类级计数，不需要某个任务对象 |
| `summary()`、`markCompleted()` | 无 `static` | 需要读取或改变当前任务对象 |

这个决定先于写代码：判断方法是否需要 `this` 或实例字段，需要就保留实例方法；只处理类级共享状态，才
考虑静态方法。

### 2. 观察完整的状态变化

下面的程序会创建两个任务，给每个任务分配独立的最终编号，同时通过共享计数器统计创建总数：

```java
public class TeamFlowTask {
    public static final String PROJECT_NAME = "TeamFlow";
    private static int nextTaskNumber = 1;

    private final int taskNumber;
    private String title;
    private boolean completed;

    /**
     * 创建一个新的未完成任务，并从类级计数器取得编号。
     *
     * @param rawTitle 可能包含首尾空白的任务标题
     */
    public TeamFlowTask(String rawTitle) {
        taskNumber = nextTaskNumber;
        nextTaskNumber++;

        String normalizedTitle = rawTitle.trim();
        title = normalizedTitle.isEmpty() ? "未命名任务" : normalizedTitle;
    }

    /**
     * 读取已经创建的任务数量。
     *
     * @return 已创建任务数量
     */
    public static int createdCount() {
        return nextTaskNumber - 1;
    }

    /**
     * 尝试修改当前任务标题。
     *
     * @param rawTitle 可能包含首尾空白的新标题
     * @return 标题有效并完成修改时返回 true
     */
    public boolean renameTo(String rawTitle) {
        String candidate = rawTitle.trim();
        if (candidate.isEmpty()) {
            return false;
        }

        title = candidate;
        return true;
    }

    /**
     * 首次调用时把当前任务标记为已完成。
     *
     * @return 本次是否改变了完成状态
     */
    public boolean markCompleted() {
        if (completed) {
            return false;
        }

        completed = true;
        return true;
    }

    /**
     * 返回当前任务的摘要。
     *
     * @return 包含编号、完成标记和标题的摘要
     */
    public String summary() {
        String status = completed ? "[x]" : "[ ]";
        return "#" + taskNumber + " " + status + " " + title;
    }
}
```

构造方法读取并递增 `static` 计数器，但把得到的数值写入当前对象的 `final taskNumber`。因此计数器是共享
来源，编号却是每个对象自己的固定结果。`createdCount()` 不需要 `this`，所以是静态方法；`summary()` 和
`markCompleted()` 必须读取或改变当前对象，所以保留为实例方法。

## 五、在两个 JDK 中核对相同规则

### 1. 本课顶层类写法没有版本差异

本课所有字段和方法都声明在普通顶层类中。JDK 25 和 Java 8 都支持这里使用的 `static`、`final`、传统
`public static void main(String[] args)`、字符串拼接和条件表达式，因此这些完整程序不需要版本分叉。
嵌套类和局部类对静态成员还有版本相关限制，但它们不在本课范围内；不能把这里的兼容结论扩大到尚未
学习的类声明位置。

两版代码仍会完整列出，原因是学习者需要能把对应版本的每个文件直接放进自己的项目，而不是根据“同上”
猜测遗漏的类或方法。

### 2. IDEA 中配置 JDK 25 项目

1. 打开普通 Java 项目，选择 **File > Project Structure**。
2. 在 **Project** 中把 **Project SDK** 设为已安装的 JDK 25；若列表没有它，使用 **Add SDK > JDK** 选择
   JDK 25 的安装目录。
3. 在 **Modules** 中确认模块 SDK 继承项目 SDK，或明确选择同一个 JDK 25。
4. 创建 `teamflow` 包和 `TeamFlowTask.java`，再创建 `TeamFlowApplication.java`。
5. 将下面的 JDK 25 两个文件分别粘贴到对应类中，从 `main` 左侧的运行图标启动。

运行配置的 JRE 也应指向 JDK 25。若编辑器能够补全但运行输出来自另一个版本，分别检查 **Project SDK**、
模块 SDK 和运行配置 JRE，不要只看终端版本。

### 3. IDEA 中配置 Java 8 项目

1. 为 Java 8 建立独立的普通 Java 项目，打开 **File > Project Structure**。
2. 在 **Project** 的 **Project SDK** 选择已安装的 JDK 8；不能选择 JDK 25 再把语言级别下拉为 8 来冒充
   JDK 8 运行环境。
3. 在 **Modules** 中把模块 SDK 设为 JDK 8，并在运行配置的 JRE 中选择同一个 JDK 8。
4. 使用相同的两个包和类名，完整填写下面的 Java 8 代码，从 Java 8 启动类的 `main` 左侧运行。

终端的 `java -version`、`javac -version` 与 IDEA 的 Project SDK 可能不同。版本核对必须同时看这三处；
只要其中一处不同，就应先记录差异，再判断程序实际使用的 JDK。

## 六、运行 JDK 25 完整程序

### 1. 领域类完整代码

在 `src/teamflow/TeamFlowTask.java` 中填写：

```java
package teamflow;

public class TeamFlowTask {
    public static final String PROJECT_NAME = "TeamFlow";
    private static int nextTaskNumber = 1;

    private final int taskNumber;
    private String title;
    private boolean completed;

    /**
     * 创建一个新的未完成任务，并从类级计数器取得编号。
     *
     * @param rawTitle 可能包含首尾空白的任务标题
     */
    public TeamFlowTask(String rawTitle) {
        taskNumber = nextTaskNumber;
        nextTaskNumber++;

        String normalizedTitle = rawTitle.trim();
        title = normalizedTitle.isEmpty() ? "未命名任务" : normalizedTitle;
    }

    /**
     * 读取已经创建的任务数量。
     *
     * @return 已创建任务数量
     */
    public static int createdCount() {
        return nextTaskNumber - 1;
    }

    /**
     * 尝试修改当前任务标题。
     *
     * @param rawTitle 可能包含首尾空白的新标题
     * @return 标题有效并完成修改时返回 true
     */
    public boolean renameTo(String rawTitle) {
        String candidate = rawTitle.trim();
        if (candidate.isEmpty()) {
            return false;
        }

        title = candidate;
        return true;
    }

    /**
     * 首次调用时把当前任务标记为已完成。
     *
     * @return 本次是否改变了完成状态
     */
    public boolean markCompleted() {
        if (completed) {
            return false;
        }

        completed = true;
        return true;
    }

    /**
     * 返回当前任务的摘要。
     *
     * @return 包含编号、完成标记和标题的摘要
     */
    public String summary() {
        String status = completed ? "[x]" : "[ ]";
        return "#" + taskNumber + " " + status + " " + title;
    }
}
```

### 2. 启动类完整代码

在 `src/teamflow/TeamFlowApplication.java` 中填写：

```java
package teamflow;

public class TeamFlowApplication {
    /**
     * 创建任务并输出 static 与 final 共同建立的状态。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        final TeamFlowTask firstTask = new TeamFlowTask(" 编写登录接口 ");
        final TeamFlowTask secondTask = new TeamFlowTask("设计任务表");

        System.out.println("TeamFlow 任务中心");
        System.out.println("项目名称：" + TeamFlowTask.PROJECT_NAME);
        System.out.println("任务数：" + TeamFlowTask.createdCount());
        System.out.println(firstTask.summary());
        System.out.println(secondTask.summary());
        System.out.println("完成 #2：" + secondTask.markCompleted());
        System.out.println("再次完成 #2：" + secondTask.markCompleted());
        System.out.println(secondTask.summary());
        System.out.println("创建总数：" + TeamFlowTask.createdCount());
    }
}
```

### 3. 预期输出与关键过程

```text
TeamFlow 任务中心
项目名称：TeamFlow
任务数：2
#1 [ ] 编写登录接口
#2 [ ] 设计任务表
完成 #2：true
再次完成 #2：false
#2 [x] 设计任务表
创建总数：2
```

第一、二个对象分别取得共享计数器产生的 `1` 和 `2`，然后把编号各自写入 `final taskNumber`。启动类的
两个 `final` 局部变量也不能再指向别的任务，但仍能调用任务对象允许的行为。`PROJECT_NAME` 和
`createdCount()` 通过类名访问，表明它们属于类；`summary()` 和 `markCompleted()` 通过对象调用，表明它们
需要当前任务状态。

### 4. 用终端复核 JDK 25

确认终端版本后，在保存两个源码文件的目录执行：

```bash
java -version
javac -version
mkdir -p out-25
javac -d out-25 teamflow/TeamFlowTask.java teamflow/TeamFlowApplication.java
java -cp out-25 teamflow.TeamFlowApplication
```

`out-25` 只存本次 JDK 25 的 class 文件。若 `java -version` 与 `javac -version` 不是同一 JDK，先修正终端
环境或使用绝对路径核对，再比较输出；不要把两个版本编译到同一个输出目录。

## 七、运行 Java 8 完整程序

### 1. Java 8 领域类完整代码

在 Java 8 项目的 `src/teamflow/TeamFlowTask.java` 中填写完整代码：

```java
package teamflow;

public class TeamFlowTask {
    public static final String PROJECT_NAME = "TeamFlow";
    private static int nextTaskNumber = 1;

    private final int taskNumber;
    private String title;
    private boolean completed;

    /**
     * 创建一个新的未完成任务，并从类级计数器取得编号。
     *
     * @param rawTitle 可能包含首尾空白的任务标题
     */
    public TeamFlowTask(String rawTitle) {
        taskNumber = nextTaskNumber;
        nextTaskNumber++;

        String normalizedTitle = rawTitle.trim();
        title = normalizedTitle.isEmpty() ? "未命名任务" : normalizedTitle;
    }

    /**
     * 读取已经创建的任务数量。
     *
     * @return 已创建任务数量
     */
    public static int createdCount() {
        return nextTaskNumber - 1;
    }

    /**
     * 尝试修改当前任务标题。
     *
     * @param rawTitle 可能包含首尾空白的新标题
     * @return 标题有效并完成修改时返回 true
     */
    public boolean renameTo(String rawTitle) {
        String candidate = rawTitle.trim();
        if (candidate.isEmpty()) {
            return false;
        }

        title = candidate;
        return true;
    }

    /**
     * 首次调用时把当前任务标记为已完成。
     *
     * @return 本次是否改变了完成状态
     */
    public boolean markCompleted() {
        if (completed) {
            return false;
        }

        completed = true;
        return true;
    }

    /**
     * 返回当前任务的摘要。
     *
     * @return 包含编号、完成标记和标题的摘要
     */
    public String summary() {
        String status = completed ? "[x]" : "[ ]";
        return "#" + taskNumber + " " + status + " " + title;
    }
}
```

### 2. Java 8 启动类完整代码

在 `src/teamflow/TeamFlowApplication.java` 中填写完整代码：

```java
package teamflow;

public class TeamFlowApplication {
    /**
     * 创建任务并输出 static 与 final 共同建立的状态。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        final TeamFlowTask firstTask = new TeamFlowTask(" 编写登录接口 ");
        final TeamFlowTask secondTask = new TeamFlowTask("设计任务表");

        System.out.println("TeamFlow 任务中心");
        System.out.println("项目名称：" + TeamFlowTask.PROJECT_NAME);
        System.out.println("任务数：" + TeamFlowTask.createdCount());
        System.out.println(firstTask.summary());
        System.out.println(secondTask.summary());
        System.out.println("完成 #2：" + secondTask.markCompleted());
        System.out.println("再次完成 #2：" + secondTask.markCompleted());
        System.out.println(secondTask.summary());
        System.out.println("创建总数：" + TeamFlowTask.createdCount());
    }
}
```

### 3. Java 8 的运行步骤和输出

在 IDEA 中确认 Project SDK、模块 SDK 和运行配置 JRE 都是 JDK 8，从 `TeamFlowApplication.main` 运行。
也可以在 Java 8 终端中执行：

```bash
java -version
javac -version
mkdir -p out-8
javac -d out-8 teamflow/TeamFlowTask.java teamflow/TeamFlowApplication.java
java -cp out-8 teamflow.TeamFlowApplication
```

Java 8 控制台输出应与 JDK 25 完全一致：

```text
TeamFlow 任务中心
项目名称：TeamFlow
任务数：2
#1 [ ] 编写登录接口
#2 [ ] 设计任务表
完成 #2：true
再次完成 #2：false
#2 [x] 设计任务表
创建总数：2
```

本课没有使用 JDK 25 才有的语法，因此不需要修改源代码。仍然要使用独立的 `out-8` 目录，避免 Java 8
误读 JDK 25 生成的 class 文件。

## 八、集中处理常见错误

:::pitfalls
### 把 static 计数器当成每个对象自己的编号

**触发条件：** 直接把共享的 `nextTaskNumber` 作为摘要编号，却没有把取到的值保存到实例字段。

**原因：** `static` 字段只有一份，所有对象读取的是同一个不断变化的值。

**后果：** 先创建的任务在计数器继续增长后也会显示成最新编号，任务身份不稳定。

**错误示例：**

```java
private static int nextTaskNumber = 1;

/**
 * 错误地只推进共享计数器，没有保存当前对象的编号。
 */
public TeamFlowTask() {
    nextTaskNumber++;
}

/**
 * 错误地直接读取共享计数器。
 *
 * @return 当前共享计数器
 */
public int number() {
    return nextTaskNumber;
}
```

**正确写法：**

```java
private static int nextTaskNumber = 1;
private final int taskNumber;

/**
 * 创建任务并保存本次取得的编号。
 */
public TeamFlowTask() {
    taskNumber = nextTaskNumber++;
}

/**
 * 返回当前任务固定编号。
 *
 * @return 当前任务编号
 */
public int number() {
    return taskNumber;
}
```

**验证方式：** 创建两个对象后分别读取编号；正确版本应得到 `1`、`2`，再次读取第一个对象仍是 `1`。

### 在 static 方法中直接使用实例字段或 this

**触发条件：** 在声明为 `static` 的方法中直接写 `title`、`markCompleted()` 或 `this.title`。

**原因：** 静态方法没有当前对象，编译器无法判断应该使用哪个实例。

**后果：** JDK 25 和 Java 8 都在编译阶段拒绝代码，程序无法启动。

**错误示例：**

```java
private String title;

/**
 * 错误地在静态上下文读取实例字段。
 *
 * @return 标题
 */
public static String titleText() {
    return this.title;
}
```

**正确写法：**

```java
/**
 * 读取当前对象的标题。
 *
 * @return 标题
 */
public String titleText() {
    return title;
}
```

**验证方式：** 把 `static` 删除后用对象调用；如果方法确实只处理类级状态，则保留 `static` 并显式传入所需
对象，再分别在两个 JDK 编译。

### 通过对象变量调用 static 成员造成误读

**触发条件：** 写成 `firstTask.createdCount()` 或 `firstTask.PROJECT_NAME`。

**原因：** Java 允许这种写法，但静态成员实际属于类，不属于 `firstTask` 这个实例。

**后果：** 当前代码通常仍能编译，读者却可能误以为更换对象会得到不同计数或常量；后续维护容易把实例状态
和类级状态混在一起。

**错误示例：**

```java
TeamFlowTask firstTask = new TeamFlowTask("整理需求");
System.out.println(firstTask.createdCount());
```

**正确写法：**

```java
System.out.println(TeamFlowTask.createdCount());
```

**验证方式：** 让两个不同对象调用两种写法并比较输出；数值相同证明它们访问的是同一个类级字段，改用类名
后代码意图更清楚。

### final 局部变量或参数被再次赋值

**触发条件：** 给已经初始化的 `final` 变量或方法参数重新赋值。

**原因：** `final` 变量只能在声明处或规定的首次赋值位置写入一次。

**后果：** 两个 JDK 都在编译阶段报告变量不能再次赋值。

**错误示例：**

```java
final int maxTasks = 100;
maxTasks = 200;
```

**正确写法：**

```java
final int maxTasks = 100;
System.out.println(maxTasks);
```

**验证方式：** 先编译错误版本确认非零退出，再删除第二次赋值并重新编译运行。

### final 引用被误解成对象完全不可变

**触发条件：** 因为变量声明为 `final`，就认为 `final TaskCard` 的标题不能通过公开行为改变。

**原因：** `final` 锁定的是引用变量本身，禁止它指向另一个对象；引用对象是否可变取决于对象的类设计。

**后果：** 代码可能继续修改对象内部状态，若误以为状态已冻结，就会产生错误业务假设。

**错误示例：**

```java
final TaskCard task = new TaskCard("整理需求");
task.renameTo("确认需求"); // 这行仍然可以改变 TaskCard 的内部标题
```

**正确写法：**

```java
final TaskCard task = new TaskCard("整理需求");
System.out.println(task.title());
task.renameTo("确认需求");
System.out.println(task.title());
// task = new TaskCard("编写接口"); // 只有重新指向才是 final 违规
```

**验证方式：** 运行正确示例应依次看到 `整理需求` 和 `确认需求`；取消注释重新赋值行后，两个 JDK 都应在编译阶段拒绝代码。

### 忘记给 final 字段完成一次赋值

**触发条件：** 声明 `private final int taskNumber;`，却没有在声明处或每个构造路径中赋值。

**原因：** final 字段必须在对象可使用前完成一次明确赋值，编译器不能接受可能未初始化的固定字段。

**后果：** 类无法编译；若为逃避错误改成默认值，又可能让不同任务得到错误身份。

**错误示例：**

```java
public class TaskIdentity {
    private final int taskNumber;

    /**
     * 没有初始化 final 字段的构造方法。
     */
    public TaskIdentity() {
    }
}
```

**正确写法：**

```java
public class TaskIdentity {
    private final int taskNumber;

    /**
     * 在构造时确定任务编号。
     *
     * @param taskNumber 任务编号
     */
    public TaskIdentity(int taskNumber) {
        this.taskNumber = taskNumber;
    }

    /**
     * 读取已经固定的任务编号。
     *
     * @return 任务编号
     */
    public int number() {
        return taskNumber;
    }
}
```

**验证方式：** 错误版本用 `javac` 编译应失败；补齐构造赋值和读取方法后重新编译，并创建对象读取固定编号。

### 把 static final 常量写成可变字段

**触发条件：** 项目名称或上限需要被所有代码共享，却只声明 `static`，或者在使用处重新赋值。

**原因：** `static` 只表达共享，不表达不可修改；常量需要同时使用 `final` 并通过类名访问。

**后果：** 任意可访问代码可能改写全局值，后续任务看到不一致的项目规则。

**错误示例：**

```java
public static String PROJECT_NAME = "TeamFlow";
PROJECT_NAME = "OtherProject";
```

**正确写法：**

```java
public static final String PROJECT_NAME = "TeamFlow";
// PROJECT_NAME = "OtherProject"; // 编译错误：final 字段不能再次赋值
```

**验证方式：** 保留重新赋值行编译应失败；删除后用 `TeamFlowTask.PROJECT_NAME` 读取，两个 JDK 都应输出
`TeamFlow`。
:::

## 九、练习与完整参考实现

:::exercise
### TeamFlow 学习看板

**要求：** 创建 `TeamFlowBoardTask` 和 `TeamFlowBoardApplication` 两个类。任务类必须包含共享的下一个
编号、`static final` 看板名称、每个任务自己的 `final taskNumber` 和 `final title`；提供静态方法读取下一
个编号，提供实例方法返回 `#编号 标题`。启动类创建两个任务并输出看板名称、两个摘要和下一个编号。只
使用本课已经出现的 `static`、`static final`、`final`、构造方法、实例方法、静态方法和
`System.out.println`；不要引入集合、继承、异常或第三方库。JDK 25 与 Java 8 都必须使用传统
`public static void main(String[] args)` 入口。

**验收：** 输出必须依次包含 `TeamFlow 学习看板`、`#1 整理需求`、`#2 编写接口` 和 `下一个编号：3`；
两个版本的结果一致。
:::

### 1. JDK 25 参考实现

在 JDK 25 项目中创建 `src/teamflow/TeamFlowBoardTask.java`：

```java
package teamflow;

public class TeamFlowBoardTask {
    public static final String BOARD_NAME = "TeamFlow 学习看板";
    private static int nextTaskNumber = 1;

    private final int taskNumber;
    private final String title;

    /**
     * 创建一个拥有固定编号和标题的看板任务。
     *
     * @param title 任务标题
     */
    public TeamFlowBoardTask(String title) {
        taskNumber = nextTaskNumber;
        nextTaskNumber++;
        this.title = title;
    }

    /**
     * 读取下一个尚未分配的任务编号。
     *
     * @return 下一个编号
     */
    public static int nextNumber() {
        return nextTaskNumber;
    }

    /**
     * 返回当前任务摘要。
     *
     * @return 编号和标题
     */
    public String summary() {
        return "#" + taskNumber + " " + title;
    }
}
```

在 `src/teamflow/TeamFlowBoardApplication.java` 中创建：

```java
package teamflow;

public class TeamFlowBoardApplication {
    /**
     * 创建两个看板任务并输出静态常量、实例摘要和共享计数。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        TeamFlowBoardTask firstTask = new TeamFlowBoardTask("整理需求");
        TeamFlowBoardTask secondTask = new TeamFlowBoardTask("编写接口");

        System.out.println("看板：" + TeamFlowBoardTask.BOARD_NAME);
        System.out.println(firstTask.summary());
        System.out.println(secondTask.summary());
        System.out.println("下一个编号：" + TeamFlowBoardTask.nextNumber());
    }
}
```

JDK 25 中在 IDEA 里确认 Project SDK、模块 SDK 和运行配置 JRE 都是 JDK 25，从
`TeamFlowBoardApplication.main` 运行。预期输出：

```text
看板：TeamFlow 学习看板
#1 整理需求
#2 编写接口
下一个编号：3
```

也可以将这两个文件编译到独立的 `out-25-exercise` 目录：

```bash
mkdir -p out-25-exercise
javac -d out-25-exercise teamflow/TeamFlowBoardTask.java teamflow/TeamFlowBoardApplication.java
java -cp out-25-exercise teamflow.TeamFlowBoardApplication
```

### 2. Java 8 完整参考实现

Java 8 项目中的 `src/teamflow/TeamFlowBoardTask.java` 完整内容如下：

```java
package teamflow;

public class TeamFlowBoardTask {
    public static final String BOARD_NAME = "TeamFlow 学习看板";
    private static int nextTaskNumber = 1;

    private final int taskNumber;
    private final String title;

    /**
     * 创建一个拥有固定编号和标题的看板任务。
     *
     * @param title 任务标题
     */
    public TeamFlowBoardTask(String title) {
        taskNumber = nextTaskNumber;
        nextTaskNumber++;
        this.title = title;
    }

    /**
     * 读取下一个尚未分配的任务编号。
     *
     * @return 下一个编号
     */
    public static int nextNumber() {
        return nextTaskNumber;
    }

    /**
     * 返回当前任务摘要。
     *
     * @return 编号和标题
     */
    public String summary() {
        return "#" + taskNumber + " " + title;
    }
}
```

Java 8 项目中的 `src/teamflow/TeamFlowBoardApplication.java` 完整内容如下：

```java
package teamflow;

public class TeamFlowBoardApplication {
    /**
     * 创建两个看板任务并输出静态常量、实例摘要和共享计数。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        TeamFlowBoardTask firstTask = new TeamFlowBoardTask("整理需求");
        TeamFlowBoardTask secondTask = new TeamFlowBoardTask("编写接口");

        System.out.println("看板：" + TeamFlowBoardTask.BOARD_NAME);
        System.out.println(firstTask.summary());
        System.out.println(secondTask.summary());
        System.out.println("下一个编号：" + TeamFlowBoardTask.nextNumber());
    }
}
```

在 IDEA 中将 Project SDK、模块 SDK 和运行配置 JRE 设为 JDK 8，从 `TeamFlowBoardApplication.main` 运行。
也可以将这两个文件编译到独立的 `out-8-exercise` 目录：

```bash
mkdir -p out-8-exercise
javac -d out-8-exercise teamflow/TeamFlowBoardTask.java teamflow/TeamFlowBoardApplication.java
java -cp out-8-exercise teamflow.TeamFlowBoardApplication
```

Java 8 的预期输出与 JDK 25 完全相同：

```text
看板：TeamFlow 学习看板
#1 整理需求
#2 编写接口
下一个编号：3
```

这里没有“同上”：两个版本都列出了完整任务类、启动类、IDEA 设置和终端运行命令。`BOARD_NAME` 是类级常量，
`nextTaskNumber` 是类级共享计数器，`taskNumber` 与 `title` 是每个对象各自只能写入一次的字段；输出的
`1`、`2`、`3` 正好对应这三种归属关系。
