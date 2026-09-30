---
id: backend.java.learn.intermediate.mybatis-write-and-dynamic-sql
type: lesson
title: MyBatis 写入与动态 SQL
summary: 用可审查的写入合同处理行数、生成主键和动态 SQL，并阻止空输入退化成非法或无条件写入
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 220
prerequisites:
  - backend.java.learn.intermediate.relational-data-and-sql-foundations
  - backend.java.learn.intermediate.sql-queries
  - backend.java.learn.intermediate.database-migrations
  - backend.java.learn.intermediate.mybatis-and-mybatis-plus
  - backend.java.learn.intermediate.mybatis-query-mapping
objectives:
  - 能用 insert、update 和 delete statement 执行写入并解释 JDBC update count。
  - 能用 useGeneratedKeys 和 keyProperty 把 MySQL 生成主键回填到可写参数对象。
  - 能区分 Mapper 返回值与生成主键，并处理写入命中 0、1 或多行的不同合同。
  - 能用 if、set 和 trim 生成字段可选但 WHERE 固定的更新语句。
  - 能用 choose 和 where 表达互斥范围，并为空范围保留 WHERE 1 = 0。
  - 能用 foreach 安全生成批量 VALUES 与 IN 参数列表。
  - 能区分 null 集合、空集合和非空集合，并说明 MyBatis 3.5.19 与 3.5.6 的 nullable 差异。
  - 能把数据值交给参数绑定，并用固定分支代替接收任意 SQL 结构的字符串替换。
  - 能定位不可写 keyProperty、空 SET、动态 WHERE 消失、空 foreach 和字符串替换造成的失败。
recap:
  - Mapper 写方法返回 JDBC update count，生成主键写回参数对象；两者不是同一个值。
  - useGeneratedKeys 依赖数据库与 JDBC 驱动，keyProperty 指向可写 Java 属性而不是数据库列名。
  - if 只决定片段是否出现；set 与 trim 只修剪 SET 和逗号，不会替业务层判断空 patch。
  - where 只在有内容时输出 WHERE，条件全部消失可能把写操作扩大到全表。
  - choose 只选第一个成立分支，危险空范围应走 WHERE 1 = 0，而不是省略 WHERE。
  - foreach 负责 open、separator 和 close；空集合不会输出这些文本，必须定义独立安全合同。
  - nullable 从 MyBatis 3.5.9 起只允许 null 集合不报错，不会把空集合变成合法 IN 条件。
  - '#{} 绑定数据值，${} 原样拼接 SQL 结构；客户端字符串不能直接进入字符串替换。'
  - Java 8 线不能使用 foreach nullable 属性，其余 XML 写入合同与现代线保持一致。
  - 外部数据库初始化属性在 Spring Boot 4.1 与 2.3 不同，兼容工程必须使用对应版本的属性名。
related:
  - backend.java.learn.intermediate.mybatis-query-mapping
  - backend.java.learn.intermediate.mybatis-and-mybatis-plus
  - backend.java.learn.intermediate.database-migrations
tags:
  - MyBatis
  - 写入
  - 动态 SQL
  - generated key
  - foreach
  - SQL 注入
