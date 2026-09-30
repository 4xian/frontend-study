---
id: backend.java.learn.intermediate.cors-and-frontend-integration
type: lesson
title: 跨域与前端联调
summary: 用精确 CORS 策略连接 Vite React 页面与 Spring MVC API，并从预检、响应头和请求地址定位联调失败
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 240
prerequisites:
  - backend.java.learn.intermediate.file-upload-and-download
objectives:
  - 能用 scheme、host 与 port 判断两个 URL 是否同源。
  - 能区分同源策略、CORS、认证与服务器访问控制的职责。
  - 能解释不预检请求、预检请求与实际请求的浏览器处理顺序。
  - 能正确配置允许来源、方法、请求头、暴露响应头、凭据与预检缓存。
  - 能在局部 CrossOrigin 与全局 WebMvcConfigurer 之间选择唯一的策略 owner。
  - 能说明全局与局部 CORS 的列表属性和单值属性如何合并。
  - 能让 Spring Boot 4.1 与 2.3 工程使用相同的精确来源配置。
  - 能区分 Spring CORS、Vite server.proxy 与 Vite server.cors 的职责。
  - 能结合 curl、浏览器 Console、Network 和页面结果定位跨域失败。
recap:
  - origin 由 scheme、host、port 共同确定，localhost 与 127.0.0.1 也是不同 host。
  - CORS 是服务器授予浏览器脚本跨源读取权限的协议，不是认证、授权或非浏览器访问控制。
  - JSON 或自定义请求头常触发 OPTIONS 预检，预检通过后浏览器才发送实际请求。
  - allowedHeaders 控制前端能发送什么，exposedHeaders 控制脚本还能读取哪些响应头。
  - 局部与全局列表配置通常相加，局部注解不一定能收窄全局来源。
  - 两条版本线共用精确 allowedOrigins；origin pattern API 从 Spring 5.3 才存在。
  - Vite proxy 让浏览器请求同源开发地址，再由开发服务器转发；绝对后端 URL 会绕过代理。
  - curl 只验证服务器响应，不执行浏览器 CORS，最终成功必须由真实浏览器 fetch 证明。
related:
  - backend.java.learn.intermediate.http-uri-and-request-response-basics
  - backend.java.learn.basics.unified-api-contract
  - backend.java.learn.intermediate.user-and-team-api-project
tags:
  - Java
  - Spring Boot
  - Spring MVC
  - CORS
  - Vite
  - React
  - 前后端联调
  - 预检请求
