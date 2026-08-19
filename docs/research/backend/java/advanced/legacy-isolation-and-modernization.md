# Java 高级第 16 门：Legacy 隔离、javax/jakarta 与现代化迁移研究

> 课程 ID：`backend.java.learn.advanced.legacy-isolation-and-modernization`
>
> 冻结顺序：650
>
> 研究日期：2026-08-14
>
> 冻结快照：`dzzz-app-20260803-179e722831ab`
>
> 边界：只使用 Phase 2 冻结矩阵与本稿核验的一手资料；不读取、搜索、运行或修改 `dzzz-app`。

## 冻结课程合同

- 标题：Legacy 隔离、javax/jakarta 与现代化迁移。
- 阶段：`advanced`；深度：`lesson`；顺序：650。
- 前置课程：
  1. `backend.java.learn.intermediate.spring-boot-and-configuration`。
  2. `backend.java.learn.intermediate.lombok-and-generated-contracts`。
- `sourceCapabilityIds` 只能是：
  1. `JAVA-ENGINEERING-034`：兼容性合同与 legacy 隔离。
  2. `JAVA-RISK-041`：旧 API、平台默认与历史命名兼容污染。
- 选择原因：Java 8、Spring Boot 2.3、旧 API、`javax` 命名空间和历史命名必须与现代主线隔离，
  并通过可验证的迁移地图逐步退出。
- `JAVA-ENGINEERING-034` 的项目证据政策是 `project-observed-capability`；正文中的去敏兼容边界可标为
  `observed`，但不能由路径或类名推断实现正确。
- `JAVA-RISK-041` 的证据政策是 `project-risk-evidence-only`；所有项目风险例子必须标为 `rejected`，
  只能解释为什么要迁移，不能复制成推荐实现。
- 冻结状态保持 `researchStatus: not-started`、`exampleStatus: not-started`、`courseStatus: planned`。
  本稿不修改冻结矩阵、正文、track、loader 或 signoff。

## 研究范围与版本基线

### 现代主线

- Java 25 LTS。
- Spring Boot 4.1.0，要求 Java 17 至 Java 26，并要求 Spring Framework 7.0.8 或更高版本；本课固定
  Framework 7.0.8 作为可复核基线。
- Jakarta EE 规范包使用 `jakarta.*`。Spring Framework 6 起已迁移到 Jakarta EE 9；Spring 7 主线
  不与 Spring 5.2 的 Java EE `javax.*` 类型、容器或依赖混装。`javax.sql`、`javax.crypto` 等 Java SE 包
  不属于这次 namespace 迁移，禁止全局字符串替换。
- 现代示例使用受支持的 Java SE API、`Path` / `Files`、显式 charset、try-with-resources、当前框架插件
  API 和规范 JavaBean 命名。

### Legacy 隔离线

- Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE。
- Boot 2.3.12 从 Java 8 起运行，兼容至 Java 15，并要求 Spring Framework 5.2.15.RELEASE 或以上。
- 旧线保留 Java EE 的 `javax.*` 命名空间和当时真实存在的配置、容器与依赖合同；它是隔离兼容线，不是
  现代 Jakarta EE 示例的 import 来源。
- JDK 8 曾包含或聚合部分 Java EE/CORBA 模块，不代表 Java 11 至 25 继续提供 JAXB、JAX-WS、Activation、
  CORBA 或相关工具。缺失能力必须成为显式应用依赖，或在迁移中移除。

### 明确非目标

- 不在一批中同时升级 JDK、Spring Boot、Spring Framework、数据库驱动、持久层插件和业务协议。
- 不把全量自动改写、反编译源码复制、永久 `--add-opens` / `--add-exports` 或双命名空间共存当作最终方案。
- 不重讲文件、WebSocket、MyBatis、配置绑定或可观测性的完整 API；本课只研究它们的版本隔离与迁移 Gate。
- 不给出未经测量的启动、吞吐、延迟、内存或 GC 结论。

