---
id: react.data.learn.advanced.query-render-optimizations
type: lesson
title: 查询渲染优化
summary: 用稳定的 select 让观察者只订阅切片。未选中的字段变化时，这个观察者不会重绘。
domain: frontend
technology: react
module: data
stage: advanced
level: advanced
estimatedMinutes: 45
prerequisites:
  - react.data.learn.intermediate.query-options-reuse
  - react.data.learn.basics.query-cache-and-sharing
related:
  - react.data.learn.basics.first-use-query
  - react.data.learn.basics.query-status
  - react.data.learn.intermediate.updates-from-mutation-responses
tags:
  - TanStack Query
  - 查询渲染优化
  - select
  - notifyOnChangeProps
  - structuralSharing
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-11
objectives:
  - 能说明观察者默认只追踪真正用到的结果字段。
  - 能用稳定的 select 只订阅切片，而不是整份缓存对象。
  - 能说明未选中的字段变化时，这个观察者不会重绘。
  - 能说明内联 select 每次渲染都是新函数，会让选择结果失去记忆。
  - 能说明 rest 解构会关掉字段追踪，相当于订阅全部结果。
recap:
  - 观察者默认只在真正用到的结果字段变化时重绘。
  - 稳定的 select 让组件只订阅切片，缓存里仍是完整数据。
  - 未选中的字段变化时，这个观察者不会重绘。
  - 内联 select 每次都是新函数，会让选择结果重新计算。
  - 本课不把 structuralSharing 自定义函数或 notifyOnChangeProps all 写成主线。
sources:
  - title: Render Optimizations
    url: https://tanstack.com/query/latest/docs/framework/react/guides/render-optimizations
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 只有真正用到的 useQuery 结果字段变化时才会重绘。
      - select 用来订阅数据切片，避免不必要的重绘。
      - 使用计数 select 时，待办名称变化不会让这个观察者重绘。
      - select 只在函数引用变化或 data 变化时重跑。
      - 内联 select 每次渲染都会跑。
      - rest 解构会关掉字段追踪。
  - title: Disallow object rest destructuring on query results
    url: https://tanstack.com/query/latest/docs/eslint/no-rest-destructuring
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - rest 解构会订阅查询结果的全部字段。
      - 普通具名字段解构仍然可以。
  - title: QueryObserver source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/queryObserver.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - select 结果会按函数引用和 data 记忆。
      - 通知监听者时只检查被追踪或列入 notifyOnChangeProps 的字段。
---

# 查询渲染优化

## 一、学习目标

- 说明观察者默认只追踪真正用到的结果字段。
- 用稳定的 `select` 只订阅切片，而不是整份缓存对象。
- 说明未选中的字段变化时，这个观察者不会重绘。
- 说明内联 `select` 每次渲染都是新函数，会让选择结果失去记忆。
- 说明 rest 解构会关掉字段追踪，相当于订阅全部结果。

## 二、为什么同一条缓存还会多画一次

任务缓存里同时有标题和备注。完整观察者要显示现有任务 / 林晓和核对备注，备注一变它就必须重绘。

旁边如果还有一个只显示标题的观察者，却订阅了整份对象，备注从核对备注改成核对新备注时，标题其实没变，这个观察者仍会跟着重绘。

官方用 `select` 处理这种情况：组件只订阅切片。缓存里仍是完整任务，标题观察者看到的只是字符串。本课不把自定义 `structuralSharing` 或 `notifyOnChangeProps: 'all'` 写成主线。

## 三、核心概念

### 1. 默认只追踪用到的结果字段

`useQuery` 返回值用 Proxy 记录访问过的字段。组件只用 `data` 时，`isFetching` 变化不会迫使它重绘。把结果写成 `const { data, ...rest } = useQuery(...)` 会关掉这项优化，相当于订阅全部字段。

### 2. select 让观察者订阅切片

```tsx
const titleQuery = useQuery({
  ...taskDetailOptions,
  select: selectTaskTitle,
})
```

`select` 作用在已经成功的缓存数据上。完整观察者仍读整份任务，标题观察者只拿到 `task.title`。缓存身份还是 `['tasks', 'detail', 't-1']`。

### 3. select 必须保持稳定引用

