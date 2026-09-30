---
id: react.data.learn.advanced.collaboration-content-platform
type: lesson
title: 实战：协作内容平台
summary: 用 infiniteQueryOptions 声明协作流，先预取首页再观察，加载更多追加新页，创建成功后作废同一条无限查询。
domain: frontend
technology: react
module: data
stage: advanced
level: advanced
estimatedMinutes: 50
prerequisites:
  - react.data.learn.advanced.infinite-queries
  - react.data.learn.advanced.query-prefetching
  - react.data.learn.intermediate.data-hooks-and-module-organization
related:
  - react.data.learn.intermediate.query-invalidation
  - react.data.learn.advanced.production-data-layer
  - react.data.learn.intermediate.paginated-content-management
tags:
  - TanStack Query
  - 协作内容平台
  - infiniteQueryOptions
  - infiniteQuery
  - useInfiniteQuery
  - invalidateQueries
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-11
objectives:
  - 能用 infiniteQueryOptions 把协作流的 queryKey、queryFn、initialPageParam 和 getNextPageParam 收在一处。
  - 能在观察者出现之前调用 queryClient.infiniteQuery 预取首页。
  - 能把这份配置包成 useTaskFeed，打开后直接读缓存。
  - 能在不是 isFetching 时调用 fetchNextPage，把第二页追加进同一条缓存。
  - 能在创建成功后 await 作废同一条 queryKey，让已打开的页按序重拉。
recap:
  - 协作流用 infiniteQueryOptions，不要另写一套无限查询身份。
  - 预取首页用 queryClient.infiniteQuery，默认只拉第一页。
  - 打开后 useInfiniteQuery 读同一条缓存，fresh 时不再请求。
  - 加载更多走 fetchNextPage，新页追加进 data.pages。
  - 创建成功后作废同一条无限查询，已打开的页从第一页按序重拉。
sources:
  - title: Infinite Queries
    url: https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - useInfiniteQuery 用来把新数据追加到已有集合上。
      - data 是对象，含 pages 和 pageParams。
      - initialPageParam 必填，用来指定第一页参数。
      - getNextPageParam 用来判断还有没有下一页，并把信息交给 queryFn。
      - hasNextPage 在 getNextPageParam 返回非 null 或 undefined 时为 true。
      - 正在请求时再调 fetchNextPage 可能覆盖后台刷新，应先确认不是 isFetching。
      - 无限查询变 stale 后，会从第一页开始按已有页数依次重拉。
  - title: Prefetching & Router Integration
    url: https://tanstack.com/query/latest/docs/framework/react/guides/prefetching
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 提前把数据放进缓存，能让之后真正需要时更快出现。
      - 无限查询可以像普通查询一样预取。
      - 默认只预取第一页，并存在给定的 queryKey 下。
      - 若要预取多页，使用 pages，并且必须提供 getNextPageParam。
  - title: Query Options
    url: https://tanstack.com/query/latest/docs/framework/react/guides/query-options
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - queryOptions 用来在多处共享 queryKey 与 queryFn，并让它们保持共置。
      - 无限查询要改用 infiniteQueryOptions。
  - title: infiniteQueryOptions
    url: https://tanstack.com/query/latest/docs/framework/react/reference/functions/infiniteQueryOptions
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 能传给 useInfiniteQuery 的选项，一般也能传给 infiniteQueryOptions。
      - 这些选项可以在钩子和 queryClient.infiniteQuery 之间共享。
      - options.queryKey 必填。
  - title: Invalidations from Mutations
    url: https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - mutation 成功后，相关查询通常需要作废并重新获取。
      - 在 onSuccess 里调用 invalidateQueries。
      - 返回 Promise 时，mutation 会等到数据更新后才结束 pending。
  - title: QueryClient
    url: https://tanstack.com/query/latest/docs/reference/QueryClient
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - infiniteQuery 类似 query，用来获取并缓存无限查询。
  - title: QueryClient source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/queryClient.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 当前实现里 infiniteQuery 会标成无限查询，再交给 query。这是源码观察，不是额外的预取选项。
      - prefetchInfiniteQuery 已标记废弃，应改用 infiniteQuery。
---

# 实战：协作内容平台

## 一、学习目标

- 用 `infiniteQueryOptions` 把协作流的 `queryKey`、`queryFn`、`initialPageParam` 和 `getNextPageParam` 收在一处。
- 在观察者出现之前调用 `queryClient.infiniteQuery` 预取首页。
- 把这份配置包成 `useTaskFeed`，打开后直接读缓存。
- 在不是 `isFetching` 时调用 `fetchNextPage`，把第二页追加进同一条缓存。
- 在创建成功后 `await` 作废同一条 `queryKey`，让已打开的页按序重拉。

