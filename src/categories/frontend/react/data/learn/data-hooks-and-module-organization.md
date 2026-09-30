---
id: react.data.learn.intermediate.data-hooks-and-module-organization
type: lesson
title: 数据 Hooks 与模块组织
summary: 把 queryOptions 和 mutationOptions 收进自定义 Hook，让组件只调用数据入口，写入时仍用同一份 queryKey。
domain: frontend
technology: react
module: data
stage: intermediate
level: intermediate
estimatedMinutes: 45
prerequisites:
  - react.data.learn.intermediate.query-options-reuse
  - react.data.learn.intermediate.updates-from-mutation-responses
related:
  - react.data.learn.intermediate.query-key-organization
  - react.data.learn.intermediate.use-mutation
  - react.data.learn.intermediate.optimistic-updates
tags:
  - TanStack Query
  - 数据 Hooks
  - queryOptions
  - mutationOptions
  - 模块组织
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-10
objectives:
  - 能用 queryOptions 和 mutationOptions 把同一资源的读取、写入配置收在一处。
  - 能把这些配置包进自定义 Hook，让组件只调用 useTaskList、useEditTask。
  - 能在写入成功后用 options.queryKey 更新缓存，而不是再手打一组数组。
  - 能说明多个组件调用同一份 Hook 时共享同一条查询。
  - 能说明组件层仍可覆盖 select 等选项，但不要另写一套 queryKey。
recap:
  - 一个资源先声明 queryOptions 和 mutationOptions，再包成自定义 Hook。
  - 组件只调用这些 Hook，不要在界面里再手写 queryKey 和 queryFn。
  - 写入成功后用 options.queryKey 更新或作废，保证和读取用同一身份。
  - 多处调用同一份 Hook 会共享缓存。
  - 组件层可以覆盖 select，但不要另起一套 key。
sources:
  - title: Query Options
    url: https://tanstack.com/query/latest/docs/framework/react/guides/query-options
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - queryOptions 用来在多处共享 queryKey 与 queryFn，并让它们保持共置。
      - 运行时这个辅助函数原样返回传入的对象。
      - 同一份配置可以传给 useQuery，也可以用 options.queryKey 读写缓存。
      - 组件层仍可覆盖 select。
  - title: mutationOptions
    url: https://tanstack.com/query/latest/docs/framework/react/reference/functions/mutationOptions
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - mutationOptions 接收和 useMutation 相同的选项，并原样返回。
      - 需要按 mutationKey 查找时，这份配置必须带 mutationKey。
      - 不需要按 key 查找时，可以不写 mutationKey，仍可把配置传给 useMutation。
  - title: queryOptions source
    url: https://unpkg.com/@tanstack/react-query@5.102.8/src/queryOptions.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - queryOptions 的实现是直接返回传入的 options。
  - title: mutationOptions source
    url: https://unpkg.com/@tanstack/react-query@5.102.8/src/mutationOptions.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - mutationOptions 的实现是直接返回传入的 options。
---

# 数据 Hooks 与模块组织

## 一、学习目标

- 用 `queryOptions` 和 `mutationOptions` 把同一资源的读取、写入配置收在一处。
- 把这些配置包进自定义 Hook，让组件只调用 `useTaskList`、`useEditTask`。
- 写入成功后用 `options.queryKey` 更新缓存，而不是再手打一组数组。
- 说明多个组件调用同一份 Hook 时共享同一条查询。
- 说明组件层仍可覆盖 `select` 等选项，但不要另写一套 `queryKey`。

## 二、为什么要把数据收进 Hook

已经能用 `queryOptions` 把 `queryKey` 和 `queryFn` 写在一处，也能在 mutation 成功后用 `setQueryData` 写回对应查询。组件一旦变多，这两件事会散开：看板手写 `['tasks']`，侧栏再写一遍，保存回调又手打一组数组。只要有一处拼错，读取和写入就不是同一条缓存。

官方把 `queryOptions` 和 `mutationOptions` 都做成原样返回传入对象的辅助函数。用途不是多包一层运行时，而是让同一资源的身份、请求函数和写入副作用共置。本课把它们收进自定义 Hook：组件只调用数据入口，不再在界面里声明查询身份。

