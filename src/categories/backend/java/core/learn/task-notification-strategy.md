---
id: backend.java.learn.basics.task-notification-strategy
type: lesson
title: 实战：任务通知策略
summary: 用接口、多态和可替换策略，为 TeamFlow 任务选择不同的通知渠道
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 100
prerequisites:
  - backend.java.learn.basics.record-classes
objectives:
  - 能声明通知策略接口，并用 implements 让不同类遵守同一方法合同。
  - 能解释客户端、上下文和具体策略之间的职责边界。
  - 能把 record、枚举和接口组合成一个不依赖框架的 TeamFlow 通知程序。
  - 能观察多态调用如何让同一个服务委托给不同的通知实现。
  - 能识别具体类型字段、策略选择位置和接口方法签名不一致等常见错误。
  - 能分别运行 JDK 25 的 record 版本和 Java 8 的 final class 兼容版本。
recap:
  - 接口声明使用方需要的行为合同，具体类用 implements 提供方法体。
  - 上下文只持有策略接口并负责委托，客户端负责选择具体策略。
  - record 适合保存任务通知的固定数据；Java 8 用 final 字段和访问器组成固定数据对象。
  - 枚举限制通知渠道的取值，但不会自动创建或选择策略对象。
  - 多态调用根据实际策略对象执行对应实现，增加策略时不必把所有分支塞进服务类。
  - 两个版本都使用传统 main 入口；真正的差异只在 record 与 Java 8 final class 的数据对象写法。
related: []
tags:
  - Java
  - 接口
  - 多态
  - 策略
  - record
  - 枚举
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 使用 final class 兼容实现
verifiedAt: 2026-08-17
sources:
  - id: dev-java-oop-interfaces
    title: Objects, Classes, Interfaces, Packages, and Inheritance - Dev.java
    url: https://dev.java/learn/oop/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java SE 25 学习资料
    claims:
      - 接口描述类对外承诺的行为合同
      - 类使用 implements 声明并提供接口方法体
      - 调用方可以依赖接口而不依赖具体实现细节
  - id: jls25-interfaces
    title: Java Language Specification 25 - Interfaces
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - interface 是引用类型，接口方法声明构成类型合同
      - 类通过 implements 实现接口
  - id: jls25-method-invocation
    title: Java Language Specification 25 - Expressions
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 方法调用会根据目标对象的运行时类型进行动态查找
      - 接口调用可以委托到实际实现类的方法
  - id: java-tutorials-interfaces
    title: Interfaces - The Java Tutorials
    url: https://docs.oracle.com/javase/tutorial/java/IandI/createinterface.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java SE 8
    claims:
      - 接口不能直接实例化，只能由类实现或由接口扩展
      - 实现接口的可实例化类需要提供接口声明的方法体
  - id: java-tutorials-polymorphism
    title: Polymorphism - The Java Tutorials
    url: https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java SE 8
    claims:
      - JVM 会调用变量所引用对象的适当方法，而不是只看变量声明类型
      - 这种虚方法调用体现了 Java 的多态行为
  - id: jls8-interfaces
    title: Java Language Specification 8 - Interfaces
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-9.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 的 interface 和 implements 合同支持本课的策略接口
      - Java 8 支持接口中的抽象方法声明
  - id: jls8-method-invocation
    title: Java Language Specification 8 - Expressions
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 的接口或虚方法调用会按运行时对象进行动态查找
  - id: refactoring-guru-strategy
    title: Strategy - Refactoring.Guru
    url: https://refactoring.guru/design-patterns/strategy
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java SE 8 与 Java SE 25 的策略结构；Context/Client 职责在本课示例中成立
    claims:
      - Context 可以持有策略接口引用并只通过该接口委托
      - Client 选择具体策略并把它传给 Context
      - 策略数量很少且变化很少时不应为了模式名称增加不必要的类型
  - id: stackoverflow-strategy-polymorphism
    title: Is strategy design pattern no more than the basic use of polymorphism?
    url: https://stackoverflow.com/questions/37670842/is-strategy-design-pattern-no-more-than-the-basic-use-of-polymorphism
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java SE 8 与 Java SE 25 的策略模式与多态讨论；仅用于本课职责边界补充
    claims:
      - 社区讨论将策略结构与接口多态联系起来，但强调还需要清晰的变化点和职责边界
---

# 实战：任务通知策略

TeamFlow 的任务完成后可能要通知负责人，也可能只把消息写到团队控制台。两种通知都要接收同一份任务信息，
但真正发送的动作不同。本课把这个变化点单独放进策略对象，让通知服务只负责“交给当前策略处理”。

本课仍然是一个普通 Java 程序。示例不发送真实邮件、不连接网络，也不使用集合、异常处理、Maven 或 Spring。
你会看到前面学过的枚举、record、接口和多态如何组合成一条可运行的最短路径。

## 一、先把通知问题说清楚

### 1. 同一份任务数据，不同的发送动作

通知内容可以先表示成一个值：任务编号、接收者、消息和渠道。任务数据本身不应该知道“怎样发邮件”或“怎样写控制台”，
否则每增加一个渠道，就要修改数据类。

