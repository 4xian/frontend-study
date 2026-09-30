---
id: react.data.learn.intermediate.dependent-queries
type: lesson
title: 依赖查询
summary: 用 enabled 让后一条查询等前一条结果出现后再执行，并区分未启用与首次读取。
domain: frontend
technology: react
module: data
stage: intermediate
level: intermediate
estimatedMinutes: 45
prerequisites:
  - react.data.learn.intermediate.query-options-reuse
related:
  - react.data.learn.basics.conditional-queries
  - react.data.learn.basics.query-status
  - react.data.learn.intermediate.query-options-reuse
  - react.data.learn.basics.typescript-queries
tags:
  - TanStack Query
  - dependent queries
  - 依赖查询
  - enabled
  - isLoading
  - 请求瀑布
appliesTo: TanStack Query 5.102.8、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 能用前一条查询的结果决定后一条查询何时启用。
  - 能把依赖值放进后一条查询的 queryKey，而不是只写在 queryFn 闭包里。
  - 能说明未启用时是 pending 与 idle，首次真正请求才是 isLoading。
  - 能用 isLoading 而不是 isPending 判断依赖查询是否正在首次读取。
  - 能说明依赖查询会形成请求瀑布，本课只观察串行执行。
recap:
  - 依赖查询用 enabled 等前一条结果出现后再执行后一条查询。
  - 依赖值必须进入后一条查询的 queryKey。
  - 未启用且无缓存时是 pending 与 idle，不是正在读取。
  - isLoading 等于 isPending 且 isFetching，适合表示首次真正请求。
  - 本课只讲串行依赖，不展开并行查询、失效或写入。
sources:
  - title: Dependent Queries
    url: https://tanstack.com/query/latest/docs/framework/react/guides/dependent-queries
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 依赖查询要等前一条完成后再执行。
      - 用 enabled 告诉后一条查询何时可以运行。
      - 项目查询在用户 id 出现前是 pending 与 idle。
      - 用户可用后项目查询变为 pending 与 fetching。
      - 拿到项目后变为 success 与 idle。
      - 依赖查询会形成请求瀑布。
  - title: Disabling/Pausing Queries
    url: https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - enabled 可以禁用查询并接受返回布尔值的回调。
      - 禁用且无缓存时为 pending 与 idle。
      - isLoading 等于 isPending 且 isFetching，适合惰性查询的首次请求指示。
      - skipToken 是类型安全的禁用方式，但不能手动 refetch。
  - title: useQuery Reference
    url: https://tanstack.com/query/latest/docs/framework/react/reference/functions/useQuery
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 依赖查询应在条件就绪后再启用。
      - 未启用时用 isLoading 而不是 isPending 判断加载。
      - skipToken 可避免 queryFn 里的非空断言，但不能手动 refetch。
  - title: Performance & Request Waterfalls
    url: https://tanstack.com/query/latest/docs/framework/react/guides/request-waterfalls
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 单组件里后一条查询依赖前一条结果时会形成请求瀑布。
      - 能改接口让两条查询并行时，不应默认走串行依赖。
  - title: Query Observer source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/queryObserver.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 查询观察结果按 isPending 与 isFetching 计算 isLoading。
      - enabled 解析为 false 时不会满足自动挂载和自动触发重新获取的条件。
---

# 依赖查询

## 一、学习目标

- 用前一条查询的结果决定后一条查询何时启用。
- 把依赖值放进后一条查询的 `queryKey`，而不是只写在 `queryFn` 闭包里。
- 说明未启用时是 `pending` 与 `idle`，首次真正请求才是 `isLoading`。
- 用 `isLoading` 而不是 `isPending` 判断依赖查询是否正在首次读取。
- 说明依赖查询会形成请求瀑布，本课只观察串行执行。

## 二、为什么需要依赖查询

条件查询解决的是“用户还没提交有效条件”。依赖查询解决的是另一件事：后一条请求需要前一条已经返回的数据。

常见例子是：先按邮箱读用户，再按用户 `id` 读项目列表。项目接口吃的是 `id`，不是邮箱。用户还没成功时，项目查询没有合法身份，也不该发出请求。

