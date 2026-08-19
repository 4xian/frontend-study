# I/O、文件系统、资源所有权与关闭研究记录

## 冻结课程合同

- `courseId`：`backend.java.learn.basics.io-files-and-resource-ownership`
- `title`：I/O、文件系统、资源所有权与关闭
- `purpose / collection / level / depth`：`learn / basics / beginner / lesson`
- `sequence`：`260`
- `prerequisites`：`[backend.java.learn.basics.date-time-and-time-zones]`
- `related`：`[]`
- `sourceCapabilityIds`：
  `[JAVA-STDLIB-013, JAVA-LANG-014, JAVA-STDLIB-014, JAVA-STDLIB-015, JAVA-RISK-027]`
- `origin`：`[project-observed, risk-correction]`
- `selectionReason`：上传下载、文档处理和网络客户端都依赖流与关闭责任；风险证据只用于异常路径纠错。
- `projectEvidenceCount`：`327 / 28 / 44 / 20 / 15`
- `modernBaseline`：`Java 25 LTS`
- `legacyBaseline`：`Java 8 / Spring Boot 2.3.12.RELEASE`，只作冻结项目兼容补充
- Phase 2 冻结状态：`researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`
- `snapshotId`：`dzzz-app-20260803-179e722831ab`
- `analysisId`：`dzzz-app-analysis-20260803-958d37cf1be1`

本课只建立字节/字符流、Path/Files 和可关闭资源所有权的基础合同。异步 I/O、文件锁、内存映射、
网络协议、上传框架、对象序列化和大文件性能调优留给后续课程。

## 核验基线

| 项目 | 核验结果 |
| --- | --- |
| 核验日期 | 2026-08-15 |
| 现代主线 | Java 25 LTS |
| legacy 补充 | Java 8；核心 I/O、NIO.2 和 try-with-resources 均可用 |
| 发现方式 | Tavily 当前无可调用入口，按仓库回退规则直接核对 Oracle JLS、API 与 Dev.java 页面 |
| 最终证据 | Java 25/9/8 JLS、java.io、AutoCloseable、Path/Files API 与 Dev.java |
| 项目证据 | 只读取冻结矩阵与 inventory，不读取、运行或修改 `dzzz-app` 当前源码 |
| 验证边界 | Java 25/8 共同反馈环；短读、显式 Charset、Files.walk、关闭顺序与 suppressed failure |

## 一手来源与结论

### 1. 先区分字节和字符

