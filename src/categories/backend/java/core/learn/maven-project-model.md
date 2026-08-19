---
id: backend.java.learn.basics.maven-project-model
type: lesson
title: Maven 项目与依赖
summary: 准备终端与 IntelliJ IDEA 的 Maven 环境，用 pom.xml 描述项目坐标、模块依赖和构建阶段，并验证一个最小多模块工程
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 75
prerequisites:
  - backend.java.learn.basics.breakpoint-debugging
objectives:
  - 能安装 Maven、配置 PATH，并从 mvn -version 读出 Maven 与实际使用的 JDK。
  - 能从 pom.xml 读出 modelVersion、GAV、packaging 和标准源码目录。
  - 能区分 dependencies、dependencyManagement、parent 和 modules 的职责。
  - 能为一个本地模块声明依赖，并用 dependency:tree 观察实际依赖关系。
  - 能区分 compile、test、runtime、provided 等常见 scope 的用途。
  - 能区分生命周期 phase 与插件 goal，并选择 clean、compile、test、package、verify 等常用命令。
  - 能在 IntelliJ IDEA 中导入、重载 Maven 项目，核对 Maven runner 的 JDK，并在 JDK 25 与 Java 8 中运行示例。
recap:
  - 终端 mvn 与 IDEA 内置 Maven 是两个入口；都要分别核对 Maven home 和实际使用的 Java。
  - POM 是 Maven 的项目模型；modelVersion 4.0.0 是 POM 模型版本，不是 Maven 主版本。
  - groupId、artifactId、version 构成 GAV；packaging 未写时默认为 jar。
  - dependencies 才会把依赖加入当前项目，dependencyManagement 只提供可继承的版本和默认信息。
  - parent 表示配置继承，modules 表示聚合构建；reactor 会按实际项目与构建关系排序，没有其他规则时才采用 modules 声明顺序。
  - phase 是生命周期阶段，goal 是插件提供的具体任务；执行较后的 phase 会顺序经过前面的 phase。
  - IDEA 的 Maven 项目模型需要从 pom.xml 同步；命令行成功而编辑器仍报红时，先重载项目并核对实际依赖树。
related: []
tags:
  - Java
  - Maven
  - POM
  - GAV
  - 依赖管理
  - 生命周期
  - IntelliJ IDEA
  - TeamFlow
appliesTo: Maven 3.9.x；JDK 25 主线；Java 8 配合 Maven Compiler Plugin 3.13.0 及以上使用 release=8
verifiedAt: 2026-08-16
sources:
  - id: maven-pom-introduction
    title: Introduction to the POM
    url: https://maven.apache.org/guides/introduction/introduction-to-the-pom.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Maven 3
    claims:
      - POM 是 Maven 的项目模型，最小 POM 需要 modelVersion、groupId、artifactId 和 version。
      - GAV 标识项目，packaging 未指定时默认为 jar，Super POM 提供默认配置。
      - parent 用于项目继承，POM 中还可以声明依赖、插件和构建配置。
  - id: maven-dependency-mechanism
    title: Introduction to the Dependency Mechanism
    url: https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Maven 3
    claims:
      - dependencies 声明项目实际使用的依赖，dependencyManagement 集中管理依赖信息但不自动引入依赖。
      - 依赖 scope 会影响传递性和不同 classpath 中的可见性。
      - 直接声明自己使用的依赖可以避免过度依赖某个传递依赖的偶然存在。
  - id: maven-build-lifecycle
    title: Introduction to the Build Lifecycle
    url: https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Maven 3
    claims:
      - Maven 内置 default、clean 和 site 生命周期，default 生命周期由有序 phase 组成。
      - plugin goal 是比 phase 更细的具体任务，可以绑定到 phase 或直接调用。
      - packaging 会影响 default 生命周期中的默认 goal 绑定。
  - id: maven-getting-started
    title: Maven Getting Started Guide
    url: https://maven.apache.org/guides/getting-started/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Maven 3
    claims:
      - Maven 使用 pom.xml 作为项目中心配置，并约定 src/main/java、src/test/java 和 target 等目录。
      - Maven 会从本地仓库和配置的远程仓库解析项目依赖。
  - id: maven-installation
    title: Installation - Apache Maven
    url: https://maven.apache.org/install.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Maven 3.9.x
    claims:
      - Maven 运行前需要可用的 JDK；手动安装时应解压二进制发行包，把 Maven 的 bin 目录加入 PATH。
      - 新终端中的 mvn -v 会显示 Maven home、Java version 和 Java home，可用于确认安装与 JDK 选择。
  - id: maven-compiler-release
    title: Setting the --release of the Java Compiler
    url: https://maven.apache.org/plugins/maven-compiler-plugin/examples/set-compiler-release.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Maven Compiler Plugin 3.13.0 及以上
    claims:
      - JDK 9 起 javac 原生支持 --release，能够同时约束语言级别、class 目标版本和可用的 Java SE API。
      - JDK 8 的 javac 没有 --release，但 Compiler Plugin 3.13.0 及以上配合默认 javac 时会把 release 属性转换为 source 和 target。
  - id: maven-multiple-modules
    title: Guide to Working with Multiple Modules
    url: https://maven.apache.org/guides/mini/guide-multiple-modules.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Maven 3
    claims:
      - reactor 会收集、排序并依次构建所选模块。
      - 排序会考虑项目依赖、插件声明、插件依赖和构建扩展；没有其他规则时才采用 modules 声明顺序。
      - dependencyManagement 与 pluginManagement 中尚未实际引用的管理项不会改变 reactor 顺序。
  - id: jetbrains-maven-support
    title: Maven | IntelliJ IDEA Documentation
    url: https://www.jetbrains.com/help/idea/maven-support.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: IntelliJ IDEA 2026.2
    claims:
      - IntelliJ IDEA 可以通过打开 pom.xml 导入 Maven 项目，并提供 Maven 工具窗口和项目重载入口。
      - Maven 设置可以选择 Maven 版本、本地仓库、离线模式和运行 Maven 的 JDK。
  - id: jetbrains-maven-projects
    title: Maven settings | IntelliJ IDEA Documentation
    url: https://www.jetbrains.com/help/idea/maven.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: IntelliJ IDEA 2026.2
    claims:
      - Maven home path 可以选择 IDEA 内置 Maven、MAVEN_HOME 指向的安装、自定义安装或项目中的 Maven Wrapper。
  - id: jetbrains-support-maven-refresh
    title: Not all Maven dependencies appear in External Libraries
    url: https://intellij-support.jetbrains.com/hc/en-us/community/posts/206903515-Not-all-Maven-dependencies-appear-in-External-libraries
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: IntelliJ IDEA Maven 项目同步问题
    claims:
      - 社区排错案例显示，IDEA 的 Maven 索引或项目模型未刷新时，依赖可能在编辑器中未解析；重载项目和检查本地仓库是有条件的排查步骤。
