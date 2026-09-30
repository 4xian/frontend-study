---
id: react.data.learn.basics.user-profile-panel
type: lesson
title: 实战：用户信息面板
summary: 组合已学查询能力，按用户选择读取资料，并观察加载、错误、刷新和缓存复用。
domain: frontend
technology: react
module: data
stage: basics
level: beginner
estimatedMinutes: 50
prerequisites:
  - react.data.learn.basics.react-query-devtools
related:
  - react.data.learn.basics.query-key
  - react.data.learn.basics.query-status
  - react.data.learn.basics.query-error-handling
  - react.data.learn.basics.query-cache-and-sharing
  - react.data.learn.basics.conditional-queries
tags:
  - TanStack Query
  - useQuery
  - queryKey
  - enabled
  - 用户信息面板
  - 缓存复用
appliesTo: TanStack Query 5.102.8、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 用 QueryClientProvider 和 useQuery 搭出一个按用户身份读取资料的面板。
  - 把用户选择写成 queryKey 的一部分，并在条件未满足时禁用查询。
  - 按 pending、error、success 渲染首次加载、失败和成功资料。
  - 用手动 refetch 观察刷新，并用相同 queryKey 的第二观察者验证缓存复用。
  - 让 queryFn 使用 fetch 思维检查响应，失败时抛错，卸载时清理本地延迟。
recap:
  - 用户信息面板先确定“读哪一位用户”，再让 queryKey 和 enabled 一起描述这次读取。
  - 未选择用户时应保持 pending/idle，不要把它渲染成首次加载。
  - 成功、失败和刷新都作用在同一条查询上；相同 key 的观察者共享缓存和请求。
  - queryFn 必须把不可用响应转成抛错，并响应 AbortSignal。
  - 本课只组合已学的读取能力，不引入写入、失效、依赖查询或分页。
sources:
  - title: Queries
    url: https://tanstack.com/query/latest/docs/framework/react/guides/queries
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 查询是绑定到唯一 key 的异步数据依赖。
      - 渲染通常先判断 isPending，再判断 isError，最后读取成功数据。
      - refetch 可用于再次执行当前查询。
  - title: Query Keys
    url: https://tanstack.com/query/latest/docs/framework/react/guides/query-keys
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - queryKey 必须唯一描述正在读取的数据。
      - 查询函数用到的变量应进入 queryKey，以便独立缓存。
  - title: Query Functions
    url: https://tanstack.com/query/latest/docs/framework/react/guides/query-functions
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - queryFn 成功时解析数据，失败时抛错。
      - fetch 不会为不成功的 HTTP 响应自动抛错，需要检查 response.ok。
      - QueryFunctionContext 提供 queryKey 和 signal。
  - title: Disabling/Pausing Queries
    url: https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - enabled 为 false 且无缓存时是 pending/idle。
      - 禁用查询不会自动挂载请求，但 useQuery 返回的 refetch 仍可手动触发。
  - title: Caching Examples
    url: https://tanstack.com/query/latest/docs/framework/react/guides/caching
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 相同 queryKey 的观察者读取同一缓存条目并同步状态。
  - title: QueryClientProvider
    url: https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - QueryClientProvider 把 QueryClient 提供给子树中的查询。
  - title: Response.ok
    url: https://developer.mozilla.org/en-US/docs/Web/API/Response/ok
    sourceType: engineering-reference
    appliesTo: Fetch API
    claims:
      - response.ok 在 HTTP 状态码 200 至 299 时为 true。
---

# 实战：用户信息面板

## 一、学习目标

- 用 `QueryClientProvider` 和 `useQuery` 搭出一个按用户身份读取资料的面板。
- 把用户选择写成 `queryKey` 的一部分，并在条件未满足时禁用查询。
- 按 `pending`、`error`、`success` 渲染首次加载、失败和成功资料。
- 用手动 `refetch` 观察刷新，并用相同 `queryKey` 的第二观察者验证缓存复用。
- 让 `queryFn` 使用 `fetch` 思维检查响应，失败时抛错，卸载时清理本地延迟。

## 二、为什么需要用户信息面板

设置页、成员卡片和账号栏都需要先知道“当前是哪一位用户”，再读取这一份资料。如果还没选用户就开始
请求，空身份会被送进接口；如果所有用户共用同一个 `queryKey`，后打开的面板会读到别人的缓存。

