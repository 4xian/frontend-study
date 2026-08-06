# `dzzz-app` Phase 1C 数据模型复核

> 批次：Phase 1C 第 5 批<br>
> 源码快照：`dzzz-app-20260803-179e722831ab`<br>
> 自动分析：`dzzz-app-analysis-20260803-958d37cf1be1`<br>
> 状态：已完成，1654/1654 个 Java 文件、58427/58427 LOC<br>
> 结构化事实源：[phase-1c-data-model/manifest.json](./reviews/phase-1c-data-model/manifest.json)
> 人工签核：[phase-1c-data-model-signoff.json](./reviews/phase-1c-data-model-signoff.json)

## 1. 本批边界

本批领取冻结清单中的四个物理范围：

```text
dzzz-app/src/main/java/com/tdh/bdzz/bo/**/*.java
dzzz-app/src/main/java/com/tdh/bdzz/dto/**/*.java
dzzz-app/src/main/java/com/tdh/bdzz/eo/**/*.java
dzzz-app/src/main/java/com/tdh/bdzz/vo/**/*.java
```

| 目录  | 库存索引    | 文件数 |   LOC |
| ----- | ----------- | -----: | ----: |
| `bo`  | `19..65`    |     47 |  1961 |
| `dto` | `402..684`  |    283 | 13523 |
| `eo`  | `847..1121` |    275 | 10031 |
| `vo`  | `2374..3422`|   1049 | 32912 |
| 合计  | 4 个连续区间 |   1654 | 58427 |

这四个目录在库存中是四个互不相邻的连续区间，与前四批 1234 个已复核路径零重叠。`timer/bo`、
`timer/dto`、`timer/eo` 等名字相似但不位于上述物理根目录的文件不属于本批。

明确排除：

- `po`、`service`、`controller`、`timer` 和其他尚未领取的目录；
- 其他 Maven 模块、数据库运行态、外部接口真实响应和真实业务数据；
- 能力矩阵、项目示例登记、拒绝模式登记和课程知识点正文；
- 对 `/Users/jian/Desktop/work/TDH/dzzz/dzzz-app` 的任何修改。

## 2. 复核方法

1. 先校验 Phase 1A、Phase 1B 和前四批产物，确认 3436 个 Java 文件、冻结 SHA-256、LOC 与已有
   台账没有漂移。
2. 按四个物理路径领取 1654 个文件，逐个核对冻结身份、主类型、字段、继承、显式公开方法、注解、
   框架信号和模块内调用候选。
3. 使用目标仓库 CodeGraph 核对 `dto/filter` 的真实调用边界；确认 7 个机器 `web-entry` 候选都是
   查询条件对象，不是 Servlet Filter 或 MVC Interceptor。
4. 从 75 个 Controller 的当前源码独立定位 `@Valid`/`@Validated` 参数，按显式 import、通配 import
   和唯一主类型解析到模型文件；不把“模型存在约束”误写成“请求一定触发校验”。
5. 分别记录 Lombok、Bean Validation、Swagger 2、Jackson、Fastjson、XStream/JAXB 和
   MyBatis-Plus 注解，不用单一的 DTO/VO/BO/EO 后缀代替真实职责。
6. 把逐文件结构、模型形态、对象边界、依赖、能力候选、风险候选和源码行号写入 34 个 JSONL
   分片；前 33 个分片各 50 条，最后 1 个分片 4 条。
7. 逐分片复核全部候选记录和异常集合，用独立签核文件的 34 个分片 SHA-256 绑定全部 1654 条
   逐文件结论；生成器只有在签核完整匹配后才能把候选状态从 `reviewing` 写为 `reviewed`。
8. 用独立校验器重新读取 1654 个模型和全部 Controller，按不同实现复算形态、直接校验触发、
   嵌套校验目标、敏感字段、序列化混用、模型行为和所有风险行号。

风险项 `DM-0001` 至 `DM-0928` 是 Phase 2 归一化输入，不是 928 个已经定性的独立缺陷。同一模式
会合并为课程知识点或拒绝模式；没有足够运行态证据的项目行为不会写成确定结论。

## 3. 当前状态叠加

Phase 1A 和 Phase 1B 继续保留生成时的历史状态。当前状态由前五批 Phase 1C 台账按唯一路径覆盖：

| 状态         | 主代码 | 测试 | 总数 |
| ------------ | -----: | ---: | ---: |
| `unreviewed` |    541 |    7 |  548 |
| `reviewing`  |      0 |    0 |    0 |
| `reviewed`   |   2888 |    0 | 2888 |
| `blocked`    |      0 |    0 |    0 |