```java
/** 表示 TeamFlow 中一次待发送的任务通知。 */
record TaskNotification(
        String taskId,
        String recipient,
        String message,
        NotificationChannel channel) {
}

/** 限定本示例支持的通知渠道。 */
enum NotificationChannel {
    EMAIL,
    CONSOLE
}
```

`TaskNotification` 的四个组件就是通知的事实；`NotificationChannel` 只负责列出有限取值。它们都不负责创建策略对象。
在 TeamFlow 的练习项目中，可以把这段代码放在与首个程序相同的 Java 源码目录，先用默认包完成练习，避免把注意力转移到包管理。

### 2. 先写调用方真正需要的合同

接口描述“任何通知策略都必须能做什么”。它不关心邮件客户端、控制台格式或其他实现细节。

```java
/** 声明一种任务通知策略必须提供的行为。 */
interface NotificationStrategy {
    /**
     * 执行通知动作并返回可观察的结果文本。
     *
     * @param notification 待处理的任务通知
     * @return 本次通知的结果文本
     */
    String send(TaskNotification notification);
}
```

接口是引用类型，不能直接 `new NotificationStrategy()`。它给调用方一个稳定合同，具体类再用 `implements` 表示自己愿意遵守这份合同。

### 3. 两个实现只各自负责一种动作

```java
/** 以邮件渠道模拟发送任务通知。 */
final class EmailNotificationStrategy implements NotificationStrategy {
    /**
     * 模拟把通知交给邮件渠道。
     *
     * @param notification 待发送的任务通知
     * @return 邮件渠道的可观察结果
     */
    @Override
    public String send(TaskNotification notification) {
        return "[EMAIL] task=" + notification.taskId()
                + " recipient=" + notification.recipient()
                + " message=" + notification.message();
    }
}

/** 把任务通知写到控制台。 */
final class ConsoleNotificationStrategy implements NotificationStrategy {
    /**
     * 模拟把通知交给控制台渠道。
     *
     * @param notification 待发送的任务通知
     * @return 控制台渠道的可观察结果
     */
    @Override
    public String send(TaskNotification notification) {
        return "[CONSOLE] task=" + notification.taskId()
                + " recipient=" + notification.recipient()
                + " message=" + notification.message();
    }
}
```

`implements` 后，编译器会检查类是否提供了接口要求的 `send` 方法。`@Override` 让编译器进一步检查你写的是否确实覆盖了接口方法；
这比只依赖方法名更容易及时发现签名错误。

## 二、把变化隔离在策略对象中

### 1. 上下文只依赖接口

通知服务就是策略结构中的 Context。它保存 `NotificationStrategy` 引用，调用 `send`，但不知道当前对象究竟是邮件策略还是控制台策略。

```java
/** 负责把任务通知委托给当前策略的服务。 */
final class NotificationService {
    private final NotificationStrategy strategy;

    /**
     * 创建一个使用指定策略的通知服务。
     *
     * @param strategy 当前通知策略
     */
    NotificationService(NotificationStrategy strategy) {
        this.strategy = strategy;
    }

    /**
     * 委托当前策略发送通知。
     *
     * @param notification 待发送的任务通知
     * @return 当前策略产生的结果文本
     */
    String notify(TaskNotification notification) {
        return strategy.send(notification);
    }
}
```

构造器接收接口类型，而不是 `EmailNotificationStrategy`。因此同一个服务的代码可以接收任意实现，这就是组合：服务拥有一个策略引用，
而不是继承某个具体发送类。

**社区补充：** 社区策略结构通常把这个持有接口引用的对象称为 Context；它只通过接口委托，具体策略由外部 Client 选择。适用版本是
Java SE 8 和 Java SE 25，成立条件是策略实现共享同一个接口合同；本课把邮件策略替换为控制台策略后，服务代码不变且输出渠道发生变化，
以此核验该职责划分。这里的命名只是帮助理解职责，不会引入额外框架或运行时容器。

### 2. 客户端选择具体策略

客户端知道当前通知渠道与具体策略的对应关系，再把已经创建的策略交给服务。这里用一个小方法集中选择，不把选择逻辑藏进服务内部。

```java
/** 根据通知渠道创建对应策略的客户端辅助类。 */
final class NotificationStrategySelector {
    /**
     * 为指定渠道创建策略对象。
     *
     * @param channel 通知渠道
     * @return 与渠道匹配的策略
     */
    static NotificationStrategy select(NotificationChannel channel) {
        if (channel == NotificationChannel.EMAIL) {
            return new EmailNotificationStrategy();
        }
        return new ConsoleNotificationStrategy();
    }
}
```

这里的 `if` 只做一次选择，不承担发送动作。以后新增短信策略时，新增一个实现，并在客户端补上选择即可；`NotificationService` 仍然只调用
`strategy.send(notification)`。这正是接口合同和多态调用带来的隔离效果。

**社区补充：** 社区讨论指出，策略数量很少且不会变化时，直接调用一个简单方法可能更容易读。这个建议适用于 Java SE 8 和 Java SE 25，
成立条件是变化点确实只有一个固定实现；本课保留两个会变化的渠道，并通过同一个 `NotificationService` 得到两种输出，核验这里的策略
结构确实有可观察的替换价值，而不是为了模式名称增加类型。

### 3. 调用链如何流动

运行一条通知时，顺序可以按下面理解：

