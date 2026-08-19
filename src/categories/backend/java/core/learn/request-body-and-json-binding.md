---
id: backend.java.learn.intermediate.request-body-and-json-binding
type: lesson
title: 请求体
summary: 使用 @RequestBody 将 JSON 请求体转换为 Java DTO，并区分媒体类型、缺失内容和格式错误
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 150
prerequisites:
  - backend.java.learn.intermediate.request-parameters-and-type-conversion
  - backend.java.learn.intermediate.json-and-data-contracts
objectives:
  - 能区分 URI 路径、请求参数和 HTTP 请求体三条输入通道。
  - 能使用 @RequestBody 将 JSON 对象绑定到 Java DTO。
  - 能解释 Content-Type、consumes 与 HttpMessageConverter 在请求体处理中的职责。
  - 能预测 JSON 请求成功、缺少请求体、格式错误和错误媒体类型时的默认结果。
  - 能区分字段缺失、null 和空字符串，并说明本课没有自动完成业务校验。
  - 能在 JDK 25 / Spring Boot 4.1.0 与 Java 8 / Spring Boot 2.3.12.RELEASE 中运行同一套请求体源码。
recap:
  - PathVariable 读取 URI 模板变量，RequestParam 读取 query 和符合条件的 URL 编码表单，RequestBody 读取 HTTP body。
  - '@RequestBody 让消息转换器读取请求体，并按 Content-Type 选择能够把字节转换为目标 Java 类型的转换器。'
  - JSON 对象字段按 DTO 的属性名映射；字段缺失或 null 不等于 Bean Validation 失败。
  - 默认 required=true，缺少 body 或 body 无法反序列化通常是 400；不满足 consumes 的媒体类型通常是 415。
  - Content-Type 描述请求体格式，Accept 描述客户端愿意接收的响应格式，两者不能互换。
  - JavaBean DTO 可以在两条版本线上复用；两套工程仍必须使用各自 JDK、Spring Boot 和 Web starter 独立构建。
related:
  - backend.java.learn.intermediate.request-parameters-and-type-conversion
  - backend.java.learn.intermediate.json-and-data-contracts
  - backend.java.learn.basics.unified-api-contract
tags:
  - Java
  - Spring Boot
  - Spring MVC
  - 请求体
  - RequestBody
  - JSON
  - HttpMessageConverter
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
  - id: spring-boot-2312-system-requirements
    title: Spring Boot 2.3.12.RELEASE Getting Started
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java 8 与 Spring Boot 2.3.12.RELEASE
    claims:
      - Spring Boot 2.3.12.RELEASE 支持 Java 8，并使用 Spring Framework 5.2.15.RELEASE。
  - id: spring-request-body-reference
    title: '@RequestBody :: Spring Framework'
    url: https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestbody.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - '@RequestBody 由 HttpMessageConverter 读取请求体并转换为方法参数对象。'
      - 请求体可以按 Content-Type 选择 JSON 等媒体类型的消息转换器。
      - '@RequestBody 默认要求请求体存在，required=false 才允许缺少请求体。'
  - id: spring-request-body-708-api
    title: RequestBody (Spring Framework 7.0.8 API)
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/bind/annotation/RequestBody.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - RequestBody 注解标记方法参数应绑定到 Web 请求体。
      - required 属性默认是 true，缺少请求体时默认会导致异常。
  - id: spring-request-body-5215-api
    title: RequestBody (Spring Framework 5.2.15.RELEASE API)
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/bind/annotation/RequestBody.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Java 8 兼容线的 RequestBody 具有相同的 required 请求体存在性合同。
  - id: spring-http-message-converter-708-api
    title: HttpMessageConverter (Spring Framework 7.0.8 API)
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/http/converter/HttpMessageConverter.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - HttpMessageConverter 判断可读媒体类型，并把 HTTP body 读成指定 Java 类型。
  - id: spring-http-message-converter-5215-api
    title: HttpMessageConverter (Spring Framework 5.2.15.RELEASE API)
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/http/converter/HttpMessageConverter.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Java 8 兼容线的消息转换器接口保留相同的媒体类型判断和 body 读取职责。
  - id: spring-message-converters-reference
    title: 'HTTP Message Conversion :: Spring Framework'
    url: https://docs.spring.io/spring-framework/reference/web/webmvc/message-converters.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - Spring MVC 使用 HttpMessageConverter 在 HTTP 请求或响应与 Java 对象之间转换。
  - id: spring-boot-41-json
    title: 'JSON :: Spring Boot'
    url: https://docs.spring.io/spring-boot/4.1/reference/features/json.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Spring Boot 4.1 默认使用 Jackson 3，并自动配置 JSON 映射能力。
  - id: spring-boot-2312-json
    title: Spring Boot 2.3.12.RELEASE JSON Reference
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/htmlsingle/#boot-features-json
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Spring Boot 2.3 使用 Jackson 2 作为默认 JSON 库，Web starter 默认包含 JSON starter。
  - id: spring-default-handler-exception-708
    title: DefaultHandlerExceptionResolver (Spring Framework 7.0.8 API)
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/servlet/mvc/support/DefaultHandlerExceptionResolver.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 不可读请求体默认映射为 400，不支持的请求媒体类型默认映射为 415。
  - id: spring-default-handler-exception-5215
    title: DefaultHandlerExceptionResolver (Spring Framework 5.2.15.RELEASE API)
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/servlet/mvc/support/DefaultHandlerExceptionResolver.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - Java 8 兼容线同样把不可读请求体默认映射为 400，把不支持的请求媒体类型映射为 415。
  - id: rfc-9110-content-type
    title: RFC 9110 HTTP Semantics - Content-Type
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-8.3
    sourceOrigin: official
    sourceType: specification
    appliesTo: HTTP Semantics
    claims:
      - Content-Type 指示请求或响应中表示的数据媒体类型。
  - id: rfc-8259-json
    title: RFC 8259 The JavaScript Object Notation (JSON) Data Interchange Format
    url: https://www.rfc-editor.org/rfc/rfc8259.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: JSON
    claims:
      - JSON 对象由成员名称和值组成，成员值可为对象、数组、字符串、数字、布尔或 null。
