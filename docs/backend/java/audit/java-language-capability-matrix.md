# `dzzz-app` Java 语言能力矩阵

> 批次：Phase 1D 第 1 批：Java 语言能力归一化
> 源码快照：`dzzz-app-20260803-179e722831ab`
> 自动分析：`dzzz-app-analysis-20260803-958d37cf1be1`
> 状态：首批已归一化，研究与课程正文尚未开始

## 1. 本批边界

十批人工台账与自动提取共形成 906 个唯一原始输入：

- 文件级能力候选：550 个；
- Java 语言特征信号：16 个；
- 框架使用信号：21 个；
- 唯一风险说明：319 个。

本批只把其中 40 个语言输入合并为 15 个规范能力。
其余 866 个输入保持 `pending`，留给标准库、框架、工程模式和风险反例批次。
原始输入清单保留全部证据文件，不因别名合并丢失路径。

## 2. 规范能力

### JAVA-LANG-001 类、对象、字段与封装

- 类型：`java-language`；推荐阶段：基础。
- 项目证据：1657 个文件；原始输入：2 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：本批内无。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:Java 类与字段封装`、`review-capability:普通 Java 数据对象`。
- 代表符号：
  - `com.tdh.bdzz.bo.AdjustSignBO`：`dzzz-app/src/main/java/com/tdh/bdzz/bo/AdjustSignBO.java`
  - `com.tdh.bdzz.po.MossServer`：`dzzz-app/src/main/java/com/tdh/bdzz/po/MossServer.java`
  - `com.tdh.bdzz.bo.AdjustTswjSignBO`：`dzzz-app/src/main/java/com/tdh/bdzz/bo/AdjustTswjSignBO.java`
  - `com.tdh.bdzz.bo.AsConferenceBO`：`dzzz-app/src/main/java/com/tdh/bdzz/bo/AsConferenceBO.java`
  - `com.tdh.bdzz.bo.BurnPrintBO`：`dzzz-app/src/main/java/com/tdh/bdzz/bo/BurnPrintBO.java`

### JAVA-LANG-002 对象创建与普通类生命周期

- 类型：`java-language`；推荐阶段：基础。
- 项目证据：8 个文件；原始输入：2 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-001`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:显式对象创建`、`review-capability:普通类生命周期`。
- 代表符号：
  - `com.tdh.bdzz.service.CustomRequestCallback`：`dzzz-app/src/main/java/com/tdh/bdzz/service/CustomRequestCallback.java`
  - `com.tdh.bdzz.service.impl.YbtsChatRuleHelper`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/YbtsChatRuleHelper.java`
  - `com.tdh.bdzz.service.kingSign.iMsgServer2015`：`dzzz-app/src/main/java/com/tdh/bdzz/service/kingSign/iMsgServer2015.java`
  - `com.tdh.bdzz.service.tsaiassistant.TsAiModelContentCleaner`：`dzzz-app/src/main/java/com/tdh/bdzz/service/tsaiassistant/TsAiModelContentCleaner.java`
  - `com.tdh.bdzz.service.tsaiassistant.TsAiTraceContext`：`dzzz-app/src/main/java/com/tdh/bdzz/service/tsaiassistant/TsAiTraceContext.java`

### JAVA-LANG-003 接口、抽象类型与多态

- 类型：`java-language`；推荐阶段：基础。
- 项目证据：291 个文件；原始输入：5 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-001`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:Java 接口`、`review-capability:接口合同`、`review-capability:接口与抽象类`、`review-capability:多态`、`review-capability:多态与实现替换`。
- 代表符号：
  - `com.tdh.bdzz.dao.AnnotationTypesMapper`：`dzzz-app/src/main/java/com/tdh/bdzz/dao/AnnotationTypesMapper.java`
  - `com.tdh.bdzz.download.Downloader`：`dzzz-app/src/main/java/com/tdh/bdzz/download/Downloader.java`
  - `com.tdh.bdzz.timer.handler.fileProcess.AbstractFileProcessHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/fileProcess/AbstractFileProcessHandler.java`
  - `com.tdh.bdzz.handler.burn.BurnPrintHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/handler/burn/BurnPrintHandler.java`
  - `com.tdh.bdzz.service.AiXntjService`：`dzzz-app/src/main/java/com/tdh/bdzz/service/AiXntjService.java`

### JAVA-LANG-004 继承与方法覆写

