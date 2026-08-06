# `dzzz-app` Java 工程模式能力矩阵

> 批次：Phase 1D 第 4 批：工程模式能力归一化
> 源码快照：`dzzz-app-20260803-179e722831ab`
> 自动分析：`dzzz-app-analysis-20260803-958d37cf1be1`
> 状态：工程模式批次已归一化，风险反例与课程正文尚未开始

## 1. 本批边界

本批输入严格来自上一批的 519 个 `pending` 输入：

- 文件级能力候选：200 个；
- 剩余 Java 语言信号：0 个；
- 剩余框架使用信号：0 个；
- 唯一风险说明：319 个。

本批把 200 个经人工复核的工程候选合并为 38 个工程模式能力。
其余 319 个输入全部是风险说明，继续保持 `pending`。
风险反例没有被伪装成推荐能力，线上研究、项目示例和课程正文均未开始。

## 2. 规范能力

### JAVA-ENGINEERING-001 分层架构与业务编排

- 类型：`engineering-pattern`；推荐阶段：中级。
- 项目证据：344 个文件；原始输入：4 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-FRAMEWORK-002`、`JAVA-FRAMEWORK-008`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`端点业务编排`、`服务分层`、`横切合同设计`、`Service 分层`。
- 代表符号：
  - `com.tdh.bdzz.config.websocket.server.ClientChatWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientChatWsServer.java`
  - `com.tdh.bdzz.service.AiXntjService`：`dzzz-app/src/main/java/com/tdh/bdzz/service/AiXntjService.java`
  - `com.tdh.bdzz.annoation.AutoValid`：`dzzz-app/src/main/java/com/tdh/bdzz/annoation/AutoValid.java`
  - `com.tdh.bdzz.service.AsApiService`：`dzzz-app/src/main/java/com/tdh/bdzz/service/AsApiService.java`
  - `com.tdh.bdzz.annoation.AutowiredShardData`：`dzzz-app/src/main/java/com/tdh/bdzz/annoation/AutowiredShardData.java`

### JAVA-ENGINEERING-002 请求、响应与 DTO 模型边界

- 类型：`engineering-pattern`；推荐阶段：中级。
- 项目证据：1401 个文件；原始输入：11 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-001`、`JAVA-LANG-006`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`查询条件对象`、`对象边界`、`泛型响应封装`、`前端数据结构`、`请求模型边界`、`响应视图模型`、`业务层对象边界`、`DTO 边界`、`DTO 数据传输`、`Java 数据模型`、`JavaBean`。
- 代表符号：
  - `com.tdh.bdzz.dto.filter.BaseFilterDTO`：`dzzz-app/src/main/java/com/tdh/bdzz/dto/filter/BaseFilterDTO.java`
  - `com.tdh.bdzz.po.MossServer`：`dzzz-app/src/main/java/com/tdh/bdzz/po/MossServer.java`
  - `com.tdh.bdzz.eo.DataEO`：`dzzz-app/src/main/java/com/tdh/bdzz/eo/DataEO.java`
  - `com.tdh.bdzz.util.JzTabUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/JzTabUtils.java`
  - `com.tdh.bdzz.dto.BldcDTO`：`dzzz-app/src/main/java/com/tdh/bdzz/dto/BldcDTO.java`

### JAVA-ENGINEERING-003 持久化、分片与数据访问边界

