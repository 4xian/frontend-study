---
id: react.data.learn.intermediate.query-retry
type: lesson
title: 查询重试
summary: 查询失败后按 retry 与 retryDelay 自动再试，重试期间看 failureReason，耗尽后才把错误交给 error。
domain: frontend
technology: react
module: data
stage: intermediate
level: intermediate
estimatedMinutes: 45
prerequisites:
  - react.data.learn.intermediate.parallel-queries
related:
  - react.data.learn.basics.query-error-handling
  - react.data.learn.basics.query-status
  - react.data.learn.intermediate.query-options-reuse
tags:
  - TanStack Query
  - retry
  - 查询重试
  - retryDelay
  - failureCount
  - failureReason
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-10
objectives:
  - 能说明失败查询默认会静默重试，界面上的 error 要等重试耗尽才出现。
  - 能用数字、false、true 或函数配置 retry。
  - 能区分 retry 回调里的 failureCount 和查询结果里的 failureCount。
  - 能在重试尚未结束时读取 failureReason，而不是等 error。
  - 能按错误类型决定要不要继续重试，例如 404 立刻停、503 再试几次。
recap:
  - 查询失败后默认再试 3 次，带指数退避，客户端一共会跑 4 次 queryFn。
  - retry 可设为 false、数字、true 或函数。
  - 重试还没结束时 error 仍为空，失败内容在 failureReason。
  - retry 回调的 failureCount 从 0 起算；结果里的 failureCount 在决定重试后才增加。
  - 本课只讲查询重试，不展开取消、Mutation 重试或离线暂停主线。
sources:
  - title: Query Retries
    url: https://tanstack.com/query/latest/docs/framework/react/guides/query-retries
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 查询函数抛错后会自动重试，默认连续重试 3 次。
      - retry 设为 false 会关闭重试。
      - retry 设为数字时按该次数重试失败请求。
      - retry 设为 true 会无限重试。
      - retry 可以是函数，根据 failureCount 和 error 决定是否继续。
      - 函数里的 failureCount 在第一次重试判断时从 0 开始。
      - 服务端默认 retry 为 0，加快服务端渲染。
      - 重试尚未结束时失败内容在 failureReason，最后一次失败才进入 error。
      - 默认 retryDelay 从 1000ms 起倍增，上限 30 秒。
      - retryDelay 设为数字时每次等待同样时长。
      - 后台标签页里重试会暂停，因为重试遵守与重新获取相同的焦点行为。
  - title: Important Defaults
    url: https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 失败的查询会静默重试 3 次，并使用指数退避，然后才把错误交给界面。
      - 可通过 retry 和 retryDelay 改掉这两个默认值。
  - title: QueryObserverResult types
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/types.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - retry 为 false 时默认不重试，为 true 时无限重试，为数字时重试到失败次数达到该数字。
      - retry 为函数时持续重试直到函数返回 false。
      - retryOnMount 默认 true，为 false 时带 error 的查询挂载不再自动重试。
      - 结果里的 failureCount 每次失败加一，成功时归零。
      - 结果里的 failureReason 是这次重试的失败原因，成功时为 null。
  - title: Retryer source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/retryer.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 未配置 retry 时，服务端默认 0，客户端默认 3。
      - 数字 retry 用 failureCount 小于该数字判断是否继续。
      - 默认延迟是 1000 乘以 2 的 failureCount 次方，不超过 30000。
      - 决定重试后先增加 failureCount，再通知 onFail。
      - 标签页无焦点或离线时，延迟结束后会 pause。
  - title: QueryObserver source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/queryObserver.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 结果里的 failureCount 来自 fetchFailureCount，failureReason 来自 fetchFailureReason。
      - 没有 data 且 status 为 error 时，retryOnMount 为 false 就不会在挂载时重新加载。
---

# 查询重试

## 一、学习目标

- 说明失败查询默认会静默重试，界面上的 `error` 要等重试耗尽才出现。
- 用数字、`false`、`true` 或函数配置 `retry`。
- 区分 `retry` 回调里的 `failureCount` 和查询结果里的 `failureCount`。
- 在重试尚未结束时读取 `failureReason`，而不是等 `error`。
- 按错误类型决定要不要继续重试，例如 404 立刻停、503 再试几次。

