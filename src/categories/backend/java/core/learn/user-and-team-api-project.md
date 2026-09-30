---
id: backend.java.learn.intermediate.user-and-team-api-project
type: lesson
title: 用户与团队 API
summary: 把映射、校验、成功响应与全局错误合同组合成可运行的用户、团队和成员关系 API
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 300
prerequisites:
  - backend.java.learn.intermediate.global-exception-handling
objectives:
  - 能区分全局 User、独立 Team 与隶属团队的 TeamMember 三种资源身份。
  - 能为用户、团队与成员关系设计集合 URI、成员 URI、请求 DTO 和响应 DTO。
  - 能实现三个集合的统一分页合同，并让无效或跨集合 token 返回稳定 400。
  - 能把格式校验、资源存在性、邮箱唯一性和成员重复规则放到正确边界。
  - 能为创建、查询和移除分别返回 201 + Location、200 与零字节 204。
  - 能让现代 ProblemDetail 与 Java 8 ApiProblem 对外保持同形错误 JSON。
  - 能解释 GET、DELETE 与 POST 的幂等边界，不用内存 Map 冒充可靠幂等存储。
  - 能在 JDK 25 与真实 Java 8 环境中运行同一套 HTTP 验收矩阵。
recap:
  - User 是全局身份，Team 是独立资源，TeamMember 是拥有独立 id 并引用 userId 的团队关系。
  - 成员创建只接收 userId 与 role，displayName 始终从 User 投影，不能形成两个事实来源。
  - 用户、团队和成员集合统一返回 items 与 nextPageToken，token 只由签发它的集合解释。
  - DTO 约束只检查输入形状，资源缺失和重复关系由 Service 转换成 404 或 409。
  - 创建返回 201、Location 与资源表示，查询返回 200，移除关系返回没有正文的 204。
  - Java 8 的 Controller 方法校验依赖类型级 Validated 和可代理类，现代 MVC 不需要这条旧 AOP 路径。
  - Problem Details 的状态、媒体类型、code、traceId 与 errors 合同不因 Java 版本改变。
  - 本课只实现进程内可观察状态，不承诺持久化、事务、并发一致性或可靠 Idempotency-Key。
related:
  - backend.java.learn.basics.unified-api-contract
  - backend.java.learn.intermediate.request-validation
  - backend.java.learn.intermediate.unified-api-response
  - backend.java.learn.intermediate.global-exception-handling
tags:
  - Java
  - Spring Boot
  - Spring MVC
  - REST API
  - 用户
  - 团队
  - 分页
  - Problem Details
appliesTo: JDK 25、Spring Boot 4.1.0、Spring Framework 7.0.8 主线；Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE 兼容写法；HTTP 语义按 RFC 9110，错误合同按 RFC 9457
verifiedAt: 2026-08-19
sources:
  - id: spring-boot-41-user-team-system
    title: Spring Boot 4.1 System Requirements
    url: https://docs.spring.io/spring-boot/4.1/system-requirements.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Spring Boot 4.1.0 支持 JDK 25，并要求 Spring Framework 7.0.8 或以上
  - id: spring-boot-41-user-team-build
    title: Spring Boot 4.1 Build Systems
    url: https://docs.spring.io/spring-boot/4.1/reference/using/build-systems.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Servlet MVC 与 Bean Validation 分别使用 webmvc 和 validation starter
  - id: spring-7-user-team-mapping
    title: Spring Framework 7.0 - Request Mapping
    url: https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-controller/ann-requestmapping.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - 类级与方法级映射共同确定 path、method、consumes 和 produces
  - id: spring-7-user-team-validation
    title: Spring Framework 7.0 - Validation
    url: https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-controller/ann-validation.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - 请求体对象校验与 Controller 方法参数校验使用不同处理路径
      - 现代 MVC 方法校验不需要在 Controller 类型上添加 Validated
  - id: spring-7-user-team-return-types
    title: Spring Framework 7.0 - Controller Return Values
    url: https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-controller/ann-methods/return-types.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - 普通对象作为响应 body，ResponseEntity 表达完整的状态、响应头与 body
  - id: spring-7-user-team-errors
    title: Spring Framework 7.0 - Error Responses
    url: https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-ann-rest-exceptions.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - ProblemDetail 与 ResponseEntityExceptionHandler 提供 RFC 9457 集成
  - id: spring-708-user-team-response-entity
    title: ResponseEntity API - Spring Framework 7.0.8
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/http/ResponseEntity.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - created 与 noContent builder 分别建立 201 + Location 和 204 响应
  - id: spring-708-user-team-uri-builder
    title: ServletUriComponentsBuilder API - Spring Framework 7.0.8
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/servlet/support/ServletUriComponentsBuilder.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 可以从当前请求 URI 扩展新资源 ID 并生成 Location
  - id: spring-boot-2312-user-team-system
    title: Spring Boot 2.3.12.RELEASE Getting Started
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java 8 / Spring Boot 2.3.12.RELEASE
    claims:
      - Spring Boot 2.3.12.RELEASE 支持 Java 8 并使用 Spring Framework 5.2.15.RELEASE 基线
  - id: spring-boot-23-user-team-validation
    title: Spring Boot 2.3 Release Notes
    url: https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.3-Release-Notes
    sourceOrigin: official
    sourceType: release-note
    appliesTo: Spring Boot 2.3.x
    claims:
      - Boot 2.3 的 Web starter 不再传递引入 validation starter
  - id: spring-5215-user-team-web
    title: Spring Framework 5.2.15.RELEASE Web MVC Reference
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/web.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Java 8 兼容线使用 javax.validation 与类型级 Validated 的旧方法校验路径
  - id: spring-5215-user-team-response-entity
    title: ResponseEntity API - Spring Framework 5.2.15.RELEASE
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/http/ResponseEntity.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Java 8 兼容线同样支持 created 与 noContent builder
  - id: spring-5215-user-team-handler
    title: ResponseEntityExceptionHandler API - Spring Framework 5.2.15.RELEASE
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/servlet/mvc/method/annotation/ResponseEntityExceptionHandler.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Java 8 advice 的覆盖签名使用 HttpStatus，且框架没有 ProblemDetail
  - id: rfc-9110-user-team-api
    title: RFC 9110 - HTTP Semantics
    url: https://www.rfc-editor.org/rfc/rfc9110.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: HTTP semantics
    claims:
      - GET、POST、DELETE 的安全与幂等语义
      - 200、201、204、400、404、405、409、415 与 500 的状态语义
  - id: rfc-9457-user-team-api
    title: RFC 9457 - Problem Details for HTTP APIs
    url: https://www.rfc-editor.org/rfc/rfc9457.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: HTTP Problem Details
    claims:
      - 定义 application/problem+json、标准成员、扩展成员与安全信息边界
  - id: aip-158-user-team-pagination
    title: AIP-158 - Pagination
    url: https://google.aip.dev/158
    sourceOrigin: official
    sourceType: engineering-reference
    appliesTo: API pagination model
    claims:
      - pageSize、pageToken 与 nextPageToken 组成分页合同，token 对客户端不透明
---

# 用户与团队 API

前几课已经分别完成路由、请求参数、JSON 绑定、状态选择、参数校验、成功 DTO 和全局错误映射。现在要把
这些能力放进同一个应用。真正的新难点不是再记一组注解，而是让三个相邻概念拥有清楚且不会互相覆盖的
身份：用户是谁、团队是什么、用户加入团队后形成的成员关系又是什么。

本课完成一套进程内 TeamFlow API。它可以真实启动并改变内存状态，但不会提前引入数据库、文件、跨域、
OpenAPI、认证、事务或可靠幂等存储。“完整”表示本课允许的合同已经闭环，不表示为每个资源机械补齐所有
CRUD 方法。

## 一、先冻结三个资源身份

### 1. User 是全局用户

`User` 使用 `/api/v1/users/{userId}` 寻址。它保存用户自己的 `displayName` 与 `email`，ID 形如
`USR-1`。同一个用户可以加入多个团队，但全局身份不会随团队改变。

```json
{"id":"USR-1","displayName":"周宁","email":"zhou@example.com"}
```

`email` 在本课的内存业务中唯一，`displayName` 不要求唯一。格式错误由 DTO 校验返回 400；格式正确但已经
登记的邮箱由 Service 返回 409 `USER_CONFLICT`。唯一性是业务状态，不应让自定义校验器访问内存表。

### 2. Team 是独立团队

`Team` 使用 `/api/v1/teams/{teamId}` 寻址，公开 `id` 与 `name`。创建团队时同时准备一个空成员集合，
但团队资源不把整个成员列表塞进自己的响应。

```json
{"id":"TEAM-1","name":"课程平台组"}
```

`TEAM-EMPTY` 是真实存在但当前没有成员的团队；`TEAM-404` 是不存在的团队。前者查询成员应得到 200 空页，
后者必须得到 404 `TEAM_NOT_FOUND`，不能再用 `computeIfAbsent` 把未知 ID 静默变成新团队。

### 3. TeamMember 是带身份的关系

一个用户加入一个团队后形成 `TeamMember`。它拥有自己的 `MBR-*` ID，同时引用 `userId`：

```json
{"id":"MBR-1","userId":"USR-1","displayName":"周宁","role":"Designer"}
```

`id` 标识成员关系，`userId` 标识全局用户。`displayName` 是从用户投影到响应中的当前值，`role` 才属于团队
关系。创建成员只接收 `userId` 与 `role`，不接收 `displayName`，因此姓名只有 User 一个事实来源。

同一用户可以在不同团队拥有不同成员 ID 和角色，但在同一团队中只能存在一条成员关系。删除
`/teams/TEAM-1/members/MBR-1` 只删除关系，不删除 `USR-1`。

## 二、把 API 表写成可验收合同

### 1. 用户与团队端点

| 场景 | method 与 URI | 请求 | 成功结果 |
| --- | --- | --- | --- |
| 用户分页 | `GET /api/v1/users` | `pageSize`、`pageToken` | 200 + `PageResponse<UserResponse>` |
| 创建用户 | `POST /api/v1/users` | `CreateUserRequest` | 201 + Location + `UserResponse` |
| 查询用户 | `GET /api/v1/users/{userId}` | 无 | 200 + `UserResponse` |
| 团队分页 | `GET /api/v1/teams` | `pageSize`、`pageToken` | 200 + `PageResponse<TeamResponse>` |
| 创建团队 | `POST /api/v1/teams` | `CreateTeamRequest` | 201 + Location + `TeamResponse` |
| 查询团队 | `GET /api/v1/teams/{teamId}` | 无 | 200 + `TeamResponse` |

