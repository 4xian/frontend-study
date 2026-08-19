---
id: backend.java.learn.intermediate.bean-validation-and-input-contracts
type: lesson
title: Bean Validation、参数绑定与输入合同
summary: 从 HTTP 输入绑定到稳定错误响应，逐步建立可验证的参数合同
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 150
prerequisites:
  - backend.java.learn.intermediate.transactions-and-idempotency
related: []
tags:
  - Bean Validation
  - Jakarta Validation
  - 参数绑定
  - DTO
  - 输入合同
appliesTo: Java 25、Spring Boot 4.1.0、Spring Framework 7.0.8、Jakarta Validation 3.1 主线；Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE、Bean Validation 2.0 兼容补充
modernBaseline:
  java: '25'
  springBoot: 4.1.0
  springFramework: 7.0.8
  validation: '3.1'
legacyBaseline:
  java: '8'
  springBoot: 2.3.12.RELEASE
  springFramework: 5.2.15.RELEASE
  validation: '2.0'
verifiedAt: 2026-08-15
sources:
  - id: jakarta-validation-spec
    title: Jakarta Bean Validation 3.1 Specification
    url: https://jakarta.ee/specifications/bean-validation/3.1/jakarta-validation-spec-3.1.html
    sourceType: specification
    appliesTo: Jakarta Bean Validation 3.1
    claims:
      - 定义约束、验证器、分组、级联和方法验证合同
  - id: jakarta-constraints-api
    title: Jakarta Validation Constraints API
    url: https://jakarta.ee/specifications/bean-validation/3.1/apidocs/jakarta/validation/constraints/package-summary.html
    sourceType: api-doc
    appliesTo: Jakarta Bean Validation 3.1
    claims:
      - 定义标准约束注解和空值处理边界
  - id: hibernate-validator-reference
    title: Hibernate Validator 9.1 Reference Guide
    url: https://docs.jboss.org/hibernate/validator/9.1/reference/en-US/html_single/
    sourceType: official-reference
    appliesTo: Hibernate Validator 9.1.0.Final
    claims:
      - 说明标准约束、容器元素、分组和自定义约束实现
  - id: spring-boot-validation
    title: Spring Boot Validation
    url: https://docs.spring.io/spring-boot/reference/io/validation.html
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Boot 自动配置 Validator、消息源和校验基础设施
  - id: spring-boot-build-systems
    title: Spring Boot 4.1 Build Systems
    url: https://docs.spring.io/spring-boot/4.1/reference/using/build-systems.html
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - 现代 MVC、Validation 与 MVC 测试分别使用 webmvc、validation 与 webmvc-test starter
  - id: spring-boot-jackson-properties
    title: Spring Boot 4.1 JSON Application Properties
    url: https://docs.spring.io/spring-boot/4.1/appendix/application-properties/index.html#application-properties.json.spring.jackson.deserialization
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - spring.jackson.deserialization.* 用于配置 Jackson 反序列化特性
      - 本课显式启用 fail-on-unknown-properties 以拒绝未知 JSON 字段
  - id: spring-mvc-validation
    title: Spring MVC Validation
    url: https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-validation.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - '@Valid、方法校验和 MVC 绑定失败的触发合同'
  - id: spring-method-validation
    title: Spring Method Validation
    url: https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - '@Validated 通过代理校验方法参数和返回值'
  - id: spring-web-data-binder
    title: Spring WebDataBinder API
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/bind/WebDataBinder.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 绑定错误、类型转换和字段白名单属于数据绑定边界
  - id: spring-method-argument-type-mismatch
    title: MethodArgumentTypeMismatchException API
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/method/annotation/MethodArgumentTypeMismatchException.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 直接方法参数类型转换失败可统一映射为 400 输入绑定错误
  - id: spring-errors-api
    title: Spring Errors API
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/validation/Errors.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 字段错误和对象错误可以按字段名、错误码和 rejected value 读取
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
      - 专用输入 DTO 和允许列表限制客户端可写字段
  - id: owasp-error-handling
    title: OWASP Error Handling Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: Error response
    claims:
      - 对外错误信息不得泄露堆栈和内部实现细节
  - id: owasp-logging
    title: OWASP Logging Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: Logging data
    claims:
      - 口令、令牌、密钥和敏感个人数据不得直接写入日志
  - id: spring-legacy-validation
    title: Spring Framework 5.2 Bean Validation
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/core.html#validation-beanvalidation
    sourceType: official-reference
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 旧线使用 javax.validation，类型级 @Validated 触发 Bean 代理方法验证
  - id: spring-legacy-request-body
    title: Spring Framework 5.2 RequestBody
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/web.html#mvc-ann-requestbody
    sourceType: official-reference
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 旧线使用 HttpMessageConverter、javax.validation.Valid 与 BindingResult 处理请求体
  - id: jakarta-validation-2-api
    title: Jakarta Bean Validation 2.0 API
    url: https://jakarta.ee/specifications/bean-validation/2.0/apidocs/
    sourceType: api-doc
    appliesTo: Bean Validation 2.0 / javax.validation
    claims:
      - Java 8 兼容线使用 javax.validation API 与标准约束
