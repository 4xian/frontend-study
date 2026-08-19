---
id: backend.java.learn.basics.annotations-and-metadata
type: lesson
title: 注解、元注解与运行时元数据
summary: 声明受约束的注解合同，并在需要时用运行时反射读取可靠的元数据
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 75
prerequisites:
  - backend.java.learn.basics.generics-and-type-safety
objectives:
  - 能声明注解接口并为元素选择合法类型和默认值。
  - 能用 Target、Retention、Documented 和 Inherited 表达注解的使用合同。
  - 能区分直接声明、继承查询和运行时不可见的注解。
  - 能通过 AnnotatedElement 读取类、方法和参数上的运行时元数据。
  - 能识别项目中无效的参数继承写法，并把框架注解与 Java 语言合同分开。
recap:
  - 注解是附着在程序元素上的元数据，不会因为声明了注解就自动执行处理逻辑。
  - 注解元素只能返回基本类型、String、Class、枚举、注解或这些类型的一维数组。
  - Target 限定可以标注的上下文，Retention 决定 source、class 或 runtime 可见性。
  - Documented 只影响公共文档，Inherited 只沿类的超类链生效。
  - getAnnotation 可以进行继承查询，getDeclaredAnnotation 只看当前元素的直接声明。
  - Java 8 与 Java 25 的本课核心合同一致，Spring Boot 2.3.12.RELEASE 只作为项目背景。
related: []
tags:
  - Java
  - 注解
  - 元注解
  - 运行时元数据
  - 反射
appliesTo: Java 25；dzzz-app 补充适用于 Java 8 / Spring Boot 2.3.12.RELEASE
modernBaseline:
  java: "25"
legacyBaseline:
  java: "8"
  springBoot: 2.3.12.RELEASE
verifiedAt: 2026-08-15
sources:
  - id: java-se-25-ri
    title: Java SE 25 Reference Implementations
    url: https://jdk.java.net/java-se-ri/25
    sourceType: official-reference
    appliesTo: Java SE 25
    claims:
      - Java SE 25 官方参考实现基于 OpenJDK JDK 25 项目，并已通过 Java Community Process 批准。
  - id: oracle-java-roadmap
    title: Oracle Java SE Support Roadmap
    url: https://www.oracle.com/java/technologies/java-se-support-roadmap.html
    sourceType: official-reference
    appliesTo: Java SE 25
    claims:
      - Java 25 被 Oracle 列为 LTS 版本。
  - id: dev-java-annotations
    title: Dev.java Annotations
    url: https://dev.java/learn/annotations/
    sourceType: official-reference
    appliesTo: 当前 Dev.java / Java 25
    claims:
      - 注解是附着在程序元素上的元数据，可以声明、使用并通过反射读取。
  - id: jls25-annotations
    title: Java Language Specification 25 - Chapter 9
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html
    sourceType: specification
    appliesTo: Java 25
    claims:
      - 注解接口元素的声明、允许返回类型、默认值和使用语法。
      - Target、Retention、Inherited 的语言合同及编译期合法性。
  - id: jls8-annotations
    title: Java Language Specification 8 - Chapter 9
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-9.html
    sourceType: specification
    appliesTo: Java 8
    claims:
      - Java 8 的注解声明、默认值、目标、保留和继承规则。
  - id: api25-annotated-element
    title: AnnotatedElement - Java SE 25
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/reflect/AnnotatedElement.html
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - 运行时反射查询直接声明或继承得到的注解。
  - id: api8-annotated-element
    title: AnnotatedElement - Java SE 8
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/AnnotatedElement.html
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 已提供本课所需的 AnnotatedElement 查询方法。
  - id: api25-retention-policy
    title: RetentionPolicy - Java SE 25
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/annotation/RetentionPolicy.html
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - SOURCE、CLASS、RUNTIME 的保留和运行时可见性边界。
  - id: api8-retention-policy
    title: RetentionPolicy - Java SE 8
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/annotation/RetentionPolicy.html
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 的三种注解保留策略。
  - id: api25-target
    title: Target - Java SE 25
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/annotation/Target.html
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - Target 指定注解接口可出现的声明或类型上下文，编译器负责执行限制。
  - id: api25-inherited
    title: Inherited - Java SE 25
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/annotation/Inherited.html
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - Inherited 只沿类声明的超类链查询，不作用于接口、字段、方法或参数。
  - id: api25-documented
    title: Documented - Java SE 25
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/annotation/Documented.html
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - Documented 影响公共文档，不替代 Runtime 保留策略。
projectEvidence:
  - file: dzzz-app/src/main/java/com/tdh/bdzz/annoation/AutoValid.java
    symbol: com.tdh.bdzz.annoation.AutoValid
    usage: corrected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/annoation/AutowiredShardData.java
    symbol: com.tdh.bdzz.annoation.AutowiredShardData
    usage: corrected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/annoation/CltjrSf.java
    symbol: com.tdh.bdzz.annoation.CltjrSf
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/DzzzAreaApplication.java
    symbol: com.tdh.DzzzAreaApplication
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/ValidatorUtil.java
    symbol: com.tdh.bdzz.util.ValidatorUtil
    usage: corrected
