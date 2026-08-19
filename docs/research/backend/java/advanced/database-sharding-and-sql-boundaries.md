# Java 高级第 7 门：分片、动态 SQL 与数据访问边界研究

> 课程 ID：`backend.java.learn.advanced.database-sharding-and-sql-boundaries`
>
> 冻结顺序：560
>
> 研究日期：2026-08-11
>
> 冻结快照：`dzzz-app-20260803-179e722831ab`
> 边界：只使用冻结任务提供的 Phase 2 矩阵/清单和本稿已核验的官方资料，不读取、运行或修改 `dzzz-app`

## 冻结课程合同

- 标题：分片、动态 SQL 与数据访问边界。
- 阶段：`advanced`，深度：`lesson`，课程顺序：`560`。
- 前置课程：
  1. `backend.java.learn.intermediate.mybatis-and-mybatis-plus`。
  2. `backend.java.learn.advanced.reflection-aop-and-cross-cutting-contracts`。
- 来源能力必须保持为：
  1. `JAVA-ENGINEERING-003`：持久化、分片与数据访问边界。
  2. `JAVA-RISK-003`：数据访问合同职责过载。
  3. `JAVA-RISK-038`：反射绕过类型合同与分片参数脆弱性。
  4. `JAVA-RISK-039`：SQL 文本改写、动态标识符与厂商耦合。
- 选择理由：项目存在反射分片与 SQL 文本改写；课程主线以类型化边界和可验证 SQL 为准。
- 冻结状态必须保持 `researchStatus: not-started`、`exampleStatus: not-started`、`courseStatus: planned`；本研究稿不修改矩阵、track、manifest、课程正文或 signoff。
- 本课不引入 ShardingSphere、JSQLParser 或新的数据库驱动依赖。ShardingSphere 官方文档只作为路由、解析和观测的概念证据；示例仍以 MyBatis/MyBatis-Spring/MyBatis-Plus 的边界为主。

## 研究范围与版本基线

### 现代主线

- Java 25 LTS。
- Spring Boot 4.1.0、Spring Framework 7.0.8。
- MyBatis 3.5.19、MyBatis-Spring 4.0.0、MyBatis-Spring-Boot-Starter 4.0.0、MyBatis-Plus 3.5.17。
- `${}` 与 `#{}`、动态 SQL、Mapper、事务和 MyBatis-Plus 拦截器行为按上述精确版本解释。
- ShardingSphere 5.5.2/5.5.3 文档只用来解释逻辑表、实际表、单表、广播表、绑定表和路由结果，不把它们当成课程依赖。

### 兼容线

- Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE。
- 项目旧线使用 MyBatis-Plus 3.4.2 的动态表拦截器 API；不能把 3.5.6 之后的 `JsqlParserGlobal` 或现代插件类直接复制到旧线。
- Java 8 可以使用 MyBatis 3.5.x 的基础 Mapper/XML/参数绑定合同，但不能假设现代 starter 的 Java 17 要求在旧 Boot 线上成立。

## 已核验的官方直接来源

以下 25 个 URL 均先由 Tavily 发现，再使用官方页面、精确版本标签或官方源码回查；核验日期为 2026-08-11。没有使用社区文章、问答或搜索摘要支撑结论。

### 版本与框架基线

1. **`oracle-java-support-roadmap`**
   - 标题：Oracle Java SE Support Roadmap。
   - URL：<https://www.oracle.com/java/technologies/java-se-support-roadmap.html>。
   - `sourceType: official-reference`；`appliesTo: Java 25`；`verifiedAt: 2026-08-11`。
   - `claims`：Oracle 支持路线将 Java 25 列为 LTS；本课现代 Java 基线固定为 25。
2. **`boot41-system-requirements`**
   - 标题：Spring Boot System Requirements。
   - URL：<https://docs.spring.io/spring-boot/system-requirements.html>。
   - `sourceType: official-reference`；`appliesTo: Spring Boot 4.1.0`；`verifiedAt: 2026-08-11`。
   - `claims`：Boot 4.1.0 支持 Java 17 至 26，并要求 Spring Framework 7.0.8 以上；Java 25 在范围内。
3. **`boot2312-system-requirements`**
   - 标题：Spring Boot 2.3.12.RELEASE System Requirements。
   - URL：<https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements>。
   - `sourceType: official-reference`；`appliesTo: Spring Boot 2.3.12.RELEASE`；`verifiedAt: 2026-08-11`。
   - `claims`：旧线要求 Java 8，最高兼容 Java 15，并要求 Spring Framework 5.2.15.RELEASE 或更高版本。
