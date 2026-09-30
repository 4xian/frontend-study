---
id: backend.java.learn.intermediate.testing-and-delivery-check
type: lesson
title: 实战：测试与交付检查
summary: 把测试、可执行 JAR、Docker 镜像、健康检查和业务烟雾请求串成可重复的本地交付门禁
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 180
prerequisites:
  - backend.java.learn.intermediate.testing-with-junit-and-mocks
  - backend.java.learn.intermediate.controller-testing-mockmvc-and-test-slices
  - backend.java.learn.intermediate.integration-testing-with-spring-boot
  - backend.java.learn.intermediate.application-packaging
  - backend.java.learn.intermediate.containerized-deployment
objectives:
  - 能用一次 mvn -B clean verify 运行单元测试、切片测试和集成测试，并从 Surefire/Failsafe 报告解释结果。
  - 能在测试通过后检查固定主 JAR 的 Manifest、归档目录和文件数量，并区分可执行 JAR 与可选的 .jar.original 对照产物。
  - 能检查最终 Docker 镜像的 ID、Java 版本、非 root 用户、入口命令和 8080 端口声明。
  - 能启动最终容器，优先完成实际 readiness 健康检查；工程未暴露健康端点时，检查容器运行状态后再执行业务烟雾请求。
  - 能使用 EXIT trap 清理门禁创建的容器，并让任何一步失败以非零退出码结束。
  - 能为 JDK 25/Spring Boot 4.1.1 与 Java 8/Spring Boot 2.3.12.RELEASE 保持独立的 target、JAR、镜像和缓存。
recap:
  - verify 是本地交付门禁的终点；直接调用 integration-test 会漏掉 Failsafe 的最终结果校验。
  - Surefire 默认发现 *Test、*Tests、Test*、*TestCase；Failsafe 默认发现 *IT、IT*、*ITCase。
  - 测试报告与命令退出码必须同时保留，绿色日志不能替代非零退出码检查。
  - 只有测试通过并确认唯一可执行 JAR 后才构建镜像；镜像检查不能反推测试已经执行。
  - readiness 或容器运行状态提供运行就绪证据，业务烟雾请求证明入口、配置和关键路由仍然可用，两者缺一不可。
  - trap EXIT 必须先保存原始退出码，再清理容器并恢复该退出码；清理失败不能掩盖原始失败。
  - 两条 Java 版本线应使用不同工程目录、target 目录、镜像标签和运行端口，不能交叉复用产物。
related:
  - backend.java.learn.intermediate.integration-testing-with-spring-boot
  - backend.java.learn.intermediate.application-packaging
  - backend.java.learn.intermediate.containerized-deployment
tags:
  - Java
  - Spring Boot
  - Maven
  - Surefire
  - Failsafe
  - Docker
  - 交付门禁
  - 烟雾测试
  - readiness
  - 版本隔离
appliesTo: JDK 25 / Spring Boot 4.1.1 主线；Java 8 / Spring Boot 2.3.12.RELEASE 兼容线；Maven 3.x；Docker Engine 29.x
verifiedAt: 2026-08-30
sources:
  - id: maven-build-lifecycle-verify
    title: Introduction to the Build Lifecycle
    url: https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Apache Maven 3.x
    claims:
      - default 生命周期按顺序执行 validate、compile、test、package 和后续阶段。
      - verify 适合在 package 后执行额外的质量检查。
  - id: maven-surefire-inclusion
    title: Surefire Inclusion and Exclusion of Tests
    url: https://maven.apache.org/surefire/maven-surefire-plugin/examples/inclusion-exclusion.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Maven Surefire Plugin 3.x
    claims:
      - Surefire 默认匹配 *Test、*Tests、Test* 和 *TestCase。
      - Surefire 报告位于 target/surefire-reports。
  - id: maven-failsafe-plugin
    title: Maven Failsafe Plugin
    url: https://maven.apache.org/surefire/maven-failsafe-plugin/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Maven Failsafe Plugin 3.x
    claims:
      - Failsafe 在 integration-test 阶段运行测试，在 verify 阶段检查结果。
      - 集成测试应调用 verify 以完成结果校验和清理反馈。
  - id: maven-failsafe-inclusion
    title: Failsafe Inclusion and Exclusion of Tests
    url: https://maven.apache.org/surefire/maven-failsafe-plugin/examples/inclusion-exclusion.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Maven Failsafe Plugin 3.x
    claims:
      - Failsafe 默认匹配 *IT、IT* 和 *ITCase。
      - Failsafe 报告位于 target/failsafe-reports。
  - id: spring-boot-testing-applications
    title: Testing Spring Boot Applications
    url: https://docs.spring.io/spring-boot/reference/testing/spring-boot-applications.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.x
    claims:
      - SpringBootTest 可以加载完整 ApplicationContext。
      - 完整上下文测试与切片测试的边界不同。
  - id: spring-boot-actuator-endpoints
    title: Actuator Endpoints
    url: https://docs.spring.io/spring-boot/reference/actuator/endpoints.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.x
    claims:
      - health 端点提供应用健康反馈，readiness 与 liveness 可作为不同运行状态组观察。
  - id: docker-image-inspect
    title: docker image inspect
    url: https://docs.docker.com/reference/cli/docker/image/inspect/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Docker Engine current CLI
    claims:
      - docker image inspect 可以读取镜像 ID、入口、用户、端口等配置。
  - id: docker-container-inspect
    title: docker inspect
    url: https://docs.docker.com/reference/cli/docker/inspect
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Docker Engine current CLI
    claims:
      - docker inspect --format 可以读取容器状态、退出码和运行配置。
  - id: bash-trap
    title: Bourne Shell Builtins - trap
    url: https://www.gnu.org/software/bash/manual/html_node/Bourne-Shell-Builtins.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Bash 5.x
    claims:
      - EXIT trap 在 shell 退出前执行，可用于清理本地门禁资源。
  - id: peter-evans-smoke-testing
    title: Smoke Testing
    url: https://github.com/peter-evans/smoke-testing
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: 通用容器交付实践
    claims:
      - 最终容器烟雾测试能够发现单元测试无法覆盖的镜像包装、入口和依赖问题。
---

