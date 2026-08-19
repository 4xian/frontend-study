# Java 高级第 5 门：进程内缓存、Redis、失效与一致性研究

> 课程 ID：`backend.java.learn.advanced.cache-and-consistency`
>
> 冻结顺序：540
>
> 研究日期：2026-08-10
>
> 冻结快照：`dzzz-app-20260803-179e722831ab`
> 边界：只使用任务冻结证据与现有 Phase 2 审计摘要，不读取、运行或修改 `dzzz-app`

## 冻结课程合同

- 标题：进程内缓存、Redis、失效与一致性。
- 阶段：`advanced`，深度：`lesson`。
- 前置课程：
  1. `backend.java.learn.advanced.concurrency-locks-and-shared-state`。
  2. `backend.java.learn.intermediate.dependency-injection-and-bean-lifecycle`。
- 来源能力：
  1. `JAVA-ENGINEERING-020`：进程内缓存与缓存失效。
  2. `JAVA-FRAMEWORK-012`：Spring Data Redis 与 `RedisTemplate`。
  3. `JAVA-RISK-044`：无界缓存与限流器键空间回收。
- 课程选择理由：冻结项目确认多种进程内启动/元数据缓存，但 Redis 只存在极少配置证据；课程必须先区分
  JVM 内缓存和 Redis 的进程边界，再讲失效、容量、键空间回收与一致性选择。
- 冻结矩阵继续保持本课原有 `researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`；本研究稿不修改矩阵、track、manifest、正文或 signoff。

## 研究范围与版本基线

### 现代主线

- Java 25 LTS。
- Spring Boot 4.1.0、Spring Framework 7.0.8、Spring Data Redis 4.1.0。
- Spring Boot 4.1.0 管理 Caffeine 3.2.4；本课只把 Caffeine 作为 Java 进程内有界容量和时间淘汰的
  一个可选实现，不把第三方 API 当作 JDK 合同，也不再引入第二个第三方缓存文档体系。
- Redis Open Source 当前稳定文档线为 8.10.0。Spring Data Redis 4.1.0 的前言只声明最低 Redis 2.6，
  并称其测试到最新 6.0；`enableTimeToIdle()` 另要求 Redis 6.2 以上。因此课程不得把“Redis 8.10 当前
  稳定”改写成“Spring Data Redis 4.1.0 已官方认证 Redis 8.10”。共同示例只依赖已单独核验的
  `GET`/`SET`/`DEL`/`EXPIRE`/`TTL`/`MULTI`/`EXEC`/`SCAN` 等基础合同。

### 兼容线

- Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE。
- Boot 2.3.12 管理 Spring Data Redis 2.3.9.RELEASE、Lettuce 5.3.7.RELEASE、Caffeine 2.8.8。
- 冻结证据没有给出 `dzzz-app` 的 Redis Server 精确版本、部署拓扑、序列化器或实际键空间；旧线示例
  不使用 `GETEX`、`enableTimeToIdle()`、`EXPIRE GT/LT` 等需要更高 Redis/框架版本的能力。
- 旧线只解释冻结项目语境。不能把 Java 25、Framework 7、Data Redis 4.1 或 Caffeine 3.x API
  回填到 Java 8 / Boot 2.3.12。

## 已核验的官方直接来源

以下 31 个直接 URL 均在 2026-08-10 先由 Tavily 定位，再以官方页面或维护者原始文档核验，最终
HTTP 状态均为 200。每项都记录可直接迁移到课程 frontmatter 的 `id`、版本、来源类型和 claims；
正文只需引用这些来源卡，不重复展开同一组链接。

### Java、Spring Boot 与现代版本

1. **`oracle-java-support-roadmap`**
   - URL：<https://www.oracle.com/java/technologies/java-se-support-roadmap.html>。
   - `sourceType: official-reference`；`appliesTo: Java 25 LTS`；`verifiedAt: 2026-08-10`。
   - `claims`：Oracle 支持路线把 Java 25 列为 LTS；本课现代语言基线固定为 Java 25。
