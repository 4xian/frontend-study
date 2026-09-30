---
id: backend.java.learn.intermediate.cache-invalidation
type: lesson
title: 缓存失效
summary: 在 TeamFlow 数据库写成功后精确删除任务详情缓存，让替换、删除与下一次回源形成可验证闭环
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 180
prerequisites:
  - backend.java.learn.intermediate.cache-reading
objectives:
  - 能画出先完成数据库写入、再删除缓存、下一次读取回填新值的时间线。
  - 能复用任务详情读取路径的同一个精确 key，避免遗漏项目作用域或 schema 版本。
  - 能正确解释 DEL 对不存在 key 的幂等语义，不把返回 0 当成业务失败。
  - 能用不带事务的协调 Service 连接数据库事务与缓存失效，并说明代理提交发生在被调用方法返回前。
  - 能让 PUT 与 DELETE 在成功写库后失效缓存，同时保持 GET、POST、HTTP 与 OpenAPI 合同不变。
  - 能观察数据库失败、Redis 删除失败和并发旧值回填分别留下什么状态。
  - 能说明数据库与 Redis 不构成原子事务，本课只建立基础 cache-aside 失效合同。
recap:
  - 缓存是 MySQL 数据的可丢弃副本，写路径先改真相源，再精确删除对应副本。
  - PUT 和 DELETE 会影响已存在任务详情；POST 创建新任务不需要删除本课从未写入的负缓存。
  - Redis DEL 忽略不存在的 key；重复失效仍是成功完成的幂等动作。
  - CachedTaskCommandService 不开启外层事务，ApiService 的事务代理成功提交后才返回给协调层。
  - Redis 删除失败时数据库可能已经提交，请求失败不能被解释为数据库回滚。
  - 先写库再删缓存仍存在并发读者回填旧值的窗口，不等于强一致。
  - Java 8 与现代线使用相同的 StringRedisTemplate 删除 API 和相同控制流。
  - 双删、锁、Lua、事务事件、消息队列、outbox、版本校验和强一致方案属于后续高级课程。
related:
  - backend.java.learn.intermediate.cache-reading
  - backend.java.learn.intermediate.database-transactions
tags:
  - Java
  - Spring Boot
  - Redis
  - cache-aside
  - 缓存失效
  - StringRedisTemplate
  - Transactional
  - MySQL
  - TeamFlow
appliesTo: JDK 25 与 Spring Boot 4.1.x 主线；Java 8 与 Spring Boot 2.3.12.RELEASE 兼容线；Redis Open Source 8.x
verifiedAt: 2026-08-21
sources:
  - id: redis-cache-aside-java-lettuce-invalidation
    title: Redis cache-aside with Java and Lettuce
    url: https://redis.io/docs/latest/develop/use-cases/cache-aside/java-lettuce/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Redis cache-aside pattern
    claims:
      - 写入 primary 后由应用删除对应缓存键，下一次读取再从 primary 回填。
      - 缓存失效与缓存回填是写路径和后续读路径上的两个独立动作。
  - id: redis-del-cache-invalidation
    title: Redis DEL Command
    url: https://redis.io/docs/latest/commands/del/
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Redis Open Source
    claims:
      - DEL 删除指定 key，并返回实际删除的 key 数量。
      - 不存在的 key 会被忽略，因此单 key DEL 返回 0 仍可作为幂等失效完成。
  - id: spring-data-redis-41-template-delete
    title: RedisTemplate API - Spring Data Redis 4.1
    url: https://docs.spring.io/spring-data-redis/reference/api/java/org/springframework/data/redis/core/RedisTemplate.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Data Redis 4.1.x
    claims:
      - delete(K) 删除给定 key，并用 Boolean 表示该 key 是否被实际删除。
  - id: spring-data-redis-239-template-delete
    title: RedisTemplate API - Spring Data Redis 2.3.9.RELEASE
    url: https://docs.spring.io/spring-data/redis/docs/2.3.9.RELEASE/api/org/springframework/data/redis/core/RedisTemplate.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Data Redis 2.3.9.RELEASE
    claims:
      - Java 8 兼容线同样提供 delete(K) 并返回 key 是否被删除。
  - id: spring-data-redis-transactions
    title: Redis Transactions - Spring Data Redis
    url: https://docs.spring.io/spring-data/redis/reference/redis/transactions.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Data Redis 4.1.x
    claims:
      - RedisTemplate 默认不参与 Spring 管理的事务。
      - 即使显式启用 Redis 事务，事务范围也只是 Redis 命令，不能让 MySQL 与 Redis 原子提交。
  - id: spring-transaction-interceptor-modern
    title: TransactionAspectSupport source - Spring Framework main
    url: https://github.com/spring-projects/spring-framework/blob/main/spring-tx/src/main/java/org/springframework/transaction/interceptor/TransactionAspectSupport.java
    sourceOrigin: official
    sourceType: source-code
    appliesTo: Spring Framework 7.x
    claims:
      - 同步事务拦截器先调用目标方法，正常返回后提交事务，再把返回值交给外层调用者。
  - id: spring-transaction-interceptor-5215
    title: TransactionAspectSupport source - Spring Framework 5.2.15.RELEASE
    url: https://github.com/spring-projects/spring-framework/blob/v5.2.15.RELEASE/spring-tx/src/main/java/org/springframework/transaction/interceptor/TransactionAspectSupport.java
    sourceOrigin: official
    sourceType: source-code
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Java 8 兼容线的同步事务拦截顺序同样是目标方法、提交、返回外层。
  - id: mybatis-spring-cache-invalidation-transactions
    title: MyBatis-Spring Transactions
    url: https://mybatis.org/spring/transactions.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: MyBatis-Spring
    claims:
      - Spring 事务中的 Mapper 调用随事务提交或回滚，事务外 Mapper 写入会自动提交。