## 二、为什么要做协作内容平台

已经能单独完成三件事：用 `useInfiniteQuery` 把多页追加进同一条缓存；用 `queryClient.query` 在观察之前预取；把读取和写入收进自定义 Hook，写入成功后作废相关查询。协作内容平台要把这三件事放在同一条路径上。

林晓的协作流按游标返回。打开平台前先预取首页，画面应直接出现现有任务 / 林晓。点加载更多后，周宁的第二页任务追加在后面。同事创建「核对创建任务」后，同一条无限查询必须按已经打开的页数重拉，首页才能出现新任务。

如果预取、观察和作废各写一套 `queryKey`，预取进了缓存，打开时仍会再请求；创建成功后也可能打空。本课组合已经学过的能力，不把 `maxPages`、双向列表、SSR 或完整生产数据中心写成主线。

## 三、核心概念

### 1. 协作流用 infiniteQueryOptions

```tsx
const feedOptions = infiniteQueryOptions({
  queryKey: ['tasks', 'feed'] as const,
  queryFn: ({ pageParam }) => loadTaskPage(pageParam),
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})
```

官方给无限查询单独准备了 `infiniteQueryOptions`。能传给 `useInfiniteQuery` 的选项，一般也能传给它，并和 `queryClient.infiniteQuery` 共享。`queryKey` 必填。不要再用普通 `queryOptions` 去描述带 `pageParam` 的流。

### 2. 预取默认只拉第一页

```tsx
await queryClient.infiniteQuery(feedOptions)
```

官方写明：无限查询可以像普通查询一样预取；默认只预取第一页，并存在给定的 `queryKey` 下。若要一次预取多页，才使用 `pages`，并且必须提供 `getNextPageParam`。本课只预取首页，打开后再按需加载更多。

当前 API 是 `queryClient.infiniteQuery`。`prefetchInfiniteQuery` 已经废弃。

### 3. 打开后追加，创建后按序重拉

`useInfiniteQuery` 的 `data` 含 `pages` 和 `pageParams`。`fetchNextPage` 把新页追加进同一条缓存，不另开 `queryKey`。正在请求时不要再调一次。

创建成功后作废同一条无限查询。官方说无限查询变 stale 后，会从第一页开始按已有页数依次重拉。所以先加载更多再创建，请求次数会按已经打开的两页增加，而不是只重拉首页。

## 四、用法与示例

### 1. 数据层同时提供预取、观察和创建

```tsx
/** 订阅协作流。 */
function useTaskFeed() {
  return useInfiniteQuery(feedOptions)
}

/** 创建协作任务后作废同一条无限查询。 */
function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...createTaskOptions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: feedOptions.queryKey,
      })
    },
  })
}
```

预取、观察和作废都引用 `feedOptions`。界面不再手写 `['tasks', 'feed']`。

### 2. 先预取再打开

```tsx
async function prefetchFeed() {
  await queryClient.infiniteQuery(feedOptions)
}

function CollaborationFeed() {
  const feedQuery = useTaskFeed()
  const tasks = feedQuery.data?.pages.flatMap((page) => page.tasks) ?? []
  return (
    <p>
      {tasks[0]?.title} / {tasks[0]?.owner}
    </p>
  )
}
```

预取结束后，缓存里已经有现有任务 / 林晓。再挂 `useInfiniteQuery` 时，只要 `staleTime` 还有效，请求次数不会增加。

### 3. 加载更多前先看 isFetching

```tsx
function loadMore() {
  if (feedQuery.hasNextPage && !feedQuery.isFetching) {
    void feedQuery.fetchNextPage()
  }
}
```

官方提醒：正在请求时再调 `fetchNextPage`，可能盖掉后台刷新。协作流同一时刻只能有一次进行中的请求。

## 五、用法示例：对照预取、追加和创建后重拉

下面的 Demo 在应用边界挂一份 `QueryClient`。进入时还没有观察查询，请求次数为 `0`。点「预取协作流首页」后，缓存出现现有任务 / 林晓，请求次数加一。点「打开协作流」后，观察者直接读缓存，请求次数不变。点「加载更多」追加第二页任务 / 周宁。点「创建协作任务」后作废同一条 `queryKey`，已打开的页按序重拉，列表首项变成核对创建任务 / 林晓。点「重置」回到还没有观察查询的状态。

