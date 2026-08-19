---
id: backend.java.learn.advanced.cache-and-consistency
type: lesson
title: 进程内缓存、Redis、失效与一致性
summary: 区分 JVM 内缓存和 Redis 的边界，并为容量、TTL、失效与一致性建立可验证合同
domain: backend
technology: java
module: core
stage: advanced
level: advanced
estimatedMinutes: 240
objectives:
  - 能画出真相源、进程内 L1 和 Redis L2 的可见范围，并说明缓存不能替代持久化。
  - 能为 Spring Cache 选择稳定 key，正确使用 condition、unless、CachePut 和 CacheEvict。
  - 能配置有界容量和 TTL，观察 Redis 的 TTL、删除、序列化和键类型结果。
  - 能按 cache-aside 的读写时间线解释并发旧值回填、事务提交和幂等失效边界。
  - 能为热点、批量冷启动、不存在查询和高基数 key 建立可重复的回收验证。
prerequisites:
  - backend.java.learn.advanced.concurrency-locks-and-shared-state
  - backend.java.learn.intermediate.dependency-injection-and-bean-lifecycle
related: []
tags:
  - Java
  - ConcurrentHashMap
  - Caffeine
  - Spring Cache
  - Cacheable
  - CacheEvict
  - RedisTemplate
  - RedisCacheManager
  - TTL
  - cache-aside
  - 一致性
  - 键空间回收
appliesTo: Java 25 / Spring Boot 4.1.0 / Spring Framework 7.0.8 / Spring Data Redis 4.1.0 主线；项目补充适用于 Java 8 / Spring Boot 2.3.12.RELEASE / Spring Framework 5.2.15.RELEASE / Spring Data Redis 2.3.9.RELEASE
modernBaseline:
  java: '25'
  springBoot: 4.1.0
  springFramework: 7.0.8
  springDataRedis: 4.1.0
  caffeine: 3.2.4
legacyBaseline:
  java: '8'
  springBoot: 2.3.12.RELEASE
  springFramework: 5.2.15.RELEASE
  springDataRedis: 2.3.9.RELEASE
  caffeine: 2.8.8