累计人工复核为 2888/3436；Phase 1 Gate 尚未通过。

## 4. 模型形态与角色纠正

| `modelShape`                | 文件数 | 说明                                                   |
| --------------------------- | -----: | ------------------------------------------------------ |
| `business-transfer-model`   |     47 | `bo` 下的业务层中间传输对象                            |
| `external-contract-model`   |    303 | `eo` 或带显式 JSON/XML 字段映射的外部合同              |
| `query-filter-model`        |      7 | `dto/filter` 下的查询与分页条件                         |
| `request-input-model`       |    495 | 声明校验约束或被 Controller 直接触发校验的 DTO/VO       |
| `resource-wrapper-model`    |      8 | 承载流、文件或资源所有权的模型                          |
| `response-envelope-model`   |     16 | 提供 `success`、`fail`、`ok`、`error` 等结果工厂的封装 |
| `response-view-model`       |    578 | 没有输入或外部序列化信号的响应视图                      |
| `transfer-model`            |    200 | 没有更强边界信号的通用 DTO                              |

按物理目录看，47 个 `bo` 全部是业务传输模型；283 个 `dto` 分为 200 个通用传输、50 个请求输入、
25 个外部合同、7 个查询条件和 1 个资源包装；275 个 `eo` 分为 268 个外部合同、6 个响应封装和 1 个
资源包装；1049 个 `vo` 分为 578 个响应视图、445 个请求输入、10 个外部合同、10 个响应封装和 6 个
资源包装。

Phase 1B 因路径中的 `filter` 把 `BaseFilterDTO`、`CaseFilterDTO`、`CatalogFilterDTO`、
`CatalogTreeFilterDTO`、`JzSyncFilterDTO`、`NbjlFilterVO` 和 `VirtualCatalogFilterDTO` 标成
`web-entry`。CodeGraph 显示它们被 Controller、Service 和 Mapper 作为参数或查询条件消费；源码也
没有 Filter/Interceptor 组件合同。本批把这 7 个最终角色全部纠正为 `data-model`。

## 5. 校验声明与触发边界

| 校验信号                                      | 文件数/证据数 |
| --------------------------------------------- | ------------: |
| 声明至少一种 Bean Validation 约束             |           455 |
| Controller 参数直接使用 `@Valid/@Validated`   |           431 |
| 同时有约束和直接触发证据                      |           385 |
| 有约束但没有直接 Controller 触发              |            70 |
| 有直接触发但当前类型没有直接约束              |            46 |
| 含字段级嵌套 `@Valid`                         |            23 |
| 直接校验模型中指向带约束类型且未标 `@Valid` 的字段 |             0 |
| Controller 直接触发位置                       |           601 |
| 涉及 Controller 文件                          |            75 |

高频约束为 `@NotBlank` 448 个文件、`@NotNull` 38 个、`@Length` 33 个、`@Pattern` 22 个、
`@Size` 21 个、`@NotEmpty` 3 个和 `@Min` 2 个。这里按“文件是否使用某类约束”计数，同一文件可以
同时属于多行。

456 个文件从 `org.hibernate.validator.constraints` 导入旧的提供方专属约束。当前项目运行在旧的
Bean Validation 生态中，这能解释历史写法；现代课程示例应使用 `jakarta.validation.constraints`
标准约束。项目旧版补充再说明 Java 8/Spring Boot 2.3 下的 `javax.validation` 兼容关系，不能继续
推荐 Hibernate 旧包。

约束注解本身只描述规则。Spring MVC 参数需要 `@Valid` 或 `@Validated` 才会触发；集合或对象字段
还需要字段级 `@Valid` 才会级联。70 个“有约束但没有直接触发”的文件可能通过父对象级联或手动
`Validator` 生效，因此台账只记录缺少直接 Controller 证据，不断言这些约束一定失效。

首轮规则只判断字段类型名是否像本批模型，曾把 19 个没有 `@Valid` 的结构字段列为候选；按字段
所属包和 import 解析真实类型后，这些目标当前都没有声明校验约束，缺少 `@Valid` 不会造成约束
漏执行，因此最终风险台账不保留这 19 条伪缺口。

## 6. Lombok、继承与模型行为

| 信号                                  | 文件数 |
| ------------------------------------- | -----: |
| 使用 Lombok                          |   1608 |
| `@Data`                              |   1597 |
| `@Builder`                           |    395 |
| `@AllArgsConstructor`                |    141 |
| `@NoArgsConstructor`                 |    135 |
| 存在继承                             |     73 |
| `@Data` 与继承并用                   |     53 |
| Builder 与继承并用                   |      1 |
| 同一文件声明多个类型                 |     13 |
| 含非 `static` 成员模型               |      9 |
| 含非访问器的显式工厂或行为方法       |     24 |

