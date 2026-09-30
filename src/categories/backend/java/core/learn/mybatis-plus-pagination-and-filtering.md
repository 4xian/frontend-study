---
id: backend.java.learn.intermediate.mybatis-plus-pagination-and-filtering
type: lesson
title: 分页与筛选
summary: 用 MyBatis-Plus 分页插件、可选 Lambda 条件和确定性排序，把受控的页码、页大小与筛选条件转换成可观察的 MySQL 查询。
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 180
prerequisites:
  - backend.java.learn.intermediate.mybatis-plus
objectives:
  - 配置 PaginationInnerInterceptor，并解释它为什么必须位于其他 SQL 改写插件之后。
  - 使用 Page 与 BaseMapper.selectPage 读取 current、size、records、total 和 pages。
  - 在进入 Mapper 前收紧页码与页大小，并用 maxLimit 设置持久化层的最后一道上限。
  - 使用 LambdaQueryWrapper 组合可选状态、名称前缀与负责人筛选，不把空白输入变成无意条件。
  - 用后端白名单选择排序，并始终追加唯一主键作为最后排序键。
  - 区分默认 overflow=false、overflow=true 与 searchCount=false 的可观察结果。
  - 从 count SQL、列表 SQL 和分页元数据共同判断查询是否正确。
  - 识别关联查询自动 count 优化、动态排序和直接绑定 Page 的风险边界。
recap:
  - MyBatis-Plus 分页由 PaginationInnerInterceptor 改写 SQL，单一数据库项目应显式设置 DbType。
  - 3.5.17 的分页解析模块需要单独引入，3.4.2 则由 extension 传递 JSQLParser。
  - Page 同时承载输入与输出；selectPage 会把 records 和 total 写回传入对象并返回该对象。
  - 页码和页大小应在应用边界校正，maxLimit 只是持久化层的资源保护，不替代输入合同。
  - 可选筛选先规范化空白，再用 condition 参数决定是否生成 WHERE 条件。
  - OFFSET 分页必须有确定性 ORDER BY；非唯一业务列之后要追加唯一主键。
  - 默认 overflow=false 会保留越界页码并返回空 records；true 会把 current 重置为 1。
  - searchCount=false 不执行总数查询，total 和 pages 不能再用来判断是否有下一页。
  - 自动 count 优化不等于业务正确性证明，复杂关联必须核对生成 SQL 与真实总数。
  - Page 和 OrderItem 不是外部请求 DTO，客户端排序值只能映射到后端固定白名单。
related:
  - backend.java.learn.intermediate.mybatis-plus
  - backend.java.learn.intermediate.sql-queries
tags:
  - MyBatis-Plus
  - PaginationInnerInterceptor
  - Page
  - LambdaQueryWrapper
  - MySQL
  - 分页
  - 筛选
