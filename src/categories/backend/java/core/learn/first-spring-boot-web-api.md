---
id: backend.java.learn.intermediate.first-spring-boot-web-api
type: lesson
title: 首个 Spring Boot 应用
summary: 创建 TeamFlow 的 Spring Boot Web 工程，运行标准入口并从日志、端口和进程状态确认应用真正启动
domain: backend
technology: java
module: core
stage: intermediate
level: beginner
estimatedMinutes: 120
prerequisites:
  - backend.java.learn.basics.unified-api-contract
objectives:
  - 能用 Spring Initializr 生成 JDK 25、Spring Boot 4.1.0 的 Maven Web 工程并导入 IntelliJ IDEA。
  - 能说明 parent、Web starter、Maven plugin 和标准目录在首个工程中的最低限度职责。
  - 能读懂 Spring Boot 标准入口，并区分 Java main 方法与 SpringApplication.run 的职责。
  - 能分别从 IDEA 和 Maven Wrapper 启动应用，识别 Tomcat 与 Started 日志中的稳定信号。
  - 能用默认端口上的 404 响应确认请求到达尚未定义接口的应用，并在停止后确认端口释放。
  - 能排查 JDK 选择、依赖缺失、运行配置、端口占用和旧进程造成的常见启动问题。
  - 能使用独立的 Java 8、Spring Boot 2.7.18 工程完成同一个启动闭环。
recap:
  - Spring Initializr 负责生成工程起点，JDK、Spring Boot 版本和依赖选择仍需由开发者核对。
  - Boot 4.1.0 使用 spring-boot-starter-webmvc；Boot 2.7.18 的 Java 8 工程使用 spring-boot-starter-web。
  - 传统 main 方法是 Java 入口，SpringApplication.run 从该入口启动 Spring 应用和内嵌 Web 服务器。
  - Tomcat started、Started TeamFlowApplication、预期 404 与停止后的连接失败共同构成首课反馈环。
  - 404 在本课表示服务器已收到请求但尚无路径映射，不等于应用启动失败。
  - Java 8 兼容不是只切换 Project SDK，而是使用单独目录、受支持的 Boot 版本、starter 和构建 JDK。
related:
  - backend.java.learn.basics.maven-project-model
  - backend.java.learn.intermediate.http-uri-and-request-response-basics
  - backend.java.learn.intermediate.spring-boot-and-configuration
  - backend.java.learn.intermediate.dependency-injection-and-bean-lifecycle
tags:
  - Spring Boot
  - Spring Initializr
  - Maven
  - Tomcat
  - TeamFlow
