---
id: backend.java.learn.intermediate.relational-data-and-sql-foundations
type: lesson
title: 关系数据、SQL 与事务基础
summary: 用关系表、参数化 SQL 和明确事务边界保存并查询可靠的业务数据
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 180
prerequisites:
  - backend.java.learn.basics.collections-and-iteration-contracts
  - backend.java.learn.basics.exceptions-and-cause-chains
objectives:
  - 能区分关系、表、列、行和数据类型，不把表等同于有固定顺序的 Java List。
  - 能用主键、唯一约束、非空约束、检查约束和外键表达基本数据规则。
  - 能正确处理 SQL NULL、三值逻辑以及聚合函数中的空值。
  - 能按 FROM、WHERE、GROUP BY、HAVING、投影、排序和分页理解查询结果。
  - 能区分 INNER JOIN 与 LEFT JOIN，并解释 ON 和 WHERE 位置为何改变结果。
  - 能用稳定排序、唯一 tie-breaker 和受限分页参数建立可预测结果。
  - 能通过 DataSource、Connection、PreparedStatement 和 ResultSet 执行最小 JDBC 查询。
  - 能把外部值绑定为 SQL 参数，并用代码允许列表处理不能参数化的标识符。
  - 能解释 ACID、auto-commit、commit、rollback、savepoint 和隔离级别的职责。
  - 能识别索引的读写权衡，并正确区分 EXPLAIN 估算与 EXPLAIN ANALYZE 实测。
  - '能区分 MyBatis 的 #{} 与 ${}，并用动态标签组合结构而不拼接原始输入。'
  - 能识别 Java 8、Spring 5.2 与 MyBatis-Plus 3.4.2 的 legacy 边界。
recap:
  - 表保存同一类事实，主键识别行，外键维护表之间的引用完整性。
  - NULL 不是空字符串或 0，普通比较遇到 NULL 得到 unknown。
  - 查询没有天然顺序；分页必须使用确定性排序和唯一 tie-breaker。
  - PreparedStatement 只绑定数据值，表名、列名和排序方向需要代码允许列表。
  - 多条语句要在同一连接和同一事务所有者下提交或回滚。
  - 隔离级别是并发可见性合同，不同数据库可能实现得比标准最低要求更强。
  - 索引增加写入与存储成本，EXPLAIN 计划必须结合真实工作量判断。
  - MyBatis 与 Spring 只代管映射和事务流程，不能替代正确的数据模型与 SQL 合同。
related: []
tags:
  - Java
  - SQL
  - 关系数据库
  - JDBC
  - 事务
  - PreparedStatement
  - MyBatis
  - 分页
appliesTo: Java 25 / JDBC 4.3 与 PostgreSQL 18.4 主线；Java 8 / JDBC 4.2、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE、MyBatis-Plus 3.4.2 兼容补充
modernBaseline:
  java: '25'
  jdbc: '4.3'
  postgresql: '18.4'
  postgresqlJdbc: '42.7.13'
  mybatisDocumentation: '3.5.19'
legacyBaseline:
  java: '8'
  jdbc: '4.2'
  springBoot: 2.3.12.RELEASE
  springFramework: 5.2.15.RELEASE
  mybatisPlus: 3.4.2
