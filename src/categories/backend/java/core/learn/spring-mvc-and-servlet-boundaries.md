---
id: backend.java.learn.intermediate.spring-mvc-and-servlet-boundaries
type: lesson
title: 请求映射
summary: 用路径、HTTP 方法和附加条件把 TeamFlow 请求准确交给一个 Controller 方法
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 150
prerequisites:
  - backend.java.learn.intermediate.dependency-injection-and-bean-lifecycle
objectives:
  - 能区分 @RestController 的组件职责与请求映射注解的路由职责。
  - 能说明 @RestController 的 value 是 Bean 名称建议，而不是 URL。
  - 能组合类级与方法级路径，并用路径和 HTTP 方法确定唯一处理方法。
  - 能使用 @RequestMapping、@GetMapping、@PostMapping、@PutMapping、@PatchMapping 和 @DeleteMapping。
  - 能预测固定路径与 URI 变量路径同时匹配时的选择结果。
  - 能用 params、headers、consumes 和 produces 为映射增加筛选条件。
  - 能根据真实请求区分 404、405、415 和 406 的映射阶段原因。
  - 能在 JDK 25 / Spring Boot 4.1.0 与 Java 8 / Spring Boot 2.3.12.RELEASE 中运行同一套映射源码。
recap:
  - '@RestController 让类成为 Web 组件并默认把返回值写入响应，URL 仍由请求映射注解声明。'
  - 类级路径提供共同前缀，方法级路径补充端点；最终路径是两级映射的组合。
  - 路径和 HTTP 方法共同选择处理方法，方法专用组合注解比不限定 method 的 @RequestMapping 更明确。
  - 固定路径比同位置的 URI 变量路径更具体，匹配结果不由源码书写顺序决定。
  - params 与 headers 只增加请求条件，不会自动把值放进 Java 参数。
  - consumes 检查请求 Content-Type，produces 根据 Accept 限定可生成的响应类型。
  - 404、405、415、406 分别帮助定位路径、方法、请求媒体类型和响应媒体类型条件。
  - 两条版本线的映射注解相同，真实差异是 JDK、Spring Boot 版本和 Web starter。
related:
  - backend.java.learn.intermediate.http-uri-and-request-response-basics
  - backend.java.learn.basics.unified-api-contract
  - backend.java.learn.intermediate.first-spring-boot-web-api
tags:
  - Java
  - Spring Boot
  - Spring MVC
  - 请求映射
  - Controller
  - HTTP
  - TeamFlow
appliesTo: JDK 25 与 Spring Boot 4.1.0 主线；Java 8 与 Spring Boot 2.3.12.RELEASE 兼容工程
verifiedAt: 2026-08-19
sources:
  - id: spring-mvc-mapping-requests
    title: 'Mapping Requests :: Spring Framework'
    url: https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - 请求映射可以按 URL、HTTP 方法、请求参数、请求头和媒体类型筛选处理方法。
      - 类级映射表达共享条件，方法级映射把条件收窄到具体端点。
      - 路径模式按特异性比较，固定字面量路径比同位置的 URI 变量路径更具体。
      - consumes 按请求 Content-Type 筛选，produces 按 Accept 参与响应内容协商。
  - id: spring-request-mapping-javadoc
    title: RequestMapping (Spring Framework 7.0.8 API)
    url: https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/RequestMapping.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - '@RequestMapping 可以用于类和方法，value 是 path 的别名。'
      - 未声明 method 时不会把映射限定到某一个 HTTP 方法。
      - 同一元素上声明多个请求映射注解时只使用第一个并记录警告。
  - id: spring-rest-controller-javadoc
    title: RestController (Spring Framework 7.0.8 API)
    url: https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/RestController.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - '@RestController 组合了 @Controller 与 @ResponseBody 语义。'
      - '@RestController 的 value 是自动发现组件的逻辑 Bean 名称建议，不是请求路径。'
  - id: spring-get-mapping-javadoc
    title: GetMapping (Spring Framework 7.0.8 API)
    url: https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/GetMapping.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - '@GetMapping 是把 HTTP 方法固定为 GET 的组合请求映射注解。'
  - id: spring-post-mapping-javadoc
    title: PostMapping (Spring Framework 7.0.8 API)
    url: https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/PostMapping.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - '@PostMapping 是把 HTTP 方法固定为 POST 的组合请求映射注解。'
  - id: spring-put-mapping-javadoc
    title: PutMapping (Spring Framework 7.0.8 API)
    url: https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/PutMapping.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - '@PutMapping 是把 HTTP 方法固定为 PUT 的组合请求映射注解。'
  - id: spring-patch-mapping-javadoc
    title: PatchMapping (Spring Framework 7.0.8 API)
    url: https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/PatchMapping.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - '@PatchMapping 是把 HTTP 方法固定为 PATCH 的组合请求映射注解。'
  - id: spring-delete-mapping-javadoc
    title: DeleteMapping (Spring Framework 7.0.8 API)
    url: https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/DeleteMapping.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - '@DeleteMapping 是把 HTTP 方法固定为 DELETE 的组合请求映射注解。'
  - id: spring-boot-41-system-requirements
    title: 'System Requirements :: Spring Boot'
    url: https://docs.spring.io/spring-boot/system-requirements.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Spring Boot 4.1.0 至少需要 Java 17，JDK 25 满足该基线。
      - Spring Boot 4.1.0 使用 Spring Framework 7.0.8 或以上版本。
  - id: spring-boot-41-starters
    title: 'Build Systems :: Spring Boot'
    url: https://docs.spring.io/spring-boot/reference/using/build-systems.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - spring-boot-starter-webmvc 提供 Spring MVC 与默认的 Tomcat Web 运行环境。
      - Boot 4 中 spring-boot-starter-web 已由 spring-boot-starter-webmvc 替代。
  - id: spring-boot-2312-reference
    title: Spring Boot Reference Documentation 2.3.12.RELEASE
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java 8 与 Spring Boot 2.3.12.RELEASE
    claims:
      - Spring Boot 2.3.12.RELEASE 支持 Java 8，并使用当时的 spring-boot-starter-web。
      - '@RestController 与 @RequestMapping 属于 Spring MVC 注解。'
  - id: spring-framework-5215-request-mapping
    title: Spring Framework 5.2.15 - Web on Servlet Stack
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/web.html#mvc-ann-requestmapping
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 兼容线支持类级与方法级映射、五个 HTTP 方法组合注解及附加映射条件。
      - 兼容线同样用 Content-Type 匹配 consumes，并用 Accept 匹配 produces。
  - id: community-rest-controller-value-ambiguity
    title: Stack Overflow - Springboot Ambiguous mapping found while controllers use different paths
    url: https://stackoverflow.com/questions/66856781/springboot-ambiguous-mapping-found-while-controllers-are-defined-with-differ
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Spring MVC 映射排错；结论已按官方 Javadoc 复核
    claims:
      - 把 @RestController 的 value 当作类级 URL 会让无路径方法落到相同根映射并触发重复映射错误。
      - 类级 URL 应由 @RequestMapping 声明，而不是写进 @RestController。
---

# 请求映射

TeamFlow 已经能启动 Spring Boot，也能由容器装配服务。接下来，浏览器或前端发来的
`GET /api/v1/tasks` 怎样准确进入一个 Controller 方法？答案不只是一段 URL：Spring MVC 会把请求路径、
HTTP 方法以及可选的参数、请求头和媒体类型条件放在一起比较，最终选择一个处理方法。

本课只建立“请求怎样选中方法”的能力。URI 里可以出现 `/{taskId}`，但暂不使用 `@PathVariable` 读取它；
查询参数、请求头和 body 也只参与映射筛选，不绑定到 Java 参数。响应状态设计、JSON 反序列化和统一错误
响应分别留给后续课程。

## 一、请求映射位于哪一步

### 1. 先匹配，再调用方法

一次请求进入 Spring MVC 后，可以先用下面的简化流程定位本课：

```text
HTTP 请求
  -> 根据路径、HTTP 方法和附加条件查找映射
  -> 选中一个 Controller 方法
  -> 调用方法
  -> 把返回值写入响应
```

请求映射只负责第二步。如果没有候选，或者候选的 method、`Content-Type`、`Accept` 不满足条件，
Controller 方法不会执行。知道失败发生在调用之前，排错时就不必先怀疑方法内部的业务逻辑。

### 2. 一个映射由多项条件共同组成

