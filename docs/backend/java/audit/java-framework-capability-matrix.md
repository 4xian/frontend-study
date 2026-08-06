# `dzzz-app` Java 框架与第三方库能力矩阵

> 批次：Phase 1D 第 3 批：框架与第三方库能力归一化
> 源码快照：`dzzz-app-20260803-179e722831ab`
> 自动分析：`dzzz-app-analysis-20260803-958d37cf1be1`
> 状态：框架批次已归一化，研究与课程正文尚未开始

## 1. 本批边界

本批输入严格来自上一批的 754 个 `pending` 输入：

- 文件级能力候选：414 个；
- 剩余 Java 语言信号：0 个；
- 框架使用信号：21 个；
- 唯一风险说明：319 个。

本批把 235 个有直接 import、注解或配置 API 证据的输入合并为 34 个框架与第三方库能力。
其余 519 个输入继续保持 `pending`。
业务流程、设计模式、通用集成概念、风险说明和名实不符的残留候选均未提前归一化。

## 2. 规范能力

### JAVA-FRAMEWORK-001 Spring Boot 启动、自动配置与外部化配置

- 类型：`framework-library`；推荐阶段：基础。
- 项目证据：214 个文件；原始输入：11 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-001`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`framework-usage:spring-boot`、`review-capability:环境配置读取`、`review-capability:配置属性绑定`、`review-capability:外部化配置`、`review-capability:启动生命周期`、`review-capability:应用启动`、`review-capability:自动配置排除`、`review-capability:组件扫描`、`review-capability:Spring Boot 启动回调`、`review-capability:CommandLineRunner`、`review-capability:WAR 部署`。
- 代表符号：
  - `com.tdh.DzzzAreaApplication`：`dzzz-app/src/main/java/com/tdh/DzzzAreaApplication.java`
  - `com.tdh.bdzz.config.AppStarter`：`dzzz-app/src/main/java/com/tdh/bdzz/config/AppStarter.java`
  - `com.tdh.bdzz.config.SysConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/SysConfig.java`
  - `com.tdh.bdzz.config.DataSourceConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/DataSourceConfig.java`
  - `com.tdh.bdzz.cache.DzzzDxpzCacheLoader`：`dzzz-app/src/main/java/com/tdh/bdzz/cache/DzzzDxpzCacheLoader.java`

### JAVA-FRAMEWORK-002 Spring Core、IoC、依赖注入与 Bean 生命周期

- 类型：`framework-library`；推荐阶段：中级。
- 项目证据：451 个文件；原始输入：22 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-007`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`framework-usage:spring-core`、`review-capability:@Component stereotype`、`review-capability:@Service stereotype`、`review-capability:构造器注入`、`review-capability:容器桥接`、`review-capability:依赖获取边界`、`review-capability:依赖注入`、`review-capability:ApplicationContextAware`、`review-capability:Bean`、`review-capability:Bean 查找`、`review-capability:Bean 方法`、`review-capability:Bean 命名`、`review-capability:Bean 生命周期`、`review-capability:Bean 限定符`、`review-capability:Bean 注册`、`review-capability:Primary`、`review-capability:Assert`、`review-capability:Spring @Service`、`review-capability:Spring 依赖注入`、`review-capability:Spring 组件`、`review-capability:Spring Component`、`review-capability:Spring Service`。
- 代表符号：
  - `com.tdh.DzzzAreaApplication`：`dzzz-app/src/main/java/com/tdh/DzzzAreaApplication.java`
  - `com.tdh.bdzz.service.AsApiService`：`dzzz-app/src/main/java/com/tdh/bdzz/service/AsApiService.java`
  - `com.tdh.bdzz.service.CourtService`：`dzzz-app/src/main/java/com/tdh/bdzz/service/CourtService.java`
  - `com.tdh.bdzz.service.HjptApiService`：`dzzz-app/src/main/java/com/tdh/bdzz/service/HjptApiService.java`
  - `com.tdh.bdzz.config.websocket.DzzzEndpointConfigure`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/DzzzEndpointConfigure.java`

### JAVA-FRAMEWORK-003 Spring 应用事件

- 类型：`framework-library`；推荐阶段：高级。
- 项目证据：13 个文件；原始输入：7 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-FRAMEWORK-002`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:发布与监听边界`、`review-capability:事件发布与监听`、`review-capability:事件发布语义`、`review-capability:事件载荷`、`review-capability:ApplicationEventPublisher`、`review-capability:ApplicationListener`、`review-capability:Spring ApplicationEvent`。
- 代表符号：
  - `com.tdh.bdzz.context.event.DataReportEvent`：`dzzz-app/src/main/java/com/tdh/bdzz/context/event/DataReportEvent.java`
  - `com.tdh.bdzz.listener.ApplicationStartedEventListener`：`dzzz-app/src/main/java/com/tdh/bdzz/listener/ApplicationStartedEventListener.java`
  - `com.tdh.bdzz.context.event.EventPublisher`：`dzzz-app/src/main/java/com/tdh/bdzz/context/event/EventPublisher.java`
  - `com.tdh.bdzz.context.event.DealExpireDataEvent`：`dzzz-app/src/main/java/com/tdh/bdzz/context/event/DealExpireDataEvent.java`
  - `com.tdh.bdzz.listener.DataReportListener`：`dzzz-app/src/main/java/com/tdh/bdzz/listener/DataReportListener.java`

### JAVA-FRAMEWORK-004 Spring AOP 与 AspectJ

- 类型：`framework-library`；推荐阶段：高级。
- 项目证据：6 个文件；原始输入：6 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-FRAMEWORK-002`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`framework-usage:spring-aop`、`review-capability:代理匹配边界`、`review-capability:横切异常边界`、`review-capability:AOP JoinPoint`、`review-capability:AspectJ 切点表达式`、`review-capability:Spring AOP advice`。
- 代表符号：
  - `com.tdh.bdzz.aop.AppAspect`：`dzzz-app/src/main/java/com/tdh/bdzz/aop/AppAspect.java`
  - `com.tdh.bdzz.aop.PointCuts`：`dzzz-app/src/main/java/com/tdh/bdzz/aop/PointCuts.java`
  - `com.tdh.bdzz.aop.DzzzAspect`：`dzzz-app/src/main/java/com/tdh/bdzz/aop/DzzzAspect.java`
  - `com.tdh.bdzz.shard.DefaultAutowiredShardData`：`dzzz-app/src/main/java/com/tdh/bdzz/shard/DefaultAutowiredShardData.java`
  - `com.tdh.bdzz.shard.IAutowiredShardData`：`dzzz-app/src/main/java/com/tdh/bdzz/shard/IAutowiredShardData.java`