`select` 只在函数引用变化或 `data` 变化时重跑。内联 `(task) => task.title` 每次渲染都是新函数，选择结果会失去记忆。抽成模块级函数，或用没有依赖的 `useCallback`。

未选中的字段变化时，这个观察者的 `data` 保持原引用，组件不重绘。标题变了，两个观察者都会更新。

## 四、用法与示例

### 1. 抽出稳定的标题选择函数

```tsx
type TaskItem = {
  id: string
  title: string
  owner: string
  note: string
}

/** 只取出标题，引用保持稳定。 */
function selectTaskTitle(task: TaskItem): string {
  return task.title
}

function TitlePane() {
  const titleQuery = useQuery({
    queryKey: ['tasks', 'detail', 't-1'],
    queryFn: loadTaskDetail,
    select: selectTaskTitle,
    staleTime: Infinity,
    retry: false,
  })
  if (!titleQuery.isSuccess) {
    return <p>正在读取标题。</p>
  }
  return <p>{titleQuery.data}</p>
}
```

### 2. 改备注不应带动标题观察者

完整观察者读取 `title`、`owner` 和 `note`。用 `setQueryData` 只改 `note` 时，完整观察者重绘，标题观察者的渲染次数保持不变。再把标题改成核对标题，两个观察者都会加一次渲染。

## 五、用法示例：对照改备注和改标题

下面的 Demo 用同一份 `queryOptions`。完整观察者显示现有任务 / 林晓和核对备注，标题观察者只显示现有任务。点「更新备注」后，完整观察者渲染次数加一，标题观察者不变。点「更新标题」后，两个观察者都会加一。离开页面会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.advanced.query-render-optimizations.query-render-optimizations-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：标题观察者订阅整份任务对象

**触发条件：** 标题组件写 `useQuery(taskDetailOptions)`，再自己取 `data.title`。

**原因：** 观察者订阅的是完整 `data`。备注变化时 `data` 引用变了，组件仍会重绘。

**后果：** 只显示标题的界面跟着备注一起刷新。

**错误示例：**

```tsx
const taskQuery = useQuery(taskDetailOptions)
return <p>{taskQuery.data?.title}</p>
```

**正确写法：**

```tsx
const titleQuery = useQuery({
  ...taskDetailOptions,
  select: selectTaskTitle,
})
return <p>{titleQuery.data}</p>
```

**验证方式：** 更新备注后，标题观察者渲染次数保持不变。

### 错误：每次渲染都写一个新的 select

**触发条件：** `select: (task) => task.title` 写在组件函数体里。

**原因：** `select` 只在函数引用变化或 data 变化时重跑。内联函数每次都是新引用。

**后果：** 选择结果失去记忆，本该跳过的更新也会重算。

**错误示例：**

```tsx
useQuery({
  ...taskDetailOptions,
  select: (task) => task.title,
})
```

**正确写法：**

```tsx
function selectTaskTitle(task: TaskItem): string {
  return task.title
}

useQuery({
  ...taskDetailOptions,
  select: selectTaskTitle,
})
```

**验证方式：** 更新备注后标题仍是现有任务，标题观察者渲染次数不加。

### 错误：对查询结果做 rest 解构

**触发条件：** `const { data, ...rest } = useQuery(taskDetailOptions)`。

**原因：** rest 会访问全部结果字段，字段追踪被关掉。

**后果：** `isFetching`、`isStale` 这类常用变化也会迫使组件重绘。

**错误示例：**

```tsx
const { data, ...rest } = useQuery(taskDetailOptions)
return <p>{data?.title}</p>
```

**正确写法：**

```tsx
const taskQuery = useQuery(taskDetailOptions)
const { data } = taskQuery
```

**验证方式：** 组件只读取需要的字段，不把剩余结果再展开一遍。

### 错误：把 select 当成校验失败的抛出点

**触发条件：** `select` 里 `throw new Error('备注不合法')`。

**原因：** `select` 作用在已成功的缓存数据上，不是错误来源。官方要求错误放在 `queryFn`。

**后果：** `data` 变成 `undefined`，但 `isSuccess` 仍可能为 true，界面状态对不上。

**错误示例：**

```tsx
select: (task) => {
  throw new Error('备注不合法')
}
```

