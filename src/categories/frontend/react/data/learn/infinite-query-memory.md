---
id: react.data.learn.advanced.infinite-query-memory
type: lesson
title: 无限查询内存控制
summary: 用 maxPages 限制无限查询保留的页数，超过上限时丢掉最旧一页，重新获取时只重拉还留着的页。
domain: frontend
technology: react
module: data
stage: advanced
level: advanced
estimatedMinutes: 45
prerequisites:
  - react.data.learn.advanced.infinite-queries
related:
  - react.data.learn.intermediate.paginated-queries
  - react.data.learn.basics.query-cache-and-sharing
  - react.data.learn.basics.cache-lifecycle-and-gctime
tags:
  - TanStack Query
  - 无限查询内存控制
  - maxPages
  - useInfiniteQuery
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-10
objectives:
  - 能说明页数很多时，无限查询会占内存，重新获取也会按序重拉全部已有页。
  - 能把 maxPages 设成有限数字，只在缓存里保留这么多页。
  - 能同时提供 getNextPageParam 和 getPreviousPageParam，让被丢掉的方向以后还能再取。
  - 能说明向前追加超过上限时，最旧的一页会从 pages 和 pageParams 里一起去掉。
  - 能说明重新获取时只按序重拉还留着的那些页。
recap:
  - maxPages 限制无限查询在缓存里保留的页数。
  - 向前追加超过上限时丢掉最旧一页，pageParams 一起裁。
  - 官方要求同时提供 getNextPageParam 和 getPreviousPageParam。
  - 重新获取时只按序重拉还留着的页，不会重拉已经丢掉的首页。
  - 本课不把双向滚动界面写成主线。
sources:
  - title: Infinite Queries
    url: https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 页数很多时可用 maxPages 限制缓存在 data.pages 里保留的页数。
      - 这样做能降低内存占用，重新获取时也只按序重拉还留着的页。
      - Limited Infinite Query 要同时提供 getNextPageParam 和 getPreviousPageParam。
      - 示例把 maxPages 设成 3 时，缓存里只留 3 页。
  - title: InfiniteQueryBehavior source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/infiniteQueryBehavior.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 追加新页时把 maxPages 传给 addToEnd 或 addToStart。
      - pages 和 pageParams 使用同一套裁剪。
  - title: addToEnd source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/utils.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - addToEnd 先把新页接到末尾。
      - max 大于 0 且长度超过上限时，丢掉数组最前面一项。
---

# 无限查询内存控制

## 一、学习目标

- 说明页数很多时，无限查询会占内存，重新获取也会按序重拉全部已有页。
- 把 `maxPages` 设成有限数字，只在缓存里保留这么多页。
- 同时提供 `getNextPageParam` 和 `getPreviousPageParam`，让被丢掉的方向以后还能再取。
- 说明向前追加超过上限时，最旧的一页会从 `pages` 和 `pageParams` 里一起去掉。
- 说明重新获取时只按序重拉还留着的那些页。

## 二、为什么要控制无限查询占用的页数

上一课已经能把新页追加进同一条缓存。一直点「加载更多」，`data.pages` 会一直变长。重新获取时，库会从第一页开始按已有页数依次重拉。页数到几十时，内存和网络都会被拖住。

官方把这种限制叫做 Limited Infinite Query。把 `maxPages` 设成 `2` 后，缓存里最多留两页。再追加第三页时，最旧的林晓现有任务会从列表里消失，只留下周宁和陈夏。

本课只讲 `maxPages` 如何裁页。不把双向滚动按钮、手动 `setQueryData` 删页或 SSR 写成主线。

## 三、核心概念

### 1. maxPages 限制保留的页数

```tsx
const taskQuery = useInfiniteQuery({
  queryKey: ['tasks'],
  queryFn: ({ pageParam }) => loadTaskPage(pageParam),
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  getPreviousPageParam: (firstPage) => firstPage.prevCursor,
  maxPages: 2,
})
```

`maxPages` 是缓存里允许留下的最大页数，不是接口一共有多少页。首页和第一次加载更多后是两页；第二次加载更多时仍然是两页，只是内容换成更新的两页。

### 2. 两个方向的 pageParam 都要提供

官方要求 Limited Infinite Query 同时写 `getNextPageParam` 和 `getPreviousPageParam`。最旧一页被丢掉后，如果以后还要从那一头再取，必须能算出上一页参数。

