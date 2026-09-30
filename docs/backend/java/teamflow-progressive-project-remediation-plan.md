# TeamFlow 递进项目修复实施计划

> 状态：Phase 10 已完成；C8/C9 双版本交付门禁、课程一致性核对和独立复审均已闭环
> 权威课程顺序：`spring-boot-web-curriculum-plan.md`
> 课程编写规范：`java-course-authoring-standard.md`
> 实施原则：一阶段一闭环、一课一批、现代版与兼容版同步、先验证当前页面服务

## 1. 背景与问题

Spring Boot Web 104 课已经完成正文与课程接入，但 TeamFlow 的项目代码没有按课程计划形成一条持续演进的
源码主线：

- 课程正文大量使用 TeamFlow 场景，也经常说明“把本课能力接回 TeamFlow”；
- 多数代码仍是 Markdown 中独立运行的示例，包名、目录和启动类不统一；
- `demos/` 只保留最后一课的现代版、兼容版和交付脚本，没有 C0-C8 的连续项目资产；
- 当前最终项目只覆盖 JWT、项目分页、任务创建与完成、Redis 幂等、RabbitMQ 通知和交付门禁等关键链路；
- 用户、团队、MyBatis、验证码、完整缓存失效、外部 HTTP 等课程主线能力没有全部进入最终项目。

因此，当前状态应区分为：

| 项目 | 当前结论 |
| --- | --- |
| 104 课正文与课程顺序 | 已完成 |
| TeamFlow 教学叙事 | 基本贯穿 |
| TeamFlow 累计源码主线 | 未完成 |
| 双版本最终完整项目 | 未完成 |

## 2. 本计划目标

在不改变 104 课顺序、稳定 ID、页面路由和知识点范围的前提下，完成以下结果：

1. 保留一套 JDK 25 / Spring Boot 4.1.x 的现代项目；
2. 保留一套 Java 8 / Spring Boot 2.3.12.RELEASE 的兼容项目；
3. 两套项目使用相同的外部合同、业务规则、数据语义和验收矩阵；
4. 将 C0-C9 的主要 TeamFlow 能力整合进两套长期演进的项目；
5. 让相关课程中的 TeamFlow 代码、目录、包名和前后课说明与真实项目一致；
6. 让最后一课交付的确是两套完整可运行项目，而不是只覆盖交付链路的演示；
7. 每个阶段完成后，两套项目都处于可构建、可运行、可验证状态。

## 3. 不在本次范围内

- 不调整 104 门课程的数量、顺序、稳定 ID、slug 或页面地址；
- 不重写与项目累积无关的概念讲解、易错项、版本说明和独立练习；
- 不把每个基础语法示例机械复制到最终项目；
- 不新增超出课程计划的微服务、分布式事务、复杂工作流或运维平台；
- 不把现代版和兼容版合并为充满版本判断的单一源码工程；
- 不保留 20 份重复的 C0-C9 项目目录；两个长期项目在每个 checkpoint 演进并通过门禁，最终保留 C9 状态；
- 不在仓库中新增持久化测试文件、临时研究稿、构建产物或审查报告；
- 不提交、推送、stash、reset 或清理用户及并行任务的改动。

## 4. 目标目录

继续复用现有最终项目目录，避免改变课程地址和引用位置：

```text
src/categories/backend/java/core/demos/teamflow-complete-delivery/
├── README.md
├── contracts/
│   ├── teamflow-api-contract.md
│   ├── teamflow-event-contract.md
│   └── teamflow-acceptance-matrix.md
├── teamflow-modern/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/
├── teamflow-legacy/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/
├── teamflow-frontend/
├── compose.yaml
├── delivery-gate.sh
└── delivery-smoke.sh
```

两套后端独立构建、独立打包、独立生成镜像。前端、外部合同、Compose 和黑盒验收矩阵可以共享，因为它们
验证的是相同的外部接口，不属于版本实现差异。

## 5. 稳定接口与模块设计

### 5.1 外部接口

实施代码前先冻结以下接口：

- HTTP 路径、方法、请求字段、响应字段和状态码；
- Problem Details 错误字段和业务错误码；
- JWT issuer、audience、角色与动作权限命名；
- MySQL 表、主键、唯一键、乐观锁与事务事实；
- Redis key、TTL、缓存失效和幂等状态；
- RabbitMQ exchange、queue、routing key、事件字段和重复消费语义；
- 外部 HTTP 调用的超时、错误映射与降级结果；
- readiness、liveness、日志字段和关闭行为。