verifiedAt: 2026-08-10
sources:
  - id: oracle-java-support-roadmap
    title: Oracle Java SE Support Roadmap
    url: https://www.oracle.com/java/technologies/java-se-support-roadmap.html
    sourceType: official-reference
    appliesTo: Java 25 LTS
    claims:
      - Oracle 支持路线将 Java 25 列为 LTS
  - id: java25-concurrent-hash-map
    title: Java SE 25 ConcurrentHashMap API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html
    sourceType: api-doc
    appliesTo: Java 25
    claims:
      - 每键 computeIfAbsent 原子、禁止 null，整体 bulk 视图不是快照
  - id: java8-concurrent-hash-map
    title: Java SE 8 ConcurrentHashMap API
    url: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ConcurrentHashMap.html
    sourceType: api-doc
    appliesTo: Java 8
    claims:
      - Java 8 保留每键并发映射合同，但没有容量和 TTL 策略
  - id: boot41-system-requirements
    title: Spring Boot 4.1 System Requirements
    url: https://docs.spring.io/spring-boot/system-requirements.html
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Boot 4.1.0 支持 Java 25 和 Spring Framework 7.0.8
  - id: boot41-managed-dependencies
    title: Spring Boot 4.1 Managed Dependency Coordinates
    url: https://docs.spring.io/spring-boot/appendix/dependency-versions/coordinates.html
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Boot 4.1.0 管理 Spring Data Redis 4.1.0 与 Caffeine 3.2.4
  - id: spring7-cache-strategies
    title: Spring Framework 7 Cache Strategies
    url: https://docs.spring.io/spring-framework/reference/integration/cache/strategies.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - Spring Cache 是抽象，provider 决定多线程、多进程、传播和并发加载行为
  - id: spring7-cache-annotations
    title: Spring Framework 7 Cache Annotations
    url: https://docs.spring.io/spring-framework/reference/integration/cache/annotations.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - key、condition、unless、CachePut、CacheEvict、sync 和 proxy 模式的合同
  - id: spring7-cache-storage
    title: Spring Framework 7 Cache Store Configuration
    url: https://docs.spring.io/spring-framework/reference/integration/cache/store-configuration.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - ConcurrentMap provider 无管理、持久化和淘汰合同，Caffeine 是可选 provider
  - id: spring7-transaction-aware-cache
    title: Spring Framework 7 TransactionAwareCacheDecorator API
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/cache/transaction/TransactionAwareCacheDecorator.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - put、evict 和 clear 可延迟到事务成功提交后，即时操作不会延迟
  - id: spring-data-redis41-preface
    title: Spring Data Redis 4.1 Preface
    url: https://docs.spring.io/spring-data/redis/reference/preface.html
    sourceType: official-reference
    appliesTo: Spring Data Redis 4.1.0
    claims:
      - 4.1.0 的 JDK、Framework 和 Redis 最低/测试范围
  - id: spring-data-redis41-template
    title: Spring Data Redis 4.1 RedisTemplate
    url: https://docs.spring.io/spring-data/redis/reference/redis/template.html
    sourceType: official-reference
    appliesTo: Spring Data Redis 4.1.0
    claims:
      - RedisTemplate 可分别配置 key、value、hash key、hash value serializer，配置后可跨线程复用
  - id: spring-data-redis41-cache
    title: Spring Data Redis 4.1 Redis Cache
    url: https://docs.spring.io/spring-data/redis/reference/redis/redis-cache.html
    sourceType: official-reference
    appliesTo: Spring Data Redis 4.1.0
    claims:
      - Redis Cache 默认无过期并使用 JDK value serializer，TTL、null 和 TTI 必须显式决定
  - id: spring-data-redis41-transactions
    title: Spring Data Redis 4.1 Transactions
    url: https://docs.spring.io/spring-data/redis/reference/redis/transactions.html
    sourceType: official-reference
    appliesTo: Spring Data Redis 4.1.0
    claims:
      - Redis MULTI/EXEC 只覆盖 Redis 命令，RedisTemplate 默认不参与 Spring 事务
  - id: redis810-release-notes
    title: Redis Open Source 8.10 Release Notes
    url: https://redis.io/docs/latest/operate/oss_and_stack/stack-with-enterprise/release-notes/redisce/redisos-8.10-release-notes/
    sourceType: release-note
    appliesTo: Redis Open Source 8.10.0
    claims:
      - 8.10.0 是当前 Redis 稳定文档线，但不证明 Spring 集成认证
  - id: redis-data-types
    title: Redis Data Types
    url: https://redis.io/docs/latest/develop/data-types/
    sourceType: official-reference
    appliesTo: Redis Open Source 8.10 docs
    claims:
      - Redis 远端值有 String、Hash、List、Set、Sorted Set 和 Stream 等类型合同
  - id: redis-cache-aside-tutorial
    title: Redis Cache-Aside Tutorial
    url: https://redis.io/tutorials/howtos/solutions/microservices/caching/
    sourceType: official-reference
    appliesTo: Redis cache-aside pattern
    claims:
      - miss 时读 primary database，再以 TTL 写 Redis，hit 直接返回缓存
  - id: redis-client-side-caching
    title: Redis Client-Side Caching
    url: https://redis.io/docs/latest/develop/reference/client-side-caching/
    sourceType: official-reference
    appliesTo: Redis client-side caching
    claims:
      - 本地副本失效消息可能乱序，断线时应清空本地缓存
  - id: redis-expire
    title: Redis EXPIRE Command
    url: https://redis.io/docs/latest/commands/expire/
    sourceType: api-doc
    appliesTo: Redis EXPIRE
    claims:
      - 覆盖 key 的命令会清除 TTL，原位修改通常保留 TTL，NX/XX/GT/LT 有互斥条件
  - id: redis-ttl
    title: Redis TTL Command
    url: https://redis.io/docs/latest/commands/ttl/
    sourceType: api-doc
    appliesTo: Redis TTL
    claims:
      - -2 表示 key 不存在，-1 表示存在但没有过期时间
  - id: redis-del
    title: Redis DEL Command
    url: https://redis.io/docs/latest/commands/del/
    sourceType: api-doc
    appliesTo: Redis DEL
    claims:
      - 删除不存在 key 是安全的幂等动作并返回 0
  - id: redis-key-eviction
    title: Redis Key Eviction
    url: https://redis.io/docs/latest/develop/reference/eviction/
    sourceType: official-reference
    appliesTo: Redis maxmemory eviction
    claims:
      - noeviction、allkeys-* 和 volatile-* 是容量策略，不替代业务失效
  - id: redis-transactions
    title: Redis Transactions
    url: https://redis.io/docs/latest/develop/using-commands/transactions/
    sourceType: official-reference
    appliesTo: Redis transactions
    claims:
      - MULTI/EXEC 顺序隔离执行但不提供 rollback，WATCH 只是乐观 CAS
  - id: redis-scan
    title: Redis SCAN Command
    url: https://redis.io/docs/latest/commands/scan/
    sourceType: api-doc
    appliesTo: Redis SCAN
    claims:
      - SCAN 可能重复返回元素，客户端必须去重并迭代至 cursor 0
  - id: redis-dbsize
    title: Redis DBSIZE Command
    url: https://redis.io/docs/latest/commands/dbsize/
    sourceType: api-doc
    appliesTo: Redis DBSIZE
    claims:
      - DBSIZE 只适合专用 database 的总 key 数，不是共享前缀的精确计数
  - id: redis-memory-usage
    title: Redis MEMORY USAGE Command
    url: https://redis.io/docs/latest/commands/memory-usage/
    sourceType: api-doc
    appliesTo: Redis 4.0+
    claims:
      - MEMORY USAGE 只报告单个 key 的 RAM 估算，不代表整个进程 RSS
  - id: caffeine324-eviction
    title: Caffeine Eviction Maintainer Guide
    url: https://github.com/ben-manes/caffeine/wiki/Eviction
    sourceType: engineering-reference
    appliesTo: Caffeine 3.2.4
    claims:
      - maximumSize、expireAfterWrite、expireAfterAccess 和可注入 Ticker 的淘汰合同
  - id: boot2312-system-requirements
    title: Spring Boot 2.3.12 System Requirements
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Boot 2.3.12 需要 Java 8 并使用 Spring Framework 5.2.15.RELEASE
  - id: boot2312-managed-dependencies
    title: Spring Boot 2.3.12 Managed Dependencies
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/appendix-dependency-versions.html
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - 归档 BOM 管理 Data Redis 2.3.9、Lettuce 5.3.7 和 Caffeine 2.8.8
  - id: spring5215-cache-reference
    title: Spring Framework 5.2.15 Cache Reference
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/integration.html#cache
    sourceType: official-reference
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 旧线已有 Cacheable、CachePut、CacheEvict、key/condition/unless 和 proxy 自调用边界
  - id: spring-data-redis239-reference
    title: Spring Data Redis 2.3.9 Reference
    url: https://docs.spring.io/spring-data/redis/docs/2.3.9.RELEASE/reference/html/
    sourceType: official-reference
    appliesTo: Spring Data Redis 2.3.9.RELEASE
    claims:
      - 旧线有 RedisTemplate、独立 serializer、事务支持和固定 entryTtl
  - id: spring-data-redis239-cache-api
    title: Spring Data Redis 2.3.9 RedisCacheConfiguration API
    url: https://docs.spring.io/spring-data/redis/docs/2.3.9.RELEASE/api/org/springframework/data/redis/cache/RedisCacheConfiguration.html
    sourceType: api-doc
    appliesTo: Spring Data Redis 2.3.9.RELEASE
    claims:
      - 旧 API 支持 entryTtl、null 开关和 key/value 序列化配置，不含 enableTimeToIdle
projectEvidence:
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientChatWsServer.java
    symbol: com.tdh.bdzz.config.websocket.server.ClientChatWsServer
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/constant/TsblTextCacheKeyBuilder.java
    symbol: com.tdh.bdzz.constant.TsblTextCacheKeyBuilder
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/constant/JzglConstant.java
    symbol: com.tdh.bdzz.constant.JzglConstant
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/cache/DzzzDxpzCacheLoader.java
    symbol: com.tdh.bdzz.cache.DzzzDxpzCacheLoader
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/ReflectionCacheUtil.java
    symbol: com.tdh.bdzz.util.ReflectionCacheUtil
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/RedisConfig.java
    symbol: com.tdh.bdzz.config.RedisConfig
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/aop/AppAspect.java
    symbol: com.tdh.bdzz.aop.AppAspect
    usage: rejected