---

# Maven 项目与依赖

前面的课程可以直接运行一个 Java 类，但真实项目很快会遇到三个问题：源码应该放在哪里，项目怎样被唯一
标识，另一个模块或第三方库怎样进入编译和运行环境。Maven 把这些信息集中写进 `pom.xml`，再按照约定的
生命周期执行构建。

本课先用两个没有第三方库的 TeamFlow 模块说明依赖关系。这样可以把“模块依赖”和“下载外部库”分开看，
不会把 Maven 的基础模型隐藏在 Spring Boot 或测试框架后面。后文会说明外部依赖、scope 和 IDEA 同步，
但不提前讲 JUnit 的测试写法。

## 一、准备终端与 IDEA 的 Maven

### 1. 先分清两个 Maven 入口

Maven 是独立的构建工具，不会因为已经安装 JDK 或 IntelliJ IDEA 就自动成为终端命令。终端执行 `mvn`
时，系统会从 `PATH` 寻找 Maven；IDEA 则可以使用自己内置的 Maven，也可以选择终端安装目录或项目中的
Maven Wrapper。因此，“IDEA 的 Maven 工具窗口能运行”和“新终端能执行 `mvn`”是两项不同的检查。

本课的完整示例会同时使用终端和 IDEA，所以两边都要配置。Maven 启动时还需要 JDK：终端入口会使用
当前环境能找到的 Java，IDEA 的 Maven Runner 会使用设置中的 JRE。它们都可能与 Project SDK 不同。

### 2. 安装终端使用的 Maven

从 Apache Maven 官方 Installation 页面进入下载页，选择 3.9.x 的 binary archive，不要下载源码包。
手动安装的共同步骤是：解压发行包，把解压目录下的 `bin` 加入 `PATH`，再打开一个新终端验证。

- Windows：解压 ZIP，例如放到 `C:\Tools\apache-maven-3.9.16`，在用户环境变量 `Path` 中加入
  `C:\Tools\apache-maven-3.9.16\bin`，关闭并重新打开 PowerShell 或命令提示符。
- macOS：可以解压二进制包并把 `apache-maven-3.9.16/bin` 加入 shell 的 `PATH`，也可以使用官方安装页列出的
  Homebrew、SDKMAN! 或 MacPorts。包管理器安装后仍以实际的 `mvn -version` 输出为准。
- Linux：可以解压二进制包并配置 `PATH`，也可以使用发行版的 APT、DNF 或 YUM。发行版仓库中的版本可能
  不同，完成后必须核对是否为本课使用的 Maven 3.9.x。

Maven 官方要求先有可用的 JDK。若当前终端不能稳定找到正确的 Java，可以把 `JAVA_HOME` 指向目标 JDK，
并保证它与 `PATH` 中的 Java 选择一致；不要把 `JAVA_HOME` 指向 `bin` 子目录。

### 3. 从版本输出确认真实环境

在新终端执行：

```bash
java -version
mvn -version
```

`mvn -version` 至少应显示 Maven 3.9.x、Maven home、Java version 和 Java home。Maven home 说明终端实际找到
哪套 Maven，Java version 与 Java home 说明这次 Maven 进程实际使用哪套 JDK。JDK 25 主线应看到 Java 25；
Java 8 兼容工程应在切换环境后看到 Java 8。若系统提示找不到 `mvn`，先检查 `PATH` 并重新打开终端；若
Maven 版本正确但 Java 不对，修正 `JAVA_HOME` 或 `PATH` 后重新验证。

在 IDEA 的 Settings > Build, Execution, Deployment > Build Tools > Maven 中，Maven home path 可以选择
Bundled Maven、自定义安装或 Wrapper。Bundled Maven 只供 IDEA 使用，不会替终端添加 `mvn`。随后在 Maven >
Runner 中选择本课目标 JDK，并在 File > Project Structure 中核对 Project SDK。

## 二、从 pom.xml 读出项目身份

### 1. POM 是 Maven 的项目模型

POM（Project Object Model）是 Maven 读取的 XML 文件，默认文件名为 `pom.xml`。它描述项目坐标、依赖、
插件和构建配置。标准目录让 Maven 在没有额外配置时就能找到源码：

