---
id: backend.java.learn.intermediate.lombok-and-generated-contracts
type: lesson
title: Lombok、可变模型与生成合同
summary: 先理解 Java 模型合同，再逐步使用 Lombok 减少样板代码，避免生成的 setter、equals 和 toString 改变业务语义
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 120
objectives:
  - 解释 Lombok 注解处理器在编译期生成代码的机制
  - 根据模型职责选择 getter、构造器、builder、equals 与 toString 合同
  - 使用不可变快照、delombok 和行为测试验证生成结果
prerequisites:
  - backend.java.learn.intermediate.openapi-documentation-and-api-integration
related: []
tags:
  - Lombok
  - 不可变对象
  - Builder
  - equals
  - hashCode
  - 代码生成
appliesTo: Java 25、Spring Boot 4.1.0 与 Lombok 1.18.42 主线；Java 8、Spring Boot 2.3.12.RELEASE 与 Lombok 1.18.30 兼容补充
modernBaseline:
  java: '25'
  springBoot: 4.1.0
  lombok: 1.18.42
legacyBaseline:
  java: '8'
  springBoot: 2.3.12.RELEASE
  lombok: 1.18.30
verifiedAt: 2026-08-16
sources:
  - id: lombok-getter-setter
    title: Lombok Getter and Setter
    url: https://projectlombok.org/features/GetterSetter
    sourceType: official-reference
    appliesTo: Lombok 1.18.42、1.18.30
    claims:
      - Getter 与 Setter 的生成位置、访问级别和局部覆盖
  - id: lombok-data
    title: Lombok Data
    url: https://projectlombok.org/features/Data
    sourceType: official-reference
    appliesTo: Lombok 1.18.42、1.18.30
    claims:
      - Data 组合注解的访问器、构造器、equals、hashCode 与 toString 生成边界
  - id: lombok-value
    title: Lombok Value
    url: https://projectlombok.org/features/Value
    sourceType: official-reference
    appliesTo: Lombok 1.18.42、1.18.30
    claims:
      - Value 用于 final 字段和浅不可变模型的组合生成
  - id: lombok-builder
    title: Lombok Builder
    url: https://projectlombok.org/features/Builder
    sourceType: official-reference
    appliesTo: Lombok 1.18.42、1.18.30
    claims:
      - Builder 的生成方法、缺省值以及 Singular 的不可修改集合行为
  - id: lombok-equals
    title: Lombok Equals and HashCode
    url: https://projectlombok.org/features/EqualsAndHashCode
    sourceType: official-reference
    appliesTo: Lombok 1.18.42、1.18.30
    claims:
      - 字段选择、canEqual 与继承 equals 合同
  - id: lombok-tostring
    title: Lombok ToString
    url: https://projectlombok.org/features/ToString
    sourceType: official-reference
    appliesTo: Lombok 1.18.42、1.18.30
    claims:
      - 生成的 toString 输出字段选择与显式排除
  - id: lombok-constructors
    title: Lombok Constructors
    url: https://projectlombok.org/features/constructor
    sourceType: official-reference
    appliesTo: Lombok 1.18.42、1.18.30
    claims:
      - 无参、未初始化必需字段和全参数构造器生成规则
  - id: lombok-nonnull
    title: Lombok NonNull
    url: https://projectlombok.org/features/NonNull
    sourceType: official-reference
    appliesTo: Lombok 1.18.42、1.18.30
    claims:
      - 非空检查生成位置和异常行为
  - id: lombok-config
    title: Lombok Configuration
    url: https://projectlombok.org/features/configuration
    sourceType: official-reference
    appliesTo: Lombok 1.18.42、1.18.30
    claims:
      - lombok.config 的继承与团队配置
  - id: lombok-delombok
    title: Lombok Delombok
    url: https://projectlombok.org/features/delombok
    sourceType: official-reference
    appliesTo: Lombok 1.18.42、1.18.30
    claims:
      - 展开生成代码用于审查和调试
  - id: lombok-execution-path
    title: Lombok Execution Path
    url: https://projectlombok.org/contributing/lombok-execution-path
    sourceType: official-reference
    appliesTo: Lombok 1.18.42、1.18.30
    claims:
      - javac 与 Maven 中通过注解处理器入口转换 AST，且不把转换结果保存为普通生成源码
  - id: java-record
    title: Java Record API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Record.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - record 的浅不可变与组件方法合同
  - id: java-equals
    title: Object equals API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html#equals(java.lang.Object)
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - equals 的五条基本性质
  - id: java-hashcode
    title: Object hashCode API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html#hashCode()
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - equals 相等时 hashCode 必须相等
  - id: java-list-copyof
    title: List copyOf API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#copyOf(java.util.Collection)
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - 不可修改的浅结构快照和 null 元素限制
  - id: java-unmodifiable-list
    title: Collections unmodifiableList API
    url: https://docs.oracle.com/javase/8/docs/api/java/util/Collections.html#unmodifiableList-java.util.List-
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - 只读视图与底层集合变化的区别
  - id: java-annotation-processing
    title: Java Filer API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.compiler/javax/annotation/processing/Filer.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - 通用注解处理器可创建 source、class 与 resource 文件
  - id: maven-compiler
    title: Maven Compiler Plugin
    url: https://maven.apache.org/plugins-archives/maven-compiler-plugin-3.14.1/compile-mojo.html#annotationProcessorPaths
    sourceType: official-reference
    appliesTo: Maven Compiler Plugin 3.14.1
    claims:
      - annotationProcessorPaths 与 release、source、target 配置
  - id: owasp-logging
    title: OWASP Logging Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: current
    claims:
      - 访问令牌、口令和其他敏感数据不应直接写入日志
  - id: owasp-mass-assignment
    title: OWASP Mass Assignment Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: current
    claims:
      - 输入模型不应让客户端批量覆盖服务端控制字段
