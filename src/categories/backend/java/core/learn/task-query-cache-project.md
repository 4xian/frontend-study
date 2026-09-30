---
id: backend.java.learn.intermediate.task-query-cache-project
type: lesson
title: "实战：任务查询缓存"
summary: 用查询条件哈希与项目级缓存代次缓存 TeamFlow 任务分页，并在真实写入后让整组查询结果失效
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 300
prerequisites:
  - backend.java.learn.intermediate.cache-invalidation
  - backend.java.learn.intermediate.api-idempotency
objectives:
  - 能在不修改任务列表 URL、分页 token、响应 DTO 与错误外形的前提下加入 cache-aside 查询缓存。
  - 能把项目、状态、页大小与页 token 规范化后生成稳定查询哈希，避免不同查询共享错误结果。
  - 能让缓存值只保存公开 PageResponse<TaskResponse> 的 JSON 外形，不泄漏数据库 Row 或内部主键。
  - 能用项目级查询缓存代次一次淘汰多个分页与筛选组合，不在请求路径扫描 Redis keyspace。
  - 能在缓存命中时校验任务字段、项目作用域、状态筛选与下一页 token，拒绝损坏或错身份的 JSON。
  - 能让 PUT、DELETE 与首次真实 POST 在数据库提交后推进代次，并让幂等回放不重复推进。
  - 能解释 MySQL 提交、Redis 代次推进与旧代次 TTL 回收不是一个原子事务。
  - 能在 JDK 25 与 Java 8 两条工程线上保持相同的 HTTP、缓存键和值语义。
recap:
  - 任务列表查询由项目、status、pageSize 与 pageToken 共同确定，缺少任一维度的 key 都可能串页或串筛选。
  - 查询 key 同时包含 schema 版本、项目、当前代次和查询哈希；代次 key 每个项目只有一个。
  - 代次缺失表示 0，损坏值是缓存协议错误，不能伪装成普通 miss 后静默回源。
  - 缓存值保持公开分页 JSON 外形；命中时仍要校验六个任务字段、项目、状态和下一页 token。
  - 创建、替换和删除都会改变项目任务列表，数据库成功后推进代次即可让旧代次的所有组合不可达。
  - 幂等 POST 只有首次真实创建经过 PersistentTaskCreationPort，回放直接返回已保存结果，不重复推进代次。
  - 旧代次查询 key 不扫描、不批量删除，有限 TTL 会回收这些已经不可达的副本。
  - MySQL 与 Redis 不构成原子事务；代次推进失败时数据库可能已经提交，调用方必须按真相源核对结果。
related:
  - backend.java.learn.intermediate.cache-reading
  - backend.java.learn.intermediate.cache-invalidation
  - backend.java.learn.intermediate.api-idempotency
  - backend.java.learn.intermediate.project-and-task-persistence-project
tags:
  - Java
  - Spring Boot
  - Redis
  - cache-aside
  - 分页缓存
  - 缓存代次
  - MySQL
  - TeamFlow
appliesTo: JDK 25 与 Spring Boot 4.1.x 主线；Java 8 与 Spring Boot 2.3.12.RELEASE 兼容线；Redis Open Source 8.x
verifiedAt: 2026-08-24
sources:
  - id: redis-cache-aside-task-list
    title: Redis cache-aside with Go
    url: https://redis.io/docs/latest/develop/use-cases/cache-aside/go/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Redis cache-aside pattern
    claims:
      - cache-aside 先读缓存，未命中时回源并以有限 TTL 回填。
      - TTL 是允许陈旧时间的上界，写路径需要显式处理不能容忍的陈旧副本。
  - id: redis-get-task-list
    title: Redis GET Command
    url: https://redis.io/docs/latest/commands/get/
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Redis Open Source 8.x
    claims:
      - GET 在 key 不存在时返回空结果，适合区分缓存 miss 与已保存 JSON。
      - 非字符串类型不是普通未命中，而是命令类型错误。
  - id: redis-set-task-list
    title: Redis SET Command
    url: https://redis.io/docs/latest/commands/set/
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Redis Open Source 8.x
    claims:
      - SET 可以在写入字符串值时同时设置过期时间。
      - 查询副本使用有限 TTL 后，旧代次 key 可以等待过期回收。
  - id: redis-incr-task-list-generation
    title: Redis INCR Command
    url: https://redis.io/docs/latest/commands/incr/
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Redis Open Source 8.x
    claims:
      - INCR 把字符串解释为十进制 64 位整数并原子增加 1。
      - key 不存在时按 0 开始递增，适合首次写入把项目代次推进到 1。
  - id: redis-ttl-task-list-generation
    title: Redis TTL Command
    url: https://redis.io/docs/latest/commands/ttl/
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Redis Open Source 8.x
    claims:
      - TTL 返回正数表示剩余秒数，-1 表示 key 存在但没有过期时间，-2 表示 key 不存在。
      - 查询 value 与永久 generation key 可以通过 TTL 反馈明确区分。
  - id: redis-scan-task-list-feedback
    title: Redis SCAN Command
    url: https://redis.io/docs/latest/commands/scan/
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Redis Open Source 8.x
    claims:
      - SCAN 使用游标增量迭代 keyspace，单次调用不保证返回全部匹配 key。
      - 本课只在隔离反馈和清理中使用完整 --scan 迭代，不把扫描放进正常失效路径。
  - id: spring-data-redis-41-task-list-values
    title: ValueOperations API - Spring Data Redis 4.1
    url: https://docs.spring.io/spring-data/redis/docs/4.1.x/api/org/springframework/data/redis/core/ValueOperations.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Data Redis 4.1.x
    claims:
      - 现代线可以通过 get、set 与 increment 操作 Redis 字符串值。
      - 带 TimeUnit 的 set 重载可保持与兼容线相同的 TTL 调用形状。
  - id: spring-data-redis-23-task-list-values
    title: ValueOperations API - Spring Data Redis 2.3.9.RELEASE
    url: https://docs.spring.io/spring-data/redis/docs/2.3.9.RELEASE/api/org/springframework/data/redis/core/ValueOperations.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Data Redis 2.3.9.RELEASE / Spring Boot 2.3.12.RELEASE
    claims:
      - Java 8 兼容线同样具有 get、set、increment 与 long 加 TimeUnit 的 TTL 重载。
      - 两条版本线不需要改变任务列表缓存的 Redis 命令语义。
  - id: spring-boot-41-task-list-json
    title: 'JSON :: Spring Boot 4.1'
    url: https://docs.spring.io/spring-boot/4.1/reference/features/json.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.x
    claims:
      - Spring Boot 4.1 默认使用 Jackson 3 并自动配置 JsonMapper。
  - id: spring-boot-2312-task-list-json
    title: Spring Boot 2.3.12 JacksonAutoConfiguration API
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/api/org/springframework/boot/autoconfigure/jackson/JacksonAutoConfiguration.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Java 8 兼容线自动配置 Jackson 2 ObjectMapper。
  - id: java-25-task-list-digest
    title: Java SE 25 MessageDigest API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/security/MessageDigest.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25
    claims:
      - MessageDigest.getInstance("SHA-256") 可为规范化查询字节生成固定摘要。
  - id: java-8-task-list-digest
    title: Java SE 8 MessageDigest API
    url: https://docs.oracle.com/javase/8/docs/api/java/security/MessageDigest.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 8
    claims:
      - Java 8 已提供本课所需的 SHA-256 与 Base64 URL 编码 API。
  - id: spring-transaction-task-list-modern
    title: TransactionAspectSupport source - Spring Framework main
    url: https://github.com/spring-projects/spring-framework/blob/main/spring-tx/src/main/java/org/springframework/transaction/interceptor/TransactionAspectSupport.java
    sourceOrigin: official
    sourceType: source-code
    appliesTo: Spring Framework 7.x
    claims:
      - 同步事务目标方法正常返回后，事务拦截器完成提交再把结果交给外层协调服务。
  - id: spring-transaction-task-list-5215
    title: TransactionAspectSupport source - Spring Framework 5.2.15.RELEASE
    url: https://github.com/spring-projects/spring-framework/blob/v5.2.15.RELEASE/spring-tx/src/main/java/org/springframework/transaction/interceptor/TransactionAspectSupport.java
    sourceOrigin: official
    sourceType: source-code
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Java 8 兼容线的同步事务代理同样在目标方法成功后提交，再返回外层调用者。
---

# 实战：任务查询缓存

TeamFlow 的任务列表已经支持项目作用域、状态筛选、不透明分页 token 和 MySQL 分页。一次页面刷新可能连续读取
TODO 第一页、全部任务第一页和下一页；这些查询大多重复，但它们又不是同一个结果。本课把现有
`GET /api/v1/projects/{projectId}/tasks` 接入 Redis cache-aside，同时保留已经冻结的 URL、查询参数、
`PageResponse<TaskResponse>`、状态码、Problem Details 和 OpenAPI operationId。

详情缓存只需删除一个精确任务 key，列表缓存却可能同时存在多个 status、pageSize 和 pageToken 组合。这里使用
项目级“查询缓存代次”：读路径把当前代次放进查询 key；任务创建、替换或删除在 MySQL 成功后把代次原子增加 1。
旧代次的查询 key 立即不再可达，随后由各自 TTL 回收。本课不使用 `KEYS`、生产 `SCAN`、Lua、Redis 事务、锁、
消息队列或跨系统事务，也不把这种基础缓存描述成强一致。

## 一、先冻结任务列表合同

### 1. 缓存不能改变公开查询

任务列表继续使用原来的请求：

```http
GET /api/v1/projects/PRJ-1/tasks?status=TODO&pageSize=20&pageToken=TASK-PAGE-PRJ-1-TODO-21
Accept: application/json
```

四个输入共同决定结果：

| 输入 | 作用 |
| --- | --- |
| `projectId` | 限定嵌套资源所属项目 |
| `status` | `TODO`、`DONE` 或未提供 |
| `pageSize` | 控制当前页最多返回多少项 |
| `pageToken` | 指向同一项目和同一筛选集合的后续位置 |

缓存命中与回源响应都仍是：