如果两条 `useQuery` 同时启动，项目查询会带着空的 `id` 去打接口，或者在 `queryFn` 里用非空断言硬闯。正确做法是让项目查询声明依赖：用户 `id` 出现之前保持未启用，出现之后才执行。

这和筛选表单不同。表单用 `enabled` 等用户提交；这里用 `enabled` 等另一条查询的结果。

## 三、核心概念

### 1. 后一条查询等前一条的结果

官方把这种写法叫依赖查询，也叫串行查询。它用 `enabled` 告诉后一条查询何时可以运行：

```tsx
const { data: user } = useQuery({
  queryKey: ['user', email],
  queryFn: getUserByEmail,
})
const userId = user?.id
const { status, fetchStatus, data: projects } = useQuery({
  queryKey: ['projects', userId],
  queryFn: getProjectsByUser,
  enabled: Boolean(userId),
})
```

`userId` 还是 `undefined` 时，项目查询不会自动执行。用户成功后 `userId` 变成真实字符串，`enabled` 变为 `true`，项目查询才开始。

`Boolean(userId)` 和官方示例里的 `!!userId` 对字符串或 `undefined` 的结果相同。本课统一写成 `Boolean(userId)`。

### 2. 未启用不是正在读取

项目查询在用户可用前会处于：

```tsx
status: 'pending'
isPending: true
fetchStatus: 'idle'
```

`pending` 只说明还没有成功数据。`idle` 说明当前没有执行 `queryFn`。这时 `isLoading` 是 `false`。

用户可用后，项目查询变为：

```tsx
status: 'pending'
isPending: true
fetchStatus: 'fetching'
```

这时才是首次真正请求，`isLoading` 为 `true`。拿到项目后变为 `success` 与 `idle`。

`isLoading` 的定义是：

```ts
isLoading === isPending && isFetching
```

依赖查询的加载指示应看 `isLoading`，不要看到 `isPending` 就画转圈。

### 3. 依赖值属于 queryKey

项目列表的身份是“这个用户的项目”，不是“某一个固定列表”。`userId` 必须进入 `queryKey`。只把 `userId` 关进 `queryFn` 闭包、key 却写成 `['projects']`，切换用户后仍会撞上同一条缓存。

用户还没成功时，官方示例会把 `userId` 以 `undefined` 留在数组里，同时用 `enabled` 挡住执行。不要再额外塞一个空字符串哨兵，把 `['projects', 'list', '']` 登记成一份假资源。

### 4. 串行依赖会形成请求瀑布

两条查询按定义不能同时开始。如果它们各自都要 420ms，用户看到项目列表至少要等两轮。官方称这是请求瀑布。能改后端、让邮箱直接查出项目时，不必先绕一圈用户详情。本课先看清这种串行开关，不把接口改造或并行查询当成这一课的练习。

`skipToken` 也能在类型上禁用查询，基础课的 TypeScript 查询已经讲过。本课主线仍是 `enabled`，因为官方依赖查询示例用它表达“等前一条结果”。

## 四、用法与示例

### 1. 用 queryOptions 收纳两条有依赖的查询

上一课已经把 `queryKey` 和 `queryFn` 收进同一份配置。依赖查询同样可以这样做，只是项目配置多一个 `enabled`：

```tsx
import { queryOptions, useQuery } from '@tanstack/react-query'

/** 按邮箱读取用户。 */
function userOptions(email: string) {
  return queryOptions({
    queryKey: ['users', 'detail', email] as const,
    queryFn: ({ signal }) => loadUser(email, signal),
  })
}

/** 等用户 id 出现后再读取项目。 */
function projectOptions(userId: string | undefined) {
  return queryOptions({
    queryKey: ['projects', 'list', userId] as const,
    queryFn: ({ signal }) => loadProjects(userId, signal),
    enabled: Boolean(userId),
  })
}

/** 先读用户，再按用户 id 启用项目查询。 */
function TeamBoard({ email }: { email: string }) {
  const userQuery = useQuery(userOptions(email))
  const projectQuery = useQuery(projectOptions(userQuery.data?.id))

  if (userQuery.isLoading) return <p>正在读取用户...</p>
  if (!userQuery.data) return <p>等待用户 id 后才启用。</p>
  if (projectQuery.isLoading) return <p>正在读取项目...</p>
  return <p>{projectQuery.data?.map((project) => project.title).join('、')}</p>
}
```