4. **`mybatis319-sqlmap-xml`**
   - 标题：MyBatis 3 Mapper XML Files。
   - URL：<https://mybatis.org/mybatis-3/sqlmap-xml.html>。
   - `sourceType: official-reference`；`appliesTo: MyBatis 3.5.19`；`verifiedAt: 2026-08-11`。
   - `claims`：`#{}` 创建 PreparedStatement 参数；`${}` 是不修改、不转义的原样文本替换，适合 SQL 元数据但必须限制来源；Mapper XML 的 mapped statement 是执行合同。
5. **`mybatis319-dynamic-sql`**
   - 标题：MyBatis 3 Dynamic SQL。
   - URL：<https://mybatis.org/mybatis-3/dynamic-sql.html>。
   - `sourceType: official-reference`；`appliesTo: MyBatis 3.5.19`；`verifiedAt: 2026-08-11`。
   - `claims`：`if`、`choose`、`trim`/`where`/`set`、`foreach` 是受控动态 SQL 元素；可插拔 LanguageDriver 负责从脚本创建 `SqlSource` 和 `ParameterHandler`。
6. **`mybatis319-logging`**
   - 标题：MyBatis 3 Logging。
   - URL：<https://mybatis.org/mybatis-3/logging.html>。
   - `sourceType: official-reference`；`appliesTo: MyBatis 3.5.19`；`verifiedAt: 2026-08-11`。
   - `claims`：可按 mapper、namespace 或具体 statement 配置日志；SQL 在 DEBUG 级别、结果在 TRACE 级别；运行时可选择 SLF4J、Log4j2、JDK logging 等实现。
7. **`mybatis-spring-boot400-intro`**
   - 标题：MyBatis-Spring-Boot-Starter Introduction。
   - URL：<https://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/index.html>。
   - `sourceType: official-reference`；`appliesTo: MyBatis-Spring-Boot-Starter 4.0.0`；`verifiedAt: 2026-08-11`。
   - `claims`：4.0 线要求 Spring Boot 4.0+ 与 Java 17+，并自动创建 `SqlSessionFactory`/`SqlSessionTemplate`、扫描 Mapper；这只说明依赖装配，不保证分片路由正确。
8. **`mybatis-spring-transactions`**
   - 标题：MyBatis-Spring Transactions。
   - URL：<https://mybatis.org/spring/transactions.html>。
   - `sourceType: official-reference`；`appliesTo: MyBatis-Spring 4.0.0`；`verifiedAt: 2026-08-11`。
   - `claims`：Spring 事务中单个 `SqlSession` 覆盖整个事务并按完成结果提交或回滚；不能手工对 Spring 管理的 session 调用 commit/rollback/close；事务外 mapper 调用会自动提交。

### MyBatis-Plus 动态表和解析边界

9. **`mybatis-plus3517-release`**
   - 标题：MyBatis-Plus v3.5.17 Release。
   - URL：<https://github.com/baomidou/mybatis-plus/releases/tag/v3.5.17>。
   - `sourceType: release-note`；`appliesTo: MyBatis-Plus 3.5.17`；`verifiedAt: 2026-08-11`。
   - `claims`：v3.5.17 是本课现代 MyBatis-Plus 基线的精确发布标签；具体插件能力分别由官方文档和该标签源码核验。
10. **`mybatis-plus3517-dynamic-table`**
    - 标题：MyBatis-Plus Dynamic Table Name Plugin。
    - URL：<https://baomidou.com/en/plugins/dynamic-table-name/>。
    - `sourceType: official-reference`；`appliesTo: MyBatis-Plus 3.5.17`；`verifiedAt: 2026-08-11`。
    - `claims`：`DynamicTableNameInnerInterceptor` 在执行前按 handler 规则替换表名；官方建议使用复杂前缀（如 `mp_dt_`）避免误替换，并要求表名规则防止 SQL 注入及遵守数据库命名规则。
11. **`mybatis-plus3517-plugin-core`**
    - 标题：MyBatis-Plus Plugin Core。
    - URL：<https://baomidou.com/en/plugins/>。
    - `sourceType: official-reference`；`appliesTo: MyBatis-Plus 3.5.17`；`verifiedAt: 2026-08-11`。
    - `claims`：3.5.6 起 JSQLParser 支持可复用解析线程池，3.5.11+ 使用 `JsqlParserGlobal.setExecutorService`；自建线程池由应用负责关闭；解析缓存和版本差异必须显式配置和验证。
12. **`mybatis-plus-security-guidance`**
    - 标题：MyBatis-Plus Preventing Security Vulnerabilities。
    - URL：<https://baomidou.com/en/reference/about-cve/>。
    - `sourceType: official-reference`；`appliesTo: MyBatis-Plus 3.4.3.2 / 3.5.3.2 / 3.5.17 guidance`；`verifiedAt: 2026-08-11`。
    - `claims`：不要让前端直接传 SQL 片段；`SqlInjectionUtils.check` 始于 3.4.3.2，`Wrapper.checkSqlInjection` 始于 3.5.3.2，二者在 3.4.2 均不可用且不能代替后端 allowlist。