---

# 请求体

上一课已经处理了路径变量、query 和 URL 编码表单。创建或更新任务时，调用方通常还要一次提交一个结构化
对象：标题、负责人和预计工时一起放进 HTTP body。本课把这段 body 交给 Spring MVC 的消息转换器，观察它
怎样按 `Content-Type` 选择读取方式，再把 JSON 对象绑定到 Java DTO。

本课只处理“请求体能否按 JSON 形状读成对象”。不添加 Bean Validation、统一接口响应、全局异常处理、文件
上传或业务持久化。这样，缺少字段与字段值不合法的区别可以保持清楚，默认 400 和 415 也能直接从请求阶段
解释。

## 一、先区分三条输入通道

### 1. 路径和请求参数仍然是 URL 的一部分

路径变量和请求参数由 URL 表达：

```text
GET /api/v1/tasks/42?view=summary
                  ^       ^
                  path    query parameter
```

上一课的 `@PathVariable` 和 `@RequestParam` 读取的是这两处文本。即使请求还有 body，它们也不会自动从 JSON
字段中取值。

### 2. 请求体是独立的字节序列

创建任务可以把结构化数据放在 body：

```http
POST /api/v1/tasks/preview HTTP/1.1
Content-Type: application/json

{"title":"整理课程合同","estimateHours":3}
```

这里的 JSON 不是 query 参数。Servlet 的参数集合不会因为 body 里出现了 `title` 就自动多出一个 `title` 参数；
Spring 需要使用 `@RequestBody` 及消息转换器读取这段 body。

### 3. 一个端点可以同时声明 URL 输入和 body

如果接口确实需要两种来源，可以分别声明：

```java
/**
 * 读取路径编号和任务请求体。
 *
 * @param taskId 路径中的任务编号
 * @param request JSON 请求体
 * @return 可观察的输入文本
 */
@PostMapping("/{taskId}/preview")
public String preview(
        @PathVariable(name = "taskId") long taskId,
        @RequestBody TaskRequest request) {
    return "taskId=" + taskId + ",title=" + request.getTitle();
}
```

注解各自负责一条通道：路由先提取 `taskId`，消息转换器再读取 body。它们不会互相替代。

## 二、`@RequestBody` 怎样把 JSON 交给 DTO

### 1. 注解表达 body 绑定意图

最小写法是把 `@RequestBody` 放在方法参数上：

```java
/**
 * 返回请求体中的任务信息。
 *
 * @param request 已反序列化的任务请求
 * @return 请求体摘要
 */
@PostMapping(path = "/preview", consumes = MediaType.APPLICATION_JSON_VALUE)
public String preview(@RequestBody TaskRequest request) {
    return "title=" + request.getTitle() + ",hours=" + request.getEstimateHours();
}
```

默认 `required=true`。调用方法前，Spring 会查找能够读取请求 `Content-Type` 并产生 `TaskRequest` 的
`HttpMessageConverter`。在 Spring Boot 的 Web starter 中，Jackson JSON 转换器会负责常见的
`application/json` body。

### 2. JavaBean DTO 提供可读写属性

本课使用 JavaBean 风格 DTO，让 Java 8 和 JDK 25 共用同一份请求对象源码：

