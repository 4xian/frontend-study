# Java 高级第 9 门：文件上传、存储、下载与归档安全边界研究

> 课程 ID：`backend.java.learn.advanced.file-storage-and-archive-boundaries`
>
> 冻结顺序：580
>
> 研究日期：2026-08-13
>
> 冻结快照：`dzzz-app-20260803-179e722831ab`
> 边界：只使用冻结任务提供的 Phase 2 矩阵/清单和本稿核验的官方资料，不读取、运行或修改
> `dzzz-app`

## 冻结课程合同

- 标题：文件上传、存储、下载与归档安全边界。
- 阶段：`advanced`，深度：`lesson`，课程顺序：`580`。
- 前置课程：
  1. `backend.java.learn.basics.io-files-and-resource-ownership`。
  2. `backend.java.learn.intermediate.bean-validation-and-input-contracts`。
- 来源能力必须保持为：
  1. `JAVA-ENGINEERING-029`：文件、二进制载荷与存储边界。
  2. `JAVA-RISK-025`：文件路径、上传与归档展开边界。
- 选择理由：项目有上传下载、对象存储和压缩处理；路径、大小、类型与展开边界必须优先于
  厂商细节。
- 冻结状态必须保持 `researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`；本研究稿不修改矩阵、track、manifest、课程正文或 signoff。
- 本课不引入新的存储 SDK、扫描服务或压缩依赖。Apache Tika、Commons Compress 与 Amazon S3
  只作为类型识别、归档模型和对象存储合同的官方证据，正文示例保持库无关。

## 研究范围与版本基线

### 现代主线

- Java 25 LTS。
- Spring Boot 4.1.0、Spring Framework 7.0.8。
- Servlet multipart、`MultipartFile`、NIO.2、本地文件发布、HTTP Range 和对象存储适配边界。
- Apache Tika 3.2.0 只用于解释 MIME/魔数检测能力；Apache Commons Compress 1.28.0 只用于
  解释 ZIP/TAR 元数据、流量统计和链接类型，不要求课程增加依赖。

### 兼容线

- Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE。
- Java 8 已有 NIO.2、`ZipInputStream`、`ZipFile` 和 try-with-resources；没有 Java 9+ 的
  `InputStream.readAllBytes/readNBytes/transferTo`，必须使用固定缓冲区循环并在读取时计数。
- Boot 2.3 和 Framework 5.2 的 multipart 临时生命周期、单文件/单请求限制、原始文件名不可信及
  输入流关闭责任不能因 legacy 身份而弱化。

## 外部搜索与核验说明

- 先按仓库规则调用 Tavily；8 组查询均返回
  `This request exceeds your plan's set usage limit`。
- 随后按固定顺位使用 Exa 发现候选 URL，再逐条读取 Oracle、Spring、RFC Editor、OWASP、
  Apache、POSIX/Open Group 与 AWS 官方页面或规范原文。
- 搜索摘要不作为结论证据；未使用社区博客、问答或厂商营销文章。
- 以下来源的 `verifiedAt` 均为 `2026-08-13`。

## 已核验的官方直接来源

### 版本基线

1. **`oracle-java-support-roadmap`**
   - 标题：Oracle Java SE Support Roadmap。
   - URL：<https://www.oracle.com/java/technologies/java-se-support-roadmap.html>。
   - `sourceType: official-reference`；`appliesTo: Java 25`；`verifiedAt: 2026-08-13`。
   - `claims`：Oracle 支持路线将 Java 25 列为 LTS；现代课程 Java 基线固定为 25。
   - `driftRisk: medium`：路线页面会随新版本演进，正文必须保留 Java 25，而不是写“当前 LTS”。
2. **`boot41-system-requirements`**
   - 标题：Spring Boot 4.1.0 System Requirements。
   - URL：<https://docs.spring.io/spring-boot/4.1/system-requirements.html>。
   - `sourceType: official-reference`；`appliesTo: Spring Boot 4.1.0 / Spring Framework 7.0.8+`；
     `verifiedAt: 2026-08-13`。
   - `claims`：Boot 4.1.0 要求 Java 17+、兼容至 Java 26，并要求 Framework 7.0.8+；Java 25
     在支持范围内。
   - `driftRisk: medium`：`4.1` 文档可能随补丁更新，课程来源卡仍固定核验时的 4.1.0/7.0.8。
3. **`boot2312-system-requirements`**
   - 标题：Spring Boot 2.3.12.RELEASE System Requirements。
   - URL：<https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements>。
   - `sourceType: official-reference`；`appliesTo: Boot 2.3.12.RELEASE / Framework 5.2.15.RELEASE / Java 8`；
     `verifiedAt: 2026-08-13`。
   - `claims`：旧线要求 Java 8、最高兼容 Java 15，并要求 Framework 5.2.15.RELEASE+。
   - `driftRisk: low`：归档版本固定。

### Java NIO、临时文件与 ZIP

4. **`jdk25-files`**
   - 标题：Files (Java SE 25 & JDK 25)。
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Files.html>。
   - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-13`。
   - `claims`：`createTempFile` 原子创建不存在的新文件；`move(..., ATOMIC_MOVE)` 不能原子完成时
     抛 `AtomicMoveNotSupportedException`，跨 `FileStore` 是典型原因；`probeContentType` 的结果由
     实现和已安装探测器决定；返回的流和目录遍历流需要关闭。
   - `driftRisk: low`：版本固定；文件系统提供者差异仍需运行时验证。
5. **`jdk25-path`**
   - 标题：Path (Java SE 25 & JDK 25)。
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Path.html>。
   - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-13`。
   - `claims`：`normalize()` 只做词法消冗、不访问文件系统；符号链接存在时归一化结果可能指向
     不同文件；`toRealPath()` 对现存对象解析真实绝对路径，默认跟随符号链接。
   - `driftRisk: low`。
6. **`jdk25-secure-directory-stream`**
   - 标题：SecureDirectoryStream (Java SE 25 & JDK 25)。
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/SecureDirectoryStream.html>。
   - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-13`。
   - `claims`：相对已打开目录句柄执行操作可避免某些检查后替换竞态；`NOFOLLOW_LINKS` 可让打开
     symbolic link 失败；是否得到该实现取决于文件系统提供者。
   - `driftRisk: low`：API 固定，但平台支持能力不能静态假定。
7. **`jdk25-zip-input-stream`**
   - 标题：ZipInputStream (Java SE 25 & JDK 25)。
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/zip/ZipInputStream.html>。
   - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-13`。
   - `claims`：ZIP 条目按顺序读取；流必须关闭；它不读取 CEN 中的 external attributes，不能用它
     建立完整 Unix 链接/权限策略；条目名本身没有安全落盘保证。
   - `driftRisk: low`。
