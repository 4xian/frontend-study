---
id: backend.java.learn.intermediate.transactions-and-idempotency
type: lesson
title: REST 资源设计
summary: 从 TeamFlow 任务需求中识别资源、集合与成员，使用稳定 URI 和 GET、POST、PUT、DELETE 语义形成可核对的路由设计
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 135
prerequisites:
  - backend.java.learn.intermediate.http-uri-and-request-response-basics
objectives:
  - 能区分资源、资源标识符与表示，不把数据库记录或一次 JSON 文本直接等同于资源。
  - 能区分集合资源和成员资源，并为 TeamFlow 任务建立稳定的 URI。
  - 能按 HTTP 语义为读取、创建、创建或替换、删除选择 GET、POST、PUT、DELETE。
  - 能说明 POST 到集合与 PUT 到已知目标的意图差异。
  - 能用 path 表达层级，用 query 表达非层级筛选条件。
  - 能根据标识符作用域和所有权关系判断是否需要嵌套 URI。
  - 能识别 GET 触发修改、可变名称入路径、过度嵌套等常见设计错误。
  - 能分别运行 JDK 25 与 Java 8 版本的 TeamFlow 路由说明程序。
recap:
  - 资源是可命名的概念，URI 标识资源，表示承载资源某一时刻的当前或期望状态。
  - TeamFlow 统一采用复数名词作为命名约定，但 REST 和 URI 规范没有强制复数，也没有从语法上禁止动词。
  - GET 请求当前表示，POST 让目标按自身语义处理内容，PUT 创建或替换已知目标，DELETE 移除目标 URI 与当前功能的关联。
  - GET 是安全方法；GET、PUT、DELETE 具有幂等语义，幂等描述预期效果而不是每次响应必须相同。
  - path 适合表达层级，query 适合表达筛选等非层级选择条件。
  - 嵌套 URI 取决于所有权和标识符作用域；层级更深不等于设计更 REST。
  - 稳定 URI 应长期指向同一资源语义，不随任务标题、状态或表示格式改变。
  - JDK 25 可用 record 保存固定路由数据；Java 8 使用本示例所需的普通不可变类，HTTP 设计保持一致。
related:
  - backend.java.learn.basics.record-classes
  - backend.java.learn.basics.task-domain-modeling-project
  - backend.java.learn.intermediate.http-uri-and-request-response-basics
tags:
  - Java
  - REST
  - HTTP 方法
  - URI
  - 资源设计
  - TeamFlow
appliesTo: JDK 25 主线；Java 8 兼容写法见正文；HTTP 语义按 RFC 9110，URI 通用语法按 RFC 3986
verifiedAt: 2026-08-18
sources:
  - id: fielding-rest-resource-model
    title: Architectural Styles and the Design of Network-based Software Architectures - Chapter 5
    url: https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm
    sourceOrigin: official
    sourceType: engineering-reference
    appliesTo: REST architectural style
    claims:
      - 资源是可命名概念的抽象映射，表示与资源标识符不是资源本身
      - 资源标识符所指向的资源语义应随时间保持一致
      - REST 统一接口包含资源标识、通过表示操作、自描述消息和超媒体四项约束
  - id: rfc9110-resources-and-methods
    title: RFC 9110 - HTTP Semantics
    url: https://www.rfc-editor.org/rfc/rfc9110.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: HTTP semantics
    claims:
      - HTTP 将请求目标称为资源，并把资源标识与请求方法语义分开
      - GET、POST、PUT、DELETE 的方法语义以及安全和幂等属性
      - DELETE 移除 URI 与当前功能的关联，不保证物理销毁底层信息
  - id: rfc3986-path-and-query
    title: RFC 3986 - Uniform Resource Identifier Generic Syntax
    url: https://www.rfc-editor.org/rfc/rfc3986.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: URI generic syntax
    claims:
      - path 通常按层级组织，query 携带非层级数据
      - path 与 query 一起在命名机构范围内标识资源
  - id: jls25-record-classes
    title: Java Language Specification 25 - Record Classes
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.10
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - record 声明可以用组件列表简洁描述固定数据载体
      - record 会声明对应组件字段和访问器
  - id: jep395-records
    title: JEP 395 - Records
    url: https://openjdk.org/jeps/395
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: JDK 16 and later
    claims:
      - record 在 JDK 16 正式交付，因此 JDK 25 可用而 Java 8 不支持
  - id: community-uri-action-verbs
    title: Stack Overflow - Why does including an action verb in a REST URI violate the protocol?
    url: https://stackoverflow.com/questions/2173721/why-does-including-an-action-verb-in-the-uri-in-a-rest-implementation-violate-th
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: REST URI naming discussion；技术结论已按 RFC 9110 核验
    claims:
      - 开发者会真实地把 URI 中出现动词与 HTTP 方法语义混为一谈
  - id: community-singular-or-plural
    title: Stack Overflow - RESTful POSTs, singular or plural URI
    url: https://stackoverflow.com/questions/1690267/restful-posts-do-you-post-objects-to-the-singular-or-plural-uri
    sourceOrigin: community
    sourceType: engineering-reference
    appliesTo: REST collection naming discussion；技术结论已按 RFC 9110 核验
    claims:
      - 单数或复数 URI 是否属于 REST 强制规则是实际开发中的常见疑问