appliesTo: JDK 25 与 Spring Boot 4.1.0 主线；Java 8 与 Spring Boot 2.7.18 兼容工程
verifiedAt: 2026-08-18
sources:
  - id: boot-410-system-requirements
    title: Spring Boot 4.1.0 - System Requirements
    url: https://docs.spring.io/spring-boot/system-requirements.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Spring Boot 4.1.0 至少需要 Java 17，JDK 25 位于其支持范围内
      - Maven 构建至少需要 Maven 3.6.3
      - Spring Boot Web 应用可以使用受支持的内嵌 Tomcat
  - id: boot-410-first-application
    title: Developing Your First Spring Boot Application
    url: https://docs.spring.io/spring-boot/tutorial/first-application/index.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Web 应用使用 spring-boot-starter-webmvc
      - 标准 main 方法把主应用类和命令行参数传给 SpringApplication.run
      - Maven run goal、Started 日志和 Ctrl+C 构成官方首应用运行步骤
  - id: spring-initializr-first-project
    title: Getting Started - Building an Application with Spring Boot
    url: https://spring.io/guides/gs/spring-boot
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Initializr and Spring Boot
    claims:
      - Spring Initializr 可以生成 Maven、Java、Spring Web 工程
      - 生成工程包含 Maven Wrapper，可使用 mvnw spring-boot:run 启动
  - id: boot-410-running-application
    title: Running Your Application
    url: https://docs.spring.io/spring-boot/reference/using/running-your-application.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - Spring Boot 应用可以作为普通 Java 应用从 IDE 运行
      - 重复启动 Web 应用会触发端口已占用错误
      - Maven plugin 的 spring-boot:run 可以在本地运行应用
  - id: boot-410-spring-boot-application-api
    title: SpringBootApplication API
    url: https://docs.spring.io/spring-boot/4.1.0/api/java/org/springframework/boot/autoconfigure/SpringBootApplication.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Boot 4.1.0
    claims:
      - SpringBootApplication 是组合配置、自动配置与组件扫描能力的便利注解
  - id: maven-standard-layout
    title: Introduction to the Standard Directory Layout
    url: https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Apache Maven
    claims:
      - pom.xml、src/main/java、src/main/resources 与 target 的标准职责
  - id: boot-2718-getting-started
    title: Spring Boot 2.7.18 - Getting Started
    url: https://docs.spring.io/spring-boot/docs/2.7.18/reference/html/getting-started.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.7.18 and Java 8
    claims:
      - Spring Boot 2.7.18 要求 Java 8 或以上并支持 Maven 3.3 或以上
      - Java 8 Web 工程使用 spring-boot-starter-web
      - 传统 main、SpringApplication.run、Started 日志和 Ctrl+C 同样适用
  - id: community-web-app-exits-without-starter
    title: Stack Overflow - Why does Spring Boot web app close immediately after starting?
    url: https://stackoverflow.com/questions/24214224/why-does-spring-boot-web-app-close-immediately-after-starting
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: 缺少 Boot Web starter 的启动排查；具体依赖名按对应版本官方文档核验
    claims:
      - 社区真实案例中只使用普通 Web 依赖而缺少 Boot Web starter 时，预期的 Web 应用启动后立即结束
---

# 首个 Spring Boot 应用

TeamFlow 已经有一份统一的 HTTP 与 JSON 合同，但目前仍只是设计：没有 Java 进程监听端口，也没有 Spring
应用负责装配 Web 运行环境。本课先建立这个可运行的外壳。完成后，应用能稳定启动、监听默认端口并正确
停止，但还不会提供任务接口。

这条边界很重要。请求映射、请求参数、请求体、响应状态、校验与统一错误都有各自的后续课程。本课看到
根路径返回 404 恰恰是预期结果：Web 服务器已经工作，只是我们还没有声明任何接口。

## 一、认识即将启动的工程

### 1. JDK、Maven 与 Spring Boot 各管一层

JDK 负责编译和运行 Java 代码；Maven 根据 `pom.xml` 组织项目并解析依赖；Spring Boot 在 Java 程序内部
建立 Spring 应用，按照已有依赖准备内嵌 Web 服务器。IntelliJ IDEA 负责编辑、导入 Maven 模型和发起
运行，本身不能替代 JDK，也不会替项目选择正确的框架版本。

这几层可以分别核对：

```bash
java -version
./mvnw -version
```

第一条显示当前终端 Java。第二条显示 Maven Wrapper 实际使用的 Java；其中 `Java version` 应为 25。
IDEA 还要单独核对 Project SDK 和 Maven Runner JRE，因为它们不一定跟终端相同。

### 2. Initializr 生成起点而不是成品业务

Spring Initializr 根据所选版本、构建工具和依赖生成一个标准工程。对本课而言，它解决的是容易抄错的
目录、parent、starter、plugin 和 Wrapper 文件，不会替 TeamFlow 设计 Controller 或业务逻辑。

在 `https://start.spring.io/` 选择：

