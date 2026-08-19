---
id: backend.java.learn.basics.io-files-and-resource-ownership
type: lesson
title: 资源关闭
summary: 用清晰的所有权合同和 try-with-resources，让资源在正常与异常路径都按正确顺序关闭
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 75
prerequisites:
  - backend.java.learn.basics.exceptions-and-cause-chains
objectives:
  - 能识别需要关闭的资源，并区分创建、借用与接管三种所有权关系。
  - 能说明 AutoCloseable、close() 与 try-with-resources 各自承担的职责。
  - 能让单个或多个资源在正常、主体失败和关闭失败时得到确定处理。
  - 能解释反向关闭、主异常、suppressed exception 以及 catch 和 finally 的执行位置。
  - 能针对 JDK 25 与 Java 8 选择正确的资源头语法。
recap:
  - 需要关闭的资源具有明确的结束动作，不能依赖对象失去引用来表达资源已经释放。
  - 创建者默认负责关闭，借用者默认不关闭，接管者必须通过方法合同明确承担关闭责任。
  - try-with-resources 管理实现 AutoCloseable 的资源，并在离开主体时自动调用 close()。
  - 多个资源按从左到右的顺序初始化，按从右到左的顺序关闭。
  - 主体和关闭同时失败时，主体异常保留为主异常，关闭失败进入 getSuppressed()。
  - JDK 25 可以把 final 或 effectively-final 的已有变量直接写入资源头，Java 8 需要在资源头重新声明变量。
related: []
tags:
  - Java
  - AutoCloseable
  - try-with-resources
  - 资源所有权
  - suppressed exception
appliesTo: JDK 25；Java 8
verifiedAt: 2026-08-18
sources:
  - id: jls-25-try-with-resources
    title: Java Language Specification 25 - The try-with-resources Statement
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20.3
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 资源初始化、反向关闭、扩展形式以及 suppressed exception 的语言规则
  - id: jls-8-try-with-resources
    title: Java Language Specification 8 - The try-with-resources Statement
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html#jls-14.20.3
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 的声明式资源头、关闭顺序和异常保留规则
  - id: java-25-auto-closeable
    title: Java SE 25 API - AutoCloseable
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/AutoCloseable.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - AutoCloseable、close() 与非幂等边界
  - id: java-8-auto-closeable
    title: Java SE 8 API - AutoCloseable
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/AutoCloseable.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 已具备本课使用的 AutoCloseable 合同
  - id: java-25-throwable
    title: Java SE 25 API - Throwable
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - getSuppressed() 返回关闭阶段保留的后续异常
  - id: jep-213
    title: JEP 213 - Milling Project Coin
    url: https://openjdk.org/jeps/213
    sourceOrigin: official
    sourceType: release-note
    appliesTo: Java 9 及以上
    claims:
      - Java 9 起允许 final 或 effectively-final 的已有变量直接用于资源头
  - id: oracle-java-8-try-with-resources
    title: The Java Tutorials - The try-with-resources Statement
    url: https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java SE 8
    claims:
      - try-with-resources 相比手写 finally 的关闭方式以及 suppressed exception 的读取方式
  - id: stackoverflow-resource-finally-practice
    title: Java try/catch/finally best practices while acquiring/closing resources
    url: https://stackoverflow.com/questions/4092914/close-connections-resultset-and-statement
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 7 及以上
    claims:
      - 初学者手写 finally 时常遇到资源未初始化、close 异常和空 catch 组合问题
---

# 资源关闭

TeamFlow 生成一次任务报告时，可能先打开任务会话，再打开报告通道。报告生成结束不等于这些对象的
生命周期已经结束：它们还需要执行关闭动作，把占用的外部能力交还给创建者或运行环境。即使本课只用
内存探针模拟资源，这份关闭合同也必须和真实资源一样明确。

本课只解决“谁负责关闭、何时关闭、多个关闭动作怎样保留失败”。文件内容怎样读写、路径怎样表示、网络和
数据库连接怎样工作，都需要各自的后续知识，本课不提前展开。

## 一、先确定谁拥有资源

### 1. 需要关闭的是生命周期，不只是一个对象

普通对象失去引用后，程序不能再通过该引用使用它；需要关闭的资源还多一个明确的结束动作。例如一个会话
可能占用句柄、连接、缓冲区或其他外部能力，调用 `close()` 才表示当前使用者结束了这段生命周期。

Java 用 `AutoCloseable` 表达这种合同。实现类提供 `close()`，调用者则决定在什么边界调用它：

```java
private static final class TaskSession implements AutoCloseable {
    private boolean closed;

    /**
     * 创建一个尚未关闭的任务会话。
     */
    private TaskSession() {
        System.out.println("任务会话已打开");
    }

    /**
     * 打开一个新的任务会话。
     */
    private static TaskSession open() {
        return new TaskSession();
    }

    /**
     * 输出当前会话中的任务摘要。
     */
    private void printSummary() {
        if (closed) {
            throw new IllegalStateException("任务会话已经关闭");
        }
        System.out.println("待处理任务: 3");
    }

    /**
     * 关闭任务会话。
     */
    @Override
    public void close() {
        closed = true;
        System.out.println("任务会话已关闭");
    }
}
```

