---
id: backend.java.learn.advanced.database-sharding-and-sql-boundaries
type: lesson
title: 分片、动态 SQL 与数据访问边界
summary: 用类型化分片键、显式路由结果、参数绑定和受控标识符建立可验证的数据访问边界
domain: backend
technology: java
module: core
stage: advanced
level: advanced
estimatedMinutes: 240
objectives:
  - 能把分片键建模为已校验值，并让路由显式返回 SINGLE、MULTI、BROADCAST 或 REJECT。
  - 能区分单表、广播表、绑定表和跨分片查询，并为 fan-out 与结果合并规定边界。
  - 能坚持普通值使用参数绑定，动态表名、列名和排序方向只来自后端 allowlist。
  - 能说明受控 token parser 或 SQL AST 为什么比正则盲改写可靠。
  - 能按访问用例拆分 Mapper，并说明单数据源事务与跨数据源一致性的差别。
  - 能观测路由、SQL 指纹、参数类型、逐目标结果和合并状态而不泄露敏感数据。
prerequisites:
  - backend.java.learn.intermediate.mybatis-and-mybatis-plus
  - backend.java.learn.advanced.reflection-aop-and-cross-cutting-contracts
related: []
tags:
  - Java
  - MyBatis
  - MyBatis-Plus
  - 数据分片
  - 动态 SQL
  - 参数绑定
  - SQL AST
  - Mapper
  - 路由观测
appliesTo: Java 25 / Spring Boot 4.1.0 / Spring Framework 7.0.8 / MyBatis 3.5.19 / MyBatis-Spring 4.0.0 / MyBatis-Plus 3.5.17 主线；项目补充适用于 Java 8 / Spring Boot 2.3.12.RELEASE / Spring Framework 5.2.15.RELEASE / MyBatis-Plus 3.4.2
modernBaseline:
  java: '25'
  springBoot: 4.1.0
  springFramework: 7.0.8
  mybatis: 3.5.19
  mybatisSpring: 4.0.0
  mybatisPlus: 3.5.17
legacyBaseline:
  java: '8'
  springBoot: 2.3.12.RELEASE
  springFramework: 5.2.15.RELEASE
  mybatis: 3.5.19
  mybatisSpring: 2.1.2
  mybatisPlus: 3.4.2
verifiedAt: 2026-08-11
sources:
  - id: oracle-java-support-roadmap
    title: Oracle Java SE Support Roadmap
    url: https://www.oracle.com/java/technologies/java-se-support-roadmap.html
    sourceType: official-reference
    appliesTo: Java 25
    claims:
      - Oracle 支持路线将 Java 25 列为 LTS
  - id: boot41-system-requirements
    title: Spring Boot System Requirements
    url: https://docs.spring.io/spring-boot/system-requirements.html
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Boot 4.1.0 支持 Java 17 至 26，并要求 Spring Framework 7.0.8 以上
  - id: boot2312-system-requirements
    title: Spring Boot 2.3.12.RELEASE System Requirements
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - 旧线要求 Java 8，最高兼容 Java 15，并要求 Spring Framework 5.2.15.RELEASE 或更高版本
  - id: mybatis319-sqlmap-xml
    title: MyBatis 3 Mapper XML Files
    url: https://mybatis.org/mybatis-3/sqlmap-xml.html
    sourceType: official-reference
    appliesTo: MyBatis 3.5.19
    claims:
      - '#{} 创建 PreparedStatement 参数，${} 执行不转义的原样文本替换'
      - mapped statement 连接 SQL、参数和结果映射合同
  - id: mybatis319-dynamic-sql
    title: MyBatis 3 Dynamic SQL
    url: https://mybatis.org/mybatis-3/dynamic-sql.html
    sourceType: official-reference
    appliesTo: MyBatis 3.5.19
    claims:
      - if、choose、trim、where、set 与 foreach 提供受控动态 SQL 元素
  - id: mybatis319-logging
    title: MyBatis 3 Logging
    url: https://mybatis.org/mybatis-3/logging.html
    sourceType: official-reference
    appliesTo: MyBatis 3.5.19
    claims:
      - 可按 Mapper、namespace 或 statement 配置日志，SQL 与结果使用不同日志级别
  - id: mybatis-spring-boot400-intro
    title: MyBatis-Spring-Boot-Starter Introduction
    url: https://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/index.html
    sourceType: official-reference
    appliesTo: MyBatis-Spring-Boot-Starter 4.0.0
    claims:
      - 4.0 线要求 Spring Boot 4.0 与 Java 17 以上，并自动配置会话和 Mapper
  - id: mybatis-spring-transactions
    title: MyBatis-Spring Transactions
    url: https://mybatis.org/spring/transactions.html
    sourceType: official-reference
    appliesTo: MyBatis-Spring 4.0.0
    claims:
      - 一个 Spring 事务关联一个 SqlSession，受管会话不能由应用手工提交、回滚或关闭
  - id: mybatis-plus3517-release
    title: MyBatis-Plus v3.5.17 Release
    url: https://github.com/baomidou/mybatis-plus/releases/tag/v3.5.17
    sourceType: release-note
    appliesTo: MyBatis-Plus 3.5.17
    claims:
      - v3.5.17 精确发布标签是本课现代 MyBatis-Plus 基线
  - id: mybatis-plus3517-dynamic-table
    title: MyBatis-Plus Dynamic Table Name Plugin
    url: https://baomidou.com/en/plugins/dynamic-table-name/
    sourceType: official-reference
    appliesTo: MyBatis-Plus 3.5.17
    claims:
      - DynamicTableNameInnerInterceptor 按 handler 规则替换表名并要求防止 SQL 注入
  - id: mybatis-plus3517-plugin-core
    title: MyBatis-Plus Plugin Core
    url: https://baomidou.com/en/plugins/
    sourceType: official-reference
    appliesTo: MyBatis-Plus 3.5.17
    claims:
      - JSQLParser 线程池、缓存和版本差异需要显式配置与生命周期管理
  - id: mybatis-plus-security-guidance
    title: MyBatis-Plus Preventing Security Vulnerabilities
    url: https://baomidou.com/en/reference/about-cve/
    sourceType: official-reference
    appliesTo: MyBatis-Plus 3.4.3.2 / 3.5.3.2 / 3.5.17 guidance
    claims:
      - SQL 结构应由后端控制，注入检查不能替代动态标识符 allowlist
  - id: mybatis-plus3517-dynamic-table-source
    title: MyBatis-Plus v3.5.17 DynamicTableNameInnerInterceptor Source
    url: https://github.com/baomidou/mybatis-plus/blob/v3.5.17/mybatis-plus-extension/src/main/java/com/baomidou/mybatisplus/extension/plugins/inner/DynamicTableNameInnerInterceptor.java
    sourceType: source-code
    appliesTo: MyBatis-Plus v3.5.17
    claims:
      - 现代实现使用 TableNameParser 识别表名 token，再把受控表名交给 handler
  - id: mybatis-plus342-dynamic-table-source
    title: MyBatis-Plus v3.4.2 DynamicTableNameInnerInterceptor Source
    url: https://github.com/baomidou/mybatis-plus/blob/v3.4.2/mybatis-plus-extension/src/main/java/com/baomidou/mybatisplus/extension/plugins/inner/DynamicTableNameInnerInterceptor.java
    sourceType: source-code
    appliesTo: MyBatis-Plus v3.4.2
    claims:
      - 旧实现以 Map 登记表名 handler，不能照搬现代 JsqlParserGlobal API
  - id: shardingsphere552-route
    title: Apache ShardingSphere 5.5.2 Route Engine
    url: https://shardingsphere.apache.org/document/5.5.2/en/reference/sharding/route/
    sourceType: official-reference
    appliesTo: ShardingSphere 5.5.2
    claims:
      - 等值键可单路由，IN 与 BETWEEN 可多路由，无键可广播，未绑定表关联可能产生笛卡尔路由
  - id: shardingsphere552-parse
    title: Apache ShardingSphere 5.5.2 Parse Engine
    url: https://shardingsphere.apache.org/document/5.5.2/en/reference/sharding/parse/
    sourceType: official-reference
    appliesTo: ShardingSphere 5.5.2
    claims:
      - 词法结果进入 AST，再由 visitor 提取路由上下文和改写位置
  - id: shardingsphere553-concepts
    title: Apache ShardingSphere 5.5.3 Sharding Core Concept
    url: https://shardingsphere.apache.org/document/5.5.3/en/features/sharding/concept
    sourceType: official-reference
    appliesTo: ShardingSphere 5.5.3
    claims:
      - 逻辑表、实际表、单表、广播表与绑定表具有不同路由合同
  - id: shardingsphere552-properties
    title: Apache ShardingSphere 5.5.2 Properties Configuration
    url: https://shardingsphere.apache.org/document/5.5.2/en/user-manual/common-config/props/
    sourceType: official-reference
    appliesTo: ShardingSphere 5.5.2
    claims:
      - sql-show 可展示逻辑 SQL、实际 SQL 和解析结果，但不证明业务结果正确
  - id: shardingsphere-observability
    title: Apache ShardingSphere Observability
    url: https://shardingsphere.apache.org/document/5.5.2/en/features/observability/
    sourceType: official-reference
    appliesTo: ShardingSphere 5.5.2
    claims:
      - SQL 经历解析、路由、改写、执行和结果合并，并可接入 tracing 与 metrics
  - id: owasp-sql-injection-prevention
    title: OWASP SQL Injection Prevention Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: OWASP living cheat sheet
    claims:
      - 普通值优先使用 Prepared Statements，不能绑定的标识符使用代码侧 allowlist 或重设计
  - id: owasp-database-security
    title: OWASP Database Security Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Database_Security_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: OWASP living cheat sheet
    claims:
      - 数据库账户遵循最小权限，应用路由不能替代数据库访问控制
  - id: owasp-logging
    title: OWASP Logging Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: OWASP living cheat sheet
    claims:
      - 日志应防止敏感信息泄露和日志注入，并限制资源消耗
  - id: shardingsphere552-faq
    title: Apache ShardingSphere 5.5.2 FAQ
    url: https://shardingsphere.apache.org/document/5.5.2/en/faq/
    sourceType: official-reference
    appliesTo: ShardingSphere 5.5.2
    claims:
      - 数据库字段类型与分片算法运行时类型必须一致，并显式处理 JDBC 返回类型差异
  - id: mybatis-spring-requirements
    title: MyBatis-Spring Requirements
    url: https://mybatis.org/spring/
    sourceType: official-reference
    appliesTo: MyBatis-Spring 2.1.2 / 4.0.0
    claims:
      - 4.0 线要求 Spring 7 与 Java 17 以上，2.1 线使用 Spring 5.x 并支持 Java 8
  - id: jsqlparser-usage
    title: JSqlParser Usage
    url: https://jsqlparser.github.io/JSqlParser/usage.html
    sourceType: official-reference
    appliesTo: JSqlParser 4.9 / 5.x
    claims:
      - SQL 可解析为可遍历对象并由 Visitor 访问或修改，4.9 是最后一个 JDK 8 兼容版本
