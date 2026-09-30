---
id: backend.java.learn.intermediate.project-and-task-persistence-project
type: lesson
title: "实战：项目与任务持久化"
summary: 在不改变 TeamFlow HTTP 合同的前提下，用 Flyway、MyBatis、MySQL 与 Spring 事务持久化项目和任务
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 360
prerequisites:
  - backend.java.learn.intermediate.database-transactions
objectives:
  - 能在不修改 URI、请求、响应与错误语义的前提下，把项目和任务状态从内存迁移到 MySQL。
  - 能用版本化迁移建立 User、Team、Project、Task 与任务变更审计之间的关系和约束。
  - 能让公开 ID 与数据库内部主键各负其责，并始终按父项目限定任务查询、替换和删除。
  - 能把项目分页、任务分页与状态筛选下推到 SQL，同时保留原有不透明 pageToken 合同。
  - 能让任务完整替换与变更审计在同一个 Spring 事务中共同提交或回滚。
  - 能用真实 MySQL 复跑创建、查询、分页、筛选、替换、删除、重启回读和故障回滚。
  - 能在 JDK 25 与 Java 8 两条独立工程线上保持相同的 HTTP 与数据库行为。
  - 能区分数据库持久化已经解决的问题与缓存、并发控制、索引调优、幂等和分布式事务等后续主题。
recap:
  - 持久化替换状态所有者，不应顺便改变 Controller、DTO、Location、Problem Details 或 OpenAPI 合同。
  - projects 通过 team_id 引用 teams，tasks 通过 project_id 引用 projects，任务访问必须同时限定父项目。
  - 列表 count 与 page SQL 必须使用同一份项目和 status 条件，否则 nextPageToken 会描述错误的集合。
  - 公开 ID 仍由应用生成，数据库内部自增主键只服务于关联、排序和外键。
  - replaceTask 是公开业务事务边界，任务 UPDATE 与 task_status_changes INSERT 必须共同提交或回滚。
  - Flyway 只在 schema 演进时执行迁移，应用重启不会清表或重新插入固定数据。
  - 两条版本线共享表结构和持久化控制流，依赖、校验命名空间、DTO 访问器、邮箱键编码与批量查询 API 按真实版本分叉。
  - 本课不引入新端点，不承诺缓存、并发更新、锁、重试幂等、索引调优或分布式事务。
related:
  - backend.java.learn.intermediate.project-and-task-api-project
  - backend.java.learn.intermediate.user-and-team-persistence-project
  - backend.java.learn.intermediate.mybatis-plus-pagination-and-filtering
  - backend.java.learn.intermediate.database-transactions
tags:
  - Java
  - Spring Boot
  - MyBatis
  - MySQL
  - Flyway
  - 事务
  - 项目
  - 任务
  - 持久化
appliesTo: JDK 25、Spring Boot 4.1.0、MyBatis-Plus 3.5.17、MyBatis-Spring 4.0.0、MySQL 8.4 主线；Java 8、Spring Boot 2.3.12.RELEASE、MyBatis-Plus 3.4.2、MyBatis-Spring 2.0.5 兼容写法
verifiedAt: 2026-08-20
sources:
  - id: mybatis-spring-project-task-transactions
    title: MyBatis-Spring - Transactions
    url: https://mybatis.org/spring/transactions.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis-Spring
    claims:
      - Spring 事务期间的 Mapper 共享受管 SqlSession 并随事务提交或回滚
      - Spring 事务外的 Mapper 写入会自动提交
  - id: mybatis-plus-project-task-pagination
    title: MyBatis-Plus Pagination Plugin
    url: https://baomidou.com/en/plugins/pagination/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis-Plus 3.5.x
    claims:
      - PaginationInnerInterceptor、Page 与 MySQL 方言的分页合同
      - Page 从 1 开始计数并承载 records 与 total
  - id: mybatis-plus-project-task-wrapper
    title: MyBatis-Plus Conditional Constructor
    url: https://baomidou.com/en/guides/wrapper/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis-Plus 3.5.x
    claims:
      - LambdaQueryWrapper 使用属性方法引用组合条件
      - condition 参数决定可选筛选是否进入 SQL
  - id: mybatis-plus-project-task-data-interface
    title: MyBatis-Plus Persistence Layer Interface
    url: https://baomidou.com/en/guides/data-interface/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis-Plus 3.5.x
    claims:
      - BaseMapper 提供单表 CRUD、条件查询与分页入口
  - id: spring-project-task-transactional
    title: "Spring Framework - Using @Transactional"
    url: https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0 与 5.2
    claims:
      - proxy 模式只拦截经过代理的外部调用
      - 为兼容两条版本线，事务入口使用具体类上的 public 方法
  - id: mysql-84-project-task-transactions
    title: MySQL 8.4 Reference Manual - autocommit, Commit, and Rollback
    url: https://dev.mysql.com/doc/refman/8.4/en/innodb-autocommit-commit-rollback.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4 InnoDB
    claims:
      - InnoDB 中 COMMIT 持久化事务修改，ROLLBACK 撤销当前事务修改
  - id: mysql-84-project-task-foreign-keys
    title: MySQL 8.4 Reference Manual - FOREIGN KEY Constraints
    url: https://dev.mysql.com/doc/refman/8.4/en/create-table-foreign-keys.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - 外键在子表声明并保持父子引用一致
      - RESTRICT 与 CASCADE 的引用动作语义
  - id: mysql-84-project-task-implicit-commit
    title: MySQL 8.4 Reference Manual - Statements That Cause an Implicit Commit
    url: https://dev.mysql.com/doc/refman/8.4/en/implicit-commit.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - ALTER TABLE 等 DDL 会隐式结束当前事务
      - 故障约束必须在业务请求前安装并在请求后移除
  - id: mysql-84-project-task-nontransactional
    title: MySQL 8.4 Reference Manual - Rollback Failure for Nontransactional Tables
    url: https://dev.mysql.com/doc/refman/8.4/en/nontransactional-tables.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - 非事务表的修改不受 ROLLBACK 影响
      - SHOW CREATE TABLE 与 SHOW TABLE STATUS 可核对真实存储引擎
  - id: mysql-84-project-task-datetime
    title: MySQL 8.4 Reference Manual - DATE, DATETIME, and TIMESTAMP Types
    url: https://dev.mysql.com/doc/refman/8.4/en/datetime.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - TIMESTAMP 会按连接时区转换且不保留调用方原始偏移文本
      - 为保持原 API 原样回显，本课继续保存已验证的 dueAt 字符串
  - id: spring-boot-41-project-task-system
    title: Spring Boot 4.1 System Requirements
    url: https://docs.spring.io/spring-boot/4.1/system-requirements.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Spring Boot 4.1.0 支持 JDK 25
  - id: spring-boot-2312-project-task-system
    title: Spring Boot 2.3.12 System Requirements
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java 8 与 Spring Boot 2.3.12.RELEASE
    claims:
      - Spring Boot 2.3.12.RELEASE 支持 Java 8 并使用 Spring Framework 5.2.15.RELEASE
  - id: aip-158-project-task-persistence-pagination
    title: AIP-158 - Pagination
    url: https://google.aip.dev/158
    sourceOrigin: official
    sourceType: engineering-reference
    appliesTo: API pagination model
    claims:
      - pageSize、pageToken 与 nextPageToken 组成分页合同
  - id: stackoverflow-mybatis-mysql-rollback-engine
    title: Stack Overflow - MyBatis Spring transaction on MySQL not rolling back
    url: https://stackoverflow.com/questions/26420460/mybatis-spring-transaction-on-mysql-not-rolling-back
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: 原问题使用旧版 Spring、MyBatis 与 MySQL；存储引擎误用由 MySQL 8.4 官方文档再次核验
    claims:
      - 真实排错案例中事务日志显示回滚但 MyISAM 数据仍保留
      - 最终数据与真实存储引擎必须纳入回滚验收
---

# 实战：项目与任务持久化

TeamFlow 已经公开用户、团队、项目与项目内任务 API，但前一份快照把所有状态放在 `Map` 中。进程一停，
新建项目、任务状态和删除结果都会消失；分页也只是从内存列表截取。本课让 MySQL 成为状态的唯一所有者，
同时保持客户端已经看到的 URL、JSON、状态码、Location、Problem Details 和 OpenAPI 不变。

本课只完成当前 Web 主线需要的持久化闭环：版本化迁移、真实 CRUD、数据库分页、状态筛选、父资源范围和
任务替换事务。缓存、隔离级别、显式锁、乐观锁、重试幂等、索引调优、认证授权、部署和分布式事务都有独立
学习成本，不在这个实战中提前展开。

## 一、先冻结不允许变化的合同

### 1. 存储替换不能成为 API 重设计

从 `project-and-task-api-project` 工程复制出持久化工程。以下公开合同原样保留：

| 资源 | 端点 |
| --- | --- |
| 用户 | `GET/POST /api/v1/users`、`GET /api/v1/users/{userId}` |
| 团队 | `GET/POST /api/v1/teams`、`GET /api/v1/teams/{teamId}` |
| 项目 | `GET/POST /api/v1/projects`、`GET /api/v1/projects/{projectId}` |
| 任务 | `GET/POST /api/v1/projects/{projectId}/tasks`、详情 GET、PUT、DELETE |

Controller、请求 DTO、响应 DTO、`TaskStatus`、`ApiException`、全局异常处理和 OpenAPI 注解都来自前课。
创建仍返回 201 与 Location，任务删除仍返回零字节 204，未知父资源仍返回相同业务码。数据库表名、内部主键
和审计行都不能进入响应。

```text
HTTP request
  -> 原 Controller 与 DTO
      -> ApiService 业务与事务边界
          -> Mapper + MySQL
  <- 原响应 DTO / Problem Details
```

### 2. 公开身份与内部关系分开

客户端继续使用 `USR-*`、`TEAM-*`、`PRJ-*` 与 `TASK-*`。数据库另有自增 `BIGINT` 主键，用它建立外键和稳定
排序。公开 ID 是协议身份，内部主键是存储实现；两者不能混用：

```text
GET /api/v1/projects/PRJ-1/tasks/TASK-1
                         |        |
                         |        +-- tasks.public_id
                         +----------- projects.public_id

projects.id <- tasks.project_id
```

