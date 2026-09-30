---
id: react.data.learn.intermediate.initial-and-placeholder-data
type: lesson
title: 初始数据与占位数据
summary: 用 initialData 把完整数据写入缓存，用 placeholderData 只给观察者画面；残缺预览不要写进缓存。
domain: frontend
technology: react
module: data
stage: intermediate
level: intermediate
estimatedMinutes: 45
prerequisites:
  - react.data.learn.basics.query-status
  - react.data.learn.basics.stale-time-and-freshness
related:
  - react.data.learn.basics.query-cache-and-sharing
  - react.data.learn.intermediate.query-options-reuse
  - react.data.learn.intermediate.parallel-queries
tags:
  - TanStack Query
  - initialData
  - placeholderData
  - initialDataUpdatedAt
  - isPlaceholderData
  - keepPreviousData
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-10
objectives:
  - 能说明 initialData 会在缓存为空时写入 Query，并跳过初始 pending。
  - 能说明 placeholderData 只给当前观察者画面，不会写入缓存。
  - 能用 isPlaceholderData 区分占位画面和真实成功数据。
  - 能配合 staleTime 与 initialDataUpdatedAt，判断这份初始数据要不要立刻再请求。
  - 能用 keepPreviousData 或恒等函数，在 queryKey 变化时留下上一份观察者数据。
recap:
  - initialData 会持久写入缓存，适合完整、可当作真实结果的数据。
  - placeholderData 不进缓存，适合残缺预览或暂时留下上一份画面。
  - 有占位数据时观察者是 success，要用 isPlaceholderData 判断是不是真数据。
  - 默认把 initialData 当成刚刚成功的数据；默认 staleTime 为 0 时会立刻再请求。
  - 本课不把分页界面、预取或写入当成主线。
sources:
  - title: Initial Query Data
    url: https://tanstack.com/query/latest/docs/framework/react/guides/initial-query-data
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - initialData 会在缓存为空时预填这条查询。
      - initialData 会持久写入缓存，不要把占位、残缺或不完整数据放进这里，应改用 placeholderData。
      - 提供 initialData 后可以跳过初始 loading，因为缓存已经有数据。
      - 默认把 initialData 当成刚刚成功的数据，会参与 staleTime 判断。
      - 默认 staleTime 为 0 时，挂载会立刻再请求。
      - 设置有限 staleTime 后，这份初始数据在该窗口内视为新鲜。
      - initialDataUpdatedAt 是这份初始数据自己上次更新的毫秒时间戳。
      - 函数形式的 initialData 只在查询初始化时执行一次。
      - 可以从另一条查询的缓存里取出 initialData。
      - 建议把来源查询的 dataUpdatedAt 传给 initialDataUpdatedAt。
      - 来源过旧时可以返回 undefined，让查询走硬加载。
  - title: Placeholder Query Data
    url: https://tanstack.com/query/latest/docs/framework/react/guides/placeholder-query-data
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - placeholderData 让查询表现得像已经有数据，但这份数据不会写入缓存。
      - 适合已经有部分、假的或预览数据，可以先画出成功界面。
      - 使用 placeholderData 时查询不是 pending，一开始就是 success。
      - 用 isPlaceholderData 为 true 区分占位画面和真实数据。
      - 函数形式会收到上一次成功查询的 previousData 和 previousQuery。
      - queryKey 变化时可以用恒等函数留下上一份数据。
      - 计算昂贵的占位值应当用 useMemo 记住。
      - 可以从另一条查询缓存取出预览，作为本查询的占位数据。
  - title: keepPreviousData
    url: https://tanstack.com/query/latest/docs/framework/react/reference/functions/keepPreviousData
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - keepPreviousData 作为 placeholderData 传入，会在新 queryKey 请求期间继续显示上一份数据。
      - 它是把 previousData 原样返回的恒等函数。
  - title: Migrating to TanStack Query v5
    url: https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 已移除 keepPreviousData 布尔选项和 isPreviousData。
      - 同等能力改用 placeholderData 传入 keepPreviousData 或恒等函数，并用 isPlaceholderData。
      - placeholderData 总会把观察者放进 success。
      - 占位期间 dataUpdatedAt 保持为 0。
      - useQueries 的 placeholderData 函数拿不到 previousData 和 previousQuery。
  - title: Query initialData source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/query.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 查询初始化时，函数形式的 initialData 会被调用一次，结果写入 QueryState.data。
      - 有初始数据时 status 为 success，dataUpdatedAt 取 initialDataUpdatedAt，没有则用当前时间。
      - 没有初始数据时 status 为 pending，dataUpdatedAt 为 0，fetchStatus 为 idle。
      - 缓存里还没有 data 时，后续 options 带来的 initialData 仍可以写入成功状态。
  - title: QueryObserver placeholderData source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/queryObserver.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - placeholderData 是观察者选项，只在缓存 data 为 undefined 且 status 为 pending 时使用。
      - 占位成功后观察者 status 为 success，isPlaceholderData 为 true，缓存 data 仍是 undefined。
      - 函数形式会拿到上一次有数据的查询的 data 和 Query 对象。
      - 占位数据默认也会经过 select。
  - title: keepPreviousData source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/utils.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - keepPreviousData 只返回传入的 previousData。
