---
id: react.data.learn.advanced.react-router-query-integration
type: lesson
title: React Router 数据集成
summary: 在 React Router Loader 里 await queryClient.query，用同一份 queryOptions 让详情页直接读缓存。
domain: frontend
technology: react
module: data
stage: advanced
level: advanced
estimatedMinutes: 45
prerequisites:
  - react.data.learn.advanced.query-prefetching
  - react.data.learn.intermediate.query-options-reuse
  - react.data.learn.basics.query-cache-and-sharing
related:
  - react.data.learn.basics.article-list-and-detail
  - react.data.learn.basics.query-client-and-provider
  - react.data.learn.basics.first-use-query
tags:
  - TanStack Query
  - React Router
  - queryClient.query
  - queryOptions
  - staleTime
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-11
objectives:
  - 能说明路由集成是在进入页面前，由 Loader 把关键查询写入同一条缓存。
  - 能抽出一份 queryOptions，同时交给 Loader 的 query 和页面里的 useQuery。
  - 能在 Loader 里 await queryClient.query，并用 staleTime static 避免已有缓存时再挡住导航。
  - 能说明关键数据不要用 catch 吞掉错误，失败应交给路由错误处理。
  - 能说明页面组件读的是 Query 缓存，不是把 loader 返回值当成第二份数据源。
recap:
  - 路由集成把关键查询放到 Loader 里，渲染前写入缓存。
  - Loader 和页面共用同一份 queryOptions，不要各写一套 queryKey。
  - 关键数据要 await query，已经有缓存时用 staleTime static 不再挡住导航。
  - 关键数据出错时不要吞掉，交给路由错误处理。
  - 本课不把 SSR、TanStack Router 或 Suspense 查询写成主线。
sources:
  - title: Prefetching & Router Integration
    url: https://tanstack.com/query/latest/docs/framework/react/guides/prefetching
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 在路由层集成预取，可以在进入页面前声明该页需要的数据。
      - 关键数据应 await query，让路由在数据就绪后再渲染。
      - 已经有数据时传入 staleTime static，不再为多一次预取挡住导航。
      - 关键数据不要用 catch 吞掉错误，失败应交给路由错误处理。
      - 其他路由器也可以集成，官方另有 React Router 示例。
  - title: QueryClient
    url: https://tanstack.com/query/latest/docs/framework/react/reference/classes/QueryClient
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - query 在缓存已有且未过期时直接返回，否则再请求。
      - staleTime 传入 static 对应已废弃的 ensureQueryData。
      - ensureQueryData 已标记废弃，应改用 query 并传入 staleTime static。
  - title: QueryClient source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/queryClient.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - query 用 isStaleByTime 决定要不要 fetch。
      - ensureQueryData 的废弃说明指向 query 加 staleTime static。
  - title: Query isStaleByTime source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/query.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 没有 data 时始终视为过期。
      - staleTime 为 static 时，只要已有 data 就不会视为过期。
---

# React Router 数据集成

## 一、学习目标

- 说明路由集成是在进入页面前，由 Loader 把关键查询写入同一条缓存。
- 抽出一份 `queryOptions`，同时交给 Loader 的 `query` 和页面里的 `useQuery`。
- 在 Loader 里 `await queryClient.query`，并用 `staleTime: 'static'` 避免已有缓存时再挡住导航。
- 说明关键数据不要用 `catch` 吞掉错误，失败应交给路由错误处理。
- 说明页面组件读的是 Query 缓存，不是把 loader 返回值当成第二份数据源。

## 二、为什么要把查询放到路由 Loader

事件里的预取不挡住页面，失败也可以先吞掉，之后的 `useQuery` 再处理。

进入详情路由时情况不同。详情是这个页面的关键数据：路由已经匹配，画面却还没有林晓的现有任务。如果等组件挂上再发请求，导航已经结束，用户会先看到等待。

把同一份查询放到 React Router 的 Loader 里，导航会等到 `query` 完成再渲染详情。列表仍只订阅 `['tasks']`。详情的 `queryFn` 只在进入 `/tasks/t-1` 时运行。本课不把服务端渲染、TanStack Router 或 Suspense 查询写成主线。

