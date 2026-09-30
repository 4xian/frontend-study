---
id: backend.java.learn.intermediate.mybatis-plus
type: lesson
title: MyBatis-Plus
summary: 在保留 MyBatis 映射能力的前提下，用实体注解、BaseMapper 与 Lambda Wrapper 完成可观察的通用 CRUD 和条件查询。
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 180
prerequisites:
  - backend.java.learn.intermediate.user-and-team-persistence-project
objectives:
  - 解释 MyBatis-Plus 与 MyBatis 的关系，判断哪些 SQL 适合通用 Mapper，哪些仍应保留 XML。
  - 使用 TableName、TableId 与 TableField 明确实体、表、主键和字段的映射关系。
  - 通过 BaseMapper 完成新增、按主键查询、更新与删除，并正确解释返回行数和回填主键。
  - 使用 LambdaQueryWrapper 组合等值、前缀匹配和集合条件，避免硬编码数据库列名。
  - 区分 Wrapper 的 condition 参数、空 Map 与空集合行为，并在调用 in 前处理空集合。
  - 理解 selectOne 的零行、一行与多行合同，并用唯一约束保证单行语义。
  - 识别 Wrapper 复用和字符串 SQL 入口的边界，不让客户端输入控制 SQL 结构。
  - 从 Preparing、Parameters 与 Updates 日志核对生成 SQL，而不是只根据 Java 调用猜测行为。
  - 让 BaseMapper 通用方法与已有 XML statement 在同一个 Mapper 中共存。
recap:
  - MyBatis-Plus 是 MyBatis 的增强工具，不会替代数据库约束、业务边界或所有定制 SQL。
  - TableName、TableId 与 TableField 分别确定表名、主键策略和字段映射；exist=false 只排除字段持久化。
  - BaseMapper 的写方法返回受影响行数；AUTO 主键在成功插入后回填到实体的主键属性。
  - Lambda Wrapper 用 Java 属性方法引用解析数据库列，重命名时比字符串列名更容易得到编译反馈。
  - condition 为 false 时条件不会进入 SQL；allEq 的空 Map 不增加条件，但 in 的空集合会生成 IN ()。
  - Wrapper 的 entity 条件与显式链式条件彼此独立，不存在自动去重、覆盖或关联行为。
  - selectOne 只接受零行或一行，3.5.17 默认在读取到第二行时抛出 TooManyResultsException。
  - Wrapper 是可变且非线程安全的构建器，一次独立查询应创建一个新实例。
  - Wrapper 应在持久化边界内构造，不能接收前端 SQL 片段，也不应作为 Controller 或 RPC 的传输对象。
  - SQL 日志需要同时检查 SQL 模板和参数；开发期定向开启，不能把敏感参数长期输出到生产日志。
  - BaseMapper 与 XML statement 可以共存；分页、事务和完整持久化项目分别由后续课程完成。
related:
  - backend.java.learn.intermediate.mybatis-and-mybatis-plus
  - backend.java.learn.intermediate.mybatis-write-and-dynamic-sql
  - backend.java.learn.intermediate.user-and-team-persistence-project
tags:
  - MyBatis-Plus
  - MyBatis
  - BaseMapper
  - LambdaQueryWrapper
  - MySQL
