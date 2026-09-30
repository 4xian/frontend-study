---
id: react.router.learn.advanced.route-state-ownership
type: lesson
title: 路由状态所有权
summary: 为 URL、路由数据、请求生命周期和局部 UI 选择唯一且可解释的状态所有者。
domain: frontend
technology: react
module: router
stage: advanced
level: advanced
estimatedMinutes: 110
prerequisites:
  - react.router.learn.basics.query-params-and-url-state
  - react.router.learn.intermediate.loader-data-loading
  - react.router.learn.intermediate.navigation-pending-ui
  - react.router.learn.intermediate.fetcher
  - react.router.learn.advanced.race-conditions
related:
  - react.router.learn.intermediate.form-fetcher-choice
  - react.router.learn.intermediate.revalidation
  - react.router.learn.advanced.optimistic-ui
tags:
  - React Router
  - Data Mode
  - State Ownership
  - URL State
  - Loader Data
  - Fetcher
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-26
objectives:
  - 能按刷新、分享、前进后退的需求判断状态是否应进入 URL。
  - 能区分 loader data、action data、navigation state 与 Fetcher state 的所属请求范围。
  - 能让已确认的服务端事实直接从 loader data 渲染，而不复制进 React state。
  - 能为抽屉开关、临时选中等纯界面状态选择局部 React state。
  - 能识别两个状态来源争夺同一业务事实时产生的同步问题。
recap:
  - 可分享、可刷新、应进入浏览器历史的筛选条件由 URL 保存。
  - 当前路由已确认的服务端数据由 loader data 保存，不能再维护第二份本地副本。
  - 页面导航状态由 useNavigation 提供，局部非导航请求由各自 Fetcher 提供。
  - 不需要跨刷新或跨地址表达的纯 UI 控件状态，适合放在组件的 React state。
sources:
  - title: React Router 8.3.0 Release
    url: https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0
    sourceType: release-note
    appliesTo: React Router 8.3.0
    claims:
      - 本课核验的稳定版本为 React Router 8.3.0，并对应固定官方发布版本。
  - title: npm react-router Latest Metadata
    url: https://registry.npmjs.org/react-router/latest
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - npm latest 在核验时返回 8.3.0。
  - title: React Router 8.3.0 State Management
    url: https://raw.githubusercontent.com/remix-run/react-router/react-router@8.3.0/docs/explanation/state-management.md
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - 与网络相关的 loader、action、导航和 Fetcher 状态优先由 Router 的数据与状态 API 管理。
      - URL search params、cookie、server session 和服务端缓存可以承载不同生命周期的状态。
      - 组件级临时 UI 状态可以使用 React state，但它不会跨刷新或组件卸载保存。
  - title: React Router 8.3.0 useSearchParams
    url: https://raw.githubusercontent.com/remix-run/react-router/react-router@8.3.0/docs/api/hooks/useSearchParams.md
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - useSearchParams 返回当前 URLSearchParams 与更新函数，更新会触发导航。
      - searchParams 是稳定但可变的引用，直接修改而不调用更新函数不会使 URL 与界面同步。
  - title: React Router 8.3.0 Data State Hooks
    url: https://raw.githubusercontent.com/remix-run/react-router/react-router@8.3.0/docs/api/hooks/useLoaderData.md
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - useLoaderData 返回最近路由 loader 或 clientLoader 的数据。
  - title: React Router 8.3.0 Navigation and Fetcher Hooks
    url: https://raw.githubusercontent.com/remix-run/react-router/react-router@8.3.0/docs/api/hooks/useNavigation.md
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - useNavigation 返回当前导航对象，可用于页面级 pending UI。
      - useFetcher 为不触发导航的局部数据交互维护独立的 state 与 data。
  - title: React Router 8.3.0 Router State Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - RouterState 分别保存 loaderData、actionData、navigation 和 fetchers，Fetcher 是按 key 维护的独立状态。
---

# 路由状态所有权

## 一、学习目标

- 能先判断一个状态是否需要被刷新、分享或浏览器前进后退恢复，再决定是否写入 URL。
- 能把页面已确认的服务端事实交给 loader data，而不是复制到组件 state。
- 能根据请求范围选择 `useNavigation`、`useActionData` 或 `useFetcher`。
- 能把抽屉开关、悬停、临时输入等纯界面细节限制在局部 React state。
- 能用“一个业务事实只能有一个可写所有者”排查状态不同步。

## 二、为什么需要

一个任务列表通常同时有筛选条件、列表数据、保存中的提示、局部预览和侧栏开关。它们都会改变界面，但
生命周期并不相同。把所有值塞进一个组件的 `useState`，会使刷新后的筛选丢失、返回上一页时状态无法恢复，
也容易让 loader 新数据与旧本地副本互相覆盖。

