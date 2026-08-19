# 关系数据、SQL 与事务基础研究稿

## 冻结课程合同

| 项目 | 冻结值 |
| --- | --- |
| 课程 ID | `backend.java.learn.intermediate.relational-data-and-sql-foundations` |
| 标题 | 关系数据、SQL 与事务基础 |
| 阶段 | intermediate |
| 顺序 | 340；中级第 5 批；上一批为 `http-uri-and-request-response-basics` |
| 前置课程 | `backend.java.learn.basics.collections-and-iteration-contracts`、`backend.java.learn.basics.exceptions-and-cause-chains` |
| 来源能力 | `JAVA-PREREQ-007`：关系数据库与 SQL 必要前置 |
| 现代主线 | Java 25、JDBC 4.3、PostgreSQL 18.4、pgJDBC 42.7.13；SQL 通用语义以 ISO/IEC 9075 直接页面为规范入口 |
| 项目补充 | Java 8、JDBC 4.2、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE、MyBatis-Plus 3.4.2 |
| 项目证据 | 冻结 `projectEvidence: []`；不得为了补例子临时读取 `dzzz-app` 业务文件 |
| 项目边界 | `dzzz-app` 只读且本批不运行、不修改；冻结审计只用于版本纠正，不把项目现状当推荐写法 |
| 后继边界 | 本批关闭前不领取 `layers-dto-and-service-boundaries`，也不提前实现 Mapper、连接池或事务课程 |

本课只建立后端开发必须先掌握的关系表、键、NULL、查询、联接、聚合、参数化、事务、索引、
执行计划、分页和动态 SQL 边界。数据库建模方法论、数据库运维、分库分表、复制、ORM 实现、
连接池调优、分布式事务和特定业务 Mapper 不进入本课主线。

## 核验基线与版本纠正

- 核验日期：2026-08-08。
- 现代 Java：Java 25 LTS；`java.sql` 包说明其对应 JDBC 4.3 API。
- 现代数据库观察线：PostgreSQL 18.4。ISO 页面负责 SQL 标准入口，PostgreSQL 文档负责明确标注的
  产品行为和可执行反馈环，不能把 PostgreSQL 扩展冒充所有数据库的通用规则。
- PostgreSQL Java 驱动观察线：pgJDBC 官方首页在核验日将 42.7.13 标为当前发行版；下载页说明
  Java 8 及以上使用 JDBC 4.2 构件。本课用它连接 PostgreSQL fixture，不把驱动版本等同于 JDBC API
  版本。
- 项目线：Java 8 的 `java.sql` 包说明其对应 JDBC 4.2；Spring Boot 2.3.12.RELEASE 与 Spring
  Framework 5.2.15.RELEASE 仅作 legacy 补充。
- 冻结启动配置审计明确记录 `dzzz-app/pom.xml` 直接使用 MyBatis-Plus 3.4.2。因而“项目使用
  MyBatis-Plus 3.3.x”的先验猜测不成立，本研究稿纠正为 3.4.2。
- MyBatis-Plus `v3.4.2` 第一方 `build.gradle` 把 MyBatis 基线写为 3.5.6、MyBatis-Spring 写为
  2.0.5。这只能证明该发行 tag 的构建依赖，不能证明 `dzzz-app` 的最终 effective dependency
  没有覆盖版本；本批禁止读取项目 POM 或生成依赖树，因此将其保留为待核验项。
- MyBatis 官方当前文档页面标识 3.5.19。本课引用它解释 `#{}`、`${}` 与动态 SQL 的公开合同；
  项目兼容结论仍必须绑定冻结版本，而不能由当前文档倒推。
- 研究方法：Tavily 只用于发现直接页面；结论回到 ISO、PostgreSQL、Oracle、Spring、MyBatis、
  MyBatis-Plus 第一方源码或 OWASP 直接页面。搜索摘要、社区博客和项目代码数量不进入证据链。

## 官方来源卡与直接证据

### SQL 规范与 PostgreSQL 18.4

