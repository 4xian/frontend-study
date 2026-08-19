# Phase C I-07：Spring Boot 启动、自动配置与配置建模研究

> 课程 ID：`backend.java.learn.intermediate.spring-boot-and-configuration`<br>
> Phase C 顺序：I-07<br>
> 预计学习时长：150 分钟<br>
> 研究日期：2026-08-15<br>
> 冻结快照：`dzzz-app-20260803-179e722831ab`<br>
> 边界：只核验 I-07、Phase A 冻结路线和既有 Phase 2 证据，不重新读取或运行 `dzzz-app`，
> 不研究 I-08

## 冻结课程合同

- 标题：Spring Boot 启动、自动配置与配置建模。
- 阶段：`intermediate`，深度：`lesson`。
- 性质：必修、重排、复用；稳定 ID 与既有 URL 不变。
- 预计学习时长：150 分钟。
- 唯一前置课程：
  `backend.java.learn.intermediate.dependency-injection-and-bean-lifecycle`（Phase C I-06）。
- 来源能力：
  1. `JAVA-FRAMEWORK-001`：Spring Boot 启动、自动配置与外部化配置。
  2. `JAVA-ENGINEERING-021`：配置读取、建模与派生配置。
  3. `JAVA-RISK-006`：未生效、冗余或伪关闭配置，只作纠错证据。
  4. `JAVA-RISK-045`：配置、注释、setter 与结果状态背离，只作纠错证据。
- 选择原因：项目启动、Bean 和配置事实都依赖 Boot；未生效配置和状态背离仅作为纠错边界。
- Phase 2 的 `researchStatus: not-started`、`exampleStatus: not-started`、`courseStatus: planned`
  是历史冻结状态，不覆盖 Phase C 当前事实。
- 研究开始时 live 正文仍记录 260 分钟、三个旧前置与 `verifiedAt: 2026-08-09`；这些只是本批实施前
  的历史状态，后续正文、track 与 signoff 必须原子同步到本节冻结合同。

## 精确版本基线

### 现代主线

- Java 25 LTS。
- Spring Boot 4.1.0。
- Spring Framework 7.0.8 或以上；课程 fixture 固定 7.0.8。
- Spring Boot 4.1.0 要求 Java 17 至 26，Maven 3.6.3 或以上，因此 Java 25 与 Maven 3.9.12
  均位于官方支持范围。
- 配置校验使用 `jakarta.validation`。

### `dzzz-app` 兼容线

- Java 8。
- Spring Boot 2.3.12.RELEASE。
- Spring Framework 5.2.15.RELEASE。
- WAR 打包与启动类 `com.tdh.DzzzAreaApplication` 只用于解释旧项目边界。
- 配置校验使用 `javax.validation`；Java 8 没有 record。
- Boot 2.3 尚未采用 Boot 2.4 引入的 Config Data 新模型，不能照搬
  `spring.config.import` 或 `spring.config.activate.on-profile`。

## 已核验的官方直接来源

1. `spring-boot-4-system-requirements`：
   <https://docs.spring.io/spring-boot/4.1/system-requirements.html>，支持 Java、Spring Framework 与
   构建工具版本结论。
2. `spring-boot-4-application`：
   <https://docs.spring.io/spring-boot/reference/features/spring-application.html>，支持
   `SpringApplication`、启动参数、runner 与启动跟踪结论。
3. `spring-boot-4-auto-configuration`：
   <https://docs.spring.io/spring-boot/reference/using/auto-configuration.html>，支持自动配置、回退、排除和
   `--debug` 条件报告结论。
4. `spring-boot-4-external-config`：
   <https://docs.spring.io/spring-boot/reference/features/external-config.html>，支持配置来源、覆盖顺序、
   环境变量、Config Data、`@Value` 与 `@ConfigurationProperties` 结论。
5. `spring-boot-4-profiles`：
   <https://docs.spring.io/spring-boot/reference/features/profiles.html>，支持 profile 激活、覆盖规则与
   `@Profile` 结论。
6. `spring-boot-4-configuration-properties-api`：
   <https://docs.spring.io/spring-boot/4.1/api/java/org/springframework/boot/context/properties/ConfigurationProperties.html>，
   支持 prefix、绑定、忽略字段与注册合同。
