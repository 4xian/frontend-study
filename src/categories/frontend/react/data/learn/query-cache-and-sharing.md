---
id: react.data.learn.basics.query-cache-and-sharing
type: lesson
title: 查询缓存与数据共享
summary: 理解 QueryClient 如何按 queryKey 保存查询结果，并让多个观察组件共享同一份数据与请求。
domain: frontend
technology: react
module: data
stage: basics
level: beginner
estimatedMinutes: 40
prerequisites:
  - react.data.learn.basics.query-error-handling
related: []
tags:
  - TanStack Query
  - QueryCache
  - queryKey
  - shared-data
  - request-deduplication
appliesTo: TanStack Query 5.102.8、React 19.2.8
verifiedAt: 2026-08-31
objectives:
  - 能说明 QueryClient 是查询缓存的作用域，缓存条目由 queryKey 识别。
  - 能说明多个 useQuery 观察同一个 queryKey 时会读取同一个缓存条目并同步状态。
  - 能通过两个观察组件验证同一个正在执行的查询不会被重复发起。
  - 能区分共享缓存和不同 QueryClient 之间的缓存隔离。
  - 能为查询数据选择唯一且稳定的 queryKey，不把不同数据错误地放进同一缓存条目。
recap:
  - 查询数据存放在 QueryClient 管理的 QueryCache 中，QueryClient 决定缓存共享的范围。
  - queryKey 是查询缓存身份；相同 QueryClient 中相同 key 的观察者读取并接收同一份结果。
  - 同一个 key 的并发观察会共享正在执行的请求，成功后缓存更新会通知所有观察者。
  - 不同 QueryClient 即使使用相同 queryKey，也不会共享缓存数据。
  - 缓存共享不等于数据永久保存；新鲜度、垃圾回收、失效和持久化属于其他课程主题。
sources:
  - title: Caching Examples
    url: https://tanstack.com/query/latest/docs/framework/react/guides/caching
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - useQuery 使用 queryKey 对缓存数据进行识别。
      - 第二个相同 queryKey 的查询实例可以立即得到缓存数据，并与已有实例同步状态。
      - 相同 queryKey 的查询实例在请求完成后都会收到缓存中的新数据。
  - title: Query Keys
    url: https://tanstack.com/query/latest/docs/framework/react/guides/query-keys
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - queryKey 顶层必须是数组，并且应唯一描述查询数据。
      - queryKey 会被稳定哈希，变量应包含在 key 中以区分独立数据。
  - title: QueryClientProvider
    url: https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - QueryClientProvider 将 QueryClient 提供给组件树中的查询。
      - useQuery 可以使用最近 Provider 提供的 QueryClient。
  - title: useQuery Reference
    url: https://tanstack.com/query/latest/docs/framework/react/reference/useQuery
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - queryKey 是必填查询选项，并会被哈希为稳定身份。
      - data 是查询最近一次成功解析的数据，多个观察者可以读取同一查询结果。
  - title: TanStack Query Overview
    url: https://tanstack.com/query/latest/docs/framework/react/overview
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - TanStack Query 将同一数据的多次请求去重为单个请求。
  - title: Query fetch implementation
    url: https://raw.githubusercontent.com/TanStack/query/1566c16de7efeb22739209e07310661d91954a78/packages/query-core/src/query.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 首次并发且尚无缓存数据时，已在获取且存在 retryer 的 Query 会返回当前 promise。

---

# 查询缓存与数据共享

## 一、学习目标

- 说明 `QueryClient` 是查询缓存的作用域，缓存条目由 `queryKey` 识别。
- 说明多个 `useQuery` 观察同一个 `queryKey` 时会读取同一个缓存条目并同步状态。
- 通过两个观察组件验证同一个正在执行的查询不会被重复发起。
- 区分共享缓存和不同 `QueryClient` 之间的缓存隔离。
- 为查询数据选择唯一且稳定的 `queryKey`，不把不同数据错误地放进同一缓存条目。

## 二、为什么需要查询缓存

