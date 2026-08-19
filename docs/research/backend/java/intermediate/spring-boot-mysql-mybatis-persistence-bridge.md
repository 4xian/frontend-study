# Spring Boot、MySQL 与 MyBatis 最小持久化闭环研究稿

## 冻结课程合同

| 项目 | 冻结值 |
| --- | --- |
| 课程 ID | `backend.java.learn.intermediate.spring-boot-mysql-mybatis-persistence-bridge` |
| 稳定 slug | `spring-boot-mysql-mybatis-persistence-bridge` |
| 稳定 URL | `/backend/java/core/learn/spring-boot-mysql-mybatis-persistence-bridge` |
| 标题 | Spring Boot、MySQL 与 MyBatis 最小持久化闭环 |
| 阶段与顺序 | Phase C `I-12`；`intermediate`；中级第 12 课 |
| 时长 | 150 分钟 |
| 唯一前置 | `I-11`：`backend.java.learn.intermediate.layers-dto-and-service-boundaries` |
| 课程性质 | 必修、桥接、新增 |
| 现代主线 | Java 25 LTS、Spring Boot 4.1.0、Spring Framework 7.0.8、MyBatis-Spring-Boot-Starter 4.1.0、MyBatis 3.5.19、MySQL 8.4.11、Flyway 12.4.0、Connector/J 9.7.0 |
| legacy 补充 | Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE、MyBatis-Spring-Boot-Starter 2.1.4 |
| Phase C 路线状态 | Phase A 已冻结为新增桥接课；本批只完成官方研究，不创建运行时课程资产 |

I-12 只建立一条可观察的真实持久化路径：Spring Boot 从外部属性构造 `DataSource`，Flyway 对真实
MySQL 执行一个版本化 migration，Controller 调用 Service，Service 在 Spring 事务中调用 Repository/
MyBatis Mapper，对一张任务表完成最小 CRUD，并通过 curl 与临时自动化检查验证提交、读取、唯一约束
失败和运行时异常回滚。

以下主题禁止扩入本课：JOIN、子查询、复杂动态 SQL、MyBatis-Plus、索引与 EXPLAIN、分页优化、事务
隔离级别、锁、死锁、补偿、备份恢复、读写分离、分区和分片。本课也不把迁移工具与 ORM 混用，不把
错误响应定制、数据库专项运维或生产凭据管理塞入最小闭环。

## 核验基线与研究方法

- 核验日期：2026-08-15。
- Spring Boot 4.1.0 官方系统要求固定 Java 17 至 Java 26，并要求 Spring Framework 7.0.8 或以上；
  Java 25 位于支持范围。
- Spring Boot 4.1.0 BOM 管理 Spring Framework 7.0.8、Flyway 12.4.0 和 Connector/J 9.7.0。
- MyBatis 官网生成文档当前仍显示 Starter 4.0.0，但 Maven Central 的项目元数据已将 4.1.0 标为
  release；4.1.0 parent POM 精确使用 Spring Boot 4.1.0、MyBatis-Spring 4.1.0 与 MyBatis 3.5.19。
  本课现代临时反馈环因此固定 Starter 4.1.0，而不是沿用滞后的生成页版本号。
- MySQL 8.4.11 官方 release note 日期为 2026-07-28。当前机器已有 `mysql:8.4` arm64 镜像，实际
  `mysqld --version` 为 8.4.11，RepoDigest 为
  `sha256:b3b90af2a6552ae30c266fdb7d5dd55f3afb72404bb78d37fe8a23eb857fd3fb`；此值只绑定本次
  `/tmp` 反馈快照，不宣称所有机器上的浮动 `8.4` tag 都永久等于该 digest。
- Tavily 先用于定位官方候选；MySQL 查询成功，其余查询因 Tavily 账户用量上限失败后，按仓库顺位
  切换到 Exa。最终结论均回到 Spring、MyBatis、MySQL、Flyway、Oracle 或 Maven Central 直接页面，
  搜索摘要不进入证据链。
- 本稿共有 39 个唯一直接 URL。Spring、MyBatis、Flyway、Maven Central、Oracle 与 OWASP 的 27 个
  URL 首轮 GET 均为 HTTP 200；MySQL 的 12 个 URL 在并发请求时被 WAF 返回 403，改为逐个串行 GET 后
  全部为 HTTP 200，说明链接有效且并发 403 不能误报为来源失效。
- 本研究只设计反馈环，不创建持久 fixture。课程实现时必须在新的 `mktemp` 目录中重新生成源码、记录
  镜像 digest、effective dependency 和测试结果，并在关闭课程前清理。

## 官方来源卡与直接证据

### Java、Spring Boot 与事务

