---
id: backend.java.learn.intermediate.mybatis-and-mybatis-plus
type: lesson
title: MyBatis 配置
summary: 在 Spring Boot 中配置单数据源、MyBatis Starter 与 Mapper 扫描，并用最小数据库探针验证完整对象链
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 150
prerequisites:
  - backend.java.learn.intermediate.database-migrations
  - backend.java.learn.intermediate.spring-boot-and-configuration
  - backend.java.learn.intermediate.dependency-injection-and-bean-lifecycle
objectives:
  - 能说明 DataSource、SqlSessionFactory、SqlSessionTemplate 与 Mapper 代理的连接顺序。
  - 能为 Spring Boot 4.1.0 选择正确的 MyBatis Starter 与 MySQL 驱动依赖。
  - 能通过环境变量配置单个 MySQL DataSource，不把凭据写进源码。
  - 能使用 MapperScan 明确 Mapper 扫描边界，并判断接口是否进入 Spring 容器。
  - 能区分 spring.datasource、mybatis 与 mybatis.configuration 三组配置职责。
  - 能用最小 SELECT 1 探针证明 DataSource、Mapper 扫描和 MyBatis 会话链真实可用。
  - 能定位驱动缺失、扫描遗漏、连接参数错误与配置入口冲突。
  - 能为 Java 8 与 Spring Boot 2.3.12.RELEASE 选择真实兼容的 Starter 版本。
recap:
  - Spring Boot 先创建 DataSource，MyBatis Starter 再据此创建 SqlSessionFactory 和 SqlSessionTemplate。
  - MapperScan 决定哪些接口被注册为 Mapper 代理；Java 包存在不等于接口已经成为 Spring Bean。
  - spring.datasource 负责数据库连接，mybatis 负责资源与扫描相关选项，mybatis.configuration 绑定 MyBatis settings。
  - configuration 属性与 config-location 是两条互斥的核心配置入口，单个项目应明确选择一种。
  - 应用启动成功不一定已经访问数据库，最小 SELECT 1 才能验证从 Mapper 到 MySQL 的完整链路。
  - 主线使用 Starter 4.1.0；Java 8 与 Boot 2.3.12.RELEASE 使用已经停止维护的 2.1.4 兼容线。
  - 本课只建立配置与连通性基线，查询映射、写入、动态 SQL、MyBatis-Plus、分页和事务由后续课程完成。
related:
  - backend.java.learn.intermediate.relational-data-and-sql-foundations
  - backend.java.learn.intermediate.database-migrations
tags:
  - MyBatis
  - Spring Boot
  - MySQL
  - DataSource
  - MapperScan