appliesTo: JDK 25、Spring Boot 4.1.0、Spring Framework 7.0.8 主线；Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE 兼容写法；浏览器协议按 Fetch 与 RFC 6454
verifiedAt: 2026-08-20
sources:
  - id: rfc-6454-web-origin
    title: RFC 6454 - The Web Origin Concept
    url: https://www.rfc-editor.org/rfc/rfc6454.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Web origin
    claims:
      - HTTP 与 HTTPS origin 由 scheme、host 和 port 共同确定
  - id: whatwg-fetch-cors
    title: WHATWG Fetch Standard - CORS protocol
    url: https://fetch.spec.whatwg.org/#http-cors-protocol
    sourceOrigin: official
    sourceType: specification
    appliesTo: Browser Fetch CORS protocol
    claims:
      - CORS safelist、预检、凭据模式和访问控制响应头共同决定脚本能否读取响应
      - credentialed response 不能使用通配 Access-Control-Allow-Origin
  - id: spring-7-cors-reference
    title: Spring Framework 7.0 - CORS
    url: https://docs.spring.io/spring-framework/reference/7.0/web/webmvc-cors.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims:
      - Spring MVC 直接处理预检并拦截实际跨域请求
      - 局部与全局配置可以合并，列表属性通常相加而单值由局部覆盖
  - id: spring-708-cross-origin
    title: CrossOrigin API - Spring Framework 7.0.8
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/bind/annotation/CrossOrigin.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 注解支持 origins、originPatterns、methods、allowedHeaders、exposedHeaders、credentials 与 maxAge
  - id: spring-708-cors-configuration
    title: CorsConfiguration API - Spring Framework 7.0.8
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/cors/CorsConfiguration.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 裸配置默认不允许跨域，permit defaults、组合规则和 credentials 校验各有明确合同
  - id: spring-708-cors-registration
    title: CorsRegistration API - Spring Framework 7.0.8
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/servlet/config/annotation/CorsRegistration.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - CorsRegistry 映射可链式收窄来源、方法、请求头、暴露头、凭据与 maxAge
  - id: spring-5215-cross-origin
    title: CrossOrigin API - Spring Framework 5.2.15.RELEASE
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/bind/annotation/CrossOrigin.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 兼容线支持精确 origins 但没有 originPatterns 属性
  - id: spring-5215-cors-configuration
    title: CorsConfiguration API - Spring Framework 5.2.15.RELEASE
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/cors/CorsConfiguration.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 兼容线具有相同的精确来源、默认值和组合基础，但没有 origin pattern API
  - id: spring-5215-cors-registration
    title: CorsRegistration API - Spring Framework 5.2.15.RELEASE
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/servlet/config/annotation/CorsRegistration.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 兼容线支持本课双版本共用的全局链式配置
  - id: spring-53-cors-release-notes
    title: Spring Framework 5.3 Release Notes
    url: https://github.com/spring-projects/spring-framework/wiki/Spring-Framework-5.3-Release-Notes
    sourceOrigin: official
    sourceType: release-note
    appliesTo: Spring Framework 5.3
    claims:
      - allowedOriginPatterns 与 credentials 的显式来源校验从 Spring Framework 5.3 引入
  - id: vite-server-options
    title: Vite - Server Options
    url: https://vite.dev/config/server-options.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Vite 8
    claims:
      - server.proxy 转发匹配路径，server.cors 只控制对 Vite 开发服务器的跨源访问
  - id: spring-boot-41-cors-baseline
    title: Spring Boot 4.1 System Requirements
    url: https://docs.spring.io/spring-boot/4.1/system-requirements.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Spring Boot 4.1.0 支持 JDK 25 并要求 Spring Framework 7.0.8 或以上
  - id: spring-boot-2312-cors-baseline
    title: Spring Boot 2.3.12 Dependency Versions
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/appendix-dependency-versions.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Spring Boot 2.3.12.RELEASE 管理 Spring Web 与 Spring Web MVC 5.2.15.RELEASE
  - id: stack-overflow-vite-cors
    title: Stack Overflow - Is there any solution to solve CORS error in Vite js?
    url: https://stackoverflow.com/questions/71618204/is-there-any-solution-to-solve-cors-error-in-vite-js
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Vite development proxy
    claims:
      - 真实误区包括把允许响应头加到前端请求，以及配置代理后仍请求绝对后端 URL
---

# 跨域与前端联调

Vite 开发页运行在 `http://localhost:5173`，Spring API 运行在 `http://localhost:8080`。两个地址只差端口，
但对浏览器来说已经跨源。接口可能被 curl 正常调用，前端 `fetch` 却失败，因为 curl 只处理 HTTP，浏览器还要
执行同源策略和 CORS 检查。

本课让一个简洁 React 页面直接调用 TeamFlow API，再切换到 Vite 开发代理。重点是看懂浏览器实际发送了什么、
Spring 授权了什么，以及请求究竟走向 5173 还是 8080。OpenAPI、项目与任务完整 API、Spring Security、
CSRF、cookie 登录和生产网关留给后续课程。

## 一、先判断浏览器看到的源

### 1. scheme、host、port 必须全部相同

origin 由协议、主机和端口组成。路径不参与 origin 计算：

| 页面地址 | API 地址 | 是否同源 | 原因 |
| --- | --- | --- | --- |
| `http://localhost:5173/app` | `http://localhost:5173/api/v1/teams` | 是 | 三元组相同 |
| `http://localhost:5173` | `http://localhost:8080/api/v1/teams` | 否 | 端口不同 |
| `http://localhost:5173` | `http://127.0.0.1:5173/api/v1/teams` | 否 | host 不同 |
| `http://localhost:5173` | `https://localhost:5173/api/v1/teams` | 否 | scheme 不同 |

因此 Spring 允许 `http://localhost:5173`，不代表同时允许 `http://127.0.0.1:5173`。排错时必须逐字查看
Network 中的 `Origin`，不能凭地址“看起来都在本机”判断。

### 2. CORS 授予读取权，不负责认证

