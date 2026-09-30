---
id: react.data.learn.advanced.concurrent-mutation-state
type: lesson
title: 并发 Mutation 状态
summary: 默认多次 mutate 并行执行；观察者只跟最后一次，进行中的全部写入要用 useIsMutating 和 useMutationState 读取。
domain: frontend
technology: react
module: data
stage: advanced
level: advanced
estimatedMinutes: 45
prerequisites:
  - react.data.learn.intermediate.use-mutation
  - react.data.learn.intermediate.mutation-lifecycle
related:
  - react.data.learn.intermediate.optimistic-updates
  - react.data.learn.intermediate.data-hooks-and-module-organization
tags:
  - TanStack Query
  - 并发 Mutation
  - useIsMutating
  - useMutationState
  - mutationKey
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-11
objectives:
  - 能说明默认多次 mutate 会并行执行，即使来自同一个 useMutation。
  - 能说明观察者每次 mutate 会改订新的 Mutation，isPending 和 data 只反映最后一次。
  - 能用 useIsMutating 按 mutationKey 统计正在 pending 的条数。
  - 能用 useMutationState 选出进行中的 variables，列出每一笔写入。
  - 能说明 mutationFn 异步时完成顺序不一定等于调用顺序。
recap:
  - 默认所有 mutation 并行，同一 hook 连续 mutate 也不会互相等待。
  - 观察者只绑定最后一次 Mutation，isPending 和 data 不代表缓存里的全部进行中写入。
  - useIsMutating 返回当前 pending 条数，适合做全局指示。
  - useMutationState 按过滤器选出 MutationCache 里的状态，select 可取出 variables。
  - 本课不把 scope 串行队列或离线持久化写成主线。
sources:
  - title: Mutations
    url: https://tanstack.com/query/latest/docs/framework/react/guides/mutations
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 默认所有 mutation 并行，即使对同一个 mutation 多次调用 mutate。
      - mutationFn 通常是异步的，完成顺序可能和 mutate 调用顺序不同。
      - 连续 mutate 时，传给 mutate 的回调只跟最后一次绑定。
  - title: useIsMutating
    url: https://tanstack.com/query/latest/docs/framework/react/reference/useIsMutating
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - useIsMutating 返回应用里当前 pending 的 mutation 条数。
      - 可以用 MutationFilters 按 mutationKey 收窄。
  - title: useMutationState
    url: https://tanstack.com/query/latest/docs/framework/react/reference/useMutationState
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - useMutationState 能访问 MutationCache 里的全部 mutation。
      - 可用 filters 收窄，用 select 变换每条 mutation 的状态。
      - 进行中的 variables 是数组，因为同一时间可能有多笔 mutation。
  - title: Optimistic Updates
    url: https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 其他组件可通过 useMutationState 读取 mutation，最好配合 mutationKey。
      - pending 过滤器选出的 variables 是数组，因为可能同时有多笔写入。
  - title: useMutationState source
    url: https://unpkg.com/@tanstack/react-query@5.102.8/src/useMutationState.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - useIsMutating 内部调用 useMutationState，并把 status 固定为 pending。
      - useMutationState 订阅 MutationCache，对 findAll 的结果做 select。
  - title: MutationObserver source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/mutationObserver.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - mutate 会让观察者离开当前 Mutation，再 build 一条新的并绑定上去。
---

# 并发 Mutation 状态

## 一、学习目标

- 说明默认多次 `mutate` 会并行执行，即使来自同一个 `useMutation`。
- 说明观察者每次 `mutate` 会改订新的 Mutation，`isPending` 和 `data` 只反映最后一次。
- 用 `useIsMutating` 按 `mutationKey` 统计正在 pending 的条数。
- 用 `useMutationState` 选出进行中的 `variables`，列出每一笔写入。
- 说明 `mutationFn` 异步时完成顺序不一定等于调用顺序。

## 二、为什么观察者对不上进行中的写入

`useMutation` 返回的 `isPending` 描述的是当前观察者绑定的那一条 Mutation。连续点两次创建时，默认两笔请求会一起跑。观察者却已经改订到第二次。