---

# 注解、元注解与运行时元数据

## 为什么需要学习

后端代码经常需要在不改变方法参数的情况下附加“这个方法做什么”“这个参数需要什么处理”或“这个类是否
是入口”的信息。注解把这些信息挂在类、字段、方法或参数上，让编译器、文档工具或运行时组件可以按同一
个声明读取。它本身不是隐藏的控制流：只有明确的处理器读取并解释注解，才会产生行为。

如果把这些信息散落在字符串、命名约定或手写注册表中，声明和处理逻辑容易分离。本课先建立 Java 语言与
标准反射的最小合同，后续 Spring、Validation 和 MyBatis 课程再分别核验它们的框架处理规则。

## 学习目标

- 声明一个带元素和默认值的注解接口，并解释元素类型限制。
- 使用 `@Target`、`@Retention`、`@Documented` 和 `@Inherited` 表达不同的元数据合同。
- 区分 `getAnnotation` 与 `getDeclaredAnnotation` 的直接声明和继承查询边界。
- 通过 `Class`、`Method` 和参数读取运行时注解。
- 将 `dzzz-app` 中的参数注解和反射校验代码作为观察或纠正证据，而不是框架推荐答案。

## 前置术语

前序课程已经介绍接口、抽象类型和泛型合同。本课新增四个术语：

- **注解接口**：以 `@interface` 声明、由元素方法描述配置形状的特殊接口。
- **注解元素**：注解接口中无参数的方法声明，例如 `String value()`。
- **元注解**：标注在注解接口上的注解，用来限制目标、保留策略或文档语义。
- **运行时元数据**：被 `RetentionPolicy.RUNTIME` 保留、能够由反射 API 查询的注解信息。

## 零基础知识点详解

### 注解接口与元素是什么

注解类型使用 `@interface` 声明，元素看起来像无参数方法。元素类型只能来自规范允许的有限集合，例如
primitive、String、Class、enum、annotation 以及这些类型的一维数组。

```java
public @interface CourseInfo {
    String name();
    int level() default 1;
}
```

使用 `@CourseInfo(name = "Java")` 时，`name` 必须提供，`level` 可使用默认值。默认值属于注解类型声明，
不是每个使用点重新计算的普通 Java 表达式。

### `@Target` 限制能标在哪里

`@Target` 声明允许的程序位置，例如 `TYPE`、`METHOD`、`FIELD`、`PARAMETER`。它在编译期阻止把注解放到
不支持的位置，等于给注解本身定义使用合同。

若省略 `@Target`，注解并不是“只能放在类上”，而是可用于多个声明上下文；设计公共注解时通常应显式
限制，避免调用者误用。

### `@Retention` 决定能保留多久

`SOURCE` 只保留在源码处理阶段，class file 中不要求存在；`CLASS` 写入 class file，但运行时反射不必
可见；`RUNTIME` 保留到运行期，可通过反射读取。

需要运行期框架读取的注解必须选择 `RUNTIME`。把 retention 写成 RUNTIME 只代表“数据可被读取”，并
不会自动执行校验、路由或事务逻辑；仍需要处理器或框架代码解释它。

### `@Documented` 与 `@Inherited` 的边界

