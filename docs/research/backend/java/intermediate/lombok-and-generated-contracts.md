# Lombok、可变模型与生成合同研究稿

## 冻结课程合同

| 项目 | 冻结值 |
| --- | --- |
| 课程编号 | Phase C `I-17`；中级第 17/20 课 |
| 稳定 ID | `backend.java.learn.intermediate.lombok-and-generated-contracts` |
| 标题 | Lombok、可变模型与生成合同 |
| 预计时长 | 120 分钟 |
| 唯一前置 | `backend.java.learn.intermediate.openapi-documentation-and-api-integration`（I-16） |
| 处置 | 修订既有课程；稳定 ID 与既有 URL 不变 |
| 来源能力 | `JAVA-FRAMEWORK-017`、`JAVA-RISK-042` |
| 现代主线 | Java 25、Lombok 1.18.42、Maven Compiler Plugin 3.14.1；优先使用 record 和显式构造合同 |
| 项目补充线 | Java 8、Spring Boot 2.3.12.RELEASE、Lombok 1.18.30 |
| 本课范围 | 编译期生成边界、精确注解选择、builder、相等与文本合同、浅不可变与集合快照、delombok 审查 |
| 明确排除 | 实验性 Lombok 注解、JPA 代理实作、继承 builder、日志框架配置、把 delombok 当作已执行证据 |
| 项目边界 | 只读取冻结审计产物，不读取、运行或修改 `dzzz-app` |

## 核验基线与方法

- 核验日期：2026-08-16。正文 20 张来源卡逐条回到 20 个不同的直接官方页面核验，20/20 均返回 HTTP 200。已知 URL 已足够，没有启动外部搜索接替链。
- Lombok 功能页当前展示的是 1.18.46 文档，不是冻结版本快照；官方 changelog 证明 1.18.40 已加入 JDK 25 支持、1.18.42 又修复 JDK 25 问题，1.18.30 则已发布并加入 JDK 21 初始支持。I-17 仍冻结实际反馈环使用的 1.18.42/1.18.30，不把它们称为当前最新版。
- Lombok 1.18.42/1.18.30 官方 tag 中的功能模板支持本课所用注解语义，1.18.30 tag 的 javac 设置页也覆盖 JDK 1.6～1.8 的 classpath 用法；精确编译结果仍必须由对应 fixture 证明。课程 20 张来源卡中，Lombok 功能卡已同时标注 1.18.42 与 1.18.30 的适用边界，execution-path 卡单独支持 AST 转换机制。
- Maven Compiler Plugin 入口已更新为 3.15.0，不能继续用该滚动页面给 3.14.1 作精确版本证据；本稿改用 3.14.1 官方归档的 `compile:compile` 参数页。
- 项目证据来自冻结审计：项目约有 2330 个 Lombok 使用点，数据模型审计记录了 `@Data` 可变性、继承 equals/hashCode 和敏感字段进入 `toString` 的风险。数量是观察事实，不代表这些写法都正确。
- 本稿只记录来源和验证设计；课程正文、临时 fixture、Catalog 发布和 signoff 必须另行完成。

## 官方来源