1. 客户端创建 `TaskNotification`，其中的 `channel` 是 `EMAIL` 或 `CONSOLE`。
2. 客户端调用 `NotificationStrategySelector.select`，得到某个具体策略对象。
3. 客户端用该对象创建 `NotificationService`；服务字段的静态类型仍然是 `NotificationStrategy`。
4. `NotificationService.notify` 调用接口方法 `send`。
5. JVM 根据实际对象找到 `EmailNotificationStrategy.send` 或 `ConsoleNotificationStrategy.send`，并返回对应文本。

这不是两个不同的 `notify` 方法，而是同一个服务方法对不同对象进行多态调用。JLS 将这种接口或虚方法调用描述为运行时目标查找；本课只观察
输出，不展开字节码或类装载过程。

## 三、运行 JDK 25 版本

### 1. 在 IntelliJ IDEA 中准备普通 Java 项目

1. 选择 **New Project**，语言选择 Java，创建普通 Java 项目，不添加 Maven 或其他构建工具。
2. 在 **Project SDK** 中选择已经安装的 JDK 25；如果列表没有它，使用 **Add JDK** 指向本机 JDK 25 的目录。
3. 在 `src` 下创建 `TaskNotificationStrategyApplication.java`。本课的完整示例只保留一个 `public` 类，其余类型放在同一文件中。
4. 把下面的完整代码粘贴进去，点击 `main` 方法左侧的运行图标。

Project SDK 决定 IDEA 编译和运行这个项目使用的 JDK。终端中的 `java -version` 可能仍然指向另一套 JDK，二者需要分别核对；
本课不要求修改系统环境变量。

### 2. 完整程序

```java
/** 运行 TeamFlow 任务通知策略示例的入口类。 */
public class TaskNotificationStrategyApplication {
    /**
     * 创建两条通知并观察不同策略的输出。
     *
     * @param args 命令行参数，本示例不使用
     */
    public static void main(String[] args) {
        TaskNotification emailTask = new TaskNotification(
                "TF-101",
                "alice@teamflow.example",
                "任务已完成",
                NotificationChannel.EMAIL);
        NotificationStrategy emailStrategy = NotificationStrategySelector.select(emailTask.channel());
        NotificationService emailService = new NotificationService(emailStrategy);

        TaskNotification consoleTask = new TaskNotification(
                "TF-102",
                "team-console",
                "需要人工确认",
                NotificationChannel.CONSOLE);
        NotificationStrategy consoleStrategy = NotificationStrategySelector.select(consoleTask.channel());
        NotificationService consoleService = new NotificationService(consoleStrategy);

        System.out.println(emailService.notify(emailTask));
        System.out.println(consoleService.notify(consoleTask));
    }
}

/** 限定任务通知的渠道。 */
enum NotificationChannel {
    EMAIL,
    CONSOLE
}

/** 保存一次任务通知所需的固定数据。 */
record TaskNotification(
        String taskId,
        String recipient,
        String message,
        NotificationChannel channel) {
}

/** 规定通知实现必须提供的发送动作。 */
interface NotificationStrategy {
    /**
     * 执行通知动作并返回结果文本。
     *
     * @param notification 待发送的任务通知
     * @return 当前渠道的结果文本
     */
    String send(TaskNotification notification);
}

/** 模拟邮件通知。 */
final class EmailNotificationStrategy implements NotificationStrategy {
    /**
     * 返回邮件渠道的模拟结果。
     *
     * @param notification 待发送的任务通知
     * @return 邮件渠道结果
     */
    @Override
    public String send(TaskNotification notification) {
        return "[EMAIL] task=" + notification.taskId()
                + " recipient=" + notification.recipient()
                + " message=" + notification.message();
    }
}

/** 模拟控制台通知。 */
final class ConsoleNotificationStrategy implements NotificationStrategy {
    /**
     * 返回控制台渠道的模拟结果。
     *
     * @param notification 待发送的任务通知
     * @return 控制台渠道结果
     */
    @Override
    public String send(TaskNotification notification) {
        return "[CONSOLE] task=" + notification.taskId()
                + " recipient=" + notification.recipient()
                + " message=" + notification.message();
    }
}

/** 把通知动作委托给策略的上下文。 */
final class NotificationService {
    private final NotificationStrategy strategy;

    /**
     * 创建通知服务。
     *
     * @param strategy 要使用的通知策略
     */
    NotificationService(NotificationStrategy strategy) {
        this.strategy = strategy;
    }

    /**
     * 委托策略处理通知。
     *
     * @param notification 待发送的任务通知
     * @return 策略返回的结果文本
     */
    String notify(TaskNotification notification) {
        return strategy.send(notification);
    }
}

/** 根据枚举渠道创建具体策略的客户端辅助类。 */
final class NotificationStrategySelector {
    /**
     * 选择通知策略。
     *
     * @param channel 通知渠道
     * @return 与渠道匹配的策略
     */
    static NotificationStrategy select(NotificationChannel channel) {
        if (channel == NotificationChannel.EMAIL) {
            return new EmailNotificationStrategy();
        }
        return new ConsoleNotificationStrategy();
    }
}
```

这份程序只用一个公共类，所以文件名必须是 `TaskNotificationStrategyApplication.java`。`main` 是启动入口；`record` 保存输入；
接口变量接收具体策略；服务把调用转交给策略；两个 `println` 让结果可直接观察。

