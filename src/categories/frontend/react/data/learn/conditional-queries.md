---
id: react.data.learn.basics.conditional-queries
type: lesson
title: 条件查询
summary: 使用 enabled 把查询的执行时机绑定到已提交的有效条件，并正确区分未启用与首次加载状态。
domain: frontend
technology: react
module: data
stage: basics
level: beginner
estimatedMinutes: 45
prerequisites:
  - react.data.learn.basics.cache-lifecycle-and-gctime
related:
  - react.data.learn.basics.query-status
  - react.data.learn.basics.query-key
tags:
  - TanStack Query
  - enabled
  - conditional query
  - lazy query
  - isLoading
  - fetchStatus
appliesTo: TanStack Query 5.102.8、React 19.2.8
verifiedAt: 2026-09-01
objectives:
  - 使用 enabled 控制查询是否自动执行。
  - 将草稿输入与已提交查询条件分离，避免每次输入都发起请求。
  - 根据 status、fetchStatus、isPending 和 isLoading 区分未启用与首次请求。
  - 解释禁用查询对自动重新获取、查询失效和手动 refetch 的影响。
  - 在保留缓存的同时重新启用相同条件的查询。
recap:
  - enabled 为 false 时，无缓存查询通常是 pending/idle，有缓存查询可以直接显示 success 数据。
  - enabled 控制声明式执行边界，输入草稿不应直接作为已提交查询条件。
  - isLoading 等于 isPending && isFetching，适合表示首次真正请求，而不是“尚未启用”。
  - 禁用查询不会响应常规挂载、后台和 invalidateQueries/refetchQueries 触发，但 refetch 仍可手动调用。
  - 查询缓存仍按 queryKey 保留；重新提交相同条件时可以先读取已有缓存。
sources:
  - title: Disabling/Pausing Queries
    url: https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - enabled 可以禁用查询并接受返回布尔值的回调。
      - 禁用且无缓存时为 pending/idle，有缓存时可以直接为 success。
      - 禁用查询不自动挂载、后台重新获取或响应 invalidateQueries/refetchQueries。
      - useQuery 返回的 refetch 仍可手动触发查询。
      - isLoading 等于 isPending && isFetching，适合惰性查询的首次请求指示。
  - title: useQuery Reference
    url: https://tanstack.com/query/latest/docs/framework/react/reference/useQuery
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - enabled 的类型是布尔值或根据 Query 返回布尔值的函数。
      - fetchStatus 的 fetching、paused、idle 分别表示执行、暂停和空闲。
      - isLoading、isFetching、isPending 和 isEnabled 是可观察的派生状态。
  - title: Query Observer source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/queryObserver.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 查询观察结果按 isPending 与 isFetching 计算 isLoading。
      - enabled 为 false 时不会满足自动挂载和自动触发重新获取的条件。
---

# 条件查询

## 一、学习目标

- 使用 `enabled` 控制查询是否自动执行。
- 将草稿输入与已提交查询条件分离，避免每次输入都发起请求。
- 根据 `status`、`fetchStatus`、`isPending` 和 `isLoading` 区分未启用与首次请求。
- 解释禁用查询对自动重新获取、查询失效和手动 `refetch` 的影响。
- 在保留缓存的同时重新启用相同条件的查询。

## 二、为什么需要条件查询

搜索框、筛选表单和详情面板经常需要等用户提供条件后再请求。如果把输入框的每一次变化都直接接到查询
参数，用户还没有完成输入，请求就会连续发生；空条件也可能被错误地发送到服务端。

条件查询把“用户正在编辑什么”和“页面已经决定查询什么”分成两份状态。草稿可以随时变化，只有提交后
才更新查询使用的条件；`enabled` 再根据条件是否有效决定查询是否运行。

## 三、核心概念

### 1. enabled 是查询的执行开关

`enabled` 默认是 `true`。设置为 `false` 时，观察者仍然存在，但不会在挂载时自动执行查询，也不会因为
普通的后台触发器或查询失效自动执行。它可以是布尔值，也可以是接收当前 Query 并返回布尔值的函数。