`@Data` 会组合 getter、setter、`equals`、`hashCode` 和 `toString`。它不是所有 DTO 的默认正确答案：
敏感字段可能进入日志，继承模型需要明确父类字段是否参与相等性和输出，不可变请求或响应模型也不应
无条件暴露 setter。现代示例会按实际需要选 `record`、不可变类或精确的 Lombok 注解。

13 个多类型文件中，9 个含非 `static` 成员模型。非静态成员类会隐式持有外部对象引用，不适合作为
独立序列化合同。现代示例优先拆成独立类型；确实只服务于外部类型时，使用边界明确的 `static`
成员类型。

24 个模型含 `create*`、`build*`、`success`、`fail` 等显式方法。结果工厂和不变量构造可以属于
模型，但 I/O、日志、服务编排和外部调用不能因“方便”继续进入数据类；Phase 2 会按调用链合并和
筛选这些候选。

## 7. 序列化、资源与持久化泄漏

| 信号                              | 文件数 |
| --------------------------------- | -----: |
| 带显式序列化注解                  |     50 |
| XStream 映射                      |     41 |
| Jackson 映射                      |      9 |
| Fastjson 映射                     |      1 |
| 同一模型混用两套显式序列化注解    |      1 |
| 资源包装模型                      |      8 |
| DTO/VO 中出现 MyBatis-Plus 字段注解 |      1 |

`TsjdAnalyzeStatusEO` 同时出现 Jackson 与 Fastjson 映射信号。两套库对字段命名、忽略、空值和兼容
策略可能不同；课程不能用同一模型混搭来演示，应按一个明确协议选择一种序列化合同，并用测试固定
JSON 形状。

`QueryGgpRsVo` 使用 `@TableField`，把数据库字段策略带入 VO。现代示例应分开持久化模型、请求模型
和响应投影；需要转换时使用显式映射，不让传输合同随数据库列名和填充策略变化。

8 个资源包装模型需要单独讲所有权：谁打开流、谁关闭、能否重复读取、异常后如何清理。资源模型
不能因为有 Lombok setter 就允许任意替换仍未关闭的流。

## 8. 敏感字段与风险候选

| 风险类别                                    | 候选数 |
| ------------------------------------------- | -----: |
| 提供方专属旧校验注解                        |    456 |
| 敏感字段边界                                |    150 |
| 敏感字段可能进入 Lombok `toString`          |    142 |
| 有约束但无直接 Controller 触发              |     70 |
| `@Data` 与继承的相等性/输出边界             |     53 |
| 模型包含显式行为                            |     24 |
| 同文件多类型                                |     13 |
| 非 `static` 成员模型                        |      9 |
| 模型方法依赖 `BindingResult`                |      3 |
| 显式 `toString` 输出敏感字段                 |      3 |
| 其他单例类别合计                            |      5 |

“其他单例类别”包括 Builder 继承字段、模型内日志、混合序列化合同、原始集合字段和传输模型
持久化注解，各 1 条。以上合计 928 条候选。

150 个模型包含密码、访问令牌、授权码、应用密钥或内嵌密钥的配置串；识别范围覆盖普通 `token`、
`tokenId`、`app_token`，项目旧密码/口令缩写，`sqm`、`client_key`、`authorizeKey`、`xfSk`，以及
经调用语义确认的会议房间访问 key 和模型配置字段。普通业务主键、文档标识、快捷键、Session
属性名和状态开关均明确排除，不能把所有 `key`、`config` 或 `kl` 后缀一律视为凭据。其中 142 个
模型同时使用 `@Data`/`@ToString`；`BasicVO`、`FtpConfigurationEntity` 和 `PartyEntity` 的显式
`toString` 还引用了敏感字段。课程示例和文档不得复制真实值，并必须从对象输出中排除敏感字段。
模型是否真的被记录仍需结合调用点确认，不能仅凭字段存在就声称已经发生泄露。

## 9. 后续课程约束

1. 先讲类、字段、构造器、可变性、泛型和对象边界，再讲 DTO/VO/BO/EO 这些项目命名；后缀不是
   Java 或 Spring 的语义保证。
2. Bean Validation 必须并列讲“约束声明、入口触发、嵌套级联、分组和错误转换”，示例需要验证
   无 `@Valid` 与有 `@Valid` 的真实差异。
