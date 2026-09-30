---
id: backend.java.learn.intermediate.cache-reading
type: lesson
title: 缓存读取
summary: 为 TeamFlow 任务详情建立 cache-aside 读取路径，让命中、回源、JSON 副本与 TTL 都可验证
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 180
prerequisites:
  - backend.java.learn.intermediate.redis-web-integration
objectives:
  - 能画出 cache-aside 的命中与未命中时间线，并指出 MySQL 仍是真相源。
  - 能从项目 ID、任务 ID 与 schema 版本生成稳定且隔离的任务详情缓存键。
  - 能把公开任务响应编码为受控 JSON 字符串，并在命中时恢复同一响应合同。
  - 能在未命中时调用既有 ApiService，成功后使用明确 TTL 回填 Redis。
  - 能区分 null 未命中、Redis 连接失败、缓存 JSON 损坏和数据库 404。
  - 能解释 TTL 只是陈旧上界，为什么本课尚未解决写后失效与并发回源。
  - 能分别使用 Boot 4.1 的 Jackson 3 JsonMapper 与 Boot 2.3.12 的 Jackson 2 ObjectMapper。
recap:
  - cache-aside 由应用先读缓存，hit 直接返回，miss 才读取真相源并回填。
  - 缓存键必须同时表达资源作用域与值 schema 版本，不能只拼一个任务 ID。
  - Redis 的 null 表示 key 不存在；连接异常和 JSON 解析异常都不是 cache miss。
  - 任务详情缓存只保存公开响应字段，不保存 MyBatis Row、内部主键或数据库对象。
  - miss 回源得到 404 时不会写 Redis，本课明确接受不存在查询重复访问数据库。
  - TTL 限制副本最长存活时间，但在这段时间内仍可能读到数据库更新前的值。
  - Boot 4.1 默认使用 Jackson 3 JsonMapper，Java 8 兼容线使用 Jackson 2 ObjectMapper。
  - 写后精确删除、删除失败重试、验证码、幂等和任务列表缓存实战属于后续课程。
related:
  - backend.java.learn.intermediate.redis-web-integration
  - backend.java.learn.intermediate.project-and-task-persistence-project
tags:
  - Java
  - Spring Boot
  - Redis
  - cache-aside
  - StringRedisTemplate
  - Jackson
  - JSON
  - TTL
  - TeamFlow
appliesTo: JDK 25 与 Spring Boot 4.1.x 主线；Java 8 与 Spring Boot 2.3.12.RELEASE 兼容线；Redis Open Source 8.x
verifiedAt: 2026-08-21
sources:
  - id: redis-cache-aside
    title: Redis cache-aside
    url: https://redis.io/docs/latest/develop/use-cases/cache-aside/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Redis cache-aside pattern
    claims:
      - 应用先读 Redis，miss 后回源 primary database 并带 TTL 写回。
      - TTL 是副本陈旧时间的上界，更新后的主动失效是另一项动作。
  - id: redis-query-caching
    title: Query Caching for Microservices
    url: https://redis.io/tutorials/howtos/solutions/microservices/caching/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Redis cache-aside pattern
    claims:
      - cache hit 直接返回 Redis 结果而不访问数据库。
      - cache miss 按缓存、数据库、回填、响应的顺序执行。
  - id: spring-data-redis-41-value-operations
    title: ValueOperations API - Spring Data Redis 4.1
    url: https://docs.spring.io/spring-data/redis/docs/4.1.x/api/org/springframework/data/redis/core/ValueOperations.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Data Redis 4.1.x
    claims:
      - get 在 key 不存在时返回 null。
      - set 的 Duration 重载同时写入值和过期时间。
  - id: spring-data-redis-239-value-operations
    title: ValueOperations API - Spring Data Redis 2.3.9.RELEASE
    url: https://docs.spring.io/spring-data/redis/docs/2.3.9.RELEASE/api/org/springframework/data/redis/core/ValueOperations.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Data Redis 2.3.9.RELEASE
    claims:
      - Java 8 兼容线具有相同的 get 与 Duration set 合同。
  - id: spring-boot-41-json
    title: 'JSON :: Spring Boot 4.1'
    url: https://docs.spring.io/spring-boot/4.1/reference/features/json.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.x
    claims:
      - Jackson 3 是默认 JSON 实现，Boot 自动配置 JsonMapper Bean。
  - id: spring-boot-2312-jackson
    title: Spring Boot 2.3.12 JacksonAutoConfiguration API
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/api/org/springframework/boot/autoconfigure/jackson/JacksonAutoConfiguration.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - 兼容线自动配置 Jackson 2 ObjectMapper。
  - id: redis-get-command
    title: Redis GET Command
    url: https://redis.io/docs/latest/commands/get/
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Redis Open Source
    claims:
      - GET 在字符串 key 不存在时返回空结果。
  - id: redis-set-command-cache-reading
    title: Redis SET Command
    url: https://redis.io/docs/latest/commands/set/
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Redis Open Source
    claims:
      - SET 可以在写入字符串值时携带过期选项。
