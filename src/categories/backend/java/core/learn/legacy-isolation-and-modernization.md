---
id: backend.java.learn.advanced.legacy-isolation-and-modernization
type: lesson
title: Legacy 隔离、javax/jakarta 与现代化迁移
summary: 用双基线、兼容性证据和分批 Gate 把 Java 8 旧合同安全迁移到 Java 25 现代主线
domain: backend
technology: java
module: core
stage: advanced
level: advanced
estimatedMinutes: 260
objectives:
  - 能区分源码、二进制、运行时、依赖图和业务行为五类兼容性。
  - 能隔离 Java 8 / Boot 2.3 与 Java 25 / Boot 4.1 的构建、运行和发布资产。
  - 能规划 javax 到 jakarta、JDK 移除模块和内部 API 的分批迁移。
  - 能用 adapter、显式 charset 和资源所有权保护历史外部合同。
  - 能用双 JDK 反馈环和 fail-closed Gate 判断迁移是否可继续。
prerequisites:
  - backend.java.learn.intermediate.spring-boot-and-configuration
  - backend.java.learn.intermediate.lombok-and-generated-contracts
related: []
tags:
  - Java
  - Legacy
  - Jakarta
  - 兼容性
  - 现代化迁移
  - jdeps
  - 依赖治理
appliesTo: Java 25 / Spring Boot 4.1.0 / Spring Framework 7.0.8 主线；项目补充适用于 Java 8 / Spring Boot 2.3.12.RELEASE / Spring Framework 5.2.15.RELEASE
modernBaseline:
  java: '25'
  springBoot: 4.1.0
  springFramework: 7.0.8
  namespace: jakarta
legacyBaseline:
  java: '8'
  springBoot: 2.3.12.RELEASE
  springFramework: 5.2.15.RELEASE
  namespace: javax
verifiedAt: 2026-08-14
sources:
  - id: oracle-java-support-roadmap
    title: Oracle Java SE Support Roadmap
    url: https://www.oracle.com/java/technologies/java-se-support-roadmap.html
    sourceType: official-reference
    appliesTo: Oracle Java SE support roadmap
    claims: ['Java 25 是 LTS；课程现代线固定为 Java 25']
  - id: boot410-system-requirements
    title: Spring Boot 4.1.0 System Requirements
    url: https://docs.spring.io/spring-boot/system-requirements.html
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims: ['Boot 4.1.0 支持 Java 17 至 26，并要求 Spring Framework 7.0.8 或以上']
  - id: boot2312-system-requirements
    title: Spring Boot 2.3.12.RELEASE System Requirements
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims: ['旧线从 Java 8 起运行，并要求 Framework 5.2.15.RELEASE 或以上']
  - id: boot-upgrading
    title: Upgrading Spring Boot Applications
    url: https://docs.spring.io/spring-boot/upgrading.html
    sourceType: official-reference
    appliesTo: Spring Boot upgrade routes
    claims: ['跨版本升级要逐个检查被跨过版本的 release note 和升级指南']
  - id: boot30-migration-guide
    title: Spring Boot 3.0 Migration Guide
    url: https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide
    sourceType: release-note
    appliesTo: Spring Boot 2.x to 3.0
    claims: ['Boot 3 基于 Framework 6 和 Jakarta EE；依赖坐标与相关 import 要成组迁移']
  - id: spring607-overview
    title: Spring Framework 6.0.7 Overview
    url: https://docs.spring.io/spring-framework/docs/6.0.7/reference/html/overview.html
    sourceType: official-reference
    appliesTo: Spring Framework 6.0.7
    claims: ['Framework 6 要求 Java 17+，并迁移到 Jakarta EE 9 的 jakarta 命名空间']
  - id: jdk25-migrate-from-8
    title: Migrating from JDK 8 to Later JDK Releases
    url: https://docs.oracle.com/en/java/javase/25/migrate/migrating-jdk-8-later-jdk-releases.html
    sourceType: official-reference
    appliesTo: JDK 8 to JDK 25 migration
    claims: ['模块、反射强封装和移除项需要分别盘点和运行验证']
  - id: jdk25-removed-apis
    title: APIs Removed from the JDK
    url: https://docs.oracle.com/en/java/javase/25/migrate/removed-apis.html
    sourceType: official-reference
    appliesTo: APIs removed by JDK 25
    claims: ['多数 sun API 不受支持，应迁移到标准替代 API']
  - id: jdk25-removed-tools
    title: Removed Tools and Components
    url: https://docs.oracle.com/en/java/javase/25/migrate/removed-tools-and-components.html
    sourceType: official-reference
    appliesTo: Tools and components removed by JDK 25
    claims: ['JDK 11 移除了 Java EE、CORBA 模块及相关工具']
  - id: openjdk-jep320
    title: JEP 320 Remove the Java EE and CORBA Modules
    url: https://openjdk.org/jeps/320
    sourceType: release-note
    appliesTo: JDK 11
    claims: ['被移除能力需要显式外部依赖或完成移除']
  - id: openjdk-jep403
    title: JEP 403 Strongly Encapsulate JDK Internals
    url: https://openjdk.org/jeps/403
    sourceType: release-note
    appliesTo: JDK 17+ / Java 25
    claims: ['内部 API 被强封装，精确 add-opens 也只应是临时迁移例外']
  - id: jdk25-jdeps
    title: JDK 25 jdeps
    url: https://docs.oracle.com/en/java/javase/25/docs/specs/man/jdeps.html
    sourceType: official-reference
    appliesTo: JDK 25 jdeps
    claims: ['jdeps 可分析类、JAR、模块和 JDK 内部依赖，但不能证明动态路径']
  - id: jdk25-jdeprscan
    title: JDK 25 jdeprscan
    url: https://docs.oracle.com/en/java/javase/25/docs/specs/man/jdeprscan.html
    sourceType: official-reference
    appliesTo: JDK 25 jdeprscan
    claims: ['jdeprscan 报告 Java SE 弃用 API，不报告第三方库弃用']
  - id: jls25-binary-compatibility
    title: JLS 25 Chapter 13 Binary Compatibility
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-13.html
    sourceType: specification
    appliesTo: Java SE 25
    claims: ['旧二进制继续链接是独立于源码重编译和业务行为的兼容合同']
  - id: jvms25-class-file
    title: JVMS 25 Class File Format
    url: https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-4.html
    sourceType: specification
    appliesTo: Java SE 25 class file format
    claims: ['Java 25 class major 为 69；class-file 版本是运行时加载 Gate']
  - id: openjdk-jep400
    title: JEP 400 UTF-8 by Default
    url: https://openjdk.org/jeps/400
    sourceType: release-note
    appliesTo: JDK 18+ / Java 25
    claims: ['JDK 18 起默认 charset 统一为 UTF-8，但协议仍应显式指定 charset']
  - id: java8-charset
    title: Java 8 Charset API
    url: https://docs.oracle.com/javase/8/docs/api/java/nio/charset/Charset.html
    sourceType: api-doc
    appliesTo: Java 8
    claims: ['Java 8 默认 charset 在 VM 启动时确定并可能受环境影响']
  - id: java8-files
    title: Java 8 Files API
    url: https://docs.oracle.com/javase/8/docs/api/java/nio/file/Files.html
    sourceType: api-doc
    appliesTo: Java 8 and later
    claims: ['Java 8 已提供 Path、Files、显式 charset 和可关闭 stream']
  - id: mybatis-plus-pagination
    title: MyBatis-Plus Pagination Plugin
    url: https://baomidou.com/en/plugins/pagination/
    sourceType: official-reference
    appliesTo: Current MyBatis-Plus pagination plugin
    claims: ['现代分页使用 MybatisPlusInterceptor 和 PaginationInnerInterceptor']
  - id: spring708-server-endpoint-exporter
    title: Spring 7 ServerEndpointExporter API
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/socket/server/standard/ServerEndpointExporter.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims: ['现代 exporter 面向 jakarta.websocket 与 jakarta.servlet 类型']
  - id: spring5215-server-endpoint-exporter
    title: Spring 5.2.15 ServerEndpointExporter API
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/socket/server/standard/ServerEndpointExporter.html
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims: ['旧 exporter 面向 JSR-356 javax.websocket 容器']
  - id: boot410-external-config
    title: Spring Boot 4.1 Externalized Configuration
    url: https://docs.spring.io/spring-boot/4.1/reference/features/external-config.html
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims: ['配置名以 canonical kebab-case 建模并按规则映射环境变量']
  - id: openjdk-jep328
    title: JEP 328 Flight Recorder
    url: https://openjdk.org/jeps/328
    sourceType: release-note
    appliesTo: JDK 11+ / Java 25 JFR
    claims: ['JFR 记录运行时事件供诊断，不证明业务兼容']
  - id: openjdk-jmh
    title: OpenJDK JMH
    url: https://openjdk.org/projects/code-tools/jmh/
    sourceType: engineering-reference
    appliesTo: OpenJDK JMH
    claims: ['JMH 提供受控 JVM 基准方法，结论只适用于固定环境和负载']
