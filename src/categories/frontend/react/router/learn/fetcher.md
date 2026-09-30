---
id: react.router.learn.intermediate.fetcher
type: lesson
title: Fetcher
summary: 使用 useFetcher 在不改变当前页面地址的情况下读取 loader、提交 action 并跟踪局部状态。
domain: frontend
technology: react
module: router
stage: intermediate
level: intermediate
estimatedMinutes: 110
prerequisites:
  - react.router.learn.intermediate.action-results-and-form-validation
related:
  - react.router.learn.intermediate.loader-data-loading
  - react.router.learn.intermediate.navigation-pending-ui
  - react.router.learn.intermediate.action-data-submission
  - react.router.learn.intermediate.form-navigation-form
tags:
  - React Router
  - Data Mode
  - useFetcher
  - fetcher.Form
  - fetcher.load
  - action
  - loader
  - revalidation
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-21
objectives:
  - 能说明 Fetcher 与 navigation 是两条不同的状态通道。
  - 能使用 useFetcher<typeof loader/action>() 获得与目标函数返回值一致的数据类型。
  - 能使用 fetcher.load 调用一个目标 route loader，并观察 loading 与 idle。
  - 能使用 fetcher.Form 在不改变当前 location 的情况下提交 mutation。
  - 能读取 fetcher 的 state、data 与 formData，并区分在途信息和最终结果。
  - 能观察 Fetcher mutation 的 submitting、loading、idle 与页面 loader revalidation。
  - 能区分 fetcher action data 与 route loader data 的职责。
  - 能识别 redirect、共享 key、乐观更新、并发和自定义 revalidation 不属于本课主线。
recap:
  - Fetcher 是不以页面导航为目标的局部数据交互，每个 useFetcher 默认跟踪自己的状态与数据。
  - fetcher.load 调用一个目标 route loader，普通成功流程不会改变当前 location。
  - fetcher.Form 的 mutation 通常经历 submitting、loading、idle，局部状态应从 fetcher.state 读取。
  - action 返回值进入 fetcher.data，成功 mutation 后页面 loader data 会默认重新验证。
  - fetcher.data 可以在下一次 pending 期间保留，因此是否忙碌必须由 state 判断。
sources:
  - title: React Router 8.3.0 Release
    url: https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0
    sourceType: release-note
    appliesTo: React Router 8.3.0
    claims:
      - 8.3.0 是本课核验的稳定发布版本，对应固定官方提交。
  - title: npm react-router Latest Metadata
    url: https://registry.npmjs.org/react-router/latest
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - 2026-08-21 的 latest dist-tag 为 8.3.0。
  - title: React Router useFetcher API
    url: https://reactrouter.com/8.3.0/api/hooks/useFetcher
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - useFetcher 提供不引发导航的数据加载、提交和独立状态管理能力。
      - 返回对象包含 state、data、Form、load、submit、reset 与在途提交元数据。
  - title: React Router Using Fetchers
    url: https://reactrouter.com/8.3.0/how-to/fetchers
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - fetcher.Form 可调用 action 并触发 route data revalidation。
      - useFetcher<typeof loader>() 可以从目标 loader 推导 data 类型。
  - title: React Router Actions
    url: https://reactrouter.com/8.3.0/start/data/actions
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Fetcher 可以在不新增 history entry 的情况下调用 action。
      - action 返回值由 fetcher.data 消费，成功 action 后页面 loader data 会重新验证。
  - title: React Router 8.3.0 Fetcher DOM Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/dom/lib.tsx#L2731-L3001
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - fetcher.Form 与 fetcher.submit 使用 navigate false，并绑定当前 fetcher key。
      - fetcher.load、submit、reset 和默认组件作用域 key 在该实现中连接到 Router。
  - title: React Router 8.3.0 Fetcher State Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L699-L778
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - FetcherStates 定义 idle、loading、submitting 及各阶段的数据和提交元数据。
  - title: React Router 8.3.0 Fetcher Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/router/fetchers-test.ts#L85-L340
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - loader Fetcher 会经历 loading 并保留已有 data。
      - mutation Fetcher 会经历 submitting 与 revalidation loading，最终保留 action data。
  - title: React Router 8.3.0 Fetcher Navigation Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/dom/data-browser-router-test.tsx#L7656-L7736
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 普通 GET 与 POST Fetcher 提交不改变 location key，useNavigation 保持 idle。
---

# Fetcher

## 一、学习目标

