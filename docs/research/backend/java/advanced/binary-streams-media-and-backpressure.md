# Java 高级第 10 门：随机访问、压缩、图像与流式背压研究

> 课程 ID：`backend.java.learn.advanced.binary-streams-media-and-backpressure`
>
> 冻结顺序：590
>
> 研究日期：2026-08-13
>
> 冻结快照：`dzzz-app-20260803-179e722831ab`
> 边界：只使用 Phase 2 冻结矩阵/清单和本稿核验的官方资料；不读取、运行或修改 `dzzz-app`。

## 冻结课程合同

- 标题：随机访问、压缩、图像与流式背压。
- 阶段：`advanced`，深度：`lesson`，课程顺序：`590`。
- 前置课程：
  1. `backend.java.learn.basics.io-files-and-resource-ownership`。
  2. `backend.java.learn.advanced.concurrency-locks-and-shared-state`。
- 来源能力必须保持为：
  1. `JAVA-STDLIB-016`：RandomAccessFile、Channel 与字节偏移。
  2. `JAVA-STDLIB-017`：ZIP 压缩流。
  3. `JAVA-STDLIB-029`：ImageIO、BufferedImage 与 Java2D。
  4. `JAVA-ENGINEERING-024`：流式数据、同步与转换管线。
  5. `JAVA-RISK-026`：无界整载荷缓冲与慢消费者背压。
- 选择理由：文档和媒体链路需要字节偏移、压缩、图像与流式处理；无界缓冲只作为背压反例。
- 冻结状态必须保持 `researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`。本稿不修改矩阵、track、manifest、课程正文、signoff 或测试。

## 研究范围与版本基线

### 现代主线

- Java 25 LTS、Spring Boot 4.1.0、Spring Framework 7.0.8。
- 用 `FileChannel`、`SeekableByteChannel`、`ByteBuffer` 和 `RandomAccessFile` 说明二进制偏移、
  局部读写与关闭责任；不是把大文件映射或整载荷读入内存。
- 用 `ZipInputStream`/`ZipOutputStream` 说明顺序压缩流，用 `ZipFile` 说明本地归档中央目录的
  随机访问。压缩、归档路径安全与媒体解码预算是独立合同。
- Servlet MVC 的 `StreamingResponseBody` 是异步执行阻塞 `OutputStream`，不是 Reactive Streams
  背压。需反压的端到端字节链路使用 WebFlux、`Flux<DataBuffer>` 与明确的 release owner。

### 兼容线

- Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE。
- Java 8 已有 `RandomAccessFile`、NIO channel、`ByteBuffer`、`ZipInputStream`、`ZipFile` 和
  `ImageIO`；没有 Java 9+ 的 `Flow`，不能将 `Flow` API 回填 legacy 正文。
- Spring 5.2 可使用 MVC `StreamingResponseBody` 与 WebFlux `DataBufferUtils`，但示例与
  配置必须锁定旧包/API；不能照抄 Spring 7 或 Servlet 6.1 的接口。

## 外部搜索与核验说明

- 先按仓库顺位调用 Tavily。随机访问/NIO、压缩/ZIPS、图像三组查询均返回
  `This request exceeds your plan's set usage limit`，所以该层不可用。
- 随后按固定顺位使用 Exa 发现候选 URL；搜索摘要不是证据。下列结论均回到 Oracle、Jakarta、
  Spring、Reactive Streams、Reactor、RFC Editor、OWASP 或 Android 官方页面/固定规范核验。
- 未进入 Parallel 或 Perplexity：Exa 已找到可逐条核验的官方来源。以下来源卡的
  `verifiedAt` 均为 `2026-08-13`。38 个唯一官方 URL 中 36 个经直连 HTTP 200 核验；Android ZIP
  安全页与 OWASP 固定 tag 页在本次直连中超时，但 Exa 已提取对应官方页面原文。正文发布前须复验
  这两个 URL，不能把本次超时写成页面不存在。

## 已核验的官方直接来源

### 版本与二进制位置

1. **`jdk25-random-access-file`**
   - 标题：RandomAccessFile (Java SE 25 & JDK 25)。
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/RandomAccessFile.html>。
   - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-13`。
   - `claims`：文件指针决定下一次读写偏移；`getChannel()` 返回唯一关联的 `FileChannel`，两者共享
     位置和长度；`rws`/`rwd` 是每次 I/O 的同步写入语义，不是数据库事务。
   - `driftRisk: low`：固定 Java 25 API。
2. **`jdk25-file-channel`**
   - 标题：FileChannel (Java SE 25 & JDK 25)。
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/channels/FileChannel.html>。
   - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-13`。
   - `claims`：位置读写可从给定绝对偏移读写而不改变 channel 的当前位置；普通读写和
     `transferTo`/`transferFrom` 均可能部分完成；`force` 只保证该 API 对底层存储的持久化请求，
     实际效果仍受操作系统/存储提供者限制。
   - `driftRisk: low`。