组件里不要再手写第二套 `queryKey`。切换邮箱只更换用户配置；项目配置跟着 `userQuery.data?.id` 走。

### 2. 加载指示跟 isLoading，不跟 isPending

官方 `useQuery` 示例明确写：依赖查询未启用时不要用 `isPending` 当加载态。

```tsx
function Projects({ userId }: { userId: string | undefined }) {
  const query = useQuery(projectOptions(userId))

  if (!userId) return <p>等待用户 id 后才启用。</p>
  if (query.isLoading) return <p>正在读取项目...</p>
  if (query.isError) return <p>{query.error.message}</p>
  return <ul>{query.data?.map((project) => <li key={project.id}>{project.title}</li>)}</ul>
}
```

用户还在读取时，项目卡片应显示等待，而不是“正在读取项目”。用户成功后，项目 `status` 仍可能短暂保持 `pending`，但 `fetchStatus` 会变成 `fetching`，这时才显示首次读取。

### 3. 切换用户时换成新的依赖身份

林晓的项目和周宁的项目是两条不同的查询。切到周宁时，用户查询换成新的邮箱 key，项目查询等新的 `id` 出现后再启用。再切回林晓时，如果两条查询都还在缓存里并且仍然新鲜，请求次数不应再增加。

不要为了“看起来在刷新”去调用 `invalidateQueries`。本课只观察依赖开关和缓存身份。

## 五、用法示例：观察串行查询

下面的 Demo 先按邮箱读取用户，再按用户 `id` 启用项目查询。上方对照用户请求次数、项目请求次数，以及项目查询的 `status`、`fetchStatus`、`isLoading` 和当前 `queryKey`。进入后先看到用户在读，项目仍是 `pending` 与 `idle`，`isLoading` 为 `false`；用户成功后项目才变成首次读取。切换周宁会新增一轮项目请求；再切回林晓时，已成功的查询会复用缓存。离开页面会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.intermediate.dependent-queries.dependent-queries-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：后一条查询不等前一条结果

**触发条件：** 两条 `useQuery` 一起挂上，项目查询没有 `enabled`。

**原因：** 默认查询会在挂载时自动执行。用户 `id` 还不存在，请求已经发出。

**后果：** 空 `id` 打到接口，或 `queryFn` 用非空断言在运行时崩溃。

**错误示例：**

```tsx
const userQuery = useQuery(userOptions(email))
const projectQuery = useQuery({
  queryKey: ['projects', 'list', userQuery.data?.id],
  queryFn: () => loadProjects(userQuery.data!.id),
})
```

**正确写法：**

```tsx
const userQuery = useQuery(userOptions(email))
const projectQuery = useQuery(projectOptions(userQuery.data?.id))
```

**验证方式：** 用户还在读取时，项目请求次数保持为 0，项目 `fetchStatus` 是 `idle`。

### 错误：用 isPending 给依赖查询画转圈

**触发条件：** 看到项目查询 `isPending` 就渲染“正在读取项目”。

**原因：** 未启用且无缓存时也是 `pending`，但 `fetchStatus` 是 `idle`。

**后果：** 用户还没出来，项目卡片已经一直转圈，分不清是在等依赖还是在请求。

**错误示例：**

```tsx
if (projectQuery.isPending) return <p>正在读取项目...</p>
```

**正确写法：**

```tsx
if (!userId) return <p>等待用户 id 后才启用。</p>
if (projectQuery.isLoading) return <p>正在读取项目...</p>
```

**验证方式：** 用户读取期间项目 `isLoading` 为 `false`；用户成功后、项目返回前，`isLoading` 才为 `true`。

### 错误：依赖值只写进 queryFn，不写进 queryKey