---

# REST 资源设计

TeamFlow 已经能读懂一条 HTTP 请求的 method、path 和 query。现在要回答下一层问题：同一个“读取任务”
需求，为什么目标可以写成 `/tasks/TASK-101`，而“筛选开放任务”更适合
`/tasks?status=OPEN`？答案不在 Java 框架里，而在资源边界和 HTTP 方法语义里。

本课只形成一张可以核对的资源与路由设计表，不启动服务器，也不编写 Controller。JSON 数据合同、完整任务
API、统一响应、版本、分页、Spring Boot、数据库、ETag 和幂等键都留给后续课程。

## 一、先分清资源、标识符与表示

### 1. 资源是希望长期指向的概念

REST 中的资源不是某一行数据库记录，也不是某一段响应文本。它是一个可以被命名的概念。例如：

- “TeamFlow 的全部任务”可以是集合资源。
- “编号为 TASK-101 的任务”可以是成员资源。
- “项目 PRJ-7 所拥有的任务集合”也可以是资源。

`TASK-101` 的标题从“修复登录页”改成“修复登录和验证码页”以后，仍然是同一个任务资源。变化的是当前
状态，不是资源语义。

### 2. URI 负责标识资源

HTTP 通常使用 URI 标识请求目标。TeamFlow 选择下面的 URI：

```text
/tasks
/tasks/TASK-101
/projects/PRJ-7/tasks
```

它们分别标识任务集合、一个任务成员、一个项目拥有的任务集合。URI 是标识符，不是服务端目录，也不要求
与数据库表名、Java 类名逐字一致。服务端怎样保存任务属于实现细节。

### 3. 表示承载某一时刻的状态

同一个 `/tasks/TASK-101` 可以先后产生两份不同表示：

```text
标题=修复登录页, 状态=OPEN
标题=修复登录和验证码页, 状态=DOING
```

两段文本不是两个资源，而是同一资源在不同时刻的表示。本课用普通文本观察变化；表示使用 JSON 时应包含
哪些字段，留到下一课。

资源、标识符和表示可以用一句话串起来：客户端向 `/tasks/TASK-101` 标识的资源发起请求，消息中传递或
接收该资源的表示。

## 二、让 HTTP 方法表达请求意图

### 1. GET 请求目标资源的当前表示

读取任务集合：

```http
GET /tasks HTTP/1.1
```

读取一个任务：

```http
GET /tasks/TASK-101 HTTP/1.1
```

GET 的定义语义基本是只读。服务端可以记录访问日志，但客户端没有请求修改任务。因此不能把“删除任务”
藏进 GET 的 URI 或 query 中。

### 2. POST 让目标按自身语义处理内容

当 TeamFlow 由服务端分配新任务编号时，可以把待创建任务的表示提交给任务集合：

```http
POST /tasks HTTP/1.1
```

目标是 `/tasks` 集合；集合处理内容并创建尚未由客户端标识的新成员。POST 的规范语义比“创建”更宽，它是
让目标资源按自身语义处理随请求携带的表示。本课只采用“POST 到集合，由服务端选择成员标识符”这一明确
合同，不能把它反推成 POST 永远只用于创建。

