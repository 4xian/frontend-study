---
id: backend.java.learn.intermediate.file-upload-and-download
type: lesson
title: 文件上传与下载
summary: 用 multipart 接收单个任务附件，以服务端身份流式落盘，并通过 Resource 返回可下载的原始字节
domain: backend
technology: java
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 240
prerequisites:
  - backend.java.learn.intermediate.user-and-team-api-project
objectives:
  - 能解释 multipart/form-data 的 boundary、part、name 与 filename 分别承担什么职责。
  - 能用 MultipartFile 接收单文件，并区分缺少 part、空文件和超限文件。
  - 能把客户端原始文件名、显示名、附件 ID 与服务端存储名分开。
  - 能按实际读取字节限制大小，失败时清理部分文件，完整落盘后再发布元数据。
  - 能说明客户端声明的 Content-Type 为什么不能直接成为内容真实性结论。
  - 能用 FileSystemResource、Content-Disposition 和准确长度返回完整文件响应。
  - 能让现代线与 Java 8 兼容线保持相同的上传、下载和错误 HTTP 合同。
  - 能用 curl 验证 201、Location、完整 200、400、404、413 与下载字节一致性。
recap:
  - multipart/form-data 用 boundary 分隔 part，文件 part 的 name 决定 Controller 参数，filename 只是客户端元数据。
  - MultipartFile 的临时内容只属于当前请求，应用必须在请求结束前复制到自己控制的存储位置。
  - 原始文件名先提取 basename 并清理控制字符，只作显示名；存储名始终由服务端附件 ID 生成。
  - 容器上限负责请求入口，业务上限按实际读取字节执行；超限或写入失败都不能留下可下载元数据。
  - 未验证文件内容时，客户端声明类型只可观察，不可相信；示例统一采用 application/octet-stream。
  - 完整下载返回 Resource 字节、准确长度、attachment 文件名和 nosniff，不套普通 JSON 外壳。
  - 两条版本线使用不同 starter 和编译目标，但本课采用的 Spring API 与 Java 源码可以保持一致。
  - 本地目录和内存索引只用于教学反馈环，不代表数据库持久化、事务、对象存储或生产文件治理。
related:
  - backend.java.learn.basics.unified-api-contract
  - backend.java.learn.basics.io-files-and-resource-ownership
  - backend.java.learn.intermediate.unified-api-response
  - backend.java.learn.intermediate.global-exception-handling
tags:
  - Java
  - Spring Boot
  - Spring MVC
  - MultipartFile
  - FileSystemResource
  - 文件上传
  - 文件下载
  - Content-Disposition
appliesTo: JDK 25、Spring Boot 4.1.0、Spring Framework 7.0.8 主线；Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE 兼容写法
verifiedAt: 2026-08-19
sources:
  - id: spring-boot-410-multipart-properties
    title: MultipartProperties API - Spring Boot 4.1.0
    url: https://docs.spring.io/spring-boot/4.1.0/api/java/org/springframework/boot/servlet/autoconfigure/MultipartProperties.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Boot 4.1.0
    claims:
      - multipart location、file-size-threshold、max-file-size 与 max-request-size 进入 Servlet multipart 配置
  - id: spring-boot-2312-multipart-properties
    title: MultipartProperties API - Spring Boot 2.3.12.RELEASE
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/api/org/springframework/boot/autoconfigure/web/servlet/MultipartProperties.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims:
      - Java 8 兼容线提供相同的 multipart 大小、阈值和临时目录配置职责
  - id: spring-708-multipart-file-upload
    title: MultipartFile API - Spring Framework 7.0.8
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/multipart/MultipartFile.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - 上传内容可能暂存在内存或磁盘且请求结束后清理，应用负责复制内容
      - 原始文件名由客户端提供，不能盲目使用
  - id: spring-5215-multipart-file-upload
    title: MultipartFile API - Spring Framework 5.2.15.RELEASE
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/multipart/MultipartFile.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 兼容线同样要求调用方关闭输入流并把请求期临时内容复制到目标存储
  - id: spring-708-content-disposition-source
    title: ContentDisposition source - Spring Framework 7.0.8
    url: https://raw.githubusercontent.com/spring-projects/spring-framework/v7.0.8/spring-web/src/main/java/org/springframework/http/ContentDisposition.java
    sourceOrigin: official
    sourceType: source-code
    appliesTo: Spring Framework 7.0.8
    claims:
      - UTF-8 filename builder 会生成兼容 filename 与 filename* 参数
  - id: spring-5215-content-disposition-source
    title: ContentDisposition source - Spring Framework 5.2.15.RELEASE
    url: https://raw.githubusercontent.com/spring-projects/spring-framework/v5.2.15.RELEASE/spring-web/src/main/java/org/springframework/http/ContentDisposition.java
    sourceOrigin: official
    sourceType: source-code
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims:
      - 兼容线支持 UTF-8 filename builder，但序列化 header 的字节外形与现代线不同
  - id: spring-708-file-system-resource-download
    title: FileSystemResource API - Spring Framework 7.0.8
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/core/io/FileSystemResource.html
    sourceOrigin: official
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims:
      - FileSystemResource 为已落盘文件提供可重复打开的 Resource 视图
  - id: rfc7578-file-upload
    title: 'RFC 7578: Returning Values from Forms - multipart/form-data'
    url: https://www.rfc-editor.org/rfc/rfc7578.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: multipart/form-data
    claims:
      - boundary 分隔各个 part，每个 part 使用 Content-Disposition 表达字段名与可选文件名
      - 接收方不能盲目使用发送方提供的目录信息和文件名
  - id: rfc6266-file-download
    title: 'RFC 6266: Content-Disposition in HTTP'
    url: https://www.rfc-editor.org/rfc/rfc6266.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: HTTP download responses
    claims:
      - attachment 与 filename 参数为接收方提供保存提示，不赋予文件名可信路径语义
      - filename* 可表达 UTF-8 文件名并应优先于兼容 filename
  - id: owasp-file-upload-cheat-sheet
    title: OWASP File Upload Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
    sourceOrigin: official
    sourceType: security-standard
    appliesTo: File upload security boundaries
    claims:
      - 应生成服务端文件名、限制大小并把客户端 Content-Type 视为可伪造信息
  - id: spring-framework-18237-original-filename
    title: Spring Framework issue 18237 - MultipartFile getOriginalFilename contains path
    url: https://github.com/spring-projects/spring-framework/issues/18237
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Historical Spring multipart filename behavior
    claims:
      - 历史真实案例说明应用不能假设 originalFilename 一定只包含 basename
  - id: spring-framework-29861-content-disposition
    title: Spring Framework issue 29861 - Content-Disposition filename compatibility
    url: https://github.com/spring-projects/spring-framework/issues/29861
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: Spring Framework 5.x to 6.1+
    claims:
      - UTF-8 Content-Disposition 的兼容 filename 行为发生过演进，跨版本验收不应比较整行字节
