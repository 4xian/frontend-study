---
id: backend.java.learn.advanced.file-storage-and-archive-boundaries
type: lesson
title: 文件上传、存储、下载与归档安全边界
summary: 用状态、配额、内容验证、授权和展开预算把不可信文件交给可审计的存储流程
domain: backend
technology: java
module: core
stage: advanced
level: advanced
estimatedMinutes: 240
objectives:
  - 能把上传从 RECEIVING、QUARANTINED、ACCEPTED 到 PUBLISHED 或 REJECTED 建模，并说明每个状态允许的动作。
  - 能分离客户端文件名、业务对象 ID、服务端存储键和下载显示名，并在实际流量上执行多层配额。
  - 能组合扩展名、声明 Content-Type、文件头魔数和格式解析，而不是把某一项当成安全结论。
  - 能在隔离区完成扫描和校验后发布，解释路径 containment、符号链接竞态和 ATOMIC_MOVE 的边界。
  - 能为本地文件和对象存储设计 owner、版本、checksum、presigned 上传和未完成会话清理合同。
  - 能按 fileId 授权下载、生成安全 Content-Disposition、限制 Range，并拒绝 Zip Slip、链接和超预算展开。
  - 能在 Java 25 主线与 Java 8 legacy 线之间保持相同安全合同，同时识别 API 和便利方法差异。
prerequisites:
  - backend.java.learn.basics.io-files-and-resource-ownership
  - backend.java.learn.intermediate.bean-validation-and-input-contracts
related: []
tags:
  - Java
  - MultipartFile
  - NIO.2
  - 文件上传
  - 对象存储
  - Range
  - Zip Slip
  - 压缩炸弹
  - 文件扫描
  - 路径安全
appliesTo: Java 25 / Spring Boot 4.1.0 / Spring Framework 7.0.8 主线；项目补充适用于 Java 8 / Spring Boot 2.3.12.RELEASE / Spring Framework 5.2.15.RELEASE
modernBaseline:
  java: '25'
  springBoot: 4.1.0
  springFramework: 7.0.8
legacyBaseline:
  java: '8'
  springBoot: 2.3.12.RELEASE
  springFramework: 5.2.15.RELEASE