# 实战：测试与交付检查

测试全部通过，只能说明源码在测试环境中满足了已写下的断言；它还不能证明交付目录里拿到的是正确 JAR，镜像里的入口
和用户配置正确，或者最终容器真的能够接收一条业务请求。本课把前面分散的反馈环组织成一个本地门禁：先运行完整
Maven 生命周期，再检查产物和镜像，最后启动容器完成 readiness（无健康端点时检查运行状态）与业务烟雾请求。任何一步失败，门禁都必须以非零状态结束。

示例沿用前几课的中性 packaging-modern 与 packaging-legacy 工程，以及 GET /package-info 业务探针。前置打包课的 POM
只有 Web 运行依赖，因此本课不会假定工程已经凭空拥有三类测试；先按下文补齐最小的单元、MVC 切片、完整上下文测试和
Failsafe 配置，再执行交付门禁。这里关注的是检查顺序和证据，不再讲 Maven 打包或 Dockerfile 指令的基础语法。Registry、
CI 平台、Kubernetes、Compose、签名和正式发布审批不属于本课。

**社区补充：** 社区工程示例把最终容器烟雾测试作为单元测试和集成测试之外的一层反馈，用来捕获镜像包装、入口与依赖问题。
本课仅在容器已成功构建并启动的条件下采纳这一检查边界，并用两个示例版本线的业务请求复核；它不替代 Maven 测试或 readiness。

## 一、先把交付反馈画成一条链

### 1. 每一关回答一个不同问题

本地门禁不是把很多命令堆在一起，而是让每个检查拥有清晰的失败边界：

| 顺序 | 检查 | 证明 | 不能证明 |
| --- | --- | --- | --- |
| 1 | mvn -B clean verify | 编译、单元、切片和集成测试的 Maven 反馈 | 镜像入口和容器网络 |
| 2 | JAR Manifest 与归档 | 交付文件是唯一可执行 JAR | 容器一定能启动 |
| 3 | docker image inspect | 最终镜像的用户、入口、端口和 ID | 应用已经监听端口 |
| 4 | readiness 或运行状态 | 应用上下文可启动并接受探针，或至少确认进程仍在运行 | 业务路由合同 |
| 5 | 业务烟雾请求 | 最关键路由、配置和网络映射可用 | 全量业务正确 |

如果第 1 关失败，不应继续构建镜像；如果 readiness 失败，不应把“镜像构建成功”报告成可交付。这样每条失败都能回到
更窄的层次，而不是最后只得到一个模糊的“部署失败”。

### 2. verify 是生命周期终点

Maven default 生命周期会按阶段顺序推进。clean 先删除当前工程的旧输出，随后 verify 会经过 compile、test、package、
集成测试相关阶段。Failsafe 的设计是由 integration-test 启动 *IT 测试，再由 verify 读取结果并使构建失败；因此不能把
下面命令当作完整门禁：

~~~bash
mvn -B integration-test
~~~

应使用：

~~~bash
mvn -B clean verify
~~~

前者可能在测试进程结束后没有执行最终结果检查或清理，尤其容易让失败的集成测试被错误地当成成功。-B 只表示批处理
模式，减少交互提示；它不会跳过测试。

### 3. 测试命名决定默认分流

Surefire 和 Failsafe 默认使用不同的文件名集合：

| 插件 | 默认类名 | 常见职责 |
| --- | --- | --- |
| Surefire | *Test、*Tests、Test*、*TestCase | 单元测试和快速切片测试 |
| Failsafe | *IT、IT*、*ITCase | 需要完整上下文、数据库或真实端口的集成测试 |

例如 OrderServiceTest 会进入 Surefire，OrderApiIT 会进入 Failsafe。命名不是测试类型的全部定义，但它让 Maven 的默认
配置能按职责产生两套报告。若团队把集成测试命名成 OrderApiTest，它可能被 Surefire 提前运行，或者在没有完整上下文的
情况下失败；不要只依赖 IDE 中某次手工运行的结果。

### 4. 先给前置工程补上可执行的测试夹具

前置 `packaging-modern` 与 `packaging-legacy` 只展示了 `spring-boot-starter-web`，所以需要在两个工程中加入同一组
最小夹具。这样 `clean verify` 才会真的产生 Surefire 和 Failsafe 报告，而不是只得到“没有测试也成功”的绿色日志。

先在 `PackagingApplication.packageInfo()` 中把响应拼接提取到一个没有框架依赖的类，两个版本使用相同源码：

~~~java
package dev.teamflow.packaging;

/** 生成交付探针的稳定响应文本。 */
public final class DeliveryProbe {

    private DeliveryProbe() {}

    /**
     * 拼接容器烟雾请求需要观察的标签和 JVM 版本线。
     *
     * @param label Spring 配置中的交付标签
     * @param jvm JVM 系统属性中的版本线标识
     * @return 交付探针响应文本
     */
    public static String format(String label, String jvm) {
        return "label=" + label + ";jvm=" + jvm;
    }
}
~~~

把 Controller 方法的 return 改为：

~~~java
return DeliveryProbe.format(label, System.getProperty("delivery.jvm", "missing"));
~~~

然后在两个 POM 的 `<dependencies>` 中追加测试依赖，在 `<build><plugins>` 中追加固定版本的 Surefire/Failsafe：

~~~xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-test</artifactId>
  <scope>test</scope>
</dependency>
...
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-surefire-plugin</artifactId>
  <version>3.5.6</version>
</plugin>
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-failsafe-plugin</artifactId>
  <version>3.5.6</version>
  <executions>
    <execution>
      <goals>
        <goal>integration-test</goal>
        <goal>verify</goal>
      </goals>
    </execution>
  </executions>
</plugin>
~~~

现代线和兼容线的依赖坐标相同，版本由各自的 Boot parent 管理。两个工程都创建以下单元测试，证明 Surefire 确实发现
了一个 `*Test`：

~~~java
package dev.teamflow.packaging;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class DeliveryProbeTest {

    /** 验证无 Spring 上下文时也能得到稳定响应。 */
    @Test
    void formatsDeliveryResponse() {
        assertEquals("label=from-test;jvm=modern", DeliveryProbe.format("from-test", "modern"));
    }
}
~~~