任务即使全局拥有唯一 `public_id`，详情、替换和删除 SQL 仍同时限定 `project_id`。这不是为了提高命中率，
而是让嵌套 URL 的父资源语义真正进入查询条件。

### 3. 事务复用现有 PUT，不增加动作端点

原 PUT 已定义“完整替换任务”。现在这个用例同时记录一条内部变更审计：

```text
replaceTask
  -> UPDATE tasks
  -> status 改变时 INSERT task_status_changes
```

审计表不进入 HTTP 响应，也不增加 `/audit` 或 `/status` 端点。两条 DML 必须共同成功；审计插入失败时，任务
仍保持替换前的标题、状态、截止时间和负责人。这正好把上一课的事务能力放进真实 API，而不会制造新的客户端
合同。

## 二、用迁移建立五张表

### 1. V1 只建立结构和约束

新建 `src/main/resources/db/migration/V1__create_teamflow_tables.sql`：

```sql
CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id VARCHAR(32) COLLATE utf8mb4_0900_bin NOT NULL,
  display_name VARCHAR(40) NOT NULL,
  email VARBINARY(240) NOT NULL,
  email_key VARBINARY(480) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT uk_users_public_id UNIQUE (public_id),
  CONSTRAINT uk_users_email_key UNIQUE (email_key)
) ENGINE=InnoDB;

CREATE TABLE teams (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id VARCHAR(32) COLLATE utf8mb4_0900_bin NOT NULL,
  name VARCHAR(60) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT uk_teams_public_id UNIQUE (public_id)
) ENGINE=InnoDB;

CREATE TABLE projects (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id VARCHAR(32) COLLATE utf8mb4_0900_bin NOT NULL,
  team_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(80) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT uk_projects_public_id UNIQUE (public_id),
  KEY idx_projects_team_id (team_id, id),
  CONSTRAINT fk_projects_team FOREIGN KEY (team_id)
    REFERENCES teams(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE tasks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id VARCHAR(32) COLLATE utf8mb4_0900_bin NOT NULL,
  project_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(120) NOT NULL,
  status VARCHAR(10) NOT NULL,
  due_at VARCHAR(40) NOT NULL,
  assignee VARCHAR(40) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT uk_tasks_public_id UNIQUE (public_id),
  KEY idx_tasks_project_status_id (project_id, status, id),
  CONSTRAINT ck_tasks_status CHECK (status IN ('TODO', 'DONE')),
  CONSTRAINT fk_tasks_project FOREIGN KEY (project_id)
    REFERENCES projects(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE task_status_changes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  task_id BIGINT UNSIGNED NOT NULL,
  previous_status VARCHAR(10) NOT NULL,
  current_status VARCHAR(10) NOT NULL,
  changed_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_task_status_changes_task_id (task_id, id),
  CONSTRAINT ck_task_status_changes_previous
    CHECK (previous_status IN ('TODO', 'DONE')),
  CONSTRAINT ck_task_status_changes_current
    CHECK (current_status IN ('TODO', 'DONE')),
  CONSTRAINT fk_task_status_changes_task FOREIGN KEY (task_id)
    REFERENCES tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

所有表显式使用 InnoDB，事务才能覆盖任务更新和审计写入。`projects.team_id` 与 `tasks.project_id` 使用
`RESTRICT`，因为当前 API 没有项目删除语义；任务删除已有公开合同，因此内部审计使用 `ON DELETE CASCADE`，
避免隐藏的审计行让合法 DELETE 失败。这里的审计只是本课事务证据，不是长期合规日志。

`public_id` 使用二进制排序规则，`PRJ-1` 与 `prj-1` 不会被当成同一身份。`email` 保存 UTF-16 code unit 的
原始字节。`email_key` 延续前课已经验证的版本语义：现代线按 code point 折叠并以 4 字节保存，Java 8 线按
`char` 折叠并以 2 字节保存；480 字节可以容纳两条线的最坏输入。数据库默认 collation 不会改写 API 行为。

### 2. V2 只准备前课已有的固定快照

新建 `src/main/resources/db/migration/V2__seed_teamflow_snapshot.sql`：

```sql
INSERT INTO users(public_id, display_name, email, email_key) VALUES
  ('USR-1', '周宁',
   UNHEX('007a0068006f00750040006500780061006d0070006c0065002e0063006f006d'),
   UNHEX('0000007a000000680000006f00000075000000400000006500000078000000610000006d000000700000006c000000650000002e000000630000006f0000006d')),
  ('USR-2', '林澄',
   UNHEX('006c0069006e0040006500780061006d0070006c0065002e0063006f006d'),
   UNHEX('0000006c000000690000006e000000400000006500000078000000610000006d000000700000006c000000650000002e000000630000006f0000006d'));

INSERT INTO teams(public_id, name) VALUES
  ('TEAM-1', '课程平台组'),
  ('TEAM-2', '开发者门户组');

INSERT INTO projects(public_id, team_id, name)
SELECT 'PRJ-1', id, '课程平台' FROM teams WHERE public_id = 'TEAM-1';

INSERT INTO projects(public_id, team_id, name)
SELECT 'PRJ-2', id, '开发者门户' FROM teams WHERE public_id = 'TEAM-2';

INSERT INTO tasks(public_id, project_id, title, status, due_at, assignee)
SELECT 'TASK-1', id, '补齐课程目录', 'TODO',
       '2026-08-22T18:00:00+08:00', 'lin'
FROM projects WHERE public_id = 'PRJ-1';

INSERT INTO tasks(public_id, project_id, title, status, due_at, assignee)
SELECT 'TASK-2', id, '核对接口文档', 'DONE',
       '2026-08-23T18:00:00+08:00', 'zhou'
FROM projects WHERE public_id = 'PRJ-1';
```

V2 只把前课构造器里的固定状态迁进空数据库。它不是每次启动执行的初始化脚本；Flyway 在
`flyway_schema_history` 中记录 V1、V2，重启时不会清表、覆盖用户写入或重置 ID。

### 3. 关系约束与业务错误各有职责

Service 在创建项目之前先查团队，用原有 `TEAM_NOT_FOUND` 解释常见失败；外键继续保护查询与插入之间的竞争
窗口。未知项目的任务请求同样先得到 `PROJECT_NOT_FOUND`，而不是把外键异常直接暴露为 500。

数据库约束是最终不变量，业务预查是稳定错误合同。二者不能互相替代，也不能把所有
`DataIntegrityViolationException` 无条件映射成 404 或 409，否则 schema 漂移、字段越界和真实数据库故障会被
伪装成客户端问题。

## 三、让 Row 和 Mapper 只表达持久化用例

### 1. Row 只保存内部关系与业务字段

新建 `src/main/java/com/teamflow/api/persistence/Rows.java`：

```java
package com.teamflow.api.persistence;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

/** 集中定义 Mapper 边界内的数据库 Row。 */
public final class Rows {
    /** 禁止创建 Row 容器。 */
    private Rows() {
    }

    /** 表示用户查询结果。 */
    @TableName("users")
    public static final class UserRow {
        @TableId(type = IdType.AUTO)
        private Long id;
        @TableField("public_id")
        private String publicId;
        @TableField("display_name")
        private String displayName;
        private byte[] email;
        @TableField("email_key")
        private byte[] emailKey;

        /** 创建空 Row 供 MyBatis 映射。 */
        public UserRow() {
        }

        /** @return 内部用户主键 */
        public Long getId() {
            return id;
        }

        /** 设置内部用户主键。 */
        public void setId(Long id) {
            this.id = id;
        }

        /** @return 公开用户 ID */
        public String getPublicId() {
            return publicId;
        }

        /** 设置公开用户 ID。 */
        public void setPublicId(String publicId) {
            this.publicId = publicId;
        }

        /** @return 用户显示名 */
        public String getDisplayName() {
            return displayName;
        }

        /** 设置用户显示名。 */
        public void setDisplayName(String displayName) {
            this.displayName = displayName;
        }

        /** @return 用户邮箱原始字节 */
        public byte[] getEmail() {
            return email;
        }

        /** 设置用户邮箱原始字节。 */
        public void setEmail(byte[] email) {
            this.email = email;
        }

        /** @return 邮箱比较键 */
        public byte[] getEmailKey() {
            return emailKey;
        }

        /** 设置邮箱比较键。 */
        public void setEmailKey(byte[] emailKey) {
            this.emailKey = emailKey;
        }
    }

    /** 表示团队查询结果。 */
    @TableName("teams")
    public static final class TeamRow {
        @TableId(type = IdType.AUTO)
        private Long id;
        @TableField("public_id")
        private String publicId;
        private String name;

        /** 创建空 Row 供 MyBatis 映射。 */
        public TeamRow() {
        }

        /** @return 内部团队主键 */
        public Long getId() {
            return id;
        }

        /** 设置内部团队主键。 */
        public void setId(Long id) {
            this.id = id;
        }

        /** @return 公开团队 ID */
        public String getPublicId() {
            return publicId;
        }

        /** 设置公开团队 ID。 */
        public void setPublicId(String publicId) {
            this.publicId = publicId;
        }

        /** @return 团队名称 */
        public String getName() {
            return name;
        }

        /** 设置团队名称。 */
        public void setName(String name) {
            this.name = name;
        }
    }

    /** 表示项目查询结果。 */
    @TableName("projects")
    public static final class ProjectRow {
        @TableId(type = IdType.AUTO)
        private Long id;
        @TableField("public_id")
        private String publicId;
        @TableField("team_id")
        private Long teamId;
        private String name;

        /** 创建空 Row 供 MyBatis 映射。 */
        public ProjectRow() {
        }

        /** @return 内部项目主键 */
        public Long getId() {
            return id;
        }

        /** 设置内部项目主键。 */
        public void setId(Long id) {
            this.id = id;
        }

        /** @return 公开项目 ID */
        public String getPublicId() {
            return publicId;
        }

        /** 设置公开项目 ID。 */
        public void setPublicId(String publicId) {
            this.publicId = publicId;
        }

        /** @return 内部团队主键 */
        public Long getTeamId() {
            return teamId;
        }

        /** 设置内部团队主键。 */
        public void setTeamId(Long teamId) {
            this.teamId = teamId;
        }

        /** @return 项目名称 */
        public String getName() {
            return name;
        }