## 搜索与核验说明

- 按仓库顺位先用 Tavily 定位 Oracle、OpenJDK、Spring、Jakarta 迁移入口和 MyBatis-Plus 官方页面；搜索摘要
  只用于发现 URL，结论回到固定版本规范、Javadoc、迁移指南或项目官方文档核验。
- 下列 24 个 URL 是本稿实际使用的唯一直接来源，均于 `2026-08-14` 核验。固定 JDK 规范、JEP、固定 Spring
  版本页面的 `driftRisk` 为 low；current 文档、wiki、支持路线和工具首页为 medium，正文发布前需重查。
- Tavily 已提供足够的一手来源，没有进入 Exa、Parallel、Perplexity 或原生 web search。

## 一手来源卡

| ID | URL | sourceType | appliesTo | 支持结论 | driftRisk |
| --- | --- | --- | --- | --- | --- |
| `oracle-java-support-roadmap` | <https://www.oracle.com/java/technologies/java-se-support-roadmap.html> | `official-reference` | Oracle Java SE support roadmap | Java 25 是 LTS；课程现代线固定为 Java 25，不把当前补丁号写成长期合同。 | medium |
| `boot410-system-requirements` | <https://docs.spring.io/spring-boot/system-requirements.html> | `official-reference` | Spring Boot 4.1.0 | Boot 4.1.0 要求 Java 17 至 26，并要求 Spring Framework 7.0.8 或以上。 | medium |
| `boot2312-system-requirements` | <https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/getting-started.html#getting-started-system-requirements> | `official-reference` | Spring Boot 2.3.12.RELEASE | 旧线从 Java 8 起运行，兼容至 Java 15，并要求 Framework 5.2.15.RELEASE 或以上。 | low |
| `boot-upgrading` | <https://docs.spring.io/spring-boot/upgrading.html> | `official-reference` | Spring Boot upgrade routes | 跨多个版本时必须逐个阅读被跨过版本的 release note 和升级指南，不能只看目标版本。 | medium |
| `boot30-migration-guide` | <https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide> | `release-note` | Spring Boot 2.x to 3.0 | Boot 3 基于 Framework 6 和 Jakarta EE 10；依赖坐标与 import 都要迁移，旧 Java EE 传递依赖不得残留。 | medium |
| `spring607-overview` | <https://docs.spring.io/spring-framework/docs/6.0.7/reference/html/overview.html> | `official-reference` | Spring Framework 6.0.7 | Framework 6 要求 Java 17+，并从传统 `javax` 包迁到 Jakarta EE 9 的 `jakarta` 命名空间。 | low |
| `jdk25-migrate-from-8` | <https://docs.oracle.com/en/java/javase/25/migrate/migrating-jdk-8-later-jdk-releases.html> | `official-reference` | JDK 8 to JDK 25 migration | 模块边界、反射强封装、`--add-exports` 与 `--add-opens` 需逐项处理；开放内部包只承担临时迁移风险。 | low |
| `jdk25-removed-apis` | <https://docs.oracle.com/en/java/javase/25/migrate/removed-apis.html> | `official-reference` | APIs removed by JDK 25 | `sun.*` 多数是可随时变化的内部 API；如旧 Base64 API，应迁到受支持的 `java.util.Base64`。 | low |
| `jdk25-removed-tools` | <https://docs.oracle.com/en/java/javase/25/migrate/removed-tools-and-components.html> | `official-reference` | Tools/components removed by JDK 25 | JDK 11 移除了 Java EE/CORBA 模块和 JAXB/JAX-WS 等工具；缺失类型会导致编译或类加载失败。 | low |
| `openjdk-jep320` | <https://openjdk.org/jeps/320> | `release-note` | JDK 11 | 明确列出被移除的 Java EE、CORBA 聚合模块与工具模块；迁移要显式选择替代依赖。 | low |
| `openjdk-jep403` | <https://openjdk.org/jeps/403> | `release-note` | JDK 17+ / Java 25 | JDK 内部元素默认强封装；`--illegal-access` 不再恢复宽松模式，只能精确 `--add-opens`，且不构成长期兼容。 | low |
| `jdk25-jdeps` | <https://docs.oracle.com/en/java/javase/25/docs/specs/man/jdeps.html> | `official-reference` | JDK 25 `jdeps` | 可分析类或 JAR 的包、类、模块和 JDK 内部依赖；`--multi-release` 与 `--jdk-internals` 是不同检查轴。 | low |
| `jdk25-jdeprscan` | <https://docs.oracle.com/en/java/javase/25/docs/specs/man/jdeprscan.html> | `official-reference` | JDK 25 `jdeprscan` | 只报告 Java SE 定义的 deprecated API，不报告第三方库弃用，因此不能替代框架升级清单。 | low |
| `jls25-binary-compatibility` | <https://docs.oracle.com/javase/specs/jls/se25/html/jls-13.html> | `specification` | Java SE 25 binary compatibility | 源码修改可保持或破坏既有二进制兼容；能重新编译不等于旧消费者二进制仍可链接。 | low |
| `jvms25-class-file` | <https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-4.html> | `specification` | Java SE 25 class file format | Java 25 class major 为 69；class-file 版本是运行时能否加载的独立 Gate。 | low |
| `openjdk-jep400` | <https://openjdk.org/jeps/400> | `release-note` | JDK 18+ / Java 25 | JDK 18 起默认 charset 统一为 UTF-8；旧 `java.io` 默认字符集 API与固定 UTF-8 的新 API 混用仍有迁移风险。 | low |
| `java8-charset` | <https://docs.oracle.com/javase/8/docs/api/java/nio/charset/Charset.html> | `api-doc` | Java 8 | Java 8 默认 charset 在 VM 启动时确定，通常依赖操作系统 locale 与 charset；外部合同应显式指定。 | low |
| `java8-files` | <https://docs.oracle.com/javase/8/docs/api/java/nio/file/Files.html> | `api-doc` | Java 8 and later | Java 8 已提供 `Path` / `Files`、显式 charset 与可关闭 stream；及时释放资源应使用 try-with-resources。 | low |
| `mybatis-plus-pagination` | <https://baomidou.com/en/plugins/pagination/> | `official-reference` | Current MyBatis-Plus pagination plugin | 当前插件通过 `MybatisPlusInterceptor` 加 `PaginationInnerInterceptor` 配置；旧 `PaginationInterceptor` 只能留在版本绑定兼容说明。 | medium |
| `spring708-server-endpoint-exporter` | <https://docs.spring.io/spring-framework/docs/7.0.8/javadoc-api/org/springframework/web/socket/server/standard/ServerEndpointExporter.html> | `api-doc` | Spring Framework 7.0.8 | exporter 注册标准 Jakarta WebSocket endpoint，类型使用 `jakarta.websocket` 和 `jakarta.servlet`。 | low |
| `spring5215-server-endpoint-exporter` | <https://docs.spring.io/spring-framework/docs/5.2.15.RELEASE/javadoc-api/org/springframework/web/socket/server/standard/ServerEndpointExporter.html> | `api-doc` | Spring Framework 5.2.15.RELEASE | 旧 exporter 面向 JSR-356 `javax.websocket` 容器；它不能与 Spring 7 Jakarta 类型混装。 | low |
| `boot410-external-config` | <https://docs.spring.io/spring-boot/4.1/reference/features/external-config.html> | `official-reference` | Spring Boot 4.1.0 | 配置名以 canonical kebab-case 建模，再按规则映射环境变量；宽松绑定不授权保留异常 Java 属性命名。 | low |
| `openjdk-jep328` | <https://openjdk.org/jeps/328> | `release-note` | JDK 11+ / Java 25 JFR | JFR 记录 typed runtime events，可用 `jcmd` 启停和导出；它是观测工具，不是行为兼容证明。 | low |
| `openjdk-jmh` | <https://openjdk.org/projects/code-tools/jmh/> | `engineering-reference` | OpenJDK JMH | JMH 提供带预热、fork 和测量轮次的 JVM 基准工具；结果只适用于固定环境、负载和代码变体。 | medium |