verifiedAt: 2026-08-08
sources:
  - id: iso-sql-framework-2023
    title: ISO/IEC 9075-1:2023 - SQL Framework
    url: https://www.iso.org/standard/76583.html
    sourceType: specification
    appliesTo: SQL 2023
    claims:
      - SQL 标准的整体框架、术语和各部分关系
      - 公开产品页是规范入口，不能代替完整标准正文
  - id: iso-sql-foundation-2023
    title: ISO/IEC 9075-2:2023 - SQL Foundation
    url: https://www.iso.org/standard/76584.html
    sourceType: specification
    appliesTo: SQL 2023
    claims:
      - SQL 数据定义与数据操作的规范入口
      - PostgreSQL 产品语法不能自动写成跨数据库通用规则
  - id: postgresql18-concepts
    title: PostgreSQL 18.4 - Relational Database Concepts
    url: https://www.postgresql.org/docs/current/tutorial-concepts.html
    sourceType: official-reference
    appliesTo: PostgreSQL 18.4
    claims:
      - 关系数据库、表、命名列、行和列类型的基础模型
      - SQL 不保证表中行的天然顺序
  - id: postgresql18-constraints
    title: PostgreSQL 18.4 - Constraints
    url: https://www.postgresql.org/docs/current/ddl-constraints.html
    sourceType: official-reference
    appliesTo: PostgreSQL 18.4
    claims:
      - NOT NULL、UNIQUE、主键、外键、复合键与引用动作
      - 主键和唯一约束自动建索引，外键引用列不会自动建索引
  - id: postgresql18-comparison
    title: PostgreSQL 18.4 - Comparison Functions and Operators
    url: https://www.postgresql.org/docs/current/functions-comparison.html
    sourceType: official-reference
    appliesTo: PostgreSQL 18.4
    claims:
      - 普通比较遇到 NULL 得到 unknown
      - IS NULL、IS NOT NULL 与 IS DISTINCT FROM 的产品行为
  - id: postgresql18-select
    title: PostgreSQL 18.4 - SELECT
    url: https://www.postgresql.org/docs/current/sql-select.html
    sourceType: official-reference
    appliesTo: PostgreSQL 18.4
    claims:
      - FROM、WHERE、GROUP BY、HAVING、投影、排序与分页的逻辑处理阶段
      - 明确 select list 比 SELECT * 更适合作为稳定输出合同
  - id: postgresql18-table-expressions
    title: PostgreSQL 18.4 - Table Expressions
    url: https://www.postgresql.org/docs/current/queries-table-expressions.html
    sourceType: official-reference
    appliesTo: PostgreSQL 18.4
    claims:
      - INNER JOIN、LEFT JOIN、ON、WHERE、GROUP BY 与 HAVING 的语义
      - outer join 中 ON 与 WHERE 的位置会改变结果
  - id: postgresql18-order
    title: PostgreSQL 18.4 - Sorting Rows
    url: https://www.postgresql.org/docs/current/queries-order.html
    sourceType: official-reference
    appliesTo: PostgreSQL 18.4
    claims:
      - 未写 ORDER BY 时返回顺序未指定
      - 多列排序、方向和 NULL 位置需要显式表达
  - id: postgresql18-limit-offset
    title: PostgreSQL 18.4 - LIMIT and OFFSET
    url: https://www.postgresql.org/docs/current/queries-limit.html
    sourceType: official-reference
    appliesTo: PostgreSQL 18.4
    claims:
      - LIMIT/OFFSET 分页需要可预测的 ORDER BY
      - 大 OFFSET 的跳过行仍由服务器计算
  - id: postgresql18-aggregate
    title: PostgreSQL 18.4 - Aggregate Functions
    url: https://www.postgresql.org/docs/current/functions-aggregate.html
    sourceType: official-reference
    appliesTo: PostgreSQL 18.4
    claims:
      - count(*)、count(expression) 与聚合忽略 NULL 的区别
      - 除 count 外，多数聚合在没有输入行时返回 NULL
  - id: postgresql18-acid
    title: PostgreSQL 18.4 - Glossary
    url: https://www.postgresql.org/docs/current/glossary.html
    sourceType: official-reference
    appliesTo: PostgreSQL 18.4
    claims:
      - atomicity、consistency、isolation 与 durability 的术语边界
  - id: postgresql18-isolation
    title: PostgreSQL 18.4 - Transaction Isolation
    url: https://www.postgresql.org/docs/current/transaction-iso.html
    sourceType: official-reference
    appliesTo: PostgreSQL 18.4
    claims:
      - PostgreSQL 的 Read Committed、Repeatable Read 与 Serializable 行为
      - serialization failure 需要应用重试完整事务
  - id: postgresql18-locking
    title: PostgreSQL 18.4 - Explicit Locking
    url: https://www.postgresql.org/docs/current/explicit-locking.html
    sourceType: official-reference
    appliesTo: PostgreSQL 18.4
    claims:
      - 表锁、行锁、冲突与死锁检测
      - 一致访问顺序只能降低死锁概率，不能证明死锁不会发生
  - id: postgresql18-indexes
    title: PostgreSQL 18.4 - Introduction to Indexes
    url: https://www.postgresql.org/docs/current/indexes-intro.html
    sourceType: official-reference
    appliesTo: PostgreSQL 18.4
    claims:
      - 索引的定位作用、存储成本与写入维护成本
  - id: postgresql18-explain
    title: PostgreSQL 18.4 - Using EXPLAIN
    url: https://www.postgresql.org/docs/current/using-explain.html
    sourceType: official-reference
    appliesTo: PostgreSQL 18.4
    claims:
      - 计划树、扫描、联接、估算 cost、rows 与 width 的阅读方法
      - cost 是规划器单位而不是实测毫秒
  - id: postgresql18-explain-command
    title: PostgreSQL 18.4 - EXPLAIN
    url: https://www.postgresql.org/docs/current/sql-explain.html
    sourceType: official-reference
    appliesTo: PostgreSQL 18.4
    claims:
      - EXPLAIN ANALYZE 会真实执行语句
      - 有副作用语句只能在隔离数据和明确回滚边界中验证
  - id: java25-sql-package
    title: Java 25 API - java.sql
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/package-summary.html
    sourceType: api-doc
    appliesTo: Java 25 / JDBC 4.3
    claims:
      - JDBC 4.3 的连接、语句、结果集、事务和类型映射接口
  - id: java25-prepared-statement
    title: Java 25 API - PreparedStatement
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/PreparedStatement.html
    sourceType: api-doc
    appliesTo: Java 25 / JDBC 4.3
    claims:
      - 问号参数、类型化 setter、executeQuery 与 executeUpdate 合同
  - id: java25-connection
    title: Java 25 API - Connection
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Connection.html
    sourceType: api-doc
    appliesTo: Java 25 / JDBC 4.3
    claims:
      - auto-commit、commit、rollback、savepoint、隔离级别和关闭合同
  - id: java25-data-source
    title: Java 25 API - DataSource
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/javax/sql/DataSource.html
    sourceType: api-doc
    appliesTo: Java 25 / JDBC 4.3
    claims:
      - DataSource 是连接工厂和 JDBC 获取连接的首选入口
      - 普通、池化和分布式事务实现由具体实现提供
  - id: pgjdbc-42713-download
    title: pgJDBC Download - 42.7.13
    url: https://jdbc.postgresql.org/download/
    sourceType: official-reference
    appliesTo: pgJDBC 42.7.13 / Java 8+
    claims:
      - 42.7.13 是本课核验日的当前 pgJDBC 发行版
      - 官方下载页为 Java 8 及以上提供 JDBC 4.2 构件
  - id: java8-sql-package
    title: Java 8 API - java.sql
    url: https://docs.oracle.com/javase/8/docs/api/java/sql/package-summary.html
    sourceType: api-doc
    appliesTo: Java 8 / JDBC 4.2
    claims:
      - Java 8 使用 JDBC 4.2，不能直接使用 JDBC 4.3 新增 API
      - PreparedStatement、Connection 与 ResultSet 的共同基础合同
  - id: spring52-data-access
    title: Spring Framework 5.2.15 Reference - Data Access
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/data-access.html
    sourceType: official-reference
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - JDBC 抽象、统一异常、声明式事务、传播与线程绑定资源
      - Spring 管理事务时不能混入另一套手工提交所有者
  - id: spring-boot-2312-system-requirements
    title: Spring Boot 2.3.12 Reference - System Requirements
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#system-requirements
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - 项目补充线支持 Java 8，并采用 Spring Framework 5.2.15.RELEASE
  - id: mybatis3519-sql-map
    title: MyBatis 3.5.19 - Mapper XML Files
    url: https://mybatis.org/mybatis-3/sqlmap-xml.html
    sourceType: official-reference
    appliesTo: MyBatis 3.5.19 documentation
    claims:
      - '#{} 创建 PreparedStatement 参数，${} 原样替换字符串'
      - statement、参数与结果映射的基础合同
  - id: mybatis3519-dynamic-sql
    title: MyBatis 3.5.19 - Dynamic SQL
    url: https://mybatis.org/mybatis-3/dynamic-sql.html
    sourceType: official-reference
    appliesTo: MyBatis 3.5.19 documentation
    claims:
      - if、choose、trim、where、set 与 foreach 的结构组合语义
  - id: mybatis3519-java-api
    title: MyBatis 3.5.19 - Java API
    url: https://mybatis.org/mybatis-3/java-api.html
    sourceType: api-doc
    appliesTo: MyBatis 3.5.19 documentation
    claims:
      - SqlSession 的 commit、rollback、事务与关闭边界
  - id: mybatis-spring-transactions
    title: MyBatis-Spring - Transactions
    url: https://mybatis.org/spring/transactions.html
    sourceType: official-reference
    appliesTo: MyBatis-Spring
    claims:
      - Spring-managed mapper 参与 Spring 事务
      - Spring 管理的 SqlSession 不应自行 commit、rollback 或 close
  - id: mybatis-plus-342-build
    title: MyBatis-Plus 3.4.2 - build.gradle
    url: https://github.com/baomidou/mybatis-plus/blob/v3.4.2/build.gradle
    sourceType: source-code
    appliesTo: MyBatis-Plus 3.4.2 tag
    claims:
      - 3.4.2 tag 的 Java 8、MyBatis 3.5.6 与 MyBatis-Spring 2.0.5 构建基线
      - tag 构建基线不能证明旧项目 effective dependency 没有覆盖
  - id: mybatis-plus-342-pagination
    title: MyBatis-Plus 3.4.2 - Pagination Interceptors
    url: https://github.com/baomidou/mybatis-plus/blob/v3.4.2/mybatis-plus-extension/src/main/java/com/baomidou/mybatisplus/extension/plugins/PaginationInterceptor.java
    sourceType: source-code
    appliesTo: MyBatis-Plus 3.4.2
    claims:
      - 旧 PaginationInterceptor 已标记 Deprecated
      - 迁移到插件链必须验证数据库类型、页大小、溢出和 count SQL
  - id: owasp-sql-injection
    title: OWASP SQL Injection Prevention Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: SQL input security
    claims:
      - 首选 prepared statements 分离 SQL 结构与输入值
      - 不能绑定的表名、列名和排序方向使用代码允许列表映射
projectEvidence: []
---

# 关系数据、SQL 与事务基础

## 为什么需要学习

后端程序会接收报名、订单、库存和状态变化。如果只把这些内容保存在 Java 集合里，进程重启后数据会
消失，多个请求同时修改时也很难保证一致。关系数据库用表保存事实，用约束阻止无效数据，用 SQL 查询
和修改数据，再用事务把多步变化组成一个整体。

但“会写一条 SELECT”还不等于会安全访问数据库。没有排序的分页会重复或漏数据，`= NULL` 查不到
预期行，LEFT JOIN 的过滤位置会改变结果，字符串拼接会把外部输入变成 SQL 结构，多条语句在默认
auto-commit 下还可能只成功一半。

本课从一张课程表和一张报名表开始，逐步建立“数据模型 -> SQL -> JDBC -> 事务 -> 验证”的完整心智
模型。现代观察线使用 Java 25、JDBC 4.3 和 PostgreSQL 18.4；Java 8、Spring 5.2 与
MyBatis-Plus 3.4.2 只作为旧项目兼容边界。

## 学习目标

- 能为简单业务事实设计表、列、主键和外键。
- 能写出明确投影、过滤、联接、聚合、排序和分页查询。
- 能正确处理 NULL 和三值逻辑。
- 能用 JDBC 参数化查询并在结果集关闭前完成映射。
- 能控制本地事务并解释并发隔离现象。
- 能判断动态 SQL、索引和分页建议的适用边界。

## 前置术语

- **数据库**：由数据库管理系统持久保存和管理的一组数据。
- **关系**：关系模型中的数学概念，在本课基础场景中可先理解为表。
- **约束**：由数据库检查的数据规则，例如“名称不能为空”或“报名必须引用已存在课程”。
- **SQL**：用于定义、查询和修改关系数据的语言。
- **JDBC**：Java 访问关系数据库的一组标准接口；具体数据库驱动负责实现这些接口。
- **事务**：作为一个工作单元提交或回滚的一组数据库操作。
- **映射**：把结果集中的列转换为 Java 字段或对象。
- **方言**：数据库产品在标准 SQL 之外提供或具体实现的语法与行为。

## 零基础知识点详解