**正确写法：**

```tsx
async function loadTaskDetail(): Promise<TaskItem> {
  const response = await fetch('/api/tasks/t-1')
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}
```

**验证方式：** 读取失败时由 queryFn 抛错，select 只返回标题字符串。

### 错误：用 notifyOnChangeProps all 代替 select

**触发条件：** 标题组件写 `notifyOnChangeProps: 'all'`，希望看清所有状态变化。

**原因：** `'all'` 会在查询任意更新时重绘，把默认的字段追踪关掉。本课要观察的是切片订阅。

**后果：** 备注变化、后台标记变化都会带动标题组件，优化被抵消。

**错误示例：**

```tsx
useQuery({
  ...taskDetailOptions,
  notifyOnChangeProps: 'all',
})
```

**正确写法：**

```tsx
useQuery({
  ...taskDetailOptions,
  select: selectTaskTitle,
})
```

**验证方式：** 更新备注后标题观察者渲染次数不变，更新标题后才会加一。
:::

## 七、源码推导与适用场景

1. **官方事实：** 观察者默认追踪访问过的结果字段。`select` 用来订阅切片，只在函数引用或 data 变化时重跑。`QueryObserver` 通知监听者时，只检查被追踪的字段。rest 解构会订阅全部字段。
2. **课程推导：** 标题观察者用稳定的 `selectTaskTitle`。改备注时它不重绘；改标题时两个观察者一起更新。
3. **适用边界：** 本课不把自定义 structuralSharing、`notifyOnChangeProps: 'all'` 或渲染性能测量写成主线。

## 八、练习

:::exercise
### 练习目标

**要求：** 抽出 `taskDetailOptions`，`queryKey` 为 `['tasks', 'detail', 't-1']`。完整观察者直接使用这份配置。标题观察者展开后再传入稳定的 `select`，只返回 `title`。`queryFn` 调 `fetch`，非 2xx 时抛出带状态码的 `Error`。观察者 `staleTime` 为 `Infinity`，`retry` 为 `false`。

**验收：** 首次成功后完整观察者显示现有任务 / 林晓和核对备注，标题观察者显示现有任务。只改备注时标题观察者渲染次数不变。再改标题后，两个观察者都会更新。

**参考答案：**

```tsx
import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery,
} from '@tanstack/react-query'
import { useState, type ReactElement } from 'react'

type TaskItem = {
  id: string
  title: string
  owner: string
  note: string
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
  queryKey: ['tasks', 'detail', 't-1'],
  queryFn: loadTaskDetail,
  staleTime: Infinity,
  retry: false,
})

/** 只取出标题。 */
function selectTaskTitle(task: TaskItem): string {
  return task.title
}

/** 对照完整数据与标题切片。 */
function TaskBoard(): ReactElement {
  const taskQuery = useQuery(taskDetailOptions)
  const titleQuery = useQuery({
    ...taskDetailOptions,
    select: selectTaskTitle,
  })
  if (!taskQuery.isSuccess || !titleQuery.isSuccess) {
    return <p>正在读取任务。</p>
  }
  return (
    <section>
      <p>
        {taskQuery.data.title} / {taskQuery.data.owner}
      </p>
      <p>{taskQuery.data.note}</p>
      <p>{titleQuery.data}</p>
    </section>
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

- 观察者默认只在真正用到的结果字段变化时重绘。
- 稳定的 `select` 让组件只订阅切片，缓存里仍是完整数据。
- 未选中的字段变化时，这个观察者不会重绘。
- 内联 `select` 和 rest 解构都会把这项优化抵消。
- 本课不展开自定义 structuralSharing。

## 十、参考资料

- [Render Optimizations](https://tanstack.com/query/latest/docs/framework/react/guides/render-optimizations) - 支持用追踪字段和 select 减少不必要的重绘。
- [Disallow object rest destructuring on query results](https://tanstack.com/query/latest/docs/eslint/no-rest-destructuring) - 支持说明 rest 解构会订阅全部查询结果字段。
- [QueryObserver source](https://unpkg.com/@tanstack/query-core@5.102.8/src/queryObserver.ts) - 支持 select 按函数引用记忆，并按追踪字段决定是否通知。
