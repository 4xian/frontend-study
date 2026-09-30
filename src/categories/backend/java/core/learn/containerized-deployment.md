---
id: backend.java.learn.intermediate.containerized-deployment
type: lesson
title: 容器化部署
summary: 把可执行 Spring Boot JAR 封装成非 root Docker 镜像，并验证端口、配置、日志与停止信号的完整运行边界
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 160
prerequisites:
  - backend.java.learn.intermediate.application-packaging
objectives:
  - 能区分可执行 JAR、镜像和容器三个交付层次，并说明 Dockerfile、镜像配置和容器运行参数各自负责什么。
  - 能使用明确的 Eclipse Temurin JRE 基础镜像，把上一课的唯一可执行 JAR 复制为固定容器路径。
  - 能设计只包含目标 JAR 的构建上下文，并解释 `.dockerignore` 为什么同时影响构建速度和输入边界。
  - 能通过 `USER` 与 `COPY --chown` 让 Java 进程以非 root 身份运行，并用 inspect 和容器内命令验证身份。
  - 能区分应用监听端口、Dockerfile 的 `EXPOSE` 与 `docker run -p`，并从宿主机完成 HTTP 验证。
  - 能用环境变量和镜像名后的命令行参数覆盖 Spring Boot 配置，并观察命令行属性的优先级。
  - 能解释 exec-form `ENTRYPOINT`、PID 1、`SIGTERM` 和 `docker stop --timeout` 之间的信号传递关系。
  - 能分别完成 JDK 25 / Spring Boot 4.1.1 与 Java 8 / Spring Boot 2.3.12.RELEASE 的镜像构建、运行和停止反馈环。
recap:
  - JAR 是应用产物，镜像是只读运行模板，容器是镜像的一次运行实例；修改容器不会反向修改镜像。
  - 构建上下文决定 `COPY` 能看到什么，固定 JAR 路径和 `.dockerignore` 能避免把 `.jar.original` 或无关文件带入镜像。
  - 运行镜像只需要 JRE；使用明确的 Java 主版本和操作系统标签，比 `latest` 更容易复现和排错。
  - "`USER` 决定运行时身份，`COPY --chown` 决定文件所有权，两者要一起验证，不能只看 Dockerfile 字面量。"
  - "`EXPOSE 8080` 只声明镜像端口，`-p 18090:8080` 才把宿主机 18090 发布到容器 8080。"
  - exec-form `ENTRYPOINT` 让 Java 直接成为 PID 1；Docker 默认先发送 `SIGTERM`，超时后才发送 `SIGKILL`。
  - Spring Boot 4.1 默认使用优雅停机，Boot 2.3.12 必须显式开启；Docker 等待时间应大于应用宽限期。
  - 镜像标签便于阅读但仍可移动，正式交付可以额外记录 digest；Registry、编排与供应链发布不属于本课。
related:
  - backend.java.learn.intermediate.health-checks-and-graceful-shutdown
  - backend.java.learn.intermediate.application-packaging
tags:
  - Java
  - Spring Boot
  - Docker
  - Dockerfile
  - 容器
  - 非 root
  - 端口映射
  - 优雅停机
  - 容器化部署