        /** 设置项目名称。 */
        public void setName(String name) {
            this.name = name;
        }
    }

    /** 表示任务查询结果。 */
    @TableName("tasks")
    public static final class TaskRow {
        @TableId(type = IdType.AUTO)
        private Long id;
        @TableField("public_id")
        private String publicId;
        @TableField("project_id")
        private Long projectId;
        private String title;
        private String status;
        @TableField("due_at")
        private String dueAt;
        private String assignee;

        /** 创建空 Row 供 MyBatis 映射。 */
        public TaskRow() {
        }

        /** @return 内部任务主键 */
        public Long getId() {
            return id;
        }

        /** 设置内部任务主键。 */
        public void setId(Long id) {
            this.id = id;
        }

        /** @return 公开任务 ID */
        public String getPublicId() {
            return publicId;
        }

        /** 设置公开任务 ID。 */
        public void setPublicId(String publicId) {
            this.publicId = publicId;
        }

        /** @return 内部项目主键 */
        public Long getProjectId() {
            return projectId;
        }

        /** 设置内部项目主键。 */
        public void setProjectId(Long projectId) {
            this.projectId = projectId;
        }

        /** @return 任务标题 */
        public String getTitle() {
            return title;
        }

        /** 设置任务标题。 */
        public void setTitle(String title) {
            this.title = title;
        }

        /** @return 任务状态文本 */
        public String getStatus() {
            return status;
        }

        /** 设置任务状态文本。 */
        public void setStatus(String status) {
            this.status = status;
        }

        /** @return 截止时间文本 */
        public String getDueAt() {
            return dueAt;
        }

        /** 设置截止时间文本。 */
        public void setDueAt(String dueAt) {
            this.dueAt = dueAt;
        }

        /** @return 负责人 */
        public String getAssignee() {
            return assignee;
        }

        /** 设置负责人。 */
        public void setAssignee(String assignee) {
            this.assignee = assignee;
        }
    }

    /** 表示一次任务状态变化。 */
    @TableName("task_status_changes")
    public static final class TaskStatusChangeRow {
        @TableId(type = IdType.AUTO)
        private Long id;
        @TableField("task_id")
        private Long taskId;
        @TableField("previous_status")
        private String previousStatus;
        @TableField("current_status")
        private String currentStatus;

        /** 创建空 Row 供 MyBatis 映射。 */
        public TaskStatusChangeRow() {
        }

        /** 创建待写入的状态变化。 */
        public TaskStatusChangeRow(
                Long taskId,
                String previousStatus,
                String currentStatus) {
            this.taskId = taskId;
            this.previousStatus = previousStatus;
            this.currentStatus = currentStatus;
        }

        /** @return 内部记录主键 */
        public Long getId() {
            return id;
        }

        /** 设置内部记录主键。 */
        public void setId(Long id) {
            this.id = id;
        }

        /** @return 内部任务主键 */
        public Long getTaskId() {
            return taskId;
        }

        /** 设置内部任务主键。 */
        public void setTaskId(Long taskId) {
            this.taskId = taskId;
        }

        /** @return 原状态 */
        public String getPreviousStatus() {
            return previousStatus;
        }

        /** 设置原状态。 */
        public void setPreviousStatus(String previousStatus) {
            this.previousStatus = previousStatus;
        }

        /** @return 新状态 */
        public String getCurrentStatus() {
            return currentStatus;
        }

        /** 设置新状态。 */
        public void setCurrentStatus(String currentStatus) {
            this.currentStatus = currentStatus;
        }
    }
}
```

`ProjectRow` 与 `TaskRow` 只保存内部父主键。Service 在项目分页中批量回读团队公开 ID，在任务分页中复用已经
校验过的路径 `projectId` 构造原响应模型；Controller 永远看不到数据库主键。

### 2. 五个 Mapper 按资源职责拆分

新建 `UserMapper.java`：

```java
package com.teamflow.api.persistence;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.teamflow.api.persistence.Rows.UserRow;

/** 提供用户持久化操作。 */
public interface UserMapper extends BaseMapper<UserRow> {
}
```

新建 `TeamMapper.java`：

```java
package com.teamflow.api.persistence;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.teamflow.api.persistence.Rows.TeamRow;

/** 提供团队持久化操作。 */
public interface TeamMapper extends BaseMapper<TeamRow> {
}
```

新建 `ProjectMapper.java`：

```java
package com.teamflow.api.persistence;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.teamflow.api.persistence.Rows.ProjectRow;

/** 提供项目持久化操作。 */
public interface ProjectMapper extends BaseMapper<ProjectRow> {
}
```

新建 `TaskMapper.java`：

```java
package com.teamflow.api.persistence;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.teamflow.api.persistence.Rows.TaskRow;

/** 提供项目内任务持久化操作。 */
public interface TaskMapper extends BaseMapper<TaskRow> {
}
```

新建 `TaskStatusChangeMapper.java`：

```java
package com.teamflow.api.persistence;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.teamflow.api.persistence.Rows.TaskStatusChangeRow;

/** 写入任务完整替换审计。 */
public interface TaskStatusChangeMapper extends BaseMapper<TaskStatusChangeRow> {
}
```

五个接口只继承 `BaseMapper`，不增加 MyBatis-Plus Service 层、通用 Repository 或缓存层。公开 Service 每次按
当前请求新建 Lambda Wrapper，Controller 不接收或返回 `Page`、Wrapper、内部主键、total 或 pages。

### 3. 分页插件只存在于持久化内部

新建 `src/main/java/com/teamflow/api/persistence/MyBatisPlusConfig.java`：

```java
package com.teamflow.api.persistence;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** 配置 TeamFlow 使用的 MyBatis-Plus 插件。 */
@Configuration
public class MyBatisPlusConfig {
    /** @return 只包含 MySQL 分页能力的插件链 */
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        PaginationInnerInterceptor pagination =
                new PaginationInnerInterceptor(DbType.MYSQL);
        pagination.setOverflow(false);
        pagination.setMaxLimit(50L);
        interceptor.addInnerInterceptor(pagination);
        return interceptor;
    }
}
```

`pageSize` 已由 Controller 限定为 1 到 50，`maxLimit` 是持久化层的最后一道相同上限，不替代 HTTP 校验。
当前只有分页插件，所以它自然位于插件链最后；以后增加其他 SQL 改写插件时仍要保持这个顺序。

### 4. 把旧 token 映射到 Page 的绝对偏移

前课 token 中的数字表示下一页第一个元素的 1-based 位置，例如第一页大小为 1 时，下一枚项目 token 是
`PROJECT-PAGE-2`。这个合同记录绝对位置，不记录上一请求的 `pageSize`：

```text
position = 2
start = position - 1 = 1
next pageSize = 2
SQL offset = 1
```

客户端改变 `pageSize` 时，单靠 `Page.current` 无法表示不对齐的 offset。Service 因此创建只在持久化内部使用的
`Page`，保留 size 与 total 行为，同时覆写 `offset()` 返回 token 的绝对位置。这样不会给前课合同增加新的 400
条件。任务 token 的前缀仍同时绑定父项目和 status：

```text
PROJECT-PAGE-2
TASK-PAGE-PRJ-1-TODO-2
TASK-PAGE-PRJ-1-ALL-2
```

持久化层不会把 `Page` 的 total、pages 或 orders 暴露给 Controller。Service 只读取 records 与 total，重新构造
原来的 `PageResponse(items, nextPageToken)`。`start + records.size() < total` 时才签发下一枚 token。

项目页从 `ProjectRow` 收集当前页不同的 `teamId`，现代线用一次 `selectByIds` 回读团队公开 ID，避免每个项目各查
一次团队。任务页已经从 URL 确认项目，可以直接把路径中的 `projectId` 放回每条任务响应，不需要冗余 JOIN。

```java
LambdaQueryWrapper<TaskRow> query = Wrappers.<TaskRow>lambdaQuery()
        .eq(TaskRow::getProjectId, project.getId())
        .eq(status != null, TaskRow::getStatus, status == null ? null : status.name())
        .orderByAsc(TaskRow::getId);
```

每次请求都创建新 Wrapper。调用方只提供已经解析成 `TaskStatus` 的枚举，不提供列名、排序表达式或 SQL 片段。

## 四、让 Service 成为持久化与事务边界

### 1. 装配外部 Service 与 Mapper 扫描

打开上一课的 `TeamFlowApplication.java`，删除持有四个 Map 和四个计数器的嵌套 `ApiService`，保留全部模型、
DTO、Controller、Advice 与 OpenAPI 注解。给启动类增加 Mapper 扫描，并把导入目标改为同包顶级 Service：

```java
import com.teamflow.api.persistence.UserMapper;
import org.mybatis.spring.annotation.MapperScan;

@SpringBootApplication
@MapperScan(basePackageClasses = UserMapper.class)
@OpenAPIDefinition(info = @Info(title = "TeamFlow API", version = "1.0.0"))
@Import({
        ApiService.class,
        TeamFlowApplication.UserController.class,
        TeamFlowApplication.TeamController.class,
        TeamFlowApplication.ProjectController.class,
        TeamFlowApplication.TaskController.class,
        TeamFlowApplication.GlobalExceptionHandler.class
})
public class TeamFlowApplication {
    // 其余公开 HTTP 合同保持上一课原样。
}
```

`ApiService.class` 不再指向嵌套类。它是由 Spring 管理的独立 Bean，Controller 对 `replaceTask` 的调用会从代理
外部进入事务方法。

### 2. 完整实现查询、写入与父资源范围

新建 `src/main/java/com/teamflow/api/ApiService.java`：

```java
package com.teamflow.api;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.teamflow.api.TeamFlowApplication.ApiException;
import com.teamflow.api.TeamFlowApplication.CreateProjectRequest;
import com.teamflow.api.TeamFlowApplication.CreateTaskRequest;
import com.teamflow.api.TeamFlowApplication.CreateTeamRequest;
import com.teamflow.api.TeamFlowApplication.CreateUserRequest;
import com.teamflow.api.TeamFlowApplication.PageResponse;
import com.teamflow.api.TeamFlowApplication.Project;
import com.teamflow.api.TeamFlowApplication.ProjectResponse;
import com.teamflow.api.TeamFlowApplication.ReplaceTaskRequest;
import com.teamflow.api.TeamFlowApplication.Task;
import com.teamflow.api.TeamFlowApplication.TaskResponse;
import com.teamflow.api.TeamFlowApplication.TaskStatus;
import com.teamflow.api.TeamFlowApplication.Team;
import com.teamflow.api.TeamFlowApplication.TeamResponse;
import com.teamflow.api.TeamFlowApplication.User;
import com.teamflow.api.TeamFlowApplication.UserResponse;
import com.teamflow.api.persistence.ProjectMapper;
import com.teamflow.api.persistence.Rows.ProjectRow;
import com.teamflow.api.persistence.Rows.TaskRow;
import com.teamflow.api.persistence.Rows.TaskStatusChangeRow;
import com.teamflow.api.persistence.Rows.TeamRow;
import com.teamflow.api.persistence.Rows.UserRow;
import com.teamflow.api.persistence.TaskMapper;
import com.teamflow.api.persistence.TaskStatusChangeMapper;
import com.teamflow.api.persistence.TeamMapper;
import com.teamflow.api.persistence.UserMapper;
import java.nio.ByteBuffer;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

