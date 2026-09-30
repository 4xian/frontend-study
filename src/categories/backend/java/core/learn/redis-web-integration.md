---
id: backend.java.learn.intermediate.redis-web-integration
type: lesson
title: Redis Web 集成
summary: 在既有 Spring Boot Web 项目中接入 Redis，并用字符串序列化完成带 TTL 的写、读、查时与删除反馈
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 150
prerequisites:
  - backend.java.learn.intermediate.project-and-task-persistence-project
objectives:
  - 能为现代版与 Java 8 版 TeamFlow 添加由 Spring Boot 管理版本的 Redis starter。
  - 能使用当前 Spring Boot 版本真实支持的属性前缀连接独立 Redis 服务。
  - 能通过构造器注入自动配置的 StringRedisTemplate，并解释连接工厂、模板和 Redis Server 的职责。
  - 能用稳定且隔离的字符串键完成缺失读取、带 TTL 写入、命中读取、剩余时间查询和定向删除。
  - 能解释 Java 泛型不决定 Redis 字节格式，以及本课为什么选择 StringRedisTemplate。
  - 能根据 PONG、应用输出、redis-cli 与失败堆栈区分连接成功、键不存在和鉴权失败。
  - 能保持既有 TeamFlow HTTP、MySQL 与事务合同不变，并说清缓存读取和失效属于后续课程。
recap:
  - Redis starter 同时提供客户端、连接自动配置与 Spring Data Redis 抽象，两条版本线默认都使用 Lettuce。
  - Spring Boot 4.1 使用 spring.data.redis 前缀并区分连接与读超时，Spring Boot 2.3.12.RELEASE 使用 spring.redis 前缀且 timeout 表示连接超时。
  - StringRedisTemplate 把字符串键和值编码成可读字节；RedisTemplate 的泛型不会自动改变序列化器。
  - 带 Duration 的 set 在一次命令中同时写入值和过期时间，TTL 会自然递减。
  - TTL 为正数表示剩余秒数，-1 表示键存在但没有过期时间，-2 表示键不存在。
  - 删除课程专属键不会影响其他键；课程验证不得使用 FLUSHALL 或 KEYS *。
  - 错误密码导致应用反馈失败，不能把 RedisConnectionFailureException 当作正常的缓存未命中。
  - 本课只建立连接与字符串读写边界，不实现 cache aside、缓存失效、验证码或接口幂等。
related:
  - backend.java.learn.intermediate.project-and-task-persistence-project
  - backend.java.learn.intermediate.spring-boot-and-configuration
tags:
  - Java
  - Spring Boot
  - Redis
  - Spring Data Redis
  - Lettuce
  - StringRedisTemplate
  - TTL
  - TeamFlow