### 3. 观察控制台输出

```text
[EMAIL] task=TF-101 recipient=alice@teamflow.example message=任务已完成
[CONSOLE] task=TF-102 recipient=team-console message=需要人工确认
```

第一行来自 `EmailNotificationStrategy`，第二行来自 `ConsoleNotificationStrategy`。`NotificationService` 的代码没有针对两个渠道分别写分支，
但运行时对象不同，所以实际执行的方法也不同。

## 四、Java 8 兼容版本

### 1. 只替换真正不同的数据对象写法

Java 8 和 JDK 25 都支持传统入口 `public static void main(String[] args)`、接口、`implements`、枚举和多态调用。Java 8 不支持 `record`，
因此把 `TaskNotification` 换成 `final class`：字段设为 `private final`，构造器接收四个值，提供与 record 组件同名的访问器，并手写
`equals`、`hashCode`、`toString`，保持前置课已经建立的对象合同。策略部分不因这个语法替换而改变。

下面的代码与 JDK 25 版本同样完整；不能把 Java 8 版本写成“同上”。

### 2. 在 IDEA 中配置并运行 Java 8 项目

1. 为 Java 8 版本新建一个普通 Java 项目或独立模块，避免与 JDK 25 版本共用同一个编译输出目录。
2. 在 **Project SDK** 选择 JDK 8，并把 **Language level** 设为 `8 - Lambdas, type annotations etc.` 或更低的 Java 8 级别。
3. 创建同名的 `TaskNotificationStrategyApplication.java`，粘贴下面完整代码并运行 `main`。
4. 若 IDEA 仍显示 JDK 25，重新打开项目结构检查 Project SDK 和模块 SDK；终端也要单独运行 `java -version`、`javac -version` 核对。

### 3. 完整程序

```java
import java.util.Objects;

/** 运行 TeamFlow Java 8 任务通知策略示例的入口类。 */
public class TaskNotificationStrategyApplication {
    /**
     * 创建两条通知并观察不同策略的输出。
     *
     * @param args 命令行参数，本示例不使用
     */
    public static void main(String[] args) {
        TaskNotification emailTask = new TaskNotification(
                "TF-101",
                "alice@teamflow.example",
                "任务已完成",
                NotificationChannel.EMAIL);
        NotificationStrategy emailStrategy = NotificationStrategySelector.select(emailTask.channel());
        NotificationService emailService = new NotificationService(emailStrategy);

        TaskNotification consoleTask = new TaskNotification(
                "TF-102",
                "team-console",
                "需要人工确认",
                NotificationChannel.CONSOLE);
        NotificationStrategy consoleStrategy = NotificationStrategySelector.select(consoleTask.channel());
        NotificationService consoleService = new NotificationService(consoleStrategy);

        System.out.println(emailService.notify(emailTask));
        System.out.println(consoleService.notify(consoleTask));
    }
}

/** 限定任务通知的渠道。 */
enum NotificationChannel {
    EMAIL,
    CONSOLE
}

/** 用 Java 8 的 final class 保存一次任务通知。 */
final class TaskNotification {
    private final String taskId;
    private final String recipient;
    private final String message;
    private final NotificationChannel channel;

    /**
     * 创建任务通知值对象。
     *
     * @param taskId 任务编号
     * @param recipient 接收者
     * @param message 通知消息
     * @param channel 通知渠道
     */
    TaskNotification(String taskId, String recipient, String message, NotificationChannel channel) {
        this.taskId = taskId;
        this.recipient = recipient;
        this.message = message;
        this.channel = channel;
    }

    /**
     * 返回任务编号。
     *
     * @return 任务编号
     */
    String taskId() {
        return taskId;
    }

    /**
     * 返回接收者。
     *
     * @return 接收者
     */
    String recipient() {
        return recipient;
    }

    /**
     * 返回通知消息。
     *
     * @return 通知消息
     */
    String message() {
        return message;
    }

    /**
     * 返回通知渠道。
     *
     * @return 通知渠道
     */
    NotificationChannel channel() {
        return channel;
    }

    /**
     * 比较任务通知的四个数据组件。
     *
     * @param other 待比较的对象
     * @return 四个组件都相等时返回 true
     */
    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof TaskNotification)) {
            return false;
        }
        TaskNotification that = (TaskNotification) other;
        return Objects.equals(taskId, that.taskId)
                && Objects.equals(recipient, that.recipient)
                && Objects.equals(message, that.message)
                && channel == that.channel;
    }

    /**
     * 根据任务通知的四个数据组件计算哈希值。
     *
     * @return 当前通知的哈希值
     */
    @Override
    public int hashCode() {
        return Objects.hash(taskId, recipient, message, channel);
    }

    /**
     * 返回便于观察的任务通知文本。
     *
     * @return 当前通知的文本表示
     */
    @Override
    public String toString() {
        return "TaskNotification[taskId=" + taskId
                + ", recipient=" + recipient
                + ", message=" + message
                + ", channel=" + channel + "]";
    }
}

/** 规定通知实现必须提供的发送动作。 */
interface NotificationStrategy {
    /**
     * 执行通知动作并返回结果文本。
     *
     * @param notification 待发送的任务通知
     * @return 当前渠道的结果文本
     */
    String send(TaskNotification notification);
}

/** 模拟邮件通知。 */
final class EmailNotificationStrategy implements NotificationStrategy {
    /**
     * 返回邮件渠道的模拟结果。
     *
     * @param notification 待发送的任务通知
     * @return 邮件渠道结果
     */
    @Override
    public String send(TaskNotification notification) {
        return "[EMAIL] task=" + notification.taskId()
                + " recipient=" + notification.recipient()
                + " message=" + notification.message();
    }
}

/** 模拟控制台通知。 */
final class ConsoleNotificationStrategy implements NotificationStrategy {
    /**
     * 返回控制台渠道的模拟结果。
     *
     * @param notification 待发送的任务通知
     * @return 控制台渠道结果
     */
    @Override
    public String send(TaskNotification notification) {
        return "[CONSOLE] task=" + notification.taskId()
                + " recipient=" + notification.recipient()
                + " message=" + notification.message();
    }
}

/** 把通知动作委托给策略的上下文。 */
final class NotificationService {
    private final NotificationStrategy strategy;

    /**
     * 创建通知服务。
     *
     * @param strategy 要使用的通知策略
     */
    NotificationService(NotificationStrategy strategy) {
        this.strategy = strategy;
    }

    /**
     * 委托策略处理通知。
     *
     * @param notification 待发送的任务通知
     * @return 策略返回的结果文本
     */
    String notify(TaskNotification notification) {
        return strategy.send(notification);
    }
}

/** 根据枚举渠道创建具体策略的客户端辅助类。 */
final class NotificationStrategySelector {
    /**
     * 选择通知策略。
     *
     * @param channel 通知渠道
     * @return 与渠道匹配的策略
     */
    static NotificationStrategy select(NotificationChannel channel) {
        if (channel == NotificationChannel.EMAIL) {
            return new EmailNotificationStrategy();
        }
        return new ConsoleNotificationStrategy();
    }
}
```

