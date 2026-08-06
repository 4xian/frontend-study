# `dzzz-app` Java 风险反例矩阵

> 批次：Phase 1D 第 5 批：风险反例归一化
> 源码快照：`dzzz-app-20260803-179e722831ab`
> 自动分析：`dzzz-app-analysis-20260803-958d37cf1be1`
> 状态：319 条风险已完成唯一归一化；仅作为正确实践、易错点和拒绝模式证据

## 1. 本批边界

本批严格以上一批保留的 319 个 `review-risk` 输入为分母，
人工归一化为 47 个规范风险模式。项目旧写法不因进入矩阵而被认可。

- 已归一化输入：319；
- 待处理输入：0；
- 唯一证据文件：1568；
- 代表符号：225。

## 2. 规范风险模式

### JAVA-RISK-001 Web 入口职责过载

- 类型：`review-risk-pattern`；推荐阶段：中级。
- 项目证据：11 个文件；原始风险：11 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-ENGINEERING-001`、`JAVA-FRAMEWORK-008`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0017`：该 Controller 达到 793 LOC，HTTP 适配、校验和业务编排边界过重。
  - `RISK-0033`：该 Controller 达到 796 LOC，HTTP 适配、校验和业务编排边界过重。
  - `RISK-0088`：该 Controller 达到 2235 LOC，HTTP 适配、校验和业务编排边界过重。
  - `RISK-0097`：该 Controller 达到 607 LOC，HTTP 适配、校验和业务编排边界过重。
  - `RISK-0103`：该 Controller 达到 952 LOC，HTTP 适配、校验和业务编排边界过重。
  - `RISK-0136`：该 Controller 达到 813 LOC，HTTP 适配、校验和业务编排边界过重。
  - `RISK-0158`：该 Controller 达到 528 LOC，HTTP 适配、校验和业务编排边界过重。
  - `RISK-0183`：该 Controller 达到 532 LOC，HTTP 适配、校验和业务编排边界过重。
  - `RISK-0248`：该 Controller 达到 1071 LOC，HTTP 适配、校验和业务编排边界过重。
  - `RISK-0260`：该 Controller 达到 773 LOC，HTTP 适配、校验和业务编排边界过重。
  - `RISK-0301`：该 Controller 达到 750 LOC，HTTP 适配、校验和业务编排边界过重。
- 代表符号：
  - `com.tdh.bdzz.controller.FybController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/FybController.java`
  - `com.tdh.bdzz.controller.SjydController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/SjydController.java`
  - `com.tdh.bdzz.controller.Fyb4WindowsController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/Fyb4WindowsController.java`
  - `com.tdh.bdzz.controller.TsblSjyController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/TsblSjyController.java`
  - `com.tdh.bdzz.controller.TsxxSearchController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/TsxxSearchController.java`

### JAVA-RISK-002 业务服务职责过载

- 类型：`review-risk-pattern`；推荐阶段：中级。
- 项目证据：36 个文件；原始风险：36 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-ENGINEERING-001`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0003`：该业务类达到 5380 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0004`：该业务类达到 3680 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0007`：该业务类达到 2772 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0025`：该业务类达到 1457 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0034`：该业务类达到 5403 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0044`：该业务类达到 1171 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0068`：该业务类达到 1566 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0080`：该业务类达到 2473 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0085`：该业务类达到 1926 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0099`：该业务类达到 1674 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0100`：该业务类达到 3876 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0112`：该业务类达到 2576 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0126`：该业务类达到 1568 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0145`：该业务类达到 1146 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0174`：该业务类达到 1487 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0176`：该业务类达到 1708 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0182`：该业务类达到 3419 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0184`：该业务类达到 1687 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0185`：该业务类达到 4471 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0195`：该业务类达到 1963 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0197`：该业务类达到 1142 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0198`：该业务类达到 1240 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0201`：该业务类达到 2231 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0203`：该业务类达到 2299 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0205`：该业务类达到 2859 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0225`：该业务类达到 1509 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0226`：该业务类达到 1055 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0239`：该业务类达到 1751 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0243`：该业务类达到 1907 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0252`：该业务类达到 1425 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0255`：该业务类达到 2671 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0276`：该业务类达到 4925 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0282`：该业务类达到 5137 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0305`：该业务类达到 7431 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0307`：该业务类达到 1841 LOC，事务、外部协作和领域编排边界需要继续拆分。
  - `RISK-0313`：该业务类达到 1058 LOC，事务、外部协作和领域编排边界需要继续拆分。
- 代表符号：
  - `com.tdh.bdzz.service.impl.YbtsServiceImpl`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/YbtsServiceImpl.java`
  - `com.tdh.bdzz.service.impl.SjydServiceImpl`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/SjydServiceImpl.java`
  - `com.tdh.bdzz.service.impl.FgdServiceImpl`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FgdServiceImpl.java`
  - `com.tdh.bdzz.service.impl.XinkeServiceImpl`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/XinkeServiceImpl.java`
  - `com.tdh.bdzz.service.impl.Voice2TextServiceImpl`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/Voice2TextServiceImpl.java`

### JAVA-RISK-003 数据访问合同职责过载

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：4 个文件；原始风险：4 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-ENGINEERING-003`、`JAVA-FRAMEWORK-014`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0057`：该 Mapper 接口达到 475 LOC，查询职责和投影边界需要按用例拆分。
  - `RISK-0151`：该 Mapper 接口达到 371 LOC，查询职责和投影边界需要按用例拆分。
  - `RISK-0192`：该 Mapper 接口达到 223 LOC，查询职责和投影边界需要按用例拆分。
  - `RISK-0292`：该 Mapper 接口达到 291 LOC，查询职责和投影边界需要按用例拆分。
- 代表符号：
  - `com.tdh.bdzz.dao.EajFtsyMapper`：`dzzz-app/src/main/java/com/tdh/bdzz/dao/EajFtsyMapper.java`
  - `com.tdh.bdzz.dao.DzzzTsxqMapper`：`dzzz-app/src/main/java/com/tdh/bdzz/dao/DzzzTsxqMapper.java`
  - `com.tdh.bdzz.dao.DzzzFybHyXqMapper`：`dzzz-app/src/main/java/com/tdh/bdzz/dao/DzzzFybHyXqMapper.java`
  - `com.tdh.bdzz.dao.DzzzSqlMapper`：`dzzz-app/src/main/java/com/tdh/bdzz/dao/DzzzSqlMapper.java`

### JAVA-RISK-004 层次边界与模型职责混合

- 类型：`review-risk-pattern`；推荐阶段：中级。
- 项目证据：116 个文件；原始风险：12 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-ENGINEERING-001`、`JAVA-ENGINEERING-002`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0024`：传输端点直接构造业务 VO 并通过静态服务定位器保存笔录，职责边界过深。
  - `RISK-0026`：数据模型包含显式工厂或行为方法；需确认它只维护构造不变量，没有吸收服务编排、I/O 或外部副作用。
  - `RISK-0052`：响应模型方法直接依赖 Spring BindingResult，Web 校验错误转换与数据合同发生耦合。
  - `RISK-0070`：非 static 成员模型隐式持有外部实例引用，不适合作为独立序列化数据合同。
  - `RISK-0094`：关闭回调通过静态服务定位器执行业务逻辑，职责和错误边界混合。
  - `RISK-0122`：同一文件声明多个模型类型会增加序列化、构造和复用边界的理解成本；现代示例优先使用独立类型或明确的静态成员类型。
  - `RISK-0199`：Endpoint 关闭回调通过静态服务定位器执行业务逻辑，传输生命周期与业务事务耦合。
  - `RISK-0219`：数据模型内部包含日志职责，容易记录完整对象或敏感字段，并使纯数据合同依赖日志框架。
  - `RISK-0235`：DTO/VO/BO/EO 模型包含持久化映射注解，传输合同与数据库字段策略发生耦合。
  - `RISK-0295`：Endpoint 通过静态服务定位器访问 Service 和 Mapper，混合传输、业务与数据访问职责。
  - `RISK-0315`：单类聚合大量不相关或高变化能力，课程示例应按清晰职责和依赖边界拆分。
  - `RISK-0316`：业务合同或实现直接接收 Servlet/MultipartFile 类型，使传输层与业务层边界耦合。
- 代表符号：
  - `com.tdh.bdzz.config.websocket.server.Voice2TextWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/Voice2TextWsServer.java`
  - `com.tdh.bdzz.dto.HkConfAddDTO`：`dzzz-app/src/main/java/com/tdh/bdzz/dto/HkConfAddDTO.java`
  - `com.tdh.bdzz.vo.CommResultVO`：`dzzz-app/src/main/java/com/tdh/bdzz/vo/CommResultVO.java`
  - `com.tdh.bdzz.dto.sfjd.ZxjgDTO`：`dzzz-app/src/main/java/com/tdh/bdzz/dto/sfjd/ZxjgDTO.java`
  - `com.tdh.bdzz.config.websocket.server.fyb.FybWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/fyb/FybWsServer.java`

### JAVA-RISK-005 隐式依赖与容器生命周期绕过

- 类型：`review-risk-pattern`；推荐阶段：中级。
- 项目证据：381 个文件；原始风险：13 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-FRAMEWORK-002`、`JAVA-ENGINEERING-010`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0016`：字段注入隐藏必需依赖，现代示例应使用构造器注入。
  - `RISK-0039`：存在多个 TaskExecutor 且没有名为 taskExecutor 的默认 Bean，未指定执行器的 Async 调用需要单独核验选择规则。
  - `RISK-0058`：静态 Bean 查找隐藏依赖并削弱隔离测试，应优先使用显式构造器注入。
  - `RISK-0075`：字段注入隐藏数据源初始化的必需依赖。
  - `RISK-0106`：在 Spring 单例内部再次手写懒加载单例增加生命周期复杂度。
  - `RISK-0114`：运行时通过 Service Locator 获取 Bean，隐藏依赖并绕过构造器合同。
  - `RISK-0121`：SysConfig 字段在文件中未使用，且采用字段注入。
  - `RISK-0148`：同类型 Bean 较多，调用方需要稳定限定符或构造器参数名，不能依赖模糊注入。
  - `RISK-0152`：运行时从容器取 Bean 隐藏依赖；现代示例使用显式构造器依赖。
  - `RISK-0172`：字段注入隐藏必需依赖；现代示例使用构造器注入。
  - `RISK-0246`：静态服务定位器隐藏依赖、扩大全局状态并降低可测试性，课程只应作为旧项目识别项。
  - `RISK-0266`：字段注入隐藏必需依赖；现代示例应使用构造器注入并显式表达可选依赖。
  - `RISK-0274`：直接 new 拦截器会绕过 Spring 依赖注入和生命周期管理。
- 代表符号：
  - `com.tdh.bdzz.config.AppStarter`：`dzzz-app/src/main/java/com/tdh/bdzz/config/AppStarter.java`
  - `com.tdh.bdzz.config.ThreadPoolConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/ThreadPoolConfig.java`
  - `com.tdh.bdzz.context.SpringContext`：`dzzz-app/src/main/java/com/tdh/bdzz/context/SpringContext.java`
  - `com.tdh.bdzz.config.DataSourceConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/DataSourceConfig.java`
  - `com.tdh.bdzz.config.Pdf2ImageComparablePriorityTaskPoolExecutor`：`dzzz-app/src/main/java/com/tdh/bdzz/config/Pdf2ImageComparablePriorityTaskPoolExecutor.java`

### JAVA-RISK-006 未生效、冗余或伪关闭配置

- 类型：`review-risk-pattern`；推荐阶段：中级。
- 项目证据：8 个文件；原始风险：9 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-FRAMEWORK-001`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0083`：Endpoint-Spring 桥接 Bean 已注释，不能把 DzzzEndpointConfigure 当作当前生效能力。
  - `RISK-0089`：代码注释已说明外部容器无需导出器，但 WAR 项目仍无条件创建该 Bean，应按部署方式条件化。
  - `RISK-0098`：实现依赖静态 BeanFactory 先被回调；当前 WebSocketConfig 中对应 Bean 已注释，文件内也没有组件注解。
  - `RISK-0143`：上传方法的映射被注释，当前不是可达 HTTP 入口，不能按已启用能力教学。
  - `RISK-0187`：Configuration 被注释，内部 Bean 方法不会被组件扫描自动执行。
  - `RISK-0250`：过滤器工厂没有 Bean 注解，不能把方法内容误判为运行时已生效配置。
  - `RISK-0254`：SpringBootApplication 已包含自动配置能力，重复声明 EnableAutoConfiguration 增加理解成本。
  - `RISK-0268`：名为漏洞修复的拦截器当前无条件放行，没有实际安全控制。
  - `RISK-0294`：只声明了 Controller 和基路径，没有任何处理方法，不能把占位类当成可用回调接口。
- 代表符号：
  - `com.tdh.bdzz.config.websocket.WebSocketConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/WebSocketConfig.java`
  - `com.tdh.bdzz.config.websocket.DzzzEndpointConfigure`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/DzzzEndpointConfigure.java`
  - `com.tdh.bdzz.controller.PdfjsStampController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/PdfjsStampController.java`
  - `com.tdh.bdzz.filter.AccessFilterConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/filter/AccessFilterConfig.java`
  - `com.tdh.bdzz.config.CorsConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/CorsConfig.java`