```text
teamflow-app/
├── pom.xml
├── src/main/java/
├── src/main/resources/
├── src/test/java/
└── target/
```

`src/main/java` 放主源码，`src/test/java` 放测试源码，`target` 保存本次构建产生的文件。目录约定不是
Java 语言规则；它是 Maven 的默认项目模型。把主源码放在 `src` 根目录而没有修改 POM 时，Maven 不会自动
把它当成主源码目录。

### 2. GAV 让项目有稳定坐标

最小 POM 的关键字段如下：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.teamflow</groupId>
  <artifactId>teamflow-app</artifactId>
  <version>1.0.0</version>
  <packaging>jar</packaging>
</project>
```

`groupId` 是组织或命名空间，`artifactId` 是项目名称，`version` 是该版本产物的标识；三者合称 GAV，写作
`com.teamflow:teamflow-app:1.0.0`。`packaging` 表示主要产物类型，未写时默认为 `jar`；`pom` 常用于只
聚合或管理其他模块的根项目。

`modelVersion` 的 `4.0.0` 是 POM 模型版本，不表示 Maven 4，也不决定正在使用的 JDK 版本。遇到版本问题时
应分别查看 `mvn -version`、POM 的 `version` 和依赖的版本。

### 3. parent 与 modules 表示不同关系

`parent` 表示当前 POM 继承另一个 POM 的坐标、属性、依赖管理或插件配置。`modules` 表示从当前目录发起
一次聚合构建时要收集哪些子目录。一个根 POM 可以同时是 parent 和 aggregator，但两个关系仍然不同：

```xml
<parent>
  <groupId>com.teamflow</groupId>
  <artifactId>teamflow-parent</artifactId>
  <version>1.0.0</version>
</parent>

<modules>
  <module>core</module>
  <module>app</module>
</modules>
```

修改 parent 的属性可能改变子项目的 effective POM；加入 `modules` 只说明一次聚合构建要发现哪些项目，
不会自动让模块互相成为依赖。真正需要 `core` 的 `app` 仍要在 `app/pom.xml` 的 `dependencies` 中声明。

## 三、声明和检查依赖

### 1. dependencies 才会把依赖放进项目

依赖声明至少需要 `groupId`、`artifactId` 和 `version`，还可以指定 `scope`。下面的 `app` 直接依赖本地
`core` 模块：

```xml
<dependencies>
  <dependency>
    <groupId>com.teamflow</groupId>
    <artifactId>teamflow-core</artifactId>
    <version>1.0.0</version>
  </dependency>
</dependencies>
```

当 Maven 在同一个 reactor 中构建两个模块时，会先构建 `teamflow-core`，再构建使用它的 `teamflow-app`。
如果只在 `dependencyManagement` 中写了这段信息，却没有放入 `dependencies`，`app` 仍不能 import
`teamflow-core` 的类。

这里的先后顺序来自 app 对 core 的实际项目依赖。更一般地说，Maven 3 reactor 还会依次考虑插件声明、
插件依赖和构建扩展；只有没有其他排序规则时，才采用根 POM 中 `modules` 的声明顺序。只写在
`dependencyManagement` 或 `pluginManagement` 中、尚未被实际引用的管理项不会改变顺序。

### 2. dependencyManagement 只管理，不引入

父 POM 可以集中维护版本，子项目再用简短的依赖声明：

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>com.teamflow</groupId>
      <artifactId>teamflow-core</artifactId>
      <version>1.0.0</version>
    </dependency>
  </dependencies>
</dependencyManagement>
```

子项目的实际声明仍然是：

```xml
<dependencies>
  <dependency>
    <groupId>com.teamflow</groupId>
    <artifactId>teamflow-core</artifactId>
  </dependency>
</dependencies>
```

前一段回答“如果使用它，默认用哪个版本”，后一段回答“当前项目确实使用它”。这两个区块的名字很像，
但职责不能互换。

### 3. scope 说明依赖在哪些环境可见

本课先记住四个常见 scope：

| scope | 主源码编译 | 主程序运行 | 测试编译与运行 | 常见用途 |
| --- | --- | --- | --- | --- |
| `compile` | 是 | 是 | 是 | 默认的主程序依赖 |
| `test` | 否 | 否 | 是 | 只服务测试的库 |
| `runtime` | 否 | 是 | 是 | 编译不需要、运行需要的实现 |
| `provided` | 是 | 通常由运行环境提供 | 是 | 容器或平台预计提供的 API |

scope 不只是标签，它还影响传递依赖是否继续进入下游项目。把只用于测试的依赖写成 `compile`，可能让生产
运行时和最终产物带上不该暴露的库；把主程序需要的依赖写成 `test`，主源码编译就找不到它。

### 4. 用依赖树查看实际结果

POM 文本只能告诉你声明了什么，`dependency:tree` 可以显示 Maven 最终解析出的依赖关系：

```bash
mvn -pl app -am dependency:tree
```

在多模块项目中，`-pl app` 选择 `app` 模块，`-am` 同时把 app 依赖的 reactor 模块加入本次命令。这样即使
本机仓库还没有安装 `teamflow-core`，Maven 也能从当前多模块工程解析关系。输出中会出现类似：

