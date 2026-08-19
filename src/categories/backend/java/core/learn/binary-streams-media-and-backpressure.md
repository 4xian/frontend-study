---
id: backend.java.learn.advanced.binary-streams-media-and-backpressure
type: lesson
title: 随机访问、压缩、图像与流式背压
summary: 用位置读写、实际展开与像素预算、有限队列和需求协议构建可取消、可回收的二进制处理链
domain: backend
technology: java
module: core
stage: advanced
level: advanced
estimatedMinutes: 240
objectives:
  - 能区分共享文件指针与绝对位置读写，并正确处理 channel 的部分读写。
  - 能按实际读取量限制 ZIP 条目、总展开字节和路径，而不是信任声明元数据。
  - 能在完整解码前读取图片宽高，并用溢出安全的像素预算决定是否接收。
  - 能解释固定 chunk、有限队列、Reactive Streams demand 和 Servlet 可写信号的不同职责。
  - 能在成功、失败、超时和取消路径中关闭 stream、channel、reader 并释放池化 buffer。
  - 能在 Java 25 主线与 Java 8 legacy 线之间隔离 Flow、Servlet 和 Spring API 差异。
prerequisites:
  - backend.java.learn.basics.io-files-and-resource-ownership
  - backend.java.learn.advanced.concurrency-locks-and-shared-state
related: []
tags:
  - Java
  - FileChannel
  - ByteBuffer
  - ZIP
  - ImageIO
  - 背压
  - Reactive Streams
  - DataBuffer
  - Range
  - 流式处理
appliesTo: Java 25 / Spring Framework 7.0.8 / Reactor Core 3.8.6 主线；项目补充适用于 Java 8 / Spring Boot 2.3.12.RELEASE / Spring Framework 5.2.15.RELEASE
modernBaseline:
  java: '25'
  springBoot: 4.1.0
  springFramework: 7.0.8
  reactorCore: 3.8.6
  reactiveStreams: 1.0.4
legacyBaseline:
  java: '8'
  springBoot: 2.3.12.RELEASE
  springFramework: 5.2.15.RELEASE
