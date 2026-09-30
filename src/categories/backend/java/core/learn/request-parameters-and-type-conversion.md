---
id: backend.java.learn.intermediate.request-parameters-and-type-conversion
type: lesson
title: 请求参数
summary: 用显式参数合同读取路径、查询字符串和 URL 编码表单，并判断缺失与转换失败
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 150
prerequisites:
  - backend.java.learn.intermediate.spring-mvc-and-servlet-boundaries
objectives:
  - 能区分 URI 路径变量与 Servlet request parameter 两条输入通道。
  - 能用显式 name 的 @RequestParam 读取查询参数和 URL 编码表单参数。
  - 能正确选择 required、defaultValue、Optional 与包装类型表达缺失合同。
  - 能预测参数缺失、空字符串、默认值和类型转换失败的结果。
  - 能用 List 接收同名多值，并区分 Map 与 MultiValueMap 的首值和全值视图。
  - 能用 @PathVariable 读取 URI 模板变量，并区分路径未匹配与转换失败。
  - 能在 JDK 25 / Spring Boot 4.1.0 与 Java 8 / Spring Boot 2.3.12.RELEASE 中运行同一套参数绑定源码。
recap:
  - '@RequestParam 读取 Servlet request parameter，既可以来自 query，也可以来自符合条件的 URL 编码表单。'
  - 显式 name 不依赖编译产物保留 Java 参数名，value 是 name 的别名。
  - required 默认是 true；Optional 表达可缺失，defaultValue 同时覆盖缺失与空字符串。
  - String 输入会按目标 Java 类型转换；缺失和转换失败在默认 MVC 处理中通常都得到 400。
  - 同名多值应使用数组或 List；单值 Map 保留首值，MultiValueMap 保留全部值。
  - '@PathVariable 读取 URI 模板变量；少一个路径段通常是 404，值无法转换才是 400。'
  - JSON 字段不会自动进入 @RequestParam，本课也不提前处理请求体、校验或统一错误响应。
  - 两条版本线的推荐参数绑定源码相同，差异只在 JDK、Boot 版本和 Web starter。
related:
  - backend.java.learn.intermediate.spring-mvc-and-servlet-boundaries
  - backend.java.learn.intermediate.http-uri-and-request-response-basics
  - backend.java.learn.basics.unified-api-contract
tags:
  - Java
  - Spring Boot
  - Spring MVC
  - 请求参数
  - RequestParam
  - PathVariable
  - TeamFlow
appliesTo: JDK 25 与 Spring Boot 4.1.0 主线；Java 8 与 Spring Boot 2.3.12.RELEASE 兼容工程
verifiedAt: 2026-08-19
sources:
  - id: spring-boot-41-system-requirements
    title: 'System Requirements :: Spring Boot'
    url: https://docs.spring.io/spring-boot/4.1/system-requirements.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Spring Boot 4.1.0 至少需要 Java 17，JDK 25 满足该基线。
      - Spring Boot 4.1.0 使用 Spring Framework 7.0.8 或以上版本。
  - id: spring-boot-2312-requirements
    title: Spring Boot 2.3.12.RELEASE Getting Started
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java 8 与 Spring Boot 2.3.12.RELEASE
    claims:
      - Spring Boot 2.3.12.RELEASE 支持 Java 8 并使用 Spring Framework 5.2.15.RELEASE。
  - id: spring-request-param-reference
    title: '@RequestParam :: Spring Framework'
    url: https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestparam.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - '@RequestParam 绑定 Servlet request parameter，包括 query 与表单数据。'
      - 参数默认必填，Optional 可表达可选值，数组或 List 可接收同名多值。
      - 无名称的 Map 或 MultiValueMap 可以读取全部请求参数。
  - id: spring-request-param-708-api
    title: RequestParam (Spring Framework 7.0.8 API)
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/bind/annotation/RequestParam.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - value 与 name 互为别名，required 默认是 true。
      - defaultValue 隐式关闭 required，并在参数缺失或值为空字符串时生效。
  - id: spring-request-param-5215-api
    title: RequestParam (Spring Framework 5.2.15.RELEASE API)
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/bind/annotation/RequestParam.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Java 8 兼容线具有相同的 name、required、defaultValue 和 Map 绑定合同。
  - id: spring-path-variable-708-api
    title: PathVariable (Spring Framework 7.0.8 API)
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/bind/annotation/PathVariable.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - '@PathVariable 读取 URI 模板变量，value 与 name 互为别名。'
  - id: spring-path-variable-5215-api
    title: PathVariable (Spring Framework 5.2.15.RELEASE API)
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/bind/annotation/PathVariable.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Java 8 兼容线具有相同的 URI 模板变量绑定合同。
  - id: spring-mvc-type-conversion
    title: 'Type Conversion :: Spring Framework'
    url: https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/typeconversion.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - RequestParam 与 PathVariable 等 String 输入会按目标参数类型自动转换。
      - 常见简单类型由默认转换器支持。
  - id: spring-default-handler-exception-708
    title: DefaultHandlerExceptionResolver (Spring Framework 7.0.8 API)
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/servlet/mvc/support/DefaultHandlerExceptionResolver.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 缺少必填请求参数与请求值类型不匹配默认得到 400。
      - 已选择方法但声明的路径变量无法提取属于服务端映射错误。
  - id: spring-default-handler-exception-5215
    title: DefaultHandlerExceptionResolver (Spring Framework 5.2.15.RELEASE API)
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/servlet/mvc/support/DefaultHandlerExceptionResolver.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 兼容线同样把缺少必填请求参数和类型不匹配处理为 400。
  - id: jakarta-servlet-61-spec
    title: Jakarta Servlet Specification 6.1
    url: https://jakarta.ee/specifications/servlet/6.1/jakarta-servlet-spec-6.1.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Jakarta Servlet 6.1
    claims:
      - request parameter 可以来自 URI query 与符合条件的 POST URL 编码表单。
      - query 与表单同名时会合并，query 数据排在表单数据之前。
      - URI path 参数不由 getParameter 系列 API 暴露。
  - id: javaee8-servlet-request-api
    title: ServletRequest (Java EE 8 Specification APIs)
    url: https://javaee.github.io/javaee-spec/javadocs/javax/servlet/ServletRequest.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Java EE 8 与 Servlet 4.0
    claims:
      - getParameter 返回首值，getParameterValues 返回同名参数的全部值。
      - Java 8 兼容线使用相同的单值与多值参数视图。