```json
{
  "items": [
    {
      "id": "TASK-1",
      "projectId": "PRJ-1",
      "title": "整理课程",
      "status": "TODO",
      "dueAt": "2026-09-01T18:00:00+08:00",
      "assignee": "lin"
    }
  ],
  "nextPageToken": null
}
```

缓存不会增加 wrapper、命中标记或新 header。非法 `status`、`pageSize`、`pageToken` 与未知项目仍沿原 Controller、
类型转换、Bean Validation 和 `ApiService` 返回既有错误。只有参数已经通过 Web 边界后，查询缓存才参与执行。

### 2. 一个详情 key 不能代表一组列表

详情缓存的身份是“项目 + 任务”，写入 TASK-1 时可以精确删除一个 key。列表结果则由多个查询维度组成：

```text
PRJ-1 + ALL  + 20 + first page
PRJ-1 + TODO + 20 + first page
PRJ-1 + TODO + 50 + first page
PRJ-1 + TODO + 20 + TASK-PAGE-PRJ-1-TODO-21
```

这四项可能包含同一任务，却不能共享 JSON。把 TASK-1 改成 DONE 后，ALL、TODO、DONE 以及不同分页边界都可能变化。
如果为每个写请求扫描并删除所有组合，写路径就必须遍历 Redis keyspace，还要处理扫描期间新建的 key。代次把
“找出全部旧 key”改成“让读者只认新代次”。

### 3. 代次推进的时间线

项目第一次读取时，代次 key 尚不存在，读路径把它解释为 0：

```text
GET generation -> null -> generation 0
GET query:g0   -> miss
MySQL          -> PageResponse<TaskResponse>
SET query:g0 PX 90000
```

任务写入成功后只推进项目代次：

```text
MySQL COMMIT
INCR generation -> 1
下一次 GET 只查询 query:g1 -> miss -> 回源 -> 回填 g1
query:g0 不再读取，等待 TTL 回收
```

写入前已经读到 g0 的并发请求仍可能完成一次旧查询；MySQL 与 Redis 也不共享提交协议。本课保证的是：代次成功推进
后开始的新查询不会继续命中旧代次，而不是所有并发请求都瞬间获得线性一致视图。

## 二、把键和值设计成协议

### 1. 每个项目只有一个代次 key

代次 key 固定为：

```text
teamflow:cache:task-list-generation:v1:<projectId>
```

查询 key 固定为：

```text
teamflow:cache:task-list:v1:<projectId>:g<generation>:<query-hash>
```

`v1` 是缓存 schema 版本，不是部署版本或任务数据版本。代次 key 不设置 TTL：每个项目只有一项，写请求必须能在
任意时刻继续单调推进。查询 value 设置有限 TTL，因为旧代次 key 必须最终回收，当前代次的热点结果也需要周期性
重新读取真相源。

“缺失等于 0”只适用于从未变更过的项目。项目已经推进后，不能单独删除或淘汰 generation key：否则读取会重新
落回 g0，甚至命中尚未过期的旧 g0/g1 查询副本。生产运维必须把永久 generation 与有限查询 value 当作同一协议
管理；本课隔离清理要么同时清空两个固定前缀，要么移除整个专用 Redis 容器。

Redis `INCR` 在 key 不存在时把初值视为 0，所以第一次真实写入直接得到 1。并发写入可能把代次从 7 推到 9；跳过
8 不影响正确性，读路径只使用最终读到的当前值。若代次保存为 `abc`、负数或带前导零的非规范文本，说明缓存协议
已经损坏，必须失败并修复数据，不能偷偷把它当成 0。

### 2. 查询哈希覆盖全部结果维度

哈希输入使用固定版本、固定字段顺序与明确的 null 表示：

```text
v1|status=<status-or-null>|pageSize=<number>|pageToken=<encoded-token-or-null>
```

status 使用枚举名；null 使用 `~`。pageToken 先按 UTF-8 做无填充 Base64URL 编码，避免 token 中未来出现分隔符时
破坏字段边界，再对完整规范串计算 SHA-256。项目 ID 已经直接出现在 key 作用域中，不重复进入查询哈希。

```text
status=TODO, pageSize=20, pageToken=null
-> v1|status=TODO|pageSize=20|pageToken=~
-> SHA-256

status=TODO, pageSize=20, pageToken=TASK-PAGE-PRJ-1-TODO-21
-> v1|status=TODO|pageSize=20|pageToken=VEFTSy1QQUdFLV... (Base64URL)
-> 另一枚 SHA-256
```

SHA-256 在这里用于生成固定长度 key，不用于保存秘密或抵抗凭据猜测。HTTP 请求仍由已有参数合同校验；查询哈希
不是第二套授权或输入校验。

### 3. value 只保存公开分页响应

缓存 JSON 只包含 `items` 与 `nextPageToken`，每个 item 只包含 `TaskResponse` 的六个公开字段。它不保存
`TaskRow`、数据库内部主键、Mapper `Page`、SQL 总数或查询 Wrapper。这样 Redis 副本和 HTTP 成功响应使用同一
公开数据形状，替换持久化实现不会要求客户端缓存协议跟着暴露内部结构。

命中不能只证明字符串是合法 JSON，还必须校验：

- `items` 不为 null，数量不超过当前 `pageSize`；
- 每项的 `id`、`projectId`、`title`、`status`、`dueAt` 和 `assignee` 完整；
- 每项 `projectId` 等于当前请求项目；
- 请求指定 status 时，每项状态都与筛选一致；
- `nextPageToken` 为 null，或符合原任务分页 token 的项目、状态和正整数位置合同；
- 空页不能携带下一页 token。

损坏值不能被当作 miss 后静默回源，否则 Redis 合同错误会长期隐藏，错误数据也可能以 200 返回。编码、解码、
Redis 类型错误和连接错误都沿已有全局异常边界失败；数据库仍然是真相源，但故障策略不能靠捕获所有异常来伪造。

## 三、建立现代版查询路径

### 1. 从完整 C5 工程继续

把幂等工程与前面的详情缓存、写后失效能力合并为一个当前快照，再新增任务列表缓存。不要新建第二个
Controller，也不要复制 DTO：

```text
teamflow-task-query-cache-modern/
└── src/main
    ├── java/com/teamflow/api
    │   ├── TeamFlowApplication.java              # 列表 GET 改走缓存服务
    │   ├── ApiService.java                       # MySQL 真相源保持不变
    │   ├── TaskListQueryPort.java                # 新建
    │   ├── PersistentTaskListQueryPort.java      # 新建
    │   ├── TaskListCacheGenerationService.java  # 新建
    │   ├── CachedTaskListQueryService.java       # 新建
    │   ├── CachedTaskQueryService.java           # 保留详情缓存
    │   ├── CachedTaskCommandService.java         # 扩展写后失效
    │   └── PersistentTaskCreationPort.java       # 扩展首次创建失效
    └── resources/application.properties          # 增加列表 TTL
```

现代配置增加一项毫秒 TTL。固定 key 前缀留在代码中，避免环境变量把 schema 身份改成另一份协议：

```properties
teamflow.redis.task-list-ttl-millis=${TEAMFLOW_TASK_LIST_CACHE_TTL_MILLIS:90000}
```

### 2. 用端口隔离真相源

查询缓存只需要“按原合同读取一页任务”，不需要知道 Mapper、Row 或事务。新建 `TaskListQueryPort.java`：

```java
package com.teamflow.api;

import com.teamflow.api.TeamFlowApplication.PageResponse;
import com.teamflow.api.TeamFlowApplication.TaskResponse;
import com.teamflow.api.TeamFlowApplication.TaskStatus;

/** 暴露已有任务列表真相源，不改变公开 DTO。 */
public interface TaskListQueryPort {
    /** @return 按原分页与筛选合同读取的公开任务页 */
    PageResponse<TaskResponse> listTasks(
            String projectId,
            TaskStatus status,
            int pageSize,
            String pageToken);
}
```

生产 adapter 只委托现有 `ApiService`。新建 `PersistentTaskListQueryPort.java`：

```java
package com.teamflow.api;

import com.teamflow.api.TeamFlowApplication.PageResponse;
import com.teamflow.api.TeamFlowApplication.TaskResponse;
import com.teamflow.api.TeamFlowApplication.TaskStatus;
import org.springframework.stereotype.Component;

/** 把任务列表缓存接回现有 MySQL 查询服务。 */
@Component
public final class PersistentTaskListQueryPort implements TaskListQueryPort {
    private final ApiService apiService;

    /** 保存现有 MySQL 真相源。 */
    public PersistentTaskListQueryPort(ApiService apiService) {
        this.apiService = apiService;
    }

    /** @return MySQL 查询产生的原公开分页响应 */
    @Override
    public PageResponse<TaskResponse> listTasks(
            String projectId,
            TaskStatus status,
            int pageSize,
            String pageToken) {
        return apiService.listTasks(projectId, status, pageSize, pageToken);
    }
}
```

这个端口不是第二套业务 Service。项目存在性、token 校验、MyBatis 分页和 `TaskRow` 转换仍只存在于
`ApiService.listTasks(...)`；缓存 miss 才调用 adapter，hit 不触碰 MySQL。

### 3. 集中拥有项目代次

新建 `TaskListCacheGenerationService.java`：

```java
package com.teamflow.api;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/** 读取并推进每个项目的任务列表缓存代次。 */
@Service
public final class TaskListCacheGenerationService {
    private static final String KEY_PREFIX =
            "teamflow:cache:task-list-generation:v1:";

    private final StringRedisTemplate redisTemplate;

    /** 保存 Redis 字符串操作入口。 */
    public TaskListCacheGenerationService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /** @return 当前非负代次；缺失 key 表示 0 */
    public long current(String projectId) {
        String stored = redisTemplate.opsForValue().get(generationKey(projectId));
        if (stored == null) {
            return 0L;
        }
        return parseGeneration(stored);
    }

    /** @return 原子推进后的正代次 */
    public long advance(String projectId) {
        current(projectId);
        Long next = redisTemplate.opsForValue().increment(generationKey(projectId));
        if (next == null || next < 1L) {
            throw new IllegalStateException("任务列表缓存代次推进失败");
        }
        return next;
    }

    /** @return 符合十进制规范文本的非负代次 */
    private long parseGeneration(String stored) {
        try {
            long generation = Long.parseLong(stored);
            if (generation < 0L || !stored.equals(Long.toString(generation))) {
                throw new IllegalArgumentException("代次不是规范非负整数");
            }
            return generation;
        } catch (IllegalArgumentException error) {
            throw new IllegalStateException("任务列表缓存代次不符合 v1 合同", error);
        }
    }

    /** @return 当前项目唯一的代次 key */
    private String generationKey(String projectId) {
        return KEY_PREFIX + projectId;
    }
}
```