- [Java 25 java.io](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/package-summary.html)
  与 [Java 8 java.io](https://docs.oracle.com/javase/8/docs/api/java/io/package-summary.html) 都把
  `InputStream`/`OutputStream` 定义为字节流，把 `Reader`/`Writer` 定义为字符流。
- 二进制协议、压缩内容、图片和任意文件载荷保持 `byte` 语义；文本边界才通过明确 Charset 转成字符。
- `InputStreamReader` 和 `OutputStreamWriter` 是字节与字符之间的桥接器。外部数据必须显式给出 Charset，
  不能把平台默认字符集当作文件协议。
- Reader/Writer 处理字符，不等于自动知道文本格式。换行、CSV、JSON 和协议字段仍由上层格式合同决定。

### 2. read 是循环合同，不承诺一次填满缓冲区

- Java 25 与 Java 8 的
  [InputStream](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/InputStream.html)
  都说明 `read(byte[])` 返回实际读取数；到 EOF 返回 `-1`，一次调用可能只得到缓冲区的一部分。
- 消费方必须循环到 `-1`，并只处理 `buffer[0..count)`。忽略 count 会把上一次残留或未初始化区域写入结果。
- `available()` 只是“不阻塞即可读取或跳过的字节数估计”。两版 Javadoc 都明确禁止用它分配保存整个流的
  缓冲区；很多实现会返回 0，即使后续仍有数据。
- 小型且已知上限的文件可使用 `Files.readAllBytes`。不受信任或可能很大的输入仍应流式读取并在上层设置
  大小限制；API 能把数据读完，不等于内存风险自动消失。

### 3. 装饰器带来功能，也传播关闭责任

- `BufferedInputStream`、`BufferedReader` 等包装器减少底层小粒度调用；缓冲是 I/O 结构，不是所有权证明。
- Java 25 与 Java 8 的
  [FilterInputStream](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/FilterInputStream.html)
  `close()` 会调用被包装输入流的 `close()`。把底层流交给这类包装器后，通常由最外层包装器统一关闭。
- 若方法只接收调用方传入的流并同步读取，默认不应擅自关闭；若方法创建或明确接管资源，则必须在合同中
  说明并负责关闭。返回仍需调用方使用的流，就是显式所有权转移。
- “谁创建谁关闭”只是常见起点，最终以 API 合同为准。框架托管的 request/response 流可能由容器拥有，
  不能机械套用本地文件规则。

### 4. try-with-resources 固化正常与异常路径清理

- [JLS 25 14.20.3](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20.3)
  与 [JLS 8 14.20.3](https://docs.oracle.com/javase/specs/jls/se8/html/jls-14.html#jls-14.20.3) 都规定资源在
  try block 结束后自动关闭，多个资源按初始化的反向顺序关闭。
- 初始化、try body 或较晚资源关闭先抛出的异常保持为主异常；后续关闭失败通过
  `Throwable.getSuppressed()` 保留。一个资源 close 失败也不会阻止其余资源继续关闭。
- [AutoCloseable](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/AutoCloseable.html)
  是 try-with-resources 的资源合同。它的 `close()` 不保证幂等；`Closeable.close()` 则要求重复调用无效果。
- 不要用手写 finally 覆盖主异常，也不要捕获并丢弃 close failure。只有当前边界真正能够恢复时才处理，
  否则让异常链和 suppressed 信息继续传播。

### 5. Java 25 可复用 effectively-final 变量，Java 8 必须在资源头声明

- JLS 25 的 resource grammar 允许 `VariableAccess`，因此已初始化且 final/effectively-final 的变量可直接写进
  `try (input)`。
- JLS 8 的 resource grammar 只允许在资源头声明局部变量，因此兼容写法是
  `try (InputStream owned = input) { ... }`，并明确这会把传入资源的关闭责任转给当前方法。
- [JLS 9 14.20.3](https://docs.oracle.com/javase/specs/jls/se9/html/jls-14.html#jls-14.20.3)
  已允许 final 或 effectively-final 变量直接出现在资源头。本课共同反馈仍使用 Java 8 可编译的声明式
  写法。

### 6. Path 表达路径，Files 执行文件系统操作

- Java 25 与 Java 8 的 [Path](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Path.html)
  表示文件系统中的层级路径；`resolve` 组合路径，`normalize` 只做词法消解，不访问文件系统。
- `toAbsolutePath()` 只转为绝对形式；需要解析实际文件与符号链接时使用 `toRealPath()`，并接受它要求目标
  存在且可能抛 IOException 的合同。
- Java 25 与 Java 8 的 [Files](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Files.html)
  负责打开流、创建目录、复制、移动、删除、读取属性和遍历文件树。
- `Files.newInputStream(path)` 默认按 READ 打开；`Files.newOutputStream(path)` 无选项时等价于 CREATE、
  TRUNCATE_EXISTING 和 WRITE。默认输出会截断已有文件，追加必须显式使用 `APPEND`。
- 处理用户提供的相对路径时，`root.resolve(input).normalize().startsWith(root)` 只能建立词法边界；若允许
  符号链接，还必须根据实际文件系统和业务策略使用 real path、禁用链接或建立沙箱，不能宣称 normalize
  单独解决路径逃逸。

### 7. 返回 Stream 的文件 API 也可能是可关闭资源

- Java 25 `Files.list`/`walk` 的 API note 要求 try-with-resources 或等价控制结构，确保打开目录及时关闭。
- Java 8 `Files.walk` 明确说明返回 Stream 封装一个或多个 DirectoryStream；需要及时释放文件系统资源时
  应使用 try-with-resources。
- `Stream` 在集合计算中通常不需要关闭，但由 I/O API 返回的 Stream 可能绑定目录、socket 或其他资源。
  是否关闭由创建它的 API 合同决定，不能只看静态类型。

### 8. Dev.java 的课程分层与本课边界一致

- [Dev.java Java I/O](https://dev.java/learn/java-io/) 先区分文件、Path、字符流与字节流，再进入目录、
  文件元数据以及文本/二进制读写。
- 本课沿用“概念和所有权先于便利方法”的顺序，不展开 FileChannel、异步通道、WatchService、压缩包或
  对象序列化。

## 课程内容决策

1. 先判断数据是二进制还是文本；文本桥接必须显式 Charset。
2. 所有 InputStream 示例都循环读取到 `-1` 并使用实际 count，不用 `available()` 推断总长度。
3. 资源在创建或接管边界进入 try-with-resources；多层包装只关闭最外层所有者。
4. 用可控 AutoCloseable 反馈验证反向关闭顺序和 suppressed exception，不只写文字说明。
5. Path/Files 示例固定工作目录，显式说明默认 open option 与 normalize/real path 的边界。
6. `Files.walk` 本身进入 try-with-resources，证明 Stream 静态类型不能替代资源合同。
7. Java 25/8 共享反馈使用资源头声明；Java 9+ 的 effectively-final 简写只放版本差异。

## 项目证据边界

以下 5 项只证明冻结矩阵中的 I/O、try-with-resources、关闭合同、NIO 与风险候选存在。四项能力证据
保持 `observed`，一项风险只作为 `corrected` 教学边界；本批不读取当前源码，也不判断具体调用点是否
已经正确关闭。

| 能力 | 文件 | SHA-256 | 使用方式 |
| --- | --- | --- | --- |
| 流与 try-with-resources | `dzzz-app/src/main/java/com/tdh/bdzz/cache/WrongWordDictionaryLoader.java` | `584b1598854df0fab6ef48dea115b05818cad022477cba9afc0424f6d6285adc` | observed |
| 流与关闭 | `dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/LoggingFileTailReader.java` | `30ba45d30d77f1e0306aefb17c403eaba8018688c1b0f707443e0f3f0451da7b` | observed |
| 输入流边界 | `dzzz-app/src/main/java/com/tdh/bdzz/util/CustomMultipartFile.java` | `5ed33cd6c1759a52d711e5bc2619e122acdbe0713dbf93db4dd2e07d1e97fbb2` | observed |
| Path/Files/NIO | `dzzz-app/src/main/java/com/tdh/bdzz/storage/NioUtil.java` | `8fa7b38f18524ea50d8bd54707071f90da08a60028a5232bf490b039baec2b40` | observed |
| 异常路径清理风险 | `dzzz-app/src/main/java/com/tdh/bdzz/filter/AccessFilter.java` | `47d5393b00dfdba1a1fee3e03f3972e95bbe591e5d01f58f7549dae567d13a40` | corrected |

`JAVA-STDLIB-013`、`JAVA-LANG-014`、`JAVA-STDLIB-014`、`JAVA-STDLIB-015` 和 `JAVA-RISK-027` 的
冻结计数分别是 327、28、44、20、15。它们来自不同能力和风险集合，存在文件重叠，不能相加成唯一
文件数，也不能把 15 个风险候选直接判定为已确认缺陷。

## 易错点取证

| 易错点 | 官方依据 | 反馈要求 |
| --- | --- | --- |
| 单次 read 当成读满 | InputStream read 合同 | 人工短读流每次最多返回 2 字节，循环仍完整还原 |
| 用 available 分配整个输入 | InputStream available 警告 | 课程代码不依赖 available，静态检查确认 |
| 文本使用默认字符集 | java.io 字符桥接 + 字符串课程 | UTF-8 中文文本在 Java 25/8 相同往返 |
| 手写 close 覆盖主异常 | JLS try-with-resources 翻译 | 主异常保持 body，两个 close failure 进入 suppressed |
| 忽略关闭顺序 | JLS 反向关闭规则 | 两资源初始化 A/B，关闭顺序固定为 BA |
| Files.walk 未关闭 | Files.walk API note | try-with-resources 计数并正常退出 |
| 输出默认选项误截断 | Files.newOutputStream 合同 | 课程明确默认 CREATE/TRUNCATE/WRITE，追加需显式 APPEND |
| normalize 被误当安全沙箱 | Path normalize/toRealPath 合同 | 明确词法边界与符号链接边界，不做过度承诺 |

## 验证设计

- Java 25 与 Java 8 编译运行同一份源码。
- 在容器 `/tmp` 的 `mktemp` 目录写入 UTF-8 文本和二进制文件。
- 自定义 FilterInputStream 每次最多返回 2 字节，断言循环累计 3 次并完整还原 5 字节。
- 用 Files.newBufferedWriter/newBufferedReader 显式传 StandardCharsets.UTF_8。
- 用 Files.walk 的 try-with-resources 断言目录加两个文件共 3 个 Path。
- 用两个会抛异常的 AutoCloseable 断言关闭顺序 BA、body 为主异常、close-B/close-A 为 suppressed。
- shell 与容器都只用 `find -depth -delete` 清理临时目录。

## 排除项

- 不展开 FileChannel、AsynchronousFileChannel、memory-mapped file、文件锁和 WatchService。
- 不展开 ZIP/JAR、对象序列化、socket、HTTP multipart 或 Spring Resource 抽象。
- 不给出无测量的大文件 buffer 大小或性能结论。
- 不声称 normalize 单独阻止符号链接逃逸。
- 不读取、运行或修改当前 `dzzz-app` 源码。