appliesTo: JDK 25、Spring Boot 4.1.0、MyBatis-Plus 3.5.17、JSQLParser 5.2 与 MySQL 8.4 LTS；Java 8、Spring Boot 2.3.12.RELEASE、MyBatis-Plus 3.4.2 与 JSQLParser 4.0 兼容补充
verifiedAt: 2026-08-20
sources:
  - id: mybatis-plus-pagination-plugin
    title: MyBatis-Plus Pagination Plugin
    url: https://baomidou.com/en/plugins/pagination/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis-Plus 3.5.x
    claims:
      - PaginationInnerInterceptor 的配置方式、插件顺序与 DbType 建议
      - overflow 和 maxLimit 的默认值与职责
      - Page 的 records、total、size、current、orders、searchCount 与 count 优化属性
      - left join 可能在自动 count 优化中被移除，关联 SQL 应使用明确别名
  - id: mybatis-plus-install
    title: MyBatis-Plus Installation
    url: https://baomidou.com/en/getting-started/install/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis-Plus 3.5.17
    claims:
      - 从 3.5.9 起分页插件所需 JSQLParser 支持需要单独引入
  - id: mybatis-plus-base-mapper-3517
    title: MyBatis-Plus BaseMapper Source 3.5.17
    url: https://raw.githubusercontent.com/baomidou/mybatis-plus/v3.5.17/mybatis-plus-core/src/main/java/com/baomidou/mybatisplus/core/mapper/BaseMapper.java
    sourceOrigin: official
    sourceType: source-code
    appliesTo: MyBatis-Plus 3.5.17
    claims:
      - selectPage 把 selectList 的结果写入传入 Page 并返回同一对象
  - id: mybatis-plus-page-3517
    title: MyBatis-Plus Page Source 3.5.17
    url: https://raw.githubusercontent.com/baomidou/mybatis-plus/v3.5.17/mybatis-plus-extension/src/main/java/com/baomidou/mybatisplus/extension/plugins/pagination/Page.java
    sourceOrigin: official
    sourceType: source-code
    appliesTo: MyBatis-Plus 3.5.17
    claims:
      - Page 的构造器、分页元数据、searchCount 与 maxLimit 行为
      - Page.of 是新版本便利 API，不用于本课双版本共同代码
  - id: mybatis-plus-pagination-interceptor-3517
    title: MyBatis-Plus PaginationInnerInterceptor Source 3.5.17
    url: https://raw.githubusercontent.com/baomidou/mybatis-plus/v3.5.17/mybatis-plus-jsqlparser-support/mybatis-plus-jsqlparser/src/main/java/com/baomidou/mybatisplus/extension/plugins/inner/PaginationInnerInterceptor.java
    sourceOrigin: official
    sourceType: source-code
    appliesTo: MyBatis-Plus 3.5.17
    claims:
      - 默认越界页中止列表查询，overflow=true 时 current 重置为 1
      - Page 级 maxLimit 优先于插件级 maxLimit
      - 有上限时负 size 也会被收紧到 limit
  - id: mybatis-plus-boot4-starter-3517
    title: MyBatis-Plus Spring Boot 4 Starter POM 3.5.17
    url: https://repo.maven.apache.org/maven2/com/baomidou/mybatis-plus-spring-boot4-starter/3.5.17/mybatis-plus-spring-boot4-starter-3.5.17.pom
    sourceOrigin: official
    sourceType: source-code
    appliesTo: MyBatis-Plus 3.5.17
    claims:
      - Boot 4 Starter 本身不传递 mybatis-plus-jsqlparser
  - id: mybatis-plus-jsqlparser-3517
    title: MyBatis-Plus JSQLParser POM 3.5.17
    url: https://repo.maven.apache.org/maven2/com/baomidou/mybatis-plus-jsqlparser/3.5.17/mybatis-plus-jsqlparser-3.5.17.pom
    sourceOrigin: official
    sourceType: source-code
    appliesTo: MyBatis-Plus 3.5.17
    claims:
      - 分页解析模块组合 JSQLParser 5.2 与 MyBatis-Plus extension
  - id: mybatis-plus-pagination-interceptor-342
    title: MyBatis-Plus PaginationInnerInterceptor Source 3.4.2
    url: https://raw.githubusercontent.com/baomidou/mybatis-plus/v3.4.2/mybatis-plus-extension/src/main/java/com/baomidou/mybatisplus/extension/plugins/inner/PaginationInnerInterceptor.java
    sourceOrigin: official
    sourceType: source-code
    appliesTo: MyBatis-Plus 3.4.2
    claims:
      - 3.4.2 的默认越界、overflow 与正数 maxLimit 行为和现代线一致
      - 3.4.2 遇到负 size 会直接跳过分页 SQL，不应用 maxLimit
  - id: mybatis-plus-boot-starter-342
    title: MyBatis-Plus Spring Boot Starter POM 3.4.2
    url: https://repo.maven.apache.org/maven2/com/baomidou/mybatis-plus-boot-starter/3.4.2/mybatis-plus-boot-starter-3.4.2.pom
    sourceOrigin: official
    sourceType: source-code
    appliesTo: MyBatis-Plus 3.4.2
    claims:
      - Java 8 Starter 通过 MyBatis-Plus extension 传递 JSQLParser 4.0
  - id: mysql-limit-optimization
    title: MySQL 8.4 LIMIT Query Optimization
    url: https://dev.mysql.com/doc/refman/8.4/en/limit-optimization.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - LIMIT 可能改变优化器执行选择
      - ORDER BY 列存在重复值时，带 LIMIT 与不带 LIMIT 的行顺序可能不同
  - id: mysql-pattern-matching
    title: MySQL 8.4 Pattern Matching
    url: https://dev.mysql.com/doc/refman/8.4/en/pattern-matching.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MySQL 8.4
    claims:
      - LIKE 中百分号匹配任意数量字符，下划线匹配单个字符
      - 前缀匹配使用固定文本后接百分号
  - id: mybatis-plus-page-order-security-5756
    title: MyBatis-Plus Issue 5756 Page Order Input
    url: https://github.com/baomidou/mybatis-plus/issues/5756
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: MyBatis-Plus 3.5.3.1 至 3.5.4 的历史复现
    claims:
      - 直接把请求反序列化为含任意 OrderItem 列名的 Page 曾产生可复现的排序注入
      - 后端应把外部排序选项映射为固定列，而不是信任请求中的列或表达式
  - id: mybatis-plus-count-join-5919
    title: MyBatis-Plus Issue 5919 Count Join Optimization
    url: https://github.com/baomidou/mybatis-plus/issues/5919
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: MyBatis-Plus 3.5.5 的关联 count 讨论
    claims:
      - 一对多关联可能让移除 join 后的 count 改变业务语义
      - 复杂关联分页需要核对 count SQL，必要时关闭 join count 优化或提供自定义 count
---

# 分页与筛选

上一课已经能用 `BaseMapper` 和 Lambda Wrapper 完成单表 CRUD 与条件查询，但列表一旦增长，就不能把全部记录
读入 Java 再切片。分页必须让数据库只返回当前窗口，同时仍能说明筛选后的总数、页数与稳定顺序。

