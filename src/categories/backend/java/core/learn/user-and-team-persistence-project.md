---
id: backend.java.learn.intermediate.user-and-team-persistence-project
type: lesson
title: 用户与团队持久化
summary: 在不改变公开 HTTP 合同的前提下，用 MyBatis 与 MySQL 持久化用户、团队和成员关系
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 300
prerequisites:
  - backend.java.learn.intermediate.user-and-team-api-project
  - backend.java.learn.intermediate.database-migrations
  - backend.java.learn.intermediate.mybatis-write-and-dynamic-sql
objectives:
  - 能在接入数据库前冻结 URL、DTO、状态码、Location、错误码和零字节 204 合同。
  - 能区分公开资源 ID 与数据库内部主键，并让内部 BIGINT 永不进入响应 DTO。
  - 能把既有 equalsIgnoreCase 邮箱规则冻结为内部比较键，不让数据库默认排序规则改变冲突语义。
  - 能为 User、Team 与 TeamMember 设计职责明确的 Mapper、Row 和 XML statement。
  - 能用一次 JOIN 读取成员与用户投影，并避免逐成员查询 User 的 N+1。
  - 能让 Service 保持未知资源、重复邮箱、重复成员和嵌套资源范围语义。
  - 能用数据库 UNIQUE 与 FOREIGN KEY 约束守住并发窗口和越界写入。
  - 能精确区分已确认的业务冲突与其他 DataAccessException，不解析厂商错误文本。
  - 能在尚未学习 SQL 分页和事务时，明确保留服务层分页与单 DML 写用例的教学边界。
  - 能在 JDK 25 与 Java 8 工程中连接真实 MySQL 8.4，并验证重启后的持久化结果。
recap:
  - Controller、DTO 与错误处理保持上一课合同，只有 Service 的状态来源从内存 Map 改为三个 Mapper。
  - 公开 ID 在 INSERT 前生成，内部自增 id 只用于主键、外键、稳定排序和 generated key 验证。
  - 邮箱原文按 UTF-16 code unit 二进制保存并继续进入响应，内部 emailKey 只承载 equalsIgnoreCase 比较结果。
  - UserMapper 与 TeamMapper 负责各自资源，TeamMemberMapper 用 teamId 加 memberPublicId 限定详情并用 JOIN 投影用户名称。
  - Mapper 写方法返回受影响行数，generated key 写入参数 Row 的可写 id 属性，两者不能混为一谈。
  - 业务预查负责清晰的 404 或 409 流程，UNIQUE 与 FOREIGN KEY 才是竞争和越界写入的最终防线。
  - 只有重新查询确认 email 或 team/user 关系已经存在时，DuplicateKeyException 才转换成既有 409。
  - 本课列表先按内部 id 读取完整小型集合再复用 token 切片；SQL 分页留给“分页与筛选”课程。
  - 本课每个公开写用例只有一条 INSERT 或 DELETE，不添加 Transactional；事务留给“事务”课程。
  - Java 8 线除依赖坐标、校验包和 record DTO 写法外，还按 Java 8 的 char 规则生成 emailKey；Mapper XML、数据库约束与各自前置课合同保持一致。
related:
  - backend.java.learn.intermediate.relational-data-and-sql-foundations
  - backend.java.learn.intermediate.database-migrations
  - backend.java.learn.intermediate.mybatis-query-mapping
  - backend.java.learn.intermediate.mybatis-write-and-dynamic-sql
  - backend.java.learn.intermediate.user-and-team-api-project
tags:
  - MyBatis
  - MySQL
  - 持久化
  - REST API
  - 数据库约束
  - JOIN
appliesTo: JDK 25、Spring Boot 4.1.0、MyBatis Spring Boot Starter 4.1.0、MyBatis 3.5.19、MyBatis-Spring 4.1.0、Flyway 12.4.0 与 MySQL 8.4 LTS；Java 8、Spring Boot 2.3.12.RELEASE、Starter 2.1.4、MyBatis 3.5.6、MyBatis-Spring 2.0.6 兼容补充
verifiedAt: 2026-08-20
sources:
  - id: mybatis-persistence-xml
    title: MyBatis 3 - Mapper XML Files
    url: https://mybatis.org/mybatis-3/sqlmap-xml.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis 3.5.19
    claims:
      - select、insert、delete、resultMap、参数绑定与 generated key 的 XML 合同
      - nested select 与 nested result 的查询形状及其边界
  - id: mybatis-persistence-java-api
    title: MyBatis 3 - Java API
    url: https://mybatis.org/mybatis-3/java-api.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis 3.5.19
    claims:
      - Mapper 方法与 SqlSession 操作的返回语义
  - id: mybatis-spring-persistence-start
    title: MyBatis-Spring - Getting Started
    url: https://mybatis.org/spring/getting-started.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis-Spring 4.1.0 与 2.0.6
    claims:
      - Mapper 扫描、注入与 Spring Boot 自动配置方式
  - id: mybatis-spring-persistence-transactions
    title: MyBatis-Spring - Transactions
    url: https://mybatis.org/spring/transactions.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis-Spring 4.1.0 与 2.0.6
    claims:
      - Spring 事务之外的 Mapper 数据操作会自动提交
  - id: spring-duplicate-key-708
    title: DuplicateKeyException API - Spring Framework 7.0.8
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/dao/DuplicateKeyException.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - DuplicateKeyException 是 DataIntegrityViolationException 的专门子类
  - id: spring-data-integrity-708
    title: DataIntegrityViolationException API - Spring Framework 7.0.8
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/dao/DataIntegrityViolationException.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 完整性异常还可能来自非空、外键及其他约束，不能全部映射成重复冲突
  - id: mysql84-persistence-foreign-keys
    title: MySQL 8.4 - FOREIGN KEY Constraints
    url: https://dev.mysql.com/doc/refman/8.4/en/create-table-foreign-keys.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - 外键引用、RESTRICT 与父子行完整性规则
  - id: mysql84-persistence-indexes
    title: MySQL 8.4 - CREATE INDEX Statement
    url: https://dev.mysql.com/doc/refman/8.4/en/create-index.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - UNIQUE 索引拒绝重复键值
  - id: mysql84-persistence-errors
    title: MySQL 8.4 - Server Error Message Reference
    url: https://dev.mysql.com/doc/mysql-errors/8.4/en/server-error-reference.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - 1062、1451 与 1452 的错误号和 SQLSTATE
  - id: java8-thread-local-random
    title: ThreadLocalRandom API - Java SE 8
    url: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ThreadLocalRandom.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java 8 及以后
    claims:
      - current 与 nextLong 可以生成指定原点到上界之间的 long 值
  - id: java25-string-equals-ignore-case
    title: String API - Java SE 25
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html#equalsIgnoreCase(java.lang.String)
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - equalsIgnoreCase 按 Unicode code point 忽略大小写的公开合同
  - id: java8-string-equals-ignore-case
    title: String API - Java SE 8
    url: https://docs.oracle.com/javase/8/docs/api/java/lang/String.html#equalsIgnoreCase-java.lang.String-
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 中 equalsIgnoreCase 按 UTF-16 char 比较的规则
  - id: java8-byte-buffer
    title: ByteBuffer API - Java SE 8
    url: https://docs.oracle.com/javase/8/docs/api/java/nio/ByteBuffer.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java 8 及以后
    claims:
      - putChar、putInt、array 与默认大端字节序的二进制读写合同
  - id: mysql84-binary-varbinary
    title: MySQL 8.4 - The BINARY and VARBINARY Types
    url: https://dev.mysql.com/doc/refman/8.4/en/binary-varbinary.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - VARBINARY 保存二进制字符串并按字节数值比较
  - id: mysql84-column-character-set-collation
    title: MySQL 8.4 - Column Character Set and Collation
    url: https://dev.mysql.com/doc/refman/8.4/en/charset-column.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - 列级 COLLATE 可以显式指定 VARCHAR 的排序规则并覆盖表级默认值
  - id: mysql84-bin-collations
    title: MySQL 8.4 - The binary Collation Compared to _bin Collations
    url: https://dev.mysql.com/doc/refman/8.4/en/charset-binary-collations.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - utf8mb4_0900_bin 是 utf8mb4 的二进制排序规则，并按字符码值比较非二进制字符串
  - id: mybatis-starter-persistence-410
    title: MyBatis Spring Boot Starter Parent POM 4.1.0
    url: https://repo.maven.apache.org/maven2/org/mybatis/spring/boot/mybatis-spring-boot/4.1.0/mybatis-spring-boot-4.1.0.pom
    sourceOrigin: official
    sourceType: source-code
    appliesTo: Starter 4.1.0
    claims:
      - 现代线解析 MyBatis-Spring 4.1.0 与 MyBatis 3.5.19
  - id: spring-boot-flyway-starter-persistence-410
    title: Spring Boot Starter Flyway POM 4.1.0
    url: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-flyway/4.1.0/spring-boot-starter-flyway-4.1.0.pom
    sourceOrigin: official
    sourceType: source-code
    appliesTo: Spring Boot 4.1.0
    claims:
      - Boot 4.1 通过专用 starter 组合 Flyway 自动配置、JDBC 与 DataSource 支持
  - id: mybatis-starter-persistence-214
    title: MyBatis Spring Boot Starter Parent POM 2.1.4
    url: https://repo.maven.apache.org/maven2/org/mybatis/spring/boot/mybatis-spring-boot/2.1.4/mybatis-spring-boot-2.1.4.pom
    sourceOrigin: official
    sourceType: source-code
    appliesTo: Starter 2.1.4
    claims:
      - Java 8 线解析 MyBatis-Spring 2.0.6 与 MyBatis 3.5.6
  - id: mybatis-nested-select-n-plus-one
    title: One to many relationship in MyBatis
    url: https://stackoverflow.com/a/33450398
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: MyBatis nested select 真实案例；实现结论已按 MyBatis 3.5.19 官方映射文档复核
    claims:
      - nested select 可能对每条父记录继续查询子记录的真实误用场景