projectEvidence:
  - file: dzzz-app/src/main/java/com/tdh/bdzz/constant/TsblTextCacheKeyBuilder.java
    symbol: com.tdh.bdzz.constant.TsblTextCacheKeyBuilder
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/CommonUtil.java
    symbol: com.tdh.bdzz.util.CommonUtil
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/enums/vidyo/common/VidyoDataCommon.java
    symbol: com.tdh.bdzz.enums.vidyo.common.VidyoDataCommon
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/MybatisPlusConfig.java
    symbol: com.tdh.bdzz.config.MybatisPlusConfig
    usage: rejected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/annoation/AutoValid.java
    symbol: com.tdh.bdzz.annoation.AutoValid
    usage: rejected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/clearExpireData/YzwYhbmSyncDataHandler.java
    symbol: com.tdh.bdzz.timer.handler.clearExpireData.YzwYhbmSyncDataHandler
    usage: rejected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/download/MossDownloader.java
    symbol: com.tdh.bdzz.download.MossDownloader
    usage: rejected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/AESUtils.java
    symbol: com.tdh.bdzz.util.AESUtils
    usage: rejected
---

# Legacy 隔离、javax/jakarta 与现代化迁移

## 为什么需要学习

Java 系统升级很少只是把版本号改大。源码可能能重新编译，旧消费者二进制却无法链接；应用可能能启动，
字符集、SQL、配置 key 或错误语义却已经变化；`javax` import 可能改完，容器和传递依赖仍停在旧生态。

本课把迁移从一次性“大爆炸”改成可回滚的证据链：legacy 与 modern 各自建立独立基线，逐项盘点依赖和
运行合同，用 adapter 隔离历史命名，再按五类兼容 Gate 小步升级。任何一类证据缺失都保持 `BLOCKED`。

## 学习目标

- 能给迁移项标注所属兼容类型和最小证据。
- 能建立互不混装的 Java 8 与 Java 25 构建运行矩阵。
- 能规划 Jakarta namespace、JDK 移除项和内部 API 的退出路径。
- 能用 adapter 保护旧 key，同时让 modern writer 只写规范合同。
- 能用双 JDK fixture 验证 charset、资源关闭和 fail-closed Gate。

## 前置术语