同源策略保护浏览器中的脚本读取边界。CORS 由被请求服务器在响应中写入访问控制头，告诉浏览器哪些源可以
读取响应。它不会阻止 curl、移动应用或另一台服务器发请求，也不能证明调用者是谁。

```text
浏览器页面 -> 发送 Origin -> Spring MVC 检查 CORS 配置
浏览器页面 <- 返回允许头 <- Spring MVC 写入 CORS 响应头
浏览器根据响应头决定：把响应交给脚本，还是拒绝脚本读取
```

即使浏览器拒绝读取，服务器仍可能已经收到实际请求。业务接口仍需自己的认证与授权；本课不提前配置安全链。

## 二、读懂一次跨域交换

### 1. 不预检请求也要检查响应

教学中常把满足 CORS safelist 的请求称为“简单请求”。规范中的 safelisted method 只有 `GET`、`HEAD`、`POST`；
是否预检还要看请求头及其值。例如不带自定义头的 `GET` 通常直接发送实际请求：

```http
GET /api/v1/teams HTTP/1.1
Host: localhost:8080
Origin: http://localhost:5173
```

Spring 允许后，实际响应包含精确匹配的来源：

```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:5173
Content-Type: application/json
```

“没有预检”不等于“没有 CORS”。浏览器仍会检查实际响应中的 `Access-Control-Allow-Origin`。

### 2. JSON 与自定义头常触发预检

`Content-Type` 只有 `application/x-www-form-urlencoded`、`multipart/form-data`、`text/plain` 三类值才可能
保持 safelisted，并且仍受参数和值字节限制。`application/json` 不在这三类中；`X-Request-Id` 也是自定义请求头。
浏览器会先自动发送 `OPTIONS`：

```http
OPTIONS /api/v1/teams HTTP/1.1
Origin: http://localhost:5173
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type,x-request-id
```

允许时，Spring MVC 直接处理预检，不调用 Controller 的业务方法：

```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET,POST
Access-Control-Allow-Headers: Content-Type,X-Request-Id
Access-Control-Max-Age: 1800
```

预检只说明后续请求可以发送。实际 `POST` 响应仍要带匹配的允许来源头；预检成功而业务端点返回 400 或 500，
依然是业务 HTTP 失败，不能全部归类为 CORS。

### 3. 允许发送与允许读取是两条轴

`Access-Control-Allow-Headers` 对应请求方向，决定浏览器能否发送 `Content-Type`、`X-Request-Id` 等头。
`Access-Control-Expose-Headers` 对应响应方向，决定脚本除 safelisted response headers 外还能读取哪些头。

```js
/** 创建团队并读取服务端返回的资源地址。 */
async function createTeam() {
  const response = await fetch('http://localhost:8080/api/v1/teams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': 'web-001',
    },
    body: JSON.stringify({ name: '联调体验组' }),
  })
  console.log(response.headers.get('Location'))
}
```

`allowedHeaders` 允许浏览器发送 `X-Request-Id`，并不代表脚本能读取响应里的 `Location`。如果后端没有把
`Location` 加入 `exposedHeaders`，请求仍可成功，Network 也能看到该响应头，但 `response.headers.get()`
返回 `null`。

### 4. credentials 是前后端共同合同

前端只有显式设置 `credentials: 'include'`，才会在跨源请求中采用 include 凭据模式；Spring 也必须设置
`allowCredentials(true)`。此时允许来源不能是 `*`，响应必须回写精确来源和
`Access-Control-Allow-Credentials: true`。浏览器为跨源实际请求自动发出的预检 credentials mode 总是
`same-origin`，不会携带跨源 cookie；预检响应仍要声明实际请求是否允许凭据。

```js
/** 使用凭据模式读取团队列表。 */
async function loadTeamsWithCredentials() {
  return fetch('http://localhost:8080/api/v1/teams', {
    credentials: 'include',
  })
}
```

凭据模式只说明浏览器是否可以携带和暴露凭据响应，不会凭空创建 session，也不能替代 CSRF 防护。本课主例
没有登录与 cookie，因此默认关闭 credentials；需要该能力时必须与安全课程一起重新冻结合同。

## 三、让 Spring MVC 拥有 CORS 策略

