---
id: backend.java.learn.intermediate.database-migrations
type: lesson
title: 数据库迁移
summary: 用 Flyway 版本化脚本让 MySQL 结构从空库和已有数据状态稳定演进，并正确处理校验与失败恢复
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 150
prerequisites:
  - backend.java.learn.intermediate.sql-queries
objectives:
  - 能解释数据库迁移、schema 版本与手工改库的区别。
  - 能按 Flyway 命名合同编写并排序 versioned migration。
  - 能通过 Maven Plugin 为 MySQL 配置 Flyway 数据库模块与 JDBC 驱动。
  - 能从 flyway_schema_history 读取版本、描述、checksum 和成功状态。
  - 能用“扩展、回填、收紧”让已有数据安全通过新增必填列的迁移。
  - 能证明重复执行 migrate 不会重放已经成功的版本。
  - 能区分 checksum 不一致与未完成 migration，并选择不同恢复方式。
  - 能在 MySQL 部分 DDL 已提交后盘点、补偿、repair 并重新迁移。
recap:
  - 迁移脚本把数据库结构变化变成有顺序、可审查、可重复部署的版本历史。
  - Versioned migration 按数值版本排序并只成功执行一次，文件名默认使用 V版本__描述.sql。
  - flyway_schema_history 保存已应用版本、描述、类型、checksum 和成功状态。
  - 已成功执行的脚本不得原地修改；修正历史结果应恢复原文件并新增后续版本。
  - 面对已有数据时，先增加可空结构，再回填数据，最后收紧约束。
  - MySQL DDL 会隐式提交，migration 后半段失败时前半段变更可能已经保留。
  - repair 只修复 history；失败脚本留下的数据库对象必须先盘点并人工补偿。
related:
  - backend.java.learn.intermediate.relational-data-and-sql-foundations
  - backend.java.learn.intermediate.sql-queries
tags:
  - MySQL
  - Flyway
  - 数据库迁移
  - Schema 版本
  - Maven