2. **`java25-concurrent-hash-map`**
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html>。
   - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-10`。
   - `claims`：读取通常不阻塞；每键已完成更新与读到该值之间有 happens-before；`computeIfAbsent`
     整体原子且 mapping function 应短小、不得递归更新同一 map；key/value 禁止 null；整体 bulk 视图不是快照。
3. **`java8-concurrent-hash-map`**
   - URL：<https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ConcurrentHashMap.html>。
   - `sourceType: api-doc`；`appliesTo: Java 8`；`verifiedAt: 2026-08-10`。
   - `claims`：旧线具有相同的每键并发映射、禁止 null 和 `computeIfAbsent` 基本合同；它仍不提供缓存
     容量、TTL 或跨进程传播策略。
4. **`boot41-system-requirements`**
   - URL：<https://docs.spring.io/spring-boot/system-requirements.html>。
   - `sourceType: official-reference`；`appliesTo: Spring Boot 4.1.0`；`verifiedAt: 2026-08-10`。
   - `claims`：Boot 4.1.0 支持 Java 17 至 26，并要求 Spring Framework 7.0.8 以上；Java 25 在范围内。
5. **`boot41-managed-dependencies`**
   - URL：<https://docs.spring.io/spring-boot/appendix/dependency-versions/coordinates.html>。
   - `sourceType: official-reference`；`appliesTo: Spring Boot 4.1.0`；`verifiedAt: 2026-08-10`。
   - `claims`：Boot 4.1.0 管理 Spring Data Redis 4.1.0、Lettuce 7.5.2.RELEASE 和 Caffeine 3.2.4。

### Spring Cache 抽象

6. **`spring7-cache-strategies`**
   - URL：<https://docs.spring.io/spring-framework/reference/integration/cache/strategies.html>。
   - `sourceType: official-reference`；`appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-10`。
   - `claims`：Spring Cache 是抽象而非存储；多线程、多进程和传播由 provider 负责；普通 miss/load/put
     不自动加锁，多个线程可同时加载，更新/失效并发时可能读到旧值。
7. **`spring7-cache-annotations`**
   - URL：<https://docs.spring.io/spring-framework/reference/integration/cache/annotations.html>。
   - `sourceType: official-reference`；`appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-10`。
   - `claims`：默认 key 为零参 `SimpleKey.EMPTY`、单参自身、多参 `SimpleKey`；`condition` 在调用前判断，
     `unless` 在结果产生后否决；`@CacheEvict` 支持 key、condition、`allEntries` 和 `beforeInvocation`；
     默认 proxy 模式只拦截经代理进入的外部调用；`sync=true` 是否真正同步仍取决于 provider。
8. **`spring7-cache-storage`**
   - URL：<https://docs.spring.io/spring-framework/reference/integration/cache/store-configuration.html>。
   - `sourceType: official-reference`；`appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-10`。
   - `claims`：JDK `ConcurrentMap` provider 由应用创建并绑定应用生命周期，适合基础、测试或简单场景，
     但没有管理、持久化或淘汰合同；Caffeine 是 Framework 支持的可选 provider。
9. **`spring7-transaction-aware-cache`**
   - URL：<https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/cache/transaction/TransactionAwareCacheDecorator.html>。
   - `sourceType: api-doc`；`appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-10`。
   - `claims`：`put`、`evict`、`clear` 可延迟到 Spring 事务成功提交后的 after-commit；无活动事务时立即执行；
     `putIfAbsent`、`evictIfPresent` 等即时操作不能延迟，事务场景必须谨慎使用。

### Spring Data Redis 4.1.0

10. **`spring-data-redis41-preface`**
    - URL：<https://docs.spring.io/spring-data/redis/reference/preface.html>。
    - `sourceType: official-reference`；`appliesTo: Spring Data Redis 4.1.0`；`verifiedAt: 2026-08-10`。
    - `claims`：4.1.0 需要 JDK 17 和 Framework 7.0.8 以上；文档声明最低 Redis 2.6、测试到最新 6.0。
11. **`spring-data-redis41-template`**
    - URL：<https://docs.spring.io/spring-data/redis/reference/redis/template.html>。
    - `sourceType: official-reference`；`appliesTo: Spring Data Redis 4.1.0`；`verifiedAt: 2026-08-10`。
    - `claims`：`RedisTemplate` 负责连接与序列化，配置完成后线程安全；key、value、hash key、hash value
      均可有独立 serializer；默认 Java 原生序列化不应处理不可信数据，官方更推荐 JSON 等其他格式。
12. **`spring-data-redis41-cache`**
    - URL：<https://docs.spring.io/spring-data/redis/reference/redis/redis-cache.html>。
    - `sourceType: official-reference`；`appliesTo: Spring Data Redis 4.1.0`；`verifiedAt: 2026-08-10`。
    - `claims`：`RedisCacheConfiguration` 默认无过期、允许 null、启用 cache-name key prefix，key 用
      `StringRedisSerializer`、value 用 `JdkSerializationRedisSerializer`；TTL 必须显式配置；TTI 是借助
      `GETEX` 重置 TTL 的近似语义，必须统一通过 Cache API 访问且要求 Redis 6.2 以上。
13. **`spring-data-redis41-transactions`**
    - URL：<https://docs.spring.io/spring-data/redis/reference/redis/transactions.html>。
    - `sourceType: official-reference`；`appliesTo: Spring Data Redis 4.1.0`；`verifiedAt: 2026-08-10`。
    - `claims`：Redis 事务使用 `MULTI`/`EXEC`/`DISCARD`；多操作同连接需 `SessionCallback`；
      `RedisTemplate` 默认不参与 Spring 管理事务，需逐 template 开启 `setEnableTransactionSupport(true)`；
      事务内写入排队到提交，读取走新的非绑定连接。

### Redis 8.10 当前文档线

14. **`redis810-release-notes`**
    - URL：<https://redis.io/docs/latest/operate/oss_and_stack/stack-with-enterprise/release-notes/redisce/redisos-8.10-release-notes/>。
    - `sourceType: release-note`；`appliesTo: Redis Open Source 8.10.0`；`verifiedAt: 2026-08-10`。
    - `claims`：Redis 8.10.0 是当前已发布稳定文档线；本来源只固定 Redis 文档版本，不证明 Spring 集成兼容性。
15. **`redis-data-types`**
    - URL：<https://redis.io/docs/latest/develop/data-types/>。
    - `sourceType: official-reference`；`appliesTo: Redis Open Source 8.10 docs`；`verifiedAt: 2026-08-10`。
    - `claims`：Redis 是 data structure server，String 是 byte sequence，另有 Hash、List、Set、Sorted Set、
      Stream 等原生类型；Java 泛型不能替代远端 key 对应数据类型合同。
16. **`redis-cache-aside-tutorial`**
    - URL：<https://redis.io/tutorials/howtos/solutions/microservices/caching/>。
    - `sourceType: official-reference`；`appliesTo: Redis cache-aside pattern`；`verifiedAt: 2026-08-10`。
    - `claims`：cache-aside 由应用先查 Redis，miss 后读 primary database，再把结果以 TTL 写入 Redis；
      hit 直接返回缓存。本来源支持流程，不承诺数据库与缓存原子一致。
17. **`redis-client-side-caching`**
    - URL：<https://redis.io/docs/latest/develop/reference/client-side-caching/>。
    - `sourceType: official-reference`；`appliesTo: Redis client-side caching`；`verifiedAt: 2026-08-10`。
    - `claims`：本地副本需要失效消息；数据回复与独立失效连接可能乱序而留下旧值；失效连接断开时应清空
      本地缓存。该来源只证明 client-side caching 的竞态，不自动等同于数据库 cache-aside。
18. **`redis-expire`**
    - URL：<https://redis.io/docs/latest/commands/expire/>。
    - `sourceType: api-doc`；`appliesTo: Redis EXPIRE`；`verifiedAt: 2026-08-10`。
    - `claims`：超时后 key 自动删除；覆盖/删除 key 的命令会清除 TTL，而 `INCR`、`LPUSH`、`HSET`
      等原位修改保留 TTL；非正超时直接删除 key；`NX/XX/GT/LT` 是互斥条件选项。
19. **`redis-ttl`**
    - URL：<https://redis.io/docs/latest/commands/ttl/>。
    - `sourceType: api-doc`；`appliesTo: Redis TTL`；`verifiedAt: 2026-08-10`。
    - `claims`：`TTL` 返回剩余秒数；Redis 2.8 起 `-2` 表示 key 不存在，`-1` 表示存在但没有过期时间。
20. **`redis-del`**
    - URL：<https://redis.io/docs/latest/commands/del/>。
    - `sourceType: api-doc`；`appliesTo: Redis DEL`；`verifiedAt: 2026-08-10`。
    - `claims`：`DEL` 删除给定 key 并返回实际删除数量；不存在的 key 被忽略，因此同一失效命令可安全重放。
21. **`redis-key-eviction`**
    - URL：<https://redis.io/docs/latest/develop/reference/eviction/>。
    - `sourceType: official-reference`；`appliesTo: Redis maxmemory eviction`；`verifiedAt: 2026-08-10`。
    - `claims`：`noeviction` 在需要新增数据时返回错误；`allkeys-*` 可在全键空间选择，`volatile-*`
      只在带 TTL 的 key 中选择，若没有带 TTL key 会退化为 `noeviction`；eviction policy 必须按访问模型选择。
22. **`redis-transactions`**
    - URL：<https://redis.io/docs/latest/develop/using-commands/transactions/>。
    - `sourceType: official-reference`；`appliesTo: Redis transactions`；`verifiedAt: 2026-08-10`。
    - `claims`：`MULTI`/`EXEC` 内命令顺序隔离执行；运行期某条命令失败不会阻止其余命令；Redis 不提供
      transaction rollback；`WATCH` 提供乐观 CAS，但它不能把外部数据库事务合并进 Redis 原子边界。
23. **`redis-scan`**
    - URL：<https://redis.io/docs/latest/commands/scan/>。
    - `sourceType: api-doc`；`appliesTo: Redis SCAN`；`verifiedAt: 2026-08-10`。
    - `claims`：完整迭代可能重复返回元素，调用方需幂等/去重；集合持续无界增长时不保证完整迭代终止；
      `COUNT` 是提示而非精确页大小。
24. **`redis-dbsize`**
    - URL：<https://redis.io/docs/latest/commands/dbsize/>。
    - `sourceType: api-doc`；`appliesTo: Redis DBSIZE`；`verifiedAt: 2026-08-10`。
    - `claims`：返回当前选中 database 的 key 数量；只有专用 database/fixture 才能把它当目标前缀的精确计数。
25. **`redis-memory-usage`**
    - URL：<https://redis.io/docs/latest/commands/memory-usage/>。
    - `sourceType: api-doc`；`appliesTo: Redis 4.0+ MEMORY USAGE`；`verifiedAt: 2026-08-10`。
    - `claims`：报告单个 key/value 连同管理开销所需 RAM 字节数；抽样值不是整个键空间或进程 RSS。

### 唯一第三方缓存来源

26. **`caffeine324-eviction`**
    - URL：<https://github.com/ben-manes/caffeine/wiki/Eviction>。
    - `sourceType: engineering-reference`；`appliesTo: Caffeine 3.2.4 managed by Boot 4.1.0`；
      `verifiedAt: 2026-08-10`。
    - `claims`：`maximumSize`/`maximumWeight` 提供容量淘汰；`expireAfterAccess`、`expireAfterWrite`、
      `expireAfter(Expiry)` 提供时间淘汰；过期维护通常由读写触发，可配置 Scheduler；测试应注入 Ticker，
      不依赖真实睡眠。本课不引用其他第三方缓存实现。

### Java 8 / Spring Boot 2.3.12 归档线

27. **`boot2312-system-requirements`**
    - URL：<https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements>。
    - `sourceType: official-reference`；`appliesTo: Spring Boot 2.3.12.RELEASE`；
      `verifiedAt: 2026-08-10`。
    - `claims`：Boot 2.3.12 需要 Java 8、最高兼容到 Java 15，并要求 Framework 5.2.15.RELEASE 以上。
28. **`boot2312-managed-dependencies`**
    - URL：<https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/appendix-dependency-versions.html>。
    - `sourceType: official-reference`；`appliesTo: Spring Boot 2.3.12.RELEASE`；
      `verifiedAt: 2026-08-10`。
    - `claims`：归档 BOM 管理 Spring Data Redis 2.3.9.RELEASE、Lettuce 5.3.7.RELEASE、Caffeine 2.8.8。
29. **`spring5215-cache-reference`**
    - URL：<https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/integration.html#cache>。
    - `sourceType: official-reference`；`appliesTo: Spring Framework 5.2.15.RELEASE`；
      `verifiedAt: 2026-08-10`。
    - `claims`：旧线已有 `@Cacheable`、`@CachePut`、`@CacheEvict`、key/condition/unless、
      `beforeInvocation`、默认 proxy 自调用边界和 provider 多进程责任；不能复制 7.0 的异步/响应式增量语义。
30. **`spring-data-redis239-reference`**
    - URL：<https://docs.spring.io/spring-data/redis/docs/2.3.9.RELEASE/reference/html/>。
    - `sourceType: official-reference`；`appliesTo: Spring Data Redis 2.3.9.RELEASE`；
      `verifiedAt: 2026-08-10`。
    - `claims`：旧线已有 `RedisTemplate`、独立 serializer、显式 transaction support、
      `RedisCacheConfiguration.entryTtl` 和默认无过期；同样警告不可信环境不要使用 Java 原生序列化。
31. **`spring-data-redis239-cache-api`**
    - URL：<https://docs.spring.io/spring-data/redis/docs/2.3.9.RELEASE/api/org/springframework/data/redis/cache/RedisCacheConfiguration.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Data Redis 2.3.9.RELEASE`；
      `verifiedAt: 2026-08-10`。
    - `claims`：旧 API 支持固定 `entryTtl(Duration)`、null 开关和 key/value 序列化配置；API 中没有
      当前线的 `enableTimeToIdle()`，旧线正文不得调用它。