`AutoCloseable` 不会自动寻找对象，也不会在任意时刻主动关闭它。它只是让对象能够进入
try-with-resources 的资源头；真正确定关闭边界的是使用这项语法的代码。

### 2. 创建、借用与接管决定关闭责任

判断是否应该调用 `close()`，先看当前代码和资源是什么关系：

| 所有权关系 | 当前代码做了什么 | 默认关闭责任 |
| --- | --- | --- |
| 创建 | 自己调用工厂或构造器获得新资源 | 当前代码在使用结束后关闭 |
| 借用 | 参数由调用方传入，当前代码只在调用期间使用 | 当前代码不关闭，调用方继续负责 |
| 接管 | 调用方明确把后续生命周期交给当前代码 | 当前代码负责关闭，并让合同可见 |

下面的方法只借用会话。它读取一次摘要，返回后调用方仍可以继续使用同一个会话：

```java
/**
 * 借用任务会话输出摘要，不接管关闭责任。
 */
private static void previewTasks(TaskSession session) {
    session.printSummary();
}
```

接管方法必须把关闭责任写进名称或 Javadoc，并在方法内部建立关闭边界：

```java
/**
 * 接管任务会话，输出摘要后负责关闭它。
 */
private static void printAndClose(TaskSession session) {
    try (TaskSession managedSession = session) {
        managedSession.printSummary();
    }
}
```

两个方法都能调用 `printSummary()`，区别不在“能不能用”，而在返回后谁还可以继续使用资源。调用
`printAndClose()` 后再访问原变量，会得到“任务会话已经关闭”；这正是接管合同的可观察结果。

### 3. close 不是销毁对象，也不保证可以重复调用

关闭后的对象仍可能存在于变量中，程序也仍能调用它的方法；对象应通过自己的状态拒绝不合法操作。因此
“引用还在”不代表资源仍可用，“变量离开作用域”也不等于关闭动作已经发生。

`AutoCloseable.close()` 允许抛出异常，并且接口本身不保证多次调用具有相同效果。实现类可以把第二次关闭
视为错误，也可以产生其他可观察副作用。除非具体类型的合同明确保证幂等，否则不要让 try-with-resources
关闭一次后又手工关闭一次。

## 二、让关闭进入控制流

### 1. finally 能尝试关闭，但手写责任很多

`finally` 会在普通 `try` 主体正常完成或抛出异常后执行，因此可以用来尝试关闭资源。手写版本至少要处理
资源可能尚未创建、`close()` 自己可能失败，以及主体和关闭同时失败时保留哪个异常：

```java
TaskSession session = null;
try {
    session = TaskSession.open();
    session.printSummary();
} finally {
    if (session != null) {
        session.close();
    }
}
```

这段代码对不会抛出受检异常的 `TaskSession.close()` 尚可工作，但资源类型一多，空值判断、反向关闭和异常
保留都会变成当前代码的责任。更危险的是：主体已经失败时，`finally` 中再次抛出的异常可能替换原本更重要的
失败。

### 2. try-with-resources 把关闭责任写进资源头

把资源声明在 `try (...)` 中，表示这条语句拥有资源直到主体结束：

```java
try (TaskSession session = TaskSession.open()) {
    session.printSummary();
}
```

执行顺序可以直接观察：

```text
任务会话已打开
待处理任务: 3
任务会话已关闭
```

资源先创建，主体再输出摘要；主体离开时，Java 自动调用 `session.close()`。主体是正常结束、执行 `return`
还是抛出异常，都不会跳过这次关闭尝试。这里的“自动”来自 try-with-resources 的语言规则，不是垃圾回收。

### 3. AutoCloseable 是进入资源头的最低合同

资源头中的类型必须实现 `AutoCloseable`。编译器因此知道离开主体时可以调用无参数的 `close()`：

```java
public interface AutoCloseable {
    /**
     * 关闭当前资源。
     */
    void close() throws Exception;
}
```

实现类可以把异常范围收窄，也可以完全不声明受检异常。若 `close()` 可能抛出受检异常，包含
try-with-resources 的方法仍要像处理其他受检异常一样捕获或声明；语法负责可靠调用 `close()`，并不会把关闭
失败静默丢弃。

### 4. catch 和 finally 在资源关闭后执行

try-with-resources 可以直接带 `catch` 和 `finally`。它们位于自动关闭动作之外，所以先关闭资源，再进入
匹配的 `catch`，最后执行 `finally`：

```java
StringBuilder events = new StringBuilder();
try (ReportChannel channel = ReportChannel.open(events)) {
    events.append("主体|");
    throw new IllegalStateException("报告生成失败");
} catch (IllegalStateException exception) {
    events.append("catch|");
} finally {
    events.append("finally");
}
System.out.println(events);
```

若 `ReportChannel.close()` 追加“关闭|”，输出就是：

```text
打开|主体|关闭|catch|finally
```

因此 `catch` 看到的是资源已经完成关闭尝试后的失败。资源初始化或单独的 `close()` 失败也可以被同一条语句
后面匹配的 `catch` 捕获，不需要为了关闭异常再人为嵌套一层 `try`。

## 三、多个资源怎样关闭