| 来源 | 直接页面 | 适用版本或状态 | 支持的结论 |
| --- | --- | --- | --- |
| Lombok `@Getter`/`@Setter` | https://projectlombok.org/features/GetterSetter | 当前页面 1.18.46；冻结 1.18.42/1.18.30 需 fixture | 字段或类级访问器、访问级别与 `AccessLevel.NONE` |
| Lombok `@Data` | https://projectlombok.org/features/Data | 当前页面 1.18.46；冻结 1.18.42/1.18.30 需 fixture | getter、非 final 字段 setter、equals/hashCode、toString 与 required constructor 的组合及显式构造器例外 |
| Lombok `@Value` | https://projectlombok.org/features/Value | 当前页面 1.18.46；冻结 1.18.42/1.18.30 需 fixture | final 类、private final 字段、getter、全参构造器与显式覆盖；不保证引用对象深不可变 |
| Lombok `@Builder` | https://projectlombok.org/features/Builder | 当前页面 1.18.46；`@Singular` 1.16.0+、`@Builder.Default` 1.16.16+ | 生成位置；未设置字段默认得到零值；`@Builder.Default` 保留初始化值；`@Singular` 生成单项/多项/clear 方法和不可变结果集合 |
| Lombok `@EqualsAndHashCode` | https://projectlombok.org/features/EqualsAndHashCode | 当前页面 1.18.46；冻结 1.18.42/1.18.30 需 fixture | 默认纳入非 static、非 transient 字段，显式 Include/Exclude、`canEqual` 与 `callSuper` 边界 |
| Lombok `@ToString` | https://projectlombok.org/features/ToString | 当前页面 1.18.46；冻结 1.18.42/1.18.30 需 fixture | 默认输出全部非 static 字段，支持 `@ToString.Exclude` 与显式 Include；仅约束生成方法 |
| Lombok constructors | https://projectlombok.org/features/constructor | 当前页面 1.18.46；冻结 1.18.42/1.18.30 需 fixture | 无参/全参构造器；required constructor 只接收未初始化 final 与未初始化 `@NonNull` 字段，并为后者生成 null 检查 |
| Lombok `@NonNull` | https://projectlombok.org/features/NonNull | 当前页面 1.18.46；冻结 1.18.42/1.18.30 需 fixture | 参数入口 null 检查；默认抛出 `NullPointerException`，可由配置改变异常形式 |
| Lombok configuration | https://projectlombok.org/features/configuration | 当前页面 1.18.46 | 子目录继承、近源优先与 `config.stopBubbling = true` 停止向父目录查找 |
| Lombok delombok | https://projectlombok.org/features/delombok | 当前页面 1.18.46 | 将 Lombok 转换展开为 Java 源码以供工具、审查和调试；输出格式可能与原源码不同 |
| Lombok javac 执行路径 | https://projectlombok.org/contributing/lombok-execution-path | Lombok 1.18.42/1.18.30 | javac/Maven 中 Lombok 以 annotation processor 启动并转换 AST；它故意不把转换结果保存成普通生成源码 |
| Java 25 record | https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Record.html | Java SE 25 | record 的浅不可变、组件访问器、equals/hashCode/toString |
| Java 25 `Object.equals` | https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html#equals(java.lang.Object) | Java SE 25 | equals 的自反、对称、传递、一致和非空合同 |
| Java 25 `Object.hashCode` | https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html#hashCode() | Java SE 25 | equals 相等对象必须拥有相同 hashCode |
| Java 25 `List.copyOf` | https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#copyOf(java.util.Collection) | Java SE 25 | 返回不反映源集合后续结构修改的不可修改列表；拒绝 null 集合或元素，但不深复制元素 |
| Java 8 `Collections.unmodifiableList` | https://docs.oracle.com/javase/8/docs/api/java/util/Collections.html#unmodifiableList-java.util.List- | Java SE 8 | 返回只读视图，查询会读取底层列表，因此不是独立快照 |
| Java 25 `Filer` | https://docs.oracle.com/en/java/javase/25/docs/api/java.compiler/javax/annotation/processing/Filer.html | Java SE 25 | 通用处理器可创建 source、class 与辅助 resource 文件；这是 API 能力，不等于 Lombok 会落盘这些文件 |
| Maven Compiler Plugin 3.14.1 `compile` | https://maven.apache.org/plugins-archives/maven-compiler-plugin-3.14.1/compile-mojo.html#annotationProcessorPaths | Maven Compiler Plugin 3.14.1 | `annotationProcessorPaths` 限定处理器路径，`release`/`source`/`target` 控制编译目标 |
| OWASP Logging Cheat Sheet | https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html | 当前安全指南 | 访问令牌、口令、连接串、密钥等通常不应直接记录，事件数据还需防日志注入 |
| OWASP Mass Assignment Cheat Sheet | https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html | 当前安全指南 | allow-list 可绑定的非敏感字段，或使用只含客户端可编辑字段的 DTO |

## 补充版本与机制来源

| 来源 | 直接页面 | 支持的结论 |
| --- | --- | --- |
| Lombok changelog | https://projectlombok.org/changelog | 1.18.30、1.18.42 均为已发布版本；1.18.40 加入 JDK 25 支持，1.18.42 含 JDK 25 修复；当前版本为 1.18.46 |
| Lombok javac 设置 | https://projectlombok.org/setup/javac | JDK 1.6～1.8 可把 Lombok 放在 javac classpath；JDK 9+ 模块化项目还需 module path |
| Java 25 annotation processing | https://docs.oracle.com/en/java/javase/25/docs/api/java.compiler/javax/annotation/processing/package-summary.html | Java SE 25 | 声明处理器及其与处理环境、处理轮次通信的标准 API |
| Java 25 `javac` | https://docs.oracle.com/en/java/javase/25/docs/specs/man/javac.html#annotation-processing | Java 25 | 处理器路径或显式 `-proc` 请求注解处理；若生成新源码则进入下一轮，最后编译原始与生成源码 |