projectEvidence:
  - file: dzzz-app/src/main/java/com/tdh/bdzz/shard/AjbsShardStrategy.java
    symbol: com.tdh.bdzz.shard.AjbsShardStrategy
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/po/AnnotationTypesEntity.java
    symbol: com.tdh.bdzz.po.AnnotationTypesEntity
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/DataSourceConfig.java
    symbol: com.tdh.bdzz.config.DataSourceConfig
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/shard/TableShardInterceptor.java
    symbol: com.tdh.bdzz.shard.TableShardInterceptor
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/po/AnnotationsEntity.java
    symbol: com.tdh.bdzz.po.AnnotationsEntity
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/dao/EajFtsyMapper.java
    symbol: com.tdh.bdzz.dao.EajFtsyMapper
    usage: rejected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/shard/DefaultAutowiredShardData.java
    symbol: com.tdh.bdzz.shard.DefaultAutowiredShardData
    usage: rejected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/DbcpSqlCheckConfig.java
    symbol: com.tdh.bdzz.config.DbcpSqlCheckConfig
    usage: rejected
recap:
  - 分片键先形成已校验值，路由必须显式返回目标集合或拒绝原因。
  - 单表、广播表、绑定表和跨分片查询的执行与合并合同不同。
  - 普通值使用参数绑定，动态标识符只能由后端 allowlist 产生。
  - SQL 改写依赖受控 token parser 或 AST，不能用正则盲改写任意 SQL。
  - Mapper 按用例拆分，单数据源事务不能被描述为自动跨库原子事务。
  - 验证必须覆盖路由、SQL 指纹、参数类型、逐目标结果、部分失败和脱敏日志。
---

# 分片、动态 SQL 与数据访问边界

## 为什么需要学习

一条查询进入分片系统后，先要决定访问哪个数据源和物理表，再生成 SQL、绑定参数、执行并合并结果。
如果分片键来自反射、表名来自请求文本、SQL 由正则替换，任何一层都可能把数据送错位置。真正需要学习的
不是某个插件开关，而是如何让每一步都拥有类型、允许列表、显式结果和可重复验证。

## 学习目标

- 能把原始租户 ID 转换为已校验的 `ShardKey`。
- 能读懂 `SINGLE`、`MULTI`、`BROADCAST`、`REJECT` 路由结果。
- 能为跨分片查询规定 fan-out、排序、分页和部分失败语义。
- 能正确选择 `#{}`、`${}`、动态 SQL 元素和受控 parser。
- 能按数据访问用例拆分 Mapper 和事务 owner。
- 能用脱敏观测记录证明实际路由与结果。

## 前置术语

- **逻辑表：** 业务代码认识的稳定表名，例如 `orders`。
- **物理表：** 路由后真正访问的表，例如 `orders_east`。
- **分片键：** 决定数据目标的已校验业务值。
- **fan-out：** 一次逻辑操作实际拆成的目标执行数量。
- **绑定表：** 使用相同分片规则并用相同分片键关联的一组表。
- **SQL 指纹：** 去除敏感参数后用于关联同类语句的稳定摘要。

## 零基础知识点详解

### 类型化分片键先于 Mapper

**它是什么：** `ShardKey` 是经过类型、范围和租户归属校验的值对象，不是从任意 DTO 反射出的字段。