```java
/**
 * TeamFlow 的请求体数据。
 */
public final class TaskRequest {
    private String title;
    private int estimateHours;

    /**
     * 创建空请求对象，供 JSON 转换器填充属性。
     */
    public TaskRequest() {
    }

    /**
     * 读取任务标题。
     *
     * @return 任务标题
     */
    public String getTitle() {
        return title;
    }

    /**
     * 写入任务标题。
     *
     * @param title 任务标题
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * 读取预计工时。
     *
     * @return 预计工时
     */
    public int getEstimateHours() {
        return estimateHours;
    }

    /**
     * 写入预计工时。
     *
     * @param estimateHours 预计工时
     */
    public void setEstimateHours(int estimateHours) {
        this.estimateHours = estimateHours;
    }
}
```

JSON 字段名与 JavaBean 属性名对应：`title` 调用 `setTitle`，`estimateHours` 调用
`setEstimateHours`。请求体被转换后，Controller 只读取已经填好的对象；它不需要自己拼接 JSON 或读取
`InputStream`。

### 3. JSON 形状映射不是业务校验

以下 body 都可能通过“语法与形状读取”这一步：

```json
{"title":"整理课程合同","estimateHours":3}
```

```json
{"title":"整理课程合同"}
```

```json
{"title":null,"estimateHours":0}
```

第二个对象缺少 `estimateHours`，Java primitive 字段保持默认值 `0`；第三个对象明确把 title 设为 `null`。
它们是否符合产品规则，要等后续 Bean Validation 或业务服务判断。本课不能把字段缺失误写成自动 400。

`{"title":""}` 也只是一个可反序列化的空字符串。`@RequestBody` 负责读取数据，不负责判断标题是否非空、
工时是否为正数或调用者是否有权修改任务。

## 三、`Content-Type` 决定按什么格式读取

### 1. `consumes` 是映射阶段的媒体类型筛选

为 JSON 端点声明 `consumes`：

```java
/**
 * 只接收 JSON 请求体。
 *
 * @param request JSON 任务请求
 * @return 请求体摘要
 */
@PostMapping(
        path = "/preview",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.TEXT_PLAIN_VALUE
)
public String preview(@RequestBody TaskRequest request) {
    return "title=" + request.getTitle() + ",hours=" + request.getEstimateHours();
}
```

`consumes` 先参与请求映射选择；通过后，`@RequestBody` 再让转换器读取 body。把两步混成一个“JSON 注解”会
让 404、415 和 400 的原因难以区分。

### 2. `Content-Type` 和 `Accept` 方向相反

发送 JSON 时请求头应是：

```http
Content-Type: application/json
```

它描述“我发送的 body 是什么格式”。`Accept: text/plain` 描述“我希望响应是什么格式”。本课的示例用
`produces = text/plain` 返回便于观察的文本，所以验证命令可以同时发送这两个不同职责的头：

```bash
curl --silent --show-error --header 'Content-Type: application/json' \
  --header 'Accept: text/plain' \
  --data '{"title":"整理课程合同","estimateHours":3}' \
  'http://localhost:8080/api/v1/tasks/preview'
```

不能用 `Accept: application/json` 代替 `Content-Type`。前者不告诉服务器 request body 的格式。

### 3. URL 编码表单不是 JSON

`application/x-www-form-urlencoded` 适合上一课的 `@RequestParam`，不是本课 JSON DTO 的输入格式：

```http
POST /api/v1/tasks/preview HTTP/1.1
Content-Type: application/x-www-form-urlencoded

title=整理课程合同&estimateHours=3
```

当映射声明只接收 JSON 时，这个请求不会进入方法。若业务确实需要表单，应另设明确的表单绑定合同，不能
把两种编码混成同一条 JSON 接口。

## 四、观察成功和默认失败

### 1. 合法 JSON 会先转换，再调用 Controller

对 `application/json` body，处理顺序可以简化为：

```text
HTTP body bytes
    -> Content-Type 匹配
    -> JSON message converter
    -> TaskRequest
    -> Controller 方法
```

只有最后一步执行时，`request.getTitle()` 才有机会被读取。JSON 语法错误或 Java 类型不匹配会在转换阶段
停止，方法体不会执行。

### 2. 缺少请求体默认是 400

`@RequestBody` 的 `required` 默认值为 `true`。命中 JSON 映射但没有 body 时，Spring 在调用方法前报告
缺少可读取的请求体，默认 MVC 处理通常返回 400。它和 DTO 中缺少 `title` 是两件事：前者没有 body，后者
有 body 但字段没有出现。

### 3. JSON 语法错误或类型错误默认是 400

下面两种 body 都无法形成 `TaskRequest`：

```json
{"title":"整理课程合同"
```

```json
{"title":"整理课程合同","estimateHours":"three"}
```

前者不是完整 JSON，后者无法把字符串 `three` 转成 primitive `int`。默认情况下转换异常在 Controller 调用
前被处理为 400；不要把它误判成 415，415 表示媒体类型不被端点接受。

