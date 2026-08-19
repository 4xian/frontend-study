---
id: backend.java.learn.basics.enums-and-finite-values
type: lesson
title: 枚举
summary: 用枚举限定 TeamFlow 任务状态，并为每个状态提供固定编码、说明和处理行为
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 95
prerequisites:
  - backend.java.learn.basics.static-and-final
objectives:
  - 能判断一个概念是否适合建模为封闭的枚举常量集合。
  - 能声明枚举并解释枚举常量、枚举类型和普通字符串的区别。
  - 能为枚举添加 final 字段、构造器和行为方法。
  - 能正确使用 values、valueOf、name 和 ordinal，并说明各自边界。
  - 能使用独立稳定编码解析外部值，不把 ordinal 当作业务编号。
  - 能分别用 JDK 25 switch 表达式和 Java 8 switch 语句处理枚举。
recap:
  - 枚举适合在代码版本内已经封闭且数量有限的值集合，每个常量都是该枚举类型的唯一实例。
  - 常量列表后还要声明字段或方法时必须写分号，枚举构造器不能声明为 public 或 protected。
  - values 按声明顺序返回全部常量，valueOf 只接受与常量名完全一致的文本。
  - name 是源码常量名，ordinal 是从零开始的声明位置；外部合同应使用独立、稳定的 code。
  - 枚举常量可拥有固定数据和行为，但不应保存任务、请求或用户级的可变状态。
  - JDK 25 可以用 switch 表达式直接产生结果，Java 8 使用传统 switch 语句完成相同分支。
related: []
tags:
  - Java
  - 枚举
  - enum
  - 任务状态
  - switch
appliesTo: JDK 25 主线；Java 8 的 switch 差异在对应章节说明
verifiedAt: 2026-08-17
sources:
  - id: dev-java-enums
    title: Dev.java - Enums
    url: https://dev.java/learn/classes-objects/enums/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: 当前 Dev.java；Java SE
    claims:
      - 枚举常量是枚举类型预先声明的实例，不能在常量列表之外创建新实例
      - 枚举可使用等号比较、switch、字段、构造器和方法
      - 枚举隐式提供 values、valueOf、name 和 ordinal
  - id: jls-25-enum-classes
    title: Java Language Specification 25 - Enum Classes
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.9
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 枚举常量、枚举构造器、隐式成员和实例数量限制的语言规则
      - 枚举构造器不能声明为 public 或 protected
      - values 按声明顺序返回常量，valueOf 要求文本与常量名完全一致
  - id: java-25-enum-api
    title: Enum - Java SE 25
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Enum.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - name、ordinal、toString 和 valueOf 的 API 合同
      - ordinal 表示声明位置，主要供基于枚举的数据结构使用
  - id: jls-25-switch-expressions
    title: Java Language Specification 25 - switch Expressions
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.28
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - switch 表达式产生一个结果，并必须覆盖选择器的所有可能值
  - id: jls-8-enum-types
    title: Java Language Specification 8 - Enum Types
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html#jls-8.9
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 的枚举常量、构造器、values 和 valueOf 核心规则与本课主线一致
  - id: jls-8-switch-statement
    title: Java Language Specification 8 - The switch Statement
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html#jls-14.11
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 使用传统 switch 语句处理枚举，冒号 case 需要明确控制分支结束
      - 传统枚举 switch 不会强制要求列出每个常量
---

# 枚举

TeamFlow 的任务状态不能是任意文字。`"进行中"`、`"处理中"` 和误写的 `"进行种"` 对人来说可能
相近，对程序却是三个不同字符串。如果每个位置都自行约定文字，编译器无法阻止不存在的状态进入业务
代码，分支也会越来越难核对。

枚举适合表达这种“可能值已经列完”的概念。本课只围绕普通枚举完成任务状态建模：先限定常量集合，再
为常量添加固定数据和行为，最后在 JDK 25 与 Java 8 中分别运行完整程序。接口、多态、枚举集合以及
JSON、数据库映射留给后续课程。

## 一、把封闭状态写成一种类型

### 1. 用 enum 列出全部合法值

先从只有三个状态的任务流程开始：待开始、进行中、已完成。`enum` 后面是类型名，类型体内用逗号分隔
常量：

```java
public class TaskStateDemo {
    enum TaskState {
        BACKLOG,
        IN_PROGRESS,
        DONE
    }

    /**
     * 创建一个任务状态并输出它。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        TaskState state = TaskState.IN_PROGRESS;
        System.out.println(state);
    }
}
```