appliesTo: JDK 25、Spring Boot 4.1.0、MyBatis Spring Boot Starter 4.1.0、MyBatis 3.5.19、MyBatis-Spring 4.1.0 与 MySQL 8.4 LTS；Java 8、Spring Boot 2.3.12.RELEASE、Starter 2.1.4 兼容补充
verifiedAt: 2026-08-20
sources:
  - id: mybatis-starter-introduction
    title: MyBatis Spring Boot Starter - Introduction
    url: https://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis Spring Boot Starter 4.x 与 2.1.x 兼容表
    claims:
      - Starter 检测 DataSource 并创建 SqlSessionFactory 与 SqlSessionTemplate
      - Starter 默认发现带 Mapper 注解的接口，也支持通过 MapperScan 指定扫描边界
      - mybatis.configuration 不能与 config-location 同时使用
      - Starter 2.1 版本线适配 Spring Boot 2.1 到 2.4、要求 Java 8 及以上，现已停止维护
  - id: mybatis-spring-mappers
    title: MyBatis-Spring Reference - Injecting Mappers
    url: https://mybatis.org/spring/mappers.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis-Spring 4.1.x
    claims:
      - MapperFactoryBean 创建可注入的线程安全 Mapper 代理
      - MapperScan 可以按包批量注册 Mapper 接口
      - Mapper 代理依赖 SqlSessionFactory 或 SqlSessionTemplate
  - id: mybatis-spring-sqlsession
    title: MyBatis-Spring Reference - Using an SqlSession
    url: https://mybatis.org/spring/sqlsession.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis-Spring 4.1.x
    claims:
      - SqlSessionTemplate 是线程安全且由 Spring 管理的 SqlSession 实现
      - SqlSessionTemplate 让 Mapper 使用与当前 Spring 上下文关联的会话
  - id: mybatis-configuration
    title: MyBatis 3 Configuration
    url: https://mybatis.org/mybatis-3/configuration.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis 3.5.19
    claims:
      - settings 会改变 MyBatis 运行行为
      - mapUnderscoreToCamelCase 与 defaultStatementTimeout 是已注册的核心设置
      - 一个 SqlSessionFactory 实例只选择一个 MyBatis environment
  - id: spring-boot-sql-databases
    title: Spring Boot Reference - SQL Databases
    url: https://docs.spring.io/spring-boot/reference/data/sql.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Spring Boot 可从 spring.datasource 配置自动创建 DataSource
      - 嵌入式数据库缺失时至少需要提供数据库 URL
      - 可从 URL 推断 JDBC driver 时不必显式配置 driver-class-name
  - id: spring-boot-application-properties
    title: Spring Boot Reference - Common Application Properties
    url: https://docs.spring.io/spring-boot/appendix/application-properties/index.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - spring.datasource.url、username 与 password 是标准数据源属性
      - spring.datasource.hikari.connection-timeout 配置连接池等待连接的最长时间
  - id: mybatis-starter-410-parent
    title: MyBatis Spring Boot 4.1.0 Parent POM
    url: https://repo.maven.apache.org/maven2/org/mybatis/spring/boot/mybatis-spring-boot/4.1.0/mybatis-spring-boot-4.1.0.pom
    sourceOrigin: official
    sourceType: source-code
    appliesTo: MyBatis Spring Boot Starter 4.1.0
    claims:
      - Starter 4.1.0 对齐 Spring Boot 4.1.0、MyBatis 3.5.19 与 MyBatis-Spring 4.1.0
      - Starter 4.1.0 的最低 Java 版本为 17
  - id: mybatis-starter-maven-metadata
    title: MyBatis Spring Boot Starter Maven Metadata
    url: https://repo.maven.apache.org/maven2/org/mybatis/spring/boot/mybatis-spring-boot-starter/maven-metadata.xml
    sourceOrigin: official
    sourceType: source-code
    appliesTo: 2026-08-20 快照
    claims:
      - MyBatis Spring Boot Starter 当前发布版本为 4.1.0
      - Java 8 兼容的 2.1 版本线最终版本为 2.1.4
  - id: mybatis-starter-214-pom
    title: MyBatis Spring Boot Starter 2.1.4 POM
    url: https://repo.maven.apache.org/maven2/org/mybatis/spring/boot/mybatis-spring-boot-starter/2.1.4/mybatis-spring-boot-starter-2.1.4.pom
    sourceOrigin: official
    sourceType: source-code
    appliesTo: MyBatis Spring Boot Starter 2.1.4
    claims:
      - Starter 2.1.4 包含 Spring Boot JDBC、MyBatis 与 MyBatis-Spring 集成依赖
  - id: spring-boot-410-dependencies
    title: Spring Boot Dependencies 4.1.0
    url: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-dependencies/4.1.0/spring-boot-dependencies-4.1.0.pom
    sourceOrigin: official
    sourceType: source-code
    appliesTo: Spring Boot 4.1.0
    claims:
      - Spring Boot 4.1.0 管理 MySQL Connector J 9.7.0
  - id: spring-boot-2312-dependencies
    title: Spring Boot Dependencies 2.3.12.RELEASE
    url: https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-dependencies/2.3.12.RELEASE/spring-boot-dependencies-2.3.12.RELEASE.pom
    sourceOrigin: official
    sourceType: source-code
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Spring Boot 2.3.12.RELEASE 提供 Java 8 兼容的依赖管理线
  - id: mybatis-logging
    title: MyBatis 3 Logging
    url: https://mybatis.org/mybatis-3/logging.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis 3.5.19
    claims:
      - 可以按 Mapper 全限定名启用日志，SQL 语句在 DEBUG 级别输出
  - id: baeldung-mybatis-sql-logging
    title: Logging SQL Queries to the Console in Mybatis
    url: https://www.baeldung.com/java-sql-mybatis-log-sql-queries
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Spring Boot 与 MyBatis，2025-03-26 更新
    claims:
      - 可以用 logging.level 为单个 Mapper 临时开启 DEBUG 日志辅助排查
---

# MyBatis 配置

前面已经用 SQL 建立并查询 TeamFlow 数据库，也用迁移脚本管理了结构历史。Java 应用要访问同一个 MySQL，
还需要把数据库连接、MyBatis 会话与 Mapper 接口接成一条可以启动、可以注入、可以真实执行的链路。

本课只建立这条配置链。示例中的 `SELECT 1` 是基础设施连通性探针，不承担业务查询教学。参数映射、结果映射、
XML statement、写入、动态 SQL、MyBatis-Plus、分页和事务分别留给后续课程。

## 一、Starter 连接了哪些对象

### 1. 依赖不是只有 MyBatis Core

MyBatis Core 提供 `SqlSessionFactory`、Mapper 代理和 SQL 执行能力，但它不知道 Spring Boot 怎样创建数据库连接，
也不会自己把接口注册为 Spring Bean。MyBatis Spring Boot Starter 把三层依赖组合起来：