| 来源 | 适用版本 | 支持的结论 |
| --- | --- | --- |
| [ISO/IEC 9075-1:2023](https://www.iso.org/standard/76583.html) | SQL Framework，2023 | SQL 标准的整体框架、术语和各部分关系；本页只作为规范入口，不用公开摘要替代需购买的完整标准正文。 |
| [ISO/IEC 9075-2:2023](https://www.iso.org/standard/76584.html) | SQL Foundation，2023 | SQL 数据定义与数据操作的规范入口；课程不把 PostgreSQL 专有语法称为 ISO 通用语法。 |
| [PostgreSQL Tutorial：Relational Database Concepts](https://www.postgresql.org/docs/current/tutorial-concepts.html) | PostgreSQL 18.4 | 关系数据库由表组成；表由命名列和行构成，同一列中的值具有同类含义；行的物理顺序无合同。 |
| [PostgreSQL DDL Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html) | PostgreSQL 18.4 | `NOT NULL`、`UNIQUE`、主键、外键、复合键、引用动作和约束边界；主键自动建立唯一 B-tree 索引，引用列不会自动建索引。 |
| [PostgreSQL Comparison Functions and Operators](https://www.postgresql.org/docs/current/functions-comparison.html) | PostgreSQL 18.4 | 普通比较遇到 NULL 得到 unknown；使用 `IS NULL`、`IS NOT NULL`、`IS DISTINCT FROM` 表达空值或 null-safe 比较。 |
| [PostgreSQL SELECT](https://www.postgresql.org/docs/current/sql-select.html) | PostgreSQL 18.4 | `WITH`、`FROM`、`WHERE`、`GROUP BY`、`HAVING`、select list、集合运算、`ORDER BY`、`LIMIT/OFFSET` 的逻辑处理阶段。 |
| [PostgreSQL Table Expressions](https://www.postgresql.org/docs/current/queries-table-expressions.html) | PostgreSQL 18.4 | `FROM`、显式 JOIN、`ON`/`USING`、外联接、`WHERE`、`GROUP BY` 与 `HAVING` 的语义和处理位置。 |
| [PostgreSQL Sorting Rows](https://www.postgresql.org/docs/current/queries-order.html) | PostgreSQL 18.4 | 未写 `ORDER BY` 时返回顺序未指定；多列排序、方向和 NULL 排序必须显式表达。 |
| [PostgreSQL LIMIT and OFFSET](https://www.postgresql.org/docs/current/queries-limit.html) | PostgreSQL 18.4 | 分页应使用可预测的 `ORDER BY`；不同 LIMIT/OFFSET 可能得到不同计划，较大 OFFSET 的跳过行仍会在服务器端计算。 |
| [PostgreSQL Aggregate Functions](https://www.postgresql.org/docs/current/functions-aggregate.html) | PostgreSQL 18.4 | `count(*)` 统计输入行；多数聚合忽略 NULL；除 `count` 外，无输入行时多数聚合返回 NULL。 |
| [PostgreSQL Glossary：ACID](https://www.postgresql.org/docs/current/glossary.html) | PostgreSQL 18.4 | atomicity、consistency、isolation、durability 的术语入口；四个性质不能简化为“加了事务注解就一定安全”。 |
| [PostgreSQL Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html) | PostgreSQL 18.4 | SQL 隔离现象与 PostgreSQL 实现：Read Uncommitted 按 Read Committed 工作，Repeatable Read 还阻止 phantom，Serializable 防止 serialization anomaly。 |
| [PostgreSQL Explicit Locking](https://www.postgresql.org/docs/current/explicit-locking.html) | PostgreSQL 18.4 | 表锁、行锁、冲突、死锁检测与一致加锁顺序；行锁通常阻塞同一行的写入者/加锁者，不阻塞普通读取。 |
| [PostgreSQL Indexes Introduction](https://www.postgresql.org/docs/current/indexes-intro.html) | PostgreSQL 18.4 | 索引可加速匹配行定位，但增加存储和写入维护成本；创建索引后仍应结合真实查询核验。 |
| [PostgreSQL Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html) | PostgreSQL 18.4 | 计划树、估算 cost/rows/width、扫描与联接节点的阅读方式；估算不等于实测耗时。 |
| [PostgreSQL EXPLAIN](https://www.postgresql.org/docs/current/sql-explain.html) | PostgreSQL 18.4 | `EXPLAIN ANALYZE` 会真实执行语句；对有副作用的语句必须在受控事务与隔离数据中验证。 |

### JDBC、Spring、MyBatis 与安全

| 来源 | 适用版本 | 支持的结论 |
| --- | --- | --- |
| [Java 25 `java.sql` package](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/package-summary.html) | Java 25 / JDBC 4.3 | JDBC 核心接口、驱动加载、连接、语句、结果集、事务、类型映射和 JDBC 4.3 版本边界。 |
| [Java 25 `PreparedStatement`](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/PreparedStatement.html) | Java 25 / JDBC 4.3 | 预编译 SQL 使用 `?` 参数标记，通过 setter 绑定值；语句对象和结果资源需要关闭。 |
| [Java 25 `Connection`](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Connection.html) | Java 25 / JDBC 4.3 | 新连接初始为 auto-commit；`setAutoCommit(false)`、`commit`、`rollback`、savepoint、隔离级别和关闭合同。 |
| [Java 25 `DataSource`](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/javax/sql/DataSource.html) | Java 25 / JDBC 4.3 | `DataSource` 是连接工厂，是 JDBC 获取连接的首选入口；普通、池化和分布式事务实现由具体实现提供。 |
| [pgJDBC Download](https://jdbc.postgresql.org/download/) / [42.7.13 release](https://jdbc.postgresql.org/changelogs/2026-07-06-42.7.13-release/) | pgJDBC 42.7.13 / Java 8+ | 官方下载页提供驱动 JAR 与 Java 版本选择；发行页固定本课临时 fixture 使用的 42.7.13 版本。 |
| [Java 8 `java.sql` package](https://docs.oracle.com/javase/8/docs/api/java/sql/package-summary.html) | Java 8 / JDBC 4.2 | 项目线使用 JDBC 4.2，不能把 Java 9 以后加入的 JDBC 4.3 API 当成 Java 8 能力。 |
| [Java 8 `PreparedStatement`](https://docs.oracle.com/javase/8/docs/api/java/sql/PreparedStatement.html) / [`Connection`](https://docs.oracle.com/javase/8/docs/api/java/sql/Connection.html) | Java 8 / JDBC 4.2 | `?` 值绑定、auto-commit、提交、回滚和隔离级别的 legacy API 合同。 |
| [Spring Framework 5.2.15 Data Access](https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/data-access.html) | Spring Framework 5.2.15.RELEASE | JDBC 抽象、统一异常、声明式/编程式事务、事务传播和线程绑定资源；Spring 事务不能修复错误 SQL 合同。 |
| [Spring Boot 2.3.12 System Requirements](https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#system-requirements) | Spring Boot 2.3.12.RELEASE | Java 8 与 Spring Framework 5.2.15.RELEASE 的项目补充基线。 |
| [MyBatis 3 SQL Map XML](https://mybatis.org/mybatis-3/sqlmap-xml.html) | MyBatis 3.5.19 文档快照 | `#{}` 创建 PreparedStatement 参数，`${}` 原样替换字符串；resultMap、statement、参数和结果映射的基本合同。 |
| [MyBatis 3 Dynamic SQL](https://mybatis.org/mybatis-3/dynamic-sql.html) | MyBatis 3.5.19 文档快照 | `if`、`choose`、`trim`、`where`、`set`、`foreach` 用于组合 SQL 结构；集合值仍应逐项绑定。 |
| [MyBatis 3 Java API](https://mybatis.org/mybatis-3/java-api.html) | MyBatis 3.5.19 文档快照 | `SqlSession` 的 transaction、commit、rollback 和关闭边界；默认 session 非 auto-commit。 |
| [MyBatis-Spring Transactions](https://mybatis.org/spring/transactions.html) | MyBatis-Spring 当前文档 | Spring 管理的 mapper 参与 Spring 事务；不得在 Spring-managed `SqlSession` 上自行 commit/rollback/close。 |
| [MyBatis-Plus v3.4.2 build.gradle](https://github.com/baomidou/mybatis-plus/blob/v3.4.2/build.gradle) | MyBatis-Plus 3.4.2 | 第一方源码 tag 的 Java 8、MyBatis 3.5.6、MyBatis-Spring 2.0.5 构建基线；不证明项目最终依赖未覆盖。 |
| [MyBatis-Plus v3.4.2 PaginationInterceptor](https://github.com/baomidou/mybatis-plus/blob/v3.4.2/mybatis-plus-extension/src/main/java/com/baomidou/mybatisplus/extension/plugins/PaginationInterceptor.java) | MyBatis-Plus 3.4.2 | 旧 `PaginationInterceptor` 已标记 `@Deprecated`，只作项目兼容识别。 |
| [MyBatis-Plus v3.4.2 PaginationInnerInterceptor](https://github.com/baomidou/mybatis-plus/blob/v3.4.2/mybatis-plus-extension/src/main/java/com/baomidou/mybatisplus/extension/plugins/inner/PaginationInnerInterceptor.java) | MyBatis-Plus 3.4.2 | 3.4.2 已提供新分页 inner interceptor；迁移时应连同插件链配置一起验证，不能只替换类名。 |
| [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) | SQL 输入安全 | 首选 prepared statements；不能绑定的表名、列名和排序方向使用代码 allowlist 映射；不依赖手工转义。 |
| [OWASP Query Parameterization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Query_Parameterization_Cheat_Sheet.html) | SQL 输入安全 | 查询值与 SQL 结构分离；各数据库/语言均应使用真实参数化 API，而不是拼接输入。 |

## 关系模型、表与键

### 表、列和行各自表达什么

关系数据库用表表达同一类事实。列定义一个属性及其允许的数据类型，行表达一条具体事实。课程应从
“课程报名”这类无敏感信息的小表开始，让学习者区分：表名表示事实集合，列名表示属性，主键表示
一行的稳定身份，外键表示另一张表中已存在的身份。

表不是 Java `List`。查询结果没有天然插入顺序；没有 `ORDER BY` 时，即使某次运行看起来按主键
排列，也不能把该顺序写入接口合同。数据库类型也不是 Java 类型的简单别名，日期、数值精度、
字符排序和 NULL 都必须在边界上明确映射。

### 主键、唯一约束和外键不是同一个概念

- 主键唯一标识一行，等价地同时要求唯一与非 NULL；一张表只能声明一个主键，但可由多列组成。
- `UNIQUE` 约束表达候选值不能重复；NULL 是否彼此视为相同存在标准与产品选项差异，课程使用具体
  PostgreSQL 18.4 行为验证，不把它简化成跨数据库绝对规则。
- 外键要求非 NULL 引用值在目标表的主键或非部分唯一约束中存在，从而维护引用完整性。外键列允许
  NULL 时，默认匹配规则可能不要求该行找到目标；若业务关系必填，还必须同时声明 `NOT NULL`。
- PostgreSQL 会为主键和唯一约束自动创建唯一 B-tree 索引，但不会自动为外键的引用列创建索引。
  是否为引用列加索引取决于删除/更新父行、联接和过滤查询，必须用实际计划核验。

### NULL 表示缺失或未知，不是空字符串或数字 0

SQL 使用三值逻辑。`price = NULL` 和 `price <> NULL` 都不会得到普通 true，而会得到 unknown；
`WHERE` 只保留条件为 true 的行。因此判断空值使用 `IS NULL` / `IS NOT NULL`，需要把两个 NULL
视为相等时可使用 PostgreSQL 的 `IS NOT DISTINCT FROM`，并明确它是产品语法。

多数聚合会忽略 NULL，`count(*)` 统计输入行，`count(column)` 只统计该表达式非 NULL 的行。
没有输入行时 `sum` 等多数聚合返回 NULL 而不是 0。课程示例必须把“没有行”“有一行但值为 NULL”
和“值为空字符串”分别验证。

## 查询的逻辑边界

### SELECT、FROM、WHERE 和 ORDER BY

最小查询先按以下心智模型解释，而不是按数据库实际执行算子的时间猜测：

1. `FROM` 确定输入表并完成联接。
2. `WHERE` 删除条件不为 true 的输入行。
3. `GROUP BY` 形成组，聚合函数对每组求值。
4. `HAVING` 删除条件不为 true 的组。
5. select list 计算输出列。
6. `DISTINCT`、集合运算、`ORDER BY` 和 `LIMIT/OFFSET` 再塑造最终结果。

数据库优化器可以重写物理执行顺序，但结果必须遵守语义合同。不要用 `SELECT *` 建立稳定接口；
明确列名和别名，既能表达投影合同，也避免表结构增加后无意扩大网络、日志或序列化数据。

排序必须显式写出方向和稳定的 tie-breaker。例如 `ORDER BY created_at DESC, id DESC` 比只按可能
重复的 `created_at` 更适合分页。NULL 的默认位置依赖方向和数据库，跨边界时使用显式
`NULLS FIRST` / `NULLS LAST`，同时标注该语法的产品兼容性。

### JOIN 的匹配和过滤位置

`INNER JOIN` 只保留满足联接条件的组合。`LEFT JOIN` 先保留左表全部行，右侧无匹配时用 NULL 补齐。
联接条件应写在 `ON`，最终结果过滤写在 `WHERE`；对于 outer join，两者位置会改变结果。

```sql
SELECT c.id, c.name, e.status
FROM course AS c
LEFT JOIN enrollment AS e
  ON e.course_id = c.id
 AND e.status = 'ACTIVE'
ORDER BY c.id;
```

把 `e.status = 'ACTIVE'` 移到 `WHERE` 后，右侧无匹配的行因 `e.status` 为 NULL 而被过滤，结果会像
inner join 一样丢掉“尚无有效报名的课程”。课程必须让学习者观察这组结果差异，而不是只背 join 图。

### GROUP BY 和 HAVING

`GROUP BY` 把具有相同分组键的输入行归为一组；聚合函数把每组转换为一个结果。`WHERE` 在分组前
过滤行，`HAVING` 在分组后过滤组。能在分组前确定的普通行条件应放在 `WHERE`，需要依赖
`count`/`sum` 等聚合结果的条件才放在 `HAVING`。

```sql
SELECT course_id, count(*) AS active_count
FROM enrollment
WHERE status = 'ACTIVE'
GROUP BY course_id
HAVING count(*) >= 2
ORDER BY course_id;
```

该查询先丢弃非 ACTIVE 行，再按课程分组，最后只保留至少两行的组。课程需要同时展示
`count(*)` 与 `count(nullable_column)`，避免把“组内总行数”和“非 NULL 值数量”混为一谈。

## 参数化 SQL 与动态标识符边界

### PreparedStatement 只绑定数据值

JDBC 的 `PreparedStatement` 使用 `?` 表示参数位置，再通过 `setString`、`setLong` 等方法绑定值。
输入值不再作为 SQL 语法解析，这是预防 SQL injection 的首选边界，也能明确 JDBC 类型映射。

```java
String sql = "SELECT id, name FROM course WHERE status = ? ORDER BY id LIMIT ?";

try (Connection connection = dataSource.getConnection();
        PreparedStatement statement = connection.prepareStatement(sql)) {
    statement.setString(1, status);
    statement.setInt(2, limit);
    try (ResultSet rows = statement.executeQuery()) {
        // 逐行读取明确投影的列，并在 ResultSet 关闭前完成映射。
    }
}
```

后续课程代码必须检查 `limit` 的业务范围。参数化解决“值与结构分离”，不替代授权、数据范围、
最大返回量和语义校验。

### 表名、列名和排序方向通常不能当参数值绑定

`ORDER BY ?` 绑定的是一个值，不会把输入变成列标识符；表名、列名、关键字和 ASC/DESC 属于 SQL
结构。确需动态排序时，先把外部枚举映射为代码内固定片段，再组合 SQL：

```java
String orderBy = sort == Sort.CREATED_AT ? "created_at DESC, id DESC" : "id ASC";
String sql = "SELECT id, name FROM course ORDER BY " + orderBy + " LIMIT ?";
```

这里允许拼接的只有程序内两个常量，不是原始请求字符串。不要试图用引号转义任意列名，也不要用
正则“清洗”后直接拼接；OWASP 对不能绑定的位置要求 allowlist 或重新设计查询。

### MyBatis 的 `#{}` 和 `${}` 必须明确区分

- `#{status}` 生成 PreparedStatement 参数标记并绑定值，是普通输入值的默认选择。
- `${column}` 把文本直接插进 SQL，会改变 SQL 结构；只能接收代码内白名单映射后的可信片段，不能
  直接接收 HTTP 参数、JSON 字段或数据库中未经控制的字符串。
- 可选条件用 `if`/`choose`，前缀处理用 `where`/`trim`，更新列用 `set`，集合参数用 `foreach`。
  `foreach` 中每个元素仍使用 `#{item}`，不要把逗号分隔字符串直接塞进 `IN (...)`。

本课只研究公开合同，不编写项目 Mapper XML。Mapper namespace、resultMap、statement id、资源打包
和 SQL Injector 将在有冻结项目证据且获授权的后续课程单独验证。

## ACID、隔离级别与锁

### ACID 是四类性质，不是一个开关

- Atomicity：事务内操作作为一个整体提交或回滚，不暴露半套业务结果。
- Consistency：事务从一个满足约束和业务不变量的状态转到另一个满足状态；数据库约束与应用逻辑
  共同负责，不能由 `commit` 自动推导业务正确。
- Isolation：并发事务的中间状态按所选隔离合同相互隔离；更强隔离可能需要重试。
- Durability：成功提交后结果能在数据库承诺的故障范围内保存；具体保证取决于数据库配置和存储。

课程示例使用“创建报名并增加计数”解释原子性，但同时指出最好由数据模型减少重复事实，并用唯一键、
外键和检查约束维护可由数据库表达的不变量。

### JDBC 本地事务必须显式管理 auto-commit

JDBC 新连接默认 auto-commit，每条语句完成后独立提交。需要多条语句成为一个事务时：

1. 获取连接并确认由谁管理生命周期。
2. 调用 `setAutoCommit(false)` 后执行同一连接上的所有语句。
3. 全部成功时 `commit()`。
4. 失败时 `rollback()`，并继续传播原始异常或转换为稳定数据访问错误。
5. 关闭 statement、result set 和 connection；使用池化实现时仍以 DataSource/框架合同管理资源。

不要在 Spring 已管理的事务中再手工对底层连接或 MyBatis `SqlSession` 提交、回滚或关闭。事务边界、
传播和回滚规则必须在 Spring 5.2.15 精确版本的后续课程中验证，本研究稿不把 `@Transactional`
简化为“方法有异常就一定全部回滚”。

### 隔离级别描述允许出现的并发现象

通用教学先解释 dirty read、nonrepeatable read、phantom read 和 serialization anomaly，再单独列出
PostgreSQL 18.4 行为。PostgreSQL 默认 Read Committed；其 Read Uncommitted 实际按 Read Committed
处理，Repeatable Read 还阻止标准允许的 phantom，Serializable 可能因无法序列化而中止事务，应用
必须重试完整事务。

因此不能只凭 JDBC 常量名推断所有数据库行为。课程反馈环要开两个独立连接，以固定步骤观察每级别
的可见性，并把 PostgreSQL 结果标成产品证据，而不是 SQL 标准在所有实现上的唯一结果。

### 锁是并发协调工具，也可能等待或死锁

普通 UPDATE 会取得必要锁；显式 `FOR UPDATE` 适合必须先读后决定写入且能承担等待的场景。锁范围越大、
持有时间越长，并发等待风险越高。两个事务以相反顺序锁定同一组资源可能死锁，PostgreSQL 会检测并
中止其中一个事务；应用仍需回滚并按明确策略重试。

一致的资源访问顺序可以减少死锁，但不是“不再发生”的证明。不要在持锁事务中执行慢网络调用、等待
用户输入或处理无界集合。

## 索引与 EXPLAIN

索引不是“加上就会更快”的装饰。它维护从键到行位置的辅助结构，可能减少查找行数，但会占用空间并
增加 INSERT/UPDATE/DELETE 的维护工作。候选索引应来自真实 WHERE、JOIN、ORDER BY 和唯一性合同，
不能根据单个列“看起来常用”就创建。

`EXPLAIN` 展示优化器选择的计划和估算，重点先看：扫描节点、联接算法、过滤条件、估算行数和实际
数据量是否明显偏离。`cost` 是规划器单位，不是毫秒；单次 `EXPLAIN` 不能证明查询快。

`EXPLAIN ANALYZE` 会实际运行 SQL 并给出实际时间与行数。对 INSERT/UPDATE/DELETE 或会触发函数的
语句，研究 fixture 必须使用隔离的临时数据和明确回滚设计；即使事务回滚，也不能假定数据库外部副作用
会撤销。本课只教授验证方法，不给出未经测量的“某索引提升百分比”。

## 分页与动态 SQL

### LIMIT/OFFSET 需要唯一且确定的排序

只写 `LIMIT 20 OFFSET 20` 而不写 `ORDER BY`，得到哪 20 行没有合同。只按可重复列排序也会让同值行
跨页漂移；应追加唯一 tie-breaker，例如 `ORDER BY created_at DESC, id DESC`。并发插入/删除仍可能
使 offset 页出现重复或遗漏，这是分页模型本身的边界，不是多加一个主键排序就能完全消除。

较大 OFFSET 的跳过行仍需计算。基于稳定排序键的 seek/keyset 查询可以避免按页数累计跳过，例如
下一页使用 `(created_at, id) < (?, ?)`，但它不天然支持任意跳页，并需要与排序方向、NULL、过滤条件
和索引共同设计。本课只建立选择标准，不做性能承诺。

### MyBatis-Plus 3.4.2 分页插件属于 legacy 纠错线

冻结审计记录项目使用 MyBatis-Plus 3.4.2 和旧分页插件。3.4.2 第一方源码已经把
`PaginationInterceptor` 标为 deprecated，并提供 `PaginationInnerInterceptor`。因此后续项目补充
应识别旧类，但推荐迁移必须验证 `MybatisPlusInterceptor` 插件链、数据库类型、最大页大小、溢出策略、
count SQL 与原查询排序；不能只换类名就宣布行为等价。

本批没有 `projectEvidence`，所以不列项目 Mapper、分页配置或 SQL 文件。上述版本事实来自冻结审计与
官方 tag，只决定 legacy 研究优先级，不授权读取或改写 `dzzz-app`。

## 新旧版本差异

| 对比项 | 现代主线 | Java 8 / Spring Boot 2.3 项目线 | 教学结论 |
| --- | --- | --- | --- |
| Java 数据访问 API | Java 25 / JDBC 4.3 | Java 8 / JDBC 4.2 | 基础 PreparedStatement/Connection 合同相近；新增 API 不能倒灌 Java 8 示例 |
| 数据库行为 | PostgreSQL 18.4 作为明确产品观察线 | 冻结证据未授权确认项目数据库与精确版本 | SQL 通用概念和 PostgreSQL 行为分栏，不猜项目数据库 |
| Spring | 本课不引入当前 Spring 事务实现 | Boot 2.3.12 / Framework 5.2.15 | 旧项目事务只用精确 5.2.15 Reference 解释 |
| MyBatis | 当前 3.5.19 文档用于公开 Mapper/动态 SQL 合同 | MP 3.4.2 tag 基线为 MyBatis 3.5.6 / MyBatis-Spring 2.0.5 | 未读 effective dependency tree，不断言项目最终传递版本 |
| MyBatis-Plus 分页 | 不作为 SQL 基础主线 | 3.4.2 已弃用 `PaginationInterceptor` 并提供 inner interceptor | 旧插件仅作识别；迁移需行为验证 |
| 事务控制 | JDBC 连接显式 commit/rollback；数据库隔离语义单独验证 | Spring/MyBatis-Spring 统一管理时禁止混入手工提交 | 必须先确定事务所有者，再写资源代码 |

## 易错点与验证设计

| 易错点 | 触发条件、原因与后果 | 正确写法 | 最小验证 |
| --- | --- | --- | --- |
| 把无 `ORDER BY` 结果当稳定顺序 | 计划、数据量或并发变化后顺序改变，分页重复或漏行 | 写完整排序并追加唯一 tie-breaker | 同一数据用不同计划设置查询，验证只有显式排序有合同 |
| 使用 `= NULL` | 比较结果为 unknown，WHERE 不保留行 | 使用 `IS NULL` / `IS NOT NULL`；需要 null-safe 比较时核对产品语法 | 插入 NULL、空串、0 三行并分别查询 |
| LEFT JOIN 后在 WHERE 过滤右表 | 补出的 NULL 行被 WHERE 删除，外联接退化 | 需要限制匹配对象时把条件放 ON；需要过滤最终结果时放 WHERE | 对含无匹配左行的数据比较两条查询 |
| 混淆 WHERE 与 HAVING | 聚合前后过滤位置错误，结果或工作量改变 | 普通行条件放 WHERE，聚合结果条件放 HAVING | 固定样本比较 count 前后差异 |
| 拼接 SQL 值 | 输入改变语法，导致 SQL injection 或查询语义漂移 | 值使用 PreparedStatement/`#{}` | 输入引号和 SQL 元字符，断言其只作为一个值 |
| 用参数绑定列名 | `ORDER BY ?` 变成常量值排序，未按目标列排序 | 外部枚举映射为代码常量；仅拼接白名单片段 | 对两个允许排序项核对生成 SQL 与结果顺序 |
| 把 MyBatis `${}` 当参数 | 原始文本进入 SQL 结构 | 普通值只用 `#{}`；`${}` 仅接可信常量映射 | 对不可信输入做静态断言，禁止进入 `${}` |
| 忘记 auto-commit | 多条语句分别提交，后续失败留下半套结果 | 明确关闭 auto-commit，同连接 commit/rollback | 第二条语句故意失败，断言第一条也回滚 |
| Spring 与 SqlSession 双重管事务 | 手工 commit/close 与线程绑定事务冲突 | 选择一个事务所有者；Spring-managed mapper 只由 Spring 管理 | 精确版本 fixture 断言统一回滚 |
| 把隔离级别名称当跨库相同行为 | 产品实现强于或不同于标准最低要求 | 先讲标准现象，再验证目标数据库文档和双连接行为 | 两连接串行脚本记录每步可见值 |
| 随意加索引 | 写入与存储成本增加，优化器仍可能不使用 | 从查询和约束出发，以 EXPLAIN/实际工作量核验 | 比较计划、估算/实际行数，禁止只比较一次耗时 |
| 对写语句直接 EXPLAIN ANALYZE | 语句真实执行并产生数据或外部副作用 | 只在隔离 fixture 中运行，先理解回滚边界 | 临时表事务内验证并确认最终无数据残留 |
| 深 OFFSET 仍假定常量成本 | 服务器计算并跳过前面行，页数增大时工作量增长 | 按产品需求评估 keyset/seek 与复合索引 | 对不同 offset 记录实际 rows/plan，不给通用快慢结论 |

## `/tmp` 最小反馈环计划

本研究任务只设计验证，不创建仓库测试文件。后续获授权编写课程时，所有 fixture 使用
`mktemp -d /tmp/java-sql-foundations.XXXXXX`；结束后用 `find <dir> -depth -delete` 清理并执行
`test ! -e <dir>`，禁止运行 `dzzz-app`。

1. PostgreSQL 18.4 临时 schema：创建 course/enrollment 小表，验证主键、唯一、外键、可空外键和
   PostgreSQL 不自动为引用列建索引的目录证据。
2. PostgreSQL 18.4 查询：固定 NULL、重复排序键和无匹配联接样本，验证 `IS NULL`、LEFT JOIN
   ON/WHERE、WHERE/HAVING、聚合 NULL 与稳定排序。
3. PostgreSQL 18.4 分页：比较无排序、非唯一排序和复合唯一排序；记录不同 OFFSET 的
   `EXPLAIN (ANALYZE, BUFFERS)`，只报告该 fixture 的结果。
4. PostgreSQL 18.4 事务：两个独立连接按脚本观察 Read Committed、Repeatable Read、Serializable
   和行锁；对 serialization failure/deadlock 记录 SQLSTATE 并重试完整事务。
5. Java 25 / JDBC 4.3：临时 Maven 项目编译运行 PreparedStatement、NULL 读取、try-with-resources、
   auto-commit、commit/rollback 和 SQLException cause/SQLState 输出。
6. Java 8 / JDBC 4.2：使用同一行为的 Java 8 兼容实现，禁止使用 Java 9+ API，验证编译与回滚结果。
7. Spring Framework 5.2.15 / MyBatis 兼容线：最小临时依赖验证 Spring-managed transaction、`#{}`
   与 `foreach`；不读取项目 POM，不宣称 MyBatis 3.5.6 是项目 effective version。
8. MyBatis-Plus 3.4.2 只做精确 tag 的编译/配置研究：识别 deprecated 旧分页插件与新插件链；若缺少
   项目数据库合同则标记 deferred，不模拟项目结果。

## 课程小点建议

1. 关系、表、列、行与类型。
2. 主键、唯一约束、复合键、外键和引用完整性。
3. NULL、三值逻辑、`IS NULL` 与聚合中的 NULL。
4. SELECT 投影、FROM、WHERE 和查询逻辑阶段。
5. `ORDER BY`、多列排序、唯一 tie-breaker 和 LIMIT/OFFSET。
6. INNER JOIN、LEFT JOIN、ON 与 WHERE 的位置差异。
7. 聚合函数、GROUP BY、HAVING 和 `count(*)`/`count(column)`。
8. JDBC DataSource、Connection、PreparedStatement、ResultSet 和资源所有权。
9. 参数化 SQL、动态标识符 allowlist、MyBatis `#{}`/`${}`。
10. ACID、auto-commit、commit/rollback、隔离现象与锁。
11. 索引成本、主键/外键索引差异、EXPLAIN 与 EXPLAIN ANALYZE。
12. MyBatis 动态 SQL、集合参数、分页插件和 Java 8/Spring 5 legacy 边界。

每个小点在课程正文中必须独立回答“它是什么、有什么作用、什么时候使用、怎么使用、最小示例、
运行结果、常见误区”。这里只给出研究拆分，不提前创建课程内容。

## 不确定点与后续准入条件

1. 冻结课程 `projectEvidence: []`，本批没有权威依据确认 `dzzz-app` 使用的数据库产品、版本、方言、
   隔离级别、连接池配置或具体 Mapper 行为；不得从 MyBatis-Plus 依赖猜数据库。
2. MyBatis-Plus 3.4.2 的 `build.gradle` 支持 MyBatis 3.5.6/MyBatis-Spring 2.0.5 基线，但项目可能在
   parent、dependencyManagement 或直接依赖中覆盖；只有另行授权读取 POM/effective dependency tree
   后才能关闭此不确定点。
3. 当前 MyBatis 官方文档用于现代公开合同，不保证所有 3.5.19 文档细节可直接套用到项目最终版本；
   legacy 示例必须在精确解析版本上编译和运行。
4. ISO 公开产品页只能证明标准版本和范围，无法替代付费标准全文。SQL 语义若 PostgreSQL 文档明确
   标为扩展或与标准不同，课程必须标注产品边界；不能从公开摘要补写标准细节。
5. 没有当前数据库统计信息、数据分布、查询和硬件，不能给出索引、JOIN、分页或连接池性能结论；
   后续只能报告受控 fixture 或获授权环境中的实测结果。

## 研究 Gate 自检

- [x] 冻结课程 ID、顺序 340、前置、`JAVA-PREREQ-007`、现代与 legacy 基线。
- [x] 保持冻结 `projectEvidence: []`，未读取或运行 `dzzz-app`，未复制业务 SQL、地址或数据。
- [x] 纠正 MyBatis-Plus 版本为 3.4.2，没有把 3.3.x 猜测写成项目事实。
- [x] 把 MyBatis 3.5.6 / MyBatis-Spring 2.0.5 限定为 MP 3.4.2 tag 的构建基线，并保留
  effective dependency 覆盖不确定性。
- [x] 关系、键、NULL、查询、JOIN、聚合、事务、隔离、锁、索引和计划结论均绑定直接官方页面。
- [x] Java 25/JDBC 4.3 与 Java 8/JDBC 4.2 使用各自 Oracle API；Spring 使用精确 5.2.15 Reference。
- [x] 参数化、动态标识符和 MyBatis `#{}`/`${}` 安全边界同时由第一方文档与 OWASP 支持。
- [x] PostgreSQL 产品行为与 SQL 通用语义分开表述，未猜测冻结项目数据库。
- [x] 易错点包含触发条件、原因、后果、修正和最小验证设计。
- [x] 索引和分页未作无测量性能承诺；`EXPLAIN ANALYZE` 的实际执行边界已明确。
- [x] 后续验证资产限定在 `/tmp`，不在仓库保留测试或 fixture。

## Stop Boundary

本研究稿只完成中级第 5 批 `relational-data-and-sql-foundations` 的官方研究。不得在本任务中修改课程
Markdown、两个 Java manifest、track、计划、signoff、冻结矩阵或 `dzzz-app`。只有得到新的实现授权，
并完成课程正文、manifest 登记、`/tmp` Java 25/8、PostgreSQL 与 Spring/MyBatis 反馈环、工程 Gate、
桌面/390px 浏览器证据、独立 signoff 及 Standards/Spec 双轴 `PASS / 0 finding` 后，才可关闭该课并
领取中级第 6 批 `layers-dto-and-service-boundaries`；不得自动进入后续批次。