## 缓存层次与进程边界

### 先确定真相源，再选择层次

1. 关系数据库或领域存储通常是真相源；缓存只是可丢弃、可重建的副本。若某份 Redis 数据本身就是
   权威状态，就不应再把它称为 cache-aside 副本，必须另建持久性和恢复合同。
2. JVM 内 `ConcurrentHashMap`/Caffeine 是进程内 L1：同一实例中的线程共享，另一个 JVM、重启后的新进程、
   滚动发布中的另一副本都看不到同一对象。
3. Redis 是进程外 L2：连接到同一 Redis endpoint/database/key namespace 的实例可以观察同一远端 key；
   这不等于本地 L1 会自动失效，也不等于 Redis 与数据库处于同一事务。
4. Spring Cache 只统一 `Cache`/`CacheManager` 操作。容量、TTL、进程拓扑、分布式单飞、传播与一致性
   都必须落到实际 provider 配置和验证证据。

| 对比项 | `ConcurrentHashMap` / Caffeine L1 | Redis L2 | 课程决策 |
| --- | --- | --- | --- |
| 可见范围 | 单 JVM 对象 | 同 Redis keyspace 的客户端 | 先画进程/网络边界 |
| 生命周期 | 随应用实例创建、重启丢失 | 独立 Redis 生命周期 | 两者都不能替代真相源备份 |
| 并发原子性 | 每 key 原子 API，只在本 JVM | 单 Redis 命令；事务只覆盖 Redis 命令 | 不宣传跨 DB 原子双写 |
| 容量 | CHM 无策略；Caffeine 显式上限 | `maxmemory` 与 eviction policy | 容量淘汰不等于业务失效 |
| 时间回收 | CHM 无 TTL；Caffeine 显式 expiry | `EXPIRE`/TTL 或 Cache entry TTL | 默认值必须实际核验 |
| 节点传播 | 无 | Redis key 共享，但本地副本仍独立 | L1+L2 需额外失效协议 |

