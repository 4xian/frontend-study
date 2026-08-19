---
id: backend.java.learn.basics.encapsulation-and-access-control
type: lesson
title: 封装与访问控制
summary: 把 TeamFlow 任务状态收回类内部，用清晰的公开行为守住对象边界
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 110
prerequisites:
  - backend.java.learn.basics.constructors-and-this
objectives:
  - 能说明封装为什么不仅是把字段改成 private，也包括设计可控的 public 行为。
  - 能区分 public、protected、包访问和 private 的可访问范围。
  - 能识别顶层类型与成员可使用的访问级别差异。
  - 能用 private 字段和行为方法阻止调用方直接制造无效状态。
  - 能根据调用方所在的类、包和继承关系选择足够严格的访问级别。
  - 能分别运行 JDK 25 与 Java 8 完整程序，并确认本课写法在两版中一致。
recap:
  - 封装把状态和维护状态的规则放在同一类中，对外只公开调用方真正需要的行为。
  - public 对所有可访问到该类型的代码开放，private 只允许声明它的顶层类及其内部代码访问。
  - 不写访问修饰符表示包访问；同名子包仍是不同包，不能因此访问包级成员。
  - protected 同时允许同包代码和符合规则的跨包子类访问，不等于“只有子类可见”。
  - 顶层类型只能使用 public 或包访问；private 和 protected 可用于成员，不能用于普通顶层类。
  - 本课采用的访问控制语法在 JDK 25 与 Java 8 中一致，两版都使用完整且相同的兼容实现。
related: []
tags:
  - Java
  - 封装
  - 访问控制
  - public
  - private
  - protected
  - 包访问
appliesTo: Java 25；完整兼容示例适用于 Java 8
verifiedAt: 2026-08-17
sources:
  - id: dev-java-more-on-classes-access-control
    title: Dev.java - More on Classes
    url: https://dev.java/learn/classes-objects/more-on-classes/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java；Java SE
    claims:
      - 顶层类型与成员拥有不同的可用访问级别
      - public、protected、包访问与 private 的成员访问矩阵
      - 应选择满足需要的最严格访问级别，并避免公开可变字段
  - id: jls-25-access-control
    title: Java Language Specification 25 - Access Control
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.6
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - public、protected、包访问与 private 成员的可访问规则
      - 访问控制与名称作用域是不同概念
      - 跨包子类访问 protected 成员还受访问形式约束
  - id: jls-25-top-level-types
    title: Java Language Specification 25 - Top Level Type Declarations
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html#jls-7.6
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 顶层类型不写修饰符时具有包访问，public 顶层类型可供其他包访问
      - 普通顶层类型不能声明为 protected 或 private
      - 同名子包不会自动获得父包成员的访问权
  - id: oracle-java-8-access-control
    title: Oracle Java Tutorials - Controlling Access to Members of a Class
    url: https://docs.oracle.com/javase/tutorial/java/javaOO/accesscontrol.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: JDK 8 教程
    claims:
      - Java 8 使用与本课相同的四级成员访问矩阵
      - Java 8 顶层类型只使用 public 或包访问
  - id: jls-8-access-control
    title: Java Language Specification 8 - Access Control
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-6.html#jls-6.6
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 的 public、protected、包访问与 private 规则和本课兼容写法一致
      - Java 8 同样对跨包子类访问 protected 成员施加访问形式约束
  - id: jls-8-top-level-types
    title: Java Language Specification 8 - Top Level Type Declarations
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-7.html#jls-7.6
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 顶层类型不写修饰符时只在本包可访问
      - Java 8 普通顶层类型不能声明为 protected 或 private
      - Java 8 中同名子包仍然是独立包
  - id: stackoverflow-understanding-protected
    title: Understanding Java's protected modifier
    url: https://stackoverflow.com/questions/18573016/understanding-javas-protected-modifier
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 初学者理解 protected 的常见误区
    claims:
      - protected 经常被误解为只允许子类访问，需要同时强调同包访问与跨包子类的限制
---

# 封装与访问控制

上一课让 `TaskCard` 在构造时获得编号、标题和完成状态，但这些字段仍可被类外代码直接改写。调用方既能
把标题改成空字符串，也能绕过任务流程随意切换完成状态。对象虽然创建成功，却没有能力守住自己的规则。

