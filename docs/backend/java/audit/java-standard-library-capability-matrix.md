# `dzzz-app` Java 标准库能力矩阵

> 批次：Phase 1D 第 2 批：Java 标准库能力归一化
> 源码快照：`dzzz-app-20260803-179e722831ab`
> 自动分析：`dzzz-app-analysis-20260803-958d37cf1be1`
> 状态：标准库批次已归一化，研究与课程正文尚未开始

## 1. 本批边界

本批输入严格来自上一批的 866 个 `pending` 输入：

- 文件级能力候选：521 个；
- 剩余 Java 语言信号：5 个；
- 框架使用信号：21 个；
- 唯一风险说明：319 个。

本批把 112 个明确的 JDK API 输入合并为 33 个标准库能力。
其余 754 个输入继续保持 `pending`。
所有 Spring、Servlet、JDBC/MyBatis、第三方库、工程模式和风险说明均未提前归一化。

## 2. 规范能力

### JAVA-STDLIB-001 java.base 核心标准库概览

- 类型：`standard-library`；推荐阶段：基础。
- 项目证据：1 个文件；原始输入：1 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-001`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:Java 标准库`。
- 代表符号：
  - `com.tdh.bdzz.util.CommonUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/CommonUtil.java`

### JAVA-STDLIB-002 String、字符串池与格式化

- 类型：`standard-library`；推荐阶段：基础。
- 项目证据：5 个文件；原始输入：3 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：本批内无。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:字符串格式化`、`review-capability:String`、`review-capability:String.intern`。
- 代表符号：
  - `com.tdh.bdzz.constant.TsblTextCacheKeyBuilder`：`dzzz-app/src/main/java/com/tdh/bdzz/constant/TsblTextCacheKeyBuilder.java`
  - `com.tdh.bdzz.util.Num2CN`：`dzzz-app/src/main/java/com/tdh/bdzz/util/Num2CN.java`
  - `com.tdh.bdzz.config.websocket.server.ClientZzWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientZzWsServer.java`
  - `com.tdh.bdzz.util.StringUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/StringUtil.java`
  - `com.tdh.bdzz.util.StringUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/StringUtils.java`

### JAVA-STDLIB-003 Charset、StandardCharsets 与字符编码

- 类型：`standard-library`；推荐阶段：基础。
- 项目证据：11 个文件；原始输入：2 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-002`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:字符编码`、`review-capability:UTF-8 解码`。
- 代表符号：
  - `com.tdh.bdzz.util.HMacUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/HMacUtils.java`
  - `com.tdh.bdzz.config.websocket.server.LoggingFileTailReader`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingFileTailReader.java`
  - `com.tdh.bdzz.util.HtAsrUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/HtAsrUtils.java`
  - `com.tdh.bdzz.util.Num2CN`：`dzzz-app/src/main/java/com/tdh/bdzz/util/Num2CN.java`
  - `com.tdh.bdzz.util.SignatureUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/SignatureUtil.java`

### JAVA-STDLIB-004 正则表达式 Pattern 与 Matcher

- 类型：`standard-library`；推荐阶段：基础。
- 项目证据：8 个文件；原始输入：2 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-002`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:正则表达式`、`review-capability:正则校验`。
- 代表符号：
  - `com.tdh.bdzz.util.Num2CN`：`dzzz-app/src/main/java/com/tdh/bdzz/util/Num2CN.java`
  - `com.tdh.bdzz.util.ValidatorUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/ValidatorUtil.java`
  - `com.tdh.bdzz.util.StringUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/StringUtil.java`
  - `com.tdh.bdzz.util.StringUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/StringUtils.java`
  - `com.tdh.bdzz.util.TsjdStageUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/TsjdStageUtil.java`

### JAVA-STDLIB-005 Collection、List、Set 与 Map