- 类型：`engineering-pattern`；推荐阶段：高级。
- 项目证据：132 个文件；原始输入：4 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-FRAMEWORK-014`、`JAVA-FRAMEWORK-015`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`表分片`、`持久化对象`、`多数据库选择`、`SQL 改写`。
- 代表符号：
  - `com.tdh.bdzz.shard.AjbsShardStrategy`：`dzzz-app/src/main/java/com/tdh/bdzz/shard/AjbsShardStrategy.java`
  - `com.tdh.bdzz.po.AnnotationTypesEntity`：`dzzz-app/src/main/java/com/tdh/bdzz/po/AnnotationTypesEntity.java`
  - `com.tdh.bdzz.config.DataSourceConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/DataSourceConfig.java`
  - `com.tdh.bdzz.shard.TableShardInterceptor`：`dzzz-app/src/main/java/com/tdh/bdzz/shard/TableShardInterceptor.java`
  - `com.tdh.bdzz.po.AnnotationsEntity`：`dzzz-app/src/main/java/com/tdh/bdzz/po/AnnotationsEntity.java`

### JAVA-ENGINEERING-004 外部系统数据合同与协议模型

- 类型：`engineering-pattern`；推荐阶段：高级。
- 项目证据：367 个文件；原始输入：3 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-001`、`JAVA-FRAMEWORK-018`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`外部数据模型`、`外部系统数据合同`、`协议字段`。
- 代表符号：
  - `com.tdh.bdzz.timer.eo.AjxxDataEO`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/eo/AjxxDataEO.java`
  - `com.tdh.bdzz.dto.hxsjsb.AjlxxxDTO`：`dzzz-app/src/main/java/com/tdh/bdzz/dto/hxsjsb/AjlxxxDTO.java`
  - `com.tdh.bdzz.constant.EncryptConstant`：`dzzz-app/src/main/java/com/tdh/bdzz/constant/EncryptConstant.java`
  - `com.tdh.bdzz.dto.hxsjsb.AjspxxDTO`：`dzzz-app/src/main/java/com/tdh/bdzz/dto/hxsjsb/AjspxxDTO.java`
  - `com.tdh.bdzz.dto.hxsjsb.AjxxDTO`：`dzzz-app/src/main/java/com/tdh/bdzz/dto/hxsjsb/AjxxDTO.java`

### JAVA-ENGINEERING-005 结果对象与结果合同

- 类型：`engineering-pattern`；推荐阶段：中级。
- 项目证据：5 个文件；原始输入：4 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-001`、`JAVA-LANG-006`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`结果对象`、`结果合同`、`结果状态`、`校验结果建模`。
- 代表符号：
  - `com.tdh.bdzz.config.websocket.server.LoggingTailReadResult`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingTailReadResult.java`
  - `com.tdh.bdzz.download.DownloadResponse`：`dzzz-app/src/main/java/com/tdh/bdzz/download/DownloadResponse.java`
  - `com.tdh.bdzz.util.WordToPdfUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/WordToPdfUtil.java`
  - `com.tdh.bdzz.validator.Error`：`dzzz-app/src/main/java/com/tdh/bdzz/validator/Error.java`
  - `com.tdh.bdzz.validator.Result`：`dzzz-app/src/main/java/com/tdh/bdzz/validator/Result.java`

### JAVA-ENGINEERING-006 异常、错误与消息边界

- 类型：`engineering-pattern`；推荐阶段：中级。
- 项目证据：129 个文件；原始输入：6 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-009`、`JAVA-STDLIB-033`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`错误边界`、`错误合同`、`错误聚合`、`错误消息边界`、`业务错误边界`、`异常边界`。
- 代表符号：
  - `com.tdh.bdzz.handler.datareport.HkDataReportHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/handler/datareport/HkDataReportHandler.java`
  - `com.tdh.bdzz.util.ErrorMessage`：`dzzz-app/src/main/java/com/tdh/bdzz/util/ErrorMessage.java`
  - `com.tdh.bdzz.validator.Error`：`dzzz-app/src/main/java/com/tdh/bdzz/validator/Error.java`
  - `com.tdh.bdzz.annoation.impl.CltjrSfValidator`：`dzzz-app/src/main/java/com/tdh/bdzz/annoation/impl/CltjrSfValidator.java`
  - `com.tdh.bdzz.exception.ArgumentNotValidException`：`dzzz-app/src/main/java/com/tdh/bdzz/exception/ArgumentNotValidException.java`

### JAVA-ENGINEERING-007 策略模式与业务路由

- 类型：`engineering-pattern`；推荐阶段：中级。
- 项目证据：16 个文件；原始输入：4 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-003`、`JAVA-LANG-005`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`按业务类型建组`、`策略模式`、`地区差异`、`角色路由`。
- 代表符号：
  - `com.tdh.bdzz.config.websocket.server.fyb.FybWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/fyb/FybWsServer.java`
  - `com.tdh.bdzz.download.DownloadUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/download/DownloadUtil.java`
  - `com.tdh.bdzz.util.DqUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/DqUtils.java`
  - `com.tdh.bdzz.config.websocket.server.Voice2TextWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/Voice2TextWsServer.java`
  - `com.tdh.bdzz.download.Downloader`：`dzzz-app/src/main/java/com/tdh/bdzz/download/Downloader.java`

### JAVA-ENGINEERING-008 模板方法与默认扩展点

- 类型：`engineering-pattern`；推荐阶段：中级。
- 项目证据：10 个文件；原始输入：2 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-003`、`JAVA-LANG-004`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`模板方法`、`默认方法`。
- 代表符号：
  - `com.tdh.bdzz.timer.controller.ClearExpiredDataController`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/controller/ClearExpiredDataController.java`
  - `com.tdh.bdzz.validator.ConstraintValidator`：`dzzz-app/src/main/java/com/tdh/bdzz/validator/ConstraintValidator.java`
  - `com.tdh.bdzz.timer.controller.DxReportTaskController`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/controller/DxReportTaskController.java`
  - `com.tdh.bdzz.timer.controller.EndYchyController`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/controller/EndYchyController.java`
  - `com.tdh.bdzz.timer.controller.HxDataReportController`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/controller/HxDataReportController.java`

### JAVA-ENGINEERING-009 责任链、顺序与排序合同

