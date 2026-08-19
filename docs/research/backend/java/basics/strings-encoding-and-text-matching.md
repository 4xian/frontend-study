# 字符串、字符编码、正则与 Base64 研究记录

## 冻结课程合同

- `courseId`：`backend.java.learn.basics.strings-encoding-and-text-matching`
- `title`：字符串、字符编码、正则与 Base64
- `purpose / collection / level / depth`：`learn / basics / beginner / lesson`
- `sequence`：`220`
- `estimatedMinutes`：`90`
- `prerequisites`：`[backend.java.learn.basics.annotations-and-metadata]`
- `related`：`[]`
- `sourceCapabilityIds`：
  `[JAVA-STDLIB-002, JAVA-STDLIB-003, JAVA-STDLIB-004, JAVA-STDLIB-022]`
- `origin`：`[project-observed]`
- `selectionReason`：HTTP、文件、日志和外部协议都依赖明确的文本与字节边界。
- `projectEvidenceCount`：`JAVA-STDLIB-002: 5`、`JAVA-STDLIB-003: 11`、
  `JAVA-STDLIB-004: 8`、`JAVA-STDLIB-022: 8`
- `modernBaseline`：`Java 25 LTS`
- `legacyBaseline`：`Java 8`，只作冻结项目兼容补充
- Phase 2 冻结状态：`researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`
- `snapshotId`：`dzzz-app-20260803-179e722831ab`
- `analysisId`：`dzzz-app-analysis-20260803-958d37cf1be1`

本课只建立四条基础边界：`String` 的不可变值与 Unicode 计数、字符和字节之间的显式编码、正则的
匹配与转义合同、Base64 三种标准变体。字符串国际化排序、完整字素簇、复杂正则性能、密码学、文件
资源所有权、HTTP 编码和安全输入过滤属于后续课程。

四组项目证据可能指向同一文件，不能把 `5 + 11 + 8 + 8` 相加成独立文件总数。冻结矩阵的
`project-observed-capability` 只证明项目中存在对应场景，不证明项目实现是现代推荐写法。

## 核验基线

| 项目 | 核验结果 |
| --- | --- |
| 核验日期 | 2026-08-15 |
| 现代主线 | Java 25 LTS；Java SE 25 参考实现页面提供经 JCP 批准的 RI binary build 25+36，Oracle 支持路线将 Java 25 列为 LTS |
| legacy 补充 | Java 8；Spring Boot 2.3.12.RELEASE 只作冻结项目背景，不参与标准库合同 |
| 发现方式 | Tavily 只用于发现 `jdk.java.net`、Oracle 与 RFC Editor 直接页面；搜索摘要不作最终依据 |
| 最终证据 | Java SE 25 RI、JLS 25/8 Chapter 3、Java SE 25/8 `String`、`java.nio.charset`、`Pattern`、`Matcher`、`Base64` API 与 RFC 4648 |
| 项目证据 | 只读取冻结课程矩阵、能力矩阵、风险 inventory 和文件 inventory；不读取、运行或修改 `dzzz-app` |
| 验证设计 | 同一份 Java 8 兼容源码分别由固定 Java 25、Java 8 工具链编译运行；临时资产只放 `/tmp` |

Java 25 与 Java 8 在本课采用的 UTF-16/code point、显式 `Charset`、`Pattern`/`Matcher` 和 Java
`Base64` 三变体核心合同上兼容。需要单独处理的主要差异是默认字符集：Java 8 通常随宿主环境，
Java 25 默认为 UTF-8，但仍可能以实现特定方式改变；跨进程和持久化协议仍必须显式指定字符集。

## 官方来源卡与直接证据

以下页面均在 `2026-08-15` 直接核验；没有把社区文章、搜索摘要或 AI 输出写成最终依据。