### 关系、表、列、行与数据类型

**它是什么：** 表是有名称的同类事实集合。列说明每条事实有哪些属性以及允许什么类型，行是一条
具体事实。例如 `course` 表保存课程，`id`、`name`、`price` 是列，一门 Java 课是一行。

**有什么作用：** 固定列和类型让数据库能够拒绝明显错误的值，也让查询者知道每一列代表什么。

**什么时候使用：** 需要跨请求、跨进程持续保存结构化事实，并需要按字段查询或维护关联时使用关系表。
临时计算结果仍可留在 Java 集合中，不必全部写入数据库。

**怎么使用：**

1. 先写清表表示哪一类事实，不把课程和报名混成一张重复信息的大表。
2. 为每个属性选择能表达业务范围的数据类型。
3. 为列写稳定名称，不依赖列在表中的物理位置表达含义。
4. 查询时明确需要的列，显示顺序另用 `ORDER BY` 指定。

**最小示例：**

```sql
CREATE TABLE course (
  id BIGINT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  published BOOLEAN NOT NULL
);
```

**运行结果：** 数据库创建四列的 `course` 表；名称、价格和发布状态不能为 NULL。表本身仍没有“第一
行、第二行”的稳定顺序。

**常见误区：** 表不是 Java `List`。某次查询恰好按主键返回，不代表以后仍会保持该顺序。

### 主键、唯一约束、检查约束与外键

**它是什么：** 主键唯一识别一行；`UNIQUE` 阻止候选值重复；`CHECK` 检查行内条件；外键要求引用值
指向另一张表中已存在的键。

**有什么作用：** 这些规则由数据库在所有写入入口统一执行，能阻止重复标识、负价格和指向不存在课程
的报名。

**什么时候使用：** 只要规则能够由单行、唯一性或表间引用清楚表达，就优先建立数据库约束。涉及外部
服务或跨多行复杂业务判断时，还需要应用层逻辑。

**怎么使用：**

1. 为每张需要独立识别的表选择主键。
2. 对业务上不能重复的候选值增加 `UNIQUE`。
3. 对价格、数量等局部范围增加 `CHECK`。
4. 用外键连接父表，并决定关系是否还要 `NOT NULL`。
5. 根据删除语义明确 `RESTRICT`、`CASCADE` 或其他引用动作，不凭方便选择。

**最小示例：**

```sql
CREATE TABLE enrollment (
  id BIGINT PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES course(id),
  learner_email VARCHAR(200) NOT NULL,
  score NUMERIC(5, 2),
  CONSTRAINT enrollment_course_learner_unique UNIQUE (course_id, learner_email),
  CONSTRAINT enrollment_score_range CHECK (score BETWEEN 0 AND 100)
);
```

**运行结果：** 同一邮箱不能重复报名同一课程；`course_id` 必须指向已存在课程；分数有值时只能在
0 到 100 之间。

**常见误区：** 外键不会自动让关系必填，允许 NULL 的外键仍可能没有目标；PostgreSQL 也不会自动为
引用列创建索引。

### NULL、三值逻辑与聚合中的空值

**它是什么：** NULL 表示当前没有确定值，不等于空字符串、数字 0 或布尔 false。SQL 条件除了 true
和 false，还有 unknown；普通比较遇到 NULL 通常得到 unknown。

**有什么作用：** NULL 能表达“尚未评分”等确实缺失的状态，但调用方必须明确它的含义和处理方式。

**什么时候使用：** 属性在生命周期某阶段确实允许缺失时使用。业务必填字段应使用 `NOT NULL`，不要
把各种未知、未填写和不适用都随意压成一个 NULL。

**怎么使用：**

1. 用 `IS NULL` 或 `IS NOT NULL` 判断空值。
2. 用 `COALESCE` 只在输出合同确实需要默认值时转换。
3. 区分 `count(*)` 的总行数和 `count(column)` 的非 NULL 数量。
4. 对无输入行的 `sum` 等聚合结果准备接收 NULL。

**最小示例：**

```sql
SELECT
  count(*) AS enrollment_count,
  count(score) AS scored_count,
  coalesce(avg(score), 0) AS average_score
FROM enrollment
WHERE course_id = 10;
```

**运行结果：** `enrollment_count` 统计全部报名，`scored_count` 只统计已有分数的报名；完全没有输入
分数时，`coalesce` 把 NULL 平均值转换成课程合同选择的 0。

**常见误区：** `score = NULL` 不会查到空值行，因为条件结果是 unknown；应写 `score IS NULL`。

### SELECT 投影、过滤与逻辑处理阶段

**它是什么：** SELECT 查询从输入表产生结果。`FROM` 决定输入，`WHERE` 过滤行，select list 决定
输出哪些列；数据库可以优化物理执行方式，但结果必须遵守查询语义。

**有什么作用：** 明确处理阶段后，学习者能判断条件应该放哪里，也能避免把数据库实际执行计划误当成
SQL 书写顺序。

**什么时候使用：** 所有读取场景都使用 SELECT。接口只需要三列时就只投影三列，不把整行全部取出。

**怎么使用：**

1. 在 `FROM` 中确定输入表和别名。
2. 在 `WHERE` 中写普通行条件，并使用参数占位符接收外部值。
3. 在 select list 中写需要返回的列和稳定别名。
4. 最后增加明确排序和数量限制。

**最小示例：**

```sql
SELECT c.id, c.name, c.price
FROM course AS c
WHERE c.published = TRUE
  AND c.price <= 200
ORDER BY c.id;
```

**运行结果：** 只返回已发布且价格不超过 200 的课程，并只输出三个明确列，结果按课程 ID 排序。

**常见误区：** `SELECT *` 会让新增表列无意进入网络响应、日志或对象映射，不适合作为稳定接口合同。

### ORDER BY、确定性排序与 LIMIT/OFFSET

**它是什么：** `ORDER BY` 建立结果顺序，`LIMIT` 限制返回行数，`OFFSET` 先跳过指定行数。排序字段
相同时，需要唯一字段继续决定先后，这个字段称为 tie-breaker。

**有什么作用：** 确定性总序让相同数据在重复查询时拥有可解释的页边界。

**什么时候使用：** 列表、分页和“前 N 条”都需要排序。结果本来就是集合且调用方完全不关心顺序时
可以不排序，但不能再声称某行固定排第几。

**怎么使用：**

1. 先选择符合业务含义的主排序字段和方向。
2. 在最后追加唯一字段作为 tie-breaker。
3. 校验 `limit` 大于 0 且不超过接口上限。
4. 校验 offset 不为负，并理解深 offset 仍需服务器计算跳过行。

**最小示例：**

```sql
SELECT id, name, created_at
FROM course
WHERE published = TRUE
ORDER BY created_at DESC, id DESC
LIMIT 20 OFFSET 20;
```

**运行结果：** 返回确定排序下跳过前 20 行后的最多 20 行；相同创建时间继续按唯一 ID 降序。

**常见误区：** 加上 ID tie-breaker 只稳定当前排序，并不能消除并发插入或删除导致 offset 页漂移的
模型边界。

### INNER JOIN、LEFT JOIN、ON 与 WHERE

**它是什么：** JOIN 按条件组合两张表的行。INNER JOIN 只保留匹配组合；LEFT JOIN 保留全部左表行，
右侧没有匹配时用 NULL 补齐。

**有什么作用：** 课程和报名分别保存后，联接可以在查询时组合课程名称与报名状态，避免重复保存课程
名称。

**什么时候使用：** 输出需要来自多张相关表时使用。只要一个表就能回答问题时，不为“看起来完整”
增加无用联接。

**怎么使用：**

1. 为每张表取短而明确的别名。
2. 在 `ON` 中写键之间的匹配条件。
3. LEFT JOIN 只希望匹配特定右侧行时，把该限制继续放在 `ON`。
4. 需要过滤最终组合结果时才放到 `WHERE`。

**最小示例：**

```sql
SELECT c.id, c.name, e.learner_email
FROM course AS c
LEFT JOIN enrollment AS e
  ON e.course_id = c.id
 AND e.score IS NOT NULL
ORDER BY c.id, e.id;
```

**运行结果：** 每门课程都会出现；没有已评分报名的课程仍保留一行，报名列为 NULL。

**常见误区：** 把 `e.score IS NOT NULL` 移到 WHERE 会删除补出的 NULL 行，使结果像 inner join 一样
丢掉无匹配课程。