同一份用户资料可能同时出现在页面标题、侧边栏和内容区。如果每个组件都独立请求，页面会重复消耗网络
和服务端资源，还要分别处理加载、错误和更新。查询缓存把“远程数据”从单个组件提升到一个明确的客户端
作用域，让多个组件可以观察同一份查询结果。

缓存的目标不是让数据永远留在浏览器里，而是让同一个客户端中的查询实例有共同的身份和结果。数据是否新鲜、
何时重新获取以及何时回收，仍然由独立的查询策略决定。

## 三、核心概念

### 1. QueryClient 与 QueryCache

`QueryClient` 是应用与 TanStack Query 交互的客户端入口，它管理一个 `QueryCache`。查询成功后，结果会按
`queryKey` 放入这个缓存；`useQuery` 则是组件对缓存条目的观察。

```tsx
const queryClient = new QueryClient()

/** 在同一个 QueryClient 作用域中渲染用户资料。 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Profile />
    </QueryClientProvider>
  )
}
```

同一个 `QueryClientProvider` 子树中的查询会使用同一个客户端。换成另一个 `QueryClient`，就会进入另一个
缓存作用域，即使两个查询写着相同的 `queryKey` 也不会互相读取数据。

### 2. queryKey 是缓存身份

`queryKey` 顶层必须是数组，并且要唯一描述 `queryFn` 返回的数据。列表和详情是不同的数据，应该使用不同的
key：

```tsx
useQuery({ queryKey: ['tasks'], queryFn: loadTasks })
useQuery({ queryKey: ['task', taskId], queryFn: () => loadTask(taskId) })
```

如果 `queryFn` 依赖会变化的变量，就把变量放进 key。这样不同参数的查询会落入不同的缓存条目，不会把一份
数据误当成另一份数据。

### 3. 多个观察者共享一份查询

两个组件在同一个 `QueryClient` 下使用完全相同的 key 时，它们观察的是同一个缓存条目：

```tsx
const taskQuery = useQuery({
  queryKey: ['tasks'],
  queryFn: loadTasks,
})
```

第二个观察者不会创建第二份同 key 数据。首次查询正在执行时，后加入的观察者可以加入同一个查询；请求成功
后，缓存中的结果会同时交给两个观察者。一个观察者触发重新获取时，其他观察者也会看到执行状态和新结果。

这里的“共享”有明确边界：共享发生在同一个 `QueryClient` 内，并且要求 key 表示同一份数据。不同客户端或
不同 key 都不会因为组件恰好显示相同内容而自动共享。

## 四、用法与示例

### 1. 让组件只声明数据身份

组件只需要声明自己观察的 key 和查询函数，不需要在组件之间手动传递远程数据：

```tsx
/** 读取并显示任务列表。 */
function TaskList() {
  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: loadTasks,
  })

  if (tasksQuery.isPending) {
    return <p>加载中</p>
  }

  if (tasksQuery.isError) {
    return <p role="alert">{tasksQuery.error.message}</p>
  }

  return <ul>{tasksQuery.data.map((task) => <li key={task.id}>{task.title}</li>)}</ul>
}
```

另一个组件可以声明同一个 key，而不接收 `TaskList` 的 props：

```tsx
/** 读取同一个查询并显示任务统计。 */
function TaskSummary() {
  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: loadTasks,
  })

  if (!tasksQuery.isSuccess) {
    return null
  }

  return <p>共有 {tasksQuery.data.length} 项任务</p>
}
```

它们共享的是 QueryClient 中的查询结果，不是把一个组件的 React State 复制给另一个组件。

### 2. 观察请求去重与缓存更新

为了观察共享行为，可以在查询函数中记录调用次数。两个观察者同时使用同一个 key 时，调用次数应反映同一
次查询执行，而不是每个组件各执行一次：

```tsx
const tasksQueryKey = ['tasks'] as const

/** 观察共享任务查询，并记录查询函数的执行次数。 */
function SharedTasks() {
  const tasksQuery = useQuery({
    queryKey: tasksQueryKey,
    queryFn: async () => {
      requestCount += 1
      return loadTasks()
    },
  })

  // 页面其他组件可以用同一个 tasksQueryKey 观察同一份结果。
  return tasksQuery.isSuccess ? <TaskList tasks={tasksQuery.data} /> : null
}
```