| ID | 直接来源 | sourceType | 适用版本 | claims |
| --- | --- | --- | --- | --- |
| `java-se-25-ri` | [Java SE 25 Reference Implementations](https://jdk.java.net/java-se-ri/25) | `official-reference` | Java SE 25 | Java SE 25 RI 已通过 JCP 批准，页面提供 RI binary build 25+36。 |
| `oracle-java-roadmap` | [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) | `official-reference` | 2026-08-15 页面状态 | Oracle 将 Java SE 25 列为 LTS。 |
| `jls25-lexical` | [JLS 25 Chapter 3](https://docs.oracle.com/javase/specs/jls/se25/html/jls-3.html) | `specification` | Java 25 | Unicode 输入、escape、字符串字面量、编译期常量拼接与字面量 intern 合同。 |
| `jls8-lexical` | [JLS 8 Chapter 3](https://docs.oracle.com/javase/specs/jls/se8/html/jls-3.html) | `specification` | Java 8 | 本课采用的字符串字面量、escape 与 intern 核心规则在 Java 8 已成立。 |
| `api25-string` | [String - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html) | `api-doc` | Java 25 | `String` 是不可变 UTF-16 序列；索引和 `length()` 基于 `char` code unit，补充字符占两个位置；另有 code point API。 |
| `api8-string` | [String - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/lang/String.html) | `api-doc` | Java 8 | 同一 UTF-16、surrogate pair、code unit/code point 边界以及 `String.format(Locale, ...)`。 |
| `api25-charset` | [Charset - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/charset/Charset.html) | `api-doc` | Java 25 | `Charset` 是字符与字节的命名映射；默认字符集为 UTF-8，除非以实现特定方式改变；便捷 `encode/decode` 会替换 malformed/unmappable 输入。 |
| `api8-charset` | [Charset - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/nio/charset/Charset.html) | `api-doc` | Java 8 | Java 8 已有相同的显式映射与便捷方法替换合同；默认字符集通常取决于启动环境。 |
| `api25-standard-charsets` | [StandardCharsets - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/charset/StandardCharsets.html) | `api-doc` | Java 25 | 提供标准字符集常量；本课跨版本示例使用 `UTF_8`。 |
| `api8-standard-charsets` | [StandardCharsets - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/nio/charset/StandardCharsets.html) | `api-doc` | Java 8 | Java 8 已提供 `UTF_8`、`US_ASCII`、`ISO_8859_1` 与 UTF-16 常量。 |
| `api25-decoder` | [CharsetDecoder - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/charset/CharsetDecoder.html) | `api-doc` | Java 25 | malformed 与 unmappable 默认动作为 `REPORT`，可显式改为 `IGNORE` 或 `REPLACE`。 |
| `api8-decoder` | [CharsetDecoder - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/nio/charset/CharsetDecoder.html) | `api-doc` | Java 8 | Java 8 已有相同三种错误动作和默认 `REPORT` 合同。 |
| `api25-pattern` | [Pattern - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/regex/Pattern.html) | `api-doc` | Java 25 | 正则语法、Java 字符串与正则的双层 escape、Unicode 属性、`Pattern.quote` 和编译错误合同。 |
| `api8-pattern` | [Pattern - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/util/regex/Pattern.html) | `api-doc` | Java 8 | 本课采用的双层 escape、字符类、分组、量词和 quoting 已存在。 |
| `api25-matcher` | [Matcher - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/regex/Matcher.html) | `api-doc` | Java 25 | `matches` 匹配整个 region，`find` 搜索下一个子序列；替换文本中的 `$` 和反斜线有特殊含义。 |
| `api8-matcher` | [Matcher - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/util/regex/Matcher.html) | `api-doc` | Java 8 | 同一匹配边界和 `Matcher.quoteReplacement` 字面替换合同。 |
| `api25-base64` | [Base64 - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Base64.html) | `api-doc` | Java 25 | basic、URL-safe、MIME 三种 encoder/decoder；basic/URL decoder 拒绝字母表外字符，MIME decoder 忽略其他字符。 |
| `api8-base64` | [Base64 - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/util/Base64.html) | `api-doc` | Java 8 | Java 8 已提供本课使用的三种变体及相同基本合同。 |
| `api25-base64-encoder` | [Base64.Encoder - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Base64.Encoder.html) | `api-doc` | Java 25 | encoder 默认在需要时添加 `=` padding；`withoutPadding()` 返回不在末尾添加 padding 的等价 encoder。 |
| `api8-base64-encoder` | [Base64.Encoder - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/util/Base64.Encoder.html) | `api-doc` | Java 8 | Java 8 已有相同的默认 padding 与 `withoutPadding()` 合同。 |
| `api25-base64-decoder` | [Base64.Decoder - Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Base64.Decoder.html) | `api-doc` | Java 25 | decoder 接受 `=`；最后编码单元没有 padding 时，正确的 2 或 3 个 Base64 字符也可解码。 |
| `api8-base64-decoder` | [Base64.Decoder - Java SE 8](https://docs.oracle.com/javase/8/docs/api/java/util/Base64.Decoder.html) | `api-doc` | Java 8 | Java 8 已有相同的末尾 padding 接收合同。 |
| `rfc4648-padding` | [RFC 4648 Section 3.2](https://www.rfc-editor.org/rfc/rfc4648.html#section-3.2) | `specification` | RFC 4648 | 除非引用该规范的上层协议明确另有规定，实现必须在编码数据末尾包含适当 padding。 |

## 现代主线结论

### `String` 是不可变 UTF-16 值，不是“字符数量”数组

`String` 创建后值不变；拼接、替换、大小写转换等操作返回新字符串。不可变性允许字面量和 intern
结果共享，但业务代码应以 `equals` 比较内容，不能用 `==` 猜测对象是否来自字符串池。

Java API 中的索引、`length()`、`charAt()` 和 `substring()` 边界以 UTF-16 `char` code unit 计算。
BMP 内 code point 通常占一个 `char`，补充字符由 high/low surrogate pair 表示，占两个索引位置：

```java
String text = "A\uD83D\uDE00B";
int units = text.length();
int points = text.codePointCount(0, text.length());
```

这里 `units == 4`、`points == 3`。遍历 Unicode code point 时使用 `codePoints()`、`codePointAt()` 与
`Character.charCount()`，不能假定一个 `char` 就是一个完整字符。本课不把 code point 再误写成用户
看到的完整字素簇；该主题留给国际化课程。

字符串字面量和编译期常量表达式会按 JLS intern；运行时拼接不自动保证同一对象。显式
`String.intern()` 影响共享与内存模型，不应作为普通业务去重或内容比较手段。

### 机器合同的格式化要显式固定 Locale

`String.format(String, Object...)` 使用默认 FORMAT locale，可能让小数点、分组符号等随环境变化。
给日志字段、缓存键或外部协议生成稳定文本时使用 `String.format(Locale.ROOT, ...)`，或使用更直接的
类型化格式器。Java 8 没有后续加入的实例方法 `formatted(...)`；共同示例保持 `String.format`。

### 字符和字节之间必须显式声明 Charset

`String`/`char` 是字符侧，文件、网络、签名和 Base64 的输入输出常是 byte 侧；编码把字符映射为
字节，解码把字节映射回字符。边界必须成对约定同一个 charset：

```java
byte[] encoded = text.getBytes(java.nio.charset.StandardCharsets.UTF_8);
String decoded = new String(encoded, java.nio.charset.StandardCharsets.UTF_8);
```

显式 `StandardCharsets.UTF_8` 在 Java 8 和 Java 25 都可用，也不会因为机器 locale 或
`file.encoding` 改变。Java 25 默认 UTF-8 不构成省略协议字段的理由，因为旧进程、兼容模式和外部
数据仍可能使用不同编码。

### replacement 便捷路径与严格检测是不同合同

`new String(bytes, charset)` 和 `Charset.decode(...)` 等便捷路径会用替代内容处理 malformed 或
unmappable 输入，可能把损坏字节变成 `U+FFFD` 后继续执行。需要拒绝损坏协议、签名输入或持久化
数据时，直接配置 decoder：

```java
/**
 * 使用 UTF-8 严格解码，拒绝损坏和不可映射输入。
 */
static String decodeUtf8(byte[] input) throws java.nio.charset.CharacterCodingException {
    return java.nio.charset.StandardCharsets.UTF_8
            .newDecoder()
            .onMalformedInput(java.nio.charset.CodingErrorAction.REPORT)
            .onUnmappableCharacter(java.nio.charset.CodingErrorAction.REPORT)
            .decode(java.nio.ByteBuffer.wrap(input))
            .toString();
}
```

`IGNORE` 会丢弃错误输入，`REPLACE` 会改变内容；二者只有在上层协议明确允许且结果可观测时才可
选择。不能把“没有抛异常”当作原始字节已被无损解码。

### 正则先区分 whole match、search 与 literal

- `matches()` 要求整个 matcher region 匹配；适合完整字段格式校验。
- `find()` 搜索下一个匹配子序列，可循环提取多段文本。
- `lookingAt()` 从 region 起点匹配，但不要求消费到结尾。
- 用户或外部系统提供的普通文本不是正则；作为 literal pattern 时先用 `Pattern.quote(text)`。

Java 源码先解释字符串 escape，`Pattern` 再解释正则 escape，所以正则 `\d+` 在 Java 字符串中必须
写成 `"\\d+"`。同理，替换文本中的 `$1` 可能引用捕获组，反斜线也有转义含义；外部 replacement
要按普通文本处理时使用 `Matcher.quoteReplacement(replacement)`。

`PatternSyntaxException` 表示正则本身非法。动态正则必须在明确边界编译并返回可定位错误，不能捕获
后假装“没有匹配”。Unicode 属性和 `UNICODE_CHARACTER_CLASS` 应按真实文本合同选择；`
\\d` 是否只想接收 ASCII 数字不能靠读者猜测，协议若要求 ASCII，应直接写出 `[0-9]`。

### Base64 是字节表示，不是加密或字符编码

Base64 把任意 bytes 表示为受限字符集合，解码可还原 bytes；它不提供机密性、完整性或身份认证。
文本必须先按协议 charset 变为 bytes，再 Base64；解码后也要按同一 charset 还原。

| 变体 | Java API | 合同 |
| --- | --- | --- |
| basic | `getEncoder()` / `getDecoder()` | RFC 4648 Table 1 字母表，不自动换行，decoder 拒绝字母表外字符 |
| URL-safe | `getUrlEncoder()` / `getUrlDecoder()` | RFC 4648 Table 2，使用 URL/file-name safe 字母表，不自动换行 |
| MIME | `getMimeEncoder()` / `getMimeDecoder()` | 输出每行不超过 76 字符并用 CRLF 分隔；decoder 忽略字母表外字符 |

发送方和接收方必须显式选择同一变体。RFC 4648 默认要求添加适当 padding，只有引用它的上层协议
明确另有规定时才能省略。Java 的默认 encoder 会在需要时添加 `=`；协议明确采用无 padding 时，
调用 `withoutPadding()` 表达该合同，不能靠字符串截断猜测末尾形态。

Java decoder 会接受带 `=` 的末尾，也会接受最后编码单元中正确的 2 或 3 个未填充 Base64 字符。
这是 API 的输入接收合同，不等于任意外部协议都允许省略 padding；课程必须分别验证“Java 可解码”
和“对端协议允许”。

## 当前项目补充

以下证据只来自冻结矩阵和 inventory。`observed` 只证明场景存在；`corrected` 只记录冻结风险要求的
修正方向。文件 `auditStatus: unreviewed` 表示本研究没有把自动抽取提升成人工源码复审，也没有读取
`dzzz-app` 当前文件。

| 文件 | 稳定符号 | 冻结 SHA-256 | 状态 | 课程边界 |
| --- | --- | --- | --- | --- |
| `dzzz-app/src/main/java/com/tdh/bdzz/constant/TsblTextCacheKeyBuilder.java` | `com.tdh.bdzz.constant.TsblTextCacheKeyBuilder` | `4f9ed57001765f26788227842d74ac30d949ffd8f9454b857aca918a19fcf73a` | `observed` | `JAVA-STDLIB-002` 的字符串场景代表；不把缓存键格式或 intern 使用提升为通用推荐。 |
| `dzzz-app/src/main/java/com/tdh/bdzz/util/HMacUtils.java` | `com.tdh.bdzz.util.HMacUtils` | `31b38d415b7c6840507d29ecc49db732d957d20d0450b56dca5fe53ab9355031` | `observed` | `JAVA-STDLIB-003` 的字符/字节边界代表；HMAC 算法、密钥来源与协议不在本课评价。 |
| `dzzz-app/src/main/java/com/tdh/bdzz/util/ValidatorUtil.java` | `com.tdh.bdzz.util.ValidatorUtil` | `cfa8e9ed4432ba28db4780eb6374ca4ec4d69acb69d79a76dec51703848e012b` | `observed` | `JAVA-STDLIB-004` 的正则场景代表；不把项目私有校验语义当作 `Pattern` 合同。 |
| `dzzz-app/src/main/java/com/tdh/bdzz/util/DateImageGenerator.java` | `com.tdh.bdzz.util.DateImageGenerator` | `a4353a807cec77c9c02aeef830b4c5064f4adc94e8565e66b9214b593de61dd3` | `observed` | `JAVA-STDLIB-022` 的 Base64 场景代表；图片、文件与异常处理留给对应课程。 |
| `dzzz-app/src/main/java/com/tdh/bdzz/util/AESUtils.java` | `com.tdh.bdzz.util.AESUtils` | `8e5aeabb5f9034b211fa02937c1a6907fc02f41355fb1baca1d2e581e26cae0b` | `corrected` | 冻结 `RISK-0115` 把该文件列入默认字符集风险；本课只修正为显式 `StandardCharsets`，不复制或评价其密码学设计。 |

最后一行来自冻结 `JAVA-RISK-041` 下的补充 `project-risk-evidence-only`，用于限定现代正确写法；它不
加入本课正式 `sourceCapabilityIds`，也不改变本课 `origin: [project-observed]`。

## Java 8 / Spring Boot 2.3 兼容写法

- Java 8 已提供 `StandardCharsets.UTF_8`、`CharsetDecoder`、`Pattern`、`Matcher` 和
  `java.util.Base64`，正向反馈环不需要第三方库。
- Java 8 默认 charset 在 JVM 启动时决定，通常依赖 OS locale；不能用本机一次运行推导生产环境。
- Java 25 虽默认 UTF-8，课程仍在每个跨字节边界显式传入 charset，以便协议自说明并兼容旧数据。
- Java 8 没有 `String.formatted(...)`；共同示例用 `String.format(Locale.ROOT, ...)`。
- Spring Boot 2.3.12.RELEASE 不改变上述 Java 标准库合同；框架 HTTP message conversion 不在本课
  代替显式协议设计。

## 新旧版本差异

| 对比项 | Java 25 现代线 | `dzzz-app` Java 8 补充线 | 课程处理 |
| --- | --- | --- | --- |
| UTF-16 code unit / code point | 核心合同 | 核心合同一致 | 同一 surrogate pair 样例双版本运行 |
| 默认 charset | 默认 UTF-8，仍可实现特定覆盖 | 启动环境和 OS locale 相关 | 不依赖默认值，统一显式 `UTF_8` |
| decoder 错误动作 | `REPORT` / `REPLACE` / `IGNORE` | 合同一致 | 严格边界显式 `REPORT` |
| 正则匹配与 quoting | 本课核心 API 可用 | 本课核心 API 已可用 | 同一 `Pattern`/`Matcher` 源码验证 |
| `String.formatted` | 可用 | 不可用 | 共同主线用 `String.format(Locale.ROOT, ...)` |
| Base64 变体与 padding | 三变体、`withoutPadding()` 和未填充末尾解码可用 | 合同一致 | 同一 bytes 验证变体、默认 padding 与明确的无 padding round-trip |

## 易错点取证

| 现象 | 原因 | 后果 | 修正 | 双版本验证 |
| --- | --- | --- | --- | --- |
| `text.length()` 被写成“字符数” | `length` 统计 UTF-16 code unit | 补充字符被算两次，索引可能拆开 surrogate pair | 按需求使用 code point API | `A😀B` 断言 `4 units / 3 points` |
| `getBytes()` / `new String(bytes)` 不传 charset | 隐式依赖 JVM default charset | Java 8 与 Java 25 或不同机器结果漂移 | 使用 `StandardCharsets.UTF_8` 或协议 charset | 两版显式 UTF-8 round-trip 相同 |
| 损坏 UTF-8 被静默替换 | 便捷解码路径使用 replacement | 数据已改变但流程继续 | 安全边界用 decoder + `REPORT` | 非法字节两版均以 `MalformedInputException` 失败 |
| 正则 `\d+` 在 Java 中只写一个反斜线 | Java 字符串和 regex 各解释一次 escape | 源码编译失败或正则语义错误 | Java 字符串写 `"\\d+"` | 错误 escape 两版均编译失败 |
| 用 `matches()` 搜索子串 | `matches` 要求整个 region 匹配 | 合法子串被误报为不匹配 | 搜索用 `find()`，完整校验才用 `matches()` | 同一输入断言 find 次数与 whole match |
| 外部文本直接拼入 pattern/replacement | regex 元字符、`$` 和反斜线被解释 | 匹配范围扩大或替换失败 | `Pattern.quote`、`Matcher.quoteReplacement` | 两版验证 `a.b` 与 `$1` 保持 literal |
| basic、URL、MIME decoder 混用 | 三种字母表和容错规则不同 | 非法输入被拒绝或被 MIME decoder 忽略 | 协议显式固定变体 | URL token 交给 basic decoder 两版均失败 |
| 把 Java 可解码的无 padding 输入当成协议默认 | decoder 接受正确的未填充末尾单元，但 RFC 4648 默认要求 padding | 本地 round-trip 成功，对端仍可能按协议拒绝 | 默认保留 padding；仅在上层协议明确允许时调用 `withoutPadding()` | 两版验证默认 token 含 `=`、无 padding token 不含 `=` 且均可解码 |
| 把 Base64 当加密 | Base64 只改变 bytes 的表示 | 内容可直接恢复，没有保密或防篡改能力 | 安全目标交给后续密码学协议 | round-trip 证明原 bytes 可恢复 |

## 可重复验证设计

验证资产全部写入 `/tmp` 下的 `mktemp -d` 目录，仓库不保留 Java 源码、class、fixture 或测试文件。
研究阶段只定义反馈环与预期，不把尚未执行的结果写成 PASS。

| 角色 | 固定镜像 | 预期工具版本 |
| --- | --- | --- |
| modern | `eclipse-temurin:25-jdk@sha256:12e44624adee6808a36d962717e1656e0afeeeff5a100f9cb00e0136513558f0` | `javac 25.0.3` |
| legacy | `eclipse-temurin:8-jdk@sha256:c8b86f2c0a9bd6cc1b7fabc5d1a097501a166eea7cad3b2764e90e96178bea9b` | `javac 1.8.0_492` |

### 正向统一反馈环

两个固定 JDK 编译、运行同一 `TextFeedback.java`：

```java
import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Base64;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 验证字符串、编码、正则和 Base64 的共同核心合同。
 */
public final class TextFeedback {
    /**
     * 使用 UTF-8 严格解码输入。
     */
    static String decodeUtf8(byte[] input) throws CharacterCodingException {
        return StandardCharsets.UTF_8
                .newDecoder()
                .onMalformedInput(CodingErrorAction.REPORT)
                .onUnmappableCharacter(CodingErrorAction.REPORT)
                .decode(ByteBuffer.wrap(input))
                .toString();
    }

    /**
     * 统计文本中的键值赋值片段。
     */
    static int countAssignments(String input) {
        Matcher matcher = Pattern.compile("[a-z]+=[0-9]+").matcher(input);
        int count = 0;
        while (matcher.find()) {
            count++;
        }
        return count;
    }

    /**
     * 输出可跨版本逐字比较的验证结果。
     */
    public static void main(String[] args) throws Exception {
        String text = "A\uD83D\uDE00B";
        byte[] utf8 = text.getBytes(StandardCharsets.UTF_8);
        byte[] binary = {(byte) 0xfb, (byte) 0xff};
        String basic = Base64.getEncoder().encodeToString(binary);
        String url = Base64.getUrlEncoder().encodeToString(binary);
        String unpadded = Base64.getUrlEncoder().withoutPadding().encodeToString(binary);
        String mime = Base64.getMimeEncoder().encodeToString(new byte[60]);
        boolean literalPattern = Pattern.compile(Pattern.quote("a.b")).matcher("a.b").matches();
        String literalReplacement = Pattern.compile("x")
                .matcher("x")
                .replaceAll(Matcher.quoteReplacement("$1"));

        System.out.println(
                String.format(
                        Locale.ROOT,
                        "units=%d|points=%d|utf8=%s|find=%d|quote=%s|replace=%s|basic=%s|url=%s|unpadded=%s|unpaddedRoundTrip=%s|mime=%s",
                        text.length(),
                        text.codePointCount(0, text.length()),
                        text.equals(decodeUtf8(utf8)),
                        countAssignments("a=1 b=20"),
                        literalPattern,
                        literalReplacement,
                        basic,
                        url,
                        unpadded,
                        Arrays.equals(binary, Base64.getUrlDecoder().decode(unpadded)),
                        mime.contains("\r\n")
                                && Arrays.equals(new byte[60], Base64.getMimeDecoder().decode(mime))));
    }
}
```

两个版本都预期退出 `0` 并逐字输出：

```text
units=4|points=3|utf8=true|find=2|quote=true|replace=$1|basic=+/8=|url=-_8=|unpadded=-_8|unpaddedRoundTrip=true|mime=true
```

### 失败反馈环

只保留三个最小临时负例：

1. malformed UTF-8：decoder 显式 `REPORT` 后解码 `{(byte) 0xc3, 0x28}`，Java 25/8 均预期运行
   非零，异常类型包含 `MalformedInputException`。
2. 双层 escape：在临时源码方法中写 `Pattern.compile("\d+")`，Java 25/8 均预期编译非零并包含
   `illegal escape character`；修正源码写 `Pattern.compile("\\d+")`。
3. 变体混用：把 URL-safe token `-_8=` 交给 `Base64.getDecoder()`，Java 25/8 均预期运行非零并
   包含 `IllegalArgumentException`。

每个临时类的方法上方都写规范中文 Javadoc。执行器分别记录 `javac`、`java` 退出码和必要诊断，
最后使用 `find "$work_dir" -depth -delete` 清理临时目录；不得使用尚未执行的预期替代 signoff PASS。

## 被排除或尚未证实的说法

- 不把 UTF-16 code point 计数写成完整字素簇、视觉字符宽度或国际化分词结论。
- 不把 Java 25 默认 UTF-8 写成所有外部数据都必然是 UTF-8。
- 不把 `String.intern()` 作为业务去重、性能优化或内容比较的默认方案。
- 不把正则当作任意语言解析器，也不在本课承诺复杂 pattern 的性能或拒绝服务安全性。
- 不把项目私有 `ValidatorUtil` 语义提升为 Java 正则规范。
- 不把 Base64 当作加密、签名、压缩或输入合法性证明。
- 不评价 `AESUtils` 的密码学正确性；该文件只支持默认字符集 corrected 边界。
- 不读取或修改 `dzzz-app` 来重新解释冻结 inventory。

## 发布前自检

- [x] 冻结 ID、序号、预计时间、前置、来源能力和证据计数与 Phase A 路线一致。
- [x] 现代 Java 25 主线与 Java 8 项目补充分开。
- [x] String/Unicode、Charset 错误策略、regex 转义、Base64 变体与 padding 均绑定官方直接页面。
- [x] 4 个 observed 能力与 1 个 corrected 补充证据绑定路径、稳定符号和冻结 SHA。
- [x] corrected 风险没有加入正式 `sourceCapabilityIds`，也没有复制为推荐实现。
- [x] Java 25/8 正向、malformed、escape、Base64 变体与 padding 反馈环可复跑，且未伪报执行结果。
- [x] 所有方法示例上方都有规范中文注释。
- [x] 不包含真实业务数据、内部地址或凭据。

## Stop Boundary

本研究只授权 B-14 `strings-encoding-and-text-matching` 的研究记录；课程实现、注册、测试、浏览器
验证、复审与独立 signoff 由主流程继续闭环。B-14 完整 Gate 关闭前不得读取或启动下一课，也不进入
Phase C、中级、高级、Reference、项目实战或其他后端技术。