**触发条件：** 项目查询的 key 固定为 `['projects']`，真正的用户 `id` 只出现在函数闭包里。

**原因：** 缓存只认 `queryKey`。不同用户会被当成同一条查询。

**后果：** 切到周宁后仍显示林晓的项目，或请求次数不再增加却读到错误列表。

**错误示例：**

```tsx
useQuery({
  queryKey: ['projects'],
  queryFn: () => loadProjects(userId),
  enabled: Boolean(userId),
})
```

**正确写法：**

```tsx
useQuery({
  queryKey: ['projects', 'list', userId],
  queryFn: ({ signal }) => loadProjects(userId, signal),
  enabled: Boolean(userId),
})
```

**验证方式：** 林晓成功后项目 key 含 `u-lin`；切到周宁后变成含 `u-zhou` 的另一条。

### 错误：把空字符串登记成项目列表身份

**触发条件：** 用户还没成功时写成 `queryKey: ['projects', 'list', userId ?? '']`。

**原因：** 空字符串也是 key 的一项。禁用只能挡住请求，挡不住这条假身份进入缓存观察范围。

**后果：** 前缀匹配或后续失效会看到一份空 `id` 的项目查询，和真实用户列表混在一起。

**错误示例：**

```tsx
queryOptions({
  queryKey: ['projects', 'list', userId ?? ''],
  queryFn: loadProjects,
  enabled: Boolean(userId),
})
```

**正确写法：**

```tsx
queryOptions({
  queryKey: ['projects', 'list', userId],
  queryFn: loadProjects,
  enabled: Boolean(userId),
})
```

**验证方式：** 用户成功前不要把空字符串写进项目 key；成功后 key 只含真实 `id`。

### 错误：把依赖查询写成筛选表单

**触发条件：** 用输入框提交邮箱，却把本课理解成“再讲一遍条件查询”。

**原因：** 两者都用 `enabled`，但开关来源不同。条件查询等用户提交；依赖查询等另一条查询的数据。

**后果：** 页面上只有表单，看不到用户查询和项目查询的先后关系。

**错误示例：**

```tsx
useQuery({
  queryKey: ['projects', submittedEmail],
  queryFn: () => loadProjectsByEmail(submittedEmail),
  enabled: submittedEmail.length > 0,
})
```

**正确写法：**

```tsx
const userQuery = useQuery(userOptions(email))
useQuery(projectOptions(userQuery.data?.id))
```

**验证方式：** 项目请求必须发生在对应用户请求成功之后，而不是发生在点击提交按钮之后。
:::

## 七、源码推导与适用场景

1. **官方事实：** 依赖查询用 `enabled` 等前一条结果。项目查询在用户 `id` 出现前是 `pending` 与 `idle`，用户可用后变为 `pending` 与 `fetching`，成功后是 `success` 与 `idle`。`isLoading` 等于 `isPending && isFetching`。官方 `useQuery` 示例要求未启用时看 `isLoading` 而不是 `isPending`。这种串行依赖会形成请求瀑布。观察者源码在 `enabled` 解析为 `false` 时不会自动挂载请求，并按 `isPending` 与 `isFetching` 计算 `isLoading`。
2. **课程推导：** `enabled` 在这里绑定的是另一条查询的数据，不是表单草稿。依赖值要进入 `queryKey`。加载文案跟 `isLoading`。两条查询仍应复用 `queryOptions`，避免项目查询另写一套身份。
3. **适用边界：** 本课不讲解 `useQueries` 的动态依赖、并行查询、预取、失效、Mutation 或 Suspense。`skipToken` 只作为类型安全禁用的已知能力，不在本课展开。能把用户和项目合成一次请求时，不必保持这条瀑布。

## 八、练习

:::exercise
### 练习目标

**要求：** 编写 `userOptions(email)` 与 `projectOptions(userId)`。用户查询按邮箱读取；项目查询的 `queryKey` 包含 `userId`，并用 `enabled: Boolean(userId)` 等用户 `id` 出现后再执行。组件里先 `useQuery(userOptions(email))`，再 `useQuery(projectOptions(userQuery.data?.id))`。未启用时显示等待，不要用 `isPending` 当加载；首次真正请求用 `isLoading`。用 `QueryClientProvider` 包裹。