appliesTo: JDK 25 与 Spring Boot 4.1.x 主线；Java 8 与 Spring Boot 2.3.12.RELEASE 兼容线；Redis Open Source 8.x
verifiedAt: 2026-08-21
sources:
  - id: spring-boot-41-redis
    title: 'Working with NoSQL Technologies :: Spring Boot'
    url: https://docs.spring.io/spring-boot/4.1/reference/data/nosql.html#data.nosql.redis
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.x
    claims:
      - Redis starter 默认使用 Lettuce，并自动配置连接工厂、RedisTemplate 与 StringRedisTemplate。
      - Spring Boot 4.1 使用 spring.data.redis 属性配置 standalone Redis 连接。
  - id: spring-boot-2312-redis
    title: Spring Boot 2.3.12.RELEASE Reference - Connecting to Redis
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/htmlsingle/#boot-features-connecting-to-redis
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java 8 与 Spring Boot 2.3.12.RELEASE
    claims:
      - 兼容线使用同名 Redis starter、默认 Lettuce 和自动配置模板。
      - Spring Boot 2.3.12.RELEASE 使用 spring.redis 属性前缀。
  - id: spring-data-redis-41-template
    title: Working with Objects through RedisTemplate
    url: https://docs.spring.io/spring-data/redis/reference/4.1/redis/template.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Data Redis 4.1.x
    claims:
      - 配置完成的模板可复用，序列化器决定 Java 值与 Redis 字节之间的转换。
      - StringRedisTemplate 为字符串密集操作提供字符串序列化边界。
  - id: spring-data-redis-41-value-operations
    title: ValueOperations API - Spring Data Redis 4.1
    url: https://docs.spring.io/spring-data/redis/docs/4.1.x/api/org/springframework/data/redis/core/ValueOperations.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Data Redis 4.1.x
    claims:
      - set 的 Duration 重载在一次操作中保存值与过期时间。
  - id: spring-data-redis-239-value-operations
    title: ValueOperations API - Spring Data Redis 2.3.9.RELEASE
    url: https://docs.spring.io/spring-data/redis/docs/2.3.9.RELEASE/api/org/springframework/data/redis/core/ValueOperations.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Data Redis 2.3.9.RELEASE
    claims:
      - Java 8 兼容线同样支持使用 Duration 写入带过期时间的字符串值。
  - id: redis-set-command
    title: Redis SET Command
    url: https://redis.io/docs/latest/commands/set/
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Redis Open Source
    claims:
      - SET 可以原子携带过期选项，普通覆盖写入会丢弃键上原有的 TTL。
  - id: redis-ttl-command
    title: Redis TTL Command
    url: https://redis.io/docs/latest/commands/ttl/
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Redis Open Source 2.8 及以上
    claims:
      - 正数、-1 与 -2 分别表示剩余秒数、无过期时间和键不存在。
  - id: stackoverflow-template-serialization
    title: redisTemplate vs stringRedisTemplate - why set does not work
    url: https://stackoverflow.com/questions/67503106/redistemplate-vs-stringredistemplate-why-redistemplate-set-command-does-not-wor
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Spring Data Redis；原问题使用 Spring Boot 2.3.8
    claims:
      - 默认 JDK 序列化会让看似相同的 Java 字符串成为不同的 Redis 字节键。
  - id: stackoverflow-set-clears-ttl
    title: Spring Data RedisTemplate TTL is not working when setting a value
    url: https://stackoverflow.com/questions/38502746/spring-data-redistemplate-ttl-is-not-working-when-setting-a-value
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Spring Data Redis；结论由 Redis SET 官方合同复核
    claims:
      - 先设置过期时间再覆盖写值会清除已有 TTL，应使用一次带过期时间的 SET。
  - id: spring-boot-issue-41442
    title: Spring Boot issue 41442 - custom RedisConnectionFactory and auto-configuration
    url: https://github.com/spring-projects/spring-boot/issues/41442
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Spring Boot Redis auto-configuration；原问题使用 Spring Boot 3.3.1
    claims:
      - 手工声明 RedisConnectionFactory 会使对应自动配置退让，连接属性不能再由默认工厂解释。
---

# Redis Web 集成

TeamFlow 已经用 MySQL 保存项目和任务，数据库仍是业务真相源。接入 Redis 不是把数据库换掉，也不是
马上给所有查询加缓存，而是先建立一条可验证的连接边界：应用能找到 Redis、按约定把字符串变成字节、
写入有明确生命周期的键，并在连接错误时给出真实失败。

本课只完成这个最小集成。你会在现代版和 Java 8 版工程中使用同一个 starter 与同一组 Java 调用，真实
差异只留在父版本、JDK 和配置属性前缀。缓存未命中后的数据库读取、写后失效、验证码和接口幂等都有各自
的数据流，留给后续课程。

## 一、先画清集成边界

### 1. 四个参与者各有职责

一次字符串写入会经过四层：业务服务选择键和值，`StringRedisTemplate` 负责字符串序列化，
`RedisConnectionFactory` 管理客户端连接，Redis Server 保存最终字节与过期时间。

```text
RedisIntegrationService
        |
        v
StringRedisTemplate  -- UTF-8 字符串序列化
        |
        v
RedisConnectionFactory -- Boot 按属性自动配置 Lettuce
        |
        v
Redis Server -- 保存 key、value 与 TTL
```

业务代码不应该自己解析主机、端口或密码，也不需要为每次调用创建客户端。Spring Boot 根据配置创建连接
工厂和模板，Service 通过构造器接收已经装配好的 `StringRedisTemplate`。

### 2. Redis 是可失效的外部状态

Redis 进程与 Web 应用具有不同生命周期。应用重启不会自动清空 Redis，Redis 重启是否保留数据又取决于
服务端持久化配置。当前课程的探针键只是可删除状态：无论主动删除、自然到期还是 Redis 被清空，业务真相
都仍在 MySQL。

因此两条版本线分别使用 `teamflow:integration:redis:modern:v1` 与
`teamflow:integration:redis:java8:v1`，每个应用只删除自己的探针键。`FLUSHALL` 会清空整个实例，
`KEYS *` 会扫描全部键；两者都不属于验证一条集成链路所需要的操作。

### 3. 成功连接不等于缓存已经设计完成

`PING` 得到 `PONG` 只证明客户端能与 Redis 通信。写入后从应用和 `redis-cli` 读到同一值，才能继续证明
序列化与键约定一致；观察到正 TTL，才能证明生命周期已经落到服务端。至于何时先查 Redis、何时回源
MySQL、数据库提交后何时删键，仍是后续缓存读取和失效课程的责任。

## 二、让 Spring Boot 负责连接

### 1. 两条版本线使用同一个 starter