本课继续使用 `project_records`。只学习 OFFSET 分页与同一条查询上的可选筛选；事务留给下一课，完整持久化
项目留给再下一课，索引设计与执行计划留给数据库优化课程。Controller、统一响应和游标 token 也不进入本课。

## 一、先看清一次分页查询

### 1. 分页插件改写的是 Mapper SQL

调用 `mapper.selectPage(page, wrapper)` 时，`BaseMapper` 没有把全部结果读入内存。分页插件会在 MyBatis 执行 SQL
前找到 `IPage` 参数，并完成两条不同职责的查询：

```text
Page(current=2, size=20) + Wrapper
              |
              v
      SELECT COUNT(*) ... WHERE ...
              |
              +--> total、pages
              |
              v
      SELECT ... WHERE ... ORDER BY ... LIMIT 20 OFFSET 20
              |
              +--> records
```

默认会先查总数。总数大于零且页码没有越界时，插件再生成当前页 SQL；因此日志中出现两条 SELECT 是正常合同，
不是 Mapper 被调用了两次。

### 2. Page 既是输入也是输出

创建分页对象时只给出请求参数：

```java
Page<ProjectRecord> page = new Page<>(2, 20);
```

查询结束后，同一个对象承载结果：

| 属性 | 查询前 | 查询后职责 |
| --- | --- | --- |
| `current` | 请求第几页，从 1 开始 | 实际页码；`overflow=true` 时可能被改为 1 |
| `size` | 请求每页条数 | 实际每页上限；可能被 `maxLimit` 收紧 |
| `records` | 空列表 | 当前页记录 |
| `total` | 0 | 筛选后的总记录数 |
| `pages` | 由 total 与 size 计算 | 总页数 |

`3.5.17` 的 `BaseMapper.selectPage` 会把 `selectList` 结果写回传入对象并返回它：

```java
Page<ProjectRecord> requested = new Page<>(2, 20);
Page<ProjectRecord> returned = mapper.selectPage(requested, query);
boolean sameInstance = requested == returned;
```

`sameInstance` 为 `true`。不要额外创建一个只有 records 的响应后丢掉 `total`，也不要把 `Page` 本身直接暴露为
外部请求 DTO；输入边界和持久化对象的职责不同。

## 二、安装并配置分页插件

### 1. 现代线必须补充分页解析模块

上一课的 Boot 4 Starter 能运行通用 CRUD，但 `3.5.17` 不再从 Starter 传递分页所需的 SQL 解析模块。打开
`pom.xml`，在原 Starter 后加入：

```xml
<dependency>
  <groupId>com.baomidou</groupId>
  <artifactId>mybatis-plus-jsqlparser</artifactId>
  <version>3.5.17</version>
</dependency>
```

真实依赖树应包含：

```text
mybatis-plus-jsqlparser:3.5.17
+- jsqlparser:5.2
\- mybatis-plus-jsqlparser-common:3.5.17
   \- mybatis-plus-extension:3.5.17
```

如果只复制配置类却漏掉该依赖，`PaginationInnerInterceptor` 所在分页能力不能完整装配。依赖是否存在应通过
`mvn dependency:tree` 和真实启动共同确认，不能只看 IDE 是否自动补全类名。

### 2. 把分页拦截器注册为 Bean

新建 `persistence/MybatisPlusConfig.java`：

```java
package com.example.teamflow.persistence;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 配置 MyBatis-Plus SQL 拦截器。
 */
@Configuration
public class MybatisPlusConfig {
    /**
     * 注册 MySQL 分页并限制单页最多 50 条。
     *
     * @return MyBatis-Plus 拦截器链
     */
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

单一数据库项目显式传入 `DbType.MYSQL`，让方言选择清楚可查。`overflow=false` 是默认值，这里仍显式写出课程
合同；`maxLimit=50` 是持久化层资源上限。

以后若加入租户、数据权限或其他会改写 SQL 的插件，分页插件应放在最后，使 count 与 LIMIT 基于已经完成的 SQL
生成。本课只有一个 inner interceptor，但顺序约束仍要从一开始固定。

## 三、先收紧页码与页大小

### 1. Page 不是输入校验器

外部请求可能给出 `current=0`、`size=0` 或极大值。不能依赖不同版本的内部构造器与负数分支替应用定义合同。
在进入 Mapper 前统一成合法区间：

```java
/**
 * 把页码收紧到从 1 开始。
 *
 * @param current 原始页码
 * @return 合法页码
 */
private static long normalizeCurrent(long current) {
    return Math.max(current, 1L);
}

/**
 * 把页大小收紧到 1 至 50。
 *
 * @param size 原始页大小
 * @return 合法页大小
 */