/** 用 MyBatis-Plus 和 MySQL 实现原有 TeamFlow API。 */
public class ApiService {
    private final UserMapper userMapper;
    private final TeamMapper teamMapper;
    private final ProjectMapper projectMapper;
    private final TaskMapper taskMapper;
    private final TaskStatusChangeMapper statusChangeMapper;

    /** 创建持久化 Service。 */
    public ApiService(
            UserMapper userMapper,
            TeamMapper teamMapper,
            ProjectMapper projectMapper,
            TaskMapper taskMapper,
            TaskStatusChangeMapper statusChangeMapper) {
        this.userMapper = userMapper;
        this.teamMapper = teamMapper;
        this.projectMapper = projectMapper;
        this.taskMapper = taskMapper;
        this.statusChangeMapper = statusChangeMapper;
    }

    /** 查询一页用户。 */
    public PageResponse<UserResponse> listUsers(int pageSize, String pageToken) {
        String prefix = "USER-PAGE-";
        int start = pageStart(pageToken, prefix);
        Page<UserRow> page = offsetPage(start, pageSize);
        userMapper.selectPage(
                page,
                Wrappers.<UserRow>lambdaQuery().orderByAsc(UserRow::getId));
        requireExistingPage(pageToken, start, page.getTotal());
        List<UserResponse> items = new ArrayList<>();
        for (UserRow row : page.getRecords()) {
            items.add(UserResponse.from(toUser(row)));
        }
        return new PageResponse<>(
                items,
                nextPageToken(prefix, start, items.size(), page.getTotal()));
    }

    /** 创建用户。 */
    public User createUser(CreateUserRequest request) {
        byte[] key = emailKey(request.email());
        if (findUserByEmailKey(key) != null) {
            throw userConflict();
        }
        UserRow row = new UserRow();
        row.setPublicId(nextPublicId("USR-"));
        row.setDisplayName(request.displayName());
        row.setEmail(encodeEmail(request.email()));
        row.setEmailKey(key);
        try {
            requireOneRow(userMapper.insert(row), "用户写入行数不是 1");
        } catch (DuplicateKeyException exception) {
            if (findUserByEmailKey(key) != null) {
                throw userConflict();
            }
            throw exception;
        }
        return toUser(row);
    }

    /** 查询用户。 */
    public User findUser(String userId) {
        return toUser(requireUserRow(userId));
    }

    /** 查询一页团队。 */
    public PageResponse<TeamResponse> listTeams(int pageSize, String pageToken) {
        String prefix = "TEAM-PAGE-";
        int start = pageStart(pageToken, prefix);
        Page<TeamRow> page = offsetPage(start, pageSize);
        teamMapper.selectPage(
                page,
                Wrappers.<TeamRow>lambdaQuery().orderByAsc(TeamRow::getId));
        requireExistingPage(pageToken, start, page.getTotal());
        List<TeamResponse> items = new ArrayList<>();
        for (TeamRow row : page.getRecords()) {
            items.add(TeamResponse.from(toTeam(row)));
        }
        return new PageResponse<>(
                items,
                nextPageToken(prefix, start, items.size(), page.getTotal()));
    }

    /** 创建团队。 */
    public Team createTeam(CreateTeamRequest request) {
        TeamRow row = new TeamRow();
        row.setPublicId(nextPublicId("TEAM-"));
        row.setName(request.name());
        requireOneRow(teamMapper.insert(row), "团队写入行数不是 1");
        return toTeam(row);
    }

    /** 查询团队。 */
    public Team findTeam(String teamId) {
        return toTeam(requireTeamRow(teamId));
    }

    /** 查询一页项目。 */
    public PageResponse<ProjectResponse> listProjects(int pageSize, String pageToken) {
        String prefix = "PROJECT-PAGE-";
        int start = pageStart(pageToken, prefix);
        Page<ProjectRow> page = offsetPage(start, pageSize);
        projectMapper.selectPage(
                page,
                Wrappers.<ProjectRow>lambdaQuery().orderByAsc(ProjectRow::getId));
        requireExistingPage(pageToken, start, page.getTotal());
        Map<Long, String> teamIds = findTeamPublicIds(page.getRecords());
        List<ProjectResponse> items = new ArrayList<>();
        for (ProjectRow row : page.getRecords()) {
            String teamPublicId = teamIds.get(row.getTeamId());
            if (teamPublicId == null) {
                throw new IllegalStateException("项目引用的团队不存在");
            }
            items.add(ProjectResponse.from(toProject(row, teamPublicId)));
        }
        return new PageResponse<>(
                items,
                nextPageToken(prefix, start, items.size(), page.getTotal()));
    }

    /** 创建项目。 */
    public Project createProject(CreateProjectRequest request) {
        TeamRow team = requireTeamRow(request.teamId());
        ProjectRow row = new ProjectRow();
        row.setPublicId(nextPublicId("PRJ-"));
        row.setTeamId(team.getId());
        row.setName(request.name());
        requireOneRow(projectMapper.insert(row), "项目写入行数不是 1");
        return toProject(row, team.getPublicId());
    }

    /** 查询项目。 */
    public Project findProject(String projectId) {
        ProjectRow project = requireProjectRow(projectId);
        TeamRow team = teamMapper.selectById(project.getTeamId());
        if (team == null) {
            throw new IllegalStateException("项目引用的团队不存在");
        }
        return toProject(project, team.getPublicId());
    }

    /** 按项目与状态查询一页任务。 */
    public PageResponse<TaskResponse> listTasks(
            String projectId,
            TaskStatus status,
            int pageSize,
            String pageToken) {
        ProjectRow project = requireProjectRow(projectId);
        String prefix = taskTokenPrefix(projectId, status);
        int start = pageStart(pageToken, prefix);
        Page<TaskRow> page = offsetPage(start, pageSize);
        String statusText = status == null ? null : status.name();
        LambdaQueryWrapper<TaskRow> query = Wrappers.<TaskRow>lambdaQuery()
                .eq(TaskRow::getProjectId, project.getId())
                .eq(status != null, TaskRow::getStatus, statusText)
                .orderByAsc(TaskRow::getId);
        taskMapper.selectPage(page, query);
        requireExistingPage(pageToken, start, page.getTotal());
        List<TaskResponse> items = new ArrayList<>();
        for (TaskRow row : page.getRecords()) {
            items.add(TaskResponse.from(toTask(row, projectId)));
        }
        return new PageResponse<>(
                items,
                nextPageToken(prefix, start, items.size(), page.getTotal()));
    }

    /** 创建任务并使用 TODO 作为初始状态。 */
    public Task createTask(String projectId, CreateTaskRequest request) {
        ProjectRow project = requireProjectRow(projectId);
        TaskRow row = new TaskRow();
        row.setPublicId(nextPublicId("TASK-"));
        row.setProjectId(project.getId());
        row.setTitle(request.title());
        row.setStatus(TaskStatus.TODO.name());
        row.setDueAt(requireDueAt(request.dueAt()));
        row.setAssignee(request.assignee());
        requireOneRow(taskMapper.insert(row), "任务写入行数不是 1");
        return toTask(row, projectId);
    }

    /** 在指定项目中查询任务。 */
    public Task findTask(String projectId, String taskId) {
        ProjectRow project = requireProjectRow(projectId);
        return toTask(requireTaskRow(project.getId(), taskId), projectId);
    }

    /** 完整替换任务，并让状态变化记录参加同一事务。 */
    @Transactional
    public Task replaceTask(
            String projectId,
            String taskId,
            ReplaceTaskRequest request) {
        ProjectRow project = requireProjectRow(projectId);
        TaskRow existing = requireTaskRow(project.getId(), taskId);
        String dueAt = requireDueAt(request.dueAt());
        LambdaUpdateWrapper<TaskRow> update = Wrappers.<TaskRow>lambdaUpdate()
                .eq(TaskRow::getProjectId, project.getId())
                .eq(TaskRow::getPublicId, taskId)
                .set(TaskRow::getTitle, request.title())
                .set(TaskRow::getStatus, request.status().name())
                .set(TaskRow::getDueAt, dueAt)
                .set(TaskRow::getAssignee, request.assignee());
        int rows = taskMapper.update(null, update);
        if (rows == 0) {
            throw taskNotFound(taskId);
        }
        if (rows > 1) {
            throw new IllegalStateException("任务更新行数大于 1");
        }
        if (!existing.getStatus().equals(request.status().name())) {
            TaskStatusChangeRow change = new TaskStatusChangeRow(
                    existing.getId(),
                    existing.getStatus(),
                    request.status().name());
            requireOneRow(
                    statusChangeMapper.insert(change),
                    "任务状态记录写入行数不是 1");
        }
        return new Task(
                taskId,
                projectId,
                request.title(),
                request.status(),
                dueAt,
                request.assignee());
    }

    /** 删除指定项目中的任务。 */
    public void deleteTask(String projectId, String taskId) {
        ProjectRow project = requireProjectRow(projectId);
        int rows = taskMapper.delete(
                Wrappers.<TaskRow>lambdaQuery()
                        .eq(TaskRow::getProjectId, project.getId())
                        .eq(TaskRow::getPublicId, taskId));
        if (rows == 0) {
            throw taskNotFound(taskId);
        }
        if (rows > 1) {
            throw new IllegalStateException("任务删除行数大于 1");
        }
    }

