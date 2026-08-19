# 第一个 Spring Boot Web API 研究稿

## 冻结课程合同

| 项目 | 冻结值 |
| --- | --- |
| 课程 ID | `backend.java.learn.intermediate.first-spring-boot-web-api` |
| 稳定 slug | `first-spring-boot-web-api` |
| 稳定 URL | `/backend/java/core/learn/first-spring-boot-web-api` |
| 标题 | 第一个 Spring Boot Web API |
| 阶段 | intermediate |
| 顺序与时长 | I-05；120 分钟 |
| 精确前置 | I-04 `backend.java.learn.intermediate.http-uri-and-request-response-basics` |
| 现代主线 | Java 25 LTS、Spring Boot 4.1.0、Spring Framework 7.0.8、Maven 3.6.3+ |
| 项目补充 | Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE |
| 课程性质 | 必修、桥接、新增 |
| 后继边界 | 本研究稿关闭前不领取任何后续课程 |

本课只完成一条最小闭环：用 Spring Initializr 生成 Maven 项目，读懂标准目录和 POM，使用
`spring-boot-starter-webmvc`、`@SpringBootApplication` 与 `SpringApplication.run` 启动应用，
再用一个 `@RestController` 提供最小 GET/POST JSON，观察启动日志与端口，用 curl 验证并停止进程。

以下内容明确排除：IoC 或 Bean 生命周期、自动配置原理、Servlet 生命周期、Bean Validation、
数据库、分层架构、异常响应定制、部署和生产运维。课程可以指出 starter 已提供所需组合，但不拆解
容器内部机制，也不把这个桥接课扩写为完整 Spring Boot 或 Spring MVC 原理课。

## 核验基线

- 核验日期：2026-08-15。
- Java：Oracle 支持路线将 Java 25 标为 LTS；OpenJDK 下载页已说明 JDK 25 被 JDK 26 取代为
  最新功能版本。本课选择 25 是 LTS 教学基线，不宣称它是最新 JDK。
- Spring Boot：Maven Central 当前 release 为 4.1.0。官方 system requirements 要求 Java 17
  至 26、Maven 3.6.3+，并要求 Spring Framework 7.0.8+；Java 25 在支持范围内。
- Web starter：4.1.0 的 `spring-boot-starter-webmvc` POM 明确组合 Boot starter、Jackson、Tomcat、
  HTTP converter 和 Spring Web MVC 模块。本课不手工拼装这些依赖。
- JSON 版本边界：Boot 4.1.0 BOM 管理 Jackson 3.1.4。I-05 不手动覆盖到 I-03 独立示例使用的
  3.2.1；本课只依赖 starter 提供的 Jackson 3 完成最小 JSON 往返。
- Initializr：官方 metadata 在核验日把 4.1.0 设为默认 Boot 版本，列出 Java 25 和 `web` 依赖。
  用精确参数请求官方 `starter.zip` 后，生成的 POM 为 Boot 4.1.0、Java 25、
  `spring-boot-starter-webmvc`，入口类包含标准 `SpringApplication.run`；探针仅写入 `/tmp`，已清理。
- 旧项目线：Spring Boot 2.3.12.RELEASE 要求 Java 8 至 15、Maven 3.3+，使用
  `spring-boot-starter-web` 并管理 Spring Framework 5.2.15.RELEASE。本课只保留最小兼容写法。

## 官方来源卡与直接证据

