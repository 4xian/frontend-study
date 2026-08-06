# `dzzz-app` 代表性架构与调用链

> 所有链路都限制在冻结 `dzzz-app/` 路径。它们是静态源码证据，不冒充运行时验证。

## CALL-PATH-001 Web 请求、业务服务与数据访问链

- 状态：`static-source-verified`
- 所需课程：`backend.java.learn.intermediate.spring-mvc-and-servlet-boundaries`、`backend.java.learn.intermediate.layers-dto-and-service-boundaries`、`backend.java.learn.intermediate.mybatis-and-mybatis-plus`
- 项目候选：`backend.java.projects.dzzz-app.request-service-mapper-chain`
- 静态步骤：
  1. `dzzz-app/src/main/java/com/tdh/bdzz/controller/hxhttp/HxHttpFeedBackController.java:24` -> `HxHttpFeedBackController.getPqTjSj`（SHA-256 `6bd060748fe6e9201748d5391477d4a3e6d4737d5502eb558e242c8c96cf1719`）
  2. `dzzz-app/src/main/java/com/tdh/bdzz/service/hxHttp/HxHttpFeedBackService.java:12` -> `HxHttpFeedBackService.getPqTjSj`（SHA-256 `e5bd8b7bfd68bd2fe23f284b1a25b8230e0618b89b358a54fa7737e10708a746`）
  3. `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/hxHttp/HxHttpFeedBackServiceImpl.java:109` -> `HxHttpFeedBackServiceImpl.getPqTjSj`（SHA-256 `d08c937511c1d3a6cb8a3fd008c2dc82afc495d07e6f77111d38051c360eaf01`）
  4. `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/hxHttp/HxHttpFeedBackServiceImpl.java:128` -> `EajFtsyMapper.selectList 调用`（SHA-256 `d08c937511c1d3a6cb8a3fd008c2dc82afc495d07e6f77111d38051c360eaf01`）
- 边界：静态源码证明请求委派和 Mapper 调用关系，不证明数据库运行结果。

## CALL-PATH-002 参数校验与统一异常响应链

- 状态：`static-source-verified`
- 所需课程：`backend.java.learn.intermediate.bean-validation-and-input-contracts`、`backend.java.learn.intermediate.errors-results-and-logging`、`backend.java.learn.advanced.secure-input-and-api-exposure`
- 项目候选：`backend.java.projects.dzzz-app.validation-error-response-chain`
- 静态步骤：
  1. `dzzz-app/src/main/java/com/tdh/bdzz/aop/DzzzAspect.java:84` -> `DzzzAspect 参数校验切面`（SHA-256 `c0997b2207d6dadee077c7b23d13268c2a6735e7dc97be5bafbb65def8d8267e`）
  2. `dzzz-app/src/main/java/com/tdh/bdzz/util/ValidatorUtil.java:39` -> `ValidatorUtil.validator`（SHA-256 `cfa8e9ed4432ba28db4780eb6374ca4ec4d69acb69d79a76dec51703848e012b`）
  3. `dzzz-app/src/main/java/com/tdh/bdzz/aop/DzzzAspect.java:87` -> `ArgumentNotValidException 抛出点`（SHA-256 `c0997b2207d6dadee077c7b23d13268c2a6735e7dc97be5bafbb65def8d8267e`）
  4. `dzzz-app/src/main/java/com/tdh/bdzz/exception/GloableExceptionHandler.java:49` -> `GloableExceptionHandler.handleArgumentNotValidException`（SHA-256 `18d04c1fa26cd929b0300800118771cf9da7df466a26c1dacd37391719c72e17`）
- 边界：静态源码证明私有校验器、异常类型和处理器的连接，不把私有校验习惯提升为推荐实践。

## CALL-PATH-003 事务上传与外部副作用边界