3. **`jdk25-seekable-byte-channel`**
   - 标题：SeekableByteChannel (Java SE 25 & JDK 25)。
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/channels/SeekableByteChannel.html>。
   - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-13`。
   - `claims`：channel 维护可查询/修改的位置与大小；位置超过 EOF 后读立即到 EOF，后续写才扩展
     实体；扩展空洞的字节值未定义。
   - `driftRisk: low`。
4. **`jdk25-byte-buffer`**
   - 标题：ByteBuffer (Java SE 25 & JDK 25)。
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/ByteBuffer.html>。
   - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-13`。
   - `claims`：buffer 默认大端，读写受 `position`、`limit`、`capacity` 约束；写入后应以
     `flip()` 切到读取状态，处理部分写后以 `compact()` 保留未消费字节；direct buffer 的原生 I/O
     优化是 JVM 尽力行为，创建和释放成本更高。
   - `driftRisk: low`。
5. **`jdk8-random-access-file-and-file-channel`**
   - 标题：RandomAccessFile / FileChannel (Java Platform SE 8)。
   - URL：<https://docs.oracle.com/javase/8/docs/api/java/io/RandomAccessFile.html>；
     <https://docs.oracle.com/javase/8/docs/api/java/nio/channels/FileChannel.html>。
   - `sourceType: api-doc`；`appliesTo: Java 8`；`verifiedAt: 2026-08-13`。
   - `claims`：Java 8 已有共享位置、位置读写、部分完成和 `force` 语义；现代正文不能误称这些是
     Java 25 新能力。
   - `driftRisk: low`：归档 API。

### 压缩与归档边界

6. **`jdk25-zip-input-stream-and-zip-file`**
   - 标题：ZipInputStream / ZipFile (Java SE 25 & JDK 25)。
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/zip/ZipInputStream.html>；
     <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/zip/ZipFile.html>。
   - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-13`。
   - `claims`：`ZipInputStream` 按本地文件头（LOC）顺序读条目，不读取中央目录（CEN）的全部元数据；
     `ZipFile` 面向本地归档随机访问，关闭它也关闭从中获取的 entry streams；
     `ZipInputStream.available()` 不表示剩余字节长度。
   - `driftRisk: low`。
7. **`jdk25-zip-entry-and-deflater-output-stream`**
   - 标题：ZipEntry / DeflaterOutputStream (Java SE 25 & JDK 25)。
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/zip/ZipEntry.html>；
     <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/zip/DeflaterOutputStream.html>。
   - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-13`。
   - `claims`：entry 的 size、compressed size、CRC 可以未知（`-1`），因此只能在实际读取时累计
     展开预算；`finish()` 完成压缩但不关闭底层流，`close()` 完成压缩且关闭底层流。
   - `driftRisk: low`。
8. **`jdk8-zip-input-stream`**
   - 标题：ZipInputStream (Java Platform SE 8)。
   - URL：<https://docs.oracle.com/javase/8/docs/api/java/util/zip/ZipInputStream.html>。
   - `sourceType: api-doc`；`appliesTo: Java 8`；`verifiedAt: 2026-08-13`。
   - `claims`：Java 8 的顺序 entry 读取与 `available()` 边界同样存在；旧线必须用固定缓冲区循环、
     实测计数和 try-with-resources。
   - `driftRisk: low`。
9. **`android-zip-path-traversal`**
   - 标题：Zip Path Traversal。
   - URL：<https://developer.android.com/privacy-and-security/risks/zip-path-traversal>。
   - `sourceType: security-standard`；`appliesTo: java.util.zip 安全指导`；`verifiedAt: 2026-08-13`。
   - `claims`：`java.util.zip` 不自动阻止 `../`；落盘前必须验证规范化目标仍在目标目录内；若目标目录
     可被攻击者影响，还需处理符号链接和检查后替换竞态。
   - `driftRisk: medium`：living guidance。

### 图像、像素与解码生命周期

10. **`jdk25-image-io-and-image-reader`**
    - 标题：ImageIO / ImageReader (Java SE 25 & JDK 25)。
    - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.desktop/javax/imageio/ImageIO.html>；
      <https://docs.oracle.com/en/java/javase/25/docs/api/java.desktop/javax/imageio/ImageReader.html>。
    - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-13`。
    - `claims`：无匹配 reader 时 `ImageIO.read` 返回 `null`；默认可使用磁盘缓存；应先在 reader 上获取
      宽高元数据，做溢出安全的边长、像素数和内存预算，再完整解码。
    - `driftRisk: low`。
11. **`jdk25-image-read-param-and-buffered-image`**
    - 标题：ImageReadParam / BufferedImage (Java SE 25 & JDK 25)。
    - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.desktop/javax/imageio/ImageReadParam.html>；
      <https://docs.oracle.com/en/java/javase/25/docs/api/java.desktop/java/awt/image/BufferedImage.html>。
    - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-13`。
    - `claims`：source region 与 subsampling 可减少目标输出；`TYPE_INT_ARGB` 的四字节/像素只能作为
      该目标类型的下界估算，raster、插件与中间缓冲仍可能额外占用；`abort()` 只是中止请求，之后仍要
      `dispose()` reader。
    - `driftRisk: low`。
