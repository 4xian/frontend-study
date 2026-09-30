---
id: react.data.learn.intermediate.query-cancellation
type: lesson
title: 查询取消
summary: 进行中的查询可以取消并回退到请求前的状态；默认卸载不会取消，只有消费 AbortSignal 后卸载才会真正中止。
domain: frontend
technology: react
module: data
stage: intermediate
level: intermediate
estimatedMinutes: 45
prerequisites:
  - react.data.learn.intermediate.query-retry
related:
  - react.data.learn.basics.query-function-and-fetch
  - react.data.learn.basics.query-status
  - react.data.learn.basics.query-error-handling
tags:
  - TanStack Query
  - query cancellation
  - 查询取消
  - cancelQueries
  - AbortSignal
  - CancelledError
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-10
objectives:
  - 能说明查询函数会收到 AbortSignal，查询过期或不再被使用时这个信号会被中止。
  - 能区分默认卸载不取消，以及消费 AbortSignal 后卸载会取消并回退。
  - 能把 signal 传给 fetch，让进行中的请求真正停掉。
  - 能用 queryClient.cancelQueries 手动取消查询，并说明默认会回退到请求前的状态。
  - 能说明 silent 与 revert 两个取消选项，以及取消不会把查询标成业务错误。
recap:
  - 查询函数会收到 AbortSignal；查询过期或不活跃时这个信号会被中止。
  - 默认卸载不会取消进行中的 Promise，完成后数据仍会进缓存。
  - 一旦读取并消费了 AbortSignal，卸载会取消查询并回退到请求前的状态。
  - cancelQueries 会取消匹配查询并默认回退；消费了 signal 时还会中止 Promise。
  - 本课只讲查询取消，不展开 Mutation、失效、乐观更新或 Suspense 主线。
sources:
  - title: Query Cancellation
    url: https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - TanStack Query 向每个查询函数提供 AbortSignal。
      - 查询过期或不活跃时，这个信号会被中止。
      - 默认情况下，组件卸载或查询不再被使用时，进行中的 Promise 不会被取消，完成后数据仍会进入缓存。
      - 如果消费了 AbortSignal，Promise 会被取消，查询也必须被取消，状态会回退到之前的状态。
      - 可以把同一个 signal 传给一次或多次 fetch。
      - 调用 queryClient.cancelQueries 并传入 queryKey，会取消查询并回退到之前的状态。
      - 如果已经消费了传给查询函数的 signal，还会额外取消 Promise。
      - silent 默认 false；设为 true 时不把 CancelledError 传给观察者，并返回这次取消所衔接的重试 Promise。
      - revert 默认 true；设为 true 时恢复这次进行中请求开始前的 data 和 status，并把 fetchStatus 设回 idle，只有没有旧数据时才抛出。
      - 取消对 useSuspenseQuery、useSuspenseQueries 和 useSuspenseInfiniteQuery 不生效。
  - title: CancelledError
    url: https://tanstack.com/query/latest/docs/framework/react/reference/classes/CancelledError
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - CancelledError 在 fetch 被取消时由 Retryer 抛出，例如调用 query.cancel。
      - revert 为 true 时，调用方应恢复请求开始前的状态，而不是把错误交给界面。
      - silent 为 true 时，应吞掉这次错误，改为衔接触发这次取消的那次 fetch Promise。
      - 可用 instanceof CancelledError 判断这次失败是不是取消。
  - title: QueryClient cancelQueries source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/queryClient.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - cancelQueries 接收查询过滤器和 CancelOptions，默认把 revert 设为 true。
      - 它会找到所有匹配查询并调用 query.cancel，最后吞掉这些 Promise 的结果。
  - title: Query abort consumption source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/query.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 读取 QueryFunctionContext 上的 signal 时，才会把 abortSignalConsumed 设为 true。
      - 最后一个观察者离开时，若已消费 signal，会以 revert true 取消；否则只停止后续重试，当前请求继续。
      - 取消时若 revert 为 true，会把查询状态恢复成这次 fetch 开始前的快照，并把 fetchStatus 设为 idle。
      - 回退时如果没有旧数据，CancelledError 仍会抛出；观察者默认吞掉它，不会把查询标成 error。
  - title: Retryer CancelledError source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/retryer.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - CancelledError 的 message 是 CancelledError，并带上 revert 与 silent。
      - 取消尚未结束的 fetch 时，Retryer 会 reject 这个 CancelledError。
  - title: CancelOptions types
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/types.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - CancelOptions 只有可选的 revert 和 silent 两个布尔字段。
---

# 查询取消

## 一、学习目标