- 类型：`engineering-pattern`；推荐阶段：高级。
- 项目证据：12 个文件；原始输入：4 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-003`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`顺序执行`、`责任链`、`责任链合同`、`Spring Order`。
- 代表符号：
  - `com.tdh.bdzz.timer.handler.JzDataSyncHandlerChain`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/JzDataSyncHandlerChain.java`
  - `com.tdh.bdzz.timer.handler.TdhTsglptJzDataSyncHandlerChain`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/TdhTsglptJzDataSyncHandlerChain.java`
  - `com.tdh.bdzz.timer.handler.jzDataSync.JzDataSyncHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/jzDataSync/JzDataSyncHandler.java`
  - `com.tdh.bdzz.timer.handler.commonJzDataSync.CommonJzDataSyncHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/commonJzDataSync/CommonJzDataSyncHandler.java`
  - `com.tdh.bdzz.timer.handler.hyJzDataSync.HyJzDataSyncHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/hyJzDataSync/HyJzDataSyncHandler.java`

### JAVA-ENGINEERING-010 工厂、注册表与服务定位边界

- 类型：`engineering-pattern`；推荐阶段：高级。
- 项目证据：10 个文件；原始输入：4 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-003`、`JAVA-FRAMEWORK-002`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`服务定位`、`服务定位器`、`服务定位器反例`、`工厂/注册表`。
- 代表符号：
  - `com.tdh.bdzz.download.DownloadUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/download/DownloadUtil.java`
  - `com.tdh.bdzz.config.websocket.server.ClientChatWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientChatWsServer.java`
  - `com.tdh.bdzz.config.ApplicationContextProvider`：`dzzz-app/src/main/java/com/tdh/bdzz/config/ApplicationContextProvider.java`
  - `com.tdh.bdzz.handler.burn.BurnPrintHandlerFactory`：`dzzz-app/src/main/java/com/tdh/bdzz/handler/burn/BurnPrintHandlerFactory.java`
  - `com.tdh.bdzz.config.websocket.server.Voice2TextWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/Voice2TextWsServer.java`

### JAVA-ENGINEERING-011 适配器与端口隔离

- 类型：`engineering-pattern`；推荐阶段：中级。
- 项目证据：1 个文件；原始输入：1 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-003`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`适配器`。
- 代表符号：
  - `com.tdh.bdzz.util.CustomMultipartFile`：`dzzz-app/src/main/java/com/tdh/bdzz/util/CustomMultipartFile.java`

### JAVA-ENGINEERING-012 回调与进度通知

- 类型：`engineering-pattern`；推荐阶段：中级。
- 项目证据：3 个文件；原始输入：4 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-003`、`JAVA-LANG-008`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`传输进度`、`回调`、`结果回调`、`最后连接回调`。
- 代表符号：
  - `com.tdh.bdzz.storage.StorageProcessListener`：`dzzz-app/src/main/java/com/tdh/bdzz/storage/StorageProcessListener.java`
  - `com.tdh.bdzz.ws.ReTransmissionService`：`dzzz-app/src/main/java/com/tdh/bdzz/ws/ReTransmissionService.java`
  - `com.tdh.bdzz.config.websocket.server.fyb.FybChatRoomWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/fyb/FybChatRoomWsServer.java`

### JAVA-ENGINEERING-013 有限状态与状态流转

- 类型：`engineering-pattern`；推荐阶段：高级。
- 项目证据：164 个文件；原始输入：5 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-005`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`会话状态恢复`、`连接状态`、`异步状态`、`有限状态`、`状态流转`。
- 代表符号：
  - `com.tdh.bdzz.config.websocket.server.fyb.FybChatRoomWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/fyb/FybChatRoomWsServer.java`
  - `com.tdh.bdzz.config.websocket.server.LoggingWSServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingWSServer.java`
  - `com.tdh.bdzz.constant.TsAiRuntimeCache`：`dzzz-app/src/main/java/com/tdh/bdzz/constant/TsAiRuntimeCache.java`
  - `com.tdh.bdzz.enums.AJFL`：`dzzz-app/src/main/java/com/tdh/bdzz/enums/AJFL.java`
  - `com.tdh.bdzz.service.impl.TsFileSignNewDragServiceImplTest`：`dzzz-app/src/test/java/com/tdh/bdzz/service/impl/TsFileSignNewDragServiceImplTest.java`

### JAVA-ENGINEERING-014 共享状态、静态初始化与可变性

- 类型：`engineering-pattern`；推荐阶段：高级。
- 项目证据：9 个文件；原始输入：9 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-002`、`JAVA-LANG-015`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`不可重新赋值字段`、`单例`、`进程内状态`、`静态初始化`、`静态初始化块`、`静态门面`、`可变属性`、`全局可见性`、`全局状态`。
- 代表符号：
  - `com.tdh.bdzz.config.websocket.server.LoggingTailReadResult`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingTailReadResult.java`
  - `com.tdh.bdzz.enums.vidyo.common.VidyoDataCommon`：`dzzz-app/src/main/java/com/tdh/bdzz/enums/vidyo/common/VidyoDataCommon.java`
  - `com.tdh.bdzz.constant.JzglConstant`：`dzzz-app/src/main/java/com/tdh/bdzz/constant/JzglConstant.java`
  - `com.tdh.bdzz.constant.TuDmKzCategoryConstant`：`dzzz-app/src/main/java/com/tdh/bdzz/constant/TuDmKzCategoryConstant.java`
  - `com.tdh.bdzz.config.websocket.server.BlOperationWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/BlOperationWsServer.java`

### JAVA-ENGINEERING-015 锁、可见性与并发状态保护

- 类型：`engineering-pattern`；推荐阶段：高级。
- 项目证据：12 个文件；原始输入：5 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-013`、`JAVA-STDLIB-024`、`JAVA-STDLIB-025`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`双重检查锁`、`同步块与锁`、`ReentrantLock`、`synchronized`、`volatile`。
- 代表符号：
  - `com.tdh.bdzz.config.Pdf2ImageComparablePriorityTaskPoolExecutor`：`dzzz-app/src/main/java/com/tdh/bdzz/config/Pdf2ImageComparablePriorityTaskPoolExecutor.java`
  - `com.tdh.bdzz.service.impl.FtjlServiceImpl`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FtjlServiceImpl.java`
  - `com.tdh.bdzz.util.LockStringUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/LockStringUtil.java`
  - `com.tdh.bdzz.config.websocket.server.ClientZzWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientZzWsServer.java`
  - `com.tdh.bdzz.service.impl.Fyb4WindowsImpl`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/Fyb4WindowsImpl.java`

