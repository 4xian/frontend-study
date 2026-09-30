---
id: react.router.learn.intermediate.lab-content-management-workspace
type: lesson
title: 实战：内容管理工作区
summary: 组合 loader、action、Form、Fetcher、重新验证、错误边界、面包屑与 Lazy 路由，完成可过滤、可编辑、可发布并能恢复故障的内容管理工作区。
domain: frontend
technology: react
module: router
stage: intermediate
level: intermediate
estimatedMinutes: 210
prerequisites:
  - react.router.learn.intermediate.loader-data-loading
  - react.router.learn.intermediate.loader-requests-and-redirects
  - react.router.learn.intermediate.route-data-reading-and-sharing
  - react.router.learn.intermediate.navigation-pending-ui
  - react.router.learn.intermediate.action-data-submission
  - react.router.learn.intermediate.form-navigation-form
  - react.router.learn.intermediate.action-results-and-form-validation
  - react.router.learn.intermediate.fetcher
  - react.router.learn.intermediate.form-fetcher-choice
  - react.router.learn.intermediate.revalidation
  - react.router.learn.intermediate.route-error-boundary
  - react.router.learn.intermediate.auth-route-boundary
  - react.router.learn.intermediate.route-metadata-and-breadcrumbs
  - react.router.learn.intermediate.lazy-routes
related:
  - react.router.learn.basics.query-params-and-url-state
  - react.router.learn.basics.nested-routes-and-outlet
  - react.router.learn.basics.route-params
tags:
  - React Router
  - Data Mode
  - 实战
  - 内容管理
  - Loader
  - Action
  - Form
  - Fetcher
  - Revalidation
  - ErrorBoundary
  - Lazy Route
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-26
objectives:
  - 能把内容列表、详情和编辑流程翻译成职责清晰的静态 Data Mode route tree。
  - 能用 middleware context 与父子 loader 安排共享用户、统计、列表和详情数据的所有权。
  - 能让 GET Form、普通 Form 与 fetcher.Form 分别承担 URL 过滤、页面级保存和局部发布。
  - 能区分 navigation、fetcher 与 revalidator 的 pending 状态，并把反馈放在正确的界面范围。
  - 能依靠 action 后自动重新验证同步详情和根统计，避免重复手动刷新。
  - 能用最近 ErrorBoundary 处理 404 和 503，并通过导航或重新验证恢复正常分支。
  - 能通过 handle、useMatches 与 lazy route module 生成动态面包屑并延迟详情实现。
recap:
  - route tree 先分配 URL、数据、写入、错误和共享 UI 的所有权，再让组件消费对应 route 的结果。
  - 可分享的列表过滤属于 URL search；GET Form 提交后由 loader 重新读取，不复制到额外全局状态。
  - 普通 Form 适合保存后导航或重定向的编辑流程，Fetcher 适合不改变地址的行内发布。
  - 2xx action 会触发当前页面 loader data 自动重新验证，400 校验结果留在 action data 中。
  - navigation、fetcher 与 revalidator 是三种不同操作的状态来源，不能合并成一个全局 loading。
  - 最近错误边界只接管失败分支；404 通过离开错误位置恢复，503 可以原地重新验证。
  - route.lazy 延迟详情实现，但 path、id 和 children 仍应在静态 route tree 中预先声明。
