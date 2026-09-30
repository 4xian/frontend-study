---
id: react.data.learn.intermediate.paginated-queries
type: lesson
title: 分页查询
summary: 把页码写进 queryKey，用占位数据在翻页时留下上一页，并用 isPlaceholderData 避免连跳。
domain: frontend
technology: react
module: data
stage: intermediate
level: intermediate
estimatedMinutes: 45
prerequisites:
  - react.data.learn.basics.query-key
  - react.data.learn.intermediate.initial-and-placeholder-data
related:
  - react.data.learn.basics.query-status
  - react.data.learn.basics.query-cache-and-sharing
  - react.data.learn.intermediate.query-options-reuse
tags:
  - TanStack Query
  - paginated queries
  - 分页查询
  - placeholderData
  - keepPreviousData
  - isPlaceholderData
  - hasMore
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-10
objectives:
  - 能把页码写进 queryKey，让每一页成为一条独立查询。
  - 能说明不写占位时，翻页会在 success 和 pending 之间跳动。
  - 能用 placeholderData 传入 keepPreviousData，在新页请求期间留下上一页。
  - 能用 isPlaceholderData 判断当前画面是不是上一页。
  - 能在占位期间禁用下一页，并说明回到已缓存页时读的是真实缓存。
recap:
  - 页码属于查询身份，必须写进 queryKey。
  - 每一页都是新查询；不写占位时，翻页会在 success 和 pending 之间跳动。
  - keepPreviousData 作为 placeholderData 传入，只给观察者留下上一页，不把上一页写进新页缓存。
  - 占位时观察者是 success，要用 isPlaceholderData 判断是不是上一页。
  - 下一页要在不是占位、并且 hasMore 为 true 时才前进；回到已缓存页是真实数据。
sources:
  - title: Paginated / Lagged Queries
    url: https://tanstack.com/query/latest/docs/framework/react/guides/paginated-queries
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 分页把页码写进 queryKey 就能工作，例如 ['projects', page]。
      - 每一页都被当成全新查询，所以界面会在 success 和 pending 之间跳动。
      - 把 placeholderData 设成恒等函数或导出的 keepPreviousData，新页请求期间仍能看到上一份成功数据。
      - 新数据到达后会无缝换成当前页。
      - isPlaceholderData 用来判断观察者当前提供的是不是上一份数据。
      - 下一页按钮应写成 disabled={isPlaceholderData || !data?.hasMore}。
      - 只有 !isPlaceholderData && data.hasMore 时才增加页码。
  - title: keepPreviousData
    url: https://tanstack.com/query/latest/docs/framework/react/reference/functions/keepPreviousData
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - keepPreviousData 作为 placeholderData 传入，会在新 queryKey 请求期间继续显示上一份数据。
      - 它是把 previousData 原样返回的恒等函数。
  - title: Placeholder Query Data
    url: https://tanstack.com/query/latest/docs/framework/react/guides/placeholder-query-data
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - placeholderData 让查询表现得像已经有数据，但这份数据不会写入缓存。
      - queryKey 变化时可以用恒等函数留下上一份数据。
      - 使用 placeholderData 时查询不是 pending，一开始就是 success。
      - 用 isPlaceholderData 为 true 区分占位画面和真实数据。
  - title: Migrating to TanStack Query v5
    url: https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 已移除 keepPreviousData 布尔选项和 isPreviousData。
      - 同等能力改用 placeholderData 传入 keepPreviousData 或恒等函数，并用 isPlaceholderData。
      - placeholderData 总会把观察者放进 success。
      - 占位期间 dataUpdatedAt 保持为 0。
  - title: QueryObserver placeholderData source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/queryObserver.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - placeholderData 是观察者选项，只在缓存 data 为 undefined 且 status 为 pending 时使用。
      - 函数形式会拿到上一次有数据的查询的 data。
      - 占位成功后观察者 status 为 success，isPlaceholderData 为 true，缓存 data 仍是 undefined。
      - 占位期间 dataUpdatedAt 取自新查询状态，新查询尚未成功时仍是 0。
  - title: keepPreviousData source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/utils.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - keepPreviousData 只返回传入的 previousData。
---

# 分页查询

## 一、学习目标