verifiedAt: 2026-08-13
sources:
  - id: oracle-java-support-roadmap
    title: Oracle Java SE Support Roadmap
    url: https://www.oracle.com/java/technologies/java-se-support-roadmap.html
    sourceType: official-reference
    appliesTo: Java 25
    claims: ['Java 25 是 LTS，作为现代主线版本']
  - id: boot41-system-requirements
    title: Spring Boot 4.1.0 System Requirements
    url: https://docs.spring.io/spring-boot/4.1/system-requirements.html
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0 / Spring Framework 7.0.8+
    claims: ['Boot 4.1.0 要求 Java 17+ 并要求 Framework 7.0.8+，Java 25 在支持范围内']
  - id: boot2312-system-requirements
    title: Spring Boot 2.3.12.RELEASE System Requirements
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements
    sourceType: official-reference
    appliesTo: Boot 2.3.12.RELEASE / Framework 5.2.15.RELEASE / Java 8
    claims: ['旧线从 Java 8 起运行并要求 Framework 5.2.15.RELEASE+']
  - id: jdk25-files
    title: Files (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Files.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['临时文件原子创建、ATOMIC_MOVE 能力和流关闭责任均由 Files API 明确']
  - id: jdk25-path
    title: Path (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Path.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['normalize 只是词法操作，toRealPath 才解析真实对象并默认跟随符号链接']
  - id: jdk25-secure-directory-stream
    title: SecureDirectoryStream (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/SecureDirectoryStream.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['相对已打开目录句柄并使用 NOFOLLOW_LINKS 可减小检查后替换竞态，能力取决于文件系统提供者']
  - id: jdk25-zip-input-stream
    title: ZipInputStream (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/zip/ZipInputStream.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['ZIP 条目按顺序读取且流必须关闭，条目名没有安全落盘保证']
  - id: jdk25-zip-file
    title: ZipFile (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/zip/ZipFile.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['ZipFile 面向随机访问，关闭 ZipFile 也会关闭条目流']
  - id: jdk8-files
    title: Files (Java Platform SE 8)
    url: https://docs.oracle.com/javase/8/docs/api/java/nio/file/Files.html
    sourceType: api-doc
    appliesTo: Java 8
    claims: ['Java 8 已提供临时文件、原子移动和文件属性能力，但没有后续 JDK 的流便利方法']
  - id: jdk8-path
    title: Path (Java Platform SE 8)
    url: https://docs.oracle.com/javase/8/docs/api/java/nio/file/Path.html
    sourceType: api-doc
    appliesTo: Java 8
    claims: ['Java 8 的路径归一化仍只是词法操作，不能替代真实文件系统检查']
  - id: jdk8-zip-input-stream
    title: ZipInputStream (Java Platform SE 8)
    url: https://docs.oracle.com/javase/8/docs/api/java/util/zip/ZipInputStream.html
    sourceType: api-doc
    appliesTo: Java 8
    claims: ['Java 8 解包必须用固定缓冲循环累计实际展开字节，available 不是剩余字节数']
  - id: jdk8-zip-file
    title: ZipFile (Java Platform SE 8)
    url: https://docs.oracle.com/javase/8/docs/api/java/util/zip/ZipFile.html
    sourceType: api-doc
    appliesTo: Java 8
    claims: ['Java 8 ZipFile 是 Closeable，关闭它会关闭条目输入流']
  - id: spring708-multipart-file
    title: MultipartFile (Spring Framework 7.0.8 API)
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/multipart/MultipartFile.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims: ['原始文件名来自客户端且可能含路径，输入流由调用方关闭，应用负责复制到持久存储']
  - id: boot410-multipart-properties
    title: MultipartProperties (Spring Boot 4.1.0 API)
    url: https://docs.spring.io/spring-boot/api/java/org/springframework/boot/servlet/autoconfigure/MultipartProperties.html
    sourceType: api-doc
    appliesTo: Spring Boot 4.1.0
    claims: ['容器入口默认单文件 1MB、单请求 10MB，不等于业务或展开后配额']
  - id: spring70-range-requests
    title: Range Requests (Spring Framework)
    url: https://docs.spring.io/spring/reference/web/webmvc/mvc-range.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.x / verified against 7.0.8
    claims: ['MVC 可透明处理 Resource 的 Range，但 InputStreamResource 不适合普通文件 Range']
  - id: spring708-content-disposition
    title: ContentDisposition (Spring Framework 7.0.8 API)
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/http/ContentDisposition.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims: ['类型化 builder 按 RFC 6266 序列化下载文件名，避免手工拼接不可信 header']
  - id: spring708-resource-converter
    title: ResourceHttpMessageConverter (Spring Framework 7.0.8 API)
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/http/converter/ResourceHttpMessageConverter.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims: ['converter 支持 Resource 与 byte ranges，Resource 类型决定长度和重复读取能力']
  - id: spring708-file-system-resource
    title: FileSystemResource (Spring Framework 7.0.8 API)
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/core/io/FileSystemResource.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims: ['FileSystemResource 可提供已知长度和重复打开的文件流']
  - id: spring708-input-stream-resource
    title: InputStreamResource (Spring Framework 7.0.8 API)
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/core/io/InputStreamResource.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims: ['InputStreamResource 是单次读取资源，contentLength 可能消耗流']
  - id: boot2312-multipart-properties
    title: MultipartProperties (Spring Boot 2.3.12.RELEASE API)
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/api/org/springframework/boot/autoconfigure/web/servlet/MultipartProperties.html
    sourceType: api-doc
    appliesTo: Boot 2.3.12.RELEASE
    claims: ['旧线默认 multipart 限额仍只是容器入口边界']
  - id: spring5215-multipart-file
    title: MultipartFile (Spring Framework 5.2.15.RELEASE API)
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/multipart/MultipartFile.html
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims: ['旧线同样不可信任原始文件名并要求调用方管理输入流']
  - id: spring5215-http-range
    title: HttpRange (Spring Framework 5.2.15.RELEASE API)
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/http/HttpRange.html
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims: ['旧线支持起止和 suffix range，并限制异常的范围集合']
  - id: rfc7578-multipart
    title: RFC 7578 multipart/form-data Section 4.2
    url: https://www.rfc-editor.org/rfc/rfc7578.html#section-4.2
    sourceType: specification
    appliesTo: multipart/form-data
    claims: ['filename 是发送方信息，接收方必须丢弃目录信息并适配本地文件系统']
  - id: rfc9110-range
    title: RFC 9110 Section 14 Range Requests
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-14
    sourceType: specification
    appliesTo: HTTP Semantics
    claims: ['单范围成功为 206，不可满足范围通常为 416 并返回完整长度']
  - id: rfc6266-content-disposition
    title: RFC 6266 Content-Disposition Section 4.3
    url: https://www.rfc-editor.org/rfc/rfc6266.html#section-4.3
    sourceType: specification
    appliesTo: HTTP response Content-Disposition
    claims: ['filename 是保存建议而非可信路径，接收方应丢弃路径段和控制字符']
  - id: owasp-file-upload
    title: OWASP File Upload Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
    sourceType: security-standard
    appliesTo: OWASP living cheat sheet
    claims: ['扩展名 allowlist、实际大小、生成存储名、隔离主机、授权和扫描应组合使用']
  - id: owasp-wstg-malicious-files
    title: OWASP WSTG-BUSL-09 Test Upload of Malicious Files
    url: https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/10-Business_Logic_Testing/09-Test_Upload_of_Malicious_Files
    sourceType: security-standard
    appliesTo: OWASP WSTG latest
    claims: ['测试应覆盖伪 MIME、伪魔数、归档穿越、链接和压缩炸弹']
  - id: tika320-detection
    title: Apache Tika 3.2.0 Content Detection
    url: https://tika.apache.org/3.2.0/detection.html
    sourceType: official-reference
    appliesTo: Apache Tika 3.2.0
    claims: ['内容检测可综合字节、资源名和声明 MIME，但检测结果不是恶意内容结论']
  - id: tika320-detector-api
    title: Apache Tika 3.2.0 Detector API
    url: https://tika.apache.org/3.2.0/api/org/apache/tika/detect/Detector.html
    sourceType: api-doc
    appliesTo: Apache Tika 3.2.0
    claims: ['Detector 从输入流和 Metadata 产生 best guess，调用方仍负责关闭和处理失败']
  - id: commons-compress128-guide
    title: Apache Commons Compress 1.28.0 User Guide
    url: https://commons.apache.org/proper/commons-compress/examples.html
    sourceType: official-reference
    appliesTo: Commons Compress 1.28.0
    claims: ['条目名不保证是安全相对路径，落盘前必须验证目标仍在根目录内']
  - id: commons-compress128-archive-entry
    title: ArchiveEntry (Apache Commons Compress 1.28.0 API)
    url: https://commons.apache.org/proper/commons-compress/apidocs/org/apache/commons/compress/archivers/ArchiveEntry.html
    sourceType: api-doc
    appliesTo: Commons Compress 1.28.0
    claims: ['条目大小可以未知，resolveIn 只能辅助词法 containment，不能自动处理链接竞态']
  - id: commons-compress128-tar-entry
    title: TarArchiveEntry (Apache Commons Compress 1.28.0 API)
    url: https://commons.apache.org/proper/commons-compress/apidocs/org/apache/commons/compress/archivers/tar/TarArchiveEntry.html
    sourceType: api-doc
    appliesTo: Commons Compress 1.28.0
    claims: ['TAR 可携带 symlink、hard link、FIFO、设备和 sparse 元数据，普通文档业务应 fail closed']
  - id: commons-compress128-statistics
    title: InputStreamStatistics (Apache Commons Compress 1.28.0 API)
    url: https://commons.apache.org/proper/commons-compress/apidocs/org/apache/commons/compress/utils/InputStreamStatistics.html
    sourceType: api-doc
    appliesTo: Commons Compress 1.28.0
    claims: ['可读取压缩和展开字节用于检测异常压缩比，但仍需绝对预算']
  - id: commons-compress-security
    title: Apache Commons Compress Security Reports
    url: https://commons.apache.org/proper/commons-compress/security.html
    sourceType: security-standard
    appliesTo: Commons Compress releases through 1.28.0
    claims: ['归档库版本和已知安全公告本身属于处理不可信归档的安全边界']
  - id: posix-pax
    title: POSIX.1-2024 pax utility and archive format
    url: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/pax.html
    sourceType: specification
    appliesTo: POSIX.1-2024 / Issue 8
    claims: ['PAX 可携带路径、权限、用户组、链接和扩展属性，不能默认恢复高权限元数据']
  - id: s3-presigned-urls
    title: Download and upload objects with presigned URLs
    url: https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html
    sourceType: official-reference
    appliesTo: Amazon S3 current service behavior
    claims: ['presigned URL 是 bearer token，可重复使用至到期，相同 key 上传会覆盖对象']
  - id: s3-multipart-upload
    title: Multipart upload in Amazon S3
    url: https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html
    sourceType: official-reference
    appliesTo: Amazon S3 current service behavior
    claims: ['multipart upload 需要 initiate、parts、complete/abort，未完成 parts 会持续占用资源']
  - id: s3-checksum-integrity
    title: Checking object integrity in Amazon S3
    url: https://docs.aws.amazon.com/AmazonS3/latest/userguide/checking-object-integrity.html
    sourceType: official-reference
    appliesTo: Amazon S3 checksums
    claims: ['checksum 证明传输完整性，不证明授权、MIME 或恶意内容']
  - id: s3-conditional-requests
    title: Conditional requests in Amazon S3
    url: https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-requests.html
    sourceType: official-reference
    appliesTo: Amazon S3 conditional requests
    claims: ['条件写可防止同 key 无意覆盖，检查后再 PUT 不是原子防覆盖方案']
  - id: s3-versioning
    title: Using versioning in S3 buckets
    url: https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html
    sourceType: official-reference
    appliesTo: Amazon S3 Versioning
    claims: ['versioning 保存同 key 的多个完整版本，但不是授权、保留或扫描替代品']
  - id: s3-security-best-practices
    title: Security best practices for Amazon S3
    url: https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html
    sourceType: official-reference
    appliesTo: Amazon S3 current service guidance
    claims: ['使用最小权限、Block Public Access、临时凭据和审计，应用仍需执行业务授权']
projectEvidence:
  - file: dzzz-app/src/main/java/com/tdh/bdzz/download/LocalDownloader.java
    symbol: com.tdh.bdzz.download.LocalDownloader
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/download/DownloadResponse.java
    symbol: com.tdh.bdzz.download.DownloadResponse
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/upload/UploadUtil.java
    symbol: com.tdh.bdzz.upload.UploadUtil
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/fileProcess/AbstractFileProcessHandler.java
    symbol: com.tdh.bdzz.timer.handler.fileProcess.AbstractFileProcessHandler
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/util/FileTypeUtils.java
    symbol: com.tdh.util.FileTypeUtils
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/SysConfig.java
    symbol: com.tdh.bdzz.config.SysConfig
    usage: rejected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/download/DownloadUtil.java
    symbol: com.tdh.bdzz.download.DownloadUtil
    usage: rejected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingWSServer.java
    symbol: com.tdh.bdzz.config.websocket.server.LoggingWSServer
    usage: rejected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/CommonUtil.java
    symbol: com.tdh.bdzz.util.CommonUtil
    usage: rejected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/controller/BlmbController.java
    symbol: com.tdh.bdzz.controller.BlmbController
    usage: rejected
---
# 文件上传、存储、下载与归档安全边界

## 为什么需要学习

文件上传不是把一个 `MultipartFile` 复制到目录，下载也不是把请求路径拼成 `File`。客户端能控制
原始文件名、声明类型、部分大小和归档条目；攻击者还可以让小输入产生巨大的展开量，或利用符号链接、
重复名和对象存储的 bearer URL 绕过业务边界。本课把文件当成一个有状态的外部载荷：先接收、隔离、
验证和扫描，再按业务对象授权发布。

## 学习目标

- 能区分上传状态、业务对象 ID、存储键、下载显示名和 checksum。
- 能在真实流量上执行单文件、请求、part、租户、并发和处理预算。
- 能组合扩展名、声明 MIME、魔数和 parser，而不是迷信单一信号。
- 能解释本地 containment、符号链接竞态、`ATOMIC_MOVE` 和对象存储条件写的边界。
- 能按 fileId 授权下载，正确处理 `Content-Disposition`、Range 和响应流。
- 能对 ZIP/TAR 拒绝 `..`、绝对路径、链接、设备、重复名和超预算展开。

## 前置术语

- **原始文件名：** 客户端提供的显示信息，不是路径，也不是唯一标识。
- **业务对象 ID：** 例如合同或头像的服务端 ID，决定谁能访问文件。
- **存储键：** 服务端生成的本地相对路径或对象 key，不能由原名直接拼接。
- **隔离区：** 校验和扫描完成前，任何下载和公开 URL 都不可见的暂存位置。
- **containment：** 解析后的目标必须仍位于受控根目录内，且不能借助链接逃逸。
- **展开预算：** 条目数、单项大小、总大小、压缩比、嵌套深度和处理时间的组合上限。

## 零基础知识点详解

### 上传状态机先于 controller

**是什么：** 最小状态为 `RECEIVING -> QUARANTINED -> ACCEPTED -> PUBLISHED`，任意校验、扫描或清理失败进入
`REJECTED`。

**作用：** 状态机让“已经写了字节”不等于“可以下载”。数据库事务只能管理数据库，不能回滚已写入的磁盘对象或
远端 multipart parts。

**什么时候用：** 所有来自 HTTP、消息队列或批量导入的文件都应先进入隔离状态。

**怎么做：** 先创建 fileId 和上传会话，流式写入临时对象并计数；完成后保存 checksum、实际大小、检测结果和
policyVersion，扫描通过才执行发布。

**最小示例：** `RECEIVING` 只能写入；`QUARANTINED` 只能验证；`PUBLISHED` 才能被授权下载。

**运行结果：** 下面完整示例会打印 `stored=1`，而 Zip Slip 和预算超限都只进入 `rejected`。

**常见误区：** 在 `@Transactional` 方法中先写最终目录，再假设抛异常会删除外部文件。

### 文件名、业务 ID 与存储键三分离

**是什么：** `合同/../../secret.txt` 只能作为经过清洗的显示名，不能成为路径或对象 key。

**作用：** 服务端生成 UUID/不可预测键，并用数据库记录把 key 绑定到 tenant、owner、fileId 和版本。

**什么时候用：** 本地文件、S3、CDN 源站和 presigned URL 都必须使用这个分离。

**怎么做：** 丢弃目录段和控制字符，保留短显示名；生成 `tenant/fileId/version` 形式的 key；下载只接受 fileId，
查询记录后再打开对象。

**最小示例：** `StoredObject("tenant-a/f-17/v1", "报告.txt")`；请求不能传 `tenant-a/...`。

**运行结果：** CR/LF、绝对路径、`..` 和重复 key 输入不会影响生成的服务端 key。

**常见误区：** 只调用 `normalize()` 后 `startsWith(root)`，把词法检查当作符号链接防护。

### 三层限额必须按实际流计数

**是什么：** 容器入口限制请求和 part，应用限制租户/并发/配额，处理器限制解析和展开。

**作用：** `Content-Length`、`MultipartFile.getSize()` 和 ZIP entry size 都可能缺失、虚报或无法代表实际消耗。

**什么时候用：** 在复制循环的每个块累加 `actualBytes`，超限立即停止、关闭并清理。

**怎么做：** 固定缓冲区，检查 `next > limit`；同时更新 checksum、磁盘预算和 deadline；禁止 `getBytes()`、
`readAllBytes()` 或按声明大小分配数组处理不可信输入。

**最小示例：** `copy(input, output, 8 * 1024 * 1024)`，读到第 8MB 后的下一块直接拒绝。

**运行结果：** 超限流不发布，临时文件和上传会话均进入清理路径。

**常见误区：** 把 Boot 的 1MB/10MB 默认值当作业务总配额，或只限制单文件而不限制 part 数和租户日配额。

### 扩展名、声明 MIME、魔数和 parser 是不同信号

**是什么：** 扩展名是用户界面提示，`Content-Type` 是发送方声明，magic bytes 是开头字节，parser 才能进一步
验证格式结构。

**作用：** 多信号组合可拒绝伪 MIME、双扩展和错误魔数；它们仍不能证明没有恶意内容。

**什么时候用：** allowlist 决定业务允许的类别，检测器和 parser 负责确认字节是否符合类别，AV/CDR 负责另一层
内容风险。

**怎么做：** 保存 declared/accepted/actual 三个字段；不一致时 fail closed；解析失败不得发布。

**最小示例：** 声明 `image/png` 但魔数是 ZIP，结果为 `REJECTED(TYPE_MISMATCH)`。

**运行结果：** `FileTypeUtils` 这样的项目候选只能说明存在检测入口，不能替代实际验证合同。

**常见误区：** 只检查 `.jpg` 或只信 `MultipartFile.getContentType()`。

### 隔离发布和 ATOMIC_MOVE 有明确边界

**是什么：** 暂存文件位于 webroot 外，扫描通过后才移动到正式目录；同一 FileStore 上可尝试 `ATOMIC_MOVE`。

**作用：** 防止半文件被下载，也让“已通过扫描的字节”与发布对象绑定。

**什么时候用：** 本地持久化、生成缩略图和导出文件都应经过临时文件和完成状态。

**怎么做：** `createTempFile` 后写入和 `fsync`（若耐久性有要求），再 `move(temp, target, ATOMIC_MOVE)`；不支持
原子移动时显式失败或改用带完成标记的协议，不要静默宣称原子。

**最小示例：** `Files.move(staged, published, ATOMIC_MOVE)`；跨 FileStore 抛出 `AtomicMoveNotSupportedException`。

**运行结果：** 发布失败时 target 不可见，finally 仍会清理 staged。

**常见误区：** 数据库回滚后留下文件，或使用 `REPLACE_EXISTING` 覆盖另一个 fileId 的对象。

### containment 还要考虑链接竞态

**是什么：** `root.resolve(name).normalize()` 只消除 `.` 和 `..`；符号链接可能在检查后被替换。

**作用：** 防止 Zip Slip、本地下载穿越和攻击者借助挂载点访问根外文件。

**什么时候用：** 任何不可信相对名写入本地目录时。

**怎么做：** 先拒绝绝对路径、空段、`..`、UNC/驱动器和控制字符；对现有对象使用 `toRealPath`；优先通过已打开的
`SecureDirectoryStream` 与 `NOFOLLOW_LINKS` 操作；无法获得安全句柄时 fail closed 或使用隔离容器。

**最小示例：** `safeResolve(root, "../outside.txt")` 抛 `PathPolicyException`。

**运行结果：** 词法逃逸在写入前被拒绝；链接竞态不被“startsWith”假装解决。

**常见误区：** 先 `exists()` 再 `newOutputStream()`，把两次调用之间的替换窗口忽略掉。

### 下载授权、显示名和 Range 由 fileId 驱动

**是什么：** controller 接受 fileId 和可选 Range，服务层查询对象记录、校验 tenant/actor 权限，再返回资源。

**作用：** 访问者无法通过路径猜测或修改 key 越权；响应名是清洗后的显示元数据。

**什么时候用：** 普通下载、断点续传、预览和 CDN 回源都应沿用同一授权 owner。

**怎么做：** 使用 `ContentDisposition.attachment().filename(displayName)`；单范围返回 206 和 Content-Range，
无效范围返回 416 与 `bytes */length`；限制范围数量、重叠和总读取量。

**最小示例：** `download(fileId, actor, Range.of(0, 99))`，而不是 `download(request.getParameter("path"))`。

**运行结果：** `displayName` 里的 CR/LF 被替换，header 不含换行和原始路径。

**常见误区：** 手工拼接 `Content-Disposition`，或用一次性 `InputStreamResource` 计算长度后再尝试 Range。

### 对象存储仍然需要业务 owner

**是什么：** S3 类服务的 bucket、key、version、checksum、uploadId 和 presigned URL 是基础设施合同，不是业务授权。

**作用：** 条件写避免无意覆盖，versioning 提供恢复，complete/abort 终结 multipart 会话。

**什么时候用：** 大文件直传、跨节点共享和 CDN 源站存储。

**怎么做：** 服务端创建一次性 grant，绑定 method、key、checksum、过期时间和 fileId；上传完成后服务端验证
状态再扫描/发布；失败和超时由清扫任务 abort。

**最小示例：** `PUT tenant-a/f-17/v1` 只能由对应 uploadId 完成，不能把 URL 当可撤销会话。

**运行结果：** checksum 只证明字节完整，授权仍由 fileId/tenant 记录决定。

**常见误区：** 固定 key 复用 presigned URL，或把 multipart ETag 当完整对象 MD5。

### ZIP/TAR 展开是另一个 admission

**是什么：** 每个 entry 都必须通过类型、路径、重复名、条目数、单项大小、总展开大小、比率、深度和时间预算。

**作用：** 防止 Zip Slip、压缩炸弹、重复名覆盖、嵌套归档和资源耗尽。

**什么时候用：** 归档导入、批量附件和备份恢复；若只需保存归档，优先原样隔离存储而不自动解包。

**怎么做：** `ZipInputStream` 顺序读取；拒绝绝对路径、`..`、链接和未知危险类型；使用固定缓冲区累计实际展开
字节；重复名、超过条目数或总预算立即拒绝并清理整个目标根。

**最小示例：** `../escape.txt`、`/etc/passwd`、symlink/hardlink 和 1MB 压缩出 100MB 都是拒绝。

**运行结果：** 目标根外没有文件，部分成功的条目也被删除，不返回“成功但少几个文件”。

**常见误区：** 只检查字符串 `../`，信任 entry size，或恢复 TAR 的 owner、mode、设备和链接。

### 资源关闭、扫描和审计必须覆盖失败路径

**是什么：** 输入/输出流、归档流、目录遍历流、对象响应体和临时对象各有 owner。

**作用：** try-with-resources 负责流，状态记录和 finally/清扫任务负责临时文件与未完成 upload。

**什么时候用：** 成功、类型拒绝、超限、扫描失败、取消和进程关闭都必须验证。

**怎么做：** 审计记录 actor、tenant、fileId、action、policyVersion、actual size、checksum id、scan outcome
和 storage version；清洗 CR/LF，不记录原始路径、secret、presigned query 或内容。

**最小示例：** 日志只保留 `fileId=f-17 outcome=REJECTED reason=ARCHIVE_BUDGET`。

**运行结果：** 日志可以关联流程，但不能重放下载或注入新行。

**常见误区：** 把 checksum 当扫描结果，把旧扫描结果复用于新对象，或只在成功分支关闭流。

## JDK 25 与 Java 8 最小 API 对照

| 主题 | Java 25 主线 | Java 8 legacy | 合同 |
| --- | --- | --- | --- |
| 路径 | `Path.of`、`Files` | `Paths.get`、`Files` | 先拒绝不安全名，再做 containment |
| 流复制 | `transferTo` 可用于受信任封装 | 固定缓冲循环 | 不可信输入始终自己计数 |
| ZIP | `ZipInputStream`、`ZipFile` | 同核心 API | 不信声明 size，实际读入计数 |
| Spring | Boot 4.1 / Framework 7.0.8 | Boot 2.3 / Framework 5.2.15 | API 包名可不同，安全状态不变 |
| Range | `Resource` + MVC Range | `HttpRange` + Resource converter | 限制范围集合并按 fileId 授权 |

Java 8 没有 `Path.of`、`InputStream.readAllBytes`、`readNBytes` 和 `transferTo`；使用 `Paths.get` 与固定
`byte[]` 循环。Java 25 的便利方法也不能让不可信长度自动变得安全。Spring 7 与 Spring 5.2 的
`MultipartFile` 生命周期和原名不可信合同一致，但不要把现代配置类或依赖包复制到旧线。

## 核心接口与完整示例

下面的示例只依赖 JDK，故 Java 25 和 Java 8 都能编译。它模拟输入流、服务端存储键、状态转换、隔离根、
原子发布、实际计数、Range、脱敏审计、真实 ZIP 负例和展开预算；真实系统仍应把临时目录换成隔离的本地/
对象存储 adapter，把扫描结果绑定到 checksum 与 policyVersion。

```java
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

public final class FileStorageBoundaryExample {
    enum UploadState { RECEIVING, QUARANTINED, ACCEPTED, PUBLISHED, REJECTED }
    enum EntryKind { DIRECTORY, REGULAR, SYMBOLIC_LINK, HARD_LINK, DEVICE }

    /** 防止工具类被实例化。 */
    private FileStorageBoundaryExample() {}

    /** 复制输入流并按实际字节数执行上限。 */
    static byte[] copyWithLimit(InputStream input, long limit) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        byte[] buffer = new byte[256];
        long total = 0;
        int read;
        while ((read = input.read(buffer)) != -1) {
            total += read;
            if (total > limit) throw new IOException("UPLOAD_LIMIT");
            output.write(buffer, 0, read);
        }
        return output.toByteArray();
    }

    /** 将客户端文件名转换为不含控制字符的显示名，不把它当作存储路径。 */
    static String displayName(String original) {
        if (original == null || original.trim().isEmpty()) return "download.bin";
        String name = original.replace('\\', '/');
        int slash = name.lastIndexOf('/');
        name = slash >= 0 ? name.substring(slash + 1) : name;
        name = name.replaceAll("[\\p{Cntrl}]", "_");
        return name.length() == 0 ? "download.bin" : name;
    }

    /** 只用服务端生成的 token 组合业务存储键。 */
    static String storageKey(String tenant, String fileId, int version) throws IOException {
        if (!tenant.matches("[A-Za-z0-9-]+") || !fileId.matches("[A-Za-z0-9-]+") || version < 1) {
            throw new IOException("STORAGE_KEY");
        }
        return tenant + "/" + fileId + "/v" + version;
    }

    /** 执行上传状态的单向转移。 */
    static UploadState advance(UploadState state, String event) throws IOException {
        if ("reject".equals(event)) return UploadState.REJECTED;
        if (state == UploadState.RECEIVING && "quarantine".equals(event)) return UploadState.QUARANTINED;
        if (state == UploadState.ACCEPTED && "publish".equals(event)) return UploadState.PUBLISHED;
        throw new IOException("STATE_TRANSITION");
    }

    /** 只有类型与扫描都通过时才允许隔离对象进入 ACCEPTED。 */
    static UploadState validate(UploadState state, boolean typeAccepted, boolean scanAccepted)
            throws IOException {
        if (state != UploadState.QUARANTINED) throw new IOException("STATE_TRANSITION");
        return typeAccepted && scanAccepted ? UploadState.ACCEPTED : UploadState.REJECTED;
    }

    /** 清洗审计字段，避免控制字符和秘密进入日志。 */
    static String audit(String fileId, String outcome) {
        return "fileId=" + displayName(fileId).replace(' ', '_') + " outcome=" + displayName(outcome);
    }

    /** 组合声明 MIME 与最小魔数检查，拒绝不一致的内容。 */
    static boolean acceptedType(String declared, byte[] payload) {
        return "text/plain".equals(declared) && payload.length > 0 && payload[0] >= 0x20;
    }

    /** 只允许记录中的 owner 下载业务对象，不接受请求路径作为授权依据。 */
    static boolean canDownload(String fileId, String owner, String actor) {
        return fileId.matches("[A-Za-z0-9-]+") && owner.equals(actor);
    }

    /** 递归删除隔离根，覆盖成功后的清扫和失败回滚。 */
    static void deleteTree(Path root) throws IOException {
        if (!Files.exists(root, LinkOption.NOFOLLOW_LINKS)) return;
        if (Files.isDirectory(root) && !Files.isSymbolicLink(root)) {
            DirectoryStream<Path> children = Files.newDirectoryStream(root);
            try {
                for (Path child : children) deleteTree(child);
            } finally {
                children.close();
            }
        }
        Files.deleteIfExists(root);
    }

    /** 创建并检查普通父目录，拒绝已存在的符号链接或非目录。 */
    static void ensureParent(Path root, Path parent) throws IOException {
        Path current = root;
        Path relative = root.relativize(parent);
        for (Path part : relative) {
            current = current.resolve(part);
            if (Files.exists(current)) {
                if (Files.isSymbolicLink(current) || !Files.isDirectory(current)) throw new IOException("ARCHIVE_TYPE");
            } else {
                Files.createDirectory(current);
            }
        }
    }

    /** 创建真实受控隔离根，拒绝符号链接、非目录和真实路径漂移。 */
    static Path prepareRoot(Path root) throws IOException {
        Path absolute = root.toAbsolutePath().normalize();
        Path parent = absolute.getParent();
        if (parent == null || Files.isSymbolicLink(parent) || !Files.isDirectory(parent)
                || !parent.toRealPath().equals(parent)) {
            throw new IOException("ARCHIVE_ROOT");
        }
        if (Files.exists(absolute, LinkOption.NOFOLLOW_LINKS)) {
            if (Files.isSymbolicLink(absolute) || !Files.isDirectory(absolute)) {
                throw new IOException("ARCHIVE_ROOT");
            }
        } else {
            Files.createDirectory(absolute);
        }
        Path real = absolute.toRealPath(LinkOption.NOFOLLOW_LINKS);
        if (!real.equals(absolute)) throw new IOException("ARCHIVE_ROOT");
        return real;
    }

    /** 仅允许 ACCEPTED 对象以原子移动发布，能力不足时显式失败。 */
    static void publishAccepted(UploadState state, Path staged, Path target) throws IOException {
        if (state != UploadState.ACCEPTED) throw new IOException("PUBLISH_STATE");
        Files.move(staged, target, StandardCopyOption.ATOMIC_MOVE);
    }

    /** 判断归档条目是否是根目录内的普通相对路径。 */
    static String safeEntryName(String name) throws IOException {
        if (name == null || name.length() == 0 || name.startsWith("/") || name.startsWith("\\")) {
            throw new IOException("ARCHIVE_PATH");
        }
        StringBuilder normalized = new StringBuilder();
        String[] parts = name.replace('\\', '/').split("/");
        for (String part : parts) {
            if (part.length() == 0 || part.equals(".")) continue;
            if (part.equals("..") || part.indexOf(':') >= 0 || part.indexOf('\u0000') >= 0) {
                throw new IOException("ARCHIVE_PATH");
            }
            if (normalized.length() > 0) normalized.append('/');
            normalized.append(part);
        }
        if (normalized.length() == 0) throw new IOException("ARCHIVE_PATH");
        return normalized.toString();
    }

    /** 只接受普通文件或目录，拒绝归档链接、设备和其它危险类型。 */
    static void admitEntry(EntryKind kind) throws IOException {
        if (kind != EntryKind.DIRECTORY && kind != EntryKind.REGULAR) throw new IOException("ARCHIVE_TYPE");
    }

    /** 读取 ZIP 到新隔离根，并限制路径、条目、字节、深度、压缩比和处理时限。 */
    static int extractZip(InputStream input, Path root, int maxEntries, long maxEntryBytes,
            long maxTotalBytes, int maxDepth, double maxRatio, long deadlineNanos) throws IOException {
        Set<String> names = new HashSet<String>();
        byte[] buffer = new byte[256];
        long total = 0;
        int entries = 0;
        boolean completed = false;
        root = prepareRoot(root);
        ZipInputStream zip = new ZipInputStream(input, StandardCharsets.UTF_8);
        try {
            ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null) {
                if (System.nanoTime() > deadlineNanos) throw new IOException("ARCHIVE_TIMEOUT");
                String name = safeEntryName(entry.getName());
                int depth = name.split("/").length;
                if (++entries > maxEntries || depth > maxDepth || !names.add(name)) {
                    throw new IOException("ARCHIVE_BUDGET");
                }
                Path target = root.resolve(name).normalize();
                if (!target.startsWith(root.toAbsolutePath().normalize())) throw new IOException("ARCHIVE_PATH");
                if (entry.isDirectory()) {
                    admitEntry(EntryKind.DIRECTORY);
                    if (Files.exists(target)) {
                        if (Files.isSymbolicLink(target) || !Files.isDirectory(target)) throw new IOException("ARCHIVE_TYPE");
                    } else {
                        ensureParent(root, target.getParent());
                        Files.createDirectory(target);
                    }
                    continue;
                }
                admitEntry(EntryKind.REGULAR);
                Path parent = target.getParent();
                if (parent != null) ensureParent(root, parent);
                if (Files.isSymbolicLink(target) || Files.exists(target)) throw new IOException("ARCHIVE_TYPE");
                long item = 0;
                OutputStream output = Files.newOutputStream(target, StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE);
                try {
                    int read;
                    while ((read = zip.read(buffer)) != -1) {
                        item += read;
                        total += read;
                        if (System.nanoTime() > deadlineNanos || item > maxEntryBytes || total > maxTotalBytes) {
                            throw new IOException("ARCHIVE_BUDGET");
                        }
                        output.write(buffer, 0, read);
                    }
                } finally {
                    output.close();
                }
                long compressed = entry.getCompressedSize();
                if (compressed > 0 && item / (double) compressed > maxRatio) throw new IOException("ARCHIVE_RATIO");
            }
            completed = true;
            return entries;
        } finally {
            try {
                zip.close();
            } finally {
                if (!completed) deleteTree(root);
            }
        }
    }

    /** 构造指定条目的真实 ZIP 反馈环输入。 */
    static byte[] zip(String[] names, byte[][] bodies) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ZipOutputStream zip = new ZipOutputStream(output);
        try {
            for (int i = 0; i < names.length; i++) {
                zip.putNextEntry(new ZipEntry(names[i]));
                zip.write(bodies[i]);
                zip.closeEntry();
            }
        } finally {
            zip.close();
        }
        return output.toByteArray();
    }

    /** 构造包含两个普通文件的 ZIP。 */
    static byte[] validZip() throws IOException {
        return zip(new String[] { "one.txt", "dir/two.txt" }, new byte[][] { { 1 }, { 2 } });
    }

    /** 构造真实 Zip Slip、绝对路径和规范化重复名 ZIP。 */
    static byte[] maliciousZip(String name) throws IOException {
        return zip(new String[] { name }, new byte[][] { { 1 } });
    }

    /** 构造一个真实但超过单项预算的 ZIP。 */
    static byte[] oversizedZip() throws IOException {
        return zip(new String[] { "large.txt" }, new byte[][] { { 1, 2, 3 } });
    }

    /** 返回受限的单范围字节切片。 */
    static byte[] range(byte[] bytes, int start, int endInclusive) throws IOException {
        if (start < 0 || endInclusive < start || start >= bytes.length) throw new IOException("RANGE_416");
        int end = Math.min(endInclusive, bytes.length - 1);
        byte[] result = new byte[end - start + 1];
        System.arraycopy(bytes, start, result, 0, result.length);
        return result;
    }

    /** 运行状态、发布、下载、审计和真实归档负例，并验证失败清理。 */
    public static void main(String[] args) throws Exception {
        String fileId = "f-" + UUID.randomUUID().toString().substring(0, 8);
        byte[] payload = copyWithLimit(new ByteArrayInputStream("hello".getBytes("UTF-8")), 1024);
        String key = storageKey("tenant-a", fileId, 1);
        boolean typeAccepted = acceptedType("text/plain", payload);
        boolean scanAccepted = true;
        boolean authorized = canDownload(fileId, "tenant-a", "tenant-a");
        byte[] firstRange = range(payload, 0, 1);
        Path base = Files.createTempDirectory("java-file-storage-").toRealPath();
        Path staged = Files.createTempFile(base, "staged-", ".bin");
        OutputStream stagedOutput = Files.newOutputStream(staged, StandardOpenOption.TRUNCATE_EXISTING, StandardOpenOption.WRITE);
        try { stagedOutput.write(payload); } finally { stagedOutput.close(); }
        Path published = base.resolve("published-" + fileId);
        UploadState state = advance(UploadState.RECEIVING, "quarantine");
        state = validate(state, typeAccepted, scanAccepted);
        publishAccepted(state, staged, published);
        state = advance(state, "publish");
        Path rejectedStaged = Files.createTempFile(base, "type-rejected-", ".bin");
        Path rejectedTarget = base.resolve("must-not-publish");
        UploadState rejectedState = validate(UploadState.QUARANTINED, false, true);
        boolean typePublishRejected = false;
        try { publishAccepted(rejectedState, rejectedStaged, rejectedTarget); }
        catch (IOException expected) { typePublishRejected = true; }
        if (rejectedState == UploadState.REJECTED) Files.delete(rejectedStaged);
        boolean rejectedTargetMissing = !Files.exists(rejectedTarget);
        Path scanStaged = Files.createTempFile(base, "scan-rejected-", ".bin");
        Path scanTarget = base.resolve("scan-must-not-publish");
        UploadState scanState = validate(UploadState.QUARANTINED, true, false);
        boolean scanPublishRejected = false;
        try { publishAccepted(scanState, scanStaged, scanTarget); }
        catch (IOException expected) { scanPublishRejected = true; }
        if (scanState == UploadState.REJECTED) Files.delete(scanStaged);
        boolean scanTargetMissing = !Files.exists(scanTarget);
        long deadline = System.nanoTime() + 1000000000L;
        int extracted = extractZip(new ByteArrayInputStream(validZip()), base.resolve("valid"), 4, 1024, 2048, 3, 1000, deadline);
        Path rejectedRoot = base.resolve("rejected");
        boolean rejected = false;
        try { extractZip(new ByteArrayInputStream(maliciousZip("../escape.txt")), rejectedRoot, 4, 1024, 2048, 3, 1000, deadline); }
        catch (IOException expected) { rejected = true; }
        boolean absoluteRejected = false;
        try { extractZip(new ByteArrayInputStream(maliciousZip("/etc/passwd")), base.resolve("absolute"), 4, 1024, 2048, 3, 1000, deadline); }
        catch (IOException expected) { absoluteRejected = true; }
        boolean duplicateRejected = false;
        try { extractZip(new ByteArrayInputStream(zip(new String[] { "one.txt", "./one.txt" }, new byte[][] { { 1 }, { 2 } })), base.resolve("duplicate"), 4, 1024, 2048, 3, 1000, deadline); }
        catch (IOException expected) { duplicateRejected = true; }
        boolean budgetRejected = false;
        try { extractZip(new ByteArrayInputStream(oversizedZip()), base.resolve("budget"), 1, 1, 1, 3, 1000, deadline); }
        catch (IOException expected) { budgetRejected = true; }
        boolean crlfClean = !audit("f-1\r\n", "REJECTED\r\n").matches(".*[\\r\\n].*");
        boolean unsafeTypesRejected = false;
        try { admitEntry(EntryKind.SYMBOLIC_LINK); } catch (IOException expected) { unsafeTypesRejected = true; }
        Path outside = Files.createTempDirectory("java-file-outside-").toRealPath();
        Path linkedRoot = base.resolve("linked-root");
        Files.createSymbolicLink(linkedRoot, outside);
        boolean linkedRootRejected = false;
        try { extractZip(new ByteArrayInputStream(validZip()), linkedRoot, 4, 1024, 2048, 3, 1000, deadline); }
        catch (IOException expected) { linkedRootRejected = true; }
        boolean outsideClean = !Files.exists(outside.resolve("one.txt"));
        deleteTree(linkedRoot);
        deleteTree(outside);
        boolean cleaned = !Files.exists(rejectedRoot) && !Files.exists(base.resolve("absolute"))
                && !Files.exists(base.resolve("duplicate")) && !Files.exists(base.resolve("budget"))
                && !Files.exists(rejectedStaged) && !Files.exists(scanStaged) && !Files.exists(rejectedTarget);
        boolean publishedExists = Files.exists(published);
        deleteTree(base);
        if (state != UploadState.PUBLISHED || rejectedState != UploadState.REJECTED || scanState != UploadState.REJECTED
                || !publishedExists || !typeAccepted || !authorized || !crlfClean || !rejected || !absoluteRejected
                || !duplicateRejected || !budgetRejected || !unsafeTypesRejected || !linkedRootRejected || !outsideClean
                || !typePublishRejected || !scanPublishRejected || !rejectedTargetMissing || !scanTargetMissing
                || !cleaned || firstRange.length != 2 || extracted != 2) {
            throw new IllegalStateException("negative control failed");
        }
        System.out.println("FILE_STORAGE_PASS stored=1 downloaded=true extracted=2 rejected=true cleaned=true key=" + key);
    }
}
```

示例中的 `extractZip` 使用真实 ZIP 条目验证 `../escape.txt`、绝对路径、规范化重复名和超预算，并在失败时
删除隔离根；`EntryKind` fake adapter 覆盖链接和设备拒绝。生产实现不应把内存 `byte[]` 当作大文件方案。

## 从零跟着做

1. 在 API 边界创建 fileId、tenant、业务对象 ID 和 upload session，原始名只保存为显示元数据。
2. 用容器 multipart 配置做第一层限制，再在复制循环中计数实际字节、checksum、租户配额和 deadline。
3. 把字节写入 webroot 外的隔离区，完成类型检测、parser、AV/CDR 和归档 admission 后再发布。
4. 本地发布尝试 `ATOMIC_MOVE`；对象存储使用服务端生成 key、checksum、条件写和可清扫的 multipart session。
5. 下载只接受 fileId，查询授权记录后使用 `FileSystemResource` 或等价可重复资源生成响应；范围过多或无效时拒绝。
6. 解压逐 entry 校验路径和类型，累计实际字节、条目数和时限；失败时删除整个输出根并保留类型化审计结果。

## 如何使用

Spring MVC 中让 controller 只负责请求绑定，service 负责状态和授权，storage adapter 负责本地/对象存储，
scanner 负责检测，archive adapter 负责展开预算。每个 owner 都应能说明启动、完成、取消和关闭顺序。对大文件
使用流和 Range，不要把 `MultipartFile.getBytes()`、`InputStreamResource` 或 presigned URL 直接暴露为业务合同。

## 适用与不适用场景

适用于头像、附件、合同、导入包、对象存储直传和断点下载。不适用于把任意压缩包当作可信部署包，也不适用于
自动恢复归档中的设备、owner、setuid、链接或执行位；这些场景需要单独的隔离执行和权限协议。

## 当前项目补充

冻结矩阵只证明项目存在 `LocalDownloader`、`DownloadResponse`、`UploadUtil`、`AbstractFileProcessHandler` 和
`FileTypeUtils` 这些 observed 候选，说明课程主题与调用面相关，不证明路径、授权、大小、扫描或发布实现正确。
`SysConfig`、`DownloadUtil`、`LoggingWSServer`、`CommonUtil` 和 `BlmbController` 仅作为 rejected 风险证据；
正文不读取或复制它们的实现，也不从类名推断缺陷。

## Java 8 / Spring Boot 2.3 兼容写法

Java 8 使用 `Paths.get`、`ZipInputStream` 和固定 `byte[]` 循环；没有 `readAllBytes`、`readNBytes` 和
`InputStream.transferTo`。Spring Boot 2.3 的 multipart 默认值不改变业务层实际计数要求，Framework 5.2 的
`MultipartFile`、`HttpRange` 和 Resource converter 仍需由应用管理流和授权。现代与 legacy 的包名、配置类和
SDK 适配器可以不同，但 `RECEIVING -> QUARANTINED -> PUBLISHED`、containment、扫描和清理合同不能不同。

## 新旧版本差异

- **路径 API：** Java 25 可使用 `Path.of`，Java 8 使用 `Paths.get`；两者的 `normalize` 都不是链接安全证明。
- **复制 API：** Java 25 有便利的 `transferTo`，不可信输入仍应使用带计数的固定缓冲；Java 8 必须手写循环。
- **Spring：** Boot 4.1/Framework 7.0.8 与 Boot 2.3/Framework 5.2.15 的 multipart 和 Range API 需按各自依赖编译。
- **对象存储：** 现代和 legacy SDK 都藏在 adapter 后；领域层只认识 key、version、checksum、状态和 owner。

## 易错点

:::pitfalls
### 错误：把原始文件名当存储路径
**现象：** `../../secret.txt` 覆盖或读取根目录外文件。  

**触发条件：** 直接拼接 `uploadDir + originalFilename`。  

**原因：** filename 是客户端元数据，不是服务端身份。  

**后果：** 穿越、覆盖和跨租户碰撞。  

**错误示例：**

```java
new File(root, multipart.getOriginalFilename())
```

**正确写法：**

```java
String key = storageKey(tenant, fileId, version);
```

**影响版本：** Java 25/8、Spring 7/5.2。  

**验证方式：** CR/LF、绝对路径、UNC、驱动器和 `..` 都不改变服务端 key。  

**来源：** `spring708-multipart-file`、`rfc7578-multipart`。

### 错误：只限制单文件大小
**现象：** 多 part、租户并发或展开后仍耗尽磁盘。  

**触发条件：** 只设置 `max-file-size`。  

**原因：** 容器、业务和处理层是三套预算。  

**后果：** 请求总量、配额和临时空间失控。  

**错误示例：**

```java
if (file.getSize() < limit) accept(file);
```

**正确写法：**

```java
copyWithLimit(file.getInputStream(), requestBudget);
```

**影响版本：** Boot 4.1/2.3。  

**验证方式：** 超过任一预算立即关闭并清理。  

**来源：** `boot410-multipart-properties`、`owasp-file-upload`。

### 错误：信任 Content-Length、getSize 或 entry size
**现象：** 声明很小，实际读取或展开巨大。  

**触发条件：** 按元数据分配数组或跳过实际计数。  

**原因：** 元数据可能未知、虚报或只代表压缩大小。  

**后果：** 内存、CPU 和磁盘耗尽。  

**错误示例：**

```java
byte[] all = new byte[(int) entry.getSize()];
```

**正确写法：**

```java
byte[] bytes = copyWithLimit(input, maxEntryBytes);
```

**影响版本：** Java 25/8。  

**验证方式：** 未知 size 和压缩展开超限均拒绝。  

**来源：** `jdk8-zip-input-stream`、`commons-compress128-archive-entry`。

### 错误：只校验扩展名或声明 MIME
**现象：** 伪 `.jpg`、伪 MIME 或容器内容被接受。  

**触发条件：** `endsWith(".jpg")` 或直接信任 `getContentType()`。  

**原因：** 两者都来自可控输入。  

**后果：** 危险内容进入后续解析器。  

**错误示例：**

```java
if (name.endsWith(".jpg")) publish();
```

**正确写法：**

```java
UploadState state = validate(UploadState.QUARANTINED, magicAccepted, scanAccepted);
```

**影响版本：** 所有版本。  

**验证方式：** 伪 MIME、错误魔数和 parser failure 都无发布对象。  

**来源：** `owasp-file-upload`、`tika320-detection`。

### 错误：用 getBytes 或 readAllBytes 处理不可信大文件
**现象：** 单次分配导致堆压力或 OOM。  

**触发条件：** 先把整个上传读成 byte[]。  

**原因：** 内存上限没有随流量执行。  

**后果：** 进程抖动和拒绝服务。  

**错误示例：**

```java
Files.write(target, multipart.getBytes());
```

**正确写法：**

```java
byte[] payload = copyWithLimit(multipart.getInputStream(), maxBytes);
```

**影响版本：** Java 25/8。  

**验证方式：** 大于预算的输入不会产生完整内存副本。  

**来源：** `jdk25-files`、`jdk8-files`。

### 错误：校验前直接写最终目录
**现象：** 扫描失败仍可被下载，或留下半文件。  

**触发条件：** 直接 `transferTo(publishedPath)`。  

**原因：** 没有隔离状态和发布门。  

**后果：** 恶意或不完整对象公开。  

**错误示例：**

```java
file.transferTo(webRoot.resolve(name).toFile());
```

**正确写法：**

```java
publishAccepted(state, staged, published);
```

**影响版本：** 所有版本。  

**验证方式：** reject/取消/扫描失败后正式目录没有对象。  

**来源：** `spring708-multipart-file`、`owasp-file-upload`。

### 错误：静默降级 ATOMIC_MOVE
**现象：** 跨盘复制后仍声称发布原子。  

**触发条件：** 捕获 `AtomicMoveNotSupportedException` 后普通 move。  

**原因：** 非原子协议没有完成标记或恢复设计。  

**后果：** 读者看到半文件。  

**错误示例：**

```java
tryMoveAtomicOrCopy(temp, target);
```

**正确写法：**

```java
Files.move(staged, target, StandardCopyOption.ATOMIC_MOVE);
```

**影响版本：** Java 25/8。  

**验证方式：** 模拟跨 FileStore 时 target 不进入 PUBLISHED。  

**来源：** `jdk25-files`。

### 错误：只做 normalize 和 startsWith
**现象：** 链接替换后写到根目录外。  

**触发条件：** 检查与打开之间存在窗口。  

**原因：** 词法 containment 没有解决 TOCTOU。  

**后果：** Zip Slip 或本地路径越界。  

**错误示例：**

```java
root.resolve(name).normalize().startsWith(root);
```

**正确写法：**

```java
Path safeRoot = prepareRoot(root);
```

**影响版本：** Java 25/8。  

**验证方式：** 链接和替换竞态不产生根外文件。  

**来源：** `jdk25-path`、`jdk25-secure-directory-stream`。

### 错误：下载接受请求路径并手工拼 header
**现象：** 越权读取或 CR/LF 注入响应头。  

**触发条件：** `request.getParameter("path")` 和字符串拼接 Content-Disposition。  

**原因：** 路径和文件名未经过 fileId 授权与类型化序列化。  

**后果：** 任意文件读取和 header 注入。  

**错误示例：**

```java
header("attachment; filename=" + original);
```

**正确写法：**

```java
if (!canDownload(fileId, owner, actor)) throw new AccessDeniedException("file");
```

**影响版本：** Spring 7/5.2。  

**验证方式：** CR/LF 名称被清洗，未知 fileId 返回拒绝。  

**来源：** `spring708-content-disposition`、`rfc6266-content-disposition`。

### 错误：用一次性 InputStreamResource 做普通 Range
**现象：** 计算长度消耗流，206 响应为空或偏移错误。  

**触发条件：** 对已打开流调用通用 contentLength。  

**原因：** InputStreamResource 不是可重复打开的文件资源。  

**后果：** 下载截断和连接泄漏。  

**错误示例：**

```java
new InputStreamResource(stream);
```

**正确写法：**

```java
Resource resource = new FileSystemResource(publishedPath);
```

**影响版本：** Spring 7.0.8。  

**验证方式：** 200/206/416 的长度和字节精确匹配。  

**来源：** `spring70-range-requests`、`spring708-input-stream-resource`。

### 错误：把 presigned URL 当授权会话
**现象：** URL 被转发后仍可重复上传或覆盖固定 key。  

**触发条件：** 固定 key、过长 expiry、未绑定 checksum。  

**原因：** presigned URL 是 bearer token，不知道业务 actor。  

**后果：** 泄露、覆盖和无法撤销。  

**错误示例：**

```java
return fixedUploadUrl;
```

**正确写法：**

```java
return issueUploadGrant(fileId, key, checksum, expiry);
```

**影响版本：** S3 类对象存储。  

**验证方式：** 重放、错误 key、过期和 checksum 不匹配均失败。  

**来源：** `s3-presigned-urls`、`s3-conditional-requests`。

### 错误：把 ZIP/TAR 路径检查当作全部防护
**现象：** 没有 `../` 仍可用链接、重复名或压缩炸弹耗尽资源。  

**触发条件：** 只检查 entry name。  

**原因：** 链接元数据和实际展开量没有 admission。  

**后果：** 覆盖、越界和资源耗尽。  

**错误示例：**

```java
Files.copy(zip, root.resolve(entry.getName()));
```

**正确写法：**

```java
extractZip(input, root, maxEntries, maxEntryBytes, maxTotalBytes, maxDepth, maxRatio, deadline);
```

**影响版本：** Java 25/8、Commons Compress 1.28.0。  

**验证方式：** Zip Slip、symlink、hardlink、未知 size 和预算超限均清理整个输出根。  

**来源：** `commons-compress128-guide`、`commons-compress128-tar-entry`、`owasp-wstg-malicious-files`。

### 错误：恢复归档 owner、设备或执行位
**现象：** 解包结果带有业务进程不应拥有的权限或特殊文件。  

**触发条件：** 直接恢复 TAR/PAX metadata。  

**原因：** 归档元数据来自不可信制作者。  

**后果：** 提权、设备访问或后续执行风险。  

**错误示例：**

```java
entry.applyModeAndOwner(target);
```

**正确写法：**

```java
admitEntry(EntryKind.REGULAR);
```

**影响版本：** Java 25/8、POSIX PAX。  

**验证方式：** symlink/hardlink/device/FIFO/sparse/owner/mode 入口全部拒绝。  

**来源：** `commons-compress128-tar-entry`、`posix-pax`。

### 错误：只在成功分支关闭流并记录敏感审计
**现象：** 失败后对象 response、临时文件或归档流仍占用；日志含路径或 token。  

**触发条件：** `return` 分支跳过 finally，或直接打印 request。  

**原因：** 流 owner 与审计字段没有合同。  

**后果：** 资源泄漏、日志注入和隐私泄露。  

**错误示例：**

```java
log.info("path={} token={}", path, token);
```

**正确写法：**

```java
log.info(audit(fileId, "REJECTED"));
```

**影响版本：** 所有版本。  

**验证方式：** success/reject/cancel/scan failure 均恰好关闭，日志无 CR/LF、secret、绝对路径和内容。  

**来源：** `jdk25-files`、`owasp-file-upload`。

:::

## 安全与性能边界

文件大小、展开大小、压缩比、Range 数量、扫描时长和 presigned 有效期没有通用安全值，必须根据业务类型、
存储容量、并发和 SLO 配置。默认 fail closed：扫描失败、原子能力不可用、未知归档类型和未知链接类型均不发布。
对象 checksum 只证明传输完整性；MIME/魔数只描述类型判断；扫描结果只覆盖扫描引擎和规则版本。任何一个结果
变化都应使旧状态失效。

## 如何验证

1. 从本 Markdown 提取 `FileStorageBoundaryExample`，在 Java 25 和 Java 8 各编译并连续运行两次。
2. 用真实 ZIP 临时 fixture 覆盖普通文件、`../`、绝对路径、重复名、symlink/hardlink、未知 size 和超总展开量。
3. 用临时目录验证 CR/LF 名称、符号链接、跨 FileStore move、取消、扫描失败和失败清理；目标根外不得出现文件。
4. 验证下载 200、单 Range 206、无效 Range 416 的状态、长度、字节和安全 Content-Disposition。
5. 验证 presigned upload 的 method/key/checksum/expiry 绑定、complete/abort 和遗留 session 清扫。
6. 只保留 `fileId`、`tenant`、策略版本、分类结果和关闭计数等脱敏审计字段，绝不输出原文件名、绝对路径、对象 key、
   presigned query、secret 或内容。

:::exercise
### 练习：设计一个附件上传合同

**要求：** 写出 actor、tenant、fileId、显示名、服务端 key、单文件/请求/租户/展开预算、类型检测、扫描、发布、
下载和删除状态。分别说明本地 `ATOMIC_MOVE` 不可用、ZIP 含 symlink、Range 为 416、扫描超时和数据库回滚后的补偿动作。

**验收：** 能证明任何未进入 `PUBLISHED` 的对象都不可下载；能证明实际流量而不是声明大小决定限额；能证明日志没有
路径、密钥或可重放 URL。
:::

## 本节小结

- 文件名是显示元数据，业务对象 ID 和服务端存储键才是授权与寻址合同。
- 上传必须先隔离，实际流量要同时受容器、业务和处理/展开预算限制。
- 扩展名、声明 MIME、魔数、parser、checksum 和扫描各自只提供部分证据。
- containment 要面对符号链接竞态；原子发布不可用时必须显式改变协议。
- 下载按 fileId 授权，Content-Disposition、Range、对象版本和 multipart session 都需独立管理。
- ZIP/TAR 默认只接受普通文件和目录，按实际展开量限额，失败清理整个输出根。
