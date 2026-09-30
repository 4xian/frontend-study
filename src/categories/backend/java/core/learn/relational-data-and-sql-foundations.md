---
id: backend.java.learn.intermediate.relational-data-and-sql-foundations
type: lesson
title: 关系数据建模
summary: 把 TeamFlow 的用户、团队、成员、项目与任务拆成职责清楚的 MySQL 表，并用键和约束守住数据关系
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 150
prerequisites:
  - backend.java.learn.intermediate.project-and-task-api-project
objectives:
  - 能从业务事实中识别实体、属性和关系，不把接口 JSON 原样塞进一张宽表。
  - 能区分内部主键、公开 ID 与业务唯一值，并为不同职责选择对应约束。
  - 能用 NOT NULL、UNIQUE 与 CHECK 表达数据库能够独立判断的数据规则。
  - 能把一对多关系落实为子表外键，并解释外键列为何必须与被引用列类型一致。
  - 能用关联表表达多对多关系，同时避免在单列中保存逗号分隔 ID。
  - 能根据业务生命周期选择 RESTRICT、CASCADE 或 SET NULL，而不是机械使用级联删除。
  - 能为 TeamFlow 的字符串、状态、时间与标识选择符合公开合同的 MySQL 8.4 类型。
  - 能在 MySQL 8.4 中运行完整建表脚本，并用真实失败验证关键约束。
recap:
  - 数据模型先描述业务事实，再决定表、列和约束；接口对象与数据库表不要求一一对应。
  - 主键负责稳定识别一行，公开 ID 负责 API 身份，业务唯一值由独立 UNIQUE 约束表达。
  - NOT NULL、UNIQUE、CHECK 与外键分别处理必填、唯一、行内规则和跨表引用完整性。
  - 一对多把父表主键放到子表；多对多使用关联表，并让两个外键共同组成唯一身份。
  - 外键的类型、大小和符号必须匹配，删除动作必须来自业务生命周期决策。
  - DATETIME 不携带时区；带偏移的 API 时间进入数据库前要先按应用合同规范化。
  - 数据库约束是最终一致性防线，应用校验仍负责更早、更友好的错误反馈。
related:
  - backend.java.learn.intermediate.project-and-task-api-project
tags:
  - MySQL
  - 关系数据库
  - 数据建模
  - 主键
  - 外键
  - 数据约束
appliesTo: MySQL 8.4 LTS、InnoDB 与 utf8mb4；本课不包含 Java API，因此没有 JDK 25 与 Java 8 代码差异
verifiedAt: 2026-08-20
sources:
  - id: mysql84-create-table
    title: MySQL 8.4 Reference Manual - CREATE TABLE Statement
    url: https://dev.mysql.com/doc/refman/8.4/en/create-table.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - CREATE TABLE 的列、主键、唯一键、外键与 CHECK 约束语法
      - InnoDB 二级索引包含主键列，因此主键长度会影响其他索引
  - id: mysql84-foreign-keys
    title: MySQL 8.4 Reference Manual - FOREIGN KEY Constraints
    url: https://dev.mysql.com/doc/refman/8.4/en/create-table-foreign-keys.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4、InnoDB
    claims:
      - 外键列与被引用列的类型匹配、索引和引用完整性要求
      - RESTRICT、CASCADE、SET NULL 与 NO ACTION 的 MySQL 行为
  - id: mysql84-check-constraints
    title: MySQL 8.4 Reference Manual - CHECK Constraints
    url: https://dev.mysql.com/doc/refman/8.4/en/create-table-check-constraints.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - CHECK 约束的定义位置、命名范围和写入时检查行为
  - id: mysql84-data-types
    title: MySQL 8.4 Reference Manual - Data Types
    url: https://dev.mysql.com/doc/refman/8.4/en/data-types.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - MySQL 数字、字符串和日期时间类型的分类与精度含义
  - id: mysql84-integer-types
    title: MySQL 8.4 Reference Manual - Integer Types
    url: https://dev.mysql.com/doc/refman/8.4/en/integer-types.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - INT、BIGINT 与 UNSIGNED 的存储大小和值域
  - id: mysql84-char-varchar
    title: MySQL 8.4 Reference Manual - The CHAR and VARCHAR Types
    url: https://dev.mysql.com/doc/refman/8.4/en/char.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - CHAR 与 VARCHAR 的存储、长度和字符集边界
      - 字符串比较与唯一性会受到排序规则影响
  - id: mysql84-date-time
    title: MySQL 8.4 Reference Manual - The DATE, DATETIME, and TIMESTAMP Types
    url: https://dev.mysql.com/doc/refman/8.4/en/datetime.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - DATE、DATETIME 与 TIMESTAMP 的用途、范围和小数秒精度
  - id: planetscale-schema-design-101
    title: Database schema design 101 for relational databases
    url: https://planetscale.com/blog/schema-design-101-relational-databases
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: 关系数据库建模工作流；具体 MySQL 约束以 8.4 官方文档为准
    claims:
      - 先理解业务需求，再识别实体、属性和关系的建模步骤