- 能说明 Fetcher 与 navigation 为什么是两条不同的状态通道。
- 能使用 `useFetcher<typeof loader/action>()` 推导当前 Fetcher 的结果类型。
- 能用 `fetcher.load` 调用一个目标 route loader，并观察 `loading -> idle`。
- 能用 `<fetcher.Form method="post">` 在不改变当前 location 的情况下调用 action。
- 能读取 `state`、`data` 与 `formData`，区分在途提交内容和最终结果。
- 能观察 mutation 的 `submitting -> loading -> idle`，并确认页面 loader data 自动重新验证。
- 能把 action 返回的局部反馈留在 `fetcher.data`，把页面读取模型留在 loader data。

## 二、为什么需要 Fetcher

并非每次数据交互都意味着用户要前往另一个页面。任务列表里的“标记完成”、弹窗里的保存、搜索框的
推荐结果和行内详情预览，通常都应该留在当前页面：地址不变，页面上下文不丢失，只有发起操作的区域
显示等待状态。

普通导航使用 `Link`、`Form` 或 `navigate` 改变 location，并由 `useNavigation` 暴露全局导航状态。
Fetcher 解决另一类问题：它调用 Data Router 已有的 loader 或 action，但不把普通成功结果提交成一次
页面导航。组件从自己的 Fetcher 读取局部状态和数据。

这两条通道可以同时存在：

```text
页面导航：Link / Form / navigate -> useNavigation -> location 可能改变
局部交互：fetcher.load / fetcher.Form -> fetcher.state -> location 保持不变
```

Fetcher 仍然属于 Router 数据流。它不是绕过 loader/action 的第二套请求系统，也不是通用缓存库。

## 三、Fetcher 的最小模型

### 1. 一个局部数据交互状态机

`useFetcher()` 返回一个对象。可以先把它理解成：

```text
一个 Fetcher = state + data + Form + load + submit + reset + 在途提交信息
```

每个 hook 实例默认获得自己的 key，因此两个组件中的 Fetcher 可以分别等待、分别保存最近一次结果。
在常见界面中，一个连贯的数据交互使用一个 Fetcher，状态归属最清楚。

```tsx
import { useFetcher } from 'react-router'

function TaskPreview() {
  const previewFetcher = useFetcher()

  return <p>{previewFetcher.state}</p>
}
```

`useFetcher` 需要 Data Router 上下文。在本课使用的 Data Mode 中，路由由 `createBrowserRouter` 或
`createMemoryRouter` 创建，再交给 `RouterProvider`。

### 2. 普通成功调用不提交导航

`fetcher.Form` 内部使用非导航提交，`fetcher.submit` 也把请求关联到当前 Fetcher。普通 loader/action
结果会更新 Fetcher 或重新验证页面数据，但不会为当前 location 新增 history entry。

因此提交期间常见的同屏结果是：

```text
fetcher.state: submitting 或 loading
useNavigation().state: idle
location.pathname: 保持原值
```

“不导航”描述普通成功的 load/submit 流程，不是无条件保证。目标 loader/action 如果返回 redirect，
Router 仍会跟随重定向；本课不展开该分支。

### 3. 用目标函数推导 data 类型

把 loader 或 action 的类型传给 `useFetcher`，可以让 `fetcher.data` 与实际返回值保持一致：

```tsx
async function previewLoader() {
  return { title: 'Fetcher 状态观察', owner: '课程组' }
}

function PreviewButton() {
  const previewFetcher = useFetcher<typeof previewLoader>()

  return <p>{previewFetcher.data?.title ?? '尚未读取'}</p>
}
```

这里的泛型参数是 `typeof previewLoader`，不是手写的结果对象类型。Router 会从函数返回值推导序列化后
的 data 形状，函数与组件更不容易漂移。

## 四、读取状态、数据与提交信息

### 1. `state` 是 pending 的判断依据

Fetcher 有三个公共状态：

| 状态 | 含义 | 常见可用信息 |
| --- | --- | --- |
| `idle` | 当前没有在途调用 | 最近一次 `data` 可能仍然存在 |
| `loading` | 正在执行 loader，或 action 完成后正在重新验证 loaders | 已有 `data` 可能继续保留 |
| `submitting` | mutation submission 正在执行 action | `formData` 等提交元数据可用 |

判断按钮是否忙碌时读取当前 Fetcher：

```tsx
const isBusy = fetcher.state !== 'idle'
```

不要用全局 `useNavigation` 替代它，也不要用 `data === undefined` 猜测是否正在加载。

