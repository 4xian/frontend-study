---
id: react.data.learn.advanced.suspense-queries
type: lesson
title: Suspense 查询
summary: 用 useSuspenseQuery 把首次等待交给 Suspense；成功后 data 保证有值，不再判断 isPending。
domain: frontend
technology: react
module: data
stage: advanced
level: advanced
estimatedMinutes: 45
prerequisites:
  - react.data.learn.basics.first-use-query
  - react.data.learn.basics.query-status
  - react.data.learn.basics.query-client-and-provider
related:
  - react.data.learn.advanced.query-prefetching
  - react.data.learn.basics.query-error-handling
tags:
  - TanStack Query
  - Suspense
  - useSuspenseQuery
  - queryOptions
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-11
objectives:
  - 能说明 useSuspenseQuery 把首次等待交给 Suspense，组件里不再判断 isPending。
  - 能写出 queryOptions 和 useSuspenseQuery，成功后直接读取 data。
  - 能把 QueryClientProvider 放在 Suspense 外面，避免挂起时丢掉客户端。
  - 能说明不能使用 enabled、placeholderData 和 skipToken。
  - 能说明同一组件里多个 useSuspenseQuery 会串行挂起。
recap:
  - useSuspenseQuery 首次没有数据时会挂起，由 Suspense fallback 承接等待。
  - 成功后 data 保证有值，TypeScript 也不再把 data 标成可能为空。
  - 不能传入 enabled、placeholderData 或 skipToken。
  - QueryClient 必须放在会挂起的树外面。
  - 本课不把错误边界重置或 useSuspenseQueries 写成主线。
sources:
  - title: Suspense
    url: https://tanstack.com/query/latest/docs/framework/react/guides/suspense
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 专用钩子是 useSuspenseQuery、useSuspenseInfiniteQuery 和 useSuspenseQueries。
      - suspense 模式下不需要 status 和 error，改由 React.Suspense 的 fallback 和错误边界处理。
      - data 保证有值，因此不能按条件启用或停用查询。
      - 同一组件里的查询会串行请求。
      - placeholderData 不存在于这类查询。
      - 默认只在缓存里还没有 data 时才把错误抛给错误边界。
  - title: useSuspenseQuery
    url: https://tanstack.com/query/latest/docs/framework/react/reference/useSuspenseQuery
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 选项与 useQuery 相同，但不包含 throwOnError、enabled 和 placeholderData。
      - queryFn 不能是 skipToken，因为 Suspense 钩子不能渲染停用状态。
      - data 保证有值，没有 isPlaceholderData，status 只可能是 success 或 error。
      - 同一组件里多个 useSuspenseQuery 会串行挂起，应改用 useSuspenseQueries。
      - 首次失败且没有缓存时会抛错，需要错误边界包住 Suspense。
      - 后台刷新失败时继续渲染已有缓存。
  - title: useSuspenseQuery source
    url: https://unpkg.com/@tanstack/react-query@5.102.8/src/useSuspenseQuery.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 开发环境下 queryFn 为 skipToken 会打印错误。
      - 内部固定 enabled 为 true、suspense 为 true、placeholderData 为 undefined。
      - throwOnError 固定为 defaultThrowOnError。
  - title: suspense helpers source
    url: https://unpkg.com/@tanstack/react-query@5.102.8/src/suspense.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - defaultThrowOnError 只在 query.state.data 为 undefined 时返回 true。
      - shouldSuspend 在 suspense 开启且结果 isPending 时挂起。
---

# Suspense 查询

## 一、学习目标

- 说明 `useSuspenseQuery` 把首次等待交给 `Suspense`，组件里不再判断 `isPending`。
- 写出 `queryOptions` 和 `useSuspenseQuery`，成功后直接读取 `data`。
- 把 `QueryClientProvider` 放在 `Suspense` 外面，避免挂起时丢掉客户端。
- 说明不能使用 `enabled`、`placeholderData` 和 `skipToken`。
- 说明同一组件里多个 `useSuspenseQuery` 会串行挂起。

## 二、为什么不再自己画等待态

`useQuery` 第一次没有缓存时，`data` 可能是 `undefined`，组件必须先判断 `isPending`。`useSuspenseQuery` 把这一段交给最近的 `Suspense`。没有数据时组件挂起，fallback 显示「正在读取任务。」；成功后 `data` 一定有值，直接显示现有任务 / 林晓。

官方把加载和错误从返回值里拿掉：等待用 `fallback`，失败用错误边界。本课只讲成功路径上的挂起和保证存在的 `data`。不把 `QueryErrorResetBoundary`、`useSuspenseQueries` 或服务端流式渲染写成主线。

## 三、核心概念

### 1. 首次没有数据就挂起

源码里 `useSuspenseQuery` 会把选项改成：

- `enabled: true`
- `suspense: true`
- `placeholderData: undefined`
- `throwOnError: defaultThrowOnError`

`shouldSuspend` 的条件是 `suspense && result.isPending`。缓存里还没有结果时，组件不会带着空 `data` 往下渲染。

