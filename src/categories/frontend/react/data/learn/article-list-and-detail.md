---
id: react.data.learn.basics.article-list-and-detail
type: lesson
title: 实战：文章列表与详情
summary: 用两条独立查询分别读取文章列表和选中文章的详情，并观察加载、错误、未选择和缓存复用。
domain: frontend
technology: react
module: data
stage: basics
level: beginner
estimatedMinutes: 55
prerequisites:
  - react.data.learn.basics.user-profile-panel
related:
  - react.data.learn.basics.query-key
  - react.data.learn.basics.query-status
  - react.data.learn.basics.query-error-handling
  - react.data.learn.basics.query-cache-and-sharing
  - react.data.learn.basics.conditional-queries
tags:
  - TanStack Query
  - queryKey
  - 文章列表
  - 文章详情
  - enabled
  - 缓存复用
appliesTo: TanStack Query 5.102.8、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 用两条 useQuery 分别读取文章列表和选中文章的详情。
  - 为列表和详情使用不同的 queryKey，避免两份数据互相覆盖。
  - 在尚未选择文章时禁用详情查询，并把它渲染成等待条件而不是首次加载。
  - 覆盖列表与详情的加载、成功、错误，以及再次选中同一篇文章时的缓存复用。
  - 说明选择驱动详情读取，但不把它扩展成依赖查询课程。
recap:
  - 列表缓存的是摘要数组，详情缓存的是单篇文章，二者必须使用不同的 queryKey。
  - 详情查询可以把选中的文章 id 放进 key，并在未选择时保持禁用。
  - 先处理未启用、加载和错误，再读取 data。
  - 再次选中同一篇文章时，详情观察者读取已有缓存，不会覆盖列表那一条。
  - 本课只组合已学的读取能力，不引入分页、Mutation、失效、预取或路由集成。
sources:
  - title: Query Keys
    url: https://tanstack.com/query/latest/docs/framework/react/guides/query-keys
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - queryKey 必须唯一描述正在读取的数据。
      - 列表可以用简单数组键，单条资源应把 id 放进 key。
      - 查询函数用到的变量应进入 queryKey，以便独立缓存。
  - title: Queries
    url: https://tanstack.com/query/latest/docs/framework/react/guides/queries
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 查询是绑定到唯一 key 的异步数据依赖。
      - 渲染通常先判断 isPending，再判断 isError，最后读取成功数据。
  - title: Disabling/Pausing Queries
    url: https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - enabled 为 false 且无缓存时是 pending/idle。
      - 禁用查询不会自动挂载请求。
  - title: Query Functions
    url: https://tanstack.com/query/latest/docs/framework/react/guides/query-functions
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - queryFn 成功时解析数据，失败时抛错。
      - fetch 不会为不成功的 HTTP 响应自动抛错，需要检查 response.ok。
  - title: Caching Examples
    url: https://tanstack.com/query/latest/docs/framework/react/guides/caching
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 相同 queryKey 的观察者读取同一缓存条目。
      - 不同 queryKey 对应不同的缓存数据。
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

# 实战：文章列表与详情

## 一、学习目标

- 用两条 `useQuery` 分别读取文章列表和选中文章的详情。
- 为列表和详情使用不同的 `queryKey`，避免两份数据互相覆盖。
- 在尚未选择文章时禁用详情查询，并把它渲染成等待条件而不是首次加载。
- 覆盖列表与详情的加载、成功、错误，以及再次选中同一篇文章时的缓存复用。
- 说明选择驱动详情读取，但不把它扩展成依赖查询课程。

## 二、为什么需要分开列表和详情

内容后台、文档站和课程目录都常见同一屏：左边是文章摘要，右边是当前选中篇的正文。这两份数据形状
不同。列表通常是短标题数组，详情是完整正文。如果它们共用一个 `queryKey`，后完成的那次请求会把
另一份数据挤掉。

选择一篇文章后再读取详情，只是把用户选择写成详情查询的条件和 key。列表查询并不依赖详情查询的
结果，因此这里仍然是两条并列的读取，而不是后一课才展开的依赖查询。

## 三、核心概念

### 1. 两份数据需要两条查询身份

官方文档把列表写成 `['todos']`，把单条资源写成 `['todo', 5]`。顶层数组不同，缓存条目就不同。文章
列表应使用稳定的列表键；详情应把文章 id 放进自己的键。