---

# 用户与团队持久化

上一阶段已经有一套可运行的用户、团队和成员 API，但它把状态放在进程内 Map 中。应用一停，刚创建的用户就
消失；启动两个实例时，两个 Map 也彼此不知道对方写了什么。现在要把状态来源换成 MySQL，同时让客户端看不出
Controller 后面换过实现。

本课沿用“用户与团队 API”的工程和公开合同，只替换内存 Service。三个 Mapper 分别负责用户、团队和成员关系，
Flyway 负责三张表，Service 继续解释 404、409、分页 token 与嵌套资源范围。MyBatis-Plus、SQL 分页、事务和项目
任务持久化仍属于后续课程，不在这里提前实现。

## 一、接线前冻结 API 合同

### 1. 数据库接入不能改变外部行为

先把上一课已经交付的行为写成替换边界：

| 场景 | 必须保留的结果 |
| --- | --- |
| 创建 User、Team、TeamMember | `201 Created`、正确 Location、原响应 DTO |
| 重复邮箱 | 409、`USER_CONFLICT` |
| 同团队重复成员 | 409、`MEMBER_CONFLICT` |
| 合法格式但未知的 User 或 Team | 原有 404 与错误码 |
| 已知空团队的成员列表 | 200、空 items、null token |
| 从错误 Team URL 查询 Member | 404、`MEMBER_NOT_FOUND` |
| 删除 Member | 只删关系，返回真正零字节的 204 |

Controller、请求 DTO、响应 DTO、`GlobalExceptionHandler` 和 URI 都保持不变。Service 仍抛同一个
`ApiException`，Advice 因而继续产生相同的 `application/problem+json`。Mapper 不知道 HTTP 状态码，Controller
也不直接捕获 SQL 异常。

数据库改变的是状态所有者，而不是 API 身份：

```text
HTTP 请求
  -> 原 Controller 与 DTO
    -> 新 ApiService
      -> UserMapper / TeamMapper / TeamMemberMapper
        -> MySQL 8.4
```

### 2. 公开 ID 与内部主键各负其责

客户端只认识 `USR-*`、`TEAM-*` 和 `MBR-*`。数据库还需要紧凑的 `BIGINT` 主键来建立外键和稳定排序，但内部值
不能进入响应，也不能被拼成公开 ID：

| 位置 | 示例 | 职责 |
| --- | --- | --- |
| `users.id` | `17` | 数据库主键、外键目标、排序 |
| `users.public_id` | `USR-7354087391001` | 稳定 API 身份 |
| `team_members.id` | `42` | 关系表内部主键、排序 |
| `team_members.public_id` | `MBR-8837102440021` | 成员资源身份 |

公开 ID 在 INSERT 前生成。`ThreadLocalRandom` 从 Java 8 起就支持指定区间的 `nextLong`，因此两条线路共用：

```java
/** 生成符合既有正整数格式的公开标识。 */
private String nextPublicId(String prefix) {
    long value = ThreadLocalRandom.current().nextLong(1, Long.MAX_VALUE);
    return prefix + value;
}
```

这个数字不是安全令牌，也不表达创建顺序。数据库的 `UNIQUE(public_id)` 负责阻止极小概率的碰撞；本课不为概率
碰撞编写复杂重试器，更不能把内部自增值重新暴露给客户端。

## 二、从三张表建立三个 Mapper

### 1. 用迁移声明身份、唯一性与引用

沿用前置迁移课程的规则，新建
`src/main/resources/db/migration/V1__create_user_team_tables.sql`：

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
);

CREATE TABLE teams (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id VARCHAR(32) COLLATE utf8mb4_0900_bin NOT NULL,
  name VARCHAR(60) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT uk_teams_public_id UNIQUE (public_id)
);

CREATE TABLE team_members (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id VARCHAR(32) COLLATE utf8mb4_0900_bin NOT NULL,
  team_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  role VARCHAR(30) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT uk_team_members_public_id UNIQUE (public_id),
  CONSTRAINT uk_team_members_team_user UNIQUE (team_id, user_id),
  CONSTRAINT fk_team_members_team FOREIGN KEY (team_id)
    REFERENCES teams(id) ON DELETE RESTRICT,
  CONSTRAINT fk_team_members_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE RESTRICT
);
```

三个 `public_id` 都显式使用 `utf8mb4_0900_bin`，让查找与唯一约束按精确、区分大小写的值工作。客户端把
`USR-*`、`TEAM-*` 或 `MBR-*` 改成小写时必须得到对应 404，不能被 schema 默认的
`utf8mb4_0900_ai_ci` 当成同一个资源。

`team_members` 不是匿名连接表：成员有自己的 `MBR-*`、角色和 GET/DELETE URL，所以仍有独立主键和公开 ID。
`display_name` 只放在 users；成员响应通过 JOIN 投影当前用户名称，避免两个事实来源。

`email` 保存客户端原文并继续进入响应。Java `String` 由 UTF-16 code unit 组成；Service 把每个 code unit 按
大端顺序固定写成 2 字节，所以 120 个 code unit 对应 `VARBINARY(240)`，包括孤立代理项在内都不会经过字符集
编码器而被替换。`email_key` 是内部比较键：Service 按当前运行线前置课 `equalsIgnoreCase` 的规则折叠大小写，
现代线把每个折叠后 code point 固定写成 4 字节，Java 8 线把每个折叠后 `char` 固定写成 2 字节。
`VARBINARY` 只按字节比较，不受 schema 默认 collation 影响。因此
`Case@example.com` 与 `case@example.com` 冲突，而 `resume@example.com` 与 `résumé@example.com` 仍是两个
不同邮箱。现代线最坏需要 120 乘 4 字节，所以 `email_key` 使用 `VARBINARY(480)`；这个内部键不会进入响应
DTO。

### 2. Row 可以看到内部 ID，DTO 不可以

新建 `src/main/java/com/teamflow/api/persistence/Rows.java`。这些 Row 只在 Mapper 和 Service 之间流动；它们使用普通
可写类，让 MyBatis 能映射 SELECT，也能把 generated key 写回 `id`：

```java
package com.teamflow.api.persistence;

/** 集中定义持久化边界内使用的 Row。 */
public final class Rows {
    /** 禁止创建工具容器。 */
    private Rows() {
    }

    /** 表示用户表的一行。 */
    public static final class UserRow {
        private Long id;
        private String publicId;
        private String displayName;
        private byte[] email;
        private byte[] emailKey;

        /** 创建空 Row 供 MyBatis 映射。 */
        public UserRow() {
        }

        /** 创建待写入用户。 */
        public UserRow(String publicId, String displayName, byte[] email, byte[] emailKey) {
            this.publicId = publicId;
            this.displayName = displayName;
            this.email = email;
            this.emailKey = emailKey;
        }

        /** @return 数据库内部主键 */
        public Long getId() {
            return id;
        }

        /** 接收数据库内部主键。 */
        public void setId(Long id) {
            this.id = id;
        }

        /** @return 公开用户标识 */
        public String getPublicId() {
            return publicId;
        }

