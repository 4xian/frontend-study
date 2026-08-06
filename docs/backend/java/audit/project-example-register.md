# `dzzz-app` 项目示例候选登记

> Phase 2 只登记候选链和去敏边界，不编写或运行示例。所有条目当前均为 `not-started`。

## backend.java.projects.dzzz-app.request-service-mapper-chain

- 标题：请求到 Controller、Service 与 Mapper 的调用链
- 项目证据（相对路径 -> 稳定符号）：
  - `dzzz-app/src/main/java/com/tdh/bdzz/controller/hxhttp/HxHttpFeedBackController.java` -> `HxHttpFeedBackController.getPqTjSj`
  - `dzzz-app/src/main/java/com/tdh/bdzz/service/hxHttp/HxHttpFeedBackService.java` -> `HxHttpFeedBackService.getPqTjSj`
  - `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/hxHttp/HxHttpFeedBackServiceImpl.java` -> `HxHttpFeedBackServiceImpl.getPqTjSj`
  - `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/hxHttp/HxHttpFeedBackServiceImpl.java` -> `EajFtsyMapper.selectList 调用`
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/SpringMvcConfig.java` -> `com.tdh.bdzz.config.SpringMvcConfig`
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/SwaggerAccessBlockController.java` -> `com.tdh.bdzz.config.SwaggerAccessBlockController`
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/ThymeleafConfig.java` -> `com.tdh.bdzz.config.ThymeleafConfig`
  - `dzzz-app/src/main/java/com/tdh/bdzz/controller/BaseOuterController.java` -> `com.tdh.bdzz.controller.BaseOuterController`
  - `dzzz-app/src/main/java/com/tdh/bdzz/controller/BlmbController.java` -> `com.tdh.bdzz.controller.BlmbController`
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientChatWsServer.java` -> `com.tdh.bdzz.config.websocket.server.ClientChatWsServer`
  - `dzzz-app/src/main/java/com/tdh/bdzz/service/AiXntjService.java` -> `com.tdh.bdzz.service.AiXntjService`
  - `dzzz-app/src/main/java/com/tdh/bdzz/annoation/AutoValid.java` -> `com.tdh.bdzz.annoation.AutoValid`
  - `dzzz-app/src/main/java/com/tdh/bdzz/service/AsApiService.java` -> `com.tdh.bdzz.service.AsApiService`
  - `dzzz-app/src/main/java/com/tdh/bdzz/annoation/AutowiredShardData.java` -> `com.tdh.bdzz.annoation.AutowiredShardData`
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/MybatisPlusConfig.java` -> `com.tdh.bdzz.config.MybatisPlusConfig`
  - `dzzz-app/src/main/java/com/tdh/bdzz/dao/AnnotationsMapper.java` -> `com.tdh.bdzz.dao.AnnotationsMapper`
  - `dzzz-app/src/main/java/com/tdh/bdzz/dao/CaseMapper.java` -> `com.tdh.bdzz.dao.CaseMapper`
  - `dzzz-app/src/main/java/com/tdh/bdzz/dao/AnnotationTypesMapper.java` -> `com.tdh.bdzz.dao.AnnotationTypesMapper`
  - `dzzz-app/src/main/java/com/tdh/bdzz/dao/BookmarksMapper.java` -> `com.tdh.bdzz.dao.BookmarksMapper`
- 所需课程：`backend.java.learn.intermediate.spring-mvc-and-servlet-boundaries`、`backend.java.learn.intermediate.layers-dto-and-service-boundaries`、`backend.java.learn.intermediate.mybatis-and-mybatis-plus`、`backend.java.learn.intermediate.transactions-and-idempotency`
- 去敏要求：删除业务标识、地址、凭据、人员与案件数据，仅保留最小结构和可验证合同。
- 旧写法风险：项目代码只作为问题与边界证据，必须按对应风险课程纠正，不能直接复制为推荐实现。
- 预期改写状态：Phase 5 重新设计最小现代实现，保留 legacy 差异说明。
- 当前状态：`not-started`

## backend.java.projects.dzzz-app.validation-error-response-chain

- 标题：参数校验、统一异常与响应链
- 项目证据（相对路径 -> 稳定符号）：
  - `dzzz-app/src/main/java/com/tdh/bdzz/aop/DzzzAspect.java` -> `DzzzAspect 参数校验切面`
  - `dzzz-app/src/main/java/com/tdh/bdzz/util/ValidatorUtil.java` -> `ValidatorUtil.validator`
  - `dzzz-app/src/main/java/com/tdh/bdzz/aop/DzzzAspect.java` -> `ArgumentNotValidException 抛出点`
  - `dzzz-app/src/main/java/com/tdh/bdzz/exception/GloableExceptionHandler.java` -> `GloableExceptionHandler.handleArgumentNotValidException`
  - `dzzz-app/src/main/java/com/tdh/bdzz/annoation/CltjrSf.java` -> `com.tdh.bdzz.annoation.CltjrSf`
  - `dzzz-app/src/main/java/com/tdh/bdzz/dto/swtpad/meeting/AddSwtHyjhDTO.java` -> `com.tdh.bdzz.dto.swtpad.meeting.AddSwtHyjhDTO`
  - `dzzz-app/src/main/java/com/tdh/bdzz/annoation/impl/CltjrSfValidator.java` -> `com.tdh.bdzz.annoation.impl.CltjrSfValidator`
  - `dzzz-app/src/main/java/com/tdh/bdzz/validator/MinValidator.java` -> `com.tdh.bdzz.validator.MinValidator`
  - `dzzz-app/src/main/java/com/tdh/bdzz/controller/BaseOuterController.java` -> `com.tdh.bdzz.controller.BaseOuterController`
  - `dzzz-app/src/main/java/com/tdh/bdzz/handler/datareport/HkDataReportHandler.java` -> `com.tdh.bdzz.handler.datareport.HkDataReportHandler`
  - `dzzz-app/src/main/java/com/tdh/bdzz/util/ErrorMessage.java` -> `com.tdh.bdzz.util.ErrorMessage`
  - `dzzz-app/src/main/java/com/tdh/bdzz/validator/Error.java` -> `com.tdh.bdzz.validator.Error`
  - `dzzz-app/src/main/java/com/tdh/bdzz/exception/ArgumentNotValidException.java` -> `com.tdh.bdzz.exception.ArgumentNotValidException`
  - `dzzz-app/src/main/java/com/tdh/bdzz/exception/GloableExceptionHandler.java` -> `com.tdh.bdzz.exception.GloableExceptionHandler`
  - `dzzz-app/src/main/java/com/tdh/bdzz/controller/ClientZzController.java` -> `com.tdh.bdzz.controller.ClientZzController`
  - `dzzz-app/src/main/java/com/tdh/bdzz/controller/CommController.java` -> `com.tdh.bdzz.controller.CommController`
  - `dzzz-app/src/main/java/com/tdh/bdzz/controller/FileController.java` -> `com.tdh.bdzz.controller.FileController`
- 所需课程：`backend.java.learn.intermediate.bean-validation-and-input-contracts`、`backend.java.learn.intermediate.errors-results-and-logging`、`backend.java.learn.advanced.secure-input-and-api-exposure`
- 去敏要求：删除业务标识、地址、凭据、人员与案件数据，仅保留最小结构和可验证合同。
- 旧写法风险：项目代码只作为问题与边界证据，必须按对应风险课程纠正，不能直接复制为推荐实现。
- 预期改写状态：Phase 5 重新设计最小现代实现，保留 legacy 差异说明。
- 当前状态：`not-started`

## backend.java.projects.dzzz-app.transactional-update-chain

- 标题：事务内更新与外部副作用边界
- 项目证据（相对路径 -> 稳定符号）：
  - `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FileServiceImpl.java` -> `@Transactional uploadDocCameraPic`
  - `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FileServiceImpl.java` -> `CommonUtil.base64ToFile 文件写入`
  - `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FileServiceImpl.java` -> `FileTypeUtils.checkFileType 调用`
  - `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FileServiceImpl.java` -> `DzzzTsszclMapper.insert 调用`
  - `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FileServiceImpl.java` -> `EajFileMapper.insert 调用`
  - `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FileServiceImpl.java` -> `TaskExecutor.execute 异步副作用`
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/MybatisPlusConfig.java` -> `注册 TableShardInterceptor`
  - `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FileServiceImpl.java` -> `TableShardContext.setShardData 调用`
  - `dzzz-app/src/main/java/com/tdh/bdzz/context/TableShardContext.java` -> `TableShardContext.setShardData`
  - `dzzz-app/src/main/java/com/tdh/bdzz/dao/EajFileMapper.java` -> `@TableShard 声明`
  - `dzzz-app/src/main/java/com/tdh/bdzz/shard/TableShardInterceptor.java` -> `TableShardInterceptor.intercept`
  - `dzzz-app/src/main/java/com/tdh/bdzz/shard/TableShardInterceptor.java` -> `IShardStrategy.generateTableName 调用`
  - `dzzz-app/src/main/java/com/tdh/bdzz/shard/AjbsShardStrategy.java` -> `AjbsShardStrategy.generateTableName`
  - `dzzz-app/src/main/java/com/tdh/bdzz/shard/AjbsShardStrategy.java` -> `TableShardContext.getShardData 调用`
  - `dzzz-app/src/main/java/com/tdh/bdzz/context/TableShardContext.java` -> `TableShardContext.getShardData`
  - `dzzz-app/src/main/java/com/tdh/bdzz/shard/TableShardInterceptor.java` -> `SQL 表名改写`
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/MybatisPlusConfig.java` -> `com.tdh.bdzz.config.MybatisPlusConfig`
  - `dzzz-app/src/main/java/com/tdh/bdzz/service/JzApiService.java` -> `com.tdh.bdzz.service.JzApiService`
  - `dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/fileProcess/AbstractFileProcessHandler.java` -> `com.tdh.bdzz.timer.handler.fileProcess.AbstractFileProcessHandler`
  - `dzzz-app/src/main/java/com/tdh/bdzz/service/UimService.java` -> `com.tdh.bdzz.service.UimService`
  - `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/AiXntjServiceImpl.java` -> `com.tdh.bdzz.service.impl.AiXntjServiceImpl`
  - `dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/clearExpireData/ClearLocalCacheHandler.java` -> `com.tdh.bdzz.timer.handler.clearExpireData.ClearLocalCacheHandler`
  - `dzzz-app/src/test/java/com/tdh/bdzz/service/tsaiassistant/TsLegalReasoningResultParserTest.java` -> `com.tdh.bdzz.service.tsaiassistant.TsLegalReasoningResultParserTest`
  - `dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/fileProcess/EajJzFileProcessHandler.java` -> `com.tdh.bdzz.timer.handler.fileProcess.EajJzFileProcessHandler`
  - `dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/clearExpireData/ClearLocalLogHandler.java` -> `com.tdh.bdzz.timer.handler.clearExpireData.ClearLocalLogHandler`
  - `dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/clearExpireData/CloseTdhHjptStreamForXxtHandler.java` -> `com.tdh.bdzz.timer.handler.clearExpireData.CloseTdhHjptStreamForXxtHandler`
  - `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/BlmbServiceImpl.java` -> `com.tdh.bdzz.service.impl.BlmbServiceImpl`
  - `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/BlockChainServiceImpl.java` -> `com.tdh.bdzz.service.impl.BlockChainServiceImpl`
  - `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/CameraServiceImpl.java` -> `com.tdh.bdzz.service.impl.CameraServiceImpl`
- 所需课程：`backend.java.learn.intermediate.transactions-and-idempotency`、`backend.java.learn.advanced.file-storage-and-archive-boundaries`、`backend.java.learn.advanced.database-sharding-and-sql-boundaries`、`backend.java.learn.advanced.thread-context-and-cleanup`
- 去敏要求：删除业务标识、地址、凭据、人员与案件数据，仅保留最小结构和可验证合同。
- 旧写法风险：项目代码只作为问题与边界证据，必须按对应风险课程纠正，不能直接复制为推荐实现。
- 预期改写状态：Phase 5 重新设计最小现代实现，保留 legacy 差异说明。
- 当前状态：`not-started`

## backend.java.projects.dzzz-app.websocket-session-chain

- 标题：WebSocket 连接、消息、心跳与关闭链
- 项目证据（相对路径 -> 稳定符号）：
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientChatWsServer.java` -> `ClientChatWsServer.onOpen`
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientChatWsServer.java` -> `ClientChatWsServer.onMessage`
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientChatWsServer.java` -> `NbjlService.saveNbjl 调用`
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientChatWsServer.java` -> `ClientChatWsServer.onClose`
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/DzzzEndpointConfigure.java` -> `com.tdh.bdzz.config.websocket.DzzzEndpointConfigure`
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientZzWsServer.java` -> `com.tdh.bdzz.config.websocket.server.ClientZzWsServer`
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/Voice2TextWsServer.java` -> `com.tdh.bdzz.config.websocket.server.Voice2TextWsServer`
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/WebSocketConfig.java` -> `com.tdh.bdzz.config.websocket.WebSocketConfig`
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/AppFrontYyzxWsServer.java` -> `com.tdh.bdzz.config.websocket.server.AppFrontYyzxWsServer`
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/OnlyOfficeWsServer.java` -> `com.tdh.bdzz.config.websocket.server.OnlyOfficeWsServer`
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/BlOperationWsServer.java` -> `com.tdh.bdzz.config.websocket.server.BlOperationWsServer`
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/fyb/jdyh/NoteSignWsServer.java` -> `com.tdh.bdzz.config.websocket.server.fyb.jdyh.NoteSignWsServer`
- 所需课程：`backend.java.learn.advanced.websocket-and-realtime-lifecycle`
- 去敏要求：删除业务标识、地址、凭据、人员与案件数据，仅保留最小结构和可验证合同。
- 旧写法风险：项目代码只作为问题与边界证据，必须按对应风险课程纠正，不能直接复制为推荐实现。
- 预期改写状态：Phase 5 重新设计最小现代实现，保留 legacy 差异说明。
- 当前状态：`not-started`

## backend.java.projects.dzzz-app.scheduled-external-system-chain

- 标题：调度任务与外部系统适配链
- 项目证据（相对路径 -> 稳定符号）：
  - `dzzz-app/src/main/java/com/tdh/bdzz/timer/controller/HxDataReportController.java` -> `HxDataReportController.loadData`
  - `dzzz-app/src/main/java/com/tdh/bdzz/timer/HxDataReportTask.java` -> `HxDataReportTask.reportData`
  - `dzzz-app/src/main/java/com/tdh/bdzz/timer/HxDataReportTask.java` -> `HxDataReportTask.reportCourtInfo`
  - `dzzz-app/src/main/java/com/tdh/bdzz/timer/HxDataReportTask.java` -> `HxHttpDataReportHandler.callHxHttpTsXcInterface 调用`
  - `dzzz-app/src/main/java/com/tdh/bdzz/handler/datareport/HxHttpDataReportHandler.java` -> `HxHttpDataReportHandler.callHxHttpTsXcInterface`
  - `dzzz-app/src/main/java/com/tdh/bdzz/handler/datareport/HxHttpDataReportHandler.java` -> `RestTemplate.exchange 调用`
  - `dzzz-app/src/main/java/com/tdh/bdzz/timer/service/TslxDataSyncService.java` -> `ApplicationEventPublisher.publishEvent`
  - `dzzz-app/src/main/java/com/tdh/bdzz/listener/DataReportListener.java` -> `DataReportListener.onApplicationEvent`
  - `dzzz-app/src/main/java/com/tdh/bdzz/listener/DataReportListener.java` -> `DataReportHandlerFactory.getInstance 调用`
  - `dzzz-app/src/main/java/com/tdh/bdzz/handler/datareport/DataReportHandlerFactory.java` -> `DataReportHandlerFactory.getInstance`
  - `dzzz-app/src/main/java/com/tdh/bdzz/handler/datareport/DataReportHandler.java` -> `DataReportHandler 合同`
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/CxfConfig.java` -> `com.tdh.bdzz.config.CxfConfig`
  - `dzzz-app/src/main/java/com/tdh/bdzz/util/CxfClientUtil.java` -> `com.tdh.bdzz.util.CxfClientUtil`
  - `dzzz-app/src/main/java/com/tdh/bdzz/ws/ReTransmissionService.java` -> `com.tdh.bdzz.ws.ReTransmissionService`
  - `dzzz-app/src/main/java/com/tdh/bdzz/po/vidyo/admin/VidyoPortalAdminServicePortType.java` -> `com.tdh.bdzz.po.vidyo.admin.VidyoPortalAdminServicePortType`
  - `dzzz-app/src/main/java/com/tdh/bdzz/util/DynamicInvoker.java` -> `com.tdh.bdzz.util.DynamicInvoker`
  - `dzzz-app/src/main/java/com/tdh/bdzz/util/NlzxUtil.java` -> `com.tdh.bdzz.util.NlzxUtil`
  - `dzzz-app/src/main/java/com/tdh/bdzz/timer/service/ClearExpiredDataService.java` -> `com.tdh.bdzz.timer.service.ClearExpiredDataService`
  - `dzzz-app/src/main/java/com/tdh/bdzz/handler/burn/BurnPrintHandler.java` -> `com.tdh.bdzz.handler.burn.BurnPrintHandler`
  - `dzzz-app/src/main/java/com/tdh/bdzz/handler/datareport/HkDataReportHandler.java` -> `com.tdh.bdzz.handler.datareport.HkDataReportHandler`
  - `dzzz-app/src/main/java/com/tdh/bdzz/handler/burn/HmBurnPrintHandler.java` -> `com.tdh.bdzz.handler.burn.HmBurnPrintHandler`
  - `dzzz-app/src/main/java/com/tdh/DzzzAreaApplication.java` -> `com.tdh.DzzzAreaApplication`
  - `dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/clearExpireData/ClearLocalCacheHandler.java` -> `com.tdh.bdzz.timer.handler.clearExpireData.ClearLocalCacheHandler`
  - `dzzz-app/src/main/java/com/tdh/bdzz/timer/trialInspect/CheckCameraTask.java` -> `com.tdh.bdzz.timer.trialInspect.CheckCameraTask`
  - `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/InitHyServiceImpl.java` -> `com.tdh.bdzz.service.impl.InitHyServiceImpl`
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/ThreadPoolConfig.java` -> `com.tdh.bdzz.config.ThreadPoolConfig`
  - `dzzz-app/src/main/java/com/tdh/bdzz/timer/ClearExpiredDataTask.java` -> `com.tdh.bdzz.timer.ClearExpiredDataTask`
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingWSServer.java` -> `com.tdh.bdzz.config.websocket.server.LoggingWSServer`
  - `dzzz-app/src/main/java/com/tdh/bdzz/timer/DxReportTask.java` -> `com.tdh.bdzz.timer.DxReportTask`
  - `dzzz-app/src/main/java/com/tdh/bdzz/timer/EndYchyTask.java` -> `com.tdh.bdzz.timer.EndYchyTask`
  - `dzzz-app/src/main/java/com/tdh/bdzz/timer/controller/ClearExpiredDataController.java` -> `com.tdh.bdzz.timer.controller.ClearExpiredDataController`