- 把页码写进 `queryKey`，让每一页成为一条独立查询。
- 说明不写占位时，翻页会在 `success` 和 `pending` 之间跳动。
- 用 `placeholderData` 传入 `keepPreviousData`，在新页请求期间留下上一页。
- 用 `isPlaceholderData` 判断当前画面是不是上一页。
- 在占位期间禁用下一页，并说明回到已缓存页时读的是真实缓存。

## 二、为什么需要分页查询

任务列表按页返回。第一页是林晓，第二页是周宁。页码变了，请求的数据也变了，所以页码必须进入查询身份。

只把页码写进 `queryKey` 就能分页。问题是：每一页都是一条全新查询。没有成功数据时观察者是 `pending`，界面会先空白再画出下一页。

如果希望翻页时先留下上一页，再等新页回来替换，就把上一页当作观察者占位，而不是把上一页写进新页缓存。

## 三、核心概念

### 1. 页码属于查询身份

官方分页示例把页码放进 `queryKey`：

```tsx
useQuery({
  queryKey: ['projects', page],
  queryFn: () => fetchProjects(page),
})
```

`page` 变了，查询身份就变了。第一页和第二页各有自己的缓存条目，互不覆盖。`queryFn` 依赖页码时，页码必须出现在同一条 `queryKey` 里。

### 2. 每一页都是新查询

没有占位时，翻到还没请求过的页会看到：

- 旧页的观察者被换成新页。
- 新页缓存是空的，`status` 为 `pending`。
- 请求完成后才进入 `success`。

官方把这种现象写成：界面会在 `success` 和 `pending` 之间跳动，因为每一页都被当成全新查询。功能上能用，画面会闪一下空白。

已经请求过的页再次进入时，读的是那一页自己的缓存。那是真实数据，不是占位。

### 3. 用占位留下上一页

把 `placeholderData` 写成 `(previousData) => previousData`，或传入导出的 `keepPreviousData`，新页请求期间观察者仍显示上一份成功数据。新数据到达后替换成当前页。

这不会把林晓那一页写进周宁那一页的缓存。源码里占位只在缓存 `data` 为 `undefined` 且 `status` 为 `pending` 时生效，作用对象是观察者。

### 4. isPlaceholderData 区分上一页和当前页

占位期间观察者是 `success`，`isPlaceholderData` 为 `true`。列表里暂时仍是林晓，但 `queryKey` 已经换成第二页。

不要只用 `isSuccess` 判断“已经是当前页”。占位时 `isSuccess` 也是 `true`。要看 `isPlaceholderData`。

占位期间 `dataUpdatedAt` 仍是新查询自己的时间戳；新查询还没成功时是 `0`。

### 5. 下一页要等真实结果

官方下一页按钮写成：

```tsx
disabled={isPlaceholderData || !data?.hasMore}
```

点击时还要再判断一次：

```tsx
if (!isPlaceholderData && data.hasMore) {
  setPage((old) => old + 1)
}
```

占位时 `data` 仍是上一页。上一页的 `hasMore` 为 `true` 不代表当前页已经确认还有下一页。占位期间继续加页码，会在上一页结果上连跳。

v5 已移除布尔选项 `keepPreviousData` 和 `isPreviousData`。同等能力是 `placeholderData: keepPreviousData`，标志是 `isPlaceholderData`。

## 四、用法与示例

### 1. 页码进 queryKey

```tsx
import { queryOptions, useQuery } from '@tanstack/react-query'

type Task = {
  id: string
  title: string
  owner: string
}

type TaskPage = {
  tasks: Task[]
  hasMore: boolean
}

/** 把页码和请求收进同一份配置。 */
function taskPageOptions(page: number) {
  return queryOptions({
    queryKey: ['tasks', 'page', page] as const,
    queryFn: async () => {
      const response = await fetch(`/api/tasks?page=${page}`)
      if (!response.ok) {
        throw new Error(`任务请求失败：HTTP ${response.status}`)
      }
      return (await response.json()) as TaskPage
    },
  })
}
```

第一页成功后，`['tasks', 'page', 1]` 的缓存有林晓；翻到第二页时，`['tasks', 'page', 2]` 仍是空的。

### 2. 翻页时留下上一页

