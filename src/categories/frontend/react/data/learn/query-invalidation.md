---
id: react.data.learn.intermediate.query-invalidation
type: lesson
title: 查询失效
summary: 用 invalidateQueries 把已知过期的查询标成 stale，按前缀或精确匹配触发重新获取，并在 mutation 成功后作废相关查询。
domain: frontend
technology: react
module: data
stage: intermediate
level: intermediate
estimatedMinutes: 45
prerequisites:
  - react.data.learn.intermediate.query-key-organization
  - react.data.learn.intermediate.mutation-lifecycle
related:
  - react.data.learn.basics.query-client-and-provider
  - react.data.learn.basics.stale-time-and-freshness
  - react.data.learn.intermediate.use-mutation
tags:
  - TanStack Query
  - 查询失效
  - invalidateQueries
  - queryKey
  - exact
  - refetchType
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-10
objectives:
  - 能说明用户已经改过服务端数据时，不能再等 staleTime 到期，要用 invalidateQueries 主动作废。
  - 能说明作废会把匹配到的查询标成 stale，这份标记会盖过原来的 staleTime；正在显示的查询默认会后台重新获取。
  - 能按 queryKey 前缀作废一棵资源树，用更具体的 key 或 exact 收窄范围。
  - 能在 useMutation 的 onSuccess 里 await invalidateQueries，让重新获取结束前 mutation 仍保持 pending。
  - 能用 refetchType 为 none 只标 stale、不立刻重新获取。
recap:
  - 知道数据已经过期时，调用 queryClient.invalidateQueries，不要干等 staleTime。
  - 作废先打上 isInvalidated，正在渲染的查询默认会后台重新获取；缓存条目还在。
  - 较短的 queryKey 按前缀匹配；更长的 key 不会回过头打更短的 key；exact 只打完整相同的那一条。
  - mutation 成功后在 onSuccess 里 await 作废，isPending 会等到重新获取结束。
  - refetchType 为 none 时只标 stale，不调用重新获取。
sources:
  - title: Query Invalidation
    url: https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 已经知道查询数据过期时，不必再等它自己变 stale，可以用 QueryClient.invalidateQueries。
      - 不传过滤器时，作废缓存里的每一条查询。
      - 传入 queryKey 时，作废所有以该数组为前缀的查询。
      - 作废后查询被标成 stale，这份状态会盖过 useQuery 上的 staleTime。
      - 如果这条查询正通过 useQuery 或相关 hook 渲染，还会在后台重新获取。
      - 较短的 queryKey 能匹配所有以它为前缀的查询。
      - 更具体的 queryKey 只匹配带有相同后续项的查询，不会回过头匹配更短的 key。
      - exact 为 true 时，根 key 不会匹配带筛选对象的子 key。
  - title: Invalidations from Mutations
    url: https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - mutation 成功后，相关查询通常需要被作废，并可能重新获取，才能看到这次写入。
      - 可以在 useMutation 的 onSuccess 里调用 queryClient.invalidateQueries。
      - 可以同时作废多棵 queryKey，并用 Promise.all 等待。
      - 在 onSuccess 里返回 Promise，能让数据更新完成前 mutation 仍视为未结束，isPending 保持为 true。
  - title: QueryClient
    url: https://tanstack.com/query/latest/docs/reference/QueryClient
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - invalidateQueries 把匹配到的查询标成 invalidated，条目仍留在缓存里，不像 removeQueries 那样删掉。
      - 除非 refetchType 为 none，否则接着用 refetchQueries 重新获取。
      - 重新获取用的 type 依次取 refetchType、filters.type，缺省为 active。
  - title: Filters
    url: https://tanstack.com/query/latest/docs/framework/react/guides/filters
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - queryKey 过滤器默认按前缀包容匹配。
      - exact 为 true 时只返回与传入 queryKey 完全相同的那一条。
  - title: QueryClient source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/queryClient.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - invalidateQueries 先对匹配到的查询调用 invalidate。
      - refetchType 为 none 时直接返回，不再 refetchQueries。
      - 否则把 type 设成 refetchType、filters.type 或 active，再 refetchQueries。
  - title: Query source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/query.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - invalidate 会把 isInvalidated 设为 true。
      - isStaleByTime 在 isInvalidated 为 true 时直接视为 stale。
      - 成功写入新 data 时，successState 会把 isInvalidated 设回 false。