### 4. 错误媒体类型通常是 415

JSON 端点收到 URL 编码表单或 `text/plain` 时，`Content-Type` 不满足 `consumes`，请求会在映射或消息读取
阶段得到 415。此时 Controller 也不会执行。真正的错误是“格式声明不受支持”，不是 JSON 文本内容坏了。

### 5. 缺少媒体类型也不能靠内容猜格式

如果请求确实带有 JSON 字节，却显式移除了 `Content-Type`，两条课程基线都会把它视为无法选择 JSON 转换器的
请求，并返回 415。空 body 在同样的“无媒体类型”条件下也先得到 415；这和带
`Content-Type: application/json` 的空 body 返回 400 不同。

```bash
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  --request POST --header 'Content-Type:' \
  --data-binary '{"title":"整理课程合同","estimateHours":3}' \
  'http://localhost:8080/api/v1/tasks/preview'
```

`curl --data` 会自动添加 `application/x-www-form-urlencoded`，所以测试真正缺少媒体类型时必须使用
`--header 'Content-Type:'`。JSON literal `null` 也不是“没有请求体”：它是有内容但转换结果为 null，在本课的
`required=true` 端点上默认得到 400。

## 五、JDK 25 与 Java 8 的工程边界

### 1. 两条版本线的依赖不同

现代工程使用：

```xml
<version>4.1.0</version>
<java.version>25</java.version>
<artifactId>spring-boot-starter-webmvc</artifactId>
```

兼容工程使用：

```xml
<version>2.3.12.RELEASE</version>
<java.version>1.8</java.version>
<artifactId>spring-boot-starter-web</artifactId>
```

Spring Boot 4.1.0 的最低 Java 基线是 17，JDK 25 满足它；Spring Boot 2.3.12.RELEASE 支持 Java 8。两条
版本线通过各自的 Spring Framework 和 Jackson 依赖提供消息转换能力。

### 2. 本课选择兼容的 JavaBean DTO

JDK 25 也可以用 record 表示请求对象，但 Java 8 没有 record 语法。为了让两套工程的 HTTP 合同、字段名称和
Controller 源码保持一致，本课选择带无参构造器、getter 和 setter 的 JavaBean DTO。record 与不可变请求模型
仍可在已经讲过的 record 课程和后续工程设计中使用；它不是本课需要提前展开的版本差异。

两套工程仍然必须分别执行自己的 Maven 构建和 HTTP 矩阵，不能只在现代 JDK 上编译后宣称 Java 8 兼容。

## 六、JDK 25 完整 TeamFlow 请求体工程

### 1. 创建独立 Maven 工程

创建目录 `teamflow-request-body-jdk25`。现代主线使用 JDK 25、Spring Boot 4.1.0 和
`spring-boot-starter-webmvc`：

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
    <artifactId>teamflow-request-body-jdk25</artifactId>
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

工程目录如下：

```text
teamflow-request-body-jdk25/
├── pom.xml
└── src/main
    ├── java/com/teamflow
    │   ├── TeamFlowApplication.java
    │   └── body
    │       ├── TaskRequest.java
    │       └── TaskRequestController.java
    └── resources/application.properties
```

### 2. 编写启动类、配置和 DTO

`src/main/java/com/teamflow/TeamFlowApplication.java`：

```java
package com.teamflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 启动 TeamFlow 请求体示例。
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
spring.application.name=teamflow-request-body-jdk25
server.port=8080
```

`src/main/java/com/teamflow/body/TaskRequest.java`：

```java
package com.teamflow.body;

/**
 * 表示从 JSON 请求体读取的任务数据。
 */
public final class TaskRequest {
    private String title;
    private int estimateHours;

    /**
     * 创建供消息转换器填充的空对象。
     */
    public TaskRequest() {
    }

    /**
     * 读取任务标题。
     *
     * @return 任务标题
     */
    public String getTitle() {
        return title;
    }

    /**
     * 写入任务标题。
     *
     * @param title 任务标题
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * 读取预计工时。
     *
     * @return 预计工时
     */
    public int getEstimateHours() {
        return estimateHours;
    }

    /**
     * 写入预计工时。
     *
     * @param estimateHours 预计工时
     */
    public void setEstimateHours(int estimateHours) {
        this.estimateHours = estimateHours;
    }
}
```

### 3. 编写 Controller

`src/main/java/com/teamflow/body/TaskRequestController.java`：

```java
package com.teamflow.body;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 展示 JSON 请求体到 Java DTO 的绑定。
 */
@RestController
@RequestMapping("/api/v1/tasks")
public final class TaskRequestController {
    /**
     * 读取 JSON 任务请求并返回便于观察的文本。
     *
     * @param request JSON 请求体
     * @return 请求体摘要
     */
    @PostMapping(
            path = "/preview",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String preview(@RequestBody TaskRequest request) {
        return "title=" + request.getTitle() + ",hours=" + request.getEstimateHours();
    }
}
```