运行后输出：

```text
IN_PROGRESS
```

变量类型是 `TaskState`，所以右侧只能放 `TaskState` 的常量或该类型的引用。`"IN_PROGRESS"` 只是
`String`，不能直接赋给 `TaskState`。常量名通常使用全大写字母与下划线，访问时写成
`类型名.常量名`，归属关系一眼可见。

### 2. 每个常量都是预先创建的实例

`TaskState.IN_PROGRESS` 不是数字 `1`，也不是字符串。它是 `TaskState` 类型预先创建的一个实例；
程序不能用 `new TaskState()` 再制造第四种状态。两个位置引用同一枚举常量时，可以使用 `==` 比较：

```java
TaskState first = TaskState.IN_PROGRESS;
TaskState second = TaskState.valueOf("IN_PROGRESS");

System.out.println(first == second);
```

输出为 `true`。`valueOf` 找回的是已经声明的同一个常量，不会创建副本。枚举常量的实例数量固定，这也是
`==` 能准确表达“是不是同一个常量”的原因；它还不会像调用 `first.equals(second)` 那样在 `first`
为 `null` 时先解引用变量。

### 3. 只有真正封闭的集合才适合枚举

任务状态、优先级、工作日等概念可以在当前代码版本中完整列出，适合枚举。成员会由用户、数据库或配置
持续新增的项目标签、成员姓名和团队列表则是开放数据，不适合每新增一项就修改源码常量。

判断时可以问两个问题：合法值能否在编译时列完；新增值是否意味着程序规则也必须随代码版本更新。
两个答案都为“是”时，枚举通常合适。枚举解决的是有限类型约束，不是把任何短列表都硬编码进源码。

## 二、给每个状态添加固定数据和行为

### 1. 常量列表后用分号进入成员区

只声明常量时，最后一个常量后的分号可以省略；还要添加字段、构造器或方法时，常量列表必须先用分号
结束。下面为每个 TeamFlow 状态保存稳定编码和展示文字：

```java
public enum TaskStatus {
    BACKLOG("todo", "待开始"),
    IN_PROGRESS("doing", "进行中"),
    DONE("done", "已完成");

    private final String code;
    private final String label;

    /**
     * 创建具有固定编码和展示文字的任务状态。
     *
     * @param code 稳定编码
     * @param label 展示文字
     */
    TaskStatus(String code, String label) {
        this.code = code;
        this.label = label;
    }

    /**
     * 返回任务状态的稳定编码。
     *
     * @return 稳定编码
     */
    public String code() {
        return code;
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

每行常量后的参数会传给枚举构造器。构造器由编译器在建立常量时调用，业务代码不能直接调用，因此它
不能声明为 `public` 或 `protected`。这里不写访问修饰符，字段则沿用上一课的 `private final`：每个
常量在创建时得到一组固定数据，之后只能读取。

### 2. 名称、展示文字和外部编码承担不同职责

`IN_PROGRESS` 是源码中的常量名，适合 Java 代码阅读；`"进行中"` 面向用户展示，可能因产品文案
调整；`"doing"` 是独立编码，可以在常量改名或文案调整时保持不变。把三者分开后，不需要拿显示文字
承担程序身份。

```java
TaskStatus status = TaskStatus.IN_PROGRESS;

System.out.println(status.name());
System.out.println(status.code());
System.out.println(status.label());
```

依次输出：

```text
IN_PROGRESS
doing
进行中
```

`name()` 由枚举提供，固定返回声明名。`label()` 和 `code()` 是本课自己定义的方法。即使当前
`toString()` 默认也输出常量名，也不要把它当作外部合同，因为枚举可以重写 `toString()` 改变显示结果。

### 3. 用 fromCode 集中解析稳定编码

外部拿到 `"doing"` 时，不能调用 `TaskStatus.valueOf("doing")`，因为 `valueOf` 只认识精确常量名。
可以在枚举内部集中定义编码解析：

```java
/**
 * 按稳定编码查找任务状态。
 *
 * @param rawCode 待解析编码
 * @return 对应任务状态
 * @throws IllegalArgumentException 编码不存在时抛出
 */