13. **`mybatis-plus3517-dynamic-table-source`**
    - 标题：MyBatis-Plus v3.5.17 DynamicTableNameInnerInterceptor Source。
    - URL：<https://github.com/baomidou/mybatis-plus/blob/v3.5.17/mybatis-plus-extension/src/main/java/com/baomidou/mybatisplus/extension/plugins/inner/DynamicTableNameInnerInterceptor.java>。
    - `sourceType: source-code`；`appliesTo: MyBatis-Plus v3.5.17`；`verifiedAt: 2026-08-11`。
    - `claims`：现代实现通过 `TableNameParser` 识别表名 token，再调用 `TableNameHandler`；查询和 prepare 路径用额外参数避免重复解析；hook 在表名解析/改写完成后、SQL 执行前运行。
14. **`mybatis-plus342-dynamic-table-source`**
    - 标题：MyBatis-Plus v3.4.2 DynamicTableNameInnerInterceptor Source。
    - URL：<https://github.com/baomidou/mybatis-plus/blob/v3.4.2/mybatis-plus-extension/src/main/java/com/baomidou/mybatisplus/extension/plugins/inner/DynamicTableNameInnerInterceptor.java>。
    - `sourceType: source-code`；`appliesTo: MyBatis-Plus v3.4.2`；`verifiedAt: 2026-08-11`。
    - `claims`：旧实现同样使用 `TableNameParser`，但以 `Map<String, TableNameHandler>` 登记表名，prepare 路径按 DML 分支处理；不能调用现代 `JsqlParserGlobal` 或复制现代 hook/缓存 API。

### 分片概念、路由、解析和观测

15. **`shardingsphere552-route`**
    - 标题：Apache ShardingSphere 5.5.2 Route Engine。
    - URL：<https://shardingsphere.apache.org/document/5.5.2/en/reference/sharding/route/>。
    - `sourceType: official-reference`；`appliesTo: ShardingSphere 5.5.2`；`verifiedAt: 2026-08-11`。
    - `claims`：等值分片键通常产生单库/表路由，`IN`/`BETWEEN` 可能拆成多个真实 SQL；无分片键采用广播路由；未绑定表关联需要笛卡尔组合且官方标为复杂、应谨慎使用。
16. **`shardingsphere552-parse`**
    - 标题：Apache ShardingSphere 5.5.2 Parse Engine。
    - URL：<https://shardingsphere.apache.org/document/5.5.2/en/reference/sharding/parse/>。
    - `sourceType: official-reference`；`appliesTo: ShardingSphere 5.5.2`；`verifiedAt: 2026-08-11`。
    - `claims`：词法结果进入 AST，visitor 从 AST 的 SQLStatement 提取分片上下文和待改写位置；5.0.x 起解析 AST 可缓存，官方建议使用 PreparedStatement。
17. **`shardingsphere553-concepts`**
    - 标题：Apache ShardingSphere 5.5.3 Sharding Core Concept。
    - URL：<https://shardingsphere.apache.org/document/5.5.3/en/features/sharding/concept>。
    - `sourceType: official-reference`；`appliesTo: ShardingSphere 5.5.3`；`verifiedAt: 2026-08-11`。
    - `claims`：逻辑表映射实际表；绑定表需要一致的分片规则和分片键关联，否则会出现笛卡尔或跨库关联；广播表在每个数据源保持一致，单表只有一张无需分片的实际表。
18. **`shardingsphere552-properties`**
    - 标题：Apache ShardingSphere 5.5.2 Properties Configuration。
    - URL：<https://shardingsphere.apache.org/document/5.5.2/en/user-manual/common-config/props/>。
    - `sourceType: official-reference`；`appliesTo: ShardingSphere 5.5.2`；`verifiedAt: 2026-08-11`。
    - `claims`：`sql-show` 默认关闭，开启后日志包含逻辑 SQL、实际 SQL 和 SQL 解析结果；该输出用于调试，不能直接视为已完成业务结果校验。
19. **`shardingsphere-observability`**
    - 标题：Apache ShardingSphere Observability。
    - URL：<https://shardingsphere.apache.org/document/5.5.2/en/features/observability/>。
    - `sourceType: official-reference`；`appliesTo: ShardingSphere 5.5.2`；`verifiedAt: 2026-08-11`。
    - `claims`：SQL 经过解析、路由、改写、执行和结果合并；观测能力提供 tracing/metrics 接口并支持 OpenTelemetry、SkyWalking。

### 安全来源

20. **`owasp-sql-injection-prevention`**
    - 标题：OWASP SQL Injection Prevention Cheat Sheet。
    - URL：<https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html>。
    - `sourceType: security-standard`；`appliesTo: OWASP living cheat sheet`；`verifiedAt: 2026-08-11`。
    - `claims`：优先使用 Prepared Statements；表名、列名和排序方向不能使用 bind variable 时，使用代码侧 allowlist 映射或重设计；不要把未经验证的请求参数直接拼进 SQL。