sources:
  - title: React Router 8.3.0 Release
    url: https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0
    sourceType: release-note
    appliesTo: React Router 8.3.0
    claims:
      - 8.3.0 是核验时的稳定发布版本，并对应固定 release 与 tag。
  - title: npm react-router Latest Metadata
    url: https://registry.npmjs.org/react-router/latest
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - npm latest 在核验时返回 8.3.0。
  - title: React Router 8.3.0 Route Object
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/start/data/route-object.md#L10-L260
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Route Object 可以声明 loader、action、shouldRevalidate、lazy 与 handle。
      - action 成功后会重新验证当前页面的 loader data。
  - title: React Router 8.3.0 Form
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/components/Form.md#L19-L150
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Form 把提交交给 route action，并通过 useNavigation 提供 pending 状态。
      - 需要改变 URL 或 history 的提交优先使用 Form。
  - title: React Router 8.3.0 useFetcher
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useFetcher.md#L19-L85
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Fetcher 可以在不导航的情况下调用 loader 或 action，并维护独立状态。
  - title: React Router 8.3.0 Form Validation
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/how-to/form-validation.md#L80-L119
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - action 可以返回带 400 状态的数据，由页面渲染字段校验错误。
  - title: React Router 8.3.0 useRevalidator
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useRevalidator.md#L19-L70
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - useRevalidator 用于普通 mutation 之外的显式重新验证场景，例如故障重试。
  - title: React Router 8.3.0 Error Boundaries
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/how-to/error-boundary.md#L12-L141
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - loader、action 或组件抛出的错误由最近的 route ErrorBoundary 处理。
      - 缺失资源可以抛出带 404 状态的 route data。
  - title: React Router 8.3.0 Middleware
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/how-to/middleware.md#L109-L204
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Data Mode middleware 可以向 context 写入值，供 loader 和 action 读取。
  - title: React Router 8.3.0 useMatches
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useMatches.md#L19-L60
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - useMatches 返回 active matches 的 id、pathname、params、loaderData 与 handle。
  - title: React Router 8.3.0 Lazy Route Types
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L600-L693
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - lazy route 可以延迟 loader、action、Component、ErrorBoundary 与 handle。
      - path、id 和 children 等匹配字段不属于普通 lazy route module 的延迟结果。
---

# 实战：内容管理工作区

## 一、学习目标

- 能把内容列表、详情和编辑流程翻译成一棵职责清晰的静态 Data Mode route tree。
- 能判断共享用户、统计、列表和详情数据分别属于 middleware context、父 loader 还是子 loader。
- 能让 GET Form、普通 Form 与 `fetcher.Form` 分别承担过滤、保存与局部发布。
- 能区分 `useNavigation`、Fetcher 和 `useRevalidator` 的 pending 状态所有权。
- 能依靠 action 后自动重新验证同步详情与统计，不额外调用手动刷新。
- 能把 404 与 503 交给最近详情错误边界，并提供对应恢复动作。
- 能用 `handle`、`useMatches` 和 lazy route module 生成动态面包屑并延迟详情实现。

本实战组合已经学过的中级能力，不新增完整登录系统、乐观更新、竞态处理、自定义数据策略或动态路由
发现。内容记录使用内存仓库模拟服务端数据，重点是路由职责，而不是持久化实现。

## 二、为什么需要

单独学习 loader、action、Form 或 Fetcher 时，每个示例只需要回答一个问题。真实内容工作区会让这些
能力同时出现：列表要按 URL 过滤，详情要按参数加载，编辑要校验和重定向，发布不能打断当前页面，
写入后统计还要保持一致。

如果先写组件再临时接入路由，常见结果是：

- 根组件同时请求用户、列表和详情，子页面不知道谁拥有数据。
- 搜索条件同时存在于输入框 state、URL 和请求参数，刷新后出现不一致。
- 所有按钮共用一个 `isLoading`，发布一条内容时整个页面被锁住。
- action 成功后手动刷新多个数据源，重复了 Router 已经提供的重新验证。
- 详情故障替换整个工作区，用户连返回列表的入口也失去。

先画 route tree 可以把这些职责分开：

```text
/workspace                         workspace
├── index                          redirect -> content
├── content                        content-list
└── content/:contentId             content-detail（lazy implementation）
```

`workspace` 拥有共享外框、用户、统计、面包屑与全局导航状态；`content-list` 拥有 URL 过滤和列表；
`content-detail` 拥有详情 loader、编辑 action、局部发布和最近错误边界。每一层只处理自己的数据和失败。

## 三、核心概念

### 1. Route tree 是职责表，不只是 URL 表

内容工作区使用静态 route tree：Router 创建时已经知道所有 `path`、`id` 和 `children`，因此可以先完成
匹配，再调用当前分支的数据 API。