appliesTo: JDK 25、Spring Boot 4.1.0、MyBatis Spring Boot Starter 4.1.0、MyBatis 3.5.19、MyBatis-Spring 4.1.0 与 MySQL 8.4 LTS；Java 8、Spring Boot 2.3.12.RELEASE、Starter 2.1.4、MyBatis 3.5.6 兼容补充
verifiedAt: 2026-08-20
sources:
  - id: mybatis-write-statements
    title: MyBatis 3 - Mapper XML Files
    url: https://mybatis.org/mybatis-3/sqlmap-xml.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis 3.5.19
    claims:
      - insert、update 与 delete statement 的属性和参数合同
      - useGeneratedKeys、keyProperty、keyColumn 与 selectKey 的行为
      - '#{} 参数绑定和 ${} 字符串替换的安全边界'
  - id: mybatis-dynamic-sql
    title: MyBatis 3 - Dynamic SQL
    url: https://mybatis.org/mybatis-3/dynamic-sql.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis 3.5.19
    claims:
      - if、choose、trim、where、set 与 foreach 的生成规则
      - where 对前导 AND 或 OR 的移除以及 set 对末尾逗号的移除
  - id: mybatis-configuration-foreach
    title: MyBatis 3 - Configuration
    url: https://mybatis.org/mybatis-3/configuration.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis 3.5.19
    claims:
      - nullableOnForEach 从 MyBatis 3.5.9 起可用且默认关闭
  - id: mybatis-mapper-method-3519
    title: MyBatis 3.5.19 MapperMethod Source
    url: https://github.com/mybatis/mybatis-3/blob/mybatis-3.5.19/src/main/java/org/apache/ibatis/binding/MapperMethod.java
    sourceOrigin: official
    sourceType: source-code
    appliesTo: MyBatis 3.5.19
    claims:
      - 写 statement 的 int、long、boolean、void 返回值转换
  - id: mybatis-mapper-method-356
    title: MyBatis 3.5.6 MapperMethod Source
    url: https://github.com/mybatis/mybatis-3/blob/mybatis-3.5.6/src/main/java/org/apache/ibatis/binding/MapperMethod.java
    sourceOrigin: official
    sourceType: source-code
    appliesTo: MyBatis 3.5.6
    claims:
      - Java 8 兼容线具有相同的写入行数返回合同
  - id: mybatis-key-generator-3519
    title: MyBatis 3.5.19 Jdbc3KeyGenerator Source
    url: https://github.com/mybatis/mybatis-3/blob/mybatis-3.5.19/src/main/java/org/apache/ibatis/executor/keygen/Jdbc3KeyGenerator.java
    sourceOrigin: official
    sourceType: source-code
    appliesTo: MyBatis 3.5.19
    claims:
      - generated key 的可写属性、参数路径与多行回填行为
  - id: mybatis-key-generator-test-3519
    title: MyBatis 3.5.19 Jdbc3KeyGeneratorTest
    url: https://github.com/mybatis/mybatis-3/blob/mybatis-3.5.19/src/test/java/org/apache/ibatis/submitted/keygen/Jdbc3KeyGeneratorTest.java
    sourceOrigin: official
    sourceType: official-test
    appliesTo: MyBatis 3.5.19
    claims:
      - 单对象、集合、数组和多参数 generated key 的官方测试合同
  - id: mybatis-foreach-3519
    title: MyBatis 3.5.19 ForEachSqlNode Source
    url: https://github.com/mybatis/mybatis-3/blob/mybatis-3.5.19/src/main/java/org/apache/ibatis/scripting/xmltags/ForEachSqlNode.java
    sourceOrigin: official
    sourceType: source-code
    appliesTo: MyBatis 3.5.19
    claims:
      - null、空集合与非空集合对 foreach 输出的影响
  - id: mybatis-foreach-356
    title: MyBatis 3.5.6 ForEachSqlNode Source
    url: https://github.com/mybatis/mybatis-3/blob/mybatis-3.5.6/src/main/java/org/apache/ibatis/scripting/xmltags/ForEachSqlNode.java
    sourceOrigin: official
    sourceType: source-code
    appliesTo: MyBatis 3.5.6
    claims:
      - Java 8 兼容线的空集合行为与 null 集合失败路径
  - id: mysql-auto-increment-84
    title: MySQL 8.4 - Using AUTO_INCREMENT
    url: https://dev.mysql.com/doc/refman/8.4/en/example-auto-increment.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - AUTO_INCREMENT 生成值和连接级最近生成标识的规则
  - id: jdbc-statement-java8
    title: Java SE 8 Statement API
    url: https://docs.oracle.com/javase/8/docs/api/java/sql/Statement.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java 8 及以后
    claims:
      - JDBC update count 与 getGeneratedKeys 是两条独立合同
  - id: spring-boot-sql-init-current
    title: Spring Boot - Database Initialization
    url: https://docs.spring.io/spring-boot/how-to/data-initialization.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - 外部 SQL 数据库每次启动都执行初始化脚本时使用 spring.sql.init.mode=always
  - id: spring-boot-sql-init-2312
    title: Spring Boot 2.3.12 - Common Application Properties
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/appendix-application-properties.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - 旧版通过 spring.datasource.initialization-mode 决定是否执行 DataSource 初始化脚本
  - id: mybatis-empty-foreach-1881
    title: Missing parentheses in foreach tag when collection is empty
    url: https://github.com/mybatis/mybatis-3/issues/1881
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: MyBatis 3.5.1 报告；已按 MyBatis 3.5.19、3.5.6 与 MySQL 8.4 复核
    claims:
      - 空集合让 foreach 不输出括号并造成 IN 语法错误的真实排错案例
---

# MyBatis 写入与动态 SQL

上一课把固定 SELECT 的参数和结果映射成了明确合同。写操作还多出两类风险：数据库状态真的发生变化，
而动态片段又可能因为输入为空而改变整条 SQL 的范围。一个看似方便的可选 WHERE，最坏结果不是查询多几行，
而是更新或删除整张表。

本课只处理 MyBatis XML 中的 `INSERT`、`UPDATE`、`DELETE` 和受控动态 SQL。示例始终在独立 MySQL schema
中运行，并把 0、1、多行和生成主键分别观察。事务、分页、MyBatis-Plus、乐观锁、批处理执行器和完整的
用户团队持久化分别留给后续课程。

## 一、写方法返回什么

### 1. 返回值是 JDBC update count

MyBatis 执行写 statement 后，先取得 JDBC 驱动报告的 update count，再转换为 Mapper 方法声明的返回类型：

| 返回类型 | MyBatis 提供的结果 | 信息损失 |
| --- | --- | --- |
| `int`、`Integer` | 完整整数行数 | 无 |
| `long`、`Long` | 同一个整数转为 long | 无 |
| `boolean`、`Boolean` | 行数是否大于 0 | 丢失准确行数 |
| `void` | 不返回结果 | 丢失全部行数 |

本课统一返回 `int`。单对象更新按公开标识命中 0 行，可以表示对象不存在；命中 1 行表示范围符合合同；如果
意外返回 2 或更多，应该先检查 WHERE，而不是把“有行受影响”当成成功。

```java
/** 提供任务写入合同。 */
public interface TaskMapper {
    /** @return JDBC 驱动报告的写入行数 */
    int updateTitle(String publicId, String title);

    /** @return JDBC 驱动报告的删除行数 */
    int deleteByPublicId(String publicId);
}
```

这里的“受影响行数”应准确理解为 JDBC update count。它来自数据库与驱动，不是 MyBatis 重新对比新旧值计算的
数字。主流程使用确实改变值的 UPDATE；把列设置成原值时，不同驱动属性可能让“匹配行”和“改变行”的数字
不同，不能据此编写跨数据库业务合同。

### 2. statement 元素表达操作种类

XML 中的元素名决定 MyBatis 调用哪一种执行路径，`id` 仍然对应 Mapper 方法名：

```xml
<insert id="insert">INSERT INTO tasks(public_id, title) VALUES (#{publicId}, #{title})</insert>
<update id="updateTitle">UPDATE tasks SET title = #{title} WHERE public_id = #{publicId}</update>
<delete id="deleteByPublicId">DELETE FROM tasks WHERE public_id = #{publicId}</delete>
```