---

# 缓存失效

上一课让任务详情 GET 先查 Redis，miss 时再从 MySQL 回源。现在出现新的问题：PUT 已经把任务标题改成
“发布课程”，Redis 中却可能还保留“整理课程”。如果写路径什么都不做，GET 会在 TTL 到期前继续返回旧副本。

本课只为任务详情的 PUT 和 DELETE 增加写后失效。顺序固定为“数据库成功，再精确 DEL”；下一次 GET 继续
复用上一课的 cache-aside 读取路径。CREATE 没有旧任务详情可删，任务列表也尚未缓存，所以都保持原样。

## 一、先固定写后失效合同

### 1. 先写真相源，再删除副本

任务替换成功时，应用不直接拼一份新 JSON 覆盖 Redis，而是删除旧副本：

```text
PUT /api/v1/projects/PRJ-1/tasks/TASK-1
  -> ApiService.replaceTask
     -> MySQL COMMIT
  -> Redis DEL teamflow:cache:task-detail:v1:PRJ-1:TASK-1
  -> 返回新的 TaskResponse

下一次 GET
  -> Redis miss
  -> MySQL 读取新任务
  -> Redis SET + TTL
  -> 返回新 TaskResponse
```

这样只有 MySQL 负责保存权威状态。写路径不必再次实现 JSON 字段、TTL 和回填规则，下一次读取会通过已经验证
的 `CachedTaskQueryService` 生成副本。

顺序不能反过来。若先删缓存再写数据库，并发 GET 可能在数据库仍是旧值时 miss、读取旧值并重新回填；随后
数据库才完成更新，缓存又留下旧副本。先写库再删除缩小了这个窗口，但并不消灭所有并发竞态。

### 2. PUT 和 DELETE 删除同一个精确 key

上一课的任务详情 key 同时包含 schema 版本、项目 ID 和任务 ID：

```text
teamflow:cache:task-detail:v1:PRJ-1:TASK-1
```

替换会让该 key 中的 JSON 过时，删除会让整个资源不再存在，因此两者都删除同一个 key。不能只按任务 ID
删除，也不能扫描 `teamflow:cache:*` 后批量清空；前者可能命中错误作用域，后者会伤及无关任务并把一次固定
复杂度的操作扩大成键空间遍历。

key 的生成仍由查询 Service 负责。写路径调用它公开的失效方法，不复制前缀拼接规则。以后 value schema 升级
时，读取与失效才能继续指向同一份协议。

### 3. 不存在 key 也算失效成功

Redis `DEL` 返回实际删除数量。单 key 存在时返回 1，不存在时返回 0；0 不是 Redis 故障，只说明当前没有这份
副本。任务可能从未被读取、TTL 已到期，或者同一失效动作已经执行过，这些情况都应允许写操作成功完成。

```text
DEL existing-key -> 1
DEL existing-key -> 0
```

因此失效动作是幂等的：相同 key 执行一次或多次，最终状态都是“key 不存在”。代码可以把实际删除结果写入
日志用于观察，但不能因为 `false` 就抛业务异常。

### 4. CREATE 保持原路径

上一课明确不缓存 404，也没有任务列表缓存。创建一个全新任务时，不存在旧详情 key，也没有列表 key 需要
删除，所以 POST 继续调用 `ApiService.createTask`。为了“看起来完整”而给所有写方法都加 DEL，只会制造没有
状态依据的代码。

以后如果引入负缓存或任务列表缓存，CREATE 才需要根据那些新增的 key 合同补充失效。当前课程不能提前假设
它们已经存在。

## 二、把事务边界放在正确的层

### 1. 被代理方法返回时数据库已经提交

上一课的 `ApiService.replaceTask` 已经是公开的 `@Transactional` 方法。Spring 事务代理的同步调用顺序是：

```text
协调 Service -> ApiService 代理 -> 目标方法 -> COMMIT -> 返回协调 Service
```

只有目标方法正常完成且事务提交成功，协调 Service 才能取得返回值并继续删除 Redis。若 UPDATE、状态变更记录
或 COMMIT 失败，异常会直接返回协调层，后面的 DEL 不会执行。

为了让 DELETE 也具有同样清楚的提交边界，在已有 `ApiService.deleteTask` 上补充 `@Transactional`：