## 二、为什么需要查询重试

上一课把互不依赖的查询并排启动。那些请求仍可能失败。短暂的 503、网关超时或刚好断开的连接，往往再试一次就能成功。

如果每次失败都立刻把页面打成错误，用户看到的是一次抖动，不是一次稳定的读取。官方默认因此会先静默重试：查询函数抛错后，TanStack Query 再跑几次，带指数退避，然后才把错误交给界面。

查询错误处理那一课关掉了自动重试，是为了让每次点击对应一次 `queryFn`。那不是生产默认。本课把默认加回来，看清次数、延迟，以及重试还没结束时该读哪一个字段。

## 三、核心概念

### 1. 默认会静默再试 3 次

官方默认：失败的查询会静默重试 3 次，并使用指数退避，然后才把错误交给界面。客户端源码里未配置时 `retry` 是 `3`。

`retry: 3` 表示**额外**重试 3 次。第一次失败后还会再跑 3 次 `queryFn`，一共 4 次。`retry: 0` 或 `retry: false` 都是失败一次就停。

服务端默认是 `0`，为了让服务端渲染尽快结束。本课 Demo 跑在浏览器里，用函数把额外重试限制为 2 次，方便看清过程，而不是把默认 3 次走满。

### 2. retry 的四种写法

可以按单条查询配，也可以写进 `QueryClient` 的 `defaultOptions.queries`。

- `retry: false`：关闭重试。
- `retry: 6`：失败后再试 6 次。
- `retry: true`：一直重试，直到成功或查询被取消。
- `retry: (failureCount, error) => boolean`：自己决定要不要继续。官方说明：这个 `failureCount` 在**第一次重试判断**时从 `0` 开始。

```tsx
useQuery({
  queryKey: ['tasks', 'list'] as const,
  queryFn: loadTasks,
  retry: (failureCount, error) => {
    if (error.message.includes('HTTP 404')) {
      return false
    }
    return failureCount < 2
  },
})
```

上面的函数在第一次失败时收到 `failureCount === 0`。404 立刻返回 `false`，不再重试。503 在 `0`、`1` 时继续，`2` 时停止，所以一共 3 次尝试。

### 3. 重试期间读 failureReason

官方写过：重试还没跑完时，失败内容在 `failureReason`；最后一次尝试仍失败，才进入 `error`。

观察时不要只盯 `isError`。重试过程中：

- `status` 仍是 `pending`（还没有成功数据时）
- `isFetching` 为 `true`，包括两次尝试之间的等待
- `error` 仍是 `null`
- `failureReason` 已经是这次抛出的错误
- `failureCount` 是已经记下来的失败次数

重试耗尽后：`status` 变成 `error`，`isError` 为 `true`，`error` 和 `failureReason` 都有内容。成功时两者都清掉，`failureCount` 归零。

结果里的 `failureCount` 不是回调参数。源码在决定“要重试”之后才加一，并通知观察者。所以第一次失败并决定重试后，界面上的 `failureCount` 是 `1`，而回调刚才看到的是 `0`。

### 4. retryDelay 默认指数退避

重试不是失败后立刻再发。默认延迟从 `1000ms` 起，每次乘 2，上限 `30` 秒：

```ts
Math.min(1000 * 2 ** failureCount, 30000)
```

第一次重试等 1 秒，第二次 2 秒，第三次 4 秒。`retryDelay` 写成数字时，每次都等这么久。Demo 用 `400`，方便看清过程，不是建议生产改成固定短延迟。

### 5. 挂载时的 retryOnMount

`retryOnMount` 默认 `true`。缓存里已经是 `error` 且没有 `data` 时，重新挂载会再跑一遍查询。设为 `false` 时，带着错误挂载不会自动再试。它管的是“挂载时要不要再来一次”，不是两次尝试之间的 `retry`。

## 四、用法与示例

### 1. 按查询关闭或限制次数

