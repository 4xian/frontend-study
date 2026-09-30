---
id: react.data.learn.advanced.query-client-cache-operations
type: lesson
title: Query Client 与缓存操作
summary: 用 getQueryData 和 setQueryData 同步读写缓存，用 setQueriesData 只改已有条目，用 removeQueries 删掉匹配查询。
domain: frontend
technology: react
module: data
stage: advanced
level: advanced
estimatedMinutes: 45
prerequisites:
  - react.data.learn.basics.query-client-and-provider
  - react.data.learn.intermediate.updates-from-mutation-responses
related:
  - react.data.learn.intermediate.query-invalidation
  - react.data.learn.intermediate.query-cancellation
  - react.data.learn.basics.query-cache-and-sharing
tags:
  - TanStack Query
  - QueryClient
  - getQueryData
  - setQueryData
  - setQueriesData
  - removeQueries
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-11
objectives:
  - 能说明 getQueryData 是命令式读取，组件渲染要用 useQuery。
  - 能用 setQueryData 同步写入指定 queryKey，查询不存在时会创建，updater 返回 undefined 时不动缓存。
  - 能用不可变方式更新缓存，不原地改 oldData。
  - 能用 setQueriesData 按过滤器改已经存在的条目，不会新建查询。
  - 能用 removeQueries 从缓存删除匹配查询，并和作废、重置区分开。
recap:
  - getQueryData 只读当前快照，不会订阅后续变化。
  - setQueryData 同步写指定 key；没有这条查询时会创建，updater 返回 undefined 时什么也不建。
  - 更新必须不可变，不要给 oldData.title 赋值。
  - setQueriesData 只改已经存在且匹配过滤器的条目，不会新建查询。
  - removeQueries 删除缓存条目；invalidateQueries 只标 stale，resetQueries 回到初始状态后再拉活跃查询。
sources:
  - title: QueryClient
    url: https://tanstack.com/query/latest/docs/reference/QueryClient
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - getQueryData 按 QueryKey 命令式读取数据，组件里要用 useQuery 订阅变化。
      - setQueryData 同步更新指定查询的缓存；updater 得到 undefined 时缓存不动也不创建；查询不存在且写入有效数据时会创建。
      - 更新必须不可变，不要原地改 oldData 或 getQueryData 取出的对象。
      - setQueriesData 按过滤器同步改多条已有缓存，内部对每条调用 setQueryData，不会新建条目。
      - getQueriesData 按过滤器命令式读出多条缓存，没有匹配时返回空数组。
      - removeQueries 从缓存删除匹配查询；不传过滤器时删除全部查询。
      - resetQueries 把匹配查询重置为初始状态并通知订阅者，活跃查询随后会重新获取。
  - title: Filters
    url: https://tanstack.com/query/latest/docs/framework/react/guides/filters
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - queryKey 过滤器默认按前缀包容匹配。
      - exact 为 true 时只返回与传入 queryKey 完全相同的那一条。
  - title: QueryClient source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/queryClient.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - getQueryData 用 queryHash 取出 state.data。
      - setQueryData 对 updater 做 functionalUpdate；结果为 undefined 时直接返回，不为 undefined 时 build 后 setData。
      - setQueriesData 对 findAll 的每条 queryKey 调用 setQueryData。
      - removeQueries 对 findAll 的每条调用 queryCache.remove。
      - resetQueries 先 query.reset，再 refetchQueries 活跃查询。
  - title: QueryCache source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/queryCache.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - remove 会 destroy 查询并从 Map 删除，再通知 removed。
---

# Query Client 与缓存操作

## 一、学习目标

- 说明 `getQueryData` 是命令式读取，组件渲染要用 `useQuery`。
- 用 `setQueryData` 同步写入指定 `queryKey`，查询不存在时会创建，`updater` 返回 `undefined` 时不动缓存。
- 用不可变方式更新缓存，不原地改 `oldData`。
- 用 `setQueriesData` 按过滤器改已经存在的条目，不会新建查询。
- 用 `removeQueries` 从缓存删除匹配查询，并和作废、重置区分开。

## 二、为什么还要命令式读写

`useQuery` 负责订阅。组件要显示现有任务 / 林晓时，观察者跟着缓存走。事件回调里已经拿到一份对象，或只想看一眼当前快照，再走一遍 `queryFn` 就多余了。

