---
id: backend.java.learn.intermediate.sql-queries
type: lesson
title: SQL 查询
summary: 在 TeamFlow 五表模型上投影、筛选、连接、分组和排序，得到语义明确且可重复验证的只读结果
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 150
prerequisites:
  - backend.java.learn.intermediate.relational-data-and-sql-foundations
objectives:
  - 能用显式投影、表别名和列别名定义查询结果合同。
  - 能用 WHERE、逻辑运算符、IN 和范围条件筛选原始行。
  - 能解释 NULL 的三值逻辑，并用 IS NULL 或 IS NOT NULL 判断缺失值。
  - 能沿外键写出 INNER JOIN，并用限定列名区分不同表中的同名列。
  - 能用 LEFT JOIN 保留没有子记录的父资源，并判断右表条件应放在 ON 还是 WHERE。
  - 能区分 COUNT(*) 与 COUNT(column)，并正确解释聚合函数对 NULL 的处理。
  - 能用 GROUP BY 和 HAVING 汇总并筛选分组，同时遵守 ONLY_FULL_GROUP_BY。
  - 能用唯一排序键收束并列结果，并让 LIMIT 只截取已经确定顺序的结果。
recap:
  - SELECT 列表定义输出，WHERE 在分组前筛选原始行，HAVING 在分组后筛选汇总结果。
  - NULL 表示缺失或未知，普通比较会得到 UNKNOWN，WHERE 只保留结果为 TRUE 的行。
  - INNER JOIN 只保留匹配组合，LEFT JOIN 还会为没有匹配的左表行补出右表 NULL。
  - LEFT JOIN 的右表条件放在 ON 中会限制匹配，放在 WHERE 中可能移除补空行。
  - COUNT(*) 统计结果行，COUNT(expression) 只统计表达式非 NULL 的行。
  - ONLY_FULL_GROUP_BY 拒绝不能由分组键唯一决定的非聚合列，不应通过关闭模式绕过含糊查询。
  - 只有 ORDER BY 定义输出顺序；存在并列值时追加唯一列，LIMIT 才能截取可预测的前几行。
related:
  - backend.java.learn.intermediate.relational-data-and-sql-foundations
  - backend.java.learn.intermediate.project-and-task-api-project
tags:
  - MySQL
  - SQL
  - SELECT
  - JOIN
  - GROUP BY
  - ORDER BY
appliesTo: MySQL 8.4 LTS；本课不包含 Java API，因此没有 JDK 25 与 Java 8 代码差异
verifiedAt: 2026-08-20
sources:
  - id: mysql84-select
    title: 'MySQL :: MySQL 8.4 Reference Manual :: 15.2.13 SELECT Statement'
    url: https://dev.mysql.com/doc/refman/8.4/en/select.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - SELECT 投影、WHERE、GROUP BY、HAVING、ORDER BY 与 LIMIT 的语法和职责
      - LIMIT 参数必须是非负整数，并在 HAVING 之后应用
  - id: mysql84-join
    title: 'MySQL :: MySQL 8.4 Reference Manual :: 15.2.13.2 JOIN Clause'
    url: https://dev.mysql.com/doc/refman/8.4/en/join.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - INNER JOIN、LEFT JOIN 与 ON 的语法和结果语义
      - ON 描述表怎样匹配，WHERE 限制最终结果行
  - id: mysql84-working-with-null
    title: 'MySQL :: MySQL 8.4 Reference Manual :: 5.3.4.6 Working with NULL Values'
    url: https://dev.mysql.com/doc/refman/8.4/en/working-with-null.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - NULL 的缺失值含义与 IS NULL、IS NOT NULL 判断方式
      - MySQL 8.4 中 NULL 的分组和排序行为
  - id: mysql84-logical-operators
    title: 'MySQL :: MySQL 8.4 Reference Manual :: 14.4.3 Logical Operators'
    url: https://dev.mysql.com/doc/refman/8.4/en/logical-operators.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - TRUE、FALSE 与 NULL UNKNOWN 的三值逻辑
      - AND、OR 与 NOT 对 NULL 的计算行为
  - id: mysql84-aggregate-functions
    title: 'MySQL :: MySQL 8.4 Reference Manual :: 14.19.1 Aggregate Function Descriptions'
    url: https://dev.mysql.com/doc/refman/8.4/en/aggregate-functions.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - COUNT(*)、COUNT(expression)、MIN 与 MAX 的结果合同
      - 聚合函数通常忽略 NULL，COUNT(expression) 只统计非 NULL 值
  - id: mysql84-group-by-handling
    title: 'MySQL :: MySQL 8.4 Reference Manual :: 14.19.3 MySQL Handling of GROUP BY'
    url: https://dev.mysql.com/doc/refman/8.4/en/group-by-handling.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - ONLY_FULL_GROUP_BY、函数依赖和非法非聚合列的处理
      - 关闭模式后组内任取值具有不确定性，ORDER BY 不能修复它
  - id: mysql84-sql-mode
    title: 'MySQL :: MySQL 8.4 Reference Manual :: 7.1.11 Server SQL Modes'
    url: https://dev.mysql.com/doc/refman/8.4/en/sql-mode.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - MySQL 8.4 默认 SQL mode 包含 ONLY_FULL_GROUP_BY
      - HAVING 可以引用 SELECT 列表中的别名
  - id: mysql84-column-aliases
    title: 'MySQL :: MySQL 8.4 Reference Manual :: B.3.4.4 Problems with Column Aliases'
    url: https://dev.mysql.com/doc/refman/8.4/en/problems-with-alias.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - 列别名可用于 GROUP BY、HAVING 和 ORDER BY，但不能用于 WHERE
  - id: mysql84-sorting-rows
    title: 'MySQL :: MySQL 8.4 Reference Manual :: 5.3.4.4 Sorting Rows'
    url: https://dev.mysql.com/doc/refman/8.4/en/sorting-rows.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - 未使用 ORDER BY 时结果没有可依赖的顺序
      - ASC、DESC 与多列排序的语义
  - id: mysql84-limit-optimization
    title: 'MySQL :: MySQL 8.4 Reference Manual :: 10.2.1.19 LIMIT Query Optimization'
    url: https://dev.mysql.com/doc/refman/8.4/en/limit-optimization.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - ORDER BY 列存在并列时行的相对顺序不确定
      - 追加唯一排序列可以让 LIMIT 前后的顺序可预测