```tsx
const listQuery = useQuery({
  queryKey: ['articles'] as const,
  queryFn: loadArticles,
})

const detailQuery = useQuery({
  queryKey: ['article', selectedId] as const,
  queryFn: () => loadArticle(selectedId),
  enabled: selectedId.length > 0,
})
```

### 2. 选择只驱动详情查询

未选择文章时，详情没有有效身份，应保持 `enabled: false`。列表可以在进入面板后立即读取。选择变化
只会更换详情的 `queryKey`，不会要求列表重新解释自己的缓存。

这和“第二条查询必须等第一条成功才启用”不是同一件事。本课的详情条件来自用户点击，而不是来自列表
查询返回值。

### 3. 每条查询都有自己的状态

列表失败不应假装详情也失败；详情未启用也不应挡住列表。两边都按 `pending`、`error`、`success`
各自渲染。再次点开同一篇文章时，详情若已有缓存，可以直接显示，不必再发请求。

## 四、用法与示例

### 1. 先读列表，再按选择读详情

```tsx
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { useState } from 'react'

type ArticleSummary = {
  id: string
  title: string
}

type ArticleDetail = {
  id: string
  title: string
  body: string
}

/** 读取文章摘要列表。 */
async function loadArticles(signal: AbortSignal): Promise<ArticleSummary[]> {
  const response = await fetch('/api/articles', { signal })
  if (!response.ok) {
    throw new Error(`读取列表失败：${response.status}`)
  }
  return (await response.json()) as ArticleSummary[]
}

/** 读取单篇文章详情。 */
async function loadArticle(articleId: string, signal: AbortSignal): Promise<ArticleDetail> {
  const response = await fetch(`/api/articles/${articleId}`, { signal })
  if (!response.ok) {
    throw new Error(`读取详情失败：${response.status}`)
  }
  return (await response.json()) as ArticleDetail
}

/** 用两条独立查询展示列表和当前选中文章。 */
function ArticleWorkspace() {
  const [selectedId, setSelectedId] = useState('')
  const listQuery = useQuery({
    queryKey: ['articles'] as const,
    queryFn: ({ signal }) => loadArticles(signal),
    retry: false,
  })
  const detailQuery = useQuery({
    queryKey: ['article', selectedId] as const,
    queryFn: ({ signal }) => loadArticle(selectedId, signal),
    enabled: selectedId.length > 0,
    retry: false,
  })

  return (
    <section>
      {listQuery.isLoading && <p>正在读取列表</p>}
      {listQuery.isError && <p role="alert">{listQuery.error.message}</p>}
      {listQuery.isSuccess &&
        listQuery.data.map((article) => (
          <button key={article.id} type="button" onClick={() => setSelectedId(article.id)}>
            {article.title}
          </button>
        ))}
      {detailQuery.isPending && detailQuery.fetchStatus === 'idle' && <p>请选择一篇文章</p>}
      {detailQuery.isLoading && <p>正在读取详情</p>}
      {detailQuery.isError && <p role="alert">{detailQuery.error.message}</p>}
      {detailQuery.isSuccess && <p>{detailQuery.data.body}</p>}
    </section>
  )
}
```

### 2. 缓存复用发生在同一条详情身份上

先打开“查询键”，再打开另一篇，再回到“查询键”。详情 `queryKey` 变回 `['article', 原来的 id]` 后，
只要该条目还在当前 `QueryClient` 里，观察者会直接显示缓存正文。列表键始终是 `['articles']`，不会
因为选择变化而改成详情数据。

## 五、用法示例：可运行的列表与详情

下面的 Demo 用本地异步读取模拟接口。进入后先看列表加载和成功；选择一篇文章后看详情加载和正文；
打开缺失文章观察详情错误；模拟列表失败只影响列表。再次选择同一篇文章时，详情请求次数不增加。
离开页面会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.basics.article-list-and-detail.article-list-and-detail-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：列表和详情共用一个 queryKey

**触发条件：** 两条 `useQuery` 都写成 `['articles']`，或详情不把文章 id 放进 key。

**原因：** `queryKey` 是缓存身份。形状不同的数据如果共用同一身份，后完成的结果会覆盖先完成的结果。

**后果：** 详情正文把列表数组挤掉，或列表区渲染出单篇文章对象。

**错误示例：**

```tsx
const listQuery = useQuery({
  queryKey: ['articles'],
  queryFn: loadArticles,
})
const detailQuery = useQuery({
  queryKey: ['articles'],
  queryFn: () => loadArticle(selectedId),
  enabled: selectedId.length > 0,
})
```

