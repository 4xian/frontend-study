---
id: backend.java.learn.intermediate.mybatis-query-mapping
type: lesson
title: MyBatis 查询映射
summary: 把只读 SQL 结果稳定映射为 Java 投影、嵌套对象和集合，并用真实查询次数验证返回合同
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 210
prerequisites:
  - backend.java.learn.intermediate.sql-queries
  - backend.java.learn.intermediate.mybatis-and-mybatis-plus
  - backend.java.learn.basics.record-classes
objectives:
  - 能说明 Mapper 全限定名、XML namespace 与 statement id 的绑定关系。
  - 能在短小平面查询中选择 @Select，并在复杂映射中选择 Mapper XML。
  - 能用列别名、resultType 与显式 resultMap 建立平面投影合同。
  - 能用 constructor、idArg 与 arg 把查询列映射到 Java 25 record 或 Java 8 DTO。
  - 能用 association、collection、columnPrefix 和 notNullColumn 映射 LEFT JOIN 对象图。
  - 能区分单对象、Optional、List、单行 Map 与 @MapKey Map 的 0/1/多行语义。
  - 能用 @Param 为多个简单参数建立稳定的 SQL 占位符名称。
  - 能通过 SQL 日志识别 nested select 在列表查询中的 1 + N 次访问。
  - 能定位 namespace、参数名、列别名、构造器类型和返回容器不匹配造成的失败。
recap:
  - namespace 必须等于 Mapper 接口全限定名，statement id 必须等于方法名；XML 资源还必须进入运行时 classpath。
  - '@Select 适合短小平面 SQL，复杂 JOIN 与可复用对象图应回到 XML resultMap。'
  - SQL alias 是结果列标签；resultType 适合规则简单的投影，resultMap 负责显式的 property、column 和构造器合同。
  - record 的显式 constructor resultMap 不依赖 SELECT 列顺序；原始 long 的 MyBatis 类型别名是 `_long`，不是 `long`。
  - association 表示单值对象，collection 表示集合；父子身份列使用 id 或 idArg，LEFT JOIN 的空子行由 notNullColumn 控制。
  - nested result 可以用一条 JOIN 组装对象图；nested select 在访问多个父对象时通常形成 1 + N 次查询。
  - 单对象方法的 0 行是 null 或 Optional.empty，多行会抛 TooManyResultsException；List 才表达 0 到 N 行。
  - '@MapKey Map 的 key 必须唯一，重复 key 会由后一个值覆盖，不能把 Map 类型当成数据库唯一约束。'
  - Java 8 只替换 record 与版本依赖；XML、@Param、association、collection 和 Optional 的查询语义不变。
related:
  - backend.java.learn.intermediate.mybatis-and-mybatis-plus
  - backend.java.learn.intermediate.sql-queries
tags:
  - MyBatis
  - 查询映射
  - resultMap
  - association
  - collection
  - record