### 2. `data` 保存最近一次结果

`fetcher.load` 成功后，目标 loader 的返回值进入 `fetcher.data`；Fetcher mutation 成功后，action 的
返回值进入同一个字段。第一次调用之前，它可以是 `undefined`。

已有 data 不会因为下一次请求刚开始就自动清空。再次读取时可以保留旧内容，同时根据 `state` 明确显示
“正在更新”；新结果到达后再覆盖旧结果。

```tsx
function Preview() {
  const previewFetcher = useFetcher<typeof previewLoader>()
  const isRefreshing = previewFetcher.state === 'loading'

  return (
    <section aria-busy={isRefreshing}>
      {isRefreshing ? <p>正在更新详情...</p> : null}
      {previewFetcher.data ? <p>{previewFetcher.data.title}</p> : null}
    </section>
  )
}
```

这种保留只表示 Router interaction state 的最近结果，不构成长期缓存、过期时间或跨页面数据层合同。

### 3. `formData` 描述在途提交

mutation 进入 `submitting` 时，`fetcher.formData` 保存本次表单字段。它适合显示“正在保存哪一项”或
核对提交内容：

```tsx
const titleValue = fetcher.formData?.get('title')
const pendingTitle = typeof titleValue === 'string' ? titleValue : null
```

`formData` 是在途信息，`data` 是 loader/action 的结果。两者生命周期和职责不同。本课只用它显示明确的
pending 内容，不从中推导乐观业务状态。

## 五、使用 `fetcher.load` 读取 Loader

### 1. 调用一个目标 route loader

`fetcher.load(href)` 会匹配 `href`，选择一个目标 route，并调用该 route 的 loader。它不是一次完整页面
导航，不会像 navigation 那样加载整条匹配分支的全部 loaders，也不会把 `href` 提交成当前 location。

先为按需数据定义明确 route：

```tsx
import { createBrowserRouter } from 'react-router'

const router = createBrowserRouter([
  {
    path: '/tasks',
    Component: TaskPage,
    loader: tasksLoader,
  },
  {
    path: '/task-preview/:taskId',
    loader: taskPreviewLoader,
  },
])
```

`/task-preview/:taskId` 的职责单一，`fetcher.load('/task-preview/7')` 的目标也容易判断。

### 2. 从事件中发起读取

`load` 是命令式方法，应在用户事件或 effect 等明确时机调用，不能在 render 期间调用：

```tsx
function TaskPreviewButton({ taskId }: { taskId: string }) {
  const previewFetcher = useFetcher<typeof taskPreviewLoader>()

  /** 读取当前任务的预览数据。 */
  function handlePreview() {
    previewFetcher.load(`/task-preview/${taskId}`)
  }

  return (
    <div>
      <button
        type="button"
        onClick={handlePreview}
        disabled={previewFetcher.state === 'loading'}
      >
        查看详情
      </button>
      {previewFetcher.data ? <p>{previewFetcher.data.description}</p> : null}
    </div>
  )
}
```

初次调用的典型状态序列是 `idle -> loading -> idle`。目标 loader 返回值只进入当前 Fetcher；当前
pathname 和 `useNavigation().state` 保持不变。

### 3. GET 提交也是 Loader 路径

`<fetcher.Form method="get">` 或 `fetcher.submit(..., { method: 'get' })` 也会调用 loader。区别在于 Form
负责从原生控件序列化字段，`load` 直接接受已经组成的 `href`。两者都应读取 `fetcher.state/data`，而不是
等待页面导航结果。

## 六、使用 `fetcher.Form` 提交 Mutation

### 1. 保留原生表单语义

有真实表单控件和提交按钮时，优先使用 `fetcher.Form`：

```tsx
function NewTaskForm() {
  const taskFetcher = useFetcher<typeof createTaskAction>()
  const isBusy = taskFetcher.state !== 'idle'

  return (
    <taskFetcher.Form method="post">
      <label htmlFor="task-title">任务标题</label>
      <input id="task-title" name="title" required />
      <button type="submit" disabled={isBusy}>
        {taskFetcher.state === 'submitting'
          ? '提交中'
          : taskFetcher.state === 'loading'
            ? '同步中'
            : '新增任务'}
      </button>
    </taskFetcher.Form>
  )
}
```

`method="post"` 让 Router 调用目标 route action。省略 mutation method 时默认走 GET loader，不会执行
预期 action。

### 2. 观察 `submitting -> loading -> idle`

普通成功 mutation 通常经历：

