---
id: backend.java.learn.intermediate.spring-boot-and-configuration
type: lesson
title: 配置与环境
summary: 使用 Spring Boot 外部化配置和 Environment 观察默认值、覆盖顺序、profile 与外部配置位置
domain: backend
technology: java
module: core
stage: intermediate
level: beginner
estimatedMinutes: 110
prerequisites:
  - backend.java.learn.intermediate.first-spring-boot-web-api
objectives:
  - 能在 application.properties 中写出 TeamFlow 的最小配置并读取默认值。
  - 能使用 Environment.getProperty 读取属性、提供读取默认值，并理解缺失属性的结果。
  - 能按文件、环境变量、Java 系统属性和命令行参数的教学顺序验证覆盖关系。
  - 能用 application-{profile}.properties、spring.profiles.active 和 Environment 观察 profile。
  - 能区分 spring.config.location 的替换语义与 spring.config.additional-location 的追加语义。
  - 能在 IntelliJ IDEA、Maven Wrapper 和终端分别核对 JDK、参数和配置文件位置。
  - 能在 JDK 25 / Spring Boot 4.1.0 与 Java 8 / Spring Boot 2.7.18 工程中运行同一配置观察程序。
  - 能避免把真实秘密写入代码、配置文件、命令记录或控制台输出。
recap:
  - application.properties 提供默认配置，Environment 是程序读取最终属性值的入口。
  - 本课演示的覆盖顺序是配置文件、环境变量、Java 系统属性、命令行参数，后者覆盖前者。
  - application-{profile}.properties 在对应 profile 激活时覆盖基础文件；文件名中的连接号不能写成点号。
  - spring.config.location 替换默认搜索位置，spring.config.additional-location 保留默认位置并追加目录。
  - IDEA 项目 JDK、Maven Runner JRE 和终端 JDK 可能不同，必须分别核对。
  - Java 8 兼容线使用 Boot 2.7.18 和传统 Java 语法；本课涉及的配置读取方式与现代线保持一致。
related:
  - backend.java.learn.intermediate.first-spring-boot-web-api
  - backend.java.learn.basics.maven-project-model
  - backend.java.learn.intermediate.dependency-injection-and-bean-lifecycle
tags:
  - Spring Boot
  - 配置
  - Environment
  - profile
  - TeamFlow
appliesTo: JDK 25 与 Spring Boot 4.1.0 主线；Java 8 与 Spring Boot 2.7.18 兼容工程
verifiedAt: 2026-08-18
sources:
  - id: boot-external-config-41
    title: 'Externalized Configuration :: Spring Boot'
    url: https://docs.spring.io/spring-boot/reference/features/external-config.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - 配置可以来自 properties 文件、操作系统环境变量、Java 系统属性和命令行参数。
      - 后加载的 PropertySource 可以覆盖先加载的值；外部配置位置和 profile 文件遵循明确的搜索顺序。
      - spring.config.location 替换默认位置，spring.config.additional-location 保留默认位置并追加位置。
      - 环境变量的 Binder canonical 名称由点号替换下划线、删除连接号并转为大写。
      - properties 文件中的占位符可以使用 ${name:default} 形式提供默认值。
  - id: boot-profiles-41
    title: 'Profiles :: Spring Boot'
    url: https://docs.spring.io/spring-boot/reference/features/profiles.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims:
      - application-{profile}.properties 是 profile-specific 配置文件的默认命名形式。
      - spring.profiles.active 可以激活一个或多个 profile，profile 文件覆盖基础配置。
      - 多个 profile 同时激活时，后列出的 profile 可以覆盖先列出的 profile。
  - id: boot-external-config-2718
    title: Spring Boot 2.7.18 - Externalized Configuration
    url: https://docs.spring.io/spring-boot/docs/2.7.18/reference/html/features.html#features.external-config
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.7.18
    claims:
      - Java 8 兼容线同样支持从文件、环境变量、系统属性和命令行读取外部化配置。
      - Java 8 兼容线支持 profile-specific 文件和外部配置位置覆盖。
  - id: boot-system-requirements-2718
    title: Spring Boot 2.7.18 - System Requirements
    url: https://docs.spring.io/spring-boot/docs/2.7.18/reference/html/getting-started.html#getting-started-system-requirements
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.7.18 and Java 8
    claims:
      - Spring Boot 2.7.18 支持 Java 8，并使用 Spring Framework 5.3.31 或更高兼容版本。
  - id: spring-environment-41
    title: Environment API
    url: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/core/env/Environment.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - Environment 可以读取 active profiles，并继承属性解析能力。
  - id: spring-property-resolver-41
    title: PropertyResolver API
    url: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/core/env/PropertyResolver.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - getProperty 在属性不存在时返回 null，带默认值的重载返回调用者给出的默认值。
      - getRequiredProperty 在属性不存在时抛出 IllegalStateException。
  - id: spring-context-41
    title: ConfigurableApplicationContext API
    url: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/context/ConfigurableApplicationContext.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - ConfigurableApplicationContext.getEnvironment() 返回应用使用的环境对象。
  - id: spring-system-environment-41
    title: SystemEnvironmentPropertySource API
    url: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/core/env/SystemEnvironmentPropertySource.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 直接通过 Environment 查询时，系统环境属性支持点号、下划线和大小写等效查找。
  - id: owasp-secrets-management
    title: Secrets Management Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html
    sourceOrigin: official
    sourceType: security-standard
    appliesTo: OWASP Secrets Management guidance
    claims:
      - 环境变量和容器 ENV 不是自动安全的秘密存储，应避免把真实秘密写入代码或日志。