## 冻结项目证据映射

以下只转录 Phase 2 冻结矩阵，不打开项目源码。路径和符号是稳定审计引用，不是推荐实现；两项计数可能
存在文件重叠，不能相加为 79 个独立实现。

| sourceCapabilityId | evidencePolicy / usage | projectEvidenceCount | 代表冻结路径与稳定符号 | 教学用途 |
| --- | --- | ---: | --- | --- |
| `JAVA-ENGINEERING-034` | `project-observed-capability` / `observed` | 3 | `.../constant/TsblTextCacheKeyBuilder.java` / `com.tdh.bdzz.constant.TsblTextCacheKeyBuilder`；`.../util/CommonUtil.java` / `com.tdh.bdzz.util.CommonUtil`；`.../enums/vidyo/common/VidyoDataCommon.java` / `com.tdh.bdzz.enums.vidyo.common.VidyoDataCommon` | 兼容合同、业务兼容和 legacy 隔离的观察场景；不由符号名推断实现方式。 |
| `JAVA-RISK-041` | `project-risk-evidence-only` / `rejected` | 76 | `.../config/MybatisPlusConfig.java` / `com.tdh.bdzz.config.MybatisPlusConfig`；`.../annoation/AutoValid.java` / `com.tdh.bdzz.annoation.AutoValid`；`.../timer/handler/clearExpireData/YzwYhbmSyncDataHandler.java` / `com.tdh.bdzz.timer.handler.clearExpireData.YzwYhbmSyncDataHandler`；`.../download/MossDownloader.java` / `com.tdh.bdzz.download.MossDownloader`；`.../util/AESUtils.java` / `com.tdh.bdzz.util.AESUtils` | 旧 API、平台默认、框架版本绑定和历史命名的拒绝场景。 |