---

# 初始数据与占位数据

## 一、学习目标

- 说明 `initialData` 会在缓存为空时写入 Query，并跳过初始 `pending`。
- 说明 `placeholderData` 只给当前观察者画面，不会写入缓存。
- 用 `isPlaceholderData` 区分占位画面和真实成功数据。
- 配合 `staleTime` 与 `initialDataUpdatedAt`，判断这份初始数据要不要立刻再请求。
- 用 `keepPreviousData` 或恒等函数，在 `queryKey` 变化时留下上一份观察者数据。

## 二、为什么需要初始数据与占位数据

列表里已经有林晓的标题，点进详情时不必先画一块空白。问题是：这份提前知道的数据，该不该当成这条查询的真实结果？

如果它已经完整、可以当作缓存里的成功数据，用 `initialData`。如果它只是标题、摘要或上一份画面，用 `placeholderData`。两者都会让观察者先看到数据，但只有前者会写进 Query 缓存。

基础课已经分清 `status` 和 `staleTime`。本课要看清另一件事：观察者手里的 `data`，不一定等于缓存里的 `data`。

## 三、核心概念

### 1. initialData 写入缓存

`initialData` 是声明式预填：这条查询的缓存还是空的，就把这份数据写进去。缓存一旦有数据，`status` 就是 `success`，不会先走初始 `pending`。

官方强调：`initialData` **会持久写入缓存**。不要把占位、残缺或不完整数据放进这里。列表里只有标题、没有正文时，应改用 `placeholderData`。

命令式预填（预取、`setQueryData`）也能把数据放进缓存，那是另一条路。本课主线是查询选项上的 `initialData`。

### 2. placeholderData 只给观察者

`placeholderData` 让查询表现得像已经有数据，但这份数据**不会**写入缓存。详情页可以用列表里的标题先画出布局，等完整对象回来后再替换。

有占位数据时，查询不是 `pending`，观察者一开始就是 `success`。要用 `isPlaceholderData === true` 判断现在看到的是不是占位。

官方文档有时会写成“缓存为空时预填”。源码里它是观察者选项：只有缓存 `data` 为 `undefined` 且 `status` 为 `pending` 时，才把占位结果交给当前观察者。Query 缓存本身仍是空的，`dataUpdatedAt` 也仍是 `0`。

### 3. 默认把 initialData 当成刚刚成功的数据

默认情况下，`initialData` 被当成刚刚拉取成功的数据。`dataUpdatedAt` 默认是当前时间。它会按 `staleTime` 判断新不新鲜。

- 不设 `staleTime`（默认 `0`）：挂载后立刻再请求。界面先显示初始数据，同时 `isFetching` 为 `true`。
- 设了有限 `staleTime`：在这个窗口内视为新鲜，不会因为这份初始数据立刻再请求。
- 初始数据其实更早：传入 `initialDataUpdatedAt`，单位是毫秒时间戳。Unix 秒需要乘以 `1000`。这样 `staleTime` 仍按“数据要有多新”工作，而不是假装它刚刚成功。

从另一条查询缓存里取 `initialData` 时，来源通常已经旧了。官方建议把来源的 `dataUpdatedAt` 传给 `initialDataUpdatedAt`，而不是人为拉长 `staleTime`。

### 4. 函数形式只在初始化时跑一次

访问初始数据比较重、或不想每次渲染都算时，把 `initialData` 写成函数。它只在这条 Query **初始化时执行一次**。