集合 URI 负责创建和分页，成员 URI 负责读取一个已知资源。POST 显式接收
`application/json`，GET 显式产生 `application/json`。创建后的 Location 从当前集合请求加新 ID 生成，
不在 Controller 里复制整段基础路径。

### 2. 团队成员端点

| 场景 | method 与 URI | 请求 | 成功结果 |
| --- | --- | --- | --- |
| 成员分页 | `GET /api/v1/teams/{teamId}/members` | `pageSize`、`pageToken` | 200 + 成员分页 |
| 添加成员 | `POST /api/v1/teams/{teamId}/members` | `userId`、`role` | 201 + Location + 成员 |
| 查询成员 | `GET /api/v1/teams/{teamId}/members/{memberId}` | 无 | 200 + 成员 |
| 移除成员 | `DELETE /api/v1/teams/{teamId}/members/{memberId}` | 无 | 204，零字节 body |

嵌套路径表达“这条成员关系隶属哪个团队”。Service 必须先确认团队存在，再查成员 ID。成员存在于另一个
团队时，当前嵌套路径仍返回 `MEMBER_NOT_FOUND`，不能绕开父资源边界全局搜索。

### 3. 请求 DTO 只验证形状

```text
CreateUserRequest
  displayName: NotBlank，最大 40
  email:       NotBlank，Email，最大 120

CreateTeamRequest
  name:        NotBlank，最大 60

CreateTeamMemberRequest
  userId:      NotBlank，USR-<正整数>
  role:        NotBlank，最大 30
```

`USR-404` 形状合法，因此它越过 Bean Validation 后由 Service 返回 404。邮箱重复和团队成员重复同样属于
业务冲突，返回 409。Controller 不写 `try/catch`，Service 也不创建 `ProblemDetail`。

## 三、统一分页而不泄漏内部位置

### 1. 三个集合共享外形

用户、团队与成员列表都返回：

```json
{"items":[{"id":"USR-1","displayName":"周宁","email":"zhou@example.com"}],"nextPageToken":"USR-PAGE-2"}
```

`pageSize` 默认 20，允许 1 到 50。`pageToken` 可以缺失，出现时只由对应 Service 解释。Service 根据下一条
资源的位置动态签发 token；示例刻意使用可观察文字便于练习，但客户端仍应把它视为不透明值，不能拆解或
修改内部位置。

### 2. token 不能跨集合复用

`USR-PAGE-2` 只属于用户集合。把它交给成员列表应得到 400 `INVALID_PAGE_TOKEN`，不是 404。正常空团队
第一页返回：

```json
{"items":[],"nextPageToken":null}
```

本课只签发可用的下一页 token。伪造、失效或来自另一集合的 token 都是分页请求无效；数据库写入期间的
稳定分页与快照一致性留给持久化课程。

### 3. 分页响应保存快照

现代 `PageResponse` 使用 `List.copyOf`，Java 8 使用
`Collections.unmodifiableList(new ArrayList<>(items))`。两者都先复制当前页，再阻止调用方经响应对象修改
Service 的内部集合。外部 JSON 完全相同，版本差异只存在于实现。

## 四、分清幂等方法与可靠重试

### 1. GET 与 DELETE 的协议属性

GET 是安全且幂等的。DELETE 的预期服务端效果是幂等的：第一次移除成员返回 204，第二次返回 404，最终
关系都不存在。幂等不要求每次响应状态和 body 逐字相同。

### 2. POST 冲突不等于通用幂等

POST 创建用户、团队和成员关系在方法层面不幂等。重复邮箱或重复成员被业务规则转换成 409，只能说明这个
冲突被识别，不能保证客户端在响应丢失后安全重试所有 POST。

TeamFlow 已经在统一 API 契约中保留 `Idempotency-Key`，但本课不读取或存储这个请求头。进程内 Map 会在
重启时丢失，也不能处理多实例和并发竞争；可靠实现留到 Redis Web 课程。未实现的幂等头不能被接受后静默
忽略。

## 五、JDK 25 完整工程

### 1. 创建独立 Maven 工程

创建 `teamflow-user-team-api-modern`。为便于从课程页面完整复制，示例把模型、DTO、Service、三个
Controller 与 advice 放在同一个启动类的静态嵌套类型中，并通过 `@Import` 明确注册；每个类型仍保持单一
职责。实际项目可以按类型拆成文件，不改变任何接口合同。

`pom.xml`：

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
  <artifactId>teamflow-user-team-api-modern</artifactId>
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

`src/main/resources/application.properties`：

```properties
spring.application.name=teamflow-user-team-api-modern
```

### 2. 编写现代完整源码

`src/main/java/com/teamflow/api/TeamFlowApplication.java`：