### GROUP BY、HAVING 与聚合结果

**它是什么：** `GROUP BY` 把相同分组键的输入行归为一组，聚合函数把一组行变成一个值；`HAVING`
在聚合后过滤组。

**有什么作用：** 可以计算每门课程的报名数、平均分或总金额，而不用先把全部明细加载到 Java 内存。

**什么时候使用：** 问题需要“按某字段统计”时使用。只要明细行时不用 GROUP BY。

**怎么使用：**

1. 先用 WHERE 删除不参与统计的普通行。
2. 用 GROUP BY 写出每组的键。
3. 在 select list 中输出分组键和聚合值。
4. 只有依赖聚合结果的条件才放 HAVING。

**最小示例：**

```sql
SELECT course_id, count(*) AS scored_count, avg(score) AS average_score
FROM enrollment
WHERE score IS NOT NULL
GROUP BY course_id
HAVING count(*) >= 2
ORDER BY course_id;
```

**运行结果：** 先排除未评分行，再按课程分组，只返回至少有两条评分的课程。

**常见误区：** WHERE 不能直接使用当前查询的聚合结果；HAVING 也不应代替本可在分组前完成的普通行
过滤。

### DataSource、Connection 与连接生命周期

**它是什么：** `DataSource` 是连接工厂，`Connection` 代表与数据库的一次会话。DataSource 可以是
普通实现，也可以由连接池管理；调用代码面对的是同一 JDBC 接口。

**有什么作用：** 业务代码不需要自己硬编码驱动创建细节，并能把连接配置与查询逻辑分开。

**什么时候使用：** Java 服务访问关系数据库时，优先从应用配置好的 DataSource 获取连接。简单命令行
实验可以直接使用 DriverManager，但不把它当成长期服务的连接管理方案。

**怎么使用：**

1. 由应用启动层创建和配置 DataSource。
2. 每个数据库工作单元调用 `getConnection()`。
3. 在 try-with-resources 中使用连接。
4. 尽快关闭连接；池化实现的 close 通常表示归还池，具体重置行为仍由实现合同负责。

**最小示例：**

```java
import java.sql.Connection;
import java.sql.SQLException;
import javax.sql.DataSource;

public final class ConnectionCheck {
    /** 获取连接并返回数据库产品名称。 */
    public static String databaseName(DataSource dataSource) throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            return connection.getMetaData().getDatabaseProductName();
        }
    }
}
```

**运行结果：** 配置 PostgreSQL DataSource 时返回 PostgreSQL；无论成功还是抛异常，try-with-resources
都会调用连接的 close。

**常见误区：** 连接池不是“永远不关闭连接”。调用方仍要及时 close，把借出的连接归还给池。

### PreparedStatement、ResultSet 与行映射

**它是什么：** `PreparedStatement` 保存带 `?` 参数位置的 SQL，并用类型化 setter 绑定值；
`ResultSet` 是查询结果游标，调用 `next()` 后读取当前行。

**有什么作用：** SQL 结构与输入值分离，驱动负责值的传输和类型映射；结果在资源关闭前被转换成明确
Java 对象。

**什么时候使用：** 外部值参与查询、更新或删除时都用 PreparedStatement。没有参数的固定 SQL 也可
使用它，保持统一资源模型。

**怎么使用：**

1. 写固定 SQL，用 `?` 只表示数据值。
2. 按从 1 开始的位置绑定每个参数。
3. SELECT 调用 `executeQuery()`，写操作调用 `executeUpdate()`。
4. 在 `while (rows.next())` 中按明确列名读取并完成映射。
5. 先关闭 ResultSet 和 statement，再关闭 connection。

**最小示例：**

```java
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import javax.sql.DataSource;

public final class CourseQuery {
    public record CourseRow(long id, String name, BigDecimal price) {}

    /** 查询不高于指定价格的已发布课程。 */
    public static List<CourseRow> findPublished(DataSource dataSource, BigDecimal maxPrice)
            throws SQLException {
        String sql = """
                SELECT id, name, price
                FROM course
                WHERE published = TRUE AND price <= ?
                ORDER BY id
                """;
        List<CourseRow> result = new ArrayList<>();
        try (Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setBigDecimal(1, maxPrice);
            try (ResultSet rows = statement.executeQuery()) {
                while (rows.next()) {
                    result.add(new CourseRow(
                            rows.getLong("id"),
                            rows.getString("name"),
                            rows.getBigDecimal("price")));
                }
            }
        }
        return List.copyOf(result);
    }
}
```

**运行结果：** 返回不可变 List，元素顺序与 SQL 的 `ORDER BY id` 一致；价格值只作为一个参数传给
数据库，不会改变 SQL 结构。

**常见误区：** JDBC 参数位置从 1 开始；ResultSet 也必须关闭，不能只关闭 Connection。

### 参数化 SQL 与动态标识符允许列表

**它是什么：** 参数化只能替换数据值。表名、列名、排序方向和 SQL 关键字属于结构，通常不能用 `?`
绑定。

**有什么作用：** 分清值与结构后，可以阻止外部字符串改变查询语法，同时仍支持少量受控动态排序。

**什么时候使用：** 搜索词、状态、ID、金额和分页数量作为值绑定；用户可选排序字段时先转换成应用内
枚举，再映射为固定 SQL 片段。

**怎么使用：**

1. 把所有普通输入保留为原始值并用 setter 绑定。
2. 把允许的排序选项定义为有限枚举。
3. 每个枚举只返回程序内固定片段。
4. 拒绝未知选项，不对原始列名做正则清洗后拼接。

**最小示例：**

```java
public enum CourseSort {
    NEWEST("created_at DESC, id DESC"),
    PRICE_LOWEST("price ASC, id ASC");

    private final String sql;

    /** 保存经过审查的固定排序片段。 */
    CourseSort(String sql) {
        this.sql = sql;
    }

    /** 返回只能来自枚举常量的 SQL 片段。 */
    public String sql() {
        return sql;
    }
}
```

**运行结果：** 调用方只能在两个固定排序中选择；外部输入不会直接进入 SQL。实际 `limit` 仍用 `?`
绑定。

**常见误区：** `ORDER BY ?` 绑定的是一个普通值，不会把参数解释成列名，因此不能实现动态列排序。

### ACID、auto-commit、提交与回滚

**它是什么：** ACID 分别表示原子性、一致性、隔离性和持久性。JDBC 连接默认 auto-commit，每条语句
完成后独立提交；关闭 auto-commit 后由调用方显式 commit 或 rollback。

**有什么作用：** 当“新增报名”和“扣减名额”必须一起成功时，事务避免只留下半套数据库变化。

**什么时候使用：** 多条数据库语句共同维护一个不变量时使用同一连接和事务。单条语句本身已原子时，
仍要理解其所在框架是否已开启更大的事务。

**怎么使用：**

1. 获取连接并记录原 auto-commit 状态。
2. 调用 `setAutoCommit(false)`。
3. 在同一连接上执行全部语句。
4. 全部成功调用 `commit()`。
5. 捕获失败时调用 `rollback()` 并继续传播异常。
6. 在交还连接前恢复原状态；框架管理事务时由框架统一完成这些动作。

**最小示例：**

```java
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import javax.sql.DataSource;

public final class EnrollmentTransaction {
    /** 在一个本地事务中新增报名并扣减名额。 */
    public static void enroll(DataSource dataSource, long enrollmentId, long courseId, String email)
            throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            boolean originalAutoCommit = connection.getAutoCommit();
            connection.setAutoCommit(false);
            try {
                insertEnrollment(connection, enrollmentId, courseId, email);
                decrementSeats(connection, courseId);
                connection.commit();
            } catch (SQLException failure) {
                connection.rollback();
                throw failure;
            } finally {
                connection.setAutoCommit(originalAutoCommit);
            }
        }
    }

    /** 插入一条报名记录。 */
    private static void insertEnrollment(Connection connection, long id, long courseId, String email)
            throws SQLException {
        String sql = "INSERT INTO enrollment(id, course_id, learner_email) VALUES (?, ?, ?)";
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, id);
            statement.setLong(2, courseId);
            statement.setString(3, email);
            statement.executeUpdate();
        }
    }

    /** 扣减仍有余量的课程名额。 */
    private static void decrementSeats(Connection connection, long courseId) throws SQLException {
        String sql = "UPDATE course SET seats = seats - 1 WHERE id = ? AND seats > 0";
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, courseId);
            if (statement.executeUpdate() != 1) {
                throw new SQLException("课程不存在或名额不足");
            }
        }
    }
}
```