---

# 配置与环境

TeamFlow 的程序代码应该保持不变，而本地、测试和生产环境可以使用不同的消息、区域或开关。Spring Boot
把这些变化放进外部配置，再在启动时组装成应用使用的环境。本课先用一个很小的配置观察程序建立这条
反馈环：写默认值，启动并观察；再用环境变量、`-D` 和命令行参数覆盖同一个键，最后加入 profile 和外部
配置目录。

这里的“配置”只表示启动时读到的属性，不展开依赖注入、结构化绑定、自动配置条件或 Web 接口。示例使用
TeamFlow 的消息和区域作为可读的假值；真实密码、令牌和连接串永远不放进课程代码或输出。

## 一、先把默认配置放在文件中

### 1. application.properties 是启动时的默认输入

在 Spring Boot 工程的 `src/main/resources` 下创建 `application.properties`：

```properties
teamflow.message=TeamFlow-default
teamflow.region=${TEAMFLOW_REGION:local}
teamflow.base-only=classpath
```

第一行定义一个普通字符串，第二行使用占位符：如果运行时提供 `TEAMFLOW_REGION`，就使用它；否则使用
`local`。第三行只用来证明基础文件已经被加载。

启动时，Boot 会把 classpath 根目录、classpath 的 `config` 目录以及当前目录下的配置目录纳入默认搜索
位置。后面的同名属性可以覆盖前面已经读到的值，因此项目内的文件适合作为安全的默认值，而不是存放
生产秘密的地方。

### 2. 用 Environment 读取最终值

`SpringApplication.run` 返回的上下文提供 `getEnvironment()`。`Environment` 读取的是已经合并过属性源的
结果，而不是只读取某一个文件：

```java
ConfigurableApplicationContext context = SpringApplication.run(
        TeamFlowConfigurationApplication.class, args);
Environment environment = context.getEnvironment();

String message = environment.getProperty("teamflow.message", "未配置消息");
String region = environment.getProperty("teamflow.region", "未配置区域");
System.out.println(message + " / " + region);
context.close();
```

如果没有额外输入，输出是：

```text
TeamFlow-default / local
```

`getProperty` 的第一个参数是键，第二个参数是“键不存在时使用的读取默认值”。它不会改变配置文件，也
不会把默认值写回环境。属性键建议在示例中保持小写点号形式；环境变量写法在后面单独核对。

### 3. 区分不存在、读取默认值和必需属性

Framework 的 `PropertyResolver` 还提供两个有明确结果的形式：

```java
String missing = environment.getProperty("teamflow.missing");
String fallback = environment.getProperty("teamflow.missing", "fallback");
String required = environment.getRequiredProperty("teamflow.message");
```

在当前配置下，`missing` 是 `null`，`fallback` 是 `fallback`，而 `required` 能得到消息文本。如果对一个
确实不存在的键调用 `getRequiredProperty`，会抛出 `IllegalStateException`。本课只用这个 API 观察配置，
不把异常处理扩展成单独的错误分类课程。

