---
id: react.data.learn.intermediate.query-key-organization
type: lesson
title: Query Key 组织
summary: 用层次化数组和小型工厂统一列表、筛选与详情的 queryKey，并观察前缀匹配与精确匹配。
domain: frontend
technology: react
module: data
stage: intermediate
level: intermediate
estimatedMinutes: 45
prerequisites:
  - react.data.learn.basics.article-list-and-detail
related:
  - react.data.learn.basics.query-key
  - react.data.learn.basics.query-cache-and-sharing
  - react.data.learn.basics.article-list-and-detail
tags:
  - TanStack Query
  - queryKey
  - Query Key 组织
  - query key factory
  - 前缀匹配
  - exact
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-10
objectives:
  - 能把同一资源的列表、筛选和详情写成共享前缀的层次化 queryKey。
  - 能用小型工厂函数集中拼出这些 key，避免各处手写字面量。
  - 能说明默认按前缀匹配、精确匹配只命中完整相同的那一条。
  - 能为不同资源使用不同的根前缀，避免一次匹配误伤另一份数据。
  - 能在 Demo 中对照当前 key 与匹配结果，而不是靠记忆零散字符串。
recap:
  - 同一资源的 queryKey 应共享稳定前缀，并用 list 与 detail 分段。
  - 筛选条件和实体 id 放在对应层次，不要让详情和列表抢同一个身份。
  - 工厂函数负责拼出同一套数组，避免各处手写字面量。
  - 默认按前缀匹配，精确匹配只命中完整相同的那一条。
  - 本课只组织读取身份，不引入配置复用、失效或写入。
sources:
  - title: Query Keys
    url: https://tanstack.com/query/latest/docs/framework/react/guides/query-keys
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - Query Key 顶层必须是数组，并唯一描述查询数据。
      - 层次化资源可以把 id 放进数组，筛选条件可以放进后续对象。
      - 列表与单条资源应使用能区分彼此的数组结构。
  - title: Filters
    url: https://tanstack.com/query/latest/docs/framework/react/guides/filters
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - queryKey 过滤器默认按前缀包容匹配。
      - exact 为 true 时只返回与传入 queryKey 完全相同的那一条。
      - getQueriesData、removeQueries、refetchQueries 都使用同一套 QueryFilters。
  - title: Query Invalidation
    url: https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 传入较短的 queryKey 可以匹配所有以该数组为前缀的查询。
      - 更具体的 queryKey 只匹配带有相同后续项的查询，不会回过头匹配更短的 key。
      - exact 为 true 时，根 key 不会匹配带筛选对象的子 key。
  - title: QueryClient.getQueriesData
    url: https://unpkg.com/@tanstack/query-core@5.102.8/build/modern/hydration-Bjs0MSgg.d.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - getQueriesData 接受 QueryFilters，并返回匹配到的 queryKey 与数据对。
---

# Query Key 组织

## 一、学习目标

- 把同一资源的列表、筛选和详情写成共享前缀的层次化 `queryKey`。
- 用小型工厂函数集中拼出这些 key，避免各处手写字面量。
- 说明默认按前缀匹配、精确匹配只命中完整相同的那一条。
- 为不同资源使用不同的根前缀，避免一次匹配误伤另一份数据。
- 在 Demo 中对照当前 key 与匹配结果，而不是靠记忆零散字符串。

## 二、为什么需要组织 Query Key

基础课已经能给固定资源、筛选列表和详情写出数组形式的 `queryKey`。页面变多以后，问题不再是“会不会写成数组”，而是同一资源的 key 是否还指向同一棵树。

如果列表写成 `['articles']`，详情写成 `['article', id]`，筛选写成 `['published-articles']`，三处看起来都能工作，却没有共享前缀。之后若要按资源范围查看或操作缓存，只能靠人记住这些字符串。拼写稍有漂移，两份本该相关的数据就会变成两棵互不相认的树。

组织 Query Key 的目标是：同一资源共享稳定根前缀，列表和详情用固定分段区分，筛选条件和实体 id 放在对应层次。这样当前查询身份清楚，后续按前缀观察缓存时也有稳定入口。

## 三、核心概念

### 1. 用层次表达资源树

官方文档把列表写成 `['todos']`，把单条资源写成 `['todo', 5]`，把带选项的列表写成 `['todos', { type: 'done' }]`。数组从左到右越来越具体：根资源、关系分段、再是筛选或 id。

中级阶段建议把“列表集合”和“详情集合”也写成稳定分段，这样既可以按整棵资源树匹配，也可以只匹配列表或只匹配详情：

