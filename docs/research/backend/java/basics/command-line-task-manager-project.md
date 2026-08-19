# 基础实战：命令行任务管理器研究记录

## 冻结课程合同

- `batch`：`B-21`
- `courseId`：`backend.java.learn.basics.command-line-task-manager-project`
- `title`：基础实战：命令行任务管理器
- `nature`：阶段项目、新增
- `purpose / collection / level / depth`：`learn / basics / beginner / lesson`
- `sequence`：`290`
- `estimatedMinutes`：`3 × 60`
- `prerequisites`：`[backend.java.learn.basics.first-automated-test-with-junit]`
- `related`：`[]`
- `sourceCapabilityIds`：`[]`；本项目不依赖 `dzzz-app` 能力矩阵
- `origin`：`[necessary-practice]`
- `selectionReason`：把 B-01～B-20 已学的命令行、集合、状态、文件、Maven 和 JUnit 串成三个可
  独立运行的最小反馈环。
- `projectEvidence`：`[]`；不读取或复用 `dzzz-app` 业务源码
- `modernBaseline`：`Java 25 LTS / Maven 3.9.16 / JUnit 6.1.3 / Maven Surefire 3.5.6`
- `legacyBaseline`：`Java 8 / Maven 3.9.16 / JUnit 5.14.4 / Maven Surefire 3.5.6`
- Phase B 路线：`B-21`；B-20 关闭后才允许启动。本研究完成不等于 B-21 发布或关闭。
- 冻结停止边界：B-21 研究稿完成后只等待正文、三个 checkpoint、工程 Gate、浏览器验收、独立
  复审和 signoff；不进入 I-01 或 Phase C。

本课只做一个小型命令行任务管理器：内存中维护任务及状态，使用显式 UTF-8 的纯文本文件保存，
再用 JUnit 验证输入输出边界、文件往返和失败恢复。项目不引入 Spring、数据库、JSON 库、Mockito
或 TDD 方法论；不能把三个 60 分钟 checkpoint 压成一个 180 分钟的大段步骤。

## 核验基线与方法

| 项目 | 核验结果 |
| --- | --- |
| 核验日期 | 2026-08-15 |
| 现代 Java | Oracle 支持路线将 Java 25 列为 LTS；Java SE 25 API 页面可达 |
| Java 8 兼容线 | 使用 Java 8 仍存在的 `java.io`、`java.nio.file`、集合和枚举 API；JUnit 5.14.4 运行时要求 Java 8+ |
| JUnit | Java 25 主线使用 JUnit 6.1.3；Java 8 单独使用 JUnit 5.14.4，不能混用同一依赖图 |
| Maven | 延续 B-19 的 Maven 3.9.16；Surefire 3.5.6 连接 Maven `test` 阶段 |
| 发现方式 | 先用 Tavily 找候选，再逐页回到 Oracle、Dev.java、JUnit 和 Apache Maven 官方直接页面核验 |
| 项目证据 | `projectEvidence: []`；本项目是独立基础实战，不读取 `dzzz-app` 源码 |
| 研究边界 | 只冻结一手资料、课程合同、三个 checkpoint、反馈环和排除项；不实施正文、manifest、track、loader 或 fixture |

Java 25 只作为运行主线，不强行使用 Java 9 以后才有的语法。项目的共享源码采用 Java 8 可编译
的最小 API；正文可以把 Java 25 的 `Files.readString` / `Files.writeString` 作为便利写法说明，
但兼容实现固定使用带 `Charset` 的 `Files.readAllLines` / `Files.write`。

## 官方页面可达性

以下结果为 2026-08-15 对直接 URL 使用 `curl -L --fail --silent --show-error` 的跟随重定向结果。
表中 31 个官方 URL 均为 HTTP `200`；搜索摘要、博客和社区问答没有作为课程证据。