**正确写法：**

```tsx
const listQuery = useQuery({
  queryKey: ['articles'] as const,
  queryFn: loadArticles,
})
const detailQuery = useQuery({
  queryKey: ['article', selectedId] as const,
  queryFn: () => loadArticle(selectedId),
  enabled: selectedId.length > 0,
})
```

**验证方式：** 同时观察两条 `queryKey`。列表成功后选择一篇文章，列表区仍是摘要数组，详情区才是正文。

### 错误：未选择文章也自动读取详情

**触发条件：** 详情查询始终启用，或把空字符串当成有效文章 id。

**原因：** 空身份仍会生成一条查询。请求会打到无效地址，并污染详情缓存。

**后果：** 面板一打开详情就失败，列表即使成功也无法安静展示。

**错误示例：**

```tsx
const detailQuery = useQuery({
  queryKey: ['article', selectedId],
  queryFn: () => loadArticle(selectedId),
})
```

**正确写法：**

```tsx
const detailQuery = useQuery({
  queryKey: ['article', selectedId],
  queryFn: () => loadArticle(selectedId),
  enabled: selectedId.length > 0,
})
```

**验证方式：** 进入面板后不点文章，确认详情 `status` 为 `pending`、请求次数为 0，并看到等待选择文案。

### 错误：用列表失败代替详情失败

**触发条件：** 只判断一个 `isError`，或把列表错误文案渲染到详情栏。

**原因：** 两条查询有各自的结果对象。列表 503 和详情 404 不是同一次失败。

**后果：** 用户无法判断该刷新列表还是换一篇文章。

**错误示例：**

```tsx
if (listQuery.isError || detailQuery.isError) {
  return <p role="alert">读取失败</p>
}
```

**正确写法：**

```tsx
{listQuery.isError && <p role="alert">{listQuery.error.message}</p>}
{detailQuery.isError && <p role="alert">{detailQuery.error.message}</p>}
```

**验证方式：** 模拟列表失败时，详情区仍保持未选择或已有详情；打开缺失文章时，列表仍显示成功摘要。

### 错误：把详情未启用渲染成列表加载

**触发条件：** 用同一个 `isPending` 控制整页转圈，不区分列表和详情。

**原因：** 详情在未选择时也是 `pending`。整页等待会把“列表已成功、详情还没选”藏起来。

**后果：** 列表数据已经可用，用户却看不到可点击的标题。

**错误示例：**

```tsx
if (listQuery.isPending || detailQuery.isPending) {
  return <p>正在读取</p>
}
```

**正确写法：**

```tsx
{listQuery.isLoading && <p>正在读取列表</p>}
{detailQuery.isPending && detailQuery.fetchStatus === 'idle' && <p>请选择一篇文章</p>}
{detailQuery.isLoading && <p>正在读取详情</p>}
```

**验证方式：** 列表成功后，详情区显示等待选择，而不是继续全页加载。

### 错误：把选择驱动写成查询结果驱动

**触发条件：** 用 `enabled: Boolean(listQuery.data?.[0])` 自动打开第一篇，并把它讲成依赖查询。

**原因：** 本课的详情条件来自用户选择。用列表结果自动启用第二条查询，会提前进入中级“依赖查询”
的模型。

**后果：** 学习者分不清“点击后读取详情”和“等列表成功再自动读另一条查询”。

**错误示例：**

```tsx
const detailQuery = useQuery({
  queryKey: ['article', listQuery.data?.[0]?.id],
  queryFn: () => loadArticle(listQuery.data![0].id),
  enabled: listQuery.isSuccess,
})
```

**正确写法：**

```tsx
const [selectedId, setSelectedId] = useState('')
const detailQuery = useQuery({
  queryKey: ['article', selectedId],
  queryFn: () => loadArticle(selectedId),
  enabled: selectedId.length > 0,
})
```

**验证方式：** 列表成功后详情仍等待点击；只有用户选择后，详情 `queryKey` 才带上文章 id。
:::

## 七、源码推导与适用场景

1. **官方事实：** `queryKey` 必须唯一描述数据；列表可用 `['todos']`，单条资源应包含 id。禁用且无缓存
   时为 `pending/idle`。`fetch` 必须检查 `response.ok`。相同 key 共享缓存，不同 key 保存不同数据。