appliesTo: Flyway 13.3.0、Connector/J 26.7.0、MySQL 8.4 LTS、Maven 3.9.12；本课没有 Java 源码，因此没有 JDK 25 与 Java 8 语言差异
verifiedAt: 2026-08-20
sources:
  - id: flyway-versioned-migrations
    title: Versioned migrations - Redgate Flyway Documentation
    url: https://documentation.red-gate.com/fd/versioned-migrations-273973333.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Flyway 13.x
    claims:
      - Versioned migration 按版本顺序只应用一次
      - schema history 保存 checksum 以检测已执行脚本变化
      - 已进入永久下游环境的脚本不应原地修改，应新增版本向前修正
  - id: flyway-schema-history
    title: Flyway schema history table - Redgate Flyway Documentation
    url: https://documentation.red-gate.com/fd/flyway-schema-history-table-273973417.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Flyway 13.x
    claims:
      - schema history 记录版本、描述、类型、checksum 和状态
      - checksum 不一致或 migration 缺失会让校验失败
  - id: flyway-maven-goal
    title: Maven Goal - Redgate Flyway Documentation
    url: https://documentation.red-gate.com/flyway/reference/usage/maven-goal
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Flyway Maven Plugin 13.x
    claims:
      - Flyway Maven Plugin 通过 flyway:migrate、flyway:info 和 flyway:repair 等 goal 运行
      - 插件配置可以从 Maven 属性和环境变量取得连接参数
  - id: flyway-mysql
    title: MySQL - Redgate Flyway Documentation
    url: https://documentation.red-gate.com/fd/mysql-277579322.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Flyway 13.x / MySQL
    claims:
      - MySQL 支持位于独立 flyway-mysql 模块
      - Connector/J 不随 Flyway 命令行分发，需要独立放入运行 classpath
  - id: flyway-repair
    title: Repair - Redgate Flyway Documentation
    url: https://documentation.red-gate.com/fd/repair-277578892.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Flyway 13.x
    claims:
      - repair 可以移除失败记录并重新对齐 history 元数据
      - repair 不清理失败 migration 留在数据库中的对象
      - repair 必须使用与 migrate 相同的 locations
  - id: flyway-transaction-handling
    title: Migration transaction handling - Redgate Flyway Documentation
    url: https://documentation.red-gate.com/flyway/flyway-concepts/migrations/migration-transaction-handling
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Flyway 13.x
    claims:
      - 不支持事务化 DDL 的数据库发生 migration 失败时可能需要手工清理并 repair
  - id: mysql84-implicit-commit
    title: 'MySQL :: MySQL 8.4 Reference Manual :: Statements That Cause an Implicit Commit'
    url: https://dev.mysql.com/doc/refman/8.4/en/implicit-commit.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - ALTER TABLE、CREATE TABLE 等 DDL 会隐式提交事务
      - 不能依靠普通事务把多个 MySQL DDL 作为一个整体回滚
  - id: mysql84-connection-transport
    title: 'MySQL :: MySQL 8.4 Reference Manual :: Connecting to and Disconnecting from the Server'
    url: https://dev.mysql.com/doc/refman/8.4/en/connecting.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - Unix 客户端连接 localhost 时默认使用 Unix socket
      - 使用 127.0.0.1 或 --protocol=TCP 可以强制建立 TCP 连接
  - id: mysql-docker-entrypoint-84
    title: MySQL 8.4 Official Image Docker Entrypoint
    url: https://github.com/docker-library/mysql/blob/2f988f198f35d25b1454fa2504a0e4c348100549/8.4/docker-entrypoint.sh
    sourceOrigin: official
    sourceType: source-code
    appliesTo: docker-library/mysql commit 2f988f1 / MySQL 8.4
    claims:
      - 初始化临时服务使用 --skip-networking 并通过 Unix socket 执行初始化
      - 临时服务停止后，入口脚本才执行正式 mysqld 进程
  - id: flyway-maven-metadata
    title: Flyway Maven Plugin Metadata
    url: https://repo.maven.apache.org/maven2/org/flywaydb/flyway-maven-plugin/maven-metadata.xml
    sourceOrigin: official
    sourceType: source-code
    appliesTo: 2026-08-20 快照
    claims:
      - Flyway Maven Plugin 当前发布版本为 13.3.0
  - id: mysql-connector-metadata
    title: MySQL Connector J Metadata
    url: https://repo.maven.apache.org/maven2/com/mysql/mysql-connector-j/maven-metadata.xml
    sourceOrigin: official
    sourceType: source-code
    appliesTo: 2026-08-20 快照
    claims:
      - Connector/J 当前发布版本为 26.7.0
  - id: spring-boot-410-dependencies
    title: Spring Boot Dependencies 4.1.0
    url: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-dependencies/4.1.0/spring-boot-dependencies-4.1.0.pom
    sourceOrigin: official
    sourceType: source-code
    appliesTo: Spring Boot 4.1.0
    claims:
      - Spring Boot 4.1.0 管理 Flyway 12.4.0
      - Spring Boot 4.1.0 管理 MySQL Connector/J 9.7.0
  - id: evolutionary-database-design
    title: Evolutionary Database Design
    url: https://martinfowler.com/articles/evodb.html
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: 数据库持续演进工作流；具体工具与 MySQL 行为以本课官方来源为准
    claims:
      - 数据库结构变化应与应用代码一起进入版本控制并以小步方式持续演进
---

# 数据库迁移

前两课已经建立 TeamFlow 五表模型，并能用 SQL 读取它们。开发继续向前时，表结构也会变化：任务需要新增
优先级，旧行需要补值，随后新字段还要变成必填。如果开发者只在自己的数据库里手工执行几条
`ALTER TABLE`，其他环境既不知道执行顺序，也无法判断自己缺少哪一步。

为了只观察迁移机制，本课使用全新的隔离容器和实验 schema，不加载前两课的五表；示例中的 `tasks` 也只保留
当前反馈环需要的字段。它沿用 TeamFlow 任务概念，但不是前两课共享数据库的建表脚本，不能拿 V1 覆盖已有表。

数据库迁移把每次结构变化保存为带版本的脚本，让空库和已经装有数据的数据库沿同一条历史前进。本课只用
Flyway Maven Plugin 管理 MySQL schema，不接入 Spring Boot 或 MyBatis；查询映射、事务、索引优化、备份恢复
和完整生产发布编排留给后续课程。

## 一、把结构变化写成版本历史

### 1. 迁移描述的是变化，不是最终快照

一份最终建表 SQL 只能说明“现在想要什么”，无法解释一个旧数据库怎样走到这里。迁移脚本按顺序记录每一步：

```text
V1  创建 tasks 表
V2  增加可空 priority 列
V3  回填旧行并把 priority 改为必填
V4  增加 priority 取值约束
```

空库从 V1 开始依次执行，已经位于 V2 的数据库只执行 V3、V4。两者最后得到相同结构，但不会删除已有业务
数据重新建库。版本历史因此同时回答三个问题：数据库现在在哪个版本、还缺哪些变化、已经执行的脚本是否被
改动。