```text
Spring Boot JDBC
        |
        v
    DataSource
        |
        v
SqlSessionFactory
        |
        v
SqlSessionTemplate
        |
        v
    Mapper 代理
```

主线工程至少需要 Starter 与具体数据库的 JDBC driver：

```xml
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
```

Starter `4.1.0` 自身对齐 Spring Boot `4.1.0`、MyBatis `3.5.19` 和 MyBatis-Spring `4.1.0`。MySQL driver
不属于 MyBatis，必须单独加入；它的版本由 Spring Boot `4.1.0` 依赖管理线选择为 `9.7.0`，业务 POM 不再
重复写版本。

### 2. 自动配置有明确的先后顺序

Spring Boot 先读取 `spring.datasource.*`，根据 JDBC driver 和 URL 创建 `DataSource`。Starter 检测到这个
Bean 后，使用 `SqlSessionFactoryBean` 构建 `SqlSessionFactory`，再从 factory 创建
`SqlSessionTemplate`。最后，扫描器把 Mapper 接口注册为代理，并让代理使用这份 template。

这条顺序能解释四类启动结果：

| 停止位置 | 缺少的条件 | 常见结果 |
| --- | --- | --- |
| DataSource 之前 | URL 或 driver | 无法确定 driver，或没有可用 DataSource |
| SqlSessionFactory 之前 | MyBatis Starter | 只有连接池，没有 MyBatis 会话工厂 |
| Mapper 代理之前 | 扫描边界 | factory 存在，但需要注入的 Mapper Bean 不存在 |
| 第一次执行 SQL | 地址、账号或数据库错误 | 应用可能已创建 Bean，连接时才失败 |

自动配置减少的是样板代码，不是运行条件。判断失败时应沿对象链定位，而不是先手写一整套
`SqlSessionFactoryBean` 配置覆盖 Starter。

### 3. 本课坚持单数据源

一个 `SqlSessionFactory` 只面向一个选定的数据库环境。单数据源工程由 Starter 自动关联 DataSource、factory、
template 和 Mapper，依赖关系最清楚。

多数据源需要为每个数据库分别定义这些对象，并让扫描器明确引用对应 factory 或 template。那是另一项独立
配置能力，不应在第一次接通 MyBatis 时同时引入。本课所有示例只创建一个名为 `teamflow` 的 MySQL schema。

## 二、先让 DataSource 可连接

### 1. 启动隔离的 MySQL

下面的容器只保存本课探针所需的空 schema，不复用其他课程数据库。密码只用于可删除的本地练习环境：

```bash
docker network create teamflow-mybatis-net

docker run -d \
  --name teamflow-mybatis-db \
  --network teamflow-mybatis-net \
  -e MYSQL_ROOT_PASSWORD=local-root-pass \
  -e MYSQL_DATABASE=teamflow \
  -e MYSQL_USER=teamflow \
  -e MYSQL_PASSWORD=local-teamflow-pass \
  mysql:8.4

until docker exec teamflow-mybatis-db \
  mysql -h127.0.0.1 -uteamflow -plocal-teamflow-pass \
  teamflow -e "SELECT 1" >/dev/null 2>&1; do
  sleep 1
done
```

就绪循环使用 TCP、目标业务账号和目标 schema 执行真实 SQL。只看到容器处于 running，不能证明初始化完成、
账号可认证或 `teamflow` 已经存在。

### 2. 三个连接属性来自环境

`application.properties` 只声明变量合同：

```properties
spring.application.name=teamflow-mybatis-config
spring.main.web-application-type=none
spring.datasource.url=${TEAMFLOW_DB_URL}
spring.datasource.username=${TEAMFLOW_DB_USER}
spring.datasource.password=${TEAMFLOW_DB_PASSWORD}
spring.datasource.hikari.connection-timeout=3000
```

运行环境再提供具体值：

```text
TEAMFLOW_DB_URL=jdbc:mysql://teamflow-mybatis-db:3306/teamflow?sslMode=DISABLED&allowPublicKeyRetrieval=true
TEAMFLOW_DB_USER=teamflow
TEAMFLOW_DB_PASSWORD=<由运行环境提供>
```

URL 决定协议、主机、端口和 schema，username 与 password 决定认证身份。示例显式关闭 TLS 只适用于隔离的本地
Docker network；共享环境和生产环境应使用其正式 TLS 与凭据方案，不能照搬本地参数。

`connection-timeout=3000` 表示连接池最多等待三秒取得连接。它不会把错误连接变正确，只让不可达地址更快给出
反馈。课程没有配置 `driver-class-name`，因为 Connector/J 在 classpath 中时，Spring Boot 可以从 JDBC URL
推断 driver。

### 3. 创建 DataSource 不等于已经连库

连接池通常延迟到第一次借用连接才真正访问数据库。因此，下面这些日志只能证明应用上下文已经开始创建：

```text
Started TeamFlowApplication
```

