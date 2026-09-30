---
id: react.data.learn.basics.background-refetching
type: lesson
title: 后台重新获取
summary: 配置查询在页面重新可见、网络恢复和组件重新挂载时的后台刷新，并在刷新期间保留已有数据。
domain: frontend
technology: react
module: data
stage: basics
level: beginner
estimatedMinutes: 45
prerequisites:
  - react.data.learn.basics.stale-time-and-freshness
related:
  - react.data.learn.basics.query-status
tags:
  - TanStack Query
  - background-refetching
  - refetchOnWindowFocus
  - refetchOnReconnect
  - refetchOnMount
  - isRefetching
appliesTo: TanStack Query 5.102.8、React 19.2.8
verifiedAt: 2026-08-31
objectives:
  - 说明后台重新获取与首次加载的区别，并在已有数据时保留可读内容。
  - 解释 refetchOnMount、refetchOnWindowFocus 和 refetchOnReconnect 的默认触发条件。
  - 使用 isFetching 和 isRefetching 展示轻量的后台更新状态。
  - 为单个查询选择关闭、按 stale 触发或 always 触发的自动重新获取策略。
  - 识别窗口焦点、网络恢复和重新挂载触发器的适用边界。
recap:
  - 后台重新获取发生在已有数据仍可读时，isRefetching 等于 isFetching && !isPending。
  - 默认的挂载、窗口重新可见和网络重连重新获取都只针对 stale 查询。
  - refetchOnMount、refetchOnWindowFocus 和 refetchOnReconnect 可以按查询设置，也可以放在 QueryClient 默认配置中。
  - fresh 数据不会因为普通自动触发器重复请求；always 会改变这个判断，应谨慎使用。
  - 后台请求期间保留 data，首次没有数据时才使用完整加载占位。
sources:
  - title: useQuery Reference
    url: https://tanstack.com/query/latest/docs/framework/react/reference/useQuery
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - refetchOnMount、refetchOnWindowFocus 和 refetchOnReconnect 默认按 stale 条件重新获取。
      - 三个选项支持 false、true、always 或根据 Query 计算的函数。
      - isFetching 覆盖首次请求和后台重新获取，isRefetching 只覆盖已有数据时的请求。
  - title: Background Fetching Indicators
    url: https://tanstack.com/query/latest/docs/framework/react/guides/background-fetching-indicators
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - status 为 pending 适合表示首次硬加载，isFetching 可表示包含后台请求在内的执行活动。
      - useIsFetching 可以统计应用中正在请求的查询数量。
  - title: Window Focus Refetching
    url: https://tanstack.com/query/latest/docs/framework/react/guides/window-focus-refetching
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 用户离开应用后返回时，stale 查询默认会在后台请求新数据。
      - 可以在全局或单个查询关闭 refetchOnWindowFocus，也可以配置 focusManager 的事件监听。
  - title: OnlineManager Reference
    url: https://tanstack.com/query/latest/docs/reference/onlineManager
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - onlineManager 默认监听浏览器 online 和 offline 事件。
      - onlineManager.setOnline 可以手动设置在线状态，供适配自定义网络事件。
  - title: Query observer refetch trigger source
    url: https://raw.githubusercontent.com/TanStack/query/1566c16de7efeb22739209e07310661d91954a78/packages/query-core/src/queryObserver.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - shouldFetchOn 会在查询启用、不是 static staleTime 且选项允许时按 isStale 决定是否获取。
      - shouldFetchOnMount 会把已有数据的挂载重新获取交给 refetchOnMount。
  - title: Query focus and online trigger source
    url: https://raw.githubusercontent.com/TanStack/query/1566c16de7efeb22739209e07310661d91954a78/packages/query-core/src/query.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - Query 在焦点或在线状态变化时选择允许该触发器的观察者并调用 refetch。

---

# 后台重新获取

## 一、学习目标

- 说明后台重新获取与首次加载的区别，并在已有数据时保留可读内容。
- 解释 `refetchOnMount`、`refetchOnWindowFocus` 和 `refetchOnReconnect` 的默认触发条件。
- 使用 `isFetching` 和 `isRefetching` 展示轻量的后台更新状态。
- 为单个查询选择关闭、按 stale 触发或 `always` 触发的自动重新获取策略。
- 识别窗口焦点、网络恢复和重新挂载触发器的适用边界。

## 二、为什么需要后台重新获取