---

# 进程内缓存、Redis、失效与一致性

## 为什么需要学习

缓存不是“把结果放进 Map 就结束”。它是一个可丢弃副本：要回答它从哪里来、谁能看到、何时过期、更新失败时怎么办，以及副本被回收后能否重新构建。本课把 JVM 内缓存、Redis 和数据库放在同一条时间线上，帮助你在请求变快与读到旧值之间做出有证据的选择。

## 学习目标

- 能区分真相源、进程内 L1 和 Redis L2 的生命周期与可见范围。
- 能写出稳定、版本化、带作用域的 Spring Cache key，并选择 `condition`、`unless`、`@CachePut` 或 `@CacheEvict`。
- 能证明容量淘汰、TTL、主动删除和 Redis `maxmemory` 是不同的回收机制。
- 能按 cache-aside 时间线解释事务提交、并发旧值回填和幂等失效。
- 能用隔离前缀、`SCAN` 去重和可控时钟验证高基数 key 是否回收。

## 前置术语

- **真相源：** 业务最终认可的数据库或领域存储。缓存丢失后必须能从这里重建。
- **L1：** 当前 JVM 内的进程内缓存；只在一个应用实例里共享。
- **L2：** 进程外的 Redis 等共享缓存；多个实例可以访问同一 keyspace，但本地副本仍要单独失效。
- **TTL：** key 的剩余生命周期上限，不是数据库提交的证明。

## 零基础知识点详解

### 真相源、L1 与 L2 是三个不同边界

**它是什么：** 数据库是真相源，Caffeine 等进程内缓存是 L1，Redis 是 L2。

**有什么作用：** 画清边界后，你才能判断重启、扩容、滚动发布和 Redis 故障会让谁失去数据。

**什么时候使用：** 只有可重建的读副本才适合缓存；权威状态不能因为缓存丢失而无法恢复。

**怎么使用：**

1. 先写出真相源和可重建查询。
2. 再为同一查询选择单 JVM L1 或共享 L2，并记录失效入口。
3. 最后验证重启一个实例时，其他实例是否仍能从真相源恢复。

**最小示例：**

```java
/** 表示可以从数据库重新读取的产品快照。 */
public record ProductSnapshot(String tenantId, long productId, String name, long version) {}
```

**运行结果：** `ProductSnapshot` 是副本数据；删除它不会删除数据库中的产品。

**常见误区：** Redis 能被多个实例访问，不代表它和数据库自动组成一个事务。

### 缓存 key 是数据合同的一部分

**它是什么：** key 把租户、实体、业务标识和 schema 版本编码成稳定字符串。

**有什么作用：** 缺少租户或版本会碰撞、串租户或在发布后读取旧格式。

**什么时候使用：** 所有跨请求、跨实例或跨版本的缓存都应显式定义 key；不要依赖可变对象的 `toString()`。

**怎么使用：**

1. 选择固定命名空间，例如 `catalog:product:v1`。
2. 拼入租户和业务 ID，并对外部输入做长度和字符限制。
3. 在 schema 变更时升版本，旧 key 用 TTL 或迁移任务回收。

**最小示例：**

```java
package study.cache;

/** 为产品查询生成带租户和 schema 版本的 Redis key。 */
public final class ProductCacheKey {
    /** 返回稳定的缓存 key。 */
    public static String of(String tenantId, long productId) {
        return "catalog:product:v1:" + tenantId + ":" + productId;
    }
}
```

**运行结果：** 同一租户和产品得到同一个 key，不同租户或版本不会复用同一值。

**常见误区：** 只用 `productId` 在多租户服务中会造成跨租户读错。

### ConcurrentHashMap 只解决并发映射

**它是什么：** `ConcurrentHashMap.computeIfAbsent` 对同一 JVM、同一 key 的映射更新提供原子合同。

**有什么作用：** 它可以保护一次映射更新，却没有容量上限、TTL、统计或跨进程传播。

**什么时候使用：** 只把 CHM 当作小型、短生命周期的进程内索引，且能证明 key 数量有上界。

**怎么使用：**

1. 让 mapping function 短小，不在原子计算区执行不可控的慢 I/O。
2. 对“不存在”使用独立 sentinel 和短 TTL，不能把 `null` 放进 CHM。
3. 需要容量、时间淘汰或统计时换成明确配置的缓存 provider。

**最小示例：**

```java
var index = new java.util.concurrent.ConcurrentHashMap<String, ProductSnapshot>();
var value = index.computeIfAbsent("tenant-a:42", key -> loadFromDatabase(key));
```

**运行结果：** `value` 会被放入当前 JVM 的 map；重启或另一实例不会得到它。

**常见误区：** 给字段加 `ConcurrentHashMap` 类型并不会自动产生过期和回收策略。

### 有界容量和 TTL 必须分别配置

**它是什么：** 容量上限控制最多保留多少，TTL 控制副本最多新鲜多久。

**有什么作用：** 只有容量会导致旧值过快淘汰，只有 TTL 会让高基数 key 长期占满内存。

**什么时候使用：** L1 至少应有可解释的容量或权重上限；TTL 依据允许陈旧窗口设置，而不是凭感觉填写。

**怎么使用：**

1. 用 Caffeine 的 `maximumSize` 或 `maximumWeight` 设置容量轴。
2. 用 `expireAfterWrite` 或 `expireAfterAccess` 设置时间轴。
3. 用注入的 `Ticker` 验证过期，不用真实 `sleep` 推断生产行为。

**最小示例：**

```java
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

/** 创建有界、按写入时间回收的进程内缓存。 */
public final class LocalProductCache {
    private final Cache<String, ProductSnapshot> cache = Caffeine.newBuilder()
        .maximumSize(10_000)
        .expireAfterWrite(java.time.Duration.ofMinutes(5))
        .build();

    /** 读取一个本地快照。 */
    public ProductSnapshot get(String key) {
        return cache.getIfPresent(key);
    }
}
```

**运行结果：** 缓存最多按 provider 规则保留约 10,000 个条目，并在写入后五分钟进入过期维护；这不是五分钟内强一致。