### 3. PUT 创建或替换客户端已知的目标

客户端已经知道目标 URI 是 `/tasks/TASK-301`，并希望请求内容定义该目标的新状态时，可以使用：

```http
PUT /tasks/TASK-301 HTTP/1.1
```

PUT 的目标是确定的成员 URI。目标当前不存在时，服务器可以按该已知 URI 创建；目标已有当前表示时，PUT
请求替换其状态。实际接口是否允许客户端选择任务编号，仍由 TeamFlow 合同决定。

POST 与 PUT 的关键问题不是“都能不能创建”，而是谁已经知道目标：

| 需求 | 目标 | 方法 |
| --- | --- | --- |
| 服务端处理集合并选择新成员标识符 | `/tasks` | POST |
| 客户端知道目标并请求创建或替换该目标 | `/tasks/TASK-301` | PUT |

### 4. DELETE 请求移除目标 URI 的当前关联

```http
DELETE /tasks/TASK-101 HTTP/1.1
```

DELETE 请求源服务器移除目标 URI 与当前功能的关联。规范没有保证底层数据库行一定被物理删除；服务端可能
归档、软删除或回收存储，也可能有别的实现。课程设计只承诺删除后该 URI 不再按原来的当前关联工作，不越过
HTTP 边界猜测存储动作。

### 5. 安全与幂等描述的是方法语义

- GET 是安全方法：客户端请求的语义基本只读。
- GET、PUT、DELETE 是幂等方法：多次相同请求的预期服务端效果与一次相同。
- POST 不是规范预先定义的幂等方法，具体接口不能擅自假定重复提交一定只有一次效果。

幂等不表示每次响应必须完全相同。第一次 DELETE 可能成功移除关联，第二次发现关联已经不存在；两个响应
可以不同，但重复请求的预期最终效果仍是“该目标关联不再存在”。本课不设计幂等键或重试机制。

## 三、设计集合、成员与筛选 URI

### 1. 集合和成员回答不同问题

TeamFlow 统一采用复数名词作为项目命名约定：

```text
/tasks                 任务集合
/tasks/TASK-101        一个任务成员
/projects              项目集合
/projects/PRJ-7        一个项目成员
```

复数形式让集合与成员关系容易扫描，但它不是 REST 或 URI 规范的强制语法。URI 中出现动词也不是协议语法
错误；真正不能违背的是请求方法语义。例如，无论 URI 写成 `/delete-task` 还是 `/tasks/TASK-101/delete`，
都不能让 GET 承担客户端请求的删除动作。

### 2. path 表达层级，query 表达非层级选择

RFC 3986 把 path 描述为通常按层级组织的数据，把 query 描述为非层级数据。TeamFlow 因此约定：

```text
/projects/PRJ-7/tasks             PRJ-7 拥有的任务集合
/tasks?status=OPEN                按状态筛选任务集合
/tasks?status=OPEN&assignee=lin   组合两个筛选条件
```

`status` 和 `assignee` 没有变成任务的父资源，它们只选择当前集合中的一部分，所以放入 query。query 参与
标识请求目标，但不会因为使用问号就变成“可忽略的备注”。

### 3. 是否嵌套取决于所有权和标识符作用域

`/projects/PRJ-7/tasks` 有明确含义：项目拥有一个任务集合。成员路径是否继续嵌套，要看任务 ID 的作用域：

- 若 `TASK-101` 在整个 TeamFlow 中唯一，成员可使用稳定的 `/tasks/TASK-101`；项目集合只是找到它的入口。
- 若任务编号只在项目内唯一，成员需要项目上下文，可使用
  `/projects/PRJ-7/tasks/TASK-101`。

不要为了“看起来更 REST”把组织、项目、团队、任务全部堆进路径。每一层都应对标识目标不可缺少，否则层级
会把无关的组织变化传播给稳定任务 URI。

### 4. URI 的资源语义要长期稳定

下面的 URI 使用可变标题或状态作为身份：

```text
/open-tasks/fix-login-page
```

任务改名或进入 DOING 后，URI 就失去原含义。更稳定的设计是：

