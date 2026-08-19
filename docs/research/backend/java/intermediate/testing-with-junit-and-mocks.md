# JUnit、Mockito 与 Service 单元测试研究稿

## 冻结课程合同

| 项目 | 冻结值 |
| --- | --- |
| 课程编号 | Phase C `I-14`；中级第 14/20 课 |
| 稳定 ID | `backend.java.learn.intermediate.testing-with-junit-and-mocks` |
| 标题 | JUnit、Mockito 与 Service 单元测试 |
| 预计时长 | 150 分钟 |
| 唯一前置 | `backend.java.learn.intermediate.errors-results-and-logging`（I-13） |
| 处置 | 复用稳定 ID 与 URL；按 Phase A 合同拆分旧正文职责 |
| 现代主线 | Java 25 LTS、JUnit 6.1.3、Mockito 5.23.0、Maven Surefire 3.5.6 |
| 项目补充线 | Java 8、Spring Boot 2.3.12.RELEASE、JUnit Jupiter 5.6.3、Mockito 3.3.3 |
| Phase C 准入 | I-13 已关闭到 `13/20`；本批只准入 I-14 |
| 本课范围 | Service 公开行为、协作者隔离、Mockito stub/verify、fixture 边界、失败诊断 |
| 明确排除 | JUnit 入门、Controller/MockMvc/test slice、Spring 应用上下文、真实数据库、WireMock、契约测试、端到端测试与性能基准 |

B-20 已讲授 `@Test`、Arrange-Act-Assert、基础断言、测试命名与 Maven 测试反馈环。I-14 可以在
Service 场景中直接使用这些能力，但不得再次把它们展开成入门教学。本课的最小单元是一个通过
构造器接收仓储接口的普通 Service；测试不启动 Spring 容器，不连接数据库或网络，也不提前覆盖
Controller 和 HTTP 合同。

## 研究方法与版本快照

- 核验日期：2026-08-16。
- 已知官方 URL 使用 `curl -L --fail --silent --show-error` 读取并记录最终 HTTP 状态；没有用搜索摘要
  代替直接页面。
- JUnit 官方 GitHub `latest release` API 返回 `r6.1.3`，发布时间为 2026-08-07；现代 fixture 因此从
  旧研究稿的 6.1.2 更新到 6.1.3。JUnit 6.1.3 仍要求 Java 17 或更高运行时，Java 25 满足要求。
- Mockito 官方 GitHub `latest release` API 返回 `v5.23.0`；本课保留 Mockito 5.23.0。
- Surefire 官方 `latest release` API 返回 `3.6.0-M1`，它是里程碑版本。本课遵守稳定 GA 基线，固定
  3.5.6，不把里程碑版本写成生产默认。
- Spring Framework 官方单元测试章节明确指出 POJO 可以在没有 Spring 或其他容器的情况下测试；
  依赖注入使持久化协作者可被 stub 或 mock 替换。这是 I-14 不启动应用上下文的边界依据。
- Spring Boot 2.3.12.RELEASE 依赖坐标确认旧项目线使用 JUnit Jupiter 5.6.3 与 Mockito 3.3.3；
  旧线不得复制 JUnit 6 或 Mockito 5 才存在的 API。
- 研究阶段没有创建或运行 Java fixture。下文只冻结实施阶段的可执行反馈环和预期证据格式。

### 版本查询 URL 核验

| 用途 | 官方直接 URL | 2026-08-16 结果 |
| --- | --- | --- |
| JUnit 最新发布 | <https://api.github.com/repos/junit-team/junit-framework/releases/latest> | HTTP 200；`r6.1.3` |
| Mockito 最新发布 | <https://api.github.com/repos/mockito/mockito/releases/latest> | HTTP 200；`v5.23.0` |
| Surefire 最新发布 | <https://api.github.com/repos/apache/maven-surefire/releases/latest> | HTTP 200；`surefire-3.6.0-M1` |

## 官方来源卡与直接证据

正式正文的 frontmatter 应按下表顺序映射实际使用的来源。所有 18 个 URL 已于 2026-08-16 通过
`curl -L` 核验，最终状态均为 HTTP 200；加上 3 个版本 API，本批共核验 21/21 个 URL。