**常见误区：** 淘汰释放容量，不代表数据库已更新，也不代表所有节点都删除了旧值。

### Spring Cache 抽象不等于存储策略

**它是什么：** `@Cacheable` 等注解描述命中、加载和更新动作，实际容量、TTL、传播和并发由 provider 决定。

**有什么作用：** 同一段注解代码换成 ConcurrentMap、Caffeine 或 Redis 后，运行合同可能不同。

**什么时候使用：** 业务方法稳定且缓存可丢弃时使用抽象；把 provider 配置和版本作为部署合同保存。

**怎么使用：**

1. 在配置中绑定命名 `CacheManager`，明确每个 cache region 的 TTL 和序列化。
2. 在方法上写出稳定 key，并在测试中断言命中、miss 和失效次数。
3. 用运行指标验证 provider 的实际行为，不用注解名称替代证据。

**最小示例：**

```java
/** 通过 Spring Cache 读取可重建的产品快照。 */
@org.springframework.cache.annotation.Cacheable(
    cacheNames = "products",
    key = "T(study.cache.ProductCacheKey).of(#tenantId, #productId)",
    condition = "#productId > 0",
    unless = "#result == null"
)
public ProductSnapshot find(String tenantId, long productId) {
    return repository.find(tenantId, productId);
}
```

**运行结果：** 调用前 `condition` 决定是否参与缓存，方法返回后 `unless` 决定是否写入；两者时机不同。

**常见误区：** 把 `unless` 当成调用前条件，或把 `sync=true` 当成集群锁。

### `@CachePut`、`@CacheEvict` 与代理入口

**它是什么：** `@CachePut` 总会执行方法后写入，`@CacheEvict` 删除条目，默认 proxy 模式只拦截代理外部调用。

**有什么作用：** 读缓存和写缓存的目的不同；错误叠加或同类自调用会让缓存看起来“配置了却没生效”。

**什么时候使用：** 更新接口已返回权威新值时可用 `@CachePut`；更新后无法确定表示值时优先精确 evict。

**怎么使用：**

1. 把 `@Cacheable` 读方法和更新方法拆开，避免在同一方法同时表达跳过调用和总是调用。
2. 通过 Spring 代理进入方法，或把需要缓存的逻辑放到另一个 bean。
3. 为同类自调用写一个失败测试，确认它没有被误当成缓存命中证据。

**最小示例：**

```java
/** 成功写入后删除产品读缓存。 */
@org.springframework.cache.annotation.CacheEvict(
    cacheNames = "products",
    key = "T(study.cache.ProductCacheKey).of(#tenantId, #productId)"
)
public void update(String tenantId, long productId, String name) {
    repository.update(tenantId, productId, name);
}
```

**运行结果：** 只有代理调用且方法正常返回时，默认的 evict 才会发生；异常路径不会按默认合同删除。

**常见误区：** 把 `allEntries=true` 用于单条更新，或者在 `@PostConstruct` 里调用带缓存注解的方法。

### RedisTemplate 的泛型不能替代序列化合同

**它是什么：** `RedisTemplate<String, ProductSnapshot>` 的泛型只约束 Java 调用面，Redis 保存的是 serializer 产生的 bytes。

**有什么作用：** 显式 key/value/hash serializer 能避免跨服务乱码、类名耦合和 `WRONGTYPE`。

**什么时候使用：** Redis key 需要人工诊断或多服务共享时使用稳定 String；value 使用受控 JSON、String 或 bytes 格式。

**怎么使用：**

1. 分别记录 key、value、hash key 和 hash value 的 serializer。
2. 给 key 加命名空间、数据类型和 schema 版本。
3. 格式变更时升版本或双读迁移，不把默认 JDK 序列化用于不可信输入。

**最小示例：**

```java
/** 创建使用显式 String serializer 的 RedisTemplate。 */
@org.springframework.context.annotation.Bean
public org.springframework.data.redis.core.StringRedisTemplate productRedisTemplate(
    org.springframework.data.redis.connection.RedisConnectionFactory factory
) {
    return new org.springframework.data.redis.core.StringRedisTemplate(factory);
}
```

**运行结果：** key 与 value 都按字符串字节写入；对象 JSON 需要另一个经过审查的 schema 和 serializer。

**常见误区：** 以为 Java 泛型会让远端 key 自动变成同一种 Redis 数据类型。

### Redis Cache 的默认值必须实际写出

**它是什么：** Data Redis 的默认 cache 配置没有过期时间，允许 null，value 默认使用 JDK serializer。

**有什么作用：** 如果只写 `RedisCacheManager` 而不写配置，缓存可能永久存在且无法安全跨服务解析。

**什么时候使用：** 每个 cache name 都应有显式 TTL、null 策略、key prefix 和 value serializer。

**怎么使用：**

1. 从 `RedisCacheConfiguration.defaultCacheConfig()` 开始覆盖默认值。
2. 用 `entryTtl` 设置副本生命周期，并决定是否 `disableCachingNullValues()`。
3. 统一所有读写入口；不要一处走 Cache API、另一处用 `RedisTemplate.get` 假装 TTI。

**最小示例：**

```java
/** 为产品 cache 显式配置 prefix、serializer、固定 TTL 和 null 策略。 */
public org.springframework.data.redis.cache.RedisCacheConfiguration productCacheConfiguration() {
    var keyPair = org.springframework.data.redis.serializer.RedisSerializationContext
        .SerializationPair.fromSerializer(
            new org.springframework.data.redis.serializer.StringRedisSerializer()
        );
    var valuePair = org.springframework.data.redis.serializer.RedisSerializationContext
        .SerializationPair.fromSerializer(
            new org.springframework.data.redis.serializer.JacksonJsonRedisSerializer<>(
                ProductSnapshot.class
            )
        );
    return org.springframework.data.redis.cache.RedisCacheConfiguration.defaultCacheConfig()
        .entryTtl(java.time.Duration.ofMinutes(5))
        .disableCachingNullValues()
        .computePrefixWith(cacheName -> "study:" + cacheName + ":")
        .serializeKeysWith(keyPair)
        .serializeValuesWith(valuePair);
}
```