### JAVA-RISK-007 空值、缺失与失败语义混淆

- 类型：`review-risk-pattern`；推荐阶段：基础。
- 项目证据：132 个文件；原始风险：8 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-LANG-009`、`JAVA-STDLIB-009`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0027`：助手方法返回 null 的缺失或失败语义不明确；现代合同应区分可选结果和执行失败。
  - `RISK-0066`：代码用 null 表达缺失或失败，需逐方法确认是否应使用空集合、Optional、明确结果或异常合同。
  - `RISK-0067`：Boolean 配置可能为 null，自动拆箱会在启动时触发空指针。
  - `RISK-0163`：策略合同的本地下载实现直接返回 null；现代实现必须返回明确结果或抛出有语义的异常。
  - `RISK-0177`：枚举查找返回 null 会把失败延后；推荐明确异常、Optional 或受控 UNKNOWN 值。
  - `RISK-0270`：任务业务方法直接返回 null，破坏任务适配器的结果合同。
  - `RISK-0289`：broadcast 未检查会话列表是否为 null，未知会议会触发空指针。
  - `RISK-0290`：无会话时返回空用户对象会混淆未登录与已登录但字段为空两种状态。
- 代表符号：
  - `com.tdh.bdzz.util.AESUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/AESUtils.java`
  - `com.tdh.bdzz.service.impl.AiXntjServiceImpl`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/AiXntjServiceImpl.java`
  - `com.tdh.bdzz.config.DataSourceConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/DataSourceConfig.java`
  - `com.tdh.bdzz.download.LocalDownloader`：`dzzz-app/src/main/java/com/tdh/bdzz/download/LocalDownloader.java`
  - `com.tdh.bdzz.enums.AJFL`：`dzzz-app/src/main/java/com/tdh/bdzz/enums/AJFL.java`

### JAVA-RISK-008 原始类型与非类型化合同

- 类型：`review-risk-pattern`；推荐阶段：基础。
- 项目证据：32 个文件；原始风险：6 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-LANG-006`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0147`：submitTask、Callable 和 Future 使用原始类型，丢失编译期类型约束。
  - `RISK-0164`：原始类型和拒绝处理中的强制类型转换依赖内部任务形状，错误任务会导致转换异常。
  - `RISK-0204`：分页参数使用原始 Page 类型，丢失记录类型信息；现代示例应使用带泛型的分页合同。
  - `RISK-0214`：公开 Mapper 方法返回 Map 投影，字段名和类型缺少编译期合同；稳定查询应使用明确投影类型。
  - `RISK-0227`：集合字段缺少泛型参数，读取方需要不安全强制转换并失去元素类型合同。
  - `RISK-0285`：原始类型实例化丢失泛型约束，现代写法应使用 new ThreadLocal<>()。
- 代表符号：
  - `com.tdh.bdzz.config.Pdf2ImageComparablePriorityTaskPoolExecutor`：`dzzz-app/src/main/java/com/tdh/bdzz/config/Pdf2ImageComparablePriorityTaskPoolExecutor.java`
  - `com.tdh.bdzz.dao.CaseMapper`：`dzzz-app/src/main/java/com/tdh/bdzz/dao/CaseMapper.java`
  - `com.tdh.bdzz.dao.AnnotationsMapper`：`dzzz-app/src/main/java/com/tdh/bdzz/dao/AnnotationsMapper.java`
  - `com.tdh.bdzz.vo.voice2text.CheckBljjVO`：`dzzz-app/src/main/java/com/tdh/bdzz/vo/voice2text/CheckBljjVO.java`
  - `com.tdh.bdzz.context.TableShardContext`：`dzzz-app/src/main/java/com/tdh/bdzz/context/TableShardContext.java`

### JAVA-RISK-009 Bean Validation 约束未被触发

- 类型：`review-risk-pattern`；推荐阶段：中级。
- 项目证据：153 个文件；原始风险：2 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-FRAMEWORK-009`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0018`：请求体没有触发 Bean Validation；若 DTO 声明约束，当前入口不会自动校验。
  - `RISK-0037`：模型声明了校验约束，但当前 Controller 参数中没有直接 @Valid/@Validated 触发证据；需继续核对父对象级联或手动 Validator 调用。
- 代表符号：
  - `com.tdh.bdzz.controller.BaseOuterController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/BaseOuterController.java`
  - `com.tdh.bdzz.bo.ZnfzNoticeBO`：`dzzz-app/src/main/java/com/tdh/bdzz/bo/ZnfzNoticeBO.java`
  - `com.tdh.bdzz.controller.BlmbController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/BlmbController.java`
  - `com.tdh.bdzz.controller.CameraController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/CameraController.java`
  - `com.tdh.bdzz.controller.CaseController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/CaseController.java`

### JAVA-RISK-010 自定义校验器与非标准约束语义

- 类型：`review-risk-pattern`；推荐阶段：中级。
- 项目证据：473 个文件；原始风险：6 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-LANG-007`、`JAVA-FRAMEWORK-009`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0005`：项目私有校验器的空值、类型和错误消息语义必须由显式测试固定，不能当作标准约束教授。
  - `RISK-0054`：@Inherited 只影响类级注解继承，对当前字段、方法或参数目标不产生继承效果。
  - `RISK-0154`：校验器对非预期类型可能直接通过，调用方不能把类型错误当作已验证。
  - `RISK-0161`：实现假设输入一定是对象数组或集合；其他对象与基本类型数组需要单独定义行为。
  - `RISK-0273`：项目私有注解与 Jakarta Validation 标准名称重合，导入错误时会得到不同校验语义。
  - `RISK-0318`：代码使用 Hibernate Validator 旧的提供方专属约束；现代示例应使用 Jakarta Validation 标准约束。
- 代表符号：
  - `com.tdh.bdzz.annoation.impl.CltjrSfValidator`：`dzzz-app/src/main/java/com/tdh/bdzz/annoation/impl/CltjrSfValidator.java`
  - `com.tdh.bdzz.annoation.AutoValid`：`dzzz-app/src/main/java/com/tdh/bdzz/annoation/AutoValid.java`
  - `com.tdh.bdzz.validator.MinValidator`：`dzzz-app/src/main/java/com/tdh/bdzz/validator/MinValidator.java`
  - `com.tdh.bdzz.validator.NotNullElementValidator`：`dzzz-app/src/main/java/com/tdh/bdzz/validator/NotNullElementValidator.java`
  - `com.tdh.bdzz.annoation.Constraint`：`dzzz-app/src/main/java/com/tdh/bdzz/annoation/Constraint.java`

### JAVA-RISK-011 异常吞没、宽泛捕获与不透明传播

- 类型：`review-risk-pattern`；推荐阶段：中级。
- 项目证据：400 个文件；原始风险：13 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-LANG-009`、`JAVA-STDLIB-033`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0011`：空 catch 会丢失媒体编码失败，至少应记录、传播或终止当前任务。
  - `RISK-0110`：处理方法声明宽泛 Exception 或 Throwable，接口异常合同不明确。
  - `RISK-0117`：Controller 或管线组件广泛捕获顶层异常，容易混淆可恢复错误、编程错误和统一异常处理职责。
  - `RISK-0140`：发送异常被静默吞掉，运行故障无法观测。
  - `RISK-0144`：日志配置 setter 隐藏受检异常；配置失败应保留可诊断边界。
  - `RISK-0171`：业务服务捕获顶层异常，需区分可恢复失败、编程错误和统一异常边界。
  - `RISK-0211`：宽泛捕获会合并不同失败语义；恢复、重试或转换前应区分可处理异常。
  - `RISK-0213`：postHandle 静默吞掉异常，使令牌注入和视图准备失败不可诊断。
  - `RISK-0221`：空 catch 丢失失败信息；必须传播、转换或记录可定位上下文。
  - `RISK-0230`：公开业务方法声明宽泛 Exception 或 Throwable，调用合同和恢复策略不明确。
  - `RISK-0233`：finally 中日志和文件写入可能覆盖原始请求异常，并把请求结构持久化到本地。
  - `RISK-0253`：宽泛捕获合并了不同失败语义；现代示例应捕获可处理异常并保留 cause。
  - `RISK-0304`：宽泛捕获合并了不同失败语义；恢复或转换前应区分可处理异常。
- 代表符号：
  - `com.tdh.bdzz.factories.flv.ConverterFactories`：`dzzz-app/src/main/java/com/tdh/bdzz/factories/flv/ConverterFactories.java`
  - `com.tdh.bdzz.controller.BaseOuterController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/BaseOuterController.java`
  - `com.tdh.bdzz.controller.BlmbController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/BlmbController.java`
  - `com.tdh.bdzz.config.websocket.server.LoggingWSServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingWSServer.java`
  - `com.tdh.bdzz.rolling.InnerProjectRollingFileAppender`：`dzzz-app/src/main/java/com/tdh/bdzz/rolling/InnerProjectRollingFileAppender.java`

### JAVA-RISK-012 HTTP 错误状态、错误码与详情泄露

- 类型：`review-risk-pattern`；推荐阶段：中级。
- 项目证据：17 个文件；原始风险：4 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-ENGINEERING-006`、`JAVA-FRAMEWORK-008`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0078`：兜底处理 Exception 会覆盖大量错误类型，必须按稳定错误合同区分可预期与系统异常。
  - `RISK-0149`：异常处理只返回响应体而未声明 HTTP 状态，客户端可能无法按协议区分失败。
  - `RISK-0206`：直接返回异常或字段消息需要稳定错误码和去敏边界，不能暴露内部实现文本。
  - `RISK-0234`：把底层异常消息直接写入客户端响应，可能泄露实现细节且造成不稳定错误合同。
- 代表符号：
  - `com.tdh.bdzz.exception.GloableExceptionHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/exception/GloableExceptionHandler.java`
  - `com.tdh.bdzz.controller.BaseOuterController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/BaseOuterController.java`
  - `com.tdh.bdzz.controller.ClientZzController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/ClientZzController.java`
  - `com.tdh.bdzz.controller.CommController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/CommController.java`
  - `com.tdh.bdzz.controller.FileController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/FileController.java`

### JAVA-RISK-013 切面扩大行为范围或改写控制流

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：3 个文件；原始风险：3 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-FRAMEWORK-004`、`JAVA-ENGINEERING-006`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0048`：环绕通知捕获 Throwable 后返回 null，会把失败改写为看似成功的空结果。
  - `RISK-0061`：切面重新包装异常会改变上层按类型处理的合同，必须保留 cause 并明确映射边界。
  - `RISK-0169`：切点覆盖全部业务实现公开方法，新增方法会自动进入校验和日志横切行为。
- 代表符号：
  - `com.tdh.bdzz.aop.AppAspect`：`dzzz-app/src/main/java/com/tdh/bdzz/aop/AppAspect.java`
  - `com.tdh.bdzz.aop.DzzzAspect`：`dzzz-app/src/main/java/com/tdh/bdzz/aop/DzzzAspect.java`
  - `com.tdh.bdzz.aop.PointCuts`：`dzzz-app/src/main/java/com/tdh/bdzz/aop/PointCuts.java`

### JAVA-RISK-014 敏感数据进入日志与字符串化输出

- 类型：`review-risk-pattern`；推荐阶段：中级。
- 项目证据：170 个文件；原始风险：18 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-FRAMEWORK-026`、`JAVA-ENGINEERING-026`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0010`：登录请求对象被完整写入日志，需显式排除口令和身份凭据。
  - `RISK-0023`：账号密码登录日志把口令字段作为用户标识输出，必须按秘密字段处理。
  - `RISK-0038`：日志记录完整广播消息，可能包含业务或个人数据。
  - `RISK-0045`：Lombok 自动生成的 toString 可能输出敏感字段，必须显式排除或避免记录整个对象。
  - `RISK-0063`：日志可能包含密码、存储配置、预签名 URL 或许可证签名，必须去敏。
  - `RISK-0084`：日志输出完整消息，可能泄露协作文档内容。
  - `RISK-0128`：切面直接记录参数或返回对象，必须先建立字段级去敏与大小限制。
  - `RISK-0159`：Data 生成的 toString 可能把访问凭据和密钥写入日志，敏感配置对象应显式排除秘密字段。
  - `RISK-0167`：校验错误的 toString 会输出原始值，日志链路可能泄露业务或敏感输入。
  - `RISK-0186`：日志直接输出访问密钥、口令或令牌会扩大泄露面；现代示例只记录脱敏标识和必要诊断上下文。
  - `RISK-0224`：显式 toString 引用了敏感字段，日志和异常路径可能泄露凭据。
  - `RISK-0229`：生成 token 的完整入参与返回对象进入日志，可能暴露身份信息或令牌。
  - `RISK-0249`：修改密码请求对象被完整序列化到日志，可能暴露旧密码和新密码。
  - `RISK-0271`：JWT 校验失败时把完整 Authorization token 写入错误日志。
  - `RISK-0277`：直接记录完整消息可能泄露业务数据，日志应按字段和敏感等级控制。
  - `RISK-0291`：日志输出完整 token、解析身份、数据库口令和完整登录结果。
  - `RISK-0297`：Lombok 生成的 toString 可能输出密码或访问凭据；应排除敏感字段并禁止记录凭据对象。
  - `RISK-0300`：启动日志直接输出配置值，后续课程必须强调配置日志去敏。
- 代表符号：
  - `com.tdh.bdzz.controller.appFront.FrontLoginController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/appFront/FrontLoginController.java`
  - `com.tdh.bdzz.controller.FybController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/FybController.java`
  - `com.tdh.bdzz.config.websocket.server.ClientZzWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientZzWsServer.java`
  - `com.tdh.bdzz.bo.AsConferenceBO`：`dzzz-app/src/main/java/com/tdh/bdzz/bo/AsConferenceBO.java`
  - `com.tdh.bdzz.storage.MossClientUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/storage/MossClientUtil.java`

### JAVA-RISK-015 凭据模型、回显与生命周期过宽

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：174 个文件；原始风险：6 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-ENGINEERING-002`、`JAVA-ENGINEERING-026`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0065`：生成的 token 被放入视图模型，需防止模板、页面源码和前端日志泄露。
  - `RISK-0220`：模型承载密码、令牌或应用密钥字段，禁止整体记录、回显或进入异常消息，并应明确最短生命周期。
  - `RISK-0231`：模型包含身份、令牌或密钥类字段，禁止整体日志输出并应缩短生命周期。
  - `RISK-0263`：配置模型包含访问密钥或令牌，禁止整体日志输出并应缩短生命周期。
  - `RISK-0275`：通用静态门面暴露大量密钥和令牌配置；现代设计应类型化、最小授权并避免日志泄露。
  - `RISK-0310`：认证模型承载口令、派生值或令牌；不得进入普通日志、缓存或无边界序列化。
- 代表符号：
  - `com.tdh.bdzz.handler.LoginHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/handler/LoginHandler.java`
  - `com.tdh.bdzz.bo.AsConferenceBO`：`dzzz-app/src/main/java/com/tdh/bdzz/bo/AsConferenceBO.java`
  - `com.tdh.bdzz.timer.bo.AnalysisDataProgress`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/bo/AnalysisDataProgress.java`
  - `com.tdh.bdzz.upload.OssServer`：`dzzz-app/src/main/java/com/tdh/bdzz/upload/OssServer.java`
  - `com.tdh.bdzz.util.TuDmKzUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/TuDmKzUtil.java`