### 4. 构建、启动和验证

在 IDEA 中把 Project SDK、Module SDK 与 Maven Runner JRE 都设为 JDK 25，Reload Maven 后运行
`TeamFlowApplication.main`。终端等价步骤是：

```bash
java -version
mvn -version
mvn clean package
mvn spring-boot:run
```

应用监听 8080 后，从另一个终端执行：

```bash
curl --silent --show-error --write-out '\n' \
  --header 'Content-Type: application/json' \
  --data '{"title":"整理课程合同","estimateHours":3}' \
  'http://localhost:8080/api/v1/tasks/preview'
curl --silent --show-error --write-out '\n' \
  --header 'Content-Type: application/json' \
  --data '{"title":"整理课程合同"}' \
  'http://localhost:8080/api/v1/tasks/preview'
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  --header 'Content-Type: application/json' \
  --data '' \
  'http://localhost:8080/api/v1/tasks/preview'
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  --header 'Content-Type: application/json' \
  --data '{"title":"整理课程合同"' \
  'http://localhost:8080/api/v1/tasks/preview'
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  --header 'Content-Type: application/json' \
  --data '{"title":"整理课程合同","estimateHours":"three"}' \
  'http://localhost:8080/api/v1/tasks/preview'
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'title=整理课程合同' --data-urlencode 'estimateHours=3' \
  'http://localhost:8080/api/v1/tasks/preview'
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  --header 'Content-Type: application/json' --data 'null' \
  'http://localhost:8080/api/v1/tasks/preview'
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  --header 'Content-Type:' \
  --data-binary '{"title":"整理课程合同","estimateHours":3}' \
  'http://localhost:8080/api/v1/tasks/preview'
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  --request POST --header 'Content-Type:' \
  'http://localhost:8080/api/v1/tasks/preview'
```

预期依次为：

```text
title=整理课程合同,hours=3
title=整理课程合同,hours=0
400
400
400
415
400
415
415
```

第二个请求有 body 但缺少字段，仍能完成形状绑定并返回 `0`；第三个请求没有 body，才触发默认 required 合同。

## 七、Java 8 完整兼容工程

### 1. 使用独立 POM 和运行环境

创建目录 `teamflow-request-body-java8`。兼容线必须单独使用 Java 8、Spring Boot 2.3.12.RELEASE 和
`spring-boot-starter-web`：

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
    <artifactId>teamflow-request-body-java8</artifactId>
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

目录与现代工程相同，文件内容也保持相同的 JavaBean DTO 与 Controller 合同。`src/main/resources/application.properties`：

```properties
spring.application.name=teamflow-request-body-java8
server.port=8080
```

### 2. 启动类、DTO 和 Controller

`src/main/java/com/teamflow/TeamFlowApplication.java`：

```java
package com.teamflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 启动 Java 8 TeamFlow 请求体示例。
 */
@SpringBootApplication
public class TeamFlowApplication {
    /**
     * 启动 Java 8 Spring Boot Web 应用。
     *
     * @param args 启动参数
     */
    public static void main(String[] args) {
        SpringApplication.run(TeamFlowApplication.class, args);
    }
}
```

`src/main/java/com/teamflow/body/TaskRequest.java`：

```java
package com.teamflow.body;

/**
 * 表示 Java 8 兼容工程中的 JSON 任务请求。
 */
public final class TaskRequest {
    private String title;
    private int estimateHours;

    /**
     * 创建供消息转换器填充的空对象。
     */
    public TaskRequest() {
    }

    /**
     * 读取任务标题。
     *
     * @return 任务标题
     */
    public String getTitle() {
        return title;
    }

    /**
     * 写入任务标题。
     *
     * @param title 任务标题
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * 读取预计工时。
     *
     * @return 预计工时
     */
    public int getEstimateHours() {
        return estimateHours;
    }

    /**
     * 写入预计工时。
     *
     * @param estimateHours 预计工时
     */
    public void setEstimateHours(int estimateHours) {
        this.estimateHours = estimateHours;
    }
}
```

`src/main/java/com/teamflow/body/TaskRequestController.java`：

```java
package com.teamflow.body;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 展示 Java 8 兼容线的 JSON 请求体绑定。
 */
@RestController
@RequestMapping("/api/v1/tasks")
public final class TaskRequestController {
    /**
     * 读取 JSON 任务请求并返回便于观察的文本。
     *
     * @param request JSON 请求体
     * @return 请求体摘要
     */
    @PostMapping(
            path = "/preview",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String preview(@RequestBody TaskRequest request) {
        return "title=" + request.getTitle() + ",hours=" + request.getEstimateHours();
    }
}
```