```tsx
createMemoryRouter([
  {
    id: 'content-workspace',
    path: '/workspace',
    middleware: [workspaceMiddleware],
    loader: workspaceLoader,
    Component: WorkspaceLayout,
    ErrorBoundary: WorkspaceErrorBoundary,
    children: [
      { index: true, loader: () => redirect('content') },
      {
        id: 'content-list',
        path: 'content',
        loader: contentListLoader,
        Component: ContentListPage,
      },
      {
        id: 'content-detail',
        path: 'content/:contentId',
        lazy: () => import('./content-detail-route'),
      },
    ],
  },
])
```

`route.lazy` 只延迟详情 route 的实现。路径、ID 和父子关系仍留在静态配置中；这与运行时发现未知 route
不是同一件事。

### 2. 数据所有权沿匹配链分层

根 middleware 把当前用户写入本次 Router context，根 loader 再读取用户并计算共享统计：

```tsx
const workspaceUserContext = createContext<WorkspaceUser>()

const workspaceMiddleware: MiddlewareFunction = async ({ context }, next) => {
  context.set(workspaceUserContext, repository.currentUser())
  await next()
}

function workspaceLoader({ context }: LoaderFunctionArgs) {
  return {
    user: context.get(workspaceUserContext),
    stats: repository.stats(),
  }
}
```

列表 loader 只读取 `request.url` 并返回过滤结果；详情 loader 只读取 `params.contentId` 并返回单条记录。
子 route 不需要重新请求根用户，根布局也不需要知道当前详情表单字段。

这是一条判断规则：数据应该放在能覆盖全部消费者的最近 route，而不是一律放在根组件或全局 store。

### 3. 三种表单对应三种导航意图

内容工作区有三类表单：

| 交互 | 组件 | URL 结果 | 状态来源 |
| --- | --- | --- | --- |
| 列表过滤 | `<Form method="get">` | search 改变 | `useNavigation()` |
| 保存编辑 | `<Form method="post">` | 成功后 redirect | `useNavigation()` |
| 发布或撤回 | `<fetcher.Form method="post">` | 地址保持不变 | 当前 Fetcher |

选择组件时先问“成功后是否应该产生导航”。需要新的 URL 或规范重定向时使用普通 Form；只修改当前
页面中的一小部分数据时使用 Fetcher。

### 4. 重新验证负责提交后的数据一致性

普通 Form 和 Fetcher 都会调用 route action。action 返回成功结果后，React Router 会重新运行当前页面
需要重新验证的 loaders：

```text
发布提交
-> detail action 切换状态
-> 当前 Fetcher 进入 loading
-> workspace loader 重新计算统计
-> detail loader 重新读取状态
-> Fetcher 回到 idle
```

因此详情状态和根统计都来自新的 loader data。组件不需要在 action 完成后同时修改本地详情、列表缓存
和统计，也不需要为普通 CRUD 再调用 `revalidator.revalidate()`。

### 5. 错误边界按 route 层级隔离失败

详情 loader 找不到记录时抛出 404；一次性服务故障抛出 503。因为 `content-detail` 提供最近的
`ErrorBoundary`，根工作区外框、用户统计和返回列表入口仍然保留。

```tsx
if (!content) {
  throw data('未找到该内容', { status: 404 })
}

if (temporaryFailure) {
  throw data('内容服务暂时不可用', { status: 503 })
}
```

两类错误的恢复方式不同：404 表示当前资源不存在，应导航回列表；503 表示当前 location 仍然有效，
可以调用 `revalidator.revalidate()` 原地重试 loader。

### 6. Handle 让 route 提供面包屑元数据

根 route 和列表 route 提供静态文本；详情 lazy module 使用自己的 loader data 生成动态标题：

```tsx
export const handle = {
  breadcrumb(match: UIMatch<ContentDetailData>) {
    return match.loaderData?.content.title ?? '内容详情'
  },
}
```

根布局通过 `useMatches()` 组合当前匹配链。404 或 503 时详情 loader data 可能不存在，因此动态 crumb
必须提供回退文本，不能在面包屑组件中绕过 route data 再查一次仓库。

## 四、用法与示例

### 1. 用 GET Form 让 URL 成为过滤状态源

列表 loader 从 URL 读取查询词和状态：

```tsx
function contentListLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const query = url.searchParams.get('q')?.trim() ?? ''
  const status = url.searchParams.get('status') ?? 'all'

  return {
    filters: { query, status },
    contents: repository.list({ query, status }),
  }
}
```