---

# 查询失效

## 一、学习目标

- 说明用户已经改过服务端数据时，不能再等 `staleTime` 到期，要用 `invalidateQueries` 主动作废。
- 说明作废会把匹配到的查询标成 stale，这份标记会盖过原来的 `staleTime`；正在显示的查询默认会后台重新获取。
- 按 `queryKey` 前缀作废一棵资源树，用更具体的 key 或 `exact` 收窄范围。
- 在 `useMutation` 的 `onSuccess` 里 `await invalidateQueries`，让重新获取结束前 mutation 仍保持 `pending`。
- 用 `refetchType: 'none'` 只标 stale、不立刻重新获取。

## 二、为什么需要主动作废

`staleTime` 回答的是“这份数据还能不能先用着”。林晓刚创建了一条任务，服务端已经变了，缓存里的列表却还是创建前的那一份。这时不是时间到了才过期，而是这次写入已经证明它过期。

官方的做法不是去维护一份规范化缓存、手工改每一条列表。它让你按 `queryKey` 作废相关查询，把它们标成 stale，正在显示的再后台拉一次。

`useMutation` 负责写入。写入成功后，用 `queryClient.invalidateQueries` 告诉读这一棵树的查询：现在该重新要了。

## 三、核心概念

### 1. 作废会做什么

`queryClient.invalidateQueries(filters)` 对匹配到的查询做两件事：

1. 标成 stale。这份标记会盖过 `useQuery` 上的 `staleTime`。
2. 如果这条查询正通过 `useQuery` 或相关 hook 渲染，默认再后台重新获取。

作废不是删除。条目仍在 `QueryCache` 里，现有 `data` 还可以先显示。源码里 `invalidate()` 只把 `isInvalidated` 设为 `true`；`isStaleByTime` 看到这个标记就视为 stale。重新获取成功后，`successState` 会把 `isInvalidated` 设回 `false`。

不传过滤器时，作废缓存里的每一条查询：

```tsx
queryClient.invalidateQueries()
```

### 2. 前缀匹配和精确匹配

`queryKey` 默认按前缀包容匹配。较短的数组能打到所有以它开头的查询：

```tsx
queryClient.invalidateQueries({ queryKey: ['tasks'] })
```

`['tasks']` 和 `['tasks', { owner: '林晓' }]` 都会被作废。`['reminders']` 不会，因为它不是这棵树。

更具体的 key 只打带有相同后续项的查询，不会回过头打更短的 key：

```tsx
queryClient.invalidateQueries({
  queryKey: ['tasks', { owner: '林晓' }],
})
```

这里会打到林晓那条，不会打到光秃秃的 `['tasks']`。

只想打完整相同的那一条时，打开 `exact`：

```tsx
queryClient.invalidateQueries({
  queryKey: ['tasks'],
  exact: true,
})
```

这时 `['tasks']` 会被作废，`['tasks', { owner: '林晓' }]` 不会。

### 3. mutation 成功后再作废

创建任务成功后，列表和按负责人筛选的列表通常都过期了。把作废写在钩子级 `onSuccess` 里：

```tsx
const queryClient = useQueryClient()

const createMutation = useMutation({
  mutationFn: createTask,
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ['tasks'] })
  },
})
```

官方强调：`onSuccess` 返回 Promise 时，数据更新完成前 mutation 仍视为未结束，`isPending` 保持为 `true`。需要同时作废两棵树时，用 `Promise.all`：

```tsx
onSuccess: async () => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['tasks'] }),
    queryClient.invalidateQueries({ queryKey: ['reminders'] }),
  ])
}
```

作废可以挂在 mutation 生命周期里任意回调上。本课主线用成功后的 `onSuccess`。

### 4. 只标 stale，不立刻重新获取

`invalidateQueries` 默认会按 `active` 重新获取正在显示的查询。不想立刻请求时，传入 `refetchType: 'none'`：

```tsx
await queryClient.invalidateQueries({
  queryKey: ['tasks'],
  refetchType: 'none',
})
```

