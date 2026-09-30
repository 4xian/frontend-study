---
id: react.data.learn.basics.stale-time-and-freshness
type: lesson
title: staleTime 与数据新鲜度
summary: 使用 staleTime 判断查询数据何时仍可复用，以及如何区分 stale、缓存数据和正在请求。
domain: frontend
technology: react
module: data
stage: basics
level: beginner
estimatedMinutes: 45
prerequisites:
  - react.data.learn.basics.query-cache-and-sharing
related:
  - react.data.learn.basics.query-status
tags:
  - TanStack Query
  - staleTime
  - isStale
  - dataUpdatedAt
  - freshness
appliesTo: TanStack Query 5.102.8、React 19.2.8
verifiedAt: 2026-08-31
objectives:
  - 解释 fresh 与 stale 的含义，并说明 stale 不等于缓存被删除。
  - 使用数字型 staleTime 设置数据可被视为 fresh 的时间窗口。
  - 读取 isStale 与 dataUpdatedAt，向用户展示数据的新鲜度。
  - 选择 0、有限毫秒数或 Infinity，并说明各自的适用边界。
  - 通过手动 refetch 观察成功数据和 dataUpdatedAt 如何更新。
recap:
  - staleTime 的单位是毫秒，默认值为 0；成功数据默认很快被视为 stale。
  - stale 数据仍然存在于 QueryCache 中，isFetching 才表示是否正在请求。
  - dataUpdatedAt 是最近一次成功数据的时间戳，可与当前时间计算数据年龄。
  - staleTime 只决定新鲜度，不阻止手动 refetch；refetch 成功会重新开始时间窗口。
  - Infinity 让数据在手动失效前不会因时间变 stale，应只用于确实不会自动变化的数据。
sources:
  - title: useQuery Reference
    url: https://tanstack.com/query/latest/docs/framework/react/reference/useQuery
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - staleTime 的默认值为 0，数字单位为毫秒。
      - staleTime 只作用于定义它的 useQuery 观察者。
      - dataUpdatedAt 表示最近一次成功返回数据的时间戳。
      - 数据被失效或超过 staleTime 后，isStale 为 true。
      - refetch 可由调用方手动触发查询。
  - title: Important Defaults
    url: https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 查询数据默认立即被视为 stale，可用 staleTime 调整时间窗口。
      - staleTime 为 Infinity 时，数据不会因时间流逝变 stale。
  - title: Query core isStaleByTime source
    url: https://raw.githubusercontent.com/TanStack/query/1566c16de7efeb22739209e07310661d91954a78/packages/query-core/src/query.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 查询没有数据或已失效时按时间判断为 stale，否则比较 dataUpdatedAt 与 staleTime。
  - title: Query observer stale timer source
    url: https://raw.githubusercontent.com/TanStack/query/1566c16de7efeb22739209e07310661d91954a78/packages/query-core/src/queryObserver.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 观察者会在有限 staleTime 到期后更新 isStale 结果。
---

# staleTime 与数据新鲜度

## 一、学习目标

- 解释 fresh 与 stale 的含义，并说明 stale 不等于缓存被删除。
- 使用数字型 `staleTime` 设置数据可被视为 fresh 的时间窗口。
- 读取 `isStale` 与 `dataUpdatedAt`，向用户展示数据的新鲜度。
- 选择 `0`、有限毫秒数或 `Infinity`，并说明各自的适用边界。
- 通过手动 `refetch` 观察成功数据和 `dataUpdatedAt` 如何更新。

## 二、为什么需要数据新鲜度

查询成功后，页面通常还会继续显示这份数据一段时间。此时需要回答两个不同的问题：缓存里有没有数据，
以及这份数据是否仍在允许复用的时间窗口内。只检查缓存是否存在，会把很旧的数据误当成最新数据；每次
渲染都重新请求，又会浪费请求和渲染资源。

`staleTime` 为第二个问题提供了明确的策略。它不负责删除数据，也不决定所有后台请求何时发生，而是告诉
当前查询观察者：从最近一次成功更新开始，多久可以把数据视为 fresh。

## 三、核心概念

### 1. fresh 与 stale

`fresh` 表示数据还在 `staleTime` 规定的时间窗口内；`stale` 表示数据已经被失效，或年龄达到窗口边界。
默认 `staleTime` 是 `0` 毫秒，所以成功结果默认不会拥有一个延长的新鲜窗口。