projectEvidence:
  - file: dzzz-app/src/main/java/com/tdh/bdzz/bo/AdjustSignBO.java
    symbol: com.tdh.bdzz.bo.AdjustSignBO
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/dto/DownloadDTO.java
    symbol: com.tdh.bdzz.dto.DownloadDTO
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/timer/bo/FileProcessBO.java
    symbol: com.tdh.bdzz.timer.bo.FileProcessBO
    usage: corrected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/enums/Hyzt.java
    symbol: com.tdh.bdzz.enums.Hyzt
    usage: corrected
---

# Lombok、可变模型与生成合同

## 为什么需要学习

一个只有三个字段的类，也可能需要构造器、getter、`equals`、`hashCode` 和 `toString`。这些方法看起来
重复，却共同决定对象能否被正确创建、比较、放入集合和写入日志。Lombok 可以代写样板代码，但它不知道
哪些字段是业务身份、哪些字段必须只读、哪些字段属于秘密。因此学习重点不是“记住更多注解”，而是先说明
对象合同，再选择最小注解集合，并用编译和运行结果验证生成代码。

## 学习目标

- 解释 Lombok 注解处理器在编译期做了什么。
- 根据模型职责选择 getter、构造器、builder、equals 和 toString。
- 区分 final 引用、只读视图、浅不可变与不可变快照。
- 在 Java 25 与 Java 8 中复现同一生成合同。
- 用编译产物和可观察行为检查生成代码，而不是只看 IDE 提示。

## 前置术语

- **样板代码**：结构重复、但仍然参与公开合同的代码，例如简单 getter 和字段构造器。
- **注解处理器**：编译器在编译期调用的扩展；通用处理器可创建新文件，Lombok 则通过该入口转换 AST。
- **对象合同**：调用方可以依赖的构造、访问、相等、不可变和文本表示规则。
- **浅不可变**：对象字段引用不能替换，但引用指向的可变对象仍可能变化。
- **业务身份**：判断两个实体是否代表同一业务对象的稳定字段，例如订单 ID。
- **脱敏**：在日志或输出中删除、遮盖令牌、口令等敏感值。

## 零基础知识点详解

### 1. Lombok 解决的是什么问题

1. **是什么**：Lombok 通过注解处理器入口参与编译，并转换编译器 AST，最终让方法或字段进入 class。
2. **作用**：减少 getter、构造器和 builder 的重复样板，但不会替你决定业务语义。
3. **场景**：字段很多的 DTO、配置对象和构造器参数较多的命令对象。
4. **用法**：先写一份普通 Java 版本，再添加一个注解并比较 `delombok` 输出。
5. **最小示例**：`@Getter class User { private final String name; }` 会生成 `getName()`。
6. **运行结果**：测试可以调用 `new User("Lin").getName()` 并得到 `Lin`。
7. **常见误区**：把“少写代码”理解成“没有合同”；编译器、IDE 和测试仍必须看到同一生成结果。

### 2. 生成代码发生在什么时候

1. **是什么**：Lombok 在编译阶段转换 AST；它通常不通过 `Filer` 落盘生成源码，运行时 JVM 也不会重新解析 Lombok 注解。
2. **作用**：解释为什么只在 IDE 中显示方法而命令行构建失败时要检查 annotation processor。
3. **场景**：升级 JDK、切换 Maven/Gradle 或关闭 IDE annotation processing。
4. **用法**：在构建日志中确认 Lombok 处理器存在，再用 `delombok` 导出结果。
5. **最小示例**：`mvn -q test` 前检查 `maven-compiler-plugin` 与 Lombok 依赖。
6. **运行结果**：干净环境也能编译，导出的源码包含显式访问器。
7. **常见误区**：把 Lombok 当作运行时库；删除处理器后已有 class 不代表新源码仍可编译。

