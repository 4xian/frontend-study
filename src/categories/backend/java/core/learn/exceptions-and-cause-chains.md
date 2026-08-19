---
id: backend.java.learn.basics.exceptions-and-cause-chains
type: lesson
title: 异常处理
summary: 用明确的异常类型表达失败，在合适边界捕获或传播，并在转换异常时保留原始 cause
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 120
prerequisites:
  - backend.java.learn.basics.project-progress-report
objectives:
  - 能说明异常如何中断正常流程，并区分 Throwable、Error、Exception 与 RuntimeException。
  - 能根据编译器是否强制处理，区分受检异常与非受检异常，而不把分类误解为严重程度。
  - 能正确使用 throw 抛出异常，并用 throws 声明可能传播出方法的受检异常。
  - 能说明异常沿调用链寻找匹配 catch 的过程，并按从具体到宽泛的顺序编写处理分支。
  - 能判断当前边界应恢复、转换还是继续传播，而不是用空 catch 隐藏失败。
  - 能定义 TeamFlow 异常类型，并在异常转换时通过构造器保留原始 cause。
  - 能区分 JDK 25 未命名 catch 参数与 Java 8 同形命名标识符的真实语义差异。
recap:
  - 异常表示当前操作不能按正常合同完成；抛出后，控制会转移到调用链上最近的匹配 catch。
  - Error 和 RuntimeException 分支属于非受检异常，其他异常类属于受检异常；分类决定编译检查，不代表严重程度。
  - throw 抛出一个异常对象，throws 声明方法可能向外传播的受检异常，两者职责不同。
  - catch 应对应明确的恢复、转换或终止动作；没有处理动作时，继续传播比空 catch 更诚实。
  - 多个 catch 从具体子类型写到宽泛父类型，否则后面的具体分支会不可达。
  - 异常转换应增加当前操作上下文，并把原始异常作为 cause 保留下来。
  - JDK 25 的单下划线是不可读取的未命名 catch 参数；Java 8 会把同一字符当成带警告的普通参数名。
related:
  - backend.java.learn.basics.error-localization
tags:
  - Java
  - 异常处理
  - try-catch
  - throw
  - throws
  - 受检异常
  - cause
  - TeamFlow
appliesTo: JDK 25 主线；核心异常合同兼容 Java 8，未命名 catch 参数仅用于 JDK 22 及以上版本
verifiedAt: 2026-08-18
sources:
  - id: jls-25-exceptions
    title: Java Language Specification 25 - Exceptions
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - Throwable 层级、受检与非受检异常分类、编译期异常检查和运行时传播规则
      - 受检异常必须被捕获或包含在方法 throws 合同中
  - id: jls-25-statements
    title: Java Language Specification 25 - Blocks, Statements, and Patterns
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - throw 语句、try-catch 语法、catch 匹配顺序与不可达分支规则
  - id: java-25-throwable
    title: Java SE 25 API - Throwable
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - Throwable 可以保存消息、堆栈快照和 cause，cause 可以继续形成异常链
      - 包装异常可以隔离底层实现类型，同时保留底层失败信息
  - id: java-25-runtime-exception
    title: Java SE 25 API - RuntimeException
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/RuntimeException.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - RuntimeException 及其子类属于非受检异常，不要求写入 throws
      - RuntimeException 提供同时接收 message 与 cause 的构造器
  - id: java-25-error
    title: Java SE 25 API - Error
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Error.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - Error 表示通常不应由普通应用代码恢复的异常状况，并且属于非受检分支
  - id: jls-8-exceptions
    title: Java Language Specification 8 - Exceptions
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-11.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 的异常层级、受检异常检查和运行时传播核心规则与本课主线一致
  - id: jls-8-statements
    title: Java Language Specification 8 - Blocks and Statements
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 支持本课通用程序使用的 throw、try-catch 与具体类型优先顺序
  - id: jep-456
    title: JEP 456 - Unnamed Variables & Patterns
    url: https://openjdk.org/jeps/456
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: JDK 22 及以上；本课现代主线为 JDK 25
    claims:
      - JDK 22 正式交付未命名变量，catch 参数可以使用下划线且不能在块内读取
      - Java 8 把单下划线当作带编译警告的标识符，Java 9 移除该标识符，JDK 22 以未命名变量语义重新支持
  - id: stackoverflow-empty-catch
    title: Stack Overflow - Try with empty Catches
    url: https://stackoverflow.com/questions/17838143/try-with-empty-catches
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 与 JDK 25；空 catch 行为已在两版复现
    claims:
      - 初学者会真实使用空 catch 让程序继续执行，却因此失去失败信息
  - id: stackoverflow-broad-catch
    title: Stack Overflow - Why is the Catch(Exception) almost always a bad Idea?
    url: https://stackoverflow.com/questions/2416316/why-is-the-catchexception-almost-always-a-bad-idea
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8 与 JDK 25；宽泛捕获与具体捕获结果已在两版复现
    claims:
      - 开发者会真实把过宽 catch 用在普通业务方法中，导致不同失败被同一种动作处理
      - 最终统一边界与普通业务方法的捕获职责需要区分
