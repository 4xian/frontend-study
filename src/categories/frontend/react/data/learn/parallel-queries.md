---
id: react.data.learn.intermediate.parallel-queries
type: lesson
title: 并行查询
summary: 互不依赖的查询并排启动，数量固定用多个 useQuery，数量会变时改用 useQueries。
domain: frontend
technology: react
module: data
stage: intermediate
level: intermediate
estimatedMinutes: 45
prerequisites:
  - react.data.learn.intermediate.dependent-queries
related:
  - react.data.learn.intermediate.dependent-queries
  - react.data.learn.intermediate.query-options-reuse
  - react.data.learn.basics.query-status
  - react.data.learn.basics.first-use-query
tags:
  - TanStack Query
  - parallel queries
  - 并行查询
  - useQueries
  - useQuery
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-10
objectives:
  - 能说明互不依赖的查询应同时启动，而不是等前一条成功再声明后一条。
  - 能在数量固定时并排放多个 useQuery。
  - 能在数量随渲染变化时改用 useQueries，避免违反 Hooks 规则。
  - 能用 queryOptions 生成 useQueries 的每一项，而不是在数组里手写散开的 key。
  - 能对照各条查询自己的 fetchStatus，确认它们可以同时 fetching。
recap:
  - 并行查询是互不依赖的查询同时执行，用来提高并发。
  - 数量固定时直接并排多个 useQuery，不需要额外 API。
  - 数量会随渲染变化时必须用 useQueries，不能按条件增减 useQuery 调用次数。
  - useQueries 接收带 queries 数组的对象，返回与输入顺序对应的结果数组。
  - 本课只讲并行读取，不展开 Suspense、combine 主线或写入。
sources:
  - title: Parallel Queries
    url: https://tanstack.com/query/latest/docs/framework/react/guides/parallel-queries
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 并行查询是同时执行的查询，用来提高获取并发。
      - 数量不变时并排使用 useQuery 即可并行。
      - 数量随渲染变化时不能手写可变数量的 Hook，应使用 useQueries。
      - useQueries 接收带 queries 键的对象，值是查询选项数组，返回结果数组。
      - Suspense 模式下并排 useSuspenseQuery 会串行，应改用 useSuspenseQueries。
  - title: useQueries Reference
    url: https://tanstack.com/query/latest/docs/framework/react/reference/functions/useQueries
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - useQueries 用来获取数量会变的一组查询。
      - queries 数组里的选项大体与 useQuery 相同。
      - 同一 queryKey 出现多次可能导致数据共享，应先去重。
      - 没有 combine 时返回与输入顺序相同的结果数组。
      - 内联 select 在 useQueries 里无法从同对象的 queryFn 推断 data。
      - 应先用 queryOptions 解析类型，再交给 useQueries。
      - useQueries 的 placeholderData 拿不到上一次查询信息，previousData 与 previousQuery 均为 undefined。
  - title: Performance & Request Waterfalls
    url: https://tanstack.com/query/latest/docs/framework/react/guides/request-waterfalls
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 普通 useQuery 并排时会并行，Suspense 下同组件多条会串行。
      - 父组件等自己的查询完成才渲染子查询，会形成嵌套瀑布。
  - title: useQueries source
    url: https://unpkg.com/@tanstack/react-query@5.102.8/src/useQueries.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - useQueries 用 QueriesObserver 观察一组查询。
      - combine 作为观察者选项传给 QueriesObserver。
  - title: QueriesObserver source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/queriesObserver.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - QueriesObserver 为数组里的每一项维护 QueryObserver。
      - setQueries 会按当前数组同步观察者集合。
---

# 并行查询

## 一、学习目标

- 说明互不依赖的查询应同时启动，而不是等前一条成功再声明后一条。
- 在数量固定时并排放多个 `useQuery`。
- 在数量随渲染变化时改用 `useQueries`，避免违反 Hooks 规则。
- 用 `queryOptions` 生成 `useQueries` 的每一项，而不是在数组里手写散开的 key。
- 对照各条查询自己的 `fetchStatus`，确认它们可以同时 `fetching`。

## 二、为什么需要并行查询

