---
id: backend.java.learn.intermediate.project-and-task-api-project
type: lesson
title: 实战：项目与任务 API
summary: 把项目归属、项目内任务、分页、完整替换、Problem Details 与 OpenAPI 合成可运行的 TeamFlow REST API
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 300
prerequisites:
  - backend.java.learn.intermediate.openapi-documentation-and-api-integration
objectives:
  - 能把已有用户与团队端点和新增项目与任务端点合成同一份可运行快照。
  - 能区分 Team、Project 与 Task 的资源身份，并让归属关系只保留一个事实来源。
  - 能实现项目分页、创建和查询，以及项目内任务的分页、创建、查询、完整替换和删除。
  - 能让项目和任务创建返回 201、Location 与当前资源表示，让删除返回零字节 204。
  - 能把任务分页 token 绑定到 projectId 与 status 筛选上下文，拒绝跨集合复用。
  - 能把 DTO 形状校验与团队、项目、任务存在性检查放在正确边界。
  - 能让现代 ProblemDetail 与 Java 8 ApiProblem 保持同形错误 JSON。
  - 能让运行时响应、OpenAPI 3.0.1 与 Swagger UI 展示同一份项目任务合同。
  - 能在 JDK 25 与真实 Java 8 环境中复跑相同的 HTTP 与文档验收矩阵。
recap:
  - Project 通过 teamId 归属 Team，Task 通过 projectId 归属 Project，响应不依赖重复保存的父资源名称。
  - 项目使用顶级集合 URI，任务使用项目内嵌套 URI；任务 ID 不能绕过项目范围查询。
  - 创建请求不接收服务端生成的 ID，任务创建请求也不接收 projectId 与默认 status。
  - PUT 请求完整替换全部可编辑任务字段，不能只发送 status 冒充部分更新。
  - 项目与任务分页继续返回 items 和 nextPageToken，任务 token 同时绑定项目与筛选条件。
  - DTO 约束检查输入形状，Service 检查资源存在性；Controller 只编排 Location 与状态。
  - 两条版本线使用不同 Spring、校验与 springdoc 工件，但公开 URL、状态、JSON 与 OpenAPI 版本一致。
  - 本课只承诺进程内可观察状态，不承诺持久化、事务、并发一致性或可靠幂等。
related:
  - backend.java.learn.basics.task-api-design-project
  - backend.java.learn.basics.unified-api-contract
  - backend.java.learn.intermediate.user-and-team-api-project
  - backend.java.learn.intermediate.openapi-documentation-and-api-integration
tags:
  - Java
  - Spring Boot
  - Spring MVC
  - REST API
  - 项目
  - 任务
  - OpenAPI
  - Problem Details
appliesTo: JDK 25、Spring Boot 4.1.0、Spring Framework 7.0.8、springdoc-openapi 3.1.0 主线；Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE、springdoc-openapi 1.8.0 兼容写法；两线输出 OpenAPI 3.0.1
verifiedAt: 2026-08-20
sources:
  - id: java-25-project-task-offset-date-time
    title: Java SE 25 API - OffsetDateTime
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/OffsetDateTime.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java SE 25；OffsetDateTime.parse 同样适用于 Java 8
    claims:
      - OffsetDateTime.parse 校验带 UTC 偏移的 ISO 日期时间文本
  - id: spring-boot-41-project-task-system
    title: Spring Boot 4.1 System Requirements
    url: https://docs.spring.io/spring-boot/4.1/system-requirements.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Spring Boot 4.1.0 支持 JDK 25，并要求 Spring Framework 7.0.8 或以上
  - id: spring-boot-41-project-task-build
    title: Spring Boot 4.1 Build Systems
    url: https://docs.spring.io/spring-boot/4.1/reference/using/build-systems.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Servlet MVC 与 Bean Validation 分别使用 webmvc 和 validation starter
  - id: spring-7-project-task-validation
    title: Spring Framework 7.0 - Validation
    url: https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-controller/ann-validation.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - 请求体对象校验与 Controller 方法参数校验使用不同处理路径
      - 现代 MVC 方法校验不需要在 Controller 类型上添加 Validated
  - id: spring-7-project-task-errors
    title: Spring Framework 7.0 - Error Responses
    url: https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-ann-rest-exceptions.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - ProblemDetail 与 ResponseEntityExceptionHandler 提供 RFC 9457 集成
  - id: spring-708-project-task-response-entity
    title: ResponseEntity API - Spring Framework 7.0.8
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/http/ResponseEntity.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - created 与 noContent builder 分别建立 201 + Location 和 204 响应
  - id: spring-boot-2312-project-task-system
    title: Spring Boot 2.3.12 System Requirements
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java 8 / Spring Boot 2.3.12.RELEASE
    claims:
      - Spring Boot 2.3.12.RELEASE 支持 Java 8 并使用 Spring Framework 5.2.15.RELEASE
  - id: spring-5215-project-task-web
    title: Spring Framework 5.2.15.RELEASE Web MVC Reference
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/web.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Java 8 兼容线使用 javax.validation 与类型级 Validated 的旧方法校验路径
  - id: rfc-9110-project-task-api
    title: RFC 9110 - HTTP Semantics
    url: https://www.rfc-editor.org/rfc/rfc9110.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: HTTP semantics
    claims:
      - GET、POST、PUT、DELETE 的方法语义
      - 200、201、204、400、404 与 415 的状态语义以及 Location 的创建语义
  - id: rfc-9457-project-task-api
    title: RFC 9457 - Problem Details for HTTP APIs
    url: https://www.rfc-editor.org/rfc/rfc9457.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: HTTP Problem Details
    claims:
      - 定义 application/problem+json、标准成员、扩展成员与安全信息边界
  - id: aip-158-project-task-pagination
    title: AIP-158 - Pagination
    url: https://google.aip.dev/158
    sourceOrigin: official
    sourceType: engineering-reference
    appliesTo: API pagination model
    claims:
      - pageSize、pageToken 与 nextPageToken 组成分页合同，token 对客户端不透明
      - 下一页请求必须保持除 pageToken 外的查询上下文一致
  - id: springdoc-31-project-task-documentation
    title: springdoc-openapi 3 Documentation
    url: https://springdoc.org/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: springdoc-openapi 3.1.0
    claims:
      - Spring MVC UI starter、OpenAPI 文档与 Swagger UI 的默认入口
      - Spring MVC、Bean Validation 与 Swagger 注解参与文档生成
  - id: springdoc-v1-project-task-documentation
    title: springdoc-openapi v1 Documentation
    url: https://springdoc.org/v1/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: springdoc-openapi 1.8.0
    claims:
      - Boot 2 使用 springdoc-openapi-ui 旧工件并生成 OpenAPI 3.0 文档
  - id: openapi-304-project-task-specification
    title: OpenAPI Specification 3.0.4
    url: https://spec.openapis.org/oas/v3.0.4.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: OpenAPI 3.0
    claims:
      - paths、Operation、Parameter、Request Body、Responses 与 Schema 的规范合同
      - operationId 必须在整份 OpenAPI 描述中唯一
  - id: springdoc-3314-project-task-schema-warning
    title: springdoc-openapi issue 3314 - JsonSchema cloning warning
    url: https://github.com/springdoc/springdoc-openapi/issues/3314
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: springdoc-openapi 3.1.0、OpenAPI 3.1、带 Bean Validation 约束的查询参数
    claims:
      - 3.1.0 克隆带校验约束的 OAS 3.1 查询参数 Schema 时会发生 JsonSchema type 转换警告
      - 本课继续沿用已经验证的 OAS 3.0 临时规避配置
---

# 实战：项目与任务 API

TeamFlow 已经有用户、团队、统一错误、前端联调和接口文档。现在需要补上协作工作的核心对象：团队创建
项目，项目承载任务，任务在自己的项目范围内被查询、替换和删除。本课把前面分散实现的 Spring MVC 能力
合成一个可运行的项目与任务 API，不重新发明响应外壳或错误格式。

示例继续使用内存状态，目的是固定当前阶段的公开 HTTP 合同。数据库、事务、并发更新、认证授权、缓存、可靠
幂等、项目删除、任务批量操作和 OpenAPI 代码生成都留给后续课程。

## 一、先固定三层资源身份

### 1. Project 只引用 Team

项目是独立资源，`teamId` 只保存所属团队的稳定身份，不复制团队名称：

```json
{"id":"PRJ-1","teamId":"TEAM-1","name":"课程平台"}
```

团队改名时，项目仍引用同一个 `TEAM-1`。创建项目只接收调用方能决定的 `teamId` 和 `name`，项目 ID 由
服务端分配。`TEAM-1` 的格式正确不等于团队存在，格式由 DTO 校验，存在性由 Service 查询。

### 2. Task 只在所属 Project 下寻址

任务响应包含 `projectId`，但 URL 已经限定父资源：

```text
/api/v1/projects/PRJ-1/tasks/TASK-1
```

即使 `TASK-1` 存在于另一个项目，使用错误的 `projectId` 也必须得到 404。Service 先取得当前项目的任务表，
再按 `taskId` 查询，不能先全局查任务后忽略父资源。

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

### 3. 请求与响应不能共用身份字段

`CreateTaskRequest` 只包含 `title`、`dueAt` 与 `assignee`。`id` 由服务端生成，`projectId` 来自路径，初始
`status` 固定为 `TODO`。完整替换请求包含全部可编辑字段，但仍不重复 ID：

```json
{
  "title": "补齐课程目录",
  "status": "DONE",
  "dueAt": "2026-08-22T18:00:00+08:00",
  "assignee": "lin"
}
```

## 二、把端点写成一张可验收合同

### 1. 保留已有用户与团队端点

完整工程不是只会识别两个硬编码团队 ID。它保留前置实战已经完成的用户与团队分页、创建和查询端点，
项目创建再通过同一个 Team 存储检查 `teamId`：

| 资源 | 分页 | 创建 | 查询 |
| --- | --- | --- | --- |
| 用户 | `GET /api/v1/users` | `POST /api/v1/users` | `GET /api/v1/users/{userId}` |
| 团队 | `GET /api/v1/teams` | `POST /api/v1/teams` | `GET /api/v1/teams/{teamId}` |