本课把 TeamFlow 任务的状态收回类内部，再只开放“改名”“完成任务”“查看摘要”等明确行为。重点是
`public`、`protected`、无关键字的包访问和 `private` 四种边界，不引入 `static`、`final`、枚举或完整的
继承设计。

## 一、让对象守住自己的状态

### 1. 公开字段会把规则交给每个调用方

下面的类把字段直接暴露为 `public`：

```java
class TaskCard {
    public String title;
    public boolean completed;

    /** 使用标题创建任务卡。 */
    TaskCard(String title) {
        this.title = title;
    }
}
```

任何拿到对象的代码都能写入这些字段：

```java
TaskCard task = new TaskCard("完成接口联调");
task.title = "";
task.completed = true;
task.completed = false;
```

每一行赋值单独看都符合字段类型，所以编译器不会拒绝。然而对象先拥有空标题，又从“已完成”退回
“未完成”。如果 TeamFlow 规定标题不能为空、完成状态不能随意撤销，那么这些规则已经被公开字段绕过。

问题不在于调用方是否“足够小心”，而在于类没有提供统一入口。调用方越多，越难保证所有位置都先做
相同检查、再按相同顺序改字段。

### 2. private 字段只允许类内部直接操作

把字段声明为 `private` 后，类外代码不能再用点号直接读写它们：

```java
class TaskCard {
    private String title;
    private boolean completed;

    /** 使用标题创建任务卡。 */
    TaskCard(String title) {
        this.title = title;
    }

    /** 把任务标记为已完成。 */
    void markCompleted() {
        completed = true;
    }
}
```

`private` 没有让字段消失。构造方法和 `markCompleted()` 位于 `TaskCard` 内部，仍能直接读写这两个字段；
其他类写 `task.completed = false` 时则会编译失败。访问限制在编译阶段生效，错误调用不会进入运行阶段。

这条边界让“谁能改状态”变得明确：类内部负责维护字段，类外只能调用类主动提供的入口。

### 3. 封装还要设计有含义的行为

只把字段改成 `private`，再为每个字段机械生成可读可写的 getter 和 setter，通常仍然把原始赋值能力暴露
给了调用方。若提供 `setCompleted(boolean completed)`，调用方依然可以写：

```java
task.setCompleted(true);
task.setCompleted(false);
```

更清楚的接口是让方法名表达业务动作，并由类决定允许的状态变化：

```java
class TaskCard {
    private boolean completed;

    /**
     * 首次调用时完成任务，重复调用不再改变状态。
     *
     * @return 本次是否真的改变了完成状态
     */
    boolean markCompleted() {
        if (completed) {
            return false;
        }

        completed = true;
        return true;
    }
}
```

第一次调用得到 `true`，对象从未完成变为已完成；第二次调用得到 `false`，状态保持不变。方法的返回值让
调用方观察结果，却没有重新开放字段赋值。

封装因此包含两层：访问控制阻止不该发生的直接访问，行为方法集中实现允许发生的变化。`private` 是工具，
可解释且受控的对象接口才是目标。

## 二、读懂四种成员访问级别

### 1. 从调用位置判断能否访问

字段、方法和构造方法等成员可以使用四种访问级别：

| 声明方式 | 当前类内部 | 同一包中的其他类 | 不同包中的子类 | 其他不同包代码 |
| --- | --- | --- | --- | --- |
| `public` | 可以 | 可以 | 可以 | 可以 |
| `protected` | 可以 | 可以 | 有条件可以 | 不可以 |
| 不写修饰符 | 可以 | 可以 | 不可以 | 不可以 |
| `private` | 可以 | 不可以 | 不可以 | 不可以 |

“不写修饰符”通常称为包访问或 package-private。Java 没有用于声明 package-private 的关键字；把
`public`、`protected`、`private` 都省略，才表示这一访问级别。

判断一行访问是否合法时，先确认成员声明在哪个类，再确认访问代码位于当前类、同包、跨包子类还是
无关外部代码。不能只看对象变量的名称，也不能把“项目里的代码”笼统当成同一范围。

### 2. public 是类对外承诺的入口

`public` 成员允许所有能够访问到这个类的代码使用。TeamFlow 的其他包需要创建任务、完成任务和读取摘要，
这些能力可以公开。公开构造方法表示其他代码可以创建 `TaskCard`；公开的行为方法表示调用方可以
完成任务或读取摘要。字段仍是 `private`，因此类以后可以改变内部保存方式，而调用方继续通过稳定方法使用它。