appliesTo: JDK 25 / Spring Boot 4.1.1 主线；Java 8 / Spring Boot 2.3.12.RELEASE 兼容线；Docker Engine 29.x
verifiedAt: 2026-08-30
sources:
  - id: dockerfile-reference
    title: Dockerfile Reference
    url: https://docs.docker.com/reference/dockerfile/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Dockerfile current reference
    claims:
      - "`FROM`、`WORKDIR`、`COPY`、`USER`、`EXPOSE` 与 `ENTRYPOINT` 的指令合同。"
      - exec form 不自动启动 shell，shell form 会通过命令 shell 执行。
      - "`USER` 同时影响后续构建指令和容器运行时的默认身份。"
  - id: docker-build-context
    title: Docker Build Context
    url: https://docs.docker.com/build/concepts/context/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Docker Build current documentation
    claims:
      - 构建上下文是 builder 能访问的文件集合，`COPY` 不能读取上下文之外的文件。
      - "`.dockerignore` 会在上下文发送给 builder 前排除匹配内容。"
  - id: docker-run-containers
    title: Running Containers
    url: https://docs.docker.com/engine/containers/run/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Docker Engine current documentation
    claims:
      - 镜像名后的参数会覆盖 `CMD` 或追加给 exec-form `ENTRYPOINT`。
      - 端口发布、环境变量和容器运行实例由 `docker run` 配置。
  - id: docker-container-stop
    title: Docker Container Stop
    url: https://docs.docker.com/reference/cli/docker/container/stop/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Docker CLI current documentation
    claims:
      - Docker 默认先向容器主进程发送 `SIGTERM`，等待超时后再发送 `SIGKILL`。
      - "`--timeout` 控制强制终止前的等待秒数。"
  - id: docker-image-tag
    title: Docker Image Tag
    url: https://docs.docker.com/reference/cli/docker/image/tag/
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Docker CLI current documentation
    claims:
      - 镜像引用由 registry、namespace、repository 与 tag 组成，缺省 tag 为 `latest`。
  - id: eclipse-temurin-official-images
    title: Eclipse Temurin Docker Official Images Manifest
    url: https://github.com/docker-library/official-images/blob/master/library/eclipse-temurin
    sourceOrigin: official
    sourceType: source-code
    appliesTo: Docker Official Images manifest verified 2026-08-30
    claims:
      - Eclipse Temurin 官方镜像提供 JDK 25 与 Java 8 的 JRE Ubuntu Jammy 标签。
      - 版本与操作系统后缀共同确定本课使用的基础镜像线。
  - id: spring-boot-dockerfiles
    title: Spring Boot Dockerfiles
    url: https://docs.spring.io/spring-boot/reference/packaging/container-images/dockerfiles.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.x
    claims:
      - Spring Boot 可执行 JAR 可以直接复制进 Docker 镜像并使用 `java -jar` 启动。
      - 分层 JAR 可以优化镜像层，但不是运行一个可执行 JAR 的必要条件。
  - id: spring-boot-external-config
    title: Spring Boot Externalized Configuration
    url: https://docs.spring.io/spring-boot/reference/features/external-config.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.x
    claims:
      - 环境变量可以使用大写和下划线映射 Spring Boot 属性。
      - 命令行属性来源优先于操作系统环境变量。
  - id: spring-boot-graceful-shutdown
    title: Spring Boot Graceful Shutdown
    url: https://docs.spring.io/spring-boot/reference/web/graceful-shutdown.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.x
    claims:
      - 优雅停机默认启用，并使用 `spring.lifecycle.timeout-per-shutdown-phase` 配置宽限期。
  - id: spring-boot-system-requirements
    title: Spring Boot System Requirements
    url: https://docs.spring.io/spring-boot/system-requirements.html
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.x
    claims:
      - Spring Boot 4.1 支持 Java 25，运行镜像必须提供兼容 Java 运行时。
  - id: spring-boot-2312-container-images
    title: Spring Boot 2.3.12 Container Images
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/spring-boot-features.html#boot-features-container-images-docker
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Boot 2.3.12 可执行 JAR 可以在 Java 8 运行镜像中使用 `java -jar` 启动。
      - Boot 2.3 的分层工具与现代 `jarmode=tools` 不同，本课不复用现代分层 Dockerfile。
  - id: spring-boot-2312-graceful-shutdown
    title: Spring Boot 2.3.12 Graceful Shutdown
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/spring-boot-features.html#boot-features-graceful-shutdown
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Boot 2.3.12 需要显式配置 `server.shutdown=graceful`。
      - "`spring.lifecycle.timeout-per-shutdown-phase` 控制停机阶段的最大等待时间。"
  - id: spring-boot-2312-requirements
    title: Spring Boot 2.3.12 System Requirements
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#system-requirements
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Spring Boot 2.3.12 支持 Java 8，兼容线运行镜像应保持 Java 8。
---

# 容器化部署

上一课已经把 TeamFlow 后端打成了可以用 `java -jar` 启动的文件，但“有一个 JAR”还没有解决运行环境是否一致、
进程以谁的身份启动、端口怎样暴露、配置从哪里进入以及停止信号能否到达应用。容器化要做的不是重新发明打包，
而是把这些运行条件写成一个可以重复创建的镜像合同。

本课继续使用上一课的 `packaging-modern` 与 `packaging-legacy` 两个独立工程。你会为已经验证过的主 JAR 添加
Dockerfile 和 `.dockerignore`，再用真实容器观察用户、PID 1、端口、配置优先级、标准输出和优雅停机。Docker Compose、
Registry 推送、Kubernetes、Buildpacks、镜像签名与发布流水线不在本课范围。

## 一、先分清 JAR、镜像和容器

### 1. 三层产物回答三个不同问题

可执行 JAR 回答“应用代码和依赖怎样被 Java 启动”；镜像回答“这个 JAR 在什么文件系统和 Java 运行时中启动”；
容器回答“这次运行使用什么名称、端口、环境变量和资源边界”。它们的关系是：

```text
源代码
  -> mvn package
  -> packaging-feedback-1.0.0.jar
  -> docker build
  -> teamflow-packaging:modern-1.0.0
  -> docker run
  -> teamflow-packaging-modern 容器
```

镜像是创建容器的只读模板。一个镜像可以创建多个容器，每个容器都有自己的运行状态和可写层；停止或删除一个
容器不会删除镜像，重新创建容器也不会继承前一个容器可写层里的临时修改。因此应用配置不能依赖“先进入某个旧
容器手工改文件”，而应由镜像或每次 `docker run` 的参数明确提供。

下面的命令分别观察镜像和容器，它们不是同一个对象：

```bash
docker image ls teamflow-packaging
docker container ls --all --filter name=teamflow-packaging
```

镜像列表关注 repository、tag、image ID；容器列表关注 name、status、ports 和它来自哪个 image。排错时先确认自己
正在检查哪一层，不能用“镜像存在”推断“容器正在监听”，也不能用“容器退出”推断“镜像构建失败”。

### 2. 运行镜像只保留运行所需工具

上一课已经在宿主工程中执行 `mvn package`，因此本课镜像只负责运行 JAR，不需要再次编译源码。运行时使用 JRE，
不用把 Maven、`javac` 和完整 JDK 一起放入最终镜像：

```dockerfile
FROM eclipse-temurin:25-jre-jammy
```

兼容线对应：

```dockerfile
FROM eclipse-temurin:8-jre-jammy
```

`25` 与 `8` 固定 Java 主版本，`jre` 表达运行职责，`jammy` 固定 Ubuntu 22.04 这一操作系统线。不要写
`eclipse-temurin:latest`：缺省或显式的 `latest` 无法告诉维护者应用需要哪个 Java 主版本，也可能在下一次拉取后指向
不同运行环境。

