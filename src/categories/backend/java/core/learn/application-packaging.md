---
id: backend.java.learn.intermediate.application-packaging
type: lesson
title: 应用打包
summary: 用 Maven package 和 Spring Boot Maven Plugin 生成可运行 JAR，读懂归档结构，并验证启动参数与 HTTP 反馈
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 150
prerequisites:
  - backend.java.learn.intermediate.health-checks-and-graceful-shutdown
objectives:
  - 能说明 Maven package 生命周期中编译、测试、普通 JAR 和 Spring Boot repackage 的先后关系。
  - 能区分普通 JAR、可执行 Spring Boot JAR 和 `.jar.original`，并从归档内容判断自己拿到的是哪一种产物。
  - 能解释 `META-INF/MANIFEST.MF` 中 `Main-Class`、`Start-Class`、`BOOT-INF/classes` 和 `BOOT-INF/lib` 的职责。
  - 能在不使用父 POM 时显式绑定 `spring-boot-maven-plugin` 的 `repackage` 目标。
  - 能正确排列 `java` 的 JVM 参数、`-jar`、JAR 文件名和应用参数，并验证两类参数确实被不同位置处理。
  - 能在 JDK 25 / Spring Boot 4.1.1 主线和 Java 8 / Spring Boot 2.3.12.RELEASE 兼容线分别打包并启动同一个 Web 入口。
  - 能从 `no main manifest attribute`、找错 `.original` 和插件未执行等现象定位打包问题。
recap:
  - "`package` 会依次完成编译、测试和归档；Spring Boot 的 `repackage` 在普通 JAR 形成后把应用类和依赖放进可执行布局。"
  - 使用 `spring-boot-starter-parent` 时插件已经配置了 `repackage` 执行；不用父 POM 时必须在插件中显式声明 goal。
  - 可执行 JAR 的 `Main-Class` 是 Boot loader，`Start-Class` 才是应用入口；应用类在 `BOOT-INF/classes`，依赖在 `BOOT-INF/lib`。
  - 默认被改名为 `.jar.original` 的文件是重打包前的普通 JAR，通常没有可供 `java -jar` 使用的 `Main-Class`。
  - JVM 选项放在 `-jar` 之前，JAR 文件名之后的内容才进入 `main(String[] args)`；参数位置错误会表现为 JVM 或应用配置缺失。
  - Boot 4.1.1 的 `JarLauncher` 位于 `org.springframework.boot.loader` 下的 `launch` 包，Boot 2.3.12 的同名类直接位于 `org.springframework.boot.loader` 包，两版应用代码可以保持相同。
related:
  - backend.java.learn.intermediate.health-checks-and-graceful-shutdown
tags:
  - Java
  - Spring Boot
  - Maven
  - JAR
  - repackage
  - Main-Class
  - Start-Class
  - 应用打包