7. `spring-boot-4-conditional-property-api`：
   <https://docs.spring.io/spring-boot/4.1/api/java/org/springframework/boot/autoconfigure/condition/ConditionalOnProperty.html>，
   支持属性条件的 prefix、name、havingValue 与 matchIfMissing 合同。
8. `spring-boot-4-context-runner-api`：
   <https://docs.spring.io/spring-boot/4.1/api/java/org/springframework/boot/test/context/runner/ApplicationContextRunner.html>，
   支持只启动小型上下文的自动配置反馈环。
9. `spring-boot-4-actuator-conditions`：
   <https://docs.spring.io/spring-boot/api/rest/actuator/conditions.html>，支持条件评估报告端点的响应合同。
10. `spring-boot-4-actuator-configprops`：
    <https://docs.spring.io/spring-boot/api/rest/actuator/configprops.html>，支持配置属性端点与输入来源信息。
11. `spring-boot-4-actuator-security`：
    <https://docs.spring.io/spring-boot/reference/actuator/endpoints.html#actuator.endpoints.security>，支持诊断端点
    暴露与访问控制边界。
12. `spring-boot-2-system-requirements`：
    <https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements>，
    支持 Java 8 与 Spring Framework 5.2.15 基线。
13. `spring-boot-2-auto-configuration`：
    <https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/using-spring-boot.html#using-boot-auto-configuration>，
    支持旧线自动配置与条件报告。
14. `spring-boot-2-external-config`：
    <https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/spring-boot-features.html#boot-features-external-config>，
    支持旧线 PropertySource 顺序、profile、类型安全配置与校验。
15. `spring-boot-2-constructor-binding`：
    <https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/api/org/springframework/boot/context/properties/ConstructorBinding.html>，
    支持 Boot 2.3 构造器绑定的显式注解合同。

Tavily 只用于发现并抽取上述页面；最终结论只绑定 15 个 Spring 官方直接页面。2026-08-15 复核时，
原 `spring-boot-application` 路径已返回 404，已替换为上面的官方 `features/spring-application.html`；
替换后的 15 个唯一 URL 经 `curl -L --fail` 直接核验均返回 HTTP 200。未使用博客、搜索摘要或社区
问答作为证据。

## 冻结项目证据边界

冻结矩阵记录四个来源能力，数量分别为 214、5、8、5。课程 frontmatter 只选择少量代表符号说明场景：

| 来源能力 | 冻结代表符号 | 课程用途 |
| --- | --- | --- |
| `JAVA-FRAMEWORK-001` | `com.tdh.DzzzAreaApplication` | 说明旧项目存在 Boot 启动入口，不复制实现。 |
| `JAVA-FRAMEWORK-001` | `com.tdh.bdzz.config.SysConfig` | 说明存在集中配置场景，现代示例改为类型安全配置。 |
| `JAVA-ENGINEERING-021` | `com.tdh.bdzz.config.AmazonConfig` | 说明配置读取与派生配置场景，示例使用中性名称。 |
| `JAVA-RISK-006` | `com.tdh.bdzz.config.websocket.WebSocketConfig` | 只设计“配置看似关闭但 Bean 仍创建”的负例。 |
| `JAVA-RISK-045` | `com.tdh.bdzz.upload.LocalUploader` | 只设计“输入值与最终状态背离”的负例。 |

风险证据不能证明这些文件当前仍有缺陷。正式课程只声明“冻结审计观察到相应风险类别”，不打开源码复核、
不复制业务代码、不写真实连接、路径、主机、密钥或内部数据。

## 现代主线结论

### 启动与组合注解

`SpringApplication.run` 负责准备 Environment、选择并刷新 ApplicationContext、发布启动事件并返回可用
上下文。`@SpringBootApplication` 组合配置类、组件扫描和自动配置。主类所在包通常是默认扫描根，因此主类
放得过深会漏掉相邻包，放到无边界的顶层包又会扩大扫描范围。

### 自动配置不是无条件配置

自动配置根据 classpath、已有 Bean、配置属性和应用类型等条件决定是否生效。用户显式提供同类型 Bean 时，
使用 `@ConditionalOnMissingBean` 的默认配置会回退。判断“为什么有或没有某个 Bean”应查看条件评估报告，
不能只看依赖是否存在，也不能靠删除随机 starter 试错。