---

# 缓存读取

TeamFlow 的任务详情已经由 MySQL 持久化。现在可以让重复 GET 先读 Redis，但这不等于把 Redis 变成第二个
数据库。缓存中的 JSON 只是可丢弃副本：不存在时必须回到 `ApiService`，而数据库错误、Redis 错误与损坏
副本都要保留各自的反馈。

本课只改任务详情 GET。创建、替换、删除和任务列表仍走原路径，写后删除缓存留到下一课。这样可以先把
cache-aside 的读取顺序、键和值合同独立验证，再讨论写操作怎样缩短旧值窗口。

## 一、先固定 cache-aside 读取合同

### 1. 命中和未命中走两条路径

cache-aside 由应用而不是 Redis 决定何时访问数据库。任务详情请求先计算 key，再执行一次字符串 GET：

```text
GET /api/v1/projects/PRJ-1/tasks/TASK-1
  -> Redis GET teamflow:cache:task-detail:v1:PRJ-1:TASK-1
     -> hit: 解析 JSON -> 返回原 TaskResponse
     -> miss: ApiService.findTask -> MySQL
              -> 编码 TaskResponse
              -> Redis SET + TTL
              -> 返回同一 TaskResponse
```

hit 不应调用 `ApiService`，miss 也不能先写一个占位值再查询。只有真相源成功返回任务后才回填；如果既有
查询抛出项目或任务 404，控制流会在 SET 前结束，原错误合同保持不变。

### 2. null 才是本课的未命中

`StringRedisTemplate.opsForValue().get(key)` 在 key 不存在时返回 `null`。以下情况都不是 null miss：

- Redis 密码错误、连接超时或命令超时会抛连接异常；
- key 中保存了非法 JSON 会抛解析异常；
- JSON 字段不符合 v1 合同会抛数据合同异常；
- MySQL 查询不到项目或任务会继续抛原有 404。

把这些异常统统捕获后回源，会让缓存损坏和 Redis 故障静默增加数据库压力，还可能用一次新回填覆盖排错
证据。本课选择直接暴露失败；是否在生产环境降级必须结合容量、监控和业务可用性另行设计。

### 3. TTL 只是允许陈旧的上界

回填时使用 60 秒只是为了快速观察，不是所有任务系统的推荐数字。TTL 内数据库值可能已经变化，而本课还
没有写后失效，所以副本最多只能被描述为“最长约 60 秒后自然消失”。真正的 TTL 应由业务允许的陈旧窗口、
读写比例和故障策略决定。

并发请求也可能同时 miss 并重复回源。单飞、互斥锁或提前刷新都需要新的并发合同，本课不把普通
cache-aside 夸大成自动防击穿方案。

## 二、把键和值都当作协议

### 1. key 包含作用域与 schema 版本

任务详情属于项目下的嵌套资源，key 同时包含 `projectId` 和 `taskId`：

```text
teamflow:cache:task-detail:v1:PRJ-1:TASK-1
|        |     |           |  |     |
产品命名空间  资源          版本 项目   任务
```

`v1` 表示 value 的字段合同，而不是应用发布号。以后字段结构不兼容时使用新版本前缀，旧 key 由 TTL 回收。
只使用 `TASK-1` 会丢掉嵌套资源作用域；把整段 URL 或对象 `toString()` 当 key，则会把不稳定格式带进协议。

当前 TeamFlow 只会为数据库中真实存在、且由系统生成的 `PRJ-*` 与 `TASK-*` 身份写缓存。未知路径参数即使
包含冒号也会在回源时得到 404，不会形成 Redis key。

### 2. value 只保存公开响应

缓存保存 `TaskResponse` 的六个公开字段：

```json
{
  "id": "TASK-1",
  "projectId": "PRJ-1",
  "title": "补齐课程目录",
  "status": "TODO",
  "dueAt": "2026-08-22T18:00:00+08:00",
  "assignee": "lin"
}
```

MyBatis `TaskRow` 的内部主键和关系列不进入副本。这样 hit 与 miss 都构造同一个 HTTP 响应，也不会让缓存
格式依赖数据库映射类。JSON 仍是 schema，不是“随便存一个对象”；因此 key 带 `v1`，解析错误也不能当成
不存在。

### 3. 复用 Web 已配置的 JSON 映射器