public static TaskStatus fromCode(String rawCode) {
    for (TaskStatus status : values()) {
        if (status.code.equals(rawCode)) {
            return status;
        }
    }
    throw new IllegalArgumentException("未知任务状态编码: " + rawCode);
}
```

`values()` 提供全部常量，循环逐个比较固定编码。命中就返回对应实例；全部检查完仍未命中时立即报告
输入无效，不返回 `null` 把问题推迟到更远的位置。本课只把 `IllegalArgumentException` 当作固定的失败
结果使用，异常体系会在对应课程完整学习。

### 4. 枚举只保存属于常量的固定数据

`code` 和 `label` 对所有 `IN_PROGRESS` 引用都应相同，适合放在枚举常量中。任务标题、负责人、访问
次数等数据属于具体任务或一次操作，不能放进共享的枚举实例。

一个进程中的调用方会共同看到同一个 `TaskStatus.IN_PROGRESS`。若为它添加可修改的 `viewCount`，
任何任务递增后，其他任务读取到的也会变化。需要独立生命周期的状态应继续由普通对象保存，枚举只描述
“是哪一种状态”以及这一种状态的固定规则。

## 三、读懂枚举自带的标准方法

### 1. values 按声明顺序返回全部常量

每个枚举都隐式拥有 `values()`。它返回一个数组，元素顺序就是源码中的常量声明顺序：

```java
for (TaskStatus status : TaskStatus.values()) {
    System.out.println(status.code() + " -> " + status.label());
}
```

输出为：

```text
todo -> 待开始
doing -> 进行中
done -> 已完成
```

每次调用得到的数组可由调用方修改，但修改数组元素不会删除或替换枚举真实常量。程序可以依赖“返回
全部常量”和“按声明顺序排列”，不应依赖两次调用得到同一个数组对象。

### 2. valueOf 只匹配精确常量名

`TaskStatus.valueOf("DONE")` 返回 `TaskStatus.DONE`。下面三种输入都不满足合同：

```java
TaskStatus.valueOf("done");
TaskStatus.valueOf(" DONE ");
TaskStatus.valueOf("doing");
```

它们分别是小写名称、带额外空白的名称和业务编码，都会得到 `IllegalArgumentException`。不要在不明确
输入合同的情况下随意 `trim()` 或改大小写，那会把本应拒绝的数据悄悄解释成另一种格式。常量名用
`valueOf`，稳定编码用 `fromCode`，边界清楚后调用方才能预测结果。

### 3. ordinal 是位置，不是稳定编号

`ordinal()` 从 `0` 开始返回声明位置：

```java
System.out.println(TaskStatus.BACKLOG.ordinal());
System.out.println(TaskStatus.IN_PROGRESS.ordinal());
System.out.println(TaskStatus.DONE.ordinal());
```

当前输出 `0`、`1`、`2`。如果以后在 `BACKLOG` 后插入 `READY`，`IN_PROGRESS` 就从 `1` 变成
`2`。这个数字适合描述当前声明顺序，也由基于枚举的标准数据结构在内部使用，但不适合数据库、文件、
消息或接口中的长期业务编号。外部位置使用显式 `code`，顺序调整时其含义才不会漂移。

## 四、在分支中使用枚举

### 1. JDK 25 用 switch 表达式直接产生结果

控制流课程已经使用过分支。枚举让每个 `case` 直接对应一个合法状态，JDK 25 还可以让 switch 表达式
返回下一步动作：

```java
/**
 * 返回当前状态对应的下一步动作。
 *
 * @return 下一步动作
 */
public String nextAction() {
    return switch (this) {
        case BACKLOG -> "安排负责人";
        case IN_PROGRESS -> "继续处理";
        case DONE -> "归档任务";
    };
}
```

箭头右侧是每个分支的结果，不需要 `break`，也不会贯穿到下一分支。这里没有 `default`，三个常量已经
完整列出；在同一次编译中新增常量却没有补分支时，编译器会指出 switch 表达式不完整。这能把遗漏从
运行时提前到编译时。

### 2. Java 8 使用传统 switch 语句

Java 8 支持以枚举为选择值，但不支持上面的 switch 表达式和箭头规则。对应方法要写成传统语句：

```java
/**
 * 返回当前状态对应的下一步动作。
 *
 * @return 下一步动作
 */