- **Legacy：** 仍需被兼容但不再作为新代码默认选择的版本、API 或外部合同。
- **Modern：** 当前支持基线下的新实现主线，不等于无条件删除历史数据或消费者。
- **Namespace：** 类型二进制身份的一部分；`javax.servlet.Filter` 与 `jakarta.servlet.Filter` 不是同一类型。
- **Adapter：** 在边界把旧合同单向翻译为内部规范模型的组件。
- **Gate：** 有明确输入证据、通过条件和失败状态的迁移关卡。

## 零基础知识点详解

### 兼容性要拆成五类证据

**它是什么：** 源码、二进制、运行时、依赖图和业务行为是五个不同问题。

**有什么作用：** 防止用一次编译成功掩盖链接失败、动态加载失败或业务输出漂移。

**什么时候使用：** 每次改变 JDK、框架、依赖、公开 API、配置或持久化格式时。

**怎么使用：** 为每类列出基线、目标、验证命令、通过条件、负责人和回滚点；未验证项标记 `BLOCKED`。

**最小示例：** `READY = source && binary && runtime && dependencies && behavior`。

**运行结果：** 五项全真才是 `READY`，任一缺失都返回 `BLOCKED`。

**常见误区：** 把“能编译”“能启动”或“依赖树无冲突”单独写成迁移完成。

### Legacy 与 modern 必须是独立矩阵

**它是什么：** Java 8 / Boot 2.3 与 Java 25 / Boot 4.1 各有自己的编译器、BOM、容器、配置和产物。

**有什么作用：** 避免 modern 依赖偶然进入旧运行时，也避免 `javax` 与 `jakarta` 类型混装。

**什么时候使用：** 迁移窗口内仍需同时维护旧部署和现代候选版本时。

**怎么使用：** 两条 CI job 分别锁定 JDK、依赖图、class major 和冷启动命令，产物使用不同坐标或镜像标签。

**最小示例：** `legacy -> major 52`，`modern -> major 69`，两者不复用 class 目录。

**运行结果：** 两条线分别构建和运行，失败可定位到单一基线。

**常见误区：** 在 Java 25 上用一个 classpath 同时验证旧线和现代线。

### `--release` 与 class major 是加载 Gate

**它是什么：** `javac --release 8` 限制目标 Java SE API 和 class-file 版本；Java 8 major 为 52，Java 25 为 69。

**有什么作用：** 阻止旧目标源码偷用高版本 API，并验证目标 VM 是否能加载产物。

**什么时候使用：** 一个现代编译器要生成旧目标库，或核对发布产物的运行时最低版本时。

**怎么使用：** 编译后执行 `javap -verbose`，再在真实 Java 8 runtime 运行；`--release 8` 不能替代旧 VM。

**最小示例：** `javac --release 8 Example.java && javap -verbose Example | grep 'major version'`。

**运行结果：** 目标产物显示 major 52；普通 Java 25 编译显示 major 69。

**常见误区：** 只看源码语法像 Java 8，就认为生成的 class 可以在 Java 8 运行。

### 依赖图是可发布合同

**它是什么：** BOM、直接依赖、传递边、重复类、provider 和插件共同决定运行时实际类型集合。

**有什么作用：** 找出旧 Jakarta/Java EE 坐标、未管理版本、重复 provider 和被覆盖的实现。

**什么时候使用：** 每个框架主版本升级、starter 替换、驱动升级和 namespace 切换前后。

**怎么使用：** 冻结解析后的依赖树，比较新增/删除边，检查重复类和 ServiceLoader provider，再做冷启动。

**最小示例：** `mvn dependency:tree` 与 `jdeps --missing-deps app.jar` 形成两种静态证据。

**运行结果：** 目标 BOM 唯一管理框架版本，旧 namespace 依赖和重复 provider 为零。

**常见误区：** 只升级 `pom.xml` 中可见的直接依赖。

### `javax` 到 `jakarta` 是生态成组迁移

**它是什么：** Jakarta EE 规范包改变了 namespace，相关依赖坐标、容器、实现库和 import 必须一致迁移。

**有什么作用：** 保证编译类型与运行容器识别的是同一套 API。

**什么时候使用：** 从 Spring 5 / Boot 2 进入 Spring 6+ / Boot 3+ 时。

**怎么使用：** 先列出 Jakarta EE 规范包，再同步替换依赖、import、容器和测试；Java SE 的 `javax.sql`、
`javax.crypto` 等包不做全局替换。

**最小示例：** Servlet 旧线只用 `javax.servlet.*`，现代线只用 `jakarta.servlet.*`。

**运行结果：** 每个运行单元只有目标 namespace，容器集成测试能加载并调用目标类型。

**常见误区：** 全局替换所有 `javax.` 字符串，误伤 Java SE API 和序列化合同。

### JDK 移除模块要显式外置或删除

**它是什么：** JDK 11 移除了 JAXB、JAX-WS、Activation、CORBA 等 Java EE/CORBA 模块和工具。

**有什么作用：** 把 Java 8 环境中的隐式 JDK 能力变成可管理依赖，或明确移除不用的功能。

**什么时候使用：** Java 8 应用首次在 Java 11+ 编译或启动前。

**怎么使用：** 盘点引用和动态加载，选择匹配 namespace 的 API 与实现，锁定版本并在 clean runtime 冷启动。

**最小示例：** `Class.forName` 失败只能说明类缺失，不能自动决定应添加哪个版本的实现。

**运行结果：** 所需能力来自显式依赖，未使用能力不再进入产物。

**常见误区：** 因 Java 8 能运行，就假定现代 JDK 仍内置同一模块。

### 内部 API 开口只能是临时例外

**它是什么：** `--add-exports` 放宽编译/链接访问，`--add-opens` 放宽深反射访问。

**有什么作用：** 在替换旧库期间精确记录并短暂恢复一个已知访问路径。

**什么时候使用：** 只有已复现堆栈、暂无立即替代且例外有删除期限时。