---

# 异常处理

TeamFlow 的进度报告已经能够处理一组有效任务。但真实输入并不总是满足预期：任务编号可能为空，查询的
任务可能不存在，底层数据源也可能暂时不可用。如果方法仍返回一个看似正常的字符串，调用方就无法判断
“确实没有结果”还是“查询过程失败了”。

异常为这类失败提供独立的控制路径。本课只解决如何创建、传播、捕获和转换异常，并让调用方看到稳定的失败
语义。资源关闭、文件读写、堆栈调试、日志、HTTP 错误响应和 Spring 全局异常处理都留在各自课程中。

## 一、先读懂异常路径

### 1. 异常会让当前正常流程立即停止

下面的方法要求优先级只能位于 1 到 5。输入越界时，`new` 创建一个
`IllegalArgumentException` 对象，`throw` 将它抛出，后面的正常返回语句不会执行：

```java
public final class ThrowFlowExample {
    /**
     * 校验并返回任务优先级。
     */
    private static int requirePriority(int priority) {
        if (priority < 1 || priority > 5) {
            throw new IllegalArgumentException("优先级必须在 1 到 5 之间");
        }
        return priority;
    }

    /**
     * 观察异常如何中断当前调用。
     */
    public static void main(String[] args) {
        try {
            System.out.println("校验开始");
            int priority = requirePriority(7);
            System.out.println("优先级: " + priority);
        } catch (IllegalArgumentException exception) {
            System.out.println("校验失败: " + exception.getMessage());
        }
        System.out.println("程序继续");
    }
}
```

预期输出：

```text
校验开始
校验失败: 优先级必须在 1 到 5 之间
程序继续
```

`requirePriority(7)` 没有正常返回，因此“优先级”那一行不会执行。控制权转移到匹配的 `catch`，该分支
完成后才继续运行外层后续语句。异常处理不是让失败从未发生，而是为失败选择一条明确路径。

### 2. Throwable 是所有可抛出对象的根

Java 只允许抛出 `Throwable` 或其子类对象。初学阶段可以先记住这棵主干：

```text
Throwable
|- Error
`- Exception
   `- RuntimeException
```

- `Error` 表示普通应用通常无法合理恢复的严重环境或 JVM 状况。业务代码不应通过
  `catch (Throwable)` 把它伪装成普通查询失败。
- `Exception` 表示应用需要传播或处理的异常条件。
- `RuntimeException` 是 `Exception` 的一个分支，常用于参数违反前置条件、对象状态不允许当前操作等
  调用方编程问题。

`catch (Exception exception)` 不会捕获与 `Exception` 同级的 `Error` 分支；而
`catch (Throwable throwable)` 会同时覆盖两支。类型层级决定匹配范围，不能只看变量名猜测。

### 3. 受检与非受检描述编译规则

除 `RuntimeException`、`Error` 及其子类之外的异常类属于受检异常。方法可能把受检异常传播到调用方时，
编译器要求二选一：

1. 当前方法用 `try-catch` 处理它；
2. 当前方法在签名中用 `throws` 继续声明它。

下面的自定义异常直接继承 `Exception`，因此属于受检异常：

```java
public final class CheckedExceptionExample {
    private static final class TaskNotFoundException extends Exception {
        /**
         * 创建任务不存在异常。
         */
        private TaskNotFoundException(String message) {
            super(message);
        }
    }

    /**
     * 查询任务标题，找不到时抛出受检异常。
     */
    private static String findTaskTitle(String taskId) throws TaskNotFoundException {
        throw new TaskNotFoundException("任务不存在: " + taskId);
    }

    /**
     * 捕获受检异常并给出可观察结果。
     */
    public static void main(String[] args) {
        try {
            System.out.println(findTaskTitle("TASK-404"));
        } catch (TaskNotFoundException exception) {
            System.out.println(exception.getMessage());
        }
    }
}
```

预期输出为 `任务不存在: TASK-404`。如果删除 `catch`，同时又不在 `main` 上声明 `throws`，源码会编译
失败。`IllegalArgumentException` 继承 `RuntimeException`，编译器不强制捕获或声明，但它仍会在运行时
中断当前正常流程。

“受检”不代表一定更严重，“非受检”也不代表可以忽略。这个分类首先回答的是：编译器是否强迫调用方在
源码中作出决定。