### 1. 少数端点可以使用 CrossOrigin

局部注解适合只有少数 Controller 或方法需要跨域的应用。显式列出策略比裸 `@CrossOrigin` 更容易审查：

```java
@CrossOrigin(
        origins = "http://localhost:5173",
        methods = {RequestMethod.GET, RequestMethod.POST},
        allowedHeaders = {"Content-Type", "X-Request-Id"},
        exposedHeaders = "Location",
        maxAge = 1800)
@RestController
@RequestMapping("/api/v1/teams")
public class TeamController {
    // 已有端点保持不变。
}
```

裸注解会采用开放默认值：允许所有来源与请求头，方法跟随当前映射，credentials 默认关闭，max age 默认为
1800 秒。它适合快速理解机制，不适合在不了解范围时直接放到整个项目。

### 2. API 统一策略使用 WebMvcConfigurer

TeamFlow 的 `/api/**` 共享一个开发来源，所以由一个全局配置统一负责：

```java
package com.teamflow.api;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** 统一拥有 TeamFlow API 的开发期跨域策略。 */
@Configuration
public class WebCorsConfiguration implements WebMvcConfigurer {

    /**
     * 只允许 Vite 开发页调用 TeamFlow API，并暴露新资源地址。
     *
     * @param registry Spring MVC 跨域映射注册器
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST")
                .allowedHeaders("Content-Type", "X-Request-Id")
                .exposedHeaders("Location")
                .allowCredentials(false)
                .maxAge(1800);
    }
}
```

`addMapping` 会先应用 permit defaults：所有来源，`GET`、`HEAD`、`POST`，所有请求头，1800 秒预检缓存，
credentials 不开启。后续链式调用负责显式收窄关键轴。只写 `/api/**` 并不等于只允许某个前端来源。

### 3. 局部配置不会自动收窄全局配置

全局与局部配置会组合。origins、methods、allowed headers、exposed headers 等列表通常相加；
`allowCredentials`、`maxAge` 等单值由局部非空值覆盖全局值。

假设全局允许来源 A 与 `GET`，方法注解允许来源 B 与 `POST`，结果通常是 A+B 和 GET+POST，而不是只剩 B。
因此完整程序只保留全局 owner，不在同一路由叠加 `@CrossOrigin`。确实需要例外时，先写出合并后的完整矩阵，
再决定是否拆分路径。

## 四、隔离真实的版本差异

### 1. 两条线共用精确来源

本课主配置使用 `allowedOrigins("http://localhost:5173")`。Spring Framework 7.0.8 与 5.2.15 都提供这组
API，同一份 Java 源码可以分别在 JDK 25 与 Java 8 工程编译。

没有匹配 CORS 配置时，两版的服务端预检状态不完全相同：5.2.15 会直接返回 403；7.0.8 不应冻结为相同
状态。跨版本共同合同是响应没有授权该来源的 CORS 头，浏览器拒绝脚本读取。

### 2. origin pattern 从 Spring 5.3 才存在

现代线需要允许两个固定开发端口时，可以使用受控 pattern：

```java
registry.addMapping("/api/**")
        .allowedOriginPatterns("http://localhost:[5173,4173]")
        .allowedMethods("GET", "POST");
```

Boot 2.3 的 Spring Framework 5.2.15 没有 `originPatterns`、`allowedOriginPatterns` 或
`setAllowedOriginPatterns`。兼容线必须枚举完整 origin：

```java
registry.addMapping("/api/**")
        .allowedOrigins("http://localhost:5173", "http://localhost:4173")
        .allowedMethods("GET", "POST");
```

Spring 7 会拒绝 `allowedOrigins("*")` 与 `allowCredentials(true)` 的组合。现代 pattern 即使技术上可与
credentials 共用，也不能写成匹配任意来源的 `*`；凭据读取权必须只授予可审查的前端来源。

## 五、在前课后端中加入 CORS

### 1. 复用团队读写合同

继续使用“实战：用户与团队 API”已经完成的现代、兼容两个工程，不复制 Controller、DTO、Service 或异常处理。
本课只把第三章的 `WebCorsConfiguration.java` 分别加入两个工程，原有接口保持不变：