| 选项 | 本课值 | 选择原因 |
| --- | --- | --- |
| Project | Maven | 前置课程已经建立 Maven 项目模型 |
| Language | Java | 当前路线的实现语言 |
| Spring Boot | 4.1.0 | 当前稳定教学版本 |
| Group | `com.teamflow` | 形成 TeamFlow 的包名前缀 |
| Artifact | `teamflow-api` | 形成工程与构件名称 |
| Packaging | Jar | 使用内嵌服务器直接运行 |
| Java | 25 | 当前主线 JDK |
| Dependencies | Spring Web | 让生成工程具备 Web 运行依赖 |

点击 Generate 后解压到独立目录。打开解压目录中的 `pom.xml`，确认 parent 版本是 `4.1.0`，Java 是
`25`，Spring Web 在 Boot 4.1.0 中生成的 artifact 是 `spring-boot-starter-webmvc`。不要把搜索接口中的
内部版本标识手工粘贴进 POM；最终应以官方教程、生成结果和 Maven 能否解析该坐标共同核对。

### 3. 四个位置足够开始

生成工程包含测试、Wrapper 和若干辅助文件，本课先认识四个位置：

```text
teamflow-api/
├── pom.xml
├── src/main/java/com/teamflow/TeamFlowApplication.java
├── src/main/resources/application.properties
└── target/
```

- `pom.xml` 保存版本、依赖和构建 plugin。
- `src/main/java` 保存 Java 主源码。
- `src/main/resources` 保存会进入运行 classpath 的资源；配置内容留到下一课。
- `target` 是 Maven 生成目录，不手工编辑，也不纳入课程源码。

## 二、读懂最小启动入口

### 1. 传统 main 仍是 Java 入口

Spring Boot 没有替换 Java 启动规则。JDK 25 和 Java 8 都能使用同一个传统入口：

```java
/**
 * 启动 TeamFlow Spring Boot 应用。
 *
 * @param args 命令行参数
 */
public static void main(String[] args) {
    SpringApplication.run(TeamFlowApplication.class, args);
}
```

JVM 先进入 `main`。`SpringApplication.run` 再接管后续启动，把主应用类作为主要来源，并继续传递命令行
参数。本课把这行当作标准启动形式，不展开应用上下文事件、Bean 生命周期或自动配置条件。

### 2. SpringBootApplication 标记主应用类

完整入口类还要加 `@SpringBootApplication`：

```java
package com.teamflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * TeamFlow 的 Spring Boot 应用入口。
 */
@SpringBootApplication
public class TeamFlowApplication {
    /**
     * 启动 TeamFlow Spring Boot 应用。
     *
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        SpringApplication.run(TeamFlowApplication.class, args);
    }
}
```

现阶段只需记住它标记“这是主应用类”。它组合了配置、自动配置和组件扫描能力；各组合能力如何决定
对象装配与配置结果，会在后续课程逐步拆开。

### 3. Web starter 让 run 启动内嵌服务器

`spring-boot-starter-webmvc` 不是某一个工具类，而是一组经过 Boot 管理的 Web 运行依赖。它让 Boot 判断
当前是 Servlet Web 应用，并准备内嵌 Tomcat。于是同一条 `SpringApplication.run` 不只建立普通 Java
对象，还会让进程持续监听 HTTP 端口。

如果 POM 只有 `spring-web` 或完全没有 Web starter，代码仍可能显示 Boot banner 和 Started，但进程会
结束，日志里也没有 Tomcat 启动信号。要判断是不是 Web 应用，不能只看 banner。

## 三、从 IDEA 启动并观察结果

### 1. 先让 IDEA 使用 JDK 25

用 IDEA 打开包含 `pom.xml` 的解压目录，等待 Maven 导入完成，然后核对：

1. 在 Project Structure 的 Project SDK 选择已安装的 JDK 25。
2. 在 Modules 中确认模块 SDK 继承 Project SDK 或明确选择 JDK 25。
3. 在 Maven Runner 的 JRE 选择 Project JDK 25。
4. 打开 Maven 工具窗口执行 Reload All Maven Projects。