---

# SQL 查询

上一课已经把 TeamFlow 的用户、团队、成员、项目和任务放进五张表。表能守住关系并不等于应用已经能
回答问题：待处理任务有哪些、每个项目有多少任务、哪个团队目前没有项目，都需要数据库把原始行转换成
新的结果集。

本课只学习只读 `SELECT`。你会投影列、筛选行、连接关系、汇总分组并固定结果顺序。数据库迁移、写操作、
MyBatis、分页 API、事务和索引调优都有后续课程，本课不提前展开。

## 一、让查询结果表达一个问题

### 1. FROM 提供输入，SELECT 定义输出

一条最小查询从一张表取得输入，再选择要交给调用方的列：

```sql
SELECT public_id, title, status
FROM tasks;
```

`FROM tasks` 表示输入来自任务表，`SELECT` 后的列表决定每个结果行有三列。表中的内部主键、时间和负责人
仍然存在，只是没有进入这次结果。查询不会修改原表，也不会保证这些行按插入顺序出现。

接口需要稳定字段时，应显式列出它真正使用的列。`SELECT *` 会让未来新增列自动进入结果，调用方难以判断
合同怎样变化；多表连接时还会同时出现多组 `id`、`public_id` 和 `created_at`。

### 2. 表别名定位来源，列别名命名结果

表别名缩短限定列名，列别名则改变结果中的列标题：

```sql
SELECT
    t.public_id AS task_id,
    t.title AS task_title,
    t.status AS task_status
FROM tasks AS t;
```

这里的 `t` 只在当前查询中代表 `tasks`，`task_id` 等名称只属于查询结果，不会重命名表中的列。多表查询
统一使用限定名，可以直接看出一个值来自哪张表，也避免 MySQL 面对同名列时报告歧义。

MySQL 允许结果别名出现在 `GROUP BY`、`HAVING` 和 `ORDER BY` 中，但不能在同一查询块的 `WHERE` 中引用
它。原因不是别名无效，而是筛选原始行时结果列尚未形成。

### 3. WHERE 只保留条件为 TRUE 的行

`WHERE` 对输入中的每一行计算条件，只把结果为 `TRUE` 的行交给后续阶段：

```sql
SELECT t.public_id, t.title, t.status, t.due_at_utc
FROM tasks AS t
WHERE t.status IN ('TODO', 'IN_PROGRESS')
  AND t.due_at_utc < '2026-08-25 00:00:00'
ORDER BY t.due_at_utc, t.public_id;
```

`IN` 表达有限集合，范围比较限制截止时间，`AND` 要求两项同时成立。下面继续筛出“未完成或由 lin
负责，同时不由 shen 负责”的任务：