### JAVA-ENGINEERING-016 异步执行与线程边界

- 类型：`engineering-pattern`；推荐阶段：高级。
- 项目证据：9 个文件；原始输入：3 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-023`、`JAVA-FRAMEWORK-005`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`线程边界`、`异步边界`、`异步响应`。
- 代表符号：
  - `com.tdh.bdzz.listener.ApplicationStartedEventListener`：`dzzz-app/src/main/java/com/tdh/bdzz/listener/ApplicationStartedEventListener.java`
  - `com.tdh.bdzz.timer.handler.clearExpireData.ClearExpireDataHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/clearExpireData/ClearExpireDataHandler.java`
  - `com.tdh.bdzz.factories.flv.ConverterFactories`：`dzzz-app/src/main/java/com/tdh/bdzz/factories/flv/ConverterFactories.java`
  - `com.tdh.bdzz.factories.flv.ConverterTranFactories`：`dzzz-app/src/main/java/com/tdh/bdzz/factories/flv/ConverterTranFactories.java`
  - `com.tdh.bdzz.listener.DataReportListener`：`dzzz-app/src/main/java/com/tdh/bdzz/listener/DataReportListener.java`

### JAVA-ENGINEERING-017 请求、用户与线程上下文传播

- 类型：`engineering-pattern`；推荐阶段：高级。
- 项目证据：6 个文件；原始输入：6 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-026`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`当前用户边界`、`请求上下文`、`上下文传递`、`线程上下文`、`线程上下文传播`、`用户上下文`。
- 代表符号：
  - `com.tdh.bdzz.context.WebAppContext`：`dzzz-app/src/main/java/com/tdh/bdzz/context/WebAppContext.java`
  - `com.tdh.bdzz.util.SystemLogUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/SystemLogUtil.java`
  - `com.tdh.bdzz.shard.IAutowiredShardData`：`dzzz-app/src/main/java/com/tdh/bdzz/shard/IAutowiredShardData.java`
  - `com.tdh.bdzz.shard.AjbsShardStrategy`：`dzzz-app/src/main/java/com/tdh/bdzz/shard/AjbsShardStrategy.java`
  - `com.tdh.bdzz.context.TableShardContext`：`dzzz-app/src/main/java/com/tdh/bdzz/context/TableShardContext.java`

### JAVA-ENGINEERING-018 资源生命周期、清理与优雅关闭

- 类型：`engineering-pattern`；推荐阶段：高级。
- 项目证据：115 个文件；原始输入：7 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-014`、`JAVA-STDLIB-014`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`清理生命周期`、`清理责任`、`外部资源初始化`、`优雅关闭`、`资源管理`、`资源清理`、`资源生命周期`。
- 代表符号：
  - `com.tdh.bdzz.constant.TsAiRuntimeCache`：`dzzz-app/src/main/java/com/tdh/bdzz/constant/TsAiRuntimeCache.java`
  - `com.tdh.bdzz.context.TableShardContext`：`dzzz-app/src/main/java/com/tdh/bdzz/context/TableShardContext.java`
  - `com.tdh.bdzz.context.InitializeYjbjWord`：`dzzz-app/src/main/java/com/tdh/bdzz/context/InitializeYjbjWord.java`
  - `com.tdh.bdzz.config.ThreadPoolConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/ThreadPoolConfig.java`
  - `com.tdh.bdzz.service.CustomRequestCallback`：`dzzz-app/src/main/java/com/tdh/bdzz/service/CustomRequestCallback.java`

### JAVA-ENGINEERING-019 幂等、事务与失败回退

- 类型：`engineering-pattern`；推荐阶段：高级。
- 项目证据：26 个文件；原始输入：3 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-FRAMEWORK-006`、`JAVA-FRAMEWORK-007`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`幂等性`、`失败回退`、`事务`。
- 代表符号：
  - `com.tdh.bdzz.timer.handler.clearExpireData.ClearLocalCacheHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/clearExpireData/ClearLocalCacheHandler.java`
  - `com.tdh.bdzz.service.tsaiassistant.TsLegalReasoningResultParserTest`：`dzzz-app/src/test/java/com/tdh/bdzz/service/tsaiassistant/TsLegalReasoningResultParserTest.java`
  - `com.tdh.bdzz.timer.handler.fileProcess.EajJzFileProcessHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/fileProcess/EajJzFileProcessHandler.java`
  - `com.tdh.bdzz.timer.handler.clearExpireData.ClearLocalLogHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/clearExpireData/ClearLocalLogHandler.java`
  - `com.tdh.bdzz.timer.handler.clearExpireData.CloseTdhHjptStreamForXxtHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/clearExpireData/CloseTdhHjptStreamForXxtHandler.java`