8. **`jdk25-zip-file`**
   - 标题：ZipFile (Java SE 25 & JDK 25)。
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/zip/ZipFile.html>。
   - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-13`。
   - `claims`：`ZipFile` 面向本地随机访问，`stream()` 按中央目录顺序给出条目；关闭 `ZipFile`
     也会关闭其条目流，必须由 try-with-resources 管理。
   - `driftRisk: low`。
9. **`jdk8-files`**
   - 标题：Files (Java Platform SE 8)。
   - URL：<https://docs.oracle.com/javase/8/docs/api/java/nio/file/Files.html>。
   - `sourceType: api-doc`；`appliesTo: Java 8`；`verifiedAt: 2026-08-13`。
   - `claims`：Java 8 已提供临时文件、原子移动和文件属性能力；安全语义与现代线相同，但没有后续
     JDK 的流便利方法。
   - `driftRisk: low`：归档 API 固定。
10. **`jdk8-path`**
    - 标题：Path (Java Platform SE 8)。
    - URL：<https://docs.oracle.com/javase/8/docs/api/java/nio/file/Path.html>。
    - `sourceType: api-doc`；`appliesTo: Java 8`；`verifiedAt: 2026-08-13`。
    - `claims`：Java 8 已提供路径归一化和真实路径能力；normalize 仍只是词法操作，不能替代真实文件
      系统与符号链接检查。
    - `driftRisk: low`：归档 API 固定。
11. **`jdk8-zip-input-stream`**
    - 标题：ZipInputStream (Java Platform SE 8)。
    - URL：<https://docs.oracle.com/javase/8/docs/api/java/util/zip/ZipInputStream.html>。
    - `sourceType: api-doc`；`appliesTo: Java 8`；`verifiedAt: 2026-08-13`。
    - `claims`：Java 8 顺序 ZIP API 为 `Closeable`；`available()` 不能表示实际可读字节数；解包必须
      用固定缓冲循环累计实际展开字节。
    - `driftRisk: low`。
12. **`jdk8-zip-file`**
    - 标题：ZipFile (Java Platform SE 8)。
    - URL：<https://docs.oracle.com/javase/8/docs/api/java/util/zip/ZipFile.html>。
    - `sourceType: api-doc`；`appliesTo: Java 8`；`verifiedAt: 2026-08-13`。
    - `claims`：Java 8 随机访问 ZIP API 为 `Closeable`，关闭 ZipFile 也会关闭其条目输入流。
    - `driftRisk: low`。

### Spring 上传与下载

13. **`spring708-multipart-file`**
    - 标题：MultipartFile (Spring Framework 7.0.8 API)。
    - URL：<https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/multipart/MultipartFile.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-13`。
    - `claims`：上传内容可能暂存在内存或磁盘，请求结束清理，应用负责复制到持久存储；原始文件名
      来自客户端，可能含路径和 `..`，官方建议生成唯一存储名；输入流由调用方关闭；
      `transferTo(File)` 可能移动或复制、会删除已存在目标且移动后不能重复调用。
    - `driftRisk: low`。
14. **`boot410-multipart-properties`**
    - 标题：MultipartProperties (Spring Boot 4.1.0 API)。
    - URL：<https://docs.spring.io/spring-boot/api/java/org/springframework/boot/servlet/autoconfigure/MultipartProperties.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Boot 4.1.0`；`verifiedAt: 2026-08-13`。
    - `claims`：默认单文件上限 1MB、单 multipart 请求上限 10MB、落盘阈值 0；未设置 `location`
      时使用临时目录。这些是容器入口默认值，不是业务配额或展开后限额。
    - `driftRisk: medium`：浮动 API URL 会随当前 4.1 补丁更新，来源卡必须固定 4.1.0。
15. **`spring70-range-requests`**
    - 标题：Range Requests :: Spring Framework。
    - URL：<https://docs.spring.io/spring/reference/web/webmvc/mvc-range.html>。
    - `sourceType: official-reference`；`appliesTo: Spring Framework 7.0.x, verified against 7.0.8`；
      `verifiedAt: 2026-08-13`。
    - `claims`：MVC 对返回 `Resource` 或 `ResponseEntity<Resource>` 的控制器透明处理 Range；资源不能
      是 `InputStreamResource`，`ResponseEntity` 初始状态必须为 200；底层使用 `HttpRange` 和
      `ResourceRegionHttpMessageConverter`。
    - `driftRisk: medium`：living reference 会随补丁演进。
16. **`spring708-content-disposition`**
    - 标题：ContentDisposition (Spring Framework 7.0.8 API)。
    - URL：<https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/http/ContentDisposition.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-13`。
    - `claims`：类型化 builder 可生成 `attachment`、`inline` 和 `form-data`，并按 RFC 6266 序列化
      下载响应文件名；不得手工拼接不可信 header 值。
    - `driftRisk: low`。
17. **`spring708-resource-converter`**
    - 标题：ResourceHttpMessageConverter (Spring Framework 7.0.8 API)。
    - URL：<https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/http/converter/ResourceHttpMessageConverter.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-13`。
    - `claims`：converter 支持 Resource 与 byte ranges，响应资源的长度和可重复读取能力仍由具体
      Resource 类型决定。
    - `driftRisk: low`。
18. **`spring708-file-system-resource`**
    - 标题：FileSystemResource (Spring Framework 7.0.8 API)。
    - URL：<https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/core/io/FileSystemResource.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-13`。
    - `claims`：FileSystemResource 可提供已知长度和重复打开的文件流，适合普通已知文件的下载与
      Range 响应。
    - `driftRisk: low`。
19. **`spring708-input-stream-resource`**
    - 标题：InputStreamResource (Spring Framework 7.0.8 API)。
    - URL：<https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/core/io/InputStreamResource.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-13`。
    - `claims`：InputStreamResource 是单次读取、已打开资源；通用 contentLength 调用会消耗流，
      不适合普通已知文件的可靠 Range 下载。
    - `driftRisk: low`。