`@Documented` 表示工具生成 API 文档时应考虑展示该注解。`@Inherited` 只影响类上的注解通过
`Class.getAnnotation` 向子类查询的行为，不会让方法、字段或参数注解自动继承。

覆写方法也不会凭语言规则自动继承父方法的注解。框架若提供“合并查找”，那是框架额外合同，必须与
Java 反射原生行为分开说明。

### 直接声明、继承查询与运行时不可见

`getDeclaredAnnotation` 只看当前元素直接声明；`getAnnotation` 对类查询时还可能考虑 `@Inherited`。
如果注解不是 RUNTIME retention，这两种运行时查询都不能把它读出来。

判断“没有注解”前先确认三个问题：查的是哪个元素、用的是 declared 还是 inherited 查询、注解是否保留
到运行期。

### 用 `AnnotatedElement` 读取元数据

Class、Method、Field、Constructor 和 Parameter 都实现 `AnnotatedElement`。先取得正确反射对象，再按
注解类型查询：

```java
CourseInfo info = CoursePage.class.getAnnotation(CourseInfo.class);
if (info != null) {
    System.out.println(info.name());
}
```

反射读取只得到元数据值，不等于已经执行业务逻辑。生产代码还要决定缺失时的合同、重复注解如何处理，
以及是否允许访问非公开成员。

## 现代版本中的正确用法

先声明一个有明确目标和运行时保留策略的类型标签：

```java
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 给类型附加可在运行时读取的标签。
 */
@Documented
@Inherited
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface RuntimeLabel {
    /**
     * 返回标签文本。
     */
    String value();

    /**
     * 返回是否启用标签。
     */
    boolean enabled() default true;
}
```

使用时，只有没有默认值的元素必须显式提供：

```java
/**
 * 用于展示继承查询行为的父类。
 */
@RuntimeLabel("order")
class BaseHandler {
}

/**
 * 没有直接声明标签的子类。
 */
final class ChildHandler extends BaseHandler {
}
```

`value` 是唯一元素时可以使用 `@RuntimeLabel("order")` 的简写；存在多个元素时使用命名形式，例如
`@RuntimeLabel(value = "order", enabled = false)`。元素值必须是编译期可表示的基本值、字符串、类字面量、
枚举常量、嵌套注解或这些类型的一维数组，不能传入 `null`、集合或任意运行时对象。

## 基本语法或核心接口

**`Target`：限定可标注上下文**

`@Target` 的 `ElementType` 数组是注解的使用边界。`TYPE`、`FIELD`、`METHOD` 和 `PARAMETER` 分别覆盖
类型、字段、方法和参数声明；需要多个位置时显式列出多个常量。省略 `@Target` 并不表示“运行时更灵活”，而是
采用规范允许的更宽声明上下文。

```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 只允许标注方法参数。
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.PARAMETER)
@interface ParameterLabel {
    /**
     * 返回参数标签。
     */
    String value();
}
```

把 `@ParameterLabel("id")` 写在类或方法上会在编译期失败。这是值得保留的合同：错误位置在编译时暴露，
不用等运行时处理器才能发现。

**`Retention`：决定元数据能看到多久**

`SOURCE` 只在源代码阶段可见，`CLASS` 可以进入 class 文件但不保证运行时反射可见，`RUNTIME` 才要求
Java SE 运行时反射库提供查询结果。没有显式 `@Retention` 时，规范按 `CLASS` 处理，因此“注解写在源码里”
并不等于“`getAnnotation` 一定能拿到”。

**`Documented`：公共文档合同**

`@Documented` 表示使用该注解的声明应出现在生成的公共文档中。它不改变 class 文件保留，也不让运行时反射
自动看见注解。需要两种语义时应分别写 `@Documented` 和 `@Retention(RUNTIME)`。

**`Inherited`：只有类超类链**

`@Inherited` 只在注解目标是类声明、查询对象是子类类声明且子类没有直接注解时，沿超类链查找。它不作用于
接口实现，也不复制字段、方法或参数上的注解。参数注解即使写上 `@Inherited`，也不会跨方法签名继承。

**`AnnotatedElement`：读取运行时元数据**