### JAVA-ENGINEERING-020 进程内缓存与缓存失效

- 类型：`engineering-pattern`；推荐阶段：高级。
- 项目证据：24 个文件；原始输入：5 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-005`、`JAVA-STDLIB-024`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`过期 Map`、`缓存键`、`缓存清理`、`进程内缓存`、`元数据缓存`。
- 代表符号：
  - `com.tdh.bdzz.config.websocket.server.ClientChatWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientChatWsServer.java`
  - `com.tdh.bdzz.constant.TsblTextCacheKeyBuilder`：`dzzz-app/src/main/java/com/tdh/bdzz/constant/TsblTextCacheKeyBuilder.java`
  - `com.tdh.bdzz.constant.JzglConstant`：`dzzz-app/src/main/java/com/tdh/bdzz/constant/JzglConstant.java`
  - `com.tdh.bdzz.cache.DzzzDxpzCacheLoader`：`dzzz-app/src/main/java/com/tdh/bdzz/cache/DzzzDxpzCacheLoader.java`
  - `com.tdh.bdzz.util.ReflectionCacheUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/ReflectionCacheUtil.java`

### JAVA-ENGINEERING-021 配置读取、建模与派生配置

- 类型：`engineering-pattern`；推荐阶段：中级。
- 项目证据：5 个文件；原始输入：5 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-FRAMEWORK-001`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`派生配置`、`配置读取`、`配置数据建模`、`配置映射`、`视频平台配置`。
- 代表符号：
  - `com.tdh.bdzz.config.SysConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/SysConfig.java`
  - `com.tdh.bdzz.util.TuDmKzUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/TuDmKzUtil.java`
  - `com.tdh.bdzz.config.AmazonConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/AmazonConfig.java`
  - `com.tdh.bdzz.service.tscwh.TscwhModelConfigTest`：`dzzz-app/src/test/java/com/tdh/bdzz/service/tscwh/TscwhModelConfigTest.java`
  - `com.tdh.bdzz.enums.vidyo.common.VidyoDataCommon`：`dzzz-app/src/main/java/com/tdh/bdzz/enums/vidyo/common/VidyoDataCommon.java`

### JAVA-ENGINEERING-022 外部系统集成与设备适配

- 类型：`engineering-pattern`；推荐阶段：高级。
- 项目证据：33 个文件；原始输入：4 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-ENGINEERING-011`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`外部 API`、`外部集成`、`外部设备集成`、`外部系统集成`。
- 代表符号：
  - `com.tdh.bdzz.util.NlzxUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/NlzxUtil.java`
  - `com.tdh.bdzz.timer.service.ClearExpiredDataService`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/service/ClearExpiredDataService.java`
  - `com.tdh.bdzz.handler.burn.BurnPrintHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/handler/burn/BurnPrintHandler.java`
  - `com.tdh.bdzz.handler.datareport.HkDataReportHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/handler/datareport/HkDataReportHandler.java`
  - `com.tdh.bdzz.handler.burn.HmBurnPrintHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/handler/burn/HmBurnPrintHandler.java`

### JAVA-ENGINEERING-023 HTTP 调用、超时与头部合同

- 类型：`engineering-pattern`；推荐阶段：高级。
- 项目证据：22 个文件；原始输入：7 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-FRAMEWORK-022`、`JAVA-STDLIB-019`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`超时`、`连接与读取超时`、`外部 HTTP`、`HTTP`、`HTTP 调用`、`HTTP headers`、`URLConnection`。
- 代表符号：
  - `com.tdh.bdzz.util.HttpClientUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/HttpClientUtil.java`
  - `com.tdh.bdzz.config.AmazonConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/AmazonConfig.java`
  - `com.tdh.bdzz.timer.handler.commonJzDataSync.CommonJzDataSyncHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/commonJzDataSync/CommonJzDataSyncHandler.java`
  - `com.tdh.bdzz.util.NlzxUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/NlzxUtil.java`
  - `com.tdh.bdzz.handler.burn.HmBurnPrintHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/handler/burn/HmBurnPrintHandler.java`

### JAVA-ENGINEERING-024 流式数据、同步与转换管线

- 类型：`engineering-pattern`；推荐阶段：高级。
- 项目证据：23 个文件；原始输入：5 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-013`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`流式数据`、`数据上报`、`数据输出边界`、`数据同步`、`完整行边界`。
- 代表符号：
  - `com.tdh.bdzz.handler.voice2text.BjhyVoice2TextHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/handler/voice2text/BjhyVoice2TextHandler.java`
  - `com.tdh.bdzz.handler.datareport.DataReportHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/handler/datareport/DataReportHandler.java`
  - `com.tdh.bdzz.validator.Error`：`dzzz-app/src/main/java/com/tdh/bdzz/validator/Error.java`
  - `com.tdh.bdzz.timer.handler.commonJzDataSync.CommonJzDataSyncHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/commonJzDataSync/CommonJzDataSyncHandler.java`
  - `com.tdh.bdzz.config.websocket.server.LoggingFileTailReader`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingFileTailReader.java`

### JAVA-ENGINEERING-025 认证、授权与匿名访问边界

- 类型：`engineering-pattern`；推荐阶段：高级。
- 项目证据：25 个文件；原始输入：6 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-FRAMEWORK-008`、`JAVA-FRAMEWORK-010`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`匿名入口`、`权限过滤`、`认证`、`认证请求`、`认证数据`、`文档端点访问控制`。
- 代表符号：
  - `com.tdh.bdzz.controller.CommController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/CommController.java`
  - `com.tdh.bdzz.util.aixntj.AiXntjCourtTreeHelper`：`dzzz-app/src/main/java/com/tdh/bdzz/util/aixntj/AiXntjCourtTreeHelper.java`
  - `com.tdh.bdzz.util.NlzxUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/NlzxUtil.java`
  - `tdh.uim.client.vo.LoginRequest`：`dzzz-app/src/main/java/tdh/uim/client/vo/LoginRequest.java`
  - `tdh.uim.client.vo.LoginData`：`dzzz-app/src/main/java/tdh/uim/client/vo/LoginData.java`