**社区补充：** Martin Fowler 的 Evolutionary Database Design 把数据库变化视为与应用代码同等的版本化
资产，并建议以小步变化持续演进。本课采用这个工作流；Flyway 文件名、checksum 与 MySQL DDL 行为仍以
官方文档和真实运行结果为准。

### 2. 文件名同时表达版本和描述

Flyway versioned migration 的默认文件名结构是：

```text
V<version>__<description>.sql
```

例如：

```text
V1__create_tasks.sql
V2__add_task_priority.sql
V10__add_project_visibility.sql
```

`V` 是默认前缀，版本与描述之间是两个下划线。描述中的下划线在 history 中显示为空格。版本按数值而不是
普通字符串排序，所以 V10 在 V2 之后。每个版本必须唯一；同一个位置同时出现两个 V2，Flyway 无法决定哪个
才是这一段历史。

本课使用简单递增整数。时间戳版本适合多人同时创建脚本的团队，但它只是降低版本冲突概率，不会改变“一个
版本对应一项已审查变化”的责任。

### 3. 成功历史只向前修正

当 V2 已经在共享环境成功执行，它的文件内容和 history 中的 checksum 就形成对应关系。此后发现需要补一个
约束，正确做法不是改写 V2，而是新增 V3：

```text
已有：V2__add_task_priority.sql
新增：V3__require_task_priority.sql
```

恢复原文件并新增版本能保留真实历史：旧环境补执行 V3，新环境从 V1 顺序执行到 V3。直接修改已成功脚本会
让不同环境的“V2”代表不同 SQL，版本号便失去意义。

## 二、用 Maven Plugin 连接 MySQL

### 1. 三个依赖各有职责

Flyway Maven Plugin 负责提供 `flyway:migrate` 等 Maven goal，`flyway-mysql` 负责理解 MySQL，Connector/J
负责真正建立 JDBC 连接。三者都要放在插件自己的 classpath：

```xml
<properties>
  <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  <flyway.version>13.3.0</flyway.version>
  <mysql.version>26.7.0</mysql.version>
</properties>

<build>
  <plugins>
    <plugin>
      <groupId>org.flywaydb</groupId>
      <artifactId>flyway-maven-plugin</artifactId>
      <version>${flyway.version}</version>
      <dependencies>
        <dependency>
          <groupId>org.flywaydb</groupId>
          <artifactId>flyway-mysql</artifactId>
          <version>${flyway.version}</version>
        </dependency>
        <dependency>
          <groupId>com.mysql</groupId>
          <artifactId>mysql-connector-j</artifactId>
          <version>${mysql.version}</version>
        </dependency>
      </dependencies>
    </plugin>
  </plugins>
</build>
```

这里使用独立工具在 2026-08-20 的当前线：Flyway `13.3.0` 与 Connector/J `26.7.0`。Spring Boot
`4.1.0` 的 BOM 管理线则是 Flyway `12.4.0` 与 Connector/J `9.7.0`。本课不接入 Spring Boot；后续在
Spring Boot 工程中应服从它的 BOM，不能从两条线各挑一个版本拼接。

### 2. 连接信息来自运行环境

把连接参数继续放在插件配置中，但让值来自环境变量：

```xml
<configuration>
  <url>${env.TEAMFLOW_DB_URL}</url>
  <user>${env.TEAMFLOW_DB_USER}</user>
  <password>${env.TEAMFLOW_DB_PASSWORD}</password>
  <locations>
    <location>filesystem:src/main/resources/db/migration</location>
  </locations>
  <validateMigrationNaming>true</validateMigrationNaming>
</configuration>
```

`locations` 明确脚本目录，`validateMigrationNaming` 让命名错误直接失败，而不是静默忽略文件。URL、用户名和
密码由当前环境注入，POM 可以进入版本控制而不携带真实凭据。

```text
TEAMFLOW_DB_URL=jdbc:mysql://localhost:3306/teamflow
TEAMFLOW_DB_USER=teamflow
TEAMFLOW_DB_PASSWORD=<由运行环境提供>
```

环境变量存在不代表连接一定成功；`migrate` 仍会真实连接目标数据库并报告 MySQL 版本、当前 schema 版本与
待执行脚本。

### 3. V1 建立第一版 schema

第一版只创建任务表：