21. **`owasp-database-security`**
    - 标题：OWASP Database Security Cheat Sheet。
    - URL：<https://cheatsheetseries.owasp.org/cheatsheets/Database_Security_Cheat_Sheet.html>。
    - `sourceType: security-standard`；`appliesTo: OWASP living cheat sheet`；`verifiedAt: 2026-08-11`。
    - `claims`：数据库账户遵循最小权限，限制可连接主机和权限范围；应用分片路由不能替代数据库级访问控制。
22. **`owasp-logging`**
    - 标题：OWASP Logging Cheat Sheet。
    - URL：<https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html>。
    - `sourceType: security-standard`；`appliesTo: OWASP living cheat sheet`；`verifiedAt: 2026-08-11`。
    - `claims`：日志可能暴露 PII、密码和技术秘密；日志应可验证、抗注入并避免资源耗尽，敏感字段应删除、遮蔽、散列或加密。

### 类型、解析和兼容补充

23. **`shardingsphere552-faq`**
    - 标题：Apache ShardingSphere 5.5.2 FAQ。
    - URL：<https://shardingsphere.apache.org/document/5.5.2/en/faq/>。
    - `sourceType: official-reference`；`appliesTo: ShardingSphere 5.5.2`；`verifiedAt: 2026-08-11`。
    - `claims`：数据库字段类型应与分片算法的运行时类型一致，例如 `int` 对应 `Integer`、`bigint` 对应 `Long`；算法边界仍需处理 JDBC 返回类型差异，不能只靠 Java 泛型强转。
24. **`mybatis-spring-requirements`**
    - 标题：MyBatis-Spring Requirements。
    - URL：<https://mybatis.org/spring/>。
    - `sourceType: official-reference`；`appliesTo: MyBatis-Spring 2.1.2 / 4.0.0`；`verifiedAt: 2026-08-11`。
    - `claims`：4.0.0 线使用 Spring 7 且要求 Java 17+；2.1.2 线使用 Spring 5.x、MyBatis 3.5+ 且支持 Java 8；冻结 Java 8/Spring 5 线不能使用 MyBatis-Spring 4.0.0。
25. **`jsqlparser-usage`**
    - 标题：JSqlParser Usage。
    - URL：<https://jsqlparser.github.io/JSqlParser/usage.html>。
    - `sourceType: official-reference`；`appliesTo: JSqlParser 4.9 / 5.x`；`verifiedAt: 2026-08-11`。
    - `claims`：官方流程将 SQL 解析为可遍历对象并使用 Visitor 访问、修改；4.9 是最后一个 JDK 8 兼容版本，5.0 起要求 Java 11，不能把现代解析器版本回填到 Java 8。

## 类型化分片键与路由结果

### 分片键不是任意反射值

分片键是“决定数据落在哪个逻辑分片”的业务值。它必须在进入 Mapper 前完成类型、租户和取值范围校验，并产生不可变的路由输入。推荐把它拆为三个结果，而不是让拦截器从任意对象反射字段：

| 结果 | 最小合同 | 可观测字段 |
| --- | --- | --- |
| `ShardKey` | 已校验的租户/业务键及其类型 | key 类型、脱敏摘要、来源用例 |
| `RoutePlan` | `SINGLE`、`MULTI`、`BROADCAST`、`REJECT` 四选一 | 逻辑表、目标数据源/表集合、拒绝原因 |
| `SqlPlan` | 逻辑 SQL、允许的标识符替换、绑定参数列表 | statementId、SQL 指纹、参数个数和类型 |

这是教学设计建议，不是 MyBatis 或 ShardingSphere 的 Java 类型合同。依据是官方路由合同：等值键可落单分片，`IN`/`BETWEEN` 可能落多个分片，无键则广播。类型化值对象也不能代替 JDBC 类型核验；数据库字段、驱动返回值和算法边界类型必须显式规范化。每个 `RoutePlan` 都必须可解释；无法确定键时应拒绝或显式选择广播，不能静默猜测默认分片。

### 单表、广播和跨分片边界

1. **单表：** 只有一张无需分片的实际表，适合小数据量；它与每个数据源都保持副本的广播表不同，也不应该接收带分片后缀的物理表名。
2. **广播表：** 每个数据源都有相同结构和数据，适合小字典表与大分片表关联；写入必须明确是否需要每个数据源成功，不能把一次本地成功当成全局成功。
3. **绑定表关联：** 两张表使用相同规则并以相同分片键关联时，路由拆分数可以与单表查询相当；课程只允许把这种关联作为默认跨表路径。
4. **未绑定表关联：** 缺少一致分片规则会产生笛卡尔组合或跨库关联。课程示例必须拒绝隐式全组合，并把 fan-out 数量作为结果的一部分。
5. **跨分片读：** `MULTI` 结果需要逐分片执行、合并和排序/分页规则；合并失败、部分失败和空结果分别记录。不能把它伪装成一个数据库事务或原子查询。