### JAVA-ENGINEERING-026 凭据、签名与敏感数据处理

- 类型：`engineering-pattern`；推荐阶段：高级。
- 项目证据：15 个文件；原始输入：6 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-027`、`JAVA-STDLIB-028`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`敏感配置`、`敏感数据`、`敏感字段处理`、`凭据解密`、`凭据跨域规则`、`请求签名`。
- 代表符号：
  - `com.tdh.bdzz.upload.LocalFile`：`dzzz-app/src/main/java/com/tdh/bdzz/upload/LocalFile.java`
  - `tdh.platform.component.license.lic.License`：`dzzz-app/src/main/java/tdh/platform/component/license/lic/License.java`
  - `com.tdh.bdzz.po.MossServer`：`dzzz-app/src/main/java/com/tdh/bdzz/po/MossServer.java`
  - `com.tdh.bdzz.config.DataSourceConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/DataSourceConfig.java`
  - `com.tdh.bdzz.config.CorsConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/CorsConfig.java`

### JAVA-ENGINEERING-027 输入过滤、校验扩展与审计

- 类型：`engineering-pattern`；推荐阶段：高级。
- 项目证据：5 个文件；原始输入：5 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-FRAMEWORK-009`、`JAVA-FRAMEWORK-026`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`安全过滤`、`关键字匹配`、`审计日志`、`校验扩展点`、`HTML 转义`。
- 代表符号：
  - `tdh.commons.security.web.utils.SqlFilterUtil`：`dzzz-app/src/main/java/tdh/commons/security/web/utils/SqlFilterUtil.java`
  - `com.tdh.bdzz.util.PdfKeywordPositionUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/PdfKeywordPositionUtil.java`
  - `com.tdh.bdzz.util.SystemLogUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/SystemLogUtil.java`
  - `com.tdh.bdzz.validator.ConstraintValidator`：`dzzz-app/src/main/java/com/tdh/bdzz/validator/ConstraintValidator.java`
  - `com.tdh.bdzz.config.websocket.server.LoggingWSServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingWSServer.java`

### JAVA-ENGINEERING-028 实时会话、广播与心跳

- 类型：`engineering-pattern`；推荐阶段：高级。
- 项目证据：9 个文件；原始输入：8 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-FRAMEWORK-011`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`房间广播`、`分组广播`、`广播`、`会话超时`、`会话分组`、`会话清理`、`消息缓冲区`、`心跳`。
- 代表符号：
  - `com.tdh.bdzz.config.websocket.server.OnlyOfficeWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/OnlyOfficeWsServer.java`
  - `com.tdh.bdzz.config.websocket.server.BlOperationWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/BlOperationWsServer.java`
  - `com.tdh.bdzz.config.websocket.server.AppFrontYyzxWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/AppFrontYyzxWsServer.java`
  - `com.tdh.bdzz.config.websocket.WebSocketConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/WebSocketConfig.java`
  - `com.tdh.bdzz.config.websocket.server.fyb.jdyh.NoteSignWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/fyb/jdyh/NoteSignWsServer.java`

### JAVA-ENGINEERING-029 文件、二进制载荷与存储边界

- 类型：`engineering-pattern`；推荐阶段：高级。
- 项目证据：95 个文件；原始输入：7 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-015`、`JAVA-FRAMEWORK-028`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`对象存储`、`二进制载荷`、`路径构造`、`文件处理`、`文件魔数`、`文件上传`、`文件下载`。
- 代表符号：
  - `com.tdh.bdzz.download.LocalDownloader`：`dzzz-app/src/main/java/com/tdh/bdzz/download/LocalDownloader.java`
  - `com.tdh.bdzz.download.DownloadResponse`：`dzzz-app/src/main/java/com/tdh/bdzz/download/DownloadResponse.java`
  - `com.tdh.bdzz.upload.UploadUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/upload/UploadUtil.java`
  - `com.tdh.bdzz.timer.handler.fileProcess.AbstractFileProcessHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/fileProcess/AbstractFileProcessHandler.java`
  - `com.tdh.util.FileTypeUtils`：`dzzz-app/src/main/java/com/tdh/util/FileTypeUtils.java`

### JAVA-ENGINEERING-030 文档、媒体与 XML 处理管线