## 二、用 throw 与 throws 表达失败

### 1. throw 抛出一个具体异常对象

`throw` 后面必须是一个 `Throwable` 对象。消息应说明哪个操作为什么无法完成，并避免把口令、令牌或整段
敏感输入放进去：

```java
/**
 * 要求任务编号非空。
 */
private static String requireTaskId(String taskId) {
    if (taskId == null || taskId.trim().isEmpty()) {
        throw new IllegalArgumentException("任务编号不能为空");
    }
    return taskId;
}
```

当条件不满足时，方法异常完成；当条件满足时，方法正常返回任务编号。不要写成“先抛出，再继续执行后面的
语句”，因为同一条执行路径不会跨过 `throw`。

### 2. throws 把受检失败写进方法合同

`throws` 位于方法参数列表之后，声明哪些受检异常可能离开当前方法：

```java
private static final class TaskDataException extends Exception {
    /**
     * 创建任务数据异常。
     */
    private TaskDataException(String message) {
        super(message);
    }
}

/**
 * 从任务数据源读取标题。
 */
private static String readTaskTitle(String taskId) throws TaskDataException {
    throw new TaskDataException("任务数据源暂时不可用: " + taskId);
}
```

`throws TaskDataException` 不会自动创建或抛出异常；真正触发失败的是方法体中的 `throw`，或它调用的其他
方法传播出的异常。反过来，`throw new TaskDataException(...)` 也不能代替受检异常声明。

非受检异常可以写在 `throws` 中作为文档，但编译器不要求这样做。本课的参数校验直接抛出
`IllegalArgumentException`，不机械增加 `throws IllegalArgumentException`。

### 3. 当前层不处理时，异常继续沿调用链传播

调用链中的中间方法若没有恢复或转换动作，可以继续声明同一个受检异常：

```java
public final class ExceptionPropagationExample {
    private static final class TaskDataException extends Exception {
        /**
         * 创建任务数据异常。
         */
        private TaskDataException(String message) {
            super(message);
        }
    }

    /**
     * 模拟最底层查询失败。
     */
    private static String queryTitle(String taskId) throws TaskDataException {
        throw new TaskDataException("任务数据不可用: " + taskId);
    }

    /**
     * 当前层没有处理策略，因此继续声明失败。
     */
    private static String loadTitle(String taskId) throws TaskDataException {
        return queryTitle(taskId);
    }

    /**
     * 在拥有输出动作的入口边界捕获异常。
     */
    public static void main(String[] args) {
        try {
            System.out.println(loadTitle("TASK-500"));
        } catch (TaskDataException exception) {
            System.out.println("查询失败: " + exception.getMessage());
        }
    }
}
```

预期输出为 `查询失败: 任务数据不可用: TASK-500`。`queryTitle` 抛出后，`loadTitle` 没有匹配
`catch`，于是同一个异常对象继续向调用方传播。中间层若只是 `catch` 后原样 `throw exception`，既没有恢复
也没有增加语义，通常直接声明传播更清楚。

## 三、在能够采取动作的边界捕获

### 1. try 保护可能失败的操作，catch 处理匹配类型

`try` 中只放需要由同一组分支处理的操作。异常发生后，Java 从前到后检查当前 `try` 的 `catch`，选择第一
个与异常运行时类型兼容的分支：

```java
public final class CatchActionExample {
    /**
     * 把优先级文本转换为数字。
     */
    private static int parsePriority(String text) {
        try {
            return Integer.parseInt(text);
        } catch (NumberFormatException exception) {
            System.out.println("优先级格式无效: " + exception.getMessage());
            return 3;
        }
    }

    /**
     * 观察失败后的明确回退值。
     */
    public static void main(String[] args) {
        System.out.println("采用优先级: " + parsePriority("high"));
    }
}
```

输出的第一行包含无效输入信息，第二行是 `采用优先级: 3`。这里的 `catch` 有明确恢复动作：按 TeamFlow
约定使用默认优先级 3。若业务不允许回退，就不应为了“程序继续”而返回一个伪造值。

### 2. 多个 catch 从具体类型写到宽泛类型

父类型分支能够匹配它的所有子类，因此具体分支必须放在前面：

```java
try {
    updateTask();
} catch (TaskNotFoundException exception) {
    System.out.println("请重新选择任务");
} catch (TaskDataException exception) {
    System.out.println("任务数据暂时不可用");
}
```

如果 `TaskNotFoundException` 继承 `TaskDataException`，上述顺序允许两种失败采取不同动作。交换顺序后，
第一个分支已经覆盖所有 `TaskNotFoundException`，后面的具体分支永远无法到达，编译器会拒绝源码。