```sql
SELECT t.public_id, t.status, t.assignee
FROM tasks AS t
WHERE (t.status <> 'DONE' OR t.assignee = 'lin')
  AND NOT (t.assignee = 'shen')
ORDER BY t.public_id;
```

`<>` 表示不等，`OR` 让括号内任一条件成立即可，`NOT` 再反转负责人比较。基于本课完整数据，结果依次为
`TASK-1`、`TASK-3`、`TASK-5`。括号先固定 `OR` 的业务分组，再与后面的 `AND` 组合，不需要读者猜测优先级。

这仍然只是在读取数据库。把外部请求安全地映射成 SQL 参数属于 MyBatis 查询课，本课使用固定、可观察的
SQL 值学习结果语义。

## 二、正确处理 NULL

### 1. NULL 不是空字符串或数字零

`NULL` 表示当前没有一个确定值。它与 `''`、`0` 和文本 `'NULL'` 都不同。普通比较无法判断两个未知值
是否相等，因此结果仍然是 `NULL`，也称 `UNKNOWN`：

```sql
SELECT
    NULL = NULL AS equals_null,
    NULL IS NULL AS is_null,
    TRUE AND NULL AS true_and_null,
    FALSE AND NULL AS false_and_null;
```

MySQL 8.4 的结果为：

```text
+-------------+---------+---------------+----------------+
| equals_null | is_null | true_and_null | false_and_null |
+-------------+---------+---------------+----------------+
|        NULL |       1 |          NULL |              0 |
+-------------+---------+---------------+----------------+
```

`TRUE AND NULL` 仍无法确定整体真假；`FALSE AND NULL` 已经确定为假。`WHERE` 只保留 `TRUE`，所以条件
算出 `FALSE` 或 `UNKNOWN` 的行都会被移除。

### 2. 使用 IS NULL 判断缺失值

要查找缺失值，使用专门的谓词：

```sql
SELECT p.public_id AS project_id
FROM projects AS p
LEFT JOIN tasks AS t ON t.project_id = p.id
WHERE t.id IS NULL
ORDER BY p.public_id;

SELECT t.public_id AS task_id
FROM tasks AS t
WHERE t.due_at_utc IS NOT NULL
ORDER BY t.public_id;
```

在本课数据中，结果只有没有任务的 `PRJ-4`。如果把条件写成 `t.id = NULL`，查询会成功执行但返回 0 行；
这比语法错误更容易被忽略，因为失败表现为“看起来只是没有数据”。`IS NOT NULL` 判断值确实存在，第二条
查询会按公开 ID 返回五个截止时间非空的任务。

### 3. NULL 的排序位置是产品行为

MySQL 8.4 在升序时把 `NULL` 放在非空值之前，降序时放在非空值之后；`GROUP BY` 会把两个 `NULL` 放入
同一组。这些是明确的 MySQL 行为，不能未经核验写成所有数据库都相同的规则。

本课正式结果优先使用不会为空的公开 ID 收束顺序。确实需要对可空列排序时，应在接口合同中明确是否接受
MySQL 的默认位置，而不是只看一次运行结果猜测规则。

## 三、沿外键连接多张表

### 1. INNER JOIN 只保留匹配组合

成员表保存 `user_id` 与 `team_id`，但展示成员名单还需要用户显示名和团队名。`INNER JOIN` 可以沿两个
外键取得完整结果：

```sql
SELECT
    tm.public_id AS member_id,
    u.display_name,
    te.name AS team_name,
    tm.role
FROM team_members AS tm
INNER JOIN users AS u ON u.id = tm.user_id
INNER JOIN teams AS te ON te.id = tm.team_id
ORDER BY te.public_id, tm.public_id;
```

每个 `ON` 都描述当前两侧怎样匹配。只有用户、团队和成员关系都存在的组合才会进入结果。mysql-01 的外键
已经阻止孤立成员，因此当前数据全部能匹配；查询仍应写出真实连接条件，而不是依赖内部 ID 恰好相等。

### 2. LEFT JOIN 保留没有子行的父资源

如果问题是“列出所有项目及其已完成任务”，没有已完成任务的项目也应出现。此时左表是必须保留的项目：

```sql
SELECT
    p.public_id AS project_id,
    t.public_id AS done_task_id
FROM projects AS p
LEFT JOIN tasks AS t
  ON t.project_id = p.id
 AND t.status = 'DONE'
ORDER BY p.public_id, t.public_id;
```

有已完成任务的项目得到真实任务列；其他项目仍保留一行，`done_task_id` 为 `NULL`。这个 `NULL` 不是表中
保存了一条空任务，而是外连接为了保留左表行补出的结果。