private static long normalizeSize(long size) {
    return Math.min(Math.max(size, 1L), 50L);
}
```

这里选择“收紧”而不是抛错，是本课命令行示例的明确策略。真实 API 也可以拒绝非法值，但必须在请求合同中保持
一致；不能有的入口拒绝、有的入口静默改写。

### 2. maxLimit 是最后一道上限

即使应用已经把 size 限制到 50，插件仍保留相同 `maxLimit`。它防止新的调用路径绕过服务边界，但不替代输入
校验：调用方若请求 500，响应应该解释最终 size 是 50，而不是悄悄返回一个看似 500 的分页对象。

Page 自身还可以设置更小的上限，并优先于插件全局值：

```java
Page<ProjectRecord> page = new Page<>(1, 40);
page.setMaxLimit(20L);
```

查询后 `page.getSize()` 为 20。不要用负 size 表达“查询全部”；`3.5.17` 在存在上限时会把负 size 收紧到上限，
`3.4.2` 则会直接跳过分页 SQL。双版本代码应只传入已经校正的正数。

## 四、组合可选筛选条件

### 1. 先把空白统一成未提供

状态、名称前缀和负责人邮箱都是可选筛选。先规范化字符串：

```java
/**
 * 把空白文本规范化为未提供。
 *
 * @param value 原始文本
 * @return 清理后的文本或 null
 */
private static String normalize(String value) {
    if (value == null) {
        return null;
    }
    String trimmed = value.trim();
    return trimmed.isEmpty() ? null : trimmed;
}
```

这样 `null`、空字符串和全空格都表示“不筛选”。如果业务需要查真正的空字符串，那是另一份合同，不能与
“未提供”共用同一个值。

### 2. condition 决定条件是否进入 SQL

```java
String status = normalize(query.getStatus());
String namePrefix = normalize(query.getNamePrefix());
String ownerEmail = normalize(query.getOwnerEmail());

LambdaQueryWrapper<ProjectRecord> wrapper =
        Wrappers.<ProjectRecord>lambdaQuery()
                .eq(status != null, ProjectRecord::getStatus, status)
                .likeRight(namePrefix != null, ProjectRecord::getName, namePrefix)
                .eq(ownerEmail != null, ProjectRecord::getOwnerEmail, ownerEmail);
```

`condition=false` 时对应方法不会向 SQL 添加条件。`likeRight(name, "协作")` 生成前缀匹配，语义接近
`display_name LIKE '协作%'`；值仍通过 JDBC 参数绑定。

MySQL 的 `%` 和 `_` 在 LIKE 中有通配语义。如果需求要求把用户输入中的这两个字符当普通字符，必须定义转义
规则并用真实数据库验证。本课输入只使用不含通配符的受控前缀，不把模糊匹配扩张成转义专题。

### 3. 筛选与分页必须属于同一条查询

错误做法是先查一页，再在 Java 中删除不符合状态的记录。那会导致当前页不足 size，`total` 仍表示未筛选总数，
后续页也可能漏项。正确顺序是让 Wrapper 参与 count 与列表 SQL：

```text
输入规范化 -> Wrapper WHERE -> count -> ORDER BY + LIMIT -> Page 输出
```

## 五、建立稳定且受控的排序

### 1. OFFSET 分页必须有确定性顺序

没有 `ORDER BY` 时，数据库不承诺行顺序。只按可重复字段排序也不够：多行拥有同一个状态或时间时，MySQL 在
不同执行计划下可以交换这些并列行，造成上一页重复、下一页漏项。

固定状态排序后追加唯一主键：

```java
wrapper.orderByAsc(ProjectRecord::getStatus)
        .orderByAsc(ProjectRecord::getId);
```

`project_id` 是主键，因此 `(project_status, project_id)` 对结果集形成确定性总序。主键不是为了改变业务排序，
而是在业务值相同时给出唯一的最后裁决。

### 2. 动态排序只能选择白名单

客户端可以请求 `code` 或 `status`，但不能提供数据库列名。后端把有限选项映射到方法引用：

```java
/**
 * 把排序选项映射为固定属性，并追加唯一主键。
 *
 * @param wrapper 当前查询构造器
 * @param sort 排序选项
 */