反过来，把每个短暂视觉细节都写入 URL 或服务端，会增加不必要的导航、持久化和共享语义。状态所有权不是
“哪个 Hook 最方便”的问题，而是先问：谁是这份数据的真相来源，谁负责在它失效时更新它。

Data Router 已经为路由数据和请求生命周期维护状态。课程代码只需要把可观察的业务事实交给正确的所有者，
不要再创建一个需要手动同步的镜像。

## 三、核心概念

### 1. 先按生命周期选择所有者

先根据状态是否应跨刷新、地址和请求存在来分类：

| 状态 | 合适的所有者 | 典型例子 |
| --- | --- | --- |
| 可分享、可刷新、可前进后退 | URL | `?status=open`、分页、排序、当前标签 |
| 当前路由已确认的远程事实 | loader data | 任务列表、详情、权限读取结果 |
| 最近一次导航表单的结果 | action data | 页面表单的行内校验结果 |
| 正在切换页面的临时过程 | navigation | 全页提交中、下一个地址 |
| 不改变地址的局部请求 | Fetcher | 行内保存、预览、搜索建议 |
| 只属于当前组件的交互细节 | React state | 抽屉展开、悬停、未提交的输入焦点 |

这张表不是要求每个页面都使用所有 API。它的作用是排除不匹配的所有者。例如“当前筛选”需要被复制链接和
历史记录恢复，所以优先使用 URL；“抽屉是否临时展开”不需要这些能力，所以局部 state 更直接。

### 2. URL 是可观察的导航状态

`useSearchParams` 读取当前地址并返回更新函数。调用更新函数会发生导航，因此 loader 可以根据同一个 URL
返回对应数据：

```tsx
function TaskFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = searchParams.get('status') ?? 'all'

  function selectStatus(next: string) {
    setSearchParams(next === 'all' ? {} : { status: next })
  }

  return <button onClick={() => selectStatus('open')}>{status}</button>
}
```

不要再维护一份 `const [status, setStatus] = useState(...)` 并同时调用 `setSearchParams`。两个写入点会产生谁先
更新、浏览器返回后谁覆盖谁的问题。URL 是这类状态的唯一真相，组件每次渲染都从它读取。

### 3. Loader data 是当前路由的已确认事实

`useLoaderData` 返回最近匹配路由的 loader 结果。它适合渲染已经由当前路由确认的数据：

```tsx
async function loader({ request }: LoaderFunctionArgs) {
  const status = new URL(request.url).searchParams.get('status') ?? 'all'
  return findTasks({ status })
}

function TaskList() {
  const tasks = useLoaderData<typeof loader>()
  return tasks.map((task) => <TaskRow key={task.id} task={task} />)
}
```

这里不需要 `useEffect(() => setTasks(tasks), [tasks])`。复制会让组件得到一份不会自动跟随 revalidation、导航或
重新进入路由更新的旧快照。需要暂时预测 mutation 时，读取请求中的 `formData`；请求结束后仍回到 loader data。

### 4. 请求状态跟随请求范围

`useNavigation` 描述的是当前页面导航，例如页面正前往哪个地址、导航表单带了什么数据。它适合页面级 pending
提示，不能代替某一行的保存状态。

`useFetcher` 描述一个不改变地址的局部交互。每个 Fetcher 有独立的 `state`、`formData` 和 `data`：

```tsx
function PreviewButton({ taskId }: { taskId: string }) {
  const preview = useFetcher<Preview>()

  function loadPreview() {
    preview.load(`/tasks/preview?taskId=${taskId}`)
  }

  return (
    <button onClick={loadPreview} disabled={preview.state !== 'idle'}>
      {preview.state === 'idle' ? '读取预览' : '读取中'}
    </button>
  )
}
```

这个 Fetcher 的结果只属于预览交互。它不是任务列表的新权威副本；列表仍由页面 loader 返回。若表单会导航，
最近一次 action 的返回值可通过 `useActionData` 读取；如果表单不改变地址，则读取相应 Fetcher 的 `data`。

### 5. 局部 UI state 不必伪装成路由状态

组件内部短暂的开关适合 `useState`：

```tsx
function Inspector() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <section>
      <button onClick={() => setIsOpen((open) => !open)}>切换检查器</button>
      {isOpen ? <aside>只在当前组件存活期间显示</aside> : null}
    </section>
  )
}
```

刷新、离开路由或组件卸载后，这个值会消失，这是它选择局部 state 的结果而不是错误。若用户偏好必须跨刷新
保存，需要根据是否要服务端参与，选择 cookie、session 或其他明确的持久化边界；不要在当前课程中把它误写成
普通路由导航状态。

## 四、用法与示例

### 1. 让 URL 与 loader 使用同一输入

筛选条件只从请求 URL 读取，界面只从 `useSearchParams` 读取。这样刷新和复制地址都会重新得到同一组数据：