捕获父类型本身不是语法错误。真正的问题是当前边界是否能为覆盖范围内的每一种失败执行正确动作。普通业务
方法通常应捕获自己预期的具体类型；应用最外层的统一终止边界可能有不同职责，留到后续 Web 课程处理。

### 3. 捕获、转换与传播是三种不同决定

面对一个异常，先问当前层能做什么：

| 当前层拥有的动作 | 选择 | 结果 |
| --- | --- | --- |
| 能给出合法回退或让用户修正输入 | 捕获并恢复 | 返回明确结果或提示 |
| 需要隐藏底层实现并增加当前操作语义 | 捕获并转换 | 抛出新异常，同时保留 cause |
| 没有恢复动作，也没有新的抽象语义 | 继续传播 | 让更外层决定 |

不要仅仅因为 IDEA 提示“未处理异常”就随手生成空 `catch`。编译器要求的是对受检异常作出合同决定，不是
要求每一层都把失败吞掉。

## 四、转换异常时保留 cause

### 1. 自定义异常表达当前模块的失败语义

一个异常类应回答“调用方遇到了什么失败”，而不是重复底层库名称。TeamFlow 查询边界可以定义一个
`TaskQueryException`：

```java
private static final class TaskQueryException extends RuntimeException {
    /**
     * 创建任务查询异常并保留底层原因。
     */
    private TaskQueryException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

继承 `RuntimeException` 让它成为非受检异常。这个选择不等于“失败不重要”，只表示上层不被编译器强制在
每个调用点捕获。若调用方确实需要被强制处理一项可恢复失败，也可以定义继承 `Exception` 的受检类型。

### 2. cause 保存导致当前失败的原始 Throwable

底层异常与上层异常描述的是不同抽象层。转换时把原始对象传给 `(String, Throwable)` 构造器：

```java
/**
 * 查询任务标题，并把底层数据失败转换为任务查询语义。
 */
private static String loadTaskTitle(String taskId) {
    try {
        return readTaskTitle(taskId);
    } catch (TaskDataException exception) {
        throw new TaskQueryException("无法查询任务: " + taskId, exception);
    }
}
```

`getMessage()` 返回当前层的“无法查询任务”，`getCause()` 返回原始 `TaskDataException`。`Throwable`
还保存创建时的堆栈快照；堆栈如何阅读属于前面的错误定位和后续调试实践，本课只确保这条链没有被切断。

如果只写 `new TaskQueryException(exception.getMessage(), null)`，看似保留了文字，实际丢失了原始类型、
堆栈和因果关系。消息不是 cause 的替代品。

### 3. 不在每一层重复包装

包装的理由是当前层拥有更稳定的抽象语义，而不是“经过一层就换一个名字”。如果中间方法不能补充新的操作
上下文，直接传播原异常更简单。连续创建多个只有相同消息的包装异常会让因果链变长，却没有提高调用方的
判断能力。

异常消息应包含可定位但不敏感的上下文，例如任务编号；不要拼接口令牌、口令、完整请求体或个人隐私数据。
日志记录和外部错误响应将在后续课程中分别建立边界。

## 五、处理 JDK 25 与 Java 8 的真实差异

### 1. 核心异常合同在两个版本中一致

本课使用的 `Throwable` 层级、受检异常检查、`throw`、`throws`、`try-catch`、自定义异常与 cause 构造器
在 JDK 25 和 Java 8 中都可用。完整 TeamFlow 程序因此使用一份通用源码，并分别在两个 Project SDK 下
编译运行。

Java 8 不需要为这些共同能力改写成更宽泛的 `catch`，也不需要删除 cause。版本兼容不应降低异常合同质量。

### 2. JDK 25 可以使用未命名 catch 参数

JEP 456 在 JDK 22 正式交付未命名变量。JDK 25 中，当前分支不需要读取异常对象时，可以用 `_` 表达
“这个参数必须声明，但不会使用”：

```java
public final class Jdk25CatchParameterExample {
    /**
     * 解析优先级，格式无效时使用默认值。
     */
    private static int parsePriority(String text) {
        try {
            return Integer.parseInt(text);
        } catch (NumberFormatException _) {
            return 3;
        }
    }

