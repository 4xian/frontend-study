---
id: backend.java.learn.intermediate.mybatis-and-mybatis-plus
type: lesson
title: MyBatis、Mapper XML 与 MyBatis-Plus
summary: 从 Mapper 方法跟到参数化 SQL、结果映射和现代分页，建立清晰的数据访问合同
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 280
prerequisites:
  - backend.java.learn.intermediate.relational-data-and-sql-foundations
  - backend.java.learn.intermediate.dependency-injection-and-bean-lifecycle
related: []
tags:
  - MyBatis
  - MyBatis-Plus
  - Mapper
  - XML
  - SQL
appliesTo: Java 25、Spring Boot 4.1.0、MyBatis 3.5.19、MyBatis-Spring 4.0.0、MyBatis Spring Boot Starter 4.0.0 与 MyBatis-Plus 3.5.17 主线；Java 8、Spring Boot 2.3.12.RELEASE、MyBatis-Plus 3.4.2 兼容补充
modernBaseline:
  java: '25'
  springBoot: 4.1.0
  mybatis: 3.5.19
  mybatisPlus: 3.5.17
legacyBaseline:
  java: '8'
  springBoot: 2.3.12.RELEASE
  mybatisPlus: 3.4.2
verifiedAt: 2026-08-09
sources:
  - id: mybatis-getting-started
    title: MyBatis 3 Getting Started
    url: https://mybatis.org/mybatis-3/getting-started.html
    sourceType: official-reference
    appliesTo: MyBatis 3.5.19
    claims:
      - SqlSessionFactory、SqlSession 和 Mapper 是核心运行入口
      - 映射语句与 XML 资源需要在运行时配置并进入 classpath
  - id: mybatis-xml
    title: MyBatis Mapper XML
    url: https://mybatis.org/mybatis-3/sqlmap-xml.html
    sourceType: official-reference
    appliesTo: MyBatis 3.5.19
    claims:
      - namespace、statement、参数和 resultMap 共同建立接口与 SQL 合同
      - '#{} 使用参数绑定，${} 执行文本替换；嵌套 select 可能产生 N+1 查询'
  - id: mybatis-dynamic-sql
    title: MyBatis Dynamic SQL
    url: https://mybatis.org/mybatis-3/dynamic-sql.html
    sourceType: official-reference
    appliesTo: MyBatis 3.5.19
    claims:
      - if、choose、where、set 与 foreach 生成结构化动态 SQL
  - id: mybatis-java-api
    title: MyBatis Java API
    url: https://mybatis.org/mybatis-3/java-api.html
    sourceType: api-doc
    appliesTo: MyBatis 3.5.19
    claims:
      - 定义 SqlSession 生命周期、Mapper 代理和事务方法
  - id: mybatis-configuration
    title: MyBatis Configuration
    url: https://mybatis.org/mybatis-3/configuration.html
    sourceType: official-reference
    appliesTo: MyBatis 3.5.19
    claims:
      - 配置 typeHandlers、mappers、settings 与环境
      - mapper 资源通过配置加载，运行时必须能从 classpath 找到 XML
  - id: mybatis-spring
    title: MyBatis-Spring Reference
    url: https://mybatis.org/spring/
    sourceType: official-reference
    appliesTo: MyBatis-Spring 4.0.0
    claims:
      - Spring 让 Mapper 使用当前事务关联的 SqlSession
  - id: mybatis-spring-boot
    title: MyBatis Spring Boot Starter
    url: https://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/
    sourceType: official-reference
    appliesTo: MyBatis Spring Boot Starter 4.0.0
    claims:
      - 自动检测 DataSource、创建 SqlSessionFactory 并扫描 Mapper
      - "mybatis.mapper-locations 指定 classpath 中的 Mapper XML 位置"
  - id: mp-annotations
    title: MyBatis-Plus Annotation Configuration
    url: https://baomidou.com/en/reference/annotation/
    sourceType: official-reference
    appliesTo: MyBatis-Plus 3.5.17
    claims:
      - TableName、TableId 和 TableField 显式连接实体与表列
  - id: mp-data-interface
    title: MyBatis-Plus Persistence Layer Interface
    url: https://baomidou.com/en/guides/data-interface/
    sourceType: official-reference
    appliesTo: MyBatis-Plus 3.5.17
    claims:
      - BaseMapper 与 IService 提供通用 CRUD，不替代业务边界
      - Wrapper API 用结构化条件构建单表查询和更新
  - id: mp-block-attack
    title: MyBatis-Plus Block Attack Plugin
    url: https://baomidou.com/en/plugins/block-attack/
    sourceType: security-standard
    appliesTo: MyBatis-Plus 3.5.17
    claims:
      - Block Attack Plugin 可拦截缺少 WHERE 条件的全表更新和删除
  - id: mp-pagination
    title: MyBatis-Plus Pagination Plugin
    url: https://baomidou.com/en/plugins/pagination/
    sourceType: official-reference
    appliesTo: MyBatis-Plus 3.5.17
    claims:
      - 现代分页使用 MybatisPlusInterceptor 和 PaginationInnerInterceptor
  - id: mp-legacy-source
    title: MyBatis-Plus 3.4.2 Source Tag
    url: https://github.com/baomidou/mybatis-plus/tree/v3.4.2
    sourceType: source-code
    appliesTo: MyBatis-Plus 3.4.2
    claims:
      - 旧 PaginationInterceptor 只属于 Java 8 兼容线
  - id: mp-3-5-17-release
    title: MyBatis-Plus v3.5.17 Release
    url: https://github.com/baomidou/mybatis-plus/releases/tag/v3.5.17
    sourceType: release-note
    appliesTo: MyBatis-Plus 3.5.17
    claims:
      - 官方仓库将 v3.5.17 标记为当前 Latest release，作为本课程现代版本冻结证据
  - id: owasp-sql-injection
    title: OWASP SQL Injection Prevention Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: 通用 SQL 应用安全
    claims:
      - Prepared statements 和参数化查询阻止输入改变 SQL 代码结构
      - 无法使用参数绑定的表名、列名和排序关键字必须来自允许列表或重新设计查询
  - id: owasp-logging
    title: OWASP Logging Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: 通用应用日志安全
    claims:
      - 日志应避免记录密码、令牌和其他敏感数据
  - id: owasp-database-security
    title: OWASP Database Security Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Database_Security_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: 通用数据库安全
    claims:
      - 数据库账户应遵循最小权限原则并限制管理能力