projectEvidence:
  - file: dzzz-app/src/main/java/com/tdh/bdzz/annoation/CltjrSf.java
    symbol: com.tdh.bdzz.annoation.CltjrSf
    usage: corrected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/annoation/impl/CltjrSfValidator.java
    symbol: com.tdh.bdzz.annoation.impl.CltjrSfValidator
    usage: corrected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/validator/MinValidator.java
    symbol: com.tdh.bdzz.validator.MinValidator
    usage: corrected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/dto/swtpad/meeting/AddSwtHyjhDTO.java
    symbol: com.tdh.bdzz.dto.swtpad.meeting.AddSwtHyjhDTO
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/controller/BaseOuterController.java
    symbol: com.tdh.bdzz.controller.BaseOuterController
    usage: observed
objectives:
  - 能区分消息转换、请求绑定、类型转换、Bean Validation 和业务规则五层。
  - 能选择 NotNull、NotBlank、NotEmpty、Size、Pattern 和数值约束。
  - 能解释 null 语义并使用 Valid 完成嵌套对象校验。
  - 能使用容器元素约束、校验分组和方法校验。
  - 能把绑定错误和约束错误转换为稳定的 4xx 响应。
  - 能编写带消息、校验器和跨字段规则的自定义约束。
  - 能把 Jakarta 包名映射到 Java 8/Bean Validation 2.0 兼容线。
recap:
  - 绑定先发生，约束随后发生，业务规则仍由用例负责。
  - 大多数约束对 null 不负责，必填字段要显式添加 NotNull 或 NotBlank。
  - Valid 触发级联，容器元素约束保护集合内部值。
  - 分组是场景选择器，不是绕过校验的开关。
  - 错误响应只返回字段位置、错误码和可读消息，不回显敏感输入。
  - 自定义校验器必须明确 null、线程安全和跨字段上下文。
---

# Bean Validation、参数绑定与输入合同

## 一、为什么需要学习

浏览器发送的 JSON 只是文本。JSON 请求走消息转换，query、form 与 path 输入走请求绑定和类型转换；两条入口
在得到 Java 值后才执行 Bean Validation，最后进入业务规则。层次混在一起时，初学者常把 JSON 转换失败当成
绑定或校验失败，或者只写 `@Size` 却忘记 null 仍能通过。本课把每一步拆开，最终让你能写出可预测的 4xx 响应。

## 二、学习目标

- 能画出 JSON 消息转换与 query/form/path 绑定转换两条入口，以及它们汇入校验和业务规则的顺序。
- 能为字符串、集合、数值、日期和嵌套对象选择正确约束。
- 能验证 MVC 参数、Service 方法和返回值的校验触发。
- 能将多个字段错误转换成稳定的错误码和字段路径。
- 能在 Java 8 旧项目中使用 `javax.validation`，同时保持现代 `jakarta.validation` 主线。

## 三、前置术语

- **DTO：** 专门在边界传输数据的类，不等于数据库实体。
- **约束：** 对一个值或对象必须满足的可声明规则。
- **绑定：** 把 HTTP 参数文本转换为 Java 类型并填充对象。
- **级联：** 从外层对象继续验证内部对象或集合元素。
- **错误码：** 稳定地表示哪条规则失败的机器可读标识。

## 四、零基础知识点详解

### 1. 不可信输入与五层处理边界

**它是什么：** 外部输入先按入口进入 HTTP 消息转换，或进入请求绑定与类型转换；得到 Java 值后再经过
Bean Validation 与业务规则。持久化约束是最终一致性防线，不占用这五种职责中的任何一种。

**有什么作用：** 错误可以准确归类，Controller 不会同时承担解析、权限和数据库一致性。

**什么时候使用：** 任何接收 JSON、query、form、path variable 或消息载荷的入口。

**怎么使用：**

1. JSON 先判断消息是否可读；query、form 与 path 则完成绑定和类型转换。
2. 对已经得到的 Java 值执行 Bean Validation 本地结构合同。
3. 最后在 Service 检查权限与状态，持久化约束只负责最终一致性。

**最小示例：** `{"age":"十八"}` 在转换层失败，`{"age":-1}` 才进入 `@Min(0)` 校验。

**运行结果：** 两个请求都被拒绝，但错误类别分别为 malformed 与 validation。

**常见误区：** 把“用户名是否重复”写进 DTO 约束，导致校验器访问数据库。

### 2. `@RequestBody` 与 HTTP 消息转换

**它是什么：** `@RequestBody` 由 `HttpMessageConverter` 把请求体字节反序列化为 Java 对象；损坏 JSON
会在 DTO 完整生成前触发 `HttpMessageNotReadableException`。

**有什么作用：** “消息根本读不懂”和“DTO 值违反约束”可以使用不同的稳定错误合同。

**什么时候使用：** Controller 接收 JSON、XML 或其他由消息转换器处理的请求体时。

**怎么使用：**

1. 声明专用请求 DTO，并在参数上添加 `@RequestBody`。
2. 单独处理消息不可读异常。
3. 用损坏 JSON 和字段类型错误验证转换失败路径。

**最小示例：** `{"title":"Java"` 缺少右花括号，转换器无法创建完整 DTO。

**运行结果：** 返回 `400 + INPUT_MALFORMED`，violations 为空且 Controller 未执行。

**常见误区：** 把损坏 JSON 映射为 `NotBlank`，伪造一个实际没有执行的约束错误。

### 3. `@ModelAttribute`、请求参数绑定与类型转换

**它是什么：** `@ModelAttribute`、query、form 和路径参数通过 `WebDataBinder`、conversion service 或
formatter 把字符串转换成目标 Java 类型。

**有什么作用：** 可以区分属性绑定失败、类型转换失败与对象约束失败。

**什么时候使用：** 筛选表单、分页参数、路径变量和非 JSON 表单对象。