### 3. `@Getter` 与 `@Setter` 的边界

1. **是什么**：`@Getter` 生成读取方法，`@Setter` 生成写入方法，可放在类或字段上。
2. **作用**：按字段选择公开读写，而不是把全部状态默认暴露。
3. **场景**：响应 DTO 可公开 getter，内部状态只允许服务方法改变。
4. **用法**：类级 `@Getter` 后在敏感或计算字段上使用 `@Getter(AccessLevel.NONE)`。
5. **最小示例**：`@Setter(AccessLevel.PACKAGE) private String status;` 只允许同包修改。
6. **运行结果**：包外代码没有 `setStatus` 编译入口，状态变化只能经过领域方法。
7. **常见误区**：给实体所有字段加 public setter，导致非法状态可以被任意写入。

### 4. `@Data` 为什么不是默认模型模板

1. **是什么**：`@Data` 组合 getter、setter、`toString`、`equals`、`hashCode` 和 required constructor。
2. **作用**：适合简单、短生命周期、没有严格不变量的载体对象。
3. **场景**：内部测试 fixture 或纯数据搬运 DTO，且已审查日志和相等语义。
4. **用法**：先问“是否需要 setter、默认字段集合的 equals/hashCode 和完整 toString”，任一答案为否就拆开使用注解。
5. **最小示例**：支付对象改为 `@Getter @EqualsAndHashCode(onlyExplicitlyIncluded = true)`。
6. **运行结果**：只有显式业务标识参与相等比较，金额变化不会改变集合键。
7. **常见误区**：在 JPA/缓存/并发模型上无条件使用 `@Data`，造成状态可变、日志泄密或 hash 键失效。

### 5. `@Value` 与真正不可变

1. **是什么**：`@Value` 默认生成 final 类、final 字段、全参数构造器和 getter，不生成 setter。
2. **作用**：表达创建后不应改变的值模型。
3. **场景**：坐标、金额快照、分页参数和跨线程传递的消息。
4. **用法**：集合字段仍需复制；对外暴露只读引用不等于深不可变。
5. **最小示例**：`@Value class Money { BigDecimal amount; String currency; }`。
6. **运行结果**：没有 `setAmount`；相同字段值的两个对象可稳定比较。
7. **常见误区**：认为 final 引用会冻结引用指向的 `ArrayList`；集合内部仍可能被修改。

### 6. Java record 与 Lombok 值对象如何选择

1. **是什么**：record 是 Java 语言原生的透明数据载体，组件自动拥有访问器、equals、hashCode 和 toString。
2. **作用**：用编译器保证固定组件合同，减少第三方处理器依赖。
3. **场景**：Java 16+ 的请求/响应快照；需要继承类或 Java 8 时不能用 record。
4. **用法**：优先 `record PageRequest(int page, int size) {}`，需要旧线时使用显式类或 Lombok。
5. **最小示例**：`PageRequest request = new PageRequest(1, 20); request.page()`。
6. **运行结果**：访问器名是 `page()` 而非 `getPage()`，编译器生成结构化相等方法。
7. **常见误区**：把 record 误当深不可变对象，或在 Java 8 项目中直接复制 record 语法。

### 7. 构造器注解与必填字段

1. **是什么**：`@NoArgsConstructor`、`@RequiredArgsConstructor` 和 `@AllArgsConstructor` 分别生成不同参数集合的构造器。
2. **作用**：明确对象创建时哪些字段必须提供。
3. **场景**：配置绑定可能需要无参构造，命令对象更适合 required/all args 构造。
4. **用法**：对未初始化 final 或未初始化 `@NonNull` 字段使用 `@RequiredArgsConstructor`，避免全量公开构造器。
5. **最小示例**：`@RequiredArgsConstructor class CreateUser { @NonNull String name; }`。
6. **运行结果**：`new CreateUser(null)` 在构造边界立即失败，而不是稍后 NPE。
7. **常见误区**：为了框架反射强行加无参构造，结果让业务代码可以创建不完整对象。

### 8. `@NonNull` 的运行时保证

1. **是什么**：Lombok 在构造器、setter 或方法参数入口插入 null 检查。
2. **作用**：把“不可为空”从注释变成可观察失败。
3. **场景**：领域值、依赖参数和不能缺失的命令字段。
4. **用法**：在真正不允许 null 的边界标注，错误消息仍需由业务层转换成稳定响应。
5. **最小示例**：`void rename(@NonNull String name)`。
6. **运行结果**：传入 null 抛出 `NullPointerException`，调用方可在测试中断言。
7. **常见误区**：把 `@NonNull` 当作输入校验替代品；长度、格式和权限仍需 Bean Validation/业务规则。