```tsx
['articles'] // 整棵文章树的根前缀
['articles', 'list'] // 所有文章列表
['articles', 'list', { status: 'published' }] // 一篇筛选后的列表
['articles', 'detail'] // 所有文章详情
['articles', 'detail', 'a-cache'] // 某一篇详情
```

`['articles', 'list', { status: 'published' }]` 和 `['articles', 'detail', 'a-cache']` 都从 `['articles']` 长出来，但它们不再挤在同一层。

### 2. 工厂只负责拼出同一套数组

工厂不是新的查询 API。它只是一组返回 `queryKey` 的函数，让组件、查询函数和匹配过滤器使用同一份结构：

```tsx
const articleKeys = {
  all: ['articles'] as const,
  lists: () => [...articleKeys.all, 'list'] as const,
  list: (filters: { status: 'all' | 'published' }) => [...articleKeys.lists(), filters] as const,
  details: () => [...articleKeys.all, 'detail'] as const,
  detail: (id: string) => [...articleKeys.details(), id] as const,
}
```

组件里写 `queryKey: articleKeys.list({ status })`，匹配时写 `queryKey: articleKeys.lists()`。不要在一处写 `['articles','list']`，另一处再手打 `'article-list'`。

社区有专门的 Query Key Factory 包，官方 Query Keys 文档也把它列为扩展阅读。本课只使用上面这种最小工厂；不把第三方包装成课程依赖。

### 3. 默认前缀匹配，精确匹配要显式打开

`QueryFilters` 里的 `queryKey` 默认按前缀包容匹配。`queryClient.getQueriesData({ queryKey: ['articles'] })` 会看到所有以 `['articles']` 开头的查询。本课 Demo 再加上 `type: 'active'`，只观察当前仍被挂载的查询。

更短的 key 可以覆盖更长的 key；更长的 key 不会回过头匹配更短的 key。`['articles', 'list']` 能匹配 `['articles', 'list', { status: 'published' }]`，但不会匹配 `['articles']` 自己，也不会匹配 `['articles', 'detail', id]`。

传入 `exact: true` 后，只有完整相同的那一条会被选中。`{ queryKey: ['articles'], exact: true }` 不会包含任何带有 `list` 或 `detail` 后续项的查询。

本课用 `getQueriesData` 观察这套匹配规则。按前缀作废缓存、触发重新获取属于后续能力，这里只把身份树搭好。

### 4. 不同资源使用不同根前缀

文章和评论不是同一份数据。评论应使用自己的根，例如 `['comments']`，而不是挂到 `['articles', articleId, 'comments']` 后再和文章详情抢同一段前缀语义。文章树的前缀匹配不应把评论一起扫进去。

## 四、用法与示例

### 1. 用工厂声明列表和详情

```tsx
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { useState } from 'react'

type ArticleStatus = 'all' | 'published'

const articleKeys = {
  all: ['articles'] as const,
  lists: () => [...articleKeys.all, 'list'] as const,
  list: (filters: { status: ArticleStatus }) => [...articleKeys.lists(), filters] as const,
  details: () => [...articleKeys.all, 'detail'] as const,
  detail: (id: string) => [...articleKeys.details(), id] as const,
}

/** 按筛选条件读取文章列表。 */
async function loadArticles(
  filters: { status: ArticleStatus },
  signal: AbortSignal,
): Promise<{ id: string; title: string }[]> {
  const response = await fetch(`/api/articles?status=${filters.status}`, { signal })
  if (!response.ok) {
    throw new Error(`读取列表失败：${response.status}`)
  }
  return (await response.json()) as { id: string; title: string }[]
}

/** 读取单篇文章详情。 */
async function loadArticle(articleId: string, signal: AbortSignal): Promise<{ body: string }> {
  const response = await fetch(`/api/articles/${articleId}`, { signal })
  if (!response.ok) {
    throw new Error(`读取详情失败：${response.status}`)
  }
  return (await response.json()) as { body: string }
}

/** 已选择文章后才声明详情查询，避免空 id 进入缓存。 */
function SelectedArticleDetail({ articleId }: { articleId: string }) {
  const detailQuery = useQuery({
    queryKey: articleKeys.detail(articleId),
    queryFn: ({ signal }) => loadArticle(articleId, signal),
  })
  if (!detailQuery.isSuccess) {
    return null
  }
  return <p>{detailQuery.data.body}</p>
}

/** 用同一套工厂分别声明列表查询和详情查询。 */
function ArticleBoard() {
  const [status, setStatus] = useState<ArticleStatus>('all')
  const [selectedId, setSelectedId] = useState('')
  const listQuery = useQuery({
    queryKey: articleKeys.list({ status }),
    queryFn: ({ signal }) => loadArticles({ status }, signal),
  })

  return (
    <section>
      <button type="button" onClick={() => setStatus('published')}>
        已发布
      </button>
      {listQuery.isSuccess &&
        listQuery.data.map((article) => (
          <button key={article.id} type="button" onClick={() => setSelectedId(article.id)}>
            {article.title}
          </button>
        ))}
      {selectedId ? <SelectedArticleDetail articleId={selectedId} /> : null}
    </section>
  )
}
```