### 4. 预期输出与版本核对

Java 8 版本的控制台输出与 JDK 25 版本逐字相同：

```text
[EMAIL] task=TF-101 recipient=alice@teamflow.example message=任务已完成
[CONSOLE] task=TF-102 recipient=team-console message=需要人工确认
```

若 Java 8 编译器报告无法识别 `record`，说明仍粘贴了 JDK 25 值对象；若 IDEA 的 Project SDK 与终端版本不同，先分别查看 IDE 的项目结构设置和
终端的两个版本命令，不要只根据其中一处判断项目版本。

## 五、常见错误

接口错误通常在“合同没有兑现”或“变化点放错位置”时出现。下面的每个例子都给出触发条件、原因、后果、错误示例、正确写法和验证方式；
它们只帮助修正本课的策略结构，不展开完整的错误诊断课程。

:::pitfalls
### 忘记在具体类声明中写 `implements`

**触发条件：** 写出了 `send` 方法，却声明 `NotificationStrategy strategy = new EmailNotificationStrategy()`。

**原因：** 方法名相同不代表类已经成为接口的实现类型；类型合同由 `implements` 声明建立。

**后果：** 编译器不能把该对象赋给接口变量，程序无法进入运行阶段。

**错误示例：**

```java
/** 只有同名方法但没有实现接口。 */
final class EmailNotificationStrategy {
    /**
     * 返回邮件结果。
     *
     * @return 邮件结果
     */
    public String send() {
        return "email";
    }
}

interface NotificationStrategy {
    /**
     * 执行通知。
     *
     * @return 通知结果
     */
    String send();
}

NotificationStrategy strategy = new EmailNotificationStrategy();
```

**正确写法：**

```java
/** 明确声明自己遵守通知接口。 */
final class EmailNotificationStrategy implements NotificationStrategy {
    /**
     * 返回邮件结果。
     *
     * @return 邮件结果
     */
    @Override
    public String send() {
        return "email";
    }
}
```

**验证方式：** 把两段放进最小类中分别编译；错误示例应非零退出，正确示例应能赋值并输出 `email`。
:::

:::pitfalls
### 实现方法的可见性或签名不符合接口

**触发条件：** 接口方法是隐式 `public`，实现却省略 `public`，或把返回类型改成不兼容的类型。

**原因：** 实现方法不能缩小接口方法的访问范围，也必须保持兼容的参数和返回类型。

**后果：** 编译失败；即使方法体内容正确，也不能作为接口实现。

**错误示例：**

```java
interface NotificationStrategy {
    /**
     * 执行通知。
     *
     * @return 通知结果
     */
    String send();
}

final class ConsoleNotificationStrategy implements NotificationStrategy {
    /**
     * 错误地缩小接口方法的可见性。
     *
     * @return 控制台结果
     */
    @Override
    String send() {
        return "console";
    }
}
```

**正确写法：**

```java
final class ConsoleNotificationStrategy implements NotificationStrategy {
    /**
     * 返回控制台结果。
     *
     * @return 控制台结果
     */
    @Override
    public String send() {
        return "console";
    }
}
```

**验证方式：** 使用 Java 25 和 Java 8 分别编译两段；错误版本必须失败，正确版本应能通过接口变量调用并得到 `console`。
:::