20. **`boot2312-multipart-properties`**
    - 标题：MultipartProperties (Spring Boot 2.3.12.RELEASE API)。
    - URL：<https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/api/org/springframework/boot/autoconfigure/web/servlet/MultipartProperties.html>。
    - `sourceType: api-doc`；`appliesTo: Boot 2.3.12.RELEASE / Framework 5.2.15.RELEASE`；
      `verifiedAt: 2026-08-13`。
    - `claims`：旧线默认 multipart 限额同为单文件 1MB、单请求 10MB，仍只是容器入口边界。
    - `driftRisk: low`：归档版本固定。
21. **`spring5215-multipart-file`**
    - 标题：MultipartFile (Spring Framework 5.2.15.RELEASE API)。
    - URL：<https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/multipart/MultipartFile.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Framework 5.2.15.RELEASE`；
      `verifiedAt: 2026-08-13`。
    - `claims`：旧线临时存储、原始文件名不可信、流关闭和 transferTo 单次语义不变。
    - `driftRisk: low`：归档版本固定。
22. **`spring5215-http-range`**
    - 标题：HttpRange (Spring Framework 5.2.15.RELEASE API)。
    - URL：<https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/http/HttpRange.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Framework 5.2.15.RELEASE`；
      `verifiedAt: 2026-08-13`。
    - `claims`：旧线 HttpRange 支持起止和 suffix range，并拒绝过多或总量异常的范围集合。
    - `driftRisk: low`：归档版本固定。

### HTTP 与 multipart 规范

23. **`rfc7578-multipart`**
    - 标题：RFC 7578 multipart/form-data Section 4.2。
    - URL：<https://www.rfc-editor.org/rfc/rfc7578.html#section-4.2>。
    - `sourceType: specification`；`appliesTo: multipart/form-data`；`verifiedAt: 2026-08-13`。
    - `claims`：文件 part 的 `filename` 只是发送方提供的信息；接收方不得盲用，必须丢弃目录信息
      并适配本地文件系统；请求 part 中不得使用 RFC 5987 `filename*` 规则。
    - `driftRisk: low`：正式 RFC。
24. **`rfc9110-range`**
    - 标题：RFC 9110 Section 14 Range Requests。
    - URL：<https://www.rfc-editor.org/rfc/rfc9110.html#section-14>。
    - `sourceType: specification`；`appliesTo: HTTP Semantics`；`verifiedAt: 2026-08-13`。
    - `claims`：单范围成功为 206 且带 `Content-Range`；多范围使用 `multipart/byteranges`；不可满足
      范围通常为 416 并应返回 `bytes */完整长度`；服务端可忽略 Range 返回 200，也可拒绝过多、
      重叠或低效小范围请求。
    - `driftRisk: low`：正式 RFC。
25. **`rfc6266-content-disposition`**
    - 标题：RFC 6266 Content-Disposition in HTTP Section 4.3。
    - URL：<https://www.rfc-editor.org/rfc/rfc6266.html#section-4.3>。
    - `sourceType: specification`；`appliesTo: HTTP response Content-Disposition`；
      `verifiedAt: 2026-08-13`。
    - `claims`：`filename`/`filename*` 是保存建议而非可信路径；接收方应丢弃路径段并安全处理扩展名、
      控制字符和特殊文件名；UTF-8 `filename*` 可配 ASCII fallback。
    - `driftRisk: low`：正式 RFC。

### 文件类型与上传安全

26. **`owasp-file-upload`**
    - 标题：OWASP File Upload Cheat Sheet。
    - URL：<https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html>。
    - `sourceType: security-standard`；`appliesTo: OWASP living cheat sheet`；
      `verifiedAt: 2026-08-13`。
    - `claims`：扩展名使用 allowlist；不能信任客户端 `Content-Type`；文件签名校验只能作为组合防线；
      应生成存储名、限制大小、授权上传者、存到独立主机或 webroot 外、按业务 ID 下载，并在适用时
      使用 AV、sandbox 或 CDR；展开归档时限额必须考虑解压后大小。
    - `driftRisk: medium`：持续维护页面，阈值仍须由业务配置。
27. **`owasp-wstg-malicious-files`**
    - 标题：OWASP WSTG-BUSL-09 Test Upload of Malicious Files。
    - URL：<https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/10-Business_Logic_Testing/09-Test_Upload_of_Malicious_Files>。
    - `sourceType: security-standard`；`appliesTo: OWASP WSTG latest verified 2026-08-13`；
      `verifiedAt: 2026-08-13`。
    - `claims`：测试应覆盖恶意内容、双扩展/伪 MIME/伪魔数、归档路径穿越、归档符号链接、压缩炸弹
      和格式特定风险；只验证扩展名不足以证明内容安全。
    - `driftRisk: high`：`latest` 页面会更新，正文只采纳稳定威胁模型。
28. **`tika320-detection`**
    - 标题：Apache Tika 3.2.0 Content Detection。
    - URL：<https://tika.apache.org/3.2.0/detection.html>。
    - `sourceType: official-reference`；`appliesTo: Apache Tika 3.2.0`；`verifiedAt: 2026-08-13`。
    - `claims`：内容检测可综合起始字节、资源名和声明 Content-Type；扩展名可被重命名，魔数难以
      区分 ZIP/OLE 等容器内部格式，完整容器识别可能需要 parser 依赖和读取更多内容。
    - `driftRisk: low`：精确版本固定；检测结果仍不是恶意内容判定。
29. **`tika320-detector-api`**
    - 标题：Apache Tika 3.2.0 Detector API。
    - URL：<https://tika.apache.org/3.2.0/api/org/apache/tika/detect/Detector.html>。
    - `sourceType: api-doc`；`appliesTo: Apache Tika 3.2.0`；`verifiedAt: 2026-08-13`。
    - `claims`：Detector 依据输入流和 Metadata 产生 best guess；输入需要支持 mark，调用方仍负责
      关闭并处理检测失败。
    - `driftRisk: low`：精确版本固定；检测结果仍不是恶意内容判定。

### ZIP/TAR 与解压资源边界

30. **`commons-compress128-guide`**
    - 标题：Apache Commons Compress 1.28.0 User Guide。
    - URL：<https://commons.apache.org/proper/commons-compress/examples.html>。
    - `sourceType: official-reference`；`appliesTo: Commons Compress 1.28.0 current site`；
      `verifiedAt: 2026-08-13`。
    - `claims`：归档条目名是原始元数据，不保证为相对路径或目标系统有效路径；调用方必须验证落盘
      路径仍在目标根内；`canReadEntryData` 需先检查；归档流由调用方关闭；统计接口可检测异常压缩比。
    - `driftRisk: high`：current site 会随版本更新，课程固定核验时 1.28.0。
