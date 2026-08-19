---
id: backend.java.learn.intermediate.spring-boot-mysql-mybatis-persistence-bridge
type: lesson
title: Spring Boot、MySQL 与 MyBatis 最小持久化闭环
summary: 用一张真实 MySQL 任务表贯通 DataSource、Flyway、MyBatis、分层 CRUD、事务提交与回滚
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 150
objectives:
  - 用自己的话解释数据库、表、行、列、主键、约束和连接
  - 为 Spring Boot 4.1.0 配置外部 DataSource，并从启动失败中定位错误 host
  - 用一个 Flyway V1 migration 创建 tasks 表并读取 schema history
  - 使用 MyBatis Mapper、井号参数绑定和 Param 完成最小 CRUD
  - 保持 Controller、Service、Repository、Mapper 与 DataSource 的单向调用路径
  - 用生成主键和受影响行数判断创建、更新与删除是否命中
  - 通过 curl 与独立 MySQL 连接证明事务提交后的数据真实可见
  - 用重复 request key 触发唯一约束，并确认数据库只保留第一行
  - 用测试专用 Spring 代理 bean 证明运行时异常回滚、正常返回提交
  - 区分现代 Java 25 / Spring Boot 4.1 与 Java 8 / Spring Boot 2.3 的依赖边界
prerequisites:
  - backend.java.learn.intermediate.layers-dto-and-service-boundaries
related: []
tags:
  - Spring Boot
  - MySQL
  - MyBatis
  - Flyway
  - DataSource
  - 事务
appliesTo: Java 25 / Spring Boot 4.1.0 / MyBatis Starter 4.1.0 / MySQL 8.4.11；旧项目补充适用于 Java 8 / Spring Boot 2.3.12.RELEASE
modernBaseline:
  java: "25"
  springBoot: 4.1.0
  springFramework: 7.0.8
  mybatisStarter: 4.1.0
  mybatisSpring: 4.1.0
  mybatis: 3.5.19
  flyway: 12.4.0
  mysqlConnectorJ: 9.7.0
  mysql: 8.4.11
legacyBaseline:
  java: "8"
  springBoot: 2.3.12.RELEASE
  springFramework: 5.2.15.RELEASE
  mybatisStarter: 2.1.4
  mybatis: 3.5.6
  mybatisSpring: 2.0.6
  flyway: 6.4.4
  mysqlConnectorJ: 8.0.25
verifiedAt: 2026-08-16
sources:
  - id: oracle-java-support-roadmap
    title: Oracle Java SE Support Roadmap
    url: https://www.oracle.com/java/technologies/java-se-support-roadmap.html
    sourceType: official-reference
    appliesTo: 2026-08-15 快照
    claims:
      - Java 25 是 LTS 版本
  - id: spring-boot-system-requirements
    title: Spring Boot 4.1 System Requirements
    url: https://docs.spring.io/spring-boot/4.1/system-requirements.html
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - 支持 Java 17 至 26，并要求 Spring Framework 7.0.8 或以上
  - id: spring-boot-sql-databases
    title: Spring Boot SQL Databases
    url: https://docs.spring.io/spring-boot/4.1/reference/data/sql.html
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - spring.datasource 属性配置外部 DataSource
      - JDBC starter 默认选择 HikariCP 作为连接池
  - id: spring-boot-database-initialization
    title: Spring Boot Database Initialization
    url: https://docs.spring.io/spring-boot/4.1/how-to/data-initialization.html
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Flyway 默认从 classpath db/migration 读取版本化脚本
      - MySQL 支持需要 flyway-mysql 模块
      - schema 只应使用一种初始化机制
  - id: spring-boot-410-bom
    title: Spring Boot 4.1.0 Dependency BOM
    url: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-dependencies/4.1.0/spring-boot-dependencies-4.1.0.pom
    sourceType: source-code
    appliesTo: Spring Boot 4.1.0
    claims:
      - 管理 Spring Framework 7.0.8、Flyway 12.4.0 和 Connector/J 9.7.0
  - id: spring-boot-flyway-starter
    title: spring-boot-starter-flyway 4.1.0 POM
    url: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-flyway/4.1.0/spring-boot-starter-flyway-4.1.0.pom
    sourceType: source-code
    appliesTo: Spring Boot 4.1.0
    claims:
      - Starter 组合 Boot Flyway 自动配置、JDBC starter 与 DataSource 支持
  - id: spring-transactional
    title: Spring Framework Using Transactional
    url: https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - 默认传播为 REQUIRED，proxy 模式只拦截经过代理的外部调用
  - id: spring-transaction-rollback
    title: Spring Framework Rolling Back a Declarative Transaction
    url: https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/rolling-back.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - 默认由未处理的 RuntimeException 或 Error 触发回滚
      - checked exception 默认不触发回滚
  - id: mybatis-starter-introduction
    title: MyBatis Spring Boot Starter Introduction
    url: https://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/
    sourceType: official-reference
    appliesTo: MyBatis Starter 4.x
    claims:
      - Starter 探测 DataSource、创建 SqlSessionFactory 与 SqlSessionTemplate 并扫描 Mapper
  - id: mybatis-starter-410-metadata
    title: MyBatis Starter Maven Metadata
    url: https://repo.maven.apache.org/maven2/org/mybatis/spring/boot/mybatis-spring-boot-starter/maven-metadata.xml
    sourceType: source-code
    appliesTo: 2026-08-15 快照
    claims:
      - release 版本为 4.1.0
  - id: mybatis-starter-410-parent
    title: MyBatis Spring Boot 4.1.0 Parent POM
    url: https://repo.maven.apache.org/maven2/org/mybatis/spring/boot/mybatis-spring-boot/4.1.0/mybatis-spring-boot-4.1.0.pom
    sourceType: source-code
    appliesTo: MyBatis Starter 4.1.0
    claims:
      - 使用 Spring Boot 4.1.0、MyBatis-Spring 4.1.0 与 MyBatis 3.5.19
  - id: mybatis-mapper-statements
    title: MyBatis Mapper XML Statements
    url: https://mybatis.org/mybatis-3/sqlmap-xml.html
    sourceType: official-reference
    appliesTo: MyBatis 3.5.19
    claims:
      - 井号表达式通过 prepared parameter 绑定值
      - 美元表达式会把未修改字符串直接注入 SQL，不得接收未经控制的用户输入
      - select、insert、update 和 delete statement 必须匹配参数与结果
  - id: mybatis-java-api
    title: MyBatis Java API
    url: https://mybatis.org/mybatis-3/java-api.html
    sourceType: api-doc
    appliesTo: MyBatis 3.5.19
    claims:
      - Param 为 Mapper 多参数提供稳定名称
      - 写操作返回受影响行数
  - id: mybatis-spring-transactions
    title: MyBatis-Spring Transactions
    url: https://mybatis.org/spring/transactions.html
    sourceType: official-reference
    appliesTo: MyBatis-Spring 4.1.0
    claims:
      - MyBatis 参与 Spring 管理的事务，不应手工提交或回滚 SqlSession
  - id: mysql-8411-release
    title: MySQL 8.4.11 Release Notes
    url: https://dev.mysql.com/doc/relnotes/mysql/8.4/en/news-8-4-11.html
    sourceType: release-note
    appliesTo: MySQL 8.4.11
    claims:
      - MySQL 8.4.11 于 2026-07-28 发布
  - id: mysql-security-guidelines
    title: MySQL 8.4 Security Guidelines
    url: https://dev.mysql.com/doc/refman/8.4/en/security-guidelines.html
    sourceType: security-standard
    appliesTo: MySQL 8.4
    claims:
      - 不应授予超过应用所需的权限，也不应让应用以 root 账户连接
  - id: owasp-secrets-management
    title: OWASP Secrets Management Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: 临时数据库凭据
    claims:
      - 凭据不应硬编码进源码或容器定义，也不应以明文进入日志
  - id: mysql-create-table
    title: MySQL 8.4 CREATE TABLE Statement
    url: https://dev.mysql.com/doc/refman/8.4/en/create-table.html
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - 表由列与约束组成，主键唯一且非空，AUTO_INCREMENT 可生成主键
  - id: mysql-crud
    title: MySQL 8.4 Data Manipulation Statements
    url: https://dev.mysql.com/doc/refman/8.4/en/sql-data-manipulation-statements.html
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - INSERT、SELECT、UPDATE 和 DELETE 分别写入、读取、修改与删除行
  - id: mysql-commit-rollback
    title: MySQL 8.4 InnoDB Autocommit Commit and Rollback
    url: https://dev.mysql.com/doc/refman/8.4/en/innodb-autocommit-commit-rollback.html
    sourceType: official-reference
    appliesTo: MySQL 8.4 / InnoDB
    claims:
      - COMMIT 使事务修改持久可见，ROLLBACK 取消当前事务修改
  - id: connector-j-url
    title: Connector J Connection URL Syntax
    url: https://dev.mysql.com/doc/connector-j/en/connector-j-reference-jdbc-url-format.html
    sourceType: official-reference
    appliesTo: Connector/J 9.7.0
    claims:
      - 普通单主机 URL 使用 jdbc:mysql 并指定 host、port 与 database
  - id: flyway-versioned-migrations
    title: Flyway Versioned Migrations
    url: https://documentation.red-gate.com/flyway/flyway-concepts/migrations/versioned-migrations
    sourceType: official-reference
    appliesTo: Flyway 12.x
    claims:
      - 版本化 migration 按顺序只应用一次，checksum 用于检测已执行脚本变化
  - id: flyway-schema-history
    title: Flyway Schema History Table
    url: https://documentation.red-gate.com/flyway/flyway-concepts/migrations/flyway-schema-history-table
    sourceType: official-reference
    appliesTo: Flyway 12.x
    claims:
      - schema history 保存版本、checksum 与成功状态
  - id: flyway-mysql-1240
    title: flyway-mysql 12.4.0 POM
    url: https://repo.maven.apache.org/maven2/org/flywaydb/flyway-mysql/12.4.0/flyway-mysql-12.4.0.pom
    sourceType: source-code
    appliesTo: Flyway 12.4.0
    claims:
      - MySQL 数据库支持位于独立 flyway-mysql 模块
  - id: spring-boot-2312-requirements
    title: Spring Boot 2.3.12 Getting Started
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - 旧线要求 Java 8，并使用 Spring Framework 5.2.15.RELEASE 或以上
  - id: spring-boot-2312-bom
    title: Spring Boot 2.3.12 Dependency BOM
    url: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-dependencies/2.3.12.RELEASE/spring-boot-dependencies-2.3.12.RELEASE.pom
    sourceType: source-code
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - 管理 Flyway 6.4.4 与 mysql-connector-java 8.0.25
  - id: mybatis-starter-214-parent
    title: MyBatis Spring Boot 2.1.4 Parent POM
    url: https://repo.maven.apache.org/maven2/org/mybatis/spring/boot/mybatis-spring-boot/2.1.4/mybatis-spring-boot-2.1.4.pom
    sourceType: source-code
    appliesTo: MyBatis Starter 2.1.4
    claims:
      - 使用 MyBatis 3.5.6 与 MyBatis-Spring 2.0.6