现代线的 Spring Boot 4.1 默认使用 Jackson 3，并自动配置
`tools.jackson.databind.json.JsonMapper`。Java 8 线的 Boot 2.3.12 使用 Jackson 2
`com.fasterxml.jackson.databind.ObjectMapper`。两边都应注入 Boot 已配置的 mapper，让 HTTP 与缓存使用
一致的枚举和字段规则，不要在每次请求中 `new` 一个未配置实例。

## 三、建立现代版任务详情缓存

### 1. 从上一课完整工程继续

复制 `teamflow-redis-integration-modern` 为 `teamflow-cache-reading-modern`。保留 Web、MyBatis、Flyway、
MySQL、springdoc 与 Redis starter，删除只用于启动反馈的 `RedisIntegrationVerifier`。已有启动类、DTO、
Controller、`ApiService`、Mapper 与迁移都保留，本课只增加一个查询 Service、修改任务 Controller 的详情
调用，并增加两项配置：

```text
teamflow-cache-reading-modern/
├── pom.xml                                      # 继承上一课完整依赖，只改 artifactId
└── src/main
    ├── java/com/teamflow/api
    │   ├── TeamFlowApplication.java             # 只改 TaskController 构造器与详情 GET
    │   ├── ApiService.java                      # 保留 MySQL 查询与事务
    │   ├── CachedTaskQueryService.java           # 新建
    │   ├── persistence                           # 保留
    │   └── redis/RedisIntegrationService.java    # 可保留作定向连接诊断
    └── resources
        ├── application.properties                # 增加缓存前缀与 TTL
        └── db/migration                          # 保留 V1、V2
```

### 2. 配置可观察的前缀与 TTL

在现代 `application.properties` 末尾增加：

```properties
teamflow.redis.task-detail-prefix=${TEAMFLOW_TASK_CACHE_PREFIX:teamflow:cache:task-detail:v1}
teamflow.redis.task-detail-ttl=${TEAMFLOW_TASK_CACHE_TTL:60s}
```

前缀和 TTL 都由环境覆盖，便于两套课程工程共享 Redis 时隔离反馈。业务代码只接收已经转换好的 `Duration`，
不自己解析 `60s`。

### 3. 完整实现查询 Service

新建 `src/main/java/com/teamflow/api/CachedTaskQueryService.java`：

```java
package com.teamflow.api;

import com.teamflow.api.TeamFlowApplication.TaskResponse;
import com.teamflow.api.TeamFlowApplication.TaskStatus;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.json.JsonMapper;

/** 使用 cache-aside 查询 TeamFlow 任务详情。 */
@Service
public class CachedTaskQueryService {
    private static final Logger LOGGER =
            LoggerFactory.getLogger(CachedTaskQueryService.class);

    private final ApiService apiService;
    private final StringRedisTemplate redisTemplate;
    private final JsonMapper jsonMapper;
    private final String keyPrefix;
    private final Duration ttl;

    /** 保存真相源、Redis 字符串模板、JSON 映射器与缓存配置。 */
    public CachedTaskQueryService(
            ApiService apiService,
            StringRedisTemplate redisTemplate,
            JsonMapper jsonMapper,
            @Value("${teamflow.redis.task-detail-prefix}") String keyPrefix,
            @Value("${teamflow.redis.task-detail-ttl}") Duration ttl) {
        this.apiService = apiService;
        this.redisTemplate = redisTemplate;
        this.jsonMapper = jsonMapper;
        this.keyPrefix = keyPrefix;
        this.ttl = ttl;
    }

    /** @return 缓存命中或回源得到的公开任务响应 */
    public TaskResponse findTask(String projectId, String taskId) {
        String key = cacheKey(projectId, taskId);
        String cachedJson = redisTemplate.opsForValue().get(key);
        if (cachedJson != null) {
            LOGGER.info("task-cache result=HIT key={}", key);
            return decode(cachedJson, projectId, taskId);
        }

        TaskResponse loaded = TaskResponse.from(apiService.findTask(projectId, taskId));
        redisTemplate.opsForValue().set(key, encode(loaded), ttl);
        LOGGER.info("task-cache result=MISS key={}", key);
        return loaded;
    }

    /** @return 同时包含 schema 版本与嵌套资源身份的缓存键 */
    private String cacheKey(String projectId, String taskId) {
        return keyPrefix + ":" + projectId + ":" + taskId;
    }

    /** @return 公开任务响应对应的 JSON 字符串 */
    private String encode(TaskResponse response) {
        try {
            return jsonMapper.writeValueAsString(TaskCacheValue.from(response));
        } catch (JacksonException exception) {
            throw new IllegalStateException("任务缓存编码失败", exception);
        }
    }

    /** @return 从 v1 JSON 恢复且属于当前请求的公开任务响应 */
    private TaskResponse decode(String json, String projectId, String taskId) {
        try {
            return jsonMapper
                    .readValue(json, TaskCacheValue.class)
                    .toResponse(projectId, taskId);
        } catch (JacksonException | IllegalArgumentException exception) {
            throw new IllegalStateException("任务缓存 JSON 不符合 v1 合同", exception);
        }
    }

    /** 表示任务详情缓存的 v1 JSON 字段。 */
    public static final class TaskCacheValue {
        public String id;
        public String projectId;
        public String title;
        public String status;
        public String dueAt;
        public String assignee;

        /** 供 JSON 映射器创建缓存值。 */
        public TaskCacheValue() {
        }

        /** 保存完整的 v1 字段。 */
        private TaskCacheValue(
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

        /** @return 从现代公开响应复制出的缓存值 */
        private static TaskCacheValue from(TaskResponse response) {
            return new TaskCacheValue(
                    response.id(),
                    response.projectId(),
                    response.title(),
                    response.status().name(),
                    response.dueAt(),
                    response.assignee());
        }

        /** @return 字段完整且属于当前请求的任务响应 */
        private TaskResponse toResponse(String expectedProjectId, String expectedTaskId) {
            if (id == null
                    || projectId == null
                    || title == null
                    || status == null
                    || dueAt == null
                    || assignee == null) {
                throw new IllegalArgumentException("任务缓存字段不完整");
            }
            if (!expectedProjectId.equals(projectId) || !expectedTaskId.equals(id)) {
                throw new IllegalArgumentException("任务缓存身份与请求不一致");
            }
            return new TaskResponse(
                    id,
                    projectId,
                    title,
                    TaskStatus.valueOf(status),
                    dueAt,
                    assignee);
        }
    }
}
```

