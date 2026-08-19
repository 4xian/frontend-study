---
id: backend.java.learn.intermediate.layers-dto-and-service-boundaries
type: lesson
title: 分层架构、DTO、Service 与仓储接口
summary: 把一次请求拆成清晰的传输、用例、领域和持久化职责，让数据与依赖只穿过明确边界
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 150
prerequisites:
  - backend.java.learn.intermediate.bean-validation-and-input-contracts
objectives:
  - 能画出 HTTP 请求经过 Controller、DTO、Service、Repository 和持久化适配器的完整路径。
  - 能按输入、输出、业务决定和存储职责判断一个类应该放在哪个边界。
  - 能使用输入 DTO 限定客户端可写字段，使用输出 DTO 限定客户端可读字段。
  - 能解释 Java 25 record 的浅层不可变边界，并写出 Java 8 final class 兼容版本。
  - 能把 Service 方法设计成完整业务用例，而不是 Mapper 的一行转发。
  - 能用 Repository 接口隔离存储技术，并区分 Repository、MyBatis Mapper 与 DTO mapper。
  - 能在 DTO、领域对象和持久化对象之间进行显式映射。
  - 能通过构造器注入表达必需依赖，并检查源码依赖方向。
  - 能区分解析、输入格式校验、业务校验、授权与数据库约束。
  - 能把事务边界放在完整业务用例外层，并识别默认回滚与 self-invocation 陷阱。
  - 能按用例和变化原因拆分超大 Controller 或 Service，而不是机械按行数切文件。
recap:
  - 分层首先是职责和依赖方向，包名与注解只是表达这些约定的工具。
  - Controller 适配 HTTP，Service 编排用例，Repository 隐藏存储，领域对象维护业务规则。
  - 输入 DTO 与输出 DTO 分别是可写字段和可读字段的允许列表，不能直接拿持久化对象代替。
  - Repository 面向内层业务，MyBatis Mapper 面向 SQL，DTO mapper 只负责 Java 边界对象转换。
  - 显式映射让默认值、缺失值、枚举和敏感字段的处理可以被阅读和验证。
  - 构造器注入让必需依赖在创建对象时一次给全，也让纯 Java 反馈环更容易替换适配器。
  - 输入校验不能代替业务不变量与数据库约束；每层提供的是不同保证。
  - 事务应包围需要共同成功或失败的用例，并以最终数据状态验证，而不是只看注解。
related: []
tags:
  - Java
  - 分层架构
  - DTO
  - Controller
  - Service
  - Repository
  - Mapper
  - 依赖方向
  - 事务边界
appliesTo: Java 25、Spring Boot 4.1.0、Spring Framework 7.0.8 与 MyBatis 3.5.19 概念主线；Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE 兼容补充
modernBaseline:
  java: '25'
  springBoot: 4.1.0
  springFramework: 7.0.8
  mybatisDocumentation: 3.5.19
legacyBaseline:
  java: '8'
  springBoot: 2.3.12.RELEASE
  springFramework: 5.2.15.RELEASE
verifiedAt: 2026-08-15
sources:
  - id: spring-boot-system-requirements
    title: Spring Boot 4.1.0 - System Requirements
    url: https://docs.spring.io/spring-boot/system-requirements.html
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0 / Spring Framework 7.0.8
    claims:
      - Spring Boot 4.1.0 支持 Java 17 至 Java 26，Java 25 位于支持范围
      - Spring Boot 4.1.0 要求 Spring Framework 7.0.8 或以上
  - id: spring-component-stereotypes
    title: Spring Framework - Classpath Scanning and Managed Components
    url: https://docs.spring.io/spring-framework/reference/core/beans/classpath-scanning.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - Controller、Service 与 Repository stereotype 表达不同应用角色
      - 注解可以帮助扫描和工具识别，但不会自动阻止跨层依赖
  - id: spring-dependency-injection
    title: Spring Framework - Dependency Injection
    url: https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - 依赖可以通过构造器参数显式提供
      - 构造器注入适合必需依赖，参数过多可能说明职责过多
  - id: spring-mvc-request-body
    title: Spring MVC - RequestBody
    url: https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestbody.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - 请求体由消息转换器读取为方法参数
      - RequestBody 可配合 jakarta.validation.Valid 触发标准校验
  - id: spring-mvc-validation
    title: Spring MVC - Validation
    url: https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-validation.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - command object 校验与方法参数校验有不同触发合同
      - Valid 本身不是约束，校验必须由集成层实际触发
  - id: spring-service-api
    title: Spring Framework API - Service
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/stereotype/Service.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - Service 可表达模型中的独立操作或业务 facade
  - id: spring-repository-api
    title: Spring Framework API - Repository
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/stereotype/Repository.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - Repository 封装存储、读取和查询职责
      - Repository 与传统 DAO 的具体含义需要由应用合同说明
  - id: spring-transactional
    title: Spring Framework - Using Transactional
    url: https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - 默认传播为 REQUIRED，默认仅 RuntimeException 与 Error 触发回滚
      - proxy 模式下 self-invocation 不经过事务代理
  - id: spring-transaction-rollback
    title: Spring Framework - Rolling Back a Declarative Transaction
    url: https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/rolling-back.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - 未处理异常沿调用栈传播后由事务基础设施判断回滚
      - checked exception 需要按合同显式配置回滚规则
  - id: spring-data-transactionality
    title: Spring Data JPA - Transactionality
    url: https://docs.spring.io/spring-data/jpa/reference/jpa/transactions.html
    sourceType: official-reference
    appliesTo: Spring Data JPA 4.1.0
    claims:
      - 多个 Repository 调用可以由 facade 或 Service 定义统一事务边界
  - id: jls25-records
    title: JLS 25 - Record Classes
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.10
    sourceType: specification
    appliesTo: Java 25
    claims:
      - record header 声明组件，编译器提供字段、访问器和规范构造器合同
  - id: jep395-records
    title: OpenJDK JEP 395 - Records
    url: https://openjdk.org/jeps/395
    sourceType: official-reference
    appliesTo: Java 16 及以上
    claims:
      - record 是透明数据载体
      - record 不会让组件引用的可变对象自动深度不可变
  - id: mybatis-java-api
    title: MyBatis 3.5.19 - Java API
    url: https://mybatis.org/mybatis-3/java-api.html
    sourceType: official-reference
    appliesTo: MyBatis 3.5.19 documentation
    claims:
      - Mapper interface 方法与 mapped statement 建立对应合同
      - 参数和返回类型必须匹配语句结果
  - id: mybatis-mapper-xml
    title: MyBatis 3.5.19 - Mapper XML Files
    url: https://mybatis.org/mybatis-3/sqlmap-xml.html
    sourceType: official-reference
    appliesTo: MyBatis 3.5.19 documentation
    claims:
      - resultMap 显式描述数据库列到 Java 属性或构造器的映射
  - id: jakarta-persistence-3-2
    title: Jakarta Persistence 3.2 Specification
    url: https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2
    sourceType: specification
    appliesTo: Jakarta Persistence 3.2
    claims:
      - 持久化实体及对象关系映射拥有独立的存储合同
  - id: jakarta-validation-3-1
    title: Jakarta Validation 3.1 Specification
    url: https://jakarta.ee/specifications/bean-validation/3.1/jakarta-validation-spec-3.1.html
    sourceType: specification
    appliesTo: Jakarta Validation 3.1
    claims:
      - 约束可以声明在字段、属性、参数和返回值上
      - 声明约束后仍需要集成层、代理或 Validator 实际触发
  - id: owasp-input-validation
    title: OWASP Input Validation Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: Input validation
    claims:
      - 用户输入需要服务端允许列表校验
      - 语法校验与结合业务上下文的语义校验不同
  - id: owasp-mass-assignment
    title: OWASP Mass Assignment Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: Request data binding
    claims:
      - 专用输入 DTO 可以限制客户端可写字段
      - 允许列表优先于依赖内部对象的可写属性
  - id: owasp-api-property-authorization
    title: OWASP API3:2023 Broken Object Property Level Authorization
    url: https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/
    sourceType: security-standard
    appliesTo: OWASP API Security 2023
    claims:
      - 输入与输出都应逐项选择允许暴露的属性
      - 通用对象序列化可能意外暴露内部字段
  - id: archunit-layer-checks
    title: ArchUnit 1.4.2 - User Guide
    url: https://www.archunit.org/userguide/html/000_Index.html
    sourceType: engineering-reference
    appliesTo: ArchUnit 1.4.2
    claims:
      - 可以声明分层访问方向并检查包循环依赖
  - id: spring-boot-2-3-system-requirements
    title: Spring Boot 2.3.12 - System Requirements
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#system-requirements
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - 支持 Java 8 至 Java 15，并要求 Spring Framework 5.2.15.RELEASE 或以上
  - id: spring-5-request-body
    title: Spring Framework 5.2.15 - RequestBody
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/web.html#mvc-ann-requestbody
    sourceType: official-reference
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - legacy MVC 校验使用 javax.validation.Valid
  - id: spring-5-transactions
    title: Spring Framework 5.2.15 - Declarative Transactions
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/data-access.html#transaction-declarative-annotations
    sourceType: official-reference
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - proxy 模式的外部调用边界与 self-invocation 限制适用于 legacy 线
projectEvidence:
  - file: dzzz-app/src/main/java/com/tdh/bdzz/service/AiXntjService.java
    symbol: com.tdh.bdzz.service.AiXntjService
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/dto/filter/BaseFilterDTO.java
    symbol: com.tdh.bdzz.dto.filter.BaseFilterDTO
    usage: observed