`public` 不是“正常代码都应该加”的默认选择。它扩大了类需要长期维护的外部合同，只应放在确实要给
调用方使用的入口上。

### 3. private 隐藏实现细节和内部步骤

`private` 成员只能由声明它的类内部直接访问。除了字段，内部辅助方法也适合使用 `private`：
例如，`summary()` 可以在类内部调用 `private String statusMark()` 来生成 `[x]` 或 `[ ]`，而调用方只
看到摘要结果，不需要知道标记如何拼接。把这个辅助方法保持为 `private`，类就能在不扩大外部接口的情况下
调整内部步骤。

### 4. 包访问服务于同一包内的协作

成员不写访问修饰符时，同一包中的其他类可以访问，不同包不能访问。下面两个文件都位于
`teamflow.domain`：

```java
package teamflow.domain;

public class TaskCard {
    private String title;

    /** 使用标题创建任务卡。 */
    public TaskCard(String title) {
        this.title = title;
    }

    /**
     * 生成只供领域包内部使用的审计文本。
     *
     * @return 内部审计文本
     */
    String auditLine() {
        return "TASK:" + title;
    }
}
```

```java
package teamflow.domain;

class TaskAuditFormatter {
    /**
     * 格式化领域包内部的任务审计行。
     *
     * @param task 要格式化的任务
     * @return 审计文本
     */
    String format(TaskCard task) {
        return task.auditLine();
    }
}
```

`TaskAuditFormatter` 与 `TaskCard` 同包，所以能调用 `auditLine()`。若把调用代码移到
`teamflow.console`，编译器会拒绝访问。包访问适合一组紧密协作类的内部合同，但不能替代 `private`：
一个只供当前类使用的成员仍应声明为 `private`。

### 5. protected 是同包访问与继承访问的组合

`protected` 成员首先允许同一包中的代码访问，无论这些代码是否存在继承关系；它还允许不同包中的子类在
语言规则限定的继承上下文中访问。跨包子类不能借此操作任意父类对象上的受保护成员。

**社区补充：** Stack Overflow 的相关问答反复出现“`protected` 是否只对子类开放”的疑问。可靠的判断
方式不是记成从 `private` 到 `public` 的一条简单直线，而是把它看成“同包访问”与“受约束的跨包子类
访问”的组合。具体的跨包继承代码将在继承课程展开，本课不要为了让同包辅助类可见就默认选择
`protected`；只需同包协作时，包访问更准确。

## 三、区分顶层类型与类成员

### 1. 顶层类型只有 public 和包访问

直接声明在源文件中的普通类叫顶层类。它只能声明为 `public`，或不写访问修饰符：

```java
package teamflow.domain;

public class TaskCard {
}

class TaskTitlePolicy {
}
```

其他包可以引用 `public TaskCard`。`TaskTitlePolicy` 没有修饰符，只能被 `teamflow.domain` 包中的代码引用。
顶层类不能写成 `private class TaskTitlePolicy` 或 `protected class TaskTitlePolicy`，两种写法都会编译失败。

字段、方法、构造方法和嵌套类型属于类成员，才可以根据需要使用四种成员访问级别。不能把成员的四级
矩阵原样套到顶层类上。

### 2. public 顶层类与源文件名保持一致

在常见文件系统项目中，`public class TaskCard` 放在 `TaskCard.java`。一份源文件最多声明一个这样的
`public` 顶层类型，其他辅助顶层类可以不写修饰符。

这条规则与成员是否 `private` 无关。`TaskCard.java` 内部可以有多个 `private` 字段和方法，它们仍然属于
`TaskCard`。

跨包使用还需要两道条件同时成立：目标顶层类本身可以访问，目标成员也允许当前调用位置访问。即使
`summary()` 是 `public`，若它所在的顶层类只有包访问，其他包仍然无法先引用这个类。

### 3. 子包不是父包的一部分

`teamflow.domain` 与 `teamflow.domain.audit` 是两个不同的包。名字包含相同前缀，不会让子包自动得到父包
的包访问权限：

```java
package teamflow.domain.audit;

import teamflow.domain.TaskCard;

public class AuditApplication {
    /**
     * 尝试读取任务的包级审计文本。
     *
     * @param task 要审计的任务
     * @return 审计文本
     */
    public String read(TaskCard task) {
        return task.auditLine();
    }
}
```