### JAVA-FRAMEWORK-005 Spring 异步执行与任务调度

- 类型：`framework-library`；推荐阶段：高级。
- 项目证据：23 个文件；原始输入：7 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-023`、`JAVA-FRAMEWORK-002`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`framework-usage:spring-scheduling-async`、`review-capability:@Async`、`review-capability:@Scheduled`、`review-capability:固定频率/cron`、`review-capability:异步代理边界`、`review-capability:异步方法`、`review-capability:异步与重试启用`。
- 代表符号：
  - `com.tdh.DzzzAreaApplication`：`dzzz-app/src/main/java/com/tdh/DzzzAreaApplication.java`
  - `com.tdh.bdzz.timer.handler.clearExpireData.ClearLocalCacheHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/clearExpireData/ClearLocalCacheHandler.java`
  - `com.tdh.bdzz.timer.trialInspect.CheckCameraTask`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/trialInspect/CheckCameraTask.java`
  - `com.tdh.bdzz.service.impl.InitHyServiceImpl`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/InitHyServiceImpl.java`
  - `com.tdh.bdzz.config.ThreadPoolConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/ThreadPoolConfig.java`

### JAVA-FRAMEWORK-006 Spring Retry

- 类型：`framework-library`；推荐阶段：高级。
- 项目证据：2 个文件；原始输入：2 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-009`、`JAVA-FRAMEWORK-002`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`framework-usage:spring-retry`、`review-capability:重试`。
- 代表符号：
  - `com.tdh.DzzzAreaApplication`：`dzzz-app/src/main/java/com/tdh/DzzzAreaApplication.java`
  - `com.tdh.bdzz.service.impl.MessageServiceImpl`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/MessageServiceImpl.java`

### JAVA-FRAMEWORK-007 Spring 声明式事务

- 类型：`framework-library`；推荐阶段：中级。
- 项目证据：115 个文件；原始输入：5 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-FRAMEWORK-002`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`framework-usage:spring-transaction`、`review-capability:声明式事务`、`review-capability:事务边界`、`review-capability:事务代理边界`、`review-capability:事务管理器`。
- 代表符号：
  - `com.tdh.bdzz.config.MybatisPlusConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/MybatisPlusConfig.java`
  - `com.tdh.bdzz.service.JzApiService`：`dzzz-app/src/main/java/com/tdh/bdzz/service/JzApiService.java`
  - `com.tdh.bdzz.timer.handler.fileProcess.AbstractFileProcessHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/fileProcess/AbstractFileProcessHandler.java`
  - `com.tdh.bdzz.service.UimService`：`dzzz-app/src/main/java/com/tdh/bdzz/service/UimService.java`
  - `com.tdh.bdzz.service.impl.AiXntjServiceImpl`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/AiXntjServiceImpl.java`

### JAVA-FRAMEWORK-008 Spring MVC 请求处理与扩展点

- 类型：`framework-library`；推荐阶段：中级。
- 项目证据：163 个文件；原始输入：22 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-FRAMEWORK-002`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`framework-usage:spring-mvc`、`review-capability:404 响应`、`review-capability:多路径映射`、`review-capability:静态资源`、`review-capability:静态资源 URL 编码`、`review-capability:拦截器`、`review-capability:路径匹配`、`review-capability:视图控制器`、`review-capability:请求体反序列化`、`review-capability:请求映射`、`review-capability:Controller`、`review-capability:Controller 分层`、`review-capability:ControllerAdvice`、`review-capability:CORS`、`review-capability:ExceptionHandler`、`review-capability:HandlerInterceptor`、`review-capability:HTTP 错误映射`、`review-capability:MultipartFile`、`review-capability:MVC 生命周期`、`review-capability:RequestContextHolder`、`review-capability:Spring MVC`、`review-capability:WebMvcConfigurer`。
- 代表符号：
  - `com.tdh.bdzz.config.SpringMvcConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/SpringMvcConfig.java`
  - `com.tdh.bdzz.config.SwaggerAccessBlockController`：`dzzz-app/src/main/java/com/tdh/bdzz/config/SwaggerAccessBlockController.java`
  - `com.tdh.bdzz.config.ThymeleafConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/ThymeleafConfig.java`
  - `com.tdh.bdzz.controller.BaseOuterController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/BaseOuterController.java`
  - `com.tdh.bdzz.controller.BlmbController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/BlmbController.java`