### 外部化配置与覆盖顺序

同一套代码可以从 properties/YAML、环境变量、系统属性、命令行参数和测试属性读取不同环境值。Boot 明确
规定 PropertySource 顺序，后出现的高优先级来源可以覆盖先前值。命令行参数可以覆盖配置文件；profile 专用
文件可以覆盖非 profile 文件。课程必须让学习者输出最终绑定值和来源，而不是只看某个文件文本。

环境变量采用 relaxed binding：点转下划线、删除短横线并大写。例如 `course.max-size` 可映射到
`COURSE_MAXSIZE`。列表索引使用下划线包围。部署说明必须写清变量名，不能假定 shell 名称与属性名完全相同。

### 类型安全配置与校验

一组属于同一业务概念的配置使用 `@ConfigurationProperties` 聚合，prefix 划定命名空间。Java 25 主线可以
使用 record 绑定不可变值；嵌套配置也用嵌套 record。`@Validated` 与 `jakarta.validation` 约束让非法配置
在上下文启动时失败，避免服务运行到第一次请求才暴露错误。

`@Value` 适合少量独立值，但缺少完整的结构化元数据和 relaxed binding 能力。配置属性类适合多字段、嵌套、
校验和复用。二者都不能自动判断密钥是否安全，也不能代替外部 secret 管理。

### Profile 与配置数据

profile 用于选择环境相关 Bean 或配置片段，不应成为业务功能开关的唯一模型。`spring.profiles.active` 仍遵循
PropertySource 覆盖规则。现代 Config Data 可以导入额外配置并使用 `optional:` 明确缺失是否允许；生产环境
不能为了“能启动”而把所有关键配置都标成 optional。

### 诊断与最小测试

`--debug` 可输出条件评估报告；Actuator 的 `conditions` 和 `configprops` 可提供结构化诊断，但它们可能暴露
内部结构或配置值，必须按官方端点暴露与安全规则限制访问。课程验证优先使用 `ApplicationContextRunner` 只
启动相关配置：分别证明条件命中、条件不命中、用户 Bean 回退、合法绑定和非法配置启动失败。

## Java 8 / Spring Boot 2.3.12 差异

1. Java 8 不支持 record，配置对象使用普通 final class 加构造器，或 JavaBean getter/setter。
2. Boot 2.3 的构造器绑定需要旧版 `@ConstructorBinding` 合同；现代 Boot 不应照搬类型级旧注解。
3. Boot 2.3 校验注解来自 `javax.validation`，现代 Boot 4 使用 `jakarta.validation`。
4. Boot 2.3 使用旧外部配置模型；`spring.config.import` 和 `spring.config.activate.on-profile` 不能复制进去。
5. 旧 profile 文档使用当时归档参考页的语法，迁移时先核对多文档激活键与位置覆盖语义。
6. 自动配置“按条件生效并在用户配置存在时回退”的心智模型在两条线都成立，但实现类名与条件集合不是
   跨版本稳定 API。
7. 旧项目的 WAR 启动补充只解释部署入口；课程现代主线仍使用可执行 jar 的最小应用。

## 零基础课程拆分

正式课程按以下 22 个独立小知识点展开，每点都回答“是什么、作用、场景、步骤、示例、结果、误区”：

1. Spring、Spring Framework 与 Spring Boot 分别负责什么。
2. starter、依赖管理与自动配置之间是什么关系。
3. `main` 方法和 `SpringApplication.run` 的启动顺序。
4. ApplicationContext、Environment 与 Bean 的最小关系。
5. `@SpringBootApplication` 组合了哪些能力。
6. 主类包位置如何决定默认组件扫描根。
7. 自动配置如何读取 classpath、Bean、属性和应用类型条件。
8. 用户 Bean 为什么能让默认自动配置回退。
9. `@ConditionalOnProperty` 四个关键参数如何判断开关。
10. `--debug` 与 ConditionEvaluationReport 如何解释匹配结果。
11. 外部化配置解决什么问题，哪些来源可以提供值。
12. PropertySource 优先级如何决定最终值。
13. properties、YAML、环境变量与命令行如何表达同一属性。
14. relaxed binding 如何把外部名称映射到 Java 属性。
15. `@Value`、Environment 与 `@ConfigurationProperties` 如何选择。
16. prefix、嵌套对象、集合和 map 如何组成配置模型。
17. Java 25 record 如何表达不可变配置。
18. `@Validated` 如何让非法配置在启动阶段失败。
19. profile 如何选择配置片段或 Bean，何时不应用它做功能开关。
20. Config Data import、额外位置与 optional 的失败边界。
21. Actuator conditions/configprops 如何诊断且为什么要限制暴露。
22. ApplicationContextRunner 如何建立快速、可观察的配置反馈环。