```text
com.teamflow:teamflow-app:jar:1.0.0
`- com.teamflow:teamflow-core:jar:1.0.0:compile
```

如果两个路径带来了同一个坐标的不同版本，Maven 会按依赖机制进行版本调解；初学者不应只凭“某个库被另
一个库依赖”猜测最终版本，应先看 `dependency:tree`，再决定是否需要显式管理或直接声明。

## 四、理解一次 Maven 构建

### 1. phase 是有顺序的生命周期阶段

Maven 有 `default`、`clean` 和 `site` 三个内置生命周期。日常 Java 项目最常遇到的是 default 生命周期：

| phase | 观察结果 |
| --- | --- |
| `compile` | 主源码编译到 `target/classes` |
| `test` | 编译并执行测试；本课不展开测试写法 |
| `package` | 在 `target` 生成主要产物，例如 JAR |
| `verify` | 在验证阶段检查项目，通常会经过前面的 default phase |
| `install` | 将产物安装到本机 Maven 仓库，供其他本地项目使用 |

执行 `mvn verify` 不只执行一个孤立动作，而是按顺序经过此前需要的阶段。执行 `mvn package` 后，`target`
中应出现 JAR；只执行 `mvn compile` 时没有要求生成最终 JAR。

### 2. goal 是插件提供的具体任务

插件提供 goal，goal 可以绑定到某个 phase，也可以直接调用：

```text
phase：package
goal：jar:jar
直接调用：dependency:tree
```

`package` 是生命周期中的阶段，`jar:jar` 是 JAR 插件的具体任务，`dependency:tree` 是依赖插件的检查
任务。直接调用一个 goal 不等价于走完整生命周期；例如 `mvn dependency:tree` 会打印依赖树，不会因此生成
新的 JAR。

### 3. 用最少命令观察结果

进入包含根 `pom.xml` 的目录后，可以按下面顺序观察：

```bash
mvn -version
mvn clean
mvn compile
mvn package
mvn dependency:tree
```

`mvn -version` 先确认 Maven 使用的 Java；`clean` 删除本次项目的 `target`；`compile` 生成主类；`package`
生成产物；`dependency:tree` 显示依赖图。每条命令结束后都要看退出状态和对应文件变化，不要只看最后一
行 `BUILD SUCCESS`。

## 五、在 IntelliJ IDEA 中导入 Maven 项目

### 1. 从根 pom.xml 打开项目

在 IDEA 中选择 File > Open，选中包含 `modules` 的根 `pom.xml`，选择 Open as Project。IDEA 会读取 POM，
创建 Maven 工具窗口和模块视图。项目打开后，在 Maven 工具窗口可以看到 Lifecycle、Plugins 和模块列表。

不要直接把某个 `src` 目录当作普通 Java 项目再手工复制依赖；这样编辑器的模块模型可能与 Maven 的模型不
一致。根 POM 才能让 IDEA 看见聚合关系。

### 2. 选择 Maven runner 使用的 JDK

在 Settings > Build, Execution, Deployment > Build Tools > Maven 中检查 Maven home、Local repository 和
Runner 的 JRE。Project SDK 是 IDEA 编译项目的默认 SDK，Maven Runner JRE 则决定从 Maven 工具窗口执行命令
时使用哪套 Java；两者可以不同，课程示例中把它们都设为目标版本。

JDK 25 主线项目选择 JDK 25，Java 8 兼容项目选择 JDK 8。打开 Maven 工具窗口后点击 Reload All Maven
Projects，让新改动的 POM 重新进入 IDEA 的项目模型，再运行一个 Maven phase 观察输出。

### 3. 命令行和 IDEA 的结果要互相核对

先在终端执行 `mvn -version`，再在 IDEA 的 Maven Runner 查看 JRE。若终端 `mvn dependency:tree` 成功但编辑器
仍将 import 标红，先确认 IDEA 是否已 Reload，而不是立即修改依赖版本。反过来，编辑器不报红也不能代替
一次真实 Maven 构建。

**社区补充：** JetBrains Support 的 Maven 问题案例记录过“依赖已经写入 POM，但 External Libraries 仍未
出现”的情况，排查方向包括重新导入 Maven 项目、更新本地仓库索引和检查项目是否被忽略。这些建议只适用
于命令行依赖关系已经正确、问题局限在 IDEA 项目模型的情况；本课先用 `mvn dependency:tree` 证明模型，
再点击 Reload All Maven Projects，避免把 IDE 缓存现象误当成 POM 语法错误。

## 六、遇到构建问题先核对最小事实

:::pitfalls
### IDEA 能运行 Maven，但终端找不到 mvn

**现象：** Maven 工具窗口可以执行 Lifecycle，终端却提示 `mvn` 不是命令或 command not found。

**原因：** IDEA 选择了 Bundled Maven，而操作系统的 `PATH` 中没有独立 Maven 安装的 `bin` 目录。

**后果：** 只能在 IDE 内构建，课程中的终端命令和外部脚本无法执行；反复修改 POM 也不会让命令出现。

**触发条件：** 把 IDEA 内置 Maven 误认为系统安装，未配置终端的 Maven 或修改 `PATH` 后没有打开新终端。

**错误示例：**

```text
只确认 IDEA 的 Maven home path 为 Bundled，然后直接在旧终端执行 mvn -version。
```

**正确写法：**

```text
终端单独安装 Maven 并把其 bin 加入 PATH；IDEA 再明确选择 Bundled、该安装目录或 Wrapper。
```

**验证方式：** 新终端的 `mvn -version` 显示 Maven home 与 Java home；IDEA 的 Maven 设置也能指出自己使用的 Maven home 和 Runner JRE。

### 只写 dependencyManagement，主源码仍无法 import

**现象：** 子模块 POM 中看得到版本管理，但 Java 源码的 `import com.teamflow...` 仍然找不到类。

**原因：** `dependencyManagement` 只提供默认版本和 scope，不会把依赖放进当前项目的 dependencies。

**后果：** 误以为 Maven 没有下载依赖，反复清理本地仓库也不能解决编译错误。

**触发条件：** 只修改了父 POM 的 `dependencyManagement`，没有在使用方添加同坐标的 `dependencies` 条目。

**错误示例：**

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>com.teamflow</groupId>
      <artifactId>teamflow-core</artifactId>
      <version>1.0.0</version>
    </dependency>
  </dependencies>
</dependencyManagement>
```