- 说明查询函数会收到 `AbortSignal`，查询过期或不再被使用时这个信号会被中止。
- 区分默认卸载不取消，以及消费 `AbortSignal` 后卸载会取消并回退。
- 把 `signal` 传给 `fetch`，让进行中的请求真正停掉。
- 用 `queryClient.cancelQueries` 手动取消查询，并说明默认会回退到请求前的状态。
- 说明 `silent` 与 `revert` 两个取消选项，以及取消不会把查询标成业务错误。

## 二、为什么需要查询取消

上一课看清了失败后的自动重试。请求还没结束时，用户也可能已经离开页面、换了筛选条件，或者点了取消。这时继续把结果写进缓存，并不总是你想要的。

TanStack Query 给每个查询函数提供一个 `AbortSignal`。查询过期或不活跃时，这个信号会被中止。你可以继续用普通的 `async/await`，同时在 `queryFn` 里响应取消。

基础课已经把 `signal` 传给 `fetch`。本课要看清另一半：默认卸载**不会**取消；只有消费了这个信号，卸载才会真正中止请求，并回退查询状态。手动取消则走 `cancelQueries`。

## 三、核心概念

### 1. 默认卸载不会取消

官方默认：组件卸载，或查询在 Promise 完成前不再被使用，进行中的请求**不会**被取消。Promise 完成后，数据仍会进入缓存。

这很有用。用户打开任务列表又马上离开，再回来时只要缓存还没被回收，数据已经在。源码对应的行为是：最后一个观察者离开时，如果没有消费 `AbortSignal`，只停止后续重试，当前这次请求继续跑完。

### 2. 消费 AbortSignal 才会真正中止

`QueryFunctionContext` 上的 `signal` 不是普通字段。源码用 getter 提供它：一旦你读取 `context.signal`，就把这次查询标记为“已消费取消信号”。

消费之后，卸载或查询不再被使用时，Promise 会被取消，例如中止 `fetch`。查询本身也会被取消，状态回退到这次请求开始前。

把 `signal` 传给 `fetch` 就是最直接的消费方式：

```tsx
useQuery({
  queryKey: ['tasks', 'list'] as const,
  queryFn: async ({ signal }) => {
    const response = await fetch('/api/tasks', { signal })
    if (!response.ok) {
      throw new Error(`任务请求失败：HTTP ${response.status}`)
    }
    return (await response.json()) as { id: string; title: string }[]
  },
})
```

同一个 `signal` 也可以传给多次 `fetch`。只要读取了它，卸载就会取消。

### 3. 手动取消走 cancelQueries

请求太慢时，可以给用户一个取消按钮。调用 `queryClient.cancelQueries({ queryKey })` 会取消匹配查询，并回退到之前的状态。如果 `queryFn` 已经消费了 `signal`，还会额外中止 Promise。

```tsx
const queryClient = useQueryClient()

function cancelTasks() {
  void queryClient.cancelQueries({ queryKey: ['tasks', 'list'] })
}
```

`cancelQueries` 先按过滤器找到匹配查询，再调用每条查询的 `cancel`。即使没有观察者，只要缓存里还有这条查询，也可以取消。

### 4. 取消会回退，不会变成业务错误

取消选项只有两个字段：

- `silent` 默认 `false`。设为 `true` 时，不把 `CancelledError` 传给观察者（例如 `onError`），并返回这次取消所衔接的重试 Promise。
- `revert` 默认 `true`。设为 `true` 时，恢复这次进行中请求开始前的 `data` 和 `status`，并把 `fetchStatus` 设回 `idle`；只有没有旧数据时才抛出。

`cancelQueries` 源码会把传入选项和 `{ revert: true }` 合并，所以手动取消默认回退。

回退时请看两组状态，不要只看 `isError`：

- 第一次请求还没有数据：取消后 `status` 仍是 `pending`，`fetchStatus` 是 `idle`，`isError` 为 `false`，缓存里没有 `data`。
- 已经成功过、正在重新获取：取消后回到上一份成功数据，`status` 仍是 `success`，`fetchStatus` 回到 `idle`。

`CancelledError` 的 `message` 是 `CancelledError`。`revert` 为 `true` 时，调用方应恢复旧状态，而不是把它当成查询失败画到界面上。没有旧数据时这个错误仍会抛出，但 `useQuery` 默认会吞掉它，不会把查询标成 `error`。

### 5. 取消对 Suspense 查询不生效

官方限制：`useSuspenseQuery`、`useSuspenseQueries` 和 `useSuspenseInfiniteQuery` 上，取消不工作。本课主线仍是 `useQuery`。需要 Suspense 时，不要指望同一套取消按钮。