public String nextAction() {
    switch (this) {
        case BACKLOG:
            return "安排负责人";
        case IN_PROGRESS:
            return "继续处理";
        case DONE:
            return "归档任务";
        default:
            throw new IllegalStateException("未处理任务状态: " + name());
    }
}
```

每个分支直接 `return`，所以不会继续执行后面的 `case`。若分支只做输出而不返回，就要用 `break` 明确
结束。Java 8 的传统枚举 switch 不会强制列出每个常量，这里的 `default` 让遗漏的新状态成为清晰失败，
而不是返回一个看似正常的空结果。

### 3. null 不是枚举常量

`BACKLOG`、`IN_PROGRESS` 和 `DONE` 才是本课定义的合法常量，`null` 不属于枚举集合。对 `null`
执行 `switch` 或调用 `name()`、`code()` 都会失败。

不要为了避免失败就给未知输入随意指定默认状态。应在输入边界决定：值是必填就明确拒绝，业务确实允许
“未指定”时再用单独规则表达。是否允许缺失是业务合同，不是枚举自动提供的第四个值。

## 五、在两个 JDK 中建立正确运行配置

### 1. 核心枚举规则在两个版本中一致

本课的常量声明、字段、构造器、普通方法、`values()`、`valueOf()`、`name()`、`ordinal()` 和 `==`
比较在 JDK 25 与 Java 8 中都可用。真实差异集中在分支写法：JDK 25 主程序使用 switch 表达式，Java 8
完整程序改用传统 switch 语句，不写“同上”代替代码。

### 2. IDEA 中分别核对项目 JDK

JDK 25 项目在 **File | Project Structure | Project** 中选择 JDK 25，并在 **Modules** 与运行配置的
JRE 中核对同一版本。Java 8 兼容项目则分别选择已安装的 JDK 8；不要只修改终端 `PATH`，也不要只切换
Project SDK 后忽略模块 SDK 和运行配置。

两个版本使用独立项目或独立源码副本。IDEA 运行窗口先核对启动类，再观察控制台第一行是否是本课预期
输出；若终端和 IDEA 结果不同，分别检查 `java -version`、`javac -version` 与 IDEA 三处 JDK 设置。

### 3. 终端编译到独立输出目录

下面的完整程序都放在 `src/teamflow` 包目录中。JDK 25 项目从项目根目录运行：

```bash
mkdir -p out-25-enum
javac -encoding UTF-8 -d out-25-enum src/teamflow/TaskStatus.java src/teamflow/TeamFlowEnumApplication.java
java -cp out-25-enum teamflow.TeamFlowEnumApplication
```

Java 8 项目使用自己的源码副本和输出目录：

```bash
mkdir -p out-8-enum
javac -encoding UTF-8 -d out-8-enum src/teamflow/TaskStatus.java src/teamflow/TeamFlowEnumApplication.java
java -cp out-8-enum teamflow.TeamFlowEnumApplication
```

独立目录避免不同版本的 `.class` 文件互相覆盖。`javac` 读取两个源码并按包名写入 class，`java` 再从
对应输出目录查找完整类名；本课只要求观察程序结果，不展开 class 文件和类加载机制。

## 六、运行完整 TeamFlow 枚举程序

### 1. JDK 25 完整程序

在 JDK 25 项目的 `src/teamflow/TaskStatus.java` 中写入：

```java
package teamflow;

public enum TaskStatus {
    BACKLOG("todo", "待开始"),
    IN_PROGRESS("doing", "进行中"),
    DONE("done", "已完成");

    private final String code;
    private final String label;

    /**
     * 创建具有固定编码和展示文字的任务状态。
     *
     * @param code 稳定编码
     * @param label 展示文字
     */
    TaskStatus(String code, String label) {
        this.code = code;
        this.label = label;
    }

    /**
     * 返回任务状态的稳定编码。
     *
     * @return 稳定编码
     */
    public String code() {
        return code;
    }

    /**
     * 返回任务状态的展示文字。
     *
     * @return 展示文字
     */
    public String label() {
        return label;
    }

    /**
     * 返回当前状态对应的下一步动作。
     *
     * @return 下一步动作
     */
    public String nextAction() {
        return switch (this) {
            case BACKLOG -> "安排负责人";
            case IN_PROGRESS -> "继续处理";
            case DONE -> "归档任务";
        };
    }

