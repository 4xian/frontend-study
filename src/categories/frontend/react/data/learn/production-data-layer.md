---
id: react.data.learn.advanced.production-data-layer
type: lesson
title: 生产级数据层架构
summary: 应用边界只放一份 QueryClient；服务端数据用 queryOptions 进查询缓存，客户端状态只留主题这类同步值。
domain: frontend
technology: react
module: data
stage: advanced
level: advanced
estimatedMinutes: 40
prerequisites:
  - react.data.learn.basics.query-client-and-provider
  - react.data.learn.intermediate.data-hooks-and-module-organization
  - react.data.learn.basics.stale-time-and-freshness
related:
  - react.data.learn.basics.server-state-and-tanstack-query
  - react.data.learn.advanced.query-client-cache-operations
  - react.data.learn.advanced.query-testing
tags:
  - TanStack Query
  - 数据层
  - QueryClient
  - queryOptions
  - 服务端状态
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-11
objectives:
  - 能在应用边界创建一份带生产默认值的 QueryClient。
  - 能用 queryOptions 把同一资源的 queryKey 和 queryFn 收在数据层。
  - 能说明服务端数据留在查询缓存，不要再复制进客户端 store。
  - 能说明客户端状态只保留主题这类同步值。
  - 能用同一份 queryKey 失效后再读，而不是改客户端副本。
recap:
  - 生产数据层是一份 QueryClient、一组 queryOptions，加上必要的客户端状态。
  - 任务详情这类服务端数据只进查询缓存。
  - 主题、侧栏这类同步值才放进客户端状态。
  - 默认 staleTime 为 0，生产环境通常要改成大于 0。
  - 本课不把 Next.js、持久化或默认 queryFn 写成主线。
sources:
  - title: QueryClient
    url: https://tanstack.com/query/latest/docs/reference/QueryClient
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - QueryClient 是与缓存交互的入口。
      - defaultOptions 会成为这份客户端上查询和 mutation 的默认值。
      - invalidateQueries 会把匹配查询标为过期，并按规则重新获取。
  - title: QueryClientProvider
    url: https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - QueryClientProvider 把指定 QueryClient 提供给子树。
  - title: Query Options
    url: https://tanstack.com/query/latest/docs/framework/react/guides/query-options
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - queryOptions 用来在多处共享 queryKey 与 queryFn，并让它们保持共置。
      - 同一份配置可以传给 useQuery，也可以用 options.queryKey 读写缓存。
  - title: Important Defaults
    url: https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 默认把缓存数据视为过期。
      - 用 staleTime 改变这个行为，更长的 staleTime 会减少重新获取。
      - staleTime 为 Infinity 时，在手动失效前不会因过期再请求。
      - 过期查询会在新实例挂载、窗口重新聚焦和网络重连时后台刷新。
      - 推荐用 staleTime 避免过度刷新。
  - title: Caching Examples
    url: https://tanstack.com/query/latest/docs/framework/react/guides/caching
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 同一条 queryKey 的多个观察者共享同一份缓存。
      - 没有观察者后，缓存会按 gcTime 回收。
  - title: Does this replace Redux, MobX, etc?
    url: https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - TanStack Query 管理服务端状态，负责服务器和客户端之间的异步操作。
      - Redux、MobX、Zustand 管理客户端状态。
      - 把异步数据迁到 TanStack Query 后，剩下的全局客户端状态通常很小。
      - TanStack Query 不是本地或客户端状态的替代品。
  - title: QueryClient source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/queryClient.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 当前实现把 defaultOptions.queries 合并进每条查询。这是源码观察，不是额外的架构选项。
---

# 生产级数据层架构

## 一、学习目标

- 在应用边界创建一份带生产默认值的 `QueryClient`。
- 用 `queryOptions` 把同一资源的 `queryKey` 和 `queryFn` 收在数据层。
- 说明服务端数据留在查询缓存，不要再复制进客户端 store。
- 说明客户端状态只保留主题这类同步值。
- 用同一份 `queryKey` 失效后再读，而不是改客户端副本。

