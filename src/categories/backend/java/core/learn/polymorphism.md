---
id: backend.java.learn.basics.polymorphism
type: lesson
title: 多态
summary: 用父类型合同接收不同具体对象，并理解重写方法的动态选择与安全类型转换
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 90
prerequisites:
  - backend.java.learn.basics.abstract-classes-and-interfaces
objectives:
  - 能区分引用变量的声明类型与对象的运行时类型。
  - 能通过向上转型让父类或接口类型接收不同具体对象。
  - 能解释重写实例方法为什么会按运行时对象选择实现。
  - 能用父类型参数和父类型数组统一处理不同实现。
  - 能在确认对象类型后安全访问具体类型能力。
  - 能区分实例方法多态与字段隐藏、静态方法隐藏。
  - 能处理 JDK 25 模式 instanceof 与 Java 8 传统写法的真实差异。
recap:
  - 声明类型决定可以直接调用的合同，运行时类型决定重写实例方法的具体实现。
  - 子类对象赋给父类或接口变量属于向上转型，不会复制或改变对象。
  - 父类型参数和数组可以统一接收不同实现，并通过同一实例方法调用产生不同结果。
  - 向下转型不会改变对象；实际类型不兼容时会抛出 ClassCastException。
  - instanceof 可以在转换前确认类型，null 与任何类型匹配都得到 false。
  - 字段访问和静态方法不按运行时对象动态选择，不能当作重写实例方法理解。
  - JDK 25 支持 instanceof 模式变量，Java 8 需要判断后再显式转换。
related: []
tags:
  - Java
  - 多态
  - 向上转型
  - 向下转型
  - instanceof
  - 动态方法选择
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 的 instanceof 模式变量差异在对应位置说明
verifiedAt: 2026-08-17
sources:
  - id: dev-java-polymorphism
    title: Polymorphism - Dev.java
    url: https://dev.java/learn/inheritance/polymorphism/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java；Java SE
    claims:
      - 父类型变量可以引用不同子类对象，重写实例方法由对象的实际类型决定
      - 字段隐藏与重写实例方法具有不同的选择规则
  - id: dev-java-overriding-and-hiding
    title: Overriding and Hiding Methods - Dev.java
    url: https://dev.java/learn/inheritance/overriding/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java；Java SE
    claims:
      - 子类同签名实例方法可以重写父类方法
      - 同名静态方法属于隐藏，选择方式不同于重写实例方法
  - id: jls-25-conversions
    title: Java Language Specification 25 - Conversions and Contexts
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 引用类型的拓宽转换与收窄转换规则
      - 不兼容的受检收窄引用转换会在运行时抛出 ClassCastException
  - id: jls-25-expressions
    title: Java Language Specification 25 - Expressions
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 重写实例方法的运行时动态选择规则
      - 字段访问、instanceof 类型比较与模式匹配的规则
      - null 与 instanceof 匹配时结果为 false
  - id: jls-25-classes
    title: Java Language Specification 25 - Classes
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 实例方法重写、静态方法隐藏和字段隐藏的语言规则
  - id: jls-8-conversions
    title: Java Language Specification 8 - Conversions and Contexts
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-5.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 的拓宽、收窄引用转换与 ClassCastException 规则
  - id: jls-8-expressions
    title: Java Language Specification 8 - Expressions
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 的动态方法选择与传统 instanceof 类型比较规则
      - Java 8 不包含 instanceof 模式变量语法
  - id: jep-394-pattern-matching-instanceof
    title: JEP 394 - Pattern Matching for instanceof
    url: https://openjdk.org/jeps/394
    sourceOrigin: official
    sourceType: release-note
    appliesTo: Java 16 及以上；JDK 25 可用
    claims:
      - instanceof 模式匹配在 Java 16 正式交付
      - 类型判断成功时可以直接得到受流作用域约束的模式变量
  - id: stackoverflow-downcasting-java
    title: Downcasting in Java - Stack Overflow
    url: https://stackoverflow.com/questions/380813/downcasting-in-java
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 向下转型的真实初学者误区
    claims:
      - 真实问答对比了实际对象兼容时转换成功、不兼容时抛出 ClassCastException 的情况
  - id: stackoverflow-method-hiding
    title: What is method hiding in Java? - Stack Overflow
    url: https://stackoverflow.com/questions/16313649/what-is-method-hiding-in-java-even-the-javadoc-explanation-is-confusing
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 静态方法隐藏与实例方法重写的真实初学者误区
    claims:
      - 真实问答通过对照输出区分了静态方法隐藏和实例方法重写
---

# 多态

上一课已经用抽象类和接口建立了合同，也让具体类补齐合同。本课要解决调用方的问题：通知调度器如果只认
`EmailNotifier`，以后增加控制台通知就要再写一套流程；如果调度器只认共同的 `Notifier` 合同，同一段代码
就能接收不同对象，并在运行时执行各自的通知行为。