```tsx
const { data } = useSuspenseQuery(taskDetailOptions)
```

TypeScript 里 `data` 已经是确定值。不要再写 `if (isPending) return ...`。

### 2. 不能停用，也不能放占位数据

官方写明：选项里没有 `enabled`、`throwOnError` 和 `placeholderData`。`queryFn` 也不能是 `skipToken`，因为 Suspense 钩子没有「停用」这种渲染结果。

同一组件里如果写两个 `useSuspenseQuery`，第二个要等第一个结束才开始请求。这是串行瀑布。需要并行时用 `useSuspenseQueries`，本课不展开。

改 `queryKey` 时如果希望不要立刻换成 fallback，官方要求把这次更新包进 `startTransition`。本课 Demo 不切换 key。

### 3. 客户端必须在挂起树外面

`QueryClientProvider` 和创建 `QueryClient` 的位置都要在 `Suspense` 外面。组件挂起时，React 会丢掉这次挂起子树里的 state。客户端如果和 `useSuspenseQuery` 写在同一层，缓存会一起被扔掉，请求会重新开始。

```tsx
function App() {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<p>正在读取任务。</p>}>
        <TaskDetailPane />
      </Suspense>
    </QueryClientProvider>
  )
}
```

### 4. 错误边界不是本课主线

没有缓存时，请求失败会抛给错误边界。缓存里已经有 `data` 时，后台刷新失败仍继续渲染旧数据。`defaultThrowOnError` 只在 `query.state.data === undefined` 时返回 `true`。重置错误边界、让用户点「再试一次」，不属于本课。

## 四、用法与示例

### 1. 抽出 queryOptions

```tsx
const taskDetailOptions = queryOptions({
  queryKey: ['tasks', 'detail', 't-1'],
  queryFn: loadTaskDetail,
  staleTime: Infinity,
  retry: false,
})
```

`queryFn` 仍然用 `fetch`。非 2xx 时抛出带状态码的 `Error`。`retry` 为 `false`，避免等待被重试拉长。

### 2. 在 Suspense 里直接读 data

```tsx
function TaskDetailPane() {
  const taskQuery = useSuspenseQuery(taskDetailOptions)
  return (
    <p>
      {taskQuery.data.title} / {taskQuery.data.owner}
    </p>
  )
}

function TaskBoard() {
  return (
    <Suspense fallback={<p>正在读取任务。</p>}>
      <TaskDetailPane />
    </Suspense>
  )
}
```

`TaskDetailPane` 不再看 `isPending`。第一次进入时 fallback 显示正在读取任务；成功后是现有任务 / 林晓。

## 五、用法示例：首次挂起后再显示任务

下面的 Demo 把 `QueryClient` 放在 `Suspense` 外面。第一次读取会先看到「正在读取任务。」，成功后任务详情是现有任务 / 林晓。点「重置」会整段重挂，fallback 再次出现。离开页面会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.advanced.suspense-queries.suspense-queries-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：对 useSuspenseQuery 再判断 isPending

**触发条件：** 把 `useQuery` 的等待分支原样搬过来。

**原因：** 没有缓存时组件已经挂起，这段分支根本不会执行。成功后 `data` 保证有值。

**后果：** 多余判断让人以为还要自己画加载态，TypeScript 也发挥不出 `data` 已定义的好处。

**错误示例：**

```tsx
const { data, isPending } = useSuspenseQuery(taskDetailOptions)
if (isPending) {
  return <p>正在读取任务。</p>
}
return <p>{data.title}</p>
```

**正确写法：**

```tsx
const { data } = useSuspenseQuery(taskDetailOptions)
return <p>{data.title} / {data.owner}</p>
```

**验证方式：** 首次进入时等待出现在 `Suspense` 的 fallback 里，成功后直接是现有任务 / 林晓。

### 错误：给 useSuspenseQuery 传 enabled 或 skipToken

**触发条件：** 想像 `useQuery` 那样先停用，等条件满足再请求。

**原因：** 类型里没有 `enabled`。源码在开发环境遇到 `skipToken` 会报错，并强制 `enabled: true`。

**后果：** 编译失败，或运行时仍然立刻请求。

**错误示例：**

```tsx
useSuspenseQuery({
  queryKey: ['tasks', 'detail', 't-1'],
  queryFn: skipToken,
})
```

**正确写法：**

```tsx
useSuspenseQuery(taskDetailOptions)
```

**验证方式：** 组件一挂上就进入 fallback，不会停在未请求状态。

### 错误：给 Suspense 查询设 placeholderData

**触发条件：** 想在等待时先显示旧标题，避免 fallback。

**原因：** 官方写明 `placeholderData` 不存在于这类查询。源码会把它设成 `undefined`。

**后果：** 占位数据不会生效，首次等待仍走 fallback。

**错误示例：**

```tsx
useSuspenseQuery({
  ...taskDetailOptions,
  placeholderData: { id: 't-1', title: '现有任务', owner: '林晓' },
})
```