projectEvidence: []
---

# Spring Boot、MySQL 与 MyBatis 最小持久化闭环

## 一、为什么需要学习

前面的课程已经把一次 HTTP 请求拆成 Controller、Service、Repository 等职责，但内存实现一旦停止
进程，任务就消失了。本课把这条调用路径连接到一台真实 MySQL：应用启动时先验证连接并执行数据库
迁移，请求进入后再由 MyBatis 使用参数绑定执行 SQL。

“对象有了 ID”不等于“数据已经提交”。你将同时从 HTTP 和新的 MySQL 连接读取结果，并主动制造错误
host、重复唯一键和运行时异常。只有成功路径可重复、失败路径可观察、修正后能恢复，才算建立了最小
持久化闭环。

本课只使用一张 `tasks` 业务表和一个 migration。JOIN、复杂动态 SQL、索引优化、锁、备份恢复、
MyBatis-Plus、分区与分片都留给数据库专项，不会在桥接课中展开。

## 二、学习目标

- 能解释数据库、表、行、列、主键、约束和连接之间的关系。
- 能让 Spring Boot 从环境变量创建 DataSource，并识别连接失败。
- 能用 Flyway V1 migration 建表并读取 schema history。
- 能用 Mapper 的静态 SQL 和参数绑定完成最小 CRUD。
- 能保持 Controller 到 MySQL 的单向分层调用。
- 能用真实 MySQL 证明提交、约束失败和运行时异常回滚。
- 能说明 Java 8 / Spring Boot 2.3 旧线与现代依赖组合的差异。

## 三、前置术语

- **HTTP 请求：** 客户端发给 Web API 的方法、路径、头和 body。
- **DTO：** 只承载某个边界允许输入或输出的字段，不直接充当数据库行模型。
- **Service：** 用应用语言编排一个完整用例，并持有事务边界。
- **Repository：** 用领域或应用术语表达存取能力，隔离具体持久化技术。
- **环境变量：** 由运行环境注入的键值；本课用它传数据库 URL、用户名和临时密码。

## 四、零基础知识点详解

### 1. 数据库与连接

**它是什么：** 数据库 `taskdb` 是 MySQL 服务器中一组命名对象；连接是应用与服务器之间的一次
JDBC 会话。URL 中的 host、port 和 database 分别决定连接哪台主机、哪个端口和哪个数据库。

**为什么需要：** 代码、凭据和数据库都正确，连接才能建立。只看到 Java 进程存在，不能证明它能读写
MySQL。

**什么时候使用：** 应用需要访问当前 `taskdb` 时建立连接；本课不把连接扩展为读写分离、多主机故障
切换或生产 TLS 配置。

**最小代码：**

```text
jdbc:mysql://java-i12-mysql:3306/taskdb
```

**如何运行：** 在同一临时 Docker network 中启动 MySQL 与应用，把 URL 通过 `TASK_DB_URL` 注入。

**预期结果：** DataSource 取得连接，Flyway 日志显示 `Database: ... (MySQL 8.4)`。

**失败路径：** 只把 host 改为 `java-i12-missing`，应用非零退出，端口不能访问。

**恢复后复验：** 恢复 `java-i12-mysql` 后使用同一命令启动，`GET /api/tasks` 返回 200。

**常见误区：** 把“容器正在运行”当成“指定数据库已经可连接”。

### 2. 表、行与列

**它是什么：** 表定义同类记录的结构；`tasks` 的一行代表一个任务，一列代表所有任务共有的字段
合同，例如 `title` 或 `status`。

**为什么需要：** Java 对象只存在于当前进程，表让任务在请求结束甚至应用重启后仍可读取。

**什么时候使用：** 需要把一个任务持久化并按字段读取时使用；本课不讨论多表关系、JOIN 或范式设计。

**最小代码：**

```sql
SELECT id, request_key, title, status, created_at
FROM tasks
WHERE id = 1;
```

**如何运行：** 先创建任务，再从新的 MySQL client 连接执行这条查询。

**预期结果：** 返回一行，五列分别对应同一个任务的主键、请求键、标题、状态和创建时间。

**失败路径：** 查询不存在的表名 `task`，MySQL 报表不存在，而不是返回空任务。

**恢复后复验：** 改回 migration 创建的 `tasks`，同一 ID 能再次读取。

**常见误区：** 把 Java 类名、数据库名和表名视为同一个概念。

### 3. 主键与约束

**它是什么：** `id` 是每行唯一且非空的主键，由 `AUTO_INCREMENT` 生成；唯一约束保证
`request_key` 不重复，CHECK 约束限制空白标题和非法状态。

**为什么需要：** Controller 校验只保护经过当前入口的请求，数据库约束还保护其他程序、脚本和并发
写入。

**什么时候使用：** 需要由数据库守住行身份和不可违反的数据规则时使用；约束不替代 Controller 的
友好输入反馈，也不在本课承担跨表业务规则。

**最小代码：**

```sql
PRIMARY KEY (id),
CONSTRAINT uk_tasks_request_key UNIQUE (request_key),
CONSTRAINT chk_tasks_status CHECK (status IN ('OPEN', 'DONE'))
```

**如何运行：** 连续两次写入相同 `request_key`，第二次保持其他字段不同。

**预期结果：** 第一次创建成功，第二次非 2xx，数据库 count 仍为 1。

**失败路径：** 删除唯一约束后，两个请求都成功，`request_key` 不再能作为稳定探针。

**恢复后复验：** 重建干净临时库并恢复 V1，重复写入重新失败；换新 key 又能创建。

**常见误区：** 认为已经有 Java 校验就可以删除数据库唯一约束或 CHECK。

### 4. DataSource

**它是什么：** DataSource 是框架取得 JDBC `Connection` 的入口。Boot 根据
`spring.datasource.*` 创建它，并由连接池复用有限数量的连接。

**为什么需要：** Service 和 Mapper 不应各自拼 URL、加载驱动或保存密码；连接信息应集中在运行边界。

**什么时候使用：** Spring 管理的 JDBC/MyBatis 访问需要统一取得连接时使用；本课不手写连接池，也不
调优连接池容量。

**最小代码：**

```properties
spring.datasource.url=${TASK_DB_URL}
spring.datasource.username=${TASK_DB_USERNAME}
spring.datasource.password=${TASK_DB_PASSWORD}
```

**如何运行：** 在启动容器时分别注入 URL、临时用户名和临时密码，仓库文件不写真实凭据。

**预期结果：** Hikari 日志显示连接池启动并取得 MySQL 连接。

**失败路径：** 用户名、密码或 URL 任一错误都会让 Flyway/DataSource 初始化失败。

**恢复后复验：** 只恢复错误的那一个值，再启动并执行真实 SELECT。

**常见误区：** 在 Mapper 或 Service 中直接调用 `DriverManager`，绕过 Spring 管理的 DataSource。

### 5. 连接失败反馈环

**它是什么：** 连接失败反馈环固定唯一变量，证明应用在数据库不可用时会明确失败，而不是提供一个假
健康的 HTTP 端口。

**为什么需要：** 一次失败如果同时改 host、密码和端口，就无法判断真正原因。

**什么时候使用：** 需要证明错误数据库地址会阻止应用假启动时使用；它不代替生产健康探针、重试或
容灾设计。

**最小代码：**

```text
TASK_DB_URL=jdbc:mysql://java-i12-missing:3306/taskdb
```

**如何运行：** 保持 jar、数据库和凭据不变，以错误 host 前台启动应用并记录退出码。

**预期结果：** 非零退出，根因链包含无法取得 JDBC 连接或 host 解析失败，HTTP 返回码为 `000`。

**失败路径：** 禁用 Flyway 后应用可能延迟到第一次请求才暴露连接错误，这不是本课的启动 Gate。

**恢复后复验：** 重新启用 Flyway 并恢复正确 host，启动、migration 与 GET 三项都成功。