**验收：** 用户还在读取时项目查询不发请求；用户成功后才读取项目；切换另一个邮箱会换一条项目 key；不要把空字符串写进项目 key；不要使用 `useQueries`。

**参考答案：**

```tsx
import { QueryClient, QueryClientProvider, queryOptions, useQuery } from '@tanstack/react-query'
import { useState, type ReactElement } from 'react'

type UserProfile = {
  id: string
  name: string
}

type UserProject = {
  id: string
  title: string
}

/** 按邮箱读取用户。 */
async function loadUser(email: string, signal: AbortSignal): Promise<UserProfile> {
  const response = await fetch(`/api/users/${email}`, { signal })
  if (!response.ok) {
    throw new Error(`读取用户失败：${response.status}`)
  }
  return (await response.json()) as UserProfile
}

/** 按用户 id 读取项目。 */
async function loadProjects(userId: string, signal: AbortSignal): Promise<UserProject[]> {
  const response = await fetch(`/api/users/${userId}/projects`, { signal })
  if (!response.ok) {
    throw new Error(`读取项目失败：${response.status}`)
  }
  return (await response.json()) as UserProject[]
}

/** 把用户查询收进一份配置。 */
function userOptions(email: string) {
  return queryOptions({
    queryKey: ['users', 'detail', email] as const,
    queryFn: ({ signal }) => loadUser(email, signal),
    retry: false,
  })
}

/** 把项目查询收进配置，并在缺少用户 id 时保持未启用。 */
function projectOptions(userId: string | undefined) {
  return queryOptions({
    queryKey: ['projects', 'list', userId] as const,
    queryFn: ({ signal }) => {
      if (!userId) {
        throw new Error('缺少用户 id，不能读取项目')
      }
      return loadProjects(userId, signal)
    },
    enabled: Boolean(userId),
    retry: false,
  })
}

/** 先读用户，再按用户 id 启用项目查询。 */
function DependentBoard(): ReactElement {
  const [email, setEmail] = useState('lin@team.local')
  const userQuery = useQuery(userOptions(email))
  const userId = userQuery.data?.id
  const projectQuery = useQuery(projectOptions(userId))

  return (
    <section>
      <button type="button" onClick={() => setEmail('zhou@team.local')}>
        周宁
      </button>
      {userQuery.isLoading && <p>正在读取用户...</p>}
      {userQuery.isSuccess && <p>{userQuery.data.name}</p>}
      {!userId && <p>等待用户 id 后才启用。</p>}
      {projectQuery.isLoading && <p>正在读取项目...</p>}
      {projectQuery.isSuccess &&
        projectQuery.data.map((project) => <p key={project.id}>{project.title}</p>)}
    </section>
  )
}

/** 提供稳定客户端，避免依赖查询丢失缓存。 */
export function App(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <DependentBoard />
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- 依赖查询用 `enabled` 等前一条结果出现后再执行。
- 依赖值必须进入后一条查询的 `queryKey`。
- 未启用时是 `pending` 与 `idle`，不要画成正在读取。
- 首次真正请求看 `isLoading`，不要看单独的 `isPending`。
- 串行依赖会形成请求瀑布；本课只观察这种开关，不展开并行查询。

## 十、参考资料

- [Dependent Queries](https://tanstack.com/query/latest/docs/framework/react/guides/dependent-queries) - 支持用 enabled 做串行依赖查询。
- [Disabling/Pausing Queries](https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries) - 支持未启用状态与 isLoading。
- [useQuery](https://tanstack.com/query/latest/docs/framework/react/reference/functions/useQuery) - 支持依赖查询用 isLoading 而不是 isPending。
- [Performance & Request Waterfalls](https://tanstack.com/query/latest/docs/framework/react/guides/request-waterfalls) - 支持依赖查询会形成请求瀑布。
- [queryObserver 源码](https://unpkg.com/@tanstack/query-core@5.102.8/src/queryObserver.ts) - 支持 isLoading 计算与 enabled 自动触发边界。