12. **`jdk25-image-input-stream-and-jdk8-image-io`**
    - 标题：ImageInputStream / ImageIO (Java SE 25 / Java 8)。
    - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.desktop/javax/imageio/stream/ImageInputStream.html>；
      <https://docs.oracle.com/javase/8/docs/api/javax/imageio/ImageIO.html>。
    - `sourceType: api-doc`；`appliesTo: Java 25 and Java 8`；`verifiedAt: 2026-08-13`。
    - `claims`：reader/input stream 都需要明确 close/dispose owner；Java 8 具备 ImageIO，但不应把
      Java 25 的运行时或模块假设写入旧线。
    - `driftRisk: low`。
13. **`owasp-asvs-500-file-handling`**
    - 标题：OWASP Application Security Verification Standard 5.0.0, File Handling。
    - URL：<https://github.com/OWASP/ASVS/blob/v5.0.0/5.0/en/0x14-V5-File-Handling.md>。
    - `sourceType: security-standard`；`appliesTo: OWASP ASVS v5.0.0`；`verifiedAt: 2026-08-13`。
    - `claims`：固定标准要求在解压前限制压缩文件的最大展开大小和 entry 数，并拒绝超过允许像素数的
      上传图像；压缩字节大小不足以证明解压或解码内存安全。
    - `driftRisk: low`：固定 tag；本次 raw URL 网络超时，不把未复核的其他条款写入正文。

### Servlet 与 Spring MVC 流式输出

14. **`servlet61-async-context`**
    - 标题：AsyncContext (Jakarta Servlet 6.1 API)。
    - URL：<https://jakarta.ee/specifications/servlet/6.1/apidocs/jakarta.servlet/jakarta/servlet/asynccontext>。
    - `sourceType: api-doc`；`appliesTo: Jakarta Servlet 6.1`；`verifiedAt: 2026-08-13`。
    - `claims`：默认异步 timeout 是 30000ms，`<=0` 是无 timeout；超时先通知 `AsyncListener`，随后
      由规范进入 error dispatch 或 complete；timeout 不等于可靠的客户端断开通知。
    - `driftRisk: low`。
15. **`servlet61-output-stream-and-write-listener`**
    - 标题：ServletOutputStream / WriteListener (Jakarta Servlet 6.1 API)。
    - URL：<https://jakarta.ee/specifications/servlet/6.1/apidocs/jakarta.servlet/jakarta/servlet/servletoutputstream>；
      <https://jakarta.ee/specifications/servlet/6.1/apidocs/jakarta.servlet/jakarta/servlet/writelistener>。
    - `sourceType: api-doc`；`appliesTo: Jakarta Servlet 6.1`；`verifiedAt: 2026-08-13`。
    - `claims`：非阻塞写前必须满足 `isReady()` 或 `WriteListener.onWritePossible()`；再次可写前不能改变
      `ByteBuffer` 的 position、limit 或内容；该 `write(ByteBuffer)` 是 Servlet 6.1 API，不能复制到
      Servlet 4/legacy 线。
    - `driftRisk: low`。
16. **`spring708-streaming-response-body`**
    - 标题：StreamingResponseBody (Spring Framework 7.0.8 API)。
    - URL：<https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/servlet/mvc/method/annotation/StreamingResponseBody.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Framework 7.0.8 MVC`；`verifiedAt: 2026-08-13`。
    - `claims`：MVC 异步请求可直接写 response `OutputStream` 而不占用 container thread；官方明确建议
      显式配置生产可用的 `TaskExecutor`；它不是 WebFlux，也不自动形成端到端背压。
    - `driftRisk: low`。
17. **`spring70-mvc-async-and-range`**
    - 标题：MVC Async Requests / Range Requests (Spring Framework 7.0)。
    - URL：<https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-ann-async.html>；
      <https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-range.html>。
    - `sourceType: official-reference`；`appliesTo: Spring Framework 7.0.x, verified against 7.0.8`；
      `verifiedAt: 2026-08-13`。
    - `claims`：Servlet 不直接提供远端断开通知，通常只能由后续写失败观察；返回 `Resource` 或初始
      200 的 `ResponseEntity<Resource>` 可触发 MVC Range，`InputStreamResource` 不适用。
    - `driftRisk: medium`：living reference。
18. **`spring5215-streaming-response-body`**
    - 标题：StreamingResponseBody (Spring Framework 5.2.15.RELEASE API)。
    - URL：<https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/servlet/mvc/method/annotation/StreamingResponseBody.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Framework 5.2.15.RELEASE`；`verifiedAt: 2026-08-13`。
    - `claims`：旧线同样是 MVC 异步写阻塞输出流；必须显式拥有 executor、来源流和错误/取消处理。
    - `driftRisk: low`：归档版本。

### Reactive Streams、Flow、Reactor 与 WebFlux DataBuffer