## 参数绑定与动态标识符

### 值一律绑定

MyBatis `#{value}` 生成 PreparedStatement 参数，值由驱动绑定；这适用于租户、ID、时间范围、状态和排序参数中的值。MyBatis `foreach` 可以受控生成 `IN` 参数列表，但列表元素仍必须是 `#{item}`，不能拼接值。

### 标识符只接受后端 allowlist

表名、列名、排序方向属于 SQL 结构，不能用 PreparedStatement 占位符。`${table}` 或 `${column}` 会原样进入 SQL，必须使用后端枚举/映射得到的固定标识符；请求参数只能作为枚举 key，不能作为最终 SQL 文本。OWASP 将“代码侧 allowlist 或重设计”列为不可绑定位置的防线，MyBatis-Plus 也明确不建议前端传 SQL 片段。

动态表插件的 handler 应只做：

1. 接受已验证的 `ShardKey` 或内部 `RoutePlan`，而不是 HTTP 参数或任意对象。
2. 从固定映射返回 `orders_2026_08` 这类已登记的标识符。
3. 对未知表、超范围后缀和跨租户请求返回拒绝结果。
4. 记录替换前后的逻辑表/物理表指纹，不记录完整敏感值。

MyBatis-Plus 官方示例中的随机后缀只是插件演示，不能成为生产路由算法；课程正文必须改为确定性映射并测试边界。

## 受控 SQL 解析与禁止正则盲改写

SQL 是带字符串、注释、别名、子查询和方言规则的语言。正则替换 `from user` 或简单 `replace("user", "user_1")` 可能命中文本常量、别名、注释或同名列。它无法证明替换位置是表标识符，也无法维护参数位置和结果映射。

受控路线分两层：

- MyBatis-Plus 动态表拦截器使用 `TableNameParser` 识别表名 token，再调用 handler；课程可以复用这个受控 seam，但 handler 仍需 allowlist。
- 需要理解别名、连接、子查询、方言和路由上下文时，使用 SQL parser/AST。ShardingSphere 官方流程是词法 token -> AST -> visitor 提取 `SQLStatement` 上下文和改写位置，并缓存解析结果；JSqlParser 官方也采用 parse -> Java 对象树 -> Visitor 的访问/修改路径。课程不要求手写 parser，只要求把 SQL 改写责任交给已验证的解析器或框架插件。

若只需要按用例选择固定表，优先在 statement/Mapper 层选择已登记的 SQL，而不是改写任意 SQL。若必须改写，反馈环至少断言：逻辑表、别名、物理表、绑定参数数量和最终 SQL 指纹均符合预期，且字符串值中的同名文本没有变化。

## Mapper 按用例拆分与事务边界

MyBatis 的 mapped statement 是 SQL、参数和结果映射的执行合同。工程上建议一个 Mapper 聚焦一个聚合或访问用例：

- `OrderShardMapper` 只暴露带 `ShardKey` 的单分片订单查询/写入；
- `OrderBroadcastMapper` 只暴露小字典的广播读取；
- `OrderCrossShardMapper` 明确返回 `RoutePlan` 对应的逐分片结果，不隐藏 fan-out；
- 通用 SQL 文本执行器、超大 Mapper 和“任意表/任意列”方法都列为拒绝设计。

这是可维护性建议，不是框架语法限制。拆分的验收点是 statementId、参数对象、resultMap 和事务 owner 可独立测试。MyBatis-Spring 事务中同一个 `SqlSession` 覆盖一次事务，因此跨数据源/跨分片操作不能仅凭 `@Transactional` 就声称具备分布式原子性；必须明确是否是单数据源事务、补偿流程或最终一致性。

## 路由、SQL、参数和结果的可观测验证

最小观测事件建议包含以下字段：

| 阶段 | 必须记录 | 禁止记录 |
| --- | --- | --- |
| 路由 | traceId、statementId、逻辑表、路由类型、目标数据源/物理表集合、fan-out 数 | 原始 token、完整租户密钥 |
| SQL | SQL 指纹、逻辑 SQL 与改写版本的脱敏摘要、解析/改写耗时 | `${}` 展开的未审计文本、完整敏感 SQL |
| 参数 | 参数数量、JDBC 类型、是否为空、哈希或脱敏摘要 | 密码、令牌、完整个人数据 |
| 执行 | 每个目标的开始/结束、超时、重试、数据库错误码 | 直接拼入日志的用户输入 |
| 结果 | 每目标行数、合并顺序/分页校验、部分失败、最终状态 | 完整结果集和敏感列 |