```text
/tasks/TASK-101
/tasks/TASK-101          同一个 URI 返回更新后的表示
/tasks?status=OPEN       状态只作为集合筛选条件
```

稳定不等于字符永远不能迁移，而是命名机构必须维护“这个标识符长期指向同一资源语义”的合同。本课先选择
不依赖可变标题和状态的标识符。

## 四、把 TeamFlow 需求写成路由表

### 1. 先写需求句，再选资源和方法

每条需求按三个问题处理：

1. 请求针对集合还是成员？
2. 标识目标所需的层级是什么，筛选条件是什么？
3. 客户端是读取、让集合处理创建、创建或替换已知目标，还是删除目标关联？

例如“读取 PRJ-7 中由 lin 负责的开放任务”：目标仍是项目任务集合，项目是所有权层级，状态与负责人是
筛选条件，因此得到：

```http
GET /projects/PRJ-7/tasks?status=OPEN&assignee=lin HTTP/1.1
```

### 2. 本课固定的最小设计

| TeamFlow 需求 | 方法 | URI | 设计理由 |
| --- | --- | --- | --- |
| 读取任务集合 | GET | `/tasks` | 读取集合当前表示 |
| 由服务端分配 ID 创建任务 | POST | `/tasks` | 集合处理内容并选择成员标识符 |
| 读取一个全局唯一任务 | GET | `/tasks/TASK-101` | 稳定成员标识 |
| 创建或替换已知任务 | PUT | `/tasks/TASK-101` | 客户端已知目标 URI |
| 删除任务当前关联 | DELETE | `/tasks/TASK-101` | 删除语义来自方法 |
| 读取项目任务集合 | GET | `/projects/PRJ-7/tasks` | 项目与任务集合有所有权层级 |
| 筛选项目开放任务 | GET | `/projects/PRJ-7/tasks?status=OPEN` | 层级留在 path，筛选放 query |

这里只固定资源、URI 和方法，不固定 JSON 字段、完整状态码矩阵或响应包装。

### 3. 路由表不是完整 REST 证明

Fielding 对 REST 统一接口列出四项约束：资源标识、通过表示操作资源、自描述消息、以超媒体驱动应用状态。
本课主要处理第一项和方法语义，并为后续表示合同打基础。只有一张 CRUD 路由表，不能据此宣称系统已经
满足完整 REST 架构风格。

## 五、常见错误

### 七个典型设计错误

**社区补充：** 实际开发问答反复争论 URI 是否必须复数、动词是否天然违规。这些问题说明命名习惯很容易
被误当成协议规则。本课把它们作为教学信号，技术结论仍以 RFC 9110、RFC 3986 和 REST 原始论文为准。

:::pitfalls
### 用 GET 触发删除

**触发条件：** 把删除动作写进 URI，却仍使用便于点击或预取的 GET。

**原因：** 让 URI 文字代替了 HTTP 方法语义。

**后果：** 链接检查、预取或搜索索引访问该 URI 时，可能意外修改任务状态。

**错误示例：**

```http
GET /tasks/TASK-101/delete HTTP/1.1
```

**正确写法：**

```http
DELETE /tasks/TASK-101 HTTP/1.1
```

**验证方式：** 逐行检查路由表，所有 GET 都只能表达读取；删除需求必须落在 DELETE 行。

### 混淆 POST 到集合与 PUT 到已知目标

**触发条件：** 一边要求服务端选择任务 ID，一边把 POST 发给已经带 ID 的成员 URI；或客户端已知目标却
仍把内容提交到集合。

**原因：** 只记住“POST 和 PUT 都可能创建”，没有核对请求目标由谁确定。

**后果：** 服务端无法判断该生成新成员，还是创建或替换指定成员。

**错误示例：**

```text
服务端选择 ID -> POST /tasks/TASK-301
客户端已知目标 -> PUT /tasks
```

**正确写法：**

```text
服务端选择 ID -> POST /tasks
客户端已知目标 -> PUT /tasks/TASK-301
```

**验证方式：** 遮住方法只看目标；需要服务端选 ID 时目标必须是集合，客户端已知目标时 URI 必须已经完整。

### 把筛选条件伪装成所有权层级