```tsx
useQuery({
  queryKey: ['tasks', 'detail', taskId] as const,
  queryFn: () => fetch(`/api/tasks/${taskId}`).then((response) => response.json()),
  initialData: () =>
    queryClient.getQueryData<Task[]>(['tasks', 'list'])?.find((task) => task.id === taskId),
  initialDataUpdatedAt: () => queryClient.getQueryState(['tasks', 'list'])?.dataUpdatedAt,
})
```

来源过旧时可以返回 `undefined`，查询就会走硬加载，而不是把过期列表项写进详情缓存。

`placeholderData` 也可以是函数。它拿到的是**上一次成功查询**的 `previousData` 和 `previousQuery`，不是当前这条空缓存。计算昂贵的占位值用 `useMemo` 记住引用，避免每次渲染都重新生成。

### 5. keepPreviousData 是占位恒等函数

`queryKey` 从 `['tasks', 'owner', 'lin']` 换成 `['tasks', 'owner', 'zhou']` 时，新查询默认没有数据，观察者会回到 `pending`。把 `placeholderData` 写成 `(previousData) => previousData`，或直接传入导出的 `keepPreviousData`，就会在新请求完成前继续显示上一份成功数据。

这不是 v4 的布尔选项。v5 已移除 `keepPreviousData: true` 和 `isPreviousData`，改看 `isPlaceholderData`。占位期间观察者是 `success`，`dataUpdatedAt` 保持为 `0`。完整分页界面不是本课主线。

`useQueries` 的占位函数拿不到 `previousData` 和 `previousQuery`，两者都是 `undefined`。那条限制已经在并行查询课里核对过，这里不要反过来用。

## 四、用法与示例

### 1. 完整数据用 initialData

```tsx
import { queryOptions, useQuery } from '@tanstack/react-query'

type Task = {
  id: string
  title: string
  owner: string
  detail: string
}

const previewTask: Task = {
  id: 't-701',
  title: '核对初始标题',
  owner: '林晓',
  detail: '完整说明已经在本地备好',
}

/** 把详情身份、请求和初始数据收进一份配置。 */
function taskDetailOptions(taskId: string) {
  return queryOptions({
    queryKey: ['tasks', 'detail', taskId] as const,
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}`)
      if (!response.ok) {
        throw new Error(`任务请求失败：HTTP ${response.status}`)
      }
      return (await response.json()) as Task
    },
    initialData: previewTask,
    staleTime: 60 * 1000,
  })
}
```

这份数据必须完整到可以当作详情缓存。默认 `staleTime` 为 `0` 时，挂载仍会立刻再请求。

### 2. 残缺预览用 placeholderData

```tsx
import { useQuery, useQueryClient } from '@tanstack/react-query'

