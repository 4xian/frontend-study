---
id: react.data.learn.advanced.ssr-and-hydration
type: lesson
title: SSR 与 Hydration
summary: 服务端用独立 QueryClient 预取后再 dehydrate；客户端经 HydrationBoundary 注水，同一条查询不必再请求。
domain: frontend
technology: react
module: data
stage: advanced
level: advanced
estimatedMinutes: 45
prerequisites:
  - react.data.learn.basics.query-client-and-provider
  - react.data.learn.advanced.query-prefetching
  - react.data.learn.basics.stale-time-and-freshness
related:
  - react.data.learn.intermediate.initial-and-placeholder-data
  - react.data.learn.advanced.offline-query-persistence
  - react.data.learn.advanced.request-waterfalls
tags:
  - TanStack Query
  - SSR
  - HydrationBoundary
  - dehydrate
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-11
objectives:
  - 能说明 SSR 要把查询先预取、再脱水、再在客户端注水，才能避免首屏再请求。
  - 能在独立 QueryClient 上用 query 预取，再用 dehydrate 得到可序列化快照。
  - 能用 HydrationBoundary 把脱水结果注进客户端缓存。
  - 能说明客户端 QueryClient 要在组件内创建，默认 staleTime 不能为 0。
  - 能说明 initialData 不是完整 hydration，也不能覆盖已有缓存。
recap:
  - 服务端预取、dehydrate、客户端 HydrationBoundary 是同一条缓存的交接。
  - 预取阶段、服务端渲染和客户端渲染各有一份 QueryClient，靠脱水快照对齐。
  - 客户端 QueryClient 必须按请求或组件生命周期创建，不能放在模块顶层。
  - staleTime 默认是 0，注水后仍会立刻后台刷新，SSR 通常要设大于 0。
  - 本课不把 Next.js、RSC、流式渲染或 persist 持久化写成主线。
sources:
  - title: Server Rendering & Hydration
    url: https://tanstack.com/query/latest/docs/framework/react/guides/ssr
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 服务端先预取，再把缓存脱水写进标记，客户端再 hydrate，才能避免首屏再请求。
      - 客户端 QueryClient 要在应用内创建，模块顶层实例会在请求之间共享缓存。
      - SSR 通常把默认 staleTime 设成大于 0，避免客户端立刻重新请求。
      - 完整方案是 loader 里 query 预取，返回 dehydrate 的结果，再用 HydrationBoundary 包住树。
      - initialData 可以快速起步，但不能覆盖已有缓存，也没有服务端 dataUpdatedAt。
      - dehydrate 默认只包含成功查询，失败查询会在客户端再试。
  - title: HydrationBoundary
    url: https://tanstack.com/query/latest/docs/framework/react/reference/functions/HydrationBoundary
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - HydrationBoundary 把脱水状态写进当前 QueryClient。
      - 已有查询会按更新时间智能合并。
      - 它只处理 queries，不注水 mutations。
      - 缓存里还没有的查询在 render 阶段注水。
      - 已经存在的查询只在脱水数据更新时，等到 commit 后的 effect 再注水。
  - title: dehydrate
    url: https://tanstack.com/query/latest/docs/framework/react/reference/functions/dehydrate
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - dehydrate 把 QueryClient 缓存变成可序列化的 DehydratedState。
      - 默认按 defaultShouldDehydrateQuery 和 defaultShouldDehydrateMutation 过滤。
  - title: HydrationBoundary source
    url: https://unpkg.com/@tanstack/react-query@5.102.8/src/HydrationBoundary.tsx
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 当前实现里，缓存中没有的查询会在 render 阶段调用 hydrate。
      - 当前实现里，已经存在且更新时间更新的查询会排进队列，在 effect 里再 hydrate。
      - 这些时序是源码观察，不是可以配置的公共选项。
  - title: hydration source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/hydration.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - defaultShouldDehydrateQuery 只接受 status 为 success 的查询。
      - hydrate 给恢复出来的查询把 fetchStatus 设为 idle。
---

# SSR 与 Hydration

## 一、学习目标