`#{publicId}` 是数据参数。MyBatis 通过 `PreparedStatement` 绑定它，不需要在 XML 中手写引号。操作成功也不等于
一定命中一行：唯一条件没有匹配时，合法 UPDATE 和 DELETE 都会返回 0，而不会抛 SQL 异常。

## 二、把数据库生成主键写回对象

### 1. Mapper 返回值和主键是两个位置

MySQL 的 `AUTO_INCREMENT` 可以生成主键。`useGeneratedKeys="true"` 要求 MyBatis 调用 JDBC
`getGeneratedKeys()`，`keyProperty="id"` 则说明把结果写入参数对象的 `id` 属性：

```xml
<insert id="insert" useGeneratedKeys="true" keyProperty="id">
  INSERT INTO tasks(team_id, public_id, title, status)
  VALUES (#{teamId}, #{publicId}, #{title}, #{status})
</insert>
```

调用后要分别读取两个结果：

```java
TaskWrite task = new TaskWrite(2L, "TASK-4", "Write XML", "OPEN");
int rows = mapper.insert(task);
System.out.println("rows=" + rows);       // 1
System.out.println("id=" + task.getId()); // 数据库生成的正数
```

`rows` 仍是 update count，不能把它当成主键。fixture 中已经有三行时，新 id 通常不是 1；真正的 key 在
`task.getId()`。还应按该 id 查询数据库，确认回填值指向刚写入的公开标识。

### 2. keyProperty 必须可写

MyBatis 要通过 `MetaObject` 写入 key，目标必须是可写属性；普通类即使没有 setter，也可能由字段写入器承接。
下面仍显式提供 `setId`，让回填合同对初学者一眼可见，其他输入保持构造后不变：

```java
/** 承载一条待写入任务以及数据库回填的主键。 */
public final class TaskWrite {
    private Long id;
    private final long teamId;
    private final String publicId;
    private final String title;
    private final String status;

    /** 创建尚未持久化的任务。 */
    public TaskWrite(long teamId, String publicId, String title, String status) {
        this.teamId = teamId;
        this.publicId = publicId;
        this.title = title;
        this.status = status;
    }

    /** @return 数据库主键 */
    public Long getId() { return id; }

    /** 接收数据库生成的主键。 */
    public void setId(Long id) { this.id = id; }

    /** @return 所属团队主键 */
    public long getTeamId() { return teamId; }

    /** @return 公开标识 */
    public String getPublicId() { return publicId; }

    /** @return 标题 */
    public String getTitle() { return title; }

    /** @return 状态 */
    public String getStatus() { return status; }
}
```

现代 Java 的 record 适合不可变查询投影，却没有 `setId`，不能直接承担这种回填合同。这不是 Java 8 兼容妥协；
现代线与兼容线都应该根据“数据库要修改对象属性”选择可写载体。

`keyProperty` 是 Java 属性路径，数据库列名属于 `keyColumn`。本课的 MySQL 单一 `id` 不需要写 `keyColumn`。
Mapper 有多个参数时，必须写出参数前缀，例如参数叫 `task`，目标就是 `task.id`，否则 MyBatis 无法确定该修改
哪个参数。

### 3. foreach 也能完成单条多行 INSERT

MySQL 支持一条 INSERT 写入多组 VALUES。`foreach` 负责每个对象的括号和组间逗号：

```xml
<insert id="insertAll" useGeneratedKeys="true" keyProperty="id">
  INSERT INTO tasks(team_id, public_id, title, status) VALUES
  <foreach collection="list" item="task" separator=",">
    (#{task.teamId}, #{task.publicId}, #{task.title}, #{task.status})
  </foreach>
</insert>
```

Mapper 方法只接收这一个列表。执行后除了检查 `rows == tasks.size()`，还要逐个检查对象获得了非空且互不相同
的 id。这里是一条 multi-row INSERT，不是 `ExecutorType.BATCH`；批处理会引入不同的执行和失败合同。

MyBatis 还提供 `<selectKey>`，可以在 INSERT 前后执行一条取 key 的查询。它适合 sequence 或 JDBC generated
keys 不可用的数据库。MySQL 主线已经能用 `useGeneratedKeys`，没有理由再用 `SELECT MAX(id)` 制造并发错误，
本课也不重复实现 `LAST_INSERT_ID()`。

## 三、if、set 与 trim 生成局部更新

### 1. if 只决定片段是否出现

PATCH 场景常常只修改传入的字段。参数对象把公开标识固定为必填，把候选新值保留为可空：

```java
/** 表示一次任务局部更新。 */
public final class TaskPatch {
    private final String publicId;
    private final String title;
    private final String status;

    /** 创建局部更新。 */
    public TaskPatch(String publicId, String title, String status) {
        this.publicId = publicId;
        this.title = title;
        this.status = status;
    }

    /** @return 任务公开标识 */
    public String getPublicId() { return publicId; }

    /** @return 新标题；不修改时为 null */
    public String getTitle() { return title; }

    /** @return 新状态；不修改时为 null */
    public String getStatus() { return status; }

    /** @return 是否没有任何待修改字段 */
    public boolean isEmpty() { return title == null && status == null; }
}
```

XML 用 `if` 判断每个片段是否输出，`set` 增加 `SET` 并移除最后一个多余逗号：

```xml
<update id="updatePatch">
  UPDATE tasks
  <set>
    <if test="title != null">title = #{title},</if>
    <if test="status != null">status = #{status},</if>
  </set>
  WHERE public_id = #{publicId}
</update>
```