### JAVA-FRAMEWORK-009 Bean Validation 与 MVC 校验触发

- 类型：`framework-library`；推荐阶段：中级。
- 项目证据：603 个文件；原始输入：7 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-FRAMEWORK-008`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`framework-usage:bean-validation`、`review-capability:级联校验 @Valid`、`review-capability:校验空值与类型语义`、`review-capability:自定义校验器`、`review-capability:Bean Validation`、`review-capability:Bean Validation 约束`、`review-capability:Spring MVC 参数校验触发`。
- 代表符号：
  - `com.tdh.bdzz.annoation.CltjrSf`：`dzzz-app/src/main/java/com/tdh/bdzz/annoation/CltjrSf.java`
  - `com.tdh.bdzz.dto.swtpad.meeting.AddSwtHyjhDTO`：`dzzz-app/src/main/java/com/tdh/bdzz/dto/swtpad/meeting/AddSwtHyjhDTO.java`
  - `com.tdh.bdzz.annoation.impl.CltjrSfValidator`：`dzzz-app/src/main/java/com/tdh/bdzz/annoation/impl/CltjrSfValidator.java`
  - `com.tdh.bdzz.validator.MinValidator`：`dzzz-app/src/main/java/com/tdh/bdzz/validator/MinValidator.java`
  - `com.tdh.bdzz.controller.BaseOuterController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/BaseOuterController.java`

### JAVA-FRAMEWORK-010 Servlet API、Filter 与异步请求

- 类型：`framework-library`；推荐阶段：高级。
- 项目证据：139 个文件；原始输入：16 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-FRAMEWORK-008`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`framework-usage:servlet`、`review-capability:请求包装`、`review-capability:Filter 顺序`、`review-capability:Filter Bean`、`review-capability:FilterChain`、`review-capability:FilterRegistrationBean`、`review-capability:Servlet`、`review-capability:Servlet 初始化`、`review-capability:Servlet 会话`、`review-capability:Servlet 请求对象`、`review-capability:Servlet 请求响应边界`、`review-capability:Servlet 响应与下载`、`review-capability:Servlet AsyncContext`、`review-capability:Servlet Filter`、`review-capability:ServletContext`、`review-capability:ServletRegistrationBean`。
- 代表符号：
  - `com.tdh.bdzz.config.AppStarter`：`dzzz-app/src/main/java/com/tdh/bdzz/config/AppStarter.java`
  - `com.tdh.bdzz.filter.AccessFilter`：`dzzz-app/src/main/java/com/tdh/bdzz/filter/AccessFilter.java`
  - `com.tdh.bdzz.filter.AccessFilterConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/filter/AccessFilterConfig.java`
  - `com.tdh.bdzz.config.CorsConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/CorsConfig.java`
  - `com.tdh.bdzz.filter.BodyRequestWrapper`：`dzzz-app/src/main/java/com/tdh/bdzz/filter/BodyRequestWrapper.java`

### JAVA-FRAMEWORK-011 WebSocket Endpoint 与 Spring 集成

- 类型：`framework-library`；推荐阶段：高级。
- 项目证据：22 个文件；原始输入：10 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-FRAMEWORK-010`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`framework-usage:spring-websocket`、`review-capability:两阶段 WebSocket 握手`、`review-capability:服务端推送`、`review-capability:ServerEndpointExporter`、`review-capability:WebSocket 生命周期`、`review-capability:WebSocket 推送`、`review-capability:WebSocket 心跳`、`review-capability:WebSocket 状态机`、`review-capability:WebSocket Endpoint 创建`、`review-capability:WebSocket/HTTP`。
- 代表符号：
  - `com.tdh.bdzz.config.websocket.DzzzEndpointConfigure`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/DzzzEndpointConfigure.java`
  - `com.tdh.bdzz.config.websocket.server.ClientZzWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientZzWsServer.java`
  - `com.tdh.bdzz.config.websocket.server.Voice2TextWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/Voice2TextWsServer.java`
  - `com.tdh.bdzz.config.websocket.WebSocketConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/WebSocketConfig.java`
  - `com.tdh.bdzz.config.websocket.server.AppFrontYyzxWsServer`：`dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/AppFrontYyzxWsServer.java`

