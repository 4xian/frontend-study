---
id: react.data.learn.advanced.production-server-data-center
type: lesson
title: 实战：生产级服务端数据中心
summary: 应用边界一份 QueryClient；用 queryOptions 预取任务列表再观察，创建后作废同一条查询，主题留在客户端状态。
domain: frontend
technology: react
module: data
stage: advanced
level: advanced
estimatedMinutes: 50
prerequisites:
  - react.data.learn.advanced.production-data-layer
  - react.data.learn.advanced.query-prefetching
  - react.data.learn.intermediate.data-hooks-and-module-organization
related:
  - react.data.learn.intermediate.query-invalidation
  - react.data.learn.advanced.collaboration-content-platform
  - react.data.learn.basics.server-state-and-tanstack-query
tags:
  - TanStack Query
  - 生产级服务端数据中心
  - QueryClient
  - queryOptions
  - queryClient.query
  - invalidateQueries
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-11
objectives:
  - 能在应用边界创建一份带生产默认值的 QueryClient。
  - 能用 queryOptions 把任务列表的 queryKey 和 queryFn 收在数据层。
  - 能在观察者出现之前调用 queryClient.query 预取列表。
  - 能把这份配置包成 useTaskList，打开后直接读缓存。
  - 能在创建成功后 await 作废同一条 queryKey，并说明主题只留在客户端状态。
recap:
  - 数据中心是一份 QueryClient 加一组 queryOptions。
  - 预取列表用 queryClient.query，打开后 useQuery 读同一条缓存。
  - 创建成功后作废同一条 queryKey，列表首项变成新任务。
  - 主题这类同步值才放进客户端状态，切换主题不发请求。
  - 本课不把 Next.js、持久化、无限查询或默认 queryFn 写成主线。
sources:
  - title: QueryClient
    url: https://tanstack.com/query/latest/docs/reference/QueryClient
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - QueryClient 用来和查询、mutation 缓存交互。
      - defaultOptions 会成为这份客户端上查询和 mutation 的默认值。
      - query 会运行 queryFn、缓存结果并返回数据。
  - title: Query Options
    url: https://tanstack.com/query/latest/docs/framework/react/guides/query-options
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - queryOptions 用来在多处共享 queryKey 与 queryFn，并让它们保持共置。
      - 同一份配置可以传给 useQuery，也可以传给 queryClient.query。
  - title: Prefetching & Router Integration
    url: https://tanstack.com/query/latest/docs/framework/react/guides/prefetching
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 提前把数据放进缓存，能让之后真正需要时更快出现。
      - 预取使用 query 方法，它会运行 queryFn、缓存结果并返回数据。
  - title: Important Defaults
    url: https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 默认把缓存数据视为过期。
      - staleTime 为 Infinity 时，在手动失效前不会因过期再请求。
      - 推荐用 staleTime 避免过度刷新。
  - title: Invalidations from Mutations
    url: https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - mutation 成功后，相关查询通常需要作废并重新获取。
      - 在 onSuccess 里调用 invalidateQueries。
      - 返回 Promise 时，mutation 会等到数据更新后才结束 pending。
  - title: Does this replace Redux, MobX, etc?
    url: https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - TanStack Query 管理服务端状态，负责服务器和客户端之间的异步操作。
      - 把异步数据迁到 TanStack Query 后，剩下的全局客户端状态通常很小。
      - 主题这类同步值仍留在客户端状态。
  - title: QueryClient source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/queryClient.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 当前实现把 defaultOptions.queries 合并进每条查询。这是源码观察，不是额外的架构选项。
---

# 实战：生产级服务端数据中心

## 一、学习目标

- 在应用边界创建一份带生产默认值的 `QueryClient`。
- 用 `queryOptions` 把任务列表的 `queryKey` 和 `queryFn` 收在数据层。
- 在观察者出现之前调用 `queryClient.query` 预取列表。
- 把这份配置包成 `useTaskList`，打开后直接读缓存。
- 在创建成功后 `await` 作废同一条 `queryKey`，并说明主题只留在客户端状态。