2. **课程推导：** 文章工作区是两条并列读取。用户选择只改详情的条件和身份，不把列表结果写成详情的
   前置查询。再次打开同一篇文章时，复用的是详情那一条缓存。
3. **适用边界：** 本课不讲解分页、无限查询、Mutation、查询失效、乐观更新、预取、Router 集成，也不
   把选择驱动展开成依赖查询专题。

## 八、练习

:::exercise
### 练习目标

**要求：** 编写文章工作区：稳定 `QueryClient` 包裹组件；列表查询使用 `['articles']`；详情查询使用
`['article', selectedId]`，未选择时禁用；两条 `queryFn` 都检查 `response.ok`；分别渲染列表和详情的
加载、错误、成功；详情在未选择时显示等待文案。

**验收：** 列表和详情的 `queryKey` 不同；未选择时详情不发请求；选择有效文章后出现正文；缺失文章走
详情错误且列表仍成功；再次选择同一篇可复用详情缓存。

**参考答案：**

```tsx
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { useState, type ReactElement } from 'react'

type ArticleSummary = {
  id: string
  title: string
}

type ArticleDetail = {
  id: string
  title: string
  body: string
}

/** 读取文章摘要列表。 */
async function loadArticles(signal: AbortSignal): Promise<ArticleSummary[]> {
  const response = await fetch('/api/articles', { signal })
  if (!response.ok) {
    throw new Error(`读取列表失败：${response.status}`)
  }
  return (await response.json()) as ArticleSummary[]
}

/** 读取单篇文章详情。 */
async function loadArticle(articleId: string, signal: AbortSignal): Promise<ArticleDetail> {
  const response = await fetch(`/api/articles/${articleId}`, { signal })
  if (!response.ok) {
    throw new Error(`读取详情失败：${response.status}`)
  }
  return (await response.json()) as ArticleDetail
}

/** 用两条独立查询渲染列表和详情。 */
function ArticleWorkspace(): ReactElement {
  const [selectedId, setSelectedId] = useState('')
  const listQuery = useQuery({
    queryKey: ['articles'] as const,
    queryFn: ({ signal }) => loadArticles(signal),
    retry: false,
  })
  const detailQuery = useQuery({
    queryKey: ['article', selectedId] as const,
    queryFn: ({ signal }) => loadArticle(selectedId, signal),
    enabled: selectedId.length > 0,
    retry: false,
  })

  return (
    <section>
      {listQuery.isLoading && <p>正在读取列表</p>}
      {listQuery.isError && <p role="alert">{listQuery.error.message}</p>}
      {listQuery.isSuccess &&
        listQuery.data.map((article) => (
          <button key={article.id} type="button" onClick={() => setSelectedId(article.id)}>
            {article.title}
          </button>
        ))}
      {detailQuery.isPending && detailQuery.fetchStatus === 'idle' && <p>请选择一篇文章</p>}
      {detailQuery.isLoading && <p>正在读取详情</p>}
      {detailQuery.isError && <p role="alert">{detailQuery.error.message}</p>}
      {detailQuery.isSuccess && <p>{detailQuery.data.body}</p>}
    </section>
  )
}

/** 提供稳定客户端，避免列表和详情缓存在重渲染时丢失。 */
export function App(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <ArticleWorkspace />
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- 列表和详情是两份数据，必须使用两条 `queryKey`。
- 用户选择只决定详情能不能读、读哪一篇，不会改写列表缓存。
- 未选择时详情保持 `pending/idle`；列表和详情的错误要分开显示。
- 再次打开同一篇文章时，复用的是详情缓存。
- 选择驱动不是依赖查询课程，也不包含分页、写入或失效。

## 十、参考资料

- [Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys) - 支持列表键与带 id 的详情键。
- [Queries](https://tanstack.com/query/latest/docs/framework/react/guides/queries) - 支持查询声明和状态分支。
- [Disabling/Pausing Queries](https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries) - 支持未选择时禁用详情查询。
- [Query Functions](https://tanstack.com/query/latest/docs/framework/react/guides/query-functions) - 支持 fetch 与抛错。
- [Caching Examples](https://tanstack.com/query/latest/docs/framework/react/guides/caching) - 支持不同 queryKey 的独立缓存。
- [QueryClientProvider](https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider) - 支持查询客户端作用域。
- [Response.ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok) - 支持用 HTTP 状态判断响应是否可用。
