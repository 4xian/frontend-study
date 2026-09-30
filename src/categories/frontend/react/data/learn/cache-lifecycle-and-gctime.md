---
id: react.data.learn.basics.cache-lifecycle-and-gctime
type: lesson
title: 缓存生命周期与 gcTime
summary: 配置查询在失去观察者后保留多久，并观察缓存复用与垃圾回收的边界。
domain: frontend
technology: react
module: data
stage: basics
level: beginner
estimatedMinutes: 45
prerequisites:
  - react.data.learn.basics.background-refetching
related:
  - react.data.learn.basics.query-cache-and-sharing
  - react.data.learn.basics.stale-time-and-freshness
tags:
  - TanStack Query
  - gcTime
  - QueryCache
  - inactive query
  - garbage collection
appliesTo: TanStack Query 5.102.8、React 19.2.8
verifiedAt: 2026-09-01
objectives:
  - 区分查询处于 active、inactive 和已被垃圾回收的状态。
  - 使用 gcTime 配置 inactive 查询在 QueryCache 中的保留时间。
  - 解释查询重新挂载时如何复用仍在缓存中的数据。
  - 区分 staleTime 的新鲜度窗口与 gcTime 的内存保留窗口。
  - 为短期、长期和不自动回收的缓存选择合理策略。
recap:
  - active 查询仍有观察者，inactive 查询没有正在使用它的查询观察者。
  - gcTime 只在查询变为 inactive 后计时，默认客户端值为 5 分钟。
  - inactive 查询在 gcTime 到期前重新挂载，可以先读取缓存，再按 stale 条件重新获取。
  - staleTime 决定数据是否 fresh，gcTime 决定 inactive 数据还在内存中多久，两者互不替代。
  - gcTime 为 Infinity 会关闭自动垃圾回收，应只用于有明确内存策略的数据。
sources:
  - title: Caching Examples
    url: https://tanstack.com/query/latest/docs/framework/react/guides/caching
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 没有查询实例使用时，查询变为 inactive 并按 gcTime 设置垃圾回收计时器。
      - gcTime 到期前重新挂载可以立即读取缓存数据并在需要时后台获取。
      - 默认 gcTime 为 5 分钟。
  - title: Important Defaults
    url: https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 没有 active 实例的查询会留在缓存中，并默认在 5 分钟后回收。
      - 可以通过 gcTime 修改 inactive 查询的默认保留时长。
  - title: useQuery Reference
    url: https://tanstack.com/query/latest/docs/framework/react/reference/useQuery
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - gcTime 的单位是毫秒，默认客户端值为 5 分钟，服务端默认为 Infinity。
      - gcTime 为 Infinity 时关闭垃圾回收，不同设置同时存在时使用最长值。
      - staleTime 表示数据被视为 stale 前的时间，与 gcTime 负责不同生命周期。
  - title: Query removable source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/removable.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 查询无观察者时会按 gcTime 安排回收，重新有观察者时会清除计时器。
      - 未设置 gcTime 时客户端默认使用 5 分钟，服务端默认使用 Infinity。
  - title: Query cache lifecycle source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/query.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - Query 在最后一个观察者移除后安排 GC，并在添加观察者时清除 GC 计时器。
      - 查询无观察者、请求空闲时才会从 QueryCache 中移除。

---

# 缓存生命周期与 gcTime

## 一、学习目标

- 区分查询处于 active、inactive 和已被垃圾回收的状态。
- 使用 `gcTime` 配置 inactive 查询在 `QueryCache` 中的保留时间。
- 解释查询重新挂载时如何复用仍在缓存中的数据。
- 区分 `staleTime` 的新鲜度窗口与 `gcTime` 的内存保留窗口。
- 为短期、长期和不自动回收的缓存选择合理策略。

## 二、为什么需要缓存生命周期

查询组件卸载后，用户可能很快回到同一个页面。如果每次回到页面都从空白状态开始，请求和加载状态都会重复
出现。TanStack Query 会把没有观察者使用的结果暂时留在 `QueryCache` 中，让再次挂载的组件有机会直接复用。

这份保留也会占用内存。长时间积累大量不再使用的查询，会让缓存失去边界。因此应用需要同时决定“数据多久算
新鲜”和“没有组件使用时还保留多久”。`gcTime` 负责后一个问题。

## 三、核心概念

### 1. active、inactive 与已回收

当查询至少有一个启用的 `useQuery` 观察者时，可以把它理解为 active。观察者卸载或不再使用该查询后，查询
进入 inactive；它仍在 `QueryCache` 中，但不再由当前组件读取。

如果 inactive 状态持续到 `gcTime` 到期，查询会从 `QueryCache` 移除，缓存数据也就不能再被同一个查询键直接复用。
这不是请求失败，而是缓存生命周期正常结束。