- 类型：`standard-library`；推荐阶段：基础。
- 项目证据：30 个文件；原始输入：6 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-006`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:集合`、`review-capability:集合边界`、`review-capability:集合查询`、`review-capability:集合可见性`、`review-capability:集合算法`、`review-capability:Map`。
- 代表符号：
  - `com.tdh.bdzz.util.JzTabUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/JzTabUtils.java`
  - `com.tdh.bdzz.config.websocket.server.LoggingTailReadResult`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingTailReadResult.java`
  - `com.tdh.bdzz.util.CacheUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/CacheUtil.java`
  - `com.tdh.bdzz.cache.DzzzDxpzCacheLoader`：`dzzz-app/src/main/java/com/tdh/bdzz/cache/DzzzDxpzCacheLoader.java`
  - `com.tdh.bdzz.util.aixntj.AiXntjCourtTreeHelper`：`dzzz-app/src/main/java/com/tdh/bdzz/util/aixntj/AiXntjCourtTreeHelper.java`

### JAVA-STDLIB-006 Iterator 删除与只读集合视图

- 类型：`standard-library`；推荐阶段：中级。
- 项目证据：3 个文件；原始输入：2 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-005`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:迭代器删除`、`review-capability:只读集合`。
- 代表符号：
  - `com.tdh.bdzz.config.websocket.server.fyb.jdyh.NoteSignWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/fyb/jdyh/NoteSignWsServer.java`
  - `com.tdh.bdzz.constant.TuDmKzCategoryConstant`：`dzzz-app/src/main/java/com/tdh/bdzz/constant/TuDmKzCategoryConstant.java`
  - `com.tdh.bdzz.util.SignKeywordRuleUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/SignKeywordRuleUtil.java`

### JAVA-STDLIB-007 Comparable 与自然顺序

- 类型：`standard-library`；推荐阶段：中级。
- 项目证据：1 个文件；原始输入：1 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-003`、`JAVA-LANG-006`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:Comparable`。
- 代表符号：
  - `com.tdh.bdzz.util.ComparableFutureTask`：`dzzz-app/src/main/java/com/tdh/bdzz/util/ComparableFutureTask.java`

### JAVA-STDLIB-008 Stream 与 Collectors

- 类型：`standard-library`；推荐阶段：中级。
- 项目证据：175 个文件；原始输入：5 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-008`、`JAVA-STDLIB-005`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:集合聚合`、`review-capability:去重`、`review-capability:Stream API`、`review-capability:Stream/Collectors`、`language-feature:stream-api`。
- 代表符号：
  - `com.tdh.bdzz.util.aixntj.AiXntjMetricsCalculator`：`dzzz-app/src/main/java/com/tdh/bdzz/util/aixntj/AiXntjMetricsCalculator.java`
  - `com.tdh.bdzz.service.CourtService`：`dzzz-app/src/main/java/com/tdh/bdzz/service/CourtService.java`
  - `com.tdh.bdzz.config.websocket.server.ClientChatWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientChatWsServer.java`
  - `com.tdh.bdzz.cache.DzzzDxpzCacheLoader`：`dzzz-app/src/main/java/com/tdh/bdzz/cache/DzzzDxpzCacheLoader.java`
  - `com.tdh.bdzz.cache.DzzzTsmCacheLoader`：`dzzz-app/src/main/java/com/tdh/bdzz/cache/DzzzTsmCacheLoader.java`

### JAVA-STDLIB-009 Optional

- 类型：`standard-library`；推荐阶段：中级。
- 项目证据：4 个文件；原始输入：1 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-006`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`language-feature:optional`。
- 代表符号：
  - `com.tdh.bdzz.handler.voice2text.TdhDtbVoice2TextHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/handler/voice2text/TdhDtbVoice2TextHandler.java`
  - `com.tdh.bdzz.service.impl.TsFileSignNewOfflineSqtServiceImpl`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/TsFileSignNewOfflineSqtServiceImpl.java`
  - `com.tdh.bdzz.timer.handler.clearExpireData.HyUimSyncDataHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/clearExpireData/HyUimSyncDataHandler.java`
  - `com.tdh.bdzz.util.ConvertPdf`：`dzzz-app/src/main/java/com/tdh/bdzz/util/ConvertPdf.java`

### JAVA-STDLIB-010 Date、Calendar 与传统日期格式化

- 类型：`standard-library`；推荐阶段：基础。
- 项目证据：5 个文件；原始输入：4 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-002`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:日期格式`、`review-capability:日期格式化`、`review-capability:日期校验`、`review-capability:Date/Calendar`。
- 代表符号：
  - `com.tdh.bdzz.util.GenAuthorization`：`dzzz-app/src/main/java/com/tdh/bdzz/util/GenAuthorization.java`
  - `com.tdh.bdzz.util.CompareDateUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/CompareDateUtils.java`
  - `tdh.platform.component.license.lic.License`：`dzzz-app/src/main/java/tdh/platform/component/license/lic/License.java`
  - `com.tdh.bdzz.util.DateUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/DateUtil.java`
  - `com.tdh.bdzz.util.WpsUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/WpsUtil.java`

### JAVA-STDLIB-011 java.time 日期时间 API

- 类型：`standard-library`；推荐阶段：中级。
- 项目证据：2 个文件；原始输入：1 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-010`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:java.time`。
- 代表符号：
  - `com.tdh.bdzz.util.CompareDateUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/CompareDateUtils.java`
  - `com.tdh.bdzz.util.DateUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/DateUtil.java`

### JAVA-STDLIB-012 Locale、GMT 与时区

- 类型：`standard-library`；推荐阶段：中级。
- 项目证据：2 个文件；原始输入：2 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-010`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:GMT 时间`、`review-capability:Locale`。
- 代表符号：
  - `com.tdh.bdzz.config.HeaderRequestInterceptor`：`dzzz-app/src/main/java/com/tdh/bdzz/config/HeaderRequestInterceptor.java`
  - `com.tdh.bdzz.config.AppStarter`：`dzzz-app/src/main/java/com/tdh/bdzz/config/AppStarter.java`

### JAVA-STDLIB-013 I/O 流、Reader 与 Writer

- 类型：`standard-library`；推荐阶段：基础。
- 项目证据：327 个文件；原始输入：5 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-009`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:流式 I/O`、`review-capability:输入流`、`review-capability:文件流`、`review-capability:Java I/O`、`language-feature:io`。
- 代表符号：
  - `com.tdh.bdzz.factories.flv.ConverterFactories`：`dzzz-app/src/main/java/com/tdh/bdzz/factories/flv/ConverterFactories.java`
  - `com.tdh.util.FileTypeUtils`：`dzzz-app/src/main/java/com/tdh/util/FileTypeUtils.java`
  - `com.tdh.bdzz.util.CustomMultipartFile`：`dzzz-app/src/main/java/com/tdh/bdzz/util/CustomMultipartFile.java`
  - `com.tdh.bdzz.service.CustomRequestCallback`：`dzzz-app/src/main/java/com/tdh/bdzz/service/CustomRequestCallback.java`
  - `com.tdh.bdzz.cache.WrongWordDictionaryLoader`：`dzzz-app/src/main/java/com/tdh/bdzz/cache/WrongWordDictionaryLoader.java`

### JAVA-STDLIB-014 AutoCloseable 与资源关闭合同

- 类型：`standard-library`；推荐阶段：中级。
- 项目证据：44 个文件；原始输入：3 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-014`、`JAVA-STDLIB-013`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:I/O 资源所有权`、`review-capability:资源关闭`、`review-capability:try-with-resources`。
- 代表符号：
  - `com.tdh.bdzz.dto.entity.JzMultipartFile`：`dzzz-app/src/main/java/com/tdh/bdzz/dto/entity/JzMultipartFile.java`
  - `com.tdh.bdzz.handler.voice2text.BjhyVoice2TextHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/handler/voice2text/BjhyVoice2TextHandler.java`
  - `com.tdh.bdzz.config.websocket.server.LoggingFileTailReader`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingFileTailReader.java`
  - `com.tdh.bdzz.eo.clientZz.Step`：`dzzz-app/src/main/java/com/tdh/bdzz/eo/clientZz/Step.java`
  - `com.tdh.bdzz.handler.voice2text.HcVoice2TextHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/handler/voice2text/HcVoice2TextHandler.java`