现代工程与 Java 8 工程都添加下面的依赖，不单独声明 Spring Data Redis 或 Lettuce 版本：

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

父 POM 决定与当前 Boot 版本匹配的 Spring Data Redis 和 Lettuce。手工混入另一个 Lettuce 版本会绕过
这组兼容性管理，却不能增加本课需要的能力。

### 2. 属性前缀是两条线的真实差异

Spring Boot 4.1.x 使用 `spring.data.redis.*`：

```properties
spring.data.redis.host=${TEAMFLOW_REDIS_HOST:127.0.0.1}
spring.data.redis.port=${TEAMFLOW_REDIS_PORT:6379}
spring.data.redis.password=${TEAMFLOW_REDIS_PASSWORD:}
spring.data.redis.connect-timeout=2s
spring.data.redis.timeout=2s
teamflow.redis.probe-key=${TEAMFLOW_REDIS_PROBE_KEY:teamflow:integration:redis:modern:v1}
```

Spring Boot 2.3.12.RELEASE 使用 `spring.redis.*`：

```properties
spring.redis.host=${TEAMFLOW_REDIS_HOST:127.0.0.1}
spring.redis.port=${TEAMFLOW_REDIS_PORT:6379}
spring.redis.password=${TEAMFLOW_REDIS_PASSWORD:}
spring.redis.timeout=2s
teamflow.redis.probe-key=${TEAMFLOW_REDIS_PROBE_KEY:teamflow:integration:redis:java8:v1}
```

现代线的 `connect-timeout` 是建立连接的超时，`timeout` 是命令读超时；兼容线的同名
`spring.redis.timeout` 表示连接超时。它们不能因为名字相同就被描述成同一个合同。默认连接值只适合无密码
的本地服务，真实环境在运行时注入连接信息，不把真实密码提交到配置文件、输出或课程代码。两套工程也不要
同时写新旧前缀，否则错误前缀可能被忽略后又碰巧连接到本机默认端口，掩盖配置问题。

### 3. 注入自动配置的字符串模板

下面的构造器没有创建连接，只接收 Boot 已经创建好的模板：

```java
private final StringRedisTemplate redisTemplate;
private final String probeKey;

/** 保存 Boot 自动配置的字符串模板和当前工程的探针键。 */
public RedisIntegrationService(
        StringRedisTemplate redisTemplate,
        @Value("${teamflow.redis.probe-key}") String probeKey) {
    this.redisTemplate = redisTemplate;
    this.probeKey = probeKey;
}
```

**社区补充：** Spring Boot issue 41442 的真实故障中，应用自己声明了 `RedisConnectionFactory`，Boot 的
连接自动配置因此退让，原有 Redis 属性看起来“不再生效”。这个结论适用于手写工厂的条件；当前课程没有
拓扑或客户端定制需求，直接注入自动配置模板即可。若以后确实需要定制连接工厂，就必须同时承担全部连接
属性、SSL、超时和生命周期配置。

## 三、完成字符串写、读、查时与删除

### 1. 一次写入同时带上 TTL

服务使用由当前工程配置的独立键和 30 秒生命周期：

```java
private static final Duration PROBE_TTL = Duration.ofSeconds(30);

/** 写入带三十秒过期时间的探针值。 */
public void writeProbe(String value) {
    redisTemplate.opsForValue().set(probeKey, value, PROBE_TTL);
}
```

带 `Duration` 的 `set` 在同一条 Redis `SET` 中保存值与过期时间。这个调用在两条目标版本线都存在，
不需要为 Java 8 换回已经在现代 API 中弃用的 `long + TimeUnit` 重载。

### 2. 缺失与命中都从同一入口读取

```java
/** @return 当前探针值；key 不存在时返回 null */
public String readProbe() {
    return redisTemplate.opsForValue().get(probeKey);
}
```

不存在时返回 `null` 是数据结果，不是连接成功证明。若主机不可达、端口错误或密码错误，调用会抛出连接
相关异常，而不是安静地返回 `null`。后续缓存读取课才会决定这个缺失结果是否触发 MySQL 回源。

### 3. TTL 是服务端正在变化的状态

```java
/** @return 当前探针剩余秒数 */
public Long remainingSeconds() {
    return redisTemplate.getExpire(probeKey, TimeUnit.SECONDS);
}
```

写入 30 秒 TTL 后，第一次观察通常是 29 或 30，不能要求每次精确相等。返回值的含义是：

| 返回值 | 含义 | 本课如何判断 |
| ---: | --- | --- |
| 大于 0 | 键存在且仍会过期 | 写入成功后的预期 |
| `-1` | 键存在但没有过期时间 | 说明生命周期合同丢失 |
| `-2` | 键不存在 | 删除或自然到期后的预期 |