## 四、用法与示例

### 1. 消费 signal，让 fetch 响应取消

```tsx
import { queryOptions, useQuery } from '@tanstack/react-query'

/** 读取任务列表，并把取消信号交给 fetch。 */
async function loadTasks({ signal }: { signal: AbortSignal }) {
  const response = await fetch('/api/tasks', { signal })
  if (!response.ok) {
    throw new Error(`任务请求失败：HTTP ${response.status}`)
  }
  return (await response.json()) as { id: string; title: string }[]
}

/** 把身份、请求和取消相关配置收进一份配置。 */
function tasksOptions() {
  return queryOptions({
    queryKey: ['tasks', 'list'] as const,
    queryFn: loadTasks,
  })
}
```

解构 `signal` 或写成 `context.signal` 都会消费这个 getter。不要先读出来再丢掉，那也会让卸载取消。

### 2. 用按钮手动取消

```tsx
import { useQuery, useQueryClient } from '@tanstack/react-query'

/** 观察任务列表，并在请求过久时允许取消。 */
function TasksBoard() {
  const queryClient = useQueryClient()
  const tasksQuery = useQuery({
    queryKey: ['tasks', 'list'] as const,
    queryFn: loadTasks,
  })

  return (
    <section>
      {tasksQuery.isFetching && <p>正在读取任务</p>}
      <button
        type="button"
        onClick={() => {
          void queryClient.cancelQueries({ queryKey: ['tasks', 'list'] })
        }}
      >
        取消
      </button>
    </section>
  )
}
```

取消后如果已有旧数据，列表应继续显示旧数据，而不是空白或错误页。

### 3. 需要静默取消时再改 silent

内部重新获取会用 `silent: true` 停掉上一趟 fetch，再衔接到新的 Promise。自己调用时，只有明确不想通知观察者才需要它：

```tsx
await queryClient.cancelQueries({ queryKey: ['tasks', 'list'] }, { silent: true })
```

普通取消按钮保持默认即可：`revert` 为 `true`，`silent` 为 `false`。

## 五、用法示例：观察取消与回退

下面的 Demo 默认消费 `signal`，请求会等约 `1.4` 秒。Demo 关掉了 `retry`，并把 `staleTime` 设为 `Infinity`，避免取消观察被自动重试或后台刷新打断。点“开始查询”后可以立刻“取消查询”，第一次没有旧数据时会回到 `pending` 且 `idle`，`isError` 仍为 `false`。等它成功后再点“再次获取”并中途取消，任务列表会留下林晓、周宁那一份旧数据。

对比卸载：保持“消费 signal”，请求发出后点“隐藏观察者”，查询会取消并回退。先改选“不消费 signal”，再开始并隐藏观察者，请求仍会完成，缓存 `data` 会变成“有”。离开页面会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.intermediate.query-cancellation.query-cancellation-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：以为卸载组件就会取消请求

**触发条件：** 页面切走或条件渲染卸掉 `useQuery` 后，认为网络面板里的请求一定会停。

**原因：** 官方默认不取消未完成的 Promise。只有读取并消费了 `AbortSignal`，最后一个观察者离开时才会 `cancel({ revert: true })`。

**后果：** 用户已经离开，请求仍在打；或者你以为取消了，回来时缓存里却多了一份刚完成的数据。

**错误示例：**

```tsx
useQuery({
  queryKey: ['tasks', 'list'],
  queryFn: async () => {
    const response = await fetch('/api/tasks')
    return (await response.json()) as { id: string }[]
  },
})
```

**正确写法：**

```tsx
useQuery({
  queryKey: ['tasks', 'list'],
  queryFn: async ({ signal }) => {
    const response = await fetch('/api/tasks', { signal })
    return (await response.json()) as { id: string }[]
  },
})
```

**验证方式：** 开始一次较慢的查询后卸掉观察者。不传 `signal` 时请求会完成并写入缓存；传入 `signal` 时查询回退，缓存没有这次结果。

### 错误：读了 signal 却指望卸载后数据仍会写回

**触发条件：** 已经把 `signal` 传给 `fetch`，又按默认“卸载不取消”来设计页面。

**原因：** 读取 `context.signal` 会把 `abortSignalConsumed` 设为 `true`。最后一个观察者离开时查询会被取消并回退。

**后果：** 用户快速进出页面后，缓存是空的，必须重新请求；你预期的“回来就能用”不成立。

**错误示例：**

```tsx
queryFn: async ({ signal }) => {
  const response = await fetch('/api/tasks', { signal })
  return (await response.json()) as { id: string }[]
}
// 同时假设卸载后请求仍会完成并写入缓存
```