```tsx
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { useState } from 'react'

/** 翻页时先留下上一页，等新页回来再替换。 */
function taskPageOptions(page: number) {
  return queryOptions({
    queryKey: ['tasks', 'page', page] as const,
    queryFn: async () => {
      const response = await fetch(`/api/tasks?page=${page}`)
      if (!response.ok) {
        throw new Error(`任务请求失败：HTTP ${response.status}`)
      }
      return (await response.json()) as TaskPage
    },
    placeholderData: keepPreviousData,
  })
}

/** 用占位标志控制下一页，避免连跳。 */
function TaskPages() {
  const [page, setPage] = useState(1)
  const pageQuery = useQuery(taskPageOptions(page))
  const canGoNext = !pageQuery.isPlaceholderData && pageQuery.data?.hasMore === true

  return (
    <section>
      <p>{String(pageQuery.isPlaceholderData)}</p>
      <ul>
        {pageQuery.data?.tasks.map((task) => (
          <li key={task.id}>
            {task.title} / {task.owner}
          </li>
        ))}
      </ul>
      <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
        上一页
      </button>
      <button
        type="button"
        disabled={!canGoNext}
        onClick={() => {
          if (!canGoNext) {
            return
          }
          setPage((current) => current + 1)
        }}
      >
        下一页
      </button>
    </section>
  )
}
```

第一次进入第一页时还没有上一份成功数据，观察者仍是 `pending`。从林晓翻到周宁时，观察者暂时留下林晓，`isPlaceholderData` 为 `true`，下一页按钮停住。

### 3. 不留上一页时接受 pending

不传 `placeholderData` 时，翻到未缓存的页会回到 `pending`，列表先空白。这是默认行为，不是故障。需要先留下上一页时，再传入 `keepPreviousData`。

回到已经成功过的页时，无论有没有占位，读的都是那一页自己的缓存。

## 五、用法示例：对照留下上一页和直接空白

下面的 Demo 把页码写进 `queryKey`。第一页是林晓，`hasMore` 为 `true`；第二页是周宁，`hasMore` 为 `false`。请求约 `1.4` 秒，并关掉自动重试，避免对比被重试打断。

默认“留下上一页”。等第一页真实成功后再点下一页：`queryKey` 已经是第 `2` 页，列表暂时仍是林晓，`isPlaceholderData` 为 `true`，新页缓存是“无”，下一页按钮停住。请求完成后换成周宁，`isPlaceholderData` 为 `false`。

改成“不留上一页”后，同样从林晓翻到周宁，观察者会先回到 `pending`，列表先空白。

指标里对照：当前页、请求次数、`status`、`isPending`、`isPlaceholderData`、`isFetching`、缓存 `data`、`hasMore`。离开页面会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.intermediate.paginated-queries.paginated-queries-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：页码不进 queryKey

**触发条件：** `queryFn` 按 `page` 请求，但 `queryKey` 写成 `['tasks']`。

**原因：** 查询身份不变，缓存按同一条查询复用。页码变了，观察者仍可能读到上一页。

**后果：** 第二页继续显示林晓，或第一页被第二页覆盖。

**错误示例：**

```tsx
useQuery({
  queryKey: ['tasks'],
  queryFn: () => loadTaskPage(page),
})
```

**正确写法：**

```tsx
useQuery({
  queryKey: ['tasks', 'page', page],
  queryFn: () => loadTaskPage(page),
})
```

**验证方式：** 第一页成功后再翻到第二页，两条 `queryKey` 应各有自己的缓存；错误写法则始终只有一条。

### 错误：不写占位却按“翻页不空白”来设计

**触发条件：** 只把页码写进 `queryKey`，不传 `placeholderData`，却按列表会一直留在画面上做布局。

**原因：** 每一页都是新查询。未缓存的新页没有数据时，观察者是 `pending`。

**后果：** 翻页时列表先空白，再画出下一页。

**错误示例：**

```tsx
useQuery({
  queryKey: ['tasks', 'page', page],
  queryFn: () => loadTaskPage(page),
})
```

**正确写法：**

```tsx
useQuery({
  queryKey: ['tasks', 'page', page],
  queryFn: () => loadTaskPage(page),
  placeholderData: keepPreviousData,
})
```

**验证方式：** 第一页成功后立刻翻到未缓存的第二页。有占位时 `isPlaceholderData` 为 `true` 且仍显示林晓；无占位时 `isPending` 为 `true`，列表为空。

### 错误：用 isSuccess 判断已经是当前页