projectEvidence:
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/MybatisPlusConfig.java
    symbol: com.tdh.bdzz.config.MybatisPlusConfig
    usage: corrected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/dao/AnnotationsMapper.java
    symbol: com.tdh.bdzz.dao.AnnotationsMapper
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/dao/CaseMapper.java
    symbol: com.tdh.bdzz.dao.CaseMapper
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/po/AnnotationsEntity.java
    symbol: com.tdh.bdzz.po.AnnotationsEntity
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/EasySqlInjector.java
    symbol: com.tdh.bdzz.config.EasySqlInjector
    usage: corrected
objectives:
  - 能解释 Mapper 接口为何可以在没有实现类时运行。
  - 能让 namespace、statement id、参数名和返回类型保持一致。
  - 能使用参数绑定、动态 SQL、resultMap 和 TypeHandler。
  - 能说明 Spring 如何管理 SqlSession 与事务。
  - 能使用 MyBatis-Plus 映射注解、BaseMapper、Wrapper 和现代分页插件。
  - 能识别字符串替换、XML 漂移、N+1 和旧分页插件误用。
recap:
  - Mapper 代理把接口方法映射到 statement，namespace 与方法名必须唯一对应。
  - 普通值使用参数绑定，动态标识符必须来自严格白名单。
  - resultMap 明确列到属性的映射，XML 必须进入最终 classpath。
  - Spring 管理 Mapper 使用的 SqlSession，业务代码不手工关闭注入的 Mapper。
  - MyBatis-Plus 减少 CRUD 样板，不替代 SQL、索引、事务和领域边界。
  - 现代分页插件与 3.4.2 旧 PaginationInterceptor 不能混用。
---

# MyBatis、Mapper XML 与 MyBatis-Plus

## 为什么需要学习

JDBC 让你直接写 SQL 和读取 ResultSet，但大量重复代码会掩盖真正的查询合同。MyBatis 用 Mapper 接口和 XML
把“Java 方法”连接到“参数化 SQL”，MyBatis-Plus 再减少单表 CRUD 样板。工具越方便，越要理解方法名、
namespace、参数、列名、事务和分页到底如何对应，否则错误常在启动后第一次访问数据库才暴露。

## 学习目标

- 能从 Mapper 方法定位对应 XML statement。
- 能用 `#{}` 绑定普通值，并解释 `${}` 的注入风险。
- 能写出 resultMap、动态 where 和 foreach 查询。
- 能区分 MyBatis SqlSession 与 Spring 管理的 Mapper。
- 能用 MyBatis-Plus 完成单表 CRUD 和现代分页。

## 前置术语

- **Mapper：** 把 Java 方法调用映射到 SQL statement 的接口。
- **statement：** 一个具名的 select、insert、update 或 delete 定义。
- **namespace：** XML 中为 statement 提供唯一作用域的名称。
- **resultMap：** 声明数据库列如何填入 Java 属性的映射表。
- **插件：** 在执行器、语句、参数或结果边界拦截调用的扩展。

## 零基础知识点详解

### 1. Mapper 代理为什么不需要实现类

**它是什么：** MyBatis 运行时为 Mapper 接口创建代理，代理根据接口方法查找并执行 statement。

**有什么作用：** 业务代码只依赖类型安全的 Java 接口，不重复编写 JDBC 资源管理代码。

**什么时候使用：** 查询和写入需要显式 SQL，又希望由框架统一绑定参数、映射结果时。

**怎么使用：**

1. 声明只包含数据访问方法的 Mapper 接口。
2. 注册接口或让 Spring 扫描 Mapper 包。
3. 为每个方法提供注解 SQL 或同名 XML statement。

**最小示例：** `CourseMapper mapper = sqlSession.getMapper(CourseMapper.class)` 返回代理对象。

**运行结果：** 调用 `mapper.findById(1L)` 时代理执行对应 select，并把结果映射为 CourseRow。

**常见误区：** 在 Mapper 中写业务流程，或以为代理会自动推断任意复杂 SQL。

### 2. namespace、statement id 与方法名

**它是什么：** XML namespace 通常等于 Mapper 接口全名，statement id 等于方法名，两者拼成唯一 statement key。

**有什么作用：** 接口方法与 XML 能稳定配对，重复方法名或错误包名会在调用时明确失败。

**什么时候使用：** 所有 XML Mapper 都需要该合同。

**怎么使用：**

1. 把 namespace 写成接口完全限定名。
2. 将 statement id 与接口方法名保持一致。
3. 在冷启动测试中逐个调用关键方法，防止遗留 XML 漂移。

**最小示例：** `namespace="course.CourseMapper"` 与 `<select id="findById">` 对应 `CourseMapper.findById`。

**运行结果：** key 精确匹配时执行查询；拼写不一致时报告 BindingException。

**常见误区：** XML 中保留已删除方法的 statement，误以为打包成功就代表接口合同正确。

### 3. `@Param` 与多参数命名

**它是什么：** `@Param` 为方法参数提供稳定名字，XML 可以用该名字读取值。