下面两个方法拥有相同路径，却不会冲突，因为 HTTP 方法不同：

```java
/**
 * 返回任务列表的映射结果。
 *
 * @return 映射说明
 */
@GetMapping
public String list() {
    return "GET tasks";
}

/**
 * 返回创建任务的映射结果。
 *
 * @return 映射说明
 */
@PostMapping
public String create() {
    return "POST tasks";
}
```

如果它们位于类级路径 `/api/v1/tasks` 下，那么 GET 请求选择 `list`，POST 请求选择 `create`。Spring
比较的是完整映射条件，不会只看到路径相同就随机挑一个方法。

### 3. 映射在 TeamFlow 中连接协议与代码

前置课程已经冻结 `/api/v1`、复数资源名和 HTTP 方法的外部合同。本课把其中一部分落实为 Controller
入口：

```text
GET    /api/v1/tasks            -> list()
GET    /api/v1/tasks/{taskId}   -> findOne()
POST   /api/v1/tasks            -> create()
PUT    /api/v1/tasks/{taskId}   -> replace()
PATCH  /api/v1/tasks/{taskId}   -> updatePartially()
DELETE /api/v1/tasks/{taskId}   -> delete()
```

右侧方法当前只返回固定文本，用来证明“选中了谁”。方法还不读取 ID、请求 JSON 或 header，也不决定 201、
204 等业务响应；这些能力不能因为路由已经存在就被视为完成。

## 二、分清 Controller 与 URL 的职责

### 1. RestController 标记 Web 组件

`@RestController` 组合了 `@Controller` 与 `@ResponseBody` 语义：它让类被当作 Controller 处理，并让请求
映射方法的返回值默认写入响应 body。它本身不声明 URL。

```java
@RestController
public final class TaskMappingController {
}
```

这个类已经是一个 Controller Bean，但还没有任何可请求的端点。只有类或方法上出现请求映射注解，Spring
才会注册路由。

### 2. RestController 的 value 不是路径

下面的写法不会建立 `/api/v1/tasks` 路径：

```java
@RestController("/api/v1/tasks")
public final class TaskMappingController {
}
```

根据 `@RestController` Javadoc，`value` 是自动发现组件的逻辑 Bean 名称建议。它与 `/api/v1/tasks`
碰巧都使用字符串，并不代表语义相同。真正的类级 URL 要交给 `@RequestMapping`：

```java
@RestController
@RequestMapping("/api/v1/tasks")
public final class TaskMappingController {
}
```

**社区补充：** Stack Overflow 问题 66856781 中，两个 Controller 分别写成
`@RestController("/admin")` 和 `@RestController("/user")`，两个无路径 `@PostMapping` 最终仍落在相同
根映射并触发启动失败。采纳答案改用 `@RestController` 加 `@RequestMapping`；这个结论已经由两个注解的
官方 Javadoc 复核，在 Spring Boot 2.3 与 4.1 课程基线中都适用。

### 3. RequestMapping 可以声明共享条件

`@RequestMapping` 可以用于类，也可以用于方法。类级最适合表达整个 Controller 共享的资源前缀：

```java
@RestController
@RequestMapping(path = "/api/v1/tasks")
public final class TaskMappingController {
    /**
     * 返回就绪映射结果。
     *
     * @return 映射说明
     */
    @RequestMapping(path = "/ready", method = RequestMethod.GET)
    public String ready() {
        return "READY";
    }
}
```

最终路径是 `/api/v1/tasks/ready`。`value` 与 `path` 在 `@RequestMapping` 中互为别名；课程示例优先写
`path`，让读者一眼看到这个字符串承担路径职责。

## 三、组合类级路径与方法级路径

### 1. 最终路径由两级映射连接

类级路径是共同前缀，方法级路径是当前端点在前缀下的补充：

```java
@RestController
@RequestMapping("/api/v1/tasks")
public final class TaskMappingController {
    /**
     * 返回服务就绪状态。
     *
     * @return 就绪文本
     */
    @GetMapping("/ready")
    public String ready() {
        return "READY";
    }
}
```

请求必须是 `GET /api/v1/tasks/ready`。`GET /ready` 少了类级前缀，
`GET /api/v1/tasks/api/v1/tasks/ready` 又重复了前缀，两者都不会选中这个方法。

### 2. 方法没有子路径时使用类级路径本身

列表与创建都作用于任务集合，可以只写方法注解：

```java
/**
 * 返回任务集合映射结果。
 *
 * @return 映射说明
 */
@GetMapping
public String list() {
    return "GET tasks";
}

/**
 * 返回创建映射结果。
 *
 * @return 映射说明
 */
@PostMapping
public String create() {
    return "POST tasks";
}
```

在类级 `/api/v1/tasks` 下，两者最终路径都是 `/api/v1/tasks`。GET 与 POST 条件继续负责区分方法。

### 3. URI 变量先只参与路径匹配

`/{taskId}` 声明这一段可以变化：

```java
/**
 * 返回成员路径的映射结果。
 *
 * @return 映射说明
 */
@GetMapping("/{taskId}")
public String findOne() {
    return "GET one task";
}
```

`GET /api/v1/tasks/TASK-104` 能选中方法，但方法没有 Java 参数，因此不会读取 `TASK-104`。声明 URI
变量路径与使用 `@PathVariable` 取得变量值是两项不同能力；本课只完成前者。

### 4. 固定路径比变量路径更具体

同一个 Controller 还可以声明：

```java
/**
 * 返回固定状态路径的映射结果。
 *
 * @return 映射说明
 */
@GetMapping("/status")
public String status() {
    return "GET fixed status";
}

/**
 * 返回变量成员路径的映射结果。
 *
 * @return 映射说明
 */
@GetMapping("/{taskId}")
public String findOne() {
    return "GET variable task";
}
```

`/status` 从字面上也符合 `/{taskId}`，但固定路径更具体，因此选择 `status()`。把两个方法上下换位，结果
仍然不变；Spring 比较路径模式的特异性，不把源码顺序当作公开路由合同。

## 四、用 HTTP 方法表达操作

### 1. RequestMapping 不写 method 会扩大匹配面

下面的映射没有 HTTP 方法限制：

```java
/**
 * 返回就绪文本。
 *
 * @return 就绪文本
 */
@RequestMapping("/ready")
public String ready() {
    return "READY";
}
```

它不是 `@GetMapping` 的另一种短写，而是可能匹配多种 HTTP 方法。公开端点通常应明确支持哪些 method，
否则一次未计划的 POST 或 DELETE 也可能进入同一个方法。

### 2. 五个组合注解固定 method

Spring MVC 为常见操作提供方法专用注解：

| 注解 | 等价的 method 条件 | TeamFlow 本课位置 |
| --- | --- | --- |
| `@GetMapping` | `RequestMethod.GET` | 查询集合或成员映射 |
| `@PostMapping` | `RequestMethod.POST` | 创建集合成员映射 |
| `@PutMapping` | `RequestMethod.PUT` | 完整替换成员映射 |
| `@PatchMapping` | `RequestMethod.PATCH` | 局部更新成员映射 |
| `@DeleteMapping` | `RequestMethod.DELETE` | 删除成员映射 |

例如下面两个写法的 GET 条件相同：

```java
@RequestMapping(path = "/ready", method = RequestMethod.GET)
```

```java
@GetMapping("/ready")
```

方法专用注解更短，也让 code review 能直接看到允许的 HTTP 方法。类级共享路径仍可继续使用
`@RequestMapping`。

### 3. 路径与 method 一起构成端点

下面六个映射可以同时存在：

```java
@GetMapping
@PostMapping
@GetMapping("/{taskId}")
@PutMapping("/{taskId}")
@PatchMapping("/{taskId}")
@DeleteMapping("/{taskId}")
```

这里每一行代表不同方法上的一个注解，而不是把六个注解叠在一个方法上。路径相同不等于映射相同；
只有完整条件无法区分时才会形成重复映射。也不要在同一个方法上同时写 `@GetMapping` 与 `@PostMapping`，
官方 Javadoc 说明这种情况下只使用第一个映射并记录警告。

## 五、增加附加映射条件

### 1. params 要求请求参数出现或满足表达式

`params = "status"` 表示 query 或表单参数中必须出现名为 `status` 的请求参数：

```java
/**
 * 返回带状态条件的列表映射结果。
 *
 * @return 映射说明
 */
@GetMapping(params = "status")
public String listByStatus() {
    return "GET tasks with status condition";
}
```