- 所需课程：`backend.java.learn.advanced.events-async-scheduling-and-retry`、`backend.java.learn.advanced.http-clients-and-integration-resilience`、`backend.java.learn.advanced.chains-registries-and-state-machines`
- 去敏要求：删除业务标识、地址、凭据、人员与案件数据，仅保留最小结构和可验证合同。
- 旧写法风险：项目代码只作为问题与边界证据，必须按对应风险课程纠正，不能直接复制为推荐实现。
- 预期改写状态：Phase 5 重新设计最小现代实现，保留 legacy 差异说明。
- 当前状态：`not-started`

## backend.java.projects.dzzz-app.file-storage-transfer-chain

- 标题：文件上传、对象存储、传输与下载链
- 项目证据（相对路径 -> 稳定符号）：
  - `dzzz-app/src/main/java/com/tdh/bdzz/upload/UploadUtil.java` -> `UploadUtil.upload`
  - `dzzz-app/src/main/java/com/tdh/bdzz/upload/UploadUtil.java` -> `StorageMode.upload 调用`
  - `dzzz-app/src/main/java/com/tdh/bdzz/enums/StorageMode.java` -> `StorageMode 策略枚举`
  - `dzzz-app/src/main/java/com/tdh/bdzz/upload/Uploader.java` -> `Uploader.upload`
  - `dzzz-app/src/main/java/com/tdh/bdzz/upload/LocalUploader.java` -> `LocalUploader.upload`
  - `dzzz-app/src/main/java/com/tdh/bdzz/upload/SftpUploader.java` -> `SftpUploader.upload`
  - `dzzz-app/src/main/java/com/tdh/bdzz/upload/S3Uploader.java` -> `S3Uploader.upload`
  - `dzzz-app/src/main/java/com/tdh/bdzz/upload/MossUploader.java` -> `MossUploader.upload`
  - `dzzz-app/src/main/java/com/tdh/bdzz/storage/FtpWork.java` -> `com.tdh.bdzz.storage.FtpWork`
  - `dzzz-app/src/main/java/com/tdh/bdzz/download/LocalDownloader.java` -> `com.tdh.bdzz.download.LocalDownloader`
  - `dzzz-app/src/main/java/com/tdh/bdzz/download/MossDownloader.java` -> `com.tdh.bdzz.download.MossDownloader`
  - `dzzz-app/src/main/java/com/tdh/bdzz/download/S3Downloader.java` -> `com.tdh.bdzz.download.S3Downloader`
  - `dzzz-app/src/main/java/com/tdh/bdzz/download/SftpDownloader.java` -> `com.tdh.bdzz.download.SftpDownloader`
  - `dzzz-app/src/main/java/com/tdh/bdzz/storage/S3Utils.java` -> `com.tdh.bdzz.storage.S3Utils`
  - `dzzz-app/src/main/java/com/tdh/bdzz/storage/MossClientUtil.java` -> `com.tdh.bdzz.storage.MossClientUtil`
  - `dzzz-app/src/main/java/com/tdh/bdzz/download/DownloadResponse.java` -> `com.tdh.bdzz.download.DownloadResponse`
  - `dzzz-app/src/main/java/com/tdh/bdzz/upload/UploadUtil.java` -> `com.tdh.bdzz.upload.UploadUtil`
  - `dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/fileProcess/AbstractFileProcessHandler.java` -> `com.tdh.bdzz.timer.handler.fileProcess.AbstractFileProcessHandler`
  - `dzzz-app/src/main/java/com/tdh/util/FileTypeUtils.java` -> `com.tdh.util.FileTypeUtils`
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/SysConfig.java` -> `com.tdh.bdzz.config.SysConfig`
  - `dzzz-app/src/main/java/com/tdh/bdzz/download/DownloadUtil.java` -> `com.tdh.bdzz.download.DownloadUtil`
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingWSServer.java` -> `com.tdh.bdzz.config.websocket.server.LoggingWSServer`
  - `dzzz-app/src/main/java/com/tdh/bdzz/util/CommonUtil.java` -> `com.tdh.bdzz.util.CommonUtil`
  - `dzzz-app/src/main/java/com/tdh/bdzz/controller/BlmbController.java` -> `com.tdh.bdzz.controller.BlmbController`