## 二、逐层观察覆盖顺序

### 1. 四层教学顺序

Spring Boot 支持的完整属性源比本课多；为了先建立可操作的心智模型，我们固定观察下面四层：

```text
application.properties < 操作系统环境变量 < Java 系统属性 < 命令行参数
```

`<` 表示右侧能够覆盖左侧的同名键，不表示命令行的书写顺序。用默认文件的
`teamflow.message=TeamFlow-default` 做基线，依次运行以下命令：

```bash
java -jar teamflow-config.jar
TEAMFLOW_MESSAGE=env-message java -jar teamflow-config.jar
TEAMFLOW_MESSAGE=env-message java -Dteamflow.message=system-message -jar teamflow-config.jar
TEAMFLOW_MESSAGE=env-message java -Dteamflow.message=system-message -jar teamflow-config.jar --teamflow.message=cli-message
```

预期的 `message` 依次是：

```text
TeamFlow-default
env-message
system-message
cli-message
```

观察结果说明同一个键有多个来源时，较高优先级来源胜出。`-D` 必须放在 `-jar` 之前，因为它是 Java
启动器选项；`--teamflow.message` 是传给 Spring Boot 的命令行属性。

### 2. 环境变量名称要按使用层次核对

对不含连接号的键，本课使用直观的映射：`teamflow.message` 对应 `TEAMFLOW_MESSAGE`，
`teamflow.region` 对应 `TEAMFLOW_REGION`。在 Spring Boot Binder 的规范命名中，点号替换为下划线、
连接号删除、字母转大写；因此带连接号的键不能机械地把连接号也换成下划线。

直接调用 `Environment.getProperty` 时，Framework 的 `SystemEnvironmentPropertySource` 还会尝试点号、
下划线、大小写等效形式。这个 direct lookup 规则和结构化 Binder 的命名规则不是同一层 API，本课不使用
带连接号的环境变量作为主流程，以免把两套规则混成一句口诀。

### 3. 占位符的默认值只在缺少输入时生效

`teamflow.region=${TEAMFLOW_REGION:local}` 的结果可以用两次运行观察：

```bash
env -u TEAMFLOW_REGION java -jar teamflow-config.jar
TEAMFLOW_REGION=cn java -jar teamflow-config.jar
```

两次输出的 `region` 分别是 `local` 和 `cn`。占位符默认值是读取阶段的回退值；它不是系统环境变量，
也不会覆盖外部注入的真实值。

## 三、profile 与外部配置位置

### 1. profile 文件用连接号命名

在 `src/main/resources` 旁边新增 `application-dev.properties`：

```properties
teamflow.message=TeamFlow-dev
teamflow.profile-note=dev-file
```

使用 `--teamflow.message` 之外的启动参数激活 profile：

```bash
java -jar teamflow-config.jar --spring.profiles.active=dev
```

此时 `teamflow.message` 来自 `application-dev.properties`，`teamflow.profile-note` 也能被读取。
文件名中的分隔符是连接号；`application.dev.properties` 不会按默认约定成为 `dev` 的 profile 文件。

### 2. 观察 active profile 与默认 profile

```java
String[] activeProfiles = environment.getActiveProfiles();
System.out.println("profiles=" + Arrays.toString(activeProfiles));
```

显式激活 `dev` 时，输出包含 `dev`。没有显式激活 profile 时，Boot 可以使用默认 profile 处理配置，但
`getActiveProfiles()` 返回的是显式激活数组，不能把教学文本 `default` 当成它一定返回的字符串。

多个 profile 可以按顺序激活：

```bash
java -jar teamflow-config.jar --spring.profiles.active=dev,local
```

如果 `application-dev.properties` 和 `application-local.properties` 都定义同一个键，后列的 `local`
覆盖先列的 `dev`。因此 profile 顺序也是配置合同的一部分。

### 3. location 替换默认位置

在 jar 外建立目录 `replace-config`，其中的 `application.properties` 只有：

```properties
teamflow.message=来自替换目录
teamflow.region=replace
```

从 jar 所在目录运行：

```bash
java -jar teamflow-config.jar --spring.config.location=file:./replace-config/
```