### JAVA-RISK-016 源码硬编码秘密与不可轮换凭据

- 类型：`review-risk-pattern`；推荐阶段：中级。
- 项目证据：11 个文件；原始风险：4 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-ENGINEERING-021`、`JAVA-ENGINEERING-026`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0043`：外部平台 APPKEY 硬编码在源码中，必须迁移到受控秘密存储并支持轮换。
  - `RISK-0119`：调用令牌接口时再次硬编码客户端密钥，扩大秘密复制与泄露面。
  - `RISK-0190`：源码内嵌私钥、签名密钥或密码无法安全轮换；现代示例必须使用受控密钥来源。
  - `RISK-0223`：多个客户端共享密钥硬编码在源码中，不能作为现代令牌颁发示例。
- 代表符号：
  - `com.tdh.bdzz.service.HjptApiService`：`dzzz-app/src/main/java/com/tdh/bdzz/service/HjptApiService.java`
  - `com.tdh.bdzz.controller.TsFileSignController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/TsFileSignController.java`
  - `com.tdh.bdzz.constant.EncryptConstant`：`dzzz-app/src/main/java/com/tdh/bdzz/constant/EncryptConstant.java`
  - `com.tdh.bdzz.controller.TokenController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/TokenController.java`
  - `com.tdh.bdzz.constant.JzglConstant`：`dzzz-app/src/main/java/com/tdh/bdzz/constant/JzglConstant.java`