### JAVA-FRAMEWORK-012 Spring Data Redis 与 RedisTemplate

- 类型：`framework-library`；推荐阶段：高级。
- 项目证据：1 个文件；原始输入：4 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-FRAMEWORK-002`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`framework-usage:spring-data-redis`、`review-capability:泛型 Bean`、`review-capability:键值序列化`、`review-capability:RedisTemplate`。
- 代表符号：
  - `com.tdh.bdzz.config.RedisConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/RedisConfig.java`

### JAVA-FRAMEWORK-013 Springfox Swagger 2

- 类型：`framework-library`；推荐阶段：中级。
- 项目证据：209 个文件；原始输入：6 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-FRAMEWORK-008`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`framework-usage:swagger-2`、`review-capability:方法注解筛选`、`review-capability:API 文档配置`、`review-capability:Docket`、`review-capability:Swagger 2 模型描述`、`review-capability:Swagger 2 元数据`。
- 代表符号：
  - `com.tdh.DzzzAreaApplication`：`dzzz-app/src/main/java/com/tdh/DzzzAreaApplication.java`
  - `com.tdh.bdzz.config.SwaggerConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/SwaggerConfig.java`
  - `com.tdh.bdzz.dto.entity.FgdPageInitEntity`：`dzzz-app/src/main/java/com/tdh/bdzz/dto/entity/FgdPageInitEntity.java`
  - `com.tdh.bdzz.timer.dto.DoSearchCameraDto`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/dto/DoSearchCameraDto.java`
  - `com.tdh.bdzz.controller.BaseOuterController`：`dzzz-app/src/main/java/com/tdh/bdzz/controller/BaseOuterController.java`

### JAVA-FRAMEWORK-014 MyBatis Mapper、XML 与扩展点

- 类型：`framework-library`；推荐阶段：中级。
- 项目证据：149 个文件；原始输入：14 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-006`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`framework-usage:mybatis`、`review-capability:@Param 参数命名`、`review-capability:插件链`、`review-capability:注解 SQL`、`review-capability:Mapper 包扫描`、`review-capability:Mapper 扫描`、`review-capability:Mapper XML`、`review-capability:MyBatis`、`review-capability:MyBatis Interceptor`、`review-capability:MyBatis Mapper 代理`、`review-capability:MyBatis TypeHandler`、`review-capability:namespace 与 statement 绑定`、`review-capability:SqlSessionFactory`、`review-capability:JDBC 类型转换`。
- 代表符号：
  - `com.tdh.bdzz.config.MybatisPlusConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/MybatisPlusConfig.java`
  - `com.tdh.bdzz.dao.AnnotationsMapper`：`dzzz-app/src/main/java/com/tdh/bdzz/dao/AnnotationsMapper.java`
  - `com.tdh.bdzz.dao.CaseMapper`：`dzzz-app/src/main/java/com/tdh/bdzz/dao/CaseMapper.java`
  - `com.tdh.bdzz.dao.AnnotationTypesMapper`：`dzzz-app/src/main/java/com/tdh/bdzz/dao/AnnotationTypesMapper.java`
  - `com.tdh.bdzz.dao.BookmarksMapper`：`dzzz-app/src/main/java/com/tdh/bdzz/dao/BookmarksMapper.java`

### JAVA-FRAMEWORK-015 MyBatis-Plus CRUD 与映射

