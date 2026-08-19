---
id: backend.java.learn.intermediate.request-validation
type: lesson
title: 参数校验
summary: 使用 Bean Validation 为请求 DTO 与查询参数声明输入约束，并准确区分绑定、校验和业务规则
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 190
prerequisites:
  - backend.java.learn.intermediate.response-and-status-codes
objectives:
  - 能说明 JSON 绑定、声明式参数校验与业务规则分别由哪一层负责。
  - 能为现代与 Java 8 工程显式添加 validation starter，并选择正确命名空间。
  - 能准确使用 NotNull、NotBlank、Size、Min、Max 与 Email，并解释它们的 null 语义。
  - 能用 Valid RequestBody 触发 DTO 校验，并观察默认 400 与异常类型。
  - 能使用 Valid 级联校验嵌套对象，并使用容器元素约束校验列表成员。
  - 能在现代 Controller 中使用 MVC 内建方法校验约束查询参数。
  - 能说明 Spring 5.2 的类型级 Validated AOP 路径及其默认状态差异。
  - 能用真实 HTTP 请求分别验证合法输入、绑定失败和约束失败。
recap:
  - RequestBody 先由 HttpMessageConverter 把 JSON 读成 Java DTO，随后才可能执行 Bean Validation。
  - 损坏 JSON 与字段类型不匹配属于绑定失败，不是约束违反。
  - NotNull 和 NotBlank 会拒绝 null，Size、Min、Max 与 Email 单独使用时允许 null。
  - Valid 负责递归校验，不负责要求嵌套对象必须存在。
  - 容器大小约束与容器元素约束是两个独立合同。
  - Spring 6.1 及以上的 Controller 直接参数约束使用 MVC 内建方法校验，不需要类型级 Validated。
  - Spring 5.2 的直接参数约束依赖类型级 Validated 和 AOP，默认不会自动映射成 400。
  - 数据库唯一性、权限和资源状态属于业务规则，不应伪装成 DTO 格式约束。
related:
  - backend.java.learn.intermediate.request-parameters-and-type-conversion
  - backend.java.learn.intermediate.request-body-and-json-binding
  - backend.java.learn.intermediate.response-and-status-codes
tags:
  - Java
  - Spring Boot
  - Spring MVC
  - Bean Validation
  - 参数校验
  - RequestBody
  - Valid
  - Validated
appliesTo: JDK 25 / Spring Boot 4.1.0 / Jakarta Validation 3.1 主线；Java 8 / Spring Boot 2.3.12.RELEASE / Bean Validation 2.0 兼容线
verifiedAt: 2026-08-19
sources:
  - id: spring-boot-41-system-requirements-validation
    title: Spring Boot System Requirements
    url: https://docs.spring.io/spring-boot/system-requirements.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Spring Boot 4.1.0 支持 JDK 25，并要求 Spring Framework 7.0.8 或以上版本。
  - id: spring-boot-41-build-systems-validation
    title: Spring Boot 4.1 Build Systems
    url: https://docs.spring.io/spring-boot/4.1/reference/using/build-systems.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - 现代工程分别使用 spring-boot-starter-webmvc 与 spring-boot-starter-validation。
  - id: spring-boot-41-method-validation
    title: Spring Boot Validation
    url: https://docs.spring.io/spring-boot/4.1/reference/io/validation.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - 普通 Spring Bean 的方法校验依赖 provider 和类型级 Validated。
  - id: spring-mvc-validation-708
    title: Spring MVC Validation
    url: https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-controller/ann-validation.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - MVC 区分单参数对象校验与 Controller 方法校验。
      - Spring 6.1 及以上使用内建方法校验时应移除 Controller 类型级 Validated。
      - Valid 本身不是约束，异常类型取决于完整方法签名。
  - id: spring-request-body-validation-708
    title: Spring MVC RequestBody
    url: https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-controller/ann-methods/requestbody.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - Valid 或参数级 Validated 可以触发 RequestBody DTO 校验。
      - 对象级校验失败默认抛出 MethodArgumentNotValidException 并转为 400。
  - id: spring-method-argument-not-valid-708
    title: MethodArgumentNotValidException API - Spring Framework 7.0.8
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/bind/MethodArgumentNotValidException.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 单个 Controller 对象参数校验失败使用 MethodArgumentNotValidException 表达。
  - id: spring-handler-method-validation-708
    title: HandlerMethodValidationException API - Spring Framework 7.0.8
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/method/annotation/HandlerMethodValidationException.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - Controller 输入方法校验失败状态为 400，返回值校验失败状态为 500。
      - HandlerMethodValidationException 自 Spring Framework 6.1 提供。
  - id: jakarta-validation-31-spec-request
    title: Jakarta Validation 3.1 Specification
    url: https://jakarta.ee/specifications/bean-validation/3.1/jakarta-validation-spec-3.1.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Jakarta Validation 3.1
    claims:
      - 定义标准约束、级联校验、容器元素约束和方法校验合同。
  - id: jakarta-validation-31-constraints-request
    title: Jakarta Validation 3.1 Constraints API
    url: https://jakarta.ee/specifications/bean-validation/3.1/apidocs/jakarta/validation/constraints/package-summary
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Jakarta Validation 3.1
    claims:
      - 定义 NotNull、NotBlank、Size、Min、Max 与 Email 的适用类型和 null 语义。
  - id: bean-validation-20-spec-request
    title: Bean Validation 2.0 Specification
    url: https://beanvalidation.org/2.0/spec/
    sourceOrigin: official
    sourceType: specification
    appliesTo: Bean Validation 2.0 / javax.validation
    claims:
      - Java 8 兼容线支持标准约束、级联校验和容器元素约束。
  - id: spring-boot-2312-system-validation
    title: Spring Boot 2.3.12.RELEASE Getting Started
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Java 8 / Spring Boot 2.3.12.RELEASE
    claims:
      - Java 8 兼容线使用 Spring Framework 5.2.15.RELEASE。
  - id: spring-boot-23-validation-starter-release
    title: Spring Boot 2.3 Release Notes
    url: https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.3-Release-Notes
    sourceOrigin: official
    sourceType: release-note
    appliesTo: Spring Boot 2.3
    claims:
      - Spring Boot 2.3 起 Web 与 WebFlux starter 不再传递引入 validation starter。
  - id: spring-request-body-validation-5215
    title: Spring Framework 5.2 RequestBody Validation
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/web.html#mvc-ann-requestbody
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - javax.validation.Valid 可以触发旧线 RequestBody DTO 校验并默认返回 400。
  - id: spring-validated-5215-request
    title: Validated API - Spring Framework 5.2.15.RELEASE
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/validation/annotation/Validated.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 类型级 Validated 是旧线 AOP 方法校验的 pointcut。
  - id: spring-method-validation-post-processor-5215-request
    title: MethodValidationPostProcessor API - Spring Framework 5.2.15.RELEASE
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/validation/beanvalidation/MethodValidationPostProcessor.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 旧线通过 AOP 代理校验类型级 Validated Bean 的方法参数。
  - id: spring-method-validation-interceptor-5215-source
    title: MethodValidationInterceptor Source - Spring Framework 5.2.15.RELEASE
    url: https://raw.githubusercontent.com/spring-projects/spring-framework/v5.2.15.RELEASE/spring-context/src/main/java/org/springframework/validation/beanvalidation/MethodValidationInterceptor.java
    sourceOrigin: official
    sourceType: source-code
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 旧 AOP 方法约束失败直接抛出 javax.validation.ConstraintViolationException。
  - id: spring-default-handler-exception-resolver-5215-validation
    title: DefaultHandlerExceptionResolver API - Spring Framework 5.2.15.RELEASE
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/servlet/mvc/support/DefaultHandlerExceptionResolver.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 旧 MVC 默认把 MethodArgumentNotValidException 映射为 400。
      - 默认异常映射列表不包含 ConstraintViolationException。