- 状态：`static-source-verified`
- 所需课程：`backend.java.learn.intermediate.transactions-and-idempotency`、`backend.java.learn.advanced.file-storage-and-archive-boundaries`
- 项目候选：`backend.java.projects.dzzz-app.transactional-update-chain`
- 静态步骤：
  1. `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FileServiceImpl.java:282` -> `@Transactional uploadDocCameraPic`（SHA-256 `3a7dce2613b584fcaf1086585a89eb7769661a700dae2d5c68af1c97dbcc146a`）
  2. `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FileServiceImpl.java:305` -> `CommonUtil.base64ToFile 文件写入`（SHA-256 `3a7dce2613b584fcaf1086585a89eb7769661a700dae2d5c68af1c97dbcc146a`）
  3. `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FileServiceImpl.java:306` -> `FileTypeUtils.checkFileType 调用`（SHA-256 `3a7dce2613b584fcaf1086585a89eb7769661a700dae2d5c68af1c97dbcc146a`）
  4. `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FileServiceImpl.java:349` -> `DzzzTsszclMapper.insert 调用`（SHA-256 `3a7dce2613b584fcaf1086585a89eb7769661a700dae2d5c68af1c97dbcc146a`）
  5. `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FileServiceImpl.java:364` -> `EajFileMapper.insert 调用`（SHA-256 `3a7dce2613b584fcaf1086585a89eb7769661a700dae2d5c68af1c97dbcc146a`）
  6. `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FileServiceImpl.java:372` -> `TaskExecutor.execute 异步副作用`（SHA-256 `3a7dce2613b584fcaf1086585a89eb7769661a700dae2d5c68af1c97dbcc146a`）
- 边界：静态源码只证明事务注解和调用边界；数据库事务不能推出文件等外部副作用可回滚。

## CALL-PATH-004 WebSocket 会话生命周期链

- 状态：`static-source-verified`
- 所需课程：`backend.java.learn.advanced.websocket-and-realtime-lifecycle`
- 项目候选：`backend.java.projects.dzzz-app.websocket-session-chain`
- 静态步骤：
  1. `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientChatWsServer.java:83` -> `ClientChatWsServer.onOpen`（SHA-256 `73ea51927d7ae36903a4918c64061e34dce89b1534e51f246dce92304381368c`）
  2. `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientChatWsServer.java:158` -> `ClientChatWsServer.onMessage`（SHA-256 `73ea51927d7ae36903a4918c64061e34dce89b1534e51f246dce92304381368c`）
  3. `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientChatWsServer.java:239` -> `NbjlService.saveNbjl 调用`（SHA-256 `73ea51927d7ae36903a4918c64061e34dce89b1534e51f246dce92304381368c`）
  4. `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientChatWsServer.java:120` -> `ClientChatWsServer.onClose`（SHA-256 `73ea51927d7ae36903a4918c64061e34dce89b1534e51f246dce92304381368c`）
- 边界：静态源码证明连接、消息、持久化调用与关闭清理入口，不证明并发时序和慢客户端行为。

## CALL-PATH-005 定时上报与外部 HTTP 链

- 状态：`static-source-verified`
- 所需课程：`backend.java.learn.advanced.events-async-scheduling-and-retry`、`backend.java.learn.advanced.http-clients-and-integration-resilience`
- 项目候选：`backend.java.projects.dzzz-app.scheduled-external-system-chain`
- 静态步骤：
  1. `dzzz-app/src/main/java/com/tdh/bdzz/timer/controller/HxDataReportController.java:26` -> `HxDataReportController.loadData`（SHA-256 `bbc939bdfcc1755f40664db7115052d1d4d995a0e3589015984381cb52ca6365`）
  2. `dzzz-app/src/main/java/com/tdh/bdzz/timer/HxDataReportTask.java:150` -> `HxDataReportTask.reportData`（SHA-256 `478206de135791e4f9bdd656c59c7c2fafb89b399b5b1a1b43f167b8e7cd8570`）
  3. `dzzz-app/src/main/java/com/tdh/bdzz/timer/HxDataReportTask.java:183` -> `HxDataReportTask.reportCourtInfo`（SHA-256 `478206de135791e4f9bdd656c59c7c2fafb89b399b5b1a1b43f167b8e7cd8570`）
  4. `dzzz-app/src/main/java/com/tdh/bdzz/timer/HxDataReportTask.java:231` -> `HxHttpDataReportHandler.callHxHttpTsXcInterface 调用`（SHA-256 `478206de135791e4f9bdd656c59c7c2fafb89b399b5b1a1b43f167b8e7cd8570`）
  5. `dzzz-app/src/main/java/com/tdh/bdzz/handler/datareport/HxHttpDataReportHandler.java:492` -> `HxHttpDataReportHandler.callHxHttpTsXcInterface`（SHA-256 `1f3e2093ae1aa20a0814fcadf878d3b716ffbb2a33144a049c6b8be4e8999eb5`）
  6. `dzzz-app/src/main/java/com/tdh/bdzz/handler/datareport/HxHttpDataReportHandler.java:505` -> `RestTemplate.exchange 调用`（SHA-256 `1f3e2093ae1aa20a0814fcadf878d3b716ffbb2a33144a049c6b8be4e8999eb5`）