```java
package com.teamflow.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.net.URI;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.MessageSourceResolvable;
import org.springframework.context.annotation.Import;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.beans.TypeMismatchException;
import org.springframework.validation.method.ParameterValidationResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/** 启动 TeamFlow 用户与团队 API。 */
@SpringBootApplication
@Import({
        TeamFlowApplication.ApiService.class,
        TeamFlowApplication.UserController.class,
        TeamFlowApplication.TeamController.class,
        TeamFlowApplication.MemberController.class,
        TeamFlowApplication.GlobalExceptionHandler.class
})
public class TeamFlowApplication {

    /** 启动应用。 */
    public static void main(String[] args) {
        SpringApplication.run(TeamFlowApplication.class, args);
    }

    /** 用户内部模型。 */
    record User(String id, String displayName, String email, String internalNote) {
    }

    /** 团队内部模型。 */
    record Team(String id, String name, String internalNote) {
    }

    /** 用户在一个团队中的成员关系。 */
    record TeamMember(String id, String userId, String role) {
    }

    /** 创建用户请求。 */
    record CreateUserRequest(
            @NotBlank(message = "用户名称不能为空")
            @Size(max = 40, message = "用户名称最多 40 个字符")
            String displayName,
            @NotBlank(message = "邮箱不能为空")
            @Email(message = "邮箱格式不正确")
            @Size(max = 120, message = "邮箱最多 120 个字符")
            String email) {
    }

    /** 创建团队请求。 */
    record CreateTeamRequest(
            @NotBlank(message = "团队名称不能为空")
            @Size(max = 60, message = "团队名称最多 60 个字符")
            String name) {
    }

    /** 添加团队成员请求。 */
    record AddMemberRequest(
            @NotBlank(message = "用户 ID 不能为空")
            @Pattern(regexp = "USR-[1-9][0-9]*", message = "用户 ID 格式不正确")
            String userId,
            @NotBlank(message = "成员角色不能为空")
            @Size(max = 30, message = "成员角色最多 30 个字符")
            String role) {
    }

    /** 用户公开响应。 */
    record UserResponse(String id, String displayName, String email) {
        /** 从内部用户生成公开响应。 */
        static UserResponse from(User user) {
            return new UserResponse(user.id(), user.displayName(), user.email());
        }
    }

    /** 团队公开响应。 */
    record TeamResponse(String id, String name) {
        /** 从内部团队生成公开响应。 */
        static TeamResponse from(Team team) {
            return new TeamResponse(team.id(), team.name());
        }
    }

    /** 团队成员公开响应，id 表示成员关系 ID，userId 表示全局用户 ID。 */
    record MemberResponse(String id, String userId, String displayName, String role) {
        /** 连接用户身份与成员关系。 */
        static MemberResponse from(User user, TeamMember member) {
            return new MemberResponse(
                    member.id(), user.id(), user.displayName(), member.role());
        }
    }

    /** 分页响应。 */
    record PageResponse<T>(List<T> items, String nextPageToken) {
        /** 保存当前页快照。 */
        PageResponse {
            items = List.copyOf(items);
        }
    }

    /** 公开字段错误。 */
    record FieldProblem(String field, String code, String message) {
    }

    /** 携带稳定 HTTP 映射的业务异常。 */
    static final class ApiException extends RuntimeException {
        private final HttpStatus status;
        private final String typeSlug;
        private final String title;
        private final String code;

        /** 创建业务异常。 */
        ApiException(
                HttpStatus status,
                String typeSlug,
                String title,
                String detail,
                String code) {
            super(detail);
            this.status = status;
            this.typeSlug = typeSlug;
            this.title = title;
            this.code = code;
        }
    }

    /** 用内存状态实现用户、团队和成员关系。 */
    static final class ApiService {
        private final Map<String, User> users = new LinkedHashMap<>();
        private final Map<String, Team> teams = new LinkedHashMap<>();
        private final Map<String, LinkedHashMap<String, TeamMember>> membersByTeam =
                new LinkedHashMap<>();
        private long nextUserId = 3L;
        private long nextTeamId = 2L;
        private long nextMemberId = 2L;

        /** 准备固定验收数据。 */
        ApiService() {
            users.put("USR-1", new User("USR-1", "周宁", "zhou@example.com", "内部备注 A"));
            users.put("USR-2", new User("USR-2", "林澄", "lin@example.com", "内部备注 B"));
            teams.put("TEAM-1", new Team("TEAM-1", "课程平台组", "内部成本中心"));
            teams.put("TEAM-EMPTY", new Team("TEAM-EMPTY", "空团队", "内部成本中心"));
            LinkedHashMap<String, TeamMember> members = new LinkedHashMap<>();
            members.put("MBR-1", new TeamMember("MBR-1", "USR-1", "Designer"));
            membersByTeam.put("TEAM-1", members);
            membersByTeam.put("TEAM-EMPTY", new LinkedHashMap<>());
        }

        /** 查询用户。 */
        User findUser(String userId) {
            User user = users.get(userId);
            if (user == null) {
                throw new ApiException(
                        HttpStatus.NOT_FOUND,
                        "user-not-found",
                        "用户不存在",
                        "没有找到编号为 " + userId + " 的用户",
                        "USER_NOT_FOUND");
            }
            return user;
        }

        /** 查询一页用户。 */
        PageResponse<UserResponse> listUsers(int pageSize, String pageToken) {
            int start = pageOffset(pageToken, "USR-PAGE-", users.size());
            List<UserResponse> usersPage = users.values().stream()
                    .skip(start)
                    .limit(pageSize)
                    .map(UserResponse::from)
                    .toList();
            String nextPageToken = nextPageToken("USR-PAGE-", start, pageSize, users.size());
            return new PageResponse<>(usersPage, nextPageToken);
        }

        /** 创建用户。 */
        User createUser(CreateUserRequest request) {
            boolean duplicate = users.values().stream()
                    .anyMatch(user -> user.email().equalsIgnoreCase(request.email()));
            if (duplicate) {
                throw new ApiException(
                        HttpStatus.CONFLICT,
                        "user-conflict",
                        "用户状态冲突",
                        "该邮箱已经注册",
                        "USER_CONFLICT");
            }
            String userId = "USR-" + nextUserId++;
            User user = new User(
                    userId, request.displayName(), request.email(), "仅内部可见");
            users.put(userId, user);
            return user;
        }

        /** 查询团队。 */
        Team findTeam(String teamId) {
            Team team = teams.get(teamId);
            if (team == null) {
                throw new ApiException(
                        HttpStatus.NOT_FOUND,
                        "team-not-found",
                        "团队不存在",
                        "没有找到编号为 " + teamId + " 的团队",
                        "TEAM_NOT_FOUND");
            }
            return team;
        }

        /** 查询一页团队。 */
        PageResponse<TeamResponse> listTeams(int pageSize, String pageToken) {
            int start = pageOffset(pageToken, "TEAM-PAGE-", teams.size());
            List<TeamResponse> teamsPage = teams.values().stream()
                    .skip(start)
                    .limit(pageSize)
                    .map(TeamResponse::from)
                    .toList();
            String nextPageToken = nextPageToken("TEAM-PAGE-", start, pageSize, teams.size());
            return new PageResponse<>(teamsPage, nextPageToken);
        }

        /** 创建团队并初始化空成员集合。 */
        Team createTeam(CreateTeamRequest request) {
            String teamId = "TEAM-" + nextTeamId++;
            Team team = new Team(teamId, request.name(), "仅内部可见");
            teams.put(teamId, team);
            membersByTeam.put(teamId, new LinkedHashMap<>());
            return team;
        }

        /** 查询一页团队成员。 */
        PageResponse<MemberResponse> listMembers(
                String teamId,
                int pageSize,
                String pageToken) {
            LinkedHashMap<String, TeamMember> teamMembers = requireMembers(teamId);
            List<TeamMember> members = new ArrayList<>(teamMembers.values());
            int start = pageOffset(pageToken, "MEMBER-PAGE-", members.size());
            List<MemberResponse> items = members.stream()
                    .skip(start)
                    .limit(pageSize)
                    .map(member -> MemberResponse.from(findUser(member.userId()), member))
                    .toList();
            String nextPageToken = nextPageToken(
                    "MEMBER-PAGE-", start, pageSize, members.size());
            return new PageResponse<>(items, nextPageToken);
        }

        /** 查询一个团队成员关系。 */
        MemberResponse findMember(String teamId, String memberId) {
            TeamMember member = requireMembers(teamId).get(memberId);
            if (member == null) {
                throw new ApiException(
                        HttpStatus.NOT_FOUND,
                        "member-not-found",
                        "成员不存在",
                        "没有找到编号为 " + memberId + " 的团队成员",
                        "MEMBER_NOT_FOUND");
            }
            return MemberResponse.from(findUser(member.userId()), member);
        }

        /** 把已存在用户加入团队。 */
        MemberResponse addMember(String teamId, AddMemberRequest request) {
            LinkedHashMap<String, TeamMember> teamMembers = requireMembers(teamId);
            User user = findUser(request.userId());
            boolean duplicate = teamMembers.values().stream()
                    .anyMatch(member -> member.userId().equals(user.id()));
            if (duplicate) {
                throw new ApiException(
                        HttpStatus.CONFLICT,
                        "member-conflict",
                        "成员状态冲突",
                        "该用户已经加入当前团队",
                        "MEMBER_CONFLICT");
            }
            String memberId = "MBR-" + nextMemberId++;
            TeamMember member = new TeamMember(memberId, user.id(), request.role());
            teamMembers.put(memberId, member);
            return MemberResponse.from(user, member);
        }

        /** 从团队移除成员关系，不删除用户。 */
        void removeMember(String teamId, String memberId) {
            if (requireMembers(teamId).remove(memberId) == null) {
                throw new ApiException(
                        HttpStatus.NOT_FOUND,
                        "member-not-found",
                        "成员不存在",
                        "没有找到编号为 " + memberId + " 的团队成员",
                        "MEMBER_NOT_FOUND");
            }
        }

        /** 返回已存在团队的成员表。 */
        private LinkedHashMap<String, TeamMember> requireMembers(String teamId) {
            findTeam(teamId);
            return membersByTeam.get(teamId);
        }

        /** 解释当前集合签发的不透明分页 token。 */
        private int pageOffset(String pageToken, String tokenPrefix, int itemCount) {
            if (pageToken == null) {
                return 0;
            }
            if (!pageToken.startsWith(tokenPrefix)) {
                throw invalidPageToken();
            }
            try {
                String positionText = pageToken.substring(tokenPrefix.length());
                int position = Integer.parseInt(positionText);
                if (!positionText.equals(Integer.toString(position))) {
                    throw invalidPageToken();
                }
                int offset = position - 1;
                if (offset <= 0 || offset >= itemCount) {
                    throw invalidPageToken();
                }
                return offset;
            } catch (NumberFormatException exception) {
                throw invalidPageToken();
            }
        }

        /** 为仍有后续资源的页面签发 token。 */
        private String nextPageToken(
                String tokenPrefix,
                int start,
                int pageSize,
                int itemCount) {
            int nextOffset = start + pageSize;
            return nextOffset < itemCount ? tokenPrefix + (nextOffset + 1) : null;
        }

        /** 创建分页游标无效异常。 */
        private ApiException invalidPageToken() {
            return new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "invalid-page-token",
                    "分页游标无效",
                    "分页游标不属于当前资源集合",
                    "INVALID_PAGE_TOKEN");
        }
    }

    /** 提供用户资源。 */
    @RestController
    @RequestMapping("/api/v1/users")
    static final class UserController {
        private final ApiService service;

        /** 创建用户 Controller。 */
        UserController(ApiService service) {
            this.service = service;
        }

        /** 查询一页用户。 */
        @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
        PageResponse<UserResponse> list(
                @RequestParam(defaultValue = "20")
                @Min(value = 1, message = "pageSize 最小为 1")
                @Max(value = 50, message = "pageSize 最大为 50")
                int pageSize,
                @RequestParam(required = false) String pageToken) {
            return service.listUsers(pageSize, pageToken);
        }

        /** 查询用户。 */
        @GetMapping(path = "/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
        UserResponse find(@PathVariable("userId") String userId) {
            return UserResponse.from(service.findUser(userId));
        }

        /** 创建用户。 */
        @PostMapping(
                consumes = MediaType.APPLICATION_JSON_VALUE,
                produces = MediaType.APPLICATION_JSON_VALUE)
        ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest request) {
            User user = service.createUser(request);
            URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{userId}")
                    .buildAndExpand(user.id())
                    .toUri();
            return ResponseEntity.created(location).body(UserResponse.from(user));
        }
    }

    /** 提供团队资源。 */
    @RestController
    @RequestMapping("/api/v1/teams")
    static final class TeamController {
        private final ApiService service;

        /** 创建团队 Controller。 */
        TeamController(ApiService service) {
            this.service = service;
        }

        /** 查询一页团队。 */
        @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
        PageResponse<TeamResponse> list(
                @RequestParam(defaultValue = "20")
                @Min(value = 1, message = "pageSize 最小为 1")
                @Max(value = 50, message = "pageSize 最大为 50")
                int pageSize,
                @RequestParam(required = false) String pageToken) {
            return service.listTeams(pageSize, pageToken);
        }

        /** 查询团队。 */
        @GetMapping(path = "/{teamId}", produces = MediaType.APPLICATION_JSON_VALUE)
        TeamResponse find(@PathVariable("teamId") String teamId) {
            return TeamResponse.from(service.findTeam(teamId));
        }

        /** 创建团队。 */
        @PostMapping(
                consumes = MediaType.APPLICATION_JSON_VALUE,
                produces = MediaType.APPLICATION_JSON_VALUE)
        ResponseEntity<TeamResponse> create(@Valid @RequestBody CreateTeamRequest request) {
            Team team = service.createTeam(request);
            URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{teamId}")
                    .buildAndExpand(team.id())
                    .toUri();
            return ResponseEntity.created(location).body(TeamResponse.from(team));
        }
    }

    /** 提供团队内的成员关系资源。 */
    @RestController
    @RequestMapping("/api/v1/teams/{teamId}/members")
    static final class MemberController {
        private final ApiService service;

        /** 创建成员 Controller。 */
        MemberController(ApiService service) {
            this.service = service;
        }

        /** 查询一页成员。 */
        @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
        PageResponse<MemberResponse> list(
                @PathVariable("teamId") String teamId,
                @RequestParam(defaultValue = "20")
                @Min(value = 1, message = "pageSize 最小为 1")
                @Max(value = 50, message = "pageSize 最大为 50")
                int pageSize,
                @RequestParam(required = false)
                String pageToken) {
            return service.listMembers(teamId, pageSize, pageToken);
        }

        /** 查询一个成员关系。 */
        @GetMapping(path = "/{memberId}", produces = MediaType.APPLICATION_JSON_VALUE)
        MemberResponse find(
                @PathVariable("teamId") String teamId,
                @PathVariable("memberId") String memberId) {
            return service.findMember(teamId, memberId);
        }

        /** 把已有用户加入团队。 */
        @PostMapping(
                consumes = MediaType.APPLICATION_JSON_VALUE,
                produces = MediaType.APPLICATION_JSON_VALUE)
        ResponseEntity<MemberResponse> add(
                @PathVariable("teamId") String teamId,
                @Valid @RequestBody AddMemberRequest request) {
            MemberResponse member = service.addMember(teamId, request);
            URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{memberId}")
                    .buildAndExpand(member.id())
                    .toUri();
            return ResponseEntity.created(location).body(member);
        }

        /** 移除成员关系。 */
        @DeleteMapping("/{memberId}")
        ResponseEntity<Void> remove(
                @PathVariable("teamId") String teamId,
                @PathVariable("memberId") String memberId) {
            service.removeMember(teamId, memberId);
            return ResponseEntity.noContent().build();
        }
    }

    /** 把失败转换成稳定 Problem Details。 */
    @RestControllerAdvice
    static final class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
        private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);
        private static final String TYPE_ROOT = "https://api.teamflow.example/problems/";

        /** 映射业务失败。 */
        @ExceptionHandler(ApiException.class)
        ResponseEntity<Object> handleApiException(
                ApiException exception,
                HttpServletRequest request) {
            return problem(
                    exception.status,
                    HttpHeaders.EMPTY,
                    exception.typeSlug,
                    exception.title,
                    exception.getMessage(),
                    exception.code,
                    List.of(),
                    request);
        }

        /** 映射请求体字段校验。 */
        @Override
        protected ResponseEntity<Object> handleMethodArgumentNotValid(
                MethodArgumentNotValidException exception,
                HttpHeaders headers,
                HttpStatusCode status,
                WebRequest request) {
            List<FieldProblem> errors = exception.getBindingResult().getFieldErrors().stream()
                    .map(this::fieldProblem)
                    .sorted(Comparator.comparing(FieldProblem::field).thenComparing(FieldProblem::code))
                    .toList();
            String validationCode = bodyValidationCode(
                    exception.getParameter().getParameterType());
            return problem(
                    status,
                    headers,
                    validationCode.toLowerCase().replace('_', '-'),
                    "请求参数校验失败",
                    "有 " + errors.size() + " 个字段不符合接口约束",
                    validationCode,
                    errors,
                    servletRequest(request));
        }

        /** 映射现代 Controller 方法参数校验。 */
        @Override
        protected ResponseEntity<Object> handleHandlerMethodValidationException(
                HandlerMethodValidationException exception,
                HttpHeaders headers,
                HttpStatusCode status,
                WebRequest request) {
            List<FieldProblem> errors = new ArrayList<>();
            for (ParameterValidationResult result : exception.getParameterValidationResults()) {
                String field = parameterName(result.getMethodParameter());
                for (MessageSourceResolvable error : result.getResolvableErrors()) {
                    errors.add(new FieldProblem(
                            field,
                            stableCode(lastCode(error)),
                            safeMessage(error.getDefaultMessage())));
                }
            }
            errors.sort(Comparator.comparing(FieldProblem::field).thenComparing(FieldProblem::code));
            return problem(
                    status,
                    headers,
                    "request-validation-failed",
                    "请求参数校验失败",
                    "请求参数不符合接口约束",
                    "REQUEST_VALIDATION_FAILED",
                    errors,
                    servletRequest(request));
        }

        /** 映射不可读 JSON。 */
        @Override
        protected ResponseEntity<Object> handleHttpMessageNotReadable(
                HttpMessageNotReadableException exception,
                HttpHeaders headers,
                HttpStatusCode status,
                WebRequest request) {
            return problem(
                    status,
                    headers,
                    "request-body-not-readable",
                    "请求体无法读取",
                    "请求体不是可读取的 JSON",
                    "REQUEST_BODY_NOT_READABLE",
                    List.of(),
                    servletRequest(request));
        }

        /** 映射 query 类型转换失败。 */
        @Override
        protected ResponseEntity<Object> handleTypeMismatch(
                TypeMismatchException exception,
                HttpHeaders headers,
                HttpStatusCode status,
                WebRequest request) {
            String field = exception instanceof MethodArgumentTypeMismatchException mismatch
                    ? mismatch.getName()
                    : "request";
            List<FieldProblem> errors = List.of(new FieldProblem(
                    field,
                    "TYPE_MISMATCH",
                    field + " 必须使用接口声明的类型"));
            return problem(
                    status,
                    headers,
                    "argument-type-mismatch",
                    "请求参数类型不正确",
                    "请检查请求参数的类型",
                    "ARGUMENT_TYPE_MISMATCH",
                    errors,
                    servletRequest(request));
        }

        /** 保留 405、415 等 MVC 内建状态。 */
        @Override
        protected ResponseEntity<Object> handleExceptionInternal(
                Exception exception,
                Object body,
                HttpHeaders headers,
                HttpStatusCode status,
                WebRequest request) {
            String code = status.value() == 405
                    ? "METHOD_NOT_ALLOWED"
                    : status.value() == 415 ? "MEDIA_TYPE_NOT_SUPPORTED" : "REQUEST_REJECTED";
            return problem(
                    status,
                    headers,
                    "request-rejected",
                    "请求无法处理",
                    "请求不符合当前接口的协议要求",
                    code,
                    List.of(),
                    servletRequest(request));
        }

        /** 记录未知异常并返回去敏 500。 */
        @ExceptionHandler(Exception.class)
        ResponseEntity<Object> handleUnexpected(
                Exception exception,
                HttpServletRequest request) {
            String traceId = traceId(request);
            LOGGER.error("Unhandled request, traceId={}", traceId, exception);
            return problem(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    HttpHeaders.EMPTY,
                    "internal-error",
                    "服务器内部错误",
                    "服务器暂时无法处理请求",
                    "INTERNAL_ERROR",
                    List.of(),
                    request);
        }

        /** 构造状态、媒体类型与字段一致的 Problem Details。 */
        private ResponseEntity<Object> problem(
                HttpStatusCode status,
                HttpHeaders headers,
                String typeSlug,
                String title,
                String detail,
                String code,
                List<FieldProblem> errors,
                HttpServletRequest request) {
            ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
            problem.setType(URI.create(TYPE_ROOT + typeSlug));
            problem.setTitle(title);
            problem.setInstance(URI.create(request.getRequestURI()));
            problem.setProperty("code", code);
            problem.setProperty("traceId", traceId(request));
            problem.setProperty("errors", errors);
            return ResponseEntity.status(status)
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                    .body(problem);
        }

        /** 转换字段错误。 */
        private FieldProblem fieldProblem(FieldError error) {
            return new FieldProblem(
                    error.getField(),
                    stableCode(error.getCode()),
                    safeMessage(error.getDefaultMessage()));
        }

        /** 取得方法参数公开名称。 */
        private String parameterName(MethodParameter parameter) {
            RequestParam annotation = parameter.getParameterAnnotation(RequestParam.class);
            if (annotation != null && !annotation.name().isEmpty()) {
                return annotation.name();
            }
            return parameter.getParameterName() == null ? "request" : parameter.getParameterName();
        }

        /** 取得最后一个约束 code。 */
        private String lastCode(MessageSourceResolvable error) {
            String[] codes = error.getCodes();
            return codes == null || codes.length == 0 ? null : codes[codes.length - 1];
        }

        /** 映射稳定字段错误码。 */
        private String stableCode(String code) {
            if (code == null) {
                return "INVALID";
            }
            return switch (code) {
                case "NotBlank" -> "NOT_BLANK";
                case "Size" -> "SIZE";
                case "Pattern" -> "PATTERN";
                case "Email" -> "EMAIL";
                case "Min" -> "MIN";
                case "Max" -> "MAX";
                default -> "INVALID";
            };
        }

        /** 按请求 DTO 选择稳定业务校验码。 */
        private String bodyValidationCode(Class<?> requestType) {
            if (requestType == CreateUserRequest.class) {
                return "USER_VALIDATION_FAILED";
            }
            if (requestType == CreateTeamRequest.class) {
                return "TEAM_VALIDATION_FAILED";
            }
            if (requestType == AddMemberRequest.class) {
                return "MEMBER_VALIDATION_FAILED";
            }
            return "REQUEST_VALIDATION_FAILED";
        }

        /** 保证错误消息非空。 */
        private String safeMessage(String message) {
            return message == null ? "参数不符合约束" : message;
        }

        /** 取得 servlet 请求。 */
        private HttpServletRequest servletRequest(WebRequest request) {
            return ((ServletWebRequest) request).getRequest();
        }

        /** 为一次失败生成关联 ID。 */
        private String traceId(HttpServletRequest request) {
            String traceId = (String) request.getAttribute("teamflow.traceId");
            if (traceId == null) {
                traceId = UUID.randomUUID().toString().replace("-", "");
                request.setAttribute("teamflow.traceId", traceId);
            }
            return traceId;
        }
    }
}
```