## Java 级缓存心智模型

### `ConcurrentHashMap` 只解决并发映射

- `computeIfAbsent` 可以把“同一 JVM、同一 key 的缺失计算与放入”收敛成一个原子调用，但 mapping function
  必须短小，不能把慢数据库查询长期放在 map 的原子计算区并假设它是跨节点 single-flight。
- CHM 不接受 null。若业务要缓存“不存在”，必须用明确、不可与真实值混淆的 negative sentinel，并给它
  独立的短生命周期；否则 `null` 只是未命中，会重复访问真相源。
- CHM API 没有容量、TTL、命中统计或自动清理合同。手写 `Map<K, TimedValue<V>>` 仍需解决原子装载、
  过期竞态、清理调度、测试时钟和容量上限，不能因“用了并发 Map”就称为完整缓存。

### 有界容量与 TTL 是独立轴

- 容量上限回答“最多保留多少/多重”，TTL 回答“副本多久后失效”；两者都要显式配置。
- Caffeine 3.2.4 只作为一个现代 L1 实现：使用 `maximumSize` 或可度量的 `maximumWeight`，再按业务陈旧
  窗口选择 `expireAfterWrite` 或 `expireAfterAccess`。时间过期不保证到点立刻执行维护；需要及时触发时配置
  Scheduler，测试使用 Ticker。