### 9. `@Builder` 的创建流程

1. **是什么**：`@Builder` 生成 builder 类型、链式方法和 `build()`。
2. **作用**：让多个可选参数的创建代码可读，并避免构造器参数顺序错误。
3. **场景**：测试 fixture、复杂查询条件和不可变命令对象。
4. **用法**：将 builder 放在构造器或静态工厂上，保证只暴露允许的字段。
5. **最小示例**：`Order order = Order.builder().id("o-1").amount(10).build();`。
6. **运行结果**：builder 每次 `build()` 产生独立对象，缺省字段使用明确默认值。
7. **常见误区**：把 builder 当作验证器；`build()` 前仍要检查必填字段和跨字段不变量。

### 10. `@Builder.Default` 与集合字段

1. **是什么**：`@Builder.Default` 让字段初始化表达式在 builder 未赋值时生效。
2. **作用**：避免 builder 绕过字段默认值。
3. **场景**：状态默认 `PENDING`、标签默认空集合等模型。
4. **用法**：集合使用 `@Singular` 或在构造器中复制，明确 builder 的空值合同。
5. **最小示例**：`@Builder.Default private Status status = Status.PENDING;`。
6. **运行结果**：未设置 status 的对象仍是 `PENDING`，而不是 null。
7. **常见误区**：只写字段初始化不写 `@Builder.Default`，导致 builder 结果与 `new` 结果不一致。

### 11. `@Singular` 与集合快照

1. **是什么**：`@Singular` 生成添加单项、添加集合和最终集合构造方法。
2. **作用**：减少调用方修改内部集合的机会，并让 builder API 表达单项添加。
3. **场景**：角色、标签、错误列表等小型集合。
4. **用法**：构建完成后不要继续持有可变 builder；对外返回 `List.copyOf` 或不可变副本。
5. **最小示例**：`User.builder().role("reader").role("writer").build()`。
6. **运行结果**：构建后的 roles 可以读取但不能通过返回值直接添加。
7. **常见误区**：以为 `Collections.unmodifiableList` 会复制源集合；它只是只读视图。

### 12. `equals` 的业务身份

1. **是什么**：equals 判断两个对象是否代表同一个逻辑值，必须满足自反、对称、传递、一致和非空。
2. **作用**：决定断言、去重、缓存键和集合查找行为。
3. **场景**：值对象按全部有效属性相等，实体通常按稳定业务 ID 相等。
4. **用法**：使用 `@EqualsAndHashCode(onlyExplicitlyIncluded = true)` 并显式标识字段。
5. **最小示例**：只把 `orderId` 标记 `@EqualsAndHashCode.Include`。
6. **运行结果**：金额更新不会让 HashSet 中的同一订单失去定位。
7. **常见误区**：把数据库自增 ID 为空的两个新实体当成相等对象，或把可变字段放进 hash 键。

### 13. `hashCode` 与可变集合

1. **是什么**：hashCode 必须与 equals 一致；相等对象必须得到相同 hashCode。
2. **作用**：保证 HashMap、HashSet 在对象作为键时可预测。
3. **场景**：缓存键、去重集合和测试断言。
4. **用法**：对象放入哈希集合后不要修改参与 equals/hashCode 的字段。
5. **最小示例**：先 `set.add(order)`，再尝试修改 orderId 并观察 `contains` 失败。
6. **运行结果**：错误设计会出现对象仍在集合中却无法通过新 hash 找到。
7. **常见误区**：只重写 equals 不重写 hashCode，或使用 `@Data` 无意把所有可变字段纳入。

### 14. 继承模型与 `canEqual`

1. **是什么**：Lombok 的 equals 生成可使用 `canEqual` 辅助继承层次保持对称性。
2. **作用**：避免父类和子类比较时一方认为相等、另一方认为不等。
3. **场景**：确实需要继承的持久化模型；更推荐组合或 final 值类。
4. **用法**：审查 `callSuper`、显式 included 字段和子类新增状态。
5. **最小示例**：父类 ID 与子类类型字段分别测试 `base.equals(child)` 和反向调用。
6. **运行结果**：两种方向给出一致结果，且不会把无关父类状态漏掉。
7. **常见误区**：在继承类上默认 `callSuper = false`，导致父类身份被忽略。

### 15. `toString` 与敏感信息

1. **是什么**：`@ToString` 生成对象文本表示，默认可能包含多个字段。
2. **作用**：调试方便，但日志、异常和监控可能把结果发送到持久化系统。
3. **场景**：请求对象、凭据对象和含个人信息的模型必须选择性输出。
4. **用法**：使用 `@ToString.Exclude` 或手写脱敏 `toString`，令 token、密码和连接串永不输出。
5. **最小示例**：`@ToString.Exclude private String accessToken;`。
6. **运行结果**：`toString()` 中没有 token 值，测试用断言检查字符串。
7. **常见误区**：在异常消息中直接拼接整个 DTO，绕过了日志脱敏策略。