`stale` 不等于数据不存在。只要查询还在 `QueryCache` 中，`data` 仍可能可读；`isStale` 只描述新鲜度，
`isFetching` 才描述当前是否有请求正在执行。

### 2. staleTime 的值与单位

数字型 `staleTime` 的单位是毫秒：

```tsx
useQuery({
  queryKey: ['profile', userId],
  queryFn: () => loadProfile(userId),
  staleTime: 5 * 1000,
})
```

上例让当前观察者把成功数据视为 fresh 约 5 秒。`staleTime: 0` 使用默认行为，`staleTime: 30_000` 表示
30 秒，`staleTime: Infinity` 表示不会仅因为时间流逝变 stale。

### 3. isStale 与 dataUpdatedAt

`dataUpdatedAt` 是最近一次成功数据的时间戳，单位也是毫秒。可以用它计算年龄，并把年龄和 `isStale` 同时
展示给用户：

```tsx
/** 根据查询时间戳计算数据年龄。 */
function getAgeInSeconds(dataUpdatedAt: number): number {
  if (dataUpdatedAt === 0) return 0
  return Math.floor((Date.now() - dataUpdatedAt) / 1000)
}

const profileQuery = useQuery({
  queryKey: ['profile', userId],
  queryFn: () => loadProfile(userId),
  staleTime: 5_000,
})

if (profileQuery.isSuccess) {
  return <p>{profileQuery.isStale ? '数据已 stale' : '数据仍 fresh'}（{getAgeInSeconds(profileQuery.dataUpdatedAt)} 秒前更新）</p>
}
```

时间戳适合解释“上次成功更新是什么时候”；不要把它当成服务器的业务时间，也不要用它替代接口返回的
领域字段。

### 4. staleTime 属于观察者配置

`staleTime` 只作用于定义它的 `useQuery` 观察者。同一个 `QueryClient` 中的观察者可以对同一缓存数据采用
不同的窗口，因此组件显示的 `isStale` 可能不同。缓存身份仍由 `queryKey` 决定，数据本身不会被复制成多份。

## 四、用法与示例

### 1. 为不同数据选择窗口

经常变化的数据可以使用较短窗口，不常变化的数据可以使用较长窗口：

```tsx
/** 读取实时性要求较高的通知。 */
function Notifications() {
  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: loadNotifications,
    staleTime: 5_000,
  })

  return <NotificationList query={notificationsQuery} />
}

/** 读取内容很少变化的国家列表。 */
function Countries() {
  const countriesQuery = useQuery({
    queryKey: ['countries'],
    queryFn: loadCountries,
    staleTime: 60 * 60 * 1000,
  })

  return <CountrySelect query={countriesQuery} />
}
```

窗口应该表达业务对“允许复用旧数据”的容忍度，而不是为了隐藏加载状态随意设大。

### 2. 手动 refetch 不受 fresh 阻止

`staleTime` 是新鲜度策略，不是请求锁。用户明确点击“刷新”时，可以直接调用 `refetch`；成功后新的
`dataUpdatedAt` 会重新开始新鲜窗口：

```tsx
/** 显示资料并提供明确的手动刷新动作。 */
function ProfileCard({ userId }: { userId: string }) {
  const profileQuery = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => loadProfile(userId),
    staleTime: 30_000,
  })

  return (
    <section>
      <button type="button" onClick={() => void profileQuery.refetch()}>
        刷新资料
      </button>
      {profileQuery.isSuccess && <p>{profileQuery.data.name}</p>}
    </section>
  )
}
```

按钮动作应同时处理 `isFetching` 和已有 `data`，这样刷新期间可以继续显示旧结果，并把执行状态传达给用户。

### 3. Infinity 的边界

`Infinity` 适合版本固定、由部署或显式操作更新的参考数据。它不是“永远正确”的证明；如果服务器数据会
变化，就需要选择有限窗口，或在业务写入后显式失效/刷新。`'static'` 是比 `Infinity` 更严格的特殊能力，
本课只把它作为边界名词，不将其作为常规示例。

## 五、用法示例：观察 staleTime