列表 key 始终带 `list` 分段和筛选对象；详情 key 始终带 `detail` 分段和文章 id。切换筛选只更换列表那一条，不会把详情改写成列表数据。没有选中文章时不要声明详情查询，空字符串不应成为 `detail` 分段后面的身份。

### 2. 用 getQueriesData 核对前缀

```tsx
import { useQueryClient } from '@tanstack/react-query'

/** 在已经取得 QueryClient 的组件里读取匹配到的 queryKey。 */
function MatchedKeys() {
  const queryClient = useQueryClient()
  const prefixAll = queryClient
    .getQueriesData({ queryKey: articleKeys.all })
    .map(([matchedKey]) => JSON.stringify(matchedKey))
  const prefixLists = queryClient
    .getQueriesData({ queryKey: articleKeys.lists() })
    .map(([matchedKey]) => JSON.stringify(matchedKey))
  const exactAll = queryClient
    .getQueriesData({ queryKey: articleKeys.all, exact: true })
    .map(([matchedKey]) => JSON.stringify(matchedKey))

  return (
    <p>
      前缀 all：{prefixAll.join(' / ') || '无'}；前缀 lists：{prefixLists.join(' / ') || '无'}；精确
      all：{exactAll.join(' / ') || '无'}
    </p>
  )
}
```

前缀 `articleKeys.all` 应看到列表和详情。前缀 `articleKeys.lists()` 只应看到列表。精确匹配 `articleKeys.all` 在没有恰好声明 `['articles']` 这条查询时是空的。

不要在这个阶段调用 `invalidateQueries` 来“证明”匹配；先把能被匹配到的 key 看清楚。

## 五、用法示例：观察层次化 key 与匹配范围

下面的 Demo 用文章工厂和评论工厂分别声明查询。进入后先看当前这一条列表 key；选择一篇文章后出现详情 key 和评论 key。下方对照当前前缀匹配和精确匹配的结果。切换筛选会换成另一条列表身份，不会同时挂两条列表。再次选中同一篇文章时，详情请求次数不增加。离开页面会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.intermediate.query-key-organization.query-key-organization-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：列表和详情挤在同一层

**触发条件：** 列表使用 `['articles']`，详情使用 `['articles', id]`，中间没有 `list` 或 `detail` 分段。

**原因：** 根前缀直接兼作列表身份。按 `['articles']` 匹配时，列表和详情会混在一起；又没有单独的列表前缀可以只选中列表。

**后果：** 本想观察或操作全部列表时，详情会被一起选中；本想只处理详情时，找不到稳定的详情集合前缀。

**错误示例：**

```tsx
const listQuery = useQuery({
  queryKey: ['articles'],
  queryFn: loadArticles,
})
const detailQuery = useQuery({
  queryKey: ['articles', articleId],
  queryFn: () => loadArticle(articleId),
})
```

**正确写法：**

```tsx
const listQuery = useQuery({
  queryKey: articleKeys.list({ status: 'all' }),
  queryFn: loadArticles,
})
const detailQuery = useQuery({
  queryKey: articleKeys.detail(articleId),
  queryFn: () => loadArticle(articleId),
})
```

**验证方式：** 用 `getQueriesData({ queryKey: articleKeys.lists() })` 确认只出现列表 key，详情 key 不在其中。

### 错误：各处手写字面量导致拼写漂移

**触发条件：** 一个组件写 `['articles', 'list']`，另一个组件写 `['article', 'lists']`，匹配时再手打 `'articles'`。

**原因：** 把 queryKey 当成可以随手发明的标签，而不是一份共享合同。

**后果：** 两处查询无法共享缓存，前缀匹配也找不到预期条目。

**错误示例：**

```tsx
useQuery({ queryKey: ['articles', 'list'], queryFn: loadArticles })
useQuery({ queryKey: ['article', 'lists'], queryFn: loadArticles })
```

**正确写法：**