`QueryClient` 提供同步读写。`getQueryData` 读当前 `data`。`setQueryData` 立刻写回指定 `queryKey`。`setQueriesData` 按过滤器改已经在缓存里的条目。`removeQueries` 把匹配查询从 `QueryCache` 拿掉。

本课不把 `invalidateQueries`、`cancelQueries`、离线持久化或 SSR 写成主线。作废仍然只标 stale，取消管进行中的请求。

## 三、核心概念

### 1. getQueryData 读快照，不订阅

```tsx
const cached = queryClient.getQueryData(taskListOptions.queryKey)
```

官方把它标成非响应式读取：只适合回调里取最新值。写在组件函数体里不会在缓存变化后重绘。要订阅，用 `useQuery`。

`getQueriesData({ queryKey: ['tasks'] })` 按过滤器一次取出多条，返回 `[queryKey, data][]`。没有匹配时是空数组。

### 2. setQueryData 同步写一条

```tsx
queryClient.setQueryData(['tasks', 'detail', 't-1'], {
  id: 't-1',
  title: '核对详情',
  owner: '林晓',
})
```

这是同步操作，假定数据已经在手里。查询还不存在时会创建。`updater` 或新值得到 `undefined` 时，缓存不动，也不会新建。

也可以传入函数，拿到当前值再返回下一份：

```tsx
queryClient.setQueryData(taskListOptions.queryKey, (current) =>
  current ? current.map((task) => ({ ...task, title: '核对批量' })) : current,
)
```

必须不可变。不要写 `oldData.title = '核对批量'`，也不要改 `getQueryData` 刚取出来的对象。

### 3. setQueriesData 只改已经存在的条目

```tsx
queryClient.setQueriesData({ queryKey: ['tasks'] }, (current) =>
  current ? { ...current, title: '核对批量' } : current,
)
```

它内部对 `findAll` 的每一条调用 `setQueryData`。过滤器按前缀匹配时，`['tasks']` 和 `['tasks', 'detail', 't-1']` 都会被改到。匹配不到的 key 不会被创建。

### 4. removeQueries 删除，不是作废

```tsx
queryClient.removeQueries({
  queryKey: ['tasks', 'detail', 't-1'],
  exact: true,
})
```

匹配到的查询会从 `QueryCache` 删除。不传过滤器时，缓存里每一条都会被拿掉。`invalidateQueries` 只标 stale，条目还在。`resetQueries` 回到初始状态并通知订阅者，活跃查询随后会重新获取。本课主线是删除。

## 四、用法与示例

### 1. 先订阅列表，再命令式写入详情

```tsx
const taskListOptions = queryOptions({
  queryKey: ['tasks'],
  queryFn: loadTaskList,
  staleTime: Infinity,
  retry: false,
})

function TaskBoard() {
  const queryClient = useQueryClient()
  const listQuery = useQuery(taskListOptions)

  function writeDetail() {
    queryClient.setQueryData(['tasks', 'detail', 't-1'], {
      id: 't-1',
      title: '核对详情',
      owner: '林晓',
    })
  }
}
```

列表观察者会发一次 `queryFn`。写入详情只动缓存，请求次数不变。`getQueryData(['tasks', 'detail', 't-1'])` 立刻读到核对详情。

### 2. 按前缀改标题，再精确删除详情

```tsx
queryClient.setQueriesData({ queryKey: ['tasks'] }, (current) => {
  if (!current) {
    return current
  }
  if (Array.isArray(current)) {
    return current.map((task) => ({ ...task, title: '核对批量' }))
  }
  return { ...current, title: '核对批量' }
})

queryClient.removeQueries({
  queryKey: ['tasks', 'detail', 't-1'],
  exact: true,
})
```

批量改标题后，列表观察者和详情缓存都会变成核对批量。精确删除后，详情读出来是 `undefined`，列表仍在。

## 五、用法示例：写入、批量改、删除

下面的 Demo 先读取 `['tasks']`，成功后显示现有任务 / 林晓。点「写入详情」后，`['tasks', 'detail', 't-1']` 出现核对详情，请求次数不变。点「批量改标题」后，列表和详情都变成核对批量。点「删除详情」后，详情消失，列表还在。离开页面会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.advanced.query-client-cache-operations.query-client-cache-operations-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：在组件渲染里用 getQueryData 当数据源