---

# 参数校验

上一课已经把响应拆成 body、status 和 headers；再往前一课已经证明 JSON 能被读取成 Java DTO。可是“成功
生成 DTO”只说明请求形状能够绑定，不代表标题不是空白、年龄落在允许范围内，或者嵌套地址填写完整。

本课给 TeamFlow 增加一层声明式输入约束。`POST` endpoint 校验请求体 DTO，`GET` endpoint 校验分页 query。
合法输入进入 Controller，约束失败在方法执行前被拦截。我们只观察框架默认状态，不设计统一响应、不编写
全局异常处理，也不把数据库唯一性等业务规则伪装成注解。

## 一、先把三种失败分开

### 1. JSON 绑定先于参数校验

`@RequestBody` 的第一步仍然是消息转换。Spring MVC 根据 `Content-Type` 选择
`HttpMessageConverter`，把请求体字节转换成目标 DTO：

```text
HTTP JSON 字节
  -> HttpMessageConverter 读取并绑定
  -> 得到 CreateMemberRequest
  -> Bean Validation 检查约束
  -> Controller 方法体
```

JSON 少了右花括号，或者 `age` 收到一个 JSON 对象而目标类型是 `Integer`，都会在 DTO 可用前失败。此时
通常是 `HttpMessageNotReadableException -> 400`，还没有执行 `@Min`、`@Email` 等约束。

### 2. 声明式约束检查已经绑定的值

Bean Validation 只检查 Java 值是否符合声明合同：

```java
@NotBlank
@Size(max = 40)
private String displayName;
```

这两个注解表达“名称不能为 null、空串或纯空白，并且长度最多 40”。它们不解析 JSON，也不负责决定当前
调用者能否创建成员。

### 3. 业务规则仍然属于后续服务边界

下面这些问题不能仅凭 DTO 当前字段得出结论：

- 邮箱是否已经被其他成员使用；
- 团队是否存在并允许继续邀请；
- 当前调用者是否有管理员权限；
- 成员状态是否允许改变。

这些规则依赖数据库、权限或当前业务状态，应由业务层处理。`@Email` 只能检查字符串格式，不证明邮箱真实、
可投递或尚未注册。本课也不为业务失败冻结 HTTP 状态或错误 JSON。

## 二、显式加入校验能力

### 1. Validation API 与 provider 各有职责

`jakarta.validation` 或 `javax.validation` 提供标准注解和接口；Hibernate Validator 等 provider 执行这些
合同。只有注解 API 而没有 provider 时，源码可能能够编译，运行时却没有真正的校验实现。

Spring Boot starter 同时带入常用 provider，并把 Validator 接入 Spring MVC：

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

现代 `spring-boot-starter-webmvc` 和 Java 8 线的 `spring-boot-starter-web` 都不能替代这项显式依赖。
尤其从 Boot 2.3 开始，Web starter 已不再传递引入 validation starter。

### 2. 两条版本线使用不同包名

现代主线使用 Jakarta 命名空间：

```java
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
```

Java 8 / Boot 2.3 兼容线使用 `javax` 命名空间：

```java
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
```

依赖 artifactId 都是 `spring-boot-starter-validation`，但源码 import 不能混用。为了只观察框架版本差异，
两套工程都使用普通 JavaBean DTO。

### 3. 用非法请求确认入口确实触发

只看到注解出现在源码中不算验证成功。至少要发送一次空白名称，确认响应为 400 且 Controller 没有返回
成功对象。后面的完整工程会同时验证合法 body、非法 body、合法 query、非法 query 和绑定失败。

## 三、准确选择六个核心约束

### 1. NotNull 与 NotBlank 负责存在性

`@NotNull` 接受任意引用类型，只拒绝 `null`。它不拒绝空字符串、空列表或数值 0：

```java
@NotNull
private Integer age;
```

`@NotBlank` 只适用于 `CharSequence`，会拒绝 `null`、空串和纯空白：

```java
@NotBlank
private String displayName;
```

必填文本通常直接选择 `@NotBlank`，不需要再叠加 `@NotNull`。原始类型 `int` 不可能是 `null`，在它上面
添加 `@NotNull` 没有意义。DTO 若要区分“没有提交年龄”和“提交 0”，应使用 `Integer`。

### 2. Size 与 Email 不会自动表达必填

`@Size` 可以检查字符序列、集合、Map 或数组的大小，边界包含在内：

```java
@NotBlank
@Size(max = 40)
private String displayName;
```

单独 `@Size(max = 40)` 会把 `null` 视为合法，因此必填文本还需要 `@NotBlank`。`@Size` 也不会 trim；一个
空格的长度仍然是 1。

`@Email` 对 `null` 同样视为合法，且“格式良好”的精确定义由 provider 决定。必填邮箱组合两个职责：

```java
@NotBlank
@Email
private String email;
```

### 3. Min 与 Max 组成包含边界的数值区间

年龄可以用闭区间表达：

```java
@NotNull
@Min(18)
@Max(120)
private Integer age;
```

`@Min(18)` 接受 18，`@Max(120)` 接受 120。它们单独使用时都允许 `null`，所以必填包装类型还要添加
`@NotNull`。规范没有把 `float` 和 `double` 列为 `@Min` / `@Max` 的标准支持类型，精确小数合同应选择
`BigDecimal` 和对应十进制约束；这不是本课主线。

### 4. 用一张表记住 null 合同

| 约束 | `null` 是否通过 | 主要职责 |
| --- | --- | --- |
| `@NotNull` | 否 | 值必须存在 |
| `@NotBlank` | 否 | 文本必须存在且至少包含一个非空白字符 |
| `@Size` | 是 | 限制字符序列或容器大小 |
| `@Min` | 是 | 限制数值下界 |
| `@Max` | 是 | 限制数值上界 |
| `@Email` | 是 | 检查非 null 文本的邮箱格式 |

组合注解不是为了“多写一些”，而是因为存在性、长度、范围和格式本来就是不同合同。

## 四、校验 RequestBody 对象图

### 1. 在入口使用 Valid 触发 DTO 校验

DTO 字段有约束并不代表每次创建对象都会自动校验。Spring MVC 需要在入口参数看到 `@Valid` 或参数级
`@Validated`：

```java
/**
 * 预览通过校验的成员输入。
 *
 * @param request 成员创建输入
 * @return 成员预览
 */
@PostMapping("/members")
public ResponseEntity<MemberPreview> previewMember(
        @Valid @RequestBody CreateMemberRequest request) {
    return ResponseEntity.ok(MemberPreview.from(request));
}
```

本课不使用验证组，因此选择标准 `@Valid`。当这个方法没有其他直接方法参数约束时，DTO 约束失败通常产生
`MethodArgumentNotValidException`，Spring MVC 默认返回 400，方法体不会执行。

### 2. 嵌套对象需要在关联位置启用级联

地址类型内部可以声明自己的约束：