镜像标签仍然是可以被发布方更新的名称，不等于不可变证据。正式交付可以在构建记录中同时保存基础镜像 digest，
本课先用可读标签建立正确运行合同，不展开镜像仓库的 digest 发布流程。

### 3. 多阶段和分层是优化，不是启动前提

Docker 支持在一个 Dockerfile 中使用构建阶段运行 Maven，再把 JAR 复制到较小的运行阶段；Spring Boot 也支持把可执行
JAR 按依赖、loader 与应用代码拆成镜像层。这些能力能优化缓存和最终镜像，但不会改变本课的核心运行边界。

当前先沿用上一课已经验证的宿主机 JAR，可以把失败明确归到“打包”或“容器运行”其中一层。Boot 4.1 的分层提取使用
`jarmode=tools`，Boot 2.3.12 使用旧的 `layertools`，不能把一份现代分层 Dockerfile 原样复制到兼容线。多阶段缓存、
分层策略、AOT Cache、CDS 和 jlink 留给容器优化专项。

## 二、把构建输入收窄到唯一 JAR

### 1. 构建上下文决定 COPY 能看见什么

执行下面的命令时，最后的 `.` 表示把当前工程目录作为构建上下文：

```bash
docker build -t teamflow-packaging:modern-1.0.0 .
```

Dockerfile 中的 `COPY` 只能读取这个上下文，不能越过上下文去复制任意宿主机路径。上下文过大时，Git 历史、IDE 配置、
源码、日志和其他构建产物都会进入 builder 的候选输入；即使最后没有 `COPY` 到镜像，也会增加传输和泄漏无关文件的
风险。

上一课的 `target` 同时包含主 JAR 和 `.jar.original`。本课使用固定文件名，不使用 `target/*.jar`：

```dockerfile
COPY target/packaging-feedback-1.0.0.jar /app/application.jar
```

固定输入能在 artifactId 或版本变化时立即失败，也不会让通配符同时匹配主 JAR 与 `.jar.original`。容器内统一命名为
`/app/application.jar`，运行命令不再依赖宿主工程的 Maven 目录结构。

### 2. `.dockerignore` 只放行交付物

在两个工程根目录都创建 `.dockerignore`：

```dockerignore
*
!target/
target/*
!target/packaging-feedback-1.0.0.jar
```

规则按顺序处理：先忽略全部内容，再重新允许进入 `target` 目录，随后忽略目录中的全部文件，最后只放行主 JAR。
Dockerfile 与 `.dockerignore` 本身仍会被 builder 读取，但不能被 `COPY` 进镜像。最终上下文不包含源码、`.git`、
`.idea`、日志和 `.jar.original`。

可以先查看构建日志中的 context 大小，再临时在 `target` 放入一个大文件重建。正确的 `.dockerignore` 不会因为这个无关
文件明显扩大上下文，也不会让下面的错误复制成功：

```dockerfile
COPY target/packaging-feedback-1.0.0.jar.original /app/application.jar
```

builder 应报告源文件不在上下文中。这比“复制进去以后再判断能否启动”更早暴露错误产物。

### 3. 工作目录和所有权共同定义文件边界

`WORKDIR` 使用绝对路径，并影响后续 `RUN`、`COPY`、`ENTRYPOINT` 等指令的相对路径：

```dockerfile
WORKDIR /app
```

创建独立用户后，用 `COPY --chown` 在复制时写入正确所有权：

```dockerfile
RUN groupadd --system teamflow \
    && useradd --system --gid teamflow --home-dir /app --no-create-home teamflow

COPY --chown=teamflow:teamflow \
  target/packaging-feedback-1.0.0.jar \
  /app/application.jar

USER teamflow
```

`USER teamflow` 决定之后的默认运行身份，`COPY --chown` 决定 JAR 的 owner 和 group。只写其中一项不构成完整验证：
进程可能已经非 root，但文件仍由 root 所有；也可能文件属于普通用户，进程却仍以 root 运行。

构建后分别检查镜像配置和真实容器：

```bash
docker image inspect teamflow-packaging:modern-1.0.0 \
  --format 'user={{.Config.User}}'

docker exec teamflow-packaging-modern id
docker exec teamflow-packaging-modern ls -l /app/application.jar
```

预期镜像 user 为 `teamflow`，容器 UID 不是 0，JAR owner 与 group 都是 `teamflow`。Java Web 应用不需要 root 权限；若将来
需要写文件，应为明确目录单独配置权限或挂载，不要为了省事删掉 `USER`。

## 三、把运行时端口和配置留在容器外

### 1. EXPOSE 不等于发布宿主机端口

本课应用仍在容器内监听 8080，Dockerfile 使用：

```dockerfile
EXPOSE 8080
```

`EXPOSE` 记录镜像期望监听的端口，便于 inspect 和工具理解镜像合同，但它不会自动打开宿主机端口。真正让宿主机访问
容器的是 `docker run -p`：

```bash
docker run -d --name teamflow-packaging-modern \
  -p 18090:8080 \
  teamflow-packaging:modern-1.0.0
```

`18090` 是宿主机端口，`8080` 是容器端口。请求地址应是：

```bash
curl -fsS http://127.0.0.1:18090/package-info
```

如果写成 `-p 18090:8081`，但 Spring Boot 仍监听 8080，Docker 会把流量转发到没有进程监听的容器端口。排错时依次检查
应用日志中的监听端口、`docker port` 的映射和请求使用的宿主机端口，不要把三者混成一个数字。