appliesTo: JDK 25、Spring Boot 4.1.0、MyBatis-Plus 3.5.17、MyBatis 3.5.19、MyBatis-Spring 4.0.0 与 MySQL 8.4 LTS；Java 8、Spring Boot 2.3.12.RELEASE、MyBatis-Plus 3.4.2、MyBatis 3.5.6、MyBatis-Spring 2.0.5 兼容补充
verifiedAt: 2026-08-20
sources:
  - id: mybatis-plus-install
    title: MyBatis-Plus Installation
    url: https://baomidou.com/en/getting-started/install/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis-Plus 3.5.x
    claims:
      - Spring Boot 工程应选择与 Boot 版本对应的 MyBatis-Plus Starter
      - 引入 MyBatis-Plus Starter 后不应再重复引入 MyBatis 或 MyBatis-Spring Starter
  - id: mybatis-plus-annotations
    title: MyBatis-Plus Annotation Configuration
    url: https://baomidou.com/en/reference/annotation/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis-Plus 3.5.x
    claims:
      - TableName、TableId 与 TableField 的映射职责
      - TableField exist=false 表示该实体字段不是数据库表字段
      - IdType.AUTO 使用数据库自增主键
  - id: mybatis-plus-persistence-interface
    title: MyBatis-Plus Persistence Layer Interface
    url: https://baomidou.com/en/guides/data-interface/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis-Plus 3.5.x
    claims:
      - BaseMapper 提供 insert、selectById、updateById、deleteById 与 selectList 等通用方法
      - 通用写方法用整数返回受影响记录数
  - id: mybatis-plus-wrapper
    title: MyBatis-Plus Conditional Constructor
    url: https://baomidou.com/en/guides/wrapper/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis-Plus 3.5.x
    claims:
      - Wrapper 方法的 condition 参数决定条件是否加入最终 SQL
      - Lambda Wrapper 使用属性方法引用，普通 Wrapper 的字符串参数表示数据库列名
      - Wrapper 的 entity 条件与显式 API 条件没有关联行为
      - Wrapper 不适合作为 RPC 传输对象，前端传入 SQL 片段可能产生 SQL 注入风险
  - id: mybatis-plus-release-3517
    title: MyBatis-Plus v3.5.17 Release
    url: https://github.com/baomidou/mybatis-plus/releases/tag/v3.5.17
    sourceOrigin: official
    sourceType: release-note
    appliesTo: MyBatis-Plus 3.5.17
    claims:
      - 3.5.17 是正式 release 版本
  - id: mybatis-plus-3517-metadata
    title: MyBatis-Plus Maven Metadata
    url: https://repo.maven.apache.org/maven2/com/baomidou/mybatis-plus/maven-metadata.xml
    sourceOrigin: official
    sourceType: source-code
    appliesTo: 2026-08-20 快照
    claims:
      - MyBatis-Plus 当前 GA 版本为 3.5.17
  - id: mybatis-plus-boot4-starter-3517
    title: MyBatis-Plus Spring Boot 4 Starter POM 3.5.17
    url: https://repo.maven.apache.org/maven2/com/baomidou/mybatis-plus-spring-boot4-starter/3.5.17/mybatis-plus-spring-boot4-starter-3.5.17.pom
    sourceOrigin: official
    sourceType: source-code
    appliesTo: MyBatis-Plus 3.5.17
    claims:
      - Boot 4 Starter 组合 MyBatis-Plus 3.5.17 与 MyBatis-Spring 4.0.0
  - id: mybatis-plus-boot4-starter-metadata
    title: MyBatis-Plus Spring Boot 4 Starter Maven Metadata
    url: https://repo.maven.apache.org/maven2/com/baomidou/mybatis-plus-spring-boot4-starter/maven-metadata.xml
    sourceOrigin: official
    sourceType: source-code
    appliesTo: 2026-08-20 快照
    claims:
      - Boot 4 专用 Starter 从 MyBatis-Plus 3.5.13 开始发布
      - Boot 4 专用 Starter 当前版本为 3.5.17
  - id: mybatis-plus-boot-starter-342
    title: MyBatis-Plus Spring Boot Starter POM 3.4.2
    url: https://repo.maven.apache.org/maven2/com/baomidou/mybatis-plus-boot-starter/3.4.2/mybatis-plus-boot-starter-3.4.2.pom
    sourceOrigin: official
    sourceType: source-code
    appliesTo: MyBatis-Plus 3.4.2
    claims:
      - 本课 Java 8 兼容线所用 Starter 组合 Spring Boot JDBC、MyBatis-Plus 与自动配置
  - id: mybatis-plus-base-mapper-3517
    title: MyBatis-Plus BaseMapper Source 3.5.17
    url: https://raw.githubusercontent.com/baomidou/mybatis-plus/v3.5.17/mybatis-plus-core/src/main/java/com/baomidou/mybatisplus/core/mapper/BaseMapper.java
    sourceOrigin: official
    sourceType: source-code
    appliesTo: MyBatis-Plus 3.5.17
    claims:
      - BaseMapper 通用 CRUD 的真实方法签名
      - selectOne 默认在读取到第二行时抛出 TooManyResultsException
  - id: mybatis-plus-abstract-wrapper-3517
    title: MyBatis-Plus AbstractWrapper Source 3.5.17
    url: https://raw.githubusercontent.com/baomidou/mybatis-plus/v3.5.17/mybatis-plus-core/src/main/java/com/baomidou/mybatisplus/core/conditions/AbstractWrapper.java
    sourceOrigin: official
    sourceType: source-code
    appliesTo: MyBatis-Plus 3.5.17
    claims:
      - allEq 遍历 Map 追加条件，空 Map 不产生条目
      - Wrapper 是会累积条件的可变对象，并提供 clear 方法
  - id: mybatis-plus-query-wrapper-test-3517
    title: MyBatis-Plus QueryWrapper Official Tests 3.5.17
    url: https://raw.githubusercontent.com/baomidou/mybatis-plus/v3.5.17/mybatis-plus-core/src/test/java/com/baomidou/mybatisplus/core/conditions/QueryWrapperTest.java
    sourceOrigin: official
    sourceType: official-test
    appliesTo: MyBatis-Plus 3.5.17
    claims:
      - 官方测试断言空集合 in 生成 IN ()
  - id: mybatis-plus-changelog-3517
    title: MyBatis-Plus Changelog 3.5.17
    url: https://raw.githubusercontent.com/baomidou/mybatis-plus/v3.5.17/CHANGELOG.md
    sourceOrigin: official
    sourceType: release-note
    appliesTo: MyBatis-Plus 3.1.0 至 3.5.17
    claims:
      - 从 3.1.0 起移除 in 与 notIn 对空集合的内部保护
  - id: mybatis-xml-mapper
    title: MyBatis 3 Mapper XML Files
    url: https://mybatis.org/mybatis-3/sqlmap-xml.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis 3.5.19
    claims:
      - Mapper XML 通过 namespace 和 statement id 绑定 Mapper 接口方法
      - 参数占位符使用预编译参数而不是直接拼接字符串
  - id: mybatis-logging
    title: MyBatis 3 Logging
    url: https://mybatis.org/mybatis-3/logging.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis 3.5.19
    claims:
      - 可以按 Mapper 的全限定名开启日志观察 SQL 执行
---

# MyBatis-Plus

前面的持久化项目已经证明：Mapper 接口和 XML 能精确表达查询、写入与关联映射，但每张表仍会反复出现按主键
新增、查询、更新和删除的基础语句。MyBatis-Plus 在 MyBatis 之上提供实体映射、通用 Mapper 和条件构造器，
让这些重复操作有统一入口，同时继续复用原来的 Mapper 代理、SqlSession 和 XML statement。

本课只把一个 `project_records` 表接入 MyBatis-Plus。分页留给下一课，事务留给再下一课；逻辑删除、乐观锁、
自动填充、代码生成器和 Service 扩展也不进入当前示例。目标不是“消灭 SQL”，而是判断通用能力与定制 SQL
各自应该放在哪里，并能从真实日志确认框架最终执行了什么。

## 一、先建立增强而非替代的心智模型

### 1. MyBatis-Plus 仍然运行在 MyBatis 链路中

加入 MyBatis-Plus 后，数据库访问链没有换成另一套持久化框架：

```text
Spring Boot DataSource
        |
        v
MyBatis SqlSessionFactory
        |
        v
MyBatis Mapper 代理
        |
        +--> BaseMapper 注入的通用 statement
        |
        +--> 项目自己的 XML statement
        |
        v
      MySQL
```

`BaseMapper<ProjectRecord>` 让 Mapper 代理多出一组已经准备好的 statement；自己声明的
`selectNamesByStatus` 仍按 MyBatis 的 `namespace + id` 找到 XML。两类方法可以出现在同一个接口中，使用同一个
数据源和会话。

这也说明 MyBatis-Plus 不负责三件事：

- 不替代 MySQL 的 `UNIQUE`、`FOREIGN KEY` 和类型约束。
- 不替代 Service 对 404、409、权限和业务状态的解释。
- 不保证任意复杂查询都应该改写成 Wrapper；固定投影、复杂 JOIN 或需要精确维护的 SQL 仍可保留 XML。

### 2. Starter 必须与 Spring Boot 主线对应

Boot 4 工程使用专用 Starter：

```xml
<dependency>
  <groupId>com.baomidou</groupId>
  <artifactId>mybatis-plus-spring-boot4-starter</artifactId>
  <version>3.5.17</version>
</dependency>
```

Boot 4 专用 artifact 从 `3.5.13` 才开始发布，本课使用当前 GA `3.5.17`。这个 Starter 已经组合
MyBatis-Plus、MyBatis-Spring 和 JDBC 自动配置，不要再同时加入 `mybatis-spring-boot-starter`；重复 Starter 会让
自动配置和依赖版本的所有权变得含糊。

本课现代线真实解析为 Spring Boot `4.1.0`、MyBatis-Plus `3.5.17`、MyBatis `3.5.19` 和
MyBatis-Spring `4.0.0`。这些是 Maven 依赖树的结果，不应只凭 Starter 名称推断。

### 3. 通用能力应有明确的退出条件

先用一个判断表决定入口：