### 3. 构建并复跑同一请求矩阵

把 IDEA 的 Project SDK、Module SDK 和 Maven Runner JRE 切换为 Java 8，Reload Maven 后在兼容工程目录执行：

```bash
java -version
mvn -version
mvn clean package
mvn spring-boot:run
```

应用启动后，逐条复跑现代工程的九个 curl 请求。两条版本线应分别得到：

```text
title=整理课程合同,hours=3
title=整理课程合同,hours=0
400
400
400
415
400
415
415
```

这不是把现代工程的 class 文件拿给 Java 8 运行，而是确认兼容 POM、兼容 JDK 和同一 JavaBean 源码共同形成
相同的 HTTP 合同。

## 八、集中排查常见请求体误用

:::pitfalls
### 把 JSON 字段当成 RequestParam

**触发条件：** 发送 `application/json` body，却在方法上使用 `@RequestParam(name = "title")` 读取字段。

**原因：** JSON body 由消息转换器处理，不会因为字段名相同就加入 Servlet request parameter 集合。

**后果：** `title` 仍被认为缺失；请求参数和请求体两条输入通道被混淆。

**错误示例：**

```java
/**
 * 错误地从请求参数读取 JSON 字段。
 *
 * @param title 任务标题
 * @return 标题文本
 */
@PostMapping(path = "/preview", consumes = MediaType.APPLICATION_JSON_VALUE)
public String preview(@RequestParam(name = "title") String title) {
    return "title=" + title;
}
```

**正确写法：**

```java
/**
 * 从 JSON 请求体读取任务。
 *
 * @param request JSON 任务请求
 * @return 标题文本
 */
@PostMapping(path = "/preview", consumes = MediaType.APPLICATION_JSON_VALUE)
public String preview(@RequestBody TaskRequest request) {
    return "title=" + request.getTitle();
}
```

**影响版本：** Spring Boot 4.1.0 与 2.3.12.RELEASE 都适用。

**验证方式：** 发送 `{"title":"整理课程合同"}`；错误版本仍缺少名为 title 的 request parameter，正确版本返回标题。

### 用 Accept 代替 Content-Type

**触发条件：** 发送 JSON body 时只设置 `Accept: application/json`，不设置 `Content-Type`。

**原因：** Accept 描述期望的响应媒体类型，Content-Type 才描述请求 body 的媒体类型。

**后果：** JSON 端点无法按声明选择请求体转换器，通常得到 415 或其他媒体类型匹配失败反馈。

**错误示例：**

```bash
curl --header 'Accept: application/json' \
  --header 'Content-Type:' \
  --data-binary '{"title":"整理课程合同","estimateHours":3}' \
  'http://localhost:8080/api/v1/tasks/preview'
```

**正确写法：**

```bash
curl --header 'Content-Type: application/json' \
  --header 'Accept: text/plain' \
  --data '{"title":"整理课程合同","estimateHours":3}' \
  'http://localhost:8080/api/v1/tasks/preview'
```

**影响版本：** HTTP 与 Spring MVC 两条课程基线都适用。

**验证方式：** 在同一个端点、同一个 body 下只替换请求头；正确请求返回文本摘要，错误请求不能把 JSON 可靠地交给转换器。

### 把字段缺失当成自动校验失败

**触发条件：** 发送 `{}` 后，代码或说明直接断言 Spring 会因为缺少 title 和 estimateHours 返回 400。

**原因：** 消息转换器只负责把可解析的 JSON 形状映射到 DTO；本课没有 `@Valid`、约束注解或业务校验器。

**后果：** 缺少字段可能得到 DTO 默认值，产品规则被错误地放在反序列化阶段解释。

**错误示例：**

```java
/**
 * 错误地把请求体绑定当成字段校验。
 *
 * @param request 请求体
 * @return 摘要
 */
@PostMapping(path = "/preview", consumes = MediaType.APPLICATION_JSON_VALUE)
public String preview(@RequestBody TaskRequest request) {
    if (request.getTitle() == null) {
        return "validation failed";
    }
    return "title=" + request.getTitle();
}
```

**正确写法：**

```java
/**
 * 只观察反序列化结果，不在本课提前实现校验。
 *
 * @param request 请求体
 * @return 摘要
 */
@PostMapping(path = "/preview", consumes = MediaType.APPLICATION_JSON_VALUE)
public String preview(@RequestBody TaskRequest request) {
    return "title=" + request.getTitle() + ",hours=" + request.getEstimateHours();
}
```

**影响版本：** Spring Framework 7.0.8 与 5.2.15.RELEASE 都适用。

**验证方式：** 发送 `{}`；本课参考工程返回 `title=null,hours=0`，字段非空和范围规则留给后续校验课程。

### 用字符串字段接收整数并期待业务类型自动出现