    /**
     * 运行 JDK 25 未命名参数示例。
     */
    public static void main(String[] args) {
        System.out.println(parsePriority("high"));
    }
}
```

预期输出为 `3`。下划线不会在 `catch` 块内引入可读取的变量，因此不能再写 `_.getMessage()`。

### 3. Java 8 中的下划线仍是一个参数名

Java 8 不支持“未命名参数”这项语义，但单个 `_` 在该版本仍是合法标识符。Java 8 编译器会为它给出
警告，而且 `catch` 块可以读取这个名为 `_` 的参数；Java 9 才把单下划线标识符改成编译错误。只看到
Java 8 编译成功，不能把它误判为已经支持 JEP 456。

兼容代码应使用清楚的普通名称，即使分支不读取它：

```java
public final class Java8CatchParameterExample {
    /**
     * 解析优先级，格式无效时使用默认值。
     */
    private static int parsePriority(String text) {
        try {
            return Integer.parseInt(text);
        } catch (NumberFormatException exception) {
            return 3;
        }
    }

    /**
     * 运行 Java 8 命名参数示例。
     */
    public static void main(String[] args) {
        System.out.println(parsePriority("high"));
    }
}
```

预期输出同样是 `3`。本课完整程序需要同时运行在两版中，因此统一使用 `exception` 这样的命名参数。
未使用参数不等于空 `catch`：上面两个分支都执行了明确的默认值策略。

## 六、七个典型错误

**社区补充：** Stack Overflow 中确有初学者询问空 `catch` 是否可用，也有开发者讨论普通方法中过宽的
`catch (Exception)`。这些问题说明“编译通过就算处理完成”是真实误区。本节结论仍以 Java 语言规则为准，
并已在 JDK 25 与 Java 8 中复现。

:::pitfalls
### 既不捕获也不声明受检异常

**触发条件：** 调用声明 `throws TaskDataException` 的方法，但当前方法既没有 `try-catch`，也没有自己的
`throws` 声明。

**原因：** 受检异常可能离开当前方法，源码却没有满足编译期的捕获或声明要求。

**后果：** 两个版本都会编译失败，程序根本不会进入运行阶段。

**错误示例：**

```java
/**
 * 错误地忽略受检异常合同。
 */
private static void printTitle() {
    System.out.println(readTaskTitle("TASK-500"));
}
```

**正确写法：**

```java
/**
 * 在拥有提示动作的边界捕获受检异常。
 */
private static void printTitle() {
    try {
        System.out.println(readTaskTitle("TASK-500"));
    } catch (TaskDataException exception) {
        System.out.println("查询失败: " + exception.getMessage());
    }
}
```

**验证方式：** 错误版必须由 `javac` 拒绝；正确版可以编译，并在失败输入下输出“查询失败”和原始消息。

### 把父类型 catch 写在子类型之前

**触发条件：** `TaskNotFoundException` 继承 `TaskDataException`，源码却先捕获
`TaskDataException`。

**原因：** 第一个父类型分支已经能匹配子类型，后面的具体分支永远没有机会执行。

**后果：** 编译器报告具体 `catch` 不可达，无法靠运行顺序修复。

**错误示例：**

```java
try {
    updateTask();
} catch (TaskDataException exception) {
    System.out.println("任务数据失败");
} catch (TaskNotFoundException exception) {
    System.out.println("任务不存在");
}
```

**正确写法：**

```java
try {
    updateTask();
} catch (TaskNotFoundException exception) {
    System.out.println("任务不存在");
} catch (TaskDataException exception) {
    System.out.println("任务数据失败");
}
```

**验证方式：** 错误顺序在 JDK 25 与 Java 8 中都编译失败；正确顺序可以分别触发两个分支。

### 用空 catch 伪装成功

**触发条件：** 捕获查询失败后不恢复、不转换、不传播，也不给调用方任何失败结果。

**原因：** `catch` 只截断了异常路径，却没有重新建立一个合法的正常结果。

**后果：** 后续代码继续输出“同步成功”，调用方无法知道任务实际没有同步。

**错误示例：**

```java
/**
 * 错误地吞掉同步失败。
 */
private static void unsafeSynchronize() {
    try {
        synchronizeTask();
    } catch (TaskDataException exception) {
    }
    System.out.println("任务同步成功");
}
```

**正确写法：**

```java
/**
 * 把同步失败转换为当前操作语义。
 */
private static void safeSynchronize() {
    try {
        synchronizeTask();
        System.out.println("任务同步成功");
    } catch (TaskDataException exception) {
        throw new TaskQueryException("任务同步失败", exception);
    }
}
```

**验证方式：** 让 `synchronizeTask()` 固定抛出异常；错误版仍打印成功，正确版不打印成功并保留
`TaskDataException` cause。

### 在普通业务方法中无差别捕获 Exception 或 Throwable

**触发条件：** 当前方法只知道如何处理任务数据失败，却为了“兜底”捕获 `Exception` 或 `Throwable`。

**原因：** 分支覆盖了参数错误、状态错误和其他未预期失败；`Throwable` 还会覆盖普通业务通常不应恢复的
`Error`。

**后果：** 不同失败被压成同一字符串，编程错误也可能被伪装成可继续的业务结果。

**错误示例：**

```java
/**
 * 错误地把所有异常压成同一结果。
 */