:::pitfalls
### 上下文字段写成具体策略类型

**触发条件：** `NotificationService` 把字段和构造器参数写成 `EmailNotificationStrategy`，随后尝试传入控制台策略。

**原因：** 上下文依赖了实现细节，没有依赖所有策略共同遵守的接口合同。

**后果：** 服务只能处理邮件策略；切换渠道时需要修改服务的字段、构造器或方法，失去可替换性。

**错误示例：**

```java
/** 过度绑定邮件实现的上下文。 */
final class NotificationService {
    private final EmailNotificationStrategy strategy;

    /**
     * 创建邮件专用服务。
     *
     * @param strategy 邮件策略
     */
    NotificationService(EmailNotificationStrategy strategy) {
        this.strategy = strategy;
    }
}
```

**正确写法：**

```java
/** 只依赖策略接口的上下文。 */
final class NotificationService {
    private final NotificationStrategy strategy;

    /**
     * 创建可替换策略的服务。
     *
     * @param strategy 任意通知策略
     */
    NotificationService(NotificationStrategy strategy) {
        this.strategy = strategy;
    }
}
```

**验证方式：** 用 `new NotificationService(new ConsoleNotificationStrategy())` 构造服务；错误版本不能通过编译，正确版本可以接收控制台策略。
:::

:::pitfalls
### 把策略选择和所有发送逻辑塞回服务

**触发条件：** `NotificationService.notify` 内部根据渠道写出邮件、控制台等多个分支，并在每个分支拼接完整消息。

**原因：** 服务同时承担上下文委托和每种渠道的算法，新增渠道必须修改同一个大方法。

**后果：** 变化点与稳定流程混在一起，分支越多越难确认每个渠道的输出是否仍然正确。

**错误示例：**

```java
/** 把所有渠道算法硬编码在服务中的例子。 */
final class NotificationService {
    /**
     * 根据渠道直接执行所有发送分支。
     *
     * @param notification 待发送通知
     * @return 发送结果
     */
    String notify(TaskNotification notification) {
        if (notification.channel() == NotificationChannel.EMAIL) {
            return "[EMAIL] " + notification.message();
        }
        return "[CONSOLE] " + notification.message();
    }
}
```

**正确写法：**

```java
/** 只负责委托的服务。 */
final class NotificationService {
    private final NotificationStrategy strategy;

    /**
     * 创建通知服务。
     *
     * @param strategy 当前策略
     */
    NotificationService(NotificationStrategy strategy) {
        this.strategy = strategy;
    }

    /**
     * 把通知交给策略。
     *
     * @param notification 待发送通知
     * @return 策略结果
     */
    String notify(TaskNotification notification) {
        return strategy.send(notification);
    }
}
```

**验证方式：** 新增一个只实现 `NotificationStrategy` 的策略类后，正确服务无需修改即可接收它；错误服务必须继续增加分支。
:::

:::pitfalls
### 只创建策略，却没有通过上下文调用它

**触发条件：** 客户端 `new EmailNotificationStrategy()` 后直接调用实现类，或者创建了 `NotificationService` 却没有调用 `notify`。

**原因：** 策略对象只有在被传入上下文并通过接口方法调用时，才能体现可替换的委托链。

**后果：** 代码可能编译成功，但观察不到预期输出，也无法验证服务是否真的保持了实现无关性。

**错误示例：**

```java
/** 直接依赖具体类，绕过上下文。 */
final class DirectCall {
    /**
     * 直接执行具体实现。
     *
     * @param notification 待发送通知
     * @return 直接结果
     */
    static String run(TaskNotification notification) {
        return new EmailNotificationStrategy().send(notification);
    }
}
```

**正确写法：**

```java
/** 通过接口和上下文执行策略。 */
final class ContextCall {
    /**
     * 创建服务并走完整委托链。
     *
     * @return 上下文结果
     */
    static String run() {
        NotificationStrategy strategy = new EmailNotificationStrategy();
        NotificationService service = new NotificationService(strategy);
        return service.notify(new TaskNotification(
                "TF-101", "alice@teamflow.example", "任务已完成", NotificationChannel.EMAIL));
    }
}
```

**验证方式：** 运行 `ContextCall.run()` 应输出以 `[EMAIL]` 开头的完整任务信息；把策略换成 `ConsoleNotificationStrategy` 后，服务代码不变而输出改为 `[CONSOLE]`。
:::

## 六、练习：增加短信通知策略

:::exercise
### 增加短信策略

**要求：** 在完整程序中新增 `SmsNotificationStrategy`，实现已有的 `NotificationStrategy` 接口；为 `NotificationChannel` 增加 `SMS`；
让客户端能为 `SMS` 创建策略，并发送一条任务编号为 `TF-103`、接收者为 `13800000000`、消息为 `请查看任务` 的通知。不要修改
`NotificationService` 的字段类型或 `notify` 方法签名，不要引入集合、异常、Maven、Spring 或网络客户端。JDK 25 版本保留 `record`，
Java 8 版本保留 `final class` 值对象，两个版本都必须给出完整可运行代码。

**验收：** JDK 25 和 Java 8 分别编译成功；运行后除了原有两行，还输出
`[SMS] task=TF-103 recipient=13800000000 message=请查看任务`；把服务构造器参数改回具体邮件类型时，代码应无法同时接收短信策略。
:::