---

# 文件上传与下载

普通 JSON 请求把字段解析成对象，文件上传还要处理一段有生命周期的字节流。TeamFlow 本课只实现一个任务附件
能力：客户端上传一个名为 `file` 的 part，服务端生成附件 ID、完整落盘后返回下载地址；客户端下载时获得原始
字节。多文件、对象存储、Range、扫描、归档、鉴权和跨域都不在本课范围内。

## 一、先读懂 multipart 请求

### 1. boundary 把请求体切成多个 part

`multipart/form-data` 不是 JSON。请求头中的 boundary 是分隔符，每个 part 又有自己的 header 和内容：

```http
POST /api/v1/tasks/TASK-104/attachments HTTP/1.1
Content-Type: multipart/form-data; boundary=teamflow-boundary

--teamflow-boundary
Content-Disposition: form-data; name="file"; filename="设计说明.txt"
Content-Type: text/plain

hello teamflow
--teamflow-boundary--
```

`name="file"` 对应 Controller 参数名；`filename` 与 part 的 `Content-Type` 都由客户端声明。客户端库通常会
自动生成 boundary，调用 `curl -F` 时不要手写一个与 body 不一致的请求头。

### 2. MultipartFile 是请求期视图

Spring 把文件 part 暴露为 `MultipartFile`。它可能暂存在内存或 Servlet 临时目录，只有当前请求期间可用；
请求结束后，临时内容会被清理。因此 Service 必须在请求内读取 `getInputStream()` 并复制到应用控制的位置。

```java
/** 接收一个文件并返回已创建的附件元数据。 */
@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
ResponseEntity<AttachmentMetadata> upload(
        @PathVariable("taskId") String taskId,
        @RequestParam("file") MultipartFile file) {
    AttachmentMetadata metadata = service.store(taskId, file);
    return ResponseEntity.status(201).body(metadata);
}
```

缺少 `file` part 时，参数解析会在进入方法前失败；part 存在但 `file.isEmpty()` 为 true，表示没有可用字节。
TeamFlow 明确拒绝零字节附件并返回 400。其他业务可以允许零字节文件，但必须自己冻结合同，不能把
`isEmpty()` 当成普遍业务结论。

## 二、分开四种文件身份

### 1. 客户端原名不能成为存储路径