private static void applySort(
        LambdaQueryWrapper<ProjectRecord> wrapper,
        String sort) {
    if ("code".equals(sort)) {
        wrapper.orderByAsc(ProjectRecord::getCode)
                .orderByAsc(ProjectRecord::getId);
        return;
    }
    wrapper.orderByAsc(ProjectRecord::getStatus)
            .orderByAsc(ProjectRecord::getId);
}
```

项目编码已有 UNIQUE 约束，但仍保留主键兜底，使所有排序分支使用同一个可审查结构。不要把请求反序列化成
`Page.orders`，也不要把请求字符串传给 `OrderItem`、`${}` 或 SQL 表达式入口。

## 六、解释 count、越界页与关闭总数

### 1. 默认越界页返回空记录

假设筛选后 `total=4`、`size=2`，有效页数为 2。请求第 9 页且 `overflow=false` 时：

```text
current=9 size=2 total=4 pages=2 records=[]
```

插件在 count 后发现页码超过 pages，不再执行列表查询。它保留 `current=9`，让调用方看见自己请求的是越界页。
这通常比静默返回第一页更适合 API，因为空列表与分页元数据能明确表达边界。

### 2. overflow=true 会回到第一页

如果配置：

```java
pagination.setOverflow(true);
```

同一个第 9 页请求会变成：

```text
current=1 size=2 total=4 pages=2 records=[第一页记录]
```

这不是“返回最后一页”，而是重置为第 1 页。只有产品合同明确接受这种行为时才开启，否则用户可能在没有提示的
情况下看到重复的第一页。

### 3. searchCount=false 会改变可用元数据

```java
Page<ProjectRecord> page = new Page<>(1, 20, false);
mapper.selectPage(page, wrapper);
```

此时不执行 count，`records` 仍有当前页数据，但 `total=0`、`pages=0`。因此不能再用 `getPages()`、`hasNext()`
或 total 判断是否还有下一页。关闭 count 适合明确不需要总数的流程，但“多取一条判断下一页”是另一种分页合同，
不在本课手工实现。

### 4. 自动 count 优化必须观察结果

简单单表查询可以让插件自动生成 count。对于一对多 `left join`，移除 join 可能改变行数语义；包含子查询、
分组或参数的复杂 SQL 也可能超出自动优化能安全判断的范围。

处理复杂关联时按以下顺序验证：

1. 在日志中复制真实 count SQL。
2. 用相同筛选直接执行原查询与 count，比较业务实体数而不是只比较物理行数。
3. 若自动 join 优化改变语义，调用 `page.setOptimizeJoinOfCountSql(false)`。
4. 若 count 本身需要独立语义，为 XML 分页方法提供经过验证的自定义 count statement。

本课单表示例不需要关闭优化，也不提前实现关联分页。

## 七、集中排查分页误用

**社区补充：** MyBatis-Plus `3.5.3.1` 至 `3.5.4` 曾有直接绑定 `Page.orders` 后接受任意排序表达式的
可复现案例；`3.5.5` 的关联 count 讨论也证明自动移除 join 可能改变计数。两项均已用官方 API 合同和本课
双版本项目反向核验，只采用“外部排序映射为固定属性”和“复杂关联必须核对 count”的工程边界。

:::pitfalls
### 没有唯一排序键就分页

**触发条件：** 查询只按状态或创建时间排序，而这些列存在重复值。

**原因：** ORDER BY 对并列行没有完整顺序，LIMIT 可以让数据库选择不同执行路径。

**后果：** 相邻页可能重复或漏掉记录，数据未修改时也难以复现。

**错误示例：**

```java
wrapper.orderByAsc(ProjectRecord::getStatus);
```

**正确写法：**

```java
wrapper.orderByAsc(ProjectRecord::getStatus)
        .orderByAsc(ProjectRecord::getId);
```

**验证方式：** 准备多行相同状态，连续查询前两页，确认 ID 不重复且合并结果严格符合完整 ORDER BY。

### 直接接收客户端 Page 与 orders

**触发条件：** Controller 把请求体直接反序列化为 `Page`，再原样交给 Mapper。

**原因：** orders 中的 column 属于 SQL 结构，不是可以靠 JDBC 占位符绑定的普通值。

**后果：** 客户端能够改变排序表达式，历史版本中已有可复现的排序注入案例。

**错误示例：**

```java
mapper.selectPage(requestPage, wrapper);
```

**正确写法：**

```java
applySort(wrapper, request.getSort());
Page<ProjectRecord> page = new Page<>(current, size);
```

**验证方式：** 请求任意列名或 SQL 片段时确认文本不会进入 SQL，未知值按既定策略回退；只有 `code`、
`status` 等固定选项会映射到后端方法引用。

### 关闭 count 后仍读取 pages

**触发条件：** 使用 `new Page<>(current, size, false)`，响应仍用 `getPages()` 计算下一页。

**原因：** 没有 count 时 total 保持初始值，pages 也没有总数依据。

**后果：** 当前页有数据却显示总页数为 0，或者错误判断已经结束。

**错误示例：**

```java
boolean hasMore = page.getCurrent() < page.getPages();
```

**正确写法：**

```java
Page<ProjectRecord> page = new Page<>(current, size, true);
```

**验证方式：** 对同一筛选分别开启和关闭 count，确认关闭时没有 count SQL，且调用方不再承诺 total、pages 或
hasMore。

### 默认相信自动关联 count

**触发条件：** 自定义 SQL 包含一对多 left join，却从不检查插件生成的 count SQL。

**原因：** 自动优化可能移除未参与 WHERE 的 join，但该 join 仍可能改变结果行数。

**后果：** records 看似正确，total 与 pages 却偏小或偏大。

**错误示例：**

```java
mapper.selectPage(page, wrapper);
```

**正确写法：**

```java
page.setOptimizeJoinOfCountSql(false);
mapper.selectPage(page, wrapper);
```

**验证方式：** 在真实关联数据上分别执行原查询、自动 count 与关闭 join 优化后的 count，确认采用版本与业务实体
计数一致。
:::

## 八、运行完整的现代版项目

### 1. 修改上一课工程

继续使用 `teamflow-mybatis-plus/`，不要重复创建已有 Mapper 和实体。修改后的关键目录为：

```text
teamflow-mybatis-plus/
├── pom.xml
└── src/main/
    ├── java/com/example/teamflow/
    │   ├── TeamFlowApplication.java
    │   └── persistence/
    │       ├── MybatisPlusConfig.java
    │       ├── ProjectCatalog.java
    │       ├── ProjectPageQuery.java
    │       ├── ProjectRecord.java
    │       └── ProjectRecordMapper.java
    └── resources/
        ├── application.properties
        └── schema.sql