下面的 Demo 允许先选择一个窗口，再启动本地延迟查询。读取成功后可以观察 `isStale`、最近更新时间、数据
年龄、请求次数和数据版本：`0ms` 会立即 stale，`5 秒` 会在窗口到期后 stale，`Infinity` 不会因时间流逝
stale。数据变 stale 后仍会继续显示；点击手动重新获取会产生新版本并重新开始窗口。

:::demo{id="react.data.learn.basics.stale-time-and-freshness.stale-time-and-freshness-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：把 stale 当成缓存已删除

**触发条件：** `isStale` 为 `true` 时清空页面上的 `data`。

**原因：** stale 只表示新鲜窗口已结束，缓存数据仍可能存在并且可以在新请求期间展示。

**后果：** 用户在刷新期间看到不必要的空白，界面从有数据跳回加载态。

**错误示例：**

```tsx
const query = useQuery({ queryKey: ['profile'], queryFn: loadProfile })
return query.isStale ? <p>加载中</p> : <p>{query.data?.name}</p>
```

**正确写法：**

```tsx
const query = useQuery({ queryKey: ['profile'], queryFn: loadProfile })

if (query.isPending) return <p>首次加载中</p>
if (query.isError) return <p role="alert">{query.error.message}</p>

return (
  <p>
    {query.data.name}
    {query.isStale && '（数据可能需要刷新）'}
  </p>
)
```

**验证方式：** 在已有数据变 stale 后触发刷新，确认旧数据仍显示且页面没有回到首次加载态。

### 错误：把秒数直接写进 staleTime

**触发条件：** 目标是 5 秒，却写成 `staleTime: 5`。

**原因：** 数字型 `staleTime` 使用毫秒，不是秒。

**后果：** 数据约 5 毫秒就 stale，用户看到的行为像是默认值。

**错误示例：**

```tsx
useQuery({ queryKey: ['settings'], queryFn: loadSettings, staleTime: 5 })
```

**正确写法：**

```tsx
useQuery({
  queryKey: ['settings'],
  queryFn: loadSettings,
  staleTime: 5 * 1000,
})
```

**验证方式：** 用浏览器计时或 Demo 的年龄读数确认 fresh 窗口接近 5 秒，而不是 5 毫秒。

### 错误：用 isStale 代替 isFetching

**触发条件：** 看到 stale 就显示“请求中”，或看到 fresh 就认为没有请求。

**原因：** 新鲜度和请求执行状态是两个独立维度。

**后果：** stale 数据会被误报为正在请求，手动刷新时也无法准确表达 fetching 状态。

**错误示例：**

```tsx
const query = useQuery({ queryKey: ['tasks'], queryFn: loadTasks })
return <p>{query.isStale ? '请求中' : '请求已结束'}</p>
```

**正确写法：**

```tsx
const query = useQuery({ queryKey: ['tasks'], queryFn: loadTasks })
return <p>{query.isFetching ? '请求中' : query.isStale ? '数据已 stale' : '数据 fresh'}</p>
```

**验证方式：** 在有数据时点击手动刷新，确认请求期间 `isFetching` 为真，而 `data` 仍可读取。

### 错误：把 Infinity 当成所有查询的默认答案

**触发条件：** 为了减少请求，把会变化的业务数据统一设置为 `staleTime: Infinity`。

**原因：** Infinity 只禁止因时间流逝变 stale，不会让服务器数据自动保持正确。

**后果：** 用户长时间看到旧数据，除非其他代码显式失效或手动刷新。

**错误示例：**

```tsx
useQuery({ queryKey: ['orders'], queryFn: loadOrders, staleTime: Infinity })
```

**正确写法：**

```tsx
useQuery({ queryKey: ['orders'], queryFn: loadOrders, staleTime: 30_000 })
```

**验证方式：** 让服务端数据在窗口外变化，确认有限 staleTime 能将观察结果标记为 stale，并安排后续刷新策略。

### 错误：认为 fresh 会阻止手动 refetch

**触发条件：** 因为 `isStale` 为假就禁用明确的“刷新”按钮。

**原因：** staleTime 只用于新鲜度判断，`refetch` 是调用方主动要求的请求。

**后果：** 用户无法在发现外部变化后立即获取最新结果。

**错误示例：**

```tsx
const query = useQuery({ queryKey: ['profile'], queryFn: loadProfile, staleTime: 60_000 })
return <button disabled={!query.isStale}>刷新</button>
```

**正确写法：**

```tsx
const query = useQuery({ queryKey: ['profile'], queryFn: loadProfile, staleTime: 60_000 })
return <button disabled={query.isFetching} onClick={() => void query.refetch()}>刷新</button>
```

**验证方式：** 在 fresh 窗口内点击按钮，确认仍会发起请求，并在成功后更新 `dataUpdatedAt`。
:::

## 七、源码推导与适用场景

1. **官方事实：** TanStack Query 5.102.8 的 `Query.isStaleByTime` 先把没有数据的查询视为 stale，再处理
   `'static'` 和失效状态，最后用 `dataUpdatedAt` 与 `staleTime` 的剩余时间判断。`QueryObserver` 会为有限
   的 staleTime 安排计时器，在到期时更新观察结果。
2. **课程推导：** 因此组件应把 `isStale` 当成“是否可以继续把结果视为新鲜”的信号，把 `isFetching` 当成
   “是否正在请求”的信号；展示旧数据和刷新指示可以同时成立。手动 `refetch` 适合用户明确要求立即同步的场景。
3. **适用边界：** 这些是当前版本实现与公共结果字段的一致行为，不应把内部计时器当成应用接口。焦点、挂载、
   重连等自动重新获取触发条件属于其他主题；查询失效、`gcTime`、持久化和 SSR 也不在本课展开。

## 八、练习

:::exercise
### 练习目标

**要求：** 为用户资料查询设置 30 秒 `staleTime`，显示首次加载、错误、姓名、新鲜度和最近更新时间，并让
   “刷新资料”按钮在数据 fresh 时也能手动请求。

**验收：** 首次加载完成后显示姓名和更新时间；30 秒内显示 fresh；点击刷新时保留姓名并显示 fetching，
   请求成功后更新时间变化且新鲜窗口重新开始。

**参考答案：**

```tsx
import type { ReactElement } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'

type Profile = { name: string }

/** 请求用户资料并检查 HTTP 响应。 */
async function loadProfile(): Promise<Profile> {
  const response = await fetch('https://jsonplaceholder.typicode.com/users/1')
  if (!response.ok) throw new Error(`请求失败：${response.status}`)
  return response.json() as Promise<Profile>
}

/** 渲染带新鲜度和手动刷新的资料卡片。 */
function ProfileCard(): ReactElement {
  const query = useQuery({
    queryKey: ['profile', 1],
    queryFn: loadProfile,
    staleTime: 30_000,
  })

  if (query.isPending) return <p>首次加载中</p>
  if (query.isError) return <p role="alert">{query.error.message}</p>

  return (
    <section>
      <button type="button" disabled={query.isFetching} onClick={() => void query.refetch()}>
        {query.isFetching ? '刷新中' : '刷新资料'}
      </button>
      <p>{query.data.name}</p>
      <p>{query.isStale ? '数据已 stale' : '数据仍 fresh'}</p>
      <p>最近更新：{new Date(query.dataUpdatedAt).toLocaleTimeString()}</p>
    </section>
  )
}

const queryClient = new QueryClient()

/** 提供 QueryClient 并挂载资料卡片。 */
export function App(): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <ProfileCard />
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- `staleTime` 用毫秒定义 fresh 窗口，默认是 `0`。
- `isStale` 说明新鲜度，`isFetching` 说明请求状态；stale 数据不等于已删除。
- `dataUpdatedAt` 是最近一次成功更新的时间，可用来展示数据年龄。
- `Infinity` 只适合时间上不需要自动过期的数据；明确刷新仍可调用 `refetch`。

## 十、参考资料

- [useQuery Reference](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery) - 支持 staleTime、isStale、dataUpdatedAt 和 refetch 的公共字段与默认值。
- [Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults) - 说明默认 stale 行为与 Infinity 的边界。
- [Query core isStaleByTime source](https://raw.githubusercontent.com/TanStack/query/1566c16de7efeb22739209e07310661d91954a78/packages/query-core/src/query.ts) - 固定版本时间判断实现，用于源码推导。
- [Query observer stale timer source](https://raw.githubusercontent.com/TanStack/query/1566c16de7efeb22739209e07310661d91954a78/packages/query-core/src/queryObserver.ts) - 固定版本观察者到期更新实现，用于源码推导。