原始文件名可能是 `设计说明.txt`，也可能是 `C:\fakepath\设计说明.txt` 或 `../设计说明.txt`。服务端同时按
`/` 和 `\` 取最后一个 basename，再移除控制字符；清理结果只作为 `fileName` 和下载提示。

服务端另外生成 `ATT-<uuid>`，实际文件名固定为 `ATT-<uuid>.bin`。所以四种身份互不混淆：

| 身份 | 示例 | 用途 |
| --- | --- | --- |
| 客户端原名 | `C:\fakepath\设计说明.txt` | 不可信输入，只用于提取显示名 |
| 显示名 | `设计说明.txt` | JSON 元数据与下载提示 |
| 附件 ID | `ATT-8c...` | URI 与业务查找 |
| 存储名 | `ATT-8c....bin` | 应用控制的本地文件名 |

同名文件可以重复上传。不同请求得到不同附件 ID 和存储名，不会因显示名相同而覆盖。

**社区补充：** Spring Framework 历史 issue 18237 记录过应用拿到带客户端路径的原始文件名后直接使用的真实
误区。该 issue 的旧版本行为不是本课当前版本结论；当前规则已经由两版 `MultipartFile` Javadoc 与 RFC 7578
重新核验：应用始终把原始文件名视为不可信元数据。

### 2. 声明类型不等于真实内容

`file.getContentType()` 只读取 part header。客户端可以把文本字节声明成 `image/png`，所以本课不根据它决定
扩展名、执行方式或下载类型。由于课程没有引入内容检测器，公开元数据和下载响应统一使用
`application/octet-stream`。

这是一个刻意保守且诚实的合同：应用知道自己保存了任意字节，但不知道它们是否真是图片、PDF 或可执行文件。
生产系统还需要 allowlist、格式解析、扫描、隔离和授权；这些能力不能用一个客户端 header 代替。

## 三、建立两层大小与发布边界

### 1. Servlet 配置负责入口

```properties
spring.servlet.multipart.max-file-size=2MB
spring.servlet.multipart.max-request-size=3MB
spring.servlet.multipart.file-size-threshold=0B
teamflow.files.max-bytes=1048576
teamflow.storage.root=target/attachments
```

`max-file-size` 限制单个文件，`max-request-size` 限制 boundary、普通字段和所有 part 组成的完整请求。
`file-size-threshold=0B` 只决定解析时何时写入临时目录，不是大小上限。`spring.servlet.multipart.location`
即使显式配置，也只是 Servlet 接收过程的临时目录，不能替代 `teamflow.storage.root`。

### 2. Service 按实际读取字节负责业务上限

容器允许文件进入，不代表业务必须接受到同样大小。完整示例的业务上限是 1 MiB。Service 用固定缓冲区读取，
每次按真实 `read` 返回值累计；一旦超过上限就停止、关闭流并删除 `.part` 文件。它不使用可能被误解为最终
成本的声明长度，也不调用把整份内容装入内存的 `getBytes()`。

只有复制完成并移动到最终存储名之后，元数据才放入 Map。于是 201 表示文件和元数据都已经可读；400、413 或
500 都不会发布一个指向半文件的附件记录。

### 3. 错误合同可直接验收

| 场景 | 状态 | code |
| --- | ---: | --- |
| 缺少 `file` part | 400 | `FILE_PART_MISSING` |
| part 存在但零字节 | 400 | `FILE_EMPTY` |
| 显示名清理后非法 | 400 | `FILE_NAME_INVALID` |
| 业务流量或容器入口超限 | 413 | `FILE_TOO_LARGE` |
| 附件不存在或不属于 task | 404 | `ATTACHMENT_NOT_FOUND` |
| 受控目录写入失败 | 500 | `FILE_STORAGE_FAILED` |

极端超限请求可能被 Servlet 容器在 Controller 前终止。有限、略超阈值的本地请求应得到 413；若换用其他容器
或连接策略，不能脱离实际响应声称应用一定生成了 Problem JSON。

## 四、创建两个独立工程

### 1. 现代工程 POM

创建 `teamflow-file-api-modern`，Project SDK、模块 SDK 与 Maven Runner JRE 都选择 JDK 25。`pom.xml`：

```xml
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
  <artifactId>teamflow-file-api-modern</artifactId>
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

### 2. Java 8 工程 POM

另建 `teamflow-file-api-java8`，四处版本都要真实隔离：Project SDK、模块 SDK、Maven Runner JRE 使用 Java 8，
POM 目标也是 8。Reload Maven 后使用：

```xml
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
  <artifactId>teamflow-file-api-java8</artifactId>
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

### 3. 两条线共用完整源码

本课采用的 `MultipartFile`、`FileSystemResource`、`ResponseEntity`、NIO.2 与并发 Map 在两条基线都存在。
为了让差异只来自真实依赖和运行环境，两套工程都创建
`src/main/java/com/teamflow/files/TeamFlowFileApplication.java`，内容完全相同：

```java
package com.teamflow.files;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@SpringBootApplication
public class TeamFlowFileApplication {
    /** 启动文件 API。 */
    public static void main(String[] args) {
        SpringApplication.run(TeamFlowFileApplication.class, args);
    }

    @RestController
    @RequestMapping("/api/v1/tasks/{taskId}/attachments")
    static final class AttachmentController {
        private final AttachmentService service;

        /** 创建附件 Controller。 */
        AttachmentController(AttachmentService service) {
            this.service = service;
        }

        /** 接收一个文件并返回已创建的附件元数据。 */
        @PostMapping(
                consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
                produces = MediaType.APPLICATION_JSON_VALUE)
        ResponseEntity<AttachmentMetadata> upload(
                @PathVariable("taskId") String taskId,
                @RequestParam("file") MultipartFile file) {
            AttachmentMetadata metadata = service.store(taskId, file);
            URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{attachmentId}/content")
                    .buildAndExpand(metadata.getId())
                    .toUri();
            return ResponseEntity.created(location).body(metadata);
        }

        /** 返回附件的完整原始字节。 */
        @GetMapping(path = "/{attachmentId}/content")
        ResponseEntity<Resource> download(
                @PathVariable("taskId") String taskId,
                @PathVariable("attachmentId") String attachmentId) {
            StoredAttachment stored = service.find(taskId, attachmentId);
            ContentDisposition disposition = ContentDisposition.builder("attachment")
                    .filename(stored.getFileName(), StandardCharsets.UTF_8)
                    .build();
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .contentLength(stored.getSize())
                    .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                    .header("X-Content-Type-Options", "nosniff")
                    .body(new FileSystemResource(stored.getPath().toFile()));
        }
    }

