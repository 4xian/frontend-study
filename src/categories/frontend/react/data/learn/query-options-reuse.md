---
id: react.data.learn.intermediate.query-options-reuse
type: lesson
title: 查询配置复用
summary: 用 queryOptions 把 queryKey 与 queryFn 收进同一份配置，让多处观察者复用同一查询身份。
domain: frontend
technology: react
module: data
stage: intermediate
level: intermediate
estimatedMinutes: 45
prerequisites:
  - react.data.learn.intermediate.query-key-organization
related:
  - react.data.learn.basics.first-use-query
  - react.data.learn.basics.typescript-queries
  - react.data.learn.intermediate.query-key-organization
tags:
  - TanStack Query
  - queryOptions
  - 查询配置复用
  - select
  - queryKey
appliesTo: TanStack Query 5.102.8、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 能用 queryOptions 把 queryKey、queryFn 和共用选项写在一处。
  - 能把这份配置传给多个 useQuery，而不是各处手写一份查询身份。
  - 能用 options.queryKey 读取缓存，而不是再手打一组数组。
  - 能在组件层覆盖 select，让不同观察者看到不同切片，同时缓存仍保存完整数据。
  - 能说明 queryOptions 在运行时只返回传入对象，类型推断才是它的主要价值。
recap:
  - queryOptions 把 queryKey 和 queryFn 收在同一份对象里，避免两处各写一套。
  - 多处 useQuery 应展开同一份配置，而不是复制字面量。
  - 读取缓存时使用 options.queryKey，不要再手打数组。
  - 组件层可以覆盖 select，缓存里仍是 queryFn 返回的完整数据。
  - 本课只复用读取配置，不引入失效、并行查询或写入。
sources:
  - title: Query Options
    url: https://tanstack.com/query/latest/docs/framework/react/guides/query-options
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - queryOptions 用来在多处共享 queryKey 与 queryFn，并让它们保持共置。
      - 运行时这个辅助函数原样返回传入的对象。
      - 同一份配置可以传给 useQuery，组件层仍可覆盖 select。
  - title: TypeScript
    url: https://tanstack.com/query/latest/docs/framework/react/typescript
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 抽出查询选项后，用 queryOptions 才能保住类型推断。
      - queryOptions 返回的 queryKey 携带 queryFn 的数据类型。
      - getQueryData 接收这份 queryKey 时，结果类型不再是 unknown。
  - title: Prefer the use of queryOptions
    url: https://tanstack.com/query/latest/docs/eslint/prefer-query-options
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 把 queryKey 和 queryFn 拆开写，容易让同一 key 配上不同的 queryFn。
      - QueryClient 方法应复用 queryOptions 结果上的 queryKey。
  - title: queryOptions source
    url: https://unpkg.com/@tanstack/react-query@5.102.8/src/queryOptions.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - queryOptions 的实现是直接返回传入的 options。
---

# 查询配置复用

## 一、学习目标

- 用 `queryOptions` 把 `queryKey`、`queryFn` 和共用选项写在一处。
- 把这份配置传给多个 `useQuery`，而不是各处手写一份查询身份。
- 用 `options.queryKey` 读取缓存，而不是再手打一组数组。
- 在组件层覆盖 `select`，让不同观察者看到不同切片，同时缓存仍保存完整数据。
- 说明 `queryOptions` 在运行时只返回传入对象，类型推断才是它的主要价值。

## 二、为什么需要查询配置复用

上一课已经能用工厂拼出稳定的 `queryKey`。页面变多以后，新的问题是：同一份查询会在列表旁路、详情卡片、缓存读取里各写一次。`queryKey` 工厂只能统一身份数组，不能保证每次都带上同一份 `queryFn` 和同一组共用选项。

如果一处写 `queryKey: articleKeys.detail(id)` 配 `loadArticle`，另一处再手写同一组 key 却配了另一个函数，运行时仍会把它当成同一条查询。缓存身份对上了，读取逻辑却可能对不上。

`queryOptions` 的目标是：把 `queryKey` 和 `queryFn` 收进同一份对象。需要声明查询时展开它，需要读取缓存时使用它返回的 `queryKey`。

## 三、核心概念

### 1. queryOptions 只是把选项收成一份对象

官方文档把 `queryOptions` 写成共享 `queryKey` 与 `queryFn` 的辅助函数。运行时它原样返回传入的对象，不会改写请求，也不会创建新的查询 API：