    /**
     * 按稳定编码查找任务状态。
     *
     * @param rawCode 待解析编码
     * @return 对应任务状态
     * @throws IllegalArgumentException 编码不存在时抛出
     */
    public static TaskStatus fromCode(String rawCode) {
        for (TaskStatus status : values()) {
            if (status.code.equals(rawCode)) {
                return status;
            }
        }
        throw new IllegalArgumentException("未知任务状态编码: " + rawCode);
    }
}
```

在 `src/teamflow/TeamFlowEnumApplication.java` 中写入：

```java
package teamflow;

public class TeamFlowEnumApplication {
    /**
     * 输出全部任务状态，并按稳定编码解析一个状态。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        System.out.println("可用状态：" + TaskStatus.values().length);

        for (TaskStatus status : TaskStatus.values()) {
            System.out.println(
                    status.code() + " -> " + status.label() + " -> " + status.nextAction());
        }

        TaskStatus parsed = TaskStatus.fromCode("doing");
        System.out.println("解析结果：" + parsed.name() + " / " + parsed.label());
    }
}
```

在 IDEA 中用 JDK 25 运行 `TeamFlowEnumApplication.main`，或使用上一节的 `out-25-enum` 命令。

### 2. Java 8 完整程序

Java 8 项目的 `src/teamflow/TaskStatus.java` 使用完整兼容实现：

```java
package teamflow;

public enum TaskStatus {
    BACKLOG("todo", "待开始"),
    IN_PROGRESS("doing", "进行中"),
    DONE("done", "已完成");

    private final String code;
    private final String label;

    /**
     * 创建具有固定编码和展示文字的任务状态。
     *
     * @param code 稳定编码
     * @param label 展示文字
     */
    TaskStatus(String code, String label) {
        this.code = code;
        this.label = label;
    }

    /**
     * 返回任务状态的稳定编码。
     *
     * @return 稳定编码
     */
    public String code() {
        return code;
    }

    /**
     * 返回任务状态的展示文字。
     *
     * @return 展示文字
     */
    public String label() {
        return label;
    }

    /**
     * 返回当前状态对应的下一步动作。
     *
     * @return 下一步动作
     */
    public String nextAction() {
        switch (this) {
            case BACKLOG:
                return "安排负责人";
            case IN_PROGRESS:
                return "继续处理";
            case DONE:
                return "归档任务";
            default:
                throw new IllegalStateException("未处理任务状态: " + name());
        }
    }

    /**
     * 按稳定编码查找任务状态。
     *
     * @param rawCode 待解析编码
     * @return 对应任务状态
     * @throws IllegalArgumentException 编码不存在时抛出
     */
    public static TaskStatus fromCode(String rawCode) {
        for (TaskStatus status : values()) {
            if (status.code.equals(rawCode)) {
                return status;
            }
        }
        throw new IllegalArgumentException("未知任务状态编码: " + rawCode);
    }
}
```

Java 8 项目的 `src/teamflow/TeamFlowEnumApplication.java` 完整内容如下：

```java
package teamflow;