MyBatis 官方 logging 可把 mapper 或具体 statement 提升到 TRACE，SQL 留在 DEBUG、结果留在 TRACE；这适合临时验证但必须按环境和字段脱敏。ShardingSphere `sql-show` 能显示逻辑 SQL、实际 SQL 和解析结果，观测文档还将解析、路由、改写、执行、结果合并列为不同阶段。OWASP 要求日志抗注入并保护 PII/秘密，因此课程不能把“打开 DEBUG”当作生产观测方案。

## Java 8 与旧 MyBatis-Plus 兼容边界

| 主题 | Java 25 / 现代基线 | Java 8 / 冻结项目线 | 教学决策 |
| --- | --- | --- | --- |
| Java 与 Boot | Java 25、Boot 4.1.0、Framework 7.0.8 | Java 8、Boot 2.3.12、Framework 5.2.15 | 分开依赖和运行验证，不交叉 import |
| MyBatis-Spring | Starter/MyBatis-Spring 4.0.0 要求 Boot 4.0+/Spring 7、Java 17+ | MyBatis-Spring 2.1.2 使用 Spring 5.x、MyBatis 3.5+，支持 Java 8 | 不把 4.0.0 依赖或 API 回填旧线 |
| 动态表处理 | MP 3.5.17 handler + `TableNameParser`，可用现代 parser seam | MP 3.4.2 map handler + `TableNameParser` | 不调用 3.5.6+ `JsqlParserGlobal`，不复制现代缓存/线程池 API |
| SQL 结构 | 可使用已验证 parser/AST 组件 | JSqlParser 4.9 是最后一个 JDK 8 版本；只使用旧线可用解析与固定映射 | 正则盲改写两线都禁止 |
| 事务 | 单 `SqlSession` 事务仍只覆盖其数据源 | 同一合同；跨库不是自动分布式事务 | 以显式 RoutePlan 和补偿/一致性设计为准 |
| 语言写法 | 可使用 Java 25 语言特性，但本课示例保持普通类和集合 | 只用 Java 8 可编译写法 | 现代便利语法不能掩盖路由合同 |

## 冻结项目证据映射

以下映射只来自 `course-coverage-matrix.json` 的冻结合同。共 19 条 sourceId-代表符号映射，去重后 17 个唯一稳定符号；不读取源码，不从类名推断实现细节。