**正确写法：**

```xml
<dependencies>
  <dependency>
    <groupId>com.teamflow</groupId>
    <artifactId>teamflow-core</artifactId>
  </dependency>
</dependencies>
```

**验证方式：** 从 reactor 根目录执行 `mvn -pl app -am dependency:tree`，输出中出现 `teamflow-core`；再执行
`mvn -pl app -am compile`，确认两个模块都能编译。

### modules 写了目录，但没有声明模块依赖

**现象：** 根项目一次构建两个模块，却无法解释为什么 `app` 没有先得到 `core` 的类。

**原因：** `modules` 只负责聚合发现；没有 `<dependency>` 时，Maven 不知道 `app` 编译需要 `core`。

**后果：** 误把构建顺序当成 classpath 关系，源码依赖可能编译失败。

**触发条件：** 只在根 POM 添加 `<module>core</module>` 和 `<module>app</module>`，没有在 `app/pom.xml` 声明 `core`。

**错误示例：**

```xml
<modules>
  <module>core</module>
  <module>app</module>
</modules>
```

**正确写法：**

```xml
<dependency>
  <groupId>com.teamflow</groupId>
  <artifactId>teamflow-core</artifactId>
</dependency>
```

**验证方式：** `mvn -pl app -am dependency:tree` 能看到 `teamflow-core`；根目录 `mvn verify` 按 `core` 后 `app` 构建。

### 把 goal 当成 phase

**现象：** 执行 `mvn dependency:tree` 后期待 `target` 中出现新的 JAR，或执行 `mvn compile` 后寻找最终产物。

**原因：** `dependency:tree` 是插件 goal，`compile` 是生命周期 phase；二者完成的任务不同。

**后果：** 用错误的文件现象判断 Maven 没有工作。

**触发条件：** 没有先明确命令是 phase 还是 `plugin:goal`，直接把任何成功输出都当作完整构建。

**错误示例：**

```bash
mvn dependency:tree
ls target/*.jar
```

**正确写法：**

```bash
mvn package
ls target/*.jar
mvn dependency:tree
```

**验证方式：** `package` 后确认 JAR 存在，`dependency:tree` 只检查依赖图；两条命令分别记录退出状态。

### POM 改了但 IDEA 没有重载

**现象：** 命令行构建成功，IDEA 的 import 仍标红或 External Libraries 没有新依赖。

**原因：** IDEA 中缓存的 Maven 项目模型还没有读取最新 `pom.xml`。

**后果：** 直接修改坐标或版本，可能把正确的 POM 改坏。

**触发条件：** 编辑 POM 后没有点击 Maven 工具窗口的 Reload All Maven Projects，或项目模块被忽略。

**错误示例：**

```text
只在编辑器中反复重启代码补全，不执行 Maven 项目重载。
```

**正确写法：**

```text
先运行 mvn dependency:tree，再点击 Reload All Maven Projects，最后检查 Maven 工具窗口中的模块。
```

**验证方式：** 命令行和 IDEA 都显示同一个依赖坐标；源码 import 不再标红，Maven phase 可以从工具窗口执行。

### Java 8 Runner 仍使用 JDK 25 的编译目标

**现象：** Java 8 的 Maven Runner 执行编译时报告目标版本无效，项目不能进入 compile phase。

**原因：** POM 仍要求面向 JDK 25，Java 8 编译器不能生成面向 25 的 class；兼容项目应把目标改为 Java 8。
本课固定使用 Maven Compiler Plugin 3.14.1，它会在 JDK 8 上把 `release=8` 转换为 `source` 和 `target`。

**后果：** 入口代码本身兼容，但 Maven 编译配置让构建在编译器启动阶段失败。

**触发条件：** 把 JDK 25 项目的 `<maven.compiler.release>25</maven.compiler.release>` 原样交给 Java 8 Runner。

**错误示例：**

```xml
<maven.compiler.release>25</maven.compiler.release>
```

**正确写法：**

```xml
<maven.compiler.release>8</maven.compiler.release>
<maven.compiler.plugin.version>3.14.1</maven.compiler.plugin.version>
```

**验证方式：** 用 JDK 8 执行 `mvn -version` 和 `mvn verify`；确认 effective POM 中 Compiler Plugin 不低于
3.13.0 且目标为 8，再用 JDK 8 启动 app，输出应与 JDK 25 兼容版本一致。
:::

## 七、TeamFlow 最小多模块项目

现在把前面的关系放进一个可以构建的项目。`teamflow-parent` 只负责聚合和管理版本，`teamflow-core` 提供
一个很小的状态消息方法，`teamflow-app` 通过真正的 `<dependency>` 使用它。这个结构已经接近后续 Web
项目的模块边界，但没有提前引入 Spring、HTTP 或数据库。

### 1. JDK 25 项目结构和 POM

目录结构：

```text
teamflow-maven-jdk25/
├── pom.xml
├── core/
│   ├── pom.xml
│   └── src/main/java/com/teamflow/core/TeamFlowStatus.java
└── app/
    ├── pom.xml
    └── src/main/java/com/teamflow/app/TeamFlowApplication.java
```