`decode` 同时接收当前请求的项目与任务 ID。合法 JSON 也必须包含六个字段、使用合法状态，并且 `projectId`
与 `id` 必须匹配当前 key 对应的请求；否则统一抛出“任务缓存 JSON 不符合 v1 合同”，不能返回带空字段或错
身份的 200 响应。

日志只用于课程反馈：同一个 key 第一次应打印 MISS，随后打印 HIT。生产系统应把命中、未命中、回源耗时与
失败做成指标，而不是依赖逐请求 INFO 日志。

### 4. 只替换任务详情调用

打开现代 `TeamFlowApplication.java` 中已有的 `TaskController`，保留列表、创建、替换和删除方法，只让
构造器多接收查询 Service，并替换详情方法：

```java
private final ApiService service;
private final CachedTaskQueryService cachedTaskQueryService;

/** 创建任务 Controller。 */
TaskController(
        ApiService service,
        CachedTaskQueryService cachedTaskQueryService) {
    this.service = service;
    this.cachedTaskQueryService = cachedTaskQueryService;
}

/** 查询项目任务详情。 */
@Operation(operationId = "getProjectTask", summary = "查询单个项目任务")
@ApiResponses({
    @ApiResponse(responseCode = "200", description = "查询成功"),
    @ApiResponse(
            responseCode = "404",
            description = "项目或任务不存在",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
})
@GetMapping(path = "/{taskId}", produces = MediaType.APPLICATION_JSON_VALUE)
TaskResponse find(
        @PathVariable("projectId") String projectId,
        @PathVariable("taskId") String taskId) {
    return cachedTaskQueryService.findTask(projectId, taskId);
}
```

Controller 仍返回 `TaskResponse`，所以状态码、媒体类型与 JSON 字段不变。其他方法继续使用 `ApiService`，本课
不会偷偷改变写路径。

## 四、建立 Java 8 兼容实现

### 1. 工程与配置保持同一业务合同

复制上一课 Java 8 完整工程为 `teamflow-cache-reading-java8`，删除启动 Verifier，保留 Boot 2.3.12、Web、
Validation、MyBatis-Plus、Flyway、MySQL、springdoc 与 Redis starter。配置增加同名属性；并行反馈时使用独立
默认前缀：

```properties
teamflow.redis.task-detail-prefix=${TEAMFLOW_TASK_CACHE_PREFIX:teamflow:cache:task-detail:java8:v1}
teamflow.redis.task-detail-ttl=${TEAMFLOW_TASK_CACHE_TTL:60s}
```

现代工程做并行反馈时同样把环境前缀覆盖为 `teamflow:cache:task-detail:modern:v1`。运行变体不属于业务 schema，
这里只为两套课程应用同时运行时不互相读取。

### 2. 只替换 Jackson 版本与 DTO 访问方式