源码里这时只调用 `invalidate()`，不再走 `refetchQueries`。查询已经 stale，但次数不会马上增加。官方 Reference 写明：重新获取用的 type 依次取 `refetchType`、`filters.type`，缺省为 `active`。

## 四、用法与示例

### 1. 按前缀作废正在显示的列表

```tsx
import { useQuery, useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()

useQuery({
  queryKey: ['tasks'],
  queryFn: loadTasks,
})

useQuery({
  queryKey: ['tasks', { owner: '林晓' }],
  queryFn: loadOwnerTasks,
})

<button
  type="button"
  onClick={() => {
    void queryClient.invalidateQueries({ queryKey: ['tasks'] })
  }}
>
  作废任务前缀
</button>
```

点下去之后，两份任务查询都会被标成 stale，并在后台重新获取。提醒如果用 `['reminders']`，不会被这次前缀打到。

### 2. 创建成功后作废任务树

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()

const createMutation = useMutation({
  mutationFn: async (title: string) => {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    if (!response.ok) {
      throw new Error(`任务创建失败：HTTP ${response.status}`)
    }
    return (await response.json()) as { id: string; title: string; owner: string }
  },
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ['tasks'] })
  },
})
```

`mutationFn` 只负责写入。列表要看到林晓那条新任务，靠作废后的重新获取，而不是在回调里改缓存。

### 3. 精确作废和只标 stale

```tsx
await queryClient.invalidateQueries({
  queryKey: ['tasks'],
  exact: true,
})