```text
idle
  -> submitting：表单已序列化，action 正在执行
  -> loading：action data 已到达，页面 loaders 正在重新验证
  -> idle：重新验证结果已经提交到页面
```

延迟 action 或 loader 只便于在 Demo 中看清阶段，不是业务代码必须等待固定时间。真正的判断依据始终是
Router 暴露的状态。

### 3. Action data 与 Loader data 各司其职

action 可以返回局部反馈：

```tsx
async function createTaskAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const title = String(formData.get('title') ?? '').trim()
  const task = await createTask({ title })

  return { ok: true, message: `已创建“${task.title}”` }
}
```

组件从 `taskFetcher.data` 读取成功消息。action 完成后，当前页面 loader data 默认重新验证，任务列表继续
来自 `useLoaderData`：

```tsx
const tasks = useLoaderData<typeof tasksLoader>()
const taskFetcher = useFetcher<typeof createTaskAction>()

return (
  <>
    {taskFetcher.data?.ok ? <p>{taskFetcher.data.message}</p> : null}
    <TaskList tasks={tasks} />
  </>
)
```

不要把 action 返回的一条消息或单条记录当成完整页面读取模型。两条 data 通道同时存在，才能清楚表达
“最近一次提交结果”和“当前页面真实列表”。

### 4. 认识 `submit` 与 `reset`

`fetcher.submit(target, options)` 是命令式提交入口。没有适合渲染的真实 Form，例如超时自动提交或由
其他事件组成 payload 时，才需要它：

```tsx
/** 提交已经组成的任务字段。 */
function handleQuickCreate() {
  taskFetcher.submit(
    { title: '快速任务' },
    { method: 'post', action: '/tasks' },
  )
}
```

`fetcher.reset()` 会把当前 Fetcher 重置为空闲且没有 data 的状态，并中止它正在跟踪的请求。它清理的是
Fetcher 交互状态，不会撤销已经成功写入的业务数据。

## 七、Demo：局部数据工作台

下面的 Demo 使用两个独立 Fetcher：读取 Fetcher 调用推荐 loader，提交 Fetcher 调用任务 action。它们
共享同一页面，但状态和 data 不互相覆盖。

:::demo{id="react.router.learn.intermediate.fetcher.fetcher-demo"}
:::

观察顺序：

1. 初始 pathname 是 `/tasks`，两个 Fetcher 与全局 navigation 都是 `idle`。
2. 读取推荐时，读取 Fetcher 经历 `loading -> idle`；URL 和 navigation 不变，页面 loader 次数不增加。
3. 新增任务时，提交 Fetcher 经历 `submitting -> loading -> idle`；`formData` 在提交阶段暴露标题。
4. action 完成后，成功消息进入提交 Fetcher 的 data，页面 loader 次数增加，任务列表显示重新验证结果。
5. 全程比较两个 Fetcher 的状态，确认一个局部交互不会覆盖另一个 Fetcher 的 data。
6. 点击“重置演示”后，内存任务、调用次数和两个 Fetcher 恢复初始值，页面仍停留在 `/tasks`。

## 八、易错使用提示

:::pitfalls
### 错误：省略 mutation method，却等待 Action 执行

**触发条件：** 使用 `<fetcher.Form>` 或 `fetcher.submit`，但没有指定 `method="post"`。

**原因：** GET submission 调用 loader；POST、PUT、PATCH、DELETE 等 mutation method 才调用 action。

**后果：** 预期 action 不执行，字段会作为搜索参数交给 loader。

**错误示例：**

```tsx
<taskFetcher.Form action="/tasks">
  <input name="title" />
</taskFetcher.Form>
```

**正确写法：**

```tsx
<taskFetcher.Form method="post" action="/tasks">
  <input name="title" />
</taskFetcher.Form>
```

**验证方式：** 检查 Request method，并分别记录 action 与 loader 调用次数。

### 错误：使用全局 Navigation 状态渲染 Fetcher Pending

**触发条件：** 提交 `fetcher.Form` 后只读取 `useNavigation().state`。

**原因：** 普通 Fetcher 使用独立状态通道，并以非导航方式提交。

**后果：** 全局状态一直是 `idle`，局部按钮没有正确反馈。

**错误示例：**

```tsx
const navigation = useNavigation()
const isBusy = navigation.state !== 'idle'
```

**正确写法：**

```tsx
const taskFetcher = useFetcher<typeof action>()
const isBusy = taskFetcher.state !== 'idle'
```