- 类型：`framework-library`；推荐阶段：中级。
- 项目证据：492 个文件；原始输入：13 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-FRAMEWORK-014`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`framework-usage:mybatis-plus`、`review-capability:@TableField 字段映射`、`review-capability:@TableId 主键映射`、`review-capability:@TableName`、`review-capability:批量插入`、`review-capability:通用持久化服务`、`review-capability:MyBatis-Plus`、`review-capability:MyBatis-Plus 分页`、`review-capability:MyBatis-Plus 字段映射`、`review-capability:MyBatis-Plus BaseMapper 泛型`、`review-capability:MyBatis-Plus SQL 注入器`、`review-capability:ServiceImpl 泛型`、`review-capability:Java 与数据库类型映射`。
- 代表符号：
  - `com.tdh.bdzz.cache.DzzzDxpzCacheLoader`：`dzzz-app/src/main/java/com/tdh/bdzz/cache/DzzzDxpzCacheLoader.java`
  - `com.tdh.bdzz.po.AnnotationTypesEntity`：`dzzz-app/src/main/java/com/tdh/bdzz/po/AnnotationTypesEntity.java`
  - `com.tdh.bdzz.po.AnnotationsEntity`：`dzzz-app/src/main/java/com/tdh/bdzz/po/AnnotationsEntity.java`
  - `com.tdh.bdzz.po.BookmarksEntity`：`dzzz-app/src/main/java/com/tdh/bdzz/po/BookmarksEntity.java`
  - `com.tdh.bdzz.config.EasySqlInjector`：`dzzz-app/src/main/java/com/tdh/bdzz/config/EasySqlInjector.java`

### JAVA-FRAMEWORK-016 Apache DBCP 数据源与连接池

- 类型：`framework-library`；推荐阶段：高级。
- 项目证据：2 个文件；原始输入：3 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-FRAMEWORK-014`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:数据源 Bean`、`review-capability:连接池`、`review-capability:SQL 白名单`。
- 代表符号：
  - `com.tdh.bdzz.config.DataSourceConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/DataSourceConfig.java`
  - `com.tdh.bdzz.config.DbcpSqlCheckConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/DbcpSqlCheckConfig.java`

### JAVA-FRAMEWORK-017 Lombok 注解代码生成

- 类型：`framework-library`；推荐阶段：中级。
- 项目证据：2330 个文件；原始输入：6 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-003`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`framework-usage:lombok`、`review-capability:Builder`、`review-capability:Builder 模式`、`review-capability:Lombok`、`review-capability:Lombok 代码生成`、`review-capability:Lombok 数据模型`。
- 代表符号：
  - `com.tdh.bdzz.aop.AppAspect`：`dzzz-app/src/main/java/com/tdh/bdzz/aop/AppAspect.java`
  - `com.tdh.bdzz.config.AmazonConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/AmazonConfig.java`
  - `com.tdh.bdzz.bo.AdjustSignBO`：`dzzz-app/src/main/java/com/tdh/bdzz/bo/AdjustSignBO.java`
  - `com.tdh.bdzz.enums.DragPosition`：`dzzz-app/src/main/java/com/tdh/bdzz/enums/DragPosition.java`
  - `com.tdh.bdzz.bo.AdjustTswjSignBO`：`dzzz-app/src/main/java/com/tdh/bdzz/bo/AdjustTswjSignBO.java`

### JAVA-FRAMEWORK-018 Jackson 映射与消息转换

- 类型：`framework-library`；推荐阶段：中级。
- 项目证据：15 个文件；原始输入：3 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-003`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`framework-usage:jackson`、`review-capability:Jackson 字段映射`、`review-capability:消息转换器`。
- 代表符号：
  - `com.tdh.bdzz.eo.tsaiassistant.TsjdAnalyzeStatusEO`：`dzzz-app/src/main/java/com/tdh/bdzz/eo/tsaiassistant/TsjdAnalyzeStatusEO.java`
  - `com.tdh.bdzz.vo.WftFzxcFmVO`：`dzzz-app/src/main/java/com/tdh/bdzz/vo/WftFzxcFmVO.java`
  - `com.tdh.bdzz.config.RestConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/RestConfig.java`
  - `com.tdh.bdzz.filter.AccessFilter`：`dzzz-app/src/main/java/com/tdh/bdzz/filter/AccessFilter.java`
  - `com.tdh.bdzz.service.impl.ClientZzServiceImpl`：`dzzz-app/src/main/java/com/tdh/bdzz/service/impl/ClientZzServiceImpl.java`

### JAVA-FRAMEWORK-019 Fastjson 序列化与解析

- 类型：`framework-library`；推荐阶段：中级。
- 项目证据：214 个文件；原始输入：8 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-003`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`framework-usage:fastjson`、`review-capability:Fastjson 字段映射`、`review-capability:JSON`、`review-capability:JSON 持久化`、`review-capability:JSON 解析`、`review-capability:JSON 类型处理`、`review-capability:JSON 路由`、`review-capability:JSON 状态`。
- 代表符号：
  - `com.tdh.bdzz.config.RedisConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/RedisConfig.java`
  - `com.tdh.bdzz.eo.tsaiassistant.TsjdAnalyzeStatusEO`：`dzzz-app/src/main/java/com/tdh/bdzz/eo/tsaiassistant/TsjdAnalyzeStatusEO.java`
  - `tdh.uim.client.vo.LoginRequest`：`dzzz-app/src/main/java/tdh/uim/client/vo/LoginRequest.java`
  - `com.tdh.bdzz.handler.AbstractJsonTypeHandler`：`dzzz-app/src/main/java/com/tdh/bdzz/handler/AbstractJsonTypeHandler.java`
  - `com.tdh.bdzz.service.tsaiassistant.TsLegalReasoningResultParserTest`：`dzzz-app/src/test/java/com/tdh/bdzz/service/tsaiassistant/TsLegalReasoningResultParserTest.java`

### JAVA-FRAMEWORK-020 JAXB XML 绑定与生成模型