**怎么使用：** 每项绑定 source module、package、target module、owner、替代 API、依赖升级和删除版本。

**最小示例：** `--add-opens java.base/java.lang=legacy.tool`，不能扩成无台账的永久模板。

**运行结果：** 已知旧工具暂时启动；升级替代依赖后 CI 要求删除该参数。

**常见误区：** 使用 `ALL-UNNAMED` 消除所有错误后宣称完成现代化。

### 静态扫描与运行探针要组合

**它是什么：** `jdeps` 查静态依赖，`jdeprscan` 查 Java SE 弃用；反射、配置类名和动态 provider 需运行探针。

**有什么作用：** 形成可追踪 inventory，同时承认每种工具的不可见区域。

**什么时候使用：** 迁移设计前、每个升级批次后和最终删除兼容开口前。

**怎么使用：** 扫描应用及第三方 JAR，保存输出；再覆盖反射、ServiceLoader、序列化和配置驱动路径。

**最小示例：** `jdeps --jdk-internals app.jar` 清洁后仍要运行动态加载路径。

**运行结果：** 每个发现都有 owner 和处置；静态清洁不被误写成动态清洁。

**常见误区：** `jdeps` 无输出就推断没有反射或第三方弃用。

### 历史命名通过单向 adapter 退出

**它是什么：** adapter 接受冻结的旧 key 或旧值，映射为内部规范名称；modern writer 只输出新合同。

**有什么作用：** 在兼容窗口内保护旧消费者，同时阻止历史拼写继续扩散。

**什么时候使用：** 公开方法、wire key、配置 key 或持久化值无法一次性删除时。

**怎么使用：** 建立有限 allowlist，记录命中次数，未知旧值拒绝；先双读单写，再按观测删除旧读路径。

**最小示例：** `userNmae -> userName` 是允许映射，其他未知 key 返回失败。

**运行结果：** 旧输入只迁移一次，新输出始终使用 `userName`。

**常见误区：** 内部模型同时保留两套字段，导致新旧名称永久并存。

### 资源迁移要明确所有权

**它是什么：** 用 `Path` / `Files` 和 try-with-resources 让路径、流和关闭责任集中在最小作用域。

**有什么作用：** 保证成功与异常路径都关闭资源，并保留关闭异常的语言语义。

**什么时候使用：** 把分散 `File`、手工 close 和宽生命周期 stream 迁入新边界时。

**怎么使用：** 入口接收 `Path`，创建流的层负责关闭；需要返回流时明确把关闭责任写入接口合同。

**最小示例：** `try (InputStream input = Files.newInputStream(path)) { ... }`。

**运行结果：** 成功和异常路径的可计数资源都只关闭一次。

**常见误区：** 只改 `File` 为 `Path`，却继续让多个层共同管理同一流。

### 字符集必须是协议字段

**它是什么：** 文件、HTTP body、签名输入和缓存 key 都要显式绑定 charset，不能继承平台默认值。

**有什么作用：** 避免 Java 8 主机差异与 Java 18+ UTF-8 默认变化造成同一文本不同 bytes。

**什么时候使用：** 字符串和字节发生转换的所有外部边界。

**怎么使用：** 使用 `StandardCharsets.UTF_8`，以包含中文的 fixture 对比 bytes、文本和摘要。

**最小示例：** `text.getBytes(StandardCharsets.UTF_8)`。

**运行结果：** Java 8 与 Java 25 得到相同 bytes 和 SHA-256。

**常见误区：** 因现代 JDK 默认 UTF-8，就省略协议中的 charset。

### 框架 API 必须绑定精确版本和单一模型

**它是什么：** 分页插件、WebSocket endpoint 等 API 受框架版本和容器编程模型约束。

**有什么作用：** 避免只换类名却保留旧生命周期、重复注册或错误 SQL 合同。

**什么时候使用：** 迁移 MyBatis-Plus 插件、Servlet/WebSocket endpoint 或容器 exporter 时。

**怎么使用：** legacy 与 modern 分别编译；现代分页验证生成 SQL，WebSocket 只选一个 owner 并做容器测试。

**最小示例：** modern 分页使用 `MybatisPlusInterceptor` 加 `PaginationInnerInterceptor`。

**运行结果：** SQL、endpoint 数量、注册 owner 和连接生命周期符合目标版本。

**常见误区：** 同时注册 Spring handler 与标准 endpoint，或机械替换插件类名。

### 数据源、方言、时区和配置要显式拆分

**它是什么：** 连接池实现、数据库方言、URL、时区和配置 key 是不同维度的合同。

**有什么作用：** 避免强转具体连接池、从 URL 子串猜行为或依赖异常属性命名。

**什么时候使用：** 数据源、驱动、连接池或配置绑定进入升级批次时。

**怎么使用：** 通过 capability、driver metadata 或显式配置选择方言；未知组合 fail-closed，key 使用 kebab-case。

**最小示例：** `database.dialect=postgresql` 与连接 URL 分开验证。

**运行结果：** 缺失或未知方言拒绝启动，不修改调用方提供的 URL。

**常见误区：** 从 URL 查找字符串并追加时区参数，把实现细节变成公开合同。

### 分批 Gate 和回滚才是完成证据

**它是什么：** 每批只改变一组主要变量，并重跑五类兼容证据、代表行为和回滚演练。

**有什么作用：** 让失败可定位、版本可部署、兼容例外可删除。

**什么时候使用：** 从旧 JDK 和 Boot 2 跨多个主版本进入 Boot 4 时。

**怎么使用：** 冻结外部合同，先升旧线最新维护版，再切 JDK、namespace、框架和插件；每步都有停止条件。

**最小示例：** `2.3 baseline -> supported 2.x -> 3.x -> 3.5.x -> 4.1`，每箭头独立验收。