## 三、核心概念

### 1. 一份配置，两个入口

```tsx
import { mutationOptions, queryOptions, useMutation, useQuery } from '@tanstack/react-query'

export const taskListOptions = queryOptions({
  queryKey: ['tasks'],
  queryFn: loadTasks,
})

export const editTaskOptions = mutationOptions({
  mutationFn: editTask,
})

/** 订阅任务列表。 */
export function useTaskList() {
  return useQuery(taskListOptions)
}

/** 保存任务，并按同一份 queryKey 写回列表。 */
export function useEditTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...editTaskOptions,
    onSuccess: (data) => {
      queryClient.setQueryData(taskListOptions.queryKey, [data])
    },
  })
}
```

`queryOptions` 和 `mutationOptions` 在运行时都只返回传入对象。`useTaskList` 把读取配置交给 `useQuery`。`useEditTask` 展开写入配置，成功后用 `taskListOptions.queryKey` 更新缓存。看板和侧栏都调用 `useTaskList`，看到的是同一条 `['tasks']`。

### 2. 组件只调用 Hook

```tsx
function TaskBoard() {
  const listQuery = useTaskList()
  const editMutation = useEditTask()

  return (
    <button
      type="button"
      disabled={editMutation.isPending}
      onClick={() => editMutation.mutate({ id: 't-1', title: '核对创建任务' })}
    >
      保存修改
    </button>
  )
}
```

界面不再出现 `queryKey`、`queryFn` 或手打的 `setQueryData(['tasks'], ...)`。需要覆盖 `select` 时，在调用处展开同一份配置，而不是另起一组 key。

### 3. 写入必须沿用读取的 queryKey

`setQueryData` 只写传入的那一个 key。保存成功后如果写成 `['task']` 或 `['tasks', 'list']`，看板和侧栏都不会动。用 `taskListOptions.queryKey` 才能保证和 `useTaskList` 是同一条缓存。

源码里两个辅助函数都是 `return options`。类型推断和共置才是价值：`queryKey` 带着 `queryFn` 的数据类型，`getQueryData` / `setQueryData` 不再收到 `unknown`。

## 四、用法与示例

### 1. 按资源导出 Hook

```tsx
import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

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

export const taskListOptions = queryOptions({
  queryKey: ['tasks'],
  queryFn: loadTasks,
  staleTime: Infinity,
  retry: false,
})

export const editTaskOptions = mutationOptions({
  mutationFn: editTask,
  retry: false,
})

/** 订阅任务列表。 */
export function useTaskList() {
  return useQuery(taskListOptions)
}

/** 保存任务，并按同一份 queryKey 写回列表。 */
export function useEditTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...editTaskOptions,
    onSuccess: (data) => {
      queryClient.setQueryData(taskListOptions.queryKey, [data])
    },
  })
}
```

### 2. 两个界面共用同一份读取 Hook

```tsx
function TaskBoard() {
  const listQuery = useTaskList()
  return listQuery.isSuccess ? (
    <p>
      {listQuery.data[0].title} / {listQuery.data[0].owner}
    </p>
  ) : null
}

function TaskSidebar() {
  const listQuery = useTaskList()
  return listQuery.isSuccess ? <p>{listQuery.data[0].title}</p> : null
}
```

两处都订阅 `['tasks']`。保存成功后写回这份 key，看板和侧栏一起换成核对创建任务，列表不必再走一遍 `queryFn`。

### 3. 组件层只覆盖切片

```tsx
const titleQuery = useQuery({
  ...taskListOptions,
  select: (tasks) => tasks[0]?.title,
})
```

`select` 只影响这个观察者看到的值。缓存里仍是完整列表。不要为了取标题再声明 `queryKey: ['task-title']`。

## 五、用法示例：对照两处 Hook 共享同一条缓存

下面的 Demo 把 `taskListOptions` 和 `editTaskOptions` 收在自定义 Hook 里。看板和侧栏都调用 `useTaskList`，保存调用 `useEditTask`。点「保存修改」后，mutation 返回林晓那条改过标题的任务，`onSuccess` 用 `taskListOptions.queryKey` 写回列表。两边标题都变成核对创建任务，列表次数不增加。离开页面会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.intermediate.data-hooks-and-module-organization.data-hooks-and-module-organization-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：组件里再手写一套 queryKey