---

# 请求参数

上一课已经让 TeamFlow 的请求准确进入一个 Controller 方法，但方法还没有读取请求携带的值。本课继续处理
这个边界：把 URI 路径、query 和 URL 编码表单中的文本，绑定为具有明确名称与类型的 Java 方法参数。

本课不读取 JSON body，不添加 Bean Validation，也不设计统一错误响应。成功请求只返回便于观察的纯文本；
失败请求只核对 Spring MVC 的默认状态码。这样可以先看清“值从哪里来、怎样转换、缺失时发生什么”。

## 一、先区分两条参数通道

### 1. 路径变量来自 URI 模板

请求路径中的值由映射模板定义，再由 `@PathVariable` 读取：

```text
GET /api/v1/tasks/42
                  ^
                  @PathVariable(name = "taskId")
```

这里的 `42` 属于 URI path。Spring 先用 `/{taskId}` 匹配路径，再把模板变量 `taskId` 交给方法参数解析器。
它不属于 Servlet request parameter，也不会出现在 `@RequestParam Map` 中。

### 2. query 与 URL 编码表单属于 request parameter

`@RequestParam` 读取 Servlet request parameter。在 Spring MVC 的 Servlet 栈中，这个集合不只包含 URL
问号后的 query，还可以包含符合 Servlet 解析条件的 POST 表单字段：

```text
GET /api/v1/tasks/search?status=OPEN
                              ^^^^^^^^^^^ query 参数

POST /api/v1/tasks/parameters
Content-Type: application/x-www-form-urlencoded

status=OPEN&owner=lin
^^^^^^^^^^^^^^^^^^^^ URL 编码表单参数
```

Servlet 只会在请求方法、媒体类型和解析时机满足规范时，把 body 中的 URL 编码表单加入参数集合。JSON
对象不会因为字段名相同就变成 `@RequestParam`；JSON body 留给下一课处理。

### 3. 映射筛选与参数绑定是两个步骤

上一课使用过 `params = "status"`：

```java
/**
 * 返回满足映射条件的固定文本。
 *
 * @return 映射结果
 */
@GetMapping(path = "/search", params = "status")
public String search() {
    return "matched";
}
```

它只表示“请求必须带 status 才选择这个方法”，不会创建 Java 局部变量。真正读取值要声明方法参数：

```java
/**
 * 返回调用方提供的任务状态。
 *
 * @param status 任务状态
 * @return 状态文本
 */
@GetMapping("/search")
public String search(@RequestParam(name = "status") String status) {
    return "status=" + status;
}
```

请求 `/search?status=OPEN` 时，方法得到字符串 `OPEN`。映射条件负责选中方法，参数解析器负责取值与转换，
两者不能互相代替。

## 二、用显式名称建立绑定合同

### 1. name 指向请求中的参数名

`@RequestParam(name = "status")` 中的 `status` 是 HTTP 请求参数名，右侧 Java 参数名可以不同：

```java
/**
 * 返回任务状态。
 *
 * @param taskStatus 绑定后的任务状态
 * @return 状态文本
 */
@GetMapping("/status")
public String status(@RequestParam(name = "status") String taskStatus) {
    return "status=" + taskStatus;
}
```

请求仍写 `?status=OPEN`。显式 name 不依赖编译产物是否保留 `taskStatus` 这个 Java 参数名，也让 API 合同
在重命名 Java 变量后保持不变。

### 2. value 是 name 的别名

下面三种写法都把请求参数 `status` 绑定到方法参数：

```java
@RequestParam(name = "status") String status
@RequestParam(value = "status") String status
@RequestParam("status") String status
```

本课统一使用第一种完整写法。它不会增加运行时能力，只是让第一次阅读注解的人直接看出字符串承担“参数
名称”的职责。

### 3. 不把 Java 参数名当作公开 API

Spring 可以在某些编译配置下推断简单参数的名称，但这会把运行结果绑定到编译器是否保留参数名。下面的
写法不作为课程主线：

```java
/**
 * 依赖 Java 参数名推断请求参数名。
 *
 * @param status 任务状态
 * @return 状态文本
 */
@GetMapping("/search")
public String search(@RequestParam String status) {
    return "status=" + status;
}
```

公开 HTTP 名称应明确写在注解里。Java 变量可以为可读性重构，调用方使用的 `status` 不应随之漂移。

## 三、表达必填、可选与默认值

### 1. required 默认是 true

下面的 status 必须存在：

```java
/**
 * 读取必填状态。
 *
 * @param status 任务状态
 * @return 状态文本
 */
@GetMapping("/required")
public String required(@RequestParam(name = "status") String status) {
    return "status=" + status;
}
```

`/required?status=OPEN` 返回 200；`/required` 在调用方法前产生缺少必填参数的异常，默认返回 400。这里的
400 表示请求已经命中路径和 HTTP 方法，但没有满足方法参数合同。

### 2. Optional 明确表达可能没有

当 owner 本来就可以省略时，用 `Optional<String>` 把“可能没有”写进类型：