### 3. 构建并启动

在 JDK 25 工程根目录执行：

```bash
mvn clean package
java -jar target/teamflow-user-team-api-modern-1.0.0.jar
```

启动后使用 8080。现代 Controller 不加类型级 `@Validated`；Spring MVC 直接处理 `pageSize` 上的约束，失败
进入 `HandlerMethodValidationException`。请求体对象仍通过 `MethodArgumentNotValidException` 进入 advice。

## 六、Java 8 完整兼容工程

### 1. 使用独立版本与端口

另建 `teamflow-user-team-api-java8`，Project SDK、Module SDK、Maven Runner JRE 与 POM 都使用真实 Java 8。
不要与现代工程共享 class 输出。

`pom.xml`：

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
  <artifactId>teamflow-user-team-api-java8</artifactId>
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

`src/main/resources/application.properties`：

```properties
spring.application.name=teamflow-user-team-api-java8
server.port=8081
```

### 2. 编写 Java 8 完整源码

`src/main/java/com/teamflow/api/TeamFlowApplication.java`：

```java
package com.teamflow.api;

import java.net.URI;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import javax.servlet.http.HttpServletRequest;
import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Email;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.beans.TypeMismatchException;
import org.springframework.validation.FieldError;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/** 启动 Java 8 TeamFlow 用户与团队 API。 */
@SpringBootApplication
@Import({
        TeamFlowApplication.ApiService.class,
        TeamFlowApplication.UserController.class,
        TeamFlowApplication.TeamController.class,
        TeamFlowApplication.MemberController.class,
        TeamFlowApplication.GlobalExceptionHandler.class
})
public class TeamFlowApplication {

    /** 启动应用。 */
    public static void main(String[] args) {
        SpringApplication.run(TeamFlowApplication.class, args);
    }

    /** 用户内部模型。 */
    static final class User {
        private final String id;
        private final String displayName;
        private final String email;
        private final String internalNote;

        /** 创建用户。 */
        User(String id, String displayName, String email, String internalNote) {
            this.id = id;
            this.displayName = displayName;
            this.email = email;
            this.internalNote = internalNote;
        }

        /** 返回用户 ID。 */
        String getId() {
            return id;
        }

        /** 返回显示名称。 */
        String getDisplayName() {
            return displayName;
        }

        /** 返回邮箱。 */
        String getEmail() {
            return email;
        }
    }

    /** 团队内部模型。 */
    static final class Team {
        private final String id;
        private final String name;
        private final String internalNote;

        /** 创建团队。 */
        Team(String id, String name, String internalNote) {
            this.id = id;
            this.name = name;
            this.internalNote = internalNote;
        }

        /** 返回团队 ID。 */
        String getId() {
            return id;
        }

        /** 返回团队名称。 */
        String getName() {
            return name;
        }
    }

    /** 团队成员关系。 */
    static final class TeamMember {
        private final String id;
        private final String userId;
        private final String role;

        /** 创建成员关系。 */
        TeamMember(String id, String userId, String role) {
            this.id = id;
            this.userId = userId;
            this.role = role;
        }

        /** 返回成员关系 ID。 */
        String getId() {
            return id;
        }

        /** 返回用户 ID。 */
        String getUserId() {
            return userId;
        }

        /** 返回团队内角色。 */
        String getRole() {
            return role;
        }
    }

    /** 创建用户请求。 */
    static final class CreateUserRequest {
        @NotBlank(message = "用户名称不能为空")
        @Size(max = 40, message = "用户名称最多 40 个字符")
        private String displayName;

        @NotBlank(message = "邮箱不能为空")
        @Email(message = "邮箱格式不正确")
        @Size(max = 120, message = "邮箱最多 120 个字符")
        private String email;

        /** 创建空请求对象供 JSON 绑定。 */
        public CreateUserRequest() {
        }

        /** 返回显示名称。 */
        public String getDisplayName() {
            return displayName;
        }

        /** 设置显示名称。 */
        public void setDisplayName(String displayName) {
            this.displayName = displayName;
        }

        /** 返回邮箱。 */
        public String getEmail() {
            return email;
        }

        /** 设置邮箱。 */
        public void setEmail(String email) {
            this.email = email;
        }
    }

    /** 创建团队请求。 */
    static final class CreateTeamRequest {
        @NotBlank(message = "团队名称不能为空")
        @Size(max = 60, message = "团队名称最多 60 个字符")
        private String name;

        /** 创建空请求对象供 JSON 绑定。 */
        public CreateTeamRequest() {
        }

        /** 返回团队名称。 */
        public String getName() {
            return name;
        }

        /** 设置团队名称。 */
        public void setName(String name) {
            this.name = name;
        }
    }

    /** 添加团队成员请求。 */
    static final class AddMemberRequest {
        @NotBlank(message = "用户 ID 不能为空")
        @Pattern(regexp = "USR-[1-9][0-9]*", message = "用户 ID 格式不正确")
        private String userId;

        @NotBlank(message = "成员角色不能为空")
        @Size(max = 30, message = "成员角色最多 30 个字符")
        private String role;

        /** 创建空请求对象供 JSON 绑定。 */
        public AddMemberRequest() {
        }

        /** 返回用户 ID。 */
        public String getUserId() {
            return userId;
        }

        /** 设置用户 ID。 */
        public void setUserId(String userId) {
            this.userId = userId;
        }

        /** 返回成员角色。 */
        public String getRole() {
            return role;
        }

        /** 设置成员角色。 */
        public void setRole(String role) {
            this.role = role;
        }
    }

    /** 用户公开响应。 */
    static final class UserResponse {
        private final String id;
        private final String displayName;
        private final String email;

        /** 创建用户响应。 */
        UserResponse(String id, String displayName, String email) {
            this.id = id;
            this.displayName = displayName;
            this.email = email;
        }

        /** 从内部用户创建响应。 */
        static UserResponse from(User user) {
            return new UserResponse(user.getId(), user.getDisplayName(), user.getEmail());
        }

        /** 返回用户 ID。 */
        public String getId() {
            return id;
        }

        /** 返回显示名称。 */
        public String getDisplayName() {
            return displayName;
        }

        /** 返回邮箱。 */
        public String getEmail() {
            return email;
        }
    }

    /** 团队公开响应。 */
    static final class TeamResponse {
        private final String id;
        private final String name;

        /** 创建团队响应。 */
        TeamResponse(String id, String name) {
            this.id = id;
            this.name = name;
        }

        /** 从内部团队创建响应。 */
        static TeamResponse from(Team team) {
            return new TeamResponse(team.getId(), team.getName());
        }

        /** 返回团队 ID。 */
        public String getId() {
            return id;
        }

        /** 返回团队名称。 */
        public String getName() {
            return name;
        }
    }

    /** 团队成员公开响应。 */
    static final class MemberResponse {
        private final String id;
        private final String userId;
        private final String displayName;
        private final String role;

        /** 创建成员响应。 */
        MemberResponse(String id, String userId, String displayName, String role) {
            this.id = id;
            this.userId = userId;
            this.displayName = displayName;
            this.role = role;
        }

        /** 连接用户身份与成员关系。 */
        static MemberResponse from(User user, TeamMember member) {
            return new MemberResponse(
                    member.getId(),
                    user.getId(),
                    user.getDisplayName(),
                    member.getRole());
        }

        /** 返回成员关系 ID。 */
        public String getId() {
            return id;
        }

        /** 返回关联用户 ID。 */
        public String getUserId() {
            return userId;
        }

        /** 返回显示名称。 */
        public String getDisplayName() {
            return displayName;
        }

        /** 返回团队内角色。 */
        public String getRole() {
            return role;
        }
    }

    /** 分页响应。 */
    static final class PageResponse<T> {
        private final List<T> items;
        private final String nextPageToken;

        /** 创建分页响应并保存列表快照。 */
        PageResponse(List<T> items, String nextPageToken) {
            this.items = Collections.unmodifiableList(new ArrayList<T>(items));
            this.nextPageToken = nextPageToken;
        }

        /** 返回当前页。 */
        public List<T> getItems() {
            return items;
        }

        /** 返回下一页游标。 */
        public String getNextPageToken() {
            return nextPageToken;
        }
    }

    /** 公开字段错误。 */
    static final class FieldProblem {
        private final String field;
        private final String code;
        private final String message;

        /** 创建字段错误。 */
        FieldProblem(String field, String code, String message) {
            this.field = field;
            this.code = code;
            this.message = message;
        }

        /** 返回字段名。 */
        public String getField() {
            return field;
        }

        /** 返回错误码。 */
        public String getCode() {
            return code;
        }

        /** 返回安全消息。 */
        public String getMessage() {
            return message;
        }
    }

    /** Java 8 的公开 Problem DTO。 */
    static final class ApiProblem {
        private final String type;
        private final String title;
        private final int status;
        private final String detail;
        private final String instance;
        private final String code;
        private final String traceId;
        private final List<FieldProblem> errors;

        /** 创建公开错误。 */
        ApiProblem(
                String type,
                String title,
                int status,
                String detail,
                String instance,
                String code,
                String traceId,
                List<FieldProblem> errors) {
            this.type = type;
            this.title = title;
            this.status = status;
            this.detail = detail;
            this.instance = instance;
            this.code = code;
            this.traceId = traceId;
            this.errors = Collections.unmodifiableList(new ArrayList<FieldProblem>(errors));
        }

        /** 返回问题类型。 */
        public String getType() {
            return type;
        }

        /** 返回问题标题。 */
        public String getTitle() {
            return title;
        }

        /** 返回 HTTP 状态。 */
        public int getStatus() {
            return status;
        }

        /** 返回本次失败详情。 */
        public String getDetail() {
            return detail;
        }

        /** 返回请求路径。 */
        public String getInstance() {
            return instance;
        }

        /** 返回稳定业务码。 */
        public String getCode() {
            return code;
        }

        /** 返回关联 ID。 */
        public String getTraceId() {
            return traceId;
        }

        /** 返回字段错误。 */
        public List<FieldProblem> getErrors() {
            return errors;
        }
    }

    /** 携带稳定 HTTP 映射的业务异常。 */
    static final class ApiException extends RuntimeException {
        private final HttpStatus status;
        private final String typeSlug;
        private final String title;
        private final String code;

        /** 创建业务异常。 */
        ApiException(
                HttpStatus status,
                String typeSlug,
                String title,
                String detail,
                String code) {
            super(detail);
            this.status = status;
            this.typeSlug = typeSlug;
            this.title = title;
            this.code = code;
        }
    }

    /** 用内存状态实现用户、团队和成员关系。 */
    static final class ApiService {
        private final Map<String, User> users = new LinkedHashMap<String, User>();
        private final Map<String, Team> teams = new LinkedHashMap<String, Team>();
        private final Map<String, LinkedHashMap<String, TeamMember>> membersByTeam =
                new LinkedHashMap<String, LinkedHashMap<String, TeamMember>>();
        private long nextUserId = 3L;
        private long nextTeamId = 2L;
        private long nextMemberId = 2L;

        /** 准备固定验收数据。 */
        ApiService() {
            users.put("USR-1", new User(
                    "USR-1", "周宁", "zhou@example.com", "内部备注 A"));
            users.put("USR-2", new User(
                    "USR-2", "林澄", "lin@example.com", "内部备注 B"));
            teams.put("TEAM-1", new Team("TEAM-1", "课程平台组", "内部成本中心"));
            teams.put("TEAM-EMPTY", new Team("TEAM-EMPTY", "空团队", "内部成本中心"));
            LinkedHashMap<String, TeamMember> members =
                    new LinkedHashMap<String, TeamMember>();
            members.put("MBR-1", new TeamMember("MBR-1", "USR-1", "Designer"));
            membersByTeam.put("TEAM-1", members);
            membersByTeam.put("TEAM-EMPTY", new LinkedHashMap<String, TeamMember>());
        }

        /** 查询用户。 */
        User findUser(String userId) {
            User user = users.get(userId);
            if (user == null) {
                throw new ApiException(
                        HttpStatus.NOT_FOUND,
                        "user-not-found",
                        "用户不存在",
                        "没有找到编号为 " + userId + " 的用户",
                        "USER_NOT_FOUND");
            }
            return user;
        }

        /** 查询一页用户。 */
        PageResponse<UserResponse> listUsers(int pageSize, String pageToken) {
            List<User> allUsers = new ArrayList<User>(users.values());
            int start = pageOffset(pageToken, "USR-PAGE-", allUsers.size());
            List<UserResponse> items = new ArrayList<UserResponse>();
            for (int index = start; index < allUsers.size() && items.size() < pageSize; index++) {
                items.add(UserResponse.from(allUsers.get(index)));
            }
            String nextPageToken = nextPageToken(
                    "USR-PAGE-", start, pageSize, allUsers.size());
            return new PageResponse<UserResponse>(items, nextPageToken);
        }

        /** 创建用户。 */
        User createUser(CreateUserRequest request) {
            for (User user : users.values()) {
                if (user.getEmail().equalsIgnoreCase(request.getEmail())) {
                    throw new ApiException(
                            HttpStatus.CONFLICT,
                            "user-conflict",
                            "用户状态冲突",
                            "该邮箱已经注册",
                            "USER_CONFLICT");
                }
            }
            String userId = "USR-" + nextUserId++;
            User user = new User(
                    userId,
                    request.getDisplayName(),
                    request.getEmail(),
                    "仅内部可见");
            users.put(userId, user);
            return user;
        }

        /** 查询团队。 */
        Team findTeam(String teamId) {
            Team team = teams.get(teamId);
            if (team == null) {
                throw new ApiException(
                        HttpStatus.NOT_FOUND,
                        "team-not-found",
                        "团队不存在",
                        "没有找到编号为 " + teamId + " 的团队",
                        "TEAM_NOT_FOUND");
            }
            return team;
        }

        /** 查询一页团队。 */
        PageResponse<TeamResponse> listTeams(int pageSize, String pageToken) {
            List<Team> allTeams = new ArrayList<Team>(teams.values());
            int start = pageOffset(pageToken, "TEAM-PAGE-", allTeams.size());
            List<TeamResponse> items = new ArrayList<TeamResponse>();
            for (int index = start; index < allTeams.size() && items.size() < pageSize; index++) {
                items.add(TeamResponse.from(allTeams.get(index)));
            }
            String nextPageToken = nextPageToken(
                    "TEAM-PAGE-", start, pageSize, allTeams.size());
            return new PageResponse<TeamResponse>(items, nextPageToken);
        }

        /** 创建团队并初始化空成员集合。 */
        Team createTeam(CreateTeamRequest request) {
            String teamId = "TEAM-" + nextTeamId++;
            Team team = new Team(teamId, request.getName(), "仅内部可见");
            teams.put(teamId, team);
            membersByTeam.put(teamId, new LinkedHashMap<String, TeamMember>());
            return team;
        }

        /** 查询一页团队成员。 */
        PageResponse<MemberResponse> listMembers(
                String teamId,
                int pageSize,
                String pageToken) {
            List<TeamMember> members = new ArrayList<TeamMember>(requireMembers(teamId).values());
            int start = pageOffset(pageToken, "MEMBER-PAGE-", members.size());
            List<MemberResponse> items = new ArrayList<MemberResponse>();
            for (int index = start; index < members.size() && items.size() < pageSize; index++) {
                TeamMember member = members.get(index);
                items.add(MemberResponse.from(findUser(member.getUserId()), member));
            }
            String nextPageToken = nextPageToken(
                    "MEMBER-PAGE-", start, pageSize, members.size());
            return new PageResponse<MemberResponse>(items, nextPageToken);
        }

        /** 查询一个团队成员关系。 */
        MemberResponse findMember(String teamId, String memberId) {
            TeamMember member = requireMembers(teamId).get(memberId);
            if (member == null) {
                throw new ApiException(
                        HttpStatus.NOT_FOUND,
                        "member-not-found",
                        "成员不存在",
                        "没有找到编号为 " + memberId + " 的团队成员",
                        "MEMBER_NOT_FOUND");
            }
            return MemberResponse.from(findUser(member.getUserId()), member);
        }

        /** 把已存在用户加入团队。 */
        MemberResponse addMember(String teamId, AddMemberRequest request) {
            LinkedHashMap<String, TeamMember> teamMembers = requireMembers(teamId);
            User user = findUser(request.getUserId());
            for (TeamMember existing : teamMembers.values()) {
                if (existing.getUserId().equals(user.getId())) {
                    throw new ApiException(
                            HttpStatus.CONFLICT,
                            "member-conflict",
                            "成员状态冲突",
                            "该用户已经加入当前团队",
                            "MEMBER_CONFLICT");
                }
            }
            String memberId = "MBR-" + nextMemberId++;
            TeamMember member = new TeamMember(memberId, user.getId(), request.getRole());
            teamMembers.put(memberId, member);
            return MemberResponse.from(user, member);
        }

        /** 从团队移除成员关系，不删除用户。 */
        void removeMember(String teamId, String memberId) {
            if (requireMembers(teamId).remove(memberId) == null) {
                throw new ApiException(
                        HttpStatus.NOT_FOUND,
                        "member-not-found",
                        "成员不存在",
                        "没有找到编号为 " + memberId + " 的团队成员",
                        "MEMBER_NOT_FOUND");
            }
        }

        /** 返回已存在团队的成员表。 */
        private LinkedHashMap<String, TeamMember> requireMembers(String teamId) {
            findTeam(teamId);
            return membersByTeam.get(teamId);
        }

        /** 解释当前集合签发的不透明分页 token。 */
        private int pageOffset(String pageToken, String tokenPrefix, int itemCount) {
            if (pageToken == null) {
                return 0;
            }
            if (!pageToken.startsWith(tokenPrefix)) {
                throw invalidPageToken();
            }
            try {
                String positionText = pageToken.substring(tokenPrefix.length());
                int position = Integer.parseInt(positionText);
                if (!positionText.equals(Integer.toString(position))) {
                    throw invalidPageToken();
                }
                int offset = position - 1;
                if (offset <= 0 || offset >= itemCount) {
                    throw invalidPageToken();
                }
                return offset;
            } catch (NumberFormatException exception) {
                throw invalidPageToken();
            }
        }

        /** 为仍有后续资源的页面签发 token。 */
        private String nextPageToken(
                String tokenPrefix,
                int start,
                int pageSize,
                int itemCount) {
            int nextOffset = start + pageSize;
            return nextOffset < itemCount ? tokenPrefix + (nextOffset + 1) : null;
        }

        /** 创建分页游标无效异常。 */
        private ApiException invalidPageToken() {
            return new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "invalid-page-token",
                    "分页游标无效",
                    "分页游标不属于当前资源集合",
                    "INVALID_PAGE_TOKEN");
        }
    }

    /** 提供用户资源。 */
    @Validated
    @RestController
    @RequestMapping("/api/v1/users")
    static class UserController {
        private final ApiService service;

        /** 创建用户 Controller。 */
        UserController(ApiService service) {
            this.service = service;
        }

        /** 查询一页用户。 */
        @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
        PageResponse<UserResponse> list(
                @RequestParam(name = "pageSize", defaultValue = "20")
                @Min(value = 1, message = "pageSize 最小为 1")
                @Max(value = 50, message = "pageSize 最大为 50")
                int pageSize,
                @RequestParam(name = "pageToken", required = false) String pageToken) {
            return service.listUsers(pageSize, pageToken);
        }

        /** 查询用户。 */
        @GetMapping(path = "/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
        UserResponse find(@PathVariable("userId") String userId) {
            return UserResponse.from(service.findUser(userId));
        }

        /** 创建用户。 */
        @PostMapping(
                consumes = MediaType.APPLICATION_JSON_VALUE,
                produces = MediaType.APPLICATION_JSON_VALUE)
        ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest request) {
            User user = service.createUser(request);
            URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{userId}")
                    .buildAndExpand(user.getId())
                    .toUri();
            return ResponseEntity.created(location).body(UserResponse.from(user));
        }
    }

    /** 提供团队资源。 */
    @Validated
    @RestController
    @RequestMapping("/api/v1/teams")
    static class TeamController {
        private final ApiService service;

        /** 创建团队 Controller。 */
        TeamController(ApiService service) {
            this.service = service;
        }

        /** 查询一页团队。 */
        @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
        PageResponse<TeamResponse> list(
                @RequestParam(name = "pageSize", defaultValue = "20")
                @Min(value = 1, message = "pageSize 最小为 1")
                @Max(value = 50, message = "pageSize 最大为 50")
                int pageSize,
                @RequestParam(name = "pageToken", required = false) String pageToken) {
            return service.listTeams(pageSize, pageToken);
        }

        /** 查询团队。 */
        @GetMapping(path = "/{teamId}", produces = MediaType.APPLICATION_JSON_VALUE)
        TeamResponse find(@PathVariable("teamId") String teamId) {
            return TeamResponse.from(service.findTeam(teamId));
        }

        /** 创建团队。 */
        @PostMapping(
                consumes = MediaType.APPLICATION_JSON_VALUE,
                produces = MediaType.APPLICATION_JSON_VALUE)
        ResponseEntity<TeamResponse> create(@Valid @RequestBody CreateTeamRequest request) {
            Team team = service.createTeam(request);
            URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{teamId}")
                    .buildAndExpand(team.getId())
                    .toUri();
            return ResponseEntity.created(location).body(TeamResponse.from(team));
        }
    }

    /** 提供团队内的成员关系资源。 */
    @Validated
    @RestController
    @RequestMapping("/api/v1/teams/{teamId}/members")
    static class MemberController {
        private final ApiService service;

        /** 创建成员 Controller。 */
        MemberController(ApiService service) {
            this.service = service;
        }

        /** 查询一页成员。 */
        @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
        PageResponse<MemberResponse> list(
                @PathVariable("teamId") String teamId,
                @RequestParam(name = "pageSize", defaultValue = "20")
                @Min(value = 1, message = "pageSize 最小为 1")
                @Max(value = 50, message = "pageSize 最大为 50")
                int pageSize,
                @RequestParam(name = "pageToken", required = false)
                String pageToken) {
            return service.listMembers(teamId, pageSize, pageToken);
        }

        /** 查询一个成员关系。 */
        @GetMapping(path = "/{memberId}", produces = MediaType.APPLICATION_JSON_VALUE)
        MemberResponse find(
                @PathVariable("teamId") String teamId,
                @PathVariable("memberId") String memberId) {
            return service.findMember(teamId, memberId);
        }

        /** 把已有用户加入团队。 */
        @PostMapping(
                consumes = MediaType.APPLICATION_JSON_VALUE,
                produces = MediaType.APPLICATION_JSON_VALUE)
        ResponseEntity<MemberResponse> add(
                @PathVariable("teamId") String teamId,
                @Valid @RequestBody AddMemberRequest request) {
            MemberResponse member = service.addMember(teamId, request);
            URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{memberId}")
                    .buildAndExpand(member.getId())
                    .toUri();
            return ResponseEntity.created(location).body(member);
        }

        /** 移除成员关系。 */
        @DeleteMapping("/{memberId}")
        ResponseEntity<Void> remove(
                @PathVariable("teamId") String teamId,
                @PathVariable("memberId") String memberId) {
            service.removeMember(teamId, memberId);
            return ResponseEntity.noContent().build();
        }
    }

    /** 把 Java 8 失败转换成同形 Problem JSON。 */
    @RestControllerAdvice
    static final class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
        private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);
        private static final String TYPE_ROOT = "https://api.teamflow.example/problems/";

        /** 映射业务失败。 */
        @ExceptionHandler(ApiException.class)
        ResponseEntity<Object> handleApiException(
                ApiException exception,
                HttpServletRequest request) {
            return problem(
                    exception.status,
                    new HttpHeaders(),
                    exception.typeSlug,
                    exception.title,
                    exception.getMessage(),
                    exception.code,
                    Collections.<FieldProblem>emptyList(),
                    request);
        }

        /** 映射请求体字段校验。 */
        @Override
        protected ResponseEntity<Object> handleMethodArgumentNotValid(
                MethodArgumentNotValidException exception,
                HttpHeaders headers,
                HttpStatus status,
                WebRequest request) {
            List<FieldProblem> errors = new ArrayList<FieldProblem>();
            for (FieldError error : exception.getBindingResult().getFieldErrors()) {
                errors.add(fieldProblem(error));
            }
            sortErrors(errors);
            String validationCode = bodyValidationCode(
                    exception.getParameter().getParameterType());
            return problem(
                    status,
                    headers,
                    validationCode.toLowerCase().replace('_', '-'),
                    "请求参数校验失败",
                    "有 " + errors.size() + " 个字段不符合接口约束",
                    validationCode,
                    errors,
                    servletRequest(request));
        }

        /** 映射旧版 AOP 方法参数校验。 */
        @ExceptionHandler(ConstraintViolationException.class)
        ResponseEntity<Object> handleConstraintViolation(
                ConstraintViolationException exception,
                HttpServletRequest request) {
            List<FieldProblem> errors = new ArrayList<FieldProblem>();
            for (ConstraintViolation<?> violation : exception.getConstraintViolations()) {
                String propertyPath = violation.getPropertyPath().toString();
                int separator = propertyPath.lastIndexOf('.');
                String field = separator < 0
                        ? propertyPath
                        : propertyPath.substring(separator + 1);
                errors.add(new FieldProblem(
                        field,
                        stableCode(violation.getConstraintDescriptor()
                                .getAnnotation()
                                .annotationType()
                                .getSimpleName()),
                        safeMessage(violation.getMessage())));
            }
            sortErrors(errors);
            return problem(
                    HttpStatus.BAD_REQUEST,
                    new HttpHeaders(),
                    "request-validation-failed",
                    "请求参数校验失败",
                    "请求参数不符合接口约束",
                    "REQUEST_VALIDATION_FAILED",
                    errors,
                    request);
        }

        /** 映射不可读 JSON。 */
        @Override
        protected ResponseEntity<Object> handleHttpMessageNotReadable(
                HttpMessageNotReadableException exception,
                HttpHeaders headers,
                HttpStatus status,
                WebRequest request) {
            return problem(
                    status,
                    headers,
                    "request-body-not-readable",
                    "请求体无法读取",
                    "请求体不是可读取的 JSON",
                    "REQUEST_BODY_NOT_READABLE",
                    Collections.<FieldProblem>emptyList(),
                    servletRequest(request));
        }

        /** 映射 query 类型转换失败。 */
        @Override
        protected ResponseEntity<Object> handleTypeMismatch(
                TypeMismatchException exception,
                HttpHeaders headers,
                HttpStatus status,
                WebRequest request) {
            String field = exception instanceof MethodArgumentTypeMismatchException
                    ? ((MethodArgumentTypeMismatchException) exception).getName()
                    : "request";
            List<FieldProblem> errors = Collections.singletonList(new FieldProblem(
                    field,
                    "TYPE_MISMATCH",
                    field + " 必须使用接口声明的类型"));
            return problem(
                    status,
                    headers,
                    "argument-type-mismatch",
                    "请求参数类型不正确",
                    "请检查请求参数的类型",
                    "ARGUMENT_TYPE_MISMATCH",
                    errors,
                    servletRequest(request));
        }

        /** 保留 405、415 等 MVC 内建状态。 */
        @Override
        protected ResponseEntity<Object> handleExceptionInternal(
                Exception exception,
                Object body,
                HttpHeaders headers,
                HttpStatus status,
                WebRequest request) {
            String code;
            if (status == HttpStatus.METHOD_NOT_ALLOWED) {
                code = "METHOD_NOT_ALLOWED";
            } else if (status == HttpStatus.UNSUPPORTED_MEDIA_TYPE) {
                code = "MEDIA_TYPE_NOT_SUPPORTED";
            } else {
                code = "REQUEST_REJECTED";
            }
            return problem(
                    status,
                    headers,
                    "request-rejected",
                    "请求无法处理",
                    "请求不符合当前接口的协议要求",
                    code,
                    Collections.<FieldProblem>emptyList(),
                    servletRequest(request));
        }

        /** 记录未知异常并返回去敏 500。 */
        @ExceptionHandler(Exception.class)
        ResponseEntity<Object> handleUnexpected(
                Exception exception,
                HttpServletRequest request) {
            String traceId = traceId(request);
            LOGGER.error("Unhandled request, traceId={}", traceId, exception);
            return problem(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    new HttpHeaders(),
                    "internal-error",
                    "服务器内部错误",
                    "服务器暂时无法处理请求",
                    "INTERNAL_ERROR",
                    Collections.<FieldProblem>emptyList(),
                    request);
        }

        /** 构造状态、媒体类型与字段一致的错误响应。 */
        private ResponseEntity<Object> problem(
                HttpStatus status,
                HttpHeaders headers,
                String typeSlug,
                String title,
                String detail,
                String code,
                List<FieldProblem> errors,
                HttpServletRequest request) {
            ApiProblem problem = new ApiProblem(
                    TYPE_ROOT + typeSlug,
                    title,
                    status.value(),
                    detail,
                    request.getRequestURI(),
                    code,
                    traceId(request),
                    errors);
            return ResponseEntity.status(status)
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                    .body(problem);
        }

        /** 转换字段错误。 */
        private FieldProblem fieldProblem(FieldError error) {
            return new FieldProblem(
                    error.getField(),
                    stableCode(error.getCode()),
                    safeMessage(error.getDefaultMessage()));
        }

        /** 稳定排序字段错误。 */
        private void sortErrors(List<FieldProblem> errors) {
            Collections.sort(errors, new Comparator<FieldProblem>() {
                /** 按字段名和错误码排序。 */
                @Override
                public int compare(FieldProblem left, FieldProblem right) {
                    int byField = left.getField().compareTo(right.getField());
                    return byField != 0 ? byField : left.getCode().compareTo(right.getCode());
                }
            });
        }

        /** 映射稳定字段错误码。 */
        private String stableCode(String code) {
            if ("NotBlank".equals(code)) {
                return "NOT_BLANK";
            }
            if ("Size".equals(code)) {
                return "SIZE";
            }
            if ("Pattern".equals(code)) {
                return "PATTERN";
            }
            if ("Email".equals(code)) {
                return "EMAIL";
            }
            if ("Min".equals(code)) {
                return "MIN";
            }
            if ("Max".equals(code)) {
                return "MAX";
            }
            return "INVALID";
        }

        /** 按请求 DTO 选择稳定业务校验码。 */
        private String bodyValidationCode(Class<?> requestType) {
            if (requestType == CreateUserRequest.class) {
                return "USER_VALIDATION_FAILED";
            }
            if (requestType == CreateTeamRequest.class) {
                return "TEAM_VALIDATION_FAILED";
            }
            if (requestType == AddMemberRequest.class) {
                return "MEMBER_VALIDATION_FAILED";
            }
            return "REQUEST_VALIDATION_FAILED";
        }

        /** 保证错误消息非空。 */
        private String safeMessage(String message) {
            return message == null ? "参数不符合约束" : message;
        }

        /** 取得 servlet 请求。 */
        private HttpServletRequest servletRequest(WebRequest request) {
            return ((ServletWebRequest) request).getRequest();
        }

        /** 为一次失败生成关联 ID。 */
        private String traceId(HttpServletRequest request) {
            String traceId = (String) request.getAttribute("teamflow.traceId");
            if (traceId == null) {
                traceId = UUID.randomUUID().toString().replace("-", "");
                request.setAttribute("teamflow.traceId", traceId);
            }
            return traceId;
        }
    }
}
```