### 3. ON 限制匹配，WHERE 限制最终结果

把相同的状态条件移到 `WHERE` 会回答另一个问题：

```sql
SELECT
    p.public_id AS project_id,
    t.public_id AS done_task_id
FROM projects AS p
LEFT JOIN tasks AS t ON t.project_id = p.id
WHERE t.status = 'DONE'
ORDER BY p.public_id, t.public_id;
```

无匹配项目的 `t.status` 为 `NULL`，`NULL = 'DONE'` 得到 `UNKNOWN`，随后被 `WHERE` 移除。结果只剩真的
拥有已完成任务的项目，与前一条“保留所有项目”的查询不同。

不能简化成“右表条件永远放 ON”。如果业务问题本来就只需要有已完成任务的项目，放在 `WHERE` 完全合理。
判断位置时先说清楚左表无匹配行是否仍应保留，再选择相应语义。

## 四、把明细行汇总成分组

### 1. 聚合函数把多行变成一个值

`COUNT`、`MIN` 和 `MAX` 接收一组输入行，产生一个汇总值。外连接场景尤其要区分两个计数：

```sql
SELECT
    p.public_id AS project_id,
    COUNT(*) AS joined_rows,
    COUNT(t.id) AS task_count,
    MIN(t.due_at_utc) AS earliest_due_at,
    MAX(t.due_at_utc) AS latest_due_at
FROM projects AS p
LEFT JOIN tasks AS t ON t.project_id = p.id
GROUP BY p.id, p.public_id
ORDER BY p.public_id;
```

`MIN` 返回组内最早截止时间，`MAX` 返回最晚截止时间：`PRJ-1` 分别得到
`2026-08-22 10:00:00.000000` 与 `2026-08-23 09:00:00.000000`。`PRJ-4` 没有任务，但 `LEFT JOIN` 仍为它
产生一条补空结果，所以 `COUNT(*)` 是 1。`COUNT(t.id)` 忽略右表补出的 `NULL`，因此真实任务数是 0；
`MIN(t.due_at_utc)` 和 `MAX(t.due_at_utc)` 都没有非空输入，结果均为 `NULL`。

需要统计子资源时，优先数子表中确定非空的键。`COUNT(*)` 没有错，它只是回答“当前结果组有多少行”，
并不自动知道哪一侧代表业务对象。

### 2. GROUP BY 定义每个结果组

下面的查询按团队汇总任务数量：

```sql
SELECT
    te.public_id AS team_id,
    te.name AS team_name,
    COUNT(t.id) AS task_count
FROM teams AS te
LEFT JOIN projects AS p ON p.team_id = te.id
LEFT JOIN tasks AS t ON t.project_id = p.id
GROUP BY te.id, te.public_id, te.name
ORDER BY te.public_id;
```

`GROUP BY` 中的三列共同定义团队组，`COUNT(t.id)` 汇总每组任务。主线示例把所有非聚合投影列都明确列出，
让初学者直接看到分组合同。

MySQL 8.4 默认启用 `ONLY_FULL_GROUP_BY`。如果按 `te.id` 这个主键分组，MySQL 能证明同一行的公开 ID 和
名称由主键唯一决定，也允许投影它们；这叫函数依赖。但它不是“同表其他列都可以随便省略”。按非唯一
`team_id` 分组时，任意项目名称并不能由团队 ID 唯一决定。

### 3. WHERE 筛原始行，HAVING 筛结果组

`WHERE` 发生在分组之前，不能直接使用尚未形成的聚合值。`HAVING` 用于保留满足条件的组：

```sql
SELECT
    te.public_id AS team_id,
    COUNT(t.id) AS task_count
FROM teams AS te
LEFT JOIN projects AS p ON p.team_id = te.id
LEFT JOIN tasks AS t ON t.project_id = p.id
GROUP BY te.id, te.public_id
HAVING task_count >= 2
ORDER BY task_count DESC, te.public_id;
```

MySQL 允许 `HAVING` 引用 `SELECT` 中的 `task_count` 别名。结果保留任务数至少为 2 的团队；没有项目的
`TEAM-3` 在汇总完成后被移除。

如果条件是“只统计 `DONE` 任务”，它限制的是进入分组的任务行，应放在连接的 `ON` 或分组前的 `WHERE`，
具体位置仍取决于是否保留零个已完成任务的团队。不要把所有条件都塞进 `HAVING`。

## 五、固定最终结果顺序

### 1. 只有 ORDER BY 定义输出顺序