本课不重新讲解这些端点，而是把它们保留在最终可运行快照中。这样新建团队得到的 ID 可以立即用于创建
项目，用户、团队、项目和任务也由同一进程、同一错误合同与同一份 OpenAPI 描述提供。

### 2. 项目端点

| 场景 | method 与 URI | 输入 | 成功结果 |
| --- | --- | --- | --- |
| 项目分页 | `GET /api/v1/projects` | `pageSize`、`pageToken` | 200 + 项目分页 |
| 创建项目 | `POST /api/v1/projects` | `CreateProjectRequest` | 201 + `Location` + 项目 |
| 查询项目 | `GET /api/v1/projects/{projectId}` | 路径 ID | 200 + 项目 |

项目不在本课更新或删除。现在定义级联删除，会提前引入任务如何处置、权限、事务和并发等尚未学习的规则。

### 3. 项目内任务端点

| 场景 | method 与 URI | 输入 | 成功结果 |
| --- | --- | --- | --- |
| 任务分页 | `GET /api/v1/projects/{projectId}/tasks` | 分页参数、可选 `status` | 200 + 任务分页 |
| 创建任务 | `POST /api/v1/projects/{projectId}/tasks` | `CreateTaskRequest` | 201 + `Location` + 任务 |
| 查询任务 | `GET /api/v1/projects/{projectId}/tasks/{taskId}` | 路径 ID | 200 + 任务 |
| 完整替换 | `PUT /api/v1/projects/{projectId}/tasks/{taskId}` | `ReplaceTaskRequest` | 200 + 新表示 |
| 删除任务 | `DELETE /api/v1/projects/{projectId}/tasks/{taskId}` | 路径 ID | 204，无正文 |

PUT 请求替换全部可编辑字段。只发送 `{"status":"DONE"}` 会因为缺少标题、截止时间和负责人而得到 400；
本课没有定义 PATCH、JSON Merge Patch 或 `/status` 动作路径。

### 4. 错误状态仍由原边界产生

| 失败位置 | 示例 | 结果 |
| --- | --- | --- |
| DTO 形状 | 空标题、未知枚举 | 400 + 字段错误或不可读 JSON |
| query 形状 | `pageSize=0`、`pageSize=abc` | 400 |
| 业务存在性 | 未知 team、project 或 task | 404 + 稳定业务码 |
| 分页上下文 | 跨集合、跨项目、跨筛选复用 token | 400 `INVALID_PAGE_TOKEN` |
| 请求媒体类型 | POST 或 PUT 使用 `text/plain` | 415 |

Controller 不捕获这些失败；Service 也不创建 Problem JSON。advice 把两种来源统一为
`application/problem+json`。

## 三、让分页 token 记住查询上下文

### 1. 项目分页沿用独立前缀

项目页使用 `PROJECT-PAGE-2` 一类可观察 token。它只是内存示例的教学编码，客户端仍应把 token 当作
不透明字符串，不能自行计算下一页。

### 2. 任务 token 同时绑定项目与筛选

任务列表有 `projectId` 和可选 `status` 两个上下文。同一位置在不同上下文中不是同一页，因此示例签发：

```text
TASK-PAGE-PRJ-1-TODO-2
TASK-PAGE-PRJ-1-ALL-2
TASK-PAGE-PRJ-2-TODO-2
```

收到 token 时，Service 先按当前 project 与 status 生成完整前缀，再解释末尾位置。把第一枚 token 用到
`PRJ-2` 或去掉 `status=TODO`，都返回 400，而不是悄悄读取另一组结果。

### 3. 内存顺序不是持久化承诺

`LinkedHashMap` 让当前进程中的验收顺序稳定，`PageResponse` 保存当前页列表快照。它没有解决并发插入造成的
翻页漂移，也不会在重启后恢复 token；真实持久化分页属于后续数据库课程。

## 四、JDK 25 完整工程

### 1. 创建独立 Maven 工程

创建 `teamflow-project-task-api-modern`。示例把模型、DTO、Service、Controller 与 advice 放在同一个启动类的
静态嵌套类型中，便于从课程页面完整复制；真实项目可以按职责拆文件，不改变接口合同。

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
  <artifactId>teamflow-project-task-api-modern</artifactId>
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
      <groupId>org.springdoc</groupId>
      <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
      <version>3.1.0</version>
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
spring.application.name=teamflow-project-task-api-modern
springdoc.api-docs.version=OPENAPI_3_0
```

**社区补充：** springdoc-openapi 3.1.0 的维护 issue 已复现带 `@Min` 的查询参数在 OAS 3.1 Schema 克隆路径
产生警告。本课继续沿用前课验证过的 OAS 3.0 临时配置，不删除校验，也不把临时规避描述成最终修复；待对应
修复发布后再移除配置并重跑文档与日志反馈环。

### 2. 编写现代完整源码

`src/main/java/com/teamflow/api/TeamFlowApplication.java`：

```java
package com.teamflow.api;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.net.URI;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.TypeMismatchException;
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
import org.springframework.validation.method.ParameterValidationResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

/** 启动 TeamFlow 项目与任务 API。 */
@SpringBootApplication
@OpenAPIDefinition(info = @Info(title = "TeamFlow API", version = "1.0.0"))
@Import({
        TeamFlowApplication.ApiService.class,
        TeamFlowApplication.UserController.class,
        TeamFlowApplication.TeamController.class,
        TeamFlowApplication.ProjectController.class,
        TeamFlowApplication.TaskController.class,
        TeamFlowApplication.GlobalExceptionHandler.class
})
public class TeamFlowApplication {

    /** 启动应用。 */
    public static void main(String[] args) {
        SpringApplication.run(TeamFlowApplication.class, args);
    }

    /** 任务状态。 */
    @Schema(name = "TaskStatus", description = "任务状态", allowableValues = {"TODO", "DONE"})
    enum TaskStatus {
        TODO,
        DONE
    }

    /** 用户内部模型。 */
    record User(String id, String displayName, String email) {
    }

    /** 团队内部模型。 */
    record Team(String id, String name) {
    }

    /** 项目内部模型。 */
    record Project(String id, String teamId, String name) {
    }

    /** 任务内部模型。 */
    record Task(
            String id,
            String projectId,
            String title,
            TaskStatus status,
            String dueAt,
            String assignee) {
    }

    /** 创建用户请求。 */
    @Schema(name = "CreateUserRequest", description = "创建用户所需字段")
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
    @Schema(name = "CreateTeamRequest", description = "创建团队所需字段")
    record CreateTeamRequest(
            @NotBlank(message = "团队名称不能为空")
            @Size(max = 60, message = "团队名称最多 60 个字符")
            String name) {
    }

    /** 创建项目请求。 */
    @Schema(name = "CreateProjectRequest", description = "创建项目所需字段")
    record CreateProjectRequest(
            @Schema(description = "所属团队 ID", example = "TEAM-1")
            @NotBlank(message = "团队 ID 不能为空")
            @Pattern(regexp = "TEAM-[1-9][0-9]*", message = "团队 ID 格式不正确")
            String teamId,
            @Schema(description = "项目名称", example = "课程平台")
            @NotBlank(message = "项目名称不能为空")
            @Size(max = 80, message = "项目名称最多 80 个字符")
            String name) {
    }

    /** 创建任务请求。 */
    @Schema(name = "CreateTaskRequest", description = "创建任务所需字段")
    record CreateTaskRequest(
            @Schema(description = "任务标题", example = "补齐课程目录")
            @NotBlank(message = "任务标题不能为空")
            @Size(max = 120, message = "任务标题最多 120 个字符")
            String title,
            @Schema(description = "带偏移的截止时间", example = "2026-08-22T18:00:00+08:00")
            @NotBlank(message = "截止时间不能为空")
            @Size(max = 40, message = "截止时间最多 40 个字符")
            String dueAt,
            @Schema(description = "负责人", example = "lin")
            @NotBlank(message = "负责人不能为空")
            @Size(max = 40, message = "负责人最多 40 个字符")
            String assignee) {
    }

    /** 完整替换任务请求。 */
    @Schema(name = "ReplaceTaskRequest", description = "任务全部可编辑字段")
    record ReplaceTaskRequest(
            @NotBlank(message = "任务标题不能为空")
            @Size(max = 120, message = "任务标题最多 120 个字符")
            String title,
            @NotNull(message = "任务状态不能为空")
            TaskStatus status,
            @NotBlank(message = "截止时间不能为空")
            @Size(max = 40, message = "截止时间最多 40 个字符")
            String dueAt,
            @NotBlank(message = "负责人不能为空")
            @Size(max = 40, message = "负责人最多 40 个字符")
            String assignee) {
    }

    /** 用户公开响应。 */
    @Schema(name = "UserResponse", description = "用户公开表示")
    record UserResponse(String id, String displayName, String email) {
        /** 从内部用户生成公开响应。 */
        static UserResponse from(User user) {
            return new UserResponse(user.id(), user.displayName(), user.email());
        }
    }

    /** 团队公开响应。 */
    @Schema(name = "TeamResponse", description = "团队公开表示")
    record TeamResponse(String id, String name) {
        /** 从内部团队生成公开响应。 */
        static TeamResponse from(Team team) {
            return new TeamResponse(team.id(), team.name());
        }
    }

    /** 项目公开响应。 */
    @Schema(name = "ProjectResponse", description = "项目公开表示")
    record ProjectResponse(String id, String teamId, String name) {
        /** 从内部项目生成公开响应。 */
        static ProjectResponse from(Project project) {
            return new ProjectResponse(project.id(), project.teamId(), project.name());
        }
    }

    /** 任务公开响应。 */
    @Schema(name = "TaskResponse", description = "任务公开表示")
    record TaskResponse(
            String id,
            String projectId,
            String title,
            TaskStatus status,
            String dueAt,
            String assignee) {
        /** 从内部任务生成公开响应。 */
        static TaskResponse from(Task task) {
            return new TaskResponse(
                    task.id(),
                    task.projectId(),
                    task.title(),
                    task.status(),
                    task.dueAt(),
                    task.assignee());
        }
    }