它们不能证明 MySQL 地址、schema 和账号都正确。真正的连通性反馈必须执行一条数据库语句。本课使用固定的
`SELECT 1`，成功结果只表达“链路可用”，不表达业务表、业务 SQL 或事务已经正确。

## 三、明确 Mapper 扫描边界

### 1. Mapper 是接口生成的代理 Bean

Mapper 不需要手写实现类。扫描器读取接口定义，为它创建代理 Bean；调用代理方法时，代理再通过
`SqlSessionTemplate` 找到映射语句并执行。

本课的探针接口只有一个固定语句：

```java
package dev.teamflow.persistence;

import org.apache.ibatis.annotations.Select;

/**
 * 提供数据库配置连通性探针。
 */
public interface DatabaseProbeMapper {

    /**
     * 执行不依赖业务表的固定探针。
     *
     * @return 数据库返回的固定值
     */
    @Select("SELECT 1")
    int selectOne();
}
```

`@Select` 在这里只给反馈环提供一条最小 statement。下一课才会解释参数、返回对象和 XML 映射；本课不能从
这个探针推导出业务查询已经完成。

### 2. 用类型而不是易漂移字符串定位包

Starter 默认搜索带 `@Mapper` 的接口。团队也可以统一不在每个接口上重复注解，而是在配置入口显式使用
`@MapperScan`：

```java
package dev.teamflow;

import dev.teamflow.persistence.DatabaseProbeMapper;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan(basePackageClasses = DatabaseProbeMapper.class)
public class TeamFlowApplication {
}
```

`basePackageClasses` 取标记类型所在包，比字符串 `"dev.teamflow.persistence"` 更容易随重构一起更新。它扫描
该包及子包，当前接口即使没有 `@Mapper` 也会被注册。

两种方式都能工作，但同一工程应选定一致规则：要么接口逐个标记 `@Mapper` 并让 Starter 默认发现，要么在
应用配置上明确 `@MapperScan`。本课采用后一种，扫描范围一眼可见。

### 3. 包层级与扫描是两件事

`@SpringBootApplication` 的组件扫描从应用类所在包开始，但 Mapper 注册还有自己的扫描过程。把接口文件放进
源码目录，只能让编译器看见它；没有 `@Mapper`，也没有覆盖它的 `@MapperScan` 时，Spring 容器中仍然没有
这个 Mapper Bean。

最直接的验证是让构造参数或 `@Bean` 方法参数依赖该接口。扫描遗漏时，应用会在上下文创建阶段报告找不到
`DatabaseProbeMapper`，而不是等到某个 HTTP 请求才暴露问题。

## 四、分清三组配置属性

### 1. spring.datasource 只负责数据库连接

这一组属性交给 Spring Boot：

```properties
spring.datasource.url=${TEAMFLOW_DB_URL}
spring.datasource.username=${TEAMFLOW_DB_USER}
spring.datasource.password=${TEAMFLOW_DB_PASSWORD}
spring.datasource.hikari.connection-timeout=3000
```

它决定怎样取得 JDBC `Connection`，不决定 Mapper 在哪里，也不决定数据库列怎样映射为 Java 属性。用户名正确
却没有目标 schema 权限时，DataSource 仍会在首次连接时收到数据库拒绝。

### 2. mybatis.configuration 绑定核心 settings

Starter 可以把 `mybatis.configuration.*` 直接绑定到 MyBatis `Configuration`。本课选择两个容易观察的设置：

```properties
mybatis.configuration.map-underscore-to-camel-case=true
mybatis.configuration.default-statement-timeout=3
```

`map-underscore-to-camel-case` 允许后续映射把 `project_id` 这样的列名按规则匹配到 `projectId`。本课只验证该值
已经进入 Configuration，不提前讲结果映射。`default-statement-timeout` 是未单独指定 timeout 时的默认秒数；
它限制 statement 等待，不替代连接池的 `connection-timeout`。

应用可以直接读取实际生效值：

```java
System.out.println(
        "camelCase=" + sqlSessionFactory.getConfiguration().isMapUnderscoreToCamelCase());
System.out.println(
        "statementTimeout=" + sqlSessionFactory.getConfiguration().getDefaultStatementTimeout());
```

预期输出是：

```text
camelCase=true
statementTimeout=3
```

### 3. mybatis 顶层属性负责集成入口

`mybatis.mapper-locations`、`mybatis.type-aliases-package` 与 `mybatis.type-handlers-package` 属于 Starter 的集成
配置。只有项目真实使用对应能力时才添加。例如后续把 Mapper statement 放进 XML，可以配置：

```properties
mybatis.mapper-locations=classpath*:/mappers/**/*.xml
```

本课没有 Mapper XML，因此完整示例不加入这行。提前写一个不存在的目录只会让配置看似完整，却没有任何可
观察效果。别名、TypeHandler、executor type 和插件也应在对应能力出现时再配置。

