---
id: backend.java.learn.intermediate.health-checks-and-graceful-shutdown
type: lesson
title: 健康检查与优雅停机
summary: 用 Spring Boot Actuator 区分健康、存活与就绪状态，并在收到终止信号时让服务先摘流再完成在途请求
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 150
prerequisites:
  - backend.java.learn.intermediate.logging-and-observability
objectives:
  - 能使用 Actuator 暴露 health、liveness 和 readiness 端点，并解释 200 与 503 的状态映射。
  - 能区分 liveness 表示自我恢复能力、readiness 表示接收流量能力以及普通 health 的汇总用途。
  - 能解释 Application Availability 从启动到就绪、再到停机拒流的状态变化。
  - 能为 liveness 和 readiness 选择合适的依赖，避免把外部故障变成级联重启。
  - 能在 Spring Boot 4.1 与 2.3.12 中分别配置探针和优雅停机，并识别属性差异。
  - 能用 SIGTERM 验证在途请求、拒绝新请求和停机超时，而不是依赖 IDE 停止按钮。
  - 能识别暴露全部端点、复制错误版本属性和硬编码拒绝状态码等交付风险。
recap:
  - Actuator 端点同时受启用和暴露控制；health 的 UP 通常映射 200，DOWN 与 OUT_OF_SERVICE 映射 503，详情默认不展示。
  - liveness 只回答应用内部能否继续工作，不应依赖数据库、Redis 或其他外部服务；readiness 回答当前是否接收流量。
  - 启动和停机由 Application Availability 发布状态，优雅停机先把 readiness 置为拒流，再等待在途请求或达到宽限期。
  - Spring Boot 4.1 默认启用优雅停机并支持主端口 `/livez`、`/readyz`；Boot 2.3 需要显式开启 graceful 和探针，不能使用后续版本属性。
  - 真正的停机反馈环使用 `java -jar` 与 `kill -TERM`，新请求的具体拒绝表现由 Web 服务器决定。
related:
  - backend.java.learn.intermediate.logging-and-observability
tags:
  - Java
  - Spring Boot
  - Actuator
  - Health
  - Liveness
  - Readiness
  - Graceful Shutdown
  - 优雅停机
appliesTo: JDK 25 / Spring Boot 4.1.1 主线；Java 8 / Spring Boot 2.3.12.RELEASE 兼容线
verifiedAt: 2026-08-30
sources:
  - id: spring-boot-41-actuator-enabling
    title: Spring Boot Actuator Enabling
    url: https://docs.spring.io/spring-boot/reference/actuator/enabling.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.x
    claims:
      - "添加 `spring-boot-starter-actuator` 后可以使用生产就绪端点。"
      - Actuator 端点的启用和暴露是两个独立配置面。
  - id: spring-boot-41-actuator-endpoints
    title: Spring Boot Actuator Endpoints and Kubernetes Probes
    url: https://docs.spring.io/spring-boot/reference/actuator/endpoints.html#actuator.endpoints.kubernetes-probes
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.x
    claims:
      - health、liveness 和 readiness 端点的路径、状态组和 HTTP 状态映射。
      - "`add-additional-paths` 可以在主端口暴露 `/livez` 和 `/readyz`。"
      - 健康详情默认不展示，DOWN 和 OUT_OF_SERVICE 默认映射为 503。
  - id: spring-boot-41-application-availability
    title: Spring Boot Application Availability
    url: https://docs.spring.io/spring-boot/reference/features/spring-application.html#features.spring-application.application-availability
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.x
    claims:
      - Application Availability 使用 LivenessState 和 ReadinessState 描述应用可用性。
      - 启动、就绪和停机阶段会改变应用是否接受流量的状态。
  - id: spring-boot-41-graceful-shutdown
    title: Spring Boot Graceful Shutdown
    url: https://docs.spring.io/spring-boot/reference/web/graceful-shutdown.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.x
    claims:
      - 支持的 Web 服务器在宽限期内停止接收新请求并等待在途请求。
      - "`spring.lifecycle.timeout-per-shutdown-phase` 控制停机阶段的等待时间。"
      - "`server.shutdown=immediate` 可以关闭优雅停机。"
  - id: spring-boot-41-system-requirements
    title: Spring Boot System Requirements
    url: https://docs.spring.io/spring-boot/system-requirements.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.x
    claims:
      - Spring Boot 4.1 至少需要 Java 17，并兼容 Java 25。
  - id: spring-boot-2312-reference
    title: Spring Boot 2.3.12 Reference
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/htmlsingle/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - 2.3 版本的 Kubernetes probes、Actuator 健康状态和优雅停机配置位于归档参考文档。
      - "非 Kubernetes 环境需要显式打开健康探针，优雅停机需要 `server.shutdown=graceful`。"
  - id: spring-boot-2312-system-requirements
    title: Spring Boot 2.3.12 System Requirements
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#system-requirements
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Spring Boot 2.3.12 支持 Java 8 至 Java 15。
  - id: spring-boot-probes-announcement
    title: Liveness and Readiness Probes with Spring Boot
    url: https://spring.io/blog/2020/03/25/liveness-and-readiness-probes-with-spring-boot
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.x
    claims:
      - Spring Boot 2.3 引入 liveness 和 readiness 探针支持及对应状态语义。