这里不先 `GET` 再 `SET generation + 1`。两个写请求同时执行时，那种读改写会丢失一次推进；`increment` 对单个 Redis
字符串执行原子增加。`current` 也不主动创建 0 key，避免只读项目因为一次 GET 就产生永久状态。

### 4. 完整实现列表 cache-aside

新建 `CachedTaskListQueryService.java`。它先读取项目代次，再读取该代次下的查询 key；只有字符串为 null 才回源。
编码与解码都通过一个字段名和公开分页响应相同的缓存值类，避免把数据库对象放入 Redis：

```java
package com.teamflow.api;

import com.teamflow.api.TeamFlowApplication.PageResponse;
import com.teamflow.api.TeamFlowApplication.TaskResponse;
import com.teamflow.api.TeamFlowApplication.TaskStatus;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.json.JsonMapper;

/** 使用项目代次与查询哈希缓存任务分页响应。 */
@Service
public final class CachedTaskListQueryService {
    private static final Logger LOGGER =
            LoggerFactory.getLogger(CachedTaskListQueryService.class);
    private static final String QUERY_KEY_PREFIX =
            "teamflow:cache:task-list:v1:";

    private final TaskListQueryPort queryPort;
    private final TaskListCacheGenerationService generationService;
    private final StringRedisTemplate redisTemplate;
    private final JsonMapper jsonMapper;
    private final long ttlMillis;

    /** 保存真相源、代次 owner、Redis、Jackson 3 与 TTL。 */
    public CachedTaskListQueryService(
            TaskListQueryPort queryPort,
            TaskListCacheGenerationService generationService,
            StringRedisTemplate redisTemplate,
            JsonMapper jsonMapper,
            @Value("${teamflow.redis.task-list-ttl-millis}") long ttlMillis) {
        this.queryPort = queryPort;
        this.generationService = generationService;
        this.redisTemplate = redisTemplate;
        this.jsonMapper = jsonMapper;
        this.ttlMillis = ttlMillis;
    }

    /** @return 缓存命中或 MySQL 回源得到的原公开任务页 */
    public PageResponse<TaskResponse> listTasks(
            String projectId,
            TaskStatus status,
            int pageSize,
            String pageToken) {
        long generation = generationService.current(projectId);
        String key = queryKey(projectId, generation, status, pageSize, pageToken);
        String cachedJson = redisTemplate.opsForValue().get(key);
        if (cachedJson != null) {
            LOGGER.info("task-list-cache result=HIT key={}", key);
            return decode(cachedJson, projectId, status, pageSize);
        }

        PageResponse<TaskResponse> loaded =
                queryPort.listTasks(projectId, status, pageSize, pageToken);
        redisTemplate.opsForValue().set(
                key,
                encode(loaded),
                ttlMillis,
                TimeUnit.MILLISECONDS);
        LOGGER.info("task-list-cache result=MISS key={}", key);
        return loaded;
    }

    /** @return 带项目、代次与完整查询摘要的 v1 key */
    private String queryKey(
            String projectId,
            long generation,
            TaskStatus status,
            int pageSize,
            String pageToken) {
        return QUERY_KEY_PREFIX
                + projectId
                + ":g"
                + generation
                + ":"
                + queryHash(status, pageSize, pageToken);
    }

    /** @return status、pageSize 与 pageToken 的稳定 SHA-256 摘要 */
    private String queryHash(TaskStatus status, int pageSize, String pageToken) {
        String canonical = "v1|status="
                + (status == null ? "~" : status.name())
                + "|pageSize="
                + pageSize
                + "|pageToken="
                + encodeField(pageToken);
        return sha256(canonical);
    }

    /** @return 与公开 PageResponse JSON 同形的字符串 */
    private String encode(PageResponse<TaskResponse> response) {
        try {
            return jsonMapper.writeValueAsString(TaskListCacheValue.from(response));
        } catch (JacksonException error) {
            throw new IllegalStateException("任务列表缓存编码失败", error);
        }
    }

    /** @return 字段完整且属于当前查询的公开任务页 */
    private PageResponse<TaskResponse> decode(
            String json,
            String projectId,
            TaskStatus status,
            int pageSize) {
        try {
            return jsonMapper
                    .readValue(json, TaskListCacheValue.class)
                    .toResponse(projectId, status, pageSize);
        } catch (JacksonException | IllegalArgumentException error) {
            throw new IllegalStateException("任务列表缓存 JSON 不符合 v1 合同", error);
        }
    }

    /** @return null 标记或不含分隔符的 UTF-8 Base64URL */
    private String encodeField(String value) {
        if (value == null) {
            return "~";
        }
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    /** @return 小写十六进制 SHA-256 */
    private String sha256(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder(digest.length * 2);
            for (byte item : digest) {
                result.append(String.format(Locale.ROOT, "%02x", item & 0xff));
            }
            return result.toString();
        } catch (NoSuchAlgorithmException error) {
            throw new IllegalStateException("JDK 必须提供 SHA-256", error);
        }
    }

    /** 确认公开字符串字段存在且不是空白。 */
    private static void requireText(String value, String field) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalArgumentException("任务缓存字段缺失: " + field);
        }
    }

    /** @return 当前查询允许签发的 token 前缀 */
    private static String tokenPrefix(String projectId, TaskStatus status) {
        return "TASK-PAGE-"
                + projectId
                + "-"
                + (status == null ? "ALL" : status.name())
                + "-";
    }

    /** 确认下一页 token 属于当前项目和筛选，并携带规范正整数位置。 */
    private static void validateNextPageToken(
            String token,
            String projectId,
            TaskStatus status) {
        if (token == null) {
            return;
        }
        String prefix = tokenPrefix(projectId, status);
        if (!token.startsWith(prefix)) {
            throw new IllegalArgumentException("下一页 token 不属于当前查询");
        }
        String positionText = token.substring(prefix.length());
        try {
            int position = Integer.parseInt(positionText);
            if (position <= 1 || !positionText.equals(Integer.toString(position))) {
                throw new IllegalArgumentException("下一页 token 位置无效");
            }
        } catch (NumberFormatException error) {
            throw new IllegalArgumentException("下一页 token 位置无效", error);
        }
    }

    /** 表示与公开分页响应同形的 v1 缓存值。 */
    public static final class TaskListCacheValue {
        public List<TaskCacheItem> items;
        public String nextPageToken;

        /** 供 Jackson 3 创建缓存值。 */
        public TaskListCacheValue() {
        }

        /** 保存公开分页字段。 */
        private TaskListCacheValue(
                List<TaskCacheItem> items,
                String nextPageToken) {
            this.items = items;
            this.nextPageToken = nextPageToken;
        }

        /** @return 从公开分页响应复制出的缓存值 */
        private static TaskListCacheValue from(PageResponse<TaskResponse> response) {
            List<TaskCacheItem> copied = new ArrayList<>();
            for (TaskResponse item : response.items()) {
                copied.add(TaskCacheItem.from(item));
            }
            return new TaskListCacheValue(copied, response.nextPageToken());
        }

        /** @return 已校验项目、筛选、页大小与 token 的公开响应 */
        private PageResponse<TaskResponse> toResponse(
                String projectId,
                TaskStatus status,
                int pageSize) {
            if (items == null || items.size() > pageSize) {
                throw new IllegalArgumentException("任务缓存页大小无效");
            }
            if (items.isEmpty() && nextPageToken != null) {
                throw new IllegalArgumentException("空任务页不能携带下一页 token");
            }
            List<TaskResponse> responses = new ArrayList<>();
            for (TaskCacheItem item : items) {
                if (item == null) {
                    throw new IllegalArgumentException("任务缓存包含 null item");
                }
                responses.add(item.toResponse(projectId, status));
            }
            validateNextPageToken(nextPageToken, projectId, status);
            return new PageResponse<>(responses, nextPageToken);
        }
    }

    /** 表示一个公开任务响应的六个 JSON 字段。 */
    public static final class TaskCacheItem {
        public String id;
        public String projectId;
        public String title;
        public String status;
        public String dueAt;
        public String assignee;

        /** 供 Jackson 3 创建缓存 item。 */
        public TaskCacheItem() {
        }

        /** 保存完整公开任务字段。 */
        private TaskCacheItem(
                String id,
                String projectId,
                String title,
                String status,
                String dueAt,
                String assignee) {
            this.id = id;
            this.projectId = projectId;
            this.title = title;
            this.status = status;
            this.dueAt = dueAt;
            this.assignee = assignee;
        }

        /** @return 从现代公开响应复制出的缓存 item */
        private static TaskCacheItem from(TaskResponse response) {
            return new TaskCacheItem(
                    response.id(),
                    response.projectId(),
                    response.title(),
                    response.status().name(),
                    response.dueAt(),
                    response.assignee());
        }

        /** @return 字段完整且属于当前查询的公开任务 */
        private TaskResponse toResponse(
                String expectedProjectId,
                TaskStatus expectedStatus) {
            requireText(id, "id");
            requireText(projectId, "projectId");
            requireText(title, "title");
            requireText(status, "status");
            requireText(dueAt, "dueAt");
            requireText(assignee, "assignee");
            if (!expectedProjectId.equals(projectId)) {
                throw new IllegalArgumentException("任务缓存项目与请求不一致");
            }
            TaskStatus parsedStatus = TaskStatus.valueOf(status);
            if (expectedStatus != null && parsedStatus != expectedStatus) {
                throw new IllegalArgumentException("任务缓存状态与筛选不一致");
            }
            return new TaskResponse(
                    id,
                    projectId,
                    title,
                    parsedStatus,
                    dueAt,
                    assignee);
        }
    }
}
```