**运行结果：** key 以 `study:products:` 开头并使用 String serializer；value 只按 `ProductSnapshot` 的受控 JSON 类型读写，并以五分钟为回收上限。它不表达数据库与 Redis 的原子提交。

**常见误区：** 把 `enableTimeToIdle` 当成普通 `GET` 的自动续期；它要求统一 Cache API 与 Redis 6.2 以上。

### TTL、DEL 和 maxmemory 是三套机制

**它是什么：** TTL 是业务生命周期，`DEL` 是主动失效，`maxmemory` eviction 是内存压力下的容量策略。

**有什么作用：** 这三者解决不同问题，混用会造成永久 key、错误告警或把业务失效交给随机淘汰。

**什么时候使用：** 写入副本时设置 TTL，领域更新后精确 `DEL`；运维再按访问分布配置 eviction policy。

**怎么使用：**

1. 读取 `TTL`，区分 `-2`（不存在）与 `-1`（永久）。
2. 覆盖 key 后重新检查 TTL，因为 `SET` 等命令会清除旧 TTL。
3. 在隔离 database 或唯一前缀中验证 key 数与单 key 内存，不使用共享环境的模糊删除。

**最小示例：**

```text
SET catalog:product:v1:tenant-a:42 '{"version":2}' EX 300
TTL catalog:product:v1:tenant-a:42   -> 300 附近
DEL catalog:product:v1:tenant-a:42   -> 1 或 0（可重放）
```

**运行结果：** `TTL=-1` 说明存在永久 key；`TTL=-2` 说明 key 已不存在。

**常见误区：** `volatile-*` 只选择带 TTL 的 key；没有 TTL 的高基数 key 不会因此自动回收。

### cache-aside 的读路径

**它是什么：** 应用先查缓存，miss 后读真相源，再把结果按 TTL 写回缓存。

**有什么作用：** 应用明确掌握缓存何时参与，缓存故障也能设计降级和观测。

**什么时候使用：** 读多写少、结果可重建且允许明确陈旧预算时使用。

**怎么使用：**

1. 由稳定输入计算 key 并查询缓存。
2. miss 时读取真相源，区分合法空结果与错误。
3. 按 negative-cache 政策写入短 TTL，再返回权威结果。

**最小示例：**

```java
/** 实现一次可观察的 cache-aside 读取。 */
public ProductSnapshot read(String key) {
    ProductSnapshot cached = localCache.getIfPresent(key);
    if (cached != null) return cached;
    ProductSnapshot loaded = repository.load(key);
    if (loaded != null) localCache.put(key, loaded);
    return loaded;
}
```

**运行结果：** hit 不访问 repository；miss 才读取并尝试回填。写缓存失败是否降级必须由业务合同决定。

**常见误区：** `unless="#result == null"` 会让不存在查询每次都 miss，持续打到真相源。

### 写入顺序不能制造假一致性

**它是什么：** 基础策略是数据库事务成功提交，再精确删除缓存；删除失败要进入可重试、可观测路径。

**有什么作用：** 事务回滚时不会把未提交值写入缓存，提交后删除则缩短旧值窗口。

**什么时候使用：** 允许短暂陈旧且能接受异步修复时使用；不能容忍旧值的读路径应绕过缓存或采用另行证明的设计。

**怎么使用：**

1. 在数据库事务中写入新版本。
2. 只在 after-commit 回调中删除精确 key。
3. 为删除失败记录实体 key 和版本，并让重试可重复执行。

**最小示例：**

```java
/** 表示提交后可重放的缓存失效命令。 */
public record InvalidateProduct(String key, long version) {
    /** 执行幂等的失效动作。 */
    public void apply(org.springframework.cache.Cache cache) {
        cache.evictIfPresent(key);
    }
}
```

**运行结果：** 失效命令重复执行不会因 key 已不存在而失败；它仍不能把数据库和 Redis 合成一个原子事务。

**常见误区：** Redis `MULTI/EXEC` 只覆盖 Redis 命令，不会回滚已经提交的数据库事务。

### cache-aside 存在旧值回填时间窗

**它是什么：** 读者先读到旧 DB 值，写者随后提交并删除缓存，读者最后又把旧值回填。

**有什么作用：** 这条时间线说明“先写库再删缓存”是缩小风险的顺序，不是强一致证明。

**什么时候使用：** 把它作为并发测试和一致性选择的基线；需要 read-your-writes 时返回提交值或按版本校验。

**怎么使用：**

1. 在测试中让读者暂停在“已读旧值、未回填”位置。
2. 让写者提交新版本并删除 key。
3. 恢复读者，断言旧值回填会违反版本规则，并加入版本拒绝或绕过缓存策略。

**最小示例：**

```text
R: miss -> 读到数据库 v1
W: 提交数据库 v2 -> DEL key
R: 把 v1 写回 key
```

**运行结果：** 没有版本或并发协调时，缓存可能短暂恢复 v1；这不是 Redis 命令本身的 bug。

**常见误区：** 把一次成功的 `DEL` 日志当成“所有并发读者都已失效”。

### 事务感知缓存只负责排序

**它是什么：** `TransactionAwareCacheDecorator` 可将 put、evict、clear 延迟到 Spring 事务成功提交后。

**有什么作用：** 它把缓存动作和本地事务结果排序，但不提供数据库与 Redis 的分布式提交。

**什么时候使用：** 已确认本地 Spring 事务边界且 provider 支持时使用；即时 `putIfAbsent` 和 `evictIfPresent` 要单独审查。

**怎么使用：**

1. 确定数据库事务的 owner 和传播行为。
2. 将可延迟的缓存操作绑定 after-commit。
3. 对提交后 Redis 故障保留重试事件和告警，不吞掉失败。

**最小示例：**

```java
/** 在业务服务中表达提交后失效，而不是提前删除。 */
@org.springframework.transaction.annotation.Transactional
public void rename(String tenantId, long productId, String name) {
    repository.rename(tenantId, productId, name);
    events.publish(new InvalidateProduct(ProductCacheKey.of(tenantId, productId), nextVersion()));
}

/** 只在事务成功提交后执行幂等失效命令。 */
@org.springframework.transaction.event.TransactionalEventListener(
    phase = org.springframework.transaction.event.TransactionPhase.AFTER_COMMIT
)
public void invalidateAfterCommit(InvalidateProduct command) {
    command.apply(cache);
}
```

