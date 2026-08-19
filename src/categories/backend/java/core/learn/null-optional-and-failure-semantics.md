---
id: backend.java.learn.basics.null-optional-and-failure-semantics
type: lesson
title: Optional
summary: 用 Optional 表达可能没有单个结果的返回边界，并在 TeamFlow 查询中组合、读取和验证缺失分支
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 95
prerequisites:
  - backend.java.learn.basics.stream-processing
objectives:
  - 能区分正常缺失、空集合和执行失败，并判断何时返回 Optional。
  - 能按输入合同选择 Optional.of、ofNullable 或 empty。
  - 能使用 filter、map 与 flatMap 组合可能缺失的单值结果。
  - 能根据求值时机选择 orElse、orElseGet、orElseThrow 或 or。
  - 能在 JDK 25 与 Java 8 中分别完成 Optional 查询流程。
recap:
  - Optional 表达正常完成后可能没有单个结果，容器自身不应为 null。
  - of 接受确定非 null 的值，ofNullable 适配可空边界，empty 表达正常缺失。
  - 普通转换使用 map，返回 Optional 的查询使用 flatMap。
  - orElse 的实参会先求值，延迟备用计算应使用 orElseGet 或 or。
  - Java 8 没有 or、stream、ifPresentOrElse、isEmpty 和无参 orElseThrow。
related:
  - backend.java.learn.basics.stream-processing
tags:
  - Java
  - Optional
  - 缺失值
  - 返回合同
  - TeamFlow
appliesTo: JDK 25；Java 8 兼容写法见正文
verifiedAt: 2026-08-18
sources:
  - id: java-25-optional
    title: Java SE 25 API - Optional
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Optional.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - Optional 的返回值定位、创建、转换、读取、备用查询和 Stream 桥接合同
      - get、map、flatMap 与各类空值输入的行为
  - id: java-8-optional
    title: Java Platform SE 8 API - Optional
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Optional.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 已有的 Optional 核心 API 与带 supplier 的 orElseThrow
      - Java 8 与 JDK 25 的可用方法边界
  - id: jls-25-evaluation-order
    title: Java Language Specification 25 - Evaluation Order
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.7.4
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java 25
    claims:
      - 方法调用实参从左到右并在进入方法前求值
  - id: jls-8-evaluation-order
    title: Java Language Specification 8 - Evaluation Order
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html#jls-15.7.4
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java 8
    claims:
      - Java 8 方法调用实参同样在进入方法前求值
  - id: dev-java-optionals
    title: Dev.java - Using Optionals
    url: https://dev.java/learn/api/streams/optionals/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java
    claims:
      - Optional 的创建、转换、消费、Stream 衔接与使用边界
  - id: stack-overflow-or-else
    title: Difference between Optional.orElse() and Optional.orElseGet()
    url: https://stackoverflow.com/questions/33170109/difference-between-optional-orelse-and-optional-orelseget
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Java 8+
    claims:
      - Optional 已有值时仍执行 orElse 备用表达式是社区中反复出现的真实误区
---

# Optional

TeamFlow 按任务编号查找任务时，编号可能命中，也可能正常地没有结果。若返回 `null`，调用方仅从
方法签名看不出它表示“未找到”还是“执行失败”；若返回 `Optional<Task>`，则能明确看到：方法会正常
完成，但结果可能不存在。

本课只处理这种“可能没有单个结果”的边界。文件读取失败、权限错误等执行失败仍应保留异常；多值查询
没有成员时通常返回空集合。示例沿用前面学过的集合、Lambda 与 Stream，不引入 Spring Boot 或数据库。

## 一、先判断是否适合 Optional

### 1. present 与 empty 是两种正常结果

`Optional<T>` 是一个容器：内部有一个非 `null` 的 `T` 时称为 present，没有值时称为
empty。Oracle 的 JDK 25 API 明确把它主要定位为方法返回类型，用来表达清晰的“没有结果”；
Optional 变量自身不应为 `null`。

```java
/**
 * 按编号查找任务；未命中时返回 empty。
 */
private static Optional<String> findTaskTitle(String taskId) {
    if ("TASK-101".equals(taskId)) {
        return Optional.of("准备项目周报");
    }
    return Optional.empty();
}
```

传入 `TASK-101` 得到 present，传入其他编号得到 empty。两次调用都正常完成，区别只是是否有
单个结果。调用方看到返回类型就知道必须处理这两个分支。

