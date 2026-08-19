# Spring Boot Web 课程计划

> 版本：v1.2
> 日期：2026-08-16
> 状态：课程表已确认，课程正文正在按本路线逐课实施
> 当前实施进度：59 / 104
> 当前主线：从 Java 零基础到前后端分离的 JSON REST API

## 1. 课程定位

本计划是当前 Spring Boot Web 课程的唯一课程表和逐课实施入口。课程目标不是覆盖 Java 全家桶的
全部技术，而是让学习者从零开始，最终能够使用 Spring Boot 开发可测试、可维护、可联调和可部署的
后端 JSON REST API。

教学主线如下：

```text
Java 起步与工程
-> Java 语法
-> 面向对象
-> 集合与常用类
-> 异常、I/O 与现代 Java
-> HTTP、REST、JSON 与统一 API 契约
-> Spring Boot REST API
-> MySQL 与 MyBatis
-> Redis Web 能力
-> 测试、安全与交付
-> 高级 Web 与结课
-> TeamFlow 完整项目
```

本文件只记录当前新版路线。旧的 Phase A 冻结表已移除，不再作为课程顺序、课程身份或实施依据。
Java 全家桶的延期候选继续保存在 [`java-full-stack-curriculum-planning-snapshot.md`](./java-full-stack-curriculum-planning-snapshot.md)，
不与本路线混用。

## 2. 统一技术基线

| 项目 | 现代主线 | 兼容线 |
| --- | --- | --- |
| Java | JDK 25 | Java 8 |
| Spring Boot | 4.1.x | 2.3.12.RELEASE |
| API 形态 | 前后端分离 JSON REST API | 相同 URL、参数和响应合同 |
| 前端联调 | Vite + React 简洁示例 | 同一套接口 |
| 正式后端 | `modern-backend` | `legacy-backend` |
| 项目基础设施 | MySQL、Redis、RabbitMQ 的 Docker Compose | 相同服务边界 |

兼容线不是只展示旧代码。凡是存在真实差异的课程，都必须同时提供两套可以运行的代码，并就近说明
依赖、包名、配置、API、启动方式和迁移注意事项。JDK 26 不在本路线中提及。

## 3. 统一 API 契约

这门课插入在 Web 基础之后、首个 Spring Boot 应用之前，课程 ID 为 `web-05`。后续业务接口不能
在没有这套最小合同的情况下各自定义返回结构。

本课需要冻结并贯穿后续课程的内容：

- API 基础路径、资源命名和版本策略；
- JSON 字段命名、日期时间格式、空值处理和 ID 表达；
- 成功响应结构和空数据语义；
- 业务错误码、错误消息、字段校验错误和追踪标识；
- HTTP 方法、状态码、分页、排序和幂等写操作；
- 文件上传、下载和登录接口的合同例外；
- 使用 IntelliJ IDEA `.http` 文件和 curl 验证请求，不依赖第三方请求工具教学。

后续课程的职责边界：

- Web 基础负责协议和合同设计；
- Spring Boot 课程负责把合同实现为 Controller、DTO、校验和统一异常响应；
- OpenAPI 课程负责把已经确定的合同生成可读文档；
- MySQL、Redis、安全和测试课程只能复用合同，不能重新定义响应格式。

具体响应字段在该课正文实施时冻结；本计划不提前替代课程正文作过细的字段设计。

## 4. 最终课程表（104 课）

每门课只承担一项可以独立掌握的能力。实战课用于合并前面已经学过的能力，不替代知识点课程。
课程表中的复选框是逐课实施状态；课程正文和详情页不显示课程 ID 或计划编号。

### 4.1 Java 起步与工程

| 状态 | ID | 主题组 | 课程 |
| --- | --- | --- | --- |
| [x] | start-01 | Java 程序起步 | 环境搭建与首个程序 |
| [x] | start-02 | Java 程序起步 | 编译与运行 |
| [x] | start-03 | 调试与排错 | 错误定位 |
| [x] | start-04 | 调试与排错 | 断点调试 |
| [x] | maven-01 | Maven 工程 | Maven 项目与依赖 |

### 4.2 Java 语法

| 状态 | ID | 主题组 | 课程 |
| --- | --- | --- | --- |
| [x] | syntax-01 | 数据与表达式 | 变量与赋值 |
| [x] | syntax-02 | 数据与表达式 | 基本类型 |
| [x] | syntax-03 | 数据与表达式 | 类型转换 |
| [x] | syntax-04 | 数据与表达式 | 运算符与表达式 |
| [x] | syntax-05 | 流程与方法 | 条件分支 |
| [x] | syntax-06 | 流程与方法 | 循环控制 |
| [x] | syntax-07 | 流程与方法 | 方法定义与调用 |
| [x] | syntax-08 | 流程与方法 | 参数传递 |
| [x] | syntax-09 | 数组与字符串 | 数组 |
| [x] | syntax-10 | 数组与字符串 | 字符串处理 |
| [x] | syntax-11 | 数组与字符串 | 实战：命令行任务清单 |