    @Service
    static final class AttachmentService {
        private static final int BUFFER_SIZE = 8192;
        private static final int MAX_FILE_NAME_LENGTH = 120;
        private static final String PUBLIC_CONTENT_TYPE = "application/octet-stream";

        private final Path storageRoot;
        private final long maxBytes;
        private final Map<String, StoredAttachment> attachments =
                new ConcurrentHashMap<String, StoredAttachment>();

        /** 创建受控存储目录。 */
        AttachmentService(
                @Value("${teamflow.storage.root}") String storageRoot,
                @Value("${teamflow.files.max-bytes}") long maxBytes) {
            this.storageRoot = Paths.get(storageRoot).toAbsolutePath().normalize();
            this.maxBytes = maxBytes;
            try {
                Files.createDirectories(this.storageRoot);
            } catch (IOException exception) {
                throw new IllegalStateException("无法初始化附件存储目录", exception);
            }
        }

        /** 流式保存文件，并在完整落盘后发布元数据。 */
        AttachmentMetadata store(String taskId, MultipartFile file) {
            if (file.isEmpty()) {
                throw new FileApiException(400, "FILE_EMPTY", "上传文件不能为空");
            }
            String fileName = cleanFileName(file.getOriginalFilename());
            String attachmentId = "ATT-" + UUID.randomUUID().toString();
            Path partial = null;
            try {
                partial = Files.createTempFile(storageRoot, ".upload-", ".part");
                long size = copyWithLimit(file, partial);
                Path target = storageRoot.resolve(attachmentId + ".bin");
                Files.move(partial, target, StandardCopyOption.ATOMIC_MOVE);
                partial = null;
                StoredAttachment stored = new StoredAttachment(
                        attachmentId, fileName, PUBLIC_CONTENT_TYPE, size, target);
                attachments.put(key(taskId, attachmentId), stored);
                return stored.toMetadata();
            } catch (FileApiException exception) {
                throw exception;
            } catch (IOException exception) {
                throw new FileApiException(500, "FILE_STORAGE_FAILED", "文件暂时无法保存");
            } finally {
                deletePartial(partial);
            }
        }

        /** 按任务和附件身份读取已发布文件。 */
        StoredAttachment find(String taskId, String attachmentId) {
            StoredAttachment stored = attachments.get(key(taskId, attachmentId));
            if (stored == null || !Files.isRegularFile(stored.getPath())) {
                throw new FileApiException(404, "ATTACHMENT_NOT_FOUND", "附件不存在");
            }
            return stored;
        }

        /** 按实际读取字节复制，并拒绝超过业务上限的内容。 */
        private long copyWithLimit(MultipartFile file, Path target) throws IOException {
            long total = 0;
            byte[] buffer = new byte[BUFFER_SIZE];
            try (InputStream input = file.getInputStream();
                    OutputStream output = Files.newOutputStream(target)) {
                int read;
                while ((read = input.read(buffer)) != -1) {
                    total += read;
                    if (total > maxBytes) {
                        throw new FileApiException(413, "FILE_TOO_LARGE", "文件超过业务大小上限");
                    }
                    output.write(buffer, 0, read);
                }
            }
            return total;
        }

        /** 从不可信原名提取只用于显示的安全 basename。 */
        private String cleanFileName(String originalName) {
            if (originalName == null) {
                throw new FileApiException(400, "FILE_NAME_INVALID", "文件名不能为空");
            }
            String normalized = originalName.replace('\\', '/');
            int separator = normalized.lastIndexOf('/');
            String baseName = normalized.substring(separator + 1);
            StringBuilder cleaned = new StringBuilder();
            for (int index = 0; index < baseName.length(); index++) {
                char current = baseName.charAt(index);
                if (!Character.isISOControl(current)) {
                    cleaned.append(current);
                }
            }
            String result = cleaned.toString();
            if (result.length() == 0
                    || ".".equals(result)
                    || "..".equals(result)
                    || result.length() > MAX_FILE_NAME_LENGTH) {
                throw new FileApiException(400, "FILE_NAME_INVALID", "文件名不符合接口约束");
            }
            return result;
        }

        /** 组合不暴露存储路径的内存索引键。 */
        private String key(String taskId, String attachmentId) {
            return taskId + "\n" + attachmentId;
        }

        /** 清理未完成的部分文件。 */
        private void deletePartial(Path partial) {
            if (partial == null) {
                return;
            }
            try {
                Files.deleteIfExists(partial);
            } catch (IOException ignored) {
                // 完整工程会记录清理失败并交给后台清扫；本课不扩张生命周期治理。
            }
        }
    }

    static final class AttachmentMetadata {
        private final String id;
        private final String fileName;
        private final String contentType;
        private final long size;

        /** 创建公开附件元数据。 */
        AttachmentMetadata(String id, String fileName, String contentType, long size) {
            this.id = id;
            this.fileName = fileName;
            this.contentType = contentType;
            this.size = size;
        }

        /** 返回附件 ID。 */
        public String getId() {
            return id;
        }