### 3. 理解真实兼容差异

Java 8 用普通类、构造器和 getter 代替 record，用复制后的不可修改列表代替 `List.copyOf`，校验包从
`jakarta.*` 改为 `javax.*`，错误对象从 `ProblemDetail` 改为强类型 `ApiProblem`。这些都不能改变 JSON。

旧版 Controller 方法约束依赖类型级 `@Validated` 与 AOP 代理，所以三个 Controller 不能声明为 `final`。
否则应用会在启动时报告无法生成 CGLIB 子类。现代 MVC 不走这条旧路径，不能机械保留 `@Validated`。

执行：

```bash
mvn clean package
java -jar target/teamflow-user-team-api-java8-1.0.0.jar
```

兼容服务使用 8081。同一套请求只替换端口，状态、Location 路径与 JSON 字段保持一致。

## 七、复跑完整 HTTP 合同

### 1. 成功路径

先观察用户分页并创建用户，再观察团队分页并创建团队：

```bash
curl -i 'http://localhost:8080/api/v1/users?pageSize=1'
curl -i 'http://localhost:8080/api/v1/users?pageSize=1&pageToken=USR-PAGE-2'
curl -i -X POST http://localhost:8080/api/v1/users \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"沈若","email":"shen@example.com"}'
curl -i 'http://localhost:8080/api/v1/teams?pageSize=1'
curl -i -X POST http://localhost:8080/api/v1/teams \
  -H 'Content-Type: application/json' \
  -d '{"name":"接口平台组"}'
```