### 1. 初始化从左到右，关闭从右到左

一个操作经常依赖多个资源。资源头用分号分隔声明，初始化按从左到右执行，成功创建的资源按从右到左关闭：

```java
try (
    TaskSession session = TaskSession.open(events);
    ReportChannel channel = ReportChannel.open(events)
) {
    events.add("生成任务报告");
}
```

预期事件顺序是：

```text
打开任务会话
打开报告通道
生成任务报告
关闭报告通道
关闭任务会话
```

后创建的报告通道先关闭，仍可在关闭时使用先创建的会话；最后才结束会话。这种后进先出的顺序由语言规则
保证，不需要手工颠倒两个 `close()`。

如果第二个资源初始化就失败，第一个已经成功创建的资源仍会关闭；没有成功创建的第二个资源则没有可调用的
`close()`。这也是每个独立资源都应进入资源头的原因。

### 2. 主体失败优先，关闭失败进入 suppressed

主体抛出异常后，Java 仍会尝试关闭资源。如果 `close()` 也抛出异常，主体异常继续作为主异常，关闭异常被
保存在主异常的 suppressed 列表中：

```java
try (ReportChannel channel = ReportChannel.failingOnClose()) {
    throw new IllegalStateException("报告生成失败");
} catch (IllegalStateException failure) {
    System.out.println("主异常: " + failure.getMessage());
    System.out.println("关闭异常: " + failure.getSuppressed()[0].getMessage());
}
```

预期输出：

```text
主异常: 报告生成失败
关闭异常: 报告通道关闭失败
```

`getCause()` 表达异常之间由代码建立的因果链；`getSuppressed()` 表达清理阶段没有替换主失败、但仍被保留的
后续失败。两者都属于 `Throwable`，含义不同，不能互相替代。

### 3. 只有关闭失败时，它就是当前失败

如果主体正常完成，只有 `close()` 抛出异常，就不存在需要优先保留的主体异常。关闭异常会直接离开
try-with-resources，也可以被紧随其后的 `catch` 捕获：

```java
try (ReportChannel channel = ReportChannel.failingOnClose()) {
    channel.publish("TASK-101");
} catch (Exception closeFailure) {
    System.out.println("关闭失败: " + closeFailure.getMessage());
}
```

预期输出中的失败消息是“报告通道关闭失败”，此时 `closeFailure.getSuppressed()` 为空。suppressed 只用于
保留“已经有主异常之后又发生”的关闭失败，并不是所有 `close()` 异常都会进入该列表。

### 4. catch 不等于资源一定成功关闭

自动关闭保证的是“离开主体时按规则调用 `close()`”，不是“关闭永远成功”。处理异常时既要保留主体失败，也
可以在需要时读取 suppressed 列表，判断清理阶段是否又发生问题。本课只观察这两类异常，不扩展为日志、告警
或框架级错误处理方案。

## 四、两个 Java 版本的资源头

### 1. 在资源头声明变量时两版相同

JDK 25 和 Java 8 都支持在资源头创建并声明资源。没有理由先把变量放到外面时，优先使用这份共同写法：

```java
try (TaskSession session = TaskSession.open()) {
    session.printSummary();
}
```

变量只在这条 try-with-resources 语句中使用，所有权边界也最清楚。两个版本的初始化顺序、反向关闭、主异常
和 suppressed exception 规则相同。

### 2. JDK 25 可以直接管理 effectively-final 的已有变量

从 Java 9 起，资源头可以直接引用 final 或 effectively-final 的已有局部变量。effectively-final 表示变量虽然
没有写 `final`，但初始化后没有再次赋值：

```java
TaskSession session = TaskSession.open();
try (session) {
    session.printSummary();
}
```

如果之后有 `session = TaskSession.open()` 这样的重新赋值，变量就不再 effectively-final，编译器会拒绝它
进入这种资源头。资源对象内部状态变化不等于变量重新赋值，不影响该判断。

### 3. Java 8 需要在资源头重新声明

Java 8 不接受只有变量名的 `try (session)`。已有变量需要赋给资源头中声明的新变量：

```java
TaskSession session = TaskSession.open();
try (TaskSession managedSession = session) {
    managedSession.printSummary();
}
```

`session` 与 `managedSession` 指向同一个对象，并没有创建第二个会话。离开主体时通过 `managedSession` 关闭
该对象，原变量 `session` 之后仍存在，但它指向的会话已经关闭。

:::compare{before="Java 8" after="JDK 25"}
### Java 8

```java
TaskSession session = TaskSession.open();
try (TaskSession managedSession = session) {
    managedSession.printSummary();
}
```

### JDK 25

```java
TaskSession session = TaskSession.open();
try (session) {
    session.printSummary();
}
```
:::

只有资源头语法不同，关闭时间、顺序和异常语义不变。需要同一份源码同时在两个版本编译时，使用 Java 8 的
重新声明写法即可。

## 五、从一个 TeamFlow 会话开始

### 1. 建立最小可运行程序

创建 `TeamFlowResourceBasics.java`，先用一个资源观察正常关闭：