31. **`commons-compress128-archive-entry`**
    - 标题：ArchiveEntry (Apache Commons Compress 1.28.0 API)。
    - URL：<https://commons.apache.org/proper/commons-compress/apidocs/org/apache/commons/compress/archivers/ArchiveEntry.html>。
    - `sourceType: api-doc`；`appliesTo: Commons Compress 1.28.0`；`verifiedAt: 2026-08-13`。
    - `claims`：条目大小允许未知；`resolveIn(parent)` 可拒绝词法归一化后逃离根目录的名称，但不能
      自动处理链接、设备、覆盖、Unicode/大小写碰撞或检查后替换竞态。
    - `driftRisk: medium`：浮动 current API；方法自 1.26.0 起存在。
32. **`commons-compress128-tar-entry`**
    - 标题：TarArchiveEntry (Apache Commons Compress 1.28.0 API)。
    - URL：<https://commons.apache.org/proper/commons-compress/apidocs/org/apache/commons/compress/archivers/tar/TarArchiveEntry.html>。
    - `sourceType: api-doc`；`appliesTo: Commons Compress 1.28.0`；`verifiedAt: 2026-08-13`。
    - `claims`：TAR 条目可表示 symbolic link、hard link、FIFO、block/character device、sparse 文件及
      PAX/GNU 元数据；只需要文档文件的业务应 fail closed，仅接受目录和普通文件。
    - `driftRisk: medium`：浮动 current API。
33. **`commons-compress128-statistics`**
    - 标题：InputStreamStatistics (Apache Commons Compress 1.28.0 API)。
    - URL：<https://commons.apache.org/proper/commons-compress/apidocs/org/apache/commons/compress/utils/InputStreamStatistics.html>。
    - `sourceType: api-doc`；`appliesTo: Commons Compress 1.28.0`；`verifiedAt: 2026-08-13`。
    - `claims`：接口暴露已读取压缩字节数与已返回展开字节数，可用于检测异常压缩比；比率检测仍需
      配合绝对压缩/展开上限、条目数、深度和时长限制。
    - `driftRisk: medium`：浮动 current API。
34. **`commons-compress-security`**
    - 标题：Apache Commons Compress Security Reports。
    - URL：<https://commons.apache.org/proper/commons-compress/security.html>。
    - `sourceType: security-standard`；`appliesTo: Commons Compress releases through 1.28.0`；
      `verifiedAt: 2026-08-13`。
    - `claims`：历史版本存在 TAR PAX CPU DoS、损坏 DUMP 无限循环、Pack200 OOM 和特制归档大内存
      分配等问题；归档库版本和补丁状态本身属于安全边界。
    - `driftRisk: high`：安全公告会继续增加，发布正文前需重验。
35. **`posix-pax`**
    - 标题：POSIX.1-2024 pax utility and archive format。
    - URL：<https://pubs.opengroup.org/onlinepubs/9799919799/utilities/pax.html>。
    - `sourceType: specification`；`appliesTo: POSIX.1-2024 / Issue 8`；`verifiedAt: 2026-08-13`。
    - `claims`：PAX/USTAR 归档包含路径、权限、用户/组、链接与扩展属性恢复语义；处理不可信归档时
      不应默认恢复归档携带的 owner、mode、设备或链接目标。
    - `driftRisk: low`：固定标准版本。

### 对象存储边界

36. **`s3-presigned-urls`**
    - 标题：Download and upload objects with presigned URLs。
    - URL：<https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html>。
    - `sourceType: official-reference`；`appliesTo: Amazon S3 current service behavior`；
      `verifiedAt: 2026-08-13`。
    - `claims`：presigned URL 是携带创建者权限的 bearer token，可在到期前重复使用；相同 key 的上传
      会覆盖现有对象；有效期还受底层凭据生命周期约束；可限制签名年龄和网络路径，并绑定 checksum。
    - `driftRisk: high`：云服务行为和支持算法会更新。
37. **`s3-multipart-upload`**
    - 标题：Uploading and copying objects using multipart upload in Amazon S3。
    - URL：<https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html>。
    - `sourceType: official-reference`；`appliesTo: Amazon S3 current service behavior`；
      `verifiedAt: 2026-08-13`。
    - `claims`：multipart upload 是 initiate/upload-parts/complete 三阶段协议；upload ID 是会话标识；
      未 complete 或 abort 的 parts 会持续计费；完成时要提交自有 part number/ETag 清单；最终 ETag
      不一定是完整对象 MD5。
    - `driftRisk: high`。
38. **`s3-checksum-integrity`**
    - 标题：Checking object integrity in Amazon S3。
    - URL：<https://docs.aws.amazon.com/AmazonS3/latest/userguide/checking-object-integrity.html>。
    - `sourceType: official-reference`；`appliesTo: Amazon S3 checksums`；`verifiedAt: 2026-08-13`。
    - `claims`：对象与 multipart parts 可带 checksum；完整 checksum 不匹配时服务端拒绝；multipart
      ETag 不是完整对象内容哈希。checksum 证明传输完整性，不证明授权、MIME 或无恶意内容。
    - `driftRisk: high`：支持的算法和默认值会变化。
39. **`s3-conditional-requests`**
    - 标题：Add preconditions to S3 operations with conditional requests。
    - URL：<https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-requests.html>。
    - `sourceType: official-reference`；`appliesTo: Amazon S3 conditional requests`；
      `verifiedAt: 2026-08-13`。
    - `claims`：条件写可防止同 key 无意覆盖，条件读可绑定 ETag 或修改时间；对象存在性检查后再 PUT
      不是原子防覆盖方案，应使用服务端 precondition。
    - `driftRisk: high`。
40. **`s3-versioning`**
    - 标题：Using versioning in S3 buckets。
    - URL：<https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html>。
    - `sourceType: official-reference`；`appliesTo: Amazon S3 Versioning`；`verifiedAt: 2026-08-13`。
    - `claims`：versioning 保存同 key 的多个版本，可从误删和覆盖恢复；每个版本是完整对象并独立计费；
      versioning 不是业务授权、保留期或恶意文件扫描的替代品。
    - `driftRisk: medium`。
41. **`s3-security-best-practices`**
    - 标题：Security best practices for Amazon S3。
    - URL：<https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html>。
    - `sourceType: official-reference`；`appliesTo: Amazon S3 current service guidance`；
      `verifiedAt: 2026-08-13`。
    - `claims`：使用最小权限、Block Public Access、策略而非广泛 ACL、临时角色凭据、传输和静态
      加密，并使用审计/监控能力；厂商控制不替代应用对租户、业务对象和下载者的授权。
    - `driftRisk: high`：云服务默认值和建议持续演进。