**常见误区：** 同时修改 host、端口和凭据，再凭一条异常消息猜测根因。

### 6. Flyway 版本化 migration

**它是什么：** Flyway 按版本顺序执行 `db/migration` 下的脚本，并用
`flyway_schema_history` 记录版本、checksum 与成功状态。

**为什么需要：** 把 DDL 放进可追踪脚本，环境才能从同一起点重建；手工点数据库无法形成可重复合同。

**什么时候使用：** 数据库结构需要随应用版本可重复演进时使用；本课只建立 V1，不展开多环境发布、
回滚策略或生产修复流程。

**最小代码：**

```text
src/main/resources/db/migration/V1__create_tasks.sql
```

**如何运行：** 用空 `taskdb` 启动应用，观察 Flyway 校验、创建 history 和迁移到 version 1。

**预期结果：** history 中唯一 SQL migration 的 `version='1'` 且 `success=1`。

**失败路径：** 已执行 V1 后原地修改文件，下一次 validate 报 checksum 不一致。

**恢复后复验：** 本课临时环境重建空库再执行原始 V1；正式环境则新增后续版本，不能硬改 history。

**常见误区：** 把已经执行的 V1 当成普通 SQL 文件原地修改。

### 7. 一张 tasks 表

**它是什么：** `tasks` 只有 `id`、`request_key`、`title`、`status`、`created_at` 五列，是本课唯一
业务表。

**为什么需要：** 单表足以观察持久化边界，多表关系会把注意力带到 JOIN、外键与查询设计。

**什么时候使用：** 第一次贯通 Web 到真实数据库时使用这张最小表；用户、标签、审计或附件模型不在
本课增加。

**最小代码：**

```sql
CREATE TABLE tasks (
  id BIGINT NOT NULL AUTO_INCREMENT,
  request_key VARCHAR(64) NOT NULL,
  title VARCHAR(120) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id)
) ENGINE = InnoDB;
```

**如何运行：** 由唯一 V1 创建表，不再保留 `schema.sql` 或第二个 migration。

**预期结果：** information schema 中只有一张业务表；history 是工具元数据表，不是业务模型。

**失败路径：** 同时启用 `schema.sql` 与 Flyway，重复 DDL 可能让启动失败。

**恢复后复验：** 删除重复初始化机制，重建空库，history 只记录 V1。

**常见误区：** 把 Flyway 的 history 工具表算成第二张业务表。

### 8. Mapper interface

**它是什么：** Mapper interface 把 Java 方法绑定到静态 SQL statement；starter 创建其代理并连接
`SqlSessionTemplate`。

**为什么需要：** 调用者只传 Java 参数，不直接创建 JDBC statement 或管理 SqlSession 生命周期。

**什么时候使用：** 需要把一组静态 SQL 暴露为类型明确的 Java 数据访问接口时使用；复杂动态 SQL、
XML Mapper 与 MyBatis-Plus 不在本课范围。

**最小代码：**

```java
@Mapper
public interface TaskMapper {
    /**
     * 按主键读取任务行。
     *
     * @param id 任务主键
     * @return 任务行；不存在时为 null
     */
    @Select("SELECT id, request_key, title, status, created_at FROM tasks WHERE id = #{id}")
    TaskRow findById(@Param("id") long id);
}
```

**如何运行：** 把 Mapper 放在应用入口的子包，启动后由 Repository 调用代理方法。

**预期结果：** MyBatis 找到 DataSource，执行 SELECT 并把下划线列映射到驼峰属性。

**失败路径：** Mapper 不在扫描范围或缺少 `@Mapper`，启动时无法注入 `TaskMapper`。

**恢复后复验：** 恢复注解与包位置，Repository 构造器注入成功，GET 返回数据库行。

**常见误区：** 认为 interface 会自行执行 SQL，忽略 starter 创建代理和 Mapper 扫描的前提。

### 9. 参数绑定与 Param

**它是什么：** `#{...}` 把 Java 值交给 prepared parameter；`@Param` 给多个简单参数稳定命名。

**为什么需要：** 参数值与 SQL 结构必须分离，不能把请求标题直接拼进 SQL 字符串。

**什么时候使用：** 请求数据作为 SQL 值、Mapper 方法有多个简单参数时使用；表名、列名等 SQL 结构
不能用 `#{}` 代替，且本课不接受客户端动态选择这些结构。

**最小代码：**

```java
/**
 * 更新任务状态。
 *
 * @param id 任务主键
 * @param status 新状态
 * @return 受影响行数
 */
@Update("UPDATE tasks SET status = #{status} WHERE id = #{id}")
int updateStatus(@Param("id") long id, @Param("status") String status);
```

**如何运行：** 用 ID 与状态调用方法，检查返回的受影响行数。

**预期结果：** 命中一行时返回 1；参数只作为值发送给数据库。

**失败路径：** 去掉多参数的稳定名称后 statement 可能找不到 `id` 或 `status`。

**恢复后复验：** 恢复两个 `@Param`，更新返回 1，重新读取状态为 `DONE`。

**常见误区：** 把 `#{}` 与 `${}` 当作等价占位方式，或省略多参数的稳定名称。

### 10. Create 与生成主键

**它是什么：** INSERT 创建新行；`useGeneratedKeys` 把 MySQL 生成的 ID 回填到可变 `TaskRow.id`。

**为什么需要：** HTTP 客户端不应决定数据库主键，后续读取又需要真实 ID。

**什么时候使用：** 新增任务并需要把数据库生成 ID 返回给调用者时使用；本课不使用客户端分配 ID，
也不比较分布式 ID 方案。

**最小代码：**

```java
/**
 * 插入任务行并回填生成主键。
 *
 * @param row 待插入任务行
 * @return 受影响行数
 */
@Insert("INSERT INTO tasks (request_key, title, status) VALUES (#{requestKey}, #{title}, #{status})")
@Options(useGeneratedKeys = true, keyProperty = "id")
int insert(TaskRow row);
```

**如何运行：** 先构造 `id=null` 的 row，调用 insert，再读取 `row.getId()`。

**预期结果：** insert 返回 1，ID 变为正整数，按该 ID 可读回相同字段。

**失败路径：** `keyProperty` 写错时行可能已经提交，但 Java 对象仍没有 ID。

**恢复后复验：** 改回 `id`，重建干净请求键后重新创建并 GET。

**常见误区：** 只检查 insert 返回 1，却没有确认生成 ID 已回填且可用于读取。

### 11. Read 与显式列

**它是什么：** SELECT 按主键读取指定列，MyBatis 再映射成 persistence adapter 内部的 `TaskRow`。

**为什么需要：** 显式列能让 SQL 与行模型的字段合同清楚可见，避免 `SELECT *` 随表结构变化。

**什么时候使用：** 已知任务主键并需要稳定映射当前五列时使用；本课不讲条件组合、列表筛选或 JOIN。

**最小代码：**

```java
/**
 * 按主键读取任务行。
 *
 * @param id 任务主键
 * @return 任务行；不存在时为 null
 */
@Select("SELECT id, request_key, title, status, created_at FROM tasks WHERE id = #{id}")
TaskRow findById(@Param("id") long id);
```

**如何运行：** 创建后从另一个 HTTP 请求和一个新的 MySQL client 连接各读取一次。

**预期结果：** 两次观察看到相同 ID、request key、标题与状态。

**失败路径：** 查询不存在 ID 返回 null；Repository 若直接解引用会产生不清晰的空指针异常。

**恢复后复验：** Repository 把 null 转为 `Optional.empty()`，Service 再翻译为 404。

**常见误区：** 用 `SELECT *` 隐藏列合同，或把不存在返回的 null 直接传到上层。

### 12. Update、Delete 与受影响行数

**它是什么：** UPDATE 修改命中行，DELETE 删除命中行；返回值说明实际影响了几行。

**为什么需要：** SQL 没抛异常不代表目标存在，`WHERE id=999` 可能只是影响 0 行。

**什么时候使用：** 修改或删除一个已知 ID，并需要区分“命中”与“不存在”时使用；本课不做批量更新、
软删除或级联删除。

**最小代码：**

```java
/**
 * 按主键删除任务行。
 *
 * @param id 任务主键
 * @return 受影响行数
 */
@Delete("DELETE FROM tasks WHERE id = #{id}")
int deleteById(@Param("id") long id);
```

**如何运行：** 更新刚创建的 ID，再删除同一 ID；每一步都检查 Mapper 返回值。

**预期结果：** updateRows=1、deleteRows=1；删除后 GET 非成功且数据库 count=0。

**失败路径：** 忽略 0 行仍返回 200，会让客户端误以为不存在的任务已更新。

**恢复后复验：** Repository 将 0 映射为 empty/false，Service 统一判定任务不存在。

**常见误区：** 只看 SQL 没有抛异常，就向客户端报告更新或删除成功。

### 13. Controller 到 Mapper 的调用路径

**它是什么：** 请求依次经过 `TaskController -> TaskService -> TaskRepository ->
MyBatisTaskRepository -> TaskMapper -> DataSource/MySQL`。

**为什么需要：** 每层只依赖下一层合同，HTTP、业务用例和 SQL 才不会混成一个难以验证的方法。

**什么时候使用：** Web 请求需要经过业务用例再访问 MyBatis 时使用；这条路径不要求为一次性脚本机械
创建相同层级，也不允许 Controller 越级依赖 Mapper。

**最小代码：**

```java
@Service
public class TaskService {
    private final TaskRepository taskRepository;

    /**
     * 创建任务服务。
     *
     * @param taskRepository 任务仓储
     */
    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }
}
```