```java
/**
 * 读取可选负责人。
 *
 * @param owner 可选负责人
 * @return 负责人文本
 */
@GetMapping("/owner")
public String owner(@RequestParam(name = "owner") Optional<String> owner) {
    return "owner=" + owner.orElse("none");
}
```

请求 `/owner` 得到 `owner=none`，请求 `/owner?owner=lin` 得到 `owner=lin`。Spring Framework 7.0.8 与
5.2.15 都把这种 Optional 参数视为可选值。

`required = false` 配合引用类型也能在缺失时得到 `null`，但 Optional 更清楚地暴露了调用方可能不提供值。

### 3. defaultValue 同时处理缺失与空字符串

页码有合理默认值时，可以直接声明：

```java
/**
 * 读取带默认值的页码。
 *
 * @param page 页码
 * @return 页码文本
 */
@GetMapping("/page")
public String page(@RequestParam(name = "page", defaultValue = "1") int page) {
    return "page=" + page;
}
```

| 请求 | 绑定结果 |
| --- | --- |
| `/page` | `page=1` |
| `/page?page=` | `page=1` |
| `/page?page=2` | `page=2` |
| `/page?page=abc` | 400 |

声明 defaultValue 会隐式把 required 设为 false。默认值仍是输入文本，随后也要转换成目标类型；如果把
默认值写成 `first`，即使调用方省略 page，也会因为 `first` 无法转换为 int 而失败。

### 4. 空字符串不总是等于缺失

没有 defaultValue 时，`?status=` 表示参数存在且值是空字符串。required 只保证参数出现，不保证字符串
包含业务内容：

```java
/**
 * 原样返回必填字符串。
 *
 * @param status 任务状态
 * @return 带边界符的状态文本
 */
@GetMapping("/raw-status")
public String rawStatus(@RequestParam(name = "status") String status) {
    return "status=[" + status + "]";
}
```

请求 `/raw-status?status=` 得到 `status=[]`。判断空白、长度或允许值属于后续参数校验课程，不能把 required
误解成完整的业务校验。

### 5. 可缺失 primitive 没有 null 表示

下面的声明存在矛盾：

```java
@RequestParam(name = "page", required = false) int page
```

参数可以缺失，但 primitive `int` 不能接收 null。若缺失时应使用 1，就声明 defaultValue；若缺失本身有
含义，就使用 `Optional<Integer>` 或 `Integer`。不要等待运行时再替你决定一个没有写进合同的数字。

## 四、从 HTTP 文本转换为 Java 类型

### 1. String 输入在调用方法前转换

query、path variable 和 URL 编码表单首先都是文本。方法声明 `int` 或 `long` 时，Spring 在调用 Controller
之前使用转换服务完成转换：

```java
/**
 * 读取整数页码。
 *
 * @param page 页码
 * @return 下一页页码
 */
@GetMapping("/next-page")
public String nextPage(@RequestParam(name = "page") int page) {
    return "next=" + (page + 1);
}
```

`?page=2` 会先得到 int 2，方法再返回 `next=3`。`?page=abc` 无法形成 int，方法不会执行，默认得到 400。

### 2. 400 不代表业务校验失败

本课会观察两类默认 400：

| 场景 | 失败位置 | Controller 是否执行 |
| --- | --- | --- |
| 缺少 required 请求参数 | 参数解析 | 否 |
| 文本无法转换为目标类型 | 类型转换 | 否 |

它们都发生在业务逻辑之前，但原因不同。Bean Validation、业务规则和稳定错误 JSON 都有后续课程，本课只
用请求与状态码分辨绑定阶段。

### 3. 默认转换只覆盖已注册类型

Spring 默认支持 int、long、boolean 等常见简单类型。自定义日期格式、业务值对象或特殊枚举输入可能需要
Converter 或 Formatter，但那是独立能力。本课使用数字与字符串，避免把参数绑定和自定义转换混成一课。

## 五、保留同名参数的多个值

### 1. List 表达一个名称对应多个值

筛选任务可能重复使用 tag：

```text
GET /api/v1/tasks/by-tags?tag=backend&tag=urgent
```

Controller 用 List 保留顺序：

```java
/**
 * 返回全部标签。
 *
 * @param tags 标签列表
 * @return 标签文本
 */
@GetMapping("/by-tags")
public String byTags(@RequestParam(name = "tag") List<String> tags) {
    return "tags=" + tags;
}
```

返回 `tags=[backend, urgent]`。数组同样可以接收同名多值；课程使用 List，是因为输出更容易直接观察。

### 2. 单值 Map 只保留每个名称的首值

无名称的 `@RequestParam Map<String, String>` 表示收集所有参数，但每个名称只有一个字符串位置：

```java
/**
 * 返回每个参数名称的首值。
 *
 * @param firstValues 参数首值视图
 * @return 参数文本
 */
@GetMapping("/first-values")
public String firstValues(@RequestParam Map<String, String> firstValues) {
    return "first=" + firstValues;
}
```

请求 `?tag=backend&tag=urgent&owner=lin` 时，tag 只能保留首值 `backend`。Map 适合每个名称按合同只允许一个
值的场景；它不能证明调用方没有重复发送。

### 3. MultiValueMap 保留全部值

要观察所有名称及其全部值，使用 Spring 的 `MultiValueMap`：

```java
/**
 * 返回每个参数名称的全部值。
 *
 * @param allValues 参数全值视图
 * @return 参数文本
 */
@GetMapping("/all-values")
public String allValues(@RequestParam MultiValueMap<String, String> allValues) {
    return "all=" + allValues;
}
```

同一请求中的 tag 保留为 `[backend, urgent]`。无名称注解是关键；写成
`@RequestParam(name = "params") Map<...>` 会要求 Spring 转换一个名为 params 的单独值，不是收集全部参数。

### 4. query 与表单同名时按规范合并