`GET /api/v1/tasks?status=TODO` 满足条件；不带 `status` 的 GET 由普通列表映射处理。`params` 只筛选
映射，没有为方法创建名为 `status` 的局部变量，也没有完成请求参数绑定。

常用表达式还包括 `status=TODO`、`status!=DONE` 和 `!status`。它们适合在确实需要两个端点按参数存在性
区分时使用，不应该用来代替普通业务分支。

### 2. headers 要求请求头满足条件

下面的映射只接受预览模式请求：

```java
/**
 * 返回预览模式的就绪映射结果。
 *
 * @return 映射说明
 */
@GetMapping(path = "/ready", headers = "X-TeamFlow-Mode=preview")
public String previewReady() {
    return "READY preview";
}
```

请求必须带 `X-TeamFlow-Mode: preview`。与 `params` 一样，`headers` 只参与选择方法，不会自动把 header
值交给 Java 参数。读取请求头属于后续请求参数课程。

### 3. consumes 检查请求 Content-Type

`consumes` 描述当前映射愿意接收的请求 body 媒体类型：

```java
/**
 * 返回文本导入映射结果。
 *
 * @return 映射说明
 */
@PostMapping(path = "/import", consumes = MediaType.TEXT_PLAIN_VALUE)
public String importTasks() {
    return "POST text import";
}
```

`Content-Type: text/plain` 满足条件；`Content-Type: application/json` 不满足，通常得到 415。方法仍然没有
body 参数，本课只是让请求媒体类型参与映射，不读取文本内容。

### 4. produces 与 Accept 协商响应类型

`produces` 描述这个映射可以生成的响应媒体类型，并与请求 `Accept` 比较：

```java
/**
 * 返回纯文本导入映射结果。
 *
 * @return 映射说明
 */
@PostMapping(
        path = "/import",
        consumes = MediaType.TEXT_PLAIN_VALUE,
        produces = MediaType.TEXT_PLAIN_VALUE
)
public String importTasks() {
    return "POST text import";
}
```

请求 `Accept: text/plain` 可以选中该方法；只接受 `application/json` 时，映射不能生成调用方接受的类型，
通常得到 406。记忆时把两个方向说完整：`consumes` 看进入服务端的 `Content-Type`，`produces` 看客户端
愿意接收的 `Accept`。

### 5. 附加条件用于筛选，不用于取值

四种附加条件都只是在原有路径和 method 之上继续收窄候选：

| 条件 | 检查的请求事实 | 本课不做的事 |
| --- | --- | --- |
| `params` | 请求参数是否存在或满足表达式 | 不用 `@RequestParam` 读取值 |
| `headers` | 请求头是否存在或满足表达式 | 不用 `@RequestHeader` 读取值 |
| `consumes` | 请求 `Content-Type` 是否兼容 | 不用 `@RequestBody` 读取 body |
| `produces` | 请求 `Accept` 是否接受可生成类型 | 不设计响应 DTO 或状态码 |

这个边界让我们能单独观察映射选择，而不把下一课的参数绑定和再下一课的请求体处理提前混进来。

## 六、用状态码定位映射失败

### 1. 404 表示没有找到可用路径

请求 `GET /api/v1/projects`，而应用只注册了 `/api/v1/tasks`，就没有对应路径。此时常见结果是 404。
先核对主机、端口、类级前缀和方法级子路径，再查看 Controller 是否进入组件扫描范围。

404 只能说明当前请求没有到达目标端点，不能仅凭它断言“方法代码有 bug”。运行了另一个应用、访问了旧
端口或遗漏 `/api/v1` 都会产生相同表面结果。

### 2. 405 表示路径存在但 method 不允许

若 `/api/v1/tasks/status` 只有 `@GetMapping`，发送 POST 时路径仍然存在，但 method 条件不匹配，常见结果
是 405 Method Not Allowed。这与完全不存在的路径不同。

排错时同时写出 method 和 URL：只记录“访问了 tasks/status”会隐藏最关键的 method 条件。

### 3. 415 表示请求媒体类型不满足 consumes

`POST /api/v1/tasks/import` 要求 `consumes = text/plain`。发送
`Content-Type: application/json` 时，请求 body 的格式声明不被当前映射接受，因此常见结果是 415
Unsupported Media Type。

415 检查的是请求方向。即使客户端写了 `Accept: text/plain`，也不能修复错误的 `Content-Type`。

### 4. 406 表示响应类型不满足 Accept

同一个导入映射声明 `produces = text/plain`。若请求只接受 `application/json`，服务端无法用该映射生成
可接受的表示，常见结果是 406 Not Acceptable。

406 检查的是响应方向。即使 `Content-Type: text/plain` 已满足 `consumes`，不兼容的 `Accept` 仍然会让
请求在调用方法前失败。

### 5. 四种结果形成排错顺序

可以按下面的顺序缩小范围：

```text
路径是否存在？             否 -> 404
HTTP 方法是否允许？        否 -> 405
Content-Type 是否可接收？  否 -> 415
Accept 是否可生成？        否 -> 406
全部满足                   是 -> 调用 Controller 方法
```

实际应用的错误 body 会随错误处理配置变化，本课只把状态和映射原因对齐，不提前定义统一错误 JSON。

## 七、JDK 25 完整 TeamFlow 映射工程

### 1. 创建独立 Maven 工程

创建目录 `teamflow-request-mapping-jdk25`，使用下面的完整 `pom.xml`。现代主线固定 JDK 25、Spring Boot
4.1.0 和 `spring-boot-starter-webmvc`：

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
    <artifactId>teamflow-request-mapping-jdk25</artifactId>
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

目录结构如下：

```text
teamflow-request-mapping-jdk25/
├── pom.xml
└── src/main
    ├── java/com/teamflow
    │   ├── TeamFlowApplication.java
    │   └── mapping/TaskMappingController.java
    └── resources/application.properties
```

### 2. 编写完整启动类

`src/main/java/com/teamflow/TeamFlowApplication.java`：

```java
package com.teamflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 启动 TeamFlow 请求映射示例。
 */
@SpringBootApplication
public class TeamFlowApplication {
    /**
     * 启动 Spring Boot Web 应用。
     *
     * @param args 启动参数
     */
    public static void main(String[] args) {
        SpringApplication.run(TeamFlowApplication.class, args);
    }
}
```

启动类位于 `com.teamflow` 包根，Controller 位于其 `mapping` 子包，因此会被默认组件扫描发现。

### 3. 编写完整 Controller

`src/main/java/com/teamflow/mapping/TaskMappingController.java`：

```java
package com.teamflow.mapping;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 展示 TeamFlow 任务请求如何选择处理方法。
 */
@RestController
@RequestMapping("/api/v1/tasks")
public final class TaskMappingController {
    /**
     * 匹配普通任务列表请求。
     *
     * @return 被选中的映射说明
     */
    @GetMapping(produces = MediaType.TEXT_PLAIN_VALUE)
    public String list() {
        return "GET tasks";
    }

    /**
     * 匹配带 status 请求参数的任务列表请求。
     *
     * @return 被选中的映射说明
     */
    @GetMapping(params = "status", produces = MediaType.TEXT_PLAIN_VALUE)
    public String listByStatus() {
        return "GET tasks with status condition";
    }

    /**
     * 匹配固定的任务状态路径。
     *
     * @return 被选中的映射说明
     */
    @GetMapping(path = "/status", produces = MediaType.TEXT_PLAIN_VALUE)
    public String status() {
        return "GET fixed status";
    }

    /**
     * 匹配普通就绪请求。
     *
     * @return 被选中的映射说明
     */
    @GetMapping(path = "/ready", produces = MediaType.TEXT_PLAIN_VALUE)
    public String ready() {
        return "READY";
    }

    /**
     * 匹配带预览请求头的就绪请求。
     *
     * @return 被选中的映射说明
     */
    @GetMapping(
            path = "/ready",
            headers = "X-TeamFlow-Mode=preview",
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String previewReady() {
        return "READY preview";
    }

    /**
     * 匹配任务成员路径，但不读取 URI 变量。
     *
     * @return 被选中的映射说明
     */
    @GetMapping(path = "/{taskId}", produces = MediaType.TEXT_PLAIN_VALUE)
    public String findOne() {
        return "GET variable task";
    }

    /**
     * 匹配创建任务请求，但不读取请求 body。
     *
     * @return 被选中的映射说明
     */
    @PostMapping(
            consumes = MediaType.TEXT_PLAIN_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String create() {
        return "POST tasks";
    }

    /**
     * 匹配完整替换任务请求，但不读取 URI 变量或请求 body。
     *
     * @return 被选中的映射说明
     */
    @PutMapping(
            path = "/{taskId}",
            consumes = MediaType.TEXT_PLAIN_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String replace() {
        return "PUT variable task";
    }

    /**
     * 匹配局部更新任务请求，但不读取 URI 变量或请求 body。
     *
     * @return 被选中的映射说明
     */
    @PatchMapping(
            path = "/{taskId}",
            consumes = MediaType.TEXT_PLAIN_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String updatePartially() {
        return "PATCH variable task";
    }

    /**
     * 匹配删除任务请求，但不读取 URI 变量。
     *
     * @return 被选中的映射说明
     */
    @DeleteMapping(path = "/{taskId}", produces = MediaType.TEXT_PLAIN_VALUE)
    public String delete() {
        return "DELETE variable task";
    }

    /**
     * 匹配纯文本导入请求，但不读取请求 body。
     *
     * @return 被选中的映射说明
     */
    @PostMapping(
            path = "/import",
            consumes = MediaType.TEXT_PLAIN_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String importTasks() {
        return "POST text import";
    }
}
```

