# MyBatis、Mapper XML 与 MyBatis-Plus 研究稿

> 课程 ID：`backend.java.learn.intermediate.mybatis-and-mybatis-plus`
> 顺序：420（中级第 13/17 批）
> 核验日期：2026-08-09
> 现代基线：Java 25、Spring Boot 4.1.0、MyBatis 3.5.19、MyBatis-Spring 4.0.0、MyBatis Spring Boot Starter 4.0.0、MyBatis-Plus 3.5.17
> 兼容基线：Java 8、Spring Boot 2.3.12.RELEASE、MyBatis-Plus 3.4.2

## 冻结课程合同

| 项目 | 冻结值 |
| --- | --- |
| 前置课程 | `relational-data-and-sql-foundations`、`dependency-injection-and-bean-lifecycle` |
| 来源能力 | `JAVA-FRAMEWORK-014`、`JAVA-FRAMEWORK-015`、`JAVA-RISK-040` |
| 项目证据 | MyBatis 149 个文件、MyBatis-Plus 492 个文件；只引用冻结矩阵 |
| 后继边界 | 本批关闭前不领取 `transactions-and-idempotency` |

## 官方来源核验

| 来源 | 适用版本 | 支撑结论 |
| --- | --- | --- |
| [MyBatis 3 Getting Started](https://mybatis.org/mybatis-3/getting-started.html) | MyBatis 3.5.19 | SqlSessionFactory、配置和 Mapper 入口 |
| [MyBatis Mapper XML](https://mybatis.org/mybatis-3/sqlmap-xml.html) | MyBatis 3.5.19 | namespace、statement、参数、resultMap 与缓存合同 |
| [MyBatis Dynamic SQL](https://mybatis.org/mybatis-3/dynamic-sql.html) | MyBatis 3.5.19 | if、choose、where、set、foreach 的安全组合 |
| [MyBatis Java API](https://mybatis.org/mybatis-3/java-api.html) | MyBatis 3.5.19 | SqlSession 生命周期、Mapper 代理和事务控制 |
| [MyBatis Configuration](https://mybatis.org/mybatis-3/configuration.html) | MyBatis 3.5.19 | settings、typeAliases、typeHandlers、mappers 与环境配置 |
| [MyBatis-Spring Reference](https://mybatis.org/spring/) | MyBatis-Spring 4.0.0 | Spring 事务内 SqlSession 与 Mapper 注入 |
| [MyBatis Spring Boot Starter](https://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/) | MyBatis Spring Boot Starter 4.0.0 | 自动检测 DataSource、SqlSessionFactory、模板与 Mapper |
| [MyBatis-Plus v3.5.17 release](https://github.com/baomidou/mybatis-plus/releases/tag/v3.5.17) | MyBatis-Plus 3.5.17 | 现代版本冻结证据；GitHub 官方仓库的 Latest release |
| [MyBatis-Plus Annotation Configuration](https://baomidou.com/en/reference/annotation/) | MyBatis-Plus 3.5.17 | TableName、TableId、TableField 等映射注解 |
| [MyBatis-Plus Persistence Layer Interface](https://baomidou.com/en/guides/data-interface/) | MyBatis-Plus 3.5.17 | BaseMapper、IService 和通用 CRUD 合同 |
| [MyBatis-Plus Pagination Plugin](https://baomidou.com/en/plugins/pagination/) | MyBatis-Plus 3.5.17 | MybatisPlusInterceptor 与 PaginationInnerInterceptor 现代分页链 |
| [MyBatis-Plus 3.4.2 Source Tag](https://github.com/baomidou/mybatis-plus/tree/v3.4.2) | MyBatis-Plus 3.4.2 | 旧 PaginationInterceptor 和 Java 8 兼容边界 |
| [MyBatis-Plus Block Attack Plugin](https://baomidou.com/en/plugins/block-attack/) | MyBatis-Plus 3.5.17 | 拦截缺少 WHERE 条件的全表更新和删除 |
| [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) | 通用 SQL 应用安全 | Prepared statements 和参数化查询保护 SQL 代码结构 |
| [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) | 通用应用日志安全 | 日志避免记录密码、令牌和其他敏感数据 |
| [OWASP Database Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Database_Security_Cheat_Sheet.html) | 通用数据库安全 | 数据库账户遵循最小权限原则 |

## 核心合同

Mapper 接口方法与 XML statement 通过 namespace 加方法名形成唯一键；参数必须用 `#{}` 绑定，只有经过严格
白名单选择的表名/列名才可能使用 `${}`。`resultMap` 显式连接列名、Java 属性和嵌套关系，不能依赖偶然别名。
Spring 管理 SqlSession 和事务，应用不手工关闭注入的 Mapper。MyBatis-Plus 减少单表 CRUD 样板，不替代 SQL、
索引、事务和 DTO 边界；无条件写保护、参数化查询、日志脱敏和数据库最小权限属于额外安全合同。

## 项目证据与纠错

- `MybatisPlusConfig`、`AnnotationsMapper`、`CaseMapper`：观察 Mapper 扫描、XML 与插件能力。
- `AnnotationTypesEntity`、`AnnotationsEntity`、`BookmarksEntity`：观察 TableName/TableId/TableField 映射。
- `EasySqlInjector`：只作为扩展点证据，不在入门主线复制自定义注入器。
- 风险 `JAVA-RISK-040`：XML statement 与 Java 方法、XML 资源路径必须由打包与冷启动测试验证。
- 旧 `PaginationInterceptor` 只进入 Java 8/3.4.2 兼容补充；现代示例使用内层分页插件。

## 零基础拆分与反馈环

正式课程按 16 个小点展开：Mapper 代理、namespace/statement、参数命名、XML 位置、resultType/resultMap、
参数绑定、动态 SQL、foreach、SqlSession、Spring 事务、TypeHandler、映射注解、BaseMapper、Wrapper、分页和批量/N+1。

现代反馈环固定使用 MyBatis 3.5.19、MyBatis-Plus 3.5.17、Spring Boot 4.1.0 与 H2，验证接口/XML 绑定、
参数化查询、动态 `<where>/<if>`、`foreach`、resultMap、注入负向样本、BaseMapper、现代分页插件和回滚；legacy 反馈环固定使用 Java 8、
Boot 2.3.12、MP 3.4.2 编译旧分页配置。所有 fixture 仅位于 `/tmp`，结束后做不存在性检查。

## 研究 Gate 自检

- [x] 16 个官方直接来源覆盖 MyBatis 核心、Spring 集成、MyBatis-Plus CRUD、无条件写保护、注解、分页、旧版本源码和安全边界。
- [x] 16 个知识点均有执行顺序、结果、误区和验证目标。
- [x] 项目路径只来自冻结矩阵，没有读取或运行 `dzzz-app`。
- [x] 第 14 批仍保持 planned，未提前注册 loader。
