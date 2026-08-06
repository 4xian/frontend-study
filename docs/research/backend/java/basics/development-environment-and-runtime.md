# 开发环境、JDK 与 Java 运行过程研究记录

## 冻结课程合同

- `courseId`：`backend.java.learn.basics.development-environment-and-runtime`
- `title`：开发环境、JDK 与 Java 运行过程
- `purpose / collection / level / depth`：`learn / basics / beginner / lesson`
- `sequence`：`100`
- `prerequisites / related / projectEvidence`：均为空
- `necessaryPrerequisiteId`：`JAVA-PREREQ-001`
- `origin`：`necessary-prerequisite`
- Phase 2 冻结状态：`researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`；Phase 4 的实施结果只进入独立 signoff，不回写冻结矩阵。

本课只建立开发工具与运行过程的最小心智模型。不讲包、`import`、Maven、Spring、网络、数据库、
模块系统、JIT 具体优化、GC 调优、preview 或 incubator 能力。`dzzz-app` 只提供 Java 8 / Spring Boot
2.3.12.RELEASE 的冻结背景，本课没有项目源码证据，也不复制业务代码。

## 核验基线

| 项目 | 核验结果 |
| --- | --- |
| 核验日期 | 2026-08-05 |
| 现代课程基线 | Java 25；Oracle Java SE Support Roadmap 当前仍将其列为 LTS |
| 现代实测版本 | Eclipse Temurin 25.0.3+9 LTS，Linux AArch64 |
| legacy 课程基线 | Java 8；`dzzz-app` 背景为 Spring Boot 2.3.12.RELEASE |
| legacy 实测版本 | Eclipse Temurin 8u492-b09，Linux AArch64 |
| 宿主环境 | macOS 主机无本地 Java Runtime；Docker 29.6.1，Linux AArch64 engine |

这里选择“当前仍受支持的 LTS”，不把 Java 26 这类非 LTS 功能版本写成“现代基线”。版本状态来自
本批实时打开的 Oracle 路线图，而不是复用 2026-08-03 的旧快照。

## 结论与直接证据