### JAVA-STDLIB-015 File、Path、Files 与 NIO 文件系统

- 类型：`standard-library`；推荐阶段：中级。
- 项目证据：20 个文件；原始输入：6 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-013`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:临时文件`、`review-capability:路径校验`、`review-capability:文件 I/O`、`review-capability:文件路径`、`review-capability:文件系统路径`、`review-capability:java.nio`。
- 代表符号：
  - `com.tdh.bdzz.service.impl.TsFileSignNewDragServiceImplTest`：`dzzz-app/src/test/java/com/tdh/bdzz/service/impl/TsFileSignNewDragServiceImplTest.java`
  - `com.tdh.bdzz.config.SysConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/SysConfig.java`
  - `com.tdh.bdzz.timer.handler.fileProcess.EajJzFileProcessHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/fileProcess/EajJzFileProcessHandler.java`
  - `com.tdh.bdzz.rolling.InnerProjectRollingFileAppender`：`dzzz-app/src/main/java/com/tdh/bdzz/rolling/InnerProjectRollingFileAppender.java`
  - `com.tdh.bdzz.storage.NioUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/storage/NioUtil.java`

### JAVA-STDLIB-016 RandomAccessFile、Channel 与字节偏移

- 类型：`standard-library`；推荐阶段：高级。
- 项目证据：3 个文件；原始输入：4 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-013`、`JAVA-STDLIB-015`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:文件 tail`、`review-capability:字节偏移`、`review-capability:Channel`、`review-capability:RandomAccessFile`。
- 代表符号：
  - `com.tdh.bdzz.config.websocket.server.LoggingWSServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingWSServer.java`
  - `com.tdh.bdzz.config.websocket.server.LoggingFileTailReader`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingFileTailReader.java`
  - `com.tdh.bdzz.storage.NioUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/storage/NioUtil.java`

### JAVA-STDLIB-017 ZIP 压缩流

- 类型：`standard-library`；推荐阶段：中级。
- 项目证据：1 个文件；原始输入：1 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-013`、`JAVA-STDLIB-014`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:压缩`。
- 代表符号：
  - `com.tdh.bdzz.util.CommonUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/CommonUtil.java`

### JAVA-STDLIB-018 Process、ProcessBuilder 与 Runtime.exec

- 类型：`standard-library`；推荐阶段：高级。
- 项目证据：3 个文件；原始输入：3 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-013`、`JAVA-STDLIB-014`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:进程 I/O`、`review-capability:进程调用`、`review-capability:Runtime.exec`。
- 代表符号：
  - `com.tdh.bdzz.util.SystemMonitorUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/SystemMonitorUtil.java`
  - `com.tdh.bdzz.util.ConvertPdf`：`dzzz-app/src/main/java/com/tdh/bdzz/util/ConvertPdf.java`
  - `com.tdh.bdzz.util.PptUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/PptUtil.java`

### JAVA-STDLIB-019 URL 编解码

- 类型：`standard-library`；推荐阶段：基础。
- 项目证据：1 个文件；原始输入：1 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-002`、`JAVA-STDLIB-003`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:URL 编码`。
- 代表符号：
  - `com.tdh.bdzz.config.websocket.server.ClientChatWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientChatWsServer.java`

### JAVA-STDLIB-020 反射、动态实例化与注解读取

- 类型：`standard-library`；推荐阶段：高级。
- 项目证据：15 个文件；原始输入：5 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-007`、`JAVA-LANG-009`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:动态实例化`、`review-capability:反射`、`review-capability:反射式调用`、`review-capability:反射与注解读取`、`language-feature:reflection`。
- 代表符号：
  - `com.tdh.bdzz.util.ReflectionCacheUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/ReflectionCacheUtil.java`
  - `com.tdh.bdzz.shard.DefaultAutowiredShardData`：`dzzz-app/src/main/java/com/tdh/bdzz/shard/DefaultAutowiredShardData.java`
  - `com.tdh.bdzz.util.CxfClientUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/CxfClientUtil.java`
  - `com.tdh.bdzz.aop.AppAspect`：`dzzz-app/src/main/java/com/tdh/bdzz/aop/AppAspect.java`
  - `com.tdh.bdzz.aop.DzzzAspect`：`dzzz-app/src/main/java/com/tdh/bdzz/aop/DzzzAspect.java`

### JAVA-STDLIB-021 Serializable 与原生对象序列化

- 类型：`standard-library`；推荐阶段：高级。
- 项目证据：181 个文件；原始输入：4 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-003`、`JAVA-LANG-009`、`JAVA-STDLIB-013`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:反序列化`、`review-capability:序列化`、`review-capability:序列化边界`、`review-capability:Serializable`。
- 代表符号：
  - `com.tdh.bdzz.util.CommonUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/CommonUtil.java`
  - `com.tdh.bdzz.timer.dto.DoSearchCameraDto`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/dto/DoSearchCameraDto.java`
  - `com.tdh.bdzz.timer.eo.AjxxDataEO`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/eo/AjxxDataEO.java`
  - `com.tdh.bdzz.dto.AuthorizeDTO`：`dzzz-app/src/main/java/com/tdh/bdzz/dto/AuthorizeDTO.java`
  - `com.tdh.bdzz.dto.HkConfAddDTO`：`dzzz-app/src/main/java/com/tdh/bdzz/dto/HkConfAddDTO.java`

### JAVA-STDLIB-022 Base64 编解码

- 类型：`standard-library`；推荐阶段：基础。
- 项目证据：8 个文件；原始输入：1 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-003`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:Base64`。
- 代表符号：
  - `com.tdh.bdzz.util.AESUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/AESUtils.java`
  - `com.tdh.bdzz.util.DateImageGenerator`：`dzzz-app/src/main/java/com/tdh/bdzz/util/DateImageGenerator.java`
  - `com.tdh.bdzz.util.DesCbcUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/DesCbcUtil.java`
  - `com.tdh.bdzz.util.FingerprintMergeLayoutUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/FingerprintMergeLayoutUtil.java`
  - `com.tdh.bdzz.util.ImageMergerUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/ImageMergerUtil.java`

### JAVA-STDLIB-023 Executor、Future、Callable 与 CompletableFuture

- 类型：`standard-library`；推荐阶段：高级。
- 项目证据：77 个文件；原始输入：15 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-008`、`JAVA-LANG-009`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:并发与执行器`、`review-capability:队列容量`、`review-capability:拒绝策略`、`review-capability:显式 Executor`、`review-capability:线程池`、`review-capability:线程池参数`、`review-capability:线程命名`、`review-capability:线程生命周期`、`review-capability:Callable`、`review-capability:CompletableFuture`、`review-capability:ExecutorService`、`review-capability:Future`、`review-capability:FutureTask`、`review-capability:ThreadPoolExecutor`、`language-feature:concurrency`。
- 代表符号：
  - `com.tdh.bdzz.service.impl.CameraServiceImpl`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/CameraServiceImpl.java`
  - `com.tdh.bdzz.config.ThreadPoolConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/ThreadPoolConfig.java`
  - `com.tdh.bdzz.config.Pdf2ImageComparablePriorityTaskPoolExecutor`：`dzzz-app/src/main/java/com/tdh/bdzz/config/Pdf2ImageComparablePriorityTaskPoolExecutor.java`
  - `com.tdh.bdzz.ws.ReTransmissionService`：`dzzz-app/src/main/java/com/tdh/bdzz/ws/ReTransmissionService.java`
  - `com.tdh.bdzz.config.websocket.server.LoggingWSServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingWSServer.java`