appliesTo: JDK 25、Spring Boot 4.1.0、MyBatis Spring Boot Starter 4.1.0、MyBatis 3.5.19、MyBatis-Spring 4.1.0 与 MySQL 8.4 LTS；Java 8、Spring Boot 2.3.12.RELEASE、Starter 2.1.4、MyBatis 3.5.6 兼容补充
verifiedAt: 2026-08-20
sources:
  - id: mybatis-sqlmap-xml
    title: MyBatis 3 - Mapper XML Files
    url: https://mybatis.org/mybatis-3/sqlmap-xml.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis 3.5.19
    claims:
      - resultType 与 resultMap 是两条结果映射入口
      - constructor、id、association、collection、columnPrefix 和 notNullColumn 的 XML 合同
      - nested select 与 nested result 的查询行为
  - id: mybatis-configuration-mapping
    title: MyBatis 3 - Configuration
    url: https://mybatis.org/mybatis-3/configuration.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis 3.5.19
    claims:
      - useColumnLabel、mapUnderscoreToCamelCase 与 autoMappingBehavior 的默认和配置行为
      - argNameBasedConstructorAutoMapping 的版本与默认关闭状态
  - id: mybatis-getting-started
    title: MyBatis 3 - Getting Started
    url: https://mybatis.org/mybatis-3/getting-started.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis 3.5.19
    claims:
      - Mapper 接口与 XML namespace 的绑定方式
      - 读取查询和 SqlSession 的基本边界
  - id: mybatis-java-api
    title: MyBatis 3 - Java API
    url: https://mybatis.org/mybatis-3/java-api.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis 3.5.19
    claims:
      - 注解 Mapper 适合简单语句
      - 复杂嵌套映射应使用 XML resultMap
  - id: mybatis-param-javadoc
    title: MyBatis @Param Javadoc
    url: https://mybatis.org/mybatis-3/apidocs/org/apache/ibatis/annotations/Param.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: MyBatis 3.5.19
    claims:
      - '@Param 为 Mapper 方法参数提供 SQL 占位符名称'
  - id: mybatis-mapkey-javadoc
    title: MyBatis @MapKey Javadoc
    url: https://mybatis.org/mybatis-3/apidocs/org/apache/ibatis/annotations/MapKey.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: MyBatis 3.5.19
    claims:
      - '@MapKey 指定多行 Map 的对象属性作为 key'
  - id: mybatis-3519-source
    title: MyBatis 3.5.19 MapperMethod Source
    url: https://github.com/mybatis/mybatis-3/blob/mybatis-3.5.19/src/main/java/org/apache/ibatis/binding/MapperMethod.java
    sourceOrigin: official
    sourceType: source-code
    appliesTo: MyBatis 3.5.19
    claims:
      - List、Map、Optional、selectOne 与 primitive 返回类型的分派语义
  - id: mybatis-3519-sql-session-source
    title: MyBatis 3.5.19 DefaultSqlSession Source
    url: https://github.com/mybatis/mybatis-3/blob/mybatis-3.5.19/src/main/java/org/apache/ibatis/session/defaults/DefaultSqlSession.java
    sourceOrigin: official
    sourceType: source-code
    appliesTo: MyBatis 3.5.19
    claims:
      - selectOne 的 0 行、1 行和多行合同
  - id: mybatis-3519-map-result-source
    title: MyBatis 3.5.19 DefaultMapResultHandler Source
    url: https://github.com/mybatis/mybatis-3/blob/mybatis-3.5.19/src/main/java/org/apache/ibatis/executor/result/DefaultMapResultHandler.java
    sourceOrigin: official
    sourceType: source-code
    appliesTo: MyBatis 3.5.19
    claims:
      - '@MapKey 多行收集使用 Map.put，重复 key 会保留后一行'
  - id: mybatis-3519-param-source
    title: MyBatis 3.5.19 ParamNameResolver Source
    url: https://github.com/mybatis/mybatis-3/blob/mybatis-3.5.19/src/main/java/org/apache/ibatis/reflection/ParamNameResolver.java
    sourceOrigin: official
    sourceType: source-code
    appliesTo: MyBatis 3.5.19
    claims:
      - '@Param、实际参数名与 param1 等通用参数名的解析'
  - id: mybatis-3519-result-source
    title: MyBatis 3.5.19 DefaultResultSetHandler Source
    url: https://github.com/mybatis/mybatis-3/blob/mybatis-3.5.19/src/main/java/org/apache/ibatis/executor/resultset/DefaultResultSetHandler.java
    sourceOrigin: official
    sourceType: source-code
    appliesTo: MyBatis 3.5.19
    claims:
      - nested result、constructor、columnPrefix 与 notNullColumn 的运行时行为
  - id: mybatis-record-test
    title: MyBatis 3.5.19 RecordTypeTest
    url: https://github.com/mybatis/mybatis-3/blob/mybatis-3.5.19/src/test/java/org/apache/ibatis/submitted/record_type/RecordTypeTest.java
    sourceOrigin: official
    sourceType: official-test
    appliesTo: MyBatis 3.5.19
    claims:
      - record 的自动、显式构造器和嵌套映射测试覆盖
  - id: mybatis-starter-410-pom
    title: MyBatis Spring Boot Starter Parent POM 4.1.0
    url: https://repo1.maven.org/maven2/org/mybatis/spring/boot/mybatis-spring-boot/4.1.0/mybatis-spring-boot-4.1.0.pom
    sourceOrigin: official
    sourceType: source-code
    appliesTo: Starter 4.1.0
    claims:
      - 现代线解析 MyBatis 3.5.19、MyBatis-Spring 4.1.0 且最低 Java 17
  - id: mybatis-starter-214-pom
    title: MyBatis Spring Boot Parent POM 2.1.4
    url: https://repo1.maven.org/maven2/org/mybatis/spring/boot/mybatis-spring-boot/2.1.4/mybatis-spring-boot-2.1.4.pom
    sourceOrigin: official
    sourceType: source-code
    appliesTo: Starter 2.1.4
    claims:
      - Java 8 线解析 MyBatis 3.5.6 与 MyBatis-Spring 2.0.6
  - id: openjdk-jep395-records
    title: 'JEP 395: Records'
    url: https://openjdk.org/jeps/395
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java 16 及以后
    claims:
      - record 在 Java 16 正式交付，Java 8 没有该语法
  - id: stackoverflow-columnprefix-notnull
    title: Association with columnPrefix giving SQLException invalid column name
    url: https://stackoverflow.com/questions/39026685/association-with-columnprefix-giving-sqlexception-invalid-column-name
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: MyBatis 查询映射；原问题为 2016-08-18，结论已用 MyBatis 3.5.19 源码复核
    claims:
      - columnPrefix 存在时，notNullColumn 应填写未加前缀的列名，避免双前缀排错陷阱
---

# MyBatis 查询映射

上一课已经让 DataSource、SqlSessionFactory、SqlSessionTemplate 和 Mapper 扫描真正连起来。现在 Mapper 方法
可以执行 SQL 了，但数据库返回的列还不是 Java 对象：同一行可能要变成 record，多个 JOIN 行要合并成一个项目和
它的任务列表，0 行和多行也必须有明确的 Java 返回合同。

本课只处理只读查询映射。你会从 statement 定位开始，经过平面投影、构造器映射和 JOIN 对象图，最后用真实的
SQL 日志检查返回容器和查询次数。`INSERT`、`UPDATE`、`DELETE`、动态 SQL、MyBatis-Plus、分页、事务、缓存和
完整懒加载配置都留给后续课程；本课不会为了演示查询而把写入方法藏进 Mapper。

## 一、从 Mapper 方法找到 statement

### 1. namespace 与 id 是同一条合同

Mapper 接口没有手写实现。MyBatis 代理收到 `findTask` 调用后，使用接口全限定名和方法名组成 statement 标识，
再从配置中取出对应 SQL。XML 必须把 `namespace` 写成接口的全限定名，`<select id>` 写成方法名：

```xml
<mapper namespace="dev.teamflow.query.QueryMapper">
  <select id="findTask" resultMap="taskRowMap">
    SELECT id, public_id, title, status
    FROM tasks
    WHERE project_id = #{projectId} AND public_id = #{publicId}
  </select>
</mapper>
```

如果 namespace、id 或 XML 资源路径有一处不一致，常见结果是
`Invalid bound statement (not found)`。这条消息不能只解释成“XML 没加载”：先核对接口全名，再核对方法名，
最后确认 `src/main/resources` 中的 XML 已经进入 `target/classes`。

### 2. 短查询可以写在 @Select

固定且平面的 SQL 适合放在接口上，上一课的基础探针就是这种形式。本课用任务状态计数作对比：

```java
/**
 * 按状态统计任务数量。
 *
 * @param status 要匹配的状态
 * @return 命中的任务数量
 */
@Select("SELECT COUNT(*) FROM tasks WHERE status = #{status}")
int countByStatus(@Param("status") String status);
```