---

# 分层架构、DTO、Service 与仓储接口

## 一、为什么需要学习

浏览器发送“创建任务”请求后，程序要解析 JSON、检查输入、决定业务状态、保存数据，再返回状态码和
响应体。如果所有步骤都堆进一个 Controller，它会同时知道 HTTP、业务规则、SQL 和数据库对象；换一种
调用入口或存储方式时，整段代码都要跟着改，也很难只验证其中一个决定。

分层不是多建几个目录，而是给每类决定设边界。本课把一次请求拆成 Web 适配、应用用例、领域规则和
持久化适配四部分，再用 DTO 控制字段如何进入和离开系统。学完后，你能从零写出一个可运行的纯 Java
示例，也能看懂 Spring MVC、`@Transactional` 和 MyBatis Mapper 在完整链路中的位置。

## 二、学习目标

- 能画出请求、业务决定、存储和响应的完整路径。
- 能判断 Controller、Service、Repository 与 Mapper 各自负责什么。
- 能为输入和输出建立不同 DTO，不直接暴露持久化对象。
- 能用构造器注入和接口保持内层不依赖外层框架。
- 能把不同种类的校验与事务放到能提供对应保证的位置。
- 能通过编译、运行结果和依赖检查验证边界，而不是只看包名。

## 三、前置术语

- **边界**：一组代码对外公开的输入、输出和责任范围。
- **层**：因职责和变化原因相近而放在一起的一组代码。
- **DTO**：Data Transfer Object，只为跨边界传输一组明确字段的数据对象。
- **用例**：调用者希望系统完成的一项业务动作，例如“创建任务”。
- **领域对象**：用业务名称表达身份、状态和规则的对象。
- **port**：内层声明自己需要的接口，例如“保存任务”；它不描述数据库实现。
- **adapter**：把 HTTP、数据库等外部技术转换为 port 或用例能够理解的形式。
- **依赖方向**：源码中的 import、字段类型和方法参数从哪个区域指向哪个区域。
- **业务编排**：按业务顺序调用规则与协作者，让一个用例完整结束。
- **不变量**：对象或数据在任何有效状态下都必须满足的规则。

## 四、零基础知识点详解

### 1. 一次请求为什么需要清晰边界

**它是什么：** 一次请求链路是输入从外部进入、经过业务决定与存储，再产生输出的全过程。边界让每一
段只理解自己必须知道的内容。

**有什么作用：** HTTP 变化时只改 Web 适配，数据库变化时只改持久化适配；业务用例仍能用纯 Java
调用和验证。

**什么时候使用：** 只要一个动作同时涉及输入、业务决定和外部资源，就先画边界。单文件练习也可以画，
不必等项目变大才分层。

**怎么使用：**

1. 写出外部输入和最终输出。
2. 标出只有业务才能做的决定。
3. 标出需要数据库或其他系统完成的动作。
4. 为每一段规定输入、输出和允许依赖。

**最小示例：**

```text
HTTP -> Controller -> CreateTaskRequest
     -> CreateTaskService -> TaskRepository
     <- TaskResponse <- application result
```

**运行结果：** 学习者能指出 HTTP 只停留在入口，数据库实现只停留在 Repository 后面。

**常见误区：** 返回值向外流动不表示内层反向依赖外层。依赖方向看源码类型，不看箭头画在左还是右。

### 2. Controller 是 HTTP 适配器

**它是什么：** Controller 把 HTTP method、URI、header、参数和 body 转换为应用层调用，再把结果转换为
HTTP status、header 与 response body。

**有什么作用：** 它隔离传输协议，让 Service 不需要知道 `ResponseEntity`、Servlet 或 JSON 转换器。

**什么时候使用：** 通过 Spring MVC 提供 HTTP 接口时使用。命令行、消息消费等入口应有各自的 adapter，
但可以调用同一个 Service。

**怎么使用：**

1. 接收一个专用输入 DTO。
2. 让 MVC 触发输入格式校验。
3. 调用一个名称明确的用例方法。
4. 把应用结果映射为输出 DTO 和 HTTP 状态。

**最小示例：** 下面的代码需要 Spring MVC 依赖。

```java
@RestController
final class TaskController {
    private final CreateTaskService service;
    private final TaskWebMapper webMapper;

    /** 注入创建任务用例和 Web 边界映射器。 */
    TaskController(CreateTaskService service, TaskWebMapper webMapper) {
        this.service = service;
        this.webMapper = webMapper;
    }

    /** 接收创建请求并返回允许公开的字段。 */
    @PostMapping("/tasks")
    TaskResponse create(@Valid @RequestBody CreateTaskRequest request) {
        CreateTaskCommand command = webMapper.toCommand(request);
        CreateTaskResult result = service.execute(command);
        return webMapper.toResponse(result);
    }
}
```

**运行结果：** Controller 只有绑定、调用和响应转换，不出现 SQL、数据库列名或多步业务规则。

**常见误区：** `@RestController` 只是角色标记，不会自动阻止 Controller 直接注入 Mapper。

### 3. 输入 DTO 是客户端可写字段的允许列表

**它是什么：** 输入 DTO 只声明某个操作允许客户端提交的字段。创建与修改即使字段相似，也可以拥有
不同 DTO。

**有什么作用：** 它稳定输入合同，并避免客户端顺便写入服务端生成的 `id`、状态、权限或审计字段。

**什么时候使用：** 外部 JSON、表单、消息或批量导入需要进入应用时使用。

**怎么使用：**

1. 从用例需求列出客户端必须提供的字段。
2. 删除由服务端生成或只有内部才能改变的字段。
3. 为必填、长度和格式声明输入约束。
4. 在 Web 边界把 DTO 映射成与 HTTP 无关的命令。

**最小示例：**

```java
import jakarta.validation.constraints.NotBlank;

public record CreateTaskRequest(@NotBlank String title) {}
```

**运行结果：** 客户端只能提交非空白 `title`，不能通过这个类型设置任务 `id` 或发布状态；Controller
参数上的 `@Valid` 会触发这条 Bean Validation 约束。

**常见误区：** 在内部 entity 上加一个忽略注解，不等于建立了可靠允许列表；新增 setter 后合同可能
悄悄扩大。

### 4. 输出 DTO 是客户端可读字段的允许列表