| sourceId | 冻结路径与稳定符号 | usage | 仅能支持的结论 |
| --- | --- | --- | --- |
| `JAVA-ENGINEERING-003` | `dzzz-app/src/main/java/com/tdh/bdzz/shard/AjbsShardStrategy.java`；`com.tdh.bdzz.shard.AjbsShardStrategy` | `observed` | 项目存在分片策略候选，不证明键校验或路由结果正确 |
| `JAVA-ENGINEERING-003` | `dzzz-app/src/main/java/com/tdh/bdzz/po/AnnotationTypesEntity.java`；`com.tdh.bdzz.po.AnnotationTypesEntity` | `observed` | 项目存在实体/持久化模型候选，不证明字段是分片键 |
| `JAVA-ENGINEERING-003` | `dzzz-app/src/main/java/com/tdh/bdzz/config/DataSourceConfig.java`；`com.tdh.bdzz.config.DataSourceConfig` | `observed` | 项目存在数据源配置候选，不证明所有数据源路由隔离 |
| `JAVA-ENGINEERING-003` | `dzzz-app/src/main/java/com/tdh/bdzz/shard/TableShardInterceptor.java`；`com.tdh.bdzz.shard.TableShardInterceptor` | `observed` | 项目存在表分片拦截器候选，不作为推荐实现 |
| `JAVA-ENGINEERING-003` | `dzzz-app/src/main/java/com/tdh/bdzz/po/AnnotationsEntity.java`；`com.tdh.bdzz.po.AnnotationsEntity` | `observed` | 项目存在另一持久化模型候选，不证明跨表合同一致 |
| `JAVA-RISK-003` | `dzzz-app/src/main/java/com/tdh/bdzz/dao/EajFtsyMapper.java`；`com.tdh.bdzz.dao.EajFtsyMapper` | `rejected` | 只保留数据访问职责过载风险，不进入推荐 Mapper |
| `JAVA-RISK-003` | `dzzz-app/src/main/java/com/tdh/bdzz/dao/DzzzTsxqMapper.java`；`com.tdh.bdzz.dao.DzzzTsxqMapper` | `rejected` | 只保留超大 Mapper 风险，不复制其职责边界 |
| `JAVA-RISK-003` | `dzzz-app/src/main/java/com/tdh/bdzz/dao/DzzzFybHyXqMapper.java`；`com.tdh.bdzz.dao.DzzzFybHyXqMapper` | `rejected` | 只保留查询/投影混合风险，不推断具体 SQL |
| `JAVA-RISK-003` | `dzzz-app/src/main/java/com/tdh/bdzz/dao/DzzzSqlMapper.java`；`com.tdh.bdzz.dao.DzzzSqlMapper` | `rejected` | 只保留通用 SQL 执行器风险，不作为动态 SQL 正例 |
| `JAVA-RISK-038` | `dzzz-app/src/main/java/com/tdh/bdzz/aop/DzzzAspect.java`；`com.tdh.bdzz.aop.DzzzAspect` | `rejected` | 只保留反射/切面绕过类型合同风险 |
| `JAVA-RISK-038` | `dzzz-app/src/main/java/com/tdh/bdzz/util/BeanUtil.java`；`com.tdh.bdzz.util.BeanUtil` | `rejected` | 只保留反射取值扩大失败面风险 |
| `JAVA-RISK-038` | `dzzz-app/src/main/java/com/tdh/bdzz/shard/DefaultAutowiredShardData.java`；`com.tdh.bdzz.shard.DefaultAutowiredShardData` | `rejected` | 只保留隐式注入分片参数风险 |
| `JAVA-RISK-038` | `dzzz-app/src/main/java/com/tdh/bdzz/util/CommonUtil.java`；`com.tdh.bdzz.util.CommonUtil` | `rejected` | 只保留通用反射/转换工具风险 |
| `JAVA-RISK-038` | `dzzz-app/src/main/java/com/tdh/bdzz/util/ConvertPdf.java`；`com.tdh.bdzz.util.ConvertPdf` | `rejected` | 只保留跨边界工具调用噪声，不进入本课示例 |
| `JAVA-RISK-039` | `dzzz-app/src/main/java/com/tdh/bdzz/shard/TableShardInterceptor.java`；`com.tdh.bdzz.shard.TableShardInterceptor` | `rejected` | 风险侧只保留 SQL 文本改写警示，与 observed 行不合并为正例 |
| `JAVA-RISK-039` | `dzzz-app/src/main/java/com/tdh/bdzz/config/DbcpSqlCheckConfig.java`；`com.tdh.bdzz.config.DbcpSqlCheckConfig` | `rejected` | 只保留 SQL 校验与厂商耦合风险 |
| `JAVA-RISK-039` | `dzzz-app/src/main/java/com/tdh/bdzz/dao/CatalogMapper.java`；`com.tdh.bdzz.dao.CatalogMapper` | `rejected` | 只保留动态目录/标识符边界风险 |
| `JAVA-RISK-039` | `dzzz-app/src/main/java/com/tdh/bdzz/dao/DownloadMapper.java`；`com.tdh.bdzz.dao.DownloadMapper` | `rejected` | 只保留下载查询与动态 SQL 边界风险 |
| `JAVA-RISK-039` | `dzzz-app/src/main/java/com/tdh/bdzz/dao/DzzzSqlMapper.java`；`com.tdh.bdzz.dao.DzzzSqlMapper` | `rejected` | 与 `JAVA-RISK-003` 的同名符号去重计数，但风险状态仍为 rejected |

## 不能推出的结论

- 不能由存在分片策略、拦截器或数据源类推出真实运行路由、分片键来源、数据源连通性或切换成功。
- 不能由等值路由示例推出所有查询都单分片；`IN`、`BETWEEN`、缺少分片键和未绑定关联都会改变 fan-out。
- 不能把单表当广播表，也不能把广播写入的一次成功当成所有数据源一致。
- 不能把 `#{}` 与 `${}` 混为一谈；`${}` 的文本替换不能接收未验证请求参数。
- 不能由 MyBatis-Plus token parser 或 ShardingSphere AST 推出任意 SQL 都可安全改写；方言、注释、别名、子查询和结果合并仍需验证。
- 不能由一个大 Mapper 能运行推出职责边界清晰、投影稳定或跨分片事务成立。
- 不能把 DEBUG/TRACE、`sql-show` 或 tracing 视为完整结果正确性；每个目标的路由、参数、行数、合并和错误状态必须独立核对。
- 不能把 `@Transactional` 跨多个数据源解释成分布式原子事务；MyBatis-Spring 只管理其 session/数据源合同。
- 不能把 Java 8 与 Java 25、MP 3.4.2 与 3.5.17 的源码/API 当成二进制兼容；必须在各自依赖线上编译验证。

## 易错点取证与反馈环计划

正文至少覆盖以下可观察错误，每项按“现象 -> 触发条件 -> 原因 -> 后果 -> 错误示例 -> 正确写法 -> 影响版本 -> 验证方式 -> 来源”组织：