Demo 中的“重新获取共享数据”只从一个观察者触发；另一个观察者仍会收到相同的 fetching 状态和更新后的
缓存数据。这能把共享关系与手动 props 传递区分开来。

### 3. 用不同客户端隔离缓存

`QueryClientProvider` 的 `client` 属性决定子树使用哪个缓存作用域：

```tsx
const mainClient = new QueryClient()
const previewClient = new QueryClient()

/** 用两个 Provider 展示彼此隔离的查询缓存。 */
function App() {
  return (
    <QueryClientProvider client={mainClient}>
      <MainWorkspace />
      <QueryClientProvider client={previewClient}>
        <Preview />
      </QueryClientProvider>
    </QueryClientProvider>
  )
}
```

即便 `MainWorkspace` 和 `Preview` 使用相同的 `queryKey`，它们也分别从自己的客户端读取。嵌套 Provider 会
改变后代查询看到的客户端，因此客户端的创建位置和作用域需要有清晰约定。

## 五、用法示例：观察缓存共享

下面的 Demo 使用两个 `useQuery` 观察组件和同一个 `QueryClient`。点击首次读取时只发起一个本地延迟查询，
两个观察组件会一起得到相同的数据；隐藏后重新显示第二个观察组件，它仍然可以读取缓存中的结果。点击重新
获取时只从第一个观察组件发起请求，两个观察组件会同时看到新的缓存版本。