这些内容共同构成调用方必须理解的 TeamFlow 接口。现代版与兼容版只能在框架入口和依赖适配方式上不同，
不能改变这些接口。

### 5.2 后端模块

两套项目统一使用 `dev.teamflow` 根包，并按职责保持相同模块布局：

```text
dev.teamflow
├── TeamFlowApplication
├── domain/          # User、Team、Project、Task、Notification 等领域对象与规则
├── application/     # 创建团队、查询项目、创建任务、完成任务等用例
├── web/             # Controller、DTO、校验和 Problem Details
├── persistence/     # MyBatis Mapper、数据库记录和事务适配
├── cache/           # Redis 查询缓存、验证码、幂等和失效适配
├── messaging/       # RabbitMQ、outbox、inbox 和通知消费
├── integration/     # 外部 HTTP 客户端
├── security/        # 登录、JWT、角色和权限
└── config/          # 版本相关框架配置
```

设计约束：

- Web 模块不得直接编写 SQL、Redis key 或 RabbitMQ 发布逻辑；
- application 模块提供少量、明确的业务用例接口，隐藏事务和基础设施细节；Phase 1 允许沿用当前交付链路中的
  JDBC 适配，Phase 4 完成后由 application 只依赖持久化端口；
- Phase 4 以 MyBatis Mapper 直接承担持久化接缝，不额外增加只转发调用的 Repository；Phase 1 的读取适配类是
  迁移前的临时接缝，不代表最终 Mapper 形态；
- Redis、RabbitMQ 和外部 HTTP 位于真实 I/O 接缝，并由独立适配实现承载版本差异；
- domain 模块不依赖 Spring、MyBatis、Redis 或 RabbitMQ；
- 现代版与兼容版不共享编译产物，只共享经过冻结的合同和验收输入；
- 每个 Java 文件控制在约 1000 行以内，公开类型和方法使用规范 Javadoc。

## 6. C0-C9 能力矩阵

| Checkpoint | 课程范围 | 必须进入累计项目的能力 | 阶段结果 |
| --- | --- | --- | --- |
| C0 | start-01 至 oop-12 | 用户、团队、项目、任务领域对象；状态、优先级、对象合同和基础命令流程 | 两版本领域与命令行入口可运行 |
| C1 | collections-01 至 modern-java-08 | 筛选、排序、统计、时间、金额、导入导出和错误恢复 | 两版本应用模块可运行 |
| C2 | web-01 至 web-05 | REST 资源、JSON、统一响应和 Problem Details 合同 | 冻结外部接口合同 |
| C3 | spring-01 至 spring-15 | 用户、团队、项目、任务接口；校验、异常、文件、CORS 和 OpenAPI | 两版本 Web 项目可启动和请求 |
| C4 | mysql-01 至 mysql-11 | 数据库迁移、MyBatis、分页、筛选、写入、事务和持久化实战 | 两版本连接真实 MySQL |
| C5 | redis-web-01 至 redis-web-06 | 查询缓存、精确失效、验证码、接口幂等和缓存项目实战 | 两版本连接真实 Redis |
| C6 | delivery-01 至 delivery-06 | 单元与接口反馈环、登录、JWT、角色和动作权限 | 两版本安全矩阵一致 |
| C7 | delivery-07 至 delivery-11 | 日志、健康检查、优雅停机、打包、容器化和交付门禁 | 两版本镜像可交付 |
| C8 | advanced-01 至 advanced-09 | 外部 HTTP、异步、调度、RabbitMQ、消费幂等和并发一致性 | 两版本集成链路可运行 |
| C9 | advanced-10 | 完整前后端联调、失败恢复、双版本最终验收 | 两套完整项目 `gate=PASS` |

基础课程中的语法示例不要求逐个成为最终接口，但其形成的领域规则、对象合同和业务能力必须由最终项目的真实
模块承接。

## 7. 课程正文调整规则

实施期间先建立 104 课 TeamFlow 引用清单，并把每个相关段落归为以下四类：

| 类型 | 处理方式 |
| --- | --- |
| 独立知识示例 | 保留；只在与最终合同冲突时最小修正 |
| TeamFlow 项目增量 | 改为真实项目中的新增或修改文件，并指明所属 checkpoint |
| 声称复用前课但实际不存在 | 修正为真实前置文件、接口和运行方式 |
| 重复完整工程 | 收敛为本课相关模块和可运行增量，不重复粘贴整套项目 |

正文修改必须遵守：