/** 用列表里的标题先画出详情，不把残缺对象写进详情缓存。 */
function TaskPreview({ taskId }: { taskId: string }) {
  const queryClient = useQueryClient()
  const taskQuery = useQuery({
    queryKey: ['tasks', 'detail', taskId] as const,
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}`)
      if (!response.ok) {
        throw new Error(`任务请求失败：HTTP ${response.status}`)
      }
      return (await response.json()) as Task
    },
    placeholderData: () =>
      queryClient.getQueryData<Task[]>(['tasks', 'list'])?.find((task) => task.id === taskId),
  })

  if (taskQuery.isPlaceholderData) {
    return <p>正在补全 {taskQuery.data?.title}</p>
  }

  return <p>{taskQuery.data?.detail}</p>
}
```

观察者可以先渲染标题；`getQueryData(['tasks', 'detail', taskId])` 在真实请求完成前仍是 `undefined`。

### 3. queryKey 变化时留下上一份画面

```tsx
import { keepPreviousData, useQuery } from '@tanstack/react-query'

/** 切换负责人时先留下上一份列表，等新请求回来再替换。 */
function OwnerTasks({ owner }: { owner: string }) {
  const tasksQuery = useQuery({
    queryKey: ['tasks', 'owner', owner] as const,
    queryFn: async () => {
      const response = await fetch(`/api/tasks?owner=${owner}`)
      if (!response.ok) {
        throw new Error(`任务请求失败：HTTP ${response.status}`)
      }
      return (await response.json()) as Task[]
    },
    placeholderData: keepPreviousData,
  })

  return (
    <section>
      <p>{String(tasksQuery.isPlaceholderData)}</p>
      <ul>
        {tasksQuery.data?.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </section>
  )
}
```

第一次还没有上一份成功数据时，不会出现占位，观察者仍是 `pending`。

## 五、用法示例：对照缓存和观察者

下面的 Demo 用同一份林晓预览，分别写成 `initialData` 和 `placeholderData`。请求约 `1.4` 秒，并关掉自动重试，避免对比被重试打断。点“开始观察”后看四组指标：`status`、`isPlaceholderData`、缓存 `data`、`dataUpdatedAt`。

初始数据会立刻把缓存变成“有”，`status` 为 `success`，`isPlaceholderData` 为 `false`，同时因为默认 `staleTime` 为 `0` 会马上再请求。占位数据也会让观察者进入 `success`，但缓存仍是“无”，`isPlaceholderData` 为 `true`，`dataUpdatedAt` 为 `0`。

“保留上一份”不画分页。先看林晓，等真实请求写进缓存后再看周宁，观察者会暂时留下林晓那一份，新的 `queryKey` 缓存仍是空的。离开页面会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.intermediate.initial-and-placeholder-data.initial-and-placeholder-data-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：把列表预览写进 initialData

**触发条件：** 详情查询用列表项的标题和摘要作为 `initialData`。

**原因：** `initialData` 会写入 Query 缓存，被当成这条查询的成功数据。

**后果：** 其他观察者读到残缺对象；`isPlaceholderData` 为 `false`，界面以为详情已经完整。

**错误示例：**

```tsx
useQuery({
  queryKey: ['tasks', 'detail', taskId],
  queryFn: loadTask,
  initialData: listPreview,
})
```

**正确写法：**

```tsx
useQuery({
  queryKey: ['tasks', 'detail', taskId],
  queryFn: loadTask,
  placeholderData: listPreview,
})
```

**验证方式：** 开始观察后立刻读 `queryClient.getQueryData`。占位时缓存没有数据；初始数据时缓存已有预览。

### 错误：以为 initialData 不会立刻再请求

**触发条件：** 写了 `initialData`，没有设 `staleTime` 或 `initialDataUpdatedAt`，却按“已经有缓存、不会请求”来设计。

**原因：** 默认把 `initialData` 当成刚刚成功的数据。默认 `staleTime` 为 `0`，挂载后立刻再请求。

**后果：** 界面已经有数据，网络面板里仍会打出详情请求。

**错误示例：**

```tsx
useQuery({
  queryKey: ['tasks', 'detail', taskId],
  queryFn: loadTask,
  initialData: completeTask,
})
```

**正确写法：**

```tsx
useQuery({
  queryKey: ['tasks', 'detail', taskId],
  queryFn: loadTask,
  initialData: completeTask,
  staleTime: 60 * 1000,
  initialDataUpdatedAt: completeTaskUpdatedAt,
})
```

**验证方式：** 不设 `staleTime` 时，开始观察后 `isFetching` 马上为 `true`；设了足够窗口且 `initialDataUpdatedAt` 足够新时，不会立刻再请求。

### 错误：用 isSuccess 判断已经拿到真实数据

**触发条件：** 看到 `status` 为 `success` 或 `isSuccess` 为 `true`，就按完整结果渲染，不看 `isPlaceholderData`。

**原因：** 占位数据会把观察者放进 `success`，这是占位的设计，不是请求已经完成。

**后果：** 残缺预览被当成完整详情；或者 `queryKey` 已切换，界面仍把上一份数据当成当前结果。

**错误示例：**

```tsx
if (taskQuery.isSuccess) {
  return <p>{taskQuery.data.detail}</p>
}
```

**正确写法：**

```tsx
if (taskQuery.isPlaceholderData) {
  return <p>正在补全 {taskQuery.data?.title}</p>
}

if (taskQuery.isSuccess) {
  return <p>{taskQuery.data.detail}</p>
}
```

**验证方式：** 使用 `placeholderData` 后立刻查看，`isSuccess` 为 `true` 且 `isPlaceholderData` 为 `true`；真实请求完成后再变成 `false`。

### 错误：继续写 keepPreviousData 布尔选项

**触发条件：** 从 v4 示例复制 `keepPreviousData: true`，或读取 `isPreviousData`。

**原因：** v5 已移除该布尔选项和 `isPreviousData`。同等能力是 `placeholderData: keepPreviousData`。

**后果：** 类型报错或选项被忽略，切换 `queryKey` 时画面回到空白。

**错误示例：**

```tsx
useQuery({
  queryKey: ['tasks', 'owner', owner],
  queryFn: loadOwnerTasks,
  keepPreviousData: true,
})
```

**正确写法：**

```tsx
useQuery({
  queryKey: ['tasks', 'owner', owner],
  queryFn: loadOwnerTasks,
  placeholderData: keepPreviousData,
})
```

**验证方式：** 先成功读取林晓，再切换到周宁，`isPlaceholderData` 为 `true`，列表暂时仍是林晓。

### 错误：在 useQueries 里指望拿到上一份查询

**触发条件：** 给 `useQueries` 的某一项写 `placeholderData: (previousData) => previousData`。

**原因：** `useQueries` 的占位函数拿不到上一次查询信息，`previousData` 与 `previousQuery` 都是 `undefined`。

**后果：** 占位函数拿不到上一份数据，切换后仍是空白，表现得像没写占位。

**错误示例：**

```tsx
useQueries({
  queries: taskIds.map((taskId) => ({
    queryKey: ['tasks', 'detail', taskId],
    queryFn: () => loadTask(taskId),
    placeholderData: (previousData) => previousData,
  })),
})
```

**正确写法：**

```tsx
useQuery({
  queryKey: ['tasks', 'detail', taskId],
  queryFn: () => loadTask(taskId),
  placeholderData: keepPreviousData,
})
```

**验证方式：** 同一份恒等函数分别放进 `useQuery` 和 `useQueries`。只有 `useQuery` 能在 `queryKey` 变化时留下上一份数据。
:::

## 七、源码推导与适用场景

1. **官方事实：** `initialData` 在缓存为空时预填查询，并持久写入缓存；残缺数据应改用 `placeholderData`。默认把 `initialData` 当成刚刚成功的数据，默认 `staleTime` 为 `0` 时挂载会立刻再请求。`initialDataUpdatedAt` 是这份初始数据自己的毫秒时间戳。函数形式的 `initialData` 只在初始化时执行一次。`placeholderData` 不写入缓存，观察者一开始就是 `success`，用 `isPlaceholderData` 区分。函数形式收到 `previousData` 和 `previousQuery`。`keepPreviousData` 是恒等函数。v5 已移除布尔版 `keepPreviousData`。占位期间 `dataUpdatedAt` 为 `0`。`useQueries` 拿不到上一份查询。源码里 `getDefaultState` 把 `initialData` 写入 `QueryState.data`；有数据则 `status` 为 `success`，`dataUpdatedAt` 取 `initialDataUpdatedAt` 或当前时间。观察者只在缓存为空且 `pending` 时应用 `placeholderData`，然后把观察者 `status` 设为 `success`，缓存仍为空。
2. **课程推导：** 完整、可共享的结果用 `initialData`。只想先画画面、不想污染缓存时用 `placeholderData`。需要立刻再请求就保持默认 `staleTime`；需要按真实年龄判断就补 `initialDataUpdatedAt`。切换 `queryKey` 时要留下上一份画面，给 `useQuery` 传入 `keepPreviousData`，并同时看 `isPlaceholderData`。
3. **适用边界：** 本课不把分页控件、无限查询、预取、`setQueryData`、缓存持久化、Hydration、Mutation、失效、乐观更新或 Suspense 写成主线。分页场景里的 `keepPreviousData` 只作为切换 `queryKey` 的占位用法出现，完整分页界面放到后续课程。官方文档里 placeholder 的“预填缓存”措辞以源码为准：它只作用于观察者。

## 八、练习

:::exercise
### 练习目标

**要求：** 编写 `taskDetailOptions(taskId)`，用 `queryOptions` 收纳 `queryKey` 与 `queryFn`。`queryFn` 请求 `/api/tasks/${taskId}`，非 2xx 时抛出带状态码的 `Error`。列表预览只有标题，必须放进 `placeholderData`，不能放进 `initialData`。组件使用 `useQuery`，用 `isPlaceholderData` 区分预览和完整详情。再编写 `ownerTasksOptions(owner)`，在 `queryKey` 含负责人时使用 `placeholderData: keepPreviousData`。用 `QueryClientProvider` 包裹。

**验收：** 详情查询开始后，观察者能显示标题，但 `getQueryData` 在真实请求完成前仍是 `undefined`，`isPlaceholderData` 为 `true`，`dataUpdatedAt` 为 `0`；真实请求完成后 `isPlaceholderData` 为 `false`，缓存里才有完整对象。切换负责人时，新 `queryKey` 请求期间仍显示上一份列表。不要使用布尔版 `keepPreviousData`。

**参考答案：**

```tsx
import {
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery,
} from '@tanstack/react-query'
import { useState, type ReactElement } from 'react'

type Task = {
  id: string
  title: string
  owner: string
  detail: string
}

const listPreview: Task = {
  id: 't-701',
  title: '核对初始标题',
  owner: '林晓',
  detail: '',
}

/** 读取单条任务。 */
async function loadTask(taskId: string): Promise<Task> {
  const response = await fetch(`/api/tasks/${taskId}`)
  if (!response.ok) {
    throw new Error(`任务请求失败：HTTP ${response.status}`)
  }
  return (await response.json()) as Task
}

/** 读取某个负责人的任务。 */
async function loadOwnerTasks(owner: string): Promise<Task[]> {
  const response = await fetch(`/api/tasks?owner=${owner}`)
  if (!response.ok) {
    throw new Error(`任务请求失败：HTTP ${response.status}`)
  }
  return (await response.json()) as Task[]
}

/** 把详情查询收成一份配置，预览只作为占位。 */
function taskDetailOptions(taskId: string) {
  return queryOptions({
    queryKey: ['tasks', 'detail', taskId] as const,
    queryFn: () => loadTask(taskId),
    placeholderData: listPreview,
  })
}

/** 把负责人列表收成一份配置，切换时留下上一份画面。 */
function ownerTasksOptions(owner: string) {
  return queryOptions({
    queryKey: ['tasks', 'owner', owner] as const,
    queryFn: () => loadOwnerTasks(owner),
    placeholderData: keepPreviousData,
  })
}

/** 观察占位详情和切换负责人时的上一份列表。 */
function SeedBoard({ owner }: { owner: string }): ReactElement {
  const detailQuery = useQuery(taskDetailOptions('t-701'))
  const ownerQuery = useQuery(ownerTasksOptions(owner))

  return (
    <section>
      <p>{String(detailQuery.isPlaceholderData)}</p>
      <p>{detailQuery.dataUpdatedAt}</p>
      <p>{detailQuery.data?.title}</p>
      <p>{String(ownerQuery.isPlaceholderData)}</p>
      <ul>
        {ownerQuery.data?.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </section>
  )
}

/** 提供稳定客户端，避免种子观察丢失。 */
export function App(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())
  const [owner] = useState('林晓')
  return (
    <QueryClientProvider client={queryClient}>
      <SeedBoard owner={owner} />
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- `initialData` 写入缓存，适合完整结果；残缺预览改用 `placeholderData`。
- 占位让观察者进入 `success`，用 `isPlaceholderData` 区分真实数据。
- 默认把 `initialData` 当成刚刚成功的数据；要按真实年龄判断就写 `initialDataUpdatedAt`。
- `keepPreviousData` 是 `placeholderData` 的恒等函数，用来在 `queryKey` 变化时留下上一份画面。
- 本课只讲种子与占位，不展开分页界面、预取或写入。

## 十、参考资料

- [Initial Query Data](https://tanstack.com/query/latest/docs/framework/react/guides/initial-query-data) - 支持 initialData 写入缓存、新鲜度与 initialDataUpdatedAt。
- [Placeholder Query Data](https://tanstack.com/query/latest/docs/framework/react/guides/placeholder-query-data) - 支持占位不进缓存、isPlaceholderData 与函数形式。
- [keepPreviousData](https://tanstack.com/query/latest/docs/framework/react/reference/functions/keepPreviousData) - 支持作为 placeholderData 的恒等函数。
- [Migrating to TanStack Query v5](https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5) - 支持移除布尔版 keepPreviousData，以及占位期间的 success 与 dataUpdatedAt。
- [Query initialData 源码](https://unpkg.com/@tanstack/query-core@5.102.8/src/query.ts) - 支持初始数据写入 QueryState。
- [QueryObserver placeholderData 源码](https://unpkg.com/@tanstack/query-core@5.102.8/src/queryObserver.ts) - 支持占位只作用于观察者。
- [keepPreviousData 源码](https://unpkg.com/@tanstack/query-core@5.102.8/src/utils.ts) - 支持 keepPreviousData 只返回 previousData。