`if` 使用 OGNL 读取 JavaBean 属性。它不会验证“至少有一项”，也不会自动保留旧值；传入 `null` 的含义是这段
赋值根本不进入 SQL。需要把数据库列更新为 SQL NULL 时，应设计另一个明确命令，不能和“未提供字段”共用
同一个 null。

### 2. set 只处理标点，不处理空 patch

所有候选字段都为 null 时，`set` 没有内容，最终 SQL 类似 `UPDATE tasks WHERE public_id = ?`，这是语法错误。
最清楚的合同是在调用 Mapper 前拒绝空 patch：

```java
/** 执行经过范围检查的任务写入。 */
public final class TaskWriteService {
    private final TaskMapper mapper;

    /** 创建任务写入服务。 */
    public TaskWriteService(TaskMapper mapper) { this.mapper = mapper; }

    /** 更新至少一个任务字段。 */
    public int updatePatch(TaskPatch patch) {
        if (patch.isEmpty()) {
            throw new IllegalArgumentException("patch 至少包含一个修改字段");
        }
        return mapper.updatePatch(patch);
    }
}
```

`set` 的等价基础形式是下面的 `trim`。`suffixOverrides` 删除末尾逗号，`prefix` 只在内部有内容时出现：

```xml
<trim prefix="SET" suffixOverrides=",">
  <if test="title != null">title = #{title},</if>
  <if test="status != null">status = #{status},</if>
</trim>
```

普通更新优先使用语义更直接的 `set`；只有修剪规则不同于标准 SET 时才直接使用 `trim`。

## 四、choose 与 where 固定写入范围

### 1. where 会在没有条件时消失

`where` 在内部有内容时增加 `WHERE`，并移除开头的 `AND` 或 `OR`。这对查询很方便，对写入必须谨慎：如果
所有条件都放进可选 `if`，空输入会生成没有 WHERE 的合法全表 UPDATE 或 DELETE。

范围条件应保持必选。下面的归档操作只允许“公开标识优先”或“团队范围”二选一；两者都没有时明确生成
永不成立的条件：

```xml
<update id="archiveByScope">
  UPDATE tasks SET status = 'ARCHIVED'
  <where>
    <choose>
      <when test="publicId != null">AND public_id = #{publicId}</when>
      <when test="teamId != null">AND team_id = #{teamId}</when>
      <otherwise>AND 1 = 0</otherwise>
    </choose>
  </where>
</update>
```

`choose` 只输出第一个成立的 `when`；它不同于多个彼此独立的 `if`。即使两个参数都有值，上面也只按 public ID
归档。`otherwise` 使空范围返回 0，又让 SQL 保持可观察和可测试，不会静默扩大范围。

### 2. trim 是 where 的可配置基础

标准 `where` 大致等价于：

```xml
<trim prefix="WHERE" prefixOverrides="AND |OR ">
  <!-- 条件片段 -->
</trim>
```

`prefixOverrides` 中的空白有意义。多数业务语句不需要自己重写这段规则；理解它的价值是能解释前导 AND 为什么
消失，也能在真正需要不同前缀时作局部定制。无论使用哪种元素，都要另外检查“内部完全没有内容”会发生什么。

## 五、foreach 的三种输入状态

### 1. 非空集合生成稳定分隔符

批量删除可以把每个公开标识继续作为绑定值：

```xml
<delete id="deleteByPublicIds">
  DELETE FROM tasks
  <choose>
    <when test="ids != null and !ids.isEmpty()">
      WHERE public_id IN
      <foreach collection="ids" item="id" open="(" separator="," close=")">
        #{id}
      </foreach>
    </when>
    <otherwise>WHERE 1 = 0</otherwise>
  </choose>
</delete>
```

`open` 和 `close` 只出现一次，`separator` 只出现在项目之间，不要在循环体内再手写逗号。List、其他 Iterable、
数组和 Map 都可以迭代；本课只让 Mapper 接收命名清楚的 `List<String>`。

### 2. null 和 empty 不是同一状态

精确行为如下：

| 输入 | MyBatis 3.5.19 | MyBatis 3.5.6 |
| --- | --- | --- |
| 非空集合 | 输出括号、项目和分隔符 | 相同 |
| 空集合 | 整个 foreach 不输出 | 相同 |
| null，未允许 nullable | 抛 `BuilderException` | 相同 |
| null，`nullable="true"` | 整个 foreach 不输出 | DTD 不接受该属性 |

`nullable` 从 MyBatis 3.5.9 才提供，只决定 null 集合是否报错；它不能修复空集合，也不会生成空括号。如果把
`WHERE id IN` 放在 foreach 外面，空集合就会留下不完整 SQL；如果把整个条件包进 `where`，空集合又可能让
WHERE 消失。

服务层先把 null 或 empty 定义为 0，并且不调用 Mapper；XML 的 `WHERE 1 = 0` 是防止 Mapper 被直接误用的
第二道保护。两条版本线共用这套合同，因此完整示例不使用 `nullable`。

**社区补充：** MyBatis issue #1881 在 3.5.1 与 MySQL 5.7.19 中记录了空集合让 foreach 连括号都不输出的
真实语法故障。本课已经按 3.5.19、3.5.6 源码和 MySQL 8.4 反馈复核：问题的关键不是数据库不接受空括号，
而是 MyBatis 根本没有输出 `open` 与 `close`。因此先定义空集合语义，不能只补一对括号。

## 六、数据绑定和 SQL 结构不能混用

### 1. 数据值使用参数绑定

`#{publicId}` 生成 JDBC 参数标记，输入值不会被解释成 SQL 语法。`${publicId}` 则把原字符串直接拼进语句，
引号、注释或表达式都可能改变 WHERE：

```xml
<!-- 错误：客户端字符串进入 SQL 结构 -->
<update id="unsafeArchive">
  UPDATE tasks SET status = 'ARCHIVED' WHERE public_id = '${publicId}'
</update>
```