这种“同一类型合同、不同对象表现”就是本课要掌握的多态。内容只覆盖父类型引用、重写实例方法的动态选择、
安全类型转换及字段和静态方法的边界；`Object` 合同、`record` 和完整通知策略留给后续课程。

## 一、区分引用的声明类型与对象类型

### 1. 父类型引用可以指向具体对象

先声明通知合同和一个具体实现：

```java
/** 声明通知行为合同。 */
interface Notifier {
    /**
     * 发送通知。
     *
     * @param message 通知内容
     */
    void send(String message);
}

/** 通过邮件发送通知。 */
final class EmailNotifier implements Notifier {
    /**
     * 输出邮件通知。
     *
     * @param message 通知内容
     */
    @Override
    public void send(String message) {
        System.out.println("邮件：" + message);
    }
}

Notifier notifier = new EmailNotifier();
notifier.send("任务已进入复核");
```

赋值左边的 `Notifier` 是引用变量 `notifier` 的声明类型，右边真正创建的是 `EmailNotifier` 对象，它是该引用
当前指向对象的运行时类型。`EmailNotifier` 完成了 `Notifier` 合同，所以这个赋值合法，输出为
`邮件：任务已进入复核`。

从更具体的 `EmailNotifier` 转到更宽的 `Notifier`，叫作向上转型。这里不需要写强制转换符号，因为每个
`EmailNotifier` 都一定是 `Notifier`，编译器可以直接确认安全性。父类与子类之间同样适用这条规则。

### 2. 声明类型决定可以直接使用的合同

如果邮件实现还提供重试能力，而 `Notifier` 没有声明它，父类型引用就不能直接调用：

```java
/** 通过邮件发送并重试通知。 */
final class EmailNotifier implements Notifier {
    /**
     * 输出邮件通知。
     *
     * @param message 通知内容
     */
    @Override
    public void send(String message) {
        System.out.println("邮件：" + message);
    }

    /**
     * 重试最近一次邮件通知。
     */
    public void retry() {
        System.out.println("重试邮件");
    }
}

Notifier notifier = new EmailNotifier();
notifier.send("任务已进入复核");
// notifier.retry(); // 编译失败：Notifier 合同中没有 retry()
```

编译器先根据声明类型检查“允许调用什么”。这并不否认对象确实是 `EmailNotifier`，而是保证只依赖
`Notifier` 的代码不会偷偷使用某个实现独有的能力。需要使用 `retry()` 时，要先证明对象确实属于相应类型，
本课第三章会给出安全写法。

### 3. 向上转型不会复制或改造对象

下面两个变量先后引用的是同一个具体对象：

```java
EmailNotifier emailNotifier = new EmailNotifier();
Notifier notifier = emailNotifier;

emailNotifier.send("从具体类型调用");
notifier.send("从接口类型调用");
```

第二行只把对象引用赋给另一个变量，没有创建第二个对象，也没有删掉邮件实现的能力。变化的是调用方看见的
类型合同：`emailNotifier` 能使用 `EmailNotifier` 的公开能力，`notifier` 只能直接使用 `Notifier` 声明的
能力。两个调用最终都进入同一个对象的 `send()` 实现。

## 二、让同一调用表现出不同结果

### 1. 重写实例方法按运行时类型选择

一个接口可以有多个实现：

```java
/** 通过控制台发送通知。 */
final class ConsoleNotifier implements Notifier {
    /**
     * 输出控制台通知。
     *
     * @param message 通知内容
     */
    @Override
    public void send(String message) {
        System.out.println("控制台：" + message);
    }
}

Notifier first = new EmailNotifier();
Notifier second = new ConsoleNotifier();

first.send("任务 #4201 已更新");
second.send("任务 #4201 已更新");
```

两个变量的声明类型都是 `Notifier`，调用语句也都是 `send(...)`，但输出不同：

```text
邮件：任务 #4201 已更新
控制台：任务 #4201 已更新
```

编译阶段确认 `Notifier` 合同中存在 `send(String)`；运行阶段再根据对象实际是 `EmailNotifier` 还是
`ConsoleNotifier`，选择对应的重写实例方法。这种动态选择也称为虚方法调用。它不是根据变量名猜测，
也不是随机挑选实现。

### 2. 父类型参数统一接收不同实现

调度方法只依赖共同合同，不需要为每种实现复制一份：

```java
/** 运行最小通知调度示例。 */
public class PolymorphicDispatchDemo {
    /**
     * 通过传入的通知器发送消息。
     *
     * @param notifier 通知器合同
     * @param message 通知内容
     */
    static void dispatch(Notifier notifier, String message) {
        notifier.send(message);
    }

    /**
     * 依次使用邮件和控制台通知器。
     *
     * @param args 命令行参数，本例不读取
     */
    public static void main(String[] args) {
        dispatch(new EmailNotifier(), "任务 #4201 已更新");
        dispatch(new ConsoleNotifier(), "任务 #4201 已更新");
    }
}
```