private static String broadLoad(String taskId) {
    try {
        return readTaskTitle(taskId);
    } catch (Exception exception) {
        return "查询失败";
    }
}
```

**正确写法：**

```java
/**
 * 只转换当前边界理解的任务数据失败。
 */
private static String specificLoad(String taskId) {
    String normalizedTaskId = requireTaskId(taskId);
    try {
        return readTaskTitle(normalizedTaskId);
    } catch (TaskDataException exception) {
        throw new TaskQueryException("无法查询任务: " + normalizedTaskId, exception);
    }
}
```

**验证方式：** 分别传入空编号和模拟数据失败；正确版让参数错误保持
`IllegalArgumentException`，只把 `TaskDataException` 转为任务查询异常。

### 只复制消息而丢失 cause

**触发条件：** 转换异常时只读取 `exception.getMessage()`，没有把原异常对象传入新异常构造器。

**原因：** 字符串不携带原始异常类型、堆栈或对象身份。

**后果：** `getCause()` 返回 `null`，诊断只能看到包装位置，无法沿链回到数据失败。

**错误示例：**

```java
/**
 * 错误地只复制底层消息。
 */
private static RuntimeException withoutCause(TaskDataException exception) {
    return new RuntimeException("查询失败: " + exception.getMessage());
}
```

**正确写法：**

```java
/**
 * 同时保存当前语义和原始 cause。
 */
private static RuntimeException withCause(TaskDataException exception) {
    return new TaskQueryException("查询任务失败", exception);
}
```

**验证方式：** `withoutCause(...).getCause()` 必须为 `null`，
`withCause(...).getCause()` 必须是传入的同一个 `TaskDataException` 对象。

### 用异常代替可预期的普通条件

**触发条件：** 为了判断列表索引是否有效，先访问列表，再用
`IndexOutOfBoundsException` 表示“没有这个位置”。

**原因：** 索引范围本来可以直接判断，异常被当成了日常分支工具。

**后果：** 正常控制意图变得隐蔽，真正意外的边界错误也更难与预期分支区分。

**错误示例：**

```java
/**
 * 错误地依赖异常判断索引范围。
 */
private static boolean hasTaskAt(java.util.List<String> tasks, int index) {
    try {
        tasks.get(index);
        return true;
    } catch (IndexOutOfBoundsException exception) {
        return false;
    }
}
```

**正确写法：**

```java
/**
 * 直接判断任务索引是否有效。
 */
private static boolean hasTaskAt(java.util.List<String> tasks, int index) {
    return index >= 0 && index < tasks.size();
}
```

**验证方式：** 使用索引 `-1`、`0` 和 `tasks.size()` 验证边界；正确版不依赖异常也能得到
`false`、实际首项状态和 `false`。

### 把两个版本的下划线参数当成相同语义

**触发条件：** 看到 JDK 25 与 Java 8 都能编译 `catch (NumberFormatException _)`，便声称两个版本都把
`_` 当成未命名参数。

**原因：** 未命名变量在 JDK 22 才正式交付；Java 8 中的 `_` 是一个带编译警告、可以读取的普通标识符。

**后果：** 相同源码表面上都能编译，参数是否有名称、能否读取以及编译反馈却不同，版本说明因此失真。

**错误示例：**

```java
try {
    return Integer.parseInt(text);
} catch (NumberFormatException _) {
    return 3;
}
```

**正确写法：**

```java
try {
    return Integer.parseInt(text);
} catch (NumberFormatException exception) {
    return 3;
}
```

**验证方式：** Java 8 编译下划线版本必须出现“`_` used as an identifier”警告，并且在块内读取 `_`
仍能编译；JDK 25 把 `_` 当作未命名参数，在块内读取它必须编译失败。命名参数版本应在两条版本线都无此
语义歧义并返回 `3`。
:::

## 七、完整的 TeamFlow 任务查询程序

### 1. 程序要解决的问题

程序在内存中保存一个任务标题，并依次查询正常编号、不存在的编号和空白编号。它需要让三种结果保持清楚：

- 正常查询返回任务标题；
- 空白编号是调用前置条件错误，抛出 `IllegalArgumentException`；
- 底层数据失败先用受检的 `TaskDataException` 表达，再由服务边界转换为
  `TaskQueryException` 并保留 cause。

这里只模拟数据边界，不读取文件，也不连接数据库。

### 2. JDK 25 与 Java 8 通用完整程序

创建 `TeamFlowExceptionApplication.java`，写入以下完整代码：

```java
import java.util.HashMap;
import java.util.Map;