上一课的依赖查询必须串行：项目接口吃用户 `id`，没有 `id` 就不能发第二条请求。很多页面不是这样。用户列表和团队列表互不依赖，评论也不需要等文章正文成功后才知道文章 `id`。

如果这时仍写成“用户成功后再读团队”，两条本来可以重叠的请求会变成瀑布。官方把同时执行、用来提高并发的查询叫并行查询。

并行查询要解决的是：数量固定时怎么并排声明，数量会变时怎么不违反 Hooks 规则。它不是再讲一遍 `enabled`。

## 三、核心概念

### 1. 数量固定就并排 useQuery

官方写得很直接：并行查询数量不变时，没有额外工作。把多条 `useQuery` 写在同一个组件里，它们会同时执行：

```tsx
function Board() {
  const usersQuery = useQuery({ queryKey: ['users'], queryFn: fetchUsers })
  const teamsQuery = useQuery({ queryKey: ['teams'], queryFn: fetchTeams })
  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: fetchProjects })
}
```

每条查询仍有自己的 `queryKey`、`queryFn` 和状态。并行不等于合并成一条请求，也不等于共用一个 `status`。

普通 `useQuery` 并排时会并行。`useSuspenseQuery` 在同组件里会因为第一条抛出 Promise 而挂起，后面的查询来不及启动。那是 Suspense 边界，本课 Demo 不用它。

### 2. 数量会变时改用 useQueries

成员详情的条数取决于当前选中了谁。渲染之间可能是 1 条、2 条或 0 条。这时不能写：

```tsx
selectedIds.map((id) => useQuery(memberOptions(id)))
```

Hook 调用次数不能随渲染变化。官方为此提供 `useQueries`：接收带 `queries` 键的对象，值是查询选项数组，返回与输入顺序对应的结果数组。

```tsx
const memberQueries = useQueries({
  queries: selectedIds.map((id) => memberOptions(id)),
})
```

`selectedIds` 为空时传入空数组，结果也是空数组。不要为了“占位”塞一个空字符串 id。

### 3. 每一项仍是独立查询

`useQueries` 不会把多条查询合成一次 HTTP。数组里每一项仍按自己的 `queryKey` 进入缓存。同一 `queryKey` 出现两次，官方提醒可能导致数据共享，应先去重再映射回界面结构。

`queries` 里的选项大体与 `useQuery` 相同。自定义 `QueryClient` 作为 `useQueries` 的第二个参数提供一次，不要写进每一项。

需要把整组结果收成一个值时，可以用 `combine`。内联的 `combine` 每次渲染都会跑，本课不把它当成主线。

`useQueries` 也支持 `placeholderData`，但和 `useQuery` 不同：占位函数拿不到上一次渲染的查询信息，`previousData` 与 `previousQuery` 都是 `undefined`。官方原因是查询条数可能随渲染变化。本课不展开占位数据。

### 4. 并行和依赖不是同一套开关

依赖查询用 `enabled` 等另一条查询的数据。并行查询的前提是后一条不需要前一条的结果。把本来独立的团队查询写成 `enabled: Boolean(usersQuery.data)`，只会重新制造瀑布。

父组件等到自己的查询成功才渲染带查询的子组件，也会把并行变成嵌套瀑布。本课先在同一组件里把并排声明看清楚。

## 四、用法与示例

### 1. 用 queryOptions 并排两条固定查询

```tsx
import { queryOptions, useQuery } from '@tanstack/react-query'

/** 把用户列表收进一份配置。 */
function usersOptions() {
  return queryOptions({
    queryKey: ['users', 'list'] as const,
    queryFn: ({ signal }) => loadUsers(signal),
  })
}

/** 把团队列表收进一份配置。 */
function teamsOptions() {
  return queryOptions({
    queryKey: ['teams', 'list'] as const,
    queryFn: ({ signal }) => loadTeams(signal),
  })
}

/** 数量固定的用户查询和团队查询同时启动。 */
function OverviewBoard() {
  const usersQuery = useQuery(usersOptions())
  const teamsQuery = useQuery(teamsOptions())

  return (
    <section>
      {usersQuery.isLoading && <p>正在读取用户...</p>}
      {teamsQuery.isLoading && <p>正在读取团队...</p>}
      <p>{String(usersQuery.isFetching && teamsQuery.isFetching)}</p>
    </section>
  )
}
```