    /** 批量读取当前项目页引用的团队公开 ID。 */
    private Map<Long, String> findTeamPublicIds(List<ProjectRow> projects) {
        Collection<Long> internalIds = new LinkedHashSet<>();
        for (ProjectRow project : projects) {
            internalIds.add(project.getTeamId());
        }
        Map<Long, String> result = new LinkedHashMap<>();
        if (internalIds.isEmpty()) {
            return result;
        }
        for (TeamRow team : teamMapper.selectByIds(internalIds)) {
            result.put(team.getId(), team.getPublicId());
        }
        return result;
    }

    /** 按邮箱比较键查询用户。 */
    private UserRow findUserByEmailKey(byte[] emailKey) {
        return userMapper.selectOne(
                Wrappers.<UserRow>lambdaQuery()
                        .eq(UserRow::getEmailKey, emailKey));
    }

    /** 查询必须存在的用户 Row。 */
    private UserRow requireUserRow(String userId) {
        UserRow row = userMapper.selectOne(
                Wrappers.<UserRow>lambdaQuery()
                        .eq(UserRow::getPublicId, userId));
        if (row == null) {
            throw new ApiException(
                    HttpStatus.NOT_FOUND,
                    "user-not-found",
                    "用户不存在",
                    "没有找到编号为 " + userId + " 的用户",
                    "USER_NOT_FOUND");
        }
        return row;
    }

    /** 查询必须存在的团队 Row。 */
    private TeamRow requireTeamRow(String teamId) {
        TeamRow row = teamMapper.selectOne(
                Wrappers.<TeamRow>lambdaQuery()
                        .eq(TeamRow::getPublicId, teamId));
        if (row == null) {
            throw new ApiException(
                    HttpStatus.NOT_FOUND,
                    "team-not-found",
                    "团队不存在",
                    "没有找到编号为 " + teamId + " 的团队",
                    "TEAM_NOT_FOUND");
        }
        return row;
    }

    /** 查询必须存在的项目 Row。 */
    private ProjectRow requireProjectRow(String projectId) {
        ProjectRow row = projectMapper.selectOne(
                Wrappers.<ProjectRow>lambdaQuery()
                        .eq(ProjectRow::getPublicId, projectId));
        if (row == null) {
            throw new ApiException(
                    HttpStatus.NOT_FOUND,
                    "project-not-found",
                    "项目不存在",
                    "没有找到编号为 " + projectId + " 的项目",
                    "PROJECT_NOT_FOUND");
        }
        return row;
    }

    /** 查询当前项目内必须存在的任务 Row。 */
    private TaskRow requireTaskRow(long projectId, String taskId) {
        TaskRow row = taskMapper.selectOne(
                Wrappers.<TaskRow>lambdaQuery()
                        .eq(TaskRow::getProjectId, projectId)
                        .eq(TaskRow::getPublicId, taskId));
        if (row == null) {
            throw taskNotFound(taskId);
        }
        return row;
    }

    /** 把用户 Row 转成原有内部模型。 */
    private User toUser(UserRow row) {
        return new User(
                row.getPublicId(),
                row.getDisplayName(),
                decodeEmail(row.getEmail()));
    }

    /** 把团队 Row 转成原有内部模型。 */
    private Team toTeam(TeamRow row) {
        return new Team(row.getPublicId(), row.getName());
    }

    /** 把项目 Row 转成原有内部模型。 */
    private Project toProject(ProjectRow row, String teamPublicId) {
        return new Project(row.getPublicId(), teamPublicId, row.getName());
    }

    /** 把任务 Row 转成原有内部模型。 */
    private Task toTask(TaskRow row, String projectPublicId) {
        return new Task(
                row.getPublicId(),
                projectPublicId,
                row.getTitle(),
                TaskStatus.valueOf(row.getStatus()),
                row.getDueAt(),
                row.getAssignee());
    }

    /** 确认截止时间是带偏移的 ISO 日期时间。 */
    private String requireDueAt(String dueAt) {
        try {
            OffsetDateTime.parse(dueAt);
            return dueAt;
        } catch (DateTimeParseException exception) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "invalid-time",
                    "截止时间格式不正确",
                    "dueAt 必须是带 UTC 偏移的 ISO 日期时间",
                    "INVALID_TIME");
        }
    }

    /** 生成符合原有正整数格式的公开 ID。 */
    private String nextPublicId(String prefix) {
        return prefix + ThreadLocalRandom.current().nextLong(1, Long.MAX_VALUE);
    }

    /** 把邮箱原文编码成不丢失 UTF-16 code unit 的数据库值。 */
    private byte[] encodeEmail(String email) {
        ByteBuffer value = ByteBuffer.allocate(email.length() * Character.BYTES);
        for (int index = 0; index < email.length(); index++) {
            value.putChar(email.charAt(index));
        }
        return value.array();
    }

    /** 从数据库值还原邮箱原文。 */
    private String decodeEmail(byte[] email) {
        return ByteBuffer.wrap(email).asCharBuffer().toString();
    }

    /** 按 JDK 25 equalsIgnoreCase 的 code point 规则生成内部比较键。 */
    private byte[] emailKey(String email) {
        ByteBuffer key = ByteBuffer.allocate(
                email.codePointCount(0, email.length()) * Integer.BYTES);
        for (int index = 0; index < email.length();) {
            int codePoint = email.codePointAt(index);
            key.putInt(Character.toLowerCase(Character.toUpperCase(codePoint)));
            index += Character.charCount(codePoint);
        }
        return key.array();
    }

    /** 把当前 token 解释为零起始位置。 */
    private int pageStart(String pageToken, String prefix) {
        if (pageToken == null) {
            return 0;
        }
        if (!pageToken.startsWith(prefix)) {
            throw invalidPageToken();
        }
        try {
            String positionText = pageToken.substring(prefix.length());
            int position = Integer.parseInt(positionText);
            if (!positionText.equals(Integer.toString(position))) {
                throw invalidPageToken();
            }
            int start = position - 1;
            if (start <= 0) {
                throw invalidPageToken();
            }
            return start;
        } catch (NumberFormatException exception) {
            throw invalidPageToken();
        }
    }

    /** 创建保持旧 token 绝对位置语义的内部 Page。 */
    private <T> Page<T> offsetPage(final int start, int pageSize) {
        return new Page<T>(1, pageSize) {
            /** @return 当前 token 对应的零起始偏移 */
            @Override
            public long offset() {
                return start;
            }
        };
    }

    /** 拒绝指向当前结果集之外的 token。 */
    private void requireExistingPage(String pageToken, int start, long total) {
        if (pageToken != null && start >= total) {
            throw invalidPageToken();
        }
    }

    /** 为仍有后续资源的页面签发 token。 */
    private String nextPageToken(
            String prefix,
            int start,
            int itemCount,
            long total) {
        long nextStart = (long) start + itemCount;
        return nextStart < total ? prefix + (nextStart + 1L) : null;
    }

    /** 为任务查询上下文生成专用 token 前缀。 */
    private String taskTokenPrefix(String projectId, TaskStatus status) {
        return "TASK-PAGE-"
                + projectId
                + "-"
                + (status == null ? "ALL" : status.name())
                + "-";
    }

    /** 确认 Mapper 只影响一行。 */
    private void requireOneRow(int rows, String message) {
        if (rows != 1) {
            throw new IllegalStateException(message);
        }
    }

    /** 创建重复邮箱冲突。 */
    private ApiException userConflict() {
        return new ApiException(
                HttpStatus.CONFLICT,
                "user-conflict",
                "用户状态冲突",
                "该邮箱已经注册",
                "USER_CONFLICT");
    }

    /** 创建任务不存在异常。 */
    private ApiException taskNotFound(String taskId) {
        return new ApiException(
                HttpStatus.NOT_FOUND,
                "task-not-found",
                "任务不存在",
                "当前项目中没有编号为 " + taskId + " 的任务",
                "TASK_NOT_FOUND");
    }

    /** 创建分页 token 无效异常。 */
    private ApiException invalidPageToken() {
        return new ApiException(
                HttpStatus.BAD_REQUEST,
                "invalid-page-token",
                "分页游标无效",
                "分页游标不属于当前资源集合与查询上下文",
                "INVALID_PAGE_TOKEN");
    }
}
```

`ApiService` 没有声明接口，因此 Spring 会为它创建基于子类的事务代理，类本身不能声明为 `final`。
`replaceTask` 是这个具体类上的 `public` 方法。Controller 从另一个 Bean 调用它，Spring 7 与 Spring 5.2
都会经过事务代理。状态没有变化时仍完成 PUT，但不制造虚假的状态变化行；状态变化时第二个 Mapper 的运行时
异常会越过方法，事务代理因而回滚前面的 UPDATE。

`dueAt` 继续保存已经由 `OffsetDateTime.parse` 验证的原始字符串。MySQL `TIMESTAMP` 会按连接时区转换，
`DATETIME` 也不保留原始偏移身份；在没有重新定义响应合同之前，静默改成任一时间列都会改变原样回显行为。

## 五、建立现代版完整工程

### 1. 文件清单只替换状态所有者

从前课复制出 `teamflow-project-task-persistence-modern`，最终文件为：

```text
teamflow-project-task-persistence-modern/
├── pom.xml
└── src/main
    ├── java/com/teamflow/api
    │   ├── TeamFlowApplication.java       # 打开修改：删除内存 Service，增加 MapperScan
    │   ├── ApiService.java                # 新建：第四章完整实现
    │   └── persistence
    │       ├── Rows.java                  # 新建
    │       ├── UserMapper.java            # 新建
    │       ├── TeamMapper.java            # 新建
    │       ├── ProjectMapper.java         # 新建
    │       ├── TaskMapper.java            # 新建
    │       ├── TaskStatusChangeMapper.java # 新建
    │       └── MyBatisPlusConfig.java     # 新建
    └── resources
        ├── application.properties
        └── db/migration
            ├── V1__create_teamflow_tables.sql
            └── V2__seed_teamflow_snapshot.sql