兼容版 `CachedTaskQueryService.java` 的 cache-aside 控制流、key、TTL 与日志不变。完整源码使用 Jackson 2：

```java
package com.teamflow.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamflow.api.TeamFlowApplication.TaskResponse;
import com.teamflow.api.TeamFlowApplication.TaskStatus;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/** 使用 cache-aside 查询 Java 8 TeamFlow 任务详情。 */
@Service
public class CachedTaskQueryService {
    private static final Logger LOGGER =
            LoggerFactory.getLogger(CachedTaskQueryService.class);

    private final ApiService apiService;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final String keyPrefix;
    private final Duration ttl;

    /** 保存真相源、Redis 字符串模板、JSON 映射器与缓存配置。 */
    public CachedTaskQueryService(
            ApiService apiService,
            StringRedisTemplate redisTemplate,
            ObjectMapper objectMapper,
            @Value("${teamflow.redis.task-detail-prefix}") String keyPrefix,
            @Value("${teamflow.redis.task-detail-ttl}") Duration ttl) {
        this.apiService = apiService;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.keyPrefix = keyPrefix;
        this.ttl = ttl;
    }

    /** @return 缓存命中或回源得到的公开任务响应 */
    public TaskResponse findTask(String projectId, String taskId) {
        String key = cacheKey(projectId, taskId);
        String cachedJson = redisTemplate.opsForValue().get(key);
        if (cachedJson != null) {
            LOGGER.info("task-cache result=HIT key={}", key);
            return decode(cachedJson, projectId, taskId);
        }

        TaskResponse loaded = TaskResponse.from(apiService.findTask(projectId, taskId));
        redisTemplate.opsForValue().set(key, encode(loaded), ttl);
        LOGGER.info("task-cache result=MISS key={}", key);
        return loaded;
    }

    /** @return 同时包含 schema 版本与嵌套资源身份的缓存键 */
    private String cacheKey(String projectId, String taskId) {
        return keyPrefix + ":" + projectId + ":" + taskId;
    }

    /** @return 公开任务响应对应的 JSON 字符串 */
    private String encode(TaskResponse response) {
        try {
            return objectMapper.writeValueAsString(TaskCacheValue.from(response));
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("任务缓存编码失败", exception);
        }
    }

    /** @return 从 v1 JSON 恢复且属于当前请求的公开任务响应 */
    private TaskResponse decode(String json, String projectId, String taskId) {
        try {
            return objectMapper
                    .readValue(json, TaskCacheValue.class)
                    .toResponse(projectId, taskId);
        } catch (JsonProcessingException | IllegalArgumentException exception) {
            throw new IllegalStateException("任务缓存 JSON 不符合 v1 合同", exception);
        }
    }

    /** 表示 Java 8 任务详情缓存的 v1 JSON 字段。 */
    public static final class TaskCacheValue {
        public String id;
        public String projectId;
        public String title;
        public String status;
        public String dueAt;
        public String assignee;

        /** 供 JSON 映射器创建缓存值。 */
        public TaskCacheValue() {
        }

        /** 保存完整的 v1 字段。 */
        private TaskCacheValue(
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

        /** @return 从 Java 8 公开响应复制出的缓存值 */
        private static TaskCacheValue from(TaskResponse response) {
            return new TaskCacheValue(
                    response.id,
                    response.projectId,
                    response.title,
                    response.status.name(),
                    response.dueAt,
                    response.assignee);
        }

        /** @return 字段完整且属于当前请求的任务响应 */
        private TaskResponse toResponse(String expectedProjectId, String expectedTaskId) {
            if (id == null
                    || projectId == null
                    || title == null
                    || status == null
                    || dueAt == null
                    || assignee == null) {
                throw new IllegalArgumentException("任务缓存字段不完整");
            }
            if (!expectedProjectId.equals(projectId) || !expectedTaskId.equals(id)) {
                throw new IllegalArgumentException("任务缓存身份与请求不一致");
            }
            return new TaskResponse(
                    id,
                    projectId,
                    title,
                    TaskStatus.valueOf(status),
                    dueAt,
                    assignee);
        }
    }
}
```

Java 8 的 `TaskController` 使用上一节同形的构造器和详情方法，只保留已有的 `@Validated` 与旧版 OpenAPI
注解。不要把现代的 `tools.jackson.*` import 复制进旧工程，也不要给 Boot 4.1 主线主动切回已弃用的
Jackson 2 自动配置。

## 五、用真实服务证明 hit 不回源

### 1. 启动隔离的 Redis 与 MySQL

课程反馈使用独立网络、Redis 密码和 MySQL schema。命令中的凭据只属于本地临时容器：