**如何运行：** Controller 只注入 Service，Service 只注入 Repository，adapter 才注入 Mapper。

**预期结果：** Controller 不出现 SQL 或 `TaskMapper`，Service 不出现 `ResponseEntity`。

**失败路径：** Controller 直调 Mapper 后，事务、映射和不存在判断散落到 Web 层。

**恢复后复验：** 恢复单向调用，HTTP CRUD 与事务探针继续通过。

**常见误区：** 为少写一个类让 Controller 直接执行 SQL，导致 HTTP 与事务职责混在一起。

### 14. 成功事务与提交证明

**它是什么：** `@Transactional` 让 Service 的创建用例在 Spring 管理的事务中执行 insert 与
find；方法正常返回时提交。

**为什么需要：** 只检查方法返回对象不能证明事务最终提交，必须从事务外重新读取。

**什么时候使用：** 一个 Service 用例需要把相关数据库操作作为一次提交边界时使用；本课不展开事务
隔离级别、锁、跨服务事务或补偿。

**最小代码：**

```java
/**
 * 创建任务并在正常返回时提交事务。
 *
 * @param requestKey 请求键
 * @param title 标题
 * @return 已创建任务
 */
@Transactional
public Task create(String requestKey, String title) {
    return taskRepository.create(requestKey, title);
}
```

**如何运行：** 通过 Controller 调用代理后的 Service，HTTP 返回 201 后再发 GET，并从新 MySQL
连接 SELECT。

**预期结果：** 三个观察使用同一 ID，数据库行在请求事务结束后仍存在。

**失败路径：** 在同一个事务测试方法中查询，只能证明当前事务看得到自己的写入。

**恢复后复验：** 测试方法不持有事务，改用独立请求与新数据库连接复读。

**常见误区：** 在同一测试事务里读回自己的写入，就宣称 HTTP 返回后已经提交。

### 15. 约束失败与运行时异常回滚

**它是什么：** 唯一约束拒绝重复 key；Spring 默认在代理方法抛出未处理的
`RuntimeException` 时回滚整个事务。

**为什么需要：** 两种失败来自不同边界：约束由 MySQL 执行，回滚由 Spring 事务代理协调 MyBatis
连接。

**什么时候使用：** 需要分别证明数据库拒绝非法写入、Spring 撤销异常事务时使用；本课不定义稳定
Problem Details，也不讲自定义 rollback rule。

**最小代码：**

```java
/**
 * 写入事务探针，并按参数触发运行时异常。
 *
 * @param requestKey 请求键
 * @param fail 是否触发失败
 */
@Transactional
public void write(String requestKey, boolean fail) {
    taskMapper.insert(new TaskRow(requestKey, "事务探针", "OPEN"));
    if (fail) {
        throw new IllegalStateException("transaction probe failed");
    }
}
```

**如何运行：** 重复 key 用 curl 触发；回滚使用 `src/test/java` 的专用 Spring bean，测试方法本身不
标记事务。

**预期结果：** 重复 key count=1；正常探针 count=1；异常探针 count=0。

**失败路径：** 在探针内部 catch 后正常返回，Spring 会把已经执行的 insert 提交，count 变成 1。

**恢复后复验：** 让运行时异常继续越过代理边界，重新测试得到 rollbackCount=0。

**常见误区：** 在事务方法内部吞掉运行时异常后，仍期待 Spring 使用默认规则回滚。

## 五、现代版本中的正确用法

本课现代线固定 Java 25、Spring Boot 4.1.0、MyBatis Starter 4.1.0、Flyway 12.4.0、Connector/J
9.7.0 和真实 MySQL 8.4.11。Boot parent 管理 Flyway 与 Connector/J 版本；MyBatis Starter 版本显式
固定，因为它不属于 Boot BOM。

Spring Boot 4.1 把 Flyway 自动配置放在 `spring-boot-starter-flyway` 中，而 MySQL 方言仍需要
`flyway-mysql`。只有 `flyway-core` 与 `flyway-mysql` 运行库时，应用可能能连接 MySQL，却不会自动
执行 migration。课程验证必须同时看到 Flyway 启动日志、history V1 和实际 `tasks` 表。

MyBatis Mapper 由 starter 接入 Spring DataSource 与事务。代码不创建裸 `SqlSession`，不调用
`commit()` 或 `rollback()`；事务只放在经代理进入的 Service 或测试探针 public 方法上。

:::tip
首次连库时先保留普通 `jdbc:mysql://host:port/database`，确认最小闭环后再根据部署环境讨论 TLS、
时区和连接池。不要复制一串没有解释的 URL 参数来掩盖真正的连接问题。
:::

## 六、核心接口与执行流程

创建请求的完整路径如下：

```text
POST /api/tasks + JSON DTO
  -> TaskController
  -> TaskService.create() @Transactional
  -> TaskRepository.create()
  -> MyBatisTaskRepository
  -> TaskMapper.insert() / findById()
  -> DataSource / MySQL tasks
  -> 事务提交
  -> HTTP 201 + TaskResponse
```

每个接口只暴露当前层需要知道的合同：

| 边界 | 输入 | 输出 | 不负责 |
| --- | --- | --- | --- |
| Controller | HTTP DTO、路径参数 | 状态码、响应 DTO | SQL 与事务 |
| Service | request key、标题、状态 | 应用 Task | HTTP 类型与列名 |
| Repository | 任务存取意图 | Task、Optional、boolean | Web 路由 |
| Mapper | Java 参数、TaskRow | TaskRow、受影响行数 | 用例编排 |
| DataSource | URL、用户、密码 | JDBC Connection | 业务决定 |

创建使用 `TaskRow` 接收 generated key；读取、更新和删除都按数据库最终状态判断。MyBatis 在 Spring
事务中使用同一个连接，应用代码不手工提交。

## 七、从零跟着做

以下文件组成一份最小可运行工程。代码使用 Java 25 text block；测试资产只放在本次 `/tmp` fixture，
验证后删除，不进入课程仓库。

### 1. 第一步：创建精确 Maven 工程

先创建独立工作目录，后续所有文件都放在其中：

```bash
i12_work_dir=$(mktemp -d /tmp/java-i12-phase-c.XXXXXX)
cd "$i12_work_dir"
```

创建 `pom.xml`：

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
    <relativePath />
  </parent>

  <groupId>example</groupId>
  <artifactId>task-persistence-bridge</artifactId>
  <version>0.0.1-SNAPSHOT</version>

  <properties>
    <java.version>25</java.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-webmvc</artifactId>
    </dependency>
    <dependency>
      <groupId>org.mybatis.spring.boot</groupId>
      <artifactId>mybatis-spring-boot-starter</artifactId>
      <version>4.1.0</version>
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
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
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

运行依赖树，确认没有被旧 transitive version 替换：

```bash
mvn dependency:tree
```

预期至少能定位 Framework 7.0.8、MyBatis 3.5.19、MyBatis-Spring 4.1.0、Flyway 12.4.0 与
Connector/J 9.7.0。

### 2. 第二步：配置 DataSource 与唯一 migration

创建 `src/main/resources/application.properties`：

```properties
spring.datasource.url=${TASK_DB_URL}
spring.datasource.username=${TASK_DB_USERNAME}
spring.datasource.password=${TASK_DB_PASSWORD}
mybatis.configuration.map-underscore-to-camel-case=true
spring.flyway.validate-migration-naming=true
spring.flyway.connect-retries=0
server.port=${SERVER_PORT:18082}
```

创建 `src/main/resources/db/migration/V1__create_tasks.sql`：

```sql
CREATE TABLE tasks (
  id BIGINT NOT NULL AUTO_INCREMENT,
  request_key VARCHAR(64) NOT NULL,
  title VARCHAR(120) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  CONSTRAINT uk_tasks_request_key UNIQUE (request_key),
  CONSTRAINT chk_tasks_title_not_blank CHECK (CHAR_LENGTH(TRIM(title)) > 0),
  CONSTRAINT chk_tasks_status CHECK (status IN ('OPEN', 'DONE'))
) ENGINE = InnoDB;
```

这里只保留一个 V1。不要再创建 `schema.sql`，也不要让 ORM 自动建表。

### 3. 第三步：创建入口、应用模型与仓储合同

创建 `src/main/java/example/tasks/TaskApplication.java`：

```java
package example.tasks;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TaskApplication {
    /**
     * 启动任务持久化示例。
     *
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        SpringApplication.run(TaskApplication.class, args);
    }
}
```

创建 `src/main/java/example/tasks/application/Task.java`：

```java
package example.tasks.application;

import java.time.LocalDateTime;

public record Task(
    Long id,
    String requestKey,
    String title,
    String status,
    LocalDateTime createdAt
) {
}
```

创建 `src/main/java/example/tasks/application/TaskRepository.java`：

```java
package example.tasks.application;

import java.util.List;
import java.util.Optional;

public interface TaskRepository {
    /**
     * 创建任务。
     *
     * @param requestKey 请求键
     * @param title 任务标题
     * @return 已创建任务
     */
    Task create(String requestKey, String title);

    /**
     * 按主键查询任务。
     *
     * @param id 任务主键
     * @return 查询结果
     */
    Optional<Task> findById(long id);

    /**
     * 查询全部任务。
     *
     * @return 按主键排序的任务
     */
    List<Task> findAll();

    /**
     * 更新任务状态。
     *
     * @param id 任务主键
     * @param status 新状态
     * @return 更新结果
     */
    Optional<Task> updateStatus(long id, String status);

    /**
     * 删除任务。
     *
     * @param id 任务主键
     * @return 是否删除成功
     */
    boolean deleteById(long id);
}
```