- 类型：`framework-library`；推荐阶段：高级。
- 项目证据：455 个文件；原始输入：4 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-007`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`framework-usage:xml-jaxb`、`review-capability:生成代码边界`、`review-capability:JAXB XML 绑定`、`review-capability:XML 枚举映射`。
- 代表符号：
  - `com.tdh.bdzz.config.CxfConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/CxfConfig.java`
  - `com.tdh.bdzz.po.vidyo.admin.AddGroupRequest`：`dzzz-app/src/main/java/com/tdh/bdzz/po/vidyo/admin/AddGroupRequest.java`
  - `com.tdh.bdzz.po.vidyo.admin.AddGroupResponse`：`dzzz-app/src/main/java/com/tdh/bdzz/po/vidyo/admin/AddGroupResponse.java`
  - `com.tdh.bdzz.po.vidyo.admin.SortDir`：`dzzz-app/src/main/java/com/tdh/bdzz/po/vidyo/admin/SortDir.java`
  - `com.tdh.bdzz.po.vidyo.admin.AddMemberRequest`：`dzzz-app/src/main/java/com/tdh/bdzz/po/vidyo/admin/AddMemberRequest.java`

### JAVA-FRAMEWORK-021 XStream XML 映射

- 类型：`framework-library`；推荐阶段：高级。
- 项目证据：106 个文件；原始输入：5 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-003`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:对象映射`、`review-capability:XML`、`review-capability:XStream`、`review-capability:XStream XML 映射`、`review-capability:XStream/XML`。
- 代表符号：
  - `com.tdh.bdzz.util.XmlToBeanConverter`：`dzzz-app/src/main/java/com/tdh/bdzz/util/XmlToBeanConverter.java`
  - `com.tdh.bdzz.util.XmlUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/XmlUtils.java`
  - `com.tdh.bdzz.dto.hxsjsb.AjlxxxDTO`：`dzzz-app/src/main/java/com/tdh/bdzz/dto/hxsjsb/AjlxxxDTO.java`
  - `com.tdh.bdzz.timer.eo.AjxxDataEO`：`dzzz-app/src/main/java/com/tdh/bdzz/timer/eo/AjxxDataEO.java`
  - `com.tdh.bdzz.dto.hxsjsb.AjspxxDTO`：`dzzz-app/src/main/java/com/tdh/bdzz/dto/hxsjsb/AjspxxDTO.java`

### JAVA-FRAMEWORK-022 RestTemplate 与 Apache HttpClient

- 类型：`framework-library`；推荐阶段：高级。
- 项目证据：75 个文件；原始输入：10 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-013`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`framework-usage:http-client`、`review-capability:读取超时`、`review-capability:连接超时`、`review-capability:外部 HTTP 调用`、`review-capability:Apache HttpClient`、`review-capability:HTTP 客户端 Bean`、`review-capability:HTTP 客户端拦截器`、`review-capability:HTTP I/O`、`review-capability:RestTemplate`、`review-capability:SSL`。
- 代表符号：
  - `com.tdh.bdzz.config.RestConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/RestConfig.java`
  - `com.tdh.bdzz.service.AsApiService`：`dzzz-app/src/main/java/com/tdh/bdzz/service/AsApiService.java`
  - `com.tdh.bdzz.util.HttpClientUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/HttpClientUtil.java`
  - `com.tdh.bdzz.config.HeaderRequestInterceptor`：`dzzz-app/src/main/java/com/tdh/bdzz/config/HeaderRequestInterceptor.java`
  - `com.tdh.bdzz.util.HttpUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/HttpUtil.java`

### JAVA-FRAMEWORK-023 JUnit 4

- 类型：`framework-library`；推荐阶段：中级。
- 项目证据：8 个文件；原始输入：2 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-003`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`framework-usage:junit`、`review-capability:JUnit 4`。
- 代表符号：
  - `com.tdh.bdzz.aop.DzzzAspect`：`dzzz-app/src/main/java/com/tdh/bdzz/aop/DzzzAspect.java`
  - `com.tdh.bdzz.service.impl.TsFileSignNewDragServiceImplTest`：`dzzz-app/src/test/java/com/tdh/bdzz/service/impl/TsFileSignNewDragServiceImplTest.java`
  - `com.tdh.bdzz.service.tsaiassistant.TsAiTranscriptDiffServiceTest`：`dzzz-app/src/test/java/com/tdh/bdzz/service/tsaiassistant/TsAiTranscriptDiffServiceTest.java`
  - `com.tdh.bdzz.service.tsaiassistant.TsLegalReasoningResultParserTest`：`dzzz-app/src/test/java/com/tdh/bdzz/service/tsaiassistant/TsLegalReasoningResultParserTest.java`
  - `com.tdh.bdzz.service.tscwh.TscwhModelConfigTest`：`dzzz-app/src/test/java/com/tdh/bdzz/service/tscwh/TscwhModelConfigTest.java`

### JAVA-FRAMEWORK-024 Mockito

- 类型：`framework-library`；推荐阶段：中级。
- 项目证据：1 个文件；原始输入：2 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-FRAMEWORK-023`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`framework-usage:mockito`、`review-capability:Mockito`。
- 代表符号：
  - `com.tdh.bdzz.service.impl.TsFileSignNewDragServiceImplTest`：`dzzz-app/src/test/java/com/tdh/bdzz/service/impl/TsFileSignNewDragServiceImplTest.java`