Controller 没有任何 Java 参数。`taskId`、`status`、预览 header 和 body 都只参与映射条件，输出则直接说明
哪个方法被选中。

### 4. 添加完整配置并启动

`src/main/resources/application.properties`：

```properties
spring.application.name=teamflow-request-mapping-jdk25
server.port=8080
```

在 IntelliJ IDEA 中单独打开工程，依次完成：

1. Project Structure 的 Project SDK 选择 JDK 25。
2. Modules 的 Module SDK 选择 Project SDK。
3. Maven Runner JRE 选择同一个 JDK 25。
4. 核对 POM 的 `java.version` 为 `25`，再执行 Reload All Maven Projects。
5. 运行 `TeamFlowApplication.main`，确认日志显示应用监听 8080。

终端也必须使用 JDK 25。在包含 `pom.xml` 的目录执行：

```bash
java -version
mvn -version
mvn spring-boot:run
```

### 5. 发送正常映射请求

在另一个终端依次执行：

```bash
curl --silent --show-error --write-out '\n' 'http://localhost:8080/api/v1/tasks'
curl --silent --show-error --write-out '\n' \
  'http://localhost:8080/api/v1/tasks?status=TODO'
curl --silent --show-error --write-out '\n' 'http://localhost:8080/api/v1/tasks/status'
curl --silent --show-error --write-out '\n' 'http://localhost:8080/api/v1/tasks/TASK-104'
curl --silent --show-error --write-out '\n' 'http://localhost:8080/api/v1/tasks/ready'
curl --silent --show-error --write-out '\n' \
  --header 'X-TeamFlow-Mode: preview' \
  'http://localhost:8080/api/v1/tasks/ready'
curl --silent --show-error --write-out '\n' \
  --request POST \
  --header 'Content-Type: text/plain' \
  --header 'Accept: text/plain' \
  --data 'not-read' \
  'http://localhost:8080/api/v1/tasks'
curl --silent --show-error --write-out '\n' \
  --request PUT \
  --header 'Content-Type: text/plain' \
  --data 'not-read' \
  'http://localhost:8080/api/v1/tasks/TASK-104'
curl --silent --show-error --write-out '\n' \
  --request PATCH \
  --header 'Content-Type: text/plain' \
  --data 'not-read' \
  'http://localhost:8080/api/v1/tasks/TASK-104'
curl --silent --show-error --write-out '\n' \
  --request DELETE \
  'http://localhost:8080/api/v1/tasks/TASK-104'
```

预期依次看到：

```text
GET tasks
GET tasks with status condition
GET fixed status
GET variable task
READY
READY preview
POST tasks
PUT variable task
PATCH variable task
DELETE variable task
```

`/status` 没有被更早声明的 `/{taskId}` 抢走；带 `status` 参数和预览 header 的请求也选择了条件更具体的
方法。

### 6. 真实观察 404、405、415 和 406

使用 `--output /dev/null` 只隐藏响应 body，`--write-out` 保留状态：

```bash
curl --silent --output /dev/null --write-out '404 check: %{http_code}\n' \
  'http://localhost:8080/api/v1/projects'

curl --silent --output /dev/null --write-out '405 check: %{http_code}\n' \
  --request POST \
  'http://localhost:8080/api/v1/tasks/status'

curl --silent --output /dev/null --write-out '415 check: %{http_code}\n' \
  --request POST \
  --header 'Content-Type: application/json' \
  --header 'Accept: text/plain' \
  --data '{}' \
  'http://localhost:8080/api/v1/tasks/import'

curl --silent --output /dev/null --write-out '406 check: %{http_code}\n' \
  --request POST \
  --header 'Content-Type: text/plain' \
  --header 'Accept: application/json' \
  --data 'not-read' \
  'http://localhost:8080/api/v1/tasks/import'
```

预期结果：

```text
404 check: 404
405 check: 405
415 check: 415
406 check: 406
```

四次请求分别只改变目标路径、HTTP 方法、`Content-Type` 或 `Accept`，因此可以把状态与具体映射条件
一一对应。

## 八、Java 8 完整兼容工程

### 1. 使用兼容 POM

创建独立目录 `teamflow-request-mapping-java8`。Java 8 工程不能复用现代工程的 `target`，并使用当时真实的
`spring-boot-starter-web`。完整 `pom.xml` 如下：

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
    <artifactId>teamflow-request-mapping-java8</artifactId>
    <version>0.0.1-SNAPSHOT</version>

    <properties>
        <java.version>1.8</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
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

### 2. 编写完整 Java 8 启动类

`src/main/java/com/teamflow/TeamFlowApplication.java`：

```java
package com.teamflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 使用 Java 8 启动 TeamFlow 请求映射示例。
 */
@SpringBootApplication
public class TeamFlowApplication {
    /**
     * 启动 Spring Boot Web 应用。
     *
     * @param args 启动参数
     */
    public static void main(String[] args) {
        SpringApplication.run(TeamFlowApplication.class, args);
    }
}
```

### 3. 编写完整 Java 8 Controller

`src/main/java/com/teamflow/mapping/TaskMappingController.java`：

```java
package com.teamflow.mapping;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 使用 Java 8 展示 TeamFlow 任务请求如何选择处理方法。
 */
@RestController
@RequestMapping("/api/v1/tasks")
public final class TaskMappingController {
    /**
     * 匹配普通任务列表请求。
     *
     * @return 被选中的映射说明
     */
    @GetMapping(produces = MediaType.TEXT_PLAIN_VALUE)
    public String list() {
        return "GET tasks";
    }

    /**
     * 匹配带 status 请求参数的任务列表请求。
     *
     * @return 被选中的映射说明
     */
    @GetMapping(params = "status", produces = MediaType.TEXT_PLAIN_VALUE)
    public String listByStatus() {
        return "GET tasks with status condition";
    }

    /**
     * 匹配固定的任务状态路径。
     *
     * @return 被选中的映射说明
     */
    @GetMapping(path = "/status", produces = MediaType.TEXT_PLAIN_VALUE)
    public String status() {
        return "GET fixed status";
    }

    /**
     * 匹配普通就绪请求。
     *
     * @return 被选中的映射说明
     */
    @GetMapping(path = "/ready", produces = MediaType.TEXT_PLAIN_VALUE)
    public String ready() {
        return "READY";
    }

    /**
     * 匹配带预览请求头的就绪请求。
     *
     * @return 被选中的映射说明
     */
    @GetMapping(
            path = "/ready",
            headers = "X-TeamFlow-Mode=preview",
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String previewReady() {
        return "READY preview";
    }

    /**
     * 匹配任务成员路径，但不读取 URI 变量。
     *
     * @return 被选中的映射说明
     */
    @GetMapping(path = "/{taskId}", produces = MediaType.TEXT_PLAIN_VALUE)
    public String findOne() {
        return "GET variable task";
    }

    /**
     * 匹配创建任务请求，但不读取请求 body。
     *
     * @return 被选中的映射说明
     */
    @PostMapping(
            consumes = MediaType.TEXT_PLAIN_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String create() {
        return "POST tasks";
    }

    /**
     * 匹配完整替换任务请求，但不读取 URI 变量或请求 body。
     *
     * @return 被选中的映射说明
     */
    @PutMapping(
            path = "/{taskId}",
            consumes = MediaType.TEXT_PLAIN_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String replace() {
        return "PUT variable task";
    }

    /**
     * 匹配局部更新任务请求，但不读取 URI 变量或请求 body。
     *
     * @return 被选中的映射说明
     */
    @PatchMapping(
            path = "/{taskId}",
            consumes = MediaType.TEXT_PLAIN_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String updatePartially() {
        return "PATCH variable task";
    }

    /**
     * 匹配删除任务请求，但不读取 URI 变量。
     *
     * @return 被选中的映射说明
     */
    @DeleteMapping(path = "/{taskId}", produces = MediaType.TEXT_PLAIN_VALUE)
    public String delete() {
        return "DELETE variable task";
    }

    /**
     * 匹配纯文本导入请求，但不读取请求 body。
     *
     * @return 被选中的映射说明
     */
    @PostMapping(
            path = "/import",
            consumes = MediaType.TEXT_PLAIN_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String importTasks() {
        return "POST text import";
    }
}
```