| ID | 直接来源 | sourceType | 适用版本 | 支持结论 |
| --- | --- | --- | --- | --- |
| `oracle-java-support-roadmap` | [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) | `official-reference` | Java 25 | Java 25 是 LTS；本课选择 LTS 教学线，不把 Java 26 功能线误写成 LTS。 |
| `spring-boot-system-requirements` | [Spring Boot 4.1 System Requirements](https://docs.spring.io/spring-boot/4.1/system-requirements.html) | `official-reference` | Spring Boot 4.1.0 | 要求 Java 17 至 26、Spring Framework 7.0.8+ 和 Maven 3.6.3+。 |
| `spring-boot-sql-databases` | [SQL Databases](https://docs.spring.io/spring-boot/4.1/reference/data/sql.html) | `official-reference` | Spring Boot 4.1.0 | `DataSource` 使用 URL 与凭据建立连接；`spring.datasource.*` 控制配置，至少应提供外部数据库 URL；JDBC starter 默认带 HikariCP。 |
| `spring-boot-database-initialization` | [Database Initialization](https://docs.spring.io/spring-boot/4.1/how-to/data-initialization.html) | `official-reference` | Spring Boot 4.1.0 | schema 应只采用一种初始化机制；Flyway 默认从 `classpath:db/migration` 读取版本化脚本，MySQL 还需 `flyway-mysql` 模块。 |
| `spring-boot-4-1-bom` | [Spring Boot 4.1.0 Dependency BOM](https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-dependencies/4.1.0/spring-boot-dependencies-4.1.0.pom) | `build-metadata` | Spring Boot 4.1.0 | 管理 Framework 7.0.8、Flyway 12.4.0 与 Connector/J 9.7.0。 |
| `spring-boot-webmvc-starter-pom` | [spring-boot-starter-webmvc 4.1.0 POM](https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-webmvc/4.1.0/spring-boot-starter-webmvc-4.1.0.pom) | `build-metadata` | Spring Boot 4.1.0 | Web 最小依赖组合由 starter 提供，不手工拼 Tomcat、converter 与 MVC。 |
| `spring-boot-jdbc-starter-pom` | [spring-boot-starter-jdbc 4.1.0 POM](https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-jdbc/4.1.0/spring-boot-starter-jdbc-4.1.0.pom) | `build-metadata` | Spring Boot 4.1.0 | JDBC starter 组合 Boot JDBC 与 HikariCP 7.0.2。 |
| `spring-boot-flyway-starter-pom` | [spring-boot-starter-flyway 4.1.0 POM](https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-flyway/4.1.0/spring-boot-starter-flyway-4.1.0.pom) | `build-metadata` | Spring Boot 4.1.0 | Flyway starter 组合 Boot Flyway、JDBC starter 与 DataSource 支持。 |
| `spring-transactional` | [Using `@Transactional`](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html) | `official-reference` | Spring Framework 7.0.8 | 默认传播为 `REQUIRED`；默认只由 `RuntimeException` 或 `Error` 触发回滚，proxy 模式需经代理进入。 |
| `spring-transaction-rollback` | [Rolling Back a Declarative Transaction](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/rolling-back.html) | `official-reference` | Spring Framework 7.0.8 | 未处理异常沿调用栈冒泡后由事务基础设施应用 rollback rule；checked exception 默认不回滚。 |

### MyBatis、Mapper 与 Spring 事务接入

| ID | 直接来源 | sourceType | 适用版本 | 支持结论 |
| --- | --- | --- | --- | --- |
| `mybatis-starter-generated-site` | [MyBatis Spring Boot Starter Introduction](https://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/) | `official-reference` | 生成页 4.0.0 | 4.x 线要求 Spring Boot 4.0+、Java 17+；starter 自动探测 `DataSource`、创建 `SqlSessionFactory`/`SqlSessionTemplate` 并扫描 mapper。页面版本滞后必须与元数据一并判断。 |
| `mybatis-starter-metadata` | [MyBatis Starter Maven Metadata](https://repo.maven.apache.org/maven2/org/mybatis/spring/boot/mybatis-spring-boot-starter/maven-metadata.xml) | `build-metadata` | 2026-08-15 快照 | release 为 4.1.0；不能只根据 2025-12-01 生成页继续固定 4.0.0。 |
| `mybatis-starter-4-1-pom` | [mybatis-spring-boot-starter 4.1.0 POM](https://repo.maven.apache.org/maven2/org/mybatis/spring/boot/mybatis-spring-boot-starter/4.1.0/mybatis-spring-boot-starter-4.1.0.pom) | `build-metadata` | Starter 4.1.0 | Starter 已引入 `spring-boot-starter-jdbc`、MyBatis 自动配置、MyBatis 与 MyBatis-Spring。 |
| `mybatis-parent-4-1-pom` | [mybatis-spring-boot 4.1.0 Parent POM](https://repo.maven.apache.org/maven2/org/mybatis/spring/boot/mybatis-spring-boot/4.1.0/mybatis-spring-boot-4.1.0.pom) | `build-metadata` | Starter 4.1.0 | 精确绑定 Spring Boot 4.1.0、MyBatis 3.5.19 与 MyBatis-Spring 4.1.0。 |
| `mybatis-mapper-xml` | [Mapper XML Files](https://mybatis.org/mybatis-3/sqlmap-xml.html) | `official-reference` | MyBatis 3.5.19 | `#{...}` 以 prepared parameter 安全绑定值；官方明确警告，未修改的字符串替换不得接收用户输入，否则可能导致 SQL 注入。I-12 只借此解释绑定语义，不展开 XML 或动态 SQL。 |
| `mybatis-java-api` | [MyBatis Java API](https://mybatis.org/mybatis-3/java-api.html) | `official-reference` | MyBatis 3.5.19 | Mapper interface 方法对应 mapped statement；`@Param` 可给多参数稳定命名，写操作返回受影响行数。 |
| `mybatis-spring-transactions` | [MyBatis-Spring Transactions](https://mybatis.org/spring/transactions.html) | `official-reference` | MyBatis-Spring 4.1.0 | MyBatis 复用 Spring 事务管理；一个事务期间使用同一 `SqlSession` 并在完成时提交或回滚；Spring 管理的 session 不应手工 `commit`/`rollback`。 |

### MySQL、Flyway 与真实约束

| ID | 直接来源 | sourceType | 适用版本 | 支持结论 |
| --- | --- | --- | --- | --- |
| `mysql-8-4-11-release` | [MySQL 8.4.11 Release Notes](https://dev.mysql.com/doc/relnotes/mysql/8.4/en/news-8-4-11.html) | `release-note` | MySQL 8.4.11 | 8.4.11 于 2026-07-28 发布；本批真实 MySQL 快照固定到该运行版本。 |
| `mysql-security-guidelines` | [Security Guidelines](https://dev.mysql.com/doc/refman/8.4/en/security-guidelines.html) | `security-standard` | MySQL 8.4 | 不应授予超过应用所需的权限，也不应让应用以 root 账户连接。 |
| `mysql-create-database` | [Creating and Selecting a Database](https://dev.mysql.com/doc/refman/8.4/en/creating-database.html) | `official-reference` | MySQL 8.4 | `CREATE DATABASE` 建立命名数据库，连接后还需要选中数据库才能对其中对象操作。 |
| `mysql-create-table` | [CREATE TABLE Statement](https://dev.mysql.com/doc/refman/8.4/en/create-table.html) | `official-reference` | MySQL 8.4 | 表由列定义和约束组成；主键唯一且非空，`AUTO_INCREMENT` 可生成任务 ID；默认存储引擎是 InnoDB。 |
| `mysql-check-constraints` | [CHECK Constraints](https://dev.mysql.com/doc/refman/8.4/en/create-table-check-constraints.html) | `official-reference` | MySQL 8.4 | `CHECK` 表达式对写入行求值；结果为 `FALSE` 时约束失败。 |
| `mysql-insert` | [INSERT Statement](https://dev.mysql.com/doc/refman/8.4/en/insert.html) | `official-reference` | MySQL 8.4 | `INSERT` 增加行；列清单与值必须对应，约束在写入时生效。 |
| `mysql-select` | [SELECT Statement](https://dev.mysql.com/doc/refman/8.4/en/select.html) | `official-reference` | MySQL 8.4 | `SELECT` 读取指定列和行；I-12 只按主键读取，不进入 JOIN 或子查询。 |
| `mysql-update` | [UPDATE Statement](https://dev.mysql.com/doc/refman/8.4/en/update.html) | `official-reference` | MySQL 8.4 | `UPDATE ... SET ... WHERE ...` 修改命中行；返回受影响行数可验证目标是否存在。 |
| `mysql-delete` | [DELETE Statement](https://dev.mysql.com/doc/refman/8.4/en/delete.html) | `official-reference` | MySQL 8.4 | `DELETE ... WHERE ...` 删除命中行；本课不讲级联或多表删除。 |
| `mysql-commit-rollback` | [InnoDB autocommit, Commit, and Rollback](https://dev.mysql.com/doc/refman/8.4/en/innodb-autocommit-commit-rollback.html) | `official-reference` | MySQL 8.4 / InnoDB | `COMMIT` 使当前事务修改永久可见，`ROLLBACK` 取消当前事务的全部修改；默认 autocommit 使每条语句独立提交。 |
| `connector-j-9-7-release` | [Connector/J 9.7.0 Release Notes](https://dev.mysql.com/doc/relnotes/connector-j/en/news-9-7-0.html) | `release-note` | Connector/J 9.7.0 | 9.7.0 是 GA，支持 MySQL Server 8.0 及以上与 JDBC 4.2；可连接本课 MySQL 8.4.11。 |
| `connector-j-url` | [Connector/J Connection URL Syntax](https://dev.mysql.com/doc/connector-j/en/connector-j-reference-jdbc-url-format.html) | `official-reference` | Connector/J | 普通 JDBC URL 使用 `jdbc:mysql:`，单主机 URL 指定 host、port 与 database；凭据可放在 URL 之外。 |
| `flyway-versioned-migrations` | [Versioned Migrations](https://documentation.red-gate.com/flyway/flyway-concepts/migrations/versioned-migrations) | `official-reference` | Flyway 12.x | 版本化 migration 按版本顺序只应用一次；唯一版本、描述与 checksum 由 schema history 跟踪，已发布脚本不应原地改写。 |
| `flyway-schema-history` | [Flyway Schema History Table](https://documentation.red-gate.com/flyway/flyway-concepts/migrations/flyway-schema-history-table) | `official-reference` | Flyway 12.x | `flyway_schema_history` 记录执行版本、checksum 与成功状态；它是工具元数据表，不是第二张业务表。 |
| `flyway-mysql-pom` | [flyway-mysql 12.4.0 POM](https://repo.maven.apache.org/maven2/org/flywaydb/flyway-mysql/12.4.0/flyway-mysql-12.4.0.pom) | `build-metadata` | Flyway 12.4.0 | MySQL 数据库支持位于独立 `flyway-mysql` 模块，并依赖同版本 `flyway-core`。 |

### Java 8 / Spring Boot 2.3.12 legacy 直接证据

| ID | 直接来源 | sourceType | 适用版本 | 支持结论 |
| --- | --- | --- | --- | --- |
| `spring-boot-2-3-requirements` | [Spring Boot 2.3.12 Getting Started](https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html) | `official-reference` | Boot 2.3.12.RELEASE | 要求 Java 8，兼容至 Java 15，并要求 Framework 5.2.15.RELEASE+。 |
| `spring-boot-2-3-howto` | [Spring Boot 2.3.12 How-to Guides](https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/howto.html) | `official-reference` | Boot 2.3.12.RELEASE | 旧线使用 `spring.datasource.*` 配置外部 DataSource，并可在启动时运行 Flyway migration。 |
| `spring-boot-2-3-bom` | [Spring Boot 2.3.12 Dependency BOM](https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-dependencies/2.3.12.RELEASE/spring-boot-dependencies-2.3.12.RELEASE.pom) | `build-metadata` | Boot 2.3.12.RELEASE | 管理 Framework 5.2.15.RELEASE、Flyway 6.4.4 与 `mysql-connector-java` 8.0.25。 |
| `mybatis-starter-2-1-pom` | [mybatis-spring-boot-starter 2.1.4 POM](https://repo.maven.apache.org/maven2/org/mybatis/spring/boot/mybatis-spring-boot-starter/2.1.4/mybatis-spring-boot-starter-2.1.4.pom) | `build-metadata` | Starter 2.1.4 | 旧 starter 同样组合 JDBC starter、自动配置、MyBatis 与 MyBatis-Spring。 |
| `mybatis-parent-2-1-pom` | [mybatis-spring-boot 2.1.4 Parent POM](https://repo.maven.apache.org/maven2/org/mybatis/spring/boot/mybatis-spring-boot/2.1.4/mybatis-spring-boot-2.1.4.pom) | `build-metadata` | Starter 2.1.4 | 精确绑定 MyBatis 3.5.6 与 MyBatis-Spring 2.0.6；官方兼容表将 2.1 线用于 Boot 2.1–2.4 / Java 8+。 |
| `spring-5-transaction` | [Spring Framework 5.2.15 Data Access](https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/data-access.html) | `official-reference` | Framework 5.2.15.RELEASE | 旧线同样支持声明式事务，默认运行时异常回滚，并要求代理入口；不能用现代包名或 Boot 4 starter 倒推 legacy。 |

### 安全边界直接证据

| ID | 直接来源 | sourceType | 适用版本 | 支持结论 |
| --- | --- | --- | --- | --- |
| `owasp-secrets-management` | [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) | `security-standard` | 临时数据库凭据 | 凭据不应硬编码进源码或容器定义，也不应以明文进入日志；环境变量仅作为本地临时闭环的受限折中。 |

MyBatis 官方 Mapper 文档还明确区分 `#{}` 与字符串替换：前者设置安全的 prepared parameter；后者
会把未修改字符串直接注入 statement，不得接收未经控制的用户输入。因此本课既不拼接请求值，也不让
客户端动态选择表名或列名。

## 零基础概念与单表边界

### 数据库、表、行、列、主键与连接

本课固定使用数据库 `taskdb` 和业务表 `tasks`：

- 数据库是服务器中命名的一组对象；JDBC URL 的 database 部分选择 `taskdb`。
- 表定义同类记录的结构；`tasks` 只保存任务，不引入用户、标签或审计等第二张业务表。
- 一行表示一个任务；`INSERT` 增加行，`SELECT` 读取行，`UPDATE` 改变行，`DELETE` 删除行。
- 一列表示所有任务共享的一个字段合同，例如 `title` 或 `status`；列类型和约束在 migration 中固定。
- 主键 `id` 唯一标识每行，且由 MySQL `AUTO_INCREMENT` 生成；Web 请求不能自行指定数据库主键。
- 连接是应用与 MySQL 会话的通道。`DataSource` 负责给框架提供 JDBC `Connection`；URL、用户名或
  密码错误时，应用不能把“进程启动了”误判为“持久化可用”。

这些是进入最小闭环所需的工作定义，不延伸关系代数、范式、JOIN、索引组织或查询优化。

### 一张任务表与一个版本化 migration

唯一业务 migration 固定为 `src/main/resources/db/migration/V1__create_tasks.sql`：

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

`tasks` 是唯一业务表；Flyway 自建的 `flyway_schema_history` 是迁移元数据，不增加业务模型。课程不得
同时保留 `schema.sql`、JPA `ddl-auto` 或第二个 migration。`V1` 成功后应从 schema history 看到一条
成功记录；脚本修订必须先重建临时数据库，不能在已执行数据库上修改 checksum 后硬修 history。

`request_key` 不是本课展开幂等协议的入口，只是一个稳定的唯一约束探针：同一值写两次，第二次必须
失败且数据库仍只有第一行。`title` 与 `status` 的 CHECK 则证明约束属于数据库合同，而不只存在于
Controller 校验。

## 现代依赖与配置合同

### 精确 Maven 组合

临时反馈 fixture 固定以下直接依赖；版本由 Boot parent 管理的部分不重复写版本：

```xml
<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>4.1.0</version>
  <relativePath />
</parent>

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
```

Starter 4.1.0 已传递引入 JDBC starter，因此课程 POM 不再重复声明
`spring-boot-starter-jdbc`。`spring-boot-starter-flyway` 提供 Boot/Flyway 集成，MySQL 方言支持仍需
`flyway-mysql`。运行前必须用 `mvn dependency:tree` 或 effective POM 确认最终得到 Framework 7.0.8、
MyBatis 3.5.19、MyBatis-Spring 4.1.0、Flyway 12.4.0 与 Connector/J 9.7.0。

### DataSource 只从外部属性取连接信息

`application.properties` 不保存真实凭据，只映射环境变量：

```properties
spring.datasource.url=${TASK_DB_URL}
spring.datasource.username=${TASK_DB_USERNAME}
spring.datasource.password=${TASK_DB_PASSWORD}
mybatis.configuration.map-underscore-to-camel-case=true
```

真实反馈环注入：

```text
TASK_DB_URL=jdbc:mysql://java-i12-mysql:3306/taskdb
TASK_DB_USERNAME=task_app
TASK_DB_PASSWORD=仅供本次临时容器使用的随机值
```

普通 URL 已足够建立本地闭环，不添加未解释的时区、编码、TLS 或连接池调优参数。连接失败验收只改变
host 为不存在的 `java-i12-missing`，其余配置保持不变，保证负例只验证一个原因。

## Mapper、CRUD 与调用路径

### 参数绑定不是字符串拼接

Mapper 只保留一组静态 SQL annotation，不引入 XML、provider 或动态 SQL：

```java
@Mapper
public interface TaskMapper {

  /**
   * 插入任务行并回填生成主键。
   *
   * @param row 待插入任务行
   * @return 受影响行数
   */
  @Insert("""
      INSERT INTO tasks (request_key, title, status)
      VALUES (#{requestKey}, #{title}, #{status})
      """)
  @Options(useGeneratedKeys = true, keyProperty = "id")
  int insert(TaskRow row);

  /**
   * 按主键读取任务行。
   *
   * @param id 任务主键
   * @return 任务行；不存在时为 null
   */
  @Select("""
      SELECT id, request_key, title, status, created_at
      FROM tasks
      WHERE id = #{id}
      """)
  TaskRow findById(@Param("id") long id);

  /**
   * 更新任务状态。
   *
   * @param id 任务主键
   * @param status 新状态
   * @return 受影响行数
   */
  @Update("""
      UPDATE tasks
      SET status = #{status}
      WHERE id = #{id}
      """)
  int updateStatus(@Param("id") long id, @Param("status") String status);

  /**
   * 按主键删除任务行。
   *
   * @param id 任务主键
   * @return 受影响行数
   */
  @Delete("DELETE FROM tasks WHERE id = #{id}")
  int deleteById(@Param("id") long id);

  /**
   * 按请求键统计任务行。
   *
   * @param requestKey 请求键
   * @return 匹配行数
   */
  @Select("SELECT COUNT(*) FROM tasks WHERE request_key = #{requestKey}")
  int countByRequestKey(@Param("requestKey") String requestKey);
}
```

`#{...}` 把 Java 值交给 prepared parameter，不允许把请求值拼进 SQL 字符串。多个简单参数必须用
`@Param` 给 statement 稳定命名。`TaskRow` 是 persistence adapter 内部的可变行模型，仅 `id` 为了
接收 generated key 可写；Controller 的输入/输出 DTO 与它分离。

### 最短依赖方向

```text
HTTP JSON
  -> TaskController
  -> TaskService (@Transactional)
  -> TaskRepository
  -> MyBatisTaskRepository
  -> TaskMapper
  -> DataSource / MySQL tasks
```

- Controller 绑定请求 DTO、调用 Service、选择 HTTP status；不注入 Mapper。
- Service 接收应用命令并持有事务边界；不依赖 HTTP 或数据库列名。
- Repository 用任务语言表达 `save/find/update/delete`；adapter 检查 Mapper 受影响行数。
- Mapper 只表达 SQL 与参数/结果映射；不编排业务流程，也不手工管理 `SqlSession` 事务。

最小 CRUD 验收固定为：创建返回生成 ID；按 ID 读取同一标题；更新 `OPEN -> DONE` 后读取为
`DONE`；删除返回无内容，随后按 ID 读取为不存在。不存在目标或重复 request key 的 HTTP 错误格式不在
本研究定义，验收只检查非成功状态和数据库最终行数。

## 成功事务与回滚合同

### 成功路径

`TaskService.createTask` 在一个外部代理调用的 `@Transactional` 方法中完成 Mapper `insert` 与
`findById`。HTTP 返回成功后，再通过新的 curl GET 和 MySQL client 连接读取同一 ID。两条独立观察都
看到该行，才算提交成功；只看到 Service 返回对象不能证明持久化提交。

```text
POST /api/tasks -> 201 + id
GET /api/tasks/{id} -> 200 + 同一 requestKey/title/status
mysql SELECT -> 同一行
```

### 回滚路径

仓库禁止保留测试文件，因此实现批次在 `/tmp` fixture 的 `src/test/java` 中定义测试专用
`TransactionProbe` bean：

1. 该 bean 的 public 方法标记 `@Transactional`。
2. 方法调用真实 `TaskMapper.insert` 写入唯一 `request_key=rollback-probe`。
3. 写入后抛出 `IllegalStateException`，且不在方法内吞掉异常。
4. 测试方法本身不标记 `@Transactional`，捕获异常后从新的 Mapper/JDBC 调用执行 count。
5. 期望 count 为 0；将异常改为不抛时，同一探针应提交且 count 为 1。

测试专用 bean 避免在课程生产 API 增加 `fail=true` 或“回滚测试端点”。它既经过 Spring proxy，又使用
与 MyBatis 相同的 `DataSource`；这比 mock、H2 或在测试方法末尾统一回滚更能证明真实 MySQL 合同。

## `/tmp` 真实 MySQL 反馈环设计

### 固定运行资产

| 资产 | 精确值 |
| --- | --- |
| 工作目录 | `mktemp -d /tmp/java-i12-phase-c.XXXXXX` |
| Maven/JDK 镜像 | `maven:3.9.12-eclipse-temurin-25` |
| MySQL 镜像 | 固定 `mysql@sha256:b3b90af2a6552ae30c266fdb7d5dd55f3afb72404bb78d37fe8a23eb857fd3fb`，运行时 8.4.11 |
| 数据库 | `taskdb` |
| 业务表 | `tasks`，仅一张 |
| migration | `V1__create_tasks.sql`，仅一个 |
| Maven 依赖 | Boot 4.1.0、MyBatis Starter 4.1.0、Flyway MySQL、Connector/J |
| 网络 | 新建只用于该 fixture 的 Docker network |
| 凭据 | 每次 fixture 生成的临时值，只通过环境变量传入，不写仓库 |

容器和网络名称必须由当前批次唯一前缀生成，并在创建后记录为明确值；清理时禁止用宽泛 name filter、
glob 或仓库根路径。数据库 readiness 使用 MySQL client `SELECT 1`，不能只用固定 sleep。

### 反馈环一：成功启动、migration 与 CRUD

1. 启动 MySQL 8.4.11 临时容器，创建 `taskdb` 和最小权限应用用户。
2. 循环执行容器内 `mysql ... -e 'SELECT 1'`，直到成功或超时。
3. 在同一 Docker network 中运行 Maven/JDK 25 容器，先执行 `mvn -q test`。
4. 以正确 DataSource URL 启动应用，等待 `/api/tasks` 可连接；不得把 sleep 结束当 readiness。
5. curl 创建 `requestKey=task-001`、`title=整理 MySQL 笔记`，断言 HTTP 201 并取得数字 ID。
6. curl 按 ID 读取，断言 200、标题和 `OPEN`；MySQL client 从独立连接读取同一行。
7. curl 更新状态为 `DONE`，再读取断言已改变；Mapper update 必须返回 1。
8. curl 删除，断言成功；再次读取为非成功状态，MySQL count 为 0。
9. 查询 `flyway_schema_history`，断言 `version='1'`、`success=1` 且只有一个 versioned migration。

稳定证据文本建议为：

```text
runtime|java=25|maven=3.9.12|mysql=8.4.11
migration|version=1|success=1|businessTables=1
crud|create=201|read=200|update=200|status=DONE|delete=204|missing=404|remaining=0
```

### 反馈环二：连接失败与恢复

1. 保持 POM、源码、凭据和运行中的 MySQL 容器不变，只把 host 改为不存在的
   `java-i12-missing`。
2. 前台执行同一个 `spring-boot:run` 命令，断言进程非 0 退出；日志的根因链必须包含无法取得 JDBC
   连接或 host 解析/连接失败，应用端口不得可访问。
3. 恢复唯一改动为 `java-i12-mysql`，复跑同一命令；断言启动成功、migration 为 success 且 GET 可用。

```text
connection|badHostExit=nonzero|httpListening=false
connection|recovered=true|migrationVersion=1
```

不要通过禁用 Flyway、换成 H2、添加 `continue-on-error` 或跳过数据库读取来关闭连接失败 Gate。

### 反馈环三：唯一约束失败

1. POST `requestKey=duplicate-001` 一次，断言成功并记录 ID。
2. 用完全相同的 `requestKey` 再 POST，断言非 2xx；不要求本课定制错误 JSON。
3. 从新的 MySQL client 连接执行 count，断言仍为 1，且第一行字段未改变。
4. 换成 `duplicate-002` 复跑相同请求，断言成功，证明失败由唯一约束而非连接中断造成。

```text
constraint|first=created|duplicate=non2xx|duplicateCount=1|recovered=created
```

### 反馈环四：运行时异常回滚

1. 用测试专用 `TransactionProbe` 写入 `rollback-probe` 后抛 `IllegalStateException`。
2. 断言异常从事务代理调用返回，随后新查询 count 为 0。
3. 运行不抛异常的成功方法写入 `commit-probe`，随后新查询 count 为 1。
4. 将 probe 错误地改为捕获异常并正常返回，反馈环必须变红为 count 1；恢复异常冒泡后重跑为 0。

```text
transaction|commitCount=1|rollbackCount=0|exception=IllegalStateException
```

这四组检查至少连续运行两轮，第二轮必须使用干净的新数据库容器或显式的新数据库名，不能依赖第一轮
残留状态。记录 POM、migration、核心测试和镜像 digest 的 SHA，再删除临时容器、网络、日志、截图与
fixture 目录。

## Java 8 / Boot 2.3.12 兼容补充

legacy 只作为旧项目读法，不替代现代线。精确直接依赖组合为：

```xml
<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>2.3.12.RELEASE</version>
</parent>

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

- Java record、text block 和现代 starter 名称改为 Java 8 final class、普通字符串与
  `spring-boot-starter-web`。
- Boot 2.3.12 BOM 固定 Flyway 6.4.4 和 Connector/J 8.0.25；该旧 Flyway 线不使用现代
  `flyway-mysql` 拆分模块。
- `DataSource`、Mapper `#{}` / `@Param`、Service 事务边界、migration 命名与单表 CRUD 的核心思路
  可兼容改写；任何“旧组合已能运行 MySQL 8.4.11”的声明仍需独立真实反馈，不由现代测试外推。
- legacy 最小检查应在 `maven:3.9.12-eclipse-temurin-8` 中编译和运行；若未执行真实 MySQL 反馈，只能
  报告 source/runtime 边界，不能写成数据库兼容通过。

## 正文拆分合同

正式课程建议保持以下 15 个知识点，每个知识点都必须包含“是什么、为什么、最小代码、如何运行、
预期结果、一个失败路径、恢复后复验”，不能把大量代码放在最后一个总示例中代替逐点讲解：

1. 数据库与连接：`taskdb`、host、port、database 和会话。
2. 表、行与列：一行一个任务，列是共享字段合同。
3. 主键与约束：`id`、唯一 request key、非空与 CHECK。
4. DataSource：URL、用户、密码与连接池的最小职责。
5. 连接失败：错误 host 的非 0 启动与恢复。
6. Flyway：`V1__create_tasks.sql`、history 与 checksum。
7. 任务表：只解释当前五列，不扩展关系模型。
8. Mapper interface：Java 方法如何对应静态 SQL statement。
9. 参数绑定：`#{}` 与 `@Param`，禁止字符串拼值。
10. Create：插入、generated key 与受影响行数。
11. Read：按主键选择显式列并映射 `TaskRow`。
12. Update/Delete：WHERE 主键、受影响行数与不存在目标。
13. 调用路径：Controller -> Service -> Repository -> Mapper。
14. 成功事务：HTTP 返回后由新连接读取，证明提交。
15. 约束失败与回滚：重复 key 保留第一行，运行时异常写入计数为 0。

## 易错点与定向负例

| 易错点 | 触发条件 | 可观察后果 | 最小修正 | 复验 |
| --- | --- | --- | --- | --- |
| 把 H2 当 MySQL 验收 | 只跑内存库 | 方言、约束和驱动连接没有被验证 | 使用固定 MySQL 8.4.11 容器 | curl 与 MySQL client 双观察 |
| 同时用 Flyway 和 `schema.sql` | 两种机制都建表 | 启动顺序或重复 DDL 失败 | 只保留 Flyway | history 只有 V1 |
| 漏掉 `flyway-mysql` | Boot 4/Flyway 12 只加 core | 启动迁移无法处理 MySQL | 加同 BOM 管理的模块 | 同一启动命令成功 |
| SQL 拼接请求值 | 把 title/requestKey 拼进 annotation 字符串 | quoting 错误并扩大注入风险 | 只用 `#{}` 参数 | 含引号标题可正常往返 |
| 多参数不命名 | Mapper 多个简单参数只写 `#{id}`/`#{status}` | statement 找不到稳定参数名 | 使用 `@Param` | update 返回 1 |
| Controller 直调 Mapper | Web 层越过业务与事务边界 | 事务散落、难以复用 | 经 Service/Repository 调用 | 依赖检查与回滚探针 |
| 在 Mapper 手工 commit | Spring 管理的 session 上自行提交 | 破坏统一事务，甚至抛异常 | 事务只放 Service/probe | rollback count 为 0 |
| 吞掉运行时异常 | `catch` 后正常返回 | Spring 可能提交已执行写入 | 异常继续冒泡或明确标记回滚 | 错误版本 count 1，修复后 0 |
| 只看返回对象 | Service 返回带 ID 就认为提交 | 可能仍处在事务或已回滚 | 新 HTTP/DB 连接复读 | commit count 1 |
| 修改已执行 V1 | 改 migration 后复用旧库 | checksum 不一致 | 临时库重建；正式环境新增版本 | validate/history 恢复一致 |

## 研究 Gate 自检

- [x] 标题、稳定 ID、150 分钟、Phase C I-12 与唯一前置 I-11 已核对。
- [x] 数据库、表、行、列、主键、连接与 DataSource 均有零基础定义和可观察失败。
- [x] 只冻结一张 `tasks` 业务表、一个 `V1` migration 和最小 CRUD；Flyway history 明确为工具表。
- [x] Mapper interface、`#{}`、`@Param`、generated key 与受影响行数均绑定 MyBatis 官方来源。
- [x] 调用路径固定为 Controller -> Service -> Repository -> Mapper，事务边界在代理调用的 Service。
- [x] 真实 MySQL 反馈环覆盖成功提交、连接失败、唯一约束失败与运行时异常回滚。
- [x] 现代 fixture 精确冻结 Boot 4.1.0、Starter 4.1.0、MyBatis 3.5.19、Flyway 12.4.0、
  Connector/J 9.7.0、MySQL 8.4.11 与 Java 25。
- [x] 凭据、最小权限与 SQL 参数绑定的安全结论分别由 OWASP、MySQL 和 MyBatis 直接来源支持。
- [x] Java 8 / Boot 2.3.12 legacy 仅作隔离补充，未把现代结果外推为旧组合已通过。
- [x] 未扩入 JOIN、子查询、动态 SQL、MyBatis-Plus、索引/EXPLAIN、隔离/锁/死锁、备份恢复、
  读写分离、分区或分片。
- [x] 本批只新增本研究稿，未创建课程正文、loader、manifest、track、signoff 或持久 fixture。

## Stop Boundary

本研究稿只完成 Phase C I-12 `spring-boot-mysql-mybatis-persistence-bridge` 的官方研究与临时反馈环
设计。研究完成不等于课程可访问、真实 fixture 已运行、浏览器已验收或 signoff 已关闭。父任务必须在
同一课程批次完成正文、运行时登记、真实 MySQL 双轮反馈、工程 Gate、浏览器证据、独立 Standards/
Spec `PASS / 0 finding`、signoff 与临时资产清理后，才能关闭 I-12；本稿不授权读取或实施任何后续课程。
