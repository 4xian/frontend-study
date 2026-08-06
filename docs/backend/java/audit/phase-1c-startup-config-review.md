# `dzzz-app` Phase 1C 启动与配置复核

> 批次：Phase 1C 第 1 批<br>
> 源码快照：`dzzz-app-20260803-179e722831ab`<br>
> 自动分析：`dzzz-app-analysis-20260803-958d37cf1be1`<br>
> 状态：已完成，34/34 个文件、3949/3949 LOC<br>
> 结构化事实源：[phase-1c-startup-config.json](./reviews/phase-1c-startup-config.json)

## 1. 本批边界

本批使用可重复的物理范围，而不是机器角色候选作为分母：

```text
dzzz-app/src/main/java/com/tdh/DzzzAreaApplication.java
dzzz-app/src/main/java/com/tdh/bdzz/config/**/*.java
```

共 34 个 Java 文件，清单索引为 `1`、`84` 至 `116`，总计 3949 LOC。即使 `config/`
目录内的文件实际属于数据模型、Web 入口、数据访问或异步集成，本批仍读取其完整源码，再由人工结论
纠正角色。目录外的 Controller、filter、timer 和其他配置注解类不计入本批分母，留给其主要职责
批次。

相关 `properties`、POM 和调用者只用于确认配置键、依赖版本及 Bean 消费关系，不会因此获得
`reviewed` 状态。

## 2. 复核方法

1. 先运行 Phase 1B 全量一致性检查，确认 3436 个文件的路径、哈希和自动提取产物没有漂移。
2. CodeGraph 优先查询再次返回前端和其他模块符号，因此不采纳该次结果。
3. 回退到冻结清单、目标源码逐行读取和限定在 `dzzz-app/` 的精确 `rg` 查询。
4. 对每个文件核对机器角色、主要实现、生命周期、依赖、能力候选、风险候选和源码行证据。
5. 用独立校验器确认台账路径、索引、哈希、LOC、角色汇总和当前审计状态与冻结分母一致。

机器角色仍保留为对照字段；`finalRole` 才是本批人工结论。风险项 `SC-001` 至 `SC-086` 只表示
“后续能力/拒绝模式归一化需要处理的候选”，不等于已经建立能力矩阵、课程推荐或修复任务。

## 3. 当前状态叠加规则

Phase 1A 身份清单和 Phase 1B 自动提取是不可改写的历史快照，因此其中的 3436 个
`unreviewed` 仍表示生成当时的状态。当前状态按以下规则得到：

```text
当前审计状态 = Phase 1A 基线状态 + 已完成的 Phase 1C 复核台账
```

本批台账把自身 34 个唯一路径覆盖为 `reviewed`，其余路径维持基线状态。当前总分母仍是 3436：

| 状态 | 主代码 | 测试 | 总数 |
| --- | ---: | ---: | ---: |
| `unreviewed` | 3395 | 7 | 3402 |
| `reviewing` | 0 | 0 | 0 |
| `reviewed` | 34 | 0 | 34 |
| `blocked` | 0 | 0 | 0 |

后续复核批次应继续新增独立台账，不能修改旧台账或重生成 Phase 1B 分片来伪造历史状态。

## 4. 人工角色结果

| 最终角色 | 文件数 | 说明 |
| --- | ---: | --- |
| `startup-config` | 15 | 应用入口、数据源、MyBatis、Redis、HTTP、MVC、线程池、WebSocket 容器等配置 |
| `async-integration` | 12 | 自定义优先级执行器、Endpoint 桥接器和 10 个 WebSocket 消息端点 |
| `cross-cutting` | 2 | Spring 静态服务定位器、出站 HTTP HMAC 拦截器 |
| `data-model` | 2 | 对象存储配置对象、日志读取结果对象 |
| `data-access` | 1 | MyBatis-Plus SQL 注入器扩展 |
| `infrastructure` | 1 | 日志文件 tail 读取器 |
| `web-entry` | 1 | Swagger 路径阻断 Controller |

机器候选中 20 个 `startup-config` 和 14 个 `async-integration` 有 9 个需要纠正：