---

# 关系数据建模

上一课的 TeamFlow API 已经能在内存中管理用户、团队、项目和任务。进程一旦退出，那些对象就会消失；
下一阶段需要把同样的业务事实交给 MySQL 保存。真正开始写查询或接入 MyBatis 前，必须先回答一个更基础的
问题：哪些事实应该放在同一张表里，哪些关系需要由数据库长期维护？

本课只建立关系模型和建表脚本。你会把现有 API 合同映射为五张表，用主键、唯一约束、检查约束和外键
守住数据边界。`SELECT`、数据库迁移、MyBatis、分页、事务和索引调优都有独立课程，本课不提前展开。

## 一、从业务事实得到表

### 1. 先识别实体、属性和关系

关系建模不是先打开编辑器写 `CREATE TABLE`，而是先整理业务中的三类信息：

- **实体**是需要独立保存和识别的对象，例如 User、Team、TeamMember、Project 和 Task。
- **属性**描述一个实体，例如用户邮箱、项目名称和任务状态。
- **关系**说明实体怎样关联，例如一个项目属于一个团队，一个任务属于一个项目。

**社区补充：** PlanetScale 的关系建模教程建议从业务需求出发，依次识别实体、属性和关系。这个步骤适合
所有关系数据库；本课采用它组织 TeamFlow 模型，但主键、外键和约束的具体行为已经用 MySQL 8.4 官方文档
重新核验。

把上一课的公开资源列出来，可以先得到下面的事实表：

| 实体 | 自身属性 | 关系属性 |
| --- | --- | --- |
| User | 公开 ID、显示名、邮箱 | 可以通过 TeamMember 加入多个 Team |
| Team | 公开 ID、团队名 | 可以拥有多个 TeamMember 和 Project |
| TeamMember | 公开 ID、角色 | 必须分别引用一个 Team 和一个 User |
| Project | 公开 ID、项目名 | 必须属于一个 Team |
| Task | 公开 ID、标题、状态、截止时间、负责人 | 必须属于一个 Project |

成员关系来自前置 API 的添加、查询和移除合同，不是凭表名猜出来的。`TeamMember` 拥有 `MBR-*` 身份和
`role`，并引用已经存在的用户与团队；同一用户在同一团队只能出现一次。任务负责人仍是普通文本，而不是
用户 ID，因此数据库模型不能把 `assignee` 自行改成用户外键。

### 2. 一张表只维护一类事实

假设把所有字段塞进一张 `task_details` 表：

```sql
CREATE TABLE task_details (
    task_public_id VARCHAR(32) NOT NULL,
    task_title VARCHAR(120) NOT NULL,
    project_public_id VARCHAR(32) NOT NULL,
    project_name VARCHAR(80) NOT NULL,
    team_public_id VARCHAR(32) NOT NULL,
    team_name VARCHAR(60) NOT NULL
);
```

同一个项目有十个任务时，项目名和团队名就重复十次。团队改名必须更新许多行，漏掉一行便会出现两个
互相冲突的团队名。删除最后一个任务还可能顺带丢掉项目事实。

拆分后，每类事实只有一个维护位置：

```text
users 1 ---- n team_members n ---- 1 teams 1 ---- n projects 1 ---- n tasks

assignee 仍按公开合同保存为文本
```

这不是为了追求表数量，而是让每次写入只改变它真正拥有的事实。项目表保存团队引用，不再复制团队名；
任务表保存项目引用，不再复制项目名和团队名；成员表只保存关系身份、角色和两端引用，不复制用户姓名。

### 3. 表模型不必复制接口 JSON

API 返回的 `ProjectResponse` 包含 `id`、`teamId` 和 `name`，数据库可以同时拥有内部数字主键和公开字符串
ID：

```sql
CREATE TABLE projects (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id VARCHAR(32) NOT NULL,
    team_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(80) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_projects_public_id (public_id)
);
```

`id` 是表内和外键使用的短小稳定身份，`public_id` 对应 API 中的 `PRJ-1`。应用读取时可以把
`public_id` 映射回响应字段 `id`。这样没有改变公开 JSON，只是让数据库内部关系不依赖展示格式。

## 二、用键和约束表达规则

### 1. 主键、公开 ID 与业务唯一值各负其责

三种看起来都“唯一”的值，职责并不相同：

| 值 | 例子 | 数据库职责 |
| --- | --- | --- |
| 内部主键 | `users.id = 1` | 永久识别一行，并被其他表引用 |
| 公开 ID | `users.public_id = 'USR-1'` | 保持 API 身份稳定，不暴露内部关联方式 |
| 业务唯一值 | `users.email` | 阻止两名用户占用同一规范化邮箱 |