```

`TeamFlowApplication.java` 中未列出的 DTO、模型、四个 Controller、Advice 与 OpenAPI 注解全部来自前课；不要
重复创建同名类型，也不要删掉用户和团队端点。

### 2. 组合 Web、MyBatis-Plus、Flyway 与 OpenAPI

现代 `pom.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>4.1.0</version>
    <relativePath/>
  </parent>
  <groupId>com.teamflow</groupId>
  <artifactId>teamflow-project-task-persistence-modern</artifactId>
  <version>1.0.0</version>
  <properties>
    <java.version>25</java.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-webmvc</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
      <groupId>com.baomidou</groupId>
      <artifactId>mybatis-plus-spring-boot4-starter</artifactId>
      <version>3.5.17</version>
    </dependency>
    <dependency>
      <groupId>com.baomidou</groupId>
      <artifactId>mybatis-plus-jsqlparser</artifactId>
      <version>3.5.17</version>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-flyway</artifactId>
    </dependency>
    <dependency>
      <groupId>org.flywaydb</groupId>
      <artifactId>flyway-mysql</artifactId>
    </dependency>
    <dependency>
      <groupId>com.mysql</groupId>
      <artifactId>mysql-connector-j</artifactId>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>org.springdoc</groupId>
      <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
      <version>3.1.0</version>
    </dependency>
  </dependencies>
  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>
```

`mybatis-plus-spring-boot4-starter` 已组合 MyBatis-Plus 与 MyBatis-Spring，不再重复加入原生 MyBatis Starter。
`3.5.17` 的分页能力需要独立 `mybatis-plus-jsqlparser`，漏掉它就不能完整装配
`PaginationInnerInterceptor`。Web 与 springdoc 依赖继续存在，公开 API 和 Swagger UI 才不会在接数据库时消失。

`src/main/resources/application.properties`：

```properties
spring.application.name=teamflow-project-task-persistence-modern
server.port=${TEAMFLOW_PORT:18089}
spring.datasource.url=${TEAMFLOW_DB_URL}
spring.datasource.username=${TEAMFLOW_DB_USER}
spring.datasource.password=${TEAMFLOW_DB_PASSWORD}
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
springdoc.api-docs.version=OPENAPI_3_0
```

数据库连接只来自环境变量。Flyway 在应用接受请求前完成 schema 迁移，Service 事务中只执行 InnoDB DML，
不执行会隐式提交的 DDL。

### 3. 在真实 MySQL 8.4 中启动

下面的密码只属于可删除的本地容器：

```bash
docker run --name teamflow-project-task-db \
  -e MYSQL_ROOT_PASSWORD=teamflow-root \
  -e MYSQL_DATABASE=teamflow_modern \
  -e MYSQL_USER=teamflow \
  -e MYSQL_PASSWORD=teamflow-pass \
  -p 33318:3306 \
  -d mysql:8.4
```

等待 `mysqladmin ping` 成功后，从现代工程根目录核对依赖并启动：

```bash
mvn dependency:tree \
  -Dincludes=com.baomidou:mybatis-plus-core,org.mybatis:mybatis-spring,org.flywaydb:flyway-core

TEAMFLOW_DB_URL='jdbc:mysql://127.0.0.1:33318/teamflow_modern?useSSL=false&allowPublicKeyRetrieval=true' \
TEAMFLOW_DB_USER=teamflow \
TEAMFLOW_DB_PASSWORD=teamflow-pass \
TEAMFLOW_PORT=18089 \
mvn spring-boot:run
```

启动日志应显示 V1、V2 迁移成功和 18089 端口就绪。进程正在运行只证明接线完成，下一章还要从 HTTP、重启、
事务外 SQL 和存储引擎四个方向观察结果。

## 六、完成 Java 8 兼容工程

### 1. 使用旧基线对应的依赖

复制前课 Java 8 工程为 `teamflow-project-task-persistence-java8`。Project SDK、Module SDK、Maven Runner JRE
和 POM 目标都使用真实 Java 8，不能让它与现代工程共用 `target/`。

Java 8 `pom.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.3.12.RELEASE</version>
    <relativePath/>
  </parent>
  <groupId>com.teamflow</groupId>
  <artifactId>teamflow-project-task-persistence-java8</artifactId>
  <version>1.0.0</version>
  <properties>
    <java.version>1.8</java.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
      <groupId>com.baomidou</groupId>
      <artifactId>mybatis-plus-boot-starter</artifactId>
      <version>3.4.2</version>
    </dependency>
    <dependency>
      <groupId>org.flywaydb</groupId>
      <artifactId>flyway-core</artifactId>
    </dependency>
    <dependency>
      <groupId>mysql</groupId>
      <artifactId>mysql-connector-java</artifactId>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>org.springdoc</groupId>
      <artifactId>springdoc-openapi-ui</artifactId>
      <version>1.8.0</version>
    </dependency>
  </dependencies>
  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>
```

`3.4.2` 已通过 extension 传递它对应的 JSQLParser，不加入现代线的 `mybatis-plus-jsqlparser:3.5.17`。Boot 2.3
管理的 Flyway 6.x 把 MySQL 支持放在 core 中，也没有独立 `flyway-mysql` 模块。它连接 MySQL 8.4 时会提示
数据库版本新于已测试范围；本课只依据真实 V1/V2、CRUD、分页、事务和重启反馈，不把一次成功扩张成全面兼容
保证。

### 2. 只改真实存在的 Java 与框架差异

Java 8 的 `TeamFlowApplication.java` 沿用前课已经完成的普通 DTO、`javax.validation`、类型级 `@Validated`、
`ApiProblem` 与旧 springdoc 注解。装配修改、Rows、五个 Mapper、配置类、迁移和 Service 控制流与现代线一致。

前课兼容 DTO 使用供 Jackson 绑定的 public 字段，没有额外 getter。把现代 Service 中的 record 访问器换成字段
读取，例如：

```java
request.email()       -> request.email
request.teamId()      -> request.teamId
request.status()      -> request.status
```

Java 8 的邮箱比较延续 mysql-07 已验证的逐 `char` 规则。V2 中 `email` 原文仍使用 2 字节 UTF-16 code unit；
`email_key` 也要把现代线的 4 字节 code point 十六进制换成对应的 2 字节值：

```text
zhou@example.com -> 007a0068006f00750040006500780061006d0070006c0065002e0063006f006d
lin@example.com  -> 006c0069006e0040006500780061006d0070006c0065002e0063006f006d
```

随后替换这个私有方法：

```java
/** 按 Java 8 equalsIgnoreCase 的 char 规则生成内部比较键。 */
private byte[] emailKey(String email) {
    ByteBuffer key = ByteBuffer.allocate(email.length() * Character.BYTES);
    for (int index = 0; index < email.length(); index++) {
        char codeUnit = email.charAt(index);
        key.putChar(Character.toLowerCase(Character.toUpperCase(codeUnit)));
    }
    return key.array();
}
```

MyBatis-Plus 3.4.2 还没有现代线的 `selectByIds`，因此批量回读团队处要改回
`teamMapper.selectBatchIds(internalIds)`。现代代码没有使用 `List.copyOf`、Stream `toList` 或其他 Java 8 缺失
API；完成 DTO 访问器、邮箱键、V2 固定键和批量查询方法替换后，其余 Service 可以原形编译。`@Transactional`
继续使用 Spring 注解，公开外部调用的代理语义没有分叉。

Java 8 `application.properties` 只修改名称和默认端口：

```properties
spring.application.name=teamflow-project-task-persistence-java8
server.port=${TEAMFLOW_PORT:18090}
spring.datasource.url=${TEAMFLOW_DB_URL}
spring.datasource.username=${TEAMFLOW_DB_USER}
spring.datasource.password=${TEAMFLOW_DB_PASSWORD}
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
```

在同一 MySQL 容器中创建独立 schema：

```bash
docker exec teamflow-project-task-db mysql -uroot -pteamflow-root \
  -e "CREATE DATABASE teamflow_java8 CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
      GRANT ALL PRIVILEGES ON teamflow_java8.* TO 'teamflow'@'%';"
```

随后用真实 Java 8 从兼容工程根目录启动：

```bash
TEAMFLOW_DB_URL='jdbc:mysql://127.0.0.1:33318/teamflow_java8?useSSL=false&allowPublicKeyRetrieval=true' \
TEAMFLOW_DB_USER=teamflow \
TEAMFLOW_DB_PASSWORD=teamflow-pass \
TEAMFLOW_PORT=18090 \
mvn spring-boot:run
```

## 七、用 HTTP、重启和 SQL 观察完整结果

### 1. 先覆盖 CRUD、分页与父资源范围

现代服务启动后，固定数据应与前课相同：项目第一页仍签发原 token，任务筛选仍绑定项目与状态：

```bash
curl -fsS 'http://localhost:18089/api/v1/projects?pageSize=1' | jq
curl -fsS \
  'http://localhost:18089/api/v1/projects?pageSize=2&pageToken=PROJECT-PAGE-2' | jq
curl -fsS \
  'http://localhost:18089/api/v1/projects/PRJ-1/tasks?status=TODO&pageSize=1' | jq
curl -i http://localhost:18089/api/v1/projects/PRJ-2/tasks/TASK-1

curl -i -X POST http://localhost:18089/api/v1/users \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"重复用户","email":"ZHOU@example.com"}'
```

第一条返回 `PRJ-1` 和 `PROJECT-PAGE-2`；第二条把 pageSize 改为 2，仍从绝对位置 2 返回 `PRJ-2`，不会回到
`PRJ-1`。任务筛选返回 `TASK-1`，当前只有一个 TODO 项，因此 `nextPageToken` 是 null；错误父项目返回 404
`TASK_NOT_FOUND`。最后一条返回 409 `USER_CONFLICT`，证明现代 V2 的固定邮箱键与运行时 code point 编码一致。

接着创建团队、项目和任务。公开 ID 由应用生成，脚本从响应中读取，不能依赖数据库内部自增值：

```bash
team=$(curl -fsS -X POST http://localhost:18089/api/v1/teams \
  -H 'Content-Type: application/json' \
  -d '{"name":"持久化学习组"}')
team_id=$(printf '%s' "$team" | jq -r '.id')

project=$(curl -fsS -X POST http://localhost:18089/api/v1/projects \
  -H 'Content-Type: application/json' \
  -d "{\"teamId\":\"$team_id\",\"name\":\"持久化实战\"}")