**触发条件：** 组件函数体写 `const task = queryClient.getQueryData(['tasks'])`，再据此渲染。

**原因：** `getQueryData` 只读当前快照，不会建立观察者。

**后果：** 后面 `setQueryData` 改了缓存，界面仍停在旧值。

**错误示例：**

```tsx
function TaskTitle() {
  const queryClient = useQueryClient()
  const tasks = queryClient.getQueryData(taskListOptions.queryKey)
  return <p>{tasks?.[0]?.title}</p>
}
```

**正确写法：**

```tsx
function TaskTitle() {
  const listQuery = useQuery(taskListOptions)
  if (!listQuery.isSuccess) {
    return <p>正在读取任务。</p>
  }
  return <p>{listQuery.data[0]?.title}</p>
}
```

**验证方式：** 批量改标题后，列表观察者显示核对批量；只靠 `getQueryData` 的组件不会自己更新。

### 错误：原地改 oldData

**触发条件：** `setQueryData` 的 updater 里写 `oldData[0].title = '核对批量'`。

**原因：** 官方要求不可变更新。缓存和观察者可能仍拿着同一份对象。

**后果：** 引用没变，观察者不一定重绘，后续比较也会乱。

**错误示例：**

```tsx
queryClient.setQueryData(taskListOptions.queryKey, (current) => {
  if (current) {
    current[0].title = '核对批量'
  }
  return current
})
```

**正确写法：**

```tsx
queryClient.setQueryData(taskListOptions.queryKey, (current) =>
  current ? current.map((task) => ({ ...task, title: '核对批量' })) : current,
)
```

**验证方式：** 批量改标题后列表观察者显示核对批量，原对象没有被直接赋值。

### 错误：指望 setQueriesData 创建还不存在的 key

**触发条件：** 详情还没写入，就调用 `setQueriesData({ queryKey: ['tasks', 'detail', 't-1'] }, writtenDetail)`。

**原因：** `setQueriesData` 只遍历已经存在且匹配过滤器的查询。

**后果：** 详情仍然没有缓存，`getQueryData` 还是 `undefined`。

**错误示例：**

```tsx
queryClient.setQueriesData({ queryKey: ['tasks', 'detail', 't-1'] }, writtenDetail)
```

**正确写法：**

```tsx
queryClient.setQueryData(['tasks', 'detail', 't-1'], writtenDetail)
```

**验证方式：** 写入详情后 `getQueryData` 读到核对详情；只调用 `setQueriesData` 时详情仍是无。

### 错误：用 removeQueries 代替作废

**触发条件：** 想让正在显示的列表重新获取，却调用 `removeQueries({ queryKey: ['tasks'] })`。

**原因：** `removeQueries` 删除缓存条目。活跃观察者会掉进没有 `data` 的状态，再拉一次会像首次加载。

**后果：** 列表先变成正在读取任务，而不是后台刷新。

**错误示例：**

```tsx
queryClient.removeQueries({ queryKey: ['tasks'] })
```

**正确写法：**

```tsx
await queryClient.invalidateQueries({ queryKey: ['tasks'] })
```

**验证方式：** 删除详情只拿掉 `['tasks', 'detail', 't-1']`，列表观察者仍显示当前标题。

### 错误：updater 返回 undefined 还以为写入成功

**触发条件：** `setQueryData(key, (current) => { current && (current.title = '核对详情'); })` 没有 `return`。

**原因：** `functionalUpdate` 得到 `undefined` 时直接返回，不 `build`，也不 `setData`。

**后果：** 查询不存在时不会被创建；已存在的条目也不会更新。

**错误示例：**

```tsx
queryClient.setQueryData(['tasks', 'detail', 't-1'], (current) => {
  if (current) {
    current.title = '核对详情'
  }
})
```

**正确写法：**

```tsx
queryClient.setQueryData(['tasks', 'detail', 't-1'], writtenDetail)
```

**验证方式：** 写入详情后缓存标题是核对详情，请求次数不变。
:::

## 七、源码推导与适用场景