**正确写法：**

```tsx
useSuspenseQuery(taskDetailOptions)
```

**验证方式：** 第一次读取时只能看到 fallback，不会先出现占位标题。

### 错误：把 QueryClient 和挂起组件写在同一层

**触发条件：** 在会调用 `useSuspenseQuery` 的组件里 `useState(() => new QueryClient())`。

**原因：** 挂起时 React 会丢掉这次子树的 state。客户端被扔掉后，缓存也没了。

**后果：** fallback 反复出现，请求次数被放大。

**错误示例：**

```tsx
function TaskDetailPane() {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <TaskView />
    </QueryClientProvider>
  )
}
```

**正确写法：**

```tsx
function App() {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<p>正在读取任务。</p>}>
        <TaskDetailPane />
      </Suspense>
    </QueryClientProvider>
  )
}
```

**验证方式：** 成功后点重置以外的重绘不会重新走完整 fallback。

### 错误：同一组件里连续写两个 useSuspenseQuery

**触发条件：** 在一个函数组件里先后读取列表和详情。

**原因：** 官方写明多个 `useSuspenseQuery` 会串行挂起，后一个要等前一个结束才开始请求。

**后果：** 两次等待叠在一起，总时间变成两次请求之和。

**错误示例：**

```tsx
function TaskBoard() {
  const listQuery = useSuspenseQuery(taskListOptions)
  const detailQuery = useSuspenseQuery(taskDetailOptions)
  return <p>{listQuery.data.length}</p>
}
```

**正确写法：**

```tsx
function TaskDetailPane() {
  const detailQuery = useSuspenseQuery(taskDetailOptions)
  return <p>{detailQuery.data.title}</p>
}
```

**验证方式：** 本课 Demo 只有一条详情查询。需要并行时改用 `useSuspenseQueries`，不在本课展开。
:::

## 七、源码推导与适用场景

1. **官方事实：** `useSuspenseQuery` 固定 `enabled: true`、`suspense: true`、`placeholderData: undefined`。`shouldSuspend` 在 `isPending` 时挂起。`data` 保证有值。不能使用 `skipToken`。
2. **课程推导：** 详情查询第一次没有缓存时，fallback 显示正在读取任务；成功后直接渲染现有任务 / 林晓。`QueryClient` 放在 `Suspense` 外面，挂起不会丢掉缓存。
3. **适用边界：** 本课不把错误边界重置、`useSuspenseQueries` 并行、无限查询 Suspense 或 Next.js 流式渲染写成主线。

## 八、练习

:::exercise
### 练习目标

**要求：** 抽出 `taskDetailOptions`，`queryKey` 为 `['tasks', 'detail', 't-1']`。组件用 `useSuspenseQuery` 读取详情，直接渲染 `title` 和 `owner`。外层用 `Suspense` 显示「正在读取任务。」。`QueryClientProvider` 放在 `Suspense` 外面。`queryFn` 调 `fetch`，非 2xx 时抛出带状态码的 `Error`。`retry` 为 `false`。

**验收：** 首次渲染先出现 fallback。成功后显示现有任务 / 林晓，组件里没有 `isPending` 判断。

**参考答案：**

```tsx
import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { Suspense, useState, type ReactElement } from 'react'

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

/** 成功后直接读 data。 */
function TaskDetailPane(): ReactElement {
  const taskQuery = useSuspenseQuery(taskDetailOptions)
  return (
    <p>
      {taskQuery.data.title} / {taskQuery.data.owner}
    </p>
  )
}

/** 对照 fallback 与保证存在的 data。 */
function TaskBoard(): ReactElement {
  return (
    <Suspense fallback={<p>正在读取任务。</p>}>
      <TaskDetailPane />
    </Suspense>
  )
}

/** 客户端放在挂起树外面。 */
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

- `useSuspenseQuery` 把首次等待交给 `Suspense`。
- 成功后 `data` 保证有值，不再判断 `isPending`。
- 不能使用 `enabled`、`placeholderData` 和 `skipToken`。
- `QueryClient` 必须放在会挂起的树外面。
- 本课不展开错误边界重置。

## 十、参考资料

- [Suspense](https://tanstack.com/query/latest/docs/framework/react/guides/suspense) - 支持把等待和错误交给 Suspense 与错误边界，并保证 data 有值。
- [useSuspenseQuery](https://tanstack.com/query/latest/docs/framework/react/reference/useSuspenseQuery) - 支持去掉 enabled、placeholderData 和 skipToken，并说明同一组件里会串行挂起。
- [useSuspenseQuery source](https://unpkg.com/@tanstack/react-query@5.102.8/src/useSuspenseQuery.ts) - 支持内部固定 enabled、suspense 和 placeholderData。
- [suspense helpers source](https://unpkg.com/@tanstack/react-query@5.102.8/src/suspense.ts) - 支持在 isPending 时挂起，以及只在没有 data 时抛错。