```tsx
import { queryOptions } from '@tanstack/react-query'

function articleOptions(id: string) {
  return queryOptions({
    queryKey: articleKeys.detail(id),
    queryFn: loadArticleDetail,
    staleTime: 5 * 1000,
  })
}
```

组件里写 `useQuery(articleOptions(id))`。不要在一处写 `queryKey`，另一处再单独发明一份 `queryFn`。

### 2. 同一份配置可以给多个观察者

完整观察者直接使用这份配置。另一个观察者可以展开后再覆盖 `select`，只取出当前界面需要的字段：

```tsx
const query = useQuery({
  ...articleOptions(id),
  select: (article) => article.title,
})
```

`select` 只改变这个观察者看到的 `data`。缓存里仍是 `queryFn` 返回的完整对象。两个观察者共享同一条查询身份，因此不会各发一次互不相认的请求。

### 3. 读取缓存时也走同一份 queryKey

`queryOptions` 返回的 `queryKey` 携带 `queryFn` 的数据类型。把这份 key 交给 `getQueryData`，结果类型会跟着查询数据走，而不是退回 `unknown`：

```tsx
const cached = queryClient.getQueryData(articleOptions(id).queryKey)
```

不要再手打 `['articles', 'detail', id]`。配置对象才是查询身份的单一来源。

本课用 `getQueryData` 核对该身份。按这份配置作废缓存、预取或命令式请求属于后续能力。

## 四、用法与示例

### 1. 抽出一份可复用的文章配置

```tsx
import { QueryClient, QueryClientProvider, queryOptions, useQuery } from '@tanstack/react-query'
import { useState } from 'react'

const articleKeys = {
  all: ['articles'] as const,
  details: () => [...articleKeys.all, 'detail'] as const,
  detail: (id: string) => [...articleKeys.details(), id] as const,
}

type ArticleDetail = {
  id: string
  title: string
  body: string
}

/** 按详情 key 读取文章。 */
async function loadArticle(articleId: string, signal: AbortSignal): Promise<ArticleDetail> {
  const response = await fetch(`/api/articles/${articleId}`, { signal })
  if (!response.ok) {
    throw new Error(`读取详情失败：${response.status}`)
  }
  return (await response.json()) as ArticleDetail
}

/** 把文章详情的 queryKey 与 queryFn 收进同一份配置。 */
function articleOptions(articleId: string) {
  return queryOptions({
    queryKey: articleKeys.detail(articleId),
    queryFn: ({ signal }) => loadArticle(articleId, signal),
  })
}

/** 用同一份配置分别声明完整观察者和标题摘要。 */
function ArticleBoard() {
  const [articleId, setArticleId] = useState('a-cache')
  const sharedOptions = articleOptions(articleId)
  const detailQuery = useQuery(sharedOptions)
  const titleQuery = useQuery({
    ...sharedOptions,
    select: (article) => article.title,
  })

  return (
    <section>
      <button type="button" onClick={() => setArticleId('a-key')}>
        查询键
      </button>
      {detailQuery.isSuccess && <p>{detailQuery.data.body}</p>}
      {titleQuery.isSuccess && <p>{titleQuery.data}</p>}
    </section>
  )
}
```

两处观察者展开同一份 `articleOptions`。切换文章只更换这份配置里的 id，不会让完整观察者和摘要观察者各写一套 key。

### 2. 用配置上的 queryKey 读取缓存

```tsx
import { useQueryClient } from '@tanstack/react-query'

/** 在已经取得 QueryClient 的组件里读取这份配置对应的缓存。 */
function CachedArticleTitle({ articleId }: { articleId: string }) {
  const queryClient = useQueryClient()
  const cached = queryClient.getQueryData(articleOptions(articleId).queryKey)

  return <p>{cached ? cached.title : '尚未写入'}</p>
}
```

`getQueryData` 拿到的是完整文章，不是摘要观察者选出的标题。`select` 不会改写缓存条目。

## 五、用法示例：观察配置复用与缓存切片

下面的 Demo 用 `queryOptions` 声明同一篇文章。完整观察者显示标题和正文，摘要观察者只选出标题。上方对照共享 `queryKey`、请求次数，以及用 `options.queryKey` 读到的缓存标题。切换另一篇文章会更换配置身份；再切回已经成功的那一篇时，请求次数不增加。离开页面会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.intermediate.query-options-reuse.query-options-reuse-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：queryKey 和 queryFn 拆开各写一份

**触发条件：** 组件里手写 `queryKey`，自定义 Hook 里再写另一份 `queryFn`，只靠人记住它们属于同一查询。