**正确写法：**

```tsx
queryFn: async ({ signal }) => {
  const response = await fetch('/api/tasks', { signal })
  return (await response.json()) as { id: string }[]
}
// 接受卸载会取消；需要请求跑完就保持观察者，或不要读取 signal
```

**验证方式：** 消费 `signal` 后在请求完成前隐藏唯一观察者，确认缓存 `data` 仍为“无”，`fetchStatus` 回到 `idle`。

### 错误：把取消渲染成查询失败

**触发条件：** 看到 Promise reject 或 `CancelledError`，就按 `isError` 画出全屏错误。

**原因：** 取消默认 `revert`。没有旧数据时仍可能抛出 `CancelledError`，但观察者会吞掉它，查询状态回到 `pending` 且 `idle`，不是 `error`。

**后果：** 用户点取消后看到“请求失败”，实际只是停在请求前的状态。

**错误示例：**

```tsx
if (tasksQuery.error) {
  return <p role="alert">{tasksQuery.error.message}</p>
}
```

**正确写法：**

```tsx
if (tasksQuery.isError) {
  return <p role="alert">{tasksQuery.error.message}</p>
}

if (tasksQuery.isPending && !tasksQuery.isFetching) {
  return <p>查询已停止，还没有数据。</p>
}
```

**验证方式：** 第一次请求尚未成功时点取消，确认 `isError` 为 `false`，`status` 为 `pending`，`fetchStatus` 为 `idle`。

### 错误：取消按钮只改了本地 loading，没有 cancelQueries

**触发条件：** 用组件 state 把“加载中”设为 false，或直接 `return`，以为请求已经停了。

**原因：** 查询是否取消由 `QueryClient` 和 `queryFn` 是否消费 `signal` 决定，不是由 React 局部布尔值决定。

**后果：** 界面停了，请求还在；稍后数据写回缓存，页面又突然出现结果。

**错误示例：**

```tsx
const [loading, setLoading] = useState(true)

<button type="button" onClick={() => setLoading(false)}>
  取消
</button>
```

**正确写法：**

```tsx
<button
  type="button"
  onClick={() => {
    void queryClient.cancelQueries({ queryKey: ['tasks', 'list'] })
  }}
>
  取消
</button>
```

**验证方式：** 请求进行中点取消，`fetchStatus` 立刻变为 `idle`，且不会在稍后把这次结果写进缓存。

### 错误：在 Suspense 查询上调用 cancelQueries 并指望请求停掉

**触发条件：** 用 `useSuspenseQuery` 读取数据，再给同一条 `queryKey` 绑定取消按钮。

**原因：** 官方写明取消对 `useSuspenseQuery`、`useSuspenseQueries` 和 `useSuspenseInfiniteQuery` 不生效。

**后果：** 按钮没有可观察效果，请求继续，界面仍停在 Suspense 回退。

**错误示例：**

```tsx
const tasksQuery = useSuspenseQuery({
  queryKey: ['tasks', 'list'],
  queryFn: loadTasks,
})

<button
  type="button"
  onClick={() => {
    void queryClient.cancelQueries({ queryKey: ['tasks', 'list'] })
  }}
>
  取消
</button>
```

**正确写法：**

```tsx
const tasksQuery = useQuery({
  queryKey: ['tasks', 'list'] as const,
  queryFn: loadTasks,
})
```

**验证方式：** 同一条慢查询分别用 `useQuery` 和 `useSuspenseQuery` 点取消，只有 `useQuery` 会回退到 `idle`。
:::

## 七、源码推导与适用场景

1. **官方事实：** 查询函数会收到 `AbortSignal`，查询过期或不活跃时这个信号会被中止。默认卸载不取消，完成后数据仍进缓存；消费了 `AbortSignal` 后，Promise 和查询都会被取消，状态回退。`cancelQueries({ queryKey })` 取消匹配查询并回退；消费了 `signal` 时还会中止 Promise。`silent` 默认 `false`，`revert` 默认 `true`。`CancelledError` 带 `revert` 与 `silent`。取消对三个 Suspense 查询钩子不生效。源码里读取 `signal` getter 才会把 `abortSignalConsumed` 设为 `true`；最后一个观察者离开时，已消费则 `cancel({ revert: true })`，未消费则只 `cancelRetry()`。`cancelQueries` 默认合并 `revert: true`。
2. **课程推导：** 需要请求真正停掉时，把 `signal` 传给 `fetch`，再用 `cancelQueries` 做取消按钮。需要“离开后再回来就能用缓存”时，不要读取 `signal`。观察取消结果时看 `fetchStatus` 是否回到 `idle`，以及 `data` 是否回到请求前；不要用 `isError` 判断取消。
3. **适用边界：** 本课不讲解 Mutation 取消、失效、乐观更新里先 `cancelQueries` 再 `setQueryData`、分页占位，也不把 `cancelRefetch`、`networkMode` 或 axios / GraphQL 适配写成主线。axios 0.22+ 可以把同一个 `signal` 传进去；更旧的 axios 要用 `CancelToken`。连续 `refetchQueries` 默认会静默取消上一趟 fetch，那是重新获取选项，不是取消按钮。Suspense 查询的取消限制以官方说明为准，完整用法放到高级阶段。