**有什么作用：** 路由器只接收一种明确输入，字段缺失、字符串数字和错误 JDBC 类型不会静默落到默认分片。

**什么时候使用：** 所有需要按租户、区域、案件或时间分片的读写都应在进入 Mapper 前创建它。

**怎么使用：**

1. 在请求边界读取原始值。
2. 校验类型、范围和当前主体是否有权访问该值。
3. 创建不可变 `ShardKey`，失败时直接返回拒绝结果。

**最小示例：** `new ShardKey(42L)` 表示已校验的租户键；`0` 或负数在构造边界拒绝。

**运行结果：** Mapper 和路由器不再接触未校验字符串，也不需要猜测字段名。

**常见误区：** 以为使用 Java 泛型就足够；JDBC 返回的运行时类型仍要与分片算法输入显式对齐。

### RoutePlan 把路由结果变成合同

**它是什么：** `RoutePlan` 显式返回 `SINGLE`、`MULTI`、`BROADCAST` 或 `REJECT`，并携带目标列表或拒绝原因。

**有什么作用：** 调用方能在执行 SQL 前知道 fan-out 和风险，而不是由隐藏拦截器悄悄选择目标。

**什么时候使用：** 单键、键集合、范围查询、无键管理查询和无法路由的请求都需要它。

**怎么使用：**

1. 单个等值键解析为一个目标。
2. `IN` 或范围键解析为去重后的多个目标。
3. 无键操作只在用例明确允许时返回广播，否则返回拒绝。

**最小示例：** `RoutePlan.single(target)` 与 `RoutePlan.reject("missing shard key")`。

**运行结果：** SQL 只有在计划不是 `REJECT` 时才创建和执行。

**常见误区：** 把缺失分片键自动映射到第一个数据源，造成漏查或跨租户写入。

### 单表不是广播表

**它是什么：** 单表只有一张不分片的实际表；广播表在每个数据源保留相同结构和数据副本。

**有什么作用：** 区分两者才能定义读写次数、同步责任和失败语义。

**什么时候使用：** 小数据量且只有一个权威位置时用单表；每个分片都需要本地小字典时才考虑广播表。

**怎么使用：**

1. 在元数据中明确表类型。
2. 单表只返回一个固定目标。
3. 广播写入返回每个目标的成功或失败，不能只报告一次本地成功。

**最小示例：** `country_code` 可以是广播候选，但 `orders` 通常是分片表而不是广播表。

**运行结果：** 调用方知道实际执行次数，并能检查广播副本是否全部更新。

**常见误区：** 把“每个库里都能看到一张表”直接称为单表，忽略副本一致性责任。

### 绑定表与未绑定表关联

**它是什么：** 绑定表共享分片规则，并通过相同分片键关联；未绑定表不能保证两行落在同一目标。

**有什么作用：** 绑定关系可以把关联限制在同一分片，未绑定关联则可能产生目标笛卡尔组合。

**什么时候使用：** 订单与订单项这类共同按 tenant_id 分片的表可绑定；规则不同的表必须另设查询协议。

**怎么使用：**

1. 比较两表的分片键、算法和目标拓扑。
2. 只有合同一致时允许本地 join。
3. 不一致时拒绝隐式 join，改为显式多阶段读取或离线聚合。

**最小示例：** `orders.tenant_id = order_items.tenant_id` 且两表路由规则一致。

**运行结果：** 每个真实 SQL 只访问同一分片内的两张物理表。

**常见误区：** 只因为逻辑 SQL 能写出 join，就认定分片层能在一个目标执行它。

### 跨分片读需要合并协议

**它是什么：** `MULTI` 查询会对多个目标执行，再按明确规则合并、排序、分页并报告部分失败。

**有什么作用：** 防止把多个独立数据库结果伪装成一个天然原子的结果集。

**什么时候使用：** 管理后台、跨租户报表、范围键和 `IN` 命中多个分片时。

**怎么使用：**

1. 设置最大 fan-out 和每目标超时。
2. 逐目标记录成功、空结果或失败。
3. 使用稳定排序键合并，并在分页前定义全局 limit。

**最小示例：** 两个分片各返回最多 20 行，再按 `created_at, id` 合并取前 20 行。

**运行结果：** 返回值同时包含合并行、逐目标状态和 `partialFailure` 标记。

**常见误区：** 先对每个分片各取一页再直接拼接，得到不稳定且重复的全局分页。

### `#{}` 绑定值，`${}` 替换文本

**它是什么：** `#{}` 生成 PreparedStatement 参数；`${}` 把文本原样放进 SQL 结构。

**有什么作用：** 普通值参数化后不能改变 SQL 语法，类型也由 JDBC 绑定。

**什么时候使用：** 租户、ID、状态和时间范围全部用 `#{}`；`${}` 只用于已经过后端 allowlist 的标识符。

**怎么使用：**

1. WHERE、VALUES、SET 和 `foreach` 元素统一使用 `#{}`。
2. 表名、列名和排序方向先映射为受控值。
3. 用恶意文本做负向测试，确认 SQL 结构不变。

**最小示例：** `WHERE tenant_id = #{tenantId}`。

**运行结果：** 输入 `1 OR 1=1` 仍只是一个参数值，不会扩展查询范围。

**常见误区：** 为了动态表名方便，把租户 ID 也写进 `${tenantId}`。

### 动态标识符必须来自 allowlist

**它是什么：** allowlist 把内部枚举或稳定 key 映射成固定表名、列名或排序方向。

**有什么作用：** 动态 SQL 只能选择系统预先登记的结构，外部文本不能成为最终标识符。

**什么时候使用：** 物理表、可排序列、聚合字段和数据库方言关键字无法参数绑定时。

**怎么使用：**

1. 请求只提交业务 key，例如 `CREATED_AT`。
2. 后端映射为固定的 `created_at`。
3. 未登记 key 直接拒绝，不使用字符串清洗后继续执行。

**最小示例：** `Map<SortKey, String>` 只保存 `CREATED_AT -> created_at`。

**运行结果：** `created_at desc; drop table orders` 找不到映射，因此不会创建 SQL。

**常见误区：** 用正则限制为字母数字就称为安全；合法字符仍可能组成越权列名或关键字。

### MyBatis 动态 SQL 只组合已知结构

**它是什么：** `if`、`choose`、`where`、`set` 与 `foreach` 根据参数状态组合预先写好的 SQL 片段。

**有什么作用：** 可选条件仍使用参数绑定，也避免手工处理多余 `AND`、逗号和空语句。

**什么时候使用：** 条件集合有限且所有 SQL 分支都能在 Mapper 中审查时。

**怎么使用：**

1. 用 `<where>` 包住可选 `if`。
2. 互斥结构用 `<choose>`。
3. `foreach` 只展开占位符并限制集合大小。

**最小示例：** `<if test="status != null">AND status = #{status}</if>`。

**运行结果：** status 缺失时条件不出现，存在时仍是一个 JDBC 参数。

**常见误区：** 把动态 SQL 理解为“可以接收一整段外部 SQL”。

### 受控 parser 和 AST 识别 SQL 位置

**它是什么：** parser 先把 SQL 转换为 token 或 AST，再由 visitor 识别表、别名、子查询和待改写位置。

**有什么作用：** 改写目标由语法位置决定，不会误改字符串常量、注释或同名列。