```java
public final class TeamFlowResourceBasics {
    private static final class TaskSession implements AutoCloseable {
        /**
         * 创建任务会话。
         */
        private TaskSession() {
            System.out.println("1. 打开任务会话");
        }

        /**
         * 输出当前任务摘要。
         */
        private void printSummary() {
            System.out.println("2. 待处理任务: 3");
        }

        /**
         * 关闭任务会话。
         */
        @Override
        public void close() {
            System.out.println("3. 关闭任务会话");
        }
    }

    /**
     * 运行一次任务摘要并观察资源关闭顺序。
     */
    public static void main(String[] args) {
        try (TaskSession session = new TaskSession()) {
            session.printSummary();
        }
    }
}
```

这份源码使用两个版本共有的资源声明形式。在 IntelliJ IDEA 中运行 `main`，控制台应依次显示：

```text
1. 打开任务会话
2. 待处理任务: 3
3. 关闭任务会话
```

### 2. 用一次失败确认关闭没有被跳过

把 `printSummary()` 临时改为先输出“2. 开始生成摘要”，再抛出
`IllegalStateException("摘要生成失败")`；同时在 `main` 的 try-with-resources 后添加匹配的 `catch`。运行时
仍应先看到“3. 关闭任务会话”，然后才看到 catch 输出的失败消息。

这个最小反馈只用于确认关闭顺序。恢复正常版本后再继续完整程序，避免把“为了观察失败”留下的临时代码误当
成正常业务。

### 3. 本课不使用真实文件或连接

`TaskSession` 只是一个可观察探针：构造器表示打开，`close()` 表示释放，输出表示生命周期顺序。真实文件的
打开与读写属于下一课；网络、数据库和 Spring 管理的资源还各有额外合同。先在没有外部依赖的程序中把所有权
和控制流看清，后续只需把资源类型替换掉。

## 六、易错示例

### 七个典型错误

**社区补充：** 一个长期存在的社区问题集中展示了初学者手写 `finally` 时的三个真实困扰：资源变量可能尚未
初始化、`close()` 的受检异常还要处理，以及为了消除编译错误而加入空 `catch`。该问题的高票答复也明确更新
为 Java 7 及以上应使用 try-with-resources。本课下面仍以 JLS 和 `AutoCloseable` 合同判断正确行为，社区材料
只用来确认这些错误确实容易组合出现。

:::pitfalls
### 把 close 写在正常语句之后

**触发条件：** 创建资源后先执行可能失败的主体，最后用普通语句调用 `close()`。

**原因：** 主体一旦抛出异常，控制流会直接离开当前语句序列，最后一行不会执行。

**后果：** 成功路径看似关闭了资源，失败路径却遗漏关闭，资源生命周期取决于业务是否成功。

**错误示例：**

```java
TaskSession session = TaskSession.open();
session.generateReport();
session.close();
```

**正确写法：**

```java
try (TaskSession session = TaskSession.open()) {
    session.generateReport();
}
```

**验证方式：** 让 `generateReport()` 固定抛出“报告生成失败”；错误版不会记录关闭，正确版在异常离开前仍
记录一次关闭。JDK 25 与 Java 8 结果相同。

### 用 finally 中的关闭失败覆盖主体失败

**触发条件：** 主体和 `finally` 中的 `close()` 都抛出异常，却直接让后一个异常离开方法。

**原因：** 普通 `finally` 以新的异常完成时，会替换此前尚未传播出去的主体异常。

**后果：** 调用方只看到“关闭失败”，真正触发清理的“报告生成失败”丢失。

**错误示例：**

```java
TaskSession session = TaskSession.open();
try {
    throw new IllegalStateException("报告生成失败");
} finally {
    session.closeWithFailure();
}
```

**正确写法：**

```java
try (TaskSession session = TaskSession.open()) {
    throw new IllegalStateException("报告生成失败");
}
```

**验证方式：** 让 `close()` 固定抛出“会话关闭失败”。错误版最终只抛关闭异常；正确版的主异常消息仍为
“报告生成失败”，且 `getSuppressed()[0]` 的消息为“会话关闭失败”。

### 借用资源的方法擅自关闭它

**触发条件：** 方法参数只是临时借用，方法却把它放入 try-with-resources。

**原因：** try-with-resources 表达当前作用域拥有关闭责任，与“只借用”的方法合同冲突。

**后果：** 方法返回后，真正的所有者再次使用资源时得到“任务会话已经关闭”。

**错误示例：**

```java
/**
 * 错误地关闭借用的任务会话。
 */
private static void preview(TaskSession session) {
    try (TaskSession managedSession = session) {
        managedSession.printSummary();
    }
}
```

**正确写法：**

```java
/**
 * 只借用任务会话输出摘要。
 */
private static void preview(TaskSession session) {
    session.printSummary();
}
```

**验证方式：** 调用 `preview(session)` 后再次执行 `session.printSummary()`；错误版第二次调用失败，正确版
可以继续输出，由外层所有者最终关闭。

### 自动关闭后又手工关闭

**触发条件：** 资源已经进入 try-with-resources，离开后又对原变量调用一次 `close()`。

**原因：** 把“保险起见多关一次”误当成通用规则，但 `AutoCloseable` 不保证 `close()` 幂等。