```sql
CREATE TABLE tasks (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id VARCHAR(32) NOT NULL,
    title VARCHAR(120) NOT NULL,
    status VARCHAR(16) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_tasks_public_id UNIQUE (public_id),
    CONSTRAINT chk_tasks_status CHECK (status IN ('TODO', 'DOING', 'DONE'))
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4;
```

文件保存为 `src/main/resources/db/migration/V1__create_tasks.sql`。执行：

```bash
mvn -B flyway:migrate
```

空库的关键反馈是：

```text
Schema history table `teamflow`.`flyway_schema_history` does not exist yet
Migrating schema `teamflow` to version "1 - create tasks"
Successfully applied 1 migration to schema `teamflow`, now at version v1
```

Flyway 先校验可发现的脚本，再创建 history，最后执行 V1。看见数据库里有 `tasks` 表还不够，成功反馈还要
包含 history 中的 V1 记录。

## 三、读懂 schema history

### 1. history 是执行账本

迁移后可以直接读取：

```sql
SELECT
    installed_rank,
    version,
    description,
    type,
    checksum,
    success
FROM flyway_schema_history
ORDER BY installed_rank;
```

V1 的结果形状如下，checksum 的具体整数由脚本字节内容计算，不应硬编码成业务判断：

```text
+----------------+---------+--------------+------+------------+---------+
| installed_rank | version | description  | type | checksum   | success |
+----------------+---------+--------------+------+------------+---------+
|              1 | 1       | create tasks | SQL  | <校验值>   |       1 |
+----------------+---------+--------------+------+------------+---------+
```

`installed_rank` 是本库的安装顺序，`version` 是脚本声明的版本，`success = 1` 表示该次执行成功。history
不是待手工维护的业务表；修改其中一行不会自动撤销已经发生的 DDL。

### 2. 重复执行先校验再判断待办

在没有新增脚本时再次运行同一命令：

```bash
mvn -B flyway:migrate
```

结果是：

```text
Successfully validated 1 migration
Current version of schema `teamflow`: 1
Schema `teamflow` is up to date. No migration necessary.
```

Flyway 没有重新执行 V1，因此不会遇到“表已经存在”，history 也不会新增第二条 V1。这种可重复启动来自
history 判断，不需要给每条 DDL 机械添加 `IF NOT EXISTS`。

### 3. checksum 保护已经成功的版本

如果 V1 执行后又修改文件，下一次 migrate 会在执行任何 pending migration 前失败：

```text
Validate failed: Migrations have failed validation
Migration checksum mismatch for migration version 1
Applied to database : <旧校验值>
Resolved locally    : <新校验值>
```

这里的正确恢复是从版本控制恢复原 V1，再把真正需要的变化写进 V2。`repair` 虽然能重写 history checksum，
却不会让数据库重新执行改过的 SQL；在数据库结构没有同步变化时使用它，只会抹掉漂移警报。

## 四、让已有数据通过结构变化

### 1. 先准备旧版本真实数据

假设 V1 已有一条任务：

```sql
INSERT INTO tasks (public_id, title, status)
VALUES ('TASK-1', 'Prepare release', 'DOING');
```

现在要增加必填优先级。直接新增没有默认值的 `NOT NULL` 列，会要求 MySQL 立刻为已有行提供合法值。迁移
需要先让旧数据处于可过渡状态。

### 2. V2 先扩展可兼容结构

`V2__add_task_priority.sql` 只增加可空列：

```sql
ALTER TABLE tasks
    ADD COLUMN priority VARCHAR(16) NULL AFTER status;
```

执行 V2 后，原任务仍存在，新增列暂时为 `NULL`：

```text
+-----------+-------+----------+
| public_id | status| priority |
+-----------+-------+----------+
| TASK-1    | DOING | NULL     |
+-----------+-------+----------+
```

这一步称为扩展：新 schema 暂时同时容纳旧行和未来新值。它没有降低最终合同，只是为数据转换留出明确阶段。

### 3. V3 回填后再收紧

`V3__require_task_priority.sql` 先更新旧行，再改变列约束：

```sql
UPDATE tasks
SET priority = 'NORMAL'
WHERE priority IS NULL;

ALTER TABLE tasks
    MODIFY COLUMN priority VARCHAR(16) NOT NULL DEFAULT 'NORMAL';
```

顺序不能反过来。UPDATE 完成后没有 `NULL`，ALTER 才能把数据库合同收紧。迁移完成后的结果是：

```text
+-----------+-------+----------+
| public_id | status| priority |
+-----------+-------+----------+
| TASK-1    | DOING | NORMAL   |
+-----------+-------+----------+
```

