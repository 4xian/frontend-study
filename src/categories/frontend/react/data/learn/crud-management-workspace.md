---
id: react.data.learn.intermediate.crud-management-workspace
type: lesson
title: 实战：CRUD 管理工作区
summary: 把列表读取、创建后作废、保存写回详情、删除后再作废收进同一组数据 Hook，让组件只调用入口。
domain: frontend
technology: react
module: data
stage: intermediate
level: intermediate
estimatedMinutes: 50
prerequisites:
  - react.data.learn.intermediate.data-hooks-and-module-organization
  - react.data.learn.intermediate.query-invalidation
  - react.data.learn.intermediate.updates-from-mutation-responses
related:
  - react.data.learn.intermediate.use-mutation
  - react.data.learn.intermediate.query-options-reuse
  - react.data.learn.intermediate.paginated-content-management
tags:
  - TanStack Query
  - CRUD 管理工作区
  - queryOptions
  - mutationOptions
  - setQueryData
  - invalidateQueries
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-10
objectives:
  - 能用 queryOptions 分别声明列表和详情，并把它们包成 useTaskList、useTaskDetail。
  - 能用 mutationOptions 做成创建、保存、删除三个 Hook。
  - 能在创建和删除成功后 exact 作废列表，避免把详情一起重新获取。
  - 能在保存成功后用响应对象 setQueryData 写回详情，不改列表缓存。
  - 能说明组件只调用数据 Hook，不要在界面里再手写 queryKey。
recap:
  - 列表和详情各有 queryOptions，再包成读取 Hook。
  - 创建和删除成功后 exact 作废 ['tasks']，只让列表重新对齐。
  - 保存成功后用 setQueryData 写回详情 key，列表标题不会一起变。
  - 列表 key 是详情的前缀，不作废时不要漏写 exact。
  - 组件只调用数据 Hook，不要在界面里再手写 queryKey。
sources:
  - title: Query Options
    url: https://tanstack.com/query/latest/docs/framework/react/guides/query-options
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - queryOptions 用来在多处共享 queryKey 与 queryFn，并让它们保持共置。
      - 同一份配置可以传给 useQuery，也可以用 options.queryKey 读写缓存。
  - title: mutationOptions
    url: https://tanstack.com/query/latest/docs/framework/react/reference/functions/mutationOptions
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - mutationOptions 接收和 useMutation 相同的选项，并原样返回。
      - 不需要按 mutationKey 查找时，可以不写 mutationKey。
  - title: Invalidations from Mutations
    url: https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - mutation 成功后，相关查询通常需要作废并重新获取。
      - 在 onSuccess 里 await invalidateQueries，mutation 会保持 pending 直到重新获取结束。
  - title: Updates from Mutation Responses
    url: https://tanstack.com/query/latest/docs/framework/react/guides/updates-from-mutation-responses
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 更新对象的 mutation 常常会在响应里带回最新对象。
      - 可以用 setQueryData 立刻写回对应查询，不必再拉一次已经拿到的数据。
      - 写详情 key 不会自动改列表。
  - title: Query Invalidation
    url: https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 传入 queryKey 时，作废所有以该数组为前缀的查询。
      - exact 只打完整相同的那一条。
---

# 实战：CRUD 管理工作区

## 一、学习目标

- 用 `queryOptions` 分别声明列表和详情，并包成 `useTaskList`、`useTaskDetail`。
- 用 `mutationOptions` 做成创建、保存、删除三个 Hook。
- 创建和删除成功后 `exact` 作废列表，避免把详情一起重新获取。
- 保存成功后用响应对象 `setQueryData` 写回详情，不改列表缓存。
- 说明组件只调用数据 Hook，不要在界面里再手写 `queryKey`。

## 二、为什么要做 CRUD 管理工作区

列表读取、创建后作废、保存写回详情、删除后再作废，已经分开学过。管理工作区要把这四件事接到同一组 Hook 上。

林晓的任务既有列表，也有详情。创建「核对创建任务」后，列表必须出现这条新任务。保存「核对保存任务」后，详情立刻换成新标题，列表可以暂时仍显示现有任务。删除当前任务后，列表重新对齐，详情不要跟着被前缀误伤。