应用调用和第七章带完整连接参数的 `redis-cli TTL` 应观察到相同语义。

### 4. 删除只影响本课自己的键

```java
/** @return 本次是否删除了现存探针 */
public boolean deleteProbe() {
    return Boolean.TRUE.equals(redisTemplate.delete(probeKey));
}
```

第一次删除现存键返回 `true`，再次删除同一个缺失键返回 `false`。这不是错误；它表示第二次没有实际删除
任何键。删除后读取返回 `null`，TTL 返回 `-2`。

## 四、理解字符串序列化边界

### 1. Redis 保存的是字节，不是 Java 泛型

`RedisTemplate<K, V>` 的泛型约束 Java 调用面，真正决定 Redis 字节格式的是 key、value、hash key 和
hash value serializer。把字段声明成 `RedisTemplate<String, String>` 并不会自动把默认序列化器换成
字符串序列化器。

`StringRedisTemplate` 明确让四类 serializer 都使用字符串格式。现代应用输出
`probe-window-open=10s` 后，在窗口内执行：

```bash
docker exec teamflow-redis-integration \
  redis-cli -a course-pass --no-auth-warning \
  GET teamflow:integration:redis:modern:v1
```

得到可读的 `redis-connected`。这同时证明应用与 CLI 使用的是同一把字节键。

### 2. 默认通用模板可能写出另一把键

**社区补充：** Stack Overflow 67503106 的现象是 `RedisTemplate` 执行 SET 后，
`StringRedisTemplate` 和 CLI 却读不到。原因不是 SET 没有运行，而是默认 JDK 序列化把同一个 Java 字符串
编码成另一组字节。这个结论已由两版 Spring Data Redis 的默认 serializer 合同复核。

对象 value 需要显式冻结序列化格式、目标类型与升级兼容规则。现代线和兼容线的 Jackson Redis API 还存在
真实版本差异，所以本课不提供未经设计的“万能 JSON RedisTemplate”。

### 3. 键名也要成为稳定合同

两个探针键都由产品命名空间、用途、技术边界、版本线和格式版本组成。版本线只用于隔离并行反馈，不代表
业务数据模型。真实业务键还需要包含资源身份，例如项目 ID 或任务 ID，并限制外部输入长度与字符。当前探针
不携带用户输入，只用于证明连接和字节格式。

## 五、建立现代版完整工程

### 1. 工程文件

复制上一课的 `teamflow-project-task-persistence-modern`，并把副本命名为
`teamflow-redis-integration-modern`。原来的 `com.teamflow.api.TeamFlowApplication`、Controller、DTO、
MyBatis、Flyway 与迁移文件全部保留；本课只修改 POM、配置并新增两个 Redis 类：

```text
teamflow-redis-integration-modern/
├── pom.xml
└── src/main
    ├── java/com/teamflow/api
    │   ├── TeamFlowApplication.java              # 保留，不创建第二个启动类
    │   ├── ApiService.java                       # 保留 MySQL 与事务实现
    │   ├── persistence                           # 保留 Mapper 与配置
    │   └── redis
    │       ├── RedisIntegrationService.java      # 新建
    │       └── RedisIntegrationVerifier.java     # 新建
    └── resources
        ├── application.properties                # 增加 Redis 配置
        └── db/migration                          # 保留 V1、V2
```

新类放在启动类的子包中，已有组件扫描会发现它们；不能另建 `com.teamflow.redis` 启动类，否则默认扫描不会
覆盖 `com.teamflow.api` 中的 Controller 和持久化组件。

### 2. 现代版 POM 与配置

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
  <groupId>com.teamflow</groupId>
  <artifactId>teamflow-redis-integration-modern</artifactId>
  <version>1.0.0</version>
  <properties>
    <java.version>25</java.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-webmvc</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
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
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-flyway</artifactId>
    </dependency>
    <dependency>
      <groupId>org.flywaydb</groupId>
      <artifactId>flyway-mysql</artifactId>
    </dependency>
    <dependency>
      <groupId>com.mysql</groupId>
      <artifactId>mysql-connector-j</artifactId>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>org.springdoc</groupId>
      <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
      <version>3.1.0</version>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-redis</artifactId>
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

`application.properties`：

```properties
spring.application.name=teamflow-redis-integration-modern
server.port=${TEAMFLOW_PORT:18091}
spring.datasource.url=${TEAMFLOW_DB_URL}
spring.datasource.username=${TEAMFLOW_DB_USER}
spring.datasource.password=${TEAMFLOW_DB_PASSWORD}
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
springdoc.api-docs.version=OPENAPI_3_0
spring.data.redis.host=${TEAMFLOW_REDIS_HOST:127.0.0.1}
spring.data.redis.port=${TEAMFLOW_REDIS_PORT:6379}
spring.data.redis.password=${TEAMFLOW_REDIS_PASSWORD:}
spring.data.redis.connect-timeout=2s
spring.data.redis.timeout=2s
teamflow.redis.probe-key=${TEAMFLOW_REDIS_PROBE_KEY:teamflow:integration:redis:modern:v1}
```