这时界面如果只看 `taskMutation.isPending`，会以为只有一笔。真正还在跑的林晓那次，已经不在这个观察者上了。要数全部进行中的写入，得问 `MutationCache`。

本课不把 `scope` 串行队列、离线持久化或乐观更新写成主线。

## 三、核心概念

### 1. 默认并行

官方写明：默认所有 mutation 并行，即使对同一个 mutation 多次调用 `mutate`。第一次创建林晓、立刻再创建周宁，两笔 `mutationFn` 会重叠。

`mutationFn` 通常是异步的。哪一笔先结束，不一定等于谁先被点。

### 2. 观察者只跟最后一次

源码里每次 `mutate` 都会：

1. 让观察者离开当前 Mutation。
2. 在 `MutationCache` 里 `build` 一条新的。
3. 把观察者绑到新的这一条上。

所以 `isPending`、`data`、`variables` 都只反映最后一次。第一次不会被取消，它继续在缓存里跑，只是这个 hook 不再订阅它。

传给 `mutate` 的 `onSuccess` 也只跟最后一次绑定。钩子级 `onSuccess` 则每一笔都会跑。

### 3. useIsMutating 数 pending

```tsx
const pendingCount = useIsMutating({ mutationKey: ['tasks', 'create'] })
```

它返回当前 pending 的条数。源码里就是 `useMutationState`，并把 `status` 固定成 `'pending'`。按 `mutationKey` 过滤后，只数这一类写入。

### 4. useMutationState 列出每一笔

```tsx
const pendingTitles = useMutationState({
  filters: { mutationKey: ['tasks', 'create'], status: 'pending' },
  select: (mutation) => mutation.state.variables?.title,
})
```

`pendingTitles` 是数组。两次创建重叠时，里面会有现有任务和第二页任务。`select` 作用在每条 Mutation 上，不是作用在查询 `data` 上。

## 四、用法与示例

### 1. 抽出带 mutationKey 的配置

```tsx
const createTaskOptions = mutationOptions({
  mutationKey: ['tasks', 'create'],
  mutationFn: createTask,
  retry: false,
})
```

没有 `mutationKey`，`useIsMutating` 和 `useMutationState` 就没法按这一类写入过滤。

### 2. 连续 mutate 后对照两种状态

```tsx
function TaskBoard() {
  const taskMutation = useMutation(createTaskOptions)
  const pendingCount = useIsMutating({ mutationKey: ['tasks', 'create'] })
  const pendingTitles = useMutationState({
    filters: { mutationKey: ['tasks', 'create'], status: 'pending' },
    select: (mutation) =>
      (mutation.state.variables as CreateTaskInput | undefined)?.title ?? '无',
  })

  return (
    <section>
      <p>{pendingCount}</p>
      <p>{taskMutation.isPending ? '是' : '否'}</p>
      <p>{pendingTitles.join('、') || '无'}</p>
      <button type="button" onClick={() => taskMutation.mutate(linTask)}>
        创建林晓
      </button>
      <button type="button" onClick={() => taskMutation.mutate(zhouTask)}>
        创建周宁
      </button>
    </section>
  )
}
```

先点「创建林晓」，`pendingCount` 为 1，观察者 `isPending` 为是，进行中标题是现有任务。立刻再点「创建周宁」，`pendingCount` 为 2，进行中标题同时有现有任务和第二页任务，观察者仍然只显示最后一次。

两笔都结束后，观察者 `data` 是第二页任务 / 周宁，因为最后一次绑定的是周宁。

## 五、用法示例：两次创建重叠

下面的 Demo 使用同一份 `mutationOptions`。点「创建林晓」后再点「创建周宁」，进行中条数变成 2，进行中标题列出现有任务和第二页任务。观察者等待中仍是是，但结果要等最后一次结束才变成第二页任务 / 周宁。离开页面会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.advanced.concurrent-mutation-state.concurrent-mutation-state-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：用 isPending 判断还有没有写入在跑