**触发条件：** DTO 把 `estimateHours` 声明成 `int`，请求却发送无法转换的字符串 `"three"`。

**原因：** JSON 字段类型与目标 Java 属性类型仍需兼容，消息转换器不会替业务猜测字符串含义。

**后果：** 转换在 Controller 调用前失败，默认结果是 400；方法体不会执行。

**错误示例：**

```json
{"title":"整理课程合同","estimateHours":"three"}
```

**正确写法：**

```json
{"title":"整理课程合同","estimateHours":3}
```

**影响版本：** 两条 Spring Boot 版本线均适用。

**验证方式：** 保持 URL 和 `Content-Type` 不变，只替换 `estimateHours` 的 JSON 值；数字请求返回 200，字符串请求返回 400。

### 以为错误 JSON 会得到 415

**触发条件：** `Content-Type` 已经是 `application/json`，但 JSON 少了闭合括号，说明却把结果写成 415。

**原因：** 415 针对不支持的媒体类型；这里媒体类型正确，失败发生在 JSON 文本解析阶段。

**后果：** 排错方向错误，可能去修改 consumes 或请求头，而没有检查 body 文本。

**错误示例：**

```json
{"title":"整理课程合同"
```

**正确写法：**

```json
{"title":"整理课程合同","estimateHours":3}
```

**影响版本：** Spring Framework 7.0.8 与 5.2.15.RELEASE 默认行为一致。

**验证方式：** 保持 `Content-Type: application/json` 不变；格式错误请求得到 400，正确 JSON 得到 200。
:::

## 九、独立练习

:::exercise
### 绑定 TeamFlow 项目 JSON 请求体

**要求：** 新建项目请求体 Controller，类级路径固定为 `/api/v1/projects`，POST `/preview` 只接收 JSON。
创建 `ProjectRequest` JavaBean，字段为 `name` 和 `memberCount`，返回 `name=...,members=...` 的可观察文本。
不得加入 `@Valid`、约束注解、统一响应、全局异常处理或数据库调用。必须分别提供 JDK 25 / Boot 4.1.0 和
Java 8 / Boot 2.3.12.RELEASE 工程。

**验收：** 合法 JSON、缺少字段、显式 null、缺少 body、格式错误 JSON、整数类型错误和错误 Content-Type 都
有可观察结果；两条版本线独立构建并得到相同文本和状态码。

**参考答案：** 现代和兼容工程的完整 POM、配置、启动类、DTO、Controller 与请求步骤见后文。先独立完成，
再按请求头、JSON 形状和默认状态码逐项对照。
:::

### 1. JDK 25 完整参考工程

练习工程目录为 `teamflow-project-body-jdk25`。完整 `pom.xml`：

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
    <artifactId>teamflow-project-body-jdk25</artifactId>
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
spring.application.name=teamflow-project-body-jdk25
server.port=8080
```

`src/main/java/com/teamflow/TeamFlowApplication.java`：

```java
package com.teamflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 启动 TeamFlow 项目请求体练习。
 */
@SpringBootApplication
public class TeamFlowApplication {
    /**
     * 启动现代版项目请求体应用。
     *
     * @param args 启动参数
     */
    public static void main(String[] args) {
        SpringApplication.run(TeamFlowApplication.class, args);
    }
}
```

`src/main/java/com/teamflow/body/ProjectRequest.java`：

```java
package com.teamflow.body;

/**
 * 表示项目预览请求体。
 */
public final class ProjectRequest {
    private String name;
    private int memberCount;

    /**
     * 创建供 JSON 转换器填充的空对象。
     */
    public ProjectRequest() {
    }

    /**
     * 读取项目名称。
     *
     * @return 项目名称
     */
    public String getName() {
        return name;
    }

    /**
     * 写入项目名称。
     *
     * @param name 项目名称
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * 读取成员数量。
     *
     * @return 成员数量
     */
    public int getMemberCount() {
        return memberCount;
    }

    /**
     * 写入成员数量。
     *
     * @param memberCount 成员数量
     */
    public void setMemberCount(int memberCount) {
        this.memberCount = memberCount;
    }
}
```

`src/main/java/com/teamflow/body/ProjectRequestController.java`：

```java
package com.teamflow.body;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 展示项目 JSON 请求体绑定。
 */