public final class TeamFlowExceptionApplication {
    private static final Map<String, String> TASK_TITLES = new HashMap<>();

    static {
        TASK_TITLES.put("TASK-101", "准备迭代演示");
    }

    private static final class TaskDataException extends Exception {
        /**
         * 创建任务数据异常。
         */
        private TaskDataException(String message) {
            super(message);
        }
    }

    private static final class TaskQueryException extends RuntimeException {
        /**
         * 创建任务查询异常并保留底层原因。
         */
        private TaskQueryException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    /**
     * 校验任务编号并返回去除首尾空白后的结果。
     */
    private static String requireTaskId(String taskId) {
        if (taskId == null || taskId.trim().isEmpty()) {
            throw new IllegalArgumentException("任务编号不能为空");
        }
        return taskId.trim();
    }

    /**
     * 从内存任务数据源读取标题。
     */
    private static String readTaskTitle(String taskId) throws TaskDataException {
        String title = TASK_TITLES.get(taskId);
        if (title == null) {
            throw new TaskDataException("任务不存在");
        }
        return title;
    }

    /**
     * 查询任务标题，并把底层失败转换为 TeamFlow 查询语义。
     */
    private static String loadTaskTitle(String taskId) {
        String normalizedTaskId = requireTaskId(taskId);
        try {
            return readTaskTitle(normalizedTaskId);
        } catch (TaskDataException exception) {
            throw new TaskQueryException("无法查询任务: " + normalizedTaskId, exception);
        }
    }

    /**
     * 查询一个任务并输出当前边界能够提供的结果。
     */
    private static void printTask(String taskId) {
        System.out.println("查询 [" + taskId + "]");
        try {
            System.out.println("任务标题: " + loadTaskTitle(taskId));
        } catch (IllegalArgumentException exception) {
            System.out.println("输入错误: " + exception.getMessage());
        } catch (TaskQueryException exception) {
            Throwable cause = exception.getCause();
            System.out.println("查询失败: " + exception.getMessage());
            System.out.println(
                "底层原因: " + cause.getClass().getSimpleName() + " - " + cause.getMessage()
            );
        }
    }

    /**
     * 运行 TeamFlow 任务查询的成功与失败路径。
     */
    public static void main(String[] args) {
        printTask("TASK-101");
        printTask("TASK-404");
        printTask("  ");
    }
}
```

这份源码故意使用 Java 8 已支持的命名 catch 参数和传统 `main` 入口，因此无需维护两份重复程序。

### 3. 在 JDK 25 中配置并运行

1. 在 IntelliJ IDEA 打开承载本课源码的普通 Java 项目。
2. 打开 **File -> Project Structure -> Project**，把 **Project SDK** 选择为已安装的 JDK 25。
3. 确认 **Project language level** 使用 SDK 默认值或 Java 25。
4. 打开 `TeamFlowExceptionApplication.java`，点击 `main` 左侧运行图标，选择
   **Run 'TeamFlowExceptionApplication.main()'**。
5. 在 Run 控制台核对三次查询的顺序、当前异常消息和底层 cause。

如果 IDEA 使用的 SDK 与终端不同，以 **Project Structure** 和 Run 配置实际显示的 JRE 为准。

### 4. 在 Java 8 中配置并运行

1. 在 **File -> Project Structure -> SDKs** 中添加本机已有的 JDK 8 安装目录。
2. 回到 **Project**，把 **Project SDK** 选择为 JDK 8，并把语言级别设为 8。
3. 检查当前模块的 **Module SDK** 跟随 Project SDK；不要只修改终端中的 `JAVA_HOME`。
4. 保持源码中的命名 catch 参数不变，运行同一个 `main`。
5. 在 Run 控制台核对输出与 JDK 25 完全一致。

本课不要求安装或切换系统默认 JDK；两个版本分别选择对应的 IDEA SDK 即可。

### 5. 预期控制台输出

```text
查询 [TASK-101]
任务标题: 准备迭代演示
查询 [TASK-404]
查询失败: 无法查询任务: TASK-404
底层原因: TaskDataException - 任务不存在
查询 [  ]
输入错误: 任务编号不能为空
```

第一次查询正常返回。第二次由 `readTaskTitle` 抛出受检异常，`loadTaskTitle` 捕获并转换，最外层再读取
当前消息和 cause。第三次在进入数据查询前就违反参数前置条件，因此保持
`IllegalArgumentException`，不会被误包装成数据失败。

## 八、独立练习

### 1. 为任务分派建立失败边界

:::exercise
### 任务分派失败处理

**要求：** 编写 `TeamFlowAssignmentApplication`。使用内存 Map 保存成员；空白任务编号抛出
`IllegalArgumentException`；底层成员查询用受检的 `MemberDirectoryException` 表达失败；分派方法捕获它，
转换为 `AssignmentException` 并保留 cause。分别运行成功分派、成员不存在和空白任务编号，不使用空 catch、
`catch (Throwable)`、文件、Stream 或 Optional。源码必须同时兼容 JDK 25 与 Java 8。

**验收：**

```text
TASK-201 已分派给 林晓
分派失败: 无法分派 TASK-202 给 USER-404
底层原因: MemberDirectoryException - 成员不存在
输入错误: 任务编号不能为空
```
:::

### 2. JDK 25 与 Java 8 通用参考实现

创建 `TeamFlowAssignmentApplication.java`：

```java
import java.util.HashMap;
import java.util.Map;

public final class TeamFlowAssignmentApplication {
    private static final Map<String, String> MEMBERS = new HashMap<>();

