---
id: backend.java.learn.basics.task-domain-modeling-project
type: lesson
title: 实战：任务领域建模
summary: 把 TeamFlow 任务的身份、标题、状态和允许的状态变化组织成一个可运行的领域对象
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 105
prerequisites:
  - backend.java.learn.basics.enums-and-finite-values
objectives:
  - 能从 TeamFlow 任务需求中识别对象、状态、固定规则和行为。
  - 能用构造器建立一开始就可用的任务对象。
  - 能用 private 字段和公开行为方法保护任务状态。
  - 能区分对象自己的字段、final 身份和 static final 类型级规则。
  - 能用枚举限定任务状态，并阻止不合法的状态跳转。
  - 能在 JDK 25 与 Java 8 项目中运行完整的任务领域模型。
recap:
  - 领域建模先从业务名词、状态和动作出发，再决定类、字段、枚举和方法。
  - 构造器负责建立合法初始状态，公开方法负责后续受控变化。
  - private 字段避免外部绕过规则，查询方法只暴露调用方真正需要的信息。
  - final 适合对象创建后不再改写的身份，static final 适合所有对象共享的规则常量。
  - 枚举限定状态集合，start 与 complete 把允许的状态变化留在 Task 内部。
  - 本课核心源码在 JDK 25 与 Java 8 中相同，差别只在各自项目 JDK 与输出目录。
related: []
tags:
  - Java
  - 领域建模
  - 类与对象
  - 封装
  - 枚举
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 兼容写法在对应小节完整给出
verifiedAt: 2026-08-17
sources:
  - id: dev-java-creating-classes-domain-model
    title: Creating Classes - Dev.java
    url: https://dev.java/learn/classes-objects/creating-classes
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java；Java SE
    claims:
      - 类体用字段保存对象状态，用构造器初始化对象，用方法实现对象行为
      - private 字段只能由类内部直接访问，可通过 public 方法提供受控访问
  - id: dev-java-creating-objects-domain-model
    title: Creating and Using Objects - Dev.java
    url: https://dev.java/learn/creating-and-using-objects
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java；Java SE
    claims:
      - new 表达式调用构造器创建对象，变量保存对象引用
      - 调用方通过对象引用和点号访问可见成员
  - id: dev-java-more-on-classes-domain-model
    title: More on Classes - Dev.java
    url: https://dev.java/learn/classes-objects/more-on-classes
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java；Java SE
    claims:
      - 实例字段属于各个对象，static 成员属于类
      - static 与 final 组合可声明类型级常量
  - id: dev-java-enums-domain-model
    title: Enums - Dev.java
    url: https://dev.java/learn/classes-objects/enums
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java；Java SE
    claims:
      - 枚举适合声明有限常量集合，并可拥有字段、构造器和方法
      - 枚举常量可以安全地参与状态判断
  - id: jls-25-classes-domain-model
    title: Java Language Specification 25 - Classes
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 类成员、构造器、访问修饰符、static、final 与枚举的语言规则
  - id: jls-8-classes-domain-model
    title: Java Language Specification 8 - Classes
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - 本课使用的普通类、构造器、访问修饰符、static、final 与枚举规则在 Java 8 中可用
  - id: fowler-tell-dont-ask-task-domain
    title: Tell Dont Ask - Martin Fowler
    url: https://martinfowler.com/bliki/TellDontAsk.html
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: 面向对象设计原则；用于本课小型内存领域对象
    claims:
      - 紧密相关的数据和行为通常应放在同一对象中
      - 调用方优先要求对象执行行为，而不是读取内部数据后在外部改写状态
---

# 实战：任务领域建模

前面的 TeamFlow 命令行程序已经能保存标题、标记完成并打印结果，但数组中的同一个下标、布尔值和标题
之间只是靠编写者记住对应关系。现在需求更明确了：每项任务都有固定编号、可修改标题和受限制的状态；任务
只能从“待开始”进入“进行中”，再进入“已完成”。这些规则适合由一个任务对象自己维护。

本课把已经学过的类、构造器、`this`、访问控制、`static`、`final` 和枚举连接成一个小型领域模型。这里的
“领域”就是程序要处理的业务范围；“模型”是用代码表达其中的名词、状态和动作。本课仍是普通 Java 内存
程序，不引入继承、接口、集合、`equals`、`record`、数据库、JSON、Maven 或 Spring。

## 一、把需求翻译成对象边界

### 1. 先找名词、状态和动作

先不要急着写字段。把需求拆成三类信息：

- **名词：** 任务，是需要独立存在和操作的对象。
- **状态：** 编号、标题和处理状态，是任务在某一刻保存的数据。
- **动作：** 改名、开始和完成，是允许任务发生的变化。

这三类信息对应到 Java 时，`Task` 类描述任务，字段保存状态，构造器建立初始对象，方法实现动作，
`TaskStatus` 枚举限定全部合法处理状态。模型不是把需求中的每个词都创建成类，而是让每个类型承担一组
清晰职责。

