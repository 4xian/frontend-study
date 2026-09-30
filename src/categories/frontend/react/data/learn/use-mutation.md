---
id: react.data.learn.intermediate.use-mutation
type: lesson
title: useMutation
summary: 用 useMutation 声明一次写入，调用 mutate 或 mutateAsync 后才执行，并读取 idle、pending、success、error。
domain: frontend
technology: react
module: data
stage: intermediate
level: intermediate
estimatedMinutes: 45
prerequisites:
  - react.data.learn.basics.first-use-query
  - react.data.learn.basics.query-status
related:
  - react.data.learn.basics.query-function-and-fetch
  - react.data.learn.basics.query-error-handling
  - react.data.learn.basics.query-client-and-provider
tags:
  - TanStack Query
  - useMutation
  - mutationFn
  - mutate
  - mutateAsync
  - reset
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-10
objectives:
  - 能说明 mutation 用来创建、更新、删除数据或执行服务端副作用，不会在挂载时自动请求。
  - 能用 useMutation 提供 mutationFn，并用 mutate 传入变量触发写入。
  - 能区分 idle、pending、error、success，以及 isIdle、isPending、isError、isSuccess。
  - 能说明 mutate 不返回可供等待的结果，mutateAsync 会在成功时 resolve、失败时 throw。
  - 能用 reset 清掉 data 和 error，让 mutation 回到 idle。
recap:
  - useQuery 在声明后会按查询规则请求；useMutation 要等 mutate 或 mutateAsync 才执行。
  - mutation 同一时刻只有 idle、pending、error、success 四种状态之一。
  - 成功时读 data，失败时读 error；mutationFn 必须抛出错误或返回 rejected Promise。
  - mutate 是触发函数，内部会吞掉 Promise；需要等待结果时用 mutateAsync。
  - reset 清掉这次写入的 data 和 error，回到新鲜的 idle。
sources:
  - title: Mutations
    url: https://tanstack.com/query/latest/docs/framework/react/guides/mutations
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - mutation 通常用来创建、更新、删除数据或执行服务端副作用。
      - TanStack Query 为此导出 useMutation。
      - mutation 同一时刻只能处于 idle、pending、error、success 之一。
      - isIdle 或 status 为 idle 表示空闲或刚重置。
      - isPending 或 status 为 pending 表示正在执行。
      - isError 或 status 为 error 表示遇到错误。
      - isSuccess 或 status 为 success 表示成功，并且 mutation data 可用。
      - 失败时通过 error 读取错误。
      - 成功时通过 data 读取结果。
      - 调用 mutate 时传入单个变量或对象，交给 mutationFn。
      - reset 用来清掉这次请求的 error 或 data。
      - mutateAsync 返回 Promise，成功时 resolve，失败时 throw。
      - 默认不会在错误后重试 mutation，可以用 retry 打开。
  - title: useMutation
    url: https://tanstack.com/query/latest/docs/framework/react/reference/functions/useMutation
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - useMutation 是创建、更新、删除数据或执行服务端副作用的 hook。
      - mutate 与 mutateAsync 都可以接收每次调用的回调。
      - 需要等待每次调用的 Promise 时使用 mutateAsync。
  - title: useMutation source
    url: https://unpkg.com/@tanstack/react-query@5.102.8/src/useMutation.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - useMutation 创建 MutationObserver，并用 useSyncExternalStore 订阅当前结果。
      - 返回给组件的 mutate 会调用 observer.mutate，并用 catch 吞掉 Promise。
      - 返回的 mutateAsync 就是观察者结果里的 mutate，仍是返回 Promise 的那一个。
  - title: MutationObserver source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/mutationObserver.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 观察者默认状态来自 getDefaultState，status 为 idle。
      - isPending、isSuccess、isError、isIdle 由 status 派生。
      - mutate 会摘掉当前 mutation 观察者，再 build 一条新 mutation 并 execute。
      - reset 会摘掉观察者、清空当前 mutation，结果回到默认 idle。
  - title: Mutation source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/mutation.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 默认状态 status 为 idle，data 为 undefined，error 为 null。
      - 开始执行时 dispatch pending，并清空 data 和 error。
      - mutationFn 缺省时拒绝，错误为 No mutationFn found。
      - 默认 retry 为 0。
      - 成功时 dispatch success 并返回 data；失败时 dispatch error 并再 throw。