        /** 返回清洗后的显示名。 */
        public String getFileName() {
            return fileName;
        }

        /** 返回服务端采用的公开内容类型。 */
        public String getContentType() {
            return contentType;
        }

        /** 返回实际保存字节数。 */
        public long getSize() {
            return size;
        }
    }

    static final class StoredAttachment {
        private final String id;
        private final String fileName;
        private final String contentType;
        private final long size;
        private final Path path;

        /** 创建内部附件记录。 */
        StoredAttachment(
                String id,
                String fileName,
                String contentType,
                long size,
                Path path) {
            this.id = id;
            this.fileName = fileName;
            this.contentType = contentType;
            this.size = size;
            this.path = path;
        }

        /** 转换成公开元数据。 */
        AttachmentMetadata toMetadata() {
            return new AttachmentMetadata(id, fileName, contentType, size);
        }

        /** 返回显示名。 */
        String getFileName() {
            return fileName;
        }

        /** 返回实际字节数。 */
        long getSize() {
            return size;
        }

        /** 返回服务端受控路径。 */
        Path getPath() {
            return path;
        }
    }

    static final class FileApiException extends RuntimeException {
        private final int status;
        private final String code;

        /** 创建文件业务异常。 */
        FileApiException(int status, String code, String message) {
            super(message);
            this.status = status;
            this.code = code;
        }

        /** 返回 HTTP 状态。 */
        int getStatus() {
            return status;
        }

        /** 返回稳定错误码。 */
        String getCode() {
            return code;
        }
    }

    @RestControllerAdvice
    static final class GlobalExceptionHandler {
        /** 映射文件业务失败。 */
        @ExceptionHandler(FileApiException.class)
        ResponseEntity<ApiProblem> handleFileApi(
                FileApiException exception, WebRequest request) {
            return problem(
                    exception.getStatus(), exception.getCode(), exception.getMessage(), request);
        }

        /** 区分缺少 file part 与空文件。 */
        @ExceptionHandler(MissingServletRequestPartException.class)
        ResponseEntity<ApiProblem> handleMissingPart(
                MissingServletRequestPartException exception, WebRequest request) {
            return problem(400, "FILE_PART_MISSING", "请求必须包含名为 file 的 part", request);
        }

        /** 把容器入口超限统一为 413。 */
        @ExceptionHandler(MaxUploadSizeExceededException.class)
        ResponseEntity<ApiProblem> handleMaxUpload(
                MaxUploadSizeExceededException exception, WebRequest request) {
            return problem(413, "FILE_TOO_LARGE", "上传请求超过容器大小上限", request);
        }

        /** 映射损坏的 multipart 请求。 */
        @ExceptionHandler(MultipartException.class)
        ResponseEntity<ApiProblem> handleMultipart(
                MultipartException exception, WebRequest request) {
            return problem(400, "MULTIPART_INVALID", "multipart 请求无法解析", request);
        }

        /** 保留 405，并把失败转换成 TeamFlow Problem JSON。 */
        @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
        ResponseEntity<ApiProblem> handleMethodNotAllowed(
                HttpRequestMethodNotSupportedException exception, WebRequest request) {
            HttpHeaders headers = new HttpHeaders();
            if (exception.getSupportedHttpMethods() != null) {
                headers.setAllow(exception.getSupportedHttpMethods());
            }
            return problem(
                    405,
                    "METHOD_NOT_ALLOWED",
                    "请求方法不受当前资源支持",
                    headers,
                    request);
        }

        /** 保留 415，并把失败转换成 TeamFlow Problem JSON。 */
        @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
        ResponseEntity<ApiProblem> handleMediaTypeNotSupported(
                HttpMediaTypeNotSupportedException exception, WebRequest request) {
            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(exception.getSupportedMediaTypes());
            return problem(
                    415,
                    "MEDIA_TYPE_NOT_SUPPORTED",
                    "请求媒体类型不受当前接口支持",
                    headers,
                    request);
        }

        /** 构造现代与兼容线同形的 Problem JSON。 */
        private ResponseEntity<ApiProblem> problem(
                int status, String code, String detail, WebRequest request) {
            return problem(status, code, detail, new HttpHeaders(), request);
        }

        /** 构造保留框架响应头的 Problem JSON。 */
        private ResponseEntity<ApiProblem> problem(
                int status,
                String code,
                String detail,
                HttpHeaders headers,
                WebRequest request) {
            ApiProblem body = new ApiProblem(
                    "https://api.teamflow.example/problems/" + code.toLowerCase().replace('_', '-'),
                    status >= 500 ? "文件服务暂时不可用" : "文件请求无法处理",
                    status,
                    detail,
                    instance(request),
                    code,
                    UUID.randomUUID().toString(),
                    Collections.emptyList());
            return ResponseEntity.status(status)
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                    .body(body);
        }

        /** 从 WebRequest 取得当前 URI。 */
        private String instance(WebRequest request) {
            String description = request.getDescription(false);
            return description.startsWith("uri=") ? description.substring(4) : description;
        }
    }

    static final class ApiProblem {
        private final String type;
        private final String title;
        private final int status;
        private final String detail;
        private final String instance;
        private final String code;
        private final String traceId;
        private final List<Object> errors;