- 说明 SSR 要把查询先预取、再脱水、再在客户端注水，才能避免首屏再请求。
- 在独立 `QueryClient` 上用 `query` 预取，再用 `dehydrate` 得到可序列化快照。
- 用 `HydrationBoundary` 把脱水结果注进客户端缓存。
- 说明客户端 `QueryClient` 要在组件内创建，默认 `staleTime` 不能为 `0`。
- 说明 `initialData` 不是完整 hydration，也不能覆盖已有缓存。

## 二、为什么服务端渲染后还会再请求

客户端渲染要先拿到标记，再下载 JS，再发查询。服务端渲染把带内容的标记和初始数据一起送出，用户能立刻看到林晓的现有任务。

这只在交接完整时成立。服务端必须先预取，再把缓存 `dehydrate` 成可序列化快照，客户端再用 `HydrationBoundary` `hydrate` 进自己的 `QueryClient`。少一步，首屏仍会再请求。

本课讲 React 与 TanStack Query 的通用交接。不把 Next.js、React Server Components、流式渲染或缓存持久化写成主线。

## 三、核心概念

### 1. 预取、脱水、注水是三次交接

官方把服务端渲染拆成三步：

1. 预取阶段用一份 `QueryClient` 跑 `query`
2. `dehydrate(queryClient)` 得到快照，交给服务端渲染和客户端
3. 客户端另一份 `QueryClient` 经 `HydrationBoundary` 注水

这里实际有三份客户端：预取一份，服务端渲染一份，浏览器一份。对齐靠脱水快照，不靠共享同一个内存实例。

### 2. HydrationBoundary 只注 queries

```tsx
<HydrationBoundary state={dehydratedState}>
  <TaskDetailPane />
</HydrationBoundary>
```

它把脱水状态写进当前 `QueryClient`。官方参考写明：缓存里还没有的查询在 render 阶段注水；已经存在的查询只在脱水数据更新时，等到 commit 后的 effect 再注水。当前源码用 `hydrate` 落实这件事，这是实现细节，不是额外的公共选项。

`HydrationBoundary` 只处理 `queries`。mutation 要用更底层的 `hydrate`，本课不展开。

### 3. 默认只脱水成功查询

`dehydrate` 默认调用 `defaultShouldDehydrateQuery`，只收下 `status === 'success'` 的查询。失败查询不会进快照，客户端会再试。关键内容失败时应让 `query` 抛出，由框架返回错误页，而不是把失败状态脱水回去。

### 4. staleTime 必须大于 0

`staleTime` 默认是 `0`。注水后的数据按服务端的 `dataUpdatedAt` 计算新鲜度。如果不改默认值，页面一交互就会后台再请求。SSR 通常给客户端默认 `staleTime` 设成大于 `0`。本课 Demo 用 `Infinity`，方便看清「注水后不再请求」。

## 四、用法与示例

### 1. 预取阶段用独立客户端

```tsx
const serverClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      retry: false,
    },
  },
})

await serverClient.query(taskDetailOptions)
const dehydratedState = dehydrate(serverClient)
```

不要继续调用已废弃的 `prefetchQuery`。当前稳定预取入口是 `query`。

### 2. 客户端按生命周期创建 QueryClient

```tsx
function App({ dehydratedState }: { dehydratedState: DehydratedState }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: Infinity,
            retry: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <TaskDetailPane />
      </HydrationBoundary>
    </QueryClientProvider>
  )
}
```

不要把 `const queryClient = new QueryClient()` 写在模块顶层。服务端会在请求之间复用这份缓存，数据和权限会串到其他用户。

### 3. 观察同一条 queryKey

```tsx
const taskDetailOptions = queryOptions({
  queryKey: ['tasks', 'detail', 't-1'] as const,
  queryFn: loadTaskDetail,
  staleTime: Infinity,
  retry: false,
})

function TaskDetailPane() {
  const taskQuery = useQuery(taskDetailOptions)
  return (
    <p>
      {taskQuery.data?.title} / {taskQuery.data?.owner}
    </p>
  )
}
```

预取和观察必须用同一条 `queryKey`。注水完成后，`useQuery` 读的是缓存里的现有任务 / 林晓，不会再发请求。