- 类型：`java-language`；推荐阶段：基础。
- 项目证据：77 个文件；原始输入：3 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-001`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:继承`、`review-capability:继承与覆写`、`review-capability:模型继承`。
- 代表符号：
  - `com.tdh.bdzz.enums.AbstractJson`：`dzzz-app/src/main/java/com/tdh/bdzz/enums/AbstractJson.java`
  - `com.tdh.bdzz.config.EasySqlInjector`：`dzzz-app/src/main/java/com/tdh/bdzz/config/EasySqlInjector.java`
  - `com.tdh.bdzz.dto.CreateNodeDTO`：`dzzz-app/src/main/java/com/tdh/bdzz/dto/CreateNodeDTO.java`
  - `com.tdh.bdzz.dto.DownloadDTO`：`dzzz-app/src/main/java/com/tdh/bdzz/dto/DownloadDTO.java`
  - `com.tdh.bdzz.dto.QueryDxlbDTO`：`dzzz-app/src/main/java/com/tdh/bdzz/dto/QueryDxlbDTO.java`

### JAVA-LANG-005 枚举类型

- 类型：`java-language`；推荐阶段：基础。
- 项目证据：162 个文件；原始输入：3 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-001`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:Java enum`、`review-capability:枚举合同`、`review-capability:嵌套枚举`。
- 代表符号：
  - `com.tdh.bdzz.enums.AJFL`：`dzzz-app/src/main/java/com/tdh/bdzz/enums/AJFL.java`
  - `com.tdh.bdzz.enums.IEnum`：`dzzz-app/src/main/java/com/tdh/bdzz/enums/IEnum.java`
  - `com.tdh.bdzz.enums.vidyo.common.VidyoDataCommon`：`dzzz-app/src/main/java/com/tdh/bdzz/enums/vidyo/common/VidyoDataCommon.java`
  - `com.tdh.bdzz.enums.AymsJc`：`dzzz-app/src/main/java/com/tdh/bdzz/enums/AymsJc.java`
  - `com.tdh.bdzz.enums.BjmMs`：`dzzz-app/src/main/java/com/tdh/bdzz/enums/BjmMs.java`

### JAVA-LANG-006 泛型声明、边界与泛型方法

