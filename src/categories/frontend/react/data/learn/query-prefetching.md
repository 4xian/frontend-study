---
id: react.data.learn.advanced.query-prefetching
type: lesson
title: 查询预取
summary: 在真正观察详情之前，用 queryClient.query 把结果放进缓存，让随后的 useQuery 直接读缓存。
domain: frontend
technology: react
module: data
stage: advanced
level: advanced
estimatedMinutes: 45
prerequisites:
  - react.data.learn.basics.first-use-query
  - react.data.learn.basics.query-cache-and-sharing
  - react.data.learn.basics.stale-time-and-freshness
related:
  - react.data.learn.basics.article-list-and-detail
  - react.data.learn.basics.query-client-and-provider
  - react.data.learn.basics.query-status
tags:
  - TanStack Query
  - 查询预取
  - queryClient.query
  - staleTime
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-11
objectives:
  - 能说明预取是在观察者出现之前，先把查询结果放进同一条缓存。
  - 能在事件处理里调用 queryClient.query，用 queryKey 和 queryFn 预取详情。
  - 能对非关键预取使用 catch 吞掉错误，把真正的失败交给之后的 useQuery。
  - 能给这次预取单独设 staleTime，并说明 useQuery 还要自己设一份。
  - 能说明没有观察者时，预取结果会按 gcTime 被清掉。
recap:
  - 预取用 queryClient.query 把结果提前放进缓存。
  - 非关键预取用 catch 吞掉错误，之后的 useQuery 会再请求。
  - 预取时的 staleTime 只约束这一次拉取，useQuery 还要自己设。
  - 没有观察者时，预取结果会按 gcTime 被清掉。
  - 本课不把路由集成、请求瀑布或 Suspense 预取写成主线。
sources:
  - title: Prefetching & Router Integration
    url: https://tanstack.com/query/latest/docs/framework/react/guides/prefetching
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 提前把数据放进缓存，能让之后真正需要时更快出现。
      - 预取使用 query 方法，它会运行 queryFn、缓存结果并返回数据，出错时抛出。
      - 非关键预取可以丢掉 Promise，并用 catch 吞掉错误，之后的 useQuery 通常会再请求。
      - 预取传入的 staleTime 只用于这一次拉取，useQuery 仍要自己设置。
      - 如果没有 useQuery 观察这条预取，结果会在 gcTime 后被回收。
      - 已经有同步数据时用 setQueryData，不必再预取。
  - title: QueryClient
    url: https://tanstack.com/query/latest/docs/framework/react/reference/classes/QueryClient
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - query 按这次传入的 staleTime 判断要不要重新请求。
      - prefetchQuery 已标记废弃，应改用 query，并用 catch 吞掉错误。
  - title: QueryClient source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/queryClient.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - query 在判定为 stale 时才 fetch，否则直接返回已有 data。
      - prefetchQuery 内部是 fetchQuery 之后再吞掉结果和错误。
---

# 查询预取

## 一、学习目标

- 说明预取是在观察者出现之前，先把查询结果放进同一条缓存。
- 在事件处理里调用 `queryClient.query`，用 `queryKey` 和 `queryFn` 预取详情。
- 对非关键预取使用 `catch` 吞掉错误，把真正的失败交给之后的 `useQuery`。
- 给这次预取单独设 `staleTime`，并说明 `useQuery` 还要自己设一份。
- 说明没有观察者时，预取结果会按 `gcTime` 被清掉。

## 二、为什么要在观察之前先请求

列表已经显示林晓的现有任务。点进详情时，如果这时才挂 `useQuery`，画面会先进入等待，再过一轮网络。

如果在点「查看详情」之前就用同一组 `queryKey: ['tasks', 'detail', 't-1']` 把结果放进缓存，随后的观察者会直接读到林晓，不再发第二次请求。

官方把这种做法叫做预取。本课只讲事件里的预取。不把路由 Loader、请求瀑布拆分或 Suspense 预取写成主线。

## 三、核心概念

### 1. 预取写入的是同一条 queryKey

```tsx
await queryClient.query({
  queryKey: ['tasks', 'detail', 't-1'],
  queryFn: () => loadTaskDetail('t-1'),
  staleTime: 60_000,
})
```

`query` 会运行 `queryFn`、把结果放进 `QueryCache`，并返回这份数据。之后的 `useQuery` 只要使用同一组 `queryKey`，读的就是这条缓存，不是另一份详情。

### 2. 非关键预取要吞掉错误

预取出错时，`query` 会抛出。详情还没被观察，这时把错误抛到事件处理里没有界面可接。官方做法是丢掉 Promise，并用 `catch(noop)` 吞掉错误。真正打开详情后，`useQuery` 会再请求一次，把失败交给查询状态。

### 3. 预取的 staleTime 只管这一次

预取传入的 `staleTime` 只决定这次要不要打网络。缓存里已经有一份未过期的详情时，再点「预取详情」不会加请求次数。`useQuery` 仍要自己写 `staleTime`。本课 Demo 把观察者的 `staleTime` 设成 `Infinity`，用来看清「预取后再查看不会加请求」。