```java
public final class AddressRequest {
    @NotBlank
    @Size(max = 60)
    private String city;
}
```

外层必须在 `address` 关联位置添加 `@Valid`，Validator 才会继续检查 `city`：

```java
@NotNull
@Valid
private AddressRequest address;
```

两项注解不能互相替代。`@NotNull` 表示地址对象必须存在；`@Valid` 表示对象存在时递归校验内部字段。
只有 `@Valid` 时，`address = null` 会跳过级联并视为合法。

### 3. 容器大小与元素内容分别声明

标签列表需要两个层次的约束：

```java
@NotNull
@Size(max = 5)
private List<@NotBlank String> tags;
```

字段上的 `@Size` 限制最多 5 个元素，类型参数上的 `@NotBlank` 检查每个标签。Bean Validation 2.0 已支持
容器元素约束，所以这段能力在现代 Jakarta 3.1 与 Java 8 `javax.validation` 2.0 两条线都存在。

## 五、校验查询参数

### 1. 现代 Controller 使用 MVC 内建方法校验

Spring Framework 6.1 及以上会检查 Controller 方法参数上直接声明的 constraint：

```java
/**
 * 返回通过校验的分页参数。
 *
 * @param page 页码，从 0 开始
 * @param size 每页数量
 * @return 分页参数预览
 */
@GetMapping("/members")
public ResponseEntity<QueryPreview> queryMembers(
        @RequestParam @Min(0) int page,
        @RequestParam @Min(1) @Max(100) int size) {
    return ResponseEntity.ok(new QueryPreview(page, size));
}
```

现代 Controller 不添加类型级 `@Validated`。直接的 `@Min` / `@Max` 会触发 MVC 内建方法校验，输入失败
产生 `HandlerMethodValidationException`，状态为 400。

### 2. Valid 本身不是直接约束

`@Valid` 的职责是进入对象内部，它不是带 `@Constraint` 的约束注解。把它放到一个 `int page` 上不会表达
“页码至少为 0”。标量 query 必须直接使用 `@Min`、`@Max` 等实际约束。

### 3. 异常类型取决于完整方法签名

如果同一个 handler 同时有 `@Valid @RequestBody` 和另一个直接带 `@Min` 的参数，MVC 方法校验会覆盖单参数
对象校验，嵌套 DTO 错误也可能汇入 `HandlerMethodValidationException`。因此不能绝对写成“所有
RequestBody 校验失败都是 `MethodArgumentNotValidException`”。

本课把 body 与 query 放在两个 endpoint 中，让两个触发路径可以分别观察。

### 4. 类型转换失败仍然早于约束校验

`page=abc` 无法转换为 `int`，失败发生在参数绑定和类型转换阶段；`@Min(0)` 还没有拿到可检查的整数。它与
`page=-1` 的约束失败都可能返回 400，但原因和异常类型不同。

## 六、JDK 25 完整 TeamFlow 校验工程

### 1. 创建独立 Maven 工程

创建 `teamflow-request-validation-modern`，使用下面的 `pom.xml`：

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
  <artifactId>teamflow-request-validation-modern</artifactId>
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

工程包含所有运行文件：

```text
teamflow-request-validation-modern/
├── pom.xml
└── src/main/
    ├── java/com/teamflow/validation/
    │   ├── ValidationApplication.java
    │   ├── AddressRequest.java
    │   ├── CreateMemberRequest.java
    │   ├── MemberPreview.java
    │   ├── QueryPreview.java
    │   └── ValidationController.java
    └── resources/application.properties
```

### 2. 编写启动类和配置

`src/main/java/com/teamflow/validation/ValidationApplication.java`：

```java
package com.teamflow.validation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ValidationApplication {

    /**
     * 启动 TeamFlow 参数校验示例。
     *
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        SpringApplication.run(ValidationApplication.class, args);
    }
}
```

`src/main/resources/application.properties`：

```properties
spring.application.name=teamflow-request-validation-modern
```

### 3. 定义嵌套地址 DTO

`src/main/java/com/teamflow/validation/AddressRequest.java`：

```java
package com.teamflow.validation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AddressRequest {

    @NotBlank(message = "城市不能为空")
    @Size(max = 60, message = "城市名称最多 60 个字符")
    private String city;

    @NotBlank(message = "详细地址不能为空")
    @Size(max = 100, message = "详细地址最多 100 个字符")
    private String line1;

    /**
     * 创建供 JSON 绑定使用的空地址对象。
     */
    public AddressRequest() {
    }

    /**
     * 返回城市名称。
     *
     * @return 城市名称
     */
    public String getCity() {
        return city;
    }

    /**
     * 设置城市名称。
     *
     * @param city 城市名称
     */
    public void setCity(String city) {
        this.city = city;
    }

    /**
     * 返回详细地址。
     *
     * @return 详细地址
     */
    public String getLine1() {
        return line1;
    }

    /**
     * 设置详细地址。
     *
     * @param line1 详细地址
     */
    public void setLine1(String line1) {
        this.line1 = line1;
    }
}
```

### 4. 定义成员请求 DTO

`src/main/java/com/teamflow/validation/CreateMemberRequest.java`：

```java
package com.teamflow.validation;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public final class CreateMemberRequest {

    @NotBlank(message = "成员名称不能为空")
    @Size(max = 40, message = "成员名称最多 40 个字符")
    private String displayName;

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;

    @NotNull(message = "年龄不能为空")
    @Min(value = 18, message = "年龄不能小于 18")
    @Max(value = 120, message = "年龄不能大于 120")
    private Integer age;

    @NotNull(message = "地址不能为空")
    @Valid
    private AddressRequest address;

    @NotNull(message = "标签列表不能为空")
    @Size(max = 5, message = "标签最多 5 个")
    private List<@NotBlank(message = "标签不能为空白") String> tags;

    /**
     * 创建供 JSON 绑定使用的空成员请求。
     */
    public CreateMemberRequest() {
    }

    /**
     * 返回成员显示名称。
     *
     * @return 成员显示名称
     */
    public String getDisplayName() {
        return displayName;
    }

    /**
     * 设置成员显示名称。
     *
     * @param displayName 成员显示名称
     */
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    /**
     * 返回成员邮箱。
     *
     * @return 成员邮箱
     */
    public String getEmail() {
        return email;
    }

    /**
     * 设置成员邮箱。
     *
     * @param email 成员邮箱
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * 返回成员年龄。
     *
     * @return 成员年龄
     */
    public Integer getAge() {
        return age;
    }

    /**
     * 设置成员年龄。
     *
     * @param age 成员年龄
     */
    public void setAge(Integer age) {
        this.age = age;
    }

    /**
     * 返回成员地址。
     *
     * @return 成员地址
     */
    public AddressRequest getAddress() {
        return address;
    }

    /**
     * 设置成员地址。
     *
     * @param address 成员地址
     */
    public void setAddress(AddressRequest address) {
        this.address = address;
    }

    /**
     * 返回成员标签。
     *
     * @return 成员标签
     */
    public List<String> getTags() {
        return tags;
    }

    /**
     * 设置成员标签。
     *
     * @param tags 成员标签
     */
    public void setTags(List<String> tags) {
        this.tags = tags;
    }
}
```

### 5. 定义两个成功响应对象

`src/main/java/com/teamflow/validation/MemberPreview.java`：