**它是什么：** 输出 DTO 逐项列出当前接口允许返回的字段，通常与输入 DTO 不同。

**有什么作用：** 它阻止内部备注、权限标记、密码散列或数据库审计列被通用序列化器意外返回。

**什么时候使用：** API 返回对象时使用，尤其是内部模型包含调用者不应看到的字段时。

**怎么使用：**

1. 从客户端真正需要的信息开始列字段。
2. 对每个字段检查调用者是否有读取权限。
3. 明确枚举、时间、金额和缺失值的外部表示。
4. 从应用结果显式映射，不直接序列化 entity 或 PO。

**最小示例：**

```java
public record TaskResponse(long id, String title, String status) {}
```

**运行结果：** 响应字段集合固定为 `id`、`title` 和 `status`，内部备注不会因模型新增 getter 而出现。

**常见误区：** 放进输出 DTO 只表示字段可能公开，资源级和字段级授权仍要根据当前调用者执行。

### 5. Java 25 record 是浅层数据载体

**它是什么：** record 用 header 声明固定组件，编译器提供 final 组件字段、访问器、规范构造器以及
基于组件的 `equals`、`hashCode` 和 `toString`。

**有什么作用：** DTO 的数据合同更紧凑，减少只为字段传输而写的样板代码。

**什么时候使用：** Java 16 及以上、对象主要用于传输固定数据且不需要继承普通类时使用。

**怎么使用：**

1. 在 record header 中只保留边界允许的组件。
2. 在紧凑构造器中做必要的归一化或防御性复制。
3. 对 `List`、数组等可变组件复制后再保存。
4. 不把 record 当成自动完成授权和深度不可变的工具。

**最小示例：**

```java
public record TagsRequest(List<String> tags) {
    /** 复制列表，防止调用者随后修改 record 内部看到的内容。 */
    public TagsRequest {
        tags = List.copyOf(tags);
    }
}
```

**运行结果：** 组件引用不能重新赋值，传入列表也被复制；列表元素自身是否可变仍由元素类型决定。

**常见误区：** record 是浅层数据载体，不会递归冻结所有组件指向的对象。

### 6. Java 8 用 final class 表达同一 DTO 合同

**它是什么：** Java 8 没有 record，可以用 `final class`、`private final` 字段、构造器和 getter 表达
固定输入。

**有什么作用：** 在 legacy 运行时保持字段清晰和创建后不可重新赋值，不必强行使用可变 JavaBean。

**什么时候使用：** Java 8 项目、或框架确实需要普通类时使用。

**怎么使用：**

1. 把类声明为 `final`。
2. 把必需字段声明为 `private final`。
3. 只提供一次性初始化构造器。
4. 只提供 getter，不为输入合同添加无必要 setter。

**最小示例：**

```java
public final class LegacyCreateTaskRequest {
    private final String title;

    /** 创建 Java 8 兼容的输入 DTO。 */
    public LegacyCreateTaskRequest(String title) {
        this.title = title;
    }

    /** 返回任务标题。 */
    public String getTitle() {
        return title;
    }
}
```

**运行结果：** Java 8 可以编译；标题只能在构造时设置一次。

**常见误区：** `final` 字段只限制引用重新赋值；若字段是可变集合，仍需要复制。

### 7. Service 用用例语言完成业务编排

**它是什么：** Service 的一个公开方法代表一个完整用例，例如 `createTask`，并按顺序协调领域规则和
Repository。

**有什么作用：** 它为业务校验、权限、事务和多个协作者提供共同入口，同时不依赖 HTTP。

**什么时候使用：** 一个动作不只是单次字段读写，或需要统一业务边界时使用。

**怎么使用：**

1. 用调用者目标命名方法，不用 `insertData` 这类数据库名称。
2. 接收 application command 或领域值，不接收 Web DTO、Servlet 类型。
3. 检查需要当前状态或已有数据才能判断的业务规则。
4. 调用领域行为和 Repository，最后返回应用结果。

**最小示例：**

```java
/** 执行创建任务用例。 */
public CreateTaskResult execute(CreateTaskCommand command) {
    Task task = Task.create(repository.nextId(), command.title());
    repository.save(task);
    return new CreateTaskResult(task.id(), task.title(), task.status());
}
```

**运行结果：** 同一方法可从 HTTP、命令行或测试调用，存储实现也可以替换。

**常见误区：** 只把 `mapper.insert()` 包在一个同名 Service 中，没有形成新的用例边界。

### 8. Repository port 用领域语言隐藏存储

**它是什么：** Repository port 是内层声明的接口，描述用例需要的保存和查询能力，不描述 SQL、表名或
MyBatis session。

**有什么作用：** application 只依赖稳定业务合同，数据库 adapter 可以在外层替换。

**什么时候使用：** 用例需要持久化、但不应知道具体数据库技术时使用。

**怎么使用：**

1. 用业务动词命名方法，例如 `save`、`findById`、`existsByTitle`。
2. 参数和返回值使用领域类型或应用投影。
3. 在 persistence 包实现接口。
4. 在启动装配处把实现传给 Service。

**最小示例：**

```java
public interface TaskRepository {
    /** 取得下一个任务标识。 */
    long nextId();

    /** 保存任务。 */
    void save(Task task);
}
```

**运行结果：** Service 不 import JDBC、MyBatis 或数据库 row 类型。

**常见误区：** 加上 `@Repository` 注解并不会自动把一个暴露 SQL 类型的 DAO 变成领域 port。

### 9. MyBatis Mapper 适配 Java 方法与 SQL statement

**它是什么：** MyBatis Mapper interface 的方法与 mapped statement 对应，`resultMap` 再把数据库列
映射到 Java 属性、字段或构造器参数。

**有什么作用：** 它把 SQL 执行细节留在 persistence adapter，避免 Web 和业务层知道 statement id。

**什么时候使用：** 选择 MyBatis 作为持久化实现时使用；本课只解释位置，配置在后续任务展开。

**怎么使用：**

1. 让方法参数与 SQL 参数合同一致。
2. 让返回类型与单行、集合或更新计数一致。
3. 用 `resultMap` 明确列名与 Java 模型的转换。
4. 由 Repository adapter 调用 Mapper，不由 Controller 直接调用。

**最小示例：** 下面只展示 Mapper 接口合同。

```java
interface TaskSqlMapper {
    /** 插入一行任务持久化记录。 */
    int insert(TaskRow row);
}
```

**运行结果：** SQL 边界只看到 `TaskRow`；领域层不需要 MyBatis annotation。

**常见误区：** Mapper 方法能运行不代表它应该承担权限、HTTP 响应或跨多表业务编排。

### 10. MyBatis Mapper 与 DTO mapper 不是同一种映射器

**它是什么：** MyBatis Mapper 连接 Java 与 SQL；DTO mapper 或 assembler 连接两种 Java 边界模型。

**有什么作用：** 区分后，学习者能知道一段映射代码是在处理数据库列，还是在选择外部字段。

**什么时候使用：** 项目同时有 Mapper XML、Repository 和多种 DTO 时必须明确命名。

**怎么使用：**

1. SQL 映射器放在 persistence 区域并使用 `SqlMapper` 等明确名称。
2. Web 映射器只做 request/command 与 result/response 转换。
3. 领域与持久化转换由 persistence adapter 完成。
4. 不创建一个反射工具同时复制所有模型。

**最小示例：**

```text
TaskSqlMapper: TaskRow <-> database columns
TaskWebMapper: CreateTaskRequest -> command; result -> TaskResponse
```

**运行结果：** 阅读类名和包名就能判断映射跨越哪条边界。

**常见误区：** 因为中文都叫“Mapper”，就让同一类同时拼 SQL 和生成响应 DTO。

### 11. DTO、领域对象与持久化对象按变化原因隔离

**它是什么：** 输入/输出 DTO 因 API 合同变化，领域对象因业务规则变化，持久化对象因表和映射变化。

