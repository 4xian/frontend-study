---
id: react.data.learn.intermediate.optimistic-updates
type: lesson
title: 乐观更新与回滚
summary: 写入还没结束时先改缓存，让界面立刻显示新结果；失败时用 onMutate 留下的快照滚回去，结束时再作废对齐服务端。
domain: frontend
technology: react
module: data
stage: intermediate
level: intermediate
estimatedMinutes: 45
prerequisites:
  - react.data.learn.intermediate.updates-from-mutation-responses
  - react.data.learn.intermediate.mutation-lifecycle
related:
  - react.data.learn.intermediate.query-invalidation
  - react.data.learn.intermediate.query-cancellation
  - react.data.learn.intermediate.use-mutation
tags:
  - TanStack Query
  - 乐观更新
  - 回滚
  - onMutate
  - setQueryData
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-10
objectives:
  - 能说明乐观更新是在 mutation 完成前先改界面，而不是等响应回来再写缓存。
  - 能在 onMutate 里取消进行中的重新获取、快照旧 data、用 setQueryData 写入乐观结果，并返回快照。
  - 能在 onError 里用 onMutateResult 把缓存滚回快照。
  - 能在 onSettled 里作废相关查询，让成功和失败都重新对齐服务端。
  - 能说明同一组件内也可以只用 variables 和 isPending 画临时项，那种写法不改缓存、失败时也不必回滚。
recap:
  - 缓存路径在 onMutate 里先改查询，失败用返回的快照回滚，结束时作废再拉一次。
  - onMutate 第二个参数是 MutationFunctionContext，用 context.client 操作缓存。
  - 返回值会作为 onMutateResult 交给 onError、onSuccess 和 onSettled。
  - 先 cancelQueries，避免进行中的重新获取盖掉乐观结果。
  - 只有一处要显示临时结果时，可以直接用 variables 拼界面，不必改缓存。
sources:
  - title: Optimistic Updates
    url: https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - React Query 提供两种乐观更新：用 onMutate 直接改缓存，或用 useMutation 返回的 variables 改界面。
      - 界面路径更简单，不直接碰缓存；pending 时用 variables 画临时项，完成后临时项自动消失。
      - 失败时 variables 不会被清掉，仍可继续显示或拿来重试。
      - 缓存路径要先取消进行中的重新获取，再快照旧值，再 setQueryData 写入乐观结果。
      - onMutate 的返回值会交给 onError 和 onSettled；失败时用这份快照回滚。
      - 成功或失败后都应该作废相关查询，重新对齐服务端。
      - 只有一处要显示乐观结果时，用 variables 更省事，也不必处理回滚；多处都要看到同一份更新时，改缓存会自动同步。
  - title: QueryClient
    url: https://tanstack.com/query/latest/docs/reference/QueryClient
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - cancelQueries 会取消匹配查询，默认回退到这次请求前的状态。
      - getQueryData 读取缓存里的当前 data。
      - setQueryData 同步写入指定 queryKey。
      - invalidateQueries 把查询标成 stale，并重新获取正在显示的查询。
  - title: Mutation source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/mutation.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - execute 先 await 钩子级 onMutate，再跑 mutationFn。
      - onMutate 的返回值写入 state.context，之后作为 onMutateResult 传给 onSuccess、onError 和 onSettled。
      - onMutate 和后续回调的最后一个参数是 MutationFunctionContext，里面有 client。
  - title: QueryClient source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/queryClient.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - cancelQueries 默认 revert 为 true，取消匹配查询。
      - setQueryData 在值为 undefined 时不写缓存。
---

# 乐观更新与回滚

## 一、学习目标

- 说明乐观更新是在 mutation 完成前先改界面，而不是等响应回来再写缓存。
- 在 `onMutate` 里取消进行中的重新获取、快照旧 data、用 `setQueryData` 写入乐观结果，并返回快照。
- 在 `onError` 里用 `onMutateResult` 把缓存滚回快照。
- 在 `onSettled` 里作废相关查询，让成功和失败都重新对齐服务端。
- 说明同一组件内也可以只用 `variables` 和 `isPending` 画临时项，那种写法不改缓存、失败时也不必回滚。