## 核验后的事实结论

1. Lombok 在 javac/Maven 中通过注解处理器入口参与编译，但核心行为是 AST 转换。课程可说“编译期生成成员并进入 class”，不能把通用 `Filer` 能力直接写成“Lombok 会生成源码或字节码文件”；`delombok` 才是显式展开源码的工具。
2. `@Data` 是一组默认合同的组合，不是“所有字段一律参与所有方法”：setter 只覆盖非 final 字段，equals/hashCode 默认排除 static、transient 字段；存在显式构造器时 `@Data` 不再生成 required constructor。
3. `@Value` 和 record 都只提供浅不可变边界。final 组件引用不能改绑，但引用指向的可变对象仍可变化；集合仍需在构造边界创建快照。
4. `@Builder.Default` 只在 builder 未设置该字段时保留初始化表达式；普通字段初始化本身不会成为 builder 默认值。`@Singular` 才承诺 build 后的结果集合不可修改，且后续继续操作 builder 不会修改已经构建的对象。
5. `@RequiredArgsConstructor` 只接收未初始化 final 字段和未初始化 `@NonNull` 字段；后者默认生成 NPE 检查。不能把“所有 final 或所有 `@NonNull` 字段”写成无条件规则。
6. `@EqualsAndHashCode` 的字段选择和继承策略必须显式审查。`canEqual` 是 Lombok 生成的继承辅助机制，但不能替代 `Object.equals` 的自反、对称、传递、一致与非 null 合同；参与 equals 的信息变化时，hashCode 一致性条件也随之变化。
7. `@ToString.Exclude` 只排除 Lombok 生成方法中的字段，不覆盖手写日志、异常消息或其他序列化路径。OWASP 要求令牌、口令、连接串、密钥等通常不直接落日志，并要求对事件数据做日志注入防护。
8. `List.copyOf` 的结果不反映源集合后续结构修改并拒绝 null，但不会深复制元素；Java 8 `Collections.unmodifiableList(source)` 只是读取底层列表的只读视图。Java 8 要得到独立结构快照，应先复制再包裹。
9. Mass Assignment 的边界不是“禁止 setter”，而是只允许绑定明确的非敏感字段，或用仅包含客户端可编辑字段的 DTO 隔离领域对象。
10. 类级 `@Builder` 相当于在没有其他构造器时引入 package-private 全参构造器并对其应用 builder。不能直接用隐式 `new Job()` 与 builder 对比默认值；验证若需要无参路径，必须显式声明相应构造器，或只断言 builder 的默认值。

## 冻结项目证据

| 来源能力 | 冻结证据 | 课程用途与边界 |
| --- | --- | --- |
| `JAVA-FRAMEWORK-017` Lombok 注解代码生成 | 冻结清单记录约 2330 个 Lombok 使用点，代表 `com.tdh.bdzz.bo.AdjustSignBO`、`com.tdh.bdzz.dto.DownloadDTO` 等模型 | 说明项目确实依赖编译期生成；课程展示等价显式 Java，不复制业务字段 |
| `JAVA-RISK-042` 可变模型、生成合同与继承构建 | 冻结风险记录 281 个相关文件，含 `FileProcessBO`、`DownloadDTO`、事件载荷模型 | 说明要检查 setter、equals/hashCode、builder 继承和敏感 `toString`；风险证据不等于运行时缺陷 |
| 数据模型审计 | 约 1608 个数据模型使用 Lombok，`@Data` 可变性和敏感字段日志风险有单独统计 | 课程用来解释为什么按职责选择注解，不能把 `@Data` 当默认模型模板 |

## 验证设计

现代反馈环使用最小 Maven 工程：`Order.java` 组合 `@Builder`、默认值、单项集合、身份相等与敏感字段排除，`LombokFeedback.java` 的 `main()` 检查 builder、不可变集合、equals/hashCode 和 `toString` 脱敏。执行 `mvn -q package` 后运行主类，固定输出 `LOMBOK_FEEDBACK_PASS builder=1 immutable=1 equality=1 redacted=1`，class major version 为 69。

兼容反馈环使用 Java 8 与 Lombok 1.18.30。`LegacyModel.java` 只使用 getter、必需参数构造器和敏感字段排除；执行 `mvn -q package` 后运行主类，固定输出 `LOMBOK_LEGACY_PASS getter=1 redacted=1`，class major version 为 52。record、JUnit、Surefire 和 delombok 不属于本批已执行证据；delombok 仅作为官方审查工具介绍。