### 2. 正常缺失、空集合和失败不能混用

先判断操作正常完成后允许出现多少个结果：

| 场景 | 推荐表达 | 原因 |
| --- | --- | --- |
| 按唯一编号查一个任务，允许未命中 | `Optional<Task>` | 正常结果是零个或一个 |
| 查询全部待办任务，允许零条 | 非 `null` 的 `List<Task>` | 集合本身已经能表达零个成员 |
| 读取任务文件失败 | 保留有语义的异常 | 操作没有按合同完成，需要保留原因 |
| 必须存在的项目名称 | `String`，在边界拒绝 `null` | 正常结果不允许缺失 |

`Optional.empty()` 没有空间保存失败原因。把 I/O、权限或解析异常捕获后统一改成 empty，会让
调用方误以为“查询成功但没有结果”，这不是容错，而是改变了结果含义。

:::tip
Optional 最清晰的用途是方法返回边界。不要机械地把参数、字段、集合元素和每个局部变量都包装成
Optional；这些位置是否允许缺失，应由各自的合同决定。
:::

## 二、创建并转换 Optional

### 1. of、ofNullable 与 empty 对应三种输入合同

```java
Optional<String> fixedOwner = Optional.of("林夏");
Optional<String> legacyOwner = Optional.ofNullable(loadLegacyOwner());
Optional<String> missingOwner = Optional.empty();
```

- `of(value)` 表示调用方确信 value 非 `null`；传入 `null` 会立即抛出
  `NullPointerException`。
- `ofNullable(value)` 接收可能为 `null` 的旧边界；非 `null` 时为 present，`null` 时为
  empty。
- `empty()` 直接表达已知没有值。

`ofNullable` 适合集中在旧接口适配处，不应成为隐藏意外 `null` 的通用工具。若某个值按
合同必须存在，应尽早拒绝违规输入，而不是悄悄把错误变成 empty。

### 2. filter 与 map 只处理 present 分支

```java
Optional<String> owner = Optional.of("  林夏  ")
    .map(String::trim)
    .filter(value -> !value.isEmpty())
    .map(value -> "负责人：" + value);
```

处理顺序如下：

1. `map(String::trim)` 只在有值时去掉首尾空白。
2. `filter(...)` 只保留非空字符串；条件不成立时变成 empty。
3. 最后的 `map(...)` 只在仍有值时添加显示前缀。

结果是包含 `负责人：林夏` 的 Optional。若起点为 empty，三个操作都不会调用函数，结果仍为
empty。`map` 的 mapper 若返回 `null`，API 会把结果转换为 empty；不要依赖这个行为掩盖
错误，mapper 应尽量返回含义明确的普通值。

### 3. flatMap 连接另一个 Optional 查询

假设 `findTask` 返回 `Optional<Task>`，任务里的负责人又可能缺失：

```java
/**
 * 查找任务负责人；任务未命中或负责人未设置时都返回 empty。
 */
private static Optional<String> findOwner(List<Task> tasks, String taskId) {
    return findTask(tasks, taskId)
        .flatMap(task -> Optional.ofNullable(task.getOwner()))
        .map(String::trim)
        .filter(owner -> !owner.isEmpty());
}
```

`flatMap` 用在转换函数已经返回 Optional 的位置。若写成
`.map(task -> Optional.ofNullable(task.getOwner()))`，类型会变成
`Optional<Optional<String>>`，调用方要拆两层容器。`flatMap` 返回一层
`Optional<String>`；它的 mapper 必须返回非 `null` 的 Optional，否则会抛
`NullPointerException`。

## 三、在边界读取或继续组合

### 1. ifPresent 与 ifPresentOrElse 处理分支动作

```java
findOwner(tasks, "TASK-101")
    .ifPresent(owner -> System.out.println("负责人：" + owner));

findOwner(tasks, "TASK-102").ifPresentOrElse(
    owner -> System.out.println("负责人：" + owner),
    () -> System.out.println("当前没有负责人")
);
```

`ifPresent` 只处理有值分支；empty 时不执行任何动作。JDK 25 的 `ifPresentOrElse` 同时
写出 present 与 empty 两条动作，适合两边都需要产生可观察结果的场景。它们的返回值都是
`void`，若后续仍要继续计算，应使用 `map`、`flatMap` 或备用值操作。

Java 8 支持 `ifPresent`，但没有 `ifPresentOrElse`。兼容代码先保存 Optional，再用
`isPresent()` 分支；不要在多个表达式中重复调用可能变化的查询。