### 4. 第四步：创建 TaskRow 与 Mapper

`TaskRow` 是 persistence adapter 内部的可变模型。创建
`src/main/java/example/tasks/persistence/TaskRow.java`：

```java
package example.tasks.persistence;

import java.time.LocalDateTime;

public class TaskRow {
    private Long id;
    private String requestKey;
    private String title;
    private String status;
    private LocalDateTime createdAt;

    /** 提供给 MyBatis 的空构造器。 */
    public TaskRow() {
    }

    /**
     * 创建待写入行。
     *
     * @param requestKey 请求键
     * @param title 标题
     * @param status 状态
     */
    public TaskRow(String requestKey, String title, String status) {
        this.requestKey = requestKey;
        this.title = title;
        this.status = status;
    }

    /** @return 主键 */
    public Long getId() {
        return id;
    }

    /** @param id 主键 */
    public void setId(Long id) {
        this.id = id;
    }

    /** @return 请求键 */
    public String getRequestKey() {
        return requestKey;
    }

    /** @param requestKey 请求键 */
    public void setRequestKey(String requestKey) {
        this.requestKey = requestKey;
    }

    /** @return 标题 */
    public String getTitle() {
        return title;
    }

    /** @param title 标题 */
    public void setTitle(String title) {
        this.title = title;
    }

    /** @return 状态 */
    public String getStatus() {
        return status;
    }

    /** @param status 状态 */
    public void setStatus(String status) {
        this.status = status;
    }

    /** @return 创建时间 */
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    /** @param createdAt 创建时间 */
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
```

创建 `src/main/java/example/tasks/persistence/TaskMapper.java`：

```java
package example.tasks.persistence;

import java.util.List;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface TaskMapper {
    /**
     * 插入任务并回填主键。
     *
     * @param row 待写入行
     * @return 受影响行数
     */
    @Insert("""
        INSERT INTO tasks (request_key, title, status)
        VALUES (#{requestKey}, #{title}, #{status})
        """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(TaskRow row);

    /**
     * 按主键查询。
     *
     * @param id 主键
     * @return 任务行；不存在时为 null
     */
    @Select("""
        SELECT id, request_key, title, status, created_at
        FROM tasks
        WHERE id = #{id}
        """)
    TaskRow findById(@Param("id") long id);

    /** @return 按主键排序的任务行 */
    @Select("""
        SELECT id, request_key, title, status, created_at
        FROM tasks
        ORDER BY id
        """)
    List<TaskRow> findAll();

    /**
     * 更新状态。
     *
     * @param id 主键
     * @param status 状态
     * @return 受影响行数
     */
    @Update("UPDATE tasks SET status = #{status} WHERE id = #{id}")
    int updateStatus(@Param("id") long id, @Param("status") String status);

    /**
     * 删除任务。
     *
     * @param id 主键
     * @return 受影响行数
     */
    @Delete("DELETE FROM tasks WHERE id = #{id}")
    int deleteById(@Param("id") long id);

    /**
     * 按请求键计数。
     *
     * @param requestKey 请求键
     * @return 匹配行数
     */
    @Select("SELECT COUNT(*) FROM tasks WHERE request_key = #{requestKey}")
    int countByRequestKey(@Param("requestKey") String requestKey);

    /**
     * 删除测试探针行。
     *
     * @param requestKey 请求键
     * @return 受影响行数
     */
    @Delete("DELETE FROM tasks WHERE request_key = #{requestKey}")
    int deleteByRequestKey(@Param("requestKey") String requestKey);
}
```

### 5. 第五步：实现 Repository adapter 与 Service

创建 `src/main/java/example/tasks/persistence/MyBatisTaskRepository.java`：

```java
package example.tasks.persistence;

import example.tasks.application.Task;
import example.tasks.application.TaskRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public class MyBatisTaskRepository implements TaskRepository {
    private final TaskMapper taskMapper;

    /**
     * 创建仓储适配器。
     *
     * @param taskMapper MyBatis Mapper
     */
    public MyBatisTaskRepository(TaskMapper taskMapper) {
        this.taskMapper = taskMapper;
    }

    /**
     * 创建任务并返回持久化后的应用模型。
     *
     * @param requestKey 请求幂等键
     * @param title 任务标题
     * @return 已持久化的任务
     */
    @Override
    public Task create(String requestKey, String title) {
        TaskRow row = new TaskRow(requestKey, title, "OPEN");
        taskMapper.insert(row);
        return findById(row.getId()).orElseThrow();
    }

    /**
     * 按主键查询任务。
     *
     * @param id 任务主键
     * @return 找到的任务，不存在时为空
     */
    @Override
    public Optional<Task> findById(long id) {
        TaskRow row = taskMapper.findById(id);
        return row == null ? Optional.empty() : Optional.of(toTask(row));
    }

    /**
     * 查询全部任务。
     *
     * @return 按 Mapper 查询顺序返回的任务列表
     */
    @Override
    public List<Task> findAll() {
        return taskMapper.findAll().stream().map(this::toTask).toList();
    }

    /**
     * 更新任务状态并返回最新模型。
     *
     * @param id 任务主键
     * @param status 新状态
     * @return 更新后的任务，不存在时为空
     */
    @Override
    public Optional<Task> updateStatus(long id, String status) {
        if (taskMapper.updateStatus(id, status) == 0) {
            return Optional.empty();
        }
        return findById(id);
    }

    /**
     * 按主键删除任务。
     *
     * @param id 任务主键
     * @return 删除成功时为 true，不存在时为 false
     */
    @Override
    public boolean deleteById(long id) {
        return taskMapper.deleteById(id) == 1;
    }

    /**
     * 转换为应用模型。
     *
     * @param row 数据库行
     * @return 应用模型
     */
    private Task toTask(TaskRow row) {
        return new Task(
            row.getId(),
            row.getRequestKey(),
            row.getTitle(),
            row.getStatus(),
            row.getCreatedAt()
        );
    }
}
```

创建 `src/main/java/example/tasks/application/TaskNotFoundException.java`：

```java
package example.tasks.application;

public final class TaskNotFoundException extends RuntimeException {
    /**
     * 创建任务不存在异常。
     *
     * @param id 未找到的主键
     */
    public TaskNotFoundException(long id) {
        super("task not found: " + id);
    }
}
```

创建 `src/main/java/example/tasks/application/TaskService.java`：

```java
package example.tasks.application;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskService {
    private final TaskRepository taskRepository;

    /**
     * 创建任务服务。
     *
     * @param taskRepository 任务仓储
     */
    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    /**
     * 创建任务。
     *
     * @param requestKey 请求键
     * @param title 标题
     * @return 已创建任务
     */
    @Transactional
    public Task create(String requestKey, String title) {
        return taskRepository.create(requestKey, title);
    }

    /** @param id 主键 @return 已找到任务 */
    public Task get(long id) {
        return taskRepository.findById(id)
            .orElseThrow(() -> new TaskNotFoundException(id));
    }

    /** @return 全部任务 */
    public List<Task> list() {
        return taskRepository.findAll();
    }

    /**
     * 更新任务状态。
     *
     * @param id 主键
     * @param status 状态
     * @return 更新后的任务
     */
    public Task updateStatus(long id, String status) {
        return taskRepository.updateStatus(id, status)
            .orElseThrow(() -> new TaskNotFoundException(id));
    }

    /** @param id 要删除的主键 */
    public void delete(long id) {
        if (!taskRepository.deleteById(id)) {
            throw new TaskNotFoundException(id);
        }
    }
}
```

### 6. 第六步：创建 HTTP DTO 与 Controller

创建三个 DTO：

```java
package example.tasks.api;

public record CreateTaskRequest(String requestKey, String title) {
}
```

```java
package example.tasks.api;

public record UpdateTaskRequest(String status) {
}
```

```java
package example.tasks.api;

import example.tasks.application.Task;
import java.time.LocalDateTime;

public record TaskResponse(
    Long id,
    String requestKey,
    String title,
    String status,
    LocalDateTime createdAt
) {
    /**
     * 转换应用模型。
     *
     * @param task 应用模型
     * @return HTTP 响应
     */
    public static TaskResponse from(Task task) {
        return new TaskResponse(
            task.id(), task.requestKey(), task.title(), task.status(), task.createdAt()
        );
    }
}
```

创建 `src/main/java/example/tasks/api/TaskController.java`：

```java
package example.tasks.api;

import example.tasks.application.TaskNotFoundException;
import example.tasks.application.TaskService;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskService taskService;

    /** @param taskService 任务服务 */
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * 创建任务。
     *
     * @param request 创建请求
     * @return 201 响应
     */
    @PostMapping
    public ResponseEntity<TaskResponse> create(@RequestBody CreateTaskRequest request) {
        TaskResponse response = TaskResponse.from(
            taskService.create(request.requestKey(), request.title())
        );
        return ResponseEntity.created(URI.create("/api/tasks/" + response.id()))
            .body(response);
    }

    /** @param id 主键 @return 任务响应 */
    @GetMapping("/{id}")
    public TaskResponse get(@PathVariable long id) {
        return TaskResponse.from(taskService.get(id));
    }

    /** @return 全部任务响应 */
    @GetMapping
    public List<TaskResponse> list() {
        return taskService.list().stream().map(TaskResponse::from).toList();
    }

    /**
     * 更新状态。
     *
     * @param id 主键
     * @param request 更新请求
     * @return 更新后的任务
     */
    @PutMapping("/{id}")
    public TaskResponse updateStatus(
        @PathVariable long id,
        @RequestBody UpdateTaskRequest request
    ) {
        return TaskResponse.from(taskService.updateStatus(id, request.status()));
    }

    /** @param id 主键 @return 204 响应 */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id) {
        taskService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 在 HTTP 边界把任务不存在映射为 404。
     *
     * @return 404 空响应
     */
    @ExceptionHandler(TaskNotFoundException.class)
    public ResponseEntity<Void> notFound() {
        return ResponseEntity.notFound().build();
    }
}
```