:::demo{id="react.data.learn.basics.query-cache-and-sharing.query-cache-sharing-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：每个组件都用独立的 QueryClient

**触发条件：** 在多个组件或每次渲染中分别创建 `new QueryClient()`。

**原因：** 每个客户端都有自己的 QueryCache，组件看不到其他客户端的缓存。

**后果：** 相同 `queryKey` 也会重复请求，页面无法共享查询状态。

**错误示例：**

```tsx
/** 错误示例：在组件渲染期间反复创建 QueryClient。 */
function TaskPanel() {
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <TaskList />
    </QueryClientProvider>
  )
}
```

**正确写法：**

```tsx
const queryClient = new QueryClient()

/** 在稳定的 QueryClient 作用域中共享任务查询。 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TaskList />
      <TaskSummary />
    </QueryClientProvider>
  )
}
```

**验证方式：** 让两个观察组件使用相同 key，确认它们收到同一份数据且查询调用只发生一次。

### 错误：用不同 queryKey 期待自动共享

**触发条件：** 一个组件使用 `['tasks']`，另一个组件使用 `['task-list']`，但认为它们会共享结果。

**原因：** key 是缓存身份，不是组件名称的注释。

**后果：** 查询会进入不同缓存条目，状态和数据不会同步。

**错误示例：**

```tsx
useQuery({ queryKey: ['tasks'], queryFn: loadTasks })
useQuery({ queryKey: ['task-list'], queryFn: loadTasks })
```

**正确写法：**

```tsx
const tasksQueryKey = ['tasks'] as const

useQuery({ queryKey: tasksQueryKey, queryFn: loadTasks })
useQuery({ queryKey: tasksQueryKey, queryFn: loadTasks })
```

**验证方式：** 记录两个 key 的缓存结果，确认不同 key 不会因为查询函数相同而互相更新。

### 错误：把不同数据放入同一个 queryKey

**触发条件：** 详情查询没有把 `taskId` 放进 key，所有详情都使用 `['task']`。

**原因：** key 没有完整描述 `queryFn` 实际读取的数据。

**后果：** 不同任务可能覆盖同一缓存条目，组件显示与参数不匹配的结果。

**错误示例：**

```tsx
/** 错误示例：缺少 taskId 的 key 无法区分任务详情。 */
function TaskDetail({ taskId }: { taskId: string }) {
  return useQuery({
    queryKey: ['task'],
    queryFn: () => loadTask(taskId),
  })
}
```

**正确写法：**

```tsx
/** 用包含 taskId 的 key 读取指定任务详情。 */
function TaskDetail({ taskId }: { taskId: string }) {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: () => loadTask(taskId),
  })
}
```

**验证方式：** 使用两个不同 `taskId` 渲染详情，确认它们分别产生独立的缓存身份。

### 错误：把共享缓存当成永久存储

**触发条件：** 认为只要查询成功一次，刷新页面或很久以后都一定能从内存缓存读取。

**原因：** 混淆内存中的 QueryCache 与持久化存储，也忽略缓存生命周期策略。

**后果：** 页面刷新后仍期待旧数据，或者在需要重新获取时错误地跳过加载处理。

**错误示例：**

```tsx
const profile = queryClient.getQueryData(['profile'])
return <ProfileCard profile={profile} />
```

**正确写法：**

```tsx
const profileQuery = useQuery({
  queryKey: ['profile'],
  queryFn: loadProfile,
})

if (profileQuery.isPending) {
  return <p>加载中</p>
}

if (profileQuery.isError) {
  return <p role="alert">{profileQuery.error.message}</p>
}

return <ProfileCard profile={profileQuery.data} />
```

**验证方式：** 在没有缓存数据的全新客户端中挂载组件，确认组件仍然处理 pending 和 error 状态。

### 错误：用 React State 复制远程数据

**触发条件：** 一个查询组件把 `data` 放进 `useState`，其他组件再通过 props 或 Context 读取这份副本。

**原因：** 绕开 QueryClient 的共享缓存，形成第二个远程数据源。

**后果：** 重新获取后的缓存更新不能自动同步到这份副本，组件之间出现过期数据。

**错误示例：**

```tsx
const tasksQuery = useQuery({ queryKey: ['tasks'], queryFn: loadTasks })
const [tasks, setTasks] = useState(tasksQuery.data ?? [])
```

**正确写法：**

```tsx
const tasksQuery = useQuery({ queryKey: ['tasks'], queryFn: loadTasks })

if (!tasksQuery.isSuccess) {
  return null
}

return <TaskList tasks={tasksQuery.data} />
```

**验证方式：** 重新获取同一个 key 后，确认所有观察组件都从查询结果读取最新数据。
:::

## 七、源码推导与适用场景

### 1. 官方事实

Caching Examples 将查询缓存描述为按 `queryKey` 保存结果：首个 `useQuery` 完成后数据写入缓存，第二个相同
key 的实例可以从缓存得到结果，并且请求成功后两个实例都会看到缓存的新数据。Overview 明确把“将同一数据
的多次请求去重为单个请求”列为 TanStack Query 处理的能力。固定在 5.102.8 对应 commit 的 `Query.fetch`
也显示：在本课首次并发观察、尚无缓存数据且已有 `retryer` 的场景中，后续获取会返回当前
`retryer.promise`，而不是启动第二次获取。

Query Keys 指南要求 key 唯一描述查询数据，并说明 key 会被稳定哈希；useQuery Reference 则将 `queryKey`
定义为必填选项，并把最近一次成功解析的数据作为 `data` 返回。源码用于解释本课可观察到的去重结果，不把
`retryer` 或内部取消流程当作应用代码可以依赖的公共 API。

### 2. 课程推导

组件应该共享查询身份，而不是复制远程数据。把 `QueryClientProvider` 放在需要共享数据的共同祖先上，再让
各组件声明相同的 key，可以让缓存成为这一份远程事实的唯一客户端副本。这样，一个组件触发的重新获取也能
让其他观察者收到相同的状态和结果。

### 3. 适用边界

本课只建立 QueryClient、QueryCache、queryKey 和多个观察者之间的共享关系。数据何时被视为新鲜、何时自动重新
获取、何时回收、如何失效和如何持久化，属于独立策略或后续课程；跨标签页广播和服务端 hydration 也不在本课
实现。缓存仍是客户端内存，不替代服务端数据源或业务持久化系统。

## 八、练习

:::exercise
### 练习目标

**要求：** 编写一个由同一 `QueryClientProvider` 包裹的页面：列表组件和统计组件都使用相同的 `queryKey`
和 `queryFn` 读取任务；记录查询函数调用次数，验证首次挂载时只发起一次请求，并说明如果两个组件改用不同的
`QueryClient` 会发生什么。

**验收：** 两个组件在同一客户端中显示同一份结果；查询函数调用次数为 1；任一观察者重新获取后另一观察者
也能看到更新后的数据；更换 QueryClient 后不得假设缓存仍然共享；queryKey 能唯一描述当前任务数据。

**参考答案：**

```tsx
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'

type Task = {
  id: string
  title: string
}

type TaskSnapshot = {
  version: number
  tasks: Task[]
}

const tasksQueryKey = ['tasks'] as const
let requestCount = 0

/** 读取任务列表并记录查询函数执行次数。 */
async function loadTasks(): Promise<TaskSnapshot> {
  requestCount += 1
  const response = await fetch('/api/tasks')

  if (!response.ok) {
    throw new Error(`任务请求失败：HTTP ${response.status}`)
  }

  return {
    version: requestCount,
    tasks: (await response.json()) as Task[],
  }
}

/** 显示共享查询结果。 */
function TaskList() {
  const tasksQuery = useQuery({ queryKey: tasksQueryKey, queryFn: loadTasks })

  if (tasksQuery.isPending) {
    return <p>加载中</p>
  }

  if (tasksQuery.isError) {
    return <p role="alert">{tasksQuery.error.message}</p>
  }

  return (
    <section>
      <button
        type="button"
        onClick={() => void tasksQuery.refetch()}
        disabled={tasksQuery.isFetching}
      >
        重新获取任务
      </button>
      <p>queryFn 执行次数：{requestCount}</p>
      <ul>{tasksQuery.data.tasks.map((task) => <li key={task.id}>{task.title}</li>)}</ul>
    </section>
  )
}

/** 显示同一个缓存条目的统计信息。 */
function TaskSummary() {
  const tasksQuery = useQuery({ queryKey: tasksQueryKey, queryFn: loadTasks })

  if (!tasksQuery.isSuccess) {
    return null
  }

  return (
    <p>
      缓存版本：{tasksQuery.data.version}，任务数量：{tasksQuery.data.tasks.length}
    </p>
  )
}

const queryClient = new QueryClient()

/** 在同一个 QueryClient 作用域中挂载两个观察组件。 */
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TaskList />
      <TaskSummary />
    </QueryClientProvider>
  )
}

// 初次挂载后应显示执行次数 1 和缓存版本 1；重新获取后两个组件都显示新版本。
// 如果两个组件分别使用不同 QueryClient，它们会各自执行查询，不能再用次数 1 验收共享结果。
```
:::

## 九、本节小结

- `QueryClient` 管理 QueryCache，并决定查询缓存可以被哪些组件共享。
- `queryKey` 是缓存身份，必须唯一描述 `queryFn` 返回的数据。
- 同一个 QueryClient 中相同 key 的多个 `useQuery` 观察同一份结果，并同步执行状态和缓存更新。
- 相同 key 的并发查询可以共享正在执行的请求，避免重复发起同一查询。
- 不同 QueryClient、不同 key 和客户端重建都会形成不同的缓存边界；缓存不等于永久存储。

## 十、参考资料

- [Caching Examples](https://tanstack.com/query/latest/docs/framework/react/guides/caching) - 查询实例如何按 key 读取和更新缓存。
- [Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys) - queryKey 的结构、唯一性和变量依赖。
- [QueryClientProvider](https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider) - QueryClient 的组件作用域。
- [useQuery Reference](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery) - queryKey 和 data 查询结果字段。
- [TanStack Query Overview](https://tanstack.com/query/latest/docs/framework/react/overview) - 同一数据的多次请求去重能力。
- [Query fetch implementation](https://raw.githubusercontent.com/TanStack/query/1566c16de7efeb22739209e07310661d91954a78/packages/query-core/src/query.ts) - 5.102.8 首次并发、尚无缓存数据时复用当前 promise 的固定源码。