| 需求 | 适合的入口 | 原因 |
| --- | --- | --- |
| 按主键新增、查询、更新、删除 | `BaseMapper` | 表与主键映射确定后，SQL 形状稳定且重复 |
| 可选的等值、范围、集合筛选 | Lambda Wrapper | 条件按输入组合，字段引用可随 Java 属性重命名 |
| 固定列投影或复杂 JOIN | XML Mapper | SQL 本身就是需要阅读和维护的合同 |
| 前端传来的排序或筛选 DTO | Service 转换后再构造 Wrapper | 不让客户端控制列名或 SQL 片段 |
| 分页 | 下一课的分页插件与分页合同 | 需要单独讲页码、总数与筛选边界 |
| 多步写入原子性 | 后续事务课程 | 单个 Mapper 方法不能替代事务边界 |

通用方法减少的是重复映射，不是判断成本。只要查询开始依赖复杂投影、数据库特性或稳定的手写执行计划，保留
XML 往往更清楚。

## 二、用注解冻结实体映射

### 1. 表名与类名不必互相猜测

创建 `src/main/java/com/example/teamflow/persistence/ProjectRecord.java`：

```java
package com.example.teamflow.persistence;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

/**
 * 映射 TeamFlow 项目记录表。
 */
@TableName("project_records")
public class ProjectRecord {
    @TableId(value = "project_id", type = IdType.AUTO)
    private Long id;

    @TableField("project_code")
    private String code;

    @TableField("display_name")
    private String name;

    @TableField("owner_email")
    private String ownerEmail;

    @TableField("project_status")
    private String status;

    @TableField(exist = false)
    private String displayLabel;

    /** 返回数据库生成的主键。 */
    public Long getId() {
        return id;
    }

    /** 写入数据库生成的主键。 */
    public void setId(Long id) {
        this.id = id;
    }

    /** 返回项目编码。 */
    public String getCode() {
        return code;
    }

    /** 设置项目编码。 */
    public void setCode(String code) {
        this.code = code;
    }

    /** 返回项目名称。 */
    public String getName() {
        return name;
    }

    /** 设置项目名称。 */
    public void setName(String name) {
        this.name = name;
    }

    /** 返回负责人邮箱。 */
    public String getOwnerEmail() {
        return ownerEmail;
    }

    /** 设置负责人邮箱。 */
    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    /** 返回项目状态。 */
    public String getStatus() {
        return status;
    }

    /** 设置项目状态。 */
    public void setStatus(String status) {
        this.status = status;
    }

    /** 组合只在界面展示、不参与表映射的标签。 */
    public String displayLabel() {
        return code + " / " + name;
    }
}
```

这里没有依靠驼峰转换猜测关键映射：

- `@TableName("project_records")` 把实体绑定到确定的表。
- `@TableId` 指定真实主键列，并用 `IdType.AUTO` 表示值由数据库自增生成。
- `@TableField` 把 Java 属性映射到名字不同的数据库列。
- `@TableField(exist = false)` 告诉通用 SQL 不要读写 `displayLabel` 字段。

`exist = false` 排除的是同名字段，不是 `displayLabel()` 方法。这个方法仍会在 Java 中用 `code` 和 `name`
动态组合标签；它没有对应的数据库列，也不需要 setter。

### 2. 主键策略必须匹配真实 DDL

本课表结构使用 MySQL 自增主键：

```sql
CREATE TABLE project_records (
  project_id BIGINT NOT NULL AUTO_INCREMENT,
  project_code VARCHAR(32) NOT NULL,
  display_name VARCHAR(120) NOT NULL,
  owner_email VARCHAR(254) NOT NULL,
  project_status VARCHAR(24) NOT NULL,
  CONSTRAINT pk_project_records PRIMARY KEY (project_id),
  CONSTRAINT uk_project_records_code UNIQUE (project_code)
);
```

因此实体选择 `IdType.AUTO`。执行 `insert(record)` 前 `record.getId()` 是 `null`；插入成功后，MyBatis-Plus 把
JDBC 返回的 generated key 写回 `id`，随后才能可靠调用 `selectById(record.getId())`。

如果 DDL 不是自增列，就不能只改注解掩盖冲突。应用生成 ID、数据库 sequence 或分布式 ID 都是不同合同，必须让
DDL、实体策略和写入方式三者一致。

### 3. 实体只描述持久化形状

`ProjectRecord` 不是 HTTP 请求 DTO，也不是前端筛选合同。它允许 Mapper 回填内部主键，字段名围绕数据库映射
设计；Controller DTO 则应围绕外部 API 设计。把两者合并会让 `project_id`、注解和更新策略泄漏到接口层。

本课为了观察 Mapper，命令行入口直接创建实体。真实 Web 应用仍由 Service 把已校验 DTO 转成实体，再把实体
转换成响应 DTO。MyBatis-Plus 没有改变前一课建立的分层边界。

## 三、用 BaseMapper 完成通用 CRUD

### 1. 一个泛型参数确定操作的实体

创建 `ProjectRecordMapper.java`：

```java
package com.example.teamflow.persistence;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import java.util.List;
import org.apache.ibatis.annotations.Param;

/**
 * 提供项目记录的通用 CRUD 与定制查询。
 */
public interface ProjectRecordMapper extends BaseMapper<ProjectRecord> {
    /** 使用已有 XML statement 查询指定状态的项目名称。 */
    List<String> selectNamesByStatus(@Param("status") String status);
}
```

`BaseMapper<ProjectRecord>` 的泛型参数让框架知道通用 statement 应使用哪份表与字段元数据。接口不需要为
`insert`、`selectById`、`updateById`、`deleteById` 和 `selectList` 重复声明方法。

Mapper 仍要被 MyBatis 注册。本课入口沿用前置课已经讲过的扫描方式：

```java
@SpringBootApplication
@MapperScan("com.example.teamflow.persistence")
public class TeamFlowApplication implements CommandLineRunner {
    // 后文补全入口。
}
```

继承接口不等于自动成为 Spring Bean；`@MapperScan` 的包边界必须覆盖它。

### 2. 返回行数与回填主键是两份结果

下面四步分别观察新增和按主键读取：

```java
ProjectRecord record = new ProjectRecord();
record.setCode("TF-101");
record.setName("迁移看板");
record.setOwnerEmail("jian@example.test");
record.setStatus("ACTIVE");

int inserted = projectRecordMapper.insert(record);
Long generatedId = record.getId();
ProjectRecord loaded = projectRecordMapper.selectById(generatedId);
```

成功时 `inserted` 是 `1`，表示一行受到影响；数据库生成的主键在 `record.getId()` 中。不要把 `inserted` 当成
主键，也不要因为返回 `1` 就跳过对回填结果的检查。

`selectById` 返回实体或 `null`。它不会替 Service 自动生成 404，也不会把“不存在”变成异常。持久化层只报告
查询结果，API 语义仍由上层决定。