**运行结果：** 事务回滚时 listener 不执行失效；成功提交后才调用 `command.apply(cache)`，其失败仍需进入告警与可重试补偿。

**常见误区：** 在事务中先 `cache.evict` 再写数据库，回滚后会留下无谓 miss，甚至让并发回填更难判断。

### 击穿、雪崩与穿透是不同反馈环

**它是什么：** 热 key 同时 miss 是击穿；大量 key 同时失效或实例冷启动是雪崩；大量不存在输入持续 miss 是穿透。

**有什么作用：** 不同触发条件需要不同观测，不能用一个“加缓存”答案覆盖。

**什么时候使用：** 只有有受控负载和指标时才讨论策略参数；本课不凭空给出吞吐或 TTL 数字。

**怎么使用：**

1. 为单热 key、批量 key、不存在 key 分别设置可控输入。
2. 记录 loader 次数、后端耗时、拒绝数、缓存错误和最终 key 数。
3. 再验证 `sync=true`、TTL 抖动、negative sentinel 或限流是否只改善了 provider 能覆盖的范围。

**最小示例：**

```java
/** 统计一次真实源加载，供击穿反馈环断言。 */
public final class LoadCounter {
    private final java.util.concurrent.atomic.AtomicInteger calls = new java.util.concurrent.atomic.AtomicInteger();

    /** 记录并返回当前加载次数。 */
    public int increment() {
        return calls.incrementAndGet();
    }
}
```

**运行结果：** 并发 N 次 miss 时，`calls` 的实际值才是 single-flight 是否成立的证据。

**常见误区：** `sync=true` 最多请求 provider 范围内的单飞，不能宣称跨 JVM 或跨 Redis 集群锁。

### 无界键空间必须有 owner 和回收上限

**它是什么：** 每个调用方、反射类型或业务 ID 创建一个永不删除的 map/Redis key，会使输入基数转化为长期内存占用。

**有什么作用：** 它把 `AppAspect` 的冻结风险转成可验证的教学边界，而不是复制旧写法。

**什么时候使用：** 限流器、元数据缓存和连接状态都必须写出最大规模、TTL、删除入口和生命周期 owner。

**怎么使用：**

1. 以唯一前缀写入受控数量的高基数 key。
2. 用 `SCAN` 迭代到 cursor 0 并去重，抽样检查 `TTL`。
3. 停止访问后再次检查，确认数量回到设计上界或记录明确的 deferred 原因。

**最小示例：**

```text
SCAN 0 MATCH lesson:fixture:limiter:* COUNT 100
TTL lesson:fixture:limiter:tenant-a  -> 必须大于 0
```

**运行结果：** `SCAN` 可能重复元素，客户端去重；共享 database 不能用 `DBSIZE` 冒充前缀精确计数。

**常见误区：** GC、Redis 重启或手工清库不是缓存设计的回收合同。

### 版本差异必须保留在兼容线

**它是什么：** 现代线是 Java 25 / Boot 4.1.0 / Framework 7.0.8 / Data Redis 4.1.0；旧线是 Java 8 / Boot 2.3.12 / Framework 5.2.15 / Data Redis 2.3.9。

**有什么作用：** 学习者可以读懂旧项目，又不会把新 API 误写回 Java 8。

**什么时候使用：** 共享核心只使用两条版本线都存在的 Cache 注解、固定 TTL 和显式 serializer。

**怎么使用：**

1. 现代示例先写当前 BOM 管理的 Caffeine 3.2.4 和 Data Redis 4.1.0。
2. 旧示例改用 Caffeine 2.8.8 和 Data Redis 2.3.9 的共同 API。
3. 把 `enableTimeToIdle`、`GETEX` 等高版本能力留在现代说明，不回填兼容代码。

**最小示例：**

```java
/** Java 8 兼容线只配置固定 TTL。 */
public java.time.Duration legacyTtl() {
    return java.time.Duration.ofMinutes(5);
}
```

**运行结果：** 两条线都能表达固定 TTL；旧线不调用当前线才有的 TTI API。

**常见误区：** 项目使用 Java 8 不代表 Java 8 是现代推荐基线。

## 现代版本中的正确用法

现代主线先使用 Java 25 和 Boot 4.1.0 管理的 Caffeine 3.2.4、Data Redis 4.1.0。为每个 cache name 写出 key prefix、TTL、null 策略、value serializer 和失效 owner；用 provider 指标和临时 fixture 证明行为。

## 基本语法与核心接口

```java
/** 组合一个只读缓存服务的核心依赖。 */
public final class ProductCacheService {
    private final org.springframework.cache.Cache cache;
    private final ProductRepository repository;

    /** 创建缓存服务。 */
    public ProductCacheService(org.springframework.cache.Cache cache, ProductRepository repository) {
        this.cache = cache;
        this.repository = repository;
    }

    /** 先查缓存，再从真相源加载并回填。 */
    public ProductSnapshot find(String key) {
        ProductSnapshot hit = cache.get(key, ProductSnapshot.class);
        if (hit != null) return hit;
        ProductSnapshot loaded = repository.load(key);
        if (loaded != null) cache.put(key, loaded);
        return loaded;
    }
}
```

`Cache` 接口不保证 provider 一定有 TTL、容量或集群单飞；这些都必须由实际 `CacheManager` 配置和测试证明。

## 从零跟着做

1. 先写一条不带缓存的 repository 查询，并用固定输入得到可重复结果。
2. 计算包含租户、实体和 schema 版本的 key，记录允许陈旧时间。
3. 配置 Caffeine 的容量和 TTL，或者 Redis Cache 的显式 `entryTtl`、prefix、null 与 serializer。
4. 运行一次 hit、一次 miss、一次更新后失效，并记录 loader 次数、TTL 和删除返回值。
5. 删除临时 fixture；重新启动应用，确认缓存丢失后仍能从真相源恢复。

## 如何使用

先问“谁是真相源、谁能看到、多久允许旧、谁负责失效”。答案确定后，再选择 L1、L2 或不缓存。读路径采用 cache-aside，写路径在成功提交后精确失效；需要更强读后写语义时绕过旧副本或按版本校验。把命中率、loader 次数、失效失败、TTL 分布和 key 基数作为同一合同的观测数据。