```java
/** 删除指定项目中的任务。 */
@Transactional
public void deleteTask(String projectId, String taskId) {
    ProjectRow project = requireProjectRow(projectId);
    int rows = taskMapper.delete(
            Wrappers.<TaskRow>lambdaQuery()
                    .eq(TaskRow::getProjectId, project.getId())
                    .eq(TaskRow::getPublicId, taskId));
    if (rows == 0) {
        throw taskNotFound(taskId);
    }
    if (rows > 1) {
        throw new IllegalStateException("任务删除行数大于 1");
    }
}
```

方法体没有改变；新增注解只是让项目检查和删除处于显式数据库事务中。现代版和 Java 8 版都使用 Spring 的
`org.springframework.transaction.annotation.Transactional`，这里没有版本分叉。

### 2. 协调 Service 自己不能开启外层事务

新的 `CachedTaskCommandService` 只负责编排顺序，不添加 `@Transactional`。如果给它开启一个覆盖整个方法的
外层数据库事务，那么内部 `ApiService` 调用会加入外层事务，并在返回协调层时尚未提交；此时执行 DEL 又变成
“提交前删除”，破坏刚刚固定的顺序。

```text
正确：ApiService 事务提交 -> 返回协调层 -> DEL
错误：协调层外部事务开始 -> ApiService 返回 -> DEL -> 外部事务提交
```

这也是为什么不能把 `ApiService` 当普通对象手工 `new` 出来。Controller 注入的是 Spring 管理的代理入口，
事务拦截才能围绕公开方法完成提交和回滚。

### 3. Redis 与 MySQL 仍然不是一个事务

数据库提交之后，Redis 可能断线、鉴权失败或超时。此时数据库已经是新值，DEL 却没有完成；异常会让 HTTP
请求失败，旧缓存仍可能存在。调用方不能看到 500 就假设数据库一定回滚，更不能盲目用同一个非幂等请求重试。

本课选择暴露 Redis 失败，便于通过真实反馈看见这条边界。生产系统通常还需要失效失败指标、告警和可重试
记录，但消息队列、outbox、事务事件与补偿执行器都会引入新的持久化和交付合同，留到高级一致性课程。

Spring Data Redis 即使显式启用 Redis 事务，也只管理 Redis 命令，不会把 MySQL 和 Redis 合成一次原子提交。
在本课的 `StringRedisTemplate` 默认配置下，DEL 是数据库事务完成后的普通 Redis 调用。

### 4. 并发旧值回填窗口仍然存在

先写库再删缓存仍可能出现以下时间线：

```text
R: Redis miss -> 从 MySQL 读到旧值 v1，尚未回填
W: MySQL 提交 v2 -> DEL key
R: 把先前读到的 v1 SET 回 Redis
```

DEL 成功只能证明删除命令执行时 key 不存在，不能取消另一个正在运行的读请求。版本校验、锁、单飞或延迟双删
都有额外成立条件；本课只要求学习者识别窗口，不能把基础 cache-aside 描述成强一致。

## 三、建立现代版失效路径

### 1. 从缓存读取完整工程继续

复制上一课 `teamflow-cache-reading-modern` 为 `teamflow-cache-invalidation-modern`。保留 Web、MyBatis、Flyway、
MySQL、Redis、Jackson、OpenAPI、`ApiService` 和完整的 `CachedTaskQueryService`，只做四处修改：

```text
teamflow-cache-invalidation-modern/
└── src/main/java/com/teamflow/api
    ├── ApiService.java                    # deleteTask 增加 @Transactional
    ├── CachedTaskQueryService.java        # 增加精确失效入口
    ├── CachedTaskCommandService.java      # 新建，不加 @Transactional
    └── TeamFlowApplication.java           # PUT/DELETE 改走协调 Service
```

配置继续使用上一课的缓存前缀与 TTL，不新增开关。GET 仍走查询 Service，列表和 POST 仍走原 `ApiService`。

### 2. 在查询 Service 复用 key 生成规则

打开 `CachedTaskQueryService.java`，在 `findTask` 后增加公开方法；原有私有 `cacheKey` 不变：

```java
/** 删除指定任务详情的缓存副本。 */
public void invalidateTask(String projectId, String taskId) {
    String key = cacheKey(projectId, taskId);
    Boolean removed = redisTemplate.delete(key);
    LOGGER.info(
            "task-cache result=INVALIDATED key={} removed={}",
            key,
            Boolean.TRUE.equals(removed));
}
```

`Boolean.TRUE.equals(removed)` 只把结果转成稳定日志值。`false` 表示 key 不存在，方法仍正常返回；连接失败等
Redis 异常不会变成 `false`，会继续抛给调用方。

读取和失效现在都通过同一个 `cacheKey(projectId, taskId)`。不要为了让命令 Service 直接拿到字符串而把前缀
字段或私有 key 方法暴露出去；“让缓存 owner 执行失效”比“让外层复制内部格式”更稳定。

### 3. 新增写路径协调 Service

新建 `src/main/java/com/teamflow/api/CachedTaskCommandService.java`：