调用 `dispatch(...)` 时发生向上转型：两个具体对象都能传给 `Notifier` 参数。方法体只有一行，但第一次调用
邮件实现，第二次调用控制台实现。以后增加另一个 `Notifier` 实现，调度方法仍然不需要改变。

### 3. 父类型数组保存不同对象

数组元素类型也可以是父类或接口：

```java
Notifier[] notifiers = {
    new EmailNotifier(),
    new ConsoleNotifier()
};

for (int index = 0; index < notifiers.length; index++) {
    notifiers[index].send("TeamFlow 服务状态正常");
}
```

数组合同保证每个元素至少能 `send(...)`，循环不需要先判断具体类。每次取出的声明类型仍是 `Notifier`，
真正执行哪个实现由该元素当前保存的对象决定。本课用已经学过的数组承载多态，不提前引入集合。

## 三、在确认类型后访问具体能力

### 1. 向下转型只改变引用视角

从父类型回到更具体的类型叫作向下转型。编译器无法只根据父类型保证对象一定属于目标子类型，所以需要
显式写出目标类型：

```java
Notifier notifier = new EmailNotifier();
EmailNotifier emailNotifier = (EmailNotifier) notifier;
emailNotifier.retry();
```

转换成功是因为 `notifier` 实际指向 `EmailNotifier`。转换没有把普通通知器变成邮件通知器，也没有创建新
对象；它只是得到一个声明类型更具体的引用。如果实际对象是 `ConsoleNotifier`，相同转换虽然可能通过编译，
运行到该行时却会抛出 `ClassCastException`。

不需要具体能力时不要向下转型。让业务流程依赖 `Notifier` 的共同合同，通常比到处判断具体类更容易扩展。

**社区补充：** Stack Overflow 的下转型问答对比了两类对象：父类型引用实际保存目标子类对象时，转换可以
成功；实际保存普通父类或其他实现对象时，转换会抛出 `ClassCastException`。该对照与 JLS 的受检收窄引用
转换规则一致，说明强制转换只检查并改变引用视角，不能改造对象。

### 2. JDK 25 使用模式 instanceof

JDK 25 可以把类型判断和转换合并：

```java
Notifier notifier = new EmailNotifier();

if (notifier instanceof EmailNotifier emailNotifier) {
    emailNotifier.retry();
}
```

只有 `notifier` 确实引用 `EmailNotifier` 或其子类型对象时，条件才为 `true`，模式变量
`emailNotifier` 才能在这个分支中使用。这样不会忘记转换，也不会把检查类型和转换目标写成两种不同类型。

如果引用为 `null`，`null instanceof EmailNotifier` 的结果是 `false`，不会创建模式变量，也不会因为判断本身
抛出异常。离开确定匹配成立的作用域后，模式变量不再可用。

### 3. Java 8 先判断再显式转换

Java 8 支持传统 `instanceof`，但不支持模式变量。兼容写法必须完整写成：

```java
Notifier notifier = new EmailNotifier();

if (notifier instanceof EmailNotifier) {
    EmailNotifier emailNotifier = (EmailNotifier) notifier;
    emailNotifier.retry();
}
```

判断与转换使用相同的 `EmailNotifier`。这段代码在 Java 8 和 JDK 25 都能运行；现代主线采用模式变量，是
为了减少重复并让检查与使用关系更清楚，不代表传统写法失效。

## 四、分清实例方法、字段与静态方法

### 1. 字段访问不按运行时对象动态选择

重写适用于实例方法，字段只有隐藏，没有字段多态：

```java
/** 表示通用通知渠道。 */
class BaseChannel {
    String name = "通用渠道";

    /**
     * 返回渠道标签。
     *
     * @return 渠道标签
     */
    public String label() {
        return "通用通知";
    }
}

/** 表示邮件通知渠道。 */
final class MailChannel extends BaseChannel {
    String name = "邮件渠道";

    /**
     * 返回邮件渠道标签。
     *
     * @return 邮件渠道标签
     */
    @Override
    public String label() {
        return "邮件通知";
    }
}

BaseChannel channel = new MailChannel();
System.out.println(channel.name);
System.out.println(channel.label());
```

输出是：

```text
通用渠道
邮件通知
```

`channel.name` 根据引用的声明类型 `BaseChannel` 解析，`channel.label()` 才根据运行时对象选择重写实现。
不要用父子类同名字段表达需要变化的行为；应把这类访问封装成可重写实例方法。

### 2. 静态方法属于类，不参与实例方法多态

父类和子类可以声明同签名静态方法，但子类方法隐藏父类方法，不是重写：