**原因：** 缓存只认 `queryKey`。两处数组碰巧相同，就会共用一条缓存；函数却可能已经漂移。

**后果：** 界面读到的数据和实际请求函数不再对应，排错时很难看出是身份重合还是函数写错。

**错误示例：**

```tsx
useQuery({
  queryKey: ['articles', 'detail', articleId],
  queryFn: loadArticleDetail,
})
useQuery({
  queryKey: ['articles', 'detail', articleId],
  queryFn: loadArticleSummary,
})
```

**正确写法：**

```tsx
const sharedOptions = articleOptions(articleId)
useQuery(sharedOptions)
useQuery({
  ...sharedOptions,
  select: (article) => article.title,
})
```

**验证方式：** 两处展开的 `JSON.stringify(options.queryKey)` 必须相同，并且只有一份 `queryFn` 定义。

### 错误：读取缓存时再手打一组 key

**触发条件：** 声明查询时用 `articleOptions(id)`，读取缓存时却写成 `getQueryData(['articles', 'detail', id])`。

**原因：** 把 `queryKey` 当成可以随手复制的标签，而不是配置对象上的字段。

**后果：** 工厂或配置一改，声明查询和读取缓存就会各认各的身份。

**错误示例：**

```tsx
queryClient.getQueryData(['articles', 'detail', articleId])
```

**正确写法：**

```tsx
queryClient.getQueryData(articleOptions(articleId).queryKey)
```

**验证方式：** 页面展示的共享 queryKey 与 `getQueryData` 使用的 key 必须是同一份数组。

### 错误：以为 queryOptions 会改变请求行为

**触发条件：** 把 `queryOptions` 理解成新的请求 API，或以为它会自动合并、去重、改写 `queryFn`。

**原因：** 辅助函数的名字像能力，实际实现只是返回传入对象。

**后果：** 误以为包了一层就能少写 `QueryClientProvider`，或指望它单独完成缓存共享。

**错误示例：**

```tsx
const result = queryOptions({
  queryKey: articleKeys.detail(articleId),
  queryFn: loadArticleDetail,
})
```

**正确写法：**

```tsx
const sharedOptions = articleOptions(articleId)
useQuery(sharedOptions)
```

**验证方式：** 离开 `useQuery` 后，`queryOptions` 本身不会发起请求，也不会往缓存写入数据。

### 错误：以为 select 会改写缓存里的数据

**触发条件：** 一个观察者使用 `select` 只取出标题，就认为缓存里也只剩标题。

**原因：** 把观察者看到的 `data` 和 QueryCache 中的查询数据当成同一份对象。

**后果：** 另一个完整观察者读不到正文，或用 `getQueryData` 时发现仍是完整对象而误以为配置失效。

**错误示例：**

```tsx
useQuery({
  ...articleOptions(articleId),
  select: (article) => article.title,
})
```

**正确写法：**

```tsx
useQuery(articleOptions(articleId))
useQuery({
  ...articleOptions(articleId),
  select: (article) => article.title,
})
```

**验证方式：** 摘要观察者的 `data` 是标题字符串；`getQueryData(options.queryKey)` 仍返回带 `body` 的完整文章。

### 错误：为每个组件复制一份几乎相同的配置

**触发条件：** 卡片组件和摘要组件各自再写一遍 `queryOptions`，只是 `staleTime` 或 `queryFn` 略有不同。

**原因：** 把“可以抽出配置”理解成“每个调用点都新建一份配置函数”。

**后果：** 同一篇文章出现两套选项，缓存共享和类型推断都会重新分裂。

**错误示例：**

```tsx
function cardOptions(id: string) {
  return queryOptions({
    queryKey: articleKeys.detail(id),
    queryFn: loadArticleDetail,
  })
}

function titleOptions(id: string) {
  return queryOptions({
    queryKey: articleKeys.detail(id),
    queryFn: loadArticleTitle,
  })
}
```

**正确写法：**

```tsx
function articleOptions(id: string) {
  return queryOptions({
    queryKey: articleKeys.detail(id),
    queryFn: loadArticleDetail,
  })
}
```

**验证方式：** 完整观察者和摘要观察者都展开同一份 `articleOptions`；请求次数不因多挂一个 `select` 观察者而再加一次互不相认的请求。
:::

## 七、源码推导与适用场景