### JAVA-RISK-017 匿名面、认证排除与认证绕过

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：21 个文件；原始风险：5 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-ENGINEERING-025`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0020`：令牌颁发入口匿名开放，必须依赖独立且可轮换的客户端认证和限流。
  - `RISK-0028`：登录服务被显式设置为不校验口令，并允许请求参数触发模拟登录路径。
  - `RISK-0029`：只要 servletPath 包含 commaction 就跳过认证，范围大于精确路由白名单。
  - `RISK-0090`：匿名放行扩大认证例外面，必须逐入口确认业务必要性、授权替代和滥用防护。
  - `RISK-0101`：认证排除列表巨大且与路由安全强耦合，新增路由容易发生配置漂移。
- 代表符号：
  - `com.tdh.bdzz.controller.TokenController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/TokenController.java`
  - `com.tdh.bdzz.filter.TokenLoginFilter`：`dzzz-app/src/main/java/com/tdh/bdzz/filter/TokenLoginFilter.java`
  - `com.tdh.bdzz.handler.LoginHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/handler/LoginHandler.java`
  - `com.tdh.bdzz.controller.CommController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/CommController.java`
  - `com.tdh.bdzz.config.SpringMvcConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/SpringMvcConfig.java`

### JAVA-RISK-018 不可信身份输入与缺失资源授权

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：11 个文件；原始风险：11 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-ENGINEERING-025`、`JAVA-FRAMEWORK-011`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0008`：客户端类型和排期来自 URL，文件中未见身份校验；不能把路径参数当作授权依据。
  - `RISK-0055`：角色与排期来自 URL，静态推送按字符串角色选会话，文件中未见身份授权绑定。
  - `RISK-0060`：直接把 username 请求头当作邮戳操作身份，必须由可信认证上下文提供主体。
  - `RISK-0086`：直接把 username 请求头当作签名操作身份，必须由可信认证上下文提供主体。
  - `RISK-0142`：会议标识和消息来自客户端，文件中未见认证、授权或消息边界验证。
  - `RISK-0189`：服务端根据未认证的连接角色和客户端协议消息建立授权分组，文件中未见身份绑定。
  - `RISK-0210`：会议标识和消息由客户端提供，文件中未见认证、授权或消息大小校验。
  - `RISK-0216`：路径参数和消息控制业务分组与广播，文件中未见身份授权校验。
  - `RISK-0217`：路径身份和客户端消息直接驱动广播，文件中未见授权或消息边界验证。
  - `RISK-0240`：角色和排期来自连接或消息，文件中未见认证授权校验。
  - `RISK-0242`：端点直接暴露服务器日志，文件中未见认证或授权检查，属于高敏感运维能力。
- 代表符号：
  - `com.tdh.bdzz.config.websocket.server.AppFrontYyzxWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/AppFrontYyzxWsServer.java`
  - `com.tdh.bdzz.config.websocket.server.Voice2TextWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/Voice2TextWsServer.java`
  - `com.tdh.bdzz.controller.PdfjsStampController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/PdfjsStampController.java`
  - `com.tdh.bdzz.controller.PdfjsSignatureController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/PdfjsSignatureController.java`
  - `com.tdh.bdzz.config.websocket.server.fyb.jdyh.NoteSignWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/fyb/jdyh/NoteSignWsServer.java`

### JAVA-RISK-019 令牌、签名与许可证校验未闭环或 fail-open

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：5 个文件；原始风险：8 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-ENGINEERING-026`、`JAVA-ENGINEERING-037`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0009`：时间窗口校验方法存在但主登录流程没有调用，令牌新鲜度未形成闭环。
  - `RISK-0014`：是否解密由客户端 encryFlag 控制，不能替代传输层安全和服务端认证。
  - `RISK-0030`：过期和签名失败后的状态转换需要单独验证；不能把旧实现直接作为正确授权示例。
  - `RISK-0053`：许可证缺失时直接进入运行态属于 fail-open；现代授权边界应在缺少可信授权时拒绝受保护能力。
  - `RISK-0153`：签名失败后仍发送包含 null 签名的授权头，应让请求明确失败。
  - `RISK-0207`：许可证密码学是项目兼容合同；现代课程不把解密式旧协议作为新设计推荐。
  - `RISK-0232`：校验值只由用户名与时间做 MD5，没有服务端秘密，不能证明请求来源。
  - `RISK-0251`：startsWith 检查后使用 replace 会删除路径中所有同名片段，签名规范化应只处理明确前缀。
- 代表符号：
  - `com.tdh.bdzz.filter.TokenLoginFilter`：`dzzz-app/src/main/java/com/tdh/bdzz/filter/TokenLoginFilter.java`
  - `com.tdh.bdzz.filter.DesFilter`：`dzzz-app/src/main/java/com/tdh/bdzz/filter/DesFilter.java`
  - `tdh.platform.component.license.lic.License`：`dzzz-app/src/main/java/tdh/platform/component/license/lic/License.java`
  - `tdh.platform.component.license.lic.impl.LicFactoryImpl`：`dzzz-app/src/main/java/tdh/platform/component/license/lic/impl/LicFactoryImpl.java`
  - `com.tdh.bdzz.config.HeaderRequestInterceptor`：`dzzz-app/src/main/java/com/tdh/bdzz/config/HeaderRequestInterceptor.java`

### JAVA-RISK-020 弱密码学、不安全 TLS 与非安全随机数

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：12 个文件；原始风险：4 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-STDLIB-027`、`JAVA-STDLIB-028`、`JAVA-STDLIB-032`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0077`：请求参数与请求体使用旧 3DES 兼容流程，课程只能作为迁移反例。
  - `RISK-0129`：信任全部证书或主机名会失去服务端身份校验；现代客户端必须使用可信证书链和主机名校验。
  - `RISK-0134`：MD5、SHA-1、DES/3DES 或 RSA PKCS#1 v1.5 只作为兼容证据，不进入现代推荐方案。
  - `RISK-0317`：Random 或 Math.random 不适合验证码、令牌和安全标识；安全用途使用 SecureRandom。
- 代表符号：
  - `com.tdh.bdzz.filter.DesFilter`：`dzzz-app/src/main/java/com/tdh/bdzz/filter/DesFilter.java`
  - `com.tdh.bdzz.util.SSLClient`：`dzzz-app/src/main/java/com/tdh/bdzz/util/SSLClient.java`
  - `com.tdh.bdzz.util.AESUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/AESUtils.java`
  - `com.tdh.bdzz.util.CodeGenerator`：`dzzz-app/src/main/java/com/tdh/bdzz/util/CodeGenerator.java`
  - `com.tdh.bdzz.util.CommonUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/CommonUtil.java`

### JAVA-RISK-021 不可信反序列化与旧序列化合同

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：4 个文件；原始风险：4 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-STDLIB-021`、`JAVA-FRAMEWORK-018`、`JAVA-FRAMEWORK-019`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0042`：Object 级 Fastjson 序列化绑定旧库与类型策略，现代示例必须明确可信类型、兼容性和反序列化安全边界。
  - `RISK-0095`：Java 原生反序列化会实例化输入流中的对象；不能用于不可信输入，推荐显式数据格式和类型白名单。
  - `RISK-0111`：持久化格式绑定旧 Fastjson；课程只保留兼容说明，现代示例使用受控 Jackson 类型。
  - `RISK-0139`：同一模型混用多套序列化注解，字段命名、忽略规则和兼容策略可能产生分歧。
- 代表符号：
  - `com.tdh.bdzz.config.RedisConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/RedisConfig.java`
  - `com.tdh.bdzz.util.CommonUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/CommonUtil.java`
  - `com.tdh.bdzz.handler.FastJsonTypeHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/handler/FastJsonTypeHandler.java`
  - `com.tdh.bdzz.eo.tsaiassistant.TsjdAnalyzeStatusEO`：`dzzz-app/src/main/java/com/tdh/bdzz/eo/tsaiassistant/TsjdAnalyzeStatusEO.java`

### JAVA-RISK-022 HTTP 方法、请求体与 Servlet 流合同不完整

- 类型：`review-risk-pattern`；推荐阶段：中级。
- 项目证据：30 个文件；原始风险：5 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-FRAMEWORK-008`、`JAVA-FRAMEWORK-010`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0105`：请求没有 Content-Type 时直接 toString 会触发空指针。
  - `RISK-0113`：ServletInputStream 始终报告未完成且未就绪，也未实现异步 ReadListener 合同。
  - `RISK-0120`：删除操作未限制 HTTP method，现代接口应使用 DeleteMapping 或显式 DELETE。
  - `RISK-0124`：按 Content-Length 分配并单次读取请求体，不能保证读满，也不覆盖分块传输。
  - `RISK-0178`：方法级 RequestMapping 未限制 HTTP method，现代接口应使用语义明确的专用映射。