```java
package com.teamflow.validation;

import java.util.ArrayList;
import java.util.List;

public final class MemberPreview {

    private final String displayName;
    private final String email;
    private final Integer age;
    private final String city;
    private final List<String> tags;

    /**
     * 创建成员输入预览。
     *
     * @param displayName 成员显示名称
     * @param email 成员邮箱
     * @param age 成员年龄
     * @param city 城市名称
     * @param tags 成员标签
     */
    public MemberPreview(
            String displayName,
            String email,
            Integer age,
            String city,
            List<String> tags) {
        this.displayName = displayName;
        this.email = email;
        this.age = age;
        this.city = city;
        this.tags = new ArrayList<>(tags);
    }

    /**
     * 从已经通过校验的请求创建预览。
     *
     * @param request 已通过校验的成员请求
     * @return 成员输入预览
     */
    public static MemberPreview from(CreateMemberRequest request) {
        return new MemberPreview(
                request.getDisplayName(),
                request.getEmail(),
                request.getAge(),
                request.getAddress().getCity(),
                request.getTags());
    }

    /**
     * 返回成员显示名称。
     *
     * @return 成员显示名称
     */
    public String getDisplayName() {
        return displayName;
    }

    /**
     * 返回成员邮箱。
     *
     * @return 成员邮箱
     */
    public String getEmail() {
        return email;
    }

    /**
     * 返回成员年龄。
     *
     * @return 成员年龄
     */
    public Integer getAge() {
        return age;
    }

    /**
     * 返回成员城市。
     *
     * @return 成员城市
     */
    public String getCity() {
        return city;
    }

    /**
     * 返回成员标签副本。
     *
     * @return 成员标签副本
     */
    public List<String> getTags() {
        return new ArrayList<>(tags);
    }
}
```

`src/main/java/com/teamflow/validation/QueryPreview.java`：

```java
package com.teamflow.validation;

public final class QueryPreview {

    private final int page;
    private final int size;

    /**
     * 创建分页参数预览。
     *
     * @param page 页码
     * @param size 每页数量
     */
    public QueryPreview(int page, int size) {
        this.page = page;
        this.size = size;
    }

    /**
     * 返回页码。
     *
     * @return 页码
     */
    public int getPage() {
        return page;
    }

    /**
     * 返回每页数量。
     *
     * @return 每页数量
     */
    public int getSize() {
        return size;
    }
}
```

### 6. 编写 body 与 query 两个 endpoint

`src/main/java/com/teamflow/validation/ValidationController.java`：

```java
package com.teamflow.validation;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/validation")
public class ValidationController {

    /**
     * 预览通过校验的成员输入。
     *
     * @param request 成员创建输入
     * @return 成员预览
     */
    @PostMapping(
            value = "/members",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<MemberPreview> previewMember(
            @Valid @RequestBody CreateMemberRequest request) {
        return ResponseEntity.ok(MemberPreview.from(request));
    }

    /**
     * 返回通过校验的分页参数。
     *
     * @param page 页码，从 0 开始
     * @param size 每页数量
     * @return 分页参数预览
     */
    @GetMapping(value = "/members", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<QueryPreview> queryMembers(
            @RequestParam @Min(value = 0, message = "页码不能小于 0") int page,
            @RequestParam
                    @Min(value = 1, message = "每页数量不能小于 1")
                    @Max(value = 100, message = "每页数量不能大于 100")
                    int size) {
        return ResponseEntity.ok(new QueryPreview(page, size));
    }
}
```

注意 Controller 类上没有 `@Validated`。这是现代 MVC 内建方法校验的正确入口。

### 7. 构建、启动并观察状态

在工程根目录执行：

```bash
mvn clean package
java -jar target/teamflow-request-validation-modern-1.0.0.jar
```

另开终端发送合法 body：

```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST 'http://localhost:8080/api/v1/validation/members' \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"林澄","email":"lin@example.com","age":28,"address":{"city":"杭州","line1":"文一西路 1 号"},"tags":["Java","API"]}'
```

依次验证空白名称、嵌套城市和容器元素：

```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST 'http://localhost:8080/api/v1/validation/members' \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"   ","email":"lin@example.com","age":28,"address":{"city":"杭州","line1":"文一西路 1 号"},"tags":["Java"]}'

curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST 'http://localhost:8080/api/v1/validation/members' \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"林澄","email":"lin@example.com","age":28,"address":{"city":" ","line1":"文一西路 1 号"},"tags":["Java"]}'

curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST 'http://localhost:8080/api/v1/validation/members' \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"林澄","email":"lin@example.com","age":28,"address":{"city":"杭州","line1":"文一西路 1 号"},"tags":["Java"," "]}'
```

再验证 query 和绑定失败：

```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  'http://localhost:8080/api/v1/validation/members?page=0&size=20'

curl -s -o /dev/null -w '%{http_code}\n' \
  'http://localhost:8080/api/v1/validation/members?page=-1&size=20'

curl -s -o /dev/null -w '%{http_code}\n' \
  'http://localhost:8080/api/v1/validation/members?page=abc&size=20'

curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST 'http://localhost:8080/api/v1/validation/members' \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"林澄","email":"lin@example.com","age":{},"address":{"city":"杭州","line1":"文一西路 1 号"},"tags":["Java"]}'
```

按顺序应观察到：

```text
200  合法 body，Controller 返回成员预览
400  displayName 违反 NotBlank
400  address.city 通过 Valid 级联后违反 NotBlank
400  tags[1] 违反容器元素 NotBlank
200  合法 query，Controller 返回分页预览
400  page=-1 触发 HandlerMethodValidationException
400  page=abc 在类型转换阶段失败，不是 Min 失败
400  age={} 在 JSON 绑定阶段失败，不是 Min 或 Max 失败
```

本课只断言状态与失败阶段，不冻结 Spring Boot 默认错误 JSON 的字段。统一响应和异常转换分别留给后续课程。

## 七、Java 8 完整兼容工程

### 1. 使用独立 POM 和端口

创建 `teamflow-request-validation-legacy`，使用 Java 8 与 Boot 2.3.12.RELEASE：

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
  <artifactId>teamflow-request-validation-legacy</artifactId>
  <version>1.0.0</version>

  <properties>
    <java.version>8</java.version>
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

完整文件树与现代工程一致：

```text
teamflow-request-validation-legacy/
├── pom.xml
└── src/main/
    ├── java/com/teamflow/validation/
    │   ├── ValidationApplication.java
    │   ├── AddressRequest.java
    │   ├── CreateMemberRequest.java
    │   ├── MemberPreview.java
    │   ├── QueryPreview.java
    │   └── ValidationController.java
    └── resources/application.properties
```

### 2. 编写启动类和配置

`src/main/java/com/teamflow/validation/ValidationApplication.java`：

```java
package com.teamflow.validation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ValidationApplication {

    /**
     * 启动 Java 8 参数校验示例。
     *
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        SpringApplication.run(ValidationApplication.class, args);
    }
}
```

`src/main/resources/application.properties` 使用 8081，方便与现代工程并排观察：

```properties
spring.application.name=teamflow-request-validation-legacy
server.port=8081
```

### 3. 使用 javax 定义嵌套地址 DTO

`src/main/java/com/teamflow/validation/AddressRequest.java`：