## 七、练习参考实现

### 1. JDK 25 参考实现

```java
/** 运行 TeamFlow 三种通知策略的参考入口。 */
public class TaskNotificationStrategyExercise {
    /**
     * 运行邮件、控制台和短信通知。
     *
     * @param args 命令行参数，本示例不使用
     */
    public static void main(String[] args) {
        TaskNotification emailTask = new TaskNotification(
                "TF-101", "alice@teamflow.example", "任务已完成", NotificationChannel.EMAIL);
        TaskNotification consoleTask = new TaskNotification(
                "TF-102", "team-console", "需要人工确认", NotificationChannel.CONSOLE);
        TaskNotification smsTask = new TaskNotification(
                "TF-103", "13800000000", "请查看任务", NotificationChannel.SMS);

        System.out.println(send(emailTask));
        System.out.println(send(consoleTask));
        System.out.println(send(smsTask));
    }

    /**
     * 为通知选择策略并通过服务发送。
     *
     * @param notification 待发送的任务通知
     * @return 策略结果
     */
    private static String send(TaskNotification notification) {
        NotificationStrategy strategy = NotificationStrategySelector.select(notification.channel());
        return new NotificationService(strategy).notify(notification);
    }
}

/** 限定任务通知的渠道。 */
enum NotificationChannel {
    EMAIL,
    CONSOLE,
    SMS
}

/** 保存一次任务通知的固定数据。 */
record TaskNotification(String taskId, String recipient, String message, NotificationChannel channel) {
}

/** 规定通知实现的共同合同。 */
interface NotificationStrategy {
    /**
     * 执行通知动作。
     *
     * @param notification 待发送通知
     * @return 通知结果
     */
    String send(TaskNotification notification);
}

/** 模拟邮件策略。 */
final class EmailNotificationStrategy implements NotificationStrategy {
    /**
     * 返回邮件结果。
     *
     * @param notification 待发送通知
     * @return 邮件结果
     */
    @Override
    public String send(TaskNotification notification) {
        return "[EMAIL] task=" + notification.taskId()
                + " recipient=" + notification.recipient()
                + " message=" + notification.message();
    }
}

/** 模拟控制台策略。 */
final class ConsoleNotificationStrategy implements NotificationStrategy {
    /**
     * 返回控制台结果。
     *
     * @param notification 待发送通知
     * @return 控制台结果
     */
    @Override
    public String send(TaskNotification notification) {
        return "[CONSOLE] task=" + notification.taskId()
                + " recipient=" + notification.recipient()
                + " message=" + notification.message();
    }
}

/** 模拟短信策略。 */
final class SmsNotificationStrategy implements NotificationStrategy {
    /**
     * 返回短信结果。
     *
     * @param notification 待发送通知
     * @return 短信结果
     */
    @Override
    public String send(TaskNotification notification) {
        return "[SMS] task=" + notification.taskId()
                + " recipient=" + notification.recipient()
                + " message=" + notification.message();
    }
}

/** 只通过策略接口委托通知的上下文。 */
final class NotificationService {
    private final NotificationStrategy strategy;

    /**
     * 创建通知服务。
     *
     * @param strategy 当前策略
     */
    NotificationService(NotificationStrategy strategy) {
        this.strategy = strategy;
    }

    /**
     * 委托策略发送通知。
     *
     * @param notification 待发送通知
     * @return 通知结果
     */
    String notify(TaskNotification notification) {
        return strategy.send(notification);
    }
}

/** 由客户端把渠道映射为具体策略。 */
final class NotificationStrategySelector {
    /**
     * 选择与渠道匹配的策略。
     *
     * @param channel 通知渠道
     * @return 具体策略
     */
    static NotificationStrategy select(NotificationChannel channel) {
        if (channel == NotificationChannel.EMAIL) {
            return new EmailNotificationStrategy();
        }
        if (channel == NotificationChannel.SMS) {
            return new SmsNotificationStrategy();
        }
        return new ConsoleNotificationStrategy();
    }
}
```

运行结果：

```text
[EMAIL] task=TF-101 recipient=alice@teamflow.example message=任务已完成
[CONSOLE] task=TF-102 recipient=team-console message=需要人工确认
[SMS] task=TF-103 recipient=13800000000 message=请查看任务
```

### 2. Java 8 参考实现