verifiedAt: 2026-08-13
sources:
  - id: jdk25-random-access-file
    title: RandomAccessFile (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/RandomAccessFile.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['文件指针决定下一次读写偏移，关联 FileChannel 与 RandomAccessFile 共享位置和长度']
  - id: jdk25-file-channel
    title: FileChannel (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/channels/FileChannel.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['绝对位置读写不改变当前 position，read、write 与 transferTo 均可能部分完成']
  - id: jdk25-seekable-byte-channel
    title: SeekableByteChannel (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/channels/SeekableByteChannel.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['channel 维护位置与大小，超过 EOF 的读取与后续扩展写入具有不同语义']
  - id: jdk25-byte-buffer
    title: ByteBuffer (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/ByteBuffer.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['position、limit、capacity 控制读写状态，flip 和 compact 分别切换与保留未消费数据']
  - id: jdk8-random-access-file
    title: RandomAccessFile (Java Platform SE 8)
    url: https://docs.oracle.com/javase/8/docs/api/java/io/RandomAccessFile.html
    sourceType: api-doc
    appliesTo: Java 8
    claims: ['Java 8 已有共享文件指针和关联 channel 合同']
  - id: jdk8-file-channel
    title: FileChannel (Java Platform SE 8)
    url: https://docs.oracle.com/javase/8/docs/api/java/nio/channels/FileChannel.html
    sourceType: api-doc
    appliesTo: Java 8
    claims: ['Java 8 已支持位置读写、部分完成与 force，旧线仍须执行相同资源合同']
  - id: jdk25-zip-input-stream
    title: ZipInputStream (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/zip/ZipInputStream.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['ZipInputStream 顺序读取条目，available 不表示剩余字节数']
  - id: jdk25-zip-file
    title: ZipFile (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/zip/ZipFile.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['ZipFile 面向本地归档随机访问，关闭它也关闭条目输入流']
  - id: jdk25-zip-entry
    title: ZipEntry (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/zip/ZipEntry.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['条目 size、compressed size 与 CRC 均可能未知，安全预算必须按实际输出累计']
  - id: jdk25-deflater-output-stream
    title: DeflaterOutputStream (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/zip/DeflaterOutputStream.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['finish 完成压缩但不关闭底层流，close 同时完成压缩并关闭底层流']
  - id: jdk8-zip-input-stream
    title: ZipInputStream (Java Platform SE 8)
    url: https://docs.oracle.com/javase/8/docs/api/java/util/zip/ZipInputStream.html
    sourceType: api-doc
    appliesTo: Java 8
    claims: ['旧线同样必须使用固定缓冲循环累计实际展开量并关闭流']
  - id: android-zip-path-traversal
    title: Android Developers - Zip Path Traversal
    url: https://developer.android.com/privacy-and-security/risks/zip-path-traversal
    sourceType: security-standard
    appliesTo: java.util.zip security guidance
    claims: ['java.util.zip 不自动阻止路径穿越，落盘前必须验证规范化目标仍位于受控根内']
  - id: jdk25-image-io
    title: ImageIO (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.desktop/javax/imageio/ImageIO.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['没有匹配 reader 时 read 返回 null，默认缓存策略可能使用磁盘']
  - id: jdk25-image-reader
    title: ImageReader (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.desktop/javax/imageio/ImageReader.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['可在完整解码前读取宽高，完成或中止后仍须 dispose reader']
  - id: jdk25-image-read-param
    title: ImageReadParam (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.desktop/javax/imageio/ImageReadParam.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['source region 与 subsampling 可减少目标输出，但不能替代输入和像素预算']
  - id: jdk25-buffered-image
    title: BufferedImage (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.desktop/java/awt/image/BufferedImage.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['目标像素类型只给出像素存储的一部分估算，解码插件与中间缓冲仍会额外占用资源']
  - id: jdk25-image-input-stream
    title: ImageInputStream (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.desktop/javax/imageio/stream/ImageInputStream.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['图像输入流有独立位置和关闭责任']
  - id: jdk8-image-io
    title: ImageIO (Java Platform SE 8)
    url: https://docs.oracle.com/javase/8/docs/api/javax/imageio/ImageIO.html
    sourceType: api-doc
    appliesTo: Java 8
    claims: ['Java 8 已提供 ImageIO，旧线同样必须处理 null、缓存与流生命周期']
  - id: owasp-asvs-file-handling
    title: OWASP ASVS 5.0.0 - File Handling
    url: https://github.com/OWASP/ASVS/blob/v5.0.0/5.0/en/0x14-V5-File-Handling.md
    sourceType: security-standard
    appliesTo: OWASP ASVS 5.0.0
    claims: ['归档需限制展开大小与条目数，上传图片需拒绝超过允许像素数的输入']
  - id: servlet61-async-context
    title: AsyncContext (Jakarta Servlet 6.1 API)
    url: https://jakarta.ee/specifications/servlet/6.1/apidocs/jakarta.servlet/jakarta/servlet/asynccontext
    sourceType: api-doc
    appliesTo: Jakarta Servlet 6.1
    claims: ['异步 timeout 有独立生命周期，超时不等于可靠的客户端断开通知']
  - id: servlet61-output-stream
    title: ServletOutputStream (Jakarta Servlet 6.1 API)
    url: https://jakarta.ee/specifications/servlet/6.1/apidocs/jakarta.servlet/jakarta/servlet/servletoutputstream
    sourceType: api-doc
    appliesTo: Jakarta Servlet 6.1
    claims: ['非阻塞写必须遵守 isReady 和 WriteListener 的可写许可']
  - id: servlet61-write-listener
    title: WriteListener (Jakarta Servlet 6.1 API)
    url: https://jakarta.ee/specifications/servlet/6.1/apidocs/jakarta.servlet/jakarta/servlet/writelistener
    sourceType: api-doc
    appliesTo: Jakarta Servlet 6.1
    claims: ['onWritePossible 驱动后续写入，错误回调必须停止来源并收束资源']
  - id: spring708-streaming-response-body
    title: StreamingResponseBody (Spring Framework 7.0.8 API)
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/servlet/mvc/method/annotation/StreamingResponseBody.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims: ['MVC 异步写仍执行阻塞 OutputStream，生产必须显式配置 TaskExecutor']
  - id: spring70-mvc-async
    title: MVC Async Requests (Spring Framework 7.0)
    url: https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-ann-async.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims: ['远端断开通常由后续写失败观察，响应提交后不能可靠改写为结构化错误']
  - id: spring70-mvc-range
    title: Range Requests (Spring Framework 7.0)
    url: https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-range.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims: ['Resource 可触发 MVC Range，InputStreamResource 不适合该处理']
  - id: spring5215-streaming-response-body
    title: StreamingResponseBody (Spring Framework 5.2.15.RELEASE API)
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/servlet/mvc/method/annotation/StreamingResponseBody.html
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims: ['旧线同样是 MVC 异步写阻塞输出流，executor 与来源流仍需明确 owner']
  - id: reactive-streams-104
    title: Reactive Streams for the JVM 1.0.4
    url: https://github.com/reactive-streams/reactive-streams-jvm/tree/v1.0.4
    sourceType: specification
    appliesTo: Reactive Streams 1.0.4
    claims: ['Publisher 不得超过累计需求，非正需求必须报错，cancel 不保证同步清空在途信号']
  - id: jdk25-flow
    title: Flow (Java SE 25 & JDK 25)
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/Flow.html
    sourceType: api-doc
    appliesTo: Java 25, since Java 9
    claims: ['Flow 对应流量受控模型，Long.MAX_VALUE 表示近似无界需求']
  - id: reactor386-subscribe-demand
    title: Reactor Core 3.8.6 - Backpressure and Subscribe
    url: https://projectreactor.io/docs/core/3.8.6/reference/coreFeatures/simple-ways-to-create-a-flux-or-mono-and-subscribe-to-it.html
    sourceType: official-reference
    appliesTo: Reactor Core 3.8.6
    claims: ['常见 subscribe、block 与 toIterable 入口会产生无界需求']
  - id: reactor386-programmatic-create
    title: Reactor Core 3.8.6 - Programmatically Creating a Sequence
    url: https://projectreactor.io/docs/core/3.8.6/reference/coreFeatures/programmatically-creating-sequence.html
    sourceType: official-reference
    appliesTo: Reactor Core 3.8.6
    claims: ['create 默认 BUFFER 可无界增长，overflow 策略必须匹配数据可丢失语义']
  - id: reactor386-cleanup
    title: Reactor Core 3.8.6 - Dealing with Objects That Need Cleanup
    url: https://projectreactor.io/docs/core/3.8.6/reference/advancedFeatures/cleanup.html
    sourceType: official-reference
    appliesTo: Reactor Core 3.8.6
    claims: ['doOnDiscard 清理未交付资源，清理动作必须幂等']
  - id: reactor386-flux-timeout
    title: Reactor Core 3.8.6 Flux.timeout API
    url: 'https://projectreactor.io/docs/core/3.8.6/api/reactor/core/publisher/Flux.html#timeout(java.time.Duration)'
    sourceType: api-doc
    appliesTo: Reactor Core 3.8.6
    claims: ['timeout(Duration) 是首项或相邻信号空闲超时，不是任务绝对 deadline']
  - id: spring70-data-buffer-codec
    title: Data Buffers and Codecs (Spring Framework 7.0)
    url: https://docs.spring.io/spring-framework/reference/7.0/core/databuffer-codec.html
    sourceType: official-reference
    appliesTo: Spring Framework 7.0.8
    claims: ['池化 DataBuffer 使用引用计数，retain 与 release 必须平衡']
  - id: spring708-data-buffer-utils
    title: DataBufferUtils (Spring Framework 7.0.8 API)
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/core/io/buffer/DataBufferUtils.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims: ['join 的 maxByteCount 限制聚合量，聚合仍不是常量内存转发']
  - id: spring708-pooled-data-buffer
    title: PooledDataBuffer (Spring Framework 7.0.8 API)
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/core/io/buffer/PooledDataBuffer.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims: ['池化 buffer 有显式 retain、release 与引用计数生命周期']
  - id: spring5215-data-buffer-utils
    title: DataBufferUtils (Spring Framework 5.2.15.RELEASE API)
    url: https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/core/io/buffer/DataBufferUtils.html
    sourceType: api-doc
    appliesTo: Spring Framework 5.2.15.RELEASE
    claims: ['旧线已提供有上限 join 与 release，仍需按旧依赖和线程模型验证']
  - id: rfc9110-range
    title: RFC 9110 Section 14 - Range Requests
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-14
    sourceType: specification
    appliesTo: HTTP Semantics
    claims: ['Range 仅定义于 GET，206、multipart 与 416 各有独立响应合同']
  - id: spring708-resource-region
    title: ResourceRegion (Spring Framework 7.0.8 API)
    url: https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/core/io/support/ResourceRegion.html
    sourceType: api-doc
    appliesTo: Spring Framework 7.0.8
    claims: ['ResourceRegion 只表示 position 和 count，不替代授权、条件请求与碎片限制']
projectEvidence:
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingWSServer.java
    symbol: com.tdh.bdzz.config.websocket.server.LoggingWSServer
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/storage/NioUtil.java
    symbol: com.tdh.bdzz.storage.NioUtil
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/CommonUtil.java
    symbol: com.tdh.bdzz.util.CommonUtil
    usage: observed
  - file: dzzz-app/src/test/java/com/tdh/bdzz/util/KeywordSignatureMergeTest.java
    symbol: com.tdh.bdzz.util.KeywordSignatureMergeTest
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/ConvertPdf.java
    symbol: com.tdh.bdzz.util.ConvertPdf
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/DateImageGenerator.java
    symbol: com.tdh.bdzz.util.DateImageGenerator
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/ImageMergerUtil.java
    symbol: com.tdh.bdzz.util.ImageMergerUtil
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/handler/voice2text/BjhyVoice2TextHandler.java
    symbol: com.tdh.bdzz.handler.voice2text.BjhyVoice2TextHandler
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/handler/datareport/DataReportHandler.java
    symbol: com.tdh.bdzz.handler.datareport.DataReportHandler
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/timer/handler/commonJzDataSync/CommonJzDataSyncHandler.java
    symbol: com.tdh.bdzz.timer.handler.commonJzDataSync.CommonJzDataSyncHandler
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingFileTailReader.java
    symbol: com.tdh.bdzz.config.websocket.server.LoggingFileTailReader
    usage: rejected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/download/DownloadResponse.java
    symbol: com.tdh.bdzz.download.DownloadResponse
    usage: rejected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/factories/flv/ConverterFactories.java
    symbol: com.tdh.bdzz.factories.flv.ConverterFactories
    usage: rejected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/download/MossDownloader.java
    symbol: com.tdh.bdzz.download.MossDownloader
    usage: rejected
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/PptUtil.java
    symbol: com.tdh.bdzz.util.PptUtil
    usage: rejected
---
# 随机访问、压缩、图像与流式背压

## 为什么需要学习

二进制链路的危险通常不是“不会读文件”，而是没有把位置、展开量、像素、队列、需求和资源所有权放在
同一张预算表里。一次 `read()` 可能只返回部分字节；几 KB 的 ZIP 或图片可能展开为巨大内存；所谓
“流式返回”也可能只把整载荷内存换成无界线程队列。流式处理只把无界整载荷缓冲改造成有界、可调度的
增量处理；它不自动提供零复制、固定总内存、Reactive Streams 背压、立即取消或端到端资源安全。

## 学习目标

- 用绝对位置读写完成独立区间读取，不让并发任务争用共享游标。
- 对 ZIP、图片、chunk、队列、并发和时间分别执行预算。
- 区分 MVC 阻塞流、Servlet 非阻塞可写信号与 Reactive Streams demand。
- 让 complete、error、timeout 和 cancel 都落到唯一的关闭或释放 owner。
- 在 Java 8 兼容线中保持相同安全合同，同时不误用 Java 9+ `Flow` 或 Servlet 6.1 API。

## 前置术语

- **偏移（offset）：** 一个字节相对文件开头的位置，首字节偏移为 0。
- **chunk：** 每次处理的一小段有限字节，不代表完整业务载荷。
- **背压（backpressure）：** 消费者通过需求或可写许可约束生产者继续发送的协议。
- **展开量：** 压缩数据解压后实际产生的字节数；它可能远大于压缩文件大小。
- **池化 buffer：** 从共享内存池借出的缓冲区，通常要显式归还或减少引用计数。

## 零基础知识点详解

### 文件指针与绝对位置读写

**它是什么：** `RandomAccessFile.seek()` 和 `FileChannel.position()` 操作共享游标；
`channel.read(buffer, offset)`、`write(buffer, offset)` 则在给定偏移工作且不移动当前游标。

**有什么作用：** 独立区间可按自己的 offset 读取，避免多个任务交替修改同一个位置。

**什么时候使用：** 读取文件头、索引、Range 区间或分片合并时使用位置读写；严格顺序扫描则保持单一
owner 的普通游标更简单。

**怎么使用：**

1. 先校验 `offset >= 0`、`length >= 0`，并决定 EOF 是正常结束还是数据损坏。
2. 为本次区间创建有上限的 `ByteBuffer`，调用带 offset 的位置读写。
3. 根据每次返回的实际字节数推进 offset，直到 buffer 完成、EOF、取消或失败。

**最小示例：** `channel.read(buffer, 128)` 从偏移 128 读入，但不会把
`channel.position()` 改成 128。

**运行结果：** 完整示例会验证两个相邻区间拼回原始字节，且 channel 当前位置保持 0。

**常见误区：** 把 `RandomAccessFile` 和它的 `FileChannel` 当成两个独立游标，或认为一次读写一定完成。

### ByteBuffer 的写模式与读模式

**它是什么：** `capacity` 是容量，`position` 是下一次操作位置，`limit` 是当前可操作边界。
新 buffer 通常处于写模式，`flip()` 把已写区域变成可读区域。

**有什么作用：** 它让同一块有限内存可以在“接收数据”和“消费数据”之间显式切换。

**什么时候使用：** channel I/O、协议头解析和固定 chunk 处理使用；简单字符文本不要为了“高级”而强行
引入 direct buffer。

**怎么使用：**

1. 写入 buffer 后调用 `flip()`，把 limit 设为已写数量并把 position 归零。
2. 消费方循环写出或解析，不能假设一次调用耗尽 remaining。
3. 仍有未消费数据时调用 `compact()`，再继续接收；全部消费后可 `clear()`。

**最小示例：** `buffer.putInt(7); buffer.flip(); int value = buffer.getInt();`。

**运行结果：** `value` 为 7；若漏掉 `flip()`，读取位置仍在已写数据之后。

**常见误区：** 将 `clear()` 理解为擦除内存，或把 direct buffer 当作“必然零复制”。

### 顺序 ZIP 与随机 ZIP

**它是什么：** `ZipInputStream` 按输入流顺序遍历条目；`ZipFile` 打开本地归档并利用中央目录查找条目。

**有什么作用：** 前者适合单遍流式接收，后者适合已落盘归档的重复查找和随机读取。

**什么时候使用：** 上传流只处理一遍时使用 `ZipInputStream`；需要中央目录元数据或多次读取时使用有
明确关闭 owner 的 `ZipFile`。

**怎么使用：**

1. 每次 `getNextEntry()` 先检查条目数、名称和允许类型。
2. 用固定 buffer 读取当前条目，按实际返回量累计单条目与总展开字节。
3. 超过任一预算立即拒绝并关闭归档流，不能继续生成可发布结果。

**最小示例：** `while ((entry = zip.getNextEntry()) != null) { while (zip.read(buffer) != -1) ... }`。

**运行结果：** 完整示例只接受两个安全条目，并让过小总预算稳定进入拒绝分支。

**常见误区：** 用 `entry.getSize()` 或 `available()` 代替实际展开计数。

### 压缩输出与包装流所有权

**它是什么：** `finish()` 写完压缩尾部但保留底层流开放；`close()` 写完尾部并关闭底层流。

**有什么作用：** 调用方可明确决定后续是否还要在同一底层协议上写校验信息或其他 frame。

**什么时候使用：** 普通文件归档让最外层 try-with-resources 关闭即可；只有协议明确需要继续使用底层流时
才单独调用 `finish()`。

**怎么使用：**

1. 先决定谁拥有底层输出流，避免两个组件都宣称最终关闭权。
2. 对每个 `ZipEntry` 写入有限数据并调用 `closeEntry()`。
3. 正常完成时由 `ZipOutputStream.close()` 写尾部并关闭；特殊协议才 `finish()` 后继续使用底层流。

**最小示例：** 完整示例把 `ZipOutputStream` 设为外层 owner，不在中途关闭底层文件流。

**运行结果：** 归档可被重新打开并读取两个完整条目。

**常见误区：** 只 `flush()` 就认为 ZIP 完整，或在写完第一个条目后提前关闭底层流。

### 图像元数据与像素预算

**它是什么：** 图片压缩字节只是编码结果；完整解码会创建宽乘高的像素、raster 和插件中间缓冲。

**有什么作用：** 先读取宽高再决定是否解码，可以在大规模内存分配前拒绝异常输入。

**什么时候使用：** 所有外部图片、PDF 渲染页、缩略图和图片合成入口都应设置边长、像素、帧数、
并发与 wall-time 预算。

**怎么使用：**

1. 用 `ImageIO.createImageInputStream` 和匹配的 `ImageReader` 读取宽高。
2. 用 `Math.multiplyExact((long) width, height)` 做溢出安全乘法并比较最大像素。
3. 预算通过后才 `reader.read(0)`；在 finally 中 `dispose()` reader 并关闭输入流。

**最小示例：** `long pixels = Math.multiplyExact((long) width, (long) height);`。

**运行结果：** 完整示例接受 8x6 图片，并在 10 像素预算下于完整解码前拒绝。

**常见误区：** 只限制上传文件字节数，或认为 `ImageIO.read()` 只有成功和抛异常两种结果。

### 有限 chunk 与有限队列

**它是什么：** chunk 限制单次分配；有界队列限制已生产但尚未消费的 chunk 数量。两者相乘才是该环节
的主要驻留字节预算。

**有什么作用：** 消费者变慢时，生产者在队列满处等待或拒绝，而不是继续增长内存。

**什么时候使用：** 阻塞式文件、压缩、对象存储或转换 SDK 之间的桥接使用；若数据不可丢失，不能把
drop 策略偷偷当作背压。

**怎么使用：**

1. 根据容量和并发预算确定 chunk 大小与队列容量。
2. 生产者用 `put` 或有 deadline 的 `offer` 交付，消费者逐块处理。
3. error、timeout 或 cancel 时同时停止两端，并由唯一 owner 关闭输入和输出。

**最小示例：** 完整示例使用 `ArrayBlockingQueue<Chunk>(2)` 和 128 字节 chunk。

**运行结果：** 4096 字节输入被完整复制，观测到的队列深度始终不超过 2。

**常见误区：** 只把每块设小，却让队列、executor queue 或并发请求保持无界。

### Reactive Streams demand

**它是什么：** 订阅者通过 `request(n)` 累加允许接收的元素数；publisher 不得发送超过总需求的
`onNext`。

**有什么作用：** demand 将“消费者还能接收多少元素”沿响应式链路向上游传播。

**什么时候使用：** 上下游都支持 Reactive Streams/WebFlux 时使用；阻塞 SDK 仍需专用有界调度与
桥接，不能靠 `Flux` 类型名自动获得背压。

**怎么使用：**

1. 先定义一个元素的最大字节数，再确定 prefetch 和并发。
2. 审查 `buffer`、`flatMap`、`publishOn` 和订阅入口如何重塑需求。
3. 为 cancel/error/discard 分支转移或释放每个资源对象的 owner。

**最小示例：** `request(1)` 只允许一个元素，不代表一个字节；`Long.MAX_VALUE` 表示近似无界需求。

**运行结果：** 有限请求下 publisher 只能发送累计需求内的元素；取消可能仍留下已经在途的信号。

**常见误区：** 把 demand 当作线程池限流，或认为 `request(1)` 足以控制任意大小的 `DataBuffer`。

### MVC 流、Servlet 非阻塞与 WebFlux

**它是什么：** `StreamingResponseBody` 在异步 executor 上写阻塞 `OutputStream`；Servlet 非阻塞写
由 `isReady`/`WriteListener` 提供 socket 可写许可；WebFlux 使用 Reactive Streams 链路。

**有什么作用：** 三种模型分别解决释放容器线程、等待 socket 可写和端到端 demand，不能混称一种背压。

**什么时候使用：** 阻塞式来源可选 MVC + 有界 executor；Servlet 原生状态机适合细粒度非阻塞输出；
响应式来源和目标可用 WebFlux。

**怎么使用：**

1. 先按来源 SDK 的阻塞/响应式性质选一种模型。
2. 明确 executor、队列、timeout、响应提交、写失败和来源关闭合同。
3. 客户端断开时以写失败或取消信号停止上游，不能继续后台生成整份载荷。

**最小示例：** MVC 生产配置必须提供有界 `TaskExecutor`；它不等同于 `Flux<DataBuffer>`。

**运行结果：** 慢客户端只占用受控任务和 buffer，拒绝或超时能停止来源并形成可观测结果。

**常见误区：** 认为从 controller 返回 `StreamingResponseBody` 就获得非阻塞 I/O 和 Reactive 背压。

### 池化 DataBuffer 的引用计数

**它是什么：** 池化 `DataBuffer` 借用 direct memory；retain 增加引用，release 减少引用并在归零时归还。

**有什么作用：** 它减少重复分配，但要求每条 complete/error/cancel/discard 路径都能证明最终 owner。

**什么时候使用：** WebFlux/Netty 提供池化 buffer 时遵循框架工具；普通 JDK heap buffer 不要模仿引用
计数协议。

**怎么使用：**

1. 收到 buffer 时明确本操作符是转发、临时保留还是最终消费。
2. 跨异步边界保留才 retain；最终消费、丢弃或失败时恰好 release 一次。
3. 用 `doOnDiscard` 清理未交付对象，用 `doFinally` 收束终止原因，且清理保持幂等。

**最小示例：** `join(maxByteCount)` 只是带上限聚合，仍会把载荷汇成一个 buffer。

**运行结果：** 引用计数最终归零；不会出现泄漏，也不会因 double release 访问已归还内存。

**常见误区：** 认为 `Flux<DataBuffer>` 会自动释放用户代码过滤、缓存或取消留下的所有 buffer。

### HTTP Range 与局部读取

**它是什么：** Range 让 GET 请求选择表示的一部分；单范围成功通常返回 206 与 `Content-Range`，
不可满足通常返回 416。

**有什么作用：** 视频 seek、断点续传和大文件局部下载无需从开头传输完整对象。

**什么时候使用：** 稳定、可定位且每次请求都能重新授权的资源使用；动态压缩流或一次性输入流通常不能
可靠随机访问。

**怎么使用：**

1. 先按 `fileId` 重新鉴权并固定本次对象版本和总长度。
2. 校验 range 数、边界、重叠/碎片策略，再用位置读写读取有限区间。
3. 按 RFC 生成 200、206、multipart 或 416，并在写失败时关闭来源。

**最小示例：** `readRange(channel, start, length)` 只分配本次允许的有限长度。

**运行结果：** 请求得到精确区间，不需要把完整对象读入 `byte[]`。

**常见误区：** 把 Range 当作授权凭据，或允许大量重叠小范围放大 seek、header 和 CPU。

## 现代版本中的正确用法

一条可审计的二进制处理链应写成：

`输入 -> 实际计数 -> 有限 chunk -> 转换 -> 有限队列或 demand -> 输出 -> close/release`

每个箭头都单独记录：最大字节/元素、并发、空闲 timeout、绝对 deadline、取消检查点、错误结果和资源
owner。输入、ZIP 展开、图片像素、队列、Range 与总时间不能互相替代；预算还要乘以最大并发，才能与
heap、direct memory、磁盘临时空间和 executor 容量比较。

## 核心接口与完整示例

以下示例只使用 JDK API，并保持 Java 8 可编译。它不是通用媒体框架，而是把本课最小反馈环放在同一个
可执行类中。

```java
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Arrays;
import java.util.Iterator;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;

public final class BinaryMediaBackpressureExample {
    private static final int CHUNK_SIZE = 128;
    private static final int QUEUE_CAPACITY = 2;

    /** 禁止创建只承载反馈环的实例。 */
    private BinaryMediaBackpressureExample() {}

    /** 运行随机访问、ZIP、图片预算和有限队列反馈环。 */
    public static void main(String[] args) throws Exception {
        Path root = Files.createTempDirectory("binary-media-example-");
        try {
            byte[] source = deterministicBytes(4096);
            boolean randomAccess = verifyRandomAccess(root.resolve("payload.bin"), source);

            Path zip = root.resolve("payload.zip");
            createZip(zip);
            ZipSummary zipSummary = inspectZip(zip, 4, 64, 128);
            boolean zipRejected = rejectsZipOverBudget(zip);

            Path image = root.resolve("sample.png");
            createImage(image);
            ImageInfo imageInfo = inspectImage(image, 32, 64);
            boolean imageRejected = rejectsImageOverBudget(image);

            PipeResult pipe = boundedCopy(source);
            require(Arrays.equals(source, pipe.bytes), "有限管线复制结果不完整");
            require(pipe.maxQueued <= QUEUE_CAPACITY, "队列超过配置容量");

            System.out.println(
                "BINARY_MEDIA_PASS random=" + randomAccess
                    + " zip=" + zipSummary.entries
                    + " image=" + imageInfo.width + "x" + imageInfo.height
                    + " chunks=" + pipe.chunks
                    + " maxQueued=" + pipe.maxQueued
                    + " rejected=" + (zipRejected && imageRejected));
        } finally {
            deleteTree(root);
        }
    }

    /** 生成稳定且可重复验证的字节序列。 */
    private static byte[] deterministicBytes(int size) {
        byte[] bytes = new byte[size];
        for (int index = 0; index < bytes.length; index++) {
            bytes[index] = (byte) (index * 31 + 7);
        }
        return bytes;
    }

    /** 用绝对位置读写验证共享当前位置不会被改变。 */
    private static boolean verifyRandomAccess(Path path, byte[] source) throws IOException {
        try (FileChannel channel = FileChannel.open(
                path,
                StandardOpenOption.CREATE_NEW,
                StandardOpenOption.READ,
                StandardOpenOption.WRITE)) {
            writeFully(channel, ByteBuffer.wrap(source), 0L);
            require(channel.position() == 0L, "绝对位置写入改变了共享位置");
            int middle = source.length / 2;
            byte[] first = readRange(channel, 0L, middle);
            byte[] second = readRange(channel, middle, source.length - middle);
            byte[] joined = new byte[source.length];
            System.arraycopy(first, 0, joined, 0, first.length);
            System.arraycopy(second, 0, joined, first.length, second.length);
            require(channel.position() == 0L, "绝对位置读取改变了共享位置");
            return Arrays.equals(source, joined);
        }
    }

    /** 循环执行绝对位置写入，直到 buffer 完全消费。 */
    private static void writeFully(FileChannel channel, ByteBuffer buffer, long offset)
            throws IOException {
        long position = offset;
        while (buffer.hasRemaining()) {
            int written = channel.write(buffer, position);
            require(written > 0, "位置写入没有取得进展");
            position += written;
        }
    }

    /** 从绝对位置读取精确的有限区间。 */
    private static byte[] readRange(FileChannel channel, long offset, int length)
            throws IOException {
        require(offset >= 0L && length >= 0, "区间参数无效");
        ByteBuffer buffer = ByteBuffer.allocate(length);
        long position = offset;
        while (buffer.hasRemaining()) {
            int read = channel.read(buffer, position);
            if (read == -1) {
                break;
            }
            require(read > 0, "位置读取没有取得进展");
            position += read;
        }
        require(!buffer.hasRemaining(), "区间在预期长度前到达 EOF");
        return buffer.array();
    }

    /** 创建包含两个小条目的受控 ZIP fixture。 */
    private static void createZip(Path path) throws IOException {
        try (ZipOutputStream zip = new ZipOutputStream(Files.newOutputStream(path))) {
            writeZipEntry(zip, "alpha.txt", deterministicBytes(24));
            writeZipEntry(zip, "nested/beta.bin", deterministicBytes(32));
        }
    }

    /** 写入一个名称和内容均由服务端控制的 ZIP 条目。 */
    private static void writeZipEntry(ZipOutputStream zip, String name, byte[] bytes)
            throws IOException {
        zip.putNextEntry(new ZipEntry(name));
        zip.write(bytes);
        zip.closeEntry();
    }

    /** 按实际读取量检查 ZIP 条目、单条目和总展开预算。 */
    private static ZipSummary inspectZip(
            Path path,
            int maxEntries,
            long maxEntryBytes,
            long maxTotalBytes) throws IOException {
        int entries = 0;
        long total = 0L;
        byte[] buffer = new byte[CHUNK_SIZE];
        try (ZipInputStream zip = new ZipInputStream(Files.newInputStream(path))) {
            ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null) {
                entries++;
                require(entries <= maxEntries, "ZIP 条目数超限");
                requireSafeEntryName(entry.getName());
                long entryBytes = 0L;
                int read;
                while ((read = zip.read(buffer)) != -1) {
                    entryBytes = Math.addExact(entryBytes, read);
                    total = Math.addExact(total, read);
                    require(entryBytes <= maxEntryBytes, "ZIP 单条目展开超限");
                    require(total <= maxTotalBytes, "ZIP 总展开超限");
                }
                zip.closeEntry();
            }
        }
        return new ZipSummary(entries, total);
    }

    /** 拒绝绝对路径、父目录和空路径 ZIP 名称。 */
    private static void requireSafeEntryName(String name) {
        String normalized = name.replace('\\', '/');
        require(!normalized.isEmpty(), "ZIP 条目名为空");
        require(!normalized.startsWith("/"), "ZIP 条目使用绝对路径");
        require(normalized.length() < 2 || !Character.isLetter(normalized.charAt(0))
                || normalized.charAt(1) != ':', "ZIP 条目使用盘符路径");
        require(!normalized.equals("..") && !normalized.startsWith("../")
                && !normalized.contains("/../"), "ZIP 条目逃逸受控根");
    }

    /** 验证实际展开量超过预算时会拒绝。 */
    private static boolean rejectsZipOverBudget(Path path) throws IOException {
        try {
            inspectZip(path, 4, 64, 40);
            return false;
        } catch (IllegalStateException expected) {
            return expected.getMessage().contains("ZIP 总展开超限");
        }
    }

    /** 创建小型 PNG fixture。 */
    private static void createImage(Path path) throws IOException {
        BufferedImage image = new BufferedImage(8, 6, BufferedImage.TYPE_INT_ARGB);
        require(ImageIO.write(image, "png", path.toFile()), "PNG writer 不可用");
    }

    /** 在完整解码前读取宽高并执行边长与像素预算。 */
    private static ImageInfo inspectImage(Path path, int maxSide, long maxPixels)
            throws IOException {
        try (ImageInputStream input = ImageIO.createImageInputStream(path.toFile())) {
            require(input != null, "无法创建图片输入流");
            Iterator<ImageReader> readers = ImageIO.getImageReaders(input);
            require(readers.hasNext(), "没有匹配的图片 reader");
            ImageReader reader = readers.next();
            try {
                reader.setInput(input, true, true);
                int width = reader.getWidth(0);
                int height = reader.getHeight(0);
                long pixels = Math.multiplyExact((long) width, (long) height);
                require(width > 0 && height > 0, "图片尺寸无效");
                require(width <= maxSide && height <= maxSide, "图片边长超限");
                require(pixels <= maxPixels, "图片像素超限");
                BufferedImage decoded = reader.read(0);
                require(decoded != null, "图片解码没有结果");
                return new ImageInfo(width, height, pixels);
            } finally {
                reader.dispose();
            }
        }
    }

    /** 验证像素预算在完整解码前拒绝图片。 */
    private static boolean rejectsImageOverBudget(Path path) throws IOException {
        try {
            inspectImage(path, 32, 10);
            return false;
        } catch (IllegalStateException expected) {
            return expected.getMessage().contains("图片像素超限");
        }
    }

    /** 用固定 chunk 和容量为二的队列桥接阻塞生产者与消费者。 */
    private static PipeResult boundedCopy(byte[] source) throws Exception {
        final ArrayBlockingQueue<Chunk> queue = new ArrayBlockingQueue<Chunk>(QUEUE_CAPACITY);
        final AtomicInteger maxQueued = new AtomicInteger();
        final AtomicInteger chunks = new AtomicInteger();
        final ByteArrayOutputStream output = new ByteArrayOutputStream();
        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            Future<?> producer = executor.submit(() -> {
                try (InputStream input = new ByteArrayInputStream(source)) {
                    byte[] buffer = new byte[CHUNK_SIZE];
                    int read;
                    while ((read = input.read(buffer)) != -1) {
                        queue.put(Chunk.data(Arrays.copyOf(buffer, read)));
                        updateMaximum(maxQueued, queue.size());
                    }
                    queue.put(Chunk.end());
                    updateMaximum(maxQueued, queue.size());
                } catch (Exception error) {
                    throw new IllegalStateException("生产者失败", error);
                }
            });
            Future<?> consumer = executor.submit(() -> {
                try {
                    while (true) {
                        Chunk chunk = queue.take();
                        if (chunk.end) {
                            return;
                        }
                        output.write(chunk.bytes);
                        chunks.incrementAndGet();
                        Thread.sleep(1L);
                    }
                } catch (Exception error) {
                    throw new IllegalStateException("消费者失败", error);
                }
            });
            producer.get(5L, TimeUnit.SECONDS);
            consumer.get(5L, TimeUnit.SECONDS);
            return new PipeResult(output.toByteArray(), chunks.get(), maxQueued.get());
        } finally {
            executor.shutdownNow();
            require(executor.awaitTermination(5L, TimeUnit.SECONDS), "管线线程未按时退出");
            output.close();
        }
    }

    /** 以无锁比较更新观测到的最大队列深度。 */
    private static void updateMaximum(AtomicInteger maximum, int candidate) {
        int current;
        do {
            current = maximum.get();
            if (candidate <= current) {
                return;
            }
        } while (!maximum.compareAndSet(current, candidate));
    }

    /** 递归删除仅由本反馈环创建的临时目录。 */
    private static void deleteTree(Path root) throws IOException {
        if (!Files.exists(root)) {
            return;
        }
        try (java.util.stream.Stream<Path> paths = Files.walk(root)) {
            Path[] ordered = paths.sorted(java.util.Comparator.reverseOrder()).toArray(Path[]::new);
            for (Path path : ordered) {
                Files.deleteIfExists(path);
            }
        }
    }

    /** 在反馈环断言失败时给出可检索原因。 */
    private static void require(boolean condition, String message) {
        if (!condition) {
            throw new IllegalStateException(message);
        }
    }

    private static final class Chunk {
        private final byte[] bytes;
        private final boolean end;

        /** 保存一个由队列唯一拥有的 chunk。 */
        private Chunk(byte[] bytes, boolean end) {
            this.bytes = bytes;
            this.end = end;
        }

        /** 创建普通数据 chunk。 */
        private static Chunk data(byte[] bytes) {
            return new Chunk(bytes, false);
        }

        /** 创建唯一的结束标记。 */
        private static Chunk end() {
            return new Chunk(new byte[0], true);
        }
    }

    private static final class ZipSummary {
        private final int entries;
        private final long totalBytes;

        /** 保存 ZIP 的实际条目数和展开字节数。 */
        private ZipSummary(int entries, long totalBytes) {
            this.entries = entries;
            this.totalBytes = totalBytes;
        }
    }

    private static final class ImageInfo {
        private final int width;
        private final int height;
        private final long pixels;

        /** 保存预算通过后的图片元数据。 */
        private ImageInfo(int width, int height, long pixels) {
            this.width = width;
            this.height = height;
            this.pixels = pixels;
        }
    }

    private static final class PipeResult {
        private final byte[] bytes;
        private final int chunks;
        private final int maxQueued;

        /** 保存有限队列管线的输出和观测指标。 */
        private PipeResult(byte[] bytes, int chunks, int maxQueued) {
            this.bytes = bytes;
            this.chunks = chunks;
            this.maxQueued = maxQueued;
        }
    }
}
```

预期输出类似：

```text
BINARY_MEDIA_PASS random=true zip=2 image=8x6 chunks=32 maxQueued=2 rejected=true
```

## 从零跟着做

1. 创建临时目录，并把完整示例保存为 `BinaryMediaBackpressureExample.java`。
2. 用当前 JDK 执行 `javac BinaryMediaBackpressureExample.java`，确认没有引入第三方依赖。
3. 连续运行两次 `java BinaryMediaBackpressureExample`，每次都应输出 `BINARY_MEDIA_PASS`。
4. 把 `inspectZip` 的总展开预算从 128 改为 40，确认只进入可预期的拒绝分支。
5. 把 `inspectImage` 的最大像素从 64 改为 10，确认在 `reader.read(0)` 之前拒绝。
6. 把队列容量改为 1 并保留慢消费者，确认复制仍完整且 `maxQueued` 不超过 1。
7. 恢复示例基线，在 Java 25 与 Java 8 各编译并运行两次，随后删除整个临时目录。

## 如何使用

1. 从请求或任务合同中列出输入字节、文件数、ZIP 展开、图片像素、chunk、队列、并发和时间预算。
2. 根据来源类型选择单一模型：阻塞流加有限队列、Servlet 非阻塞状态机或 Reactive Streams。
3. 为每个 channel、stream、reader、executor 和池化 buffer 指定唯一最终 owner。
4. 把完整响应提交前错误与提交后写失败分开建模，不能在半份二进制后追加 JSON 成功或错误对象。
5. 用 success、overflow、timeout、cancel、client disconnect 和 parser failure 覆盖全部终止路径。
6. 观测实际字节、队列深度、in-flight buffer、等待时长、取消原因、关闭和 release 次数。

## 适用与不适用场景

适用场景包括文件 Range、归档扫描、图片缩略、对象存储转发和媒体转换。它们都需要有限 chunk，但随机
访问、解压和图片 decode 还各有独立预算。不适合把整份小配置文件机械改成多线程管线；已知只有几 KB、
有严格上限且需要原子解析的数据可以有界聚合。若 decoder 或转换器无法响应取消、内存不可控，应放入
独立 worker/process，而不是在 Web 请求线程中假装流式。

:::tip
`chunkSize * queueCapacity * concurrentPipelines` 只是一个环节的主要字节下界；还要加上 decoder、压缩器、
direct memory、网络库 prefetch 和输出缓冲。具体上限必须由容量测试决定。
:::

## 当前项目补充

冻结 Phase 2 矩阵只证明项目存在文件 tail/NIO、ZIP、图像和转换 handler 候选。`LoggingWSServer`、
`NioUtil`、`CommonUtil`、`ConvertPdf`、`DateImageGenerator`、`ImageMergerUtil`、语音转换和数据上报 handler
均标记为 `observed`，不能据此宣称其 offset、展开量、像素、取消或资源生命周期已正确实现。

`LoggingFileTailReader`、`DownloadResponse`、`ConverterFactories`、`MossDownloader` 和 `PptUtil` 只承载
`JAVA-RISK-026` 的 `rejected` 教学边界：不能复制整载荷内存、可增长媒体 buffer 或慢消费者无策略等
legacy 风险。本课没有读取这些文件，也不把冻结风险改写成对当前项目的缺陷结论。

## Java 8 / Spring Boot 2.3 兼容写法

完整 JDK 示例在 Java 8 使用相同的 `FileChannel`、`ByteBuffer`、ZIP、ImageIO、有限队列和
try-with-resources 合同。Java 8 没有 Java 9 引入的 `Flow`；需要响应式流时使用项目精确锁定的
Reactive Streams/Reactor 版本，不能把 Java 25 `Flow` 示例回填旧线。Spring Framework 5.2.15 的
`StreamingResponseBody` 仍是 MVC 异步执行阻塞输出流，`DataBufferUtils` 也仍要求有界聚合和释放；
Servlet 6.1 的 `write(ByteBuffer)` 不能用于 Boot 2.3 常见 Servlet 4 环境。

## 新旧版本差异

| 对比项 | Java 25 / Spring 7 | Java 8 / Spring 5.2 | 迁移注意 |
| --- | --- | --- | --- |
| 随机访问、ZIP、ImageIO | JDK API 可用 | 核心 API 已可用 | 不要误称为 Java 25 新能力；两线都处理部分完成和关闭 |
| Reactive Streams 接口 | JDK `Flow` 自 Java 9 可用 | JDK 没有 `Flow` | 旧线使用锁定依赖的 `org.reactivestreams`，不要混包 |
| Servlet buffer 写入 | Servlet 6.1 有 `write(ByteBuffer)` | 常见为 Servlet 4 | 旧线使用其实际 `byte[]`/listener API 并重新验证状态机 |
| MVC 流式输出 | Spring 7 `StreamingResponseBody` | Spring 5.2 已有 | 两线都需要生产可用的有界 executor 与来源关闭 |
| DataBuffer | Spring 7.0.8 当前合同 | Spring 5.2.15 旧合同 | 精确核对方法签名；池化 buffer 生命周期不能弱化 |

## 易错点

:::pitfalls
### 错误：并发任务共享文件指针

**现象：** 两个区间偶发读到重叠、跳段或顺序变化的字节。  

**触发条件：** 多个任务对同一 `RandomAccessFile` 调用 `seek()` 后再读取。  

**原因：** `RandomAccessFile` 与关联 `FileChannel` 共享位置，游标修改不是任务私有状态。  

**后果：** Range 错位、协议头解析错误或分片合并损坏。  

**错误示例：**

```java
file.seek(offset);
file.read(buffer);
```

**正确写法：**

```java
channel.read(buffer, offset);
```

**影响版本：** Java 25/8。  

**验证方式：** 并发读取相邻区间并断言拼接结果与共享 position 均稳定。  

**来源：** `jdk25-random-access-file`、`jdk25-file-channel`、`jdk8-file-channel`。

### 错误：假定一次 channel 调用传完

**现象：** 大文件尾部缺失或 buffer 仍有 remaining。  

**触发条件：** 只调用一次 `read`、`write` 或 `transferTo`。  

**原因：** channel API 允许部分完成；本轮返回值才是实际进度。  

**后果：** 文件截断、校验失败或无限重试零进展。  

**错误示例：**

```java
channel.write(buffer, offset);
```

**正确写法：**

```java
while (buffer.hasRemaining()) {
    int written = channel.write(buffer, offset);
    if (written <= 0) throw new IOException("no progress");
    offset += written;
}
```

**影响版本：** Java 25/8。  

**验证方式：** 使用刻意短写的临时 channel，断言循环写完且 offset 精确推进。  

**来源：** `jdk25-file-channel`、`jdk8-file-channel`。

### 错误：信任 ZIP 声明大小或 available

**现象：** 很小的压缩输入产生超预算数据，或条目被提前判断为结束。  

**触发条件：** 用 `ZipEntry.getSize()` 或 `available()` 作为唯一限额。  

**原因：** 条目元数据可以未知，`available()` 也不是剩余字节数。  

**后果：** 内存、磁盘或 CPU 耗尽。  

**错误示例：**

```java
byte[] bytes = new byte[zip.available()];
```

**正确写法：**

```java
while ((read = zip.read(buffer)) != -1) {
    total = Math.addExact(total, read);
    if (total > maxTotalBytes) throw new IOException("expanded limit");
}
```

**影响版本：** Java 25/8。  

**验证方式：** 生成元数据未知的条目，按实际读取量在边界上一字节稳定拒绝。  

**来源：** `jdk25-zip-input-stream`、`jdk25-zip-entry`、`jdk8-zip-input-stream`。

### 错误：把 finish 当作 close

**现象：** ZIP 尾部不完整，或底层流比协议预期更早/更晚关闭。  

**触发条件：** 只 `flush()`，或调用 `finish()` 后假定底层流已关闭。  

**原因：** `finish()` 只完成压缩；`close()` 还拥有底层关闭动作。  

**后果：** 归档无法读取、描述符泄漏或后续 frame 写入关闭流。  

**错误示例：**

```java
zip.flush();
return output;
```

**正确写法：**

```java
try (ZipOutputStream zip = new ZipOutputStream(output)) {
    writeEntries(zip);
}
```

**影响版本：** Java 25/8。  

**验证方式：** 正常和异常路径后重新打开归档，并统计底层流恰好关闭一次。  

**来源：** `jdk25-deflater-output-stream`。

### 错误：ZIP 路径只做字符串前缀判断

**现象：** `../`、绝对路径或链接竞态把输出写到受控根之外。  

**触发条件：** 直接拼接 entry name，或只检查未经规范化的字符串。  

**原因：** ZIP API 不提供安全落盘保证；词法规范化也不能消除符号链接和 TOCTOU。  

**后果：** 任意文件覆盖、配置污染或权限边界突破。  

**错误示例：**

```java
Files.copy(zip, root.resolve(entry.getName()));
```

**正确写法：**

```java
Path target = root.resolve(entry.getName()).normalize();
if (!target.startsWith(root)) throw new IOException("entry escapes root");
```

**影响版本：** Java 25/8。  

**验证方式：** 覆盖 `../`、绝对路径、反斜杠、符号链接根和检查后替换。  

**来源：** `android-zip-path-traversal`；高风险环境还需更强的目录句柄或隔离协议。

### 错误：图片完整解码后才检查宽高

**现象：** 小文件在校验前占用大量 heap/direct memory。  

**触发条件：** 先 `ImageIO.read`，再读取 `BufferedImage` 尺寸。  

**原因：** 压缩字节数不等于解码像素与中间缓冲。  

**后果：** OOM、长时间 GC 或共享 Web 进程不可用。  

**错误示例：**

```java
BufferedImage image = ImageIO.read(file);
checkPixels(image.getWidth(), image.getHeight());
```

**正确写法：**

```java
long pixels = Math.multiplyExact((long) reader.getWidth(0), (long) reader.getHeight(0));
if (pixels > maxPixels) throw new IOException("pixel limit");
BufferedImage image = reader.read(0);
```

**影响版本：** Java 25/8。  

**验证方式：** 用头部声明巨大尺寸的 fixture，断言 `read(0)` 前拒绝且 reader 被 dispose。  

**来源：** `jdk25-image-reader`、`jdk25-buffered-image`、`owasp-asvs-file-handling`。

### 错误：异常与取消路径没有关闭 reader 或来源

**现象：** 临时文件不能删除，文件描述符或 decoder 状态持续增长。  

**触发条件：** 只在成功返回后调用 `close`/`dispose`。  

**原因：** stream、channel 与 reader 是不同资源，取消也不是同步清理屏障。  

**后果：** 资源泄漏、池耗尽和后续任务状态污染。  

**错误示例：**

```java
ImageReader reader = readers.next();
return reader.read(0);
```

**正确写法：**

```java
try {
    return reader.read(0);
} finally {
    reader.dispose();
}
```

**影响版本：** Java 25/8、Reactive Streams 1.0.4。  

**验证方式：** success、decode error、timeout 和 cancel 后分别统计关闭/释放恰好一次。  

**来源：** `jdk25-image-reader`、`jdk25-image-input-stream`、`reactive-streams-104`。

### 错误：StreamingResponseBody 使用无界 executor

**现象：** 慢客户端使任务和来源流持续堆积，最终耗尽线程或内存。  

**触发条件：** 把每个下载提交到无界线程/任务队列，并让 producer 不受输出速度约束。  

**原因：** MVC 异步释放 container thread，但写 `OutputStream` 的 executor 仍会阻塞。  

**后果：** 全站请求延迟、拒绝服务和取消后后台继续读。  

**错误示例：**

```java
return output -> source.transferTo(output);
```

**正确写法：**

```java
// 使用有界 executor、有限 chunk、超时和写失败后的来源关闭合同。
return output -> streamBounded(source, output, budget, cancellation);
```

**影响版本：** Spring Framework 7.0.8/5.2.15。  

**验证方式：** 慢输出、executor 满、写失败与 timeout 下请求数量、队列深度和来源关闭均有界。  

**来源：** `spring708-streaming-response-body`、`spring5215-streaming-response-body`、
`spring70-mvc-async`。

### 错误：Servlet 不可写时仍写入或修改 buffer

**现象：** 抛 `IllegalStateException`、数据重复或 buffer 位置错乱。  

**触发条件：** 非阻塞模式忽略 `isReady()`，或回调前修改待写 `ByteBuffer`。  

**原因：** socket 可写许可由容器状态机提供，应用不能自行预测。  

**后果：** 响应损坏、忙循环或异常终止。  

**错误示例：**

```java
while (buffer.hasRemaining()) output.write(buffer);
```

**正确写法：**

```java
if (output.isReady()) {
    output.write(buffer);
}
```

**影响版本：** Servlet 6.1；`write(ByteBuffer)` 不适用于常见 Servlet 4 legacy 线。  

**验证方式：** fake output 在 ready/not-ready 间切换，断言不可写期间无写入且 buffer 状态不变。  

**来源：** `servlet61-output-stream`、`servlet61-write-listener`。

### 错误：Reactor 使用无界 demand 与 BUFFER

**现象：** 慢消费者前的 pending 元素和内存持续增长。  

**触发条件：** 默认订阅入口请求 `Long.MAX_VALUE`，同时 `create` 使用默认无界 `BUFFER`。

**原因：** demand 被关闭上限，无法放慢的来源又把所有差值堆在内存。  

**后果：** OOM、长尾延迟和取消清理成本激增。  

**错误示例：**

```java
Flux.create(sink -> source.start(sink::next)).subscribe(this::consume);
```

**正确写法：**

```java
// 按数据可丢失语义选择有限请求、拒绝、latest、drop 或外部持久队列。
subscribeWithBoundedDemand(publisher, maxElementBytes, prefetch);
```

**影响版本：** Reactor Core 3.8.6；旧版需按实际锁定版本复核。  

**验证方式：** 慢消费者压测中记录 request、prefetch、最大元素字节和 pending 总量。  

**来源：** `reactor386-subscribe-demand`、`reactor386-programmatic-create`、`jdk25-flow`。

### 错误：DataBuffer 泄漏或重复释放

**现象：** direct memory 持续增长，或出现已释放 buffer 访问错误。  

**触发条件：** filter/cancel/error 丢弃 buffer 未 release，或多个分支都宣称最终 owner。  

**原因：** 池化 buffer 是引用计数资源，转发、保留与消费需要显式所有权。  

**后果：** native memory 泄漏、数据损坏或进程退出。  

**错误示例：**

```java
flux.filter(this::accept).subscribe(this::consume);
```

**正确写法：**

```java
flux.filter(this::accept)
    .doOnDiscard(DataBuffer.class, DataBufferUtils::release)
    .subscribe(this::consumeAndRelease);
```

**影响版本：** Spring Framework 7.0.8/5.2.15，具体操作符按锁定 Reactor 版本复核。  

**验证方式：** complete/error/cancel/filter 各跑一次，断言每个 owned buffer 最终引用归零且无 double release。  

**来源：** `spring70-data-buffer-codec`、`spring708-data-buffer-utils`、
`spring708-pooled-data-buffer`、`reactor386-cleanup`。

### 错误：Range 绕过授权或无限碎片化

**现象：** 知道路径即可下载，或一个请求用大量重叠小 range 放大 CPU 和 header。  

**触发条件：** 直接接受路径/对象 key，或把 `ResourceRegion` 当成完整安全协议。  

**原因：** Range 只描述表示区间，不提供业务授权、对象版本或碎片预算。  

**后果：** 越权读取、资源放大和响应状态错误。  

**错误示例：**

```java
return new ResourceRegion(resource, start, count);
```

**正确写法：**

```java
Resource resource = authorizeAndResolve(fileId, actor, version);
RangePlan plan = validateRanges(requestedRanges, resource.contentLength(), maxRanges);
```

**影响版本：** RFC 9110、Spring Framework 7.0.8。  

**验证方式：** 覆盖未授权、单 range、多个 range、重叠碎片、越界 416 和写失败关闭。  

**来源：** `rfc9110-range`、`spring70-mvc-range`、`spring708-resource-region`。
:::

## 安全与性能边界

ZIP 条目数、展开字节、压缩比、图片边长/像素/帧数、chunk、prefetch、队列、Range、并发和 timeout
没有通用安全常量。生产值必须来自允许格式、租户公平性、最大并发、heap/direct memory、临时磁盘和
压测。外部 decoder/转换器若无法证明取消和内存上限，应进入隔离 worker/process。不得记录原始内容、
绝对路径或租户敏感元数据；日志只保留任务 ID、预算类别、实际计数、终止原因和关闭/release 结果。

性能结论必须测量：分别记录吞吐、首字节、p95/p99、队列等待、GC、direct memory、磁盘 I/O 和取消
回收时长。direct buffer、`transferTo`、压缩级别或更大 chunk 都不是无条件更快；用 JFR/JMC 与真实
存储/网络负载验证，不能用一次本机运行写成生产结论。

## 如何验证

1. 从当前 Markdown 重新提取 `BinaryMediaBackpressureExample`，在 Java 25 与 Java 8 各编译运行两次。
2. 对位置读写加入短读/短写 fixture，验证所有循环推进且共享 position 不变。
3. 对 ZIP 覆盖未知 size、路径逃逸、条目/单项/总展开/时间超限和关闭失败。
4. 对图片覆盖无 reader、异常尺寸、乘法溢出、decode error、timeout 与 reader dispose。
5. 对阻塞管线覆盖慢消费者、队列满、producer error、consumer error、timeout 与 cancel。
6. 对 MVC/Servlet/WebFlux 分别用精确框架版本验证 executor admission、ready 信号、demand、discard 和
   pooled buffer release；不能用 JDK 示例替代框架反馈环。
7. 对 Range 覆盖 200、单范围 206、多范围、416、过多/重叠碎片、授权失败和响应提交后写失败。
8. 所有临时源码、class、fixture、截图和日志只放 `/tmp`，成功后删除并确认目标不存在。

:::exercise
### 练习：设计一个有界媒体处理合同

**要求：** 为“上传 ZIP，其中每个条目是图片，处理后按 Range 下载”列出输入、条目、展开、像素、
chunk、队列、并发、时间、取消和 owner 预算；选择 MVC、Servlet 非阻塞或 WebFlux 中的一种，不得混用。

**验收：** 能说明慢消费者在哪里阻塞/拒绝，超限在哪一步发生，响应提交后如何观测失败，以及每个
stream、reader、executor 和 pooled buffer 最终由谁关闭或释放。
:::

## 本节小结

- 随机访问首先是位置与部分完成合同；绝对位置读写避免共享游标争用，但不自动保证并发安全或持久化。
- ZIP 按实际展开量限额，图片在完整 decode 前执行像素预算；两者都不能只信压缩字节或声明元数据。
- 有限 chunk、有限队列、Servlet ready 与 Reactive Streams demand 是不同层次的流量控制。
- MVC 流式输出仍可能阻塞 executor；`Flux<DataBuffer>` 仍要求 byte budget 与显式引用计数 owner。
- error、timeout、cancel 和客户端断开必须停止上游并收束资源，不能假设框架自动完成全部清理。
- Range 是局部表示协议，不替代每次请求授权、对象版本、碎片预算和来源关闭。