---

# useMutation

## 一、学习目标

- 说明 mutation 用来创建、更新、删除数据或执行服务端副作用，不会在挂载时自动请求。
- 用 `useMutation` 提供 `mutationFn`，并用 `mutate` 传入变量触发写入。
- 区分 `idle`、`pending`、`error`、`success`，以及 `isIdle`、`isPending`、`isError`、`isSuccess`。
- 说明 `mutate` 不返回可供等待的结果，`mutateAsync` 会在成功时 resolve、失败时 throw。
- 用 `reset` 清掉 `data` 和 `error`，让 mutation 回到 `idle`。

## 二、为什么需要 useMutation

`useQuery` 描述“组件依赖哪份远程数据”。挂载后，查询会按自己的规则去请求、缓存和重新获取。

创建任务不是这种依赖。林晓点按钮，才应该发出写入。没点之前不应请求，失败也不该被当成查询缓存里的那份列表。

TanStack Query 把这类创建、更新、删除和服务端副作用交给 `useMutation`。它声明怎么写，但要等 `mutate` 或 `mutateAsync` 才执行。

## 三、核心概念

### 1. mutation 不会自动跑

官方把 mutation 和 query 分开：query 读取并缓存服务端状态，mutation 负责改数据或做副作用。

`useMutation` 挂载后停在 `idle`。没有 `queryKey` 那种“声明即订阅”。要写入时，调用返回结果上的 `mutate` 或 `mutateAsync`。

```tsx
const mutation = useMutation({
  mutationFn: (newTask: { title: string }) => {
    return fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(`任务创建失败：HTTP ${response.status}`)
      }
      return (await response.json()) as CreatedTask
    })
  },
})

mutation.mutate({ title: '核对创建任务' })
```

`mutationFn` 必须返回 Promise。和查询函数一样，`fetch` 遇到 4xx 或 5xx 通常仍会 resolve，要先检查 `response.ok`，再抛出 `Error`。

### 2. 四种状态

同一时刻只有一种状态：

- `isIdle` 或 `status === 'idle'`：空闲，或刚 `reset`。
- `isPending` 或 `status === 'pending'`：正在执行。
- `isError` 或 `status === 'error'`：失败，错误在 `error`。
- `isSuccess` 或 `status === 'success'`：成功，结果在 `data`。

源码里默认状态是 `idle`，`data` 为 `undefined`，`error` 为 `null`。下一次 `mutate` 开始时会进入 `pending`，并清掉上一份 `data` 和 `error`。

先看状态，再读 `data` 或 `error`。`isPending` 时按钮应停住，避免连点。

### 3. mutate 与 mutateAsync

`mutate(variables)` 把单个变量或对象交给 `mutationFn`。它是触发函数：源码里对返回的 Promise 做了 `catch`，组件里拿到的 `mutate` 返回值是 `void`。

需要等待这次写入时，用 `mutateAsync`。它成功时 resolve 出 `data`，失败时 throw。适合 `try/catch`，或组合多次写入。

```tsx
try {
  const task = await mutation.mutateAsync({ title: '核对创建任务' })
  console.log(task.owner)
} catch (error) {
  console.error(error)
}
```

连续点几次时，每次 `mutate` 都会新建一条 mutation。钩子上的回调会每次都跑；传给 `mutate` 的 `onSuccess` 只跟最后一次调用绑定。需要每次都等到结果，用 `mutateAsync`。本课先分清这两个触发函数，不展开回调顺序。

### 4. reset 回到 idle

成功后的 `data`、失败后的 `error` 会留在这次 mutation 结果里，直到下一次执行或调用 `reset`。

`reset` 清掉当前观察者绑定的 mutation，结果回到默认 `idle`。表单要重新填写、错误提示要点一下关掉时，调用它。

### 5. 默认不重试

查询失败默认会重试。mutation 默认 `retry` 为 `0`，失败就停在 `error`。需要重试时再显式传入 `retry`。离线排队、持久化 mutation 不是本课主线。