- 所需课程：`backend.java.learn.advanced.file-storage-and-archive-boundaries`、`backend.java.learn.advanced.http-clients-and-integration-resilience`、`backend.java.learn.intermediate.service-design-patterns`
- 去敏要求：删除业务标识、地址、凭据、人员与案件数据，仅保留最小结构和可验证合同。
- 旧写法风险：项目代码只作为问题与边界证据，必须按对应风险课程纠正，不能直接复制为推荐实现。
- 预期改写状态：Phase 5 重新设计最小现代实现，保留 legacy 差异说明。
- 当前状态：`not-started`

## backend.java.projects.dzzz-app.document-media-processing-chain

- 标题：文档、媒体、二维码与模型处理链
- 项目证据（相对路径 -> 稳定符号）：
  - `dzzz-app/src/main/java/com/tdh/bdzz/util/AsposePdfUtils.java` -> `com.tdh.bdzz.util.AsposePdfUtils`
  - `dzzz-app/src/main/java/com/tdh/bdzz/util/ConvertPdf.java` -> `com.tdh.bdzz.util.ConvertPdf`
  - `dzzz-app/src/main/java/com/tdh/bdzz/util/PptUtil.java` -> `com.tdh.bdzz.util.PptUtil`
  - `dzzz-app/src/test/java/com/tdh/bdzz/service/impl/TsFileSignNewDragServiceImplTest.java` -> `com.tdh.bdzz.service.impl.TsFileSignNewDragServiceImplTest`
  - `dzzz-app/src/main/java/com/tdh/bdzz/util/PdfKeywordPositionUtil.java` -> `com.tdh.bdzz.util.PdfKeywordPositionUtil`
  - `dzzz-app/src/main/java/com/tdh/bdzz/factories/flv/ConverterFactories.java` -> `com.tdh.bdzz.factories.flv.ConverterFactories`
  - `dzzz-app/src/main/java/com/tdh/bdzz/factories/flv/ConverterTranFactories.java` -> `com.tdh.bdzz.factories.flv.ConverterTranFactories`
  - `dzzz-app/src/main/java/com/tdh/bdzz/util/HandwritingClassifier.java` -> `com.tdh.bdzz.util.HandwritingClassifier`
  - `dzzz-app/src/main/java/com/tdh/bdzz/util/TwoDimensionCode.java` -> `com.tdh.bdzz.util.TwoDimensionCode`
  - `dzzz-app/src/main/java/com/tdh/bdzz/util/TwoDimensionCodeImage.java` -> `com.tdh.bdzz.util.TwoDimensionCodeImage`
  - `dzzz-app/src/main/java/com/tdh/bdzz/factories/flv/Converter.java` -> `com.tdh.bdzz.factories.flv.Converter`
  - `dzzz-app/src/main/java/com/tdh/bdzz/util/PdfKeywordTextStripper.java` -> `com.tdh.bdzz.util.PdfKeywordTextStripper`
  - `dzzz-app/src/main/java/com/tdh/bdzz/util/WordToPdfUtil.java` -> `com.tdh.bdzz.util.WordToPdfUtil`
  - `dzzz-app/src/main/java/com/tdh/bdzz/handler/voice2text/Voice2TextHandler.java` -> `com.tdh.bdzz.handler.voice2text.Voice2TextHandler`
  - `dzzz-app/src/main/java/tdh/platform/component/license/lic/impl/LicFactoryImpl.java` -> `tdh.platform.component.license.lic.impl.LicFactoryImpl`
  - `dzzz-app/src/test/java/com/tdh/bdzz/util/KeywordSignatureMergeTest.java` -> `com.tdh.bdzz.util.KeywordSignatureMergeTest`
  - `dzzz-app/src/main/java/com/tdh/bdzz/util/DateImageGenerator.java` -> `com.tdh.bdzz.util.DateImageGenerator`
  - `dzzz-app/src/main/java/com/tdh/bdzz/util/FingerprintMergeLayoutUtil.java` -> `com.tdh.bdzz.util.FingerprintMergeLayoutUtil`
  - `dzzz-app/src/main/java/com/tdh/bdzz/util/ImageMergerUtil.java` -> `com.tdh.bdzz.util.ImageMergerUtil`
  - `dzzz-app/src/main/java/com/tdh/bdzz/handler/voice2text/BjhyVoice2TextHandler.java` -> `com.tdh.bdzz.handler.voice2text.BjhyVoice2TextHandler`
  - `dzzz-app/src/main/java/com/tdh/bdzz/handler/datareport/DataReportHandler.java` -> `com.tdh.bdzz.handler.datareport.DataReportHandler`
  - `dzzz-app/src/main/java/com/tdh/bdzz/validator/Error.java` -> `com.tdh.bdzz.validator.Error`
  - `dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/commonJzDataSync/CommonJzDataSyncHandler.java` -> `com.tdh.bdzz.timer.handler.commonJzDataSync.CommonJzDataSyncHandler`
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingFileTailReader.java` -> `com.tdh.bdzz.config.websocket.server.LoggingFileTailReader`
- 所需课程：`backend.java.learn.advanced.binary-streams-media-and-backpressure`、`backend.java.learn.advanced.process-jvm-and-observability`
- 去敏要求：删除业务标识、地址、凭据、人员与案件数据，仅保留最小结构和可验证合同。
- 旧写法风险：项目代码只作为问题与边界证据，必须按对应风险课程纠正，不能直接复制为推荐实现。
- 预期改写状态：Phase 5 重新设计最小现代实现，保留 legacy 差异说明。
- 当前状态：`not-started`

## backend.java.projects.dzzz-app.license-and-legacy-security-review

- 标题：许可证与 legacy 安全边界复核
- 项目证据（相对路径 -> 稳定符号）：
  - `dzzz-app/src/main/java/tdh/platform/component/license/lic/License.java` -> `tdh.platform.component.license.lic.License`
  - `dzzz-app/src/main/java/tdh/platform/component/license/lic/impl/LicFactoryImpl.java` -> `tdh.platform.component.license.lic.impl.LicFactoryImpl`
  - `dzzz-app/src/main/java/com/tdh/bdzz/filter/TokenLoginFilter.java` -> `com.tdh.bdzz.filter.TokenLoginFilter`
  - `dzzz-app/src/main/java/com/tdh/bdzz/filter/DesFilter.java` -> `com.tdh.bdzz.filter.DesFilter`
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/HeaderRequestInterceptor.java` -> `com.tdh.bdzz.config.HeaderRequestInterceptor`
  - `dzzz-app/src/main/java/com/tdh/bdzz/util/SSLClient.java` -> `com.tdh.bdzz.util.SSLClient`
  - `dzzz-app/src/main/java/com/tdh/bdzz/util/AESUtils.java` -> `com.tdh.bdzz.util.AESUtils`
  - `dzzz-app/src/main/java/com/tdh/bdzz/util/CodeGenerator.java` -> `com.tdh.bdzz.util.CodeGenerator`
  - `dzzz-app/src/main/java/com/tdh/bdzz/util/CommonUtil.java` -> `com.tdh.bdzz.util.CommonUtil`
  - `dzzz-app/src/main/java/com/tdh/bdzz/config/MybatisPlusConfig.java` -> `com.tdh.bdzz.config.MybatisPlusConfig`
  - `dzzz-app/src/main/java/com/tdh/bdzz/annoation/AutoValid.java` -> `com.tdh.bdzz.annoation.AutoValid`
  - `dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/clearExpireData/YzwYhbmSyncDataHandler.java` -> `com.tdh.bdzz.timer.handler.clearExpireData.YzwYhbmSyncDataHandler`
  - `dzzz-app/src/main/java/com/tdh/bdzz/download/MossDownloader.java` -> `com.tdh.bdzz.download.MossDownloader`
- 所需课程：`backend.java.learn.advanced.cryptography-secrets-and-license-verification`、`backend.java.learn.advanced.legacy-isolation-and-modernization`
- 去敏要求：删除业务标识、地址、凭据、人员与案件数据，仅保留最小结构和可验证合同。
- 旧写法风险：项目代码只作为问题与边界证据，必须按对应风险课程纠正，不能直接复制为推荐实现。
- 预期改写状态：Phase 5 重新设计最小现代实现，保留 legacy 差异说明。
- 当前状态：`not-started`