project_id=$(printf '%s' "$project" | jq -r '.id')

task=$(curl -fsS -X POST \
  "http://localhost:18089/api/v1/projects/$project_id/tasks" \
  -H 'Content-Type: application/json' \
  -d '{"title":"验证 MySQL 状态","dueAt":"2026-08-28T18:00:00+08:00","assignee":"lin"}')
task_id=$(printf '%s' "$task" | jq -r '.id')

curl -fsS \
  "http://localhost:18089/api/v1/projects/$project_id/tasks/$task_id" | jq
```

三个 POST 都保持前课的 201、Location 和响应形状。最后的 GET 返回同一项目、TODO、原截止时间偏移和负责人。
若要同时核对状态与 Location，可用 `curl -i` 重跑 POST，而不是给 Service 增加调试字段。

### 2. 重启只能重新接线，不能重置数据

停止现代应用后，用完全相同的四个环境变量再次运行 `mvn spring-boot:run`。Flyway 应显示 schema 已到 V2，
不会再次执行 seed。使用上一步捕获的公开 ID 查询：

```bash
curl -fsS http://localhost:18089/api/v1/teams/$team_id | jq
curl -fsS http://localhost:18089/api/v1/projects/$project_id | jq
curl -fsS \
  http://localhost:18089/api/v1/projects/$project_id/tasks/$task_id | jq
```

三条查询仍成功，说明状态来自 MySQL，而不是新进程重新构造的 Map。再新建一个资源时也不能复用旧公开 ID；
重启持久化和身份唯一性需要同时成立。

### 3. 正常 PUT 提交事务，DELETE 在重启后仍然生效

另外创建一枚专用于事务与删除反馈的任务：

```bash
transaction_task=$(curl -fsS -X POST \
  "http://localhost:18089/api/v1/projects/$project_id/tasks" \
  -H 'Content-Type: application/json' \
  -d '{"title":"验证事务提交","dueAt":"2026-08-29T18:00:00+08:00","assignee":"lin"}')
transaction_task_id=$(printf '%s' "$transaction_task" | jq -r '.id')

curl -fsS -X PUT \
  "http://localhost:18089/api/v1/projects/$project_id/tasks/$transaction_task_id" \
  -H 'Content-Type: application/json' \
  -d '{"title":"验证事务提交","status":"DONE","dueAt":"2026-08-29T18:00:00+08:00","assignee":"zhou"}' \
  | jq

transaction_internal_id=$(docker exec teamflow-project-task-db \
  mysql -uteamflow -pteamflow-pass teamflow_modern -N -e \
  "SELECT id FROM tasks WHERE public_id = '$transaction_task_id';")

docker exec teamflow-project-task-db mysql -uteamflow -pteamflow-pass \
  teamflow_modern -N -e \
  "SELECT tk.title, tk.status, COUNT(sc.id)
   FROM tasks tk
   LEFT JOIN task_status_changes sc ON sc.task_id = tk.id
   WHERE tk.public_id = '$transaction_task_id'
   GROUP BY tk.id, tk.title, tk.status;"

delete_body=$(mktemp /tmp/teamflow-delete.XXXXXX)
delete_status=$(curl -sS -o "$delete_body" -w '%{http_code}' -X DELETE \
  "http://localhost:18089/api/v1/projects/$project_id/tasks/$transaction_task_id")
delete_size=$(wc -c <"$delete_body" | tr -d ' ')
printf 'delete=%s body-bytes=%s\n' "$delete_status" "$delete_size"

docker exec teamflow-project-task-db mysql -uteamflow -pteamflow-pass \
  teamflow_modern -N -e \
  "SELECT COUNT(*) FROM tasks WHERE public_id = '$transaction_task_id';
   SELECT COUNT(*) FROM task_status_changes WHERE task_id = $transaction_internal_id;"
find "$delete_body" -delete
```

PUT 返回新表示；第一段事务外 SQL 输出 `验证事务提交`、`DONE` 和记录数 1。DELETE 必须输出
`delete=204 body-bytes=0`，随后两次 COUNT 都是 0，说明任务行与级联的内部状态记录都已删除。

按上一节相同方式再次停止并启动现代应用，然后查询已删除任务：

```bash
deleted_status=$(curl -sS -o /tmp/teamflow-deleted.body -w '%{http_code}' \
  "http://localhost:18089/api/v1/projects/$project_id/tasks/$transaction_task_id")
deleted_code=$(jq -r '.code' /tmp/teamflow-deleted.body)
printf 'after-restart=%s %s\n' "$deleted_status" "$deleted_code"
find /tmp/teamflow-deleted.body -delete
```

输出必须是 `after-restart=404 TASK_NOT_FOUND`，证明删除结果来自 MySQL 并跨进程保留。若对另一枚任务用完全
相同的 DONE 状态再次 PUT，其他可编辑字段仍会替换，但状态记录数不增加，因为内部表只记录真实状态变化。

### 4. 让第二步失败并证明第一步回滚

先把固定 `TASK-1` 保持在 TODO，并读取它只供本次数据库探针使用的内部主键。随后在请求之外增加一个临时
约束，只拒绝这个任务的 DONE 审计，不影响前一步已经提交的其他任务记录：

```bash
task_internal_id=$(docker exec teamflow-project-task-db \
  mysql -uteamflow -pteamflow-pass teamflow_modern -N -e \
  "SELECT id FROM tasks WHERE public_id = 'TASK-1';")

docker exec teamflow-project-task-db mysql -uteamflow -pteamflow-pass \
  teamflow_modern -e \
  "ALTER TABLE task_status_changes
   ADD CONSTRAINT ck_reject_done_probe
   CHECK (task_id <> $task_internal_id OR current_status <> 'DONE');"

curl -sS -o /tmp/teamflow-rollback.body -w '%{http_code}\n' \
  -X PUT http://localhost:18089/api/v1/projects/PRJ-1/tasks/TASK-1 \
  -H 'Content-Type: application/json' \
  -d '{"title":"不应提交","status":"DONE","dueAt":"2026-08-30T18:00:00+08:00","assignee":"rollback"}'

curl -fsS http://localhost:18089/api/v1/projects/PRJ-1/tasks/TASK-1 | jq

docker exec teamflow-project-task-db mysql -uteamflow -pteamflow-pass \
  teamflow_modern -N -e \
  "SELECT title, status FROM tasks WHERE public_id = 'TASK-1';
   SELECT COUNT(*) FROM task_status_changes sc
   JOIN tasks tk ON tk.id = sc.task_id
   WHERE tk.public_id = 'TASK-1';"

docker exec teamflow-project-task-db mysql -uteamflow -pteamflow-pass \
  teamflow_modern -e \
  "ALTER TABLE task_status_changes DROP CHECK ck_reject_done_probe;"
find /tmp/teamflow-rollback.body -delete
```

PUT 输出 500，并沿用既有 `INTERNAL_ERROR` 合同。随后 GET 和事务外 SQL 仍显示原来的“补齐课程目录”、TODO，
状态记录数仍为 0。这个结果证明任务 UPDATE 没有在审计 INSERT 失败后单独提交。内部主键只参与临时 SQL
探针，不进入 URL、响应或应用代码。

临时 `ALTER TABLE` 必须在业务请求前完成，清理 DDL 必须在请求结束后执行。MySQL DDL 会隐式提交，不能把
增加或删除约束放进要验证的业务事务。约束移除后，重跑同一个 PUT 应返回 200，并同时得到 DONE 与一条状态记录。

**社区补充：** 一个真实 MyBatis-Spring 排错案例中，日志已经显示 rollback，数据却仍保留；最终原因是表使用
MyISAM。该案例版本较旧，但 MySQL 8.4 官方文档仍明确说明非事务表不会被 ROLLBACK 撤销。因此本课不把注解或
日志当成最终证据，还要检查真实表引擎和事务外数据：

```bash
docker exec teamflow-project-task-db mysql -uteamflow -pteamflow-pass \
  teamflow_modern -N -e \
  "SHOW TABLE STATUS
   WHERE Name IN ('projects', 'tasks', 'task_status_changes');"