appliesTo: JDK 25 / Spring Boot 4.1.1 主线；Java 8 / Spring Boot 2.3.12.RELEASE 兼容线
verifiedAt: 2026-08-30
sources:
  - id: spring-boot-maven-packaging
    title: Spring Boot Maven Plugin Packaging
    url: https://docs.spring.io/spring-boot/maven-plugin/packaging.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot Maven Plugin 4.1.x
    claims:
      - "`repackage` 在 package 阶段形成的普通归档上工作，并把应用改造成可执行归档。"
      - "`spring-boot-starter-parent` 默认配置了 repackage 执行。"
      - 插件管理可执行归档的 Main-Class 和 Start-Class，原始归档默认改名为 `.original`。
  - id: spring-boot-executable-jar-format
    title: Spring Boot Executable Jar Format
    url: https://docs.spring.io/spring-boot/specification/executable-jar/index.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Spring Boot 4.1.x
    claims:
      - 可执行 JAR 使用 Boot loader 启动嵌套归档。
      - 应用类默认位于 `BOOT-INF/classes`，依赖归档默认位于 `BOOT-INF/lib`。
  - id: spring-boot-2312-maven-plugin
    title: Spring Boot 2.3.12 Maven Plugin Reference
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/maven-plugin/reference/html/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Boot 2.3.12 的 Maven Plugin 支持 repackage、Main-Class、Start-Class 和 `.original`。
      - Boot 2.3.12 的默认 JAR launcher 类名为 `org.springframework.boot.loader.JarLauncher`。
  - id: spring-boot-2312-executable-format
    title: Spring Boot 2.3.12 Executable Jar Format
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/appendix-executable-jar-format.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Boot 2.3.12 的可执行 JAR 使用 `BOOT-INF/classes` 与 `BOOT-INF/lib` 布局。
      - Boot 2.3.12 的 launcher 位于 `org.springframework.boot.loader` 包。
  - id: maven-build-lifecycle
    title: Introduction to the Build Lifecycle
    url: https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Apache Maven 3.x
    claims:
      - "`package` 会把编译代码打成可分发格式，例如 JAR。"
      - default 生命周期会按顺序执行 validate、compile、test、package 等阶段。
  - id: java-command-jdk25
    title: The java Command
    url: https://docs.oracle.com/en/java/javase/25/docs/specs/man/java.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: JDK 25
    claims:
      - "`java [options] -jar jarfile [args ...]` 是使用 JAR 启动应用的命令形态。"
      - JAR 后的参数传入 `main`，`-D` 等 JVM 选项应位于 `-jar` 之前。
  - id: jar-command-jdk25
    title: The jar Command
    url: https://docs.oracle.com/en/java/javase/25/docs/specs/man/jar.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: JDK 25
    claims:
      - "`jar` 可以列出归档条目并操作 `META-INF/MANIFEST.MF`。"
      - JAR 是保留相对目录结构的 ZIP 格式归档。
  - id: maven-surefire-skipping-tests
    title: Skipping Tests - Maven Surefire Plugin
    url: https://maven.apache.org/surefire/maven-surefire-plugin/examples/skipping-tests.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Maven Surefire Plugin 3.x
    claims:
      - "`-DskipTests` 会跳过测试执行但仍编译测试；`maven.test.skip=true` 还会跳过测试编译。"
---

# 应用打包

源代码能在 IDE 中运行，不等于交付目录里已经有一个可启动的应用。部署时通常只拿到一个版本化文件，启动命令、
归档结构和入口类都必须能够独立解释。本课把“代码变成 JAR”拆成可以观察的步骤：先看 Maven 生命周期，再看
Spring Boot 如何重写归档，最后用 `java -jar` 和 HTTP 请求验证真正的产物。

放到 TeamFlow 教学项目中，本课会分别为现代线和兼容线后端生成带版本号的可执行 JAR，并建立从 Manifest、
`java -jar` 到 HTTP 响应的交付检查。`/package-info` 只是观察启动参数的教学探针，不改变 TeamFlow 现有业务 API 合同。

本课使用 JDK 25 / Spring Boot 4.1.1 作为主线，Java 8 / Spring Boot 2.3.12.RELEASE 只保留打包工具和 launcher
名称的真实差异。分层 JAR、镜像、Buildpacks、容器和发布流水线不在本课范围。

## 一、从 package 产出可交付文件

### 1. package 是一条有顺序的生命周期

执行 `mvn package` 时，Maven 从 default 生命周期的起点执行到 `package`。对一个普通 Web 工程，关键阶段可以画成：

```text
validate -> compile -> test -> package
                              |
                              +-> jar:jar 生成普通 JAR
                              +-> spring-boot:repackage 改造成可执行 JAR
```

`compile` 只产生 `target/classes`；`test` 运行测试；`jar:jar` 把这些 class 和资源放进普通归档。Spring Boot Maven
Plugin 的 `repackage` 必须在普通 JAR 已形成后执行，它才能把应用类、依赖和 Boot loader 重新组织到同一个可执行文件。
因此只看到 `compile` 成功，不能推出已经有可运行的交付物。

`mvn package` 默认会执行测试。临时诊断可以使用 `-DskipTests` 跳过测试执行，但测试代码仍然会编译；这不是交付前
长期替代测试的配置。`-Dmaven.test.skip=true` 连测试编译也跳过，只有在明确知道后果时才使用。

### 2. 父 POM 与显式插件绑定承担不同责任

使用 `spring-boot-starter-parent` 时，Spring Boot 已经在父 POM 中配置了 `repackage` 执行。子项目通常只需声明插件：

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>
    </plugin>
  </plugins>