---

# 健康检查与优雅停机

服务返回一次成功响应，只能说明那次调用结束了。发布系统还需要回答两个更窄的问题：这个进程是否仍能自我工作，
以及它现在是否适合接收新流量。进程收到终止信号时，也不能把已有请求直接截断，否则客户端会看到半个响应，数据库或
外部调用可能停在中间状态。

本课把这两个问题连接成一条可验证的运行反馈环：用 Actuator 提供健康端点，用 liveness 和 readiness 表达不同状态，
再用优雅停机在关闭前摘除流量。Kubernetes Deployment、容器镜像、复杂自定义 `HealthIndicator` 和 Actuator 安全认证
留给后续课程。

## 一、用健康状态回答“能否接流量”

### 1. health 端点是一个有状态映射的 HTTP 接口

引入 `spring-boot-starter-actuator` 后，Spring Boot 可以创建生产就绪端点。端点还要经过两个独立决策：功能是否启用，
以及 Web 传输是否暴露。只配置其中一个不能保证客户端能够访问。

默认健康地址是 `/actuator/health`。Actuator 先收集健康组件的状态，再把总体状态映射为 HTTP 响应。常见合同如下：

| 总体状态 | 默认 HTTP 状态 | 含义 |
| --- | --- | --- |
| `UP` | `200` | 当前检查没有报告故障 |
| 未映射状态 | `200` | 状态存在，但没有被配置为失败 |
| `DOWN` | `503` | 服务不适合继续提供请求 |
| `OUT_OF_SERVICE` | `503` | 服务主动摘流或处于维护状态 |

`management.endpoint.health.show-details` 默认是 `never`。因此外部探针通常只能看到类似
`{"status":"UP"}` 的摘要，不能从公开响应中直接读取数据库主机、异常消息或连接池细节。诊断详情应通过受控的内部边界
提供，而不是把 `show-details=always` 当成调试开关长期部署。

### 2. liveness 和 readiness 不是两个同义的 health URL

健康汇总适合回答“检查结果总体怎样”，而两个探针分别服务于不同的自动化动作：

| 信号 | 主要问题 | 可以依赖 | 不应依赖 |
| --- | --- | --- | --- |
| liveness | 进程还能否继续工作或自行恢复 | JVM、应用内部状态、不可恢复错误 | 数据库、Redis、远程 HTTP 等外部服务 |
| readiness | 当前是否应接收新流量 | 已完成启动、关键路由可接收请求、谨慎的外部依赖 | 与流量无关的低优先级检查 |

如果每个实例的 liveness 都检查同一台数据库，数据库短暂故障会让所有实例同时被重启，重启又会放大数据库压力。这是
级联故障，不是更严格的健康检查。外部依赖更适合影响 readiness，或者由专门的业务降级和告警处理。

探针组的路径是 `/actuator/health/liveness` 和 `/actuator/health/readiness`。两者仍属于 Actuator Web 端点，不能因为
名称中有 probe 就绕过端点暴露和网络访问控制。

