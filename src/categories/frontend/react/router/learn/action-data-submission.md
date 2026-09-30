---
id: react.router.learn.intermediate.action-data-submission
type: lesson
title: Action 数据提交
summary: 用 route action 处理 mutation submission，并观察成功写入后的 loader 自动重新验证。
domain: frontend
technology: react
module: router
stage: intermediate
level: intermediate
estimatedMinutes: 105
prerequisites:
  - react.router.learn.intermediate.loader-data-loading
  - react.router.learn.intermediate.navigation-pending-ui
related:
  - react.router.learn.intermediate.loader-requests-and-redirects
  - react.router.learn.intermediate.route-data-reading-and-sharing
  - react.router.learn.intermediate.navigation-pending-ui
tags:
  - React Router
  - Data Mode
  - action
  - ActionFunctionArgs
  - Request
  - FormData
  - Revalidation
  - useNavigation
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-21
objectives:
  - 能说明 route action 处理 mutation submission，而 GET submission 仍进入 loader。
  - 能从 ActionFunctionArgs 取得原生 Request，并只调用一次 request.formData()。
  - 能安全读取 FormData 的字符串字段，处理 name、null 与 File 类型边界。
  - 能通过真实 Data Router submission 触发 action，而不是直接调用 action 函数。
  - 能解释成功 action 后当前匹配 loaders 的默认 revalidation。
  - 能观察普通 mutation navigation 的 submitting、loading 与 idle 状态序列。
  - 能区分教学延迟、内存数据源与真实后端持久化。
recap:
  - action 是 route 对 POST、PUT、PATCH、DELETE mutation submission 的处理函数。
  - ActionFunctionArgs 在 8.3.0 提供 request、url、pattern、params 与 context，本课主用 request。
  - request 是原生 Fetch Request，body reader 只能消费一次；FormData 也是 Web 平台对象。
  - GET submission 把字段放入 URL 并运行 loader，不会进入 action。
  - 成功 action 后，React Router 默认重新执行当前页面匹配链上的 loaders。
  - 有可等待的 revalidation 时，普通 mutation navigation 可观察 idle、submitting、loading、idle。
  - action 可以返回结果，但本课不读取 action data，也不展示字段校验反馈。
sources:
  - title: React Router 8.3.0 Release
    url: https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0
    sourceType: release-note
    appliesTo: React Router 8.3.0
    claims:
      - 8.3.0 是核验时的稳定发布版本，对应固定官方提交。
  - title: npm react-router Latest Metadata
    url: https://registry.npmjs.org/react-router/latest
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - 2026-08-21 的 latest dist-tag 为 8.3.0。
  - title: React Router Actions
    url: https://reactrouter.com/8.3.0/start/data/actions
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Data Mode action 处理数据 mutation。
      - action 完成后 loader data 会自动重新验证。
  - title: React Router Route Object
    url: https://reactrouter.com/8.3.0/start/data/route-object
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - route object 可以声明 action。
      - action 成功后当前匹配 loaders 默认重新验证。
  - title: React Router 8.3.0 Data Function Types
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L269-L347
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - ActionFunctionArgs 包含 request、url、pattern、params 与 context。
      - request 的类型是原生 Request。
  - title: React Router 8.3.0 Submission Request Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L6944-L6982
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - mutation method 会规范化为大写。
      - 默认 FormData submission 会构造 urlencoded Request body。
      - Router 的 AbortSignal 会进入 Request。
  - title: React Router 8.3.0 Mutation Navigation Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L1993-L2235
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - mutation submission 先执行目标 route action。
      - 没有 action 的目标 route 不能处理 mutation submission。
  - title: React Router 8.3.0 Navigation States
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L654-L695
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - Navigation 是 idle、submitting 与 loading 的判别联合。
      - mutation revalidation 的 loading 状态可以保留 submission 字段。
  - title: React Router 8.3.0 Submission Test
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/router/submission-test.ts#L925-L964
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - action 收到大写 POST、默认 urlencoded Content-Type 和可解析的 FormData。
      - ActionFunctionArgs 的五项实参由固定官方测试覆盖。
  - title: React Router 8.3.0 Navigation Test
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/router/navigation-test.ts#L1185-L1231
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 普通 mutation navigation 依次进入 submitting、loading 与 idle。
      - loading 阶段仍可读取 submission 字段，idle 后这些字段清空。
  - title: MDN Request formData
    url: https://developer.mozilla.org/en-US/docs/Web/API/Request/formData
    sourceType: official-reference
    appliesTo: Fetch Living Standard
    claims:
      - Request.formData 读取 body 并异步返回 FormData。
  - title: MDN Request bodyUsed
    url: https://developer.mozilla.org/en-US/docs/Web/API/Request/bodyUsed
    sourceType: official-reference
    appliesTo: Fetch Living Standard
    claims:
      - bodyUsed 表示 Request body 是否已被读取。
  - title: MDN FormData
    url: https://developer.mozilla.org/en-US/docs/Web/API/FormData
    sourceType: official-reference
    appliesTo: XMLHttpRequest Living Standard
    claims:
      - FormData 表示表单字段键值集合。
      - get 返回第一项，缺失键返回 null，重复键可通过 getAll 读取。