### 2. gcTime 的单位与默认值

`gcTime` 使用毫秒。浏览器客户端没有显式配置时，默认值是 5 分钟；服务端默认值是 `Infinity`。单个查询可以
覆盖它：

```tsx
useQuery({
  queryKey: ['article', articleId],
  queryFn: () => loadArticle(articleId),
  gcTime: 10 * 60 * 1000,
})
```

`gcTime: Infinity` 表示不因 inactive 自动回收。它不是“数据永远正确”，也不是让查询永远保持 active；它只
关闭这一个自动移除计时器。应用仍应考虑缓存数量、数据体积以及手动清理策略。

`gcTime: 0` 表示最后一个观察者移除后按 0 毫秒安排回收。回收仍通过事件循环异步尝试，并且只有在没有观察者、
请求已经空闲时才会从缓存移除，因此它不等同于卸载函数返回前的同步删除。它适合明确不希望保留 inactive 数据的
小型查询，但会放弃短暂离开后直接复用缓存的机会。

### 3. 失去观察者后才开始计时

active 查询不会因为 `gcTime` 到期被回收。最后一个观察者移除后，TanStack Query 才会安排垃圾回收计时器；
重新添加观察者会取消该计时器。

```tsx
function ArticlePanel({ articleId }: { articleId: string }) {
  const articleQuery = useQuery({
    queryKey: ['article', articleId],
    queryFn: () => loadArticle(articleId),
    gcTime: 60_000,
  })

  if (articleQuery.isPending) return <p>首次加载中</p>
  if (articleQuery.isError) return <p role="alert">{articleQuery.error.message}</p>
  return <h2>{articleQuery.data.title}</h2>
}
```

上例的 60 秒不是从请求成功时开始计算，而是从最后一个观察者离开后开始计算。只要 `ArticlePanel` 仍挂载，
查询就不会因为 `gcTime` 被移除。

### 4. 重新挂载时的缓存复用

如果查询在 `gcTime` 到期前重新挂载，组件可以立即得到已有的 `data`。随后是否请求新数据，仍由
`staleTime`、挂载重新获取配置和其他查询策略决定。数据新鲜度与缓存是否存在是两个独立判断：

```tsx
const articleQuery = useQuery({
  queryKey: ['article', articleId],
  queryFn: () => loadArticle(articleId),
  staleTime: 30_000,
  gcTime: 5 * 60 * 1000,
})
```

这表示成功数据 30 秒内可以视为 fresh，查询变为 inactive 后还可以在缓存中保留 5 分钟。30 秒不会让数据被
删除，5 分钟也不会让数据变 fresh。

### 5. 多个观察者的设置

同一个查询键可能同时被多个观察者使用。不同观察者为 `gcTime` 指定不同值时，当前版本会保留其中较长的时间，
避免一个观察者过早缩短另一个观察者仍依赖的缓存保留策略。实际应用应尽量为同一查询键建立一致的默认策略，
只有确有理由时才在局部覆盖。

## 四、用法与示例

### 1. 为查询选择保留时长

- 短时保留适合体积较大、回来后重新读取成本低的数据，也适合需要尽快释放内存的页面。
- 默认 5 分钟适合普通列表和详情页面，能覆盖常见的短暂离开再返回。
- 更长时间适合读取成本高且短时间内会再次访问的数据，但应评估内存占用和数据敏感性。
- `Infinity` 只适合有明确清理或数据量边界的参考数据，不应作为所有查询的默认答案。

全局默认值可以放在 `QueryClient` 中，单个查询再覆盖：

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 5 * 60 * 1000,
    },
  },
})

const largeReportQuery = useQuery({
  queryKey: ['large-report', reportId],
  queryFn: () => loadLargeReport(reportId),
  gcTime: 60_000,
})
```

### 2. 用 QueryCache 观察生命周期

需要调试或展示缓存状态时，可以从 `QueryClient` 读取 QueryCache。存在条目只能说明查询还未被回收，不能说明
它一定 fresh，也不能说明当前有观察者：

```tsx
const query = queryClient.getQueryCache().find({ queryKey: ['article', articleId] })
const cachedArticle = queryClient.getQueryData<Article>(['article', articleId])