**运行结果：** 当前批失败就恢复上一可部署版本，不继续叠加未知变化。

**常见误区：** JFR 没异常或 JMH 更快就代替功能、依赖和业务兼容 Gate。

## 现代版本中的正确用法

先冻结对外 API、消息、数据库、缓存、文件、配置和错误语义，再建立独立 legacy/modern 构建。迁移 inventory
必须同时包含依赖树、移除模块、内部 API、Java SE 弃用、反射和动态 provider。进入 Jakarta 前，明确哪些包属于
Jakarta EE；`javax.sql`、`javax.crypto` 等 Java SE API 继续保留原包名。

历史 key 在边界 adapter 内双读单写，modern 内部模型不出现旧拼写。`--add-opens` 和 `--add-exports` 只在有
owner、删除版本和替代 API 时临时存在。每一批都从 clean environment 冷启动并回放相同行为摘要。

## 核心接口与完整示例

下面的单文件只使用 Java 8 语法和标准库。它验证五类 Gate、旧 key 映射、UTF-8 字节和资源关闭，不模拟
Spring、Jakarta 容器、数据库或完整业务迁移。

```java
import java.io.Closeable;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

/** 演示双 JDK 可复用的 legacy 隔离与现代化迁移边界。 */
public final class LegacyModernizationExample {
    /** 禁止创建示例工具实例。 */
    private LegacyModernizationExample() {
    }

    /** 表示迁移 Gate 的结果。 */
    enum GateStatus {
        READY,
        BLOCKED
    }

    /** 聚合五类互不替代的兼容证据。 */
    static final class CompatibilityGate {
        /** 只有五类证据全部存在时才允许继续。 */
        GateStatus evaluate(boolean source, boolean binary, boolean runtime,
                boolean dependencyGraph, boolean behavior) {
            return source && binary && runtime && dependencyGraph && behavior
                    ? GateStatus.READY : GateStatus.BLOCKED;
        }
    }

    /** 把有限的旧 key 单向映射到规范 key。 */
    static final class LegacyNameAdapter {
        private final Map<String, String> aliases;

        /** 创建只包含冻结旧 key 的适配器。 */
        LegacyNameAdapter() {
            Map<String, String> draft = new LinkedHashMap<String, String>();
            draft.put("userNmae", "userName");
            aliases = Collections.unmodifiableMap(draft);
        }

        /** 返回规范 key，未知旧 key 直接拒绝。 */
        String canonical(String key) {
            if ("userName".equals(key)) {
                return key;
            }
            String mapped = aliases.get(key);
            if (mapped == null) {
                throw new IllegalArgumentException("unknown legacy key");
            }
            return mapped;
        }

        /** modern writer 始终只输出规范 key。 */
        Map<String, String> write(String value) {
            Map<String, String> result = new LinkedHashMap<String, String>();
            result.put("userName", value);
            return Collections.unmodifiableMap(result);
        }
    }

    /** 使用显式 UTF-8 管理文本与字节边界。 */
    static final class EncodingBoundary {
        /** 写入并读回固定文本，返回十六进制 SHA-256。 */
        String roundTrip(Path path, String text) throws Exception {
            byte[] expected = text.getBytes(StandardCharsets.UTF_8);
            Files.write(path, expected);
            byte[] actual = Files.readAllBytes(path);
            require(java.util.Arrays.equals(expected, actual), "bytes changed");
            require(text.equals(new String(actual, StandardCharsets.UTF_8)), "text changed");
            return hex(MessageDigest.getInstance("SHA-256").digest(actual));
        }

        /** 把摘要字节编码为稳定小写十六进制。 */
        private String hex(byte[] bytes) {
            StringBuilder result = new StringBuilder(bytes.length * 2);
            for (byte value : bytes) {
                result.append(String.format("%02x", Integer.valueOf(value & 0xff)));
            }
            return result.toString();
        }
    }

    /** 记录资源关闭次数。 */
    static final class CountingResource implements Closeable {
        private int closeCount;

        /** 返回资源当前关闭次数。 */
        int closeCount() {
            return closeCount;
        }

        /** 将资源关闭次数增加一次。 */
        @Override
        public void close() throws IOException {
            closeCount++;
        }
    }

    /** 验证成功或异常路径都恰好关闭资源一次。 */
    static final class ResourceBoundary {
        /** 执行一次受资源保护的工作。 */
        int execute(boolean fail) {
            CountingResource resource = new CountingResource();
            try (CountingResource ignored = resource) {
                require(ignored.closeCount() == 0, "resource closed before work");
                if (fail) {
                    throw new IllegalStateException("planned failure");
                }
            } catch (IOException error) {
                throw new IllegalStateException(error);
            } catch (IllegalStateException error) {
                if (!fail) {
                    throw error;
                }
            }
            return resource.closeCount();
        }
    }

    /** 断言固定反馈环条件。 */
    private static void require(boolean condition, String message) {
        if (!condition) {
            throw new IllegalStateException(message);
        }
    }

    /** 运行双 JDK 可复用的迁移边界反馈环。 */
    public static void main(String[] args) throws Exception {
        CompatibilityGate gate = new CompatibilityGate();
        require(gate.evaluate(true, true, true, true, true) == GateStatus.READY,
                "complete evidence blocked");
        require(gate.evaluate(true, true, true, false, true) == GateStatus.BLOCKED,
                "missing evidence passed");

        LegacyNameAdapter adapter = new LegacyNameAdapter();
        require("userName".equals(adapter.canonical("userNmae")), "mapping failed");
        require(adapter.write("Lin").containsKey("userName"), "modern key missing");
        require(!adapter.write("Lin").containsKey("userNmae"), "legacy key leaked");
        boolean unknownRejected = false;
        try {
            adapter.canonical("unknown");
        } catch (IllegalArgumentException expected) {
            unknownRejected = true;
        }
        require(unknownRejected, "unknown key accepted");

        Path temp = Files.createTempFile("legacy-modernization", ".txt");
        try {
            String digest = new EncodingBoundary().roundTrip(temp, "迁移合同");
            require("2f0d16901dbdaa9fb4e73375f2eb7d2f649678f3ff465b5104e89b6e11a32a0b"
                    .equals(digest), "digest changed");
        } finally {
            Files.deleteIfExists(temp);
        }

        ResourceBoundary resources = new ResourceBoundary();
        require(resources.execute(false) == 1, "success close changed");
        require(resources.execute(true) == 1, "failure close changed");
        System.out.println("LEGACY_MODERNIZATION_PASS mapping=1 charset=1 close=1 failClosed=1");
    }
}
```