如果上一节的 `auditLine()` 保持包访问，这段代码会编译失败。正确做法不是凭包名前缀猜测权限，而是
重新判断这个能力是否应该成为 `public` 合同；若不应该，就让访问逻辑留在 `teamflow.domain` 内部。

### 4. 访问控制与作用域不是同一件事

作用域回答“某个简单名称在源代码的哪些位置可直接使用”，访问控制回答“当前位置是否被允许引用这个
声明”。例如导入 `teamflow.domain.TaskCard` 能让简单名称 `TaskCard` 进入当前文件，但导入不会把
`private` 字段或包级方法变成可访问。

因此，遇到访问错误时不要反复添加 `import`。先查看报错指向的是“找不到符号”还是“成员具有 private
访问权限”；前者可能与名称或导入有关，后者必须回到类的访问边界处理。

## 四、为 TeamFlow 设计最小公开接口

### 1. 先列出外部真正需要的动作

一张任务卡需要保存编号、标题和完成状态。控制台调用方真正需要的是：创建任务、尝试改名、完成任务、
读取摘要。它不需要直接写入任何字段，也不需要知道状态标记如何生成。

可以先得到下面的边界：

| 成员 | 访问级别 | 选择原因 |
| --- | --- | --- |
| `taskNumber`、`title`、`completed` | `private` | 状态只能由类内部维护 |
| 构造方法 | `public` | 其他包需要创建任务 |
| `renameTo()`、`markCompleted()`、`summary()` | `public` | 这些是调用方需要的稳定行为 |
| `statusMark()` | `private` | 只服务于类内部摘要拼接 |

这里没有为了“将来可能用到”预留 `protected`，也没有为每个字段生成 setter。每个公开成员都对应一个当前
调用需求。

### 2. 行为方法在写入前检查候选值

改名方法先清理首尾空白，再拒绝空标题：

调用 `renameTo("   ")` 得到 `false`，字段保持原值；调用 `renameTo(" 完成 API 联调 ")` 得到 `true`，字段
保存清理后的“完成 API 联调”。检查和写入位于同一个方法，所有调用方都经过同一条规则。

本课暂不引入异常体系。用 `boolean` 返回值已经足以观察成功与失败，重点仍是访问边界。

### 3. 只公开结果，不公开内部拼接步骤

公开 `summary()` 可以读取对象状态，内部 `statusMark()` 则保持 `private`。类外代码看到的是稳定摘要，不依赖
`completed` 的保存方式或标记拼接过程。以后内部实现变化时，只要
公开方法的合同不变，调用方就不必跟着改动。

## 五、在两个 JDK 中核对访问边界

### 1. 本课语法没有版本分叉

JDK 25 与 Java 8 都使用同一组 `public`、`protected`、包访问和 `private` 规则。本课没有适合只在现代
版本中出现的简写，也不需要为 Java 8 替换访问修饰符。

因此，两版完整程序会分别给出全部源码，但内容保持一致。这种重复是有意的：学习者可以把完整文件放进
各自项目运行，而不是根据“同上”猜测哪些部分兼容。

### 2. IDEA 项目 JDK 决定实际检查版本

在 JDK 25 项目中，打开 **Project Structure**，确认 Project SDK 和模块 SDK 都是 JDK 25；运行配置使用
同一 JDK。兼容项目则把这三处设为 JDK 8。

访问控制错误通常在编辑器和编译阶段出现。如果终端与 IDEA 使用不同 JDK，本课的四级规则仍然相同，
但验证记录会混乱。分别检查终端的 `java -version`、`javac -version` 与 IDEA 的 Project SDK，确认你
正在验证声称的版本。

### 3. 用失败编译确认边界真的存在

验证封装不能只运行正确程序。可临时在不同包的启动类中加入：

```java
task.completed = false;
```

两个 JDK 都应报告 `completed` 具有 `private` 访问权限。确认后删除这行，再运行正确程序。这个最小失败
只证明访问边界生效，不展开错误分类和完整诊断流程。

## 六、集中处理常见错误

:::pitfalls
### 在类外直接访问 private 字段

**触发条件：** `TaskCard` 把 `completed` 声明为 `private`，另一个类仍写 `task.completed = true`。