| ID | 官方直接来源 | sourceType | 适用版本 | 支持结论 | 状态 |
| --- | --- | --- | --- | --- | --- |
| `junit-6-1-3-release` | [JUnit 6.1.3 release](https://github.com/junit-team/junit-framework/releases/tag/r6.1.3) | `release-note` | JUnit 6.1.3 | 现代主线的精确发布版本。 | 200 |
| `junit-6-1-3-release-notes` | [JUnit 6.1.3 Release Notes](https://docs.junit.org/6.1.3/release-notes.html) | `release-note` | JUnit 6.1.3 | JUnit 6 的 Java 17 运行时基线与 6.1.3 变更。 | 200 |
| `junit-6-assertions` | [JUnit Assertions API](https://docs.junit.org/6.1.3/api/org.junit.jupiter.api/org/junit/jupiter/api/Assertions.html) | `api-doc` | JUnit Jupiter 6.1.3 | `assertThrows` 接受子类型，`assertThrowsExactly` 要求精确类型，并返回异常供继续断言。 | 200 |
| `spring-unit-testing` | [Spring Framework Unit Testing](https://docs.spring.io/spring-framework/reference/testing/unit.html) | `official-reference` | Spring Framework current | POJO 可脱离容器做单元测试；依赖注入便于用 stub 或 mock 隔离持久化协作者。 | 200 |
| `mockito-5-23-release` | [Mockito 5.23.0 release](https://github.com/mockito/mockito/releases/tag/v5.23.0) | `release-note` | Mockito 5.23.0 | 现代主线的精确发布版本。 | 200 |
| `mockito-api` | [Mockito API](https://javadoc.io/static/org.mockito/mockito-core/5.23.0/org.mockito/org/mockito/Mockito.html) | `api-doc` | Mockito 5.23.0 | mock、stub、verify、次数验证、`never()`、spy 与 `doReturn` 的核心合同。 | 200 |
| `mockito-extension` | [MockitoExtension API](https://javadoc.io/static/org.mockito/mockito-junit-jupiter/5.23.0/org.mockito.junit.jupiter/org/mockito/junit/jupiter/MockitoExtension.html) | `api-doc` | Mockito 5.23.0 | Jupiter 扩展初始化 mock、处理严格 stub，并支持测试方法参数。 | 200 |
| `mockito-inject-mocks` | [InjectMocks API](https://javadoc.io/static/org.mockito/mockito-core/5.23.0/org.mockito/org/mockito/InjectMocks.html) | `api-doc` | Mockito 5.23.0 | 注入依次尝试构造器、setter、字段；它不是依赖注入框架。 | 200 |
| `mockito-captor` | [ArgumentCaptor API](https://javadoc.io/static/org.mockito/mockito-core/5.23.0/org.mockito/org/mockito/ArgumentCaptor.html) | `api-doc` | Mockito 5.23.0 | captor 推荐用于 verify 后检查参数，不推荐用于 stubbing，以免降低可读性和缺陷定位能力。 | 200 |
| `mockito-matchers` | [ArgumentMatchers API](https://javadoc.io/static/org.mockito/mockito-core/5.23.0/org.mockito/org/mockito/ArgumentMatchers.html) | `api-doc` | Mockito 5.23.0 | 一次 mock 调用使用 matcher 时所有参数都必须由 matcher 提供；matcher 不能脱离 stub/verify 调用使用。 | 200 |
| `mockito-strictness` | [Strictness API](https://javadoc.io/static/org.mockito/mockito-core/5.23.0/org.mockito/org/mockito/quality/Strictness.html) | `api-doc` | Mockito 5.23.0 | `STRICT_STUBS` 用于发现未使用 stub 和参数不匹配；`LENIENT` 只用于明确例外。 | 200 |
| `mockito-unused-stub` | [UnnecessaryStubbingException API](https://javadoc.io/static/org.mockito/mockito-core/5.23.0/org.mockito/org/mockito/exceptions/misusing/UnnecessaryStubbingException.html) | `api-doc` | Mockito 5.23.0 | 未被执行的 stub 会使测试噪声增大，应删除或仅对真实例外做局部 lenient。 | 200 |
| `mockito-stub-mismatch` | [PotentialStubbingProblem API](https://javadoc.io/static/org.mockito/mockito-core/5.23.0/org.mockito/org/mockito/exceptions/misusing/PotentialStubbingProblem.html) | `api-doc` | Mockito 5.23.0 | stub 参数与实际调用不一致通常是测试或实现错误，也存在需显式处理的少数例外。 | 200 |
| `surefire-3-5-6-release` | [Surefire 3.5.6 release](https://github.com/apache/maven-surefire/releases/tag/surefire-3.5.6) | `release-note` | Surefire 3.5.6 | fixture 使用的稳定 GA 插件版本。 | 200 |
| `surefire-junit-platform` | [Surefire JUnit Platform](https://maven.apache.org/surefire/maven-surefire-plugin/examples/junit-platform.html) | `official-reference` | Surefire 3.5.6 | Maven 测试阶段通过 JUnit Platform 执行 Jupiter 测试。 | 200 |
| `boot-2-3-coordinates` | [Spring Boot 2.3.12 dependency versions](https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/appendix-dependency-versions.html) | `official-reference` | Spring Boot 2.3.12.RELEASE | 旧项目线管理 JUnit Jupiter 5.6.3 与 Mockito 3.3.3。 | 200 |
| `junit-5-6-3-assertions` | [JUnit 5.6.3 Assertions API](https://junit.org/junit5/docs/5.6.3/api/org.junit.jupiter.api/org/junit/jupiter/api/Assertions.html) | `api-doc` | JUnit Jupiter 5.6.3 | Java 8 fixture 可使用的旧线断言合同。 | 200 |
| `mockito-3-3-3-api` | [Mockito 3.3.3 API](https://javadoc.io/static/org.mockito/mockito-core/3.3.3/org/mockito/Mockito.html) | `api-doc` | Mockito 3.3.3 | Java 8 fixture 可使用的旧线 mock、stub 与 verify 合同。 | 200 |

## 冻结项目证据边界

本研究只保留既有审计产物提供的抽象场景，不重新读取项目源码，也不把项目写法当成推荐合同：

| 来源能力 | 冻结用途 |
| --- | --- |
| `JAVA-ENGINEERING-035` | 把断言落到 Service 的公开结果或可观察产物，不断言私有方法。 |
| `JAVA-FRAMEWORK-023` | JUnit 4 只作为旧项目迁移背景；基础迁移已经由 B-20 承担。 |
| `JAVA-FRAMEWORK-024` | 证明项目存在 Mockito 使用场景；课程改写为中性的 Service/Repository 协作。 |
| `JAVA-RISK-046` | 提炼共享 fixture、粗粒度断言、反射耦合和宽泛异常断言的失败诊断。 |

项目证据不得进入示例中的真实包名、业务名称、数据库连接、输出目录或敏感数据。I-14 示例统一使用
`TaskService`、`TaskRepository`、不可变 `Task` 与中性任务标识。

## I-14 知识点规划

正式正文至少按以下 24 个独立知识点展开。每个知识点仍必须完整回答“它是什么、有什么作用、
什么时候使用、怎么使用、最小示例、运行结果、常见误区”，不能用一段大示例代替逐点教学。

1. Service 单元测试的测试对象是公开业务行为，而不是 Spring Bean 身份或私有方法。
2. 单元边界只保留一个真实 Service；仓储、时钟或外部网关作为协作者隔离。
3. 为什么 Service 单元测试不启动 Spring 容器、不连接真实数据库或 HTTP 服务。
4. 如何从一个业务分支反推输入、协作者返回值、公开结果和必要副作用。
5. 为什么值对象和结果对象通常保持真实，只有越过单元边界的依赖才使用 mock。
6. 如何通过显式构造器把 mock repository 注入 Service，保持 fixture 可读。
7. `@InjectMocks` 的构造器、setter、字段尝试顺序，以及何时不用这个便利注解。
8. mock、stub、verify 在 Service 测试中分别回答“依赖是谁、返回什么、是否发生协作”。
9. `when(...).thenReturn(...)` 如何驱动查询成功、数据缺失和重复冲突分支。
10. `thenThrow`/`doThrow` 如何驱动依赖失败，并验证 I-13 已冻结的错误合同。
11. 为什么先断言 Service 的公开结果，再对真正属于合同的协作做 verify。
12. `verify`、`times(1)` 与默认一次调用的等价边界，避免重复噪声。
13. `never()` 如何证明校验失败或重复冲突时没有执行写操作。
14. matcher 必须覆盖一次调用的全部参数，为什么 `any()` 不能脱离 stub/verify 使用。
15. 为什么优先用精确值或 `eq()`，只在非关键参数上使用宽 matcher。
16. `ArgumentCaptor` 如何在 verify 后检查传给仓储的规范化任务对象。
17. 多个协作顺序只有在顺序本身是业务合同时才使用 `InOrder` 验证。
18. `MockitoExtension` 如何按测试生命周期初始化 mock 并启用严格 stub 诊断。
19. `STRICT_STUBS` 如何暴露未使用 stub 与参数不匹配，为什么不应全局 lenient。
20. 每个测试如何新建 Service 与可变输入，避免共享集合、系统属性和缓存污染。
21. 公共 setup 只放每个测试都需要的稳定结构，不预置只服务某个分支的 stub。
22. spy 会调用真实方法；只有无法直接隔离且明确无副作用时才考虑 `doReturn`，主线优先 mock 接口。
23. 如何从 wanted-but-not-invoked、调用次数不符、未使用 stub、stub 参数不匹配定位失败层级。
24. 用创建成功、重复冲突、数据缺失、依赖失败四条 Service 路径闭合结果与协作断言。

### 与相邻课程的内容边界

- B-20 的 JUnit 组成、`@Test`、基础断言、AAA、测试命名、Maven 命令不在 I-14 重讲。
- I-14 只把 JUnit 断言应用到 Service 公开结果和 I-13 错误合同。
- Controller、MockMvc、test slice、HTTP 状态和响应体断言属于下一课，本研究不展开。
- Spring Boot 应用上下文、真实外部服务和测试分层属于高级集成测试课程。
- 真实 MySQL 方言、事务回滚和容器化数据库验证属于数据库专项。

## 实施阶段临时反馈环

研究阶段未执行 fixture。实施阶段必须使用 `mktemp -d` 在 `/tmp` 创建两个独立 Maven 工程；测试
结束后精确清理临时目录，并以路径不存在性检查证明仓库内没有遗留测试文件。

### 现代 Java 25 反馈环

现代 fixture 固定 JUnit 6.1.3、Mockito 5.23.0 与 Surefire 3.5.6，只包含普通 Java
`TaskService`、`TaskRepository` 和一个测试类，不引入 Spring Test：

1. 创建成功：stub `findByTitle` 为空，断言 `CREATED` 结果，并捕获 `save` 参数检查规范化标题。
2. 重复冲突：stub 已存在任务，断言 I-13 的冲突结果，并 verify `save` 为 `never()`。
3. 数据缺失：stub 查询为空，断言 `NOT_FOUND`，不验证无关内部步骤。
4. 依赖失败：repository 抛异常，断言 Service 映射后的公开失败合同，不泄漏底层异常消息。
5. 严格 stub 负例：增加未使用 stub，确认测试以 `UnnecessaryStubbingException` 失败；删除后复跑通过。
6. 参数不匹配负例：stub 原始标题、实际调用规范化标题，确认严格模式暴露不匹配；修正精确参数后通过。
7. 同一测试集连续运行两次，确认没有静态集合、系统属性或输出文件残留。
8. `-Dtest=TaskServiceTest` 可独立执行目标类，并生成 Surefire XML 报告。

只有实际执行后才能记录类似以下的稳定证据；数字必须来自真实报告，不得预填：

```text
I14_MODERN_PASS|java=25|junit=6.1.3|mockito=5.23.0|tests=<actual>|failures=0|errors=0
I14_NEGATIVE_PASS|unusedStub=detected|argumentMismatch=detected|recovery=pass
I14_ISOLATION_PASS|runs=2|sharedStateLeak=false|repositoryFiles=0
```

### Java 8 / Boot 2.3.12 补充线

旧线 fixture 必须在真实 Java 8 runtime 中运行，固定 JUnit Jupiter 5.6.3 与 Mockito 3.3.3。被测模型
使用普通 final class 与 getter，不使用 record、sealed 类型、JUnit 6 API 或 Mockito 5 API。至少复跑
创建成功、重复冲突、`never()` 与 captor 四个核心合同，并记录真实 Maven/Surefire 结果：

```text
I14_LEGACY_PASS|java=8|junit=5.6.3|mockito=3.3.3|tests=<actual>|failures=0|errors=0
```

如果没有真实 Java 8 runtime，只能标记 `DEFERRED`；Java 25 上的 `--release 8` 编译不能冒充 Java 8
运行证据。

## 易错点与失败诊断合同

| 现象 | 触发条件 | 原因 | 后果 | 错误示例 | 正确写法 | 影响版本 | 验证方式 | 来源 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `UnnecessaryStubbingException` | setup 预置了当前测试不使用的 stub | fixture 共享过多分支数据 | 失败噪声掩盖真实意图 | 每个测试都 stub `save` | 把 stub 下沉到真正需要的测试；只有明确例外才局部 lenient | Mockito 5.23.0；严格模式 | 先运行负例看到指定异常，删除多余 stub 后复跑 | `mockito-strictness`、`mockito-unused-stub` |
| `PotentialStubbingProblem` | stub 的标题与 Service 规范化后的实参不同 | 测试预期和实际协作合同不一致 | 测试在协作点失败，或宽 matcher 掩盖缺陷 | stub `" Task "`，实际调用 `"Task"` | 按合同 stub 精确规范化值，并单独断言转换结果 | Mockito 5.23.0；严格模式 | 运行参数不匹配负例，再改为精确值复跑 | `mockito-stub-mismatch` |
| matcher 使用错误 | 同一次调用混用裸值和 matcher，或在 stub/verify 外调用 matcher | matcher 通过内部栈记录且返回占位值 | 抛 matcher misuse 异常，失败位置难读 | `when(repo.find(eq(id), "OPEN"))` | 全部参数都用 matcher，或全部使用精确值 | Mockito 3.3.3/5.23.0 | 最小负例触发，再统一参数风格复跑 | `mockito-matchers`、`mockito-3-3-3-api` |
| captor 没有捕获值 | 用 captor 做 stubbing，而被测调用没有发生 | captor 的主要用途是 verify 后检查实际参数 | 失败定位变差，测试读者看不出预期输入 | `when(repo.save(captor.capture()))` | 先调用 Service，再 `verify(repo).save(captor.capture())` 并断言值 | Mockito 3.3.3/5.23.0 | 让调用不发生观察空捕获，再改为 verify 后捕获 | `mockito-captor` |
| 测试单独通过、全量失败 | static 集合、系统属性或可变对象跨测试共享 | fixture 所有权越过单个测试生命周期 | 顺序依赖和间歇失败 | static `List<Task>` 反复追加 | 每个测试新建可变输入与 Service；扩展管理 mock 生命周期 | JUnit 5.6.3/6.1.3、Mockito 3.3.3/5.23.0 | 目标类连续运行两次并检查仓库零输出 | `mockito-extension`、`spring-unit-testing` |

## 研究 Gate

- [x] I-14 标题、稳定 ID、150 分钟、唯一前置 I-13、复用/拆分处置与 Phase A 一致。
- [x] B-20 基础 JUnit、下一课 Controller 测试与高级集成测试边界已排除。
- [x] JUnit 6.1.3、Mockito 5.23.0、Surefire 3.5.6 与 Java 8 旧线版本已重新核验。
- [x] 18 个正式来源 URL 与 3 个版本 API 共 21/21 个最终 HTTP 状态为 200。
- [x] 24 个知识点集中于 Service 单元测试、Mockito、fixture 边界和失败诊断。
- [x] 五个易错点具备现象、触发条件、原因、后果、错误示例、正确写法、影响版本、验证方式和来源。
- [x] 双版本反馈环只写为实施计划，没有虚构 fixture、测试报告或运行成功。
- [x] 本批只修改 I-14 研究稿，不修改正文、track、loader、signoff 或后续课程资产。

## Stop Boundary

本文件只完成 Phase C I-14 的官方研究冻结。研究完成不等于课程正文完成、fixture 通过、runtime
发布、浏览器验收或 signoff 关闭。父任务必须继续完成 I-14 正文、Java 25/Java 8 临时反馈环、定向与
工程 Gate、桌面/390px 浏览器验证、复杂改动独立 Standards/Spec 复审以及原位 signoff；I-14 完整
关闭前不得读取或修改下一课正文、研究稿，也不得进入 Phase D。
