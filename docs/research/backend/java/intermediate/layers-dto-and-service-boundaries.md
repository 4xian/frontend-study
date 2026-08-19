# 分层架构、DTO、Service 与仓储接口研究稿

## 冻结课程合同

| 项目 | 冻结值 |
| --- | --- |
| 课程 ID | `backend.java.learn.intermediate.layers-dto-and-service-boundaries` |
| 标题 | 分层架构、DTO、Service 与仓储接口 |
| 阶段与顺序 | Phase C `I-11`；`intermediate`；中级第 11 课 |
| 唯一前置课程 | `I-10`：`backend.java.learn.intermediate.bean-validation-and-input-contracts` |
| 来源能力 | `JAVA-ENGINEERING-001`、`JAVA-ENGINEERING-002`、`JAVA-RISK-001`、`JAVA-RISK-002`、`JAVA-RISK-004` |
| 来源性质 | `project-observed`、`risk-correction` |
| 选择原因 | 项目的 Controller、Service、Mapper 和多类模型需要明确职责；超大类只作拆分边界的反例 |
| 现代主线 | Java 25 LTS、Spring Boot 4.1.0、Spring Framework 7.0.8；MyBatis 3.5.19 只用于解释 Mapper 公开合同 |
| 项目补充 | Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE |
| Phase C 路线状态 | Phase A 已冻结为 `I-11`，复用稳定课程 ID；本批只更新官方研究 |
| 冻结快照 | `dzzz-app-20260803-179e722831ab`；分析 `dzzz-app-analysis-20260803-958d37cf1be1` |
| 项目边界 | 本研究只读取冻结审计产物；不读取、运行或修改 `dzzz-app`，不把项目现状当推荐写法 |
| 后继边界 | `I-11` 完整关闭前不领取 `I-12`：`backend.java.learn.intermediate.spring-boot-mysql-mybatis-persistence-bridge` |

I-11 只建立一次普通后端请求经过 Controller、输入 DTO、Service、Repository、持久化 Mapper，再返回
输出 DTO 的职责、数据和依赖边界。Spring MVC 路由细节、依赖注入生命周期、MyBatis 配置、完整事务
传播、全局错误响应、领域驱动设计战术模式和微服务拆分分别属于后续课程，不在本课提前展开。

## 核验基线与研究方法

- 核验日期：2026-08-15。
- 当前 Spring Boot 系统要求页固定 4.1.0，要求 Java 17 至 Java 26 和 Spring Framework 7.0.8
  或以上；因此 Java 25 可作为本课现代运行线。
- legacy 固定为 Spring Boot 2.3.12.RELEASE。其系统要求明确 Java 8 至 Java 15，并要求 Spring
  Framework 5.2.15.RELEASE 或以上；不能在 Java 25 上运行一次就宣称旧项目兼容。
- MyBatis 当前公开文档标识 3.5.19。本课只借其说明 Mapper interface、mapped statement 和
  `resultMap` 的合同，不倒推 `dzzz-app` 的 effective dependency，也不提前教授 MyBatis 配置。
- Tavily search 只用于定位直接页面；最终结论回到 Oracle/OpenJDK、Spring、
  MyBatis、Jakarta、ArchUnit 和 OWASP 的第一方直接页面。搜索摘要和社区文章不进入证据链。
- 本批对 29 个唯一直接 URL 执行 `curl -L` GET 核验，最终状态均为 HTTP 200；JEP 395 对默认
  `curl` User-Agent 返回 403，改用标准浏览器 User-Agent 重试后为 200，其余 URL 首轮即为 200。
- 分层方式属于工程设计，不是 Java 语法。来源能证明框架合同和风险边界；本课采用的依赖方向是明确
  标注的课程约定，并用可执行架构检查验证，不能包装成所有系统唯一合法的分层方式。

## 官方来源卡与直接证据

以下页面均在 2026-08-15 通过 Tavily 定位候选后回到直接页面核验。

### 现代 Java、Spring 与分层合同