- 不改变课程知识点和学习目标，除非现有目标与权威计划冲突；
- 不改变课程页面格式规范；
- 不把计划编号、实施阶段、审查过程写入学习者正文；
- 使用统一包名、DTO、表名、Redis key、事件字段和错误合同；
- 现代版与兼容版差异紧邻出现，不能让学习者自行猜测替换关系；
- 代码块必须来自或精确对应真实项目源码，不能维护另一份已经漂移的伪实现；
- 每次只调整当前课程，当前课程通过页面和代码验证后才进入下一课。

## 8. 分阶段实施顺序

### Phase 0：冻结现状与建立差异清单

范围：只读检查，不修改课程或项目代码。

1. 导出 104 课的 TeamFlow 代码块、包名、文件路径、接口和依赖；
2. 建立 C0-C9 能力到课程、代码和最终项目的映射；
3. 标记重复类型、冲突合同、不存在的前置文件和缺失能力；
4. 固定本次允许修改的课程文件清单；
5. 固定当前两套项目、课程计划、Manifest 和 Track 的基线摘要。

详细清单只保存在 `/tmp`，阶段完成后删除；仓库只保留本实施计划，不新增调研或审查文档。

完成门：能力矩阵无未分类项目，改动清单可以逐文件解释，未写入实现代码。

### Phase 1：冻结完整项目合同与骨架

1. 从 C2、C3、C4、C5、C6、C8 课程提取最终业务合同；
2. 解决重复 DTO、状态名、错误码、表名和事件字段冲突；
3. 写入共享 API、事件和验收合同；
4. 将现代版和兼容版调整为相同模块目录；
5. 保留当前已经正确的 JWT、幂等、通知和交付实现，先迁移再扩展。

完成门：两套统一骨架均能构建启动，健康检查可访问，合同文件逐项一致。

### Phase 2：按 C0-C2 恢复领域与接口基础

按 C0、C1、C2 顺序执行，每个 checkpoint 单独闭环：

1. 合并用户、团队、项目和任务领域模型；
2. 合并筛选、排序、统计、时间、金额、导入导出和失败语义；
3. 固定 REST、JSON、统一响应与 Problem Details；
4. 逐课修正与这些能力直接相关的 TeamFlow 代码和衔接说明。

完成门：两版本在不连接外部基础设施时得到相同领域结果和合同样例。

### Phase 3：按 C3 恢复完整 Web 接口

1. 实现用户、团队、项目、任务的核心接口；
2. 接入请求参数、请求体、响应状态、校验和全局异常；
3. 接入任务附件或导入导出的文件边界；
4. 接入受控 CORS 和 OpenAPI；
5. 调整 spring-01 至 spring-15 中真实涉及累计项目的代码。

完成门：现代版与兼容版使用同一请求矩阵，成功和失败响应一致。

阶段状态：已完成。双版本已通过同一完整门禁，覆盖用户、团队、成员、项目、任务、字段校验、Problem Details、
附件边界、CORS 预检和 OpenAPI 状态声明；C2 的 HTTP 状态一致性检查也已改为比较真实响应状态与 body 状态。

### Phase 4：按 C4 恢复 MySQL 与 MyBatis

1. 将 `schema.sql` 初始化迁移为课程已经采用的版本化迁移方式；
2. 为用户、团队、项目、任务和成员关系建立真实表与约束；
3. 用 MyBatis Mapper 替换 Controller 和业务模块中的直接 JDBC；
4. 完成查询映射、动态 SQL、分页、筛选、写入、乐观锁和事务；
5. 保留 outbox、inbox 与通知事实表，并纳入同一迁移序列。

完成门：两版本对同一数据库初始数据和请求矩阵产生相同结果，无 Controller 直接 SQL。

阶段状态：已完成。现代版与兼容版均已通过完整交付门禁，使用 Flyway V1/V2/V3 迁移、MyBatis Mapper、真实
MySQL 分页与筛选、乐观锁和事务；跨项目 delivery 隔离、完成任务删除以及 outbox/notification 级联清理均已由
黑盒 smoke 和数据库事实核验。独立复审结果为 Standards `PASS / 0 finding`、Spec `PASS / 0 finding`。

### Phase 5：按 C5 恢复 Redis Web 能力

1. 建立项目和任务查询缓存；
2. 在写事务成功后执行精确缓存失效；
3. 接入验证码生成、校验、一次性消费和 TTL；
4. 保留并完善任务创建幂等状态机；
5. 验证缓存 miss、hit、expire、invalidate 和依赖不可用状态。

完成门：两版本 Redis key 与 TTL 合同一致，缓存不会替代 MySQL 事实。