        /** 创建稳定错误响应。 */
        ApiProblem(
                String type,
                String title,
                int status,
                String detail,
                String instance,
                String code,
                String traceId,
                List<Object> errors) {
            this.type = type;
            this.title = title;
            this.status = status;
            this.detail = detail;
            this.instance = instance;
            this.code = code;
            this.traceId = traceId;
            this.errors = errors;
        }

        /** 返回问题类型。 */
        public String getType() { return type; }

        /** 返回问题标题。 */
        public String getTitle() { return title; }

        /** 返回 HTTP 状态。 */
        public int getStatus() { return status; }

        /** 返回去敏详情。 */
        public String getDetail() { return detail; }

        /** 返回请求实例。 */
        public String getInstance() { return instance; }

        /** 返回稳定错误码。 */
        public String getCode() { return code; }

        /** 返回本次追踪 ID。 */
        public String getTraceId() { return traceId; }

        /** 返回字段错误；本课固定为空列表。 */
        public List<Object> getErrors() { return errors; }
    }
}
```

附件索引键同时包含 `taskId` 与 `attachmentId`，因此下载另一个 task 的附件 ID 仍得到 404。示例把小类型
集中在一个文件里便于复制，职责仍分为 Controller、Service、公开 DTO、内部记录与错误映射；正式项目可以按类
拆文件，不应改变这条边界。

### 4. 分别配置端口

两个工程都创建 `src/main/resources/application.properties`。现代工程：

```properties
server.port=8080
spring.servlet.multipart.max-file-size=2MB
spring.servlet.multipart.max-request-size=3MB
spring.servlet.multipart.file-size-threshold=0B
teamflow.files.max-bytes=1048576
teamflow.storage.root=target/attachments
```

Java 8 工程只把第一行改成 `server.port=8081`，其余业务合同不变。分别运行：

```bash
mvn clean package
mvn spring-boot:run
```

`target/attachments` 是教学用业务目录，`mvn clean` 会删除；内存 Map 也会随进程重启丢失。它们提供可观察反馈，
不承诺持久化、事务、并发一致性或生产文件生命周期。

## 五、验收上传与完整下载

### 1. 上传路径型 UTF-8 文件名

先创建输入，再分别把端口换成 8080 和 8081 执行同一组请求：

```bash
printf 'teamflow-file-v1\n' > /tmp/teamflow-file-v1.txt
curl -sS -D /tmp/teamflow-upload.headers \
  -o /tmp/teamflow-upload.json \
  -F 'file=@/tmp/teamflow-file-v1.txt;filename=C:\fakepath\设计说明.txt;type=image/png' \
  http://localhost:8080/api/v1/tasks/TASK-104/attachments
cat /tmp/teamflow-upload.headers
cat /tmp/teamflow-upload.json
```

预期状态为 201，Location 直接指向唯一下载端点；JSON 中 `fileName` 是 `设计说明.txt`，声明的
`image/png` 没有改变服务端采用类型：

```text
HTTP/1.1 201
Location: http://localhost:8080/api/v1/tasks/TASK-104/attachments/ATT-.../content

{"id":"ATT-...","fileName":"设计说明.txt","contentType":"application/octet-stream","size":17}
```

### 2. 用 Location 下载并逐字节比较

```bash
download_url=$(awk 'BEGIN{IGNORECASE=1} /^Location:/{gsub("\r", ""); print $2}' \
  /tmp/teamflow-upload.headers)
curl -sS -D /tmp/teamflow-download.headers \
  -o /tmp/teamflow-download.bin "$download_url"
cat /tmp/teamflow-download.headers
cmp /tmp/teamflow-file-v1.txt /tmp/teamflow-download.bin
```

预期为完整 200、准确 `Content-Length`、`application/octet-stream`、`nosniff` 与 attachment。`cmp` 零输出、
退出码为 0，证明下载 body 与上传字节一致。

现代 Framework 7.0.8 通常同时输出兼容 `filename` 与 UTF-8 `filename*`，5.2.15 的同一 builder 只输出
`filename*`。两边都要检查 `filename*=UTF-8''...` 能表达 `设计说明.txt`，不要比较完整 header 是否逐字相同。

**社区补充：** Spring Framework issue 29861 记录了增加兼容 filename 的演进背景。该 issue 帮助解释为何跨
版本 header 不应做字符串相等断言；两条目标版本的实际输出仍以各自官方源码和本课运行结果为准。

本课只验不携带 `Range` 的完整 200 下载。Range、206、416、缓存与断点恢复属于后续文件存储专题，不在这里
增加第二套下载能力。

### 3. 验收失败路径与部分文件清理

```bash
# 缺少 file part -> 400 FILE_PART_MISSING
curl -sS -i -F 'note=missing-file' \
  http://localhost:8080/api/v1/tasks/TASK-104/attachments

# 存在零字节 part -> 400 FILE_EMPTY
: > /tmp/teamflow-empty.bin
curl -sS -i -F 'file=@/tmp/teamflow-empty.bin;filename=empty.bin' \
  http://localhost:8080/api/v1/tasks/TASK-104/attachments