**怎么使用：**

1. 为目标属性选择明确的 Java 类型。
2. 只在确有需要时注册 converter 或 formatter。
3. 分别验证正常值、不可转换值与转换后越界值。

**最小示例：** `page=abc` 无法绑定为 `Integer page`，`page=-1` 则可绑定但违反 `@Min(0)`。

**运行结果：** 前者产生 type mismatch，后者产生路径为 `page` 的约束错误。

**常见误区：** 宣称 `WebDataBinder.setAllowedFields(...)` 会过滤 `@RequestBody` JSON；两者不是同一路径。

### 4. Bean Validation provider、starter 与验证入口

**它是什么：** Validation API 只定义合同，Hibernate Validator 等 provider 执行合同；Spring Boot 的
validation starter 提供 provider，并把 Validator 接入 MVC 与 Bean 方法校验。

**有什么作用：** 避免“注解能编译但运行时没有校验器”的假成功。

**什么时候使用：** 新建 Spring Boot Web 工程、拆分依赖或排查约束没有触发时。

**怎么使用：**

1. 引入 `spring-boot-starter-validation`。
2. 在 MVC 参数使用 `@Valid` / `@Validated`，或显式注入 `Validator`。
3. 用非法输入确认入口真的触发 provider。

**最小示例：** `@NotBlank String title` 只有被 Validator 调用时才会产生 violation。

**运行结果：** provider 在 classpath 且入口正确时，空白 title 在 Controller 执行前被拒绝。

**常见误区：** 只添加 `jakarta.validation-api` 就以为已经获得可执行实现。

### 5. `@NotNull`、`@NotBlank`、`@NotEmpty` 与 `null` 分工

**它是什么：** `@NotNull` 只拒绝 null，`@NotBlank` 还拒绝空串和纯空白，`@NotEmpty` 还拒绝空容器或
空字符序列。

**有什么作用：** “缺失”“空白”和“没有元素”可以按业务语义选择最小约束。

**什么时候使用：** 必填文本、必填对象、非空集合和可选筛选字段。

**怎么使用：**

1. 先决定 null 是否允许。
2. 文本不允许空白时使用 `@NotBlank`。
3. 容器至少有一项时使用 `@NotEmpty` 或 `@Size(min = 1)`。

**最小示例：** `@NotNull @Min(1) Integer count` 同时表达必填和最小值。

**运行结果：** 单独 `@Min(1)` 通常允许 null，组合后 null 与 0 都失败。

**常见误区：** 以为 `@Size`、`@Email` 或 `@Min` 会自动拒绝 null。

### 6. `@Size`、`@Pattern`、`@Email` 与字符串/集合合同

**它是什么：** `@Size` 限制字符序列或容器大小，`@Pattern` 检查正则格式，`@Email` 检查 provider
支持的邮件地址语法。

**有什么作用：** 输入长度、集合数量与本地格式可以在进入 Service 前统一验证。

**什么时候使用：** 标题、标签、外部编码和联系邮箱等有限输入。

**怎么使用：**

1. 为字符串和集合分别冻结上限。
2. 只有简单、稳定格式才使用 `@Pattern`。
3. 必填字段另加非空约束，并验证边界值。

**最小示例：** `@NotBlank @Size(max = 80) String title`。

**运行结果：** 空白与 81 字符标题产生不同 code，80 字符标题通过。

**常见误区：** 把 `@Email` 当成邮箱存在、可投递或归属当前用户的证明。

### 7. 数值约束和日期约束

**它是什么：** `@Min`、`@Max`、`@Positive`、`@Digits` 约束数值，`@Past`、`@Future` 及其
`OrPresent` 变体根据 Validator 的 Clock 约束日期方向。

**有什么作用：** 数量、金额精度和日期方向形成可复用的本地合同。

**什么时候使用：** 规则只依赖当前数值或当前时间，不需要查库存、余额或营业日。

**怎么使用：**

1. 金额使用 `BigDecimal` 与十进制约束。
2. 日期选择明确类型与业务时区。
3. 固定 Clock 验证下界、上界和当前时刻。

**最小示例：** `@Positive @Max(100) Integer pageSize` 与 `@FutureOrPresent LocalDate deadline`。

**运行结果：** 0、101 和昨天失败；1、100 和今天通过。

**常见误区：** 用 `double` 表达精确金额，或让日期测试依赖机器当前时区。

### 8. `@Valid` 与嵌套对象级联

**它是什么：** `@Valid` 让 Validator 继续验证关联对象，并保留 `teacher.name` 等嵌套属性路径。

**有什么作用：** 大 DTO 可以拆成职责清晰的小对象，同时保持完整输入合同。

**什么时候使用：** 请求中包含地址、联系人、教师等带独立约束的嵌套对象。

**怎么使用：**

1. 在外层关联属性上放一次 `@Valid`。
2. 在嵌套类型的字段上声明具体约束。
3. 验证嵌套对象缺失和内部字段失败两个分支。

**最小示例：** `record Course(@Valid Teacher teacher) {}` 与 `record Teacher(@NotBlank String name) {}`。

**运行结果：** 空白教师姓名报告 `teacher.name`，不会丢失嵌套位置。

**常见误区：** 只在内部类写约束却忘记外层 `@Valid`，或在同一关联位置重复级联标记。

### 9. 容器元素约束

**它是什么：** Bean Validation 可以在类型参数上声明约束，例如 `List<@NotBlank String>`。