用户切换到另一个标签页、暂时失去网络，或离开一个页面后再次进入时，屏幕上的数据可能已经过时。每个
组件都手动监听这些事件，会把相同的生命周期代码散落在应用中，也容易忘记保留已经显示的内容。

TanStack Query 把这些事件接到查询观察者上：当查询已经有数据且被视为 `stale` 时，库可以在后台启动一次
请求。用户继续看到旧结果，应用同时取得新结果。这样“可读性”和“新鲜度”是两个并行的界面信号，而不是
在刷新期间把页面退回首次加载。

## 三、核心概念

### 1. 首次加载与后台重新获取

首次加载时，查询还没有成功数据，常见组合是 `status: 'pending'` 与 `fetchStatus: 'fetching'`。这时可以
显示完整的加载占位，因为页面没有内容可保留。

后台重新获取时，查询已经有成功数据，常见组合是 `status: 'success'` 与 `fetchStatus: 'fetching'`。此时
`isFetching` 和 `isRefetching` 为 `true`，但 `data` 仍然是上一份成功结果。列表、标题或表单摘要应继续渲染，
只在附近增加“正在更新”之类的轻量提示。

```tsx
const taskQuery = useQuery({
  queryKey: ['tasks'],
  queryFn: loadTasks,
})

if (taskQuery.isPending) {
  return <p>首次加载中</p>
}

if (taskQuery.isError) {
  return <p role="alert">{taskQuery.error.message}</p>
}

return (
  <section>
    {taskQuery.isRefetching && <small>正在后台更新</small>}
    <TaskList tasks={taskQuery.data} />
  </section>
)
```

`isLoading` 只代表首次没有数据时的请求，不能代替后台更新指示。需要跨多个查询显示一个应用级计数时，
可以在共同布局中使用 `useIsFetching`；单个页面通常直接使用当前查询的 `isFetching` 或 `isRefetching`。

### 2. 三个自动重新获取选项

`useQuery` 提供三个与页面生命周期相关的选项：

| 选项 | 触发时机 | 默认判断 |
| --- | --- | --- |
| `refetchOnMount` | 观察组件挂载或重新挂载 | 数据 stale 时重新获取 |
| `refetchOnWindowFocus` | 页面从隐藏状态回到可见 | 数据 stale 时重新获取 |
| `refetchOnReconnect` | 浏览器从离线回到在线 | 数据 stale 时重新获取 |

三个选项都可以写在单个 `useQuery` 中，也可以写入 `QueryClient` 的 `defaultOptions.queries`。在默认
`networkMode` 下，默认值为 `true`；但 `true` 的含义是“触发事件发生且数据 stale 时重新获取”，不是“每次
事件都请求”。当 `networkMode: 'always'` 且没有显式设置 `refetchOnReconnect` 时，重连触发器默认关闭。

```tsx
const reportQuery = useQuery({
  queryKey: ['reports', teamId],
  queryFn: () => loadReports(teamId),
  refetchOnMount: true,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
})
```

应用也可以设置共同默认值，再让特定查询覆盖它：

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