再创建一个 MVC 切片测试。现代线使用 Boot 4.1.1 的测试包路径：

~~~java
package dev.teamflow.packaging;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

/** 只加载 MVC 适配层，不启动完整应用上下文。 */
@WebMvcTest(controllers = PackagingApplication.class, properties = "delivery.label=from-slice")
class PackageInfoSliceTest {

    @Autowired
    private MockMvc mockMvc;

    /** 清理 JVM 全局属性，避免测试之间互相污染。 */
    @AfterEach
    void clearJvmProperty() {
        System.clearProperty("delivery.jvm");
    }

    /** 验证切片可以完成路由、配置注入和正文序列化。 */
    @Test
    void servesPackageInfo() throws Exception {
        mockMvc.perform(get("/package-info"))
            .andExpect(status().isOk())
            .andExpect(content().string("label=from-slice;jvm=missing"));
    }
}
~~~

兼容线只替换一个 import：

~~~java
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
~~~

最后创建一个完整上下文集成测试，类名以 `IT` 结尾，交给 Failsafe。现代线的 `AutoConfigureMockMvc` 位于
`org.springframework.boot.webmvc.test.autoconfigure`：

~~~java
package dev.teamflow.packaging;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

/** 验证完整 ApplicationContext 与真实 MVC Bean 图。 */
@SpringBootTest
@AutoConfigureMockMvc
class PackageInfoIT {

    @Autowired
    private MockMvc mockMvc;

    /** 清理 JVM 全局属性，避免影响后续 Maven 测试。 */
    @AfterEach
    void clearJvmProperty() {
        System.clearProperty("delivery.jvm");
    }

    /** 验证完整上下文仍然暴露交付探针。 */
    @Test
    void servesPackageInfoFromFullContext() throws Exception {
        mockMvc.perform(get("/package-info"))
            .andExpect(status().isOk())
            .andExpect(content().string("label=from-default;jvm=missing"));
    }
}
~~~

兼容线把 `AutoConfigureMockMvc` 改为 `org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc`。
三类测试分别观察纯 Java 格式化、MVC 路由和完整 Spring 上下文；它们不是同一断言换三个类名。

## 二、读取测试结果而不是只看最后一行

### 1. 退出码是自动化门槛

Shell 通过上一条命令的退出码判断成败。门禁至少要保留 Maven 的退出状态：

~~~bash
mvn -B clean verify
maven_status=$?
printf 'maven_exit=%s\n' "$maven_status"
test "$maven_status" -eq 0
~~~

命令输出最后出现 BUILD SUCCESS 是有用的人类反馈，但脚本应判断退出码，而不是 grep 这段文本。失败时 Maven 可能在
报告生成前停止，退出码仍然是更可靠的机器合同。

### 2. 报告目录解释测试分流

通过后检查报告文件是否存在，确认确实产生过两类反馈：

~~~bash
find target/surefire-reports -maxdepth 1 -type f -name '*.xml' -print | sort
find target/failsafe-reports -maxdepth 1 -type f -name '*.xml' -print | sort
~~~

XML 报告中的 tests、failures、errors 和 skipped 可以回答“运行了多少”和“为什么没有通过”。报告目录为空并不自动
等于失败：一个工程可能暂时没有集成测试；但如果交付合同要求存在 OrderApiIT，就必须把缺少报告视为配置或命名错误。
本课的示例工程有 *Test 与 *IT，所以门禁记录两者的路径和文件数量。

### 3. skipTests 不是交付验证

下面两个选项都不适合作为本课的主门禁：

~~~bash
mvn -B package -DskipTests
mvn -B package -Dmaven.test.skip=true
~~~

-DskipTests 跳过测试执行，maven.test.skip=true 还会跳过测试编译。它们可以在明确的本地调试场景使用，但一旦成为交付
命令，绿色的 JAR 只代表“没有运行测试”。门禁脚本应拒绝把这类命令写成成功路径。

## 三、确认交付 JAR 没有拿错

### 1. 固定主文件名并拒绝通配符歧义

上一课的 target 会同时保留主 JAR 和 `.jar.original` 对照产物。交付检查应使用固定文件名，并只统计真正的主 JAR：

~~~bash
APP_JAR=target/packaging-feedback-1.0.0.jar
test -f "$APP_JAR"
test "$(find target -maxdepth 1 -type f -name '*.jar' ! -name '*.jar.original' | wc -l | tr -d ' ')" -eq 1
~~~

`.jar.original` 可以继续保留，便于比较重打包前后的归档；门禁只拒绝主 JAR 缺失或出现多个非 `.original` 候选，
不删除对照文件。不要使用 `target/*.jar` 直接取第一个结果：shell 展开顺序不能表达哪个文件具有 Boot loader。

### 2. Manifest 是可执行入口的机器证据

用 JDK 自带的 `jar` 读取 Manifest，不依赖外部 `unzip` 工具。先把条目解到临时目录：

~~~bash
manifest_dir=$(mktemp -d)
app_jar_path="$PWD/$APP_JAR"
(cd "$manifest_dir" && jar --extract --file "$app_jar_path" META-INF/MANIFEST.MF)
manifest=$(<"$manifest_dir/META-INF/MANIFEST.MF")
printf '%s\n' "$manifest"
printf '%s\n' "$manifest" | grep -F 'Main-Class: org.springframework.boot.loader.launch.JarLauncher'
printf '%s\n' "$manifest" | grep -F 'Start-Class: dev.teamflow.packaging.PackagingApplication'
printf '%s\n' "$manifest" | grep -F 'Spring-Boot-Classes: BOOT-INF/classes/'
printf '%s\n' "$manifest" | grep -F 'Spring-Boot-Lib: BOOT-INF/lib/'
jar --list --file "$APP_JAR" | grep -F 'BOOT-INF/classes/' >/dev/null
jar --list --file "$APP_JAR" | grep -F 'BOOT-INF/lib/' >/dev/null
rm -r "$manifest_dir"
~~~