```java
package com.teamflow.api;

import com.teamflow.api.TeamFlowApplication.ReplaceTaskRequest;
import com.teamflow.api.TeamFlowApplication.Task;
import com.teamflow.api.TeamFlowApplication.TaskResponse;
import org.springframework.stereotype.Service;

/** 在数据库写成功后协调任务详情缓存失效。 */
@Service
public class CachedTaskCommandService {
    private final ApiService apiService;
    private final CachedTaskQueryService cachedTaskQueryService;

    /** 保存数据库写入口与任务详情缓存 owner。 */
    public CachedTaskCommandService(
            ApiService apiService,
            CachedTaskQueryService cachedTaskQueryService) {
        this.apiService = apiService;
        this.cachedTaskQueryService = cachedTaskQueryService;
    }

    /** @return 数据库提交后完成缓存失效的新任务响应 */
    public TaskResponse replaceTask(
            String projectId,
            String taskId,
            ReplaceTaskRequest request) {
        Task replaced = apiService.replaceTask(projectId, taskId, request);
        cachedTaskQueryService.invalidateTask(projectId, taskId);
        return TaskResponse.from(replaced);
    }

    /** 数据库提交后删除任务详情缓存。 */
    public void deleteTask(String projectId, String taskId) {
        apiService.deleteTask(projectId, taskId);
        cachedTaskQueryService.invalidateTask(projectId, taskId);
    }
}
```

两个方法都先调用被代理的 `ApiService`。只要数据库调用抛异常，Java 控制流就不会到达下一行；成功返回则表示
对应事务已经提交，随后才执行缓存失效。

协调 Service 没有捕获 Redis 异常，也没有补写缓存。失败策略保持单一且可观察，避免一门入门课同时引入补偿、
重试和幂等请求设计。

### 4. PUT 与 DELETE 改走协调入口

打开现代 `TeamFlowApplication.java` 中已有的 `TaskController`。保留 `ApiService` 供列表和 POST 使用，保留
`CachedTaskQueryService` 供 GET 使用，再注入新的命令 Service：

```java
private final ApiService service;
private final CachedTaskQueryService cachedTaskQueryService;
private final CachedTaskCommandService cachedTaskCommandService;

/** 创建任务 Controller。 */
TaskController(
        ApiService service,
        CachedTaskQueryService cachedTaskQueryService,
        CachedTaskCommandService cachedTaskCommandService) {
    this.service = service;
    this.cachedTaskQueryService = cachedTaskQueryService;
    this.cachedTaskCommandService = cachedTaskCommandService;
}
```

完整替换 PUT 方法，保留原有 OpenAPI 注解、媒体类型、校验和响应类型：

```java
/** 完整替换项目任务。 */
@Operation(operationId = "replaceProjectTask", summary = "完整替换项目任务")
@ApiResponses({
    @ApiResponse(responseCode = "200", description = "替换成功"),
    @ApiResponse(
            responseCode = "400",
            description = "请求体校验失败",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class))),
    @ApiResponse(
            responseCode = "404",
            description = "项目或任务不存在",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class))),
    @ApiResponse(
            responseCode = "415",
            description = "请求媒体类型不支持",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
})
@PutMapping(
        path = "/{taskId}",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE)
TaskResponse replace(
        @PathVariable("projectId") String projectId,
        @PathVariable("taskId") String taskId,
        @Valid @RequestBody ReplaceTaskRequest request) {
    return cachedTaskCommandService.replaceTask(projectId, taskId, request);
}
```

完整替换 DELETE 方法，同样保留原注解与 204 合同：

```java
/** 删除项目任务。 */
@Operation(operationId = "deleteProjectTask", summary = "删除项目任务")
@ApiResponses({
    @ApiResponse(responseCode = "204", description = "删除成功"),
    @ApiResponse(
            responseCode = "404",
            description = "项目或任务不存在",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
})
@DeleteMapping("/{taskId}")
ResponseEntity<Void> delete(
        @PathVariable("projectId") String projectId,
        @PathVariable("taskId") String taskId) {
    cachedTaskCommandService.deleteTask(projectId, taskId);
    return ResponseEntity.noContent().build();
}
```

GET 仍调用 `cachedTaskQueryService.findTask`，POST 仍调用 `service.createTask`。本课没有改变 URL、状态码、
响应 JSON、Problem Details 或 OpenAPI operationId。

## 四、建立 Java 8 兼容实现

### 1. 新增代码没有语言分叉

复制上一课 `teamflow-cache-reading-java8` 为 `teamflow-cache-invalidation-java8`。在 Java 8 的 `ApiService` 上给
`deleteTask` 增加同一个 Spring `@Transactional` 注解，在 `CachedTaskQueryService` 增加同一个
`invalidateTask` 方法，并原样新增 `CachedTaskCommandService.java`。

这些类没有使用 record、模式匹配、Stream `toList` 或 Jackson API。`TaskResponse.from(replaced)` 已由兼容工程
自己的普通 DTO 实现，因此同一份命令 Service 能在 Java 8 编译并保持同形响应。

### 2. Controller 保留兼容线的既有类型

Java 8 `TaskController` 继续保留类型级 `@Validated`、`javax.validation.Valid` 和原 springdoc 注解。字段、构造器
与方法调用和现代线相同，PUT 与 DELETE 的注解片段只把错误 schema 保持为既有 `ApiProblem.class`：