下面的 POST 同时在 query 与表单 body 中提供 tag：

```http
POST /api/v1/tasks/parameters?tag=query HTTP/1.1
Content-Type: application/x-www-form-urlencoded

tag=form-a&tag=form-b&owner=lin
```

Servlet 参数顺序是 `[query, form-a, form-b]`。因此单值 Map 的 tag 是 `query`，MultiValueMap 的 tag 保留
三个值。业务在意全部输入时，必须选择多值类型，不能只读取首值后假设请求没有重复项。

## 六、用 PathVariable 读取模板变量

### 1. name 必须对应模板变量

映射与方法参数通过相同名称连接：

```java
/**
 * 返回任务编号。
 *
 * @param taskId 任务编号
 * @return 任务编号文本
 */
@GetMapping("/{taskId}")
public String find(@PathVariable(name = "taskId") long taskId) {
    return "taskId=" + taskId;
}
```

`GET /api/v1/tasks/42` 先匹配 `/{taskId}`，再把字符串 `42` 转为 long，最终返回 `taskId=42`。

### 2. 404 与 400 发生在不同阶段

| 请求 | 结果 | 原因 |
| --- | --- | --- |
| `/api/v1/tasks/42` | 200 | 路径匹配且 42 能转为 long |
| `/api/v1/tasks/not-a-number` | 400 | 路径已匹配，但值无法转为 long |
| `/api/v1/tasks` | 404 | 少了整个路径段，没有匹配 `/{taskId}` |

最后一种情况不是“required PathVariable 缺失”。路由没有选中方法，参数解析器根本没有运行。只有方法已经
被选中、注解却声明了映射中不存在的变量名，才属于服务端映射配置错误；本课不故意构造这种端点。

### 3. 固定路径仍比变量路径更具体

同一个 Controller 可以同时声明 `/search`、`/by-tags` 和 `/{taskId}`。上一课已经证明固定路径更具体，
所以 `/search` 不会先被当作 taskId 再尝试转 long。参数绑定建立在已经完成的映射选择之上。

## 七、JDK 25 完整 TeamFlow 参数工程

### 1. 创建独立 Maven 工程

创建目录 `teamflow-request-parameters-jdk25`。现代主线固定使用 JDK 25、Spring Boot 4.1.0 和
`spring-boot-starter-webmvc`，完整 `pom.xml` 如下：

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
    <artifactId>teamflow-request-parameters-jdk25</artifactId>
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

工程只包含本课需要的启动类、Controller 和配置：

```text
teamflow-request-parameters-jdk25/
├── pom.xml
└── src/main
    ├── java/com/teamflow
    │   ├── TeamFlowApplication.java
    │   └── parameters/TaskParameterController.java
    └── resources/application.properties
```

### 2. 编写启动类与配置

`src/main/java/com/teamflow/TeamFlowApplication.java`：

```java
package com.teamflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 启动 TeamFlow 请求参数示例。
 */
@SpringBootApplication
public class TeamFlowApplication {
    /**
     * 启动现代版 Spring Boot Web 应用。
     *
     * @param args 启动参数
     */
    public static void main(String[] args) {
        SpringApplication.run(TeamFlowApplication.class, args);
    }
}
```

`src/main/resources/application.properties`：

```properties
spring.application.name=teamflow-request-parameters-jdk25
server.port=8080
```

启动类位于 `com.teamflow` 包根，Controller 位于其子包，因此会被默认组件扫描发现。

### 3. 编写完整 Controller

`src/main/java/com/teamflow/parameters/TaskParameterController.java`：

```java
package com.teamflow.parameters;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 展示 TeamFlow 请求参数与路径变量绑定。
 */
@RestController
@RequestMapping("/api/v1/tasks")
public final class TaskParameterController {
    /**
     * 绑定必填、默认和可选查询参数。
     *
     * @param status 任务状态
     * @param page 页码
     * @param owner 可选负责人
     * @return 绑定后的可观察文本
     */
    @GetMapping(path = "/search", produces = MediaType.TEXT_PLAIN_VALUE)
    public String search(
            @RequestParam(name = "status") String status,
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "owner") Optional<String> owner) {
        return "status=" + status + ",page=" + page + ",owner=" + owner.orElse("none");
    }

    /**
     * 绑定同名的多个标签。
     *
     * @param tags 标签列表
     * @return 绑定后的标签顺序
     */
    @GetMapping(path = "/by-tags", produces = MediaType.TEXT_PLAIN_VALUE)
    public String byTags(@RequestParam(name = "tag") List<String> tags) {
        return "tags=" + tags;
    }

    /**
     * 对比所有参数的首值和全部值。
     *
     * @param firstValues 每个参数名的首值
     * @param allValues 每个参数名的全部值
     * @return 两种参数视图中的关键值
     */
    @PostMapping(
            path = "/parameters",
            consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String parameters(
            @RequestParam Map<String, String> firstValues,
            @RequestParam MultiValueMap<String, String> allValues) {
        return "firstTag=" + firstValues.get("tag")
                + ",allTags=" + allValues.get("tag")
                + ",owner=" + firstValues.get("owner");
    }

    /**
     * 绑定一个 URI 路径变量。
     *
     * @param taskId 任务编号
     * @return 绑定后的任务编号
     */
    @GetMapping(path = "/{taskId}", produces = MediaType.TEXT_PLAIN_VALUE)
    public String find(@PathVariable(name = "taskId") long taskId) {
        return "taskId=" + taskId;
    }
}
```

四个方法分别观察必填、默认与可选值，同名多值，全部参数的两种 Map 视图，以及路径变量。Controller
没有 DTO、校验器或异常处理器，因此成功响应来自方法返回值，失败状态来自 Spring MVC 默认处理。

### 4. 构建、启动并验证