现代 Boot 4.1.1 的 Main-Class 是 org.springframework.boot.loader.launch.JarLauncher；兼容线 Boot 2.3.12 的
Main-Class 是 org.springframework.boot.loader.JarLauncher。两版的 Start-Class 都应是应用入口。检查 Start-Class
能确认拿到的是应用的可执行归档，而不是普通 JAR 或错误工程的产物。

### 3. 归档结构要与 Manifest 对齐

~~~bash
jar --list --file "$APP_JAR" | awk '/^(BOOT-INF\/classes|BOOT-INF\/lib)\// { print }' | head -20
~~~

至少应看到 BOOT-INF/classes/ 下的应用类和 BOOT-INF/lib/ 下的依赖。jar tf 也可以完成同样观察；使用哪一个不重要，
重要的是检查实际文件而非凭文件名推断。若只看到 com/... 和没有 Boot loader 的普通布局，说明检查的是 .jar.original 或
repackage 没有执行，应回到 POM 和 mvn verify。

## 四、只在测试和产物通过后构建镜像

### 1. 镜像检查比 Dockerfile 文本更可靠

镜像构建成功只说明 Dockerfile 能执行，不等于最终配置满足交付合同。构建后读取镜像对象：

~~~bash
docker build --pull -t teamflow-packaging:modern-1.0.0 .
docker image inspect teamflow-packaging:modern-1.0.0 \
  --format 'id={{.Id}} user={{json .Config.User}} entrypoint={{json .Config.Entrypoint}} exposed={{json .Config.ExposedPorts}}'
~~~

预期结果应包含非空的 image ID、teamflow 用户、["java", ...] 的 exec-form 入口和 8080/tcp。docker image inspect
读取的是最终镜像元数据，因此能发现构建阶段被覆盖的 USER 或 ENTRYPOINT。

### 2. 版本和标签必须互相隔离

两条运行线使用独立目录和标签：

| 线 | Java / Boot | JAR 与 target | 镜像标签 | 宿主机端口 |
| --- | --- | --- | --- | --- |
| modern | JDK 25 / Boot 4.1.1 | packaging-modern/target | teamflow-packaging&#58;modern-1.0.0 | 18090 |
| legacy | Java 8 / Boot 2.3.12 | packaging-legacy/target | teamflow-packaging&#58;legacy-1.0.0 | 18091 |

现代线的 class 文件不能放进 Java 8 镜像，两个工程也不能共享 target。镜像标签、容器名和端口同时分开，才能在同一台
机器上按相同门禁顺序复跑而不互相覆盖。

### 3. 记录 Java 主版本

~~~bash
docker run --rm teamflow-packaging:modern-1.0.0 java -version
docker run --rm teamflow-packaging:legacy-1.0.0 java -version
~~~

第一条应报告 25，第二条应报告 1.8。它不能代替容器内应用的 HTTP 检查，但可以把 UnsupportedClassVersionError 归因到
版本线，而不是先修改 Dockerfile 的端口。

## 五、让容器反馈覆盖运行时边界

### 1. readiness 和 liveness 不是同一个问题

如果使用 Actuator，应明确暴露健康端点并选择工程实际存在的 readiness 路径，例如 `/actuator/health/readiness`。
readiness 表示实例可以接收流量；liveness 表示进程仍有继续运行的基础。上一课的 packaging 示例只依赖 Web starter，
没有 Actuator，因此本课示例先用容器 `running` 状态确认进程已启动，再用独立的 `/package-info` 业务请求确认入口和配置。
接入 Actuator 的工程必须把下面的健康请求替换为已验证的实际路径，不能凭“项目以后会有 readiness”编写不存在的 URL。

~~~bash
curl -fsS --retry 20 --retry-all-errors --retry-connrefused --retry-delay 1 \
  http://127.0.0.1:18090/actuator/health/readiness
~~~

-f 让 HTTP 4xx/5xx 转为失败，--retry-connrefused 覆盖应用尚未监听的窗口。健康响应中的 status 仍应检查为 UP；一个返回
200 但 body 为 DOWN 的自定义代理不能直接当作 readiness 通过。

### 2. 再做一条最小业务烟雾请求

健康端点可能只证明 Actuator 自己工作，不能证明应用入口和关键配置被正确打进镜像。对本课没有 Actuator 的工程，先检查
容器仍在运行，再执行业务探针：