### JAVA-STDLIB-024 并发集合与阻塞队列

- 类型：`standard-library`；推荐阶段：高级。
- 项目证据：12 个文件；原始输入：8 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-005`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:并发 Map`、`review-capability:并发集合`、`review-capability:并发控制`、`review-capability:并发映射`、`review-capability:写时复制集合`、`review-capability:优先级队列`、`review-capability:ConcurrentHashMap`、`review-capability:PriorityBlockingQueue`。
- 代表符号：
  - `com.tdh.bdzz.config.websocket.server.AppFrontYyzxWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/AppFrontYyzxWsServer.java`
  - `com.tdh.bdzz.constant.JzglConstant`：`dzzz-app/src/main/java/com/tdh/bdzz/constant/JzglConstant.java`
  - `com.tdh.bdzz.util.LockStringUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/LockStringUtil.java`
  - `com.tdh.bdzz.handler.burn.HmBurnPrintHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/handler/burn/HmBurnPrintHandler.java`
  - `com.tdh.bdzz.config.websocket.server.OnlyOfficeWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/OnlyOfficeWsServer.java`

### JAVA-STDLIB-025 原子类型与原子计数

- 类型：`standard-library`；推荐阶段：高级。
- 项目证据：5 个文件；原始输入：2 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：本批内无。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:原子计数`、`review-capability:AtomicInteger`。
- 代表符号：
  - `com.tdh.bdzz.config.websocket.server.BlOperationWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/BlOperationWsServer.java`
  - `com.tdh.bdzz.util.CodeGenerator`：`dzzz-app/src/main/java/com/tdh/bdzz/util/CodeGenerator.java`
  - `com.tdh.bdzz.config.websocket.server.OnlyOfficeWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/OnlyOfficeWsServer.java`
  - `com.tdh.bdzz.util.UniqueIDGeneratorUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/UniqueIDGeneratorUtil.java`
  - `com.tdh.bdzz.util.UniqueIdUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/UniqueIdUtils.java`

### JAVA-STDLIB-026 ThreadLocal 上下文与清理

- 类型：`standard-library`；推荐阶段：高级。
- 项目证据：4 个文件；原始输入：3 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-023`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:ThreadLocal`、`review-capability:ThreadLocal 清理`、`review-capability:ThreadLocal 上下文`。
- 代表符号：
  - `com.tdh.bdzz.context.TableShardContext`：`dzzz-app/src/main/java/com/tdh/bdzz/context/TableShardContext.java`
  - `com.tdh.bdzz.config.Pdf2ImageComparablePriorityTaskPoolExecutor`：`dzzz-app/src/main/java/com/tdh/bdzz/config/Pdf2ImageComparablePriorityTaskPoolExecutor.java`
  - `com.tdh.bdzz.service.tsaiassistant.TsAiTraceContextHolder`：`dzzz-app/src/main/java/com/tdh/bdzz/service/tsaiassistant/TsAiTraceContextHolder.java`
  - `com.tdh.bdzz.shard.DefaultAutowiredShardData`：`dzzz-app/src/main/java/com/tdh/bdzz/shard/DefaultAutowiredShardData.java`

### JAVA-STDLIB-027 JCA/JCE、Cipher 与密钥 API

- 类型：`standard-library`；推荐阶段：高级。
- 项目证据：7 个文件；原始输入：6 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-003`、`JAVA-STDLIB-013`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:3DES`、`review-capability:密码学兼容`、`review-capability:密钥材料`、`review-capability:AES`、`review-capability:JCA/JCE`、`review-capability:RSA`。
- 代表符号：
  - `com.tdh.bdzz.util.AESUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/AESUtils.java`
  - `com.tdh.bdzz.constant.EncryptConstant`：`dzzz-app/src/main/java/com/tdh/bdzz/constant/EncryptConstant.java`
  - `com.tdh.bdzz.util.DesCbcUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/DesCbcUtil.java`
  - `com.tdh.bdzz.util.JzRSAUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/JzRSAUtils.java`
  - `com.tdh.bdzz.util.RSASignUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/RSASignUtil.java`

### JAVA-STDLIB-028 MessageDigest、Mac 与 Signature

- 类型：`standard-library`；推荐阶段：高级。
- 项目证据：12 个文件；原始输入：5 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-003`、`JAVA-STDLIB-027`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:签名`、`review-capability:签名兼容`、`review-capability:摘要`、`review-capability:HMAC`、`review-capability:MessageDigest`。
- 代表符号：
  - `com.tdh.bdzz.util.JzRSAUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/JzRSAUtils.java`
  - `tdh.platform.component.license.lic.License`：`dzzz-app/src/main/java/tdh/platform/component/license/lic/License.java`
  - `com.tdh.bdzz.config.HeaderRequestInterceptor`：`dzzz-app/src/main/java/com/tdh/bdzz/config/HeaderRequestInterceptor.java`
  - `com.tdh.bdzz.util.HMacUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/HMacUtils.java`
  - `com.tdh.bdzz.util.HtAsrUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/HtAsrUtils.java`

### JAVA-STDLIB-029 ImageIO、BufferedImage 与 Java2D

- 类型：`standard-library`；推荐阶段：中级。
- 项目证据：11 个文件；原始输入：4 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-013`、`JAVA-STDLIB-014`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:图片 fixture`、`review-capability:图片合成`、`review-capability:BufferedImage`、`review-capability:ImageIO`。
- 代表符号：
  - `com.tdh.bdzz.util.KeywordSignatureMergeTest`：`dzzz-app/src/test/java/com/tdh/bdzz/util/KeywordSignatureMergeTest.java`
  - `com.tdh.bdzz.util.ConvertPdf`：`dzzz-app/src/main/java/com/tdh/bdzz/util/ConvertPdf.java`
  - `com.tdh.bdzz.util.DateImageGenerator`：`dzzz-app/src/main/java/com/tdh/bdzz/util/DateImageGenerator.java`
  - `com.tdh.bdzz.util.FingerprintMergeLayoutUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/FingerprintMergeLayoutUtil.java`
  - `com.tdh.bdzz.util.ImageMergerUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/ImageMergerUtil.java`

### JAVA-STDLIB-030 System properties 与运行环境信息

- 类型：`standard-library`；推荐阶段：中级。
- 项目证据：1 个文件；原始输入：1 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：本批内无。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:系统属性`。
- 代表符号：
  - `com.tdh.bdzz.config.AppStarter`：`dzzz-app/src/main/java/com/tdh/bdzz/config/AppStarter.java`