**有什么作用：** 编译器是否保留参数名不再影响 SQL 表达式。

**什么时候使用：** Mapper 方法有多个独立参数，或 XML 需要清晰字段名时。

**怎么使用：**

1. 为每个参数使用不同、语义明确的 `@Param`。
2. XML 中使用完全相同的名字。
3. 测试 null、空集合和边界值。

**最小示例：** `find(@Param("status") String status, @Param("limit") int limit)`。

**运行结果：** XML 中 `#{status}` 和 `#{limit}` 分别绑定对应实参。

**常见误区：** 同时依赖 `param1`、`arg0` 和源码参数名，升级编译设置后查询失效。

### 4. Mapper XML 的资源位置

**它是什么：** XML 必须被复制到运行时 classpath，并与配置的 mapperLocations 或同包规则匹配。

**有什么作用：** 开发环境、测试 JAR 和生产包都能找到同一 statement。

**什么时候使用：** SQL 放在 XML，而不是注解中时。

**怎么使用：**

1. 将 XML 放入 `src/main/resources` 的明确目录。
2. 配置统一 location pattern。
3. 检查构建产物内确实包含 XML，并做一次真实冷启动调用。

**最小示例：** `src/main/resources/course/CourseMapper.xml`。

**运行结果：** 打包后的 `BOOT-INF/classes/course` 中仍能找到文件。

**常见误区：** 把 XML 放在 Java 源码目录，依赖偶然的 Maven copy 规则。

### 5. `resultType` 与 `resultMap`

**它是什么：** resultType 依赖自动映射，resultMap 显式声明列、属性、ID、关联和集合。

**有什么作用：** 列名和 Java 属性不一致时仍能稳定映射，嵌套结构也能清晰表达。

**什么时候使用：** 简单同名列可用 resultType；别名、下划线、构造器对象或嵌套对象优先 resultMap。

**怎么使用：**

1. JavaBean 为主键使用 `<id>`、普通列使用 `<result>`。
2. record 或不可变对象使用 `<constructor>`、`<idArg>` 和 `<arg>`。
3. 对 null、重复列名和一对多结果写映射测试。

**最小示例：** JavaBean 使用 `<result column="course_title" property="title"/>`；record 使用构造器参数映射。

**运行结果：** `course_title` 正确进入 `CourseRow.title`，不依赖隐式驼峰设置。

**常见误区：** 对没有 setter 的 record 继续使用属性赋值型 resultMap，或用 `SELECT *` 隐藏列合同。

### 6. `#{}` 参数绑定与 `${}` 文本替换

**它是什么：** `#{}` 创建 JDBC 参数占位符；`${}` 把文本直接拼进 SQL。

**有什么作用：** 参数绑定保留类型并阻断普通输入改变 SQL 结构。

**什么时候使用：** 所有普通值都使用 `#{}`；列名和排序方向只能从代码白名单选择后再生成。

**怎么使用：**

1. WHERE、VALUES 和 SET 中的值统一写 `#{name}`。
2. 动态标识符转换为 enum 或白名单映射。
3. 用恶意字符串做负向测试，确认查询结构不变。

**最小示例：** `WHERE title = #{title}`。

**运行结果：** 输入 `x' OR '1'='1` 仍是一个字符串参数，不会扩展返回全部行。

**常见误区：** 为了解决排序或表名问题把所有参数都改成 `${}`。

### 7. `if`、`where`、`choose` 和 `set`

**它是什么：** MyBatis 动态标签按 Java 参数状态组合 SQL 片段，并自动处理 WHERE/SET 前缀。

**有什么作用：** 可选筛选和部分更新不需要手工拼接易错空格与 AND。

**什么时候使用：** 查询条件数量有限且结构可枚举时。

**怎么使用：**

1. 用 `<where>` 包住多个 `<if>`。
2. 互斥分支用 `<choose>`，避免同时命中。
3. 更新字段用 `<set>`，并防止生成空 UPDATE。

**最小示例：** `<if test="status != null">AND status = #{status}</if>`。

**运行结果：** status 缺失时条件不出现，存在时生成带参数的 AND。

**常见误区：** 用字符串拼接替代动态标签，或空条件生成全表更新。

### 8. `foreach` 与批量参数

**它是什么：** foreach 遍历集合，为 IN 列表或 VALUES 组生成重复占位符。

**有什么作用：** 批量查询和写入仍保持参数化，不手工拼接 ID。

**什么时候使用：** 集合大小有上限，并且数据库允许对应参数数量时。

**怎么使用：**

1. 入口先拒绝空集合或定义空集合结果。
2. 设置 item、open、separator 和 close。
3. 分批处理超大集合，并验证每批事务语义。

**最小示例：** `<foreach collection="ids" item="id" open="(" separator="," close=")">#{id}</foreach>`。

**运行结果：** 三个 ID 生成三个 JDBC 占位符和值。

**常见误区：** 直接把 `ids.toString()` 放进 SQL，或无上限生成数万个参数。

### 9. SqlSession 生命周期

**它是什么：** SqlSession 包含一次数据库会话的 statement、连接和事务上下文，不是线程安全共享对象。

**有什么作用：** 明确谁打开、提交、回滚和关闭会话，避免连接泄漏和跨请求状态污染。

**什么时候使用：** 独立 MyBatis 代码显式使用 try-with-resources；Spring 应用通过注入 Mapper 使用受管会话。

**怎么使用：**

1. 非 Spring 程序从 factory 打开 session。
2. 在 try 中取得 Mapper 并执行操作。
3. 成功 commit，失败 rollback，最后关闭 session。

**最小示例：** `try (SqlSession session = factory.openSession()) { ... }`。

**运行结果：** 操作与一个会话绑定，结束后连接被归还。