## 二、为什么要做生产级服务端数据中心

已经能单独完成三件事：在应用边界放一份带生产默认值的 `QueryClient`；用 `queryClient.query` 在观察之前预取；把读取和写入收进自定义 Hook，写入成功后作废相关查询。生产级服务端数据中心要把这三件事收成一条工作台。

林晓的任务列表是服务端状态。打开数据中心前先预取，画面应直接出现现有任务 / 林晓。创建「核对创建任务」后，同一条列表查询必须重拉。浅色 / 深色主题是客户端状态，切换时不应发请求。

如果每个页面自己 `new QueryClient()`，或把列表再抄进一份客户端 store，预取进了缓存，打开时仍会再请求；创建成功后界面也可能对不齐。本课组合已经学过的能力，不把 Next.js、缓存持久化、无限查询或「全应用共用一个 default queryFn」写成主线。

## 三、核心概念

### 1. 数据中心边界只有一份 QueryClient

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
})
```

`QueryClient` 是和缓存交互的入口。`defaultOptions` 会成为这份客户端上查询的默认值。官方默认把缓存视为过期；`staleTime: Infinity` 时，在手动失效前不会因过期再请求。

### 2. 列表用 queryOptions，预取和观察共用

```tsx
const taskListOptions = queryOptions({
  queryKey: ['tasks'] as const,
  queryFn: loadTasks,
})
```

官方用 `queryOptions` 把 `queryKey` 和 `queryFn` 共置。同一份配置可以给 `useQuery`，也可以给 `queryClient.query`。预取结束后，缓存里已经有现有任务 / 林晓。再挂观察者时，只要 `staleTime` 还有效，请求次数不会增加。

当前预取 API 是 `queryClient.query`。`prefetchQuery` 已经废弃。

### 3. 服务端数据留在查询缓存

官方把职责写清楚：TanStack Query 管理服务端状态。把 `tasks` 迁走之后，全局客户端状态通常只剩 `themeMode` 这类同步值。创建成功后作废同一条 `queryKey`，不要去改某一份组件 state。

## 四、用法与示例

### 1. 数据层同时提供预取、观察和创建

```tsx
/** 订阅任务列表。 */
function useTaskList() {
  return useQuery(taskListOptions)
}

/** 创建任务后作废同一条列表查询。 */
function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...createTaskOptions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: taskListOptions.queryKey,
      })
    },
  })
}
```

预取、观察和作废都引用 `taskListOptions`。界面不再手写 `['tasks']`。

### 2. 先预取再打开

```tsx
await queryClient.query(taskListOptions)