### 3. 更新与删除也要解释行数

先修改已加载实体，再按主键更新：

```java
loaded.setName("迁移看板 Pro");
int updated = projectRecordMapper.updateById(loaded);

int deleted = projectRecordMapper.deleteById(record.getId());
ProjectRecord afterDelete = projectRecordMapper.selectById(record.getId());
```

当前输入得到 `updated = 1`、`deleted = 1`，删除后的查询结果是 `null`。这些数字只是数据库实际影响的行数：
`0` 可能表示主键不存在，也可能受具体数据库和 SQL 语义影响；它不自带“资源不存在”这类 HTTP 解释。

本课实体的字段都已经赋值，所以 `updateById` 生成完整的非空字段更新。如何把字段显式更新为 `null`、怎样配置
字段策略或实现 PATCH 是另一组合同，不应从这个示例外推。

## 四、用 Lambda Wrapper 组合筛选

### 1. 方法引用表达 Java 属性

构造一个状态、名称前缀和负责人集合筛选：

```java
List<String> ownerEmails = Arrays.asList(
    "jian@example.test",
    "nobody@example.test"
);

LambdaQueryWrapper<ProjectRecord> query = Wrappers.<ProjectRecord>lambdaQuery()
    .eq(ProjectRecord::getStatus, "ACTIVE")
    .likeRight(ProjectRecord::getName, "迁移")
    .in(!ownerEmails.isEmpty(), ProjectRecord::getOwnerEmail, ownerEmails);

List<ProjectRecord> filtered = projectRecordMapper.selectList(query);
```

三个方法依次生成：

- `eq`：`project_status = ?`
- `likeRight`：`display_name LIKE ?`，参数为 `迁移%`
- `in`：`owner_email IN (?, ?)`

方法引用写的是 Java getter，框架再根据 `@TableField` 找到数据库列。若属性重命名并同步修改 getter，旧的方法
引用会在编译期暴露问题；字符串 Wrapper 中的 `"project_status"` 则只有运行时才知道是否仍然正确。

### 2. condition 表达是否加入条件

大多数 Wrapper 条件都有带 `boolean condition` 的重载。它不是 SQL 参数，而是构造 SQL 前的开关：

```java
String status = "ACTIVE";
boolean hasStatus = status != null && !status.trim().isEmpty();

LambdaQueryWrapper<ProjectRecord> query = Wrappers.<ProjectRecord>lambdaQuery()
    .eq(hasStatus, ProjectRecord::getStatus, status);
```

`hasStatus` 为 `true` 时生成 `project_status = ?`；为 `false` 时，这一段完全不进入 SQL。条件值仍通过参数占位符
传给 JDBC，不应把值拼进 SQL 字符串。

Java 8 与 JDK 25 在这个 Wrapper 用法上没有语言差异。这里使用 `trim().isEmpty()` 只是判断本示例中的 ASCII
状态输入，不把它描述成与 `String.isBlank()` 对所有 Unicode 空白都等价。

### 3. 空 Map 与空集合不是同一个合同

`allEq(emptyMap)` 会遍历零个条目，因此不增加条件；`in(emptyList)` 却会生成 `IN ()`。官方文档把空 Map 与
List 一起概括为不添加条件，但 `3.5.17` 源码、官方测试和 changelog 对 `in` 给出了更精确且一致的结果：从
`3.1.0` 起，框架已移除 `in` 与 `notIn` 对空集合的内部保护。

下面代码会生成数据库可能拒绝的空 `IN`：

```java
List<String> ownerEmails = Collections.emptyList();

LambdaQueryWrapper<ProjectRecord> query = Wrappers.<ProjectRecord>lambdaQuery()
    .eq(ProjectRecord::getStatus, "ACTIVE")
    .in(ProjectRecord::getOwnerEmail, ownerEmails);
```

这里必须在调用 `in` 前冻结业务语义：

- 空集合表示“不按负责人筛选”时，用 `in(!ownerEmails.isEmpty(), ...)` 显式跳过可选条件。
- 空集合表示“没有任何允许的负责人，因此结果必须为空”时，应在调用 Mapper 前直接返回空列表。

```java
/** 按允许的负责人查询；没有允许项时不访问数据库。 */
public List<ProjectRecord> findAllowedProjects(List<String> ownerEmails) {
    if (ownerEmails.isEmpty()) {
        return Collections.emptyList();
    }
    return projectRecordMapper.selectList(
        Wrappers.<ProjectRecord>lambdaQuery()
            .in(ProjectRecord::getOwnerEmail, ownerEmails)
    );
}
```

同一个框架边界可以承载两种业务含义，但代码必须先选定其中一种。直接把空集合交给 `in` 可能得到 SQL 语法
错误；盲目用 `condition=false` 跳过它，又可能扩大查询范围。两种处理都不能代替业务合同。

### 4. entity 条件与链式条件彼此独立

Wrapper 可以持有一个 entity，也可以继续调用 `eq`、`like` 等 API。官方合同明确说明：entity 产生的条件与
显式 API 条件没有关联行为，不会自动覆盖、去重或同步。

```java
ProjectRecord probe = new ProjectRecord();
probe.setStatus("ACTIVE");

QueryWrapper<ProjectRecord> query = new QueryWrapper<>(probe);
query.eq("project_status", "ARCHIVED");
```

这不是“后面的 ARCHIVED 覆盖前面的 ACTIVE”。最终 SQL 可能同时具有两份彼此矛盾的条件。业务查询更清楚的
方式是只选一个入口；本课统一用 Lambda API 构造条件，不混入 entity 查询条件。

## 五、让单行查询和 Wrapper 生命周期可预测

### 1. selectOne 只接受零行或一行

`selectOne` 不是“随便取一条”。它把返回数量纳入方法合同：零行返回 `null`，一行返回实体，多行表示查询条件
无法保证单一结果。`3.5.17` 默认使用 `throwEx=true`，游标读到第二行就抛出
`TooManyResultsException`，不需要把全部匹配行读完才发现错误。

本课按有唯一约束的项目编码查询：

```java
ProjectRecord record = projectRecordMapper.selectOne(
    Wrappers.<ProjectRecord>lambdaQuery()
        .eq(ProjectRecord::getCode, "TF-101")
);
```

DDL 中的 `uk_project_records_code` 让数据库保证编码唯一，Wrapper 则把调用值绑定到条件。两者共同支撑“最多
一行”；只调用 `selectOne` 本身不会替数据库创建唯一约束。

不要为了消除异常而追加 `last("LIMIT 1")`。那只会隐藏重复数据，并让返回哪一行取决于未声明的执行顺序。
如果业务允许多行，就调用 `selectList`；如果业务要求唯一，就修正条件和数据库约束。