```

在上一课 POM 中加入第二章的 `mybatis-plus-jsqlparser:3.5.17`。原 Boot 4 Starter、MySQL 驱动、构建插件和
`project.build.sourceEncoding` 保持不变。

`schema.sql` 改为准备五条可分页数据：

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

INSERT INTO project_records
  (project_code, display_name, owner_email, project_status)
VALUES
  ('TF-101', '协作门户', 'jian@example.test', 'ACTIVE'),
  ('TF-102', '协作 API', 'ops@example.test', 'ACTIVE'),
  ('TF-103', '数据迁移', 'jian@example.test', 'PAUSED'),
  ('TF-104', '协作任务', 'ops@example.test', 'ACTIVE'),
  ('TF-105', '协作报表', 'jian@example.test', 'ACTIVE');
```

保留上一课 `ProjectRecord.java` 和 `ProjectRecordMapper.java`，不需要新增字段或 Mapper 方法。加入第二章完整的
`MybatisPlusConfig.java`，但把示例 `maxLimit` 改为 `3L`，以便从输出直接观察上限。

### 2. 定义受控的分页输入

新建 `ProjectPageQuery.java`：

```java
package com.example.teamflow.persistence;

/**
 * 描述项目列表允许使用的分页与筛选输入。
 */
public class ProjectPageQuery {
    private final long current;
    private final long size;
    private final String status;
    private final String namePrefix;
    private final String ownerEmail;
    private final String sort;

    /**
     * 创建分页查询并规范化页码、页大小和可选文本。
     *
     * @param current 请求页码
     * @param size 请求页大小
     * @param status 可选状态
     * @param namePrefix 可选名称前缀
     * @param ownerEmail 可选负责人邮箱
     * @param sort 排序选项
     */
    public ProjectPageQuery(
            long current,
            long size,
            String status,
            String namePrefix,
            String ownerEmail,
            String sort) {
        this.current = Math.max(current, 1L);
        this.size = Math.min(Math.max(size, 1L), 3L);
        this.status = normalize(status);
        this.namePrefix = normalize(namePrefix);
        this.ownerEmail = normalize(ownerEmail);
        this.sort = "code".equals(sort) ? "code" : "status";
    }

    /** @return 从 1 开始的页码 */
    public long getCurrent() {
        return current;
    }

    /** @return 已收紧的页大小 */
    public long getSize() {
        return size;
    }

    /** @return 可选状态 */
    public String getStatus() {
        return status;
    }

    /** @return 可选名称前缀 */
    public String getNamePrefix() {
        return namePrefix;
    }

    /** @return 可选负责人邮箱 */
    public String getOwnerEmail() {
        return ownerEmail;
    }

    /** @return 后端支持的排序选项 */
    public String getSort() {
        return sort;
    }

    /**
     * 把空白文本规范化为未提供。
     *
     * @param value 原始文本
     * @return 清理后的文本或 null
     */
    private static String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
```

示例上限设为 3 只是为了缩短输出；真实业务可把应用上限和插件上限同时改为 50。排序字段仍只有两个固定值，
不存在客户端列名入口。

### 3. 在持久化边界组合查询

打开上一课的 `ProjectCatalog.java`，保留 `findByCodes` 和 `findOneByCode`，再加入 `findPage`：

```java
package com.example.teamflow.persistence;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import java.util.Collections;
import java.util.List;
import org.springframework.stereotype.Repository;

/**
 * 把受控的项目查询合同转换为 MyBatis-Plus 条件。
 */
@Repository
public class ProjectCatalog {
    private final ProjectRecordMapper mapper;

    /**
     * 注入项目记录 Mapper。
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

    /**
     * 按可选条件与固定排序查询一页项目。
     *
     * @param query 分页查询输入
     * @return 带总数和当前页记录的 Page
     */
    public Page<ProjectRecord> findPage(ProjectPageQuery query) {
        LambdaQueryWrapper<ProjectRecord> wrapper =
                Wrappers.<ProjectRecord>lambdaQuery()
                        .eq(
                                query.getStatus() != null,
                                ProjectRecord::getStatus,
                                query.getStatus())
                        .likeRight(
                                query.getNamePrefix() != null,
                                ProjectRecord::getName,
                                query.getNamePrefix())
                        .eq(
                                query.getOwnerEmail() != null,
                                ProjectRecord::getOwnerEmail,
                                query.getOwnerEmail());
        applySort(wrapper, query.getSort());
        Page<ProjectRecord> page = new Page<>(query.getCurrent(), query.getSize());
        return mapper.selectPage(page, wrapper);
    }

    /**
     * 把排序选项映射为固定属性，并追加唯一主键。
     *
     * @param wrapper 当前查询构造器
     * @param sort 已规范化的排序选项
     */
    private static void applySort(
            LambdaQueryWrapper<ProjectRecord> wrapper,
            String sort) {
        if ("code".equals(sort)) {
            wrapper.orderByAsc(ProjectRecord::getCode)
                    .orderByAsc(ProjectRecord::getId);
            return;
        }
        wrapper.orderByAsc(ProjectRecord::getStatus)
                .orderByAsc(ProjectRecord::getId);
    }
}
```