**触发条件：** 当前合同只想筛选同一个任务集合，却把状态写成 path 子资源。

**原因：** 没有区分层级数据与非层级选择条件。

**后果：** 每增加一个筛选条件都要发明新的路径排列，组合条件变得不稳定。

**错误示例：**

```http
GET /tasks/status/OPEN/assignee/lin HTTP/1.1
```

**正确写法：**

```http
GET /tasks?status=OPEN&assignee=lin HTTP/1.1
```

**验证方式：** 删除 query 后目标应回到 `/tasks` 集合；交换两个筛选条件不应改变资源的所有权层级。

### 在全局唯一 ID 前堆叠无关层级

**触发条件：** `TASK-101` 已在全局唯一，仍把组织、团队和项目全部加入成员的规范 URI。

**原因：** 误以为路径越深越符合 REST。

**后果：** 任务换团队或项目时，稳定成员 URI 被迫变化，旧引用容易失效。

**错误示例：**

```text
/organizations/acme/teams/backend/projects/PRJ-7/tasks/TASK-101
```

**正确写法：**

```text
/tasks/TASK-101
/projects/PRJ-7/tasks
```

**验证方式：** 在纸面上把 TASK-101 从 PRJ-7 移到 PRJ-8；成员 URI 应保持不变，两个项目集合的成员关系
可以变化。若任务 ID 仅在项目内唯一，则应保留项目层级并记录这一前提。

### 用可变标题或状态标识成员

**触发条件：** 把任务标题或当前状态拼进成员 URI。

**原因：** 把资源当前表示误当成资源身份。

**后果：** 改名或状态流转会产生新 URI，看起来像换了资源。

**错误示例：**

```text
/open-tasks/fix-login-page
```

**正确写法：**

```text
/tasks/TASK-101
/tasks?status=OPEN
```

**验证方式：** 分别把标题改为“修复登录和验证码页”、状态改为 DOING；成员 URI 必须仍为
`/tasks/TASK-101`。

### 把 DELETE 等同于物理删除数据库记录

**触发条件：** 从方法名直接承诺数据库行、归档和备份都会被销毁。

**原因：** 把 HTTP 资源接口与服务端存储实现混成一层。

**后果：** API 合同承诺了 HTTP 无法保证的内部效果，软删除或归档实现会被误判为违反协议。

**错误示例：**

```text
DELETE 成功 = 数据库记录和所有存储副本必须物理销毁
```

**正确写法：**

```text
DELETE 请求移除目标 URI 与当前功能的关联；底层数据如何处置由服务端实现决定
```

**验证方式：** 验收只检查目标 URI 的当前关联是否已按合同移除，不用数据库物理行数替代 HTTP 语义。

### 看到 CRUD 路由就宣称完整 REST

**触发条件：** 只列出 GET、POST、PUT、DELETE 和资源 URI，便宣布系统已完整满足 REST。

**原因：** 忽略统一接口还包括表示、自描述消息和超媒体等约束。

**后果：** 设计结论超过了现有证据，后续表示和消息合同缺失也不再被发现。

**错误示例：**

```text
四个方法 + 一组 URI = 已证明完整 REST
```

**正确写法：**

```text
本课只完成资源标识与方法语义；是否满足完整 REST 需要继续核对全部架构约束
```

**验证方式：** 对照四项统一接口约束逐项标记证据；本课不能把尚未学习的表示、自描述消息和超媒体标为
已完成。
:::

## 六、JDK 25 完整程序

### 1. 在 IDEA 中准备现代版

1. 新建普通 Java 项目，Project SDK 选择 JDK 25，Language level 跟随 SDK。
2. 在 `src` 下创建 `TeamFlowRestDesign` 类，文件名应为 `TeamFlowRestDesign.java`。
3. 粘贴下面完整代码；打开 `File -> Project Structure -> Project` 再确认 Project SDK 为 25。
4. 点击 `main` 左侧运行图标，选择 `Run 'TeamFlowRestDesign.main()'`。

### 2. 完整现代版代码