输入 `' OR 1=1 -- ` 会把条件改成恒真。恢复为 `#{publicId}` 后，同一文本只会作为一个普通 public ID 值，返回
0 且数据不变。危险版本只能在每次重建的独立 schema 中复现，不能对共享数据库试验。

### 2. 列名不能用参数标记

表名、列名和排序方向属于 SQL 结构，`#{column}` 不能替代它们；但这也不授权接收 `${column}`。字段集合固定
时，最小方案是 Java enum 加显式 Mapper 方法：

```java
/** 表示允许更新的文本列。 */
public enum TaskTextColumn { TITLE, STATUS }

/** 更新 allowlist 中的一列。 */
public int updateText(TaskTextColumn column, String publicId, String value) {
    if (column == TaskTextColumn.TITLE) {
        return mapper.updateTitle(publicId, value);
    }
    return mapper.updateStatus(publicId, value);
}
```

两个 XML statement 的列名都是固定字面量，只有值使用 `#{value}`。客户端传来的任意 String 必须先解析为 enum；
解析失败就在 Mapper 前结束。列很多且组合复杂时可以用受控 provider，但不属于本课。

## 七、七个典型错误

:::pitfalls
### 把 insert 返回值当成生成主键

**触发条件：** INSERT 写入一行后，把 Mapper 返回的 `1` 赋给业务对象 id。

**原因：** Mapper 返回 JDBC update count；generated key 由另一条 JDBC API 取得并写入 `keyProperty`。

**后果：** 对象持有错误 id，后续按 id 查询可能读到 fixture 中的旧行。

**错误示例：**

```java
task.setId((long) mapper.insert(task));
```

**正确写法：**

```java
int rows = mapper.insert(task);
Long generatedId = task.getId();
```

**验证方式：** 先插入三行 fixture，再新增一行；正确版本得到 `rows=1`、非空 generatedId，并按该 id 查询到新 public ID。

### 把 record 用作 keyProperty 目标

**触发条件：** 参数是只有 `id()` 访问器的 record，XML 配置 `keyProperty="id"`。

**原因：** MyBatis 需要通过 `MetaObject` 写回可写属性；record 组件只有访问器，没有可写属性。

**后果：** INSERT 执行阶段报告找不到可写属性，调用方也无法获得 key。

**错误示例：**

```java
public record TaskWrite(Long id, String publicId) { }
```

**正确写法：**

```java
public final class TaskWrite {
    private Long id;
    /** 接收数据库生成主键。 */
    public void setId(Long id) { this.id = id; }
    /** @return 数据库主键 */
    public Long getId() { return id; }
}
```

**验证方式：** 对同一 INSERT 先运行 record 版本确认可写属性错误，再换成可写类；后者 rows 为 1 且 id 为正数。

### 让空 patch 进入 set

**触发条件：** title 和 status 都是 null，仍直接调用动态 update。

**原因：** set 只能修剪已输出的赋值；没有 if 成立时，它不会生成 SET。

**后果：** 数据库收到缺少 SET 子句的非法 UPDATE。

**错误示例：**

```java
return mapper.updatePatch(patch);
```

**正确写法：**

```java
if (patch.isEmpty()) {
    throw new IllegalArgumentException("patch 至少包含一个修改字段");
}
return mapper.updatePatch(patch);
```

**验证方式：** 空 patch 必须在 Mapper 日志出现 SQL 前失败；提供一个 title 后，同一方法返回 1 并读到新值。

### 把唯一 WHERE 放进可选 if

**触发条件：** publicId 为 null 时，`<where><if test="publicId != null">` 不输出任何条件。

**原因：** where 没有内容时会整体消失，不会替写操作生成安全条件。

**后果：** 合法 SQL 更新所有 fixture 行，row count 大于 1。

**错误示例：**

```xml
<where><if test="publicId != null">public_id = #{publicId}</if></where>
```

**正确写法：**

```xml
WHERE public_id = #{publicId}
```

**验证方式：** 在 fresh schema 用 null 运行错误版确认多行改变；重建 schema 后运行固定 WHERE，缺失标识返回 0。

### 让空集合直接进入 foreach

**触发条件：** `WHERE public_id IN` 后的 foreach 接收到空 List。

**原因：** 空集合让整个 foreach 不输出，包括 open 和 close。

**后果：** SQL 停在 `IN`，数据库报告语法错误。

**错误示例：**

```xml
WHERE public_id IN
<foreach collection="ids" item="id" open="(" separator="," close=")">#{id}</foreach>
```

**正确写法：**

```xml
<choose>
  <when test="ids != null and !ids.isEmpty()">WHERE public_id IN
    <foreach collection="ids" item="id" open="(" separator="," close=")">#{id}</foreach>
  </when>
  <otherwise>WHERE 1 = 0</otherwise>
</choose>
```

**验证方式：** 非空两项返回 2；空集合返回 0 且总行数不变，两条版本线都执行同一断言。

### 把 nullable 当成空集合修复

**触发条件：** 给 foreach 增加 `nullable="true"`，预期空 List 会生成合法 IN 条件，并把 XML 复制到 3.5.6。

**原因：** nullable 只处理 null，且属性从 3.5.9 才存在；空 List 仍不输出，3.5.6 DTD 也不接受该属性。

**后果：** 现代线仍生成残缺 SQL，兼容线在 Mapper 加载时失败。

**错误示例：**

```xml
<foreach collection="ids" item="id" nullable="true">#{id}</foreach>
```

**正确写法：**

```xml
<when test="ids != null and !ids.isEmpty()">
  <foreach collection="ids" item="id">#{id}</foreach>
</when>
```