**有什么作用：** 集合本身合法时，内部的 null、空白或非法对象仍会被发现。

**什么时候使用：** 标签、ID 列表、Map key/value 和对象集合来自外部输入。

**怎么使用：**

1. 用 `@Size` 限制容器数量。
2. 在元素类型上添加约束或 `@Valid`。
3. 把 provider 路径规范化为稳定客户端路径。

**最小示例：** `@Size(max = 20) List<@NotBlank String> tags`。

**运行结果：** `tags = ["java", " "]` 对外报告 `tags[1]`。

**常见误区：** 只限制列表长度，却忽略元素内容和 Map key。

### 10. 默认组、显式组与 `@Validated`

**它是什么：** 默认组执行未指定 groups 的约束，显式组选择创建或更新等场景，`@Validated` 在 Spring
入口传入组类型。

**有什么作用：** 同一模型在确有场景差异时可以选择不同合同。

**什么时候使用：** 创建和更新规则不同，并且拆分 DTO 会制造更多混乱时。

**怎么使用：**

1. 定义 `Create`、`Update` 空接口。
2. 在约束上声明 groups。
3. 在入口使用 `@Validated(Create.class)` 并分别测试每组。

**最小示例：** `@Null(groups = Create.class) @NotNull(groups = Update.class) Long id`。

**运行结果：** 创建时携带 id 失败，更新时缺少 id 失败。

**常见误区：** 选择显式组后忘记默认组不会自动一起执行，或把组当成权限校验。

### 11. Spring MVC 请求 DTO 对象校验

**它是什么：** Controller 参数上的 `@Valid` 或 `@Validated` 让 Spring MVC 在绑定完成后校验整个 DTO。

**有什么作用：** 非法对象在应用服务调用前被拒绝，Controller 不需要逐字段手写判断。

**什么时候使用：** `@RequestBody`、`@ModelAttribute` 等复合请求对象。

**怎么使用：**

1. 给入口参数添加 `@Valid`。
2. 在 DTO 字段、属性或 record component 声明约束。
3. 验证失败不会进入 Controller 方法体或应用服务。

**最小示例：** `create(@RequestBody @Valid CreateCourseRequest request)`。

**运行结果：** title 为空白时产生对象校验异常，合法请求才执行方法体。

**常见误区：** DTO 上有注解就以为会自动校验，遗漏入口触发标记。

### 12. Spring 7 Controller 原生方法验证

**它是什么：** Spring MVC 7 可以直接校验 Controller 方法参数与返回值上的约束，并以
`HandlerMethodValidationException` 表示原生方法校验失败。

**有什么作用：** `@RequestParam`、`@PathVariable` 等简单参数也能获得 MVC 原生、可统一处理的合同。

**什么时候使用：** 现代 Spring 7 Controller 校验直接参数或返回值时；legacy 线不导入该异常类型。

**怎么使用：**

1. 在 Controller 参数直接声明 `@Min`、`@NotBlank` 等约束。
2. 为 `HandlerMethodValidationException` 建立单独 advice，并用 `isForReturnValue()` 区分输入与输出失败。
3. 验证路径、code、排序和去敏结果。

**最小示例：** 输入使用 `list(@RequestParam @Min(0) int page)`，返回值使用 `@NotNull Result load()`。

**运行结果：** `page=-1` 返回 `400 + INPUT_VALIDATION_FAILED`；返回值违反约束时返回
`500 + INTERNAL_ERROR`，不把服务端缺陷归咎于客户端。

**常见误区：** 把 Spring 7 异常类型复制到 Spring 5.2/Boot 2.3 代码，导致 legacy 线无法编译。

### 13. Spring Bean 代理方法参数与返回值验证

**它是什么：** 受容器管理的 Bean 在类型级添加 `@Validated` 后，通过代理校验公共方法参数和返回值。

**有什么作用：** Service 被 HTTP、任务或消息入口调用时共享同一方法合同。

**什么时候使用：** 公共 Bean 方法需要保护简单参数、嵌套参数或返回值。

**怎么使用：**

1. 在 Bean 类型上添加 `@Validated`。
2. 在参数和返回值声明约束。
3. 从另一个 Bean 经过代理调用并验证成功、参数失败与返回值失败。

**最小示例：** `public @NotBlank String normalize(@NotBlank String title)`。

**运行结果：** 经过代理传入空白值时，方法被约束异常阻断。

**常见误区：** 使用 `this.normalize(...)` 期待代理拦截，或给手动 new 的对象添加 `@Validated`。

### 14. `Errors` / `BindingResult` 的相邻参数合同

**它是什么：** `Errors` 与 `BindingResult` 保存当前绑定对象的转换和校验错误，参数必须紧跟对应对象。

**有什么作用：** 某个 Controller 可以本地消费错误，同时仍输出统一响应合同。

**什么时候使用：** 页面表单或确需在方法内组合错误响应的接口；其他 API 通常交给全局 advice。

**怎么使用：**

1. 把 `BindingResult` 紧邻放在 `@Valid` 参数之后。
2. 先检查 `hasErrors()`，再读取 field 与 code。
3. 不读取或返回 rejected value。

**最小示例：** `create(@Valid @RequestBody CourseRequest request, BindingResult result)`。

**运行结果：** title 为空时 Controller 收到错误，并按统一结构返回 400。

**常见误区：** 在 DTO 与 `BindingResult` 中间插入其他参数，导致错误不属于预期对象。

### 15. malformed、binding、validation 与 business failure 分层