IDEA 的 Project SDK、Module SDK 与 Maven Runner JRE 都选择 JDK 25，Reload Maven 后运行
`TeamFlowApplication.main`。终端等价步骤是：

```bash
java -version
mvn -version
mvn clean package
mvn spring-boot:run
```

应用监听 8080 后，先验证查询参数的成功与失败路径：

```bash
curl --silent --show-error --write-out '\n' \
  'http://localhost:8080/api/v1/tasks/search?status=OPEN&page=2&owner=lin'
curl --silent --show-error --write-out '\n' \
  'http://localhost:8080/api/v1/tasks/search?status=OPEN'
curl --silent --show-error --write-out '\n' \
  'http://localhost:8080/api/v1/tasks/search?status=OPEN&page='
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  'http://localhost:8080/api/v1/tasks/search?page=2'
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  'http://localhost:8080/api/v1/tasks/search?status=OPEN&page=abc'
```

前三个响应依次为：

```text
status=OPEN,page=2,owner=lin
status=OPEN,page=1,owner=none
status=OPEN,page=1,owner=none
```

最后两个状态码都是 `400`。第一个 400 是缺少 required status，第二个 400 是 page 转换失败。

再验证多值、路径变量和 URL 编码表单：

```bash
curl --silent --show-error --write-out '\n' \
  'http://localhost:8080/api/v1/tasks/by-tags?tag=backend&tag=urgent'
curl --silent --show-error --write-out '\n' \
  'http://localhost:8080/api/v1/tasks/42'
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  'http://localhost:8080/api/v1/tasks/not-a-number'
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  'http://localhost:8080/api/v1/tasks'
curl --silent --show-error --write-out '\n' --request POST \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'tag=form-a' --data-urlencode 'tag=form-b' --data-urlencode 'owner=lin' \
  'http://localhost:8080/api/v1/tasks/parameters?tag=query'
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' --request POST \
  --header 'Content-Type: text/plain' --data 'tag=backend' \
  'http://localhost:8080/api/v1/tasks/parameters'
```

预期依次得到：

```text
tags=[backend, urgent]
taskId=42
400
404
firstTag=query,allTags=[query, form-a, form-b],owner=lin
415
```

表单成功结果同时证明三件事：`@RequestParam` 能读取 URL 编码表单，单值 Map 取得 tag 首值 `query`，
MultiValueMap 按 Servlet 合并顺序保留 query 与两个表单值。

## 八、Java 8 完整兼容工程

### 1. 只替换版本基线与 Web starter

创建另一个独立目录 `teamflow-request-parameters-java8`，不要与现代工程共用 `target`。完整 `pom.xml`：

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
    <artifactId>teamflow-request-parameters-java8</artifactId>
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

Boot 2.3.12.RELEASE 的聚合 starter 名为 `spring-boot-starter-web`。本课所用 Optional、List、Map、
MultiValueMap、RequestParam 和 PathVariable 在兼容线都已存在，因此不改写 Controller 逻辑。

### 2. 编写完整兼容源码与配置

`src/main/java/com/teamflow/TeamFlowApplication.java`：

```java
package com.teamflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 使用 Java 8 启动 TeamFlow 请求参数示例。
 */
@SpringBootApplication
public class TeamFlowApplication {
    /**
     * 启动 Java 8 兼容版应用。
     *
     * @param args 启动参数
     */
    public static void main(String[] args) {
        SpringApplication.run(TeamFlowApplication.class, args);
    }
}
```

`src/main/java/com/teamflow/parameters/TaskParameterController.java`：

```java
package com.teamflow.parameters;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 使用 Java 8 展示 TeamFlow 请求参数与路径变量绑定。
 */
@RestController
@RequestMapping("/api/v1/tasks")
public final class TaskParameterController {
    /**
     * 绑定必填、默认和可选查询参数。
     *
     * @param status 任务状态
     * @param page 页码
     * @param owner 可选负责人
     * @return 绑定后的可观察文本
     */
    @GetMapping(path = "/search", produces = MediaType.TEXT_PLAIN_VALUE)
    public String search(
            @RequestParam(name = "status") String status,
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "owner") Optional<String> owner) {
        return "status=" + status + ",page=" + page + ",owner=" + owner.orElse("none");
    }

    /**
     * 绑定同名的多个标签。
     *
     * @param tags 标签列表
     * @return 绑定后的标签顺序
     */
    @GetMapping(path = "/by-tags", produces = MediaType.TEXT_PLAIN_VALUE)
    public String byTags(@RequestParam(name = "tag") List<String> tags) {
        return "tags=" + tags;
    }

    /**
     * 对比所有参数的首值和全部值。
     *
     * @param firstValues 每个参数名的首值
     * @param allValues 每个参数名的全部值
     * @return 两种参数视图中的关键值
     */
    @PostMapping(
            path = "/parameters",
            consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String parameters(
            @RequestParam Map<String, String> firstValues,
            @RequestParam MultiValueMap<String, String> allValues) {
        return "firstTag=" + firstValues.get("tag")
                + ",allTags=" + allValues.get("tag")
                + ",owner=" + firstValues.get("owner");
    }

    /**
     * 绑定一个 URI 路径变量。
     *
     * @param taskId 任务编号
     * @return 绑定后的任务编号
     */
    @GetMapping(path = "/{taskId}", produces = MediaType.TEXT_PLAIN_VALUE)
    public String find(@PathVariable(name = "taskId") long taskId) {
        return "taskId=" + taskId;
    }
}
```

`src/main/resources/application.properties`：

```properties
spring.application.name=teamflow-request-parameters-java8
server.port=8080
```

### 3. 在真实 Java 8 环境复跑同一合同

IDEA 的 Project SDK、Module SDK 与 Maven Runner JRE 都切换为 Java 8，Reload Maven 后运行兼容工程；
不能只改 Project SDK 后继续使用现代工程的 POM 或 target。终端执行：