## 从零跟着做

1. 冻结外部合同和当前可部署版本，记录依赖树、class major、配置与代表行为摘要。
2. 为源码、二进制、运行时、依赖图和业务行为各建一个 Gate，不允许一项替代另一项。
3. 运行 `jdeps`、`jdeprscan`、依赖树和动态探针，给每个发现绑定 owner 与处置。
4. 先升级到旧线可支持的维护版本，再分批切 JDK、Jakarta namespace、框架和插件。
5. 旧 key、旧值和旧拼写只通过 adapter 进入，modern writer 只写规范合同。
6. 每批在 clean environment 冷启动、回放行为、检查回滚，并删除已不需要的兼容例外。
7. 提取完整示例，在 Java 25 和 Java 8 各编译运行两次并检查 class major。

## 适用与不适用场景

本方法适用于跨 JDK/框架主版本、存在旧消费者或历史数据、需要持续发布的系统。一个无外部合同、可直接替换的
小工具不需要长期双线；但仍要验证目标 JDK 和依赖。adapter 不能成为永久双模型，`--add-opens` 也不能成为
架构接口。无法回滚的数据迁移必须单独设计，不应隐藏在本课的代码升级步骤中。

:::tip
迁移清单的最小单位不是“改了多少 import”，而是“哪一类合同发生变化、用什么证据证明、失败回到哪里”。
:::

## 当前项目补充

冻结矩阵中的 `JAVA-ENGINEERING-034` 提供 3 条 observed 兼容场景；`JAVA-RISK-041` 的 76 条文件级证据只按
risk-only 使用。frontmatter 转录 5 个代表 rejected 符号用于讲解旧插件、历史命名、资源、charset 和显式配置
边界，不把路径或符号名写成当前缺陷结论，也不读取项目源码。

## Java 8 / Spring Boot 2.3 兼容写法

Java 8 线保持 Boot 2.3.12、Framework 5.2.15 和 `javax` 容器合同，class major 固定为 52。现代线使用 Java 25、
Boot 4.1、Framework 7.0.8 和 Jakarta 类型，class major 为 69。两条线可以共享业务协议 fixture，但不能共享
编译产物、依赖图或容器类型。

## 新旧版本差异

| 对比项 | Java 25 / Boot 4.1 | Java 8 / Boot 2.3 legacy | 迁移注意 |
| --- | --- | --- | --- |
| class major | 69 | 52 | `--release 8` 不能代替真实 Java 8 运行 |
| Web/Validation namespace | `jakarta.*` | `javax.*` | 依赖、容器、import 成组迁移 |
| JDK Java EE 模块 | 不再内置 | JDK 8 曾聚合部分模块 | 显式外置或移除 |
| 默认 charset | JDK 18+ 为 UTF-8 | 可能随平台变化 | 外部协议始终显式 UTF-8 |
| 分页插件 | 现代 inner interceptor | 旧 `PaginationInterceptor` | 分线编译并验证 SQL |
| 配置模型 | canonical kebab-case | 可能存在历史 key | adapter 双读单写后退出 |

## 易错点

:::pitfalls
### 错误：一次升级所有主要变量

**现象：** 启动、SQL、序列化和容器错误同时出现。

**触发条件：** 一批同时改 JDK、Boot、Framework、驱动和插件。

**原因：** 多条兼容合同失去独立反馈环。

**后果：** 无法定位回归，也没有可靠回滚点。

**错误示例：**
```text
2.3 + Java 8 -> 4.1 + Java 25 + new driver + new plugin
```

**正确写法：**
```text
每一箭头只改变一组主要变量，并重跑五类 Gate。
```

**影响版本：** 所有跨主版本迁移。

**验证方式：** 检查每批 manifest、验证结果与上一可部署版本。

**来源：** `boot-upgrading`、`boot30-migration-guide`。

### 错误：编译通过就声称全部兼容

**现象：** 新源码能编译，旧消费者链接或业务回放失败。

**触发条件：** 只保留 `javac` 结果。

**原因：** 源码兼容不等于二进制、运行时和行为兼容。

**后果：** 发布后出现 `NoSuchMethodError` 或静默行为漂移。

**错误示例：**
```text
javac PASS = migration READY
```

**正确写法：**
```text
source && binary && runtime && dependencies && behavior
```

**影响版本：** 所有 Java 版本。

**验证方式：** 固定旧消费者链接运行并回放代表业务摘要。

**来源：** `jls25-binary-compatibility`。

### 错误：现代编译器直接生成旧目标产物

**现象：** 产物在 Java 8 报 UnsupportedClassVersionError。

**触发条件：** Java 25 编译旧语法时未使用 `--release 8`。

**原因：** 源码语法与 class-file/API 目标是不同维度。

**后果：** 生成 major 69 或引用 Java 9+ API。

**错误示例：**
```shell
javac Example.java
```

**正确写法：**
```shell
javac --release 8 Example.java
```

**影响版本：** Java 9+ 编译器到 Java 8 目标。