- `GET /api/v1/teams?pageSize=20` 返回带 `items` 的分页响应；
- `POST /api/v1/teams` 接收 `{"name":"联调体验组"}`，返回 201、`Location` 与团队响应；
- 现代工程继续使用 Spring Boot 4.1.0 与 JDK 25；
- 兼容工程继续使用 Spring Boot 2.3.12.RELEASE 与 Java 8。

这样两条版本线只有 CORS 实现和端口不同，业务合同仍由前课唯一拥有。`X-Request-Id` 只是本课用来触发预检的
自定义请求头，Controller 不需要读取它；用于证明响应头暴露规则的是创建接口已有的 `Location`。

### 2. 在独立终端启动两条版本线

终端 A 构建并启动现代工程：

```bash
cd teamflow-user-team-api-modern
mvn clean package
java -jar target/teamflow-user-team-api-modern-1.0.0.jar --server.port=8080
```

终端 B 从包含两个工程的父目录构建并启动兼容工程：

```bash
cd teamflow-user-team-api-java8
mvn clean package
java -jar target/teamflow-user-team-api-java8-1.0.0.jar --server.port=8081
```

`java -jar` 会占用当前终端，所以不能把两条启动命令顺序放在同一个终端等待执行。若前课使用了不同的
`artifactId`，以两个工程各自 `target/` 中的实际 jar 文件名为准。

## 六、先用 HTTP 探针检查服务器合同

### 1. 允许来源的实际请求

无 `Origin` 的 curl 只能证明端点可用。增加浏览器会发送的来源后，现代线应返回业务状态和精确允许头：

```bash
curl -i \
  -H 'Origin: http://localhost:5173' \
  -H 'X-Request-Id: curl-read' \
  'http://localhost:8080/api/v1/teams?pageSize=1'
```

关键结果：

```text
HTTP/1.1 200
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Expose-Headers: Location
```

响应 body 的 `items[0].name` 为“课程平台组”。`X-Request-Id` 已被 CORS 允许发送，但前课 Controller 不读取、
也不回写它。把端口改为 8081 后，兼容线应保持同一业务结果与授权头。

### 2. 允许的 JSON 预检

```bash
curl -i -X OPTIONS \
  -H 'Origin: http://localhost:5173' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: Content-Type, X-Request-Id' \
  http://localhost:8080/api/v1/teams
```

响应应允许精确 origin、POST 与两个请求头。后端日志中不应出现创建团队的业务效果；只有后续实际 `POST`
才会新增团队。

### 3. 拒绝来源、方法与请求头

每次只改变一个轴，才能知道哪条策略拒绝了请求。先保持 GET，单独拒绝来源：

```bash
curl -i \
  -H 'Origin: http://127.0.0.1:5173' \
  'http://localhost:8080/api/v1/teams?pageSize=1'
```

再保持允许来源和普通请求头，单独拒绝方法：

```bash
curl -i -X OPTIONS \
  -H 'Origin: http://localhost:5173' \
  -H 'Access-Control-Request-Method: PATCH' \
  http://localhost:8080/api/v1/teams
```

最后保持允许来源和 POST，单独拒绝请求头：

```bash
curl -i -X OPTIONS \
  -H 'Origin: http://localhost:5173' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: Authorization' \
  http://localhost:8080/api/v1/teams
```

三次响应都不能提供匹配的 `Access-Control-Allow-Origin`。拒绝路径的具体服务端状态可以随版本和失败原因不同；
跨版本验收不要只写死 403，而要确认没有授权头，浏览器实际拒绝。把端口改为 8081，兼容线应拒绝同样的三个轴。

## 七、用 Vite React 页面完成浏览器联调

### 1. 创建最小前端

创建 `teamflow-web/package.json`：

```json
{
  "name": "teamflow-web",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite"
  },
  "dependencies": {
    "@vitejs/plugin-react": "6.0.5",
    "vite": "8.1.5",
    "react": "19.2.8",
    "react-dom": "19.2.8"
  },
  "devDependencies": {}
}
```

`index.html`：

```html
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
```

`src/main.jsx`：

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`src/App.jsx`：