| ID | 来源 | 适用版本 | 支持的结论 |
| --- | --- | --- | --- |
| J1 | [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) | 2026-08-15 快照 | Java 25 是 Oracle LTS |
| J2 | [OpenJDK JDK 25 Releases](https://jdk.java.net/25/) | 2026-08-15 快照 | JDK 25 已被 JDK 26 取代为最新功能版本 |
| V1 | [Spring Boot Maven metadata](https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-dependencies/maven-metadata.xml) | 2026-08-15 快照 | 当前 release 为 Spring Boot 4.1.0 |
| V2 | [Spring Boot system requirements](https://docs.spring.io/spring-boot/system-requirements.html) | Spring Boot 4.1.0 | Java 17–26、Spring Framework 7.0.8+、Maven 3.6.3+ |
| V3 | [Spring Boot 4.1.0 dependency BOM](https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-dependencies/4.1.0/spring-boot-dependencies-4.1.0.pom) | Spring Boot 4.1.0 | 管理 Spring Framework 7.0.8 与 Jackson 3.1.4 |
| I1 | [Spring Initializr metadata API](https://start.spring.io/metadata/client) | 2026-08-15 快照 | 默认 Boot 4.1.0；可选 Java 25；`web` 表示 Spring MVC 与默认嵌入式 Tomcat |
| I2 | [Spring Initializr 精确生成请求](https://start.spring.io/starter.zip?type=maven-project&language=java&bootVersion=4.1.0&baseDir=first-api&groupId=example&artifactId=first-api&name=first-api&packageName=example.firstapi&packaging=jar&javaVersion=25&dependencies=web) | 2026-08-15 快照 | 生成 Maven wrapper、标准源码目录、Boot 4.1.0/Java 25 POM 与入口类 |
| M1 | [Maven Standard Directory Layout](https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html) | Maven | 根 POM、`src/main/java`、`src/main/resources`、`src/test/java` 与 `target` 职责 |
| B1 | [Spring Boot 4.1.0 first application tutorial](https://github.com/spring-projects/spring-boot/blob/v4.1.0/documentation/spring-boot-docs/src/docs/antora/modules/tutorial/pages/first-application/index.adoc) | Spring Boot 4.1.0 | Initializr Web 入口、starter-webmvc、main 方法、Maven 启动、8080、Started 日志与 Ctrl+C |
| B2 | [spring-boot-starter-webmvc 4.1.0 POM](https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-webmvc/4.1.0/spring-boot-starter-webmvc-4.1.0.pom) | Spring Boot 4.1.0 | Starter 的 Tomcat、Jackson、HTTP converter 与 Spring Web MVC 依赖组合 |
| B3 | [SpringBootApplication 4.1.0 source](https://github.com/spring-projects/spring-boot/blob/v4.1.0/core/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/SpringBootApplication.java) | Spring Boot 4.1.0 | 入口便利注解组合 Spring Boot configuration、自动配置与组件扫描 |
| B4 | [SpringApplication 4.1.0 source](https://github.com/spring-projects/spring-boot/blob/v4.1.0/core/spring-boot/src/main/java/org/springframework/boot/SpringApplication.java) | Spring Boot 4.1.0 | 静态 `run` 接收 primary source 和命令行参数并启动应用 |
| B5 | [Web server factory 4.1.0 source](https://github.com/spring-projects/spring-boot/blob/v4.1.0/module/spring-boot-web-server/src/main/java/org/springframework/boot/web/server/AbstractConfigurableWebServerFactory.java) | Spring Boot 4.1.0 | 默认端口为 8080 |
| B6 | [PortInUseFailureAnalyzer 4.1.0 source](https://github.com/spring-projects/spring-boot/blob/v4.1.0/module/spring-boot-web-server/src/main/java/org/springframework/boot/web/server/PortInUseFailureAnalyzer.java) | Spring Boot 4.1.0 | 端口占用时给出失败描述及停止占用进程或换端口的动作 |
| W1 | [RestController 7.0.8 source](https://github.com/spring-projects/spring-framework/blob/v7.0.8/spring-web/src/main/java/org/springframework/web/bind/annotation/RestController.java) | Spring Framework 7.0.8 | `@RestController` 组合 `@Controller` 与 `@ResponseBody` |
| W2 | [GetMapping 7.0.8 source](https://github.com/spring-projects/spring-framework/blob/v7.0.8/spring-web/src/main/java/org/springframework/web/bind/annotation/GetMapping.java) | Spring Framework 7.0.8 | `@GetMapping` 是 GET 请求映射的组合注解 |
| W3 | [PostMapping 7.0.8 source](https://github.com/spring-projects/spring-framework/blob/v7.0.8/spring-web/src/main/java/org/springframework/web/bind/annotation/PostMapping.java) | Spring Framework 7.0.8 | `@PostMapping` 是 POST 请求映射的组合注解 |
| W4 | [Spring MVC RequestBody reference](https://github.com/spring-projects/spring-framework/blob/v7.0.8/framework-docs/modules/ROOT/pages/web/webmvc/mvc-controller/ann-methods/requestbody.adoc) | Spring Framework 7.0.8 | `@RequestBody` 经 HttpMessageConverter 读取并反序列化请求体 |
| W5 | [Spring MVC ResponseBody reference](https://github.com/spring-projects/spring-framework/blob/v7.0.8/framework-docs/modules/ROOT/pages/web/webmvc/mvc-controller/ann-methods/responsebody.adoc) | Spring Framework 7.0.8 | 返回值经 HttpMessageConverter 写入响应体；RestController 默认具有该语义 |
| W6 | [DefaultHandlerExceptionResolver 7.0.8 source](https://github.com/spring-projects/spring-framework/blob/v7.0.8/spring-webmvc/src/main/java/org/springframework/web/servlet/mvc/support/DefaultHandlerExceptionResolver.java) | Spring Framework 7.0.8 | 无法读取请求体、未知路径、错误方法和不支持的媒体类型分别对应 400、404、405、415 |
| L1 | [Spring Boot 2.3.12 getting started](https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html) | Spring Boot 2.3.12.RELEASE | Java 8–15、Spring Framework 5.2.15+、Maven 3.3+ |
| L2 | [spring-boot-starter-web 2.3.12 POM](https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-web/2.3.12.RELEASE/spring-boot-starter-web-2.3.12.RELEASE.pom) | Spring Boot 2.3.12.RELEASE | 旧线 starter 名称及 JSON、Tomcat、Spring Web MVC 组合 |
| L3 | [SpringBootApplication 2.3.12 source](https://github.com/spring-projects/spring-boot/blob/v2.3.12.RELEASE/spring-boot-project/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/SpringBootApplication.java) | Spring Boot 2.3.12.RELEASE | 旧线入口注解合同 |
| L4 | [SpringApplication 2.3.12 source](https://github.com/spring-projects/spring-boot/blob/v2.3.12.RELEASE/spring-boot-project/spring-boot/src/main/java/org/springframework/boot/SpringApplication.java) | Spring Boot 2.3.12.RELEASE | 旧线静态 `run` 入口合同 |
| L5 | [RestController 5.2.15 source](https://github.com/spring-projects/spring-framework/blob/v5.2.15.RELEASE/spring-web/src/main/java/org/springframework/web/bind/annotation/RestController.java) | Spring Framework 5.2.15.RELEASE | 旧线 RestController 同样组合 Controller 与 ResponseBody |
| L6 | [Web server factory 2.3.12 source](https://github.com/spring-projects/spring-boot/blob/v2.3.12.RELEASE/spring-boot-project/spring-boot/src/main/java/org/springframework/boot/web/server/AbstractConfigurableWebServerFactory.java) | Spring Boot 2.3.12.RELEASE | 旧线默认端口同为 8080 |
| L7 | [DefaultHandlerExceptionResolver 5.2.15 source](https://github.com/spring-projects/spring-framework/blob/v5.2.15.RELEASE/spring-webmvc/src/main/java/org/springframework/web/servlet/mvc/support/DefaultHandlerExceptionResolver.java) | Spring Framework 5.2.15.RELEASE | 无法读取请求体、未知处理器、错误方法和不支持的媒体类型分别对应 400、404、405、415 |
| L8 | [PortInUseFailureAnalyzer 2.3.12 source](https://github.com/spring-projects/spring-boot/blob/v2.3.12.RELEASE/spring-boot-project/spring-boot/src/main/java/org/springframework/boot/diagnostics/analyzer/PortInUseFailureAnalyzer.java) | Spring Boot 2.3.12.RELEASE | 端口占用时给出启动失败说明及停止占用进程或更换端口的动作 |

精确 tag 在核验日解析到以下 commit：

| 来源快照 | Commit SHA |
| --- | --- |
| Spring Boot 4.1.0 | `ac2cfe03538b87a0dc9d2619ed52a4c901eaea54` |
| Spring Framework 7.0.8 | `9e8cea3ef8ae02efb7956b071cd7bbef7c22cb82` |
| Spring Boot 2.3.12.RELEASE | `4d089c4ecb1b356153a80984ef95fff49570eaa7` |
| Spring Framework 5.2.15.RELEASE | `5d46ae91f02313ce755eb3e1c9164ee6b1468da8` |

Tavily 仅用于定位候选直接页面。所有进入本稿的结论均回到 Spring、Maven、Oracle/OpenJDK 的官方
文档、源码、POM、元数据或第一方 API 核验；搜索摘要和社区文章不进入证据链。

## 现代主线结论

### Initializr 负责生成起点，Maven 目录仍按标准理解

Initializr 的 Web 依赖在核验日生成 Boot 4.1.0、Java 25 和
`spring-boot-starter-webmvc` 项目。生成结果包括 Maven wrapper、根 `pom.xml`、
`src/main/java`、`src/main/resources` 和默认测试骨架；这些目录的职责与 Maven 标准布局一致。
Initializr 是起点生成器，不是另一个运行框架。（来源：I1、I2、M1）

正式课程只保留理解和运行主线所需的文件。仓库禁止持久测试资产，因此 Initializr 自带的测试 starter
和测试类只作为生成结果观察项；后续验证必须在 `/tmp` fixture 中执行，不能复制进课程仓库。

最小 POM 冻结为：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>4.1.0</version>
    <relativePath />
  </parent>
  <groupId>example</groupId>
  <artifactId>first-api</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <properties>
    <java.version>25</java.version>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-webmvc</artifactId>
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

Parent 负责 Boot 依赖管理，starter 提供最小 Web 组合，Maven plugin 提供 `spring-boot:run`。本课不
显式填写 starter 内部依赖版本，也不解释依赖管理实现。（来源：B1、B2、V3）

### 入口类只保留一个标准 main

入口类位于根包 `example.firstapi`，Controller 放在该包或其子包。`@SpringBootApplication` 是入口
便利注解；`SpringApplication.run(FirstApiApplication.class, args)` 以入口类为 primary source 并
传入命令行参数。课程只要求读懂这两行的启动职责，不展开其中包含的扫描或自动配置机制。
（来源：B3、B4）

```java
package example.firstapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 第一个 Web API 的应用入口。
 */
@SpringBootApplication
public class FirstApiApplication {

  /**
   * 启动 Spring Boot 应用。
   *
   * @param args 命令行参数
   */
  public static void main(String[] args) {
    SpringApplication.run(FirstApiApplication.class, args);
  }
}
```

### 一个 Controller 完成 GET 与 POST JSON

`@RestController` 使方法返回值默认写入响应体；`@GetMapping` 与 `@PostMapping` 分别绑定已在 I-04
学过的 GET/POST；`@RequestBody` 通过 converter 把 JSON 读成目标类型。这里不增加 Service、注入、
Validation 或数据库，只观察 Java 值与 JSON 的最短往返。（来源：W1、W2、W3、W4、W5）

```java
package example.firstapi;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * 提供最小问候 API。
 */
@RestController
public final class GreetingController {

  /**
   * 返回固定问候。
   *
   * @return JSON 响应
   */
  @GetMapping("/api/greetings")
  public GreetingResponse getGreeting() {
    return new GreetingResponse("Hello, Spring Boot!");
  }

  /**
   * 根据请求体返回问候。
   *
   * @param request JSON 请求体
   * @return JSON 响应
   */
  @PostMapping("/api/greetings")
  public GreetingResponse createGreeting(@RequestBody GreetingRequest request) {
    return new GreetingResponse("Hello, " + request.name() + "!");
  }

  /**
   * POST 请求合同。
   *
   * @param name 名称
   */
  public record GreetingRequest(String name) {}

  /**
   * GET 与 POST 的响应合同。
   *
   * @param message 问候文本
   */
  public record GreetingResponse(String message) {}
}
```

### 启动、读日志、curl 和停止必须形成闭环

在 Initializr 项目根目录运行 `./mvnw spring-boot:run`。只有日志出现 `Started FirstApiApplication`
后才发请求；默认端口是 8080。课程只断言稳定信号，不断言时间、线程名或完整日志文本。
（来源：B1、B5）

正向 GET：

```bash
curl --fail --silent --show-error http://localhost:8080/api/greetings
```

固定响应：

```json
{"message":"Hello, Spring Boot!"}
```

正向 POST：

```bash
curl --fail --silent --show-error \
  -H 'Content-Type: application/json' \
  --data '{"name":"Java"}' \
  http://localhost:8080/api/greetings
```

固定响应：

```json
{"message":"Hello, Java!"}
```

按 `Ctrl+C` 停止 Maven 运行目标，等待进程退出，再次 curl 应连接失败。不能用“终端还开着”或只看
最后一行日志代替进程退出和端口释放验证。（来源：B1）

### 负向示例只覆盖本课边界

负向一：发送无法解析的 JSON，方法不应执行，默认状态为 400；本课不定制错误响应，也不引入
Validation。（来源：W4、W6）

```bash
curl --silent --output /dev/null --write-out '%{http_code}\n' \
  -H 'Content-Type: application/json' \
  --data '{"name":}' \
  http://localhost:8080/api/greetings
```

固定状态：

```text
400
```

负向二：保持第一个实例占用 8080，再从第二个终端执行 `./mvnw spring-boot:run`。第二个实例必须
启动失败，日志应包含端口已被占用的失败描述。正确动作是停止占用进程，或在独立验证中把第二个实例
配置到其他端口；不能把失败日志误判为应用已就绪。（来源：B5、B6）

## Java 8 / Spring Boot 2.3.12 兼容线

| 对比项 | 现代主线 | 旧项目线 | 教学边界 | 来源 |
| --- | --- | --- | --- | --- |
| Java | 25 LTS | 8 | 旧线不用 record、文本块或现代语法 | J1、L1 |
| Spring Boot | 4.1.0 | 2.3.12.RELEASE | 各自使用精确版本文档 | V1、L1 |
| Web starter | `spring-boot-starter-webmvc` | `spring-boot-starter-web` | 不复制现代 artifactId 到旧 POM | B2、L2 |
| 入口 | SpringBootApplication + SpringApplication.run | 同一最小形状 | 不展开内部启动机制 | B3、B4、L3、L4 |
| DTO | record | 普通 JavaBean/不可变类 | JSON 字段合同保持一致 | W4、L1 |
| Controller | RestController + GET/POST + RequestBody | 注解形状可保持一致 | 旧线使用 Spring Framework 5.2 合同 | W1–W5、L5 |
| 默认端口 | 8080 | 8080 | 两条线都从启动日志确认实际端口 | B5、L6 |

旧线最小 POM 只把 parent 改为 `2.3.12.RELEASE`、Java 改为 8，并把 starter 改为
`spring-boot-starter-web`。请求/响应 DTO 必须改写为 Java 8 可编译的类；课程不迁移项目 WAR、
外部容器配置或现有业务 Controller，也不把旧 starter 名称写成现代推荐。

## 易错点与验证设计

| 易错点 | 触发条件与后果 | 正确写法 | 最小验证 | 来源 |
| --- | --- | --- | --- | --- |
| 现代项目仍使用旧 starter 名 | Boot 4 POM 与课程基线不一致 | 使用 `spring-boot-starter-webmvc` | 检查 effective dependency tree | B1、B2 |
| 手工覆盖 Boot 管理的 Jackson | 组合未经本课验证 | 接受 Boot 4.1.0 管理的 Jackson 3.1.4 | 检查 dependency tree | V3 |
| 入口类不在根包 | Controller 可能不被入口扫描范围覆盖 | 入口放根包，Web 类放其下 | 启动后 GET 必须命中 | B3、I2 |
| 启动后立即 curl | 服务尚未就绪，出现偶发连接失败 | 等待 Started 日志 | 捕获日志后再请求 | B1 |
| 只看 8080 不看日志 | 端口被其他进程占用或实例启动失败 | 同时核对 Started 与实际响应 | 运行端口冲突负例 | B5、B6 |
| POST 忘记 JSON Content-Type | converter 无法按预期读取 | 显式发送 `Content-Type: application/json` | 正向 POST 固定请求头 | W4 |
| 把解析失败当 Validation | 无效 JSON 在进入方法前失败 | 只断言 400，不引入校验注解 | 发送 malformed JSON | W4、W6 |
| Ctrl+C 后不验证退出 | 残留进程影响下一次运行 | 等待进程结束并复查端口 | 停止后 curl 失败 | B1 |
| 在 Java 8 线使用 record | 编译失败 | 使用 Java 8 DTO 类 | Java 8 编译 fixture | L1 |

## 可运行 fixture 冻结

所有验证资产必须放在 `/tmp` 的 `mktemp -d` 目录；结束后使用
`find <dir> -depth -delete` 清理，并以 `test ! -e <dir>` 证明不存在。研究批只完成了 Initializr
生成探针；以下运行闭环留给获授权的课程实现批执行。

1. Java 25 正向：用 I2 的精确 Initializr 参数生成项目，替换为冻结入口与 Controller，运行
   `./mvnw spring-boot:run`，等待 Started，验证 GET/POST 的状态、JSON body 和 content type。
2. Java 25 解析负向：发送 malformed JSON，断言 400，且 Controller 方法没有正常响应。
3. Java 25 端口负向：首实例就绪后启动第二实例，断言非零退出与端口占用分析；停止首实例后确认
   8080 释放。
4. Java 8 兼容正向：使用 Boot 2.3.12.RELEASE、`spring-boot-starter-web` 和普通 DTO 类，验证同一
   GET/POST JSON 合同与默认 8080。
5. 两条线都记录 JDK、Maven、依赖树、启动命令、就绪日志、curl 输出、停止结果和清理证明；不在
   仓库保留测试类、fixture、日志或构建输出。

## 课程小点建议

1. Initializr 的输入、输出与生成边界。
2. Maven 根 POM、main 源码、resources 与 target。
3. Boot parent、Java 版本、webmvc starter 与 Maven plugin。
4. `@SpringBootApplication` 入口位置。
5. `SpringApplication.run` 与标准 main。
6. `@RestController`、GET 和 JSON 响应。
7. `@RequestBody`、POST 和 JSON 请求。
8. Maven 启动命令、Started 日志与默认 8080。
9. curl 正向、malformed JSON 和端口占用负向。
10. Ctrl+C、进程退出、端口释放与 Java 8 兼容差异。

每个小点必须写出“它是什么、有什么作用、什么时候使用、怎么使用、最小示例、预期结果、常见
误区”。不在本课解释 starter 内部 Bean、自动配置条件或 Servlet 调用链。

## 研究 Gate 自检

- [x] 冻结稳定 ID、slug、URL、I-05 顺序、120 分钟和唯一前置 I-04。
- [x] 核验 Java 25、Boot 4.1.0、Framework 7.0.8、Maven 与 Initializr 当前事实。
- [x] 记录 Boot 4.1.0 管理 Jackson 3.1.4 的组合边界，不手工覆盖。
- [x] 现代 starter 与旧线 starter 分别绑定精确 POM。
- [x] 入口、Controller、GET/POST、RequestBody、JSON 写出和默认 400 均绑定官方源码或文档。
- [x] 启动日志、默认端口、端口冲突和 Ctrl+C 均有官方依据与可运行验证方式。
- [x] 正反例不引入 Validation、数据库、分层或生命周期原理。
- [x] Initializr 探针只在 `/tmp` 执行并已清理；仓库未写入测试或生成资产。
- [x] 未作无测量性能结论。

## Stop Boundary

本研究稿只冻结 I-05 `first-spring-boot-web-api` 的研究输入，不授权修改课程正文、track、loader、
manifest 或 signoff。后续实现必须在独立批次完成 `/tmp` Java 25/8 fixture、工程 Gate、桌面/390px
浏览器证据与独立 signoff。本稿不得研究或领取任何后续课程，也不得扩展到 Bean 生命周期、自动配置
原理、Servlet 生命周期、Validation 或数据库。