```bash
java -version
mvn -version
mvn clean package
mvn spring-boot:run
```

应用启动后，逐条复跑现代工程的 curl 矩阵。成功响应和 `400`、`404`、`415` 状态必须相同。两版的真实
差异只有 JDK、Boot 和 starter；本课没有需要分叉的 Java 源码。

## 九、集中排查常见参数误用

### 1. 先复现，再按同一输入修正

下面每项都只改变一个参数合同。不要同时修改 URL、端口、注解和请求体，否则无法判断是哪一项让结果变化。

:::pitfalls
### 把映射条件当成已经绑定参数

**触发条件：** 方法只声明 `params = "status"`，却直接在方法体读取没有定义的 status 变量。

**原因：** params 只参与处理方法选择，不会创建 Java 方法参数或局部变量。

**后果：** Java 编译器报告找不到 status，应用无法启动。

**错误示例：**

```java
/**
 * 返回状态筛选结果。
 *
 * @return 状态文本
 */
@GetMapping(path = "/search", params = "status")
public String search() {
    return "status=" + status;
}
```

**正确写法：**

```java
/**
 * 绑定并返回状态筛选值。
 *
 * @param status 任务状态
 * @return 状态文本
 */
@GetMapping(path = "/search", params = "status")
public String search(@RequestParam(name = "status") String status) {
    return "status=" + status;
}
```

**影响版本：** Spring Boot 4.1.0 与 2.3.12.RELEASE 都适用；错误首先由 Java 编译器发现。

**验证方式：** 编译错误版应报告找不到 status；正确版启动后请求 `?status=OPEN`，响应为 `status=OPEN`。

### 用可缺失的 primitive 接收 null

**触发条件：** 把 int 声明为 `required = false`，又没有提供 defaultValue。

**原因：** 缺失参数解析为 null，但 primitive int 没有 null 值。

**后果：** 参数缺失时请求在调用方法前失败，合同也没有说明应该采用哪个数字。

**错误示例：**

```java
/**
 * 返回可缺失页码。
 *
 * @param page 页码
 * @return 页码文本
 */
@GetMapping("/page")
public String page(@RequestParam(name = "page", required = false) int page) {
    return "page=" + page;
}
```

**正确写法：**

```java
/**
 * 返回带默认值的页码。
 *
 * @param page 页码
 * @return 页码文本
 */
@GetMapping("/page")
public String page(@RequestParam(name = "page", defaultValue = "1") int page) {
    return "page=" + page;
}
```

**影响版本：** Spring Framework 7.0.8 与 5.2.15.RELEASE 都适用。

**验证方式：** 不带 page 请求错误版会在参数解析阶段失败；正确版同一请求返回 `page=1`。

### 用单值 Map 接收重复参数

**触发条件：** 请求重复发送 tag，方法却只声明 `Map<String, String>`，并把结果当成完整输入。

**原因：** 单值 Map 每个名称只保留参数数组中的首值。

**后果：** 后续 tag 被静默忽略，业务看不到调用方真实发送的全部值。

**错误示例：**

```java
/**
 * 返回参数的首值视图。
 *
 * @param values 参数首值
 * @return 标签文本
 */
@GetMapping("/tags")
public String tags(@RequestParam Map<String, String> values) {
    return "tags=" + values.get("tag");
}
```

**正确写法：**

```java
/**
 * 返回参数的全值视图。
 *
 * @param values 参数全值
 * @return 标签文本
 */
@GetMapping("/tags")
public String tags(@RequestParam MultiValueMap<String, String> values) {
    return "tags=" + values.get("tag");
}
```

**影响版本：** Spring Framework 7.0.8 与 5.2.15.RELEASE 都适用。

**验证方式：** 请求 `?tag=backend&tag=urgent`；错误版只返回 backend，正确版返回 `[backend, urgent]`。

### 给收集全部参数的 Map 指定 name

**触发条件：** 想收集全部参数，却写成 `@RequestParam(name = "params") Map`。

**原因：** 指定 name 后，Spring 会寻找一个名为 params 的单独请求参数并尝试把它转换成 Map。

**后果：** 普通的 status、page 等参数不会被收集，缺少 params 时请求直接失败。

**错误示例：**

```java
/**
 * 错误地读取名为 params 的单值。
 *
 * @param values 参数值
 * @return 参数文本
 */
@GetMapping("/parameters")
public String parameters(@RequestParam(name = "params") Map<String, String> values) {
    return "values=" + values;
}
```

**正确写法：**

```java
/**
 * 收集全部请求参数的首值。
 *
 * @param values 参数首值
 * @return 参数文本
 */
@GetMapping("/parameters")
public String parameters(@RequestParam Map<String, String> values) {
    return "values=" + values;
}
```

**影响版本：** Spring Framework 7.0.8 与 5.2.15.RELEASE 都适用。

**验证方式：** 请求 `?status=OPEN&page=2`；错误版缺少 params 并失败，正确版同时包含 status 与 page。

### 路径模板名与 PathVariable name 不一致

**触发条件：** 映射使用 `/{taskId}`，注解却尝试读取名为 id 的 URI 变量。

**原因：** 方法已经被路径选中，但解析器无法在已提取的 URI 变量中找到 id。

**后果：** 这是服务端映射配置错误，不是“少一个路径段”的 404，也不是调用方值格式错误的 400。

**错误示例：**

```java
/**
 * 使用错误名称读取任务编号。
 *
 * @param taskId 任务编号
 * @return 任务编号文本
 */
@GetMapping("/{taskId}")
public String find(@PathVariable(name = "id") long taskId) {
    return "taskId=" + taskId;
}
```

**正确写法：**

