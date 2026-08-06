# `dzzz-app` Phase 1C 数据访问复核

> 批次：Phase 1C 第 4 批<br>
> 源码快照：`dzzz-app-20260803-179e722831ab`<br>
> 自动分析：`dzzz-app-analysis-20260803-958d37cf1be1`<br>
> 状态：已完成，712/712 个 Java 文件、38330/38330 LOC，另核对 14/14 份 Mapper XML<br>
> 结构化事实源：[phase-1c-data-access/manifest.json](./reviews/phase-1c-data-access/manifest.json)

## 1. 本批边界

本批领取冻结清单中的两个 Java 物理范围：

```text
dzzz-app/src/main/java/com/tdh/bdzz/dao/**/*.java
dzzz-app/src/main/java/com/tdh/bdzz/po/**/*.java
```

它们对应库存索引 `261..394` 和 `1174..1751`，共 712 个文件、38330 LOC。Mapper XML 实际不在
`src/main/resources`，而是与 Mapper 接口一起放在：

```text
dzzz-app/src/main/java/com/tdh/bdzz/dao/**/*.xml
```

14 份 XML、373 LOC 不属于 3436 个 Java 文件分母，因此作为带独立路径、SHA-256、LOC、namespace
和 statement 的支持证据纳入本批。Java 路径与前三批 522 个已复核文件零重叠。

明确排除：

- `dto`、`vo`、`bo`、`eo`、横切能力、异步能力和其他尚未领取的目录；
- 其他 Maven 模块、非 Mapper XML、数据库运行态和真实业务数据；
- 能力矩阵、项目示例登记、拒绝模式登记和课程知识点正文；
- 对 `/Users/jian/Desktop/work/TDH/dzzz/dzzz-app` 的任何修改。

## 2. 复核方法

1. 先运行 Phase 1A、Phase 1B 和前三批全量检查，确认 3436 个 Java 文件、冻结哈希和已有台账
   未漂移。
2. 按 `dao`、`po` 物理路径领取 712 个 Java 文件，逐个校验冻结 SHA-256 和 LOC。
3. 使用结构化 XML 解析器读取 14 份 Mapper XML，核对根元素、namespace、38 个 statement、动态
   SQL 元素和实际源码行号，不用正则猜测 XML 结构。
4. 以 `mapper-contract`、`managed-persistence-service`、`persistence-model`、
   `support-data-model` 和 `generated-xml-model` 区分 Mapper、持久化模型、普通连接参数对象与
   JAXB/JAX-WS 生成模型。
5. 对 160 个显式 Mapper 方法分别核对注解 SQL、同 namespace XML statement 或已确认的 MyBatis-Plus
   SQL Injector 绑定；XML 中无 Java 方法的 statement 单独登记。
6. 把逐文件角色、映射模式、生命周期、依赖、能力候选、风险候选和 Java/XML 行号写入 15 个
   JSONL 分片，前 14 个分片各 50 条，最后 1 个分片 12 条。
7. 用独立校验器重新推导形态、绑定和关键风险，并验证路径、顺序、哈希、行号、分片、跨批次
   零重叠及累计状态。

风险项 `DA-001` 至 `DA-070` 是 Phase 2 归一化输入，不是 70 个已经定性的独立缺陷。相同模式会
在后续合并成一个知识点，再决定项目片段是可改写示例、迁移反例还是不应进入课程。

## 3. 当前状态叠加

Phase 1A 和 Phase 1B 继续保留生成时的历史状态。当前状态由前四批 Phase 1C 台账按唯一路径覆盖：

| 状态         | 主代码 | 测试 | 总数 |
| ------------ | -----: | ---: | ---: |
| `unreviewed` |   2195 |    7 | 2202 |
| `reviewing`  |      0 |    0 |    0 |
| `reviewed`   |   1234 |    0 | 1234 |
| `blocked`    |      0 |    0 |    0 |

累计人工复核为 1234/3436；Phase 1 Gate 尚未通过。

## 4. 数据访问形态与角色纠正

| `dataAccessShape`             | 文件数 | 最终角色            | 结论                                               |
| ----------------------------- | -----: | ------------------- | -------------------------------------------------- |
| `mapper-contract`             |    132 | `data-access`       | Java 接口，由 MyBatis 创建代理                     |
| `managed-persistence-service` |      2 | `data-access`       | `@Service` + `ServiceImpl<Mapper, Entity>`         |
| `persistence-model`           |    128 | `persistence-model` | 含显式 `@TableName` 的 MyBatis-Plus 表映射模型     |
| `support-data-model`          |      3 | `data-model`        | 普通存储连接参数对象，没有表映射                   |
| `generated-xml-model`         |    447 | `data-model`        | Vidyo JAXB/JAX-WS 生成模型或包级 XML Schema 元数据 |

Phase 1B 因路径把全部 578 个 `po` 文件标为 `persistence-model` 候选。人工复核纠正了 450 个角色：
447 个 Vidyo 生成模型，以及 `MossServer`、`Sftpserver`、`TuFtpserver` 3 个普通连接参数对象。目录名
只能作为候选，不能代替注解、泛型关系和调用方证据。