19. **`reactive-streams-104-spec`**
    - 标题：Reactive Streams for the JVM 1.0.4。
    - URL：<https://github.com/reactive-streams/reactive-streams-jvm/tree/v1.0.4>。
    - `sourceType: specification`；`appliesTo: Reactive Streams 1.0.4`；`verifiedAt: 2026-08-13`。
    - `claims`：Publisher 不得发出超过 request 总需求的 `onNext`；`request(n)` 是累加需求，`n<=0`
      必须以 `onError(IllegalArgumentException)` 终止；`cancel()` 及时、幂等、线程安全，但并不保证
      立刻清理或完全没有在途信号。
    - `driftRisk: low`：固定规范版本。
20. **`jdk25-flow`**
    - 标题：Flow (Java SE 25 & JDK 25)。
    - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/Flow.html>。
    - `sourceType: api-doc`；`appliesTo: Java 25, since Java 9`；`verifiedAt: 2026-08-13`。
    - `claims`：`Flow` 对应 Reactive Streams 的 flow-controlled 模型；`Long.MAX_VALUE` 表示近似无界
      request；缓冲大小和再请求阈值是资源/速率权衡，不是固定生产常量。
    - `driftRisk: low`。
21. **`reactor386-demand-and-overflow`**
    - 标题：Reactor Core 3.8.6 Reference: Backpressure / Programmatic Creation。
    - URL：<https://projectreactor.io/docs/core/3.8.6/reference/coreFeatures/simple-ways-to-create-a-flux-or-mono-and-subscribe-to-it.html>；
      <https://projectreactor.io/docs/core/3.8.6/reference/coreFeatures/programmatically-creating-sequence.html>。
    - `sourceType: official-reference`；`appliesTo: Reactor Core 3.8.6`；`verifiedAt: 2026-08-13`。
    - `claims`：常见 `subscribe()`、`block()`、`toIterable()` 等入口会请求 `Long.MAX_VALUE`；
      `buffer(N)` 与 prefetch 会重塑上游 demand；`create` 默认 `BUFFER` 是无界缓冲并可导致
      `OutOfMemoryError`，overflow 策略必须按不丢失/可丢失语义选择。
    - `driftRisk: low`：固定 3.8.6 文档。
22. **`reactor386-cleanup-and-timeout`**
    - 标题：Reactor Core 3.8.6 Reference/API: Cleanup / Flux timeout。
    - URL：<https://projectreactor.io/docs/core/3.8.6/reference/advancedFeatures/cleanup.html>；
      <https://projectreactor.io/docs/core/3.8.6/api/reactor/core/publisher/Flux.html#timeout(java.time.Duration)>。
    - `sourceType: official-reference`；`appliesTo: Reactor Core 3.8.6`；`verifiedAt: 2026-08-13`。
    - `claims`：`doOnDiscard` 用于过滤或取消时被预取队列丢弃的资源，清理必须幂等；`doFinally`
      覆盖 complete/error/cancel；`timeout(Duration)` 是首项或相邻 emission 的空闲 timeout，
      不是任务的绝对 deadline。
    - `driftRisk: low`。
23. **`spring70-data-buffer-codec`**
    - 标题：Data Buffers and Codecs (Spring Framework 7.0)。
    - URL：<https://docs.spring.io/spring-framework/reference/7.0/core/databuffer-codec.html>。
    - `sourceType: official-reference`；`appliesTo: Spring Framework 7.0.x, verified against 7.0.8`；
      `verifiedAt: 2026-08-13`。
    - `claims`：`DataBuffer` 可来自池化 direct memory；引用计数从 1 开始，retain/release 必须平衡；
      decoder、过滤、缓存、错误和取消路径都要转移或释放 owner，优先使用 `DataBufferUtils`。
    - `driftRisk: medium`：living reference。
24. **`spring708-data-buffer-utils-and-pooled-data-buffer`**
    - 标题：DataBufferUtils / PooledDataBuffer (Spring Framework 7.0.8 API)。
    - URL：<https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/core/io/buffer/DataBufferUtils.html>；
      <https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/core/io/buffer/PooledDataBuffer.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-13`。
    - `claims`：`join(..., maxByteCount)` 达上限抛 `DataBufferLimitException`，所以 `join` 仍是聚合而非
      常量内存流式；cancel/error 时其累计 buffers 会释放；`release` 对 pooled buffer 减少引用计数。
    - `driftRisk: low`。
25. **`spring5215-data-buffer-utils`**
    - 标题：DataBufferUtils (Spring Framework 5.2.15.RELEASE API)。
    - URL：<https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/core/io/buffer/DataBufferUtils.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Framework 5.2.15.RELEASE`；`verifiedAt: 2026-08-13`。
    - `claims`：旧线也提供有上限的 `join`、`release` 与字节计数工具；API 可用不等于旧项目已有
      Netty/codec/线程模型的安全配置。
    - `driftRisk: low`：归档版本。

### HTTP Range