### 7. 第七步：创建测试专用事务探针

生产 API 不提供故障开关。创建 `src/test/java/example/tasks/TransactionProbe.java`：

```java
package example.tasks;

import example.tasks.persistence.TaskMapper;
import example.tasks.persistence.TaskRow;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class TransactionProbe {
    private final TaskMapper taskMapper;

    /** @param taskMapper 真实 Mapper */
    public TransactionProbe(TaskMapper taskMapper) {
        this.taskMapper = taskMapper;
    }

    /**
     * 写入并按参数触发运行时异常。
     *
     * @param requestKey 请求键
     * @param fail 是否抛出异常
     */
    @Transactional
    public void write(String requestKey, boolean fail) {
        taskMapper.insert(new TaskRow(requestKey, "事务探针", "OPEN"));
        if (fail) {
            throw new IllegalStateException("transaction probe failed");
        }
    }
}
```

创建 `src/test/java/example/tasks/TaskTransactionProbeTest.java`。测试方法本身不要加
`@Transactional`：

```java
package example.tasks;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import example.tasks.persistence.TaskMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class TaskTransactionProbeTest {
    @Autowired
    private TransactionProbe transactionProbe;

    @Autowired
    private TaskMapper taskMapper;

    /** 清理精确探针行。 */
    @BeforeEach
    void cleanProbeRows() {
        taskMapper.deleteByRequestKey("rollback-probe");
        taskMapper.deleteByRequestKey("commit-probe");
    }

    /** 验证运行时异常回滚、正常返回提交。 */
    @Test
    void runtimeExceptionRollsBackAndNormalReturnCommits() {
        assertThrows(
            IllegalStateException.class,
            () -> transactionProbe.write("rollback-probe", true)
        );
        assertEquals(0, taskMapper.countByRequestKey("rollback-probe"));

        transactionProbe.write("commit-probe", false);
        assertEquals(1, taskMapper.countByRequestKey("commit-probe"));
        System.out.println(
            "transaction|commitCount=1|rollbackCount=0|exception=IllegalStateException"
        );
    }
}
```

### 8. 第八步：启动真实 MySQL 并运行

为本次练习创建独立目录、网络和临时凭据。容器名若已被其他任务使用，先换成当前批次唯一前缀：

```bash
i12_db_password=$(openssl rand -hex 16)
i12_root_password=$(openssl rand -hex 16)
i12_mysql_image='mysql@sha256:b3b90af2a6552ae30c266fdb7d5dd55f3afb72404bb78d37fe8a23eb857fd3fb'

docker network create java-i12-net
docker run -d --name java-i12-mysql --network java-i12-net \
  -e MYSQL_ROOT_PASSWORD="$i12_root_password" \
  -e MYSQL_DATABASE=taskdb \
  -e MYSQL_USER=task_app \
  -e MYSQL_PASSWORD="$i12_db_password" \
  "$i12_mysql_image"
```

循环执行真实查询判断 readiness，不能只固定 sleep：

```bash
for attempt in {1..60}; do
  if docker exec -e MYSQL_PWD="$i12_db_password" java-i12-mysql \
    mysql -N -B -utask_app taskdb -e 'SELECT 1' >/dev/null 2>&1; then
    echo 'MYSQL_READY'
    break
  fi
  sleep 1
done
```

在同一 network 中先运行事务测试，再打包：

```bash
docker run --rm --network java-i12-net \
  -e TASK_DB_URL=jdbc:mysql://java-i12-mysql:3306/taskdb \
  -e TASK_DB_USERNAME=task_app \
  -e TASK_DB_PASSWORD="$i12_db_password" \
  -v "$i12_work_dir:/workspace" -w /workspace \
  maven:3.9.12-eclipse-temurin-25 mvn -q clean test

docker run --rm -v "$i12_work_dir:/workspace" -w /workspace \
  maven:3.9.12-eclipse-temurin-25 mvn -q -DskipTests package
```

最后启动 jar，并用循环请求 `/api/tasks` 判断就绪：

```bash
docker run -d --name java-i12-app --network java-i12-net -p 18082:18082 \
  -e TASK_DB_URL=jdbc:mysql://java-i12-mysql:3306/taskdb \
  -e TASK_DB_USERNAME=task_app \
  -e TASK_DB_PASSWORD="$i12_db_password" \
  -v "$i12_work_dir/target/task-persistence-bridge-0.0.1-SNAPSHOT.jar:/app/app.jar:ro" \
  eclipse-temurin:25-jre java -jar /app/app.jar

for attempt in {1..60}; do
  http_code=$(curl --silent --output "$i12_work_dir/ready.json" \
    --write-out '%{http_code}' http://127.0.0.1:18082/api/tasks || true)
  if [ "$http_code" = 200 ]; then
    echo 'APP_READY_200'
    break
  fi
  sleep 1
done
```

预期测试先输出：

```text
transaction|commitCount=1|rollbackCount=0|exception=IllegalStateException
```

应用就绪后才能进入 curl 验收。

## 八、如何使用

### 1. 创建并从两个边界读取

发送创建请求，将响应体保存到临时文件：

```bash
set -e

create_code=$(curl --silent --output "$i12_work_dir/create.json" \
  --write-out '%{http_code}' \
  -H 'Content-Type: application/json' \
  -d '{"requestKey":"task-001","title":"整理 MySQL 笔记"}' \
  http://127.0.0.1:18082/api/tasks)

task_id=$(jq -r '.id' "$i12_work_dir/create.json")
test "$create_code" = 201
test "$task_id" -gt 0
echo "create=$create_code id=$task_id"
```

预期 `create=201`，`task_id` 是正整数。再发新的 GET：

```bash
set -e

read_code=$(curl --silent --output "$i12_work_dir/read.json" \
  --write-out '%{http_code}' \
  http://127.0.0.1:18082/api/tasks/$task_id)
test "$read_code" = 200
test "$(jq -r '.requestKey' "$i12_work_dir/read.json")" = task-001
test "$(jq -r '.status' "$i12_work_dir/read.json")" = OPEN
```

同时从独立 MySQL client 读取：

```bash
docker exec -e MYSQL_PWD="$i12_db_password" java-i12-mysql \
  mysql --default-character-set=utf8mb4 -N -B -utask_app taskdb \
  -e "SELECT id, request_key, title, status FROM tasks WHERE id=$task_id"
```

两个结果都应包含 `task-001`、`整理 MySQL 笔记` 和 `OPEN`。这一步才证明 HTTP 返回后的数据已提交。

### 2. 更新、删除并检查不存在

```bash
set -e

update_code=$(curl --silent --output "$i12_work_dir/update.json" \
  --write-out '%{http_code}' -X PUT \
  -H 'Content-Type: application/json' \
  -d '{"status":"DONE"}' \
  http://127.0.0.1:18082/api/tasks/$task_id)

delete_code=$(curl --silent --output "$i12_work_dir/delete.json" \
  --write-out '%{http_code}' -X DELETE \
  http://127.0.0.1:18082/api/tasks/$task_id)

missing_code=$(curl --silent --output "$i12_work_dir/missing.json" \
  --write-out '%{http_code}' \
  http://127.0.0.1:18082/api/tasks/$task_id)

updated_status=$(jq -r '.status' "$i12_work_dir/update.json")
remaining=$(docker exec -e MYSQL_PWD="$i12_db_password" java-i12-mysql \
  mysql -N -B -utask_app taskdb \
  -e "SELECT COUNT(*) FROM tasks WHERE id=$task_id")

test "$update_code" = 200
test "$updated_status" = DONE
test "$delete_code" = 204
test "$missing_code" = 404
test "$remaining" = 0
echo "crud|create=$create_code|read=$read_code|update=$update_code|status=$updated_status|delete=$delete_code|missing=$missing_code|remaining=$remaining"
```

预期为 `update=200 status=DONE`、`delete=204 missing=404`。再从 MySQL 查询 count 应为 0。

### 3. 触发唯一约束并恢复

```bash
set -e

first_code=$(curl --silent --output "$i12_work_dir/duplicate-first.json" \
  --write-out '%{http_code}' -H 'Content-Type: application/json' \
  -d '{"requestKey":"duplicate-001","title":"第一次写入"}' \
  http://127.0.0.1:18082/api/tasks)

duplicate_code=$(curl --silent --output "$i12_work_dir/duplicate-second.json" \
  --write-out '%{http_code}' -H 'Content-Type: application/json' \
  -d '{"requestKey":"duplicate-001","title":"第二次写入"}' \
  http://127.0.0.1:18082/api/tasks)

duplicate_count=$(docker exec -e MYSQL_PWD="$i12_db_password" java-i12-mysql \
  mysql -N -B -utask_app taskdb \
  -e "SELECT COUNT(*) FROM tasks WHERE request_key='duplicate-001'")

recovered_code=$(curl --silent --output "$i12_work_dir/duplicate-recovered.json" \
  --write-out '%{http_code}' -H 'Content-Type: application/json' \
  -d '{"requestKey":"duplicate-002","title":"恢复写入"}' \
  http://127.0.0.1:18082/api/tasks)

test "$first_code" = 201
test "$duplicate_code" -ge 400
test "$duplicate_code" -lt 600
test "$duplicate_count" = 1
test "$recovered_code" = 201
echo "constraint|first=$first_code|duplicate=$duplicate_code|duplicateCount=$duplicate_count|recovered=$recovered_code"
```