## 核心模型：先验收，再发布

上传的 multipart part、暂存字节、扫描结果、持久对象和下载表示不是同一状态。正文应使用以下最小
状态机，而不是“controller 收到文件后直接 `transferTo` 最终目录”：

| 状态 | 可执行动作 | 禁止动作 |
| --- | --- | --- |
| `RECEIVING` | 流式写入隔离暂存区，同时累计实际字节与 checksum | 下载、解析、对外暴露 |
| `QUARANTINED` | 类型识别、格式解析、AV/CDR、归档清单检查 | 生成公开 URL、覆盖正式对象 |
| `ACCEPTED` | 绑定业务 ID、存储键、长度、类型、checksum、owner 与策略版本 | 信任原始文件名定位 |
| `PUBLISHED` | 授权下载、Range、审计、保留/删除策略 | 绕过对象级授权 |
| `REJECTED` | 记录类型化原因并清理暂存/未完成 upload session | 返回内部路径或扫描细节 |

扫描可以同步也可以异步，但 `QUARANTINED` 不能被下载。checksum 只说明传输的字节是否一致，MIME
检测只给出类型判断，AV/CDR 只覆盖其引擎和策略；三者不能互相替代。

## 多部分上传与有界接收

### 三层限额

1. **传输/容器层：** 限制整个请求、单 part、part 数、header 大小和请求时长；Boot 的
   `max-file-size` 与 `max-request-size` 只覆盖这里的一部分。
2. **应用/主体层：** 在读流时逐块累计实际字节，绑定租户、用户、业务对象、并发上传数和日/月配额；
   `Content-Length`、`MultipartFile.getSize()` 与对象元数据只做预检，不能替代实际计数。
3. **处理/展开层：** 限制解压后总量、条目量、文档页数、图片像素/帧数、解析时长和临时空间；
   一个 1MB 上传可以在解压或解析后消耗远超 1MB 的资源。

超限应立即停止继续读/写、关闭流、进入 `REJECTED` 并清理当前暂存对象。磁盘配额、并发 admission
与业务配额要有单一 owner；只判断 `Files.getFileStore().getUsableSpace()` 存在并发竞态，不能视为
配额预留。

### 文件名不是存储键

- `getOriginalFilename()` 和 multipart `filename` 只作为不可信显示元数据；不能用于 `resolve`、对象
  key、命令行、日志模板或响应 header 拼接。
- 服务端生成不可预测的 `storageKey`，业务接口只暴露 `fileId`。原名另存为受长度、字符集、控制字符
  和 Unicode 规范化策略约束的 `displayName`。
- 扩展名 allowlist 必须在最终一次解码和规范化后检查；拒绝空名、绝对路径、驱动器/UNC 前缀、
  NUL/控制字符、尾随点/空格、保留名、双扩展歧义和路径分隔符。
- 存储系统若大小写不敏感或会规范化 Unicode，必须在“存储系统最终等价规则”上检测冲突；重复显示名
  不能决定覆盖行为。

## 路径、临时文件与原子发布

### 本地路径合同

受控根目录由配置/依赖注入提供，外部请求只能给业务 ID。确实需要处理相对归档名时，至少执行：

1. 拒绝绝对路径、空名称和不允许的条目类型。
2. `candidate = root.resolve(entryName).normalize()`。
3. 要求 `candidate.startsWith(root)`，并以平台实际大小写/Unicode 规则处理碰撞。
4. 对已经存在的根与父目录使用 `toRealPath()` 核对真实位置；明确是否允许任何 symbolic link。
5. 写入时使用 `CREATE_NEW`，避免静默覆盖；高安全环境在提供者支持时使用
   `SecureDirectoryStream` 相对目录句柄操作来缩小 TOCTOU 窗口。

`normalize()+startsWith()` 只解决词法 `../`；它不解决符号链接、挂载点、目录被替换或检查后创建竞态。
不能用 `File.getCanonicalPath().startsWith(rootString)` 这类字符串前缀替代同一 provider 的 `Path`
边界判断。

### 暂存与发布

- 暂存目录和最终目录应属于同一受控存储域，并默认不在 webroot；创建时设置最小权限。
- 使用 `Files.createTempFile(controlledDir, ...)`，流式写入、计数、checksum、类型识别和扫描完成前不
  给出最终名称。
- 通过全部 Gate 后以 `Files.move(temp, final, ATOMIC_MOVE)` 发布。若文件系统不支持原子移动，不能
  静默降级并声称同样原子；应拒绝启动、改用对象存储条件写，或将“非原子复制+完成标记”设计为
  明确的独立协议。
- `ATOMIC_MOVE` 只保证一次移动的可见性合同，不自动保证数据库与文件系统原子提交，也不等同于
  断电耐久性。元数据写失败、对象发布失败和清理失败分别需要补偿状态与审计事件。

## MIME、魔数与内容安全

类型判定按组合证据执行，不存在一个“可信 MIME”字段：

| 证据 | 能支持 | 不能支持 |
| --- | --- | --- |
| 允许的扩展名 | 业务允许类型的快速筛选 | 内容真实、安全 |
| part `Content-Type` | 客户端声明、用户体验提示 | 服务端可信判定 |
| `Files.probeContentType` | 当前 OS/provider 的最佳探测 | 跨环境稳定结果 |
| 魔数/signature | 某些格式的起始结构匹配 | 容器内部类型、polyglot、无恶意内容 |
| Tika detector | 综合魔数、名称和声明后的 best guess | 完整格式验证、AV/CDR |
| 专用 parser | 结构、页数、像素、宏等格式属性 | 所有未知漏洞或业务授权 |

接受策略要求扩展名、探测类型和专用 parser 结果落在同一业务 allowlist；不一致、未知
`application/octet-stream` 或 parser 失败默认拒绝。归档、Office、PDF 和媒体属于容器/主动内容，
需要更深解析与资源限额。AV 命中进入隔离，不把引擎名称、签名细节或内部路径返回给未授权调用方。

## 下载响应与 Range

### 下载授权和响应元数据

下载请求固定为 `fileId -> 元数据 -> owner/tenant/purpose 授权 -> 受控 storageKey -> 表示`。每次完整
或 Range 请求都重新授权；知道对象 key、路径或 presigned URL 不等同于业务授权。

- 已知本地文件使用可重复打开、可给出长度的 `FileSystemResource`；普通下载不要把已经打开的
  `InputStreamResource` 伪装成可重复读资源。