### 2. 环境变量表达每次运行的配置

Spring Boot 的 relaxed binding 会把环境变量 `DELIVERY_LABEL` 映射为 `delivery.label`。同一个镜像可以用不同运行参数创建
多个容器，无需重建镜像：

```bash
docker run -d --name teamflow-packaging-modern \
  -p 18090:8080 \
  -e DELIVERY_LABEL=from-modern-container \
  teamflow-packaging:modern-1.0.0
```

`DELIVERY_LABEL` 只是无敏感教学值。密码、token 和私钥同样不应写进 Dockerfile 的 `ENV` 或 `RUN`，因为镜像层和 inspect
结果可能长期保留这些值。真实秘密应由部署平台的 secret 机制在运行时注入，本课不展开具体平台。

镜像定义 exec-form `ENTRYPOINT` 后，镜像名之后的参数会追加到 Java 命令末尾：

```bash
docker run --rm -d --name teamflow-packaging-args \
  -p 18092:8080 \
  -e DELIVERY_LABEL=from-environment \
  teamflow-packaging:modern-1.0.0 \
  --delivery.label=from-command-line
```

最终进程参数等价于：

```text
java -Ddelivery.jvm=modern -jar /app/application.jar --delivery.label=from-command-line
```

Spring Boot 命令行属性优先于操作系统环境变量，因此 `/package-info` 应返回命令行值。这个反馈同时证明了 Docker 的参数
追加规则和 Spring Boot 的配置优先级。

### 3. 应用日志直接进入容器日志

Spring Boot 默认把日志写入控制台（通常是标准输出），Docker 会捕获容器主进程的标准输出和标准错误。后台启动后使用：

```bash
docker logs teamflow-packaging-modern
docker logs --follow teamflow-packaging-modern
```

启动失败时先读容器日志，再检查状态：

```bash
docker inspect teamflow-packaging-modern \
  --format 'status={{.State.Status}} exit={{.State.ExitCode}} error={{.State.Error}}'
```

不要在容器内只写一个无人采集的本地日志文件，也不要靠 `docker exec` 进入已经退出的容器猜测原因。日志与可观测性的
字段设计已经在前课完成，本课只确认容器边界能够保留标准输出反馈。

## 四、让停止信号真正到达 Java

### 1. exec form 让 Java 成为 PID 1

现代线入口写成 JSON 数组：

```dockerfile
ENTRYPOINT ["java", "-Ddelivery.jvm=modern", "-jar", "/app/application.jar"]
```

这叫 exec form。Docker 直接启动 `java`，Java 成为容器主进程和 PID 1。可以在运行中验证：

```bash
docker exec teamflow-packaging-modern sh -c \
  'tr "\000" " " </proc/1/cmdline; printf "\n"'
```

预期第一项就是 `java`。下面的 shell form 看起来更短，却会通过 `/bin/sh -c` 启动：

```dockerfile
ENTRYPOINT java -Ddelivery.jvm=modern -jar /app/application.jar
```

此时 Java 不再直接成为 PID 1，shell 也不会自动把收到的停止信号可靠转交给子进程。若以后确实需要入口脚本，脚本最后
应使用 `exec "$@"` 替换自身；当前没有脚本需求，直接使用 exec-form `ENTRYPOINT` 最清楚。

### 2. Docker 超时要覆盖应用宽限期

`docker stop` 默认向容器主进程发送 `SIGTERM`。如果进程在等待时间内没有退出，Docker 再发送不可捕获的 `SIGKILL`。
上一课使用 10 秒 Spring 生命周期宽限期，本课显式保留配置：

```properties
server.port=8080
delivery.label=from-default
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=10s
```

Boot 4.1 默认启用 graceful，这里显式写出是为了让两条版本线的运行合同可见；Boot 2.3.12 必须显式设置
`server.shutdown=graceful`。Docker 在 Linux 上的默认停止等待也是 10 秒，等于应用上限时没有余量，因此本课使用：

```bash
docker stop --timeout 15 teamflow-packaging-modern
```

15 秒是 Docker 允许应用完成关闭的上限，不是固定等待时间。没有在途请求时，应用可以很快退出；存在 5 秒慢请求时，
应用应先完成请求，再在宽限期内退出。

### 3. 用慢请求观察完整信号链

在上一课的 `PackagingApplication` 中增加一个只用于教学验证的入口：

```java
/**
 * 等待五秒后返回，用于观察容器停止时的在途请求。
 *
 * @return 已完成慢请求的反馈
 * @throws InterruptedException 当前线程被强制中断时抛出
 */
@GetMapping("/slow")
public String slow() throws InterruptedException {
    Thread.sleep(5000L);
    return "slow-finished";
}
```

启动容器后执行：

```bash
curl -fsS http://127.0.0.1:18090/slow > /tmp/teamflow-container-slow.txt &
slow_pid=$!

sleep 1
docker stop --timeout 15 teamflow-packaging-modern

wait "$slow_pid"
cat /tmp/teamflow-container-slow.txt
docker inspect teamflow-packaging-modern \
  --format 'status={{.State.Status}} exit={{.State.ExitCode}}'
```