---

# Action 数据提交

## 一、学习目标

- 能判断一次 submission 应该进入 `loader` 还是 `action`。
- 能在 route object 上定义最小 `action`，并认识 `ActionFunctionArgs` 的完整字段。
- 能从原生 `Request` 只读取一次 `FormData`，再安全取得普通文本字段。
- 能通过真实 Data Router mutation 观察 action、loader revalidation 与组件更新。
- 能用 `useNavigation` 区分 `submitting`、`loading` 和 `idle`。
- 能识别 GET、字段 `name`、重复读取 body、重复提交与 Router 卸载等常见错误。
- 能守住本课边界，不提前引入表单结果消费、Fetcher、错误边界或自定义重新验证。

## 二、Loader 与 Action 的分工

### 1. Loader 负责读取，Action 负责 Mutation

Data Router 把一条 route 的读取与写入入口放在同一个 route object 上：

```tsx
const routes = [
  {
    path: '/tasks',
    loader: tasksLoader,
    action: tasksAction,
    Component: TasksPage,
  },
]
```

`loader` 在页面进入或重新验证时准备可读取的数据；`action` 处理目标地址上的 mutation submission。
React Router 8.3.0 识别的 mutation methods 是 `POST`、`PUT`、`PATCH` 和 `DELETE`。一次提交先根据目标
URL 完成路由匹配，再调用目标 route 的 action，不会把当前匹配链上所有 action 都执行一遍。

可以先用下面的职责表判断入口：

| 用户意图 | Method | Router 数据入口 | 常见结果 |
| --- | --- | --- | --- |
| 查询、搜索、筛选 | `GET` | `loader` | URL 带查询参数，重新读取数据 |
| 创建记录 | `POST` | `action` | 写入后默认重新验证 loaders |
| 整体更新 | `PUT` | `action` | 写入后默认重新验证 loaders |
| 局部更新 | `PATCH` | `action` | 写入后默认重新验证 loaders |
| 删除记录 | `DELETE` | `action` | 写入后默认重新验证 loaders |

这张表描述 Router 的数据流程，不替代服务器端对 HTTP method、权限和业务规则的校验。

### 2. GET Submission 不调用 Action

传入表单数据但没有提供 mutation method 时，Router 默认按 GET 处理：字段会成为查询参数，导航进入
`loading`，匹配的 loader 重新执行。它不会因为“数据来自表单”就自动调用 action。

```tsx
void router.navigate('/tasks', {
  formData: new FormData(form),
})
```

上面不是创建任务，而是 GET submission。只有明确提供 mutation method 才会进入 action：

```tsx
void router.navigate('/tasks', {
  formMethod: 'post',
  formData: new FormData(form),
})
```