```bash
docker network create teamflow-cache-reading-net
docker run -d --name teamflow-cache-reading-redis \
  --network teamflow-cache-reading-net -p 16380:6379 \
  redis:8.2-alpine redis-server --requirepass course-pass
docker run -d --name teamflow-cache-reading-mysql \
  --network teamflow-cache-reading-net -p 33319:3306 \
  -e MYSQL_ROOT_PASSWORD=teamflow-root \
  -e MYSQL_DATABASE=teamflow_modern \
  -e MYSQL_USER=teamflow -e MYSQL_PASSWORD=teamflow-pass \
  mysql:8.4
```

等待 MySQL 健康后，再创建 `teamflow_java8` 并授权。现代线与兼容线必须使用独立 schema，不能让两套 Flyway
历史互相证明。

```bash
docker exec teamflow-cache-reading-mysql mysql -uroot -pteamflow-root \
  -e "CREATE DATABASE teamflow_java8 CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
      GRANT ALL PRIVILEGES ON teamflow_java8.* TO 'teamflow'@'%';"
```

### 2. 第一次请求产生 MISS 与正 TTL

现代工程使用完整环境启动：

```bash
TEAMFLOW_DB_URL='jdbc:mysql://127.0.0.1:33319/teamflow_modern?useSSL=false&allowPublicKeyRetrieval=true' \
TEAMFLOW_DB_USER=teamflow \
TEAMFLOW_DB_PASSWORD=teamflow-pass \
TEAMFLOW_PORT=18093 \
TEAMFLOW_REDIS_HOST=127.0.0.1 \
TEAMFLOW_REDIS_PORT=16380 \
TEAMFLOW_REDIS_PASSWORD=course-pass \
TEAMFLOW_TASK_CACHE_PREFIX=teamflow:cache:task-detail:modern:v1 \
mvn spring-boot:run
```

从 Java 8 兼容工程根目录使用独立 schema、端口和 key 前缀启动：

```bash
TEAMFLOW_DB_URL='jdbc:mysql://127.0.0.1:33319/teamflow_java8?useSSL=false&allowPublicKeyRetrieval=true' \
TEAMFLOW_DB_USER=teamflow \
TEAMFLOW_DB_PASSWORD=teamflow-pass \
TEAMFLOW_PORT=18094 \
TEAMFLOW_REDIS_HOST=127.0.0.1 \
TEAMFLOW_REDIS_PORT=16380 \
TEAMFLOW_REDIS_PASSWORD=course-pass \
TEAMFLOW_TASK_CACHE_PREFIX=teamflow:cache:task-detail:java8:v1 \
mvn spring-boot:run
```

删除专属 key 后请求两次：

```bash
docker exec teamflow-cache-reading-redis redis-cli -a course-pass \
  DEL teamflow:cache:task-detail:modern:v1:PRJ-1:TASK-1
curl -i http://127.0.0.1:18093/api/v1/projects/PRJ-1/tasks/TASK-1
docker exec teamflow-cache-reading-redis redis-cli -a course-pass --raw \
  GET teamflow:cache:task-detail:modern:v1:PRJ-1:TASK-1
docker exec teamflow-cache-reading-redis redis-cli -a course-pass \
  TTL teamflow:cache:task-detail:modern:v1:PRJ-1:TASK-1
curl -i http://127.0.0.1:18093/api/v1/projects/PRJ-1/tasks/TASK-1
```

两次响应都为原 200 JSON；日志顺序是 MISS、HIT。Redis 中 JSON 字段与 HTTP 响应一致，TTL 满足
`0 < ttl <= 60`。TTL 是动态状态，不能断言固定等于 60。

### 3. 暂停 MySQL 验证命中分支

在 key 仍存在时暂停 MySQL，再发同一 GET：

```bash
docker stop teamflow-cache-reading-mysql
curl -i http://127.0.0.1:18093/api/v1/projects/PRJ-1/tasks/TASK-1
docker start teamflow-cache-reading-mysql
```

请求仍返回同一任务并记录 HIT，证明命中分支没有调用 MySQL。恢复 MySQL 后应等待健康检查通过再继续；不能
拿连接池尚未恢复的失败判断缓存逻辑。

### 4. 404 与损坏 JSON 保持不同反馈

不存在任务连续请求两次都返回原 404，且 Redis 中不存在对应 key：

```bash
curl -i http://127.0.0.1:18093/api/v1/projects/PRJ-1/tasks/TASK-999
curl -i http://127.0.0.1:18093/api/v1/projects/PRJ-1/tasks/TASK-999
docker exec teamflow-cache-reading-redis redis-cli -a course-pass \
  EXISTS teamflow:cache:task-detail:modern:v1:PRJ-1:TASK-999
```