Project SDK 决定编辑器和普通运行配置的 JDK，Maven Runner JRE 决定 IDEA 发起 Maven 任务时使用哪个
JDK。只改其中一个，可能出现编辑器不报错但构建失败，或终端成功而 IDEA 失败。

### 2. 从 main 左侧运行

打开 `TeamFlowApplication.java`，点击 `main` 左侧的运行图标并选择 Run。成功时控制台会出现大量框架
日志，不需要逐行记忆，先寻找三个稳定片段：

```text
:: Spring Boot :: (v4.1.0)
Tomcat started on port 8080 (http)
Started TeamFlowApplication
```

版本片段证明加载的是预期 Boot 版本；Tomcat 片段证明 Web 服务器已监听端口；Started 片段证明启动流程
完成。启动耗时、进程号和线程名每次可能不同，不应当作为固定验收文本。

### 3. 404 是当前阶段的预期响应

保持应用运行，在另一个终端执行：

```bash
curl --silent --output /dev/null --write-out '%{http_code}\n' http://localhost:8080/
```

预期输出：

```text
404
```

HTTP 请求已经到达 8080 上的应用，但项目还没有路径映射，所以没有资源能处理 `/`。本课用这个 404
证明“服务器可达但接口尚未编写”，不会在这里提前创建 Controller。

### 4. 停止后必须无法再访问

回到运行窗口点击停止，或在前台终端按 `Ctrl+C`。等待 Java 进程结束，再执行同一条 curl。此时 curl
应以非零状态结束并报告连接失败；如果仍得到 404 或其他响应，说明 8080 上还有另一个进程，刚才的请求
不一定命中了本次启动的应用。

## 四、从 Maven Wrapper 重跑同一工程

### 1. Wrapper 固定 Maven 启动入口

Initializr 生成的 `mvnw` 与 `mvnw.cmd` 是项目内的 Maven Wrapper 启动脚本。macOS 或 Linux 在项目
根目录运行：

```bash
./mvnw spring-boot:run
```

Windows PowerShell 或命令提示符运行：

```powershell
mvnw.cmd spring-boot:run
```

`spring-boot:run` 会在当前项目中编译并运行应用。命令必须从包含 `pom.xml` 的目录执行；从上级目录运行
会找不到项目模型，从另一个 Maven 工程运行则可能启动错误的应用。

### 2. IDEA 与 Wrapper 应形成相同反馈环

Wrapper 启动后仍应看到 Boot 4.1.0、Tomcat 8080 和 `Started TeamFlowApplication`，curl 仍应得到 404。
按 `Ctrl+C` 后，Maven 命令返回，curl 应连接失败。

IDEA 运行与 Wrapper 运行不是两个不同应用模型，它们只是两个启动入口。两边结果不一致时，优先比较：

```bash
java -version
./mvnw -version
```

再核对 IDEA 的 Project SDK、运行配置 JRE 和 Maven Runner JRE。不要通过反复点击运行制造更多并存进程。

### 3. TeamFlow 的两条输出串起启动过程

为了让自己的程序与框架日志容易区分，可以在 `run` 前后输出两条消息：

```java
System.out.println("TeamFlow 正在启动");
SpringApplication.run(TeamFlowApplication.class, args);
System.out.println("TeamFlow 服务准备就绪");
```

第一条发生在 Boot 启动前；`run` 返回时应用已经完成启动，所以第二条出现在 Started 附近或之后。它们
只用于本地观察，不代替 Tomcat、Started、HTTP 请求和停止后的端口验证。

## 五、JDK 25 与 Java 8 必须使用独立工程

### 1. 入口代码相同，框架基线不同

JDK 25 与 Java 8 都支持传统 `public static void main(String[] args)`，因此本课两版入口源码相同。真正
的差异位于构建合同：