**后果：** 第二次关闭可能抛异常、重复提交状态或产生其他副作用。

**错误示例：**

```java
TaskSession session = TaskSession.open();
try (TaskSession managedSession = session) {
    managedSession.printSummary();
}
session.close();
```

**正确写法：**

```java
TaskSession session = TaskSession.open();
try (TaskSession managedSession = session) {
    managedSession.printSummary();
}
```

**验证方式：** 使用会记录关闭次数并拒绝重复关闭的探针；错误版关闭计数到 2 并在第二次抛异常，正确版
关闭计数恰好为 1。两个 Java 版本的 `AutoCloseable` 都不提供通用幂等保证。

### 按声明顺序猜测关闭顺序

**触发条件：** 资源按“会话、通道”声明，却预期关闭时仍输出“会话、通道”。

**原因：** 多资源按声明的反向顺序关闭，而不是重复初始化顺序。

**后果：** 对依赖资源的生命周期判断错误，可能在关闭外层能力前先结束其底层依赖。

**错误示例：**

```java
try (
    TaskSession session = TaskSession.open(events);
    ReportChannel channel = ReportChannel.open(events)
) {
    events.add("生成报告");
}
assertCloseOrder("session,channel", events);
```

**正确写法：**

```java
try (
    TaskSession session = TaskSession.open(events);
    ReportChannel channel = ReportChannel.open(events)
) {
    events.add("生成报告");
}
assertCloseOrder("channel,session", events);
```

**验证方式：** 两个资源的 `close()` 分别追加名称；JDK 25 与 Java 8 都必须得到
`channel,session`，即后声明的通道先关闭。

### 在 Java 8 中直接写已有变量

**触发条件：** 在资源头之前创建 `session`，然后让 Java 8 编译 `try (session)`。

**原因：** 已有 final 或 effectively-final 变量直接进入资源头是 Java 9 起的语法增强。

**后果：** JDK 25 可以编译运行，同一源码在 Java 8 中发生语法错误。

**错误示例：**

```java
TaskSession session = TaskSession.open();
try (session) {
    session.printSummary();
}
```

**正确写法：**

```java
TaskSession session = TaskSession.open();
try (TaskSession managedSession = session) {
    managedSession.printSummary();
}
```

**验证方式：** 分别用 JDK 25 与 Java 8 编译错误版，前者成功、后者失败；正确版在两个版本都成功，并且
都只关闭同一个会话一次。

### 以为 catch 会在资源关闭前执行

**触发条件：** 在主体、`close()` 和 `catch` 中分别记录事件，却预期 catch 可以操作尚未关闭的资源。

**原因：** 带 catch 或 finally 的 try-with-resources 会先完成资源关闭，再进入外层 catch 或 finally。

**后果：** catch 中的恢复逻辑建立在错误生命周期上，可能继续访问已经关闭的资源。

**错误示例：**

```java
try (TaskSession session = TaskSession.open(events)) {
    throw new IllegalStateException("生成失败");
} catch (IllegalStateException failure) {
    assertLastEvent("主体失败", events);
}
```

**正确写法：**

```java
try (TaskSession session = TaskSession.open(events)) {
    throw new IllegalStateException("生成失败");
} catch (IllegalStateException failure) {
    assertLastEvent("关闭任务会话", events);
}
```

**验证方式：** 事件列表必须依次包含“打开任务会话、主体失败、关闭任务会话、进入 catch”；若还带
`finally`，它在 catch 之后执行。JDK 25 与 Java 8 顺序一致。
:::

## 七、完整的 TeamFlow 资源生命周期程序

### 1. 程序要解决的问题

程序运行成功和失败两条报告流程。每条流程都先创建 `TaskSession`，再从会话打开
`ReportChannel`：

- 成功流程发布一条任务报告，并观察通道先于会话关闭；
- 失败流程让主体和通道关闭同时失败，观察主异常与 suppressed exception；
- `catch` 读取失败时两个资源都已经完成关闭尝试，`finally` 最后记录流程结束。

所有事件只保存在内存列表中，不读写文件，也不连接网络或数据库。

### 2. JDK 25 完整程序

创建 `TeamFlowResourceApplication.java`：