当 SQL 需要多个表、重复使用 resultMap 或描述 association/collection 时，改回 XML。注解可以引用 XML 的
resultMap，但不应为了展示两种写法而把同一个业务查询复制两遍。

IDE 里能看到 XML 只证明源码树存在它；还要确认 `target/classes/mappers/QueryMapper.xml` 已生成，并实际调用
`QueryMapper.findTask`，才能把“源码文件存在”和“statement 可执行”区分开。

## 二、平面结果：列标签进入投影

### 1. 显式列和 alias 先固定输出合同

上一课的 SQL 查询已经说明 `SELECT *` 会把未来新增列悄悄暴露给调用方。映射时还要处理多表同名列，因此给每个
输出列明确别名：

```sql
SELECT
  t.id AS task_id,
  t.public_id AS task_public_id,
  t.title AS task_title,
  t.status AS task_status
FROM tasks AS t
WHERE t.project_id = #{projectId};
```

SQL alias 是结果集的列标签，不会修改表结构。`useColumnLabel` 默认开启时，MyBatis 优先使用这个标签进行映射；
跨表查询中的 `task_id`、`owner_id` 比裸 `id` 更不容易把列来源弄错。

### 2. resultType 适合规则简单的投影

如果返回对象有可写属性，且列标签和属性已经清楚对应，可以只写 `resultType`。集合查询的 `resultType` 写元素
类型，不写 `List`：

```xml
<select id="findTasksByProjectId" resultType="dev.teamflow.query.TaskBean">
  SELECT id, public_id AS publicId, title, status
  FROM tasks
  WHERE project_id = #{projectId}
  ORDER BY id
</select>
```

`mapUnderscoreToCamelCase=true` 时，`public_id` 可以自动对应 `publicId`；但显式 alias 更能表达 JOIN 后的列合同。
自动映射默认是 `PARTIAL`，带有 nested result 的 resultMap 不应依赖没有声明的同名属性。不要为了“全自动”改成
`FULL`：复杂 JOIN 可能把父对象列误投到子对象同名属性。

### 3. resultMap 把每一列写成可审查合同

只要列名和属性不再一一对应，就使用 `resultMap`。`property` 是 Java 属性，`column` 是数据库列名或 alias：

```xml
<resultMap id="taskBeanMap" type="dev.teamflow.query.TaskBean">
  <id property="id" column="task_id"/>
  <result property="publicId" column="task_public_id"/>
  <result property="title" column="task_title"/>
  <result property="status" column="task_status"/>
</resultMap>
```

一个 statement 选择 `resultType` 或 `resultMap` 其中一条入口；不要同时声明两套互相冲突的结果合同。

## 三、用构造器映射固定 Java 投影

### 1. record 不是无参 JavaBean

现代 Java 25 里，查询投影可以是只读 record：

```java
package dev.teamflow.query;

/** 表示一行固定任务查询结果。 */
public record TaskRow(long id, String publicId, String title, String status) {
}
```

record 没有无参构造器和 setter，所以不能把它当作普通 JavaBean 自动填充。MyBatis 3.5.19 支持 record，但只写
`resultType` 时，构造器自动映射会把结果列顺序变成隐含合同。SQL 只要调整列顺序，就可能把值传给错误的构造器
参数。

### 2. 显式 constructor 不依赖列顺序

为 record 建立显式 resultMap：

```xml
<resultMap id="taskRowMap" type="dev.teamflow.query.TaskRow">
  <constructor>
    <idArg column="id" javaType="_long"/>
    <arg column="public_id" javaType="java.lang.String"/>
    <arg column="title" javaType="java.lang.String"/>
    <arg column="status" javaType="java.lang.String"/>
  </constructor>
</resultMap>
```

`idArg`/`arg` 按 canonical constructor 的参数顺序写，但每个参数都绑定了列名和 Java 类型；SQL 可以把
`status、title、public_id、id` 以不同顺序返回，映射仍按列名得到正确对象。

这里的 `_long` 是 MyBatis 的原始 `long` 类型别名。`javaType="long"` 会解析成包装类型 `Long`，而 record 的
构造器参数是原始 `long`，运行时就会找不到匹配构造器。这个下划线不是装饰，而是 MyBatis 类型别名的实际区别。

### 3. Java 8 使用固定 DTO

Java 8 没有 record。兼容线可以使用只读 DTO：

```java
package dev.teamflow.query;

/** 表示一行固定任务查询结果。 */
public final class TaskRow {
    private final long id;
    private final String publicId;
    private final String title;
    private final String status;

    /**
     * 创建任务查询投影。
     *
     * @param id 数据库主键
     * @param publicId 对外任务标识
     * @param title 任务标题
     * @param status 任务状态
     */
    public TaskRow(long id, String publicId, String title, String status) {
        this.id = id;
        this.publicId = publicId;
        this.title = title;
        this.status = status;
    }

    /** @return 数据库主键 */
    public long getId() { return id; }

    /** @return 对外任务标识 */
    public String getPublicId() { return publicId; }

    /** @return 任务标题 */
    public String getTitle() { return title; }

    /** @return 任务状态 */
    public String getStatus() { return status; }
}
```

它和 record 只保持“固定查询投影的字段读取合同”，不是自动拥有 record 的 `equals`、`hashCode` 和 `toString`。
两条运行线继续使用同一 XML constructor resultMap；Java 8 的变化只有 DTO 代码和依赖版本。

## 四、JOIN 映射成对象图

### 1. association 是单值，collection 是集合

一个项目可以有一个可选负责人和多条任务。Java 容器使用普通 JavaBean 保存可变的集合属性，叶子投影继续使用
前面的 record：

`OwnerRow.java`：

```java
package dev.teamflow.query;

/** 表示项目负责人投影。 */
public record OwnerRow(long id, String displayName) {
}
```

`ProjectDetails.java`：