**触发条件：** 已经有 `useTaskList`，看板仍写 `useQuery({ queryKey: ['tasks'], queryFn: loadTasks })`。

**原因：** 自定义 Hook 的意义是共置身份。界面再写一遍，后续改 key 或 `queryFn` 时两边会分叉。

**后果：** 保存按 Hook 的 key 写回，看板上那份查询仍显示现有任务。

**错误示例：**

```tsx
function TaskBoard() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: loadTasks,
  })
}
```

**正确写法：**

```tsx
function TaskBoard() {
  return useTaskList()
}
```

**验证方式：** 保存成功后看板和侧栏标题都变成核对创建任务。界面另写 key 时，只有走 Hook 的那一侧会变。

### 错误：写入时手打数组，不用 options.queryKey

**触发条件：** `onSuccess` 写成 `setQueryData(['task'], [data])`。

**原因：** `setQueryData` 只写传入的那一个 key。和 `taskListOptions.queryKey` 不同就是另一条缓存。

**后果：** mutation 已经成功，看板和侧栏仍是现有任务。

**错误示例：**

```tsx
onSuccess: (data) => {
  queryClient.setQueryData(['task'], [data])
}
```

**正确写法：**

```tsx
onSuccess: (data) => {
  queryClient.setQueryData(taskListOptions.queryKey, [data])
}
```

**验证方式：** 保存后两边标题都变成核对创建任务。写错 key 时标题和次数都不变。

### 错误：每个组件复制一份 mutationOptions

**触发条件：** 看板和表单各自声明 `mutationFn: editTask`，成功回调各写一套 `setQueryData`。

**原因：** `mutationOptions` 用来让写入配置和读取配置共置。复制后，一处更新列表、另一处忘了更新。

**后果：** 同一个保存，有的界面换成核对创建任务，有的仍停在现有任务。

**错误示例：**

```tsx
useMutation({
  mutationFn: editTask,
  onSuccess: (data) => {
    queryClient.setQueryData(['tasks'], [data])
  },
})
```

**正确写法：**

```tsx
function useEditTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...editTaskOptions,
    onSuccess: (data) => {
      queryClient.setQueryData(taskListOptions.queryKey, [data])
    },
  })
}
```

**验证方式：** 从任意界面点保存，所有调用 `useTaskList` 的地方标题一起变。

### 错误：为了取标题另开一条 queryKey

**触发条件：** 侧栏只要标题，写成 `queryKey: ['task-title']`。

**原因：** 官方用组件层 `select` 切数据。另开 key 会再发一次请求，写入也对不上。

**后果：** 保存写回 `['tasks']`，侧栏那条 `['task-title']` 仍是现有任务。

**错误示例：**

```tsx
useQuery({
  queryKey: ['task-title'],
  queryFn: async () => {
    const tasks = await loadTasks()
    return tasks[0]?.title
  },
})
```

**正确写法：**

```tsx
useQuery({
  ...taskListOptions,
  select: (tasks) => tasks[0]?.title,
})
```

**验证方式：** 保存后侧栏标题变成核对创建任务，列表次数不增加。

### 错误：把 QueryClient 实例放进自定义 Hook 模块顶层

**触发条件：** 在 Hook 文件顶层 `const queryClient = new QueryClient()`，再拿去 `setQueryData`。

**原因：** 正式应用里客户端由 `QueryClientProvider` 提供。模块顶层另建一份，写入进了另一份缓存。

**后果：** Hook 里保存成功，画面上的 `useQuery` 仍读 Provider 那份旧数据。

**错误示例：**

```tsx
const queryClient = new QueryClient()

export function useEditTask() {
  return useMutation({
    ...editTaskOptions,
    onSuccess: (data) => {
      queryClient.setQueryData(taskListOptions.queryKey, [data])
    },
  })
}
```

**正确写法：**

```tsx
export function useEditTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...editTaskOptions,
    onSuccess: (data) => {
      queryClient.setQueryData(taskListOptions.queryKey, [data])
    },
  })
}
```