### JAVA-STDLIB-031 JMX 与 JVM 指标读取

- 类型：`standard-library`；推荐阶段：高级。
- 项目证据：1 个文件；原始输入：2 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-030`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:系统指标`、`review-capability:JMX`。
- 代表符号：
  - `com.tdh.bdzz.util.SystemMonitorUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/SystemMonitorUtil.java`

### JAVA-STDLIB-032 UUID 与伪随机数

- 类型：`standard-library`；推荐阶段：基础。
- 项目证据：3 个文件；原始输入：2 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：本批内无。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:Random`、`review-capability:UUID`。
- 代表符号：
  - `com.tdh.bdzz.util.CodeGenerator`：`dzzz-app/src/main/java/com/tdh/bdzz/util/CodeGenerator.java`
  - `com.tdh.bdzz.util.UniqueIDGeneratorUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/UniqueIDGeneratorUtil.java`
  - `com.tdh.bdzz.util.UniqueIdUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/UniqueIdUtils.java`

### JAVA-STDLIB-033 Throwable cause 异常链

- 类型：`standard-library`；推荐阶段：基础。
- 项目证据：3 个文件；原始输入：1 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-009`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:cause 保留`。
- 代表符号：
  - `com.tdh.bdzz.exception.ArgumentNotValidException`：`dzzz-app/src/main/java/com/tdh/bdzz/exception/ArgumentNotValidException.java`
  - `com.tdh.bdzz.exception.BpException`：`dzzz-app/src/main/java/com/tdh/bdzz/exception/BpException.java`
  - `com.tdh.bdzz.exception.RateLimitException`：`dzzz-app/src/main/java/com/tdh/bdzz/exception/RateLimitException.java`

## 3. 已验证排除项

- `URLConnection` 候选没有实际使用该 JDK 类型，本批保持 `pending`。
- `SSL` 与“静态资源 URL 编码”实际属于 Spring/Apache HTTP 能力，本批保持 `pending`。
- `ReentrantLock` 候选对应文件实际使用 `ConcurrentHashMap`，不伪造锁 API 能力。
- 纯 `synchronized`、`volatile`、默认方法等语言残留不回填已经关闭的语言批次。
- `try-with-resources` 复核输入只用于 `AutoCloseable` 资源合同，不重复建立语言能力。

## 4. 当前边界

- `modernBaseline` 与 `legacyBaseline` 只冻结版本线，不表示知识点研究已经完成。
- `courseStatus=candidate` 只表示进入能力矩阵，不表示已经选择为独立课程。
- 具体 API 合同、易错点、替代方案和开发技巧必须在 Phase 2 后逐项在线核验。
- 本批不处理框架、工程模式、风险反例、项目示例、课程正文或前端平台。
- Phase 1D 尚未完成，Gate 1 仍未通过。

下一批只能继续处理框架能力归一化，不能开始课程正文、菜单或 Markdown adapter。