`spring.config.location` 指定了新的搜索位置，默认位置不再自动参与本次查找，所以只存在于 classpath
基础文件中的 `teamflow.base-only` 会变成缺失。目录值末尾的 `/` 很重要，它表示一个目录而不是一个固定
文件。

### 4. additional-location 追加默认位置

在另一个目录 `additional-config` 中放置：

```properties
teamflow.message=来自追加目录
teamflow.region=additional
```

运行：

```bash
java -jar teamflow-config.jar --spring.config.additional-location=file:./additional-config/
```

这次 classpath 的 `application.properties` 仍然加载，所以 `teamflow.base-only` 仍可读；追加目录中较高
优先级的同名键覆盖默认消息。记忆方法是：`location` 换掉，`additional-location` 加上。

## 四、把 IDEA、Maven 和终端核对成同一条反馈环

### 1. IntelliJ IDEA 中核对项目 JDK

打开工程后依次检查：

1. 在 Project Structure 的 Project 页面把 Project SDK 设为 JDK 25，Language level 与项目要求保持一致。
2. 在 Modules 页面确认模块 SDK 没有单独指向旧 JDK。
3. 在 Run/Debug Configurations 中确认运行配置的 JRE 使用 Project SDK，并把 `--spring.profiles.active=dev`
   等参数放入 Program arguments。
4. 在 Maven 设置中确认 Runner 的 JRE 也是 JDK 25，再 Reload All Maven Projects。

点击主类旁的运行按钮后，控制台应看到观察程序自己的 `message`、`region` 和 `profiles` 输出。这个输出
来自最终 Environment，不是 IDEA 编辑器里打开的某个文件的静态预览。

### 2. Maven Wrapper 与终端分别核对

在包含 `pom.xml` 和 `mvnw` 的工程根目录执行：

```bash
./mvnw -version
./mvnw clean package
java -jar target/teamflow-config-0.0.1-SNAPSHOT.jar --teamflow.message=cli-message
```

`./mvnw -version` 输出中的 Java version 是 Maven Runner 实际使用的 JDK；`java -jar` 使用的却是当前终端
的 `java`。两者版本可以不同，因此还要单独执行：

```bash
java -version
javac -version
```

若 `java -version` 是 25 而 `./mvnw -version` 显示 8，说明构建和直接运行不是同一套 JDK；先在 IDEA、
Wrapper 和终端分别改正，再比较配置输出。

### 3. 传参时看清三种位置

下表只比较本课用到的参数位置：

| 写法 | 由谁读取 | 典型用途 |
| --- | --- | --- |
| `TEAMFLOW_MESSAGE=...` | 操作系统环境 | 当前进程及其子进程的外部输入 |
| `-Dteamflow.message=...` | Java 启动器与系统属性 | 启动 Java 时固定一项属性 |
| `--teamflow.message=...` | Spring Boot 命令行属性 | 运行某次应用时临时覆盖 |

不要把 `-D` 写到 `--` 后面，也不要把 IDEA 的 Program arguments 当成终端的 JVM options。每次只改变一层，
再观察输出，才能知道是哪一层覆盖了前一层。

## 五、Java 25 与 Java 8 的配置工程

### 1. 现代线与兼容线各自使用完整基线

JDK 25 主线使用 Spring Boot 4.1.0，最低 Java 要求是 17；Java 8 不能只在 IDEA 中切换 Project SDK 后
继续使用同一个 Boot 4 POM。兼容工程需要单独目录、Spring Boot 2.7.18 parent、Java 8 编译属性和对应
的 starter。两条线在本课使用的 `Environment` API 包名和外部配置规则一致，但构建基线必须分开。

Java 8 不支持现代语言语法时，代码采用两版都能工作的传统类和
`public static void main(String[] args)` 入口。下面的完整程序会分别给出，不能用“同上”替代。

### 2. IDEA 切换兼容工程的正确顺序

1. 为 Java 8 工程单独打开目录，不要把 Boot 4 工程的 `target` 或 POM 复制过去。
2. Project SDK、Module SDK、运行配置 JRE 与 Maven Runner JRE 全部选择 JDK 8。
3. Reload All Maven Projects，确认 parent 为 2.7.18，依赖没有 Boot 4 的坐标。
4. 在兼容工程根目录运行 `./mvnw -version` 和 `java -version`，两处都应显示 Java 8。
5. 再运行主类，使用同样的配置文件、profile 和覆盖参数核对输出。

