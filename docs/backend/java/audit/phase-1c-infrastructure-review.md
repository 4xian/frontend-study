# `dzzz-app` Phase 1C 基础设施复核

> 批次：Phase 1C 第 8 批
> 源码快照：`dzzz-app-20260803-179e722831ab`
> 自动分析：`dzzz-app-analysis-20260803-958d37cf1be1`
> 状态：已完成，53/53 个 Java 文件、6175/6175 LOC
> 结构化事实源：[phase-1c-infrastructure/manifest.json](./reviews/phase-1c-infrastructure/manifest.json)
> 人工签核：[phase-1c-infrastructure-signoff.json](./reviews/phase-1c-infrastructure-signoff.json)

## 1. 本批边界

本批领取冻结清单中的八个物理范围：

```text
dzzz-app/src/main/java/com/tdh/bdzz/cache/**/*.java
dzzz-app/src/main/java/com/tdh/bdzz/download/**/*.java
dzzz-app/src/main/java/com/tdh/bdzz/factories/flv/**/*.java
dzzz-app/src/main/java/com/tdh/bdzz/rolling/**/*.java
dzzz-app/src/main/java/com/tdh/bdzz/shard/**/*.java
dzzz-app/src/main/java/com/tdh/bdzz/storage/**/*.java
dzzz-app/src/main/java/com/tdh/bdzz/upload/**/*.java
dzzz-app/src/main/java/tdh/platform/component/license/lic/**/*.java
```

| 展示根目录 | 库存索引区间 | 文件数 |  LOC |
| ---------- | ------------ | -----: | ---: |
| `cache`    | `66..83`     |     18 | 1744 |
| `download` | `395..401`   |      7 |  706 |
| `media`    | `1126..1128` |      3 |  489 |
| `logging`  | `1752..1753` |      2 |   52 |
| `shard`    | `2092..2096` |      5 |  287 |
| `storage`  | `2097..2101` |      5 | 1158 |
| `upload`   | `2271..2281` |     11 | 1117 |
| `license`  | `3426..3427` |      2 |  622 |
| 合计       | 7 个连续区间 |     53 | 6175 |

`media`、`logging` 和 `license` 是报告中的职责展示名，分别对应实际的 `factories/flv`、`rolling`
和许可证兼容包。53 个文件与前七批 3119 个已复核路径零重叠。

明确排除：

- 已由前七批复核的配置、Web、业务、数据访问、数据模型、横切和异步文件；
- `util`、`enums`、常量和测试文件，这些属于第 9、10 批；
- 能力矩阵、项目示例登记、拒绝模式登记和课程知识点正文；
- 对 `/Users/jian/Desktop/work/TDH/dzzz/dzzz-app` 的任何修改。

## 2. 复核方法

1. 先运行全量只读检查，确认 Phase 1A、Phase 1B 和前七批产物仍绑定同一冻结快照。
2. 从冻结库存索引独立领取 53 个文件，逐个核对源码 SHA-256、LOC、声明、字段、公开方法、
   框架信号和 CodeGraph 使用边。
3. 按源码职责区分启动缓存、下载策略、媒体线程、日志适配、分表、存储客户端、上传策略和许可证
   兼容边界，不用目录名代替最终语义角色。
4. 逐文件复核缓存可变性、启动生命周期、路径输入、流和客户端所有权、内存载荷、并发订阅者、
   SQL 改写、敏感日志和授权失败策略，并登记精确源码行号。
5. 把 53 条人工结论写入 2 个 JSONL 分片；人工签核绑定 `reviewing` 候选分片 SHA-256，签核通过
   后才生成 `reviewed` 完成态。
6. 用不导入生成器及其职责目录的独立校验器重新读取当前源码和前七批台账，复算物理范围、25 种
   职责形态、24 个角色纠正、职责内容语义哈希、资源信号、使用出现次数、126 条风险候选和累计状态。

风险项 `IN-0001..IN-0126` 是 Phase 2 的归一化输入，不是 126 个已经定性的独立缺陷。没有运行态
证据的生命周期或并发行为保持为边界候选。

## 3. 当前状态叠加