```java
package dev.teamflow.query;

import java.util.ArrayList;
import java.util.List;

/** 收集项目、可选负责人和任务列表。 */
public class ProjectDetails {
    private long id;
    private String publicId;
    private String name;
    private OwnerRow owner;
    private List<TaskRow> tasks = new ArrayList<>();

    /** @return 项目数据库主键 */
    public long getId() { return id; }

    /** @param id 项目数据库主键 */
    public void setId(long id) { this.id = id; }

    /** @return 项目对外标识 */
    public String getPublicId() { return publicId; }

    /** @param publicId 项目对外标识 */
    public void setPublicId(String publicId) { this.publicId = publicId; }

    /** @return 项目名称 */
    public String getName() { return name; }

    /** @param name 项目名称 */
    public void setName(String name) { this.name = name; }

    /** @return 可选负责人 */
    public OwnerRow getOwner() { return owner; }

    /** @param owner 可选负责人 */
    public void setOwner(OwnerRow owner) { this.owner = owner; }

    /** @return 任务列表 */
    public List<TaskRow> getTasks() { return tasks; }

    /** @param tasks 任务列表 */
    public void setTasks(List<TaskRow> tasks) { this.tasks = tasks; }
}
```

### 2. 先给 JOIN 列设置不冲突的 alias

```sql
SELECT
  p.id AS project_id,
  p.public_id AS project_public_id,
  p.name AS project_name,
  m.id AS owner_id,
  m.display_name AS owner_display_name,
  t.id AS task_id,
  t.public_id AS task_public_id,
  t.title AS task_title,
  t.status AS task_status
FROM projects AS p
LEFT JOIN members AS m ON m.id = p.owner_id
LEFT JOIN tasks AS t ON t.project_id = p.id
ORDER BY p.id, t.id;
```

父、负责人和任务的 `id` 都来自不同表，因此 alias 是后续 resultMap 能否正确区分对象身份的前提。

### 3. 用 columnPrefix 复用叶子 resultMap

```xml
<resultMap id="ownerRowMap" type="dev.teamflow.query.OwnerRow">
  <constructor>
    <idArg column="id" javaType="_long"/>
    <arg column="display_name" javaType="java.lang.String"/>
  </constructor>
</resultMap>

<resultMap id="projectDetailsMap" type="dev.teamflow.query.ProjectDetails" autoMapping="false">
  <id property="id" column="project_id"/>
  <result property="publicId" column="project_public_id"/>
  <result property="name" column="project_name"/>
  <association property="owner" resultMap="ownerRowMap" columnPrefix="owner_" notNullColumn="id"/>
  <collection property="tasks" resultMap="taskRowMap" columnPrefix="task_" notNullColumn="id"/>
</resultMap>
```

被复用的 `ownerRowMap` 仍然写 `id`、`display_name`，MyBatis 在外层加上 `owner_` 后读取 `owner_id`、
`owner_display_name`。`notNullColumn="id"` 也要写不带前缀的列名；内部会和 `columnPrefix` 合成 `owner_id`。
如果手工写成 `owner_id`，就会得到双前缀，排查时常见 `invalid column name`。

父项目和任务 resultMap 都标出身份列。MyBatis 用这些 `<id>` 判断两行 JOIN 结果属于同一个父对象或同一个子对象；
遗漏身份列可能造成重复对象和多余对象构造。

### 4. LEFT JOIN 的空子行要有明确结果

项目 `P-200` 没有任务且没有负责人时，正确结果是：

```text
publicId=P-200
owner=null
tasks.size=0
```

不是一个所有字段都为 `null` 的虚假 Task，也不是把可选负责人构造成空对象。`notNullColumn` 把“子对象是否存在”
绑定到真实身份列，应用层再按 `null` 或空集合处理缺失关系。

## 五、查询次数与返回容器

### 1. nested result 与 nested select

上面的 JOIN 是 nested result：一条 SQL 返回重复的父列，MyBatis 在内存中合并对象图。另一种写法把子查询写到
`<collection select="findTasksByProjectId">`：先查项目列表，再为每个项目执行一次任务查询。

```xml
<resultMap id="projectNestedSelectMap" type="dev.teamflow.query.ProjectDetails" autoMapping="false">
  <id property="id" column="project_id"/>
  <result property="publicId" column="project_public_id"/>
  <result property="name" column="project_name"/>
  <collection property="tasks" column="project_id" select="findTasksByProjectId" fetchType="eager"/>
</resultMap>
```

`fetchType="eager"` 只是让反馈环在读取列表时立即暴露查询次数；它没有消除 N+1。两个项目的日志应出现一条
项目查询和两条任务查询，也就是 `1 + N = 3`。改成 JOIN + nested result 后，项目和任务只需要一条 SQL。

**社区补充：** 社区排错中最容易混淆的是 `columnPrefix` 与 `notNullColumn` 的组合。这个经验已用 MyBatis
3.5.19 的 `DefaultResultSetHandler` 源码复核；它只补充双前缀的排错提示，不能替代官方 XML 合同。

### 2. 0、1、多行由返回类型表达

| Mapper 返回类型 | 0 行 | 1 行 | 多行 |
| --- | --- | --- | --- |
| `TaskRow` | `null` | 一个对象 | `TooManyResultsException` |
| `Optional<TaskRow>` | `Optional.empty()` | `Optional` 有值 | `TooManyResultsException` |
| `List<TaskRow>` | 空列表 | 单元素列表 | 多元素列表 |
| `Map<String, Object>` | `null` | 列标签到值的 Map | `TooManyResultsException` |
| `@MapKey("publicId") Map<String, TaskRow>` | 空 Map | 一项 | 多项 |

`Optional` 表达的是“可能没有一行”，不是“忽略多行”。单对象方法底层仍然是 `selectOne`，命中多行应当失败，
让查询条件或返回类型被修正。

### 3. @MapKey 需要唯一 key

```java
/**
 * 按任务公开标识建立索引。
 *
 * @return 任务公开标识到投影的 Map
 */
@MapKey("publicId")
Map<String, TaskRow> findTaskMap();
```

多行收集时底层使用 `Map.put`。如果两个结果行的 `publicId` 相同，后一个值会覆盖前一个值，Map size 会小于源
行数，不会自动抛唯一性异常。因此 key 的唯一性必须由查询列、数据库约束和反馈断言共同保证。