**常见误区：** 把 SqlSession 放进 static 字段供多个线程共用。

### 10. MyBatis-Spring 与事务会话

**它是什么：** MyBatis-Spring 让 Mapper 代理取得与当前 Spring 事务绑定的 SqlSession。

**有什么作用：** 多个 Mapper 调用可共享同一个数据库事务，无需业务代码手工 commit。

**什么时候使用：** Spring Service 中通过构造器注入 Mapper 时。

**怎么使用：**

1. 配置唯一 DataSource 与 SqlSessionFactory。
2. 扫描 Mapper 接口并注入 Service。
3. 在 Service 事务边界内调用多个 Mapper。

**最小示例：** `@Transactional public void rename(...) { mapper.updateName(...); auditMapper.insert(...); }`。

**运行结果：** 第二个调用失败时，两个数据库写入一起回滚。

**常见误区：** 对 Spring 注入的 Mapper 手工关闭 session，或在 Mapper 层随意开启新事务。

### 11. TypeHandler 与 JDBC 类型转换

**它是什么：** TypeHandler 在 Java 类型和 JDBC 类型之间读写值，例如 enum 与 VARCHAR。

**有什么作用：** 转换规则集中、可测试，不在每个 SQL 后手工转换。

**什么时候使用：** 值对象、枚举或数据库专有类型有明确双向映射时。

**怎么使用：**

1. 定义 Java 值和数据库表示。
2. 实现 setNonNullParameter 与三个读取方法。
3. 注册到精确 Java/JDBC 类型并测试 null、未知值和往返。

**最小示例：** `CourseStatus.PUBLISHED` 存为 `PUBLISHED` 字符串。

**运行结果：** 写入和读取使用同一映射，未知数据库值产生明确异常。

**常见误区：** 静默把未知值映射为默认枚举，掩盖脏数据。

### 12. MyBatis-Plus 映射注解

**它是什么：** `@TableName`、`@TableId` 和 `@TableField` 声明类、主键和字段的表映射。

**有什么作用：** 通用 CRUD 知道目标表、主键策略和非同名列。

**什么时候使用：** 简单实体使用 BaseMapper 时；复杂联表仍显式写 SQL/resultMap。

**怎么使用：**

1. 在持久化实体上声明表名。
2. 明确主键列与生成策略。
3. 对保留字、非同名列和不持久化字段显式配置。

**最小示例：** `@TableField("course_title") private String title;`。

**运行结果：** BaseMapper 生成的 SQL 使用 `course_title`，Java 仍读写 title。

**常见误区：** 把同一个实体直接当 API DTO，导致数据库字段成为外部合同。

### 13. BaseMapper、Wrapper 与条件更新

**它是什么：** BaseMapper 提供单表 CRUD；Wrapper 用结构化方法描述查询或更新条件。

**有什么作用：** 常见操作少写 XML，同时保留参数化和值类型。

**什么时候使用：** 简单、可读的单表条件；复杂 SQL 仍放 Mapper XML。

**怎么使用：**

1. Mapper 继承 `BaseMapper<CourseEntity>`。
2. 用 LambdaQueryWrapper 引用实体属性。
3. 更新前确保条件非空，并验证影响行数。

**最小示例：** `wrapper.eq(CourseEntity::getStatus, "DRAFT")`。

**运行结果：** 生成参数化 WHERE，返回符合状态的实体。

**常见误区：** 条件为空时执行 update/delete，造成全表修改。

### 14. 现代分页插件

**它是什么：** 现代 MyBatis-Plus 将 `PaginationInnerInterceptor` 放进 `MybatisPlusInterceptor` 插件链。

**有什么作用：** 根据数据库方言生成 count 与分页 SQL，并返回总数和当前页。

**什么时候使用：** 列表 API 需要页码分页且排序稳定时。

**怎么使用：**

1. 创建主 interceptor 并添加分页 inner interceptor。
2. 在链末尾注册分页插件，避免其他 SQL 改写破坏 count。
3. 限制 pageSize，增加唯一排序键，并测试越界页。

**最小示例：** `interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.POSTGRE_SQL));`。

**运行结果：** Page 参数被转换为带 limit/offset 的 SQL，并返回总记录数。

**常见误区：** 在现代线继续复制 3.4.2 的 `PaginationInterceptor` 配置。

### 15. 批量写入、生成键与影响行数

**它是什么：** 批量写入一次处理多条记录；生成键和影响行数用于确认数据库实际结果。

**有什么作用：** 减少往返并及时发现部分失败、重复键或乐观更新未命中。

**什么时候使用：** 数据量有上限、事务和失败策略明确时。

**怎么使用：**

1. 按数据库参数限制切成固定大小批次。
2. 明确主键是应用生成还是数据库生成。
3. 检查每批影响行数，失败时回滚整个业务事务或记录可恢复进度。

**最小示例：** 插入后断言实体 id 非 null 且影响行数等于输入数量。

**运行结果：** 成功批次具有完整主键，失败批次不会留下误报成功的数据。

**常见误区：** 只要方法未抛异常就返回成功，忽略 0 行更新和部分批处理结果。

### 16. N+1 查询与数据边界

**它是什么：** N+1 是先查一批主记录，再为每条记录单独查询关联数据，导致请求次数随条数增长。

**有什么作用：** 识别后可改为 join、批量 IN 或按用例聚合查询，稳定延迟。

**什么时候使用：** 列表映射、嵌套 collection 或循环调用 Mapper 时必须检查。

**怎么使用：**

1. 记录一次用例执行的 SQL 数量。
2. 将循环查询改为一次批量查询。
3. 在内存按 key 分组，并断言总 SQL 次数固定。

**最小示例：** 100 门课程的教师信息由 101 次查询改为 2 次查询。