```java
/**
 * 输出 TeamFlow 的最小 REST 资源设计，并证明表示变化不会改变资源标识。
 */
public final class TeamFlowRestDesign {
    /**
     * 程序入口。
     *
     * @param args 启动参数，本程序不使用
     */
    public static void main(String[] args) {
        RoutePlan[] routes = {
            new RoutePlan("GET", "/tasks", "读取任务集合"),
            new RoutePlan("POST", "/tasks", "由集合处理创建并选择成员标识符"),
            new RoutePlan("GET", "/tasks/TASK-101", "读取一个全局唯一任务"),
            new RoutePlan("PUT", "/tasks/TASK-101", "创建或替换已知目标"),
            new RoutePlan("DELETE", "/tasks/TASK-101", "移除目标 URI 的当前关联"),
            new RoutePlan(
                "GET",
                "/projects/PRJ-7/tasks?status=OPEN",
                "读取项目中筛选后的任务集合"
            )
        };

        System.out.println("TeamFlow REST 资源设计");
        for (RoutePlan route : routes) {
            System.out.println(route.method() + " " + route.uri() + " -> " + route.meaning());
        }

        TaskRepresentation before =
            new TaskRepresentation("/tasks/TASK-101", "修复登录页", "OPEN");
        TaskRepresentation after =
            new TaskRepresentation("/tasks/TASK-101", "修复登录和验证码页", "DOING");

        System.out.println("资源标识保持不变: " + before.uri().equals(after.uri()));
        System.out.println("旧表示: " + before.title() + " / " + before.status());
        System.out.println("新表示: " + after.title() + " / " + after.status());
    }

    /**
     * 保存一条方法、URI 与请求意图已经对齐的路由计划。
     *
     * @param method HTTP 方法
     * @param uri 资源标识符
     * @param meaning 本课采用的请求意图
     */
    private record RoutePlan(String method, String uri, String meaning) {}

    /**
     * 保存本例观察资源身份所需的固定表示字段。
     *
     * @param uri 稳定资源标识符
     * @param title 当前任务标题
     * @param status 当前任务状态
     */
    private record TaskRepresentation(String uri, String title, String status) {}
}
```

### 3. 预期控制台输出

```text
TeamFlow REST 资源设计
GET /tasks -> 读取任务集合
POST /tasks -> 由集合处理创建并选择成员标识符
GET /tasks/TASK-101 -> 读取一个全局唯一任务
PUT /tasks/TASK-101 -> 创建或替换已知目标
DELETE /tasks/TASK-101 -> 移除目标 URI 的当前关联
GET /projects/PRJ-7/tasks?status=OPEN -> 读取项目中筛选后的任务集合
资源标识保持不变: true
旧表示: 修复登录页 / OPEN
新表示: 修复登录和验证码页 / DOING
```

### 4. 从启动到输出经历了什么

`main` 先创建六条 `RoutePlan`，每条都把方法、目标 URI 和意图放在一起。循环只是依次输出设计表，并没有
发送网络请求。随后程序创建同一任务的两份 `TaskRepresentation`：标题和状态变化，但 URI 相等，所以输出
`true`。这正是“资源身份稳定、表示可以变化”的可观察结果。

## 七、Java 8 完整程序

### 1. 在 IDEA 中准备兼容版

1. 使用单独的普通 Java 项目，Project SDK 选择已安装的 JDK 8，Language level 选择 8。
2. 创建 `TeamFlowRestDesign` 类，把下面完整代码放入同名文件。
3. 在 `File -> Project Structure -> Modules -> Dependencies` 核对 Module SDK 也是 8，不能只改 Project SDK。
4. 打开 `Run -> Edit Configurations`，确认运行配置的 JRE 使用项目 JDK 8，然后运行
   `TeamFlowRestDesign.main()`。

### 2. 完整兼容代码