~~~bash
test "$(docker inspect teamflow-packaging-modern --format '{{.State.Status}}')" = 'running'
response=$(curl -fsS --retry 20 --retry-all-errors --retry-connrefused --retry-delay 1 \
  http://127.0.0.1:18090/package-info)
printf '%s\n' "$response"
test "$response" = 'label=from-modern-container;jvm=modern'
~~~

该断言同时观察 HTTP 路由、环境变量 DELIVERY_LABEL 和入口中的 JVM 系统属性。不要只写 curl -I：HEAD 只检查响应头，
不能验证业务正文。也不要把一条 200 的静态欢迎页当作业务烟雾请求。

### 3. 从容器状态确认实际退出反馈

~~~bash
docker inspect teamflow-packaging-modern \
  --format 'status={{.State.Status}} exit={{.State.ExitCode}} error={{.State.Error}}'
docker logs teamflow-packaging-modern
~~~

门禁完成时容器应仍为 running，清理阶段才停止并删除它。若容器启动即退出，应先看 docker logs 和 State.ExitCode；
Unable to access jarfile 指向 COPY 路径，UnsupportedClassVersionError 指向 Java 版本，连接拒绝才需要检查监听和端口映射。

## 六、用 EXIT trap 保证失败也能清理

### 1. 保存原始退出码

EXIT trap 会在当前 shell 结束前运行。清理函数必须先保存 $?，否则 docker rm 的成功状态会把前面失败覆盖为 0：

~~~bash
cleanup() {
  exit_code=$?
  trap - EXIT
  docker rm -f teamflow-packaging-modern >/dev/null 2>&1 || true
  exit "$exit_code"
}
trap cleanup EXIT
~~~

trap - EXIT 防止清理函数内部再次触发自身。这里的 || true 只容忍“容器根本没有创建”或“已经被删除”，不应包住
Maven、Docker build 或 curl 主步骤。

### 2. 把资源创建放在 trap 之后

如果脚本先 docker run 再注册 trap，docker run 失败时没有清理机会。推荐的顺序是：声明容器名，注册 trap，执行测试和
产物检查，构建镜像，启动容器，做请求，最后由 trap 统一清理。

~~~bash
set -Eeuo pipefail
container_name=teamflow-packaging-modern
cleanup() {
  exit_code=$?
  trap - EXIT
  docker rm -f "$container_name" >/dev/null 2>&1 || true
  exit "$exit_code"
}
trap cleanup EXIT

docker run -d --name "$container_name" -p 18090:8080 \
  -e DELIVERY_LABEL=from-modern-container \
  teamflow-packaging:modern-1.0.0
~~~

set -e 使未处理的失败中止脚本，-u 把拼写错误的变量视为失败，pipefail 保留管道中任意命令的失败。它们提高门禁
的可解释性，但不替代每个关键命令的明确断言。

## 七、完整现代线门禁脚本

### 1. 从 clean verify 到业务请求

下面脚本放在 packaging-modern 工程根目录临时执行。它不写入仓库，也不删除主工程文件；运行结束后由 trap 删除本脚本
创建的容器。

~~~bash
#!/usr/bin/env bash
set -Eeuo pipefail

container_name=teamflow-packaging-modern
image_tag=teamflow-packaging:modern-1.0.0
app_jar=target/packaging-feedback-1.0.0.jar
maven_repo="$PWD/.m2-modern"
manifest_dir=$(mktemp -d)

cleanup() {
  exit_code=$?
  trap - EXIT
  docker rm -f "$container_name" >/dev/null 2>&1 || true
  rm -r "$manifest_dir" >/dev/null 2>&1 || true
  exit "$exit_code"
}
trap cleanup EXIT

mvn -B -Dmaven.repo.local="$maven_repo" clean verify
surefire_count=$(find target/surefire-reports -maxdepth 1 -type f -name '*.xml' | wc -l | tr -d ' ')
failsafe_count=$(find target/failsafe-reports -maxdepth 1 -type f -name '*.xml' | wc -l | tr -d ' ')
test "$surefire_count" -gt 0
test "$failsafe_count" -gt 0
printf 'surefire_reports=%s\n' "$surefire_count"
printf 'failsafe_reports=%s\n' "$failsafe_count"
test -f "$app_jar"
test "$(find target -maxdepth 1 -type f -name '*.jar' ! -name '*.jar.original' | wc -l | tr -d ' ')" -eq 1

app_jar_path="$PWD/$app_jar"
(cd "$manifest_dir" && jar --extract --file "$app_jar_path" META-INF/MANIFEST.MF)
manifest=$(<"$manifest_dir/META-INF/MANIFEST.MF")
printf '%s\n' "$manifest" | grep -F 'Main-Class: org.springframework.boot.loader.launch.JarLauncher'
printf '%s\n' "$manifest" | grep -F 'Start-Class: dev.teamflow.packaging.PackagingApplication'
printf '%s\n' "$manifest" | grep -F 'Spring-Boot-Classes: BOOT-INF/classes/'
printf '%s\n' "$manifest" | grep -F 'Spring-Boot-Lib: BOOT-INF/lib/'
jar --list --file "$app_jar" | grep -F 'BOOT-INF/classes/' >/dev/null
jar --list --file "$app_jar" | grep -F 'BOOT-INF/lib/' >/dev/null

docker build --pull -t "$image_tag" .
docker image inspect "$image_tag" --format \
  'id={{.Id}} user={{json .Config.User}} entrypoint={{json .Config.Entrypoint}} exposed={{json .Config.ExposedPorts}}'
test "$(docker image inspect "$image_tag" --format '{{.Config.User}}')" = 'teamflow'
test "$(docker image inspect "$image_tag" --format '{{json .Config.Entrypoint}}')" = '["java","-Ddelivery.jvm=modern","-jar","/app/application.jar"]'
test "$(docker image inspect "$image_tag" --format '{{json .Config.ExposedPorts}}')" = '{"8080/tcp":{}}'

docker run -d --name "$container_name" -p 18090:8080 \
  -e DELIVERY_LABEL=from-modern-container "$image_tag"

test "$(docker inspect "$container_name" --format '{{.State.Status}}')" = 'running'
printf 'readiness=container-running\n'

response=$(curl -fsS --retry 20 --retry-all-errors --retry-connrefused --retry-delay 1 \
  http://127.0.0.1:18090/package-info)
printf 'business=%s\n' "$response"
test "$response" = 'label=from-modern-container;jvm=modern'

test "$(docker inspect "$container_name" --format '{{.State.Status}}')" = 'running'
printf 'delivery=passed\n'
~~~

脚本中没有把 Docker 构建放在 mvn verify 前面，也没有把 readiness 当成业务请求。find 的计数只统计 target 根目录下的
非 .original JAR，避免把报告或嵌套目录计入主产物。真实项目若采用不同 artifactId，应把 app_jar 与 Manifest 的入口
改为该项目已验证的固定值，而不是放宽成通配符。

### 2. 预期反馈和失败定位

当前示例没有 Actuator，成功时最后三行类似：

~~~text
readiness=container-running
business=label=from-modern-container;jvm=modern
delivery=passed
~~~

如果 mvn verify 失败，镜像不应被构建；如果 Manifest 检查失败，镜像也不应被构建；如果 readiness 失败，脚本退出时
trap 会删除容器并保留 curl 的非零状态。由 docker inspect 读到的 status=exited 不能被后面的清理成功掩盖。

## 八、Java 8 兼容线复跑同一门禁

### 1. 只改变版本相关输入

在 packaging-legacy 根目录使用自己的 JDK 8 和 Boot 2.3.12 POM，脚本结构保持相同，但以下变量必须独立：

~~~bash
container_name=teamflow-packaging-legacy
image_tag=teamflow-packaging:legacy-1.0.0
app_jar=target/packaging-feedback-1.0.0.jar
maven_repo="$PWD/.m2-legacy"
host_port=18091
~~~

如果在同一个终端中切换 JDK，先确认：

~~~bash
java -version
mvn -version
~~~

输出的 Java 主版本必须为 8。更稳妥的做法是为兼容线使用单独的终端或绝对路径调用 /path/to/jdk8/bin/mvn，并将 Maven
本地仓库或缓存设置为与现代线不同的目录，避免插件和编译输出发生交叉污染。

### 2. 兼容线完整命令

~~~bash
#!/usr/bin/env bash
set -Eeuo pipefail

container_name=teamflow-packaging-legacy
image_tag=teamflow-packaging:legacy-1.0.0
app_jar=target/packaging-feedback-1.0.0.jar
maven_repo="$PWD/.m2-legacy"
manifest_dir=$(mktemp -d)

cleanup() {
  exit_code=$?
  trap - EXIT
  docker rm -f "$container_name" >/dev/null 2>&1 || true
  rm -r "$manifest_dir" >/dev/null 2>&1 || true
  exit "$exit_code"
}
trap cleanup EXIT

mvn -B -Dmaven.repo.local="$maven_repo" clean verify
printf 'surefire_reports=%s\n' "$(find target/surefire-reports -type f -name '*.xml' | sort)"
printf 'failsafe_reports=%s\n' "$(find target/failsafe-reports -type f -name '*.xml' | sort)"
surefire_count=$(find target/surefire-reports -maxdepth 1 -type f -name '*.xml' | wc -l | tr -d ' ')
failsafe_count=$(find target/failsafe-reports -maxdepth 1 -type f -name '*.xml' | wc -l | tr -d ' ')
test "$surefire_count" -gt 0
test "$failsafe_count" -gt 0
test -f "$app_jar"
test "$(find target -maxdepth 1 -type f -name '*.jar' ! -name '*.jar.original' | wc -l | tr -d ' ')" -eq 1
app_jar_path="$PWD/$app_jar"
(cd "$manifest_dir" && jar --extract --file "$app_jar_path" META-INF/MANIFEST.MF)
manifest=$(<"$manifest_dir/META-INF/MANIFEST.MF")
printf '%s\n' "$manifest" | grep -F 'Main-Class: org.springframework.boot.loader.JarLauncher'
printf '%s\n' "$manifest" | grep -F 'Start-Class: dev.teamflow.packaging.PackagingApplication'
jar --list --file "$app_jar" | grep -F 'BOOT-INF/classes/' >/dev/null
jar --list --file "$app_jar" | grep -F 'BOOT-INF/lib/' >/dev/null

docker build --pull -t "$image_tag" .
test "$(docker image inspect "$image_tag" --format '{{.Config.User}}')" = 'teamflow'
test "$(docker image inspect "$image_tag" --format '{{json .Config.Entrypoint}}')" = '["java","-Ddelivery.jvm=legacy","-jar","/app/application.jar"]'
test "$(docker image inspect "$image_tag" --format '{{json .Config.ExposedPorts}}')" = '{"8080/tcp":{}}'

docker run -d --name "$container_name" -p 18091:8080 \
  -e DELIVERY_LABEL=from-legacy-container "$image_tag"

test "$(docker inspect "$container_name" --format '{{.State.Status}}')" = 'running'
printf 'readiness=container-running\n'
response=$(curl -fsS --retry 20 --retry-all-errors --retry-connrefused --retry-delay 1 \
  http://127.0.0.1:18091/package-info)
printf 'business=%s\n' "$response"
test "$response" = 'label=from-legacy-container;jvm=legacy'
printf 'delivery=passed\n'
~~~

兼容线使用相同的业务路径，但镜像为 eclipse-temurin 8 jre jammy，Manifest 的 launcher 包名不同，宿主机端口、容器名和
镜像标签也不同。若要检查 readiness，必须先确认 Boot 2.3.12 工程实际暴露了哪个 Actuator 健康组；不能把现代工程的端点
配置未经验证地复制过去。

### 3. 两版结果的解释

| 观察项 | 现代线 | 兼容线 |
| --- | --- | --- |
| Java 运行时 | 25 | 8 |
| Boot launcher | org.springframework.boot.loader.launch.JarLauncher | org.springframework.boot.loader.JarLauncher |
| 容器端口 | 18090 → 8080 | 18091 → 8080 |
| 业务反馈 | jvm=modern | jvm=legacy |
| 可共享内容 | 门禁顺序、断言意图和路径合同 | 门禁顺序、断言意图和路径合同 |

两版“都通过”不表示可以互换 JAR。它表示各自的编译器、依赖、归档、镜像和容器反馈都满足同一份交付能力合同。

## 九、主要易错项

下面的错误都能让门禁给出看似合理但不可信的结果。每项都包含触发条件、原因、后果、错误示例、正确写法和验证方式。

:::pitfalls
### 直接调用 integration-test

**现象：** 集成测试日志显示执行过，但命令仍以 0 退出，后续脚本继续构建镜像。

**触发条件：** 把 mvn integration-test 当作完整交付命令。

**原因：** Failsafe 在 integration-test 运行测试，在 verify 才执行最终结果校验。

**后果：** 失败的集成测试可能没有通过最终门禁，镜像包装了未经完整验证的 JAR。

**错误示例：**

~~~bash
mvn -B clean integration-test
docker build -t teamflow-packaging:modern-1.0.0 .
~~~

**正确写法：**

~~~bash
mvn -B clean verify
docker build -t teamflow-packaging:modern-1.0.0 .
~~~

**影响版本：** Maven Surefire/Failsafe 3.x；Java 8 与 JDK 25 均适用。

**验证方式：** 在一个 *IT 测试中制造失败，比较两个命令的退出码；只有 verify 必须阻止后续镜像构建。

**来源：** Maven Failsafe Plugin 使用说明。

### 用通配符选择 JAR

**现象：** 容器报 no main manifest attribute 或 Unable to access jarfile。

**触发条件：** 使用 target/*.jar 或按 shell 展开顺序取第一个归档。

**原因：** target 可能同时包含可执行 JAR 和 .jar.original，通配符不表达归档职责。

**后果：** 测试通过但镜像复制了错误文件，故障直到容器启动才暴露。

**错误示例：**

~~~dockerfile
COPY target/*.jar /app/application.jar
~~~

**正确写法：**

~~~dockerfile
COPY target/packaging-feedback-1.0.0.jar /app/application.jar
~~~

**影响版本：** Spring Boot 2.3.12 和 4.1.1 均适用。

**验证方式：** 用 `jar --list --file` 列出归档并读取 Manifest；主 JAR 必须包含 Boot loader、Start-Class、BOOT-INF/classes 和 BOOT-INF/lib。

**来源：** Spring Boot Executable Jar Format。

### 清理函数覆盖原始失败

**现象：** curl 失败，但脚本最终退出码为 0，CI 或上层脚本误判成功。

**触发条件：** 在 EXIT trap 中先执行成功的 docker rm，最后直接 exit 0 或使用了新的 $?。

**原因：** trap 中的 $? 会随着每条清理命令改变。

**后果：** 失败证据被清理动作覆盖，问题无法阻止交付。

**错误示例：**

~~~bash
cleanup() {
  docker rm -f teamflow-packaging-modern || true
  exit $?
}
~~~

**正确写法：**

~~~bash
cleanup() {
  exit_code=$?
  trap - EXIT
  docker rm -f teamflow-packaging-modern >/dev/null 2>&1 || true
  exit "$exit_code"
}
~~~

**影响版本：** Bash 5.x；脚本运行环境与 Java 版本无关。

**验证方式：** 在业务 curl 前加入必失败断言，确认脚本非零退出且 docker ps -a 不再保留该容器。

**来源：** Bash trap 手册。

### 只检查健康端点

**现象：** readiness 为 UP，但业务路径返回默认配置或 404，仍被报告为交付成功。

**触发条件：** 已确认工程暴露 /actuator/health/readiness，但门禁只调用该端点，不执行业务烟雾请求。

**原因：** Actuator 健康检查与 Controller、环境变量和镜像入口属于不同边界。

**后果：** 路由、配置或 JAR 内容错误会逃过最终检查。

**错误示例：**

~~~bash
curl -fsS http://127.0.0.1:18090/actuator/health/readiness
printf 'delivery=passed\n'
~~~

**正确写法：**

~~~bash
curl -fsS http://127.0.0.1:18090/actuator/health/readiness | grep -F '"status":"UP"'
test "$(curl -fsS http://127.0.0.1:18090/package-info)" = 'label=from-modern-container;jvm=modern'
~~~

**影响版本：** Spring Boot 2.3.12 与 4.1.1；端点是否存在需以当前工程配置为准。

**验证方式：** 暂时改错 DELIVERY_LABEL 或业务路径，健康请求应仍可能通过，而业务断言必须失败。

**来源：** Spring Boot Actuator Endpoints。
:::

## 十、独立练习

### 1. 任务与验收

:::exercise
### 编写 TeamFlow 双版本交付门禁

**要求：** 在两个独立工程中各写一个临时 Bash 门禁脚本。脚本必须先执行 mvn -B clean verify，再检查固定主 JAR 的
Manifest 和 BOOT-INF 目录，之后构建对应 Docker 镜像并检查非 root 用户、入口和 8080 端口，最后启动容器执行 readiness
（若工程未暴露任何健康端点，则检查容器 running 状态）和 GET /package-info。使用 set -Eeuo pipefail 与 trap EXIT，容器名、
镜像标签、target、Java 版本和宿主机端口在 modern/legacy 两条线之间不得复用。脚本不引入 CI 平台或 Compose 配置。

**验收：** 两个脚本都能在各自工程根目录运行；任意测试、Manifest、镜像、健康或业务请求失败时脚本以非零退出并清理容器；
成功时输出测试报告路径、镜像 ID、user=teamflow、8080/tcp、健康状态和 delivery=passed；modern 使用 JDK 25 / Boot 4.1.1，
legacy 使用 Java 8 / Boot 2.3.12.RELEASE，两个 JAR、镜像和运行容器均未交叉使用。
:::

### 2. JDK 25 完整参考实现

~~~bash
#!/usr/bin/env bash
set -Eeuo pipefail

container_name=teamflow-packaging-modern
image_tag=teamflow-packaging:modern-1.0.0
app_jar=target/packaging-feedback-1.0.0.jar
maven_repo="$PWD/.m2-modern"
manifest_dir=$(mktemp -d)

cleanup() {
  exit_code=$?
  trap - EXIT
  docker rm -f "$container_name" >/dev/null 2>&1 || true
  rm -r "$manifest_dir" >/dev/null 2>&1 || true
  exit "$exit_code"
}
trap cleanup EXIT

mvn -B -Dmaven.repo.local="$maven_repo" clean verify
printf 'surefire_reports=%s\n' "$(find target/surefire-reports -type f -name '*.xml' | sort)"
printf 'failsafe_reports=%s\n' "$(find target/failsafe-reports -type f -name '*.xml' | sort)"
surefire_count=$(find target/surefire-reports -maxdepth 1 -type f -name '*.xml' | wc -l | tr -d ' ')
failsafe_count=$(find target/failsafe-reports -maxdepth 1 -type f -name '*.xml' | wc -l | tr -d ' ')
test "$surefire_count" -gt 0
test "$failsafe_count" -gt 0
test -f "$app_jar"
app_jar_path="$PWD/$app_jar"
(cd "$manifest_dir" && jar --extract --file "$app_jar_path" META-INF/MANIFEST.MF)
manifest=$(<"$manifest_dir/META-INF/MANIFEST.MF")
printf '%s\n' "$manifest" | grep -F 'Main-Class: org.springframework.boot.loader.launch.JarLauncher'
printf '%s\n' "$manifest" | grep -F 'Start-Class: dev.teamflow.packaging.PackagingApplication'
printf '%s\n' "$manifest" | grep -F 'Spring-Boot-Classes: BOOT-INF/classes/'
printf '%s\n' "$manifest" | grep -F 'Spring-Boot-Lib: BOOT-INF/lib/'
jar --list --file "$app_jar" | grep -F 'BOOT-INF/classes/' >/dev/null
jar --list --file "$app_jar" | grep -F 'BOOT-INF/lib/' >/dev/null

docker build --pull -t "$image_tag" .
image_id=$(docker image inspect "$image_tag" --format '{{.Id}}')
test -n "$image_id"
test "$(docker image inspect "$image_tag" --format '{{.Config.User}}')" = 'teamflow'
test "$(docker image inspect "$image_tag" --format '{{json .Config.Entrypoint}}')" = '["java","-Ddelivery.jvm=modern","-jar","/app/application.jar"]'
test "$(docker image inspect "$image_tag" --format '{{json .Config.ExposedPorts}}')" = '{"8080/tcp":{}}'
printf 'image_id=%s user=teamflow exposed=8080/tcp\n' "$image_id"

docker run -d --name "$container_name" -p 18090:8080 \
  -e DELIVERY_LABEL=from-modern-container "$image_tag"
test "$(docker inspect "$container_name" --format '{{.State.Status}}')" = 'running'
printf 'readiness=container-running\n'
response=$(curl -fsS --retry 20 --retry-all-errors --retry-connrefused --retry-delay 1 \
  http://127.0.0.1:18090/package-info)
test "$response" = 'label=from-modern-container;jvm=modern'
printf 'business=%s\ndelivery=passed\n' "$response"
~~~

### 3. Java 8 完整参考实现

~~~bash
#!/usr/bin/env bash
set -Eeuo pipefail

container_name=teamflow-packaging-legacy
image_tag=teamflow-packaging:legacy-1.0.0
app_jar=target/packaging-feedback-1.0.0.jar
maven_repo="$PWD/.m2-legacy"
manifest_dir=$(mktemp -d)

cleanup() {
  exit_code=$?
  trap - EXIT
  docker rm -f "$container_name" >/dev/null 2>&1 || true
  rm -r "$manifest_dir" >/dev/null 2>&1 || true
  exit "$exit_code"
}
trap cleanup EXIT

mvn -B -Dmaven.repo.local="$maven_repo" clean verify
printf 'surefire_reports=%s\n' "$(find target/surefire-reports -type f -name '*.xml' | sort)"
printf 'failsafe_reports=%s\n' "$(find target/failsafe-reports -type f -name '*.xml' | sort)"
surefire_count=$(find target/surefire-reports -maxdepth 1 -type f -name '*.xml' | wc -l | tr -d ' ')
failsafe_count=$(find target/failsafe-reports -maxdepth 1 -type f -name '*.xml' | wc -l | tr -d ' ')
test "$surefire_count" -gt 0
test "$failsafe_count" -gt 0
test -f "$app_jar"
test "$(find target -maxdepth 1 -type f -name '*.jar' ! -name '*.jar.original' | wc -l | tr -d ' ')" -eq 1
app_jar_path="$PWD/$app_jar"
(cd "$manifest_dir" && jar --extract --file "$app_jar_path" META-INF/MANIFEST.MF)
manifest=$(<"$manifest_dir/META-INF/MANIFEST.MF")
printf '%s\n' "$manifest" | grep -F 'Main-Class: org.springframework.boot.loader.JarLauncher'
printf '%s\n' "$manifest" | grep -F 'Start-Class: dev.teamflow.packaging.PackagingApplication'
jar --list --file "$app_jar" | grep -F 'BOOT-INF/classes/' >/dev/null
jar --list --file "$app_jar" | grep -F 'BOOT-INF/lib/' >/dev/null

docker build --pull -t "$image_tag" .
image_id=$(docker image inspect "$image_tag" --format '{{.Id}}')
test -n "$image_id"
test "$(docker image inspect "$image_tag" --format '{{.Config.User}}')" = 'teamflow'
test "$(docker image inspect "$image_tag" --format '{{json .Config.Entrypoint}}')" = '["java","-Ddelivery.jvm=legacy","-jar","/app/application.jar"]'
test "$(docker image inspect "$image_tag" --format '{{json .Config.ExposedPorts}}')" = '{"8080/tcp":{}}'
printf 'image_id=%s user=teamflow exposed=8080/tcp\n' "$image_id"

docker run -d --name "$container_name" -p 18091:8080 \
  -e DELIVERY_LABEL=from-legacy-container "$image_tag"
test "$(docker inspect "$container_name" --format '{{.State.Status}}')" = 'running'
printf 'readiness=container-running\n'
response=$(curl -fsS --retry 20 --retry-all-errors --retry-connrefused --retry-delay 1 \
  http://127.0.0.1:18091/package-info)
test "$response" = 'label=from-legacy-container;jvm=legacy'
printf 'business=%s\ndelivery=passed\n' "$response"
~~~

Java 8 示例中的健康端点必须以兼容工程实际暴露的配置为准，不能把现代工程的 URL 未经验证地复制过去。两份脚本的共同
门禁顺序不变，只有 Java 版本、launcher、标签、端口和配置值不同。

### 4. 运行结果与自检

两条脚本都成功时，应分别看到自己的报告目录、镜像 ID、非 root 用户、端口声明和业务反馈。现代线业务结果为：

~~~text
business=label=from-modern-container;jvm=modern
delivery=passed
~~~

兼容线业务结果为：

~~~text
business=label=from-legacy-container;jvm=legacy
delivery=passed
~~~

练习完成后检查 docker ps -a --filter name=teamflow-packaging-modern 与 docker ps -a --filter name=teamflow-packaging-legacy，
不应留下脚本创建的容器。确认清理结果时不要删除镜像，因为镜像 ID 是本次交付检查的证据。

## 十一、本课小结

可重复的交付检查是一条有顺序的反馈链：mvn -B clean verify 先把测试结果固定下来，接着用 Manifest 和 BOOT-INF 确认
唯一可执行 JAR，再用 docker image inspect 检查最终镜像的用户、入口和端口，最后在运行容器中完成 readiness 与业务烟雾
请求。测试、产物、镜像和容器分别回答不同问题，不能互相替代。

门禁脚本使用固定文件名和显式断言，任何失败都通过 set -Eeuo pipefail 立即停止，并由 trap EXIT 清理容器后返回原始
退出码。现代 JDK 25 / Boot 4.1.1 与 Java 8 / Boot 2.3.12 共享检查意图，却必须隔离源码输出、Maven 缓存、JAR、镜像标签、
容器名和端口。完成本课后，你可以把一次“在本机能运行”转化为一份可重跑、可定位、可交付的本地证据；CI 或生产发布平台
只是未来承载这条门禁的地方，不改变它的基本顺序。