```jsx
import { useState } from 'react'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

/** 展示 TeamFlow 团队读取联调结果。 */
export default function App() {
  const [result, setResult] = useState('尚未请求')

  /** 通过当前 API 基地址读取团队分页。 */
  async function loadTeams() {
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/teams`, {
        headers: { 'X-Request-Id': 'web-001' },
      })
      const page = await response.json()
      setResult(`${response.status} / ${page.items[0].name}`)
    } catch (error) {
      setResult(`请求失败：${error.message}`)
    }
  }

  return (
    <main>
      <h1>TeamFlow 前端联调</h1>
      <button type="button" onClick={loadTeams}>读取团队</button>
      <output>{result}</output>
    </main>
  )
}
```

### 2. 直接请求 Spring 观察预检

启动现代后端后，在前端目录安装依赖并指定绝对 API 地址：

```bash
npm install
VITE_API_BASE_URL=http://localhost:8080 npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

先临时删除 `headers` 配置并打开 `http://localhost:5173`。Network 应直接出现带 `Origin` 的 GET，页面可以读取
响应。恢复 `X-Request-Id` 后再点击“读取团队”，Network 应先出现 `OPTIONS`，随后出现 GET；页面显示：

```text
200 / 课程平台组
```

这里用 `0.0.0.0` 只为让同一个本地开发服务器同时接受 localhost 与 127.0.0.1 的 IPv4 连接，验证结束后应立即
停止，不能在不可信网络中长期暴露。将页面改为从 `http://127.0.0.1:5173` 打开后重试。浏览器发送的 Origin
不再匹配，Promise 拒绝，页面显示
“请求失败”，Console 有 CORS 错误。把后端端口和 API 基地址一起改为 8081，再重复成功与拒绝两条路径；
Java 8 兼容线也必须由浏览器证明。curl 仍可得到服务器响应，这正是浏览器反馈不可省略的原因。

### 3. 验证暴露头与凭据轴

使用第九章的创建表单分别连接 8080、8081。保留 `.exposedHeaders("Location")` 时，Network 与
`response.headers.get('Location')` 都能看到新资源地址；临时删除这一行并重启后端后，POST 仍然成功，Network
仍有 `Location`，但脚本读取结果为 `null`，页面显示 `201 / null / TEAM-2`。恢复配置后再继续。

凭据轴也要在两个端口各验证一次。临时把全局配置改为 `.allowCredentials(true)`，并给读取请求增加
`credentials: 'include'`。Network 中的实际响应必须同时包含精确的 `Access-Control-Allow-Origin` 和
`Access-Control-Allow-Credentials: true`，页面仍能读取 body。预检请求本身不得携带跨源 cookie；它的响应
仍要声明实际请求允许凭据。完成后恢复 `.allowCredentials(false)`，本课不创建登录状态或 cookie。

### 4. 使用 Vite proxy 建立同源入口

`vite.config.js`：

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

不设置 `VITE_API_BASE_URL`，重新启动 `npm run dev`。浏览器现在请求
`http://localhost:5173/api/v1/teams`，Vite 再转发到 8080。浏览器看到的是同源入口，因此不会执行跨源 CORS
交换，页面仍显示相同结果。

proxy 只参与开发服务器转发，不是生产部署策略。`server.cors` 则控制其他网页读取 Vite 自身资源，不能替代
Spring API 的 CORS。保留 proxy 却继续使用绝对 8080 URL，会绕过 proxy 并重新进入 CORS 路径。

完整浏览器矩阵必须覆盖两条版本线：现代线用 8080 完成无预检 GET、自定义头预检、拒绝来源、暴露
`Location`、成功 credentials、proxy 相对 URL 和绕过 proxy 的绝对 URL；兼容线把 API 基地址与 proxy target
改为 8081，重复同一组操作。每次切换会改变后端状态的创建操作前，先重启对应服务。现代线另外执行
`allowedOrigins("*") + allowCredentials(true)` 的拒绝实验；兼容线只使用精确 origins，不复制这个非法组合。

## 八、集中排查六类联调错误

### 六个典型错误

**社区补充：** Stack Overflow 的真实 Vite 问题集中出现过两种误用：把访问控制响应头放进前端请求，以及
配置 proxy 后仍请求绝对后端 URL。这里的正确结论已用 Fetch 与 Vite 官方文档重新核验。

:::pitfalls
### 在前端发送 Access-Control-Allow-Origin

**触发条件：** 前端把服务器响应头当成自己的请求头发送。

