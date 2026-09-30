---
id: react.data.learn.basics.query-function-and-fetch
type: lesson
title: Query Function 与 fetch
summary: 编写符合 TanStack Query 合同的查询函数，使用 fetch 检查响应、解析 JSON 并响应取消信号。
domain: frontend
technology: react
module: data
stage: basics
level: beginner
estimatedMinutes: 40
prerequisites:
  - react.data.learn.basics.first-use-query
related: []
tags:
  - TanStack Query
  - queryFn
  - fetch
  - Response.ok
  - AbortSignal
appliesTo: TanStack Query 5.102.8、React 19.2.8
verifiedAt: 2026-08-31
objectives:
  - 能说明 queryFn 负责读取并返回查询数据的 Promise。
  - 能使用 fetch 发起查询请求，并检查 Response.ok 后再解析 JSON。
  - 能让查询函数在请求失败时抛出 Error，而不是返回错误数据或 undefined。
  - 能从 QueryFunctionContext 读取 signal，并将 AbortSignal 传给 fetch。
  - 能区分请求函数的职责与查询状态、缓存和重试配置的职责。
recap:
  - queryFn 是返回数据 Promise 的异步函数，成功结果不能是 undefined。
  - fetch 只会在网络层失败时 reject，HTTP 错误状态需要通过 response.ok 显式检查。
  - response.json() 返回解析 JSON 的 Promise，解析结果应成为 queryFn 的返回值。
  - TanStack Query 通过 QueryFunctionContext 提供 signal；把它传给 fetch 才能让请求响应查询取消。
  - 请求函数负责读取和转换数据，查询状态、缓存和重试由 useQuery 与 QueryClient 管理。
sources:
  - title: Query Functions
    url: https://tanstack.com/query/latest/docs/framework/react/guides/query-functions
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - queryFn 必须返回解析数据或抛出错误的 Promise。
      - queryFn 接收包含 queryKey 和 signal 的 QueryFunctionContext。
      - 查询函数成功时返回 undefined 不符合查询结果合同。
  - title: Query Cancellation
    url: https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - TanStack Query 向查询函数提供 AbortSignal。
      - 将 signal 传给支持取消的请求客户端可以取消进行中的请求。
  - title: useQuery Reference
    url: https://tanstack.com/query/latest/docs/framework/react/reference/useQuery
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - useQuery 的 queryFn 是返回数据或抛出错误的 Promise 函数。
      - 查询函数的成功数据不能是 undefined。
  - title: Response.ok
    url: https://developer.mozilla.org/en-US/docs/Web/API/Response/ok
    sourceType: official-reference
    appliesTo: Fetch API
    claims:
      - Response.ok 在 HTTP 状态处于 200 到 299 范围时为 true。
      - HTTP 错误状态不会仅因为状态码而让 fetch Promise reject。
  - title: Response.json()
    url: https://developer.mozilla.org/en-US/docs/Web/API/Response/json
    sourceType: official-reference
    appliesTo: Fetch API
    claims:
      - response.json() 异步读取响应并解析为 JavaScript 值。
      - JSON 解析失败时返回的 Promise 会 reject。
---

# Query Function 与 fetch

## 一、学习目标

- 说明 `queryFn` 负责读取并返回查询数据的 Promise。
- 使用 `fetch` 发起查询请求，并在解析前检查 `response.ok`。
- 让请求失败通过抛错进入查询的失败结果，而不是返回错误数据。
- 从 `QueryFunctionContext` 读取 `signal`，并将它传给 `fetch`。
- 区分请求函数与查询状态、缓存、重试策略的职责。

## 二、为什么需要一个明确的 queryFn

上一课已经用 `useQuery` 声明了异步数据依赖，但查询还需要一个真正读取数据的函数。这个函数就是
`queryFn`：它接收 TanStack Query 提供的上下文，发起请求，完成响应转换，最后把可用数据交给查询。

如果只调用 `fetch` 却不返回 Promise，或者把 HTTP 错误当成成功结果，`useQuery` 就无法准确知道这次读取
是否成功。把请求合同集中在 `queryFn` 中，组件可以继续只关注查询结果如何渲染。

## 三、queryFn 的返回合同

### 1. 成功时返回数据 Promise