**运行结果：** 两条语句都成功才提交；名额不足时抛异常并回滚，报名记录也不会保留。

**常见误区：** rollback 只能撤销同一数据库事务中的变化，不能自动撤销已经发送的邮件或 HTTP 请求。

### savepoint 与事务内局部回滚

**它是什么：** savepoint 是当前事务中的一个命名检查点。`rollback(savepoint)` 只撤销检查点之后的
数据库变化，事务本身仍然处于进行中；它不同于不带参数的 `rollback()`，后者撤销整个事务。

**有什么作用：** 一个事务中存在“失败后允许放弃，但前面步骤仍可继续”的可选数据库操作时，可以只
回退可选部分，再由外层决定是否提交剩余变化。

**什么时候使用：** 只有业务明确允许局部失败，而且所有变化仍在同一个数据库事务中时使用。新增报名
和扣减名额这种必须同成同败的步骤不应靠 savepoint 拆开提交。

**怎么使用：**

1. 先关闭 auto-commit，确保连接已经进入显式事务。
2. 完成必须保留的前置数据库操作。
3. 调用 `setSavepoint("before_optional_score")` 创建检查点。
4. 可选操作成功后调用 `releaseSavepoint()`。
5. 可选操作失败时调用 `rollback(savepoint)`，只回退检查点之后的变化。
6. 最后仍由事务所有者对整个事务调用 `commit()` 或无参数 `rollback()`。

**最小示例：**

```java
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Savepoint;

public final class OptionalScoreUpdate {
    /** 尝试更新可选分数，失败时只回退本步骤。 */
    public static boolean tryUpdate(
            Connection connection, long enrollmentId, BigDecimal score) throws SQLException {
        Savepoint beforeScore = connection.setSavepoint("before_optional_score");
        try (PreparedStatement statement = connection.prepareStatement(
                "UPDATE enrollment SET score = ? WHERE id = ?")) {
            statement.setBigDecimal(1, score);
            statement.setLong(2, enrollmentId);
            if (statement.executeUpdate() != 1) {
                throw new SQLException("报名记录不存在");
            }
            connection.releaseSavepoint(beforeScore);
            return true;
        } catch (SQLException failure) {
            connection.rollback(beforeScore);
            return false;
        }
    }
}
```

**运行结果：** 调用方在 `setAutoCommit(false)` 后传入不存在的报名 ID 时返回 false；检查点后的分数
更新被撤销，检查点之前的数据库变化仍处于未提交状态，直到外层 commit 或 rollback。

**常见误区：** savepoint 不是子事务，也不会自动提交检查点之前的变化；连接关闭或整个事务回滚后，
对应检查点也不再有效。

### 隔离级别与重复读取

**它是什么：** 隔离级别规定一个事务能看到其他并发事务哪些变化。可以先把它理解为“事务读取数据时
使用哪一份可见快照”，而不是一个自动修复业务逻辑的开关。常见异常现象分别是：

- **脏读：** 事务读到另一个事务尚未提交、之后还可能回滚的数据。
- **不可重复读：** 同一事务再次读取同一行时，看到另一个事务已提交的新值或发现该行已被删除。
- **幻读：** 同一事务再次执行同一范围条件时，因为其他事务提交了插入或删除而得到不同的行集合。

SQL 隔离级别规定这些现象至少要阻止到什么程度；PostgreSQL 的实现可能强于标准最低要求。

**有什么作用：** 明确隔离级别后，才能解释同一事务重复查询是否看到别的事务已经提交的修改，并决定
是否需要重试或改用锁。

**什么时候使用：** 业务依赖“同一事务内的两次读取保持一致”，或需要分析脏读、不可重复读、幻读等并发现象
时使用。必须以目标数据库的实际实现为准，不能把 PostgreSQL 的表现推广成所有数据库的结论。

**怎么使用：**

1. 写出要保护的不变量，例如“本次审核内两次读取使用同一课程快照”。
2. 在事务开始时选择并记录隔离级别。
3. 用两个独立连接按固定顺序执行读取和提交，记录每一步看到的值。
4. 遇到 serialization failure 时重试完整事务，不只重试其中一条 SQL。

**最小示例：**

```sql
-- 会话 A
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT seats FROM course WHERE id = 10;

-- 会话 B：在 A 的两次查询之间执行
UPDATE course SET seats = seats - 1 WHERE id = 10;
COMMIT;

-- 回到会话 A
SELECT seats FROM course WHERE id = 10;
COMMIT;
```

**运行结果：** 在 PostgreSQL 的 Repeatable Read 事务中，会话 A 的两次查询使用同一快照，因此第二次读取
仍看到第一次的名额；会话 B 的提交不会改变 A 已经开始的快照。

**常见误区：** Repeatable Read 不会替你检查“扣减后不能为负”等业务规则，也不保证事务永远成功；出现
序列化冲突时必须回滚并重试完整工作单元。

### 行锁、等待与死锁

**它是什么：** 行锁是数据库为并发读写建立的协调记录。`SELECT ... FOR UPDATE` 会锁住选中的行，其他
事务修改同一行时通常要等待锁释放；两个事务互相等待就可能形成死锁。

**有什么作用：** 在“读取后马上修改”的流程中，行锁可以阻止另一个事务同时改写同一行，减少覆盖更新和
超卖名额的风险。

**什么时候使用：** 只有当业务不变量需要把“读取当前值”和“随后更新”绑定在同一事务中时才考虑行锁。
普通只读查询不应为了习惯而加锁，因为锁会增加等待和冲突。

**怎么使用：**

1. 会话 A 开启事务并用 `FOR UPDATE` 锁住目标课程。
2. 会话 A 读取名额并完成校验，但先不要提交。
3. 会话 B 尝试修改同一课程，观察它等待而不是立即覆盖 A 的值。
4. 会话 A 提交或回滚后，会话 B 才继续；多个资源加锁时保持一致顺序并对死锁失败重试。

**最小示例：**

```sql
-- 会话 A
BEGIN;
SELECT id, seats FROM course WHERE id = 10 FOR UPDATE;

-- 会话 B：此处会等待会话 A 结束
UPDATE course SET seats = seats - 1 WHERE id = 10 AND seats > 0;

-- 回到会话 A，释放行锁
COMMIT;
```

**运行结果：** 会话 B 的 `UPDATE` 会在会话 A 提交或回滚前等待；锁释放后它重新获得行并执行条件更新。
如果两个事务以相反顺序锁定两门课程，数据库可能报告 deadlock detected，应用必须回滚并重试。

**常见误区：** 锁不是永久占有权，也不能保护事务之外的 HTTP、邮件或文件操作；长事务会扩大等待范围。

### 索引与 EXPLAIN

**它是什么：** 索引是为特定查找键维护的辅助结构，帮助数据库定位行；EXPLAIN 展示优化器计划，
EXPLAIN ANALYZE 还会真实运行语句并报告实测信息。

**有什么作用：** 索引可能减少扫描行数，但会占用存储并增加 INSERT、UPDATE、DELETE 的维护成本；计划
让你看到数据库准备如何扫描和联接，而不是凭感觉猜性能。

**什么时候使用：** 查询在 WHERE、JOIN 或 ORDER BY 上扫描过多行时，先从实际过滤和排序条件提出索引候选，
再在代表性数据上比较计划。没有测量时不要写“加索引一定更快”。

**怎么使用：**

1. 记录查询的过滤列、联接列、排序列和真实数据规模。
2. 创建一个候选索引并运行 EXPLAIN，先阅读扫描、联接和估算行数。
3. 用 EXPLAIN ANALYZE 在隔离 fixture 上比较实际行数和耗时。
4. 对写语句的实测放在事务或临时数据库中，确认不会污染真实数据。

**最小示例：**

```sql
CREATE INDEX enrollment_course_id_idx ON enrollment(course_id);

EXPLAIN
SELECT id, learner_email
FROM enrollment
WHERE course_id = 10
ORDER BY id;
```

**运行结果：** PostgreSQL 输出计划树和估算值；是否选择索引取决于统计信息、数据分布和成本，创建了
索引也不保证每次使用。