public class TeamFlowEnumApplication {
    /**
     * 输出全部任务状态，并按稳定编码解析一个状态。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        System.out.println("可用状态：" + TaskStatus.values().length);

        for (TaskStatus status : TaskStatus.values()) {
            System.out.println(
                    status.code() + " -> " + status.label() + " -> " + status.nextAction());
        }

        TaskStatus parsed = TaskStatus.fromCode("doing");
        System.out.println("解析结果：" + parsed.name() + " / " + parsed.label());
    }
}
```

在 IDEA 中把 Project SDK、模块 SDK 和运行配置 JRE 都设为 JDK 8，再运行同一个入口；终端则使用
`out-8-enum` 命令。两个版本的预期输出完全相同：

```text
可用状态：3
todo -> 待开始 -> 安排负责人
doing -> 进行中 -> 继续处理
done -> 已完成 -> 归档任务
解析结果：IN_PROGRESS / 进行中
```

第一行来自 `values()` 的数组长度，接下来的三行按常量声明顺序读取固定数据和行为，最后一行证明
`"doing"` 由 `fromCode` 解析成唯一的 `IN_PROGRESS` 实例。版本差异只存在于 `nextAction()` 内部，
对调用方暴露的方法名和结果保持一致。

## 七、集中处理常见错误

### 枚举的典型错误

:::pitfalls
### 用任意字符串保存封闭状态

**现象：** 拼写错误的状态仍能进入变量，直到某个分支没有匹配时才暴露问题。

**触发条件：** 用 `String` 接收本应只有三个合法值的任务状态。

**原因：** 字符串类型只限制值是文本，不能限制文本必须来自 TeamFlow 状态集合。

**后果：** 分支遗漏、统计错误和同义文字并存，编译器无法指出非法状态。

**错误示例：**

```java
String status = "doingg";
System.out.println(status);
```

**正确写法：**

```java
TaskStatus status = TaskStatus.IN_PROGRESS;
System.out.println(status);
```

**影响版本：** JDK 25 与 Java 8 都适用。

**验证方式：** 错误代码会正常输出非法文字；把 `TaskStatus.IN_PROGRESS` 故意改成不存在的常量名后，编译器应立即拒绝。

### 添加成员时漏写常量列表后的分号

**现象：** 编译器在第一个字段附近报告语法错误。

**触发条件：** 常量列表后继续声明字段或方法，却仍以逗号或换行结束列表。

**原因：** 枚举需要用分号明确结束常量区，后面才进入普通成员区。

**后果：** 整个枚举无法编译，字段和方法都不可用。

**错误示例：**

```java
enum TaskStatus {
    BACKLOG,
    DONE

    private final String label = "任务状态";
}
```

**正确写法：**

```java
enum TaskStatus {
    BACKLOG,
    DONE;

    private final String label = "任务状态";
}
```

**影响版本：** JDK 25 与 Java 8 都适用。

**验证方式：** 分别编译两段完整枚举；错误版应非零退出，正确版应通过。

### 把枚举构造器声明为 public

**现象：** 编译器报告枚举构造器不能使用该访问修饰符。

**触发条件：** 误以为调用方需要公开构造器才能访问枚举常量。

**原因：** 常量实例只能由枚举声明建立，枚举构造器禁止声明为 `public` 或 `protected`。

**后果：** 枚举无法编译，也不能因此获得对外 `new` 的能力。

**错误示例：**

```java
enum TaskStatus {
    DONE;

    /** 创建任务状态。 */
    public TaskStatus() {
    }
}
```

**正确写法：**

```java
enum TaskStatus {
    DONE;

    /** 创建任务状态。 */
    TaskStatus() {
    }
}
```

**影响版本：** JDK 25 与 Java 8 都适用。

**验证方式：** 错误版应编译失败；去掉 `public` 后应通过，并且外部仍不能调用 `new TaskStatus()`。

### 用 valueOf 解析小写编码

**现象：** `TaskStatus.valueOf("doing")` 抛出 `IllegalArgumentException`。

**触发条件：** 把稳定业务编码或展示文字当成源码常量名传给 `valueOf`。

**原因：** `valueOf` 只接受与声明标识符完全一致的名称，不做大小写、空白或自定义编码转换。

**后果：** 正常外部编码也会解析失败；随意转换大小写又可能掩盖输入合同错误。

**错误示例：**

```java
TaskStatus status = TaskStatus.valueOf("doing");
System.out.println(status);
```

**正确写法：**

```java
TaskStatus status = TaskStatus.fromCode("doing");
System.out.println(status.name());
```

**影响版本：** JDK 25 与 Java 8 都适用。

**验证方式：** 错误版运行应得到 `IllegalArgumentException`；正确版应输出 `IN_PROGRESS`。

### 把 ordinal 当作长期业务编号

**现象：** 插入或重排常量后，旧数字开始代表另一种任务状态。

**触发条件：** 把 `ordinal()` 写入文件、数据库、消息或接口，并在之后修改常量顺序。

**原因：** ordinal 只表示当前源码声明位置，首个位置为 0，不承诺跨版本稳定。

**后果：** 旧数据可能被静默解释成错误状态，编译器无法从数字发现含义已经变化。

**错误示例：**

```java
int storedStatus = TaskStatus.IN_PROGRESS.ordinal();
System.out.println(storedStatus);
```

**正确写法：**

```java
String storedStatus = TaskStatus.IN_PROGRESS.code();
System.out.println(storedStatus);
```

**影响版本：** JDK 25 与 Java 8 都适用。

**验证方式：** 在临时枚举的第一个常量后插入新常量；观察 `IN_PROGRESS.ordinal()` 改变，而 `code()` 仍输出 `doing`。

### 在枚举常量中保存任务级可变数据

**现象：** 一个任务修改计数后，另一个任务读取同一状态时也看到被修改的数字。

**触发条件：** 给枚举添加可变字段，并把它当作每个任务独立的数据容器。

**原因：** 同名枚举常量在进程内是共享实例，不会为每个任务复制一份字段。

**后果：** 不相关任务互相污染状态，结果依赖调用顺序。

**错误示例：**

```java
enum TaskStatus {
    IN_PROGRESS;

