# 后端课程研究与来源规范

> 版本：v1.0<br>
> 核验日期：2026-08-03<br>
> 状态：已确认<br>
> 适用范围：`backend` 生态下的 Java、Go 及后续后端课程
> 实施计划：[`dzzz-app-course-plan.md`](./java/dzzz-app-course-plan.md)

## 1. 目的

本规范规定后端知识点应从哪里取证、不同结论需要什么等级的证据，以及如何处理
`dzzz-app` 中的旧版本和不规范实现。课程不能把搜索结果、个人经验或项目现状直接写成
“正确答案”。

每个知识点必须先完成来源核验，再编写课程。来源需要与具体结论、适用版本和核验日期绑定，
不能只在文末堆放未实际使用的链接。

## 2. 核心原则

1. 语法和运行语义以规范与标准库合同为准。
2. 框架行为以精确版本的第一方参考文档、Javadoc、源码和测试为准。
3. JEP 用于解释动机和演进；最终语言语义仍以 JLS、JVMS 和 Java API 为准。
4. 易错点必须有权威依据或可重复验证，不能由项目中的一次写法推导普遍结论。
5. 开发技巧和风格属于工程建议，必须标明适用条件，不能包装成语法规则。
6. 安全结论需要规范、厂商公告或 OWASP/CWE/CERT 等安全证据。
7. 性能结论必须带测量环境和结果；没有测量时只说明验证方法，不给出普遍结论。
8. `dzzz-app` 只负责决定优先学习什么并提供旧项目场景，不能证明写法正确。
9. 现代稳定版本先讲；Java 8、Spring Boot 2.3.12 等项目版本放在补充章节。
10. 每次开始新知识点时重新核对当前稳定版本，不能永久复用本文件的版本快照。

## 3. 版本基线策略

### 3.1 现代课程主线

截至 2026-08-03，Oracle 支持路线将 Java 25 列为 LTS；Spring Boot 当前参考线为 4.1.0，
其官方系统要求说明支持 Java 17 至 Java 26；Maven 当前 GA 为 3.9.16。Java 主线采用当前仍受
支持的 LTS，框架课程采用与该 LTS 兼容且仍受官方维护的稳定 GA 版本。

以下内容不进入零基础稳定主线：

- preview 特性；
- incubator 模块；
- experimental 接口；
- 尚未 GA 的 Maven 或框架版本。

### 3.2 `dzzz-app` 补充线

项目补充线固定使用代码快照对应的精确版本：

| 项目 | 基线 |
| --- | --- |
| Java | Java 8 |
| Spring Boot | 2.3.12.RELEASE |
| Spring Framework | 5.2.15.RELEASE |
| 打包形式 | WAR |
| 启动类 | `com.tdh.DzzzAreaApplication` |

旧版内容只能使用相应归档文档解释。Oracle Java Tutorials 明确说明其内容为 JDK 8 编写，
部分实践可能不再适用于现代 Java，因此只能用于项目补充，不能作为现代主线来源。

## 4. 来源等级

| 等级 | 来源类型 | 可支持的结论 | 示例 |
| --- | --- | --- | --- |
| A | 规范性来源 | 语法、运行语义、标准 API 合同、协议规则 | JLS、JVMS、Java API、Jakarta 规范、RFC |
| B | 第一方实现来源 | 框架配置、版本行为、迁移、实现限制 | 官方 Reference、Javadoc、源码、测试、Release Notes |
| C | 行业标准与分析工具 | 安全要求、常见缺陷候选、性能验证方法 | OWASP、CWE、CERT、Error Prone、SpotBugs、JMH |
| D | 高质量工程经验 | 设计建议、代码风格、开发技巧 | 《Effective Java》、Google Java Style、维护者文章 |
| E | 线索来源 | 发现关键词、真实场景或待验证问题 | Stack Overflow、Baeldung、CSDN、个人博客、AI 输出 |

等级 E 不能单独支撑课程结论。GitHub issue 可以证明某个精确版本存在已确认问题，但不能自动
成为公共合同。发生冲突时，按 A、B、C、D、E 的顺序处理，并记录冲突原因。

## 5. 结论与来源的对应关系