26. **`rfc9110-range`**
    - 标题：RFC 9110 Section 14, Range Requests。
    - URL：<https://www.rfc-editor.org/rfc/rfc9110.html#section-14>。
    - `sourceType: specification`；`appliesTo: HTTP Semantics`；`verifiedAt: 2026-08-13`。
    - `claims`：Range 仅定义于 GET；服务端可忽略并返回 200；单 range 成功为 206 与
      `Content-Range`，多 range 为 `multipart/byteranges`，不可满足 range 通常为 416 且应携带
      `Content-Range: bytes */length`；服务端可拒绝无效、过多或重叠的小 ranges。
    - `driftRisk: low`：正式 RFC。
27. **`spring708-resource-region`**
    - 标题：ResourceRegion (Spring Framework 7.0.8 API)。
    - URL：<https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/core/io/support/ResourceRegion.html>。
    - `sourceType: api-doc`；`appliesTo: Spring Framework 7.0.8`；`verifiedAt: 2026-08-13`。
    - `claims`：`ResourceRegion` 表示资源的 position/count，不替代 RFC 9110 的多 range、条件请求、
      授权、碎片限制和输出错误合同。
    - `driftRisk: low`。

## 核心模型：有界字节管线

“流式”仅将无界整载荷缓冲改为有界、可调度的增量处理；它不自动提供零复制、固定总内存、
Reactive Streams 背压、立即取消或端到端资源安全。正文应把每条链路表达为：

`输入 bytes -> 验证/计数 -> 有界 chunk -> 转换/压缩/解码 -> 有界队列或 demand -> 输出 -> close/release`

每个箭头都要指定 byte/element budget、timeout 类型、取消检查点、错误归属和资源 owner。以下预算
必须分开，且乘以并发数后仍不超过可接受的进程/池/磁盘资源：

| 预算 | 最小合同 | 不能替代的预算 |
| --- | --- | --- |
| 输入 | 实际读取字节、请求时长、文件数 | `Content-Length`、ZIP 声明 size |
| buffer | chunk 大小、prefetch、队列容量、聚合上限 | 并发数、下游输出速率 |
| ZIP | entry 数、单 entry/总展开字节、压缩比、路径类型 | 图片像素、媒体处理时长 |
| 图像 | 最大边长、checked `width * height`、目标格式和解码余量 | 压缩文件字节数 |
| Range | range 数、碎片/重叠策略、单响应总字节 | 对每次请求的授权 |
| 时间 | 绝对总时限与相邻 byte/element 空闲时限 | cancel 的立即性 |
| 所有权 | channel/stream/reader/zip/executor 的 close，pooled buffer 的 release | 框架“自动回收”假设 |

## 本课结论与教学边界

### 1. 随机访问是位置合同，不是并发安全或零复制承诺

- 对同一 `RandomAccessFile` 与其 `FileChannel` 混用共享位置时，读写顺序必须由单一 owner 串行化；
  多消费者读取独立区间时优先使用位置读写，避免每个任务 `position()/seek()` 改共享游标。
- 所有 channel 读写都循环处理“部分完成”。`transferTo` 也必须根据返回数量推进偏移，直到目标长度、
  EOF、取消或失败；不能把返回一次视为完整传输。
- `ByteBuffer` 的写入/读取状态转换是调用方合同。direct buffer 可以减少某些 native I/O copy，
  但不是零复制证明，且任意大/任意多 direct buffer 仍可耗尽进程资源。
- 生产仍需决定：局部读写的并发语义、对空洞/截断的业务规则、是否要求 durable publish、buffer
  上限与 direct memory observability。

### 2. ZIP 是压缩数据，不是可信文件系统

- 逐条目读取时使用实际输出计数，不信 `ZipEntry` 声明值或 `available()`；达到任一 entry/总展开/
  比率/时间预算即停止读取、关闭输入并将处理结果归为拒绝。
- `ZipInputStream` 适合单次顺序处理；需要中央目录、条目索引或可重复随机读取时使用有明确 owner 的
  `ZipFile`。两者都不验证安全落盘路径、符号链接或业务允许的 entry 类型。
- 解压落盘必须把受控根与 entry 相对路径以 `Path` 处理，拒绝绝对路径和逃逸根的规范化路径；
  `normalize()+startsWith()` 不能消除符号链接和 TOCTOU，安全要求更高时须以打开的目录句柄或隔离
  临时目录缩小竞态窗口。
- `finish()` 和 `close()` 不可互换：包装流的层次结构要决定谁完成压缩、谁关闭底层目标，避免
  premature close 或尾部未写完。

### 3. 图像预算必须先于完整像素解码

- 文件大小、MIME、扩展名和魔数均不能代替 decoded pixel budget。先选择 reader，读取宽高，再以
  溢出安全乘法检查最大边长和总像素；随后按目标色彩模型、raster 和库中间缓冲留出内存余量。
- `ImageIO.read` 返回 `null` 代表没有匹配 reader，必须作为明确拒绝而非空指针路径。解码失败、
  取消和超时后要 close `ImageInputStream`、`dispose()` reader，且不把输出对象发布。