调用处可以写小写 `'post'`，Router state 与 action 收到的 `request.method` 会规范化为大写 `'POST'`。

### 3. Action 属于命中的目标 Route

提交地址仍然要参与路由匹配。若 `/tasks` 是目标 route，它必须声明 action：

```tsx
const routes = [
  {
    path: '/tasks',
    action: tasksAction,
    Component: TasksPage,
  },
]
```

不要把“按钮的点击事件”说成 action 的调用条件。按钮或原生表单只是产生用户意图；真正触发 action 的是
Data Router 收到的 mutation submission。

## 三、定义最小 Action

### 1. 使用 `ActionFunctionArgs`

本课 action 只解构真正使用的 `request`：

```tsx
import type { ActionFunctionArgs } from 'react-router'

async function createTaskAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const titleValue = formData.get('title')

  if (typeof titleValue !== 'string' || titleValue.trim() === '') {
    return null
  }

  tasks.push({ title: titleValue.trim() })
  return null
}
```

`ActionFunctionArgs` 在 8.3.0 的完整数据函数字段如下：

| 字段 | 含义 | 本课处理方式 |
| --- | --- | --- |
| `request` | 原生 Fetch `Request`，包含 method、URL、headers、body 与 signal | 主线实操 |
| `params` | 当前 action route 的动态路径参数 | 说明用途，不为 Demo 强造动态段 |
| `url` | 当前数据调用使用的 `URL` | 认识完整签名，不展开 |
| `pattern` | 未插值的匹配 pattern，可用于观察和追踪 | 认识完整签名，不展开 |
| `context` | 当前 navigation/fetcher 的 Router context | 不进入 middleware 或 Framework Mode |

没有使用的字段不应为了展示类型而全部解构。真实项目出现 `/tasks/:taskId` 时，action 可以从
`params.taskId` 确定修改对象，但仍需验证它是否存在且是否合法。

### 2. Action 可以异步完成工作

action 可以返回普通值或 Promise。数据库写入、服务端 API 请求等操作通常是异步的，因此 handler 可以声明为
`async` 并等待写入完成：

```tsx
async function updateTaskAction({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  const title = formData.get('title')

  if (typeof title !== 'string' || !params.taskId) return null

  await updateTask(params.taskId, title)
  return null
}
```

本课统一 `return null`。action 的返回结果可以被页面读取，但本课不处理 action data、字段错误与校验反馈，
只观察写入完成后的 loader data。

### 3. 不要直接调用 Action 函数

下面的代码虽然执行了函数，却绕开了 Router：

```tsx
await tasksAction({ request } as ActionFunctionArgs)
```

它不会建立完整的 submission 状态，不会经过 Router 的目标匹配，也不能证明 action 后的 loader
revalidation。课程 Demo 必须从 Data Router 发起真实 mutation submission。

## 四、读取 Request 与 FormData

### 1. `request` 是原生 Fetch Request

Router 为客户端 submission 构造原生 `Request`。默认 FormData mutation 使用
`application/x-www-form-urlencoded` body，并把当前导航的 `AbortSignal` 交给 `request.signal`。

```tsx
async function tasksAction({ request }: ActionFunctionArgs) {
  console.log(request.method) // POST
  console.log(request.signal.aborted) // 通常为 false

  const formData = await request.formData()
  return null
}
```

本课不把默认编码误写成 multipart，也不展开 JSON、文件上传和自定义 `encType`。这些场景需要各自的 body
解析和边界设计。

### 2. Request Body 只能消费一次

`request.formData()` 会读取 body。读取完成后 `request.bodyUsed` 变为 `true`，再次调用 body reader 会失败。
因此 action 应在一个明确位置读取一次，再把结果或解析后的字段交给后续逻辑：

```tsx
const formData = await request.formData()
const title = formData.get('title')
const priority = formData.get('priority')
```

不要让日志函数、校验函数和写入函数各自调用 `request.formData()`：