### 2. 每次独立查询创建一个 Wrapper

Wrapper 会在调用 `eq`、`like`、`in` 时把条件追加到内部状态。下面的第二次查询不会只按名称查，它还保留了
第一次的状态条件：

```java
LambdaQueryWrapper<ProjectRecord> reused = Wrappers.<ProjectRecord>lambdaQuery()
    .eq(ProjectRecord::getStatus, "ACTIVE");

projectRecordMapper.selectList(reused);

reused.likeRight(ProjectRecord::getName, "迁移");
projectRecordMapper.selectList(reused);
```

源码提供 `clear()`，所以不能把规则夸大为“绝对不能复用”。问题在于复用要求调用者精确追踪可变状态，而且
Wrapper 不是线程安全对象。业务代码更直接的约定是：一次独立查询创建一个新 Wrapper，不把它放进单例字段，
也不在多个请求之间共享。

### 3. Wrapper 只在持久化边界内构造

Controller 可以接收普通筛选 DTO，例如 `status`、`namePrefix` 和 `ownerEmails`，但不能接收 Wrapper。Service
先校验 DTO、定义空值语义，再用允许的实体属性构造条件。这样 API 合同不会绑定 MyBatis-Plus 类型，也不会让
客户端决定字段名或 SQL 片段。

```java
/** 根据已经校验的筛选值构造一次查询。 */
public List<ProjectRecord> search(
        String status,
        String namePrefix,
        List<String> ownerEmails) {
    boolean hasStatus = status != null && !status.trim().isEmpty();
    boolean hasPrefix = namePrefix != null && !namePrefix.trim().isEmpty();

    return projectRecordMapper.selectList(
        Wrappers.<ProjectRecord>lambdaQuery()
            .eq(hasStatus, ProjectRecord::getStatus, status)
            .likeRight(hasPrefix, ProjectRecord::getName, namePrefix)
            .in(!ownerEmails.isEmpty(), ProjectRecord::getOwnerEmail, ownerEmails)
            .orderByAsc(ProjectRecord::getId)
    );
}
```

这个示例把空负责人集合解释为“不增加负责人条件”。如果业务含义是“没有任何允许负责人”，Service 应在调用
Mapper 前直接返回空列表，不能复用同一实现。

## 六、识别字符串 SQL 与 XML 的边界

### 1. apply 的参数位不等于字符串拼接

少量数据库函数无法由普通条件方法表达时，`apply` 支持 `{0}` 参数位：

```java
query.apply(
    "DATE(project_created_at) = {0}",
    requestedDate
);
```

`requestedDate` 会作为参数值处理。下面写法先把输入拼进 SQL，参数位保护已经失效：

```java
query.apply("DATE(project_created_at) = '" + requestedDate + "'");
```

本课表没有 `project_created_at`，因此这段只用于解释边界，不放进完整程序。能用 `eq`、`like`、`in` 等结构化
方法时，优先使用结构化方法。

### 2. last 和 inSql 只接受后端固定结构

`last` 把文本直接追加到生成 SQL 的末尾，绕过 MyBatis-Plus 的优化规则，而且多次调用只有最后一次生效。
`inSql` 也会把给定的 SQL 字符串嵌入语句。它们都不能接收请求参数中的 SQL：

```java
// 错误：客户端可以控制 SQL 结构。
query.last(request.getSqlTail());
query.inSql(ProjectRecord::getId, request.getSubquery());
```

需要动态排序时，把 API 枚举映射成有限的方法引用；需要固定子查询或数据库专用语法时，由后端代码维护，并
优先考虑让复杂 SQL 回到 XML。不要用字符串入口绕开 SQL 设计。

### 3. BaseMapper 与普通 XML statement 可以共存

前面的 `ProjectRecordMapper` 已经同时继承 `BaseMapper` 并声明 `selectNamesByStatus`。把下面 XML 保存为
`src/main/resources/mappers/ProjectRecordMapper.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper
  PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
  "https://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.teamflow.persistence.ProjectRecordMapper">
  <select id="selectNamesByStatus" resultType="java.lang.String">
    SELECT display_name
    FROM project_records
    WHERE project_status = #{status}
    ORDER BY project_id
  </select>
</mapper>
```

`insert`、`selectById` 等通用方法来自框架注入；`selectNamesByStatus` 仍按 MyBatis 的 namespace 与 statement id
绑定 XML。两者共享同一个 Mapper 代理，不需要建立第二套数据访问配置。

### 4. 自定义 XML 也可以接收 Wrapper

确有必要让自定义投影复用 Wrapper 条件时，接口参数名必须使用框架约定：

```java
/** 使用调用方明确构造的条件查询项目编码。 */
List<String> selectCodes(
    @Param(Constants.WRAPPER) Wrapper<ProjectRecord> wrapper
);
```

对应 XML 可以使用框架生成的条件段：

```xml
<select id="selectCodes" resultType="java.lang.String">
  SELECT project_code
  FROM project_records
  ${ew.customSqlSegment}
</select>
```

这里的 `${ew.customSqlSegment}` 只接受服务端 Wrapper 生成的结构，不表示普通用户输入可以使用 `${}`。自定义
SQL 也不会自动读取 Wrapper 中 entity 所代表的条件；调用方必须用 Wrapper API 明确追加条件。本课完整程序
选择更简单的固定 XML statement，避免在第一次使用 MyBatis-Plus 时混合两种动态入口。

### 5. 日志同时观察模板、参数和行数

开发期可以只为目标 Mapper 开启 DEBUG：

```properties
logging.level.com.example.teamflow.persistence.ProjectRecordMapper=DEBUG
```

一次插入通常能看到三类信息：

```text
Preparing: INSERT INTO project_records (...) VALUES (?, ?, ?, ?)
Parameters: TF-101(String), 迁移看板(String), jian@example.test(String), ACTIVE(String)
Updates: 1
```

`Preparing` 用来确认表、列、WHERE 与占位符，`Parameters` 用来确认绑定值，`Updates` 用来确认实际影响行数。
生产环境不能长期输出密码、令牌或完整个人数据；定向日志只用于受控调试。

## 七、集中排查通用 Mapper 的误用

:::pitfalls
### 同时引入两个 Spring Boot Starter

**触发条件：** Boot 4 项目已经加入 `mybatis-plus-spring-boot4-starter`，又保留
`mybatis-spring-boot-starter`。

**原因：** 两个 Starter 都试图提供 MyBatis 与 Spring Boot 的集成依赖和自动配置所有权。

**后果：** 依赖版本与自动配置来源变得含糊，升级时容易出现类或配置不兼容。

**错误示例：**

```xml
<artifactId>mybatis-plus-spring-boot4-starter</artifactId>
<artifactId>mybatis-spring-boot-starter</artifactId>
```

**正确写法：**