每次调用都新建 Wrapper 和 Page，不跨请求共享可变查询状态。

### 4. 用入口打印分页合同

把 `TeamFlowApplication.java` 改为：

```java
package com.example.teamflow;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.teamflow.persistence.ProjectCatalog;
import com.example.teamflow.persistence.ProjectPageQuery;
import com.example.teamflow.persistence.ProjectRecord;
import java.util.List;
import java.util.stream.Collectors;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 运行项目分页、筛选与稳定排序反馈环。
 */
@SpringBootApplication
@MapperScan("com.example.teamflow.persistence")
public class TeamFlowApplication implements CommandLineRunner {
    private final ProjectCatalog catalog;

    /**
     * 注入项目目录。
     *
     * @param catalog 项目分页查询入口
     */
    public TeamFlowApplication(ProjectCatalog catalog) {
        this.catalog = catalog;
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
     * 查询两页筛选结果、越界页和收紧后的大页请求。
     *
     * @param args 命令行参数
     */
    @Override
    public void run(String... args) {
        printPage(
                "FIRST",
                catalog.findPage(new ProjectPageQuery(
                        1, 2, "ACTIVE", "协作", null, "code")));
        printPage(
                "SECOND",
                catalog.findPage(new ProjectPageQuery(
                        2, 2, "ACTIVE", "协作", null, "code")));
        printPage(
                "OVERFLOW_FALSE",
                catalog.findPage(new ProjectPageQuery(
                        9, 2, "ACTIVE", "协作", null, "code")));
        printPage(
                "CAPPED",
                catalog.findPage(new ProjectPageQuery(
                        1, 99, null, null, null, "status")));
    }

    /**
     * 打印一页的关键元数据与项目编码。
     *
     * @param label 场景标签
     * @param page 查询结果
     */
    private static void printPage(String label, Page<ProjectRecord> page) {
        List<String> codes = page.getRecords().stream()
                .map(ProjectRecord::getCode)
                .collect(Collectors.toList());
        System.out.println(
                label
                        + " current=" + page.getCurrent()
                        + " size=" + page.getSize()
                        + " total=" + page.getTotal()
                        + " pages=" + page.getPages()
                        + " codes=" + codes);
    }
}
```

### 5. 在真实 MySQL 中运行

上一课已经清理了隔离资源，因此先完整重建网络、数据卷、Maven 缓存卷和 MySQL 8.4 容器：

```bash
docker network create teamflow-mp-net
docker volume create teamflow-mp-data
docker volume create teamflow-mp-m2
docker run -d \
  --name teamflow-mp-db \
  --network teamflow-mp-net \
  -v teamflow-mp-data:/var/lib/mysql \
  -e MYSQL_DATABASE=teamflow \
  -e MYSQL_USER=teamflow \
  -e MYSQL_PASSWORD=local-teamflow-pass \
  -e MYSQL_ROOT_PASSWORD=local-root-pass \
  mysql:8.4
until docker exec teamflow-mp-db \
  mysqladmin ping -h 127.0.0.1 -uteamflow -plocal-teamflow-pass --silent; do
  sleep 1
done
```

readiness 命令成功后，在现代工程根目录运行：

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

前两个场景的 count SQL 使用同一组状态和前缀条件，列表 SQL 追加 `ORDER BY project_code, project_id` 与
LIMIT。四行输出为：

```text
FIRST current=1 size=2 total=4 pages=2 codes=[TF-101, TF-102]
SECOND current=2 size=2 total=4 pages=2 codes=[TF-104, TF-105]
OVERFLOW_FALSE current=9 size=2 total=4 pages=2 codes=[]
CAPPED current=1 size=3 total=5 pages=2 codes=[TF-101, TF-102, TF-104]
```

最后一行按状态再按主键排序，前 3 条都是 ACTIVE；`size=99` 在输入边界被收紧为 3，插件上限也保持 3。

临时把配置改为 `overflow=true` 后重跑，第三行应变为 `current=1` 并返回第一页编码；恢复 false 后，四行结果应
重新一致。再把一个 Page 构造器的第三个参数改为 false，确认日志不再出现 count，同时不要再断言 total/pages。