```tsx
const query = useQuery({
  queryKey: ['search', submittedKeyword],
  queryFn: () => searchMessages(submittedKeyword),
  enabled: submittedKeyword.length > 0,
})
```

`queryKey` 仍然要包含真正影响结果的条件。`enabled` 只决定这个条件是否现在执行，不负责替代缓存身份。

### 2. 未启用和首次请求不是同一个状态

没有缓存且 `enabled: false` 时，查询通常是 `status: 'pending'`、`fetchStatus: 'idle'`。`pending` 只说明还
没有成功数据，不代表当前正在请求。

首次请求开始后，`fetchStatus` 变为 `fetching`，这时 `isLoading` 才为 `true`。它的定义是：

```ts
isLoading === isPending && isFetching
```

因此，惰性查询可以用 `isLoading` 显示“正在首次读取”，用 `isPending && fetchStatus === 'idle'` 显示“等待
有效条件”，不要把所有 `isPending` 都渲染成加载中。

### 3. 缓存会改变禁用查询的初始结果

如果当前 `queryKey` 已经有成功缓存，之后即使把 `enabled` 改为 `false`，观察者仍可以直接读取缓存数据并处于
成功状态。禁用只阻止自动执行，不会删除对应的 QueryCache 条目。

把条件重新设为同一个值时，查询可以先展示缓存，再根据当前配置决定是否需要重新获取。这也是把条件放入
`queryKey` 的原因：不同条件必须拥有不同的缓存身份。

## 四、用法与示例

### 1. 分离草稿条件和已提交条件

```tsx
function MessageSearch() {
  const [draftKeyword, setDraftKeyword] = useState('')
  const [submittedKeyword, setSubmittedKeyword] = useState('')
  const query = useQuery({
    queryKey: ['messages', submittedKeyword],
    queryFn: () => searchMessages(submittedKeyword),
    enabled: submittedKeyword.length > 0,
  })

  /** 提交有效条件后才让查询身份发生变化。 */
  function submit(): void {
    setSubmittedKeyword(draftKeyword.trim())
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); submit() }}>
      <input value={draftKeyword} onChange={(event) => setDraftKeyword(event.target.value)} />
      <button type="submit">搜索</button>
      {query.isLoading && <p>正在首次读取</p>}
      {query.isSuccess && <MessageList messages={query.data} />}
    </form>
  )
}
```

提交空字符串时，查询保持禁用；输入过程中只修改草稿，不触发 `queryFn`。提交有效条件后，`queryKey` 和
`enabled` 同时进入可执行状态，查询才开始第一次请求。

### 2. 使用回调读取当前 Query

需要根据缓存或 Query 状态决定是否启用时，`enabled` 也可以写成函数：

```tsx
const query = useQuery({
  queryKey: ['workspace', workspaceId],
  queryFn: () => loadWorkspace(workspaceId),
  enabled: (currentQuery) => currentQuery.queryKey[1] !== '',
})
```

回调应保持纯粹且便宜，只表达“现在是否允许这个查询运行”。如果条件来自用户表单，通常直接使用已经提交
的 React 状态更容易阅读。

### 3. 手动 refetch 的边界

`enabled: false` 不会让查询失去 `refetch` 方法。用户明确点击“重新查询”时，可以调用它；调用时不应
把新参数偷偷传给 `refetch`，因为参数应通过 React 状态和 `queryKey` 声明。需要变更查询条件时，更新已提交
条件，让新的 `queryKey` 描述新的请求。

```tsx
const query = useQuery({
  queryKey: ['report', submittedFilter],
  queryFn: () => loadReport(submittedFilter),
  enabled: submittedFilter !== '',
})

<button type="button" onClick={() => void query.refetch()} disabled={!query.isSuccess || query.isFetching}>
  重新读取
</button>
```

### 4. 禁用查询不是通用的请求模式