**常见误区：** EXPLAIN 的 cost 不是毫秒；EXPLAIN ANALYZE 对写语句会真实修改数据，不能在生产数据
上随意试验。

### MyBatis 动态 SQL 与 Spring 事务所有者

**它是什么：** MyBatis 把 SQL、参数和 Java 映射连接起来。`#{}` 创建 PreparedStatement 参数，
`${}` 原样插入文本；动态标签只负责组合 SQL 结构。MyBatis-Spring 可让 mapper 参与 Spring 事务。

**有什么作用：** 可以减少手工 ResultSet 映射和可选条件拼接代码，但底层仍是 SQL、参数和事务合同。

**什么时候使用：** 后续项目课程需要 Mapper/XML 和 Spring 集成时使用。本课只学习公开边界，不提前
复制项目 Mapper。

**怎么使用：**

1. 普通值始终使用 `#{value}`。
2. 可选条件使用 `if`、`choose`、`where` 或 `trim`。
3. 集合条件使用 `foreach`，每个元素继续用 `#{item}` 绑定。
4. `${}` 只接收代码允许列表生成的可信结构片段。
5. 使用 Spring-managed mapper 时只让 Spring 提交、回滚和关闭 SqlSession。

**最小示例：**

```xml
<select id="findCourses" resultType="CourseRow">
  SELECT id, name, price
  FROM course
  <where>
    published = TRUE
    <if test="maxPrice != null">
      AND price &lt;= #{maxPrice}
    </if>
  </where>
  ORDER BY id
</select>
```

**运行结果：** `maxPrice` 有值时增加带参数条件，无值时由 `where` 标签生成合法 WHERE；外部值不会被
当作 SQL 文本插入。

**常见误区：** `${maxPrice}` 不是另一种参数写法，而是原样文本替换，会改变 SQL 结构并带来注入风险。

## 现代版本中的正确用法

现代主线先固定数据合同，再选择访问工具：表和约束保存数据库可验证的不变量；SQL 明确投影、参数、
排序和最大结果；Java 从 DataSource 借连接，用 PreparedStatement 绑定值，在 ResultSet 关闭前完成
映射；多步变化由一个清楚的事务所有者统一提交或回滚。

PostgreSQL 18.4 只是本课可执行观察线。NULL、隔离、索引和方言行为必须标明具体产品，不从一次运行
推导所有数据库。MyBatis、Spring 和连接池都建立在这些基础合同之上，不能用框架注解掩盖不明确的
SQL 或事务所有权。

## 核心接口与执行流程

| 层次 | 核心对象 | 负责什么 | 不负责什么 |
| --- | --- | --- | --- |
| 数据模型 | 表、列、键、约束 | 保存事实并拒绝可表达的无效状态 | HTTP 授权和外部副作用 |
| SQL | SELECT、DML、事务语句 | 描述要读取或修改的数据 | Java 对象生命周期 |
| JDBC | DataSource、Connection | 创建会话并划定本地事务 | 自动决定业务事务范围 |
| JDBC | PreparedStatement | 固定 SQL 结构并绑定数据值 | 参数化表名或列名 |
| JDBC | ResultSet | 按游标读取当前结果行 | 关闭后继续懒读取 |
| 框架 | MyBatis、Spring | 映射、资源与事务集成 | 修复错误 SQL 和数据模型 |

一次读取流程是：从 DataSource 获取 Connection，创建 PreparedStatement，绑定参数，执行查询，遍历
ResultSet 完成映射，按从内到外顺序关闭资源。一次多步写入还要在同一连接上关闭 auto-commit，并由
唯一事务所有者 commit 或 rollback。

## 从零跟着做

下面的步骤使用 PostgreSQL 18 容器和 `psql` 客户端，先把 SQL 基础跑通，再回到上面的 Java 示例。

1. 在同一个终端中用 `mktemp` 创建位于 `/tmp` 的临时学习目录，进入该目录，再创建
   `lesson.sql` 文件。

```sh
course_dir="$(mktemp -d /tmp/java-sql-course.XXXXXX)"
cd "$course_dir"
touch lesson.sql
```
2. 把下面的建表和样本数据复制到 `lesson.sql`，保存后检查每条语句都以分号结束。

```sql
DROP TABLE IF EXISTS enrollment;
DROP TABLE IF EXISTS course;
CREATE TABLE course (
  id BIGINT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  published BOOLEAN NOT NULL,
  seats INTEGER NOT NULL CHECK (seats >= 0),
  created_at TIMESTAMP NOT NULL
);
CREATE TABLE enrollment (
  id BIGINT PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES course(id),
  learner_email VARCHAR(200) NOT NULL,
  score NUMERIC(5, 2) CHECK (score BETWEEN 0 AND 100),
  UNIQUE (course_id, learner_email)
);
INSERT INTO course VALUES
  (10, 'Java', 199.00, TRUE, 1, TIMESTAMP '2026-08-08 10:00:00'),
  (20, 'SQL', 99.00, TRUE, 2, TIMESTAMP '2026-08-08 11:00:00'),
  (30, 'HTTP', 149.00, FALSE, 3, TIMESTAMP '2026-08-08 12:00:00');
INSERT INTO enrollment VALUES
  (100, 10, 'learner@example.test', NULL),
  (101, 20, 'second@example.test', 88.00),
  (102, 20, 'third@example.test', NULL);
```

3. 启动临时数据库；学习结束后必须停止它。

```sh
docker run --name java-sql-course --rm --detach \
  --env POSTGRES_USER=course --env POSTGRES_PASSWORD=course-pass \
  --env POSTGRES_DB=course_fixture --publish 127.0.0.1:55432:5432 postgres:18-alpine
```

4. 等待容器报告 ready，然后把文件导入数据库。

```sh
docker exec -i java-sql-course pg_isready --username course --dbname course_fixture
docker exec -i java-sql-course psql --username course --dbname course_fixture < lesson.sql
```

5. 新建 `queries.sql`，写入下面的四组查询。

```sql
SELECT count(*) AS wrong_null_count FROM enrollment WHERE score = NULL;
SELECT count(*) AS null_count FROM enrollment WHERE score IS NULL;
SELECT c.id, e.id AS enrollment_id
FROM course AS c
LEFT JOIN enrollment AS e
  ON e.course_id = c.id
 AND e.score IS NOT NULL
ORDER BY c.id, e.id;
SELECT id, name
FROM course
ORDER BY created_at DESC, id DESC
LIMIT 2 OFFSET 0;
```

6. 执行查询文件。输出中的 `wrong_null_count` 应为 0，`null_count` 应为 2；LEFT JOIN 仍包含 3 个
   课程 ID，分页按 `30、20` 的顺序返回两行。

```sh
docker exec -i java-sql-course psql --username course --dbname course_fixture < queries.sql
```

7. 在当前临时目录中创建 `lib` 和 `out` 目录，下载核验版本的 pgJDBC 与 MyBatis。第一个 JAR 是
   PostgreSQL 的 `DataSource` 实现，第二个 JAR 用于后面的 Mapper 反馈环。

```sh
mkdir -p lib out
curl --fail --location --output lib/postgresql-42.7.13.jar \
  https://repo.maven.apache.org/maven2/org/postgresql/postgresql/42.7.13/postgresql-42.7.13.jar
curl --fail --location --output lib/mybatis-3.5.19.jar \
  https://repo.maven.apache.org/maven2/org/mybatis/mybatis/3.5.19/mybatis-3.5.19.jar
```

8. 创建 `CourseQuery.java` 和 `EnrollmentTransaction.java`，分别复制本课前面的两个完整类；再创建
   `SqlLessonMain.java`，用 `PGSimpleDataSource` 提供连接并运行查询、成功事务和失败回滚。