表没有可供接口依赖的天然行序。主键、插入顺序、当前执行计划或一次运行看到的顺序，都不能代替最终查询块
中的 `ORDER BY`：

```sql
SELECT t.public_id, t.status, t.due_at_utc
FROM tasks AS t
ORDER BY t.due_at_utc ASC, t.public_id ASC;
```

排序从左到右比较。先按截止时间升序；时间相同的任务再按唯一公开 ID 升序，因此每两行都能得到确定先后。
`ASC` 是默认方向，但在教学和接口查询中显式写出更容易核对合同。

MySQL 8.4 不再让 `GROUP BY` 隐式产生排序。需要有序汇总结果时仍要单独写 `ORDER BY`。

### 2. 并列值需要唯一 tie-breaker

下面的查询只按状态排序：

```sql
SELECT t.public_id, t.status
FROM tasks AS t
ORDER BY t.status
LIMIT 3;
```

多个任务具有同一状态时，它们在所有排序列上并列，MySQL 可以按任意顺序返回这些并列行。即使当前机器
连续运行得到同样结果，也没有建立可依赖合同。

追加唯一列后，顺序才完整：

```sql
SELECT t.public_id, t.status
FROM tasks AS t
ORDER BY t.status, t.public_id
LIMIT 3;
```

公开 ID 在任务表中唯一，所以任意两行最终都能比较出先后。这个原则也适用于日期、名称或计数等可能重复的
业务排序键。

### 3. LIMIT 只截取已经排好序的结果

本课只使用单参数 `LIMIT row_count` 缩短演示输出：

```sql
SELECT t.public_id, t.due_at_utc
FROM tasks AS t
ORDER BY t.due_at_utc, t.public_id
LIMIT 2;
```

`LIMIT 2` 在排序后取前两行。MySQL 要求行数是非负整数，`LIMIT 0` 合法并返回 0 行，`LIMIT -1` 会产生
语法错误。

页码、offset、游标 token 和用户可选排序属于后续“分页与筛选”课程。这里不能因为出现 `LIMIT` 就声称
已经实现稳定分页；本课只建立“先定义完整顺序，再限制观察行数”的基础。

## 六、完成 TeamFlow 查询 Demo

### 1. 准备前置 schema 与查询数据

沿用上一课保存的 `schema.sql`，不要重新创建另一套五表模型。先在 fresh MySQL 8.4 容器执行它，得到
`teamflow_model_demo` 以及编号为 1 的首组数据。然后新建 `query-data.sql`，补充本课只读查询需要的夹具：

```sql
USE teamflow_model_demo;

INSERT INTO users (public_id, display_name, email) VALUES
    ('USR-2', '林澄', 'lin@example.com'),
    ('USR-3', '沈琪', 'shen@example.com');

INSERT INTO teams (public_id, name) VALUES
    ('TEAM-2', '交付保障组'),
    ('TEAM-3', '无项目组');

INSERT INTO team_members (public_id, team_id, user_id, role) VALUES
    ('MBR-2', 1, 2, 'Developer'),
    ('MBR-3', 2, 2, 'Developer'),
    ('MBR-4', 2, 3, 'Reviewer');

INSERT INTO projects (public_id, team_id, name) VALUES
    ('PRJ-2', 1, '内容迁移'),
    ('PRJ-3', 2, '发布自动化'),
    ('PRJ-4', 2, '空项目');

INSERT INTO tasks (
    public_id,
    project_id,
    title,
    status,
    due_at_utc,
    assignee
) VALUES
    ('TASK-2', 1, '核对关系模型', 'DONE', '2026-08-23 09:00:00', 'shen'),
    ('TASK-3', 2, '迁移旧课程', 'IN_PROGRESS', '2026-08-24 01:30:00', 'zhou'),
    ('TASK-4', 3, '准备发布清单', 'TODO', '2026-08-22 10:00:00', 'shen'),
    ('TASK-5', 3, '验证发布产物', 'DONE', '2026-08-25 03:00:00', 'lin');
```

这些 `INSERT` 只用于建立可重复查询数据，不是本课教学内容。它们假设 `schema.sql` 刚刚成功执行，内部 ID
从 1 连续生成；不要在已经运行过其他写操作的数据库上复用这份夹具。

### 2. 编写完整只读查询文件

新建 `query-demo.sql`，依次回答任务列表、成员名单、无任务项目、各项目统计和团队统计五个问题：