```xml
<dependency>
  <groupId>com.baomidou</groupId>
  <artifactId>mybatis-plus-spring-boot4-starter</artifactId>
  <version>3.5.17</version>
</dependency>
```

**验证方式：** 执行 `mvn dependency:tree`，确认应用只保留一条 MyBatis Spring Boot Starter 所有权，并真实
启动 Mapper。

### 把 insert 返回值当成数据库主键

**触发条件：** 代码把 `mapper.insert(record)` 的结果直接保存为资源 ID。

**原因：** 通用写方法返回受影响行数，AUTO 主键由 JDBC 生成后写回实体属性。

**后果：** 第一条成功插入常返回 `1`，调用方把行数误报为项目 ID。

**错误示例：**

```java
long projectId = mapper.insert(record);
```

**正确写法：**

```java
int inserted = mapper.insert(record);
Long projectId = record.getId();
```

**验证方式：** 连续插入两行，确认两次 `inserted` 都是 `1`，而回填的两个 ID 不同且都能用于
`selectById`。

### 让 AUTO 注解与非自增 DDL 冲突

**触发条件：** 实体声明 `IdType.AUTO`，数据库主键列却没有自增或等价生成机制。

**原因：** 注解只告诉框架怎样处理主键，不能改变已经存在的表定义。

**后果：** 插入时主键为空，数据库拒绝写入，或者主键无法回填。

**错误示例：**

```sql
project_id BIGINT NOT NULL PRIMARY KEY
```

**正确写法：**

```sql
project_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY
```

**验证方式：** 在真实 MySQL 表插入未设置 ID 的实体，确认影响行数为 `1` 且实体 ID 为正数；移除自增后同一
反馈环必须失败。

### 把空集合直接交给 in

**触发条件：** 负责人筛选解析为空列表后仍无条件调用 `in`。

**原因：** `3.5.17` 不会跳过空集合，而会生成 `IN ()`。

**后果：** 数据库可能报告 SQL 语法错误；若盲目跳过条件，又可能把查询扩大为全部数据。

**错误示例：**

```java
query.in(ProjectRecord::getOwnerEmail, ownerEmails);
```

**正确写法：**

```java
if (ownerEmails.isEmpty()) {
    return Collections.emptyList();
}
query.in(ProjectRecord::getOwnerEmail, ownerEmails);
```

**验证方式：** 空列表时确认 Mapper 调用次数为零并返回空结果；非空列表时确认 SQL 中占位符数量与列表大小
一致。

### 在多个请求之间共享 Wrapper

**触发条件：** 单例 Service 把 Wrapper 保存为字段并由不同请求继续追加条件。

**原因：** Wrapper 是会累积条件的可变对象，而且不是线程安全对象。

**后果：** 后一个请求继承前一个请求的条件，或并发修改产生不可预测 SQL。

**错误示例：**

```java
private final LambdaQueryWrapper<ProjectRecord> query =
    Wrappers.<ProjectRecord>lambdaQuery();
```

**正确写法：**

```java
LambdaQueryWrapper<ProjectRecord> query =
    Wrappers.<ProjectRecord>lambdaQuery();
```

**验证方式：** 连续执行状态查询和名称查询，确认两次都创建新 Wrapper，第二条 SQL 不含第一条查询的状态
条件。

### 用 last 隐藏 selectOne 的重复结果

**触发条件：** `selectOne` 因匹配多行抛错后，调用方追加 `last("LIMIT 1")`。

**原因：** 追加限制只截断结果，不修复条件或数据库唯一性。

**后果：** 重复数据继续存在，返回行在没有稳定排序时不可预测。

**错误示例：**

```java
query.eq(ProjectRecord::getStatus, "ACTIVE").last("LIMIT 1");
mapper.selectOne(query);
```

**正确写法：**

```java
query.eq(ProjectRecord::getCode, projectCode);
mapper.selectOne(query);
```

**验证方式：** 给非唯一状态准备两行，确认 `selectOne` 抛出 `TooManyResultsException`；再用具有 UNIQUE 约束的
项目编码查询，确认只返回目标行。

### 把客户端字符串交给 SQL 结构入口

**触发条件：** 请求 DTO 包含 sqlTail 或 subquery，代码把它传给 `last`、`inSql` 或拼接后的 `apply`。

**原因：** 这些入口接受 SQL 结构文本，不会把整段文本变成 JDBC 参数。

**后果：** 客户端可能改变查询结构，造成越权读取、注入或不可审查的数据库行为。

**错误示例：**

```java
query.last(request.getSqlTail());
```

**正确写法：**

```java
query.orderByAsc(ProjectRecord::getId);
```

**验证方式：** 对 API 传入任意 SQL 文本，确认 DTO 不存在对应字段；排序只接受后端定义的枚举并映射到方法
引用。
:::

## 八、运行完整的现代版项目

### 1. 建立独立工程

完整目录如下：

```text
teamflow-mybatis-plus/
├── pom.xml
└── src/main/
    ├── java/com/example/teamflow/
    │   ├── TeamFlowApplication.java
    │   └── persistence/
    │       ├── ProjectRecord.java
    │       └── ProjectRecordMapper.java
    └── resources/
        ├── application.properties
        ├── schema.sql
        └── mappers/ProjectRecordMapper.xml
```

`pom.xml` 使用 JDK 25、Spring Boot `4.1.0` 与 Boot 4 专用 Starter：

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

  <groupId>com.example</groupId>
  <artifactId>teamflow-mybatis-plus</artifactId>
  <version>1.0.0</version>

  <properties>
    <java.version>25</java.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <dependencies>
    <dependency>
      <groupId>com.baomidou</groupId>
      <artifactId>mybatis-plus-spring-boot4-starter</artifactId>
      <version>3.5.17</version>
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

`ProjectRecord.java` 与 `ProjectRecordMapper.java` 使用第二、三章的完整内容；XML 使用第六章的完整 statement。
`schema.sql` 为：

```sql
DROP TABLE IF EXISTS project_records;

CREATE TABLE project_records (
  project_id BIGINT NOT NULL AUTO_INCREMENT,
  project_code VARCHAR(32) NOT NULL,
  display_name VARCHAR(120) NOT NULL,
  owner_email VARCHAR(254) NOT NULL,
  project_status VARCHAR(24) NOT NULL,
  CONSTRAINT pk_project_records PRIMARY KEY (project_id),
  CONSTRAINT uk_project_records_code UNIQUE (project_code)
);
```

`application.properties` 从环境读取连接信息，并让 Spring 执行本课初始化脚本：