### 3. 主端口和管理端口必须一起考虑

当 Actuator 使用单独的管理端口时，管理端口返回 `UP` 只说明管理端口可达，不能证明主应用端口还能够接受业务请求。
Spring Boot 4.1 可以通过下面的配置在主端口额外暴露 `/livez` 和 `/readyz`：

```properties
management.endpoint.health.probes.add-additional-paths=true
```

这两个路径只是同一探针状态的另一种入口，不会创造第三套健康语义。Spring Boot 2.3.12 的官方配置没有这个属性，旧版
示例应继续访问 `/actuator/health/liveness` 和 `/actuator/health/readiness`，或明确把 Actuator 端口纳入网络检查。

## 二、状态从启动走向停机

### 1. Application Availability 描述的是流量资格

Spring Boot 用 `LivenessState` 和 `ReadinessState` 表示应用可用性。可以把典型生命周期理解为：

```text
启动中       BROKEN / REFUSING_TRAFFIC
Context 启动 CORRECT / REFUSING_TRAFFIC
应用就绪     CORRECT / ACCEPTING_TRAFFIC
优雅停机     CORRECT / REFUSING_TRAFFIC
进程结束     服务不存在
```

这里的两个状态维度相互独立。应用在优雅停机时仍然是 `CORRECT`，因为它没有“坏掉”；它只是明确拒绝新流量，让已有请求
有机会完成。反过来，一个 liveness 正常但 readiness 拒绝流量的实例，通常应被负载均衡器暂时摘除，而不是被重启。

### 2. readiness 状态可以主动切换

示例应用可以用 `AvailabilityChangeEvent` 演示主动摘流。下面的代码只用于课程演示，生产应用应把状态变更放在明确的
启动、维护或依赖协调边界中，而不是开放任意运维接口。

```java
import org.springframework.boot.availability.AvailabilityChangeEvent;
import org.springframework.boot.availability.ReadinessState;
import org.springframework.context.ApplicationContext;

/** 演示如何发布一个拒绝新流量的就绪状态。 */
public final class ReadinessSwitch {
    /**
     * 发布拒绝流量事件，让 readiness 健康组映射为失败状态。
     */
    public static void refuseTraffic(ApplicationContext applicationContext) {
        AvailabilityChangeEvent.publish(applicationContext, ReadinessState.REFUSING_TRAFFIC);
    }
}
```

事件发布后，readiness 端点的总体状态会变成 `OUT_OF_SERVICE`，默认响应为 `503`；liveness 不会因为这个动作自动变成
`DOWN`。恢复时发布 `ReadinessState.ACCEPTING_TRAFFIC`，端点回到 `200`。这个变化体现了“摘流”和“进程坏掉”是两个
不同动作。

### 3. 健康检查的失败不等于业务异常栈

健康端点是一个对外状态合同。它需要短、稳定、低敏，适合探针和负载均衡器消费；日志、指标和追踪才负责解释“为什么”。
本课不在健康响应中回显异常消息，也不把每次探针访问都升级为 ERROR 日志。上一课的结构化日志可以记录状态转换和耗时，
但不应把健康端点变成另一个敏感诊断出口。

## 三、配置最小可用探针

### 1. 现代线先添加 Actuator 依赖

现代工程使用 JDK 25 与 Spring Boot 4.1.1。`spring-boot-starter-web` 提供 HTTP 服务器，Actuator starter 提供健康
端点。完整 POM 在后文，最小依赖片段如下：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

### 2. 现代线显式写出探针合同

```properties
management.endpoints.web.exposure.include=health
management.endpoint.health.probes.enabled=true
management.endpoint.health.probes.add-additional-paths=true
management.endpoint.health.show-details=never
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=10s
```

Boot 4.1 默认已经启用优雅停机和探针组，这里仍然显式写出是为了让配置意图可读、可审查。`server.shutdown=graceful` 与
超时属性分别表达“采用哪种关闭方式”和“每个生命周期阶段最多等待多久”，不能把十秒误解成所有请求都固定十秒后结束。

### 3. Java 8 兼容线只替换真实差异