## 适用与不适用场景

适合可重建、读多写少、允许明确陈旧窗口的查询结果和反射元数据。不适合绕过授权、租户校验或输入校验，也不适合把缓存当作唯一持久化。不能从一次本地命中、一个 Redis `MULTI/EXEC` 或一个 `DEL` 日志推出跨数据库强一致。

:::tip
把“容量淘汰”和“业务失效”分成两条指标：前者说明 provider 为内存压力回收了条目，后者说明领域更新已经发出了精确失效动作；两者都要有失败观测。
:::

## 当前项目补充

冻结 Phase 2 只证明项目有进程内缓存候选、启动装载候选、缓存 key builder、`RedisConfig` 配置证据；它没有证明 Redis server 版本、拓扑、serializer、TTL 或实际命中。`AppAspect` 的高基数限流器风险标为 `rejected`，课程只展示带上限和回收 owner 的纠正模型，不复制旧模式。

## Java 8 / Spring Boot 2.3 兼容写法

旧线使用 Java 8、Boot 2.3.12、Framework 5.2.15、Data Redis 2.3.9 和 Caffeine 2.8.8。Cache 注解、固定 `entryTtl(Duration)`、显式 serializer 和 after-commit 思路仍然成立；不要调用 Java 25 API、Data Redis 4.1 的 `enableTimeToIdle` 或假定 Redis server 拓扑。

```java
/** Java 8 兼容的固定 TTL 配置片段。 */
public final class LegacyCachePolicy {
    /** 返回兼容旧线的固定 TTL。 */
    public java.time.Duration ttl() {
        return java.time.Duration.ofMinutes(5);
    }
}
```

## 新旧版本差异

| 主题 | 现代主线 | Java 8 / Boot 2.3 补充 |
| --- | --- | --- |
| Caffeine | 3.2.4，支持有界容量和 Ticker 测试 | 2.8.8，使用共同容量/TTL API |
| Data Redis | 4.1.0；可选 TTI 近似语义 | 2.3.9；只有固定 `entryTtl` 合同 |
| RedisTemplate | 显式 serializer，配置后跨线程复用 | 相同原则，不能回填新 API |
| TTL | 默认仍需显式设置 | 默认仍需显式设置 |
| Redis 版本 | 文档线 8.10，不等同于 Spring 集成认证 | 项目 server 版本未知 |

## 易错点

### 错误：把 ConcurrentHashMap 当成完整缓存

- **现象：** key 数持续增长，过期和容量都没有观测。
- **触发条件：** 只调用 `computeIfAbsent`，未定义 size、TTL、删除入口和 owner。
- **原因：** CHM 只提供并发映射，不提供缓存策略。
- **后果：** 高基数输入长期占用 JVM 内存。
- **错误示例：** `static final Map<String, Object> CACHE = new ConcurrentHashMap<>();`
- **正确写法：** 使用有界 provider，或显式证明 key 数有上界并提供回收。
- **影响版本：** Java 25 与 Java 8 都成立。
- **验证方式：** `/tmp` 写入 N 个不同 key，记录数量并等待受控回收；来源：`java25-concurrent-hash-map`、`caffeine324-eviction`。

### 错误：key 遗漏租户或 schema 版本

- **现象：** 不同租户或发布版本读到同一个值。
- **触发条件：** 只使用 `productId` 或可变对象字符串。
- **原因：** key 没有表达数据作用域和格式合同。
- **后果：** 串租户、反序列化失败或旧格式污染新代码。
- **错误示例：** `"product:" + productId`。
- **正确写法：** `catalog:product:v1:<tenant>:<id>`，并限制输入长度。
- **影响版本：** Spring Cache 与 Redis 两条版本线都成立。
- **验证方式：** 用两个租户和两个 schema 版本做交叉读断言；来源：`spring7-cache-annotations`、`redis-data-types`。

### 错误：混淆 condition 与 unless

- **现象：** 以为排除了 null，实际每次不存在查询都访问数据库。
- **触发条件：** 用 `unless="#result == null"` 却没有 negative sentinel 策略。
- **原因：** `condition` 在调用前，`unless` 在结果产生后。
- **后果：** 持续 miss，放大穿透流量。
- **错误示例：** 将所有不存在结果都用 `unless` 排除。
- **正确写法：** 对合法不存在值使用短 TTL sentinel，或明确接受重复查询。
- **影响版本：** Framework 7.0.8 与 5.2.15。
- **验证方式：** 断言不存在输入的 loader 次数和 sentinel TTL；来源：`spring7-cache-annotations`、`redis-cache-aside-tutorial`。

### 错误：同类自调用当成缓存命中

- **现象：** 注解存在但 loader 每次都执行。
- **触发条件：** `this.find(key)` 绕过 Spring proxy。
- **原因：** 默认 proxy 模式只拦截代理进入的外部调用。
- **后果：** 误判命中率，失效合同也不会执行。
- **错误示例：** 在同一个 bean 的 `refresh()` 中调用 `this.find()`。
- **正确写法：** 拆分 bean 或通过代理入口调用，并写集成断言。
- **影响版本：** Framework 7.0.8 与 5.2.15。
- **验证方式：** 对外部调用和 self-call 分别计数；来源：`spring7-cache-annotations`、`spring5215-cache-reference`。

### 错误：事务提交前先删除或写入缓存

- **现象：** 数据库回滚后缓存已变化，或无谓 miss 触发旧值回填。
- **触发条件：** 在事务方法中先执行 `cache.evict`，或先写缓存再写数据库。
- **原因：** 缓存动作没有绑定 after-commit。
- **后果：** 副本与真相源暂时背离。
- **错误示例：** `cache.evict(key); repository.update(...);`。
- **正确写法：** 成功提交后精确失效，并为失败建立可重放事件。
- **影响版本：** Spring Framework 7.0.8 与 5.2.15。
- **验证方式：** 分别让事务提交和回滚，断言失效动作只在提交路径发生；来源：`spring7-transaction-aware-cache`。

### 错误：忽略旧值回填时间窗