### 2. 先写出必须一直成立的规则

一个任务对象无论刚创建还是经过操作，都应满足这些规则：

1. 编号是正数，并且创建后不再改变。
2. 标题去掉首尾空白后不能为空，长度不能超过 20 个字符。
3. 新任务从 `BACKLOG` 开始。
4. 只有 `BACKLOG` 可以开始，只有 `IN_PROGRESS` 可以完成。
5. 外部代码不能直接把状态改成任意值。

这些“对象始终要守住的条件”是本课的建模边界。构造器负责前两项和初始状态，`private` 字段阻止外部
绕过规则，`start()`、`complete()` 和 `rename()` 负责后续变化。

### 3. 决定哪些信息属于对象，哪些属于类型

`id`、`title` 和 `status` 每个任务各有一份，所以是实例字段。标题长度上限对所有任务相同，不属于某个
具体任务，因此写成 `Task.MAX_TITLE_LENGTH` 类型级常量：

```java
public final class Task {
    public static final int MAX_TITLE_LENGTH = 20;

    private final int id;
    private String title;
    private TaskStatus status;
}
```

`final int id` 表示字段初始化后不能再次赋值；标题和状态需要按规则变化，所以没有声明为 `final`。
`static final` 上限只保存一份，并通过类名访问。`Task` 类本身暂时也声明为 `final`，明确本课不通过继承
改变它的规则；继承与重写会在后续课程单独学习。

## 二、用构造器建立可用对象

### 1. 构造器一次完成必要初始化

调用方创建任务时必须同时提供编号和标题，状态由模型统一设为 `BACKLOG`：

```java
/**
 * 创建具有固定编号、合法标题和待开始状态的任务。
 *
 * @param id 任务编号
 * @param title 任务标题
 */
public Task(int id, String title) {
    if (id <= 0) {
        throw new IllegalArgumentException("任务编号必须是正数");
    }
    this.id = id;
    this.title = normalizeTitle(title);
    this.status = TaskStatus.BACKLOG;
}
```

这里的 `this.id` 是当前对象的字段，右侧 `id` 是构造器参数。构造完成后，三个实例字段都已经有明确值，
调用方不会拿到“编号还没填”或“状态尚未决定”的半成品任务。

### 2. 让创建和改名复用同一条标题规则

标题既能在构造时传入，也能在之后改名。如果两处各写一套判断，规则很容易漂移。把只供类内部使用的
标题处理集中到一个 `private static` 方法：

```java
/**
 * 去除标题首尾空白并检查任务标题规则。
 *
 * @param rawTitle 原始标题
 * @return 可保存的标题
 */
private static String normalizeTitle(String rawTitle) {
    if (rawTitle == null) {
        throw new IllegalArgumentException("任务标题不能为空");
    }

    String normalized = rawTitle.trim();
    if (normalized.isEmpty() || normalized.length() > MAX_TITLE_LENGTH) {
        throw new IllegalArgumentException("任务标题长度必须是 1 到 20 个字符");
    }
    return normalized;
}
```

本课只把 `null` 当作构造器和改名操作必须拒绝的一种非法输入，不展开空引用的完整处理体系。
`normalizeTitle()` 不依赖某个任务实例，所以声明为 `static`；它仍是 `private`，调用方只需通过构造器和
`rename()` 使用规则，不需要知道内部如何清理文本。

### 3. 创建两个对象观察实例隔离

```java
Task first = new Task(1001, "设计任务看板");
Task second = new Task(1002, "整理接口清单");

first.rename("完成任务看板设计");
```

两个 `new Task(...)` 分别创建对象。修改 `first` 的标题不会改变 `second`，因为 `title` 是实例字段；
`MAX_TITLE_LENGTH` 则是两者共享的类型级规则。对象变量保存的是引用，但每个引用指向哪个任务仍由创建
表达式决定。

## 三、让任务自己执行状态变化

### 1. 用枚举限定合法状态

任务状态只有三个值，继续使用上一课的枚举：

```java
public enum TaskStatus {
    BACKLOG("待开始"),
    IN_PROGRESS("进行中"),
    DONE("已完成");

    private final String label;

    /**
     * 创建具有固定展示文字的任务状态。
     *
     * @param label 展示文字
     */
    TaskStatus(String label) {
        this.label = label;
    }

    /**
     * 返回任务状态的展示文字。
     *
     * @return 展示文字
     */
    public String label() {
        return label;
    }
}
```

`TaskStatus` 只负责“有哪些状态”和每个状态的固定文字。某项任务当前处于哪个状态，以及何时允许变化，
仍由 `Task` 对象负责。

### 2. 用行为方法守住转换顺序

不要提供能接收任意状态的 `setStatus()`。调用方真正要表达的是“开始任务”或“完成任务”：