**有什么作用：** 一种变化不会无条件扩散到其他边界，也不会把内部字段顺带变成公开字段。

**什么时候使用：** 外部字段、业务规则和数据库结构开始独立演进时使用。极小 CRUD 可以暂时共用类型，
但必须清楚它承担了哪些合同。

**怎么使用：**

1. 先写每个类型服务的调用者。
2. 只放该调用者需要的字段与行为。
3. 在边界处显式转换。
4. 用编译影响和字段断言验证变化只停留在对应 adapter。

**最小示例：**

```text
CreateTaskRequest: title
Task: id, title, status, publish()
TaskRow: id, title, status_code, internal_note
TaskResponse: id, title, status
```

**运行结果：** `internal_note` 只存在于存储模型，不进入响应。

**常见误区：** 字段当前相同不表示三种模型拥有相同生命周期和访问权限。

### 12. 显式映射让字段决定可见

**它是什么：** 显式映射逐项读取来源字段并构造目标对象，同时决定归一化、默认值和丢弃字段。

**有什么作用：** 模型新增字段时不会自动穿透边界，代码审查也能直接看到敏感字段是否被排除。

**什么时候使用：** 边界字段较少、需要安全控制或缺失值语义重要时优先使用。

**怎么使用：**

1. 对字符串明确是否 trim、是否允许空白。
2. 对枚举明确未知值如何失败。
3. 对集合明确是否复制和是否允许 null 元素。
4. 对输出只选择允许公开的字段。

**最小示例：**

```java
/** 把领域对象转换为公开响应，不复制 internalNote。 */
static TaskResponse toResponse(Task task) {
    return new TaskResponse(task.id(), task.title(), task.status());
}
```

**运行结果：** 添加内部字段后，响应字段集合不会自动变化。

**常见误区：** `copyProperties` 少写几行不等于合同更简单；隐式复制会隐藏 null、枚举和敏感字段决定。

### 13. domain、application、web、persistence 与 bootstrap 的依赖方向

**它是什么：** 五个分区先按职责确定源码依赖方向：domain 保存业务规则，application 编排用例，web
适配 HTTP，persistence 适配存储，bootstrap 负责创建并连接具体实现。构造器注入把这种方向写进字段和
参数类型。

**有什么作用：** 内层不知道 Servlet、MyBatis 或具体数据库，换入口和存储时不用重写业务规则；对象
创建后也能一次得到全部必需依赖。

**什么时候使用：** 划分新功能、拆分跨层类，或发现 application import web、persistence 时使用。

**怎么使用：**

1. 先列出五个分区各自允许承担的决定。
2. 让 domain 不依赖其他分区，让 application 只依赖 domain 与内层 port。
3. 让 web 依赖 application 公共合同，不依赖 persistence。
4. 让 persistence 实现 domain/application 声明的 port，不让内层 import adapter。
5. 只在 bootstrap 中同时看见接口与实现，并通过构造器完成组装。
6. 用源码依赖检查禁止反向依赖和包循环。

**最小示例：**

```text
bootstrap -> web -> application -> domain
     |                    |
     +-> persistence -----+

禁止：application -> web、application -> persistence、web -> persistence
```

```java
private final TaskRepository repository;

/** 注入任务存储 port。 */
public CreateTaskService(TaskRepository repository) {
    this.repository = repository;
}
```

**运行结果：** 纯 Java 示例可以传入内存 adapter；Spring 应用可以在 bootstrap 中传入数据库 adapter，
application 的输入、输出和字段类型仍不出现 Web 或持久化类型。

**常见误区：** 包名看起来分层不代表依赖正确；把 `ApplicationContext.getBean()` 藏进方法中同样会
隐藏真实方向，并让隔离验证变难。

### 14. 解析、校验、授权与数据库约束提供不同保证

**它是什么：** 同一个输入依次经过消息解析、DTO 形状校验、业务语义、权限判断和数据库最终约束。

**有什么作用：** 每类失败在最有信息且能提供保证的位置处理，并覆盖并发竞争。

**什么时候使用：** 输入会改变业务状态或持久化数据时使用。

**怎么使用：**

1. 消息转换器确认 JSON 能否解析为 DTO。
2. DTO 约束检查必填、长度、格式和集合大小。
3. Service/domain 检查状态、时间关系、资源存在性和业务规则。
4. 授权逻辑检查当前调用者能否对当前资源执行动作。
5. 数据库约束最终保证唯一、非空和外键等存储不变量。

**最小示例：** DTO 的 `@NotBlank` 提前返回可读错误；Service 的 `existsByTitle` 提前说明名称冲突；
数据库 unique constraint 仍处理两个并发请求同时通过预检的竞争。

**运行结果：** 普通错误尽早得到清楚提示，并发下数据库仍不接受重复数据。

**常见误区：** Controller 检查过一次就删除数据库约束，会在并发请求之间留下竞态窗口。

### 15. 事务边界围住完整业务用例

**它是什么：** 事务边界规定一组存储操作共同提交或共同回滚。Service 知道哪些操作属于同一用例。

**有什么作用：** “保存任务”和“保存审计记录”不会只成功一半。

**什么时候使用：** 一个用例包含多个必须原子完成的数据库操作时使用。

**怎么使用：**

1. 在公开 Service 用例入口声明事务。
2. 让所有 Repository 操作参与同一事务管理器。
3. 不吞掉需要触发回滚的异常。
4. 明确 checked exception 是否需要 `rollbackFor`。
5. 从代理外部调用事务方法，避免同类 self-invocation 假象。

**最小示例：** 下面的代码需要 Spring 事务依赖。

```java
/** 在同一事务中创建任务并写入审计。 */
@Transactional
public CreateTaskResult execute(CreateTaskCommand command) {
    Task task = createAndSave(command);
    auditRepository.saveCreated(task.id());
    return toResult(task);
}
```

**运行结果：** 正常时两条记录都存在；第二次写入抛运行时异常时两条记录都不存在。

**常见误区：** 只检查方法上有 `@Transactional`，却不故障注入并查询最终数据状态。

### 16. Controller、Service 或 Mapper 过大和跨层泄漏要按职责拆分

**它是什么：** 一个 Controller、Service 或 Mapper 同时处理多个用例、多个外部系统、不同事务、无关
查询结果或大量模型时，职责与变化原因混在一起；Web import SQL 类型、Service 返回响应类型也属于跨层
泄漏。

**有什么作用：** 按用例、业务能力或查询模型拆分后，每个类的依赖、事务、SQL 合同和反馈环更小，修改
影响更清楚。

**什么时候使用：** 新需求频繁修改同一大类、构造器依赖持续增加、测试必须准备许多无关协作者、Mapper
混入多个无关聚合的 statement/resultMap，或跨层 import 增多时考虑拆分。

**怎么使用：**

1. 列出类中所有公开用例、查询或 statement 及其依赖和返回模型。
2. Controller 与 Service 按共同业务目标和事务边界分组。
3. Mapper 按业务聚合或稳定查询职责拆分，把不同 resultMap 留在对应存储边界。
4. 把传输适配、业务决定和持久化细节分别移回对应分区。
5. 复跑原反馈环，并检查禁止依赖、SQL 映射和包循环没有新增失败。

**最小示例：** `TaskService` 同时创建、发布、报表导出和文件上传时，可先拆为
`CreateTaskService`、`PublishTaskService`、`ExportTaskReportService`。若 `TaskMapper` 同时承载
任务写入、审计报表和文件检索，可按稳定查询职责拆为对应 Mapper，而不是每 500 行切一个类。

**运行结果：** 每个用例只注入必要协作者，每个 Mapper 只维护相关 statement/resultMap，测试、事务和
SQL 验证范围都与业务动作一致。

**常见误区：** 行数只是复核信号。把一个长方法或一组无关 SQL 原样搬到多个互相调用的小类，没有减少
职责或跨层依赖。

### 17. 可执行反馈环证明边界真的成立