## 冻结风险纠正合同

`JAVA-RISK-041` 的 12 条 normalized risk 必须完整保留，但只用于纠错：

| Risk | 冻结问题 | 正文纠正合同 |
| --- | --- | --- |
| `RISK-0046` | DataSource 强转具体连接池，并从 URL 字符串猜数据库 | 通过显式 capability、driver metadata 或配置选择方言；不强转、不从任意 URL 子串推断。 |
| `RISK-0056` | 包名或公开合同保留历史拼写 | 现代 API 使用正确命名；legacy adapter 维护旧名到新名的单向映射。 |
| `RISK-0072` | 公开类型或合同保留历史拼写 | 新类型与旧 wire/storage 名分层，兼容窗口内双读单写，未知别名拒绝。 |
| `RISK-0074` | 旧 `File` API 分散路径与资源语义 | 现代代码使用 `Path`、`Files` 与 try-with-resources，路径和关闭责任由一个边界拥有。 |
| `RISK-0115` | 平台默认 charset 造成环境差异 | 文件、网络、签名和缓存 key 全部显式指定协议 charset，并用非 ASCII fixture 回归。 |
| `RISK-0123` | 旧 `PaginationInterceptor` 与版本绑定 | legacy 线保留精确版本；现代线按当前 `MybatisPlusInterceptor` / `PaginationInnerInterceptor` 迁移并验证 SQL。 |
| `RISK-0137` | 公开结果方法保留历史拼写 | 保留兼容入口时只做代理和弃用标记，内部与新消费者统一使用正确方法名。 |
| `RISK-0179` | 从 URL 判断驱动并拼接旧时区参数 | 驱动、方言、时区和 URL 分别配置；未知组合 fail-closed，不修改用户提供的 URL 字符串。 |
| `RISK-0200` | 旧 `File` API 和手工流生命周期 | 所有权、异常与关闭合并到最小资源作用域；流式 API 的关闭由调用合同明确。 |
| `RISK-0256` | 反编译兼容源码被当成现代实现 | 只记录外部可观察合同，不复制反编译类型、命名、内部 API或生命周期设计。 |
| `RISK-0258` | Spring WebSocket 与 JSR-356 exporter 同时出现 | 明确选择 Spring handler 模型或标准 endpoint 模型；桥接层必须有唯一注册和容器测试。 |
| `RISK-0272` | Java 属性名大写开头并依赖宽松绑定 | 新配置模型使用规范 lower camel 字段和 kebab-case prefix；旧 key 只在显式别名层迁移。 |