`TaskListCacheValue` 只是 JSON 映射边界，不是新的 HTTP DTO。写入 Redis 前由公开 `PageResponse` 复制，命中后又
恢复成同一个公开类型。它存在的原因是要显式验证缓存输入，而不是让泛型反序列化把缺字段、错项目或错筛选的数据
直接交给 Controller。

### 5. 原 Controller 只替换列表调用

最终 `TaskController` 同时保留详情缓存、列表缓存、写后失效与幂等创建。字段和构造器应合并，而不是让每课新增
一个重复 Controller：

```java
private final CachedTaskQueryService cachedTaskQueryService;
private final CachedTaskListQueryService cachedTaskListQueryService;
private final CachedTaskCommandService cachedTaskCommandService;
private final TaskCreationIdempotencyService idempotencyService;
private final CurrentActorProvider currentActorProvider;

/** 保存任务详情、列表、写路径、幂等与当前用户边界。 */
TaskController(
        CachedTaskQueryService cachedTaskQueryService,
        CachedTaskListQueryService cachedTaskListQueryService,
        CachedTaskCommandService cachedTaskCommandService,
        TaskCreationIdempotencyService idempotencyService,
        CurrentActorProvider currentActorProvider) {
    this.cachedTaskQueryService = cachedTaskQueryService;
    this.cachedTaskListQueryService = cachedTaskListQueryService;
    this.cachedTaskCommandService = cachedTaskCommandService;
    this.idempotencyService = idempotencyService;
    this.currentActorProvider = currentActorProvider;
}
```

只替换原列表方法的方法体，保留完整 OpenAPI 与参数校验：

```java
/** 按项目与状态查询一页任务。 */
@Operation(operationId = "listProjectTasks", summary = "查询项目任务分页")
@ApiResponses({
    @ApiResponse(responseCode = "200", description = "查询成功"),
    @ApiResponse(
            responseCode = "400",
            description = "分页或筛选参数无效",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class))),
    @ApiResponse(
            responseCode = "404",
            description = "项目不存在",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
})
@GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
PageResponse<TaskResponse> list(
        @PathVariable("projectId") String projectId,
        @RequestParam(required = false) TaskStatus status,
        @RequestParam(defaultValue = "20")
        @Min(value = 1, message = "pageSize 最小为 1")
        @Max(value = 50, message = "pageSize 最大为 50")
        int pageSize,
        @RequestParam(required = false) String pageToken) {
    return cachedTaskListQueryService.listTasks(
            projectId, status, pageSize, pageToken);
}
```

详情 GET 继续调用 `cachedTaskQueryService.findTask`，POST 继续调用 `idempotencyService.create`，PUT 与 DELETE
继续调用 `cachedTaskCommandService`。`ApiService` 仍由各生产 adapter 和协调 Service 使用，不需要在 Controller
保留一个已经没有直接调用的方法字段。

## 四、让真实写入推进代次

### 1. PUT 与 DELETE 同时维护两类缓存

任务替换和删除既会影响详情，也会影响列表。打开并修改已有的 `CachedTaskCommandService.java`，在数据库方法成功返回后
沿用前课顺序先精确删除详情 key，再推进列表代次：

```java
package com.teamflow.api;

import com.teamflow.api.TeamFlowApplication.ReplaceTaskRequest;
import com.teamflow.api.TeamFlowApplication.Task;
import com.teamflow.api.TeamFlowApplication.TaskResponse;
import org.springframework.stereotype.Service;

/** 在数据库写成功后协调任务列表与详情缓存失效。 */
@Service
public final class CachedTaskCommandService {
    private final ApiService apiService;
    private final TaskListCacheGenerationService generationService;
    private final CachedTaskQueryService cachedTaskQueryService;

    /** 保存数据库写入口与两类缓存 owner。 */
    public CachedTaskCommandService(
            ApiService apiService,
            TaskListCacheGenerationService generationService,
            CachedTaskQueryService cachedTaskQueryService) {
        this.apiService = apiService;
        this.generationService = generationService;
        this.cachedTaskQueryService = cachedTaskQueryService;
    }

    /** @return 数据库提交并完成缓存失效后的新任务响应 */
    public TaskResponse replaceTask(
            String projectId,
            String taskId,
            ReplaceTaskRequest request) {
        Task replaced = apiService.replaceTask(projectId, taskId, request);
        cachedTaskQueryService.invalidateTask(projectId, taskId);
        generationService.advance(projectId);
        return TaskResponse.from(replaced);
    }

    /** 数据库提交后删除任务详情缓存并推进列表代次。 */
    public void deleteTask(String projectId, String taskId) {
        apiService.deleteTask(projectId, taskId);
        cachedTaskQueryService.invalidateTask(projectId, taskId);
        generationService.advance(projectId);
    }
}
```

协调 Service 自己不加 `@Transactional`。`ApiService.replaceTask` 与前课补齐的 `deleteTask` 经过 Spring 代理成功
返回时，MySQL 事务已经提交；数据库抛异常时，后两行不会执行。详情 DEL 继续保持前课已经验证的代码演进，随后
才让整个列表缓存族退出当前命名空间。

### 2. 首次创建推进一次，回放不推进

幂等服务只有首次成功占用 Redis 的请求才调用 `TaskCreationPort.create(...)`。打开并修改已有的生产
`PersistentTaskCreationPort.java`，让真实 MySQL 创建成功后推进列表代次：

```java
package com.teamflow.api;

import com.teamflow.api.TeamFlowApplication.CreateTaskRequest;
import com.teamflow.api.TeamFlowApplication.Task;
import com.teamflow.api.TeamFlowApplication.TaskResponse;
import org.springframework.stereotype.Component;

/** 复用现有 MySQL 创建链路，并让首次创建淘汰任务列表缓存。 */
@Component
public final class PersistentTaskCreationPort implements TaskCreationPort {
    private final ApiService service;
    private final TaskListCacheGenerationService generationService;

    /** 保存现有持久化 Service 与列表缓存代次 owner。 */
    public PersistentTaskCreationPort(
            ApiService service,
            TaskListCacheGenerationService generationService) {
        this.service = service;
        this.generationService = generationService;
    }

    /** 复用现有 400/404 校验，不创建任务也不推进代次。 */
    @Override
    public void validate(String projectId, CreateTaskRequest request) {
        service.validateTaskCreation(projectId, request);
    }

    /** @return 已经写入 MySQL 并推进列表代次的完整任务响应 */
    @Override
    public TaskResponse create(String projectId, CreateTaskRequest request) {
        Task task = service.createTask(projectId, request);
        generationService.advance(projectId);
        return TaskResponse.from(task);
    }
}
```

同键同指纹回放读取 `COMPLETED` 后直接返回 `TaskCreationResult`，不会再次进入这个 adapter，所以 generation
保持不变。创建前的 `validate(...)` 也不推进：它只检查项目和截止时间，没有业务副作用。

### 3. 失败边界不能被“写后”三个字遮住

MySQL 与 Redis 是两个独立系统。以下结果都必须如实解释：

| 位置 | 可观察结果 |
| --- | --- |
| MySQL 写失败 | 不推进代次，不删详情缓存，原错误返回 |
| MySQL 已提交，详情 DEL 失败 | 业务数据可能已经变化，请求沿既有错误边界失败，旧详情与旧列表都可能可达 |
| 详情 DEL 成功，代次推进失败 | 详情下一次会回源，但旧列表仍可能可达 |
| 代次推进成功，响应丢失 | 调用方重试 POST 时由幂等状态判断是否回放；PUT/DELETE 仍按其原方法语义处理 |

本课不通过捕获 Redis 异常后返回成功来隐藏窗口，也不声称 Redis `INCR` 会参加 MySQL 事务。生产系统可以在高级
一致性课程中评估重试、补偿、事务事件、outbox 或监控告警；基础实战先保持故障可见与职责清楚。

代次频繁推进会降低命中率并暂时增加旧 key 数量，因此它适合项目级查询组合，而不是无边界地套在每个写热点上。

## 五、建立 Java 8 兼容线

### 1. 只在真实版本差异处分叉

复制当前 Java 8 C5 快照为 `teamflow-task-query-cache-java8`。`TaskListQueryPort`、
`PersistentTaskListQueryPort`、`TaskListCacheGenerationService`、`CachedTaskCommandService` 和
`PersistentTaskCreationPort` 没有使用 record、模式匹配或现代集合工厂，可以原样使用。配置同样增加：

```properties
teamflow.redis.task-list-ttl-millis=${TEAMFLOW_TASK_LIST_CACHE_TTL_MILLIS:90000}
```

兼容线真实差异只有两处：Spring Boot 2.3.12 自动配置 Jackson 2 `ObjectMapper`；`TaskResponse` 使用上一课已经补齐
无参构造器的公开字段，而不是 record accessor。缓存 key、代次、哈希输入、JSON 字段与 TTL 都不得分叉。

### 2. ObjectMapper 服务保持同一控制流

Java 8 的 `CachedTaskListQueryService.java` 使用下面完整实现：