        /** 设置公开用户标识。 */
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

        /** @return 用户邮箱 */
        public byte[] getEmail() {
            return email;
        }

        /** 设置用户邮箱。 */
        public void setEmail(byte[] email) {
            this.email = email;
        }

        /** @return 内部邮箱比较键 */
        public byte[] getEmailKey() {
            return emailKey;
        }

        /** 设置内部邮箱比较键。 */
        public void setEmailKey(byte[] emailKey) {
            this.emailKey = emailKey;
        }
    }

    /** 表示团队表的一行。 */
    public static final class TeamRow {
        private Long id;
        private String publicId;
        private String name;

        /** 创建空 Row 供 MyBatis 映射。 */
        public TeamRow() {
        }

        /** 创建待写入团队。 */
        public TeamRow(String publicId, String name) {
            this.publicId = publicId;
            this.name = name;
        }

        /** @return 数据库内部主键 */
        public Long getId() {
            return id;
        }

        /** 接收数据库内部主键。 */
        public void setId(Long id) {
            this.id = id;
        }

        /** @return 公开团队标识 */
        public String getPublicId() {
            return publicId;
        }

        /** 设置公开团队标识。 */
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

    /** 表示待写入的成员关系。 */
    public static final class MemberWriteRow {
        private Long id;
        private String publicId;
        private Long teamId;
        private Long userId;
        private String role;

        /** 创建空 Row 供 MyBatis 映射。 */
        public MemberWriteRow() {
        }

        /** 创建待写入成员关系。 */
        public MemberWriteRow(String publicId, Long teamId, Long userId, String role) {
            this.publicId = publicId;
            this.teamId = teamId;
            this.userId = userId;
            this.role = role;
        }

        /** @return 数据库内部主键 */
        public Long getId() {
            return id;
        }

        /** 接收数据库内部主键。 */
        public void setId(Long id) {
            this.id = id;
        }

        /** @return 公开成员标识 */
        public String getPublicId() {
            return publicId;
        }

        /** 设置公开成员标识。 */
        public void setPublicId(String publicId) {
            this.publicId = publicId;
        }

        /** @return 团队内部主键 */
        public Long getTeamId() {
            return teamId;
        }

        /** 设置团队内部主键。 */
        public void setTeamId(Long teamId) {
            this.teamId = teamId;
        }

        /** @return 用户内部主键 */
        public Long getUserId() {
            return userId;
        }

        /** 设置用户内部主键。 */
        public void setUserId(Long userId) {
            this.userId = userId;
        }

        /** @return 成员角色 */
        public String getRole() {
            return role;
        }

        /** 设置成员角色。 */
        public void setRole(String role) {
            this.role = role;
        }
    }

    /** 表示成员与用户 JOIN 后的公开投影。 */
    public static final class MemberView {
        private String memberPublicId;
        private String userPublicId;
        private String displayName;
        private String role;

        /** 创建空投影供 MyBatis 映射。 */
        public MemberView() {
        }

        /** @return 公开成员标识 */
        public String getMemberPublicId() {
            return memberPublicId;
        }

        /** 设置公开成员标识。 */
        public void setMemberPublicId(String memberPublicId) {
            this.memberPublicId = memberPublicId;
        }

        /** @return 公开用户标识 */
        public String getUserPublicId() {
            return userPublicId;
        }

        /** 设置公开用户标识。 */
        public void setUserPublicId(String userPublicId) {
            this.userPublicId = userPublicId;
        }

        /** @return 用户显示名 */
        public String getDisplayName() {
            return displayName;
        }

        /** 设置用户显示名。 */
        public void setDisplayName(String displayName) {
            this.displayName = displayName;
        }

        /** @return 成员角色 */
        public String getRole() {
            return role;
        }

        /** 设置成员角色。 */
        public void setRole(String role) {
            this.role = role;
        }
    }
}
```

generated key 的技术合同是目标属性可写，不是“必须存在 JavaBean setter”这一种实现。普通类即使没有 setter，
MyBatis 也可能通过字段写入器写值；这里显式提供 setter，是为了让初学者一眼看出 `id` 的写回位置。record 没有
可写组件，因此不能直接承担这个写入合同。

### 3. Mapper 方法只暴露当前用例需要的操作

新建三个接口：

```java
package com.teamflow.api.persistence;

import java.util.List;
import org.apache.ibatis.annotations.Param;

/** 提供用户持久化操作。 */
public interface UserMapper {
    /** @return 按内部主键排序的全部用户 */
    List<Rows.UserRow> findAllOrdered();

    /** @return 公开标识对应的用户，不存在时为 null */
    Rows.UserRow findByPublicId(@Param("publicId") String publicId);

    /** @return 邮箱比较键对应的用户，不存在时为 null */
    Rows.UserRow findByEmailKey(@Param("emailKey") byte[] emailKey);

    /** @return 写入行数 */
    int insert(Rows.UserRow row);
}
```

```java
package com.teamflow.api.persistence;

import java.util.List;
import org.apache.ibatis.annotations.Param;

/** 提供团队持久化操作。 */
public interface TeamMapper {
    /** @return 按内部主键排序的全部团队 */
    List<Rows.TeamRow> findAllOrdered();

    /** @return 公开标识对应的团队，不存在时为 null */
    Rows.TeamRow findByPublicId(@Param("publicId") String publicId);

    /** @return 写入行数 */
    int insert(Rows.TeamRow row);
}
```

```java
package com.teamflow.api.persistence;

import com.teamflow.api.persistence.Rows.MemberView;
import com.teamflow.api.persistence.Rows.MemberWriteRow;
import java.util.List;
import org.apache.ibatis.annotations.Param;

/** 提供团队成员关系持久化操作。 */
public interface TeamMemberMapper {
    /** @return 团队内按成员内部主键排序的公开投影 */
    List<MemberView> findAllByTeamId(@Param("teamId") long teamId);

    /** @return 团队范围内的成员投影，不存在时为 null */
    MemberView findByTeamIdAndPublicId(
            @Param("teamId") long teamId,
            @Param("memberPublicId") String memberPublicId);

    /** @return 已有关系的内部主键，不存在时为 null */
    Long findIdByTeamIdAndUserId(
            @Param("teamId") long teamId,
            @Param("userId") long userId);

    /** @return 写入行数 */
    int insert(MemberWriteRow row);