**它是什么：** 反馈环用编译、运行输出、字段断言、故障注入和依赖规则验证任务结论。

**有什么作用：** 它能发现“包名看起来分层，但 Web 仍依赖 persistence”或“有事务注解却没有回滚”。

**什么时候使用：** 新建或调整边界后立即使用，并在每次修复后复跑同一组检查。

**怎么使用：**

1. 用纯 Java 内存 Repository 运行完整创建用例。
2. 精确断言输入不能设置内部字段、输出没有内部字段。
3. 用架构规则检查禁止依赖和包循环。
4. 用临时数据库故障注入检查提交与回滚。
5. 用 Java 25 与 Java 8 工具链分别编译对应示例。

**最小示例：** 反馈环应输出以下结果。

```text
created|id=1|title=Java 从零学|status=DRAFT
mapping|responseFields=id,title,status|internalNoteExposed=false
architecture|serviceInput=application|serviceOutput=application|repositoryPort=domain
```

**运行结果：** 字段集合断言证明 `internalNote` 没有进入响应，Service 签名和依赖字段断言证明公开
application 边界没有换成 Web DTO 或具体 adapter，而不是只证明程序没有抛异常。

**常见误区：** 为让检查变绿而扩大允许依赖、删除断言或跳过失败分支，会失去反馈环的意义。

## 五、现代版本中的正确用法

现代主线先用 Java 25 的纯 Java 示例理解边界，再把 Spring MVC、Bean Validation、事务和数据库 adapter
接到外层。推荐依赖方向如下：

```text
bootstrap -> web -> application -> domain
     |          |          |
     +----> persistence ----+
```

`bootstrap` 可以看到所有实现以完成组装，但不承载业务规则。`web` 调用 application 公共合同，不依赖
persistence。`application` 依赖 domain 与 Repository port，不依赖 Servlet、MyBatis 或数据库 row。

## 六、核心接口与执行流程

一次“创建任务”按以下顺序执行：

1. Controller 把请求体绑定为 `CreateTaskRequest`。
2. Web mapper 把 request 转换为 `CreateTaskCommand`。
3. Web 边界检查标题是否满足输入格式。
4. Service 接收 command，归一化标题并创建领域对象。
5. Service 通过 `TaskRepository` 保存对象。
6. persistence adapter 把领域对象转换为 row 并执行存储。
7. Service 返回与 Web 无关的 `CreateTaskResult`。
8. Web mapper 只选择允许公开的字段生成 `TaskResponse`。
9. Controller 把 response DTO 写入 HTTP body。

## 七、从零跟着做

本反馈环使用 Java 25，不依赖 Spring 或第三方库。先从任意目录创建并进入临时工作区：

```bash
I11_WORKDIR=$(mktemp -d /tmp/java-i11-layering.XXXXXX)
cd "$I11_WORKDIR"
mkdir application domain infrastructure web
```

下面十一个文件都创建在该目录中。它们用真实类型签名证明 Web DTO、application command/result、
领域对象和 Repository port 没有混成同一层。

### 1. 第一步：创建 application command 与 result

`application/CreateTaskCommand.java`：

```java
package application;

public record CreateTaskCommand(String title) {
    /** 确保应用输入始终持有非空标题。 */
    public CreateTaskCommand {
        if (title == null) {
            throw new IllegalArgumentException("title must not be null");
        }
    }
}
```

`application/CreateTaskResult.java`：

```java
package application;

import domain.TaskStatus;

public record CreateTaskResult(long id, String title, TaskStatus status) {}
```

command 是 Service 的输入合同，result 是 Service 的输出合同。它们都不 import Web DTO。

### 2. 第二步：创建 Web DTO 与显式 mapper

`web/CreateTaskRequest.java`：

```java
package web;

public record CreateTaskRequest(String title) {
    /** 在纯 Java 反馈环中拒绝缺失或空白标题。 */
    public CreateTaskRequest {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("title must not be blank");
        }
    }
}
```

`web/TaskResponse.java`：

```java
package web;

public record TaskResponse(long id, String title, String status) {}
```

`web/TaskWebMapper.java`：

```java
package web;

import application.CreateTaskCommand;
import application.CreateTaskResult;

public final class TaskWebMapper {
    /** 把 HTTP 请求 DTO 转换为应用输入。 */
    public CreateTaskCommand toCommand(CreateTaskRequest request) {
        return new CreateTaskCommand(request.title());
    }

    /** 只选择允许公开的字段生成 HTTP 响应 DTO。 */
    public TaskResponse toResponse(CreateTaskResult result) {
        return new TaskResponse(result.id(), result.title(), result.status().name());
    }
}
```

### 3. 第三步：创建领域状态与领域对象

`domain/TaskStatus.java`：

```java
package domain;

public enum TaskStatus {
    DRAFT
}
```

`domain/Task.java`：

```java
package domain;

public final class Task {
    private final long id;
    private final String title;
    private final TaskStatus status;
    private final String internalNote;

    /** 创建满足领域不变量的草稿任务。 */
    private Task(long id, String title, TaskStatus status, String internalNote) {
        this.id = id;
        this.title = title;
        this.status = status;
        this.internalNote = internalNote;
    }

    /** 校验并创建由服务端填写内部备注的草稿任务。 */
    public static Task create(long id, String title) {
        String normalized = title.trim();
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException("title must not be blank");
        }
        return new Task(id, normalized, TaskStatus.DRAFT, "created-by-service");
    }

    /** 返回任务标识。 */
    public long id() {
        return id;
    }

    /** 返回归一化标题。 */
    public String title() {
        return title;
    }

    /** 返回任务状态。 */
    public TaskStatus status() {
        return status;
    }

    /** 返回只供系统内部使用的备注。 */
    public String internalNote() {
        return internalNote;
    }
}
```

`TaskStatus` 限定了合法状态集合；`internalNote` 则故意模拟不能进入响应的内部字段。

### 4. 第四步：声明 Repository port

`domain/TaskRepository.java`：

```java
package domain;

public interface TaskRepository {
    /** 取得下一个任务标识。 */
    long nextId();

    /** 保存任务。 */
    void save(Task task);

    /** 按标识查找任务。 */
    Task findById(long id);
}
```

### 5. 第五步：实现内存 persistence adapter

`infrastructure/InMemoryTaskRepository.java`：

```java
package infrastructure;

import domain.Task;
import domain.TaskRepository;
import java.util.LinkedHashMap;
import java.util.Map;

public final class InMemoryTaskRepository implements TaskRepository {
    private final Map<Long, Task> tasks = new LinkedHashMap<>();
    private long sequence = 1L;

    /** 创建空的内存任务仓库。 */
    public InMemoryTaskRepository() {}

    /** 取得并推进内存序列。 */
    @Override
    public long nextId() {
        return sequence++;
    }

    /** 按任务标识保存对象。 */
    @Override
    public void save(Task task) {
        tasks.put(task.id(), task);
    }

    /** 返回指定任务，不存在时明确失败。 */
    @Override
    public Task findById(long id) {
        Task task = tasks.get(id);
        if (task == null) {
            throw new IllegalArgumentException("task not found: " + id);
        }
        return task;
    }
}
```

### 6. 第六步：编写只依赖 application 与 domain 的 Service

`application/CreateTaskService.java`：

```java
package application;

import domain.Task;
import domain.TaskRepository;

public final class CreateTaskService {
    private final TaskRepository repository;

    /** 注入任务存储 port。 */
    public CreateTaskService(TaskRepository repository) {
        this.repository = repository;
    }

    /** 执行创建任务用例并返回应用结果。 */
    public CreateTaskResult execute(CreateTaskCommand command) {
        Task task = Task.create(repository.nextId(), command.title());
        repository.save(task);
        return new CreateTaskResult(task.id(), task.title(), task.status());
    }
}
```

Service 不知道 `CreateTaskRequest`、`TaskResponse` 或具体 Repository 实现。

### 7. 第七步：在 bootstrap 中组装、映射并断言