```java
/**
 * 尝试开始当前任务。
 *
 * @return 状态从待开始变为进行中时返回 true，否则返回 false
 */
public boolean start() {
    if (status != TaskStatus.BACKLOG) {
        return false;
    }
    status = TaskStatus.IN_PROGRESS;
    return true;
}

/**
 * 尝试完成当前任务。
 *
 * @return 状态从进行中变为已完成时返回 true，否则返回 false
 */
public boolean complete() {
    if (status != TaskStatus.IN_PROGRESS) {
        return false;
    }
    status = TaskStatus.DONE;
    return true;
}
```

返回值让入口能观察操作是否生效。待开始任务调用 `complete()` 会得到 `false` 且保持原状态；已经开始的
任务第一次调用 `start()` 得到 `true`，再次调用得到 `false`。状态检查和赋值都在同一个对象内部，调用方
不需要先读取状态再自行决定写什么。

### 3. 查询方法与命令方法承担不同职责

`id()`、`title()`、`status()` 和 `summary()` 只读取对象，不改变字段；`rename()`、`start()` 和
`complete()` 表达命令，可能改变对象。公开方法不等于每个字段都必须同时提供 getter 和 setter，模型只
开放当前使用场景需要的操作。

```java
/**
 * 修改任务标题并继续遵守标题规则。
 *
 * @param newTitle 新标题
 */
public void rename(String newTitle) {
    this.title = normalizeTitle(newTitle);
}

/**
 * 返回适合控制台查看的任务摘要。
 *
 * @return 任务摘要
 */
public String summary() {
    return "#" + id + " " + title + " [" + status.label() + "]";
}
```

**社区补充：** Martin Fowler 的 Tell Don’t Ask 是一条设计提醒，不是 Java 编译器规则：与状态紧密相关的行为通常放回
拥有该状态的对象。本课采用它来解释 `task.start()` 和 `task.complete()`，并不把“永远不能读取数据”当作
绝对规则；控制台仍通过 `summary()` 获取需要展示的信息。

## 四、组装完整 TeamFlow 领域程序

### 1. 文件与职责

普通 Java 项目使用以下源码目录：

```text
src/
└── teamflow/
    ├── TeamFlowDomainApplication.java
    └── domain/
        ├── Task.java
        └── TaskStatus.java
```

`teamflow.domain` 保存任务模型，`teamflow` 保存本课的启动入口。三个公开类型分别放在同名文件中。模型
不读取控制台，也不知道将来是否由 Web 接口调用；入口只负责创建对象、发出命令和打印可观察结果。

### 2. JDK 25 完整程序

`src/teamflow/domain/TaskStatus.java`：

```java
package teamflow.domain;

public enum TaskStatus {
    BACKLOG("待开始"),
    IN_PROGRESS("进行中"),
    DONE("已完成");

    private final String label;

    /**
     * 创建具有固定展示文字的任务状态。
     *
     * @param label 展示文字
     */
    TaskStatus(String label) {
        this.label = label;
    }

    /**
     * 返回任务状态的展示文字。
     *
     * @return 展示文字
     */
    public String label() {
        return label;
    }
}
```

`src/teamflow/domain/Task.java`：

```java
package teamflow.domain;

public final class Task {
    public static final int MAX_TITLE_LENGTH = 20;

    private final int id;
    private String title;
    private TaskStatus status;

    /**
     * 创建具有固定编号、合法标题和待开始状态的任务。
     *
     * @param id 任务编号
     * @param title 任务标题
     * @throws IllegalArgumentException 编号或标题不符合规则时抛出
     */
    public Task(int id, String title) {
        if (id <= 0) {
            throw new IllegalArgumentException("任务编号必须是正数");
        }
        this.id = id;
        this.title = normalizeTitle(title);
        this.status = TaskStatus.BACKLOG;
    }

    /**
     * 返回任务编号。
     *
     * @return 任务编号
     */
    public int id() {
        return id;
    }

    /**
     * 返回任务标题。
     *
     * @return 任务标题
     */
    public String title() {
        return title;
    }

    /**
     * 返回当前任务状态。
     *
     * @return 当前任务状态
     */
    public TaskStatus status() {
        return status;
    }

    /**
     * 修改任务标题并继续遵守标题规则。
     *
     * @param newTitle 新标题
     */
    public void rename(String newTitle) {
        this.title = normalizeTitle(newTitle);
    }

    /**
     * 尝试开始当前任务。
     *
     * @return 状态从待开始变为进行中时返回 true，否则返回 false
     */
    public boolean start() {
        if (status != TaskStatus.BACKLOG) {
            return false;
        }
        status = TaskStatus.IN_PROGRESS;
        return true;
    }

    /**
     * 尝试完成当前任务。
     *
     * @return 状态从进行中变为已完成时返回 true，否则返回 false
     */
    public boolean complete() {
        if (status != TaskStatus.IN_PROGRESS) {
            return false;
        }
        status = TaskStatus.DONE;
        return true;
    }

    /**
     * 返回适合控制台查看的任务摘要。
     *
     * @return 任务摘要
     */
    public String summary() {
        return "#" + id + " " + title + " [" + status.label() + "]";
    }

    /**
     * 去除标题首尾空白并检查任务标题规则。
     *
     * @param rawTitle 原始标题
     * @return 可保存的标题
     * @throws IllegalArgumentException 标题不符合规则时抛出
     */
    private static String normalizeTitle(String rawTitle) {
        if (rawTitle == null) {
            throw new IllegalArgumentException("任务标题不能为空");
        }

        String normalized = rawTitle.trim();
        if (normalized.isEmpty() || normalized.length() > MAX_TITLE_LENGTH) {
            throw new IllegalArgumentException("任务标题长度必须是 1 到 20 个字符");
        }
        return normalized;
    }
}
```

