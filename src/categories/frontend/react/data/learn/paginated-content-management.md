---
id: react.data.learn.intermediate.paginated-content-management
type: lesson
title: 实战：分页内容管理
summary: 把页码写进 queryKey，用自定义 Hook 订阅当前页，创建成功后作废任务前缀，让各页重新对齐。
domain: frontend
technology: react
module: data
stage: intermediate
level: intermediate
estimatedMinutes: 50
prerequisites:
  - react.data.learn.intermediate.paginated-queries
  - react.data.learn.intermediate.data-hooks-and-module-organization
  - react.data.learn.intermediate.query-invalidation
related:
  - react.data.learn.intermediate.query-options-reuse
  - react.data.learn.intermediate.use-mutation
  - react.data.learn.intermediate.updates-from-mutation-responses
tags:
  - TanStack Query
  - 分页内容管理
  - queryOptions
  - keepPreviousData
  - invalidateQueries
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-10
objectives:
  - 能用 queryOptions 把页码写进 queryKey，并包成 useTaskPage。
  - 能用 placeholderData 传入 keepPreviousData，翻页时留下上一页。
  - 能在占位期间禁用下一页，只有不是占位且 hasMore 为 true 时才前进。
  - 能用 mutationOptions 做成 useCreateTask，成功后 await 作废任务前缀。
  - 能说明创建后各页会重新获取，当前页列表出现新任务。
recap:
  - 分页工作区先把页码写进 queryKey，再包成读取 Hook。
  - keepPreviousData 只给观察者留下上一页，不把上一页写进新页缓存。
  - 下一页要在不是占位、并且 hasMore 为 true 时才前进。
  - 创建成功后作废 ['tasks'] 前缀，各页重新对齐服务端。
  - 组件只调用数据 Hook，不要在界面里再手写 queryKey。
sources:
  - title: Paginated / Lagged Queries
    url: https://tanstack.com/query/latest/docs/framework/react/guides/paginated-queries
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 分页把页码写进 queryKey 就能工作。
      - 每一页都被当成全新查询，界面会在 success 和 pending 之间跳动。
      - 把 placeholderData 设成 keepPreviousData，新页请求期间仍能看到上一份成功数据。
      - isPlaceholderData 用来判断观察者当前提供的是不是上一份数据。
      - 下一页按钮应在占位或没有更多页时禁用。
  - title: Query Options
    url: https://tanstack.com/query/latest/docs/framework/react/guides/query-options
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - queryOptions 用来在多处共享 queryKey 与 queryFn，并让它们保持共置。
      - 同一份配置可以传给 useQuery。
  - title: mutationOptions
    url: https://tanstack.com/query/latest/docs/framework/react/reference/functions/mutationOptions
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - mutationOptions 接收和 useMutation 相同的选项，并原样返回。
  - title: Invalidations from Mutations
    url: https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - mutation 成功后，相关查询通常需要作废并重新获取。
      - 在 onSuccess 里 await invalidateQueries，mutation 会保持 pending 直到重新获取结束。
---

# 实战：分页内容管理

## 一、学习目标

- 用 `queryOptions` 把页码写进 `queryKey`，并包成 `useTaskPage`。
- 用 `placeholderData` 传入 `keepPreviousData`，翻页时留下上一页。
- 在占位期间禁用下一页，只有不是占位且 `hasMore` 为 true 时才前进。
- 用 `mutationOptions` 做成 `useCreateTask`，成功后 `await` 作废任务前缀。
- 说明创建后各页会重新获取，当前页列表出现新任务。

## 二、为什么要做分页内容管理

已经能单独完成三件事：把页码写进 `queryKey` 并留下上一页；把读取和写入收进自定义 Hook；写入成功后作废相关查询。内容管理工作区要把这三件事放在同一条路径上。

林晓的任务按页返回。翻到第二页时，画面应先留下第一页，而不是空白。创建「核对创建任务」后，第一页必须出现这条新任务。页码、请求函数和作废范围如果各写一套，翻页会丢占位，创建后当前页也不更新。

本课组合已经学过的能力，不引入无限查询、乐观更新或完整 CRUD。

## 三、核心概念