### 3. 配置文件不等于秘密存储

默认属性可以提交，真实秘密不能提交。不要把密码、访问令牌或生产连接串写入 `application.properties`、
profile 文件、Docker `ENV`、命令历史或 `System.out.println`。环境变量只是注入入口，可能被其他进程、日志
或诊断转储看到；它不是自动加密的保险箱。本课只使用 `demo-message`、`cn` 这类假值验证来源。

## 六、常见配置错误

下面的错误集中在“看到什么、为什么、怎样改、如何验证”四件事上，不扩展为完整错误诊断课程。

:::pitfalls
### 已设置 JDK，但终端仍显示旧版本

**触发条件：** IDEA 的 Project SDK 已选择 JDK 25，但终端执行 `java -version` 仍显示 Java 8 或旧版本。

**原因：** IDEA 的项目设置不会自动修改当前 shell 的 PATH 或 JAVA_HOME；不同终端窗口也可能加载不同配置。

**后果：** `java -jar` 使用旧 JDK，输出和 Maven 构建结果与 IDEA 不一致，甚至无法运行现代工程。

**错误示例：**

```text
IDEA Project SDK: 25
终端 java -version: 1.8
```

**正确写法：**

```bash
java -version
javac -version
./mvnw -version
```

**验证方式：** 三个命令分别显示预期 JDK；再用同一 jar 执行一次，确认程序输出来自本次启动。

### java 可用但 javac 不可用

**触发条件：** `java -version` 成功，而 `javac -version` 报命令不存在或不是内部命令。

**原因：** 当前 PATH 可能只指向 JRE 或只找到某个运行时，未指向完整 JDK 的 `bin` 目录。

**后果：** 能运行现成 jar，却不能编译课程源码；IDEA 也可能因为没有完整 SDK 而无法完成 Maven 构建。

**错误示例：**

```text
java -version  -> 25
javac -version -> command not found
```

**正确写法：** 在终端和 IDEA 的 SDK 设置中选择完整 JDK 目录，并重新打开终端后执行：

```bash
java -version
javac -version
```

**验证方式：** `javac -version` 成功显示同一主版本，再执行 `./mvnw clean package`，确认源码真的被编译。

### 把 spring.config.location 当成追加目录

**触发条件：** 只在外部目录放了 `teamflow.message`，却期望 classpath 中的 `teamflow.base-only` 仍然存在。

**原因：** `spring.config.location` 会替换默认搜索位置；保留默认位置并增加外部目录应使用
`spring.config.additional-location`。

**后果：** 低优先级基础属性缺失，程序可能使用读取默认值，导致“外部配置已经追加”的判断错误。

**错误示例：**

```bash
java -jar teamflow-config.jar --spring.config.location=file:./additional-config/
```

**正确写法：**

```bash
java -jar teamflow-config.jar --spring.config.additional-location=file:./additional-config/
```

**验证方式：** `location` 运行中 `teamflow.base-only` 缺失，`additional-location` 运行中它仍为 `classpath`，
且两次的 `teamflow.message` 都来自外部目录。

### profile 文件名写成点号

**触发条件：** 激活 `dev` 后，文件名写成 `application.dev.properties`，基础消息却没有变化。

**原因：** 默认 profile-specific 文件命名是 `application-dev.properties`；点号不是这里的分隔符。

**后果：** 该文件不会按默认约定加载，学习者误以为 `spring.profiles.active` 或覆盖顺序失效。

**错误示例：**

```text
application.dev.properties
```

**正确写法：**

```text
application-dev.properties
```

**验证方式：** 使用 `--spring.profiles.active=dev`，输出包含 `teamflow.profile-note=dev-file`，并看到消息
变为开发配置。

### IDEA、Maven 和终端使用不同 JDK 或参数

**触发条件：** IDEA 运行显示一个结果，`./mvnw spring-boot:run` 或 `java -jar` 显示另一个结果。

**原因：** Project SDK、Maven Runner JRE、运行配置 JRE 和终端 `java` 是相互独立的入口；参数也分别放在
JVM options、Program arguments 和 shell 环境中。

**后果：** 修改了错误的配置文件或 JDK，问题在另一个入口重复出现，无法判断真正的最终属性来源。

**错误示例：**