`TaskLessonMain.java`：

```java
import application.CreateTaskCommand;
import application.CreateTaskResult;
import application.CreateTaskService;
import domain.Task;
import domain.TaskRepository;
import infrastructure.InMemoryTaskRepository;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.List;
import web.TaskResponse;
import web.TaskWebMapper;
import web.CreateTaskRequest;

public final class TaskLessonMain {
    /** 组装 adapter、模拟 Web 映射并检查可观察边界。 */
    public static void main(String[] args) throws ReflectiveOperationException {
        TaskRepository repository = new InMemoryTaskRepository();
        CreateTaskService service = new CreateTaskService(repository);
        TaskWebMapper webMapper = new TaskWebMapper();

        String inputTitle = args.length == 0 ? "  整理 Java 笔记  " : args[0];
        CreateTaskRequest request = new CreateTaskRequest(inputTitle);
        CreateTaskCommand command = webMapper.toCommand(request);
        CreateTaskResult result = service.execute(command);
        TaskResponse response = webMapper.toResponse(result);
        Task stored = repository.findById(response.id());

        if (!inputTitle.trim().equals(stored.title())) {
            throw new AssertionError("title was not normalized");
        }
        if (!"created-by-service".equals(stored.internalNote())) {
            throw new AssertionError("internal note was not created by the server");
        }

        List<String> responseFields = Arrays.stream(TaskResponse.class.getRecordComponents())
                .map(component -> component.getName())
                .toList();
        if (!responseFields.equals(List.of("id", "title", "status"))) {
            throw new AssertionError("unexpected response fields: " + responseFields);
        }
        assertApplicationBoundary();

        System.out.println("created|id=" + response.id()
                + "|title=" + response.title()
                + "|status=" + response.status());
        System.out.println("mapping|responseFields=" + String.join(",", responseFields)
                + "|internalNoteExposed=" + responseFields.contains("internalNote"));
        System.out.println("architecture|serviceInput=application"
                + "|serviceOutput=application|repositoryPort=domain");
    }

    /** 检查 Service 的公开输入、输出和字段类型都位于允许分区。 */
    private static void assertApplicationBoundary() throws NoSuchMethodException {
        Method execute = CreateTaskService.class.getMethod("execute", CreateTaskCommand.class);
        if (execute.getReturnType() != CreateTaskResult.class) {
            throw new AssertionError("service output crossed into another layer");
        }
        if (CreateTaskService.class.getDeclaredFields().length != 1
                || CreateTaskService.class.getDeclaredFields()[0].getType()
                        != TaskRepository.class) {
            throw new AssertionError("service dependency crossed into an adapter");
        }
    }

    /** 禁止创建仅提供入口的工具对象。 */
    private TaskLessonMain() {}
}
```

### 8. 第八步：编译并观察结果

在包含以上文件的目录执行：

```bash
javac -Xlint:all -Werror \
  application/*.java domain/*.java infrastructure/*.java web/*.java TaskLessonMain.java
java TaskLessonMain
```

预期输出：

```text
created|id=1|title=整理 Java 笔记|status=DRAFT
mapping|responseFields=id,title,status|internalNoteExposed=false
architecture|serviceInput=application|serviceOutput=application|repositoryPort=domain
```

失败路径使用空白标题触发输入合同：

```bash
java TaskLessonMain '   '
```

预期进程以非 0 状态结束，并定位到 `CreateTaskRequest` 抛出的 `title must not be blank`。恢复时修正输入并
重新执行 `java TaskLessonMain`，应再次得到上方三行成功输出。随后清理并验证临时目录消失：

```bash
cd /tmp
find "$I11_WORKDIR" -depth -delete
test ! -e "$I11_WORKDIR"
```

这些断言会读取 response record 字段集合，并反射检查 Service 的 execute 签名和依赖字段；Web DTO、
具体 adapter 或 `internalNote` 一旦越界，程序会在成功输出前失败。事务提交与回滚则由“如何验证”中的
Spring Boot 4.1.0 / H2 临时反馈环检查。

## 八、如何使用

把这套边界应用到真实功能时，按以下顺序开始：

1. 先为一个用例写清输入、输出和必须共同成功的动作。
2. 创建专用输入 DTO 与输出 DTO。
3. 在 Service 中按用例编排领域行为和 Repository port。
4. 在 persistence adapter 中实现 Repository，必要时内部调用 MyBatis Mapper。
5. 在 Controller 中只做 HTTP 绑定、调用和响应转换。
6. 在 bootstrap 或 Spring 配置中完成构造器注入。
7. 用字段断言、失败分支、最终数据和依赖规则验证边界。

## 九、适用与不适用场景

**适用：**

- HTTP、消息或批处理需要复用同一个业务用例。
- 外部 DTO、业务对象和数据库模型会独立变化。
- 一个用例需要多个存储动作共同提交或回滚。
- 需要限制客户端可写或可读字段。

**不必机械套用：**

- 一次性、无外部副作用的极小练习不需要创建所有层。
- 一个接口若只会被一个 adapter 使用，不需要再包一层同样签名的一行转发类。
- 不要为了目录对称创建没有职责的 `Manager`、`Helper` 或 `Facade`。

## 十、当前项目补充

本节只使用冻结审计已经登记的路径与稳定符号，不重新读取 `dzzz-app` 源码。`observed` 表示项目中存在
相应角色或模型，不表示当前实现符合本课推荐边界，也不能据此断言某个文件现在仍有缺陷。

1. `com.tdh.bdzz.service.AiXntjService` 位于
   `dzzz-app/src/main/java/com/tdh/bdzz/service/AiXntjService.java`。它是冻结矩阵中“分层架构与业务编排”
   的代表符号，用于帮助学习者识别 Service 角色；具体职责是否需要拆分，必须在项目实战阶段重新取证。
2. `com.tdh.bdzz.dto.filter.BaseFilterDTO` 位于
   `dzzz-app/src/main/java/com/tdh/bdzz/dto/filter/BaseFilterDTO.java`。它是冻结矩阵中“请求、响应与 DTO
   模型边界”的代表符号，只证明项目存在 DTO 形态，不证明输入、输出和持久化模型已经正确隔离。
3. 冻结矩阵还把 Controller、Service 过载和模型职责混合作为风险线索；这些线索只用于决定本课要教授
   哪些检查方法。判断具体代码时，仍要逐项核对用例、依赖、事务和字段流向。

## 十一、Java 8 / Spring Boot 2.3 兼容写法

Java 8 没有 record。下面用同一任务创建用例验证 command、result、Service 和 Repository port；把代码
保存为临时目录中的 `LegacyTaskMain.java`：

```java
public final class LegacyTaskMain {
    static final class CreateTaskCommand {
        private final String title;

        /** 保存应用层输入。 */
        CreateTaskCommand(String title) {
            this.title = title;
        }

        /** 返回任务标题。 */
        String getTitle() {
            return title;
        }
    }

    static final class CreateTaskResult {
        private final long id;
        private final String title;

        /** 保存应用层输出。 */
        CreateTaskResult(long id, String title) {
            this.id = id;
            this.title = title;
        }
    }

    interface TaskRepository {
        /** 保存任务并返回标识。 */
        long save(String title);
    }

    static final class CreateTaskService {
        private final TaskRepository repository;

        /** 注入领域存储 port。 */
        CreateTaskService(TaskRepository repository) {
            this.repository = repository;
        }

        /** 执行创建任务用例。 */
        CreateTaskResult execute(CreateTaskCommand command) {
            String title = command.getTitle().trim();
            if (title.isEmpty()) {
                throw new IllegalArgumentException("title must not be blank");
            }
            return new CreateTaskResult(repository.save(title), title);
        }
    }

    /** 运行成功或失败反馈链。 */
    public static void main(String[] args) {
        TaskRepository repository = title -> 1L;
        CreateTaskService service = new CreateTaskService(repository);
        String title = args.length == 0 ? "整理 Java 8 笔记" : args[0];
        CreateTaskResult result = service.execute(new CreateTaskCommand(title));
        System.out.println("legacy|id=" + result.id + "|title=" + result.title
                + "|status=DRAFT|repositoryPort=domain");
    }

    /** 禁止创建仅提供入口的工具对象。 */
    private LegacyTaskMain() {}
}
```