```tsx
await auditRequest(await request.formData())
await saveTask(await request.formData())
```

如果确实需要两份可独立消费的 body，Web 平台提供 `request.clone()`，但这不是本课主线。更简单的做法通常
是读取一次并传递已解析的数据。

### 3. FormData 按控件 `name` 建立键

原生表单只有 successful controls 会进入 `new FormData(form)`。输入框只有 `id` 而没有 `name` 时，
label 可以正常关联，但提交结果中没有该字段：

```tsx
<label htmlFor="task-title">任务标题</label>
<input id="task-title" name="title" required />
```

`FormData.get('title')` 返回第一个匹配值，键不存在时返回 `null`，字段值类型是 `string | File`。普通文本
字段仍应先缩窄类型：

```tsx
const titleValue = formData.get('title')

if (typeof titleValue !== 'string' || titleValue.trim() === '') {
  return null
}
```

重复字段要使用 `getAll()`。不要把 `get()` 当成数组，也不要对未知值直接调用 `trim()`。

### 4. 浏览器约束不替代运行时校验

Demo 使用 `required` 让正常演示路径不提交空标题，但 action 仍检查 `null`、`File` 和空白字符串。请求可能
来自脚本、旧客户端或被修改的页面，服务器端 action 更不能只依赖浏览器约束。

本课遇到无效值时只 `return null`，目的是保持 action 管线聚焦，不展开错误对象的返回与页面展示。

## 五、触发真实 Mutation Submission

### 1. 使用原生表单桥触发提交

为了只观察 action 本身，Demo 保留原生 `<form>` 的键盘与字段语义，在 `onSubmit` 中调用独立 Data
Router 的 submission navigation：

```tsx
function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
  const form = event.currentTarget

  void router.navigate('/tasks', {
    formMethod: 'post',
    formData: new FormData(form),
  })
}
```

这段桥接只负责把原生 `FormData` 交给 Data Router，不代表生产应用必须使用这一入口；Router 表单 API
及其 method、history 与渐进增强细节不在本课范围内。

### 2. 保留原生表单语义

虽然提交由 handler 接管，界面仍使用真实表单元素：

```tsx
<form onSubmit={handleSubmit}>
  <label htmlFor="task-title">任务标题</label>
  <input id="task-title" name="title" required />
  <button type="submit">添加任务</button>
</form>
```

这样 Enter 可以提交，Tab 顺序由原生控件提供，label 也能关联输入框。不要把表单改成一个 `div` 和按钮点击
事件；那会失去键盘、验证与字段收集语义。

### 3. Busy 状态只改善界面，不保证 Exactly-once

提交期间可以禁用按钮：

```tsx
const navigation = useNavigation()
const isBusy = navigation.state !== 'idle'

<button type="submit" disabled={isBusy}>
  {navigation.state === 'submitting' ? '提交中' : '添加任务'}
</button>
```

这能阻止大多数连续点击，但不是业务上的 exactly-once 保证。网络重试、多个标签页和不同客户端仍可能产生
重复请求。真实持久化系统需要根据业务设计幂等键、唯一约束或事务，本课不展开这些后端策略。

## 六、Action 后的 Loader Revalidation

### 1. 成功后默认重新读取当前匹配数据

action 成功后，React Router 默认重新执行当前页面匹配链上的 loaders，使组件从数据源重新读取最新状态：

```text
mutation submission
        |
        v
目标 route action 写入数据
        |
        v
当前匹配 loaders 重新执行
        |
        v
新 loader data 提交给 route components
```

这不是“刷新整个应用”，也不是“自动刷新服务器缓存”。只有当前页面匹配链中需要重新验证的 loaders 属于
这次默认流程；自定义 `shouldRevalidate` 可以改变策略，但不在本课范围内。

### 2. 组件继续消费 Loader Data

页面不需要在 action 完成后手工更新任务列表：

```tsx
function TasksPage() {
  const data = useLoaderData<typeof tasksLoader>()

  return (
    <ol>
      {data.tasks.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ol>
  )
}
```