`src/teamflow/TeamFlowDomainApplication.java`：

```java
package teamflow;

import teamflow.domain.Task;

public final class TeamFlowDomainApplication {
    /**
     * 创建两项任务并观察各自独立、受控的状态变化。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        Task boardTask = new Task(1001, "设计任务看板");
        Task apiTask = new Task(1002, "整理接口清单");

        System.out.println("标题长度上限：" + Task.MAX_TITLE_LENGTH);
        System.out.println("初始：" + boardTask.summary());
        System.out.println("开始：" + boardTask.start());
        System.out.println("重复开始：" + boardTask.start());
        System.out.println("待开始直接完成：" + apiTask.complete());

        boardTask.rename("完成任务看板设计");
        System.out.println("完成：" + boardTask.complete());
        System.out.println("结果：" + boardTask.summary());
        System.out.println("另一任务：" + apiTask.summary());
    }
}
```

### 3. Java 8 完整程序

本课使用的普通类、构造器、访问控制、`static final`、枚举和传统 `main` 入口在 Java 8 中都可用。为了
让 Java 8 项目可以独立复制运行，下面仍给出完整源码。

Java 8 的 `src/teamflow/domain/TaskStatus.java`：

```java
package teamflow.domain;

public enum TaskStatus {
    BACKLOG("待开始"),
    IN_PROGRESS("进行中"),
    DONE("已完成");

    private final String label;

    /**
     * 创建具有固定展示文字的任务状态。
     *
     * @param label 展示文字
     */
    TaskStatus(String label) {
        this.label = label;
    }

    /**
     * 返回任务状态的展示文字。
     *
     * @return 展示文字
     */
    public String label() {
        return label;
    }
}
```

Java 8 的 `src/teamflow/domain/Task.java`：

```java
package teamflow.domain;

public final class Task {
    public static final int MAX_TITLE_LENGTH = 20;

    private final int id;
    private String title;
    private TaskStatus status;

    /**
     * 创建具有固定编号、合法标题和待开始状态的任务。
     *
     * @param id 任务编号
     * @param title 任务标题
     * @throws IllegalArgumentException 编号或标题不符合规则时抛出
     */
    public Task(int id, String title) {
        if (id <= 0) {
            throw new IllegalArgumentException("任务编号必须是正数");
        }
        this.id = id;
        this.title = normalizeTitle(title);
        this.status = TaskStatus.BACKLOG;
    }

    /**
     * 返回任务编号。
     *
     * @return 任务编号
     */
    public int id() {
        return id;
    }

    /**
     * 返回任务标题。
     *
     * @return 任务标题
     */
    public String title() {
        return title;
    }

    /**
     * 返回当前任务状态。
     *
     * @return 当前任务状态
     */
    public TaskStatus status() {
        return status;
    }

    /**
     * 修改任务标题并继续遵守标题规则。
     *
     * @param newTitle 新标题
     */
    public void rename(String newTitle) {
        this.title = normalizeTitle(newTitle);
    }

    /**
     * 尝试开始当前任务。
     *
     * @return 状态从待开始变为进行中时返回 true，否则返回 false
     */
    public boolean start() {
        if (status != TaskStatus.BACKLOG) {
            return false;
        }
        status = TaskStatus.IN_PROGRESS;
        return true;
    }

    /**
     * 尝试完成当前任务。
     *
     * @return 状态从进行中变为已完成时返回 true，否则返回 false
     */
    public boolean complete() {
        if (status != TaskStatus.IN_PROGRESS) {
            return false;
        }
        status = TaskStatus.DONE;
        return true;
    }

    /**
     * 返回适合控制台查看的任务摘要。
     *
     * @return 任务摘要
     */
    public String summary() {
        return "#" + id + " " + title + " [" + status.label() + "]";
    }

    /**
     * 去除标题首尾空白并检查任务标题规则。
     *
     * @param rawTitle 原始标题
     * @return 可保存的标题
     * @throws IllegalArgumentException 标题不符合规则时抛出
     */
    private static String normalizeTitle(String rawTitle) {
        if (rawTitle == null) {
            throw new IllegalArgumentException("任务标题不能为空");
        }

        String normalized = rawTitle.trim();
        if (normalized.isEmpty() || normalized.length() > MAX_TITLE_LENGTH) {
            throw new IllegalArgumentException("任务标题长度必须是 1 到 20 个字符");
        }
        return normalized;
    }
}
```