```java
package com.teamflow.validation;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public final class AddressRequest {

    @NotBlank(message = "城市不能为空")
    @Size(max = 60, message = "城市名称最多 60 个字符")
    private String city;

    @NotBlank(message = "详细地址不能为空")
    @Size(max = 100, message = "详细地址最多 100 个字符")
    private String line1;

    /**
     * 创建供 JSON 绑定使用的空地址对象。
     */
    public AddressRequest() {
    }

    /**
     * 返回城市名称。
     *
     * @return 城市名称
     */
    public String getCity() {
        return city;
    }

    /**
     * 设置城市名称。
     *
     * @param city 城市名称
     */
    public void setCity(String city) {
        this.city = city;
    }

    /**
     * 返回详细地址。
     *
     * @return 详细地址
     */
    public String getLine1() {
        return line1;
    }

    /**
     * 设置详细地址。
     *
     * @param line1 详细地址
     */
    public void setLine1(String line1) {
        this.line1 = line1;
    }
}
```

### 4. 使用 javax 定义成员请求 DTO

`src/main/java/com/teamflow/validation/CreateMemberRequest.java`：

```java
package com.teamflow.validation;

import java.util.List;
import javax.validation.Valid;
import javax.validation.constraints.Email;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

public final class CreateMemberRequest {

    @NotBlank(message = "成员名称不能为空")
    @Size(max = 40, message = "成员名称最多 40 个字符")
    private String displayName;

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;

    @NotNull(message = "年龄不能为空")
    @Min(value = 18, message = "年龄不能小于 18")
    @Max(value = 120, message = "年龄不能大于 120")
    private Integer age;

    @NotNull(message = "地址不能为空")
    @Valid
    private AddressRequest address;

    @NotNull(message = "标签列表不能为空")
    @Size(max = 5, message = "标签最多 5 个")
    private List<@NotBlank(message = "标签不能为空白") String> tags;

    /**
     * 创建供 JSON 绑定使用的空成员请求。
     */
    public CreateMemberRequest() {
    }

    /**
     * 返回成员显示名称。
     *
     * @return 成员显示名称
     */
    public String getDisplayName() {
        return displayName;
    }

    /**
     * 设置成员显示名称。
     *
     * @param displayName 成员显示名称
     */
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    /**
     * 返回成员邮箱。
     *
     * @return 成员邮箱
     */
    public String getEmail() {
        return email;
    }

    /**
     * 设置成员邮箱。
     *
     * @param email 成员邮箱
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * 返回成员年龄。
     *
     * @return 成员年龄
     */
    public Integer getAge() {
        return age;
    }

    /**
     * 设置成员年龄。
     *
     * @param age 成员年龄
     */
    public void setAge(Integer age) {
        this.age = age;
    }

    /**
     * 返回成员地址。
     *
     * @return 成员地址
     */
    public AddressRequest getAddress() {
        return address;
    }

    /**
     * 设置成员地址。
     *
     * @param address 成员地址
     */
    public void setAddress(AddressRequest address) {
        this.address = address;
    }

    /**
     * 返回成员标签。
     *
     * @return 成员标签
     */
    public List<String> getTags() {
        return tags;
    }

    /**
     * 设置成员标签。
     *
     * @param tags 成员标签
     */
    public void setTags(List<String> tags) {
        this.tags = tags;
    }
}
```

### 5. 定义 Java 8 成功响应对象

`src/main/java/com/teamflow/validation/MemberPreview.java`：

```java
package com.teamflow.validation;

import java.util.ArrayList;
import java.util.List;

public final class MemberPreview {

    private final String displayName;
    private final String email;
    private final Integer age;
    private final String city;
    private final List<String> tags;

    /**
     * 创建成员输入预览。
     *
     * @param displayName 成员显示名称
     * @param email 成员邮箱
     * @param age 成员年龄
     * @param city 城市名称
     * @param tags 成员标签
     */
    public MemberPreview(
            String displayName,
            String email,
            Integer age,
            String city,
            List<String> tags) {
        this.displayName = displayName;
        this.email = email;
        this.age = age;
        this.city = city;
        this.tags = new ArrayList<>(tags);
    }

    /**
     * 从已经通过校验的请求创建预览。
     *
     * @param request 已通过校验的成员请求
     * @return 成员输入预览
     */
    public static MemberPreview from(CreateMemberRequest request) {
        return new MemberPreview(
                request.getDisplayName(),
                request.getEmail(),
                request.getAge(),
                request.getAddress().getCity(),
                request.getTags());
    }

    /**
     * 返回成员显示名称。
     *
     * @return 成员显示名称
     */
    public String getDisplayName() {
        return displayName;
    }

    /**
     * 返回成员邮箱。
     *
     * @return 成员邮箱
     */
    public String getEmail() {
        return email;
    }

    /**
     * 返回成员年龄。
     *
     * @return 成员年龄
     */
    public Integer getAge() {
        return age;
    }

    /**
     * 返回成员城市。
     *
     * @return 成员城市
     */
    public String getCity() {
        return city;
    }

    /**
     * 返回成员标签副本。
     *
     * @return 成员标签副本
     */
    public List<String> getTags() {
        return new ArrayList<>(tags);
    }
}
```

`src/main/java/com/teamflow/validation/QueryPreview.java`：

```java
package com.teamflow.validation;

public final class QueryPreview {

    private final int page;
    private final int size;

    /**
     * 创建分页参数预览。
     *
     * @param page 页码
     * @param size 每页数量
     */
    public QueryPreview(int page, int size) {
        this.page = page;
        this.size = size;
    }

    /**
     * 返回页码。
     *
     * @return 页码
     */
    public int getPage() {
        return page;
    }

    /**
     * 返回每页数量。
     *
     * @return 每页数量
     */
    public int getSize() {
        return size;
    }
}
```

### 6. 用类型级 Validated 启用旧 AOP 路径

`src/main/java/com/teamflow/validation/ValidationController.java`：

```java
package com.teamflow.validation;

import javax.validation.Valid;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/validation")
public class ValidationController {

    /**
     * 预览通过校验的成员输入。
     *
     * @param request 成员创建输入
     * @return 成员预览
     */
    @PostMapping(
            value = "/members",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<MemberPreview> previewMember(
            @Valid @RequestBody CreateMemberRequest request) {
        return ResponseEntity.ok(MemberPreview.from(request));
    }

    /**
     * 返回通过校验的分页参数。
     *
     * @param page 页码，从 0 开始
     * @param size 每页数量
     * @return 分页参数预览
     */
    @GetMapping(value = "/members", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<QueryPreview> queryMembers(
            @RequestParam @Min(value = 0, message = "页码不能小于 0") int page,
            @RequestParam
                    @Min(value = 1, message = "每页数量不能小于 1")
                    @Max(value = 100, message = "每页数量不能大于 100")
                    int size) {
        return ResponseEntity.ok(new QueryPreview(page, size));
    }
}
```

旧线的 `@Validated` 来自 Spring，不是 `javax.validation`。它把 Controller 变成 AOP 方法校验目标。直接 query
约束失败时，Framework 5.2 的拦截器抛出 `javax.validation.ConstraintViolationException`。

### 7. 构建并观察兼容差异

使用 Java 8 构建并启动：

```bash
mvn clean package
java -jar target/teamflow-request-validation-legacy-1.0.0.jar
```

发送同一组关键请求：