预期文件内容为 `slow-finished`，容器状态为 `exited`。本课 Linux Docker 反馈中，Java 主进程因 `SIGTERM` 结束时容器
退出码为 143，也就是 `128 + 15`；这不等于优雅停机失败。`docker stop` 命令自身成功返回 0，与容器主进程记录的退出码
不是同一个值。反馈链依次是 Docker 发送 `SIGTERM`、Java PID 1 接收信号、Spring Boot 停止接收新任务、已进入处理的
请求完成、JVM 结束。`docker kill` 默认发送 `SIGKILL`，不能用来证明优雅停机；被 `SIGKILL` 结束的 Linux 进程通常记录
137。

## 五、集中排查容器边界错误

### 七个典型错误

:::pitfalls
### 用 shell form 启动 Java

**触发条件：** Dockerfile 使用没有 JSON 数组的 `ENTRYPOINT java -jar ...`，再用 `docker stop` 验证优雅停机。

**原因：** shell form 通过 `/bin/sh -c` 启动，Java 不是容器 PID 1，shell 不会自动把信号可靠转发给 Java 子进程。

**后果：** Spring Boot 可能收不到 `SIGTERM`，容器等待到超时后被 `SIGKILL` 终止，在途请求和关闭回调无法完成。

**错误示例：**

```dockerfile
ENTRYPOINT java -jar /app/application.jar
```

**正确写法：**

```dockerfile
ENTRYPOINT ["java", "-jar", "/app/application.jar"]
```

**验证方式：** 读取 `/proc/1/cmdline`，错误版会看到 shell，正确版第一项是 `java`；随后对同一个 5 秒慢请求执行
`docker stop --timeout 15`，确认正确版完整返回。Linux Docker 中 Java 因 `SIGTERM` 结束通常记录 143，不能把“必须为 0”
当作优雅停机条件。

### 把 EXPOSE 当成端口发布

**触发条件：** Dockerfile 写了 `EXPOSE 8080`，启动时没有 `-p`，却直接请求宿主机 `127.0.0.1:8080`。

**原因：** `EXPOSE` 只是镜像元数据，不会创建宿主机到容器的端口映射。

**后果：** 容器日志显示应用已监听，宿主机请求仍连接失败，排错方向容易被误导到 Spring MVC。

**错误示例：**

```bash
docker run --rm --detach --name teamflow-port-missing \
  teamflow-packaging:modern-1.0.0
curl --fail --show-error http://127.0.0.1:8080/package-info
docker stop teamflow-port-missing
```

**正确写法：**

```bash
docker run --rm --detach --name teamflow-port-published \
  -p 18090:8080 \
  teamflow-packaging:modern-1.0.0
curl --fail --silent --show-error \
  --retry 20 --retry-all-errors --retry-connrefused --retry-delay 1 \
  http://127.0.0.1:18090/package-info
docker stop teamflow-port-published
```

**验证方式：** 使用 `docker port CONTAINER` 查看发布结果；没有 `-p` 时不应出现宿主机绑定，增加映射后请求 18090 成功。

### 用通配符复制两个 JAR

**触发条件：** `target` 同时包含主 JAR 与 `.jar.original`，Dockerfile 使用 `COPY target/*.jar* /app/` 或依赖模糊通配符。

**原因：** Docker 构建输入不再唯一，文件名变化或插件产物增加时，镜像可能带入错误归档或多个候选文件。

**后果：** `ENTRYPOINT` 指向不存在的固定路径，或者运行了没有 Boot loader 的 `.jar.original`，容器立即退出。

**错误示例：**

```dockerfile
COPY target/*.jar* /app/
```

**正确写法：**

```dockerfile
COPY target/packaging-feedback-1.0.0.jar /app/application.jar
```

**验证方式：** 在 fresh `target` 执行 `mvn -B package`，确认 `.dockerignore` 只放行主 JAR；构建后可以用
`docker run --rm --entrypoint java IMAGE -version` 核对运行时版本，但它不能替代启动验证，仍必须请求 `/package-info`。

### 应用仍以 root 身份运行

**触发条件：** Dockerfile 从基础镜像复制 JAR 后直接定义 `ENTRYPOINT`，没有创建用户和切换 `USER`。

**原因：** 默认用户通常是 root，容器隔离不等于进程已经失去 root 身份。

**后果：** 应用被利用时具有不必要的容器内权限，也可能创建只有 root 能读写的挂载文件。

**错误示例：**

```dockerfile
COPY target/packaging-feedback-1.0.0.jar /app/application.jar
ENTRYPOINT ["java", "-jar", "/app/application.jar"]
```

**正确写法：**

```dockerfile
RUN groupadd --system teamflow \
    && useradd --system --gid teamflow --home-dir /app --no-create-home teamflow

COPY --chown=teamflow:teamflow target/packaging-feedback-1.0.0.jar /app/application.jar
USER teamflow
ENTRYPOINT ["java", "-jar", "/app/application.jar"]
```

**验证方式：** 同时检查 `docker image inspect --format '{{.Config.User}}' IMAGE` 与 `docker exec CONTAINER id`；两处都不能
为空或显示 UID 0，JAR owner 也应与运行用户一致。

### 把秘密写进镜像层

**触发条件：** 为了省去运行参数，在 Dockerfile 使用 `ENV DATABASE_PASSWORD=...` 或 `RUN` 写入真实凭据文件。

**原因：** Dockerfile、镜像历史、缓存层和镜像分发都可能长期保留这个值，删除后续文件不能保证旧层内容消失。

**后果：** 任何能读取镜像或构建缓存的人都可能获得凭据，重置镜像配置也无法替代凭据轮换。