```text
IDEA: -Dteamflow.message=idea
终端: --teamflow.message=terminal
```

**正确写法：** 先分别核对版本，再把同一参数明确放入对应入口；每次只改一层。

```bash
java -version
./mvnw -version
java -jar teamflow-config.jar --teamflow.message=terminal
```

**验证方式：** 三个入口在相同输入下打印相同 `message`；有意改变一层时，只有该层及更高优先级结果变化。

### 把真实秘密写进配置或输出

**触发条件：** 为了确认读取成功，把真实密码、令牌或连接串直接写入 properties、命令历史或控制台。

**原因：** “能被 Environment 读取”不等于“适合公开保存”；环境变量、日志和诊断转储都可能被其他主体看到。

**后果：** 秘密进入 Git、终端历史或构建日志后难以撤回，造成凭据泄露。

**错误示例：**

```properties
teamflow.database-password=production-password
```

**正确写法：** 仓库只保留假值或空缺键，运行时注入环境变量，程序只输出非敏感状态：

```properties
teamflow.database-password=
```

**验证方式：** 检查 `git diff`、命令记录和控制台，只出现 `demo-*` 假值；真实凭据不在课程目录和日志中。
:::

## 七、JDK 25 完整 TeamFlow 配置程序

### 1. 完整 POM 与配置文件

在独立目录 `teamflow-config-jdk25` 创建以下 `pom.xml`。它使用 Boot 基础 starter，不启动 Web 服务器，
这样可以专注观察配置结果：

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
  <artifactId>teamflow-config-jdk25</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <properties>
    <java.version>25</java.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter</artifactId>
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

创建 `src/main/resources/application.properties`：

```properties
teamflow.message=TeamFlow-default
teamflow.region=${TEAMFLOW_REGION:local}
teamflow.base-only=classpath
```

创建 `src/main/resources/application-dev.properties`：

```properties
teamflow.message=TeamFlow-dev
teamflow.profile-note=dev-file
```

### 2. 创建完整入口类

创建 `src/main/java/com/teamflow/config/TeamFlowConfigurationApplication.java`：

```java
package com.teamflow.config;

import java.util.Arrays;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;

/**
 * TeamFlow 的配置观察程序入口。
 */
@SpringBootApplication
public class TeamFlowConfigurationApplication {
    /**
     * 启动 Spring 上下文并输出最终配置值。
     *
     * @param args Spring Boot 命令行参数
     */
    public static void main(String[] args) {
        ConfigurableApplicationContext context =
                SpringApplication.run(TeamFlowConfigurationApplication.class, args);
        try {
            Environment environment = context.getEnvironment();
            System.out.println("TeamFlow 配置观察器");
            System.out.println("message="
                    + environment.getProperty("teamflow.message", "未配置消息"));
            System.out.println("region="
                    + environment.getProperty("teamflow.region", "未配置区域"));
            System.out.println("profiles="
                    + Arrays.toString(environment.getActiveProfiles()));
            System.out.println("base-only="
                    + environment.getProperty("teamflow.base-only", "missing"));
            System.out.println("profile-note="
                    + environment.getProperty("teamflow.profile-note", "none"));
        } finally {
            context.close();
        }
    }
}
```

没有额外输入时，进入工程目录执行 `./mvnw clean package`，再运行：

```bash
java -jar target/teamflow-config-jdk25-0.0.1-SNAPSHOT.jar
```

预期输出：

```text
TeamFlow 配置观察器
message=TeamFlow-default
region=local
profiles=[]
base-only=classpath
profile-note=none
```

把 `TEAMFLOW_MESSAGE=env-message`、`-Dteamflow.message=system-message`、
`--teamflow.message=cli-message` 依次加入同一命令，可以看到只改变 `message`，其余输出保持不变。运行
`--spring.profiles.active=dev` 后，`profiles=[dev]`、`message=TeamFlow-dev`、
`profile-note=dev-file`。

### 3. IDEA 与 Maven 的运行步骤

1. 打开 `teamflow-config-jdk25` 的 `pom.xml`，Project SDK、Module SDK、运行配置 JRE 和 Maven Runner JRE
   都选择 JDK 25。
