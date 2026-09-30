---
id: react.data.learn.intermediate.updates-from-mutation-responses
type: lesson
title: Mutation 响应更新缓存
summary: 更新对象的 mutation 若已返回最新对象，用 setQueryData 立刻写回对应查询，避免再拉一次已经拿到的数据。
domain: frontend
technology: react
module: data
stage: intermediate
level: intermediate
estimatedMinutes: 45
prerequisites:
  - react.data.learn.intermediate.query-invalidation
  - react.data.learn.intermediate.mutation-lifecycle
related:
  - react.data.learn.basics.query-client-and-provider
  - react.data.learn.intermediate.use-mutation
tags:
  - TanStack Query
  - Mutation 响应更新缓存
  - setQueryData
  - onSuccess
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-10
objectives:
  - 能说明更新对象的 mutation 常常会在响应里带回最新对象，这时不必再为同一条查询重新获取。
  - 能在 onSuccess 里用 setQueryData 把 mutation 返回的 data 写进对应 queryKey。
  - 能用 variables 拼出详情 key，让可复用的 mutation 写回正确的那一条。
  - 能用不可变方式更新缓存，不原地改 oldData。
  - 能说明 setQueryData 只写指定 queryKey，列表等其他查询不会自动跟上。
recap:
  - mutation 已经返回最新对象时，用 setQueryData 写回对应查询，不要再浪费一次相同请求。
  - onSuccess 的第一个参数是返回对象，第二个参数是这次 mutate 传入的变量。
  - 更新必须不可变：展开出新对象，不要给 oldData.title 赋值。
  - updater 返回 undefined 时缓存不动；查询还不存在时会创建。
  - 写详情 key 不会自动改列表；其他查询仍要按自己的身份更新或作废。
sources:
  - title: Updates from Mutation Responses
    url: https://tanstack.com/query/latest/docs/framework/react/guides/updates-from-mutation-responses
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 更新对象的 mutation 常常会在响应里自动带回最新对象。
      - 与其为这条查询再请求一次已经拿到的数据，可以用 QueryClient.setQueryData 立刻用返回对象更新现有查询。
      - 成功后的查询会显示这次 mutation 响应里的数据。
      - 可复用 mutation 的 onSuccess 第二个参数是 mutate 收到的 variables，可用来拼 queryKey。
      - 通过 setQueryData 更新必须不可变，不要原地改从缓存取出的数据。
  - title: QueryClient
    url: https://tanstack.com/query/latest/docs/reference/QueryClient
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - setQueryData 是同步立刻更新查询缓存的方法。
      - updater 既可以是新数据，也可以是接收当前 data 并返回新 data 的函数。
      - updater 或传入值解析为 undefined 时，缓存不动，也不会新建查询。
      - 查询还不存在时，非 undefined 的结果会创建这条查询。
      - 更新必须不可变，不要原地改 oldData 或 getQueryData 拿到的对象。
  - title: QueryClient source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/queryClient.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - setQueryData 用 functionalUpdate 计算新 data。
      - 新 data 为 undefined 时直接返回，不写缓存。
      - 否则 build 这条查询并以 manual 调用 setData。
  - title: Query source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/query.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - setData 会 dispatch success，并带上 dataUpdatedAt。
      - successState 会写入新 data，并把 isInvalidated 设为 false。
---

# Mutation 响应更新缓存

## 一、学习目标

- 说明更新对象的 mutation 常常会在响应里带回最新对象，这时不必再为同一条查询重新获取。
- 在 `onSuccess` 里用 `setQueryData` 把 mutation 返回的 `data` 写进对应 `queryKey`。
- 用 `variables` 拼出详情 key，让可复用的 mutation 写回正确的那一条。
- 用不可变方式更新缓存，不原地改 `oldData`。
- 说明 `setQueryData` 只写指定 `queryKey`，列表等其他查询不会自动跟上。

## 二、为什么要用响应更新缓存

已经能在写入成功后作废相关查询，让正在显示的列表后台再拉一次。这在你手里还没有最新对象时是对的。

更新林晓那条任务时，服务器经常把改完的对象直接放进响应。详情查询要的正是这份对象。再对 `['tasks', 'detail', 't-1']` 作废，等于扔掉已经拿到的结果，再发一次相同请求。