action 改变数据源，loader 重新读取，组件仍然只渲染 loader data。这条路径让读取所有权保持清楚，也避免
同时维护一份“手工追加列表”和一份“loader 返回列表”。

### 3. 让最终列表来自 Loader Data

action 成功完成后，等待当前匹配 loader 默认重跑，再用新的 loader data 渲染最终列表。route component
不额外维护第二份任务数组，读取所有权就不会分散。

## 七、观察 Submission 状态序列

### 1. 一次普通成功 Mutation 的四个时刻

当 action 和后续 loader 都有可等待工作时，`useNavigation()` 可以观察：

```text
idle
  -> submitting  action 正在处理 POST，formData 可读
  -> loading     action 已完成，loader 正在重新验证，submission 仍可读
  -> idle        新 loader data 已提交，submission 字段清空
```

`submitting` 与 `loading` 不是两个并发请求的名字，而是同一次 mutation navigation 的两个阶段。前者等待
action，后者等待 action 之后的数据重新读取。

### 2. 从 Navigation 读取当前 Submission

```tsx
function SubmissionStatus() {
  const navigation = useNavigation()
  const titleValue = navigation.formData?.get('title')
  const title = typeof titleValue === 'string' ? titleValue : '-'

  return (
    <dl>
      <div>
        <dt>state</dt>
        <dd>{navigation.state}</dd>
      </div>
      <div>
        <dt>method</dt>
        <dd>{navigation.formMethod ?? '-'}</dd>
      </div>
      <div>
        <dt>title</dt>
        <dd>{title}</dd>
      </div>
    </dl>
  )
}
```

固定官方测试表明，mutation 后的 `loading` 阶段仍保留 submission 信息；回到 `idle` 后，`formMethod`、
`formData` 和目标 location 都会清空。读取这些字段时仍要处理 `undefined`。

### 3. 中间状态可能非常短

若 action 或 loader 同步完成，某个状态窗口可能短到人眼看不到。Demo 分别给 action 与 revalidation
loader 加入可取消的教学延迟，以便稳定观察和自动化断言。这不意味着生产请求应人为减速。

界面可以提供稳定的 `role="status"` 文本，并在整个 Demo 上设置 `aria-busy`。状态变化不需要抢夺焦点，
也不能只靠颜色区分。

## 八、Action 数据提交观察台

Demo 是“课程任务收件箱”，使用独立 `createMemoryRouter` 和一个 `/tasks` route：

1. 首次挂载时 loader 返回两条内存任务，`action calls = 0`、`loader calls = 1`。
2. 在“任务标题”输入唯一文本并按 Enter，状态进入 `submitting`，method 为 `POST`。
3. action 只调用一次 `request.formData()`，等待后写入工厂闭包内的任务数组，并 `return null`。
4. action 完成后状态进入 `loading`，同一 route 的 loader 自动重新执行。
5. loader 完成后回到 `idle`，调用次数变为 action `1`、loader `2`，列表显示新任务。
6. 最近 action 区域显示写入时读取的 `POST` 与标题；loader request method 仍为 `GET`。

:::demo{id="react.router.learn.intermediate.action-data-submission.action-submission-demo"}
:::

观察台的任务只存在于本次 Demo 工厂闭包中。离开课程再重新挂载时会创建新的 Router 和内存模型，列表重置
为两条初始任务；它不模拟服务器持久化。

Demo 在 action 和后续 loader 的延迟中监听 `request.signal`。真实宿主卸载后，组件释放本次 Router，
pending navigation 被中止，计时器随之清理。该 cleanup 是本仓库宿主隔离方案，不是本课要求业务组件调用的
公共 action API。

## 九、易错使用提示

:::pitfalls
### 错误：只传 `formData`，忘记 Mutation Method

**触发条件：** 调用 `router.navigate` 时只有 `formData`，没有 `formMethod: 'post'`。

**原因：** submission method 缺省为 GET。