**什么时候使用：** 必须处理别名、join、子查询或数据库方言的结构改写时。

**怎么使用：**

1. 用固定版本 parser 解析受支持的 SQL 方言。
2. 只修改已识别的表标识符节点。
3. 重新渲染后断言参数数量、别名和 SQL 指纹。

**最小示例：** visitor 将 `FROM orders o` 的表节点替换为 allowlist 返回的 `orders_east`。

**运行结果：** `WHERE note = 'orders'` 中的字符串保持不变。

**常见误区：** 用 `replace("orders", "orders_east")` 处理所有 SQL 文本。

### MyBatis-Plus 动态表 handler 仍需受控输入

**它是什么：** `DynamicTableNameInnerInterceptor` 识别逻辑表，再让 handler 返回物理表名。

**有什么作用：** 它提供清晰扩展 seam，但不会自动证明 handler 返回值安全或路由正确。

**什么时候使用：** 单体 MyBatis-Plus 应用需要按内部路由计划选择物理表，并且 SQL 在插件支持范围内时。

**怎么使用：**

1. 使用具有明确前缀的逻辑表名。
2. handler 只读取内部 `RoutePlan`。
3. 返回值必须来自固定 `TableCatalog`，未知目标抛出异常。

**最小示例：** `tableCatalog.ordersFor(shardId).value()`。

**运行结果：** 插件只会得到 `orders_east` 或 `orders_west` 等登记值。

**常见误区：** 把官方随机后缀演示直接当作生产路由算法。

### Mapper 按访问用例拆分

**它是什么：** 一个 Mapper 聚焦一个聚合或访问用例，并拥有稳定的参数、statementId 和 resultMap。

**有什么作用：** 查询投影、事务 owner 和分片要求可以独立验证，不会藏在“任意 SQL”方法里。

**什么时候使用：** 单分片订单、广播字典和跨分片管理查询拥有不同执行合同时。

**怎么使用：**

1. `OrderShardMapper` 只接收已路由的单分片请求。
2. `DictionaryMapper` 只处理受控广播表读取。
3. `OrderCrossShardQuery` 在服务层执行多个单分片 Mapper 并合并结果。

**最小示例：** `findRecent(PhysicalTable table, ShardKey key, int limit)`。

**运行结果：** 每个 statement 的 SQL、参数和结果模型都能单独测试。

**常见误区：** 创建 `executeSql(String sql)`，让业务层自由传表名、列名和投影。

### statementId 与结果映射同样是边界

**它是什么：** statementId 唯一定位 SQL，resultMap 则定义每一列如何进入 Java 结果对象。

**有什么作用：** 路由正确但投影错误仍会返回错误数据，因此执行合同不能只验证表名。

**什么时候使用：** 每个 Mapper 方法和每种跨分片投影都必须核对。

**怎么使用：**

1. 固定 namespace 与方法名。
2. 显式列出查询列和 resultMap。
3. 对 null、别名、重复列名和跨分片排序键写最小验证。

**最小示例：** `OrderSummaryMapper.findRecent` 只返回 `id、tenant_id、created_at`。

**运行结果：** 所有分片返回相同列合同，合并器不依赖 `SELECT *`。

**常见误区：** 认为只要 SQL 能执行，所有物理表的列顺序和类型就一定一致。

### 单数据源事务不是跨分片原子事务

**它是什么：** MyBatis-Spring 将一个事务关联到一个受管 `SqlSession`，通常对应一个数据源连接边界。

**有什么作用：** 明确本地提交、跨数据源协调和补偿流程是不同能力。

**什么时候使用：** 一次用例可能访问多个数据源或广播写入时必须先判断。

**怎么使用：**

1. 单分片写入在明确的数据源事务内完成。
2. 多分片写入选择分布式事务、幂等补偿或最终一致性协议。
3. 返回逐目标状态，不能只依赖外层 `@Transactional` 注解。

**最小示例：** 两个数据源各自提交不等于一次数据库原子提交。

**运行结果：** 部分失败可被识别、重试或补偿，而不是被误报为全部成功。

**常见误区：** 看到 Service 上有 `@Transactional` 就宣称所有分片会一起回滚。

### 路由、SQL、参数和结果要能关联

**它是什么：** 一次访问用 traceId 串起 RoutePlan、SQL 指纹、参数类型、逐目标执行和合并结果。

**有什么作用：** 能回答“为什么访问这些表、每个目标发生什么、最终结果是否完整”。

**什么时候使用：** 线上诊断、迁移验证、跨分片查询和任何动态表改写都需要。

**怎么使用：**

1. 路由阶段记录类型、目标和 fan-out。
2. SQL 阶段记录 statementId、逻辑/物理表和指纹。
3. 执行阶段记录每目标耗时、行数、错误码和合并状态。

**最小示例：** `trace-7 / MULTI / 2 targets / 2 rows / partial=false`。

**运行结果：** 单次查询的每个阶段能被同一 traceId 检索，同时参数值保持脱敏。

**常见误区：** 只打开完整 SQL 和 TRACE 结果日志，把敏感值当作观测能力。

### Java 8 与现代插件 API 必须隔离

**它是什么：** Java 25/Boot 4.1.0/MyBatis-Spring 4.0.0 与
Java 8/Boot 2.3.12.RELEASE/MyBatis-Spring 2.1.2 是两条独立依赖线。

**有什么作用：** 防止现代类、JDK 要求和 parser API 被复制到旧项目后才在编译或启动阶段失败。

**什么时候使用：** 维护冻结旧项目、升级 MyBatis-Plus 或引入 SQL parser 时。

**怎么使用：**

1. 为 modern 和 legacy 创建独立 Maven fixture。
2. 旧线只调用 3.4.2 中存在的 handler 和 `TableNameParser` 合同。
3. JSqlParser 在 Java 8 只能选择其兼容版本并单独验证方言。

**最小示例：** legacy 不导入 3.5.11 才公开的 `JsqlParserGlobal`。

**运行结果：** 两条线分别编译，失败时能定位为依赖/API 差异而不是业务路由问题。

**常见误区：** 在 Java 25 编译成功后就声称同一源码兼容 Java 8。

## 现代版本中的正确用法

现代主线把路由放在 Mapper 之前：请求先得到 `ShardKey`，路由器生成 `RoutePlan`，表目录把内部目标映射为
allowlist 中的 `PhysicalTable`，Mapper 再使用参数绑定执行固定 statement。SQL 解析器只负责识别结构位置，
不负责授权表名；跨分片服务暴露逐目标结果和合并状态，不把 fan-out 隐藏在一个返回列表里。

## 核心接口与完整示例