</build>
```

如果项目不能继承这个父 POM，插件不会因为依赖存在就自动执行。此时需要明确绑定目标；版本应与项目 Spring Boot 版本
保持一致：

```xml
<plugin>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-maven-plugin</artifactId>
  <version>4.1.1</version>
  <executions>
    <execution>
      <goals>
        <goal>repackage</goal>
      </goals>
    </execution>
  </executions>
</plugin>
```

这里的 `<execution>` 是 Maven 生命周期绑定；直接执行 `mvn package spring-boot:repackage` 则是在生成普通 JAR 后手工调用
重打包目标。两者都能运行插件，但只有绑定到构建生命周期时，团队成员和 CI 执行普通 `mvn package` 才能稳定得到
同一种产物。

### 3. 先确认文件身份再运行

默认构建目录通常有两个文件：

```text
target/
├── packaging-feedback-1.0.0.jar
└── packaging-feedback-1.0.0.jar.original
```

没有 classifier 时，插件会用可执行归档替换主 JAR，并把重打包前的普通 JAR 改名为 `.jar.original`。`.original` 不是
“备用的可执行版本”，它通常只有应用自己的 class 和普通 Manifest，不能使用 `java -jar` 直接启动。

用 `jar` 或 `unzip` 检查归档比凭文件名猜测可靠：

```bash
jar tf target/packaging-feedback-1.0.0.jar | sed -n '1,12p'
unzip -p target/packaging-feedback-1.0.0.jar META-INF/MANIFEST.MF
```

看到 `BOOT-INF/classes/`、`BOOT-INF/lib/` 和 Boot loader 类，且 Manifest 有 `Main-Class` 与 `Start-Class`，才说明拿到
的是 Spring Boot 可执行 JAR。

## 二、读懂可执行 JAR 的启动模型

### 1. Main-Class 与 Start-Class 是两次跳转

普通 Java `-jar` 启动时，JVM 先读取 Manifest 的 `Main-Class`，并调用这个类的 `main` 方法。Spring Boot 可执行 JAR
把 `Main-Class` 设为 Boot loader，而不是业务入口；loader 负责建立能读取嵌套 JAR 的 classpath，再根据 `Start-Class` 找到
真正的 `PackagingApplication`：

```text
java -jar packaging-feedback-1.0.0.jar
  -> Main-Class: org.springframework.boot.loader.launch.JarLauncher
  -> 读取 Start-Class: dev.teamflow.packaging.PackagingApplication
  -> SpringApplication.run(...)
```

在 Boot 4.1.1 中，JAR launcher 是 `org.springframework.boot.loader.launch.JarLauncher`；Boot 2.3.12 的兼容 launcher
是 `org.springframework.boot.loader.JarLauncher`。这是 loader 包路径的版本差异，不要求业务入口改名。

### 2. BOOT-INF 目录表达 classpath

可执行 JAR 不是把所有依赖的 class 平铺到根目录，而是保留可识别的目录边界：

| 路径 | 内容 | 启动时的作用 |
| --- | --- | --- |
| `META-INF/MANIFEST.MF` | 入口和 Spring Boot 归档元数据 | 找到 loader 与应用入口 |
| `BOOT-INF/classes/` | 本项目编译出来的 class 和资源 | 应用自己的 classpath |
| `BOOT-INF/lib/` | starter、Spring、Web 服务器等依赖 JAR | 应用依赖的嵌套 classpath |
| `org/springframework/boot/loader/` | Boot loader 类 | 读取嵌套归档并启动应用 |

因此 `jar tf` 的列表既是排错工具，也是对交付内容的快速审计。只看到根目录下的应用 class，通常意味着你检查的是
`.jar.original` 或普通 JAR，而不是最后的可执行文件。

### 3. 归档内容和 Java 版本要匹配

JDK 25 主线的 POM 使用 `<java.version>25</java.version>`，Boot 4.1.1 要求现代 JDK；Java 8 兼容工程使用
`<java.version>8</java.version>` 和 Boot 2.3.12.RELEASE。两套工程都可以保留相同的 `main` 方法和 Controller，差异
来自 Spring Boot 版本及其 loader，而不是把业务代码写成两套不相干的程序。

切换工程时同时核对 Project SDK、模块 SDK、Maven Runner JRE、POM 目标和依赖版本。只切换 IDE 的 SDK 不能把已经由 Maven
解析的 parent、plugin 和依赖自动换成另一条兼容线。

## 三、让启动命令的参数各就各位

### 1. `-jar` 前后是两种参数空间

JDK 25 的命令形态是：

```text
java [JVM options] -jar jarfile [application args]
```

例如下面的命令把 `delivery.jvm` 放入 JVM 系统属性，把 `delivery.label` 作为 Spring Boot 应用属性：

```bash
java -Ddelivery.jvm=modern \
  -jar target/packaging-feedback-1.0.0.jar \
  --delivery.label=from-command-line