## 二、为什么要乐观更新

已经能在写入成功后用返回对象更新详情，或作废相关查询再拉一次。这两步都发生在服务器答应之后。点保存到画面变，中间仍要等这次请求。

乐观更新把顺序反过来：先按用户提交的内容改画面，再等服务器确认。林晓把「现有任务」改成「核对创建任务」时，列表应立刻显示新标题。服务器拒绝时，再把缓存滚回提交前的快照。

官方给出两条路。一条只改当前界面：用 `useMutation` 返回的 `variables` 在 `isPending` 时画临时项。一条改查询缓存：在 `onMutate` 里 `setQueryData`，失败时用返回值回滚。本课主线是第二条，因为回滚发生在缓存上；第一条作为对照，知道什么时候不必碰缓存。

## 三、核心概念

### 1. 先改缓存，失败再滚回

```tsx
const queryClient = useQueryClient()

const saveMutation = useMutation({
  mutationFn: editTask,
  onMutate: async (variables, context) => {
    await context.client.cancelQueries({ queryKey: ['tasks'] })
    const previousTasks = context.client.getQueryData(['tasks'])
    context.client.setQueryData(['tasks'], (oldData) =>
      oldData
        ? oldData.map((task) =>
            task.id === variables.id ? { ...task, title: variables.title } : task,
          )
        : oldData,
    )
    return { previousTasks }
  },
  onError: (_error, _variables, onMutateResult, context) => {
    if (onMutateResult?.previousTasks) {
      context.client.setQueryData(['tasks'], onMutateResult.previousTasks)
    }
  },
  onSettled: (_data, _error, _variables, _onMutateResult, context) =>
    context.client.invalidateQueries({ queryKey: ['tasks'] }),
})
```

`onMutate` 在 `mutationFn` 之前执行。这里取消进行中的重新获取，避免旧请求回来盖掉乐观结果；再读出当前列表当快照；再写入新标题。返回的对象会作为 `onMutateResult` 交给后面的回调。

失败时用快照写回。成功或失败结束后都作废 `['tasks']`，让正在显示的列表再拉一次，对齐服务器。把 `invalidateQueries` 的 Promise 从 `onSettled` 返回出去，mutation 会保持 `pending`，直到这次重新获取结束。

### 2. 回调参数是 variables、onMutateResult、context

`onMutate` 的第二个参数不是快照，而是 `MutationFunctionContext`。用 `context.client` 调用 `cancelQueries`、`getQueryData`、`setQueryData`。

源码里 `execute` 会 `await` 钩子级 `onMutate`，把返回值放进 `state.context`，再跑 `mutationFn`。成功路径把这份值作为 `onMutateResult` 传给 `onSuccess` 和 `onSettled`；失败路径传给 `onError` 和 `onSettled`。最后一个参数始终是带 `client` 的 context。

### 3. 界面路径不改缓存

只有当前这一处列表要显示临时项时，官方建议直接用 `variables`：

```tsx
const saveMutation = useMutation({
  mutationFn: editTask,
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
})

const { isPending, variables, isError, mutate } = saveMutation
```

`isPending` 为真时把 `variables.title` 画成半透明项。mutation 结束后这项自动消失；作废成功后，列表里会出现正式结果。失败时 `variables` 不会被清掉，仍可显示或拿来重试。这条路不写 `setQueryData`，也就没有快照和回滚。

多处界面都要立刻看到同一份更新时，改缓存更合适：所有订阅这条 `queryKey` 的查询会一起变。

## 四、用法与示例

### 1. 保存标题时先改列表

```tsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

type TaskItem = {
  id: string
  title: string
  owner: string
}

/** 提交修改，非 2xx 时抛出带状态码的 Error。 */
async function editTask(input: { id: string; title: string }): Promise<TaskItem> {
  const response = await fetch(`/api/tasks/${input.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: input.title }),
  })
  if (!response.ok) {
    throw new Error(`保存失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

/** 乐观更新任务标题，失败时滚回快照。 */
function TaskBoard() {
  const queryClient = useQueryClient()
  const listQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: loadTasks,
  })

  const saveMutation = useMutation({
    mutationFn: editTask,
    retry: false,
    onMutate: async (variables, context) => {
      await context.client.cancelQueries({ queryKey: ['tasks'] })
      const previousTasks = context.client.getQueryData<TaskItem[]>(['tasks'])
      context.client.setQueryData<TaskItem[]>(['tasks'], (oldData) =>
        oldData
          ? oldData.map((task) =>
              task.id === variables.id ? { ...task, title: variables.title } : task,
            )
          : oldData,
      )
      return { previousTasks }
    },
    onError: (_error, _variables, onMutateResult, context) => {
      if (onMutateResult?.previousTasks) {
        context.client.setQueryData(['tasks'], onMutateResult.previousTasks)
      }
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) =>
      context.client.invalidateQueries({ queryKey: ['tasks'] }),
  })

  return (
    <button
      type="button"
      disabled={saveMutation.isPending}
      onClick={() => saveMutation.mutate({ id: 't-1', title: '核对创建任务' })}
    >
      乐观保存
    </button>
  )
}
```

点按钮后，列表会先显示核对创建任务，不必等 `mutationFn` 结束。

### 2. 失败时按快照回滚

服务器返回非 2xx 时，`onError` 把 `previousTasks` 写回去。随后 `onSettled` 仍会作废列表。作废是后台重新获取，不是把画面先清空。

### 3. 同一组件内用 variables 画临时项

```tsx
{
  listQuery.data?.map((task) => (
    <li key={task.id}>
      {task.title} / {task.owner}
    </li>
  ))
}
{saveMutation.isPending ? <li>{saveMutation.variables?.title}</li> : null}
```

这条路径不改 `['tasks']` 缓存。临时项只活在这次 mutation 的 `pending` 期间。

## 五、用法示例：对照乐观写入和失败回滚

下面的 Demo 挂着 `['tasks']` 列表，`staleTime` 为 `Infinity`。点「乐观保存」后，`onMutate` 立刻把标题写成核对创建任务，请求次数先不增加；写入成功后再作废，列表次数增加，标题保持核对创建任务。点「失败回滚」同样先换成新标题，服务器拒绝后滚回现有任务，再作废对齐。离开页面会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.intermediate.optimistic-updates.optimistic-updates-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：乐观写入后不取消进行中的重新获取

**触发条件：** `onMutate` 里直接 `setQueryData`，不调用 `cancelQueries`。

**原因：** 官方要求先取消进行中的重新获取，避免旧请求回来覆盖乐观结果。

**后果：** 刚写上的核对创建任务被一次迟到的列表请求改回现有任务。

**错误示例：**

```tsx
onMutate: async (variables, context) => {
  const previousTasks = context.client.getQueryData(['tasks'])
  context.client.setQueryData(['tasks'], (oldData) =>
    oldData
      ? oldData.map((task) =>
          task.id === variables.id ? { ...task, title: variables.title } : task,
        )
      : oldData,
  )
  return { previousTasks }
}
```

**正确写法：**

```tsx
onMutate: async (variables, context) => {
  await context.client.cancelQueries({ queryKey: ['tasks'] })
  const previousTasks = context.client.getQueryData(['tasks'])
  context.client.setQueryData(['tasks'], (oldData) =>
    oldData
      ? oldData.map((task) =>
          task.id === variables.id ? { ...task, title: variables.title } : task,
        )
      : oldData,
  )
  return { previousTasks }
}
```

**验证方式：** 在列表正在重新获取时点保存。正确写法新标题会保住，直到这次 mutation 自己的作废结束。

### 错误：失败后不回滚快照

**触发条件：** `onMutate` 改了缓存，但 `onError` 里什么也不做，指望界面自己恢复。

**原因：** 缓存路径不会因为 mutation 失败自动撤销 `setQueryData`。必须把 `onMutate` 返回的快照写回去。

**后果：** 服务器已经拒绝，列表仍显示核对创建任务。

**错误示例：**

```tsx
onError: (error) => {
  console.error(error)
}
```

**正确写法：**

```tsx
onError: (_error, _variables, onMutateResult, context) => {
  if (onMutateResult?.previousTasks) {
    context.client.setQueryData(['tasks'], onMutateResult.previousTasks)
  }
}
```

**验证方式：** 点失败回滚。正确写法标题会先变成核对创建任务，失败后再回到现有任务。

### 错误：原地修改快照或缓存对象

**触发条件：** 取出 `previousTasks` 或 `oldData` 后写 `oldData[0].title = ...`。

**原因：** `setQueryData` 必须不可变。原地改可能让快照和当前缓存变成同一份引用，回滚时滚不到旧标题。

**后果：** 失败后标题仍是核对创建任务，或后续比较读到被改脏的对象。

**错误示例：**

```tsx
context.client.setQueryData(['tasks'], (oldData) => {
  if (oldData && oldData[0]) {
    oldData[0].title = variables.title
  }
  return oldData
})
```

**正确写法：**

```tsx
context.client.setQueryData(['tasks'], (oldData) =>
  oldData
    ? oldData.map((task) =>
        task.id === variables.id ? { ...task, title: variables.title } : task,
      )
    : oldData,
)
```

**验证方式：** 失败回滚后标题必须回到现有任务。若快照和当前列表是同一引用，回滚不会换标题。

### 错误：界面路径失败后还去 setQueryData 回滚

**触发条件：** 只用 `variables` 画临时项，却在 `onError` 里 `setQueryData` 改列表。

**原因：** 界面路径没有改缓存。`variables` 在失败后仍在，临时项随 `isPending` 消失即可。

**后果：** 给无关的 `['tasks']` 写入一份快照，成功路径和失败路径的缓存被搅在一起。

**错误示例：**

```tsx
onError: (_error, variables, _onMutateResult, context) => {
  context.client.setQueryData(['tasks'], [])
}
```

**正确写法：**

```tsx
{
  saveMutation.isError ? (
    <button type="button" onClick={() => saveMutation.mutate(saveMutation.variables)}>
      重试
    </button>
  ) : null
}
```

**验证方式：** 失败后列表仍是现有任务，临时项按 `isPending` 消失；不要为这条路径准备快照。

### 错误：onSettled 里不作废，成功后一直停在乐观值

**触发条件：** 只在 `onMutate` 里 `setQueryData`，成功后既不写返回对象，也不 `invalidateQueries`。

**原因：** 官方在成功或失败后都作废，让缓存重新对齐服务端。乐观值只是提交前的猜测。

**后果：** 服务器可能补了 `id` 或改了 `owner`，画面仍停在本地拼出来的对象。

**错误示例：**

```tsx
onMutate: async (variables, context) => {
  await context.client.cancelQueries({ queryKey: ['tasks'] })
  context.client.setQueryData(['tasks'], [{ id: 't-1', title: variables.title, owner: '林晓' }])
}
```

**正确写法：**

```tsx
onSettled: (_data, _error, _variables, _onMutateResult, context) =>
  context.client.invalidateQueries({ queryKey: ['tasks'] }),
```

**验证方式：** 乐观保存成功后，列表次数增加，标题仍是核对创建任务，负责人为林晓。
:::

## 七、源码推导与适用场景

1. **官方事实：** 乐观更新有两条路。界面路径用 `variables` 和 `isPending` 画临时项，失败时 `variables` 仍在，不必回滚缓存。缓存路径在 `onMutate` 里取消进行中的重新获取、快照、写入乐观值并返回快照；失败用 `onMutateResult` 回滚；结束时作废相关查询。源码里 `execute` 先 `await onMutate`，把返回值存进 `state.context`，再跑 `mutationFn`；后续回调拿到这份 `onMutateResult` 和带 `client` 的 context。`cancelQueries` 默认 `revert` 为 true。
2. **课程推导：** 列表、详情等多处都要立刻看到同一份更新时，走缓存路径。只有当前列表要闪一下临时项时，走界面路径。回滚用的是 `onMutate` 返回的旧 data，不是重新猜一个对象。
3. **适用边界：** 本课不把 `useMutationState`、跨组件并发乐观更新、持久化、SSR，或按模块拆数据 Hooks 写成主线。官方示例里的 axios 可换成 `fetch`。

## 八、练习

:::exercise
### 练习目标

**要求：** 在 `QueryClientProvider` 下声明列表 `useQuery`，`queryKey` 为 `['tasks']`。再用 `useMutation` 提交修改，`mutationFn` 用 `fetch` `PATCH` 并在非 2xx 时抛出带状态码的 `Error`。钩子级 `onMutate` 使用 `context.client.cancelQueries`、`getQueryData` 和不可变的 `setQueryData`，并返回 `{ previousTasks }`。`onError` 用 `onMutateResult.previousTasks` 写回。`onSettled` 返回 `invalidateQueries({ queryKey: ['tasks'] })`。`retry` 设为 `false`。不要原地修改 `oldData`。

**验收：** 点保存后列表立刻显示新标题。服务器拒绝后标题回到保存前。成功或失败结束后列表会重新获取。

**参考答案：**

```tsx
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
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
async function loadTasks(): Promise<TaskItem[]> {
  const response = await fetch('/api/tasks')
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem[]
}

/** 提交修改。 */
async function editTask(input: { id: string; title: string }): Promise<TaskItem> {
  const response = await fetch(`/api/tasks/${input.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: input.title }),
  })
  if (!response.ok) {
    throw new Error(`保存失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

/** 乐观更新列表标题，失败时滚回快照。 */
function TaskBoard(): ReactElement {
  const queryClient = useQueryClient()

  const listQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: loadTasks,
    staleTime: Infinity,
    retry: false,
  })

  const saveMutation = useMutation({
    mutationFn: editTask,
    retry: false,
    onMutate: async (variables, context) => {
      await context.client.cancelQueries({ queryKey: ['tasks'] })
      const previousTasks = context.client.getQueryData<TaskItem[]>(['tasks'])
      context.client.setQueryData<TaskItem[]>(['tasks'], (oldData) =>
        oldData
          ? oldData.map((task) =>
              task.id === variables.id ? { ...task, title: variables.title } : task,
            )
          : oldData,
      )
      return { previousTasks }
    },
    onError: (_error, _variables, onMutateResult, context) => {
      if (onMutateResult?.previousTasks) {
        context.client.setQueryData(['tasks'], onMutateResult.previousTasks)
      }
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) =>
      context.client.invalidateQueries({ queryKey: ['tasks'] }),
  })

  return (
    <section>
      {listQuery.isSuccess
        ? listQuery.data.map((task) => (
            <p key={task.id}>
              {task.title} / {task.owner}
            </p>
          ))
        : null}
      <button
        type="button"
        disabled={saveMutation.isPending}
        onClick={() => saveMutation.mutate({ id: 't-1', title: '核对创建任务' })}
      >
        乐观保存
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

- 缓存路径在 `onMutate` 里先改查询，失败用返回的快照回滚。
- 先 `cancelQueries`，再快照，再 `setQueryData`。
- `onMutate` 的返回值是后续回调的 `onMutateResult`。
- `onSettled` 里作废相关查询，成功和失败都对齐服务端。
- 只有一处要显示临时结果时，用 `variables` 即可，不必改缓存。

## 十、参考资料

- [Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates) - 支持界面路径与缓存路径，以及失败回滚。
- [QueryClient](https://tanstack.com/query/latest/docs/reference/QueryClient) - 支持 cancelQueries、getQueryData、setQueryData 与 invalidateQueries。
- [Mutation 源码](https://unpkg.com/@tanstack/query-core@5.102.8/src/mutation.ts) - 支持 onMutate 先于 mutationFn，并把返回值传给后续回调。
- [QueryClient 源码](https://unpkg.com/@tanstack/query-core@5.102.8/src/queryClient.ts) - 支持 cancelQueries 默认 revert。