### 1. 当前页是一条带页码的查询

```tsx
function taskPageOptions(page: number) {
  return queryOptions({
    queryKey: ['tasks', 'page', page],
    queryFn: () => loadTaskPage(page),
    placeholderData: keepPreviousData,
  })
}

/** 订阅当前页任务列表。 */
function useTaskPage(page: number) {
  return useQuery(taskPageOptions(page))
}
```

`page` 变了，查询身份就变了。第一页和第二页各有缓存。`keepPreviousData` 只给观察者留下上一页，不会把第一页写进第二页的缓存。

### 2. 占位期间不要前进

官方下一页按钮写成 `disabled={isPlaceholderData || !data?.hasMore}`。占位时 `data` 仍是上一页，`hasMore` 也属于上一页。这时加页码会连跳。

```tsx
<button
  type="button"
  disabled={pageQuery.isPlaceholderData || !pageQuery.data?.hasMore}
  onClick={() => {
    if (!pageQuery.isPlaceholderData && pageQuery.data?.hasMore) {
      setPage((current) => current + 1)
    }
  }}
>
  下一页
</button>
```

### 3. 创建后作废任务前缀

新任务落在第一页。只写当前页 `['tasks', 'page', 1]`，第二页不会动；只写详情更对不上列表。前缀 `['tasks']` 会打到 `['tasks', 'page', 1]` 和 `['tasks', 'page', 2]`。

```tsx
const createTaskOptions = mutationOptions({
  mutationFn: createTask,
})

/** 创建任务后作废任务前缀。 */
function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...createTaskOptions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
```

`await` 作废后，mutation 保持 `pending`，直到正在显示的那一页重新获取结束。

## 四、用法与示例

### 1. 按页读取并留下上一页

```tsx
import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from '@tanstack/react-query'

type TaskItem = {
  id: string
  title: string
  owner: string
}

type TaskPage = {
  tasks: TaskItem[]
  hasMore: boolean
}

/** 按页读取任务，非 2xx 时抛出带状态码的 Error。 */
async function loadTaskPage(page: number): Promise<TaskPage> {
  const response = await fetch(`/api/tasks?page=${page}`)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskPage
}

function taskPageOptions(page: number) {
  return queryOptions({
    queryKey: ['tasks', 'page', page],
    queryFn: () => loadTaskPage(page),
    placeholderData: keepPreviousData,
    retry: false,
  })
}

/** 订阅当前页。 */
function useTaskPage(page: number) {
  return useQuery(taskPageOptions(page))
}
```

### 2. 创建后作废各页

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

const createTaskOptions = mutationOptions({
  mutationFn: createTask,
  retry: false,
})

/** 创建任务后作废任务前缀。 */
function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...createTaskOptions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
```

### 3. 工作区只调用 Hook

```tsx
function TaskWorkspace() {
  const [page, setPage] = useState(1)
  const pageQuery = useTaskPage(page)
  const createMutation = useCreateTask()

  return (
    <section>
      {pageQuery.isSuccess
        ? pageQuery.data.tasks.map((task) => (
            <p key={task.id}>
              {task.title} / {task.owner}
            </p>
          ))
        : null}
      <button
        type="button"
        disabled={pageQuery.isPlaceholderData || !pageQuery.data?.hasMore}
        onClick={() => setPage((current) => current + 1)}
      >
        下一页
      </button>
      <button
        type="button"
        disabled={createMutation.isPending}
        onClick={() => createMutation.mutate()}
      >
        创建任务
      </button>
    </section>
  )
}
```

界面不再手写 `queryKey`。翻页看 `isPlaceholderData`，创建后看当前页是否出现核对创建任务。

## 五、用法示例：对照翻页占位和创建后作废

下面的 Demo 用 `useTaskPage` 订阅当前页，`staleTime` 为 `Infinity`。第一页是林晓的现有任务，第二页是周宁的第二页任务。点「下一页」时先留下第一页，占位为是，第二页次数随后增加。点「创建任务」后作废 `['tasks']` 前缀，当前页重新获取，列表出现核对创建任务 / 林晓。离开页面会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.intermediate.paginated-content-management.paginated-content-management-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：页码不写进 queryKey

**触发条件：** `useQuery({ queryKey: ['tasks'], queryFn: () => loadTaskPage(page) })`。

**原因：** 查询函数用到的页码必须进入查询身份。不写页码时，第一页和第二页抢同一条缓存。

**后果：** 翻到第二页后，回来仍可能显示周宁，或第一页被第二页覆盖。

**错误示例：**

```tsx
useQuery({
  queryKey: ['tasks'],
  queryFn: () => loadTaskPage(page),
})
```

**正确写法：**

```tsx
useQuery(taskPageOptions(page))
```

**验证方式：** 先看第一页林晓，再看第二页周宁，再回第一页仍是林晓。

### 错误：占位期间仍然加页码

**触发条件：** 下一页按钮只判断 `data.hasMore`，不看 `isPlaceholderData`。

**原因：** 占位时 `data` 仍是上一页。上一页 `hasMore` 为 true 时会在新页还没回来就再加一页。

**后果：** 从第一页连跳到第三页，第二页请求被丢掉。

**错误示例：**

```tsx
<button
  type="button"
  disabled={!pageQuery.data?.hasMore}
  onClick={() => setPage((current) => current + 1)}