`DEFAULT 'NORMAL'` 负责以后省略 priority 的 INSERT，回填 UPDATE 负责迁移前已经存在的行；两者职责不同。

### 4. V4 用新版本补上取值约束

最后增加 V4：

```sql
ALTER TABLE tasks
    ADD CONSTRAINT chk_tasks_priority
    CHECK (priority IN ('LOW', 'NORMAL', 'HIGH'));
```

如果团队在 V3 完成后才决定增加这个约束，V4 正好记录真实决策顺序。不要为了让历史看起来更整齐而把它塞回
V1 或 V3。最终 history 应连续出现 V1 到 V4，每条成功状态都为 1。

## 五、区分两种失败恢复

### 1. 成功脚本变化是历史漂移

成功 V2 被修改后，数据库已经拥有的结构不会随本地文件自动变化。此时目标是恢复共同历史：

```text
1. 停止继续迁移。
2. 从版本控制恢复 V2 的原始内容。
3. 把新需求写入尚未使用的新版本。
4. 重新执行 migrate，并核对新版本记录。
```

这条路径不需要 `repair`。只要原文件恢复，数据库中的 applied checksum 与本地 resolved checksum 会重新一致。

### 2. 未成功脚本可能留下半成品

另一个实验使用 `teamflow_failure` schema 和项目根目录下的 `failure-migrations/`，不与主示例共享 history。先
创建隔离 schema：

```bash
docker exec teamflow-migration-db \
  mysql -uroot -plocal-root-pass \
  -e "CREATE DATABASE teamflow_failure CHARACTER SET utf8mb4; GRANT ALL PRIVILEGES ON teamflow_failure.* TO 'teamflow'@'%';"
```

在 `failure-migrations/` 中先只放 `V1__create_probe.sql`：

```sql
CREATE TABLE migration_probe (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (id)
) ENGINE = InnoDB;
```

使用独立 locations 执行 V1：

```bash
docker run --rm \
  --network teamflow-migration-net \
  -v "$PWD:/workspace" \
  -v teamflow-migration-m2:/root/.m2 \
  -w /workspace \
  -e TEAMFLOW_DB_URL=jdbc:mysql://teamflow-migration-db:3306/teamflow_failure \
  -e TEAMFLOW_DB_USER=teamflow \
  -e TEAMFLOW_DB_PASSWORD=local-teamflow-pass \
  maven:3.9.12-eclipse-temurin-25 \
  mvn -B -Dflyway.locations=filesystem:failure-migrations flyway:migrate
```

V1 成功后再加入 `V2__broken_change.sql`，其中包含两条 MySQL DDL，然后重复上面的 Maven 命令：

```sql
ALTER TABLE migration_probe
    ADD COLUMN note VARCHAR(40) NULL;

ALTER TABLE missing_table
    ADD COLUMN impossible_value INT NULL;
```

第一条成功，第二条因表不存在得到错误 1146，Maven 命令非零退出。MySQL DDL 会隐式提交，所以 `note` 列
仍然存在；Flyway history 同时留下 `success = 0` 的记录。用真实 schema 和 history 盘点半成品：

```bash
docker exec teamflow-migration-db \
  mysql -uteamflow -plocal-teamflow-pass teamflow_failure \
  -e "SHOW COLUMNS FROM migration_probe LIKE 'note'; SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank;"
```

结果中 `note` 存在，V1 的 `success` 为 1，V2 的 `success` 为 0。再次 migrate 会先报告：

```text
Detected failed migration to version 2
Please remove any half-completed changes then run repair
```

“整个文件失败”不等于“数据库完全没变化”。恢复前必须查询真实 schema 和 history，列出哪些语句已产生效果。

### 3. 先补偿数据库，再 repair history

在这个已核验的临时实验中，恢复顺序是：

```bash
docker exec teamflow-migration-db \
  mysql -uteamflow -plocal-teamflow-pass teamflow_failure \
  -e "ALTER TABLE migration_probe DROP COLUMN note;"
```

然后修正尚未成功的 V2，移除访问不存在表的语句。确认数据库已回到 V1 状态后执行：