- `Content-Disposition` 使用 Spring builder 生成 `attachment`，为 Unicode 名称提供 RFC 6266
  `filename*` 和安全 ASCII fallback；不手工拼接 CR/LF 或原始文件名。
- `Content-Type` 来自已验收元数据，而不是下载请求参数；对主动内容采用业务认可的下载策略，不能
  通过改扩展名把未知内容变成安全内容。
- 记录 fileId、tenant、actor、策略、status、range、输出字节数和结果，不记录 presigned URL query、
  本地绝对路径、原始文件内容或扫描秘密。

### Range 精确语义

| 请求/结果 | 最小响应合同 |
| --- | --- |
| 无 Range 或服务端选择忽略 | `200` + 完整表示长度 |
| 单个可满足 byte range | `206` + `Content-Range` + 该区间长度 |
| 多个可满足 ranges | `206` + `multipart/byteranges`，每个 part 自带 `Content-Range` |
| 无可满足 range | `416` + `Content-Range: bytes */完整长度` |

服务端可以限制 range 个数、合并重叠/相邻范围或拒绝低效的小范围集合，防止放大磁盘 seek、响应
header 和 multipart 开销。`Accept-Ranges: bytes` 只是能力提示；不能承诺所有后续请求一定为 206。
下载过程中只传所选区间，不能为返回 1KB 先把完整 10GB 对象读进内存。

## 对象存储边界

对象存储不是安全文件系统，也不提供应用事务。适配器至少拥有以下类型化合同：

| 合同 | 必需字段 |
| --- | --- |
| `ObjectIdentity` | tenant、fileId、opaque key、version/etag |
| `UploadSession` | owner、purpose、uploadId、expiry、max bytes、expected checksum、state |
| `StoredObject` | key/version、actual length、checksum、accepted media type、scan state |
| `DownloadGrant` | actor、fileId/version、method、expiry、range policy、audit id |

- 对象 key 由服务端生成，不继承客户端路径语义；“目录”前缀只是 key 命名约定。
- presigned URL 是 bearer token：期限要短、方法/key/checksum/必要 header 要固定，权限不得超过生成者；
  URL 不写日志、不放 analytics/referrer，不把“过期”误当作已主动撤销。
- 相同 key 上传可能覆盖对象。使用条件写或新版本/新 key，不能先 HEAD 再无条件 PUT；versioning 可恢复
  误覆盖，但会增加完整对象存储成本。
- multipart session 必须有业务 owner、最终 checksum、part 清单和终止路径；成功 complete 或明确
  abort，另有生命周期任务清理遗留 session。最终 ETag 不应被统一解释为完整对象 MD5。
- 云端 checksum 是完整性证据，不是 MIME、恶意内容或业务授权证明；直传对象先进入 quarantine 前缀，
  服务端确认大小/checksum/扫描后才写入 `PUBLISHED` 元数据。
- SDK response body、输入流和 multipart executor/client 仍由明确 owner 关闭；厂商自动重试不能突破
  上传会话 deadline 或重复不可幂等 complete。

## ZIP/TAR 安全展开

### 逐条目 admission

安全解包不是 `new File(target, entry.getName())` 加一次前缀检查。每个条目都必须在写字节前完成：

1. 读取原始条目名，拒绝绝对路径、驱动器/UNC、NUL、空段、过长名称和目录深度超限。
2. 解析到受控根并做路径边界检查；统一名称等价规则，拒绝重复、大小写碰撞和 Unicode 规范化碰撞。
3. 仅允许目录与普通文件。默认拒绝 ZIP/TAR symbolic link、hard link、FIFO、block/character device、
   socket、sparse 与未知扩展条目。
4. 检查 `canReadEntryData`/格式能力；未知 size 不能跳过限制，声明 size 不能替代实际复制计数。
5. 用 `CREATE_NEW` 创建父目录和文件，禁止覆盖现有条目或先前已验收条目。
6. 复制时持续更新单条目和总展开字节、压缩字节、比率、条目数、嵌套深度与 deadline；任一上限
   触发时停止整个任务并清理隔离目录。

### 压缩炸弹与嵌套归档

配额必须同时覆盖：原归档字节、条目数、单条目展开字节、总展开字节、最大目录深度、最大名称长度、
压缩比、CPU/墙钟时长、临时磁盘和嵌套层数。任何单一比率都不够：少量不可压缩超大内容可能低比率
但耗尽磁盘，小输入则可能以极高比率耗尽资源。

禁止用 `ZipEntry.getSize()` 预求和作为唯一 Gate，因为 size 可以未知或不可信，真实值可能来自后置
descriptor。必须在实际读取循环中计数。若业务不要求上传归档，最简单且更稳健的策略是完全拒绝；
若只需要存档而不需要展开，则原样隔离存储并扫描，不在应用节点自动解包。

### 链接与恢复元数据

- ZIP 标准流 API 不提供完整 Unix 外部属性，不能因“没看到 symlink 标志”就断言条目是普通文件。
- TAR/PAX 明确可携带 symlink、hard link、device、FIFO、sparse、owner 和 mode。课程默认全部拒绝，
  不创建链接、不创建设备、不恢复 owner/setuid/可执行位，只给应用需要的最小权限。
- 若未来业务必须支持链接，应单独建立“链接目标只在解包根内、目标最终存在且无链式逃逸”的协议，
  不能在本课普通文件路径中隐式开启。

## 资源、权限、扫描与审计

### 资源所有权

所有资源均须有单一 owner，并覆盖 success、reject、timeout、cancel 与 scan failure：

- `MultipartFile.getInputStream()`、`Files.newInputStream/newOutputStream`、`ZipInputStream`、`ZipFile`、
  `ArchiveInputStream`、`Files.walk/list` 返回的 `Stream<Path>` 和对象存储 response body 使用
  try-with-resources。
- 临时文件、隔离目录和未完成 multipart upload 不是 Java 流关闭就会自动清理；它们需要状态记录、
  finally 补偿和超时清扫任务。
- 不用 `readAllBytes()`、`getBytes()` 或按未经验证的 entry size 分配数组处理不可信大文件；固定缓冲
  流式复制并计数。

### 权限与审计

- 上传、查看元数据、下载、替换、删除、重扫和发布是不同权限；每个动作都按 tenant + fileId 授权。
- 本地暂存/正式目录位于 webroot 外，运行身份最小读写权限且默认无执行权限；扫描进程和应用进程可按
  职责拆分。对象存储使用角色和前缀/操作最小权限，默认阻止公共访问。