```java
/** 提供通用渠道信息。 */
class ChannelInfo {
    /**
     * 返回通用渠道类别。
     *
     * @return 通用渠道类别
     */
    static String category() {
        return "通用渠道";
    }
}

/** 提供邮件渠道信息。 */
final class MailChannelInfo extends ChannelInfo {
    /**
     * 返回邮件渠道类别。
     *
     * @return 邮件渠道类别
     */
    static String category() {
        return "邮件渠道";
    }
}

ChannelInfo info = new MailChannelInfo();
System.out.println(info.category());
System.out.println(MailChannelInfo.category());
```

输出为：

```text
通用渠道
邮件渠道
```

通过 `info` 调用时，编译器按声明类型 `ChannelInfo` 选择静态方法。为了明确所有者，应使用
`ChannelInfo.category()` 或 `MailChannelInfo.category()`，不要通过对象引用调用静态方法并期待动态选择。

**社区补充：** Stack Overflow 的方法隐藏问答把静态方法和实例方法放在同一组父子类中对照：静态方法按
类或引用声明类型选择，重写实例方法按运行时对象选择。该输出已经由 Dev.java、JLS 和两版临时程序共同
核验；实际代码应通过类名调用静态方法，避免制造它会动态分派的错觉。

### 3. 多态只承诺父类型合同

把不同对象交给父类型流程，前提是流程只依赖共同合同。某个实现独有的字段、静态工具或具体方法不会因为
向上转型自动加入父类型。判断设计是否合适时，可以依次问：

- 调用方是否只需要 `Notifier` 已声明的行为？如果是，保持父类型引用。
- 具体能力是否也是多种实现都应遵守的合同？如果是，应把它提取为已学过的接口，而不是反复向下转型。
- 只有少数对象确实拥有该能力吗？如果是，先用 `instanceof` 确认，再在最小范围内使用具体类型。

这三步让多态帮助调用方减少分支，而不是把流程变成一串具体类型判断。

## 五、运行完整的 TeamFlow 通知程序

### 1. JDK 25 完整程序

在 JDK 25 普通 Java 项目的 `src/teamflow` 中创建 `TeamFlowPolymorphismApplication.java`：

```java
package teamflow;

/** 声明所有通知器都必须完成的发送合同。 */
interface Notifier {
    /**
     * 发送通知。
     *
     * @param message 通知内容
     */
    void send(String message);
}

/** 声明只有部分通知器支持的重试合同。 */
interface RetryableNotifier {
    /**
     * 重试发送通知。
     *
     * @param message 通知内容
     */
    void retry(String message);
}

/** 通过邮件发送通知，并支持重试。 */
final class EmailNotifier implements Notifier, RetryableNotifier {
    private final String address;

    /**
     * 创建邮件通知器。
     *
     * @param address 收件地址
     */
    EmailNotifier(String address) {
        this.address = address;
    }

    /**
     * 输出邮件发送结果。
     *
     * @param message 通知内容
     */
    @Override
    public void send(String message) {
        System.out.println("邮件发送至 " + address + "：" + message);
    }

    /**
     * 输出邮件重试结果。
     *
     * @param message 通知内容
     */
    @Override
    public void retry(String message) {
        System.out.println("邮件重试至 " + address + "：" + message);
    }
}

/** 把通知写到指定控制台名称。 */
final class ConsoleNotifier implements Notifier {
    private final String consoleName;

    /**
     * 创建控制台通知器。
     *
     * @param consoleName 控制台名称
     */
    ConsoleNotifier(String consoleName) {
        this.consoleName = consoleName;
    }

    /**
     * 输出控制台通知。
     *
     * @param message 通知内容
     */
    @Override
    public void send(String message) {
        System.out.println("控制台 " + consoleName + "：" + message);
    }
}

/** 统一调度不同通知器。 */
final class NotificationDispatcher {
    /**
     * 依次发送通知，并重试支持重试合同的对象。
     *
     * @param notifiers 通知器数组
     * @param message 通知内容
     */
    public void dispatch(Notifier[] notifiers, String message) {
        for (int index = 0; index < notifiers.length; index++) {
            Notifier notifier = notifiers[index];
            notifier.send(message);

            if (notifier instanceof RetryableNotifier retryableNotifier) {
                retryableNotifier.retry(message);
            }
        }
    }
}

/** 运行 TeamFlow 多态通知示例。 */
public class TeamFlowPolymorphismApplication {
    /**
     * 创建不同通知器并交给同一个调度器。
     *
     * @param args 命令行参数，本例不读取
     */
    public static void main(String[] args) {
        Notifier[] notifiers = {
            new EmailNotifier("dev@teamflow.local"),
            new ConsoleNotifier("TeamFlow")
        };

        NotificationDispatcher dispatcher = new NotificationDispatcher();
        dispatcher.dispatch(notifiers, "任务 #4201 已进入复核");
    }
}
```