页面使用 GET Form：

```tsx
<Form method="get">
  <input name="q" defaultValue={filters.query} />
  <select name="status" defaultValue={filters.status}>
    <option value="all">全部</option>
    <option value="draft">草稿</option>
    <option value="published">已发布</option>
  </select>
  <button type="submit">应用筛选</button>
</Form>
```

提交后 search 进入当前 location，loader 按同一 URL 返回列表。复制链接、刷新和直接进入深链都会得到
同样结果。

### 2. 用普通 Form 完成校验和规范重定向

详情 action 先读取 `intent`，再处理保存字段：

```tsx
if (intent === 'save') {
  const title = readText(formData, 'title')
  const summary = readText(formData, 'summary')
  const errors = {
    ...(title ? {} : { title: '请输入标题' }),
    ...(summary ? {} : { summary: '请输入摘要' }),
  }

  if (Object.keys(errors).length > 0) {
    return data({ ok: false, errors }, { status: 400 })
  }

  repository.update(content.id, { title, summary })
  return redirect(`/workspace/content/${content.id}`)
}
```

400 是可处理的表单结果，不是需要错误边界接管的异常。页面用 `useActionData()` 显示字段错误，保留旧
loader data 和当前编辑上下文；保存成功才写入并重定向到规范详情 URL。

### 3. 用 Fetcher 完成不导航的局部发布

详情 route 的同一个 action 还可以处理发布意图：

```tsx
if (intent === 'toggle-publish') {
  const updated = repository.toggleStatus(content.id)
  return { ok: true, status: updated.status }
}
```

页面使用独立 Fetcher：

```tsx
const publishFetcher = useFetcher()

<publishFetcher.Form method="post">
  <input type="hidden" name="intent" value="toggle-publish" />
  <button disabled={publishFetcher.state !== 'idle'}>
    {publishFetcher.state !== 'idle' ? '处理中' : '切换发布状态'}
  </button>
</publishFetcher.Form>
```

Fetcher 成功提交不会创建普通 navigation；按钮只读自己的 `fetcher.state`。状态徽标等待 action 成功和
loader revalidation 后更新，本课不使用 `fetcher.formData` 提前预测结果。

### 4. 分开三类 Pending UI

根布局读取 `useNavigation()`，用于列表导航、GET 过滤和普通保存。发布按钮读取自己的 Fetcher；503
错误边界读取 `useRevalidator()`：

```tsx
const navigation = useNavigation()
const publishFetcher = useFetcher()
const revalidator = useRevalidator()
```

不要把三者合成一个共享 `isLoading`。发布一条记录不应让根导航条显示成正在换页，详情重试也不应
禁用列表中所有独立按钮。

### 5. 让详情 Lazy Module 保持完整职责

详情模块同时导出 loader、action、Component、ErrorBoundary 和 handle。它们围绕同一个 route 协作，
适合一起延迟加载：

```tsx
return {
  loader,
  action,
  Component,
  ErrorBoundary,
  handle,
}
```

静态 route tree 只保留匹配所需的 `id` 与 `path`。首次进入详情时解析 lazy module；返回列表不会卸载
整个外层学习站 Router，也不会改变 Vue 宿主的地址。

## 五、Demo：内容管理工作区

下面的 Demo 使用独立内存 Router 和独立内容仓库。可以依次观察：

1. 在列表中按标题和发布状态过滤，确认 URL search 与结果一致。
2. 打开详情，检查动态面包屑、loader 调用次数和 location key。
3. 清空标题或摘要并保存，确认 400 校验错误留在编辑页。
4. 输入有效内容并保存，确认普通 Form 经历 pending、redirect 和 loader 重新读取。
5. 发布或撤回内容，确认 Fetcher 独立 pending、地址与 location key 不变、根统计随后同步。
6. 打开不存在的内容 ID，确认最近详情边界显示 404，并能返回列表。
7. 打开一次性故障入口，确认 503 可以通过 `useRevalidator` 原地恢复。