Java 8 的 `src/teamflow/TeamFlowDomainApplication.java`：

```java
package teamflow;

import teamflow.domain.Task;

public final class TeamFlowDomainApplication {
    /**
     * 创建两项任务并观察各自独立、受控的状态变化。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        Task boardTask = new Task(1001, "设计任务看板");
        Task apiTask = new Task(1002, "整理接口清单");

        System.out.println("标题长度上限：" + Task.MAX_TITLE_LENGTH);
        System.out.println("初始：" + boardTask.summary());
        System.out.println("开始：" + boardTask.start());
        System.out.println("重复开始：" + boardTask.start());
        System.out.println("待开始直接完成：" + apiTask.complete());

        boardTask.rename("完成任务看板设计");
        System.out.println("完成：" + boardTask.complete());
        System.out.println("结果：" + boardTask.summary());
        System.out.println("另一任务：" + apiTask.summary());
    }
}
```

## 五、分别配置并运行两个版本

### 1. 在 IDEA 中运行 JDK 25 版本

1. 创建普通 Java 项目，把 Project SDK 和模块 SDK 设为 JDK 25。
2. 按目录创建 `teamflow` 与 `teamflow.domain` 包，再创建三个同名 Java 文件。
3. 打开 `TeamFlowDomainApplication.main()` 的运行配置，确认 JRE 是项目的 JDK 25。
4. 运行入口，观察每次布尔结果与随后摘要是否一致。

终端从 JDK 25 项目根目录执行：

```bash
mkdir -p out-25-domain
javac -encoding UTF-8 -d out-25-domain src/teamflow/domain/TaskStatus.java src/teamflow/domain/Task.java src/teamflow/TeamFlowDomainApplication.java
java -cp out-25-domain teamflow.TeamFlowDomainApplication
```

### 2. 在 IDEA 中运行 Java 8 版本

1. 创建独立普通 Java 项目，把 Project SDK 和模块 SDK 设为已配置的 JDK 8。
2. 使用 Java 8 小节的三份完整源码，不与 JDK 25 项目共用 class 输出目录。
3. 确认运行配置 JRE 是项目的 JDK 8，再运行同一个全限定入口。

终端从 Java 8 项目根目录执行：

```bash
mkdir -p out-8-domain
javac -encoding UTF-8 -d out-8-domain src/teamflow/domain/TaskStatus.java src/teamflow/domain/Task.java src/teamflow/TeamFlowDomainApplication.java
java -cp out-8-domain teamflow.TeamFlowDomainApplication
```

### 3. 核对共同输出

两个版本都应精确输出：

```text
标题长度上限：20
初始：#1001 设计任务看板 [待开始]
开始：true
重复开始：false
待开始直接完成：false
完成：true
结果：#1001 完成任务看板设计 [已完成]
另一任务：#1002 整理接口清单 [待开始]
```

第一项任务成功开始后再次开始，所以第二个结果是 `false`；第二项任务尚未开始就尝试完成，也返回
`false`。随后第一项任务改名并完成，最后两个摘要证明两个对象的标题和状态彼此独立。JDK 25 与 Java 8
在本课没有源码差异，独立配置用于证明同一模型确实由对应版本编译和运行。

## 六、集中处理建模中的常见错误

### 1. 让错误现象直接指向被破坏的规则

:::pitfalls
### 错误：把任务字段全部声明为 public

**触发条件：** 调用方直接执行 `task.status = TaskStatus.DONE`。

**原因：** public 字段让任何调用方绕过任务内部的状态转换规则。

**后果：** 待开始任务可以跳过进行中直接完成，模型无法保证自身始终合法。

**错误示例：**

```java
public final class OpenTask {
    public int id;
    public String title;
    public TaskStatus status;
}
```

**正确写法：**

```java
public final class ControlledTask {
    private TaskStatus status = TaskStatus.BACKLOG;

    /**
     * 只允许待开始任务进入进行中。
     *
     * @return 状态改变时返回 true，否则返回 false
     */
    public boolean start() {
        if (status != TaskStatus.BACKLOG) {
            return false;
        }
        status = TaskStatus.IN_PROGRESS;
        return true;
    }
}
```

**验证方式：** 外部直接访问 `status` 应编译失败，通过 `start()` 第一次得到 `true`、第二次得到 `false`。