await queryClient.invalidateQueries({
  queryKey: ['tasks'],
  refetchType: 'none',
})
```

第一条只打 `['tasks']`。第二条把匹配到的查询标成 stale，但不发出这一轮重新获取。

## 五、用法示例：对照前缀、精确匹配和创建后作废

下面的 Demo 同时挂着 `['tasks']`、`['tasks', { owner: '林晓' }]` 和 `['reminders']`。三份查询都把 `staleTime` 设成 `Infinity`，没有作废时不会自己变 stale。

「创建任务」成功后，钩子级 `onSuccess` 会 `await` 作废 `['tasks']` 前缀，全部任务和林晓的任务都会重新获取，列表里出现核对创建任务 / 林晓；提醒次数不变。「作废任务前缀」打两份任务查询；「精确作废全部任务」只打 `['tasks']`；「作废但不重新获取」让任务查询变成 stale，次数不增加。「作废全部查询」三份都会重新获取。离开页面会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.intermediate.query-invalidation.query-invalidation-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：写入成功后不作废相关查询

**触发条件：** `useMutation` 只调用 `mutate`，界面继续读创建前的列表缓存。

**原因：** mutation 默认不会改查询缓存。`staleTime` 为 `Infinity` 或窗口还没重新可见时，列表不会自己去拉。

**后果：** 服务端已经有林晓的新任务，画面上还是旧列表。

**错误示例：**

```tsx
const createMutation = useMutation({
  mutationFn: createTask,
})
```

**正确写法：**

```tsx
const createMutation = useMutation({
  mutationFn: createTask,
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ['tasks'] })
  },
})
```

**验证方式：** 创建成功后看全部任务列表。正确写法会出现核对创建任务 / 林晓，请求次数增加；错误写法列表不变。

### 错误：用详情 key 去作废整棵列表树

**触发条件：** 写成 `invalidateQueries({ queryKey: ['tasks', { owner: '林晓' }] })`，以为全部任务列表也会更新。

**原因：** 更具体的 key 不会回过头匹配更短的 key。`['tasks', { owner: '林晓' }]` 打不到 `['tasks']`。

**后果：** 林晓那条筛选更新了，全部任务列表仍是旧数据。

**错误示例：**

```tsx
await queryClient.invalidateQueries({
  queryKey: ['tasks', { owner: '林晓' }],
})
```

**正确写法：**

```tsx
await queryClient.invalidateQueries({
  queryKey: ['tasks'],
})
```

**验证方式：** 只作废林晓那条后，林晓任务次数增加，全部任务次数不变。改成前缀后两份都会增加。

### 错误：精确匹配时以为子 key 也会被打到

**触发条件：** 传入 `{ queryKey: ['tasks'], exact: true }`，期望 `['tasks', { owner: '林晓' }]` 一起重新获取。

**原因：** `exact: true` 只命中完整相同的那一条。

**后果：** 根列表更新了，带筛选的列表仍显示创建前的数据。

**错误示例：**

```tsx
await queryClient.invalidateQueries({
  queryKey: ['tasks'],
  exact: true,
})
```

**正确写法：**

```tsx
await queryClient.invalidateQueries({
  queryKey: ['tasks'],
})
```

**验证方式：** 精确作废后，全部任务次数增加，林晓任务次数不变。去掉 `exact` 后两份都会增加。

### 错误：onSuccess 里不 await 作废

**触发条件：** 写成 `onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }) }`，不返回 Promise。

**原因：** 官方用 `await invalidateQueries` 保证重新获取结束前 mutation 仍是 `pending`。不返回 Promise 时，`onSuccess` 会马上结束。

**后果：** 按钮已经恢复可点，列表却还在后台拉；连续点击会叠在过期画面上。

**错误示例：**

```tsx
useMutation({
  mutationFn: createTask,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
  },
})
```

**正确写法：**

```tsx
useMutation({
  mutationFn: createTask,
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ['tasks'] })
  },
})
```

**验证方式：** 点创建后看 mutation 的 `status`。正确写法会等到任务列表重新出现才回到 `success`。

### 错误：把作废当成删除缓存

**触发条件：** 以为 `invalidateQueries` 会清掉 `data`，界面先闪成空白再加载。

**原因：** 作废只打 stale 标记。和 `removeQueries` 不同，条目还在缓存里，现有 `data` 继续显示，重新获取是后台进行的。

**后果：** 为了“先空白再出现”去拆掉列表，或误用删除缓存的 API。

**错误示例：**

```tsx
queryClient.removeQueries({ queryKey: ['tasks'] })
```

**正确写法：**

```tsx
await queryClient.invalidateQueries({ queryKey: ['tasks'] })
```

**验证方式：** 作废前缀后，列表在重新获取期间仍能看到旧任务，次数增加后换成包含林晓新任务的列表，不会先变成“无数据”。
:::

## 七、源码推导与适用场景

1. **官方事实：** 已经知道数据过期时用 `invalidateQueries`。不传过滤器作废全部查询；传入 `queryKey` 按前缀匹配。作废后查询被标成 stale，这份状态盖过 `staleTime`；正在通过 `useQuery` 渲染的查询默认后台重新获取。更具体的 key 不会回过头匹配更短的 key；`exact: true` 只打完整相同的那一条。mutation 成功后可在 `onSuccess` 里作废，返回 Promise 时 `isPending` 等到重新获取结束。`invalidateQueries` 不会像 `removeQueries` 那样删掉条目。`refetchType` 为 `none` 时不重新获取；否则用 `refetchType`、`filters.type` 或 `active`。源码先 `invalidate()` 把 `isInvalidated` 设为 `true`，`isStaleByTime` 因此视为 stale；成功写入新 data 时清掉这个标记。
2. **课程推导：** 写入成功后按资源树的根前缀作废，让列表和筛选一起更新。只想打一条时再加 `exact`。需要按钮等到画面跟上这次写入时，在 `onSuccess` 里 `await`。只想标记过期、把真正的请求留到下次挂载或焦点时，用 `refetchType: 'none'`。
3. **适用边界：** 本课不把 `setQueryData`、用 mutation 返回值直接改缓存、完整乐观更新与回滚、`removeQueries`、`resetQueries`、`predicate` 过滤器、无限查询或持久化写成主线。官方示例里的 axios 可换成 `fetch`。

## 八、练习

:::exercise
### 练习目标

**要求：** 在 `QueryClientProvider` 下同时声明 `queryKey` 为 `['tasks']` 和 `['tasks', { owner: '林晓' }]` 的 `useQuery`，以及 `['reminders']`。`staleTime` 设为 `Infinity`，`retry` 为 `false`。提供按钮调用 `invalidateQueries({ queryKey: ['tasks'] })`、`invalidateQueries({ queryKey: ['tasks'], exact: true })` 和 `invalidateQueries({ queryKey: ['tasks'], refetchType: 'none' })`。再用 `useMutation` 创建任务，在钩子级 `onSuccess` 里 `await queryClient.invalidateQueries({ queryKey: ['tasks'] })`。不要用 `setQueryData` 改列表。

**验收：** 前缀作废后两份任务查询都会重新获取，提醒不会。精确作废只让 `['tasks']` 重新获取。`refetchType: 'none'` 后任务查询为 stale，但不会立刻增加请求次数。创建成功后任务列表出现新任务，提醒列表不变。`onSuccess` 返回的 Promise 结束前 mutation 保持 `pending`。

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

/** 读取林晓的任务。 */
async function loadOwnerTasks(): Promise<TaskItem[]> {
  const response = await fetch('/api/tasks?owner=林晓')
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem[]
}

/** 读取提醒。 */
async function loadReminders(): Promise<TaskItem[]> {
  const response = await fetch('/api/reminders')
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem[]
}

/** 创建一条任务。 */
async function createTask(): Promise<TaskItem> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '核对创建任务' }),
  })
  if (!response.ok) {
    throw new Error(`任务创建失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