Boot 2.3.12 的兼容工程使用 Java 8。探针在本地非 Kubernetes 环境需要显式打开，优雅停机也必须显式指定：

```properties
management.endpoints.web.exposure.include=health
management.endpoint.health.probes.enabled=true
management.endpoint.health.show-details=never
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=10s
```

旧线不要复制 `management.endpoint.health.probes.add-additional-paths`。该属性属于后续版本的主端口辅助路径能力，不是
Java 8 的语法问题，而是 Spring Boot 版本合同不同。旧线继续使用 `/actuator/health/liveness` 和
`/actuator/health/readiness`。

## 四、优雅停机不是立即杀进程

### 1. 关闭顺序先拒绝新请求

收到关闭信号后，支持的 Web 服务器会进入停止流程：应用的 readiness 变成 `REFUSING_TRAFFIC`，服务器不再接受新的
请求，同时给已经开始处理的请求一个宽限期。宽限期结束仍未完成的请求会被终止，ApplicationContext 随后关闭，进程退出。

因此，优雅停机保证的是一个有限的机会窗口，不是“所有请求无论多久都一定成功”。超时值应结合业务请求的上界设置，不能
用无限等待掩盖失控的下游调用。

### 2. SIGTERM 才能验证真实生命周期

建议用 `java -jar` 启动可执行 JAR，记录 PID 后执行 `kill -TERM <pid>`。IDE 的停止按钮可能直接结束进程、发送不同的
信号或跳过应用的关闭钩子，所以不能把一次 IDE 停止当作优雅停机证据。

宽限期内新请求的具体表现由 Web 服务器决定，可能是连接在网络层被拒绝，也可能是某个状态码或响应头。课程验证应记录
实际表现并断言“新请求不再进入业务处理”，不要把某一个服务器版本的状态码写成所有服务器都必须返回的统一答案。

### 3. immediate 是明确的反例配置

```properties
server.shutdown=immediate
```

这会关闭优雅停机，关闭流程不再为在途请求提供同样的等待窗口。它适合对照实验或明确要求快速退出的场景，不应在需要
完成写操作的 Web 服务中无意间启用。

## 五、集中排查常见错误

### 五个典型错误

:::pitfalls
### 把所有 Actuator 端点公开

**触发条件：** 为了让探针工作，把 `management.endpoints.web.exposure.include` 设置为 `*`，并把管理端口直接暴露到公网。

**原因：** 端点暴露决定哪些运维能力可以通过 HTTP 访问，和健康检查本身不是一回事；额外端点可能返回环境、配置或运行信息。

**后果：** 攻击面扩大，敏感运行信息可能被未授权调用者读取，探针需求也无法解释为什么需要其他端点。

**错误示例：**

```properties
management.endpoints.web.exposure.include=*
```

**正确写法：**

```properties
management.endpoints.web.exposure.include=health
```

**影响版本：** Spring Boot 2.3.12 与 4.1.x。

**验证方式：** 启动应用后请求 `/actuator/health` 应成功，请求未列入暴露清单的端点不应因为探针配置而自动出现。

### 让 liveness 依赖数据库

**触发条件：** 自定义存活检查每次都查询 MySQL 或 Redis，并把连接失败直接转换成 liveness `DOWN`。

**原因：** liveness 的失败通常会触发重启；外部依赖故障可能同时影响全部实例，重启不能修复外部故障。

**后果：** 实例被同时重启，连接风暴扩大原有故障，最终没有实例继续提供服务。

**错误示例：**

```java
/** 不要把外部依赖失败直接作为 liveness 失败。 */
public boolean liveness() {
    return jdbcTemplate.queryForObject("select 1", Integer.class) == 1;
}
```

**正确写法：**

```java
/** liveness 只观察本地、可自我恢复的状态。 */
public boolean liveness() {
    return !stopped && workerThread.isAlive();
}
```

**影响版本：** Spring Boot 2.3.12 与 4.1.x；这是探针设计边界，不是某个数据库驱动的特性。

**验证方式：** 让数据库暂时不可用，确认 liveness 仍保持可用；再单独观察 readiness 或业务降级对外部依赖的反馈。