在 IntelliJ IDEA 中把 Project SDK 和模块 SDK 设为 JDK 25，Language level 选择 SDK default。打开入口类，
点击 `main` 左侧运行按钮，选择 **Run 'TeamFlowPolymorphismApplication.main()'**。确认运行配置的 JRE 也是
项目 JDK 25，再观察 Run 控制台。

也可以在项目根目录执行：

```bash
mkdir -p out-25-polymorphism
javac -encoding UTF-8 -d out-25-polymorphism src/teamflow/TeamFlowPolymorphismApplication.java
java -cp out-25-polymorphism teamflow.TeamFlowPolymorphismApplication
```

预期输出：

```text
邮件发送至 dev@teamflow.local：任务 #4201 已进入复核
邮件重试至 dev@teamflow.local：任务 #4201 已进入复核
控制台 TeamFlow：任务 #4201 已进入复核
```

### 2. Java 8 完整程序

Java 8 使用同一组合同和业务输出，但必须把模式变量改成传统判断与显式转换。完整源码如下：

```java
package teamflow;

/** 声明所有通知器都必须完成的发送合同。 */
interface Notifier {
    /**
     * 发送通知。
     *
     * @param message 通知内容
     */
    void send(String message);
}

/** 声明只有部分通知器支持的重试合同。 */
interface RetryableNotifier {
    /**
     * 重试发送通知。
     *
     * @param message 通知内容
     */
    void retry(String message);
}

/** 通过邮件发送通知，并支持重试。 */
final class EmailNotifier implements Notifier, RetryableNotifier {
    private final String address;

    /**
     * 创建邮件通知器。
     *
     * @param address 收件地址
     */
    EmailNotifier(String address) {
        this.address = address;
    }

    /**
     * 输出邮件发送结果。
     *
     * @param message 通知内容
     */
    @Override
    public void send(String message) {
        System.out.println("邮件发送至 " + address + "：" + message);
    }

    /**
     * 输出邮件重试结果。
     *
     * @param message 通知内容
     */
    @Override
    public void retry(String message) {
        System.out.println("邮件重试至 " + address + "：" + message);
    }
}

/** 把通知写到指定控制台名称。 */
final class ConsoleNotifier implements Notifier {
    private final String consoleName;

    /**
     * 创建控制台通知器。
     *
     * @param consoleName 控制台名称
     */
    ConsoleNotifier(String consoleName) {
        this.consoleName = consoleName;
    }

    /**
     * 输出控制台通知。
     *
     * @param message 通知内容
     */
    @Override
    public void send(String message) {
        System.out.println("控制台 " + consoleName + "：" + message);
    }
}

/** 统一调度不同通知器。 */
final class NotificationDispatcher {
    /**
     * 依次发送通知，并重试支持重试合同的对象。
     *
     * @param notifiers 通知器数组
     * @param message 通知内容
     */
    public void dispatch(Notifier[] notifiers, String message) {
        for (int index = 0; index < notifiers.length; index++) {
            Notifier notifier = notifiers[index];
            notifier.send(message);

            if (notifier instanceof RetryableNotifier) {
                RetryableNotifier retryableNotifier = (RetryableNotifier) notifier;
                retryableNotifier.retry(message);
            }
        }
    }
}

/** 运行 TeamFlow 多态通知示例。 */
public class TeamFlowPolymorphismApplication {
    /**
     * 创建不同通知器并交给同一个调度器。
     *
     * @param args 命令行参数，本例不读取
     */
    public static void main(String[] args) {
        Notifier[] notifiers = {
            new EmailNotifier("dev@teamflow.local"),
            new ConsoleNotifier("TeamFlow")
        };

        NotificationDispatcher dispatcher = new NotificationDispatcher();
        dispatcher.dispatch(notifiers, "任务 #4201 已进入复核");
    }
}
```

在兼容项目中选择已配置的 JDK 8，将 Project SDK、模块 SDK、Language level 8 和运行配置 JRE 都核对为
JDK 8。不要只改编辑器显示的语言级别。重新打开同名入口文件并运行，或执行：

```bash
mkdir -p out-8-polymorphism
javac -encoding UTF-8 -d out-8-polymorphism src/teamflow/TeamFlowPolymorphismApplication.java
java -cp out-8-polymorphism teamflow.TeamFlowPolymorphismApplication
```

Java 8 的预期输出与 JDK 25 完全相同：

```text
邮件发送至 dev@teamflow.local：任务 #4201 已进入复核
邮件重试至 dev@teamflow.local：任务 #4201 已进入复核
控制台 TeamFlow：任务 #4201 已进入复核
```

### 3. 读懂关键执行过程

入口创建两个不同对象，并在放入 `Notifier[]` 时向上转型。调度器从数组取出元素后，只依赖
`Notifier.send(...)`，但第一次动态选择邮件实现，第二次动态选择控制台实现。