### 2. orElse、orElseGet 与 orElseThrow 表达不同意图

```java
String label = findOwner(tasks, "TASK-102").orElse("待分配");
String loaded = findOwner(tasks, "TASK-102").orElseGet(
    () -> loadDefaultOwner()
);
String required = findOwner(tasks, "TASK-101").orElseThrow(
    () -> new IllegalStateException("任务负责人必须存在")
);
```

- `orElse(value)` 适合常量或已经计算好的便宜值。
- `orElseGet(supplier)` 只在 empty 时调用 supplier，适合延迟计算或有副作用的备用值。
- `orElseThrow(supplier)` 在 empty 时抛出带业务上下文的异常，Java 8 与 JDK 25 都支持。
- JDK 25 还有无参 `orElseThrow()`，empty 时抛 `NoSuchElementException`；Java 8 不支持。

`get()` 在 empty 时同样抛 `NoSuchElementException`，但不能说明当前业务为何要求值存在。
优先按意图使用组合操作、备用值或带消息的 `orElseThrow`，不要无条件调用 `get()`。

**社区补充：** Stack Overflow 的真实问答反复出现“Optional 已有值，为什么备用方法仍执行”的
问题。原因不是 Optional 偷偷选择了备用分支，而是 Java 会在进入方法前求值普通实参。因此
`present.orElse(createFallback())` 仍会调用 `createFallback()`；这个结论已用 Java 8 与
Java 25 的 JLS 求值规则交叉核验。若备用计算昂贵、有日志或会写数据，使用
`orElseGet(this::createFallback)`。

### 3. or 延迟选择另一个 Optional

```java
Optional<Task> selected = findTask(tasks, "TASK-404")
    .or(() -> findTask(tasks, "TASK-103"));
```

JDK 25 的 `or(supplier)` 在主 Optional 为 empty 时才取得另一个 Optional，并继续保留
容器。它适合“先查主编号，未命中再查备用编号”。`orElseGet` 返回的是内部值 `T`，
`or` 返回的仍是 `Optional<T>`，所以后面还能继续转换或决定如何处理最终缺失。

`or` 从 Java 9 提供。Java 8 可为本课这种同类型查询编写 `firstPresent`：先拒绝 `null`
supplier，主结果 present 时不调用它，主结果 empty 时再取得并校验备用 Optional。不要在判断
之前提前计算 fallback，也不要允许 helper 返回 `null`。

### 4. stream 把零个或一个结果接回 Stream

```java
List<String> foundIds = queryIds.stream()
    .map(taskId -> findTask(tasks, taskId))
    .flatMap(Optional::stream)
    .map(Task::getId)
    .collect(Collectors.toList());
```

`Optional.stream()` 在 present 时产生一个元素，在 empty 时产生零个元素，因此能把
`Stream<Optional<Task>>` 展平为 `Stream<Task>`。它从 Java 9 提供，与上一课的 Stream
形成直接衔接。

Java 8 没有 `Optional.stream()`。兼容辅助方法可以让 present 返回 `Stream.of(value)`、
empty 返回 `Stream.empty()`。若只想判断缺失，JDK 25 可用 `isEmpty()`，Java 8 使用
`!isPresent()`；`isEmpty()` 从 Java 11 才提供。

## 四、集中排除常见误用

下面的错误都能让“可能缺失”的边界重新变得含糊。

:::pitfalls
### 返回 null 代替 Optional.empty

**触发条件：** 方法已经声明返回 `Optional<Task>`，未命中分支却返回 `null`。

**原因：** Optional 的 present 与 empty 只存在于非 `null` 的容器实例中；容器自身为
`null` 会破坏返回合同。

**后果：** 调用方一调用组合、判断或备用值操作就得到 `NullPointerException`。

**错误示例：**

```java
/**
 * 错误地按编号查找任务。
 */
private static Optional<Task> findTask(String taskId) {
    return null;
}
```

**正确写法：**

```java
/**
 * 按编号查找任务；未命中时返回 empty。
 */
private static Optional<Task> findTask(String taskId) {
    return Optional.empty();
}
```

**验证方式：** 传入不存在的编号，先确认返回对象不为 `null`，再确认其 `isEmpty()` 为
`true`；Java 8 使用 `!isPresent()`。

### 用 Optional.of 包装明确可空的旧值