**它是什么：** malformed 表示消息不可读，binding 表示值不能转换，validation 表示 Java 值违反约束，
business failure 表示结构合法但业务事实不允许。

**有什么作用：** 客户端可以判断应修正格式、字段值，还是处理冲突或权限问题。

**什么时候使用：** 设计 API 错误协议、状态码和重试策略时。

**怎么使用：**

1. 为四类失败分配稳定 code。
2. 让消息转换、绑定、Validator 与 Service 各自产生自己的失败。
3. 用同一字段的四种输入验证分类不混淆。

**最小示例：** `INPUT_MALFORMED`、`INPUT_BINDING_FAILED`、`INPUT_VALIDATION_FAILED` 与
`COURSE_ALREADY_EXISTS`。

**运行结果：** 前三类通常返回 400，业务冲突可返回 409，服务端缺陷不会被伪装成 400。

**常见误区：** 用一个 `Exception.class` handler 把所有异常都吞成参数错误。

### 16. 稳定错误 JSON、路径、代码与确定性排序

**它是什么：** 统一错误响应只公开顶层 code 和按 `path + code` 确定性排序的 violations。

**有什么作用：** 同一输入重复请求会得到稳定结构，客户端和验证脚本不依赖 provider 的内部顺序。

**什么时候使用：** 多个 Controller 共享公开 API 错误合同时。

**怎么使用：**

1. 规范化字段、嵌套和容器元素路径。
2. 保留稳定 code，message 仅作为可翻译展示文本。
3. 排序后再序列化，并移除类名、堆栈和 rejected value。

**最小示例：** `{"code":"INPUT_VALIDATION_FAILED","violations":[{"path":"title","code":"NotBlank"}]}`。

**运行结果：** `tags[0]`、`teacher.name`、`title` 每次按同一顺序输出。

**常见误区：** 直接返回 `FieldError`，把 provider 内部字段和敏感值暴露给客户端。

### 17. 字段级自定义约束与类型级跨字段约束

**它是什么：** 字段级约束检查一个值，类型级约束读取同一 DTO 的多个字段；两者都由
`ConstraintValidator` 实现本地、确定规则。

**有什么作用：** 标准注解无法表达的编码格式和日期先后关系仍能进入统一 violation 流程。

**什么时候使用：** 规则不访问数据库、网络、权限上下文或其他可变外部状态时。

**怎么使用：**

1. 声明 `message`、`groups`、`payload` 和适用目标。
2. 明确 null 分工，并让类型级 validator 处理字段组合。
3. 为合法、非法和 null 组合编写最小验证。

**最小示例：** 把下面内容保存为 `CourseValidationContract.java`，即可作为一个独立编译单元：

```java
import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.time.LocalDate;
/** 声明两个大写字母加四个数字的课程编码。 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = CourseCodeValidator.class)
@interface CourseCode {
    /** 返回稳定错误消息。 */
    String message() default "COURSE_CODE_INVALID";
    /** 返回约束分组。 */
    Class<?>[] groups() default {};
    /** 返回约束扩展载荷。 */
    Class<? extends Payload>[] payload() default {};
}
/** 无共享状态地检查一个课程编码。 */
final class CourseCodeValidator implements ConstraintValidator<CourseCode, String> {
    /** 把 null 交给 NotNull，只负责本约束的格式。 */
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return value == null || value.matches("[A-Z]{2}\\d{4}");
    }
}
/** 声明开始日期不得晚于结束日期。 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ChronologicalValidator.class)
@interface Chronological {
    /** 返回稳定错误消息。 */
    String message() default "DATE_ORDER_INVALID";
    /** 返回约束分组。 */
    Class<?>[] groups() default {};
    /** 返回约束扩展载荷。 */
    Class<? extends Payload>[] payload() default {};
}
/** 只读取当前 DTO，执行确定的跨字段判断。 */
final class ChronologicalValidator implements ConstraintValidator<Chronological, CourseWindow> {
    /** 日期缺失由字段约束负责，本约束只检查两个完整日期。 */
    public boolean isValid(CourseWindow value, ConstraintValidatorContext context) {
        return value == null || value.startDate == null || value.endDate == null
            || !value.startDate.isAfter(value.endDate);
    }
}

/** 同时使用字段级和类型级自定义约束的输入 DTO。 */
@Chronological
final class CourseWindow {
    @CourseCode String code;
    LocalDate startDate;
    LocalDate endDate;
}
```

**运行结果：** 编码失败定位到 `code`，日期顺序失败使用稳定对象路径 `$`。

**常见误区：** 在 validator 中查询唯一性，把事务竞态和外部 I/O 塞进验证阶段。

### 18. 专用 DTO、allowed fields 与 mass-assignment 防护

**它是什么：** 专用 DTO 只暴露客户端可写字段，`WebDataBinder` allowed fields 进一步限制属性绑定；JSON
未知字段则由 Jackson 反序列化配置决定。

**有什么作用：** 客户端不能借同名字段修改角色、状态或内部标记。

**什么时候使用：** 接收 JSON、form、query、Map 或可变 JavaBean 的公开入口。

**怎么使用：**

1. 为每个用例定义最小请求 DTO，不直接绑定持久化实体。
2. 对 `@ModelAttribute` 配置 allowed fields。
3. 产品要求拒绝未知 JSON 字段时启用 Jackson `fail-on-unknown-properties` 并写 400 验证。

**最小示例：** `spring.jackson.deserialization.fail-on-unknown-properties: true`。