```java
/**
 * 输出 TeamFlow 的最小 REST 资源设计，并证明表示变化不会改变资源标识。
 */
public final class TeamFlowRestDesign {
    /**
     * 程序入口。
     *
     * @param args 启动参数，本程序不使用
     */
    public static void main(String[] args) {
        RoutePlan[] routes = {
            new RoutePlan("GET", "/tasks", "读取任务集合"),
            new RoutePlan("POST", "/tasks", "由集合处理创建并选择成员标识符"),
            new RoutePlan("GET", "/tasks/TASK-101", "读取一个全局唯一任务"),
            new RoutePlan("PUT", "/tasks/TASK-101", "创建或替换已知目标"),
            new RoutePlan("DELETE", "/tasks/TASK-101", "移除目标 URI 的当前关联"),
            new RoutePlan(
                "GET",
                "/projects/PRJ-7/tasks?status=OPEN",
                "读取项目中筛选后的任务集合"
            )
        };

        System.out.println("TeamFlow REST 资源设计");
        for (RoutePlan route : routes) {
            System.out.println(route.method + " " + route.uri + " -> " + route.meaning);
        }

        TaskRepresentation before =
            new TaskRepresentation("/tasks/TASK-101", "修复登录页", "OPEN");
        TaskRepresentation after =
            new TaskRepresentation("/tasks/TASK-101", "修复登录和验证码页", "DOING");

        System.out.println("资源标识保持不变: " + before.uri.equals(after.uri));
        System.out.println("旧表示: " + before.title + " / " + before.status);
        System.out.println("新表示: " + after.title + " / " + after.status);
    }

    /**
     * 保存一条方法、URI 与请求意图已经对齐的路由计划。
     */
    private static final class RoutePlan {
        private final String method;
        private final String uri;
        private final String meaning;

        /**
         * 创建一条路由计划。
         *
         * @param method HTTP 方法
         * @param uri 资源标识符
         * @param meaning 本课采用的请求意图
         */
        private RoutePlan(String method, String uri, String meaning) {
            this.method = method;
            this.uri = uri;
            this.meaning = meaning;
        }
    }

    /**
     * 保存本例观察资源身份所需的固定表示字段。
     */
    private static final class TaskRepresentation {
        private final String uri;
        private final String title;
        private final String status;

        /**
         * 创建一份任务表示。
         *
         * @param uri 稳定资源标识符
         * @param title 当前任务标题
         * @param status 当前任务状态
         */
        private TaskRepresentation(String uri, String title, String status) {
            this.uri = uri;
            this.title = title;
            this.status = status;
        }
    }
}
```

### 3. 预期结果与现代版一致

Java 8 程序必须逐行得到上一节相同输出，尤其是 `资源标识保持不变: true`。若 IDEA 报 `record` 无法识别，
说明运行的仍是现代版源码；若终端 JDK 与 IDEA JDK 不一致，应分别核对 `javac -version`、Project SDK、
Module SDK 和运行配置 JRE。

### 4. 两个版本真正不同的地方

JDK 25 使用 `record` 声明固定数据载体；record 在 JDK 16 才正式交付，Java 8 不支持。Java 8 版因此显式
声明 `final` 字段和构造器，并只实现本程序读取字段所需的固定数据对象。它没有补齐 record 自动提供的
`equals`、`hashCode`、`toString` 等完整对象合同，所以不能称为 record 的完整等价实现。两个版本使用的
资源、URI 和 HTTP 方法语义没有差异。

## 八、独立练习

### 1. 任务与验收

:::exercise
### 为项目任务补齐路由决策

**要求：** 编写 `TeamFlowRouteExercise`，依次输出五条需求的 method 和 URI：读取 PRJ-7 的任务集合；
由服务端在 PRJ-7 中创建任务；按负责人 lin 筛选全局任务；读取全局唯一任务 TASK-205；创建或替换已知
任务 TASK-205。项目任务集合必须体现所有权层级，筛选必须使用 query，成员使用稳定 ID。不要加入 JSON、
状态码、Spring Boot 或数据库代码。

**验收：** 两个版本都能独立运行并逐行得到文末预期输出；五条结果分别使用 GET、POST、GET、GET、PUT；
只能有项目所有权层级，`assignee=lin` 只能出现在 query；JDK 25 使用 record，Java 8 提供完整普通类源码。
:::

### 2. JDK 25 参考实现