源码没有使用 Java 8 不支持的语言特性，也没有现代 `jakarta.servlet` import，因此无需为了制造版本差异而
改写 Controller。

### 4. 添加完整配置并运行

`src/main/resources/application.properties`：

```properties
spring.application.name=teamflow-request-mapping-java8
server.port=8080
```

在 IntelliJ IDEA 中单独打开 Java 8 工程：Project SDK、Module SDK 和 Maven Runner JRE 都选择 JDK 8，
核对 POM 的 `java.version` 为 `1.8`，再 Reload Maven。不要只改变 Language level，也不要让 Maven 继续
使用 JDK 25。

关闭现代工程后，在 Java 8 工程目录执行：

```bash
java -version
mvn -version
mvn spring-boot:run
```

重新执行现代工程的全部正常请求和四个失败请求，预期输出与状态逐项相同。两条线的真实差异如下：

| 位置 | JDK 25 主线 | Java 8 兼容线 |
| --- | --- | --- |
| JDK | 25 | 8 |
| Spring Boot | 4.1.0 | 2.3.12.RELEASE |
| Web starter | `spring-boot-starter-webmvc` | `spring-boot-starter-web` |
| Controller 源码 | 本课完整源码 | 相同映射源码 |

版本切换时应同时切换工程目录、IDEA SDK、Maven JRE 和 POM，而不是只把一个数字改成 8。

## 九、易错示例

### 十一个典型错误

下面的每项只改变当前要观察的映射条件。先复现现象，再对照原因修正，避免一次改动路径、端口、注解和
请求头后无法判断真正生效的是哪一项。

:::pitfalls
### 把 RestController 的 value 当成 URL

**现象：** 请求 `/api/v1/tasks/ready` 得到 404；两个 Controller 的无路径 POST 方法还可能形成重复映射，
应用在启动时报告 `Ambiguous mapping`。

**触发条件：** 把类级路径写进 `@RestController("/api/v1/tasks")`，却没有声明类级 `@RequestMapping`。

**原因：** `@RestController` 的 value 是逻辑 Bean 名称建议，不是请求路径。

**后果：** 预期的类级前缀没有注册，无路径方法仍落到根映射；多个方法的其他条件相同时会重复。

**错误示例：**

```java
@RestController("/api/v1/tasks")
public final class TaskController {
    /**
     * 返回就绪状态。
     *
     * @return 就绪文本
     */
    @GetMapping("/ready")
    public String ready() {
        return "READY";
    }
}
```

**正确写法：**

```java
@RestController
@RequestMapping("/api/v1/tasks")
public final class TaskController {
    /**
     * 返回就绪状态。
     *
     * @return 就绪文本
     */
    @GetMapping("/ready")
    public String ready() {
        return "READY";
    }
}
```

**影响版本：** Spring Boot 4.1.0 与 2.3.12.RELEASE 都适用。

**验证方式：** 启动相同工程后请求 `/api/v1/tasks/ready`；错误版没有该完整路径，正确版返回 200 和
`READY`。再让两个错误版 Controller 都使用无路径 `@PostMapping`，应复现重复映射启动失败。

### 在方法路径中重复类级前缀

**现象：** 预期的 `/api/v1/tasks/ready` 返回 404，实际注册路径却包含两遍 `/api/v1/tasks`。

**触发条件：** 类级已经声明 `/api/v1/tasks`，方法级又写完整的 `/api/v1/tasks/ready`。

**原因：** 类级和方法级路径会组合，方法级路径不是对类级路径的替换。

**后果：** 客户端按统一 API 契约请求时无法命中端点，映射表也出现难以察觉的重复前缀。

**错误示例：**

```java
@RestController
@RequestMapping("/api/v1/tasks")
public final class TaskController {
    /**
     * 返回就绪状态。
     *
     * @return 就绪文本
     */
    @GetMapping("/api/v1/tasks/ready")
    public String ready() {
        return "READY";
    }
}
```

**正确写法：**

```java
@RestController
@RequestMapping("/api/v1/tasks")
public final class TaskController {
    /**
     * 返回就绪状态。
     *
     * @return 就绪文本
     */
    @GetMapping("/ready")
    public String ready() {
        return "READY";
    }
}
```

**影响版本：** Spring Boot 4.1.0 与 2.3.12.RELEASE 都适用。

**验证方式：** 分别请求 `/api/v1/tasks/ready` 与
`/api/v1/tasks/api/v1/tasks/ready`；错误版只会命中后者，正确版只会命中合同规定的前者。

### 映射没有限定 HTTP 方法

**现象：** GET、POST 或 DELETE 都能进入原本只计划给 GET 使用的就绪方法。

**触发条件：** 方法使用没有 `method` 条件的 `@RequestMapping("/ready")`。

**原因：** 没有 method 声明的 `@RequestMapping` 不会把候选限定到某一个 HTTP 方法。

**后果：** 端点接受未设计、未验证的方法，客户端错误不再得到明确的 405。

**错误示例：**

```java
/**
 * 返回就绪状态。
 *
 * @return 就绪文本
 */
@RequestMapping("/ready")
public String ready() {
    return "READY";
}
```

**正确写法：**

```java
/**
 * 返回就绪状态。
 *
 * @return 就绪文本
 */
@GetMapping("/ready")
public String ready() {
    return "READY";
}
```

**影响版本：** Spring Boot 4.1.0 与 2.3.12.RELEASE 都适用。

**验证方式：** 对同一路径分别发送 GET 与 POST；错误版两者都可能返回 200，正确版 GET 返回 200，POST
返回 405。

### 两个方法形成重复映射

**现象：** 应用启动失败，错误中指出两个方法都映射到同一个 GET 路径。

**触发条件：** 同一应用中两个 Controller 方法拥有相同路径、HTTP 方法和附加条件。

**原因：** 完整映射条件无法区分候选，Spring 不能在请求到达时随机选择一个方法。

**后果：** `RequestMappingHandlerMapping` 无法完成初始化，应用不能提供任何端点。

**错误示例：**

```java
/**
 * 返回第一个就绪结果。
 *
 * @return 就绪文本
 */
@GetMapping("/ready")
public String ready() {
    return "READY";
}

/**
 * 返回第二个就绪结果。
 *
 * @return 就绪文本
 */
@GetMapping("/ready")
public String duplicateReady() {
    return "READY duplicate";
}
```

**正确写法：**

```java
/**
 * 返回就绪结果。
 *
 * @return 就绪文本
 */
@GetMapping("/ready")
public String ready() {
    return "READY";
}

/**
 * 返回健康结果。
 *
 * @return 健康文本
 */
@GetMapping("/health")
public String health() {
    return "HEALTHY";
}
```

**影响版本：** Spring Boot 4.1.0 与 2.3.12.RELEASE 都适用。

**验证方式：** 启动错误版应得到 `Ambiguous mapping`；把第二个路径改为 `/health` 后应用启动，两个路径
分别返回各自文本。

### Controller 不在默认扫描范围

**现象：** 应用正常启动，但请求目标路径始终返回 404，启动日志中也没有目标 Controller 的映射。

**触发条件：** 启动类位于 `com.teamflow`，Controller 却位于另一个根包 `org.example.mapping`。

**原因：** 默认组件扫描从启动类所在包向下递归，不会自动跨到另一个包根。

**后果：** Controller 类虽然能编译，却没有成为 Bean，请求映射也不会注册。