**验证方式：** 3.5.19 分别传 null 和 empty，确认都不输出循环体；3.5.6 删除 nullable 后启动，并由 choose 保护空输入。

### 把客户端文本交给字符串替换

**触发条件：** publicId 或列名来自请求，XML 用 `${}` 原样拼接。

**原因：** 字符串替换不创建参数标记，也不转义 SQL 语法。

**后果：** 引号和注释可改变 WHERE，导致多行更新或注入。

**错误示例：**

```xml
WHERE public_id = '${publicId}'
```

**正确写法：**

```xml
WHERE public_id = #{publicId}
```

**验证方式：** 在 fresh schema 用 `' OR 1=1 -- ` 运行错误版确认多行改变；重建后同输入走绑定参数，返回 0 且数据不变。
:::

## 八、完成一条可运行写入链

### 1. 建立独立工程

下面的工程只复用前置课已经讲过的 DataSource、初始化脚本、Mapper 扫描和简单查询，不加入 Controller 或事务：

```text
teamflow-mybatis-write/
├── pom.xml
└── src/main/
    ├── java/dev/teamflow/TeamFlowApplication.java
    ├── java/dev/teamflow/write/TaskMapper.java
    ├── java/dev/teamflow/write/TaskPatch.java
    ├── java/dev/teamflow/write/TaskTextColumn.java
    ├── java/dev/teamflow/write/TaskWrite.java
    ├── java/dev/teamflow/write/TaskWriteService.java
    └── resources/
        ├── application.properties
        ├── data.sql
        ├── schema.sql
        └── mappers/TaskMapper.xml
```

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
  <groupId>dev.teamflow</groupId>
  <artifactId>teamflow-mybatis-write</artifactId>
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
mybatis.configuration.log-impl=org.apache.ibatis.logging.stdout.StdOutImpl
```

每次运行重新创建同一 fixture：

```sql
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS teams;
CREATE TABLE teams (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  public_id VARCHAR(32) NOT NULL UNIQUE
);
CREATE TABLE tasks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  public_id VARCHAR(32) NOT NULL UNIQUE,
  team_id BIGINT NOT NULL,
  title VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,
  CONSTRAINT fk_tasks_team FOREIGN KEY (team_id) REFERENCES teams(id)
);
```

```sql
INSERT INTO teams(public_id) VALUES ('TEAM-1'), ('TEAM-2');
INSERT INTO tasks(public_id, team_id, title, status) VALUES
  ('TASK-1', 1, 'Draft API', 'OPEN'),
  ('TASK-2', 1, 'Review SQL', 'OPEN'),
  ('TASK-3', 2, 'Prepare Demo', 'OPEN');
```

### 2. 写出 Mapper 和 XML

复用前文完整的 `TaskWrite`、`TaskPatch`，再创建 enum：

```java
package dev.teamflow.write;

/** 表示允许更新的文本列。 */
public enum TaskTextColumn { TITLE, STATUS }
```

`TaskMapper.java` 给多个简单参数显式命名：

```java
package dev.teamflow.write;

import java.util.List;
import org.apache.ibatis.annotations.Param;

/** 提供本课的任务写入与验收查询合同。 */
public interface TaskMapper {
    /** @return 写入行数 */
    int insert(TaskWrite task);

    /** @return 单条 SQL 写入的行数 */
    int insertAll(List<TaskWrite> tasks);

    /** @return 更新行数 */
    int updatePatch(TaskPatch patch);

    /** @return 固定标题列的更新行数 */
    int updateTitle(@Param("publicId") String publicId, @Param("value") String value);

    /** @return 固定状态列的更新行数 */
    int updateStatus(@Param("publicId") String publicId, @Param("value") String value);

    /** @return 互斥范围内的归档行数 */
    int archiveByScope(@Param("teamId") Long teamId, @Param("publicId") String publicId);

    /** @return 删除行数 */
    int deleteByPublicId(@Param("publicId") String publicId);

    /** @return 批量删除行数 */
    int deleteByPublicIds(@Param("ids") List<String> ids);

    /** @return 指定主键对应的公开标识 */
    String findPublicIdById(@Param("id") long id);

    /** @return 指定任务的标题 */
    String findTitle(@Param("publicId") String publicId);

    /** @return 指定任务的状态 */
    String findStatus(@Param("publicId") String publicId);