### JAVA-FRAMEWORK-025 CXF、JAX-WS 与 SOAP

- 类型：`framework-library`；推荐阶段：高级。
- 项目证据：11 个文件；原始输入：8 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-013`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:CXF Bus`、`review-capability:CXF/Axis`、`review-capability:JAX-WS`、`review-capability:JAX-WS 服务合同`、`review-capability:SOAP`、`review-capability:SOAP/JAX-WS`、`review-capability:WSDL`、`review-capability:HTTP/SOAP 调用`。
- 代表符号：
  - `com.tdh.bdzz.config.CxfConfig`：`dzzz-app/src/main/java/com/tdh/bdzz/config/CxfConfig.java`
  - `com.tdh.bdzz.util.CxfClientUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/CxfClientUtil.java`
  - `com.tdh.bdzz.ws.ReTransmissionService`：`dzzz-app/src/main/java/com/tdh/bdzz/ws/ReTransmissionService.java`
  - `com.tdh.bdzz.po.vidyo.admin.VidyoPortalAdminServicePortType`：`dzzz-app/src/main/java/com/tdh/bdzz/po/vidyo/admin/VidyoPortalAdminServicePortType.java`
  - `com.tdh.bdzz.util.DynamicInvoker`：`dzzz-app/src/main/java/com/tdh/bdzz/util/DynamicInvoker.java`

### JAVA-FRAMEWORK-026 SLF4J 与 Logback

- 类型：`framework-library`；推荐阶段：中级。
- 项目证据：3 个文件；原始输入：4 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-LANG-009`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:部署环境`、`review-capability:滚动策略`、`review-capability:Logback`、`review-capability:SLF4J`。
- 代表符号：
  - `com.tdh.bdzz.rolling.InnerProjectRollingFileAppender`：`dzzz-app/src/main/java/com/tdh/bdzz/rolling/InnerProjectRollingFileAppender.java`
  - `com.tdh.bdzz.rolling.InnerProjectSizeAndTimeBasedRollingPolicy`：`dzzz-app/src/main/java/com/tdh/bdzz/rolling/InnerProjectSizeAndTimeBasedRollingPolicy.java`
  - `com.tdh.bdzz.storage.StorageProcessListener`：`dzzz-app/src/main/java/com/tdh/bdzz/storage/StorageProcessListener.java`

### JAVA-FRAMEWORK-027 FTP 与 SFTP 客户端

- 类型：`framework-library`；推荐阶段：高级。
- 项目证据：9 个文件；原始输入：3 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-013`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:Apache Commons Net`、`review-capability:FTP`、`review-capability:SFTP`。
- 代表符号：
  - `com.tdh.bdzz.storage.FtpWork`：`dzzz-app/src/main/java/com/tdh/bdzz/storage/FtpWork.java`
  - `com.tdh.bdzz.download.LocalDownloader`：`dzzz-app/src/main/java/com/tdh/bdzz/download/LocalDownloader.java`
  - `com.tdh.bdzz.download.MossDownloader`：`dzzz-app/src/main/java/com/tdh/bdzz/download/MossDownloader.java`
  - `com.tdh.bdzz.download.S3Downloader`：`dzzz-app/src/main/java/com/tdh/bdzz/download/S3Downloader.java`
  - `com.tdh.bdzz.download.SftpDownloader`：`dzzz-app/src/main/java/com/tdh/bdzz/download/SftpDownloader.java`

### JAVA-FRAMEWORK-028 AWS S3 与 MOSS 对象存储 SDK

- 类型：`framework-library`；推荐阶段：高级。
- 项目证据：2 个文件；原始输入：5 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-013`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:分片上传`、`review-capability:临时 URL`、`review-capability:预签名 URL`、`review-capability:AWS S3 SDK`、`review-capability:客户端生命周期`。
- 代表符号：
  - `com.tdh.bdzz.storage.S3Utils`：`dzzz-app/src/main/java/com/tdh/bdzz/storage/S3Utils.java`
  - `com.tdh.bdzz.storage.MossClientUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/storage/MossClientUtil.java`

### JAVA-FRAMEWORK-029 PDF 与 Office 文档库

- 类型：`framework-library`；推荐阶段：高级。
- 项目证据：18 个文件；原始输入：10 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-013`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:文档资源`、`review-capability:Office 转换`、`review-capability:PDF`、`review-capability:PDF fixture`、`review-capability:PDFBox`、`review-capability:PDFBox/iText/Aspose/Spire`、`review-capability:Aspose/Apache POI`、`review-capability:Word/RTF`、`review-capability:PDF 坐标`、`review-capability:HTML`。
- 代表符号：
  - `com.tdh.bdzz.util.AsposePdfUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/AsposePdfUtils.java`
  - `com.tdh.bdzz.util.ConvertPdf`：`dzzz-app/src/main/java/com/tdh/bdzz/util/ConvertPdf.java`
  - `com.tdh.bdzz.util.PptUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/PptUtil.java`
  - `com.tdh.bdzz.service.impl.TsFileSignNewDragServiceImplTest`：`dzzz-app/src/test/java/com/tdh/bdzz/service/impl/TsFileSignNewDragServiceImplTest.java`
  - `com.tdh.bdzz.util.PdfKeywordPositionUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/PdfKeywordPositionUtil.java`