const liveSummaryQuery = useQuery({
  queryKey: ['live-summary'],
  queryFn: loadLiveSummary,
  refetchOnWindowFocus: true,
})
```

### 3. 按 stale 条件还是 always

`true` 表示“只在 stale 时触发”，`false` 表示禁用该自动触发器，`'always'` 表示事件发生时总是重新获取，
即使当前数据仍是 fresh。`'always'` 仍受 `staleTime: 'static'` 的特殊规则限制，本课不把它作为常规数据策略。

```tsx
const releaseNotesQuery = useQuery({
  queryKey: ['release-notes'],
  queryFn: loadReleaseNotes,
  staleTime: 60_000,
  refetchOnWindowFocus: 'always',
})
```

`always` 适合确实要在每次回到页面时确认服务端变化的少数场景。多数列表使用按 stale 触发更容易控制请求量，
并且仍能在 stale 后自动得到更新。

### 4. 窗口可见与网络恢复

在浏览器中，窗口重新可见由 TanStack Query 的 focus manager 处理；当前版本默认监听 `visibilitychange`。
当页面从隐藏回到可见时，库会检查观察者的 `refetchOnWindowFocus` 和 `isStale`，符合条件才发起后台请求。

网络恢复由 online manager 处理，默认监听 `online` 和 `offline` 事件。连接恢复后，符合
`refetchOnReconnect` 且已经 stale 的查询会重新获取。React Native 或其他宿主没有浏览器事件时，应把宿主网络
状态适配到 `onlineManager.setOnline`，而不是假设 `window` 事件存在。

### 5. 重新挂载与观察者

当一个查询观察组件卸载后再次挂载，`refetchOnMount` 决定是否检查 stale 并重新获取。它针对的是“观察者再次
加入缓存”这一时机，不是每次 React 重渲染。只要组件仍然挂载，普通重渲染不会因为这个选项重复请求。

```tsx
function ProfilePanel() {
  const profileQuery = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => loadProfile(userId),
    refetchOnMount: true,
  })

  // 先处理首次状态和错误，再继续展示已有资料。
  if (profileQuery.isPending) return <p>首次加载中</p>
  if (profileQuery.isError && !profileQuery.data) return <p role="alert">读取失败</p>

  return (
    <section>
      {profileQuery.isRefetching && <small>正在重新获取</small>}
      <p>{profileQuery.data?.name}</p>
    </section>
  )
}
```

## 四、用法与示例

### 1. 保留旧数据的列表状态

后台请求期间，渲染条件应该首先区分“没有数据”和“已有数据”。如果已经有数据，就继续渲染列表；如果需要
额外反馈，再根据 `isRefetching` 添加局部提示或禁用重复触发按钮。

```tsx
function Inbox() {
  const inboxQuery = useQuery({
    queryKey: ['inbox'],
    queryFn: loadInbox,
    staleTime: 30_000,
  })

  if (inboxQuery.isPending) return <InboxSkeleton />
  if (inboxQuery.isError && !inboxQuery.data) {
    return <ErrorMessage error={inboxQuery.error} />
  }

  return (
    <section aria-busy={inboxQuery.isFetching}>
      {inboxQuery.isRefetching && <p role="status">正在同步收件箱</p>}
      <InboxList messages={inboxQuery.data ?? []} />
    </section>
  )
}
```

`aria-busy` 可以表达区域正在更新，但不要因为它为 `true` 就卸载列表。后台请求失败时，也可以保留上一份数据，
再用 `isRefetchError` 或错误提示告诉用户本次更新没有成功；重试策略不属于本课范围。

### 2. 全局默认值与局部例外

应用可以为大多数查询使用统一策略，减少每个组件的重复配置：

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
  },
})
```

对于编辑器草稿、仅由用户明确动作更新的快照，可以在局部关闭某个触发器；对于必须回到页面就校验的摘要，
可以单独选择 `'always'`。全局关闭后，局部查询仍可显式打开，但应在团队约定中说明这类例外，避免用户以为
所有页面都自动同步。

### 3. 用回调按查询决定策略

三个选项也可以接收查询对象并动态返回 `boolean | 'always'`。例如只让高优先级的查询在回到窗口时总是检查：

```tsx
const query = useQuery({
  queryKey: ['workspace-summary'],
  queryFn: loadWorkspaceSummary,
  refetchOnWindowFocus: (currentQuery) =>
    currentQuery.state.data?.priority === 'high' ? 'always' : true,
})
```

回调应保持简单，并且只根据当前查询能够稳定得到的条件判断。复杂权限、网络策略或业务事件编排应放到更高
层的数据层，而不是在每次焦点事件中执行昂贵逻辑。

### 4. 手动事件与自动事件的边界

自动重新获取适合处理用户看不见的生命周期变化；“刷新资料”按钮是用户明确要求立即同步的动作，应调用
`refetch`，不必先等待数据变 stale。两者可以同时存在，但按钮应在 `isFetching` 时避免重复点击，并继续展示已有
结果。查询失效与写操作后的缓存协调属于后续课程，当前只关注生命周期触发器。

## 五、用法示例：观察后台重新获取

下面的 Demo 首先读取一个本地延迟快照。成功后可以分别模拟窗口重新可见、网络恢复和观察组件重新挂载，并切换
三个对应的查询选项。每次触发都让服务端版本递增；请求期间旧版本仍显示，`isRefetching` 标记后台执行状态。

