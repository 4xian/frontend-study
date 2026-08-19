# 注解、元注解与运行时元数据研究记录

## 冻结课程合同

- `courseId`：`backend.java.learn.basics.annotations-and-metadata`
- `title`：注解、元注解与运行时元数据
- `purpose / collection / level / depth`：`learn / basics / beginner / lesson`
- `sequence`：`190`
- `estimatedMinutes`：`75`
- `prerequisites`：`[backend.java.learn.basics.generics-and-type-safety]`
- `related`：`[]`
- `sourceCapabilityIds`：`[JAVA-LANG-007]`
- `origin`：`[project-observed]`
- `selectionReason`：Spring、Validation、MyBatis 和项目自定义横切合同广泛使用注解。
- `projectEvidenceCount`：`3100`
- `representativeProjectEvidence`：`5` 个冻结代表文件
- `modernBaseline`：`Java 25 LTS`
- `legacyBaseline`：`Java 8 legacy supplement only`
- Phase 2 冻结状态：`researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`
- `snapshotId`：`dzzz-app-20260803-179e722831ab`
- `analysisId`：`dzzz-app-analysis-20260803-958d37cf1be1`

本课只覆盖声明和使用自定义注解、注解元素的允许类型和默认值、`@Target`、`@Retention`、
`@Documented`、`@Inherited` 这组元注解，以及通过 `AnnotatedElement` 读取类、字段、方法和参数上
运行时元数据的最小路径。重复注解、类型注解、注解处理器、框架代理、Bean Validation 合同和
框架扩展属于其他课程；泛型边界已由前置课程覆盖，本课不重复展开。项目中的框架注解只作为场景证据，
不把框架行为当作 Java 语言合同。

## 核验基线

| 项目 | 核验结果 |
| --- | --- |
| 核验日期 | 2026-08-15 |
| 现代主线 | Java 25 LTS；Java SE 25 RI 页面确认官方参考实现，Oracle 支持路线将 Java 25 列为 LTS |
| legacy 补充 | Java 8；Spring Boot 2.3.12.RELEASE 只作冻结项目背景 |
| 发现方式 | Tavily 只用于发现 Oracle、OpenJDK、JLS、Java SE API 与 Dev.java 候选，搜索摘要只作入口 |
| 最终证据 | JLS 25/8 Chapter 9、Java SE 25/8 `AnnotatedElement` 与 `java.lang.annotation` API |
| 项目快照 | `dzzz-app` 外部仓库 `HEAD` 为 `167ca8aa91ca3a6b101246964ef4fddec3d21da0`，目标路径工作区为空 |
| 验证设计 | 同一 Java 8 兼容源码在固定 Java 25 与 Java 8 工具链分别编译、运行；错误源码只放 `/tmp` |

Java 25 与 Java 8 在本课选择的声明、目标、保留策略和核心反射查询合同一致。Java 25 的 JLS 已统一
使用“annotation interface”术语，Java 8 页面使用“annotation type”；这只是规范术语演进，不改变本课
的入门语法。Java 25 额外拥有后续版本的 `ElementType` 常量，但本课只使用 Java 8 已存在的声明目标。

## 官方来源卡与直接证据

以下页面均在 `2026-08-15` 直接打开并核验；没有把搜索页、社区文章或 AI 输出写成最终依据。