```java
/** 完整替换项目任务。 */
@Operation(operationId = "replaceProjectTask", summary = "完整替换项目任务")
@ApiResponses({
    @ApiResponse(responseCode = "200", description = "替换成功"),
    @ApiResponse(
            responseCode = "400",
            description = "请求体校验失败",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ApiProblem.class))),
    @ApiResponse(
            responseCode = "404",
            description = "项目或任务不存在",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ApiProblem.class))),
    @ApiResponse(
            responseCode = "415",
            description = "请求媒体类型不支持",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ApiProblem.class)))
})
@PutMapping(
        path = "/{taskId}",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE)
TaskResponse replace(
        @PathVariable("projectId") String projectId,
        @PathVariable("taskId") String taskId,
        @Valid @RequestBody ReplaceTaskRequest request) {
    return cachedTaskCommandService.replaceTask(projectId, taskId, request);
}

/** 删除项目任务。 */
@Operation(operationId = "deleteProjectTask", summary = "删除项目任务")
@ApiResponses({
    @ApiResponse(responseCode = "204", description = "删除成功"),
    @ApiResponse(
            responseCode = "404",
            description = "项目或任务不存在",
            content = @Content(
                    mediaType = "application/problem+json",
                    schema = @Schema(implementation = ApiProblem.class)))
})
@DeleteMapping("/{taskId}")
ResponseEntity<Void> delete(
        @PathVariable("projectId") String projectId,
        @PathVariable("taskId") String taskId) {
    cachedTaskCommandService.deleteTask(projectId, taskId);
    return ResponseEntity.noContent().build();
}
```

不要把现代线的 `ProblemDetail` 或 `jakarta.validation` import 复制到 Boot 2.3 工程。缓存失效本身没有版本差异，
外围 Web 类型仍由各自前置课程的真实基线决定。

## 五、用真实服务观察删除与回填

### 1. 启动隔离的 Redis 与 MySQL

使用独立容器、端口和两个 schema，避免现代线与 Java 8 线互相读取状态。以下凭据仅用于本地课程环境：

```bash
docker network create teamflow-cache-invalidation-net
docker run -d --name teamflow-cache-invalidation-redis \
  --network teamflow-cache-invalidation-net -p 16381:6379 \
  redis:8.2-alpine redis-server --requirepass course-pass
docker run -d --name teamflow-cache-invalidation-mysql \
  --network teamflow-cache-invalidation-net -p 33320:3306 \
  -e MYSQL_ROOT_PASSWORD=teamflow-root \
  -e MYSQL_DATABASE=teamflow_modern \
  -e MYSQL_USER=teamflow -e MYSQL_PASSWORD=teamflow-pass \
  mysql:8.4
```

MySQL 健康后创建兼容线 schema 并授权：

```bash
docker exec teamflow-cache-invalidation-mysql mysql -uroot -pteamflow-root \
  -e "CREATE DATABASE teamflow_java8 CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
      GRANT ALL PRIVILEGES ON teamflow_java8.* TO 'teamflow'@'%';"
```

现代工程使用 JDK 25 启动：

```bash
TEAMFLOW_DB_URL='jdbc:mysql://127.0.0.1:33320/teamflow_modern?useSSL=false&allowPublicKeyRetrieval=true' \
TEAMFLOW_DB_USER=teamflow \
TEAMFLOW_DB_PASSWORD=teamflow-pass \
TEAMFLOW_PORT=18095 \
TEAMFLOW_REDIS_HOST=127.0.0.1 \
TEAMFLOW_REDIS_PORT=16381 \
TEAMFLOW_REDIS_PASSWORD=course-pass \
TEAMFLOW_TASK_CACHE_PREFIX=teamflow:cache:task-detail:modern:v1 \
mvn spring-boot:run
```

Java 8 工程从自己的根目录使用兼容 JDK、独立 schema 和端口启动：

```bash
TEAMFLOW_DB_URL='jdbc:mysql://127.0.0.1:33320/teamflow_java8?useSSL=false&allowPublicKeyRetrieval=true' \
TEAMFLOW_DB_USER=teamflow \
TEAMFLOW_DB_PASSWORD=teamflow-pass \
TEAMFLOW_PORT=18096 \
TEAMFLOW_REDIS_HOST=127.0.0.1 \
TEAMFLOW_REDIS_PORT=16381 \
TEAMFLOW_REDIS_PASSWORD=course-pass \
TEAMFLOW_TASK_CACHE_PREFIX=teamflow:cache:task-detail:java8:v1 \
mvn spring-boot:run
```

两套工程的 Flyway 都必须在各自 schema 完成迁移。不能让现代版先迁移一个 schema，再用它证明 Java 8 版
启动兼容。

### 2. PUT 后 key 消失，下一次 GET 回填新值

前置工程的迁移已准备 `PRJ-1` 与 `TASK-1`。先为现代线读入旧值，再替换任务：

