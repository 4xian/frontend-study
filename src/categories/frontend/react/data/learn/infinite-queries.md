---
id: react.data.learn.advanced.infinite-queries
type: lesson
title: 无限查询
summary: 用 useInfiniteQuery 把多页追加进同一条缓存，用 initialPageParam 和 getNextPageParam 决定下一页，再调用 fetchNextPage。
domain: frontend
technology: react
module: data
stage: advanced
level: advanced
estimatedMinutes: 45
prerequisites:
  - react.data.learn.intermediate.paginated-queries
  - react.data.learn.basics.query-key
related:
  - react.data.learn.intermediate.query-options-reuse
  - react.data.learn.basics.query-status
  - react.data.learn.intermediate.paginated-content-management
tags:
  - TanStack Query
  - 无限查询
  - useInfiniteQuery
  - fetchNextPage
  - getNextPageParam
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-10
objectives:
  - 能说明无限查询和分页查询的差别：多页追加进同一条缓存，不把页码写进新的 queryKey。
  - 能声明 initialPageParam，并用 queryFn 的 pageParam 去请求当前页。
  - 能用 getNextPageParam 从上一页算出下一页参数，返回 null 或 undefined 时没有下一页。
  - 能在不是 isFetching 时调用 fetchNextPage，并把 data.pages 展平成列表。
  - 能用 hasNextPage 和 isFetchingNextPage 区分还有下一页、正在加载更多、后台刷新。
recap:
  - 无限查询把多页放进同一条缓存的 data.pages，不另开 queryKey。
  - initialPageParam 必填，queryFn 用 pageParam 请求当前页。
  - getNextPageParam 返回非 null / undefined 时 hasNextPage 为 true。
  - 加载更多调用 fetchNextPage；正在请求时不要再调一次。
  - isFetchingNextPage 用来区分加载更多和后台刷新。
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
      - isFetchingNextPage 用来区分后台刷新和加载更多。
      - 正在请求时再调 fetchNextPage 可能覆盖后台刷新，应先确认不是 isFetching。
  - title: InfiniteQueryBehavior source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/infiniteQueryBehavior.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 加载更多时按 direction 取 getNextPageParam，再把新页 append 进 pages。
      - 重新获取时从第一页开始按序请求已有页数。
      - hasNextPage 等于 getNextPageParam 的结果不是 null 也不是 undefined。
---

# 无限查询

## 一、学习目标

- 说明无限查询和分页查询的差别：多页追加进同一条缓存，不把页码写进新的 `queryKey`。
- 声明 `initialPageParam`，并用 `queryFn` 的 `pageParam` 去请求当前页。
- 用 `getNextPageParam` 从上一页算出下一页参数，返回 `null` 或 `undefined` 时没有下一页。
- 在不是 `isFetching` 时调用 `fetchNextPage`，并把 `data.pages` 展平成列表。
- 用 `hasNextPage` 和 `isFetchingNextPage` 区分还有下一页、正在加载更多、后台刷新。

## 二、为什么要学无限查询

分页查询把页码写进 `queryKey`。翻到第二页时，第一页是另一条查询。无限列表不是换页，而是把新页追加到已经看到的集合后面。

林晓的任务按游标返回。首页是现有任务，下一页是周宁的第二页任务。点「加载更多」后，两条应同时出现，而不是只剩第二页。

`useInfiniteQuery` 用同一条 `queryKey` 保存 `{ pages, pageParams }`。第一页参数来自 `initialPageParam`。下一页参数来自 `getNextPageParam`。本课只讲单向加载更多，不讲双向列表、`maxPages` 或内存裁剪。

## 三、核心概念

### 1. 多页在同一条缓存里

```tsx
const taskQuery = useInfiniteQuery({
  queryKey: ['tasks'],
  queryFn: ({ pageParam }) => loadTaskPage(pageParam),
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})
```

`data.pages` 是已经拿到的各页。`data.pageParams` 是请求这些页时用过的参数。界面把 `pages` 展平后渲染。

### 2. 下一页参数决定还有没有更多

`getNextPageParam` 拿到上一页对象。返回数字或游标时，`hasNextPage` 为 true。返回 `null` 或 `undefined` 时没有下一页。

`queryFn` 不要自己去算下一页。当前页参数已经在 `pageParam` 里。

### 3. 加载更多不要叠请求

同一条无限查询同一时刻只能有一次进行中的请求。正在 `isFetching` 时再调 `fetchNextPage`，可能盖掉后台刷新。

```tsx
<button
  type="button"
  disabled={!taskQuery.hasNextPage || taskQuery.isFetching}
  onClick={() => {
    if (taskQuery.hasNextPage && !taskQuery.isFetching) {
      void taskQuery.fetchNextPage()
    }
  }}
>
  加载更多
</button>
```