```java
import java.util.Objects;

/** 运行 TeamFlow Java 8 三种通知策略的参考入口。 */
public class TaskNotificationStrategyExercise {
    /**
     * 运行邮件、控制台和短信通知。
     *
     * @param args 命令行参数，本示例不使用
     */
    public static void main(String[] args) {
        TaskNotification emailTask = new TaskNotification(
                "TF-101", "alice@teamflow.example", "任务已完成", NotificationChannel.EMAIL);
        TaskNotification consoleTask = new TaskNotification(
                "TF-102", "team-console", "需要人工确认", NotificationChannel.CONSOLE);
        TaskNotification smsTask = new TaskNotification(
                "TF-103", "13800000000", "请查看任务", NotificationChannel.SMS);

        System.out.println(send(emailTask));
        System.out.println(send(consoleTask));
        System.out.println(send(smsTask));
    }

    /**
     * 为通知选择策略并通过服务发送。
     *
     * @param notification 待发送的任务通知
     * @return 策略结果
     */
    private static String send(TaskNotification notification) {
        NotificationStrategy strategy = NotificationStrategySelector.select(notification.channel());
        return new NotificationService(strategy).notify(notification);
    }
}

/** 限定任务通知的渠道。 */
enum NotificationChannel {
    EMAIL,
    CONSOLE,
    SMS
}

/** 用 Java 8 的 final class 保存一次任务通知。 */
final class TaskNotification {
    private final String taskId;
    private final String recipient;
    private final String message;
    private final NotificationChannel channel;

    /**
     * 创建任务通知值对象。
     *
     * @param taskId 任务编号
     * @param recipient 接收者
     * @param message 通知消息
     * @param channel 通知渠道
     */
    TaskNotification(String taskId, String recipient, String message, NotificationChannel channel) {
        this.taskId = taskId;
        this.recipient = recipient;
        this.message = message;
        this.channel = channel;
    }

    /**
     * 返回任务编号。
     *
     * @return 任务编号
     */
    String taskId() {
        return taskId;
    }

    /**
     * 返回接收者。
     *
     * @return 接收者
     */
    String recipient() {
        return recipient;
    }

    /**
     * 返回通知消息。
     *
     * @return 通知消息
     */
    String message() {
        return message;
    }

    /**
     * 返回通知渠道。
     *
     * @return 通知渠道
     */
    NotificationChannel channel() {
        return channel;
    }

    /**
     * 比较任务通知的四个数据组件。
     *
     * @param other 待比较的对象
     * @return 四个组件都相等时返回 true
     */
    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof TaskNotification)) {
            return false;
        }
        TaskNotification that = (TaskNotification) other;
        return Objects.equals(taskId, that.taskId)
                && Objects.equals(recipient, that.recipient)
                && Objects.equals(message, that.message)
                && channel == that.channel;
    }

    /**
     * 根据任务通知的四个数据组件计算哈希值。
     *
     * @return 当前通知的哈希值
     */
    @Override
    public int hashCode() {
        return Objects.hash(taskId, recipient, message, channel);
    }

    /**
     * 返回便于观察的任务通知文本。
     *
     * @return 当前通知的文本表示
     */
    @Override
    public String toString() {
        return "TaskNotification[taskId=" + taskId
                + ", recipient=" + recipient
                + ", message=" + message
                + ", channel=" + channel + "]";
    }
}

/** 规定通知实现的共同合同。 */
interface NotificationStrategy {
    /**
     * 执行通知动作。
     *
     * @param notification 待发送通知
     * @return 通知结果
     */
    String send(TaskNotification notification);
}

/** 模拟邮件策略。 */
final class EmailNotificationStrategy implements NotificationStrategy {
    /**
     * 返回邮件结果。
     *
     * @param notification 待发送通知
     * @return 邮件结果
     */
    @Override
    public String send(TaskNotification notification) {
        return "[EMAIL] task=" + notification.taskId()
                + " recipient=" + notification.recipient()
                + " message=" + notification.message();
    }
}

/** 模拟控制台策略。 */
final class ConsoleNotificationStrategy implements NotificationStrategy {
    /**
     * 返回控制台结果。
     *
     * @param notification 待发送通知
     * @return 控制台结果
     */
    @Override
    public String send(TaskNotification notification) {
        return "[CONSOLE] task=" + notification.taskId()
                + " recipient=" + notification.recipient()
                + " message=" + notification.message();
    }
}

/** 模拟短信策略。 */
final class SmsNotificationStrategy implements NotificationStrategy {
    /**
     * 返回短信结果。
     *
     * @param notification 待发送通知
     * @return 短信结果
     */
    @Override
    public String send(TaskNotification notification) {
        return "[SMS] task=" + notification.taskId()
                + " recipient=" + notification.recipient()
                + " message=" + notification.message();
    }
}

/** 只通过策略接口委托通知的上下文。 */
final class NotificationService {
    private final NotificationStrategy strategy;

    /**
     * 创建通知服务。
     *
     * @param strategy 当前策略
     */
    NotificationService(NotificationStrategy strategy) {
        this.strategy = strategy;
    }

    /**
     * 委托策略发送通知。
     *
     * @param notification 待发送通知
     * @return 通知结果
     */
    String notify(TaskNotification notification) {
        return strategy.send(notification);
    }
}

/** 由客户端把渠道映射为具体策略。 */
final class NotificationStrategySelector {
    /**
     * 选择与渠道匹配的策略。
     *
     * @param channel 通知渠道
     * @return 具体策略
     */
    static NotificationStrategy select(NotificationChannel channel) {
        if (channel == NotificationChannel.EMAIL) {
            return new EmailNotificationStrategy();
        }
        if (channel == NotificationChannel.SMS) {
            return new SmsNotificationStrategy();
        }
        return new ConsoleNotificationStrategy();
    }
}
```

Java 8 参考实现的输出仍然是上面的三行。它只替换 `TaskNotification` 的声明和访问器，通知接口、策略类、上下文和选择逻辑保持相同，
因此可以把差异准确地归因于 record 是否受版本支持，而不是误以为 Java 8 不支持接口或多态。