| ID | 直接来源 | sourceType | 适用版本 | claims |
| --- | --- | --- | --- | --- |
| `java-se-25-ri` | [Java SE 25 Reference Implementations](https://jdk.java.net/java-se-ri/25) | `official-reference` | Java SE 25 | 官方参考实现基于 OpenJDK JDK 25 项目，并已通过 Java Community Process 批准。 |
| `oracle-java-roadmap` | [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) | `official-reference` | 2026-08-15 页面状态 | Oracle 将 Java SE 25 列为 LTS，支持表记录其 2025-09 发布。 |
| `dev-java-annotations` | [Dev.java Annotations](https://dev.java/learn/annotations/) | `official-reference` | 当前 Dev.java | 注解是程序元数据，本身不会直接改变被标注代码；页面提供声明、元注解和反射读取的教学概览，精确版本语义仍回查 JLS 25/8 与对应 API。 |
| `jls25-annotation-interface` | [JLS 25 Chapter 9](https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html) | `specification` | Java 25 | §9.6 定义 annotation interface declaration、元素方法和允许返回类型；§9.6.2 定义元素默认值；§9.7 定义标注语法、元素值和编译期合法性。 |
| `jls25-meta-annotations` | [JLS 25 Chapter 9](https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html) | `specification` | Java 25 | §9.6.4.1 的 `@Target` 决定声明/类型上下文；§9.6.4.2 的 `@Retention` 决定 source、class、runtime 可见性；§9.6.4.3 规定 `@Inherited` 的类继承语义。 |
| `jls8-annotation-type` | [JLS 8 Chapter 9](https://docs.oracle.com/javase/specs/jls/se8/html/jls-9.html) | `specification` | Java 8 | §9.6、§9.6.2、§9.6.4.1–§9.6.4.3 提供同一组注解声明、默认值、目标、保留和继承合同；未声明 `@Retention` 时按 `CLASS` 处理。 |
| `api25-annotated-element` | [AnnotatedElement - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/reflect/AnnotatedElement.html) | `api-doc` | Java 25 | `getAnnotation`/`getAnnotations` 返回与元素关联的注解；`getDeclaredAnnotation`/`getDeclaredAnnotations` 只返回直接存在的注解；`isAnnotationPresent` 可检查指定类型。 |
| `api8-annotated-element` | [AnnotatedElement - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/AnnotatedElement.html) | `api-doc` | Java 8 | Java 8 已提供 `getAnnotation`、`getAnnotations`、`getDeclaredAnnotation`、`getDeclaredAnnotations` 和 `isAnnotationPresent`，可运行同一反射反馈环。 |
| `api25-retention-policy` | [RetentionPolicy - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/annotation/RetentionPolicy.html) | `api-doc` | Java 25 | `SOURCE` 不进入 class 文件，`CLASS` 记录到 class 文件但不保证 VM 运行时保留，`RUNTIME` 保留以便反射读取。 |
| `api8-retention-policy` | [RetentionPolicy - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/lang/annotation/RetentionPolicy.html) | `api-doc` | Java 8 | `SOURCE`、`CLASS`、`RUNTIME` 三种策略及其反射可见性与 Java 25 合同一致。 |
| `api25-target` | [Target - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/annotation/Target.html) | `api-doc` | Java 25 | `@Target` 指定注解接口可出现的上下文；存在时编译器执行 `ElementType` 限制，不存在时可修饰声明上下文。 |
| `api8-target` | [Target - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/lang/annotation/Target.html) | `api-doc` | Java 8 | `@Target` 的 `ElementType[] value()` 和编译期限制可支持 Java 8 兼容声明。 |
| `api25-inherited` | [Inherited - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/annotation/Inherited.html) | `api-doc` | Java 25 | 仅当查询类声明且子类没有直接注解时，沿超类链查找；对非类目标和实现的接口无效。 |
| `api8-inherited` | [Inherited - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/lang/annotation/Inherited.html) | `api-doc` | Java 8 | `@Inherited` 同样只影响类声明的超类继承，不影响接口、字段、方法和参数。 |
| `api25-documented` | [Documented - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/annotation/Documented.html) | `api-doc` | Java 25 | 使用 `@Documented` 的注解会成为被标注元素公共文档合同的一部分；它不改变运行时反射保留策略。 |
| `api8-documented` | [Documented - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/lang/annotation/Documented.html) | `api-doc` | Java 8 | `@Documented` 的 Javadoc/API 可见性语义与 Java 25 一致。 |

## 现代主线结论

### 注解是受限的声明式元数据

注解接口使用 `public @interface Name { ... }` 声明。其方法声明的是元素，调用方通过 `@Name(...)`
提供元素值，读取时通过同名无参方法得到值。JLS 25 §9.6.1 限定元素返回类型为基本类型、`String`、
`Class`、枚举、注解接口或这些类型的一维数组；不能把任意对象、集合或嵌套数组当作元素。注解不自动
执行逻辑，它只是附着在程序元素上的描述，处理逻辑必须由编译器、工具或运行时读取方实现。

### 元注解决定注解的合同

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

- `@Target(ElementType.TYPE)` 把使用范围限定到类、接口等类型声明；把它写到方法或参数上会在编译期
  失败。
- `@Retention(RUNTIME)` 让 JVM 运行时反射 API 可以看到它。没有 `@Retention` 时，JLS 25/8 都要求按
  `RetentionPolicy.CLASS` 处理，不能把“写进 class 文件”误认为“运行时可读取”。
- `@Inherited` 只对“注解用于类声明”这一条路径生效，并且只沿超类查找。它不会让接口实现类、字段、
  方法或参数自动得到父类型注解。
- `@Documented` 影响 Javadoc 等公共文档，不替代 `RUNTIME`，也不改变 `getAnnotation` 的结果。

### 元素默认值和使用形式

元素带 `default` 时，使用方可以省略它；没有默认值的元素是必填项。单一名为 `value` 的元素可以使用
简写 `@RuntimeLabel("order")`，多个元素或非 `value` 名称必须使用命名形式：

```java
/**
 * 用于展示继承查询行为的父类。
 */
@RuntimeLabel("order")
class BaseHandler {
}

/**
 * 没有直接声明注解，运行时可从父类查询到标签。
 */
final class ChildHandler extends BaseHandler {
}
```

数组元素即使只有一个值也要遵守数组元素语法；元素值必须是编译期可表示的常量、枚举常量、类字面量、
嵌套注解或这些值的一维数组。注解元素不能写 `null`，也不能调用方法产生运行时对象。

### 运行时元数据读取

`Class`、`Field`、`Method`、构造器和参数等反射对象实现 `java.lang.reflect.AnnotatedElement`。课程只用
指定类型查询，避免把反射数组直接交给业务代码：

```java
import java.lang.annotation.Annotation;
import java.lang.reflect.AnnotatedElement;

/**
 * 读取处理器类型上的标签文本。
 */
final class LabelReader {
    /**
     * 返回直接或继承得到的标签；没有标签时返回明确结果。
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

`getAnnotation` 和 `isAnnotationPresent` 依据 API 合同可包含 `@Inherited` 的超类结果；
`getDeclaredAnnotation` 和 `getDeclaredAnnotations` 只看当前元素直接声明的注解。对字段、方法和参数，
“继承”本身不适用，因此 `getAnnotations` 与 declared 结果不会凭空跨成员复制。反射返回的注解对象和
数组是 API 生成的视图；修改返回数组不会修改元素上的元数据。

## 当前项目补充

以下只记录冻结 `dzzz-app` 的能力使用，不把项目一次写法升级成 Java 推荐合同。外部仓库快照为
`167ca8aa91ca3a6b101246964ef4fddec3d21da0`，每个文件 SHA-256 已与冻结 inventory 逐项匹配。

| 文件 | 稳定符号 | 冻结 SHA-256 | 状态 | 可支持的结论 | 不支持的结论 |
| --- | --- | --- | --- | --- | --- |
| `dzzz-app/src/main/java/com/tdh/bdzz/annoation/AutoValid.java` | `com.tdh.bdzz.annoation.AutoValid` | `35c6720d173fbc99350f212a36c31acec005d256f39d6f60b5aa456e07dff4bb` | `corrected` | 参数目标、`RUNTIME` 保留、布尔元素默认值和 `@Documented` 的使用场景 | `@Inherited` 写在参数目标上对参数产生继承效果；课程移除该无效元注解 |
| `dzzz-app/src/main/java/com/tdh/bdzz/annoation/AutowiredShardData.java` | `com.tdh.bdzz.annoation.AutowiredShardData` | `423326aaf8c003d1139ed05e6217b9a6e7b70c99213faac7fcb76435597f6ef4` | `corrected` | 参数注解可以组合布尔、字符串等配置元素并由运行时组件读取 | `@Inherited` 能让参数注解跨方法或跨实现类继承；`Class<? extends ...>` 的框架注入语义不在本课 |
| `dzzz-app/src/main/java/com/tdh/bdzz/annoation/CltjrSf.java` | `com.tdh.bdzz.annoation.CltjrSf` | `780710ec5475cdcbcb32cc907db009236b7dda7b719b827697b29be2c63dcc0c` | `observed` | 字段/注解类型目标、`RUNTIME` 保留和带默认值的验证参数 | `javax.validation.Constraint` 的验证器生命周期、消息合同或 `payload` 设计是 Java 语言规则 |
| `dzzz-app/src/main/java/com/tdh/DzzzAreaApplication.java` | `com.tdh.DzzzAreaApplication` | `33f6a4536d7a5d3f027ae1a1dbf7903d9ab79719936b067313d9d52bd93db280` | `observed` | Spring 启动类集中声明多个类型级注解，说明注解可作为框架入口的元数据 | Spring Boot、Springfox、重试和异步注解的具体处理由精确框架版本合同决定 |
| `dzzz-app/src/main/java/com/tdh/bdzz/util/ValidatorUtil.java` | `com.tdh.bdzz.util.ValidatorUtil` | `cfa8e9ed4432ba28db4780eb6374ca4ec4d69acb69d79a76dec51703848e012b` | `corrected` | `Field.getDeclaredAnnotations()`、`annotationType().getAnnotation(...)` 组成“读取注解并读取其元注解”的运行时路径 | 直接复制 `setAccessible`、异常吞噬、旧式反射实例化或业务校验器实现；课程只保留 `AnnotatedElement` 的最小读取模型 |

项目路径中保留了原仓库的 `annoation` 拼写；课程正文不修正路径、不复制业务消息或敏感配置。`ValidatorUtil`
只证明项目确实读取字段注解及其 `@Constraint` 元注解，不能证明所有自定义注解都应该使用相同的框架处理器。

## Java 8 / Spring Boot 2.3 兼容写法

这是项目补充线的兼容写法；本课的语言合同在 Java 8 与 Java 25 一致，Spring Boot 2.3.12.RELEASE 仅作为
快照背景，不引入 Spring API：

```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Java 8 兼容的参数标签。
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.PARAMETER)
public @interface ParameterLabel {
    /**
     * 返回参数标签。
     */
    String value();
}

/**
 * 使用参数标签的 Java 8 兼容服务。
 */
final class LegacyService {
    /**
     * 接受一个带运行时标签的参数。
     */
    void execute(@ParameterLabel("case-id") String caseId) {
        // 这里只保留注解附着位置；读取逻辑由反射反馈环验证。
    }
}
```

Java 8 不支持 Java 25 的新语法特性，但本课示例只使用 `@interface`、枚举常量、字符串、布尔值和
`AnnotatedElement`，因此可以直接双版本编译。不要为了“现代化”把记录类、模式匹配或框架版本写入本课。

## 新旧版本差异

| 对比项 | Java 25 现代线 | `dzzz-app` Java 8 补充线 | 迁移注意 |
| --- | --- | --- | --- |
| 注解声明术语 | JLS 使用 `annotation interface` | JLS 使用 `annotation type` | 术语变化，不改变本课核心语法 |
| 基础目标与保留策略 | `TYPE`、`FIELD`、`METHOD`、`PARAMETER` 等稳定子集 | 同一子集 | 保持 Java 8 兼容即可；不引入新 `ElementType` 常量 |
| 运行时查询 | `AnnotatedElement` 支持直接/继承查询及重复注解 API | 同样支持本课需要的查询方法 | 只依赖 `getAnnotation`、`getDeclaredAnnotation`、`isAnnotationPresent` |
| 框架处理 | 不作为 Java 25 语言主线 | Spring Boot 2.3.12.RELEASE 仅冻结背景 | Spring 元注解行为需另以精确版本官方文档核验 |

## 易错点取证

| 现象 | 触发条件 | 原因 | 后果 | 错误示例 | 正确写法 | 影响版本 | 验证方式 | 来源 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 运行时反射读不到自定义注解 | 声明注解时省略 `@Retention`，或显式使用 `SOURCE`/`CLASS`，随后调用 `getAnnotation` | JLS 25/8 规定缺省保留策略为 `CLASS`；只有 `RUNTIME` 要求反射库提供运行时可见性 | 处理器误判为“没有配置”，功能静默跳过 | `public @interface Tag { String value(); }` | 添加 `@Retention(RetentionPolicy.RUNTIME)`，并让反馈环检查非空结果 | Java 8、Java 25 | 正确 `RUNTIME` 与缺省 `CLASS` 注解分别编译运行，输出 `runtime=true|class=false` | `jls25-meta-annotations`、`jls8-annotation-type`、`api25-retention-policy`、`api8-retention-policy` |
| 把注解用在未允许的位置 | `@Target(ElementType.METHOD)` 的注解写在类或参数上 | `@Target` 的元素集合由编译器检查 | `javac` 编译失败；若不写 `@Target` 则是另一套更宽的声明上下文规则 | `@MethodOnly class Wrong {}` | 按设计目标声明准确的 `ElementType`，需要多位置时显式列出数组 | Java 8、Java 25 | 两个版本编译同一错误源码，均要求非零 | `jls25-meta-annotations`、`api25-target`、`api8-target` |
| 误以为 `@Inherited` 作用于所有成员或接口实现 | 在参数、字段、方法或实现类上期待继承父成员/接口的注解 | API 明确限定它只在查询类声明时沿超类链查找；接口没有效果 | 运行时查询得到 `null`，导致错误的授权/校验假设 | 给参数注解加 `@Inherited` 后省略子类参数注解 | 类级策略才使用 `@Inherited`；成员元数据在每个声明点显式标注 | Java 8、Java 25 | 父类/子类、接口/实现、字段三组查询分别检查结果 | `api25-inherited`、`api8-inherited`、`api25-annotated-element` |
| 把 `@Documented` 当成运行时开关 | 只添加 `@Documented`，未设置 `RUNTIME`，随后反射读取 | `@Documented` 只影响 Javadoc 与公共 API 文档 | 生成文档可能有标注，运行时仍不可见 | `@Documented public @interface Tag {}` | 文档合同与运行时合同分别声明 `@Documented` 和 `@Retention(RUNTIME)` | Java 8、Java 25 | 文档检查只作可选人工观察；反射反馈环只认 `RUNTIME` | `api25-documented`、`api8-documented`、`api25-retention-policy` |
| 声明无默认值元素却省略赋值 | 使用 `@RequiredTag` 时没有提供 required element | JLS 要求没有默认值的元素在使用处提供值 | 编译失败，不能等运行时再补配置 | `@RequiredTag`（缺少 `value`） | 为必填元素提供值；仅对真正可选配置提供 `default` | Java 8、Java 25 | 两个版本编译正误源码，错误源码均要求非零 | `jls25-annotation-interface`、`jls8-annotation-type` |

## 可重复验证设计

验证资产全部写入 `/tmp` 下的 `mktemp -d` 目录，结束后删除；仓库不保留 Java 源码、class、fixture 或
测试文件。每个方法定义上方提供规范中文注释。

### 共享正向反馈环

创建一个 Java 8 兼容的 `AnnotationFeedback` 源文件，包含运行时标签、缺省 `CLASS` 标签、父类标签、
接口标签、方法标签和参数标签：

```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.reflect.Method;

/**
 * 运行时可读取的类型标签。
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
 * 未声明保留策略，验证默认 CLASS 不保证运行时可见。
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
 * 父类上的运行时标签。
 */
@RuntimeTag("parent")
class Parent {
    /**
     * 提供带方法标签的成员。
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
 * 运行反馈环入口。
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
```

Java 25 与 Java 8 的正向运行都应退出 0，并输出：

```text
class=true|declared=false|classOnly=false|method=true|parameter=true
```

这行只观察：`@Inherited` 的类超类查询、`getDeclaredAnnotation` 的直接声明边界、缺省 `CLASS` 的
不可见性、方法与参数上的 `RUNTIME` 元数据。`ClassTag` 附着在 `Child` 本身但仍不可由反射读取，
因此 `classOnly=false` 不表示注解未编译，而表示它没有运行时合同。

### 负向编译反馈环

在独立临时文件中逐条执行两个 JDK 的 `javac`：

1. `@MethodTag class WrongTarget {}`：违反 `@Target(METHOD)`，要求非零退出。
2. `@interface RequiredTag { String value(); }` 与 `@RequiredTag class Missing {}`：缺失无默认值元素，
   要求非零退出。
3. `@Inherited` 继续放在参数目标注解上只验证“可编译但无继承效果”，不把它当作编译错误。

诊断文本、临时文件行号和 class 文件布局可能随 JDK 变化；signoff 只绑定退出码、正向 stdout 和布尔
观察结果，不伪造跨版本完全相同的诊断。

### 复跑身份与清理

复跑应固定使用已批准的 Java 25 与 Java 8 镜像身份，并记录 `javac -version`、`java -version`、每次
编译/运行退出码和精确 stdout。所有源码与 class 写入同一 `mktemp -d` 目录，结束时执行
`find <temp-dir> -depth -delete`；不得把临时验证文件加入仓库。

## 被排除或尚未证实的说法

- 不讲 `@Repeatable`、容器注解、类型注解、注解处理器 API、编译期代码生成或模块注解；这些主题需要
  独立课程与独立反馈环。
- 不把 `@Inherited` 描述为方法、字段、参数或接口实现的通用继承机制。
- 不把 `@Documented` 描述为运行时保留开关，不把 `CLASS` 描述为可反射读取。
- 不复制 `dzzz-app` 的业务消息、验证器实现、类路径配置、真实请求数据或框架代理逻辑。
- 不把 Spring、Springfox、Bean Validation、MyBatis 或 AOP 的注解处理行为归因于 JLS；需要框架课按
  精确版本官方 Reference、Javadoc、源码和测试重新核验。
- 不给出未经 JMH/JFR 测量的性能结论，不把反射“更快/更慢”写成普遍事实。

## 官方来源清单

- [Java SE 25 Reference Implementations](https://jdk.java.net/java-se-ri/25) - 基于 OpenJDK JDK 25 项目的官方参考实现。
- [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) - Java 25 LTS 状态。
- [Dev.java Annotations](https://dev.java/learn/annotations/) - 注解、元注解和运行时读取的官方教学概览。
- [JLS 25 Chapter 9](https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html) - annotation interface、元素、默认值、注解语法和元注解规则。
- [JLS 8 Chapter 9](https://docs.oracle.com/javase/specs/jls/se8/html/jls-9.html) - Java 8 annotation type 及其目标、保留、继承合同。
- [AnnotatedElement - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/reflect/AnnotatedElement.html) - 运行时元数据查询方法。
- [AnnotatedElement - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/AnnotatedElement.html) - Java 8 兼容查询方法。
- [RetentionPolicy - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/annotation/RetentionPolicy.html) - `SOURCE`、`CLASS`、`RUNTIME`。
- [RetentionPolicy - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/lang/annotation/RetentionPolicy.html) - Java 8 保留策略。
- [Target - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/annotation/Target.html) - 目标上下文和编译器约束。
- [Target - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/lang/annotation/Target.html) - Java 8 目标上下文。
- [Inherited - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/annotation/Inherited.html) - 只沿类超类链继承。
- [Inherited - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/lang/annotation/Inherited.html) - Java 8 相同继承边界。
- [Documented - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/annotation/Documented.html) - 公共文档语义。
- [Documented - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/lang/annotation/Documented.html) - Java 8 公共文档语义。

## 发布前自检

- [x] Phase A 冻结 ID、B-12 唯一前置和 75 分钟合同已同步。
- [x] 现代 Java 25 与 Java 8 legacy 版本均明确，Spring Boot 2.3.12.RELEASE 只作项目背景。
- [x] 每条语言/反射关键结论均绑定 JLS 或 Java SE API 直接页面，并记录 claims。
- [x] 冻结项目证据只指向 `dzzz-app`，包含 5 个代表路径、稳定符号、状态和 SHA-256。
- [x] `observed` 与 `corrected` 明确区分；没有复制项目业务数据或框架实现。
- [x] 易错点具备现象、触发条件、原因、后果、错误/正确写法、版本、验证方式和来源。
- [x] Java 25/8 反馈环只设计 `/tmp` 临时资产，未把未执行结果写成已通过。
- [x] 每个验证代码块中的方法定义上方有规范中文注释。

## Stop Boundary

本研究记录只服务 Phase B 的 B-13 `annotations-and-metadata`。只有本课研究、正文、Java 25/8 反馈环、
catalog、搜索、进度、浏览器、完整 Gate、signoff 及必要审查全部通过后，才可宣布 B-13 关闭。关闭前
不得读取或启动下一课；本研究批次到此停止，不进入其他 Java / Go 课程、Reference 或项目实战。