**运行结果：** JSON 携带 `admin=true` 时在消息转换层返回 400，不会进入 Controller 或修改领域对象。

**常见误区：** 用 `WebDataBinder` 解释 `@RequestBody` 行为，或把“字段合法”等同于“用户有权修改”。

### 19. 验证器线程安全、错误去敏与日志去敏

**它是什么：** 自定义 validator 应像无状态函数工作；响应和日志只记录安全路径、code 与 requestId。

**有什么作用：** 并发请求结果可重复，密码、token、证件号和完整请求体不会因失败链路泄露。

**什么时候使用：** 编写自定义约束、全局 advice、错误日志和监控埋点时。

**怎么使用：**

1. validator 只保存初始化后的不可变配置，不保存当前输入。
2. advice 不序列化 rejected value、异常类名或堆栈。
3. 在响应与捕获日志中搜索测试 secret、请求体标记、`Caused by`、课程堆栈帧和相关异常类名。

**最小示例：** `isValid(value, context)` 只读取参数，日志写 `requestId + path + code`。

**运行结果：** 相同输入并发运行得到相同 violations，响应和日志都不含测试 secret、请求体、堆栈或异常类名。

**常见误区：** 把最近一次 value 放入 validator 字段，或为了排障记录完整请求体。

## 五、现代版本中的正确用法

现代 Spring Boot 4 使用 `jakarta.validation` 命名空间。Controller DTO、用例命令和持久化模型分开；外部
输入只进入 DTO。字段约束负责结构，Service 负责权限、库存、唯一性和状态机。对公开 API 使用统一 advice，
错误消息采用 message key，日志只记录 requestId、字段名和错误码。

## 六、核心接口

```java
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** 使用 MVC 校验后的 DTO 调用用例。 */
@RestController
@RequestMapping("/courses")
public final class CourseController {
    /** 接收 JSON，触发校验并返回已经通过输入合同的 DTO。 */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreateCourseRequest create(@RequestBody @Valid CreateCourseRequest request) {
        return request;
    }

    /** 接收创建课程请求的边界 DTO。 */
    public record CreateCourseRequest(
        @NotBlank(message = "{course.title.required}") String title,
        @Size(max = 20) java.util.List<@NotBlank String> tags
    ) {}
}
```

若接口合同要求未知 JSON 字段直接返回 400，还必须在 `application.yml` 明确启用 Jackson 的拒绝策略：

```yaml
spring:
  jackson:
    deserialization:
      fail-on-unknown-properties: true
```

该配置作用于 `@RequestBody` 消息转换，不属于 Bean Validation，也不由 `WebDataBinder` allowed fields 代替。

## 七、从零跟着做

先准备最小 `pom.xml`：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>4.1.0</version>
  </parent>
  <groupId>example</groupId>
  <artifactId>validation-lab</artifactId>
  <version>1.0.0</version>
  <properties><java.version>25</java.version></properties>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-webmvc</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-webmvc-test</artifactId>
      <scope>test</scope>
    </dependency>
  </dependencies>
  <build><plugins><plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
  </plugin></plugins></build>