| 索引 | 文件 | 机器候选 | 最终角色 |
| ---: | --- | --- | --- |
| 84 | `AmazonConfig.java` | `startup-config` | `data-model` |
| 86 | `ApplicationContextProvider.java` | `startup-config` | `cross-cutting` |
| 91 | `EasySqlInjector.java` | `startup-config` | `data-access` |
| 92 | `HeaderRequestInterceptor.java` | `startup-config` | `cross-cutting` |
| 94 | `Pdf2ImageComparablePriorityTaskPoolExecutor.java` | `startup-config` | `async-integration` |
| 98 | `SwaggerAccessBlockController.java` | `startup-config` | `web-entry` |
| 104 | `WebSocketConfig.java` | `async-integration` | `startup-config` |
| 109 | `LoggingFileTailReader.java` | `async-integration` | `infrastructure` |
| 110 | `LoggingTailReadResult.java` | `async-integration` | `data-model` |

这证明目录规则只能用于建立候选，不能代替源码语义复核。

## 5. 配置与调用确认

提交到仓库的资源文件证明：

- `application.properties` 定义了应用 ID，以及两个临时目录绑定键；
- `application-dev.properties` 定义了授权法院、应用服务地址和本地文件根路径；
- `datasource.pool.*`、`dzzz.*`、`rest.*` 和 `file.process.thread.*` 在本批读取的 Java 中具有默认值或
  环境读取逻辑，但没有在已提交资源中找到对应值，运行环境仍可能通过外部配置覆盖；
- `dzzz-parent/pom.xml` 固定 Spring Boot `2.3.12.RELEASE`，`dzzz-app/pom.xml` 直接使用
  MyBatis-Plus `3.4.2`、Springfox `2.5.0`、WebSocket、Redis、CXF 和多组 Fastjson 依赖。

精确调用检索还确认：命名事务管理器和多个 TaskExecutor 被大量业务/定时任务消费，三个具名
RestTemplate 被不同外部服务调用；WebSocket 端点也被若干 Service 作为服务端广播入口调用。这些
调用者只用于验证 Bean 和公开方法不是孤立声明，仍属于后续业务、异步和 Web 入口批次。

## 6. 风险候选主题

本批共记录 86 个风险候选，其中优先级较高的主题是：

1. 启动与生命周期：重复自动配置注解、字段注入、全局静态上下文、进程级 Locale/系统属性修改和
   `System.exit`。
2. 配置正确性：未启用的 CORS Bean、任意源与凭据组合、setter 忽略绑定值、连接池校验意图与实现
   不一致、多同类型 HTTP/Executor Bean 的选择规则。
3. 旧框架边界：DBCP 1、旧 MyBatis-Plus 分页插件、Springfox Swagger 2、Fastjson Redis
   序列化和 `javax.websocket` 只作为 legacy 映射，不作为现代推荐示例。
4. 并发生命周期：检查后再 `put`、ConcurrentHashMap 内保存普通 ArrayList、手写线程池未关闭、
   会话组不清理、同步广播被慢客户端阻塞。
5. 安全与隐私：URL 角色不能替代授权、消息和配置日志需要去敏、配置对象的 Lombok `toString`
   可能泄露秘密字段。
6. 实时日志端点：客户端日志键参与路径拼接，且端点直接暴露服务器日志；后续必须作为高风险拒绝
   模式核验，不能进入推荐课程示例。

文件没有风险候选不代表实现已经经过完整安全或业务审查，只表示本批启动/配置视角没有登记候选。

## 7. 逐文件关闭记录

下表是人读索引；每条完整职责、生命周期、依赖、能力候选、风险摘要和源码行号以结构化事实源为准。