**触发条件：** 连续两次 `mutate` 后，用 `taskMutation.isPending` 决定要不要禁用整页。

**原因：** 观察者已经改订到第二次。第一次仍可能 pending，但不在这个结果里。

**后果：** 以为只有一笔，全局指示和按钮状态都不对。

**错误示例：**

```tsx
<button type="button" disabled={taskMutation.isPending}>
  创建周宁
</button>
```

**正确写法：**

```tsx
const pendingCount = useIsMutating({ mutationKey: ['tasks', 'create'] })
<button type="button" disabled={pendingCount > 0}>
  创建周宁
</button>
```

**验证方式：** 先创建林晓再立刻创建周宁，`pendingCount` 为 2，观察者 `isPending` 不能代表条数。

### 错误：以为第二次 mutate 会取消第一次

**触发条件：** 连续点击创建，以为旧请求会被新的顶掉。

**原因：** 默认并行。观察者离开旧 Mutation，并不等于取消它。

**后果：** 两笔都会完成，服务端可能写入两次。

**错误示例：**

```tsx
taskMutation.mutate(linTask)
taskMutation.mutate(zhouTask)
```

**正确写法：**

```tsx
taskMutation.mutate(linTask)
taskMutation.mutate(zhouTask)
const pendingCount = useIsMutating({ mutationKey: ['tasks', 'create'] })
```

**验证方式：** 两次点击后进行中条数为 2，两笔标题都在进行中标题里。

### 错误：没有 mutationKey 就去读 MutationCache

**触发条件：** `useMutation({ mutationFn: createTask })`，再 `useMutationState({ filters: { status: 'pending' } })`。

**原因：** 没有 key 时，过滤器会看到应用里所有 pending mutation。

**后果：** 别的写入也会混进这个列表。

**错误示例：**

```tsx
useMutation({ mutationFn: createTask, retry: false })
useMutationState({
  filters: { status: 'pending' },
  select: (mutation) => mutation.state.variables,
})
```

**正确写法：**

```tsx
const createTaskOptions = mutationOptions({
  mutationKey: ['tasks', 'create'],
  mutationFn: createTask,
  retry: false,
})
useMutationState({
  filters: { mutationKey: ['tasks', 'create'], status: 'pending' },
  select: (mutation) => mutation.state.variables,
})
```

**验证方式：** 只有创建任务这类写入会出现在进行中标题里。

### 错误：把 useMutationState 的结果当成单条对象

**触发条件：** `const pending = useMutationState(...)[0]`，界面只渲染这一条。

**原因：** 官方明确 variables 是数组，因为同一时间可能有多笔。

**后果：** 第二笔被丢掉，并发指示不完整。

**错误示例：**

```tsx
const pendingTitles = useMutationState({
  filters: { mutationKey: ['tasks', 'create'], status: 'pending' },
  select: (mutation) => mutation.state.variables?.title,
})
return <p>{pendingTitles[0]}</p>
```

**正确写法：**

```tsx
return <p>{pendingTitles.join('、') || '无'}</p>
```

**验证方式：** 两次创建重叠时，进行中标题同时包含现有任务和第二页任务。

### 错误：用 scope 代替读取并发状态

**触发条件：** 给 mutation 加 `scope: { id: 'todo' }`，想让界面只显示一笔 pending。

**原因：** `scope` 会把相同 id 的 mutation 排成串行队列，改变执行模型。本课要观察的是默认并行。

**后果：** 第二次会先 `isPaused`，不再和第一次重叠，并发状态也看不出来。

**错误示例：**

```tsx
useMutation({
  ...createTaskOptions,
  scope: { id: 'todo' },
})
```

**正确写法：**

```tsx
useMutation(createTaskOptions)
```

**验证方式：** 两次创建后进行中条数为 2，而不是第二次先暂停。
:::

## 七、源码推导与适用场景