    private int viewCount;

    /** 错误地增加共享常量中的任务访问次数。 */
    public void markViewed() {
        viewCount++;
    }

    /** 返回共享访问次数。 */
    public int viewCount() {
        return viewCount;
    }
}
```

**正确写法：**

```java
class TaskViewCounter {
    private int viewCount;

    /** 增加当前任务自己的访问次数。 */
    public void markViewed() {
        viewCount++;
    }

    /** 返回当前任务自己的访问次数。 */
    public int viewCount() {
        return viewCount;
    }
}
```

**影响版本：** JDK 25 与 Java 8 都适用。

**验证方式：** 用两个变量引用 `TaskStatus.IN_PROGRESS`，通过其中一个修改后另一个会读到相同计数；改为两个 `TaskViewCounter` 对象后计数互不影响。
:::

## 八、练习与完整参考实现

### 1. 任务与验收

:::exercise
### TeamFlow 任务优先级

**要求：** 声明 `TaskPriority` 枚举，包含 `LOW`、`MEDIUM`、`HIGH`，每个常量具有稳定 code 和中文 label；实现 `code()`、`label()`、`fromCode()` 与 `responsePromise()`。JDK 25 使用 switch 表达式计算响应承诺，Java 8 使用传统 switch 语句。再编写入口，按声明顺序输出全部优先级并解析编码 `H`。不得把 `ordinal()` 当作 code，不得在枚举中加入可变任务状态。

**验收：** 两个版本都能在各自 IDEA 项目和独立终端输出目录中编译运行；依次输出三种优先级的 code、label 与响应承诺；`fromCode("H")` 返回 `HIGH`，未知 code 得到明确的 `IllegalArgumentException`；输出与下方结果逐行一致。

**参考答案：** JDK 25 与 Java 8 的完整枚举、入口、配置和运行命令见后续小节。
:::

### 2. JDK 25 完整参考实现

`src/teamflow/TaskPriority.java`：

```java
package teamflow;

public enum TaskPriority {
    LOW("L", "普通"),
    MEDIUM("M", "重要"),
    HIGH("H", "紧急");

    private final String code;
    private final String label;

    /**
     * 创建具有固定编码和展示文字的任务优先级。
     *
     * @param code 稳定编码
     * @param label 展示文字
     */
    TaskPriority(String code, String label) {
        this.code = code;
        this.label = label;
    }

    /**
     * 返回任务优先级的稳定编码。
     *
     * @return 稳定编码
     */
    public String code() {
        return code;
    }

    /**
     * 返回任务优先级的展示文字。
     *
     * @return 展示文字
     */
    public String label() {
        return label;
    }

    /**
     * 返回当前优先级的响应承诺。
     *
     * @return 响应承诺
     */
    public String responsePromise() {
        return switch (this) {
            case LOW -> "24 小时内响应";
            case MEDIUM -> "8 小时内响应";
            case HIGH -> "2 小时内响应";
        };
    }

    /**
     * 按稳定编码查找任务优先级。
     *
     * @param rawCode 待解析编码
     * @return 对应任务优先级
     * @throws IllegalArgumentException 编码不存在时抛出
     */
    public static TaskPriority fromCode(String rawCode) {
        for (TaskPriority priority : values()) {
            if (priority.code.equals(rawCode)) {
                return priority;
            }
        }
        throw new IllegalArgumentException("未知任务优先级编码: " + rawCode);
    }
}
```

`src/teamflow/TeamFlowPriorityApplication.java`：

```java
package teamflow;