**触发条件：** 看到 `status` 为 `success` 或 `isSuccess` 为 `true`，就按当前页渲染，不看 `isPlaceholderData`。

**原因：** 占位会把观察者放进 `success`。这时 `data` 仍是上一页。

**后果：** 页码已经是 `2`，界面仍把林晓当成周宁那一页。

**错误示例：**

```tsx
if (pageQuery.isSuccess) {
  return <p>当前页 {page}</p>
}
```

**正确写法：**

```tsx
if (pageQuery.isPlaceholderData) {
  return <p>仍显示上一页，正在请求第 {page} 页</p>
}

if (pageQuery.isSuccess) {
  return <p>当前页 {page}</p>
}
```

**验证方式：** 留下上一页时从第一页翻到第二页，立刻查看 `isSuccess` 为 `true` 且 `isPlaceholderData` 为 `true`；真实请求完成后再变成 `false`。

### 错误：占位期间继续点下一页

**触发条件：** 下一页按钮只看 `data.hasMore`，不看 `isPlaceholderData`。

**原因：** 占位时 `data` 是上一页。上一页的 `hasMore` 为 `true` 不代表新页已经确认还有下一页。

**后果：** 在上一页结果上连跳，跳过还没请求完的页。

**错误示例：**

```tsx
<button
  type="button"
  disabled={!data?.hasMore}
  onClick={() => setPage((current) => current + 1)}
>
  下一页
</button>
```

**正确写法：**

```tsx
<button
  type="button"
  disabled={isPlaceholderData || !data?.hasMore}
  onClick={() => {
    if (!isPlaceholderData && data?.hasMore) {
      setPage((current) => current + 1)
    }
  }}
>
  下一页
</button>
```

**验证方式：** 留下上一页时点下一页，占位期间下一页按钮不可用；请求完成且 `hasMore` 为 `false` 后仍不可用。

### 错误：继续写 keepPreviousData 布尔选项

**触发条件：** 从旧示例复制 `keepPreviousData: true`，或读取 `isPreviousData`。

**原因：** v5 已移除该布尔选项和 `isPreviousData`。同等能力是 `placeholderData: keepPreviousData`。

**后果：** 类型报错或选项被忽略，翻页时画面回到空白。

**错误示例：**

```tsx
useQuery({
  queryKey: ['tasks', 'page', page],
  queryFn: () => loadTaskPage(page),
  keepPreviousData: true,
})
```

**正确写法：**

```tsx
useQuery({
  queryKey: ['tasks', 'page', page],
  queryFn: () => loadTaskPage(page),
  placeholderData: keepPreviousData,
})
```

**验证方式：** 第一页成功后再翻到第二页，`isPlaceholderData` 为 `true`，列表暂时仍是林晓。
:::

## 七、源码推导与适用场景

1. **官方事实：** 分页把页码写进 `queryKey`。每一页都是全新查询，所以不写占位时界面会在 `success` 和 `pending` 之间跳动。`placeholderData` 传入恒等函数或 `keepPreviousData` 后，新页请求期间仍显示上一份成功数据；新数据到达后替换。`isPlaceholderData` 用来判断当前是不是上一份数据。下一页应在 `isPlaceholderData || !data?.hasMore` 时禁用，并只在 `!isPlaceholderData && data.hasMore` 时加页码。`keepPreviousData` 只返回 `previousData`。v5 已移除布尔版 `keepPreviousData` 和 `isPreviousData`。占位把观察者放进 `success`，占位期间 `dataUpdatedAt` 为 `0`。源码里观察者只在缓存为空且 `pending` 时应用 `placeholderData`，函数拿到上一次有数据的查询；缓存本身仍为空。
2. **课程推导：** 页码是查询身份的一部分。需要翻页不闪空白时，给 `useQuery` 传入 `placeholderData: keepPreviousData`，同时用 `isPlaceholderData` 控制下一页。不需要留下上一页时，接受 `pending`。回到已经成功过的页，读的是那一页自己的缓存，不是占位。
3. **适用边界：** 本课只讲按页的 `useQuery`。无限滚动、`useInfiniteQuery`、预取、`setQueryData`、缓存持久化、Hydration、Mutation、失效、乐观更新或 Suspense 不作为主线。`keepPreviousData` 也可以用于无限查询的 key 变化，那是另一条线。占位不写入新页缓存；官方“留下上一页”指观察者画面。