根目录 `pom.xml`：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.teamflow</groupId>
  <artifactId>teamflow-parent</artifactId>
  <version>1.0.0</version>
  <packaging>pom</packaging>
  <modules>
    <module>core</module>
    <module>app</module>
  </modules>
  <properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <maven.compiler.release>25</maven.compiler.release>
    <maven.compiler.plugin.version>3.14.1</maven.compiler.plugin.version>
  </properties>
  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>com.teamflow</groupId>
        <artifactId>teamflow-core</artifactId>
        <version>1.0.0</version>
      </dependency>
    </dependencies>
  </dependencyManagement>
  <build>
    <pluginManagement>
      <plugins>
        <plugin>
          <groupId>org.apache.maven.plugins</groupId>
          <artifactId>maven-compiler-plugin</artifactId>
          <version>${maven.compiler.plugin.version}</version>
        </plugin>
      </plugins>
    </pluginManagement>
  </build>
</project>
```

`core/pom.xml`：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>com.teamflow</groupId>
    <artifactId>teamflow-parent</artifactId>
    <version>1.0.0</version>
  </parent>
  <artifactId>teamflow-core</artifactId>
</project>
```

`app/pom.xml`：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>com.teamflow</groupId>
    <artifactId>teamflow-parent</artifactId>
    <version>1.0.0</version>
  </parent>
  <artifactId>teamflow-app</artifactId>
  <dependencies>
    <dependency>
      <groupId>com.teamflow</groupId>
      <artifactId>teamflow-core</artifactId>
    </dependency>
  </dependencies>
</project>
```

### 2. JDK 25 完整 Java 代码

`core/src/main/java/com/teamflow/core/TeamFlowStatus.java`：

```java
package com.teamflow.core;

/**
 * 提供 TeamFlow 的最小启动状态消息。
 */
public final class TeamFlowStatus {
    /**
     * 防止创建只提供静态行为的工具类对象。
     */
    private TeamFlowStatus() {
    }

    /**
     * 返回服务已经准备好的消息。
     *
     * @return TeamFlow 启动提示
     */
    public static String readyMessage() {
        return "TeamFlow 服务准备就绪";
    }
}
```

`app/src/main/java/com/teamflow/app/TeamFlowApplication.java`：

```java
package com.teamflow.app;

import com.teamflow.core.TeamFlowStatus;

/**
 * 启动 TeamFlow Maven 多模块示例。
 */
public final class TeamFlowApplication {
    /**
     * 启动应用并输出 core 模块提供的消息。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        System.out.println(TeamFlowStatus.readyMessage());
    }
}
```

### 3. JDK 25 的 IDEA 与命令行运行

1. 用 File > Open 打开根 `pom.xml`，选择 Open as Project；在 Maven 工具窗口确认 `teamflow-parent`、`core`
   和 `app` 三个项目都出现。
2. Project SDK 和 Maven Runner JRE 选择 JDK 25；Maven 工具窗口点击 Reload All Maven Projects。
3. 在根目录执行 `mvn -version`，确认 Maven 使用 JDK 25；再执行 `mvn clean verify`。
4. 执行 `mvn -pl app -am dependency:tree`，确认输出包含 `com.teamflow:teamflow-core:jar:1.0.0:compile`。
5. 在 IDEA 中为 `TeamFlowApplication.main` 创建 Application 运行配置，Main class 填完整类名，点击 Run。

构建成功时 `core/target` 和 `app/target` 都会出现编译目录，`app/target/teamflow-app-1.0.0.jar` 是 app
模块的产物。运行主类的预期输出：

```text
TeamFlow 服务准备就绪
```

### 4. Java 8 项目中的完整 POM

Java 8 版本保留相同的 GAV、模块依赖和源码目录。JDK 8 的 `javac` 本身没有 `--release` 选项，但本课固定的
Maven Compiler Plugin 3.14.1 会在 JDK 8 上把 `release=8` 转换为 `source` 和 `target`，因此完整根
`pom.xml` 可以统一写成：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.teamflow</groupId>
  <artifactId>teamflow-parent</artifactId>
  <version>1.0.0</version>
  <packaging>pom</packaging>
  <modules>
    <module>core</module>
    <module>app</module>
  </modules>
  <properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <maven.compiler.release>8</maven.compiler.release>
    <maven.compiler.plugin.version>3.14.1</maven.compiler.plugin.version>
  </properties>
  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>com.teamflow</groupId>
        <artifactId>teamflow-core</artifactId>
        <version>1.0.0</version>
      </dependency>
    </dependencies>
  </dependencyManagement>
  <build>
    <pluginManagement>
      <plugins>
        <plugin>
          <groupId>org.apache.maven.plugins</groupId>
          <artifactId>maven-compiler-plugin</artifactId>
          <version>${maven.compiler.plugin.version}</version>
        </plugin>
      </plugins>
    </pluginManagement>
  </build>
</project>
```

Java 8 的 `core/pom.xml`：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>com.teamflow</groupId>
    <artifactId>teamflow-parent</artifactId>
    <version>1.0.0</version>
  </parent>
  <artifactId>teamflow-core</artifactId>
</project>
```

Java 8 的 `app/pom.xml`：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>com.teamflow</groupId>
    <artifactId>teamflow-parent</artifactId>
    <version>1.0.0</version>
  </parent>
  <artifactId>teamflow-app</artifactId>
  <dependencies>
    <dependency>
      <groupId>com.teamflow</groupId>
      <artifactId>teamflow-core</artifactId>
    </dependency>
  </dependencies>
</project>
```

### 5. Java 8 完整 Java 代码与运行

Java 8 的 `core/src/main/java/com/teamflow/core/TeamFlowStatus.java`：

```java
package com.teamflow.core;

/**
 * 提供 TeamFlow Java 8 的最小启动状态消息。
 */
public final class TeamFlowStatus {
    /**
     * 防止创建只提供静态行为的工具类对象。
     */
    private TeamFlowStatus() {
    }