下面的完整示例只用 Java 8 与 Java 25 共有的标准库，便于两条线运行同一个行为反馈环。它模拟路由、
allowlist、参数计划、逐目标执行和部分失败；真正数据库调用仍由精确版本的 MyBatis fixture 负责验证。

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class ShardBoundaryExample {
    enum RouteKind { SINGLE, MULTI, BROADCAST, REJECT }
    enum ShardId { EAST, WEST }

    static final class ShardKey {
        private final long tenantId;

        /** 创建已经通过范围校验的分片键。 */
        ShardKey(long tenantId) {
            if (tenantId <= 0) throw new IllegalArgumentException("tenantId must be positive");
            this.tenantId = tenantId;
        }

        /** 返回租户分片值。 */
        long tenantId() {
            return tenantId;
        }
    }

    static final class PhysicalTable {
        private final String value;

        /** 创建只由表目录调用的物理表名。 */
        PhysicalTable(String value) {
            this.value = value;
        }

        /** 返回已经登记的 SQL 标识符。 */
        String value() {
            return value;
        }
    }

    static final class ShardTarget {
        private final ShardId shardId;
        private final PhysicalTable table;

        /** 创建一个数据源与物理表目标。 */
        ShardTarget(ShardId shardId, PhysicalTable table) {
            this.shardId = shardId;
            this.table = table;
        }

        /** 返回数据源标识。 */
        ShardId shardId() {
            return shardId;
        }

        /** 返回物理表。 */
        PhysicalTable table() {
            return table;
        }
    }

    static final class RoutePlan {
        private final RouteKind kind;
        private final List<ShardTarget> targets;
        private final Map<ShardId, List<ShardKey>> keysByShard;
        private final String reason;

        /** 创建不可变路由结果。 */
        RoutePlan(
            RouteKind kind,
            List<ShardTarget> targets,
            Map<ShardId, List<ShardKey>> keysByShard,
            String reason
        ) {
            this.kind = kind;
            this.targets = Collections.unmodifiableList(new ArrayList<ShardTarget>(targets));
            Map<ShardId, List<ShardKey>> copiedKeys = new EnumMap<ShardId, List<ShardKey>>(ShardId.class);
            for (Map.Entry<ShardId, List<ShardKey>> entry : keysByShard.entrySet()) {
                copiedKeys.put(
                    entry.getKey(),
                    Collections.unmodifiableList(new ArrayList<ShardKey>(entry.getValue()))
                );
            }
            this.keysByShard = Collections.unmodifiableMap(copiedKeys);
            this.reason = reason;
        }

        /** 返回单目标计划。 */
        static RoutePlan single(ShardTarget target, List<ShardKey> keys) {
            Map<ShardId, List<ShardKey>> keysByShard = new EnumMap<ShardId, List<ShardKey>>(ShardId.class);
            keysByShard.put(target.shardId(), keys);
            return new RoutePlan(RouteKind.SINGLE, Collections.singletonList(target), keysByShard, "");
        }

        /** 返回多目标计划。 */
        static RoutePlan multi(List<ShardTarget> targets, Map<ShardId, List<ShardKey>> keysByShard) {
            return new RoutePlan(RouteKind.MULTI, targets, keysByShard, "");
        }

        /** 返回显式授权的广播计划。 */
        static RoutePlan broadcast(List<ShardTarget> targets) {
            return new RoutePlan(
                RouteKind.BROADCAST,
                targets,
                Collections.<ShardId, List<ShardKey>>emptyMap(),
                ""
            );
        }

        /** 返回拒绝计划。 */
        static RoutePlan reject(String reason) {
            return new RoutePlan(
                RouteKind.REJECT,
                Collections.<ShardTarget>emptyList(),
                Collections.<ShardId, List<ShardKey>>emptyMap(),
                reason
            );
        }

        /** 返回路由类型。 */
        RouteKind kind() {
            return kind;
        }

        /** 返回不可变目标列表。 */
        List<ShardTarget> targets() {
            return targets;
        }

        /** 返回一个目标对应的全部分片键。 */
        List<ShardKey> keysFor(ShardTarget target) {
            List<ShardKey> keys = keysByShard.get(target.shardId());
            return keys == null ? Collections.<ShardKey>emptyList() : keys;
        }

        /** 返回拒绝原因。 */
        String reason() {
            return reason;
        }
    }

    static final class TableCatalog {
        private final Map<ShardId, PhysicalTable> orders = new EnumMap<ShardId, PhysicalTable>(ShardId.class);

        /** 创建固定物理表目录。 */
        TableCatalog() {
            orders.put(ShardId.EAST, new PhysicalTable("orders_east"));
            orders.put(ShardId.WEST, new PhysicalTable("orders_west"));
        }

        /** 返回指定分片的订单表。 */
        PhysicalTable ordersFor(ShardId shardId) {
            PhysicalTable table = orders.get(shardId);
            if (table == null) throw new IllegalArgumentException("unknown shard");
            return table;
        }

        /** 返回全部订单分片目标。 */
        List<ShardTarget> allOrderTargets() {
            List<ShardTarget> targets = new ArrayList<ShardTarget>();
            for (ShardId shardId : ShardId.values()) {
                targets.add(new ShardTarget(shardId, ordersFor(shardId)));
            }
            return Collections.unmodifiableList(targets);
        }

        /** 检查外部文本是否恰好是登记表名。 */
        boolean containsExternalName(String value) {
            for (PhysicalTable table : orders.values()) {
                if (table.value().equals(value)) return true;
            }
            return false;
        }
    }

    static final class Router {
        private final TableCatalog catalog;

        /** 创建使用固定表目录的路由器。 */
        Router(TableCatalog catalog) {
            this.catalog = catalog;
        }

        /** 把单个分片键路由到一个目标。 */
        RoutePlan route(ShardKey key) {
            ShardId id = key.tenantId() % 2 == 0 ? ShardId.EAST : ShardId.WEST;
            return RoutePlan.single(
                new ShardTarget(id, catalog.ordersFor(id)),
                Collections.singletonList(key)
            );
        }

        /** 把多个分片键按目标分组，保留每个键与目标的对应关系。 */
        RoutePlan routeAll(List<ShardKey> keys) {
            if (keys.isEmpty()) return RoutePlan.reject("missing shard key");
            Map<ShardId, List<ShardKey>> keysByShard =
                new LinkedHashMap<ShardId, List<ShardKey>>();
            for (ShardKey key : keys) {
                ShardId shardId = route(key).targets().get(0).shardId();
                List<ShardKey> groupedKeys = keysByShard.get(shardId);
                if (groupedKeys == null) {
                    groupedKeys = new ArrayList<ShardKey>();
                    keysByShard.put(shardId, groupedKeys);
                }
                groupedKeys.add(key);
            }
            List<ShardTarget> targets = new ArrayList<ShardTarget>();
            for (ShardId id : keysByShard.keySet()) {
                targets.add(new ShardTarget(id, catalog.ordersFor(id)));
            }
            return targets.size() == 1
                ? RoutePlan.single(targets.get(0), keysByShard.get(targets.get(0).shardId()))
                : RoutePlan.multi(targets, keysByShard);
        }

        /** 仅在调用方明确授权时返回广播计划。 */
        RoutePlan broadcast(boolean allowed) {
            return allowed
                ? RoutePlan.broadcast(catalog.allOrderTargets())
                : RoutePlan.reject("broadcast not allowed");
        }
    }

    static final class SqlPlan {
        private final String statementId;
        private final String sql;
        private final Map<String, Object> parameters;

        /** 创建 SQL 结构与绑定参数计划。 */
        SqlPlan(String statementId, String sql, Map<String, Object> parameters) {
            this.statementId = statementId;
            this.sql = sql;
            this.parameters = Collections.unmodifiableMap(new LinkedHashMap<String, Object>(parameters));
        }

        /** 为受控物理表创建参数化查询。 */
        static SqlPlan recentOrders(ShardTarget target, ShardKey key, String status) {
            Map<String, Object> values = new LinkedHashMap<String, Object>();
            values.put("tenantId", Long.valueOf(key.tenantId()));
            values.put("status", status);
            String sql = "select id, tenant_id, status from " + target.table().value()
                + " where tenant_id = #{tenantId} and status = #{status}";
            return new SqlPlan("OrderShardMapper.findRecent", sql, values);
        }

        /** 为受控物理表创建不带租户条件的广播查询。 */
        static SqlPlan paidOrders(ShardTarget target, String status) {
            Map<String, Object> values = new LinkedHashMap<String, Object>();
            values.put("status", status);
            String sql = "select id, tenant_id, status from " + target.table().value()
                + " where status = #{status}";
            return new SqlPlan("OrderShardMapper.findPaidAcrossShard", sql, values);
        }

        /** 返回 statementId。 */
        String statementId() {
            return statementId;
        }

        /** 返回仍含参数占位符的 SQL。 */
        String sql() {
            return sql;
        }

        /** 返回绑定参数副本。 */
        Map<String, Object> parameters() {
            return parameters;
        }
    }

    interface TargetExecutor {
        /** 执行一个已路由目标并返回行标识。 */
        List<String> execute(ShardTarget target, SqlPlan plan);
    }

    static final class TargetResult {
        private final ShardId shardId;
        private final boolean success;
        private final int rowCount;
        private final String failureReason;

        /** 创建逐目标结果。 */
        TargetResult(ShardId shardId, boolean success, int rowCount, String failureReason) {
            this.shardId = shardId;
            this.success = success;
            this.rowCount = rowCount;
            this.failureReason = failureReason;
        }
    }

    static final class QueryResult {
        private final List<String> rows;
        private final List<TargetResult> targets;
        private final boolean partialFailure;

        /** 创建合并查询结果。 */
        QueryResult(List<String> rows, List<TargetResult> targets, boolean partialFailure) {
            this.rows = Collections.unmodifiableList(new ArrayList<String>(rows));
            this.targets = Collections.unmodifiableList(new ArrayList<TargetResult>(targets));
            this.partialFailure = partialFailure;
        }
    }

    static final class CrossShardQuery {
        /** 执行显式目标列表并保留逐目标状态。 */
        QueryResult execute(RoutePlan route, TargetExecutor executor) {
            if (route.kind() == RouteKind.REJECT) throw new IllegalArgumentException(route.reason());
            List<String> rows = new ArrayList<String>();
            List<TargetResult> targetResults = new ArrayList<TargetResult>();
            boolean partial = false;
            for (ShardTarget target : route.targets()) {
                try {
                    int rowCount = 0;
                    if (route.kind() == RouteKind.BROADCAST) {
                        List<String> targetRows = executor.execute(
                            target,
                            SqlPlan.paidOrders(target, "PAID")
                        );
                        rows.addAll(targetRows);
                        rowCount += targetRows.size();
                    } else {
                        for (ShardKey key : route.keysFor(target)) {
                            List<String> targetRows = executor.execute(
                                target,
                                SqlPlan.recentOrders(target, key, "PAID")
                            );
                            rows.addAll(targetRows);
                            rowCount += targetRows.size();
                        }
                    }
                    targetResults.add(new TargetResult(target.shardId(), true, rowCount, ""));
                } catch (RuntimeException failure) {
                    partial = true;
                    targetResults.add(
                        new TargetResult(target.shardId(), false, 0, failure.getMessage())
                    );
                }
            }
            Collections.sort(rows);
            return new QueryResult(rows, targetResults, partial);
        }
    }

    /** 运行可观察的路由、绑定和部分失败反馈环。 */
    public static void main(String[] args) {
        TableCatalog catalog = new TableCatalog();
        Router router = new Router(catalog);
        ShardKey eastKey = new ShardKey(42L);
        RoutePlan single = router.route(eastKey);
        RoutePlan multi = router.routeAll(java.util.Arrays.asList(eastKey, new ShardKey(43L)));
        RoutePlan sameTarget = router.routeAll(
            java.util.Arrays.asList(eastKey, new ShardKey(44L))
        );
        RoutePlan broadcast = router.broadcast(true);
        RoutePlan rejected = router.routeAll(Collections.<ShardKey>emptyList());
        RoutePlan rejectedBroadcast = router.broadcast(false);
        SqlPlan sql = SqlPlan.recentOrders(single.targets().get(0), eastKey, "PAID");

        final Map<ShardId, Long> observedKeys = new EnumMap<ShardId, Long>(ShardId.class);
        final int[] broadcastExecutions = { 0 };
        TargetExecutor executor = new TargetExecutor() {
            /** 记录实际绑定值，并模拟 WEST 目标超时。 */
            public List<String> execute(ShardTarget target, SqlPlan plan) {
                if (plan.parameters().containsKey("tenantId")) {
                    observedKeys.put(target.shardId(), (Long) plan.parameters().get("tenantId"));
                } else {
                    broadcastExecutions[0]++;
                }
                if (target.shardId() == ShardId.WEST) throw new IllegalStateException("timeout");
                return Collections.singletonList(target.shardId().name());
            }
        };
        QueryResult result = new CrossShardQuery().execute(multi, executor);
        QueryResult broadcastResult = new CrossShardQuery().execute(broadcast, executor);

        boolean bound = sql.sql().contains("#{tenantId}")
            && sql.parameters().size() == 2
            && !sql.sql().contains("42");
        boolean keysBound = Long.valueOf(42L).equals(observedKeys.get(ShardId.EAST))
            && Long.valueOf(43L).equals(observedKeys.get(ShardId.WEST));
        boolean timeoutObserved = "timeout".equals(result.targets.get(1).failureReason);
        boolean allowlistRejected = !catalog.containsExternalName("orders_east; drop table orders");
        if (single.kind() != RouteKind.SINGLE || multi.targets().size() != 2
            || sameTarget.kind() != RouteKind.SINGLE || sameTarget.keysFor(sameTarget.targets().get(0)).size() != 2
            || broadcast.kind() != RouteKind.BROADCAST || broadcast.targets().size() != 2
            || rejected.kind() != RouteKind.REJECT || rejectedBroadcast.kind() != RouteKind.REJECT
            || !bound || !keysBound || !timeoutObserved || !allowlistRejected
            || !result.partialFailure || result.targets.size() != 2 || result.rows.size() != 1
            || !broadcastResult.partialFailure || broadcastResult.targets.size() != 2
            || broadcastExecutions[0] != 2) {
            throw new AssertionError("shard boundary verification failed");
        }
        System.out.println("SHARD_BOUNDARY_PASS single=" + single.targets().get(0).shardId()
            + " multi=" + multi.targets().size() + " broadcast=" + broadcast.targets().size()
            + " rejected=true keysBound=true bound=true partial=true timeoutObserved=true");
    }
}
```

运行结果：

```text
SHARD_BOUNDARY_PASS single=EAST multi=2 broadcast=2 rejected=true keysBound=true bound=true partial=true timeoutObserved=true
```

Mapper XML 只把已经由 `TableCatalog` 生成的 `physicalTable` 放入结构位置，普通值仍用参数绑定：

```xml
<select id="findRecent" resultMap="orderSummaryResult">
  SELECT id, tenant_id, status, created_at
  FROM ${physicalTable}
  <where>
    tenant_id = #{tenantId}
    <if test="status != null">
      AND status = #{status}
    </if>
  </where>
  ORDER BY created_at DESC, id DESC
  LIMIT #{limit}