**错误示例：**

```dockerfile
ENV DATABASE_PASSWORD=real-password
```

**正确写法：**

```bash
docker run --env-file /path/outside-build-context/runtime.env IMAGE
```

**验证方式：** Dockerfile 和 `docker image history --no-trunc IMAGE` 不应出现真实凭据；本课只注入无敏感的
`DELIVERY_LABEL`，生产秘密交给部署平台 secret 机制。

### 使用 latest 混淆版本线

**触发条件：** 现代与兼容工程都构建成 `teamflow-packaging:latest`，基础镜像也省略 Java 主版本。

**原因：** `latest` 只是缺省标签，没有自动表达“最新且兼容”，同一名称还能被后续构建重新指向其他镜像。

**后果：** 无法从命令判断镜像属于 JDK 25 还是 Java 8，回滚、排错和清理都可能操作错误对象。

**错误示例：**

```bash
docker build -t teamflow-packaging:latest .
```

**正确写法：**

```bash
docker build -t teamflow-packaging:modern-1.0.0 .
docker build -t teamflow-packaging:legacy-1.0.0 .
```

**验证方式：** 用 `docker image inspect` 记录两个标签的 image ID、基础镜像和 Java 版本；正式交付需要不可变身份时再记录
digest，不能把 tag 当成内容哈希。

### 停止等待短于应用宽限期

**触发条件：** Spring Boot 宽限期为 10 秒，却执行 `docker stop --timeout 2`，同时还有 5 秒慢请求。

**原因：** Docker 只等待 2 秒就发送 `SIGKILL`，应用自己的 10 秒配置无法延长 Docker 的外层截止时间。

**后果：** 慢请求连接被截断，容器退出码和日志表现为强制终止，优雅停机合同失效。

**错误示例：**

```bash
docker stop --timeout 2 teamflow-packaging-modern
```

**正确写法：**

```bash
docker stop --timeout 15 teamflow-packaging-modern
```

**验证方式：** 在两个相同容器中分别运行 5 秒慢请求；2 秒版本应稳定被截断并可能记录 137，15 秒版本应返回
`slow-finished`。Linux Docker 中 Java 接收 `SIGTERM` 后通常记录 143，这与请求是否在宽限期内完成分开判断。
:::

## 六、独立练习

:::exercise
### 为 TeamFlow 生成双版本运行镜像

**要求：** 继续使用上一课的 `packaging-modern` 和 `packaging-legacy` 独立工程。两版先执行 `mvn -B package` 并确认主 JAR
可运行，再分别添加只放行主 JAR 的 `.dockerignore` 和单阶段 JRE Dockerfile。现代线使用
`eclipse-temurin:25-jre-jammy`，兼容线使用 `eclipse-temurin:8-jre-jammy`；都创建 `teamflow` 非 root 用户、把主 JAR
复制为 `/app/application.jar`、声明 8080，并使用 exec-form `ENTRYPOINT`。用版本化标签构建后，在不同宿主机端口运行，
通过环境变量和命令行参数各覆盖一次 `delivery.label`。最后在 5 秒慢请求进行中执行 15 秒停止，并清理本练习创建的容器。

**验收：** 两个镜像的 User 都是 `teamflow`，Entrypoint 都是 JSON 数组，ExposedPorts 都包含 `8080/tcp`；两个容器 UID
都不是 0，PID 1 都是 Java。现代容器的 `/package-info` 返回 `label=from-modern-container;jvm=modern`，兼容容器返回
`label=from-legacy-container;jvm=legacy`；额外现代容器同时提供环境变量和命令行参数时返回命令行值。两版慢请求都完整
返回 `slow-finished`，停止后状态为 `exited`；本课 Linux Docker 反馈中两版 Java 主进程都记录 143，而不是被
`SIGKILL` 结束时常见的 137。

**参考答案：** 下文给出两个工程需要修改和新增的全部文件，以及可以逐条执行的反馈命令。
:::

## 七、现代线完整实现

### 1. 在上一课工程上补齐运行反馈

打开 `packaging-modern/src/main/resources/application.properties`，保留原有端口和标签，再加入停机配置：

```properties
server.port=8080
delivery.label=from-default
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=10s
```

打开并修改 `PackagingApplication.java`，完整内容如下：

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
     * 启动现代线容器反馈应用。
     *
     * @param args 应用参数
     */
    public static void main(String[] args) {
        SpringApplication.run(PackagingApplication.class, args);
    }

    /**
     * 返回运行标签和 JVM 线，帮助观察容器配置来源。
     *
     * @return 配置反馈文本
     */
    @GetMapping("/package-info")
    public String packageInfo() {
        return "label=" + label + ";jvm=" + System.getProperty("delivery.jvm", "missing");
    }

    /**
     * 等待五秒后返回，用于观察容器停止时的在途请求。
     *
     * @return 已完成慢请求的反馈
     * @throws InterruptedException 当前线程被强制中断时抛出
     */
    @GetMapping("/slow")
    public String slow() throws InterruptedException {
        Thread.sleep(5000L);
        return "slow-finished";
    }
}
```

POM 继续使用上一课的 JDK 25、Spring Boot 4.1.1、`spring-boot-starter-web` 和
`spring-boot-maven-plugin`，不在 Dockerfile 中重复运行 Maven。

### 2. 创建现代线 Dockerfile

在 `packaging-modern` 根目录创建 `Dockerfile`：

```dockerfile
FROM eclipse-temurin:25-jre-jammy