```properties
spring.application.name=teamflow-mybatis-plus
spring.main.web-application-type=none
spring.datasource.url=${TEAMFLOW_DB_URL}
spring.datasource.username=${TEAMFLOW_DB_USER}
spring.datasource.password=${TEAMFLOW_DB_PASSWORD}
spring.sql.init.mode=always
mybatis-plus.mapper-locations=classpath:/mappers/*.xml
logging.level.com.example.teamflow.persistence.ProjectRecordMapper=DEBUG
```

### 2. 用一个入口观察所有合同

`TeamFlowApplication.java` 的完整内容如下：

```java
package com.example.teamflow;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.example.teamflow.persistence.ProjectRecord;
import com.example.teamflow.persistence.ProjectRecordMapper;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 运行 MyBatis-Plus 的单表 CRUD 与条件查询反馈环。
 */
@SpringBootApplication
@MapperScan("com.example.teamflow.persistence")
public class TeamFlowApplication implements CommandLineRunner {
    private final ProjectRecordMapper mapper;

    /**
     * 注入项目记录 Mapper。
     *
     * @param mapper 项目记录 Mapper
     */
    public TeamFlowApplication(ProjectRecordMapper mapper) {
        this.mapper = mapper;
    }

    /**
     * 启动反馈环。
     *
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        SpringApplication.run(TeamFlowApplication.class, args);
    }

    /**
     * 顺序验证通用 CRUD、Lambda Wrapper、单行查询和 XML statement。
     *
     * @param args 命令行参数
     */
    @Override
    public void run(String... args) {
        ProjectRecord migration = project(
                "TF-101", "迁移看板", "jian@example.test", "ACTIVE");
        int inserted = mapper.insert(migration);

        ProjectRecord loaded = mapper.selectById(migration.getId());
        loaded.setName("迁移看板 Pro");
        int updated = mapper.updateById(loaded);

        ProjectRecord release = project(
                "TF-102", "发布清单", "ops@example.test", "ACTIVE");
        mapper.insert(release);

        List<ProjectRecord> filtered = mapper.selectList(
                Wrappers.<ProjectRecord>lambdaQuery()
                        .eq(ProjectRecord::getStatus, "ACTIVE")
                        .likeRight(ProjectRecord::getName, "迁移")
                        .in(
                                ProjectRecord::getOwnerEmail,
                                Arrays.asList("jian@example.test", "nobody@example.test"))
                        .orderByAsc(ProjectRecord::getId));

        ProjectRecord selectedOne = mapper.selectOne(
                Wrappers.<ProjectRecord>lambdaQuery()
                        .eq(ProjectRecord::getCode, "TF-101"));
        List<String> xmlNames = mapper.selectNamesByStatus("ACTIVE");

        int deleted = mapper.deleteById(release.getId());
        long remaining = mapper.selectCount(null);

        System.out.println(
                "inserted=" + inserted + " generatedId=" + (migration.getId() != null));
        System.out.println("loaded=" + loaded.displayLabel());
        System.out.println("updated=" + updated + " updatedName=" + loaded.getName());
        System.out.println(
                "filteredCodes="
                        + filtered.stream()
                                .map(ProjectRecord::getCode)
                                .collect(Collectors.toList()));
        System.out.println("xmlNames=" + xmlNames);
        System.out.println("selectOne=" + selectedOne.getCode());
        System.out.println("deleted=" + deleted + " remaining=" + remaining);
    }

    /**
     * 创建尚未持久化的项目记录。
     *
     * @param code 项目编码
     * @param name 项目名称
     * @param ownerEmail 负责人邮箱
     * @param status 项目状态
     * @return 未设置数据库主键的实体
     */
    private static ProjectRecord project(
            String code,
            String name,
            String ownerEmail,
            String status) {
        ProjectRecord record = new ProjectRecord();
        record.setCode(code);
        record.setName(name);
        record.setOwnerEmail(ownerEmail);
        record.setStatus(status);
        return record;
    }
}
```

### 3. 在真实 MySQL 中运行

创建隔离网络并启动 MySQL `8.4`：

```bash
docker network create teamflow-mp-net

docker run -d \
  --name teamflow-mp-db \
  --network teamflow-mp-net \
  -e MYSQL_ROOT_PASSWORD=local-root-pass \
  -e MYSQL_DATABASE=teamflow \
  -e MYSQL_USER=teamflow \
  -e MYSQL_PASSWORD=local-teamflow-pass \
  mysql:8.4

until docker exec teamflow-mp-db \
  mysql -h127.0.0.1 -uteamflow -plocal-teamflow-pass \
  teamflow -e "SELECT 1" >/dev/null 2>&1; do
  sleep 1
done
```

在现代工程根目录运行：

```bash
docker run --rm \
  --network teamflow-mp-net \
  -v "$PWD:/workspace" \
  -v teamflow-mp-m2:/root/.m2 \
  -w /workspace \
  -e 'TEAMFLOW_DB_URL=jdbc:mysql://teamflow-mp-db:3306/teamflow?sslMode=DISABLED&allowPublicKeyRetrieval=true' \
  -e TEAMFLOW_DB_USER=teamflow \
  -e TEAMFLOW_DB_PASSWORD=local-teamflow-pass \
  maven:3.9.12-eclipse-temurin-25 \
  mvn -B spring-boot:run
```

日志中的 SQL 应分别出现通用 INSERT、SELECT、UPDATE、DELETE 和 XML 查询。最后七行输出为：

```text
inserted=1 generatedId=true
loaded=TF-101 / 迁移看板 Pro
updated=1 updatedName=迁移看板 Pro
filteredCodes=[TF-101]
xmlNames=[迁移看板 Pro, 发布清单]
selectOne=TF-101
deleted=1 remaining=1
```

`loaded` 在更新后引用同一个实体，所以标签显示新名称。这不是第二次查询的结果；需要观察更新后数据库状态时，
应再次调用 `selectById`。

### 4. 观察两个失败路径

先临时删除 DDL 中的 `AUTO_INCREMENT`，保持实体 `IdType.AUTO` 不变，再启动同一程序。第一条 INSERT 应失败，
且程序不能打印成功结果。恢复自增定义后，完整反馈环应再次通过。

再把 `selectOne` 条件临时改成非唯一的 `status = ACTIVE`。表中两行都处于 ACTIVE，调用应抛出
`TooManyResultsException`；恢复唯一项目编码条件后，七行结果再次出现。这两个对照分别证明主键策略和单行
语义来自真实数据库合同。

## 九、运行 Java 8 兼容线

### 1. 只替换真实不同的依赖与属性

Java 8 工程继续使用相同的 Java 类、Mapper XML 和 MySQL DDL，因为这些源码只使用 Java 8 已有语法。建立独立
目录 `teamflow-mybatis-plus-java8/`，复制完整 `src/main` 后，把 POM 改为：

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

  <groupId>com.example</groupId>
  <artifactId>teamflow-mybatis-plus-java8</artifactId>
  <version>1.0.0</version>

  <properties>
    <java.version>1.8</java.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <dependencies>
    <dependency>
      <groupId>com.baomidou</groupId>
      <artifactId>mybatis-plus-boot-starter</artifactId>
      <version>3.4.2</version>
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