public class TeamFlowPriorityApplication {
    /**
     * 输出全部任务优先级，并验证合法与未知编码。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        System.out.println("优先级数量：" + TaskPriority.values().length);

        for (TaskPriority priority : TaskPriority.values()) {
            System.out.println(
                    priority.code()
                            + " -> "
                            + priority.label()
                            + " -> "
                            + priority.responsePromise());
        }

        TaskPriority parsed = TaskPriority.fromCode("H");
        System.out.println("解析结果：" + parsed.name() + " / " + parsed.label());

        try {
            TaskPriority.fromCode("X");
        } catch (IllegalArgumentException exception) {
            System.out.println("未知编码：已拒绝");
        }
    }
}
```

在 IDEA 中确认 Project SDK、模块 SDK 和运行配置 JRE 均为 JDK 25，运行
`TeamFlowPriorityApplication.main`。终端从项目根目录执行：

```bash
mkdir -p out-25-priority
javac -encoding UTF-8 -d out-25-priority src/teamflow/TaskPriority.java src/teamflow/TeamFlowPriorityApplication.java
java -cp out-25-priority teamflow.TeamFlowPriorityApplication
```

### 3. Java 8 完整参考实现

Java 8 的 `src/teamflow/TaskPriority.java`：

```java
package teamflow;

public enum TaskPriority {
    LOW("L", "普通"),
    MEDIUM("M", "重要"),
    HIGH("H", "紧急");

    private final String code;
    private final String label;

    /**
     * 创建具有固定编码和展示文字的任务优先级。
     *
     * @param code 稳定编码
     * @param label 展示文字
     */
    TaskPriority(String code, String label) {
        this.code = code;
        this.label = label;
    }

    /**
     * 返回任务优先级的稳定编码。
     *
     * @return 稳定编码
     */
    public String code() {
        return code;
    }

    /**
     * 返回任务优先级的展示文字。
     *
     * @return 展示文字
     */
    public String label() {
        return label;
    }

    /**
     * 返回当前优先级的响应承诺。
     *
     * @return 响应承诺
     */
    public String responsePromise() {
        switch (this) {
            case LOW:
                return "24 小时内响应";
            case MEDIUM:
                return "8 小时内响应";
            case HIGH:
                return "2 小时内响应";
            default:
                throw new IllegalStateException("未处理任务优先级: " + name());
        }
    }

    /**
     * 按稳定编码查找任务优先级。
     *
     * @param rawCode 待解析编码
     * @return 对应任务优先级
     * @throws IllegalArgumentException 编码不存在时抛出
     */
    public static TaskPriority fromCode(String rawCode) {
        for (TaskPriority priority : values()) {
            if (priority.code.equals(rawCode)) {
                return priority;
            }
        }
        throw new IllegalArgumentException("未知任务优先级编码: " + rawCode);
    }
}
```

Java 8 的 `src/teamflow/TeamFlowPriorityApplication.java`：

```java
package teamflow;

public class TeamFlowPriorityApplication {
    /**
     * 输出全部任务优先级，并验证合法与未知编码。
     *
     * @param args 启动参数，本示例不使用
     */
    public static void main(String[] args) {
        System.out.println("优先级数量：" + TaskPriority.values().length);

        for (TaskPriority priority : TaskPriority.values()) {
            System.out.println(
                    priority.code()
                            + " -> "
                            + priority.label()
                            + " -> "
                            + priority.responsePromise());
        }

        TaskPriority parsed = TaskPriority.fromCode("H");
        System.out.println("解析结果：" + parsed.name() + " / " + parsed.label());

        try {
            TaskPriority.fromCode("X");
        } catch (IllegalArgumentException exception) {
            System.out.println("未知编码：已拒绝");
        }
    }
}
```

在 IDEA 中把 Project SDK、模块 SDK 和运行配置 JRE 均设为 JDK 8，运行同一个入口。终端从 Java 8
项目根目录执行：

```bash
mkdir -p out-8-priority
javac -encoding UTF-8 -d out-8-priority src/teamflow/TaskPriority.java src/teamflow/TeamFlowPriorityApplication.java
java -cp out-8-priority teamflow.TeamFlowPriorityApplication
```

两个版本都应输出：

```text
优先级数量：3
L -> 普通 -> 24 小时内响应
M -> 重要 -> 8 小时内响应
H -> 紧急 -> 2 小时内响应
解析结果：HIGH / 紧急
未知编码：已拒绝
```

这份结果同时验收了五件事：`values()` 返回三个常量并保持声明顺序；固定字段分别提供 code 与 label；
两个版本的 switch 写法产生相同响应承诺；`fromCode("H")` 返回预先声明的 `HIGH` 常量，而不是创建新
对象或依赖声明位置；`fromCode("X")` 抛出的 `IllegalArgumentException` 在入口处被捕获，因此未知
code 的失败路径也能从最后一行输出直接核对。