- 审计至少记录 actor、tenant、fileId、action、policyVersion、declared/actual size、accepted type、
  checksum id、scan outcome、storage version、range 与最终结果；原始内容、凭据、presigned URL 和绝对
  路径不进日志。
- 扫描结果绑定“对象 checksum + 扫描引擎/规则版本”。对象字节或策略改变后旧结果失效；扫描失败是
  `QUARANTINED`/`REJECTED`，不是默认放行。向第三方扫描服务发送文件前还需数据分类和合规授权。

## Java 25 与 Java 8 兼容边界

| 主题 | Java 25 / 现代主线 | Java 8 / 冻结项目线 | 教学决策 |
| --- | --- | --- | --- |
| Spring | Boot 4.1.0 / Framework 7.0.8 | Boot 2.3.12 / Framework 5.2.15 | 包名/配置类不同，安全合同相同 |
| multipart | `MultipartFile` 请求级临时内容 | 同合同 | 原名不可信，流由调用方关闭 |
| NIO | `Path.of`、现代 stream 便利方法 | `Paths.get`、固定缓冲循环 | 核心 Path/Files 合同可共用 |
| 原子发布 | `Files.move(ATOMIC_MOVE)` | 同 API | 不支持就显式失败/改协议 |
| ZIP | `ZipInputStream`/`ZipFile` | 同核心 API，无 `readAllBytes` | 实际复制计数，不信声明 size |
| Range | Spring MVC Resource 支持 RFC 9110 | `HttpRange`/resource converter 已可用 | 不手写错误 offset 算法 |
| 对象存储 | 适配器合同，不绑定 SDK | legacy SDK 隔离在 adapter | key/version/checksum 语义不泄漏到领域 |

## 冻结项目证据映射

以下 10 条映射只来自 `course-coverage-matrix.json` 的冻结课程节点；未读取项目源码，不从类名推断
路径拼接、上传校验、归档格式、对象存储厂商或实现正确性。5 条 `observed` 只说明调用面，5 条
`rejected` 只说明需要纠正的风险边界。