官方把这种情况单独拿出来：用 `setQueryData` 把 mutation 返回的对象立刻写进现有查询。

## 三、核心概念

### 1. 返回对象就是这份查询的新 data

```tsx
const queryClient = useQueryClient()

const mutation = useMutation({
  mutationFn: editTask,
  onSuccess: (data) => {
    queryClient.setQueryData(['tasks', 'detail', 't-1'], data)
  },
})

mutation.mutate({ id: 't-1', title: '核对创建任务' })
```

`useQuery({ queryKey: ['tasks', 'detail', 't-1'] })` 随后读到的就是这次响应。详情不必再走 `queryFn`。

### 2. 用 variables 对准要写的那一条

可复用的 mutation 不会写死 id。`onSuccess` 的第二个参数就是这次 `mutate` 传入的变量：

```tsx
function useMutateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: editTask,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['tasks', 'detail', variables.id], data)
    },
  })
}
```

key 必须和详情查询用的那条完全相同。写到别的数组上，正在显示的详情不会动。

### 3. 更新必须不可变

官方明确禁止原地改缓存里的对象：

```tsx
queryClient.setQueryData(['tasks', 'detail', id], (oldData) => {
  if (oldData) {
    oldData.title = '核对创建任务'
  }
  return oldData
})
```

看起来好像改了标题，观察者可能读到同一份引用，后续比较也会出错。正确写法是返回新对象：

```tsx
queryClient.setQueryData(['tasks', 'detail', id], (oldData) =>
  oldData ? { ...oldData, title: '核对创建任务' } : oldData,
)
```

mutation 已经返回完整对象时，直接把 `data` 传进去即可，不必先取出再改字段。

### 4. undefined 不动缓存，指定 key 才更新

`setQueryData` 是同步的。updater 或传入值得到 `undefined` 时，缓存保持原样，也不会新建查询。查询还不存在、结果又不是 `undefined` 时，会创建这条查询。

它只写你传入的那一个 `queryKey`。详情写成 `['tasks', 'detail', 't-1']`，列表写成 `['tasks']`，两份是不同条目。写详情不会让列表标题一起变。列表要跟上这次更新，需要另一次 `setQueryData`、`setQueriesData`，或作废后再获取。后两种不是本课主线。

源码里 `setQueryData` 用 `functionalUpdate` 算出新 data；为 `undefined` 就返回。否则 `build` 这条查询并以 `manual` 调用 `setData`，走 `success`，写入新 data，并把 `isInvalidated` 设回 `false`。

## 四、用法与示例

### 1. 保存后把响应写进详情

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