**触发条件：** 旧接口允许返回 `null`，适配代码却调用
`Optional.of(loadLegacyOwner())`。

**原因：** `of` 的参数合同是非 `null`；它不会把 `null` 自动转换为 empty。

**后果：** 本应表示正常缺失的旧值在适配处直接抛出 `NullPointerException`。

**错误示例：**

```java
Optional<String> owner = Optional.of(loadLegacyOwner());
```

**正确写法：**

```java
Optional<String> owner = Optional.ofNullable(loadLegacyOwner());
```

**验证方式：** 让旧接口分别返回 `"林夏"` 和 `null`；前者应为 present，后者应为
empty，且 Optional 对象自身都不是 `null`。

### 无条件调用 get

**触发条件：** 没有先确定 empty 分支的含义，就直接对查询结果调用 `get()`。

**原因：** API 规定 empty 的 `get()` 会抛 `NoSuchElementException`。

**后果：** 程序在缺少业务上下文的位置中断，调用方无法从异常消息判断哪个任务缺失。

**错误示例：**

```java
Task task = findTask(tasks, taskId).get();
```

**正确写法：**

```java
Task task = findTask(tasks, taskId).orElseThrow(
    () -> new IllegalArgumentException("任务不存在：" + taskId)
);
```

**验证方式：** 使用不存在的 `TASK-404`，正确代码应抛出消息包含该编号的异常；允许缺失的
展示场景则应改用备用值操作，而不是抛异常。

### 用 map 包装另一个 Optional

**触发条件：** 转换函数本来就返回 `Optional<String>`，调用方仍使用 `map`。

**原因：** `map` 会把转换结果当成普通值再包一层。

**后果：** 类型变成 `Optional<Optional<String>>`，两个 empty 层级增加了无意义的分支。

**错误示例：**

```java
Optional<Optional<String>> owner = findTask(tasks, taskId)
    .map(task -> Optional.ofNullable(task.getOwner()));
```

**正确写法：**

```java
Optional<String> owner = findTask(tasks, taskId)
    .flatMap(task -> Optional.ofNullable(task.getOwner()));
```

**验证方式：** 分别使用有负责人、无负责人和不存在的任务；返回类型始终只有一层
`Optional<String>`，后两种输入都得到 empty。

### 用 orElse 提前执行有副作用的备用操作

**触发条件：** `orElse` 的参数调用数据库、写日志、增加计数或创建昂贵对象。

**原因：** 普通方法实参会在进入 `orElse` 前完成求值，即使 Optional 已经 present。

**后果：** 主结果明明存在，备用操作仍执行，可能浪费资源或改变数据。

**错误示例：**

```java
String owner = Optional.of("林夏").orElse(createAndSaveDefaultOwner());
```

**正确写法：**

```java
String owner = Optional.of("林夏").orElseGet(
    () -> createAndSaveDefaultOwner()
);
```

**验证方式：** 在备用方法中增加计数；present 输入下，错误写法计数为 1，正确写法计数为 0；
empty 输入下，正确写法计数为 1。

### 把执行失败改写成 empty

**触发条件：** 捕获文件、网络或数据库异常后，统一返回 `Optional.empty()`。

**原因：** Optional 只能表达 present 或 empty，无法保留失败类型、消息和 cause。

**后果：** 系统失败被误报为“任务不存在”，调用方失去定位和恢复依据。

**错误示例：**

```java
/**
 * 错误地读取任务。
 */
private static Optional<Task> loadTask(String taskId) {
    try {
        return Optional.of(readTask(taskId));
    } catch (IOException error) {
        return Optional.empty();
    }
}
```

**正确写法：**

```java
/**
 * 读取任务，并保留底层失败原因。
 */
private static Optional<Task> loadTask(String taskId) {
    try {
        return Optional.of(readTask(taskId));
    } catch (IOException error) {
        throw new IllegalStateException("读取任务失败：" + taskId, error);
    }
}
```

**验证方式：** 固定一次读取失败；正确代码应抛出含任务编号的异常，并能从 `getCause()` 取得
原始 `IOException`，而不是返回 empty。
:::

## 五、完整程序：TeamFlow 任务查询

### 1. JDK 25 版本

在 IntelliJ IDEA 中打开本课普通 Java 项目，依次检查
`File -> Project Structure -> Project -> SDK` 和模块的 `Module SDK` 都是 JDK 25。创建
`TeamFlowOptionalApplication.java`，填写下面的完整代码：