Phase 1A 和 Phase 1B 继续保留生成时的历史状态。当前状态由前八批 Phase 1C 台账按唯一路径覆盖：

| 状态         | 主代码 | 测试 | 总数 |
| ------------ | -----: | ---: | ---: |
| `unreviewed` |    257 |    7 |  264 |
| `reviewing`  |      0 |    0 |    0 |
| `reviewed`   |   3172 |    0 | 3172 |
| `blocked`    |      0 |    0 |    0 |

累计人工复核为 3172/3436；Phase 1 Gate 尚未通过。

## 4. 职责形态与角色纠正

| 职责组             | 细分形态                                                                        | 文件数 |
| ------------------ | ------------------------------------------------------------------------------- | -----: |
| 启动缓存           | `startup-cache-loader`                                                          |     18 |
| 下载               | 结果模型、编排器、合同、4 个适配器                                               |      7 |
| 媒体转换           | 1 个转换合同、2 个转换线程                                                       |      3 |
| 日志               | Logback 文件输出适配器、滚动策略适配器                                           |      2 |
| 分表               | 命名策略与合同、数据注入合同与反射实现、MyBatis 拦截器                           |      5 |
| 存储               | FTP、MOSS、NIO、S3、传输进度回调                                                 |      5 |
| 上传               | 5 个传输模型、编排器、合同、4 个适配器                                           |     11 |
| 许可证             | 1 个兼容模型、1 个基础设施适配器                                                 |      2 |

Phase 1B 自动候选为 39 个 `infrastructure` 和 14 个 `unclassified`。人工复核后的最终角色是：

| 最终角色            | 文件数 | 角色依据                                                 |
| ------------------- | -----: | -------------------------------------------------------- |
| `infrastructure`    |     38 | 缓存加载、文件策略、日志、存储客户端和许可证适配         |
| `data-model`        |      7 | 下载结果、上传传输模型和许可证模型                       |
| `data-access`       |      5 | 分表策略、分表数据注入和 SQL 拦截                        |
| `async-integration` |      3 | 媒体转换合同和两个拥有线程生命周期的实现                 |

24 个文件的机器候选与最终角色不同。物理范围用于保证批次分母，最终角色用于决定后续课程归属；两者
不能相互替代。

## 5. 启动缓存边界

18 个 `cache` 文件都实现 `CommandLineRunner`，在启动回调中读取数据库或词典并写入进程内集合。
复核确认 18 个启动加载信号、18 个字段注入候选和 18 个静态可变缓存候选。

这些文件没有 Redis 客户端、RedisTemplate 或 Spring Data Redis 的当前范围源码证据。`cache` 包名、
静态 Map/List 和计划表中的“Redis”字样都不能据此推断本批实现了 Redis。后续课程应把这里归为
“进程内缓存与启动预热”，只有其他范围找到真实客户端、配置和调用证据后才能建立 Redis 知识点。

现代教学约束：缓存加载应有明确的就绪策略和失败策略；共享快照的发布、刷新和可见性需要原子边界；
依赖使用构造器注入；测试应能替换数据源并复位状态。不能把静态可变集合等同于完整缓存设计。

## 6. 文件、对象存储与资源所有权

下载、存储和上传范围确认了本地文件、SFTP、MOSS、AWS S3、FTP、NIO Channel、流和预签名 URL 等
能力。7 个文件整文件内容驻留内存，另有 2 个媒体线程使用可增长缓冲区；这两类风险分别记录，不能
把有界媒体分片与任意大小文件的整体载荷混为一谈。

课程必须先讲 `Path`、`Files`、流、try-with-resources、编码和路径规范化，再讲上传下载策略与对象
存储适配。每个示例都要明确：

- 本地根目录、允许的远程键和规范化后的路径边界；
- 谁创建、关闭 InputStream、OutputStream、Channel 和外部客户端；
- 文件和缓冲区大小上限，以及慢消费者的背压策略；
- 超时、取消、部分成功、重试、幂等和临时文件清理；
- 访问密钥、密码、预签名 URL 和许可证数据的去敏与最短生命周期。