**运行结果：** 数据量增加时 SQL 次数不再线性增长。

**常见误区：** 为追求一次 SQL 写出巨大笛卡尔积，反而产生重复数据和高内存占用。

## 现代版本中的正确用法

现代主线把 Mapper 保持为持久化端口的基础设施实现：接口和 XML 一一对应，所有普通值参数化，XML 位于资源
目录并进入打包产物。MyBatis-Plus 只用于清晰的单表 CRUD；复杂查询继续使用显式 SQL 和 resultMap。分页、
批量、事务和 N+1 都用可观察的 SQL 数量与数据库结果验证。

## 基本语法

`CourseRow.java` 只声明公开的查询结果类型，文件名必须与 `public` 类型名一致：

```java
package course;

public record CourseRow(long id, String title) {}
```

`CourseMapper.java` 单独声明 Mapper 接口，并通过 `@Param` 固定 XML 使用的参数名：

```java
package course;

import org.apache.ibatis.annotations.Param;

public interface CourseMapper {
    /** 按主键查询课程行。 */
    CourseRow findById(@Param("id") long id);
}
```

```xml
<!DOCTYPE mapper
  PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
  "https://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="course.CourseMapper">
  <resultMap id="courseRow" type="course.CourseRow">
    <constructor>
      <idArg column="id" javaType="_long"/>
      <arg column="course_title" javaType="java.lang.String"/>
    </constructor>
  </resultMap>
  <select id="findById" resultMap="courseRow">
    SELECT id, course_title FROM course WHERE id = #{id}
  </select>
  <select id="search" resultMap="courseRow">
    SELECT id, course_title FROM course
    <where>
      <if test="title != null">AND course_title = #{title}</if>
      <if test="ids != null and ids.size() > 0">
        AND id IN
        <foreach collection="ids" item="id" open="(" separator="," close=")">
          #{id}
        </foreach>
      </if>
    </where>
    ORDER BY id
  </select>
</mapper>
```

## 从零跟着做

先准备 Docker；现代和 Java 8 兼容反馈环都通过固定 Maven/JDK 镜像运行，因此宿主机不要求另外安装
JDK 或 Maven。现代反馈环的临时目录、镜像版本和观察结果必须固定，避免“能运行”却无法知道运行了
哪一版：

```bash
modern_dir="$(mktemp -d /tmp/java-mybatis-modern.XXXXXX)"
mkdir -p "$modern_dir/src/main/java/course" "$modern_dir/src/main/resources/course" \
  "$modern_dir/src/test/java/course"
cd "$modern_dir"
```

在该目录创建下面这个完整 `pom.xml`。Spring Boot 4.1.0 管理 JUnit 6.0.3，其余课程依赖都使用精确
版本；3.5.9 起分页插件还必须显式加入 `mybatis-plus-jsqlparser`：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>4.1.0</version>
  </parent>
  <groupId>course</groupId>
  <artifactId>mybatis-modern-feedback</artifactId>
  <version>1.0.0</version>
  <properties>
    <java.version>25</java.version>
  </properties>
  <dependencies>
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
      <groupId>org.mybatis</groupId>
      <artifactId>mybatis</artifactId>
      <version>3.5.19</version>
    </dependency>
    <dependency>
      <groupId>org.mybatis</groupId>
      <artifactId>mybatis-spring</artifactId>
      <version>4.0.0</version>
    </dependency>
    <dependency>
      <groupId>com.h2database</groupId>
      <artifactId>h2</artifactId>
      <version>2.4.240</version>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
    </dependency>
  </dependencies>
</project>
```

把前面的查询结果保存为 `src/main/java/course/CourseRow.java`，把 XML 保存为
`src/main/resources/course/CourseMapper.xml`。后面给出的完整 Mapper 接口保存为
`src/main/java/course/CourseMapper.java`，并让它继承 `BaseMapper<CourseEntity>`。先把下面的分页配置
保存为 `src/main/java/course/PaginationConfig.java`：

```java
package course;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.BlockAttackInnerInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** 配置 MyBatis-Plus 3.5.17 现代分页与写保护插件。 */
@Configuration
public class PaginationConfig {
    /** 注册全表写保护和页大小上限为 100 的分页拦截器。 */
    @Bean
    public MybatisPlusInterceptor paginationInterceptor() {
        PaginationInnerInterceptor pagination = new PaginationInnerInterceptor(DbType.H2);
        pagination.setMaxLimit(100L);
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new BlockAttackInnerInterceptor());
        interceptor.addInnerInterceptor(pagination);
        return interceptor;
    }
}
```

把事务服务保存为 `src/main/java/course/CourseService.java`：

```java
package course;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 演示由 Spring 代理管理的事务边界。 */
@Service
public class CourseService {
    private final CourseMapper mapper;

    /** 注入课程 Mapper。 */
    public CourseService(CourseMapper mapper) {
        this.mapper = mapper;
    }

    /** 写入后故意失败，用于观察事务回滚。 */
    @Transactional
    public void createThenFail() {
        mapper.insertTitle(3L, "rollback");
        throw new IllegalStateException("rollback");
    }
}
```

把下面两个文件分别保存为 `src/main/java/course/CourseEntity.java` 和
`src/main/java/course/CourseMapper.java`，后一个文件替换前面只含 `findById` 的最小接口：

```java
package course;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

/** 映射课程表的可变持久化实体。 */
@TableName("course")
public class CourseEntity {
    @TableId
    private Long id;

    @TableField("course_title")
    private String title;

    /** 返回课程主键。 */
    public Long getId() { return id; }

    /** 设置课程主键。 */
    public void setId(Long id) { this.id = id; }

    /** 返回课程标题。 */
    public String getTitle() { return title; }

