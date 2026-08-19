# Bean Validation、参数绑定与输入合同官方研究稿

## 冻结课程合同

| 项目 | 冻结值 |
| --- | --- |
| 执行阶段 | Phase C / I-10 官方调研 |
| 课程 ID | `backend.java.learn.intermediate.bean-validation-and-input-contracts` |
| 标题 | Bean Validation、参数绑定与输入合同 |
| 阶段 | `intermediate`；I-10；必修 |
| 预计时长 | 150 分钟 |
| 唯一前置 | `backend.java.learn.intermediate.transactions-and-idempotency`（I-09） |
| 现代基线 | Java 25、Spring Boot 4.1.0、Spring Framework 7.0.8、Jakarta Validation 3.1 |
| 兼容基线 | Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE、Bean Validation 2.0 |
| 本批唯一写入 | `docs/research/backend/java/intermediate/bean-validation-and-input-contracts.md` |
| 本批不授权 | 正文、track、loader、manifest、signoff、fixture、浏览器或后继课程改动 |

Phase A 将本课冻结为复用稳定 ID 的中级第 I-10 课，唯一前置是 I-09。旧研究稿中的“顺序 410”、
“中级第 12/17 批”和旧后继边界不再作为执行权威。本批只完成官方调研与实现合同冻结；研究完成不等于
正文已经迁移、运行时已经发布或后继批次已经获得授权。

## 范围与排除项

### 本课必须覆盖

1. 区分 HTTP 消息转换、请求参数绑定、类型转换、Bean Validation 与业务规则五层边界。
2. 讲清标准约束的适用类型、`null` 语义、字段约束、对象约束与错误路径。
3. 讲清 `@Valid` 级联、容器元素约束、默认组、显式验证组和组选择的适用条件。
4. 讲清 Spring MVC 对 `@RequestBody`、`@ModelAttribute` 和直接方法参数的不同验证路径。
5. 区分 Controller 原生方法验证与 Spring Bean 代理方法验证，不混用触发条件和异常类型。
6. 建立绑定失败、类型转换失败、对象校验失败、方法校验失败的统一应用错误合同。
7. 用专用输入 DTO、属性允许列表、长度/集合上限和服务端校验限制不可信输入。
8. 冻结自定义字段约束、跨字段约束及 `ConstraintValidator` 无共享可变状态的线程安全要求。
9. 用 Java 25 / Boot 4.1 和真实 Java 8 / Boot 2.3 两套临时 fixture 证明共有语义与版本差异。

### 本课明确不包含

- 认证、授权、租户隔离、CSRF、XSS 输出编码或 SQL 参数化的完整教学；
- 数据库唯一约束、并发竞态、事务回滚或持久化后的业务一致性；
- 文件上传、反病毒扫描、全局请求体大小、网关限流或拒绝服务容量设计；
- Problem Details、全站异常架构、日志平台、trace 传播或多语言体系的完整设计；
- Hibernate Validator 提供方专属约束、fail-fast 配置或把实现扩展写成 Jakarta 标准；
- 把输入“清洗”后继续使用、把 denylist 当主要防线，或把客户端校验当安全边界。

## 调研方法与证据等级

- 核验日期：2026-08-15。
- 严格先用 Tavily 定位候选，再回到 Jakarta Validation、Spring Framework、Spring Boot、
  Bean Validation 与 OWASP 官方直接页面逐项核验。
- 最终采用 28 个直接 URL；每个 URL 均以
  `curl -L --fail --silent --show-error` 单独访问，结果全部为 HTTP 200。
- 约束、级联、验证组、方法验证和验证器线程安全以 Jakarta / Bean Validation 规范为 A 级证据。
- 绑定、转换、MVC 触发、异常类型、starter 与版本要求以精确 Spring 官方文档为 B 级证据。
- 服务端验证、允许列表、mass assignment、错误去敏与日志去敏以 OWASP 为安全证据。
- 本课错误码、JSON 形状、排序规则和测试矩阵属于课程应用合同，不包装成 Jakarta 或 Spring 的通用格式。

## 官方来源与可达性