- 类型：`engineering-pattern`；推荐阶段：高级。
- 项目证据：5 个文件；原始输入：5 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-013`、`JAVA-FRAMEWORK-029`、`JAVA-FRAMEWORK-030`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`媒体流`、`文本位置`、`文档转换`、`语音转写`、`XML I/O`。
- 代表符号：
  - `com.tdh.bdzz.factories.flv.Converter`：`dzzz-app/src/main/java/com/tdh/bdzz/factories/flv/Converter.java`
  - `com.tdh.bdzz.util.PdfKeywordTextStripper`：`dzzz-app/src/main/java/com/tdh/bdzz/util/PdfKeywordTextStripper.java`
  - `com.tdh.bdzz.util.WordToPdfUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/WordToPdfUtil.java`
  - `com.tdh.bdzz.handler.voice2text.Voice2TextHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/handler/voice2text/Voice2TextHandler.java`
  - `tdh.platform.component.license.lic.impl.LicFactoryImpl`：`dzzz-app/src/main/java/tdh/platform/component/license/lic/impl/LicFactoryImpl.java`

### JAVA-ENGINEERING-031 对象映射与值转换

- 类型：`engineering-pattern`；推荐阶段：中级。
- 项目证据：175 个文件；原始输入：10 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-001`、`JAVA-STDLIB-003`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`编码映射`、`查找方法`、`代码映射`、`对象转换`、`分类映射`、`类型映射`、`数据转换`、`值转换`、`转换参数`、`BeanUtils`。
- 代表符号：
  - `com.tdh.bdzz.timer.enums.YjStatus`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/enums/YjStatus.java`
  - `com.tdh.bdzz.enums.AJFL`：`dzzz-app/src/main/java/com/tdh/bdzz/enums/AJFL.java`
  - `com.tdh.bdzz.enums.AymsJc`：`dzzz-app/src/main/java/com/tdh/bdzz/enums/AymsJc.java`
  - `com.tdh.bdzz.util.BeanUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/BeanUtil.java`
  - `com.tdh.bdzz.constant.TuDmKzCategoryConstant`：`dzzz-app/src/main/java/com/tdh/bdzz/constant/TuDmKzCategoryConstant.java`

### JAVA-ENGINEERING-032 领域规则、树结构与坐标值对象

- 类型：`engineering-pattern`；推荐阶段：中级。
- 项目证据：15 个文件；原始输入：9 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-001`、`JAVA-STDLIB-005`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`比例`、`法院代码`、`领域规则`、`平均值`、`树结构`、`条件判断`、`坐标`、`坐标布局`、`坐标换算合同`。
- 代表符号：
  - `com.tdh.bdzz.util.aixntj.AiXntjMetricsCalculator`：`dzzz-app/src/main/java/com/tdh/bdzz/util/aixntj/AiXntjMetricsCalculator.java`
  - `com.tdh.bdzz.util.DqUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/DqUtils.java`
  - `com.tdh.bdzz.util.TsjdStageUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/TsjdStageUtil.java`
  - `com.tdh.bdzz.util.aixntj.AiXntjCourtTreeHelper`：`dzzz-app/src/main/java/com/tdh/bdzz/util/aixntj/AiXntjCourtTreeHelper.java`
  - `com.tdh.bdzz.util.PdfKeywordPositionUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/PdfKeywordPositionUtil.java`

### JAVA-ENGINEERING-033 分页参数与标识符生成

- 类型：`engineering-pattern`；推荐阶段：中级。
- 项目证据：11 个文件；原始输入：3 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-032`、`JAVA-FRAMEWORK-015`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`分页`、`分页参数边界`、`雪花算法`。
- 代表符号：
  - `com.tdh.bdzz.util.JzTabUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/JzTabUtils.java`
  - `com.tdh.bdzz.dto.filter.BaseFilterDTO`：`dzzz-app/src/main/java/com/tdh/bdzz/dto/filter/BaseFilterDTO.java`
  - `com.tdh.bdzz.util.CodeGenerator`：`dzzz-app/src/main/java/com/tdh/bdzz/util/CodeGenerator.java`
  - `com.tdh.bdzz.dto.filter.CaseFilterDTO`：`dzzz-app/src/main/java/com/tdh/bdzz/dto/filter/CaseFilterDTO.java`
  - `com.tdh.bdzz.dto.filter.CatalogFilterDTO`：`dzzz-app/src/main/java/com/tdh/bdzz/dto/filter/CatalogFilterDTO.java`

### JAVA-ENGINEERING-034 兼容性合同与 legacy 隔离

- 类型：`engineering-pattern`；推荐阶段：高级。
- 项目证据：3 个文件；原始输入：3 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-003`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`兼容合同`、`业务兼容`、`legacy 兼容`。
- 代表符号：
  - `com.tdh.bdzz.constant.TsblTextCacheKeyBuilder`：`dzzz-app/src/main/java/com/tdh/bdzz/constant/TsblTextCacheKeyBuilder.java`
  - `com.tdh.bdzz.util.CommonUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/CommonUtil.java`
  - `com.tdh.bdzz.enums.vidyo.common.VidyoDataCommon`：`dzzz-app/src/main/java/com/tdh/bdzz/enums/vidyo/common/VidyoDataCommon.java`