## 五类兼容性不能互相代替

| 兼容性 | 要回答的问题 | 最小证据 | 不能替代 |
| --- | --- | --- | --- |
| 源码兼容 | 同一源码是否能在目标编译器和目标 API 面上编译 | 精确 JDK 的 `javac`、`--release`、warnings-as-errors | 旧二进制是否还能链接 |
| 二进制兼容 | 未重新编译的消费者是否能解析类、方法、字段和签名 | 固定旧消费者、JLS 13 检查、class major 与链接运行 | 启动后的配置和业务行为 |
| 运行时兼容 | 目标 VM、容器、反射、资源和启动参数是否能运行 | 冷启动、代表路径、错误路径、无非法开放依赖 | 依赖图是否无冲突 |
| 依赖图兼容 | 坐标、版本、transitive edge、包名和 provider 是否唯一 | lockfile/BOM、`dependency:tree`、`jdeps`、重复类检查 | 序列化、SQL、缓存 key 等业务合同 |
| 业务行为兼容 | 外部协议、持久化、排序、编码、错误和幂等是否保持 | golden fixture、双写/影子读取、回放、对账与回滚演练 | 性能、容量和长期可运维性 |

只有五类证据全部通过，迁移 Gate 才能标记为通过。某一类没有证据时必须是 `Deferred` 或 `Blocked`，不得用
“编译通过”“可以启动”或“页面能打开”替代。

## javax / jakarta 隔离与迁移地图

1. **冻结外部合同**：记录 API、消息、缓存 key、数据库 schema、配置 key、字符集、错误语义和回滚点；先补
   可重复回放，不先改 import。
2. **建立 legacy 基线**：Java 8 + Boot 2.3.12 + Framework 5.2.15 在独立构建和运行环境中锁定；保存依赖树、
   classpath、启动参数与代表行为摘要。
3. **盘点移除项和内部依赖**：对应用及第三方 JAR 运行 `jdeps --jdk-internals`、`jdeprscan` 和依赖树检查；
   反射、ServiceLoader、配置字符串和动态加载另做运行时探针，因为静态扫描不能证明它们不存在。
4. **先收敛最新兼容小版本**：按 Boot 官方升级路线逐个阅读被跨过版本的 release note；先消除弃用、替换旧插件
   和补齐显式依赖，不从 2.3 直接跳到 4.1 后才集中解释全部差异。
5. **切换 Java 与框架主版本**：每个批次只改变一组主要变量。Java EE/CORBA 移除项先外置；进入 Framework 6+
   后统一切换 Jakarta 依赖坐标、import、容器和测试，不保留同一运行单元内的双命名空间类型。
6. **用 adapter 隔离历史合同**：旧拼写、旧配置 key、旧 payload 和旧持久化值在边界映射；内部只流转规范模型，
   新写入只产生新合同，未知 legacy 值 fail-closed。
7. **逐层验证和回滚**：每一层都重跑五类兼容证据、双 JDK fixture、框架集成、数据回放与可观测检查；任何一层
   失败就回到上一可部署版本，不继续叠加升级。