创建用户得到 201，Location 以 `/api/v1/users/USR-3` 结尾；创建团队同样得到 201，Location 以
`/api/v1/teams/TEAM-2` 结尾，body 为 `{"id":"TEAM-2","name":"接口平台组"}`。两个响应都不含
`internalNote` 或成功外壳。

再把已有 `USR-2` 加入团队：

```bash
curl -i -X POST http://localhost:8080/api/v1/teams/TEAM-1/members \
  -H 'Content-Type: application/json' \
  -d '{"userId":"USR-2","role":"Developer"}'
curl -i 'http://localhost:8080/api/v1/teams/TEAM-1/members?pageSize=1'
curl -i 'http://localhost:8080/api/v1/teams/TEAM-1/members?pageSize=1&pageToken=MEMBER-PAGE-2'
curl -i http://localhost:8080/api/v1/teams/TEAM-1/members/MBR-2
curl -i -X DELETE http://localhost:8080/api/v1/teams/TEAM-1/members/MBR-2
```

创建成员得到 201 与 `/members/MBR-2` Location；成员 body 同时含 `id=MBR-2` 与 `userId=USR-2`。最后一条
返回 204，响应 body 字节数为 0，而 `GET /api/v1/users/USR-2` 仍然返回用户。

### 2. 空页与失败路径