### 4.3 面向对象

| 状态 | ID | 主题组 | 课程 |
| --- | --- | --- | --- |
| [x] | oop-01 | 对象与封装 | 类与对象 |
| [x] | oop-02 | 对象与封装 | 构造方法与 this |
| [x] | oop-03 | 对象与封装 | 封装与访问控制 |
| [x] | oop-04 | 对象与封装 | static 与 final |
| [x] | oop-05 | 对象与封装 | 枚举 |
| [x] | oop-06 | 对象与封装 | 实战：任务领域建模 |
| [x] | oop-07 | 继承与多态 | 继承与方法重写 |
| [x] | oop-08 | 继承与多态 | 抽象类与接口 |
| [x] | oop-09 | 继承与多态 | 多态 |
| [x] | oop-10 | 对象合同与数据模型 | Object、equals 与 hashCode |
| [x] | oop-11 | 对象合同与数据模型 | record |
| [x] | oop-12 | 对象合同与数据模型 | 实战：任务通知策略 |

### 4.4 集合与常用类

| 状态 | ID | 主题组 | 课程 |
| --- | --- | --- | --- |
| [x] | collections-01 | 泛型与集合 | 泛型 |
| [x] | collections-02 | 泛型与集合 | List |
| [x] | collections-03 | 泛型与集合 | Set |
| [x] | collections-04 | 泛型与集合 | Map |
| [x] | collections-05 | 泛型与集合 | 集合遍历与安全删除 |
| [x] | collections-06 | 泛型与集合 | 实战：任务集合查询 |
| [x] | collections-07 | 排序与业务数值 | Comparable 与 Comparator |
| [x] | collections-08 | 排序与业务数值 | 日期与时间 |
| [x] | collections-09 | 排序与业务数值 | BigDecimal |
| [x] | collections-10 | 排序与业务数值 | 实战：项目进度报告 |

### 4.5 异常、I/O 与现代 Java

| 状态 | ID | 主题组 | 课程 |
| --- | --- | --- | --- |
| [x] | modern-java-01 | 异常、资源与文件 | 异常处理 |
| [x] | modern-java-02 | 异常、资源与文件 | 资源关闭 |
| [x] | modern-java-03 | 异常、资源与文件 | 文件读写 |
| [x] | modern-java-04 | 函数式数据处理 | Lambda |
| [x] | modern-java-05 | 函数式数据处理 | Stream |
| [x] | modern-java-06 | 函数式数据处理 | Optional |
| [x] | modern-java-07 | 文本与数据交换 | 文本构建与格式化 |
| [x] | modern-java-08 | 文本与数据交换 | 实战：任务清单导入导出 |

### 4.6 Web 基础

| 状态 | ID | 主题组 | 课程 |
| --- | --- | --- | --- |
| [x] | web-01 | HTTP 与 REST | HTTP 请求与响应 |
| [x] | web-02 | HTTP 与 REST | REST 资源设计 |
| [x] | web-03 | JSON 与 API 合同 | JSON 数据契约 |
| [x] | web-04 | JSON 与 API 合同 | 实战：任务 API 设计 |
| [x] | web-05 | JSON 与 API 合同 | 统一 API 契约 |

### 4.7 Spring Boot REST API

| 状态 | ID | 主题组 | 课程 |
| --- | --- | --- | --- |
| [x] | spring-01 | 应用与容器 | 首个 Spring Boot 应用 |
| [x] | spring-02 | 应用与容器 | 配置与环境 |
| [x] | spring-03 | 应用与容器 | 依赖注入 |
| [x] | spring-04 | 请求与响应 | 请求映射 |
| [x] | spring-05 | 请求与响应 | 请求参数 |
| [x] | spring-06 | 请求与响应 | 请求体 |
| [x] | spring-07 | 请求与响应 | 响应与状态码 |
| [x] | spring-08 | 合同校验与错误 | 参数校验 |
| [ ] | spring-09 | 合同校验与错误 | 统一接口响应 |
| [ ] | spring-10 | 合同校验与错误 | 全局异常处理 |
| [ ] | spring-11 | 合同校验与错误 | 实战：用户与团队 API |
| [ ] | spring-12 | 文件、联调与文档 | 文件上传与下载 |
| [ ] | spring-13 | 文件、联调与文档 | 跨域与前端联调 |
| [ ] | spring-14 | 文件、联调与文档 | OpenAPI 与 Swagger UI |
| [ ] | spring-15 | 文件、联调与文档 | 实战：项目与任务 API |