- 边界：静态源码证明调度方法到 HTTP 客户端的调用，不证明网络成功、重试效果或运行时配置。

## CALL-PATH-006 文件存储策略与适配器链

- 状态：`static-source-verified`
- 所需课程：`backend.java.learn.advanced.file-storage-and-archive-boundaries`、`backend.java.learn.intermediate.service-design-patterns`
- 项目候选：`backend.java.projects.dzzz-app.file-storage-transfer-chain`
- 静态步骤：
  1. `dzzz-app/src/main/java/com/tdh/bdzz/upload/UploadUtil.java:47` -> `UploadUtil.upload`（SHA-256 `22b66fcb37f7ef0896a788eccd226b5718c610f97079697b114ecc58b37d6d59`）
  2. `dzzz-app/src/main/java/com/tdh/bdzz/upload/UploadUtil.java:68` -> `StorageMode.upload 调用`（SHA-256 `22b66fcb37f7ef0896a788eccd226b5718c610f97079697b114ecc58b37d6d59`）
  3. `dzzz-app/src/main/java/com/tdh/bdzz/enums/StorageMode.java:20` -> `StorageMode 策略枚举`（SHA-256 `84fb70fc41b63bb990c5a4529ef29f1f89c5d0643570a3321232380d1ec0e8cc`）
  4. `dzzz-app/src/main/java/com/tdh/bdzz/upload/Uploader.java:25` -> `Uploader.upload`（SHA-256 `8795dcd950abeb934ea2bff405a56ba544d0a8e066d01f9c1e96d57607548192`）
  5. `dzzz-app/src/main/java/com/tdh/bdzz/upload/LocalUploader.java:47` -> `LocalUploader.upload`（SHA-256 `b0b7f0b654d5ecd71e096181fd1260ef47fff5b2909218b86ae1596212a6eb13`）
  6. `dzzz-app/src/main/java/com/tdh/bdzz/upload/SftpUploader.java:56` -> `SftpUploader.upload`（SHA-256 `840d6653867d300f00e11ac9f8886a3ae91c2230fbaa27d9ff2fe353465dd751`）
  7. `dzzz-app/src/main/java/com/tdh/bdzz/upload/S3Uploader.java:46` -> `S3Uploader.upload`（SHA-256 `b353bcdfb18ef0663628dded727f3c599c0e6f51f339835f334024628e7202fa`）
  8. `dzzz-app/src/main/java/com/tdh/bdzz/upload/MossUploader.java:43` -> `MossUploader.upload`（SHA-256 `cb5e2c0167a7fd06e055e9ab39216fc18b49e6fa99f7771815acdefb77689357`）
- 边界：静态源码证明策略分派和适配器实现，不证明凭据、远端可用性或上传结果。

## CALL-PATH-007 MyBatis-Plus 分片拦截链