**原因：** `private` 只允许声明该字段的类内部直接访问，持有对象引用不会扩大权限。

**后果：** JDK 25 与 Java 8 都在编译阶段拒绝代码，程序无法启动。

**错误示例：**

```java
TaskCard task = new TaskCard("完成联调");
task.completed = true;
```

**正确写法：**

```java
TaskCard task = new TaskCard("完成联调");
task.markCompleted();
```

**验证方式：** 编译错误版应看到 private access 相关错误；改为调用公开行为后编译成功，并由
`task.summary()` 观察到 `[x]`。

### 把 default 当成包访问修饰符

**触发条件：** 想声明包级字段或方法时写下 `default String auditLine()`。

**原因：** 包访问的语法是省略访问修饰符，不存在名为 `default` 的访问修饰符写法。

**后果：** 该成员声明不符合类成员语法，两个 JDK 都编译失败。

**错误示例：**

```java
default String auditLine() {
    return "TASK";
}
```

**正确写法：**

```java
/**
 * 返回包内审计文本。
 *
 * @return 审计文本
 */
String auditLine() {
    return "TASK";
}
```

**验证方式：** 删除 `default` 后重新编译；同包类可以调用该方法，不同包类调用时仍应编译失败。

### 认为子包自动拥有父包权限

**触发条件：** `teamflow.domain.audit` 中的代码调用 `teamflow.domain.TaskCard` 的包级方法。

**原因：** 两个包名虽然有公共前缀，但仍是不同包；包访问不会沿名称层级传播。

**后果：** 子包代码无法访问包级成员，编译器报告该成员不能从包外访问。

**错误示例：**

```java
package teamflow.domain.audit;

task.auditLine();
```

**正确写法：**

```java
package teamflow.domain;

task.auditLine();
```

**验证方式：** 分别把调用类放入两个包中编译；只有与 `TaskCard` 完全同包的版本应通过。

### 给顶层类使用 private 或 protected

**触发条件：** 直接在源文件顶层声明 `private class TaskPolicy` 或 `protected class TaskPolicy`。

**原因：** 普通顶层类型只允许 `public` 或包访问，四种成员访问级别不全部适用于顶层声明。

**后果：** 源文件编译失败，类无法被任何代码使用。

**错误示例：**

```java
private class TaskPolicy {
}
```

**正确写法：**

```java
class TaskPolicy {
}
```

**验证方式：** 对错误文件运行 `javac` 应得到非零退出码；删除 `private` 后同包代码可引用该类。

### 把 protected 理解成任意外部代码都能访问

**触发条件：** 不同包中的无关类通过对象引用调用 `protected` 方法。

**原因：** `protected` 允许同包访问，并为跨包子类提供受约束的访问；它不是较弱的 `public`。

**后果：** 无关的包外调用在编译阶段失败；随意把成员升级为 `public` 又会扩大外部合同。

**错误示例：**

```java
package teamflow.console;

TaskCard task = new TaskCard("完成联调");
task.internalStatus();
```

**正确写法：**

```java
package teamflow.console;

TaskCard task = new TaskCard("完成联调");
task.summary();
```

**验证方式：** 让 `internalStatus()` 保持 `protected`，包外无关类调用应失败；调用明确公开的
`summary()` 应成功。

### 用万能 setter 重新暴露内部状态

**触发条件：** 字段虽然是 `private`，类却提供 `setCompleted(boolean completed)` 允许任意值写入。

**原因：** 访问控制挡住了直接字段赋值，但公开方法又把相同能力原样交还给调用方。

**后果：** 程序能够编译，却仍可从已完成退回未完成，类没有集中维护状态规则。

**错误示例：**

```java
/** 设置完成状态。 */
public void setCompleted(boolean completed) {
    this.completed = completed;
}
```

**正确写法：**

```java
/**
 * 首次调用时完成任务。
 *
 * @return 本次是否改变了状态
 */
public boolean markCompleted() {
    if (completed) {
        return false;
    }

    completed = true;
    return true;
}
```

**验证方式：** 连续调用正确方法两次，应依次返回 `true`、`false`，摘要始终保持已完成状态。
:::

## 七、运行 JDK 25 完整程序

### 1. 在 IDEA 中建立两个包