### 3. 现代版 Java 源码

`RedisIntegrationService.java`：

```java
package com.teamflow.api.redis;

import java.time.Duration;
import java.util.concurrent.TimeUnit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/** 使用字符串序列化验证 TeamFlow 与 Redis 的最小连接。 */
@Service
public class RedisIntegrationService {
    private static final Duration PROBE_TTL = Duration.ofSeconds(30);
    private final StringRedisTemplate redisTemplate;
    private final String probeKey;

    /** 保存 Boot 自动配置的字符串模板和当前工程的探针键。 */
    public RedisIntegrationService(
            StringRedisTemplate redisTemplate,
            @Value("${teamflow.redis.probe-key}") String probeKey) {
        this.redisTemplate = redisTemplate;
        this.probeKey = probeKey;
    }

    /** 写入带三十秒过期时间的探针值。 */
    public void writeProbe(String value) {
        redisTemplate.opsForValue().set(probeKey, value, PROBE_TTL);
    }

    /** @return 当前探针值；key 不存在时返回 null */
    public String readProbe() {
        return redisTemplate.opsForValue().get(probeKey);
    }

    /** @return 当前探针剩余秒数 */
    public Long remainingSeconds() {
        return redisTemplate.getExpire(probeKey, TimeUnit.SECONDS);
    }

    /** @return 本次是否删除了现存探针 */
    public boolean deleteProbe() {
        return Boolean.TRUE.equals(redisTemplate.delete(probeKey));
    }
}
```

`RedisIntegrationVerifier.java`：

```java
package com.teamflow.api.redis;

import java.time.Duration;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/** 在应用启动时执行一次可观察的 Redis 连接反馈。 */
@Component
public class RedisIntegrationVerifier implements ApplicationRunner {
    private static final Duration OBSERVATION_WINDOW = Duration.ofSeconds(10);
    private final RedisIntegrationService service;

    /** 保存 Redis 集成服务。 */
    public RedisIntegrationVerifier(RedisIntegrationService service) {
        this.service = service;
    }

    /** 验证缺失、写入、读取、TTL 与删除，并留下 CLI 观察窗口。 */
    @Override
    public void run(ApplicationArguments arguments) throws InterruptedException {
        service.deleteProbe();
        System.out.println("missing=" + service.readProbe());
        service.writeProbe("redis-connected");
        System.out.println("hit=" + service.readProbe());
        System.out.println("ttl-seconds=" + service.remainingSeconds());
        System.out.println("probe-window-open=10s");
        Thread.sleep(OBSERVATION_WINDOW.toMillis());
        System.out.println("deleted=" + service.deleteProbe());
        System.out.println("after-delete=" + service.readProbe());
    }
}
```

## 六、建立 Java 8 兼容工程

### 1. 兼容版 POM 与配置

Java 8 工程使用真实旧父版本，但 Redis starter 不变：

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
  <groupId>com.teamflow</groupId>
  <artifactId>teamflow-redis-integration-java8</artifactId>
  <version>1.0.0</version>
  <properties>
    <java.version>1.8</java.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
      <groupId>com.baomidou</groupId>
      <artifactId>mybatis-plus-boot-starter</artifactId>
      <version>3.4.2</version>
    </dependency>
    <dependency>
      <groupId>org.flywaydb</groupId>
      <artifactId>flyway-core</artifactId>
    </dependency>
    <dependency>
      <groupId>mysql</groupId>
      <artifactId>mysql-connector-java</artifactId>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>org.springdoc</groupId>
      <artifactId>springdoc-openapi-ui</artifactId>
      <version>1.8.0</version>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-redis</artifactId>
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

```properties
spring.application.name=teamflow-redis-integration-java8
server.port=${TEAMFLOW_PORT:18092}
spring.datasource.url=${TEAMFLOW_DB_URL}
spring.datasource.username=${TEAMFLOW_DB_USER}
spring.datasource.password=${TEAMFLOW_DB_PASSWORD}
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.redis.host=${TEAMFLOW_REDIS_HOST:127.0.0.1}
spring.redis.port=${TEAMFLOW_REDIS_PORT:6379}
spring.redis.password=${TEAMFLOW_REDIS_PASSWORD:}
spring.redis.timeout=2s
teamflow.redis.probe-key=${TEAMFLOW_REDIS_PROBE_KEY:teamflow:integration:redis:java8:v1}
```