| 对比项 | JDK 25 主线 | Java 8 兼容线 |
| --- | --- | --- |
| Spring Boot | 4.1.0 | 2.7.18 |
| Web starter | `spring-boot-starter-webmvc` | `spring-boot-starter-web` |
| POM Java 值 | `25` | `1.8` |
| Maven 最低版本 | 3.6.3 | 3.3 |
| Tomcat 日志常见格式 | `port 8080` | `port(s): 8080` |

Boot 4.1.0 至少需要 Java 17，不能在 Java 8 上运行。Java 8 项目必须放在独立目录并使用受支持的 Boot
2.7.18；不要把现代 POM 改一行 `<java.version>` 就称为兼容完成。

### 2. Java 8 工程的 IDEA 配置

打开兼容工程后，分别选择 Project SDK 8、Module SDK 8、运行配置 JRE 8 和 Maven Runner JRE 8，再
Reload Maven。终端还要执行：

```bash
mvn -version
```

其中 `Java version` 应显示 `1.8`。如果本机只安装 JDK 25，不要为了本课擅自下载或改系统配置；可以先
阅读完整兼容工程，待有隔离的 Java 8 环境时运行。

### 3. 不把新旧 starter 混在一起

Boot 4.1.0 官方首应用使用 `spring-boot-starter-webmvc`，Boot 2.7.18 官方入门使用
`spring-boot-starter-web`。两个名字对应各自发布线的依赖组织方式，不应在同一个 POM 同时添加，也不应
脱离 Boot 版本互换。

## 六、常见启动错误

下面的错误只处理“首个应用能否启动并被确认”，不会扩张成配置、映射或完整错误定位课程。

### 六个典型启动错误

:::pitfalls
### Boot 4 工程实际使用了 Java 8

**触发条件：** Project SDK 显示 25，但 Maven Runner JRE、运行配置或终端 `JAVA_HOME` 仍指向 JDK 8。

**原因：** IDEA、Maven 和终端可以各自选择 Java；Boot 4.1.0 至少需要 Java 17，Java 8 不满足运行基线。

**后果：** Maven 解析或编译失败，或者启动时出现版本不支持、class version 不兼容等错误，应用不会监听端口。

**错误示例：**

```text
Project SDK: 25
Maven Runner JRE: 8
```

**正确写法：**

```text
Project SDK: 25
Module SDK: Project SDK
Run configuration JRE: 25
Maven Runner JRE: Project JDK 25
```

**验证方式：** `./mvnw -version` 的 Java version 为 25，IDEA 控制台显示 Boot 4.1.0 和 Started，8080
能够返回预期 404。

### 只加入普通 Web 库或漏选 Spring Web

**触发条件：** Initializr 未选择 Spring Web，或手工把 Boot Web starter 写成普通 `spring-web` 依赖。

**原因：** 普通库不等于 Boot Web starter，缺少由 starter 带入并参与自动配置的内嵌服务器组合。

**后果：** 应用可能显示 banner 和 Started 后立即结束，控制台没有 Tomcat started，8080 也无法连接。

**错误示例：**

```xml
<dependency>
  <groupId>org.springframework</groupId>
  <artifactId>spring-web</artifactId>
</dependency>
```