- **现象：** 写者已删除 key，缓存随后又出现旧版本。
- **触发条件：** 读者先读 v1，写者提交 v2 并删除，读者最后回填 v1。
- **原因：** cache-aside 读写跨越数据库和缓存两个边界。
- **后果：** 短暂陈旧，严重时破坏 read-your-writes 体验。
- **错误示例：** 无版本校验地把 miss 期间读到的值直接 put。
- **正确写法：** 接受陈旧预算、按版本拒绝旧回填，或对该读路径绕过缓存。
- **影响版本：** provider 无锁的 Spring Cache 两条线。
- **验证方式：** 用暂停点复现三步时间线；来源：`spring7-cache-strategies`、`redis-cache-aside-tutorial`。

### 错误：SET 覆盖后假设 TTL 仍在

- **现象：** `TTL` 从正数变为 `-1`，key 永不过期。
- **触发条件：** 先 `EXPIRE`，后用 `SET` 覆盖 value。
- **原因：** 覆盖 key 的命令会清除旧 TTL。
- **后果：** Redis 高基数 key 失去回收边界。
- **错误示例：** 更新 value 后不再检查 TTL。
- **正确写法：** 使用带 EX/PX 的 SET，或每次更新后重新设置并断言 TTL。
- **影响版本：** Redis 共同基础命令合同。
- **验证方式：** 写入、覆盖、再次读取 TTL；来源：`redis-expire`、`redis-ttl`。

### 错误：混用 serializer 或 Redis 数据类型

- **现象：** 乱码、反序列化异常或 `WRONGTYPE`。
- **触发条件：** 同一 key 的 producer/consumer 使用不同 serializer 或命令类型。
- **原因：** 泛型没有改变 Redis 的 bytes 和远端类型。
- **后果：** 读失败，迁移难以回滚。
- **错误示例：** String key 由一个服务写 Hash，另一个服务按 String 读。
- **正确写法：** namespace 同时编码 owner、类型和 schema，显式配置四类 serializer。
- **影响版本：** Data Redis 4.1.0 与 2.3.9。
- **验证方式：** 用独立 key 检查 bytes、Redis TYPE 和反序列化类型；来源：`spring-data-redis41-template`、`redis-data-types`。

### 错误：把 sync=true 或 MULTI/EXEC 当跨数据库锁

- **现象：** 多节点仍重复加载，数据库失败后 Redis 命令没有回滚。
- **触发条件：** 将 provider 单飞或 Redis 事务扩展到 JVM/数据库边界。
- **原因：** 作用域和事务 owner 不同。
- **后果：** 形成未经证明的强一致假设。
- **错误示例：** `@Cacheable(sync = true)` 被描述成集群锁。
- **正确写法：** 标明 provider 范围；数据库与 Redis 采用 after-commit、幂等失效和补偿。
- **影响版本：** Spring Cache 与 Redis 两条版本线。
- **验证方式：** 多 JVM/隔离容器分别观测 loader 和事务失败；来源：`spring7-cache-strategies`、`redis-transactions`。

### 错误：高基数 key 没有可量化回收反馈

- **现象：** 限流器、元数据或不存在查询的 key 数单调增长。
- **触发条件：** 每个调用方 ID 建 key，未设置 TTL、容量或删除 owner。
- **原因：** 输入基数被当成固定集合。
- **后果：** JVM 内存或 Redis 内存长期上升。
- **错误示例：** 只按请求方字符串拼 key，永不删除。
- **正确写法：** 显式上限、TTL、停用清理和 keyspace 指标；`AppAspect` 旧模式只作 rejected 证据。
- **影响版本：** Java 25/8、Redis 共同命令。
- **验证方式：** 前缀 `SCAN` 去重、抽样 TTL、停止访问后复测；来源：`JAVA-RISK-044`、`redis-scan`、`redis-key-eviction`。

## 安全与性能边界

- 不可信输入不能触发默认 JDK 反序列化；JSON 也必须绑定受控类型、字段和大小边界。
- 缓存命中前仍要做租户、授权和输入校验；缓存故障降级不能绕过安全检查。
- 本课不提供固定命中率、吞吐、TTL 抖动或容量数字；性能结论必须在指定 JDK、对象大小、负载和 Redis 配置下用 JFR/JMH 或指标验证。
- `SCAN`、`DBSIZE`、`MEMORY USAGE` 只提供特定范围的观测，不能冒充整个集群或进程 RSS。

## 如何验证

1. 在 `/tmp` 创建现代 Java 25 fixture：用 Caffeine 3.2.4 配置 `maximumSize`、TTL 和注入 Ticker，断言过期与容量；用 Spring proxy fixture 断言外部调用生效、self-call 不生效。
2. 在 `/tmp` 创建 Java 8 fixture：使用 Boot 2.3.12 BOM 的 Caffeine 2.8.8、Data Redis 2.3.9 和 Framework 5.2.15，只运行共同固定 TTL 与 serializer 合同。
3. 现代和旧线各连续运行两次；每次记录 loader 次数、事务提交/回滚失效、TTL `-2/-1`、序列化类型和旧值回填断言。
4. 如启动隔离 Redis 容器，使用唯一前缀，走 `SCAN` 至 cursor 0 并客户端去重，禁止共享环境 `FLUSHDB`。
5. 浏览器桌面 1440x900 与 390x844 检查 16 个知识点、10 个易错点、官方来源唯一展示、项目证据、代码块和无横向溢出；console、网络请求和页面状态必须无错误。
6. 通过后删除 `/tmp` fixture、Redis dump、日志和浏览器截图，并用 `test ! -e` 验证临时目录不存在。

## 练习

### 练习：给一个多租户产品查询画出失效合同

写出真相源、L1、L2、key 格式、TTL、更新事务、after-commit 删除、loader 指标和高基数回收检查。再画出“读者回填旧值”的并发时间线，并为它选择可接受陈旧、read-your-writes 或不缓存三种策略之一。最后说明每一条结论对应的来源和可重复断言。

## 本节小结

缓存的核心不是 API 名称，而是边界合同：谁是真相源、谁能看到副本、容量和 TTL 如何回收、更新何时失效、失败如何重试，以及如何证明高基数输入最终受控。`ConcurrentHashMap` 只提供并发映射；Spring Cache 只提供抽象；Redis 事务只覆盖 Redis 命令。把这些范围写进 key、配置、指标和反馈环，才能在性能收益与一致性风险之间做出可复查的决定。