```bash
docker run --rm \
  --network teamflow-migration-net \
  -v "$PWD:/workspace" \
  -v teamflow-migration-m2:/root/.m2 \
  -w /workspace \
  -e TEAMFLOW_DB_URL=jdbc:mysql://teamflow-migration-db:3306/teamflow_failure \
  -e TEAMFLOW_DB_USER=teamflow \
  -e TEAMFLOW_DB_PASSWORD=local-teamflow-pass \
  maven:3.9.12-eclipse-temurin-25 \
  mvn -B -Dflyway.locations=filesystem:failure-migrations flyway:repair

docker run --rm \
  --network teamflow-migration-net \
  -v "$PWD:/workspace" \
  -v teamflow-migration-m2:/root/.m2 \
  -w /workspace \
  -e TEAMFLOW_DB_URL=jdbc:mysql://teamflow-migration-db:3306/teamflow_failure \
  -e TEAMFLOW_DB_USER=teamflow \
  -e TEAMFLOW_DB_PASSWORD=local-teamflow-pass \
  maven:3.9.12-eclipse-temurin-25 \
  mvn -B -Dflyway.locations=filesystem:failure-migrations flyway:migrate
```

最后再次盘点：

```bash
docker exec teamflow-migration-db \
  mysql -uteamflow -plocal-teamflow-pass teamflow_failure \
  -e "SHOW COLUMNS FROM migration_probe LIKE 'note'; SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank;"
```

`note` 应重新存在，history 只包含一条成功的 V1 和一条成功的 V2，不再保留失败 V2：

```text
Field  Type         Null  Default
note   varchar(40)  YES   NULL

version  description    success
1        create probe   1
2        broken change  1
```

`repair` 删除失败记录，后续 migrate 才重新执行修正后的 V2。Flyway 自己也会提示“Manual cleanup ... may
still be required”；因此不能把 `repair` 理解为自动回滚数据库。

生产环境是否允许直接补偿、应从备份恢复还是要走单独变更流程，需要由发布与恢复方案决定。本课只建立工具
合同，不用这个临时实验替代生产备份和发布审批。

## 六、迁移中的典型错误

:::pitfalls
### 修改已经成功的 migration

**触发条件：** V2 已经在共享数据库成功执行，之后直接编辑同一个文件补充约束。

**原因：** history 保存的是执行时 checksum，本地文件已经代表另一份内容。

**后果：** 后续 migrate 在执行新脚本前因 checksum mismatch 失败，不同环境的 V2 也可能产生不同结构。

**错误示例：**

```sql
-- 在已经成功的 V2 中追加
ALTER TABLE tasks ADD CONSTRAINT chk_tasks_priority
CHECK (priority IN ('LOW', 'NORMAL', 'HIGH'));
```

**正确写法：**

```sql
-- V4__constrain_task_priority.sql
ALTER TABLE tasks ADD CONSTRAINT chk_tasks_priority
CHECK (priority IN ('LOW', 'NORMAL', 'HIGH'));
```

**验证方式：** 临时修改 V2 后运行 migrate 应得到 checksum mismatch；恢复 V2 并新增 V4 后应升级到 V4。

### 用 IF NOT EXISTS 掩盖版本问题

**触发条件：** 为了让脚本能反复执行，给每条建表和增列语句添加存在性判断，却不读取 history。

**原因：** 对象存在只说明名称相同，不证明列类型、约束和数据转换与目标版本一致。

**后果：** 命令可能成功退出，但数据库处于无法由版本号解释的混合状态。

**错误示例：**

```sql
CREATE TABLE IF NOT EXISTS tasks (id BIGINT PRIMARY KEY);
```

**正确写法：**

```sql
-- V1__create_tasks.sql 只由 Flyway 成功执行一次
CREATE TABLE tasks (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (id)
) ENGINE = InnoDB;
```

**验证方式：** 连续运行两次 migrate；第二次应由 history 返回 no migration necessary，而不是重放 V1。

### 对已有数据直接增加必填列

**触发条件：** tasks 已有行，一步增加没有回填策略的 `priority NOT NULL`。

**原因：** schema 收紧发生时，旧行还没有满足新合同的值。

**后果：** migration 失败，或被一个没有业务含义的隐式值填充。

**错误示例：**

```sql
ALTER TABLE tasks
    ADD COLUMN priority VARCHAR(16) NOT NULL;
```

**正确写法：**

```sql
ALTER TABLE tasks ADD COLUMN priority VARCHAR(16) NULL;
UPDATE tasks SET priority = 'NORMAL' WHERE priority IS NULL;
ALTER TABLE tasks MODIFY COLUMN priority VARCHAR(16) NOT NULL DEFAULT 'NORMAL';
```

**验证方式：** 在 V1 后先插入任务，再分别执行扩展与收紧版本；旧任务最终应为 `NORMAL` 且列为 NOT NULL。