```bash
curl -i http://localhost:8080/api/v1/teams/TEAM-EMPTY/members
curl -i http://localhost:8080/api/v1/teams/TEAM-404/members
curl -i 'http://localhost:8080/api/v1/users?pageSize=0'
curl -i 'http://localhost:8080/api/v1/users?pageSize=abc'
curl -i 'http://localhost:8080/api/v1/teams/TEAM-1/members?pageToken=USR-PAGE-2'
curl -i -X POST http://localhost:8080/api/v1/teams/TEAM-1/members \
  -H 'Content-Type: application/json' \
  -d '{"userId":"USR-404","role":"QA"}'
curl -i -X POST http://localhost:8080/api/v1/teams \
  -H 'Content-Type: text/plain' -d 'TeamFlow'
```

结果依次证明空团队 200 与未知团队 404 不同、范围校验与类型转换都是 400、跨集合 token 是
`INVALID_PAGE_TOKEN`、合法但不存在的用户是 `USER_NOT_FOUND`，错误媒体类型仍是 415。

所有 advice 生成的错误都应满足 `application/problem+json`、HTTP status 等于 body `status`、traceId 是
32 位小写十六进制、非字段错误 `errors=[]`。未知 URL 只保证真实 404，不断言 TeamFlow Problem body。

## 八、集中排查资源边界错误