## 三、核心概念

### 1. Loader 写入的是 Query 缓存

```tsx
const taskDetailOptions = queryOptions({
  queryKey: ['tasks', 'detail', 't-1'],
  queryFn: () => loadTaskDetail('t-1'),
  staleTime: Infinity,
  retry: false,
})

async function taskDetailLoader() {
  await queryClient.query({
    ...taskDetailOptions,
    staleTime: 'static',
  })
  return null
}
```

Loader 的职责是在渲染前把结果放进 `QueryCache`。详情页接着写 `useQuery(taskDetailOptions)`，读的是同一条 `queryKey`。不要把 loader 的返回值再抄一份到组件里当数据源。

### 2. 关键数据要 await，不要吞掉错误

事件预取可以 `void queryClient.query(...).catch(noop)`。路由里的关键详情不行。官方要求对页面离不开的数据使用 `await`，出错时让路由错误处理接手，而不是先渲染一个没有数据的详情页。

### 3. staleTime static 只约束这次 Loader 拉取

`query` 用这次传入的 `staleTime` 判断要不要打网络。没有 data 时始终会请求。已经有 data 且 `staleTime` 为 `'static'` 时，视为不过期，Loader 立刻返回，不再挡住导航。

`'static'` 不会改页面里 `useQuery` 的新鲜度。观察者仍要自己写 `staleTime`。本课把观察者设成 `Infinity`，用来看清「Loader 写过一次后，再打开详情不会加请求」。

## 四、用法与示例

### 1. 共用 queryOptions，再在 Loader 里覆盖 staleTime

```tsx
import { queryOptions, useQuery } from '@tanstack/react-query'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'

type TaskItem = {
  id: string
  title: string
  owner: string
}

/** 读取任务详情，非 2xx 时抛出带状态码的 Error。 */
async function loadTaskDetail(taskId: string): Promise<TaskItem> {
  const response = await fetch(`/api/tasks/${taskId}`)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

const taskDetailOptions = queryOptions({
  queryKey: ['tasks', 'detail', 't-1'],
  queryFn: () => loadTaskDetail('t-1'),
  staleTime: Infinity,
  retry: false,
})

/** 进入详情前写入缓存；已有数据时不再挡住导航。 */
async function taskDetailLoader() {
  await queryClient.query({
    ...taskDetailOptions,
    staleTime: 'static',
  })
  return null
}

function TaskDetailPage() {
  const detailQuery = useQuery(taskDetailOptions)
  if (!detailQuery.isSuccess) {
    return <p>正在读取详情。</p>
  }
  return (
    <p>
      {detailQuery.data.title} / {detailQuery.data.owner}
    </p>
  )
}
```

列表路由 `/` 不运行详情的 `queryFn`。第一次打开 `/tasks/t-1` 时，Loader 会请求一次。返回列表后再打开，缓存还在，Loader 不再挡住，请求次数也不增加。

### 2. 非关键数据仍可在 Loader 里丢掉 Promise

评论、侧栏这类不是页面成立条件的数据，可以继续 `void queryClient.query(options).catch(noop)`。本课 Demo 只演示关键详情，不把这类次要预取写成第二条主线。

## 五、用法示例：对照 Loader 写入后再打开详情

下面的 Demo 用嵌套内存路由模拟列表和详情。首页只显示林晓的现有任务，详情缓存为否。点「打开详情」后，Loader 先 `await query`，请求次数加一，再显示现有任务 / 林晓。返回列表后缓存仍在；再打开详情时请求次数不再增加。离开页面会释放这次内存路由和 `QueryClient`。