    /** 设置课程标题。 */
    public void setTitle(String title) { this.title = title; }
}
```

```java
package course;

import java.util.List;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/** 定义课程表的数据访问合同。 */
public interface CourseMapper extends BaseMapper<CourseEntity> {
    /** 按主键查询只读结果。 */
    CourseRow findById(@Param("id") long id);

    /** 按可选标题和主键集合查询课程。 */
    List<CourseRow> search(@Param("title") String title, @Param("ids") List<Long> ids);

    /** 插入一条课程记录。 */
    @Insert("INSERT INTO course(id, course_title) VALUES(#{id}, #{title})")
    int insertTitle(@Param("id") long id, @Param("title") String title);

    /** 按标题统计课程记录。 */
    @Select("SELECT COUNT(*) FROM course WHERE course_title = #{title}")
    long countByTitle(@Param("title") String title);
}
```

`src/main/java/course/CourseApplication.java` 只负责建立可扫描的最小上下文：

```java
package course;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** 提供最小 Spring Boot 测试上下文。 */
@SpringBootApplication
@MapperScan("course")
public class CourseApplication {}
```

为反馈环增加 `src/main/java/course/QueryCountInterceptor.java`。它只统计测试期间实际经过 MyBatis
Executor 的查询，不能用日志行数代替：

```java
package course;

import java.util.concurrent.atomic.AtomicInteger;

import org.apache.ibatis.executor.Executor;
import org.apache.ibatis.mapping.MappedStatement;
import org.apache.ibatis.plugin.Interceptor;
import org.apache.ibatis.plugin.Intercepts;
import org.apache.ibatis.plugin.Invocation;
import org.apache.ibatis.plugin.Signature;
import org.apache.ibatis.session.ResultHandler;
import org.apache.ibatis.session.RowBounds;

/** 统计课程反馈环执行的查询次数。 */
@Intercepts(
        @Signature(
                type = Executor.class,
                method = "query",
                args = {MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class}))
public class QueryCountInterceptor implements Interceptor {
    private final AtomicInteger count = new AtomicInteger();

    /** 记录一次查询并继续执行。 */
    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        count.incrementAndGet();
        return invocation.proceed();
    }

    /** 清零查询次数。 */
    public void reset() {
        count.set(0);
    }

    /** 返回当前查询次数。 */
    public int count() {
        return count.get();
    }
}
```

把测试类完整内容保存为 `src/test/java/course/MybatisFeedbackTest.java`：

```java
package course;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;

import com.baomidou.mybatisplus.core.exceptions.MybatisPlusException;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.session.SqlSessionFactory;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.MyBatisSystemException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/** 验证 Mapper XML、现代分页和 Spring 事务回滚。 */
@SpringBootTest
class MybatisFeedbackTest {
    @Autowired
    private CourseMapper mapper;

    @Autowired
    private CourseService service;

    @Autowired
    private SqlSessionFactory sqlSessionFactory;