`LocalDownloader` 当前直接返回 `null`，`LocalUploader` 还存在成功状态覆盖候选。它们只进入 legacy
纠错材料；推荐示例必须返回明确结果，或抛出保留 cause 的有语义异常。

## 7. 媒体、日志、分表与许可证

两个媒体实现直接继承 `Thread`，持有 FFmpeg/JavaCV 资源和 Servlet `AsyncContext` 订阅者集合。
课程应使用受管 Executor、显式任务取消和资源关闭合同，并说明慢订阅者、失败传播和响应完成；不能
用共享可变 List/Map 加空 catch 作为推荐实现。

两个 Logback 扩展调整 WAR 部署下的文件路径，并通过 `@SneakyThrows` 隐藏配置 setter 的受检
异常。现代课程只讲受控日志路径、滚动策略、配置失败诊断和敏感字段去敏；项目扩展作为旧部署方式
补充。

5 个分表文件包含 ThreadLocal 上下文、AOP 参数提取、反射 getter 和 MyBatis SQL 改写。课程顺序
必须是 JDBC/MyBatis、参数绑定、拦截器和线程上下文，再讲项目分表机制。表名只能来自受控映射；
不能把正则字符串替换当作通用 SQL 解析方案。

2 个许可证文件保留旧签名、加解密、XML 和日期状态逻辑。本批还确认“许可证缺失时返回运行态”的
fail-open 候选。现代安全示例必须 fail closed，使用当前受支持的签名验证和密钥管理方案；旧协议
只用于解释兼容边界，不能作为新系统推荐设计。

## 8. 风险候选汇总

| 类别                                     | 候选数 |
| ---------------------------------------- | -----: |
| 字段注入                                 |     18 |
| 启动期缓存加载                           |     18 |
| 静态可变缓存                             |     18 |
| 宽泛捕获                                 |     12 |
| 文件路径边界                             |     11 |
| 旧 File API                              |      8 |
| 整文件内存载荷                           |      7 |
| 敏感集成日志                             |      4 |
| 外部客户端生命周期                       |      3 |
| service locator                          |      3 |
| 空 catch                                 |      2 |
| 裸线程                                   |      2 |
| 阻塞 sleep                               |      2 |
| 媒体内存缓冲                             |      2 |
| 共享媒体订阅者状态                       |      2 |
| Logback 配置隐藏受检异常                 |      2 |
| 历史拼写错误合同                         |      2 |
| 旧许可证兼容                             |      2 |
| 反射式分表数据注入                       |      1 |
| SQL 正则改写                             |      1 |
| 敏感配置模型                             |      1 |
| 有状态 FTP 客户端                        |      1 |
| 上传成功状态覆盖                         |      1 |
| 下载适配器返回 `null`                    |      1 |
| 许可证校验状态                           |      1 |
| 许可证缺失时 fail-open                   |      1 |
| 合计                                     |    126 |

风险候选必须在 Phase 2 合并、取证和筛选后才能成为拒绝模式或课程结论。

## 9. 后续课程约束

1. 先讲 Java 集合、I/O、异常、资源关闭和并发，再讲 Spring 生命周期与基础设施适配器。
2. 项目缓存示例按进程内缓存教授；没有真实证据时不创建 Redis 项目示例。
3. 文件示例默认使用 `Path`、`Files`、有界流式传输和 try-with-resources，并固定路径根目录。
4. 对象存储示例必须定义客户端所有权、超时、关闭、重试、幂等和敏感配置去敏。
5. 策略模式示例使用构造器注入的实现注册表，不在运行时通过 service locator 查找依赖。
6. 媒体流先建立 Executor、取消、背压和资源生命周期，再补充项目 JavaCV/Servlet 旧实现。
7. MyBatis 分表只作为高级项目机制，表名使用受控映射，不教授任意 SQL 字符串替换。
8. 许可证内容归入安全与 legacy 兼容；现代方案 fail closed，旧密码学不进入推荐示例。
9. 正式知识点开始前仍按研究来源规范查询当前 JDK、Spring、Servlet、MyBatis、AWS SDK、Logback
   和安全标准的官方资料，再补充项目 Java 8 / Spring Boot 2.3.12 差异。

## 10. 验证与 Stop Boundary