</project>
```

再准备 `src/main/java/example/ValidationApplication.java`：

```java
package example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** 启动最小校验实验应用。 */
@SpringBootApplication
public class ValidationApplication {
    /** 启动 Spring Boot 并创建 MVC 与 Validator。 */
    public static void main(String[] args) {
        SpringApplication.run(ValidationApplication.class, args);
    }
}
```

1. 运行 `modern_i10_dir=$(mktemp -d /tmp/java-i10-modern.XXXXXX)` 与
   `legacy_i10_dir=$(mktemp -d /tmp/java-i10-legacy.XXXXXX)` 建立两套工程。现代 POM 使用 Boot 4.1.0、
   Java 25、Web MVC、Validation 与 Test starter；legacy POM 使用 Boot 2.3.12.RELEASE、Java 8、Web 与显式 Validation。
2. 两套工程都创建启动类，以及普通 JavaBean `CourseRequest`、`AddressRequest`。根 DTO 包含
   `displayName`、`age`、`code`、`address`、`tags`、`startDate`、`endDate`；添加字段约束、`@Valid`、
   容器元素约束、`@CourseCode` 和类型级 `@Chronological`。
3. 创建 `CourseController`：`POST /courses` 的 `@Valid @RequestBody` 成功返回 201；
   `POST /courses/local` 紧邻接收 `BindingResult`；`POST /courses/service` 从另一个 Bean 调用 Service。
4. 创建类型级 `@Validated` 的 `CourseService`，在公共方法参数上添加 `@NotBlank`；增加
   `GET /courses/search?q=`（现代线使用 Spring 7 原生方法验证）和 `GET /courses/page?page=`；用 `page=abc`
   证明 `MethodArgumentTypeMismatchException -> INPUT_BINDING_FAILED`。现代线再增加带 `@NotNull` 返回值约束的
   `GET /courses/broken-output`，故意返回 `null` 以触发服务端输出合同失败。
5. 创建 `ProfileForm` 与 `ProfileController`，在 `@InitBinder("profileForm")` 中只允许
   `displayName`。用 form 同时提交 `displayName` 和 `role`，断言角色仍为空且 suppressed fields 包含 role。
6. 创建统一错误 DTO 与 `@RestControllerAdvice`：消息不可读映射 `INPUT_MALFORMED`，query/form/path 类型
   转换映射 `INPUT_BINDING_FAILED`，其余输入校验映射 `INPUT_VALIDATION_FAILED`；现代线对
   `HandlerMethodValidationException.isForReturnValue()` 返回 `500 + INTERNAL_ERROR`。violations 按 `path + code`
   排序且不包含 rejected value。响应与捕获日志也不得包含测试 secret、请求体标记、`Caused by`、课程堆栈帧
   或相关异常类名；legacy 不得导入 `HandlerMethodValidationException`。
7. 创建一份聚焦 MVC 测试，覆盖合法 DTO、损坏 JSON、JSON 类型错误、必填、级联、容器元素、跨字段、
   相邻 `BindingResult`、代理 Service、allowed fields、指定类型转换异常和响应/日志去敏；现代线再覆盖直接参数
   与返回值约束。在测试属性中启用 `spring.jackson.deserialization.fail-on-unknown-properties=true` 并验证未知字段为 400。
8. 现代线连续两次运行 `docker run --rm -v "${modern_i10_dir}:/workspace" -w /workspace
   maven:3.9.12-eclipse-temurin-25 mvn -q test`；legacy 连续两次换用 `maven:3.9.12-eclipse-temurin-8`。
   确认 major 69/52 后，分别运行 `find "$modern_i10_dir" -depth -delete`、
   `find "$legacy_i10_dir" -depth -delete`，再执行 `test ! -e "$modern_i10_dir"` 与
   `test ! -e "$legacy_i10_dir"` 证明两个临时目录均不存在。

现代与旧版的共有可观察结果，以及现代线独有结果如下：

```text
valid|status=201|controller=true
malformed|brokenJson=400|typeError=400|code=INPUT_MALFORMED
constraints|field=400|nested=400|element=400|crossField=400|sorted=true
local|bindingResultHandled=true
service|proxyValidation=400|code=INPUT_VALIDATION_FAILED
binding|exception=MethodArgumentTypeMismatchException|status=400|code=INPUT_BINDING_FAILED
allowedFields|roleBound=false|suppressed=role
security|unknownField=400|responseLeak=false|logLeak=false|bodyLeak=false|stackLeak=false|secretLeak=false
modernOnly|controllerParameter=400|code=INPUT_VALIDATION_FAILED|controllerReturnValue=500|returnCode=INTERNAL_ERROR
```

## 八、如何使用

先定义 DTO，再选择最小标准约束；需要嵌套就加 `@Valid`，需要场景差异才使用分组。Controller 负责绑定和
错误翻译，Service 负责业务事实，数据库约束负责最终一致性。不要把约束注解复制到所有持久化实体上而忽略
不同入口的合同。

## 九、适用与不适用场景

Bean Validation 适合本地、确定、快速的结构规则；不适合权限、数据库唯一性、外部 API 可用性和需要事务的
业务判断。校验通过只表示输入形状正确，不代表操作一定成功。

:::tip
把 message 设为稳定 key，再由消息源翻译。这样后端可以换语言，客户端仍可依赖 `course.title.required`。
:::

## 十、当前项目补充

以下内容只解释 frontmatter 已绑定的冻结证据，不读取项目源码，也不复制业务字段：

1. `CltjrSf` 与 `CltjrSfValidator` 是项目私有约束观察证据，课程将其纠正为无状态、明确 null 语义的
   `jakarta.validation` 示例，不能当作 Jakarta 标准 API。
2. `MinValidator` 与 `AddSwtHyjhDTO` 分别说明自定义数值校验和独立 HTTP DTO 边界；课程优先标准 `@Min`，
   不复制真实业务字段。
3. `BaseOuterController` 是 Web 入口观察证据；课程用显式 `@RequestBody @Valid` 和稳定 4xx/5xx 合同重写
   触发链。

## 十一、Java 8 / Spring Boot 2.3 兼容写法

```java
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;

/** Java 8 兼容的创建请求。 */
public final class LegacyCreateCourseRequest {
    @NotBlank(message = "{course.title.required}") public String title;
    @Valid public LegacyTeacherRequest teacher;
}