长期把所有查询设为 `enabled: false` 会放弃挂载、焦点、网络恢复等声明式能力，也不能响应普通的查询失效。
它适合等待用户提交条件的惰性查询；如果查询依赖其他状态，应让依赖状态进入 `queryKey` 或使用更明确的
声明式组合，而不是把所有请求都改成按钮驱动。

## 五、用法示例：提交条件后再查询

下面的 Demo 将输入草稿、已提交条件、查询状态和 QueryCache 条目同时展示。输入时不会请求；提交有效条件后
才会执行查询。清除已提交条件会回到无缓存的 `pending/idle` 状态，但之前的条件缓存仍留在 QueryCache 中；
重新提交相同条件可以观察缓存复用，并通过手动按钮验证 `refetch` 的边界。

:::demo{id="react.data.learn.basics.conditional-queries.conditional-query-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：把草稿输入直接放进 queryKey

**触发条件：** 输入框每变化一个字符，`queryKey` 就同步变化。

**原因：** 每个不同的 Key 都是新的查询身份，输入事件会连续创建查询并触发请求。

**后果：** 请求数量增加，未完成的词也会进入缓存，用户难以控制查询时机。

**错误示例：**

```tsx
const [keyword, setKeyword] = useState('')
useQuery({
  queryKey: ['messages', keyword],
  queryFn: () => searchMessages(keyword),
})
```

**正确写法：**

```tsx
const [draftKeyword, setDraftKeyword] = useState('')
const [submittedKeyword, setSubmittedKeyword] = useState('')
const query = useQuery({
  queryKey: ['messages', submittedKeyword],
  queryFn: () => searchMessages(submittedKeyword),
  enabled: submittedKeyword !== '',
})
```

**验证方式：** 只输入文字不提交，确认请求次数不增加；提交后再确认 queryFn 执行。

### 错误：用 isPending 表示正在请求

**触发条件：** 看到 `isPending` 就渲染完整加载占位。

**原因：** 未启用且无缓存的查询也会是 pending，但此时 fetchStatus 是 idle。

**后果：** 用户还没有提交条件时页面一直显示加载中，无法理解下一步操作。

**错误示例：**

```tsx
if (query.isPending) return <FullPageSpinner />
```

**正确写法：**

```tsx
if (query.isLoading) return <FullPageSpinner />
if (query.isPending && query.fetchStatus === 'idle') return <p>请先提交查询条件</p>
```

**验证方式：** 分别观察空条件和提交后的首次请求，确认前者是 pending/idle，后者才显示首次加载。

### 错误：把 enabled 当成缓存清理开关

**触发条件：** 条件变为空时期待旧条件的缓存被删除。

**原因：** enabled 只影响当前观察者是否自动获取，不会移除其他 queryKey 的缓存。

**后果：** 误以为缓存没有保留，重复提交相同条件时失去复用机会。

**错误示例：**

```tsx
setSubmittedKeyword('')
// 误以为 ['messages', 'release'] 的缓存已经被删除
```

**正确写法：**

```tsx
setSubmittedKeyword('')
const cached = queryClient.getQueryData(['messages', 'release'])
```

**验证方式：** 清除当前条件后查看 QueryCache，确认旧 Key 仍存在；是否删除应由 gcTime 或明确业务动作决定。

### 错误：用 refetch 传递新参数

**触发条件：** 希望使用同一个查询对象查询另一个筛选值。

**原因：** `refetch` 重新执行当前 Query，不接受新的业务参数来改变 queryKey。

**后果：** 查询身份、缓存数据和页面条件可能互相错位。

**错误示例：**

```tsx
await query.refetch({ queryKey: ['messages', nextKeyword] })
```

**正确写法：**

```tsx
setSubmittedKeyword(nextKeyword)
```

**验证方式：** 修改已提交条件后检查 QueryCache 中出现新的完整 Key，并确认请求使用新的条件。

### 错误：所有查询都永久禁用

**触发条件：** 为了避免重复请求，统一设置 `enabled: false`，再在各处手动调用 refetch。

**原因：** 这种做法把声明式查询改成命令式按钮流程，跳过了自动触发和失效协调。

**后果：** 页面重新可见、网络恢复或写操作失效后可能仍显示旧数据。

**错误示例：**

```tsx
useQuery({ queryKey: ['inbox'], queryFn: loadInbox, enabled: false })
```

**正确写法：**

```tsx
useQuery({ queryKey: ['inbox'], queryFn: loadInbox })
```

**验证方式：** 对照业务是否真的需要等待用户条件；没有条件依赖时移除 enabled，并观察默认生命周期触发器恢复。
:::

## 七、源码推导与适用场景

1. **官方事实：** 当前 Query Observer 在结果创建时将 `isLoading` 计算为 `isPending && isFetching`，并在自动
   挂载、焦点和重连判断中先检查 `enabled` 是否为 false。
2. **课程推导：** 条件查询应把“是否允许请求”与“请求什么”分别交给 `enabled` 和 `queryKey`；草稿状态不应
   直接成为已提交查询身份。
3. **适用边界：** `enabled` 适合惰性搜索、筛选和用户触发的读取；依赖多个远程结果、类型安全的条件函数或
   需要取消请求的场景应采用相应的数据层设计，不能仅靠一个布尔值解决。

## 八、练习

:::exercise
### 练习目标

**要求：** 将一个“按项目编号读取摘要”的查询改为提交后执行：输入框使用草稿状态，提交后才更新查询条件；
   空编号不请求，并在首次请求时显示加载提示。

**验收：** 输入但不提交时请求函数没有执行；提交非空编号后出现 `isLoading`；清空已提交编号后显示等待条件而
   不是加载中。

**参考答案：**

```tsx
import { useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'

type Summary = { title: string }

async function loadSummary(projectId: string): Promise<Summary> {
  const response = await fetch(`/api/projects/${projectId}/summary`)
  if (!response.ok) throw new Error('读取项目摘要失败')
  return response.json() as Promise<Summary>
}

export function ProjectSummary(): JSX.Element {
  const [draftProjectId, setDraftProjectId] = useState('')
  const [submittedProjectId, setSubmittedProjectId] = useState('')
  const query = useQuery({
    queryKey: ['project-summary', submittedProjectId],
    queryFn: () => loadSummary(submittedProjectId),
    enabled: submittedProjectId !== '',
  })

  /** 提交去空格后的项目编号。 */
  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    setSubmittedProjectId(draftProjectId.trim())
  }

  return (
    <form onSubmit={submit}>
      <label>
        项目编号
        <input
          value={draftProjectId}
          onChange={(event) => setDraftProjectId(event.target.value)}
        />
      </label>
      <button type="submit">读取摘要</button>
      <button type="button" onClick={() => setSubmittedProjectId('')}>
        清空条件
      </button>
      {query.isLoading && <p>正在读取摘要...</p>}
      {query.isPending && query.fetchStatus === 'idle' && <p>请先提交项目编号</p>}
      {query.isError && <p role="alert">{query.error.message}</p>}
      {query.isSuccess && <p>{query.data.title}</p>}
    </form>
  )
}
```
:::

## 九、本节小结

- 用 `queryKey` 描述查询条件，用 `enabled` 决定当前条件是否已经可以执行。
- 草稿输入和已提交条件分离，可以避免输入过程产生请求。
- `pending/idle` 表示尚未运行，`isLoading` 表示首次请求已经真正开始。
- 禁用查询不会自动响应生命周期和失效触发，但不会删除缓存，手动 `refetch` 仍然可用。

## 十、参考资料

- [Disabling/Pausing Queries](https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries) - 支持 enabled、惰性查询、禁用行为和 isLoading 语义。
- [useQuery Reference](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery) - 支持查询选项和结果状态字段。
- [Query Observer source](https://unpkg.com/@tanstack/query-core@5.102.8/src/queryObserver.ts) - 支持当前版本的派生状态与 enabled 判断。