列表 key 是 `['tasks']`，详情 key 是 `['tasks', 'detail', id]`。创建时如果按前缀作废 `['tasks']`，详情也会重新获取。本课用 `exact` 只打列表。

本课组合已经学过的能力，不引入分页、无限查询、乐观更新或 SSR。

## 三、核心概念

### 1. 列表和详情各有一份配置

```tsx
const taskListOptions = queryOptions({
  queryKey: ['tasks'],
  queryFn: loadTasks,
})

/** 把任务编号写进详情 queryKey。 */
function taskDetailOptions(id: string) {
  return queryOptions({
    queryKey: ['tasks', 'detail', id],
    queryFn: () => loadTaskDetail(id),
  })
}

/** 订阅任务列表。 */
function useTaskList() {
  return useQuery(taskListOptions)
}

/** 订阅当前选中任务的详情。 */
function useTaskDetail(id: string) {
  return useQuery(taskDetailOptions(id))
}
```

组件不再手写这两套 key。写入时也用同一份 `queryKey`。

### 2. 创建和删除只作废列表

`['tasks']` 是详情的前缀。不写 `exact` 时，作废列表会把 `['tasks', 'detail', id]` 一起打掉。

```tsx
/** 创建后只作废列表这条查询。 */
function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...createTaskOptions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: taskListOptions.queryKey,
        exact: true,
      })
    },
  })
}
```

删除同样只作废列表。`await` 之后，mutation 保持 `pending`，直到列表重新获取结束。

### 3. 保存用响应写回详情

更新对象的 mutation 已经带回最新对象。再为同一条详情重新获取，是浪费已经拿到的数据。

```tsx
/** 保存后用响应对象写回详情缓存。 */
function useEditTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...editTaskOptions,
    onSuccess: (data) => {
      queryClient.setQueryData(taskDetailOptions(data.id).queryKey, data)
    },
  })
}
```

`setQueryData` 只写指定 key。列表仍是创建或删除前的标题，直到下一次列表作废。

## 四、用法与示例

### 1. 读取列表和详情

```tsx
import { queryOptions, useQuery } from '@tanstack/react-query'

type TaskItem = {
  id: string
  title: string
  owner: string
}

/** 读取任务列表，非 2xx 时抛出带状态码的 Error。 */
async function loadTasks(): Promise<TaskItem[]> {
  const response = await fetch('/api/tasks')
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem[]
}

/** 按编号读取任务详情，非 2xx 时抛出带状态码的 Error。 */
async function loadTaskDetail(id: string): Promise<TaskItem> {
  const response = await fetch(`/api/tasks/${id}`)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

const taskListOptions = queryOptions({
  queryKey: ['tasks'],
  queryFn: loadTasks,
  retry: false,
})

/** 把任务编号写进详情 queryKey。 */
function taskDetailOptions(id: string) {
  return queryOptions({
    queryKey: ['tasks', 'detail', id],
    queryFn: () => loadTaskDetail(id),
    retry: false,
  })
}

/** 订阅任务列表。 */
function useTaskList() {
  return useQuery(taskListOptions)
}

/** 订阅当前选中任务的详情。 */
function useTaskDetail(id: string) {
  return useQuery(taskDetailOptions(id))
}
```

有选中编号时才调用 `useTaskDetail`。空字符串不要进入 `queryKey`。

### 2. 创建、保存、删除

```tsx
import { mutationOptions, useMutation, useQueryClient } from '@tanstack/react-query'

/** 创建任务，非 2xx 时抛出带状态码的 Error。 */
async function createTask(): Promise<TaskItem> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '核对创建任务', owner: '林晓' }),
  })
  if (!response.ok) {
    throw new Error(`创建失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