```java
import java.util.ArrayList;
import java.util.List;

public final class TeamFlowResourceApplication {
    private static final class TaskSession implements AutoCloseable {
        private final List<String> events;
        private boolean closed;

        /**
         * 创建任务会话并记录打开事件。
         */
        private TaskSession(List<String> events) {
            this.events = events;
            events.add("打开任务会话");
        }

        /**
         * 打开一个新的任务会话。
         */
        private static TaskSession open(List<String> events) {
            return new TaskSession(events);
        }

        /**
         * 从当前会话打开报告通道。
         */
        private ReportChannel openReportChannel(boolean failOnClose) {
            requireOpen();
            return new ReportChannel(events, failOnClose);
        }

        /**
         * 确认任务会话仍然可用。
         */
        private void requireOpen() {
            if (closed) {
                throw new IllegalStateException("任务会话已经关闭");
            }
        }

        /**
         * 关闭任务会话并记录事件。
         */
        @Override
        public void close() {
            requireOpen();
            closed = true;
            events.add("关闭任务会话");
        }
    }

    private static final class ReportChannel implements AutoCloseable {
        private final List<String> events;
        private final boolean failOnClose;
        private boolean closed;

        /**
         * 创建报告通道并记录打开事件。
         */
        private ReportChannel(List<String> events, boolean failOnClose) {
            this.events = events;
            this.failOnClose = failOnClose;
            events.add("打开报告通道");
        }

        /**
         * 发布一条任务报告。
         */
        private void publish(String taskId, String title) {
            requireOpen();
            events.add("发布任务: " + taskId + " - " + title);
        }

        /**
         * 确认报告通道仍然可用。
         */
        private void requireOpen() {
            if (closed) {
                throw new IllegalStateException("报告通道已经关闭");
            }
        }

        /**
         * 关闭报告通道，并按配置模拟关闭失败。
         */
        @Override
        public void close() throws Exception {
            requireOpen();
            closed = true;
            events.add("关闭报告通道");
            if (failOnClose) {
                throw new Exception("报告通道关闭失败");
            }
        }
    }

    /**
     * 运行成功的报告发布流程。
     */
    private static void runSuccess(List<String> events) throws Exception {
        events.add("[成功流程]");
        TaskSession session = TaskSession.open(events);
        try (session; ReportChannel channel = session.openReportChannel(false)) {
            channel.publish("TASK-101", "准备迭代演示");
        }
        events.add("成功流程资源关闭完成");
    }

    /**
     * 运行主体与关闭同时失败的报告流程。
     */
    private static void runFailure(List<String> events) throws Exception {
        events.add("[失败流程]");
        TaskSession session = TaskSession.open(events);
        try (session; ReportChannel channel = session.openReportChannel(true)) {
            events.add("开始生成报告");
            throw new IllegalStateException("报告生成失败");
        } catch (IllegalStateException failure) {
            events.add("主异常: " + failure.getMessage());
            for (Throwable closeFailure : failure.getSuppressed()) {
                events.add("关闭异常: " + closeFailure.getMessage());
            }
        } finally {
            events.add("失败流程 finally 已执行");
        }
    }

    /**
     * 运行 TeamFlow 的成功与失败资源生命周期。
     */
    public static void main(String[] args) throws Exception {
        List<String> events = new ArrayList<>();
        runSuccess(events);
        runFailure(events);

        for (String event : events) {
            System.out.println(event);
        }
    }
}
```

### 3. 在 JDK 25 中配置并运行

1. 在 IntelliJ IDEA 中打开本课使用的普通 Java 项目。
2. 打开 **File -> Project Structure -> Project**，把 **Project SDK** 选择为 JDK 25，并让语言级别跟随
   SDK 或明确选择 25。
3. 在 **Modules -> Dependencies** 核对当前模块 SDK 跟随 Project SDK。
4. 创建 `TeamFlowResourceApplication.java`，填入 JDK 25 代码。
5. 点击 `main` 左侧运行图标，选择 **Run 'TeamFlowResourceApplication.main()'**。
6. 在 Run 控制台核对两个流程的资源打开、反向关闭、主异常和关闭异常顺序。

终端中的 `java -version` 不决定 IDEA 当前运行配置实际使用的 JDK；如有疑问，以 Project SDK、Module SDK
和 Run 配置显示的 JRE 为准。

### 4. JDK 25 预期输出与过程

```text
[成功流程]
打开任务会话
打开报告通道
发布任务: TASK-101 - 准备迭代演示
关闭报告通道
关闭任务会话
成功流程资源关闭完成
[失败流程]
打开任务会话
打开报告通道
开始生成报告
关闭报告通道
关闭任务会话
主异常: 报告生成失败
关闭异常: 报告通道关闭失败
失败流程 finally 已执行
```

成功流程在已有变量 `session` 进入资源头后，又创建 `channel`，因此离开主体时先关闭通道、再关闭会话。
失败流程的主体异常先产生，两个资源仍按反向顺序关闭；通道关闭失败成为 suppressed exception，会话继续
关闭。资源关闭完毕后才进入 `catch`，最后进入 `finally`。

### 5. Java 8 完整程序

Java 8 不能直接使用 `try (session)`，因此两个方法都在资源头中把已有会话重新声明为
`managedSession`。其余关闭语义保持不变：