进入后两条查询都可以是 `fetching`。用户较快完成时，团队仍可能在 `fetching`。这就是并行，不是“用户成功后才开始团队”。

### 2. 用 useQueries 映射数量会变的成员

```tsx
import { queryOptions, useQueries } from '@tanstack/react-query'

/** 把单个成员详情收进配置。 */
function memberOptions(memberId: string) {
  return queryOptions({
    queryKey: ['users', 'detail', memberId] as const,
    queryFn: ({ signal }) => loadMember(memberId, signal),
  })
}

/** 按当前选中的 id 并行读取成员。 */
function MemberBoard({ selectedIds }: { selectedIds: string[] }) {
  const memberQueries = useQueries({
    queries: selectedIds.map((id) => memberOptions(id)),
  })

  return (
    <ul>
      {memberQueries.map((query, index) => (
        <li key={selectedIds[index]}>
          {query.isLoading && '正在读取成员...'}
          {query.isSuccess && query.data.name}
        </li>
      ))}
    </ul>
  )
}
```

增减选中 id 只改变 `queries` 数组长度，不改变 Hook 调用次数。结果数组的顺序与 `selectedIds` 一致，用对应 id 当列表 key。

### 3. 在 useQueries 里保住类型

官方说明：写在 `useQueries` 数组项上的内联 `select`，不能从同一对象的 `queryFn` 推断 `data`，会退回 `unknown`。先用 `queryOptions` 解析整份对象。展开后再覆盖 `select` 时，要把覆盖结果再包进 `queryOptions`，否则类型仍会丢。

本课 Demo 不覆盖 `select`。需要切片时回到查询配置复用那一套合同，再交给 `useQueries`。

## 五、用法示例：观察并行启动

下面的 Demo 并排放用户查询和团队查询。用户等待 420ms，团队等待 700ms，进入后上方的“同时 fetching”会先为 `true`。成员详情条数随林晓、周宁的选中变化，使用 `useQueries` 映射。再勾选周宁会增加一条成员请求；取消后再勾选同一人时，已成功的查询会复用缓存。离开页面会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.intermediate.parallel-queries.parallel-queries-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：按条件增减 useQuery 调用次数

**触发条件：** 用 `selectedIds.map` 直接调用 `useQuery`，或用 `if (showTeams) useQuery(...)`。

**原因：** Hooks 规则要求每次渲染调用次数和顺序稳定。并行条数一变，调用次数就变了。

**后果：** React 报错，或后一条查询错接到前一条的状态。

**错误示例：**

```tsx
selectedIds.map((id) => useQuery(memberOptions(id)))
```

**正确写法：**

```tsx
useQueries({
  queries: selectedIds.map((id) => memberOptions(id)),
})
```

**验证方式：** 勾选第二个成员后页面不崩溃，成员查询条数变成 2，Hook 调用仍是一次 `useQueries`。

### 错误：把互不依赖的查询写成串行

**触发条件：** 团队查询写上 `enabled: Boolean(usersQuery.data)`，或等用户 `isSuccess` 才渲染团队查询。

**原因：** 把上一课的依赖开关套到并不需要用户 `id` 的请求上。

**后果：** 团队请求被推迟一轮，重新变成瀑布。

**错误示例：**

```tsx
const usersQuery = useQuery(usersOptions())
const teamsQuery = useQuery({
  ...teamsOptions(),
  enabled: Boolean(usersQuery.data),
})
```

**正确写法：**

```tsx
const usersQuery = useQuery(usersOptions())
const teamsQuery = useQuery(teamsOptions())
```

**验证方式：** 进入后用户和团队的 `fetchStatus` 可以同时为 `fetching`。

### 错误：在 useQueries 数组里重复同一条 queryKey

**触发条件：** `selectedIds` 含两个相同 id，或手写两份相同的 `queryKey`。

**原因：** 缓存按 `queryKey` 识别查询。同一身份出现两次会共享数据。