:::demo{id="react.data.learn.advanced.collaboration-content-platform.collaboration-content-platform-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：用 queryOptions 描述无限查询

**触发条件：** 协作流写成普通 `queryOptions`，再传给 `useInfiniteQuery`。

**原因：** 官方给无限查询准备了 `infiniteQueryOptions`。它要带 `initialPageParam` 和 `getNextPageParam`，并和 `queryClient.infiniteQuery` 共享。

**后果：** 预取和观察对不上同一条无限查询身份，打开后仍像全新请求。

**错误示例：**

```tsx
const feedOptions = queryOptions({
  queryKey: ['tasks', 'feed'],
  queryFn: loadTaskPage,
})
```

**正确写法：**

```tsx
const feedOptions = infiniteQueryOptions({
  queryKey: ['tasks', 'feed'] as const,
  queryFn: ({ pageParam }) => loadTaskPage(pageParam),
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})
```

**验证方式：** 预取和打开都引用 `feedOptions`，打开后请求次数不增加。

### 错误：继续调用 prefetchInfiniteQuery

**触发条件：** 预取写成 `queryClient.prefetchInfiniteQuery(feedOptions)`。

**原因：** 当前主线是 `queryClient.infiniteQuery`。`prefetchInfiniteQuery` 已标记废弃。

**后果：** 课程和现行 API 不一致，后续大版本会删掉这条路径。

**错误示例：**

```tsx
await queryClient.prefetchInfiniteQuery(feedOptions)
```

**正确写法：**

```tsx
await queryClient.infiniteQuery(feedOptions)
```

**验证方式：** 预取后缓存出现现有任务 / 林晓，打开协作流不再加请求次数。

### 错误：把页码写进新的 queryKey

**触发条件：** 加载更多时改成 `queryKey: ['tasks', 'feed', page]`。

**原因：** 无限查询把多页放进同一条缓存的 `data.pages`，不另开 `queryKey`。那是分页查询的做法。

**后果：** 第二页会盖掉首页，列表只剩第二页任务 / 周宁。

**错误示例：**

```tsx
useQuery({
  queryKey: ['tasks', 'feed', page],
  queryFn: () => loadTaskPage(page),
})
```

**正确写法：**

```tsx
const feedQuery = useInfiniteQuery(feedOptions)
void feedQuery.fetchNextPage()
```

**验证方式：** 加载更多后页数为 2，列表同时保留现有任务 / 林晓和第二页任务 / 周宁。

### 错误：正在请求时再点加载更多

**触发条件：** `isFetching` 为 true 时继续调用 `fetchNextPage`。

**原因：** 同一条无限查询同一时刻只能有一次进行中的请求。再调一次可能盖掉后台刷新。

**后果：** 正在重拉的页被打断，列表对不齐。

**错误示例：**

```tsx
<button type="button" onClick={() => void feedQuery.fetchNextPage()}>
  加载更多
</button>
```

**正确写法：**

```tsx
if (feedQuery.hasNextPage && !feedQuery.isFetching) {
  void feedQuery.fetchNextPage()
}
```

**验证方式：** 预取或重拉尚未结束时，加载更多保持禁用。

### 错误：创建后去作废另一套 key

**触发条件：** 写成 `invalidateQueries({ queryKey: ['tasks', 'page'] })`。

**原因：** 更具体或不同前缀的 key 打不到 `['tasks', 'feed']`。无限查询重拉也只发生在被作废的那一条上。

**后果：** 创建已经成功，列表首项仍是现有任务 / 林晓。

**错误示例：**

```tsx
await queryClient.invalidateQueries({
  queryKey: ['tasks', 'page'],
})
```

**正确写法：**

```tsx
await queryClient.invalidateQueries({
  queryKey: feedOptions.queryKey,
})
```

**验证方式：** 创建后请求次数按已打开的页数增加，列表首项变成核对创建任务 / 林晓。
:::

## 七、源码推导与适用场景

1. **官方事实：** `infiniteQueryOptions` 与 `useInfiniteQuery`、`queryClient.infiniteQuery` 共享配置。无限查询默认只预取第一页。`data.pages` 保存已打开的页。`fetchNextPage` 追加新页。正在请求时不要再调一次。mutation 成功后作废相关查询，并 `await` 这次作废。无限查询变 stale 后从第一页按已有页数依次重拉。
2. **源码观察：** 当前实现里 `infiniteQuery` 会标成无限查询，再交给 `query`。`prefetchInfiniteQuery` 已标记废弃。这不是额外的预取选项。
3. **课程推导：** 先预取首页，打开后请求次数不变。加载更多追加第二页。创建后作废同一条 key，已打开的页按序重拉，列表首项变成核对创建任务 / 林晓。
4. **适用边界：** 本课不把 `maxPages`、双向列表、一次预取多页、SSR、持久化或生产级服务端数据中心写成主线。官方示例里的 axios 可换成 `fetch`。

## 八、练习

:::exercise
### 练习目标

**要求：** 声明 `feedOptions`，使用 `infiniteQueryOptions`，`queryKey` 为 `['tasks', 'feed']`，`initialPageParam` 为 `0`，`getNextPageParam` 读取 `nextCursor`。导出 `useTaskFeed`。预取时调用 `queryClient.infiniteQuery(feedOptions)`。再声明 `createTaskOptions` 和 `useCreateTask`，`mutationFn` 用 `fetch` `POST`，非 2xx 时抛出带状态码的 `Error`，`onSuccess` 里 `await invalidateQueries({ queryKey: feedOptions.queryKey })`。加载更多前确认不是 `isFetching`。

**验收：** 预取后打开不再增加请求。加载更多后列表同时包含现有任务 / 林晓和第二页任务 / 周宁。创建成功后列表首项变成核对创建任务 / 林晓。

**参考答案：**

```tsx
import {
  QueryClient,
  QueryClientProvider,
  infiniteQueryOptions,
  mutationOptions,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useState, type ReactElement } from 'react'

type TaskItem = {
  id: string
  title: string
  owner: string
}

type TaskPage = {
  tasks: TaskItem[]
  nextCursor?: number
}

/** 按游标读取一页协作任务。 */
async function loadTaskPage(pageParam: number): Promise<TaskPage> {
  const response = await fetch(`/api/tasks/feed?cursor=${pageParam}`)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskPage
}

/** 创建协作任务。 */
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

const feedOptions = infiniteQueryOptions({
  queryKey: ['tasks', 'feed'] as const,
  queryFn: ({ pageParam }) => loadTaskPage(pageParam),
  initialPageParam: 0,
  getNextPageParam: (lastPage: TaskPage) => lastPage.nextCursor,
  staleTime: Infinity,
  retry: false,
})

const createTaskOptions = mutationOptions({
  mutationFn: createTask,
  retry: false,
})

/** 订阅协作流。 */
export function useTaskFeed() {
  return useInfiniteQuery(feedOptions)
}

/** 创建协作任务后作废同一条无限查询。 */
function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...createTaskOptions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: feedOptions.queryKey,
      })
    },
  })
}

/** 协作内容平台工作区。 */
function CollaborationWorkspace(): ReactElement {
  const feedQuery = useTaskFeed()
  const createMutation = useCreateTask()
  const tasks = feedQuery.data?.pages.flatMap((page) => page.tasks) ?? []

  return (
    <section>
      {tasks.map((task) => (
        <p key={task.id}>
          {task.title} / {task.owner}
        </p>
      ))}
      <button
        type="button"
        disabled={!feedQuery.hasNextPage || feedQuery.isFetching}
        onClick={() => {
          if (feedQuery.hasNextPage && !feedQuery.isFetching) {
            void feedQuery.fetchNextPage()
          }
        }}
      >
        加载更多
      </button>
      <button
        type="button"
        disabled={createMutation.isPending}
        onClick={() => createMutation.mutate()}
      >
        创建协作任务
      </button>
    </section>
  )
}

/** 应用边界只提供一份 QueryClient，并先预取首页再打开观察者。 */
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

  /** 在观察者出现之前预取协作流首页。 */
  async function prefetchFeed(): Promise<void> {
    await queryClient.infiniteQuery(feedOptions)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <button type="button" onClick={() => void prefetchFeed()}>
        预取协作流首页
      </button>
      <button type="button" onClick={() => setOpened(true)}>
        打开协作流
      </button>
      {opened ? <CollaborationWorkspace /> : null}
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- 协作流用 `infiniteQueryOptions` 共置身份和翻页参数。
- 预取首页用 `queryClient.infiniteQuery`，默认只拉第一页。
- 打开后 `useInfiniteQuery` 读同一条缓存。
- 加载更多走 `fetchNextPage`，不要在 `isFetching` 时再调。
- 创建成功后作废同一条无限查询，已打开的页按序重拉。

## 十、参考资料

- [Infinite Queries](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries) - 支持追加新页、hasNextPage 和变 stale 后按序重拉。
- [Prefetching & Router Integration](https://tanstack.com/query/latest/docs/framework/react/guides/prefetching) - 支持无限查询预取，默认只拉第一页。
- [Query Options](https://tanstack.com/query/latest/docs/framework/react/guides/query-options) - 支持无限查询改用 infiniteQueryOptions。
- [infiniteQueryOptions](https://tanstack.com/query/latest/docs/framework/react/reference/functions/infiniteQueryOptions) - 支持在钩子和 infiniteQuery 之间共享配置。
- [Invalidations from Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations) - 支持 mutation 成功后作废相关查询。
- [QueryClient](https://tanstack.com/query/latest/docs/reference/QueryClient) - 支持 infiniteQuery 获取并缓存无限查询。
- [QueryClient source](https://unpkg.com/@tanstack/query-core@5.102.8/src/queryClient.ts) - 支持当前实现把 infiniteQuery 标成无限查询再交给 query。