### 4.8 MySQL 与 MyBatis

| 状态 | ID | 主题组 | 课程 |
| --- | --- | --- | --- |
| [ ] | mysql-01 | 关系数据基础 | 关系数据建模 |
| [ ] | mysql-02 | 关系数据基础 | SQL 查询 |
| [ ] | mysql-03 | 关系数据基础 | 数据库迁移 |
| [ ] | mysql-04 | MyBatis 查询与写入 | MyBatis 配置 |
| [ ] | mysql-05 | MyBatis 查询与写入 | MyBatis 查询映射 |
| [ ] | mysql-06 | MyBatis 查询与写入 | MyBatis 写入与动态 SQL |
| [ ] | mysql-07 | MyBatis 查询与写入 | 实战：用户与团队持久化 |
| [ ] | mysql-08 | MyBatis 增强与分页 | MyBatis-Plus |
| [ ] | mysql-09 | MyBatis 增强与分页 | 分页与筛选 |
| [ ] | mysql-10 | 事务与持久化实战 | 事务 |
| [ ] | mysql-11 | 事务与持久化实战 | 实战：项目与任务持久化 |

该部分只讲 Web 项目直接需要的建模、SQL、迁移、CRUD、分页和事务。索引调优、执行计划、锁、
备份恢复、分库分表等内容留给后续数据库专项。

### 4.9 Redis 与 Web 常用能力

| 状态 | ID | 主题组 | 课程 |
| --- | --- | --- | --- |
| [ ] | redis-web-01 | 集成与缓存生命周期 | Redis Web 集成 |
| [ ] | redis-web-02 | 集成与缓存生命周期 | 缓存读取 |
| [ ] | redis-web-03 | 集成与缓存生命周期 | 缓存失效 |
| [ ] | redis-web-04 | Web 状态与幂等 | 验证码 |
| [ ] | redis-web-05 | Web 状态与幂等 | 接口幂等 |
| [ ] | redis-web-06 | Web 状态与幂等 | 实战：任务查询缓存 |

这里只讲 Web 项目需要的连接、缓存读写、TTL、失效、验证码和接口幂等。Lua、Streams、Sentinel、
Cluster、分布式锁原理等内容留给 Redis 专项。

### 4.10 测试、安全与交付

| 状态 | ID | 主题组 | 课程 |
| --- | --- | --- | --- |
| [ ] | delivery-01 | 测试 | 单元测试 |
| [ ] | delivery-02 | 测试 | MockMvc 接口测试 |
| [ ] | delivery-03 | 测试 | 集成测试 |
| [ ] | delivery-04 | 认证与授权 | 密码与登录 |
| [ ] | delivery-05 | 认证与授权 | JWT 认证 |
| [ ] | delivery-06 | 认证与授权 | 角色与权限 |
| [ ] | delivery-07 | 观测与运行 | 日志与可观测性 |
| [ ] | delivery-08 | 观测与运行 | 健康检查与优雅停机 |
| [ ] | delivery-09 | 打包与部署 | 应用打包 |
| [ ] | delivery-10 | 打包与部署 | 容器化部署 |
| [ ] | delivery-11 | 打包与部署 | 实战：测试与交付检查 |

### 4.11 高级 Web 与结课

| 状态 | ID | 主题组 | 课程 |
| --- | --- | --- | --- |
| [ ] | advanced-01 | 外部服务集成 | 外部 HTTP 调用 |
| [ ] | advanced-02 | 外部服务集成 | HTTP 客户端配置 |
| [ ] | advanced-03 | 异步与调度 | 异步任务 |
| [ ] | advanced-04 | 异步与调度 | 定时任务 |
| [ ] | advanced-05 | 消息驱动 | 消息队列使用边界 |
| [ ] | advanced-06 | 消息驱动 | RabbitMQ 消息收发 |
| [ ] | advanced-07 | 消息驱动 | 可靠消费与消费幂等 |
| [ ] | advanced-08 | 并发与一致性 | 并发更新与一致性 |
| [ ] | advanced-09 | 综合实战 | 实战：异步通知链路 |
| [ ] | advanced-10 | 综合实战 | 结课项目：TeamFlow 完整交付 |