对应定义如下：

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id VARCHAR(32) NOT NULL,
    display_name VARCHAR(40) NOT NULL,
    email VARCHAR(120) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_public_id (public_id),
    UNIQUE KEY uq_users_email (email)
);
```

主键隐含唯一且非空，一张表只能有一个主键。公开 ID 和邮箱不能再声明成第二个主键，它们使用各自的
`UNIQUE` 约束。邮箱可能需要规范化和大小写策略；本课使用数据库默认的大小写不敏感排序规则做演示，
生产合同仍应明确应用怎样规范化邮箱。

### 2. 三类列约束解决不同问题

`NOT NULL`、`UNIQUE` 和 `CHECK` 不能互相替代：

```sql
status VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
email VARCHAR(120) NOT NULL,
UNIQUE KEY uq_users_email (email),
CONSTRAINT chk_tasks_status
    CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE'))
```

- `NOT NULL` 只禁止缺失值，不会禁止空字符串或纯空白文本。
- `UNIQUE` 禁止重复的非空键值，但是否允许 `NULL` 由数据库产品规则决定。
- `CHECK` 判断当前行是否满足布尔条件，适合有限状态和行内范围规则。

数据库默认的 `utf8mb4_0900_ai_ci` 不区分大小写，直接检查普通 `VARCHAR` 会把 `todo` 当成 `TODO`。
状态只使用 ASCII 标记，因此本课给状态列单独指定 `ascii_bin`；唯一值检查便会严格区分大小写。

若公开请求要求名称 `NotBlank`，数据库可以用最小检查守住同一核心事实：

```sql
CONSTRAINT chk_projects_name_not_blank
    CHECK (CHAR_LENGTH(TRIM(name)) > 0)