**原因：** CORS 的授权者是被请求服务器；额外的非 safelisted 请求头还可能触发预检。

**后果：** 预检因未允许该伪造请求头失败，原有跨域问题没有被修复。

**错误示例：**

```js
fetch('http://localhost:8080/api/v1/teams', {
  headers: { 'Access-Control-Allow-Origin': '*' },
})
```

**正确写法：**

```js
fetch('http://localhost:8080/api/v1/teams')
```

**影响版本：** 所有执行 Fetch CORS 的现代浏览器。

**验证方式：** Network 的请求头中不再出现伪造允许头，Spring 响应头中由服务器写入精确允许来源。

### 把 localhost 与 127.0.0.1 当成同一来源

**触发条件：** Spring 只允许 localhost，但页面实际从 127.0.0.1 打开。

**原因：** origin 比较使用 scheme、host、port，两个 host 不同。

**后果：** 预检或实际响应没有授权浏览器发送的 Origin。

**错误示例：**

```java
.allowedOrigins("http://localhost:5173") // 页面实际为 http://127.0.0.1:5173
```

**正确写法：**

```java
.allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173")
```

**影响版本：** Spring Framework 5.2.15 与 7.0.8；所有浏览器。

**验证方式：** 逐字核对 Network 的 Origin；仅在确实需要两个入口时枚举两者，并分别从两个页面地址请求。

### 用 no-cors 掩盖失败

**触发条件：** 为消除 Console 报错给 fetch 增加 `mode: 'no-cors'`。

**原因：** no-cors 不授予读取权，脚本得到不可读的 opaque response。

**后果：** 无法可靠读取状态、JSON 或自定义响应头，联调目标仍未完成。

**错误示例：**

```js
fetch('http://localhost:8080/api/v1/teams', { mode: 'no-cors' })
```

**正确写法：**

```js
fetch('http://localhost:8080/api/v1/teams')
```

**影响版本：** 所有执行 Fetch CORS 的现代浏览器。

**验证方式：** 删除绕过项，修复 Spring CORS 后断言 `response.type` 为 `cors` 且 JSON 可读。

### 配置 proxy 后仍请求绝对后端地址

**触发条件：** Vite 已代理 `/api`，前端仍写 `http://localhost:8080/api/v1/teams`。

**原因：** 只有匹配开发服务器路径的请求才进入 proxy。

**后果：** 浏览器绕过 5173，仍按跨源请求处理绝对 8080 URL。

**错误示例：**

```js
fetch('http://localhost:8080/api/v1/teams')
```

**正确写法：**

```js
fetch('/api/v1/teams')
```

**影响版本：** Vite 8；目标 Spring 版本不影响这个路由选择。

**验证方式：** Network 的 Request URL 必须以 `http://localhost:5173/api/v1/teams` 开头，后端同时收到转发请求。

### 用局部注解尝试收窄全局来源

**触发条件：** 全局允许 A，方法注解只写 B，并假设最终只允许 B。

**原因：** origins 等列表属性通常采用加法合并。

**后果：** A 仍被允许，真实授权面比代码阅读者预期更宽。

**错误示例：**

```java
/** 返回团队列表。 */
@CrossOrigin(origins = "https://admin.example.test")
@GetMapping
public List<TeamResponse> listTeams() {
    return Collections.emptyList();
}
```

**正确写法：**

```java
registry.addMapping("/api/admin/**")
        .allowedOrigins("https://admin.example.test")
        .allowedMethods("GET");
```

**影响版本：** Spring Framework 5.2.15 与 7.0.8。

**验证方式：** 搜索同一路由的全部局部与全局配置，对每个候选 origin 发送请求并核对合并后的实际结果。

### credentials 与任意来源组合

**触发条件：** 开启 credentials，同时允许任意来源。

**原因：** credentialed response 需要精确来源；Spring 7 也会拒绝 `allowedOrigins("*")` 的组合。

**后果：** 现代配置失败，或把浏览器凭据读取权授予过宽来源。

**错误示例：**

```java
.allowedOrigins("*")
.allowCredentials(true)
```

**正确写法：**

```java
.allowedOrigins("https://app.example.test")
.allowCredentials(true)
```

**影响版本：** Fetch CORS；Spring Framework 7.0.8 会主动校验，5.2.15 也不应依赖宽泛旧行为。