    /** 运行课程最小反馈环。 */
    @Test
    void verifiesMapperPaginationAndRollback() {
        QueryCountInterceptor queryCount = new QueryCountInterceptor();
        sqlSessionFactory.getConfiguration().addInterceptor(queryCount);
        assertEquals("Java", mapper.findById(1L).title());
        assertEquals(1, mapper.search("Java", List.of(1L, 2L)).size());
        queryCount.reset();
        assertEquals(2, mapper.search(null, List.of(1L, 2L)).size());
        assertEquals(1, queryCount.count());
        assertEquals(0, mapper.search("Java' OR '1'='1", List.of(1L, 2L)).size());
        assertEquals(1, mapper.selectPage(Page.of(1, 1), null).getRecords().size());
        MyBatisSystemException blockedDelete =
                assertThrows(MyBatisSystemException.class, () -> mapper.delete(Wrappers.emptyWrapper()));
        assertInstanceOf(MybatisPlusException.class, blockedDelete.getCause());
        assertEquals(2L, mapper.selectCount(null));
        assertThrows(IllegalStateException.class, service::createThenFail);
        assertEquals(0L, mapper.countByTitle("rollback"));
        System.out.println(
                "MYBATIS_FEEDBACK_PASS rows=2 dynamicRows=1 foreachRows=2 injectionRows=0 "
                        + "batchQueryCount=1 emptyWrapperRows=2 rollbackRows=0");
    }
}
```

把应用配置保存为 `src/main/resources/application.properties`，不能只在 IDE 中临时设置：

```properties
spring.datasource.url=jdbc:h2:mem:course;DB_CLOSE_DELAY=-1
spring.datasource.username=sa
spring.datasource.password=
spring.sql.init.mode=always
mybatis-plus.mapper-locations=classpath:/course/*.xml
```

把建表与初始数据保存为 `src/main/resources/schema.sql`：

```sql
DROP TABLE IF EXISTS course;
CREATE TABLE course (id BIGINT PRIMARY KEY, course_title VARCHAR(100) NOT NULL);
INSERT INTO course(id, course_title) VALUES (1, 'Java'), (2, 'SQL');
```

1. 运行 `docker run --rm -v "$modern_dir:/workspace" -w /workspace maven:3.9.12-eclipse-temurin-25 mvn -q test`。
2. 打开 `target/surefire-reports/TEST-course.MybatisFeedbackTest.xml`，确认 `tests="1"`、`failures="0"`、`errors="0"` 和 `MYBATIS_FEEDBACK_PASS rows=2 dynamicRows=1 foreachRows=2 injectionRows=0 batchQueryCount=1 emptyWrapperRows=2 rollbackRows=0`。
3. 执行 `test -f target/classes/course/CourseMapper.xml`，确认 XML 已进入最终 classpath。
4. 运行三次 Catalog 冷启动，每次都应打印 `PASS`，且第 14 批仍为 `planned`。

Java 8 兼容反馈环必须是另一个完整 Maven 项目。先创建临时目录与 Java 源码父目录：

```bash
legacy_dir="$(mktemp -d /tmp/java-mybatis-legacy.XXXXXX)"
mkdir -p "$legacy_dir/src/main/java/course"
cd "$legacy_dir"
```

再写入这个 `pom.xml`：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.3.12.RELEASE</version>
  </parent>
  <groupId>course</groupId>
  <artifactId>mybatis-legacy-feedback</artifactId>
  <version>1.0.0</version>
  <properties>
    <java.version>8</java.version>
  </properties>
  <dependencies>
    <dependency>
      <groupId>com.baomidou</groupId>
      <artifactId>mybatis-plus-boot-starter</artifactId>
      <version>3.4.2</version>
    </dependency>
  </dependencies>
</project>
```

在 `$legacy_dir/src/main/java/course/LegacyPaginationConfig.java` 写入 Java 8 兼容配置：

```java
package course;

import com.baomidou.mybatisplus.extension.plugins.PaginationInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** 仅用于理解冻结项目的旧分页配置。 */
@Configuration
public class LegacyPaginationConfig {
    /** 注册 MyBatis-Plus 3.4.2 的旧分页拦截器。 */
    @Bean
    public PaginationInterceptor paginationInterceptor() {
        PaginationInterceptor interceptor = new PaginationInterceptor();
        interceptor.setLimit(100L);
        return interceptor;
    }
}
```

执行 `docker run --rm -v "$legacy_dir:/workspace" -w /workspace maven:3.9.12-eclipse-temurin-8 mvn -q -DskipTests package`。
class 文件 major version 应为 52，且 JAR 存在时才能记录 `LEGACY_PAGINATION_COMPILE_PASS 3.4.2`。这一步只
证明旧项目可理解，不能把旧拦截器复制回现代配置。

现代和 legacy 两个反馈环都完成后，从 `/tmp` 执行 `rm -R -- "$modern_dir" "$legacy_dir"`，再执行
`test ! -e "$modern_dir" && test ! -e "$legacy_dir"`；不存在性检查失败就不能报告本批完成。

## 如何使用

从用例需要的返回数据倒推 SQL 和 resultMap，不从实体字段自动暴露 API。先写接口合同与查询测试，再决定用
XML、注解 SQL 或 MyBatis-Plus Wrapper。每个动态结构都有白名单，每个批量入口都有数量上限。

## 适用与不适用场景

MyBatis 适合团队需要精确控制 SQL 与映射的系统；MyBatis-Plus 适合清晰单表 CRUD。不适合用 Wrapper 隐藏复杂
联表、厂商语法或大量动态分支。无论使用哪一个，数据库约束、索引和事务仍是必要基础。

## 当前项目补充

冻结证据表明项目同时使用 Mapper XML、MyBatis-Plus 实体注解、BaseMapper 和自定义 SQL 注入器。课程只提取
能力，不复制业务 SQL；XML 与接口漂移、源码目录 XML 和旧 PaginationInterceptor 都作为纠错项。

## Java 8 / Spring Boot 2.3 兼容写法

Java 8/Boot 2.3 项目使用 MyBatis-Plus 3.4.2 时可见旧 `PaginationInterceptor`。它只用于理解冻结项目，
不要复制到现代工程。Mapper、`#{}`、resultMap、SqlSession 与 Spring 事务的基本心智模型保持一致。

## 新旧版本差异

| 对比项 | 现代稳定线 | Java 8 / 3.4.2 | 迁移注意 |
| --- | --- | --- | --- |
| 分页 | MybatisPlusInterceptor + PaginationInnerInterceptor | PaginationInterceptor | 配置类不能直接照搬 |
| Java 模型 | 可用 record 作为只读结果 | 普通 JavaBean | 显式构造/访问器 |
| Mapper/XML | namespace 与 statement 合同 | 相同 | 迁移时先验证资源路径 |
| 参数绑定 | `#{}` | `#{}` | 两条线都禁止普通值 `${}` |

## 易错点

### 错误：namespace 或 statement id 漂移

**现象：** 启动成功，第一次调用方法才报 Invalid bound statement。

**触发条件：** Mapper 接口改包名、方法改名或删除后，XML 的 namespace 或 statement id 没有同步修改。

**原因：** MyBatis 使用“接口全名 + 方法名”查找 statement；XML 能被解析不代表这个 key 与接口一致。

**后果：** 对应数据访问方法在运行时不可用，请求会在首次执行该方法时失败。

**错误写法：** XML namespace 仍指向旧包，或 id 对应已删除方法。

**正确写法：** 让 namespace 等于接口全名、id 等于方法名，并逐个调用关键 Mapper。

**影响版本：** 本课已核验的 MyBatis 3.5.19 现代线。

**验证：** 冷启动后执行每个 statement 的最小查询。

**来源依据：** frontmatter 中的“MyBatis Mapper XML”来源卡说明 namespace 与 statement 的绑定合同。

### 错误：用 `${}` 拼接普通输入

**现象：** 恶意 title 改变 WHERE 结构。

**触发条件：** 把请求参数、表单值或其他不可信普通值直接放进 `${}`。

**原因：** `${}` 在 SQL 交给数据库前执行原样文本替换，不会创建 JDBC 参数占位符。

**后果：** 输入可以改变 SQL 语法，造成越权查询、错误更新或 SQL 注入。

**错误写法：** `WHERE title = '${title}'`。

**正确写法：** `WHERE title = #{title}`；动态列来自 enum 白名单。

**影响版本：** 本课已核验的 MyBatis 3.5.19 现代线。

**验证：** 注入样本只作为参数值，不能扩大返回行数。