:::demo{id="react.router.learn.intermediate.lab-content-management-workspace.content-management-workspace-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：把过滤条件同时放在 URL 和组件 State

**触发条件：** 输入框使用本地 state，loader 又从 search 读取另一份过滤条件。

**原因：** 同一业务状态出现两个写入入口，刷新、返回和复制链接时无法保证同步。

**后果：** 输入框显示的条件可能与列表数据或地址不一致。

**错误示例：**

```tsx
const [query, setQuery] = useState('')
const data = useLoaderData()
```

**正确写法：**

```tsx
const data = useLoaderData<typeof contentListLoader>()

<Form method="get">
  <input name="q" defaultValue={data.filters.query} />
</Form>
```

**验证方式：** 复制带 search 的地址直接进入，输入框与列表应显示同一过滤条件。

### 错误：用普通 Form 实现不应导航的行内发布

**触发条件：** 列表每一行的发布按钮使用普通 `<Form>`，但成功后仍应停留在当前列表或详情。

**原因：** 普通 Form 建立 navigation，而这个交互只需要局部 mutation。

**后果：** 地址或 history 可能变化，全局 pending 范围也被不必要地扩大。

**错误示例：**

```tsx
<Form method="post">
  <button name="intent" value="publish">发布</button>
</Form>
```

**正确写法：**

```tsx
const fetcher = useFetcher()

<fetcher.Form method="post">
  <button name="intent" value="toggle-publish">发布</button>
</fetcher.Form>
```

**验证方式：** 提交前后比较 pathname、search 和 location key，普通成功提交不应改变它们。

### 错误：Action 成功后再次手动刷新所有数据

**触发条件：** action 已返回 2xx，组件仍在 effect 中调用 `revalidator.revalidate()` 或重新请求统计。

**原因：** 忽略了 action 成功后 Router 会自动重新验证当前页面 loader data。

**后果：** 同一 mutation 触发重复请求，pending 时序变复杂，还可能掩盖错误的数据所有权。

**错误示例：**

```tsx
useEffect(() => {
  if (fetcher.data?.ok) revalidator.revalidate()
}, [fetcher.data, revalidator])
```

**正确写法：**

```tsx
if (intent === 'toggle-publish') {
  repository.toggleStatus(content.id)
  return { ok: true }
}
```

**验证方式：** 只执行一次发布，根统计与详情状态应在 action 后自动同步。

### 错误：把字段校验失败抛给 ErrorBoundary

**触发条件：** 标题为空时 `throw data(..., { status: 400 })`，希望错误边界显示字段提示。

**原因：** 可修正的输入错误属于 action data，不属于让当前 route 失去正常 UI 的异常。

**后果：** 整个详情编辑界面被错误页替换，用户无法就地修改字段。

**错误示例：**

```tsx
if (!title) throw data('请输入标题', { status: 400 })
```

**正确写法：**

```tsx
if (!title) {
  return data({ ok: false, errors: { title: '请输入标题' } }, { status: 400 })
}
```

**验证方式：** 空标题提交后，详情表单仍在，字段旁出现错误，最近 ErrorBoundary 不应接管页面。

### 错误：在 Lazy Module 中延迟声明 Path 和 Children

**触发条件：** 静态 route tree 不声明详情路径，期望普通 `route.lazy` 运行后再提供 `path` 或 `children`。

**原因：** Router 需要先知道匹配字段才能确定应加载哪个 lazy route implementation。

**后果：** 目标 URL 无法按预期匹配，或者被迫引入本课之外的动态路由发现机制。

**错误示例：**

```tsx
{
  lazy: () => import('./content-detail-route'),
}
```

**正确写法：**

```tsx
{
  id: 'content-detail',
  path: 'content/:contentId',
  lazy: () => import('./content-detail-route'),
}
```

**验证方式：** 首次直接进入详情 URL 应能先匹配静态 route，再加载详情实现。
:::

## 七、源码推导与适用场景

### 1. 官方事实

固定版本的 Route Object 文档把 loader、action、shouldRevalidate、lazy 和 handle 都定义为 route 能力；
Form 文档说明 action 完成后会重新验证页面 loader data，Fetcher 则拥有独立状态且不创建普通导航。

固定版本类型源码把 `path`、`id`、`children` 等匹配字段排除在普通 lazy route result 之外，同时允许
lazy module 提供 loader、action、Component、ErrorBoundary 与 handle。错误文档说明失败会沿匹配链交给
最近边界，404 可以使用带状态的 route data 表达。

### 2. 课程推导

由这些事实可以推导出内容工作区的组合方式：

1. 先用静态 route tree 划定列表、详情和共享布局的边界。
2. 把共享用户与统计放在父 route，把 URL 过滤和详情读取放在对应子 route。
3. 让普通 Form 与 Fetcher 共享同一个 action，通过 `intent` 区分写入目的。
4. 让 action 后自动重新验证成为一致性主线，只在临时 loader 故障时使用手动 revalidation。
5. 把详情 ErrorBoundary 放在动态详情 route 上，使局部失败不摧毁整个工作区。

### 3. 适用边界

这个结构适合中小型后台工作区、内容编辑器、任务管理或配置中心：页面层级明确，数据主要由 route
loader/action 协调，局部按钮需要独立 pending。

本实战不承诺内存仓库等同于真实服务端持久化，也不处理并发写入、版本冲突、乐观回滚或离线缓存。
完整登录、登出、401/403 权限矩阵和安全回跳属于独立鉴权工作流；服务端缓存与客户端数据缓存也需要
在具体技术栈中另行确定所有权。

## 八、练习

:::exercise
### 练习目标

**要求：** 为列表增加 `status=all|draft|published` 深链并证明刷新后结果一致；发布一条草稿，记录提交前后的
pathname、search、location key、navigation state 和 fetcher state；清空详情摘要并保存，解释 400 为什么
没有进入 ErrorBoundary；保存一个新标题，确认 redirect 后详情和面包屑来自重新加载的数据；分别从 404
返回列表并从一次性 503 原地重试；最后画出每一步命中的 route、loader、action、pending 来源与错误边界。

**验收：** URL 是列表过滤的唯一状态源；行内发布不改变 location；400 校验保留详情编辑界面；保存成功
后 loader data 与动态面包屑一致；404 和 503 使用不同恢复动作；不加入 `fetcher.formData` 乐观更新、
自定义 `dataStrategy`、运行时 route discovery 或额外全局 store。
:::

## 九、本节小结

- 先让 route tree 表达 UI、数据、写入和错误所有权，再实现页面组件。
- URL 过滤交给 GET Form 与列表 loader，页面级保存交给普通 Form，局部发布交给 Fetcher。
- action 成功后的自动重新验证负责同步详情和父级统计；普通 mutation 不重复手动刷新。
- navigation、fetcher 与 revalidator 分别描述导航、局部交互和显式重试，不能混成一个 loading。
- 详情最近错误边界让 404 可以离开恢复、503 可以原地重试，同时保留工作区外框。
- `route.lazy` 延迟详情实现，不延迟静态匹配字段；动态面包屑可以从 active match 的 loader data 读取。

## 十、参考资料

- [React Router 8.3.0 Route Object](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/start/data/route-object.md#L10-L260) - loader、action、重新验证、lazy 与 handle 的 route 合同。
- [React Router 8.3.0 Form](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/components/Form.md#L19-L150) - 导航表单、pending 与提交后重新验证。
- [React Router 8.3.0 useFetcher](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useFetcher.md#L19-L85) - 无导航提交与独立 Fetcher 状态。
- [React Router 8.3.0 Form Validation](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/how-to/form-validation.md#L80-L119) - 400 action data 与字段错误反馈。
- [React Router 8.3.0 useRevalidator](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useRevalidator.md#L19-L70) - 普通 mutation 之外的显式重新验证。
- [React Router 8.3.0 Error Boundaries](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/how-to/error-boundary.md#L12-L141) - 最近错误边界、route error 与 404。
- [React Router 8.3.0 Middleware](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/how-to/middleware.md#L109-L204) - Data Mode middleware context。
- [React Router 8.3.0 useMatches](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useMatches.md#L19-L60) - active matches、loaderData 与 handle。
- [React Router 8.3.0 Lazy Route Types](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L600-L693) - lazy route 可延迟字段与静态匹配字段边界。