```bash
MODERN_URL=http://127.0.0.1:18095
MODERN_KEY=teamflow:cache:task-detail:modern:v1:PRJ-1:TASK-1

curl -sS "$MODERN_URL/api/v1/projects/PRJ-1/tasks/TASK-1"
docker exec teamflow-cache-invalidation-redis redis-cli -a course-pass EXISTS "$MODERN_KEY"
curl -sS -X PUT "$MODERN_URL/api/v1/projects/PRJ-1/tasks/TASK-1" \
  -H 'Content-Type: application/json' \
  -d '{"title":"发布缓存课程","status":"DONE","dueAt":"2026-08-31T18:00:00+08:00","assignee":"zhou"}'
docker exec teamflow-cache-invalidation-redis redis-cli -a course-pass EXISTS "$MODERN_KEY"
curl -sS "$MODERN_URL/api/v1/projects/PRJ-1/tasks/TASK-1"
docker exec teamflow-cache-invalidation-redis redis-cli -a course-pass EXISTS "$MODERN_KEY"
```

三次 `EXISTS` 的关键顺序是 1、0、1。PUT 日志包含 `result=INVALIDATED` 与 `removed=true`；后续 GET 记录 MISS，
响应标题是“发布缓存课程”，Redis 中重新出现带 TTL 的新 JSON。

如果跳过第一个 GET，让 key 本来就不存在，再执行一次 PUT，日志中的 `removed=false`，PUT 仍返回 200。这就是
幂等失效对“从未缓存”状态的可观察结果。

### 3. DELETE 后旧副本不能继续命中

确保 key 已由 GET 回填，再删除任务：

```bash
curl -sS -o /dev/null -w '%{http_code}\n' \
  -X DELETE "$MODERN_URL/api/v1/projects/PRJ-1/tasks/TASK-1"
docker exec teamflow-cache-invalidation-redis redis-cli -a course-pass EXISTS "$MODERN_KEY"
curl -sS -o /tmp/teamflow-cache-delete-problem.json -w '%{http_code}\n' \
  "$MODERN_URL/api/v1/projects/PRJ-1/tasks/TASK-1"
```

输出依次为 204、0、404。若 DELETE 只改了 MySQL 而没有失效，最后一个 GET 会从旧缓存错误返回 200；这条反馈
能直接区分“数据库已删除”和“完整写后失效已经闭环”。

### 4. Java 8 复跑同一反馈

Java 8 使用自己的端口与 key，命令不能复用现代线状态：

```bash
JAVA8_URL=http://127.0.0.1:18096
JAVA8_KEY=teamflow:cache:task-detail:java8:v1:PRJ-1:TASK-1

curl -sS "$JAVA8_URL/api/v1/projects/PRJ-1/tasks/TASK-1"
docker exec teamflow-cache-invalidation-redis redis-cli -a course-pass EXISTS "$JAVA8_KEY"
curl -sS -X PUT "$JAVA8_URL/api/v1/projects/PRJ-1/tasks/TASK-1" \
  -H 'Content-Type: application/json' \
  -d '{"title":"验证 Java 8 失效","status":"DONE","dueAt":"2026-08-31T18:00:00+08:00","assignee":"lin"}'
docker exec teamflow-cache-invalidation-redis redis-cli -a course-pass EXISTS "$JAVA8_KEY"
curl -sS "$JAVA8_URL/api/v1/projects/PRJ-1/tasks/TASK-1"
docker exec teamflow-cache-invalidation-redis redis-cli -a course-pass EXISTS "$JAVA8_KEY"
curl -sS -o /dev/null -w '%{http_code}\n' \
  -X DELETE "$JAVA8_URL/api/v1/projects/PRJ-1/tasks/TASK-1"
docker exec teamflow-cache-invalidation-redis redis-cli -a course-pass EXISTS "$JAVA8_KEY"
curl -sS -o /dev/null -w '%{http_code}\n' \
  "$JAVA8_URL/api/v1/projects/PRJ-1/tasks/TASK-1"
```

兼容线同样得到 key 状态 1、0、1，随后 DELETE 返回 204、key 状态为 0、GET 返回 404。日志中的 key 必须使用
java8 前缀，不能误删现代线副本。

### 5. 暂停 Redis 观察非原子失败

先通过原 POST 创建一枚独立任务并预热详情 key，再暂停 Redis 执行 PUT。这样不会复用上一节已经删除的
`TASK-1`：

```bash
REDIS_FAILURE_TASK=$(curl -fsS -X POST \
  "$MODERN_URL/api/v1/projects/PRJ-1/tasks" \
  -H 'Content-Type: application/json' \
  -d '{"title":"准备 Redis 故障反馈","dueAt":"2026-09-01T18:00:00+08:00","assignee":"zhou"}')
REDIS_FAILURE_TASK_ID=$(printf '%s' "$REDIS_FAILURE_TASK" | jq -er '.id')
REDIS_FAILURE_KEY="teamflow:cache:task-detail:modern:v1:PRJ-1:$REDIS_FAILURE_TASK_ID"
curl -fsS \
  "$MODERN_URL/api/v1/projects/PRJ-1/tasks/$REDIS_FAILURE_TASK_ID" \
  >/dev/null

docker pause teamflow-cache-invalidation-redis
curl -sS -o /tmp/teamflow-cache-redis-failure.json -w '%{http_code}\n' \
  -X PUT "$MODERN_URL/api/v1/projects/PRJ-1/tasks/$REDIS_FAILURE_TASK_ID" \
  -H 'Content-Type: application/json' \
  -d '{"title":"数据库已提交","status":"DONE","dueAt":"2026-09-01T18:00:00+08:00","assignee":"zhou"}'
docker unpause teamflow-cache-invalidation-redis
```