2. Reload Maven 项目，确认依赖来自 `spring-boot-starter`，不要自行补入 Web、数据库或测试依赖。
3. 运行 `TeamFlowConfigurationApplication.main`；需要 profile 时，在 Program arguments 填入
   `--spring.profiles.active=dev`。
4. 在工程根目录执行 `./mvnw clean package`，再执行上面的 `java -jar` 命令，对比 IDEA 与终端输出。
5. 用 `java -version`、`javac -version` 和 `./mvnw -version` 保存三处 JDK 证据。

## 八、Java 8 完整兼容程序

### 1. Java 8 POM 与配置文件

在独立目录 `teamflow-config-java8` 创建以下完整 `pom.xml`，不要覆盖 JDK 25 工程：

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
  <artifactId>teamflow-config-java8</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <properties>
    <java.version>1.8</java.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter</artifactId>
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

创建同样内容的 `src/main/resources/application.properties` 和 `application-dev.properties`：

```properties
teamflow.message=TeamFlow-default
teamflow.region=${TEAMFLOW_REGION:local}
teamflow.base-only=classpath
```

```properties
teamflow.message=TeamFlow-dev
teamflow.profile-note=dev-file
```

### 2. Java 8 完整入口类

创建 `src/main/java/com/teamflow/config/TeamFlowConfigurationApplication.java`。这里完整列出兼容代码，
不使用 record、var 或其他 Java 8 不支持的写法：

```java
package com.teamflow.config;

import java.util.Arrays;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;

/**
 * TeamFlow 的 Java 8 配置观察程序入口。
 */
@SpringBootApplication
public class TeamFlowConfigurationApplication {
    /**
     * 启动 Java 8 Spring 上下文并输出最终配置值。
     *
     * @param args Spring Boot 命令行参数
     */
    public static void main(String[] args) {
        ConfigurableApplicationContext context =
                SpringApplication.run(TeamFlowConfigurationApplication.class, args);
        try {
            Environment environment = context.getEnvironment();
            System.out.println("TeamFlow 配置观察器");
            System.out.println("message="
                    + environment.getProperty("teamflow.message", "未配置消息"));
            System.out.println("region="
                    + environment.getProperty("teamflow.region", "未配置区域"));
            System.out.println("profiles="
                    + Arrays.toString(environment.getActiveProfiles()));
            System.out.println("base-only="
                    + environment.getProperty("teamflow.base-only", "missing"));
            System.out.println("profile-note="
                    + environment.getProperty("teamflow.profile-note", "none"));
        } finally {
            context.close();
        }
    }
}
```

### 3. Java 8 IDEA 与终端步骤

1. 单独打开 `teamflow-config-java8`，Project SDK、Module SDK、运行配置 JRE 和 Maven Runner JRE 全部选择
   JDK 8。
2. Reload Maven，确认 POM parent 是 `2.7.18`，Java 属性是 `1.8`，没有 Boot 4 依赖。
3. 在终端执行 `java -version`、`javac -version` 和 `./mvnw -version`，三处都应指向 Java 8。
4. 执行 `./mvnw clean package`，再运行 `java -jar target/teamflow-config-java8-0.0.1-SNAPSHOT.jar`。
5. 使用 `TEAMFLOW_MESSAGE=env-message`、`-Dteamflow.message=system-message`、
   `--teamflow.message=cli-message` 和 `--spring.profiles.active=dev` 重复现代线的观察。

默认输出与现代线的五行文本相同：`message` 是 `TeamFlow-default`，`region` 是 `local`，`profiles` 是空
数组，`base-only` 是 `classpath`，`profile-note` 是 `none`。版本 banner 和编译 JDK 不同，但属性覆盖
结果相同。

## 九、独立练习与完整参考实现

### 1. 为 TeamFlow 增加通知模式配置

:::exercise
### 练习任务

**要求：** 在一个新的配置观察工程中增加 `teamflow.notice-mode` 和 `teamflow.notice-region` 两个键。
基础文件的值分别是 `silent` 和 `local`；新增 `application-dev.properties`，把模式改成 `console`。
程序必须通过 `Environment.getProperty` 输出这两个键和 active profiles。用环境变量
`TEAMFLOW_NOTICE_MODE`、系统属性 `teamflow.notice-mode`、命令行参数 `--teamflow.notice-mode` 依次覆盖
模式；不要引入 `@Value`、`@ConfigurationProperties`、Controller 或真实秘密。JDK 25 与 Java 8 各在自己
的目录完成一次。