```tsx
function readStatus(request: Request): 'all' | 'open' | 'done' {
  const value = new URL(request.url).searchParams.get('status')
  return value === 'open' || value === 'done' ? value : 'all'
}

async function loader({ request }: LoaderFunctionArgs) {
  return findTasks({ status: readStatus(request) })
}
```

不要根据组件 state 调 loader，再把组件 state 改写为 URL。请求 URL 已经是可传输、可恢复的输入合同。

### 2. 从 loader data 派生显示值

当显示值可以从当前 loader data 和 URL 推导时，直接推导：

```tsx
function TaskSummary() {
  const { tasks } = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()
  const status = searchParams.get('status') ?? 'all'
  const title = `${status}：${tasks.length} 项`

  return <h2>{title}</h2>
}
```

派生值不是新的可写事实，因此不需要 `setTitle`。只有用户可以独立编辑、且尚未提交的输入才通常需要局部 state。

### 3. 用正确的 pending 范围表达反馈

页面切换时读取 `navigation.state`，局部读取时读取该 Fetcher 的 `state`：

```tsx
const navigation = useNavigation()
const preview = useFetcher<Preview>()

const pageBusy = navigation.state !== 'idle'
const previewBusy = preview.state !== 'idle'
```

把 `pageBusy` 传给每个局部按钮会让无关操作一起禁用；把 `previewBusy` 当作全页导航提示也会让用户误以为地址已经
切换。状态所有者本身已经编码了作用范围，UI 应保留这个范围。

### 4. 区分“临时编辑”与“已确认数据”

草稿输入可在组件中保存，提交成功后应由 loader 的新快照成为事实：

```tsx
function RenameTask({ task }: { task: { name: string } }) {
  const [draftName, setDraftName] = useState(task.name)
  const fetcher = useFetcher()

  function save() {
    fetcher.submit({ name: draftName }, { method: 'post' })
  }

  return <button onClick={save}>保存</button>
}
```

草稿不是服务端已确认名称，所以可以是局部 state；不要在保存成功后仅靠 `setDraftName` 宣布更新完成。等待 action
和 revalidation 让 loader data 接回已确认事实，并按产品要求处理失败或冲突。

## 五、用法示例或 Demo

:::demo{id="react.router.learn.advanced.route-state-ownership.route-state-ownership-demo"}
点击筛选按钮，观察 `?status=` 与 loader 返回的任务数一起改变；在切换期间，导航卡只显示页面级 pending。点击
“读取局部预览”不会改变地址，只有预览 Fetcher 进入 loading。检查器开关始终是局部 UI state，刷新后不会保存。
:::

Demo 使用内存 Router 模拟路由数据和局部预览，不访问真实服务端。它展示所有者的作用范围，不把本地静态数据
误说成服务端持久化结果。

## 六、易错使用提示

:::pitfalls
### 错误：把 URL 筛选复制进 React state

**触发条件：** 同时维护 `status` state 和 `?status=`，按钮分别修改两者。

**原因：** 浏览器返回、外部链接和路由导航都能改变 URL，却不会自动同步手写的 state。

**后果：** 地址显示“已完成”，页面却仍渲染“进行中”，刷新后状态又发生跳变。

**错误示例：**

```tsx
const [status, setStatus] = useState('all')
setStatus('done')
setSearchParams({ status: 'done' })
```

**正确写法：**

```tsx
const [searchParams, setSearchParams] = useSearchParams()
const status = searchParams.get('status') ?? 'all'
setSearchParams({ status: 'done' })
```

**验证方式：** 切换筛选后刷新页面并使用浏览器后退，确认筛选和 URL 始终一致。

### 错误：把 loader data 再复制成可写列表

**触发条件：** loader 返回 `tasks` 后，通过 Effect 写入 `useState(tasks)`。

**原因：** 本地副本不会天然跟随 revalidation、导航和其他 action 带来的新 loader 快照。

**后果：** 保存完成后，页面可能仍显示旧任务，或局部修改被下一次 loader 覆盖。

**错误示例：**

```tsx
const tasks = useLoaderData<typeof loader>()
const [visibleTasks, setVisibleTasks] = useState(tasks)
```

**正确写法：**

```tsx
const tasks = useLoaderData<typeof loader>()
const visibleTasks = tasks.filter(matchesCurrentFilter)
```

**验证方式：** 触发会重新验证列表的 action，确认界面直接使用 loader 返回的新快照。

### 错误：用页面导航状态禁用局部 Fetcher

**触发条件：** `navigation.state !== 'idle'` 时禁用所有局部预览或保存按钮。

**原因：** navigation 和 Fetcher 是不同请求范围；前者不表示每个局部交互都在等待。

**后果：** 无关的页面切换会阻塞局部操作，或局部请求的忙碌状态没有反馈。

**错误示例：**