### 把现代主端口属性复制到 Boot 2.3

**触发条件：** 在兼容工程中加入 `management.endpoint.health.probes.add-additional-paths=true`，然后断言 `/livez` 一定存在。

**原因：** 该辅助路径属性不属于 Boot 2.3 的探针配置合同，旧版本地探针需要显式启用并使用 Actuator 路径。

**后果：** 旧版示例可能忽略真正可访问的探针，验证脚本把不存在的路径当成应用故障，版本迁移边界也被掩盖。

**错误示例：**

```properties
management.endpoint.health.probes.add-additional-paths=true
```

**正确写法：**

```properties
management.endpoint.health.probes.enabled=true
```

**影响版本：** 仅针对 Spring Boot 2.3.12 兼容线；Boot 4.1 可以使用该属性。

**验证方式：** Boot 2.3 请求 `/actuator/health/liveness` 与 `/actuator/health/readiness`，不要把 `/livez` 当作旧版必需路径。

### 用 IDE 停止按钮证明优雅停机

**触发条件：** 在 IDE 中点击停止，看到进程消失，就声称在途请求已经完成且 readiness 先拒流。

**原因：** IDE 的停止动作不一定发送应用能处理的 SIGTERM，进程可能被直接终止。

**后果：** 验证没有观察到真实的关闭顺序，半响应、未提交写入和连接清理问题可能直到部署才暴露。

**错误示例：**

```text
点击 IDE 的 Stop，然后只检查 Java 进程不存在。
```

**正确写法：**

```bash
java -jar app.jar &
app_pid=$!
kill -TERM "$app_pid"
wait "$app_pid"
```

**影响版本：** Spring Boot 2.3.12 与 4.1.x。

**验证方式：** 在 `kill -TERM` 前启动慢请求，记录慢请求是否在宽限期内结束，并确认停机后进程退出。

### 把新请求拒绝写成固定 503

**触发条件：** 测试或监控只接受优雅停机期间的 HTTP 503，并把其他结果判定为失败。

**原因：** 不同 Web 服务器可能在网络层关闭连接、返回不同状态或增加特定响应头；Spring Boot 只规定不再接受新请求的语义。

**后果：** 测试在换服务器或升级版本后误报，团队为了满足错误断言而添加不必要的拦截器。

**错误示例：**

```java
assertThat(response.statusCode()).isEqualTo(503);
```

**正确写法：**

```java
assertThat(requestWasAcceptedByBusinessHandler()).isFalse();
```

**影响版本：** Spring Boot 支持的 Servlet 和 Reactive Web 服务器均可能有表现差异。

**验证方式：** 记录实际连接或响应结果，同时用业务计数器确认停机窗口内的新请求没有进入 Controller。
:::

## 六、独立练习

:::exercise
### 为任务服务建立健康与停机反馈环

**要求：** 创建现代线与 Java 8 兼容线两个独立的 Spring Boot 工程。加入 Web 与 Actuator，实现 `GET /slow`，让它记录累计接收数、等待约五秒，再在响应中返回结束时的累计值；只暴露 `health`，打开 liveness/readiness，并把健康详情保持为 `never`。现代线额外暴露 `/livez` 和 `/readyz`。为优雅停机配置十秒宽限期，兼容线显式声明 `server.shutdown=graceful`。不要加入 Kubernetes YAML、数据库查询或自定义外部依赖健康检查。

**验收：** 启动后三个 Actuator 健康地址都返回 200 且正文状态为 `UP`；现代线的两个主端口辅助路径也返回 200。用 `java -jar` 启动并向 `/slow` 发起请求，再发送 `SIGTERM`；观察 readiness 变为 503 或主端口关闭后，重新请求 `/slow`。在途请求应在宽限期内完成且累计值仍为 1，新请求不得进入业务方法，进程最终退出。分别记录两条版本线的属性差异。

**参考答案：** 参考实现位于下面的现代线和 Java 8 兼容线章节；现代线使用 `add-additional-paths`，兼容线只使用 Actuator 探针路径，二者均以 `spring.lifecycle.timeout-per-shutdown-phase=10s` 设置宽限期。
:::