### `--add-opens` / `--add-exports` 的临时例外合同

- 只允许精确到 `source-module/package=target-module`，禁止宽泛复制未知参数。
- 每一条例外必须绑定 owner、依赖、失败堆栈、替代 API、删除版本和 CI 检查。
- 例外只证明当前运行时暂时可启动，不证明内部 API 稳定、安全或未来兼容。
- 目标依赖升级或替换后立即删除；若例外数量增加，迁移 Gate 失败，不得把它写进永久启动模板。

## 正文知识点合同

正文必须使用 14 个独立三级知识点，每项完整包含“它是什么、有什么作用、什么时候使用、怎么使用、最小示例、
运行结果、常见误区”七字段：

1. 源码、二进制、运行时、依赖图和业务行为五类兼容性的定义与证据边界。
2. Java 8 / Boot 2.3 legacy 与 Java 25 / Boot 4.1 modern 的独立构建、运行和发布矩阵。
3. `javac --release`、class major 52/69 与“高版本编译器能编译”不等于低版本 VM 能加载。
4. BOM、直接依赖、transitive dependency、重复类和 provider 共同构成依赖图合同。
5. Java EE `javax.*` 到 Jakarta EE `jakarta.*` 是依赖坐标、import、容器和框架生态的成组迁移，不是全局
   字符串替换；Java SE 的 `javax.sql`、`javax.crypto` 等包不迁移。
6. JDK 11 移除 Java EE/CORBA 模块后，JAXB/JAX-WS/Activation 等能力必须显式外置或移除。
7. JDK 内部 API、强封装、`--add-opens` 与 `--add-exports` 的临时例外生命周期。
8. `jdeps`、`jdeprscan`、依赖树和运行时探针如何组合形成迁移 inventory。
9. 历史拼写、旧 wire key 与旧持久化值如何通过单向 adapter 迁到规范命名。
10. `File` 到 `Path` / `Files`、手工流到 try-with-resources 的资源所有权迁移。
11. Java 8 平台默认 charset 与 Java 25 UTF-8 默认变化下，为什么协议仍要显式 charset。
12. MyBatis-Plus 分页插件、WebSocket endpoint 等框架 API 必须绑定精确版本和单一编程模型。
13. DataSource、数据库方言、URL、时区和 Spring 配置 key 如何拆成可验证、fail-closed 的显式合同。
14. 分批升级、五类 Gate、回滚演练、JFR/JMH 测量如何组成现代化完成证据。

## 易错点合同

正文至少覆盖以下 14 项，并为每项写出“现象、触发条件、原因、后果、错误示例、正确写法、影响版本、验证方式、
来源”九字段：

1. 一次性升级 JDK、Boot、Framework、驱动和插件，失败后无法定位是哪条合同变化。
2. 只以源码重新编译通过声称兼容，遗漏旧消费者的二进制链接和业务行为。
3. 在 Java 25 上直接编译 Java 8 目标源码却不使用 `--release 8`，产出 major 69 或意外引用新 API。
4. 同一运行单元混入 `javax.servlet` 与 `jakarta.servlet`，类型名相似但二进制身份不同。
5. 假设 JAXB、JAX-WS、Activation 或 CORBA 仍由现代 JDK 提供，部署后类加载失败。
6. 把 `--add-opens` / `--add-exports` 永久写入启动脚本，掩盖内部 API 依赖。
7. `jdeps` 没有报告问题就声称无动态依赖，遗漏反射、配置类名、ServiceLoader 和生成代码。
8. 只升级直接依赖，不检查传递依赖、重复类、旧 provider 和未管理版本。
9. 直接删除历史拼写的公开类型、方法或 key，没有兼容 adapter、弃用窗口和消费者回放。
10. 机械复制反编译兼容源码，连同内部类型、旧命名和资源生命周期一起带入现代线。
11. 用 `File`、手工 close 和宽生命周期 stream 继续承载新实现，异常路径泄漏资源或丢失关闭错误。
12. 依赖 `Charset.defaultCharset()`，在 Java 8 主机差异或 Java 18+ 默认变化后产生文件、签名和缓存 key 漂移。
13. 只把 `PaginationInterceptor` 类名替换为新插件，或同时注册 Spring WebSocket 与标准 endpoint，未验证 SQL、
    容器注册、生命周期和唯一所有者。