- 淘汰只是释放容量，不能证明被淘汰值已经在真相源更新；TTL 只是陈旧上界的后备线，也不能证明 TTL 内
  强一致。课程不宣称某个固定 size/TTL 对所有业务都正确。

## Spring Cache 注解合同

1. **key**：零参默认共享 `SimpleKey.EMPTY`，单参直接用参数，多参组成 `SimpleKey`。正文应优先写出稳定
   业务 key，包含实体类型、租户/作用域、业务 ID 和必要的 schema/version；不能用可变对象或只靠默认
   `toString()` 形成跨版本 Redis key。
2. **`condition`**：方法调用前判断是否参与缓存，适合按请求参数排除不可缓存场景；它看不到结果。
3. **`unless`**：方法完成后根据 `#result` 否决写入。使用 `unless="#result == null"` 意味着不存在结果
   不进入缓存，必须承认它会把重复不存在查询持续打到真相源。
4. **`@CacheEvict`**：默认在方法成功完成后失效；异常时不失效。`beforeInvocation=true` 在调用前总是
   失效，只适合“无论方法结果都应删除”的明确语义；数据库写入场景通常需要成功提交后再失效。
   `allEntries=true` 会清整个 cache region，key 被忽略，不能用于一个实体更新。
5. **`@CachePut`**：总会调用方法并更新缓存，不能与会跳过调用的 `@Cacheable` 随意叠在同一方法上。
6. **代理边界**：默认 proxy 模式只有通过代理进入的外部调用生效；同 bean 自调用和 `@PostConstruct`
   初始化调用不能作为缓存已生效的证据。
7. **`sync=true`**：只请求实际 provider 对单个 miss 做同步。课程必须验证 provider 与进程范围，不能把
   本 JVM single-flight 宣称为集群级锁，也不能把它当数据库/Redis 双写事务。
8. **事务感知**：需要把 put/evict 与 Spring 数据库事务结果绑定时，使用 transaction-aware cache 包装或
   显式 after-commit 回调；即时 `putIfAbsent`/`evictIfPresent` 不能被该装饰器延后。

## `RedisTemplate`、序列化与数据类型

### 模板不是“对象原样存入 Redis”

- `RedisTemplate<K, V>` 的泛型只约束 Java 调用面；Redis 线上保存的是 serializer 生成的 bytes，并由命令
  决定 String、Hash、List、Set、Sorted Set 等远端类型。
- template 配置完成后可跨线程复用，但运行期不应继续修改 serializer。key、value、hash field、hash value
  的 serializer 必须分别记录，producer/consumer 和新旧版本必须采用同一格式。
- 对可人工诊断的 key 使用稳定 String 编码和命名空间，例如 `app:entity:v1:{id}`；value 选择显式 schema
  的 String/JSON/bytes。格式升级通过版本化 key 或双读迁移，不依赖 Java 类名和 `serialVersionUID` 偶然兼容。
- 当前 `RedisTemplate`/`RedisCache` 默认 Java 原生序列化有不可信输入反序列化风险；现代与旧线都不把它
  作为推荐默认。JSON 也不是自动类型安全，仍需受控目标类型、字段演进和输入大小边界。
- Redis 同名 key 已是另一数据类型时会发生 `WRONGTYPE`；key namespace 必须同时承担所有权和数据类型合同。

### `RedisCache` 默认值不能靠记忆

- Data Redis 4.1 默认 `Key Expiration: None`，所以启用 Redis Cache 不等于已设置 TTL。
- 默认允许缓存 null、启用 cache-name prefix、key 为 String serializer、value 为 JDK serializer；正文
  必须给出每个 cache 的 TTL、是否缓存 null、prefix 和 key/value serializer。
- 现代 TTI 是 `GETEX` 重置 TTL 的近似行为。若某处绕过 Cache API 改用普通 `RedisTemplate.get`，访问不会
  续期；因此本课默认只讲 TTL，不把混合访问的“伪 TTI”作为推荐。

## Redis TTL、删除与容量回收

1. `EXPIRE key seconds` 让 key 到期删除；`TTL` 的 `-2` 是不存在，`-1` 是存在但永久。监控必须区分二者。
2. `SET` 等覆盖 key 的命令会清掉已有 TTL；`HSET`、`INCR` 等原位更新保留 TTL。任何“更新值后 TTL 仍在”
   的假设都要按具体命令验证。