## 八、练习

:::exercise
### 练习目标

**要求：** 编写 `taskPageOptions(page)`，用 `queryOptions` 收纳 `queryKey` 与 `queryFn`。`queryKey` 必须包含页码。`queryFn` 请求 `/api/tasks?page=${page}`，非 2xx 时抛出带状态码的 `Error`。翻页使用 `placeholderData: keepPreviousData`。组件使用 `useQuery`，下一页按钮在 `isPlaceholderData` 为 `true` 或 `hasMore` 不为 `true` 时禁用；只有两者同时允许时才增加页码。用 `QueryClientProvider` 包裹。不要使用布尔版 `keepPreviousData`。

**验收：** 第一页成功后列表是当前页数据，`isPlaceholderData` 为 `false`。翻到尚未缓存的下一页时，观察者仍显示上一页，`isPlaceholderData` 为 `true`，新页的 `getQueryData` 为 `undefined`，下一页按钮不可用。真实请求完成后 `isPlaceholderData` 为 `false`，缓存里才有新页。不要使用布尔版 `keepPreviousData`。

**参考答案：**

```tsx
import {
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery,
} from '@tanstack/react-query'
import { useState, type ReactElement } from 'react'

type Task = {
  id: string
  title: string
  owner: string
}

type TaskPage = {
  tasks: Task[]
  hasMore: boolean
}

/** 按页读取任务。 */
async function loadTaskPage(page: number): Promise<TaskPage> {
  const response = await fetch(`/api/tasks?page=${page}`)
  if (!response.ok) {
    throw new Error(`任务请求失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskPage
}

/** 把分页查询收成一份配置，翻页时留下上一页。 */
function taskPageOptions(page: number) {
  return queryOptions({
    queryKey: ['tasks', 'page', page] as const,
    queryFn: () => loadTaskPage(page),
    placeholderData: keepPreviousData,
  })
}

/** 观察按页翻页时的上一页占位。 */
function TaskPageBoard(): ReactElement {
  const [page, setPage] = useState(1)
  const pageQuery = useQuery(taskPageOptions(page))
  const canGoNext = !pageQuery.isPlaceholderData && pageQuery.data?.hasMore === true

  return (
    <section>
      <p>{page}</p>
      <p>{String(pageQuery.isPlaceholderData)}</p>
      <ul>
        {pageQuery.data?.tasks.map((task) => (
          <li key={task.id}>
            {task.title} / {task.owner}
          </li>
        ))}
      </ul>
      <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
        上一页
      </button>
      <button
        type="button"
        disabled={!canGoNext}
        onClick={() => {
          if (!canGoNext) {
            return
          }
          setPage((current) => current + 1)
        }}
      >
        下一页
      </button>
    </section>
  )
}

/** 提供稳定客户端，避免分页观察丢失。 */
export function App(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <TaskPageBoard />
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- 页码必须写进 `queryKey`，每一页都是独立查询。
- 不写占位时，未缓存的新页会回到 `pending`。
- `keepPreviousData` 作为 `placeholderData` 传入，只给观察者留下上一页。
- 占位时用 `isPlaceholderData` 控制下一页，避免连跳。
- 回到已经成功过的页，读的是那一页自己的缓存。

## 十、参考资料

- [Paginated / Lagged Queries](https://tanstack.com/query/latest/docs/framework/react/guides/paginated-queries) - 支持页码进 queryKey、翻页占位、isPlaceholderData 与下一页禁用条件。
- [keepPreviousData](https://tanstack.com/query/latest/docs/framework/react/reference/functions/keepPreviousData) - 支持作为 placeholderData 的恒等函数。
- [Placeholder Query Data](https://tanstack.com/query/latest/docs/framework/react/guides/placeholder-query-data) - 支持占位不进缓存，以及 queryKey 变化时留下上一份数据。
- [Migrating to TanStack Query v5](https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5) - 支持移除布尔版 keepPreviousData，以及占位期间的 success 与 dataUpdatedAt。
- [QueryObserver placeholderData 源码](https://unpkg.com/@tanstack/query-core@5.102.8/src/queryObserver.ts) - 支持占位只作用于观察者。
- [keepPreviousData 源码](https://unpkg.com/@tanstack/query-core@5.102.8/src/utils.ts) - 支持 keepPreviousData 只返回 previousData。