    static {
        MEMBERS.put("USER-101", "林晓");
    }

    private static final class MemberDirectoryException extends Exception {
        /**
         * 创建成员目录异常。
         */
        private MemberDirectoryException(String message) {
            super(message);
        }
    }

    private static final class AssignmentException extends RuntimeException {
        /**
         * 创建任务分派异常并保留底层原因。
         */
        private AssignmentException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    /**
     * 校验任务编号并返回规范化结果。
     */
    private static String requireTaskId(String taskId) {
        if (taskId == null || taskId.trim().isEmpty()) {
            throw new IllegalArgumentException("任务编号不能为空");
        }
        return taskId.trim();
    }

    /**
     * 从成员目录查询姓名。
     */
    private static String findMemberName(String memberId) throws MemberDirectoryException {
        String memberName = MEMBERS.get(memberId);
        if (memberName == null) {
            throw new MemberDirectoryException("成员不存在");
        }
        return memberName;
    }

    /**
     * 把任务分派给指定成员。
     */
    private static String assignTask(String taskId, String memberId) {
        String normalizedTaskId = requireTaskId(taskId);
        try {
            String memberName = findMemberName(memberId);
            return normalizedTaskId + " 已分派给 " + memberName;
        } catch (MemberDirectoryException exception) {
            throw new AssignmentException(
                "无法分派 " + normalizedTaskId + " 给 " + memberId,
                exception
            );
        }
    }

    /**
     * 运行一次任务分派并输出结果。
     */
    private static void printAssignment(String taskId, String memberId) {
        try {
            System.out.println(assignTask(taskId, memberId));
        } catch (IllegalArgumentException exception) {
            System.out.println("输入错误: " + exception.getMessage());
        } catch (AssignmentException exception) {
            Throwable cause = exception.getCause();
            System.out.println("分派失败: " + exception.getMessage());
            System.out.println(
                "底层原因: " + cause.getClass().getSimpleName() + " - " + cause.getMessage()
            );
        }
    }

    /**
     * 运行成功、成员失败和参数失败三条路径。
     */
    public static void main(String[] args) {
        printAssignment("TASK-201", "USER-101");
        printAssignment("TASK-202", "USER-404");
        printAssignment("  ", "USER-101");
    }
}
```

### 3. 分别运行并验收

在 JDK 25 项目中运行一次，再把 IDEA 的 Project SDK 和 Module SDK 切换为 JDK 8 后重新运行。两次都应
逐行得到练习给出的四行输出。

验收时再检查三点：`findMemberName` 的受检异常已被捕获或声明；`AssignmentException` 的
`getCause()` 是 `MemberDirectoryException`；空白任务编号保持参数错误，没有被转换为成员目录失败。

## 九、把异常合同放回 TeamFlow

### 1. 本课增加的是失败路径，不是框架层

完成本课后，TeamFlow 的内存查询和分派示例不再用空文本或“看似成功”掩盖失败。参数错误、底层数据失败和
当前业务操作失败由不同类型表达，调用边界可以据此选择提示、转换或继续传播。

下一步处理资源时会遇到“主要操作失败”和“关闭也失败”的组合；文件读写还会引入真实 I/O 异常。这些内容
需要新的资源所有权和文件 API 知识，本课不提前展开。

### 2. 自我检查

不看代码，尝试回答：

1. `throw` 与 `throws` 分别做什么？
2. 为什么 `RuntimeException` 不受捕获或声明检查，但仍不能被忽略？
3. 多个 `catch` 为什么要从具体类型写到宽泛类型？
4. 什么情况下当前层应转换异常，什么情况下应继续传播？
5. 只复制 `getMessage()` 为什么不能保留 cause？
6. JDK 25 的 `catch (SomeException _)` 为什么不能直接用于 Java 8？

能够结合完整程序解释三条输出路径，并独立完成练习，才算真正建立了本课的异常处理能力。