1. **官方事实：** `queryOptions` 用来把 `queryKey` 和 `queryFn` 共置到一份对象中，并在多处复用。运行时它原样返回传入对象。抽出选项后，用它才能保住 TypeScript 推断；返回的 `queryKey` 携带查询数据类型，`getQueryData` 可以读出对应结果。组件层仍可覆盖 `select`。源码实现是 `return options`。
2. **课程推导：** 上一课的 key 工厂负责拼数组；本课的 `queryOptions` 负责把数组和请求函数收成一份合同。多处观察者应展开同一份合同，需要不同界面切片时只覆盖 `select`。
3. **适用边界：** 本课不讲解 `useQueries`、`useSuspenseQuery`、`infiniteQueryOptions`、`queryClient.query` 或查询失效。ESLint 规则 `prefer-query-options` 只说明官方为什么推荐这种写法，不是本课依赖。

## 八、练习

:::exercise
### 练习目标

**要求：** 编写 `articleOptions(id)`，内部使用 `queryOptions` 收纳 `articleKeys.detail(id)` 与读取函数。用 `QueryClientProvider` 包裹组件；一处 `useQuery(articleOptions(id))` 显示正文，另一处展开同一份配置并用 `select` 只取出标题。再用 `getQueryData(articleOptions(id).queryKey)` 读取缓存中的完整文章标题。

**验收：** 两处观察者的 queryKey 相同；摘要观察者的 data 是标题；缓存中仍能读到完整文章的标题；不要为摘要观察者另写一个 queryFn。

**参考答案：**

```tsx
import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useState, type ReactElement } from 'react'

type ArticleDetail = {
  id: string
  title: string
  body: string
}

const articleKeys = {
  all: ['articles'] as const,
  details: () => [...articleKeys.all, 'detail'] as const,
  detail: (id: string) => [...articleKeys.details(), id] as const,
}

/** 读取单篇文章详情。 */
async function loadArticle(articleId: string, signal: AbortSignal): Promise<ArticleDetail> {
  const response = await fetch(`/api/articles/${articleId}`, { signal })
  if (!response.ok) {
    throw new Error(`读取详情失败：${response.status}`)
  }
  return (await response.json()) as ArticleDetail
}

/** 把文章详情的 queryKey 与 queryFn 收进同一份配置。 */
function articleOptions(articleId: string) {
  return queryOptions({
    queryKey: articleKeys.detail(articleId),
    queryFn: ({ signal }) => loadArticle(articleId, signal),
    retry: false,
  })
}

/** 用同一份配置渲染完整文章、标题摘要和缓存读数。 */
function ArticleOptionsBoard(): ReactElement {
  const [articleId, setArticleId] = useState('a-cache')
  const queryClient = useQueryClient()
  const sharedOptions = articleOptions(articleId)
  const detailQuery = useQuery(sharedOptions)
  const titleQuery = useQuery({
    ...sharedOptions,
    select: (article) => article.title,
  })
  const cached = queryClient.getQueryData(sharedOptions.queryKey)

  return (
    <section>
      <button type="button" onClick={() => setArticleId('a-key')}>
        查询键
      </button>
      {detailQuery.isSuccess && <p>{detailQuery.data.body}</p>}
      {titleQuery.isSuccess && <p>{titleQuery.data}</p>}
      <p>缓存标题：{cached ? cached.title : '尚未写入'}</p>
    </section>
  )
}

/** 提供稳定客户端，避免复用配置时丢失缓存。 */
export function App(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <ArticleOptionsBoard />
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- `queryOptions` 把 `queryKey` 和 `queryFn` 收进同一份对象。
- 多处观察者应展开同一份配置，而不是复制字面量。
- 读取缓存时使用 `options.queryKey`。
- 组件层覆盖 `select` 只改变观察者看到的数据，不改写缓存。
- 运行时它只返回传入对象；先把配置复用看清楚，再考虑失效或并行查询。

## 十、参考资料

- [Query Options](https://tanstack.com/query/latest/docs/framework/react/guides/query-options) - 支持把 queryKey 与 queryFn 收进可复用对象。
- [TypeScript](https://tanstack.com/query/latest/docs/framework/react/typescript) - 支持抽出选项后保住类型推断。
- [Prefer the use of queryOptions](https://tanstack.com/query/latest/docs/eslint/prefer-query-options) - 支持把 key 与函数共置，并复用配置上的 queryKey。
- [queryOptions 源码](https://unpkg.com/@tanstack/react-query@5.102.8/src/queryOptions.ts) - 支持运行时原样返回传入对象。