```

`-Ddelivery.jvm=modern` 在 `-jar` 之前，JVM 启动时就创建系统属性；`--delivery.label=...` 在 JAR 文件名之后，Spring
Boot 将它作为应用环境属性。Controller 同时读取两者，返回 `label=from-command-line;jvm=modern`，这比只观察进程
“启动成功”更能证明参数位置正确。

把 `-D` 写在 JAR 文件名之后，Boot loader 会把它当作应用参数，而不是 JVM 选项；把 `--delivery.label` 写在 `-jar` 之前，
JVM 会尝试解析一个它不认识的启动选项。遇到参数问题先按命令形态重新分段。

### 2. 用环境和配置文件表达稳定值

稳定的默认值可以放进 `application.properties`，部署时用环境变量或命令行覆盖。命令行参数优先级属于 Spring Boot 配置
主题，本课只用它来验证启动位置；不要把密码、token 或连接串直接写进 shell 历史和课程示例。

```properties
server.port=8080
delivery.label=from-default
```

没有传 `--delivery.label` 时，接口返回 `from-default`；传入后只覆盖该属性。JVM 系统属性 `delivery.jvm` 则仍由 `-D`
控制，两种值的来源应该在反馈结果中保持可区分。

### 3. 先验证归档，再验证 HTTP

推荐的最小反馈环如下：

```bash
mvn -B package
unzip -p target/packaging-feedback-1.0.0.jar META-INF/MANIFEST.MF
java -Ddelivery.jvm=modern -jar target/packaging-feedback-1.0.0.jar --delivery.label=from-cli
curl -fsS http://127.0.0.1:8080/package-info
```

如果 Manifest 或目录结构不对，不要继续把 HTTP 失败归因于 Controller。先确认运行的是同一个 `target` 文件，且没有把
`.jar.original` 复制成部署文件。

## 四、练习：交付一个可验证的 JAR

:::exercise
### 为任务服务生成并验证可执行归档

**要求：** 创建现代与 Java 8 两个独立 Maven 工程，工程都提供 `dev.teamflow.packaging.PackagingApplication`，并暴露
`GET /package-info`。现代工程使用 JDK 25、Spring Boot 4.1.1；兼容工程使用 Java 8、Spring Boot 2.3.12.RELEASE。两套
POM 都要声明 `spring-boot-maven-plugin`，父 POM 可复用默认 repackage 配置；若不使用父 POM，必须显式绑定 `repackage`。
执行 `mvn -B package`，检查主 JAR 的 Manifest、`BOOT-INF/classes`、`BOOT-INF/lib` 和 `.jar.original`。启动时把
`-Ddelivery.jvm` 放在 `-jar` 之前，把 `--delivery.label` 放在 JAR 文件名之后。不要把密码或真实连接信息写进配置。

**验收：** 两版都生成 `packaging-feedback-1.0.0.jar` 与 `.jar.original`；主 JAR 的 `Start-Class` 为
`dev.teamflow.packaging.PackagingApplication`，现代线 `Main-Class` 为 `org.springframework.boot.loader.launch.JarLauncher`，
兼容线为 `org.springframework.boot.loader.JarLauncher`。两版执行 `curl /package-info` 分别返回
`label=from-modern-app;jvm=modern` 和 `label=from-legacy-app;jvm=legacy`。对 `.jar.original` 执行 `java -jar` 时稳定得到
`no main manifest attribute`，并能说明它为什么不是交付文件。

**参考答案：** 下文的现代线和 Java 8 兼容线完整实现就是一个可运行的参考答案。
:::

## 五、集中排查常见错误

以下错误都围绕“你运行的文件到底由谁启动、从哪里加载依赖”展开。先记录命令和实际文件名，再读取 Manifest，不要只
凭 IDE 的运行按钮判断。

### 六个典型错误

:::pitfalls
### 运行 `.jar.original` 而不是可执行 JAR

**触发条件：** 把 `target/packaging-feedback-1.0.0.jar.original` 复制到部署目录，然后执行 `java -jar`。

**原因：** `.jar.original` 是 repackage 前的普通 JAR，只有根目录下的应用 class，没有 Boot loader 和可执行 `Main-Class`。

**后果：** JVM 报 `no main manifest attribute`，或应用依赖无法从 `BOOT-INF/lib` 加载。

**错误示例：**

```bash
java -jar target/packaging-feedback-1.0.0.jar.original
```

**正确写法：**

```bash
java -jar target/packaging-feedback-1.0.0.jar
```

**影响版本：** Spring Boot 2.3.12 与 4.1.x；默认主归档被替换时都会保留 `.original`。

**验证方式：** 分别执行 `unzip -p ... META-INF/MANIFEST.MF` 和 `jar tf ...`，确认主 JAR 有 `Main-Class`、`Start-Class`、
`BOOT-INF/classes`、`BOOT-INF/lib`，而 `.original` 没有这些可执行布局。

### 只声明插件却没有绑定 repackage

**触发条件：** 不继承 `spring-boot-starter-parent`，只在 `<plugins>` 中声明插件，然后执行 `mvn package`。

**原因：** 插件依赖存在不代表目标已经绑定到 Maven 生命周期；普通 `jar:jar` 可能是唯一产物。

**后果：** 构建显示成功，但交付文件没有 Boot loader，部署时出现没有入口或依赖找不到。

**错误示例：**

```xml
<plugin>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-maven-plugin</artifactId>
</plugin>
```

**正确写法：**

```xml
<plugin>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-maven-plugin</artifactId>
  <version>4.1.1</version>
  <executions>
    <execution>
      <goals><goal>repackage</goal></goals>
    </execution>
  </executions>