预期稳定输出：

```text
constraint|first=201|duplicate=500|duplicateCount=1|recovered=201
```

本课只断言重复请求为非 2xx，不定义错误 JSON；稳定错误合同由 I-13 负责。

### 4. 验证错误连接与恢复

先停止正确应用，释放 18082，再用相同 jar 和错误 host 前台运行：

```bash
docker stop java-i12-app
docker container rm java-i12-app

docker run --name java-i12-bad-host --network java-i12-net \
  -e TASK_DB_URL=jdbc:mysql://java-i12-missing:3306/taskdb \
  -e TASK_DB_USERNAME=task_app \
  -e TASK_DB_PASSWORD="$i12_db_password" \
  -v "$i12_work_dir/target/task-persistence-bridge-0.0.1-SNAPSHOT.jar:/app/app.jar:ro" \
  eclipse-temurin:25-jre java -jar /app/app.jar
```

命令应非零退出，日志应能追到 `Unable to obtain connection`、`Communications link failure` 或
`UnknownHostException`，18082 不可访问。删除这个已退出的精确容器，再使用第八步的正确命令启动：

```bash
docker container rm java-i12-bad-host
```

恢复后 `GET /api/tasks` 必须重新返回 200，history 中的 V1 仍为 success。

## 九、适用与不适用场景

适合本课方案的场景：

- 第一次把 Spring Boot Web API 连接到真实关系数据库。
- 需要用一张表学习 DataSource、migration、Mapper 与事务的职责。
- 需要从 curl 与数据库两个边界确认持久化结果。
- 需要一个可复跑的真实 MySQL 约束和回滚反馈环。

不适合在本课继续扩展的场景：

- 多表 JOIN、子查询、动态 SQL 与 MyBatis-Plus。
- 索引、EXPLAIN、offset/keyset 分页优化。
- 隔离级别、锁、死锁、补偿与分布式事务。
- 备份恢复、读写分离、分区、分片和生产数据库运维。

这些问题有各自的建模、性能或运维反馈环，塞进桥接课会掩盖最小持久化路径。

## 十、Java 8 / Spring Boot 2.3 兼容写法

旧项目使用 Java 8 与 Spring Boot 2.3.12.RELEASE。精确 POM 组合改为：

```xml
<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>2.3.12.RELEASE</version>
  <relativePath />
</parent>

<properties>
  <java.version>8</java.version>
</properties>

<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  <dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>2.1.4</version>
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
</dependencies>
```

Boot 2.3 BOM 管理 Flyway 6.4.4 与 Connector/J 8.0.25；旧 Flyway 不使用现代
`flyway-mysql` 拆分模块。Java record 和 text block 改成 final class 与普通字符串：

```java
package example.tasks.application;

public final class LegacyCreateTaskCommand {
    private final String requestKey;
    private final String title;

    /**
     * 创建 Java 8 任务命令。
     *
     * @param requestKey 请求键
     * @param title 标题
     */
    public LegacyCreateTaskCommand(String requestKey, String title) {
        this.requestKey = requestKey;
        this.title = title;
    }

    /** @return 请求键 */
    public String getRequestKey() {
        return requestKey;
    }

    /** @return 标题 */
    public String getTitle() {
        return title;
    }
}
```

Mapper SQL 改为普通字符串，参数绑定和事务原则不变：

```java
/**
 * 插入 Java 8 任务行并回填生成主键。
 *
 * @param row 待插入任务行
 * @return 受影响行数
 */
@Insert("INSERT INTO tasks (request_key, title, status) "
    + "VALUES (#{requestKey}, #{title}, #{status})")
@Options(useGeneratedKeys = true, keyProperty = "id")
int insert(TaskRow row);
```

可以在 `maven:3.9.12-eclipse-temurin-8` 中编译旧线，但不要把现代 MySQL 反馈环外推为“旧组合已
通过 MySQL 8.4.11”。旧线若要声明数据库兼容，也必须单独运行真实连接、migration、CRUD、约束与回滚。

## 十一、新旧版本差异

| 项目 | 现代主线 | Java 8 / Boot 2.3 补充 |
| --- | --- | --- |
| Java | 25 LTS，record、text block | 8，final class、普通字符串 |
| Spring Boot | 4.1.0 | 2.3.12.RELEASE |
| Web starter | `spring-boot-starter-webmvc` | `spring-boot-starter-web` |
| MyBatis starter | 4.1.0 | 2.1.4 |
| MyBatis / Spring | 3.5.19 / 4.1.0 | 3.5.6 / 2.0.6 |
| Flyway | 12.4.0 + Boot Flyway starter + `flyway-mysql` | 6.4.4 `flyway-core` |
| Connector/J | `com.mysql:mysql-connector-j` 9.7.0 | `mysql:mysql-connector-java` 8.0.25 |
| 共同合同 | 外部 DataSource、唯一 V1、参数绑定、分层 CRUD、代理事务 | 核心合同相同，语法与依赖按旧线隔离 |

## 十二、易错点

:::pitfalls

### 错误：只用 H2 代替 MySQL 验收

**现象：** 内存测试全绿，但课程没有任何 Connector/J、MySQL 日志或独立数据库查询证据。

**触发条件：** 全部测试只连接内存数据库。

**原因：** H2 的驱动、方言与约束实现不是 Connector/J 和 MySQL 8.4。

**后果：** 测试通过也没有验证真实 JDBC URL、MySQL migration 或 CHECK/唯一约束。

**错误示例：**

```properties
spring.datasource.url=jdbc:h2:mem:taskdb
```

**正确写法：**

```properties
spring.datasource.url=${TASK_DB_URL}
```

**影响版本：** 所有 Java、Spring Boot 与 MyBatis 版本。

**验证方式：** 日志必须显示 MySQL，独立查询必须能读取同一业务行。

**来源：** `spring-boot-sql-databases`、`mysql-8411-release`、`connector-j-url`。

### 错误：只加 Flyway 运行库，不加 Boot 4 自动配置

**现象：** 应用能连接数据库，但启动阶段没有执行 V1，第一次访问 `tasks` 才报表不存在。

**触发条件：** POM 只有 `flyway-core` 与 `flyway-mysql`。

**原因：** Spring Boot 4.1 的 Flyway 自动配置位于 `spring-boot-starter-flyway` 组合中。

**后果：** 应用可能启动并连接数据库，但 V1 没执行，第一次 Mapper 查询才报表不存在。

**错误示例：**

```xml
<dependency>
  <groupId>org.flywaydb</groupId>
  <artifactId>flyway-core</artifactId>
</dependency>
```

**正确写法：**

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-flyway</artifactId>
</dependency>
<dependency>
  <groupId>org.flywaydb</groupId>
  <artifactId>flyway-mysql</artifactId>
</dependency>
```

**影响版本：** 本课 Spring Boot 4.1.0 / Flyway 12.4.0 组合。

**验证方式：** 空库启动后 history 应出现 version 1，业务表应存在。

**来源：** `spring-boot-database-initialization`、`spring-boot-flyway-starter`、
`flyway-mysql-1240`。

### 错误：同时使用 Flyway 与 schema.sql

**现象：** 干净环境启动时重复建表失败，或不同环境得到不同表结构。

**触发条件：** 两种机制都创建 `tasks`。

**原因：** schema 所有权不唯一，执行顺序和重复 DDL 互相干扰。

**后果：** 启动失败，或不同环境由不同机制创建出不同结构。

**错误示例：**

```text
src/main/resources/schema.sql
src/main/resources/db/migration/V1__create_tasks.sql
```

**正确写法：**

```text
src/main/resources/db/migration/V1__create_tasks.sql
```

**影响版本：** Spring Boot 4.1.0 与 2.3.12.RELEASE。

**验证方式：** 搜索初始化资产，确认只有 V1；history 只有一条 versioned migration。

**来源：** `spring-boot-database-initialization`、`flyway-schema-history`。

### 错误：把请求值拼进 SQL

**现象：** 含引号标题查询失败，用户输入还可能改变 SQL 语义。

**触发条件：** 使用 Java 字符串连接 title 或 request key。

**原因：** 请求数据被当成 SQL 结构，quotes 处理错误并扩大注入风险。

**后果：** 含引号标题可能失败，恶意值还可能改变 statement 意义。

**错误示例：**

```java
String sql = "SELECT id FROM tasks WHERE title='" + title + "'";
```

**正确写法：**

```java
/**
 * 按标题读取任务行。
 *
 * @param title 标题
 * @return 匹配任务行；不存在时为 null
 */
@Select("SELECT id FROM tasks WHERE title = #{title}")
TaskRow findByTitle(@Param("title") String title);
```

**影响版本：** MyBatis 3.5.19 与 3.5.6。

**验证方式：** 写入包含单引号的标题，读取结果必须完全一致。

**来源：** `mybatis-mapper-statements`。

### 错误：多参数没有稳定名称

**现象：** Mapper 执行时报告找不到 `id` 或 `status` 参数。

**触发条件：** Mapper 方法接收多个简单参数，却未使用 `@Param`。

**原因：** SQL 引用名与编译后的 Java 参数元数据不再形成明确合同。

**后果：** statement 找不到 `id` 或 `status`。

**错误示例：**

```java
/**
 * 错误示例：更新状态但没有给参数稳定命名。
 *
 * @param id 任务主键
 * @param status 新状态
 * @return 受影响行数
 */