**错误示例：**

```java
// src/main/java/org/example/mapping/TaskController.java
package org.example.mapping;

@RestController
@RequestMapping("/api/v1/tasks")
public final class TaskController {
    /**
     * 返回就绪状态。
     *
     * @return 就绪文本
     */
    @GetMapping("/ready")
    public String ready() {
        return "READY";
    }
}
```

**正确写法：**

```java
// src/main/java/com/teamflow/mapping/TaskController.java
package com.teamflow.mapping;

@RestController
@RequestMapping("/api/v1/tasks")
public final class TaskController {
    /**
     * 返回就绪状态。
     *
     * @return 就绪文本
     */
    @GetMapping("/ready")
    public String ready() {
        return "READY";
    }
}
```

**影响版本：** Spring Boot 4.1.0 与 2.3.12.RELEASE 的默认扫描规则都适用。

**验证方式：** 保持启动类在 `com.teamflow`，先运行错误包路径并请求 ready，确认 404；只移动 Controller
到 `com.teamflow.mapping` 后重启，请求应返回 200 和 `READY`。

### 误以为变量路径按源码顺序抢占固定路径

**现象：** 读代码时预测 `/status` 会进入 `findOne()`，真实请求却稳定进入 `status()`。

**触发条件：** 把先写在源码中的 `/{taskId}` 当成匹配优先级，并忽略路径特异性。

**原因：** Spring 会比较路径模式；固定字面量 `/status` 比同位置的 URI 变量 `/{taskId}` 更具体。

**后果：** 开发者会通过无意义地移动方法顺序“修路由”，并对真实匹配结果作出错误判断。

**错误示例：**

```java
/**
 * 返回变量路径结果。
 *
 * @return 映射说明
 */
@GetMapping("/{taskId}")
public String findOne() {
    return "variable";
}

/**
 * 返回固定状态结果。
 *
 * @return 映射说明
 */
@GetMapping("/status")
public String status() {
    return "fixed";
}
```

**正确写法：**

```java
/**
 * 返回固定状态结果。
 *
 * @return 映射说明
 */
@GetMapping("/status")
public String status() {
    return "fixed";
}

/**
 * 返回变量路径结果。
 *
 * @return 映射说明
 */
@GetMapping("/{taskId}")
public String findOne() {
    return "variable";
}
```

**影响版本：** 本课 Spring Framework 7.0.8 与 5.2.15.RELEASE 基线都按路径特异性选择。

**验证方式：** 两个版本都请求 `/api/v1/tasks/status`，结果都应为 `fixed`；再请求
`/api/v1/tasks/TASK-104`，结果为 `variable`。交换方法顺序后结果不变。

### 把 params 条件当成已经读取 Java 参数

**现象：** 源码编译失败，提示找不到变量 `status`。

**触发条件：** 只写 `params = "status"`，就直接在方法体使用一个从未声明的 Java 变量。

**原因：** `params` 只要求请求参数满足映射条件，不会创建方法参数或局部变量。

**后果：** 代码无法编译；即使方法不使用值，也容易让读者误以为映射筛选等于参数绑定。

**错误示例：**

```java
/**
 * 返回状态筛选结果。
 *
 * @return 映射说明
 */
@GetMapping(params = "status")
public String listByStatus() {
    return "status=" + status;
}
```

**正确写法：**

```java
/**
 * 返回状态条件已满足的结果。
 *
 * @return 映射说明
 */
@GetMapping(params = "status")
public String listByStatus() {
    return "status condition matched";
}
```

**影响版本：** Spring Boot 4.1.0 与 2.3.12.RELEASE 都适用；错误首先由 Java 编译器发现。

**验证方式：** 编译错误版应报告 `cannot find symbol: status`；正确版编译启动后，带
`?status=TODO` 的请求返回固定匹配说明，不带参数的请求不进入该方法。

### 把 headers 条件当成已经读取 Java 参数

**现象：** 源码编译失败，提示找不到变量 `mode`。

**触发条件：** 只写 `headers = "X-TeamFlow-Mode"`，就直接在方法体使用未声明的 `mode`。

**原因：** `headers` 只筛选请求头是否满足条件，不会创建 Java 参数。

**后果：** 代码无法编译，也模糊了“选择方法”和“读取请求头”两项职责。

**错误示例：**

```java
/**
 * 返回预览结果。
 *
 * @return 映射说明
 */
@GetMapping(path = "/ready", headers = "X-TeamFlow-Mode")
public String previewReady() {
    return "mode=" + mode;
}
```

**正确写法：**

```java
/**
 * 返回请求头条件已满足的结果。
 *
 * @return 映射说明
 */
@GetMapping(path = "/ready", headers = "X-TeamFlow-Mode")
public String previewReady() {
    return "header condition matched";
}
```

**影响版本：** Spring Boot 4.1.0 与 2.3.12.RELEASE 都适用；错误首先由 Java 编译器发现。

**验证方式：** 编译错误版应报告 `cannot find symbol: mode`；正确版启动后，带目标 header 的请求进入该
方法，不带 header 的请求不满足这个映射。

### 用 produces 代替 consumes

**现象：** `Content-Type: text/plain` 的 POST 仍进入本应只接收 JSON 的方法，没有得到预期的 415。

**触发条件：** 想限制请求格式，却把 `application/json` 写在 `produces` 中。

**原因：** `produces` 约束响应格式并与 `Accept` 比较，不检查请求 `Content-Type`。

**后果：** 未计划的请求媒体类型可以进入方法，接口的输入边界没有建立。

**错误示例：**

```java
/**
 * 返回基准就绪状态。
 *
 * @return 就绪文本
 */
@GetMapping("/ready")
public String ready() {
    return "READY";
}

/**
 * 返回 JSON 导入映射结果。
 *
 * @return JSON 文本
 */
@PostMapping(path = "/ready", produces = MediaType.APPLICATION_JSON_VALUE)
public String importReady() {
    return "\"READY\"";
}
```

**正确写法：**

```java
/**
 * 返回基准就绪状态。
 *
 * @return 就绪文本
 */
@GetMapping("/ready")
public String ready() {
    return "READY";
}

/**
 * 返回 JSON 导入映射结果。
 *
 * @return JSON 文本
 */
@PostMapping(path = "/ready", consumes = MediaType.APPLICATION_JSON_VALUE)
public String importReady() {
    return "\"READY\"";
}
```

**影响版本：** Spring Framework 7.0.8 与 5.2.15.RELEASE 都适用。

**验证方式：** 两边都保留相同 GET `/ready` 基准映射。发送 POST、`Content-Type: text/plain`、
`Accept: application/json`；错误版返回 200，正确版因请求类型不满足 consumes 返回 415。

### 用 consumes 代替 produces

**现象：** 客户端只接受 `application/json` 时，本应只输出纯文本的方法仍被调用，没有得到预期的 406。

**触发条件：** 想限制响应格式，却把 `text/plain` 写在 `consumes` 中。

**原因：** `consumes` 只检查请求 `Content-Type`，不检查客户端的 `Accept`。

**后果：** 响应协商边界没有建立，客户端可能收到与预期不同的媒体类型。

**错误示例：**

```java
/**
 * 返回基准就绪状态。
 *
 * @return 就绪文本
 */
@GetMapping("/ready")
public String ready() {
    return "READY";
}

/**
 * 返回纯文本导入映射结果。
 *
 * @return 就绪文本
 */
@PostMapping(path = "/ready", consumes = MediaType.TEXT_PLAIN_VALUE)
public String importReady() {
    return "READY";
}
```

**正确写法：**

```java
/**
 * 返回基准就绪状态。
 *
 * @return 就绪文本
 */
@GetMapping("/ready")
public String ready() {
    return "READY";
}

/**
 * 返回纯文本导入映射结果。
 *
 * @return 就绪文本
 */
@PostMapping(path = "/ready", produces = MediaType.TEXT_PLAIN_VALUE)
public String importReady() {
    return "READY";
}
```

**影响版本：** Spring Framework 7.0.8 与 5.2.15.RELEASE 都适用。

**验证方式：** 两边都保留相同 GET `/ready` 基准映射。发送 POST、`Content-Type: text/plain`、
`Accept: application/json`；错误版会进入方法，正确版因 produces 与 Accept 不兼容返回 406。

### 运行了错误应用或请求了错误路径

**现象：** 源码中的映射看起来正确，真实请求仍返回 404，或响应内容来自上一门课程。