```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST 'http://localhost:8081/api/v1/validation/members' \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"林澄","email":"lin@example.com","age":28,"address":{"city":"杭州","line1":"文一西路 1 号"},"tags":["Java","API"]}'

curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST 'http://localhost:8081/api/v1/validation/members' \
  -H 'Content-Type: application/json' \
  -d '{"displayName":" ","email":"lin@example.com","age":28,"address":{"city":"杭州","line1":"文一西路 1 号"},"tags":["Java"]}'

curl -s -o /dev/null -w '%{http_code}\n' \
  'http://localhost:8081/api/v1/validation/members?page=0&size=20'

curl -s -o /dev/null -w '%{http_code}\n' \
  'http://localhost:8081/api/v1/validation/members?page=-1&size=20'
```

这个没有任何自定义异常处理的兼容工程应观察到：

```text
200  合法 body
400  RequestBody DTO 对象级校验失败
200  合法 query
500  旧 AOP ConstraintViolationException 未被 MVC 默认 resolver 映射为 400
```

最后一项是本示例的默认观察结果，不是理想的 API 合同。不要为了让数字与现代工程相同而提前添加
`ControllerAdvice`；后续全局异常处理课程会专门解决异常到 HTTP 响应的映射。

## 八、集中排查常见校验误用

::::pitfalls
### 只依赖 Web starter

**触发条件：** DTO 已写约束，但工程没有显式添加 validation starter。

**原因：** 把 Web 能力与 Bean Validation provider 当成同一项依赖，或继续依赖 Boot 2.3 之前的传递关系。

**后果：** 注解可能存在于源码中，运行入口却没有完整的 provider 支持，非法输入不能形成可靠反馈环。

**验证方式：** 检查依赖树，并发送空白字段确认响应确实在 Controller 前失败。

**错误示例：**

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

**正确写法：**

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

### DTO 有约束却漏掉入口 Valid

**触发条件：** `CreateMemberRequest` 字段有 `@NotBlank`，Controller 参数只有 `@RequestBody`。

**原因：** 误以为对象一经 JSON 绑定就会自动执行所有字段约束。

**后果：** 空白名称仍进入方法体，业务代码收到不满足入口合同的对象。

**验证方式：** 发送空白名称并在 Controller 成功分支加断点；正确写法应返回 400 且断点不命中。

**错误示例：**

```java
/**
 * 接收没有触发对象级校验的成员输入。
 *
 * @param request 成员创建输入
 * @return 成员预览
 */
public MemberPreview preview(@RequestBody CreateMemberRequest request) {
    return MemberPreview.from(request);
}
```

**正确写法：**

```java
/**
 * 接收并预览已经通过对象级校验的成员输入。
 *
 * @param request 成员创建输入
 * @return 成员预览
 */
public MemberPreview preview(@Valid @RequestBody CreateMemberRequest request) {
    return MemberPreview.from(request);
}
```

### 只写 Email 便认为邮箱必填

**触发条件：** 邮箱字段只有 `@Email`，请求完全省略该字段。

**原因：** 没有区分存在性与格式；标准 `@Email` 会把 `null` 视为合法。

**后果：** 缺少邮箱的 DTO 通过格式约束。

**验证方式：** 分别发送 `null`、空串、空白和错误格式，确认两个注解各自负责的分支。

**错误示例：**

```java
@Email(message = "邮箱格式不正确")
private String email;
```

**正确写法：**

```java
@NotBlank(message = "邮箱不能为空")
@Email(message = "邮箱格式不正确")
private String email;
```

### 只写 Valid 便认为嵌套对象必须存在

**触发条件：** `address` 只有 `@Valid`，请求传入 `"address": null`。

**原因：** `@Valid` 负责递归，不负责拒绝 null。

**后果：** 地址不存在时没有内部对象可继续检查，整个关联可能通过校验。

**验证方式：** 分别发送 null 地址和城市为空白的地址，确认一个由 `@NotNull` 拒绝，一个由级联约束拒绝。

**错误示例：**

```java
@Valid
private AddressRequest address;
```

**正确写法：**

```java
@NotNull(message = "地址不能为空")
@Valid
private AddressRequest address;
```

### 在现代 Controller 保留类型级 Validated

**触发条件：** Spring 6.1+ Controller 为了 query 校验继续添加类型级 `@Validated`。

**原因：** 把普通 Spring Bean 的 AOP 方法校验规则复制到了 MVC 已有内建校验的 Controller。

**后果：** 请求改走 AOP 路径，异常类型和处理方式偏离现代 MVC 文档，也可能造成迁移时的重复校验困惑。

**验证方式：** 移除类级注解后发送 `page=-1`，确认仍由 MVC 内建方法校验返回 400。

**错误示例：**

```java
@RestController
@Validated
public class ValidationController {
}
```

**正确写法：**

```java
@RestController
@RequestMapping("/api/v1/validation")
public class ValidationController {

    /**
     * 返回通过约束的页码。
     *
     * @param page 页码
     * @return 页码
     */
    @GetMapping("/page")
    public int page(@RequestParam @Min(0) int page) {
        return page;
    }
}
```

### 把 page=abc 说成 Min 失败

**触发条件：** query 传入 `page=abc`，参数类型声明为 `int` 并带 `@Min(0)`。

**原因：** 忽略了字符串必须先转换为整数，Validator 才能检查数值下界。

**后果：** 教学和日志把绑定异常错误归类为 constraint violation。

**验证方式：** 对比分别发送 `page=abc` 与 `page=-1`，两者都可能是 400，但前者是类型转换失败，后者才是
方法约束失败。

**错误示例：**

```bash
# 不能仅凭 400 就把这次失败归类为 Min 约束失败
curl -s -o /dev/null -w '%{http_code}\n' \
  'http://localhost:8080/api/v1/validation/members?page=abc&size=20'
```

**正确写法：**

```bash
# abc 在字符串转 int 时失败
curl -s -o /dev/null -w '%{http_code}\n' \
  'http://localhost:8080/api/v1/validation/members?page=abc&size=20'
# -1 已经成功转成 int，随后才违反 Min 约束
curl -s -o /dev/null -w '%{http_code}\n' \
  'http://localhost:8080/api/v1/validation/members?page=-1&size=20'
```

### 用自定义约束查询邮箱是否唯一

**触发条件：** 试图把“邮箱尚未注册”写成 DTO 上的 `@UniqueEmail`。

**原因：** 把依赖数据库当前状态的业务判断当成只依赖字段值的声明式输入约束。

**后果：** Validator 引入持久化、并发和事务问题；即使校验时唯一，写入时仍可能发生竞态。

**验证方式：** 列出规则需要的数据。只要必须查询数据库、权限或远程服务，就不属于本课 DTO 约束。

**错误示例：**

```java
@UniqueEmail
private String email;
```

**正确写法：**

```java
@NotBlank(message = "邮箱不能为空")
@Email(message = "邮箱格式不正确")
private String email;
```

### 把旧 AOP 失败写成默认 400

**触发条件：** Java 8 / Framework 5.2 Controller 使用类级 `@Validated` 校验 query，然后直接断言 400。

**原因：** 把 `MethodArgumentNotValidException` 的默认映射套到了
`javax.validation.ConstraintViolationException`。

**后果：** 实际未定制工程返回 500，课程描述与真实行为冲突。

**验证方式：** 在没有 `ControllerAdvice` 的兼容工程中发送 `page=-1`，同时观察 HTTP 状态与日志中的异常类。

**错误示例：**