14. 强转具体 DataSource、从 URL 子串猜方言/时区，或依赖异常大写属性宽松绑定，使实现细节成为公开配置合同。

## 双 JDK 纯 Java临时反馈环

实施正文时在 `/tmp/java-advanced-16-*` 专属目录生成一个 Java 8 语法的最小 fixture，仓库内不保留测试、class、
JFR 或 benchmark 产物。每个类、构造器和方法前使用规范中文 Javadoc。

1. `CompatibilityGate` 接收 source、binary、runtime、dependencyGraph、behavior 五个布尔证据；只有全部为 true
   才返回 `READY`，任一缺失固定返回 `BLOCKED`。
2. `LegacyNameAdapter` 只允许冻结的旧 key 映射到规范字段，断言 known legacy key 迁移一次、unknown key 被拒绝、
   modern writer 只写规范 key。
3. `EncodingBoundary` 用 `Path` / `Files` 和 `StandardCharsets.UTF_8` 写入并读取包含中文的固定文本，断言 bytes、
   字符串和 SHA-256 摘要一致，不调用平台默认 charset。
4. `ResourceBoundary` 用 try-with-resources 包住可计数的 `Closeable`，断言成功和异常路径都恰好关闭一次。
5. 输出固定为：`LEGACY_MODERNIZATION_PASS mapping=1 charset=1 close=1 failClosed=1`。
6. Java 25 使用 `javac -Xlint:all -Werror` 编译运行两次，`javap -verbose` 预期 class major 69；Java 8 使用
   `javac -source 8 -target 8 -Xlint:all,-options -Werror` 编译运行两次，预期 major 52。这里只排除目标版本选项本身
   的提示，其余代码告警仍作为错误。
7. Java 25 额外运行 `javac --release 8 -Xlint:all,-options -Werror`，证明 fixture 没有偷用 Java 9+ API；该输出预期
   major 52，但不能替代真实 Java 8 runtime 的两次执行。
8. 对 fixture JAR 运行 `jdeps --jdk-internals` 与 `jdeprscan --release 8`；预期无内部 API 命中和 deprecated
   Java SE API 命中。第三方框架弃用仍由精确版本的升级清单检查。
9. 若 Java 8 runtime 不可用，只能记录 `Deferred`，不得用 Java 25 `--release 8` 冒充运行证据。
10. 验证完成后使用 `find <target> -depth -delete` 删除专属临时目录，并确认路径不存在；不得使用 `rm -f`。

该 fixture 只证明最小 adapter、charset、资源关闭和 fail-closed Gate 在两条 JDK 线上可观察一致，不证明真实
Spring 容器、Jakarta 迁移、数据库、第三方依赖、完整业务数据或生产回滚已经通过。

## 框架与依赖验证矩阵

| Gate | Legacy 线 | Modern 线 | 通过条件 |
| --- | --- | --- | --- |
| Java | JDK 8，class major 52 | JDK 25，class major 69 | 分别编译运行，不跨线复用产物 |
| Spring | Boot 2.3.12 / Framework 5.2.15 | Boot 4.1.0 / Framework 7.0.8 | BOM 锁定且无未管理 Spring 版本 |
| 命名空间 | `javax.*` | `jakarta.*` | 每个运行单元只有目标 namespace；重复类检查为 0 |
| 移除模块 | 记录 JDK 8 隐式能力 | 显式依赖或完成移除 | clean environment 冷启动无 `ClassNotFoundException` |
| 内部 API | 记录已知债务 | `jdeps --jdk-internals` 为 0 | 临时 opens 清单不增长并有删除期限 |
| 配置 | 固定旧 key 与映射 | canonical kebab-case | unknown key、未知方言和缺失映射 fail-closed |
| 行为 | 旧数据回放与输出摘要 | adapter 后同一业务摘要 | 编码、排序、SQL、错误和外部合同对账一致 |