</select>
```

`${physicalTable}` 不是对外参数。Mapper 调用前必须持有内部 `PhysicalTable` 值；若团队无法保证这条链，
就应改为多个固定 statement，而不是继续使用文本替换。

## 从零跟着做

1. 在 `/tmp` 创建独立反馈目录，并把完整示例提取为 `ShardBoundaryExample.java`。
2. 使用 Java 25 容器连续编译、运行两次，核对输出中的单路由、多路由、拒绝、绑定和部分失败。
3. 使用 Java 8 容器对同一行为示例连续运行两次，证明共同代码没有误用现代语法。
4. 创建 modern Maven fixture，固定 MyBatis 3.5.19、MyBatis-Spring 4.0.0 与 MyBatis-Plus 3.5.17。
5. 创建 legacy Maven fixture，固定 Java 8、MyBatis 3.5.19、MyBatis-Spring 2.1.2 与 MyBatis-Plus 3.4.2。
6. 在两条线验证动态表 parser/handler 可编译，并对未知表名、字符串常量和参数数量做负向检查。
7. 删除临时目录并检查路径不存在；仓库内不保留测试、Maven 缓存副本或浏览器输出。

## 如何使用

1. 在 Controller 或消息入口把原始值转换为已校验 `ShardKey`。
2. 由用例服务请求 `RoutePlan`，在 fan-out 超限或键缺失时提前拒绝。
3. 通过 `TableCatalog` 将每个目标映射为固定 `PhysicalTable`。
4. 调用职责单一的 Mapper，普通值全部参数绑定。
5. 记录逐目标结果，按已声明顺序合并，并把部分失败返回给上层策略。

## 适用与不适用场景

适用于已经存在多数据源、分表或动态标识符需求，并且团队愿意把路由和结果变成显式合同时。不适用于
数据量尚小却仅为“将来可能扩展”提前分片，也不适合用应用层拼接替代数据库权限、索引和事务设计。

:::tip
先测量单表容量、查询模式和迁移成本，再决定是否分片。即使已经分片，也优先让业务请求携带等值分片键，
因为它最容易产生可验证的单目标计划。
:::

## 当前项目补充

冻结矩阵显示项目存在 `AjbsShardStrategy`、`DataSourceConfig`、`TableShardInterceptor` 与持久化实体，因此本课
优先讲路由和数据访问边界；这些类名只能证明候选能力存在，不能证明真实路由正确。`EajFtsyMapper`、
`DefaultAutowiredShardData`、`DbcpSqlCheckConfig` 仅作为职责过载、反射分片键和 SQL 改写风险，统一标记为
`rejected`，不复制其实现，也不据此声称当前项目仍有缺陷。

## Java 8 / Spring Boot 2.3 兼容写法

旧线保留 `ShardKey`、`RoutePlan`、allowlist 和参数绑定这些共同合同，但依赖必须单独冻结。MyBatis-Spring
4.0.0 要求 Java 17 与 Spring 7，不能放进 Java 8/Framework 5.2；MyBatis-Plus 3.4.2 动态表拦截器使用旧版
Map handler API，也不能调用 3.5.11 的 `JsqlParserGlobal`。若引入 JSqlParser，Java 8 线最多使用其兼容版本并
独立验证方言，不允许用 Java 25 的编译结果代替。

## 新旧版本差异

| 对比项 | Java 25 现代线 | Java 8 项目线 | 迁移注意 |
| --- | --- | --- | --- |
| Spring / MyBatis | Boot 4.1.0、Framework 7.0.8、MyBatis 3.5.19、MyBatis-Spring 4.0.0 | Boot 2.3.12.RELEASE、Framework 5.2.15.RELEASE、MyBatis 3.5.19、MyBatis-Spring 2.1.2 | 依赖与 JDK 分开编译 |
| MyBatis-Plus | 3.5.17 | 3.4.2 | handler、parser 与插件 API 不交叉复制 |
| JSqlParser | 5.x 可用 Java 11+ 线 | 4.9 是最后一个 JDK 8 兼容版本 | 精确版本与方言必须验证 |
| 路由模型 | 可用 record，但本课行为示例保持普通类 | 使用普通 final 类 | 类型合同保持一致 |
| 事务 | 单受管 SqlSession 边界 | 同一原则 | 两线都不自动获得跨库原子性 |

## 易错点

:::pitfalls
### 错误：反射缺失键后静默走默认分片

**现象：** 缺失字段的请求仍执行成功，但数据落到错误库表。

**触发条件：** 拦截器按字符串字段名反射取值，并在 null 或类型不符时使用默认值。

**原因：** 分片键没有形成类型化入口合同。

**后果：** 漏查、越权访问或跨租户写入。

**错误示例：**

```java
getField(dto, "tenantId") == null ? 0 : value
```

**正确写法：**

```java
new ShardKey(tenantId)
```

**影响版本：** 所有 Java、MyBatis 与分片实现。

**验证方式：** 测试缺失、字符串、溢出和错误租户，断言 SQL 执行次数为 0。

**来源：** `JAVA-RISK-038`、ShardingSphere FAQ。

### 错误：把 MULTI 当作 SINGLE

**现象：** `IN` 或范围查询只返回一个分片的数据。

**触发条件：** 路由器只读取第一个键，或调用方忽略目标列表。

**原因：** fan-out 未进入公开返回合同。

**后果：** 结果不完整且通常不会抛异常。

**错误示例：**

```java
return route(keys.get(0));
```

**正确写法：**

```java
return routeAll(keys);
```

**影响版本：** 所有分片方案。

**验证方式：** 使用分别落在 EAST/WEST 的两个键，断言目标数为 2。

**来源：** ShardingSphere Route Engine。

### 错误：无键查询自动选择一个库

**现象：** 管理查询稳定返回部分数据，却被当作全局结果。

**触发条件：** 缺少分片键时使用第一个数据源。

**原因：** 没有区分允许广播和必须拒绝的用例。

**后果：** 报表、审计和批处理漏数。

**错误示例：**

```java
targets.isEmpty() ? defaultShard : targets.get(0)
```

**正确写法：**

```java
return allowBroadcast ? broadcastPlan() : RoutePlan.reject("missing shard key");
```

**影响版本：** 所有分片方案。

**验证方式：** 无键普通查询断言 0 次 SQL；授权广播断言完整目标列表。

**来源：** ShardingSphere Route Engine。

### 错误：未绑定表 join 隐式全组合

**现象：** 一条逻辑 join 产生大量实际 SQL，延迟和连接占用突然升高。

**触发条件：** 两表分片规则不同，却允许分片层自动组合目标。

**原因：** 没有验证绑定关系与关联键。

**后果：** 笛卡尔路由、部分结果或资源耗尽。

**错误示例：**

```java
executeCrossShardJoin(leftTable, rightTable)
```

**正确写法：**

```java
bindingCatalog.requireLocalJoin(leftTable, rightTable);
```

**影响版本：** 所有分片方案。

**验证方式：** 断言未绑定关联不产生 SQL，或 fan-out 在上限内并显式返回。

**来源：** ShardingSphere Route Engine、Sharding Core Concept。

### 错误：把普通值放进 `${}`

**现象：** 输入能改变 WHERE、排序甚至附加语句。

**触发条件：** 使用 `${tenantId}`、`${status}` 或 `${sort}` 接收请求文本。

**原因：** `${}` 是原样文本替换，不是参数绑定。

**后果：** SQL 注入、越权查询和数据破坏。

**错误示例：**

```java
"WHERE tenant_id = ${tenantId}"
```

**正确写法：**

```java
"WHERE tenant_id = #{tenantId}"
```

**影响版本：** 所有 MyBatis 版本。

**验证方式：** 输入 `1 OR 1=1`，断言 SQL 指纹与参数数量不变。

**来源：** MyBatis Mapper XML、OWASP SQL Injection Prevention。

### 错误：正则替换表名

**现象：** 字符串常量、别名、注释或子查询中的同名文本也被改写。

**触发条件：** 对完整 SQL 使用 `replace` 或正则查找逻辑表名。

**原因：** 正则不知道 SQL 语法位置。

**后果：** 语义改变、语法错误、参数错位或访问错误表。

**错误示例：**

```java
sql.replaceAll("orders", "orders_east")
```

**正确写法：**

```java
tableParser.rewriteTable(sql, tableCatalog.ordersFor(shardId));
```

**影响版本：** 所有数据库和框架版本。

**验证方式：** SQL 同时包含表、别名、注释和 `'orders'` 字符串，断言只改表节点。

**来源：** ShardingSphere Parse Engine、JSqlParser Usage、`JAVA-RISK-039`。

### 错误：把现代 parser API 复制到 Java 8

**现象：** 旧项目在编译或启动时找不到类或方法。

**触发条件：** Java 8/MP 3.4.2 引入 `JsqlParserGlobal` 或 JSqlParser 5.x。

**原因：** 忽略了 JDK 与插件 API 的版本线。

**后果：** 构建失败，或为了绕过失败混入不受支持依赖。

**错误示例：**

```java
JsqlParserGlobal.setExecutorService(executor);
```

**正确写法：**

```java
new DynamicTableNameInnerInterceptor(tableNameHandlers)
```

**影响版本：** Java 8、MyBatis-Plus 3.4.2、JSqlParser 4.9/5.x 边界。

**验证方式：** 两个 Maven fixture 分别用 Java 25 与 Java 8 连续编译两次。

**来源：** MP Plugin Core、MP 3.4.2 Source、JSqlParser Usage。

### 错误：一个 Mapper 接受任意 SQL

**现象：** statement、投影、权限和事务 owner 无法独立说明。

**触发条件：** 用 `executeSql(String)` 或超大 Mapper 承载无关用例。

**原因：** 数据访问合同被压缩为一个字符串参数。

**后果：** 审查困难、结果映射漂移和越权结构进入数据库。

**错误示例：**

```java
/** 执行任意 SQL 并返回弱类型结果。 */
List<Map<String, Object>> query(String sql);
```

**正确写法：**

```java
/** 按固定查询合同返回订单摘要。 */
List<OrderSummary> findRecent(OrderShardQuery query);
```

**影响版本：** 所有 MyBatis 版本。

**验证方式：** 每个用例独立核对 namespace、statementId、参数对象和返回模型。

**来源：** MyBatis Mapper XML、`JAVA-RISK-003`。

### 错误：把 `@Transactional` 当作跨库原子性

**现象：** 第一个分片已提交，第二个失败，上层仍假设全部回滚。

**触发条件：** 一个方法访问多个数据源，却只有普通单数据源事务管理器。

**原因：** MyBatis-Spring 的受管 SqlSession 合同被扩大成分布式事务声明。

**后果：** 部分写入、重复重试和数据不一致。

**错误示例：**

```java
writeEveryShard(command);
```

**正确写法：**

```java
return writeWithTargetResults(command);
```

**影响版本：** 所有 Spring/MyBatis 组合。

**验证方式：** 注入第二目标失败，确认第一目标状态、补偿记录和最终结果可见。

**来源：** MyBatis-Spring Transactions。

### 错误：把完整 SQL、参数和结果写入日志

**现象：** 日志中出现 token、个人数据、完整租户键或大结果集。

**触发条件：** 生产环境长期开启 TRACE，或直接拼接用户输入到日志。

**原因：** 把调试输出等同于可观测合同。

**后果：** 敏感信息泄露、日志注入和存储资源耗尽。

**错误示例：**

```java
log.info("sql={} params={} rows={}", sql, params, rows);
```

**正确写法：**

```java
log.info("traceId={} statementId={} fingerprint={} rowCount={}",
    traceId, statementId, fingerprint, rowCount);