```

数据库约束负责拒绝最终无效状态，应用校验仍然有价值：它能在执行 SQL 前返回字段级错误和稳定 API
错误码。两层校验不是重复劳动，而是分别服务用户反馈与数据完整性。

### 3. 外键维护跨表引用完整性

项目属于团队，外键因此定义在子表 `projects`：

```sql
team_id BIGINT UNSIGNED NOT NULL,
KEY idx_projects_team_id (team_id),
CONSTRAINT fk_projects_team
    FOREIGN KEY (team_id)
    REFERENCES teams (id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT
```

数据库会拒绝不存在的 `team_id`，也会在仍有项目引用团队时拒绝删除该团队。`projects.team_id` 与
`teams.id` 都是 `BIGINT UNSIGNED`；如果一边漏掉 `UNSIGNED`，MySQL 会把外键判为类型不兼容。

MySQL 要求外键列和被引用键具备可用索引。InnoDB 可以自动创建缺失的子表索引，本课仍显式写出
`idx_projects_team_id`，让关系和后续查询入口清楚可见。这不等于已经完成索引调优，真实查询是否需要
其他索引要等后续课程结合执行计划判断。

## 三、把关系落实为外键

### 1. 一对多把父键放在“多”的一侧

一个团队可以拥有多个项目，但每个项目只属于一个团队，所以 `team_id` 放在项目表。一个项目可以拥有
多个任务，但每个任务只属于一个项目，所以 `project_id` 放在任务表：

```sql
CREATE TABLE tasks (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id VARCHAR(32) NOT NULL,
    project_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(120) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_tasks_public_id (public_id),
    KEY idx_tasks_project_id (project_id),
    CONSTRAINT fk_tasks_project
        FOREIGN KEY (project_id)
        REFERENCES projects (id)
        ON DELETE RESTRICT
);
```

不要反过来在 `projects` 中增加 `task_ids VARCHAR(500)`。逗号分隔文本无法让数据库逐个检查任务是否
存在，也无法保证一个任务只属于一个项目。

### 2. 多对多使用关联表

TeamFlow 已经允许一个用户加入多个团队，也允许一个团队拥有多个用户。这个多对多关系使用
`team_members` 关联表；它还是拥有 `MBR-*` 公开 ID 与角色的 API 资源，因此不能只用两个外键凑成匿名行：

```sql
CREATE TABLE team_members (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id VARCHAR(32) NOT NULL,
    team_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    role VARCHAR(30) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_team_members_public_id (public_id),
    UNIQUE KEY uq_team_members_team_user (team_id, user_id),
    CONSTRAINT fk_team_members_team
        FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE RESTRICT,
    CONSTRAINT fk_team_members_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT
);
```

内部 `id` 供数据库引用，`public_id` 对应成员 URL，组合唯一键阻止同一用户重复加入同一团队。移除成员的
API 直接删除这一行；用户和团队删除尚未开放，因此两个父外键都用 `RESTRICT`，不能把父资源删除偷换成
级联删除成员。

### 3. 删除动作是业务决策

外键可以声明不同引用动作：

| 动作 | 父行删除时的结果 | 成立条件 |
| --- | --- | --- |
| `RESTRICT` | 有子行就拒绝删除 | 子资源需要先显式处理，或父资源不允许删除 |
| `CASCADE` | 自动删除关联子行 | 子行没有独立生命周期，且删除传播符合业务合同 |
| `SET NULL` | 保留子行并清空外键 | 子表外键允许 `NULL`，且“无归属”是合法状态 |

前置 API 允许直接移除成员关系，但没有用户、团队和项目删除端点，本课不能凭空增加父资源删除语义。
因此正式 schema 对成员的两端引用以及 `teams -> projects -> tasks` 都使用 `RESTRICT`。等后续 API 真正
引入父资源删除能力时，再一起评审状态码、审计、事务和引用动作。

`NO ACTION` 在 InnoDB 中与 `RESTRICT` 一样立即检查，不是“提交事务时再检查”。看到其他数据库支持延迟
约束时，不能把那套行为直接套到 MySQL 8.4。

## 四、选择能表达业务含义的类型

### 1. 标识、名称和金额不是同一种字符串

本课使用 `BIGINT UNSIGNED` 作为内部主键。它提供足够大的非负范围；`AUTO_INCREMENT` 只负责生成内部
值，不对外承诺连续，也不应该被页面拿来推算数据量。

公开 ID、名称和邮箱使用不同长度的 `VARCHAR`：

```sql
public_id VARCHAR(32) NOT NULL,
display_name VARCHAR(40) NOT NULL,
email VARCHAR(120) NOT NULL
```

长度来自上一课已经冻结的 API 约束，而不是随手填写。`VARCHAR(120)` 表示字符上限，实际行大小还受
`utf8mb4` 每字符字节数和整行限制影响。定长 `CHAR` 适合真正固定长度的值，不应因为“可能更快”就拿来
保存长短不一的名称。

金额应使用精确的 `DECIMAL(precision, scale)`，不能使用近似浮点数；不过当前五类资源没有金额字段，
正式 schema 不添加尚不存在的列。

### 2. 有限状态用文本与 CHECK 共同约束

任务状态沿用 API 的三个公开字面量：

```sql
status VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'TODO',
CONSTRAINT chk_tasks_status
    CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE'))
```

使用 `VARCHAR + CHECK` 让允许值在 schema 中可见，也避免数据库枚举类型把后续状态演进绑定到一套特殊
修改流程。`ascii_bin` 让 `todo`、`Todo` 与 `TODO` 成为不同值；`DEFAULT 'TODO'` 只在 INSERT 省略该列时
生效，不会修复显式传入的非法状态。

MySQL 的 `BOOLEAN` 实际是 `TINYINT(1)` 的同义写法。如果业务状态将来只有真和假，仍要先定义 0、1 与
`NULL` 的含义；本课任务状态显然有三个值，不适合压成布尔列。

### 3. 日期时间类型不保存 OffsetDateTime 的偏移

上一课接收 `2026-08-22T18:00:00+08:00` 这样的带偏移时间。MySQL `DATETIME` 保存日期和墙上时钟值，
本身不携带时区或 UTC 偏移；`TIMESTAMP` 会按会话时区转换，而且 8.4 文档给出的范围只到 2038 年。

本课采用下面的存储合同：

```sql
due_at_utc DATETIME(6) NOT NULL,
created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
```

应用在写入前把 OffsetDateTime 转成 UTC，再去掉偏移存入 `due_at_utc`；读取时按公开 API 约定重新附加
偏移。列名中的 `_utc` 是这份跨层合同的一部分。MySQL 不能只靠 `DATETIME` 类型验证应用是否真的做了
UTC 规范化，后续持久化课程必须在映射层复核。

## 五、完成 TeamFlow 建模 Demo

### 1. 固定五张表的职责

最终模型只保存上一课已经存在的字段：

| 表 | 拥有的事实 | 外键 |
| --- | --- | --- |
| `users` | 公开 ID、显示名、邮箱、创建时间 | 无 |
| `teams` | 公开 ID、团队名、创建时间 | 无 |
| `team_members` | 公开 ID、角色、创建时间 | `team_id -> teams.id`、`user_id -> users.id` |
| `projects` | 公开 ID、所属团队、项目名、创建时间 | `team_id -> teams.id` |
| `tasks` | 公开 ID、所属项目、标题、状态、UTC 截止时间、负责人、创建时间 | `project_id -> projects.id` |

`assignee` 仍是 `VARCHAR(40)`。只有当公开合同把它改成稳定用户 ID，并定义用户删除时任务怎么办，才适合
把它改成 `user_id` 外键。

### 2. 编写完整 schema

把下面内容保存为 `schema.sql`。脚本只会重建专用的 `teamflow_model_demo` 数据库，不能把数据库名替换成
真实环境后直接运行。

```sql
DROP DATABASE IF EXISTS teamflow_model_demo;
CREATE DATABASE teamflow_model_demo
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;
USE teamflow_model_demo;

CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id VARCHAR(32) NOT NULL,
    display_name VARCHAR(40) NOT NULL,
    email VARCHAR(120) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_public_id (public_id),
    UNIQUE KEY uq_users_email (email),
    CONSTRAINT chk_users_display_name_not_blank
        CHECK (CHAR_LENGTH(TRIM(display_name)) > 0),
    CONSTRAINT chk_users_email_not_blank
        CHECK (CHAR_LENGTH(TRIM(email)) > 0)
) ENGINE = InnoDB;