`Class`、`Field`、`Method`、构造器和参数等反射对象都实现 `AnnotatedElement`。优先选择最具体的查询：

```java
import java.lang.annotation.Annotation;
import java.lang.reflect.AnnotatedElement;

/**
 * 读取处理器类型上的标签文本。
 */
final class LabelReader {
    /**
     * 读取直接或由 Inherited 查询到的标签。
     */
    static String read(Class<?> type) {
        RuntimeLabel label = type.getAnnotation(RuntimeLabel.class);
        return label == null ? "missing" : label.value();
    }

    /**
     * 判断类型是否直接声明了标签，不触发超类查询。
     */
    static boolean isDeclared(Class<?> type) {
        return type.getDeclaredAnnotation(RuntimeLabel.class) != null;
    }

    /**
     * 返回指定元素上直接存在的注解数量。
     */
    static int declaredCount(AnnotatedElement element) {
        Annotation[] annotations = element.getDeclaredAnnotations();
        return annotations.length;
    }
}
```

`getAnnotation` 和 `isAnnotationPresent` 可以包含 `@Inherited` 的超类查询；`getDeclaredAnnotation` 和
`getDeclaredAnnotations` 只看当前元素直接声明的注解。对字段、方法和参数，不要把“类继承”误解成“成员
继承”。读取结果应在元数据边界立即转成明确的业务结果或错误，而不是让缺失值在更深层变成无上下文的
`NullPointerException`。

## 从零跟着做

先验证注解能写在哪里、能保留多久，再学习反射读取。这样不会把注解误解成“写上就自动执行业务”。

1. 把 `ParameterLabel` 放入同名文件，再写一个方法，把 `@ParameterLabel("id")` 标在它的参数上。
   编译通过说明 `@Target(ElementType.PARAMETER)` 与使用位置一致。
2. 把同一注解临时标在类上，重新编译并观察“不适用于此种声明”的错误，然后恢复。这一步证明
   `Target` 是编译期合同。
3. 使用本课的 `RuntimeLabel` 和 `LabelReader` 示例，给一个类加标签，在入口中调用 `read`，确认能
   读到 `value`。
4. 把 `RetentionPolicy.RUNTIME` 暂时改为 `CLASS`，重新编译和运行，观察反射读不到标签；然后恢复。
5. 分别对父类和子类调用 `getAnnotation`、`getDeclaredAnnotation`，记录结果，确认 `@Inherited`
   只影响类的超类链查询。

把需要一起编译的 `.java` 文件放在同一练习目录，运行 `javac -encoding UTF-8 *.java`，再运行入口类。
完成标准是：你能说清 `Target`、`Retention`、`Documented`、`Inherited` 各控制什么，也能说明
注解只是元数据，真正的行为来自读取并处理它的代码。

## 如何使用

1. 先问清注解附着在哪一种声明或类型上下文，再写最窄的 `@Target`。
2. 需要编译期工具读取时选择 `CLASS`，需要运行时反射时显式选择 `RUNTIME`。
3. 为真正可选的配置提供 `default`，必填元素不提供默认值，让编译器检查调用方。
4. 只在类型声明的超类继承确实是合同的一部分时使用 `@Inherited`。
5. 读取时根据查询目的选择 `getDeclaredAnnotation` 或 `getAnnotation`，并记录直接/继承语义。
6. 让框架处理器的行为留在框架课程中，不从一个 Java 注解声明推断 Spring 或 Validation 的执行过程。

## 适用与不适用场景

适用场景是稳定、低频变化的声明式元数据，例如标记入口、声明参数角色、描述可观测动作或为工具提供
编译期信息。注解元素适合小型、受约束的配置，不适合承载动态请求状态、集合型业务数据或需要复杂校验的
对象图。

不适用的做法包括用注解替代所有显式参数、把运行期可变计数保存到注解相关的单例状态、在没有 `RUNTIME`
的情况下假设反射可读，以及用 `@Inherited` 解决方法或接口的多态配置。注解只是声明；复杂行为仍需一个
有清晰输入输出的处理器。

## 当前项目补充

冻结的 `dzzz-app` 快照为 `167ca8aa91ca3a6b101246964ef4fddec3d21da0`，五个代表文件与 inventory 的 SHA
逐项匹配：