### 4. 属性式 settings 与 XML 核心配置二选一

`mybatis.config-location` 指向一份 MyBatis 核心配置 XML，`mybatis.configuration.*` 则由 Spring Boot 属性直接
构造同一个 Configuration。Starter 明确禁止两者同时使用：

```properties
# 属性式入口
mybatis.configuration.map-underscore-to-camel-case=true
mybatis.configuration.default-statement-timeout=3
```

如果项目决定改用 `mybatis-config.xml`，就把 settings 移入 XML，并只保留：

```properties
mybatis.config-location=classpath:/mybatis-config.xml
mybatis.check-config-location=true
```

这不是“多写一份更保险”。两个入口同时声明同一对象会产生歧义，并在 factory 初始化时失败。本课使用属性式
入口，后续 Mapper XML 仍可单独由 `mapper-locations` 加载，不要求改成核心配置 XML。

## 五、理解会话对象的职责

### 1. SqlSessionFactory 保存已解析配置

`SqlSessionFactory` 由 DataSource 与 MyBatis Configuration 构建。它保存已注册 Mapper、settings、映射语句和
创建 SqlSession 所需的信息。factory 是长期对象，不应该为每次 Mapper 调用重新构建。

本课从 factory 读取 settings，是为了证明配置绑定完成：

```java
Configuration configuration = sqlSessionFactory.getConfiguration();
boolean camelCase = configuration.isMapUnderscoreToCamelCase();
Integer timeout = configuration.getDefaultStatementTimeout();
```

读取成功只证明 factory 中的元数据正确；直到 Mapper 执行 `SELECT 1`，DataSource 的真实连接才一起被验证。

### 2. SqlSessionTemplate 是 Spring 管理的会话入口

原生 `SqlSession` 不是可以随意共享的线程安全对象，打开与关闭也有明确生命周期。MyBatis-Spring 提供的
`SqlSessionTemplate` 是线程安全的 Spring Bean，会把调用交给当前上下文中的合适 SqlSession，并负责必要的
生命周期协作。

Mapper 代理已经连接到 template，普通业务 Bean 不需要自己执行：

```java
SqlSession session = sqlSessionFactory.openSession();
```

更不应该把手工打开的 session 存成单例字段。事务如何决定同一调用链复用哪次会话由后续事务课解释；当前只
需要记住，注入 Mapper 或 template，不手工关闭 Spring 管理的对象。

### 3. 一次探针经过整条链路

调用 `databaseProbeMapper.selectOne()` 时发生的关键步骤是：

```text
Mapper 代理收到方法调用
-> SqlSessionTemplate 取得当前 SqlSession
-> SqlSessionFactory 中的 Configuration 找到 SELECT 1
-> DataSource 提供 JDBC Connection
-> Connector/J 把语句发送给 MySQL
-> MySQL 返回整数 1
-> MyBatis 把结果交回 Mapper 调用方
```

因此，固定结果 `1` 同时证明 Mapper 已注册、会话对象已创建、driver 已加载、连接参数可用且数据库可执行
语句。它仍不证明业务表存在，这正是基础设施探针应该保持的边界。

**社区补充：** 当探针失败且需要观察指定 Mapper 是否准备了 SQL 时，可以临时只为它开启 DEBUG：

```properties
logging.level.dev.teamflow.persistence.DatabaseProbeMapper=DEBUG
```

MyBatis 官方日志合同允许按 Mapper 全限定名设置 logger，SQL 语句会在 DEBUG 级别输出。这个定向设置只帮助
定位调用是否到达 Mapper，不代替 `databaseProbe=1` 的成功结果；排查结束后应恢复项目原有日志级别。

## 六、配置中的典型错误

:::pitfalls
### 只加入 MyBatis Core

**触发条件：** 已有 Spring Boot JDBC 和 MySQL driver，但 MyBatis 相关依赖只有
`org.mybatis:mybatis:3.5.19`，却期待 Spring Boot 自动创建 factory、template 和 Mapper Bean。

**原因：** Core 不包含 Spring Boot 自动配置，也不负责 Spring Bean 注册。

**后果：** 导入 MapperScan 或 SqlSessionTemplate 时直接编译失败；只使用 Core 类型的代码也不会得到 Starter
负责创建的集成 Bean。

**错误示例：**

```xml
<dependency>
  <groupId>org.mybatis</groupId>
  <artifactId>mybatis</artifactId>
  <version>3.5.19</version>
</dependency>
```

**正确写法：**

```xml
<dependency>
  <groupId>org.mybatis.spring.boot</groupId>
  <artifactId>mybatis-spring-boot-starter</artifactId>
  <version>4.1.0</version>
</dependency>
```