### 2. 兼容版 Java 源码保持同形

把现代工程的两个 Redis Java 文件原样放进兼容工程。`Duration` 从 Java 8 已经存在，两版 Spring Data Redis
也都有 `set(key, value, Duration)`；源码没有 record、文本块或其他 Java 8 缺失语法。因此兼容实现不是
删减版，而是同一控制流在旧依赖和旧配置前缀下编译运行。

兼容工程的完整文件清单是：

```text
teamflow-redis-integration-java8/
├── pom.xml
└── src/main
    ├── java/com/teamflow/api
    │   ├── TeamFlowApplication.java             # 保留 Java 8 Web 与 MyBatis 装配
    │   ├── ApiService.java                      # 保留 Java 8 持久化实现
    │   ├── persistence                          # 保留 Mapper 与配置
    │   └── redis
    │       ├── RedisIntegrationService.java     # 与第五章源码逐字相同
    │       └── RedisIntegrationVerifier.java    # 与第五章源码逐字相同
    └── resources
        ├── application.properties               # 使用 spring.redis 前缀
        └── db/migration                         # 保留 Java 8 的 V1、V2
```

两个新类与继承的 Java 8 Web/MySQL 文件共同构成完整兼容工程。不能只用 JDK 25 的 `--release 8` 代替真实
Java 8 运行时；旧 Boot、旧 Spring Data Redis 与旧 Lettuce 都需要在 Java 8 JVM 中实际装配。

## 七、从正常与失败路径观察结果

### 1. 启动独立 Redis

下面的密码仅用于可删除的本地学习实例：

```bash
docker run --name teamflow-redis-integration \
  -p 16379:6379 \
  -d redis:8-alpine \
  redis-server --requirepass course-pass

docker exec teamflow-redis-integration \
  redis-cli -a course-pass --no-auth-warning PING
```

第二条命令必须输出 `PONG`。若名称或 16379 端口已被占用，应选择新的本课专属值，不得停止未知容器。

### 2. 按顺序启动两套完整应用

保持上一课的 MySQL 8.4 容器和两个独立 schema，先从现代工程执行：

```bash
TEAMFLOW_DB_URL='jdbc:mysql://127.0.0.1:33318/teamflow_modern?useSSL=false&allowPublicKeyRetrieval=true' \
TEAMFLOW_DB_USER=teamflow \
TEAMFLOW_DB_PASSWORD=teamflow-pass \
TEAMFLOW_PORT=18091 \
TEAMFLOW_REDIS_HOST=127.0.0.1 \
TEAMFLOW_REDIS_PORT=16379 \
TEAMFLOW_REDIS_PASSWORD=course-pass \
mvn spring-boot:run
```

两套工程使用不同 HTTP 端口、MySQL schema 和默认探针键。现代应用输出
`probe-window-open=10s` 后，在另一个终端完成应用与 CLI 的交叉观察：

```bash
docker exec teamflow-redis-integration \
  redis-cli -a course-pass --no-auth-warning \
  GET teamflow:integration:redis:modern:v1

docker exec teamflow-redis-integration \
  redis-cli -a course-pass --no-auth-warning \
  TTL teamflow:integration:redis:modern:v1
```

第一条输出 `redis-connected`，第二条输出大于 0 且不超过 30。观察窗口结束后，Runner 输出形态为：

```text
missing=null
hit=redis-connected
ttl-seconds=<1 到 30 之间的整数>
probe-window-open=10s
deleted=true
after-delete=null
```

随后同时验证探针已删除、原任务查询 HTTP 合同仍然可用：

```bash
docker exec teamflow-redis-integration \
  redis-cli -a course-pass --no-auth-warning \
  EXISTS teamflow:integration:redis:modern:v1

curl -fsS \
  'http://localhost:18091/api/v1/projects/PRJ-1/tasks?status=TODO&pageSize=1' | jq
```

`EXISTS` 输出 `0`；`GET /api/v1/projects/PRJ-1/tasks` 的响应仍保留上一课的成功结构和任务字段。这个请求
不读写 Redis，它证明加入 starter、配置和探针后，已有 Controller、MySQL 与响应合同没有消失。

停止现代应用后，用真实 Java 8 从兼容工程执行：

```bash
TEAMFLOW_DB_URL='jdbc:mysql://127.0.0.1:33318/teamflow_java8?useSSL=false&allowPublicKeyRetrieval=true' \
TEAMFLOW_DB_USER=teamflow \
TEAMFLOW_DB_PASSWORD=teamflow-pass \
TEAMFLOW_PORT=18092 \
TEAMFLOW_REDIS_HOST=127.0.0.1 \
TEAMFLOW_REDIS_PORT=16379 \
TEAMFLOW_REDIS_PASSWORD=course-pass \
mvn spring-boot:run
```