    /** 分页响应。 */
    @Schema(name = "PageResponse", description = "稳定分页外形")
    record PageResponse<T>(List<T> items, String nextPageToken) {
        /** 保存当前页列表快照。 */
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

    /** 用内存状态实现用户、团队、项目与任务资源。 */
    static final class ApiService {
        private final Map<String, User> users = new LinkedHashMap<>();
        private final Map<String, Team> teams = new LinkedHashMap<>();
        private final Map<String, Project> projects = new LinkedHashMap<>();
        private final Map<String, LinkedHashMap<String, Task>> tasksByProject =
                new LinkedHashMap<>();
        private long nextUserId = 3L;
        private long nextTeamId = 3L;
        private long nextProjectId = 3L;
        private long nextTaskId = 3L;

        /** 准备固定验收数据。 */
        ApiService() {
            users.put("USR-1", new User("USR-1", "周宁", "zhou@example.com"));
            users.put("USR-2", new User("USR-2", "林澄", "lin@example.com"));
            teams.put("TEAM-1", new Team("TEAM-1", "课程平台组"));
            teams.put("TEAM-2", new Team("TEAM-2", "开发者门户组"));
            addSeedProject(new Project("PRJ-1", "TEAM-1", "课程平台"));
            addSeedProject(new Project("PRJ-2", "TEAM-2", "开发者门户"));
            tasksByProject.get("PRJ-1").put(
                    "TASK-1",
                    new Task(
                            "TASK-1",
                            "PRJ-1",
                            "补齐课程目录",
                            TaskStatus.TODO,
                            "2026-08-22T18:00:00+08:00",
                            "lin"));
            tasksByProject.get("PRJ-1").put(
                    "TASK-2",
                    new Task(
                            "TASK-2",
                            "PRJ-1",
                            "核对接口文档",
                            TaskStatus.DONE,
                            "2026-08-23T18:00:00+08:00",
                            "zhou"));
        }

        /** 查询一页用户。 */
        PageResponse<UserResponse> listUsers(int pageSize, String pageToken) {
            List<User> allUsers = new ArrayList<>(users.values());
            int start = pageOffset(pageToken, "USER-PAGE-", allUsers.size());
            List<UserResponse> items = allUsers.stream()
                    .skip(start)
                    .limit(pageSize)
                    .map(UserResponse::from)
                    .toList();
            return new PageResponse<>(
                    items,
                    nextPageToken("USER-PAGE-", start, pageSize, allUsers.size()));
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
            User user = new User(userId, request.displayName(), request.email());
            users.put(userId, user);
            return user;
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

        /** 查询一页团队。 */
        PageResponse<TeamResponse> listTeams(int pageSize, String pageToken) {
            List<Team> allTeams = new ArrayList<>(teams.values());
            int start = pageOffset(pageToken, "TEAM-PAGE-", allTeams.size());
            List<TeamResponse> items = allTeams.stream()
                    .skip(start)
                    .limit(pageSize)
                    .map(TeamResponse::from)
                    .toList();
            return new PageResponse<>(
                    items,
                    nextPageToken("TEAM-PAGE-", start, pageSize, allTeams.size()));
        }

        /** 创建团队。 */
        Team createTeam(CreateTeamRequest request) {
            String teamId = "TEAM-" + nextTeamId++;
            Team team = new Team(teamId, request.name());
            teams.put(teamId, team);
            return team;
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

        /** 查询一页项目。 */
        PageResponse<ProjectResponse> listProjects(int pageSize, String pageToken) {
            List<Project> allProjects = new ArrayList<>(projects.values());
            int start = pageOffset(pageToken, "PROJECT-PAGE-", allProjects.size());
            List<ProjectResponse> items = allProjects.stream()
                    .skip(start)
                    .limit(pageSize)
                    .map(ProjectResponse::from)
                    .toList();
            return new PageResponse<>(
                    items,
                    nextPageToken("PROJECT-PAGE-", start, pageSize, allProjects.size()));
        }

        /** 创建项目并初始化空任务集合。 */
        Project createProject(CreateProjectRequest request) {
            findTeam(request.teamId());
            String projectId = "PRJ-" + nextProjectId++;
            Project project = new Project(projectId, request.teamId(), request.name());
            projects.put(projectId, project);
            tasksByProject.put(projectId, new LinkedHashMap<>());
            return project;
        }

        /** 查询项目。 */
        Project findProject(String projectId) {
            Project project = projects.get(projectId);
            if (project == null) {
                throw new ApiException(
                        HttpStatus.NOT_FOUND,
                        "project-not-found",
                        "项目不存在",
                        "没有找到编号为 " + projectId + " 的项目",
                        "PROJECT_NOT_FOUND");
            }
            return project;
        }

        /** 按项目与状态查询一页任务。 */
        PageResponse<TaskResponse> listTasks(
                String projectId,
                TaskStatus status,
                int pageSize,
                String pageToken) {
            List<Task> filtered = requireTasks(projectId).values().stream()
                    .filter(task -> status == null || task.status() == status)
                    .toList();
            String tokenPrefix = taskTokenPrefix(projectId, status);
            int start = pageOffset(pageToken, tokenPrefix, filtered.size());
            List<TaskResponse> items = filtered.stream()
                    .skip(start)
                    .limit(pageSize)
                    .map(TaskResponse::from)
                    .toList();
            return new PageResponse<>(
                    items,
                    nextPageToken(tokenPrefix, start, pageSize, filtered.size()));
        }

        /** 创建任务并使用 TODO 作为初始状态。 */
        Task createTask(String projectId, CreateTaskRequest request) {
            LinkedHashMap<String, Task> projectTasks = requireTasks(projectId);
            String dueAt = requireDueAt(request.dueAt());
            String taskId = "TASK-" + nextTaskId++;
            Task task = new Task(
                    taskId,
                    projectId,
                    request.title(),
                    TaskStatus.TODO,
                    dueAt,
                    request.assignee());
            projectTasks.put(taskId, task);
            return task;
        }

        /** 在指定项目中查询任务。 */
        Task findTask(String projectId, String taskId) {
            Task task = requireTasks(projectId).get(taskId);
            if (task == null) {
                throw new ApiException(
                        HttpStatus.NOT_FOUND,
                        "task-not-found",
                        "任务不存在",
                        "当前项目中没有编号为 " + taskId + " 的任务",
                        "TASK_NOT_FOUND");
            }
            return task;
        }

        /** 完整替换指定项目中的任务。 */
        Task replaceTask(String projectId, String taskId, ReplaceTaskRequest request) {
            LinkedHashMap<String, Task> projectTasks = requireTasks(projectId);
            findTask(projectId, taskId);
            String dueAt = requireDueAt(request.dueAt());
            Task replaced = new Task(
                    taskId,
                    projectId,
                    request.title(),
                    request.status(),
                    dueAt,
                    request.assignee());
            projectTasks.put(taskId, replaced);
            return replaced;
        }

        /** 删除指定项目中的任务。 */
        void deleteTask(String projectId, String taskId) {
            LinkedHashMap<String, Task> projectTasks = requireTasks(projectId);
            if (projectTasks.remove(taskId) == null) {
                throw new ApiException(
                        HttpStatus.NOT_FOUND,
                        "task-not-found",
                        "任务不存在",
                        "当前项目中没有编号为 " + taskId + " 的任务",
                        "TASK_NOT_FOUND");
            }
        }

        /** 保存固定项目并创建任务集合。 */
        private void addSeedProject(Project project) {
            projects.put(project.id(), project);
            tasksByProject.put(project.id(), new LinkedHashMap<>());
        }

        /** 确认截止时间是带偏移的 ISO 日期时间。 */
        private String requireDueAt(String dueAt) {
            try {
                OffsetDateTime.parse(dueAt);
                return dueAt;
            } catch (DateTimeParseException exception) {
                throw new ApiException(
                        HttpStatus.BAD_REQUEST,
                        "invalid-time",
                        "截止时间格式不正确",
                        "dueAt 必须是带 UTC 偏移的 ISO 日期时间",
                        "INVALID_TIME");
            }
        }

        /** 返回已存在项目的任务表。 */
        private LinkedHashMap<String, Task> requireTasks(String projectId) {
            findProject(projectId);
            return tasksByProject.get(projectId);
        }

        /** 为任务查询上下文生成专用 token 前缀。 */
        private String taskTokenPrefix(String projectId, TaskStatus status) {
            return "TASK-PAGE-" + projectId + "-" + (status == null ? "ALL" : status.name()) + "-";
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
                    "分页游标不属于当前资源集合与查询上下文",
                    "INVALID_PAGE_TOKEN");
        }
    }

    /** 提供用户资源。 */
    @Tag(name = "Users", description = "用户资源")
    @RestController
    @RequestMapping("/api/v1/users")
    static final class UserController {
        private final ApiService service;

        /** 创建用户 Controller。 */
        UserController(ApiService service) {
            this.service = service;
        }