</plugin>
```

**影响版本：** 未继承 `spring-boot-starter-parent` 且没有其他父 POM 或插件管理显式绑定 `repackage` 的 Spring Boot 工程。

**验证方式：** 用 `mvn -B package` 检查日志中出现 `spring-boot:...:repackage`，再读取主 JAR 的 Manifest 和 `BOOT-INF`；
如果只看到 `jar:jar`，先修复生命周期绑定。

### 手工覆盖 Main-Class 让 loader 失去入口

**触发条件：** 在 `maven-jar-plugin` 中把 `Main-Class` 固定为业务类，或复制另一版本的 launcher 类名。

**原因：** Spring Boot 插件需要同时管理 `Main-Class` 和 `Start-Class`；布局与 launcher 是一组契约，不能只改其中一项。

**后果：** 业务类被直接调用时无法读取嵌套依赖，或者 Java 8 与 Boot 4.1 使用了不匹配的 loader 包路径。

**错误示例：**

```xml
<archive>
  <manifest><mainClass>dev.teamflow.packaging.PackagingApplication</mainClass></manifest>
</archive>
```

**正确写法：**

```xml
<plugin>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-maven-plugin</artifactId>
  <configuration><mainClass>dev.teamflow.packaging.PackagingApplication</mainClass></configuration>