这节把已经学过的 Provider、查询函数、查询键、状态、错误处理、缓存共享和条件查询收成一块可观察的
面板。目标不是再学一套新 API，而是把这些规则接到同一条读取路径上。

## 三、核心概念

### 1. 面板读的是一条查询，不是一份本地对象

用户信息面板的数据来自服务端状态。组件负责选择用户和渲染结果，`QueryClient` 负责按 `queryKey`
保存这一次读取。同一棵树里的第二个观察者如果使用相同 key，会看到同一份 `status` 和 `data`。

### 2. 用户身份同时决定条件和缓存身份

未选择用户时，查询不应自动执行。选择之后，用户 id 必须进入 `queryKey`，因为查询函数会用它去读
不同的资料。条件控制“现在能不能读”，查询键控制“读的是哪一份”。

```tsx
const queryKey = ['user', selectedUserId] as const
const query = useQuery({
  queryKey,
  queryFn: loadUser,
  enabled: selectedUserId.length > 0,
})
```

### 3. 面板必须覆盖四种读取结果

官方查询结果至少要处理这些分支：

- 条件未满足：无缓存时是 `pending` 且 `fetchStatus` 为 `idle`。
- 首次加载：`isLoading` 为 true，还没有可渲染的 `data`。
- 成功：`status` 为 `success`，可以读取资料字段。
- 失败：`status` 为 `error`，用 `error.message` 给出可恢复的说明，再用 `refetch` 重新读取。

刷新不是另一次独立功能。它仍然执行当前这条查询。若 `staleTime` 让数据保持新鲜，重新选中同一位
用户时可以直接复用缓存，不必再发请求。

## 四、用法与示例

### 1. 先提供客户端，再声明面板查询

查询组件必须放在 `QueryClientProvider` 里。客户端在根组件里创建一次，离开页面时再清空，避免
Demo 把缓存留到下一次进入。

```tsx
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

type UserProfile = {
  id: string
  name: string
  role: 'admin' | 'member'
}

/** 按用户编号读取资料，失败时根据 response.ok 抛错。 */
async function loadUser(userId: string, signal: AbortSignal): Promise<UserProfile> {
  const response = await fetch(`/api/users/${userId}`, { signal })
  if (!response.ok) {
    throw new Error(`读取用户失败：${response.status}`)
  }
  return (await response.json()) as UserProfile
}

/** 根据当前选择读取一位用户。 */
function UserPanel() {
  const [userId, setUserId] = useState('')
  const query = useQuery({
    queryKey: ['user', userId] as const,
    queryFn: ({ signal }) => loadUser(userId, signal),
    enabled: userId.length > 0,
    retry: false,
  })

  return (
    <section>
      <select value={userId} onChange={(event) => setUserId(event.target.value)}>
        <option value="">未选择</option>
        <option value="u-lin">林晓</option>
      </select>
      {query.isPending && query.fetchStatus === 'idle' && <p>请先选择用户</p>}
      {query.isLoading && <p>正在读取</p>}
      {query.isError && <p role="alert">{query.error.message}</p>}
      {query.isSuccess && <p>{query.data.name}</p>}
      <button type="button" onClick={() => void query.refetch()} disabled={!query.isEnabled}>
        手动刷新
      </button>
    </section>
  )
}
```

### 2. 用第二观察者证明缓存共享

只要 `queryKey` 相同，摘要区不必再写一套请求。它加入同一条查询后，会在首次加载时共享进行中的
请求，成功后直接显示缓存里的姓名和团队。

开发环境里也可以打开 React Query Devtools，对照面板中的 `queryKey` 和缓存条目。本课 Demo 把这些
事实直接画在页面上，方便在课程观察区完成同一条路径。

## 五、用法示例：可运行的用户信息面板

下面的 Demo 使用本地异步读取模拟接口：成功用户返回 JSON，未知用户走 404 并检查 `response.ok`。
选择用户后观察 `queryKey`、首次加载和成功卡片；选择未知用户观察错误；手动刷新会再次执行当前
查询。共享观察者使用同一条 key，用来证明缓存复用。离开页面时会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.basics.user-profile-panel.user-profile-panel-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：未选择用户也自动发起请求