在 Java 8 环境执行：

```bash
javac -source 8 -target 8 -Xlint:all -Werror LegacyTaskMain.java
java LegacyTaskMain
java LegacyTaskMain '   '
```

第一次运行输出 `legacy|id=1|title=整理 Java 8 笔记|status=DRAFT|repositoryPort=domain`；第二次以
`title must not be blank` 非 0 退出。修正输入并重跑第一条命令即可恢复，最后按前述 `find ... -delete`
清理临时目录。Java 8 与现代例子保持同一依赖方向，而不是只证明一个 DTO 能编译。

Spring Boot 2.3.12 / Framework 5.2.15 需要注意：

1. 校验 import 使用 `javax.validation.*`，不是现代 `jakarta.validation.*`。
2. Java 8 源码不能使用 record、`List.copyOf` 等后续版本 API。
3. `@Transactional` 的 proxy self-invocation 限制同样存在。
4. 构造器注入仍适合必需依赖，不需要改成静态服务定位。
5. 现代 Java 25 编译成功不能代替 Java 8 编译和运行验证。

## 十二、新旧版本差异

| 项目 | 现代主线 | legacy 补充 |
| --- | --- | --- |
| Java | Java 25 | Java 8 |
| DTO 简写 | record | final class、构造器、getter |
| Validation 包名 | `jakarta.validation.*` | `javax.validation.*` |
| Spring Boot | 4.1.0 | 2.3.12.RELEASE |
| Spring Framework | 7.0.8 | 5.2.15.RELEASE |
| 共同原则 | 输入输出分离、构造器注入、Service 用例、Repository port | 原则相同，语法与包名按旧版本调整 |

## 十三、易错点

:::pitfalls

### 错误：Controller 直接调用 MyBatis Mapper

**触发条件：** 为少写 Service，把 SQL Mapper 直接注入 Controller。

**原因：** Controller 因而同时依赖 HTTP 和 SQL 边界，用例入口不再独立。

**后果：** 业务校验和事务被拆散，命令行、消息消费等入口无法复用同一用例。

**错误示例：**

```java
final class TaskController {
    private final TaskSqlMapper mapper;
}
```

**正确写法：**

```java
final class TaskController {
    private final CreateTaskService service;
}
```

**影响版本：** Spring Framework 7.0.8 / 5.2.15 与 MyBatis 3.5.19。

**验证方式：** 用 ArchUnit 或同类规则禁止 `..web..` 依赖 `..persistence.mapper..`。

**来源：** `spring-component-stereotypes`、`spring-service-api`、`mybatis-java-api`、
`archunit-layer-checks`。

### 错误：请求和响应直接复用 entity 或 PO

**触发条件：** 只因字段相似就把数据库对象作为 `@RequestBody` 和返回值。

**原因：** 一个类型同时承担客户端可写字段、客户端可读字段和存储字段三份合同。

**后果：** 客户端可能写入状态或权限字段；新增内部 getter 还可能扩大响应。

**错误示例：**

```java
/** 创建任务并直接暴露持久化对象。 */
TaskEntity create(@RequestBody TaskEntity request) {
    return repository.save(request);
}
```

**正确写法：**

```java
/** 使用独立输入和输出合同创建任务。 */
TaskResponse create(@RequestBody CreateTaskRequest request) {
    CreateTaskResult result = service.execute(webMapper.toCommand(request));
    return webMapper.toResponse(result);
}
```

**影响版本：** 现代与 legacy；风险不依赖 Java 版本。

**验证方式：** 发送额外内部字段并精确断言响应字段集合，确认内部值没有变化也没有泄漏。

**来源：** `owasp-mass-assignment`、`owasp-api-property-authorization`。

### 错误：Service 接收 Servlet 类型或返回 ResponseEntity

**触发条件：** 把 `HttpServletRequest`、`MultipartFile` 或 `ResponseEntity` 一直传进业务层。

**原因：** 应用用例的公开签名依赖了 Web adapter 类型。

**后果：** 用例只能从 HTTP 调用，纯 Java 测试和消息入口都必须模拟 Web 容器。

**错误示例：**

```java
/** 把 Web 类型泄漏到应用用例。 */
ResponseEntity<TaskResponse> execute(HttpServletRequest request) {
    return ResponseEntity.ok(createFrom(request));
}
```

**正确写法：**

```java
/** 只接收并返回应用层合同。 */
CreateTaskResult execute(CreateTaskCommand command) {
    return create(command);
}
```

**影响版本：** Spring Framework 7.0.8 / 5.2.15。

**验证方式：** 不启动 Spring MVC，直接构造 Service 并完成用例。

**来源：** `spring-component-stereotypes`、`spring-service-api`、`archunit-layer-checks`。

### 错误：吞掉运行时异常后期待事务回滚

**触发条件：** Service catch 异常、只记录日志并正常返回。

**原因：** 异常没有越过事务 interceptor，事务基础设施看见的是正常返回。

**后果：** 默认事务可能提交已经完成的部分操作，任务与审计记录出现不一致。

**错误示例：**

```java
try {
    saveTaskAndAudit(command);
} catch (RuntimeException error) {
    log.warn("save failed");
    return false;
}
```

**正确写法：**

```java
try {
    saveTaskAndAudit(command);
} catch (RuntimeException error) {
    log.warn("save failed", error);
    throw error;
}
```

**影响版本：** Spring Framework 7.0.8 / 5.2.15。

**验证方式：** 第二次写入故意失败，查询数据库确认第一次写入也不存在。

**来源：** `spring-transactional`、`spring-transaction-rollback`、`spring-5-transactions`。

### 错误：只靠同类方法上的 Transactional

**触发条件：** 同一个对象内直接调用另一个带 `@Transactional` 的方法。

**原因：** 默认 proxy 模式只拦截经代理进入的外部调用，`this` 调用绕过代理。

**后果：** 实际事务与阅读预期不同，失败分支可能留下部分写入。

**错误示例：**

```java
this.saveTaskAndAudit(command);
```

**正确写法：**

```java
transactionalTaskService.saveTaskAndAudit(command);
```

**影响版本：** Spring Framework 7.0.8 / 5.2.15。

**验证方式：** 故障注入后检查最终数据，而不是只反射查 annotation。

**来源：** `spring-transactional`、`spring-5-transactions`。

### 错误：按固定行数机械拆分类

**触发条件：** 看到大类就每若干行切一个新类。

**原因：** 拆分依据是文本长度，而不是用例、变化原因、事务和依赖集合。

**后果：** 小类仍共享所有依赖并互相循环调用，职责没有变清楚。

**错误示例：**

```java
final class TaskServicePart1 {
    private final AllDependencies dependencies;
}

final class TaskServicePart2 {
    private final AllDependencies dependencies;
}
```

**正确写法：**

```java
final class CreateTaskService {
    private final TaskRepository repository;
}

final class ExportTaskReportService {
    private final ReportRepository repository;
}
```

**影响版本：** 所有 Java 与 Spring 版本。

**验证方式：** 比较拆分前后每个用例需要的依赖、反馈环范围与循环依赖数量。

**来源：** `archunit-layer-checks`、冻结项目风险证据 `JAVA-RISK-001`、`JAVA-RISK-002`、
`JAVA-RISK-004`。
:::

## 十四、安全与性能边界