/** 读取详情，并用 mutation 响应更新同一条缓存。 */
function TaskEditor() {
  const queryClient = useQueryClient()
  const taskQuery = useQuery({
    queryKey: ['tasks', 'detail', 't-1'],
    queryFn: loadTask,
  })

  const saveMutation = useMutation({
    mutationFn: editTask,
    onSuccess: (data) => {
      queryClient.setQueryData(['tasks', 'detail', data.id], data)
    },
  })

  return (
    <button
      type="button"
      disabled={saveMutation.isPending}
      onClick={() => saveMutation.mutate({ id: 't-1', title: '核对创建任务' })}
    >
      保存修改
    </button>
  )
}
```

保存成功后，详情立刻显示核对创建任务，详情的 `queryFn` 不会因为这次写入再跑一遍。

### 2. 可复用 hook 用 variables 拼 key

```tsx
function useMutateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: editTask,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['tasks', 'detail', variables.id], data)
    },
  })
}
```

### 3. 只改部分字段时返回新对象

```tsx
queryClient.setQueryData(['tasks', 'detail', id], (oldData) =>
  oldData ? { ...oldData, title: '核对创建任务' } : oldData,
)
```

`oldData` 可能是 `undefined`。没有旧数据时返回 `oldData`，也就是 `undefined`，缓存不会被写成空对象。

## 五、用法示例：对照详情写回和列表不动

下面的 Demo 同时挂着 `['tasks']` 列表和 `['tasks', 'detail', 't-1']` 详情，`staleTime` 都是 `Infinity`。点「保存修改」后，mutation 返回林晓那条改过标题的任务，`onSuccess` 用 `setQueryData` 写回详情。详情标题变成核对创建任务，详情请求次数不增加；列表仍显示现有任务。离开页面会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.intermediate.updates-from-mutation-responses.updates-from-mutation-responses-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：已经拿到返回对象还去作废同一条详情

**触发条件：** `editTask` 已经返回最新任务，`onSuccess` 里仍 `invalidateQueries({ queryKey: ['tasks', 'detail', id] })`。

**原因：** 作废会把正在显示的查询再拉一次。这次响应里已经有同一份对象。

**后果：** 详情多一次请求；画面可能先停在旧标题，等重新获取结束才换成新标题。

**错误示例：**

```tsx
onSuccess: async (data) => {
  await queryClient.invalidateQueries({
    queryKey: ['tasks', 'detail', data.id],
  })
}
```

**正确写法：**

```tsx
onSuccess: (data) => {
  queryClient.setQueryData(['tasks', 'detail', data.id], data)
}
```

**验证方式：** 保存成功后看详情标题和详情次数。正确写法标题变成核对创建任务，详情次数不变。

### 错误：原地修改缓存对象

**触发条件：** 从 updater 或 `getQueryData` 取出 `oldData` 后写 `oldData.title = ...`。

**原因：** 官方要求 `setQueryData` 不可变。原地改可能让观察者读到同一引用，后续比较失败。

**后果：** 标题有时看起来变了，列表或后续写入会用到被改脏的同一份对象。

**错误示例：**

```tsx
queryClient.setQueryData(['tasks', 'detail', id], (oldData) => {
  if (oldData) {
    oldData.title = '核对创建任务'
  }
  return oldData
})
```

**正确写法：**

```tsx
queryClient.setQueryData(['tasks', 'detail', id], (oldData) =>
  oldData ? { ...oldData, title: '核对创建任务' } : oldData,
)
```

**验证方式：** 保存后详情显示新标题，并且传入的是新对象，而不是给旧对象改字段。

### 错误：写错 queryKey，正在显示的查询对不上

**触发条件：** 详情用 `['tasks', 'detail', id]`，`setQueryData` 却写 `['task', id]` 或 `['tasks', id]`。

**原因：** `setQueryData` 只更新传入的那一个 key。key 不同就是另一条缓存。

**后果：** mutation 已经成功，详情画面仍是旧标题。

**错误示例：**

```tsx
onSuccess: (data) => {
  queryClient.setQueryData(['task', data.id], data)
}
```

**正确写法：**

```tsx
onSuccess: (data, variables) => {
  queryClient.setQueryData(['tasks', 'detail', variables.id], data)
}
```

**验证方式：** 保存后看详情标题。key 对上才会变成核对创建任务；写错时详情次数和标题都不变。

### 错误：以为写详情会自动改列表

**触发条件：** 只 `setQueryData(['tasks', 'detail', id], data)`，期望 `['tasks']` 列表标题一起变。

**原因：** 列表和详情是不同的 `queryKey`。没有规范化缓存去同步它们。

**后果：** 详情已经是新标题，列表仍显示现有任务。

**错误示例：**

```tsx
onSuccess: (data) => {
  queryClient.setQueryData(['tasks', 'detail', data.id], data)
}
```

**正确写法：**

```tsx
onSuccess: (data) => {
  queryClient.setQueryData(['tasks', 'detail', data.id], data)
}
```

**验证方式：** 保存成功后详情为核对创建任务，列表仍为现有任务，列表次数不增加。列表要跟上时另写列表或作废列表，不是本课主线。

### 错误：updater 在没有旧数据时返回空对象

**触发条件：** 写成 `(oldData) => ({ ...oldData, title })`，`oldData` 为 `undefined`。

**原因：** 展开 `undefined` 得到的是只有新字段的对象。源码里非 `undefined` 结果会创建或覆盖这条查询。

**后果：** 缓存里出现一份缺 `id`、缺 `owner` 的残缺任务。

**错误示例：**

```tsx
queryClient.setQueryData(['tasks', 'detail', id], (oldData) => ({
  ...oldData,
  title: '核对创建任务',
}))
```

**正确写法：**

```tsx
queryClient.setQueryData(['tasks', 'detail', id], (oldData) =>
  oldData ? { ...oldData, title: '核对创建任务' } : oldData,
)
```

**验证方式：** 在详情还没有成功数据时调用 updater。正确写法缓存仍为空；错误写法会写出残缺对象。
:::

## 七、源码推导与适用场景

1. **官方事实：** 更新对象的 mutation 常常在响应里带回最新对象。可以用 `setQueryData` 立刻更新现有查询，不必再请求已经拿到的数据。`onSuccess` 第二个参数是 `variables`。更新必须不可变。`setQueryData` 同步执行；值为 `undefined` 时缓存不动且不新建查询；查询不存在且值不是 `undefined` 时会创建。源码用 `functionalUpdate` 计算新 data，为 `undefined` 则返回，否则 `build` 并以 `manual` 调用 `setData`，走 `success` 写入 data 并清掉 `isInvalidated`。
2. **课程推导：** mutation 返回的就是这条详情要显示的对象时，在 `onSuccess` 里按同一 `queryKey` 写回。可复用时用 `variables.id` 拼 key。改字段时返回新对象。不要指望详情写入自动同步列表。
3. **适用边界：** 本课不把作废列表、`setQueriesData` 批量改多条、完整乐观更新与回滚、`updater` 里创建全新查询作为主界面，或规范化缓存写成主线。官方示例里的 axios 可换成 `fetch`。

## 八、练习

:::exercise
### 练习目标

**要求：** 在 `QueryClientProvider` 下声明详情 `useQuery`，`queryKey` 为 `['tasks', 'detail', 't-1']`。再用 `useMutation` 提交修改，`mutationFn` 用 `fetch` `PATCH` 并在非 2xx 时抛出带状态码的 `Error`。钩子级 `onSuccess` 调用 `queryClient.setQueryData(['tasks', 'detail', data.id], data)`。需要按变量拼 key 时使用 `variables.id`。不要原地修改 `oldData`。可以同时挂 `['tasks']` 列表，但不要把列表自动同步写成必须完成项。

**验收：** 保存成功后详情显示返回对象的 `title` 和 `owner`，详情 `queryFn` 不会因为这次写入再执行。写错 key 时详情保持旧数据。原地修改不应作为答案。

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

/** 读取任务详情。 */
async function loadTask(): Promise<TaskItem> {
  const response = await fetch('/api/tasks/t-1')
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
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

/** 用 mutation 响应更新详情缓存。 */
function TaskEditor(): ReactElement {
  const queryClient = useQueryClient()

  const taskQuery = useQuery({
    queryKey: ['tasks', 'detail', 't-1'],
    queryFn: loadTask,
    staleTime: Infinity,
    retry: false,
  })

  const saveMutation = useMutation({
    mutationFn: editTask,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['tasks', 'detail', variables.id], data)
    },
  })

  return (
    <section>
      {taskQuery.isSuccess ? (
        <p>
          {taskQuery.data.title} / {taskQuery.data.owner}
        </p>
      ) : null}
      <button
        type="button"
        disabled={saveMutation.isPending}
        onClick={() => saveMutation.mutate({ id: 't-1', title: '核对创建任务' })}
      >
        保存修改
      </button>
    </section>
  )
}

/** 提供稳定客户端，避免查询观察丢失。 */
export function App(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <TaskEditor />
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- mutation 已经返回最新对象时，用 `setQueryData` 写回对应查询。
- `onSuccess` 的 `data` 是返回对象，`variables` 用来拼正确的 `queryKey`。
- 更新必须不可变，不要给 `oldData` 赋值。
- updater 得到 `undefined` 时缓存不动。
- 写详情不会自动改列表。

## 十、参考资料

- [Updates from Mutation Responses](https://tanstack.com/query/latest/docs/framework/react/guides/updates-from-mutation-responses) - 支持用返回对象更新现有查询，以及不可变更新。
- [QueryClient](https://tanstack.com/query/latest/docs/reference/QueryClient) - 支持 setQueryData 的同步写入、undefined 不动缓存，以及查询不存在时创建。
- [QueryClient 源码](https://unpkg.com/@tanstack/query-core@5.102.8/src/queryClient.ts) - 支持 functionalUpdate 与 undefined 直接返回。
- [Query 源码](https://unpkg.com/@tanstack/query-core@5.102.8/src/query.ts) - 支持 setData 走 success 并清掉 isInvalidated。