**触发条件：** 旧服务仍占用端口、现代与 Java 8 工程同时运行，或者请求漏写 `/api/v1`。

**原因：** curl 只连接主机与端口指定的进程，不知道编辑器中当前打开的是哪个工程；URL 也必须与两级路径
组合逐字一致。

**后果：** 开发者会修改正确的 Controller 来迁就错误进程，导致路由越改越乱。

**错误示例：**

```bash
curl --silent --show-error 'http://localhost:8081/tasks/ready'
```

**正确写法：**

```bash
curl --silent --show-error 'http://localhost:8080/api/v1/tasks/ready'
```

**影响版本：** 所有版本都适用；同时维护现代与 Java 8 工程时尤其容易出现。

**验证方式：** 先查看当前启动日志中的应用名与端口，确认只运行一个版本，再请求完整路径；响应应为
`READY`。若仍不一致，停止旧进程、重新启动当前工程后复测，不使用浏览器缓存判断。
:::

## 十、独立练习

### 1. 任务、约束与验收

:::exercise
### 为 TeamFlow 项目资源建立请求映射

**要求：** 新建项目资源 Controller，类级路径固定为 `/api/v1/projects`。分别声明 GET 集合、GET
`/{projectId}`、POST 集合、PUT `/{projectId}`、PATCH `/{projectId}` 和 DELETE `/{projectId}`；增加固定
`/summary`，证明它比变量路径更具体；用 `params = "archived"` 区分归档列表，用
`headers = "X-TeamFlow-Mode=internal"` 区分内部就绪请求；`POST /import` 只消费并生成 `text/plain`。
所有方法只返回固定文本，不使用 `@PathVariable`、`@RequestParam`、`@RequestHeader` 或 `@RequestBody`。

**验收：** GET、POST、PUT、PATCH、DELETE 都进入各自方法；带 archived 参数和 internal header 的请求进入
更具体映射；`/summary` 不进入变量路径；未知路径、错误 method、错误 `Content-Type` 和不兼容 `Accept`
分别得到 404、405、415、406。JDK 25 / Boot 4.1.0 与 Java 8 / Boot 2.3.12.RELEASE 工程都能独立编译、
启动并得到相同请求结果。

**参考答案：** 两个版本的完整 POM、配置、启动类、Controller 和请求步骤见后文。先独立完成，再只按
映射条件逐项对照。
:::

### 2. JDK 25 完整参考工程

现代练习工程名为 `teamflow-project-mapping-jdk25`。完整 `pom.xml`：

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
    <artifactId>teamflow-project-mapping-jdk25</artifactId>
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

`src/main/resources/application.properties`：

```properties
spring.application.name=teamflow-project-mapping-jdk25
server.port=8080
```

`src/main/java/com/teamflow/TeamFlowApplication.java`：

```java
package com.teamflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 启动 TeamFlow 项目映射练习。
 */
@SpringBootApplication
public class TeamFlowApplication {
    /**
     * 启动现代版练习应用。
     *
     * @param args 启动参数
     */
    public static void main(String[] args) {
        SpringApplication.run(TeamFlowApplication.class, args);
    }
}
```

`src/main/java/com/teamflow/mapping/ProjectMappingController.java`：

```java
package com.teamflow.mapping;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 展示 TeamFlow 项目资源的完整映射条件。
 */
@RestController
@RequestMapping("/api/v1/projects")
public final class ProjectMappingController {
    /**
     * 匹配普通项目列表。
     *
     * @return 映射说明
     */
    @GetMapping(produces = MediaType.TEXT_PLAIN_VALUE)
    public String list() {
        return "GET projects";
    }

    /**
     * 匹配归档项目列表。
     *
     * @return 映射说明
     */
    @GetMapping(params = "archived", produces = MediaType.TEXT_PLAIN_VALUE)
    public String listArchived() {
        return "GET archived projects";
    }

    /**
     * 匹配固定摘要路径。
     *
     * @return 映射说明
     */
    @GetMapping(path = "/summary", produces = MediaType.TEXT_PLAIN_VALUE)
    public String summary() {
        return "GET fixed project summary";
    }

    /**
     * 匹配普通就绪请求。
     *
     * @return 映射说明
     */
    @GetMapping(path = "/ready", produces = MediaType.TEXT_PLAIN_VALUE)
    public String ready() {
        return "PROJECTS READY";
    }

    /**
     * 匹配内部就绪请求。
     *
     * @return 映射说明
     */
    @GetMapping(
            path = "/ready",
            headers = "X-TeamFlow-Mode=internal",
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String internalReady() {
        return "PROJECTS READY internal";
    }

    /**
     * 匹配项目成员路径，但不读取 URI 变量。
     *
     * @return 映射说明
     */
    @GetMapping(path = "/{projectId}", produces = MediaType.TEXT_PLAIN_VALUE)
    public String findOne() {
        return "GET variable project";
    }

    /**
     * 匹配创建项目请求，但不读取 body。
     *
     * @return 映射说明
     */
    @PostMapping(
            consumes = MediaType.TEXT_PLAIN_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String create() {
        return "POST projects";
    }

    /**
     * 匹配替换项目请求，但不读取 URI 变量或 body。
     *
     * @return 映射说明
     */
    @PutMapping(
            path = "/{projectId}",
            consumes = MediaType.TEXT_PLAIN_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String replace() {
        return "PUT variable project";
    }

    /**
     * 匹配局部更新项目请求，但不读取 URI 变量或 body。
     *
     * @return 映射说明
     */
    @PatchMapping(
            path = "/{projectId}",
            consumes = MediaType.TEXT_PLAIN_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String updatePartially() {
        return "PATCH variable project";
    }

    /**
     * 匹配删除项目请求，但不读取 URI 变量。
     *
     * @return 映射说明
     */
    @DeleteMapping(path = "/{projectId}", produces = MediaType.TEXT_PLAIN_VALUE)
    public String delete() {
        return "DELETE variable project";
    }

    /**
     * 匹配项目纯文本导入，但不读取 body。
     *
     * @return 映射说明
     */
    @PostMapping(
            path = "/import",
            consumes = MediaType.TEXT_PLAIN_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String importProjects() {
        return "POST text project import";
    }
}
```

IDEA 的 Project SDK、Module SDK 和 Maven Runner JRE 都选择 JDK 25，Reload Maven 后运行
`TeamFlowApplication.main`。终端等价步骤是：

```bash
java -version
mvn -version
mvn spring-boot:run
```

应用监听 8080 后执行完整练习请求：

```bash
curl --silent --show-error --write-out '\n' 'http://localhost:8080/api/v1/projects'
curl --silent --show-error --write-out '\n' \
  'http://localhost:8080/api/v1/projects?archived=true'
curl --silent --show-error --write-out '\n' 'http://localhost:8080/api/v1/projects/summary'
curl --silent --show-error --write-out '\n' 'http://localhost:8080/api/v1/projects/PRJ-7'
curl --silent --show-error --write-out '\n' 'http://localhost:8080/api/v1/projects/ready'
curl --silent --show-error --write-out '\n' --header 'X-TeamFlow-Mode: internal' \
  'http://localhost:8080/api/v1/projects/ready'
curl --silent --show-error --write-out '\n' \
  --request POST --header 'Content-Type: text/plain' --data 'not-read' \
  'http://localhost:8080/api/v1/projects'
curl --silent --show-error --write-out '\n' \
  --request PUT --header 'Content-Type: text/plain' --data 'not-read' \
  'http://localhost:8080/api/v1/projects/PRJ-7'
curl --silent --show-error --write-out '\n' \
  --request PATCH --header 'Content-Type: text/plain' --data 'not-read' \
  'http://localhost:8080/api/v1/projects/PRJ-7'
curl --silent --show-error --write-out '\n' \
  --request DELETE 'http://localhost:8080/api/v1/projects/PRJ-7'
```

依次应得到：

```text
GET projects
GET archived projects
GET fixed project summary
GET variable project
PROJECTS READY
PROJECTS READY internal
POST projects
PUT variable project
PATCH variable project
DELETE variable project
```

最后执行四个负向请求：