## 七、现代线完整实现

### 1. Maven 工程和配置

创建一个新的 Maven 工程，Project SDK、模块 SDK 和 Maven Runner JRE 都设为 JDK 25。创建 `pom.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>4.1.1</version>
        <relativePath/>
    </parent>
    <groupId>example.health</groupId>
    <artifactId>health-demo-modern</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <properties>
        <java.version>25</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
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

创建 `src/main/resources/application.properties`：

```properties
management.endpoints.web.exposure.include=health
management.endpoint.health.probes.enabled=true
management.endpoint.health.probes.add-additional-paths=true
management.endpoint.health.show-details=never
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=10s
```

### 2. 编写可观察的 HTTP 入口

创建 `src/main/java/example/health/HealthDemoApplication.java`：

```java
package example.health;

import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.availability.AvailabilityChangeEvent;
import org.springframework.boot.availability.ReadinessState;
import org.springframework.context.ApplicationContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

/** 健康探针与优雅停机演示应用。 */
@SpringBootApplication
public class HealthDemoApplication {
    /** 启动 Spring Boot 应用。 */
    public static void main(String[] args) {
        SpringApplication.run(HealthDemoApplication.class, args);
    }

    /** 提供可观察的慢请求和就绪状态切换入口。 */
    @RestController
    static class DemoController {
        private final ApplicationContext applicationContext;
        private final AtomicInteger acceptedSlowRequests = new AtomicInteger();

        /** 注入用于发布就绪状态的应用上下文。 */
        DemoController(ApplicationContext applicationContext) {
            this.applicationContext = applicationContext;
        }

        /** 等待五秒后返回，用于观察停机宽限期内的在途请求。 */
        @GetMapping("/slow")
        ResponseEntity<String> slow() throws InterruptedException {
            acceptedSlowRequests.incrementAndGet();
            Thread.sleep(5000L);
            return ResponseEntity.ok("slow-finished; accepted=" + acceptedSlowRequests.get());
        }

        /** 把当前应用标记为暂时拒绝新流量。 */
        @PostMapping("/ops/readiness/refuse")
        ResponseEntity<String> refuseTraffic() {
            AvailabilityChangeEvent.publish(applicationContext, ReadinessState.REFUSING_TRAFFIC);
            return ResponseEntity.ok("readiness-refusing");
        }

        /** 恢复当前应用的接流量状态。 */
        @PostMapping("/ops/readiness/accept")
        ResponseEntity<String> acceptTraffic() {
            AvailabilityChangeEvent.publish(applicationContext, ReadinessState.ACCEPTING_TRAFFIC);
            return ResponseEntity.ok("readiness-accepting");
        }
    }
}
```

这里的两个 `/ops` 入口只为本地复现 readiness 变化，实际项目应把它们放入受保护的运维边界。`/slow` 先增加已接收计数，
再等待五秒并返回结束时的累计值；停机过程中如果第二个请求进入这个方法，首个响应就会显示 `accepted=2`，因此计数可以直接
证明新请求是否进入业务处理。

### 3. 运行结果

在工程根目录执行：

```bash
mvn spring-boot:run
```

另开终端请求健康端点：

```bash
curl -i http://127.0.0.1:8080/actuator/health
curl -i http://127.0.0.1:8080/actuator/health/liveness
curl -i http://127.0.0.1:8080/actuator/health/readiness
curl -i http://127.0.0.1:8080/livez
curl -i http://127.0.0.1:8080/readyz
```

正常运行时五个请求都应返回 `200`，JSON 只展示 `status` 摘要。再切换 readiness：

```bash
curl -i -X POST http://127.0.0.1:8080/ops/readiness/refuse
curl -i http://127.0.0.1:8080/actuator/health/readiness
curl -i http://127.0.0.1:8080/actuator/health/liveness
curl -i -X POST http://127.0.0.1:8080/ops/readiness/accept
```

第二个请求应返回 `503` 且状态为 `OUT_OF_SERVICE`；liveness 仍是 `200`，恢复后 readiness 回到 `200`。这组结果证明
拒绝流量不等于进程已经失活。

## 八、Java 8 兼容线完整实现

### 1. 只替换版本相关配置

兼容工程使用 Java 8、Spring Boot 2.3.12.RELEASE。创建 `pom.xml`：

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
    <groupId>example.health</groupId>
    <artifactId>health-demo-legacy</artifactId>
    <version>0.0.1-SNAPSHOT</version>
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
            <artifactId>spring-boot-starter-actuator</artifactId>
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

创建 `src/main/resources/application.properties`。旧版没有主端口辅助路径属性：

```properties
management.endpoints.web.exposure.include=health
management.endpoint.health.probes.enabled=true
management.endpoint.health.show-details=never
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=10s
```

### 2. 使用 Java 8 可编译的同一业务入口

创建 `src/main/java/example/health/HealthDemoApplication.java`：

```java
package example.health;