## 四、用法与示例

### 1. 声明 mutation 并用 mutate 触发

```tsx
import { useMutation } from '@tanstack/react-query'

type CreatedTask = {
  id: string
  title: string
  owner: string
}

/** 创建一条任务，非 2xx 时抛出带状态码的 Error。 */
async function createTask(title: string): Promise<CreatedTask> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  if (!response.ok) {
    throw new Error(`任务创建失败：HTTP ${response.status}`)
  }
  return (await response.json()) as CreatedTask
}

/** 点按钮才创建任务，并根据四种状态渲染。 */
function CreateTaskButton() {
  const taskMutation = useMutation({
    mutationFn: createTask,
  })

  return (
    <section>
      {taskMutation.isPending ? <p>正在创建任务</p> : null}
      {taskMutation.isError ? <p>{taskMutation.error.message}</p> : null}
      {taskMutation.isSuccess ? <p>{taskMutation.data.owner}</p> : null}
      <button
        type="button"
        disabled={taskMutation.isPending}
        onClick={() => taskMutation.mutate('核对创建任务')}
      >
        创建任务
      </button>
    </section>
  )
}
```

没点按钮前是 `idle`，`data` 和 `error` 都还没有。

### 2. 需要等待结果时用 mutateAsync

```tsx
/** 等待这次创建完成后再继续。 */
async function handleCreate() {
  try {
    const task = await taskMutation.mutateAsync('核对创建任务')
    return task.id
  } catch (error) {
    return null
  }
}
```

不要把 `mutate` 的返回值当成 Promise 来 `await`。组件拿到的 `mutate` 是 `void`。

### 3. 用 reset 清掉上次结果

```tsx
<button type="button" onClick={() => taskMutation.reset()}>
  重置
</button>
```

`reset` 之后 `status` 回到 `idle`，`isIdle` 为 `true`，`data` 和 `error` 都没有了。

## 五、用法示例：对照四种状态

下面的 Demo 用 `useMutation` 创建任务。没有点按钮前是 `idle`，不会自动请求。成功路径约 `1.4` 秒后返回林晓；失败路径抛出带 `404` 的错误。默认关掉重试，避免失败被自动挡住。

指标对照：请求次数、`status`、`isIdle`、`isPending`、`isSuccess`、`isError`、`data`、`error`。进行中时创建按钮停住。“重置”调用 `reset`，清掉结果并回到 `idle`。离开页面会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.intermediate.use-mutation.use-mutation-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：当成 useQuery，挂载就写入

**触发条件：** 把创建、更新写成 `useQuery`，或声明 `useMutation` 后以为会自动请求。

**原因：** 查询在声明后会按规则请求。mutation 停在 `idle`，要等 `mutate` 或 `mutateAsync`。

**后果：** 进入页面就创建任务，或按钮点了却看不到请求。

**错误示例：**

```tsx
useQuery({
  queryKey: ['tasks', 'create'],
  queryFn: () => createTask('核对创建任务'),
})
```

**正确写法：**

```tsx
const taskMutation = useMutation({
  mutationFn: createTask,
})

<button type="button" onClick={() => taskMutation.mutate('核对创建任务')}>
  创建任务
</button>
```

**验证方式：** 打开页面后先看 `status`。mutation 应为 `idle`、请求次数为 `0`；点创建后才变成 `pending`。

### 错误：await mutate 的返回值

**触发条件：** 写成 `await taskMutation.mutate(title)`，或把 `mutate` 放进 `Promise.all`。

**原因：** 组件拿到的 `mutate` 返回 `void`，内部已经 `catch` 掉 Promise。失败不会变成你能接到的 throw。

**后果：** `await` 立刻结束；失败时外层 `try/catch` 接不到错误。

**错误示例：**

```tsx
try {
  await taskMutation.mutate('核对创建任务')
} catch (error) {
  console.error(error)
}
```

**正确写法：**

```tsx
try {
  await taskMutation.mutateAsync('核对创建任务')
} catch (error) {
  console.error(error)
}
```

**验证方式：** 走失败路径。`mutate` 后外层 catch 不会进；`mutateAsync` 会 throw，同时 `isError` 为 `true`。