### 16. 如何审查生成合同

1. **是什么**：生成合同是“源码注解 -> 编译产物 -> 运行行为”的可验证链路。
2. **作用**：让团队知道升级 Lombok、编译器或 IDE 后哪些行为必须保持。
3. **场景**：代码审查、依赖升级、排查“方法明明存在但构建失败”。
4. **用法**：运行 `delombok` 查看等价源码，结合单元测试锁定 API、相等、不可变和日志边界。
5. **最小示例**：测试 getter、builder、equals/hashCode、集合不可变和敏感字段排除五个行为。
6. **运行结果**：现代与 Java 8 fixture 均通过；删除 annotation processor 时构建明确失败而不是静默改变。
7. **常见误区**：只看 IDE 生成提示，不检查 CI 的真实编译器和依赖版本。

## 现代版本中的正确用法

1. Java 25 的透明数据载体优先考虑 record；需要 Java 8 兼容、框架无参构造或特殊访问器时再选择普通类与 Lombok。
2. 先写下模型合同：哪些字段必填、哪些字段可变、哪些字段参与相等、哪些字段允许进入日志。
3. 只添加满足合同的注解，例如 `@Getter`、`@RequiredArgsConstructor`、精确字段的 `@EqualsAndHashCode`。
4. builder 放在受控构造器或静态工厂上，避免把内部字段全部暴露为可写入口。
5. 集合在构造边界复制；Lombok 生成 final 字段并不自动让集合元素或集合本身深不可变。
6. 将 Lombok 1.18.42 固定在 Maven 构建中，并显式配置 annotation processor，保证本地与 CI 一致。

## 基本语法或核心接口

最小 Maven 配置包含普通依赖和编译期处理器。`provided` 表示应用运行时不需要 Lombok JAR；生成的方法
已经进入 class 文件。

```xml
<properties>
  <maven.compiler.release>25</maven.compiler.release>
  <lombok.version>1.18.42</lombok.version>
</properties>
<dependencies>
  <dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>${lombok.version}</version>
    <scope>provided</scope>
  </dependency>
</dependencies>
```

常用稳定注解按职责选择：

1. `@Getter` / `@Setter`：生成读取或写入入口，可通过 `AccessLevel` 收窄可见性。
2. `@RequiredArgsConstructor`：为未初始化 final 与未初始化 `@NonNull` 字段生成必需参数构造器。
3. `@Builder`：为受控创建流程生成 builder；默认值需 `@Builder.Default`。
4. `@EqualsAndHashCode`：生成相等与哈希逻辑，实体应显式选择稳定身份字段。
5. `@ToString`：生成文本表示，秘密字段必须使用 `@ToString.Exclude`。
6. `@Value`：组合不可变类常用设置，但集合字段仍需单独处理。

## 从零跟着做

### 第一步：创建现代工程

1. 执行 `modern_dir=$(mktemp -d /tmp/java-lombok-modern.XXXXXX)`。
2. 执行 `mkdir -p "$modern_dir/src/main/java/course"`。
3. 执行 `cd "$modern_dir"`，后续相对路径都从这里开始。
4. 将下面三个完整文件分别保存到 `pom.xml`、`src/main/java/course/Order.java` 和 `src/main/java/course/LombokFeedback.java`。

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>course</groupId>
  <artifactId>lombok-modern</artifactId>
  <version>1.0.0</version>
  <properties>
    <maven.compiler.release>25</maven.compiler.release>
    <lombok.version>1.18.42</lombok.version>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <version>${lombok.version}</version>
      <scope>provided</scope>
    </dependency>
  </dependencies>
  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
        <version>3.14.1</version>
        <configuration>
          <annotationProcessorPaths>
            <path>
              <groupId>org.projectlombok</groupId>
              <artifactId>lombok</artifactId>
              <version>${lombok.version}</version>
            </path>
          </annotationProcessorPaths>
        </configuration>
      </plugin>
    </plugins>
  </build>
</project>
```

```java
package course;

import java.util.List;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Singular;
import lombok.ToString;

@Getter
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public final class Order {
    @EqualsAndHashCode.Include
    private final String id;

    @Builder.Default
    private final Status status = Status.PENDING;

    @Singular
    private final List<String> tags;

    @ToString.Exclude
    private final String accessToken;

    public enum Status { PENDING, PAID }
}
```

```java
package course;

public final class LombokFeedback {
    private LombokFeedback() {}