:::demo{id="react.data.learn.advanced.react-router-query-integration.react-router-query-integration-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：继续调用已经废弃的 ensureQueryData

**触发条件：** Loader 写成 `await queryClient.ensureQueryData(taskDetailOptions)`。

**原因：** 当前稳定版把 `ensureQueryData` 标成废弃，替代写法是 `query` 并传入 `staleTime: 'static'`。

**后果：** 行为还能跑，但会踩废弃 API，下个大版本会被删掉。

**错误示例：**

```tsx
await queryClient.ensureQueryData(taskDetailOptions)
```

**正确写法：**

```tsx
await queryClient.query({
  ...taskDetailOptions,
  staleTime: 'static',
})
```

**验证方式：** 第一次打开详情后面会显示现有任务 / 林晓；再打开时请求次数不增加。

### 错误：关键详情用 catch 吞掉错误

**触发条件：** Loader 写成 `void queryClient.query(taskDetailOptions).catch(noop)`，详情接口失败。

**原因：** 非关键预取才吞错误。详情是这个路由的成立条件，失败必须让路由知道。

**后果：** 详情页照样渲染，画面没有数据，真正的失败被丢掉。

**错误示例：**

```tsx
void queryClient.query(taskDetailOptions).catch(noop)
```

**正确写法：**

```tsx
await queryClient.query({
  ...taskDetailOptions,
  staleTime: 'static',
})
```

**验证方式：** 详情请求失败时，路由停在错误处理，不会先画出空详情。

### 错误：Loader 和页面各写一套 queryKey

**触发条件：** Loader 用 `['tasks', 'detail', 't-1']`，页面再用手写的另一组数组或另一份 `queryFn`。

**原因：** 缓存身份对不上时，页面会当成另一条查询，Loader 写入的结果读不到。

**后果：** 导航已经等过一次网络，组件挂上后又打第二次，Loader 像没生效。

**错误示例：**

```tsx
await queryClient.query({
  queryKey: ['task-detail', 't-1'],
  queryFn: () => loadTaskDetail('t-1'),
})

useQuery({
  queryKey: ['tasks', 'detail', 't-1'],
  queryFn: () => loadTaskDetail('t-1'),
})
```

**正确写法：**

```tsx
await queryClient.query({
  ...taskDetailOptions,
  staleTime: 'static',
})

useQuery(taskDetailOptions)
```

**验证方式：** 打开详情后请求次数只加一，详情等待中为否。

### 错误：已经有缓存时仍用默认 staleTime 挡住导航

**触发条件：** Loader 写 `await queryClient.query(taskDetailOptions)`，不覆盖 `staleTime`。

**原因：** 这次拉取用的是调用处传入的 `staleTime`。默认把已有数据当成过期，会再请求并挡住路由。

**后果：** 第二次打开详情又等一轮网络，缓存没有起到导航加速的作用。

**错误示例：**

```tsx
await queryClient.query(taskDetailOptions)
```

**正确写法：**

```tsx
await queryClient.query({
  ...taskDetailOptions,
  staleTime: 'static',
})
```

**验证方式：** 返回列表后再打开详情，导航等待中很快变为否，请求次数保持不变。

### 错误：只用 useLoaderData 保存详情，不写入 Query 缓存

**触发条件：** Loader `return await loadTaskDetail('t-1')`，页面只读 `useLoaderData`。

**原因：** 那是路由自己的一次返回值，不是 `['tasks', 'detail', 't-1']` 这条缓存。列表页、失效和后续观察者都看不到。

**后果：** 返回列表后再打开详情会重新请求；Query 的跨页面缓存没有接上。

**错误示例：**

```tsx
async function taskDetailLoader() {
  return loadTaskDetail('t-1')
}

function TaskDetailPage() {
  const task = useLoaderData()
  return (
    <p>
      {task.title} / {task.owner}
    </p>
  )
}
```

**正确写法：**

```tsx
async function taskDetailLoader() {
  await queryClient.query({
    ...taskDetailOptions,
    staleTime: 'static',
  })
  return null
}

function TaskDetailPage() {
  const detailQuery = useQuery(taskDetailOptions)
  if (!detailQuery.isSuccess) {
    return <p>正在读取详情。</p>
  }
  return (
    <p>
      {detailQuery.data.title} / {detailQuery.data.owner}
    </p>
  )
}
```

**验证方式：** 返回列表后详情已缓存仍为是，再打开详情时请求次数不增加。
:::

## 七、源码推导与适用场景

1. **官方事实：** 路由集成可在 Loader 里 `await query`。关键数据不要吞掉错误。已经有缓存时传入 `staleTime: 'static'`，`isStaleByTime` 见到 `'static'` 且已有 data 就不会再 fetch。`ensureQueryData` 在当前源码里已标记废弃。
2. **课程推导：** 详情路由用 React Router Loader 写入 `['tasks', 'detail', 't-1']`。第一次打开会加一次请求；返回后再打开直接读缓存。
3. **适用边界：** 本课不把服务端渲染、TanStack Router、请求瀑布拆分或 Suspense 查询写成主线。

## 八、练习

:::exercise
### 练习目标

**要求：** 抽出 `taskDetailOptions`，`queryKey` 为 `['tasks', 'detail', 't-1']`。Loader 里 `await queryClient.query({ ...taskDetailOptions, staleTime: 'static' })`，不要 `catch`。详情页用 `useQuery(taskDetailOptions)` 读取同一条缓存。`queryFn` 调 `fetch`，非 2xx 时抛出带状态码的 `Error`。观察者 `staleTime` 为 `Infinity`，`retry` 为 `false`。

**验收：** 列表先显示林晓的现有任务，详情已缓存为否。打开详情后面会显示现有任务 / 林晓，请求次数加一。返回列表后缓存仍在；再打开详情时请求次数不增加。

**参考答案：**

```tsx
import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery,
} from '@tanstack/react-query'
import { useState, type ReactElement } from 'react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'

type TaskItem = {
  id: string
  title: string
  owner: string
}

/** 读取任务详情。 */
async function loadTaskDetail(taskId: string): Promise<TaskItem> {
  const response = await fetch(`/api/tasks/${taskId}`)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

const taskDetailOptions = queryOptions({
  queryKey: ['tasks', 'detail', 't-1'],
  queryFn: () => loadTaskDetail('t-1'),
  staleTime: Infinity,
  retry: false,
})

/** 观察 Loader 已经写入的详情。 */
function TaskDetailPage(): ReactElement {
  const detailQuery = useQuery(taskDetailOptions)
  if (!detailQuery.isSuccess) {
    return <p>正在读取详情。</p>
  }
  return (
    <p>
      {detailQuery.data.title} / {detailQuery.data.owner}
    </p>
  )
}

/** 提供稳定客户端，并在详情 Loader 写入缓存。 */
export function App(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  /** 进入详情前写入缓存。 */
  async function taskDetailLoader() {
    await queryClient.query({
      ...taskDetailOptions,
      staleTime: 'static',
    })
    return null
  }

  const router = createMemoryRouter([
    { path: '/', Component: () => <p>列表</p> },
    {
      path: '/tasks/t-1',
      loader: taskDetailLoader,
      Component: TaskDetailPage,
    },
  ])

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- 路由集成在 Loader 里把关键查询写入同一条缓存。
- Loader 和页面共用一份 `queryOptions`。
- 关键数据要 `await query`，已有缓存时用 `staleTime: 'static'`。
- 关键数据出错时不要吞掉，交给路由错误处理。
- 本课不展开服务端渲染或 Suspense 查询。

## 十、参考资料

- [Prefetching & Router Integration](https://tanstack.com/query/latest/docs/framework/react/guides/prefetching) - 支持在路由 Loader 里 await query，关键数据使用 staleTime static。
- [QueryClient](https://tanstack.com/query/latest/docs/framework/react/reference/classes/QueryClient) - 支持用 query 拉取并缓存，ensureQueryData 已标记废弃。
- [QueryClient source](https://unpkg.com/@tanstack/query-core@5.102.8/src/queryClient.ts) - 支持 query 按 staleTime 决定是否 fetch。
- [Query isStaleByTime source](https://unpkg.com/@tanstack/query-core@5.102.8/src/query.ts) - 支持 staleTime 为 static 且已有 data 时不再视为过期。