**验证方式：** `javap -verbose` 检查 major 52，并在真实 Java 8 运行。

**来源：** `jvms25-class-file`、`jdk25-migrate-from-8`。

### 错误：同一运行单元混装 javax 与 jakarta

**现象：** 类型看似同名，却无法赋值、扫描或由容器识别。

**触发条件：** 旧 Servlet/Validation 依赖与现代框架同时存在。

**原因：** namespace 是类型二进制身份的一部分。

**后果：** 编译失败、类加载失败或 endpoint 未注册。

**错误示例：**
```java
javax.servlet.Filter oldFilter = new jakarta.servlet.Filter() { };
```

**正确写法：**
```text
一个运行单元只使用目标 Jakarta EE namespace；Java SE javax 包不全局替换。
```

**影响版本：** Spring 5 到 Spring 6+。

**验证方式：** 依赖树和重复类检查后执行真实容器集成测试。

**来源：** `spring607-overview`、`boot30-migration-guide`。

### 错误：假设现代 JDK 仍内置 Java EE 模块

**现象：** clean runtime 出现 ClassNotFoundException。

**触发条件：** 旧代码依赖 JAXB、JAX-WS、Activation 或 CORBA。

**原因：** JDK 11 已移除这些模块和工具。

**后果：** 编译或部署失败，临时机器差异掩盖问题。

**错误示例：**
```java
Class.forName("javax.xml.bind.JAXBContext");
```

**正确写法：**
```text
按目标 namespace 显式选择 API 与实现，或删除不再需要的能力。
```

**影响版本：** JDK 11+。

**验证方式：** clean runtime 冷启动并检查显式依赖来源。

**来源：** `jdk25-removed-tools`、`openjdk-jep320`。

### 错误：永久保留内部 API 开口

**现象：** 启动脚本中的 add-opens 越来越多。

**触发条件：** 每次反射失败都添加 `ALL-UNNAMED`。

**原因：** 临时兼容参数被当成受支持 API。

**后果：** 升级风险继续累积，真实依赖 owner 不清楚。

**错误示例：**
```shell
java --add-opens java.base/java.lang=ALL-UNNAMED -jar app.jar
```

**正确写法：**
```text
精确 module/package/target，并绑定 owner、替代 API 和删除版本。
```

**影响版本：** JDK 17+ 尤其明显。

**验证方式：** CI 比较例外台账，数量增长即 Gate 失败。

**来源：** `openjdk-jep403`、`jdk25-migrate-from-8`。

### 错误：静态扫描清洁就忽略动态路径

**现象：** jdeps 无告警，运行到反射或 ServiceLoader 才失败。

**触发条件：** 只扫描字节码的直接静态依赖。

**原因：** 配置类名、反射和动态 provider 不一定进入静态图。

**后果：** inventory 不完整，删除依赖过早。

**错误示例：**
```text
jdeps empty -> no dynamic dependencies
```

**正确写法：**
```text
jdeps + jdeprscan + dependency tree + runtime probes
```

**影响版本：** 所有模块化迁移。

**验证方式：** 覆盖反射、配置、生成代码和 provider 的运行路径。

**来源：** `jdk25-jdeps`、`jdk25-jdeprscan`。

### 错误：只升级直接依赖

**现象：** 目标依赖已更新，运行时仍加载旧 provider 或重复类。

**触发条件：** 不比较解析后的传递依赖图。

**原因：** starter、BOM 和插件会引入隐式版本与实现。

**后果：** 类遮蔽、方法缺失或 namespace 混装。

**错误示例：**
```xml
<version>new</version><!-- 只看这一行 -->
```

**正确写法：**
```text
冻结 dependency tree，比较传递边、重复类、provider 和未管理版本。
```

**影响版本：** 所有 Maven/Gradle 项目。

**验证方式：** clean cache 解析并核对目标 BOM 之外的版本。

**来源：** `boot-upgrading`、`boot30-migration-guide`。

### 错误：直接删除历史公开名称

**现象：** 旧配置、payload 或数据库值升级后无法读取。

**触发条件：** 重命名后立即删除旧入口。

**原因：** 没有 adapter、弃用窗口和消费者回放。

**后果：** 兼容性中断或新旧名称继续散落。

**错误示例：**
```java
String key = input.get("userName");
```

**正确写法：**
```java
String key = adapter.canonical(inputKey);
```

**影响版本：** 所有公开合同迁移。

**验证方式：** 旧 fixture 可读、新 writer 只写规范 key、未知 key 拒绝。

**来源：** `boot410-external-config`。

### 错误：复制反编译兼容源码

**现象：** modern 模块出现旧内部类型、历史拼写和不明生命周期。

**触发条件：** 为快速兼容而复制反编译实现。

**原因：** 把外部可观察合同与偶然内部结构混为一体。

**后果：** 维护、安全与许可证边界不清，后续升级更难。

**错误示例：**
```text
copy decompiled implementation into modern source
```

**正确写法：**
```text
只记录可观察输入输出，重新实现最小 adapter 并绑定官方 API。
```

**影响版本：** 所有 legacy 隔离场景。

**验证方式：** modern source 不包含旧内部类型，行为由独立 fixture 证明。

**来源：** `jdk25-removed-apis`、`openjdk-jep403`。

### 错误：资源仍由多个层手工关闭

**现象：** 异常路径泄漏，或关闭异常覆盖原始失败。

**触发条件：** File、stream 和手工 close 分散在多个层。

**原因：** 创建者与 owner 不一致，作用域过宽。

**后果：** 文件句柄泄漏、重复关闭和错误语义漂移。

**错误示例：**
```java
java.io.InputStream input = new java.io.FileInputStream(file);
```

**正确写法：**
```java
try (java.io.InputStream input = Files.newInputStream(path)) { /* use */ }
```