    /** @return 删除行数 */
    int deleteByTeamIdAndPublicId(
            @Param("teamId") long teamId,
            @Param("memberPublicId") String memberPublicId);
}
```

三个接口放在各自同名 `.java` 文件中。这里没有增加通用 Repository、BaseMapper 或泛型基类：每个方法都直接
对应本课的一个用例或约束确认，继续往上套一层只会增加跳转。

### 4. XML 用别名映射平面 Row，用 JOIN 映射成员

新建 `src/main/resources/mappers/UserMapper.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
  "https://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.teamflow.api.persistence.UserMapper">
  <select id="findAllOrdered" resultType="com.teamflow.api.persistence.Rows$UserRow">
    SELECT id, public_id AS publicId, display_name AS displayName, email
    FROM users
    ORDER BY id
  </select>
  <select id="findByPublicId" resultType="com.teamflow.api.persistence.Rows$UserRow">
    SELECT id, public_id AS publicId, display_name AS displayName, email
    FROM users
    WHERE public_id = #{publicId}
  </select>
  <select id="findByEmailKey" resultType="com.teamflow.api.persistence.Rows$UserRow">
    SELECT id, public_id AS publicId, display_name AS displayName, email
    FROM users
    WHERE email_key = #{emailKey}
  </select>
  <insert id="insert" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
    INSERT INTO users(public_id, display_name, email, email_key)
    VALUES (#{publicId}, #{displayName}, #{email}, #{emailKey})
  </insert>
</mapper>
```

新建 `src/main/resources/mappers/TeamMapper.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
  "https://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.teamflow.api.persistence.TeamMapper">
  <select id="findAllOrdered" resultType="com.teamflow.api.persistence.Rows$TeamRow">
    SELECT id, public_id AS publicId, name
    FROM teams
    ORDER BY id
  </select>
  <select id="findByPublicId" resultType="com.teamflow.api.persistence.Rows$TeamRow">
    SELECT id, public_id AS publicId, name
    FROM teams
    WHERE public_id = #{publicId}
  </select>
  <insert id="insert" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
    INSERT INTO teams(public_id, name)
    VALUES (#{publicId}, #{name})
  </insert>
</mapper>
```

新建 `src/main/resources/mappers/TeamMemberMapper.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
  "https://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.teamflow.api.persistence.TeamMemberMapper">
  <sql id="memberProjection">
    SELECT tm.public_id AS memberPublicId,
           u.public_id AS userPublicId,
           u.display_name AS displayName,
           tm.role
    FROM team_members AS tm
    JOIN users AS u ON u.id = tm.user_id
  </sql>
  <select id="findAllByTeamId" resultType="com.teamflow.api.persistence.Rows$MemberView">
    <include refid="memberProjection"/>
    WHERE tm.team_id = #{teamId}
    ORDER BY tm.id
  </select>
  <select id="findByTeamIdAndPublicId"
          resultType="com.teamflow.api.persistence.Rows$MemberView">
    <include refid="memberProjection"/>
    WHERE tm.team_id = #{teamId}
      AND tm.public_id = #{memberPublicId}
  </select>
  <select id="findIdByTeamIdAndUserId" resultType="long">
    SELECT id
    FROM team_members
    WHERE team_id = #{teamId} AND user_id = #{userId}
  </select>
  <insert id="insert" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
    INSERT INTO team_members(public_id, team_id, user_id, role)
    VALUES (#{publicId}, #{teamId}, #{userId}, #{role})
  </insert>
  <delete id="deleteByTeamIdAndPublicId">
    DELETE FROM team_members
    WHERE team_id = #{teamId} AND public_id = #{memberPublicId}
  </delete>
</mapper>
```

成员列表执行一次 Team 存在性查询，再执行一次 JOIN；它不会为每个成员单独查询 User。详情 SQL 同时限定
`team_id` 和 `memberPublicId`，所以某个真实成员也不能从错误团队 URL 访问。

## 三、让 Service 保持原有业务语义

### 1. 只替换内存状态的实现

从上一课的 `teamflow-user-team-api-modern` 复制出新工程 `teamflow-user-team-persistence-modern`。以下文件保持
原样：

- 三个 Controller 及其 URI、参数、状态码和 Location 生成方式。
- 三个请求 DTO、三个响应 DTO、`PageResponse` 与 `FieldProblem`。
- `ApiException` 和 `GlobalExceptionHandler`。

打开 `TeamFlowApplication.java`，删除原来持有三个 Map 和三个计数器的嵌套 `ApiService`。保留 `User`、`Team`
和 `TeamMember` 这三个内部模型，它们现在只是 Service 到 Controller 的数据对象，不再拥有状态。把应用注解改为：

```java
import com.teamflow.api.persistence.UserMapper;
import org.mybatis.spring.annotation.MapperScan;

@SpringBootApplication
@MapperScan(basePackageClasses = UserMapper.class)
@Import({
        ApiService.class,
        TeamFlowApplication.UserController.class,
        TeamFlowApplication.TeamController.class,
        TeamFlowApplication.MemberController.class,
        TeamFlowApplication.GlobalExceptionHandler.class
})
public class TeamFlowApplication {
    // 其余 Controller、DTO、ApiException 和 Advice 保持上一课原样。
}
```

`ApiService.class` 现在指向同包顶级类，而不是已经删除的 `TeamFlowApplication.ApiService`。这种改法让 Controller
中的字段类型和方法调用都不需要变化。

新建 `src/main/java/com/teamflow/api/ApiService.java`：

```java
package com.teamflow.api;

import com.teamflow.api.TeamFlowApplication.AddMemberRequest;
import com.teamflow.api.TeamFlowApplication.ApiException;
import com.teamflow.api.TeamFlowApplication.CreateTeamRequest;
import com.teamflow.api.TeamFlowApplication.CreateUserRequest;
import com.teamflow.api.TeamFlowApplication.MemberResponse;
import com.teamflow.api.TeamFlowApplication.PageResponse;
import com.teamflow.api.TeamFlowApplication.Team;
import com.teamflow.api.TeamFlowApplication.TeamResponse;
import com.teamflow.api.TeamFlowApplication.User;
import com.teamflow.api.TeamFlowApplication.UserResponse;
import com.teamflow.api.persistence.Rows.MemberView;
import com.teamflow.api.persistence.Rows.MemberWriteRow;
import com.teamflow.api.persistence.Rows.TeamRow;
import com.teamflow.api.persistence.Rows.UserRow;
import com.teamflow.api.persistence.TeamMapper;
import com.teamflow.api.persistence.TeamMemberMapper;
import com.teamflow.api.persistence.UserMapper;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;

/** 用 MyBatis 持久化用户、团队和成员关系。 */
public final class ApiService {
    private final UserMapper userMapper;
    private final TeamMapper teamMapper;
    private final TeamMemberMapper memberMapper;

    /** 创建持久化服务。 */
    public ApiService(
            UserMapper userMapper,
            TeamMapper teamMapper,
            TeamMemberMapper memberMapper) {
        this.userMapper = userMapper;
        this.teamMapper = teamMapper;
        this.memberMapper = memberMapper;
    }

    /** 查询用户。 */
    User findUser(String userId) {
        return toUser(requireUserRow(userId));
    }

    /** 查询一页用户。 */
    PageResponse<UserResponse> listUsers(int pageSize, String pageToken) {
        List<UserRow> rows = userMapper.findAllOrdered();
        int start = pageOffset(pageToken, "USR-PAGE-", rows.size());
        int end = Math.min(start + pageSize, rows.size());
        List<UserResponse> items = new ArrayList<>();
        for (UserRow row : rows.subList(start, end)) {
            items.add(UserResponse.from(toUser(row)));
        }
        return new PageResponse<>(
                items,
                nextPageToken("USR-PAGE-", start, pageSize, rows.size()));
    }

    /** 创建用户。 */
    User createUser(CreateUserRequest request) {
        byte[] emailKey = emailKey(request.email());
        if (userMapper.findByEmailKey(emailKey) != null) {
            throw userConflict();
        }
        UserRow row = new UserRow(
                nextPublicId("USR-"),
                request.displayName(),
                encodeEmail(request.email()),
                emailKey);
        try {
            requireInserted(userMapper.insert(row), row.getId());
        } catch (DuplicateKeyException exception) {
            if (userMapper.findByEmailKey(emailKey) != null) {
                throw userConflict();
            }
            throw exception;
        }
        return toUser(row);
    }

    /** 查询团队。 */
    Team findTeam(String teamId) {
        return toTeam(requireTeamRow(teamId));
    }

    /** 查询一页团队。 */
    PageResponse<TeamResponse> listTeams(int pageSize, String pageToken) {
        List<TeamRow> rows = teamMapper.findAllOrdered();
        int start = pageOffset(pageToken, "TEAM-PAGE-", rows.size());
        int end = Math.min(start + pageSize, rows.size());
        List<TeamResponse> items = new ArrayList<>();
        for (TeamRow row : rows.subList(start, end)) {
            items.add(TeamResponse.from(toTeam(row)));
        }
        return new PageResponse<>(
                items,
                nextPageToken("TEAM-PAGE-", start, pageSize, rows.size()));
    }

    /** 创建团队。 */
    Team createTeam(CreateTeamRequest request) {
        TeamRow row = new TeamRow(nextPublicId("TEAM-"), request.name());
        requireInserted(teamMapper.insert(row), row.getId());
        return toTeam(row);
    }

    /** 查询一页团队成员。 */
    PageResponse<MemberResponse> listMembers(
            String teamId,
            int pageSize,
            String pageToken) {
        TeamRow team = requireTeamRow(teamId);
        List<MemberView> rows = memberMapper.findAllByTeamId(team.getId());
        int start = pageOffset(pageToken, "MEMBER-PAGE-", rows.size());
        int end = Math.min(start + pageSize, rows.size());
        List<MemberResponse> items = new ArrayList<>();
        for (MemberView row : rows.subList(start, end)) {
            items.add(toMemberResponse(row));
        }
        return new PageResponse<>(
                items,
                nextPageToken("MEMBER-PAGE-", start, pageSize, rows.size()));
    }

    /** 查询团队范围内的成员关系。 */
    MemberResponse findMember(String teamId, String memberId) {
        TeamRow team = requireTeamRow(teamId);
        MemberView member = memberMapper.findByTeamIdAndPublicId(team.getId(), memberId);
        if (member == null) {
            throw memberNotFound(memberId);
        }
        return toMemberResponse(member);
    }

    /** 把已存在用户加入团队。 */
    MemberResponse addMember(String teamId, AddMemberRequest request) {
        TeamRow team = requireTeamRow(teamId);
        UserRow user = requireUserRow(request.userId());
        if (memberMapper.findIdByTeamIdAndUserId(team.getId(), user.getId()) != null) {
            throw memberConflict();
        }
        MemberWriteRow row = new MemberWriteRow(
                nextPublicId("MBR-"),
                team.getId(),
                user.getId(),
                request.role());
        try {
            requireInserted(memberMapper.insert(row), row.getId());
        } catch (DuplicateKeyException exception) {
            if (memberMapper.findIdByTeamIdAndUserId(team.getId(), user.getId()) != null) {
                throw memberConflict();
            }
            throw exception;
        }
        return new MemberResponse(
                row.getPublicId(),
                user.getPublicId(),
                user.getDisplayName(),
                row.getRole());
    }

    /** 从团队移除成员关系，不删除用户。 */
    void removeMember(String teamId, String memberId) {
        TeamRow team = requireTeamRow(teamId);
        int rows = memberMapper.deleteByTeamIdAndPublicId(team.getId(), memberId);
        if (rows == 0) {
            throw memberNotFound(memberId);
        }
        if (rows != 1) {
            throw new IllegalStateException("成员删除行数不是 1");
        }
    }

    /** 查询必须存在的用户 Row。 */
    private UserRow requireUserRow(String userId) {
        UserRow row = userMapper.findByPublicId(userId);
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
        TeamRow row = teamMapper.findByPublicId(teamId);
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

    /** 把用户 Row 转成原有内部模型。 */
    private User toUser(UserRow row) {
        return new User(
                row.getPublicId(),
                row.getDisplayName(),
                decodeEmail(row.getEmail()),
                "数据库内部主键不对外");
    }

    /** 把团队 Row 转成原有内部模型。 */
    private Team toTeam(TeamRow row) {
        return new Team(row.getPublicId(), row.getName(), "数据库内部主键不对外");
    }

    /** 把 JOIN 投影转成原有成员响应。 */
    private MemberResponse toMemberResponse(MemberView row) {
        return new MemberResponse(
                row.getMemberPublicId(),
                row.getUserPublicId(),
                row.getDisplayName(),
                row.getRole());
    }

    /** 生成符合既有正整数格式的公开标识。 */
    private String nextPublicId(String prefix) {
        long value = ThreadLocalRandom.current().nextLong(1, Long.MAX_VALUE);
        return prefix + value;
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

    /** 把 JDK 25 equalsIgnoreCase 的 code point 规则编码成内部比较键。 */
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

    /** 核对单行 INSERT 和 generated key。 */
    private void requireInserted(int rows, Long id) {
        if (rows != 1 || id == null || id <= 0) {
            throw new IllegalStateException("INSERT 未返回单行和有效 generated key");
        }
    }

    /** 解释当前集合签发的不透明分页 token。 */
    private int pageOffset(String pageToken, String tokenPrefix, int itemCount) {
        if (pageToken == null) {
            return 0;
        }
        if (!pageToken.startsWith(tokenPrefix)) {
            throw invalidPageToken();
        }
        try {
            String positionText = pageToken.substring(tokenPrefix.length());
            int position = Integer.parseInt(positionText);
            if (!positionText.equals(Integer.toString(position))) {
                throw invalidPageToken();
            }
            int offset = position - 1;
            if (offset <= 0 || offset >= itemCount) {
                throw invalidPageToken();
            }
            return offset;
        } catch (NumberFormatException exception) {
            throw invalidPageToken();
        }
    }

    /** 为仍有后续资源的页面签发 token。 */
    private String nextPageToken(
            String tokenPrefix,
            int start,
            int pageSize,
            int itemCount) {
        int nextOffset = start + pageSize;
        return nextOffset < itemCount ? tokenPrefix + (nextOffset + 1) : null;
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

    /** 创建重复成员关系冲突。 */
    private ApiException memberConflict() {
        return new ApiException(
                HttpStatus.CONFLICT,
                "member-conflict",
                "成员状态冲突",
                "该用户已经加入当前团队",
                "MEMBER_CONFLICT");
    }

    /** 创建成员不存在异常。 */
    private ApiException memberNotFound(String memberId) {
        return new ApiException(
                HttpStatus.NOT_FOUND,
                "member-not-found",
                "成员不存在",
                "没有找到编号为 " + memberId + " 的团队成员",
                "MEMBER_NOT_FOUND");
    }

    /** 创建分页游标无效异常。 */
    private ApiException invalidPageToken() {
        return new ApiException(
                HttpStatus.BAD_REQUEST,
                "invalid-page-token",
                "分页游标无效",
                "分页游标不属于当前资源集合",
                "INVALID_PAGE_TOKEN");
    }
}
```

### 2. 预查负责业务流程，约束负责竞争窗口

创建用户先按 emailKey 查询，是为了在常见路径上直接解释 `USER_CONFLICT`；但两个并发请求仍可能同时看到
“不存在”。最终只有 `UNIQUE(email_key)` 能保证第二个 INSERT 失败。捕获 `DuplicateKeyException` 后再次查询
同一个比较键，确认它此刻确实存在，才转换成原有 409。原始 email 只负责展示，不能让数据库默认 collation
代替前置课的 `equalsIgnoreCase` 规则。

成员创建使用同一模式：先确认 Team 和 User，再按内部 `team_id + user_id` 预查，最后由组合 UNIQUE 封住竞争
窗口。重新查询没有发现这条关系时，异常可能来自 public ID 碰撞或其他唯一约束，必须原样抛出，让既有未知
异常边界返回去敏 500，不能伪装成 `MEMBER_CONFLICT`。

团队名称从未有唯一合同，所以 Team 的 `DuplicateKeyException` 也不能翻译成“名称重复”。本课不解析
`Duplicate entry` 等厂商消息；业务语义由重新查询当前事实确定。

### 3. 删除只根据限定范围的行数决定结果

成员删除 SQL 同时限制内部 team ID 和公开 member ID：

```text
先确认 Team 存在
-> DELETE team_members WHERE team_id = ? AND public_id = ?
-> rows == 0：MEMBER_NOT_FOUND
-> rows == 1：204 No Content
```

它不删除 users，也不依赖级联。Controller 仍执行 `ResponseEntity.noContent().build()`，所以成功响应没有 JSON、
空字符串或 `null`，网络 body 的真实字节数为 0。

## 四、让数据库守住最终约束

### 1. UNIQUE 和 FOREIGN KEY 保护不同不变量

| 数据库约束 | 防止的状态 | Service 对外语义 |
| --- | --- | --- |
| `users.email_key UNIQUE` | 两个用户的 equalsIgnoreCase 比较键相同 | 确认后为 `USER_CONFLICT` |
| `team_members(team_id,user_id) UNIQUE` | 同一用户重复加入同一团队 | 确认后为 `MEMBER_CONFLICT` |
| member 到 team 的 FOREIGN KEY | 关系指向不存在团队 | 当前公开用例不翻译，保留未知失败 |
| member 到 user 的 FOREIGN KEY | 关系指向不存在用户 | 当前公开用例不翻译，保留未知失败 |
| 两条 `ON DELETE RESTRICT` | 误删仍被成员引用的父行 | 当前没有父资源删除端点 |

MySQL 8.4 对重复键报告 1062，对“父行仍被引用”报告 1451，对“子行引用不存在父行”报告 1452；三者的
SQLSTATE 都可能是 `23000`。因此只看 SQLSTATE 或把所有 `DataIntegrityViolationException` 变成一个 409，会
把完全不同的 schema 或外键故障藏起来。

### 2. 不用忽略和更新语义偷换冲突

`INSERT IGNORE` 会把某些错误降为 warning，Service 可能拿到 0 行或调整后的数据却仍返回成功；
`ON DUPLICATE KEY UPDATE` 会把“重复加入应返回 409”改成更新已有行。这两个 SQL 都改变既有 API 合同，本课只用
普通 INSERT，让约束失败沿异常翻译链到达 Service。

### 3. 一次 JOIN 比逐成员查询更可观察

**社区补充：** Stack Overflow 的真实 MyBatis 一对多案例展示了 nested select 为父记录继续发起子查询的写法。
这种写法在列表中容易形成 `1 + N`。本课已按 MyBatis 3.5.19 官方映射合同复核，成员读取采用一次扁平 JOIN；
适用于当前只需要 `MemberResponse` 投影的场景，不把复杂对象图提前引入 API。

开启 MyBatis stdout 日志后，一次成员列表应只出现：

```text
SELECT ... FROM teams WHERE public_id = ?
SELECT ... FROM team_members tm JOIN users u ... WHERE tm.team_id = ? ORDER BY tm.id
```

成员数从 2 增加到 20 时，SQL 条数仍是 2，而不是 22。

## 五、暂时保留服务层分页

### 1. 先保持 token 合同，再学习数据库分页

上一课已经公开 `pageSize`、`pageToken` 和 `nextPageToken`。本课 Mapper 用内部 id 稳定排序并读取课程规模的完整
集合，Service 再复用原 token 与切片算法。这样 API 不变，也不会在本课提前塞进尚未解释的分页 SQL。

这是明确的教学桥接，不是生产级大表方案。它会让应用读取多于当前页的数据，写入并发时也不提供快照一致性。
“分页与筛选”课程会把筛选、页大小和位置推进数据库；在那之前不添加分页插件、总数查询、`LIMIT` 或
`OFFSET`。

### 2. 每个公开写用例只有一条业务 DML

MyBatis-Spring 官方文档说明，Spring 事务之外的 Mapper 数据操作会自动提交。本课四个公开写用例分别只有：

```text
创建用户：1 条 INSERT
创建团队：1 条 INSERT
创建成员：1 条 INSERT
删除成员：1 条 DELETE
```

存在性和冲突预查是 SELECT，不改变“一条业务 DML”的边界。本课不添加 `@Transactional`，也不通过“先插入再
更新 public ID”制造必须依赖事务的两步写入；多写入原子性留给“事务”课程。

## 六、完成现代线工程

### 1. 核对文件清单和依赖

完成后的现代工程结构如下：

```text
teamflow-user-team-persistence-modern/
├── pom.xml
└── src/main/
    ├── java/com/teamflow/api/
    │   ├── TeamFlowApplication.java       # 打开修改：删除内存 Service，增加 MapperScan
    │   ├── ApiService.java                # 新建：本课完整持久化 Service
    │   └── persistence/
    │       ├── Rows.java                  # 新建
    │       ├── UserMapper.java            # 新建
    │       ├── TeamMapper.java            # 新建
    │       └── TeamMemberMapper.java      # 新建
    └── resources/
        ├── application.properties         # 打开修改
        ├── db/migration/V1__create_user_team_tables.sql
        └── mappers/
            ├── UserMapper.xml
            ├── TeamMapper.xml
            └── TeamMemberMapper.xml
```

`TeamFlowApplication.java` 中未列出的 Controller、DTO、内部模型和 Advice 都来自上一课，不重复创建同名类型。
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
  <artifactId>teamflow-user-team-persistence-modern</artifactId>
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

MyBatis Starter `4.1.0` 与前面三课的 live 基线一致，实际解析 MyBatis-Spring `4.1.0` 和 MyBatis
`3.5.19`。Boot 4.1 的 Flyway 自动配置位于 `spring-boot-starter-flyway`，MySQL 方言仍由
`flyway-mysql` 提供；只放两个 Flyway 运行库不会自动执行迁移。本课没有 `mybatis-plus` 依赖。

`application.properties`：

```properties
server.port=${TEAMFLOW_PORT:18087}
spring.datasource.url=${TEAMFLOW_DB_URL}
spring.datasource.username=${TEAMFLOW_DB_USER}
spring.datasource.password=${TEAMFLOW_DB_PASSWORD}
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
mybatis.mapper-locations=classpath:/mappers/*.xml
mybatis.configuration.log-impl=org.apache.ibatis.logging.stdout.StdOutImpl
```

连接信息只来自环境变量，示例不把真实密码写入仓库。Flyway 在空 schema 上执行 V1；应用重启时它读取
`flyway_schema_history`，不会重新创建或清空三张业务表。

### 2. 在真实 MySQL 8.4 中启动

先准备独立数据库。下面的密码只用于本机临时容器：

```bash
docker run --name teamflow-db \
  -e MYSQL_ROOT_PASSWORD=teamflow-root \
  -e MYSQL_DATABASE=teamflow_modern \
  -e MYSQL_USER=teamflow \
  -e MYSQL_PASSWORD=teamflow-pass \
  -p 33317:3306 \
  -d mysql:8.4
```

等待 `mysqladmin ping` 成功后，从工程目录核对依赖并启动：

```bash
mvn dependency:tree \
  -Dincludes=org.mybatis:mybatis,org.mybatis:mybatis-spring,org.mybatis.spring.boot:mybatis-spring-boot-starter

TEAMFLOW_DB_URL='jdbc:mysql://127.0.0.1:33317/teamflow_modern?useSSL=false&allowPublicKeyRetrieval=true' \
TEAMFLOW_DB_USER=teamflow \
TEAMFLOW_DB_PASSWORD=teamflow-pass \
TEAMFLOW_PORT=18087 \
mvn spring-boot:run
```

启动日志应显示 Flyway 成功迁移到版本 1，三个 Mapper XML 均已加载。只有进程仍在运行不算完成，继续走 HTTP
反馈。

### 3. 走通创建、范围与删除合同

先创建两个用户和两个团队，保存返回的公开 ID：

```bash
curl -i -X POST http://127.0.0.1:18087/api/v1/users \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"周宁","email":"zhou@example.com"}'

curl -i -X POST http://127.0.0.1:18087/api/v1/users \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"林澄","email":"lin@example.com"}'

curl -i -X POST http://127.0.0.1:18087/api/v1/teams \
  -H 'Content-Type: application/json' \
  -d '{"name":"课程平台组"}'

curl -i -X POST http://127.0.0.1:18087/api/v1/teams \
  -H 'Content-Type: application/json' \
  -d '{"name":"空团队"}'
```

四个请求都应得到 201；用户和团队 Location 的末段分别等于响应中的 `USR-*` 与 `TEAM-*`。假设第一位用户是
`USR-<user>`、第一支团队是 `TEAM-<team>`，把用户加入团队：

先单独回归邮箱比较合同：

```bash
curl -i -X POST http://127.0.0.1:18087/api/v1/users \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"大小写重复","email":"ZHOU@example.com"}'

curl -i -X POST http://127.0.0.1:18087/api/v1/users \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"无重音","email":"resume@example.com"}'

curl -i -X POST http://127.0.0.1:18087/api/v1/users \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"有重音","email":"résumé@example.com"}'
```

第一条应得到 409 `USER_CONFLICT`；后两条都应得到 201。这个对照同时证明大小写规则仍与前置课一致，数据库
默认 collation 也没有把重音差异扩张成新冲突。

前置 DTO 当前还允许 JSON 中的孤立代理项。下面两个邮箱的首字符不同，`equalsIgnoreCase` 也为 false，因此两次
创建都必须得到 201，随后 GET 仍分别返回 `\uD800` 与 `\uD801`，不能把任一原文或内部键替换成 `?`：

```bash
curl -i -X POST http://127.0.0.1:18087/api/v1/users \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"代理项一","email":"\uD800@example.com"}'

curl -i -X POST http://127.0.0.1:18087/api/v1/users \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"代理项二","email":"\uD801@example.com"}'
```

```bash
curl -i -X POST 'http://127.0.0.1:18087/api/v1/teams/TEAM-<team>/members' \
  -H 'Content-Type: application/json' \
  -d '{"userId":"USR-<user>","role":"Designer"}'
```

响应应为 201，成员 ID 匹配 `MBR-[1-9][0-9]*`，`displayName` 来自 users。随后检查：

```bash
curl -i 'http://127.0.0.1:18087/api/v1/teams/TEAM-<team>/members'
curl -i 'http://127.0.0.1:18087/api/v1/teams/TEAM-<empty>/members'
curl -i 'http://127.0.0.1:18087/api/v1/teams/TEAM-404/members'
```

第一条得到成员，第二条是 200 空页，第三条是 `TEAM_NOT_FOUND`。再用第二支真实团队的 URL 查询第一支团队的
成员，应得到 `MEMBER_NOT_FOUND`。删除时同时观察状态和 body 字节数：

```bash
curl --silent --show-error \
  --output /tmp/teamflow-delete-body \
  --write-out 'status=%{http_code} bytes=%{size_download}\n' \
  -X DELETE \
  'http://127.0.0.1:18087/api/v1/teams/TEAM-<team>/members/MBR-<member>'
```

预期为 `status=204 bytes=0`。再次删除得到 404；再查原 User 仍返回 200，证明删除的只是关系。

### 4. 用重启和数据库错误证明持久化

先创建一条成员关系并记下三个公开 ID，再停止应用并用同一环境变量重启。三个 GET 都应读回原值。随后停止并
重新启动 `teamflow-db`，等数据库健康后再次启动应用，结果仍然存在；这才证明状态不属于 JVM Map。

约束探针直接在临时数据库执行：

```sql
INSERT INTO users(public_id, display_name, email, email_key)
SELECT 'USR-9001', '重复邮箱', email, email_key
FROM users
WHERE public_id = 'USR-<user>';

INSERT INTO team_members(public_id, team_id, user_id, role)
SELECT 'MBR-9001', t.id, u.id, 'Duplicate'
FROM teams t JOIN users u
WHERE t.public_id = 'TEAM-<team>' AND u.public_id = 'USR-<user>';

INSERT INTO team_members(public_id, team_id, user_id, role)
VALUES ('MBR-9002', 9223372036854775807, 9223372036854775807, 'Broken');

DELETE FROM users WHERE public_id = 'USR-<user>';
```

在对应前置数据存在时，四条语句依次证明 1062、1062、1452 和 1451，SQLSTATE 均由 MySQL 原始反馈核对。第一条
复用已有邮箱二进制值和内部比较键，证明唯一性来自 emailKey。探针失败不会写入行；不要为了“清理错误”删除
API 已创建的父行。

## 七、完成 Java 8 兼容线

### 1. 使用独立工程和数据库

复制上一课的 `teamflow-user-team-api-java8` 为 `teamflow-user-team-persistence-java8`。Project SDK、模块 SDK、
Maven Runner JRE 与 POM 编译目标都使用真实 Java 8；不能只在 IDE 中切换一个下拉框。

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
  <artifactId>teamflow-user-team-persistence-java8</artifactId>
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

Java 8 线没有独立 `flyway-mysql` 模块；Boot 2.3 管理的 Flyway 6.x 仍把 MySQL 支持放在 core 中。Mapper XML、
`Rows.java` 和 V1 迁移全部原样复制，不能为了旧 Java 改数据库约束。

Flyway `6.4.4` 连接 MySQL 8.4 时会提示：当前数据库版本新于它已经测试的 MySQL 8.0。这个组合在本课 V1、
HTTP CRUD、UNIQUE、FOREIGN KEY 和重启回读反馈环中可以工作，但一次课程反馈不能扩展成 Flyway 对全部 MySQL
8.4 功能的官方兼容保证。维护旧项目时应把警告保留在升级清单，并对实际 migration 单独回归。

创建独立 schema：

```bash
docker exec teamflow-db mysql -uroot -pteamflow-root \
  -e "CREATE DATABASE teamflow_java8 CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
      GRANT ALL PRIVILEGES ON teamflow_java8.* TO 'teamflow'@'%';"
```

Java 8 的 `application.properties` 只把默认端口改为 18088，其余连接、Flyway 与 MyBatis 配置相同。

### 2. 只替换真实存在的语言和框架差异

上一课 Java 8 工程已经把 record DTO 换成具有构造器和 getter 的普通类，也已经在三个 Controller 上保留类型级
`@Validated`。本课不复制整份 Controller 或 Advice；只做与现代线相同的两项装配修改：删除内存嵌套 Service，
增加 `@MapperScan`，并把 `@Import` 的第一项改成顶级 `ApiService.class`。

现代 `ApiService.java` 的控制流、Mapper 调用和异常边界都能在 Java 8 编译。只把请求 record 访问器替换为上一课
普通 DTO 的 getter：

| 现代写法 | Java 8 写法 |
| --- | --- |
| `request.email()` | `request.getEmail()` |
| `request.displayName()` | `request.getDisplayName()` |
| `request.name()` | `request.getName()` |
| `request.userId()` | `request.getUserId()` |
| `request.role()` | `request.getRole()` |

邮箱比较键还有一个真实 API 合同差异：JDK 25 的 `String.equalsIgnoreCase` 文档按 Unicode code point 定义，Java 8
文档按 UTF-16 `char` 定义。为了让兼容线继续等同于它自己的上一课，Java 8 将 `emailKey` 方法替换为：

```java
/** 把 Java 8 equalsIgnoreCase 的 char 规则编码成内部比较键。 */
private byte[] emailKey(String email) {
    ByteBuffer key = ByteBuffer.allocate(email.length() * Character.BYTES);
    for (int index = 0; index < email.length(); index++) {
        char character = email.charAt(index);
        key.putChar(Character.toLowerCase(Character.toUpperCase(character)));
    }
    return key.array();
}
```

两条线共用 `encodeEmail` 和 `decodeEmail`，都按 UTF-16 code unit 保存、还原原文；差异只在应用如何把当前运行
时的 `equalsIgnoreCase` 规则编码成 `email_key`。ASCII 邮箱、大小写冲突和重音区分在两条线完全同形；补充字符
的大小写行为继续遵守各自 JDK 合同，不能用一种实现覆盖另一条线。

`ThreadLocalRandom.nextLong(origin, bound)`、diamond、`Math.min`、`ArrayList` 和 Spring DAO 异常在 Java 8 线路都
可用，不需要制造额外版本分支。`PageResponse` 自己已使用
`Collections.unmodifiableList(new ArrayList<T>(items))` 保存快照，Service 构造它的方式不变。

使用真实 Java 8 运行：

```bash
TEAMFLOW_DB_URL='jdbc:mysql://127.0.0.1:33317/teamflow_java8?useSSL=false&allowPublicKeyRetrieval=true' \
TEAMFLOW_DB_USER=teamflow \
TEAMFLOW_DB_PASSWORD=teamflow-pass \
TEAMFLOW_PORT=18088 \
mvn clean package

TEAMFLOW_DB_URL='jdbc:mysql://127.0.0.1:33317/teamflow_java8?useSSL=false&allowPublicKeyRetrieval=true' \
TEAMFLOW_DB_USER=teamflow \
TEAMFLOW_DB_PASSWORD=teamflow-pass \
TEAMFLOW_PORT=18088 \
java -jar target/teamflow-user-team-persistence-java8-1.0.0.jar
```

对 18088 重跑现代线的同一 HTTP、重启和约束序列。两条线路的外部 HTTP 合同，包括 JSON 结构、状态、
Location 和零字节 204，必须完全同形。内部实现差异除依赖坐标、校验包和 DTO 外，还包括 emailKey 的折叠
单位与编码宽度；这些差异不能改变各自前置课已经公开的合同。

## 八、集中排查持久化边界错误

:::pitfalls
### 把 Mapper 返回的 1 当成内部主键

**触发条件：** 用户插入成功后，把 `mapper.insert(row)` 的返回值赋给 `row.id`。

**原因：** 返回值是 JDBC update count；generated key 由 JDBC 的另一条合同取得并写入 `keyProperty`。

**后果：** 多个新对象都持有 1，后续外键可能指向错误用户。

**错误示例：**

```java
row.setId((long) userMapper.insert(row));
```

**正确写法：**

```java
int rows = userMapper.insert(row);
Long generatedId = row.getId();
```

**验证方式：** 先插入至少两行，再新增用户；正确版得到 rows 为 1、generatedId 大于已有主键，并能按该主键建立成员外键。

### 把 record 当成 generated key 的写入目标

**触发条件：** INSERT 参数只有 record 组件访问器，XML 仍配置 `keyProperty="id"`。

**原因：** generated key 需要目标属性可写；record 组件不能被重新赋值。

**后果：** INSERT 阶段无法把数据库主键写回参数对象，Service 失去后续外键依据。

**错误示例：**

```java
record UserRow(Long id, String publicId, String email) {
}
```

**正确写法：**

```java
public final class UserRow {
    private Long id;
    /** 接收数据库生成主键。 */
    public void setId(Long id) { this.id = id; }
    /** @return 数据库生成主键 */
    public Long getId() { return id; }
}
```

**验证方式：** 对同一 INSERT 先运行 record 版本确认不可写属性错误，再运行普通类版本确认 rows 为 1 且 id 为正数。

### 只做先查再插却没有 UNIQUE

**触发条件：** Service 先查 emailKey 不存在便 INSERT，表结构没有 emailKey 唯一约束。

**原因：** 两个并发请求可以在任一 INSERT 前都完成“不存在”查询。

**后果：** 数据库永久保存重复邮箱，后续查询无法给出单一用户。

**错误示例：**

```sql
CREATE TABLE users (
  email VARBINARY(240) NOT NULL,
  email_key VARBINARY(480) NOT NULL
);
```

**正确写法：**

```sql
CONSTRAINT uk_users_email_key UNIQUE (email_key)
```

**验证方式：** 两个连接用大小写不同但 emailKey 相同的邮箱插入；只有一个成功，另一个稳定得到 MySQL 1062，
表中计数保持 1；重音不同的两个 emailKey 则都能写入。

### 把所有完整性异常都变成 409

**触发条件：** 捕获 `DataIntegrityViolationException` 后无条件抛 `MEMBER_CONFLICT`。

**原因：** 该异常还覆盖外键、非空和其他完整性故障，不只表示重复成员。

**后果：** schema 漂移或越界写入被伪装成客户端冲突，排错证据丢失。

**错误示例：**

```java
catch (DataIntegrityViolationException exception) {
    throw memberConflict();
}
```

**正确写法：**

```java
catch (DuplicateKeyException exception) {
    if (memberMapper.findIdByTeamIdAndUserId(teamId, userId) != null) {
        throw memberConflict();
    }
    throw exception;
}
```

**验证方式：** 重复关系映射到 409；直接制造不存在父行的 FK 写入仍保留 1452 对应的未知失败，不返回 MEMBER_CONFLICT。

### 逐成员查询 User

**触发条件：** 成员列表先查 N 条关系，再为每条关系调用 `findUser`。

**原因：** nested select 或 Service 循环把一次投影拆成 1 加 N 次数据库往返。

**后果：** 成员越多，SQL 次数越多，查询次数随成员数量线性增长。

**错误示例：**

```sql
SELECT user_id
FROM team_members
WHERE team_id = ?
ORDER BY id;

-- 对上一步返回的每个 user_id 重复执行一次
SELECT public_id, display_name
FROM users
WHERE id = ?;
```

**正确写法：**

```sql
SELECT tm.public_id, u.public_id, u.display_name, tm.role
FROM team_members tm
JOIN users u ON u.id = tm.user_id
WHERE tm.team_id = ?
ORDER BY tm.id
```

**验证方式：** 打开 MyBatis SQL 日志，团队从 2 个成员增长到 20 个成员时，列表仍只有 Team 存在性查询和一次 JOIN。

### 只按 memberPublicId 查询嵌套资源

**触发条件：** `/teams/TEAM-B/members/MBR-A` 的 SQL 只检查 `MBR-A`。

**原因：** 成员 ID 全局存在不等于它属于 URL 中的父团队。

**后果：** 客户端可以通过错误团队路径读取或删除另一团队的成员。

**错误示例：**

```sql
WHERE tm.public_id = #{memberPublicId}
```

**正确写法：**

```sql
WHERE tm.team_id = #{teamId}
  AND tm.public_id = #{memberPublicId}
```

**验证方式：** 在 Team A 创建成员后，从 Team B 的详情和删除 URL 操作同一 member ID；两者都应为 MEMBER_NOT_FOUND，原关系仍存在。

### 把未知团队直接当成空集合

**触发条件：** 成员列表只执行 `findAllByTeamId`，0 行便返回空 Page。

**原因：** “团队不存在”和“团队存在但没有成员”都会得到 0 行。

**后果：** 原有 `TEAM_NOT_FOUND` 合同消失，客户端无法区分错误 ID 与真实空团队。

**错误示例：**

```java
return page(memberMapper.findAllByTeamId(teamId));
```

**正确写法：**

```java
TeamRow team = requireTeamRow(teamPublicId);
return page(memberMapper.findAllByTeamId(team.getId()));
```

**验证方式：** 已知空团队返回 200 和空 items；`TEAM-404` 返回 404 和 TEAM_NOT_FOUND。
:::

## 九、练习与验收

:::exercise
### 验证成员关系的父资源边界

**要求：** 在同一数据库创建 User、Team A 和 Team B，只把 User 加入 Team A。分别从 Team A 与 Team B 查询同一
member ID，再从 Team B 尝试删除。不得修改 Controller、不得增加 SQL 分页或事务；最后从 Team A 再次查询，证明
错误父路径没有改变关系。

**验收：** Team A 详情返回 200；Team B 详情和删除都返回 404 `MEMBER_NOT_FOUND`；最终 Team A 详情仍返回 200，
User 详情也仍返回 200。应用和 MySQL 各重启一次后，结果不变。

**参考答案：** 使用下面的完整脚本，把前三个创建响应解析成公开 ID，并逐项断言状态与错误码。
:::

```bash
#!/usr/bin/env bash
set -eu

base_url=${TEAMFLOW_BASE_URL:-http://127.0.0.1:18087}
work_dir=$(mktemp -d)
trap 'rm -r "$work_dir"' EXIT

if [ "$#" -ne 0 ] && [ "$#" -ne 4 ]; then
  printf '用法：%s [USER_ID TEAM_A_ID TEAM_B_ID MEMBER_ID]\n' "$0" >&2
  exit 2
fi

request() {
  method=$1
  url=$2
  body=${3-}
  if [ -n "$body" ]; then
    curl --silent --show-error --output "$work_dir/body.json" \
      --write-out '%{http_code}' -X "$method" "$url" \
      -H 'Content-Type: application/json' -d "$body"
  else
    curl --silent --show-error --output "$work_dir/body.json" \
      --write-out '%{http_code}' -X "$method" "$url"
  fi
}

if [ "$#" -eq 0 ]; then
  status=$(request POST "$base_url/api/v1/users" \
    '{"displayName":"边界用户","email":"boundary@example.com"}')
  test "$status" = 201
  user_id=$(jq -r '.id' "$work_dir/body.json")

  status=$(request POST "$base_url/api/v1/teams" '{"name":"Team A"}')
  test "$status" = 201
  team_a=$(jq -r '.id' "$work_dir/body.json")

  status=$(request POST "$base_url/api/v1/teams" '{"name":"Team B"}')
  test "$status" = 201
  team_b=$(jq -r '.id' "$work_dir/body.json")

  status=$(request POST "$base_url/api/v1/teams/$team_a/members" \
    "{\"userId\":\"$user_id\",\"role\":\"Reviewer\"}")
  test "$status" = 201
  member_id=$(jq -r '.id' "$work_dir/body.json")
else
  user_id=$1
  team_a=$2
  team_b=$3
  member_id=$4
fi

test "$(request GET "$base_url/api/v1/teams/$team_a/members/$member_id")" = 200
test "$(request GET "$base_url/api/v1/teams/$team_b/members/$member_id")" = 404
test "$(jq -r '.code' "$work_dir/body.json")" = MEMBER_NOT_FOUND
test "$(request DELETE "$base_url/api/v1/teams/$team_b/members/$member_id")" = 404
test "$(jq -r '.code' "$work_dir/body.json")" = MEMBER_NOT_FOUND
test "$(request GET "$base_url/api/v1/teams/$team_a/members/$member_id")" = 200
test "$(request GET "$base_url/api/v1/users/$user_id")" = 200

printf '%s\n' 'TEAMFLOW_PERSISTENCE_PASS'
if [ "$#" -eq 0 ]; then
  printf '重启后执行：'
  printf ' %q' "$0" "$user_id" "$team_a" "$team_b" "$member_id"
  printf '\n'
fi
```

无参数的 setup 模式和带四个 ID 的 verify 模式都会输出：

```text
TEAMFLOW_PERSISTENCE_PASS
```

setup 模式还会打印一条完整的“重启后执行”命令。把应用重启后执行一次该命令，再把 MySQL 重启并等待应用恢复
连接后执行一次；两轮仍输出同一成功标记，才算持久化验收完成。verify 模式不会再次创建资源，因此不会因重复
邮箱提前失败。脚本的 `trap` 只清理自己的临时响应文件，不删除数据库数据。

## 十、本课小结

接入数据库最容易出现的回归，不是 SQL 写不出来，而是原有 HTTP 合同被“顺便”改掉。本课让 Controller、DTO、
Location、Problem Details 和错误码保持不变，只把状态所有权从 Map 移到 MyBatis Mapper 与 MySQL。

公开 ID 与内部主键分离后，API 不依赖数据库顺序；三个 Mapper 直接表达三类资源职责；成员 JOIN 让投影保持一个
事实来源并避免 N+1。Service 预查提供清晰流程，UNIQUE 与 FOREIGN KEY 守住竞争和越界写入，异常只在重新查询
确认业务事实后才映射成既有 409。

为了遵守学习顺序，本课仍在 Service 中切片小型完整集合，每个写用例也只有一条业务 DML。下一课会单独学习
MyBatis-Plus；数据库分页和事务分别在后续课程处理，不能用本课的教学桥接冒充最终生产方案。