    /**
     * 验证 Lombok 生成合同。
     *
     * @param args 未使用的命令行参数
     */
    public static void main(String[] args) {
        Order first = Order.builder().id("o-1").tag("reader")
                .accessToken("secret-token").build();
        Order second = Order.builder().id("o-1").status(Order.Status.PAID).build();

        require(first.getStatus() == Order.Status.PENDING, "builder default failed");
        require(first.getTags().size() == 1, "singular builder failed");
        require(first.equals(second), "identity equality failed");
        require(first.hashCode() == second.hashCode(), "hash contract failed");
        require(!first.toString().contains("secret-token"), "token leaked");
        boolean immutable = false;
        try {
            first.getTags().add("writer");
        } catch (UnsupportedOperationException expected) {
            immutable = true;
        }
        require(immutable, "tags must be immutable");
        System.out.println(
                "LOMBOK_FEEDBACK_PASS builder=1 immutable=1 equality=1 redacted=1");
    }

    /**
     * 检查反馈环条件。
     *
     * @param condition 必须成立的条件
     * @param message 失败信息
     */
    private static void require(boolean condition, String message) {
        if (!condition) {
            throw new IllegalStateException(message);
        }
    }
}
```

### 第二步：运行现代反馈环

1. 执行 `mvn -q package`。
2. 执行 `java -cp target/classes course.LombokFeedback`。
3. 预期输出：`LOMBOK_FEEDBACK_PASS builder=1 immutable=1 equality=1 redacted=1`。
4. 执行 `javap -verbose target/classes/course/Order.class`，确认 major version 为 `69`，对应 Java 25。

### 第三步：验证 Java 8 兼容线

1. 执行 `legacy_dir=$(mktemp -d /tmp/java-lombok-legacy.XXXXXX)`。
2. 执行 `mkdir -p "$legacy_dir/src/main/java/course"` 并进入该目录。
3. 将下面两个完整文件分别保存到 `pom.xml` 和 `src/main/java/course/LegacyModel.java`。

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>course</groupId>
  <artifactId>lombok-legacy</artifactId>
  <version>1.0.0</version>
  <properties>
    <maven.compiler.source>8</maven.compiler.source>
    <maven.compiler.target>8</maven.compiler.target>
    <lombok.version>1.18.30</lombok.version>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <version>${lombok.version}</version>
      <scope>provided</scope>
    </dependency>
  </dependencies>
  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
        <version>3.14.1</version>
        <configuration>
          <annotationProcessorPaths>
            <path>
              <groupId>org.projectlombok</groupId>
              <artifactId>lombok</artifactId>
              <version>${lombok.version}</version>
            </path>
          </annotationProcessorPaths>
        </configuration>
      </plugin>
    </plugins>
  </build>
</project>
```

```java
package course;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.ToString;

@Getter
@RequiredArgsConstructor
@ToString
public final class LegacyModel {
    private final String name;

    @ToString.Exclude
    private final String accessToken;

    /**
     * 验证 Java 8 兼容线的生成合同。
     *
     * @param args 未使用的命令行参数
     */
    public static void main(String[] args) {
        LegacyModel model = new LegacyModel("Lin", "secret-token");
        require("Lin".equals(model.getName()), "getter failed");
        require(!model.toString().contains("secret-token"), "token leaked");
        System.out.println("LOMBOK_LEGACY_PASS getter=1 redacted=1");
    }

    /**
     * 检查反馈环条件。
     *
     * @param condition 必须成立的条件
     * @param message 失败信息
     */
    private static void require(boolean condition, String message) {
        if (!condition) {
            throw new IllegalStateException(message);
        }
    }
}
```

4. 使用 Java 8 执行 `mvn -q package` 与 `java -cp target/classes course.LegacyModel`。
5. 预期输出：`LOMBOK_LEGACY_PASS getter=1 redacted=1`；class major version 为 `52`。
6. 最终清理 `modern_dir` 与 `legacy_dir` 对应的 `/tmp` 临时目录，并确认路径不存在。

## 如何使用

1. 先列出字段职责：必填、可选、可变、身份、敏感和集合。
2. 普通 DTO 先用 record 或显式 Java 写出合同，确认调用方真正需要的 API。
3. 对 Java 8 类逐个添加稳定 Lombok 注解，避免直接从 `@Data` 开始。
4. 将 Lombok 和 compiler plugin 版本写入构建文件，不依赖 IDE 插件替代 Maven 配置。
5. 对生成的 getter、builder、equals/hashCode、集合边界和 toString 写行为检查。
6. 升级 Lombok 或 JDK 时，在干净环境重复编译和行为反馈环。

## 适用与不适用场景

适合使用 Lombok：