/** 观察作废范围和创建后的重新获取。 */
function TaskBoard(): ReactElement {
  const queryClient = useQueryClient()

  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: loadTasks,
    staleTime: Infinity,
    retry: false,
  })

  const ownerQuery = useQuery({
    queryKey: ['tasks', { owner: '林晓' }],
    queryFn: loadOwnerTasks,
    staleTime: Infinity,
    retry: false,
  })

  const remindersQuery = useQuery({
    queryKey: ['reminders'],
    queryFn: loadReminders,
    staleTime: Infinity,
    retry: false,
  })

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  return (
    <section>
      <p>{String(tasksQuery.isStale)}</p>
      <p>{String(ownerQuery.isStale)}</p>
      <p>{String(remindersQuery.isStale)}</p>
      {tasksQuery.isSuccess ? <p>{tasksQuery.data.map((task) => task.title).join('，')}</p> : null}
      <button type="button" onClick={() => createMutation.mutate()}>
        创建任务
      </button>
      <button
        type="button"
        onClick={() => {
          void queryClient.invalidateQueries({ queryKey: ['tasks'] })
        }}
      >
        作废任务前缀
      </button>
      <button
        type="button"
        onClick={() => {
          void queryClient.invalidateQueries({ queryKey: ['tasks'], exact: true })
        }}
      >
        精确作废
      </button>
      <button
        type="button"
        onClick={() => {
          void queryClient.invalidateQueries({ queryKey: ['tasks'], refetchType: 'none' })
        }}
      >
        只标 stale
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

- 知道数据已经过期时，调用 `invalidateQueries`，不要干等 `staleTime`。
- 作废会打上 stale 标记并默认重新获取正在显示的查询；缓存条目还在。
- 较短的 `queryKey` 按前缀匹配；更长的 key 不会回过头打更短的 key；`exact` 只打完整相同的那一条。
- mutation 成功后在 `onSuccess` 里 `await` 作废，`isPending` 会等到重新获取结束。
- `refetchType` 为 `none` 时只标 stale，不发出这一轮请求。

## 十、参考资料

- [Query Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation) - 支持作废标记 stale、前缀匹配、更具体的 key 不会回打，以及 exact。
- [Invalidations from Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations) - 支持 mutation 成功后作废，以及 onSuccess 返回 Promise 时保持 pending。
- [QueryClient](https://tanstack.com/query/latest/docs/reference/QueryClient) - 支持作废不删除缓存，以及 refetchType 为 none 时不重新获取。
- [Filters](https://tanstack.com/query/latest/docs/framework/react/guides/filters) - 支持 queryKey 默认前缀匹配和 exact。
- [QueryClient 源码](https://unpkg.com/@tanstack/query-core@5.102.8/src/queryClient.ts) - 支持先 invalidate，再按 refetchType 决定是否 refetchQueries。
- [Query 源码](https://unpkg.com/@tanstack/query-core@5.102.8/src/query.ts) - 支持 isInvalidated 让查询视为 stale，以及成功后清掉该标记。