```tsx
useQuery({ queryKey: articleKeys.list({ status: 'all' }), queryFn: loadArticles })
useQuery({ queryKey: articleKeys.list({ status: 'all' }), queryFn: loadArticles })
```

**验证方式：** 两处声明的 `JSON.stringify(queryKey)` 必须完全相同，匹配结果里只出现这一棵文章树。

### 错误：不同资源共用同一个根前缀

**触发条件：** 评论查询写成 `['articles', 'comments', articleId]`，并以为文章前缀匹配不应碰到评论。

**原因：** 评论被挂到文章根下后，`['articles']` 的前缀匹配会把它当作文章树的一部分。

**后果：** 观察或操作文章缓存时，评论条目被一起选中，两组数据的边界消失。

**错误示例：**

```tsx
useQuery({
  queryKey: ['articles', 'comments', articleId],
  queryFn: () => loadComments(articleId),
})
```

**正确写法：**

```tsx
const commentKeys = {
  all: ['comments'] as const,
  list: (articleId: string) => [...commentKeys.all, 'list', articleId] as const,
}

useQuery({
  queryKey: commentKeys.list(articleId),
  queryFn: () => loadComments(articleId),
})
```

**验证方式：** `getQueriesData({ queryKey: articleKeys.all })` 不含评论 key；`getQueriesData({ queryKey: commentKeys.all })` 只含评论 key。

### 错误：该用前缀时打开了精确匹配

**触发条件：** 想查看整棵文章树，却写成 `getQueriesData({ queryKey: articleKeys.all, exact: true })`。

**原因：** 把根前缀理解成“自动包含所有子 key”，忽略了 `exact` 会关闭包容匹配。

**后果：** 列表和详情都已经挂载，匹配结果却是空的，误以为工厂没有生效。

**错误示例：**

```tsx
queryClient.getQueriesData({ queryKey: articleKeys.all, exact: true })
```

**正确写法：**

```tsx
queryClient.getQueriesData({ queryKey: articleKeys.all })
queryClient.getQueriesData({ queryKey: articleKeys.all, exact: true })
```

**验证方式：** 对照两次结果。前缀匹配包含 `list` 与 `detail`；精确匹配只有在确实声明了 `articleKeys.all` 这条查询时才有值。

### 错误：筛选对象放错层次

**触发条件：** 把 `status` 直接接在根后面写成 `['articles', { status }]`，同时又用 `['articles', 'list']` 表示另一份列表。

**原因：** 同一资源出现了两套互不包含的列表结构，前缀 `['articles', 'list']` 无法覆盖带筛选对象的那条。

**后果：** 切换筛选后得到新的查询身份，却不能被原来的列表前缀匹配到。

**错误示例：**

```tsx
useQuery({
  queryKey: ['articles', { status }],
  queryFn: () => loadArticles(status),
})
```

**正确写法：**

```tsx
useQuery({
  queryKey: articleKeys.list({ status }),
  queryFn: () => loadArticles(status),
})
```

**验证方式：** 切换筛选后，两条列表 key 都以 `articleKeys.lists()` 为前缀，并且筛选对象位于最后一项。

### 错误：未选择时仍用空 id 声明详情 key

**触发条件：** 详情写成 `articleKeys.detail(selectedId)`，并在 `selectedId` 为空时用禁用选项挡住请求。

**原因：** 禁用只停止请求，不会取消这条 queryKey。空字符串仍会作为详情身份进入缓存，前缀匹配会看到它。

**后果：** 尚未选择文章时，详情前缀已经出现空 id；观察匹配范围时会混进一条无效身份。

**错误示例：**

```tsx
useQuery({
  queryKey: articleKeys.detail(selectedId),
  queryFn: ({ signal }) => loadArticle(selectedId, signal),
  enabled: selectedId.length > 0,
})
```

**正确写法：**

```tsx
{selectedId ? <SelectedArticleDetail articleId={selectedId} /> : null}
```

**验证方式：** 未选择文章时，`getQueriesData({ queryKey: articleKeys.details() })` 为空，页面上的详情 key 显示为未选择。
:::

## 七、源码推导与适用场景

1. **官方事实：** Query Key 必须是可序列化数组，并唯一描述数据。层次化资源把 id 放进数组，附加条件放进后续对象。`QueryFilters.queryKey` 默认按前缀匹配；`exact` 为 true 时只匹配完整相同的 key。更具体的 key 不会匹配更短的祖先 key。`getQueriesData` 使用同一套过滤器并返回匹配到的 key 与数据。
2. **课程推导：** 用 `all / lists / list / details / detail` 这种工厂，只是把官方层次写成可复用函数。列表与详情分开段落后，前缀匹配才能按范围收缩。不同资源使用不同根前缀，是为了让过滤器的包容匹配保持可预测。
3. **适用边界：** 本课不讲解 `queryOptions`、查询失效、Mutation、分页或无限查询。社区 Query Key Factory 包不是本课依赖。匹配观察使用 `getQueriesData`，不把作废缓存当成组织 key 的证明方式。