3. 现代课程以 Jakarta Validation 标准包为主；`javax.validation` 和 Hibernate 旧约束只放在
   Spring Boot 2.3 项目补充中。
4. Lombok 只按需要选注解；敏感字段禁止进入 `toString`，继承时明确 `equals/hashCode` 和 Builder
   是否包含父类状态。
5. Jackson、Fastjson、XStream/JAXB 分开讲协议边界，不用混搭模型作为推荐示例；字段兼容性必须
   由序列化测试固定。
6. 请求、响应、业务传输、外部合同和持久化模型分开；映射代码可以显式，但不能让一个大而全模型
   同时绑定 Web、数据库和外部接口。
7. 资源包装模型必须明确关闭责任和单次读取约束；响应封装使用泛型，避免原始类型和
   `Map<String, Object>` 逃逸。
8. 项目片段只作为去敏、最小化并纠正后的 legacy 补充；课程知识点开始前仍需按研究规范查询现代
   Java、Spring、Jakarta Validation、Jackson 等官方资料。

## 10. 验证与 Stop Boundary

本批正向验证覆盖：

- 3436 个冻结 Java 文件和 7 个 Phase 1B 分片逐字节一致；
- 前四批分别保持 34、150、338、712 个 Java 文件，路径零重叠；
- 第 5 批覆盖四个库存区间的 1654 个 Java 文件、58427 LOC 和 34 个分片；
- 1680 个类型声明、9832 个字段、1531 个显式公开方法与 Phase 1B 结构一致；
- 601 个 Controller 校验触发位置由独立校验器重新读取源码和 import 解析；
- 8 种模型形态、7 个角色纠正和 `DM-0001..DM-0928` 的类别、路径、行号均可独立复算；
- 五批路径零重叠，累计状态为 `reviewed=2888`、`unreviewed=548`。

2026-08-04 的最终验证结果：

| 验证                                                                  | 结果                                                                                                                               |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `npm --prefix docs/backend/java/audit/tooling run check`              | 退出码 `0`；Phase 1A、Phase 1B 和前 5 批人工台账均为 `PASS`                                                                        |
| `npm --prefix docs/backend/java/audit/tooling audit --audit-level=low`| 退出码 `0`；`found 0 vulnerabilities`                                                                                              |
| 在两个全新空目录重建第 5 批，再与正式产物逐文件比较                   | 两次生成和两次独立校验退出码均为 `0`；正式产物、两次重建彼此之间均逐字节一致                                                      |
| 三份 manifest SHA-256                                                 | 均为 `d3aaaabdcaa6e0e05e9dacb6f848803e06f848102a6fcd25ab7f34d76344ad44`                                                          |
| 人工签核文件 SHA-256                                                  | `7ded73279d41343bf88bcae871cbace62bf4dd3ed0009b521c4f73e2d96a87c1`                                                              |
| 临时副本篡改首条记录但不更新分片 SHA-256                              | 独立校验器退出码 `1`，按预期拒绝：`records-0001-0050.jsonl SHA-256 不一致`                                                      |
| 临时副本伪造首条 `finalRole` 并同步全部完整性哈希                     | 已同步分片、签核分片、签核文件和 manifest；独立校验器仍以退出码 `1` 按源码语义拒绝：`AdjustSignBO.java 最终角色不是 data-model` |
| 临时副本删除人工签核后运行生成器                                     | 生成器退出码 `1`，按预期因 `phase-1c-data-model-signoff.json` 不存在而拒绝                                                       |
| 临时副本把人工签核状态改为 `tampered` 后运行独立校验器                | 独立校验器退出码 `1`，按预期拒绝：`数据模型人工签核状态不是 approved`                                                            |
| `git -C /Users/jian/Desktop/work/TDH/dzzz status --short -- dzzz-app` | 无输出，目标模块保持 clean；目标仓库另有不属于本批的 `.gitignore`、`.codegraph/`、`CLAUDE.md` 变化                               |

独立 Standards / Spec 双轴复审已在上述证据冻结后完成：Standards `PASS / 0 finding`，Spec
`PASS / 0 finding`。复审确认敏感字段回归、确定性重建、独立校验、负向篡改拒绝和本批 Stop
Boundary 均符合计划与仓库规范。

本阶段当前未执行：

- Phase 1C 第 6 批“横切能力”或其他后续批次；
- 能力矩阵、项目示例登记、拒绝模式登记和课程覆盖矩阵；
- 外部知识点研究、Java 课程正文、菜单或 Markdown adapter；
- `dzzz-app` 源码修改或任何代码提交。