```java
import java.util.ArrayList;
import java.util.List;

public final class TeamFlowResourceApplication {
    private static final class TaskSession implements AutoCloseable {
        private final List<String> events;
        private boolean closed;

        /**
         * 创建任务会话并记录打开事件。
         */
        private TaskSession(List<String> events) {
            this.events = events;
            events.add("打开任务会话");
        }

        /**
         * 打开一个新的任务会话。
         */
        private static TaskSession open(List<String> events) {
            return new TaskSession(events);
        }

        /**
         * 从当前会话打开报告通道。
         */
        private ReportChannel openReportChannel(boolean failOnClose) {
            requireOpen();
            return new ReportChannel(events, failOnClose);
        }

        /**
         * 确认任务会话仍然可用。
         */
        private void requireOpen() {
            if (closed) {
                throw new IllegalStateException("任务会话已经关闭");
            }
        }

        /**
         * 关闭任务会话并记录事件。
         */
        @Override
        public void close() {
            requireOpen();
            closed = true;
            events.add("关闭任务会话");
        }
    }

    private static final class ReportChannel implements AutoCloseable {
        private final List<String> events;
        private final boolean failOnClose;
        private boolean closed;

        /**
         * 创建报告通道并记录打开事件。
         */
        private ReportChannel(List<String> events, boolean failOnClose) {
            this.events = events;
            this.failOnClose = failOnClose;
            events.add("打开报告通道");
        }

        /**
         * 发布一条任务报告。
         */
        private void publish(String taskId, String title) {
            requireOpen();
            events.add("发布任务: " + taskId + " - " + title);
        }

        /**
         * 确认报告通道仍然可用。
         */
        private void requireOpen() {
            if (closed) {
                throw new IllegalStateException("报告通道已经关闭");
            }
        }

        /**
         * 关闭报告通道，并按配置模拟关闭失败。
         */
        @Override
        public void close() throws Exception {
            requireOpen();
            closed = true;
            events.add("关闭报告通道");
            if (failOnClose) {
                throw new Exception("报告通道关闭失败");
            }
        }
    }

    /**
     * 运行成功的报告发布流程。
     */
    private static void runSuccess(List<String> events) throws Exception {
        events.add("[成功流程]");
        TaskSession session = TaskSession.open(events);
        try (
            TaskSession managedSession = session;
            ReportChannel channel = managedSession.openReportChannel(false)
        ) {
            channel.publish("TASK-101", "准备迭代演示");
        }
        events.add("成功流程资源关闭完成");
    }

    /**
     * 运行主体与关闭同时失败的报告流程。
     */
    private static void runFailure(List<String> events) throws Exception {
        events.add("[失败流程]");
        TaskSession session = TaskSession.open(events);
        try (
            TaskSession managedSession = session;
            ReportChannel channel = managedSession.openReportChannel(true)
        ) {
            events.add("开始生成报告");
            throw new IllegalStateException("报告生成失败");
        } catch (IllegalStateException failure) {
            events.add("主异常: " + failure.getMessage());
            for (Throwable closeFailure : failure.getSuppressed()) {
                events.add("关闭异常: " + closeFailure.getMessage());
            }
        } finally {
            events.add("失败流程 finally 已执行");
        }
    }

    /**
     * 运行 TeamFlow 的成功与失败资源生命周期。
     */
    public static void main(String[] args) throws Exception {
        List<String> events = new ArrayList<>();
        runSuccess(events);
        runFailure(events);

        for (String event : events) {
            System.out.println(event);
        }
    }
}
```

### 6. 在 Java 8 中配置并运行

1. 在 **File -> Project Structure -> SDKs** 中添加本机已有的 JDK 8 安装目录。
2. 回到 **Project**，把 **Project SDK** 选择为 JDK 8，语言级别选择 8。
3. 在 **Modules -> Dependencies** 核对模块 SDK 跟随 Project SDK；不要只修改终端的 `JAVA_HOME`。
4. 用 Java 8 完整代码替换当前文件，确认资源头声明了 `managedSession`。
5. 运行同一个 `main`，控制台应逐行得到与 JDK 25 完全相同的输出。

本课不要求安装或修改系统中的 JDK。两个项目都存在时，也可以分别保留一份源码目录，让各自的 Project SDK
固定为对应版本，避免来回切换后误用旧的运行配置。

## 八、独立练习

### 1. 管理一次任务批次与通知通道

:::exercise
### 任务完成通知的资源边界

**要求：** 编写 `TeamFlowCleanupExercise`。先创建 `TaskBatch`，再从批次打开
`NotificationChannel`；发送“2 个任务已完成”后自动关闭两个资源。两个 `close()` 分别向同一个
`StringBuilder` 追加 `B` 和 `A`，不得手工调用 `close()`，不得使用文件、网络、数据库或后续框架 API。JDK 25
版本必须演示已有 effectively-final 变量直接进入资源头；Java 8 版本必须在资源头重新声明该变量。

**验收：**

```text
打开任务批次: BATCH-7
打开通知通道
发送通知: 2 个任务已完成
关闭通知通道
关闭任务批次: BATCH-7
验收通过: BA
```
:::

### 2. JDK 25 参考实现

