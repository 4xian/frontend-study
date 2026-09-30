---
id: react.data.learn.basics.query-error-handling
type: lesson
title: 查询错误处理
summary: 让 queryFn 正确报告失败，并根据首次失败与重新获取失败渲染可靠的错误状态。
domain: frontend
technology: react
module: data
stage: basics
level: beginner
estimatedMinutes: 40
prerequisites:
  - react.data.learn.basics.query-status
related: []
tags:
  - TanStack Query
  - error
  - isError
  - isLoadingError
  - isRefetchError
  - response.ok
appliesTo: TanStack Query 5.102.8、React 19.2.8
verifiedAt: 2026-08-31
objectives:
  - 能说明 queryFn 必须抛出错误或返回 rejected Promise，查询才会进入 error 状态。
  - 能在使用 fetch 时检查 response.ok，并把 HTTP 失败转换为 Error。
  - 能使用 isError 和 error.message 显示受控的错误反馈。
  - 能区分首次查询失败与已有数据时重新获取失败，并在后者保留旧数据。
  - 能通过再次执行查询恢复成功结果，而不把错误处理写成静默返回假数据。
recap:
  - TanStack Query 只把 queryFn 抛出的错误或 rejected Promise 识别为查询失败。
  - fetch 遇到 4xx 或 5xx 时通常仍会 resolve，必须先检查 response.ok。
  - isError 用于判断错误状态，error 提供这次失败的错误对象。
  - isLoadingError 表示首次获取失败，isRefetchError 表示已有数据后的重新获取失败。
  - 首次失败可以只显示错误；重新获取失败时应根据仍然存在的 data 保留可读内容。
sources:
  - title: Query Functions
    url: https://tanstack.com/query/latest/docs/framework/react/guides/query-functions
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - queryFn 必须抛出错误或返回 rejected Promise 才会进入 error 状态。
      - fetch 不会为不成功的 HTTP 响应自动抛错，需要自行检查 response.ok 并抛错。
  - title: Queries
    url: https://tanstack.com/query/latest/docs/framework/react/guides/queries
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - isError 状态下错误对象可从 error 属性读取。
      - 查询渲染通常先判断 isPending，再判断 isError，最后读取成功数据。
  - title: useQuery Reference
    url: https://tanstack.com/query/latest/docs/framework/react/reference/useQuery
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - isLoadingError 表示首次获取失败，isRefetchError 表示重新获取失败。
      - 重新获取失败时 error 和上一次成功的 data 可以同时存在。
  - title: Response.ok
    url: https://developer.mozilla.org/en-US/docs/Web/API/Response/ok
    sourceType: engineering-reference
    appliesTo: Fetch API
    claims:
      - response.ok 在 HTTP 状态码为 200 至 299 时为 true，否则为 false。

---

# 查询错误处理

## 一、学习目标

- 说明 `queryFn` 必须抛出错误或返回 rejected Promise，查询才会进入 `error` 状态。
- 在使用 `fetch` 时检查 `response.ok`，把 HTTP 失败转换为 `Error`。
- 使用 `isError` 和 `error.message` 显示受控的错误反馈。
- 区分首次查询失败与已有数据时重新获取失败，并在后者保留旧数据。
- 通过再次执行查询恢复成功结果，不把错误处理写成静默返回假数据。

## 二、为什么需要显式报告错误

异步函数“完成”不代表请求成功。浏览器的 `fetch` 在收到 HTTP 响应后通常会 resolve，即使状态码是
`404` 或 `503`。如果查询函数直接返回这个响应的 JSON，TanStack Query 会把它当成成功结果，组件就
无法进入错误分支。

查询库需要一个明确的失败信号：查询函数抛出错误，或者返回一个 rejected Promise。组件收到这个信号后，
才能用可预测的状态渲染错误提示，而不是在列表组件内部处理一个格式不正确的响应。

## 三、核心概念

### 1. queryFn 的错误合同

`useQuery` 的 `queryFn` 是一个返回 Promise 的函数。Promise resolve 时表示查询成功，抛出错误或 reject
时表示查询失败：