邮件对象还完成了 `RetryableNotifier` 合同。JDK 25 的模式匹配或 Java 8 的传统判断都先确认这一事实，
再调用 `retry(...)`；控制台对象不匹配，所以只发送一次。输出顺序正好反映数组顺序、动态方法选择和安全
具体能力访问三个步骤。

## 六、处理多态中的常见错误

### 六个典型错误

:::pitfalls
### 通过父类型直接调用具体类方法

**触发条件：** 引用声明为 `Notifier`，却直接调用只在 `EmailNotifier` 中声明的 `retry(String)`。

**原因：** 编译器根据引用的声明类型检查可见合同，`Notifier` 没有声明重试能力。

**后果：** 编译失败；即使对象实际是邮件通知器，也不能绕过父类型合同。

**错误示例：**

```java
Notifier notifier = new EmailNotifier("dev@teamflow.local");
notifier.retry("任务已更新");
```

**正确写法：**

```java
Notifier notifier = new EmailNotifier("dev@teamflow.local");
if (notifier instanceof EmailNotifier emailNotifier) {
    emailNotifier.retry("任务已更新");
}
```

**验证方式：** JDK 25 应拒绝错误栏并指出 `Notifier` 中找不到 `retry(String)`；正确栏应输出
“邮件重试至 dev@teamflow.local：任务已更新”。Java 8 使用本节第三项给出的传统判断写法。

### 不检查实际对象就向下转型

**触发条件：** 变量声明为共同父类型，但实际保存控制台对象，却强制转换成邮件类型。

**原因：** 编译器只能确认两个类型之间存在可能的转换关系，运行时检查发现当前对象不是目标类型。

**后果：** 代码可以编译，但执行转换行时抛出 `ClassCastException`，后续语句不会执行。

**错误示例：**

```java
Notifier notifier = new ConsoleNotifier("TeamFlow");
EmailNotifier emailNotifier = (EmailNotifier) notifier;
emailNotifier.retry("任务已更新");
```

**正确写法：**

```java
Notifier notifier = new ConsoleNotifier("TeamFlow");
if (notifier instanceof EmailNotifier emailNotifier) {
    emailNotifier.retry("任务已更新");
} else {
    System.out.println("当前通知器不支持邮件重试");
}
```

**验证方式：** JDK 25 与 Java 8 的错误程序都应在转换行抛出 `ClassCastException`；正确程序不执行转换，
输出“当前通知器不支持邮件重试”。Java 8 把正确栏改成传统 `instanceof` 加显式转换。

### 把模式 instanceof 直接复制到 Java 8

**触发条件：** Java 8 源码写出 `instanceof EmailNotifier emailNotifier`。

**原因：** `instanceof` 模式匹配在 Java 16 才正式交付，Java 8 只支持类型比较形式。

**后果：** JDK 25 编译通过，Java 8 在模式变量位置产生语法错误。

**错误示例：**

```java
if (notifier instanceof EmailNotifier emailNotifier) {
    emailNotifier.retry("任务已更新");
}
```

**正确写法：**

```java
if (notifier instanceof EmailNotifier) {
    EmailNotifier emailNotifier = (EmailNotifier) notifier;
    emailNotifier.retry("任务已更新");
}
```

**验证方式：** 使用 JDK 25 编译错误栏应通过；使用 Java 8 编译同一栏应失败。正确栏在两个版本都应
编译通过，并只在对象确实是 `EmailNotifier` 时调用重试。

### 期待同名字段动态选择

**触发条件：** 父类与子类声明同名字段，再通过父类类型引用读取字段并期待子类值。

**原因：** 字段访问根据引用的声明类型解析；只有重写实例方法按运行时对象动态选择。

**后果：** 程序可以运行，却输出父类字段，业务状态容易出现“看起来重写却没有生效”的误判。

**错误示例：**

```java
class BaseChannel {
    String name = "通用渠道";
}
final class MailChannel extends BaseChannel {
    String name = "邮件渠道";
}
BaseChannel channel = new MailChannel();
System.out.println(channel.name);
```

**正确写法：**

```java
class BaseChannel {
    /** @return 渠道名称 */
    public String name() {
        return "通用渠道";
    }
}
final class MailChannel extends BaseChannel {
    /** @return 邮件渠道名称 */
    @Override
    public String name() {
        return "邮件渠道";
    }
}
BaseChannel channel = new MailChannel();
System.out.println(channel.name());
```

**验证方式：** 两个版本运行错误栏都输出“通用渠道”；正确栏改为重写实例方法后都输出“邮件渠道”。

### 把静态方法隐藏当成实例方法重写

**触发条件：** 父类和子类声明同名静态方法，并通过父类类型引用调用，期待按对象类型选择子类方法。

**原因：** 静态方法属于类，子类同名静态方法隐藏父类方法；调用目标在编译阶段按限定类型确定。