**正确写法：**

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-webmvc</artifactId>
</dependency>
```

**验证方式：** Boot 4.1.0 的依赖解析成功，日志包含 Tomcat 8080 与 Started，进程保持运行直到主动停止。

### 在错误目录执行 Maven 命令

**触发条件：** 在解压目录的上一级或另一个工程目录执行 `./mvnw spring-boot:run`。

**原因：** Maven 从当前工程读取 POM，Wrapper 脚本也属于生成它的那个项目。

**后果：** 命令找不到 POM、找不到 Wrapper，或者成功启动了另一个应用，观察到的类名与版本都不属于 TeamFlow。

**错误示例：**

```bash
cd workspace
./mvnw spring-boot:run
```

**正确写法：**

```bash
cd workspace/teamflow-api
./mvnw spring-boot:run
```

**验证方式：** 当前目录同时包含 `pom.xml` 和 Wrapper，控制台明确显示 `Started TeamFlowApplication`。

### 重复启动导致 8080 被占用

**触发条件：** 一个 TeamFlow 实例仍在运行，又从 IDEA 或终端启动第二个实例。

**原因：** 两个进程不能同时监听同一个地址的 8080 端口。

**后果：** 新实例报告 port already in use 并启动失败；此时 curl 仍可能命中旧实例，造成“失败日志与成功响应”并存。

**错误示例：**

```text
Web server failed to start. Port 8080 was already in use.
继续把 curl 的 404 当成新实例响应
```

**正确写法：**

```text
先停止旧运行配置并确认 curl 连接失败
再启动唯一实例并等待 Started
```

**验证方式：** 停止旧实例后 curl 非零退出；重新启动后只出现一个 TeamFlow 进程，404 在 Started 之后出现。

### 把本课的 404 当成启动失败

**触发条件：** 日志已经显示 Tomcat 与 Started，但访问 `/` 得到 404 后立刻修改端口或重复重启。

**原因：** 404 表示请求到达服务器后没有匹配资源；本课刻意还没有编写请求映射。

**后果：** 学习者会混淆“服务器没有启动”和“服务器已启动但没有接口”，并可能提前复制后续 Controller 代码。

**错误示例：**

```text
curl 状态：404
结论：Spring Boot 没启动
```

**正确写法：**

```text
Tomcat started + Started TeamFlowApplication + 当前根路径 404
结论：应用已启动，接口尚未定义
```

**验证方式：** 运行期间固定得到 404；主动停止后同一 curl 连接失败。两个结果必须来自同一个实例生命周期。

### Java 8 工程只切 SDK 而未切 Boot 基线

**触发条件：** 把 Boot 4.1.0 工程的 IDEA Project SDK 改为 8，却保留现代 parent 和 starter。

**原因：** Java 兼容由 JDK、Spring Boot、starter、POM 编译目标和构建运行时共同决定。

**后果：** 项目无法构建或启动；即使编辑器暂时只显示少量错误，也没有形成可运行的 Java 8 合同。

**错误示例：**

```xml
<version>4.1.0</version>
<java.version>1.8</java.version>
<artifactId>spring-boot-starter-webmvc</artifactId>
```

**正确写法：**

```xml
<version>2.7.18</version>
<java.version>1.8</java.version>
<artifactId>spring-boot-starter-web</artifactId>
```

**验证方式：** 在独立目录中用 JDK 8 的 `mvn -version`、Boot 2.7.18 日志、Tomcat 8080、预期 404 和
停止后的连接失败完成全套检查。
:::

**社区补充：** 社区真实案例记录了“应用启动后立即结束”，最终原因是只使用普通 Web 依赖而没有 Boot
Web starter。本课只把它作为排查线索；现代与 Java 8 工程应使用哪个 artifact，仍分别以 Boot 4.1.0 和
2.7.18 官方文档为准。

## 七、JDK 25 完整 TeamFlow 程序

### 1. 准备完整 POM

在独立目录 `teamflow-api-jdk25` 中放置以下 `pom.xml`。这是一个可直接构建的完整主程序工程，不依赖
后续 Controller、配置或数据库：

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
    <relativePath />
  </parent>

  <groupId>com.teamflow</groupId>
  <artifactId>teamflow-api-jdk25</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <name>teamflow-api-jdk25</name>
  <description>TeamFlow 首个 Spring Boot 应用</description>

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

parent 提供 Boot 的 Maven 默认值和依赖管理；starter 引入当前 Web 运行组合；plugin 提供
`spring-boot:run` 等构建能力。三者职责不同，不要在依赖上手工补一组 Spring 或 Tomcat 版本。

### 2. 创建完整入口类

创建 `src/main/java/com/teamflow/TeamFlowApplication.java`：

```java
package com.teamflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * TeamFlow 的 Spring Boot 应用入口。
 */