### JAVA-FRAMEWORK-030 FFmpeg 与 JavaCV

- 类型：`framework-library`；推荐阶段：高级。
- 项目证据：2 个文件；原始输入：1 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-018`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:FFmpeg/JavaCV`。
- 代表符号：
  - `com.tdh.bdzz.factories.flv.ConverterFactories`：`dzzz-app/src/main/java/com/tdh/bdzz/factories/flv/ConverterFactories.java`
  - `com.tdh.bdzz.factories.flv.ConverterTranFactories`：`dzzz-app/src/main/java/com/tdh/bdzz/factories/flv/ConverterTranFactories.java`

### JAVA-FRAMEWORK-031 ONNX Runtime 与 DJL

- 类型：`framework-library`；推荐阶段：高级。
- 项目证据：1 个文件；原始输入：3 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-013`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:图片推理`、`review-capability:DJL`、`review-capability:ONNX`。
- 代表符号：
  - `com.tdh.bdzz.util.HandwritingClassifier`：`dzzz-app/src/main/java/com/tdh/bdzz/util/HandwritingClassifier.java`

### JAVA-FRAMEWORK-032 Java JWT

- 类型：`framework-library`；推荐阶段：高级。
- 项目证据：1 个文件；原始输入：3 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-028`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:令牌签名`、`review-capability:JWT`、`review-capability:声明校验`。
- 代表符号：
  - `com.tdh.bdzz.util.JWTUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/JWTUtil.java`

### JAVA-FRAMEWORK-033 二维码编解码库

- 类型：`framework-library`；推荐阶段：中级。
- 项目证据：2 个文件；原始输入：1 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-029`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:二维码`。
- 代表符号：
  - `com.tdh.bdzz.util.TwoDimensionCode`：`dzzz-app/src/main/java/com/tdh/bdzz/util/TwoDimensionCode.java`
  - `com.tdh.bdzz.util.TwoDimensionCodeImage`：`dzzz-app/src/main/java/com/tdh/bdzz/util/TwoDimensionCodeImage.java`

### JAVA-FRAMEWORK-034 SM2、SM3 与 Bouncy Castle

- 类型：`framework-library`；推荐阶段：高级。
- 项目证据：9 个文件；原始输入：2 个。
- 现代基线：Java 25 LTS；项目补充：Java 8。
- 前置能力：`JAVA-STDLIB-027`、`JAVA-STDLIB-028`。
- 状态：研究 `not-started`，示例 `not-started`，课程 `candidate`。
- 合并来源：`review-capability:SM2`、`review-capability:SM3`。
- 代表符号：
  - `com.tdh.bdzz.util.JzRSAUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/JzRSAUtils.java`
  - `com.tdh.bdzz.util.HMacUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/HMacUtils.java`
  - `com.tdh.bdzz.util.HtAsrUtils`：`dzzz-app/src/main/java/com/tdh/bdzz/util/HtAsrUtils.java`
  - `com.tdh.bdzz.util.RSASignUtil`：`dzzz-app/src/main/java/com/tdh/bdzz/util/RSASignUtil.java`
  - `com.tdh.bdzz.util.SM2Util`：`dzzz-app/src/main/java/com/tdh/bdzz/util/SM2Util.java`

## 3. 已验证边界决定

- 21 个自动框架信号已全部归一化；319 个风险说明全部保持 `pending`。
- `RedisConfig` 是有效配置类；`SSL` 归入 Apache HttpClient，静态资源 URL 编码归入 Spring MVC。
- `Builder 模式` 的 395 个冻结证据文件均直接使用 Lombok `@Builder`，因此只在本批归入 Lombok，不提前讲设计模式。
- `事务`、`超时`、`外部 HTTP`、`HTTP 调用`、`文档转换`、`XML I/O` 和`媒体流`是混合或间接场景，继续留给工程模式批次。
- `派生配置`、`配置数据建模`、`BeanUtils`、`Spring Order` 和文档端点访问控制没有形成单一直接框架证据，继续保持 `pending`。
- `URLConnection`、名实不符的 `ReentrantLock` 以及纯 `synchronized`、`volatile`、默认方法不伪装成框架能力。

## 4. 当前边界

- `modernBaseline` 与 `legacyBaseline` 只冻结版本线，不表示知识点研究已经完成。
- `courseStatus=candidate` 只表示进入能力矩阵，不表示已经选择为独立课程。
- 具体框架合同、迁移差异、易错点、替代方案和开发技巧必须在 Phase 2 后逐项在线核验。
- 本批不处理工程模式、风险反例、项目示例、课程正文或前端平台。
- Phase 1D 尚未完成，Gate 1 仍未通过。

下一批只能继续处理工程模式能力归一化，不能开始风险反例、课程正文、菜单或 Markdown adapter。