请求在 Redis 超时后返回 500，但 MySQL 中这枚任务的标题已经更新。旧 key 可能仍在，也可能因为超时命令稍后
到达 Redis 而已经消失；二者都不能改变数据库已提交的事实。恢复 Redis 后应先通过 SQL 对照真相源，再手工
`DEL "$REDIS_FAILURE_KEY"` 并 GET 回填；不能把这次 500 描述成跨存储回滚成功。

这条反馈只证明失败边界，不是生产补偿方案。课程结束前恢复所有容器，并删除 `/tmp` 中的响应文件。

## 六、集中排查三个失效错误

### 三个典型错误

:::pitfalls
### 在数据库提交前删除缓存

**触发条件：** 给协调 Service 添加覆盖整个方法的 `@Transactional`，或在调用 `ApiService.replaceTask` 前执行
DEL。

**原因：** 外层数据库事务尚未提交时，另一个 GET 已经可以 miss 并读取旧数据库值。

**后果：** 旧值可能重新进入缓存；数据库回滚时还会制造一次没有必要的 miss。

**错误示例：**

```java
/** 错误地在数据库写入前删除副本。 */
public TaskResponse replaceTask(String projectId, String taskId, ReplaceTaskRequest request) {
    cachedTaskQueryService.invalidateTask(projectId, taskId);
    return TaskResponse.from(apiService.replaceTask(projectId, taskId, request));
}
```

**正确写法：**

```java
/** 在被代理的数据库事务提交后删除副本。 */
public TaskResponse replaceTask(String projectId, String taskId, ReplaceTaskRequest request) {
    Task replaced = apiService.replaceTask(projectId, taskId, request);
    cachedTaskQueryService.invalidateTask(projectId, taskId);
    return TaskResponse.from(replaced);
}
```

**验证方式：** 让数据库写入失败，确认正确写法没有打印 `INVALIDATED`；正常 PUT 时先观察 SQL 提交，再观察
DEL。两版 Spring 的 `TransactionAspectSupport` 都应呈现目标方法、提交、返回外层的顺序。

### 把 DEL 返回 0 当成写失败

**触发条件：** 任务从未进入缓存或 TTL 已到期，`StringRedisTemplate.delete(key)` 返回 `false`。

**原因：** 返回值描述实际删除数量，不描述数据库业务操作是否成功；不存在 key 已经满足失效后的目标状态。

**后果：** 对冷 key 的正常 PUT 或 DELETE 被错误转换成 500，同一次失效也无法安全重放。

**错误示例：**

```java
/** 错误地要求缓存必须事先存在。 */
public void invalidateTask(String projectId, String taskId) {
    if (!Boolean.TRUE.equals(redisTemplate.delete(cacheKey(projectId, taskId)))) {
        throw new IllegalStateException("任务缓存不存在");
    }
}
```

**正确写法：**

```java
/** 幂等删除任务详情副本。 */
public void invalidateTask(String projectId, String taskId) {
    String key = cacheKey(projectId, taskId);
    Boolean removed = redisTemplate.delete(key);
    LOGGER.info("task-cache result=INVALIDATED key={} removed={}",
            key, Boolean.TRUE.equals(removed));
}
```

**验证方式：** 对同一 key 连续执行两次失效，日志应依次允许 `removed=true` 与 `removed=false`，第二次不能抛
业务异常；Redis DEL 官方反馈依次为 1 与 0。

### 把一次 DEL 当作强一致证明

**触发条件：** 并发读者已经从数据库取到旧值但尚未 SET，写者提交新值并成功 DEL。

**原因：** DEL 只影响命令执行时的 Redis 状态，不能撤销另一个请求手中的旧快照。

**后果：** 读者稍后仍可能把旧 JSON 回填，TTL 窗口内再次出现陈旧响应。

**错误示例：**

```java
/** 错误地把删除成功等同于所有读者都已看见新版本。 */
boolean stronglyConsistent(Boolean removed) {
    return Boolean.TRUE.equals(removed);
}
```

**正确写法：**

```java
/** 只报告本次失效命令是否实际删除了 key。 */
boolean removedExistingKey(Boolean removed) {
    return Boolean.TRUE.equals(removed);
}
```

**验证方式：** 按“读旧值并暂停、写入提交并 DEL、恢复读者 SET”的顺序执行，确认 key 仍可重新出现旧值。将
结果记录为本课已知窗口，不加入未经当前课程验证的锁或双删代码。
:::

## 七、独立练习

:::exercise
### 为任务标题建立写后失效时间线

**要求：** 使用最小内存端口实现任务读取、替换和删除。替换与删除必须先修改真相源，再幂等删除同一个详情
key；读取 miss 后回填。不得增加锁、重试或第二种缓存。

**验收：**

```text
before=整理课程
after-replace=发布课程
after-delete=NOT_FOUND
invalidations=2
source-loads=3
```
:::

### 1. 完整参考实现