447 个生成文件包括 435 个类、6 个枚举、3 个 Web Service 接口和 3 个 `package-info.java`。其中
446 个文件有 Phase 1B JAXB 信号；`replay/package-info.java` 使用全限定 `@XmlSchema`，因此未被旧提取
规则识别。`admin` 和 `client` 的 `package-info.java` 还残留了无职责的空类 `packageinfo`，但人工职责
统计按物理文件及第 1 行包注解将三者统一视为包级 XML Schema 元数据。现代写法应只保留包注解、
`package` 声明和必要 import，不添加占位类。

## 5. Mapper 代理与方法绑定

`MybatisPlusConfig` 使用 `MapperScannerConfigurer` 扫描 `com.tdh.bdzz.dao`，因此 132 个 Mapper
接口不需要逐个写实现类。只有 20 个接口显式写了 `@Mapper`；其余接口仍由包扫描创建代理并注册成
Spring Bean。课程不能把 Mapper 接口描述成普通接口实例，也不能根据是否出现 `@Mapper` 单独判断
它是否可注入。

| 映射模式                         | 文件数 | 说明                                                      |
| -------------------------------- | -----: | --------------------------------------------------------- |
| `mybatis-plus-base-mapper`       |     91 | 只使用继承的 MyBatis-Plus 通用 CRUD                       |
| `java-annotation-sql`            |     26 | 自定义方法由 `@Select`/`@Insert`/`@Update`/`@Delete` 绑定 |
| `mapper-xml`                     |      9 | 自定义方法由同 namespace Mapper XML 绑定                  |
| `java-annotation-and-mapper-xml` |      5 | 同一接口同时使用注解和 XML，但同一方法没有重复绑定        |
| `custom-sql-injector-contract`   |      1 | `EasyBaseMapper` 的批量方法由项目 SQL Injector 注入       |

132 个 Mapper 中有 131 个继承 `BaseMapper` 或 `EasyBaseMapper`。显式声明的 160 个方法全部找到绑定：
123 个使用 Java 注解，36 个匹配 XML statement，1 个由 SQL Injector 提供，没有未解析的 Java 方法。

XML 另有 `updateBatch`、`editFtList` 两个 statement id，没有对应的当前 Java Mapper 方法，项目内精确
文本搜索也只命中 XML 定义。台账把它们登记为遗留绑定候选；是否删除仍需在后续结合运行态和版本历史
判断，本阶段不直接定性。

## 6. Mapper XML 与动态 SQL

14 份 Mapper XML 共 38 个 statement，没有 `resultMap`；查询主要通过 `resultType` 或 Map 投影返回。
动态元素汇总为 22 个 `<if>`、3 个 `<foreach>`、2 个 `<set>` 和 2 个 `<where>`。XML 中没有发现
`${...}` 原始替换或 `SELECT *`，但 Java 注解 SQL 中存在动态脚本和原始替换。

项目 `pom.xml` 显式把 `src/main/java/**/*.xml` 复制为资源，所以当前布局可以被打包；这不等于推荐
把资源放在 Java 源目录。现代课程示例应把 Mapper XML 放到 `src/main/resources` 的明确路径，并用
构建或测试验证它已经进入运行时 classpath。

4 个 Mapper 在 Java 注解 SQL 的 17 个位置使用 `${...}` 拼接动态表名，涉及 `CatalogMapper`、
`DownloadMapper`、`DzzzSqlMapper` 和 `VirtualCatalogMapper`。MyBatis 的 `#{...}` 是值参数绑定，
`${...}` 是原始文本替换；动态表名不能使用普通值绑定，但必须先映射到受控白名单，不能直接接受
请求参数或任意字符串。

## 7. 分页、投影与持久化模型

| 信号                                     | 数量 |
| ---------------------------------------- | ---: |
| 显式 `@TableName`                        |  128 |
| 含 `@TableId` 的持久化模型               |   88 |
| 注解 SQL statement                       |  123 |
| 使用原始 `Page` 参数的 Mapper            |   15 |
| 返回 `Map` 投影的 Mapper                 |   24 |
| 超过 200 LOC 的 Mapper                   |    4 |
| Lombok `toString` 可能包含凭据字段的模型 |    7 |

4 个超大 Mapper 为 `EajFtsyMapper` 475 LOC、`DzzzTsxqMapper` 371 LOC、`DzzzSqlMapper` 291 LOC 和
`DzzzFybHyXqMapper` 223 LOC。现代示例应按查询用例和稳定投影拆分，而不是让单个接口持续聚合无关 SQL。

`IPage<Map<String, Object>>` 等写法同时丢失字段名和字段类型的编译期合同；课程优先使用明确的投影
DTO 和带泛型的分页类型。Map 可以用于真正动态的列集合，但必须把动态性写进方法合同，不能为了
省略类型就普遍返回 Map。

7 个模型把密码或访问凭据字段与 Lombok `@Data`/`@ToString` 放在同一类型中。台账只记录字段行号，
不复制任何秘密值。现代示例必须从 `toString` 排除敏感字段，并禁止把凭据对象整体写入日志。