</plugin>
```

**影响版本：** Spring Boot 2.3.12 与 4.1.x；两版默认 launcher 包名不同，但都由 Boot 插件管理入口。

**验证方式：** 重新执行 `mvn -B package`，确认主 JAR 的 `Main-Class` 是对应 Boot loader、`Start-Class` 是应用入口，并用
`java -jar` 发起 `/package-info` 请求；两者不匹配时不要靠手工替换 Manifest 修复。

### 把 JVM 选项放到 JAR 文件名之后

**触发条件：** 执行 `java -jar target/packaging-feedback-1.0.0.jar -Ddelivery.jvm=modern`，并期待应用读取系统属性。

**原因：** `-jar` 后的参数属于应用参数，JVM 不会把它们重新解释成系统属性。

**后果：** `System.getProperty("delivery.jvm", "missing")` 返回 `missing`，应用可能把本应由 JVM 设置的开关当成普通业务参数。

**错误示例：**

```bash
java -jar target/packaging-feedback-1.0.0.jar -Ddelivery.jvm=modern
```

**正确写法：**

```bash
java -Ddelivery.jvm=modern -jar target/packaging-feedback-1.0.0.jar
```

**影响版本：** Java 8 与 JDK 25 的 `java -jar` 命令都遵守这个参数边界。

**验证方式：** 请求 `/package-info`，确认 `jvm=modern`；再把 `-D` 移到 JAR 名称之后复现 `jvm=missing`，说明差异来自
`java` 命令的参数边界。

### 用错误的 JDK 启动归档

**触发条件：** 用 Java 8 启动为 JDK 25 编译的现代 JAR，或只在 IDEA 中切换 SDK 没有重跑 Maven。

**原因：** class 文件版本和 Spring Boot 运行时要求由构建时目标决定；IDE 的项目设置不能改变已经写入的 class 和依赖。

**后果：** 可能先得到 `UnsupportedClassVersionError`，或因为 Boot 4.1 要求较新的 Java API 而启动失败。

**错误示例：**

```bash
LEGACY_JDK=/path/to/jdk8
"$LEGACY_JDK/bin/java" -jar modern/target/packaging-feedback-1.0.0.jar
```

**正确写法：**

```bash
# 现代线使用 JDK 25；兼容线使用 Java 8 工程单独构建的 JAR
MODERN_JDK=/path/to/jdk-25
LEGACY_JDK=/path/to/jdk8
"$MODERN_JDK/bin/java" -jar modern/target/packaging-feedback-1.0.0.jar
"$LEGACY_JDK/bin/java" -jar legacy/target/packaging-feedback-1.0.0.jar
```

**影响版本：** JDK 25 编译的现代归档不能由 Java 8 运行；Boot 4.1.x 本身也不支持 Java 8。

**验证方式：** 在两个独立输出目录执行各自的 `mvn -B package`。先重复错误命令，确认退出码非零且输出包含
`UnsupportedClassVersionError`；再记录两版 `java -version`、POM 的 `java.version` 和 Manifest 的
`Build-Jdk-Spec`，最后用对应 JDK 启动各自 JAR 并发起 HTTP 请求。

### 只看构建退出码，不验证实际 HTTP 反馈

**触发条件：** 看到 `BUILD SUCCESS` 就把 JAR 上传，未读取 Manifest、未启动进程，也未请求业务入口。

**原因：** Maven 成功只证明生命周期完成，不证明部署时选中了正确文件、参数位置正确或应用能监听目标端口。

**后果：** 错误产物、错误配置或错误端口会在交付后才暴露，排查范围从构建目录扩大到运行环境。

**错误示例：**

```bash
mvn -B package
echo "上传 target/*.jar"
```

**正确写法：**

```bash
(
  set -eu
  APP_PID=
  cleanup() {
    EXIT_CODE=$?
    trap - EXIT
    if [ -n "$APP_PID" ]; then
      kill "$APP_PID" 2>/dev/null || true
      wait "$APP_PID" 2>/dev/null || true
    fi
    exit "$EXIT_CODE"
  }
  trap cleanup EXIT

  mvn -B package
  unzip -p target/packaging-feedback-1.0.0.jar META-INF/MANIFEST.MF
  java -Ddelivery.jvm=modern -jar target/packaging-feedback-1.0.0.jar --delivery.label=from-cli &
  APP_PID=$!
  RESPONSE=$(curl -fsS --retry 20 --retry-connrefused --retry-delay 1 \
    http://127.0.0.1:8080/package-info)
  printf '%s\n' "$RESPONSE"
  test "$RESPONSE" = 'label=from-cli;jvm=modern'
)
```

**影响版本：** 所有使用 Maven 与 Spring Boot Maven Plugin 生成部署归档的版本线。

**验证方式：** 记录 Manifest、归档关键路径、启动日志和 `/package-info` 返回值；关闭进程后再确认没有复用旧的 target
文件。这样反馈环同时覆盖构建、启动和 HTTP 三个边界。
:::

## 六、现代线完整实现

### 1. Maven 工程和默认配置

在 IntelliJ IDEA 中把 Project SDK、模块 SDK 和 Maven Runner JRE 设为 JDK 25。使用父 POM 时，`spring-boot-maven-plugin`
的 `repackage` 会随 `package` 自动执行。目录如下：

```text
packaging-modern/
├── pom.xml
└── src/main/
    ├── java/dev/teamflow/packaging/PackagingApplication.java
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
    <version>4.1.1</version>
    <relativePath />
  </parent>
  <groupId>dev.teamflow</groupId>
  <artifactId>packaging-feedback</artifactId>
  <version>1.0.0</version>
  <properties>
    <java.version>25</java.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
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
server.port=8080
delivery.label=from-default
```

### 2. 入口和可观察反馈

创建 `PackagingApplication.java`：

```java
package dev.teamflow.packaging;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class PackagingApplication {

    @Value("${delivery.label:missing}")
    private String label;

    /**
     * 启动打包反馈应用。
     *
     * @param args 应用参数
     */
    public static void main(String[] args) {
        SpringApplication.run(PackagingApplication.class, args);
    }

    /**
     * 返回应用参数和 JVM 系统属性，帮助观察启动命令的边界。
     *
     * @return 参数反馈文本
     */
    @GetMapping("/package-info")
    public String packageInfo() {
        return "label=" + label + ";jvm=" + System.getProperty("delivery.jvm", "missing");
    }
}
```

`main` 方法接收的是 JAR 文件名之后的参数；`@Value` 读取 Spring Boot 环境属性；`System.getProperty` 读取 JVM 在
`-jar` 之前创建的系统属性。三者被放进一个短响应，便于不依赖日志猜测配置来源。

### 3. 构建、检查和启动

在工程根目录执行：

```bash
mvn -B package
unzip -p target/packaging-feedback-1.0.0.jar META-INF/MANIFEST.MF
jar tf target/packaging-feedback-1.0.0.jar | rg 'BOOT-INF/(classes|lib)|org/springframework/boot/loader/launch/JarLauncher'
java -Ddelivery.jvm=modern -jar target/packaging-feedback-1.0.0.jar --delivery.label=from-modern-app
```

另开终端请求：

```bash
curl -fsS http://127.0.0.1:8080/package-info
```

预期响应为：

```text
label=from-modern-app;jvm=modern
```

实际验证的 Boot 4.1.1 Manifest 关键行如下：

```text
Main-Class: org.springframework.boot.loader.launch.JarLauncher
Start-Class: dev.teamflow.packaging.PackagingApplication
Spring-Boot-Classes: BOOT-INF/classes/
Spring-Boot-Lib: BOOT-INF/lib/
Spring-Boot-Version: 4.1.1
```

## 七、Java 8 兼容线完整实现

### 1. 独立 POM 目标

在 IntelliJ IDEA 中为这个工程单独设置 Project SDK、模块 SDK 和 Maven Runner JRE 为 Java 8，并执行 Maven Reload。
不能复用现代工程的 `target` 目录。目录结构与现代线相同，但 parent 和 Java 目标不同：

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
    <relativePath />
  </parent>
  <groupId>dev.teamflow</groupId>
  <artifactId>packaging-feedback</artifactId>
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

父 POM 同样负责把 `repackage` 接入 `package`。这里没有为了兼容 Java 8 添加现代语法；入口类、配置键和 HTTP 路径
都保持相同，学习者可以直接比较打包工具产生的归档差异。

### 2. 兼容入口和启动

创建同名的 `src/main/java/dev/teamflow/packaging/PackagingApplication.java`，代码与现代线相同：

```java
package dev.teamflow.packaging;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class PackagingApplication {

    @Value("${delivery.label:missing}")
    private String label;

    /**
     * 启动 Java 8 打包反馈应用。
     *
     * @param args 应用参数
     */
    public static void main(String[] args) {
        SpringApplication.run(PackagingApplication.class, args);
    }

    /**
     * 返回应用参数和 JVM 系统属性。
     *
     * @return 参数反馈文本
     */
    @GetMapping("/package-info")
    public String packageInfo() {
        return "label=" + label + ";jvm=" + System.getProperty("delivery.jvm", "missing");
    }
}
```

使用 Java 8 工程自己的 JAR 启动：

```bash
(
  set -eu
  APP_PID=
  cleanup() {
    EXIT_CODE=$?
    trap - EXIT
    if [ -n "$APP_PID" ]; then
      kill "$APP_PID" 2>/dev/null || true
      wait "$APP_PID" 2>/dev/null || true
    fi
    exit "$EXIT_CODE"
  }
  trap cleanup EXIT

  mvn -B package
  unzip -p target/packaging-feedback-1.0.0.jar META-INF/MANIFEST.MF
  LEGACY_JDK=/path/to/jdk8
  "$LEGACY_JDK/bin/java" -Ddelivery.jvm=legacy \
    -jar target/packaging-feedback-1.0.0.jar --delivery.label=from-legacy-app &
  APP_PID=$!
  RESPONSE=$(curl -fsS --retry 20 --retry-connrefused --retry-delay 1 \
    http://127.0.0.1:8080/package-info)
  printf '%s\n' "$RESPONSE"
  test "$RESPONSE" = 'label=from-legacy-app;jvm=legacy'
)
```

预期响应为：

```text
label=from-legacy-app;jvm=legacy
```

实际验证的 Boot 2.3.12 Manifest 关键行如下：

```text
Main-Class: org.springframework.boot.loader.JarLauncher
Start-Class: dev.teamflow.packaging.PackagingApplication
Spring-Boot-Classes: BOOT-INF/classes/
Spring-Boot-Lib: BOOT-INF/lib/
Spring-Boot-Version: 2.3.12.RELEASE
```

### 3. 两条版本线的观察结论

两版都会有主 JAR 和 `.jar.original`，应用 class 和依赖的相对位置相同，启动命令的参数分界也相同。需要记住的真实
差异只有版本工具链和 launcher 包路径：

| 项目 | JDK 25 / Boot 4.1.1 | Java 8 / Boot 2.3.12.RELEASE |
| --- | --- | --- |
| `Main-Class` | `org.springframework.boot.loader.launch.JarLauncher` | `org.springframework.boot.loader.JarLauncher` |
| `Start-Class` | `dev.teamflow.packaging.PackagingApplication` | `dev.teamflow.packaging.PackagingApplication` |
| 应用 class | `BOOT-INF/classes/` | `BOOT-INF/classes/` |
| 依赖 JAR | `BOOT-INF/lib/` | `BOOT-INF/lib/` |
| `.original` | 普通 JAR，无 Boot 入口 | 普通 JAR，无 Boot 入口 |

不要把现代 launcher 的全限定类名写进 Java 8 的部署脚本，也不要因为两版目录相同就认为它们可以互换运行。每个 JAR
应由匹配的 JDK 和对应 Spring Boot 依赖启动。

## 八、把失败反馈归还给正确边界

### 1. 从 Manifest 回到构建配置

`no main manifest attribute` 说明 JVM 在它实际读取的归档中找不到 `Main-Class`。第一步是确认文件路径和文件名：

```bash
pwd
ls -l target/*.jar
unzip -p target/packaging-feedback-1.0.0.jar META-INF/MANIFEST.MF
```

如果输出的是 `.jar.original`，问题是选错文件；如果主 JAR 也没有 `Main-Class`，再检查 `mvn package` 是否执行了
`repackage`，以及当前 POM 是否真的继承了预期 parent。

### 2. 从归档路径回到 classpath

如果 Manifest 正确但出现 `ClassNotFoundException`，检查应用类是否在 `BOOT-INF/classes`、依赖是否在 `BOOT-INF/lib`，
以及是否用 `maven-jar-plugin` 或手工脚本覆盖了 Spring Boot 插件生成的布局。不要用把依赖全部解压到根目录的办法“修复”一个
不匹配的可执行 JAR；先恢复单一的 repackage 来源。

### 3. 从启动反馈回到参数位置

接口返回 `jvm=missing` 时，先看 `-Ddelivery.jvm` 是否位于 `-jar` 前；返回默认 label 时，再看 `--delivery.label` 是否
位于 JAR 文件名后。只有参数位置正确后，才有必要继续查 Spring Boot 的配置优先级。这样可以把 JVM 解析问题和应用配置
问题分开验证。

## 九、本课小结

应用打包不是把文件压缩一下，而是把生命周期、入口和依赖布局固定成一个能在目标 JDK 中启动的归档。`mvn package`
先形成普通 JAR，`repackage` 再加入 Boot loader、`BOOT-INF/classes`、`BOOT-INF/lib` 和对应 Manifest。主 JAR 才是
交付文件，`.jar.original` 只是重打包前的对照物。

当启动失败时，按“实际文件 → Manifest → 归档路径 → JDK 版本 → 参数位置 → HTTP 反馈”的顺序排查。Boot 4.1.1 与
2.3.12 的 launcher 包名不同，但业务入口和主要归档布局可以相同；版本差异应留在 POM、loader 和运行环境边界中。