**后果：** 两条结果互相覆盖，界面无法对应到两次独立读取。

**错误示例：**

```tsx
useQueries({
  queries: [memberOptions('u-lin'), memberOptions('u-lin')],
})
```

**正确写法：**

```tsx
useQueries({
  queries: Array.from(new Set(selectedIds)).map((id) => memberOptions(id)),
})
```

**验证方式：** 成员查询条数等于去重后的 id 数量，两条结果不会抢同一份缓存身份。

### 错误：等父查询成功才挂上本可并行的子查询

**触发条件：** 父组件 `isPending` 时不渲染已经知道 `id` 的子查询。

**原因：** 子查询需要的 `id` 在父查询开始前就已经有了，却被加载占位挡住。

**后果：** 文章和评论变成嵌套瀑布，评论要等正文成功后才启动。

**错误示例：**

```tsx
if (articleQuery.isPending) return <p>正在读取文章...</p>
return <Comments articleId={articleId} />
```

**正确写法：**

```tsx
const articleQuery = useQuery(articleOptions(articleId))
const commentsQuery = useQuery(commentsOptions(articleId))
```

**验证方式：** 两条查询的首次 `fetching` 出现在同一轮，而不是正文成功之后。

### 错误：把 useQueries 的内联 select 当成已推断类型

**触发条件：** 在数组项上直接写 `select: (data) => data.title`，指望 `data` 是 `queryFn` 的返回值。

**原因：** `useQueries` 一次推断整个数组，内联 `select` 的参数无法从同一对象的 `queryFn` 获得上下文类型。

**后果：** `data` 变成 `unknown`，取值时只能靠断言。

**错误示例：**

```tsx
useQueries({
  queries: [
    {
      ...memberOptions(memberId),
      select: (data) => data.name,
    },
  ],
})
```

**正确写法：**

```tsx
useQueries({
  queries: [
    queryOptions({
      ...memberOptions(memberId),
      select: (data) => data.name,
    }),
  ],
})
```

**验证方式：** `select` 参数能读到成员字段，不必写成 `unknown` 后再断言。
:::

## 七、源码推导与适用场景

1. **官方事实：** 并行查询是同时执行的查询。数量固定时并排 `useQuery` 即可。数量随渲染变化时用 `useQueries`，它接收 `queries` 数组并返回对应结果数组。同一 `queryKey` 出现多次可能共享数据。`useQueries` 内部使用 `QueriesObserver`；该观察者为数组每一项维护 `QueryObserver`，并用 `setQueries` 同步观察者集合。普通 `useQuery` 并排会并行；同组件里的多条 Suspense 查询会串行。`useQueries` 的 `placeholderData` 拿不到上一次查询信息，`previousData` 与 `previousQuery` 均为 `undefined`。
2. **课程推导：** 先判断后一条是否真的需要前一条的数据。不需要就并排声明。条数固定用多个 `useQuery`；条数随选中项变化用 `useQueries`。每一项仍用 `queryOptions` 收纳身份和请求函数。
3. **适用边界：** 本课不讲解 `useSuspenseQueries`、`combine` 主线、占位数据、预取、失效、Mutation 或无限查询。`combine` 需要稳定函数引用，内联写法会在每次渲染运行。需要占位时不要假设 `useQueries` 能收到 `previousData`。能改接口合成一次请求时，不必为了“看起来并行”拆成两条。

## 八、练习

:::exercise
### 练习目标

**要求：** 编写 `usersOptions()`、`teamsOptions()` 和 `memberOptions(id)`。组件里并排 `useQuery(usersOptions())` 与 `useQuery(teamsOptions())`。再用 `useQueries({ queries: selectedIds.map((id) => memberOptions(id)) })` 读取选中成员。不要按条件调用可变数量的 `useQuery`。用 `QueryClientProvider` 包裹。

**验收：** 用户查询和团队查询可以同时处于 fetching；增加一个选中 id 只增加 `useQueries` 数组长度，不增加 Hook 调用次数；不要把团队查询写成依赖用户成功；不要使用 `useSuspenseQuery`。