### 错误：mutationFn 不把 HTTP 失败变成 Error

**触发条件：** `mutationFn` 里 `fetch` 之后直接 `response.json()`，不看 `response.ok`。

**原因：** `fetch` 对 4xx、5xx 仍会 resolve。TanStack Query 只把抛出的错误或 rejected Promise 当成失败。

**后果：** 服务器已经拒绝创建，mutation 却走进 `success`。

**错误示例：**

```tsx
async function createTask(title: string) {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({ title }),
  })
  return response.json()
}
```

**正确写法：**

```tsx
async function createTask(title: string) {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  if (!response.ok) {
    throw new Error(`任务创建失败：HTTP ${response.status}`)
  }
  return (await response.json()) as CreatedTask
}
```

**验证方式：** 让接口返回非 2xx。正确写法 `isError` 为 `true`；错误写法可能 `isSuccess` 为 `true`。

### 错误：不看状态就读 data

**触发条件：** 一拿到 `taskMutation.data` 就渲染负责人，不看 `isSuccess`。

**原因：** `idle` 和 `pending` 时 `data` 是 `undefined`。失败时源码会把 `data` 清掉。

**后果：** 空白界面被当成成功，或失败后仍显示上一份成功数据的错觉被下一次 pending 清掉却没有错误提示。

**错误示例：**

```tsx
return <p>{taskMutation.data.owner}</p>
```

**正确写法：**

```tsx
if (taskMutation.isPending) {
  return <p>正在创建任务</p>
}

if (taskMutation.isError) {
  return <p>{taskMutation.error.message}</p>
}

if (taskMutation.isSuccess) {
  return <p>{taskMutation.data.owner}</p>
}

return <p>还没有创建</p>
```

**验证方式：** 未点击前 `data` 为 `undefined`；成功后才有林晓；失败后 `data` 为 `undefined` 且 `error` 有消息。

### 错误：以为失败会像查询一样自动重试

**触发条件：** 创建失败后等待自动重试，不提供再点一次或 `reset`。

**原因：** mutation 默认 `retry` 为 `0`。失败后停在 `error`。

**后果：** 界面一直显示错误，网络面板里没有下一次创建请求。

**错误示例：**

```tsx
useMutation({
  mutationFn: createTask,
})
```

**正确写法：**

```tsx
const taskMutation = useMutation({
  mutationFn: createTask,
})

<button type="button" onClick={() => taskMutation.mutate('核对创建任务')}>
  再试一次
</button>
<button type="button" onClick={() => taskMutation.reset()}>
  重置
</button>
```

**验证方式：** 走失败路径后看请求次数。默认不会再增加；再点创建才会发出下一次。
:::

## 七、源码推导与适用场景

1. **官方事实：** mutation 用于创建、更新、删除或服务端副作用，入口是 `useMutation`。同一时刻只有 `idle`、`pending`、`error`、`success`。`mutate` 传入单个变量或对象。`reset` 清掉 `error` 或 `data`。`mutateAsync` 返回 Promise，失败时 throw。默认不重试。源码里 `useMutation` 订阅 `MutationObserver`；组件上的 `mutate` 会 `catch` 掉 Promise，`mutateAsync` 仍是返回 Promise 的那一个。观察者默认 `idle`。每次 `mutate` 会 build 新 mutation 并 `execute`。`reset` 清空当前 mutation。`execute` 进入 `pending` 时清掉 `data` 和 `error`，默认 `retry` 为 `0`；成功 dispatch `success`，失败 dispatch `error` 再 throw。
2. **课程推导：** 读数据用 `useQuery`，点了才写入用 `useMutation`。界面先看四种状态，再读 `data` 或 `error`。只触发、不组合后续逻辑时用 `mutate`；要等待或接住失败时用 `mutateAsync`。需要空白表单或关掉错误提示时调用 `reset`。
3. **适用边界：** 本课不把 `onMutate`、`onSuccess`、`onError`、`onSettled` 的完整生命周期、查询失效、`setQueryData`、乐观更新、mutation `scope`、持久化、离线恢复或 `mutationKey` 默认函数写成主线。官方示例里的 axios 可换成 `fetch`。React 16 的事件池限制已经过时，本课按当前 React 把 `mutate` 包进提交处理函数即可。