Boot `2.3.12.RELEASE` 使用旧 MySQL artifact 坐标，并管理其兼容版本。`3.4.2` 的发布依赖解析为 MyBatis
`3.5.6` 与 MyBatis-Spring `2.0.5`。它只用于维护 Java 8 系统，新项目继续使用现代线。

Boot 2.3 的 SQL 初始化属性名不同，把兼容工程的配置改为：

```properties
spring.application.name=teamflow-mybatis-plus-java8
spring.main.web-application-type=none
spring.datasource.url=${TEAMFLOW_DB_URL}
spring.datasource.username=${TEAMFLOW_DB_USER}
spring.datasource.password=${TEAMFLOW_DB_PASSWORD}
spring.datasource.initialization-mode=always
mybatis-plus.mapper-locations=classpath:/mappers/*.xml
logging.level.com.example.teamflow.persistence.ProjectRecordMapper=DEBUG
```

### 2. 用独立 JDK 和构建目录运行

在 IntelliJ IDEA 中，现代工程的 Project SDK、模块 SDK 与 Maven Runner JRE 都设为 JDK 25；兼容工程三处都
设为 JDK 8。两个工程分别 Reload Maven，不能共用 `target/`。

在兼容工程根目录运行：

```bash
docker run --rm \
  --network teamflow-mp-net \
  -v "$PWD:/workspace" \
  -v teamflow-mp-java8-m2:/root/.m2 \
  -w /workspace \
  -e 'TEAMFLOW_DB_URL=jdbc:mysql://teamflow-mp-db:3306/teamflow?useSSL=false&allowPublicKeyRetrieval=true' \
  -e TEAMFLOW_DB_USER=teamflow \
  -e TEAMFLOW_DB_PASSWORD=local-teamflow-pass \
  maven:3.9.12-eclipse-temurin-8 \
  mvn -B spring-boot:run
```

预期仍是现代线的七行结果。相同输出证明本课采用的实体注解、BaseMapper、Lambda Wrapper 与 XML 共存能力在
两个已核验版本中都成立；它不证明后续分页插件配置相同。

## 十、练习：按项目编码集合查询

:::exercise
### 为项目目录增加明确的空集合合同

**要求：** 新建 `ProjectCatalog`，提供 `findByCodes(List<String> codes)` 和
`findOneByCode(String code)`。编码集合为空时必须直接返回空列表且不调用 Mapper；非空时用新的 Lambda Wrapper
生成 `IN` 并按内部主键升序；单编码查询使用 `selectOne`。不得接收 Wrapper、列名或 SQL 文本，不得加入分页、
事务或 Service 扩展。

**验收：** 空集合返回 `[]` 且 SQL 计数不增加；`[TF-102, TF-101]` 返回按主键排列的两行；`TF-101` 返回唯一
实体；不存在编码返回 `null`；数据库出现重复编码时由 UNIQUE 约束拒绝写入。
:::

### 1. 完整参考实现

```java
package com.example.teamflow.persistence;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import java.util.Collections;
import java.util.List;

/**
 * 把项目目录查询合同转换为 MyBatis-Plus 条件。
 */
public final class ProjectCatalog {
    private final ProjectRecordMapper mapper;

    /**
     * 创建项目目录。
     *
     * @param mapper 项目记录 Mapper
     */
    public ProjectCatalog(ProjectRecordMapper mapper) {
        this.mapper = mapper;
    }

    /**
     * 按允许的项目编码查询；空集合明确表示空结果。
     *
     * @param codes 项目编码集合
     * @return 按内部主键升序排列的项目记录
     */
    public List<ProjectRecord> findByCodes(List<String> codes) {
        if (codes.isEmpty()) {
            return Collections.emptyList();
        }

        return mapper.selectList(
                Wrappers.<ProjectRecord>lambdaQuery()
                        .in(ProjectRecord::getCode, codes)
                        .orderByAsc(ProjectRecord::getId));
    }

    /**
     * 按唯一项目编码查询一行。
     *
     * @param code 项目编码
     * @return 项目记录；不存在时返回 null
     */
    public ProjectRecord findOneByCode(String code) {
        return mapper.selectOne(
                Wrappers.<ProjectRecord>lambdaQuery()
                        .eq(ProjectRecord::getCode, code));
    }
}
```

### 2. 预期结果

先在完整程序的 import 区补入练习需要的类型：

```java
import com.example.teamflow.persistence.ProjectCatalog;
import java.util.Collections;
```

然后在程序已经插入 `TF-101` 和 `TF-102`、删除动作执行前调用参考实现：

```java
ProjectCatalog catalog = new ProjectCatalog(mapper);

System.out.println("empty=" + catalog.findByCodes(Collections.emptyList()));
System.out.println(
    "codes=" + catalog.findByCodes(Arrays.asList("TF-102", "TF-101"))
        .stream()
        .map(ProjectRecord::getCode)
        .collect(Collectors.toList())
);
System.out.println("one=" + catalog.findOneByCode("TF-101").getCode());
System.out.println("missing=" + catalog.findOneByCode("TF-999"));
```

预期输出为：

```text
empty=[]
codes=[TF-101, TF-102]
one=TF-101
missing=null
```

开启 Mapper DEBUG 日志后，`empty=[]` 之前不能出现本练习的 SELECT；另外三个调用分别产生一次查询。现代线与
Java 8 线使用同一份 `ProjectCatalog` 源码即可完成验收。

完成练习后清理隔离环境：

```bash
database_volume="$(docker inspect teamflow-mp-db \
  --format '{{range .Mounts}}{{if eq .Destination "/var/lib/mysql"}}{{.Name}}{{end}}{{end}}')"
docker stop teamflow-mp-db
docker rm --volumes teamflow-mp-db
docker network rm teamflow-mp-net
docker volume rm teamflow-mp-m2 teamflow-mp-java8-m2
test -z "$database_volume" || ! docker volume inspect "$database_volume" >/dev/null 2>&1
```

## 十一、本课小结

MyBatis-Plus 把清晰、重复的单表映射和 CRUD 收进实体注解、`BaseMapper` 与 Wrapper，但最终 SQL、数据库约束
和业务语义仍需要开发者负责。正确使用它的关键不是写出更长的调用链，而是让主键策略与 DDL 一致、区分影响
行数和回填主键、为每次查询创建新 Wrapper、在调用 `in` 前处理空集合，并让 `selectOne` 的唯一性由条件与约束
共同保证。复杂投影和固定 SQL 可以继续留在 XML；分页、事务和完整项目会在后续课程中单独建立反馈环。