```java
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public final class TeamFlowOptionalApplication {
    /**
     * 启动 TeamFlow 任务查询示例。
     */
    public static void main(String[] args) {
        List<Task> tasks = Arrays.asList(
            new Task("TASK-101", "准备项目周报", "林夏"),
            new Task("TASK-102", "整理评审记录", null),
            new Task("TASK-103", "确认发布清单", "周航")
        );

        String requiredOwner = findOwner(tasks, "TASK-101").orElseThrow();
        String displayOwner = findOwner(tasks, "TASK-102").orElseGet(() -> "待分配");
        Task backupTask = findTask(tasks, "TASK-404")
            .or(() -> findTask(tasks, "TASK-103"))
            .orElseThrow();

        List<String> queryIds = Arrays.asList("TASK-101", "TASK-404", "TASK-103");
        String foundIds = queryIds.stream()
            .map(taskId -> findTask(tasks, taskId))
            .flatMap(Optional::stream)
            .map(Task::getId)
            .collect(Collectors.joining(", "));

        System.out.println("TASK-101 负责人：" + requiredOwner);
        System.out.println("TASK-102 负责人：" + displayOwner);
        System.out.println("备用任务：" + backupTask.getId());
        System.out.println("已找到任务：" + foundIds);

        findOwner(tasks, "TASK-102").ifPresentOrElse(
            owner -> System.out.println("TASK-102 当前负责人：" + owner),
            () -> System.out.println("TASK-102 当前没有负责人")
        );
        System.out.println("TASK-404 是否缺失：" + findTask(tasks, "TASK-404").isEmpty());
    }

    /**
     * 按编号查找任务；未命中时返回 empty。
     */
    private static Optional<Task> findTask(List<Task> tasks, String taskId) {
        return tasks.stream()
            .filter(task -> task.getId().equals(taskId))
            .findFirst();
    }

    /**
     * 查找任务负责人；任务或负责人缺失时返回 empty。
     */
    private static Optional<String> findOwner(List<Task> tasks, String taskId) {
        return findTask(tasks, taskId)
            .flatMap(task -> Optional.ofNullable(task.getOwner()))
            .map(String::trim)
            .filter(owner -> !owner.isEmpty());
    }

    private static final class Task {
        private final String id;
        private final String title;
        private final String owner;

        /**
         * 创建一条固定的 TeamFlow 任务。
         */
        private Task(String id, String title, String owner) {
            this.id = id;
            this.title = title;
            this.owner = owner;
        }

        /**
         * 返回任务编号。
         */
        private String getId() {
            return id;
        }

        /**
         * 返回任务标题。
         */
        private String getTitle() {
            return title;
        }

        /**
         * 返回可能缺失的旧负责人值。
         */
        private String getOwner() {
            return owner;
        }
    }
}
```

在编辑器中右键 `TeamFlowOptionalApplication`，选择
`Run 'TeamFlowOptionalApplication.main()'`。运行配置顶部应显示 JDK 25，控制台应逐字输出：

```text
TASK-101 负责人：林夏
TASK-102 负责人：待分配
备用任务：TASK-103
已找到任务：TASK-101, TASK-103
TASK-102 当前没有负责人
TASK-404 是否缺失：true
```

### 2. 关键执行过程

1. `findTask` 用 Stream 查找第一个匹配编号，未命中自然得到 empty。
2. `findOwner` 用 `flatMap` 接入可空的旧负责人字段，再清理空白；任务不存在和负责人
   缺失都会得到一层 Optional。
3. `TASK-101` 按合同必须有负责人，所以使用无参 `orElseThrow()`；`TASK-102` 允许
   暂未分配，所以使用 `orElseGet` 生成显示值。
4. 主编号 `TASK-404` 未命中后，`or` 才查询备用的 `TASK-103`。
5. `Optional::stream` 删除查询中的 empty，只把两条命中任务交给后续 Stream。
6. `ifPresentOrElse` 显式执行无负责人分支，`isEmpty` 则验证任务确实未命中。

`Task.title` 虽然没有进入本次输出，但它让示例仍是一条完整的 TeamFlow 任务，而不是只为
Optional 拼出的字符串。程序没有把正常缺失伪装成错误，也没有吞掉任何执行异常。

### 3. Java 8 版本