    /** @return 任务总数 */
    int countAll();
}
```

`TaskMapper.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
  "https://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="dev.teamflow.write.TaskMapper">
  <insert id="insert" useGeneratedKeys="true" keyProperty="id">
    INSERT INTO tasks(team_id, public_id, title, status)
    VALUES (#{teamId}, #{publicId}, #{title}, #{status})
  </insert>
  <insert id="insertAll" useGeneratedKeys="true" keyProperty="id">
    INSERT INTO tasks(team_id, public_id, title, status) VALUES
    <foreach collection="list" item="task" separator=",">
      (#{task.teamId}, #{task.publicId}, #{task.title}, #{task.status})
    </foreach>
  </insert>
  <update id="updatePatch">
    UPDATE tasks
    <set>
      <if test="title != null">title = #{title},</if>
      <if test="status != null">status = #{status},</if>
    </set>
    WHERE public_id = #{publicId}
  </update>
  <update id="updateTitle">
    UPDATE tasks SET title = #{value} WHERE public_id = #{publicId}
  </update>
  <update id="updateStatus">
    UPDATE tasks SET status = #{value} WHERE public_id = #{publicId}
  </update>
  <update id="archiveByScope">
    UPDATE tasks SET status = 'ARCHIVED'
    <where>
      <choose>
        <when test="publicId != null">AND public_id = #{publicId}</when>
        <when test="teamId != null">AND team_id = #{teamId}</when>
        <otherwise>AND 1 = 0</otherwise>
      </choose>
    </where>
  </update>
  <delete id="deleteByPublicId">
    DELETE FROM tasks WHERE public_id = #{publicId}
  </delete>
  <delete id="deleteByPublicIds">
    DELETE FROM tasks
    <choose>
      <when test="ids != null and !ids.isEmpty()">
        WHERE public_id IN
        <foreach collection="ids" item="id" open="(" separator="," close=")">#{id}</foreach>
      </when>
      <otherwise>WHERE 1 = 0</otherwise>
    </choose>
  </delete>
  <select id="findPublicIdById" resultType="string">
    SELECT public_id FROM tasks WHERE id = #{id}
  </select>
  <select id="findTitle" resultType="string">
    SELECT title FROM tasks WHERE public_id = #{publicId}
  </select>
  <select id="findStatus" resultType="string">
    SELECT status FROM tasks WHERE public_id = #{publicId}
  </select>
  <select id="countAll" resultType="int">SELECT COUNT(*) FROM tasks</select>
</mapper>
```

### 3. 在服务边界阻止空输入

完整的 `TaskWriteService.java` 不接收任意列名，也不隐藏准确行数：

```java
package dev.teamflow.write;

import java.util.List;

/** 执行经过范围检查的任务写入。 */
public final class TaskWriteService {
    private final TaskMapper mapper;

    /** 创建任务写入服务。 */
    public TaskWriteService(TaskMapper mapper) { this.mapper = mapper; }

    /** 更新至少一个任务字段。 */
    public int updatePatch(TaskPatch patch) {
        if (patch.isEmpty()) {
            throw new IllegalArgumentException("patch 至少包含一个修改字段");
        }
        return mapper.updatePatch(patch);
    }

    /** 使用固定 allowlist 更新文本列。 */
    public int updateText(TaskTextColumn column, String publicId, String value) {
        if (column == TaskTextColumn.TITLE) {
            return mapper.updateTitle(publicId, value);
        }
        return mapper.updateStatus(publicId, value);
    }

    /** 删除明确给出的公开标识。 */
    public int deleteByPublicIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return 0;
        }
        return mapper.deleteByPublicIds(ids);
    }
}
```

### 4. 顺序执行并核对状态

`TeamFlowApplication.java` 在每一步同时检查 row count 和数据库状态：

```java
package dev.teamflow;

import dev.teamflow.write.TaskMapper;
import dev.teamflow.write.TaskPatch;
import dev.teamflow.write.TaskTextColumn;
import dev.teamflow.write.TaskWrite;
import dev.teamflow.write.TaskWriteService;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;