## 八、练习

:::exercise
### 练习目标

**要求：** 编写 `tasksOptions()`，用 `queryOptions` 收纳 `queryKey` 与 `queryFn`。`queryFn` 从上下文读取 `signal`，传给 `fetch`，非 2xx 时抛出带状态码的 `Error`。组件使用 `useQuery` 和 `useQueryClient`，在请求进行中提供取消按钮，点击后调用 `cancelQueries` 并传入同一条 `queryKey`。用 `QueryClientProvider` 包裹。不要使用 Suspense 查询钩子。

**验收：** 第一次请求尚未成功时点取消，`fetchStatus` 变为 `idle`，`status` 仍为 `pending`，`isError` 为 `false`，缓存没有这次数据；已经成功后再重新获取并中途取消，界面仍显示上一份数据；`queryFn` 必须消费 `signal`；不要把取消画成 `error`。

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

type Task = {
  id: string
  title: string
}

/** 读取任务列表，并把取消信号交给 fetch。 */
async function loadTasks({ signal }: { signal: AbortSignal }): Promise<Task[]> {
  const response = await fetch('/api/tasks', { signal })
  if (!response.ok) {
    throw new Error(`任务请求失败：HTTP ${response.status}`)
  }
  return (await response.json()) as Task[]
}

/** 把任务查询的身份和请求收进一份配置。 */
function tasksOptions() {
  return queryOptions({
    queryKey: ['tasks', 'list'] as const,
    queryFn: loadTasks,
  })
}

/** 观察进行中的查询，并允许手动取消。 */
function CancellationBoard(): ReactElement {
  const queryClient = useQueryClient()
  const tasksQuery = useQuery(tasksOptions())

  return (
    <section>
      <p>{tasksQuery.status}</p>
      <p>{tasksQuery.fetchStatus}</p>
      <p>{String(tasksQuery.isError)}</p>
      {tasksQuery.isFetching && <p>正在读取任务</p>}
      {tasksQuery.isPending && !tasksQuery.isFetching && <p>还没有成功数据</p>}
      {tasksQuery.isSuccess && (
        <ul>
          {tasksQuery.data.map((task) => (
            <li key={task.id}>{task.title}</li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => {
          void queryClient.cancelQueries({ queryKey: ['tasks', 'list'] })
        }}
      >
        取消
      </button>
    </section>
  )
}

/** 提供稳定客户端，避免取消观察丢失。 */
export function App(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <CancellationBoard />
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- 默认卸载不会取消进行中的查询；消费 `AbortSignal` 后，卸载会取消并回退。
- 把 `signal` 传给 `fetch`，进行中的请求才能真正停掉。
- `cancelQueries` 取消匹配查询，默认 `revert` 为 `true`。
- 取消回到请求前的状态，不要把它渲染成 `error`。
- 本课只讲查询取消，不展开写入、失效或 Suspense。

## 十、参考资料

- [Query Cancellation](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation) - 支持默认卸载不取消、消费 AbortSignal 后回退、cancelQueries 与取消选项。
- [CancelledError](https://tanstack.com/query/latest/docs/framework/react/reference/classes/CancelledError) - 支持取消时抛出的错误以及 revert、silent。
- [QueryClient cancelQueries 源码](https://unpkg.com/@tanstack/query-core@5.102.8/src/queryClient.ts) - 支持 cancelQueries 默认 revert 为 true。
- [Query 取消消费源码](https://unpkg.com/@tanstack/query-core@5.102.8/src/query.ts) - 支持读取 signal 才算消费，以及卸载时的取消或继续。
- [Retryer 源码](https://unpkg.com/@tanstack/query-core@5.102.8/src/retryer.ts) - 支持 CancelledError 的 message、revert 与 silent。
- [CancelOptions 类型](https://unpkg.com/@tanstack/query-core@5.102.8/src/types.ts) - 支持 CancelOptions 只有 revert 和 silent。