```java
/**
 * 使用模板中的名称读取任务编号。
 *
 * @param taskId 任务编号
 * @return 任务编号文本
 */
@GetMapping("/{taskId}")
public String find(@PathVariable(name = "taskId") long taskId) {
    return "taskId=" + taskId;
}
```

**影响版本：** Spring Framework 7.0.8 与 5.2.15.RELEASE 都适用。

**验证方式：** 请求 `/42`；错误版记录缺少 URI 变量的服务端错误，正确版返回 `taskId=42`。另请求没有
路径段的 Controller 根路径，仍应因没有匹配方法得到 404。

### 期望 RequestParam 读取 JSON 字段

**触发条件：** 发送 `application/json` body，却用 RequestParam 读取 JSON 对象中的 status 字段。

**原因：** JSON 对象不会进入 Servlet request parameter 集合。

**后果：** status 仍被判定为缺失；错误媒体类型也可能在映射选择阶段先失败。

**错误示例：**

```java
/**
 * 错误地把 JSON 字段当成请求参数。
 *
 * @param status 任务状态
 * @return 状态文本
 */
@PostMapping(path = "/status", consumes = MediaType.APPLICATION_JSON_VALUE)
public String status(@RequestParam(name = "status") String status) {
    return "status=" + status;
}
```

**正确写法：**

```java
/**
 * 从 URL 编码表单读取状态参数。
 *
 * @param status 任务状态
 * @return 状态文本
 */
@PostMapping(path = "/status", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
public String status(@RequestParam(name = "status") String status) {
    return "status=" + status;
}
```

**影响版本：** Spring MVC Servlet 栈的两条课程基线都适用。

**验证方式：** 错误版发送 JSON `{"status":"OPEN"}` 时 status 仍缺失；正确版发送 URL 编码
`status=OPEN` 时返回 `status=OPEN`。读取 JSON 留给下一课的 RequestBody。
:::

## 十、独立练习

### 1. 为项目查询建立参数合同

:::exercise
### 绑定 TeamFlow 项目查询与路径参数

**要求：** 新建项目参数 Controller，类级路径固定为 `/api/v1/projects`。`/search` 读取必填 stage、默认值
为 20 的 size 和可选 reviewer；`/by-members` 用 List 读取同名 member；`/{projectId}` 把路径值转为 long；
POST `/parameters` 只接收 URL 编码表单，并用 Map 与 MultiValueMap 同时观察首值和全部值。不得读取 JSON、
创建 DTO、添加校验或自定义异常处理。

**验收：** 查询成功、缺少 stage、默认 size、空 size、可选 reviewer、size 转换失败、同名 member、路径
成功、路径转换失败、少路径段、query 与 form 合并、错误 Content-Type 都有可观察结果。JDK 25 / Boot
4.1.0 与 Java 8 / Boot 2.3.12.RELEASE 工程都能独立构建、启动并得到相同 HTTP 合同。

**参考答案：** 两个版本的完整 POM、配置、启动类、Controller 和请求步骤见后文。先独立完成，再按一个
端点一个合同逐项对照。
:::

### 2. JDK 25 完整参考工程

现代练习工程名为 `teamflow-project-parameters-jdk25`。完整 `pom.xml`：

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
    <artifactId>teamflow-project-parameters-jdk25</artifactId>
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
spring.application.name=teamflow-project-parameters-jdk25
server.port=8080
```

`src/main/java/com/teamflow/TeamFlowApplication.java`：

```java
package com.teamflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 启动 TeamFlow 项目参数练习。
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

`src/main/java/com/teamflow/parameters/ProjectParameterController.java`：

```java
package com.teamflow.parameters;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 展示 TeamFlow 项目资源的参数绑定合同。
 */
@RestController
@RequestMapping("/api/v1/projects")
public final class ProjectParameterController {
    /**
     * 绑定项目查询条件。
     *
     * @param stage 项目阶段
     * @param size 返回数量
     * @param reviewer 可选审核人
     * @return 绑定后的查询条件
     */
    @GetMapping(path = "/search", produces = MediaType.TEXT_PLAIN_VALUE)
    public String search(
            @RequestParam(name = "stage") String stage,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestParam(name = "reviewer") Optional<String> reviewer) {
        return "stage=" + stage + ",size=" + size + ",reviewer=" + reviewer.orElse("none");
    }

    /**
     * 绑定多个项目成员。
     *
     * @param members 成员列表
     * @return 成员顺序
     */
    @GetMapping(path = "/by-members", produces = MediaType.TEXT_PLAIN_VALUE)
    public String byMembers(@RequestParam(name = "member") List<String> members) {
        return "members=" + members;
    }

    /**
     * 对比项目参数的首值与全部值。
     *
     * @param firstValues 每个参数名的首值
     * @param allValues 每个参数名的全部值
     * @return 两种参数视图中的关键值
     */
    @PostMapping(
            path = "/parameters",
            consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String parameters(
            @RequestParam Map<String, String> firstValues,
            @RequestParam MultiValueMap<String, String> allValues) {
        return "firstMember=" + firstValues.get("member")
                + ",allMembers=" + allValues.get("member")
                + ",reviewer=" + firstValues.get("reviewer");
    }

    /**
     * 绑定项目路径编号。
     *
     * @param projectId 项目编号
     * @return 项目编号文本
     */
    @GetMapping(path = "/{projectId}", produces = MediaType.TEXT_PLAIN_VALUE)
    public String find(@PathVariable(name = "projectId") long projectId) {
        return "projectId=" + projectId;
    }
}
```

用 JDK 25 构建并启动后执行：

```bash
mvn clean package
mvn spring-boot:run
```

在另一个终端验证：