为兼容项目在 IDEA 中选择已安装的 JDK 8：Project SDK、Module SDK 和运行配置的 JRE 都应指向同一
个 JDK 8。不要只切换终端或只切换 Project SDK。创建独立目录中的同名
`TeamFlowOptionalApplication.java`，使用下面的完整代码：

```java
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public final class TeamFlowOptionalApplication {
    /**
     * 启动 Java 8 兼容的 TeamFlow 任务查询示例。
     */
    public static void main(String[] args) {
        List<Task> tasks = Arrays.asList(
            new Task("TASK-101", "准备项目周报", "林夏"),
            new Task("TASK-102", "整理评审记录", null),
            new Task("TASK-103", "确认发布清单", "周航")
        );

        String requiredOwner = findOwner(tasks, "TASK-101").orElseThrow(
            () -> new IllegalStateException("TASK-101 负责人必须存在")
        );
        String displayOwner = findOwner(tasks, "TASK-102").orElseGet(() -> "待分配");
        Task backupTask = firstPresent(
            findTask(tasks, "TASK-404"),
            () -> findTask(tasks, "TASK-103")
        ).orElseThrow(() -> new IllegalStateException("主任务和备用任务都不存在"));

        List<String> queryIds = Arrays.asList("TASK-101", "TASK-404", "TASK-103");
        String foundIds = queryIds.stream()
            .map(taskId -> findTask(tasks, taskId))
            .flatMap(TeamFlowOptionalApplication::optionalStream)
            .map(Task::getId)
            .collect(Collectors.joining(", "));

        System.out.println("TASK-101 负责人：" + requiredOwner);
        System.out.println("TASK-102 负责人：" + displayOwner);
        System.out.println("备用任务：" + backupTask.getId());
        System.out.println("已找到任务：" + foundIds);

        Optional<String> task102Owner = findOwner(tasks, "TASK-102");
        if (task102Owner.isPresent()) {
            System.out.println("TASK-102 当前负责人：" + task102Owner.get());
        } else {
            System.out.println("TASK-102 当前没有负责人");
        }
        System.out.println(
            "TASK-404 是否缺失：" + !findTask(tasks, "TASK-404").isPresent()
        );
    }

    /**
     * 按编号查找任务；未命中时返回 empty。
     */
    private static Optional<Task> findTask(List<Task> tasks, String taskId) {
        return tasks.stream()
            .filter(task -> task.getId().equals(taskId))
            .findFirst();
    }

    /**
     * 查找任务负责人；任务或负责人缺失时返回 empty。
     */
    private static Optional<String> findOwner(List<Task> tasks, String taskId) {
        return findTask(tasks, taskId)
            .flatMap(task -> Optional.ofNullable(task.getOwner()))
            .map(String::trim)
            .filter(owner -> !owner.isEmpty());
    }

    /**
     * 主结果缺失时惰性取得非 null 的备用 Optional。
     */
    private static <T> Optional<T> firstPresent(
        Optional<T> primary,
        Supplier<Optional<T>> fallback
    ) {
        Objects.requireNonNull(primary, "primary");
        Objects.requireNonNull(fallback, "fallback");
        if (primary.isPresent()) {
            return primary;
        }
        return Objects.requireNonNull(fallback.get(), "fallback result");
    }

    /**
     * 把 Java 8 Optional 转成零个或一个元素的 Stream。
     */
    private static <T> Stream<T> optionalStream(Optional<T> optional) {
        return optional.map(Stream::of).orElseGet(Stream::empty);
    }

    private static final class Task {
        private final String id;
        private final String title;
        private final String owner;

        /**
         * 创建一条固定的 TeamFlow 任务。
         */
        private Task(String id, String title, String owner) {
            this.id = id;
            this.title = title;
            this.owner = owner;
        }

        /**
         * 返回任务编号。
         */
        private String getId() {
            return id;
        }

        /**
         * 返回任务标题。
         */
        private String getTitle() {
            return title;
        }

        /**
         * 返回可能缺失的旧负责人值。
         */
        private String getOwner() {
            return owner;
        }
    }
}
```

右键运行入口并确认运行配置显示 JDK 8。预期控制台输出与 JDK 25 版本完全一致：

```text
TASK-101 负责人：林夏
TASK-102 负责人：待分配
备用任务：TASK-103
已找到任务：TASK-101, TASK-103
TASK-102 当前没有负责人
TASK-404 是否缺失：true
```