没有观察者时，这条预取仍会按 `gcTime` 回收。预取不是永久保存。

## 四、用法与示例

### 1. 在事件里预取详情

```tsx
import { noop, useQueryClient } from '@tanstack/react-query'

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

function TaskBoard() {
  const queryClient = useQueryClient()

  /** 在点击时预取详情，错误交给之后的 useQuery。 */
  function prefetchDetail(): void {
    void queryClient
      .query({
        queryKey: ['tasks', 'detail', 't-1'],
        queryFn: () => loadTaskDetail('t-1'),
        staleTime: 60_000,
      })
      .catch(noop)
  }

  return (
    <section>
      <button type="button" onClick={prefetchDetail}>
        预取详情
      </button>
    </section>
  )
}
```

列表仍只订阅 `['tasks']`。预取写入 `['tasks', 'detail', 't-1']`。点「查看详情」后再挂观察者，请求次数不会因为这次查看再加一。

### 2. 已经有同步数据时不要假装预取

手里已经有林晓这条对象时，调用 `queryClient.setQueryData(['tasks', 'detail', 't-1'], task)` 即可。那是把已知结果写进缓存，不是预取。预取仍然要走 `queryFn`。

## 五、用法示例：对照预取后再查看详情

下面的 Demo 用 `useQuery` 订阅 `['tasks']`，首页是林晓的现有任务。点「预取详情」后，`['tasks', 'detail', 't-1']` 会出现缓存，请求次数加一。再点「查看详情」时画面直接给出现有任务，请求次数不再增加。离开页面会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.advanced.query-prefetching.query-prefetching-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：继续调用已经废弃的 prefetchQuery

**触发条件：** 写成 `queryClient.prefetchQuery({ queryKey, queryFn })`。

**原因：** 当前稳定版把 `prefetchQuery` 标成废弃，官方预取指南改用 `query`。

**后果：** 预取行为还能跑，但会踩废弃 API，下个大版本会被删掉。

**错误示例：**

```tsx
await queryClient.prefetchQuery({
  queryKey: ['tasks', 'detail', 't-1'],
  queryFn: () => loadTaskDetail('t-1'),
})
```

**正确写法：**

```tsx
void queryClient
  .query({
    queryKey: ['tasks', 'detail', 't-1'],
    queryFn: () => loadTaskDetail('t-1'),
    staleTime: 60_000,
  })
  .catch(noop)
```

**验证方式：** 预取后详情已缓存为是，查看详情时请求次数不再增加。

### 错误：预取出错时没有吞掉错误

**触发条件：** `await queryClient.query(...)` 写在点击处理里，详情接口失败。

**原因：** `query` 默认会抛出。预取还没有对应的查询错误界面。

**后果：** 事件处理变成未捕获异常，列表页面被打断，随后的 `useQuery` 也接不到这次失败。

**错误示例：**

```tsx
await queryClient.query({
  queryKey: ['tasks', 'detail', 't-1'],
  queryFn: () => loadTaskDetail('t-1'),
})
```

**正确写法：**

```tsx
void queryClient
  .query({
    queryKey: ['tasks', 'detail', 't-1'],
    queryFn: () => loadTaskDetail('t-1'),
    staleTime: 60_000,
  })
  .catch(noop)
```

**验证方式：** 预取失败时列表仍在，打开详情后由 `useQuery` 显示错误。

### 错误：预取不设 staleTime，缓存里已有详情仍再打网络

**触发条件：** 详情刚预取完，再次点「预取详情」，`query` 不传 `staleTime`。

**原因：** 这次拉取用的是调用处传入的 `staleTime`。默认把已有数据当成 stale，会再请求。

**后果：** 预取按钮变成重复刷新，请求次数被无意义地推高。

**错误示例：**

```tsx
void queryClient
  .query({
    queryKey: ['tasks', 'detail', 't-1'],
    queryFn: () => loadTaskDetail('t-1'),
  })
  .catch(noop)
```

**正确写法：**

```tsx
void queryClient
  .query({
    queryKey: ['tasks', 'detail', 't-1'],
    queryFn: () => loadTaskDetail('t-1'),
    staleTime: 60_000,
  })
  .catch(noop)
```

**验证方式：** 详情已缓存后再点预取，请求次数保持不变。

### 错误：只给预取设 staleTime，观察者仍按默认立刻过期

**触发条件：** 预取写了 `staleTime: 60_000`，`useQuery` 不写 `staleTime`。

**原因：** 预取的 `staleTime` 只约束这一次 `query` 调用，不会改观察者的新鲜度。

**后果：** 打开详情时观察者认为数据已过期，又发一次请求，预取看起来像没生效。

**错误示例：**

```tsx
useQuery({
  queryKey: ['tasks', 'detail', 't-1'],
  queryFn: () => loadTaskDetail('t-1'),
})
```

**正确写法：**