**后果：** 程序输出父类结果，与调用者期待不符；`@Override` 也不能把静态方法变成实例方法重写。

**错误示例：**

```java
class BaseChannel {
    /** @return 通用渠道类别 */
    static String category() {
        return "通用渠道";
    }
}
final class MailChannel extends BaseChannel {
    /** @return 邮件渠道类别 */
    static String category() {
        return "邮件渠道";
    }
}
BaseChannel channel = new MailChannel();
System.out.println(channel.category());
```

**正确写法：**

```java
System.out.println(BaseChannel.category());
System.out.println(MailChannel.category());
```

**验证方式：** 两个版本运行错误栏都输出“通用渠道”；正确栏显式使用类名后依次输出“通用渠道”和
“邮件渠道”，不会制造动态选择的错觉。

### 对父类型数组的每个元素强制使用同一子类型

**触发条件：** `Notifier[]` 同时保存邮件和控制台对象，循环中却把每个元素都转换成 `EmailNotifier`。

**原因：** 父类型数组只保证元素遵守共同合同，不保证所有元素具有同一个具体类型。

**后果：** 邮件元素可以转换，循环到控制台元素时抛出 `ClassCastException`，批量处理在中途停止。

**错误示例：**

```java
Notifier[] notifiers = {
    new EmailNotifier("dev@teamflow.local"),
    new ConsoleNotifier("TeamFlow")
};
for (int index = 0; index < notifiers.length; index++) {
    EmailNotifier emailNotifier = (EmailNotifier) notifiers[index];
    emailNotifier.retry("任务已更新");
}
```

**正确写法：**

```java
Notifier[] notifiers = {
    new EmailNotifier("dev@teamflow.local"),
    new ConsoleNotifier("TeamFlow")
};
for (int index = 0; index < notifiers.length; index++) {
    Notifier notifier = notifiers[index];
    notifier.send("任务已更新");
    if (notifier instanceof EmailNotifier emailNotifier) {
        emailNotifier.retry("任务已更新");
    }
}
```

**验证方式：** JDK 25 与 Java 8 的错误程序都应在第二个元素转换时抛出 `ClassCastException`；正确程序
应让两个对象都发送通知，只让邮件对象重试。Java 8 使用传统判断与显式转换。
:::

## 七、练习：统一输出 TeamFlow 任务摘要

:::exercise
### TeamFlow 任务摘要

**要求：** 声明 `TaskSummary` 接口及 `print(int taskId, String title)` 方法。让
`NormalTaskSummary` 输出“普通任务”，让 `UrgentTaskSummary` 输出“紧急任务”；再声明
`OwnerAwareSummary` 接口及 `printOwner(String owner)` 方法，只让紧急摘要实现它。入口用
`TaskSummary[]` 保存两个对象，先通过共同合同输出任务，再安全判断并输出紧急任务负责人。不要使用
`Object` 方法、`record`、集合、Lambda 或后续框架。

**验收：** JDK 25 使用模式 `instanceof`，Java 8 使用传统判断与显式转换。两个版本都必须通过同一段
数组循环，依次输出任务 `#5101`“整理迭代看板”、任务 `#5102`“修复登录阻塞”，并且只为第二项输出
负责人“阿宁”。直接把普通摘要转换为 `OwnerAwareSummary` 应能复现 `ClassCastException`，参考实现不得
执行这条错误路径。

**参考答案：** 两个版本的完整源码、IDEA 配置、命令和预期输出见下方。
:::

### 1. JDK 25 参考实现

在 JDK 25 项目的 `src/teamflow` 中创建 `TeamFlowPolymorphismExerciseApplication.java`：

```java
package teamflow;

/** 声明任务摘要输出合同。 */
interface TaskSummary {
    /**
     * 输出任务摘要。
     *
     * @param taskId 任务编号
     * @param title 任务标题
     */
    void print(int taskId, String title);
}

/** 声明可输出负责人的附加合同。 */
interface OwnerAwareSummary {
    /**
     * 输出任务负责人。
     *
     * @param owner 负责人
     */
    void printOwner(String owner);
}

/** 输出普通任务摘要。 */
final class NormalTaskSummary implements TaskSummary {
    /**
     * 输出普通任务。
     *
     * @param taskId 任务编号
     * @param title 任务标题
     */
    @Override
    public void print(int taskId, String title) {
        System.out.println("普通任务 #" + taskId + "：" + title);
    }
}

/** 输出紧急任务摘要和负责人。 */
final class UrgentTaskSummary implements TaskSummary, OwnerAwareSummary {
    /**
     * 输出紧急任务。
     *
     * @param taskId 任务编号
     * @param title 任务标题
     */
    @Override
    public void print(int taskId, String title) {
        System.out.println("紧急任务 #" + taskId + "：" + title);
    }

    /**
     * 输出紧急任务负责人。
     *
     * @param owner 负责人
     */
    @Override
    public void printOwner(String owner) {
        System.out.println("负责人：" + owner);
    }
}

/** 运行 TeamFlow 多态练习。 */
public class TeamFlowPolymorphismExerciseApplication {
    /**
     * 输出两项任务，并为支持负责人合同的对象补充负责人。
     *
     * @param args 命令行参数，本例不读取
     */
    public static void main(String[] args) {
        TaskSummary[] summaries = {
            new NormalTaskSummary(),
            new UrgentTaskSummary()
        };
        int[] taskIds = {5101, 5102};
        String[] titles = {"整理迭代看板", "修复登录阻塞"};

        for (int index = 0; index < summaries.length; index++) {
            TaskSummary summary = summaries[index];
            summary.print(taskIds[index], titles[index]);

            if (summary instanceof OwnerAwareSummary ownerAwareSummary) {
                ownerAwareSummary.printOwner("阿宁");
            }
        }
    }
}
```