外部 HTTP 客户端与前端调用后端的 HTTP 基础不同，现代线使用 `RestClient`，兼容线使用
`RestTemplate`。消息队列课程以 RabbitMQ 为示例，重点放在 Web 项目中的使用边界、可靠消费和幂等，
不扩展为独立消息中间件全家桶课程。

## 5. 课程依赖顺序

课程按本文件从上到下、从左到右的顺序实施。除实战课外，课程只能依赖当前课程之前已经完成的能力。

关键主线如下：

```text
start-01 -> start-02 -> start-03 -> start-04 -> maven-01
-> syntax-01..syntax-11
-> oop-01..oop-12
-> collections-01..collections-10
-> modern-java-01..modern-java-08
-> web-01..web-05
-> spring-01..spring-15
-> mysql-01..mysql-11
-> redis-web-01..redis-web-06
-> delivery-01..delivery-11
-> advanced-01..advanced-10
```

统一 API 契约的插入位置固定如下：

```text
web-01 HTTP
-> web-02 REST
-> web-03 JSON
-> web-04 任务 API 设计
-> web-05 统一 API 契约
-> spring-01 首个 Spring Boot 应用
```

Spring Boot REST API 的内部顺序为：

```text
spring-01 应用
-> spring-02 配置
-> spring-03 依赖注入
-> spring-04 请求映射
-> spring-05 请求参数
-> spring-06 请求体
-> spring-07 响应与状态码
-> spring-08 参数校验
-> spring-09 统一接口响应
-> spring-10 全局异常处理
-> spring-11 用户与团队 API 实战
-> spring-12 文件上传与下载
-> spring-13 跨域与前端联调
-> spring-14 OpenAPI 与 Swagger UI
-> spring-15 项目与任务 API 实战
```

MySQL 与 MyBatis 的内部顺序为：

```text
mysql-01 建模
-> mysql-02 SQL 查询
-> mysql-03 数据库迁移
-> mysql-04 MyBatis 配置
-> mysql-05 查询映射
-> mysql-06 写入与动态 SQL
-> mysql-07 用户与团队持久化实战
-> mysql-08 MyBatis-Plus
-> mysql-09 分页与筛选
-> mysql-10 事务
-> mysql-11 项目与任务持久化实战
```

高级 Web 的内部顺序为：

```text
advanced-01 外部 HTTP 调用
-> advanced-02 HTTP 客户端配置
-> advanced-03 异步任务
-> advanced-04 定时任务
-> advanced-05 消息队列使用边界
-> advanced-06 RabbitMQ 消息收发
-> advanced-07 可靠消费与消费幂等
-> advanced-08 并发更新与一致性
-> advanced-09 异步通知链路实战
-> advanced-10 TeamFlow 完整交付
```

MySQL、Redis、安全、测试和交付课程只能复用已有 API 合同，不能重新定义请求和响应格式。

## 6. 页面目录与课内大纲

课程详情页所在范围为 `后端 -> Java -> Spring Boot Web`。这三个模块定位用于确定当前课程目录，
不再作为详情页左侧的额外展开层级。

详情页左侧固定采用三级课程目录：

```text
知识领域（学习阶段）
└─ 主题组
   └─ 课程
```

展示规则如下：

- 当前知识领域和当前主题组默认展开，其他知识领域折叠；
- 当前课程高亮，桌面侧栏和移动端学习路径抽屉使用同一套层级；
- 课程 ID、内部计划编号和实施状态不显示在课程正文或课程导航标题中；
- 主题组只用于组织课程，不创建新的 URL 层级；
- “基础、中级、高级”作为难度元数据使用，不再插入左侧目录层级。

右侧只展示当前课程的课内大纲，最多支持三级标题：

```text
H1 课程标题（不进入大纲）
└─ H2 一、一级章节
   └─ H3 1. 二级知识点
      └─ H4 （1）三级细分点
```

编号约定为：H2 使用“一、二、三……”，H3 使用“1. 2. 3.……”，H4 使用“（1）（2）（3）……”。
只有确实存在从属关系时才使用 H4，不为了凑层级强行拆分。左侧课程目录与右侧课内大纲职责分离。

## 7. TeamFlow 递进项目

最终项目为团队协作与任务管理平台 TeamFlow。只实现后端，前端提供一个用于联调的简洁 Vite + React
项目。现代后端和兼容后端分别放在独立目录，保持相同 URL、参数、响应和业务规则。

项目递进 checkpoint：