@SpringBootApplication
public class TeamFlowApplication {
    /**
     * 启动 TeamFlow 应用并输出启动边界。
     *
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        System.out.println("TeamFlow 正在启动");
        SpringApplication.run(TeamFlowApplication.class, args);
        System.out.println("TeamFlow 服务准备就绪");
    }
}
```

类名与文件名都为 `TeamFlowApplication`。入口所在包是 `com.teamflow`，后续 TeamFlow Web 类会放在它的
包或子包中；本课不提前创建这些类。

### 3. 配置 IDEA 并运行

1. Project SDK、Module SDK、运行配置 JRE 与 Maven Runner JRE 都选择 JDK 25。
2. Reload Maven，确认 parent 和 starter 没有红色解析错误。
3. 运行 `TeamFlowApplication.main`，或在含 POM 的目录执行 `mvn spring-boot:run`。
4. 等待控制台出现 Tomcat 8080、Started 和 TeamFlow 就绪消息。
5. 在第二个终端请求根路径，确认 404。
6. 停止应用，再确认同一请求连接失败。

关键输出片段如下，时间、PID 和部分日志顺序可能不同：

```text
TeamFlow 正在启动
:: Spring Boot :: (v4.1.0)
Tomcat started on port 8080 (http)
Started TeamFlowApplication
TeamFlow 服务准备就绪
```

HTTP 核对命令与预期输出：

```bash
curl --silent --output /dev/null --write-out '%{http_code}\n' http://localhost:8080/
```

```text
404
```

JVM 进入 `main` 后先输出“正在启动”，随后 `run` 建立应用并启动 Tomcat；`run` 返回后输出“服务准备
就绪”。404 表示服务器已接收请求。停止进程后的连接失败证明刚才的响应来自本次生命周期，而非静态文本。

## 八、Java 8 完整兼容程序

### 1. 使用独立的兼容 POM

在另一个目录 `teamflow-api-java8` 创建以下完整 `pom.xml`，不要覆盖现代工程：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.7.18</version>
    <relativePath />
  </parent>

  <groupId>com.teamflow</groupId>
  <artifactId>teamflow-api-java8</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <name>teamflow-api-java8</name>
  <description>TeamFlow Java 8 兼容启动工程</description>

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

### 2. 使用完整的 Java 8 入口

创建 `src/main/java/com/teamflow/TeamFlowApplication.java`。传统入口与两条字符串输出在 Java 8 中完全
合法，因此这里仍给出完整源码，而不是写“同现代版”：

```java
package com.teamflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * TeamFlow 的 Java 8 Spring Boot 应用入口。
 */
@SpringBootApplication
public class TeamFlowApplication {
    /**
     * 启动 Java 8 兼容应用并输出启动边界。
     *
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        System.out.println("TeamFlow 正在启动");
        SpringApplication.run(TeamFlowApplication.class, args);
        System.out.println("TeamFlow 服务准备就绪");
    }
}
```

### 3. 配置、运行与观察

1. Project SDK、Module SDK、运行配置 JRE 和 Maven Runner JRE 全部选择 JDK 8。
2. Reload Maven，并执行 `mvn -version` 确认 Java version 为 `1.8`。
3. 从 IDEA 运行 main，或在工程根目录执行 `mvn spring-boot:run`。
4. 等待 Boot 2.7.18、Tomcat 8080、Started 和 TeamFlow 就绪消息。
5. 请求根路径得到 404，然后停止进程并确认连接失败。

关键输出片段：

```text
TeamFlow 正在启动
:: Spring Boot :: (v2.7.18)
Tomcat started on port(s): 8080 (http)
Started TeamFlowApplication
TeamFlow 服务准备就绪
```

请求命令和预期状态仍是：

```bash
curl --silent --output /dev/null --write-out '%{http_code}\n' http://localhost:8080/
```

```text
404
```

两版的 Java 启动形式和本课反馈环相同，差异集中在受支持的 Boot 版本、starter、POM Java 值与实际
构建 JDK。这里不涉及 Spring Boot 接口功能差异。

## 九、独立练习

### 1. 建立项目管理应用外壳

:::exercise
### 启动 TeamFlow 项目模块

**要求：** 在独立目录创建 Maven Web 工程，artifact 使用 `teamflow-projects`，入口类使用
`TeamFlowProjectsApplication`。在 `SpringApplication.run` 前输出“项目模块正在启动”，返回后输出
“项目模块准备就绪”。不得添加 Controller、配置项、端口修改、数据库或其他依赖。

**验收：** JDK 25 工程使用 Boot 4.1.0 和 `spring-boot-starter-webmvc`；Java 8 工程使用 Boot 2.7.18 和
`spring-boot-starter-web`。两版都出现对应 Boot 版本、Tomcat 8080、Started、两条自定义消息；运行期间
根路径返回 404，停止后 curl 连接失败。
:::

### 2. JDK 25 参考实现

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
    <relativePath />
  </parent>
  <groupId>com.teamflow</groupId>
  <artifactId>teamflow-projects</artifactId>
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

`src/main/java/com/teamflow/TeamFlowProjectsApplication.java`：

```java
package com.teamflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * TeamFlow 项目模块的 Spring Boot 入口。
 */
@SpringBootApplication
public class TeamFlowProjectsApplication {
    /**
     * 启动项目模块并输出启动边界。
     *
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        System.out.println("项目模块正在启动");
        SpringApplication.run(TeamFlowProjectsApplication.class, args);
        System.out.println("项目模块准备就绪");
    }
}
```

### 3. Java 8 参考实现

Java 8 练习也使用独立目录。完整 `pom.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.7.18</version>
    <relativePath />
  </parent>
  <groupId>com.teamflow</groupId>
  <artifactId>teamflow-projects-java8</artifactId>
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

`src/main/java/com/teamflow/TeamFlowProjectsApplication.java`：

```java
package com.teamflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * TeamFlow 项目模块的 Java 8 Spring Boot 入口。
 */
@SpringBootApplication
public class TeamFlowProjectsApplication {
    /**
     * 启动 Java 8 项目模块并输出启动边界。
     *
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        System.out.println("项目模块正在启动");
        SpringApplication.run(TeamFlowProjectsApplication.class, args);
        System.out.println("项目模块准备就绪");
    }
}
```

### 4. 核对完整结果

两版运行期间都执行：

```bash
curl --silent --output /dev/null --write-out '%{http_code}\n' http://localhost:8080/
```

预期的稳定结果是：

```text
项目模块正在启动
Tomcat started on port 8080
Started TeamFlowProjectsApplication
项目模块准备就绪
HTTP 状态：404
停止后：curl 连接失败
```

Java 8 的 Tomcat 行可能显示 `port(s): 8080`。验收不比较耗时、PID 或完整日志，只核对版本、端口、
入口类、自定义消息、404 和停止结果。

## 十、保留清晰的下一步边界

### 1. 当前已经得到可运行的 Web 外壳

TeamFlow 现在有受版本约束的 Maven 工程、标准入口、内嵌 Tomcat 和完整的启动/停止反馈环。它已经是
Spring Boot Web 应用，但还不是可调用的任务 API。根路径 404 正好记录了这个边界。

### 2. 不在首个应用里提前堆功能

不要为了消除 404 就复制一整套 Controller，也不要修改端口、添加环境文件、Bean、请求参数或统一响应。
接下来先学习配置与环境，再学习依赖注入和请求映射；每一步都建立在本课这个可重复启动的工程上。

## 累计项目衔接

本课的启动外壳在 `demos/teamflow-complete-delivery` 中由两版根包下的 `dev.teamflow.TeamFlowApplication`
承接。课程独立工程继续只验证启动与停止；累计项目在同一入口上逐课增加后续能力，不把最终 Controller 提前
复制回本课。