## 八、练习

:::exercise
### 练习目标

**要求：** 编写文章 key 工厂，包含 `all`、`lists`、`list`、`details`、`detail`。用 `QueryClientProvider` 包裹组件；列表查询使用 `articleKeys.list({ status: 'all' })`；只有选中文章后才挂载详情查询，并使用 `articleKeys.detail(selectedId)`。再用 `getQueriesData` 分别读取 `articleKeys.all`、`articleKeys.lists()` 和精确匹配 `articleKeys.all` 的结果。

**验收：** 列表 key 含 `list` 分段，详情 key 含 `detail` 分段；未选择时看不到详情 key；选择后前缀 `all` 能同时看到列表和详情；前缀 `lists()` 只看到列表；精确匹配 `all` 在没有声明根 key 查询时为空。

**参考答案：**

```tsx
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
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

const articleKeys = {
  all: ['articles'] as const,
  lists: () => [...articleKeys.all, 'list'] as const,
  list: (filters: { status: 'all' | 'published' }) => [...articleKeys.lists(), filters] as const,
  details: () => [...articleKeys.all, 'detail'] as const,
  detail: (id: string) => [...articleKeys.details(), id] as const,
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

/** 已选择文章后才声明详情查询。 */
function SelectedArticleDetail({ articleId }: { articleId: string }): ReactElement | null {
  const detailQuery = useQuery({
    queryKey: articleKeys.detail(articleId),
    queryFn: ({ signal }) => loadArticle(articleId, signal),
    retry: false,
  })
  if (!detailQuery.isSuccess) {
    return null
  }
  return <p>{detailQuery.data.body}</p>
}

/** 用层次化 key 渲染列表、详情，并展示前缀匹配结果。 */
function ArticleKeyBoard(): ReactElement {
  const [selectedId, setSelectedId] = useState('')
  const queryClient = useQueryClient()
  const listQuery = useQuery({
    queryKey: articleKeys.list({ status: 'all' }),
    queryFn: ({ signal }) => loadArticles(signal),
    retry: false,
  })
  const prefixAll = queryClient
    .getQueriesData({ queryKey: articleKeys.all, type: 'active' })
    .map(([key]) => JSON.stringify(key))
  const prefixLists = queryClient
    .getQueriesData({ queryKey: articleKeys.lists(), type: 'active' })
    .map(([key]) => JSON.stringify(key))
  const exactAll = queryClient
    .getQueriesData({ queryKey: articleKeys.all, exact: true, type: 'active' })
    .map(([key]) => JSON.stringify(key))

  return (
    <section>
      {listQuery.isSuccess &&
        listQuery.data.map((article) => (
          <button key={article.id} type="button" onClick={() => setSelectedId(article.id)}>
            {article.title}
          </button>
        ))}
      {selectedId ? <SelectedArticleDetail articleId={selectedId} /> : null}
      <p>前缀 all：{prefixAll.join(' / ') || '无'}</p>
      <p>前缀 lists：{prefixLists.join(' / ') || '无'}</p>
      <p>精确 all：{exactAll.join(' / ') || '无'}</p>
    </section>
  )
}

/** 提供稳定客户端，避免层次化 key 在重渲染时丢失缓存。 */
export function App(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <ArticleKeyBoard />
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- 同一资源的 key 必须共享根前缀，并用 `list` 与 `detail` 分段。
- 工厂函数只负责拼出同一套数组，不引入新的查询 API。
- 默认按前缀匹配；精确匹配只命中完整相同的那一条。
- 不同资源使用不同根前缀，避免一次匹配扫进无关数据。
- 先把身份树看清楚，再考虑配置复用或缓存作废。

## 十、参考资料

- [Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys) - 支持层次化数组、id 与筛选对象。
- [Filters](https://tanstack.com/query/latest/docs/framework/react/guides/filters) - 支持 queryKey 前缀匹配与 exact。
- [Query Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation) - 支持用更短或更具体的 key 说明匹配范围。
- [QueryClient 类型声明](https://unpkg.com/@tanstack/query-core@5.102.8/build/modern/hydration-Bjs0MSgg.d.ts) - 支持 `getQueriesData` 使用 QueryFilters。