```tsx
const tasksQuery = useQuery({
  queryKey: ['tasks'],
  queryFn: async () => {
    if (shouldFail) {
      throw new Error('任务服务暂不可用')
    }

    return loadTasks()
  },
})
```

错误对象会出现在查询结果的 `error` 属性中，`status` 会变成 `error`，`isError` 则是同一状态的布尔
判断。当前课程示例统一抛出 `Error`，因此可以读取 `error.message`；如果项目允许抛出其他类型的值，
应先完成项目约定的错误归一化，再读取具体字段。

### 2. fetch 必须检查 response.ok

`fetch` 只在网络请求无法完成时才通常 reject。HTTP 层面的 4xx、5xx 仍然会得到一个 `Response`，所以
应先检查 `ok`：

```tsx
async function loadTasks({ signal }: { signal: AbortSignal }): Promise<Task[]> {
  const response = await fetch('/api/tasks', { signal })

  if (!response.ok) {
    throw new Error(`任务请求失败：HTTP ${response.status}`)
  }

  return (await response.json()) as Task[]
}
```

`response.ok` 在 200 至 299 范围内为 `true`，其他 HTTP 状态为 `false`。错误信息至少应包含稳定的
业务说明和状态码，方便界面展示与日志定位；响应正文是否包含可供用户显示的细节，则由应用的错误模型
决定。

### 3. 首次失败与重新获取失败

错误状态还可以按是否已有成功数据继续区分：

- `isLoadingError`：第一次获取就失败，通常没有可显示的 `data`。
- `isRefetchError`：之前已有成功数据，后续重新获取失败，`data` 仍可能是上一次成功的内容。

因此，错误分支不一定意味着清空整个页面。首次失败可以显示错误占位；重新获取失败时可以在列表旁显示
错误提示，同时继续保留旧列表，等待用户再次执行查询。

## 四、用法与渲染顺序

### 1. 用 isError 读取错误

先判断 `isPending`，再判断 `isError`，最后才把结果当成成功数据读取：

```tsx
const tasksQuery = useQuery({
  queryKey: ['tasks'],
  queryFn: loadTasks,
})

if (tasksQuery.isPending) {
  return <span>加载中</span>
}

if (tasksQuery.isError) {
  return <span>{tasksQuery.error.message}</span>
}

return <TaskList tasks={tasksQuery.data} />
```

这种顺序同时保护运行时和 TypeScript 类型：没有成功数据时不会提前渲染列表，错误状态下可以安全读取
`error`，落到最后时 `data` 才被视为成功查询的数据。

### 2. 重新获取失败时保留 data

如果页面已经有成功数据，重新获取失败不必把列表替换为全屏错误：

```tsx
if (tasksQuery.isLoadingError) {
  return <span>{tasksQuery.error.message}</span>
}

if (tasksQuery.isRefetchError) {
  return (
    <section>
      <p>{tasksQuery.error.message}</p>
      <TaskList tasks={tasksQuery.data} />
    </section>
  )
}

if (tasksQuery.isPending) {
  return <span>加载中</span>
}

return <TaskList tasks={tasksQuery.data} />
```

示例先处理两种错误，再进入成功渲染。实际项目也可以把错误提示放在成功列表上方，但必须保持错误对象
和可用数据的职责分开。重新获取失败后的恢复动作可以调用 `refetch`；自动重试的次数和延迟属于独立的
查询策略，不在本课展开。

### 3. 不要把失败转换成假成功

下面的写法捕获错误后返回空数组，查询会进入 `success`，组件无法知道真实请求失败：

```tsx
const queryFn = async () => {
  try {
    return await loadTasks()
  } catch {
    return []
  }
}
```

如果当前界面需要显示错误，就让错误继续抛出；如果确实需要降级数据，应在独立的数据模型中明确标记
`isFallback` 等信息，而不是把失败伪装成普通成功结果。

## 五、用法示例：观察错误状态与数据保留

下面的 Demo 用本地 `Response` 模拟成功的 200 响应和失败的 503 响应。选择下一次结果后点击“执行查询”，
可以先观察没有数据时的首次错误，再改为成功恢复；成功后再次选择失败，会看到 `isRefetchError` 和旧任务
列表同时存在。Demo 中关闭自动重试，只为了让每次点击对应一次可观察的 queryFn 执行，不展开重试策略。