**触发条件：** 把 `useQuery` 写成始终启用，或把空字符串当成有效用户 id。

**原因：** 查询在挂载后就会执行。空身份仍然是一个 `queryKey`，请求会被发送到无效地址。

**后果：** 面板一打开就失败，或把空结果写进缓存，后续选择真实用户前先看到一次错误。

**错误示例：**

```tsx
const query = useQuery({
  queryKey: ['user', userId],
  queryFn: () => loadUser(userId),
})
```

**正确写法：**

```tsx
const query = useQuery({
  queryKey: ['user', userId],
  queryFn: () => loadUser(userId),
  enabled: userId.length > 0,
})
```

**验证方式：** 保持“未选择”，确认 `status` 为 `pending`、`fetchStatus` 为 `idle`，请求次数仍为 0。

### 错误：所有用户共用一个 queryKey

**触发条件：** 查询函数读取 `userId`，但 key 只写成 `['user']`。

**原因：** `queryKey` 是缓存身份。变量不进 key，不同用户会被当成同一份数据。

**后果：** 先读林晓再读周宁时，面板可能继续显示林晓，或把后来的结果覆盖到所有用户上。

**错误示例：**

```tsx
const query = useQuery({
  queryKey: ['user'],
  queryFn: () => loadUser(userId),
  enabled: userId.length > 0,
})
```

**正确写法：**

```tsx
const query = useQuery({
  queryKey: ['user', userId],
  queryFn: () => loadUser(userId),
  enabled: userId.length > 0,
})
```

**验证方式：** 先后选择两位用户，确认 `queryKey` 第二项随选择变化，卡片内容与当前用户一致。

### 错误：把 HTTP 失败当成成功数据

**触发条件：** `queryFn` 调用 `fetch` 后直接 `return response.json()`，不检查 `response.ok`。

**原因：** `fetch` 在 404 或 500 时通常仍会 resolve。查询只有在函数抛错时才进入 `error`。

**后果：** 未知用户显示为成功，面板去渲染不存在的资料，错误分支永远不会出现。

**错误示例：**

```tsx
async function loadUser(userId: string): Promise<UserProfile> {
  const response = await fetch(`/api/users/${userId}`)
  return (await response.json()) as UserProfile
}
```

**正确写法：**

```tsx
async function loadUser(userId: string, signal: AbortSignal): Promise<UserProfile> {
  const response = await fetch(`/api/users/${userId}`, { signal })
  if (!response.ok) {
    throw new Error(`读取用户失败：${response.status}`)
  }
  return (await response.json()) as UserProfile
}
```

**验证方式：** 选择未知用户，确认面板进入 `error` 并显示失败说明，而不是空白成功卡片。

### 错误：把未启用渲染成首次加载

**触发条件：** 只用 `query.isPending` 或 `query.isLoading` 显示“正在读取”，不看 `fetchStatus`。

**原因：** 禁用且无缓存时，查询也是 `pending`。`isLoading` 才表示首次真正请求。

**后果：** 用户还没选择，面板已经转圈，无法区分“等待条件”和“正在读取”。

**错误示例：**

```tsx
if (query.isPending) {
  return <p>正在读取</p>
}
```

**正确写法：**

```tsx
if (query.isPending && query.fetchStatus === 'idle') {
  return <p>请先选择用户</p>
}
if (query.isLoading) {
  return <p>正在读取</p>
}
```

**验证方式：** 未选择时看到等待文案且请求次数为 0；选择用户后才出现“正在读取”。

### 错误：每次渲染都新建 QueryClient

**触发条件：** 在面板组件函数体里直接 `new QueryClient()`，而不是在根组件里稳定持有。

**原因：** 新的客户端拥有新的缓存。选择变化引起的重渲染会丢掉上一份查询结果。

**后果：** 共享观察者无法复用缓存，重新选中同一用户也会再次请求。

**错误示例：**

```tsx
function UserPanel() {
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <UserCard />
    </QueryClientProvider>
  )
}
```

**正确写法：**

```tsx
function App() {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <UserCard />
    </QueryClientProvider>
  )
}
```

**验证方式：** 先成功读取一位用户，再切走后切回，确认请求次数不增加，共享观察者仍显示同一份资料。
:::