### 六个典型错误

:::pitfalls
### 把 User 和 TeamMember 当成同一个对象

**触发条件：** 成员表直接保存姓名和角色，却没有 userId 或独立 memberId。

**原因：** 全局身份、团队关系和响应投影被折叠到一个类型。

**后果：** 同一用户加入两个团队后出现两个姓名事实来源，删除成员也可能误删用户。

**错误示例：**

```java
record Member(String id, String displayName, String role) {
}
```

**正确写法：**

```java
record User(String id, String displayName, String email, String internalNote) {
}

record TeamMember(String id, String userId, String role) {
}
```

**影响版本：** 两条版本线的资源建模错误，和 record 语法无关。

**验证方式：** 让 `USR-1` 分别加入两个团队；两个成员 ID 可以不同，但 userId 必须都等于 `USR-1`。

### 用未知团队 ID 自动创建空集合

**触发条件：** 查询成员时调用 `computeIfAbsent`。

**原因：** 读取路径意外执行了创建状态的动作，团队存在性检查被跳过。

**后果：** `TEAM-404` 被伪装成 200 空页，客户端无法区分不存在与当前无成员。

**错误示例：**

```java
return membersByTeam.computeIfAbsent(teamId, ignored -> new LinkedHashMap<>());
```

**正确写法：**

```java
findTeam(teamId);
return membersByTeam.get(teamId);
```

**影响版本：** 两条版本线。

**验证方式：** 对 `TEAM-EMPTY` 与 `TEAM-404` 复跑成员列表，必须分别得到 200 空页和
`TEAM_NOT_FOUND`。

### 让成员创建请求重复提交 displayName

**触发条件：** `CreateTeamMemberRequest` 同时接收 userId、displayName 与 role。

**原因：** 本应由 User 提供的字段又被成员请求定义一次。

**后果：** 请求可能引用 `USR-1` 却提交另一姓名，Service 不知道哪个值才是真实用户。

**错误示例：**

```java
record CreateTeamMemberRequest(String userId, String displayName, String role) {
}
```

**正确写法：**

```java
record CreateTeamMemberRequest(String userId, String role) {
}
```

**影响版本：** 两条版本线的请求合同。

**验证方式：** 创建成员后只从 User 查 displayName；成员请求 body 中不允许出现由客户端维护的姓名事实。

### 把 userId 当成 memberId

**触发条件：** Location 直接写成 `/members/{userId}`。

**原因：** 关联目标 ID 被错误地当成关系资源 ID。

**后果：** 同一用户加入不同团队时无法独立追踪两条成员关系，后续关系字段也没有稳定身份。

**错误示例：**

```java
TeamMember member = new TeamMember(request.userId(), request.userId(), request.role());
```

**正确写法：**

```java
String memberId = "MBR-" + nextMemberId++;
TeamMember member = new TeamMember(memberId, request.userId(), request.role());
```

**影响版本：** 两条版本线。

**验证方式：** 成员创建响应必须同时含不同职责的 `id=MBR-*` 与 `userId=USR-*`，Location 使用前者。

### 用字段校验访问业务集合

**触发条件：** 自定义校验注解查询邮箱是否重复，或查询 userId 是否存在。

**原因：** 输入形状与当前业务状态被塞进同一 Bean Validation 规则。

**后果：** 资源缺失和状态冲突被错误地降成 400，校验器还与存储实现耦合。

**错误示例：**

```java
@ExistingUser
String userId;
```

**正确写法：**

```java
@Pattern(regexp = "USR-[1-9][0-9]*")
String userId;

User user = findUser(request.userId());
```

**影响版本：** 两条版本线。

**验证方式：** `404` 先通过格式校验，再得到 `USER_NOT_FOUND`；不带 `USR-` 的值直接得到字段 400。

### 在 Java 8 把 Validated Controller 声明为 final

**触发条件：** Java 8 兼容线为方法约束添加类型级 `@Validated`，同时保留 `final class`。

**原因：** Spring 5.2 的旧方法校验通过 AOP 代理 Controller，CGLIB 无法继承 final 类。

**后果：** 编译可以成功，但应用启动阶段因无法创建代理而失败，端口不会监听。

**错误示例：**

```java
@Validated
final class UserController {
}
```

**正确写法：**

```java
@Validated
class UserController {
}
```

**影响版本：** Java 8 / Spring Framework 5.2 兼容线；现代 MVC 不需要类型级 `@Validated`。

**验证方式：** 在真实 Java 8 下启动应用，再请求 `pageSize=0`；服务必须正常启动并返回 400，而不是启动异常。
:::

## 九、独立练习

:::exercise
### 为团队加入第二位用户

**要求：** 从全新启动的现代或 Java 8 工程出发，使用已有 `USR-2` 与 `TEAM-1` 创建第二条成员关系，role
设为 `Developer`。保存创建响应中的 member id；查询单成员与成员分页；重复加入同一 userId；删除该成员
两次。不能修改服务端源码、不能把 userId 当 memberId，也不能删除用户。

**验收：** 第一次创建为 201，Location 与 body id 都是 `MBR-2`；body 的 userId 为 `USR-2`、displayName
为 `林澄`；重复创建为 409 `MEMBER_CONFLICT`；第一次删除为零字节 204，第二次删除为 404
`MEMBER_NOT_FOUND`；最后查询 `USR-2` 仍为 200。
:::

### 1. 完整参考脚本

先安装可用的 curl 与 jq，再把端口作为第一个参数执行脚本；现代工程传 8080，Java 8 工程传 8081：

```bash
#!/bin/sh
set -eu

port="${1:-8080}"
base_url="http://localhost:$port/api/v1"
work_dir="$(mktemp -d)"
trap 'rm -r "$work_dir"' EXIT

curl -sS -D "$work_dir/create.headers" -o "$work_dir/create.json" \
  -X POST "$base_url/teams/TEAM-1/members" \
  -H 'Content-Type: application/json' \
  -d '{"userId":"USR-2","role":"Developer"}'

member_id="$(jq -r '.id' "$work_dir/create.json")"
test "$member_id" = "MBR-2"
grep -qi "/teams/TEAM-1/members/$member_id" "$work_dir/create.headers"
jq -e '.userId == "USR-2" and .displayName == "林澄" and .role == "Developer"' \
  "$work_dir/create.json" >/dev/null

curl -fsS "$base_url/teams/TEAM-1/members/$member_id" | \
  jq -e '.id == "MBR-2" and .userId == "USR-2"' >/dev/null
curl -fsS "$base_url/teams/TEAM-1/members?pageSize=1&pageToken=MEMBER-PAGE-2" | \
  jq -e '.items[0].id == "MBR-2" and .nextPageToken == null' >/dev/null

duplicate_status="$(curl -sS -o "$work_dir/duplicate.json" -w '%{http_code}' \
  -X POST "$base_url/teams/TEAM-1/members" \
  -H 'Content-Type: application/json' \
  -d '{"userId":"USR-2","role":"Developer"}')"
test "$duplicate_status" = "409"
jq -e '.code == "MEMBER_CONFLICT" and .errors == []' "$work_dir/duplicate.json" >/dev/null

first_delete="$(curl -sS -o "$work_dir/delete-1.body" -w '%{http_code}' \
  -X DELETE "$base_url/teams/TEAM-1/members/$member_id")"
test "$first_delete" = "204"
test ! -s "$work_dir/delete-1.body"

second_delete="$(curl -sS -o "$work_dir/delete-2.json" -w '%{http_code}' \
  -X DELETE "$base_url/teams/TEAM-1/members/$member_id")"
test "$second_delete" = "404"
jq -e '.code == "MEMBER_NOT_FOUND"' "$work_dir/delete-2.json" >/dev/null
curl -fsS "$base_url/users/USR-2" | jq -e '.id == "USR-2"' >/dev/null

echo "TEAM_MEMBER_EXERCISE_PASS"
```

### 2. 预期结果

脚本最后输出：

```text
TEAM_MEMBER_EXERCISE_PASS
```

练习同时证明两件容易混淆的事：成员关系拥有自己的 ID；DELETE 的最终效果幂等，但第一次与第二次响应
可以分别是 204 和 404。

## 十、本课小结

用户与团队 API 的关键不是端点数量，而是身份与职责稳定。User 保存全局用户事实，Team 独立存在，
TeamMember 用自己的 ID 表示某个用户在某个团队中的关系；成员响应可以投影姓名，但成员创建不能重新定义
姓名。

三个集合共享分页外形，却各自解释 token；DTO 只做形状校验，Service 处理存在性、唯一性和关系冲突；
Controller 只适配 HTTP，advice 统一失败。现代与 Java 8 内部 API 不同，最终 200、201、204、400、404、
405、409、415 与 Problem JSON 必须相同。本课到此停止，文件、跨域与后续能力不在当前 API 中提前实现。

## 累计项目衔接

累计项目用 `UserController`、`TeamController` 和 `TeamDirectoryService` 承接本课资源合同，成员关系拥有独立
ID，邮箱与成员重复分别返回 `USER_CONFLICT` 和 `MEMBER_CONFLICT`。当前状态只保存在进程内，持久化由后续
数据库课程接管。