**验证方式：** 保存后当前页面的看板和侧栏一起更新。顶层另建客户端时，画面标题不变。
:::

## 七、源码推导与适用场景

1. **官方事实：** `queryOptions` 把 `queryKey` 和 `queryFn` 共置，运行时原样返回对象，可供 `useQuery` 使用，也可用 `options.queryKey` 读写缓存；组件层仍可覆盖 `select`。`mutationOptions` 接收和 `useMutation` 相同的选项并原样返回；需要按 key 查找时才必须带 `mutationKey`。源码里两个辅助函数都是 `return options`。
2. **课程推导：** 一个资源先声明这两份配置，再包成 `useTaskList` / `useEditTask`。组件只调用 Hook。写入成功后必须用读取配置上的 `queryKey`，多处界面才会共享同一条缓存。
3. **适用边界：** 本课不把 `useMutationState`、无限查询的 `infiniteQueryOptions`、文件拆分目录约定、SSR 或生产级数据层分层写成主线。官方示例里的 axios 可换成 `fetch`。

## 八、练习

:::exercise
### 练习目标

**要求：** 声明 `taskListOptions = queryOptions({ queryKey: ['tasks'], queryFn: loadTasks })` 和 `editTaskOptions = mutationOptions({ mutationFn: editTask })`。`loadTasks` 与 `editTask` 用 `fetch`，非 2xx 时抛出带状态码的 `Error`。导出 `useTaskList` 调用 `useQuery(taskListOptions)`，导出 `useEditTask` 展开 `editTaskOptions`，并在 `onSuccess` 里 `setQueryData(taskListOptions.queryKey, [data])`。组件只调用这两个 Hook，不要在界面里再写 `queryKey`。

**验收：** 两个界面调用 `useTaskList` 时看到同一份列表。保存成功后两边标题都变成返回对象的 `title`，列表 `queryFn` 不会因为这次写入再执行。写错 key 时两边保持旧数据。

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

const taskListOptions = queryOptions({
  queryKey: ['tasks'],
  queryFn: loadTasks,
  staleTime: Infinity,
  retry: false,
})

const editTaskOptions = mutationOptions({
  mutationFn: editTask,
  retry: false,
})

/** 订阅任务列表。 */
function useTaskList() {
  return useQuery(taskListOptions)
}

/** 保存任务，并按同一份 queryKey 写回列表。 */
function useEditTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...editTaskOptions,
    onSuccess: (data) => {
      queryClient.setQueryData(taskListOptions.queryKey, [data])
    },
  })
}

/** 通过数据 Hook 读取并保存任务。 */
function TaskBoard(): ReactElement {
  const listQuery = useTaskList()
  const editMutation = useEditTask()

  return (
    <section>
      {listQuery.isSuccess ? (
        <p>
          {listQuery.data[0].title} / {listQuery.data[0].owner}
        </p>
      ) : null}
      <button
        type="button"
        disabled={editMutation.isPending}
        onClick={() => editMutation.mutate({ id: 't-1', title: '核对创建任务' })}
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
      <TaskBoard />
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- 一个资源先声明 `queryOptions` 和 `mutationOptions`，再包成自定义 Hook。
- 组件只调用这些 Hook，不要在界面里再写 `queryKey`。
- 写入成功后用 `options.queryKey` 更新缓存。
- 多处调用同一份读取 Hook 会共享同一条查询。
- 组件层可以覆盖 `select`，但不要另开 key。

## 十、参考资料

- [Query Options](https://tanstack.com/query/latest/docs/framework/react/guides/query-options) - 支持把 queryKey 与 queryFn 共置，并用 options.queryKey 读写缓存。
- [mutationOptions](https://tanstack.com/query/latest/docs/framework/react/reference/functions/mutationOptions) - 支持把 useMutation 选项收成可复用对象。
- [queryOptions 源码](https://unpkg.com/@tanstack/react-query@5.102.8/src/queryOptions.ts) - 支持运行时原样返回传入对象。
- [mutationOptions 源码](https://unpkg.com/@tanstack/react-query@5.102.8/src/mutationOptions.ts) - 支持运行时原样返回传入对象。