**验证方式：** 从无编译产物的工程执行 `mvn -B clean package`，错误依赖应报告缺少
`org.mybatis.spring` 类型；恢复 Starter 后运行探针，应创建 factory、template 和 Mapper 并返回 `1`。

### 忘记加入 MySQL driver

**触发条件：** 已加入 Starter 和数据库 URL，但 POM 没有 `mysql-connector-j`。

**原因：** Starter 负责 MyBatis 与 Spring 集成，不包含每一种数据库的 JDBC driver。

**后果：** DataSource 自动配置无法为 `jdbc:mysql` 找到合适 driver，探针不会到达数据库。

**错误示例：**

```xml
<dependency>
  <groupId>org.mybatis.spring.boot</groupId>
  <artifactId>mybatis-spring-boot-starter</artifactId>
  <version>4.1.0</version>
</dependency>
```

**正确写法：**

```xml
<dependency>
  <groupId>com.mysql</groupId>
  <artifactId>mysql-connector-j</artifactId>
  <scope>runtime</scope>
</dependency>
```

**验证方式：** 临时删除 driver 依赖，从无编译产物的工程运行同一启动命令，应报告无法加载
`com.mysql.cj.jdbc.Driver`；恢复依赖后执行 `mvn -B dependency:tree` 应看到 Connector/J，探针应返回
`databaseProbe=1`。

### 扫描包没有覆盖 Mapper

**触发条件：** Mapper 没有 `@Mapper`，同时 `@MapperScan` 指向另一个包。

**原因：** 编译器看见接口不代表 MyBatis 扫描器已经为它创建代理 Bean。

**后果：** 应用上下文因找不到 DatabaseProbeMapper 依赖而启动失败。

**错误示例：**

```java
@MapperScan("dev.teamflow.web")
public class TeamFlowApplication {
}
```

**正确写法：**

```java
@MapperScan(basePackageClasses = DatabaseProbeMapper.class)
public class TeamFlowApplication {
}
```

**验证方式：** 临时把扫描边界改错应出现缺少 Mapper Bean；恢复标记类型后上下文创建成功并执行探针。

### 把启动日志当成连通性证据

**触发条件：** 应用只打印 started，不执行任何 Mapper 方法，就宣布数据库配置成功。

**原因：** 连接池可能延迟到第一次取得 Connection 才访问数据库。

**后果：** 错误端口、schema 或密码会留到第一次业务调用才暴露。

**错误示例：**

```java
return args -> System.out.println("applicationStarted=true");
```

**正确写法：**

```java
return args -> System.out.println("databaseProbe=" + databaseProbeMapper.selectOne());
```

**验证方式：** 正确连接应输出 `databaseProbe=1`；把端口改为未监听值后，同一入口必须非零退出。

### 同时声明两个核心配置入口

**触发条件：** 同时设置 `mybatis.config-location` 与任意 `mybatis.configuration.*` 属性。

**原因：** 两者都试图提供 MyBatis 核心 Configuration，Starter 明确规定不能并用。

**后果：** SqlSessionFactory 初始化失败，Mapper 代理无法完成注册。

**错误示例：**

```properties
mybatis.config-location=classpath:/mybatis-config.xml
mybatis.configuration.default-statement-timeout=3
```

**正确写法：**

```properties
mybatis.configuration.map-underscore-to-camel-case=true
mybatis.configuration.default-statement-timeout=3
```

**验证方式：** 两个入口同时存在时启动应失败；删除 config-location 后 factory 应报告 timeout 为 `3`。
:::

## 七、完成一条可运行配置链

### 1. 项目结构与 POM

完整项目只有应用类、探针 Mapper 和属性文件：

```text
teamflow-mybatis-config/
├── pom.xml
└── src/main/
    ├── java/dev/teamflow/
    │   ├── TeamFlowApplication.java
    │   └── persistence/DatabaseProbeMapper.java
    └── resources/application.properties
```

`pom.xml` 使用 Spring Boot `4.1.0`、JDK 25 和 Starter `4.1.0`：

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
  <artifactId>teamflow-mybatis-config</artifactId>
  <version>1.0.0</version>

  <properties>
    <java.version>25</java.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

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

### 2. 应用入口观察自动配置对象

`TeamFlowApplication.java` 的完整内容为：