**验收：** 无参数输出 `mode=silent`、`region=local`；激活 `dev` 后输出 `mode=console`；同一次运行同时
提供三种覆盖时输出命令行值；两个版本都能由 `./mvnw clean package` 构建并运行，且控制台没有密码、令牌或
连接串。
:::

### 2. JDK 25 参考实现

在 `teamflow-notice-jdk25` 中创建完整 `pom.xml`：

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
  <artifactId>teamflow-notice-jdk25</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <properties>
    <java.version>25</java.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter</artifactId>
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

在 `src/main/resources/application.properties` 写入：

```properties
teamflow.notice-mode=silent
teamflow.notice-region=${TEAMFLOW_NOTICE_REGION:local}
```

`src/main/resources/application-dev.properties`：

```properties
teamflow.notice-mode=console
```

创建 `src/main/java/com/teamflow/notice/TeamFlowNoticeApplication.java`：

```java
package com.teamflow.notice;

import java.util.Arrays;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;

/**
 * TeamFlow 通知模式练习的 JDK 25 入口。
 */
@SpringBootApplication
public class TeamFlowNoticeApplication {
    /**
     * 输出通知模式、区域和 profile。
     *
     * @param args Spring Boot 命令行参数
     */
    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(
                TeamFlowNoticeApplication.class, args);
        try {
            Environment environment = context.getEnvironment();
            System.out.println("mode="
                    + environment.getProperty("teamflow.notice-mode", "missing"));
            System.out.println("region="
                    + environment.getProperty("teamflow.notice-region", "missing"));
            System.out.println("profiles="
                    + Arrays.toString(environment.getActiveProfiles()));
        } finally {
            context.close();
        }
    }
}
```

构建并运行：

```bash
./mvnw clean package
java -jar target/teamflow-notice-jdk25-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev
```

预期输出：

```text
mode=console
region=local
profiles=[dev]
```

### 3. Java 8 参考实现

在 `teamflow-notice-java8` 中创建完整 `pom.xml`：

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
  <artifactId>teamflow-notice-java8</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <properties>
    <java.version>1.8</java.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter</artifactId>
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

配置文件内容与现代线相同。创建以下完整入口类：

```java
package com.teamflow.notice;

import java.util.Arrays;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;

/**
 * TeamFlow 通知模式练习的 Java 8 入口。
 */
@SpringBootApplication
public class TeamFlowNoticeApplication {
    /**
     * 输出 Java 8 通知模式、区域和 profile。
     *
     * @param args Spring Boot 命令行参数
     */
    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(
                TeamFlowNoticeApplication.class, args);
        try {
            Environment environment = context.getEnvironment();
            System.out.println("mode="
                    + environment.getProperty("teamflow.notice-mode", "missing"));
            System.out.println("region="
                    + environment.getProperty("teamflow.notice-region", "missing"));
            System.out.println("profiles="
                    + Arrays.toString(environment.getActiveProfiles()));
        } finally {
            context.close();
        }
    }
}
```

使用 JDK 8 的 IDEA Project SDK、Module SDK、运行 JRE 和 Maven Runner JRE，执行 `./mvnw clean package`，
再运行：

```bash
java -jar target/teamflow-notice-java8-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev
```

预期输出同样是：

```text
mode=console
region=local
profiles=[dev]
```

这里的“同样”只表示完整代码产生相同的属性观察结果；两个目录仍然使用各自的 POM、JDK 和 Spring Boot
版本，不能把一个工程的构建结果冒充另一个工程的验证。

## 十、把配置边界留在正确的位置

### 1. 本课已经完成的能力

你现在可以从默认 `application.properties` 开始，使用 Environment 读取最终值，逐层验证环境变量、系统
属性和命令行参数的覆盖关系，并用 profile 和外部目录切换配置来源。IDEA、Maven Wrapper 和终端也有了可
重复的 JDK 与参数核对步骤。

### 2. 暂时不要提前扩大配置模型

本课没有把每个键绑定成对象，也没有讨论 Bean 条件、注入、配置刷新、远程配置中心或秘密轮换。下一步遇到
这些需求时，应先保持本课的可观察反馈环：明确键、来源、最终值和安全边界，再学习对应的专门 API。