**影响版本：** Java 8 与 Java 25。

**验证方式：** 成功和异常路径断言同一资源恰好关闭一次。

**来源：** `java8-files`。

### 错误：依赖平台默认 charset

**现象：** 同一中文文本在不同主机产生不同 bytes、签名或缓存 key。

**触发条件：** 使用无 charset 的字符串/流转换。

**原因：** Java 8 默认值受环境影响，JDK 18+ 默认又统一为 UTF-8。

**后果：** 数据漂移、验签失败和缓存不命中。

**错误示例：**
```java
byte[] bytes = text.getBytes();
```

**正确写法：**
```java
byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
```

**影响版本：** Java 8 到 Java 25。

**验证方式：** 两个 JDK 对含中文 fixture 比较 bytes、文本和 SHA-256。

**来源：** `java8-charset`、`openjdk-jep400`。

### 错误：机械替换框架插件或重复 endpoint owner

**现象：** 分页 SQL 不同，或同一路径出现重复 WebSocket 注册。

**触发条件：** 只替换类名，未验证精确版本和编程模型。

**原因：** 插件生命周期、容器类型和 owner 合同发生变化。

**后果：** SQL 错误、启动冲突或连接生命周期混乱。

**错误示例：**
```text
rename PaginationInterceptor; register two endpoint models
```

**正确写法：**
```text
目标版本独立编译；分页验证 SQL；endpoint 只保留一个注册 owner。
```

**影响版本：** MyBatis-Plus 与 Spring 5/7 WebSocket。

**验证方式：** 精确依赖 fixture、SQL 断言和真实容器注册计数。

**来源：** `mybatis-plus-pagination`、`spring708-server-endpoint-exporter`、`spring5215-server-endpoint-exporter`。

### 错误：从实现细节猜数据库和配置合同

**现象：** 更换连接池或 URL 形式后方言、时区或绑定失败。

**触发条件：** 强转 DataSource、查 URL 子串、依赖大写开头属性。

**原因：** 把实现类和宽松绑定当成稳定公开协议。

**后果：** 未知组合静默走错分支，迁移结果不可验证。

**错误示例：**
```java
boolean mysql = jdbcUrl.contains("mysql");
```

**正确写法：**
```text
显式 dialect/time-zone 配置，canonical kebab-case，未知值 fail-closed。
```

**影响版本：** 所有数据源与 Spring Boot 配置迁移。

**验证方式：** 更换连接池实现并对缺失、未知值执行负向启动检查。

**来源：** `boot410-external-config`。
:::

:::compare
### 错误写法

```text
编译通过 -> 全局替换 javax -> 添加永久 add-opens -> 直接发布
```

### 正确写法

```text
冻结合同 -> 双基线 -> inventory -> 单变量升级 -> 五类 Gate -> 回滚演练
```
:::

## 安全注意

未知 legacy key、未知方言、缺失依赖证据和未登记内部 API 开口都要 fail-closed。不要用全局字符串替换修改
`javax.crypto` 等 Java SE 安全 API，也不要通过宽泛 `ALL-UNNAMED` 隐藏不明反射访问。迁移日志只记录规则 ID、
版本和摘要，不输出凭据、配置值或业务数据。

## 性能注意

先以同一功能负载证明行为，再用固定 JDK、JVM 参数和时长记录 JFR，观察类加载、异常、分配、线程和 GC。
只有一个明确局部热点问题时才建立 JMH 基准，并记录 CPU、OS、JDK、依赖、warmup、measurement、fork、输入
规模和误差。“Java 25 更快”或“Jakarta 无开销”不属于本课结论。

## 如何验证

1. 从“核心接口与完整示例”提取 `LegacyModernizationExample.java` 到 `/tmp/java-advanced-16-*`。
2. Java 25 用 `javac -Xlint:all -Werror` 编译并运行两次，固定输出一致，class major 为 69。
3. Java 25 再用 `javac --release 8 -Xlint:all,-options -Werror` 编译，class major 为 52；只排除目标版本
   选项提示，其余代码告警仍作为错误。
4. Java 8 用 `javac -source 8 -target 8 -Xlint:all,-options -Werror` 独立编译并运行两次，class major 为 52。
5. 对产物运行 `jdeps --jdk-internals` 与 `jdeprscan --release 8`；静态清洁不替代动态路径和第三方检查。
6. 运行框架精确版本、旧数据回放和回滚演练；本纯 Java fixture 不替代这些 Gate。
7. 成功后用 `find <target> -depth -delete` 清理专属临时目录并检查不存在。

:::exercise
### 练习：设计一次配置合同迁移

**要求：** 旧 key 为 `UserNmae`，新 key 为 `user-name`；给出 legacy/modern 构建矩阵、adapter、未知 key 策略、
五类 Gate 和回滚点。

**验收：** 旧 fixture 能读取，新 writer 只写规范 key；未知 key 阻断；Java 8/25 反馈环分别通过；依赖和行为
证据缺失时不能发布。

**参考答案：** 在配置边界允许冻结旧 key 单向映射，内部只使用 `userName`；观测旧 key 命中率，在兼容窗口后
删除旧读路径。每个版本使用独立 classpath，发布由五项 Gate 的合取结果决定。
:::

## 本节小结

- 五类兼容性互不替代，缺一项就保持 `BLOCKED`。
- Java 8/Boot 2.3 与 Java 25/Boot 4.1 的构建、依赖、namespace 和产物必须隔离。
- Jakarta 迁移只覆盖相应规范包，要同步依赖、容器和测试，不能全局替换所有 `javax`。
- 历史合同通过有限 adapter 单向退出，资源与 charset 使用显式现代边界。
- 分批 Gate、回滚演练和临时例外删除共同构成现代化完成证据。