```java
package dev.teamflow;

import dev.teamflow.persistence.DatabaseProbeMapper;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

/**
 * 启动 TeamFlow 的 MyBatis 配置反馈环。
 */
@SpringBootApplication
@MapperScan(basePackageClasses = DatabaseProbeMapper.class)
public class TeamFlowApplication {

    /**
     * 启动应用。
     *
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        SpringApplication.run(TeamFlowApplication.class, args);
    }

    /**
     * 验证 Mapper、会话对象和数据库连接处于同一条配置链。
     *
     * @param databaseProbeMapper 数据库探针 Mapper
     * @param sqlSessionFactory MyBatis 会话工厂
     * @param sqlSessionTemplate Spring 管理的会话模板
     * @return 应用启动后的验证任务
     */
    @Bean
    ApplicationRunner verifyMyBatis(
            DatabaseProbeMapper databaseProbeMapper,
            SqlSessionFactory sqlSessionFactory,
            SqlSessionTemplate sqlSessionTemplate) {
        return args -> {
            System.out.println("databaseProbe=" + databaseProbeMapper.selectOne());
            System.out.println(
                    "sharedFactory="
                            + (sqlSessionTemplate.getSqlSessionFactory() == sqlSessionFactory));
            System.out.println(
                    "camelCase="
                            + sqlSessionFactory
                                    .getConfiguration()
                                    .isMapUnderscoreToCamelCase());
            System.out.println(
                    "statementTimeout="
                            + sqlSessionFactory.getConfiguration().getDefaultStatementTimeout());
        };
    }
}
```

`DatabaseProbeMapper.java` 使用前文完整接口。`application.properties` 为：

```properties
spring.application.name=teamflow-mybatis-config
spring.main.web-application-type=none
spring.datasource.url=${TEAMFLOW_DB_URL}
spring.datasource.username=${TEAMFLOW_DB_USER}
spring.datasource.password=${TEAMFLOW_DB_PASSWORD}
spring.datasource.hikari.connection-timeout=3000
mybatis.configuration.map-underscore-to-camel-case=true
mybatis.configuration.default-statement-timeout=3
```

### 3. 从隔离 Maven 容器运行

先按第二章启动 MySQL，再在项目根目录执行：

```bash
docker run --rm \
  --network teamflow-mybatis-net \
  -v "$PWD:/workspace" \
  -v teamflow-mybatis-m2:/root/.m2 \
  -w /workspace \
  -e 'TEAMFLOW_DB_URL=jdbc:mysql://teamflow-mybatis-db:3306/teamflow?sslMode=DISABLED&allowPublicKeyRetrieval=true' \
  -e TEAMFLOW_DB_USER=teamflow \
  -e TEAMFLOW_DB_PASSWORD=local-teamflow-pass \
  maven:3.9.12-eclipse-temurin-25 \
  mvn -B spring-boot:run
```

关键输出应包含：

```text
databaseProbe=1
sharedFactory=true
camelCase=true
statementTimeout=3
```

`databaseProbe=1` 来自 MySQL；后三项来自实际注入的 factory 与 template。四项同时成立，才证明属性绑定、对象
关系和数据库连接处于同一份运行快照。

### 4. 验证两个主要失败路径

先把 URL 中的主机临时改为 `missing-mysql`，原样运行同一命令。应用应在执行探针时非零退出，错误链包含无法
创建连接或无法解析主机；这证明探针不是固定打印成功文字。

再恢复正确 URL，把 `@MapperScan` 临时改为：

```java
@MapperScan("dev.teamflow.missing")
```

应用应在创建 `verifyMyBatis` 时报告缺少 `DatabaseProbeMapper`。恢复类型安全的扫描边界后，重新运行完整命令，
四行关键输出应再次出现。

## 八、Java 8 兼容线

### 1. 差异在依赖基线，不在探针语法

Starter `4.x` 要求 Java 17 或更高，不能放进 Java 8 工程。Spring Boot `2.3.12.RELEASE` 位于 Starter `2.1`
支持的 Boot `2.1` 到 `2.4` 区间，因此兼容线使用该系列最终版本 `2.1.4`。

本课 Java 源码只使用 Java 8 已支持的接口、注解、lambda 与字符串拼接，所以应用类、Mapper 和属性文件无需
改写。为了隔离编译目标，新建与现代工程并列的 `teamflow-mybatis-config-java8/`，把第七章的两个 Java 文件和
`application.properties` 复制到相同的 `src/main` 相对路径，再使用下面这份完整 POM：

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

  <groupId>dev.teamflow</groupId>
  <artifactId>teamflow-mybatis-config-java8</artifactId>
  <version>1.0.0</version>

  <properties>
    <java.version>1.8</java.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.mybatis.spring.boot</groupId>
      <artifactId>mybatis-spring-boot-starter</artifactId>
      <version>2.1.4</version>
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

Boot 2.3 的 MySQL 坐标仍是 `mysql:mysql-connector-java`；现代线使用
`com.mysql:mysql-connector-j`。两条线都让各自 Spring Boot parent 管理 driver 版本，不能把现代坐标和版本
机械复制到旧 POM。

### 2. 用 Java 8 运行同一反馈环

在 IntelliJ IDEA 中把现代工程的 Project SDK、模块 SDK 和 Maven Runner JRE 都设为 JDK 25，并 Reload Maven；
把兼容工程作为独立项目打开，三处都设为 JDK 8，确认其 POM 的 `java.version` 为 `1.8` 后再 Reload Maven。不能
只切换 Project SDK，也不能让两个工程共用同一个 `target/`。