Java 8 中受控的 `isPresent()` 分支后调用 `get()`，不会读取 empty；它只是
`ifPresentOrElse` 的兼容实现，不是现代主线推荐写法。`firstPresent` 保持备用查询惰性，并像
`or` 一样拒绝 `null` supplier 和 `null` 结果；`optionalStream` 则补出
`Optional.stream()` 的零或一个元素语义。

### 4. 两个版本的差异落点

| 能力 | JDK 25 | Java 8 |
| --- | --- | --- |
| 创建、filter、map、flatMap | 直接使用 | 直接使用 |
| 两分支动作 | `ifPresentOrElse` | `isPresent()` 后受控分支 |
| 惰性备用 Optional | `or` | `firstPresent` 辅助方法 |
| 接入 Stream | `Optional.stream()` | `optionalStream` 辅助方法 |
| 判断 empty | `isEmpty()` | `!isPresent()` |
| 缺失即抛异常 | 可用无参或 supplier 版 `orElseThrow` | 只能使用 supplier 版 |

JDK 25 与 Java 8 都支持本课核心创建和转换方法。新增方法的真实版本分别是：Java 9 提供
`ifPresentOrElse`、`or` 和 `stream`，Java 10 提供无参 `orElseThrow()`，Java 11
提供 `isEmpty()`。不要把这些方法直接复制进 Java 8 项目。

## 六、练习：选择任务负责人

### 1. 任务与验收

:::exercise
### TeamFlow 负责人备用查询

**要求：** 创建 `TeamFlowOwnerFallbackApplication`。准备负责人为 `林夏` 的
`TASK-201` 和负责人为 `null` 的 `TASK-202`；先查 `TASK-202` 的负责人，缺失
时再惰性查询 `TASK-201`。再查询 `TASK-201`、`TASK-404` 和 `TASK-202`，
使用 Optional 与 Stream 统计命中编号和未命中数量。JDK 25 使用 `or` 与
`Optional.stream()`，Java 8 使用带 null 校验的同类型查询辅助方法。Optional 变量和返回值
自身都不为 `null`；不无条件调用 `get()`，不把异常改写成 empty。

**验收：**

```text
首选负责人：林夏
已命中任务：TASK-201, TASK-202
未命中任务数：1
```

**参考答案：** 两个版本的完整参考实现见后续小节。先独立完成，再对照备用查询的惰性行为和
Optional 到 Stream 的转换。
:::

### 2. JDK 25 参考实现

```java
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public final class TeamFlowOwnerFallbackApplication {
    /**
     * 运行负责人备用查询练习。
     */
    public static void main(String[] args) {
        List<Task> tasks = Arrays.asList(
            new Task("TASK-201", "复核需求清单", "林夏"),
            new Task("TASK-202", "准备演示环境", null)
        );

        String selectedOwner = findOwner(tasks, "TASK-202")
            .or(() -> findOwner(tasks, "TASK-201"))
            .orElseGet(() -> "待分配");

        List<String> queryIds = Arrays.asList("TASK-201", "TASK-404", "TASK-202");
        String foundIds = queryIds.stream()
            .map(taskId -> findTask(tasks, taskId))
            .flatMap(Optional::stream)
            .map(Task::getId)
            .collect(Collectors.joining(", "));
        long missingCount = queryIds.stream()
            .map(taskId -> findTask(tasks, taskId))
            .filter(Optional::isEmpty)
            .count();

        System.out.println("首选负责人：" + selectedOwner);
        System.out.println("已命中任务：" + foundIds);
        System.out.println("未命中任务数：" + missingCount);
    }

    /**
     * 按编号查找任务。
     */
    private static Optional<Task> findTask(List<Task> tasks, String taskId) {
        return tasks.stream()
            .filter(task -> task.getId().equals(taskId))
            .findFirst();
    }

    /**
     * 查找任务负责人。
     */
    private static Optional<String> findOwner(List<Task> tasks, String taskId) {
        return findTask(tasks, taskId)
            .flatMap(task -> Optional.ofNullable(task.getOwner()))
            .map(String::trim)
            .filter(owner -> !owner.isEmpty());
    }

    private static final class Task {
        private final String id;
        private final String title;
        private final String owner;

        /**
         * 创建练习任务。
         */
        private Task(String id, String title, String owner) {
            this.id = id;
            this.title = title;
            this.owner = owner;
        }

        /**
         * 返回任务编号。
         */
        private String getId() {
            return id;
        }

        /**
         * 返回任务标题。
         */
        private String getTitle() {
            return title;
        }

        /**
         * 返回可能缺失的负责人。
         */
        private String getOwner() {
            return owner;
        }
    }
}
```