@RestController
@RequestMapping("/api/v1/projects")
public final class ProjectRequestController {
    /**
     * 读取项目 JSON 请求体。
     *
     * @param request 项目请求体
     * @return 项目摘要
     */
    @PostMapping(
            path = "/preview",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String preview(@RequestBody ProjectRequest request) {
        return "name=" + request.getName() + ",members=" + request.getMemberCount();
    }
}
```

构建并启动：

```bash
java -version
mvn -version
mvn clean package
mvn spring-boot:run
```

验证请求：

```bash
curl --silent --show-error --write-out '\n' \
  --header 'Content-Type: application/json' \
  --data '{"name":"迁移项目","memberCount":4}' \
  'http://localhost:8080/api/v1/projects/preview'
curl --silent --show-error --write-out '\n' \
  --header 'Content-Type: application/json' \
  --data '{}' \
  'http://localhost:8080/api/v1/projects/preview'
curl --silent --show-error --write-out '\n' \
  --header 'Content-Type: application/json' \
  --data '{"name":null,"memberCount":0}' \
  'http://localhost:8080/api/v1/projects/preview'
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  --header 'Content-Type: application/json' --data '' \
  'http://localhost:8080/api/v1/projects/preview'
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  --header 'Content-Type: application/json' --data '{"name":"迁移项目"' \
  'http://localhost:8080/api/v1/projects/preview'
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  --header 'Content-Type: application/json' --data '{"name":"迁移项目","memberCount":"many"}' \
  'http://localhost:8080/api/v1/projects/preview'
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'name=迁移项目' --data-urlencode 'memberCount=4' \
  'http://localhost:8080/api/v1/projects/preview'
```

预期输出：

```text
name=迁移项目,members=4
name=null,members=0
name=null,members=0
400
400
400
415
```

### 2. Java 8 完整参考工程

兼容练习工程目录为 `teamflow-project-body-java8`。完整 `pom.xml`：

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
    <artifactId>teamflow-project-body-java8</artifactId>
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
spring.application.name=teamflow-project-body-java8
server.port=8080
```

`src/main/java/com/teamflow/TeamFlowApplication.java`：

```java
package com.teamflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 启动 Java 8 TeamFlow 项目请求体练习。
 */
@SpringBootApplication
public class TeamFlowApplication {
    /**
     * 启动 Java 8 项目请求体应用。
     *
     * @param args 启动参数
     */
    public static void main(String[] args) {
        SpringApplication.run(TeamFlowApplication.class, args);
    }
}
```

`src/main/java/com/teamflow/body/ProjectRequest.java`：

```java
package com.teamflow.body;

/**
 * 表示 Java 8 兼容线的项目预览请求体。
 */
public final class ProjectRequest {
    private String name;
    private int memberCount;

    /**
     * 创建供 JSON 转换器填充的空对象。
     */
    public ProjectRequest() {
    }

    /**
     * 读取项目名称。
     *
     * @return 项目名称
     */
    public String getName() {
        return name;
    }

    /**
     * 写入项目名称。
     *
     * @param name 项目名称
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * 读取成员数量。
     *
     * @return 成员数量
     */
    public int getMemberCount() {
        return memberCount;
    }

    /**
     * 写入成员数量。
     *
     * @param memberCount 成员数量
     */
    public void setMemberCount(int memberCount) {
        this.memberCount = memberCount;
    }
}
```

`src/main/java/com/teamflow/body/ProjectRequestController.java`：

```java
package com.teamflow.body;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 展示 Java 8 兼容线的项目 JSON 请求体绑定。
 */
@RestController
@RequestMapping("/api/v1/projects")
public final class ProjectRequestController {
    /**
     * 读取项目 JSON 请求体。
     *
     * @param request 项目请求体
     * @return 项目摘要
     */
    @PostMapping(
            path = "/preview",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String preview(@RequestBody ProjectRequest request) {
        return "name=" + request.getName() + ",members=" + request.getMemberCount();
    }
}
```

在 Java 8 环境执行 `mvn clean package`、`mvn spring-boot:run`，再复跑现代练习工程的七个请求。预期文本和
状态码相同：

```text
name=迁移项目,members=4
name=null,members=0
name=null,members=0
400
400
400
415
```

## 十、本课小结

- PathVariable 读取 URI 模板变量，RequestParam 读取 query 或 URL 编码表单，RequestBody 读取 HTTP body。
- `@RequestBody` 通过 HttpMessageConverter 按 Content-Type 把请求体转换为目标 DTO；JSON 的字段名映射到 DTO 属性。
- `consumes` 参与媒体类型映射，Content-Type 描述发送的 body，Accept 描述期望的响应，不能互换。
- 有 body 但缺字段通常仍可完成形状绑定；缺少 body、损坏 JSON 或字段类型不匹配才会在转换阶段失败。
- 默认缺少请求体和不可读 JSON 通常是 400，不支持的媒体类型通常是 415；Controller 方法在这些失败阶段不会执行。
- 本课不负责 `@Valid`、字段约束、统一错误 JSON、全局异常处理和文件上传；这些能力留给后续课程。
- JavaBean DTO 能在 JDK 25 / Boot 4.1.0 与 Java 8 / Boot 2.3.12.RELEASE 两条线上复用，但两套工程必须独立验证。