    /**
     * 返回服务已经准备好的消息。
     *
     * @return TeamFlow 启动提示
     */
    public static String readyMessage() {
        return "TeamFlow 服务准备就绪";
    }
}
```

Java 8 的 `app/src/main/java/com/teamflow/app/TeamFlowApplication.java`：

```java
package com.teamflow.app;

import com.teamflow.core.TeamFlowStatus;

/**
 * 启动 TeamFlow Java 8 Maven 多模块示例。
 */
public final class TeamFlowApplication {
    /**
     * 启动应用并输出 core 模块提供的消息。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        System.out.println(TeamFlowStatus.readyMessage());
    }
}
```

Java 8 的 IDEA 与命令行步骤：

1. 打开同样的根 `pom.xml`，Project SDK 和 Maven Runner JRE 选择 JDK 8，然后 Reload All Maven Projects。
2. 在终端执行 `mvn -version`，确认 Maven 使用 Java 8；执行 `mvn clean verify`，并在构建日志中确认使用
   Maven Compiler Plugin 3.14.1。
3. 执行 `mvn -pl app -am dependency:tree`，确认 `teamflow-core` 是 compile 依赖。
4. 以 `com.teamflow.app.TeamFlowApplication` 创建 Application 配置并 Run。

预期输出与 JDK 25 版本相同：

```text
TeamFlow 服务准备就绪
```

代码使用两版共有的包、类、静态方法和传统入口；真实差异是编译目标和 Project SDK。JDK 8 不能构建
`release=25`，但 Compiler Plugin 3.13.0 及以上配合默认 `javac` 时允许配置 `release=8`，插件会自动转换。
若旧项目使用更早的插件版本或非默认编译器，才需要按官方说明评估 `source`/`target` 或条件 profile；本课
不展开这些旧配置。

## 八、独立练习与参考实现

### 1. 练习：建立 TeamFlow greeting 模块依赖

:::exercise
### 练习任务

**要求：** 新建一份只包含 `greeting` 和 `app` 的 TeamFlow 多模块工程。`greeting` 提供
`public static String text()` 并返回 `TeamFlow 欢迎使用 Maven`；`app` 必须通过 Maven 坐标依赖 greeting，
父 POM 必须聚合两个模块并在 `dependencyManagement` 中统一 greeting 的版本。不能把 greeting 类复制到
app 的源码目录。用 `mvn clean verify` 构建，用 `mvn -pl app -am dependency:tree` 核对实际 compile 依赖；
JDK 25 与 Java 8 各完成一次。

**验收：** 两个 JDK 版本的命令行构建都成功，依赖树出现 `com.teamflow:teamflow-greeting:jar:1.0.0:compile`，
IDEA Reload All Maven Projects 后 app 可以 import greeting 并输出 `TeamFlow 欢迎使用 Maven`。删除
`dependencies` 中 greeting 条目后，构建应能说明 app 已不再拥有该依赖。
:::

### 2. JDK 25 参考实现

完整目录结构：

```text
teamflow-greeting-jdk25/
├── pom.xml
├── greeting/
│   ├── pom.xml
│   └── src/main/java/com/teamflow/greeting/TeamFlowGreeting.java
└── app/
    ├── pom.xml
    └── src/main/java/com/teamflow/app/TeamFlowApplication.java
```

根目录 `pom.xml`：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.teamflow</groupId>
  <artifactId>teamflow-greeting-parent</artifactId>
  <version>1.0.0</version>
  <packaging>pom</packaging>
  <modules>
    <module>greeting</module>
    <module>app</module>
  </modules>
  <properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <maven.compiler.release>25</maven.compiler.release>
    <maven.compiler.plugin.version>3.14.1</maven.compiler.plugin.version>
  </properties>
  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>com.teamflow</groupId>
        <artifactId>teamflow-greeting</artifactId>
        <version>1.0.0</version>
      </dependency>
    </dependencies>
  </dependencyManagement>
  <build>
    <pluginManagement>
      <plugins>
        <plugin>
          <groupId>org.apache.maven.plugins</groupId>
          <artifactId>maven-compiler-plugin</artifactId>
          <version>${maven.compiler.plugin.version}</version>
        </plugin>
      </plugins>
    </pluginManagement>
  </build>
</project>
```

`greeting/pom.xml`：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>com.teamflow</groupId>
    <artifactId>teamflow-greeting-parent</artifactId>
    <version>1.0.0</version>
  </parent>
  <artifactId>teamflow-greeting</artifactId>
</project>
```

`app/pom.xml`：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>com.teamflow</groupId>
    <artifactId>teamflow-greeting-parent</artifactId>
    <version>1.0.0</version>
  </parent>
  <artifactId>teamflow-app</artifactId>
  <dependencies>
    <dependency>
      <groupId>com.teamflow</groupId>
      <artifactId>teamflow-greeting</artifactId>
    </dependency>
  </dependencies>
</project>
```

`greeting/src/main/java/com/teamflow/greeting/TeamFlowGreeting.java`：

```java
package com.teamflow.greeting;

/**
 * 提供 TeamFlow 的 Maven 欢迎语。
 */
public final class TeamFlowGreeting {
    /**
     * 防止创建只提供静态行为的工具类对象。
     */
    private TeamFlowGreeting() {
    }