`initialData` 可以快速把服务端结果塞进单个 `useQuery`，但官方写明：它不能覆盖已有缓存，也没有服务端 `dataUpdatedAt`。完整交接仍用 `dehydrate` 和 `HydrationBoundary`。

## 五、用法示例：对照注水后再读详情

下面的 Demo 用独立 `QueryClient` 模拟服务端预取，再 `JSON.stringify` 模拟框架序列化。点「模拟服务端预取并注水」后，客户端经 `HydrationBoundary` 读出现有任务 / 林晓，请求次数只增加这一次服务端预取。点「不经注水直接读取」会跳过边界，由客户端再请求。点「重置」回到还没有观察查询的状态。

:::demo{id="react.data.learn.advanced.ssr-and-hydration.ssr-and-hydration-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：把 QueryClient 放在模块顶层

**触发条件：** 在服务端文件根上写 `const queryClient = new QueryClient()`。

**原因：** 官方写明这份缓存会在请求之间共享，所有用户拿到同一份数据。

**后果：** 性能变差，也可能把敏感缓存泄漏给其他人。

**错误示例：**

```tsx
const queryClient = new QueryClient()
```

**正确写法：**

```tsx
const [queryClient] = useState(() => new QueryClient())
```

**验证方式：** 客户端 QueryClient 只在组件初始化函数里创建。

### 错误：注水后仍使用默认 staleTime 0

**触发条件：** 客户端 `QueryClient` 不改 `staleTime`，注水后立刻挂 `useQuery`。

**原因：** 新鲜度按服务端 `dataUpdatedAt` 计算，默认 `0` 会判定为过期。

**后果：** 标记里已经有现有任务 / 林晓，页面仍立刻后台再请求。

**错误示例：**

```tsx
const queryClient = new QueryClient()
```

**正确写法：**

```tsx
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
})
```

**验证方式：** 注水后请求次数不再增加，任务详情仍是现有任务 / 林晓。

### 错误：用 initialData 代替 dehydrate

**触发条件：** 把服务端结果只传给某一个 `useQuery` 的 `initialData`。

**原因：** 官方写明 `initialData` 不会覆盖已有缓存，也没有服务端的 `dataUpdatedAt`。

**后果：** 深层组件拿不到数据，返回同一页时缓存也不会更新。

**错误示例：**

```tsx
useQuery({
  ...taskDetailOptions,
  initialData: props.task,
})
```

**正确写法：**

```tsx
<HydrationBoundary state={dehydratedState}>
  <TaskDetailPane />
</HydrationBoundary>
```

**验证方式：** 预取和观察都走同一条 `queryKey`，不靠单个组件的 `initialData`。

### 错误：继续调用已经废弃的 prefetchQuery

**触发条件：** 服务端写成 `await queryClient.prefetchQuery(taskDetailOptions)`。

**原因：** 当前稳定版把 `prefetchQuery` 标成废弃，预取入口改成 `query`。

**后果：** 还能跑，但和下个大版本以及本模块预取课不一致。

**错误示例：**

```tsx
await queryClient.prefetchQuery(taskDetailOptions)
```

**正确写法：**

```tsx
await queryClient.query(taskDetailOptions)
```

**验证方式：** Demo 只调用 `query` 再 `dehydrate`。

### 错误：用持久化插件代替 SSR 注水

**触发条件：** 把 `PersistQueryClientProvider` 当成服务端渲染的 hydration。

**原因：** 持久化恢复的是浏览器存储，不是这次请求脱水出来的标记。

**后果：** 首屏仍可能和本次服务端预取对不齐，也会把旧缓存带进新请求。

**错误示例：**

```tsx
<PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
  <TaskDetailPane />
</PersistQueryClientProvider>
```

**正确写法：**

```tsx
<HydrationBoundary state={dehydratedState}>
  <TaskDetailPane />
</HydrationBoundary>
```

**验证方式：** 模拟服务端预取并注水后，结果来自脱水快照，而不是本地存储。
:::

## 七、源码推导与适用场景

1. **官方事实：** SSR 要预取、脱水、再注水。客户端 `QueryClient` 按请求创建。`HydrationBoundary` 只注 queries。官方参考写明新查询在 render 阶段注水，已有查询在 commit 后的 effect 里合并。默认 `staleTime` 为 `0` 时注水后仍会刷新。`dehydrate` 默认只包含成功查询。
2. **源码观察：** 当前 `HydrationBoundary` 对尚未存在的查询同步调用 `hydrate`，把已有且更新的查询排进 effect。这是实现，不是可以配置的公共选项。
3. **课程推导：** 独立服务端客户端 `query` 出现有任务 / 林晓后，序列化再交给 `HydrationBoundary`，客户端观察同一条 `queryKey` 时请求次数不再增加。
4. **适用边界：** 本课不把 Next.js App Router、React Server Components、流式 SSR、`useSuspenseQuery` 漏预取造成的标记不匹配，或 persist 持久化写成主线。

## 八、练习

:::exercise
### 练习目标

**要求：** 创建服务端 `QueryClient`，用 `query` 预取 `['tasks', 'detail', 't-1']`。`queryFn` 调 `fetch`，非 2xx 时抛出带状态码的 `Error`。`retry` 为 `false`。用 `dehydrate` 得到快照。客户端用 `useState` 创建另一份 `QueryClient`，默认 `staleTime` 为 `Infinity`，再用 `HydrationBoundary` 包住 `useQuery`。

**验收：** 客户端挂上后直接显示现有任务 / 林晓，并且不会再发一次请求。

**参考答案：**

```tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery,
  type DehydratedState,
} from '@tanstack/react-query'
import { useState, type ReactElement } from 'react'

type TaskItem = {
  id: string
  title: string
  owner: string
}

/** 读取任务详情。 */
async function loadTaskDetail(): Promise<TaskItem> {
  const response = await fetch('/api/tasks/t-1')
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

const taskDetailOptions = queryOptions({
  queryKey: ['tasks', 'detail', 't-1'] as const,
  queryFn: loadTaskDetail,
  staleTime: Infinity,
  retry: false,
})

/** 服务端预取后再脱水。 */
export async function loadDehydratedTask(): Promise<DehydratedState> {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        retry: false,
      },
    },
  })
  await queryClient.query(taskDetailOptions)
  return dehydrate(queryClient)
}

/** 从注水后的缓存读详情。 */
function TaskDetailPane(): ReactElement {
  const taskQuery = useQuery(taskDetailOptions)
  if (!taskQuery.data) {
    return <p>正在读取任务。</p>
  }
  return (
    <p>
      {taskQuery.data.title} / {taskQuery.data.owner}
    </p>
  )
}

/** 客户端按生命周期创建 QueryClient，再注水。 */
export function App({ dehydratedState }: { dehydratedState: DehydratedState }): ReactElement {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: Infinity,
            retry: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <TaskDetailPane />
      </HydrationBoundary>
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- SSR 交接是预取、脱水、再注水，不是共享同一份内存缓存。
- 客户端用 `HydrationBoundary` 接收 `dehydrate` 的结果。
- `QueryClient` 按请求或组件生命周期创建，默认 `staleTime` 要大于 `0`。
- `initialData` 不能替代完整 hydration。
- 本课不展开框架专属流式渲染。

## 十、参考资料

- [Server Rendering & Hydration](https://tanstack.com/query/latest/docs/framework/react/guides/ssr) - 支持预取、脱水、注水和 staleTime 约定。
- [HydrationBoundary](https://tanstack.com/query/latest/docs/framework/react/reference/functions/HydrationBoundary) - 支持把脱水状态写进当前 QueryClient，且只处理 queries。
- [dehydrate](https://tanstack.com/query/latest/docs/framework/react/reference/functions/dehydrate) - 支持把缓存变成可序列化快照。
- [HydrationBoundary source](https://unpkg.com/@tanstack/react-query@5.102.8/src/HydrationBoundary.tsx) - 支持新查询在 render 阶段注水，已有查询在 effect 中合并。
- [hydration source](https://unpkg.com/@tanstack/query-core@5.102.8/src/hydration.ts) - 支持默认只脱水成功查询，hydrate 时把 fetchStatus 设为 idle。