console.log({
  exists: query !== undefined,
  data: cachedArticle,
})
```

业务组件通常仍应以 `useQuery` 的结果为主；直接操作 QueryCache 更适合调试工具、缓存管理和明确的基础设施代码。

### 3. 手动清理与自动回收的边界

`gcTime` 是按 inactive 查询自动执行的保留策略。如果用户退出账号、切换租户或数据权限发生变化，不能等待
计时器自然到期才清理敏感数据，应在业务边界显式清除相关缓存：

```tsx
queryClient.removeQueries({ queryKey: ['account', accountId] })
```

手动移除是业务动作，和等待 inactive 查询的 `gcTime` 到期不是同一条路径。清理时应准确限定查询键，避免误删
仍被其他页面使用的数据。

### 4. 服务端与长时间计时器

服务端默认 `gcTime` 为 `Infinity`，因为服务端请求结束后通常由应用自行释放对应的 `QueryClient`。在浏览器中，
非常长的毫秒数还会受到 JavaScript 定时器的实现限制；需要更长的保留策略时，应结合持久化或应用级清理设计，
而不是单纯堆叠一个极大的数字。

## 五、用法示例：观察 inactive 缓存回收

下面的 Demo 使用一个短的 3 秒 `gcTime` 方便观察：先挂载查询观察者并等待数据，再隐藏观察者。隐藏后查询变为
inactive，但在倒计时结束前仍存在于缓存；重新挂载会先显示缓存结果。让倒计时结束后再挂载，则会看到新的首次读取。

:::demo{id="react.data.learn.basics.cache-lifecycle-and-gctime.cache-lifecycle-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：把 gcTime 当成 staleTime

**触发条件：** 看到数据变 stale 就认为缓存已经被删除，或把 `gcTime` 当成 fresh 窗口。

**原因：** `staleTime` 判断数据新鲜度，`gcTime` 判断 inactive 数据的内存保留时间。

**后果：** 组件错误地清空数据，或为了延长缓存复用而改变了错误的配置。

**错误示例：**

```tsx
useQuery({
  queryKey: ['profile'],
  queryFn: loadProfile,
  gcTime: 30_000,
})
```

**正确写法：**

```tsx
useQuery({
  queryKey: ['profile'],
  queryFn: loadProfile,
  staleTime: 30_000,
  gcTime: 5 * 60 * 1000,
})
```

**验证方式：** 分别观察数据的 `isStale` 和 QueryCache 条目是否存在，确认两个时间点可以不同。

### 错误：认为 active 查询会按 gcTime 到期删除

**触发条件：** 查询组件仍在页面上，却预期短 `gcTime` 会自动移除数据。

**原因：** 垃圾回收只针对没有观察者的 inactive 查询。

**后果：** 以为配置没有生效，进而加入不必要的手动清理代码。

**错误示例：**

```tsx
function Panel() {
  useQuery({ queryKey: ['panel'], queryFn: loadPanel, gcTime: 1_000 })
  return <p>面板仍在使用查询</p>
}
```

**正确写法：**

```tsx
function PanelContent() {
  const query = useQuery({ queryKey: ['panel'], queryFn: loadPanel, gcTime: 1_000 })
  return <p>{query.data?.title ?? '读取中'}</p>
}

function Panel({ visible }: { visible: boolean }) {
  return visible ? <PanelContent /> : null
}
```

**验证方式：** 让观察者保持挂载超过 `gcTime`，确认 QueryCache 条目仍存在；卸载观察者后再开始计时。

### 错误：把 gcTime 的数字写成秒

**触发条件：** 希望保留 3 秒，却写成 `gcTime: 3`。

**原因：** TanStack Query 的时间选项统一使用毫秒。

**后果：** 查询几乎立即被回收，重新挂载无法复用预期的缓存。

**错误示例：**

```tsx
useQuery({ queryKey: ['draft'], queryFn: loadDraft, gcTime: 3 })
```

**正确写法：**

```tsx
useQuery({ queryKey: ['draft'], queryFn: loadDraft, gcTime: 3 * 1000 })
```

**验证方式：** 卸载观察者后用秒表或 Demo 倒计时确认缓存约 3 秒后才消失。

### 错误：在 v5 继续使用 cacheTime

**触发条件：** 从旧教程复制 `cacheTime`，以为它仍是当前配置名。

**原因：** TanStack Query v5 使用 `gcTime` 表达 inactive 缓存的垃圾回收时间。

**后果：** 当前类型检查无法把旧字段当作正确的查询配置，团队成员也会误解生命周期语义。

**错误示例：**

```tsx
useQuery({ queryKey: ['settings'], queryFn: loadSettings, cacheTime: 60_000 })
```

**正确写法：**

```tsx
useQuery({ queryKey: ['settings'], queryFn: loadSettings, gcTime: 60_000 })
```

**验证方式：** 查看当前版本 `useQuery` 类型和官方参考，确认选项名称为 `gcTime`。

### 错误：用 Infinity 代替清理策略

**触发条件：** 为了避免重复请求，把所有查询都设置为 `gcTime: Infinity`。

**原因：** Infinity 会关闭自动垃圾回收，但不会限制缓存数量、数据体积或权限变化。

**后果：** 长时间运行的应用可能积累大量无用或敏感数据，内存和数据边界都难以控制。

**错误示例：**

```tsx
const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: Infinity } },
})
```

**正确写法：**

```tsx
const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: 5 * 60 * 1000 } },
})