```bash
curl --silent --output /dev/null --write-out '%{http_code}\n' \
  'http://localhost:8080/api/v1/teams'
curl --silent --output /dev/null --write-out '%{http_code}\n' --request POST \
  'http://localhost:8080/api/v1/projects/summary'
curl --silent --output /dev/null --write-out '%{http_code}\n' --request POST \
  --header 'Content-Type: application/json' --header 'Accept: text/plain' --data '{}' \
  'http://localhost:8080/api/v1/projects/import'
curl --silent --output /dev/null --write-out '%{http_code}\n' --request POST \
  --header 'Content-Type: text/plain' --header 'Accept: application/json' --data 'not-read' \
  'http://localhost:8080/api/v1/projects/import'
```

预期依次为 `404`、`405`、`415`、`406`。

### 3. Java 8 完整参考工程

Java 8 练习工程名为 `teamflow-project-mapping-java8`。完整 `pom.xml`：

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
    <artifactId>teamflow-project-mapping-java8</artifactId>
    <version>0.0.1-SNAPSHOT</version>

    <properties>
        <java.version>1.8</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
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
spring.application.name=teamflow-project-mapping-java8
server.port=8080
```

`src/main/java/com/teamflow/TeamFlowApplication.java`：

```java
package com.teamflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 使用 Java 8 启动 TeamFlow 项目映射练习。
 */
@SpringBootApplication
public class TeamFlowApplication {
    /**
     * 启动 Java 8 练习应用。
     *
     * @param args 启动参数
     */
    public static void main(String[] args) {
        SpringApplication.run(TeamFlowApplication.class, args);
    }
}
```

`src/main/java/com/teamflow/mapping/ProjectMappingController.java`：

```java
package com.teamflow.mapping;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 使用 Java 8 展示 TeamFlow 项目资源的完整映射条件。
 */
@RestController
@RequestMapping("/api/v1/projects")
public final class ProjectMappingController {
    /**
     * 匹配普通项目列表。
     *
     * @return 映射说明
     */
    @GetMapping(produces = MediaType.TEXT_PLAIN_VALUE)
    public String list() {
        return "GET projects";
    }

    /**
     * 匹配归档项目列表。
     *
     * @return 映射说明
     */
    @GetMapping(params = "archived", produces = MediaType.TEXT_PLAIN_VALUE)
    public String listArchived() {
        return "GET archived projects";
    }

    /**
     * 匹配固定摘要路径。
     *
     * @return 映射说明
     */
    @GetMapping(path = "/summary", produces = MediaType.TEXT_PLAIN_VALUE)
    public String summary() {
        return "GET fixed project summary";
    }

    /**
     * 匹配普通就绪请求。
     *
     * @return 映射说明
     */
    @GetMapping(path = "/ready", produces = MediaType.TEXT_PLAIN_VALUE)
    public String ready() {
        return "PROJECTS READY";
    }

    /**
     * 匹配内部就绪请求。
     *
     * @return 映射说明
     */
    @GetMapping(
            path = "/ready",
            headers = "X-TeamFlow-Mode=internal",
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String internalReady() {
        return "PROJECTS READY internal";
    }

    /**
     * 匹配项目成员路径，但不读取 URI 变量。
     *
     * @return 映射说明
     */
    @GetMapping(path = "/{projectId}", produces = MediaType.TEXT_PLAIN_VALUE)
    public String findOne() {
        return "GET variable project";
    }

    /**
     * 匹配创建项目请求，但不读取 body。
     *
     * @return 映射说明
     */
    @PostMapping(
            consumes = MediaType.TEXT_PLAIN_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String create() {
        return "POST projects";
    }

    /**
     * 匹配替换项目请求，但不读取 URI 变量或 body。
     *
     * @return 映射说明
     */
    @PutMapping(
            path = "/{projectId}",
            consumes = MediaType.TEXT_PLAIN_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String replace() {
        return "PUT variable project";
    }

    /**
     * 匹配局部更新项目请求，但不读取 URI 变量或 body。
     *
     * @return 映射说明
     */
    @PatchMapping(
            path = "/{projectId}",
            consumes = MediaType.TEXT_PLAIN_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String updatePartially() {
        return "PATCH variable project";
    }

    /**
     * 匹配删除项目请求，但不读取 URI 变量。
     *
     * @return 映射说明
     */
    @DeleteMapping(path = "/{projectId}", produces = MediaType.TEXT_PLAIN_VALUE)
    public String delete() {
        return "DELETE variable project";
    }

    /**
     * 匹配项目纯文本导入，但不读取 body。
     *
     * @return 映射说明
     */
    @PostMapping(
            path = "/import",
            consumes = MediaType.TEXT_PLAIN_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String importProjects() {
        return "POST text project import";
    }
}
```

IDEA 的 Project SDK、Module SDK 和 Maven Runner JRE 都选择 JDK 8，POM 保持 `java.version` 为 `1.8`，
Reload Maven 后运行入口。终端使用 JDK 8 执行：

```bash
java -version
mvn -version
mvn spring-boot:run
```

应用监听 8080 后，完整请求步骤为：

```bash
curl --silent --show-error --write-out '\n' 'http://localhost:8080/api/v1/projects'
curl --silent --show-error --write-out '\n' \
  'http://localhost:8080/api/v1/projects?archived=true'
curl --silent --show-error --write-out '\n' 'http://localhost:8080/api/v1/projects/summary'
curl --silent --show-error --write-out '\n' 'http://localhost:8080/api/v1/projects/PRJ-7'
curl --silent --show-error --write-out '\n' 'http://localhost:8080/api/v1/projects/ready'
curl --silent --show-error --write-out '\n' --header 'X-TeamFlow-Mode: internal' \
  'http://localhost:8080/api/v1/projects/ready'
curl --silent --show-error --write-out '\n' \
  --request POST --header 'Content-Type: text/plain' --data 'not-read' \
  'http://localhost:8080/api/v1/projects'
curl --silent --show-error --write-out '\n' \
  --request PUT --header 'Content-Type: text/plain' --data 'not-read' \
  'http://localhost:8080/api/v1/projects/PRJ-7'
curl --silent --show-error --write-out '\n' \
  --request PATCH --header 'Content-Type: text/plain' --data 'not-read' \
  'http://localhost:8080/api/v1/projects/PRJ-7'
curl --silent --show-error --write-out '\n' \
  --request DELETE 'http://localhost:8080/api/v1/projects/PRJ-7'
```

正常输出与现代版逐项相同。再执行下面四条状态检查：

```bash
curl --silent --output /dev/null --write-out '%{http_code}\n' \
  'http://localhost:8080/api/v1/teams'
curl --silent --output /dev/null --write-out '%{http_code}\n' --request POST \
  'http://localhost:8080/api/v1/projects/summary'
curl --silent --output /dev/null --write-out '%{http_code}\n' --request POST \
  --header 'Content-Type: application/json' --header 'Accept: text/plain' --data '{}' \
  'http://localhost:8080/api/v1/projects/import'
curl --silent --output /dev/null --write-out '%{http_code}\n' --request POST \
  --header 'Content-Type: text/plain' --header 'Accept: application/json' --data 'not-read' \
  'http://localhost:8080/api/v1/projects/import'
```

Java 8 版也必须依次得到 `404`、`405`、`415`、`406`。只有源码、构建与真实请求都通过，才说明兼容工程
不是把现代代码展示为一段无法运行的文字。

## 十一、本课小结

- `@RestController` 负责 Controller 与响应 body 语义，类级 URL 要用 `@RequestMapping` 声明。
- 类级路径提供共同前缀，方法级路径补充端点；省略方法路径时使用类级路径本身。
- `@GetMapping`、`@PostMapping`、`@PutMapping`、`@PatchMapping` 和 `@DeleteMapping` 把 HTTP 方法写进映射合同。
- 路径与 method 共同选择处理方法，固定路径比同位置 URI 变量更具体，源码顺序不决定结果。
- `params`、`headers`、`consumes` 和 `produces` 继续收窄候选，但不会自动完成 Java 参数或 body 绑定。
- 404、405、415、406 分别对应路径、method、请求媒体类型和响应媒体类型的典型失败方向。
- TeamFlow 主程序与练习都只返回固定文本，证明映射选择，而没有提前进入请求参数、请求体和响应设计。
- JDK 25 / Boot 4.1.0 与 Java 8 / Boot 2.3.12.RELEASE 使用相同映射源码，Web starter 和运行 JDK 分开配置。

## 累计项目衔接

累计项目的映射由 `UserController`、`TeamController`、`TeamFlowController` 和 `TaskAttachmentController`
共同拥有，统一位于 `/api/v1` 下。固定子路径、资源变量、HTTP 方法及媒体类型都由这些真实 Controller 声明。