```

三张表的 Engine 都必须是 InnoDB。Java 8 线在独立 schema、18090 端口按相同顺序复跑，不能用现代 schema 的
成功结果代替兼容线反馈。

### 5. OpenAPI 仍是同一份 HTTP 合同

持久化表和内部记录不能出现在 `/v3/api-docs`。保存现代机器文档并核对原十四个 operation：

```bash
document=$(mktemp /tmp/teamflow-persistence-openapi.XXXXXX)
curl -fsS http://localhost:18089/v3/api-docs -o "$document"
jq -e '
  .openapi == "3.0.1" and
  .paths["/api/v1/users"].get.operationId == "listUsers" and
  .paths["/api/v1/users"].post.operationId == "createUser" and
  .paths["/api/v1/users/{userId}"].get.operationId == "getUser" and
  .paths["/api/v1/teams"].get.operationId == "listTeams" and
  .paths["/api/v1/teams"].post.operationId == "createTeam" and
  .paths["/api/v1/teams/{teamId}"].get.operationId == "getTeam" and
  .paths["/api/v1/projects"].get.operationId == "listProjects" and
  .paths["/api/v1/projects"].post.operationId == "createProject" and
  .paths["/api/v1/projects/{projectId}"].get.operationId == "getProject" and
  .paths["/api/v1/projects/{projectId}/tasks"].get.operationId == "listProjectTasks" and
  .paths["/api/v1/projects/{projectId}/tasks"].post.operationId == "createProjectTask" and
  .paths["/api/v1/projects/{projectId}/tasks/{taskId}"].get.operationId == "getProjectTask" and
  .paths["/api/v1/projects/{projectId}/tasks/{taskId}"].put.operationId == "replaceProjectTask" and
  .paths["/api/v1/projects/{projectId}/tasks/{taskId}"].delete.operationId == "deleteProjectTask" and
  ([.paths[] | to_entries[] | .value.operationId // empty] | length) == 14 and
  (.paths | has("/api/v1/task-status-changes") | not)
' "$document"
find "$document" -delete
```

`/swagger-ui.html` 仍显示 Users、Teams、Projects 与 Project Tasks；没有内部主键、审计查询或故障开关。

## 八、集中排查六类持久化错误

### 六个典型错误

:::pitfalls

### 只按全局任务 ID 写入

**触发条件：** Task 的 `public_id` 有 UNIQUE 后，详情、替换或删除只按它查询，忽略 URL 中的 `projectId`。

**原因：** 数据库唯一性只说明任务身份不重复，不会自动实现嵌套资源的父项目合同。

**后果：** `/projects/PRJ-2/tasks/TASK-1` 可以读取或修改属于 PRJ-1 的任务。

**错误示例：**

```java
taskMapper.selectOne(Wrappers.<TaskRow>lambdaQuery()
        .eq(TaskRow::getPublicId, taskId));
```

**正确写法：**

```java
taskMapper.selectOne(Wrappers.<TaskRow>lambdaQuery()
        .eq(TaskRow::getProjectId, project.getId())
        .eq(TaskRow::getPublicId, taskId));
```

**验证方式：** 用 PRJ-2 请求真实存在于 PRJ-1 的 TASK-1，确认得到 404 `TASK_NOT_FOUND`，再从 PRJ-1 查询
TASK-1，确认内容没有变化。

### 把 Page 直接变成 Controller 合同

**触发条件：** 为了少写转换代码，让 Controller 接收或返回 MyBatis-Plus `Page`。

**原因：** `Page` 同时包含 current、size、total、pages、orders 和框架行为，不是前课公开的分页 DTO。

**后果：** 客户端 JSON 形状改变，外部排序字段可能进入持久化构建器，升级框架也会波及 API。

**错误示例：**

```java
Page<TaskRow> listTasks(Page<TaskRow> page, LambdaQueryWrapper<TaskRow> query) {
    return taskMapper.selectPage(page, query);
}
```

**正确写法：**

```java
Page<TaskRow> page = taskMapper.selectPage(requestedPage, query);
return new PageResponse<>(responses, nextPageToken);
```

**验证方式：** 检查 GET 响应仍只有 `items` 与 `nextPageToken`，OpenAPI 不出现 `Page`、orders、total 或 pages。

### 每个项目分别查询一次团队

**触发条件：** 项目分页拿到 N 行后，在循环里调用 N 次 `teamMapper.selectById`。

**原因：** Project 只保存内部 teamId，但实现没有先收集当前页的不同父 ID。

**后果：** 一页项目变成一次分页查询加 N 次团队查询，查询数随页面长度增长。

**错误示例：**

```java
for (ProjectRow project : page.getRecords()) {
    TeamRow team = teamMapper.selectById(project.getTeamId());
    responses.add(toResponse(project, team));
}
```

**正确写法：**

```java
Collection<Long> teamIds = collectDistinctTeamIds(page.getRecords());
Map<Long, TeamRow> teams = indexById(teamMapper.selectByIds(teamIds));
```

**验证方式：** 打开当前环境的 MyBatis SQL 日志，请求一页多个项目；团队回读应是一条 `IN` 查询，不是每行
一条 SELECT。

### count 与筛选使用两套条件

**触发条件：** 手工写一个无 status 的 count，却让列表 SQL 带 status，或让两个查询使用不同父项目条件。

**原因：** total 描述的集合和 records 实际读取的集合不是同一集合。

**后果：** `nextPageToken` 可能指向不存在的下一页，或在仍有结果时过早变成 null。

**错误示例：**

```java
long total = taskMapper.selectCount(null);
List<TaskRow> rows = taskMapper.selectList(projectAndStatusQuery);
```

**正确写法：**

```java
LambdaQueryWrapper<TaskRow> query = projectAndStatusQuery(project, status);
Page<TaskRow> page = taskMapper.selectPage(requestedPage, query);
```

**验证方式：** 在同一项目准备 TODO 与 DONE，分别以 pageSize 1 请求 ALL、TODO、DONE；每组 token 只能描述
自己的筛选结果，跨筛选复用仍返回 400。

### 吞掉审计异常后返回旧值

**触发条件：** 事务方法捕获状态记录 Mapper 的运行时异常，记录日志后正常返回。

**原因：** Spring 代理看到方法正常完成，会按正常路径提交已执行的任务 UPDATE。

**后果：** PUT 看似失败或返回旧对象，但数据库任务已经变化，审计却没有写入。

**错误示例：**

```java
try {
    statusChangeMapper.insert(change);
} catch (RuntimeException exception) {
    logger.warn("status audit failed", exception);
}
return task;
```

**正确写法：**

```java
requireOneRow(statusChangeMapper.insert(change), "状态记录写入失败");
return task;
```

**验证方式：** 安装第七章临时 CHECK 后调用 PUT；异常必须越过事务入口，随后 GET 与事务外 SQL 都保持旧任务，
记录数也不增加。

### 只看回滚日志，不检查真实存储引擎

**触发条件：** 看到 Spring 或 MyBatis 打印 rollback 就判定事务成功，却没有核对表引擎和最终数据。

**原因：** MyISAM 等非事务表的修改不受 ROLLBACK 影响，应用层日志不能改变存储引擎能力。

**后果：** 代理和连接都走了回滚路径，任务行仍可能保留已经执行的修改。

**错误示例：**

```sql
CREATE TABLE tasks (
  id BIGINT PRIMARY KEY,
  status VARCHAR(10) NOT NULL
) ENGINE=MyISAM;
```

**正确写法：**

```sql
CREATE TABLE tasks (
  id BIGINT PRIMARY KEY,
  status VARCHAR(10) NOT NULL
) ENGINE=InnoDB;
```

**验证方式：** 同时核对 `SHOW TABLE STATUS` 的 Engine、故障后的现有 GET 和事务外 SQL；三类证据都符合预期
才判定回滚成立。

:::

## 九、独立练习

:::exercise

### 验证任务父资源和事务记录不被越权路径改变

**要求：** 在现代服务中创建一个新项目和 TODO 任务；用 PRJ-2 携带这枚真实 taskId 执行 PUT，完整请求体试图
改成 DONE。不得新增端点、不得直接修改数据库，也不得把 Page 或内部主键暴露到响应。随后从正确项目查询任务，
并用事务外 SQL 确认任务仍是 TODO、状态变化记录仍为 0。最后从正确项目执行同一个 PUT，确认任务变为 DONE、
状态变化记录变为 1。

**验收：**

```text
wrong-parent PUT -> 404 TASK_NOT_FOUND
after wrong-parent -> TODO, status changes = 0
correct-parent PUT -> 200 DONE
after correct-parent -> DONE, status changes = 1
```

:::

### 1. 完整参考脚本

脚本先按练习要求创建独立项目和 TODO 任务，不依赖第七章遗留的 shell 变量：

```bash
exercise_project=$(curl -fsS -X POST http://localhost:18089/api/v1/projects \
  -H 'Content-Type: application/json' \
  -d '{"teamId":"TEAM-1","name":"父资源事务练习"}')
project_id=$(printf '%s' "$exercise_project" | jq -r '.id')

exercise_task=$(curl -fsS -X POST \
  "http://localhost:18089/api/v1/projects/$project_id/tasks" \
  -H 'Content-Type: application/json' \
  -d '{"title":"验证父资源范围","dueAt":"2026-08-31T18:00:00+08:00","assignee":"lin"}')
task_id=$(printf '%s' "$exercise_task" | jq -r '.id')

wrong_status=$(curl -sS -o /tmp/teamflow-wrong-parent.body -w '%{http_code}' \
  -X PUT "http://localhost:18089/api/v1/projects/PRJ-2/tasks/$task_id" \
  -H 'Content-Type: application/json' \
  -d '{"title":"错误父项目写入","status":"DONE","dueAt":"2026-08-31T18:00:00+08:00","assignee":"wrong"}')
wrong_code=$(jq -r '.code' /tmp/teamflow-wrong-parent.body)

before=$(curl -fsS \
  "http://localhost:18089/api/v1/projects/$project_id/tasks/$task_id")
before_status=$(printf '%s' "$before" | jq -r '.status')
before_changes=$(docker exec teamflow-project-task-db \
  mysql -uteamflow -pteamflow-pass teamflow_modern -N -e \
  "SELECT COUNT(*) FROM task_status_changes sc
   JOIN tasks tk ON tk.id = sc.task_id
   WHERE tk.public_id = '$task_id';")

correct=$(curl -fsS -X PUT \
  "http://localhost:18089/api/v1/projects/$project_id/tasks/$task_id" \
  -H 'Content-Type: application/json' \
  -d '{"title":"正确父项目写入","status":"DONE","dueAt":"2026-08-31T18:00:00+08:00","assignee":"right"}')
correct_status=$(printf '%s' "$correct" | jq -r '.status')
after_changes=$(docker exec teamflow-project-task-db \
  mysql -uteamflow -pteamflow-pass teamflow_modern -N -e \
  "SELECT COUNT(*) FROM task_status_changes sc
   JOIN tasks tk ON tk.id = sc.task_id
   WHERE tk.public_id = '$task_id';")

printf 'wrong=%s %s before=%s/%s correct=%s/%s\n' \
  "$wrong_status" "$wrong_code" "$before_status" "$before_changes" \
  "$correct_status" "$after_changes"
find /tmp/teamflow-wrong-parent.body -delete
```

### 2. 预期反馈

```text
wrong=404 TASK_NOT_FOUND before=TODO/0 correct=DONE/1
```

错误父项目在 Service 查询任务时就终止，没有执行 UPDATE，也没有进入状态记录写入。正确父项目的 PUT 则让两条
DML 在同一事务中提交。

## 十、本课小结

项目与任务持久化的关键不是把 Map 换成几条 SQL，而是在存储替换后继续守住已经公开的 HTTP 合同。公开 ID、
内部主键和外键各有职责；所有任务访问都带父项目范围；MyBatis-Plus Page 与 Wrapper 只留在持久化内部，原 token
仍表示绝对位置，任务 token 继续绑定项目和 status 查询上下文。

任务完整替换是公开事务入口。状态变化时，任务 UPDATE 与内部状态记录共同提交；第二步故障时，真实 InnoDB
数据证明两步共同回滚。Flyway 负责 schema 生命周期，重启只重新接线，不重置数据。现代与 Java 8 工程在各自
依赖基线上复跑相同 HTTP、MySQL、重启与事务反馈，才算完成这次持久化实战。