**验证方式：** 现代线验证任意来源组合被拒绝；正确配置响应必须回写精确 ACAO 与
`Access-Control-Allow-Credentials: true`，不可信来源仍不可读。
:::

## 九、独立练习

:::exercise
### 为团队创建表单完成直连与代理联调

**要求：** 在现有 React 页面增加团队名称输入框和“创建团队”按钮；提交 JSON 到 `/api/v1/teams`，发送
`X-Request-Id: web-create-001`，并显示状态、Location 路径和新团队 ID。先用绝对 8080 地址验证 OPTIONS +
POST，再清空 API 基地址验证 Vite proxy。不得使用 no-cors，也不得在前端伪造允许响应头。

**验收：** 直连时 Network 先出现成功 OPTIONS，再出现 201 POST；页面显示
`201 / /api/v1/teams/TEAM-2 / TEAM-2`。停止并重启后端后再切换 proxy，确保第二种模式也从同一初始状态
独立验证。proxy 模式的 Request URL 使用 5173 同源地址，页面输出保持一致；从 127.0.0.1 直连时浏览器拒绝读取。
:::

### 1. 完整参考实现

用下面的 `App.jsx` 替换主例文件，其余后端和 Vite 配置保持不变：

```jsx
import { useState } from 'react'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

/** 展示 TeamFlow 团队创建联调结果。 */
export default function App() {
  const [name, setName] = useState('联调体验组')
  const [result, setResult] = useState('尚未请求')

  /** 创建团队并显示浏览器可读的响应合同。 */
  async function createTeam() {
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': 'web-create-001',
        },
        body: JSON.stringify({ name }),
      })
      const created = await response.json()
      const location = response.headers.get('Location')
      const locationPath = location ? new URL(location).pathname : 'null'
      setResult(`${response.status} / ${locationPath} / ${created.id}`)
    } catch (error) {
      setResult(`请求失败：${error.message}`)
    }
  }

  return (
    <main>
      <h1>TeamFlow 团队创建联调</h1>
      <label>
        团队名称
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <button type="button" onClick={createTeam}>创建团队</button>
      <output>{result}</output>
    </main>
  )
}
```

`Location` 不是 CORS-safelisted response-header。第三章的全局配置已经显式暴露它，因此浏览器脚本可以把
绝对资源地址转换成稳定路径：

```java
.exposedHeaders("Location")
```

只修改前端不会改变浏览器能读取的响应头集合。

### 2. 两种模式的预期反馈

直连模式：

```bash
VITE_API_BASE_URL=http://localhost:8080 npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

Network 中先出现 OPTIONS，再出现 POST。预检允许 JSON 与 `X-Request-Id`，实际响应暴露 Location，页面显示：

```text
201 / /api/v1/teams/TEAM-2 / TEAM-2
```

停止并重新启动后端，确认状态回到只有 `TEAM-1`，再进入 proxy 模式。此时不设置 `VITE_API_BASE_URL`，前端
请求 5173 的 `/api/v1/teams`。浏览器不需要跨源预检，Vite 把请求转发给 Spring；首次创建仍稳定得到
`TEAM-2`，页面输出与直连模式一致。若不重启而连续提交，第二次创建会正确得到 `TEAM-3`，不能继续写死
`TEAM-2`。

## 十、本课小结

前后端联调不能从“加一个注解”开始，而要先确认浏览器实际看到的 origin 与 Request URL。直接访问 8080 时，
Spring CORS 配置负责授予 5173 页面读取权；访问 5173 的相对 `/api` 路径时，Vite proxy 负责开发期转发。

预检、实际请求、允许发送的头、允许读取的头与凭据是独立轴。用 curl 检查服务器头，用真实浏览器检查
Promise、Console 和 Network，再用后端状态确认业务是否执行，才能把 URL、HTTP、CORS 与业务失败分开。

## 累计项目衔接

累计项目在两版 `SecurityConfiguration` 中为 `/api/**` 注册同形 CORS 策略，允许来源由
`TEAMFLOW_CORS_ALLOWED_ORIGINS` 注入。浏览器联调还必须携带真实 Bearer 令牌；CORS 只授予浏览器读取权，
不会绕过认证与权限。