| 文件 | 观察结果 | 课程处理 |
| --- | --- | --- |
| `annoation/AutoValid.java` | 参数目标、`RUNTIME`、布尔默认值，并带有对参数无效的 `@Inherited` | `corrected`：保留目标和运行时读取，移除无效继承假设 |
| `annoation/AutowiredShardData.java` | 参数注解包含布尔、字符串和 `Class` 元素 | `corrected`：只说明元素类型和读取形状，不复制框架注入语义 |
| `annoation/CltjrSf.java` | 字段/注解类型目标、`RUNTIME` 和多个默认元素 | `observed`：只证明项目使用自定义运行时元数据 |
| `DzzzAreaApplication.java` | 启动类集中声明多个类型级框架注解 | `observed`：只作为注解广泛用于入口配置的场景证据 |
| `util/ValidatorUtil.java` | 通过 `Field.getDeclaredAnnotations()` 再读取注解上的 `@Constraint` | `corrected`：保留两级元数据查询路径，不复制旧式可访问性修改、异常吞没或实例化方式 |

项目路径中的 `annoation` 拼写属于冻结源码事实，课程不修正它。Spring、Springfox、Bean Validation 和
MyBatis 的具体注解处理行为需要按精确版本的官方 Reference、Javadoc、源码和测试另行核验，本课不把它们
包装为 Java 语言规则。

## Java 8 兼容写法

项目补充线使用 Java 8 可编译的同一组声明和反射 API：

```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Java 8 兼容的参数标签。
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.PARAMETER)
public @interface LegacyParameterLabel {
    /**
     * 返回参数标签。
     */
    String value();
}

/**
 * 使用 Java 8 参数标签的服务。
 */
final class LegacyService {
    /**
     * 接受一个带运行时标签的参数。
     */
    void execute(@LegacyParameterLabel("case-id") String caseId) {
        // 读取逻辑由下方的反射反馈环验证。
    }
}
```

本课不为 Java 8 补充引入记录类、模式匹配或新 `ElementType` 常量；Java 25 主线与项目 legacy 线共享
`@interface`、元注解和 `AnnotatedElement` 的核心合同。

## 新旧版本差异

| 对比项 | Java 25 现代主线 | Java 8 / dzzz-app 补充 | 迁移结论 |
| --- | --- | --- | --- |
| 规范术语 | JLS 使用 `annotation interface` | JLS 使用 `annotation type` | 术语变化，不改变入门语法 |
| 声明目标 | 本课使用 Java 8 已有的 TYPE、FIELD、METHOD、PARAMETER | 相同目标可用 | 保持稳定子集，不引入新目标常量 |
| 反射查询 | `AnnotatedElement` 具备直接/继承查询 | 同样具备本课所需方法 | 同一反馈环双版本运行 |
| 框架版本 | Java 25 不绑定某个框架 | Spring Boot 2.3.12.RELEASE 仅为项目背景 | 框架注解处理另行研究 |

## 易错点

:::pitfalls
### 省略 Retention 却期待运行时反射

**触发条件：** 注解没有 `@Retention`，或使用 `SOURCE`/`CLASS`，随后调用 `getAnnotation`。

**原因：** JLS 规定缺省策略是 `CLASS`；只有 `RUNTIME` 要求运行时反射库提供注解。

**后果：** 处理器把“运行时不可见”误判成“没有配置”，行为静默跳过。

**错误示例：**

```java
/**
 * 错误：没有声明运行时保留策略。
 */
@interface ClassOnlyTag {
    /**
     * 返回标签文本。
     */
    String value();
}
```

**正确写法：**

```java
/**
 * 正确：显式声明运行时保留。
 */
@Retention(RetentionPolicy.RUNTIME)
@interface RuntimeTag {
    /**
     * 返回标签文本。
     */
    String value();
}
```

**验证方式：** 双版本反馈环分别检查 `RUNTIME` 与缺省 `CLASS` 的反射结果。
:::

:::pitfalls
### 把 `@Inherited` 当作成员或接口继承

**触发条件：** 给参数、字段或方法注解添加 `@Inherited`，并期待子类、实现类或重写方法自动得到它。