```java
import java.util.HashMap;
import java.util.Map;

/** 用内存端口复现数据库写成功后的精确缓存失效。 */
public final class CacheInvalidationExercise {
    /** 定义可丢弃的字符串缓存。 */
    interface TextCache {
        /** @return key 不存在时的 null，或缓存标题 */
        String get(String key);

        /** 保存任务标题副本。 */
        void put(String key, String value);

        /** 幂等删除任务标题副本。 */
        void delete(String key);
    }

    /** 定义任务真相源。 */
    interface TaskSource {
        /** @return 当前任务标题，不存在时返回 null */
        String find(String taskId);

        /** 完整替换任务标题。 */
        void replace(String taskId, String title);

        /** 删除任务。 */
        void delete(String taskId);
    }

    /** 按 cache-aside 顺序读取并在写后失效。 */
    static final class TaskService {
        private final TextCache cache;
        private final TaskSource source;

        /** 保存缓存与真相源端口。 */
        TaskService(TextCache cache, TaskSource source) {
            this.cache = cache;
            this.source = source;
        }

        /** @return 缓存命中或真相源中的标题 */
        String find(String projectId, String taskId) {
            String key = key(projectId, taskId);
            String cached = cache.get(key);
            if (cached != null) {
                return cached;
            }
            String loaded = source.find(taskId);
            if (loaded != null) {
                cache.put(key, loaded);
            }
            return loaded;
        }

        /** 先替换真相源，再删除旧副本。 */
        void replace(String projectId, String taskId, String title) {
            source.replace(taskId, title);
            cache.delete(key(projectId, taskId));
        }

        /** 先删除真相源，再删除旧副本。 */
        void delete(String projectId, String taskId) {
            source.delete(taskId);
            cache.delete(key(projectId, taskId));
        }

        /** @return 带作用域与 schema 版本的任务详情 key */
        private String key(String projectId, String taskId) {
            return "teamflow:cache:task-detail:v1:" + projectId + ":" + taskId;
        }
    }

    /** 运行读取、替换、再读取和删除反馈。 */
    public static void main(String[] args) {
        Map<String, String> cachedValues = new HashMap<>();
        Map<String, String> sourceValues = new HashMap<>();
        sourceValues.put("TASK-1", "整理课程");
        int[] invalidations = {0};
        int[] sourceLoads = {0};

        TextCache cache = new TextCache() {
            /** @return 当前缓存标题 */
            @Override
            public String get(String key) {
                return cachedValues.get(key);
            }

            /** 保存当前缓存标题。 */
            @Override
            public void put(String key, String value) {
                cachedValues.put(key, value);
            }

            /** 删除 key，并累计失效调用次数。 */
            @Override
            public void delete(String key) {
                cachedValues.remove(key);
                invalidations[0]++;
            }
        };
        TaskSource source = new TaskSource() {
            /** @return 当前真相源标题 */
            @Override
            public String find(String taskId) {
                sourceLoads[0]++;
                return sourceValues.get(taskId);
            }

            /** 替换当前真相源标题。 */
            @Override
            public void replace(String taskId, String title) {
                sourceValues.put(taskId, title);
            }

            /** 删除当前真相源任务。 */
            @Override
            public void delete(String taskId) {
                sourceValues.remove(taskId);
            }
        };

        TaskService service = new TaskService(cache, source);
        String before = service.find("PRJ-1", "TASK-1");
        service.replace("PRJ-1", "TASK-1", "发布课程");
        String afterReplace = service.find("PRJ-1", "TASK-1");
        service.delete("PRJ-1", "TASK-1");
        String afterDelete = service.find("PRJ-1", "TASK-1");

        System.out.println("before=" + before);
        System.out.println("after-replace=" + afterReplace);
        System.out.println("after-delete=" + (afterDelete == null ? "NOT_FOUND" : afterDelete));
        System.out.println("invalidations=" + invalidations[0]);
        System.out.println("source-loads=" + sourceLoads[0]);
    }
}
```

`source-loads=3` 分别来自第一次读取、替换后的 miss 和删除后的 miss。替换与删除自身不读取真相源；两次写都
调用同一个幂等删除入口。

### 2. 自我检查

- 如果把 `replace` 中两行颠倒，并发 GET 可能在哪个时刻重新写入旧值？
- 如果第一次读取前缓存为空，为什么替换后的 delete 仍不应失败？
- 如果 `source.replace` 抛异常，哪一行控制流保证缓存不会先被删除？
- 为什么 `invalidations=2` 不能证明并发读者永远看不到旧值？

## 八、本课小结

写后失效的基础合同很短：数据库是真相源，PUT 与 DELETE 成功提交后精确删除任务详情 key，下一次 GET 再按
cache-aside 回填。DEL 对不存在 key 的 0 返回是幂等成功，不需要把冷 key 变成错误。

真正需要谨慎的是边界。协调 Service 自己不包外层事务，才能等被代理的 `ApiService` 提交后再删除 Redis；
Redis 失败又不会让已经提交的 MySQL 自动回滚。并发旧值回填窗口仍然存在，所以这套实现是可观察、可解释的
基础一致性策略，不是强一致承诺。