# 略超 1 MiB 业务上限 -> 413 FILE_TOO_LARGE
dd if=/dev/zero of=/tmp/teamflow-too-large.bin bs=1024 count=1025
curl -sS -i -F 'file=@/tmp/teamflow-too-large.bin;filename=large.bin' \
  http://localhost:8080/api/v1/tasks/TASK-104/attachments

# 未知附件 -> 404 ATTACHMENT_NOT_FOUND
curl -sS -i \
  http://localhost:8080/api/v1/tasks/TASK-104/attachments/ATT-missing/content
```

超限前后统计 `target/attachments`：不应增加 `.part` 或 `.bin`。再向另一个 task 使用已经创建的附件 ID，结果
也必须是 404，而不是泄漏原任务的文件。用大于 2MB 的有限输入还可验证容器入口 413；极端超大请求若发生连接
级中止，应如实区分传输结果与应用 Problem 响应。

## 六、集中排查四类文件错误

### 四个典型错误

:::pitfalls
### 直接用原始文件名落盘

**触发条件：** 把 `getOriginalFilename()` 拼到存储根。

**原因：** 文件名由客户端提供，可能携带 Unix、Windows 路径或控制字符。

**后果：** 同名覆盖、路径越界或响应头污染；不同客户端行为还会让结果不稳定。

**错误示例：**
```java
Path target = storageRoot.resolve(file.getOriginalFilename());
file.transferTo(target);
```

**正确写法：**
```java
String attachmentId = "ATT-" + UUID.randomUUID().toString();
Path target = storageRoot.resolve(attachmentId + ".bin");
String displayName = cleanFileName(file.getOriginalFilename());
```

**验证方式：** 分别上传 `../secret.txt` 与 `C:\fakepath\secret.txt`；显示名都是 `secret.txt`，最终路径只含
服务端 ID，受控根外没有新增文件。

### 用 getBytes 读取并只相信声明长度

**触发条件：** 先调用 `getSize()` 判断，再把 `getBytes()` 交给写文件 API。

**原因：** 整体 byte 数组放大内存压力；业务真正消耗的是实际读取字节，入口限制与业务限制也不是同一层。

**后果：** 并发上传时容易堆积大数组，且无法在达到业务上限时及时停止复制。

**错误示例：**
```java
if (file.getSize() <= maxBytes) {
    Files.write(target, file.getBytes());
}
```

**正确写法：**
```java
while ((read = input.read(buffer)) != -1) {
    total += read;
    if (total > maxBytes) {
        throw new FileApiException(413, "FILE_TOO_LARGE", "文件超过业务大小上限");
    }
    output.write(buffer, 0, read);
}
```

**验证方式：** 上传 1025 KiB 文件，确认读取中止、返回 413，目录中没有部分文件或元数据记录。

### 完整落盘前发布元数据

**触发条件：** 先把附件放入 Map，再复制上传流。

**原因：** 元数据与字节文件的状态顺序相反，下载可能观察到尚未完成的目标。

**后果：** 201 或并发下载会指向不存在、截断或写入失败的文件。

**错误示例：**
```java
attachments.put(key(taskId, id), stored);
copy(file, stored.getPath());
```

**正确写法：**
```java
long size = copyWithLimit(file, partial);
Files.move(partial, target, StandardCopyOption.ATOMIC_MOVE);
attachments.put(key(taskId, id), new StoredAttachment(
        id, displayName, "application/octet-stream", size, target));
```

**验证方式：** 先记录最终 `.bin` 数量，再上传超限文件；响应不是 201 且没有 Location，最终 `.bin` 数量不变，
目录也没有 `.part`。随后成功上传一个小文件，只有成功请求返回可下载 Location。

### 把文件响应包进统一 JSON

**触发条件：** 返回 `ApiResponse<Resource>`，或为了统一格式把字节转成字符串。

**原因：** 文件 body 本身就是资源表示，状态、长度、媒体类型和下载文件名都属于 HTTP 响应合同。

**后果：** 客户端收到 JSON 而不是原始字节，Content-Length 与 Content-Type 也失去文件语义。

**错误示例：**
```java
return ApiResponse.success(new FileSystemResource(path.toFile()));
```

**正确写法：**
```java
return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_OCTET_STREAM)
        .contentLength(size)
        .body(new FileSystemResource(path.toFile()));
```

**验证方式：** 用 `cmp` 比较上传输入与下载 body；响应为 octet-stream，body 不含 `data`、`code` 等 JSON 字段。
:::

## 七、独立练习

:::exercise
### 为项目文档复用同一文件边界

**要求：** 在现代与 Java 8 完整工程中分别新增项目文档上传和下载路由。上传使用项目文档集合地址，下载在
单个文档地址后追加 content 路径；精确 URI 由下方完整 Controller 源码固定。

**验收：** 两套工程分别上传两份同名 UTF-8 文档，两个 Location 不同，逐个下载与各自输入字节一致；路径型名称
只保留 basename；空文件、超限文件与未知 documentId 继续返回既有错误合同。
:::

两个路由复用现有 `AttachmentService`，因此继续使用服务端 ID、流式复制、失败清理、同名不覆盖、
`application/octet-stream` 和 400/413/404/500 Problem 合同。不要复制一套弱化的文件名或落盘逻辑。

### 1. 两套工程的完整新增源文件

现代工程和 Java 8 工程都新增
`src/main/java/com/teamflow/files/ProjectDocumentController.java`。两条基线使用的 API 均已存在，所以该文件
完全相同；它与上一节各自的 POM、`TeamFlowFileApplication.java` 共同组成可运行工程：

```java
package com.teamflow.files;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/** 为项目文档复用已经验收的文件边界。 */
@RestController
@RequestMapping("/api/v1/projects/{projectId}/documents")
final class ProjectDocumentController {
    private final TeamFlowFileApplication.AttachmentService service;