CREATE TABLE teams (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id VARCHAR(32) NOT NULL,
    name VARCHAR(60) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_teams_public_id (public_id),
    CONSTRAINT chk_teams_name_not_blank
        CHECK (CHAR_LENGTH(TRIM(name)) > 0)
) ENGINE = InnoDB;

CREATE TABLE team_members (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id VARCHAR(32) NOT NULL,
    team_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    role VARCHAR(30) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_team_members_public_id (public_id),
    UNIQUE KEY uq_team_members_team_user (team_id, user_id),
    KEY idx_team_members_user_id (user_id),
    CONSTRAINT chk_team_members_role_not_blank
        CHECK (CHAR_LENGTH(TRIM(role)) > 0),
    CONSTRAINT fk_team_members_team
        FOREIGN KEY (team_id)
        REFERENCES teams (id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,
    CONSTRAINT fk_team_members_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE TABLE projects (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id VARCHAR(32) NOT NULL,
    team_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(80) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_projects_public_id (public_id),
    KEY idx_projects_team_id (team_id),
    CONSTRAINT chk_projects_name_not_blank
        CHECK (CHAR_LENGTH(TRIM(name)) > 0),
    CONSTRAINT fk_projects_team
        FOREIGN KEY (team_id)
        REFERENCES teams (id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE TABLE tasks (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id VARCHAR(32) NOT NULL,
    project_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(120) NOT NULL,
    status VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'TODO',
    due_at_utc DATETIME(6) NOT NULL,
    assignee VARCHAR(40) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_tasks_public_id (public_id),
    KEY idx_tasks_project_id (project_id),
    CONSTRAINT chk_tasks_title_not_blank
        CHECK (CHAR_LENGTH(TRIM(title)) > 0),
    CONSTRAINT chk_tasks_status
        CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE')),
    CONSTRAINT chk_tasks_assignee_not_blank
        CHECK (CHAR_LENGTH(TRIM(assignee)) > 0),
    CONSTRAINT fk_tasks_project
        FOREIGN KEY (project_id)
        REFERENCES projects (id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
) ENGINE = InnoDB;

INSERT INTO users (public_id, display_name, email)
VALUES ('USR-1', '周宁', 'zhou@example.com');

INSERT INTO teams (public_id, name)
VALUES ('TEAM-1', '课程平台组');

INSERT INTO team_members (public_id, team_id, user_id, role)
VALUES ('MBR-1', 1, 1, 'Designer');

INSERT INTO projects (public_id, team_id, name)
VALUES ('PRJ-1', 1, '课程平台');

INSERT INTO tasks (
    public_id,
    project_id,
    title,
    status,
    due_at_utc,
    assignee
)
VALUES (
    'TASK-1',
    1,
    '补齐课程目录',
    'TODO',
    '2026-08-22 10:00:00.000000',
    'lin'
);

SHOW TABLES;
SHOW CREATE TABLE team_members;
SHOW CREATE TABLE tasks;
```

建表顺序从无外键的父表开始，再到依赖它们的子表。插入顺序也一样：用户与团队必须先存在，成员才能
引用它们；团队必须先存在，项目才能引用它；项目必须先存在，任务才能引用它。

### 3. 在 MySQL 8.4 中复跑

下面密码只用于一次性本机容器，不能作为真实环境凭据：

```bash
docker run --name teamflow-mysql-model \
  -e MYSQL_ROOT_PASSWORD=local-model-pass \
  -d mysql:8.4

until docker exec teamflow-mysql-model \
  mysql -uroot -plocal-model-pass -e 'SELECT 1' >/dev/null 2>&1; do
  sleep 1
done

docker exec -i teamflow-mysql-model \
  mysql -uroot -plocal-model-pass < schema.sql
```

`SHOW TABLES` 的核心结果应为：

```text
Tables_in_teamflow_model_demo
projects
tasks
team_members
teams
users
```

随后运行失败样本，分别观察数据库而不是应用代码拒绝数据：

```bash
docker exec teamflow-mysql-model mysql -uroot -plocal-model-pass \
  -e "USE teamflow_model_demo;
      INSERT INTO users (public_id, display_name, email)
      VALUES ('USR-2', '林澄', 'zhou@example.com');"

docker exec teamflow-mysql-model mysql -uroot -plocal-model-pass \
  -e "USE teamflow_model_demo;
      INSERT INTO team_members (public_id, team_id, user_id, role)
      VALUES ('MBR-2', 1, 1, 'Developer');"

docker exec teamflow-mysql-model mysql -uroot -plocal-model-pass \
  -e "USE teamflow_model_demo;
      INSERT INTO team_members (public_id, team_id, user_id, role)
      VALUES ('MBR-3', 1, 999, 'Developer');"

docker exec teamflow-mysql-model mysql -uroot -plocal-model-pass \
  -e "USE teamflow_model_demo;
      INSERT INTO projects (public_id, team_id, name)
      VALUES ('PRJ-9', 999, '不存在的团队项目');"

docker exec teamflow-mysql-model mysql -uroot -plocal-model-pass \
  -e "USE teamflow_model_demo;
      INSERT INTO tasks
          (public_id, project_id, title, status, due_at_utc, assignee)
      VALUES
          ('TASK-9', 1, '大小写错误状态', 'todo', '2026-08-22 10:00:00', 'lin');"

docker exec teamflow-mysql-model mysql -uroot -plocal-model-pass \
  -e "USE teamflow_model_demo; DELETE FROM users WHERE id = 1;"

docker exec teamflow-mysql-model mysql -uroot -plocal-model-pass \
  -e "USE teamflow_model_demo;
      INSERT INTO teams (public_id, name) VALUES ('TEAM-DELETE', '删除约束验证组');
      INSERT INTO team_members (public_id, team_id, user_id, role)
      VALUES ('MBR-DELETE', 2, 1, 'Reviewer');
      DELETE FROM teams WHERE public_id = 'TEAM-DELETE';"
```

预期依次出现邮箱重复、成员关系重复、成员用户不存在、项目团队不存在、状态大小写错误和父用户仍被成员
引用，最后一个样本还会拒绝删除仍有成员的隔离团队。错误编号和完整文本可能包含容器生成的细节，稳定
验收点依次是 `uq_users_email`、
`uq_team_members_team_user`、`fk_team_members_user`、`fk_projects_team`、`chk_tasks_status` 与
`fk_team_members_user`、`fk_team_members_team`。

验证完毕后停止并删除这个精确命名的临时容器：

```bash
docker stop teamflow-mysql-model
docker rm teamflow-mysql-model
```

## 六、识别典型建模错误

:::pitfalls
### 错误：把不同实体压进一张宽表

**触发条件：** 每条任务行都重复保存项目名和团队名，并把它当作关系。

**原因：** 一行同时拥有任务、项目和团队三类独立事实，没有稳定外键指向单一事实来源。

**后果：** 改名需要更新多行，部分成功会产生矛盾数据；删除任务还可能丢失项目信息。

**错误示例：**

```sql
CREATE TABLE task_details (
    task_id VARCHAR(32) PRIMARY KEY,
    task_title VARCHAR(120) NOT NULL,
    project_name VARCHAR(80) NOT NULL,
    team_name VARCHAR(60) NOT NULL
);
```

**正确写法：**

```sql
CREATE TABLE tasks (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(120) NOT NULL,
    CONSTRAINT fk_tasks_project
        FOREIGN KEY (project_id) REFERENCES projects (id)
);
```

**验证方式：** 为同一项目准备两项任务并模拟项目改名；正确模型只需更新一行项目，两个任务继续引用同一
项目 ID。

### 错误：使用可变业务字段作为主键

**触发条件：** 直接把邮箱或项目名称声明为主键，并让其他表引用它。

**原因：** 邮箱和名称会因业务操作变化，且可能包含敏感或较长文本；主键却应短小、稳定并只负责身份。

**后果：** 普通资料修改会传播到外键，二级索引还会复制更长的 InnoDB 主键。

**错误示例：**

```sql
CREATE TABLE users (
    email VARCHAR(120) PRIMARY KEY,
    display_name VARCHAR(40) NOT NULL
);
```

**正确写法：**

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    public_id VARCHAR(32) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    display_name VARCHAR(40) NOT NULL
);
```

**验证方式：** 修改邮箱后检查内部 `id` 不变；其他表只引用 `id`，不需要同步更新引用列。

### 错误：只写同名列，不建立外键

**触发条件：** `projects` 有 `team_id`，却没有 `FOREIGN KEY`；应用先查团队存在再插入项目。

**原因：** 列名只是约定，不能让数据库验证引用；应用的“先检查、后写入”还可能被并发和其他写入入口绕过。

**后果：** 项目可以指向不存在的团队，形成无法可靠联接和清理的孤儿数据。

**错误示例：**

```sql
team_id BIGINT UNSIGNED NOT NULL
```

**正确写法：**

```sql
team_id BIGINT UNSIGNED NOT NULL,
CONSTRAINT fk_projects_team
    FOREIGN KEY (team_id) REFERENCES teams (id)
```

**验证方式：** 插入 `team_id = 999` 的项目；正确模型必须由 MySQL 返回外键失败，表中不能留下该行。

### 错误：外键两端使用不兼容类型

**触发条件：** 父表主键是 `BIGINT UNSIGNED`，子表外键却写成有符号 `BIGINT` 或 `INT`。

**原因：** MySQL 要求固定精度数字外键在大小和符号上匹配，避免两个列拥有不同值域。

**后果：** `CREATE TABLE` 或 `ALTER TABLE` 无法建立外键，应用以为存在的完整性保护实际没有生效。

**错误示例：**

```sql
CREATE TABLE projects (
    id BIGINT UNSIGNED PRIMARY KEY
);
CREATE TABLE tasks (
    project_id BIGINT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects (id)
);
```

**正确写法：**

```sql
CREATE TABLE tasks (
    project_id BIGINT UNSIGNED NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects (id)
);
```

**验证方式：** 在 MySQL 8.4 中分别运行两组 DDL；错误版必须无法创建外键，正确版能够建表并拒绝不存在的
项目 ID。

### 错误：用级联删除代替生命周期设计

**触发条件：** 为了“省得手工删子表”，给所有外键统一添加 `ON DELETE CASCADE`。

**原因：** CASCADE 会把一次父行删除扩展成更多数据删除，但代码评审时不一定能直接看到影响范围。

**后果：** 删除团队可能连带删除项目和任务，与尚未定义的公开 API、审计和恢复合同冲突。

**错误示例：**

```sql
FOREIGN KEY (team_id) REFERENCES teams (id)
    ON DELETE CASCADE
```

**正确写法：**

```sql
FOREIGN KEY (team_id) REFERENCES teams (id)
    ON DELETE RESTRICT
```

**验证方式：** 准备一个拥有项目的团队后删除团队；当前合同下正确模型必须拒绝删除，并保留团队、项目和
任务三层数据。
:::

## 七、独立完成关系模型

:::exercise
### 练习：把扁平任务记录拆成 TeamFlow 五表模型

**要求：** 从包含用户、团队、成员、项目和任务重复字段的扁平记录出发，建立 `users`、`teams`、
`team_members`、`projects`、`tasks` 五张 InnoDB 表。每张表使用内部 `BIGINT UNSIGNED` 主键和唯一公开 ID；
邮箱唯一；文本必填且不能只含空白；成员必须引用团队和用户，同一用户在同一团队只能加入一次；项目必须
引用团队，任务必须引用项目；任务状态严格限定为大写 `TODO`、`IN_PROGRESS`、`DONE`；`assignee` 保持
普通文本；父资源仍被引用时拒绝删除。不得新增项目删除或任务负责人外键等公开合同中不存在的能力。

**验收：** 完整脚本能在全新的 MySQL 8.4 实例一次执行成功；合法数据按用户、团队、成员、项目、任务顺序
写入；重复邮箱、重复成员关系、成员任一父资源不存在、空白项目名、不存在的项目 ID、小写任务状态和删除
仍被引用的用户分别失败；`SHOW CREATE TABLE` 能够看到具名约束和 InnoDB 引擎。
:::

### 1. 参考实现

下面是完整参考答案。它可以保存为 `exercise-schema.sql`，并使用本课 Demo 的同一容器命令执行：

```sql
DROP DATABASE IF EXISTS teamflow_model_exercise;
CREATE DATABASE teamflow_model_exercise
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;
USE teamflow_model_exercise;

CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id VARCHAR(32) NOT NULL,
    display_name VARCHAR(40) NOT NULL,
    email VARCHAR(120) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_ex_users_public_id (public_id),
    UNIQUE KEY uq_ex_users_email (email),
    CONSTRAINT chk_ex_users_display_name
        CHECK (CHAR_LENGTH(TRIM(display_name)) > 0),
    CONSTRAINT chk_ex_users_email
        CHECK (CHAR_LENGTH(TRIM(email)) > 0)
) ENGINE = InnoDB;

CREATE TABLE teams (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id VARCHAR(32) NOT NULL,
    name VARCHAR(60) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_ex_teams_public_id (public_id),
    CONSTRAINT chk_ex_teams_name
        CHECK (CHAR_LENGTH(TRIM(name)) > 0)
) ENGINE = InnoDB;

CREATE TABLE team_members (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id VARCHAR(32) NOT NULL,
    team_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    role VARCHAR(30) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_ex_team_members_public_id (public_id),
    UNIQUE KEY uq_ex_team_members_team_user (team_id, user_id),
    KEY idx_ex_team_members_user_id (user_id),
    CONSTRAINT chk_ex_team_members_role
        CHECK (CHAR_LENGTH(TRIM(role)) > 0),
    CONSTRAINT fk_ex_team_members_team
        FOREIGN KEY (team_id) REFERENCES teams (id)
        ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT fk_ex_team_members_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE TABLE projects (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id VARCHAR(32) NOT NULL,
    team_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(80) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_ex_projects_public_id (public_id),
    KEY idx_ex_projects_team_id (team_id),
    CONSTRAINT chk_ex_projects_name
        CHECK (CHAR_LENGTH(TRIM(name)) > 0),
    CONSTRAINT fk_ex_projects_team
        FOREIGN KEY (team_id) REFERENCES teams (id)
        ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE TABLE tasks (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id VARCHAR(32) NOT NULL,
    project_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(120) NOT NULL,
    status VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'TODO',
    due_at_utc DATETIME(6) NOT NULL,
    assignee VARCHAR(40) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_ex_tasks_public_id (public_id),
    KEY idx_ex_tasks_project_id (project_id),
    CONSTRAINT chk_ex_tasks_title
        CHECK (CHAR_LENGTH(TRIM(title)) > 0),
    CONSTRAINT chk_ex_tasks_status
        CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE')),
    CONSTRAINT chk_ex_tasks_assignee
        CHECK (CHAR_LENGTH(TRIM(assignee)) > 0),
    CONSTRAINT fk_ex_tasks_project
        FOREIGN KEY (project_id) REFERENCES projects (id)
        ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE = InnoDB;

INSERT INTO users (public_id, display_name, email)
VALUES ('USR-1', '周宁', 'zhou@example.com');

INSERT INTO teams (public_id, name)
VALUES ('TEAM-1', '课程平台组');

INSERT INTO team_members (public_id, team_id, user_id, role)
VALUES ('MBR-1', 1, 1, 'Designer');

INSERT INTO projects (public_id, team_id, name)
VALUES ('PRJ-1', 1, '课程平台');

INSERT INTO tasks (
    public_id,
    project_id,
    title,
    status,
    due_at_utc,
    assignee
)
VALUES (
    'TASK-1',
    1,
    '核对关系模型',
    'IN_PROGRESS',
    '2026-08-24 01:30:00.000000',
    'zhou'
);

SHOW TABLES;
SHOW CREATE TABLE team_members;
SHOW CREATE TABLE projects;
SHOW CREATE TABLE tasks;
```

### 2. 验收失败矩阵

在参考实现成功后，逐条运行下面的 SQL。每条都应失败，因此不要把它们直接追加到需要一次成功执行的
`exercise-schema.sql`：

```sql
USE teamflow_model_exercise;

INSERT INTO users (public_id, display_name, email)
VALUES ('USR-2', '林澄', 'zhou@example.com');

INSERT INTO team_members (public_id, team_id, user_id, role)
VALUES ('MBR-2', 1, 1, 'Developer');

INSERT INTO team_members (public_id, team_id, user_id, role)
VALUES ('MBR-3', 999, 1, 'Developer');

INSERT INTO team_members (public_id, team_id, user_id, role)
VALUES ('MBR-4', 1, 999, 'Developer');

INSERT INTO projects (public_id, team_id, name)
VALUES ('PRJ-2', 1, '   ');

INSERT INTO tasks (
    public_id,
    project_id,
    title,
    status,
    due_at_utc,
    assignee
)
VALUES (
    'TASK-2',
    999,
    '孤立任务',
    'TODO',
    '2026-08-24 01:30:00',
    'lin'
);

INSERT INTO tasks (
    public_id,
    project_id,
    title,
    status,
    due_at_utc,
    assignee
)
VALUES (
    'TASK-3',
    1,
    '大小写错误状态',
    'todo',
    '2026-08-24 01:30:00',
    'lin'
);

DELETE FROM users WHERE id = 1;

INSERT INTO teams (public_id, name)
VALUES ('TEAM-DELETE', '删除约束验证组');

INSERT INTO team_members (public_id, team_id, user_id, role)
VALUES ('MBR-DELETE', 2, 1, 'Reviewer');

DELETE FROM teams WHERE public_id = 'TEAM-DELETE';
```

预期命中的约束依次是 `uq_ex_users_email`、`uq_ex_team_members_team_user`、
`fk_ex_team_members_team`、`fk_ex_team_members_user`、`chk_ex_projects_name`、`fk_ex_tasks_project`、
`chk_ex_tasks_status`、`fk_ex_team_members_user` 和 `fk_ex_team_members_team`。最后三条 SQL 组成一个删除
失败样本，其余失败样本应逐条执行；前一条失败不能阻止你继续观察后面的约束。

## 八、本课小结

- 先从业务需求识别实体、属性和关系，再把同一类事实放入一张表。
- 接口响应与数据库行不是同一层合同，内部主键和公开 ID 可以同时存在。
- 主键、NOT NULL、UNIQUE、CHECK 与外键各自解决不同的数据完整性问题。
- 一对多在子表保存父键，多对多使用关联表；TeamMember 还用公开 ID 表达关系资源身份。
- 外键两端的类型、大小和符号必须匹配，引用动作必须符合资源生命周期。
- TeamFlow 当前使用 RESTRICT 保护用户、团队成员、项目和任务的父资源边界，不提前发明级联删除能力。
- `DATETIME` 不保存 UTC 偏移，`due_at_utc` 依赖应用在持久化边界完成规范化。
- 本课完成的是可执行 schema；查询、迁移、MyBatis 和事务将在后续课程逐项加入。