## 二、为什么生产环境还要单独谈数据层

前面的课已经能读查询、写 Mutation、测钩子。生产环境真正容易散掉的，不是某一个 API，而是职责分界：

- 任务详情是服务端状态，应该进 `QueryClient` 的缓存
- 浅色 / 深色主题是客户端状态，不应该进查询缓存
- `queryKey` 和 `queryFn` 必须共置，预取、失效、观察才能对准同一条身份

如果每个页面自己 `new QueryClient()`，或把现有任务 / 林晓再抄进一份客户端 store，服务端一更新，界面就会对不齐。

本课把这些边界收成一条生产数据层。不把 Next.js、缓存持久化或「全应用共用一个 default queryFn」写成主线。

## 三、核心概念

### 1. 应用边界只有一份 QueryClient

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TaskWorkspace />
    </QueryClientProvider>
  )
}
```

`QueryClient` 是和缓存交互的入口。`defaultOptions` 会成为这份客户端上查询的默认值。`QueryClientProvider` 把它提供给子树。

测试课要求每次测试新建客户端。生产应用相反：运行中的界面共享这一份，好让现有任务 / 林晓在多个组件之间复用。

### 2. 资源定义用 queryOptions，不散落在界面

```tsx
const taskDetailOptions = queryOptions({
  queryKey: ['tasks', 'detail', 't-1'] as const,
  queryFn: loadTaskDetail,
})
```

官方用 `queryOptions` 把 `queryKey` 和 `queryFn` 共置。同一份配置可以给 `useQuery`，也可以用 `options.queryKey` 失效或写入缓存。

生产数据层先声明资源，再让页面调用。不要在按钮处理函数里再手打一组数组。

### 3. 服务端状态不要复制进客户端 store

官方把职责写清楚：TanStack Query 管理服务端状态；Redux、MobX、Zustand 管理客户端状态。把 `projects`、`teams`、`tasks`、`users` 迁走之后，全局客户端状态通常只剩 `themeMode`、`sidebarStatus` 这类同步值。

它不是客户端状态的替代品。主题仍用 `useState` 或客户端 store。任务详情不要再抄一份。

### 4. 生产默认值通常要改 staleTime

官方默认把缓存数据视为过期。过期查询会在新实例挂载、窗口重新聚焦和网络重连时后台刷新。推荐用 `staleTime` 避免过度刷新。

`staleTime: Infinity` 时，在手动 `invalidateQueries` 前不会因过期再请求。本课 Demo 用它看清「查询缓存会更新，客户端副本不会」。

## 四、用法与示例

### 1. 数据层同时提供查询入口和失效入口

```tsx
function useTaskDetail() {
  return useQuery(taskDetailOptions)
}