// 账号边界发生变化时，再按业务键显式清理。
queryClient.removeQueries({ queryKey: ['account', accountId] })
```

**验证方式：** 为缓存策略记录数据体积和清理边界，确认 Infinity 只用于有明确生命周期的参考数据。
:::

## 七、源码推导与适用场景

1. **官方事实：** TanStack Query 5.102.8 的 `Removable` 基类在没有设置 `gcTime` 时为浏览器使用 5 分钟、
   服务端使用 Infinity；`scheduleGc` 会按该时间调用移除逻辑。`Query` 在最后一个观察者移除后安排计时器，
   在新增观察者时清除计时器，并只在没有观察者且请求空闲时从 QueryCache 移除。
2. **课程推导：** 因此“缓存存在”“数据 fresh”和“当前有请求”必须分别判断。重新挂载能否复用，首先取决于
   查询是否还没有被 gcTime 回收；重新获取与否再由 staleTime 和 refetch 策略决定。
3. **适用边界：** `gcTime` 是内存中的 inactive 缓存策略，不等于持久化插件的 `maxAge`，也不替代退出账号、切换
   租户等业务边界的显式清理。服务端生命周期还需要由应用自行管理 QueryClient。

## 八、练习

:::exercise
### 练习目标

**要求：** 为文章详情查询设置 30 秒的 fresh 窗口和 5 分钟的 inactive 缓存保留，并实现一个“隐藏详情”和“重新
挂载详情”的控制。隐藏后读取 QueryCache 判断条目是否仍存在；在 5 分钟内重新挂载时显示缓存数据。

**验收：** 详情组件挂载时能读取文章；隐藏后组件不再是观察者但 QueryCache 条目仍存在；重新挂载能先展示旧数据；
   只有 inactive 超过 5 分钟才不再复用该缓存。

**参考答案：**

```tsx
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { useEffect, useState, type ReactElement } from 'react'

type Article = { id: number; title: string }

/** 请求文章详情并检查 HTTP 响应。 */
async function loadArticle(): Promise<Article> {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts/1')
  if (!response.ok) throw new Error(`请求失败：${response.status}`)
  return response.json() as Promise<Article>
}

const queryClient = new QueryClient()

/** 显示文章详情并配置新鲜度与缓存保留时长。 */
function ArticleDetail(): ReactElement {
  const query = useQuery({
    queryKey: ['article', 1],
    queryFn: loadArticle,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  })

  if (query.isPending) return <p>首次加载中</p>
  if (query.isError) return <p role="alert">{query.error.message}</p>
  return <h2>{query.data.title}</h2>
}

/** 控制详情观察者挂载，并读取 QueryCache 是否仍保留条目。 */
function App(): ReactElement {
  const [visible, setVisible] = useState(true)
  const [, refreshCacheState] = useState(0)
  const cached = queryClient.getQueryCache().find({ queryKey: ['article', 1] })

  useEffect(() => {
    return queryClient.getQueryCache().subscribe(() => {
      refreshCacheState((count) => count + 1)
    })
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <button type="button" onClick={() => setVisible((current) => !current)}>
        {visible ? '隐藏详情' : '重新挂载详情'}
      </button>
      <p>缓存条目：{cached ? '仍存在' : '已回收'}</p>
      {visible && <ArticleDetail />}
    </QueryClientProvider>
  )
}

export default App
```
:::

## 九、本节小结

- active 查询有观察者，inactive 查询没有正在使用它的观察者；inactive 超过 `gcTime` 后才会被回收。
- `gcTime` 使用毫秒，浏览器默认 5 分钟，`Infinity` 关闭自动回收。
- 重新挂载能否复用数据取决于缓存是否仍存在；是否后台重新获取还要看 `staleTime` 和 refetch 策略。
- `staleTime` 管新鲜度，`gcTime` 管 inactive 内存保留，不能互相替代。
- 权限、租户和退出账号等业务边界应使用精确的显式缓存清理。

## 十、参考资料

- [Caching Examples](https://tanstack.com/query/latest/docs/framework/react/guides/caching) - 说明 active、inactive、重新挂载复用与 gcTime 回收流程。
- [Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults) - 说明 inactive 查询默认 5 分钟后回收。
- [useQuery Reference](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery) - 支持 gcTime、staleTime、Infinity 和多观察者最长值的公共配置说明。
- [Query removable source](https://unpkg.com/@tanstack/query-core@5.102.8/src/removable.ts) - 固定版本默认值、计时器和回收调度实现。
- [Query cache lifecycle source](https://unpkg.com/@tanstack/query-core@5.102.8/src/query.ts) - 固定版本观察者增删与 QueryCache 移除条件实现。