**来源依据：** frontmatter 中的“MyBatis Mapper XML”来源卡明确记录 `#{}` 参数绑定与 `${}` 文本替换的区别；SQL 注入防护由“OWASP SQL Injection Prevention Cheat Sheet”来源卡支持。

### 错误：XML 没有进入生产包

**现象：** IDE 测试能运行，部署包报 statement 不存在。

**触发条件：** XML 位于 Java 源码目录，或构建只在开发环境通过额外复制规则提供资源。

**原因：** MyBatis 只能加载运行时 classpath 或明确 mapperLocations 中实际存在的 XML。

**后果：** 本地源码树看得到 statement，但生产进程无法注册它，对应 Mapper 调用失败。

**错误写法：** XML 放源码目录并依赖未记录 copy 规则。

**正确写法：** 放 resources 并检查构建产物。

**影响版本：** 本课已核验的 MyBatis 3.5.19 与 MyBatis Spring Boot Starter 4.0.0 现代线。

**验证：** 解包产物确认 XML 路径，再从产物启动调用。

**来源依据：** frontmatter 中的“MyBatis 3 Getting Started”、“MyBatis Configuration”和“MyBatis Spring Boot Starter”来源卡共同说明 XML 资源配置、classpath 加载和 Mapper 注册。

### 错误：空 Wrapper 执行更新

**现象：** 一个条件缺失请求修改整张表。

**触发条件：** 业务筛选值为空时仍创建无条件 Wrapper，并把它交给 update 或 delete。

**原因：** Wrapper 只描述调用者提供的条件；条件为空时不会自动推断业务范围。

**后果：** 更新或删除作用于所有可见行，造成批量数据损坏。

**错误写法：** 条件可为空却直接 `update(entity, wrapper)`。

**正确写法：** 写操作提供明确 WHERE 条件，并注册 `BlockAttackInnerInterceptor` 作为无条件写入保护层。

**影响版本：** 本课已核验的 MyBatis-Plus 3.5.17 现代线。

**验证：** 空条件负向测试必须拒绝且影响行数为 0。

**来源依据：** frontmatter 中的“MyBatis-Plus Persistence Layer Interface”来源卡界定 Wrapper 条件 API；“MyBatis-Plus Block Attack Plugin”来源卡支持拦截无 WHERE 的写操作，本课负向反馈环负责验证插件拒绝空条件。

### 错误：列表循环内查询

**现象：** 20 条数据产生 21 次 SQL，数据量增加时延迟线性增长。

**触发条件：** 先查询列表，再在循环或嵌套结果映射中为每条记录执行一次关联查询。

**原因：** 每个主记录都触发独立 statement，SQL 次数由固定次数变为 `1 + N`。

**后果：** 数据量增加时数据库往返、连接占用和请求延迟随之增长。

**错误写法：** for 循环中逐条调用 Mapper。

**正确写法：** 批量 IN 查询后按 ID 分组。

**影响版本：** 本课已核验的 MyBatis 3.5.19 现代线。

**验证：** 断言批量列表查询只执行 1 次 SQL，而不是在循环中执行 N 次查询。

**来源依据：** frontmatter 中的“MyBatis Mapper XML”来源卡记录嵌套 select 可能产生 N+1 查询；本课反馈环以 SQL 次数断言验证修正后的批量查询策略。

## 安全注意

- 普通输入一律使用 `#{}` 参数绑定；动态列名、排序方向和表名只能从代码中的有限白名单选择。
- 删除和更新入口启用 Block Attack 保护，拦截缺少 WHERE 条件的全表操作。
- 日志只记录 statement 标识、耗时和行数，不记录密码、令牌或完整个人数据参数。
- 数据库账号按最小权限配置，课程查询账号不应拥有建表、授权或访问其他业务 schema 的能力。

安全依据：参数化查询与动态标识符白名单、无 WHERE 写操作拦截、敏感字段脱敏和数据库最小权限分别由
frontmatter 中的 OWASP SQL Injection、MyBatis-Plus Block Attack、OWASP Logging 和 OWASP Database
Security 来源卡支持。

## 如何验证

1. MyBatis 3.5.19/H2 反馈环验证 XML 绑定、resultMap、动态 SQL、foreach、参数注入负向样本和事务回滚。
2. MyBatis-Plus 3.5.17 反馈环验证 BaseMapper 与现代分页插件。
3. Java 8/MyBatis-Plus 3.4.2 fixture 编译旧分页配置并标记只作兼容。
4. 运行 Catalog 三次冷启动、知识路径、type-check、lint、format、unit、E2E 和 build。
5. 桌面与 390px 检查 16 个知识点、编号逐项换行、官方来源唯一和无横向溢出。

::::exercise
### 练习：实现分页课程查询

**要求：** 实现 `CourseMapper.search(status, ids, page)`；普通值全部使用参数绑定，空筛选不生成多余
`AND`，ID 列表通过 `foreach` 生成，resultMap 显式映射 title，分页大小上限为 100。

**验收：** 合法条件返回稳定排序结果；空集合有明确语义；注入样本不能改变 SQL 结构；越界页不会绕过
页大小上限；Mapper XML 能从最终 classpath 加载。

**参考答案：** 用 `@Param` 固定参数名，`<where>` 组合可选条件，`foreach` 生成占位符，分页插件放在
拦截器链末尾，并以 `id` 作为最终唯一排序键。
::::

## 本节小结

MyBatis 的核心不是 XML，而是接口、statement、参数和结果之间的可验证合同。MyBatis-Plus 只减少清晰单表
CRUD 的样板。只要坚持参数化、显式映射、受管 SqlSession、现代分页和真实 SQL 反馈环，数据访问层就能保持
可读、可测试且不把旧项目兼容写法误当成新标准。