| checkpoint | 课程范围 | 新增能力 |
| --- | --- | --- |
| C0 | Java 起步、语法与面向对象 | 任务、用户、团队领域对象和命令行任务流程 |
| C1 | 集合、异常、I/O 与现代 Java | 任务筛选、状态处理、导入导出和错误恢复 |
| C2 | Web 基础与 API 契约 | TeamFlow 资源、请求响应和错误合同 |
| C3 | Spring Boot REST API | 用户、团队、项目和任务接口 |
| C4 | MySQL 与 MyBatis | 真实持久化、分页、筛选和事务 |
| C5 | Redis Web 能力 | 查询缓存、验证码、缓存失效和接口幂等 |
| C6 | 测试与安全 | 单元测试、接口测试、登录、JWT、角色和权限 |
| C7 | 交付 | 日志、健康检查、打包、容器化和联调验收 |
| C8 | 高级 Web 前九课 | 外部调用、异步调度、消息消费、幂等和一致性 |
| C9 | 结课项目 | TeamFlow 完整交付与最终联调 |

每个 checkpoint 都必须提供可运行的现代版和兼容版快照。课程示例可以只新增一个局部行为，但必须
说明该行为在最终项目中的位置。

## 8. 每课实施计划

所有课程均按“一课一批”实施。课程表中的每一行对应一个独立实施批次，不能提前批量编写后续课程。
每课都必须完整遵守 [`java-course-authoring-standard.md`](./java-course-authoring-standard.md)。课程表中的
复选框是唯一的课程完成进度入口，不依赖历史 Phase、审查文件或 signoff 文件。

每批必须建立以下记录：

| 字段 | 要求 |
| --- | --- |
| 课程 ID 与标题 | 与本文件一致，课程正文不展示计划 ID |
| 课程目标 | 只描述本课可以独立掌握的一项能力 |
| 前置课程 | 只引用已完成课程，不允许后向依赖 |
| 官方与社区来源 | 官方与社区都必须检索；只保留实际采用的来源并标明来源类别 |
| 知识点范围 | 详细解释、正常示例、多个易错示例和边界说明 |
| 现代版代码 | JDK 25 + Spring Boot 4.1.x（受影响课程提供完整代码） |
| 兼容版代码 | Java 8 + Spring Boot 2.3.12（受影响课程提供完整代码） |
| 最终项目增量 | 说明本课给 TeamFlow 增加的行为 |
| 验证方式 | 编译、运行、请求、响应、失败路径和预期结果 |
| 实施状态 | 直接更新本文件对应课程的复选框 |

单课实施顺序固定为：

1. 确认当前课程的目标、前置和项目增量；
2. 查看主题相近的旧课程，只提取可能复用的知识内容和示例思路；
3. 查询当前版本对应的官方规范、官方文档、官方源码或官方测试；
4. 查询 GitHub、技术问答和可信社区文章中的使用技巧、真实误区与易错示例；
5. 在 `/tmp` 临时目录筛选官方、社区与旧课程候选，重新核验旧内容，只采用正确、真实且能增加教学价值的社区补充；
6. 按课程规范重新组织正文，编写示例、易错示例、完整代码和练习参考代码；
7. 分别检查现代版与兼容版代码的依赖、包名、配置和运行方式；
8. 使用 `/tmp` 临时目录完成最小编译、运行和请求验证；
9. 删除临时研究稿和验证文件，不在仓库保留调研、审查或完成证明文档；
10. 达到课程编写规范的全部完成条件后，勾选本文件对应课程；
11. 当前课程关闭后才能进入下一课程。

课程正文不得出现本计划 ID、Phase、调研过程、验收记录、signoff 或本地执行说明。正文只展示当前
知识点和 TeamFlow 示例。

## 9. 当前文档边界

- 本文件是当前 Spring Boot Web 课程表、目录结构和逐课实施计划；
- [`java-course-authoring-standard.md`](./java-course-authoring-standard.md) 是课程正文开发规范；
- [`spring-boot-web-curriculum-adjustment-plan.md`](./spring-boot-web-curriculum-adjustment-plan.md) 是开发范围、内容深度和质量要求的背景规范，旧版课程表不再作为当前路线；
- [`java-full-stack-curriculum-planning-snapshot.md`](./java-full-stack-curriculum-planning-snapshot.md) 是延期的 Java 全家桶候选，不阻塞本路线；
- 不删除 `dzzz-app` 资料，也不把 dzzz-app 项目结构当作当前课程主线；
- 不依赖旧 Phase A、Phase B、signoff 或历史课程编号判断新版课程是否完成；
- 旧课程在新路线实施期间保留作素材参考；104 门新课程全部完成并确认无运行时引用后，再集中清理旧课程和过时配置；
- MySQL、Redis、消息队列和其他专项课程只在本路线明确列出的 Web 使用范围内教学，完整专项另行规划。