```sql
USE teamflow_model_demo;

SELECT
    t.public_id AS task_id,
    t.title,
    t.status,
    t.due_at_utc
FROM tasks AS t
WHERE t.status IN ('TODO', 'IN_PROGRESS')
  AND t.due_at_utc < '2026-08-25 00:00:00'
ORDER BY t.due_at_utc, t.public_id;

SELECT
    tm.public_id AS member_id,
    u.display_name,
    te.name AS team_name,
    tm.role
FROM team_members AS tm
INNER JOIN users AS u ON u.id = tm.user_id
INNER JOIN teams AS te ON te.id = tm.team_id
ORDER BY te.public_id, tm.public_id;

SELECT p.public_id AS project_id
FROM projects AS p
LEFT JOIN tasks AS t ON t.project_id = p.id
WHERE t.id IS NULL
ORDER BY p.public_id;

SELECT
    p.public_id AS project_id,
    COUNT(*) AS joined_rows,
    COUNT(t.id) AS task_count,
    MIN(t.due_at_utc) AS earliest_due_at,
    MAX(t.due_at_utc) AS latest_due_at
FROM projects AS p
LEFT JOIN tasks AS t ON t.project_id = p.id
GROUP BY p.id, p.public_id
ORDER BY p.public_id;

SELECT
    te.public_id AS team_id,
    COUNT(t.id) AS task_count
FROM teams AS te
LEFT JOIN projects AS p ON p.team_id = te.id
LEFT JOIN tasks AS t ON t.project_id = p.id
GROUP BY te.id, te.public_id
HAVING task_count >= 2
ORDER BY task_count DESC, te.public_id
LIMIT 2;
```

### 3. 运行并核对结果

在 `schema.sql`、`query-data.sql` 和 `query-demo.sql` 所在目录执行：

```shell
docker run --name mysql02-query-demo \
  -e MYSQL_ROOT_PASSWORD=local-query-pass \
  -d mysql:8.4

until docker exec mysql02-query-demo \
  mysql -uroot -plocal-query-pass -e 'SELECT 1' >/dev/null 2>&1; do
  sleep 1
done

docker exec -i mysql02-query-demo \
  mysql -uroot -plocal-query-pass < schema.sql
docker exec -i mysql02-query-demo \
  mysql -uroot -plocal-query-pass < query-data.sql
docker exec -i mysql02-query-demo \
  mysql -uroot -plocal-query-pass < query-demo.sql
```

可观察结果应同时满足：

- 第一个结果依次是 `TASK-1`、`TASK-4`、`TASK-3`。
- 成员结果包含 `MBR-1` 到 `MBR-4`，姓名和团队名来自连接表。
- 无任务项目只有 `PRJ-4`。
- `PRJ-1` 的 `earliest_due_at=2026-08-22 10:00:00.000000`、
  `latest_due_at=2026-08-23 09:00:00.000000`。
- `PRJ-4` 的 `joined_rows=1`、`task_count=0`，最早和最晚截止时间均为 `NULL`。
- 团队统计依次为 `TEAM-1=3`、`TEAM-2=2`，`TEAM-3` 被 `HAVING` 移除。

## 七、识别典型查询错误

:::pitfalls
### 使用等号判断 NULL

**触发条件：** 想查找没有任务的项目，写出 `WHERE t.id = NULL`。

**原因：** 普通比较遇到 NULL 得到 UNKNOWN，WHERE 只保留 TRUE。

**后果：** 查询成功但返回 0 行，调用方把真实存在的无任务项目误判为不存在。

**错误示例：**

```sql
SELECT p.public_id
FROM projects AS p
LEFT JOIN tasks AS t ON t.project_id = p.id
WHERE t.id = NULL;
```

**正确写法：**

```sql
SELECT p.public_id
FROM projects AS p
LEFT JOIN tasks AS t ON t.project_id = p.id
WHERE t.id IS NULL;
```

**影响版本：** MySQL 8.4；这是 SQL 空值语义，不是客户端显示问题。

**验证方式：** 对包含 `PRJ-4` 的本课数据分别运行两条查询；错误版为 0 行，正确版只返回 `PRJ-4`。

### 连接后继续使用不限定的同名列

**触发条件：** 连接 `projects` 与 `tasks` 后直接投影 `public_id` 或使用 `WHERE id = 1`。

**原因：** 两张表都声明了同名列，MySQL 无法判断引用哪一张表。

**后果：** 查询报告列歧义，或者维护者无法从 SQL 看出字段职责。

**错误示例：**

```sql
SELECT public_id
FROM projects AS p
INNER JOIN tasks AS t ON t.project_id = p.id;
```

**正确写法：**