| 要回答的问题 | 最低证据要求 | 补充证据 |
| --- | --- | --- |
| 这段 Java 语法是否合法 | A | 编译器最小复现 |
| 标准库方法如何工作 | A | OpenJDK 源码和测试 |
| 某个版本增加或删除了什么 | A 或 B | JEP、Release Notes、迁移指南 |
| Spring/MyBatis 配置如何生效 | B，且必须是精确版本 | 官方源码和测试 |
| 某种写法是不是常见缺陷 | A/B 加最小复现 | C 级静态规则或 issue |
| 某种设计是否更合适 | D，明确适用条件 | 项目调用链与测试证据 |
| 某个安全风险是否成立 | A/B/C | 厂商公告、CVE、最小复现 |
| 某种写法是否更快 | 测量结果 | JFR/JMC 定位、JMH 基准 |
| 某种命名或格式是否正确 | 已选定的风格约定 | 框架团队风格；不得称为语法要求 |

## 6. 已核验的主要入口

### 6.1 Java 与 JVM

- [Java Language Specification 25](https://docs.oracle.com/javase/specs/jls/se25/html/index.html)
- [Java Language Specification 8](https://docs.oracle.com/javase/specs/jls/se8/html/index.html)
- [Java Virtual Machine Specification 25](https://docs.oracle.com/javase/specs/jvms/se25/html/index.html)
- [Java Virtual Machine Specification 8](https://docs.oracle.com/javase/specs/jvms/se8/html/index.html)
- [Java SE 25 API](https://docs.oracle.com/en/java/javase/25/docs/api/index.html)
- [Java SE 8 API](https://docs.oracle.com/javase/8/docs/api/)
- [Dev.java Learn](https://dev.java/learn/)
- [JDK 8 Java Tutorials](https://docs.oracle.com/javase/tutorial/)
- [OpenJDK JEP Index](https://openjdk.org/jeps/0)
- [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html)

### 6.2 Spring

- [Spring Framework Reference](https://docs.spring.io/spring-framework/reference/)
- [Spring Boot Reference](https://docs.spring.io/spring-boot/)
- [Spring Boot System Requirements](https://docs.spring.io/spring-boot/system-requirements.html)
- [Spring Guides](https://spring.io/guides)
- [Spring Boot 2.3.12 Reference](https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/)
- [Spring Framework 5.2.15 Reference](https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/spring-framework-reference/)

Spring Guides 适合作为教学示例；精确行为仍需回查 Reference、Javadoc、源码或官方测试。

### 6.3 构建、数据与常用组件

- [Maven Guides](https://maven.apache.org/guides/)
- [Maven POM Reference](https://maven.apache.org/pom.html)
- [Maven Version History](https://maven.apache.org/docs/history.html)
- [MyBatis 3](https://mybatis.org/mybatis-3/)
- [MyBatis-Spring](https://mybatis.org/spring/)
- [MyBatis-Plus](https://baomidou.com/)
- [Jakarta Bean Validation 3.1](https://jakarta.ee/specifications/bean-validation/3.1/)
- [Bean Validation 2.0](https://beanvalidation.org/2.0/spec/)
- [Hibernate Validator](https://docs.jboss.org/hibernate/stable/validator/reference/en-US/html_single/)
- [Redis Documentation](https://redis.io/docs/latest/)
- [Spring Data Redis](https://docs.spring.io/spring-data/redis/reference/)
- [Jackson](https://github.com/FasterXML/jackson-docs)
- [Lombok](https://projectlombok.org/features/)

### 6.4 协议、安全与性能

- [RFC 6455 WebSocket](https://www.rfc-editor.org/rfc/rfc6455)
- [Jakarta WebSocket 2.2](https://jakarta.ee/specifications/websocket/2.2/)
- [Spring WebSocket](https://docs.spring.io/spring-framework/reference/web/websocket.html)
- [Oracle Secure Coding Guidelines](https://www.oracle.com/java/technologies/javase/seccodeguide.html)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)
- [CWE](https://cwe.mitre.org/)
- [Error Prone Bug Patterns](https://errorprone.info/bugpatterns)
- [SpotBugs Bug Descriptions](https://spotbugs.readthedocs.io/en/stable/bugDescriptions.html)
- [OpenJDK JMH](https://github.com/openjdk/jmh)

## 7. 单个知识点的研究流程

1. 从已完成审计的 `dzzz-app` 能力矩阵选择一个知识点。
2. 冻结课程 ID、现代基线、项目基线、前置知识和项目证据。
3. 按结论类型选择最低来源等级，优先打开直接页面而不是搜索摘要。
4. 为关键结论记录页内章节、适用版本和核验日期。
5. 使用现代稳定版本建立最小正确示例。
6. 从 `dzzz-app` 提取最小业务背景，删除密钥、内网地址和敏感数据。
7. 如果项目原写法不规范，保留场景并重写为正确的 Java 8 兼容示例。
8. 对易错点建立触发条件、原因、后果和最小复现。
9. 对性能建议运行或引用可复查的测量，不足时删除性能结论。
10. 完成来源卡和课程自检后，才允许登记到课程 manifest。

## 8. 易错点取证规则

每个易错点必须回答：

```text
现象 -> 触发条件 -> 原因 -> 后果 -> 错误示例 -> 正确写法 -> 影响版本 -> 验证方式 -> 来源
```

建议取证顺序：

1. 规范、Javadoc 或官方文档中的 warning、note、异常合同和限制。
2. 精确版本的 Release Notes、迁移指南、FAQ 和已确认 issue。
3. 编译器警告、Error Prone、SpotBugs 等静态规则。
4. 官方源码和测试，以及本地最小复现。
5. 社区问答中的真实场景；只用作补充，不用作最终证明。

## 9. 开发技巧、风格和性能规则

- 开发技巧必须写明适用条件和权衡，至少有一条 D 级以上来源或项目调用链证据。
- 风格统一采用课程后续明确选定的 house style；Google 或 Spring 风格只能作为参考约定。
- Oracle 1999 Java Code Conventions 已归档，不作为现代默认规范。
- 《Effective Java》等书籍可支持设计建议，但不能覆盖框架版本合同。
- 性能内容先用 JFR/JMC 定位，再用 JMH 做受控验证。
- 性能记录必须包含 JDK、依赖、硬件、参数、负载和结果。
- 单篇博客、一次本地耗时或没有预热的循环不能支撑性能结论。

## 10. `dzzz-app` 证据处理

项目证据至少记录相对路径和稳定符号名，不依赖容易漂移的行号范围。课程不得直接复制大段业务
代码，必须做最小化改写，并按以下状态标记：

| 状态 | 含义 |
| --- | --- |
| `observed` | 仅证明项目使用了该能力，不作为推荐示例 |
| `adapted` | 保留项目场景，移除业务噪声后仍保持原有正确语义 |
| `corrected` | 项目写法不规范，课程展示的是纠正后的兼容实现 |
| `rejected` | 不适合教学，不进入课程正文，只保留在审计排除记录 |

严禁写入真实密钥、令牌、身份证件、手机号、内网地址、数据库连接和未公开业务数据。

## 11. 来源卡合同

每篇后端知识点必须在 frontmatter 中提供来源卡，结构由
[`knowledge-point-template.md`](./knowledge-point-template.md) 统一定义。最低字段为：

```yaml
verifiedAt: YYYY-MM-DD
modernBaseline: {}
legacyBaseline: {}
sources:
  - id: stable-source-id
    title: 来源标题
    url: https://example.com/direct-page
    sourceType: specification
    appliesTo: 精确版本
    claims:
      - 本来源支持的结论
projectEvidence:
  - file: dzzz-app/相对路径.java
    symbol: 稳定符号名
    usage: observed
```

来源链接必须指向直接页面；不能只链接搜索页、首页或未使用的整本规范。

## 12. 发布 Gate

本节只校验研究和来源；正文结构与字段以
[`knowledge-point-template.md`](./knowledge-point-template.md) 的 Authoring Gate 为准。知识点只有同时
满足以下研究条件才可发布：

- [ ] 现代版本和项目版本均已明确。
- [ ] 每条关键语法或框架结论达到最低来源等级。
- [ ] 项目证据来自 `dzzz-app`，没有混入其他模块同名代码。
- [ ] 项目示例已经去敏，并标记 `adapted` 或 `corrected`。
- [ ] 易错点具备触发条件、后果、正确写法和验证方式。
- [ ] 开发技巧标明适用条件，风格建议没有写成语言规则。
- [ ] 性能或安全结论达到对应证据门槛。
- [ ] 所有 URL、版本和 `verifiedAt` 已在当前批次重新核验。
- [ ] Markdown 通过模板校验、格式检查和课程站最小验证。