- 代表符号：
  - `com.tdh.bdzz.config.HeaderRequestInterceptor`：`dzzz-app/src/main/java/com/tdh/bdzz/config/HeaderRequestInterceptor.java`
  - `com.tdh.bdzz.filter.BodyRequestWrapper`：`dzzz-app/src/main/java/com/tdh/bdzz/filter/BodyRequestWrapper.java`
  - `com.tdh.bdzz.controller.PdfjsStampController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/PdfjsStampController.java`
  - `com.tdh.bdzz.filter.AccessFilter`：`dzzz-app/src/main/java/com/tdh/bdzz/filter/AccessFilter.java`
  - `com.tdh.bdzz.controller.ClientZzController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/ClientZzController.java`

### JAVA-RISK-023 过滤链、黑名单与输入变异式安全控制

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：3 个文件；原始风险：3 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-FRAMEWORK-010`、`JAVA-ENGINEERING-027`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0135`：通过替换输入字符处理 XSS 会改变业务数据，不能替代按输出上下文编码。
  - `RISK-0247`：关键字黑名单不能替代参数绑定和上下文输出编码，只能作为补充检测层。
  - `RISK-0261`：下游抛出异常后再次调用 filterChain，可能让同一请求重复执行业务。
- 代表符号：
  - `com.tdh.bdzz.filter.XssHttpServletRequestWrapper`：`dzzz-app/src/main/java/com/tdh/bdzz/filter/XssHttpServletRequestWrapper.java`
  - `tdh.commons.security.web.utils.SqlFilterUtil`：`dzzz-app/src/main/java/tdh/commons/security/web/utils/SqlFilterUtil.java`
  - `com.tdh.bdzz.filter.AccessFilter`：`dzzz-app/src/main/java/com/tdh/bdzz/filter/AccessFilter.java`

### JAVA-RISK-024 CORS、动态视图与 API 文档暴露边界

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：6 个文件；原始风险：7 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-FRAMEWORK-008`、`JAVA-FRAMEWORK-013`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0076`：用 Controller 覆盖路径只处理访问表象，不等同于禁用 Swagger Bean、扫描和文档生成。
  - `RISK-0109`：任意源与凭据组合不是推荐配置，应明确允许的源并按版本使用 origin pattern。
  - `RISK-0168`：文档能力仍被显式启用；若生产不允许访问，应按环境禁用配置而非仅覆盖 URL。
  - `RISK-0238`：旧 Swagger 在应用入口全局启用，不能把额外 Controller 返回 404 当作关闭文档生成。
  - `RISK-0259`：路径变量参与视图名选择，课程示例应使用明确白名单，避免任意模板名解析。
  - `RISK-0299`：Springfox Swagger 2 是旧项目兼容内容，现代课程应介绍当前 OpenAPI 方案。
  - `RISK-0309`：任意源与凭据组合不是推荐 CORS 配置，应列出可信源。
- 代表符号：
  - `com.tdh.bdzz.config.SwaggerAccessBlockController`：`dzzz-app/src/main/java/com/tdh/bdzz/config/SwaggerAccessBlockController.java`
  - `com.tdh.bdzz.config.CorsConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/CorsConfig.java`
  - `com.tdh.bdzz.config.SwaggerConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/SwaggerConfig.java`
  - `com.tdh.DzzzAreaApplication`：`dzzz-app/src/main/java/com/tdh/DzzzAreaApplication.java`
  - `com.tdh.bdzz.controller.ViewController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/ViewController.java`

### JAVA-RISK-025 文件路径、上传与归档展开边界

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：38 个文件；原始风险：6 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-STDLIB-015`、`JAVA-STDLIB-017`、`JAVA-ENGINEERING-029`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0013`：把业务标识直接拼接到文件路径，调用边界必须先验证路径片段，防止目录穿越。
  - `RISK-0073`：本地或远程路径跨越调用边界；现代实现必须限定根目录并验证规范化后的目标。
  - `RISK-0087`：客户端可控制 logKey 并参与文件路径拼接，必须使用允许列表防止读取任意日志路径。
  - `RISK-0194`：压缩输入直接展开到内存且没有条目或总量上限，现代示例必须限制展开大小。
  - `RISK-0196`：文件上传入口需要在服务端同时约束大小、类型、文件名、存储路径和恶意内容，不能只依赖客户端。
  - `RISK-0209`：请求记录目录硬编码为 Windows 路径，缺少外部化配置和跨平台语义。
- 代表符号：
  - `com.tdh.bdzz.config.SysConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/SysConfig.java`
  - `com.tdh.bdzz.download.DownloadUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/download/DownloadUtil.java`
  - `com.tdh.bdzz.config.websocket.server.LoggingWSServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingWSServer.java`
  - `com.tdh.bdzz.util.CommonUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/CommonUtil.java`
  - `com.tdh.bdzz.controller.BlmbController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/BlmbController.java`

### JAVA-RISK-026 无界整载荷缓冲与慢消费者背压

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：14 个文件；原始风险：4 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-STDLIB-013`、`JAVA-ENGINEERING-024`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0019`：把剩余文件长度转换为 int 并一次性分配数组，大文件或长时间未消费时可能溢出或耗尽内存。
  - `RISK-0049`：整份文档、图片或响应进入内存时必须限制输入大小并优先流式处理。
  - `RISK-0127`：文件内容整体驻留内存；课程必须说明大小上限，并优先使用有界流式传输。
  - `RISK-0278`：媒体分片通过可增长内存缓冲区转发；现代实现必须限制单次缓冲大小并定义慢订阅者背压。
- 代表符号：
  - `com.tdh.bdzz.config.websocket.server.LoggingFileTailReader`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingFileTailReader.java`
  - `com.tdh.bdzz.util.CommonUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/CommonUtil.java`
  - `com.tdh.bdzz.download.DownloadResponse`：`dzzz-app/src/main/java/com/tdh/bdzz/download/DownloadResponse.java`
  - `com.tdh.bdzz.factories.flv.ConverterFactories`：`dzzz-app/src/main/java/com/tdh/bdzz/factories/flv/ConverterFactories.java`
  - `com.tdh.bdzz.download.MossDownloader`：`dzzz-app/src/main/java/com/tdh/bdzz/download/MossDownloader.java`

### JAVA-RISK-027 可关闭资源所有权与异常路径清理

- 类型：`review-risk-pattern`；推荐阶段：中级。
- 项目证据：15 个文件；原始风险：3 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-LANG-014`、`JAVA-STDLIB-014`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0082`：Files.walk 返回的 Stream 没有显式关闭，可能长期占用目录句柄。
  - `RISK-0132`：文件或 PDF 资源依靠显式 close，异常路径的所有权需要单独核对。
  - `RISK-0244`：代码直接创建可关闭 I/O 资源，需逐调用点确认 try-with-resources 或明确所有权转移。
- 代表符号：
  - `com.tdh.bdzz.filter.AccessFilter`：`dzzz-app/src/main/java/com/tdh/bdzz/filter/AccessFilter.java`
  - `com.tdh.bdzz.service.impl.TsFileSignNewDragServiceImplTest`：`dzzz-app/src/test/java/com/tdh/bdzz/service/impl/TsFileSignNewDragServiceImplTest.java`
  - `com.tdh.bdzz.service.HmBurnService`：`dzzz-app/src/main/java/com/tdh/bdzz/service/HmBurnService.java`
  - `com.tdh.bdzz.service.impl.BlockChainServiceImpl`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/BlockChainServiceImpl.java`
  - `com.tdh.bdzz.service.impl.FgdServiceImpl`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FgdServiceImpl.java`

### JAVA-RISK-028 网络客户端生命周期、超时与连接状态

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：16 个文件；原始风险：7 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-ENGINEERING-018`、`JAVA-ENGINEERING-023`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0116`：SSL 客户端初始化失败后直接退出进程，且控制流仍保留 nullable HttpClient。
  - `RISK-0130`：外部客户端和响应必须限定所有权、关闭、超时、重试与幂等边界。
  - `RISK-0157`：外部客户端被创建但当前文件没有可见关闭；所有权和连接回收需要显式合同。
  - `RISK-0170`：Spring 组件持有可变 FTPClient；并发调用和返回流会共享连接状态。
  - `RISK-0173`：快速失败客户端只设置连接超时，没有设置读取超时，名称不能代表完整超时策略。
  - `RISK-0264`：网络助手需统一定义连接池、超时、响应关闭、重试和取消，不能由每个静态方法自行决定。
  - `RISK-0319`：代码直接创建 CloseableHttpClient，需确认连接池复用、超时配置和关闭责任。
- 代表符号：
  - `com.tdh.bdzz.config.RestConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/RestConfig.java`
  - `com.tdh.bdzz.util.NlzxUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/NlzxUtil.java`
  - `com.tdh.bdzz.download.SftpDownloader`：`dzzz-app/src/main/java/com/tdh/bdzz/download/SftpDownloader.java`
  - `com.tdh.bdzz.storage.FtpWork`：`dzzz-app/src/main/java/com/tdh/bdzz/storage/FtpWork.java`
  - `com.tdh.bdzz.util.CxfClientUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/CxfClientUtil.java`

### JAVA-RISK-029 启动关键路径、进程控制与 JVM 全局副作用

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：23 个文件；原始风险：6 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-FRAMEWORK-001`、`JAVA-STDLIB-018`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0006`：启动回调直接加载缓存，会把数据库或文件失败带入应用就绪关键路径。
  - `RISK-0059`：启动回调修改进程级 Locale 和 JAXP 实现，影响整个 JVM，且引用 JDK 内部实现类。
  - `RISK-0079`：缺少配置时直接 System.exit，不利于测试和容器化生命周期，应改为可诊断的启动失败。
  - `RISK-0150`：启动回调直接初始化外部组件；失败策略、幂等性和关闭责任需要明确。
  - `RISK-0162`：@PostConstruct 中执行外部初始化会进入 Bean 创建关键路径，必须明确超时、失败和幂等策略。
  - `RISK-0267`：启动系统进程涉及命令输入、超时、输出消费、退出码和进程清理边界。
- 代表符号：
  - `com.tdh.bdzz.cache.DzzzDxpzCacheLoader`：`dzzz-app/src/main/java/com/tdh/bdzz/cache/DzzzDxpzCacheLoader.java`
  - `com.tdh.bdzz.config.AppStarter`：`dzzz-app/src/main/java/com/tdh/bdzz/config/AppStarter.java`
  - `com.tdh.bdzz.context.InitializeYjbjWord`：`dzzz-app/src/main/java/com/tdh/bdzz/context/InitializeYjbjWord.java`
  - `com.tdh.bdzz.timer.handler.hyJzDataSync.HyJzDataSyncHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/hyJzDataSync/HyJzDataSyncHandler.java`
  - `com.tdh.bdzz.util.SystemMonitorUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/SystemMonitorUtil.java`

### JAVA-RISK-030 裸线程、临时执行器与拒绝策略失控

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：27 个文件；原始风险：8 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-STDLIB-023`、`JAVA-ENGINEERING-016`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0002`：长循环占用共享任务执行器，捕获异常后继续且未恢复中断状态，关闭和资源隔离需专门设计。
  - `RISK-0036`：业务方法临时创建 Executor，需由容器统一管理容量、命名、拒绝策略和关闭。
  - `RISK-0040`：裸线程或自行创建的执行器需要明确队列、拒绝、取消、关闭和上下文传播合同。
  - `RISK-0071`：自建线程池没有与 Spring 销毁生命周期绑定，文件中未见 shutdown。
  - `RISK-0091`：直接继承 Thread 绕过受管执行器；容量、取消、命名和关闭责任不可见。
  - `RISK-0133`：直接创建裸线程绕过应用线程池的容量、命名、关闭、上下文和异常治理。
  - `RISK-0269`：CallerRunsPolicy 会把被拒绝任务转移到提交线程执行，必须理解其对 Web 请求线程和吞吐的反压影响。
  - `RISK-0281`：业务方法直接创建线程，缺少统一线程池容量、上下文传播、关闭和失败观测。
- 代表符号：
  - `com.tdh.bdzz.config.websocket.server.LoggingWSServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingWSServer.java`
  - `com.tdh.bdzz.service.impl.Fyb4WindowsImpl`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/Fyb4WindowsImpl.java`
  - `com.tdh.bdzz.util.CommonUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/CommonUtil.java`
  - `com.tdh.bdzz.config.Pdf2ImageComparablePriorityTaskPoolExecutor`：`dzzz-app/src/main/java/com/tdh/bdzz/config/Pdf2ImageComparablePriorityTaskPoolExecutor.java`
  - `com.tdh.bdzz.factories.flv.ConverterFactories`：`dzzz-app/src/main/java/com/tdh/bdzz/factories/flv/ConverterFactories.java`