WORKDIR /app

RUN groupadd --system teamflow \
    && useradd --system --gid teamflow --home-dir /app --no-create-home teamflow

COPY --chown=teamflow:teamflow \
  target/packaging-feedback-1.0.0.jar \
  /app/application.jar

USER teamflow

EXPOSE 8080

ENTRYPOINT ["java", "-Ddelivery.jvm=modern", "-jar", "/app/application.jar"]
```

同目录创建 `.dockerignore`：

```dockerignore
*
!target/
target/*
!target/packaging-feedback-1.0.0.jar
```

先由 Maven 生成主 JAR，再让 Docker 读取这个确定产物：

```bash
mvn -B package
docker build --pull -t teamflow-packaging:modern-1.0.0 .
```

`--pull` 要求 builder 检查基础镜像的更新；可重复发布还应记录本次解析到的 digest。网络受限环境可以先由平台准备基础
镜像，再在明确的离线流程中构建，不能把一个来历不明的本地 `latest` 当作已核验基础镜像。

### 3. 检查镜像并走通 HTTP

构建后先检查静态镜像合同：

```bash
docker image inspect teamflow-packaging:modern-1.0.0 \
  --format 'id={{.Id}} user={{.Config.User}} entrypoint={{json .Config.Entrypoint}} ports={{json .Config.ExposedPorts}}'
```

预期关键信息：

```text
user=teamflow
entrypoint=["java","-Ddelivery.jvm=modern","-jar","/app/application.jar"]
ports={"8080/tcp":{}}
```

启动容器并等待 HTTP 就绪：

```bash
docker run -d --name teamflow-packaging-modern \
  -p 18090:8080 \
  -e DELIVERY_LABEL=from-modern-container \
  teamflow-packaging:modern-1.0.0

response=$(curl -fsS --retry 20 --retry-all-errors --retry-connrefused --retry-delay 1 \
  http://127.0.0.1:18090/package-info)
printf '%s\n' "$response"
test "$response" = 'label=from-modern-container;jvm=modern'
```

再核对真实运行身份和 PID 1：

```bash
docker exec teamflow-packaging-modern id
docker exec teamflow-packaging-modern sh -c \
  'tr "\000" " " </proc/1/cmdline; printf "\n"'
docker logs teamflow-packaging-modern
```

### 4. 验证参数覆盖和优雅停机

创建一个自动删除的参数反馈容器：

```bash
docker run --rm -d --name teamflow-packaging-args \
  -p 18092:8080 \
  -e DELIVERY_LABEL=from-environment \
  teamflow-packaging:modern-1.0.0 \
  --delivery.label=from-command-line

response=$(curl -fsS --retry 20 --retry-all-errors --retry-connrefused --retry-delay 1 \
  http://127.0.0.1:18092/package-info)
printf '%s\n' "$response"
test "$response" = 'label=from-command-line;jvm=modern'

docker stop --timeout 15 teamflow-packaging-args
```

最后验证主容器的慢请求：

```bash
curl -fsS http://127.0.0.1:18090/slow > /tmp/teamflow-container-modern-slow.txt &
slow_pid=$!

sleep 1
docker stop --timeout 15 teamflow-packaging-modern

wait "$slow_pid"
test "$(cat /tmp/teamflow-container-modern-slow.txt)" = 'slow-finished'
docker inspect teamflow-packaging-modern \
  --format 'status={{.State.Status}} exit={{.State.ExitCode}}'
```

预期状态为 `exited`；本课 Linux Docker 反馈中退出码为 143，表示 Java 主进程因 `SIGTERM` 结束。慢请求已经完整返回，
且没有等到 Docker 用 `SIGKILL` 强制终止，才是本课要验证的优雅停机证据。容器已经停止但仍保留检查证据，确认后再执行：

```bash
docker rm teamflow-packaging-modern
```

## 八、Java 8 兼容线完整实现

### 1. 只替换真实版本差异

`packaging-legacy` 继续使用上一课的 Java 8、Spring Boot 2.3.12.RELEASE POM。将
`src/main/resources/application.properties` 改为与现代线相同：

```properties
server.port=8080
delivery.label=from-default
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=10s
```

兼容线必须保留 `server.shutdown=graceful`，因为 Boot 2.3.12 不会像 Boot 4.1 一样默认开启。Java 类不使用高于 Java 8
的语言或 API，完整内容如下：

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
     * 启动 Java 8 容器反馈应用。
     *
     * @param args 应用参数
     */
    public static void main(String[] args) {
        SpringApplication.run(PackagingApplication.class, args);
    }

    /**
     * 返回运行标签和 JVM 线。
     *
     * @return 配置反馈文本
     */
    @GetMapping("/package-info")
    public String packageInfo() {
        return "label=" + label + ";jvm=" + System.getProperty("delivery.jvm", "missing");
    }

    /**
     * 等待五秒后返回，用于观察兼容线优雅停机。
     *
     * @return 已完成慢请求的反馈
     * @throws InterruptedException 当前线程被强制中断时抛出
     */
    @GetMapping("/slow")
    public String slow() throws InterruptedException {
        Thread.sleep(5000L);
        return "slow-finished";
    }
}
```

### 2. 创建兼容线运行镜像

在 `packaging-legacy` 根目录创建 `Dockerfile`：

```dockerfile
FROM eclipse-temurin:8-jre-jammy

WORKDIR /app