- source region/subsampling 是降低处理量的工具，但不能把它宣称为对不可信大图的唯一防线。高风险
  解码/转换应隔离到有内存、CPU、wall-time 与并发上限的 worker，而非共享 Web 请求线程。
- 像素阈值、允许格式、动画帧/页数、色彩空间、转换 worker 隔离级别和失败状态的用户可见程度都留给
  生产决策，不能由本课给出通用固定数字。

### 4. MVC 流式响应需要 executor、输出失败与关闭合同

- `StreamingResponseBody` 释放 container thread，但执行 `writeTo(OutputStream)` 的工作仍会阻塞其
  `TaskExecutor`；必须显式配置有界 executor、拒绝策略、任务 timeout 和 source stream owner。
- Servlet 非阻塞输出只有 `isReady` / `WriteListener` 才能将 socket 可写状态变成写入许可。它不等同
  于应用、压缩、磁盘或上游 HTTP 的全链路 demand；Servlet 6.1 `write(ByteBuffer)` 不能出现在
  legacy 版本示例。
- 客户端断开通常在后续写失败才可观察，响应一旦提交就不能可靠切换为 JSON 错误。异常、超时、
  取消都要关闭上游输入、停止生产和记录可区分结果，不能无限继续后台读取。

### 5. 背压是 demand 协议；bounded queue 是另一个资源合同

- Reactive Streams 的 `request(n)` 是对元素的可累加需求，且元素大小未受协议约束。`request(1)`
  不意味着只保留一字节；对 `DataBuffer` 还要乘以最大 chunk size、prefetch 与并发数。
- `Long.MAX_VALUE` 关闭了需求上限。Reactor 常见订阅入口会这样请求；`buffer(N)`、`flatMap`、
  prefetch 等算子还会重塑 demand，因此正文必须展示每层的最大 in-flight 元素与 byte budget。
- `cancel()` 是最终、幂等的停止请求，不是同步清理屏障；上游可能仍发出在途 signal。取消路径必须
  幂等地停止来源、释放未交付资源和记录原因，不能依赖“取消后绝无 onNext”。
- 当源无法放慢时，应明确选择拒绝、drop、latest、有限 buffer 或外部持久化队列；默认无界 `BUFFER`
  只会把慢消费者变成 OOM。选择必须符合数据是否允许丢失，不能仅以吞吐量决定。

### 6. WebFlux 的 `DataBuffer` 所有权在分支处必须显式转移

- `Flux<DataBuffer>` 并不保证每个 buffer 都在用户代码后自动释放。pooled buffer 在转发、缓存、
  filter、decode、error 和 cancel 分支只能有一个最终 release owner；若跨异步边界保留则先 retain，
  最终 release 与 retain 次数平衡。
- `DataBufferUtils.join(maxByteCount)` 能防止单次聚合无限增长，但它仍会把 payload 聚合为一个
  buffer；真正大文件转发应在逐 chunk 写出/释放的链路中进行。`maxByteCount = -1` 不可作为课程
  推荐默认值。
- `doOnDiscard` 用于预取或过滤后未交付对象的清理，`doFinally` 收束 complete/error/cancel；二者
  清理逻辑必须幂等，且只处理本操作符真正拥有的资源，避免 double release。

### 7. HTTP Range 是局部表示协议，不是授权或内存优化的替代

- 每次 GET 或 Range GET 都先以业务 `fileId` 查元数据并授权，再打开受控资源；已知路径、对象 key
  或前一次授权都不等于本次可读。
- 单 range 为 206 + `Content-Range`，多 range 是 multipart；无可满足 range 为 416。服务端可
  忽略 Range 返回 200，也应限制 range 数、重复/重叠和极小碎片，避免放大 seek、header 与 CPU。
- 使用 Spring Resource/ResourceRegion 时仍需校验开始位置、长度、文件变化、条件请求、响应提交后的
  失败与 source close；这些 API 不自动完整实现所有 RFC 或业务合同。

## 冻结项目证据映射

以下仅转录 Phase 2 矩阵的已冻结路径、符号和计数，未打开路径或推断源码行为。`observed` 表示课程
可说明存在相关能力候选；`rejected` 表示只作为风险提示，禁止复制为正文推荐实现。