阶段状态：已完成。现代版与兼容版均已通过完整交付门禁，覆盖项目/任务缓存 miss、hit、expire、精确失效与
generation、验证码 TTL 与 Redis Lua 原子消费、任务创建幂等成功/重放/冲突/失败重放，以及 Redis 依赖恢复；两版
独立复审结果为 Standards `PASS / 0 finding`、Spec `PASS / 0 finding`。

### Phase 6：按 C6 恢复测试反馈与安全

1. 完成密码登录、JWT 签发和资源服务器校验；
2. 完成角色、动作权限和资源归属检查；
3. 使用 `/tmp` 临时测试工程验证 application 接口、Web 接口和安全矩阵；
4. 测试完成后删除临时测试文件，不向仓库写入测试源码。

完成门：匿名、无权限、合法用户、管理员和资源越权矩阵在两版本完全一致。

阶段状态：已完成。现代版与兼容版均通过完整交付门禁，覆盖匿名 401、JWT 必需 `userId`/`roles`/`permissions`、
角色与动作权限、资源归属、无状态 Cookie、分页与缓存授权，以及成员撤权后的缓存护栏。成员事务在写入前建立
`teamflow:cache:membership-change-guard:v1` 护栏并预失效，提交后再次失效；Redis 提交失败时护栏保留，缓存读写
失败关闭。两版门禁最终结果均为 `profile=modern gate=PASS port=18080`、`profile=legacy gate=PASS port=18081`；
临时回归结果为缺失 `roles`/`permissions` 均返回 `401`，成员删除后的 Redis 故障返回 `503`，数据库成员事实为 `0`。
独立复审已针对修复后的最新快照核验 Standards 与 Spec，候选问题均已修复并由双版本门禁复验。

### Phase 7：按 C7 恢复可交付能力

1. 统一结构化日志和关联 ID；
2. 完成 liveness、readiness、依赖健康与优雅停机；
3. 完成独立 JAR、非 root 镜像和版本隔离；
4. 扩充 Compose、前端构建和交付门禁；
5. 验证 MySQL、Redis、RabbitMQ 任一不可用时的明确状态。

完成门：两版本分别构建 JAR 和镜像，基础交付门禁通过。

阶段状态：C7 的日志、健康检查、优雅停机、独立 JAR、非 root 镜像、Compose 和基础门禁资产已落盘；本轮 C8
完整门禁会重新验证这些基础交付条件，不把静态资产或旧输出替代最新运行证据。

### Phase 8：按 C8 恢复高级集成能力

1. 现代版使用 RestClient、兼容版使用 RestTemplate 实现同一外部通知接口；
2. 完成异步执行器、结果与异常、上下文和关闭行为；
3. 完成受控定时任务；
4. 完成 RabbitMQ 发送、接收、publisher confirm、outbox 和 inbox；
5. 完成重复消费、重试预算、乐观锁和并发更新冲突。

完成门：两版本对外部失败、重复消息和并发冲突产生相同可观察结果。

阶段状态：已完成。现代版与兼容版均接入外部 HTTP 客户端、具名异步执行器和 Partner 联调控制器；同步/异步
成功、404、5xx、坏 JSON、超时、异步失败和 POST 不重试均由共享 smoke 覆盖。最新双版本门禁和独立复审结果为：

```text
profile=modern gate=PASS port=18080
profile=legacy gate=PASS port=18081
Standards PASS / 0 finding
Spec PASS / 0 finding
```

### Phase 9：重写 C9 最终交付与联调

1. 将共享前端扩展为登录、用户/团队、项目、任务和交付状态的真实联调界面；
2. 补充根目录 README、启动命令、环境要求和项目结构；
3. 让最终课程正文展示完整项目结构、主要模块、运行方式和验收矩阵；
4. 扩充 `delivery-smoke.sh` 覆盖 C0-C9 的关键业务路径；
5. 分别执行现代版和兼容版完整门禁。

完成门：

```text
bash delivery-gate.sh modern 18080 -> profile=modern gate=PASS
bash delivery-gate.sh legacy 18081 -> profile=legacy gate=PASS
```

阶段状态：已完成。共享 React/Vite 联调界面已覆盖登录、用户/团队、项目、任务和交付状态；根 README、结课正文、
共享合同和 `delivery-smoke.sh` 已同步到最终项目路径与 C0-C9 请求矩阵。现代版和兼容版均通过上述完整门禁。

### Phase 10：课程一致性收口