`queryFn` 可以是同步返回 Promise 的函数，也可以使用 `async`。无论写法怎样，成功路径都必须解析为查询
数据，不能解析为 `undefined`：

```tsx
type Task = {
  id: string
  title: string
}

/** 返回查询可以保存和渲染的任务数组。 */
async function loadTasks(): Promise<Task[]> {
  return [{ id: 't-401', title: '检查响应' }]
}
```

在真实请求中，Promise 的结果通常来自 `response.json()`。数据类型可以由接口合同或运行时校验决定，本课
只关注请求函数必须返回一个确定的数据结果。

### 2. 失败时抛出错误

查询函数遇到不能使用的响应时应抛出 `Error`。TanStack Query 才能把这次执行识别为失败，并将错误交给查询
结果；请求函数不应该把错误对象伪装成成功数据：

```tsx
/** 检查 HTTP 响应，失败时让查询执行进入错误分支。 */
async function loadTasks(): Promise<Task[]> {
  const response = await fetch('/api/tasks')

  if (!response.ok) {
    throw new Error(`任务请求失败：${response.status}`)
  }

  return (await response.json()) as Task[]
}
```

## 四、使用 fetch 完成一次查询读取

### 1. 检查 Response.ok

浏览器 `fetch` 的 Promise 主要表示请求是否完成网络层通信。即使服务器返回 404 或 500，Promise 也可能正常
完成，因此不能只依赖 `try/catch` 判断 HTTP 成功。

`Response.ok` 在 200 到 299 的状态码范围内为 `true`。先检查它，再读取正文，可以把 HTTP 错误统一转换为
查询函数抛出的错误：

```tsx
const response = await fetch('/api/tasks')

if (!response.ok) {
  throw new Error(`任务请求失败：${response.status}`)
}
```

### 2. 解析 response.json()

`response.json()` 返回一个 Promise。必须等待它完成，并把解析后的值作为 `queryFn` 的返回值：

```tsx
/** 读取通过 HTTP 返回的任务 JSON。 */
async function loadTasks(): Promise<Task[]> {
  const response = await fetch('/api/tasks')

  if (!response.ok) {
    throw new Error(`任务请求失败：${response.status}`)
  }

  const tasks = (await response.json()) as Task[]
  return tasks
}
```

JSON 解析失败时，`response.json()` 的 Promise 也会 reject；不需要把解析异常改写成成功结果。

### 3. 消费 QueryFunctionContext.signal

TanStack Query 会把 `QueryFunctionContext` 传给 `queryFn`。其中的 `signal` 是一个 `AbortSignal`，可以直接
交给原生 `fetch`：

```tsx
import type { QueryFunctionContext } from '@tanstack/react-query'

const tasksQueryKey = ['lesson-tasks'] as const

/** 使用查询上下文中的取消信号读取任务。 */
async function loadTasks({
  signal,
}: QueryFunctionContext<typeof tasksQueryKey>): Promise<Task[]> {
  const response = await fetch('/api/tasks', { signal })

  if (!response.ok) {
    throw new Error(`任务请求失败：${response.status}`)
  }

  return (await response.json()) as Task[]
}
```

当查询被取消时，传入的信号会通知 `fetch` 中止进行中的请求。是否消费这个信号由请求客户端决定；本课使用
原生 `fetch`，所以直接传入即可。

### 4. 放回 useQuery

把函数交给 `useQuery` 时，仍然使用上一课建立的对象形式，并保留查询 key：

```tsx
const tasksQuery = useQuery({
  queryKey: tasksQueryKey,
  queryFn: loadTasks,
})
```

`useQuery` 负责执行和观察这个 Promise；`loadTasks` 只负责请求、响应检查和数据解析。缓存、查询状态和重试
属于查询配置与客户端的职责，不在这个函数中手动实现。

## 五、用法示例：本地可重复的 fetch 查询

下面的 Demo 用一个 `data:` JSON 资源模拟接口响应，因此每次运行都得到确定数据，同时仍然经过浏览器原生
`fetch`、`Response.ok`、`response.json()` 和 `AbortSignal` 这条真实路径。点击“重新执行 queryFn”可以再次
触发请求函数；源码面板展示的就是实际运行的 TSX 与 CSS。