确认 Project SDK、模块 SDK 和运行配置 JRE 都是 JDK 25，Language level 为 SDK default，然后运行
`TeamFlowPolymorphismExerciseApplication.main()`。也可以执行：

```bash
mkdir -p out-25-polymorphism-exercise
javac -encoding UTF-8 -d out-25-polymorphism-exercise src/teamflow/TeamFlowPolymorphismExerciseApplication.java
java -cp out-25-polymorphism-exercise teamflow.TeamFlowPolymorphismExerciseApplication
```

预期输出：

```text
普通任务 #5101：整理迭代看板
紧急任务 #5102：修复登录阻塞
负责人：阿宁
```

### 2. Java 8 参考实现

Java 8 保留完整程序，只替换安全类型访问部分：

```java
package teamflow;

/** 声明任务摘要输出合同。 */
interface TaskSummary {
    /**
     * 输出任务摘要。
     *
     * @param taskId 任务编号
     * @param title 任务标题
     */
    void print(int taskId, String title);
}

/** 声明可输出负责人的附加合同。 */
interface OwnerAwareSummary {
    /**
     * 输出任务负责人。
     *
     * @param owner 负责人
     */
    void printOwner(String owner);
}

/** 输出普通任务摘要。 */
final class NormalTaskSummary implements TaskSummary {
    /**
     * 输出普通任务。
     *
     * @param taskId 任务编号
     * @param title 任务标题
     */
    @Override
    public void print(int taskId, String title) {
        System.out.println("普通任务 #" + taskId + "：" + title);
    }
}

/** 输出紧急任务摘要和负责人。 */
final class UrgentTaskSummary implements TaskSummary, OwnerAwareSummary {
    /**
     * 输出紧急任务。
     *
     * @param taskId 任务编号
     * @param title 任务标题
     */
    @Override
    public void print(int taskId, String title) {
        System.out.println("紧急任务 #" + taskId + "：" + title);
    }

    /**
     * 输出紧急任务负责人。
     *
     * @param owner 负责人
     */
    @Override
    public void printOwner(String owner) {
        System.out.println("负责人：" + owner);
    }
}

/** 运行 TeamFlow 多态练习。 */
public class TeamFlowPolymorphismExerciseApplication {
    /**
     * 输出两项任务，并为支持负责人合同的对象补充负责人。
     *
     * @param args 命令行参数，本例不读取
     */
    public static void main(String[] args) {
        TaskSummary[] summaries = {
            new NormalTaskSummary(),
            new UrgentTaskSummary()
        };
        int[] taskIds = {5101, 5102};
        String[] titles = {"整理迭代看板", "修复登录阻塞"};

        for (int index = 0; index < summaries.length; index++) {
            TaskSummary summary = summaries[index];
            summary.print(taskIds[index], titles[index]);

            if (summary instanceof OwnerAwareSummary) {
                OwnerAwareSummary ownerAwareSummary = (OwnerAwareSummary) summary;
                ownerAwareSummary.printOwner("阿宁");
            }
        }
    }
}
```

将 Project SDK、模块 SDK、Language level 8 和运行配置 JRE 都设为 JDK 8，然后运行入口。命令行步骤为：

```bash
mkdir -p out-8-polymorphism-exercise
javac -encoding UTF-8 -d out-8-polymorphism-exercise src/teamflow/TeamFlowPolymorphismExerciseApplication.java
java -cp out-8-polymorphism-exercise teamflow.TeamFlowPolymorphismExerciseApplication
```

预期输出仍是：

```text
普通任务 #5101：整理迭代看板
紧急任务 #5102：修复登录阻塞
负责人：阿宁
```

两个数组元素先以 `TaskSummary` 合同执行同一个 `print(...)` 调用，并按实际对象输出不同前缀。只有紧急
摘要完成 `OwnerAwareSummary` 合同，因此类型检查只在第二次循环成立；两版代码采用不同语法，得到的安全
边界和可观察结果完全一致。