int updateStatus(long id, String status);
```

**正确写法：**

```java
/**
 * 使用稳定参数名更新任务状态。
 *
 * @param id 任务主键
 * @param status 新状态
 * @return 受影响行数
 */
int updateStatus(@Param("id") long id, @Param("status") String status);
```

**影响版本：** MyBatis 3.5.19 与 3.5.6。

**验证方式：** 更新存在 ID 返回 1，并能重新读取 `DONE`。

**来源：** `mybatis-java-api`。

### 错误：Controller 直接调用 Mapper

**现象：** HTTP 类出现 SQL/Mapper 依赖，事务和不存在判断散落在多个端点。

**触发条件：** 为少写一层把 `TaskMapper` 注入 Controller。

**原因：** Web 边界同时拥有 SQL 与事务职责。

**后果：** 用例难以从非 HTTP 入口复用，事务与不存在判断散落。

**错误示例：**

```java
final class TaskController {
    private final TaskMapper taskMapper;
}
```

**正确写法：**

```java
final class TaskController {
    private final TaskService taskService;
}
```

**影响版本：** 现代与 legacy。

**验证方式：** 搜索 Controller import，不能出现 persistence Mapper；完整 CRUD 仍通过。

**来源：** `mybatis-starter-introduction`、`mybatis-spring-transactions`。

### 错误：在 Mapper 上手工提交

**现象：** Spring 管理的事务被局部提交打断，或 SqlSession 直接拒绝手工提交。

**触发条件：** 从 Spring 管理的 SqlSession 调 `commit()` 或 `rollback()`。

**原因：** MyBatis-Spring 已让 session 参与 Spring 事务。

**后果：** 统一事务被破坏，甚至直接抛出不允许手工提交的异常。

**错误示例：**

```java
sqlSession.commit();
```

**正确写法：**

```java
/**
 * 创建任务并把事务提交交给 Spring 管理。
 *
 * @param requestKey 请求键
 * @param title 标题
 * @return 已创建任务
 */
@Transactional
public Task create(String requestKey, String title) {
    return taskRepository.create(requestKey, title);
}
```

**影响版本：** MyBatis-Spring 4.1.0 与 2.0.6。

**验证方式：** 事务探针输出 commitCount=1、rollbackCount=0。

**来源：** `mybatis-spring-transactions`、`spring-transactional`。

### 错误：吞掉运行时异常后期待回滚

**现象：** 方法报告失败，但异常前插入的探针行仍然存在。

**触发条件：** 事务方法 catch `RuntimeException` 后正常返回。

**原因：** 事务 interceptor 看到的是正常完成，不会应用默认运行时异常回滚规则。

**后果：** 失败前已经执行的 insert 被提交。

**错误示例：**

```java
try {
    taskMapper.insert(row);
} catch (RuntimeException error) {
    return false;
}
```

**正确写法：**

```java
try {
    taskMapper.insert(row);
} catch (RuntimeException error) {
    throw error;
}
```

**影响版本：** Spring Framework 7.0.8 与 5.2.15.RELEASE。

**验证方式：** 错误版本 rollback count 为 1；恢复异常冒泡后必须回到 0。

**来源：** `spring-transactional`、`spring-transaction-rollback`。

### 错误：修改已执行的 V1

**现象：** 应用重启时 Flyway validate 报 V1 checksum 不一致。

**触发条件：** V1 已记录后直接编辑脚本并复用旧数据库。

**原因：** 文件 checksum 与 history 中的 checksum 不一致。

**后果：** Flyway validate 失败，环境不能确定曾执行的是哪个结构。

**错误示例：**

```text
edit V1__create_tasks.sql after version 1 succeeded
```

**正确写法：**

```text
add V2__add_task_priority.sql for the next schema change
```

**影响版本：** Flyway 12.x 与 6.4.4。

**验证方式：** 重启时 validate 通过，history 的 V1 success 保持 1。

**来源：** `flyway-versioned-migrations`、`flyway-schema-history`。
:::

## 十三、安全与性能边界

- 数据库密码由当前批次随机生成，只通过运行时环境变量注入；按照 OWASP Secrets Management 要求，
  不把值硬编码进 Git、镜像定义、日志或 curl body。
- 应用用户只取得当前 `taskdb` 的必要权限，Web 应用不使用 root；MySQL Security Guidelines 明确要求
  不授予超过需要的权限。
- 请求值全部使用 MyBatis `#{}` prepared parameter 绑定；官方 Mapper 文档明确警告，不得把未经控制
  的用户输入通过字符串替换直接注入 SQL。
- 唯一约束和 CHECK 是最后一道数据合同，不替代 Controller/Service 的输入校验。
- 本课不根据一次本机耗时给出性能结论，也不调整 Hikari pool、索引或 MySQL server 参数。
- 生产 TLS、秘密管理、连接数容量、备份恢复和监控需要独立部署合同，不在本课最小闭环内。

## 十四、范围边界与继续学习方向

完成本课后，你已经有一条真实 Web 持久化路径，但还没有稳定错误响应、Controller 测试、OpenAPI 或
完整阶段项目。后续课程会在这条已验证路径上逐步增加这些能力。

本课不回收或覆盖现有的 SQL、MyBatis、事务和分库分表专题页。它们继续保留原稳定 ID 与 URL；I-12
只负责主线学习者第一次把 Spring Boot、MyBatis、migration 和真实 MySQL 接成一个闭环。

## 十五、如何验证

### 1. 版本与 migration

记录运行时，不要只引用 POM：

```bash
docker run --rm maven:3.9.12-eclipse-temurin-25 mvn -version
docker exec java-i12-mysql mysqld --version
docker image inspect "$i12_mysql_image" --format '{{index .RepoDigests 0}}'
```

查询 migration 与业务表：

```bash
docker exec -e MYSQL_PWD="$i12_db_password" java-i12-mysql \
  mysql -N -B -utask_app taskdb -e \
  "SELECT version, success FROM flyway_schema_history WHERE type='SQL'; \
   SELECT COUNT(*) FROM information_schema.tables \
   WHERE table_schema='taskdb' AND table_name='tasks';"
```

预期 version/success 为 `1 1`，业务表 count 为 1。

### 2. CRUD 与唯一约束

依次执行第八节的创建、读取、更新、删除和重复 key 请求。稳定摘要应为：

```text
crud|create=201|read=200|update=200|status=DONE|delete=204|missing=404|remaining=0
constraint|first=201|duplicate=non2xx|duplicateCount=1|recovered=201
```

这些字段由第八节的 shell `test` 逐项断言；任一状态码、JSON 状态或数据库 count 不匹配时，命令会
非零退出，不会只打印一个看似成功的摘要。

### 3. 连接失败与事务回滚

错误 host 必须让启动非零退出且 HTTP 不监听，恢复后同一 jar 必须可用：

```text
connection|badHostExit=nonzero|httpListening=false
connection|recovered=true|migrationVersion=1
```

事务测试必须使用真实 MySQL、测试专用代理 bean 和事务外查询：

```text
transaction|commitCount=1|rollbackCount=0|exception=IllegalStateException
```

把探针错误地改成 catch 后正常返回时，rollback count 应变成 1；恢复异常冒泡后必须重新变绿。

### 4. 连续两轮与精确清理

四组反馈环至少连续执行两轮。第二轮使用新的数据库容器或新的数据库名，不能依赖第一轮残留。记录
POM、V1、核心测试和镜像 digest 的 SHA-256 后，停止并删除本课的精确资产：

```bash
docker stop java-i12-app java-i12-mysql
docker container rm java-i12-app java-i12-mysql
docker network rm java-i12-net
find "$i12_work_dir" -depth -delete
```

再确认这些精确容器、network、fixture、响应临时文件与应用端口均不存在。不要使用宽泛 name filter、
glob 或仓库根路径清理。

:::exercise

### 练习：为任务持久化闭环增加一个可验证状态变化

**要求：** 在干净临时数据库启动当前工程，确认 V1 与事务测试先通过；创建
`requestKey=exercise-001`、标题为“完成持久化练习”的任务，记录 201 响应中的生成 ID，并从 MySQL
client 读取 `OPEN`；通过 PUT 把状态改为 `DONE`；再尝试改为 `ARCHIVED`；最后删除任务。不增加新表
或新 migration。

**验收：** 更新为 `DONE` 时 HTTP 为 200 且 Mapper `updateRows=1`；非法状态被数据库 CHECK 或输入
边界拒绝，原行仍为 `DONE`；删除返回 204，随后 GET 非成功且数据库 count=0。写下每一步的输入、
可观察结果、失败原因和恢复动作。
:::

## 十六、本节小结

- DataSource 用外部 URL、用户和密码取得连接；错误 host 必须让启动失败。
- Flyway 用唯一 V1 创建 `tasks`，history 记录 version、checksum 与 success。
- MyBatis Mapper 使用静态 SQL、`#{}`、`@Param`、generated key 和受影响行数。
- 调用路径保持 Controller -> Service -> Repository -> Mapper -> DataSource / MySQL。
- HTTP 与新 MySQL 连接共同证明提交；重复 key 由数据库唯一约束拒绝。
- 测试专用 Spring 代理 bean 证明正常返回提交、运行时异常回滚。
- I-12 只关闭最小持久化桥，不进入 SQL 优化、锁、备份恢复、分片或 I-13 错误合同。