- 输入 DTO 只列客户端允许写入的字段，输出 DTO 只列当前调用者允许读取的字段。
- 服务端仍要执行资源级和字段级授权，不能把 DTO 当成完整授权机制。
- 显式映射应处理 null、未知枚举、集合复制和敏感字段丢弃。
- 分层本身不保证更快；过多无职责 wrapper 会增加阅读和调用链成本。
- 事务范围只覆盖需要原子性的数据库工作，不把网络等待和响应渲染无条件包入长事务。
- 性能结论必须来自目标用例、依赖和数据库的测量，不能用类数量推断性能。

## 十五、如何验证

完成一个分层用例后，至少检查：

1. 现代示例在 Java 25 下使用 `-Xlint:all -Werror` 编译并输出预期文本。
2. legacy DTO 与同一用例在 Java 8 下编译运行。
3. 输入类型不存在服务端生成字段，输出类型不存在内部字段。
4. Service 可以用内存 Repository 独立运行，不启动 Web 或数据库。
5. Web 不依赖 persistence，application 不依赖 Web、Servlet 或 MyBatis。
6. 正常分支提交全部数据，故障分支回滚全部数据。
7. 所有临时 fixture、数据库和浏览器输出位于 `/tmp`，完成后清理并确认不存在。

### 1. Spring Boot 4.1.0 / H2 事务反馈环

下面的临时工程只验证“一个 Service 用例中的两次写入共同提交或共同回滚”。它使用 Java 25、Spring
Boot 4.1.0、Spring Framework 7.0.8 和 H2；H2 结果不能外推为真实 MySQL 已验证。

先创建独立工作目录：

```bash
export I11_TX_WORKDIR="$(mktemp -d /tmp/java-i11-transaction.XXXXXX)"
mkdir -p "$I11_TX_WORKDIR/src/test/java/course/i11"
cd "$I11_TX_WORKDIR"
java -version
mvn --version
```

`pom.xml`：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>4.1.0</version>
  </parent>
  <groupId>course.i11</groupId>
  <artifactId>transaction-boundary</artifactId>
  <version>1.0.0</version>
  <properties>
    <java.version>25</java.version>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-jdbc</artifactId>
    </dependency>
    <dependency>
      <groupId>com.h2database</groupId>
      <artifactId>h2</artifactId>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
    </dependency>
  </dependencies>
</project>
```

`src/test/java/course/i11/TransactionBoundaryTest.java`：

```java
package course.i11;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.annotation.Transactional;

class TransactionBoundaryTest {
    /** 验证成功提交，以及审计故障时任务写入也回滚。 */
    @Test
    void commitsOrRollsBackTheWholeUseCase() {
        try (AnnotationConfigApplicationContext context =
                new AnnotationConfigApplicationContext(TransactionConfiguration.class)) {
            JdbcTemplate jdbc = context.getBean(JdbcTemplate.class);
            TransactionalTaskService service = context.getBean(TransactionalTaskService.class);
            jdbc.execute("create table tasks(id bigint primary key, title varchar(80))");
            jdbc.execute("create table audits(id bigint primary key, task_id bigint not null)");

            service.createTaskAndAudit(1L, false);
            assertEquals(1, countById(jdbc, "tasks", 1L));
            assertEquals(1, countById(jdbc, "audits", 1L));

            IllegalStateException failure = assertThrows(
                    IllegalStateException.class,
                    () -> service.createTaskAndAudit(2L, true));
            assertEquals("audit failed", failure.getMessage());
            assertEquals(0, countById(jdbc, "tasks", 2L));
            assertEquals(0, countById(jdbc, "audits", 2L));

            System.out.println("transaction|commitTasks=1|commitAudits=1"
                    + "|rollbackTasks=0|rollbackAudits=0");
        }
    }

    /** 返回指定标识在表中的行数。 */
    private static int countById(JdbcTemplate jdbc, String table, long id) {
        return jdbc.queryForObject(
                "select count(*) from " + table + " where id = ?", Integer.class, id);
    }

    @Configuration(proxyBeanMethods = false)
    @EnableTransactionManagement
    static class TransactionConfiguration {
        /** 创建本课独占的内存数据库。 */
        @Bean
        DataSource dataSource() {
            return new DriverManagerDataSource("jdbc:h2:mem:i11;DB_CLOSE_DELAY=-1", "sa", "");
        }

        /** 创建数据库操作入口。 */
        @Bean
        JdbcTemplate jdbcTemplate(DataSource dataSource) {
            return new JdbcTemplate(dataSource);
        }

        /** 让 Spring 代理管理本地数据库事务。 */
        @Bean
        PlatformTransactionManager transactionManager(DataSource dataSource) {
            return new DataSourceTransactionManager(dataSource);
        }

        /** 创建承担事务边界的应用服务。 */
        @Bean
        TransactionalTaskService transactionalTaskService(JdbcTemplate jdbc) {
            return new TransactionalTaskService(jdbc);
        }
    }

    static class TransactionalTaskService {
        private final JdbcTemplate jdbc;

        /** 注入数据库操作入口。 */
        TransactionalTaskService(JdbcTemplate jdbc) {
            this.jdbc = jdbc;
        }

        /** 在同一事务内保存任务和审计记录。 */
        @Transactional
        public void createTaskAndAudit(long id, boolean failAudit) {
            jdbc.update("insert into tasks(id, title) values (?, ?)", id, "Java 分层");
            if (failAudit) {
                throw new IllegalStateException("audit failed");
            }
            jdbc.update("insert into audits(id, task_id) values (?, ?)", id, id);
        }
    }
}
```

运行同一个反馈环两次，两个进程都应以状态码 0 结束：

```bash
mvn -q -Dtest=TransactionBoundaryTest test
mvn -q -Dtest=TransactionBoundaryTest test
```

两轮都应输出：

```text
transaction|commitTasks=1|commitAudits=1|rollbackTasks=0|rollbackAudits=0
```

`failAudit=true` 是故障注入：任务 `2` 先写入，随后抛出运行时异常；测试再查询最终状态，确认任务 `2`
和审计 `2` 都是 0 行。若去掉 `@Transactional` 或吞掉异常，同一断言会失败。修正事务入口后重跑同一
命令，最后清理并确认临时目录不存在：

```bash
cd /tmp
find "$I11_TX_WORKDIR" -depth -delete
test ! -e "$I11_TX_WORKDIR"
```

练习按以下顺序完成：

1. 输入 DTO 只包含客户端必须提交的字段。
2. 输出 DTO 只返回任务 ID、最终状态与发布时间。
3. 领域对象维护“只能从草稿发布”的不变量。
4. Service 检查时间、权限并编排任务与审计保存。
5. 两个 Repository 参与同一事务。
6. 断言成功结果和审计写入失败后的最终数据。
7. 检查 Controller、Service 和 domain 都没有 import MyBatis Mapper。

:::exercise

### 练习：为发布任务用例设计边界

**要求：** 管理员提交任务 ID 和发布时间，系统只有在草稿状态且时间晚于当前时刻时才能发布，并写入
一条审计记录；实现上方七项清单。

**验收：** 成功分支同时保存任务状态与审计记录；审计写入失败时两者都不存在；输出字段不包含内部
备注；架构检查发现 Web 或 domain 依赖 MyBatis Mapper 时必须失败。

**参考答案：** 输入 DTO 只含任务 ID 与发布时间，Service 依赖任务和审计两个 Repository port，公开
用例入口承担事务，Web adapter 负责 request/command 与 result/response 映射。
:::

## 十六、本节小结

- 分层先回答职责、数据和依赖，再决定包名与注解。
- Controller 适配 HTTP，Service 完成用例，领域对象维护规则，Repository 隐藏存储。
- 输入 DTO 和输出 DTO 是两个方向的字段允许列表，不能直接拿 entity 或 PO 代替。
- MyBatis Mapper 负责 SQL 映射，DTO mapper 负责 Java 边界转换，二者不能混为一谈。
- 构造器注入和显式映射让依赖与字段流向可阅读、可替换、可验证。
- 校验与事务必须放在能提供相应保证的位置，并用失败结果和最终数据验证。
- 拆分大类要减少职责和依赖，不要只减少单文件行数。