### 把 repair 当成数据库回滚

**触发条件：** MySQL migration 中前一条 ALTER 已成功、后一条失败，未检查 schema 就直接执行 repair。

**原因：** repair 只调整 `flyway_schema_history`，不会删除已经隐式提交的列或表。

**后果：** 下次 migrate 可能因列已存在再次失败，history 与真实 schema 继续不一致。

**错误示例：**

```bash
mvn -B flyway:repair
mvn -B flyway:migrate
```

**正确写法：**

```sql
-- 先根据实际盘点结果补偿本实验留下的列
ALTER TABLE migration_probe DROP COLUMN note;
```

**验证方式：** 失败后先用 SHOW COLUMNS 与 history 确认半成品；补偿后 repair，再 migrate，最终 V2 才成功。

### 只加入 flyway-mysql

**触发条件：** Maven Plugin 有 `flyway-mysql` 依赖，却没有 Connector/J。

**原因：** 数据库模块负责 Flyway 的 MySQL 支持，JDBC driver 负责处理 `jdbc:mysql` 连接，两者不是同一个包。

**后果：** migrate 在读取 schema 前失败，典型消息包含 `No JDBC driver found`。

**错误示例：**

```xml
<dependency>
  <groupId>org.flywaydb</groupId>
  <artifactId>flyway-mysql</artifactId>
  <version>${flyway.version}</version>
</dependency>
```

**正确写法：**

```xml
<dependency>
  <groupId>com.mysql</groupId>
  <artifactId>mysql-connector-j</artifactId>
  <version>${mysql.version}</version>
</dependency>
```

**验证方式：** 从空 Maven 缓存运行 migrate；缺驱动版本应失败，补齐两个插件依赖后应识别 `MySQL 8.4`。
:::

## 七、完整迁移闭环

### 1. 项目结构与 POM

最终目录如下：

```text
teamflow-migrations/
├── pom.xml
└── src/main/resources/db/migration/
    ├── V1__create_tasks.sql
    ├── V2__add_task_priority.sql
    ├── V3__require_task_priority.sql
    └── V4__constrain_task_priority.sql
```

`pom.xml` 的完整内容是：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>dev.teamflow</groupId>
  <artifactId>teamflow-migrations</artifactId>
  <version>1.0.0</version>

  <properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <flyway.version>13.3.0</flyway.version>
    <mysql.version>26.7.0</mysql.version>
  </properties>

  <build>
    <plugins>
      <plugin>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-maven-plugin</artifactId>
        <version>${flyway.version}</version>
        <dependencies>
          <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-mysql</artifactId>
            <version>${flyway.version}</version>
          </dependency>
          <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <version>${mysql.version}</version>
          </dependency>
        </dependencies>
        <configuration>
          <url>${env.TEAMFLOW_DB_URL}</url>
          <user>${env.TEAMFLOW_DB_USER}</user>
          <password>${env.TEAMFLOW_DB_PASSWORD}</password>
          <locations>
            <location>filesystem:src/main/resources/db/migration</location>
          </locations>
          <validateMigrationNaming>true</validateMigrationNaming>
        </configuration>
      </plugin>
    </plugins>
  </build>
</project>
```

四个 migration 使用前文已经给出的 SQL，按文件名分别保存。开始反馈环时先只保留 V1；在每一步成功后再创建
下一个版本，这样才能观察旧数据怎样跨版本演进。

### 2. 启动隔离 MySQL

下面的密码只属于可删除的本地练习容器：

```bash
docker network create teamflow-migration-net

docker run -d \
  --name teamflow-migration-db \
  --network teamflow-migration-net \
  -e MYSQL_ROOT_PASSWORD=local-root-pass \
  -e MYSQL_DATABASE=teamflow \
  -e MYSQL_USER=teamflow \
  -e MYSQL_PASSWORD=local-teamflow-pass \
  mysql:8.4

until docker exec teamflow-migration-db \
  mysql -h127.0.0.1 -uroot -plocal-root-pass -e "SELECT 1" >/dev/null 2>&1; do
  sleep 1
done
```

循环通过 TCP 完成认证并执行 `SELECT 1` 后再迁移，不能用可能命中初始化临时服务器的默认 socket 作为就绪
证据。Maven 容器使用项目目录和同一个 Docker network：

```bash
docker run --rm \
  --network teamflow-migration-net \
  -v "$PWD:/workspace" \
  -v teamflow-migration-m2:/root/.m2 \
  -w /workspace \
  -e TEAMFLOW_DB_URL=jdbc:mysql://teamflow-migration-db:3306/teamflow \
  -e TEAMFLOW_DB_USER=teamflow \
  -e TEAMFLOW_DB_PASSWORD=local-teamflow-pass \
  maven:3.9.12-eclipse-temurin-25 \
  mvn -B flyway:migrate