### JAVA-ENGINEERING-035 回归测试与可观测断言

- 类型：`engineering-pattern`；推荐阶段：中级。
- 项目证据：6 个文件；原始输入：8 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-FRAMEWORK-023`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`产物回归`、`纯函数式测试`、`服务协作测试`、`模板变量`、`字符串差分`、`字符串断言`、`坐标断言`、`HTML 段落解析`。
- 代表符号：
  - `com.tdh.bdzz.util.KeywordSignatureMergeTest`：`dzzz-app/src/test/java/com/tdh/bdzz/util/KeywordSignatureMergeTest.java`
  - `com.tdh.bdzz.service.tsaiassistant.TsAiTranscriptDiffServiceTest`：`dzzz-app/src/test/java/com/tdh/bdzz/service/tsaiassistant/TsAiTranscriptDiffServiceTest.java`
  - `com.tdh.bdzz.service.impl.TsFileSignNewDragServiceImplTest`：`dzzz-app/src/test/java/com/tdh/bdzz/service/impl/TsFileSignNewDragServiceImplTest.java`
  - `com.tdh.bdzz.service.tscwh.TscwhRuntimePromptServiceTest`：`dzzz-app/src/test/java/com/tdh/bdzz/service/tscwh/TscwhRuntimePromptServiceTest.java`
  - `com.tdh.bdzz.service.tsaiassistant.TsLegalReasoningResultParserTest`：`dzzz-app/src/test/java/com/tdh/bdzz/service/tsaiassistant/TsLegalReasoningResultParserTest.java`

### JAVA-ENGINEERING-036 API 参数与命名合同

- 类型：`engineering-pattern`；推荐阶段：中级。
- 项目证据：6 个文件；原始输入：3 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-FRAMEWORK-008`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`多路径参数`、`路径参数`、`命名约定`。
- 代表符号：
  - `com.tdh.bdzz.config.websocket.server.fyb.FybWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/fyb/FybWsServer.java`
  - `com.tdh.bdzz.config.websocket.server.AppFrontYyzxWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/AppFrontYyzxWsServer.java`
  - `com.tdh.bdzz.constant.BlockChainConstant`：`dzzz-app/src/main/java/com/tdh/bdzz/constant/BlockChainConstant.java`
  - `com.tdh.bdzz.constant.YjbjConstant`：`dzzz-app/src/main/java/com/tdh/bdzz/constant/YjbjConstant.java`
  - `com.tdh.bdzz.enums.ModifyType`：`dzzz-app/src/main/java/com/tdh/bdzz/enums/ModifyType.java`

### JAVA-ENGINEERING-037 许可证模型与基础设施适配

- 类型：`engineering-pattern`；推荐阶段：高级。
- 项目证据：2 个文件；原始输入：2 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-ENGINEERING-011`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`许可证模型`、`许可证适配`。
- 代表符号：
  - `tdh.platform.component.license.lic.License`：`dzzz-app/src/main/java/tdh/platform/component/license/lic/License.java`
  - `tdh.platform.component.license.lic.impl.LicFactoryImpl`：`dzzz-app/src/main/java/tdh/platform/component/license/lic/impl/LicFactoryImpl.java`

### JAVA-ENGINEERING-038 任务调度、上下文与执行状态

- 类型：`engineering-pattern`；推荐阶段：高级。
- 项目证据：44 个文件；原始输入：10 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-023`、`JAVA-FRAMEWORK-005`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`调度边界`、`后台轮询`、`批处理`、`任务编排`、`任务结果`、`任务上下文`、`任务适配器`、`任务优先级`、`任务重入`、`任务状态`。
- 代表符号：
  - `com.tdh.bdzz.timer.ClearExpiredDataTask`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/ClearExpiredDataTask.java`
  - `com.tdh.bdzz.config.websocket.server.LoggingWSServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingWSServer.java`
  - `com.tdh.bdzz.timer.DxReportTask`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/DxReportTask.java`
  - `com.tdh.bdzz.timer.EndYchyTask`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/EndYchyTask.java`
  - `com.tdh.bdzz.timer.controller.ClearExpiredDataController`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/controller/ClearExpiredDataController.java`

## 3. 已验证边界决定

- 200 个文件级工程候选已全部归一化；319 个风险说明全部保持 `pending`。
- API、框架与标准库名称只作为工程模式的前置能力，不在本批重复建立 API 能力。
- 服务定位器、共享状态、锁、敏感数据和 legacy 兼容只登记为后续正确实践的选题证据，不认可项目旧写法。
- 测试类候选归入回归测试合同，不把具体 fixture 或项目断言直接当作推荐模板。
- 本批没有形成拒绝模式；安全与可靠性风险必须在下一批逐项归一化。

## 4. 当前边界

- `modernBaseline` 与 `legacyBaseline` 只冻结版本线，不表示知识点研究已经完成。
- `courseStatus=candidate` 只表示进入能力矩阵，不表示已经选择为独立课程。
- 本批不处理风险反例、项目示例、课程正文、菜单或 Markdown adapter。
- Phase 1D 尚未完成，Gate 1 仍未通过。

下一批只能继续处理风险反例归一化，不能开始线上研究、课程正文或前端平台实现。