| ID | 直接来源 | sourceType | 适用版本 | 支持结论 |
| --- | --- | --- | --- | --- |
| `oracle-java-support-roadmap` | [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) | `official-reference` | Java 25 | Oracle 将 Java SE 25 列为 LTS；本课现代 Java 线固定为 Java 25，不把当前非 LTS 的 Java 26 改写为课程基线。 |
| `spring-boot-system-requirements` | [Spring Boot System Requirements](https://docs.spring.io/spring-boot/system-requirements.html) | `official-reference` | Spring Boot 4.1.0 | 要求 Java 17 至 26、Spring Framework 7.0.8 或以上；Java 25 位于支持范围。 |
| `spring-component-stereotypes` | [Classpath Scanning and Managed Components](https://docs.spring.io/spring-framework/reference/core/beans/classpath-scanning.html) | `official-reference` | Spring Framework 7.0.8 | `@Controller`、`@Service`、`@Repository` 分别是 presentation、service、persistence 角色的 `@Component` specialization；annotation 让角色可被扫描和工具识别，但不会自动替开发者划清职责。 |
| `spring-dependency-injection` | [Dependencies and Configuration in Detail](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html) | `official-reference` | Spring Framework 7.0.8 | 构造器参数显式声明对象的必需依赖；构造器参数过多可能表示一个类承担了过多职责。 |
| `spring-controller-api` | [Controller API](https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/stereotype/Controller.html) | `api-doc` | Spring Framework 7.0.8 | 标记 Web controller，并作为 `@Component` specialization 参与扫描。 |
| `spring-service-api` | [Service API](https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/stereotype/Service.html) | `api-doc` | Spring Framework 7.0.8 | Service 表达模型中的独立操作或业务 facade；这是可由团队收窄含义的通用 stereotype。 |
| `spring-repository-api` | [Repository API](https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/stereotype/Repository.html) | `api-doc` | Spring Framework 7.0.8 | Repository 封装存储、读取和查询；也可标记 DAO，但官方提醒区分 DAO 与 DDD repository；配合后处理器时可参与持久化异常转换。 |
| `spring-mvc-request-body` | [Spring MVC `@RequestBody`](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestbody.html) | `official-reference` | Spring Framework 7.0.8 | 请求体由消息转换器读入方法参数；配合 `jakarta.validation.Valid` / `@Validated` 触发标准校验，默认失败进入 MVC 的 400 错误处理。 |
| `spring-mvc-validation` | [Spring MVC Validation](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-validation.html) | `official-reference` | Spring Framework 7.0.8 | 区分单个 command object 校验与方法参数校验；`@Valid` 本身不是约束，错误类型和 `BindingResult` 位置有明确合同。 |
| `spring-transactional` | [Using `@Transactional`](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html) | `official-reference` | Spring Framework 7.0.8 | 默认传播为 `REQUIRED`、隔离为底层默认、读写事务；默认仅 `RuntimeException` / `Error` 回滚；proxy 模式只拦截经代理进入的外部调用，自调用不生效。 |
| `spring-transaction-rollback` | [Rolling Back a Declarative Transaction](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/rolling-back.html) | `official-reference` | Spring Framework 7.0.8 | 未处理异常沿调用栈冒泡后由事务基础设施决定回滚；checked exception 默认不回滚，可显式配置 rollback rule。 |
| `spring-data-transactionality` | [Spring Data JPA Transactionality](https://docs.spring.io/spring-data/jpa/reference/jpa/transactions.html) | `official-reference` | Spring Data JPA 4.1.0 | 多 repository 调用可由 facade/service 定义事务；官方建议在工作单元开始处声明事务边界，确保一致参与。 |
| `jls25-records` | [JLS 25 §8.10 Record Classes](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.10) | `specification` | Java 25 | record header 声明状态，编译器提供 component fields、accessors、canonical constructor、`equals`、`hashCode` 和 `toString` 合同。 |
| `jep395-records` | [JEP 395: Records](https://openjdk.org/jeps/395) | `official-reference` | Java 16 起正式特性；Java 25 可用 | record 是透明数据载体；header 定义状态。record 只保证 component reference 不能重新赋值，不保证 component 指向的可变对象深层不可变。 |

### Mapper、模型、校验与安全

| ID | 直接来源 | sourceType | 适用版本 | 支持结论 |
| --- | --- | --- | --- | --- |
| `mybatis-java-api` | [MyBatis Java API](https://mybatis.org/mybatis-3/java-api.html) | `official-reference` | MyBatis 3.5.19 | Mapper interface 的方法签名唯一对应 mapped statement；返回类型必须匹配单个或集合结果；`SqlSession` 承载 statement、commit、rollback 和 mapper 获取。 |
| `mybatis-mapper-xml` | [MyBatis Mapper XML Files](https://mybatis.org/mybatis-3/sqlmap-xml.html) | `official-reference` | MyBatis 3.5.19 | `select/insert/update/delete` 定义 SQL statement；`resultMap` 明确列到 Java 属性、构造器、关联或集合的映射；官方建议逐步构建并测试复杂 ResultMap。 |
| `jakarta-persistence-3-2` | [Jakarta Persistence 3.2 Specification](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2) | `specification` | Jakarta Persistence 3.2 | 实体及关系到数据库的 object/relational mapping metadata 是应用模型合同；查询依赖这些映射语义。 |
| `jakarta-validation-3-1` | [Jakarta Validation 3.1 Specification](https://jakarta.ee/specifications/bean-validation/3.1/jakarta-validation-spec-3.1.html) | `specification` | Jakarta Validation 3.1 | 约束可放在字段、属性、参数和返回值；声明约束不会自动执行方法校验，必须由集成层、代理或显式 Validator 触发。 |
| `owasp-input-validation` | [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) | `security-standard` | 2026-08-15 页面状态 | 所有用户输入都应做服务端 allowlist 校验；语法校验检查结构，语义校验检查值在具体业务上下文中是否合理。 |
| `owasp-mass-assignment` | [OWASP Mass Assignment Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html) | `security-standard` | 2026-08-15 页面状态 | 自动把请求绑定到内部对象可能让攻击者修改未预期字段；专用 DTO 只暴露允许客户端提供的字段，allowlist 优先于 blocklist。 |
| `owasp-api-property-authorization` | [OWASP API3:2023 Broken Object Property Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/) | `security-standard` | OWASP API Security 2023 | 输入只允许客户端可修改的属性；输出应逐项选择允许读取的属性，避免通用 `to_json()` / `to_string()` 暴露敏感字段。 |
| `archunit-layer-checks` | [ArchUnit User Guide](https://www.archunit.org/userguide/html/000_Index.html) | `engineering-reference` | ArchUnit 1.4.2 | 可把 Controller、Service、Persistence 定义为层并声明允许访问方向；还可检查 package slices 无循环依赖。 |

### Java 8 与 Spring 5 legacy 直接证据

| ID | 直接来源 | sourceType | 适用版本 | 支持结论 |
| --- | --- | --- | --- | --- |
| `spring-boot-2-3-system-requirements` | [Spring Boot 2.3.12 System Requirements](https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#system-requirements) | `official-reference` | Spring Boot 2.3.12.RELEASE | 要求 Java 8，兼容至 Java 15，并要求 Spring Framework 5.2.15.RELEASE 或以上。 |
| `spring-5-controller-api` | [Spring 5.2.15 Controller API](https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/stereotype/Controller.html) | `api-doc` | Spring Framework 5.2.15.RELEASE | `@Controller` 标记 Web controller，通常与 `@RequestMapping` handler method 配合。 |
| `spring-5-service-api` | [Spring 5.2.15 Service API](https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/stereotype/Service.html) | `api-doc` | Spring Framework 5.2.15.RELEASE | Service 的独立模型操作或业务 facade 语义与现代线一致。 |
| `spring-5-repository-api` | [Spring 5.2.15 Repository API](https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/stereotype/Repository.html) | `api-doc` | Spring Framework 5.2.15.RELEASE | Repository/DAO 角色、存储封装和异常转换边界与现代线一致。 |
| `spring-5-request-body` | [Spring 5.2.15 MVC `@RequestBody`](https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/web.html#mvc-ann-requestbody) | `official-reference` | Spring Framework 5.2.15.RELEASE | 使用 `javax.validation.Valid` 或 `@Validated`；请求 DTO 校验失败默认转换为 400，区别于现代线的 `jakarta.validation.Valid` 包名。 |
| `spring-5-transactions` | [Spring 5.2.15 Declarative Transactions](https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/data-access.html#transaction-declarative-annotations) | `official-reference` | Spring Framework 5.2.15.RELEASE | 默认 proxy 模式只拦截经代理进入的外部调用，同类 self-invocation 不产生新事务语义。 |
| `bean-validation-2-0` | [Bean Validation 2.0 Specification](https://beanvalidation.org/2.0/spec/) | `specification` | Bean Validation 2.0 / Java 8 线 | `javax.validation` 约束和方法校验合同；声明约束仍需要集成层或显式调用触发。 |

## 冻结能力与 projectEvidence 合同

以下内容逐项抄录当前 `course-coverage-matrix.json` 的课程节点，不重新扫描源码，不增加新文件，不修改
数量、路径、符号或 `evidencePolicy`。`projectEvidenceCount` 只表示冻结审计覆盖量，不表示所有文件的
做法都正确，也不是课程示例统计。

### `JAVA-ENGINEERING-001`：分层架构与业务编排

- `evidencePolicy`：`project-observed-capability`。
- `projectEvidenceCount`：344。
- 冻结代表符号：
  - `com.tdh.bdzz.config.websocket.server.ClientChatWsServer`：
    `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientChatWsServer.java`
  - `com.tdh.bdzz.service.AiXntjService`：
    `dzzz-app/src/main/java/com/tdh/bdzz/service/AiXntjService.java`
  - `com.tdh.bdzz.annoation.AutoValid`：
    `dzzz-app/src/main/java/com/tdh/bdzz/annoation/AutoValid.java`
  - `com.tdh.bdzz.service.AsApiService`：
    `dzzz-app/src/main/java/com/tdh/bdzz/service/AsApiService.java`
  - `com.tdh.bdzz.annoation.AutowiredShardData`：
    `dzzz-app/src/main/java/com/tdh/bdzz/annoation/AutowiredShardData.java`

### `JAVA-ENGINEERING-002`：请求、响应与 DTO 模型边界

- `evidencePolicy`：`project-observed-capability`。
- `projectEvidenceCount`：1401。
- 冻结代表符号：
  - `com.tdh.bdzz.dto.filter.BaseFilterDTO`：
    `dzzz-app/src/main/java/com/tdh/bdzz/dto/filter/BaseFilterDTO.java`
  - `com.tdh.bdzz.po.MossServer`：`dzzz-app/src/main/java/com/tdh/bdzz/po/MossServer.java`
  - `com.tdh.bdzz.eo.DataEO`：`dzzz-app/src/main/java/com/tdh/bdzz/eo/DataEO.java`
  - `com.tdh.bdzz.util.JzTabUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/JzTabUtils.java`
  - `com.tdh.bdzz.dto.BldcDTO`：`dzzz-app/src/main/java/com/tdh/bdzz/dto/BldcDTO.java`

### 风险证据：`JAVA-RISK-001`、`JAVA-RISK-002`、`JAVA-RISK-004`

| 能力 | evidencePolicy | 冻结数量 | 冻结代表符号 |
| --- | --- | ---: | --- |
| `JAVA-RISK-001` Web 入口职责过载 | `project-risk-evidence-only` | 11 | `FybController`、`SjydController`、`Fyb4WindowsController`、`TsblSjyController`、`TsxxSearchController` |
| `JAVA-RISK-002` 业务服务职责过载 | `project-risk-evidence-only` | 36 | `YbtsServiceImpl`、`SjydServiceImpl`、`FgdServiceImpl`、`XinkeServiceImpl`、`Voice2TextServiceImpl` |
| `JAVA-RISK-004` 层次边界与模型职责混合 | `project-risk-evidence-only` | 116 | `Voice2TextWsServer`、`HkConfAddDTO`、`CommResultVO`、`ZxjgDTO`、`FybWsServer` |

冻结代表符号与路径如下：

- `JAVA-RISK-001`：
  - `com.tdh.bdzz.controller.FybController`：
    `dzzz-app/src/main/java/com/tdh/bdzz/controller/FybController.java`
  - `com.tdh.bdzz.controller.SjydController`：
    `dzzz-app/src/main/java/com/tdh/bdzz/controller/SjydController.java`
  - `com.tdh.bdzz.controller.Fyb4WindowsController`：
    `dzzz-app/src/main/java/com/tdh/bdzz/controller/Fyb4WindowsController.java`
  - `com.tdh.bdzz.controller.TsblSjyController`：
    `dzzz-app/src/main/java/com/tdh/bdzz/controller/TsblSjyController.java`
  - `com.tdh.bdzz.controller.TsxxSearchController`：
    `dzzz-app/src/main/java/com/tdh/bdzz/controller/TsxxSearchController.java`
- `JAVA-RISK-002`：
  - `com.tdh.bdzz.service.impl.YbtsServiceImpl`：
    `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/YbtsServiceImpl.java`
  - `com.tdh.bdzz.service.impl.SjydServiceImpl`：
    `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/SjydServiceImpl.java`
  - `com.tdh.bdzz.service.impl.FgdServiceImpl`：
    `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FgdServiceImpl.java`
  - `com.tdh.bdzz.service.impl.XinkeServiceImpl`：
    `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/XinkeServiceImpl.java`
  - `com.tdh.bdzz.service.impl.Voice2TextServiceImpl`：
    `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/Voice2TextServiceImpl.java`
- `JAVA-RISK-004`：
  - `com.tdh.bdzz.config.websocket.server.Voice2TextWsServer`：
    `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/Voice2TextWsServer.java`
  - `com.tdh.bdzz.dto.HkConfAddDTO`：
    `dzzz-app/src/main/java/com/tdh/bdzz/dto/HkConfAddDTO.java`
  - `com.tdh.bdzz.vo.CommResultVO`：
    `dzzz-app/src/main/java/com/tdh/bdzz/vo/CommResultVO.java`
  - `com.tdh.bdzz.dto.sfjd.ZxjgDTO`：
    `dzzz-app/src/main/java/com/tdh/bdzz/dto/sfjd/ZxjgDTO.java`
  - `com.tdh.bdzz.config.websocket.server.fyb.FybWsServer`：
    `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/fyb/FybWsServer.java`

三类风险只能用于设计易错点和验证方式。冻结矩阵中的超大 Controller/Service、静态服务定位、模型
依赖 Web/日志/持久化注解等信号均未在本批重新打开源码确认，因此研究稿不宣称某个具体文件当前仍有
缺陷，不复制旧实现，也不为这些代表符号自行分配 `adapted` 或 `corrected` 状态。

## 现代主线结论

### 分层先划职责和依赖，再决定包名与注解

“分层”不是把类分别放进 `controller`、`service`、`repository` 包就完成了。每层需要同时回答：它
接收什么数据、负责什么决定、可以依赖谁、返回什么、失败由谁解释。Spring stereotype 能标出角色并让
容器扫描，但 annotation 不会阻止 Controller 直接调用 Mapper，也不会阻止领域对象依赖 HTTP 类型。
[来源：`spring-component-stereotypes`、`archunit-layer-checks`]

本课采用一条适合零基础的请求路径：

```text
HTTP -> Controller -> 输入 DTO -> Service/use case -> Repository port
                                              ^             |
                                              |             v
输出 DTO <- Controller <- application result  |   persistence adapter -> MyBatis Mapper -> DB
```

方向表达的是源码依赖和调用职责，不表示返回值不能沿相反方向返回。外层 adapter 可以依赖内层用例
合同；内层不依赖 `ResponseEntity`、`HttpServletRequest`、MyBatis annotation 或数据库列名。启动配置
负责把实现接到接口上。

### Controller 只适配传输合同

Controller 的输入是 HTTP method、URI、header、path/query 参数和 body，输出是 status、header 与
response body。它负责：

1. 让 Spring MVC 解析并绑定输入 DTO。
2. 触发 DTO 的语法/形状校验并把失败留在 Web 错误边界。
3. 把输入 DTO 映射为应用层命令，调用一个明确的 Service 用例。
4. 把应用结果映射为输出 DTO，选择合适的 HTTP 状态与响应头。

Controller 不应直接写 SQL、开启多个业务步骤、决定领域状态迁移或直接返回持久化对象。若 handler
必须知道事务传播、数据库列名或 MyBatis statement id，说明传输层已经越过业务和数据访问边界。
[来源：`spring-controller-api`、`spring-mvc-request-body`、`spring-mvc-validation`]

### 输入 DTO 是客户端可写字段的 allowlist

输入 DTO 只声明本次操作允许客户端提交的字段。创建任务的请求可含 `title`、`assigneeId`，但服务端
生成的 `id`、`createdAt`、审批状态、权限角色不能因为内部对象上存在 setter 就自动进入请求合同。
专用 DTO 同时减少 mass assignment 风险，也让“创建”和“修改”拥有不同字段与校验规则。

Java 25 可用 record 表达紧凑数据载体：

```java
public record CreateTaskRequest(String title, long assigneeId) {}
```

record 是浅层数据载体，不是自动安全边界。若 component 是可变 `List`，仍需在构造边界复制；若字段
本来不应由客户端控制，就应从 record header 删除，而不是只依赖反序列化 blocklist。
[来源：`jls25-records`、`jep395-records`、`owasp-mass-assignment`]

### 输出 DTO 是客户端可读字段的 allowlist

输出 DTO 应逐项选择调用者可以看到的字段。内部备注、风控标记、密码散列、数据库审计列即使存在于
领域或持久化对象，也不能通过“序列化整个对象”顺带返回。输入与输出字段集合不同，所以不要为了少写
一个类而复用同一个双向 DTO。

```java
public record TaskResponse(long id, String title, String status) {}
```

字段级授权仍需根据当前调用者和资源执行；“放进 DTO”不等于所有调用者都有权看到。需要不同视图时，
使用不同输出 DTO 或在明确策略后选择字段，不在通用 `toString()`/自动复制中决定权限。
[来源：`owasp-api-property-authorization`]

### Service 表达一个业务用例并完成编排

Service 方法名应表达调用者要完成的用例，例如 `createTask`、`publishTask`，而不是只把 Mapper 的
`insert/select/update` 改名转发。Service 负责：

1. 接收与 Web 无关的 command 或简单领域值。
2. 检查必须结合当前状态、权限或已有数据才能判断的业务规则。
3. 按顺序调用领域行为、Repository port 和其他明确协作者。
4. 在一个工作单元需要共同成功或失败时声明事务边界。
5. 返回应用结果或领域结果，让外层再映射 HTTP。

Service 不接收 `HttpServletRequest`、不返回 `ResponseEntity`，也不直接拼 SQL。上传文件等传输对象应在
Web adapter 转成应用层可理解的输入或 port；否则同一用例无法从命令行、消息消费或测试调用。
[来源：`spring-service-api`、`spring-dependency-injection`、`spring-data-transactionality`]

### Repository 是内层需要的存储合同

Repository port 用领域语言表达存储需求，例如 `findById`、`existsByName`、`save`。调用者只知道它能
保存/取得哪种业务对象，不知道表名、SQL、MyBatis session 或结果列。Spring 的 `@Repository` 也可以
用于 DAO，因此“带了这个注解”不自动证明类型已经是领域 repository。

本课约定：若同时存在 Repository 与 MyBatis Mapper，Repository 是 application/domain-facing port，
persistence adapter 实现它并在内部调用 Mapper。小型系统也可以让一个数据访问接口同时承担两种角色，
但必须明确暴露的类型和依赖；不为了形式额外套一层只做一行转发的 wrapper。
[来源：`spring-repository-api`]

### MyBatis Mapper 是 SQL statement 与 Java 方法的适配边界

MyBatis Mapper interface 的方法签名需要唯一对应 mapped statement，参数和返回类型必须与 SQL 和
映射结果匹配。`resultMap` 负责数据库列、构造参数、属性及关联的映射。它属于 persistence adapter，
不应被 Controller 直接依赖，也不应承担 HTTP 状态、权限响应或跨多个业务步骤的编排。

“MyBatis Mapper”和“DTO mapper”只是中文都叫映射器，职责不同：
[来源：`mybatis-java-api`、`mybatis-mapper-xml`]

| 名称 | 输入 | 输出 | 所在边界 |
| --- | --- | --- | --- |
| MyBatis Mapper | 方法参数 / SQL 参数 | row、PO 或 projection | 数据库与 Java |
| DTO mapper / assembler | request、command、domain result | 另一种 Java 边界模型 | Web、application、domain 之间 |

课程必须先明确是哪一种 Mapper，再展示代码，避免学习者把 SQL 映射和对象转换塞进同一个工具类。

### 领域模型、持久化模型与 DTO 的变化原因不同

- 领域模型表达业务身份、状态和规则；它因业务规则变化。
- 持久化模型表达表、列、关联和存储生命周期；它因 schema 或 ORM/SQL 映射变化。
- 输入/输出 DTO 表达对外合同和属性授权；它因 API 版本、客户端需要和安全策略变化。

三者可以暂时拥有相同字段，但不能因此认为是同一种合同。简单 CRUD 中共用实体不一定立刻错误；当
外部字段、业务规则或数据库映射开始独立演进时必须分离。课程主线用独立类型建立清楚边界，不声称
“任何实体永远不能包含业务方法”，也不把 JPA/MyBatis 的实现选择写成 Java 规则。
[来源：`jakarta-persistence-3-2`、`owasp-mass-assignment`、`owasp-api-property-authorization`]

### 映射代码必须显式处理丢失、默认和敏感字段

最小课程示例优先手写小型纯函数，让字段流向可见：

```java
public final class TaskWebMapper {
    /** 把外部创建请求转换为与 HTTP 无关的应用命令。 */
    public CreateTaskCommand toCommand(CreateTaskRequest request) {
        return new CreateTaskCommand(request.title(), request.assigneeId());
    }

    /** 只选择允许客户端读取的字段生成响应。 */
    public TaskResponse toResponse(CreateTaskResult result) {
        return new TaskResponse(result.id(), result.title(), result.status());
    }
}
```

映射时逐项决定：null 是否允许、空白是否归一化、未知枚举如何失败、时间和金额使用什么类型、集合是否
复制、哪些内部字段必须丢弃。反射式 `copyProperties` 或双向万能 mapper 可能在模型增加字段后静默扩大
输入/输出合同；没有字段级测试时不能作为零基础默认写法。
[来源：`owasp-mass-assignment`、`owasp-api-property-authorization`]

### 依赖方向必须能被自动检查

课程使用以下 house rule，不把它宣称为 Spring 强制规则：

| 区域 | 可以依赖 | 禁止直接依赖 |
| --- | --- | --- |
| `domain` | Java 标准库、领域自身 | Spring MVC、MyBatis、数据库 row、Web DTO |
| `application` | domain、Repository port | Controller、HTTP 类型、MyBatis Mapper |
| `web` | application 公共合同、Web DTO | MyBatis Mapper、数据库 row |
| `persistence` | application port、domain、MyBatis/JDBC | Controller、Web DTO |
| `bootstrap` | 所有实现的组装入口 | 不承载业务规则 |

ArchUnit 可以把包定义为层，声明“谁可访问谁”并检查循环。规则名称不是价值本身；真正目标是让内层
用例可脱离 HTTP 与数据库 adapter 验证，并让替换外部技术时变化停留在边界。
[来源：`archunit-layer-checks`]

### 校验按保证的种类放置，而不是全部堆在 Controller

输入经过的校验顺序应可观察：

1. 消息转换先确认 body 能否解析为 DTO。
2. DTO 约束检查必填、长度、格式、集合数量等语法/形状规则。
3. Service/domain 检查状态迁移、时间先后、额度、资源存在性和调用者权限等业务语义。
4. 数据库约束最终维护唯一、非空、外键等并发下仍必须成立的存储不变量。

Bean Validation annotation 只是元数据，必须由 Spring MVC、方法校验代理或显式 `Validator` 触发。
现代线使用 `jakarta.validation.*`；Spring 5.2/Boot 2.3 legacy 使用 `javax.validation.*`。同一规则若在
不同层重复，必须说明各层提供的不同保证；例如 Service 预先给出可读“名称已存在”，数据库 unique
constraint 仍处理并发竞争，二者不是无意义复制。
[来源：`spring-mvc-validation`、`jakarta-validation-3-1`、`owasp-input-validation`]

### 事务边界围住一个需要原子性的工作单元

当 `createTask` 需要同时写任务与审计记录，Service facade 是自然的事务入口：它知道两个动作属于
同一用例，而 Controller 不应让数据库事务覆盖 HTTP 解析和响应渲染，单个 Mapper 也看不到完整工作单元。
Spring Data 官方同样建议在 unit of work 开始处声明边界。

`@Transactional` 不等于“看到注解就一定回滚”。现代 Spring 默认 `REQUIRED`、底层默认隔离、读写，
且默认只对 `RuntimeException`/`Error` 回滚。proxy 模式下同类 self-invocation 不经过代理，因此被调
方法上的 annotation 不会新产生预期事务。课程必须通过“成功写两条、失败写零条”观察数据库状态，
不能只检查 annotation 是否存在。
[来源：`spring-data-transactionality`、`spring-transactional`、`spring-transaction-rollback`]

## 易错点与修正合同

| 现象 | 触发条件与原因 | 后果 | 正确边界 | 最小验证 |
| --- | --- | --- | --- | --- |
| Controller 直接调用 Mapper | 为少写 Service 把 SQL 入口注入 Web 层 | HTTP 与 schema/SQL 耦合，业务事务被拆散 | Controller 只调一个 use-case Service；Mapper 留在 persistence adapter | ArchUnit 禁止 `..web..` 依赖 `..persistence.mapper..` |
| 请求直接绑定 entity/PO | 自动绑定会写入对象所有可写属性 | mass assignment 修改权限、状态或审计字段 | 创建/修改各自使用 allowlist 输入 DTO | 发送额外 `admin/status` 字段，确认合同拒绝或忽略且内部值不变 |
| 响应直接序列化 entity/PO | 通用序列化器看到新增 getter/字段 | 内部备注或敏感属性意外泄漏 | 输出 DTO 逐项选择字段 | 对响应字段集合做精确断言 |
| Service 接收 `HttpServletRequest` 或返回 `ResponseEntity` | 用例把 transport 类型当业务数据 | 非 HTTP 调用和隔离测试困难 | Web 层先转换，Service 使用 command/result | 纯 Java 调用 Service，不启动 MVC |
| 一个 DTO 同时做输入、输出、领域和持久化 | 只按字段相似性复用类型 | 任一层变化扩散到所有边界 | 按变化原因拆分，映射显式 | 分别修改一个外部字段和一个数据库字段，编译影响只停留在对应 adapter |
| 一个万能 Mapper 反射复制所有字段 | 依赖同名字段和隐式默认值 | 新字段静默穿透、null/枚举语义丢失 | 小映射显式赋值；复杂工具也要字段级合同测试 | 新增内部字段后确认输出字段集不变 |
| Service 方法只转发 Mapper CRUD | 方法名和返回值仍是数据库语言 | 业务规则、授权、事务入口无处安放 | Service 按用例命名并编排必要协作者 | 用例测试只替换 Repository port 即可运行 |
| `@Transactional` self-invocation | 同类方法直接调用另一个带 annotation 的方法 | proxy 未拦截，事务语义与阅读预期不同 | 从代理外部进入 public use-case 方法，或重新设计边界 | 故障注入后查询数据库确认实际回滚 |
| catch 后吞掉运行时异常 | 异常未越过事务 interceptor | 方法正常返回，默认事务可能提交部分状态 | 转换后继续抛出，或按明确规则标记 rollback | 第二次写入抛异常，断言第一次写入也不存在 |
| 超大 Controller/Service 仅按行数机械拆分 | 把每 500 行当硬规则 | 产生许多仍互相调用、职责不清的小类 | 按用例、变化原因、事务和依赖集合拆分 | 类依赖数、用例测试范围和跨层访问均下降，且无新循环 |
| Repository 与 MyBatis Mapper 名称混用 | 未声明接口面向谁 | Controller 可能绕过业务层，domain 暴露 SQL 类型 | 文档和包名明确 port 与 adapter；简单系统合并时写清合同 | 依赖规则和方法签名审查 |

超大类的 LOC 只能作为需要复核的信号，不是普适缺陷阈值。拆分应减少职责和依赖，而不是把一个长方法
原样搬进多个互相调用的类。

## Java 8 / Spring Boot 2.3 legacy 补充

1. Java 8 没有 record。legacy DTO 使用普通 final class、private final fields、构造器和 getter；
   `equals/hashCode/toString` 是否需要由合同决定，不能把 Lombok 或可变 JavaBean 当唯一方案。
2. Spring Boot 2.3.12.RELEASE 官方只声明 Java 8 至 15 兼容。现代 Java 25 fixture 不能代替旧运行时
   验证；课程的 Java 8 源码可先用 `javac --release 8` 做 API/字节码准入，再在可用的真实 JDK 8
   环境运行，二者证据分开报告。
3. Spring 5.2.15 的 stereotype 基本角色与现代线一致；MVC 校验 annotation 包名是
   `javax.validation.*`，不是现代 `jakarta.validation.*`。复制现代 import 到旧项目会编译失败。
4. Spring 5.2.15 默认 proxy transaction 同样只拦截外部调用；self-invocation 不生效。旧版本常见
   “类上有 annotation”仍不能替代提交/回滚反馈环。
5. legacy 课程示例只纠正同类风险，不读取或复制 `dzzz-app` Controller、Service、DTO、PO、EO、VO
   或 Mapper 的业务字段、静态定位器、日志和内部数据。

[来源：`spring-boot-2-3-system-requirements`、`spring-5-controller-api`、
`spring-5-service-api`、`spring-5-repository-api`、`spring-5-request-body`、
`spring-5-transactions`、`bean-validation-2-0`]

## 零基础课程拆分

正式课程至少按以下顺序建立独立三级知识点，不允许把多个编号挤在同一段：

1. 一次请求为何需要边界：先画出输入、业务决定、存储和输出。
2. Controller 是什么、接收什么、返回什么、为什么不写业务和 SQL。
3. 输入 DTO 是什么、如何只声明客户端可写字段。
4. 输出 DTO 是什么、如何只声明客户端可读字段。
5. Java 25 record 如何作为浅层数据载体，为什么它不自动深度不可变。
6. Java 8 DTO 如何用 final class、构造器和 getter 表达同一合同。
7. Service/use case 如何命名、校验、编排并返回应用结果。
8. Repository port 如何用领域语言隐藏存储技术。
9. MyBatis Mapper interface、mapped statement 与 `resultMap` 各做什么。
10. MyBatis Mapper 与 DTO mapper 为什么同名但不是同一职责。
11. 领域模型、持久化模型、输入 DTO、输出 DTO 为什么要按变化原因隔离。
12. 手写显式映射如何处理 null、默认值、枚举、集合和敏感字段。
13. `domain/application/web/persistence/bootstrap` 的依赖方向如何读取和检查。
14. 解析、语法校验、业务语义、授权与数据库约束分别放在哪里。
15. Service 事务边界、默认回滚、checked exception 与 self-invocation。
16. Controller/Service/Mapper 过大和跨层泄漏如何识别、拆分与验证。
17. 用可执行最小反馈环证明字段隔离、依赖方向、提交和回滚。

每个小点在课程正文中必须独立回答“它是什么、有什么作用、什么时候使用、怎么使用、最小示例、
运行结果、常见误区”。涉及多个动作时使用真实 Markdown 有序列表，每个序号独立一行。

## 可执行最小反馈环设计

研究阶段不执行 fixture；实施阶段在 `mktemp -d /tmp/java-layers-course.XXXXXX` 中创建最小工程，成功
后删除临时目录并检查不存在，不向仓库保留测试、数据库或浏览器输出。

### 现代 Java 25 / Spring Boot 4.1.0 反馈环

临时 Maven 工程使用 Spring Boot 4.1.0 dependency management、validation、JDBC、H2、JUnit 5 和
ArchUnit 1.4.2。业务只使用中性“任务创建”数据，不含项目字段。最小文件职责为：

- `web/CreateTaskRequest`、`web/TaskResponse`：输入/输出 record。
- `web/TaskController`、`web/TaskWebMapper`：传输适配和显式字段选择。
- `application/CreateTaskCommand`、`application/CreateTaskResult`、
  `application/TaskService`：用例与事务入口。
- `domain/Task`、`application/TaskRepository`：领域状态和存储 port。
- `persistence/TaskRow`、`persistence/JdbcTaskRepository`：数据库 adapter；不提前引入项目 Mapper。
- `bootstrap`：只负责装配。

最少验证四组关键行为：

1. 空白名称在输入 DTO 校验阶段失败，且 Repository 未被调用。
2. 请求无法设置 `id/status/internalNote`，响应也不出现 `internalNote`。
3. 成功用例同时写入 task 与 audit 两行；第二次写入抛 `RuntimeException` 时两行都回滚。
4. ArchUnit 断言 Web 不依赖 persistence、application 不依赖 Web/MyBatis，并且分层无循环。

预期证据使用稳定文本，不依赖日志顺序：

```text
validation|violations=1|repositoryCalls=0
mapping|clientWritable=id:false,status:false|internalNoteExposed=false
transaction|commitTasks=1|commitAudits=1|rollbackTasks=0|rollbackAudits=0
architecture|violations=0|cycles=0
```

`mvn -q test` 只证明该临时依赖集和测试合同。还需记录 `java -version`、Maven effective dependency、
测试退出码和 fixture SHA；不能把一次 H2 成功外推为真实数据库或项目事务已验证。

### Java 8 source 反馈环

另建独立临时目录，把 record 改为 Java 8 final DTO，使用 `javax.validation` legacy import，并用
`javac --release 8` 验证源码没有 Java 9+ API。若本机存在真实 JDK 8，再运行同一纯 Java 映射与用例
测试；若不存在，结果必须写成“release 8 编译通过、JDK 8 runtime deferred”，不能伪称双运行时通过。

### 负例只验证一个原因

- `web` import MyBatis Mapper：架构检查应失败并点名依赖。
- 输入 DTO 增加 `admin`：DTO 字段合同检查应失败。
- Service 捕获 `RuntimeException` 后正常返回：数据库状态应暴露意外提交。
- 同类 self-invocation 调用带 `@Transactional` 的内部方法：数据库结果应证明 annotation 未按预期生效。

负例修复后必须复跑同一反馈环；不得通过删除断言、扩大允许依赖或只检查 console 没报错来关闭 Gate。

## 不确定点与后续准入条件

1. 冻结矩阵只提供代表路径、符号、数量和 evidence policy；本批禁止读取 `dzzz-app`，因此不新增文件
   SHA、不判断代表类当前方法内容，也不把审计风险升级为已复现 defect。
2. `JAVA-ENGINEERING-002` 的 1401 个文件只说明模型边界是高优先级，不证明 DTO/PO/EO/VO 命名在
   每个位置具有统一语义。课程按职责定义类型，不按后缀猜合同。
3. MyBatis 3.5.19 是当前公开文档版本，不是冻结项目版本证据。本课不运行 Mapper、不声明项目采用
   annotation 还是 XML；最小 MyBatis 持久化闭环留给 I-12，XML、动态 SQL 与 MyBatis-Plus 深入移交
   数据库专项。
4. 本课只解释事务边界的架构位置和最小代理语义；真实 MySQL 提交与回滚留给 I-12，幂等请求已由
   I-09 建立，传播组合、隔离和分布式事务不在 I-11 展开。
5. 不以包名、annotation 数量、LOC 或 mock 数量衡量“分层成功”；必须以依赖规则、可替换 adapter、
   字段合同和提交/回滚结果共同验证。

## 研究 Gate 自检

- [x] 冻结课程 ID、Phase C I-11、唯一前置 I-10、后继 I-12、五个能力项、基线和快照已核对。
- [x] `projectEvidence` 的五组 sourceId、policy、数量和代表符号来自当前冻结矩阵，未读取项目源码。
- [x] 29 个唯一 URL 最终 GET 均为 HTTP 200；Java 25 / Spring Boot 4.1.0 / Framework 7.0.8 与
  Java 8 / Boot 2.3.12 / Framework 5.2.15 分开。
- [x] Controller、Service、Repository、Mapper 的框架合同绑定 Spring/MyBatis 直接页面。
- [x] 输入/输出 DTO、领域/持久化模型、映射、依赖方向和校验位置均写明适用条件，不伪装成语法。
- [x] Service 事务边界覆盖默认 rollback 与 self-invocation 的可观察验证。
- [x] 超大类与跨层泄漏覆盖触发条件、原因、后果、修正和最小验证，不把 LOC 当硬阈值。
- [x] 零基础拆分共 17 点，后续每点必须使用七项结构和独立编号行。
- [x] `/tmp` 反馈环包含字段隔离、校验、架构、提交/回滚与 Java 8 source 边界。
- [x] 未修改课程、manifest、track、计划、signoff 或冻结矩阵，未暂存、提交或推送。

## Stop Boundary

本研究稿只完成 Phase C I-11 `layers-dto-and-service-boundaries` 的官方研究。不得把研究完成写成课程
正文、运行时 `available`、fixture 已通过、浏览器已验收或 signoff 已关闭。父任务只有在完成课程、
manifest 登记、`/tmp` 双版本反馈环、工程 Gate、桌面/390px 浏览器证据、独立 signoff 与 Standards/
Spec 双轴 `PASS / 0 finding` 后，才可关闭 I-11 并领取 I-12；不得提前进入后续课程。