**参考答案：**

```tsx
import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQueries,
  useQuery,
} from '@tanstack/react-query'
import { useState, type ReactElement } from 'react'

type NamedItem = {
  id: string
  title: string
}

type MemberProfile = {
  id: string
  name: string
}

/** 读取用户列表。 */
async function loadUsers(signal: AbortSignal): Promise<NamedItem[]> {
  const response = await fetch('/api/users', { signal })
  if (!response.ok) {
    throw new Error(`读取用户失败：${response.status}`)
  }
  return (await response.json()) as NamedItem[]
}

/** 读取团队列表。 */
async function loadTeams(signal: AbortSignal): Promise<NamedItem[]> {
  const response = await fetch('/api/teams', { signal })
  if (!response.ok) {
    throw new Error(`读取团队失败：${response.status}`)
  }
  return (await response.json()) as NamedItem[]
}

/** 按 id 读取成员。 */
async function loadMember(memberId: string, signal: AbortSignal): Promise<MemberProfile> {
  const response = await fetch(`/api/users/${memberId}`, { signal })
  if (!response.ok) {
    throw new Error(`读取成员失败：${response.status}`)
  }
  return (await response.json()) as MemberProfile
}

/** 把用户列表收进一份配置。 */
function usersOptions() {
  return queryOptions({
    queryKey: ['users', 'list'] as const,
    queryFn: ({ signal }) => loadUsers(signal),
    retry: false,
  })
}

/** 把团队列表收进一份配置。 */
function teamsOptions() {
  return queryOptions({
    queryKey: ['teams', 'list'] as const,
    queryFn: ({ signal }) => loadTeams(signal),
    retry: false,
  })
}

/** 把成员详情收进配置。 */
function memberOptions(memberId: string) {
  return queryOptions({
    queryKey: ['users', 'detail', memberId] as const,
    queryFn: ({ signal }) => loadMember(memberId, signal),
    retry: false,
  })
}

/** 固定查询并排启动，成员条数变化时用 useQueries。 */
function ParallelBoard(): ReactElement {
  const [selectedIds, setSelectedIds] = useState<string[]>(['u-lin'])
  const usersQuery = useQuery(usersOptions())
  const teamsQuery = useQuery(teamsOptions())
  const memberQueries = useQueries({
    queries: selectedIds.map((id) => memberOptions(id)),
  })

  return (
    <section>
      <button type="button" onClick={() => setSelectedIds(['u-lin', 'u-zhou'])}>
        周宁
      </button>
      {usersQuery.isLoading && <p>正在读取用户...</p>}
      {teamsQuery.isLoading && <p>正在读取团队...</p>}
      {memberQueries.map((query, index) => (
        <p key={selectedIds[index]}>{query.isSuccess ? query.data.name : '正在读取成员...'}</p>
      ))}
    </section>
  )
}

/** 提供稳定客户端，避免并行查询丢失缓存。 */
export function App(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <ParallelBoard />
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- 互不依赖的查询应同时启动，不要等前一条成功。
- 数量固定时并排多个 `useQuery`。
- 数量会变时用 `useQueries`，不要按条件增减 Hook。
- 每一项仍用 `queryOptions` 收纳 `queryKey` 与 `queryFn`。
- 本课只观察并行读取，不展开 Suspense 或写入。

## 十、参考资料

- [Parallel Queries](https://tanstack.com/query/latest/docs/framework/react/guides/parallel-queries) - 支持固定数量并排查询与动态 useQueries。
- [useQueries](https://tanstack.com/query/latest/docs/framework/react/reference/functions/useQueries) - 支持可变数量并行查询的选项与返回值。
- [Performance & Request Waterfalls](https://tanstack.com/query/latest/docs/framework/react/guides/request-waterfalls) - 支持普通 useQuery 并排会并行。
- [useQueries 源码](https://unpkg.com/@tanstack/react-query@5.102.8/src/useQueries.ts) - 支持内部使用 QueriesObserver。
- [QueriesObserver 源码](https://unpkg.com/@tanstack/query-core@5.102.8/src/queriesObserver.ts) - 支持按数组同步一组 QueryObserver。