**后果：** URL 出现查询参数，loader 执行，action call 保持 0，也没有 `submitting` 阶段。

**错误示例：**

```tsx
void router.navigate('/tasks', { formData })
```

**正确写法：**

```tsx
void router.navigate('/tasks', { formMethod: 'post', formData })
```

**验证方式：** action 内观察 `request.method === 'POST'`，状态轨迹包含 `submitting`。
:::

:::pitfalls
### 错误：认为 GET 也会进入 Action

**触发条件：** 用 GET 表单做查询，却等待 action 处理字段。

**原因：** GET 是 loader submission，不属于 mutation method。

**后果：** action 永远不执行，查询行为与写入职责混在一起。

**错误示例：**

```tsx
void router.navigate('/tasks', { formMethod: 'get', formData })
```

**正确写法：** 查询和筛选让 GET 字段进入 URL 并由 loader 读取；创建、更新、删除才使用 mutation action。

```tsx
function tasksLoader({ request }: LoaderFunctionArgs) {
  const query = new URL(request.url).searchParams.get('query')
  return findTasks(query)
}
```

**验证方式：** GET 对照只出现 `loading -> idle`，action call count 不增加。
:::

:::pitfalls
### 错误：重复读取 Request Body

**触发条件：** 日志与写入逻辑各自调用一次 `request.formData()`。

**原因：** Fetch body reader 只能消费一次，第一次读取后 `bodyUsed` 为 true。

**后果：** 第二次读取 reject `TypeError`，action 无法完成。

**错误示例：**

```tsx
await logFields(await request.formData())
await saveFields(await request.formData())
```

**正确写法：**

```tsx
const formData = await request.formData()
await logFields(formData)
await saveFields(formData)
```

**验证方式：** 搜索 action 中的 `request.formData()`，主线读取只出现一次。
:::

:::pitfalls
### 错误：输入框只有 `id`，没有 `name`

**触发条件：** label 可以聚焦输入框，但 FormData 中取不到字段。

**原因：** `id` 关联 label，`name` 才是 FormData 的键。

**后果：** `formData.get('title')` 返回 `null`，action 无法取得用户输入。

**错误示例：**

```tsx
<input id="task-title" />
```

**正确写法：**

```tsx
<input id="task-title" name="title" required />
```

**验证方式：** 构造 `new FormData(form)` 后检查 `get('title')` 与输入值一致。
:::

:::pitfalls
### 错误：把 `FormData.get()` 结果直接当字符串

**触发条件：** 对结果立即调用 `trim()` 或字符串方法。

**原因：** `get()` 的结果可能是 `string`、`File` 或 `null`。

**后果：** 缺字段或文件字段会触发运行时错误；重复键也只读取第一项。

**错误示例：**

```tsx
const title = formData.get('title').trim()
```

**正确写法：**

```tsx
const value = formData.get('title')
if (typeof value !== 'string') return null
const title = value.trim()
```

**验证方式：** 分别检查正常字符串、缺失键与空白字符串；重复键需求使用 `getAll()`。
:::

:::pitfalls
### 错误：直接调用 Action 函数模拟提交

**触发条件：** 点击事件中手工构造 args 并调用 `tasksAction()`。

**原因：** 该调用绕开 Router 的 submission、匹配与 revalidation 管线。

**后果：** 没有真实 `submitting/loading`，loader 不会按默认策略重跑，Demo 只能证明普通函数执行。

**错误示例：**

```tsx
await tasksAction(fakeArgs)
```

**正确写法：** 通过 Data Router 支持的 submission 入口提交目标 URL、method 和 form data。

```tsx
await router.navigate('/tasks', {
  formMethod: 'post',
  formData,
})
```

**验证方式：** 同一次交互必须观察 action count 增加、loader count 随后增加和完整状态轨迹。
:::

:::pitfalls
### 错误：把自动 Revalidation 说成全站缓存刷新

**触发条件：** 认为 action 返回后 React Router 会刷新所有页面、服务端缓存或 Query cache。