兼容线重复相同反馈环，但 CLI 键改为 `teamflow:integration:redis:java8:v1`，HTTP 端口改为 `18092`。
即使并行启动，两条线也不会删除对方的探针；按顺序执行更便于归属日志和失败。

### 3. 错误凭据必须真实失败

停止正常应用后，现代工程使用完整环境重新启动，只把 Redis 密码改错：

```bash
TEAMFLOW_DB_URL='jdbc:mysql://127.0.0.1:33318/teamflow_modern?useSSL=false&allowPublicKeyRetrieval=true' \
TEAMFLOW_DB_USER=teamflow \
TEAMFLOW_DB_PASSWORD=teamflow-pass \
TEAMFLOW_PORT=18091 \
TEAMFLOW_REDIS_HOST=127.0.0.1 \
TEAMFLOW_REDIS_PORT=16379 \
TEAMFLOW_REDIS_PASSWORD=wrong-pass \
mvn spring-boot:run
```

Java 8 工程把 schema 和端口切回兼容线，其余失败条件相同：

```bash
TEAMFLOW_DB_URL='jdbc:mysql://127.0.0.1:33318/teamflow_java8?useSSL=false&allowPublicKeyRetrieval=true' \
TEAMFLOW_DB_USER=teamflow \
TEAMFLOW_DB_PASSWORD=teamflow-pass \
TEAMFLOW_PORT=18092 \
TEAMFLOW_REDIS_HOST=127.0.0.1 \
TEAMFLOW_REDIS_PORT=16379 \
TEAMFLOW_REDIS_PASSWORD=wrong-pass \
mvn spring-boot:run
```

两条命令都应以非零状态失败，异常链包含 `RedisConnectionFailureException` 和 Redis 的 `WRONGPASS`。这
说明 Runner 确实发送了 Redis 命令；仅让 Spring 容器创建 Bean 而从不访问 Redis，可能直到第一个真实请求
才暴露错误凭据。

### 4. 本课集成到 TeamFlow 的位置

把依赖、当前版本的属性和 `RedisIntegrationService` 合入上一课工程，已有 MySQL Service 仍拥有业务状态。
验证 Runner 是学习反馈入口，不新增公开 API；既有任务 GET 只用于证明 Web/MySQL 合同仍可请求。确认连接后
可以删除 Runner，保留 Service 作为后续课程的起点。下一课才会为任务查询定义 cache-aside 读取时间线；
当前课不提前改写查询、响应或事务方法。

## 八、集中排查三个集成错误

### 三个典型错误

:::pitfalls
### 在现代工程中继续使用旧属性前缀

**触发条件：** Spring Boot 4.1 工程把 Redis 主机和端口写在 `spring.redis.*` 下。

**原因：** 现代线的配置属性已经迁移到 `spring.data.redis.*`，旧前缀不会绑定到当前连接属性。

**后果：** 应用可能回退到默认 `localhost:6379`，表现为连错实例或拒绝连接。

**错误示例：**

```properties
spring.redis.host=redis.internal
spring.redis.port=6380
```

**正确写法：**

```properties
spring.data.redis.host=redis.internal
spring.data.redis.port=6380
```

**影响版本：** 错误示例针对 Spring Boot 4.1.x；Boot 2.3.12.RELEASE 仍使用旧前缀。

**验证方式：** 在非默认主机或端口启动 Redis；现代正确配置应得到 PONG 和完整探针输出，旧前缀应显示它
尝试连接默认地址，不能把这个失败误报为 Redis Server 故障。

### 只改泛型就假定 Redis 使用字符串字节

**触发条件：** 注入通用 `RedisTemplate` 后只把泛型写成 String，并期望 CLI 直接读取普通字符串键。

**原因：** 泛型不配置 serializer；默认通用模板仍可能使用 JDK 序列化。

**后果：** SET 已经执行，但 `redis-cli GET name` 或字符串模板读不到另一组字节表示的键。

**错误示例：**

```java
RedisTemplate<String, String> template = redisTemplate;
template.opsForValue().set("name", "TeamFlow");
```

**正确写法：**

```java
StringRedisTemplate template = stringRedisTemplate;
template.opsForValue().set("name", "TeamFlow");
```

**影响版本：** 两条目标版本线都适用。

**验证方式：** 用两种模板分别写入独立键，再从 CLI 读取；字符串模板键可直接命中，通用默认模板产生的
字节键需要按其 serializer 解码。不要用 `KEYS *` 扫描共享实例。

### 先设过期时间再覆盖写入值

**触发条件：** 对现存键先调用 expire，再用普通 set 覆盖值。

**原因：** Redis 普通 SET 会清除键上原有的过期时间。