```sql
SELECT p.public_id AS project_id, t.public_id AS task_id
FROM projects AS p
INNER JOIN tasks AS t ON t.project_id = p.id;
```

**影响版本：** MySQL 8.4；只要当前查询块存在歧义就会触发。

**验证方式：** 运行错误版确认得到 `Column 'public_id' in field list is ambiguous`，再运行正确版观察两列职责。

### 在 WHERE 中过滤 LEFT JOIN 的右表

**触发条件：** 目标是保留所有项目并只匹配 DONE 任务，却把状态条件写到 WHERE。

**原因：** 无匹配项目的右表列被补为 NULL，`NULL = 'DONE'` 得到 UNKNOWN，随后被 WHERE 移除。

**后果：** 没有 DONE 任务的项目消失，查询悄悄回答成“哪些项目拥有 DONE 任务”。

**错误示例：**

```sql
SELECT p.public_id, t.public_id
FROM projects AS p
LEFT JOIN tasks AS t ON t.project_id = p.id
WHERE t.status = 'DONE';
```

**正确写法：**

```sql
SELECT p.public_id, t.public_id
FROM projects AS p
LEFT JOIN tasks AS t
  ON t.project_id = p.id
 AND t.status = 'DONE';
```

**影响版本：** MySQL 8.4；成立条件是 WHERE 中的右表条件会拒绝补空行。

**验证方式：** 按 `p.public_id, t.public_id` 排序运行两版；错误版只有两个项目，正确版保留四个项目。

### 用 COUNT(*) 统计 LEFT JOIN 的子资源

**触发条件：** 在项目 LEFT JOIN 任务后，用 `COUNT(*)` 作为任务数量。

**原因：** 没有任务的项目仍有一条外连接补空结果，COUNT(*) 会统计这条结果行。

**后果：** `PRJ-4` 被报告为有一个任务，零值统计失真。

**错误示例：**

```sql
SELECT p.public_id, COUNT(*) AS task_count
FROM projects AS p
LEFT JOIN tasks AS t ON t.project_id = p.id
GROUP BY p.id, p.public_id;
```

**正确写法：**

```sql
SELECT p.public_id, COUNT(t.id) AS task_count
FROM projects AS p
LEFT JOIN tasks AS t ON t.project_id = p.id
GROUP BY p.id, p.public_id;
```

**影响版本：** MySQL 8.4；由 COUNT 与外连接结果共同决定。

**验证方式：** 比较 `PRJ-4` 的两版结果，前者为 1，后者为 0。

### 在 WHERE 中引用结果别名或聚合值

**触发条件：** 定义 `COUNT(t.id) AS task_count` 后写 `WHERE task_count >= 2`。

**原因：** WHERE 筛选原始行时，分组、聚合和 SELECT 结果别名都尚未形成。

**后果：** MySQL 报 1054，查询无法执行。

**错误示例：**

```sql
SELECT p.public_id AS project_id, COUNT(t.id) AS task_count
FROM projects AS p
LEFT JOIN tasks AS t ON t.project_id = p.id
WHERE task_count >= 2
GROUP BY p.id, p.public_id;
```

**正确写法：**

```sql
SELECT p.public_id AS project_id, COUNT(t.id) AS task_count
FROM projects AS p
LEFT JOIN tasks AS t ON t.project_id = p.id
GROUP BY p.id, p.public_id
HAVING task_count >= 2;
```

**影响版本：** MySQL 8.4；MySQL 允许别名用于 HAVING，但不允许用于 WHERE。

**验证方式：** 错误版应报告 `Unknown column 'task_count' in 'where clause'`，正确版返回 `PRJ-1` 与 `PRJ-3`。

### 为绕过 1055 关闭 ONLY_FULL_GROUP_BY

**触发条件：** 按 `team_id` 分组却投影任意项目名称，看到 1055 后准备关闭默认 SQL mode。

**原因：** 一个团队可以有多个项目，`team_id` 不能唯一决定某个 `name`；关闭模式只让服务器从组内任取值。

**后果：** 查询虽然执行，但项目名称没有稳定含义，最终 ORDER BY 也不能修复已经任取的组内值。

**错误示例：**

```sql
SELECT team_id, name, COUNT(*)
FROM projects
GROUP BY team_id;
```

**正确写法：**

```sql
SELECT team_id, COUNT(*) AS project_count
FROM projects
GROUP BY team_id;
```

**影响版本：** MySQL 8.4 默认启用 ONLY_FULL_GROUP_BY。

**验证方式：** 确认错误版得到 1055；保留默认模式并运行正确版，TEAM-1 与 TEAM-2 的项目数都为 2。