- 类型：`java-language`；推荐阶段：中级。
- 项目证据：67 个文件；原始输入：6 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-001`、`JAVA-LANG-003`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:Java 泛型`、`review-capability:泛型`、`review-capability:泛型边界`、`review-capability:泛型方法`、`review-capability:泛型接口`、`language-feature:generic-declaration`。
- 代表符号：
  - `com.tdh.bdzz.dto.as.AsComDTO`：`dzzz-app/src/main/java/com/tdh/bdzz/dto/as/AsComDTO.java`
  - `com.tdh.bdzz.timer.handler.jzDataSync.JzDataSyncHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/jzDataSync/JzDataSyncHandler.java`
  - `com.tdh.bdzz.handler.AbstractJsonTypeHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/handler/AbstractJsonTypeHandler.java`
  - `com.tdh.bdzz.config.websocket.DzzzEndpointConfigure`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/DzzzEndpointConfigure.java`
  - `com.tdh.bdzz.enums.IEnum`：`dzzz-app/src/main/java/com/tdh/bdzz/enums/IEnum.java`

### JAVA-LANG-007 注解声明、使用与元注解

- 类型：`java-language`；推荐阶段：基础。
- 项目证据：3100 个文件；原始输入：4 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-001`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:注解`、`review-capability:Java 注解元数据`、`review-capability:注解目标与保留策略`、`language-feature:annotation-use`。
- 代表符号：
  - `com.tdh.bdzz.util.ValidatorUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/ValidatorUtil.java`
  - `com.tdh.bdzz.annoation.AutoValid`：`dzzz-app/src/main/java/com/tdh/bdzz/annoation/AutoValid.java`
  - `com.tdh.bdzz.annoation.AutowiredShardData`：`dzzz-app/src/main/java/com/tdh/bdzz/annoation/AutowiredShardData.java`
  - `com.tdh.DzzzAreaApplication`：`dzzz-app/src/main/java/com/tdh/DzzzAreaApplication.java`
  - `com.tdh.bdzz.annoation.CltjrSf`：`dzzz-app/src/main/java/com/tdh/bdzz/annoation/CltjrSf.java`

### JAVA-LANG-008 Lambda 表达式与方法引用

- 类型：`java-language`；推荐阶段：中级。
- 项目证据：224 个文件；原始输入：3 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-003`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:Lambda`、`language-feature:lambda`、`language-feature:method-reference`。
- 代表符号：
  - `com.tdh.bdzz.config.DbcpSqlCheckConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/DbcpSqlCheckConfig.java`
  - `com.tdh.bdzz.cache.DzzzDxpzCacheLoader`：`dzzz-app/src/main/java/com/tdh/bdzz/cache/DzzzDxpzCacheLoader.java`
  - `com.tdh.bdzz.cache.TDepartYzwCacheLoader`：`dzzz-app/src/main/java/com/tdh/bdzz/cache/TDepartYzwCacheLoader.java`
  - `com.tdh.bdzz.cache.DzzzTsmCacheLoader`：`dzzz-app/src/main/java/com/tdh/bdzz/cache/DzzzTsmCacheLoader.java`
  - `com.tdh.bdzz.cache.DzzzUserCacheLoader`：`dzzz-app/src/main/java/com/tdh/bdzz/cache/DzzzUserCacheLoader.java`

### JAVA-LANG-009 异常层级、抛出与捕获

- 类型：`java-language`；推荐阶段：基础。
- 项目证据：359 个文件；原始输入：4 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-001`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:异常层级`、`review-capability:异常合同`、`language-feature:catch-clause`、`language-feature:throw`。
- 代表符号：
  - `com.tdh.bdzz.exception.ArgumentNotValidException`：`dzzz-app/src/main/java/com/tdh/bdzz/exception/ArgumentNotValidException.java`
  - `com.tdh.bdzz.service.tscwh.TscwhModelConfigTest`：`dzzz-app/src/test/java/com/tdh/bdzz/service/tscwh/TscwhModelConfigTest.java`
  - `com.tdh.bdzz.aop.AppAspect`：`dzzz-app/src/main/java/com/tdh/bdzz/aop/AppAspect.java`
  - `com.tdh.bdzz.aop.DzzzAspect`：`dzzz-app/src/main/java/com/tdh/bdzz/aop/DzzzAspect.java`
  - `com.tdh.bdzz.cache.WrongWordDictionaryLoader`：`dzzz-app/src/main/java/com/tdh/bdzz/cache/WrongWordDictionaryLoader.java`

### JAVA-LANG-010 switch 分支

- 类型：`java-language`；推荐阶段：基础。
- 项目证据：30 个文件；原始输入：1 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：本批内无。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`language-feature:switch`。
- 代表符号：
  - `com.tdh.bdzz.aop.AppAspect`：`dzzz-app/src/main/java/com/tdh/bdzz/aop/AppAspect.java`
  - `com.tdh.bdzz.enums.vidyo.common.VidyoDataCommon`：`dzzz-app/src/main/java/com/tdh/bdzz/enums/vidyo/common/VidyoDataCommon.java`
  - `com.tdh.bdzz.filter.XssHttpServletRequestWrapper`：`dzzz-app/src/main/java/com/tdh/bdzz/filter/XssHttpServletRequestWrapper.java`
  - `com.tdh.bdzz.handler.datareport.DataReportHandlerFactory`：`dzzz-app/src/main/java/com/tdh/bdzz/handler/datareport/DataReportHandlerFactory.java`
  - `com.tdh.bdzz.listener.DataReportListener`：`dzzz-app/src/main/java/com/tdh/bdzz/listener/DataReportListener.java`

### JAVA-LANG-011 增强 for 循环

- 类型：`java-language`；推荐阶段：基础。
- 项目证据：380 个文件；原始输入：1 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：本批内无。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`language-feature:enhanced-for`。
- 代表符号：
  - `com.tdh.bdzz.cache.TDepartYzwCacheLoader`：`dzzz-app/src/main/java/com/tdh/bdzz/cache/TDepartYzwCacheLoader.java`
  - `com.tdh.bdzz.cache.TUserYzwCacheLoader`：`dzzz-app/src/main/java/com/tdh/bdzz/cache/TUserYzwCacheLoader.java`
  - `com.tdh.bdzz.cache.TsAjcxbm2015CacheLoader`：`dzzz-app/src/main/java/com/tdh/bdzz/cache/TsAjcxbm2015CacheLoader.java`
  - `com.tdh.bdzz.cache.TsBzDmCacheLoader`：`dzzz-app/src/main/java/com/tdh/bdzz/cache/TsBzDmCacheLoader.java`
  - `com.tdh.bdzz.cache.TsFymcCacheLoader`：`dzzz-app/src/main/java/com/tdh/bdzz/cache/TsFymcCacheLoader.java`

### JAVA-LANG-012 成员类与匿名类体

- 类型：`java-language`；推荐阶段：中级。
- 项目证据：48 个文件；原始输入：2 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-001`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:成员类`、`language-feature:anonymous-class-body`。
- 代表符号：
  - `com.tdh.bdzz.dto.HkConfAddDTO`：`dzzz-app/src/main/java/com/tdh/bdzz/dto/HkConfAddDTO.java`
  - `com.tdh.bdzz.config.Pdf2ImageComparablePriorityTaskPoolExecutor`：`dzzz-app/src/main/java/com/tdh/bdzz/config/Pdf2ImageComparablePriorityTaskPoolExecutor.java`
  - `com.tdh.bdzz.constant.JzglConstant`：`dzzz-app/src/main/java/com/tdh/bdzz/constant/JzglConstant.java`
  - `com.tdh.bdzz.controller.CommController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/CommController.java`
  - `com.tdh.bdzz.controller.TblbController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/TblbController.java`

### JAVA-LANG-013 synchronized 同步块

- 类型：`java-language`；推荐阶段：高级。
- 项目证据：12 个文件；原始输入：1 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-001`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`language-feature:synchronized-block`。
- 代表符号：
  - `com.tdh.bdzz.aop.AppAspect`：`dzzz-app/src/main/java/com/tdh/bdzz/aop/AppAspect.java`
  - `com.tdh.bdzz.config.Pdf2ImageComparablePriorityTaskPoolExecutor`：`dzzz-app/src/main/java/com/tdh/bdzz/config/Pdf2ImageComparablePriorityTaskPoolExecutor.java`
  - `com.tdh.bdzz.config.websocket.server.ClientZzWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientZzWsServer.java`
  - `com.tdh.bdzz.service.impl.FtjlServiceImpl`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FtjlServiceImpl.java`
  - `com.tdh.bdzz.service.impl.Fyb4WindowsImpl`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/Fyb4WindowsImpl.java`