```tsx
<button disabled={navigation.state !== 'idle'}>读取预览</button>
```

**正确写法：**

```tsx
<button disabled={preview.state !== 'idle'}>读取预览</button>
```

**验证方式：** 切换筛选和读取预览，确认两处 pending 只在各自区域出现。

### 错误：把 Fetcher data 当成页面新事实

**触发条件：** 局部保存或预览返回后，直接用 `fetcher.data` 替换整页列表。

**原因：** Fetcher data 只描述该 Fetcher 最近一次 loader/action 的结果，不等于当前路由的完整数据快照。

**后果：** 页面可能遗漏其他项目、忽略 revalidation，或让两个 Fetcher 争夺列表显示。

**错误示例：**

```tsx
const tasks = preview.data?.tasks ?? loaderTasks
```

**正确写法：**

```tsx
const tasks = useLoaderData<typeof loader>()
const previewMessage = preview.data?.summary
```

**验证方式：** 连续读取两条预览，确认列表仍来自 loader，只有预览区域更新。

### 错误：直接修改 searchParams 对象

**触发条件：** 对 `searchParams` 调用 `.set()`，却没有调用 `setSearchParams`。

**原因：** 该对象虽然可变，但 URL 不会因此导航或更新。

**后果：** 某次重渲染可能读取到被修改的对象，而地址栏和 loader 仍是旧输入。

**错误示例：**

```tsx
searchParams.set('status', 'done')
```

**正确写法：**

```tsx
setSearchParams((current) => {
  current.set('status', 'done')
  return current
})
```

**验证方式：** 修改筛选后检查地址栏和 loader 结果，确认二者同时变化。
:::

## 七、源码推导与适用场景

1. React Router 8.3.0 的公开 API 分别暴露当前 loader data、最近导航 action data、navigation 和每个 Fetcher
   的独立状态。固定版本 `RouterState` 源码也把 `loaderData`、`actionData`、`navigation` 与 `fetchers` 分开保存。
2. 因此课程推导是：当一个值已经由 Router 的某个状态域维护时，组件应从该域读取并在其生命周期内展示，而不是
   再创建一个可写镜像。这样刷新、重验证和并发请求都有明确的更新责任。
3. URL 适合表达可观察的导航输入，不适合保存密码、过大的临时对象或只影响一个局部动画的细节。跨刷新偏好是否
   使用 cookie、session 或持久化存储，取决于服务器渲染、设备同步和隐私要求，不是 Router 自动决定的。
4. 本课不定义 Redux、Zustand 或 TanStack Query 的缓存策略；当这些工具与 Data Router 一起使用时，必须另行
   明确每份远程数据只有一个缓存和失效所有者。

## 八、练习

:::exercise
### 练习目标

**要求：** 为一个商品列表增加 `?sort=` 和 `?page=`，让 loader 只从请求 URL 读取它们。再为某个商品增加一个
不改变地址的库存预览 Fetcher，以及一个只在当前组件存活的“显示统计”开关。

**验收：** 复制地址到新标签页后，排序和页码能恢复；导航 pending 与库存预览 pending 分别显示；刷新后列表由
loader 重建，统计开关回到初始状态；代码中没有把同一列表同时保存在 loader data 和 `useState`。
:::

## 九、本节小结

- 可分享、可刷新和应被历史记录恢复的状态，优先由 URL 表达。
- 当前路由的已确认远程事实由 loader data 表达，避免维护第二份可写副本。
- 页面导航状态、导航 action 结果和 Fetcher 状态各自有不同的请求范围，不能互相替代。
- 纯局部 UI 细节留在 React state；需要持久化时再明确选择 cookie、session 或其他存储边界。

## 十、参考资料

- [State Management](https://raw.githubusercontent.com/remix-run/react-router/react-router@8.3.0/docs/explanation/state-management.md) - 支持 URL、路由网络状态、局部 UI state 与持久化边界的划分。
- [useSearchParams](https://raw.githubusercontent.com/remix-run/react-router/react-router@8.3.0/docs/api/hooks/useSearchParams.md) - 支持 search params 的读取、更新导航和可变引用边界。
- [useLoaderData](https://raw.githubusercontent.com/remix-run/react-router/react-router@8.3.0/docs/api/hooks/useLoaderData.md) - 支持最近路由 loader 数据的读取规则。
- [useNavigation](https://raw.githubusercontent.com/remix-run/react-router/react-router@8.3.0/docs/api/hooks/useNavigation.md) - 支持页面级导航状态与 pending UI。
- [useFetcher](https://raw.githubusercontent.com/remix-run/react-router/react-router@8.3.0/docs/api/hooks/useFetcher.md) - 支持不触发导航的局部请求状态和结果。
- [React Router Router State Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts) - 支持固定版本中路由状态域彼此分离的源码推导。