1. 检查所有相关课程不再引用不存在的包名、类、表、接口或工程路径；
2. 检查 104 门课程顺序、稳定 ID、slug、Manifest 和 Track 未改变；
3. 检查最终项目代码与课程代码块不存在合同漂移；
4. 检查页面、loader、桌面与 390px 布局；
5. 执行独立代码审查并处理全部 finding。

完成门：Standards `PASS / 0 finding`，Spec `PASS / 0 finding`。

阶段状态：已完成。Manifest、Track、课程计划和 Markdown 均为 104 项，slug 集合和课程顺序一致，frontmatter ID
与 stage/slug 一致；相关 TeamFlow 课程代码和最终项目合同已完成静态核对。课程页面已在 1280x800 与 390x844
视口验证，loader、控制台和横向溢出均通过；最新独立复审为 Standards `PASS / 0 finding`、Spec `PASS / 0 finding`。

## 9. 每个课程批次的固定流程

每次只处理一门当前课程：

1. 核对该课在能力矩阵中的 TeamFlow 增量；
2. 核对当前双版本项目已经完成的前置能力；
3. 必要时重新核验官方版本文档和依赖兼容性；
4. 先修改现代版最小增量并在 `/tmp` 副本验证；
5. 再修改兼容版对应增量并执行同一行为矩阵；
6. 同步当前课程中的项目代码和衔接文字；
7. 立即验证当前课程页面服务无错误；
8. 再执行 loader、编译、请求、类型、lint、格式、构建和浏览器验证；
9. 复杂项目或课程合同变更执行独立 `/code-review`；
10. 当前课程全部通过后才进入下一门。

任何一步失败都留在当前课程修复，不提前修改后续课程。

## 10. 验证矩阵

### 10.1 每课最低验证

- 当前课程页面和真实 Markdown loader 返回成功；
- 浏览器控制台无 error；
- 受影响代码在现代版和兼容版均能编译；
- 当前课程新增或修改的成功、失败路径均可复现；
- 临时文件位于 `/tmp`，完成后清理；
- `git diff --check` 通过。

### 10.2 每个 checkpoint 验证

- 两套项目从干净临时副本构建；
- 使用独立端口、容器项目名、Maven 缓存和输出目录；
- 使用同一黑盒请求与结果矩阵；
- 核对数据库事实、Redis 状态、消息副作用和错误合同；
- 根项目执行 type-check、lint、格式检查、生产构建；
- 修改过的课程页面执行桌面与 390px 浏览器验证。

### 10.3 最终验证

- C0-C9 能力矩阵不存在缺项；
- 两个 Maven 项目均可独立构建和启动；
- 两个 Docker 镜像均通过相同业务烟雾矩阵；
- 前端可切换端口分别联调两个后端；
- MySQL、Redis、RabbitMQ 的失败和恢复可观察；
- 累计项目代码和声称接入累计项目的课程段落中，旧包名与虚构项目路径零残留；
- 104 门 Markdown、Manifest 和 Track 集合仍完全一致；
- 独立审查双项通过。

## 11. 改动边界与风险控制

- 实施前为每个 phase 建立明确 path allowlist；
- 不修改当前 phase 之外的课程正文；
- 不覆盖现有 staged、unstaged 或并行任务资产；
- 当前两套最终项目先作为迁移输入，不在新结构可运行前删除正确实现；
- 不通过批量替换包名假装完成迁移；每个模块都要经过编译和行为验证；
- 不把某一版本运行成功等同于双版本完成；
- 不用根项目构建成功替代当前课程页面和 TeamFlow 行为验证；
- 如依赖版本或外部镜像不可用，记录精确阻塞证据并停在当前 checkpoint。

## 12. 最终完成条件

只有同时满足以下条件，才能把 TeamFlow 递进项目修复标记为完成：

- 两套项目均包含 C0-C9 的主要业务能力；
- 两套项目接口、规则和验收结果一致；
- 相关课程代码与真实项目一致，知识点范围没有被改写；
- 最后一课能够从源码开始完成前端构建、后端构建、镜像、启动、联调和失败恢复；
- 当前服务、loader、类型、lint、格式、构建和浏览器验证全部通过；
- 临时测试与研究资产已清理；
- Standards 与 Spec 均为 `PASS / 0 finding`；
- 未提交、未推送，也未改动无关课程和并行任务文件。

## 13. 当前续接点

Phase 0 至 Phase 9 的实现资产已保留，Phase 10 的课程一致性收口也已完成。最终快照已通过现代版和兼容版完整
门禁、根项目检查、课程页面桌面/移动验证以及最新独立 Standards/Spec 复审，后续不再进入新的 TeamFlow 阶段。