- 状态：`static-source-verified`
- 所需课程：`backend.java.learn.advanced.database-sharding-and-sql-boundaries`、`backend.java.learn.advanced.thread-context-and-cleanup`
- 项目候选：`backend.java.projects.dzzz-app.transactional-update-chain`
- 静态步骤：
  1. `dzzz-app/src/main/java/com/tdh/bdzz/config/MybatisPlusConfig.java:119` -> `注册 TableShardInterceptor`（SHA-256 `af928e578ee0749115bc12ca2d67605bd639635de6fd3fcb7b498e7695671252`）
  2. `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FileServiceImpl.java:291` -> `TableShardContext.setShardData 调用`（SHA-256 `3a7dce2613b584fcaf1086585a89eb7769661a700dae2d5c68af1c97dbcc146a`）
  3. `dzzz-app/src/main/java/com/tdh/bdzz/context/TableShardContext.java:39` -> `TableShardContext.setShardData`（SHA-256 `de4031ac01f570236442d1c27f3951d5e09891aa0046f53a92c192726dc4ce20`）
  4. `dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FileServiceImpl.java:364` -> `EajFileMapper.insert 调用`（SHA-256 `3a7dce2613b584fcaf1086585a89eb7769661a700dae2d5c68af1c97dbcc146a`）
  5. `dzzz-app/src/main/java/com/tdh/bdzz/dao/EajFileMapper.java:14` -> `@TableShard 声明`（SHA-256 `3071a7414b5b5da236a993ca330938fd0d855d5974c4653375a0898036d69697`）
  6. `dzzz-app/src/main/java/com/tdh/bdzz/shard/TableShardInterceptor.java:45` -> `TableShardInterceptor.intercept`（SHA-256 `75eb345dd65872303bea216de61a8ef8bab4eb59745fb9cd53788816018228a8`）
  7. `dzzz-app/src/main/java/com/tdh/bdzz/shard/TableShardInterceptor.java:61` -> `IShardStrategy.generateTableName 调用`（SHA-256 `75eb345dd65872303bea216de61a8ef8bab4eb59745fb9cd53788816018228a8`）
  8. `dzzz-app/src/main/java/com/tdh/bdzz/shard/AjbsShardStrategy.java:31` -> `AjbsShardStrategy.generateTableName`（SHA-256 `0ce87e2522146720ac83f850f7c054b119d9be2996fc4bbe9eee3a83a9f8e6f9`）
  9. `dzzz-app/src/main/java/com/tdh/bdzz/shard/AjbsShardStrategy.java:32` -> `TableShardContext.getShardData 调用`（SHA-256 `0ce87e2522146720ac83f850f7c054b119d9be2996fc4bbe9eee3a83a9f8e6f9`）
  10. `dzzz-app/src/main/java/com/tdh/bdzz/context/TableShardContext.java:27` -> `TableShardContext.getShardData`（SHA-256 `de4031ac01f570236442d1c27f3951d5e09891aa0046f53a92c192726dc4ce20`）
  11. `dzzz-app/src/main/java/com/tdh/bdzz/shard/TableShardInterceptor.java:79` -> `SQL 表名改写`（SHA-256 `75eb345dd65872303bea216de61a8ef8bab4eb59745fb9cd53788816018228a8`）
- 边界：静态源码证明上下文写入、分片 Mapper、策略取值和 SQL 改写关系，不证明所有 SQL 都被正确改写。

## CALL-PATH-008 应用事件发布与处理器选择链

- 状态：`static-source-verified`
- 所需课程：`backend.java.learn.advanced.events-async-scheduling-and-retry`、`backend.java.learn.advanced.chains-registries-and-state-machines`
- 项目候选：`backend.java.projects.dzzz-app.scheduled-external-system-chain`
- 静态步骤：
  1. `dzzz-app/src/main/java/com/tdh/bdzz/timer/service/TslxDataSyncService.java:347` -> `ApplicationEventPublisher.publishEvent`（SHA-256 `7f25b88bc27418fdc8bcd850e2dc52eeff39f84319ba448141761bce0b107827`）
  2. `dzzz-app/src/main/java/com/tdh/bdzz/listener/DataReportListener.java:37` -> `DataReportListener.onApplicationEvent`（SHA-256 `420e1bf8c98a506133db6d7eaf39f8ebe6684547f932603da06bc99a58e6e744`）
  3. `dzzz-app/src/main/java/com/tdh/bdzz/listener/DataReportListener.java:68` -> `DataReportHandlerFactory.getInstance 调用`（SHA-256 `420e1bf8c98a506133db6d7eaf39f8ebe6684547f932603da06bc99a58e6e744`）
  4. `dzzz-app/src/main/java/com/tdh/bdzz/handler/datareport/DataReportHandlerFactory.java:21` -> `DataReportHandlerFactory.getInstance`（SHA-256 `f51226ba08153051989bd9c40bb4e21305f680a27315225eba763e6fc2b9fd83`）
  5. `dzzz-app/src/main/java/com/tdh/bdzz/handler/datareport/DataReportHandler.java:6` -> `DataReportHandler 合同`（SHA-256 `0e7dff19f815cdddf32efdf94dffa9abc66ad157d7e332e22e6999fd009c3f50`）
- 边界：静态源码不能单独证明事件 multicaster 的同步或异步模式；发布线程语义取决于运行时配置，监听器内部另有异步调度。