```tsx
import { queryOptions, useQuery } from '@tanstack/react-query'

/** 读取任务列表，HTTP 失败时抛错。 */
async function loadTasks({ signal }: { signal: AbortSignal }) {
  const response = await fetch('/api/tasks', { signal })
  if (!response.ok) {
    throw new Error(`任务请求失败：HTTP ${response.status}`)
  }
  return (await response.json()) as { id: string; title: string }[]
}

/** 把身份、请求和重试次数收进一份配置。 */
function tasksOptions() {
  return queryOptions({
    queryKey: ['tasks', 'list'] as const,
    queryFn: loadTasks,
    retry: 2,
    retryDelay: 400,
  })
}

/** 观察有限次重试。 */
function TasksBoard() {
  const tasksQuery = useQuery(tasksOptions())
  return (
    <p>
      {tasksQuery.failureCount} / {String(tasksQuery.failureReason?.message ?? '无')}
    </p>
  )
}
```

`retry: 2` 会在第一次失败后再试 2 次，一共 3 次 `queryFn`。需要全局默认时，写到 `new QueryClient({ defaultOptions: { queries: { retry: 2 } } })`。

### 2. 用函数跳过不必重试的错误

4xx 里的 404 再试多半还是 404。5xx 或网络抖动更值得再试。

```tsx
/** 404 立刻停，其他错误最多额外重试 2 次。 */
function shouldRetryTasks(failureCount: number, error: Error): boolean {
  if (error.message.includes('HTTP 404')) {
    return false
  }
  return failureCount < 2
}

useQuery({
  queryKey: ['tasks', 'list'] as const,
  queryFn: loadTasks,
  retry: shouldRetryTasks,
})
```

判断依据必须来自你抛出的 `Error`。`fetch` 遇到 404 仍会 resolve，要先检查 `response.ok` 再抛错，函数才能读到状态码。

### 3. 重试过程中渲染 failureReason

```tsx
if (tasksQuery.isFetching && tasksQuery.failureCount > 0) {
  return <p>正在重试：{tasksQuery.failureReason?.message}</p>
}

if (tasksQuery.isError) {
  return <p role="alert">{tasksQuery.error.message}</p>
}
```

不要把“还在重试”渲染成最终错误。`isError` 为 `true` 表示这一轮重试已经结束。

## 五、用法示例：观察自动重试

下面的 Demo 默认请求 503。点“开始查询”后，`retry` 函数允许额外 2 次重试，每次间隔 `400ms`。上方的请求次数会走到 3，重试期间 `failureReason` 有内容、`error` 仍为“无”，耗尽后两者都显示 503。改选 404 再重置并开始，请求次数停在 1。改选成功则 `failureCount` 归零。离开页面会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.intermediate.query-retry.query-retry-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：失败后立刻把页面当成最终错误

**触发条件：** `queryFn` 一抛错就根据 `isPending` 结束去渲染全屏错误，或以为默认只请求一次。

**原因：** 客户端默认还会再试 3 次。重试过程中 `status` 仍可能是 `pending`，`error` 仍是 `null`。

**后果：** 短暂 503 被画成失败；或者你以为只有 1 次请求，网络面板里却出现 4 次。

**错误示例：**

```tsx
useQuery({
  queryKey: ['tasks', 'list'],
  queryFn: loadTasks,
})

if (!tasksQuery.isPending && !tasksQuery.isSuccess) {
  return <p>失败</p>
}
```

**正确写法：**

```tsx
if (tasksQuery.isFetching && tasksQuery.failureCount > 0) {
  return <p>正在重试</p>
}

if (tasksQuery.isError) {
  return <p role="alert">{tasksQuery.error.message}</p>
}
```

**验证方式：** 保持默认 `retry`，让查询稳定失败，确认 `queryFn` 执行 4 次后 `isError` 才为 `true`。

### 错误：对 404 使用默认重试

**触发条件：** 所有错误都走默认 `retry: 3`，包括资源不存在。

**原因：** 默认重试不区分状态码。404 再试 3 次结果通常不变。

**后果：** 多打三次注定失败的请求，最终错误出现得更晚。

**错误示例：**