## 九、运行 Java 8 兼容线

### 1. 依赖差异来自 MyBatis-Plus 版本

Java 8 工程继续使用 Boot `2.3.12.RELEASE` 与 MyBatis-Plus `3.4.2`。它的
`mybatis-plus-boot-starter` 已通过 extension 传递 JSQLParser `4.0`，不要机械加入现代线的
`mybatis-plus-jsqlparser:3.5.17`，否则会混用两代模块。

用真实依赖树确认：

```text
mybatis-plus-boot-starter:3.4.2
\- mybatis-plus:3.4.2
   \- mybatis-plus-extension:3.4.2
      \- mybatis-plus-core:3.4.2
         +- mybatis-plus-annotation:3.4.2
         \- jsqlparser:4.0
```

### 2. 共同代码使用构造器而不是 Page.of

`Page.of` 是 `3.4.3` 才加入的便利 API，`3.4.2` 无法编译。现代线和 Java 8 兼容线共同使用：

```java
Page<ProjectRecord> page = new Page<>(current, size);
```

本课的配置类、查询类、目录类和入口都只使用两版共有 API，因此 Java 源码不需要分叉。把现代工程新增的
`MybatisPlusConfig.java`、`ProjectPageQuery.java`，修改后的 `ProjectCatalog.java`、`TeamFlowApplication.java`
和 `schema.sql` 同步到独立的 Java 8 工程目录；继续保留上一课的 `ProjectRecord.java` 与
`ProjectRecordMapper.java`。不要覆盖兼容工程的 POM 和 `application.properties`：前者仍使用 Boot
`2.3.12.RELEASE`、MyBatis-Plus `3.4.2` 和 Java 8，后者仍使用 `spring.datasource.initialization-mode=always`。
唯一构建差异是现代线单独加入解析模块，兼容线继续使用旧 Starter 的传递依赖。

在 Java 8 工程根目录运行上一课的 Maven 8 容器命令。预期仍是现代线四行结果。再分别切换
`overflow=true` 和 `searchCount=false`，可观察行为也应一致；负 size 的内部处理不同，所以共同输入合同始终
把 size 收紧为正数。

## 十、练习：增加负责人筛选并验证空白合同

:::exercise
### 完成第二组可复现的分页查询

**要求：** 复用完整项目，不新增 Mapper 方法。用 `ProjectPageQuery` 查询负责人
`jian@example.test`，页码传 0、页大小传 20、排序传 `code`；输入边界必须把页码收紧为 1、页大小收紧为 3。
再查询只含空格的负责人，确认它等价于未提供筛选。两次都必须保留固定白名单排序与唯一主键兜底，不能接收
Page、OrderItem、列名或 SQL 文本。

**验收：** 第一组输出 `current=1 size=3 total=3 pages=1 codes=[TF-101, TF-103, TF-105]`；第二组输出
`current=1 size=3 total=5 pages=2 codes=[TF-101, TF-102, TF-103]`。日志中第一组包含负责人等值条件，第二组
不包含该 WHERE 条件；两组列表 SQL 都包含确定性 ORDER BY 与最多 3 条的 LIMIT。
:::

### 1. 完整参考实现

在 `run` 末尾增加：

```java
printPage(
        "OWNER",
        catalog.findPage(new ProjectPageQuery(
                0, 20, null, null, "jian@example.test", "code")));
printPage(
        "BLANK_OWNER",
        catalog.findPage(new ProjectPageQuery(
                1, 3, null, null, "   ", "code")));
```

`ProjectPageQuery`、`ProjectCatalog`、Mapper、实体、配置和 DDL 都使用第八章完整实现，不需要省略或替换任何
方法。完整程序新增的两行输出为：

```text
OWNER current=1 size=3 total=3 pages=1 codes=[TF-101, TF-103, TF-105]
BLANK_OWNER current=1 size=3 total=5 pages=2 codes=[TF-101, TF-102, TF-103]
```

第一组证明页码与页大小先被收紧，再由负责人条件参与 count 和列表查询；第二组证明空白先规范化为 null，
不会生成 `owner_email = ''`。两组都按唯一项目编码和主键排序，运行结果可以重复核对。

## 十一、本课小结

MyBatis-Plus 分页不是 Java 集合切片，而是拦截器基于 Page 和 Wrapper 生成 count、ORDER BY、LIMIT 与 OFFSET。
可靠分页同时需要四份合同：受控的页码和页大小、与 count 一致的筛选、具有唯一兜底的稳定排序，以及对越界页和
总数查询的明确策略。

`maxLimit` 能保护资源，却不能替代输入边界；`overflow=true` 会回到第一页而不是最后一页；关闭 count 后就不能
继续承诺 total 与 pages。复杂关联还要核对自动 count SQL，客户端排序则只能映射到后端白名单。下一课将在这套
可观察的持久化查询之上学习事务，不会改变本课的分页和筛选合同。