/** 启动 TeamFlow 写入反馈环。 */
@SpringBootApplication
@MapperScan(basePackageClasses = TaskMapper.class)
public class TeamFlowApplication {
    /** 启动应用并在验证完成后退出。 */
    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(TeamFlowApplication.class, args);
        System.exit(SpringApplication.exit(context));
    }

    /** 执行本课的正向写入合同。 */
    @Bean
    ApplicationRunner verify(TaskMapper mapper) {
        return args -> {
            TaskWriteService service = new TaskWriteService(mapper);
            TaskWrite one = new TaskWrite(2L, "TASK-4", "Write XML", "OPEN");
            int oneRows = mapper.insert(one);
            require(oneRows == 1 && one.getId() != null, "单行 insert 合同失败");
            require("TASK-4".equals(mapper.findPublicIdById(one.getId())), "generated key 指向错误");
            System.out.println("INSERT_ONE rows=1 generatedIdPositive=" + (one.getId() > 0));

            List<TaskWrite> many = Arrays.asList(
                    new TaskWrite(2L, "TASK-5", "Check Keys", "OPEN"),
                    new TaskWrite(2L, "TASK-6", "Check Empty", "OPEN"));
            int manyRows = mapper.insertAll(many);
            boolean distinctKeys = many.get(0).getId() != null && many.get(1).getId() != null
                    && !many.get(0).getId().equals(many.get(1).getId());
            require(manyRows == 2 && distinctKeys, "多行 insert 合同失败");
            System.out.println("INSERT_MANY rows=2 keysAssigned=2 distinctKeys=true");

            int patchRows = service.updatePatch(new TaskPatch("TASK-1", "Review API", "DOING"));
            require(patchRows == 1 && "Review API".equals(mapper.findTitle("TASK-1"))
                    && "DOING".equals(mapper.findStatus("TASK-1")), "patch 合同失败");
            System.out.println("PATCH_ONE rows=1 title=Review API status=DOING");
            System.out.println("PATCH_MISSING rows="
                    + service.updatePatch(new TaskPatch("TASK-404", "Missing", null)));

            int allowlistRows = service.updateText(TaskTextColumn.TITLE, "TASK-3", "Ready");
            require(allowlistRows == 1 && "Ready".equals(mapper.findTitle("TASK-3")), "allowlist 失败");
            System.out.println("COLUMN_ALLOWLIST rows=1 title=Ready");

            int archived = mapper.archiveByScope(1L, null);
            require(archived == 2, "团队归档范围错误");
            System.out.println("ARCHIVE_TEAM rows=2");
            System.out.println("DELETE_ONE rows=" + mapper.deleteByPublicId("TASK-6"));
            System.out.println("DELETE_MISSING rows=" + mapper.deleteByPublicId("TASK-404"));
            int emptyRows = service.deleteByPublicIds(Collections.<String>emptyList());
            require(emptyRows == 0 && mapper.countAll() == 5, "空集合删除了数据");
            System.out.println("DELETE_EMPTY rows=0 remaining=5");
            System.out.println("MYSQL06_PASS");
        };
    }

    /** 在反馈不符合合同时终止运行。 */
    private static void require(boolean condition, String message) {
        if (!condition) {
            throw new IllegalStateException(message);
        }
    }
}
```

在独立 MySQL 8.4 网络中执行现代工程，预期业务输出为：

```text
INSERT_ONE rows=1 generatedIdPositive=true
INSERT_MANY rows=2 keysAssigned=2 distinctKeys=true
PATCH_ONE rows=1 title=Review API status=DOING
PATCH_MISSING rows=0
COLUMN_ALLOWLIST rows=1 title=Ready
ARCHIVE_TEAM rows=2
DELETE_ONE rows=1
DELETE_MISSING rows=0
DELETE_EMPTY rows=0 remaining=5
MYSQL06_PASS
```

## 九、Java 8 兼容线

### 1. XML 主体保持一致

本课从一开始就使用普通可写类，没有 record 或新的语言语法，因此 Java 8 复用全部 `.java`、schema、fixture 和
`TaskMapper.xml`。完整 XML 不写 `nullable`；null/empty 由服务与 choose 共同处理，两条线的业务输出一致。

兼容工程替换构建基线：parent 使用 Spring Boot `2.3.12.RELEASE`，`java.version` 使用 `1.8`，Starter 使用
`2.1.4`，运行时驱动坐标使用 `mysql:mysql-connector-java`。真实依赖树应解析到 MyBatis `3.5.6` 与
MyBatis-Spring `2.0.6`。初始化属性也要改成该版本支持的名称：

```properties
spring.datasource.initialization-mode=always
```

现代线的 `spring.sql.init.mode=always` 不能原样复制到 2.3；旧版不会识别它，外部 MySQL 上的 `schema.sql` 和
`data.sql` 因而不会自动执行。其余数据源、Mapper 和日志属性保持一致。

现代工程与兼容工程必须使用独立目录、JDK 和 Maven cache。分别核对 IntelliJ IDEA 的 Project SDK、模块 SDK、
Maven Runner JRE 与 POM 目标，不能只切换编辑器中的一个 SDK，也不能让两个工程共享 `target/`。

### 2. nullable 是框架版本差异

如果维护现代专用 XML，3.5.19 可以给 foreach 写 `nullable="true"` 或配置全局 `nullableOnForEach`。复制到 3.5.6
前必须删除它，否则 Mapper DTD 校验会在 SQL 执行前失败。本课不需要这项能力：允许 null 静默跳过循环仍无法
定义“写操作应该影响零行还是全部行”，显式 Java 合同和 `WHERE 1 = 0` 更清楚。

## 十、练习：批量恢复任务

:::exercise
### 用 foreach 恢复明确选中的任务

**要求：** 在完整工程中增加 `restoreByPublicIds`，把非空公开标识列表对应的状态更新为 `OPEN`。Mapper 返回
准确行数，XML 必须使用 `choose` 与 `foreach`，空集合走 `WHERE 1 = 0`；服务层对 null/empty 返回 0 且不调用
Mapper。不得接受 `${ids}`，不得省略 WHERE，也不得加入事务、批处理执行器或 MyBatis-Plus。

**验收：** fixture 启动后先按团队归档 `TASK-1`、`TASK-2`，再恢复这两个标识，输出
`RESTORE_SELECTED rows=2 task1=OPEN task2=OPEN`；传入 empty 输出 `RESTORE_EMPTY rows=0 remaining=3`。
Java 8 线输出完全相同。
:::

完整参考改动如下。在 `TaskMapper.java` 中增加方法：

```java
/** @return 恢复为 OPEN 的任务数量 */
int restoreByPublicIds(@Param("ids") List<String> ids);
```

在 `TaskMapper.xml` 中增加 statement：

```xml
<update id="restoreByPublicIds">
  UPDATE tasks SET status = 'OPEN'
  <choose>
    <when test="ids != null and !ids.isEmpty()">
      WHERE public_id IN
      <foreach collection="ids" item="id" open="(" separator="," close=")">#{id}</foreach>
    </when>
    <otherwise>WHERE 1 = 0</otherwise>
  </choose>
</update>
```

在 `TaskWriteService.java` 中增加方法：

```java
/** 恢复明确选中的任务。 */
public int restoreByPublicIds(List<String> ids) {
    if (ids == null || ids.isEmpty()) {
        return 0;
    }
    return mapper.restoreByPublicIds(ids);
}
```

最后在 fixture 为三行的 fresh 运行中增加验收代码：

```java
mapper.archiveByScope(1L, null);
int restored = service.restoreByPublicIds(Arrays.asList("TASK-1", "TASK-2"));
require(restored == 2 && "OPEN".equals(mapper.findStatus("TASK-1"))
        && "OPEN".equals(mapper.findStatus("TASK-2")), "批量恢复失败");
System.out.println("RESTORE_SELECTED rows=2 task1=OPEN task2=OPEN");
int empty = service.restoreByPublicIds(Collections.<String>emptyList());
require(empty == 0 && mapper.countAll() == 3, "空集合恢复改变了范围");
System.out.println("RESTORE_EMPTY rows=0 remaining=3");
```

预期输出：

```text
RESTORE_SELECTED rows=2 task1=OPEN task2=OPEN
RESTORE_EMPTY rows=0 remaining=3
```

现在可以用四个问题检查自己：Mapper 返回值和生成主键分别在哪里？所有 patch 字段为空时由谁停止调用？
集合为空时最终 SQL 是否仍有安全 WHERE？每一个来自请求的数据值是否都通过 `#{}` 进入 PreparedStatement？
四个答案都能从代码和日志中直接观察，才算真正掌握了本课的写入合同。