    /** 创建项目文档 Controller。 */
    ProjectDocumentController(TeamFlowFileApplication.AttachmentService service) {
        this.service = service;
    }

    /** 上传一个项目文档。 */
    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<TeamFlowFileApplication.AttachmentMetadata> upload(
            @PathVariable("projectId") String projectId,
            @RequestParam("file") MultipartFile file) {
        TeamFlowFileApplication.AttachmentMetadata metadata = service.store(projectId, file);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{documentId}/content")
                .buildAndExpand(metadata.getId())
                .toUri();
        return ResponseEntity.created(location).body(metadata);
    }

    /** 下载一个项目文档的完整字节。 */
    @GetMapping(path = "/{documentId}/content")
    ResponseEntity<Resource> download(
            @PathVariable("projectId") String projectId,
            @PathVariable("documentId") String documentId) {
        TeamFlowFileApplication.StoredAttachment stored = service.find(projectId, documentId);
        ContentDisposition disposition = ContentDisposition.builder("attachment")
                .filename(stored.getFileName(), StandardCharsets.UTF_8)
                .build();
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(stored.getSize())
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .header("X-Content-Type-Options", "nosniff")
                .body(new FileSystemResource(stored.getPath().toFile()));
    }
}
```

分别在现代工程和 Java 8 工程执行：

```bash
./mvnw clean package
./mvnw spring-boot:run
```

如果工程按上一节使用本机 `mvn`，把 `./mvnw` 换成 `mvn`。现代工程继续监听 8080，Java 8 工程继续监听
8081；不要让两个进程竞争同一端口。

### 2. curl 验收与预期结果

先为两个请求准备不同字节，再对 8080 和 8081 各执行一次完整流程：

```bash
printf 'project document A\n' > /tmp/project-a.txt
printf 'project document B\n' > /tmp/project-b.txt

curl -sS -D /tmp/project-a.headers -o /tmp/project-a.json \
  -F 'file=@/tmp/project-a.txt;filename=项目说明.txt;type=text/plain' \
  http://localhost:8080/api/v1/projects/PROJECT-21/documents
curl -sS -D /tmp/project-b.headers -o /tmp/project-b.json \
  -F 'file=@/tmp/project-b.txt;filename=项目说明.txt;type=text/plain' \
  http://localhost:8080/api/v1/projects/PROJECT-21/documents

project_a_url=$(awk 'BEGIN{IGNORECASE=1} /^Location:/{gsub("\r", ""); print $2}' \
  /tmp/project-a.headers)
project_b_url=$(awk 'BEGIN{IGNORECASE=1} /^Location:/{gsub("\r", ""); print $2}' \
  /tmp/project-b.headers)

curl -sS "$project_a_url" -o /tmp/project-a.download
curl -sS "$project_b_url" -o /tmp/project-b.download
cmp /tmp/project-a.txt /tmp/project-a.download
cmp /tmp/project-b.txt /tmp/project-b.download
test "$project_a_url" != "$project_b_url"
```

Java 8 工程执行同一组命令时，把输出文件名加上 `-java8`，并把 URL 中的 8080 改为 8081，避免覆盖现代线
证据。两条线都应观察到：

```text
HTTP/1.1 201
Location: http://localhost:<端口>/api/v1/projects/PROJECT-21/documents/ATT-.../content
{"id":"ATT-...","fileName":"项目说明.txt","contentType":"application/octet-stream","size":19}

两个 Location 不同
两个 cmp 命令退出码均为 0
```

再用 `filename=C:\fakepath\项目说明.txt` 验收 basename，用零字节和略超 1 MiB 文件验收 400/413，并把
Location 中的 documentId 改成未知值验收 404。所有失败都应为 `application/problem+json`，且失败请求不新增
可下载对象。

## 八、本课小结

文件上传的核心不是拿到 `MultipartFile`，而是管理不可信元数据、请求期临时内容和发布顺序。Controller 只表达
multipart 输入、201 Location 与 Resource 下载；Service 生成身份、清理显示名、按实际字节复制并在成功后发布。

完整下载返回文件字节及其 HTTP 元数据，失败才返回 Problem JSON。现代线与 Java 8 线虽然依赖和运行时不同，
本课采用的 API 足以共享清晰源码并保持同一外部合同。对象存储、扫描、Range、持久化与权限仍是独立能力，不能
用这个教学目录和内存 Map 冒充生产方案。

## 累计项目衔接

累计项目把同一文件边界落在任务附件路径，由 `TaskAttachmentController` 验证父任务、
`AttachmentService` 清理文件名并保存请求字节快照。当前上限为 5 MiB；空文件、超限文件和未知附件都进入
稳定 Problem Details，持久化文件存储仍留给后续文件存储专题。