### 4. 多个简单参数统一使用 @Param

```java
/**
 * 在一个项目中读取指定任务。
 *
 * @param projectId 项目数据库主键
 * @param publicId 任务公开标识
 * @return 命中的任务投影；没有命中时为 null
 */
TaskRow findTask(@Param("projectId") long projectId, @Param("publicId") String publicId);
```

SQL 中的 `#{projectId}` 与 `#{publicId}` 现在有稳定名称。省略 `@Param` 后仍可使用 `param1`、`param2`；实际参数名
只有在编译结果保留它们时才可用。XML 若改用 `projectKey` 等业务别名而接口没有绑定，就会报告参数不存在。
`@Param` 在 Java 8 与 JDK 25 都可用，不是版本差异。

## 六、典型错误

:::pitfalls
### namespace 与接口全限定名不一致

**触发条件：** 修改 Mapper 接口包名后，XML 仍保留旧 namespace。

**原因：** Mapper 代理以接口全限定名作为 statement namespace；旧 namespace 注册到了另一个标识下。

**后果：** 启动或第一次调用时报告 `Invalid bound statement (not found)`，业务查询无法执行。

**错误示例：**

```xml
<mapper namespace="dev.teamflow.query.OldQueryMapper">
  <select id="findTask">...</select>
</mapper>
```

**正确写法：**

```xml
<mapper namespace="dev.teamflow.query.QueryMapper">
  <select id="findTask" resultMap="taskRowMap">...</select>
</mapper>
```

**验证方式：** 检查 `target/classes/mappers/QueryMapper.xml`，再用同一 Mapper 调用 `findTask`；修复后日志应出现 SELECT。

### statement id 与方法名不一致

**触发条件：** Mapper 方法已经改名为 `findTask`，XML 仍使用旧 id `findTaskByKey`。

**原因：** statement 的完整标识是“接口全限定名 + 方法名”，id 不一致时代理找不到对应 SQL。

**后果：** 调用时报告 `Invalid bound statement (not found)`；namespace 正确也无法执行查询。

**错误示例：**

```xml
<select id="findTaskByKey" resultMap="taskRowMap">...</select>
```

**正确写法：**

```xml
<select id="findTask" resultMap="taskRowMap">...</select>
```

**验证方式：** 保持 namespace 和资源路径不变，只切换 id；错误版调用失败，恢复为 `findTask` 后同一调用应命中一行。

### Mapper XML 没有进入 classpath

**触发条件：** XML 放在源码目录外、资源规则未复制它，或 `mapper-locations` 没有覆盖实际路径。

**原因：** 运行时只能解析 classpath 中被匹配到的 Mapper XML；IDE 能看到源码文件不代表应用加载了它。

**后果：** 方法调用报告 `Invalid bound statement (not found)`，且 SQL 日志中没有对应 SELECT。

**错误示例：**

```properties
mybatis.mapper-locations=classpath:/wrong-path/*.xml
```

**正确写法：**

```properties
mybatis.mapper-locations=classpath:/mappers/*.xml
```

**验证方式：** 先确认 `target/classes/mappers/QueryMapper.xml` 存在，再用同一方法调用；删除运行时资源时调用失败，恢复资源后查询通过。

### record 构造器类型别名写错

**触发条件：** record 的原始 `long` 参数在 `<idArg>` 中写成 `javaType="long"`。

**原因：** MyBatis 的 `long` 别名解析为包装类型 `Long`；原始类型别名是 `_long`，两者不是同一个构造器签名。

**后果：** 查询已经返回行，但实例化失败并报告找不到 `(Long, String, ...)` 构造器。

**错误示例：**

```xml
<idArg column="id" javaType="long"/>
```

**正确写法：**

```xml
<idArg column="id" javaType="_long"/>
```

**验证方式：** 让 SQL 以 `status、title、public_id、id` 顺序返回，运行 record 查询并逐字段断言；正确配置应输出 `T-102|Review SQL|DONE`。

### 多参数名称没有固定

**触发条件：** Mapper 方法接收两个简单参数，XML 使用 `projectKey`、`taskKey` 业务别名，却没有用 MyBatis 的
`@Param` 建立绑定。

**原因：** 通用参数名是 `param1`、`param2`；实际参数名还依赖编译器是否保留 `-parameters`，不能当作接口合同。

**后果：** 执行时报告 `Parameter 'projectKey' not found`，查询没有进入数据库。

**错误示例：**

```java
TaskRow findTask(long projectId, String publicId);
```

**正确写法：**

```java
TaskRow findTask(@Param("projectKey") long projectId, @Param("taskKey") String publicId);
```

**验证方式：** 让 XML 使用 `#{projectKey}` 与 `#{taskKey}`，再用 `10L` 和 `T-102` 调用；错误版应在 SQL 执行前
失败，正确版应命中一行。

### 把 0 到 N 查询声明成单对象

**触发条件：** 使用可能返回多行的条件，却让 Mapper 返回 `TaskRow`，或用 primitive 表达可能没有行的查询。

**原因：** 单对象方法走 `selectOne`；多行会抛 `TooManyResultsException`，primitive 也无法表达 null。

**后果：** 列表查询在数据增加后突然失败，或 0 行被转换成 `BindingException`。

**错误示例：**

```java
TaskRow findAllByStatus(String status);
int findCountOrNull(String status);
```

**正确写法：**

```java
List<TaskRow> findAllByStatus(@Param("status") String status);
Optional<TaskRow> findOptionalByPublicId(@Param("publicId") String publicId);
```

**验证方式：** 分别输入 0、1、2+ 行数据；List 应返回空/多元素，Optional 应返回 empty/present，单对象多行应明确失败。

### columnPrefix 与 notNullColumn 重复加前缀

**触发条件：** 外层 collection 已写 `columnPrefix="task_"`，又把 `notNullColumn` 写成 `task_id`。