1. 从任意 DTO 反射读取分片键，字段缺失或类型错误却静默走默认分片。
2. 把 `IN`/`BETWEEN` 的多路由当作单分片查询，漏掉 fan-out、合并和部分失败。
3. 没有分片键就默认命中一个库，或者把广播表写成只执行一次。
4. 未绑定表 join 触发笛卡尔组合，却没有拒绝、限流或显式跨库结果协议。
5. 用 `${}` 拼接租户值、ID 或排序值，或把未经 allowlist 的表名交给动态表 handler。
6. 用正则/字符串 replace 改表名，误命中别名、注释、字符串常量或子查询。
7. 依赖 MyBatis-Plus 3.5.17 的 `JsqlParserGlobal` API 编写 Java 8/MP 3.4.2 兼容代码。
8. 一个超大 Mapper 同时负责任意 SQL、多个聚合和不同 resultMap，导致 SQL/投影合同漂移。
9. 只记录逻辑 SQL，不记录实际目标表、参数类型、每目标结果和合并状态。
10. 为排查问题把完整参数、token、个人数据或完整结果集写进 DEBUG/TRACE 日志。

反馈环至少验证：

1. 合法 typed key -> 预期 `SINGLE`/`MULTI` 路由；缺失或越界 key -> `REJECT`，不产生 SQL。
2. 单表、广播表、绑定表和未绑定表 join 的目标数量、SQL 指纹和合并状态。
3. 值使用 `#{}` 后参数数量/类型稳定；标识符只能来自 allowlist；恶意文本不能改变 SQL 结构。
4. 解析/改写后别名、字符串常量和注释不被误命中；解析失败进入拒绝路径。
5. 两个 Mapper 用例分别验证 statementId、resultMap 和事务 owner；大 Mapper/通用 SQL 路径应有负向检查。
6. 路由、逻辑 SQL、实际 SQL、脱敏参数、每目标行数/错误码、合并结果和最终状态均可关联到 traceId。
7. 现代线与 legacy 线各连续运行两次；没有 Java 8 环境时 legacy 运行项标记 Deferred，不能用 Java 25 结果替代。

所有 fixture、runner 和输出必须位于 `/tmp` 的 `mktemp` 目录，验证成功后删除并检查目录不存在；本研究阶段不创建课程正文、loader、依赖、测试、浏览器证据或 signoff。

## 课程设计与验证合同

1. 正文顺序固定为：typed key 与 RoutePlan -> 单表/广播/绑定/跨分片边界 -> `#{}` 与 `${}` -> 动态 SQL -> 受控解析/AST -> Mapper 按用例拆分 -> 事务边界 -> 路由/SQL/参数/结果观测 -> legacy 差异。
2. 现代示例使用 MyBatis 3.5.19、MyBatis-Spring 4.0.0、MyBatis-Plus 3.5.17 的最小固定映射；不把 ShardingSphere 作为必须依赖，必要时以伪代码标明教学设计。
3. 动态标识符只能由后端 allowlist 产生；值全部参数绑定；禁止把正则替换或任意 SQL 执行器作为推荐实现。
4. 每个跨分片用例必须暴露 RoutePlan、目标列表、fan-out、逐目标结果和合并规则；无法证明一致性时显式返回部分失败或拒绝。
5. Java 8/Boot 2.3.12/Framework 5.2.15/MP 3.4.2 示例只使用兼容 API，旧线不能调用 Java 11 `java.net.http` 或 MP 3.5.6+ parser 全局配置。
6. 不给出没有 workload、数据库、驱动、数据量和测量结果的性能数字；只验证路由数量、SQL 结构、参数绑定、结果合并和安全负向案例。

## 研究 Gate 自检

- [x] 课程 ID、顺序 560、两个前置、4 个冻结 sourceCapabilityIds、选择理由和 not-started/planned 状态已核对。
- [x] 25 个唯一官方直接 URL 已记录稳定 ID、标题、URL、`sourceType`、精确版本、claims 和 `verifiedAt: 2026-08-11`。
- [x] 已覆盖 typed key/route result、单表、广播、绑定和跨分片边界、参数绑定/动态标识符 allowlist、受控 parser/AST、禁止正则盲改写、Mapper 拆分、可观测验证和 Java 8/旧 MP 兼容边界。
- [x] 项目证据只来自冻结矩阵：19 条映射、17 个去重稳定符号；observed 与 rejected 分开，风险证据未写成推荐实践。
- [x] 未读取、运行或修改 `dzzz-app`，未创建课程正文、manifest、track、signoff、依赖、测试或生成物。
- [x] 当前研究稿为 361 行；最终 SHA256 由课程 signoff 对外绑定，避免在被校验文件内记录不可稳定的自引用哈希。已复核本课必须在一个可运行反馈环中同时串起 typed key、四种路由、动态 SQL、解析边界、事务 owner、逐目标结果与 Java 8/25 双线，未混入可独立拆分的第二主题。

## 发布结论与 Stop Boundary

本文件只完成 Java 高级第 7 门课程的官方资料研究。研究稿通过格式、来源唯一性、冻结合同和 SHA 核验后，才可交给主流程进入课程正文 Gate；本子任务不授权课程实现、发布接线或第 8 门课程。