1. **官方事实：** `getQueryData` 用 `queryHash` 读 `state.data`。`setQueryData` 对 updater 做 `functionalUpdate`，结果为 `undefined` 时离开；否则 `build` 后 `setData`。`setQueriesData` 对 `findAll` 的每条调用 `setQueryData`。`removeQueries` 对匹配查询调用 `queryCache.remove`，`remove` 会 `destroy` 并从 Map 删除。
2. **课程推导：** 列表由 `useQuery` 拉一次。详情用 `setQueryData` 同步创建。前缀 `setQueriesData` 同时改列表和详情标题。`exact` 删除只拿掉详情。
3. **适用边界：** 本课不把 `invalidateQueries`、`refetchQueries`、`cancelQueries`、`resetQueries` 主线化，也不进入离线持久化或 SSR。

## 八、练习

:::exercise
### 练习目标

**要求：** 抽出 `taskListOptions`，`queryKey` 为 `['tasks']`。组件用 `useQuery` 订阅列表。用 `setQueryData` 写入 `['tasks', 'detail', 't-1']`。用 `setQueriesData({ queryKey: ['tasks'] })` 把已有条目标题改成核对批量。用 `removeQueries` 精确删除详情。`queryFn` 调 `fetch`，非 2xx 时抛出带状态码的 `Error`。观察者 `staleTime` 为 `Infinity`，`retry` 为 `false`。

**验收：** 列表成功后显示现有任务 / 林晓。写入详情后 `getQueryData` 读到核对详情，请求次数不变。批量改标题后列表和详情都是核对批量。删除详情后详情变为 `undefined`，列表仍在。

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

/** 读取任务列表。 */
async function loadTaskList(): Promise<TaskItem[]> {
  const response = await fetch('/api/tasks')
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem[]
}

const taskListOptions = queryOptions({
  queryKey: ['tasks'],
  queryFn: loadTaskList,
  staleTime: Infinity,
  retry: false,
})

const taskDetailKey = ['tasks', 'detail', 't-1'] as const

const writtenDetail: TaskItem = {
  id: 't-1',
  title: '核对详情',
  owner: '林晓',
}

/** 把标题改成核对批量。 */
function renameCachedTitle(current: unknown): unknown {
  if (!current) {
    return current
  }
  if (Array.isArray(current)) {
    return current.map((task: TaskItem) => ({ ...task, title: '核对批量' }))
  }
  if (typeof current === 'object' && 'title' in current) {
    return { ...(current as TaskItem), title: '核对批量' }
  }
  return current
}

/** 对照同步写入、批量改已有条目和删除。 */
function TaskBoard(): ReactElement {
  const queryClient = useQueryClient()
  const listQuery = useQuery(taskListOptions)

  /** 同步写入详情 key。 */
  function writeDetail(): void {
    queryClient.setQueryData(taskDetailKey, writtenDetail)
  }

  /** 按前缀改已经存在的条目。 */
  function renameMatching(): void {
    queryClient.setQueriesData({ queryKey: ['tasks'] }, renameCachedTitle)
  }

  /** 精确删除详情条目。 */
  function removeDetail(): void {
    queryClient.removeQueries({ queryKey: taskDetailKey, exact: true })
  }

  if (!listQuery.isSuccess) {
    return <p>正在读取任务。</p>
  }

  return (
    <section>
      <p>
        {listQuery.data[0]?.title} / {listQuery.data[0]?.owner}
      </p>
      <button type="button" onClick={writeDetail}>
        写入详情
      </button>
      <button type="button" onClick={renameMatching}>
        批量改标题
      </button>
      <button type="button" onClick={removeDetail}>
        删除详情
      </button>
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

- `getQueryData` 只读当前快照，组件渲染仍用 `useQuery`。
- `setQueryData` 同步写指定 key；没有这条查询时会创建，返回 `undefined` 时不动。
- 更新必须不可变。
- `setQueriesData` 只改已经存在的匹配条目。
- `removeQueries` 删除缓存；不要把它当成作废。

## 十、参考资料

- [QueryClient](https://tanstack.com/query/latest/docs/reference/QueryClient) - 支持 getQueryData、setQueryData、setQueriesData 和 removeQueries 的同步缓存语义。
- [Filters](https://tanstack.com/query/latest/docs/framework/react/guides/filters) - 支持 queryKey 前缀匹配和 exact。
- [QueryClient source](https://unpkg.com/@tanstack/query-core@5.102.8/src/queryClient.ts) - 支持 updater 得到 undefined 时不写入，以及 setQueriesData 只遍历已有查询。
- [QueryCache source](https://unpkg.com/@tanstack/query-core@5.102.8/src/queryCache.ts) - 支持 remove 会销毁查询并从缓存 Map 删除。