```

### 3. 逐步执行并观察旧数据

只有 V1 时先运行 migrate，再插入旧数据：

```bash
docker exec teamflow-migration-db \
  mysql -uteamflow -plocal-teamflow-pass teamflow \
  -e "INSERT INTO tasks (public_id, title, status) VALUES ('TASK-1', 'Prepare release', 'DOING');"
```

创建 V2 后重新执行相同 Maven 命令，查询应看到 priority 为 `NULL`。创建 V3、V4 后再执行，最后检查：

```bash
docker exec teamflow-migration-db \
  mysql -uteamflow -plocal-teamflow-pass teamflow \
  -e "SELECT public_id, status, priority FROM tasks; SELECT version, description, success FROM flyway_schema_history WHERE type = 'SQL' ORDER BY installed_rank;"
```

预期结果：

```text
public_id  status  priority
TASK-1     DOING   NORMAL

version  description              success
1        create tasks             1
2        add task priority        1
3        require task priority    1
4        constrain task priority  1
```

再次运行相同 migrate 命令应显示 `Schema teamflow is up to date. No migration necessary.`，再查 history 仍然
只有四条 SQL migration。

### 4. 验证 checksum 防线

临时在 V2 末尾增加一行注释并运行 migrate，应非零退出且包含：

```text
Migration checksum mismatch for migration version 2
```

把 V2 恢复为前文完全相同的内容，不执行 repair。若确实需要新结构，创建 V5 后再次 migrate。这样 checksum
恢复一致，新需求也拥有自己的版本。

恢复 V2 后保留容器和已有数据，继续完成下面的练习；V7 验收结束后再统一清理。

## 八、迁移一个新的必填字段

:::exercise
### 为已有任务增加审核人

**要求：** 在完整示例的 V4 之后增加 `reviewer VARCHAR(80)`。V5 只扩展可空列，V6 把旧行回填为
`unassigned`，V7 再改成 `NOT NULL DEFAULT 'unassigned'`。不得修改 V1 到 V4，也不得删除 TASK-1 重建数据。

**验收：**

```text
TASK-1 | NORMAL | unassigned
history 中 V1 到 V7 均 success = 1
重复 migrate 显示 no migration necessary
reviewer 的 Null 为 NO，Default 为 unassigned
```
:::

### 1. 参考实现

`V5__add_task_reviewer.sql`：

```sql
ALTER TABLE tasks
    ADD COLUMN reviewer VARCHAR(80) NULL AFTER priority;
```

`V6__backfill_task_reviewer.sql`：

```sql
UPDATE tasks
SET reviewer = 'unassigned'
WHERE reviewer IS NULL;
```

`V7__require_task_reviewer.sql`：

```sql
ALTER TABLE tasks
    MODIFY COLUMN reviewer VARCHAR(80) NOT NULL DEFAULT 'unassigned';
```

三个文件就位后运行与完整示例相同的 Maven 容器命令。不要把三步合并回 V5；分开的版本能让每个状态都可
检查，也能让应用发布在扩展与收紧之间留出兼容窗口。

### 2. 验收结果

执行：

```bash
docker exec teamflow-migration-db \
  mysql -uteamflow -plocal-teamflow-pass teamflow \
  -e "SELECT public_id, priority, reviewer FROM tasks; SHOW COLUMNS FROM tasks LIKE 'reviewer'; SELECT version, success FROM flyway_schema_history WHERE type = 'SQL' ORDER BY installed_rank;"
```

关键结果为：

```text
public_id  priority  reviewer
TASK-1     NORMAL    unassigned

Field     Type         Null  Default
reviewer  varchar(80)  NO    unassigned

version  success
1        1
2        1
3        1
4        1
5        1
6        1
7        1
```

最后再次执行 migrate，确认没有第八条记录且输出 no migration necessary。至此，同一套版本脚本同时覆盖了
空库完整创建、已有数据升级、重复启动、历史防篡改和失败恢复的核心反馈环。

完成主示例和练习后再清理隔离环境：

```bash
docker stop teamflow-migration-db
docker rm teamflow-migration-db
docker network rm teamflow-migration-net
docker volume rm teamflow-migration-m2
```