```tsx
useQuery({
  queryKey: ['tasks', 'detail', taskId],
  queryFn: loadTask,
})
```

**正确写法：**

```tsx
useQuery({
  queryKey: ['tasks', 'detail', taskId],
  queryFn: loadTask,
  retry: (failureCount, error) =>
    !error.message.includes('HTTP 404') && failureCount < 3,
})
```

**验证方式：** 让接口返回 404，请求次数为 1，`isError` 立刻为 `true`。

### 错误：重试还没结束就读取 error

**触发条件：** 用 `tasksQuery.error.message` 做重试提示，或用 `isError` 判断“已经失败过”。

**原因：** 官方把未结束的失败放在 `failureReason`。`error` 要等最后一次尝试结束。

**后果：** 重试过程中 `error` 为 `null`，提示空白，或误以为查询还没失败。

**错误示例：**

```tsx
<p>{tasksQuery.error?.message ?? '还没有失败'}</p>
```

**正确写法：**

```tsx
<p>{tasksQuery.failureReason?.message ?? '还没有失败'}</p>
```

**验证方式：** 503 第一次失败后、第二次请求发出前，`failureReason` 有文案，`error` 仍为空。

### 错误：把两个 failureCount 当成同一个数

**触发条件：** 在 `retry` 函数里写 `failureCount < 3`，又指望结果里的 `failureCount` 同时从 `0` 长到 `2`。

**原因：** 回调参数在第一次重试判断时是 `0`。结果里的值来自 `fetchFailureCount`，在决定重试之后才加一。

**后果：** 实际尝试次数比你在界面上数到的“当前 failureCount”多一次，或函数比预想更早返回 `false`。

**错误示例：**

```tsx
retry: (failureCount) => failureCount < 3,
// 同时把界面上的 failureCount === 3 当成“还会再试”
```

**正确写法：**

```tsx
retry: (failureCount) => failureCount < 2,
// 回调 0、1 继续，2 停止；界面在重试中会看到 1、2，耗尽后是 3
```

**验证方式：** 用函数 `failureCount < 2` 打 503，请求次数为 3；重试中界面 `failureCount` 为 1 和 2，结束后为 3。

### 错误：retry 设为 true 后不再看停止条件

**触发条件：** 为了“一定要成功”写成 `retry: true`，服务持续 500。

**原因：** `true` 表示无限重试，只在成功或查询被取消时停下。

**后果：** 失败接口被持续打，页面一直 `isFetching`，没有最终 `error`。

**错误示例：**

```tsx
useQuery({
  queryKey: ['tasks', 'list'],
  queryFn: loadTasks,
  retry: true,
})
```

**正确写法：**

```tsx
useQuery({
  queryKey: ['tasks', 'list'],
  queryFn: loadTasks,
  retry: 3,
})
```

**验证方式：** 保持失败响应，有限 `retry` 会进入 `isError`；`true` 则请求次数持续增加且 `isError` 一直为 `false`。
:::

## 七、源码推导与适用场景

1. **官方事实：** 查询函数抛错后会自动重试，客户端默认 3 次，服务端默认 0。`retry` 可为 `false`、数字、`true` 或函数；函数的 `failureCount` 第一次为 `0`。未结束的失败在 `failureReason`，最后一次才进入 `error`。默认延迟是 `Math.min(1000 * 2 ** failureCount, 30000)`。数字 `retry` 用 `failureCount < retry` 判断是否继续，因此默认一共 4 次 `queryFn`。决定重试后先增加内部计数，再通过 `onFail` 更新 `fetchFailureCount` / `fetchFailureReason`；观察者把它们暴露为 `failureCount` / `failureReason`。标签页无焦点或离线时，延迟结束后会暂停。
2. **课程推导：** 先确认 `queryFn` 会为 HTTP 失败抛错，再决定重试策略。短暂故障用有限次数加退避；明确的 404 用函数立刻停。界面在 `isFetching && failureCount > 0` 时显示“正在重试”，在 `isError` 时显示最终错误。
3. **适用边界：** 本课不讲解查询取消、Mutation 的 `retry`、`networkMode` 主线，也不把 `refetchInterval` 当成重试替代方案。后台标签页里内置重试会暂停；需要后台继续时，官方建议关掉 `retry`、自己控制重新获取。`retry: true` 没有次数上限，不能当作默认。能改接口避免必然失败时，不要靠重试硬撑。