**原因：** MyBatis 会把前缀和 notNullColumn 拼接；配置会去找 `task_task_id`。

**后果：** LEFT JOIN 的子对象判断失败，可能出现列找不到或空关系映射错误。

**错误示例：**

```xml
<collection property="tasks" resultMap="taskRowMap"
            columnPrefix="task_" notNullColumn="task_id"/>
```

**正确写法：**

```xml
<collection property="tasks" resultMap="taskRowMap"
            columnPrefix="task_" notNullColumn="id"/>
```

**验证方式：** 同时查询有两条任务的 `P-100` 和无任务的 `P-200`；正确版本分别得到 `tasks.size=2` 与 `tasks.size=0`。

### 用 nested select 掩盖 N+1

**触发条件：** 列表 resultMap 的 collection 对每个父对象使用 `select="findTasksByProjectId"`。

**原因：** MyBatis 先执行父列表，再为每个父对象执行一个子查询；访问每个集合时 SQL 次数随父行数增长。

**后果：** 两个项目就产生 `1 + 2` 条 SQL，生产数据增加后数据库往返和延迟线性增长。

**错误示例：**

```xml
<collection property="tasks" column="project_id"
            select="findTasksByProjectId" fetchType="eager"/>
```

**正确写法：**

```xml
<collection property="tasks" resultMap="taskRowMap"
            columnPrefix="task_" notNullColumn="id"/>
```

**验证方式：** 打开 Mapper DEBUG 日志，分别运行两种列表查询；JOIN 版本只出现一条 SELECT，nested select 版本出现三条 SELECT。
:::

## 七、完成一条可运行的只读映射链

### 1. 组装独立工程

把前面可直接保存的 `TaskRow.java`、`OwnerRow.java` 和 `ProjectDetails.java` 放进同一个工程。下面的
`QueryMapper.java`、`QueryMapper.xml` 和 `TeamFlowApplication.java` 都是继续加入这些完整文件后的精确内容：

```text
teamflow-mybatis-query/
├── pom.xml
└── src/main/
    ├── java/dev/teamflow/TeamFlowApplication.java
    ├── java/dev/teamflow/query/OwnerRow.java
    ├── java/dev/teamflow/query/ProjectDetails.java
    ├── java/dev/teamflow/query/QueryMapper.java
    ├── java/dev/teamflow/query/TaskRow.java
    └── resources/
        ├── application.properties
        ├── data.sql
        ├── schema.sql
        └── mappers/QueryMapper.xml
```

`pom.xml` 使用上一课已经验证的版本线：

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
  <groupId>dev.teamflow</groupId>
  <artifactId>teamflow-mybatis-query</artifactId>
  <version>1.0.0</version>
  <properties><java.version>25</java.version></properties>
  <dependencies>
    <dependency>
      <groupId>org.mybatis.spring.boot</groupId>
      <artifactId>mybatis-spring-boot-starter</artifactId>
      <version>4.1.0</version>
    </dependency>
    <dependency>
      <groupId>com.mysql</groupId>
      <artifactId>mysql-connector-j</artifactId>
      <scope>runtime</scope>
    </dependency>
  </dependencies>
  <build><plugins><plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
  </plugin></plugins></build>
</project>
```

`application.properties`：

```properties
spring.main.web-application-type=none
spring.datasource.url=${TEAMFLOW_DB_URL}
spring.datasource.username=${TEAMFLOW_DB_USER}
spring.datasource.password=${TEAMFLOW_DB_PASSWORD}
spring.sql.init.mode=always
mybatis.mapper-locations=classpath:/mappers/*.xml
mybatis.configuration.map-underscore-to-camel-case=true
mybatis.configuration.log-impl=org.apache.ibatis.logging.stdout.StdOutImpl
```

`schema.sql` 与 `data.sql` 只为隔离反馈环建立 fixture，应用 Mapper 仍然只有 SELECT：

```sql
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS members;
CREATE TABLE members (id BIGINT PRIMARY KEY, display_name VARCHAR(80) NOT NULL);
CREATE TABLE projects (
  id BIGINT PRIMARY KEY,
  public_id VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  owner_id BIGINT NULL,
  CONSTRAINT fk_projects_owner FOREIGN KEY (owner_id) REFERENCES members(id)
);
CREATE TABLE tasks (
  id BIGINT PRIMARY KEY,
  public_id VARCHAR(32) NOT NULL UNIQUE,
  project_id BIGINT NOT NULL,
  title VARCHAR(120) NOT NULL,
  status VARCHAR(16) NOT NULL,
  CONSTRAINT fk_tasks_project FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

```sql
INSERT INTO members(id, display_name) VALUES (1, 'Ada');
INSERT INTO projects(id, public_id, name, owner_id) VALUES
  (10, 'P-100', 'API Roadmap', 1), (20, 'P-200', 'Empty Project', NULL);
INSERT INTO tasks(id, public_id, project_id, title, status) VALUES
  (101, 'T-101', 10, 'Draft API', 'OPEN'), (102, 'T-102', 10, 'Review SQL', 'DONE');
```

### 2. 写出完整 Mapper 合同

```java
package dev.teamflow.query;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.apache.ibatis.annotations.MapKey;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/** 提供本课的只读查询合同。 */
public interface QueryMapper {
    /** @return 指定状态的任务数量 */
    @Select("SELECT COUNT(*) FROM tasks WHERE status = #{status}")
    int countByStatus(@Param("status") String status);

    /** @return 命中的任务；没有命中时为 null */
    TaskRow findTask(@Param("projectId") long projectId, @Param("publicId") String publicId);

    /** @return 可能为空的任务 */
    Optional<TaskRow> findOptionalByPublicId(@Param("publicId") String publicId);

    /** @return 一条 JOIN 组装的项目列表 */
    List<ProjectDetails> findProjects();

    /** @return nested select 组装的项目列表 */
    List<ProjectDetails> findProjectsWithNestedSelect();

    /** @return 指定项目的任务列表 */
    List<TaskRow> findTasksByProjectId(@Param("projectId") long projectId);