## 8. 风险候选分布

| 类别                           | 文件/候选数 | 后续教学处理                             |
| ------------------------------ | ----------: | ---------------------------------------- |
| Map 结果缺少明确投影合同       |          24 | 使用 DTO/record 投影，动态结果需明确合同 |
| Mapper XML 位于 Java 源目录    |          14 | 迁移到资源目录并验证打包                 |
| 分页参数使用原始 `Page` 类型   |          15 | 使用带泛型的分页边界                     |
| 凭据可能进入 Lombok `toString` |           7 | 排除敏感字段，禁止整体记录凭据对象       |
| 超大 Mapper 合同               |           4 | 按查询用例和投影职责拆分                 |
| `${...}` 原始 SQL 替换         |           4 | 只允许白名单标识符，值一律参数绑定       |
| XML statement 无 Java 方法     |           2 | 结合调用证据与历史确认是否为遗留映射     |

以上共 70 条候选。校验器还确认没有未解析的 Java Mapper 方法、没有重复 namespace，14 份 XML 都能
绑定到当前批次的 Java Mapper。

## 9. 后续课程约束

1. 先讲 Java 接口、泛型和 MyBatis 代理生命周期，再讲 `BaseMapper` 通用 CRUD；不要从字段注入 Mapper
   的旧项目片段开始。
2. SQL 参数课程必须并列解释 `#{...}` 与 `${...}`，动态标识符只接受枚举或白名单映射结果。
3. Mapper XML 课程必须覆盖 namespace、statement id、参数名、结果映射、动态 SQL 和资源打包验证。
4. 分页示例使用明确的请求边界、带泛型分页对象和稳定投影 DTO，不返回无合同的 Map。
5. 持久化模型只承担表与字段映射；Web 请求、业务输出和外部 SOAP 合同使用独立模型。
6. JAXB/JAX-WS 生成代码先解释生成来源和再生成流程，不能把 447 个生成文件当作手写 Java 风格。
7. 含凭据的对象禁止自动输出敏感字段，课程示例和文档不得出现真实凭据、内网地址或业务数据。
8. 项目使用 MyBatis-Plus 3.4.2 和旧分页插件的事实只作为 legacy 补充；现代稳定版本和 API 必须在
   对应知识点研究阶段重新查官方资料后再写正文。

## 10. 验证与 Stop Boundary

本批正向验证覆盖：

- 3436 个冻结 Java 文件和 7 个 Phase 1B 分片逐字节一致；
- 前三批分别保持 34/34、150/150、338/338 个文件；
- 第 4 批覆盖索引 `261..394`、`1174..1751` 的 712 个 Java 文件、38330 LOC 和 15 个分片；
- 14 份 Mapper XML 的路径、SHA-256、LOC、namespace 和 38 个 statement 与当前源码一致；
- 四批路径零重叠，累计状态为 `reviewed=1234`、`unreviewed=2202`；
- `DA-001..DA-070` 连续、唯一，Java/XML 风险和证据行号均在对应冻结 LOC 内；
- 5 种数据访问形态、450 个角色纠正、160 个显式 Mapper 方法绑定通过独立校验。

最终验证结果：

- `npm run check` 通过，Phase 1B 的 3436 个文件及前四批人工台账均与冻结输入一致；
- `npm audit --audit-level=low` 为 0 个已知漏洞，定向 Prettier 检查通过；
- 两个全新空目录的重建结果与正式产物、彼此之间均逐字节一致；
- 当前 manifest SHA-256 为
  `9b124efcb59a4e9d450782eef602bf236b31cfddb1b4e768794840c948d9f094`；
- 未同步分片哈希的内容篡改按预期失败；同步哈希后篡改 Mapper 生命周期、XML 风险证据来源、XML
  根元素行号或删除 `DzzzTUser.historyPwd` 凭据风险，均被独立校验器拒绝；
- 目标 `dzzz-app` 工作树保持 clean，未修改任何源码或 Mapper XML。

首轮独立复审的 Standards 轴为 `PASS / 0 finding`；Spec 轴提出提前关闭、XML 风险证据来源、
`historyPwd` 漏报和工具清单 4 项 finding 已修正。第二轮 Spec 复审又发现 XML 根元素行号信任
manifest 的 1 项 finding，当前校验器已改为从实际 XML 独立定位并核对，且重新完成上述验证。
第三轮独立复审确认此前 findings 全部关闭，最终结果为 Standards `PASS / 0 finding`、Spec
`PASS / 0 finding`。

本阶段到此停止，尚未执行：

- Phase 1C 第 5 批数据模型或其他后续批次；
- 能力矩阵、项目示例登记、拒绝模式登记和课程覆盖矩阵；
- 外部知识点研究、Java 课程正文、菜单或 Markdown adapter；
- `dzzz-app` 源码修改或任何代码提交。

下一阶段只能从 Phase 1C 第 5 批“数据模型”开始，并继续使用当前 snapshot ID；若任一目标 Java
源码或 Mapper XML 哈希变化，必须先重新冻结相应范围。