## 八、练习

:::exercise
### 练习目标

**要求：** 编写 `createTask(title)`，用 `fetch` `POST` `/api/tasks`，请求体为 `{ title }`，非 2xx 时抛出带状态码的 `Error`。组件在 `QueryClientProvider` 下使用 `useMutation`，`mutationFn` 为 `createTask`。按钮调用 `mutate` 传入标题。用 `isIdle`、`isPending`、`isError`、`isSuccess` 渲染。成功时显示返回对象的 `owner`，失败时显示 `error.message`。再提供按钮调用 `reset`。需要等待结果的路径使用 `mutateAsync`，不要 `await mutate`。

**验收：** 未点击前 `status` 为 `idle`，没有请求。点击后进入 `pending`，成功后 `data` 可用，失败后 `isError` 为 `true`。`reset` 后回到 `idle`，`data` 和 `error` 都被清掉。`mutate` 失败时外层 `try/catch` 接不到错误；`mutateAsync` 失败时会 throw。

**参考答案：**

```tsx
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query'
import { useState, type ReactElement } from 'react'

type CreatedTask = {
  id: string
  title: string
  owner: string
}

/** 创建一条任务。 */
async function createTask(title: string): Promise<CreatedTask> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  if (!response.ok) {
    throw new Error(`任务创建失败：HTTP ${response.status}`)
  }
  return (await response.json()) as CreatedTask
}

/** 观察一次创建任务的四种状态。 */
function CreateTaskBoard(): ReactElement {
  const taskMutation = useMutation({
    mutationFn: createTask,
  })

  /** 需要等待这次创建时用 mutateAsync。 */
  async function createAndWait(): Promise<void> {
    try {
      await taskMutation.mutateAsync('核对创建任务')
    } catch {
      return
    }
  }

  return (
    <section>
      <p>{taskMutation.status}</p>
      <p>{String(taskMutation.isIdle)}</p>
      {taskMutation.isPending ? <p>正在创建任务</p> : null}
      {taskMutation.isError ? <p>{taskMutation.error.message}</p> : null}
      {taskMutation.isSuccess ? <p>{taskMutation.data.owner}</p> : null}
      <button
        type="button"
        disabled={taskMutation.isPending}
        onClick={() => taskMutation.mutate('核对创建任务')}
      >
        创建任务
      </button>
      <button type="button" disabled={taskMutation.isPending} onClick={() => void createAndWait()}>
        等待创建
      </button>
      <button type="button" onClick={() => taskMutation.reset()}>
        重置
      </button>
    </section>
  )
}

/** 提供稳定客户端，避免 mutation 观察丢失。 */
export function App(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <CreateTaskBoard />
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- 写入用 `useMutation`，要等 `mutate` 或 `mutateAsync` 才执行。
- 四种状态是 `idle`、`pending`、`error`、`success`。
- 成功读 `data`，失败读 `error`；`mutationFn` 必须把 HTTP 失败变成 `Error`。
- 只触发用 `mutate`，要等待或接住失败用 `mutateAsync`。
- `reset` 清掉这次结果，回到 `idle`。

## 十、参考资料

- [Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations) - 支持 mutation 用途、四种状态、mutate 变量、reset、mutateAsync 与默认不重试。
- [useMutation](https://tanstack.com/query/latest/docs/framework/react/reference/functions/useMutation) - 支持 useMutation 入口，以及 mutate 与 mutateAsync。
- [useMutation 源码](https://unpkg.com/@tanstack/react-query@5.102.8/src/useMutation.ts) - 支持 mutate 吞掉 Promise，mutateAsync 仍返回 Promise。
- [MutationObserver 源码](https://unpkg.com/@tanstack/query-core@5.102.8/src/mutationObserver.ts) - 支持默认 idle、每次 mutate 新建 mutation，以及 reset。
- [Mutation 源码](https://unpkg.com/@tanstack/query-core@5.102.8/src/mutation.ts) - 支持默认状态、pending 清空 data，以及默认 retry 为 0。