import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.availability.AvailabilityChangeEvent;
import org.springframework.boot.availability.ReadinessState;
import org.springframework.context.ApplicationContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

/** Java 8 与 Spring Boot 2.3.12 的健康探针演示应用。 */
@SpringBootApplication
public class HealthDemoApplication {
    /** 启动 Spring Boot 应用。 */
    public static void main(String[] args) {
        SpringApplication.run(HealthDemoApplication.class, args);
    }

    /** 提供可观察的慢请求和就绪状态切换入口。 */
    @RestController
    static class DemoController {
        private final ApplicationContext applicationContext;
        private final AtomicInteger acceptedSlowRequests = new AtomicInteger();

        /** 注入用于发布就绪状态的应用上下文。 */
        DemoController(ApplicationContext applicationContext) {
            this.applicationContext = applicationContext;
        }

        /** 等待五秒后返回，用于观察停机宽限期内的在途请求。 */
        @GetMapping("/slow")
        ResponseEntity<String> slow() throws InterruptedException {
            acceptedSlowRequests.incrementAndGet();
            Thread.sleep(5000L);
            return ResponseEntity.ok("slow-finished; accepted=" + acceptedSlowRequests.get());
        }

        /** 把当前应用标记为暂时拒绝新流量。 */
        @PostMapping("/ops/readiness/refuse")
        ResponseEntity<String> refuseTraffic() {
            AvailabilityChangeEvent.publish(applicationContext, ReadinessState.REFUSING_TRAFFIC);
            return ResponseEntity.ok("readiness-refusing");
        }

        /** 恢复当前应用的接流量状态。 */
        @PostMapping("/ops/readiness/accept")
        ResponseEntity<String> acceptTraffic() {
            AvailabilityChangeEvent.publish(applicationContext, ReadinessState.ACCEPTING_TRAFFIC);
            return ResponseEntity.ok("readiness-accepting");
        }
    }
}
```

两条版本线的 Controller 行为相同，差异集中在 POM 的 Java 和 Spring Boot 版本，以及兼容线不能配置 `/livez`、`/readyz`。
`AtomicInteger`、普通类和 `Thread.sleep(long)` 都是 Java 8 已有能力，没有为了制造版本差异而改写业务代码。

### 3. 兼容线运行结果

打包并启动：

```bash
mvn package
java -jar target/health-demo-legacy-0.0.1-SNAPSHOT.jar
```

访问 `/actuator/health`、`/actuator/health/liveness` 和 `/actuator/health/readiness` 的正常结果与现代线相同，均为
`200` 和 `UP`。发布拒流事件后，readiness 变为 `503` 和 `OUT_OF_SERVICE`；恢复事件后再次变为 `200`。访问 `/livez`
不是本版本的验收条件，因为 Boot 2.3 没有现代线的 `add-additional-paths` 合同。

## 九、用信号完成停机反馈环

### 1. 先验证正常状态和主动摘流

分别在两条版本线启动应用，先保存以下断言：

```bash
curl -fsS -o /tmp/health.json -w '%{http_code}\n' http://127.0.0.1:8080/actuator/health
curl -fsS http://127.0.0.1:8080/actuator/health/liveness
curl -fsS http://127.0.0.1:8080/actuator/health/readiness
```

文件中的状态应为 `UP`，HTTP 状态为 `200`。现代线再检查 `/livez` 和 `/readyz`；兼容线不要添加这两个断言。

如果使用示例中的演示入口，可执行：

```bash
curl -fsS -X POST http://127.0.0.1:8080/ops/readiness/refuse
curl -i http://127.0.0.1:8080/actuator/health/readiness
curl -i http://127.0.0.1:8080/actuator/health/liveness
curl -fsS -X POST http://127.0.0.1:8080/ops/readiness/accept
```

readiness 的 `503` 与 liveness 的 `200` 必须同时出现；恢复请求后 readiness 必须回到 `200`。检查结束后先恢复状态，再进行
停机测试，避免把上一轮的主动拒流混入下一轮结果。

### 2. 用 `java -jar` 观察在途请求

打包完成后在一个终端启动并记录 PID：

```bash
java -jar target/health-demo-modern-0.0.1-SNAPSHOT.jar > /tmp/health-demo.log 2>&1 &
app_pid=$!
```

另一个终端发起慢请求：

```bash
curl -i http://127.0.0.1:8080/slow > /tmp/slow-response.txt &
slow_pid=$!
sleep 1
kill -TERM "$app_pid"
for attempt in {1..40}; do
    readiness_code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 0.25 \
        http://127.0.0.1:8080/actuator/health/readiness)
    if [ "$readiness_code" = "503" ] || [ "$readiness_code" = "000" ]; then
        break
    fi
    sleep 0.05