3. 主动失效使用精确 `DEL key`；删除不存在 key 不报错且返回 0，可作为幂等失效动作。清空整个 database
   或模糊前缀删除不进入基础示例。
4. TTL 与 `maxmemory` eviction 是两套机制：TTL 表达业务副本生命周期，eviction 表达内存压力下的容量策略。
   不能依赖 LRU/LFU 淘汰替代业务更新失效，也不能把 `noeviction` 写成“Redis 会自动清理”。
5. `volatile-*` 只会从带 TTL 的 key 中淘汰；动态 key 若漏设 TTL，可能既长期存在又不参与 volatile 淘汰。

## Cache-aside 读写流程与一致性选择

### 读取流程

1. 由稳定业务输入计算 key。
2. 查缓存；hit 反序列化并返回。
3. miss 读取真相源。
4. 按 negative-cache 政策决定是否写入“不存在”哨兵。
5. 以显式 TTL 写入缓存并返回；写缓存失败时是否降级为直接返回数据库结果，要由业务可用性合同决定。

### 写入与失效顺序

- 推荐基础顺序是“数据库事务写入 -> 成功提交 -> 精确删除缓存 key”。数据库失败时不能先删除后又让旧值
  回填；提交后的删除失败必须进入可重试、可观测的修复路径。
- after-commit 只把失效与本地 Spring 事务结果排序，不会创建数据库与 Redis 的分布式原子提交。
  Redis `MULTI/EXEC` 也只覆盖 Redis 命令且没有 rollback，不能包住关系数据库事务。
- 失效事件/修复任务携带稳定实体 key 和版本，处理器允许重复执行；`DEL` 的不存在即忽略有利于幂等，
  但成功返回仍需观测，不能把“发出事件”当成“所有节点已失效”。

### 删除后仍可能回填旧值的并发反例

```text
R: cache miss
R: 读取数据库旧版本 v1（尚未回填）
W: 数据库提交 v2
W: DEL cache-key
R: 把刚才读到的 v1 写回 cache
```

这个反例由 Spring Cache 的无自动锁合同、数据库/Redis 两个事务边界和 cache-aside 流程共同推出。单纯
“先写库再删缓存”缩小了常见错误面，但不能消灭上面的时间窗。按业务一致性目标选择：

| 目标 | 可接受方案 | 不能声称的保证 |
| --- | --- | --- |
| 可接受短暂陈旧 | after-commit 精确失效 + 有界 TTL + 失败重试 | TTL 内强一致 |
| 同 JVM 防热 key 并发装载 | provider 已验证的 `sync=true` / 单飞 | 跨节点单飞 |
| 需要 read-your-writes | 写后绕过旧副本、返回提交值或按版本校验回填 | 普通 cache-aside 自动满足 |
| 多节点缩短陈旧窗 | 版本化 value/key、幂等失效事件、断线清 L1 | 消息发布即全部生效 |
| 不能容忍旧值 | 不缓存该读路径，或采用另行证明的权威原子设计 | Redis+DB 双写天然原子 |

## 击穿、雪崩与穿透的证据边界

这些中文标签只作为可复现风险场景，不给没有负载数据的通用阈值或“万能方案”。

1. **击穿/同 key stampede**：一个热门 key 同时过期，多个请求按官方 cache-aside miss 流程并发读取真相源。
   验证 N 个并发请求下 loader 实际调用次数；provider 范围内可试 `sync=true`，但跨 JVM 仍需单独证明。
2. **雪崩/批量冷启动**：大量 key 同一时刻失效、Redis 不可用或应用发布使 L1 全冷，后端同时接收 miss。
   用受控 key 组、可注入时钟和限流后的并发量验证；TTL 随机抖动、预热、负载削减都是需测量的工程策略，
   不能由 `EXPIRE` 文档推出固定参数。
3. **穿透/持续不存在查询**：请求大量真相源不存在的不同 key，且 `unless` 排除 null 或 CHM 无法保存 null，
   每次都会 miss。可选择短 TTL negative sentinel、输入合法性/授权校验和受控 keyspace；Bloom filter 不在
   本课来源范围，不能只写名称当作已验证方案。
4. **共同边界**：缓存故障降级不得绕过授权、租户或输入校验；保护后端的并发上限和超时属于相邻课程，
   本研究只规定验证接口，不给未经测量的吞吐结论。

## 无界键空间与回收验证

### 风险模型

- 对每个调用方 ID、反射类型、WebSocket 客户端或业务 ID 创建独立 map/Redis key，却没有 size、TTL、
  主动删除或生命周期所有者时，输入基数增长会转化为长期 key/value 保留。
- `ConcurrentHashMap` 不提供自动淘汰；Redis `TTL == -1` 表示永久 key；`volatile-*` 也不会回收无 TTL key。
  进程 GC、Redis 重启或运维手工清理都不能替代设计时的回收合同。

### 最小可复跑验证

1. 在 `/tmp` 创建 Java 25 fixture，按可控高基数输入写入 L1，记录 key count；分别验证无界 CHM、
   Caffeine `maximumSize` 和注入 Ticker 后的 expiry。连续运行两次，不能用真实 `sleep` 猜测过期。