| 官方页面 | 适用版本 | HTTP |
| --- | --- | ---: |
| [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) | Java 25 LTS / Java 8 兼容线 | 200 |
| [Dev.java Java launcher](https://dev.java/learn/jvm/tools/core/java) | Java 25 命令行启动与 `main` 参数 | 200 |
| [Dev.java jdb](https://dev.java/learn/jvm/tool/troubleshooting/jdb) | Java 25 命令行调试 | 200 |
| [Path (Java SE 25)](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Path.html) | Java 25 | 200 |
| [Path (Java SE 8)](https://docs.oracle.com/javase/8/docs/api/java/nio/file/Path.html) | Java 8 | 200 |
| [Files (Java SE 25)](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Files.html) | Java 25 | 200 |
| [Files (Java SE 8)](https://docs.oracle.com/javase/8/docs/api/java/nio/file/Files.html) | Java 8 | 200 |
| [BufferedReader (Java SE 25)](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/BufferedReader.html) | Java 25 | 200 |
| [BufferedReader (Java SE 8)](https://docs.oracle.com/javase/8/docs/api/java/io/BufferedReader.html) | Java 8 | 200 |
| [InputStreamReader (Java SE 25)](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/InputStreamReader.html) | Java 25 | 200 |
| [InputStreamReader (Java SE 8)](https://docs.oracle.com/javase/8/docs/api/java/io/InputStreamReader.html) | Java 8 | 200 |
| [PrintWriter (Java SE 25)](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/PrintWriter.html) | Java 25 | 200 |
| [PrintWriter (Java SE 8)](https://docs.oracle.com/javase/8/docs/api/java/io/PrintWriter.html) | Java 8 | 200 |
| [StandardCharsets (Java SE 25)](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/charset/StandardCharsets.html) | Java 25 | 200 |
| [StandardCharsets (Java SE 8)](https://docs.oracle.com/javase/8/docs/api/java/nio/charset/StandardCharsets.html) | Java 8 | 200 |
| [LinkedHashMap (Java SE 25)](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/LinkedHashMap.html) | Java 25 | 200 |
| [LinkedHashMap (Java SE 8)](https://docs.oracle.com/javase/8/docs/api/java/util/LinkedHashMap.html) | Java 8 | 200 |
| [Enum (Java SE 25)](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Enum.html) | Java 25；Java 8 具有同一核心合同 | 200 |
| [Optional (Java SE 25)](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Optional.html) | Java 25；Java 8 具有同一核心合同 | 200 |
| [JUnit 6.1.3 Overview](https://docs.junit.org/6.1.3/overview.html) | JUnit 6.1.3 / Java 17+ | 200 |
| [JUnit 6.1.3 Release Notes](https://docs.junit.org/6.1.3/release-notes.html) | JUnit 6.1.3 | 200 |
| [JUnit 5.14.4 Overview](https://docs.junit.org/5.14.4/overview.html) | JUnit 5.14.4 / Java 8+ | 200 |
| [JUnit Assertions](https://docs.junit.org/6.1.3/writing-tests/assertions.html) | JUnit Jupiter 6.1.3 | 200 |
| [JUnit Exception Handling](https://docs.junit.org/6.1.3/writing-tests/exception-handling.html) | JUnit Jupiter 6.1.3 | 200 |
| [JUnit `@TempDir` API](https://docs.junit.org/6.1.3/api/org.junit.jupiter.api/org/junit/jupiter/api/io/TempDir.html) | JUnit Jupiter 6.1.3 | 200 |
| [JUnit 5.14.4 `@TempDir` API](https://docs.junit.org/5.14.4/api/org.junit.jupiter.api/org/junit/jupiter/api/io/TempDir.html) | JUnit Jupiter 5.14.4 | 200 |
| [JUnit Build Support](https://docs.junit.org/6.1.3/running-tests/build-support.html) | JUnit 6.1.3 / Maven | 200 |
| [Maven Surefire 3.5.6](https://maven.apache.org/surefire-archives/surefire-3.5.6/maven-surefire-plugin/) | Surefire 3.5.6 | 200 |
| [Surefire Running a Single Test](https://maven.apache.org/surefire-archives/surefire-3.5.6/maven-surefire-plugin/examples/single-test.html) | Surefire 3.5.6 | 200 |
| [Maven Compiler Plugin 3.14.1](https://maven.apache.org/plugins-archives/maven-compiler-plugin-3.14.1/) | Compiler Plugin 3.14.1 | 200 |
| [Maven 3.9.16 Release Notes](https://maven.apache.org/docs/3.9.16/release-notes.html) | Maven 3.9.16 | 200 |

## 一手来源与关键结论

### 1. 启动参数与交互命令是两层输入

- [Dev.java Java launcher](https://dev.java/learn/jvm/tools/core/java) 说明启动类名之后的参数会传给
  `main` 方法；因此 `Main` 只负责读取 `--file <path>` 等启动配置，不能把整段交互输入误当成
  `args`。
- 交互层按行读取：`BufferedReader` 把字符输入变成一行一行的字符串，`InputStreamReader` 负责把
  `System.in` 的字节解码成字符。输入边界显式使用 `StandardCharsets.UTF_8`，不依赖平台默认编码。
- 命令解析先 `trim`，再取第一个空白前的命令名，把剩余文本作为一个参数；这样 `add  买  牛奶` 不会
  因为连续空格被错误拆成多个标题。`done`、`delete` 的 ID 再单独用 `Integer.parseInt` 解析，格式
  错误只产生当前命令错误，不结束整个程序。
- `PrintWriter` 只负责输出提示、结果和可恢复错误；正式边界由 `TaskManagerApp(Reader, PrintWriter,
  TaskStore)` 注入，`main` 负责把 `System.in/out` 组装进去。测试可以用 `StringReader` / `StringWriter`，
  不必启动真实终端。

### 2. 内存模型使用有限状态和稳定迭代顺序

- `TaskStatus` 只保留 `TODO`、`DONE` 两个枚举值。枚举表示有限集合，不把状态写成可拼写错误的任意字符串。
- `LinkedHashMap<Integer, Task>` 用任务 ID 做键，并按插入顺序列出任务；这让 `list` 的输出在同一输入下
  可重复，测试不必依赖哈希表偶然顺序。
- `Task` 的标题不能为空，且禁止包含制表符或换行，因为本项目的持久化格式一行一个任务、字段用 TAB
  分隔。标题中的普通中文和空格都允许。
- `TaskManager` 只改变公开行为：新增分配递增 ID，`done` 把 `TODO` 转为 `DONE`，`delete` 删除现有
  ID，`list todo` / `list done` 按状态筛选，未知 ID 返回可判断的错误。`Optional` 官方 API 把它定义为
  可能包含也可能不包含非空值的容器；本项目只用它表达按 ID 查询可能没有结果。测试不检查私有字段，
  不把实现结构当成合同。
- B-15 已讲过集合迭代合同，B-09 已讲过枚举；B-21 只把它们组合成项目模型，不重复讲集合分类或
  继承层级。

### 3. 文件协议必须显式 UTF-8，并隔离 Java 25 便利方法

- `Path` 只表示路径；`Files` 才执行读取、写入和移动等文件系统操作。路径由启动参数得到，测试用
  `@TempDir` 或 `/tmp` 临时目录，不写入仓库。
- Java 25 的 `Files.readString` / `Files.writeString` 自 Java 11 才存在；`readString` 默认 UTF-8，
  `writeString` 默认 UTF-8，但两者都适合小文件，不是大文件流式方案。
- Java 8 没有 `readString` / `writeString`，使用 `Files.readAllLines(path, StandardCharsets.UTF_8)`
  和 `Files.write(path, lines, StandardCharsets.UTF_8)`。为了让同一项目可在两条线编译，最小正式实现
  固定使用这两个 Java 8 兼容重载；正文再标注 Java 25 的等价便利写法。
- 文本格式冻结为每行 `id<TAB>status<TAB>title`，例如：

  ```text
  1\tTODO\t买牛奶
  2\tDONE\t阅读 Java 文档
  ```

  不使用 JSON、对象序列化或第三方解析器。加载时先把所有行解析到临时列表，全部合法后才替换内存状态；
  某一行损坏时报告行号并保留当前内存，不静默跳过坏数据。
- `Files.write` 默认相当于 `CREATE`、`TRUNCATE_EXISTING`、`WRITE`；官方 API 也警告 I/O 失败可能发生
  在文件已截断或只写入部分内容之后。因此本项目不声称提供原子提交：保存失败必须报告并允许用户修正
  路径后重试，原子替换、文件锁和崩溃一致性留给后续课程。

### 4. JUnit 只验证公开行为，调试只追踪可观察边界

- JUnit 6.1.3 运行时要求 Java 17+；Java 25 主线使用它。JUnit 5.14.4 运行时要求 Java 8+，作为
  独立兼容线。两条线使用同一份 Java 8 可编译业务源码，但不能把 JUnit 6 依赖放进 Java 8 POM。
- `junit-jupiter` 和 Surefire 3.5.6 负责把 `mvn test` 接到 Jupiter；B-20 已讲过 `@Test`、AAA、基础
  断言和默认实例生命周期，B-21 只把断言用在任务、文件和错误恢复合同上。
- Maven 3.9.16 是运行基线，Compiler Plugin 3.14.1 显式读取 `maven.compiler.release=8`，Surefire
  3.5.6 显式运行 Jupiter；不能只写属性却省略对应 plugin 声明。
- `@TempDir` 为每个测试提供临时 `Path`，默认在测试作用域结束时递归清理；它适合文件往返测试，不能
  作为“测试之间共享文件”的隐式状态。
- 测试错误使用 `assertThrows` 限定在真正的 Act 调用；未知命令、错误 ID、损坏行和缺失文件分别验证
  错误消息与后续可恢复行为。不要捕获 `Exception` 后只断言“程序没崩”。
- 调试反馈使用 Dev.java 的 `jdb` 或 IDE 调试器：在 `CommandParser.parse`、`FileTaskStore.load` 和
  `TaskManagerApp.run` 设断点，检查当前行、解析后的 token、行号和异常 cause；修正后必须重新运行
  同一个失败命令和同一条 JUnit 测试。

## 三个独立 checkpoint 的最小项目方案

三个 checkpoint 共 180 分钟，每个都能在自己的阶段运行、观察结果并恢复到正确基线。后一个阶段只增加
能力，不要求学习者先完成不可运行的“大骨架”。

### Checkpoint 1：内存模型与命令（60 分钟）

**目标：** 不读文件也能通过命令创建、列出、按状态筛选、完成和删除任务。

**最小类：** `TaskStatus`、`Task`、`Command`、`CommandParser`、`TaskManager`、`TaskManagerApp`、
`MemoryTaskStore`、`Main`。

**命令合同：**

| 输入 | 成功结果 | 失败结果 |
| --- | --- | --- |
| `add <title>` | 分配递增 ID，输出新任务 | 缺少标题、标题含 TAB/换行时提示修正 |
| `list [todo\|done]` | 按插入顺序列出全部任务，或只列出指定状态 | 无任务时输出空列表提示；其他状态报错后继续 |
| `done <id>` | 状态变为 `DONE` | ID 格式错误或不存在时保留原状态 |
| `delete <id>` | 删除任务 | ID 格式错误或不存在时不改变其他任务 |
| `help` | 输出有限命令表 | 不接受额外参数 |
| `exit` | 结束读取循环 | EOF 也按正常结束处理 |

**独立运行：** 使用 Java 25 或 Java 8 编译 `src/main/java`，把一段固定命令通过标准输入喂给
`Main`；不需要文件存在，不需要 JUnit 才能看到结果。

**验收：** `add 买牛奶`、`add  阅读 Java`、`done 1`、`list todo`、`list done`、`delete 2`、`list`
得到稳定输出；再输入 `list other`、`what`、`done x`、`done 99`，程序继续读下一条命令。

### Checkpoint 2：UTF-8 文件往返（60 分钟）

**目标：** 把内存任务保存为纯文本，再从同一文件恢复，确认中文、状态和 ID 不变。

**最小新增类：** `FileTaskStore` 和 `TaskLineCodec`；`TaskStore` 接口只暴露 `load(Path)`、
`save(Path, List<Task>)` 所需的最小行为。

**文件边界：**

1. 保存前把任务转换成完整行列表，并显式传 `StandardCharsets.UTF_8`。
2. 加载时逐行检查三列、ID、枚举状态和标题限制。
3. 任意行失败时抛出带行号的领域异常；调用方报告错误并保留当前内存。
4. 保存失败时报告 `IOException`，不把失败误报为成功；用户修正路径或权限后可再次执行 `save`。

**独立运行：** 启动 `Main --file /tmp/tasks-b21.txt`，完成一组 `add` / `done` / `save`，结束后重新
启动并执行 `load` / `list`。再用 UTF-8 编辑器把一行改坏，确认 `load` 报行号、程序仍可执行 `list`，
修正文件后重试能够恢复。

**验收：** 保存文件的字节按 UTF-8 解码后包含中文标题；第二次启动的 `list` 与第一次保存前一致；
损坏行、缺失文件和没有写权限分别进入可观察失败路径。

### Checkpoint 3：JUnit 与调试（60 分钟）

**目标：** 用最少的 JUnit 测试固定公开行为，并能从失败输出定位到解析或文件边界。

**最小测试集：**

1. `add` 分配递增 ID，`done` 只改变目标任务，`delete` 不影响其他任务，`list` 能按状态筛选。
2. `CommandParser` 对空标题、未知命令、非法筛选状态和非数字 ID 返回可读错误。
3. `FileTaskStore` 对中文标题和两种状态完成 UTF-8 往返。
4. `FileTaskStore` 遇到损坏行时返回行号，并且现有内存任务保持不变。
5. `TaskManagerApp` 遇到未知命令后继续读取下一条命令；输入 EOF 正常结束。
6. 注入一个会抛 `IOException` 的 `TaskStore`，验证 `save` 失败可见且随后仍可执行内存命令。

**独立运行：** Java 25 运行 `mvn -B -ntp test`（JUnit 6.1.3、Surefire 3.5.6）；Java 8 使用独立
POM 运行同一测试源码（JUnit 5.14.4）。开发中可用 `mvn -Dtest=TaskManagerTest test` 定向运行，
最终仍需整套测试。

**调试反馈：** 先故意让一条损坏行的列数判断失败，记录非零测试结果和 stack trace；在 `jdb` 中于
`TaskLineCodec.decode` 断点，检查 `lineNumber`、`fields` 和 `statusText`；修正后复跑同一测试，
再连续运行整套测试确认没有共享临时目录或静态状态。

## 正反馈环与负反馈环

| 环节 | 正反馈（应看到） | 负反馈（必须能看到并恢复） |
| --- | --- | --- |
| CP1 命令 | 命令脚本得到稳定任务列表，退出码为 0 | 未知命令、坏 ID 只输出错误并继续；EOF 正常结束 |
| CP2 文件 | 保存后重启，中文标题、状态和 ID 完整恢复 | 损坏行报告文件与行号；缺失/不可写路径报告 `IOException`，修正后可重试 |
| CP3 测试 | `mvn test` 的 tests 大于 0，failures/errors/skipped 为 0；Java 25/8 各自通过 | 故意改错 expected 或损坏行断言时 exit 非零；报告显示 expected/actual 或异常 cause，修正后同命令恢复为 0 |
| 调试 | 断点能看到命令 token、任务 ID 和文件行号 | 不猜原因；先复现同一输入，再依据 stack trace 和变量值修改，最后复跑原反馈环 |

所有课程实施期 fixture、POM、报告和故意失败副本都放在 `/tmp` 的 `mktemp` 目录；验收后删除临时根目录，
仓库不得留下测试、fixture、报告、截图或浏览器产物。

## 易错点取证矩阵

| 易错点 | 触发条件与后果 | 正确处理 | 反馈要求 |
| --- | --- | --- | --- |
| 把启动参数和交互命令混为一层 | `args` 被当成所有用户输入，或命令脚本无法复现 | `main` 只解析 `--file` 等启动配置；交互层逐行读取 | 启动参数和 stdin 各有独立最小复现 |
| `Scanner.nextInt()` 后直接 `nextLine()` | 残留换行导致空标题或跳过输入 | 本课统一按行读字符串，再显式解析 ID | `done 1` 后下一条 `add` 标题不能丢失 |
| 依赖平台默认字符集 | 中文在不同主机变成乱码 | 输入、文件读写均显式 `StandardCharsets.UTF_8` | Java 25/8 以中文标题完成同一字节往返 |
| Java 8 误用 `Files.readString` | 编译失败，兼容线无法运行 | 共享代码使用 `readAllLines` / `write(..., UTF_8)`；Java 25 便利方法只做差异说明 | `javac --release 8` 或真实 Java 8 编译通过 |
| 用 `split(" ")` 解析标题 | 连续空格制造空 token，标题被截断 | 取首个空白前命令，剩余部分保留为标题 | `add  阅读 Java` 输出完整标题 |
| 允许标题含 TAB/换行 | 文件三列格式无法可靠恢复 | 创建任务时拒绝 TAB/换行，错误可修正 | 负例不写入文件，下一条命令仍可执行 |
| 逐行加载时直接修改现有 map | 中途坏行会留下半套状态 | 先解析临时列表，全部成功后一次替换 | 损坏文件后 `list` 仍显示加载前状态 |
| 把 `Files.write` 当作原子保存 | I/O 失败可能已截断或部分写入 | 报告失败、允许重试；不宣称原子或崩溃一致性 | 模拟保存异常时输出非成功结果，并能继续内存操作 |
| 静默吞掉 IOException | 用户看到“保存成功”但文件不可用 | 把失败映射为明确错误；保留 cause | 失败测试必须检查错误类型或稳定消息 |
| JUnit 6 在 Java 8 启动 | 运行时版本不满足，不能仅靠 `--release 8` | Java 25/JUnit 6.1.3 与 Java 8/JUnit 5.14.4 分开 POM | 两条真实 JDK 反馈环各自通过 |
| `@TempDir` 或 static 状态跨测试共享 | 单测单独通过，整套运行顺序相关 | 每个测试独立准备；依赖 JUnit 默认 per-method，不共享 static 文件 | 定向、整套、连续两次运行计数和结果一致 |
| 只看 `BUILD SUCCESS` | 测试为 0 或错误路径未覆盖仍会假绿 | 检查 exit code、tests、failures/errors/skipped 和 Surefire XML | 测试数必须大于 0，故意失败必须非零 |
| 断言包住错误的代码 | 准备阶段抛同类异常也会误通过 | `assertThrows` 只包住真正的 Act 调用 | 将错误移动到准备阶段时测试应失败 |

## 明确排除项

- Spring、Spring Boot、Servlet、Controller、数据库、Redis、事务、认证和部署；这些属于后续阶段。
- JSON、Jackson、对象序列化、第三方命令行解析库和持久化框架；本课使用 TAB 分隔的教学格式。
- Mockito、mock/stub/spy、参数化测试、动态测试、集成测试、Testcontainers、WireMock 和 Maven Failsafe。
- TDD、红绿重构、测试金字塔、覆盖率门槛、并行测试、重试策略和性能基准；本课只建立可复现反馈环。
- 原子文件提交、文件锁、并发访问、崩溃恢复、文件历史、加密、权限沙箱和大文件流式优化。
- 命令历史、自动补全、多用户、网络同步、GUI、彩色终端和复杂查询；不扩张为产品级任务系统。
- Java 25 preview、record/sealed pattern、模块化部署和 JUnit 6 高级扩展；共享项目保持 Java 8 可编译。

## 正式正文来源卡计划

正式课程 frontmatter 只登记正文实际使用的直接页面，实施时必须删除未被正文引用的来源；以下是本
研究冻结的候选卡。

| source ID | 页面 | sourceType | appliesTo | 核心 claims |
| --- | --- | --- | --- | --- |
| `oracle-java-roadmap` | Oracle Java SE Support Roadmap | `official-reference` | Java 25 / Java 8 | Java 25 LTS 与 Java 8 兼容线定位 |
| `dev-java-launcher` | Dev.java Java launcher | `official-reference` | Java 25 | 类名后的启动参数传入 `main` |
| `dev-java-jdb` | Dev.java jdb | `official-reference` | Java 25 | 断点、变量和 stack trace 的命令行调试入口 |
| `jdk25-path` / `jdk8-path` | Oracle Path API | `api-doc` | Java 25 / Java 8 | Path 表示路径，交由 Files 操作 |
| `jdk25-files` / `jdk8-files` | Oracle Files API | `api-doc` | Java 25 / Java 8 | UTF-8 读写、readAllLines/write、截断与 I/O 异常合同 |
| `jdk25-buffered-reader` / `jdk8-buffered-reader` | Oracle BufferedReader API | `api-doc` | Java 25 / Java 8 | `readLine` 行读取与关闭边界 |
| `jdk25-inputstream-reader` / `jdk8-inputstream-reader` | Oracle InputStreamReader API | `api-doc` | Java 25 / Java 8 | 字节到字符的 Charset 解码边界 |
| `jdk25-print-writer` / `jdk8-print-writer` | Oracle PrintWriter API | `api-doc` | Java 25 / Java 8 | 注入式文本输出边界 |
| `jdk25-standard-charsets` / `jdk8-standard-charsets` | Oracle StandardCharsets API | `api-doc` | Java 25 / Java 8 | `UTF_8` 常量 |
| `jdk25-linked-hash-map` / `jdk8-linked-hash-map` | Oracle LinkedHashMap API | `api-doc` | Java 25 / Java 8 | 插入顺序迭代 |
| `jdk25-enum` | Oracle Enum API | `api-doc` | Java 25；Java 8 同合同 | 有限状态建模 |
| `jdk25-optional` | Oracle Optional API | `api-doc` | Java 25；Java 8 同合同 | 显式表达可能不存在的查询结果 |
| `junit-6-overview` | JUnit 6.1.3 Overview | `official-reference` | JUnit 6.1.3 | Java 17+ 运行边界与 Jupiter 组成 |
| `junit-6-release-notes` | JUnit 6.1.3 Release Notes | `release-note` | JUnit 6.1.3 | 当前稳定补丁版本信息 |
| `junit-5-java8` | JUnit 5.14.4 Overview | `official-reference` | JUnit 5.14.4 | Java 8+ 运行边界 |
| `junit-assertions` | JUnit Assertions | `official-reference` | JUnit Jupiter 6.1.3 | `assertEquals`、布尔断言和 `assertThrows` |
| `junit-exceptions` | JUnit Exception Handling | `official-reference` | JUnit Jupiter 6.1.3 | 未捕获异常失败与预期异常断言 |
| `junit-6-temp-dir` / `junit-5-temp-dir` | JUnit `@TempDir` API | `api-doc` | JUnit 6.1.3 / 5.14.4 | 临时目录作用域和默认清理 |
| `junit-maven-support` | JUnit Build Support | `official-reference` | JUnit 6.1.3 / Maven | Maven Surefire 与 Jupiter 连接 |
| `surefire-3-5-6` | Maven Surefire 3.5.6 | `official-reference` | Surefire 3.5.6 | `test` 阶段和报告 |
| `surefire-single-test` | Surefire Running a Single Test | `official-reference` | Surefire 3.5.6 | `-Dtest` 定向反馈 |
| `maven-compiler-3-14-1` | Maven Compiler Plugin 3.14.1 | `official-reference` | Compiler Plugin 3.14.1 | 读取 `maven.compiler.release` 并编译 Java 8 兼容源码 |
| `maven-3-9-16` | Maven 3.9.16 Release Notes | `release-note` | Maven 3.9.16 | 前置构建基线 |

## 研究 Gate 自检

- [x] B-21 身份、阶段项目性质、`3 × 60` 分钟、B-20 唯一前置和稳定 ID 已冻结。
- [x] Java 25/JUnit 6.1.3 现代线与 Java 8/JUnit 5.14.4 兼容线已分开；共享业务源码保持 Java 8 API。
- [x] 命令行启动参数、逐行输入、集合与有限状态、Path/Files、UTF-8 往返、可测试 I/O 边界均有官方来源。
- [x] JUnit 断言、异常、`@TempDir`、Maven/Surefire 定向运行和 jdb 调试入口均有官方来源。
- [x] 三个 checkpoint 各自有最小类、运行方式、正反馈、负反馈与恢复条件，未压成单一 180 分钟步骤。
- [x] 31 个唯一官方 URL 全部直接请求为 HTTP 200；社区来源使用数量为 0。
- [x] 文件格式不引入 JSON；Spring、数据库、Mockito、TDD、Phase C 和产品级持久化保证均明确排除。
- [x] `projectEvidence` 为空；没有读取、运行或修改 `dzzz-app` 源码，也没有创建 fixture、测试或浏览器产物。

## Stop Boundary

本研究记录只服务 Phase B 的 B-21 `command-line-task-manager-project`。研究稿完成不等于课程已发布；
只有正文、三个独立 checkpoint、Java 25/8 反馈环、track/loader、工程 Gate、浏览器验收、复杂改动独立
复审和 signoff 全部通过后，才可宣布 B-21 关闭并决定下一阶段。当前任务在本文件的格式、链接、diff 与
SHA-256 核验后停止，不修改任何其他文件。