**原因：** 混淆当前匹配 loaders 的默认重新验证与其他数据系统。

**后果：** 学生会建立错误的数据所有权模型，并误判未匹配 route 的数据也已更新。

**错误示例：**

```tsx
// action 完成后全应用所有数据都会自动刷新
```

**正确写法：** action 成功后，当前页面匹配链上的 loaders 默认重新执行；具体策略可被专用 API 调整。

```tsx
const routes = [
  {
    path: '/tasks',
    loader: tasksLoader,
    action: tasksAction,
    Component: TasksPage,
  },
]
```

**验证方式：** 只断言当前匹配 route 的 loader 调用次数，不把未匹配 route 或外部缓存纳入结论。
:::

:::pitfalls
### 错误：卸载宿主后仍保留 Pending Router 工作

**触发条件：** 每次打开 Demo 创建独立 Router，但 React Root 卸载时不释放 Router，延迟也不监听 signal。

**原因：** 宿主生命周期与 Data Router 生命周期没有对齐。

**后果：** 离开页面后 action/loader 的计时工作仍继续，重新挂载可能出现状态或资源污染。

**错误示例：**

```tsx
function Demo() {
  return <RouterProvider router={router} />
}
```

**正确写法：** 本仓库由 Demo 工厂隔离 Router，在真实宿主卸载后释放它，并让延迟 helper 响应
`request.signal`。

```tsx
const isMounted = useRef(false)

useEffect(() => {
  isMounted.current = true

  return () => {
    isMounted.current = false
    queueMicrotask(() => {
      if (!isMounted.current) router.dispose()
    })
  }
}, [])
```

**验证方式：** 在 `submitting` 或 `loading` 中离开课程，确认计时器清除且重新挂载恢复初始数据。
:::

## 十、源码推导与适用场景

### 1. Mutation Submission 进入目标 Action

**官方事实：** 8.3.0 固定源码只在 submission method 属于 `POST`、`PUT`、`PATCH`、`DELETE` 时进入
`handleAction`，并调用目标 match 的 action；GET submission 进入 loader 流程。

**课程推导：** 判断“是否进入 action”要检查目标 URL、method 和目标 route 配置，不能从按钮类型或是否有
FormData 推断。

**适用场景：** 创建、更新、删除 route 数据，以及用调用计数核验 action 是否真实命中。

**边界：** mutation method 集合与内部 `handleAction` 流程来自 8.3.0 固定实现；应用依赖公开 action
合同，不应调用内部函数，升级版本后需复核实现证据。

### 2. Router 构造原生 Request

**官方事实：** 固定源码用目标 URL、规范化后的 method、编码后的 body 和当前 AbortSignal 构造原生
`Request`；默认 FormData mutation 使用 urlencoded body。

**课程推导：** action 应使用标准 `request.method`、`request.formData()` 与 `request.signal`，不需要再
发明一套 Router 专属 request body 类型。

**适用场景：** 读取普通文本字段、把取消信号交给异步工作，以及用浏览器 Web API 规则解释 body 一次性。

**边界：** JSON、text/plain、multipart 与文件上传使用不同编码合同；本课只覆盖默认 FormData mutation，
服务器环境也必须按实际 Request 来源重新验证。

### 3. 成功 Action 后执行 Loader Pass

**官方事实：** action 产生非错误结果后，Router 默认为当前匹配 route 执行 loader revalidation；官方固定
测试覆盖 parent、child 与 index loaders 的重新执行。

**课程推导：** route component 可以继续只消费 loader data；action 负责写入，loader 负责重新读取，不必
在组件中同时手工维护一份最终列表。

**适用场景：** 写入后需要刷新当前页面读取模型的创建、编辑与删除流程。

**边界：** `shouldRevalidate`、错误结果、redirect、fetcher 与自定义 data strategy 会改变或扩展流程，
不能把默认行为说成全应用永远不可覆盖的规则。