:::demo{id="react.data.learn.basics.background-refetching.background-refetching-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：用 isFetching 替换已有数据

**触发条件：** 只要 `isFetching` 为 `true` 就返回完整加载占位。

**原因：** `isFetching` 同时覆盖首次请求和已有数据时的后台请求，不能单独说明页面是否有可读数据。

**后果：** 用户每次切回标签页都会看到列表闪烁或暂时消失。

**错误示例：**

```tsx
if (query.isFetching) return <FullPageSpinner />
return <TaskList tasks={query.data} />
```

**正确写法：**

```tsx
if (query.isPending) return <FullPageSpinner />
if (query.isError && !query.data) return <ErrorMessage error={query.error} />

return (
  <section>
    {query.isRefetching && <small>正在后台更新</small>}
    <TaskList tasks={query.data ?? []} />
  </section>
)
```

**验证方式：** 在首次查询成功后触发窗口重新可见，确认旧任务仍显示并同时出现后台更新提示。

### 错误：把 isLoading 当成后台更新指示

**触发条件：** 用 `isLoading` 控制所有查询活动的顶部指示器。

**原因：** `isLoading` 等于 `isPending && isFetching`，已有数据时的重新获取不会满足 `isPending`。

**后果：** 首次加载有提示，后台同步却没有任何反馈。

**错误示例：**

```tsx
return <HeaderIndicator active={query.isLoading} />
```

**正确写法：**

```tsx
return <HeaderIndicator active={query.isFetching} />
```

**验证方式：** 分别观察首次读取和成功后的后台读取，确认两次 `isFetching` 都为 `true`，但只有首次读取的
`isLoading` 为 `true`。

### 错误：把 true 误解为每次事件都请求

**触发条件：** 给 fresh 查询设置 `refetchOnWindowFocus: true`，却期待每次回到窗口都发起请求。

**原因：** `true` 的默认语义是“窗口事件发生且数据 stale 时重新获取”；fresh 数据会继续复用缓存。

**后果：** 误以为自动刷新失效，或为了达到预期而随意改成更激进的策略。

**错误示例：**

```tsx
const query = useQuery({
  queryKey: ['profile'],
  queryFn: loadProfile,
  staleTime: 60_000,
  refetchOnWindowFocus: true,
})
```

**正确写法：**

```tsx
const query = useQuery({
  queryKey: ['profile'],
  queryFn: loadProfile,
  staleTime: 60_000,
  refetchOnWindowFocus: 'always',
})
```

**验证方式：** 在 fresh 窗口内分别触发一次可见事件；按 stale 策略不应增加请求次数，`always` 才会增加请求。

### 错误：在所有查询上使用 always

**触发条件：** 为方便“保持最新”而全局设置 `refetchOnWindowFocus: 'always'`。

**原因：** `always` 跳过 stale 判断，用户频繁切换标签页就会让每个活动查询都请求。

**后果：** 请求量、服务端压力和页面更新频率不可控，低变化数据也反复传输。

**错误示例：**

```tsx
const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: 'always' } },
})
```

**正确写法：**

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 30_000,
    },
  },
})
```

**验证方式：** 在开发者工具中切换窗口多次，比较按 stale 与 `always` 两种配置的请求数量，再根据业务实时性选型。

### 错误：把重新挂载误当成普通重渲染

**触发条件：** 看到组件重新渲染就认为 `refetchOnMount` 应该再次请求，或为了避免重渲染而关闭它。

**原因：** `refetchOnMount` 只在观察者真正挂载时检查 stale；React 的普通状态更新不会触发挂载生命周期。

**后果：** 组件切换回来时数据可能保持过旧，或者开发者为解决不存在的请求重复而破坏自动同步。

**错误示例：**

```tsx
function Panel({ visible }: { visible: boolean }) {
  const query = useQuery({
    queryKey: ['panel'],
    queryFn: loadPanel,
    refetchOnMount: false,
  })
  return visible ? <PanelBody data={query.data} /> : null
}
```

**正确写法：**

```tsx
/** 挂载后观察面板查询。 */
function MountedPanel() {
  const query = useQuery({
    queryKey: ['panel'],
    queryFn: loadPanel,
    refetchOnMount: true,
  })
  return <PanelBody data={query.data} />
}