```java
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.sql.DataSource;
import org.postgresql.ds.PGSimpleDataSource;

public final class SqlLessonMain {
    /** 配置数据源并运行 JDBC 查询与事务反馈环。 */
    public static void main(String[] args) throws SQLException {
        DataSource dataSource = createDataSource();
        int courseCount = CourseQuery.findPublished(
                dataSource, new BigDecimal("200.00")).size();

        EnrollmentTransaction.enroll(
                dataSource, 200, 10, "first-new@example.test");
        try {
            EnrollmentTransaction.enroll(
                    dataSource, 201, 10, "second-new@example.test");
        } catch (SQLException expected) {
            System.out.println("第二次报名失败：" + expected.getMessage());
        }

        int rollbackCount = countEnrollment(dataSource, 201);
        System.out.printf(
                "jdbc|courses=%d|rollbackCount=%d%n", courseCount, rollbackCount);
    }

    /** 创建指向本课临时数据库的普通数据源。 */
    private static DataSource createDataSource() {
        PGSimpleDataSource dataSource = new PGSimpleDataSource();
        dataSource.setServerNames(new String[] {"127.0.0.1"});
        dataSource.setPortNumbers(new int[] {55432});
        dataSource.setDatabaseName("course_fixture");
        dataSource.setUser("course");
        dataSource.setPassword("course-pass");
        return dataSource;
    }

    /** 统计指定报名 ID 是否留在数据库中。 */
    private static int countEnrollment(DataSource dataSource, long enrollmentId)
            throws SQLException {
        String sql = "SELECT count(*) FROM enrollment WHERE id = ?";
        try (Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, enrollmentId);
            try (ResultSet rows = statement.executeQuery()) {
                rows.next();
                return rows.getInt(1);
            }
        }
    }
}
```

9. 编译并运行 JDBC 入口。第一次报名把课程 10 的名额从 1 扣到 0；第二次报名先插入，再因名额不足
   触发整个事务回滚，所以最后的 `rollbackCount` 必须为 0。

```sh
javac --release 25 -cp 'lib/postgresql-42.7.13.jar' -d out \
  CourseQuery.java EnrollmentTransaction.java SqlLessonMain.java
java -cp 'out:lib/postgresql-42.7.13.jar' SqlLessonMain
```

```text
第二次报名失败：课程不存在或名额不足
jdbc|courses=2|rollbackCount=0
```

10. 创建 `CourseMapper.java`。`@Param` 给每个方法参数一个稳定名称，XML 中的 `#{name}`、
    `#{id}` 会引用这些普通值。

```java
import java.util.List;
import java.util.Map;
import org.apache.ibatis.annotations.Param;

public interface CourseMapper {
    /** 按名称参数查询课程。 */
    List<Map<String, Object>> findByName(@Param("name") String name);

    /** 新增一门用于回滚验证的课程。 */
    int insertCourse(@Param("id") long id, @Param("name") String name);

    /** 统计指定课程 ID。 */
    int countById(@Param("id") long id);
}
```