## 八、练习

:::exercise
### 练习目标

**要求：** 编写 `tasksOptions()`，用 `queryOptions` 收纳 `queryKey` 与 `queryFn`。`queryFn` 使用 `fetch`，非 2xx 时抛出带状态码的 `Error`。`retry` 写成函数：消息包含 `HTTP 404` 时返回 `false`，否则在 `failureCount < 2` 时继续。`retryDelay` 用固定数字。组件同时展示请求过程中的 `failureCount`、`failureReason` 和最终 `error`。用 `QueryClientProvider` 包裹。

**验收：** 503 会执行 3 次 `queryFn` 再进入 `isError`；404 只执行 1 次；重试尚未结束时 `error` 为空、`failureReason` 有内容；不要使用 `retry: true`；不要把失败改写成返回空数组。

**参考答案：**

```tsx
import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery,
} from '@tanstack/react-query'
import { useState, type ReactElement } from 'react'

type Task = {
  id: string
  title: string
}

/** 读取任务列表，并把 HTTP 失败转换成查询错误。 */
async function loadTasks({ signal }: { signal: AbortSignal }): Promise<Task[]> {
  const response = await fetch('/api/tasks', { signal })
  if (!response.ok) {
    throw new Error(`任务请求失败：HTTP ${response.status}`)
  }
  return (await response.json()) as Task[]
}

/** 404 立刻停，其他错误最多额外重试 2 次。 */
function shouldRetryTasks(failureCount: number, error: Error): boolean {
  if (error.message.includes('HTTP 404')) {
    return false
  }
  return failureCount < 2
}

/** 把任务查询的身份、请求和重试策略收进一份配置。 */
function tasksOptions() {
  return queryOptions({
    queryKey: ['tasks', 'list'] as const,
    queryFn: loadTasks,
    retry: shouldRetryTasks,
    retryDelay: 400,
  })
}

/** 观察重试次数与 failureReason。 */
function RetryBoard(): ReactElement {
  const tasksQuery = useQuery(tasksOptions())

  return (
    <section>
      <p>{tasksQuery.failureCount}</p>
      <p>{tasksQuery.failureReason?.message ?? '无'}</p>
      <p>{tasksQuery.error?.message ?? '无'}</p>
      {tasksQuery.isFetching && tasksQuery.failureCount > 0 && <p>正在重试</p>}
      {tasksQuery.isError && <p role="alert">{tasksQuery.error.message}</p>}
    </section>
  )
}

/** 提供稳定客户端，避免重试观察丢失。 */
export function App(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <RetryBoard />
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- 失败查询默认再试 3 次，客户端一共 4 次 `queryFn`，然后才进入 `error`。
- `retry` 用 `false`、数字、`true` 或函数配置；函数的 `failureCount` 从 `0` 起算。
- 重试尚未结束时读 `failureReason`，不要等 `error`。
- 404 这类确定失败应用函数立刻停，不要走满默认次数。
- 本课只讲查询重试，不展开取消或写入。

## 十、参考资料

- [Query Retries](https://tanstack.com/query/latest/docs/framework/react/guides/query-retries) - 支持 retry、retryDelay、failureReason 与默认 3 次重试。
- [Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults) - 支持失败查询会静默重试 3 次并使用指数退避。
- [QueryObserverResult 类型](https://unpkg.com/@tanstack/query-core@5.102.8/src/types.ts) - 支持 failureCount、failureReason 与 retryOnMount。
- [Retryer 源码](https://unpkg.com/@tanstack/query-core@5.102.8/src/retryer.ts) - 支持客户端默认 3、数字比较与默认延迟公式。
- [QueryObserver 源码](https://unpkg.com/@tanstack/query-core@5.102.8/src/queryObserver.ts) - 支持把 fetchFailureCount 暴露为 failureCount。