| sourceId | 冻结路径与稳定符号 | usage | 仅能支持的结论 |
| --- | --- | --- | --- |
| `JAVA-ENGINEERING-029` | `dzzz-app/src/main/java/com/tdh/bdzz/download/LocalDownloader.java`；`com.tdh.bdzz.download.LocalDownloader` | `observed` | 项目存在本地下载候选，不证明路径或授权安全 |
| `JAVA-ENGINEERING-029` | `dzzz-app/src/main/java/com/tdh/bdzz/download/DownloadResponse.java`；`com.tdh.bdzz.download.DownloadResponse` | `observed` | 项目存在下载响应候选，不证明 Range/header 正确 |
| `JAVA-ENGINEERING-029` | `dzzz-app/src/main/java/com/tdh/bdzz/upload/UploadUtil.java`；`com.tdh.bdzz.upload.UploadUtil` | `observed` | 项目存在上传工具候选，不证明限额/扫描完整 |
| `JAVA-ENGINEERING-029` | `dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/fileProcess/AbstractFileProcessHandler.java`；`com.tdh.bdzz.timer.handler.fileProcess.AbstractFileProcessHandler` | `observed` | 项目存在异步文件处理候选，不证明隔离发布状态 |
| `JAVA-ENGINEERING-029` | `dzzz-app/src/main/java/com/tdh/util/FileTypeUtils.java`；`com.tdh.util.FileTypeUtils` | `observed` | 项目存在类型判断候选，不证明内容安全 |
| `JAVA-RISK-025` | `dzzz-app/src/main/java/com/tdh/bdzz/config/SysConfig.java`；`com.tdh.bdzz.config.SysConfig` | `rejected` | 配置候选只提示根目录/权限风险，不复制实现 |
| `JAVA-RISK-025` | `dzzz-app/src/main/java/com/tdh/bdzz/download/DownloadUtil.java`；`com.tdh.bdzz.download.DownloadUtil` | `rejected` | 下载候选只提示路径/header/资源风险，不复制实现 |
| `JAVA-RISK-025` | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingWSServer.java`；`com.tdh.bdzz.config.websocket.server.LoggingWSServer` | `rejected` | 只保留二进制载荷和日志风险，不混入 WebSocket 实现 |
| `JAVA-RISK-025` | `dzzz-app/src/main/java/com/tdh/bdzz/util/CommonUtil.java`；`com.tdh.bdzz.util.CommonUtil` | `rejected` | 通用工具候选不作为文件安全边界 owner |
| `JAVA-RISK-025` | `dzzz-app/src/main/java/com/tdh/bdzz/controller/BlmbController.java`；`com.tdh.bdzz.controller.BlmbController` | `rejected` | controller 候选只提示入口风险，不证明业务授权或校验 |

## 不能推出的结论

- 不能由存在上传/下载工具推出大小、配额、MIME、扫描、路径和授权边界已实现。
- 不能由 `normalize()+startsWith()` 推出符号链接、挂载点和 TOCTOU 安全。
- 不能由原始文件名、扩展名、客户端 Content-Type、魔数或某一个 detector 单独推出文件安全。
- 不能由 `MultipartFile.getSize()`、`Content-Length` 或归档条目声明 size 推出实际处理不会超限。
- 不能由 `ATOMIC_MOVE` 推出数据库记录与文件对象原子提交，也不能推出断电耐久性。
- 不能由 checksum/ETag 推出无恶意内容、类型正确或调用者有权访问。
- 不能由对象 key 难猜、bucket 私有或 presigned URL 未过期推出业务对象授权有效。
- 不能把 multipart ETag 统一解释为完整对象 MD5，也不能让未完成 parts 无限保留。
- 不能由 ZIP 路径无 `../` 推出链接、重复名、Unicode/大小写碰撞或压缩炸弹安全。
- 不能把 Java 25 convenience API、Spring 7 包名或现代云 SDK 复制到 Java 8 legacy 线。

## 易错点取证与反馈环计划

正文至少覆盖以下 14 个可观察错误，每项按“现象 -> 触发条件 -> 原因 -> 后果 -> 错误示例 ->
正确写法 -> 影响版本 -> 验证方式 -> 来源”组织：

1. 使用 `getOriginalFilename()` 作为本地路径/对象 key，造成穿越、覆盖或碰撞。
2. 只配置单文件上限，不限制请求总量、part 数、租户配额、并发与处理后大小。
3. 信任 `Content-Length`、`getSize()` 或 entry size，不在真实流复制中计数。
4. 只校验扩展名或客户端 MIME，接受伪类型、polyglot 或危险容器。
5. 用 `getBytes()`/`readAllBytes()` 或按不可信 size 分配数组，导致内存耗尽。
6. 直接写最终目录，校验/扫描失败后仍留下半文件或可下载对象。
7. 静默从 `ATOMIC_MOVE` 降级为跨盘复制，却继续宣称原子发布。
8. 只做 `normalize()+startsWith()`，忽略 symbolic link 与检查后替换竞态。
9. 下载按请求路径读取或手工拼 `Content-Disposition`，造成越权、穿越或 header 注入。
10. 用单次打开的 `InputStreamResource` 提供普通文件 Range，长度或重复读取行为错误。
11. 对大量重叠小 Range 无限制响应，放大 I/O 与 multipart 开销。
12. 把 presigned URL 当可撤销会话、复用固定 key 或遗留 multipart parts，造成泄露/覆盖/成本增长。
13. ZIP/TAR 解包只做路径检查，不限制实际展开量、条目数、比率、深度、时长或重复名。
14. 恢复 TAR/ZIP 的链接、设备、owner 或可执行位，或未关闭归档/对象响应流。

最小反馈环至少验证：

1. `UploadPolicy` 同时限制单文件、请求总量、part 数、实际字节、tenant quota、并发和处理 deadline。
2. 原名覆盖 `../`、绝对路径、UNC/驱动器、控制字符、双扩展、大小写和 Unicode 碰撞；存储键均由
   服务端生成且不覆盖。
3. 伪 Content-Type、伪扩展、错误魔数、容器类型和 parser failure 都得到类型化拒绝。
4. 暂存对象只有在大小/checksum/type/scan 全通过后发布；失败和取消清理，非原子文件系统明确失败。
5. 下载按 fileId 逐次授权；200、单 Range 206、多 Range 206、416 的状态/header/字节精确匹配。
6. presigned grant 固定 owner、method、key、expiry、checksum；complete/abort 后状态终结，遗留 session
   可被清扫。
7. 恶意 ZIP/TAR 覆盖 `../`、绝对路径、重复名、symlink、hard link、device、sparse、未知 size、
   高比率、超条目和嵌套归档；目标根外无任何文件。
8. success、reject、overflow、scan failure、cancel 路径的每个输入/输出/归档/对象响应流恰好关闭，
   审计日志不含 secret、presigned query、绝对路径或文件内容。
9. Java 25 和 Java 8 fixture 各连续运行两次；所有临时归档、目录和 runner 位于 `/tmp` 的
   `mktemp` 根，完成后清理并验证不存在。

## 课程设计与验证合同

1. 正文顺序固定为：上传状态机 -> multipart 限额/配额 -> 原始文件名与路径 -> 类型/魔数/parser ->
   隔离暂存/原子发布 -> 下载授权/header/Range -> 对象存储 session -> ZIP/TAR admission ->
   权限/扫描/审计 -> Java 8 差异。
2. 完整 Java 示例使用库无关的 `FileStorageBoundaryExample`：脚本化输入流和内存元数据验证计数、
   状态转换、服务端存储键、原子发布决策、下载范围和审计脱敏；每个方法上方写规范中文注释。
3. ZIP 示例使用 JDK `ZipInputStream` 展示“每个 entry 在受控根内且按实际字节计数”；TAR/链接只以
   类型化 adapter/fake entry 验证拒绝合同，不引入 Commons Compress 依赖。
4. Java 25 与 Java 8 示例共享安全模型，分别使用其可编译 API；不访问真实对象存储、扫描服务或
   `dzzz-app`。
5. 不给出通用“安全”文件大小、压缩比、Range 数或 presigned 有效期；示例值只作测试输入，生产值
   必须由存储容量、业务类型、并发、SLO 和攻击预算决定。
6. 正文 frontmatter 来源卡必须与本研究来源 ID/URL/order 对齐；冻结项目证据只能选上述
   observed/rejected 项，不能升级为 adapted/corrected。
7. 正文发布前依次通过内容合同、Java 25/8 runner、路径/归档负向 runner、Catalog 三次冷启动、
   Phase 2 validator、根质量 Gate、build、桌面/390px 浏览器验收和独立双轴复审。

## 未解决问题

以下不是研究证据缺口，而是正文/生产落地必须由业务或部署环境决定的配置：

1. 每类业务允许的扩展名、媒体类型、最大原始/展开大小、条目数、像素/页数与处理 deadline。
2. 是否允许任何归档格式；若允许，是否只接受 ZIP，还是需要 TAR/PAX，以及是否完全禁止嵌套归档。
3. 本地文件系统是否支持 `ATOMIC_MOVE` 和 `SecureDirectoryStream`；不支持时选择拒绝启动还是采用
   “copy + 完成标记”的显式非原子协议。
4. AV/CDR 引擎、同步/异步模式、fail-open/fail-closed（本课默认 fail closed）、重扫与第三方数据
   出境/隐私策略。
5. 对象存储具体厂商的条件写、version、checksum、multipart abort、presigned policy 和审计字段映射。
6. 文件的保留、法律留置、删除、恢复、版本成本和 quarantine 清扫期限。

## 研究 Gate 自检

- [x] 课程 ID、顺序 580、2 个前置、2 个 source capability、选择理由和 planned/not-started 状态已核对。
- [x] 已记录 Java 25/8、Boot 4.1/2.3、Framework 7.0.8/5.2.15 的精确版本边界。
- [x] 已覆盖 multipart、文件名/路径、大小/配额、MIME/魔数、暂存/原子移动、下载/Range、对象存储、
  ZIP/TAR 穿越/炸弹/链接、资源关闭、权限、审计和扫描。
- [x] 所有来源均记录直接 URL、`sourceType`、`appliesTo`、`verifiedAt`、claims 与漂移风险。
- [x] 项目证据只来自冻结课程节点：5 条 observed、5 条 rejected；未读取、运行或修改 `dzzz-app`。
- [x] 未创建正文、loader、track、manifest、signoff、依赖、测试或浏览器资产。
- [x] 行数与 SHA-256 由外部命令核验，不在被校验文件内记录自引用哈希。

## 发布结论与 Stop Boundary

本文件只完成 Java 高级第 9 门课程的官方资料研究。研究稿通过 URL、冻结映射、格式、行数和 SHA
核验后，主流程才可进入本课正文 Gate；本研究任务不授权发布接线或第 10 门课程。