本课界面仍然只提供「加载更多」。`getPreviousPageParam` 是给裁页后的缓存准备的，不是本课的双向滚动主线。

### 3. 超过上限时丢掉最旧一页

源码里向前追加走 `addToEnd`。新页先接到末尾；长度超过 `maxPages` 时，丢掉数组最前面一项。`pageParams` 用同一套裁剪，避免页数据和页参数错位。

重新获取时，只按还留着的 `pageParams` 从当前第一页按序重拉，不会去重拉已经丢掉的首页。

## 四、用法与示例

### 1. 限制只留两页

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
  prevCursor?: number
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
    getPreviousPageParam: (firstPage) => firstPage.prevCursor,
    maxPages: 2,
    retry: false,
  })

  const tasks = taskQuery.data?.pages.flatMap((page) => page.tasks) ?? []

  return (
    <section>
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
```

首页是林晓。第一次加载更多后仍能看到现有任务和第二页任务。再加载一次后，现有任务被裁掉，只留第二页任务和第三页任务。

### 2. 重新获取只覆盖还留着的页

无限查询变 stale 后，会按当前 `pages.length` 从留下的第一页开始按序重拉。`maxPages` 为 `2` 时，最多重拉两页，不会把已经丢掉的首页再请求回来。

本课 Demo 把 `staleTime` 设成 `Infinity`，用来看清裁页，而不是后台整表重拉。

## 五、用法示例：对照超过上限后丢掉最旧页

下面的 Demo 用 `useInfiniteQuery` 订阅 `['tasks']`，`maxPages` 为 `2`，`staleTime` 为 `Infinity`。首页是林晓的现有任务。第一次「加载更多」后同时出现周宁的第二页任务。再点一次后页数仍是 2，现有任务消失，列表只留第二页任务和陈夏的第三页任务。离开页面会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.advanced.infinite-query-memory.infinite-query-memory-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：只写 getNextPageParam 就设 maxPages

**触发条件：** `maxPages: 2`，不写 `getPreviousPageParam`。

**原因：** 官方 Limited Infinite Query 要两个方向的参数函数都在，被裁掉的那一头以后才能再取。

**后果：** 最旧页被丢掉后，无法再算出上一页参数，缓存缺口补不回来。

**错误示例：**

```tsx
useInfiniteQuery({
  queryKey: ['tasks'],
  queryFn: ({ pageParam }) => loadTaskPage(pageParam),
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  maxPages: 2,
})
```

**正确写法：**

```tsx
useInfiniteQuery({
  queryKey: ['tasks'],
  queryFn: ({ pageParam }) => loadTaskPage(pageParam),
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  getPreviousPageParam: (firstPage) => firstPage.prevCursor,
  maxPages: 2,
})
```

**验证方式：** 第二次加载更多后页数仍为 2，首条变成第二页任务。

### 错误：把 maxPages 当成接口总页数

**触发条件：** 接口一共 3 页，于是写成 `maxPages: 3`，期望第三页之后按钮禁用。

**原因：** `maxPages` 限制的是缓存长度。还有没有下一页仍由 `getNextPageParam` 决定。

**后果：** 第三页之后如果仍返回游标，按钮不会停；缓存也只是继续滑动窗口，不是停在最后一页。

**错误示例：**

```tsx
maxPages: 3,
getNextPageParam: () => 1,
```

**正确写法：**

```tsx
maxPages: 2,
getNextPageParam: (lastPage) => lastPage.nextCursor,
```

**验证方式：** 第三页没有 `nextCursor` 后，还有下一页为否；缓存页数最多是 2。

### 错误：超过上限后以为首页还在 pages[0]

**触发条件：** 渲染时写死 `data.pages[0]` 一定是林晓。

**原因：** `addToEnd` 超限会 `slice(1)`，最旧页连同它的 `pageParam` 一起去掉。

**后果：** 第二次加载更多后仍去显示现有任务，和缓存对不上。

**错误示例：**

```tsx
<p>{data.pages[0].tasks[0].title}</p>
```

**正确写法：**

```tsx
const tasks = data.pages.flatMap((page) => page.tasks)
<p>{tasks[0]?.title}</p>
```

**验证方式：** 再点一次加载更多后，首条标题变成第二页任务，列表里没有现有任务。

### 错误：手动 setQueryData 只裁 pages 不裁 pageParams

**触发条件：** `setQueryData(['tasks'], (data) => ({ pages: data.pages.slice(-2), pageParams: data.pageParams }))`。

**原因：** 官方要求 `pages` 和 `pageParams` 始终保持同一结构。源码追加时也是成对裁剪。

**后果：** 页数据和页参数错位，下一次 `fetchNextPage` 用错游标。

**错误示例：**

```tsx
queryClient.setQueryData(['tasks'], (data) => ({
  pages: data.pages.slice(-2),
  pageParams: data.pageParams,
}))
```

**正确写法：**

```tsx
queryClient.setQueryData(['tasks'], (data) => ({
  pages: data.pages.slice(-2),
  pageParams: data.pageParams.slice(-2),
}))
```

**验证方式：** 页数和页参数个数始终相同。本课优先用 `maxPages` 自动裁，不手写这套更新。

### 错误：用分页 queryKey 去限制页数

**触发条件：** 写成 `queryKey: ['tasks', page]`，再自己删掉旧页的查询。

**原因：** 无限查询的内存问题出在同一条缓存的 `pages` 数组，不是多条分页查询。

**后果：** 加载更多后变成换页，旧页从画面消失的方式也和 `maxPages` 不同。

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
  getPreviousPageParam: (firstPage) => firstPage.prevCursor,
  maxPages: 2,
})
```

**验证方式：** 第二次加载更多后仍是同一条 `['tasks']`，页数为 2，首条不再是现有任务。
:::

## 七、源码推导与适用场景

1. **官方事实：** 页数很多时用 `maxPages` 限制 `data.pages`。Limited Infinite Query 要同时提供 `getNextPageParam` 和 `getPreviousPageParam`。重新获取只按序重拉还留着的页。源码向前追加时 `addToEnd` 超限会丢掉最前面一项，`pageParams` 同步裁剪。
2. **课程推导：** 任务列表把 `maxPages` 设成 `2`。第二次加载更多后，林晓的现有任务被裁掉，只留周宁和陈夏。界面仍只提供加载更多。
3. **适用边界：** 本课不把双向滚动按钮、手动删页、分页 `queryKey` 或 SSR 写成主线。

## 八、练习

:::exercise
### 练习目标

**要求：** 用 `useInfiniteQuery` 声明 `queryKey: ['tasks']`。`queryFn` 从 `{ pageParam }` 调 `fetch`，非 2xx 时抛出带状态码的 `Error`。`initialPageParam` 为 `0`。`getNextPageParam` 返回 `lastPage.nextCursor`。`getPreviousPageParam` 返回 `firstPage.prevCursor`。`maxPages` 为 `2`。界面展平 `data.pages`。加载更多按钮在没有下一页或 `isFetching` 时禁用。

**验收：** 首页显示林晓。第一次加载更多后同时出现第二页。再加载一次后页数仍为 2，现有任务消失，列表留下第二页任务和第三页任务。

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
  prevCursor?: number
}