11. 创建 `CourseMapper.xml` 和 `mybatis-config.xml`。Mapper 中只有 `#{}` 值参数；配置中的
    `UNPOOLED` DataSource 只服务本地学习 fixture，生产服务的连接池属于后续课程。

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
  PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
  "https://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="CourseMapper">
  <select id="findByName" resultType="map">
    SELECT id, name
    FROM course
    WHERE name = #{name}
    ORDER BY id
  </select>

  <insert id="insertCourse">
    INSERT INTO course(id, name, price, published, seats, created_at)
    VALUES (#{id}, #{name}, 0, FALSE, 0, TIMESTAMP '2026-08-08 13:00:00')
  </insert>

  <select id="countById" resultType="int">
    SELECT count(*) FROM course WHERE id = #{id}
  </select>
</mapper>
```

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
  PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
  "https://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
  <environments default="lesson">
    <environment id="lesson">
      <transactionManager type="JDBC" />
      <dataSource type="UNPOOLED">
        <property name="driver" value="org.postgresql.Driver" />
        <property name="url" value="jdbc:postgresql://127.0.0.1:55432/course_fixture" />
        <property name="username" value="course" />
        <property name="password" value="course-pass" />
      </dataSource>
    </environment>
  </environments>
  <mappers>
    <mapper resource="CourseMapper.xml" />
  </mappers>
</configuration>
```

12. 创建 `MyBatisLessonMain.java`。第一次 session 传入带引号的攻击字符串，再插入课程 40 但不
    commit；关闭 session 后用第二次 session 查询，课程 40 必须不存在。

```java
import java.io.IOException;
import java.io.Reader;
import java.util.List;
import java.util.Map;
import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;

public final class MyBatisLessonMain {
    /** 验证值参数不会改变 SQL 结构，未提交写入会被回滚。 */
    public static void main(String[] args) throws IOException {
        SqlSessionFactory factory;
        try (Reader config = Resources.getResourceAsReader("mybatis-config.xml")) {
            factory = new SqlSessionFactoryBuilder().build(config);
        }

        int injectedRows;
        try (SqlSession session = factory.openSession()) {
            CourseMapper mapper = session.getMapper(CourseMapper.class);
            List<Map<String, Object>> rows = mapper.findByName("Java' OR TRUE --");
            injectedRows = rows.size();
            mapper.insertCourse(40, "uncommitted-course");
        }

        int uncommittedRows;
        try (SqlSession session = factory.openSession()) {
            uncommittedRows = session.getMapper(CourseMapper.class).countById(40);
        }
        System.out.printf(
                "mybatis|injectedRows=%d|uncommittedRows=%d%n",
                injectedRows,
                uncommittedRows);
    }
}
```

13. 编译并运行 MyBatis 入口。把 XML 复制进 `out`，是为了让 `Resources` 能从 classpath 找到它们。

```sh
javac --release 25 -cp 'lib/*:out' -d out CourseMapper.java MyBatisLessonMain.java
cp CourseMapper.xml mybatis-config.xml out/
java -cp 'out:lib/*' MyBatisLessonMain
```

```text
mybatis|injectedRows=0|uncommittedRows=0
```

14. 用 `CREATE INDEX ...` 和 `EXPLAIN` 记录当前 fixture 的计划，不把这次计划当成所有数据规模的
    结论。
15. 完成后停止临时数据库，回到 `/tmp`，删除本课临时目录，并用 `test ! -e` 确认目录已经不存在。

```sh
docker stop java-sql-course
cd /tmp
find "$course_dir" -depth -delete
test ! -e "$course_dir"
```

## 如何使用

1. 先把业务事实和不变量写成表、列、主键、外键与约束。
2. 为每个用例写明确 SQL：固定投影、固定结构、参数值、稳定排序和最大数量。
3. 决定事务所有者是 JDBC 调用方还是 Spring，禁止两套所有者交叉提交。
4. 在同一连接内完成一个本地事务，不把网络副作用误算进数据库 rollback。
5. 对并发问题使用双连接反馈环，对查询工作量使用目标数据库计划和受控实测。
6. 最后再引入 MyBatis、分页插件或连接池，并验证它们没有改变已有合同。

## 适用与不适用场景

关系数据库适合结构化事实、明确约束、联接查询和本地事务。单个 JVM 中短暂存在的计算结果可使用
集合；大对象文件通常把元数据放数据库、内容放专门存储；跨多个独立系统的流程不能只靠一个 JDBC
事务保证全部副作用原子。

LIMIT/OFFSET 适合小到中等页深和支持任意跳页的场景。深页工作量或并发漂移成为问题时，可评估基于
稳定排序键的 seek/keyset 分页，但它不天然支持任意跳页，仍要处理方向、NULL、过滤和索引。

:::tip
先让数据库约束表达它能可靠检查的不变量，再在应用层补充授权和复杂业务规则。这样无论写入来自 JDBC、
脚本还是后续 Mapper，都不会绕过最基础的数据正确性边界。
:::

## Java 8 / Spring Boot 2.3 兼容写法

Java 8 使用 JDBC 4.2，PreparedStatement、Connection、auto-commit、commit 和 rollback 的基础用法
与现代示例一致，但不能直接复制 text block、record、`List.copyOf` 等现代 Java 语法。

```java
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.sql.DataSource;

public final class LegacyCourseLookup {
    /** 查询一门课程的名称。 */
    public String findName(DataSource dataSource, long courseId) throws SQLException {
        String sql = "SELECT name FROM course WHERE id = ?";
        try (Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, courseId);
            try (ResultSet rows = statement.executeQuery()) {
                return rows.next() ? rows.getString("name") : null;
            }
        }
    }
}
```

Spring Framework 5.2.15 管理事务时，mapper 或 JDBC 操作应参与同一个 Spring 事务，不再手工提交、
回滚或关闭 Spring 绑定的 SqlSession。MyBatis-Plus 3.4.2 的旧 `PaginationInterceptor` 已弃用，旧项目
可识别但不能当现代推荐；迁移必须验证插件链、数据库类型、最大页大小、溢出策略和 count SQL。

## 新旧版本差异

| 对比项 | 现代主线 | 旧项目补充 | 迁移注意 |
| --- | --- | --- | --- |
| Java / JDBC | Java 25 / JDBC 4.3 | Java 8 / JDBC 4.2 | 只复用共同 API，不倒灌 JDBC 4.3 与现代语法 |
| 数据库产品 | PostgreSQL 18.4 观察线 | 冻结课程未确认项目数据库 | 不猜方言、隔离和连接配置 |
| Spring | 本课不引入当前 Spring 实现 | Boot 2.3.12 / Framework 5.2.15 | 只用精确归档文档解释事务 |
| MyBatis | 3.5.19 文档解释公开合同 | 最终项目传递版本未核验 | 当前文档不能倒推 legacy 全部细节 |
| MyBatis-Plus | 不作为 SQL 基础主线 | 3.4.2 | 旧分页插件只作识别，迁移需行为验证 |

## 易错点

:::pitfalls
### 错误：把外部值直接拼进 SQL

**触发条件：** 把搜索词、邮箱、ID 或状态用字符串连接到 SQL。

**原因：** 输入从普通数据变成 SQL 语法的一部分。

**后果：** 查询语义被改变，可能形成 SQL injection；影响读取、修改和删除操作。

**错误示例：**

```java
String sql = "SELECT id, name FROM course WHERE name = '" + input + "'";
```

**正确写法：**

```java
String sql = "SELECT id, name FROM course WHERE name = ?";
try (PreparedStatement statement = connection.prepareStatement(sql)) {
    statement.setString(1, input);
}
```

**验证方式：** 输入单引号和 SQL 元字符，断言它们只作为一个参数值传入，SQL 结构保持固定。

### 错误：使用等号判断 NULL

**触发条件：** 写 `WHERE score = NULL` 或在 Java 中把 SQL NULL 当成数字 0。

**原因：** SQL 普通比较遇到 NULL 得到 unknown，WHERE 只保留 true。

**后果：** 漏掉未评分行，统计数量和业务状态错误。

**错误示例：**

```sql
SELECT id FROM enrollment WHERE score = NULL;
```

**正确写法：**

```sql
SELECT id FROM enrollment WHERE score IS NULL;
```

**验证方式：** 分别插入 NULL、空字符串对应字段和 0，确认查询只返回真正 NULL 的行。

### 错误：LEFT JOIN 后在 WHERE 过滤右表

**触发条件：** 希望保留全部课程，却把报名状态条件写到 WHERE。

**原因：** 无匹配行补出的右侧 NULL 不满足 WHERE 条件。

**后果：** LEFT JOIN 结果像 INNER JOIN 一样丢掉无报名课程。

**错误示例：**

```sql
SELECT c.id, e.id
FROM course AS c
LEFT JOIN enrollment AS e ON e.course_id = c.id
WHERE e.score IS NOT NULL;
```

**正确写法：**

```sql
SELECT c.id, e.id
FROM course AS c
LEFT JOIN enrollment AS e
  ON e.course_id = c.id
 AND e.score IS NOT NULL;
```

**验证方式：** 准备一门无报名课程，对比两条查询的课程 ID 集合。

### 错误：多条写语句仍使用默认 auto-commit

**触发条件：** 第一条 INSERT 成功提交，第二条 UPDATE 失败。

**原因：** JDBC 新连接默认 auto-commit，每条语句完成后独立提交。

**后果：** 数据库留下半套业务结果。

**错误示例：**

```java
insertEnrollment(connection);
decrementSeats(connection);
```

**正确写法：**

```java
connection.setAutoCommit(false);
try {
    insertEnrollment(connection);
    decrementSeats(connection);
    connection.commit();
} catch (SQLException failure) {
    connection.rollback();
    throw failure;
}
```

**验证方式：** 故意让第二条语句违反约束，断言第一条插入也不存在。

### 错误：把 MyBatis ${} 当成值参数

**触发条件：** Mapper 把 HTTP 参数放入 `${column}`、`${status}` 或 `${ids}`。

**原因：** `${}` 原样替换 SQL 文本，不创建 PreparedStatement 参数。

**后果：** 外部输入改变 SQL 结构，产生注入或不可预测查询。

**错误示例：**

```xml
<select id="findByStatus" resultType="CourseRow">
  SELECT id, name FROM course WHERE status = '${status}'
</select>
```

**正确写法：**

```xml
<select id="findByStatus" resultType="CourseRow">
  SELECT id, name FROM course WHERE status = #{status}
</select>
```

**验证方式：** 检查最终 JDBC 语句包含参数标记，并用包含引号的输入确认它只作为一个值。
:::

## 安全与性能边界

SQL 参数化是输入安全的基础，但不替代资源授权、租户或数据范围检查。数据库账号使用完成工作所需的
最小权限；错误响应不回显连接串、SQL、表结构和敏感参数；日志记录稳定操作名与错误标识，不记录密码。

本课不声称某个索引、JOIN、连接池或分页方案“更快”。真实性能取决于数据量、分布、统计信息、硬件、
并发和查询形状。使用 EXPLAIN/ANALYZE 时记录环境与原始结果；大 OFFSET、无界结果和持锁网络调用先视为
需要验证的风险，不写未经测量的百分比结论。

## 如何验证

1. 在 PostgreSQL 18.4 临时 schema 创建课程与报名表，验证主键、唯一、检查和外键失败样本。
2. 插入 NULL、0 和正常分数，核对 `IS NULL`、`count(*)`、`count(score)` 与 `avg(score)`。
3. 对同一数据比较 LEFT JOIN 条件位于 ON 和 WHERE 的结果。
4. 比较无排序、非唯一排序和复合唯一排序的分页边界。
5. 用 Java 25 / JDBC 4.3 编译运行 PreparedStatement 查询与事务回滚样本。
6. 用 Java 8 / JDBC 4.2 编译兼容查询，确认没有使用 record、text block 或 JDBC 4.3 API。
7. 用两个独立连接观察 Read Committed 和更强隔离，不把 PostgreSQL 行为写成所有数据库结论。
8. 对候选索引运行 EXPLAIN，区分估算 cost、rows 与实际时间。
9. 静态检查 MyBatis 普通值只使用 `#{}`，`${}` 不接外部原始输入。
10. 在桌面与 390px 页面确认所有编号独立换行、统一来源区域只出现一次且页面无水平溢出。
11. 清理 `/tmp` fixture 后执行最终不存在性检查，不在仓库保留测试文件。

:::exercise
### 练习：实现安全的课程分页查询与报名事务

**要求：** 建立 course/enrollment 两张表；查询已发布课程时支持最高价格、两个允许排序和最多 50 条；
再实现“新增报名并扣减名额”，第二步失败时必须回滚第一步。普通值只能参数化，排序只能来自枚举允许列表。

**验收：** 重复执行查询得到确定顺序；未知排序被拒绝；包含引号的课程名不会改变 SQL；名额不足时既不
新增报名也不扣减名额；所有 JDBC 资源都关闭。

**参考答案：** 表使用主键、非空、外键、复合唯一和非负名额约束。查询固定投影，使用
`ORDER BY created_at DESC, id DESC` 或 `ORDER BY price ASC, id ASC` 两个代码常量，价格和 limit 用
问号绑定。事务在同一 Connection 上关闭 auto-commit，先 INSERT，再执行带 `seats > 0` 条件的 UPDATE；
更新行数不是 1 时抛 SQLException，catch 中 rollback，成功后 commit。
:::

## 本节小结

- 关系表保存同一类事实，列定义属性，行没有天然顺序。
- 主键、唯一、检查、非空与外键分别表达不同数据规则。
- NULL 使用三值逻辑，判断空值必须使用专用语法并理解聚合差异。
- SELECT 的过滤、联接、分组、排序和分页位置共同决定结果。
- DataSource 提供连接，PreparedStatement 绑定值，ResultSet 在关闭前完成映射。
- 多步写入由一个事务所有者在同一连接上 commit 或 rollback。
- 隔离、锁、索引和 EXPLAIN 都需要目标数据库与受控反馈环证据。
- MyBatis 和 Spring 建立在 SQL/JDBC 合同之上，不能替代参数化、约束和明确事务边界。