2. 在隔离 Redis database 或唯一前缀创建 N 个测试 key，逐 key 设置明确 TTL；抽样断言 `TTL > 0`，等待
   测试时钟/容器允许的过期窗后再次检查不存在。禁止在共享环境用 `FLUSHDB`。
3. 用 `SCAN MATCH <fixture-prefix>*` 完整走到 cursor 0，并在客户端去重，因为 SCAN 可能重复；若键空间持续
   增长，记录“无法形成稳定全量快照”，不能伪报精确计数。
4. `DBSIZE` 只在专用 database 中作为总 key 数；共享 database 用前缀 SCAN 去重。`MEMORY USAGE` 只抽样
   单 key，不外推总内存；容量结论需要另行记录 Redis 配置、allocator、数据分布和进程指标。
5. 对限流器类 key 输入 N 个不同调用方标识，再停止访问并等待回收窗；最终应回到稳定上界。若 count 单调
   增长或 TTL 为 `-1`，反馈环失败。
6. fixture 通过后删除 `/tmp` 临时目录并检查不存在；不在仓库保留测试、Redis dump、日志或 browser output。

## Legacy 版本差异

| 主题 | Java 25 / Boot 4.1 / Framework 7 / Data Redis 4.1 | Java 8 / Boot 2.3.12 / Framework 5.2 / Data Redis 2.3.9 | 教学决策 |
| --- | --- | --- | --- |
| Spring Cache 基本注解 | key/condition/unless/evict/proxy | 基本合同已存在 | 共享核心，现代异步增量不回填 |
| 进程内 map | CHM 每 key 原子、无 TTL/容量 | 同一基本合同 | 两线都不手写无界缓存 |
| Caffeine BOM | 3.2.4 | 2.8.8 | 示例按各自 BOM 编译，不混用 API |
| RedisTemplate | 4.1.0，默认 JDK serializer | 2.3.9，同样默认 JDK serializer | 两线都显式 serializer |
| Redis Cache TTL | 固定/函数 TTL；可选 `enableTimeToIdle` | 固定 `entryTtl(Duration)` | 旧线不使用 TTI API |
| TTI | `GETEX` 近似，要求 Redis 6.2+ 且统一 Cache API | 归档 API 无 `enableTimeToIdle()` | 默认只讲 TTL |
| Redis transaction | 默认关闭，显式 template 开启 | 同样显式开启 | 仍只覆盖 Redis，不覆盖数据库 |
| Redis Server | 当前文档线 8.10；集成认证边界另列 | 冻结项目版本未知 | 旧示例只用共同基础命令 |

## 冻结项目证据映射

以下只映射任务给定的路径和稳定符号，不读取源码，不从类名推断实现细节。