## 性能与观测边界

- 迁移前后先跑相同功能负载，再用 JFR 固定记录时长，比较启动阶段、类加载、异常、分配、线程和 GC 事件；
  保存 JDK、JVM 参数、负载、采样设置和 recording 摘要。
- 只有需要回答一个局部热点问题时才建立独立 JMH 工程；记录 JDK、CPU、OS、依赖版本、warmup、measurement、
  fork、输入规模和误差，比较 legacy adapter 与 modern 路径的同一工作量。
- “Java 25 更快”“Jakarta 迁移无开销”“新 Files API 一定更快”都没有本研究的测量支持，正文不得写入。
- JFR/JMH 不能证明依赖图、二进制、配置或业务行为兼容；性能回归也不能通过永久开放内部 API规避。

## 不能推出的结论

- 不能由 3 条 observed 能力证据推断项目已有完整现代化架构，也不能由 76 个风险文件推断 76 个独立缺陷。
- 不能由文件路径、历史拼写或配置类名推断当前运行版本、漏洞可利用性或真实数据格式。
- 不能由 `jdeps` / `jdeprscan` 清洁推出没有反射、生成代码、ServiceLoader、配置字符串或第三方弃用。
- 不能把所有 `javax.*` 全局替换为 `jakarta.*`；只迁移 Jakarta EE 规范覆盖的包，并按精确依赖和容器核验。
- 不能由 `javax` import 全部替换推出 Jakarta 迁移完成；依赖坐标、容器、序列化名、配置和集成测试仍需验证。
- 不能由 Java 25 上 `--release 8` 编译通过替代 Java 8 runtime，也不能由 class major 52 证明行为兼容。
- 不能由应用冷启动成功推出 API、SQL、缓存、文件、编码、授权或回滚合同未变。

## 发布 Gate

- [x] ID、标题、sequence 650、两项前置和两个 `sourceCapabilityIds` 与冻结矩阵一致。
- [x] Java 25 / Java 8、Boot 4.1 / 2.3.12、Framework 7.0.8 / 5.2.15 与 Jakarta / javax 已隔离。
- [x] 24 个唯一一手 URL 已记录 `sourceType`、`appliesTo`、支持结论、`driftRisk` 和核验日期。
- [x] `JAVA-ENGINEERING-034` 的 3 条 observed 证据与 `JAVA-RISK-041` 的 76 条 rejected 风险证据已转录。
- [x] 12 条 normalized risk、14 个七字段知识点、14 个九字段易错点和双 JDK 反馈环已冻结。
- [ ] 正文 frontmatter 使用本稿实际支持正文的同一 URL 集合，不增加正文末尾“参考资料”链接堆放章节。
- [ ] 双 JDK fixture、框架矩阵、Catalog、工程 Gate、桌面/390px 浏览器和独立 Standards/Spec 复审通过。
- [ ] 最终 signoff 绑定研究稿、正文、track、loader 和验证证据的实际 SHA，确认高级阶段 16/16。

## 研究结论与 Stop Boundary

本稿只完成 Java 高级第 16 课的研究 Gate。研究稿通过 Prettier、来源 URL 可达性、冻结映射、SHA 和 scoped
diff 核验后，主流程才可创建本课正文。当前不授权 track、loader、runtime `available`、signoff、Reference、
项目实践、其他课程、提交、暂存或推送；第 16 课完整关闭并确认高级阶段 16/16 后必须停止。