### 错误：提供不受限制的 setStatus

**触发条件：** 入口对新任务调用 `setStatus(TaskStatus.DONE)`。

**原因：** 方法虽然包住了 private 字段，却仍接受任意目标状态，没有表达开始和完成的业务条件。

**后果：** 看似完成封装，实际上任何调用方仍能制造非法状态跳转。

**错误示例：**

```java
/**
 * 错误地允许调用方写入任意状态。
 *
 * @param status 任意目标状态
 */
public void setStatus(TaskStatus status) {
    this.status = status;
}
```

**正确写法：**

```java
/**
 * 只允许进行中的任务进入已完成。
 *
 * @return 状态改变时返回 true，否则返回 false
 */
public boolean complete() {
    if (status != TaskStatus.IN_PROGRESS) {
        return false;
    }
    status = TaskStatus.DONE;
    return true;
}
```

**验证方式：** 新任务直接 `complete()` 返回 `false` 且摘要仍显示“待开始”。

### 错误：把每项任务自己的状态声明为 static

**触发条件：** 创建两个任务后，只启动第一个任务。

**原因：** static 字段由类型共享，不属于某个任务对象。

**后果：** 修改第一项任务会让第二项任务也显示进行中，任务之间发生状态串扰。

**错误示例：**

```java
public final class BrokenStaticTask {
    private static TaskStatus status = TaskStatus.BACKLOG;

    /**
     * 开始任务，但错误地修改所有对象共享的状态。
     */
    public void start() {
        status = TaskStatus.IN_PROGRESS;
    }

    /**
     * 返回当前共享状态。
     *
     * @return 当前共享状态
     */
    public TaskStatus status() {
        return status;
    }

    /**
     * 创建两个对象并只启动第一个。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        BrokenStaticTask first = new BrokenStaticTask();
        BrokenStaticTask second = new BrokenStaticTask();
        first.start();
        System.out.println("第一个：" + first.status().label());
        System.out.println("第二个：" + second.status().label());
    }
}
```

**正确写法：**

```java
public final class IsolatedTask {
    private TaskStatus status = TaskStatus.BACKLOG;

    /**
     * 开始当前对象自己的任务。
     */
    public void start() {
        status = TaskStatus.IN_PROGRESS;
    }

    /**
     * 返回当前对象自己的状态。
     *
     * @return 当前对象自己的状态
     */
    public TaskStatus status() {
        return status;
    }

    /**
     * 创建两个对象并只启动第一个。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        IsolatedTask first = new IsolatedTask();
        IsolatedTask second = new IsolatedTask();
        first.start();
        System.out.println("第一个：" + first.status().label());
        System.out.println("第二个：" + second.status().label());
    }
}
```

**验证方式：** 运行错误版会看到两个对象都为“进行中”；运行正确版时，第一个为“进行中”，第二个仍为
“待开始”。

### 错误：构造器参数遮蔽字段却漏写 this

**触发条件：** `id` 字段声明为 `final`，构造器却写成 `id = id`。

**原因：** 两侧名称都解析为构造器参数，实例字段没有得到参数值。

**后果：** 空白 `final` 字段必须在构造器结束前完成赋值，因此编译器会拒绝这个构造器；如果字段不是
`final`，同样的错误才会编译通过并让编号保留默认值 `0`。

**错误示例：**

```java
public final class BrokenTask {
    private final int id;

    /**
     * 错误地把参数赋给参数自身。
     *
     * @param id 任务编号
     */
    public BrokenTask(int id) {
        id = id;
    }
}
```

**正确写法：**

```java
public final class Task {
    private final int id;

    /**
     * 把任务编号保存到当前对象。
     *
     * @param id 任务编号
     */
    public Task(int id) {
        this.id = id;
    }

    /**
     * 返回任务编号。
     *
     * @return 任务编号
     */
    public int id() {
        return id;
    }
}
```

**验证方式：** 编译错误示例应看到 `id` 可能尚未初始化；改为 `this.id = id` 后，创建编号 `1001` 的对象，
调用 `id()` 应返回 `1001`。

### 错误：认为 final 对象变量会冻结对象

**触发条件：** 把引用声明为 `final Task task` 后，仍观察到 `task.start()` 改变了状态。

**原因：** final 限制变量不能再次指向另一个对象，不会让所指对象的全部字段自动不可变。

**后果：** 错误依赖 final 引用保护状态，实际模型仍可能通过公开行为发生变化。

**错误示例：**

```java
public final class FrozenReferenceAssumptionApplication {
    /**
     * 运行程序观察 final 引用指向的对象仍可改变。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        final Task task = new Task(1001, "设计任务看板");
        task.start();
        System.out.println("仍是待开始：" + (task.status() == TaskStatus.BACKLOG));
    }
}
```

**正确写法：**