```bash
curl --silent --show-error --write-out '\n' \
  'http://localhost:8080/api/v1/projects/search?stage=ACTIVE&size=10&reviewer=lin'
curl --silent --show-error --write-out '\n' \
  'http://localhost:8080/api/v1/projects/search?stage=ACTIVE'
curl --silent --show-error --write-out '\n' \
  'http://localhost:8080/api/v1/projects/search?stage=ACTIVE&size='
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  'http://localhost:8080/api/v1/projects/search?size=10'
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  'http://localhost:8080/api/v1/projects/search?stage=ACTIVE&size=many'
curl --silent --show-error --write-out '\n' \
  'http://localhost:8080/api/v1/projects/by-members?member=lin&member=mei'
curl --silent --show-error --write-out '\n' 'http://localhost:8080/api/v1/projects/7'
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  'http://localhost:8080/api/v1/projects/not-a-number'
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  'http://localhost:8080/api/v1/projects'
curl --silent --show-error --write-out '\n' --request POST \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'member=form-a' --data-urlencode 'member=form-b' \
  --data-urlencode 'reviewer=lin' \
  'http://localhost:8080/api/v1/projects/parameters?member=query'
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' --request POST \
  --header 'Content-Type: application/json' --data '{}' \
  'http://localhost:8080/api/v1/projects/parameters'
```

预期依次得到：

```text
stage=ACTIVE,size=10,reviewer=lin
stage=ACTIVE,size=20,reviewer=none
stage=ACTIVE,size=20,reviewer=none
400
400
members=[lin, mei]
projectId=7
400
404
firstMember=query,allMembers=[query, form-a, form-b],reviewer=lin
415
```

### 3. Java 8 完整参考工程

兼容练习工程名为 `teamflow-project-parameters-java8`。完整 `pom.xml`：

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
    <artifactId>teamflow-project-parameters-java8</artifactId>
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
spring.application.name=teamflow-project-parameters-java8
server.port=8080
```

`src/main/java/com/teamflow/TeamFlowApplication.java`：

```java
package com.teamflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 使用 Java 8 启动 TeamFlow 项目参数练习。
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

`src/main/java/com/teamflow/parameters/ProjectParameterController.java`：

```java
package com.teamflow.parameters;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 使用 Java 8 展示 TeamFlow 项目资源的参数绑定合同。
 */
@RestController
@RequestMapping("/api/v1/projects")
public final class ProjectParameterController {
    /**
     * 绑定项目查询条件。
     *
     * @param stage 项目阶段
     * @param size 返回数量
     * @param reviewer 可选审核人
     * @return 绑定后的查询条件
     */
    @GetMapping(path = "/search", produces = MediaType.TEXT_PLAIN_VALUE)
    public String search(
            @RequestParam(name = "stage") String stage,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestParam(name = "reviewer") Optional<String> reviewer) {
        return "stage=" + stage + ",size=" + size + ",reviewer=" + reviewer.orElse("none");
    }

    /**
     * 绑定多个项目成员。
     *
     * @param members 成员列表
     * @return 成员顺序
     */
    @GetMapping(path = "/by-members", produces = MediaType.TEXT_PLAIN_VALUE)
    public String byMembers(@RequestParam(name = "member") List<String> members) {
        return "members=" + members;
    }

    /**
     * 对比项目参数的首值与全部值。
     *
     * @param firstValues 每个参数名的首值
     * @param allValues 每个参数名的全部值
     * @return 两种参数视图中的关键值
     */
    @PostMapping(
            path = "/parameters",
            consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String parameters(
            @RequestParam Map<String, String> firstValues,
            @RequestParam MultiValueMap<String, String> allValues) {
        return "firstMember=" + firstValues.get("member")
                + ",allMembers=" + allValues.get("member")
                + ",reviewer=" + firstValues.get("reviewer");
    }

    /**
     * 绑定项目路径编号。
     *
     * @param projectId 项目编号
     * @return 项目编号文本
     */
    @GetMapping(path = "/{projectId}", produces = MediaType.TEXT_PLAIN_VALUE)
    public String find(@PathVariable(name = "projectId") long projectId) {
        return "projectId=" + projectId;
    }
}
```

在 Java 8 环境执行 `mvn clean package` 与 `mvn spring-boot:run`，再复跑上一节的全部 curl。两个工程应逐项
得到相同文本和状态码。若端口仍被现代练习占用，应先停止现代进程，再启动兼容工程，不能把旧响应当作
Java 8 验收结果。

## 十一、本课小结

- PathVariable 读取 URI 模板变量；RequestParam 读取 Servlet request parameter，后者可以来自 query 和
  符合解析条件的 URL 编码表单。
- 显式 name 把 HTTP 名称固定在注解中，不依赖 Java 参数名发现；映射条件 params 只筛选方法，不负责取值。
- required 默认必填；Optional 表达可缺失；defaultValue 同时处理缺失和空字符串，并仍要经过类型转换。
- String 输入会在 Controller 执行前转为目标类型。缺少必填参数和转换失败默认是 400，少一个路径段通常是
  404，错误 Content-Type 不满足 consumes 时是 415。
- 同名多值使用数组或 List。无名称的单值 Map 保留每个名称的首值，MultiValueMap 保留全部值。
- JDK 25 / Spring Boot 4.1.0 与 Java 8 / Spring Boot 2.3.12.RELEASE 可以使用相同参数绑定源码；工程仍需
  以各自 JDK、Boot 版本和 Web starter 独立构建、启动和请求验证。
- JSON 字段、Bean Validation、自定义转换和统一错误响应不属于本课，不能用 RequestParam 提前替代它们。

## 累计项目衔接

累计项目把 `projectId`、`taskId`、`teamId` 和 `memberId` 保留为路径变量，把 `pageSize`、`pageToken` 与任务
`status` 保留为查询参数。转换、分页范围和不透明 token 失败统一进入公开 Problem Details，而不进入业务方法。