    /**
     * 返回 Maven 练习的欢迎语。
     *
     * @return TeamFlow 欢迎语
     */
    public static String text() {
        return "TeamFlow 欢迎使用 Maven";
    }
}
```

`app/src/main/java/com/teamflow/app/TeamFlowApplication.java`：

```java
package com.teamflow.app;

import com.teamflow.greeting.TeamFlowGreeting;

/**
 * 运行 TeamFlow Maven 依赖练习。
 */
public final class TeamFlowApplication {
    /**
     * 输出 greeting 模块提供的消息。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        System.out.println(TeamFlowGreeting.text());
    }
}
```

在根目录执行 `mvn clean verify` 和 `mvn -pl app -am dependency:tree`，依赖树应包含
`com.teamflow:teamflow-greeting:jar:1.0.0:compile`。在 IDEA 中把 Project SDK 和 Maven Runner JRE 设为
JDK 25，Reload All Maven Projects，再运行 `TeamFlowApplication`。预期输出：

```text
TeamFlow 欢迎使用 Maven
```

### 3. Java 8 参考实现

Java 8 版本也给出所有文件，不能把 JDK 25 的 POM 当作隐含前提。完整目录结构：

```text
teamflow-greeting-java8/
├── pom.xml
├── greeting/
│   ├── pom.xml
│   └── src/main/java/com/teamflow/greeting/TeamFlowGreeting.java
└── app/
    ├── pom.xml
    └── src/main/java/com/teamflow/app/TeamFlowApplication.java
```

根目录 `pom.xml`：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.teamflow</groupId>
  <artifactId>teamflow-greeting-parent</artifactId>
  <version>1.0.0</version>
  <packaging>pom</packaging>
  <modules>
    <module>greeting</module>
    <module>app</module>
  </modules>
  <properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <maven.compiler.release>8</maven.compiler.release>
    <maven.compiler.plugin.version>3.14.1</maven.compiler.plugin.version>
  </properties>
  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>com.teamflow</groupId>
        <artifactId>teamflow-greeting</artifactId>
        <version>1.0.0</version>
      </dependency>
    </dependencies>
  </dependencyManagement>
  <build>
    <pluginManagement>
      <plugins>
        <plugin>
          <groupId>org.apache.maven.plugins</groupId>
          <artifactId>maven-compiler-plugin</artifactId>
          <version>${maven.compiler.plugin.version}</version>
        </plugin>
      </plugins>
    </pluginManagement>
  </build>
</project>
```

`greeting/pom.xml`：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>com.teamflow</groupId>
    <artifactId>teamflow-greeting-parent</artifactId>
    <version>1.0.0</version>
  </parent>
  <artifactId>teamflow-greeting</artifactId>
</project>
```

`app/pom.xml`：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>com.teamflow</groupId>
    <artifactId>teamflow-greeting-parent</artifactId>
    <version>1.0.0</version>
  </parent>
  <artifactId>teamflow-app</artifactId>
  <dependencies>
    <dependency>
      <groupId>com.teamflow</groupId>
      <artifactId>teamflow-greeting</artifactId>
    </dependency>
  </dependencies>
</project>
```

`greeting/src/main/java/com/teamflow/greeting/TeamFlowGreeting.java`：

```java
package com.teamflow.greeting;

/**
 * 提供 TeamFlow Java 8 的 Maven 欢迎语。
 */
public final class TeamFlowGreeting {
    /**
     * 防止创建只提供静态行为的工具类对象。
     */
    private TeamFlowGreeting() {
    }

    /**
     * 返回 Maven 练习的欢迎语。
     *
     * @return TeamFlow 欢迎语
     */
    public static String text() {
        return "TeamFlow 欢迎使用 Maven";
    }
}
```

`app/src/main/java/com/teamflow/app/TeamFlowApplication.java`：

```java
package com.teamflow.app;

import com.teamflow.greeting.TeamFlowGreeting;

/**
 * 运行 TeamFlow Java 8 Maven 依赖练习。
 */
public final class TeamFlowApplication {
    /**
     * 输出 greeting 模块提供的消息。
     *
     * @param args 启动参数，本程序暂不使用
     */
    public static void main(String[] args) {
        System.out.println(TeamFlowGreeting.text());
    }
}
```

在根目录用 JDK 8 执行 `mvn -version`、`mvn clean verify` 和 `mvn -pl app -am dependency:tree`。在 IDEA 中把
Project SDK 和 Maven Runner JRE 都设为 JDK 8，重载 Maven 项目后运行 `TeamFlowApplication`。依赖树和
预期输出与 JDK 25 版本一致：

```text
TeamFlow 欢迎使用 Maven
```

## 九、本课小结

读一个 Maven 项目时，先看根 `pom.xml` 的 GAV、packaging 和 modules，再看子模块的 parent 与 dependencies。
用 dependencyManagement 管版本，用 dependencies 表示真实使用；用 `dependency:tree` 看最终图；用 phase
驱动有序构建，用 goal 检查或执行单个插件任务。IDEA 只是 Maven 项目模型的另一种入口，POM 修改后应重载，
并分别核对 Maven home、Project SDK、Maven Runner JRE 与终端 `mvn -version`。本课固定的 Compiler Plugin
3.14.1 让 JDK 25 使用 `release=25`、Java 8 使用 `release=8`；reactor 会综合实际项目与构建关系排序，
没有其他规则时才采用 `modules` 声明顺序。