function useInvalidateTask() {
  const queryClient = useQueryClient()
  return function invalidateTask() {
    return queryClient.invalidateQueries({
      queryKey: taskDetailOptions.queryKey,
    })
  }
}
```

观察和失效都引用 `taskDetailOptions.queryKey`。服务端把现有任务改成修订任务后，失效会让查询缓存再读一次，不需要去改某一份组件 state。

### 2. 客户端状态只留同步值

```tsx
function WorkspaceChrome() {
  const [theme, setTheme] = useState<'浅色' | '深色'>('浅色')
  const taskQuery = useTaskDetail()

  return (
    <section>
      <p>{theme}</p>
      <p>
        {taskQuery.data?.title} / {taskQuery.data?.owner}
      </p>
      <button type="button" onClick={() => setTheme('深色')}>
        切换客户端主题
      </button>
    </section>
  )
}
```

切换主题不会增加请求次数，也不会改查询缓存。任务详情仍从 `useQuery` 来。

### 3. 对照错误的复制

```tsx
const cached = queryClient.getQueryData(taskDetailOptions.queryKey)
setClientCopy(cached)
```

这能立刻画出一份现有任务 / 林晓，但那是客户端快照。之后 `invalidateQueries` 只会更新查询缓存。客户端副本还停在旧标题。

## 五、用法示例：对照查询缓存和客户端副本

下面的 Demo 在应用边界挂一份 `QueryClient`。点「挂上生产数据层」后，查询缓存读出现有任务 / 林晓，请求次数加一。点「复制进客户端状态」会把当时的缓存抄进组件 state。点「服务端更新后再读」会失效同一条 `queryKey`，查询缓存变成修订任务 / 林晓，客户端副本仍是现有任务 / 林晓。点「切换客户端主题」只改浅色 / 深色。点「重置」回到还没有观察查询的状态。

:::demo{id="react.data.learn.advanced.production-data-layer.production-data-layer-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：每个页面自己创建 QueryClient

**触发条件：** 列表页和详情页各自 `new QueryClient()`，再各自包 `QueryClientProvider`。

**原因：** 查询缓存在客户端实例上。两份客户端对不上同一条 `queryKey`。

**后果：** 详情页读不到列表页已经拿到的现有任务 / 林晓，请求次数翻倍。

**错误示例：**

```tsx
function DetailPage() {
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <TaskDetailPane />
    </QueryClientProvider>
  )
}
```

**正确写法：**

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
})
```

**验证方式：** 生产应用只在边界创建一份客户端，子树共享同一份缓存。

### 错误：把任务详情复制进客户端 store

**触发条件：** `useQuery` 成功后 `setTasks(data)`，界面改去读这份 state。

**原因：** 官方把任务这类异步数据归为服务端状态。复制后，查询缓存和客户端 store 各有一份。

**后果：** 失效或后台刷新只更新查询缓存，界面仍显示现有任务 / 林晓。

**错误示例：**

```tsx
setClientCopy(queryClient.getQueryData(taskDetailOptions.queryKey))
```

**正确写法：**

```tsx
const taskQuery = useQuery(taskDetailOptions)
```

**验证方式：** 先复制进客户端状态，再点服务端更新后再读；查询缓存变成修订任务 / 林晓，客户端副本不变。

### 错误：生产环境沿用默认 staleTime 0

**触发条件：** 创建 `QueryClient` 时不设 `staleTime`。

**原因：** 官方默认把缓存视为过期，新实例挂载、聚焦、重连都会后台刷新。

**后果：** 任务详情已经在缓存里，页面仍频繁请求。

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

**验证方式：** 挂上数据层后请求次数加一；在手动失效前不再增加。

### 错误：在界面里再手写一套 queryKey

**触发条件：** `useQuery` 用 `['tasks', 'detail', 't-1']`，失效时写成 `['task', 't-1']`。

**原因：** 官方要求 `queryKey` 和 `queryFn` 共置。两套数组对不上同一条缓存。

**后果：** 失效打空，查询缓存仍是现有任务 / 林晓。

**错误示例：**

```tsx
queryClient.invalidateQueries({ queryKey: ['task', 't-1'] })
```

**正确写法：**

```tsx
queryClient.invalidateQueries({ queryKey: taskDetailOptions.queryKey })
```

**验证方式：** 失效必须引用 `queryOptions` 里的同一条 key。

### 错误：用客户端 store 再缓存同一份服务端数据

**触发条件：** Zustand 或 Redux 里再存 `tasks`，和 `useQuery` 并行。

**原因：** 官方写明 TanStack Query 已经负责服务端缓存。客户端库只该留下主题这类同步值。

**后果：** 两套加载、错误和过期规则，服务端更新后对不齐。

**错误示例：**

```tsx
const globalState = {
  tasks,
  themeMode,
}
```

**正确写法：**

```tsx
const globalState = {
  themeMode,
}
```

**验证方式：** 切换客户端主题不增加请求次数；任务详情只出现在查询缓存指标里。
:::