```java
package com.teamflow.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamflow.api.TeamFlowApplication.PageResponse;
import com.teamflow.api.TeamFlowApplication.TaskResponse;
import com.teamflow.api.TeamFlowApplication.TaskStatus;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/** 使用项目代次与查询哈希缓存 Java 8 任务分页响应。 */
@Service
public final class CachedTaskListQueryService {
    private static final Logger LOGGER =
            LoggerFactory.getLogger(CachedTaskListQueryService.class);
    private static final String QUERY_KEY_PREFIX =
            "teamflow:cache:task-list:v1:";

    private final TaskListQueryPort queryPort;
    private final TaskListCacheGenerationService generationService;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final long ttlMillis;

    /** 保存真相源、代次 owner、Redis、Jackson 2 与 TTL。 */
    public CachedTaskListQueryService(
            TaskListQueryPort queryPort,
            TaskListCacheGenerationService generationService,
            StringRedisTemplate redisTemplate,
            ObjectMapper objectMapper,
            @Value("${teamflow.redis.task-list-ttl-millis}") long ttlMillis) {
        this.queryPort = queryPort;
        this.generationService = generationService;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.ttlMillis = ttlMillis;
    }

    /** @return 缓存命中或 MySQL 回源得到的原公开任务页 */
    public PageResponse<TaskResponse> listTasks(
            String projectId,
            TaskStatus status,
            int pageSize,
            String pageToken) {
        long generation = generationService.current(projectId);
        String key = queryKey(projectId, generation, status, pageSize, pageToken);
        String cachedJson = redisTemplate.opsForValue().get(key);
        if (cachedJson != null) {
            LOGGER.info("task-list-cache result=HIT key={}", key);
            return decode(cachedJson, projectId, status, pageSize);
        }

        PageResponse<TaskResponse> loaded =
                queryPort.listTasks(projectId, status, pageSize, pageToken);
        redisTemplate.opsForValue().set(
                key,
                encode(loaded),
                ttlMillis,
                TimeUnit.MILLISECONDS);
        LOGGER.info("task-list-cache result=MISS key={}", key);
        return loaded;
    }

    /** @return 带项目、代次与完整查询摘要的 v1 key */
    private String queryKey(
            String projectId,
            long generation,
            TaskStatus status,
            int pageSize,
            String pageToken) {
        return QUERY_KEY_PREFIX
                + projectId
                + ":g"
                + generation
                + ":"
                + queryHash(status, pageSize, pageToken);
    }

    /** @return status、pageSize 与 pageToken 的稳定 SHA-256 摘要 */
    private String queryHash(TaskStatus status, int pageSize, String pageToken) {
        String canonical = "v1|status="
                + (status == null ? "~" : status.name())
                + "|pageSize="
                + pageSize
                + "|pageToken="
                + encodeField(pageToken);
        return sha256(canonical);
    }

    /** @return 与公开 PageResponse JSON 同形的字符串 */
    private String encode(PageResponse<TaskResponse> response) {
        try {
            return objectMapper.writeValueAsString(TaskListCacheValue.from(response));
        } catch (JsonProcessingException error) {
            throw new IllegalStateException("任务列表缓存编码失败", error);
        }
    }

    /** @return 字段完整且属于当前查询的公开任务页 */
    private PageResponse<TaskResponse> decode(
            String json,
            String projectId,
            TaskStatus status,
            int pageSize) {
        try {
            return objectMapper
                    .readValue(json, TaskListCacheValue.class)
                    .toResponse(projectId, status, pageSize);
        } catch (IOException | IllegalArgumentException error) {
            throw new IllegalStateException("任务列表缓存 JSON 不符合 v1 合同", error);
        }
    }

    /** @return null 标记或不含分隔符的 UTF-8 Base64URL */
    private String encodeField(String value) {
        if (value == null) {
            return "~";
        }
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    /** @return 小写十六进制 SHA-256 */
    private String sha256(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder(digest.length * 2);
            for (byte item : digest) {
                result.append(String.format(Locale.ROOT, "%02x", item & 0xff));
            }
            return result.toString();
        } catch (NoSuchAlgorithmException error) {
            throw new IllegalStateException("JDK 必须提供 SHA-256", error);
        }
    }

    /** 确认公开字符串字段存在且不是空白。 */
    private static void requireText(String value, String field) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalArgumentException("任务缓存字段缺失: " + field);
        }
    }

    /** @return 当前查询允许签发的 token 前缀 */
    private static String tokenPrefix(String projectId, TaskStatus status) {
        return "TASK-PAGE-"
                + projectId
                + "-"
                + (status == null ? "ALL" : status.name())
                + "-";
    }

    /** 确认下一页 token 属于当前项目和筛选，并携带规范正整数位置。 */
    private static void validateNextPageToken(
            String token,
            String projectId,
            TaskStatus status) {
        if (token == null) {
            return;
        }
        String prefix = tokenPrefix(projectId, status);
        if (!token.startsWith(prefix)) {
            throw new IllegalArgumentException("下一页 token 不属于当前查询");
        }
        String positionText = token.substring(prefix.length());
        try {
            int position = Integer.parseInt(positionText);
            if (position <= 1 || !positionText.equals(Integer.toString(position))) {
                throw new IllegalArgumentException("下一页 token 位置无效");
            }
        } catch (NumberFormatException error) {
            throw new IllegalArgumentException("下一页 token 位置无效", error);
        }
    }

    /** 表示与公开分页响应同形的 Java 8 v1 缓存值。 */
    public static final class TaskListCacheValue {
        public List<TaskCacheItem> items;
        public String nextPageToken;

        /** 供 Jackson 2 创建缓存值。 */
        public TaskListCacheValue() {
        }

        /** 保存公开分页字段。 */
        private TaskListCacheValue(
                List<TaskCacheItem> items,
                String nextPageToken) {
            this.items = items;
            this.nextPageToken = nextPageToken;
        }

        /** @return 从公开分页响应复制出的缓存值 */
        private static TaskListCacheValue from(PageResponse<TaskResponse> response) {
            List<TaskCacheItem> copied = new ArrayList<TaskCacheItem>();
            for (TaskResponse item : response.items) {
                copied.add(TaskCacheItem.from(item));
            }
            return new TaskListCacheValue(copied, response.nextPageToken);
        }

        /** @return 已校验项目、筛选、页大小与 token 的公开响应 */
        private PageResponse<TaskResponse> toResponse(
                String projectId,
                TaskStatus status,
                int pageSize) {
            if (items == null || items.size() > pageSize) {
                throw new IllegalArgumentException("任务缓存页大小无效");
            }
            if (items.isEmpty() && nextPageToken != null) {
                throw new IllegalArgumentException("空任务页不能携带下一页 token");
            }
            List<TaskResponse> responses = new ArrayList<TaskResponse>();
            for (TaskCacheItem item : items) {
                if (item == null) {
                    throw new IllegalArgumentException("任务缓存包含 null item");
                }
                responses.add(item.toResponse(projectId, status));
            }
            validateNextPageToken(nextPageToken, projectId, status);
            return new PageResponse<TaskResponse>(responses, nextPageToken);
        }
    }

    /** 表示 Java 8 公开任务响应的六个 JSON 字段。 */
    public static final class TaskCacheItem {
        public String id;
        public String projectId;
        public String title;
        public String status;
        public String dueAt;
        public String assignee;

        /** 供 Jackson 2 创建缓存 item。 */
        public TaskCacheItem() {
        }

        /** 保存完整公开任务字段。 */
        private TaskCacheItem(
                String id,
                String projectId,
                String title,
                String status,
                String dueAt,
                String assignee) {
            this.id = id;
            this.projectId = projectId;
            this.title = title;
            this.status = status;
            this.dueAt = dueAt;
            this.assignee = assignee;
        }

        /** @return 从 Java 8 公开响应复制出的缓存 item */
        private static TaskCacheItem from(TaskResponse response) {
            return new TaskCacheItem(
                    response.id,
                    response.projectId,
                    response.title,
                    response.status.name(),
                    response.dueAt,
                    response.assignee);
        }

        /** @return 字段完整且属于当前查询的公开任务 */
        private TaskResponse toResponse(
                String expectedProjectId,
                TaskStatus expectedStatus) {
            requireText(id, "id");
            requireText(projectId, "projectId");
            requireText(title, "title");
            requireText(status, "status");
            requireText(dueAt, "dueAt");
            requireText(assignee, "assignee");
            if (!expectedProjectId.equals(projectId)) {
                throw new IllegalArgumentException("任务缓存项目与请求不一致");
            }
            TaskStatus parsedStatus = TaskStatus.valueOf(status);
            if (expectedStatus != null && parsedStatus != expectedStatus) {
                throw new IllegalArgumentException("任务缓存状态与筛选不一致");
            }
            return new TaskResponse(
                    id,
                    projectId,
                    title,
                    parsedStatus,
                    dueAt,
                    assignee);
        }
    }
}
```

这份兼容实现没有把现代 record 改写成另一份公开 JSON。`TaskListCacheValue` 仍只负责 Redis 输入校验，最终返回
前置项目课的 `PageResponse<TaskResponse>`。Java 8 `TaskController` 保留原 `@Validated`、`javax.validation`
与 `ApiProblem` OpenAPI schema，只把列表调用改为同一个 `cachedTaskListQueryService.listTasks(...)`。

## 六、用真实 HTTP 与 Redis 验证

### 1. 启动隔离基础设施

创建本课专用网络、Redis 与 MySQL。容器名和宿主端口只属于本课：

```bash
docker network create teamflow-task-query-cache-net
docker run -d --name teamflow-task-query-cache-redis \
  --network teamflow-task-query-cache-net \
  -p 16385:6379 \
  redis:8-alpine redis-server --requirepass course-pass
docker run -d --name teamflow-task-query-cache-mysql \
  --network teamflow-task-query-cache-net \
  -p 33320:3306 \
  -e MYSQL_ROOT_PASSWORD=teamflow-root \
  -e MYSQL_DATABASE=teamflow_modern \
  -e MYSQL_USER=teamflow \
  -e MYSQL_PASSWORD=teamflow-pass \
  mysql:8.4
```

等待 MySQL health probe 成功，再创建兼容线独立 schema：

```bash
until docker exec teamflow-task-query-cache-mysql \
  mysqladmin ping -uroot -pteamflow-root --silent; do sleep 2; done
docker exec teamflow-task-query-cache-mysql mysql -uroot -pteamflow-root \
  -e "CREATE DATABASE teamflow_java8 CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
      GRANT ALL PRIVILEGES ON teamflow_java8.* TO 'teamflow'@'%';"
```

现代工程从 fresh Maven 缓存编译，再使用 18095 端口启动：

```bash
TEAMFLOW_DB_URL='jdbc:mysql://127.0.0.1:33320/teamflow_modern?useSSL=false&allowPublicKeyRetrieval=true' \
TEAMFLOW_DB_USER=teamflow \
TEAMFLOW_DB_PASSWORD=teamflow-pass \
TEAMFLOW_PORT=18095 \
TEAMFLOW_REDIS_HOST=127.0.0.1 \
TEAMFLOW_REDIS_PORT=16385 \
TEAMFLOW_REDIS_PASSWORD=course-pass \
TEAMFLOW_TASK_LIST_CACHE_TTL_MILLIS=90000 \
mvn spring-boot:run
```