```java
public final class FinalReferenceApplication {
    /**
     * 固定任务引用，同时通过公开行为改变任务状态。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        final Task task = new Task(1001, "设计任务看板");
        System.out.println("启动：" + task.start());
        System.out.println(task.summary());

        // 取消下一行注释会因 final 引用重新赋值而编译失败。
        // task = new Task(1002, "实现任务看板");
    }
}
```

**验证方式：** 错误假设版输出“仍是待开始：false”；正确版输出“启动：true”和“进行中”摘要。取消重新
赋值行的注释后编译器才会拒绝代码，说明 `final` 限制的是引用重新赋值，不是对象行为。
:::

## 七、练习：独立建模项目里程碑

### 1. 任务与验收

:::exercise
### TeamFlow 项目里程碑

**要求：** 创建 `MilestoneState` 枚举和 `Milestone` 类。里程碑包含创建后不变的正数编号、可改名的名称和
状态；新对象从 `PLANNED` 开始，只能依次 `activate()`、`finish()`。名称上限是所有对象共享的 16 字符
常量。字段不能 public，不提供任意状态 setter，不使用继承或集合。

**验收：** JDK 25 与 Java 8 都能独立编译运行；激活、重复激活、完成和未激活直接完成的结果可观察；
两个对象互不影响；输出与参考结果逐行一致。

**参考答案：** 两个版本的完整枚举、领域类、入口、配置、命令和输出见后续小节。
:::

### 2. JDK 25 完整参考实现

`src/teamflow/domain/MilestoneState.java`：

```java
package teamflow.domain;

public enum MilestoneState {
    PLANNED("计划中"),
    ACTIVE("推进中"),
    FINISHED("已完成");

    private final String label;

    /**
     * 创建具有固定展示文字的里程碑状态。
     *
     * @param label 展示文字
     */
    MilestoneState(String label) {
        this.label = label;
    }

    /**
     * 返回里程碑状态的展示文字。
     *
     * @return 展示文字
     */
    public String label() {
        return label;
    }
}
```

`src/teamflow/domain/Milestone.java`：

```java
package teamflow.domain;

public final class Milestone {
    public static final int MAX_NAME_LENGTH = 16;

    private final int id;
    private String name;
    private MilestoneState state;

    /**
     * 创建具有固定编号、合法名称和计划中状态的里程碑。
     *
     * @param id 里程碑编号
     * @param name 里程碑名称
     * @throws IllegalArgumentException 编号或名称不符合规则时抛出
     */
    public Milestone(int id, String name) {
        if (id <= 0) {
            throw new IllegalArgumentException("里程碑编号必须是正数");
        }
        this.id = id;
        this.name = normalizeName(name);
        this.state = MilestoneState.PLANNED;
    }

    /**
     * 修改里程碑名称。
     *
     * @param newName 新名称
     */
    public void rename(String newName) {
        this.name = normalizeName(newName);
    }

    /**
     * 尝试激活当前里程碑。
     *
     * @return 从计划中变为推进中时返回 true，否则返回 false
     */
    public boolean activate() {
        if (state != MilestoneState.PLANNED) {
            return false;
        }
        state = MilestoneState.ACTIVE;
        return true;
    }

    /**
     * 尝试完成当前里程碑。
     *
     * @return 从推进中变为已完成时返回 true，否则返回 false
     */
    public boolean finish() {
        if (state != MilestoneState.ACTIVE) {
            return false;
        }
        state = MilestoneState.FINISHED;
        return true;
    }

    /**
     * 返回里程碑摘要。
     *
     * @return 里程碑摘要
     */
    public String summary() {
        return "#" + id + " " + name + " [" + state.label() + "]";
    }

    /**
     * 去除名称首尾空白并检查长度规则。
     *
     * @param rawName 原始名称
     * @return 可保存的名称
     * @throws IllegalArgumentException 名称不符合规则时抛出
     */
    private static String normalizeName(String rawName) {
        if (rawName == null) {
            throw new IllegalArgumentException("里程碑名称不能为空");
        }

        String normalized = rawName.trim();
        if (normalized.isEmpty() || normalized.length() > MAX_NAME_LENGTH) {
            throw new IllegalArgumentException("里程碑名称长度必须是 1 到 16 个字符");
        }
        return normalized;
    }
}
```

`src/teamflow/TeamFlowMilestoneApplication.java`：

```java
package teamflow;

import teamflow.domain.Milestone;

public final class TeamFlowMilestoneApplication {
    /**
     * 创建两个里程碑并验证受控状态变化。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        Milestone first = new Milestone(1, "任务看板可用");
        Milestone second = new Milestone(2, "接口联调完成");

        System.out.println("名称长度上限：" + Milestone.MAX_NAME_LENGTH);
        System.out.println("激活第一个：" + first.activate());
        System.out.println("重复激活：" + first.activate());
        System.out.println("直接完成第二个：" + second.finish());
        first.rename("任务看板上线");
        System.out.println("完成第一个：" + first.finish());
        System.out.println("第一个：" + first.summary());
        System.out.println("第二个：" + second.summary());
    }
}
```