    /** @return 任务公开标识到任务的 Map */
    @MapKey("publicId")
    Map<String, TaskRow> findTaskMap();

    /** @return 单行结果的列标签 Map；没有命中时为 null */
    Map<String, Object> findTaskAsMap(@Param("publicId") String publicId);
}
```

`QueryMapper.xml` 把本课的三种映射连接起来：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "https://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="dev.teamflow.query.QueryMapper">
  <resultMap id="taskRowMap" type="dev.teamflow.query.TaskRow">
    <constructor>
      <idArg column="id" javaType="_long"/>
      <arg column="public_id" javaType="java.lang.String"/>
      <arg column="title" javaType="java.lang.String"/>
      <arg column="status" javaType="java.lang.String"/>
    </constructor>
  </resultMap>
  <resultMap id="ownerRowMap" type="dev.teamflow.query.OwnerRow">
    <constructor>
      <idArg column="id" javaType="_long"/>
      <arg column="display_name" javaType="java.lang.String"/>
    </constructor>
  </resultMap>
  <resultMap id="projectDetailsMap" type="dev.teamflow.query.ProjectDetails" autoMapping="false">
    <id property="id" column="project_id"/>
    <result property="publicId" column="project_public_id"/>
    <result property="name" column="project_name"/>
    <association property="owner" resultMap="ownerRowMap" columnPrefix="owner_" notNullColumn="id"/>
    <collection property="tasks" resultMap="taskRowMap" columnPrefix="task_" notNullColumn="id"/>
  </resultMap>
  <resultMap id="projectNestedSelectMap" type="dev.teamflow.query.ProjectDetails" autoMapping="false">
    <id property="id" column="project_id"/>
    <result property="publicId" column="project_public_id"/>
    <result property="name" column="project_name"/>
    <collection property="tasks" column="project_id" select="findTasksByProjectId" fetchType="eager"/>
  </resultMap>
  <select id="findTask" resultMap="taskRowMap">
    SELECT t.status, t.title, t.public_id, t.id FROM tasks AS t
    WHERE t.project_id = #{projectId} AND t.public_id = #{publicId}
  </select>
  <select id="findOptionalByPublicId" resultMap="taskRowMap">
    SELECT id, public_id, title, status FROM tasks WHERE public_id = #{publicId}
  </select>
  <select id="findProjects" resultMap="projectDetailsMap" resultOrdered="true">
    SELECT p.id AS project_id, p.public_id AS project_public_id, p.name AS project_name,
           m.id AS owner_id, m.display_name AS owner_display_name,
           t.id AS task_id, t.public_id AS task_public_id, t.title AS task_title, t.status AS task_status
    FROM projects AS p
    LEFT JOIN members AS m ON m.id = p.owner_id
    LEFT JOIN tasks AS t ON t.project_id = p.id
    ORDER BY p.id, t.id
  </select>
  <select id="findProjectsWithNestedSelect" resultMap="projectNestedSelectMap">
    SELECT id AS project_id, public_id AS project_public_id, name AS project_name FROM projects ORDER BY id
  </select>
  <select id="findTasksByProjectId" resultMap="taskRowMap">
    SELECT id, public_id, title, status FROM tasks WHERE project_id = #{projectId} ORDER BY id
  </select>
  <select id="findTaskMap" resultMap="taskRowMap">
    SELECT id, public_id, title, status FROM tasks ORDER BY id
  </select>
  <select id="findTaskAsMap" resultType="map">
    SELECT id, public_id, title, status FROM tasks WHERE public_id = #{publicId}
  </select>
</mapper>
```

### 3. 启动并观察每条合同

`TeamFlowApplication` 使用上一课的 Mapper 扫描边界，观察完成后主动退出：

```java
package dev.teamflow;

import dev.teamflow.query.ProjectDetails;
import dev.teamflow.query.QueryMapper;
import dev.teamflow.query.TaskRow;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;

/** 启动 TeamFlow 查询映射反馈环。 */
@SpringBootApplication
@MapperScan(basePackageClasses = QueryMapper.class)
public class TeamFlowApplication {
    /** 启动应用并在观察结束后退出。 */
    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(TeamFlowApplication.class, args);
        System.exit(SpringApplication.exit(context));
    }

    /** 执行本课所有正向查询。 */
    @Bean
    ApplicationRunner verify(QueryMapper mapper) {
        return args -> {
            TaskRow task = mapper.findTask(10L, "T-102");
            List<ProjectDetails> projects = mapper.findProjects();
            Map<String, TaskRow> taskMap = mapper.findTaskMap();
            System.out.println("flat=" + task.publicId() + "|" + task.title() + "|" + task.status());
            System.out.println("doneCount=" + mapper.countByStatus("DONE"));
            System.out.println("missing=" + !mapper.findOptionalByPublicId("T-404").isPresent());
            System.out.println("mapKeys=" + taskMap.keySet().stream().sorted()
                    .collect(Collectors.joining(",")));
            System.out.println("rowMapId=" + mapper.findTaskAsMap("T-102").get("public_id"));
            for (ProjectDetails project : projects) {
                String owner = project.getOwner() == null ? "none" : project.getOwner().displayName();
                System.out.println("project=" + project.getPublicId() + "|owner=" + owner
                        + "|taskCount=" + project.getTasks().size());
            }
            System.out.println("nestedProjects=" + mapper.findProjectsWithNestedSelect().size());
        };
    }
}
```

在上一课同形的隔离 MySQL 8.4 网络中运行，数据库 ready 后执行：

```bash
docker run --rm --network teamflow-query-net \
  -v "$PWD:/workspace" -v teamflow-query-m2:/root/.m2 -w /workspace \
  -e 'TEAMFLOW_DB_URL=jdbc:mysql://teamflow-query-db:3306/teamflow?useSSL=false&allowPublicKeyRetrieval=true' \
  -e TEAMFLOW_DB_USER=teamflow -e TEAMFLOW_DB_PASSWORD=local-teamflow-pass \
  maven:3.9.12-eclipse-temurin-25 mvn -B spring-boot:run
```