function TaskCenter() {
  const listQuery = useTaskList()
  return (
    <p>
      {listQuery.data?.[0]?.title} / {listQuery.data?.[0]?.owner}
    </p>
  )
}
```

预取把列表放进缓存。打开后 `useQuery` 读同一条身份。

### 3. 客户端状态只留同步值

```tsx
const [theme, setTheme] = useState<'浅色' | '深色'>('浅色')
```

切换主题不会增加请求次数，也不会改查询缓存。任务列表仍从 `useQuery` 来。

## 五、用法示例：对照预取、创建和主题

下面的 Demo 在应用边界挂一份 `QueryClient`。进入时还没有观察查询，请求次数为 `0`。点「预取任务列表」后，缓存出现现有任务 / 林晓，请求次数加一。点「打开数据中心」后，观察者直接读缓存，请求次数不变。点「创建任务」后作废同一条 `queryKey`，列表首项变成核对创建任务 / 林晓。点「切换客户端主题」只改浅色 / 深色。点「重置」回到还没有观察查询的状态。

:::demo{id="react.data.learn.advanced.production-server-data-center.production-server-data-center-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：每个页面自己创建 QueryClient

**触发条件：** 预取页和数据中心页各自 `new QueryClient()`。

**原因：** 查询缓存在客户端实例上。两份客户端对不上同一条 `queryKey`。

**后果：** 预取进了缓存，打开后仍再请求一次现有任务 / 林晓。

**错误示例：**

```tsx
function TaskCenterPage() {
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <TaskCenter />
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

**验证方式：** 预取后打开数据中心，请求次数不增加。

### 错误：继续调用 prefetchQuery

**触发条件：** 预取写成 `queryClient.prefetchQuery(taskListOptions)`。

**原因：** 当前主线是 `queryClient.query`。`prefetchQuery` 已标记废弃。

**后果：** 课程和现行 API 不一致，后续大版本会删掉这条路径。

**错误示例：**

```tsx
await queryClient.prefetchQuery(taskListOptions)
```

**正确写法：**

```tsx
await queryClient.query(taskListOptions)
```

**验证方式：** 预取后缓存出现现有任务 / 林晓，打开数据中心不再加请求次数。

### 错误：把任务列表复制进客户端 store

**触发条件：** `useQuery` 成功后 `setTasks(data)`，界面改去读这份 state。

**原因：** 官方把任务这类异步数据归为服务端状态。复制后，查询缓存和客户端 store 各有一份。

**后果：** 作废只更新查询缓存，界面仍显示现有任务 / 林晓。

**错误示例：**

```tsx
setClientCopy(queryClient.getQueryData(taskListOptions.queryKey))
```

**正确写法：**

```tsx
const listQuery = useQuery(taskListOptions)
```

**验证方式：** 创建后列表首项变成核对创建任务 / 林晓，不要去读另一份客户端副本。

### 错误：创建后去作废另一套 key

**触发条件：** 写成 `invalidateQueries({ queryKey: ['task'] })`。

**原因：** 不同前缀打不到 `['tasks']`。

**后果：** 创建已经成功，列表首项仍是现有任务 / 林晓。

**错误示例：**

```tsx
await queryClient.invalidateQueries({
  queryKey: ['task'],
})
```

**正确写法：**

```tsx
await queryClient.invalidateQueries({
  queryKey: taskListOptions.queryKey,
})
```

**验证方式：** 创建后请求次数加一，列表首项变成核对创建任务 / 林晓。

### 错误：用查询缓存保存主题

**触发条件：** 把浅色 / 深色写成一条 `useQuery`。

**原因：** 官方把主题归为客户端同步值。它不来自服务器，也不该走 `queryFn`。

**后果：** 切换主题会假装发请求，或被 `staleTime` 卡住。

**错误示例：**

```tsx
useQuery({
  queryKey: ['theme'],
  queryFn: () => '深色',
})
```

**正确写法：**

```tsx
const [theme, setTheme] = useState<'浅色' | '深色'>('浅色')
```

**验证方式：** 切换客户端主题不增加请求次数；任务列表只出现在查询缓存指标里。
:::

## 七、源码推导与适用场景

1. **官方事实：** `QueryClient` 是缓存入口，可用 `defaultOptions` 设生产默认值。`queryOptions` 共置 `queryKey` 和 `queryFn`，并可传给 `queryClient.query`。默认 `staleTime` 为 `0`；设为 `Infinity` 时，手动失效前不会因过期再请求。mutation 成功后应作废相关查询，并 `await` 这次作废。服务端状态走 TanStack Query，主题这类同步值留在客户端。
2. **源码观察：** 当前实现把 `defaultOptions.queries` 合并进每条查询。这不是额外的架构选项。
3. **课程推导：** 先预取列表，打开后请求次数不变。创建后作废同一条 key，列表首项变成核对创建任务 / 林晓。切换主题不发请求。
4. **适用边界：** 本课不把 Next.js、React Server Components、缓存持久化、无限查询、全应用 default queryFn 写成主线。官方示例里的 axios 可换成 `fetch`。

## 八、练习

:::exercise
### 练习目标

**要求：** 在应用边界创建一份 `QueryClient`，默认 `staleTime` 为 `Infinity`，`retry` 为 `false`。声明 `taskListOptions`，使用 `queryOptions`，`queryKey` 为 `['tasks']`。导出 `useTaskList`。预取时调用 `queryClient.query(taskListOptions)`。再声明 `createTaskOptions` 和 `useCreateTask`，`mutationFn` 用 `fetch` `POST`，非 2xx 时抛出带状态码的 `Error`，`onSuccess` 里 `await invalidateQueries({ queryKey: taskListOptions.queryKey })`。另用 `useState` 保存主题。不要把查询结果写入客户端 store。

**验收：** 预取后打开不再增加请求。创建成功后列表首项变成核对创建任务 / 林晓。切换主题不发请求。

**参考答案：**

```tsx
import {
  QueryClient,
  QueryClientProvider,
  mutationOptions,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useState, type ReactElement } from 'react'

type TaskItem = {
  id: string
  title: string
  owner: string
}

/** 读取任务列表。 */
async function loadTasks(): Promise<TaskItem[]> {
  const response = await fetch('/api/tasks')
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem[]
}

/** 创建任务。 */
async function createTask(): Promise<TaskItem> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '核对创建任务', owner: '林晓' }),
  })
  if (!response.ok) {
    throw new Error(`创建失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

const taskListOptions = queryOptions({
  queryKey: ['tasks'] as const,
  queryFn: loadTasks,
  staleTime: Infinity,
  retry: false,
})

const createTaskOptions = mutationOptions({
  mutationFn: createTask,
  retry: false,
})

/** 订阅任务列表。 */
export function useTaskList() {
  return useQuery(taskListOptions)
}

/** 创建任务后作废同一条列表查询。 */
function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...createTaskOptions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: taskListOptions.queryKey,
      })
    },
  })
}