## 七、源码推导与适用场景

1. **官方事实：** 查询需要唯一 `queryKey` 和返回 Promise 的 `queryFn`。`queryKey` 应包含查询函数用到
   的变量。`enabled: false` 且无缓存时为 `pending/idle`，`refetch` 仍可手动触发。`fetch` 必须检查
   `response.ok` 才能把 HTTP 失败变成查询错误。相同 `queryKey` 的观察者共享缓存。
2. **课程推导：** 用户信息面板把“选择谁”写成条件和 key，把“怎么读”留在 `queryFn`，把“读到什么”
   交给查询状态。第二观察者只是同一条查询的另一个订阅，不是第二条接口。
3. **适用边界：** 本课只覆盖读取面板。写入用户资料、查询失效、依赖查询、分页、乐观更新和数据层
   封装都不在这里展开。

## 八、练习

:::exercise
### 练习目标

**要求：** 编写一个用户资料面板：用稳定的 `QueryClient` 包裹组件；根据选择的 `userId` 声明
`queryKey`；`userId` 为空时禁用查询；`queryFn` 使用 `fetch` 并检查 `response.ok`；渲染等待选择、
首次加载、错误和成功；提供手动刷新按钮。

**验收：** 未选择时不发请求；选择有效用户后出现资料；选择会失败的用户后出现错误；再次选择同一
有效用户可以复用缓存；刷新调用的是当前查询的 `refetch`。

**参考答案：**

```tsx
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { useState, type ReactElement } from 'react'

type UserProfile = {
  id: string
  name: string
  role: 'admin' | 'member'
}

/** 读取指定用户资料，并在 HTTP 失败时抛错。 */
async function loadUser(userId: string, signal: AbortSignal): Promise<UserProfile> {
  const response = await fetch(`/api/users/${userId}`, { signal })
  if (!response.ok) {
    throw new Error(`读取用户失败：${response.status}`)
  }
  return (await response.json()) as UserProfile
}

/** 按当前选择渲染用户资料面板。 */
function UserPanel(): ReactElement {
  const [userId, setUserId] = useState('')
  const query = useQuery({
    queryKey: ['user', userId] as const,
    queryFn: ({ signal }) => loadUser(userId, signal),
    enabled: userId.length > 0,
    retry: false,
  })

  return (
    <section>
      <select value={userId} onChange={(event) => setUserId(event.target.value)}>
        <option value="">未选择</option>
        <option value="u-lin">林晓</option>
        <option value="u-missing">未知用户</option>
      </select>
      {query.isPending && query.fetchStatus === 'idle' && <p>请先选择用户</p>}
      {query.isLoading && <p>正在读取</p>}
      {query.isError && <p role="alert">{query.error.message}</p>}
      {query.isSuccess && (
        <p>
          {query.data.name}（{query.data.role}）
        </p>
      )}
      <button type="button" onClick={() => void query.refetch()} disabled={!query.isEnabled}>
        手动刷新
      </button>
    </section>
  )
}

/** 提供稳定客户端，避免每次渲染丢掉查询缓存。 */
export function App(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <UserPanel />
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- 用户信息面板是一条带条件的查询，不是本地对象展示。
- 用户 id 同时进入 `enabled` 判断和 `queryKey`。
- 先区分未启用、加载、错误和成功，再决定能不能读 `data`。
- 手动刷新走当前查询的 `refetch`；相同 key 的观察者共享缓存。
- `queryFn` 要检查响应并处理取消，不要把 HTTP 失败当成成功。

## 十、参考资料

- [Queries](https://tanstack.com/query/latest/docs/framework/react/guides/queries) - 支持查询声明、状态分支和 refetch。
- [Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys) - 支持把用户身份写入查询键。
- [Query Functions](https://tanstack.com/query/latest/docs/framework/react/guides/query-functions) - 支持 fetch、抛错和 signal。
- [Disabling/Pausing Queries](https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries) - 支持未选择时禁用查询。
- [Caching Examples](https://tanstack.com/query/latest/docs/framework/react/guides/caching) - 支持相同 queryKey 的缓存共享。
- [QueryClientProvider](https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider) - 支持查询客户端作用域。
- [Response.ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok) - 支持用 HTTP 状态判断响应是否可用。