/** 通过子组件的存在与否控制真正的挂载和卸载。 */
function Panel({ visible }: { visible: boolean }) {
  return visible ? <MountedPanel /> : null
}
```

**验证方式：** 先完成查询，再真正卸载并重新挂载观察组件；确认 stale 数据会重新获取，而只更新父组件状态不会增加请求。
:::

## 七、源码推导与适用场景

1. **官方事实：** TanStack Query 5.102.8 的 `QueryObserver` 会在挂载时通过 `shouldFetchOnMount` 检查已有
   数据，并在 `shouldFetchOn` 中先确认查询启用、`staleTime` 不是 `'static'`，再根据选项值或 `isStale` 决定是否
   获取。`Query` 收到 focus 或 online 事件时，会挑选允许对应触发器的观察者并调用 `refetch`。这些是当前版本
   的源码行为，不是让应用直接依赖内部函数。
2. **课程推导：** 只要把“是否有数据”和“是否正在请求”分开，后台请求期间就可以稳定保留旧结果；自动触发器
   负责生命周期同步，`refetch` 负责用户明确动作，二者各自表达一种意图。
3. **适用边界：** 浏览器默认使用可见性与在线事件；移动端和自定义宿主需要适配 focus manager 或 online manager。
   自动重新获取不等于实时推送，也不替代轮询、WebSocket、写操作后的失效和重试策略；这些能力在后续课程分别讨论。

## 八、练习

:::exercise
### 练习目标

**要求：** 为任务列表配置 30 秒 `staleTime`、窗口重新可见和网络恢复时按 stale 自动重新获取。首次没有数据时显示
加载状态；已有任务时保留列表，并在 `isRefetching` 为 `true` 时显示“正在后台更新”。

**验收：** 首次请求完成后能看到任务；在 fresh 窗口内触发窗口事件不会重复请求；超过窗口后触发窗口事件会保留旧任务并
显示更新提示；更新成功后列表内容保持完整。

**参考答案：**

```tsx
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import type { ReactElement } from 'react'

type Task = { id: string; title: string }

/** 请求任务列表并检查 HTTP 响应。 */
async function loadTasks(): Promise<Task[]> {
  const response = await fetch('/api/tasks')
  if (!response.ok) throw new Error(`请求失败：${response.status}`)
  return response.json() as Promise<Task[]>
}

/** 渲染保留旧数据的任务列表和后台更新提示。 */
function TaskList(): ReactElement {
  const query = useQuery({
    queryKey: ['tasks'],
    queryFn: loadTasks,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  if (query.isPending) return <p>首次加载中</p>
  if (query.isError && !query.data) return <p role="alert">{query.error.message}</p>

  return (
    <section aria-busy={query.isFetching}>
      {query.isRefetching && <p role="status">正在后台更新</p>}
      <ul>
        {(query.data ?? []).map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </section>
  )
}

const queryClient = new QueryClient()

/** 提供 QueryClient 并挂载任务列表。 */
export function App(): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <TaskList />
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- 后台重新获取表示已有数据仍在显示，同时 `queryFn` 在后台执行；`isRefetching` 用于表示这一阶段。
- `refetchOnMount`、`refetchOnWindowFocus` 和 `refetchOnReconnect` 默认只为 stale 查询触发。
- `true`、`false` 和 `'always'` 分别表达按 stale 自动同步、关闭触发器和跳过 stale 判断。
- 首次加载使用 `isPending`，后台更新保留 `data`，不要用完整占位清空页面。
- 窗口可见、网络在线和观察者挂载是生命周期触发器，不是实时推送或写操作失效机制。

## 十、参考资料

- [useQuery Reference](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery) - 定义三个自动重新获取选项及 `isFetching`、`isRefetching`。
- [Background Fetching Indicators](https://tanstack.com/query/latest/docs/framework/react/guides/background-fetching-indicators) - 说明首次加载与后台请求指示器的区别。
- [Window Focus Refetching](https://tanstack.com/query/latest/docs/framework/react/guides/window-focus-refetching) - 说明页面重新可见时的默认行为与 focus manager。
- [OnlineManager Reference](https://tanstack.com/query/latest/docs/reference/onlineManager) - 说明浏览器在线事件与自定义在线状态适配。
- [Query observer refetch trigger source](https://raw.githubusercontent.com/TanStack/query/1566c16de7efeb22739209e07310661d91954a78/packages/query-core/src/queryObserver.ts) - 固定版本的挂载与 stale 判断源码。
- [Query focus and online trigger source](https://raw.githubusercontent.com/TanStack/query/1566c16de7efeb22739209e07310661d91954a78/packages/query-core/src/query.ts) - 固定版本的 focus/online 触发源码。