1. 在普通 Java 项目中把 Project SDK、模块 SDK 和运行配置 JRE 设为 JDK 25。
2. 在 `src` 下创建包 `teamflow.domain`，再创建 `TaskCard.java`。
3. 创建包 `teamflow.app`，再创建 `TeamFlowEncapsulationApplication.java`。
4. 分别填写下面两份完整代码，从启动类的 `main` 左侧运行。

两个包刻意分开：领域类公开必要行为，启动类只能通过这些 `public` 入口使用任务对象。

### 2. 领域类完整代码

```java
package teamflow.domain;

public class TaskCard {
    private int taskNumber;
    private String title;
    private boolean completed;

    /**
     * 使用编号和标题创建未完成任务，空白标题会使用“未命名任务”。
     *
     * @param taskNumber 任务编号
     * @param rawTitle 可能包含首尾空白的任务标题
     */
    public TaskCard(int taskNumber, String rawTitle) {
        this.taskNumber = taskNumber;
        String normalizedTitle = rawTitle.trim();
        if (normalizedTitle.isEmpty()) {
            this.title = "未命名任务";
        } else {
            this.title = normalizedTitle;
        }
    }

    /**
     * 尝试修改任务标题。
     *
     * @param rawTitle 可能包含首尾空白的新标题
     * @return 标题有效且完成修改时返回 true
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
     * 首次调用时完成任务。
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
     * 返回任务摘要。
     *
     * @return 包含编号、状态和标题的摘要
     */
    public String summary() {
        return "#" + taskNumber + " " + statusMark() + " " + title;
    }

    /**
     * 返回内部状态标记。
     *
     * @return 已完成时返回 [x]，否则返回 [ ]
     */
    private String statusMark() {
        return completed ? "[x]" : "[ ]";
    }
}
```

### 3. 启动类完整代码

```java
package teamflow.app;

import teamflow.domain.TaskCard;

public class TeamFlowEncapsulationApplication {
    /**
     * 通过公开行为修改任务，并输出每次操作结果。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        TaskCard task = new TaskCard(1, " 完成登录页联调 ");

        System.out.println("TeamFlow 封装边界");
        System.out.println(task.summary());
        System.out.println("空标题改名：" + task.renameTo("   "));
        System.out.println("有效改名：" + task.renameTo(" 完成 API 联调 "));
        System.out.println("首次完成：" + task.markCompleted());
        System.out.println("重复完成：" + task.markCompleted());
        System.out.println(task.summary());
    }
}
```

### 4. 预期输出与执行过程

```text
TeamFlow 封装边界
#1 [ ] 完成登录页联调
空标题改名：false
有效改名：true
首次完成：true
重复完成：false
#1 [x] 完成 API 联调
```

构造方法先清理原始标题的首尾空白；若清理后为空，就保存“未命名任务”，因此对象不会以空标题开始。
空标题候选被 `renameTo()` 拒绝，所以旧标题没有丢失；有效候选通过检查后才写入字段。
`markCompleted()` 第一次改变状态，第二次发现任务已经完成，只返回 `false`。启动类始终没有直接接触
三个 `private` 字段。

### 5. 用终端复核

在 `src` 目录执行：

```bash
javac -d out teamflow/domain/TaskCard.java teamflow/app/TeamFlowEncapsulationApplication.java
java -cp out teamflow.app.TeamFlowEncapsulationApplication
```

先确认 `javac -version` 和 `java -version` 都是 25 系列。`-d out` 让编译结果按包结构进入临时输出目录，
启动时使用完整类名。这里沿用已经学过的编译、运行和包知识，不展开新的构建机制。

## 八、运行 Java 8 完整程序

### 1. 准备独立兼容项目

1. 在独立普通 Java 项目中把 Project SDK、模块 SDK 和运行配置 JRE 都设为 JDK 8。
2. 创建 `teamflow.domain` 与 `teamflow.app` 两个包。
3. 分别创建 `TaskCard.java` 和 `TeamFlowEncapsulationApplication.java`。
4. 填写下面完整代码，从 Java 8 启动类的 `main` 左侧运行。

### 2. Java 8 领域类完整代码