Java 8 线在现代应用停止并清理本课两个 Redis 前缀后，使用 `teamflow_java8` 与 18096 端口按同一命令启动。两条线
顺序运行，避免相同 PRJ-1 在共享 Redis 中互相读取；不能靠额外版本前缀改变已经冻结的业务 key 合同。

### 2. 同一查询先 miss 再 hit

只删除本课 PRJ-1 的代次与查询 key，再请求两次同一页：

```bash
docker exec teamflow-task-query-cache-redis redis-cli -a course-pass --scan \
  --pattern 'teamflow:cache:task-list:v1:PRJ-1:*' | \
  while IFS= read -r key; do
    docker exec teamflow-task-query-cache-redis redis-cli -a course-pass DEL "$key"
  done
docker exec teamflow-task-query-cache-redis redis-cli -a course-pass \
  DEL teamflow:cache:task-list-generation:v1:PRJ-1
curl -fsS \
  'http://127.0.0.1:18095/api/v1/projects/PRJ-1/tasks?status=TODO&pageSize=20' | jq
curl -fsS \
  'http://127.0.0.1:18095/api/v1/projects/PRJ-1/tasks?status=TODO&pageSize=20' | jq
```

两次响应逐字段一致，日志依次出现 MISS、HIT。验证命令中的 `--scan` 只用于隔离课程环境清理；应用请求路径没有扫描。
检查当前只有一个 g0 查询 key，且 TTL 为正：

```bash
key=$(docker exec teamflow-task-query-cache-redis redis-cli -a course-pass --raw --scan \
  --pattern 'teamflow:cache:task-list:v1:PRJ-1:g0:*')
test -n "$key"
docker exec teamflow-task-query-cache-redis redis-cli -a course-pass --raw GET "$key" | jq
ttl=$(docker exec teamflow-task-query-cache-redis redis-cli -a course-pass TTL "$key")
test "$ttl" -gt 0
test "$ttl" -le 90
```

暂停 MySQL 后再次请求同一查询仍返回 200，证明 hit 没有回源；随后立即恢复 MySQL：

```bash
docker pause teamflow-task-query-cache-mysql
curl -fsS \
  'http://127.0.0.1:18095/api/v1/projects/PRJ-1/tasks?status=TODO&pageSize=20' | jq
docker unpause teamflow-task-query-cache-mysql
```

### 3. 筛选、页大小与页 token 不串结果

fresh V2 数据只有一条 TODO。先用两个不同幂等键真实创建两条 TODO，确保 `pageSize=2` 一定具有下一页；每次创建
各推进一次 generation，因此准备完成后代次必须是 2：

```bash
curl -fsS \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: task-query-cache-seed-2' \
  -d '{"title":"补齐筛选缓存","dueAt":"2026-09-01T18:00:00+08:00","assignee":"lin"}' \
  'http://127.0.0.1:18095/api/v1/projects/PRJ-1/tasks' | jq
curl -fsS \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: task-query-cache-seed-3' \
  -d '{"title":"补齐分页缓存","dueAt":"2026-09-02T18:00:00+08:00","assignee":"lin"}' \
  'http://127.0.0.1:18095/api/v1/projects/PRJ-1/tasks' | jq
generation_key='teamflow:cache:task-list-generation:v1:PRJ-1'
prepared=$(docker exec teamflow-task-query-cache-redis redis-cli -a course-pass --raw \
  GET "$generation_key")
test "$prepared" = '2'
```

再分别连续请求两次 ALL、TODO、DONE 与不同页大小。每个唯一查询第一次是 MISS，第二次才是 HIT：

```bash
for feedback_round in first second; do
  curl -fsS 'http://127.0.0.1:18095/api/v1/projects/PRJ-1/tasks?pageSize=20' | jq
  curl -fsS \
    'http://127.0.0.1:18095/api/v1/projects/PRJ-1/tasks?status=TODO&pageSize=2' | jq
  curl -fsS \
    'http://127.0.0.1:18095/api/v1/projects/PRJ-1/tasks?status=DONE&pageSize=20' | jq
done
```

TODO 第一页现在必须返回 `nextPageToken`。用响应值请求下一页，不手写或解释内部位置：

```bash
first=$(curl -fsS \
  'http://127.0.0.1:18095/api/v1/projects/PRJ-1/tasks?status=TODO&pageSize=2')
token=$(printf '%s' "$first" | jq -r '.nextPageToken // empty')
test -n "$token"
curl -fsS --get \
  --data-urlencode 'status=TODO' \
  --data-urlencode 'pageSize=2' \
  --data-urlencode "pageToken=$token" \
  'http://127.0.0.1:18095/api/v1/projects/PRJ-1/tasks' | jq
```

Redis 中这些 key 具有同一个 `PRJ-1:g2` 前缀，但查询哈希不同。ALL 响应可以含 TODO 与 DONE，筛选响应只能包含
对应状态；第二页不能重复返回第一页 item。非法 token 继续得到原 400 `INVALID_PAGE_TOKEN`，且不会创建缓存 key。

### 4. 首次 POST 推进，幂等回放不推进

先读取 generation；两次准备写入已经把它推进到 2：

```bash
before=$(docker exec teamflow-task-query-cache-redis redis-cli -a course-pass --raw \
  GET "$generation_key")
test "$before" = '2'
```

使用同一个幂等键和请求体调用两次创建：

```bash
body='{"title":"补齐缓存验收","dueAt":"2026-09-03T18:00:00+08:00","assignee":"lin"}'
curl -fsS -D /tmp/task-query-cache-first.headers \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: task-query-cache-create-1' \
  -d "$body" \
  'http://127.0.0.1:18095/api/v1/projects/PRJ-1/tasks' | \
  tee /tmp/task-query-cache-first.json | jq
after_first=$(docker exec teamflow-task-query-cache-redis redis-cli -a course-pass --raw \
  GET "$generation_key")
curl -fsS -D /tmp/task-query-cache-replay.headers \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: task-query-cache-create-1' \
  -d "$body" \
  'http://127.0.0.1:18095/api/v1/projects/PRJ-1/tasks' | \
  tee /tmp/task-query-cache-replay.json | jq
after_replay=$(docker exec teamflow-task-query-cache-redis redis-cli -a course-pass --raw \
  GET "$generation_key")
test "$after_first" = '3'
test "$after_replay" = "$after_first"
cmp /tmp/task-query-cache-first.json /tmp/task-query-cache-replay.json
rg -i '^Idempotency-Replayed: true' /tmp/task-query-cache-replay.headers
```

首次创建进入 `PersistentTaskCreationPort` 并把代次从 2 推进到 3；回放直接读取 COMPLETED 结果，任务 body 相同且代次
仍为 3。重新请求原列表会使用 g3 key 并包含新任务；g2 key 仍可观察但不再被当前请求读取。

### 5. PUT、DELETE、TTL 与损坏状态

从创建响应取得任务 ID，用原 PUT 完整替换后确认代次加 1：

```bash
task_id=$(jq -r '.id' /tmp/task-query-cache-first.json)
curl -fsS -X PUT \
  -H 'Content-Type: application/json' \
  -d '{"title":"缓存验收已完成","status":"DONE","dueAt":"2026-09-03T18:00:00+08:00","assignee":"lin"}' \
  "http://127.0.0.1:18095/api/v1/projects/PRJ-1/tasks/$task_id" | jq
after_put=$(docker exec teamflow-task-query-cache-redis redis-cli -a course-pass --raw \
  GET "$generation_key")
test "$after_put" = '4'
```

TODO 查询不再包含该任务，DONE 查询包含新标题。DELETE 后代次为 5，下一次 ALL 查询不再返回它：

```bash
curl -fsS -X DELETE \
  "http://127.0.0.1:18095/api/v1/projects/PRJ-1/tasks/$task_id" \
  -o /tmp/task-query-cache-delete.body -w '%{http_code}\n'
test ! -s /tmp/task-query-cache-delete.body
after_delete=$(docker exec teamflow-task-query-cache-redis redis-cli -a course-pass --raw \
  GET "$generation_key")
test "$after_delete" = '5'
```

把 TTL 临时配置为 1000 毫秒重启应用，第一次查询回填后等待 1.5 秒，再请求同一查询应重新出现 MISS。TTL 验证只改
运行配置，不改 key schema 或代码。

最后把 generation 改成损坏文本并请求列表：

```bash
docker exec teamflow-task-query-cache-redis redis-cli -a course-pass \
  SET "$generation_key" broken
curl -sS -o /tmp/task-query-cache-broken.json -w '%{http_code}\n' \
  'http://127.0.0.1:18095/api/v1/projects/PRJ-1/tasks?pageSize=20'
jq -e '.code == "INTERNAL_ERROR"' /tmp/task-query-cache-broken.json
docker exec teamflow-task-query-cache-redis redis-cli -a course-pass \
  SET "$generation_key" 5
```

损坏代次返回既有统一错误外形，不产生新的查询 key，也不静默回源。暂停 Redis 后同一 GET 同样失败而不会改用本机
Map；恢复 Redis 后请求恢复。Java 8 线清理两个固定前缀后逐项复跑，响应关系、generation 序列和 Redis JSON 必须
一致，不能只用编译成功代替兼容行为。

## 七、集中排查五个任务查询缓存错误

### 五个典型错误

:::pitfalls

### 查询 key 漏掉页大小或页 token

**触发条件：** key 只包含项目和 status，第一页 `pageSize=20`、`pageSize=2` 与下一页使用同一个 Redis 字符串。

**原因：** 缓存身份没有覆盖决定结果的全部输入；命中后不会再经过 MySQL 分页来纠正。

**后果：** 小页可能返回二十项，下一页可能重复第一页，响应中的 nextPageToken 也描述错误集合。

**影响版本：** JDK 25 与 Java 8 兼容线都受影响；使用相同分页参数组合即可重复验证。

**错误示例：**

```java
String canonical = "v1|status=" + status;
```

**正确写法：**

```java
String canonical = "v1|status="
        + (status == null ? "~" : status.name())
        + "|pageSize="
        + pageSize
        + "|pageToken="
        + encodeField(pageToken);
```

**验证方式：** 依次请求 TODO 的 `pageSize=20`、`pageSize=2`、第一页和真实下一页；确认唯一查询第一次各自产生
MISS，第二次才 HIT，并且 item 数量与 token 不串用。