```java
/**
 * 输出项目任务场景的 REST 路由练习答案。
 */
public final class TeamFlowRouteExercise {
    /**
     * 程序入口。
     *
     * @param args 启动参数，本程序不使用
     */
    public static void main(String[] args) {
        Decision[] decisions = {
            new Decision("读取 PRJ-7 的任务", "GET", "/projects/PRJ-7/tasks"),
            new Decision("在 PRJ-7 中创建任务", "POST", "/projects/PRJ-7/tasks"),
            new Decision("筛选 lin 的任务", "GET", "/tasks?assignee=lin"),
            new Decision("读取 TASK-205", "GET", "/tasks/TASK-205"),
            new Decision("创建或替换 TASK-205", "PUT", "/tasks/TASK-205")
        };

        System.out.println("TeamFlow 路由练习");
        for (Decision decision : decisions) {
            System.out.println(
                decision.requirement() + " -> " + decision.method() + " " + decision.uri()
            );
        }
    }

    /**
     * 保存一条可验收的需求、方法与 URI 决策。
     *
     * @param requirement TeamFlow 需求
     * @param method HTTP 方法
     * @param uri 资源标识符
     */
    private record Decision(String requirement, String method, String uri) {}
}
```

### 3. Java 8 参考实现

```java
/**
 * 输出项目任务场景的 REST 路由练习答案。
 */
public final class TeamFlowRouteExercise {
    /**
     * 程序入口。
     *
     * @param args 启动参数，本程序不使用
     */
    public static void main(String[] args) {
        Decision[] decisions = {
            new Decision("读取 PRJ-7 的任务", "GET", "/projects/PRJ-7/tasks"),
            new Decision("在 PRJ-7 中创建任务", "POST", "/projects/PRJ-7/tasks"),
            new Decision("筛选 lin 的任务", "GET", "/tasks?assignee=lin"),
            new Decision("读取 TASK-205", "GET", "/tasks/TASK-205"),
            new Decision("创建或替换 TASK-205", "PUT", "/tasks/TASK-205")
        };

        System.out.println("TeamFlow 路由练习");
        for (Decision decision : decisions) {
            System.out.println(
                decision.requirement + " -> " + decision.method + " " + decision.uri
            );
        }
    }

    /**
     * 保存一条可验收的需求、方法与 URI 决策。
     */
    private static final class Decision {
        private final String requirement;
        private final String method;
        private final String uri;

        /**
         * 创建一条路由决策。
         *
         * @param requirement TeamFlow 需求
         * @param method HTTP 方法
         * @param uri 资源标识符
         */
        private Decision(String requirement, String method, String uri) {
            this.requirement = requirement;
            this.method = method;
            this.uri = uri;
        }
    }
}
```

### 4. 运行与验收结果

JDK 25 项目使用 Project SDK 25 运行现代版；Java 8 项目使用 Project SDK、Module SDK 和运行配置 JRE
均为 8 的独立项目运行兼容版。两个版本都应输出：

```text
TeamFlow 路由练习
读取 PRJ-7 的任务 -> GET /projects/PRJ-7/tasks
在 PRJ-7 中创建任务 -> POST /projects/PRJ-7/tasks
筛选 lin 的任务 -> GET /tasks?assignee=lin
读取 TASK-205 -> GET /tasks/TASK-205
创建或替换 TASK-205 -> PUT /tasks/TASK-205
```

逐行核对 method、path 和 query。任何一行把 `assignee=lin` 放进 path、把已知成员发送到集合，或让 GET
表达修改，都不满足练习合同。

## 九、把本课放回 TeamFlow

### 1. 当前增量是一张稳定设计表

完成本课后，TeamFlow 得到的是资源词汇、URI 和方法之间的明确映射。程序只打印设计并观察标识稳定性，
没有实现 Web 服务。下一步才能为这些资源定义 JSON 表示；再后面才会组合成完整任务 API。

### 2. 完成本课后的自检

- 我能指出资源、URI 和表示各自承担什么职责。
- 我能说明 POST 到集合与 PUT 到已知目标的差异。
- 我不会使用 GET 表达删除或其他客户端请求的状态修改。
- 我能根据所有权、标识符作用域、层级和筛选条件拆分 path 与 query。
- 我知道复数名词是 TeamFlow 约定，不是 REST 强制语法。
- 我不会把 DELETE 解释成数据库物理删除，也不会把 CRUD 路由表说成完整 REST 证明。
- 我能运行 JDK 25 和 Java 8 两版完整程序，并得到相同的路由结果。