| 结论 | 来源直接页面 | 页内章节 | 适用版本 | 验证方式 |
| --- | --- | --- | --- | --- |
| Java 25 是 LTS | [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) | Oracle Java SE Product Releases | 2026-08-05 页面状态 | 页面正文列出 Java SE 8、11、17、21、25 为 LTS |
| JDK 提供编译与运行所需工具 | [Getting Started with Java](https://dev.java/learn/getting-started) | The Compilation and Execution Cycle in Java | 当前入门资料 | 两个 Temurin JDK 中分别执行 `javac` 与 `java` |
| Java 8 的 JRE、JDK、JVM 职责不同 | [Java SE 8 Platform Overview](https://docs.oracle.com/javase/8/docs/technotes/guides/index.html) | JRE and JDK；Java Virtual Machines | Java SE 8 | 对照 Java 8 JDK 容器中的 `java` 与 `javac` |
| `javac` 把 Java 源码编译成 bytecode class files | [Javac - the Compiler](https://dev.java/learn/jvm/tools/core/javac) | Introducing javac；Description | 当前 JDK 工具 | 两个版本都从 `.java` 生成 `HelloBackend.class` |
| Java 25 启动时会装入、链接、初始化初始类型并调用候选 `main` | [JLS 25 Chapter 12](https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html) | 12.1；12.1.4 | Java SE 25 | Java 25 运行 fixture；JLS 核对候选方法规则 |
| JVM 处理的是版本化 class file，不是 `javac` 直接生成的通用机器码 | [JVMS 25 Chapter 4](https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-4.html) | 4.1 The ClassFile Structure | Java SE 25 | Java 25 默认产物为 major 69；Java 8 拒绝加载 |
| JVM 的 loading、linking、initialization 是不同阶段 | [JVMS 25 Chapter 5](https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-5.html) | 5.2；5.3；5.4；5.5 | Java SE 25 | `UnsupportedClassVersionError` 在程序正文前出现 |
| Java 25 的候选 `main` 不再只有传统形式 | [JLS 25 Chapter 12](https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html) | 12.1.4 Invoke a main Method | Java SE 25 | 规范核对：可无参数，可为实例方法，访问级别也已扩展 |
| Java 8 要求传统 `public static void main(String[] args)` 或 varargs 等价形式 | [JLS 8 Chapter 12](https://docs.oracle.com/javase/specs/jls/se8/html/jls-12.html) | 12.1.4 Invoke Test.main | Java SE 8 | 同一 fixture 在 Java 8 编译和启动成功 |
| source-file mode 自 Java SE 11 才提供 | [Getting Started with Java](https://dev.java/learn/getting-started) | The Compilation and Execution Cycle in Java | Java 11+ | Java 8 执行 `java HelloBackend.java` 退出 1 |
| Java 25 的 `java` 可进入 source-file mode，源文件错误会以非零码退出 | [The java Command](https://docs.oracle.com/en/java/javase/25/docs/specs/man/java.html) | Using Source-File Mode to Launch Single-File Source-Code Programs | JDK 25 | 工具合同核对；正式示例仍使用显式编译、运行两步 |
| Java 25 的 `--release` 同时约束语言、class 目标与对应平台 API | [The javac Command](https://docs.oracle.com/en/java/javase/25/docs/specs/man/javac.html) | Standard Options for javac - `--release` | JDK 25 | 工具合同核对 |
| Java 8 交叉编译不能只看 `-source` / `-target`，还需正确 bootstrap classes | [Java 8 javac](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/javac.html) | Cross-Compilation Options | JDK 8 | 归档工具文档核对，不把它等同于现代 `--release` |
| Java 8 launcher 从用户 classpath 找启动类 | [Java 8 java](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/java.html) | Description；Options | JDK 8 | 使用 `java -cp /tmp/classes HelloBackend` 启动 |
| Java 25 已正式交付 compact source files 与 instance main methods | [JEP 512](https://openjdk.org/jeps/512) | Summary；Description；History | JDK 25 | JEP 状态为 Closed / Delivered、Release 25，并与最终 JLS 交叉核对 |

外部资料发现使用 Tavily，并在得到直接 URL 后重新打开正文；最终证据没有使用社区文章、搜索摘要或
AI 输出。

## 职责边界

### Java 语言与 Java SE

Java 语言规定源码中哪些结构合法以及它们的语义。Java SE 是标准平台规范集合，涵盖语言、JVM、
标准 API 等合同。二者都不是一个正在运行的进程，也不能与某个具体 JDK 安装目录画等号。

### JDK

JDK 是开发套件。本课实际使用的 JDK 同时提供 `javac` 编译器、`java` launcher、JVM 实现和运行
所需标准库。安装 JDK 后可以开发并运行程序；只看到 `java` 能运行不等于同时拥有 `javac`。

### JVM 与运行时环境

JVM 是执行 class file 指令、管理运行时状态的抽象机器规范及其具体实现。运行时环境的职责更宽，
还包括启动器、标准库和支持文件。Java 8 文档把可单独分发的 JRE 明确定义为 JVM、库和其他运行
组件；现代 JDK 使用模块化 runtime image，因此课程把“运行时环境”作为职责概念，不暗示 Java 25
一定存在与 Java 8 相同布局的独立 JRE 产品。

## 从源码到运行

本课采用可同时在 Java 25 与 Java 8 使用的显式两步流程：

```text
HelloBackend.java
  -> javac 读取源码并检查编译期规则
  -> HelloBackend.class（版本化 class file / bytecode 容器）
  -> java launcher 根据 classpath 找到 HelloBackend
  -> JVM 装入、链接、初始化类型
  -> JVM 按对应版本的启动协议选择并调用 main
  -> 程序输出或在运行期失败
```

`javac` 的直接产物是 class file，不应概括为“直接生成适用于所有机器的机器码”。某个 JVM 实现可
以解释、即时编译或其他方式执行指令，但这些实现策略不是本课的语言合同。

## 三类错误的最小区分

| 阶段 | 何时发生 | 最小例子 | 可观察结果 |
| --- | --- | --- | --- |
| 编译期 | `javac` 处理源码时 | 语法错误、找不到所需类型 | `javac` 非零退出，不能得到可用的目标 class |
| 启动期 | launcher/JVM 寻找并装入初始类型时 | classpath 不含启动类、class file 版本过高、没有可启动 `main` | `java` 在业务代码开始前非零退出 |
| 运行期 | 已成功进入 `main` 后 | 程序主动抛出未捕获异常 | 已发生部分程序行为，随后异常并非零退出 |

这种三分是定位顺序，不表示 JVM 的内部阶段只有三步。JLS/JVMS 还精确区分 loading、linking、
initialization；零基础课程只保留诊断所需边界。

## Java 25 启动协议与传统 main

Java 25 最终 JLS 允许更多候选 `main`：可以无参数，可以是实例方法，访问级别也不再只限
`public`。JEP 512 还正式交付 compact source files。由此可以确认：传统
`public static void main(String[] args)` 不是 Java 25 唯一合法启动形式。

本课仍推荐传统形式，因为它在 Java 25 与 Java 8 都合法，同一份源码可完成双版本反馈环，也不会
要求初学者先理解实例构造或 compact source file 的隐式类。这里的“推荐”是本课程的兼容性选择，
不是把 Java 25 新协议改写成旧规则。

## Java 8 与现代线的精确差异

| 对比项 | Java 25 现代线 | Java 8 legacy 线 |
| --- | --- | --- |
| 本课基线身份 | 当前仍受支持的 LTS | 冻结项目兼容基线 |
| 启动 `main` | JLS 25 候选形式已扩展 | 必须是 `public static void` 且接收 `String[]` / `String...` |
| source-file launch | `java File.java` 可进入 source-file mode | 不支持；把参数当作类名处理 |
| class file major | 69 | 52 |
| 交叉编译 | 优先用 `--release 8` 同时约束语言、目标和 API | 没有 `--release`；归档工具合同要求组合处理 `-source`、`-target` 与 bootstrap classes |
| 本课推荐示例 | 传统 main，显式 `javac` 后 `java -cp` | 同一份源码、同一流程 |

## 易错点证据链

### 1. 把 JDK、JVM、Java 语言混为一谈

- 现象：把“安装 Java”“JVM 编译源码”“Java 版本”当成同一件事。
- 触发条件：只通过 IDE 的运行按钮接触 Java，没有观察工具边界。
- 原因：语言规范、开发套件、运行引擎处于不同层级。
- 后果：缺少 `javac`、选错运行版本或运行失败时无法定位。
- 错误示例：看到 `java -version` 成功，就断言编译环境完整。
- 正确写法：分别执行 `java -version` 与 `javac -version`，再记录实际命令路径或容器镜像。
- 影响版本：Java 8 与 Java 25。
- 验证方式：本批两个 JDK 都分别执行两个命令并记录退出码 0。
- 来源：Java SE 8 Platform Overview；Dev.java Getting Started。

### 2. 说 javac 直接生成机器码

- 现象：把 `HelloBackend.class` 描述为能脱离 JVM 直接执行的机器码。
- 触发条件：省略 `.class` 与 JVM 的边界。
- 原因：`javac` 合同是生成 bytecode class files；class file 具有 JVM 规范定义的格式和版本。
- 后果：无法解释跨平台运行，也无法解释版本不兼容。
- 错误示例：`javac HelloBackend.java` 后直接执行 `./HelloBackend.class`。
- 正确写法：用 `java -cp <输出目录> HelloBackend` 让 launcher/JVM 装入 class。
- 影响版本：Java 8 与 Java 25。
- 验证方式：fixture 的显式编译、运行两步；Java 8 对 major 69 的拒绝进一步证明版本边界。
- 来源：Dev.java Javac；JVMS 25 Chapter 4、5。

### 3. 把传统 main 写成 Java 25 唯一入口

- 现象：声称 Java 25 只能启动 `public static void main(String[] args)`。
- 触发条件：用 Java 8 记忆替代当前规范。
- 原因：Java 25 的候选 `main` 已正式扩展。
- 后果：课程结论过时，读者会把合法 Java 25 程序误判为错误。
- 错误示例：把无参数或实例 `main` 一律标为 Java 25 编译错误。
- 正确写法：说明扩展规则，同时把传统形式标为跨 Java 8/25 的本课推荐入口。
- 影响版本：差异发生在 Java 25；Java 8 仍要求传统形式。
- 验证方式：交叉核对 JLS 25 §12.1.4、JLS 8 §12.1.4 与 JEP 512。
- 来源：JLS 25；JLS 8；JEP 512。

### 4. 在 Java 8 使用 source-file launch

- 现象：执行 `java HelloBackend.java` 得到找不到主类，而不是编译运行源码。
- 触发条件：把 Java 11+ 教程命令复制到 Java 8。
- 原因：source-file mode 从 Java SE 11 才提供；Java 8 launcher 把第一个非选项参数当作类名。
- 后果：程序未进入 `main`，退出码为 1。
- 错误示例：`java HelloBackend.java`（Java 8）。
- 正确写法：Java 8 使用 `javac -d <目录> HelloBackend.java`，再执行
  `java -cp <目录> HelloBackend`。
- 影响版本：Java 8 不支持；Java 11+ 支持相应模式。
- 验证方式：本批 Java 8 实测退出 1，错误为 `Could not find or load main class HelloBackend.java`。
- 来源：Dev.java Getting Started；Java 25 `java`；Java 8 `java`。

### 5. 认为高版本 class file 可直接在 Java 8 运行

- 现象：Java 25 编译成功，Java 8 启动失败。
- 触发条件：把默认 Java 25 class file 交给 Java 8 JVM。
- 原因：Java 25 默认 class file major 为 69，Java 8 只识别到 52。
- 后果：启动期抛出 `UnsupportedClassVersionError`，`main` 不会执行。
- 错误示例：用 JDK 25 默认编译后直接部署到 Java 8。
- 正确写法：真正需要 Java 8 目标时使用 `javac --release 8` 并在 Java 8 运行时复测，或直接用
  精确 Java 8 工具链验证。
- 影响版本：高版本产物向低版本运行时部署。
- 验证方式：本批 Java 8 对 major 69 明确退出 1，并报告最高仅识别 52.0。
- 来源：JVMS 25 Chapter 4；Java 25 `javac`。

### 6. 把 -source/-target 等同于 --release

- 现象：class file 版本看似正确，却仍引用目标旧平台不存在的 API。
- 触发条件：在现代 JDK 只设置 `-source 8 -target 8`，仍按现代平台 API 编译。
- 原因：`--release` 同时选择语言规则、目标 class 与对应版本的标准 API；Java 8 的归档交叉编译
  合同则要求正确的 bootstrap classes。
- 后果：部署后可能在链接或运行时出现缺失方法/类型错误。
- 错误示例：把 `-source 8 -target 8` 的成功当成完整 Java 8 兼容证明。
- 正确写法：现代 JDK 使用 `--release 8`，最终仍在 Java 8 运行环境复测。
- 影响版本：用较新 JDK 为较旧 Java SE 目标编译时。
- 验证方式：核对 Java 25 `javac --release` 与 Java 8 `javac` Cross-Compilation Options；本课
  fixture 另在真实 Java 8 编译和运行。
- 来源：Java 25 `javac`；Java 8 `javac`。

### 7. 混淆 classpath、当前目录与源码目录

- 现象：源码和 class 都存在，`java HelloBackend` 仍报告找不到类。
- 触发条件：运行命令的当前目录不在有效 classpath，或误把 `.java` 文件路径当成传统类名。
- 原因：传统 launcher 按类名从用户 classpath 查找 class；未显式设置时才可能使用当前目录。
- 后果：启动期失败，与源码语法是否正确无关。
- 错误示例：在任意目录执行 `java HelloBackend`，却没有让 class 输出目录进入 classpath。
- 正确写法：本课始终显式执行 `java -cp /tmp/classes HelloBackend`。
- 影响版本：Java 8 与 Java 25 的传统 class 启动模式。
- 验证方式：fixture 从只读源码目录编译到独立临时卷，并只通过 `-cp /tmp/classes` 运行。
- 来源：Java 8 `java`；Java 25 `javac` 的 classpath 说明。

## 示例验证证据

验证入口：

```bash
tests/fixtures/backend/java/development-environment-and-runtime/verify.sh
```

源码目录以只读 bind mount 挂载到 `/workspace`；所有 class 产物位于仅供容器使用的临时 Docker
volume `/tmp/classes`，脚本退出时删除该卷，仓库内不会生成 `.class`。

| 角色 | 请求镜像 | 本次解析 digest | 实际版本 |
| --- | --- | --- | --- |
| modern | `eclipse-temurin:25-jdk` | `sha256:12e44624adee6808a36d962717e1656e0afeeeff5a100f9cb00e0136513558f0` | `25.0.3+9-LTS` |
| legacy | `eclipse-temurin:8-jdk` | `sha256:c8b86f2c0a9bd6cc1b7fabc5d1a097501a166eea7cad3b2764e90e96178bea9b` | `1.8.0_492-b09` |

两者都是 Docker Official Image `eclipse-temurin` 的 Linux AArch64 JDK 镜像；验证脚本已经固定到
上述 digest。

```text
Java 25:
java -version -> openjdk version "25.0.3" 2026-04-21 LTS，exit 0
javac -version -> javac 25.0.3，exit 0
javac ... HelloBackend.java -> exit 0
java -cp /tmp/classes HelloBackend -> 后端课程运行成功，exit 0

Java 8:
java -version -> openjdk version "1.8.0_492"，exit 0
javac -version -> javac 1.8.0_492，exit 0
javac ... HelloBackend.java -> exit 0
java -cp /tmp/classes HelloBackend -> 后端课程运行成功，exit 0

预期失败 1:
Java 8: java HelloBackend.java -> Could not find or load main class HelloBackend.java，exit 1

预期失败 2:
Java 25 默认编译后交给 Java 8 -> UnsupportedClassVersionError
class file version 69.0 / recognizes up to 52.0，exit 1
```

## 被排除或尚未证实的说法

- 不声称 `javac` 的直接输出是特定 CPU 机器码；官方合同只支持 bytecode class files。
- 不把某个具体 JVM 的解释器、JIT 或 AOT 策略写成所有 JVM 必须采用的过程。
- 不声称现代 Java 25 必须安装一个与 Java 8 目录布局相同的独立 JRE。
- 不把 `public static void main(String[] args)` 描述成 Java 25 唯一入口。
- 不教授 compact source files 的进一步语法；这里只用它纠正“唯一入口”的过时说法。
- 不从 `dzzz-app` 推导 JDK/JVM 普遍合同，不虚构 `projectEvidence`。
- 不展开 package、`import` 与源码目录布局；这些属于冻结的下一课。
- 不讨论 Spring Boot 2.3.12.RELEASE 内部启动机制；本课只记录 legacy 背景。
- 不纳入 preview、incubator 或未 GA 能力。
- 不声称 IDE 的 Run 按钮执行了某一固定命令；不同 IDE 与配置可能不同。