```

**影响版本：** 所有应用。

**验证方式：** 用 token、换行和大文本做日志测试，断言原值不出现且事件大小受限。

**来源：** MyBatis Logging、ShardingSphere Observability、OWASP Logging。
:::

## 安全与性能边界

参数绑定、标识符 allowlist、数据库最小权限和日志脱敏是分层控制，任何一层都不能替代其他层。性能结论必须
基于具体数据库、驱动、拓扑、数据量和负载测量；本课只验证 fan-out 上限、目标数、解析结果、参数数量、
逐目标耗时和合并状态，不给出没有测量环境的吞吐或延迟数字。

## 如何验证

- 行为反馈环：合法键产生预期 SINGLE/MULTI，缺失键为 REJECT，未知标识符不创建 SQL。
- SQL 反馈环：普通值保留 `#{}`，受控表名来自 allowlist，字符串常量和注释不被误改。
- Mapper 反馈环：statementId、参数对象、resultMap 与事务 owner 独立核对。
- 结果反馈环：逐目标成功、空结果、超时、部分失败和稳定合并都可观察。
- 兼容反馈环：Java 25/现代依赖与 Java 8/旧依赖各连续运行两次。

:::exercise
### 练习：为跨分片订单查询定义完整合同

**要求：** 输入两个不同分片的 tenantId，写出 `RoutePlan`、最大 fan-out、每目标 limit、全局排序键、
部分失败返回值和需要记录的脱敏观测字段；普通值必须参数绑定，物理表必须来自 allowlist。

**验收：** 能明确回答每个目标执行什么、如何合并、一个目标超时时返回什么，以及日志中绝不能出现什么。

**参考答案：** 返回 `MULTI` 与两个固定目标；每目标按 `created_at,id` 取有界候选，合并后再取全局 limit；
任何失败都保留逐目标状态并设置 `partialFailure`，是否接受部分结果由调用用例决定。
:::

## 本节小结

- 分片键、路由结果、物理表和 SQL 参数需要不同的类型与校验边界。
- 单表、广播表、绑定表和跨分片查询不能共享一个模糊执行语义。
- 普通值使用参数绑定，动态标识符只来自后端 allowlist。
- SQL 结构改写使用受控 parser/AST，不使用正则盲改写。
- Mapper、事务和结果合并按用例显式归属，观测信息必须完整且脱敏。
- Java 25 与 Java 8 依赖线分别编译验证，不能相互代替。