## 七、源码推导与适用场景

1. **官方事实：** `QueryClient` 是缓存入口，可用 `defaultOptions` 设生产默认值。`QueryClientProvider` 把这份客户端提供给子树。`queryOptions` 共置 `queryKey` 和 `queryFn`。默认 `staleTime` 为 `0`，过期查询会在挂载、聚焦、重连时刷新。服务端状态走 TanStack Query，客户端状态走 Redux / Zustand 等，迁走异步数据后全局客户端状态通常很小。
2. **源码观察：** 当前实现把 `defaultOptions.queries` 合并进每条查询。这不是额外的架构选项。
3. **课程推导：** 应用边界挂一份客户端后，查询缓存读出现有任务 / 林晓。复制进客户端状态再失效，只有查询缓存变成修订任务 / 林晓。主题切换不发请求。
4. **适用边界：** 本课不把 Next.js、React Server Components、缓存持久化、全应用 default queryFn，或协作平台实战写成主线。

## 八、练习

:::exercise
### 练习目标

**要求：** 在应用边界创建一份 `QueryClient`，默认 `staleTime` 为 `Infinity`，`retry` 为 `false`。抽出 `taskDetailOptions`，`queryKey` 为 `['tasks', 'detail', 't-1']`。组件用 `useQuery` 读详情，并用 `invalidateQueries({ queryKey: taskDetailOptions.queryKey })` 在服务端更新后重读。另用 `useState` 保存主题。不要把查询结果写入客户端 store。`queryFn` 调 `fetch`，非 2xx 时抛出带状态码的 `Error`。

**验收：** 首次读取显示现有任务 / 林晓。失效后查询缓存更新。切换主题不发请求。

**参考答案：**

```tsx
import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery,
  useQueryClient,
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
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      retry: false,
    },
  },
})

/** 从查询缓存读详情。 */
function TaskDetailPane(): ReactElement {
  const taskQuery = useQuery(taskDetailOptions)
  const queryClientInTree = useQueryClient()
  const [theme, setTheme] = useState<'浅色' | '深色'>('浅色')

  if (!taskQuery.data) {
    return <p>正在读取任务。</p>
  }

  return (
    <section>
      <p>
        {taskQuery.data.title} / {taskQuery.data.owner}
      </p>
      <p>{theme}</p>
      <button
        type="button"
        onClick={() => {
          void queryClientInTree.invalidateQueries({
            queryKey: taskDetailOptions.queryKey,
          })
        }}
      >
        服务端更新后再读
      </button>
      <button type="button" onClick={() => setTheme('深色')}>
        切换客户端主题
      </button>
    </section>
  )
}

/** 应用边界只提供一份 QueryClient。 */
export function App(): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <TaskDetailPane />
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- 生产数据层是一份 `QueryClient` 加一组 `queryOptions`。
- 服务端数据留在查询缓存，不要复制进客户端 store。
- 主题这类同步值才放进客户端状态。
- 生产环境通常要把默认 `staleTime` 改成大于 `0`。
- 失效和观察必须使用同一条 `queryKey`。

## 十、参考资料

- [QueryClient](https://tanstack.com/query/latest/docs/reference/QueryClient) - 支持客户端入口、defaultOptions 和失效。
- [QueryClientProvider](https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider) - 支持把客户端提供给子树。
- [Query Options](https://tanstack.com/query/latest/docs/framework/react/guides/query-options) - 支持共置 queryKey 与 queryFn。
- [Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults) - 支持默认过期和用 staleTime 减少刷新。
- [Caching Examples](https://tanstack.com/query/latest/docs/framework/react/guides/caching) - 支持同一 queryKey 共享缓存。
- [Does this replace Redux, MobX, etc?](https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state) - 支持服务端状态与客户端状态分界。
- [QueryClient source](https://unpkg.com/@tanstack/query-core@5.102.8/src/queryClient.ts) - 支持当前实现合并 defaultOptions.queries。