1. Java 8 兼容模型需要减少明确、机械的 getter 或构造器样板。
2. 参数较多但创建入口受控的不可变命令对象需要 builder。
3. 团队已经把处理器版本、IDE 配置和 CI 构建统一管理。

不适合直接使用：

1. `@Data` 会暴露不应公开的 setter、相等字段或敏感文本。
2. 模型有复杂不变量，应通过显式构造器或静态工厂表达。
3. 继承层次的身份语义不清，生成 equals 可能破坏对称性。
4. Java 25 record 已能更直接表达透明数据载体。
5. 工具链不能稳定运行 annotation processor。

## 当前项目补充

冻结审计记录 `AdjustSignBO`、`DownloadDTO` 等类型使用 Lombok，说明阅读项目时必须识别编译期生成的
getter、setter 和构造器；源码中没有显式方法不代表运行时没有方法。`FileProcessBO` 与 `Hyzt` 只作为
`corrected` 风险场景：课程不复制业务字段，也不把全量可变访问器、未经审查的继承相等或完整 `toString`
作为推荐写法。项目路径与稳定符号已记录在 frontmatter `projectEvidence`。

## 旧版兼容写法

Java 8 没有 record 和 `List.copyOf`。值模型使用 final 普通类、显式/生成构造器，并用
`Collections.unmodifiableList(new ArrayList<>(source))` 创建独立只读快照。Lombok 固定为反馈环实际验证的
`1.18.30`；构建目标固定为 Java 8，class major version 必须为 `52`。

## 新旧版本差异

| 能力 | Java 25 / Lombok 1.18.42 | Java 8 / Lombok 1.18.30 |
| --- | --- | --- |
| 透明数据载体 | 优先 record | 普通 final 类或精确 Lombok 注解 |
| 集合快照 | `List.copyOf` | 先复制再 `Collections.unmodifiableList` |
| compiler 目标 | `release=25`，major 69 | `source/target=8`，major 52 |
| 生成合同验证 | Maven 编译、运行反馈、可选 delombok | Maven 编译、运行反馈、可选 delombok |
| 课程定位 | 现代正确用法 | 兼容现有旧项目，不反向限制现代设计 |

## 常见易错点

### 易错点 1：把 `@Data` 用在所有实体上

1. **现象**：任何字段都能 setter，日志里出现完整对象，集合键偶发查找失败。
2. **触发条件**：类级 `@Data` 同时生成访问器、基于非 static 且非 transient 字段的 equals/hashCode 和 toString。
3. **原因**：生成器不知道哪些字段是身份、哪些字段是秘密、哪些字段必须只读。
4. **后果**：不变量可被破坏，敏感值泄露，可变 hash 键无法定位。
5. **错误示例**：`@Data class Account { String id; String token; BigDecimal balance; }`。
6. **正确写法**：拆成 `@Getter`、显式构造器、included 身份字段和排除 token 的 `@ToString`。
7. **影响版本**：Lombok 1.18.42 与 1.18.30 均适用；Java 25 record 可替代简单快照。
8. **验证方式**：测试无 public setter、token 不在 toString、修改余额不改变身份 hash。
9. **来源依据**：`lombok-data`、`lombok-tostring`、`java-equals`、`java-hashcode`。

### 易错点 2：builder 绕过字段默认值

1. **现象**：普通构造得到 `PENDING`，builder 构造却得到 null。
2. **触发条件**：字段有初始化表达式但没有 `@Builder.Default`。
3. **原因**：builder 使用自己的字段存储，不会自动读取类字段初始化值。
4. **后果**：持久化或状态机收到非法初始状态。
5. **错误示例**：`@Builder class Job { private Status status = Status.PENDING; }`。
6. **正确写法**：加 `@Builder.Default`，并在 `build()` 后对跨字段规则再校验。
7. **影响版本**：Lombok 1.16.16+ 支持该注解；旧版本需显式构造器。
8. **验证方式**：只用 `Job.builder().build()` 断言默认状态；若还要验证无参路径，先显式声明对应构造器。
9. **来源依据**：`lombok-builder`。

### 易错点 3：把只读视图当成不可变副本

1. **现象**：调用方不能 add，但原列表变化后对象内容仍改变。
2. **触发条件**：使用 `Collections.unmodifiableList(source)` 直接包裹可变 source。
3. **原因**：unmodifiableList 是只读视图，不复制元素引用或列表结构。
4. **后果**：跨线程或缓存中的值悄悄变化。
5. **错误示例**：构造器直接保存外部传入的 `ArrayList`。
6. **正确写法**：Java 25 使用 `List.copyOf(source)`；Java 8 使用 `new ArrayList<>(source)` 再包裹。
7. **影响版本**：`List.copyOf` 自 Java 10 提供；Java 8 使用复制构造。
8. **验证方式**：构造后修改 source，断言对象列表不变；再断言对象列表拒绝 add。
9. **来源依据**：`java-list-copyof`、`java-unmodifiable-list`。