### JAVA-RISK-031 异步事务、上下文与失败观测断裂

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：5 个文件；原始风险：3 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-FRAMEWORK-005`、`JAVA-FRAMEWORK-007`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0118`：@Async 与事务分别依赖 Spring 代理；事务不会自动跨线程传播，必须按入口方法确认边界。
  - `RISK-0215`：异步链没有完成阶段错误处理；调用返回后发生的失败可能只留在未观察的 Future 中。
  - `RISK-0314`：线程上下文只在 MVC 请求完成时清理，异步线程仍需在自身 finally 中清理。
- 代表符号：
  - `com.tdh.bdzz.timer.JzDataSyncTask`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/JzDataSyncTask.java`
  - `com.tdh.bdzz.ws.ReTransmissionService`：`dzzz-app/src/main/java/com/tdh/bdzz/ws/ReTransmissionService.java`
  - `com.tdh.bdzz.handler.ThreadHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/handler/ThreadHandler.java`
  - `com.tdh.bdzz.timer.handler.clearExpireData.DealBusinessDataHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/clearExpireData/DealBusinessDataHandler.java`
  - `com.tdh.bdzz.timer.service.TslxDataSyncService`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/service/TslxDataSyncService.java`

### JAVA-RISK-032 请求与 ThreadLocal 上下文清理和传播责任

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：85 个文件；原始风险：5 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-STDLIB-026`、`JAVA-ENGINEERING-017`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0096`：ThreadLocal 值必须在同一调用边界的 finally 中清理，不能只暴露可选 clean 方法。
  - `RISK-0125`：业务服务静态读取当前请求或用户上下文，隐藏输入并增加异步传播与测试难度。
  - `RISK-0193`：ThreadLocal 上下文必须在 finally 中清理，并在异步边界显式复制或重新建立。
  - `RISK-0237`：静态读取当前请求和会话形成环境依赖，异步线程与无请求调用必须显式处理。
  - `RISK-0293`：分表或分库上下文清理被注释，线程复用时需要由可证明的 finally 边界负责清理。
- 代表符号：
  - `com.tdh.bdzz.context.TableShardContext`：`dzzz-app/src/main/java/com/tdh/bdzz/context/TableShardContext.java`
  - `com.tdh.bdzz.service.CourtService`：`dzzz-app/src/main/java/com/tdh/bdzz/service/CourtService.java`
  - `com.tdh.bdzz.service.tsaiassistant.TsAiTraceContextHolder`：`dzzz-app/src/main/java/com/tdh/bdzz/service/tsaiassistant/TsAiTraceContextHolder.java`
  - `com.tdh.bdzz.context.WebAppContext`：`dzzz-app/src/main/java/com/tdh/bdzz/context/WebAppContext.java`
  - `com.tdh.bdzz.aop.DzzzAspect`：`dzzz-app/src/main/java/com/tdh/bdzz/aop/DzzzAspect.java`

### JAVA-RISK-033 进程级可变共享状态与测试复位

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：39 个文件；原始风险：8 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-ENGINEERING-014`、`JAVA-ENGINEERING-015`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0021`：公开可变 HashMap 作为全局身份映射，既非不可变也非线程安全。
  - `RISK-0047`：媒体线程共享可变订阅者和注册表；并发增删与响应完成必须使用明确所有权。
  - `RISK-0108`：静态可变集合由整个进程共享；刷新原子性、并发可见性和测试复位必须明确。
  - `RISK-0156`：静态可变状态由整个进程共享；并发可见性、原子更新、容量、清理和测试复位必须显式定义。
  - `RISK-0165`：静态可变上下文由整个进程共享，初始化、并发可见性和测试复位责任需要明确。
  - `RISK-0188`：ConcurrentHashMap 只保证单次映射操作安全，注册时机、重复键和未知键策略仍需显式定义。
  - `RISK-0241`：单例适配器包含可变字段；若字段保存会话或结果，不同庭审并发调用可能互相覆盖。
  - `RISK-0280`：静态可变状态被整个进程共享，需要证明原子复合操作、回收和测试复位责任。
- 代表符号：
  - `com.tdh.bdzz.config.websocket.server.BlOperationWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/BlOperationWsServer.java`
  - `com.tdh.bdzz.factories.flv.ConverterFactories`：`dzzz-app/src/main/java/com/tdh/bdzz/factories/flv/ConverterFactories.java`
  - `com.tdh.bdzz.cache.DzzzDxpzCacheLoader`：`dzzz-app/src/main/java/com/tdh/bdzz/cache/DzzzDxpzCacheLoader.java`
  - `com.tdh.bdzz.constant.JzglConstant`：`dzzz-app/src/main/java/com/tdh/bdzz/constant/JzglConstant.java`
  - `com.tdh.bdzz.context.SpringContext`：`dzzz-app/src/main/java/com/tdh/bdzz/context/SpringContext.java`

### JAVA-RISK-034 非原子复合操作与非线程安全容器值

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：8 个文件；原始风险：9 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-STDLIB-024`、`JAVA-ENGINEERING-015`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0012`：会话组创建不是原子操作，同角色新连接还会覆盖旧连接。
  - `RISK-0022`：containsKey 后 put 不是原子建组，竞争连接可能覆盖刚建立的会话组，应使用 computeIfAbsent。
  - `RISK-0069`：两个会话/状态 Map 均使用非原子检查后创建，竞争连接可能覆盖状态。
  - `RISK-0107`：会话组仍使用 containsKey 后 put，且同一用户新连接会覆盖旧 Session。
  - `RISK-0131`：房间创建使用 containsKey 后 put，竞争连接可能覆盖集合。
  - `RISK-0155`：检查后创建会话列表不是原子操作，竞争连接可能丢失。
  - `RISK-0257`：ConcurrentHashMap 中保存普通 ArrayList，且建组不是原子操作，并发连接和关闭不安全。
  - `RISK-0287`：ConcurrentHashMap 的值是普通 ArrayList，open、close 和 message 并发访问仍不安全。
  - `RISK-0308`：ConcurrentHashMap 的值为普通 ArrayList，且建组不是原子操作，并发访问不安全。
- 代表符号：
  - `com.tdh.bdzz.config.websocket.server.Voice2TextWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/Voice2TextWsServer.java`
  - `com.tdh.bdzz.config.websocket.server.AppFrontYyzxWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/AppFrontYyzxWsServer.java`
  - `com.tdh.bdzz.config.websocket.server.ClientChatWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientChatWsServer.java`
  - `com.tdh.bdzz.config.websocket.server.BlOperationWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/BlOperationWsServer.java`
  - `com.tdh.bdzz.config.websocket.server.OnlyOfficeWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/OnlyOfficeWsServer.java`