/** Java 8 兼容的嵌套教师请求。 */
final class LegacyTeacherRequest {
    @NotBlank(message = "{course.teacher.name.required}") public String name;
}
```

旧线使用 `javax.validation.*`，Spring Boot 2.3 的 MVC 触发链与约束基本语义相同；正式工程应把公开字段
改为私有字段和 JavaBean 访问器，并用 `@Valid` 触发级联，不能混入 `jakarta.validation`。

## 十二、新旧版本差异

| 对比项 | 现代稳定版本 | 项目兼容版本 | 迁移注意 |
| --- | --- | --- | --- |
| 包名 | `jakarta.validation.*` | `javax.validation.*` | 不能混用 |
| Spring 方法校验 | Spring 7 统一方法校验入口 | Spring 5.2 依赖旧代理行为 | 保持从容器代理调用 |
| DTO 语法 | 可使用 record | 使用普通 JavaBean | 约束放在可识别的字段/访问器上 |
| 错误响应 | 可组合 ProblemDetail | 常用自定义错误 DTO | 对外字段自行固定 |

## 十三、易错点

:::pitfalls

### 错误：只写 `@Size` 以为 null 会失败

**触发条件：** 客户端省略集合或字符串字段。

**原因：** 大多数大小约束对 null 让行，是否必填需由 NotNull/NotBlank 表达。

**后果：** 缺失数据绕过 DTO 校验，在服务层才出现空指针或错误业务。

**影响版本：** Bean Validation 2.0 / 3.1。

**来源：** `jakarta-validation-spec`、`jakarta-validation-2-api`。

**错误示例：**

```java
@Size(min = 1)
private List<String> tags;
```

**正确写法：**

```java
@NotNull(message = "TAGS_REQUIRED")
@Size(min = 1, message = "TAGS_EMPTY")
private List<String> tags;
```

**验证方式：** 省略 tags 时断言 400 与 `TAGS_REQUIRED`，传空数组时断言 `TAGS_EMPTY`。

### 错误：忘记 `@Valid` 导致嵌套对象不校验

**触发条件：** 外层 DTO 有 Address，但参数没有级联标记。

**原因：** Validator 不会默认递归所有关联对象。

**后果：** 内部空字段进入用例。

**影响版本：** Bean Validation 2.0 / 3.1。

**来源：** `jakarta-validation-spec`、`jakarta-validation-2-api`。

**错误示例：**

```java
@NotNull
private TeacherRequest teacher;
```

**正确写法：**

```java
@NotNull
@Valid
private TeacherRequest teacher;
```

**验证方式：** 发送 name 为空白的 teacher，断言字段路径为 `teacher.name`。

### 错误：把自定义校验器当成数据库查询器

**触发条件：** validator 为检查唯一性而访问 Repository。

**原因：** 校验阶段可能在事务和业务权限之外被频繁调用。

**后果：** 慢请求、竞态和难以测试的副作用。

**影响版本：** Bean Validation 2.0 / 3.1。

**来源：** `jakarta-validation-spec`、`owasp-input-validation`。

**错误示例：**

```java
return !courseRepository.existsByCode(value);
```

**正确写法：**

```java
return value == null || COURSE_CODE.matcher(value).matches();
```

**验证方式：** 使用纯内存输入重复调用校验器，断言无 Repository 调用且结果一致。

### 错误：直接返回 rejected value

**触发条件：** advice 将所有 FieldError 字段和值原样序列化。

**原因：** 某些字段可能是密码、token 或个人证件。

**后果：** 敏感数据进入响应和日志。

**影响版本：** 现代与 legacy。

**来源：** `spring-errors-api`、`owasp-error-handling`、`owasp-logging`。

**错误示例：**

```java
body.put("value", fieldError.getRejectedValue());
```

**正确写法：**

```java
body.put("field", fieldError.getField());
body.put("code", fieldError.getCode());
```

**验证方式：** 使用包含测试 secret 的非法输入，断言响应和日志均不包含该原文。

### 错误：同类内部调用期待方法校验

**触发条件：** `this.create(...)` 调用带约束的方法。

**原因：** 代理只包裹外部 Bean 调用，this 调用绕过代理。

**后果：** 约束没有触发，错误在更深层才出现。

**影响版本：** Spring Framework 7.0.8 / 5.2.15。

**来源：** `spring-method-validation`、`spring-legacy-validation`。

**错误示例：**

```java
this.create("");
```

**正确写法：**

```java
validationPort.create("");
```

**验证方式：** 分别执行 self 调用与代理 Bean 调用，断言只有经过代理的空值调用产生约束异常。
:::

## 十四、安全注意

本节安全边界适用于接收不可信 HTTP 输入的现代与旧版两条版本线，依据右侧 OWASP Input Validation、
Mass Assignment、Error Handling 与 Logging 来源卡执行：

1. 错误响应只公开字段路径、稳定错误码和安全消息，不回显 rejected value。
2. 日志只记录 requestId、错误类别和必要字段名；密码、token、证件号与完整请求体必须脱敏或省略。
3. DTO 校验不代替认证、授权、限流和请求体大小限制，这些边界要在各自层独立验证。
4. 自定义校验器不查询外部系统或拼接敏感数据，避免慢请求、竞态和日志泄露。

## 十五、如何验证

1. 用 Java 25/Boot 4.1.0 与 Java 8/Boot 2.3.12 反馈环分别验证 `jakarta.validation`、`javax.validation`、
   绑定失败、约束失败、级联、元素约束、方法校验和自定义约束。
2. 运行 `npm --prefix docs/backend/java/audit/tooling run check:course:knowledge-path` 及
   `npm run type-check && npm run lint && npm run format:check && npm run test:unit && npm run test:e2e && npm run build`。
3. 在 1440x900 与 390x844 检查每个编号独立换行、来源唯一和无横向溢出。

:::exercise
### 练习：实现课程创建输入合同

**要求：** 实现一个 `CreateCourseRequest`，要求 title 非空白且不超过 80 个字符，tags 最多 20 个且每项非空白；
为嵌套 teacher 增加级联校验，并把所有失败转换为 `{field, code, message}`。至少验证缺失、空白、超长、
错误类型和嵌套字段五个分支。

**验收：** 合法请求进入应用服务；五类非法请求都返回 400 和稳定字段路径；响应不含 rejected value、Java
类名或堆栈；现代与 Java 8 反馈环各连续通过两次。

**参考答案：** 使用独立请求 DTO、标准约束、嵌套属性上的 `@Valid` 和 `@RestControllerAdvice`；业务重复、
权限和数据库唯一性仍由 Service 与数据库约束处理。
:::

## 十六、本节小结

绑定负责类型转换，Bean Validation 负责结构合同，Service 负责业务事实。先定义 null 和空值语义，再选择
标准约束；使用 `@Valid` 和容器元素约束保护嵌套数据；用 advice 输出稳定错误码；自定义校验器保持无状态、
快速且无外部副作用。