**原因：** API 合同只允许类声明查询沿超类链查找，接口和成员不在该语义内。

**后果：** 授权、校验或路由处理器在子类成员上读到 `null`。

**错误示例：**

```java
@RuntimeTag("contract")
interface TaggedContract {
}

final class TaggedImplementation implements TaggedContract {
}
```

**正确写法：**

```java
@RuntimeTag("base")
class TaggedBase {
}

final class TaggedChild extends TaggedBase {
}
```

**验证方式：** 反馈环同时查询父类/子类、接口/实现和方法参数。
:::

:::pitfalls
### 把 `Documented` 当成运行时开关

**触发条件：** 只添加 `@Documented`，未添加 `@Retention(RUNTIME)`，随后希望反射读取。

**原因：** `Documented` 只影响公共文档生成，不改变 class 文件或 VM 的保留策略。

**后果：** API 文档有注解，运行时处理器却看不到它。

**错误示例：**

```java
@Documented
@interface DocumentedOnly {
}
```

**正确写法：**

```java
@Documented
@Retention(RetentionPolicy.RUNTIME)
@interface DocumentedRuntimeTag {
}
```

**验证方式：** 反馈环只以 `RUNTIME` 反射结果作为运行时断言。
:::

:::pitfalls
### 省略无默认值的元素

**触发条件：** 使用没有 `default` 的注解元素，却在使用处省略值。

**原因：** 注解元素和接口方法一样是声明合同，编译器要求调用方提供必填元素。

**后果：** 编译失败，不能等运行时处理器再补配置。

**错误示例：**

```java
@RequiredTag
final class MissingRequiredValue {
}
```

**正确写法：**

```java
@RequiredTag("sync")
final class ExplicitRequiredValue {
}
```

**验证方式：** 负向源码在 Java 25 和 Java 8 中都必须以非零退出。
:::

## 如何验证

以下反馈环只在固定 Java 25/Java 8 容器内的 `/tmp` 临时目录创建源码、class 和日志；退出时清理整个
目录。它覆盖运行时读取、缺省 `CLASS`、`@Inherited` 的类边界、方法与参数注解，以及两个编译失败案例：