`isFetchingNextPage` 为 true 时，是在追加下一页，不是整表后台刷新。

## 四、用法与示例

### 1. 按游标读取并追加

```tsx
import { useInfiniteQuery } from '@tanstack/react-query'

type TaskItem = {
  id: string
  title: string
  owner: string
}

type TaskPage = {
  tasks: TaskItem[]
  nextCursor?: number
}

/** 按游标读取一页任务，非 2xx 时抛出带状态码的 Error。 */
async function loadTaskPage(pageParam: number): Promise<TaskPage> {
  const response = await fetch(`/api/tasks?cursor=${pageParam}`)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskPage
}

function TaskFeed() {
  const taskQuery = useInfiniteQuery({
    queryKey: ['tasks'],
    queryFn: ({ pageParam }) => loadTaskPage(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    retry: false,
  })

  const tasks = taskQuery.data?.pages.flatMap((page) => page.tasks) ?? []

  return (
    <section>
      {taskQuery.isPending ? <p>正在读取任务。</p> : null}
      {taskQuery.isSuccess
        ? tasks.map((task) => (
            <p key={task.id}>
              {task.title} / {task.owner}
            </p>
          ))
        : null}
      <button
        type="button"
        disabled={!taskQuery.hasNextPage || taskQuery.isFetching}
        onClick={() => {
          if (taskQuery.hasNextPage && !taskQuery.isFetching) {
            void taskQuery.fetchNextPage()
          }
        }}
      >
        {taskQuery.isFetchingNextPage ? '正在加载更多' : '加载更多'}
      </button>
    </section>
  )
}
```

首页用 `initialPageParam: 0`。第一页返回 `nextCursor: 1` 时可以再加载。第二页没有 `nextCursor` 时按钮禁用。

### 2. 重新获取从第一页按序重来

无限查询变 stale 后，会从第一页开始按已有页数依次重拉。这样不会拿着过期游标跳页或重复。缓存被清掉后，只剩初始页，分页从头开始。

本课 Demo 把 `staleTime` 设成 `Infinity`，用来看清加载更多，而不是后台整表重拉。

## 五、用法示例：对照首页和加载更多

下面的 Demo 用 `useInfiniteQuery` 订阅 `['tasks']`，`initialPageParam` 为 `0`，`staleTime` 为 `Infinity`。首页是林晓的现有任务，还有下一页。点「加载更多」后追加周宁的第二页任务，页数为 2，还有下一页变为否。离开页面会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.advanced.infinite-queries.infinite-queries-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：把页码写进新的 queryKey

**触发条件：** 写成 `queryKey: ['tasks', page]`，再用 `useQuery` 翻页。

**原因：** 分页查询每页是独立缓存。无限列表要把新页追加到同一条 `data.pages`。

**后果：** 加载更多后只看到第二页，第一页从画面上消失。

**错误示例：**

```tsx
useQuery({
  queryKey: ['tasks', page],
  queryFn: () => loadTaskPage(page),
})
```

**正确写法：**

```tsx
useInfiniteQuery({
  queryKey: ['tasks'],
  queryFn: ({ pageParam }) => loadTaskPage(pageParam),
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})
```

**验证方式：** 加载更多后列表同时出现现有任务和第二页任务。

### 错误：不写 initialPageParam

**触发条件：** 只写 `queryFn` 和 `getNextPageParam`。

**原因：** 无限查询必须知道第一页参数。官方把 `initialPageParam` 标成必填。

**后果：** 类型报错，或第一页 `pageParam` 为 `undefined`，请求发到错误地址。

**错误示例：**

```tsx
useInfiniteQuery({
  queryKey: ['tasks'],
  queryFn: ({ pageParam }) => loadTaskPage(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})
```

**正确写法：**

```tsx
useInfiniteQuery({
  queryKey: ['tasks'],
  queryFn: ({ pageParam }) => loadTaskPage(pageParam),
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})
```

**验证方式：** 首页自动出现林晓的现有任务，请求次数先增加一次。

### 错误：getNextPageParam 在没有更多时仍返回 0

**触发条件：** `return lastPage.nextCursor ?? 0`。

**原因：** `hasNextPage` 只把 `null` 和 `undefined` 当成没有下一页。`0` 是有效参数。

**后果：** 第二页结束后按钮仍可点，继续请求空页。

**错误示例：**

```tsx
getNextPageParam: (lastPage) => lastPage.nextCursor ?? 0,
```

**正确写法：**

```tsx
getNextPageParam: (lastPage) => lastPage.nextCursor,
```

**验证方式：** 第二页出现后，还有下一页为否，加载更多不可点。