### 在正常写路径扫描并删除列表 key

**触发条件：** PUT、POST 或 DELETE 每次都 `SCAN teamflow:cache:task-list:v1:PRJ-1:*`，再逐个 DEL。

**原因：** 实现试图枚举开放组合，写路径因此承担完整 keyspace 遍历、游标与并发变化。

**后果：** 写延迟随 key 数量增长；扫描期间新建的组合还可能逃过本轮删除。

**影响版本：** Redis Open Source 8.x 与两条 Spring Boot 版本线都受影响；对同一项目预热多个组合后执行一次写入即可重复验证。

**错误示例：**

```java
redisConnection.scan(scanOptions);
```

**正确写法：**

```java
generationService.advance(projectId);
```

**验证方式：** 缓存同项目的 ALL、TODO、DONE 与两页结果，执行一次真实写入；确认只有固定 generation key 增加，
新请求进入 g1，旧 g0 key 保留到 TTL，而应用日志与源码中没有请求路径 SCAN。

### 把损坏或被删除的 generation 当作初始 0

**触发条件：** 捕获 `NumberFormatException`、Redis 类型错误或连接错误后统一返回 0，或者给 generation 设置 TTL。

**原因：** 缺失初始态与协议损坏被混成同一分支；generation 过期后还可能重新命中旧 g0/g1 查询 key。

**后果：** 数据写入成功后仍可能复活旧列表，故障也被伪装成普通 cache miss。

**影响版本：** Redis Open Source 8.x 与两条 Spring Boot 版本线都受影响；注入损坏、负数或溢出代次即可重复验证。

**错误示例：**

```java
try {
    return Long.parseLong(stored);
} catch (RuntimeException error) {
    return 0L;
}
```

**正确写法：**

```java
if (stored == null) {
    return 0L;
}
long generation = Long.parseLong(stored);
if (generation < 0L || !stored.equals(Long.toString(generation))) {
    throw new IllegalStateException("generation 不符合 v1 合同");
}
return generation;
```

**验证方式：** 分别注入 `broken`、`-1` 与 `9223372036854775807`，确认读取或下一次 INCR 显式失败；恢复专用环境后
确认 generation 的 TTL 为 -1，查询 value 的 TTL 为正数。

### 在数据库提交前推进代次

**触发条件：** 给协调 Service 加外层 `@Transactional`，或在调用 `ApiService.replaceTask(...)` 之前 INCR。

**原因：** Redis 操作发生时 MySQL 事务尚未确定成功，两个系统又没有共同提交协议。

**后果：** 数据库回滚却已经进入新代，产生无意义 miss；更危险的是开发者会误以为两者原子提交。

**影响版本：** Spring Framework 5.2.15 / Spring Boot 2.3.12 与 Spring Framework 7.x / Spring Boot 4.1.x 都受影响；让数据库写入失败即可重复验证。

**错误示例：**

```java
generationService.advance(projectId);
Task replaced = apiService.replaceTask(projectId, taskId, request);
```

**正确写法：**

```java
Task replaced = apiService.replaceTask(projectId, taskId, request);
cachedTaskQueryService.invalidateTask(projectId, taskId);
generationService.advance(projectId);
```

**验证方式：** 让 MySQL 更新稳定失败，确认 generation 和详情 key 都不变；移除故障后重跑同一 PUT，确认数据库提交、
详情 DEL、generation 增加按顺序发生。

### 在 Controller 为幂等回放再次推进代次

**触发条件：** POST Controller 看到每个 201 都调用 `advance(projectId)`，没有区分首次执行与 COMPLETED 回放。

**原因：** Controller 重复实现幂等状态机，而不是把推进放在只有首次请求才进入的创建端口。

**后果：** 网络重试不断制造新代和缓存 miss，即使 MySQL 中没有新增任务。

**影响版本：** JDK 25 与 Java 8 兼容线的幂等 POST 都受影响；重复发送同一 Idempotency-Key 即可重复验证。

**错误示例：**

```java
TaskCreationResult result = idempotencyService.create(actorId, projectId, key, request);
generationService.advance(projectId);
return result;
```

**正确写法：**

```java
Task task = service.createTask(projectId, request);
generationService.advance(projectId);
return TaskResponse.from(task);
```

**验证方式：** 同一 Idempotency-Key 与 body 请求两次；首次 generation 恰好加 1，回放任务 ID 和 body 相同，
`Idempotency-Replayed: true` 且 generation 不再变化。

:::

## 八、独立练习

:::exercise

### 为查询组合补齐代次时间线

**要求：** 实现一个只依赖 Java 集合的最小模型。`read(query)` 必须使用当前 generation 组成 key；`write()` 只把
generation 加 1；旧代次 value 保留但不再命中。依次缓存 TODO 第一页与下一页、重复读取第一页、执行一次写入、
再读第一页。禁止在 `write()` 中遍历或删除 Map。

**验收：**

```text
MISS g0 TODO:first
MISS g0 TODO:TASK-PAGE-PRJ-1-TODO-3
HIT g0 TODO:first
WRITE generation=1
MISS g1 TODO:first
stored=3 currentGeneration=1
```

:::

### 1. 完整参考实现

```java
import java.util.LinkedHashMap;
import java.util.Map;

/** 用内存模型观察列表查询代次，不模拟 Redis 事务。 */
public class TaskListGenerationExercise {
    /** 运行题目要求的固定时间线。 */
    public static void main(String[] args) {
        GenerationCache cache = new GenerationCache();
        cache.read("TODO:first");
        cache.read("TODO:TASK-PAGE-PRJ-1-TODO-3");
        cache.read("TODO:first");
        cache.write();
        cache.read("TODO:first");
        System.out.println(
                "stored=" + cache.storedCount()
                        + " currentGeneration=" + cache.currentGeneration());
    }

    /** 保存查询副本与当前代次。 */
    static final class GenerationCache {
        private final Map<String, String> values = new LinkedHashMap<String, String>();
        private long generation;

        /** 读取当前代次的查询，miss 时写入一份可观察值。 */
        void read(String query) {
            String key = "g" + generation + ":" + query;
            if (values.containsKey(key)) {
                System.out.println("HIT g" + generation + " " + query);
                return;
            }
            values.put(key, "page@" + generation);
            System.out.println("MISS g" + generation + " " + query);
        }

        /** 只推进代次，不扫描或删除旧值。 */
        void write() {
            generation++;
            System.out.println("WRITE generation=" + generation);
        }

        /** @return 所有代次尚未过期的 value 数量 */
        int storedCount() {
            return values.size();
        }

        /** @return 当前读路径使用的代次 */
        long currentGeneration() {
            return generation;
        }
    }
}
```

### 2. 运行与解释

```bash
javac TaskListGenerationExercise.java
java TaskListGenerationExercise
```

输出必须与验收文本逐行一致。`stored=3` 说明写入没有扫描旧 key：g0 下两份查询仍在 Map 中，g1 第一页又新增
一份；当前读路径只认 generation 1。真实 Redis 用 TTL 回收旧 value，而不是让这个练习模型增加定时器。

## 九、完整程序与运行结果

### 1. 用真实 Redis 串起查询、推进与过期

第六章用真实 HTTP、MySQL 与 Redis 验收完整应用。本节再提供一个可重复运行的非 Web 反馈程序：真相源换成固定内存页，
Redis、JSON、查询哈希、generation 与 TTL 仍调用正文生产服务。这样可以准确观察一次查询是否回源，而不需要解析日志或
猜测 MySQL 查询次数。

在现代工程和 Java 8 工程中都新增 `src/main/java/com/teamflow/api/TaskQueryCacheFeedbackApplication.java`：