结果应是 404、404、0。随后依次写入语法错误、缺少字段和身份错配的 JSON：

```bash
docker exec teamflow-cache-reading-redis redis-cli -a course-pass \
  SET teamflow:cache:task-detail:modern:v1:PRJ-1:TASK-1 not-json EX 60
curl -i http://127.0.0.1:18093/api/v1/projects/PRJ-1/tasks/TASK-1
docker exec teamflow-cache-reading-redis redis-cli -a course-pass \
  SET teamflow:cache:task-detail:modern:v1:PRJ-1:TASK-1 '{"status":"TODO"}' EX 60
curl -i http://127.0.0.1:18093/api/v1/projects/PRJ-1/tasks/TASK-1
docker exec teamflow-cache-reading-redis redis-cli -a course-pass \
  SET teamflow:cache:task-detail:modern:v1:PRJ-1:TASK-1 \
  '{"id":"TASK-2","projectId":"PRJ-1","title":"核对接口文档","status":"DONE","dueAt":"2026-08-23T18:00:00+08:00","assignee":"zhou"}' \
  EX 60
curl -i http://127.0.0.1:18093/api/v1/projects/PRJ-1/tasks/TASK-1
```

三次请求都应走既有 500 错误映射，异常链包含“任务缓存 JSON 不符合 v1 合同”，而不是打印 MISS。完成后只
删除本课前缀 key。Java 8 工程在端口 `18094`、`teamflow_java8` schema 与 java8 前缀下重复同一反馈环。

## 六、集中排查三个读取错误

### 三个典型错误

:::pitfalls
### key 只包含任务 ID

**触发条件：** 把详情缓存写成 `"task:" + taskId`，没有资源类型、schema 版本和项目作用域。

**原因：** key 没有表达嵌套 URL 与 value 格式合同。

**后果：** 不同作用域可能争用同一副本，字段升级时旧 JSON 也会污染新代码。

**错误示例：**

```java
return "task:" + taskId;
```

**正确写法：**

```java
/** @return 包含 schema 版本与嵌套资源身份的缓存键 */
String cacheKey(String schemaVersion, String projectId, String taskId) {
    return "teamflow:cache:task-detail:" + schemaVersion + ":" + projectId + ":" + taskId;
}
```

**验证方式：** 分别生成两个项目和两个 schema 版本的 key，四个结果必须互不相同。

### 把所有异常都当成 cache miss

**触发条件：** GET、JSON 解析和数据库查询被一个宽泛的 `catch (Exception)` 包围，异常后统一回源。

**原因：** 代码混淆了“key 不存在”和“依赖或数据合同损坏”。

**后果：** Redis 故障会放大数据库流量，损坏 JSON 被新值覆盖，真实错误难以定位。

**错误示例：**

```java
try {
    return decode(redisTemplate.opsForValue().get(key));
} catch (Exception ignored) {
    return TaskResponse.from(apiService.findTask(projectId, taskId));
}
```

**正确写法：**

```java
String json = redisTemplate.opsForValue().get(key);
if (json != null) {
    return decode(json, projectId, taskId);
}
return loadAndCache(projectId, taskId, key);
```

**验证方式：** 分别使用缺失 key、错误密码和 `not-json`，只有缺失 key 记录 MISS。

### 把 404 当成普通 JSON 缓存

**触发条件：** 回源前先写 `"null"`，或捕获 `TASK_NOT_FOUND` 后按正常任务 TTL 保存占位值。

**原因：** 代码没有先定义负缓存的存在性、TTL 与创建后清理合同。

**后果：** 新创建任务可能在占位值到期前继续返回旧 404，且错误响应与正常值共用 schema。

**错误示例：**

```java
redisTemplate.opsForValue().set(key, "null", ttl);
return TaskResponse.from(apiService.findTask(projectId, taskId));
```

**正确写法：**

```java
TaskResponse loaded = TaskResponse.from(apiService.findTask(projectId, taskId));
redisTemplate.opsForValue().set(key, encode(loaded), ttl);
return loaded;
```

**验证方式：** 对同一个未知任务请求两次，两次都返回原 404，`EXISTS` 始终为 0。
:::

`loadAndCache` 只是错误对照中的职责名；完整实现把相同三步直接写在 `findTask` 的 miss 分支，没有为了单次
调用再增加一个薄包装方法。

## 七、独立练习

:::exercise
### 用可观察端口复现一次 miss 和一次 hit

**要求：** 实现一个与框架无关的任务读取器。第一次读取必须调用真相源并以 60 秒 TTL 回填，第二次读取同一
身份必须命中缓存；key 同时包含项目、任务和 v1 版本。不得缓存 null，也不得实现失效或并发锁。