### 3. Java 8 参考实现

```java
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public final class TeamFlowOwnerFallbackApplication {
    /**
     * 运行 Java 8 兼容的负责人备用查询练习。
     */
    public static void main(String[] args) {
        List<Task> tasks = Arrays.asList(
            new Task("TASK-201", "复核需求清单", "林夏"),
            new Task("TASK-202", "准备演示环境", null)
        );

        String selectedOwner = firstPresent(
            findOwner(tasks, "TASK-202"),
            () -> findOwner(tasks, "TASK-201")
        ).orElseGet(() -> "待分配");

        List<String> queryIds = Arrays.asList("TASK-201", "TASK-404", "TASK-202");
        String foundIds = queryIds.stream()
            .map(taskId -> findTask(tasks, taskId))
            .flatMap(TeamFlowOwnerFallbackApplication::optionalStream)
            .map(Task::getId)
            .collect(Collectors.joining(", "));
        long missingCount = queryIds.stream()
            .map(taskId -> findTask(tasks, taskId))
            .filter(optional -> !optional.isPresent())
            .count();

        System.out.println("首选负责人：" + selectedOwner);
        System.out.println("已命中任务：" + foundIds);
        System.out.println("未命中任务数：" + missingCount);
    }

    /**
     * 按编号查找任务。
     */
    private static Optional<Task> findTask(List<Task> tasks, String taskId) {
        return tasks.stream()
            .filter(task -> task.getId().equals(taskId))
            .findFirst();
    }

    /**
     * 查找任务负责人。
     */
    private static Optional<String> findOwner(List<Task> tasks, String taskId) {
        return findTask(tasks, taskId)
            .flatMap(task -> Optional.ofNullable(task.getOwner()))
            .map(String::trim)
            .filter(owner -> !owner.isEmpty());
    }

    /**
     * 主结果缺失时惰性取得非 null 的备用 Optional。
     */
    private static <T> Optional<T> firstPresent(
        Optional<T> primary,
        Supplier<Optional<T>> fallback
    ) {
        Objects.requireNonNull(primary, "primary");
        Objects.requireNonNull(fallback, "fallback");
        if (primary.isPresent()) {
            return primary;
        }
        return Objects.requireNonNull(fallback.get(), "fallback result");
    }

    /**
     * 把 Java 8 Optional 转成零个或一个元素的 Stream。
     */
    private static <T> Stream<T> optionalStream(Optional<T> optional) {
        return optional.map(Stream::of).orElseGet(Stream::empty);
    }

    private static final class Task {
        private final String id;
        private final String title;
        private final String owner;

        /**
         * 创建练习任务。
         */
        private Task(String id, String title, String owner) {
            this.id = id;
            this.title = title;
            this.owner = owner;
        }

        /**
         * 返回任务编号。
         */
        private String getId() {
            return id;
        }

        /**
         * 返回任务标题。
         */
        private String getTitle() {
            return title;
        }

        /**
         * 返回可能缺失的负责人。
         */
        private String getOwner() {
            return owner;
        }
    }
}
```

在对应 Project SDK 下分别运行入口。两版的 `TASK-202` 负责人都为空，因此备用查询只在需要
时读取 `TASK-201`；三次任务查询命中两次、未命中一次，输出应与验收文本完全一致。

## 七、完成本课后的判断顺序

### 1. 从结果含义选择操作

遇到可能缺失的单值查询时，按这个顺序判断：

1. 方法是否正常完成，只是允许没有一个结果？是则考虑返回 `Optional<T>`。
2. 值来自确定非 `null` 的边界、可空旧边界，还是已知缺失？分别选择 `of`、
   `ofNullable`、`empty`。
3. 后续函数返回普通值还是 Optional？分别选择 `map` 或 `flatMap`。
4. 缺失时要使用常量、延迟计算、继续备用查询，还是抛出有语义的异常？分别选择 `orElse`、
   `orElseGet`、`or` 或 `orElseThrow`。
5. 当前源码必须运行在 Java 8 吗？若是，替换本课表格列出的现代增量 API，并重新编译完整程序。

能对 TeamFlow 的命中、未命中、负责人缺失和执行失败分别给出明确合同，并在两个 JDK 版本下得到
规定输出，就完成了本课。