```bash
set -euo pipefail

run_annotation_feedback() {
  image_ref=$1
  docker run --rm -i "$image_ref" bash -s <<'CONTAINER'
set -euo pipefail
workspace=$(mktemp -d /tmp/java-annotation-feedback.XXXXXX)
trap 'find "$workspace" -depth -delete' EXIT
mkdir -p "$workspace/src/demo" "$workspace/classes"

cat > "$workspace/src/demo/AnnotationFeedback.java" <<'JAVA'
package demo;

import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.reflect.Method;

/**
 * 运行时可读取的类型、参数标签。
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.PARAMETER})
@Inherited
@interface RuntimeTag {
    /**
     * 返回标签文本。
     */
    String value();
}

/**
 * 未声明保留策略，验证缺省 CLASS 不保证运行时可见。
 */
@Target(ElementType.TYPE)
@interface ClassTag {
    /**
     * 返回缺省标签文本。
     */
    String value();
}

/**
 * 只允许方法声明的标签。
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface MethodTag {
    /**
     * 返回方法标签文本。
     */
    String value();
}

/**
 * 提供带方法标签的父类。
 */
@RuntimeTag("parent")
class Parent {
    /**
     * 接受一个带运行时标签的参数。
     */
    @MethodTag("execute")
    public void execute(@RuntimeTag("parameter") String value) {
    }
}

/**
 * 继承父类但不直接声明运行时标签的子类。
 */
@ClassTag("class-file-only")
class Child extends Parent {
}

/**
 * 运行注解反射反馈环。
 */
public final class AnnotationFeedback {
    /**
     * 输出类、成员和参数的反射观察结果。
     */
    public static void main(String[] args) throws Exception {
        Method method = Parent.class.getDeclaredMethod("execute", String.class);
        boolean inherited = Child.class.isAnnotationPresent(RuntimeTag.class);
        boolean declared = Child.class.getDeclaredAnnotation(RuntimeTag.class) != null;
        boolean classOnly = Child.class.getDeclaredAnnotation(ClassTag.class) != null;
        boolean methodFound = method.isAnnotationPresent(MethodTag.class);
        boolean parameterFound = method.getParameters()[0].isAnnotationPresent(RuntimeTag.class);
        System.out.println(
                "class=" + inherited
                        + "|declared=" + declared
                        + "|classOnly=" + classOnly
                        + "|method=" + methodFound
                        + "|parameter=" + parameterFound);
    }
}
JAVA

cat > "$workspace/src/demo/WrongTarget.java" <<'JAVA'
package demo;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 只允许方法使用的测试注解。
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface MethodOnly {
    /**
     * 返回测试标签。
     */
    String value();
}

/**
 * 错误：把方法注解放到了类型声明上。
 */
@MethodOnly("wrong")
public final class WrongTarget {
}
JAVA

cat > "$workspace/src/demo/MissingValue.java" <<'JAVA'
package demo;

import java.lang.annotation.ElementType;
import java.lang.annotation.Target;

/**
 * 没有默认值的必填元素。
 */
@Target(ElementType.TYPE)
@interface RequiredTag {
    /**
     * 返回必填标签。
     */
    String value();
}

/**
 * 错误：省略了没有默认值的元素。
 */
@RequiredTag
public final class MissingValue {
}
JAVA

javac -encoding UTF-8 -d "$workspace/classes" "$workspace/src/demo/AnnotationFeedback.java"
feedback_output=$(java -cp "$workspace/classes" demo.AnnotationFeedback)
test "$feedback_output" = 'class=true|declared=false|classOnly=false|method=true|parameter=true'

if javac -encoding UTF-8 -d "$workspace/classes" "$workspace/src/demo/WrongTarget.java" > "$workspace/wrong-target.log" 2>&1; then
  echo '错误目标注解不应编译通过' >&2
  exit 1
fi

if javac -encoding UTF-8 -d "$workspace/classes" "$workspace/src/demo/MissingValue.java" > "$workspace/missing-value.log" 2>&1; then
  echo '缺少必填注解元素不应编译通过' >&2
  exit 1
fi

javac -version
java -version
printf 'ANNOTATION_OK:%s\n' "$feedback_output"
printf 'WRONG_TARGET_REJECTED\n'
printf 'MISSING_VALUE_REJECTED\n'
CONTAINER
}

run_annotation_feedback \
  'eclipse-temurin@sha256:12e44624adee6808a36d962717e1656e0afeeeff5a100f9cb00e0136513558f0'
run_annotation_feedback \
  'eclipse-temurin@sha256:c8b86f2c0a9bd6cc1b7fabc5d1a097501a166eea7cad3b2764e90e96178bea9b'
```

两个容器都必须退出 0，并输出相同的 `ANNOTATION_OK`、`WRONG_TARGET_REJECTED` 和
`MISSING_VALUE_REJECTED`。负向案例只绑定非零退出，不绑定随 JDK 变化的诊断文本。

:::exercise
### 练习：声明可运行时读取的动作标签

**要求：** 声明 `ActionTag`，只允许标注方法，运行时保留；包含必填的 `String value()` 和带默认值的
`boolean enabled()`。再写一个反射方法读取 `value` 和 `enabled`，不要使用 `@Inherited` 解决方法继承。

**验收：** Java 25 与 Java 8 均能编译；正确标注的方法能读到值；把标签写到类上或省略 `value` 时编译
失败；未标注方法读取时返回明确的缺失结果。

**参考答案：** 复用 `MethodTag` 与 `AnnotationFeedback` 的结构，把 `@Target` 固定为
`ElementType.METHOD`，把 `@Retention` 固定为 `RUNTIME`，并用 `getDeclaredAnnotation` 检查直接声明。
:::

## 本节小结

- 注解接口声明元数据形状，注解元素只能使用规范允许的值类型。
- `Target` 管使用位置，`Retention` 管 source/class/runtime 可见性，`Documented` 管公共文档。
- `Inherited` 只沿类的超类链工作，不扩展到接口、字段、方法或参数。
- `AnnotatedElement` 提供直接声明与继承查询；先选对查询方法，再处理缺失语义。
- 项目中的框架注解只是场景证据，框架执行合同必须在后续精确版本课程中单独取证。