RUN groupadd --system teamflow \
    && useradd --system --gid teamflow --home-dir /app --no-create-home teamflow

COPY --chown=teamflow:teamflow \
  target/packaging-feedback-1.0.0.jar \
  /app/application.jar

USER teamflow

EXPOSE 8080

ENTRYPOINT ["java", "-Ddelivery.jvm=legacy", "-jar", "/app/application.jar"]
```

`.dockerignore` 与现代线完全相同，因为两边 Maven 产物合同相同：

```dockerignore
*
!target/
target/*
!target/packaging-feedback-1.0.0.jar
```

兼容 Dockerfile 的结构没有为了“看起来不同”而改写。真实差异只有基础 JRE 主版本、Spring Boot 默认停机行为和教学探针
`delivery.jvm=legacy`。执行：

```bash
mvn -B package
docker build --pull -t teamflow-packaging:legacy-1.0.0 .
```

### 3. 复跑相同容器合同

使用独立容器名和宿主机端口，避免与现代线互相覆盖：

```bash
docker run -d --name teamflow-packaging-legacy \
  -p 18091:8080 \
  -e DELIVERY_LABEL=from-legacy-container \
  teamflow-packaging:legacy-1.0.0

response=$(curl -fsS --retry 20 --retry-all-errors --retry-connrefused --retry-delay 1 \
  http://127.0.0.1:18091/package-info)
printf '%s\n' "$response"
test "$response" = 'label=from-legacy-container;jvm=legacy'

docker exec teamflow-packaging-legacy id
docker exec teamflow-packaging-legacy sh -c \
  'tr "\000" " " </proc/1/cmdline; printf "\n"'
```

验证慢请求和停止：

```bash
curl -fsS http://127.0.0.1:18091/slow > /tmp/teamflow-container-legacy-slow.txt &
slow_pid=$!

sleep 1
docker stop --timeout 15 teamflow-packaging-legacy

wait "$slow_pid"
test "$(cat /tmp/teamflow-container-legacy-slow.txt)" = 'slow-finished'
docker inspect teamflow-packaging-legacy \
  --format 'status={{.State.Status}} exit={{.State.ExitCode}}'
docker rm teamflow-packaging-legacy
```

两版 HTTP、用户、PID 1 和停止结果应相同。不能把现代线的 JAR 放进 Java 8 镜像：Boot 4.1 和 JDK 25 编译产物不兼容
Java 8；也不能因为两个 Dockerfile 只有两处文本差异，就合并两个工程的 `target` 或镜像标签。

## 九、从反馈定位故障所在层

### 1. 构建失败先查上下文和产物

`COPY` 报文件不存在时，按顺序确认：

```bash
ls -l target/packaging-feedback-1.0.0.jar
unzip -p target/packaging-feedback-1.0.0.jar META-INF/MANIFEST.MF
docker build --progress=plain -t teamflow-packaging:modern-1.0.0 .
```

文件本身不存在，回到 Maven `package`；文件存在但 builder 看不到，检查构建上下文路径与 `.dockerignore`；文件被复制但
容器报 `no main manifest attribute`，检查是否把 `.jar.original` 当成主 JAR。不要通过扩大成 `COPY . .` 掩盖输入错误。

### 2. 容器退出先查入口和 Java 线

容器启动后立即退出时执行：

```bash
docker container ls --all --filter name=teamflow-packaging
docker logs teamflow-packaging-modern
docker inspect teamflow-packaging-modern \
  --format 'exit={{.State.ExitCode}} error={{.State.Error}} entrypoint={{json .Config.Entrypoint}}'
```

`exec format error` 常指入口文件或平台不匹配；`UnsupportedClassVersionError` 指向 JAR 与运行时 Java 主版本不匹配；
`Unable to access jarfile` 指向容器内固定路径或 COPY 失败。先依据真实日志归类，不要先改端口。

### 3. HTTP 失败按监听、映射、请求三层检查

应用仍在运行但请求失败时执行：

```bash
docker logs teamflow-packaging-modern
docker port teamflow-packaging-modern
docker inspect teamflow-packaging-modern \
  --format 'ports={{json .NetworkSettings.Ports}}'
curl -v http://127.0.0.1:18090/package-info
```

日志确认 Spring Boot 是否监听 8080；`docker port` 确认宿主机 18090 是否映射到容器 8080；`curl -v` 确认请求目标。
三个反馈一致后再检查 Controller 路径。容器化部署的价值之一，就是让这些边界有明确证据，而不是依赖“在我机器上能跑”。

## 十、本课小结

容器化不是把 JAR 随便复制进一个 Linux 文件系统。一个可维护的 Spring Boot 镜像需要收窄构建上下文、选择匹配 Java
版本的 JRE、固定应用路径、使用非 root 身份、声明容器端口，并让运行配置从环境或命令行进入。

镜像启动时，exec-form `ENTRYPOINT` 让 Java 直接成为 PID 1；运行时，`-p` 建立宿主机到容器的端口映射；停止时，
Docker 的 `SIGTERM` 进入 Java，Spring Boot 在自己的宽限期内完成在途请求。现代线与 Java 8 兼容线共享这些 Docker
合同，只在真实的 Java 基础镜像和 Boot 默认行为处分叉。

到这里，你已经能把上一课的两个可执行 JAR 变成可检查、可运行、可配置和可停止的版本化镜像。下一课会把测试结果、
打包产物、运行检查和交付前证据串成一次完整检查，但不会改变本课已经建立的容器运行边界。