1. **官方事实：** 默认 mutation 并行。`MutationObserver.mutate` 会解绑当前 Mutation 再 build 新的。`useIsMutating` 是 `status: 'pending'` 的 `useMutationState`。`useMutationState` 订阅 `MutationCache.findAll`。
2. **课程推导：** 连续创建林晓和周宁时，缓存里有两笔 pending；观察者只显示周宁那次。结束后观察者 `data` 是第二页任务 / 周宁。
3. **适用边界：** 本课不把 `scope` 串行队列、离线 `resumePausedMutations` 或跨组件乐观更新写成主线。

## 八、练习

:::exercise
### 练习目标

**要求：** 抽出 `createTaskOptions`，`mutationKey` 为 `['tasks', 'create']`。组件用 `useMutation` 触发写入。用 `useIsMutating` 统计 pending 条数。用 `useMutationState` 选出 pending 的 `title`。`mutationFn` 调 `fetch`，非 2xx 时抛出带状态码的 `Error`。`retry` 为 `false`。

**验收：** 连续触发林晓和周宁两次创建后，pending 条数为 2，进行中标题同时包含现有任务和第二页任务。观察者 `data` 在两笔都结束后是第二页任务 / 周宁。

**参考答案：**

```tsx
import {
  QueryClient,
  QueryClientProvider,
  mutationOptions,
  useIsMutating,
  useMutation,
  useMutationState,
} from '@tanstack/react-query'
import { useState, type ReactElement } from 'react'

type TaskItem = {
  id: string
  title: string
  owner: string
}

type CreateTaskInput = {
  id: string
  title: string
  owner: string
}

/** 创建任务。 */
async function createTask(input: CreateTaskInput): Promise<TaskItem> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(`创建失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

const createTaskOptions = mutationOptions({
  mutationKey: ['tasks', 'create'],
  mutationFn: createTask,
  retry: false,
})

const linTask: CreateTaskInput = {
  id: 't-1',
  title: '现有任务',
  owner: '林晓',
}

const zhouTask: CreateTaskInput = {
  id: 't-2',
  title: '第二页任务',
  owner: '周宁',
}

/** 对照观察者和 MutationCache 里的并发状态。 */
function TaskBoard(): ReactElement {
  const taskMutation = useMutation(createTaskOptions)
  const pendingCount = useIsMutating({ mutationKey: ['tasks', 'create'] })
  const pendingTitles = useMutationState({
    filters: { mutationKey: ['tasks', 'create'], status: 'pending' },
    select: (mutation) =>
      (mutation.state.variables as CreateTaskInput | undefined)?.title ?? '无',
  })

  return (
    <section>
      <p>{pendingCount}</p>
      <p>{pendingTitles.join('、') || '无'}</p>
      {taskMutation.isSuccess && (
        <p>
          {taskMutation.data.title} / {taskMutation.data.owner}
        </p>
      )}
      <button type="button" onClick={() => taskMutation.mutate(linTask)}>
        创建林晓
      </button>
      <button type="button" onClick={() => taskMutation.mutate(zhouTask)}>
        创建周宁
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

- 默认多次 `mutate` 并行，不会互相取消。
- 观察者只跟最后一次，`isPending` 不能代表全部进行中写入。
- `useIsMutating` 按 `mutationKey` 统计 pending 条数。
- `useMutationState` 列出每一笔进行中的 `variables`。
- 本课不展开 `scope` 串行队列。

## 十、参考资料

- [Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations) - 支持默认并行，以及异步 mutationFn 的完成顺序不一定等于调用顺序。
- [useIsMutating](https://tanstack.com/query/latest/docs/framework/react/reference/useIsMutating) - 支持按过滤器统计当前 pending 的 mutation 条数。
- [useMutationState](https://tanstack.com/query/latest/docs/framework/react/reference/useMutationState) - 支持从 MutationCache 读取多笔 mutation 状态。
- [Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates) - 支持 pending variables 是数组，因为可能同时有多笔写入。
- [useMutationState source](https://unpkg.com/@tanstack/react-query@5.102.8/src/useMutationState.ts) - 支持 useIsMutating 固定过滤 pending。
- [MutationObserver source](https://unpkg.com/@tanstack/query-core@5.102.8/src/mutationObserver.ts) - 支持每次 mutate 改订到新的 Mutation。