### 使用非唯一排序键后直接 LIMIT

**触发条件：** 只按任务状态排序，随后用 LIMIT 取得前三行。

**原因：** 多个任务拥有相同状态，它们在全部排序列上并列，相对顺序未定义。

**后果：** 执行计划或数据变化后，LIMIT 可能截取另一条并列任务，接口结果不稳定。

**错误示例：**

```sql
SELECT public_id, status
FROM tasks
ORDER BY status
LIMIT 3;
```

**正确写法：**

```sql
SELECT public_id, status
FROM tasks
ORDER BY status, public_id
LIMIT 3;
```

**影响版本：** MySQL 8.4；LIMIT 可以影响执行计划，但并列顺序本来就没有合同。

**验证方式：** 错误版只核对状态分段，不断言同状态 ID；正确版必须依次得到 `TASK-2`、`TASK-5`、`TASK-3`。
:::

## 八、独立完成团队查询

:::exercise
### 查询任务较少的团队

**要求：** 基于完整 Demo 数据，为每个团队返回 `team_id`、`team_name`、`task_count` 和 `latest_due_at`。必须保留没有项目的团队，只保留任务数不超过 2 的组，按任务数降序、团队公开 ID 升序排列，并用单参数 LIMIT 取得前 2 行。只能使用本课已讲的 SELECT、LEFT JOIN、聚合、GROUP BY、HAVING、ORDER BY 和 LIMIT。

**验收：** 结果必须先返回 `TEAM-2`，其 `task_count=2`、最新截止时间为 `2026-08-25 03:00:00.000000`；再返回 `TEAM-3`，其 `task_count=0`、`latest_due_at=NULL`。`TEAM-1` 因任务数为 3 被 HAVING 移除；查询不得把补空行计作任务，也不得依赖未声明顺序。
:::

### 1. 参考实现

把下面内容保存为 `team-query-exercise.sql`：

```sql
USE teamflow_model_demo;

SELECT
    te.public_id AS team_id,
    te.name AS team_name,
    COUNT(t.id) AS task_count,
    MAX(t.due_at_utc) AS latest_due_at
FROM teams AS te
LEFT JOIN projects AS p ON p.team_id = te.id
LEFT JOIN tasks AS t ON t.project_id = p.id
GROUP BY te.id, te.public_id, te.name
HAVING task_count <= 2
ORDER BY task_count DESC, te.public_id ASC
LIMIT 2;
```

### 2. 运行结果

在完整 Demo 容器仍运行时执行：

```shell
docker exec -i mysql02-query-demo \
  mysql -uroot -plocal-query-pass < team-query-exercise.sql
```

结果为：

```text
+---------+--------------+------------+----------------------------+
| team_id | team_name    | task_count | latest_due_at              |
+---------+--------------+------------+----------------------------+
| TEAM-2  | 交付保障组   |          2 | 2026-08-25 03:00:00.000000 |
| TEAM-3  | 无项目组     |          0 | NULL                       |
+---------+--------------+------------+----------------------------+
```

两次 `LEFT JOIN` 让 `TEAM-3` 仍进入分组，`COUNT(t.id)` 忽略任务键上的补空值，`MAX` 在没有非空截止时间时
返回 `NULL`。`HAVING` 筛选已经形成的团队组，最后的两个排序键让 `LIMIT 2` 截取可预测结果。

练习验证完成后停止并删除本次容器。删除容器不会删除你保存的四个 SQL 文件：

```shell
docker stop mysql02-query-demo
docker rm mysql02-query-demo
```

## 九、本课小结

- SELECT 列表是结果合同，表别名定位来源，列别名只命名当前结果。
- WHERE 只保留 TRUE；NULL 比较产生 UNKNOWN，判断缺失值要使用 IS NULL 或 IS NOT NULL。
- INNER JOIN 只保留匹配组合，LEFT JOIN 还保留没有子记录的左表资源。
- ON 决定怎样匹配，WHERE 决定最终保留哪些行；条件位置必须跟业务问题一致。
- COUNT(*) 数结果行，COUNT(column) 数非 NULL 值，外连接统计子资源时要选择正确表达式。
- GROUP BY 形成组，HAVING 筛选组；ONLY_FULL_GROUP_BY 帮助拒绝含义不确定的非聚合列。
- GROUP BY、主键扫描和插入顺序都不提供输出顺序，只有 ORDER BY 建立排序合同。
- 并列排序追加唯一键，LIMIT 才能稳定截取前几行；分页与动态筛选留给后续课程。