本批定向正向验证已覆盖：

- 53 个路径、6175 LOC、7 个库存区间和 2 个签核分片；
- 55 个类型声明、165 个字段、272 个显式公开方法；
- 25 种职责形态、24 个角色纠正、2696 个入站和 959 个出站使用出现次数；
- `IN-0001..IN-0126` 的类别、路径和行号由独立 validator 读取源码复算；
- 前八批零路径重叠，累计 `reviewed=3172`、`unreviewed=264`。

2026-08-04 的阶段收尾验证结果：

| 验证 | 结果 |
| ---- | ---- |
| 第 8 批生成器 `--check` 与独立 validator | 两者退出码均为 `0`，53 个文件、6175 LOC、126 条风险候选和累计状态一致 |
| `npm --prefix docs/backend/java/audit/tooling run check` | 退出码 `0`；重新解析 3436 个冻结 Java 文件并校验前 8 批台账 |
| `npm --prefix docs/backend/java/audit/tooling audit --audit-level=low` | 退出码 `0`；`found 0 vulnerabilities` |
| 在两个全新空目录重建并分别运行独立 validator | 两次退出码均为 `0`，正式产物与两次重建彼此逐字节一致 |
| 生成器 `--prepare` 写入独立临时目录 | 53 条记录均为 `reviewing`，累计为 `reviewed=3119`、`reviewing=53` |
| 6 类负向样本 | 均以退出码 `1` 拒绝，并分别到达分片哈希、最终角色、职责内容、风险语义、签核存在性和签核状态边界 |
| 定向 Prettier 与 `git diff --check` | 均通过 |
| `git -C /Users/jian/Desktop/work/TDH/dzzz status --short -- dzzz-app` | 无输出，目标模块保持 clean |

两次完成态重建的稳定 SHA-256：

```text
manifest.json              3c0f3b3ba83ac022e6c424289b2e73510f9c575f031713038cc76833c4e98244
records-0001-0050.jsonl    681ed06fdea6ae43d20d8a36fdd261b68bc07ee994bb4b1f2d8a5ebf54e335b8
records-0051-0053.jsonl    81ae9deceed7499ff417f6e3a820cdfa365999a72d4c2aefb63cd55bd0a3d69f
```

人工签核绑定的 `reviewing` 候选分片 SHA-256：

```text
records-0001-0050.jsonl    e8a8fdba7c3377b372ed25f04959807288c92af0286c672d7baba48124849a77
records-0051-0053.jsonl    3aca3c9729e0051b1b28b24298704f136ecf47118b7efb86b96d8ad52703ba02
```

正式人工签核文件 SHA-256 为
`df8d9d28a0a4b89f6f2c96cb5ff2b299e3ddb31b244c11a493f984cc479bab45`。语义篡改样本同步更新完成态
分片哈希、候选签核哈希、签核文件哈希和 manifest 汇总，独立 validator 仍分别按冻结职责内容合同
和当前源码拒绝了 `responsibility`、`finalRole` 与风险类别篡改，因此验证的不只是文件完整性。

首次双轴复审为 Standards `PASS / 0 finding`、Spec `1 finding`：独立 validator 只检查职责内容字段
非空，同步更新全部完整性哈希后仍可能接受 `responsibility` 篡改。修复新增独立职责内容合同，按职责
形态冻结 `roleDetail`、`responsibility`、`lifecycle` 和 `capabilityCandidates` 的规范化语义哈希，并补充
第 6 类职责内容负向样本。修复后双轴复审为 Standards `PASS / 0 finding`、Spec `PASS / 0 finding`。

本阶段明确不执行：

- Phase 1C 第 9 批“通用代码”或其他后续批次；
- 能力矩阵、项目示例、拒绝模式和课程覆盖矩阵；
- 外部知识点研究、Java 课程正文、菜单或 Markdown adapter；
- `dzzz-app` 源码修改、暂存或任何代码提交。

下一阶段只能从 Phase 1C 第 9 批“通用代码”开始，并继续使用当前 snapshot ID；若目标源码哈希、
库存或前八批台账发生变化，必须先处理漂移，不能直接进入后续批次。