### 4. Navigation 暴露 Submission 两阶段

**官方事实：** Navigation 的公开判别联合包含 `submitting`、`loading` 与 `idle`；固定官方测试证明普通
mutation 在 action 阶段为 submitting，revalidation 阶段为 loading，完成后恢复 idle。

**课程推导：** 同一个稳定状态区域可以分别解释“正在写入”和“正在重新读取”，按钮也可以从 Router 状态
派生 disabled，而不需要额外布尔 state。

**适用场景：** 全局提交反馈、当前 submission method/字段观察、提交按钮 busy 状态与自动化状态断言。

**边界：** 同步完成的 action 或 loader 可能让中间窗口短到不可见；课程延迟只提高可观察性，不能作为
生产性能或内部状态持续时间的承诺。

## 十一、练习

:::exercise
### 练习目标

**要求：** 建立一个独立 Data Router 的“读书清单”。`/books` route 同时声明 loader、action 和 component；
原生表单包含 `name="title"` 与 `name="author"` 两个必填文本字段，通过真实 POST submission 进入 action。
action 只调用一次 `request.formData()`，安全缩窄两个字段后写入内存数组并 `return null`；页面只从
`useLoaderData` 渲染最终列表，用 `useNavigation` 显示 method 与 `submitting -> loading -> idle`。

**验收：** 初始 loader 一次、action 零次；按 Enter 提交后 action 恰好一次，随后 loader 恰好再执行一次；
loading 完成前旧列表仍可读，完成后新书只出现一次；idle 时 submission 字段清空。不要加入 Router 声明式
表单、action data、redirect、Fetcher、乐观 UI、自定义 revalidation 或错误边界。
:::

## 十二、本节小结

- route `action` 处理目标 URL 上的 mutation submission；GET submission 仍由 loader 处理。
- `ActionFunctionArgs` 在 8.3.0 包含五项，本课主用原生 `Request`，动态 route 再按需读取 `params`。
- `request.formData()` 消费 body，只读一次；字段按控件 `name` 收集，`get()` 可能返回 string、File 或 null。
- 真实 Data Router submission 才能证明 action 匹配、Navigation 状态和默认 loader revalidation。
- action 成功后当前匹配 loaders 默认重新执行，组件可以继续只渲染 loader data。
- 有可等待工作时，mutation 主线是 `idle -> submitting -> loading -> idle`。
- Demo 的原生表单桥、教学延迟和内存数据源都服务课程观察，不等同于生产持久化方案。

## 十三、参考资料

- [React Router 8.3.0 Release](https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0) - 核验稳定发布与固定 tag。
- [npm react-router Latest Metadata](https://registry.npmjs.org/react-router/latest) - 核验 2026-08-21 的 latest 版本。
- [Actions](https://reactrouter.com/8.3.0/start/data/actions) - action 定义、调用入口与自动 revalidation。
- [Route Object](https://reactrouter.com/8.3.0/start/data/route-object) - route action 与默认 shouldRevalidate 边界。
- [Data Function Types](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L269-L347) - ActionFunctionArgs 五项字段。
- [Submission Request Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L6944-L6982) - method、body 编码、Request 与 signal 构造。
- [Mutation Navigation Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L1993-L2235) - mutation 分支与目标 action 执行。
- [Navigation States](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L654-L695) - idle、submitting、loading 联合与 submission 字段。
- [Submission Test](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/router/submission-test.ts#L925-L964) - POST、默认编码、FormData 与 action args 断言。
- [Navigation Test](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/router/navigation-test.ts#L1185-L1231) - mutation 的 submitting、loading、idle 状态序列。
- [MDN Request.formData](https://developer.mozilla.org/en-US/docs/Web/API/Request/formData) - 原生 Request body 解析。
- [MDN Request.bodyUsed](https://developer.mozilla.org/en-US/docs/Web/API/Request/bodyUsed) - body 一次性消费状态。
- [MDN FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) - 字段集合、get 与 getAll 行为。