```java
public final class TeamFlowCleanupExercise {
    private static final class TaskBatch implements AutoCloseable {
        private final String batchId;
        private final StringBuilder closeOrder;

        /**
         * 创建任务批次并记录打开事件。
         */
        private TaskBatch(String batchId, StringBuilder closeOrder) {
            this.batchId = batchId;
            this.closeOrder = closeOrder;
            System.out.println("打开任务批次: " + batchId);
        }

        /**
         * 创建一个新的任务批次。
         */
        private static TaskBatch open(String batchId, StringBuilder closeOrder) {
            return new TaskBatch(batchId, closeOrder);
        }

        /**
         * 从当前批次打开通知通道。
         */
        private NotificationChannel openNotificationChannel() {
            return new NotificationChannel(closeOrder);
        }

        /**
         * 关闭任务批次并记录关闭顺序。
         */
        @Override
        public void close() {
            closeOrder.append('A');
            System.out.println("关闭任务批次: " + batchId);
        }
    }

    private static final class NotificationChannel implements AutoCloseable {
        private final StringBuilder closeOrder;

        /**
         * 创建通知通道并记录打开事件。
         */
        private NotificationChannel(StringBuilder closeOrder) {
            this.closeOrder = closeOrder;
            System.out.println("打开通知通道");
        }

        /**
         * 发送任务完成通知。
         */
        private void send(int completedCount) {
            System.out.println("发送通知: " + completedCount + " 个任务已完成");
        }

        /**
         * 关闭通知通道并记录关闭顺序。
         */
        @Override
        public void close() {
            closeOrder.append('B');
            System.out.println("关闭通知通道");
        }
    }

    /**
     * 运行任务批次通知并验收反向关闭顺序。
     */
    public static void main(String[] args) {
        StringBuilder closeOrder = new StringBuilder();
        TaskBatch batch = TaskBatch.open("BATCH-7", closeOrder);

        try (batch; NotificationChannel channel = batch.openNotificationChannel()) {
            channel.send(2);
        }

        if (!"BA".equals(closeOrder.toString())) {
            throw new AssertionError("关闭顺序错误: " + closeOrder);
        }
        System.out.println("验收通过: " + closeOrder);
    }
}
```

### 3. Java 8 参考实现

```java
public final class TeamFlowCleanupExercise {
    private static final class TaskBatch implements AutoCloseable {
        private final String batchId;
        private final StringBuilder closeOrder;

        /**
         * 创建任务批次并记录打开事件。
         */
        private TaskBatch(String batchId, StringBuilder closeOrder) {
            this.batchId = batchId;
            this.closeOrder = closeOrder;
            System.out.println("打开任务批次: " + batchId);
        }

        /**
         * 创建一个新的任务批次。
         */
        private static TaskBatch open(String batchId, StringBuilder closeOrder) {
            return new TaskBatch(batchId, closeOrder);
        }

        /**
         * 从当前批次打开通知通道。
         */
        private NotificationChannel openNotificationChannel() {
            return new NotificationChannel(closeOrder);
        }

        /**
         * 关闭任务批次并记录关闭顺序。
         */
        @Override
        public void close() {
            closeOrder.append('A');
            System.out.println("关闭任务批次: " + batchId);
        }
    }

    private static final class NotificationChannel implements AutoCloseable {
        private final StringBuilder closeOrder;

        /**
         * 创建通知通道并记录打开事件。
         */
        private NotificationChannel(StringBuilder closeOrder) {
            this.closeOrder = closeOrder;
            System.out.println("打开通知通道");
        }

        /**
         * 发送任务完成通知。
         */
        private void send(int completedCount) {
            System.out.println("发送通知: " + completedCount + " 个任务已完成");
        }

        /**
         * 关闭通知通道并记录关闭顺序。
         */
        @Override
        public void close() {
            closeOrder.append('B');
            System.out.println("关闭通知通道");
        }
    }

    /**
     * 运行任务批次通知并验收反向关闭顺序。
     */
    public static void main(String[] args) {
        StringBuilder closeOrder = new StringBuilder();
        TaskBatch batch = TaskBatch.open("BATCH-7", closeOrder);

        try (
            TaskBatch managedBatch = batch;
            NotificationChannel channel = managedBatch.openNotificationChannel()
        ) {
            channel.send(2);
        }

        if (!"BA".equals(closeOrder.toString())) {
            throw new AssertionError("关闭顺序错误: " + closeOrder);
        }
        System.out.println("验收通过: " + closeOrder);
    }
}
```

### 4. 分别运行并检查

在 JDK 25 项目中运行现代版，再在 Java 8 项目中运行兼容版。两次输出必须与练习验收的六行完全一致。
`B` 先出现，说明后声明的通知通道先关闭；`A` 后出现，说明任务批次最后关闭。再检查源码中没有任何手工
`close()` 调用，才能证明顺序来自 try-with-resources，而不是参考实现暗中补做的清理。

## 九、把关闭合同带回 TeamFlow

### 1. 本课建立的是资源边界

完成本课后，TeamFlow 的任务会话、报告通道和批次探针都能回答三个问题：谁创建资源、谁最终关闭、主体与
关闭同时失败时怎样保留信息。真实工程中的资源类型会变化，但这三个问题不会因为 API 名称变化而消失。

文件读写会在下一课引入真正的文件资源和数据操作。本课不把 `Path`、`Files`、字节流、字符流或字符集提前
塞进关闭示例，也不讨论网络、数据库、HTTP 或 Spring 生命周期。

### 2. 自我检查

不看代码，尝试回答：

1. 创建、借用和接管分别由谁关闭资源？
2. `AutoCloseable` 与 try-with-resources 各自保证什么？
3. 两个资源为什么按后进先出的顺序关闭？
4. 主体和 `close()` 同时失败时，两个异常分别在哪里？
5. `catch` 和 `finally` 为什么看到的是资源完成关闭尝试后的状态？
6. 为什么 `try (session)` 能在 JDK 25 编译，却不能直接交给 Java 8？

能结合完整程序解释每一行输出，并独立完成两个版本的练习，才算真正掌握资源关闭。