```java
package com.teamflow.api;

import com.teamflow.api.TeamFlowApplication.PageResponse;
import com.teamflow.api.TeamFlowApplication.TaskResponse;
import com.teamflow.api.TeamFlowApplication.TaskStatus;
import java.util.Arrays;
import java.util.Collections;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.StringRedisTemplate;

/** 用真实 Redis 反馈任务列表查询缓存的核心时间线。 */
@SpringBootConfiguration
@EnableAutoConfiguration(excludeName = {
        "org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration",
        "org.springframework.boot.flyway.autoconfigure.FlywayAutoConfiguration",
        "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration",
        "org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration"
})
@Import({
        TaskListCacheGenerationService.class,
        CachedTaskListQueryService.class,
        TaskQueryCacheFeedbackApplication.CourseTaskListQueryPort.class
})
@Profile("task-query-cache-feedback")
public class TaskQueryCacheFeedbackApplication implements CommandLineRunner {
    private static final String PROJECT_ID = "PRJ-FEEDBACK";
    private static final String GENERATION_KEY =
            "teamflow:cache:task-list-generation:v1:" + PROJECT_ID;

    private final CachedTaskListQueryService queryService;
    private final TaskListCacheGenerationService generationService;
    private final CourseTaskListQueryPort queryPort;
    private final StringRedisTemplate redisTemplate;

    /** 保存正文查询服务、代次服务、可计数真相源和 Redis client。 */
    public TaskQueryCacheFeedbackApplication(
            CachedTaskListQueryService queryService,
            TaskListCacheGenerationService generationService,
            CourseTaskListQueryPort queryPort,
            StringRedisTemplate redisTemplate) {
        this.queryService = queryService;
        this.generationService = generationService;
        this.queryPort = queryPort;
        this.redisTemplate = redisTemplate;
    }

    /** 启动非 Web 反馈程序并在运行完成后关闭上下文。 */
    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(
                TaskQueryCacheFeedbackApplication.class,
                args);
        context.close();
    }

    /** 串联隔离查询、命中、写后推进、TTL 与损坏代次。 */
    @Override
    public void run(String... args) throws Exception {
        require(generationService.current(PROJECT_ID) == 0L, "初始代次不是 0");

        queryService.listTasks(PROJECT_ID, TaskStatus.TODO, 2, null);
        require(queryPort.loads() == 1, "首次查询没有唯一回源");
        System.out.println("FIRST generation=0 loads=1");

        queryService.listTasks(PROJECT_ID, TaskStatus.TODO, 2, null);
        require(queryPort.loads() == 1, "相同查询没有命中缓存");
        System.out.println("HIT generation=0 loads=1");

        queryService.listTasks(
                PROJECT_ID,
                TaskStatus.TODO,
                2,
                "TASK-PAGE-PRJ-FEEDBACK-TODO-3");
        require(queryPort.loads() == 2, "下一页与第一页错误共享缓存");
        System.out.println("NEXT_PAGE generation=0 loads=2");

        queryService.listTasks(PROJECT_ID, null, 20, null);
        require(queryPort.loads() == 3, "ALL 与 TODO 错误共享缓存");
        System.out.println("ALL generation=0 loads=3");

        long next = generationService.advance(PROJECT_ID);
        require(next == 1L, "首次写后代次不是 1");
        require(Long.valueOf(-1L).equals(redisTemplate.getExpire(GENERATION_KEY)),
                "generation key 不应设置 TTL");
        System.out.println("WRITE generation=1");

        queryService.listTasks(PROJECT_ID, TaskStatus.TODO, 2, null);
        require(queryPort.loads() == 4, "推进后仍命中旧代次");
        System.out.println("AFTER_WRITE generation=1 loads=4");

        queryService.listTasks(PROJECT_ID, TaskStatus.TODO, 2, null);
        require(queryPort.loads() == 4, "新代次相同查询没有命中");
        System.out.println("NEW_HIT generation=1 loads=4");

        Thread.sleep(1500L);
        queryService.listTasks(PROJECT_ID, TaskStatus.TODO, 2, null);
        require(queryPort.loads() == 5, "TTL 到期后没有重新回源");
        System.out.println("TTL_EXPIRED generation=1 loads=5");

        expectInvalidGeneration("broken", "BROKEN_GENERATION");
        expectInvalidGeneration("-1", "NEGATIVE_GENERATION");
        expectInvalidGeneration("9223372036854775808", "OVERFLOW_GENERATION");

        redisTemplate.delete(GENERATION_KEY);
        redisTemplate.opsForList().rightPush(GENERATION_KEY, "1");
        boolean wrongTypeRejected = false;
        try {
            generationService.current(PROJECT_ID);
        } catch (RuntimeException error) {
            wrongTypeRejected = true;
        }
        redisTemplate.delete(GENERATION_KEY);
        require(wrongTypeRejected, "错误 Redis 类型没有显式失败");
        System.out.println("WRONG_TYPE_GENERATION rejected=true");

        redisTemplate.opsForValue().set(GENERATION_KEY, Long.toString(Long.MAX_VALUE));
        boolean maxAdvanceRejected = false;
        try {
            generationService.advance(PROJECT_ID);
        } catch (RuntimeException error) {
            maxAdvanceRejected = true;
        }
        require(maxAdvanceRejected, "Long.MAX_VALUE 代次仍被推进");
        System.out.println("MAX_ADVANCE rejected=true");

        redisTemplate.opsForValue().set(GENERATION_KEY, "1");
        System.out.println("RUNTIME_PASS generation=1 loads=5");
    }

    /** 确认非规范 generation 文本统一按 v1 合同失败。 */
    private void expectInvalidGeneration(String stored, String label) {
        redisTemplate.opsForValue().set(GENERATION_KEY, stored);
        boolean rejected = false;
        try {
            generationService.current(PROJECT_ID);
        } catch (IllegalStateException error) {
            rejected = "任务列表缓存代次不符合 v1 合同".equals(error.getMessage());
        }
        require(rejected, label + " 没有按 v1 合同失败");
        System.out.println(label + " rejected=true");
    }

    /** 用固定公开 DTO 模拟一次 MySQL 任务列表查询。 */
    public static final class CourseTaskListQueryPort implements TaskListQueryPort {
        private int loads;

        /** @return 与项目、筛选和页 token 一致的固定公开任务页 */
        @Override
        public PageResponse<TaskResponse> listTasks(
                String projectId,
                TaskStatus status,
                int pageSize,
                String pageToken) {
            loads++;
            if (status == TaskStatus.TODO && pageToken == null && pageSize == 2) {
                return new PageResponse<TaskResponse>(
                        Arrays.asList(
                                task("TASK-FB-1", projectId, "整理缓存课程", TaskStatus.TODO),
                                task("TASK-FB-2", projectId, "核对分页合同", TaskStatus.TODO)),
                        "TASK-PAGE-PRJ-FEEDBACK-TODO-3");
            }
            if (status == TaskStatus.TODO
                    && "TASK-PAGE-PRJ-FEEDBACK-TODO-3".equals(pageToken)
                    && pageSize == 2) {
                return new PageResponse<TaskResponse>(
                        Collections.singletonList(
                                task("TASK-FB-3", projectId, "运行 Redis 反馈", TaskStatus.TODO)),
                        null);
            }
            if (status == null && pageToken == null && pageSize == 20) {
                return new PageResponse<TaskResponse>(
                        Arrays.asList(
                                task("TASK-FB-1", projectId, "整理缓存课程", TaskStatus.TODO),
                                task("TASK-FB-4", projectId, "归档旧反馈", TaskStatus.DONE)),
                        null);
            }
            throw new IllegalArgumentException("反馈程序收到未约定的查询");
        }

        /** @return 当前真实回源次数 */
        int loads() {
            return loads;
        }

        /** @return 一枚字段完整的公开任务响应 */
        private TaskResponse task(
                String id,
                String projectId,
                String title,
                TaskStatus status) {
            return new TaskResponse(
                    id,
                    projectId,
                    title,
                    status,
                    "2026-09-03T18:00:00+08:00",
                    "lin");
        }
    }

    /** 在反馈不符合预期时立即失败。 */
    private void require(boolean condition, String message) {
        if (!condition) {
            throw new IllegalStateException(message);
        }
    }
}
```

### 2. 在两条版本线复跑

先按第六章启动本课 Redis，再清理反馈项目的两个固定前缀。查询 key 使用完整 `--scan` 迭代，generation key 直接
删除；两者必须一起清理，不能让旧查询 value 在 generation 被单独删除后重新变成可达状态：

```bash
docker exec teamflow-task-query-cache-redis redis-cli -a course-pass --scan \
  --pattern 'teamflow:cache:task-list:v1:PRJ-FEEDBACK:*' | \
  while IFS= read -r key; do
    docker exec teamflow-task-query-cache-redis redis-cli -a course-pass DEL "$key"
  done
docker exec teamflow-task-query-cache-redis redis-cli -a course-pass \
  DEL teamflow:cache:task-list-generation:v1:PRJ-FEEDBACK
```

从现代工程根目录执行：

```bash
TEAMFLOW_REDIS_HOST=127.0.0.1 \
TEAMFLOW_REDIS_PORT=16385 \
TEAMFLOW_REDIS_PASSWORD=course-pass \
TEAMFLOW_TASK_LIST_CACHE_TTL_MILLIS=1000 \
mvn -q \
  -Dstart-class=com.teamflow.api.TaskQueryCacheFeedbackApplication \
  -Dspring-boot.run.arguments="--spring.main.web-application-type=none --spring.profiles.active=task-query-cache-feedback" \
  spring-boot:run
```

忽略 Spring 日志后，业务输出必须是：

```text
FIRST generation=0 loads=1
HIT generation=0 loads=1
NEXT_PAGE generation=0 loads=2
ALL generation=0 loads=3
WRITE generation=1
AFTER_WRITE generation=1 loads=4
NEW_HIT generation=1 loads=4
TTL_EXPIRED generation=1 loads=5
BROKEN_GENERATION rejected=true
NEGATIVE_GENERATION rejected=true
OVERFLOW_GENERATION rejected=true
WRONG_TYPE_GENERATION rejected=true
MAX_ADVANCE rejected=true
RUNTIME_PASS generation=1 loads=5
```

反馈程序完成后，再同时清理 `PRJ-FEEDBACK` 的两个固定前缀，然后从 Java 8 工程根目录执行同一条 Maven 命令。
`CourseTaskListQueryPort` 只使用 Java 8 已有集合 API，两个工程的 DTO 构造参数也保持一致，因此源文件无需分叉；两条线
都必须得到同一组业务输出。这个反馈证明缓存核心调用了真实 Redis，但不能替代第六章的 HTTP、MySQL、幂等回放和
写后顺序验收。

### 3. 只清理本课资源

完成两条线后，先在运行应用的终端按 `Ctrl+C` 停止应用，再删除第六章创建的响应文件，并停止、删除本课专用容器与
网络：

```bash
find /tmp -maxdepth 1 -type f \
  \( -name 'task-query-cache-first.headers' \
  -o -name 'task-query-cache-first.json' \
  -o -name 'task-query-cache-replay.headers' \
  -o -name 'task-query-cache-replay.json' \
  -o -name 'task-query-cache-delete.body' \
  -o -name 'task-query-cache-broken.json' \) -delete
docker stop teamflow-task-query-cache-redis teamflow-task-query-cache-mysql
docker rm teamflow-task-query-cache-redis teamflow-task-query-cache-mysql
docker network rm teamflow-task-query-cache-net
```

不要扩大 `find` 条件，也不要改成容器名称通配。清理后，`docker ps -a`、`docker network ls` 和上述六个精确临时
文件都不应再出现本课名称。

## 十、本课小结

任务查询缓存的核心不是给列表方法加一个 Redis `GET`，而是把一次查询的完整身份和一组列表结果的失效边界写成
协议。项目、status、pageSize 与 pageToken 共同生成查询哈希，公开 `PageResponse<TaskResponse>` JSON 作为 value，
项目级 generation 则让一次推进同时切断所有旧筛选和分页组合。正常请求不扫描 keyspace，旧代次 value 由有限 TTL
回收。

读取路径只有 key 缺失才是 miss；损坏 JSON、错项目、错筛选、非法 token、损坏 generation 与 Redis 故障都必须
显式失败。PUT、DELETE 与首次真实 POST 在 MySQL 提交后推进 generation，幂等回放不再次推进。这个顺序守住了
数据库真相源和回放语义，但 MySQL 与 Redis 仍不是一个原子事务；生产系统必须继续通过监控、补偿或后续一致性架构
处理提交成功而代次推进失败的窗口。