进入独立的 `teamflow-mybatis-config-java8/` 根目录后执行：

```bash
docker run --rm \
  --network teamflow-mybatis-net \
  -v "$PWD:/workspace" \
  -v teamflow-mybatis-java8-m2:/root/.m2 \
  -w /workspace \
  -e 'TEAMFLOW_DB_URL=jdbc:mysql://teamflow-mybatis-db:3306/teamflow?useSSL=false&allowPublicKeyRetrieval=true' \
  -e TEAMFLOW_DB_USER=teamflow \
  -e TEAMFLOW_DB_PASSWORD=local-teamflow-pass \
  maven:3.9.12-eclipse-temurin-8 \
  mvn -B spring-boot:run
```

预期仍是四行相同输出。Starter `2.1.4` 已停止维护，只用于理解和维护既有 Java 8 / Boot 2.3 系统；新项目继续
使用 JDK 25 与 Starter `4.1.0` 主线。

## 九、独立配置一个扫描边界

:::exercise
### 为 readiness 包注册探针 Mapper

**要求：** 把探针接口移动到 `dev.teamflow.readiness` 包并改名为 `DatabaseReadinessMapper`，接口不添加
`@Mapper`。使用 `@MapperScan(basePackageClasses = DatabaseReadinessMapper.class)` 注册它，继续从环境变量读取
连接信息，并输出数据库结果、template 是否复用同一个 factory、驼峰设置和默认 statement timeout。不得增加
业务表、业务查询、写入或事务代码。

**验收：**

```text
databaseReady=1
sharedFactory=true
camelCase=true
statementTimeout=3
错误扫描包时应用因缺少 DatabaseReadinessMapper 而失败
```
:::

### 1. 参考实现

`DatabaseReadinessMapper.java`：

```java
package dev.teamflow.readiness;

import org.apache.ibatis.annotations.Select;

/**
 * 提供数据库就绪状态探针。
 */
public interface DatabaseReadinessMapper {

    /**
     * 执行固定的数据库就绪检查。
     *
     * @return 数据库返回的固定值
     */
    @Select("SELECT 1")
    int check();
}
```

`TeamFlowApplication.java`：

```java
package dev.teamflow;

import dev.teamflow.readiness.DatabaseReadinessMapper;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

/**
 * 启动独立的数据库就绪反馈环。
 */
@SpringBootApplication
@MapperScan(basePackageClasses = DatabaseReadinessMapper.class)
public class TeamFlowApplication {

    /**
     * 启动应用。
     *
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        SpringApplication.run(TeamFlowApplication.class, args);
    }

    /**
     * 输出配置链的可观察状态。
     *
     * @param mapper 数据库就绪探针
     * @param factory MyBatis 会话工厂
     * @param template Spring 管理的会话模板
     * @return 应用启动后的验证任务
     */
    @Bean
    ApplicationRunner verifyReadiness(
            DatabaseReadinessMapper mapper,
            SqlSessionFactory factory,
            SqlSessionTemplate template) {
        return args -> {
            System.out.println("databaseReady=" + mapper.check());
            System.out.println("sharedFactory=" + (template.getSqlSessionFactory() == factory));
            System.out.println(
                    "camelCase=" + factory.getConfiguration().isMapUnderscoreToCamelCase());
            System.out.println(
                    "statementTimeout="
                            + factory.getConfiguration().getDefaultStatementTimeout());
        };
    }
}
```

POM 与 `application.properties` 继续使用第七章的现代版本。移动接口后不要保留旧
`dev.teamflow.persistence.DatabaseProbeMapper`，否则错误扫描边界可能被旧 Bean 掩盖。

### 2. 验收结果

使用第七章同一个 MySQL 容器和 Maven 命令，主线应输出：

```text
databaseReady=1
sharedFactory=true
camelCase=true
statementTimeout=3
```

把 `@MapperScan` 改为不存在的包后，应用必须在执行 SQL 前因 Mapper Bean 缺失而失败；恢复
`basePackageClasses` 后再次运行，四行结果恢复。这个对照同时证明成功来自真实扫描与连接配置，不是环境中残留
的实现类或固定成功输出。

完成主示例、两个失败路径和练习后，清理隔离环境：

```bash
database_volume="$(docker inspect teamflow-mybatis-db \
  --format '{{range .Mounts}}{{if eq .Destination "/var/lib/mysql"}}{{.Name}}{{end}}{{end}}')"
docker stop teamflow-mybatis-db
docker rm --volumes teamflow-mybatis-db
docker network rm teamflow-mybatis-net
docker volume rm teamflow-mybatis-m2 teamflow-mybatis-java8-m2
test -z "$database_volume" || ! docker volume inspect "$database_volume" >/dev/null 2>&1
```