| 来源能力 | 冻结计数 | 路径与符号 | 使用 | 可支持的教学边界 |
| --- | ---: | --- | --- | --- |
| `JAVA-STDLIB-016` | 3 | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingWSServer.java`；`com.tdh.bdzz.config.websocket.server.LoggingWSServer` | `observed` | 存在二进制/日志处理候选，不证明 offset 并发安全 |
| `JAVA-STDLIB-016` | 3 | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingFileTailReader.java`；`com.tdh.bdzz.config.websocket.server.LoggingFileTailReader` | `observed` | 存在读取候选，不证明 backpressure 已实现 |
| `JAVA-STDLIB-016` | 3 | `dzzz-app/src/main/java/com/tdh/bdzz/storage/NioUtil.java`；`com.tdh.bdzz.storage.NioUtil` | `observed` | 存在 NIO 候选，不证明资源 owner 或部分写循环 |
| `JAVA-STDLIB-017` | 1 | `dzzz-app/src/main/java/com/tdh/bdzz/util/CommonUtil.java`；`com.tdh.bdzz.util.CommonUtil` | `observed` | 存在压缩/二进制工具候选，不证明展开上限 |
| `JAVA-STDLIB-029` | 11 | `dzzz-app/src/test/java/com/tdh/bdzz/util/KeywordSignatureMergeTest.java`；`com.tdh.bdzz.util.KeywordSignatureMergeTest` | `observed` | 存在图像/文档处理候选，不复制测试或业务数据 |
| `JAVA-STDLIB-029` | 11 | `dzzz-app/src/main/java/com/tdh/bdzz/util/ConvertPdf.java`；`com.tdh.bdzz.util.ConvertPdf` | `observed` | 只说明转换候选，不证明内存/超时隔离 |
| `JAVA-STDLIB-029` | 11 | `dzzz-app/src/main/java/com/tdh/bdzz/util/DateImageGenerator.java`；`com.tdh.bdzz.util.DateImageGenerator` | `observed` | 只说明图像生成候选，不证明像素预算 |
| `JAVA-STDLIB-029` | 11 | `dzzz-app/src/main/java/com/tdh/bdzz/util/FingerprintMergeLayoutUtil.java`；`com.tdh.bdzz.util.FingerprintMergeLayoutUtil` | `observed` | 只说明媒体处理候选，不复制实现 |
| `JAVA-STDLIB-029` | 11 | `dzzz-app/src/main/java/com/tdh/bdzz/util/ImageMergerUtil.java`；`com.tdh.bdzz.util.ImageMergerUtil` | `observed` | 只说明图像合并候选，不证明大小/像素限制 |
| `JAVA-ENGINEERING-024` | 23 | `dzzz-app/src/main/java/com/tdh/bdzz/handler/voice2text/BjhyVoice2TextHandler.java`；`com.tdh.bdzz.handler.voice2text.BjhyVoice2TextHandler` | `observed` | 存在转换管线候选，不证明流量受控 |
| `JAVA-ENGINEERING-024` | 23 | `dzzz-app/src/main/java/com/tdh/bdzz/handler/datareport/DataReportHandler.java`；`com.tdh.bdzz.handler.datareport.DataReportHandler` | `observed` | 存在 handler 边界候选，不证明取消传播 |
| `JAVA-ENGINEERING-024` | 23 | `dzzz-app/src/main/java/com/tdh/bdzz/validator/Error.java`；`com.tdh.bdzz.validator.Error` | `observed` | 存在错误表达候选，不证明输出后可改响应 |
| `JAVA-ENGINEERING-024` | 23 | `dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/commonJzDataSync/CommonJzDataSyncHandler.java`；`com.tdh.bdzz.timer.handler.commonJzDataSync.CommonJzDataSyncHandler` | `observed` | 存在同步候选，不证明队列或并发有界 |
| `JAVA-ENGINEERING-024` | 23 | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingFileTailReader.java`；`com.tdh.bdzz.config.websocket.server.LoggingFileTailReader` | `observed` | 存在流式读取候选，不证明慢消费者处理 |
| `JAVA-RISK-026` | 14 | `LoggingFileTailReader`、`CommonUtil`、`DownloadResponse`、`ConverterFactories`、`MossDownloader` 的 Phase 2 冻结路径/符号 | `rejected` | 仅保留无界整载荷与慢消费者风险，不复制任何 legacy 实现 |

## 不能推出的结论

- 不能由一个 `RandomAccessFile` 或 `FileChannel` 存在推出并发 offset、截断、文件替换或 durable publish
  已正确实现。
- 不能由 ZIP 条目元数据、`available()`、压缩文件大小或“已关闭流”推出展开数据有限、安全或可发布。
- 不能由 ImageIO 能读取某格式推出图像可信、像素预算已限制、decoder 无 CVE 或处理在隔离资源域中。
- 不能由 `StreamingResponseBody` 推出 socket 写不阻塞、客户端断开立即停止，或有 Reactive Streams
  背压；不能由 `Flux` 推出 byte budget、bounded queue 或 pooled buffer 自动释放。
- 不能由 `cancel()` 推出同步停止或零在途信号；不能由 `timeout` 推出总 deadline；不能由 `join` 推出
  大文件保持常量内存。
- 不能由 Range 支持推出每次请求的授权、对象版本一致性、带宽公平性或多 range DoS 防护。
- 不能把 Java 25 `Flow`、Servlet 6.1 `write(ByteBuffer)`、Spring 7.0.8 API 复制到 Java 8 / Spring
  5.2.15 legacy 示例。

## 易错点取证与反馈环计划

正文至少覆盖以下 12 个可观察错误，按“现象 -> 触发条件 -> 原因 -> 后果 -> 错误示例 -> 正确写法 ->
影响版本 -> 验证方式 -> 来源”组织：

1. 共享 `RandomAccessFile` 指针给并发任务，区间读取交错。
2. 假定 `read`、`write` 或 `transferTo` 一次传完，遗失尾部字节。
3. 只看 ZIP 元数据/`available()`，未累计实际展开字节、entry 数和耗时。
4. 用 `finish()` 代替正确的包装流关闭，压缩尾部或底层 owner 错误。
5. 解压 entry 仅做字符串前缀判断，忽略绝对路径、符号链接和 TOCTOU。
6. 仅限制图片文件字节数，在宽高/像素预算前完整 decode。
7. reader、input stream、channel 或 response source 在异常/取消路径泄漏。
8. 使用 `StreamingResponseBody` 却采用无界 executor 或无限制 producer。
9. Servlet 非阻塞输出忽略 `isReady()`，或在不可写时篡改 `ByteBuffer`。
10. 在 Reactor 默认无界 request/`BUFFER` 之上再叠加无界 prefetch。
11. filter/cancel/error 分支未 release `DataBuffer`，或多 owner double release。
12. 以 Range 或 `ResourceRegion` 绕过 fileId 授权、range 计数限制或响应提交后错误合同。

最小临时反馈环应在 `/tmp` 的 `mktemp` 目录内完成，成功后立即删去临时目录且确认不存在：

1. Java 25 runner：相邻区间使用位置读写，刻意短写；断言完整复制、共享位置不被改变、所有资源关闭。
2. Java 25/8 runner：生成声明 size 未知的 ZIP，流式累计 entry/总展开字节并在超限时停止；覆盖
   `finish` 与 `close` 的嵌套 owner。
3. Java 25 runner：用 header 可读的巨大宽高图片模拟输入，断言完整 `BufferedImage` decode 前拒绝；
   覆盖无 reader、decoder error 和 `dispose`。
4. Servlet/MVC fake 输出：慢输出、写失败、timeout、取消各一次，断言 executor admission、source close
   和响应提交后不伪造结构化成功。
5. Reactive Streams runner：有限 `request`、`Long.MAX_VALUE`、cancel 后在途元素、bounded queue 满、
   `doOnDiscard`/`doFinally` 四种终止路径，断言每个 owned buffer 恰好 release 一次。
6. Range runner：无 range、单 range、多 range、416、过多碎片与授权失败，断言不会为返回小区间读取
   完整大对象。

研究阶段不创建 runner、测试、正文、loader、track、signoff 或浏览器资产。

## 留给生产决策的事项

1. 各种请求/文件/entry/展开/像素/帧/页/Range/并发/队列/内存/磁盘的具体上限，必须由业务容量、
   租户公平性与压测决定。
2. 流式大对象的协议选择：MVC blocking stream、Servlet non-blocking API 或 WebFlux；三者不能在同一
   handler 内混成“自动背压”。
3. 转换与解码是否必须在独立 worker/process，及其 CPU/memory/wall-time 限制、重试/隔离和结果发布
   协议。
4. 外部对象存储、代理、文件系统和 Range 的一致性版本、条件请求、缓存、带宽配额与审计契约。
5. 异常分类、响应已提交后的观测方式、客户端断开可见性、取消传播到每个上游 SDK/worker 的边界。
6. direct memory、Netty pool、MVC executor、Reactor prefetch 与磁盘临时空间的监控指标和告警阈值。

## 研究 Gate 自检

- [x] 课程 ID、顺序 590、两个前置、五个 source capability、选择理由和 planned/not-started 状态
  已核对。
- [x] 27 个来源卡，38 个唯一官方直接 URL，均记录 ID、URL、精确 appliesTo、claims、
  `verifiedAt` 与 `driftRisk`；URL 仅在同一卡的成组 API 中出现。
- [x] 覆盖 Java 25/8 随机访问与 NIO、ZIP/压缩流、图像处理/像素预算、Servlet/Spring MVC 流式响应、
  Reactive Streams/Flow 背压、Reactor/Spring WebFlux `DataBuffer` 生命周期、HTTP Range、缓冲、
  timeout、取消、资源关闭与安全边界。
- [x] 项目证据只转录 5 个冻结 sourceId 的计数、路径与符号；14 个风险证据以 `rejected` 标示，未读取、
  运行或修改 `dzzz-app`。
- [x] 本稿没有创建正文、loader、track、signoff、测试或临时仓库资产；Java 25 / Servlet 6.1 /
  Spring 7 与 Java 8 / Spring 5.2 legacy 语义明确隔离。
- [x] SHA-256 应在文件写入、Prettier 与 scoped diff check 后由外部记录；不在本文写入自引用 SHA。

## 发布结论与 Stop Boundary

本文件只完成 Java 高级第 10 门的官方资料研究。研究稿通过 URL、冻结映射、格式、行数和 SHA 核验后，
主流程才可进入本课正文 Gate；本任务不授权正文、接线、signoff、下一课、commit、stage 或 push。