```java
package teamflow.domain;

public class TaskCard {
    private int taskNumber;
    private String title;
    private boolean completed;

    /**
     * 使用编号和标题创建未完成任务，空白标题会使用“未命名任务”。
     *
     * @param taskNumber 任务编号
     * @param rawTitle 可能包含首尾空白的任务标题
     */
    public TaskCard(int taskNumber, String rawTitle) {
        this.taskNumber = taskNumber;
        String normalizedTitle = rawTitle.trim();
        if (normalizedTitle.isEmpty()) {
            this.title = "未命名任务";
        } else {
            this.title = normalizedTitle;
        }
    }

    /**
     * 尝试修改任务标题。
     *
     * @param rawTitle 可能包含首尾空白的新标题
     * @return 标题有效且完成修改时返回 true
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
     * 首次调用时完成任务。
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
     * 返回任务摘要。
     *
     * @return 包含编号、状态和标题的摘要
     */
    public String summary() {
        return "#" + taskNumber + " " + statusMark() + " " + title;
    }

    /**
     * 返回内部状态标记。
     *
     * @return 已完成时返回 [x]，否则返回 [ ]
     */
    private String statusMark() {
        return completed ? "[x]" : "[ ]";
    }
}
```

### 3. Java 8 启动类完整代码

```java
package teamflow.app;

import teamflow.domain.TaskCard;

public class TeamFlowEncapsulationApplication {
    /**
     * 通过公开行为修改任务，并输出每次操作结果。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        TaskCard task = new TaskCard(1, " 完成登录页联调 ");

        System.out.println("TeamFlow 封装边界");
        System.out.println(task.summary());
        System.out.println("空标题改名：" + task.renameTo("   "));
        System.out.println("有效改名：" + task.renameTo(" 完成 API 联调 "));
        System.out.println("首次完成：" + task.markCompleted());
        System.out.println("重复完成：" + task.markCompleted());
        System.out.println(task.summary());
    }
}
```

### 4. Java 8 输出与差异结论

Java 8 控制台应完整输出：

```text
TeamFlow 封装边界
#1 [ ] 完成登录页联调
空标题改名：false
有效改名：true
首次完成：true
重复完成：false
#1 [x] 完成 API 联调
```

本课使用的构造方法、普通方法、`trim()`、`isEmpty()` 与四种访问级别都受 Java 8 支持，所以两版源码
没有差异。若使用终端，在 `src` 目录执行与现代版相同的两条命令，并先确认版本输出为 1.8 系列。

## 九、练习与参考实现

:::exercise
### 练习：封装 TeamFlow 成员在线状态

**要求：** 创建 `TeamMember`，用 `private` 字段保存成员编号、姓名和在线状态；公开构造方法、
`renameTo()`、`goOnline()`、`goOffline()` 与 `summary()`。空白姓名改名必须失败，重复上线或下线必须返回
`false`。不得公开字段，不得提供 `setOnline(boolean)`，不得使用 `static` 字段、`final`、枚举或继承。

**验收：** JDK 25 与 Java 8 都依次输出 `#7 [离线] 小林`、`空白改名：false`、`上线：true`、
`重复上线：false`、`#7 [在线] 林川`、`下线：true`、`#7 [离线] 林川`；两版都提供完整可运行代码。

**参考答案：** directive 后分别给出 JDK 25 与 Java 8 的完整实现。
:::

### 1. JDK 25 参考实现

```java
class TeamMember {
    private int memberNumber;
    private String name;
    private boolean online;

    /**
     * 创建离线成员，空白姓名会使用“未命名成员”。
     *
     * @param memberNumber 成员编号
     * @param rawName 可能包含首尾空白的成员姓名
     */
    TeamMember(int memberNumber, String rawName) {
        this.memberNumber = memberNumber;
        String normalizedName = rawName.trim();
        if (normalizedName.isEmpty()) {
            this.name = "未命名成员";
        } else {
            this.name = normalizedName;
        }
    }

    /**
     * 尝试修改成员姓名。
     *
     * @param rawName 可能包含首尾空白的新姓名
     * @return 姓名有效且完成修改时返回 true
     */
    boolean renameTo(String rawName) {
        String candidate = rawName.trim();
        if (candidate.isEmpty()) {
            return false;
        }

        name = candidate;
        return true;
    }

    /**
     * 让离线成员上线。
     *
     * @return 本次是否改变了在线状态
     */
    boolean goOnline() {
        if (online) {
            return false;
        }

        online = true;
        return true;
    }

    /**
     * 让在线成员下线。
     *
     * @return 本次是否改变了在线状态
     */
    boolean goOffline() {
        if (!online) {
            return false;
        }

        online = false;
        return true;
    }

    /**
     * 返回成员摘要。
     *
     * @return 包含编号、在线状态和姓名的摘要
     */
    String summary() {
        String status = online ? "在线" : "离线";
        return "#" + memberNumber + " [" + status + "] " + name;
    }
}

public class TeamFlowEncapsulationPractice {
    /**
     * 通过行为方法维护成员姓名与在线状态。
     *
     * @param args 启动参数，本练习不使用
     */
    public static void main(String[] args) {
        TeamMember member = new TeamMember(7, " 小林 ");

        System.out.println(member.summary());
        System.out.println("空白改名：" + member.renameTo("   "));
        System.out.println("上线：" + member.goOnline());
        System.out.println("重复上线：" + member.goOnline());
        member.renameTo(" 林川 ");
        System.out.println(member.summary());
        System.out.println("下线：" + member.goOffline());
        System.out.println(member.summary());
    }
}
```

