# JSON、对象映射与外部数据合同研究稿

## 冻结课程合同

| 项目 | 冻结值 |
| --- | --- |
| 课程 ID | `backend.java.learn.intermediate.json-and-data-contracts` |
| 稳定 slug | `json-and-data-contracts` |
| 稳定 URL | `/backend/java/core/learn/json-and-data-contracts` |
| 标题 | JSON、对象映射与外部数据合同 |
| 阶段 | intermediate |
| 顺序与时长 | I-03；120 分钟 |
| 精确前置 | I-02 `backend.java.learn.intermediate.identifiers-equality-and-pagination` |
| 能力范围 | `JAVA-FRAMEWORK-018`、`JAVA-FRAMEWORK-019` |
| 现代主线 | Java 25 LTS、课程锁定 Jackson 3.2.1、Spring Framework 7.0.8 集成边界 |
| 项目补充 | Java 8、Spring Boot 2.3.12.RELEASE、Jackson 2.12.7/2.12.7.1、`com.alibaba:fastjson` 2.0.7 |
| 项目边界 | `dzzz-app` 只读；不运行、不修改、不把现状当推荐写法 |
| 后继边界 | 本批关闭前不领取 `http-uri-and-request-response-basics` |

本课只建立 JSON 文本、Java DTO、Jackson 映射、Spring 消息转换和旧 Fastjson 迁移之间的基础
合同。JSON Schema、流式超大文档处理、自定义序列化器、复杂多态、JSONB 和数据库 TypeHandler
实现细节不进入本课主线。Spring 消息转换器只用于标明对象映射的集成点；HTTP 方法、URI、状态码、
媒体协商、请求响应语义和 URL 编码均留给 I-04，不在 I-03 展开。

## 核验基线

- 核验日期：2026-08-15。
- 现代 Java：课程继续使用 Java 25 LTS。Oracle 支持路线将 25 标为 LTS；OpenJDK 下载页已说明
  JDK 25 被 JDK 26 取代为最新功能版本，因此本稿只把 25 称为课程 LTS 基线，不称为最新 JDK。
- 现代 Jackson：课程锁定 `tools.jackson.core:jackson-databind:3.2.1`，行为结论全部回到
  `jackson-databind-3.2.1` 或 `jackson-core-3.2.1` 精确 tag。Maven Central 在 2026-08-14 已发布
  3.2.2，所以 3.2.1 是本课可复现的固定版本，不是截至核验日的最新版；Jackson 3.x 运行基线为
  JDK 17。
- 现代 Spring：Maven Central 当前 release 为 Spring Framework 7.0.8；精确 `v7.0.8` 文档与源码
  使用 `JacksonJsonHttpMessageConverter` 和 Jackson `JsonMapper`。
- 现代 Fastjson 迁移参考：Fastjson2 2.0.64，官方 release 与 Maven 元数据一致。它只解释从项目
  旧依赖迁移时的边界，不与 Jackson 并列成为第二条零基础主线。
- 项目版本继续沿用冻结审计与既有只读 `pom.xml` 证据：Jackson Databind 2.12.7.1、其余
  Jackson 2.12.7 模块、
  `com.alibaba:fastjson` 2.0.7、Spring Boot 2.3.12.RELEASE、Java 8。

## 官方来源卡与直接证据