>
  下一页
</button>
```

**正确写法：**

```tsx
<button
  type="button"
  disabled={pageQuery.isPlaceholderData || !pageQuery.data?.hasMore}
  onClick={() => {
    if (!pageQuery.isPlaceholderData && pageQuery.data?.hasMore) {
      setPage((current) => current + 1)
    }
  }}
>
  下一页
</button>
```

**验证方式：** 点下一页后，占位为是时按钮不可点；第二页出现周宁后才能再判断 hasMore。

### 错误：创建成功后只写当前页对象，不作废前缀

**触发条件：** `onSuccess` 里 `setQueryData(['tasks', 'page', page], ...)`，不 `invalidateQueries`。

**原因：** 新任务可能改变总页数，或其他页也需要对齐。官方在 mutation 成功后作废相关查询。

**后果：** 当前页看起来有新任务，回到已缓存的第一页仍是创建前的列表。

**错误示例：**

```tsx
onSuccess: (data) => {
  queryClient.setQueryData(['tasks', 'page', 1], (oldData) => oldData)
}
```

**正确写法：**

```tsx
onSuccess: async () => {
  await queryClient.invalidateQueries({ queryKey: ['tasks'] })
}
```

**验证方式：** 在第一页创建后，第一页次数增加，列表出现核对创建任务 / 林晓。

### 错误：用详情 key 去作废分页列表

**触发条件：** 写成 `invalidateQueries({ queryKey: ['tasks', 'detail', id] })`。

**原因：** 更具体的 key 不会回过头匹配 `['tasks', 'page', 1]`。

**后果：** 创建已经成功，当前页仍是现有任务。

**错误示例：**

```tsx
await queryClient.invalidateQueries({
  queryKey: ['tasks', 'detail', 't-1'],
})
```

**正确写法：**

```tsx
await queryClient.invalidateQueries({
  queryKey: ['tasks'],
})
```

**验证方式：** 创建后第一页次数增加，列表出现核对创建任务。

### 错误：工作区里再手写一套分页配置

**触发条件：** 已经有 `useTaskPage`，页面仍复制 `queryKey: ['tasks', 'page', page]`。

**原因：** 数据 Hook 的意义是共置页码、请求和占位。界面再写一遍，作废前缀可能对不上。

**后果：** 创建后 Hook 那一侧更新，手写那一侧仍显示现有任务。

**错误示例：**

```tsx
useQuery({
  queryKey: ['tasks', 'page', page],
  queryFn: () => loadTaskPage(page),
})
```

**正确写法：**

```tsx
const pageQuery = useTaskPage(page)
```

**验证方式：** 翻页和创建都只经过 `useTaskPage` / `useCreateTask`，当前页标题和次数一起变化。
:::

## 七、源码推导与适用场景

1. **官方事实：** 分页把页码写进 `queryKey`。每一页都是新查询，未写占位时会在 `success` 和 `pending` 之间跳动。`placeholderData: keepPreviousData` 让观察者在新页请求期间留下上一份成功数据，并用 `isPlaceholderData` 区分。下一页应在不是占位且 `hasMore` 为 true 时才前进。`queryOptions` / `mutationOptions` 运行时原样返回传入对象。mutation 成功后应作废相关查询，并 `await` 这次作废。
2. **课程推导：** 工作区把页码配置收进 `useTaskPage`，把创建收进 `useCreateTask`。翻页走占位，创建走任务前缀作废。组件不手写 `queryKey`。
3. **适用边界：** 本课不把无限查询、乐观更新、完整 CRUD 编辑删除、SSR 或生产级数据层分层写成主线。官方示例里的 axios 可换成 `fetch`。

## 八、练习

:::exercise
### 练习目标

**要求：** 声明 `taskPageOptions(page)`，`queryKey` 为 `['tasks', 'page', page]`，`placeholderData` 为 `keepPreviousData`。导出 `useTaskPage`。再声明 `createTaskOptions` 和 `useCreateTask`，`mutationFn` 用 `fetch` `POST`，非 2xx 时抛出带状态码的 `Error`，`onSuccess` 里 `await invalidateQueries({ queryKey: ['tasks'] })`。组件用页码 state 调用这两个 Hook。下一页按钮在 `isPlaceholderData` 或没有 `hasMore` 时禁用。

**验收：** 第一页显示林晓，第二页显示另一页数据。翻页时先留下上一页。创建成功后当前页出现新任务，任务前缀下的页次数增加。

**参考答案：**

```tsx
import {
  keepPreviousData,
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

type TaskPage = {
  tasks: TaskItem[]
  hasMore: boolean
}

/** 按页读取任务。 */
async function loadTaskPage(page: number): Promise<TaskPage> {
  const response = await fetch(`/api/tasks?page=${page}`)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskPage
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

function taskPageOptions(page: number) {
  return queryOptions({
    queryKey: ['tasks', 'page', page],
    queryFn: () => loadTaskPage(page),
    placeholderData: keepPreviousData,
    retry: false,
  })
}

const createTaskOptions = mutationOptions({
  mutationFn: createTask,
  retry: false,
})

/** 订阅当前页。 */
function useTaskPage(page: number) {
  return useQuery(taskPageOptions(page))
}

/** 创建任务后作废任务前缀。 */
function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...createTaskOptions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

/** 分页内容管理工作区。 */
function TaskWorkspace(): ReactElement {
  const [page, setPage] = useState(1)
  const pageQuery = useTaskPage(page)
  const createMutation = useCreateTask()

  return (
    <section>
      {pageQuery.isSuccess
        ? pageQuery.data.tasks.map((task) => (
            <p key={task.id}>
              {task.title} / {task.owner}
            </p>
          ))
        : null}
      <button
        type="button"
        disabled={pageQuery.isPlaceholderData || !pageQuery.data?.hasMore}
        onClick={() => {
          if (!pageQuery.isPlaceholderData && pageQuery.data?.hasMore) {
            setPage((current) => current + 1)
          }
        }}
      >
        下一页
      </button>
      <button
        type="button"
        disabled={createMutation.isPending}
        onClick={() => createMutation.mutate()}
      >
        创建任务
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

- 分页工作区把页码写进 `queryKey`，并包成读取 Hook。
- `keepPreviousData` 翻页时留下上一页，用 `isPlaceholderData` 禁用下一页。
- 创建成功后作废 `['tasks']` 前缀，各页重新对齐。
- 组件只调用 `useTaskPage` 和 `useCreateTask`。
- 本课不展开无限查询或完整 CRUD。

## 十、参考资料

- [Paginated / Lagged Queries](https://tanstack.com/query/latest/docs/framework/react/guides/paginated-queries) - 支持把页码写进 queryKey，并用 keepPreviousData 留下上一页。
- [Query Options](https://tanstack.com/query/latest/docs/framework/react/guides/query-options) - 支持把分页配置收进 queryOptions。
- [mutationOptions](https://tanstack.com/query/latest/docs/framework/react/reference/functions/mutationOptions) - 支持把创建配置收成可复用对象。
- [Invalidations from Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations) - 支持创建成功后作废相关查询。