/** 按游标读取一页任务。 */
async function loadTaskPage(pageParam: number): Promise<TaskPage> {
  const response = await fetch(`/api/tasks?cursor=${pageParam}`)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskPage
}

/** 限制只留两页的任务列表。 */
function TaskFeed(): ReactElement {
  const taskQuery = useInfiniteQuery({
    queryKey: ['tasks'],
    queryFn: ({ pageParam }) => loadTaskPage(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    getPreviousPageParam: (firstPage) => firstPage.prevCursor,
    maxPages: 2,
    retry: false,
  })
  const tasks = taskQuery.data?.pages.flatMap((page) => page.tasks) ?? []

  return (
    <section>
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

- `maxPages` 限制无限查询在缓存里保留的页数。
- 向前追加超过上限时丢掉最旧一页，`pageParams` 一起裁。
- Limited Infinite Query 要同时提供两个方向的 pageParam 函数。
- 重新获取只重拉还留着的页。
- 本课不展开双向滚动界面。

## 十、参考资料

- [Infinite Queries](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries) - 支持用 maxPages 限制无限查询保留的页数。
- [InfiniteQueryBehavior source](https://unpkg.com/@tanstack/query-core@5.102.8/src/infiniteQueryBehavior.ts) - 支持追加新页时把 maxPages 传给裁剪函数。
- [addToEnd source](https://unpkg.com/@tanstack/query-core@5.102.8/src/utils.ts) - 支持超限时丢掉最前面一项。