### 易错点 4：继承时忽略 equals/hashCode 合同

1. **现象**：父子对象双向 equals 结果不一致，HashSet 出现重复逻辑对象。
2. **触发条件**：子类生成 equals 时未审查 `callSuper` 和新增字段。
3. **原因**：继承层次改变了身份字段集合，生成器无法推断业务身份。
4. **后果**：缓存、去重和权限判断出现不一致。
5. **错误示例**：父类 ID 参与比较，子类只比较自己的 label。
6. **正确写法**：优先使用 final 值类或组合；必须继承时显式 `callSuper` 并写双向测试。
7. **影响版本**：Lombok 1.18.42 与 1.18.30 均适用；课程不引入实验性继承 builder。
8. **验证方式**：测试自反、对称、传递和 HashSet 去重。
9. **来源依据**：`lombok-equals`、`lombok-builder`、`java-equals`、`java-hashcode`。

### 易错点 5：只在 IDE 中验证生成方法

1. **现象**：本地可以跳转 getter，CI 却提示找不到方法。
2. **触发条件**：IDE 开启 annotation processing，但 Maven 没有配置处理器或版本不兼容。
3. **原因**：IDE 索引和真实编译器是两条不同链路。
4. **后果**：发布失败或生成合同在不同环境漂移。
5. **错误示例**：只运行 IDE 编译，不运行干净目录的 `mvn test`。
6. **正确写法**：将 Lombok 放入构建依赖，固定 compiler 配置，并把行为测试纳入 CI。
7. **影响版本**：Java 25 与 Java 8 都需要匹配的 Lombok 处理器版本。
8. **验证方式**：在干净 `/tmp` fixture 运行 Maven package 和反馈主类；需要展开代码时另行运行 delombok。
9. **来源依据**：`java-annotation-processing`、`maven-compiler`、`lombok-delombok`。

## 安全注意

1. `@ToString`、`@Data` 和异常字符串可能把访问令牌、口令、连接串或个人数据写入日志。
2. 敏感字段使用 `@ToString.Exclude` 只是最低防线；日志调用仍应只记录允许字段，并在输出前脱敏。
3. 不要用 Lombok setter 让请求体批量覆盖服务端控制字段；输入 DTO 与领域对象保持不同合同。
4. 反馈环只使用 `secret-token` 这样的虚构值，不使用真实凭据、内网地址或业务数据。
5. 安全依据来自 frontmatter 的 `owasp-logging` 与 `owasp-mass-assignment`；Lombok 文档只证明生成行为，不证明日志或输入绑定安全。

## 如何验证

1. 在 `/tmp` 创建现代和 legacy 两个独立 Maven 工程，不向仓库添加测试文件。
2. 现代工程执行 `mvn -q package` 后运行反馈主类，必须得到固定 `LOMBOK_FEEDBACK_PASS`。
3. 再次运行同一现代命令，输出必须一致，证明结果不是偶然状态。
4. 读取 class header：Java 25 为 major `69`，Java 8 为 major `52`。
5. legacy 工程执行 `mvn -q package` 后运行反馈主类，必须得到固定 `LOMBOK_LEGACY_PASS`。
6. 删除 annotation processor 配置的负向构建应失败；恢复后重新通过，证明 CI 依赖真实构建而非 IDE。
7. 需要审查具体生成实现时运行官方 delombok 工具；这一步是可选审查，不冒充本课已执行证据。

## 练习

:::exercise
### 练习：把全量 `@Data` 改成精确合同

**要求：** 创建 `ApiCredential`，字段为 `id`、`displayName`、`token`。只公开读取；仅 `id` 参与
equals/hashCode；`token` 不出现在 toString；用 builder 构造。

**验收：** 两个相同 `id`、不同 `displayName` 的对象相等且 hashCode 相同；输出不含 token；不存在
public setter。

**参考答案：** 使用 `@Getter`、`@Builder`、
`@EqualsAndHashCode(onlyExplicitlyIncluded = true)`、`@EqualsAndHashCode.Include` 与
`@ToString.Exclude`，再写四条行为断言。
:::

## 本节小结

- Lombok 在编译期生成代码，运行时不会替你决定对象合同。
- 先定义构造、可变、相等、集合和日志边界，再选择最小稳定注解集合。
- `@Data` 不是默认模板；builder、equals/hashCode 和 toString 都要按业务职责验证。
- Java 25 优先使用 record 与 `List.copyOf`；Java 8 用精确 Lombok 注解和防御性复制兼容。
- 当前验证只声称实际执行的 Maven package、反馈主类和 class version，不把可选 delombok 写成已运行结果。