```tsx
useQuery({
  queryKey: ['tasks', 'detail', 't-1'],
  queryFn: () => loadTaskDetail('t-1'),
  staleTime: Infinity,
  retry: false,
})
```

**验证方式：** 预取后再查看详情，详情等待中为否，请求次数不增加。

### 错误：用 setQueryData 代替还没拿到的预取

**触发条件：** 详情还在服务器上，却写 `setQueryData(['tasks', 'detail', 't-1'], undefined)` 或手填空对象。

**原因：** `setQueryData` 只适合已经同步持有的数据。预取必须跑 `queryFn`。

**后果：** 缓存里出现假详情，观察者显示「无」，真正的请求被跳过。

**错误示例：**

```tsx
queryClient.setQueryData(['tasks', 'detail', 't-1'], {
  id: 't-1',
  title: '无',
  owner: '无',
})
```

**正确写法：**

```tsx
void queryClient
  .query({
    queryKey: ['tasks', 'detail', 't-1'],
    queryFn: () => loadTaskDetail('t-1'),
    staleTime: 60_000,
  })
  .catch(noop)
```

**验证方式：** 预取结束后缓存标题是现有任务，不是「无」。
:::

## 七、源码推导与适用场景

1. **官方事实：** 预取用 `query` 运行 `queryFn` 并写入缓存。非关键预取用 `catch` 吞掉错误。这次传入的 `staleTime` 只约束当前拉取。没有观察者时按 `gcTime` 回收。`prefetchQuery` 在当前源码里已标记废弃，内部是 `fetchQuery` 后再吞掉结果。
2. **课程推导：** 任务详情在查看前先预取。预取成功后，查看详情不再增加请求次数，画面也不进入等待。
3. **适用边界：** 本课不把路由集成、请求瀑布、无限查询多页预取或 Suspense 预取写成主线。

## 八、练习

:::exercise
### 练习目标

**要求：** 用 `queryClient.query` 预取 `queryKey: ['tasks', 'detail', 't-1']`。`queryFn` 调 `fetch`，非 2xx 时抛出带状态码的 `Error`。预取传入 `staleTime: 60_000`，并用 `catch(noop)` 吞掉错误。查看详情时再用 `useQuery` 订阅同一组 key，`staleTime` 为 `Infinity`，`retry` 为 `false`。

**验收：** 列表先显示林晓的现有任务。预取后详情已缓存为是，缓存标题为现有任务。再查看详情时请求次数不增加，画面直接给出现有任务 / 林晓。

**参考答案：**

```tsx
import {
  QueryClient,
  QueryClientProvider,
  noop,
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
async function loadTaskDetail(taskId: string): Promise<TaskItem> {
  const response = await fetch(`/api/tasks/${taskId}`)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

/** 在查看前预取详情。 */
function TaskBoard(): ReactElement {
  const queryClient = useQueryClient()
  const [showDetail, setShowDetail] = useState(false)

  /** 预取详情并吞掉这次错误。 */
  function prefetchDetail(): void {
    void queryClient
      .query({
        queryKey: ['tasks', 'detail', 't-1'],
        queryFn: () => loadTaskDetail('t-1'),
        staleTime: 60_000,
      })
      .catch(noop)
  }

  return (
    <section>
      <button type="button" onClick={prefetchDetail}>
        预取详情
      </button>
      <button type="button" onClick={() => setShowDetail(true)}>
        查看详情
      </button>
      {showDetail ? <TaskDetail /> : null}
    </section>
  )
}

/** 观察已经预取或即将请求的详情。 */
function TaskDetail(): ReactElement {
  const detailQuery = useQuery({
    queryKey: ['tasks', 'detail', 't-1'],
    queryFn: () => loadTaskDetail('t-1'),
    staleTime: Infinity,
    retry: false,
  })
  if (!detailQuery.isSuccess) {
    return <p>正在读取详情。</p>
  }
  return (
    <p>
      {detailQuery.data.title} / {detailQuery.data.owner}
    </p>
  )
}

/** 提供稳定客户端，避免查询观察丢失。 */
export function App(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <TaskBoard />
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- 预取在观察者出现前把结果写入同一条 `queryKey`。
- 事件里调用 `queryClient.query`，非关键预取用 `catch` 吞掉错误。
- 预取的 `staleTime` 只管这一次，`useQuery` 还要自己设。
- 没有观察者时，预取结果仍会按 `gcTime` 回收。
- 本课不展开路由集成或 Suspense 预取。

## 十、参考资料

- [Prefetching & Router Integration](https://tanstack.com/query/latest/docs/framework/react/guides/prefetching) - 支持用 query 在观察之前把数据放进缓存。
- [QueryClient](https://tanstack.com/query/latest/docs/framework/react/reference/classes/QueryClient) - 支持用 query 拉取并缓存，prefetchQuery 已标记废弃。
- [QueryClient source](https://unpkg.com/@tanstack/query-core@5.102.8/src/queryClient.ts) - 支持 query 按 staleTime 决定是否 fetch，prefetchQuery 内部吞掉结果和错误。