/** 保存任务标题，非 2xx 时抛出带状态码的 Error。 */
async function editTask(id: string): Promise<TaskItem> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '核对保存任务' }),
  })
  if (!response.ok) {
    throw new Error(`保存失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

/** 删除任务，非 2xx 时抛出带状态码的 Error。 */
async function deleteTask(id: string): Promise<{ id: string }> {
  const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(`删除失败：HTTP ${response.status}`)
  }
  return (await response.json()) as { id: string }
}

const createTaskOptions = mutationOptions({
  mutationFn: createTask,
  retry: false,
})

const editTaskOptions = mutationOptions({
  mutationFn: editTask,
  retry: false,
})

const deleteTaskOptions = mutationOptions({
  mutationFn: deleteTask,
  retry: false,
})

/** 创建后只作废列表。 */
function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...createTaskOptions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: taskListOptions.queryKey,
        exact: true,
      })
    },
  })
}

/** 保存后写回详情。 */
function useEditTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...editTaskOptions,
    onSuccess: (data) => {
      queryClient.setQueryData(taskDetailOptions(data.id).queryKey, data)
    },
  })
}

/** 删除后只作废列表。 */
function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...deleteTaskOptions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: taskListOptions.queryKey,
        exact: true,
      })
    },
  })
}
```

### 3. 工作区只调用 Hook

```tsx
function TaskWorkspace() {
  const [selectedId, setSelectedId] = useState('t-1')
  const listQuery = useTaskList()
  const createMutation = useCreateTask()
  const editMutation = useEditTask()
  const deleteMutation = useDeleteTask()

  return (
    <section>
      {listQuery.isSuccess
        ? listQuery.data.map((task) => (
            <button key={task.id} type="button" onClick={() => setSelectedId(task.id)}>
              {task.title} / {task.owner}
            </button>
          ))
        : null}
      {selectedId ? <TaskDetail id={selectedId} /> : null}
      <button type="button" onClick={() => createMutation.mutate()}>
        创建任务
      </button>
      <button type="button" onClick={() => editMutation.mutate(selectedId)}>
        保存修改
      </button>
      <button type="button" onClick={() => deleteMutation.mutate(selectedId)}>
        删除任务
      </button>
    </section>
  )
}

/** 有选中编号时才订阅详情。 */
function TaskDetail({ id }: { id: string }) {
  const detailQuery = useTaskDetail(id)
  if (!detailQuery.isSuccess) {
    return null
  }
  return (
    <p>
      {detailQuery.data.title} / {detailQuery.data.owner}
    </p>
  )
}
```

界面不再手写 `queryKey`。创建后看列表是否出现核对创建任务；保存后看详情是否变成核对保存任务，列表首条仍是现有任务。

## 五、用法示例：对照创建作废、保存写回和删除作废

下面的 Demo 用 `useTaskList` 订阅列表，`useTaskDetail` 订阅当前选中任务，`staleTime` 为 `Infinity`。初始列表是林晓的现有任务。点「创建任务」后 `exact` 作废列表，列表出现核对创建任务 / 林晓，详情仍是现有任务。点「保存修改」后详情变成核对保存任务，列表首条仍是现有任务。点「删除任务」后再作废列表。离开页面会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.intermediate.crud-management-workspace.crud-management-workspace-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：创建时按前缀作废任务树

**触发条件：** `invalidateQueries({ queryKey: ['tasks'] })`，不写 `exact`。

**原因：** 详情 key 以 `['tasks']` 为前缀。前缀作废会把正在显示的详情一起重新获取。

**后果：** 创建一条列表任务，详情次数也增加，画面还可能闪一下。

**错误示例：**

```tsx
await queryClient.invalidateQueries({
  queryKey: ['tasks'],
})
```

**正确写法：**

```tsx
await queryClient.invalidateQueries({
  queryKey: taskListOptions.queryKey,
  exact: true,
})
```

**验证方式：** 创建后列表次数增加，当前详情次数不增加，详情仍是现有任务。

### 错误：保存后去作废列表，不写回详情

**触发条件：** `onSuccess` 里 `invalidateQueries({ queryKey: ['tasks'] })`，不用 `setQueryData`。

**原因：** 更新对象的 mutation 已经带回最新对象。官方用 `setQueryData` 写回对应查询。

**后果：** 详情再拉一次已经拿到的数据；若只作废列表，详情标题还不更新。

**错误示例：**

```tsx
onSuccess: async () => {
  await queryClient.invalidateQueries({ queryKey: ['tasks'] })
}
```

**正确写法：**

```tsx
onSuccess: (data) => {
  queryClient.setQueryData(taskDetailOptions(data.id).queryKey, data)
}
```

**验证方式：** 保存后详情变成核对保存任务，详情次数不增加，列表首条仍是现有任务。

### 错误：用详情 key 去作废列表

**触发条件：** 写成 `invalidateQueries({ queryKey: ['tasks', 'detail', id] })`。

**原因：** 更具体的 key 不会回过头匹配 `['tasks']`。

**后果：** 创建已经成功，列表仍只有现有任务。

**错误示例：**

```tsx
await queryClient.invalidateQueries({
  queryKey: ['tasks', 'detail', 't-1'],
})
```

**正确写法：**

```tsx
await queryClient.invalidateQueries({
  queryKey: taskListOptions.queryKey,
  exact: true,
})
```

**验证方式：** 创建后列表次数增加，列表出现核对创建任务。

### 错误：空选中编号仍去订阅详情

**触发条件：** `useTaskDetail(selectedId)` 写在工作区顶层，删除最后一项后 `selectedId` 变成 `''`。

**原因：** 查询函数用到的编号必须进入查询身份。空字符串会登记一条无意义的详情缓存。

**后果：** 列表已空，仍发起详情请求，或留下 `['tasks', 'detail', '']`。

**错误示例：**

```tsx
function TaskWorkspace() {
  const [selectedId, setSelectedId] = useState('t-1')
  const detailQuery = useTaskDetail(selectedId)
  return <p>{detailQuery.data?.title}</p>
}
```

**正确写法：**

```tsx
{selectedId ? <TaskDetail id={selectedId} /> : null}
```

**验证方式：** 删光列表后不再请求详情，详情标题为无。

### 错误：工作区里再手写一套列表配置

**触发条件：** 已经有 `useTaskList`，页面仍复制 `queryKey: ['tasks']`。

**原因：** 数据 Hook 的意义是共置 key、请求和作废范围。界面再写一遍，创建后作废可能对不上。

**后果：** 创建后 Hook 那一侧更新，手写那一侧仍只有现有任务。

**错误示例：**

```tsx
useQuery({
  queryKey: ['tasks'],
  queryFn: loadTasks,
})
```

**正确写法：**

```tsx
const listQuery = useTaskList()
```

**验证方式：** 创建、保存、删除都只经过数据 Hook，列表次数和详情标题一起对得上。
:::

## 七、源码推导与适用场景

1. **官方事实：** `queryOptions` / `mutationOptions` 运行时原样返回传入对象。mutation 成功后应作废相关查询，并 `await` 这次作废。更新对象的 mutation 若已返回最新对象，用 `setQueryData` 写回对应查询。传入 `queryKey` 时按前缀匹配；`exact` 只打完整相同的那一条。
2. **课程推导：** 工作区把列表和详情收进读取 Hook，把创建、保存、删除收进写入 Hook。创建和删除 `exact` 作废列表；保存只写详情。组件不手写 `queryKey`。空编号不订阅详情。
3. **适用边界：** 本课不把分页、无限查询、乐观更新、SSR 或生产级数据层分层写成主线。官方示例里的 axios 可换成 `fetch`。

## 八、练习

:::exercise
### 练习目标

**要求：** 声明 `taskListOptions`，`queryKey` 为 `['tasks']`。声明 `taskDetailOptions(id)`，`queryKey` 为 `['tasks', 'detail', id]`。导出 `useTaskList`、`useTaskDetail`。再声明创建、保存、删除三份 `mutationOptions` 和对应 Hook。创建和删除的 `onSuccess` 里 `await invalidateQueries({ queryKey: taskListOptions.queryKey, exact: true })`。保存的 `onSuccess` 里 `setQueryData(taskDetailOptions(data.id).queryKey, data)`。组件只调用这些 Hook。有选中编号时才订阅详情。

**验收：** 创建后列表出现新任务，详情次数不因此增加。保存后详情换成新标题，列表首条不变。删除后列表重新对齐。空编号不发起详情请求。

**参考答案：**

```tsx
import {
  QueryClient,
  QueryClientProvider,
  mutationOptions,
  queryOptions,
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

/** 按编号读取任务详情。 */
async function loadTaskDetail(id: string): Promise<TaskItem> {
  const response = await fetch(`/api/tasks/${id}`)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

/** 创建任务。 */
async function createTask(): Promise<TaskItem> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '核对创建任务', owner: '林晓' }),
  })
  if (!response.ok) {
    throw new Error(`创建失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

/** 保存任务标题。 */
async function editTask(id: string): Promise<TaskItem> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '核对保存任务' }),
  })
  if (!response.ok) {
    throw new Error(`保存失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

/** 删除任务。 */
async function deleteTask(id: string): Promise<{ id: string }> {
  const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(`删除失败：HTTP ${response.status}`)
  }
  return (await response.json()) as { id: string }
}

const taskListOptions = queryOptions({
  queryKey: ['tasks'],
  queryFn: loadTasks,
  retry: false,
})

/** 把任务编号写进详情 queryKey。 */
function taskDetailOptions(id: string) {
  return queryOptions({
    queryKey: ['tasks', 'detail', id],
    queryFn: () => loadTaskDetail(id),
    retry: false,
  })
}

const createTaskOptions = mutationOptions({
  mutationFn: createTask,
  retry: false,
})

const editTaskOptions = mutationOptions({
  mutationFn: editTask,
  retry: false,
})

const deleteTaskOptions = mutationOptions({
  mutationFn: deleteTask,
  retry: false,
})

/** 订阅任务列表。 */
function useTaskList() {
  return useQuery(taskListOptions)
}

/** 订阅当前选中任务的详情。 */
function useTaskDetail(id: string) {
  return useQuery(taskDetailOptions(id))
}

/** 创建后只作废列表。 */
function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...createTaskOptions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: taskListOptions.queryKey,
        exact: true,
      })
    },
  })
}

/** 保存后写回详情。 */
function useEditTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...editTaskOptions,
    onSuccess: (data) => {
      queryClient.setQueryData(taskDetailOptions(data.id).queryKey, data)
    },
  })
}

/** 删除后只作废列表。 */
function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...deleteTaskOptions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: taskListOptions.queryKey,
        exact: true,
      })
    },
  })
}

/** 有选中编号时才订阅详情。 */
function TaskDetail({ id }: { id: string }): ReactElement {
  const detailQuery = useTaskDetail(id)
  if (!detailQuery.isSuccess) {
    return <p>正在读取详情。</p>
  }
  return (
    <p>
      {detailQuery.data.title} / {detailQuery.data.owner}
    </p>
  )
}

/** CRUD 管理工作区。 */
function TaskWorkspace(): ReactElement {
  const [selectedId, setSelectedId] = useState('t-1')
  const listQuery = useTaskList()
  const createMutation = useCreateTask()
  const editMutation = useEditTask()
  const deleteMutation = useDeleteTask()

  return (
    <section>
      {listQuery.isSuccess
        ? listQuery.data.map((task) => (
            <button key={task.id} type="button" onClick={() => setSelectedId(task.id)}>
              {task.title} / {task.owner}
            </button>
          ))
        : null}
      {selectedId ? <TaskDetail id={selectedId} /> : null}
      <button type="button" onClick={() => createMutation.mutate()}>
        创建任务
      </button>
      <button
        type="button"
        disabled={!selectedId}
        onClick={() => editMutation.mutate(selectedId)}
      >
        保存修改
      </button>
      <button
        type="button"
        disabled={!selectedId}
        onClick={() => deleteMutation.mutate(selectedId)}
      >
        删除任务
      </button>
    </section>
  )
}

/** 提供稳定客户端，避免查询观察丢失。 */
export function App(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <TaskWorkspace />
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- 列表和详情各有 `queryOptions`，再包成读取 Hook。
- 创建和删除 `exact` 作废列表，详情不被前缀误伤。
- 保存用 `setQueryData` 写回详情，列表标题不会一起变。
- 组件只调用数据 Hook；空编号不订阅详情。
- 本课不展开分页、无限查询或乐观更新。

## 十、参考资料

- [Query Options](https://tanstack.com/query/latest/docs/framework/react/guides/query-options) - 支持把列表和详情配置收进 queryOptions。
- [mutationOptions](https://tanstack.com/query/latest/docs/framework/react/reference/functions/mutationOptions) - 支持把创建、保存、删除配置收成可复用对象。
- [Invalidations from Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations) - 支持写入成功后作废相关查询。
- [Updates from Mutation Responses](https://tanstack.com/query/latest/docs/framework/react/guides/updates-from-mutation-responses) - 支持用 mutation 响应写回详情。
- [Query Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation) - 支持用 exact 只作废完整相同的那一条。