### JAVA-RISK-035 字符串池锁与仅进程内同步边界

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：11 个文件；原始风险：4 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-LANG-013`、`JAVA-STDLIB-002`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0015`：以外部来源字符串的 intern 对象作为锁会扩大共享锁和字符串池边界。
  - `RISK-0093`：进程内同步块只能约束当前 JVM，需核对锁粒度、阻塞时长和集群一致性需求。
  - `RISK-0138`：客户端消息提供的 pqid 可能为空，却直接调用 intern；同时全局 intern 锁会长期占用字符串池。
  - `RISK-0296`：使用 String.intern() 作为业务锁会共享全局字符串池，存在不可控锁碰撞和内存生命周期。
- 代表符号：
  - `com.tdh.bdzz.aop.AppAspect`：`dzzz-app/src/main/java/com/tdh/bdzz/aop/AppAspect.java`
  - `com.tdh.bdzz.service.impl.FtjlServiceImpl`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FtjlServiceImpl.java`
  - `com.tdh.bdzz.config.websocket.server.ClientZzWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientZzWsServer.java`
  - `com.tdh.bdzz.service.impl.Fyb4WindowsImpl`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/Fyb4WindowsImpl.java`
  - `com.tdh.bdzz.service.impl.FybServiceImpl`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FybServiceImpl.java`

### JAVA-RISK-036 实时会话回收、幂等与慢客户端隔离

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：6 个文件；原始风险：6 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-FRAMEWORK-011`、`JAVA-ENGINEERING-028`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0001`：关闭时不移除空会话组，静态 Map 会保留排期键。
  - `RISK-0035`：最后一个连接关闭后不移除空列表，静态 Map 会持续保留会议键。
  - `RISK-0141`：关闭连接遍历所有组，且调试日志输出完整会话 Map，存在性能和信息暴露风险。
  - `RISK-0218`：同步 BasicRemote 广播会被慢客户端阻塞，异步发送和失败隔离需后续归一化。
  - `RISK-0222`：最后一个会话关闭后不移除空房间，静态 Map 会持续保留排期键。
  - `RISK-0279`：在线计数与连接状态没有幂等保护，重复 close/error 路径可能导致计数漂移。
- 代表符号：
  - `com.tdh.bdzz.config.websocket.server.Voice2TextWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/Voice2TextWsServer.java`
  - `com.tdh.bdzz.config.websocket.server.fyb.jdyh.NoteSignWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/fyb/jdyh/NoteSignWsServer.java`
  - `com.tdh.bdzz.config.websocket.server.ClientZzWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientZzWsServer.java`
  - `com.tdh.bdzz.config.websocket.server.AppFrontYyzxWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/AppFrontYyzxWsServer.java`
  - `com.tdh.bdzz.config.websocket.server.OnlyOfficeWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/OnlyOfficeWsServer.java`

### JAVA-RISK-037 数据库事务包裹不可回滚外部副作用

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：63 个文件；原始风险：1 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-FRAMEWORK-007`、`JAVA-ENGINEERING-019`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0041`：同一业务类同时出现事务与 HTTP、I/O 或并发信号，需逐方法确认数据库事务没有包住不可回滚的外部副作用或长等待。
- 代表符号：
  - `com.tdh.bdzz.service.JzApiService`：`dzzz-app/src/main/java/com/tdh/bdzz/service/JzApiService.java`
  - `com.tdh.bdzz.service.impl.AiXntjServiceImpl`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/AiXntjServiceImpl.java`
  - `com.tdh.bdzz.service.impl.BlmbServiceImpl`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/BlmbServiceImpl.java`
  - `com.tdh.bdzz.service.impl.BlockChainServiceImpl`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/BlockChainServiceImpl.java`
  - `com.tdh.bdzz.service.impl.CameraServiceImpl`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/CameraServiceImpl.java`

### JAVA-RISK-038 反射绕过类型合同与分片参数脆弱性

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：11 个文件；原始风险：3 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-STDLIB-020`、`JAVA-ENGINEERING-003`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0064`：运行时依赖反射恢复方法参数与实例，重载、代理类型和构造要求需要独立验证。
  - `RISK-0102`：反射绕过编译期合同并扩大失败面；推荐示例先使用类型化接口，必要反射需限制目标与缓存边界。
  - `RISK-0286`：反射提取分表键缺少编译期约束；方法签名、返回类型和失败行为需验证。
- 代表符号：
  - `com.tdh.bdzz.aop.DzzzAspect`：`dzzz-app/src/main/java/com/tdh/bdzz/aop/DzzzAspect.java`
  - `com.tdh.bdzz.util.BeanUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/BeanUtil.java`
  - `com.tdh.bdzz.shard.DefaultAutowiredShardData`：`dzzz-app/src/main/java/com/tdh/bdzz/shard/DefaultAutowiredShardData.java`
  - `com.tdh.bdzz.util.CommonUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/CommonUtil.java`
  - `com.tdh.bdzz.util.ConvertPdf`：`dzzz-app/src/main/java/com/tdh/bdzz/util/ConvertPdf.java`

### JAVA-RISK-039 SQL 文本改写、动态标识符与厂商耦合

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：6 个文件；原始风险：3 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-FRAMEWORK-014`、`JAVA-ENGINEERING-003`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0051`：用正则替换 SQL 表名可能误命中别名或文本；现代实现应使用受控解析与白名单表名。
  - `RISK-0081`：通过全局静态调用登记硬编码表名，配置来源和测试隔离能力有限。
  - `RISK-0265`：SQL 使用 ${...} 进行原始文本替换；动态表名或列名必须来自严格白名单，普通值必须使用参数绑定。
- 代表符号：
  - `com.tdh.bdzz.shard.TableShardInterceptor`：`dzzz-app/src/main/java/com/tdh/bdzz/shard/TableShardInterceptor.java`
  - `com.tdh.bdzz.config.DbcpSqlCheckConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/DbcpSqlCheckConfig.java`
  - `com.tdh.bdzz.dao.CatalogMapper`：`dzzz-app/src/main/java/com/tdh/bdzz/dao/CatalogMapper.java`
  - `com.tdh.bdzz.dao.DownloadMapper`：`dzzz-app/src/main/java/com/tdh/bdzz/dao/DownloadMapper.java`
  - `com.tdh.bdzz.dao.DzzzSqlMapper`：`dzzz-app/src/main/java/com/tdh/bdzz/dao/DzzzSqlMapper.java`

### JAVA-RISK-040 Mapper XML 与 Java 合同和资源布局漂移

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：14 个文件；原始风险：2 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-FRAMEWORK-014`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0146`：Mapper XML statement id 没有对应的当前 Java 接口方法，需确认是否为遗留映射。
  - `RISK-0306`：Mapper XML 与 Java 源码同目录并依赖 Maven 额外复制规则；现代布局应放在资源目录并显式验证打包结果。
- 代表符号：
  - `com.tdh.bdzz.dao.TuDmKzMapper`：`dzzz-app/src/main/java/com/tdh/bdzz/dao/TuDmKzMapper.java`
  - `com.tdh.bdzz.dao.AnnotationsMapper`：`dzzz-app/src/main/java/com/tdh/bdzz/dao/AnnotationsMapper.java`
  - `com.tdh.bdzz.dao.BookmarksMapper`：`dzzz-app/src/main/java/com/tdh/bdzz/dao/BookmarksMapper.java`
  - `com.tdh.bdzz.dao.CommentsMapper`：`dzzz-app/src/main/java/com/tdh/bdzz/dao/CommentsMapper.java`
  - `com.tdh.bdzz.dao.CommentsReviewHistoryMapper`：`dzzz-app/src/main/java/com/tdh/bdzz/dao/CommentsReviewHistoryMapper.java`

### JAVA-RISK-041 旧 API、平台默认与历史命名兼容污染

- 类型：`review-risk-pattern`；推荐阶段：中级。
- 项目证据：76 个文件；原始风险：12 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-ENGINEERING-034`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0046`：把 DataSource 强制转换为 BasicDataSource 并通过 URL 字符串判断数据库，耦合具体连接池和厂商字符串。
  - `RISK-0056`：包名或公开合同保留历史拼写错误；课程示例必须使用正确命名，并只在 legacy 补充中解释映射。
  - `RISK-0072`：公开类型或合同保留历史拼写；课程现代示例使用正确命名，只在 legacy 补充中映射。
  - `RISK-0074`：旧 File API 的路径与资源语义分散；现代示例优先使用 Path、Files 和 try-with-resources。
  - `RISK-0115`：依赖平台默认字符集会产生环境差异；现代示例显式使用 StandardCharsets。
  - `RISK-0123`：旧 PaginationInterceptor 属于 MyBatis-Plus 3.x 兼容知识，现代课程应使用当前插件 API。
  - `RISK-0137`：公开结果方法保留历史拼写；现代示例使用正确命名并只在 legacy 映射。
  - `RISK-0179`：通过 URL 字符串判断驱动并拼接旧时区参数，属于版本绑定的兼容逻辑。
  - `RISK-0200`：旧 File API 和手工流生命周期分散了路径、关闭与异常责任；现代示例优先 Path、Files 和 try-with-resources。
  - `RISK-0256`：反编译兼容源码只用于解释现状；现代示例不复制其原始类型、命名或生命周期设计。
  - `RISK-0258`：Spring WebSocket EnableWebSocket 与 JSR-356 ServerEndpointExporter 同时出现，课程需区分两套编程模型。
  - `RISK-0272`：Java 属性名以大写字母开头，依赖宽松绑定兼容，命名不符合常规 JavaBean 风格。
- 代表符号：
  - `com.tdh.bdzz.config.MybatisPlusConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/MybatisPlusConfig.java`
  - `com.tdh.bdzz.annoation.AutoValid`：`dzzz-app/src/main/java/com/tdh/bdzz/annoation/AutoValid.java`
  - `com.tdh.bdzz.timer.handler.clearExpireData.YzwYhbmSyncDataHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/clearExpireData/YzwYhbmSyncDataHandler.java`
  - `com.tdh.bdzz.download.MossDownloader`：`dzzz-app/src/main/java/com/tdh/bdzz/download/MossDownloader.java`
  - `com.tdh.bdzz.util.AESUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/AESUtils.java`

### JAVA-RISK-042 可变模型、Lombok 生成合同与继承构建

- 类型：`review-risk-pattern`；推荐阶段：中级。
- 项目证据：281 个文件；原始风险：6 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-LANG-001`、`JAVA-FRAMEWORK-017`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0031`：Lombok @Data 生成全量可变访问器；跨线程传递前应构造完成并避免后续修改。
  - `RISK-0175`：继承模型使用 @Data 自动生成 equals/hashCode/toString，必须明确父类字段是否参与相等性和输出。
  - `RISK-0191`：公开 setter 会改变全局枚举单例；现代枚举只在构造时赋值。
  - `RISK-0245`：枚举实例由 JVM 全局复用；实例字段应为 private final，不能在运行期改变。
  - `RISK-0288`：final 只保护 List 引用，列表内容仍可变；现代值对象应明确不可变集合边界。
  - `RISK-0312`：继承模型的 Builder 必须验证父类字段是否进入构建合同；普通 @Builder 不会自动覆盖继承字段。
- 代表符号：
  - `com.tdh.bdzz.timer.bo.FileProcessBO`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/bo/FileProcessBO.java`
  - `com.tdh.bdzz.dto.DownloadDTO`：`dzzz-app/src/main/java/com/tdh/bdzz/dto/DownloadDTO.java`
  - `com.tdh.bdzz.enums.Hyzt`：`dzzz-app/src/main/java/com/tdh/bdzz/enums/Hyzt.java`
  - `com.tdh.bdzz.enums.AymsJc`：`dzzz-app/src/main/java/com/tdh/bdzz/enums/AymsJc.java`
  - `com.tdh.bdzz.config.websocket.server.LoggingTailReadResult`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingTailReadResult.java`

### JAVA-RISK-043 事件发布线程、载荷可变性与监听副作用

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：9 个文件；原始风险：3 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-FRAMEWORK-003`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0092`：发布器本身不能证明同步或异步执行，课程必须结合 ApplicationEventMulticaster 配置说明。
  - `RISK-0166`：事件使用 Lombok @Data 暴露可变载荷，发布后修改会让监听者观察到不稳定状态。
  - `RISK-0212`：ApplicationListener 默认在发布线程同步执行；不能因位于 listener 包就宣称异步。
- 代表符号：
  - `com.tdh.bdzz.context.event.EventPublisher`：`dzzz-app/src/main/java/com/tdh/bdzz/context/event/EventPublisher.java`
  - `com.tdh.bdzz.context.event.DataReportEvent`：`dzzz-app/src/main/java/com/tdh/bdzz/context/event/DataReportEvent.java`
  - `com.tdh.bdzz.listener.ApplicationStartedEventListener`：`dzzz-app/src/main/java/com/tdh/bdzz/listener/ApplicationStartedEventListener.java`
  - `com.tdh.bdzz.context.event.SendMessageEvent`：`dzzz-app/src/main/java/com/tdh/bdzz/context/event/SendMessageEvent.java`
  - `com.tdh.bdzz.context.event.ZnfzAreaEvent`：`dzzz-app/src/main/java/com/tdh/bdzz/context/event/ZnfzAreaEvent.java`

### JAVA-RISK-044 无界缓存与限流器键空间回收

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：1 个文件；原始风险：1 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-ENGINEERING-020`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0181`：按调用方标识缓存限流器但没有回收边界，标识基数增长会长期占用内存。
- 代表符号：
  - `com.tdh.bdzz.aop.AppAspect`：`dzzz-app/src/main/java/com/tdh/bdzz/aop/AppAspect.java`

### JAVA-RISK-045 配置、注释、setter 与结果状态背离

- 类型：`review-risk-pattern`；推荐阶段：中级。
- 项目证据：5 个文件；原始风险：6 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-ENGINEERING-005`、`JAVA-ENGINEERING-021`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0062`：空文件分支先标记失败，后续又无条件覆盖为成功，结果合同需要单出口验证。
  - `RISK-0160`：两个 setter 忽略传入配置值并改用运行路径，名称与真实行为不一致。
  - `RISK-0208`：代码实际过期时间为 20 秒，但注释写 5 小时，文档与行为明显不一致。
  - `RISK-0283`：setter 同时校验和修改分隔符，错误使用通用 RuntimeException，配置模型承担较多运行逻辑。
  - `RISK-0302`：前两个 Bean 工厂会修改共享配置字段，Bean 创建顺序会影响后续方法读取到的值。
  - `RISK-0311`：定义了 validationQuery 却未设置，同时启用借出检测，连接校验意图与实现不一致。
- 代表符号：
  - `com.tdh.bdzz.upload.LocalUploader`：`dzzz-app/src/main/java/com/tdh/bdzz/upload/LocalUploader.java`
  - `com.tdh.bdzz.config.SysConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/SysConfig.java`
  - `com.tdh.bdzz.config.websocket.server.ClientChatWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientChatWsServer.java`
  - `com.tdh.bdzz.config.ThreadPoolConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/ThreadPoolConfig.java`
  - `com.tdh.bdzz.config.DataSourceConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/DataSourceConfig.java`

### JAVA-RISK-046 脆弱测试结构、粗粒度断言与共享 fixture

- 类型：`review-risk-pattern`；推荐阶段：中级。
- 项目证据：7 个文件；原始风险：8 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-ENGINEERING-035`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0032`：大型测试类聚合多种反馈环和 fixture，定位失败与维护成本较高。
  - `RISK-0050`：测试读写进程级共享缓存，必须保证每个反馈环可靠复位。
  - `RISK-0104`：当前反馈环使用 JUnit 4；现代课程优先使用 JUnit Jupiter。
  - `RISK-0202`：端到端 PDF 用例验证身份、存在性和页数，未直接断言最终图片像素或矩形。
  - `RISK-0228`：测试通过反射访问字段或私有方法，重构时会耦合实现细节。
  - `RISK-0236`：测试手工创建并反射注入 mock，依赖注入边界不够显式。
  - `RISK-0298`：@Test(expected) 无法限定具体抛出位置，可能接受非目标语句的异常。
  - `RISK-0303`：系统属性可把测试产物写到临时目录之外，运行者需要显式管理清理边界。
- 代表符号：
  - `com.tdh.bdzz.service.impl.TsFileSignNewDragServiceImplTest`：`dzzz-app/src/test/java/com/tdh/bdzz/service/impl/TsFileSignNewDragServiceImplTest.java`
  - `com.tdh.bdzz.service.tsaiassistant.TsAiTranscriptDiffServiceTest`：`dzzz-app/src/test/java/com/tdh/bdzz/service/tsaiassistant/TsAiTranscriptDiffServiceTest.java`
  - `com.tdh.bdzz.util.KeywordSignatureMergeTest`：`dzzz-app/src/test/java/com/tdh/bdzz/util/KeywordSignatureMergeTest.java`
  - `com.tdh.bdzz.service.tscwh.TscwhModelConfigTest`：`dzzz-app/src/test/java/com/tdh/bdzz/service/tscwh/TscwhModelConfigTest.java`
  - `com.tdh.bdzz.service.tsaiassistant.TsLegalReasoningResultParserTest`：`dzzz-app/src/test/java/com/tdh/bdzz/service/tsaiassistant/TsLegalReasoningResultParserTest.java`

### JAVA-RISK-047 阻塞等待与分散调度开关

- 类型：`review-risk-pattern`；推荐阶段：高级。
- 项目证据：10 个文件；原始风险：3 条。
- 证据政策：`project-risk-evidence-only`，不得把项目旧写法当作推荐示例。
- 前置能力：`JAVA-FRAMEWORK-005`、`JAVA-ENGINEERING-038`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 原始风险：
  - `RISK-0180`：工作线程中的 sleep 占用线程且不能表达可取消调度。
  - `RISK-0262`：在任务类局部启用调度会分散基础设施开关；现代配置应在集中配置边界启用。
  - `RISK-0284`：工作线程内 sleep 会占用执行器容量；重试和限速应使用有界、可观测的调度策略。
- 代表符号：
  - `com.tdh.bdzz.factories.flv.ConverterFactories`：`dzzz-app/src/main/java/com/tdh/bdzz/factories/flv/ConverterFactories.java`
  - `com.tdh.bdzz.timer.ZjqdFileOperateTask`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/ZjqdFileOperateTask.java`
  - `com.tdh.bdzz.timer.KtpqDataSyncTask`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/KtpqDataSyncTask.java`
  - `com.tdh.bdzz.factories.flv.ConverterTranFactories`：`dzzz-app/src/main/java/com/tdh/bdzz/factories/flv/ConverterTranFactories.java`
  - `com.tdh.bdzz.timer.handler.hyJzDataSync.HyJzDataSyncHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/hyJzDataSync/HyJzDataSyncHandler.java`

## 3. 全局关闭检查

- 五批归一化计数：40 + 112 + 235 + 200 + 319 = 906。
- 规范目录项：167 个，其中本批风险模式 47 个。
- 全局 sourceId 重复、遗漏和额外映射均为 0。
- 3436 个 Java 文件人工审计已完成，正式证据仍只来自冻结的 `dzzz-app` 路径与哈希。
- Gate 1 通过只允许进入 Phase 2 知识点与学习路径冻结，不等于任何知识点已研究或课程正文已编写。

## 4. 当前边界

- 本批未进行线上研究、项目示例改写、课程正文、菜单、Markdown adapter 或 Java 高亮实现。
- 后续研究必须以现代受支持稳定版本为主，Java 8 与 Spring Boot 2.3 只作项目兼容补充。
- 每条风险进入课程前仍需用官方规范、官方文档或权威安全资料验证正确做法。