**验证方式：** 同屏显示 `fetcher.state` 和 `navigation.state`；局部提交期间只有前者变化。

### 错误：把“不导航”写成无条件保证

**触发条件：** 断言 Fetcher 永远不会改变 URL，或普通成功后等待它自动进入新页面。

**原因：** 普通 load/submit 使用非导航流程，但 loader/action 返回的 redirect 仍由 Router 处理。

**后果：** 普通成功流程和 redirect 例外都会被理解错误。

**错误示例：**

```tsx
// 错误心智模型：Fetcher 在任何结果下都不会导航。
taskFetcher.load('/tasks/7')
```

**正确写法：**

```tsx
// 普通成功结果更新 Fetcher data；redirect 是由 route 返回值触发的例外。
taskFetcher.load('/tasks/7')
```

**验证方式：** 普通成功路径比较 pathname/location key；redirect 分支单独按路由返回值验证。

### 错误：把 `fetcher.load` 当成完整导航加载

**触发条件：** `href` 匹配多个 routes，并等待整条匹配链的 loaders 全部运行。

**原因：** `fetcher.load` 选择一个目标 route loader，不执行导航的整条 loader 加载流程。

**后果：** 父 route 计数和数据不会按预期变化，页面地址也没有提交成目标 href。

**错误示例：**

```tsx
// 错误预期：root、tasks、task 三个 loaders 都会执行。
previewFetcher.load('/tasks/7')
```

**正确写法：**

```tsx
// 为按需数据建立职责明确的目标 loader。
previewFetcher.load('/task-preview/7')
```

**验证方式：** 给各 route loader 计数，确认只增加目标 loader 调用次数。

### 错误：用 `data === undefined` 判断 Loading

**触发条件：** Fetcher 已成功一次，再发起下一次 load 或 submission。

**原因：** Fetcher 在新的 pending 阶段可以保留旧 data，直到新结果覆盖它。

**后果：** pending 指示不出现，或旧结果被误认为当前请求的新结果。

**错误示例：**

```tsx
const isLoading = previewFetcher.data === undefined
```

**正确写法：**

```tsx
const isLoading = previewFetcher.state === 'loading'
```

**验证方式：** 连续读取两个目标；第二次 `loading` 时检查旧 data 仍存在，状态仍明确显示正在更新。

### 错误：用 Action data 替代页面 Loader data

**触发条件：** mutation 成功后直接把 `fetcher.data` 当成整个页面任务列表。

**原因：** Fetcher data 保存 action 返回结果；重新验证后的页面读取模型属于 route loader data。

**后果：** 提交反馈和读取模型混在一起，后续重新验证无法保持单一数据来源。

**错误示例：**

```tsx
const tasks = taskFetcher.data.tasks
```

**正确写法：**

```tsx
const tasks = useLoaderData<typeof tasksLoader>()
const message = taskFetcher.data?.message
```

**验证方式：** 让 action 只返回消息、loader 返回列表；确认 mutation 后两条数据都正确更新。

### 错误：使用不存在的 `fetcher.optimisticData`

**触发条件：** 从其他数据库或非当前版本文章移植 `optimisticData` 命名。

**原因：** React Router 8.3.0 的 Fetcher 公共类型没有这个字段。

**后果：** TypeScript 报错，代码依赖了不存在的 API。

**错误示例：**

```tsx
const nextStatus = taskFetcher.optimisticData.status
```

**正确写法：**

```tsx
const submittedStatus = taskFetcher.formData?.get('status')
```

**验证方式：** 对照当前版本 `FetcherStates` 与 `FetcherWithComponents` 类型；本课只把 `formData` 作为
在途提交信息，不实现乐观业务更新。
:::

## 九、源码推导与适用场景

### 1. 局部 Pending 不是全局 Navigation 的子状态

**官方事实：** `fetcher.Form` 与 `fetcher.submit` 关联当前 fetcher key，并设置非导航提交；官方 DOM 测试
中普通 GET/POST Fetcher 调用期间 location key 不变，`useNavigation` 保持 `idle`。

**课程推导：** 行内保存、按需详情和推荐读取应从自己的 Fetcher 显示 pending。这样一个局部操作不会
让整页导航条进入忙碌状态。

**边界：** Fetcher mutation 仍会触发页面 loader revalidation，因此“局部状态独立”不等于“页面数据
完全没有共享影响”。

### 2. 一个 Fetcher 适合一个连贯交互

**官方事实：** 一个 Fetcher 只有一组 `state` 和 `data`；新结果会进入这组状态。每个未指定 key 的
`useFetcher` 实例默认获得独立标识。