done
if [ "$readiness_code" != "503" ] && [ "$readiness_code" != "000" ]; then
    echo "未观察到 readiness 拒流或主端口关闭" >&2
    wait "$slow_pid"
    wait "$app_pid"
    exit 1
fi
printf 'shutdown boundary=%s\n' "$readiness_code"
curl --max-time 6 -i http://127.0.0.1:8080/slow > /tmp/shutdown-new-request.txt 2>&1 &
new_request_pid=$!
wait "$slow_pid"
wait "$new_request_pid" || true
wait "$app_pid"
```

轮询中的 `503` 表示 readiness 已拒流，`000` 表示主端口已经无法建立正常 HTTP 响应；两者都可以作为继续验证业务入口的
边界。不要在发送信号后立刻请求 `/slow`，否则请求可能抢在服务器完成摘流前进入 Controller。

`/tmp/slow-response.txt` 应包含 `200`、`slow-finished` 和 `accepted=1`，且应用进程最终退出。停机窗口中的新请求可能在
`/tmp/shutdown-new-request.txt` 中表现为连接被拒绝、超时或服务器返回其他关闭相关反馈，不要强行改成固定 503；关键是
首个响应的累计值仍为 `1`，证明新请求没有进入 `slow()`。把现代 JAR 换成兼容线 JAR 后重复同一反馈环，唯一必需的配置
差异是兼容线显式的 `server.shutdown=graceful`。

### 3. 从现象回到状态模型

如果在途请求完成而新请求没有进入业务方法，说明服务器执行了“先摘流、再等待”的关闭顺序。如果在途请求被立即截断，
先检查实际发送的信号、运行的 JAR 和 `server.shutdown` 值，再检查宽限期是否小于请求耗时。不要只看进程是否消失，因为
“进程退出”本身无法证明请求完成或 readiness 曾经拒流。

## 十、本课小结

健康汇总、liveness 和 readiness 服务于不同的自动化决策。Actuator 通过启用、暴露和状态映射把内部检查转换成稳定的
HTTP 合同，默认隐藏详细信息；liveness 不应把外部依赖故障变成重启风暴，readiness 才是摘流的主要信号。

优雅停机是一个有上界的生命周期流程：收到 SIGTERM 后先停止接收新请求，再在 `spring.lifecycle.timeout-per-shutdown-phase`
规定的窗口内等待在途请求。Boot 4.1 默认开启并支持主端口探针辅助路径，Boot 2.3 必须显式开启探针和 graceful，不能把新
版本属性复制到旧项目。最终验证必须同时观察健康状态、业务入口是否仍被调用、慢请求是否完成和进程是否退出。