| ID | 直接页面 | 等级与适用范围 | HTTP | 支持的结论 |
| --- | --- | --- | ---: | --- |
| `validation-31-spec` | [Jakarta Validation 3.1 Specification](https://jakarta.ee/specifications/bean-validation/3.1/jakarta-validation-spec-3.1.html) | A；Jakarta Validation 3.1 | 200 | 约束声明、`null` 分工、级联、组、容器元素、方法验证、自定义约束与验证器线程安全 |
| `validation-31-constraints` | [Jakarta Validation 3.1 Constraints API](https://jakarta.ee/specifications/bean-validation/3.1/apidocs/jakarta/validation/constraints/package-summary) | A；Jakarta Validation 3.1 | 200 | `NotNull`、`NotBlank`、`Size`、数值、日期等标准约束的目标与含义 |
| `bean-validation-20-spec` | [Bean Validation 2.0 Specification](https://beanvalidation.org/2.0/spec/) | A；Bean Validation 2.0 | 200 | Java 8 线的 `javax.validation`、容器元素、级联、组与方法验证合同 |
| `boot-4-system` | [Spring Boot System Requirements](https://docs.spring.io/spring-boot/system-requirements.html) | B；Spring Boot 4.1.0 | 200 | 要求 Java 17 至 26 与 Spring Framework 7.0.8+，Java 25 位于支持范围 |
| `boot-4-starters` | [Spring Boot 4.1 Build Systems](https://docs.spring.io/spring-boot/4.1/reference/using/build-systems.html) | B；Spring Boot 4.1 | 200 | 现代 MVC、验证与 MVC 测试 starter 分别为 `webmvc`、`validation` 与 `webmvc-test` |
| `boot-4-jackson-properties` | [Spring Boot 4.1 JSON Application Properties](https://docs.spring.io/spring-boot/4.1/appendix/application-properties/index.html#application-properties.json.spring.jackson.deserialization) | B；Spring Boot 4.1 | 200 | `spring.jackson.deserialization.*` 用于配置 Jackson 反序列化特性；本课显式启用未知属性失败 |
| `boot-4-validation` | [Spring Boot Validation](https://docs.spring.io/spring-boot/reference/io/validation.html) | B；Spring Boot 4.1.0 | 200 | provider 在 classpath 时自动启用方法验证，Spring Bean 需类型级 `@Validated` |
| `spring-7-mvc-validation` | [Spring MVC Validation](https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-controller/ann-validation.html) | B；Spring Framework 7.0.8 | 200 | 对象级与方法级验证的触发条件及两类 MVC 验证异常 |
| `spring-7-method-validation-exception` | [HandlerMethodValidationException API](https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/method/annotation/HandlerMethodValidationException.html) | B；Spring Framework 7.0.8 | 200 | 输入方法校验失败为 400，返回值校验失败为 500；该类型自 6.1 存在 |
| `spring-7-request-body` | [Spring MVC RequestBody](https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-controller/ann-methods/requestbody.html) | B；Spring Framework 7.0.8 | 200 | `HttpMessageConverter` 先生成对象，`@Valid` 失败默认进入 400 |
| `spring-7-model-attribute` | [Spring MVC ModelAttribute](https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-controller/ann-methods/modelattrib-method-args.html) | B；Spring Framework 7.0.8 | 200 | 属性绑定的 mass-assignment 风险、专用模型、构造器绑定与 `allowedFields` |
| `spring-7-type-conversion` | [Spring MVC Type Conversion](https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-controller/ann-methods/typeconversion.html) | B；Spring Framework 7.0.8 | 200 | 请求字符串通过 ConversionService / formatter 转为目标 Java 类型 |
| `spring-7-type-mismatch` | [MethodArgumentTypeMismatchException API](https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/method/annotation/MethodArgumentTypeMismatchException.html) | B；Spring Framework 7.0.8 | 200 | 直接方法参数类型转换失败由该异常报告，可统一映射为 400 输入绑定错误 |
| `spring-7-bean-validation` | [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/7.0/core/validation/beanvalidation.html) | B；Spring Framework 7.0.8 | 200 | `LocalValidatorFactoryBean` 与 Spring Bean 代理方法验证 |
| `spring-7-binding-result` | [BindingResult API](https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/validation/BindingResult.html) | B；Spring Framework 7.0.8 | 200 | 绑定/验证结果、字段错误与被抑制字段的读取接口 |
| `spring-7-field-error` | [FieldError API](https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/validation/FieldError.html) | B；Spring Framework 7.0.8 | 200 | 字段错误可持有 rejected value，因此不能直接序列化进响应或日志 |
| `spring-7-data-binder` | [DataBinder API](https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/validation/DataBinder.html) | B；Spring Framework 7.0.8 | 200 | 属性绑定默认允许全部字段；`setAllowedFields` 限制可写属性 |
| `spring-7-unreadable` | [HttpMessageNotReadableException API](https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/http/converter/HttpMessageNotReadableException.html) | B；Spring Framework 7.0.8 | 200 | HTTP 消息不可读是转换层失败，不是 Bean Validation violation |
| `boot-2-3-system` | [Spring Boot 2.3.12 System Requirements](https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#system-requirements) | B；Spring Boot 2.3.12.RELEASE | 200 | 要求 Java 8、兼容至 Java 15，并要求 Spring Framework 5.2.15+ |
| `boot-2-3-validation` | [Spring Boot 2.3 Validation](https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/spring-boot-features.html#boot-features-validation) | B；Spring Boot 2.3.12.RELEASE | 200 | 旧线用 `javax.validation`，类型级 `@Validated` 触发 Bean 方法验证 |
| `boot-2-3-release` | [Spring Boot 2.3 Release Notes](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.3-Release-Notes) | B；Spring Boot 2.3 | 200 | 从 2.3 起 web starter 不再传递 validation starter，必须显式添加 |
| `spring-5-bean-validation` | [Spring Framework 5.2 Bean Validation](https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/core.html#validation-beanvalidation) | B；Spring Framework 5.2.15 | 200 | `javax.validation.Validator`、`MethodValidationPostProcessor` 与 `@Validated` 旧线 |
| `spring-5-request-body` | [Spring Framework 5.2 RequestBody](https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/web.html#mvc-ann-requestbody) | B；Spring Framework 5.2.15 | 200 | `HttpMessageConverter`、`javax.validation.Valid`、`BindingResult` 与默认 400 |
| `spring-5-web-data-binder` | [Spring Framework 5.2 WebDataBinder API](https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/bind/WebDataBinder.html) | B；Spring Framework 5.2.15 | 200 | Java 8 线同样可设置 allowed fields 并读取绑定错误 |
| `owasp-input-validation` | [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) | 安全标准；不可信输入 | 200 | 服务端校验、允许列表、完整字符串匹配、长度限制及语法/语义分层 |
| `owasp-mass-assignment` | [OWASP Mass Assignment Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html) | 安全标准；请求绑定 | 200 | 用专用 DTO 和 Spring `allowedFields` 限制客户端可写属性 |
| `owasp-error-handling` | [OWASP Error Handling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html) | 安全标准；错误响应 | 200 | 客户端使用通用错误信息，不泄露堆栈与内部实现细节 |
| `owasp-logging` | [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) | 安全标准；日志数据 | 200 | 口令、令牌、密钥和敏感个人数据不应直接写日志 |

## 双版本边界

| 维度 | 现代反馈环 | Java 8 兼容反馈环 |
| --- | --- | --- |
| JDK | Java 25 | Java 8 |
| Boot / Spring | Boot 4.1.0 / Framework 7.0.8 | Boot 2.3.12.RELEASE / Framework 5.2.15.RELEASE |
| Validation API | Jakarta Validation 3.1 | Bean Validation 2.0 |
| import | `jakarta.validation.*` | `javax.validation.*` |
| MVC starter | `spring-boot-starter-webmvc` | `spring-boot-starter-web` |
| validation starter | 显式 `spring-boot-starter-validation` | 显式 `spring-boot-starter-validation`；不能假设 web starter 传递 |
| 请求 DTO 校验 | `@Valid @RequestBody`，失败通常为 `MethodArgumentNotValidException` | `@Valid @RequestBody`，失败通常为 `MethodArgumentNotValidException` |
| Controller 直接约束 | Spring MVC 原生方法验证，失败可为 `HandlerMethodValidationException` | 不复制现代异常分支；用旧线实际可用的对象校验或 Bean 代理方法验证 |
| Spring Bean 方法校验 | 类型级 `@Validated`，provider 在 classpath 时由 Boot 启用 | 类型级 `@Validated`，provider 在 classpath 时由 Boot 启用 |

两条线共享标准约束、`@Valid` 级联、容器元素约束、组、自定义约束和方法参数/返回值约束的核心语义。
示例源不能同时 import 两个命名空间，也不能在 legacy fixture 中引用
`HandlerMethodValidationException`。为了让失败差异只来自框架版本，两套 fixture 都使用普通 JavaBean DTO，
不把 record、模式匹配或其他新语法混入验证结论。

## 输入处理流水线

### 1. HTTP 消息转换

`@RequestBody` 先由 `HttpMessageConverter` 把请求体反序列化为 Java 对象。JSON 语法损坏、字段值无法转换为
目标 Java 类型或消息根本不可读时，系统可能在 DTO 生成前抛出 `HttpMessageNotReadableException`。
此时没有可供 Bean Validation 检查的完整 DTO，也没有 `ConstraintViolation` 列表。

### 2. 请求参数绑定与类型转换

`@ModelAttribute` 走 `WebDataBinder`，query、form 等字符串值通过 conversion service 或 formatter 转为属性
类型。`@RequestParam`、`@PathVariable` 等直接参数也需要先转换成目标 Java 类型。转换失败是 binding / type
mismatch，不得伪装成 `@Min`、`@Size` 等约束失败。

属性绑定与 JSON 消息转换不是同一条路径：`WebDataBinder.setAllowedFields(...)` 用于属性绑定，不能宣称它会
过滤 `@RequestBody` 的 JSON 属性。JSON 输入应使用只暴露客户端可写字段的专用 DTO；若产品还要求拒绝未知
JSON 属性，必须在 Jackson 层另行冻结并验证，本课不暗示 Bean Validation 能完成该工作。

### 3. Bean Validation

只有在框架得到可验证的 Java 值后，Bean Validation 才按选定组执行约束。它报告“值是否符合声明合同”，
不负责解析损坏 JSON、把危险字符串变安全、判断当前用户是否有权修改字段，或证明数据库状态没有并发变化。

### 4. Controller 与业务边界

通过绑定和约束校验只表示请求满足入口形状。资源是否存在、名称是否唯一、状态转换是否允许、调用者是否有权
执行操作仍由后续层负责。此类业务失败不能补写成 DTO 注解，以免把数据库查询、权限判断或远程调用塞进
`ConstraintValidator`。

## Bean Validation 合同

### 标准约束与 `null`

- `@NotNull` 只拒绝 `null`；`@NotBlank` 同时拒绝 `null`、空串和纯空白字符串；`@NotEmpty` 拒绝
  `null` 与空容器/空字符序列。
- `@Size` 检查字符序列、集合、Map 或数组大小；`@Min` / `@Max` 检查数值下限/上限；日期约束依赖
  provider 的当前时间来源。
- 多数非空值约束把 `null` 视为有效，规范建议把核心格式约束与 `@NotNull` 分开。需要“必填且格式正确”时
  必须组合约束，不能只写 `@Email`、`@Size` 或 `@Positive`。
- `@Email` 证明值满足验证器的邮件地址语法判断，不证明邮箱存在、可投递或属于当前用户。
- 课程 DTO 为每个字符串和集合冻结合理 `max`，但字段级上限不能替代服务器/网关的总请求体限制。

### 级联、容器元素与组

- 在父 DTO 的嵌套属性上写 `@Valid` 才会级联检查嵌套对象；只有嵌套类型自身有约束并不会自动级联。
- `List<@NotBlank String>` 是容器元素约束；Bean Validation 2.0 已支持，因此现代线和 Java 8 线都能验证。
- 不传组时验证 `Default`。`@Validated(SomeGroup.class)` 可选择组，但组只用于真实存在的 create / update
  合同差异，不能为复用一个过大的 DTO 而制造难以理解的组合。
- 级联使用 `@Valid`，Spring 的 `@Validated` 负责 Spring 集成和组选择；两者不是互换别名。

### MVC 对象校验与方法校验

- `@Valid @RequestBody Dto` 的对象级校验失败通常产生 `MethodArgumentNotValidException`；若其后紧邻
  `Errors` 或 `BindingResult`，Controller 可以在本地处理对应对象错误。
- Spring 7 中，直接在 Controller 参数或返回值上写 `@Min`、`@NotBlank` 等约束会进入 MVC 原生方法
  验证，并可能产生 `HandlerMethodValidationException`。统一处理器必须覆盖两类异常。
- `@Valid` 本身不是约束，单独出现不会触发方法级验证；它的职责是级联嵌套对象。
- Spring 7 Controller 若保留类型级 `@Validated`，会走 AOP 代理方法验证。为了使用 MVC 原生方法验证，
  Controller 不加类型级 `@Validated`；服务 Bean 的方法验证才使用类型级 `@Validated`。
- legacy 线不引用现代 MVC 方法验证异常；它继续用 `@Valid @RequestBody` 验证 DTO，并用类型级
  `@Validated` 的 Spring Bean 验证服务方法参数/返回值。

### 自定义约束与线程安全

- 字段级自定义约束只处理一个值；跨字段规则使用类型级约束，并把 object error 映射为本课定义的根路径。
- `ConstraintValidator.isValid()` 必须线程安全。验证器保持无共享可变状态，不保存当前请求、用户、DTO、
  `ConstraintValidatorContext` 或上一次校验结果。
- `initialize()` 只读取注解配置；`isValid()` 使用局部变量。需要数据库、权限或远程状态的规则放到业务层。
- 自定义格式约束延续标准 `null` 分工：若 `null` 由 `@NotNull` 负责，自定义验证器对 `null` 返回有效。

## 错误响应合同

### 失败分层

| 失败阶段 | 典型信号 | 本课 HTTP | 本课稳定 code | `violations` |
| --- | --- | ---: | --- | --- |
| JSON 消息不可读或 JSON 字段类型无法反序列化 | `HttpMessageNotReadableException` | 400 | `INPUT_MALFORMED` | 空数组 |
| query / form / path 绑定或类型转换失败 | binding error / type mismatch | 400 | `INPUT_BINDING_FAILED` | 只保留安全 path 与稳定 code |
| 请求 DTO 对象校验失败 | `MethodArgumentNotValidException` | 400 | `INPUT_VALIDATION_FAILED` | 字段与对象错误 |
| Spring 7 Controller 输入参数校验失败 | `HandlerMethodValidationException` | 400 | `INPUT_VALIDATION_FAILED` | 输入参数错误 |
| Spring 7 Controller 返回值校验失败 | `HandlerMethodValidationException.isForReturnValue()` | 500 | `INTERNAL_ERROR` | 空数组；不向客户端暴露服务端返回值 |
| Spring Bean 代理方法校验失败 | provider constraint violation exception | 400，仅限本课入口参数 | `INPUT_VALIDATION_FAILED` | 参数路径错误 |
| 资源、权限、唯一性或状态规则失败 | 业务层结果 | 不在本课冻结 | 不冒充输入校验码 | 不使用 validation violation |

Spring 对 `@Valid @RequestBody` 校验失败默认返回 400；本课沿用 400，而不是宣称输入校验必须使用某个唯一
HTTP 状态。错误体是课程的应用合同：

```json
{
  "code": "INPUT_VALIDATION_FAILED",
  "message": "请求参数不符合输入合同",
  "violations": [
    {
      "path": "displayName",
      "code": "NotBlank",
      "message": "显示名称不能为空"
    }
  ]
}
```

### 归一化规则

1. 顶层始终只有 `code`、`message`、`violations`；malformed 错误也返回空数组，避免客户端分支漂移。
2. `path` 使用客户端合同中的 DTO 属性名；对象级错误固定为 `$`，方法参数使用公开参数名。
3. `code` 是稳定机器字段。已知标准约束映射到允许列表代码，未知约束统一为 `Invalid`；客户端不解析
   provider 类名或默认英文消息。
4. `message` 面向人，可按消息源调整；自动化只断言状态、顶层 code、path 和 violation code。
5. Controller 返回值违反约束表示服务端实现破坏自身合同，返回 500 通用错误，不伪装成客户端输入错误。
6. violation 在输出前按 `path`、`code` 升序排序。Jakarta API 返回 Set，课程不能依赖 provider 迭代顺序。
7. `BindingResult`、`FieldError`、异常对象和 `ConstraintViolation` 不直接序列化。
8. 响应与普通日志都不包含 rejected value、原始请求体、堆栈、异常类名、验证器类名、SQL、内部路径、
   口令、令牌、密钥或敏感个人数据。

## 安全边界

1. 所有安全相关输入校验必须在服务端执行；浏览器校验只改善交互，攻击者可以绕过。
2. 结构化字段优先允许列表，并限制最小/最大长度。denylist 只能补充，不能取代允许列表。
3. `@RequestBody` 使用专用请求 DTO，不直接绑定实体、持久化模型或含 `role`、`ownerId`、`approved` 等
   服务端字段的领域对象。
4. `@ModelAttribute` 属性绑定优先使用专用模型或构造器绑定；必须 setter 绑定时显式设置
   `allowedFields`，不能仅依赖易遗漏的 disallowed fields。
5. DTO 约束只定义输入形状。授权、所有权、业务状态、唯一性和并发判断在后续边界再次检查。
6. 校验不是 sanitization。无效输入应拒绝；后续输出编码、查询参数化和上下文安全处理各自负责。
7. 错误响应只返回稳定、安全、可行动的信息；详细原因留在受控诊断渠道，且日志仍需去敏。
8. 自定义验证器必须无共享可变状态，防止并发请求互相污染结果或泄露上一个请求的数据。

## 可执行双版本反馈环

### 临时工程合同

后续实现批在 `/tmp` 分别创建 `java-i10-modern.*` 与 `java-i10-legacy.*`，不得把 fixture、测试或构建产物
写入仓库。两套工程都包含最小 `pom.xml`、启动类、请求 DTO、嵌套 DTO、自定义类型级约束、Controller、
服务 Bean、统一错误 DTO、异常处理器和一份聚焦 MVC 测试。

现代 POM 冻结为：

- parent `org.springframework.boot:spring-boot-starter-parent:4.1.0`；
- `java.version=25`；
- `spring-boot-starter-webmvc`；
- `spring-boot-starter-validation`；
- `spring-boot-starter-test`，test scope。
- `spring-boot-starter-webmvc-test`，test scope，用于 MockMvc MVC 反馈环。

legacy POM 冻结为：

- parent `org.springframework.boot:spring-boot-starter-parent:2.3.12.RELEASE`；
- `java.version=8`；
- `spring-boot-starter-web`；
- 显式 `spring-boot-starter-validation`；
- `spring-boot-starter-test`，test scope。

### 现代反馈命令

```bash
set -euo pipefail
modern_i10_dir=$(mktemp -d /tmp/java-i10-modern.XXXXXX)
docker run --rm -v "${modern_i10_dir}:/workspace" -w /workspace \
  maven:3.9.12-eclipse-temurin-25 mvn -q test
find "$modern_i10_dir" -depth -delete
test ! -e "$modern_i10_dir"
```

### Java 8 反馈命令

```bash
set -euo pipefail
legacy_i10_dir=$(mktemp -d /tmp/java-i10-legacy.XXXXXX)
docker run --rm -v "${legacy_i10_dir}:/workspace" -w /workspace \
  maven:3.9.12-eclipse-temurin-8 mvn -q test
find "$legacy_i10_dir" -depth -delete
test ! -e "$legacy_i10_dir"
```

生成 fixture 与运行命令是后续实现批的职责。本研究批不创建或执行它们。后续执行时只有测试通过后才删除临时
目录；失败时先保存命令、退出码和最小诊断，再按批次规则处理，不能把失败产物写回仓库。

### 共有验收矩阵

| 场景 | 请求/调用 | 两条线必须证明 |
| --- | --- | --- |
| 合法 DTO | 合法根对象、嵌套对象与容器元素 | 进入 Controller，返回成功响应 |
| 损坏 JSON | 缺少 JSON 结束符 | 400 + `INPUT_MALFORMED` + 空 violations |
| JSON 类型错误 | 数字字段传对象或非数字字符串 | 400 + `INPUT_MALFORMED`，不伪造约束错误 |
| 直接参数类型错误 | `GET /courses/page?page=abc` | `MethodArgumentTypeMismatchException -> INPUT_BINDING_FAILED` |
| 必填失败 | `displayName` 为空白 | 400 + path `displayName` + code `NotBlank` |
| 级联失败 | 嵌套地址的 `city` 为空白 | 400 + path `address.city`，证明 `@Valid` 生效 |
| 容器元素失败 | tags 含空白元素 | 400 + 容器元素路径，证明 Bean Validation 2.0/3.1 共有能力 |
| 跨字段失败 | `endDate` 早于 `startDate` | 400 + path `$` + 自定义稳定 code |
| 本地错误处理 | `@Valid` 参数后紧邻 `BindingResult` | Controller 收到错误且响应仍遵守统一合同 |
| Bean 方法校验 | 调用类型级 `@Validated` 服务的非法参数 | 调用被约束异常阻断，统一映射且不泄露原值 |
| 属性允许列表 | DataBinder 同时收到公开字段与服务端字段 | 只绑定公开字段，服务端字段保持原值并进入 suppressed fields |
| 错误去敏 | 敏感字段校验失败 | 响应和捕获日志不含测试 secret、请求体标记、`Caused by`、课程堆栈帧或相关异常类名 |

现代 fixture 另加 Controller 直接参数与返回值约束场景，分别证明
`HandlerMethodValidationException -> 400 + INPUT_VALIDATION_FAILED` 与
`HandlerMethodValidationException.isForReturnValue() -> 500 + INTERNAL_ERROR`。legacy fixture 不导入该类型，
以 Spring 5.2 实际存在的 DTO 校验与 Bean 代理方法验证覆盖相同用户可见输入失败语义。

## 零基础知识点拆分

正式正文按以下 19 个小点串行展开，每点都要回答“是什么、为什么、何时用、如何用、运行结果、常见误区”：

1. 不可信输入与五层处理边界；
2. `@RequestBody` 与 HTTP 消息转换；
3. `@ModelAttribute`、请求参数绑定与类型转换；
4. Bean Validation provider、starter 与验证入口；
5. `@NotNull`、`@NotBlank`、`@NotEmpty` 与 `null` 分工；
6. `@Size`、`@Pattern`、`@Email` 与字符串/集合合同；
7. 数值约束和日期约束；
8. `@Valid` 与嵌套对象级联；
9. 容器元素约束；
10. 默认组、显式组与 `@Validated`；
11. Spring MVC 请求 DTO 对象校验；
12. Spring 7 Controller 原生方法验证；
13. Spring Bean 代理方法参数与返回值验证；
14. `Errors` / `BindingResult` 的相邻参数合同；
15. malformed、binding、validation 与 business failure 分层；
16. 稳定错误 JSON、路径、代码与确定性排序；
17. 字段级自定义约束与类型级跨字段约束；
18. 专用 DTO、allowed fields 与 mass-assignment 防护；
19. 验证器线程安全、错误去敏与日志去敏。

## 项目证据与纠错边界

项目证据只复用冻结矩阵中的观察结果，不重新读取或运行旧项目：

- `com.tdh.bdzz.annoation.CltjrSf` 与 `CltjrSfValidator` 只作为“项目存在自定义约束”的观察证据；
  正式示例重新定义标准 Jakarta / javax 兼容约束，并明确 `null` 分工与线程安全。
- `com.tdh.bdzz.validator.MinValidator` 只作提供方/项目私有校验器的纠错对照，不冒充标准 `@Min`。
- `AddSwtHyjhDTO` 只作请求 DTO 场景观察，不复制业务字段、敏感字段或真实数据。
- `BaseOuterController` 只作 MVC 验证触发点观察；课程错误合同按本研究重新实现和验证。

## 研究 Gate 与 Stop Boundary

- [x] Phase A 的 I-10 标题、稳定 ID、150 分钟、必修性质与唯一前置已重新冻结。
- [x] 28 个官方直接 URL 已在 2026-08-15 逐项返回 HTTP 200。
- [x] Java 25 / Boot 4.1 / Spring 7 与 Java 8 / Boot 2.3 / Spring 5.2 边界已区分。
- [x] 消息转换、属性绑定、类型转换、Bean Validation 与业务规则没有混为一层。
- [x] 现代两类 MVC 验证异常与 legacy 可用异常路径没有混用。
- [x] 稳定错误 JSON、确定性排序、rejected value 禁止项和日志去敏已冻结。
- [x] 双版本 `/tmp` fixture 的依赖、命令、断言矩阵与删除证明已冻结。
- [x] 本批只修改研究稿，没有创建 fixture，也没有修改正文、track、loader、manifest 或 signoff。
- [x] 后继课程仍未领取；I-10 研究完成不授权下一批。