:::demo{id="react.data.learn.basics.query-function-and-fetch.query-function-and-fetch-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：只用 try/catch 判断 HTTP 成功

**触发条件：** `fetch` 没有抛出异常就直接解析正文，没有检查 `response.ok`。

**原因：** 把网络层请求完成误认为 HTTP 状态成功。

**后果：** 404 或 500 的响应可能进入成功解析路径，查询不会得到准确的失败结果。

**错误示例：**

```tsx
/** 错误：HTTP 失败状态仍可能进入 json 解析。 */
async function loadTasks(): Promise<Task[]> {
  try {
    const response = await fetch('/api/tasks')
    return (await response.json()) as Task[]
  } catch (error) {
    throw error
  }
}
```

**正确写法：**

```tsx
/** 先检查 HTTP 状态，再解析任务正文。 */
async function loadTasks(): Promise<Task[]> {
  const response = await fetch('/api/tasks')

  if (!response.ok) {
    throw new Error(`任务请求失败：${response.status}`)
  }

  return (await response.json()) as Task[]
}
```

**验证方式：** 使用一个返回 404 的响应测试，确认 `queryFn` 抛出错误而不是返回成功数据。

### 错误：忘记返回 response.json()

**触发条件：** 调用了 `response.json()`，但没有 `return` 或 `await` 它。

**原因：** 把“启动解析”误认为“把解析结果交给查询”。

**后果：** `queryFn` 可能解析为 `undefined`，不符合查询数据合同。

**错误示例：**

```tsx
/** 错误：函数没有把 JSON 结果返回给 queryFn。 */
async function loadTasks(): Promise<Task[]> {
  const response = await fetch('/api/tasks')

  if (!response.ok) throw new Error('请求失败')

  response.json()
}
```

**正确写法：**

```tsx
/** 返回解析后的任务数据。 */
async function loadTasks(): Promise<Task[]> {
  const response = await fetch('/api/tasks')

  if (!response.ok) throw new Error('请求失败')

  return (await response.json()) as Task[]
}
```

**验证方式：** 检查 `queryFn` 的成功返回类型，确认它是 `Promise<Task[]>` 而不是 `Promise<void>`。

### 错误：把 HTTP 错误对象当成成功数据返回

**触发条件：** 响应失败时返回 `{ error: ... }` 或把错误信息放进正常列表结构。

**原因：** 试图让组件自行猜测数据是否可用，绕过查询的失败合同。

**后果：** 查询仍会被标记为成功，缓存可能保存不可渲染或语义错误的数据。

**错误示例：**

```tsx
/** 错误：失败响应被伪装成成功结果。 */
async function loadTasks(): Promise<Task[]> {
  const response = await fetch('/api/tasks')

  if (!response.ok) {
    return []
  }

  return (await response.json()) as Task[]
}
```

**正确写法：**

```tsx
/** 失败响应通过抛错交给查询处理。 */
async function loadTasks(): Promise<Task[]> {
  const response = await fetch('/api/tasks')

  if (!response.ok) {
    throw new Error(`任务请求失败：${response.status}`)
  }

  return (await response.json()) as Task[]
}
```

**验证方式：** 让接口返回非 2xx 状态，确认查询结果进入失败分支，而不是把空数组当成成功数据。

### 错误：忽略 QueryFunctionContext.signal

**触发条件：** `queryFn` 接收了上下文却没有把 `signal` 传给支持取消的请求客户端。

**原因：** 只关注请求结果，没有连接查询的取消生命周期。

**后果：** 查询被取消后，底层请求仍可能继续消耗网络和解析资源。

**错误示例：**

```tsx
/** 错误：查询信号没有传给 fetch。 */
async function loadTasks({}: QueryFunctionContext): Promise<Task[]> {
  const response = await fetch('/api/tasks')
  return (await response.json()) as Task[]
}
```

**正确写法：**

```tsx
/** 将 TanStack Query 的取消信号交给 fetch。 */
async function loadTasks({ signal }: QueryFunctionContext): Promise<Task[]> {
  const response = await fetch('/api/tasks', { signal })

  if (!response.ok) throw new Error(`任务请求失败：${response.status}`)

  return (await response.json()) as Task[]
}
```

**验证方式：** 检查 fetch 的第二个参数包含同一个 `signal`，并在请求尚未完成时卸载查询组件观察请求可被中止。

### 错误：在 queryFn 中实现查询状态和缓存

**触发条件：** 请求函数内部自行维护 loading、缓存或重试计数，并把这些状态混入返回数据。

**原因：** 把请求读取职责和 TanStack Query 的职责混在了一起。

**后果：** 状态来源重复，缓存和重试行为难以与 `useQuery` 的结果保持一致。

**错误示例：**

```tsx
/** 错误：请求函数不应维护组件级 loading 状态。 */
async function loadTasks(): Promise<{ loading: boolean; tasks: Task[] }> {
  let loading = true
  const response = await fetch('/api/tasks')
  loading = false
  return { loading, tasks: (await response.json()) as Task[] }
}
```

**正确写法：**

```tsx
/** 请求函数只返回查询数据；loading 由 useQuery 提供。 */
async function loadTasks(): Promise<Task[]> {
  const response = await fetch('/api/tasks')

  if (!response.ok) throw new Error(`任务请求失败：${response.status}`)

  return (await response.json()) as Task[]
}
```

**验证方式：** 检查 queryFn 的返回值只包含接口数据，等待状态通过 `useQuery` 返回结果读取。
:::

## 七、源码推导与适用场景

### 1. 官方事实

TanStack Query 的 Query Functions 指南规定，查询函数必须返回解析为数据或抛出错误的 Promise，并通过
`QueryFunctionContext` 接收查询上下文。Query Cancellation 指南说明，查询函数可以消费提供的
`AbortSignal`；原生 `fetch` 接收该信号后能够响应中止。Fetch API 的 `Response.ok` 只在 2xx 状态时为真，
而 `response.json()` 异步解析响应正文。

### 2. 课程推导

可以把 `queryFn` 固定成一条小流水线：接收上下文 -> 调用支持 `signal` 的请求客户端 -> 检查响应 -> 解析
数据 -> 返回数据。任何失败都通过抛错离开这条流水线，查询层就能统一处理失败结果。

### 3. 适用边界

本课的请求函数适合读取 JSON API。身份认证、请求参数进入 query key、重试策略、缓存配置和 Mutation 属于
其他知识点；它们可以调用同样的 `fetch` 基础，但不应在每个 `queryFn` 中重复实现查询层能力。

## 八、练习

:::exercise
### 练习目标

**要求：** 编写一个 `loadProjects` 查询函数，接收 `QueryFunctionContext`，使用 `fetch` 请求
`/api/projects`，检查 `response.ok`，解析并返回 `Project[]`，同时把 `signal` 传给 `fetch`。

**验收：** 成功时函数返回 `Promise<Project[]>`；非 2xx 响应会抛出 `Error`；`fetch` 的第二个参数使用了
上下文中的 `signal`；函数没有返回 `undefined` 或自定义 loading 字段。

**参考答案：**

```tsx
import type { QueryFunctionContext } from '@tanstack/react-query'

type Project = {
  id: string
  name: string
}

const projectsQueryKey = ['lesson-projects'] as const

/** 使用 fetch 读取项目列表，并遵守 queryFn 的返回与取消合同。 */
async function loadProjects({
  signal,
}: QueryFunctionContext<typeof projectsQueryKey>): Promise<Project[]> {
  const response = await fetch('/api/projects', { signal })

  if (!response.ok) {
    throw new Error(`项目请求失败：${response.status}`)
  }

  return (await response.json()) as Project[]
}
```
:::

## 九、本节小结

- `queryFn` 成功时返回数据 Promise，失败时抛出错误，不能成功解析为 `undefined`。
- `fetch` 后先检查 `response.ok`，再等待 `response.json()`。
- 将 `QueryFunctionContext.signal` 传给 `fetch`，请求才能响应查询取消。
- 请求函数只负责读取和转换数据；查询状态、缓存和重试由 TanStack Query 管理。

## 十、参考资料

- [Query Functions](https://tanstack.com/query/latest/docs/framework/react/guides/query-functions) - 查询函数的返回合同与 `QueryFunctionContext`。
- [Query Cancellation](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation) - `AbortSignal` 的来源和请求取消用法。
- [useQuery Reference](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery) - `queryFn` 的选项合同和成功数据限制。
- [Response.ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok) - HTTP 响应成功状态的判断规则。
- [Response.json()](https://developer.mozilla.org/en-US/docs/Web/API/Response/json) - 响应正文 JSON 解析行为。