**验收：**

```text
first=补齐课程目录
second=补齐课程目录
source-loads=1
key=teamflow:cache:task-detail:v1:PRJ-1:TASK-1
ttl-seconds=60
```
:::

### 1. 完整参考实现

```java
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/** 通过最小端口复现 cache-aside 读取顺序。 */
public final class CacheAsideReaderExercise {
    /** 表示只需缓存的任务快照。 */
    static final class TaskSnapshot {
        final String id;
        final String projectId;
        final String title;

        /** 保存任务快照。 */
        TaskSnapshot(String id, String projectId, String title) {
            this.id = id;
            this.projectId = projectId;
            this.title = title;
        }
    }

    /** 定义字符串缓存端口。 */
    interface TextCache {
        /** @return key 不存在时的 null，或已缓存标题 */
        String get(String key);

        /** 保存标题与 TTL。 */
        void put(String key, String value, Duration ttl);
    }

    /** 定义权威任务来源。 */
    interface TaskSource {
        /** @return 指定嵌套身份的任务 */
        TaskSnapshot load(String projectId, String taskId);
    }

    /** 按 cache-aside 顺序读取任务标题。 */
    static final class TaskReader {
        private static final Duration TTL = Duration.ofSeconds(60);
        private final TextCache cache;
        private final TaskSource source;

        /** 保存缓存与真相源端口。 */
        TaskReader(TextCache cache, TaskSource source) {
            this.cache = cache;
            this.source = source;
        }

        /** @return 缓存命中或回源得到的任务标题 */
        String findTitle(String projectId, String taskId) {
            String key = key(projectId, taskId);
            String cached = cache.get(key);
            if (cached != null) {
                return cached;
            }
            TaskSnapshot loaded = source.load(projectId, taskId);
            cache.put(key, loaded.title, TTL);
            return loaded.title;
        }

        /** @return 带嵌套身份与 schema 版本的 key */
        String key(String projectId, String taskId) {
            return "teamflow:cache:task-detail:v1:" + projectId + ":" + taskId;
        }
    }

    /** 运行一次 miss 和一次 hit。 */
    public static void main(String[] args) {
        final Map<String, String> values = new HashMap<>();
        final long[] ttlSeconds = {0L};
        final int[] sourceLoads = {0};
        TextCache cache = new TextCache() {
            /** @return 内存中的缓存标题 */
            @Override
            public String get(String key) {
                return values.get(key);
            }

            /** 记录标题和调用方传入的 TTL。 */
            @Override
            public void put(String key, String value, Duration ttl) {
                values.put(key, value);
                ttlSeconds[0] = ttl.getSeconds();
            }
        };
        TaskSource source = new TaskSource() {
            /** @return 固定的权威任务并累计回源次数 */
            @Override
            public TaskSnapshot load(String projectId, String taskId) {
                sourceLoads[0]++;
                return new TaskSnapshot(taskId, projectId, "补齐课程目录");
            }
        };
        TaskReader reader = new TaskReader(cache, source);
        String first = reader.findTitle("PRJ-1", "TASK-1");
        String second = reader.findTitle("PRJ-1", "TASK-1");

        System.out.println("first=" + first);
        System.out.println("second=" + second);
        System.out.println("source-loads=" + sourceLoads[0]);
        System.out.println("key=" + reader.key("PRJ-1", "TASK-1"));
        System.out.println("ttl-seconds=" + ttlSeconds[0]);
    }
}
```

这份参考实现只替换了 Redis 与 MySQL 的外部端口，控制流与完整工程相同。它不模拟时间流逝，因此只能证明
读取器把 60 秒 TTL 交给缓存端口；真正的过期仍由 Redis 反馈环证明。

### 2. 自我检查

- 删除第二次读取后，`source-loads` 应变成 1 还是保持 1？解释原因。
- 把第二次任务 ID 改成 `TASK-2`，回源次数为什么会变成 2？
- 如果 `source.load` 抛出 404，哪一行保证占位值不会进入缓存？
- 为什么练习没有加入锁，也不能声称并发 miss 只回源一次？

## 八、本课小结

任务详情现在拥有一条明确的 cache-aside 读路径：稳定 v1 key 先查 Redis，null miss 才调用既有 MySQL
Service，成功后把公开响应编码为 JSON 并带 TTL 回填。hit 与 miss 返回同一 `TaskResponse`，404、Redis
故障和损坏 JSON 保持不同反馈。

这条路径仍允许 TTL 窗口内的旧值，也允许并发 miss 重复回源。下一课只处理数据库写成功后如何精确失效本课
key；在那之前不能把“会自然过期”描述成更新后一致。