## 可执行反馈环设计

### 现代 fixture

在 `mktemp -d /tmp/java-spring-boot-course.XXXXXX` 中建立 Spring Boot 4.1.0、Java 25、Maven 3.9.12
工程，固定 starter、validation、actuator 与 test 依赖。至少验证：

1. 合法 `course.name`、`course.max-size` 与嵌套属性绑定到 record。
2. 命令行或测试属性覆盖默认配置，并输出最终值。
3. `@ConditionalOnProperty` 在 enabled=true 时创建 Bean，在 false 或缺失时不创建。
4. 用户提供同类型 Bean 时默认 Bean 回退。
5. 空名称或非正容量使 ApplicationContext 启动失败，失败链包含绑定/校验原因。
6. 条件报告同时存在 positive 与 negative match，不能只断言 Bean 数量。
7. 同一全量测试连续执行两次，计数相同且无系统属性残留。

### legacy fixture

在独立 `mktemp -d /tmp/java-spring-boot-legacy.XXXXXX` 中固定 Boot 2.3.12.RELEASE、Framework
5.2.15.RELEASE、Java 8 与 `javax.validation`。使用普通类和 getter/setter，至少验证合法绑定、非法值启动
失败、条件开关和用户 Bean 回退。必须在真实 Java 8 容器运行；只用 Java 25 `--release 8` 不算旧运行时证据。

### 负例

1. 把主类移到过深包，证明预期组件未扫描；移回共同根包后通过。
2. 同时在配置文件与命令行设置不同值，证明不能用“文件里写了什么”推断最终值。
3. 写错 prefix，证明对象保留默认值或因校验失败，而不是静默认为配置已生效。
4. 设置 enabled=false 却无条件声明 Bean，先观察状态背离，再加条件注解修复。
5. 对关键外部文件滥用 `optional:`，先证明缺失时应用误启动，再恢复 fail-fast。
6. 把现代 record、`jakarta.validation` 或 Config Data 新键复制到 Boot 2.3，编译或启动应失败；改为旧线 API
   后复跑。

## 研究 Gate 自检

- [x] 课程 ID、Phase C I-07 顺序、150 分钟、I-06 唯一前置与四个来源能力已核对。
- [x] 现代线固定 Java 25 / Boot 4.1.0 / Framework 7.0.8。
- [x] legacy 固定 Java 8 / Boot 2.3.12.RELEASE / Framework 5.2.15.RELEASE。
- [x] 15 个关键来源均为 Spring 官方当前或归档直接页面，失效的旧启动页已替换，15/15 返回 HTTP 200。
- [x] 四类项目证据只来自冻结矩阵，未读取项目源码。
- [x] 22 个零基础小点已逐项拆分。
- [x] 双版本 fixture 包含合法、覆盖、条件、回退、校验失败与版本负例。
- [x] 风险只作为纠错边界，没有宣称冻结代表文件当前有确定缺陷。
- [x] 本次只修改 I-07 研究稿，未修改课程、manifest、track、计划、signoff 或 Phase 2 冻结产物。

## Stop Boundary

本研究稿只完成 Phase C I-07 研究。父任务必须继续完成课程正文、双版本 `/tmp` 反馈环、必要的 track
同步、工程 Gate、桌面/390px 页面证据、独立 signoff 与双轴 `PASS / 0 finding`；全部关闭后，才能进入
I-08 `backend.java.learn.intermediate.spring-mvc-and-servlet-boundaries`。在此之前不得读取或修改 I-08
正文、研究稿及其运行时资产。