**后果：** 值更新成功，但 TTL 变成 `-1`，课程探针不会自然回收。

**错误示例：**

```java
redisTemplate.expire(probeKey, 30, TimeUnit.SECONDS);
redisTemplate.opsForValue().set(probeKey, value);
```

**正确写法：**

```java
redisTemplate.opsForValue().set(probeKey, value, Duration.ofSeconds(30));
```

**影响版本：** 两条目标版本线与 Redis Open Source 都适用。

**验证方式：** 错误写法完成后查询 TTL 应为 `-1`；删除键并执行正确写法，TTL 应大于 0 且不超过 30，
自然到期后应为 `-2`。
:::

## 九、独立练习

:::exercise
### 验证短生命周期的 Redis 键

**要求：** 在当前版本工程中新建 RedisExpiryExercise，使用自动配置的 StringRedisTemplate 写入课程专属键
`teamflow:exercise:redis-expiry:v1` 和值 `five-seconds`，TTL 为五秒。写入后输出值和 TTL，等待六秒后再次
输出值与 TTL，最后定向删除该键。不得使用 FLUSHALL、KEYS *、缓存注解或自定义连接工厂。

**验收：** JDK 25 与 Java 8 工程都能编译运行；写入后 value 为 five-seconds，TTL 大于 0 且不超过 5；
六秒后 value 为 null、TTL 为 -2；错误密码启动时应用非零退出并包含 WRONGPASS。

**参考答案：** 完整参考实现见下一小节。
:::

### 1. 完整参考实现

```java
package com.teamflow.api.redis;

import java.time.Duration;
import java.util.concurrent.TimeUnit;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

/** 验证短生命周期字符串键的写入与自然到期。 */
@Component
public class RedisExpiryExercise implements ApplicationRunner {
    private static final String KEY = "teamflow:exercise:redis-expiry:v1";
    private final StringRedisTemplate redisTemplate;

    /** 保存自动配置的字符串模板。 */
    public RedisExpiryExercise(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /** 写入五秒键，并观察写入后与自然到期后的状态。 */
    @Override
    public void run(ApplicationArguments arguments) throws InterruptedException {
        redisTemplate.delete(KEY);
        redisTemplate.opsForValue().set(KEY, "five-seconds", Duration.ofSeconds(5));

        System.out.println("value-now=" + redisTemplate.opsForValue().get(KEY));
        System.out.println(
                "ttl-now=" + redisTemplate.getExpire(KEY, TimeUnit.SECONDS));

        Thread.sleep(Duration.ofSeconds(6).toMillis());

        System.out.println("value-later=" + redisTemplate.opsForValue().get(KEY));
        System.out.println(
                "ttl-later=" + redisTemplate.getExpire(KEY, TimeUnit.SECONDS));
        redisTemplate.delete(KEY);
    }
}
```

这份源码在两条版本线保持相同，分别放进第五、六章的工程。验证输出形态为：

```text
value-now=five-seconds
ttl-now=<1 到 5 之间的整数>
value-later=null
ttl-later=-2
```

### 2. 结果为什么不是固定秒数

SET 与第一条 TTL 查询之间已经经过网络往返和日志输出，所以剩余时间可能从 5 变为 4。验收只要求正数且
不超过初始值。等待六秒覆盖五秒 TTL 后，Redis 应把键视为不存在，读取返回 `null`，TTL 返回 `-2`。

### 3. 自我检查

1. 为什么 `missing=null` 不能单独证明 Redis 连接成功？
2. 为什么现代版与兼容版不能共用同一个属性前缀？
3. 为什么 `RedisTemplate<String, String>` 不一定让 CLI 直接读到普通字符串键？
4. 为什么 TTL 验收使用范围，而不是断言精确等于 30 或 5？
5. 把普通 SET 放在 expire 之后会怎样改变服务端状态？
6. 当前 Service 为什么没有在 Redis 缺失时查询 MySQL？

## 十、本课小结

Spring Boot Redis 集成的最小正确边界由依赖、属性、自动配置模板、字节格式和真实服务端反馈共同组成。
两条版本线使用同一个 Redis starter 和同形 Java 服务，现代线使用 `spring.data.redis`，兼容线使用
`spring.redis`。`StringRedisTemplate` 明确冻结字符串序列化，带 `Duration` 的 SET 同时保存值与 TTL；
正 TTL、可读值、定向删除和 `-2` 共同证明状态变化。

连接错误不会伪装成 `null` 未命中。错误凭据必须产生非零退出和 `WRONGPASS`，而正常路径要从应用与 CLI
两侧观察同一键。完成这条反馈环后，TeamFlow 才拥有可供后续缓存读取使用的 Redis 接入点；数据库仍是真相
源，缓存读取、失效、验证码和幂等都尚未开始。