| sourceId | 冻结路径与稳定符号 | usage | 仅能支持的结论 |
| --- | --- | --- | --- |
| `JAVA-ENGINEERING-020` | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientChatWsServer.java`；`com.tdh.bdzz.config.websocket.server.ClientChatWsServer` | `observed` | 项目存在 WebSocket 客户端相关进程内状态候选，不能推出并发、容量或清理已正确 |
| `JAVA-ENGINEERING-020` | `dzzz-app/src/main/java/com/tdh/bdzz/constant/TsblTextCacheKeyBuilder.java`；`com.tdh.bdzz.constant.TsblTextCacheKeyBuilder` | `observed` | 项目存在缓存 key 构建场景，不能推出 key 唯一性、版本化或跨服务兼容 |
| `JAVA-ENGINEERING-020` | `dzzz-app/src/main/java/com/tdh/bdzz/constant/JzglConstant.java`；`com.tdh.bdzz.constant.JzglConstant` | `observed` | 项目存在进程级共享集合/缓存候选，不能推出它有界或跨进程共享 |
| `JAVA-ENGINEERING-020` | `dzzz-app/src/main/java/com/tdh/bdzz/cache/DzzzDxpzCacheLoader.java`；`com.tdh.bdzz.cache.DzzzDxpzCacheLoader` | `observed` | 项目存在启动装载候选，不能推出刷新、失败恢复或多节点一致性 |
| `JAVA-ENGINEERING-020` | `dzzz-app/src/main/java/com/tdh/bdzz/util/ReflectionCacheUtil.java`；`com.tdh.bdzz.util.ReflectionCacheUtil` | `observed` | 项目存在反射元数据缓存候选，不能推出生命周期和 classloader 回收正确 |
| `JAVA-FRAMEWORK-012` | `dzzz-app/src/main/java/com/tdh/bdzz/config/RedisConfig.java`；`com.tdh.bdzz.config.RedisConfig` | `observed` | 只证明有 Redis 配置证据，不证明 Redis 是主缓存、已实际命中或序列化/TTL 正确 |
| `JAVA-RISK-044` | `dzzz-app/src/main/java/com/tdh/bdzz/aop/AppAspect.java`；`com.tdh.bdzz.aop.AppAspect` | `rejected` | 只保留“按调用方标识增长但无回收边界”的风险场景，不展示或推荐旧模式 |

## 不能推出的结论

- 不能由类名含 `Cache`、`Loader`、`Constant` 推出它线程安全、有 TTL、有容量上限或能跨 JVM 共享。
- 不能由存在 `RedisConfig` 推出 Redis Server 版本、拓扑、高可用、持久化、实际 key 数、命中率或序列化器。
- 不能由 Spring Cache 注解推断自调用生效、数据库提交后才失效或多个实例只加载一次。
- 不能由 Redis `MULTI/EXEC` 推出关系数据库与 Redis 原子提交，也不能由 `DISCARD` 推出已执行命令可回滚。
- 不能由 TTL 推出到期瞬间物理内存立即下降，也不能由 eviction 推出业务数据已更新。
- 不能把 `AppAspect` 的旧限流器 key 模式改写为推荐示例；正文只使用脱敏、最小、带显式回收的重写场景。
- 不能给出没有 workload、命中分布、对象大小、Redis 配置和测量结果的性能数字。

## 易错点取证与反馈环计划

正文至少覆盖以下可观察错误，每项按“现象 -> 触发条件 -> 原因 -> 后果 -> 错误示例 -> 正确写法 ->
影响版本 -> 验证方式 -> 来源”组织：

1. 把 CHM 当成自带 TTL/容量的完整 cache。
2. 用可变对象、遗漏租户或无版本前缀组成 key，造成碰撞或跨版本误读。
3. 混淆 `condition` 和 `unless`，意外把不存在查询持续打到数据库。
4. 默认 proxy 自调用导致 `@Cacheable`/`@CacheEvict` 实际未执行。
5. 数据库事务回滚但缓存已提前删除/写入，或提交成功后失效失败无人重试。
6. 先读旧 DB、写者提交并删除、读者再回填旧值的 cache-aside 竞态。
7. `SET` 覆盖后误以为旧 TTL 仍在，产生 `TTL == -1` 的永久 key。
8. 混用 key/value/hash serializer 或 key 对应 Redis 类型，导致乱码、反序列化失败或 `WRONGTYPE`。
9. 把 `sync=true` 当成集群分布式锁，或把 Redis transaction 当跨数据库事务。
10. 热 key 同时过期、批量冷启动、持续不存在 key 和按调用方高基数 key 没有可量化回收反馈环。

## 课程设计与验证合同

1. 正文顺序固定为：真相源与 L1/L2 边界 -> CHM 心智模型 -> Caffeine 有界/TTL -> Spring Cache
   key/condition/unless/evict/proxy -> RedisTemplate/serializer/type -> Redis TTL/delete/eviction -> cache-aside
   并发时间线 -> 事务/幂等 -> 击穿/雪崩/穿透 -> 键空间验证 -> legacy 差异。
2. Java 25 正例使用不可变业务 key、Caffeine 3.2.4 有界 L1、Framework 7.0.8 Cache 注解和
   Data Redis 4.1.0 显式 serializer/TTL；不要求真实项目引入 Caffeine。
3. Java 8 正例按 Boot 2.3.12 BOM 使用共同 API，只配置固定 TTL，不调用 TTI/GETEX 或现代 API。
4. `/tmp` 中建立最小 fixture：CHM/Caffeine 回收、Spring proxy 自调用、事务提交/回滚后的失效、
   cache-aside 旧值回填时间线、Redis serializer/TTL/SCAN 去重。现代与旧线各连续通过两次。
5. Redis fixture 使用隔离容器或唯一前缀，不接触共享数据；若无法取得兼容 Redis/Java 8 运行时，相关项
   标记 Deferred，不能用 Java 25 或 Redis 8.10 的结果替代。
6. 本研究不添加持久测试、demo、依赖、配置、track/manifest 接线或页面；所有临时资产成功后删除并验证不存在。

## 研究 Gate 自检

- [x] 课程 ID、顺序 540、两个前置、三个来源能力和选择理由已冻结。
- [x] 31 个直接来源均记录 URL、精确适用版本、`sourceType`、claims 和 `verifiedAt`，HTTP 均为 200。
- [x] Spring Boot 4.1.0、Framework 7.0.8、Data Redis 4.1.0 与 Java 25 主线已核验。
- [x] Redis 8.10 当前稳定线与 Data Redis 4.1 的最低/测试范围已分开，没有伪造兼容认证。
- [x] Java 8、Boot 2.3.12、Framework 5.2.15、Data Redis 2.3.9 的归档合同已分别核验。
- [x] 已覆盖 L1/L2、key/condition/unless/evict、serializer/type、TTL/delete/eviction、cache-aside
  并发/双写、事务/幂等、击穿/雪崩/穿透和无界键空间验证。
- [x] Caffeine 是唯一第三方缓存来源；未使用博客或社区文章作为证据。
- [x] 项目证据恰列任务给定 7 个路径/符号，`AppAspect` 标记 `rejected`，未读取或运行 `dzzz-app`。

## 发布结论与 Stop Boundary

本文件只完成 Java 高级第 5 门课程的官方资料研究。课程正文、临时反馈环、依赖变更、发布接线、页面证据、
独立 signoff 与双轴复审均未执行；不得据此开始任何后续高级课程。