        /** 查询一页用户。 */
        @Operation(operationId = "listUsers", summary = "查询用户分页")
        @ApiResponses({
            @ApiResponse(responseCode = "200", description = "查询成功"),
            @ApiResponse(
                    responseCode = "400",
                    description = "分页参数无效",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ProblemDetail.class)))
        })
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
        @Operation(operationId = "getUser", summary = "查询单个用户")
        @ApiResponses({
            @ApiResponse(responseCode = "200", description = "查询成功"),
            @ApiResponse(
                    responseCode = "404",
                    description = "用户不存在",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ProblemDetail.class)))
        })
        @GetMapping(path = "/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
        UserResponse find(@PathVariable("userId") String userId) {
            return UserResponse.from(service.findUser(userId));
        }

        /** 创建用户。 */
        @Operation(operationId = "createUser", summary = "创建用户")
        @ApiResponses({
            @ApiResponse(responseCode = "201", description = "创建成功"),
            @ApiResponse(
                    responseCode = "400",
                    description = "请求体校验失败",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(
                    responseCode = "409",
                    description = "用户邮箱已存在",
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
    @Tag(name = "Teams", description = "团队资源")
    @RestController
    @RequestMapping("/api/v1/teams")
    static final class TeamController {
        private final ApiService service;

        /** 创建团队 Controller。 */
        TeamController(ApiService service) {
            this.service = service;
        }

        /** 查询一页团队。 */
        @Operation(operationId = "listTeams", summary = "查询团队分页")
        @ApiResponses({
            @ApiResponse(responseCode = "200", description = "查询成功"),
            @ApiResponse(
                    responseCode = "400",
                    description = "分页参数无效",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ProblemDetail.class)))
        })
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
        @Operation(operationId = "getTeam", summary = "查询单个团队")
        @ApiResponses({
            @ApiResponse(responseCode = "200", description = "查询成功"),
            @ApiResponse(
                    responseCode = "404",
                    description = "团队不存在",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ProblemDetail.class)))
        })
        @GetMapping(path = "/{teamId}", produces = MediaType.APPLICATION_JSON_VALUE)
        TeamResponse find(@PathVariable("teamId") String teamId) {
            return TeamResponse.from(service.findTeam(teamId));
        }

        /** 创建团队。 */
        @Operation(operationId = "createTeam", summary = "创建团队")
        @ApiResponses({
            @ApiResponse(responseCode = "201", description = "创建成功"),
            @ApiResponse(
                    responseCode = "400",
                    description = "请求体校验失败",
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

    /** 提供项目资源。 */
    @Tag(name = "Projects", description = "项目资源")
    @RestController
    @RequestMapping("/api/v1/projects")
    static final class ProjectController {
        private final ApiService service;

        /** 创建项目 Controller。 */
        ProjectController(ApiService service) {
            this.service = service;
        }

        /** 查询一页项目。 */
        @Operation(operationId = "listProjects", summary = "查询项目分页")
        @ApiResponses({
            @ApiResponse(responseCode = "200", description = "查询成功"),
            @ApiResponse(
                    responseCode = "400",
                    description = "分页参数无效",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ProblemDetail.class)))
        })
        @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
        PageResponse<ProjectResponse> list(
                @RequestParam(defaultValue = "20")
                @Min(value = 1, message = "pageSize 最小为 1")
                @Max(value = 50, message = "pageSize 最大为 50")
                int pageSize,
                @RequestParam(required = false) String pageToken) {
            return service.listProjects(pageSize, pageToken);
        }

        /** 查询项目。 */
        @Operation(operationId = "getProject", summary = "查询单个项目")
        @ApiResponses({
            @ApiResponse(responseCode = "200", description = "查询成功"),
            @ApiResponse(
                    responseCode = "404",
                    description = "项目不存在",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ProblemDetail.class)))
        })
        @GetMapping(path = "/{projectId}", produces = MediaType.APPLICATION_JSON_VALUE)
        ProjectResponse find(@PathVariable("projectId") String projectId) {
            return ProjectResponse.from(service.findProject(projectId));
        }

        /** 创建项目。 */
        @Operation(operationId = "createProject", summary = "创建项目")
        @ApiResponses({
            @ApiResponse(responseCode = "201", description = "创建成功"),
            @ApiResponse(
                    responseCode = "400",
                    description = "请求体校验失败",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(
                    responseCode = "404",
                    description = "团队不存在",
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
        @PostMapping(
                consumes = MediaType.APPLICATION_JSON_VALUE,
                produces = MediaType.APPLICATION_JSON_VALUE)
        ResponseEntity<ProjectResponse> create(
                @Valid @RequestBody CreateProjectRequest request) {
            Project project = service.createProject(request);
            URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{projectId}")
                    .buildAndExpand(project.id())
                    .toUri();
            return ResponseEntity.created(location).body(ProjectResponse.from(project));
        }
    }

    /** 提供项目内任务资源。 */
    @Tag(name = "Project Tasks", description = "项目内任务资源")
    @RestController
    @RequestMapping("/api/v1/projects/{projectId}/tasks")
    static final class TaskController {
        private final ApiService service;

        /** 创建任务 Controller。 */
        TaskController(ApiService service) {
            this.service = service;
        }

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
            return service.listTasks(projectId, status, pageSize, pageToken);
        }

        /** 创建项目任务。 */
        @Operation(operationId = "createProjectTask", summary = "创建项目任务")
        @ApiResponses({
            @ApiResponse(responseCode = "201", description = "创建成功"),
            @ApiResponse(
                    responseCode = "400",
                    description = "请求体校验失败",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(
                    responseCode = "404",
                    description = "项目不存在",
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
        @PostMapping(
                consumes = MediaType.APPLICATION_JSON_VALUE,
                produces = MediaType.APPLICATION_JSON_VALUE)
        ResponseEntity<TaskResponse> create(
                @PathVariable("projectId") String projectId,
                @Valid @RequestBody CreateTaskRequest request) {
            Task task = service.createTask(projectId, request);
            URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{taskId}")
                    .buildAndExpand(task.id())
                    .toUri();
            return ResponseEntity.created(location).body(TaskResponse.from(task));
        }

        /** 查询项目任务。 */
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
            return TaskResponse.from(service.findTask(projectId, taskId));
        }

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
            return TaskResponse.from(service.replaceTask(projectId, taskId, request));
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
                            schema = @Schema(implementation = ProblemDetail.class)))
        })
        @DeleteMapping("/{taskId}")
        ResponseEntity<Void> delete(
                @PathVariable("projectId") String projectId,
                @PathVariable("taskId") String taskId) {
            service.deleteTask(projectId, taskId);
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
                case "NotNull" -> "NOT_NULL";
                case "Email" -> "EMAIL";
                case "Size" -> "SIZE";
                case "Pattern" -> "PATTERN";
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
            if (requestType == CreateProjectRequest.class) {
                return "PROJECT_VALIDATION_FAILED";
            }
            if (requestType == CreateTaskRequest.class
                    || requestType == ReplaceTaskRequest.class) {
                return "TASK_VALIDATION_FAILED";
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
java -jar target/teamflow-project-task-api-modern-1.0.0.jar
```

服务使用 8080。现代 Controller 不添加类型级 `@Validated`；请求体通过 `@Valid` 校验，`pageSize` 由 Spring
MVC 内建方法校验处理。

## 五、Java 8 完整兼容工程

### 1. 使用独立依赖与端口

另建 `teamflow-project-task-api-java8`，让 Project SDK、Module SDK、Maven Runner JRE 与 POM 都使用真实
Java 8，并与现代工程使用不同的源码和 class 输出目录。

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
  <artifactId>teamflow-project-task-api-java8</artifactId>
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
      <groupId>org.springdoc</groupId>
      <artifactId>springdoc-openapi-ui</artifactId>
      <version>1.8.0</version>
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
spring.application.name=teamflow-project-task-api-java8
server.port=8081
```

### 2. 编写 Java 8 完整源码

`src/main/java/com/teamflow/api/TeamFlowApplication.java`：

```java
package com.teamflow.api;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.net.URI;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
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
import javax.validation.constraints.Email;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.TypeMismatchException;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

/** 启动 Java 8 版本的 TeamFlow 项目与任务 API。 */
@SpringBootApplication
@OpenAPIDefinition(info = @Info(title = "TeamFlow API", version = "1.0.0"))
@Import({
        TeamFlowApplication.ApiService.class,
        TeamFlowApplication.UserController.class,
        TeamFlowApplication.TeamController.class,
        TeamFlowApplication.ProjectController.class,
        TeamFlowApplication.TaskController.class,
        TeamFlowApplication.GlobalExceptionHandler.class
})
public class TeamFlowApplication {

    /** 启动应用。 */
    public static void main(String[] args) {
        SpringApplication.run(TeamFlowApplication.class, args);
    }

    /** 任务状态。 */
    @Schema(name = "TaskStatus", description = "任务状态", allowableValues = {"TODO", "DONE"})
    enum TaskStatus {
        TODO,
        DONE
    }

    /** 用户内部模型。 */
    static final class User {
        private final String id;
        private final String displayName;
        private final String email;

        /** 创建用户。 */
        User(String id, String displayName, String email) {
            this.id = id;
            this.displayName = displayName;
            this.email = email;
        }
    }

    /** 团队内部模型。 */
    static final class Team {
        private final String id;
        private final String name;

        /** 创建团队。 */
        Team(String id, String name) {
            this.id = id;
            this.name = name;
        }
    }

    /** 项目内部模型。 */
    static final class Project {
        private final String id;
        private final String teamId;
        private final String name;

        /** 创建项目。 */
        Project(String id, String teamId, String name) {
            this.id = id;
            this.teamId = teamId;
            this.name = name;
        }
    }

    /** 任务内部模型。 */
    static final class Task {
        private final String id;
        private final String projectId;
        private final String title;
        private final TaskStatus status;
        private final String dueAt;
        private final String assignee;

        /** 创建任务。 */
        Task(
                String id,
                String projectId,
                String title,
                TaskStatus status,
                String dueAt,
                String assignee) {
            this.id = id;
            this.projectId = projectId;
            this.title = title;
            this.status = status;
            this.dueAt = dueAt;
            this.assignee = assignee;
        }
    }

    /** 创建用户请求。 */
    @Schema(name = "CreateUserRequest", description = "创建用户所需字段")
    static final class CreateUserRequest {
        @NotBlank(message = "用户名称不能为空")
        @Size(max = 40, message = "用户名称最多 40 个字符")
        public String displayName;

        @NotBlank(message = "邮箱不能为空")
        @Email(message = "邮箱格式不正确")
        @Size(max = 120, message = "邮箱最多 120 个字符")
        public String email;

        /** 供 JSON 绑定创建请求。 */
        public CreateUserRequest() {
        }
    }

    /** 创建团队请求。 */
    @Schema(name = "CreateTeamRequest", description = "创建团队所需字段")
    static final class CreateTeamRequest {
        @NotBlank(message = "团队名称不能为空")
        @Size(max = 60, message = "团队名称最多 60 个字符")
        public String name;

        /** 供 JSON 绑定创建请求。 */
        public CreateTeamRequest() {
        }
    }

    /** 创建项目请求。 */
    @Schema(name = "CreateProjectRequest", description = "创建项目所需字段")
    static final class CreateProjectRequest {
        @Schema(description = "所属团队 ID", example = "TEAM-1")
        @NotBlank(message = "团队 ID 不能为空")
        @Pattern(regexp = "TEAM-[1-9][0-9]*", message = "团队 ID 格式不正确")
        public String teamId;

        @Schema(description = "项目名称", example = "课程平台")
        @NotBlank(message = "项目名称不能为空")
        @Size(max = 80, message = "项目名称最多 80 个字符")
        public String name;

        /** 供 JSON 绑定创建请求。 */
        public CreateProjectRequest() {
        }
    }

    /** 创建任务请求。 */
    @Schema(name = "CreateTaskRequest", description = "创建任务所需字段")
    static final class CreateTaskRequest {
        @Schema(description = "任务标题", example = "补齐课程目录")
        @NotBlank(message = "任务标题不能为空")
        @Size(max = 120, message = "任务标题最多 120 个字符")
        public String title;

        @Schema(description = "带偏移的截止时间", example = "2026-08-22T18:00:00+08:00")
        @NotBlank(message = "截止时间不能为空")
        @Size(max = 40, message = "截止时间最多 40 个字符")
        public String dueAt;

        @Schema(description = "负责人", example = "lin")
        @NotBlank(message = "负责人不能为空")
        @Size(max = 40, message = "负责人最多 40 个字符")
        public String assignee;

        /** 供 JSON 绑定创建请求。 */
        public CreateTaskRequest() {
        }
    }

    /** 完整替换任务请求。 */
    @Schema(name = "ReplaceTaskRequest", description = "任务全部可编辑字段")
    static final class ReplaceTaskRequest {
        @NotBlank(message = "任务标题不能为空")
        @Size(max = 120, message = "任务标题最多 120 个字符")
        public String title;

        @NotNull(message = "任务状态不能为空")
        public TaskStatus status;

        @NotBlank(message = "截止时间不能为空")
        @Size(max = 40, message = "截止时间最多 40 个字符")
        public String dueAt;

        @NotBlank(message = "负责人不能为空")
        @Size(max = 40, message = "负责人最多 40 个字符")
        public String assignee;

        /** 供 JSON 绑定创建请求。 */
        public ReplaceTaskRequest() {
        }
    }

    /** 用户公开响应。 */
    @Schema(name = "UserResponse", description = "用户公开表示")
    static final class UserResponse {
        public final String id;
        public final String displayName;
        public final String email;

        /** 创建用户响应。 */
        UserResponse(String id, String displayName, String email) {
            this.id = id;
            this.displayName = displayName;
            this.email = email;
        }

        /** 从内部用户生成公开响应。 */
        static UserResponse from(User user) {
            return new UserResponse(user.id, user.displayName, user.email);
        }
    }

    /** 团队公开响应。 */
    @Schema(name = "TeamResponse", description = "团队公开表示")
    static final class TeamResponse {
        public final String id;
        public final String name;

        /** 创建团队响应。 */
        TeamResponse(String id, String name) {
            this.id = id;
            this.name = name;
        }

        /** 从内部团队生成公开响应。 */
        static TeamResponse from(Team team) {
            return new TeamResponse(team.id, team.name);
        }
    }

    /** 项目公开响应。 */
    @Schema(name = "ProjectResponse", description = "项目公开表示")
    static final class ProjectResponse {
        public final String id;
        public final String teamId;
        public final String name;

        /** 创建项目响应。 */
        ProjectResponse(String id, String teamId, String name) {
            this.id = id;
            this.teamId = teamId;
            this.name = name;
        }

        /** 从内部项目生成公开响应。 */
        static ProjectResponse from(Project project) {
            return new ProjectResponse(project.id, project.teamId, project.name);
        }
    }

    /** 任务公开响应。 */
    @Schema(name = "TaskResponse", description = "任务公开表示")
    static final class TaskResponse {
        public final String id;
        public final String projectId;
        public final String title;
        public final TaskStatus status;
        public final String dueAt;
        public final String assignee;

        /** 创建任务响应。 */
        TaskResponse(
                String id,
                String projectId,
                String title,
                TaskStatus status,
                String dueAt,
                String assignee) {
            this.id = id;
            this.projectId = projectId;
            this.title = title;
            this.status = status;
            this.dueAt = dueAt;
            this.assignee = assignee;
        }

        /** 从内部任务生成公开响应。 */
        static TaskResponse from(Task task) {
            return new TaskResponse(
                    task.id,
                    task.projectId,
                    task.title,
                    task.status,
                    task.dueAt,
                    task.assignee);
        }
    }

    /** 分页响应。 */
    @Schema(name = "PageResponse", description = "稳定分页外形")
    static final class PageResponse<T> {
        public final List<T> items;
        public final String nextPageToken;

        /** 创建分页响应并保存列表快照。 */
        PageResponse(List<T> items, String nextPageToken) {
            this.items = Collections.unmodifiableList(new ArrayList<T>(items));
            this.nextPageToken = nextPageToken;
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
    @Schema(name = "ApiProblem", description = "Java 8 兼容错误表示")
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

    /** 用内存状态实现用户、团队、项目与任务资源。 */
    static final class ApiService {
        private final Map<String, User> users = new LinkedHashMap<String, User>();
        private final Map<String, Team> teams = new LinkedHashMap<String, Team>();
        private final Map<String, Project> projects = new LinkedHashMap<String, Project>();
        private final Map<String, LinkedHashMap<String, Task>> tasksByProject =
                new LinkedHashMap<String, LinkedHashMap<String, Task>>();
        private long nextUserId = 3L;
        private long nextTeamId = 3L;
        private long nextProjectId = 3L;
        private long nextTaskId = 3L;

        /** 准备固定验收数据。 */
        ApiService() {
            users.put("USR-1", new User("USR-1", "周宁", "zhou@example.com"));
            users.put("USR-2", new User("USR-2", "林澄", "lin@example.com"));
            teams.put("TEAM-1", new Team("TEAM-1", "课程平台组"));
            teams.put("TEAM-2", new Team("TEAM-2", "开发者门户组"));
            addSeedProject(new Project("PRJ-1", "TEAM-1", "课程平台"));
            addSeedProject(new Project("PRJ-2", "TEAM-2", "开发者门户"));
            tasksByProject.get("PRJ-1").put(
                    "TASK-1",
                    new Task(
                            "TASK-1",
                            "PRJ-1",
                            "补齐课程目录",
                            TaskStatus.TODO,
                            "2026-08-22T18:00:00+08:00",
                            "lin"));
            tasksByProject.get("PRJ-1").put(
                    "TASK-2",
                    new Task(
                            "TASK-2",
                            "PRJ-1",
                            "核对接口文档",
                            TaskStatus.DONE,
                            "2026-08-23T18:00:00+08:00",
                            "zhou"));
        }

        /** 查询一页用户。 */
        PageResponse<UserResponse> listUsers(int pageSize, String pageToken) {
            List<User> allUsers = new ArrayList<User>(users.values());
            int start = pageOffset(pageToken, "USER-PAGE-", allUsers.size());
            List<UserResponse> items = new ArrayList<UserResponse>();
            for (int index = start;
                    index < allUsers.size() && items.size() < pageSize;
                    index++) {
                items.add(UserResponse.from(allUsers.get(index)));
            }
            return new PageResponse<UserResponse>(
                    items,
                    nextPageToken("USER-PAGE-", start, pageSize, allUsers.size()));
        }

        /** 创建用户。 */
        User createUser(CreateUserRequest request) {
            for (User user : users.values()) {
                if (user.email.equalsIgnoreCase(request.email)) {
                    throw new ApiException(
                            HttpStatus.CONFLICT,
                            "user-conflict",
                            "用户状态冲突",
                            "该邮箱已经注册",
                            "USER_CONFLICT");
                }
            }
            String userId = "USR-" + nextUserId++;
            User user = new User(userId, request.displayName, request.email);
            users.put(userId, user);
            return user;
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

        /** 查询一页团队。 */
        PageResponse<TeamResponse> listTeams(int pageSize, String pageToken) {
            List<Team> allTeams = new ArrayList<Team>(teams.values());
            int start = pageOffset(pageToken, "TEAM-PAGE-", allTeams.size());
            List<TeamResponse> items = new ArrayList<TeamResponse>();
            for (int index = start;
                    index < allTeams.size() && items.size() < pageSize;
                    index++) {
                items.add(TeamResponse.from(allTeams.get(index)));
            }
            return new PageResponse<TeamResponse>(
                    items,
                    nextPageToken("TEAM-PAGE-", start, pageSize, allTeams.size()));
        }

        /** 创建团队。 */
        Team createTeam(CreateTeamRequest request) {
            String teamId = "TEAM-" + nextTeamId++;
            Team team = new Team(teamId, request.name);
            teams.put(teamId, team);
            return team;
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

        /** 查询一页项目。 */
        PageResponse<ProjectResponse> listProjects(int pageSize, String pageToken) {
            List<Project> allProjects = new ArrayList<Project>(projects.values());
            int start = pageOffset(pageToken, "PROJECT-PAGE-", allProjects.size());
            List<ProjectResponse> items = new ArrayList<ProjectResponse>();
            for (int index = start;
                    index < allProjects.size() && items.size() < pageSize;
                    index++) {
                items.add(ProjectResponse.from(allProjects.get(index)));
            }
            return new PageResponse<ProjectResponse>(
                    items,
                    nextPageToken("PROJECT-PAGE-", start, pageSize, allProjects.size()));
        }

        /** 创建项目并初始化空任务集合。 */
        Project createProject(CreateProjectRequest request) {
            findTeam(request.teamId);
            String projectId = "PRJ-" + nextProjectId++;
            Project project = new Project(projectId, request.teamId, request.name);
            projects.put(projectId, project);
            tasksByProject.put(projectId, new LinkedHashMap<String, Task>());
            return project;
        }

        /** 查询项目。 */
        Project findProject(String projectId) {
            Project project = projects.get(projectId);
            if (project == null) {
                throw new ApiException(
                        HttpStatus.NOT_FOUND,
                        "project-not-found",
                        "项目不存在",
                        "没有找到编号为 " + projectId + " 的项目",
                        "PROJECT_NOT_FOUND");
            }
            return project;
        }

        /** 按项目与状态查询一页任务。 */
        PageResponse<TaskResponse> listTasks(
                String projectId,
                TaskStatus status,
                int pageSize,
                String pageToken) {
            List<Task> filtered = new ArrayList<Task>();
            for (Task task : requireTasks(projectId).values()) {
                if (status == null || task.status == status) {
                    filtered.add(task);
                }
            }
            String tokenPrefix = taskTokenPrefix(projectId, status);
            int start = pageOffset(pageToken, tokenPrefix, filtered.size());
            List<TaskResponse> items = new ArrayList<TaskResponse>();
            for (int index = start;
                    index < filtered.size() && items.size() < pageSize;
                    index++) {
                items.add(TaskResponse.from(filtered.get(index)));
            }
            return new PageResponse<TaskResponse>(
                    items,
                    nextPageToken(tokenPrefix, start, pageSize, filtered.size()));
        }

        /** 创建任务并使用 TODO 作为初始状态。 */
        Task createTask(String projectId, CreateTaskRequest request) {
            LinkedHashMap<String, Task> projectTasks = requireTasks(projectId);
            String dueAt = requireDueAt(request.dueAt);
            String taskId = "TASK-" + nextTaskId++;
            Task task = new Task(
                    taskId,
                    projectId,
                    request.title,
                    TaskStatus.TODO,
                    dueAt,
                    request.assignee);
            projectTasks.put(taskId, task);
            return task;
        }

        /** 在指定项目中查询任务。 */
        Task findTask(String projectId, String taskId) {
            Task task = requireTasks(projectId).get(taskId);
            if (task == null) {
                throw new ApiException(
                        HttpStatus.NOT_FOUND,
                        "task-not-found",
                        "任务不存在",
                        "当前项目中没有编号为 " + taskId + " 的任务",
                        "TASK_NOT_FOUND");
            }
            return task;
        }

        /** 完整替换指定项目中的任务。 */
        Task replaceTask(String projectId, String taskId, ReplaceTaskRequest request) {
            LinkedHashMap<String, Task> projectTasks = requireTasks(projectId);
            findTask(projectId, taskId);
            String dueAt = requireDueAt(request.dueAt);
            Task replaced = new Task(
                    taskId,
                    projectId,
                    request.title,
                    request.status,
                    dueAt,
                    request.assignee);
            projectTasks.put(taskId, replaced);
            return replaced;
        }

        /** 删除指定项目中的任务。 */
        void deleteTask(String projectId, String taskId) {
            LinkedHashMap<String, Task> projectTasks = requireTasks(projectId);
            if (projectTasks.remove(taskId) == null) {
                throw new ApiException(
                        HttpStatus.NOT_FOUND,
                        "task-not-found",
                        "任务不存在",
                        "当前项目中没有编号为 " + taskId + " 的任务",
                        "TASK_NOT_FOUND");
            }
        }

        /** 保存固定项目并创建任务集合。 */
        private void addSeedProject(Project project) {
            projects.put(project.id, project);
            tasksByProject.put(project.id, new LinkedHashMap<String, Task>());
        }

        /** 确认截止时间是带偏移的 ISO 日期时间。 */
        private String requireDueAt(String dueAt) {
            try {
                OffsetDateTime.parse(dueAt);
                return dueAt;
            } catch (DateTimeParseException exception) {
                throw new ApiException(
                        HttpStatus.BAD_REQUEST,
                        "invalid-time",
                        "截止时间格式不正确",
                        "dueAt 必须是带 UTC 偏移的 ISO 日期时间",
                        "INVALID_TIME");
            }
        }

        /** 返回已存在项目的任务表。 */
        private LinkedHashMap<String, Task> requireTasks(String projectId) {
            findProject(projectId);
            return tasksByProject.get(projectId);
        }

        /** 为任务查询上下文生成专用 token 前缀。 */
        private String taskTokenPrefix(String projectId, TaskStatus status) {
            return "TASK-PAGE-" + projectId + "-"
                    + (status == null ? "ALL" : status.name()) + "-";
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
                    "分页游标不属于当前资源集合与查询上下文",
                    "INVALID_PAGE_TOKEN");
        }
    }

    /** 提供用户资源。 */
    @Validated
    @Tag(name = "Users", description = "用户资源")
    @RestController
    @RequestMapping("/api/v1/users")
    static class UserController {
        private final ApiService service;

        /** 创建用户 Controller。 */
        UserController(ApiService service) {
            this.service = service;
        }

        /** 查询一页用户。 */
        @Operation(operationId = "listUsers", summary = "查询用户分页")
        @ApiResponses({
            @ApiResponse(responseCode = "200", description = "查询成功"),
            @ApiResponse(
                    responseCode = "400",
                    description = "分页参数无效",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ApiProblem.class)))
        })
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
        @Operation(operationId = "getUser", summary = "查询单个用户")
        @ApiResponses({
            @ApiResponse(responseCode = "200", description = "查询成功"),
            @ApiResponse(
                    responseCode = "404",
                    description = "用户不存在",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ApiProblem.class)))
        })
        @GetMapping(path = "/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
        UserResponse find(@PathVariable("userId") String userId) {
            return UserResponse.from(service.findUser(userId));
        }

        /** 创建用户。 */
        @Operation(operationId = "createUser", summary = "创建用户")
        @ApiResponses({
            @ApiResponse(responseCode = "201", description = "创建成功"),
            @ApiResponse(
                    responseCode = "400",
                    description = "请求体校验失败",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ApiProblem.class))),
            @ApiResponse(
                    responseCode = "409",
                    description = "用户邮箱已存在",
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
        @PostMapping(
                consumes = MediaType.APPLICATION_JSON_VALUE,
                produces = MediaType.APPLICATION_JSON_VALUE)
        ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest request) {
            User user = service.createUser(request);
            URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{userId}")
                    .buildAndExpand(user.id)
                    .toUri();
            return ResponseEntity.created(location).body(UserResponse.from(user));
        }
    }

    /** 提供团队资源。 */
    @Validated
    @Tag(name = "Teams", description = "团队资源")
    @RestController
    @RequestMapping("/api/v1/teams")
    static class TeamController {
        private final ApiService service;

        /** 创建团队 Controller。 */
        TeamController(ApiService service) {
            this.service = service;
        }

        /** 查询一页团队。 */
        @Operation(operationId = "listTeams", summary = "查询团队分页")
        @ApiResponses({
            @ApiResponse(responseCode = "200", description = "查询成功"),
            @ApiResponse(
                    responseCode = "400",
                    description = "分页参数无效",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ApiProblem.class)))
        })
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
        @Operation(operationId = "getTeam", summary = "查询单个团队")
        @ApiResponses({
            @ApiResponse(responseCode = "200", description = "查询成功"),
            @ApiResponse(
                    responseCode = "404",
                    description = "团队不存在",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ApiProblem.class)))
        })
        @GetMapping(path = "/{teamId}", produces = MediaType.APPLICATION_JSON_VALUE)
        TeamResponse find(@PathVariable("teamId") String teamId) {
            return TeamResponse.from(service.findTeam(teamId));
        }

        /** 创建团队。 */
        @Operation(operationId = "createTeam", summary = "创建团队")
        @ApiResponses({
            @ApiResponse(responseCode = "201", description = "创建成功"),
            @ApiResponse(
                    responseCode = "400",
                    description = "请求体校验失败",
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
        @PostMapping(
                consumes = MediaType.APPLICATION_JSON_VALUE,
                produces = MediaType.APPLICATION_JSON_VALUE)
        ResponseEntity<TeamResponse> create(@Valid @RequestBody CreateTeamRequest request) {
            Team team = service.createTeam(request);
            URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{teamId}")
                    .buildAndExpand(team.id)
                    .toUri();
            return ResponseEntity.created(location).body(TeamResponse.from(team));
        }
    }

    /** 提供项目资源。 */
    @Validated
    @Tag(name = "Projects", description = "项目资源")
    @RestController
    @RequestMapping("/api/v1/projects")
    static class ProjectController {
        private final ApiService service;

        /** 创建项目 Controller。 */
        ProjectController(ApiService service) {
            this.service = service;
        }

        /** 查询一页项目。 */
        @Operation(operationId = "listProjects", summary = "查询项目分页")
        @ApiResponses({
            @ApiResponse(responseCode = "200", description = "查询成功"),
            @ApiResponse(
                    responseCode = "400",
                    description = "分页参数无效",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ApiProblem.class)))
        })
        @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
        PageResponse<ProjectResponse> list(
                @RequestParam(name = "pageSize", defaultValue = "20")
                @Min(value = 1, message = "pageSize 最小为 1")
                @Max(value = 50, message = "pageSize 最大为 50")
                int pageSize,
                @RequestParam(name = "pageToken", required = false) String pageToken) {
            return service.listProjects(pageSize, pageToken);
        }

        /** 查询项目。 */
        @Operation(operationId = "getProject", summary = "查询单个项目")
        @ApiResponses({
            @ApiResponse(responseCode = "200", description = "查询成功"),
            @ApiResponse(
                    responseCode = "404",
                    description = "项目不存在",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ApiProblem.class)))
        })
        @GetMapping(path = "/{projectId}", produces = MediaType.APPLICATION_JSON_VALUE)
        ProjectResponse find(@PathVariable("projectId") String projectId) {
            return ProjectResponse.from(service.findProject(projectId));
        }

        /** 创建项目。 */
        @Operation(operationId = "createProject", summary = "创建项目")
        @ApiResponses({
            @ApiResponse(responseCode = "201", description = "创建成功"),
            @ApiResponse(
                    responseCode = "400",
                    description = "请求体校验失败",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ApiProblem.class))),
            @ApiResponse(
                    responseCode = "404",
                    description = "团队不存在",
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
        @PostMapping(
                consumes = MediaType.APPLICATION_JSON_VALUE,
                produces = MediaType.APPLICATION_JSON_VALUE)
        ResponseEntity<ProjectResponse> create(
                @Valid @RequestBody CreateProjectRequest request) {
            Project project = service.createProject(request);
            URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{projectId}")
                    .buildAndExpand(project.id)
                    .toUri();
            return ResponseEntity.created(location).body(ProjectResponse.from(project));
        }
    }

    /** 提供项目内任务资源。 */
    @Validated
    @Tag(name = "Project Tasks", description = "项目内任务资源")
    @RestController
    @RequestMapping("/api/v1/projects/{projectId}/tasks")
    static class TaskController {
        private final ApiService service;

        /** 创建任务 Controller。 */
        TaskController(ApiService service) {
            this.service = service;
        }

        /** 按项目与状态查询一页任务。 */
        @Operation(operationId = "listProjectTasks", summary = "查询项目任务分页")
        @ApiResponses({
            @ApiResponse(responseCode = "200", description = "查询成功"),
            @ApiResponse(
                    responseCode = "400",
                    description = "分页或筛选参数无效",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ApiProblem.class))),
            @ApiResponse(
                    responseCode = "404",
                    description = "项目不存在",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ApiProblem.class)))
        })
        @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
        PageResponse<TaskResponse> list(
                @PathVariable("projectId") String projectId,
                @RequestParam(name = "status", required = false) TaskStatus status,
                @RequestParam(name = "pageSize", defaultValue = "20")
                @Min(value = 1, message = "pageSize 最小为 1")
                @Max(value = 50, message = "pageSize 最大为 50")
                int pageSize,
                @RequestParam(name = "pageToken", required = false) String pageToken) {
            return service.listTasks(projectId, status, pageSize, pageToken);
        }

        /** 创建项目任务。 */
        @Operation(operationId = "createProjectTask", summary = "创建项目任务")
        @ApiResponses({
            @ApiResponse(responseCode = "201", description = "创建成功"),
            @ApiResponse(
                    responseCode = "400",
                    description = "请求体校验失败",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ApiProblem.class))),
            @ApiResponse(
                    responseCode = "404",
                    description = "项目不存在",
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
        @PostMapping(
                consumes = MediaType.APPLICATION_JSON_VALUE,
                produces = MediaType.APPLICATION_JSON_VALUE)
        ResponseEntity<TaskResponse> create(
                @PathVariable("projectId") String projectId,
                @Valid @RequestBody CreateTaskRequest request) {
            Task task = service.createTask(projectId, request);
            URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{taskId}")
                    .buildAndExpand(task.id)
                    .toUri();
            return ResponseEntity.created(location).body(TaskResponse.from(task));
        }

        /** 查询项目任务。 */
        @Operation(operationId = "getProjectTask", summary = "查询单个项目任务")
        @ApiResponses({
            @ApiResponse(responseCode = "200", description = "查询成功"),
            @ApiResponse(
                    responseCode = "404",
                    description = "项目或任务不存在",
                    content = @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ApiProblem.class)))
        })
        @GetMapping(path = "/{taskId}", produces = MediaType.APPLICATION_JSON_VALUE)
        TaskResponse find(
                @PathVariable("projectId") String projectId,
                @PathVariable("taskId") String taskId) {
            return TaskResponse.from(service.findTask(projectId, taskId));
        }

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
            return TaskResponse.from(service.replaceTask(projectId, taskId, request));
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
            service.deleteTask(projectId, taskId);
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
            if ("NotNull".equals(code)) {
                return "NOT_NULL";
            }
            if ("Email".equals(code)) {
                return "EMAIL";
            }
            if ("Size".equals(code)) {
                return "SIZE";
            }
            if ("Pattern".equals(code)) {
                return "PATTERN";
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
            if (requestType == CreateProjectRequest.class) {
                return "PROJECT_VALIDATION_FAILED";
            }
            if (requestType == CreateTaskRequest.class
                    || requestType == ReplaceTaskRequest.class) {
                return "TASK_VALIDATION_FAILED";
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

Java 8 使用普通类和显式构造器代替 record，使用循环代替现代 Stream 的 `toList()`，校验包从
`jakarta.*` 改为 `javax.*`，错误对象从 `ProblemDetail` 改为 `ApiProblem`。这些实现差异不能改变 JSON。

旧版 Controller 方法约束依赖类型级 `@Validated` 与 AOP 代理，所以 User、Team、Project、Task 四个 Controller 都不能声明为
`final`。
现代 MVC 不走这条旧路径，不应机械保留 `@Validated`。

执行：

```bash
mvn clean package
java -jar target/teamflow-project-task-api-java8-1.0.0.jar
```

兼容服务使用 8081。同一组请求只替换端口，状态、Location、JSON 字段与 OpenAPI 版本保持一致。

## 六、复跑完整 HTTP 与文档合同

### 1. 先观察创建、替换和删除

在现代服务上先确认用户端点，再创建团队，并用新团队创建项目：

```bash
curl -fsS 'http://localhost:8080/api/v1/users?pageSize=1' | jq
curl -i -X POST http://localhost:8080/api/v1/users \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"沈言","email":"shen@example.com"}'
curl -i -X POST http://localhost:8080/api/v1/teams \
  -H 'Content-Type: application/json' \
  -d '{"name":"接口学习组"}'
curl -fsS 'http://localhost:8080/api/v1/projects?pageSize=1' | jq
curl -i -X POST http://localhost:8080/api/v1/projects \
  -H 'Content-Type: application/json' \
  -d '{"teamId":"TEAM-3","name":"接口学习站"}'
curl -fsS http://localhost:8080/api/v1/projects/PRJ-3 | jq
```

用户第一页包含 `USR-1`；新用户和团队分别得到 201、`USR-3` 与 `TEAM-3`。项目第一页包含 `PRJ-1`，
`nextPageToken` 是 `PROJECT-PAGE-2`。项目创建响应是 201，Location 以 `/api/v1/projects/PRJ-3` 结尾，
body 同时包含 `id`、`TEAM-3` 与 `name`，证明新项目查询了真实团队存储。

接着在 `PRJ-1` 中创建任务。先保留创建后的 TODO 状态，观察筛选 token，再完整替换并删除：

```bash
curl -i -X POST http://localhost:8080/api/v1/projects/PRJ-1/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"复核课程页面","dueAt":"2026-08-24T18:00:00+08:00","assignee":"shen"}'
curl -fsS \
  'http://localhost:8080/api/v1/projects/PRJ-1/tasks?status=TODO&pageSize=1' | jq
curl -fsS -X PUT http://localhost:8080/api/v1/projects/PRJ-1/tasks/TASK-3 \
  -H 'Content-Type: application/json' \
  -d '{"title":"复核课程页面","status":"DONE","dueAt":"2026-08-24T18:00:00+08:00","assignee":"shen"}' | jq
curl -sS -o /tmp/teamflow-task-delete.body -w '%{http_code}\n' \
  -X DELETE http://localhost:8080/api/v1/projects/PRJ-1/tasks/TASK-3
wc -c < /tmp/teamflow-task-delete.body
find /tmp/teamflow-task-delete.body -delete
```

任务创建返回 201 与 `/tasks/TASK-3` Location，初始 status 是 `TODO`。筛选页的 token 是
`TASK-PAGE-PRJ-1-TODO-2`；PUT 返回 200 与 `DONE` 表示；DELETE 输出 204，正文长度输出 0。

### 2. 再覆盖失败路径

```bash
curl -i -X POST http://localhost:8080/api/v1/projects \
  -H 'Content-Type: application/json' \
  -d '{"teamId":"TEAM-404","name":"未知团队项目"}'
curl -i 'http://localhost:8080/api/v1/projects?pageSize=0'
curl -i \
  'http://localhost:8080/api/v1/projects/PRJ-1/tasks?pageToken=TASK-PAGE-PRJ-1-TODO-2'
curl -i http://localhost:8080/api/v1/projects/PRJ-2/tasks/TASK-1
curl -i -X PUT http://localhost:8080/api/v1/projects/PRJ-1/tasks/TASK-1 \
  -H 'Content-Type: application/json' \
  -d '{"status":"DONE"}'
curl -i -X POST http://localhost:8080/api/v1/projects/PRJ-1/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"错误时间","dueAt":"明天下午","assignee":"lin"}'
curl -i -X POST http://localhost:8080/api/v1/projects \
  -H 'Content-Type: text/plain' -d 'TeamFlow'
```

结果依次是 404 `TEAM_NOT_FOUND`、400 参数校验、400 `INVALID_PAGE_TOKEN`、404 `TASK_NOT_FOUND`、
400 `TASK_VALIDATION_FAILED`、400 `INVALID_TIME` 与 415 `MEDIA_TYPE_NOT_SUPPORTED`。所有错误都使用
`application/problem+json`，HTTP status 等于 body `status`，`traceId` 是 32 位小写十六进制；字段错误外的
`errors` 是空数组。

在兼容服务启动后，从 fresh 进程按相同顺序复跑，只把 8080 替换为 8081。两条线都从相同固定数据开始，
因此新项目和新任务 ID 仍分别是 `PRJ-3` 与 `TASK-3`。

### 3. 检查 OpenAPI 结构与 Swagger UI

先保存机器文档，断言版本、路径、唯一 operationId 和关键响应：

```bash
document=$(mktemp /tmp/teamflow-project-task-openapi.XXXXXX)
curl -fsS http://localhost:8080/v3/api-docs -o "$document"
jq -e '
  .openapi == "3.0.1" and
  .info.title == "TeamFlow API" and
  .paths["/api/v1/users"].get.operationId == "listUsers" and
  .paths["/api/v1/users"].post.operationId == "createUser" and
  .paths["/api/v1/users/{userId}"].get.operationId == "getUser" and
  .paths["/api/v1/teams"].get.operationId == "listTeams" and
  .paths["/api/v1/teams"].post.operationId == "createTeam" and
  .paths["/api/v1/teams/{teamId}"].get.operationId == "getTeam" and
  .paths["/api/v1/projects"].get.operationId == "listProjects" and
  .paths["/api/v1/projects"].post.operationId == "createProject" and
  .paths["/api/v1/projects/{projectId}"].get.operationId == "getProject" and
  .paths["/api/v1/projects/{projectId}/tasks"].get.operationId == "listProjectTasks" and
  .paths["/api/v1/projects/{projectId}/tasks"].post.operationId == "createProjectTask" and
  .paths["/api/v1/projects/{projectId}/tasks/{taskId}"].get.operationId == "getProjectTask" and
  .paths["/api/v1/projects/{projectId}/tasks/{taskId}"].put.operationId == "replaceProjectTask" and
  .paths["/api/v1/projects/{projectId}/tasks/{taskId}"].delete.operationId == "deleteProjectTask" and
  (.paths["/api/v1/projects"].post.responses | has("201") and has("400") and has("404") and has("415")) and
  (.paths["/api/v1/projects/{projectId}/tasks/{taskId}"].put.responses
    | has("200") and has("400") and has("404") and has("415")) and
  (.paths["/api/v1/projects/{projectId}/tasks/{taskId}"].delete.responses
    | has("204") and has("404")) and
  (.paths["/api/v1/projects"].post.responses["404"].content
    | has("application/problem+json"))
' "$document"
jq -e '
  [
    .paths[] | to_entries[] | .value.operationId // empty
  ] as $ids |
  ($ids | length) == 14 and ($ids | unique | length) == 14
' "$document"
find "$document" -delete
```

再访问 `/swagger-ui.html` 并跟随跳转。页面应显示 `Users`、`Teams`、`Projects` 与 `Project Tasks` 四个 tag、
十四个 operation，
并且没有 PATCH。使用 Try it out 创建项目时，响应区应真实显示 201、Location 与新项目 JSON；提交未知团队
时应真实显示 404 Problem Details。页面结果不能代替上面的结构断言和 curl 响应验收。

## 七、集中排查五类边界错误

### 五个典型错误

:::pitfalls
### 让创建请求携带服务端身份

**触发条件：** 创建任务时同时发送 id、projectId 和 status。

**原因：** 请求 DTO 与资源响应共用字段，没有区分路径身份、服务端事实和调用方输入。

**后果：** 路径与 body 可能冲突，调用方还可能伪造初始状态。

**错误示例：**

```json
{"id":"TASK-99","projectId":"PRJ-2","title":"复核页面","status":"DONE"}
```

**正确写法：**

```json
{"title":"复核页面","dueAt":"2026-08-24T18:00:00+08:00","assignee":"shen"}
```

**验证方式：** 向 `POST /api/v1/projects/PRJ-1/tasks` 发送正确请求，响应应由服务端补充 TASK ID、PRJ-1 和
TODO；未知字段是否拒绝不属于本课合同，调用方不能依赖静默忽略。

### 先全局查任务再忽略父项目

**触发条件：** 用 taskId 从全局 Map 查询，完全不使用路径中的 projectId。

**原因：** 嵌套 URI 表达的资源范围没有进入 Service 查询边界。

**后果：** `/projects/PRJ-2/tasks/TASK-1` 可能泄漏 PRJ-1 的任务。

**错误示例：**

```java
return tasks.get(taskId);
```

**正确写法：**

```java
return requireTasks(projectId).get(taskId);
```

**验证方式：** 请求 `/api/v1/projects/PRJ-2/tasks/TASK-1`，必须得到 404 `TASK_NOT_FOUND`，不能返回
PRJ-1 的任务。

### 让 token 跨筛选上下文复用

**触发条件：** `status=TODO` 签发的 token 只保存整数位置，下一次不带 status 仍被接受。

**原因：** token 没有绑定生成它的 projectId 与筛选条件。

**后果：** 同一 token 指向不同结果集，客户端可能漏项或重复读取。

**错误示例：**

```java
String tokenPrefix = "TASK-PAGE-";
```

**正确写法：**

```java
String tokenPrefix = taskTokenPrefix(projectId, status);
```

**验证方式：** 把 `TASK-PAGE-PRJ-1-TODO-2` 用到无 status 请求，必须得到 400
`INVALID_PAGE_TOKEN`。

### 用 PUT 只发送一个字段

**触发条件：** 客户端把完整替换端点当作部分更新，只提交 status。

**原因：** PUT 与本课 `ReplaceTaskRequest` 的全部可编辑字段合同被误读。

**后果：** 若服务端接受，未提交字段会被清空或接口实际变成未声明的 PATCH。

**错误示例：**

```json
{"status":"DONE"}
```

**正确写法：**

```json
{"title":"补齐课程目录","status":"DONE","dueAt":"2026-08-22T18:00:00+08:00","assignee":"lin"}
```

**验证方式：** 两份 JSON 分别发送到同一 PUT 路径；错误请求得到 400，完整请求得到 200 与全部字段。

### 给 204 响应追加成功 JSON

**触发条件：** 删除成功选择 204 后，又返回 `{}` 或统一成功消息。

**原因：** 204 的无内容语义与应用层响应外形发生冲突。

**后果：** 客户端和中间件对消息边界产生不同解释。

**错误示例：**

```java
return ResponseEntity.status(204).body("{}");
```

**正确写法：**

```java
return ResponseEntity.noContent().build();
```

**验证方式：** 保存 DELETE 响应 body 并用 `wc -c` 计数，结果必须是 0。
:::

## 八、独立练习

:::exercise
### 为新项目完成第一项任务

**要求：** 创建 TEAM-1 下的“文档中心”项目，在该项目中创建“发布接口说明”任务，再用 PUT 将任务完整
替换为 DONE；不得猜测服务端 ID，必须从创建响应读取 Location 或 id。

**验收：** 项目与任务创建均为 201，任务初始为 TODO，完整替换为 200 与 DONE，按 status=TODO 查询为空，
按 status=DONE 查询包含该任务；脚本同时适用于 8080 与 8081。
:::

### 1. 完整参考脚本

保存为任意临时脚本，传入服务基础地址后执行：

```bash
set -euo pipefail

base_url=${1:-http://localhost:8080/api/v1}
work_dir=$(mktemp -d /tmp/teamflow-project-task.XXXXXX)
trap 'find "$work_dir" -delete' EXIT

project_headers="$work_dir/project.headers"
project_body="$work_dir/project.json"
project_status=$(curl -sS -w '%{http_code}' -D "$project_headers" -o "$project_body" \
  -X POST "$base_url/projects" \
  -H 'Content-Type: application/json' \
  -d '{"teamId":"TEAM-1","name":"文档中心"}')
test "$project_status" = "201"
project_id=$(jq -er '.id' "$project_body")
rg -qi "^location: .*/projects/$project_id" "$project_headers"

task_headers="$work_dir/task.headers"
task_body="$work_dir/task.json"
task_status=$(curl -sS -w '%{http_code}' -D "$task_headers" -o "$task_body" \
  -X POST "$base_url/projects/$project_id/tasks" \
  -H 'Content-Type: application/json' \
  -d '{"title":"发布接口说明","dueAt":"2026-08-25T18:00:00+08:00","assignee":"lin"}')
test "$task_status" = "201"
task_id=$(jq -er '.id' "$task_body")
jq -e '.status == "TODO"' "$task_body"
rg -qi "^location: .*/projects/$project_id/tasks/$task_id" "$task_headers"

replace_status=$(curl -sS -w '%{http_code}' -o "$work_dir/replaced.json" \
  -X PUT "$base_url/projects/$project_id/tasks/$task_id" \
  -H 'Content-Type: application/json' \
  -d '{"title":"发布接口说明","status":"DONE","dueAt":"2026-08-25T18:00:00+08:00","assignee":"lin"}')
test "$replace_status" = "200"
jq -e '.status == "DONE"' "$work_dir/replaced.json"
curl -fsS "$base_url/projects/$project_id/tasks?status=TODO" \
  | jq -e '.items == [] and .nextPageToken == null'
curl -fsS "$base_url/projects/$project_id/tasks?status=DONE" \
  | jq -e --arg task_id "$task_id" '.items[0].id == $task_id'
```

### 2. 预期反馈

脚本中的三个 HTTP 状态、四个 `jq -e` 和两个 Location 检查都成功，最终退出码是 0；任一步失败都会立即
退出，并由 trap 清理临时目录。把基础地址改为
`http://localhost:8081/api/v1` 后，Java 8 服务得到相同结果。

## 九、本课小结

- Project 通过 teamId 连接已有 Team，Task 只在所属 Project 范围内寻址。
- 创建请求只接收调用方字段；服务端生成 ID、默认 TODO，并用 201 与 Location 返回新资源位置。
- 项目和任务分页共享外形，任务 token 额外绑定 projectId 与 status 查询上下文。
- PUT 完整替换全部可编辑任务字段，DELETE 成功返回没有正文的 204。
- DTO、Service、Controller 与 advice 各守输入形状、业务存在性、HTTP 编排和错误转换边界。
- JDK 25 与 Java 8 使用不同语言和框架路径，但运行时 API、Problem JSON、OpenAPI 3.0.1 与 Swagger UI 保持一致。
- 当前内存实现只固定用户、团队、项目与任务的 REST 合同；持久化、事务、并发、权限与可靠幂等将在后续课程逐步补齐。

## 累计项目衔接

累计项目由 `TeamFlowController`、`TeamFlowReadRepository` 和任务应用服务承接项目/任务接口。长期项目还保留
后续课程已经验证的 MySQL、`Idempotency-Key`、乐观锁和权限，因此任务创建后为 `IN_PROGRESS`，完成操作只
接收版本与 `DONE`；这些下游合同不能倒退为本课独立内存工程的临时 `TODO`/完整替换实现。