预期业务输出：

```text
flat=T-102|Review SQL|DONE
doneCount=1
missing=true
mapKeys=T-101,T-102
rowMapId=T-102
project=P-100|owner=Ada|taskCount=2
project=P-200|owner=none|taskCount=0
nestedProjects=2
```

同时从日志复算：`findProjects` 只有一条 JOIN，`findProjectsWithNestedSelect` 是一条父查询加两条子查询。

## 八、Java 8 兼容线

### 1. 使用独立工程和依赖基线

Java 8 工程把 parent 改为 Spring Boot `2.3.12.RELEASE`、`java.version` 改为 `1.8`，Starter 改为 `2.1.4`，
驱动坐标改为 `mysql:mysql-connector-java`。不要配置 MyBatis 3.5.10 才出现的
`argNameBasedConstructorAutoMapping`。

把现代工程的 Mapper、XML、schema 和 fixture 放入独立目录，再用第三章的完整 Java 8 `TaskRow` DTO 替换 record；
`OwnerRow` 同样改为带全参数构造器和 getter 的 `final` 类。启动入口把 record 访问器改为对应 getter；XML、SQL
和输出断言保持不变。

在 IntelliJ IDEA 中分别核对 Project SDK、模块 SDK、Maven Runner JRE 和 POM 目标：现代工程四处使用 JDK 25，
兼容工程四处使用 JDK 8，各自 Reload Maven，不能共享 `target/`。Java 8 线使用相同网络运行：

```bash
docker run --rm --network teamflow-query-net \
  -v "$PWD:/workspace" -v teamflow-query-java8-m2:/root/.m2 -w /workspace \
  -e 'TEAMFLOW_DB_URL=jdbc:mysql://teamflow-query-db:3306/teamflow?useSSL=false&allowPublicKeyRetrieval=true' \
  -e TEAMFLOW_DB_USER=teamflow -e TEAMFLOW_DB_PASSWORD=local-teamflow-pass \
  maven:3.9.12-eclipse-temurin-8 mvn -B spring-boot:run
```

实测依赖树为 Starter `2.1.4`、MyBatis `3.5.6`、MyBatis-Spring `2.0.6`、Connector/J `8.0.25`，八行业务输出
与现代线一致。这证明 XML 查询合同兼容，不代表 Java 8 DTO 自动拥有 record 的对象合同。

## 九、练习：映射项目摘要

:::exercise
### 为项目列表增加显式聚合投影

**要求：** 新建 `ProjectSummary` record，字段为 `publicId`、`name`、`taskCount`。增加
`findProjectSummaries()`，用一条固定 SQL `LEFT JOIN` 和 `COUNT(t.id)` 返回 `List<ProjectSummary>`；SQL 列使用
`project_public_id`、`project_name`、`task_count` 三个 alias。XML 必须增加独立 constructor resultMap，原始计数
参数使用 `javaType="_long"`。不得加入写入、动态 SQL、分页或 MyBatis-Plus。

**验收：**

```text
P-100|API Roadmap|2
P-200|Empty Project|0
Java 8 线使用 DTO 后输出相同两行
```
:::

参考实现：

```java
package dev.teamflow.query;

/** 表示项目任务数量摘要。 */
public record ProjectSummary(String publicId, String name, long taskCount) {
}
```

在前面完整的 `QueryMapper.java` 中增加：

```java
/** @return 项目摘要列表 */
List<ProjectSummary> findProjectSummaries();
```

Java 8 将 record 换成同字段的固定 DTO：

```java
package dev.teamflow.query;

/** 表示项目任务数量摘要。 */
public final class ProjectSummary {
    private final String publicId;
    private final String name;
    private final long taskCount;

    /** 创建项目摘要。 */
    public ProjectSummary(String publicId, String name, long taskCount) {
        this.publicId = publicId;
        this.name = name;
        this.taskCount = taskCount;
    }

    /** @return 项目公开标识 */
    public String getPublicId() { return publicId; }

    /** @return 项目名称 */
    public String getName() { return name; }

    /** @return 任务数量 */
    public long getTaskCount() { return taskCount; }
}
```

在前面完整的 `QueryMapper.xml` 中增加下面的 resultMap 和 statement：

```xml
<resultMap id="projectSummaryMap" type="dev.teamflow.query.ProjectSummary">
  <constructor>
    <arg column="project_public_id" javaType="java.lang.String"/>
    <arg column="project_name" javaType="java.lang.String"/>
    <arg column="task_count" javaType="_long"/>
  </constructor>
</resultMap>
<select id="findProjectSummaries" resultMap="projectSummaryMap">
  SELECT p.public_id AS project_public_id, p.name AS project_name, COUNT(t.id) AS task_count
  FROM projects AS p LEFT JOIN tasks AS t ON t.project_id = p.id
  GROUP BY p.id, p.public_id, p.name ORDER BY p.id
</select>
```

在前面完整的 `TeamFlowApplication.java` 的 `verify` 方法中增加下面的循环；现代入口使用 record 访问器输出结果：

```java
for (ProjectSummary summary : mapper.findProjectSummaries()) {
    System.out.println(summary.publicId() + "|" + summary.name() + "|" + summary.taskCount());
}
```

Java 8 入口把三个访问器换成对应 getter。运行两条版本线各一次；`P-200` 的计数必须是 0，不能只断言列表长度。

## 十、本课小结

查询映射的核心不是把每列“尽量自动塞进去”，而是让 statement、参数、列标签、Java 构造器和返回容器共同形成
可验证合同。平面投影可以从 `resultType` 开始，record、JOIN 和对象图则应显式写出 resultMap、身份列和空关系
规则。单条 JOIN 与 nested select 的区别最终要回到 SQL 次数；Java 8 只替换 record 和依赖基线，不需要发明另一套
MyBatis API。下一课才会把这些只读映射接到写入和动态 SQL。