/** 生产级服务端数据中心工作区。 */
function TaskCenter(): ReactElement {
  const listQuery = useTaskList()
  const createMutation = useCreateTask()
  const [theme, setTheme] = useState<'浅色' | '深色'>('浅色')

  return (
    <section>
      <p>{theme}</p>
      {listQuery.data?.map((task) => (
        <p key={task.id}>
          {task.title} / {task.owner}
        </p>
      ))}
      <button
        type="button"
        disabled={createMutation.isPending}
        onClick={() => createMutation.mutate()}
      >
        创建任务
      </button>
      <button type="button" onClick={() => setTheme('深色')}>
        切换客户端主题
      </button>
    </section>
  )
}

/** 应用边界只提供一份 QueryClient，并先预取列表再打开观察者。 */
export function App(): ReactElement {
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
  const [opened, setOpened] = useState(false)

  /** 在观察者出现之前预取任务列表。 */
  async function prefetchList(): Promise<void> {
    await queryClient.query(taskListOptions)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <button type="button" onClick={() => void prefetchList()}>
        预取任务列表
      </button>
      <button type="button" onClick={() => setOpened(true)}>
        打开数据中心
      </button>
      {opened ? <TaskCenter /> : null}
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- 数据中心是一份 `QueryClient` 加一组 `queryOptions`。
- 预取列表用 `queryClient.query`，打开后 `useQuery` 读同一条缓存。
- 创建成功后作废同一条查询。
- 主题这类同步值才放进客户端状态。
- 服务端数据不要复制进客户端 store。

## 十、参考资料

- [QueryClient](https://tanstack.com/query/latest/docs/reference/QueryClient) - 支持客户端入口、defaultOptions 和 query。
- [Query Options](https://tanstack.com/query/latest/docs/framework/react/guides/query-options) - 支持共置 queryKey 与 queryFn。
- [Prefetching & Router Integration](https://tanstack.com/query/latest/docs/framework/react/guides/prefetching) - 支持用 query 预取。
- [Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults) - 支持默认过期和用 staleTime 减少刷新。
- [Invalidations from Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations) - 支持 mutation 成功后作废相关查询。
- [Does this replace Redux, MobX, etc?](https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state) - 支持服务端状态与客户端状态分界。
- [QueryClient source](https://unpkg.com/@tanstack/query-core@5.102.8/src/queryClient.ts) - 支持当前实现合并 defaultOptions.queries。