```bash
# 错误地把旧 AOP 路径预期为 400
curl -s -o /dev/null -w '%{http_code}\n' \
  'http://localhost:8081/api/v1/validation/members?page=-1&size=20'
```

**正确写法：**

```bash
# 未定制异常映射的本课兼容工程应观察到 500
curl -s -o /dev/null -w '%{http_code}\n' \
  'http://localhost:8081/api/v1/validation/members?page=-1&size=20'
```
::::

## 九、独立练习

### 1. 任务、约束与验收

::::exercise
### 为 TeamFlow 成员邀请实现参数校验

**要求：** 新建独立工程，提供 `POST /api/v1/exercises/invitations` 与
`GET /api/v1/exercises/invitations?batchSize=10`。POST 请求的 `displayName` 必填且最多 40 个字符，
`email` 必填且格式合法，`weeklyHours` 必填且范围为 1 到 40，`team` 必须存在并级联校验，`team.code`
必填且长度为 3 到 12，`skills` 必须存在且包含 1 到 5 个非空白元素；`batchSize` 范围为 1 到 50。现代
Controller 不添加类型级 `@Validated`，Java 8 Controller 使用类型级 `@Validated`。不要添加统一响应 DTO、
`ControllerAdvice`、验证组、自定义约束或邮箱唯一性查询。

**验收：** 至少证明合法 body 为 200，空白邮箱、缺少 team、空白 team.code、空白 skills 元素均为 400，
现代 `batchSize=0` 为 400；Java 8 线还要记录未定制 AOP query 失败的真实状态，不能先写死为 400。
::::

### 2. JDK 25 完整参考工程

参考工程 `teamflow-invitation-validation-modern` 的文件树如下：

```text
teamflow-invitation-validation-modern/
├── pom.xml
└── src/main/
    ├── java/com/teamflow/invitation/
    │   ├── InvitationApplication.java
    │   ├── TeamRequest.java
    │   ├── InviteRequest.java
    │   └── InvitationController.java
    └── resources/application.properties
```

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
  <artifactId>teamflow-invitation-validation-modern</artifactId>
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
spring.application.name=teamflow-invitation-validation-modern
server.port=8082
```

`src/main/java/com/teamflow/invitation/InvitationApplication.java`：

```java
package com.teamflow.invitation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class InvitationApplication {

    /**
     * 启动现代邀请参数校验练习。
     *
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        SpringApplication.run(InvitationApplication.class, args);
    }
}
```

`src/main/java/com/teamflow/invitation/TeamRequest.java`：

```java
package com.teamflow.invitation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class TeamRequest {

    @NotBlank(message = "团队编码不能为空")
    @Size(min = 3, max = 12, message = "团队编码长度必须在 3 到 12 之间")
    private String code;

    /**
     * 创建供 JSON 绑定使用的空团队请求。
     */
    public TeamRequest() {
    }

    /**
     * 返回团队编码。
     *
     * @return 团队编码
     */
    public String getCode() {
        return code;
    }

    /**
     * 设置团队编码。
     *
     * @param code 团队编码
     */
    public void setCode(String code) {
        this.code = code;
    }
}
```

`src/main/java/com/teamflow/invitation/InviteRequest.java`：

```java
package com.teamflow.invitation;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public final class InviteRequest {

    @NotBlank(message = "成员名称不能为空")
    @Size(max = 40, message = "成员名称最多 40 个字符")
    private String displayName;

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;

    @NotNull(message = "每周投入小时不能为空")
    @Min(value = 1, message = "每周投入小时不能小于 1")
    @Max(value = 40, message = "每周投入小时不能大于 40")
    private Integer weeklyHours;

    @NotNull(message = "目标团队不能为空")
    @Valid
    private TeamRequest team;

    @NotNull(message = "技能列表不能为空")
    @Size(min = 1, max = 5, message = "技能数量必须在 1 到 5 之间")
    private List<@NotBlank(message = "技能名称不能为空白") String> skills;

    /**
     * 创建供 JSON 绑定使用的空邀请请求。
     */
    public InviteRequest() {
    }

    /**
     * 返回成员显示名称。
     *
     * @return 成员显示名称
     */
    public String getDisplayName() {
        return displayName;
    }

    /**
     * 设置成员显示名称。
     *
     * @param displayName 成员显示名称
     */
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    /**
     * 返回邀请邮箱。
     *
     * @return 邀请邮箱
     */
    public String getEmail() {
        return email;
    }

    /**
     * 设置邀请邮箱。
     *
     * @param email 邀请邮箱
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * 返回每周投入小时。
     *
     * @return 每周投入小时
     */
    public Integer getWeeklyHours() {
        return weeklyHours;
    }

    /**
     * 设置每周投入小时。
     *
     * @param weeklyHours 每周投入小时
     */
    public void setWeeklyHours(Integer weeklyHours) {
        this.weeklyHours = weeklyHours;
    }

    /**
     * 返回目标团队。
     *
     * @return 目标团队
     */
    public TeamRequest getTeam() {
        return team;
    }

    /**
     * 设置目标团队。
     *
     * @param team 目标团队
     */
    public void setTeam(TeamRequest team) {
        this.team = team;
    }

    /**
     * 返回技能列表。
     *
     * @return 技能列表
     */
    public List<String> getSkills() {
        return skills;
    }

    /**
     * 设置技能列表。
     *
     * @param skills 技能列表
     */
    public void setSkills(List<String> skills) {
        this.skills = skills;
    }
}
```

`src/main/java/com/teamflow/invitation/InvitationController.java`：

```java
package com.teamflow.invitation;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/exercises/invitations")
public class InvitationController {

    /**
     * 回显已经通过校验的邀请请求。
     *
     * @param request 邀请请求
     * @return 已通过校验的邀请请求
     */
    @PostMapping(
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<InviteRequest> previewInvitation(
            @Valid @RequestBody InviteRequest request) {
        return ResponseEntity.ok(request);
    }

    /**
     * 回显已经通过校验的批次数量。
     *
     * @param batchSize 批次数量
     * @return 已通过校验的批次数量
     */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Integer> previewBatch(
            @RequestParam
                    @Min(value = 1, message = "批次数量不能小于 1")
                    @Max(value = 50, message = "批次数量不能大于 50")
                    int batchSize) {
        return ResponseEntity.ok(batchSize);
    }
}
```

构建、启动并运行最小验收：

```bash
mvn clean package
java -jar target/teamflow-invitation-validation-modern-1.0.0.jar
```

```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST 'http://localhost:8082/api/v1/exercises/invitations' \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"周岚","email":"zhou@example.com","weeklyHours":20,"team":{"code":"API"},"skills":["Java","Spring"]}'

curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST 'http://localhost:8082/api/v1/exercises/invitations' \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"周岚","email":"bad-email","weeklyHours":20,"team":{"code":"API"},"skills":["Java"]}'

curl -s -o /dev/null -w '%{http_code}\n' \
  'http://localhost:8082/api/v1/exercises/invitations?batchSize=0'
```

前三次请求预期依次为 `200`、`400`、`400`。继续补齐练习要求的四种 body 失败：

```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST 'http://localhost:8082/api/v1/exercises/invitations' \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"周岚","email":" ","weeklyHours":20,"team":{"code":"API"},"skills":["Java"]}'

curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST 'http://localhost:8082/api/v1/exercises/invitations' \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"周岚","email":"zhou@example.com","weeklyHours":20,"skills":["Java"]}'

curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST 'http://localhost:8082/api/v1/exercises/invitations' \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"周岚","email":"zhou@example.com","weeklyHours":20,"team":{"code":" "},"skills":["Java"]}'

curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST 'http://localhost:8082/api/v1/exercises/invitations' \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"周岚","email":"zhou@example.com","weeklyHours":20,"team":{"code":"API"},"skills":[" "]}'
```

这四次请求都应返回 `400`，分别证明空白邮箱、缺少 team、空白 team.code 与空白 skills 元素会在进入
Controller 方法体前被拒绝。至此现代工程的七次请求完整覆盖练习验收项。

### 3. Java 8 完整参考工程

兼容工程 `teamflow-invitation-validation-java8` 保持相同请求合同，只把 Validation 包名切换为 `javax`，并在
Controller 类型上添加 Spring 的 `@Validated`。完整文件树如下：

```text
teamflow-invitation-validation-java8/
├── pom.xml
└── src/main/
    ├── java/com/teamflow/invitation/
    │   ├── InvitationApplication.java
    │   ├── TeamRequest.java
    │   ├── InviteRequest.java
    │   └── InvitationController.java
    └── resources/application.properties
```

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
  <artifactId>teamflow-invitation-validation-java8</artifactId>
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
spring.application.name=teamflow-invitation-validation-java8
server.port=8083
```

`src/main/java/com/teamflow/invitation/InvitationApplication.java`：

```java
package com.teamflow.invitation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class InvitationApplication {

    /**
     * 启动 Java 8 邀请参数校验练习。
     *
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        SpringApplication.run(InvitationApplication.class, args);
    }
}
```

`src/main/java/com/teamflow/invitation/TeamRequest.java`：

```java
package com.teamflow.invitation;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public final class TeamRequest {

    @NotBlank(message = "团队编码不能为空")
    @Size(min = 3, max = 12, message = "团队编码长度必须在 3 到 12 之间")
    private String code;

    /**
     * 创建供 JSON 绑定使用的空团队请求。
     */
    public TeamRequest() {
    }

    /**
     * 返回团队编码。
     *
     * @return 团队编码
     */
    public String getCode() {
        return code;
    }

    /**
     * 设置团队编码。
     *
     * @param code 团队编码
     */
    public void setCode(String code) {
        this.code = code;
    }
}
```

`src/main/java/com/teamflow/invitation/InviteRequest.java`：

```java
package com.teamflow.invitation;

import java.util.List;
import javax.validation.Valid;
import javax.validation.constraints.Email;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

public final class InviteRequest {

    @NotBlank(message = "成员名称不能为空")
    @Size(max = 40, message = "成员名称最多 40 个字符")
    private String displayName;

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;

    @NotNull(message = "每周投入小时不能为空")
    @Min(value = 1, message = "每周投入小时不能小于 1")
    @Max(value = 40, message = "每周投入小时不能大于 40")
    private Integer weeklyHours;

    @NotNull(message = "目标团队不能为空")
    @Valid
    private TeamRequest team;

    @NotNull(message = "技能列表不能为空")
    @Size(min = 1, max = 5, message = "技能数量必须在 1 到 5 之间")
    private List<@NotBlank(message = "技能名称不能为空白") String> skills;

    /**
     * 创建供 JSON 绑定使用的空邀请请求。
     */
    public InviteRequest() {
    }

    /**
     * 返回成员显示名称。
     *
     * @return 成员显示名称
     */
    public String getDisplayName() {
        return displayName;
    }

    /**
     * 设置成员显示名称。
     *
     * @param displayName 成员显示名称
     */
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    /**
     * 返回邀请邮箱。
     *
     * @return 邀请邮箱
     */
    public String getEmail() {
        return email;
    }

    /**
     * 设置邀请邮箱。
     *
     * @param email 邀请邮箱
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * 返回每周投入小时。
     *
     * @return 每周投入小时
     */
    public Integer getWeeklyHours() {
        return weeklyHours;
    }

    /**
     * 设置每周投入小时。
     *
     * @param weeklyHours 每周投入小时
     */
    public void setWeeklyHours(Integer weeklyHours) {
        this.weeklyHours = weeklyHours;
    }

    /**
     * 返回目标团队。
     *
     * @return 目标团队
     */
    public TeamRequest getTeam() {
        return team;
    }

    /**
     * 设置目标团队。
     *
     * @param team 目标团队
     */
    public void setTeam(TeamRequest team) {
        this.team = team;
    }

    /**
     * 返回技能列表。
     *
     * @return 技能列表
     */
    public List<String> getSkills() {
        return skills;
    }

    /**
     * 设置技能列表。
     *
     * @param skills 技能列表
     */
    public void setSkills(List<String> skills) {
        this.skills = skills;
    }
}
```

`src/main/java/com/teamflow/invitation/InvitationController.java`：

```java
package com.teamflow.invitation;

import javax.validation.Valid;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/exercises/invitations")
@Validated
public class InvitationController {

    /**
     * 回显已经通过校验的邀请请求。
     *
     * @param request 邀请请求
     * @return 已通过校验的邀请请求
     */
    @PostMapping(
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<InviteRequest> previewInvitation(
            @Valid @RequestBody InviteRequest request) {
        return ResponseEntity.ok(request);
    }

    /**
     * 回显已经通过校验的批次数量。
     *
     * @param batchSize 批次数量
     * @return 已通过校验的批次数量
     */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Integer> previewBatch(
            @RequestParam
                    @Min(value = 1, message = "批次数量不能小于 1")
                    @Max(value = 50, message = "批次数量不能大于 50")
                    int batchSize) {
        return ResponseEntity.ok(batchSize);
    }
}
```

使用 Java 8 构建并启动：

```bash
mvn clean package
java -jar target/teamflow-invitation-validation-java8-1.0.0.jar
```

把现代参考工程的七个请求端口改为 `8083` 后依次执行。预期输出为：

```text
200  合法 body
400  邮箱格式错误
500  batchSize 越界，旧 AOP 异常未被默认映射为 400
400  邮箱为空白
400  缺少 team
400  team.code 为空白
400  skills 包含空白元素
```

body 对象校验在两条版本线上的合同一致。`500` 是这个没有自定义异常处理的兼容工程的真实默认观察，
不是推荐的接口设计；不要为了让数字与现代工程相同而提前加入全局异常处理。

## 十、本课小结

- JSON 必须先成功绑定为 Java 值，Bean Validation 才会检查声明式约束；绑定失败与约束失败不是同一阶段。
- `@NotNull` 与 `@NotBlank` 拒绝 `null`，`@Size`、`@Min`、`@Max` 和 `@Email` 单独使用时允许 `null`。
- 必填文本、包装数值和集合通常需要组合存在性约束与内容约束，不能让一个注解承担两个合同。
- `@Valid` 负责进入嵌套对象继续校验，不负责要求对象存在；必填嵌套对象应组合 `@NotNull @Valid`。
- 集合上的 `@Size` 校验元素数量，类型参数上的约束校验每个元素，二者职责不同。
- Spring 6.1 及以上的现代 Controller 使用 MVC 内建方法校验，不添加类型级 `@Validated`。
- Spring 5.2 的 Controller 直接参数约束依赖类型级 `@Validated` 和 AOP，默认失败状态与现代线不同。
- 数据库唯一性、权限和资源状态属于业务规则；统一响应与异常映射也留给后续课程。