**课程推导：** 详情读取和任务提交使用两个 Fetcher，可以让两种 data 类型、按钮 pending 与反馈区域
保持清晰。

**边界：** 这是一条状态所有权建议，不是 API 禁止。共享 key、跨组件观察与多个在途请求需要单独设计，
不在本课展开。

### 3. Fetcher 不是独立缓存层

**官方事实：** Fetcher data 属于 Router 的交互状态，会受新调用、`reset()` 和实例生命周期影响，并与
route loader revalidation 协作。

**课程推导：** 使用 Fetcher 管理 route 数据交互和短期结果，不给它附加 cache key、失效时间或长期
服务端缓存承诺。

**边界：** 本课不比较其他数据请求库，也不讨论由谁长期拥有服务端缓存。

### 4. 适用与不适用场景

适合 Fetcher 的场景：

- 当前页面中的行内 mutation，成功后希望页面 loader data 自动同步。
- 悬浮详情、推荐结果、组合框候选项等按需 loader 数据。
- 弹窗或侧栏中的提交，普通成功后需要保留当前页面上下文。
- 多个区域需要分别展示自己的 pending 与结果。

需要先重新判断需求的场景：

- 提交成功后 URL、history 和页面语义本来就应该改变。
- 需要设计共享 Fetcher key、跨组件状态所有权或全局并发反馈。
- 需要乐观写入、回滚、竞态处理或自定义 revalidation 策略。
- 需要用 route error boundary 或 redirect 表达控制流。

## 十、练习

:::exercise
### 练习目标

**要求：** 在一个 Data Router 任务页面中实现两个独立 Fetcher。定义 `/tasks` loader/action，让 POST
action 新增一条内存任务并返回成功消息；定义 `/task-preview/:taskId` loader，返回一条任务预览。使用
`useFetcher<typeof action>()` 和 `fetcher.Form` 提交任务，使用另一个
`useFetcher<typeof loader>()` 和 `fetcher.load` 读取预览。同屏显示两个 `fetcher.state`、全局
`navigation.state`、pathname、action data 和 loader data，并记录两条状态序列。

**验收：** 普通成功交互不改变 pathname，全局 navigation 保持 `idle`；读取经历
`loading -> idle`，mutation 经历 `submitting -> loading -> idle`；mutation 后页面 loader data 增加任务，
action 消息仍保留在提交 Fetcher 的 data 中。
:::

## 十一、本节小结

- Fetcher 调用 Data Router 的 loader/action，但普通成功交互不提交页面导航。
- 每个 `useFetcher()` 默认拥有独立 `state` 与 `data`，局部 pending 应从当前 Fetcher 读取。
- `fetcher.load` 调用一个目标 route loader，典型状态是 `loading -> idle`。
- `fetcher.Form method="post"` 调用 action，普通成功 mutation 经历 `submitting -> loading -> idle`。
- action 结果属于 `fetcher.data`，页面读取模型属于重新验证后的 loader data。
- `formData` 描述在途提交；已有 data 可跨 pending 保留，因此不能用 data 是否为空判断忙碌。
- redirect、共享 key、乐观更新、并发竞态和自定义 revalidation 需要单独设计，不能由本课结论直接外推。

## 十二、参考资料

- [React Router 8.3.0 Release](https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0) - 本课稳定版本与固定源码起点。
- [npm react-router Latest Metadata](https://registry.npmjs.org/react-router/latest) - `latest` 稳定标签核验。
- [useFetcher API](https://reactrouter.com/8.3.0/api/hooks/useFetcher) - Fetcher 字段、方法、状态和默认作用域。
- [Using Fetchers](https://reactrouter.com/8.3.0/how-to/fetchers) - loader/action 调用、局部状态、类型推导与 revalidation。
- [Actions](https://reactrouter.com/8.3.0/start/data/actions) - 非导航 action 调用与 action data。
- [Fetcher DOM Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/dom/lib.tsx#L2731-L3001) - `Form/load/submit/reset` 与非导航连接方式。
- [Fetcher State Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L699-L778) - `idle/loading/submitting` 的数据和提交元数据。
- [Fetcher State Tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/router/fetchers-test.ts#L85-L340) - loader、mutation、data 保留与重新验证状态序列。
- [Fetcher Navigation Tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/dom/data-browser-router-test.tsx#L7656-L7736) - Fetcher 提交期间 location 与全局 navigation 的可观察行为。