| 索引 | 文件 | 最终角色 | 人工结论 | 风险候选 |
| ---: | --- | --- | --- | --- |
| 1 | `DzzzAreaApplication.java` | `startup-config` | Boot 与 WAR 双入口，启用异步、重试和旧 Swagger | `SC-001..002` |
| 84 | `AmazonConfig.java` | `data-model` | 对象存储连接配置数据对象 | `SC-003` |
| 85 | `AppStarter.java` | `startup-config` | Servlet 上下文启动初始化 | `SC-004..007` |
| 86 | `ApplicationContextProvider.java` | `cross-cutting` | 静态 Spring Bean 服务定位器 | `SC-008` |
| 87 | `CorsConfig.java` | `startup-config` | 未启用的全局 CORS Filter 草稿 | `SC-009..010` |
| 88 | `CxfConfig.java` | `startup-config` | CXF Servlet、Bus 与 SOAP 端点装配 | 无 |
| 89 | `DataSourceConfig.java` | `startup-config` | 外部配置与运维平台双来源的数据源初始化 | `SC-011..014` |
| 90 | `DbcpSqlCheckConfig.java` | `startup-config` | Servlet 启动期 SQL 表白名单登记 | `SC-015` |
| 91 | `EasySqlInjector.java` | `data-access` | MyBatis-Plus 批量插入方法扩展 | 无 |
| 92 | `HeaderRequestInterceptor.java` | `cross-cutting` | 出站 HTTP HMAC 签名 | `SC-016..018` |
| 93 | `MybatisPlusConfig.java` | `startup-config` | 会话、Mapper、事务、分页和分表插件装配 | `SC-019..020` |
| 94 | `Pdf2ImageComparablePriorityTaskPoolExecutor.java` | `async-integration` | PDF 转图片优先级执行器 | `SC-021..024` |
| 95 | `RedisConfig.java` | `startup-config` | Redis 键值与 Hash 序列化 | `SC-025` |
| 96 | `RestConfig.java` | `startup-config` | 四类 RestTemplate 和超时/转换器配置 | `SC-026..028` |
| 97 | `SpringMvcConfig.java` | `startup-config` | MVC 拦截器、资源、CORS 与视图路由 | `SC-029..032` |
| 98 | `SwaggerAccessBlockController.java` | `web-entry` | Swagger 路径返回 404 的 Web 入口 | `SC-033` |
| 99 | `SwaggerConfig.java` | `startup-config` | Springfox Swagger 2 Docket 配置 | `SC-034..035` |
| 100 | `SysConfig.java` | `startup-config` | 系统参数绑定与文件路径派生 | `SC-036..039` |
| 101 | `ThreadPoolConfig.java` | `startup-config` | 六个业务 TaskExecutor Bean | `SC-040..042` |
| 102 | `ThymeleafConfig.java` | `startup-config` | 静态资源 URL 编码 Filter | 无 |
| 103 | `DzzzEndpointConfigure.java` | `async-integration` | JSR-356 与 Spring BeanFactory 桥接器 | `SC-043` |
| 104 | `WebSocketConfig.java` | `startup-config` | Endpoint 导出器与容器参数 | `SC-044..046` |
| 105 | `AppFrontYyzxWsServer.java` | `async-integration` | ASR 到页面的语音转写转发端点 | `SC-047..049` |
| 106 | `BlOperationWsServer.java` | `async-integration` | 笔录操作定点/群组广播端点 | `SC-050..053` |
| 107 | `ClientChatWsServer.java` | `async-integration` | 聊天、庭审状态与 URL 编排端点 | `SC-054..057` |
| 108 | `ClientZzWsServer.java` | `async-integration` | 两阶段分组的客户端质证端点 | `SC-058..061` |
| 109 | `LoggingFileTailReader.java` | `infrastructure` | UTF-8 日志文件尾部读取器 | `SC-062` |
| 110 | `LoggingTailReadResult.java` | `data-model` | 日志行与下一偏移结果对象 | `SC-063` |
| 111 | `LoggingWSServer.java` | `async-integration` | 实时日志 tail 与 WebSocket 推送 | `SC-064..067` |
| 112 | `OnlyOfficeWsServer.java` | `async-integration` | OnlyOffice 房间广播端点 | `SC-068..071` |
| 113 | `Voice2TextWsServer.java` | `async-integration` | 语音转写、笔录保存与角色转发 | `SC-072..075` |
| 114 | `FybChatRoomWsServer.java` | `async-integration` | 法院宝聊天室与质证状态端点 | `SC-076..079` |
| 115 | `FybWsServer.java` | `async-integration` | 法院宝 OnlyOffice 在线端点 | `SC-080..083` |
| 116 | `NoteSignWsServer.java` | `async-integration` | 鉴定摇号笔录签名通知端点 | `SC-084..086` |

## 8. 批次结论与停止点

Phase 1C 第 1 批达到自身分母，可以关闭；Phase 1 总 Gate 仍未通过，尚有 3402 个文件未人工复核，
能力矩阵也尚未创建。

本批停止在“启动与配置”边界。下一批只能按计划进入“Web 入口”人工复核，并在领取前重新运行全量
一致性检查；不能直接进入业务层、能力矩阵、平台改造或课程正文。