### JAVA-LANG-014 try-with-resources

- 类型：`java-language`；推荐阶段：中级。
- 项目证据：28 个文件；原始输入：1 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-009`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`language-feature:try-with-resources`。
- 代表符号：
  - `com.tdh.bdzz.cache.WrongWordDictionaryLoader`：`dzzz-app/src/main/java/com/tdh/bdzz/cache/WrongWordDictionaryLoader.java`
  - `com.tdh.bdzz.config.websocket.server.LoggingFileTailReader`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingFileTailReader.java`
  - `com.tdh.bdzz.controller.BaseOuterController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/BaseOuterController.java`
  - `com.tdh.bdzz.service.HmBurnService`：`dzzz-app/src/main/java/com/tdh/bdzz/service/HmBurnService.java`
  - `com.tdh.bdzz.service.ZnfzxtApiService`：`dzzz-app/src/main/java/com/tdh/bdzz/service/ZnfzxtApiService.java`

### JAVA-LANG-015 常量与不可变数据

- 类型：`java-language`；推荐阶段：基础。
- 项目证据：4 个文件；原始输入：2 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-001`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:常量`、`review-capability:不可变数据`。
- 代表符号：
  - `com.tdh.bdzz.constant.BlockChainConstant`：`dzzz-app/src/main/java/com/tdh/bdzz/constant/BlockChainConstant.java`
  - `com.tdh.bdzz.constant.YjbjConstant`：`dzzz-app/src/main/java/com/tdh/bdzz/constant/YjbjConstant.java`
  - `com.tdh.bdzz.enums.ModifyType`：`dzzz-app/src/main/java/com/tdh/bdzz/enums/ModifyType.java`
  - `com.tdh.bdzz.util.Constant`：`dzzz-app/src/main/java/com/tdh/bdzz/util/Constant.java`

## 3. 当前边界

- `modernBaseline` 与 `legacyBaseline` 只冻结版本线，不表示知识点研究已经完成。
- `courseStatus=candidate` 只表示进入能力矩阵，不表示已经选择为独立课程。
- 具体语法规则、API 合同、易错点和开发技巧必须在 Phase 2 后按来源规范逐项在线核验。
- 本批不处理标准库、Spring、MyBatis、工程模式、项目示例和风险反例。
- Phase 1D 尚未完成，Gate 1 仍未通过。

下一批只能继续处理标准库能力归一化，不能开始课程正文、菜单或 Markdown adapter。