| ID | 来源 | 适用版本 | 支持的结论 |
| --- | --- | --- | --- |
| R1 | [RFC 8259](https://www.rfc-editor.org/rfc/rfc8259.html) | JSON | JSON 值语法、对象名唯一性建议、成员顺序互操作性、数字限制与网络 UTF-8 |
| J1 | [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) | 2026-08-15 快照 | Java 25 是 Oracle LTS |
| J2 | [OpenJDK JDK 25 Releases](https://jdk.java.net/25/) | 2026-08-15 快照 | JDK 25 已被 JDK 26 取代为最新功能版本 |
| J3 | [Jackson Databind Maven metadata](https://repo.maven.apache.org/maven2/tools/jackson/core/jackson-databind/maven-metadata.xml) | 2026-08-15 快照 | 3.2.1 仍可获取；当前 release 为 3.2.2 |
| J4 | [Jackson Databind 3.2.1 README](https://github.com/FasterXML/jackson-databind/blob/jackson-databind-3.2.1/README.md) | Jackson 3.2.1 | Maven 坐标、JDK 17 基线、builder、TypeReference、树模型与 mapper 复用 |
| J5 | [Jackson 3.2.1 ObjectMapper source](https://github.com/FasterXML/jackson-databind/blob/jackson-databind-3.2.1/src/main/java/tools/jackson/databind/ObjectMapper.java) | Jackson 3.2.1 | Mapper 由 builder 建立；3.x 实例线程安全；根反序列化器有缓存，应复用 mapper |
| J6 | [Jackson 3.2.1 DeserializationFeature source](https://github.com/FasterXML/jackson-databind/blob/jackson-databind-3.2.1/src/main/java/tools/jackson/databind/DeserializationFeature.java) | Jackson 3.2.1 | 默认忽略未知字段、默认拒绝尾随 token |
| J7 | [Jackson Core 3.2.1 StreamReadConstraints source](https://github.com/FasterXML/jackson-core/blob/jackson-core-3.2.1/src/main/java/tools/jackson/core/StreamReadConstraints.java) | Jackson Core 3.2.1 | 文档长度和 token 数默认无限；可显式限制深度、数字、字段名、字符串等输入规模 |
| J8 | [Jackson 3.2.1 Java Time package](https://github.com/FasterXML/jackson-databind/blob/jackson-databind-3.2.1/src/main/java/tools/jackson/databind/ext/javatime/package-info.java) | Jackson 3.2.1 | Java Time 支持自 3.0 起直接包含在 databind |
| J9 | [Jackson 3.2.1 JDK 8 datatype package](https://github.com/FasterXML/jackson-databind/blob/jackson-databind-3.2.1/src/main/java/tools/jackson/databind/ext/jdk8/package-info.java) | Jackson 3.2.1 | Optional 等 JDK 8 类型直接包含在 databind |
| J10 | [Jackson 3.2.1 DateTimeFeature source](https://github.com/FasterXML/jackson-databind/blob/jackson-databind-3.2.1/src/main/java/tools/jackson/databind/cfg/DateTimeFeature.java) | Jackson 3.2.1 | 上下文时区调整开关在 3.x 的位置与默认值 |
| J11 | [Jackson 3.2.1 InstantDeserializer source](https://github.com/FasterXML/jackson-databind/blob/jackson-databind-3.2.1/src/main/java/tools/jackson/databind/ext/javatime/deser/InstantDeserializer.java) | Jackson 3.2.1 | OffsetDateTime 在启用上下文时区调整时会按上下文 zone 改写 offset |
| J12 | [Jackson 3.2.1 PolymorphicTypeValidator source](https://github.com/FasterXML/jackson-databind/blob/jackson-databind-3.2.1/src/main/java/tools/jackson/databind/jsontype/PolymorphicTypeValidator.java) | Jackson 3.2.1 | 基于类名的多态反序列化需要显式允许/拒绝类型以避免无限类名带来的安全问题 |
| J13 | [Jackson Java 8 modules 2.12.7 README](https://github.com/FasterXML/jackson-modules-java8/blob/jackson-modules-java8-2.12.7/README.md) | Jackson 2.12.7 | 2.x 的 JavaTimeModule 与 Jdk8Module 是独立模块并需注册 |
| J14 | [Jackson Databind 2.12.7.1 DeserializationFeature source](https://github.com/FasterXML/jackson-databind/blob/jackson-databind-2.12.7.1/src/main/java/com/fasterxml/jackson/databind/DeserializationFeature.java) | Jackson Databind 2.12.7.1 | 默认拒绝未知字段、默认允许尾随 token |
| J15 | [Jackson 3.2.1 RecordBasicsTest](https://github.com/FasterXML/jackson-databind/blob/jackson-databind-3.2.1/src/test/java/tools/jackson/databind/records/RecordBasicsTest.java) | Jackson 3.2.1 | 精确版本测试覆盖 record 的基本序列化与反序列化 |
| J16 | [Jackson 3.2.1 JsonNode source](https://github.com/FasterXML/jackson-databind/blob/jackson-databind-3.2.1/src/main/java/tools/jackson/databind/JsonNode.java) | Jackson 3.2.1 | `get` 的缺失值与显式 JSON null 不同，`path` 使用 MissingNode 表达缺失 |
| S1 | [Spring Framework 7.0.8 message converters](https://github.com/spring-projects/spring-framework/blob/v7.0.8/framework-docs/modules/ROOT/pages/web/webmvc/message-converters.adoc) | Spring Framework 7.0.8 | HttpMessageConverter 读写 body；JSON converter 使用 Jackson JsonMapper |
| S2 | [Spring Framework 5.2.15 MappingJackson2HttpMessageConverter source](https://github.com/spring-projects/spring-framework/blob/v5.2.15.RELEASE/spring-web/src/main/java/org/springframework/http/converter/json/MappingJackson2HttpMessageConverter.java) | Spring Framework 5.2.15 | 项目线 converter 使用 Jackson 2 ObjectMapper |
| F1 | [Fastjson2 2.0.64 README](https://github.com/alibaba/fastjson2/blob/2.0.64/README.md) | Fastjson2 2.0.64 | 现行坐标、AutoType 默认关闭、1.x 兼容层不保证 100% 兼容且必须测试 |
| O1 | [OWASP Deserialization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html) | 不可信输入 | Jackson 不使用多态时风险较低；DTO 减少原生对象反序列化风险；不能让输入任意选择类型 |

精确 tag 在核验日解析到以下 commit，防止只写版本名却无法判断来源快照：

| 来源快照 | Commit SHA |
| --- | --- |
| Jackson Databind 3.2.1 | `5d74e874671faef1d786cd6d25abfd02daa4c682` |
| Jackson Core 3.2.1 | `e45faacec08aaf508b30ae3020c81956d4b8beb9` |
| Jackson Databind 2.12.7.1 | `ea6f3d4b05dde564a1a5013dd34467d676072afa` |
| Spring Framework 7.0.8 | `9e8cea3ef8ae02efb7956b071cd7bbef7c22cb82` |
| Spring Framework 5.2.15.RELEASE | `5d46ae91f02313ce755eb3e1c9164ee6b1468da8` |
| Fastjson2 2.0.64 | `39531157edbb115d6a613818581d833268e37607` |

Tavily 只用于定位直接页面；上表结论均回到 RFC、项目维护者仓库、官方源码或 Spring/OWASP
直接页面核验。社区博客、搜索摘要和性能宣传不进入证据链。

## 冻结能力与项目证据

### `JAVA-FRAMEWORK-018`：Jackson 映射与消息转换

冻结矩阵记录 15 个代表文件，包含字段映射和消息转换。课程只选择理解合同所需的最小证据：

| 文件与符号 | 状态 | 课程用途 |
| --- | --- | --- |
| `dzzz-app/src/main/java/com/tdh/bdzz/config/RestConfig.java`，`RestConfig#getMappingJackson2HttpMessageConverter()` | corrected | 说明 Spring 5 使用 MappingJackson2HttpMessageConverter；现代版本先配置统一 JsonMapper，再交给消息转换器 |
| `dzzz-app/src/main/java/com/tdh/bdzz/eo/tsaiassistant/TsjdAnalyzeStatusEO.java`，`TsjdAnalyzeStatusEO` | observed | 说明一个外部字段可能同时受 Jackson 与 Fastjson 注解影响，不把双注解作为现代推荐 |
| `dzzz-app/src/main/java/com/tdh/bdzz/vo/yzw/SaveRecordListVO.java`，`SaveRecordListVO` | adapted | 说明 JSON 数组应映射为带元素类型的 List，而不是原始 List |

### `JAVA-FRAMEWORK-019`：Fastjson 序列化与解析

冻结矩阵记录 214 个能力文件，其中 framework usage 命中 209 个文件。数量只说明迁移优先级，
不能证明旧 API 或全局配置正确。

| 文件与符号 | 状态 | 课程用途 |
| --- | --- | --- |
| `dzzz-app/src/main/java/com/tdh/bdzz/handler/AbstractJsonTypeHandler.java`，`AbstractJsonTypeHandler<T>` | corrected | JSON 持久化格式已经成为长期合同；迁移库前必须做旧数据回读与双向兼容测试 |
| `dzzz-app/src/main/java/com/tdh/bdzz/handler/FastJsonTypeHandler.java`，`FastJsonTypeHandler<T>` | corrected | 不复制数据库处理器实现，只提取显式目标类型和失败边界 |
| `dzzz-app/src/main/java/com/tdh/bdzz/service/tsaiassistant/TsLegalReasoningResultParser.java`，`TsLegalReasoningResultParser` | adapted | 外部 JSON 先进入明确 DTO，再由业务层处理；解析成功不等于业务校验通过 |

## 现代主线结论

### JSON 是文本数据模型，不是 Java 对象转储格式

RFC 8259 只定义 object、array、number、string、`true`、`false`、`null`。JSON 对象成员名是
字符串且应唯一，成员顺序不应成为业务合同。JSON 没有 Java 的 UUID、LocalDate、枚举、继承或
任意类名概念；这些都需要在边界上另行约定。（来源：R1）

课程必须展示有效 JSON 与 Java 字符串字面量的区别。示例 JSON 使用双引号、禁止尾逗号，网络
边界明确 UTF-8。不能用 Jackson/Fastjson 的宽松扩展反推标准 JSON 允许注释、单引号或 NaN。
（来源：R1）

### 外部合同先定义 DTO，再执行对象映射

稳定合同至少明确字段名、类型、必填/可选、null 含义、枚举取值、日期格式、未知字段策略和版本
演进。Jackson 负责按这些规则转换形状，不负责证明年龄范围、ID 是否存在或调用者是否有权限。
这是课程边界设计，不是 RFC 语法规则。（来源：J4、O1）

推荐的学习顺序是：先读 JSON 结构；再定义只包含边界字段的 DTO；然后配置单个 JsonMapper；
最后在映射成功后执行 Bean Validation 或显式业务校验。禁止把数据库实体或含敏感字段的内部对象
直接作为外部合同。（来源：O1；校验顺序为本课教学合同）

### Jackson 3 使用构建器完成一次配置并复用

Jackson 3 的包名为 `tools.jackson.*`，Maven 坐标为
`tools.jackson.core:jackson-databind:3.2.1`。课程使用 `JsonMapper.builder()`，在 `build()` 前
完成 feature、模块和读取约束配置，之后注入并复用 mapper。每次请求 `new ObjectMapper()` 会分散
合同配置，也丢失缓存复用价值。（来源：J3、J4、J5）

对外部输入，课程显式启用 `FAIL_ON_UNKNOWN_PROPERTIES`。这是本课程的合同选择，不冒充 Jackson
3 默认值；3.2.1 默认关闭该特性，2.12.7.1 默认开启。（来源：J6、J14）

### 序列化与反序列化是两个方向的合同

序列化把 Java 值写成 JSON；反序列化把 JSON 读成目标 Java 类型。两者字段可见性、字段名、null
策略和日期格式必须分别验证，不能只做“对象写出后再读回”的自循环测试。自循环可能同时保留双方
共享的错误，却无法证明真实外部样本兼容。（来源：J4；分别验证方向是本课验证设计）

Jackson 3 可直接映射 record、Java 时间和 Optional。课程以 `OffsetDateTime` 的 ISO-8601 文本
展示明确时区偏移；需要保留输入偏移量时，3.x 显式关闭
`DateTimeFeature.ADJUST_DATES_TO_CONTEXT_TIME_ZONE`。项目 Jackson 2.x 则需要匹配版本的
`jackson-datatype-jsr310` 与 `JavaTimeModule`，并使用 2.x 对应的 `DeserializationFeature` 关闭
上下文时区调整。（来源：J8、J9、J10、J11、J13、J15）

### 泛型集合需要完整元素类型

`List.class` 只能告诉 Jackson 最外层是 List，不能保存 `List<CoursePayload>` 的元素类型。
Jackson 官方 README 使用 `TypeReference` 解决类型擦除后的运行时类型信息。课程同时展示
`TypeReference<List<CoursePayload>>` 和读成原始 List 后出现 Map 元素的错误结果。（来源：J4）

### 树模型只用于局部动态结构

`JsonNode` 适合字段集合确实动态、只需读取局部路径或先检查 envelope 的场景。稳定请求主体仍应
映射成 DTO，使字段名和类型可由编译器与测试检查。`node.get("x")` 可能返回 null，缺失节点、JSON
null 和空字符串不能混为一个状态。（来源：J4、J16）

### 解析失败、校验失败和业务失败必须分开

语法错误、类型不匹配、未知字段和尾随 token 属于 JSON/映射失败；字段为空或越界属于输入校验
失败；资源不存在或状态冲突属于业务失败。应用边界应保持这三类失败可区分，不暴露 Jackson 堆栈、
类名或原始敏感载荷。本课只冻结失败分类，不教授 Controller 响应映射。（来源：J6、J7；分层为本课合同）

### 不可信输入需要大小、深度和类型限制

Jackson Core 的 `StreamReadConstraints` 可限制文档长度、token 数、嵌套深度、数字、字段名和
字符串长度；其中 3.2.1 的文档长度和 token 数默认无限。官方默认值不是业务上限，本课只展示按数据
合同设置更小的 parser 限制，传输层 body 限制留待后续 Web 课程。（来源：J7）

不对不可信 JSON 开启任意类名驱动的全局默认多态。确有多态需求时只允许业务定义的有限类型名，
并在单独课程研究；本课不教授 `Id.CLASS` 或任意 AutoType。（来源：J12、O1）

### Spring MVC 的消息转换不会替代 DTO 合同

Spring 的 HttpMessageConverter 根据 Java 目标类型和媒体类型读写请求/响应体。现代 Spring
Framework 7 的 Jackson converter 使用 JsonMapper；项目 Spring 5 使用
MappingJackson2HttpMessageConverter。框架自动调用并不意味着可以忽略 mapper 配置、DTO、校验和
错误分类。本课到“对象映射由 converter 接入”即止，不展开 HTTP 合同。（来源：S1、S2）

### Fastjson 只作为迁移纠错线

新课程不要求初学者同时实现 Jackson 与 Fastjson 两套主线。`dzzz-app` 的 Fastjson 使用决定迁移
必须学习，但推荐步骤是：冻结旧 JSON 样本与持久化数据；建立 Jackson 目标合同；对字段名、null、
数字、时间和枚举逐项对比；小范围切换；保留回退与回读验证。

Fastjson2 官方 1.x 兼容坐标不保证 100% 兼容，不能只改版本号就宣布迁移完成。AutoType 默认关闭
仍不等于所有输入都安全；目标类型、输入限制和错误边界依旧必须明确。（来源：F1、O1）

## 新旧版本差异

| 对比项 | Jackson 3.2.1 / Java 25 | `dzzz-app` 项目线 | 教学结论 | 来源 |
| --- | --- | --- | --- | --- |
| 包名 | `tools.jackson.*` | `com.fasterxml.jackson.*` | 代码不能混用 import | J4、J14 |
| JDK 基线 | 17+，课程用 25 LTS | Java 8 | 项目补充必须保持 Java 8 语法 | J1、J4、J13 |
| 配置 | builder 后得到不可变、线程安全 mapper | 2.x mapper 可变，先配置后共享 | 两条线都只创建和配置一次 | J4、J5 |
| 未知字段默认值 | 默认忽略 | 2.12.7.1 默认失败 | 对外部输入显式选择，不依赖默认值 | J6、J14 |
| 尾随 token 默认值 | 默认失败 | 2.12.7.1 默认允许 | 项目线显式启用完整文档读取 | J6、J14 |
| Java 时间 | 已并入 databind | 单独 `JavaTimeModule` | 版本匹配后再注册 | J8、J13 |
| Spring converter | `JacksonJsonHttpMessageConverter` | `MappingJackson2HttpMessageConverter` | 名称不同；本课只讲映射集成点 | S1、S2 |
| Fastjson | 不进入现代主线 | `com.alibaba:fastjson` 2.0.7 | 只作兼容、迁移和回归证据 | F1、O1 |

## 易错点与验证设计

| 易错点 | 触发条件与后果 | 正确写法 | 最小验证 | 来源 |
| --- | --- | --- | --- | --- |
| 把 Java 对象当 JSON | 使用单引号、尾逗号、NaN 或未加引号的键 | 按 RFC 8259 生成标准 JSON | 解析合法/非法样本并核对异常 | R1 |
| 使用原始 List | `readValue(json, List.class)` 得到 Map 元素 | 使用 `TypeReference<List<Dto>>` | 断言元素运行时类型 | J4 |
| 未知字段静默丢失 | 客户端拼错字段但输入仍被接受 | 对写入型外部 DTO 显式启用未知字段失败 | 输入 `displayNmae` 并断言拒绝 | J6、J14 |
| 把映射成功当校验成功 | 负数年龄、空 ID 仍能构造对象 | 映射后运行校验并返回稳定参数错误 | 分别断言映射与校验结果 | J4、O1 |
| 每次请求创建 mapper | 配置漂移且无法统一审计 | 构建一次并注入复用 | 同一 mapper 完成多次读写 | J4、J5 |
| 依赖上下文时区处理时间 | 输入 offset 被调整 | 外部合同使用 OffsetDateTime/Instant 与 ISO-8601 | 固定带 `+08:00` 样本回读 | J10、J11 |
| 开启任意多态或 AutoType | 外部值控制类名或类型 | 固定目标 DTO；必要多态用显式允许列表 | 恶意类型字段不参与类选择 | J12、O1 |
| 无 parser 输入限制 | 超深、超长 JSON 消耗资源 | 按合同设置 StreamReadConstraints | 超过深度/字符串限制即失败 | J7 |
| 直接替换 Fastjson | 字段、null、日期或持久化格式变化 | 先冻结样本并双读/对比 | 同一 corpus 分别读取并比较业务值 | F1 |

## 最小 fixture 计划

所有 fixture 放在 `/tmp` 的 `mktemp -d` 目录，验证后使用 `find <dir> -depth -delete`，并以
`test ! -e <dir>` 证明不存在。

1. Java 25 + Jackson 3.2.1 正向：record DTO 序列化/反序列化、`OffsetDateTime`、
   `TypeReference<List<Dto>>`、JsonNode 局部读取，输出固定摘要。
2. Java 25 + Jackson 3.2.1 负向：未知字段、尾随 token、超深 JSON 分别被拒绝。
3. Java 8 + Jackson Databind 2.12.7.1、Java 8 modules 2.12.7 正向：普通不可变 DTO、
   JavaTimeModule、完整泛型集合读取。
4. Java 8 + Jackson Databind 2.12.7.1 负向：显式开启未知字段与尾随 token 失败，证明不依赖
   2.x 默认值。
5. 不运行 Fastjson 项目代码；迁移结论由官方兼容说明和冻结项目静态证据支持。

## 课程小点建议

1. JSON 文本、六种值和 Java 字符串字面量。
2. 外部数据合同、DTO 与内部模型边界。
3. JsonMapper 一次配置和复用。
4. 序列化、字段名、null 与敏感字段输出。
5. 反序列化、构造对象与未知字段策略。
6. 泛型集合与 TypeReference。
7. JsonNode 树模型、缺失节点与 JSON null。
8. 日期时间、数字和枚举的明确格式。
9. 解析失败、校验失败和业务失败。
10. 输入限制、多态安全、Spring 消息转换与 Fastjson 迁移边界。

每个小点必须独立写出“它是什么、有什么作用、什么时候使用、怎么使用、最小示例、运行结果、
常见误区”。步骤使用真实 Markdown 有序列表，每个序号独立一行。

## 研究 Gate 自检

- [x] 冻结课程 ID、slug、URL、I-03 顺序、120 分钟、唯一精确前置 I-02、能力范围与版本边界。
- [x] 当前版本事实重新核验：Java 25 是 LTS 但非最新功能版本；Jackson 3.2.1 是课程锁定版本，
  当前 release 为 3.2.2；Spring Framework 7.0.8 与 Fastjson2 2.0.64 仍是当前 release。
- [x] JSON 语法结论来自 RFC 8259。
- [x] Jackson 行为来自精确 3.2.1 tag 的 README/源码。
- [x] Spring 现代与项目版本分别使用精确 tag 的官方文档或源码，并止于消息转换集成点。
- [x] Fastjson2 只支持迁移边界，不成为第二条主线。
- [x] 项目证据只来自冻结 `dzzz-app` 审计与只读核对，没有运行或修改项目。
- [x] 安全结论绑定 Jackson 官方说明、StreamReadConstraints 源码和 OWASP。
- [x] 易错点有触发条件、后果、修正与验证方式。
- [x] 未作无测量性能结论。
- [x] 课程正文来源只进入 frontmatter 的统一“官方来源”区域。

## Stop Boundary

本研究稿只冻结 I-03 `json-and-data-contracts` 的研究输入，不授权修改课程正文、track、loader、
manifest 或 signoff。后续只有在相应批次获授权并完成课程正文、两个 Java manifest、
`/tmp` Java 25/8 fixture、工程 Gate、桌面/390px 浏览器证据、独立 signoff 与 Standards/Spec
双轴 `PASS / 0 finding` 后，才能领取 I-04。本稿不得展开 I-04 的 HTTP 课程内容，也不得进入高级、
Reference 或项目实战。