:::demo{id="react.data.learn.basics.query-error-handling.query-error-handling-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：只用 try/catch 判断 fetch 失败

**触发条件：** 只在 `fetch` reject 时处理错误，不检查返回的 HTTP 状态。

**原因：** 把网络传输失败和 HTTP 业务失败当成同一种事件。

**后果：** `404` 或 `503` 仍可能被解析成成功数据，查询不会进入 `error` 状态。

**错误示例：**

```tsx
const response = await fetch('/api/tasks')
return (await response.json()) as Task[]
```

**正确写法：**

```tsx
const response = await fetch('/api/tasks')

if (!response.ok) {
  throw new Error(`任务请求失败：HTTP ${response.status}`)
}

return (await response.json()) as Task[]
```

**验证方式：** 用一个返回 4xx 或 5xx 的响应执行 queryFn，确认查询结果的 `status` 为 `error`。

### 错误：没有 isError 就读取 error.message

**触发条件：** 组件首次渲染时直接读取 `tasksQuery.error.message`。

**原因：** 忽略查询尚未失败时 `error` 为空，以及成功状态不应显示错误信息。

**后果：** 运行时可能访问空值，或在正常成功页面出现错误提示。

**错误示例：**

```tsx
return <p>{tasksQuery.error.message}</p>
```

**正确写法：**

```tsx
if (tasksQuery.isError) {
  return <p>{tasksQuery.error.message}</p>
}
```

**验证方式：** 分别在 pending、success 和 error 状态渲染组件，确认只有 error 状态读取错误对象。

### 错误：捕获异常后返回空数组

**触发条件：** 在 queryFn 内 catch 错误并返回 `[]`、`null` 或其他默认结果。

**原因：** 把“没有数据”和“请求失败”混成同一个结果。

**后果：** 查询显示为 success，错误提示、监控和后续恢复动作都会丢失。

**错误示例：**

```tsx
const queryFn = () => loadTasks().catch(() => [])
```

**正确写法：**

```tsx
const queryFn = async () => {
  const tasks = await loadTasks()
  return tasks
}
```

**验证方式：** 让 `loadTasks` reject，确认没有被转换成成功的空列表，查询结果仍为 `isError`。

### 错误：重新获取失败时清空已有数据

**触发条件：** 只要 `isError` 为 true 就返回全屏错误，忽略查询结果中仍然存在的旧数据。

**原因：** 没有区分首次获取失败与重新获取失败。

**后果：** 短暂的后台错误会让用户失去上一份可读内容，页面产生不必要的闪烁。

**错误示例：**

```tsx
if (tasksQuery.isError) {
  return <FullPageError message={tasksQuery.error.message} />
}
```

**正确写法：**

```tsx
if (tasksQuery.isLoadingError) {
  return <FullPageError message={tasksQuery.error.message} />
}

if (tasksQuery.isRefetchError) {
  return (
    <section>
      <p>{tasksQuery.error.message}</p>
      <TaskList tasks={tasksQuery.data} />
    </section>
  )
}
```

**验证方式：** 先得到成功数据，再让下一次重新获取失败，确认错误提示出现且旧列表仍然可见。

### 错误：用错误文本代替错误状态

**触发条件：** 在 queryFn 中返回 `{ message: '请求失败' }` 这样的普通数据对象，而不是抛出错误。

**原因：** 让业务响应结构代替了 TanStack Query 的失败合同。

**后果：** `status` 仍为 success，组件必须到处猜测数据是否其实是错误。

**错误示例：**

```tsx
return { message: '任务服务暂不可用' }
```

**正确写法：**

```tsx
throw new Error('任务服务暂不可用')
```

**验证方式：** 让 queryFn 返回和抛出同一条错误信息，比较两次的 `status` 和 `isError` 是否不同。
:::

## 七、源码推导与适用场景

### 1. 官方事实

Query Functions 指南规定，queryFn 必须 resolve 数据，或通过抛错、返回 rejected Promise 表示失败；同一
指南特别提醒，`fetch` 对不成功的 HTTP 响应不会自动抛错，需要应用自行检查 `response.ok`。Queries 指南
将 `error` 作为 `isError` 状态下的错误对象，并建议先处理 pending、再处理 error、最后渲染 data。useQuery
Reference 则把 `isLoadingError` 定义为首次获取失败，把 `isRefetchError` 定义为重新获取失败。

### 2. 课程推导

错误处理的边界应放在 queryFn 和查询结果之间：queryFn 负责把传输层和 HTTP 层失败统一转换成错误，组件
负责根据错误状态选择页面反馈。首次失败通常没有可用数据，重新获取失败则可能同时拥有错误和旧数据；这
就是为什么不能用一个“错误即清空页面”的分支覆盖所有场景。

### 3. 适用边界

本课建立显式错误信号、错误状态渲染和重新获取失败的数据保留。自动重试的次数、延迟和函数策略属于查询
重试主题；错误边界、Suspense 错误传播、缓存新鲜度与持久化属于后续能力。本课 Demo 使用本地响应和手动
执行，仅为了稳定观察错误转换，不代表生产环境必须关闭重试或改用手动查询。

## 八、练习

:::exercise
### 练习目标

**要求：** 编写一个 `useQuery` 查询函数：使用 `fetch` 读取任务列表，遇到非 2xx 响应时抛出包含状态码的
`Error`；组件依次处理 pending、首次错误和成功结果，成功后重新获取失败时仍显示旧列表及错误提示。

**验收：** 非 2xx 响应进入 `isLoadingError` 或 `isRefetchError`；错误状态显示 `error.message`；成功后重新
获取失败时 `tasksQuery.data` 仍用于渲染列表；queryFn 没有把异常转换成空数组或普通成功对象。

**参考答案：**

```tsx
import { useQuery } from '@tanstack/react-query'

type Task = {
  id: string
  title: string
}

/** 使用 fetch 读取任务，并把 HTTP 失败转换成查询错误。 */
async function loadTasks({ signal }: { signal: AbortSignal }): Promise<Task[]> {
  const response = await fetch('/api/tasks', { signal })

  if (!response.ok) {
    throw new Error(`任务请求失败：HTTP ${response.status}`)
  }

  return (await response.json()) as Task[]
}

/** 渲染已经确认成功的任务列表。 */
function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  )
}

/** 区分首次错误和重新获取错误，并在后者保留旧数据。 */
function TasksPanel() {
  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: loadTasks,
  })

  if (tasksQuery.isPending) {
    return <p>加载中</p>
  }

  if (tasksQuery.isLoadingError) {
    return <p role="alert">{tasksQuery.error.message}</p>
  }

  if (tasksQuery.isRefetchError) {
    return (
      <section>
        <p role="alert">{tasksQuery.error.message}</p>
        <TaskList tasks={tasksQuery.data} />
      </section>
    )
  }

  return <TaskList tasks={tasksQuery.data} />
}
```
:::

## 九、本节小结

- `queryFn` 必须抛出错误或返回 rejected Promise，TanStack Query 才能进入 `error` 状态。
- `fetch` 遇到 4xx、5xx 时通常仍会 resolve，先检查 `response.ok` 再解析正文。
- 组件先判断 pending 和 error，再读取 data；错误信息从 `error` 读取。
- `isLoadingError` 对应首次失败，`isRefetchError` 对应已有数据后的重新获取失败。
- 重新获取失败时可以同时显示错误和旧数据，不必让页面回到空白状态。

## 十、参考资料

- [Query Functions](https://tanstack.com/query/latest/docs/framework/react/guides/query-functions) - queryFn 的成功、抛错和 fetch 响应检查合同。
- [Queries](https://tanstack.com/query/latest/docs/framework/react/guides/queries) - `isError`、`error` 以及 pending/error/data 的渲染顺序。
- [useQuery Reference](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery) - `isLoadingError`、`isRefetchError` 和错误结果字段。
- [Response.ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok) - HTTP 200 至 299 成功范围的 Fetch API 定义。