### 2. Java 8 参考实现

```java
class TeamMember {
    private int memberNumber;
    private String name;
    private boolean online;

    /**
     * 创建离线成员，空白姓名会使用“未命名成员”。
     *
     * @param memberNumber 成员编号
     * @param rawName 可能包含首尾空白的成员姓名
     */
    TeamMember(int memberNumber, String rawName) {
        this.memberNumber = memberNumber;
        String normalizedName = rawName.trim();
        if (normalizedName.isEmpty()) {
            this.name = "未命名成员";
        } else {
            this.name = normalizedName;
        }
    }

    /**
     * 尝试修改成员姓名。
     *
     * @param rawName 可能包含首尾空白的新姓名
     * @return 姓名有效且完成修改时返回 true
     */
    boolean renameTo(String rawName) {
        String candidate = rawName.trim();
        if (candidate.isEmpty()) {
            return false;
        }

        name = candidate;
        return true;
    }

    /**
     * 让离线成员上线。
     *
     * @return 本次是否改变了在线状态
     */
    boolean goOnline() {
        if (online) {
            return false;
        }

        online = true;
        return true;
    }

    /**
     * 让在线成员下线。
     *
     * @return 本次是否改变了在线状态
     */
    boolean goOffline() {
        if (!online) {
            return false;
        }

        online = false;
        return true;
    }

    /**
     * 返回成员摘要。
     *
     * @return 包含编号、在线状态和姓名的摘要
     */
    String summary() {
        String status = online ? "在线" : "离线";
        return "#" + memberNumber + " [" + status + "] " + name;
    }
}

public class TeamFlowEncapsulationPractice {
    /**
     * 通过行为方法维护成员姓名与在线状态。
     *
     * @param args 启动参数，本练习不使用
     */
    public static void main(String[] args) {
        TeamMember member = new TeamMember(7, " 小林 ");

        System.out.println(member.summary());
        System.out.println("空白改名：" + member.renameTo("   "));
        System.out.println("上线：" + member.goOnline());
        System.out.println("重复上线：" + member.goOnline());
        member.renameTo(" 林川 ");
        System.out.println(member.summary());
        System.out.println("下线：" + member.goOffline());
        System.out.println(member.summary());
    }
}
```

### 3. 运行步骤与验收结果

在两个独立 IDEA 项目中分别选择 JDK 25 和 JDK 8，创建 `TeamFlowEncapsulationPractice.java`，填写对应
版本后从 `main` 左侧运行。两个控制台都应显示：

```text
#7 [离线] 小林
空白改名：false
上线：true
重复上线：false
#7 [在线] 林川
下线：true
#7 [离线] 林川
```

空白候选没有覆盖原姓名；第一次上线改变状态，第二次上线被拒绝；有效改名在对象内部完成；下线后摘要
回到“离线”。所有状态只能经 `TeamMember` 自己的方法改变，调用方没有直接字段写入能力。

## 十、本节小结

- 封装把字段和维护字段的规则放在类内部，对外提供有明确含义的行为，而不是公开任意赋值入口。
- `public` 面向所有合法调用方，`private` 面向当前类内部，包访问面向完全相同的包。
- `protected` 同时包含同包访问和受约束的跨包子类访问，不应被当成默认公开级别。
- 顶层类型只能是 `public` 或包访问；同名子包仍然是不同包。
- JDK 25 与 Java 8 对本课语法没有真实差异，两版完整程序通过相同公开接口守住 TeamFlow 状态。