### 3. Java 8 完整参考实现

Java 8 的 `src/teamflow/domain/MilestoneState.java`：

```java
package teamflow.domain;

public enum MilestoneState {
    PLANNED("计划中"),
    ACTIVE("推进中"),
    FINISHED("已完成");

    private final String label;

    /**
     * 创建具有固定展示文字的里程碑状态。
     *
     * @param label 展示文字
     */
    MilestoneState(String label) {
        this.label = label;
    }

    /**
     * 返回里程碑状态的展示文字。
     *
     * @return 展示文字
     */
    public String label() {
        return label;
    }
}
```

Java 8 的 `src/teamflow/domain/Milestone.java`：

```java
package teamflow.domain;

public final class Milestone {
    public static final int MAX_NAME_LENGTH = 16;

    private final int id;
    private String name;
    private MilestoneState state;

    /**
     * 创建具有固定编号、合法名称和计划中状态的里程碑。
     *
     * @param id 里程碑编号
     * @param name 里程碑名称
     * @throws IllegalArgumentException 编号或名称不符合规则时抛出
     */
    public Milestone(int id, String name) {
        if (id <= 0) {
            throw new IllegalArgumentException("里程碑编号必须是正数");
        }
        this.id = id;
        this.name = normalizeName(name);
        this.state = MilestoneState.PLANNED;
    }

    /**
     * 修改里程碑名称。
     *
     * @param newName 新名称
     */
    public void rename(String newName) {
        this.name = normalizeName(newName);
    }

    /**
     * 尝试激活当前里程碑。
     *
     * @return 从计划中变为推进中时返回 true，否则返回 false
     */
    public boolean activate() {
        if (state != MilestoneState.PLANNED) {
            return false;
        }
        state = MilestoneState.ACTIVE;
        return true;
    }

    /**
     * 尝试完成当前里程碑。
     *
     * @return 从推进中变为已完成时返回 true，否则返回 false
     */
    public boolean finish() {
        if (state != MilestoneState.ACTIVE) {
            return false;
        }
        state = MilestoneState.FINISHED;
        return true;
    }

    /**
     * 返回里程碑摘要。
     *
     * @return 里程碑摘要
     */
    public String summary() {
        return "#" + id + " " + name + " [" + state.label() + "]";
    }

    /**
     * 去除名称首尾空白并检查长度规则。
     *
     * @param rawName 原始名称
     * @return 可保存的名称
     * @throws IllegalArgumentException 名称不符合规则时抛出
     */
    private static String normalizeName(String rawName) {
        if (rawName == null) {
            throw new IllegalArgumentException("里程碑名称不能为空");
        }

        String normalized = rawName.trim();
        if (normalized.isEmpty() || normalized.length() > MAX_NAME_LENGTH) {
            throw new IllegalArgumentException("里程碑名称长度必须是 1 到 16 个字符");
        }
        return normalized;
    }
}
```

Java 8 的 `src/teamflow/TeamFlowMilestoneApplication.java`：

```java
package teamflow;

import teamflow.domain.Milestone;

public final class TeamFlowMilestoneApplication {
    /**
     * 创建两个里程碑并验证受控状态变化。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        Milestone first = new Milestone(1, "任务看板可用");
        Milestone second = new Milestone(2, "接口联调完成");

        System.out.println("名称长度上限：" + Milestone.MAX_NAME_LENGTH);
        System.out.println("激活第一个：" + first.activate());
        System.out.println("重复激活：" + first.activate());
        System.out.println("直接完成第二个：" + second.finish());
        first.rename("任务看板上线");
        System.out.println("完成第一个：" + first.finish());
        System.out.println("第一个：" + first.summary());
        System.out.println("第二个：" + second.summary());
    }
}
```

两个版本都在各自 IDEA 项目中选择对应 Project SDK、模块 SDK 和运行配置 JRE。终端命令与主程序相同，
只需把三个源文件改为 `MilestoneState.java`、`Milestone.java` 和
`TeamFlowMilestoneApplication.java`，并继续使用两个独立输出目录。

两个版本都应输出：

```text
名称长度上限：16
激活第一个：true
重复激活：false
直接完成第二个：false
完成第一个：true
第一个：#1 任务看板上线 [已完成]
第二个：#2 接口联调完成 [计划中]
```

这份结果证明状态顺序由里程碑对象控制，重复和越级操作不会改写状态；第一个对象改名并完成时，第二个对象
仍保留自己的名称与计划中状态。完成练习后，应能从一段需求独立得到“枚举状态 + 私有实例字段 + 构造器
初始规则 + 公开行为方法 + 类型级常量”的最小模型。