### 错误：isFetching 时仍然 fetchNextPage

**触发条件：** 滚动到底就调用 `fetchNextPage()`，不看 `isFetching`。

**原因：** 同一条无限查询同时只能有一次请求。官方要求先确认不是 `isFetching`。

**后果：** 加载更多盖掉正在进行的刷新，页数据被覆盖。

**错误示例：**

```tsx
onEndReached={() => {
  void taskQuery.fetchNextPage()
}}
```

**正确写法：**

```tsx
onEndReached={() => {
  if (taskQuery.hasNextPage && !taskQuery.isFetching) {
    void taskQuery.fetchNextPage()
  }
}}
```

**验证方式：** 点加载更多后按钮不可点，直到第二页出现。

### 错误：只渲染最后一页

**触发条件：** `data.pages.at(-1).tasks.map(...)`。

**原因：** 无限查询的数据是全部页的数组。只取最后一页就丢掉已经追加的内容。

**后果：** 加载更多后现有任务消失，只剩第二页任务。

**错误示例：**

```tsx
data.pages.at(-1)?.tasks.map((task) => <p key={task.id}>{task.title}</p>)
```

**正确写法：**

```tsx
data.pages.flatMap((page) => page.tasks).map((task) => (
  <p key={task.id}>{task.title}</p>
))
```

**验证方式：** 加载更多后列表里同时有现有任务和第二页任务。
:::

## 七、源码推导与适用场景

1. **官方事实：** `useInfiniteQuery` 的 `data` 含 `pages` 和 `pageParams`。`initialPageParam` 必填。`getNextPageParam` 返回非 `null` / `undefined` 时 `hasNextPage` 为 true。加载更多调用 `fetchNextPage`。正在 `isFetching` 时不要再调。重新获取从第一页按序重拉已有页。
2. **课程推导：** 任务列表用游标 `0` 开首页。上一页带 `nextCursor` 时才能加载更多。界面展平 `pages`，用 `hasNextPage` 和 `isFetching` 控制按钮。
3. **适用边界：** 本课不把双向列表、`maxPages`、内存裁剪、分页 `queryKey` 或无限查询预取写成主线。

## 八、练习

:::exercise
### 练习目标

**要求：** 用 `useInfiniteQuery` 声明 `queryKey: ['tasks']`。`queryFn` 从 `{ pageParam }` 调 `fetch`，非 2xx 时抛出带状态码的 `Error`。`initialPageParam` 为 `0`。`getNextPageParam` 返回 `lastPage.nextCursor`。界面展平 `data.pages`。加载更多按钮在没有下一页或 `isFetching` 时禁用。

**验收：** 首页显示林晓的现有任务。加载更多后同时出现第二页任务。没有 `nextCursor` 后按钮不可点。

**参考答案：**

```tsx
import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
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

/** 按游标读取一页任务。 */
async function loadTaskPage(pageParam: number): Promise<TaskPage> {
  const response = await fetch(`/api/tasks?cursor=${pageParam}`)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskPage
}

/** 无限任务列表。 */
function TaskFeed(): ReactElement {
  const taskQuery = useInfiniteQuery({
    queryKey: ['tasks'],
    queryFn: ({ pageParam }) => loadTaskPage(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    retry: false,
  })
  const tasks = taskQuery.data?.pages.flatMap((page) => page.tasks) ?? []

  return (
    <section>
      {taskQuery.isPending ? <p>正在读取任务。</p> : null}
      {taskQuery.isSuccess
        ? tasks.map((task) => (
            <p key={task.id}>
              {task.title} / {task.owner}
            </p>
          ))
        : null}
      <button
        type="button"
        disabled={!taskQuery.hasNextPage || taskQuery.isFetching}
        onClick={() => {
          if (taskQuery.hasNextPage && !taskQuery.isFetching) {
            void taskQuery.fetchNextPage()
          }
        }}
      >
        加载更多
      </button>
    </section>
  )
}

/** 提供稳定客户端，避免查询观察丢失。 */
export function App(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <TaskFeed />
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- 无限查询把多页追加进同一条 `data.pages`。
- `initialPageParam` 决定首页，`getNextPageParam` 决定还有没有下一页。
- 加载更多调用 `fetchNextPage`，先确认不是 `isFetching`。
- 界面展平全部页，不要只渲染最后一页。
- 本课不展开双向列表或 `maxPages`。

## 十、参考资料

- [Infinite Queries](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries) - 支持用 useInfiniteQuery 追加多页。
- [InfiniteQueryBehavior source](https://unpkg.com/@tanstack/query-core@5.102.8/src/infiniteQueryBehavior.ts) - 支持加载更多按 getNextPageParam 追加，并按序重拉已有页。
