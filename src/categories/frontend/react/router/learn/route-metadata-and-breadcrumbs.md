---
id: react.router.learn.intermediate.route-metadata-and-breadcrumbs
type: lesson
title: 路由元数据与面包屑
summary: 用 route handle 声明分支元数据，再由 useMatches 聚合当前匹配链生成动态面包屑。
domain: frontend
technology: react
module: router
stage: intermediate
level: intermediate
estimatedMinutes: 85
prerequisites:
  - react.router.learn.intermediate.route-data-reading-and-sharing
  - react.router.learn.intermediate.auth-route-boundary
related:
  - react.router.learn.basics.nested-routes-and-outlet
  - react.router.learn.intermediate.revalidation
tags:
  - React Router
  - Data Mode
  - handle
  - useMatches
  - 路由元数据
  - 面包屑
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-25
objectives:
  - 能在 Data Mode route object 上声明应用自己的 handle 元数据。
  - 能用 useMatches 读取当前 URL 的 active matches，并过滤出带 breadcrumb 元数据的 route。
  - 能把 route handle、loaderData 与显式 route ID 组合成静态和动态面包屑。
  - 能让面包屑链接遵循当前 route hierarchy，并为当前页面提供 aria-current。
  - 能区分路由元数据、loader data、页面组件和站点全局配置的职责。
recap:
  - handle 是 route object 提供给 UI match 的应用自定义元数据容器。
  - useMatches 只返回当前 Data Router 已知的 active route hierarchy。
  - 面包屑渲染器应过滤没有 breadcrumb 的 match，并按父到子的匹配顺序输出。
  - 动态面包屑可以读取对应 match 的 loaderData，但数据形状和 handle 结构由应用自己定义。
  - 只需要某一个已知 route 数据时，useRouteLoaderData 比遍历 matches 更直接。
sources:
  - title: React Router Route Object（Data Mode）
    url: https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/start/data/route-object.md
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - route object 的 handle 可以向 useMatches 暴露应用自定义数据。
  - title: React Router useMatches API
    url: https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/api/hooks/useMatches.md
    sourceType: api-doc
    appliesTo: React Router 8.3.0
    claims:
      - useMatches 返回当前 route hierarchy 的 UI matches。
      - UI match 提供 id、pathname、params、loaderData 和 handle。
      - useMatches 需要知道完整 route tree 的 Data Router，不能发现未知的 descendant route tree。
  - title: React Router Using handle
    url: https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/how-to/using-handle.md
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - route handle 与 useMatches 可以在祖先组件中聚合 route 提供的面包屑信息。
      - handle 的具体属性名和渲染方式属于应用约定。
  - title: React Router 8.3.0 UI Match Type
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1114-L1145
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - UIMatch 会把 active route 的 handle 与对应 route ID、pathname、params 和 loaderData 组合起来。
  - title: React Router 8.3.0 useMatches Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/hooks.tsx#L1569-L1615
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - useMatches 从当前 Router state 的 active matches 生成 UI matches。
---

# 路由元数据与面包屑

## 一、学习目标

- 能在 Data Mode route object 上声明 `handle` 元数据。
- 能用 `useMatches()` 读取当前 URL 的匹配链，并按约定提取面包屑描述。
- 能组合 `handle` 与当前 match 的 `loaderData`，生成静态和动态面包屑。
- 能为当前页面保留可访问的 `aria-current="page"`，并让祖先面包屑保持可导航。
- 能判断什么时候应读取一个已知 route 的 loader data，什么时候才需要遍历整个 matches。

## 二、为什么需要路由元数据

页面组件知道自己如何渲染，但祖先布局通常需要知道当前分支的标题、导航标签或面包屑。把这些信息硬编码在根布局中，会让布局不断了解每一条子路由；把它们复制到 React Context，又会产生另一份容易漂移的配置。

Data Mode route object 已经是完整的路由树。可以让每条 route 在 `handle` 中声明自己的元数据，再由祖先布局使用 `useMatches()` 读取当前 active 分支。面包屑只是这个模式的一个例子，同样的方式也能组成页面标题或导航辅助信息。

## 三、核心概念

### 1. `handle` 是应用自定义元数据容器

`handle` 没有固定的业务字段。React Router 把它附加到匹配结果上，具体结构由应用约定。Data Mode 中可以直接在 route object 上写入对象：

```tsx
const routes = [
  {
    path: '/workspace',
    handle: { breadcrumb: { label: '工作区', to: '/workspace' } },
    Component: WorkspaceLayout,
  },
]
```

本课 Demo 约定 `breadcrumb` 是一个描述对象：

```tsx
type BreadcrumbDescriptor = {
  label: string | ((match: UIMatch) => string)
  to?: string | ((match: UIMatch) => string)
}

type RouteHandle = {
  breadcrumb?: BreadcrumbDescriptor
}

function readBreadcrumbDescriptor(match: UIMatch): BreadcrumbDescriptor | undefined {
  if (!match.handle || typeof match.handle !== 'object') return undefined
  const candidate = (match.handle as RouteHandle).breadcrumb
  if (!candidate || typeof candidate !== 'object') return undefined
  if (typeof candidate.label !== 'string' && typeof candidate.label !== 'function') return undefined
  if (
    candidate.to !== undefined &&
    typeof candidate.to !== 'string' &&
    typeof candidate.to !== 'function'
  ) {
    return undefined
  }
  return candidate
}

const workspaceHandle = {
  breadcrumb: { label: '工作区', to: '/workspace' },
} satisfies RouteHandle
```

这个类型是应用代码，不是 React Router 的内置字段。使用稳定的字段约定后，布局只需要处理一种输出格式，route 也不需要知道布局如何绘制。

### 2. `useMatches()` 提供当前 active route hierarchy

```tsx
function Breadcrumbs() {
  const matches = useMatches()

  return (
    <ol>
      {matches.map((match) => {
        const breadcrumb = readBreadcrumbDescriptor(match)
        return breadcrumb ? <li key={match.id}>...</li> : null
      })}
    </ol>
  )
}
```

每个 UI match 至少包含 `id`、`pathname`、`params`、`loaderData` 和 `handle`。返回的是当前 URL 从父到子的匹配链，不是全部 route 清单；未匹配的 sibling 不会出现在结果中。

### 3. 动态面包屑读取对应 match 的 `loaderData`

项目详情的标题通常来自 loader，而不是 URL 中的 `projectId`。route 可以让 `handle` 声明如何从本 route 的 loader data 生成标签：

```tsx
const projectRoute = {
  id: 'project-detail',
  path: 'projects/:projectId',
  loader: projectLoader,
  handle: {
    breadcrumb: {
      label: (match: UIMatch) => {
        const project = match.loaderData as { title?: string } | undefined
        return project?.title ?? '项目'
      },
      to: (match: UIMatch) => match.pathname,
    },
  } satisfies RouteHandle,
}
```

渲染器把当前 match 传给约定函数，函数可以读取它的 `loaderData`、`params` 与 `pathname`。这样项目名称仍由项目 route 所有，布局只负责组合；如果 loader 失败或没有数据，标签函数必须返回可理解的 fallback。链接优先复用 `match.pathname`，避免重新拼接动态路径。

### 4. `handle`、loader data 和组件各自负责什么

| 需求 | 合适的所有者 | 原因 |
| --- | --- | --- |
| 当前 route 的标题、导航标签 | `handle` | 元数据跟随 route 配置和匹配链传播。 |
| 项目名称、账户信息等运行时数据 | `loader` | 数据由 route 负责加载并进入 `loaderData`。 |
| 面包屑的 HTML、链接和当前项状态 | 祖先布局组件 | 布局可以统一控制可访问性与视觉结构。 |
| 跨所有页面的品牌名称或主题 | 应用全局配置 | 它不属于某一条 route 的匹配元数据。 |

只需要一个已知 parent 的数据时，使用 `useRouteLoaderData(routeId)` 更直接；需要遍历当前分支并组合每一级 route 时，才使用 `useMatches()`。

## 四、用法与示例

### 1. 过滤并按顺序渲染面包屑

```tsx
function Breadcrumbs() {
  const items = useMatches().flatMap((match) => {
    const breadcrumb = readBreadcrumbDescriptor(match)
    return breadcrumb ? [{ match, breadcrumb }] : []
  })

  return (
    <ol aria-label="面包屑">
      {items.map(({ match, breadcrumb }, index) => {
        const label =
          typeof breadcrumb.label === 'function'
            ? breadcrumb.label(match)
            : breadcrumb.label
        const current = index === items.length - 1
        return <li key={match.id} aria-current={current ? 'page' : undefined}>{label}</li>
      })}
    </ol>
  )
}
```

匹配顺序已经是父到子，因此不要按 URL 字符串再次拆分或使用固定数组下标。用稳定 `match.id` 作为 React key；如果只渲染面包屑文字，可以让最后一项不带链接，避免当前页面链接制造无意义的导航。

### 2. 给动态资源提供 fallback

动态标签读取 `loaderData` 时，要处理还没有数据或数据结构不符合预期的情况：

```tsx
const projectBreadcrumb = {
  label: (match: UIMatch) => {
    if (!match.loaderData || typeof match.loaderData !== 'object') return '项目'
    const title = (match.loaderData as { title?: unknown }).title
    return typeof title === 'string' && title.length > 0 ? title : '项目'
  },
} satisfies BreadcrumbDescriptor
```

`useMatches()` 的 match 类型默认不会知道你的 `handle` 结构。上面的 `readBreadcrumbDescriptor` 先检查未知值的对象形状，再把它窄化为应用合同；布局只调用这个守卫，不在 JSX 分支中直接断言 `handle`。

### 3. 处理无元数据的布局 route

不是每一条 route 都需要出现在面包屑中。纯布局 route 可以没有 `handle.breadcrumb`，渲染器过滤它即可。不要为了让列表“每层都有项目”而给技术性 layout 添加误导性的标题；面包屑应表达用户可理解的页面层级。

## 五、用法示例或 Demo

:::demo{id="react.router.learn.intermediate.route-metadata-and-breadcrumbs.breadcrumbs-demo"}
Demo 从项目设置页开始。顶部面包屑由 `useMatches()` 读取当前 active matches：工作区和项目使用 route handle，项目名称从项目 loader data 动态得到，设置页提供当前项元数据。切换 alpha/beta、项目总览和设置页，观察 URL、match ID、面包屑条目及当前项 `aria-current`；“项目布局” route 没有面包屑元数据，因此不会制造额外层级。
:::

## 六、易错使用提示

:::pitfalls
### 错误：把 `handle` 当成 Router 预定义的 `meta` 字段

**触发条件：** 在 route object 中写入一个期待 Router 自动渲染的 `meta.title`，却没有自己的读取和渲染代码。

**原因：** `handle` 只是应用自定义数据容器，字段名和消费方式由应用决定。

**后果：** 面包屑或标题不会出现，问题只能在运行时发现。

**错误示例：**

```tsx
{ path: '/workspace', handle: { meta: { title: '工作区' } } }
```

**正确写法：**

```tsx
{ path: '/workspace', handle: { breadcrumb: { label: '工作区' } } }
```

**验证方式：** 在布局中用 `useMatches()` 读取并显示 `match.handle`，确认渲染器读取的是双方约定的字段。

### 错误：从所有 route 配置生成面包屑

**触发条件：** 遍历静态 route 数组，而不是读取当前 URL 的 matches。

**原因：** route 配置包含 sibling 和未访问分支，不能代表当前页面层级。

**后果：** 面包屑会出现当前页面之外的章节，或者顺序与实际匹配不符。

**错误示例：**

```tsx
routes.flatMap((route) => route.handle?.breadcrumb ?? [])
```

**正确写法：**

```tsx
useMatches().flatMap((match) => {
  const breadcrumb = readBreadcrumbDescriptor(match)
  return breadcrumb ? [breadcrumb] : []
})
```

**验证方式：** 在不同 sibling URL 间切换，确认列表只包含当前 URL 的父到子分支。

### 错误：用固定下标读取当前层级

**触发条件：** 使用 `matches[2]` 表示“项目 route”。

**原因：** 路由树增加布局或 index route 后，下标语义会改变。

**后果：** 标签和数据可能来自错误的 route。

**错误示例：**

```tsx
const project = useMatches()[2]
```

**正确写法：**

```tsx
const project = useMatches().find((match) => match.id === 'route-metadata-project')
```

**验证方式：** 给 route 增加或移除一个布局层，确认按显式 ID 查找仍然得到同一个业务 route。

### 错误：把动态标题复制到全局状态

**触发条件：** 项目 loader 加载名称后，再写入 Context 或全局 store 供面包屑读取。

**原因：** 当前 match 已经同时提供 handle 和 loaderData，额外复制会产生第二个数据源。

**后果：** 返回、刷新或切换项目时标题可能过期。

**错误示例：**

```tsx
setCurrentProjectTitle(project.title)
```

**正确写法：**

```tsx
const title = readBreadcrumb(projectMatch)?.label(projectMatch)
```

**验证方式：** 直接刷新两个项目的深链，确认标题来自当前 URL 对应的 loader data。

### 错误：当前项仍然渲染为普通链接

**触发条件：** 所有面包屑都输出 `<Link>`，没有标记最后一项。

**原因：** 当前页面不是一个新的导航目标，链接也没有表达当前状态。

**后果：** 键盘和辅助技术用户无法判断当前位置。

**错误示例：**

```tsx
<Link to={item.to}>{item.label}</Link>
```

**正确写法：**

```tsx
current ? <span aria-current="page">{item.label}</span> : <Link to={item.to}>{item.label}</Link>
```

**验证方式：** 检查最后一项的 `aria-current="page"`，并确认前面的项目仍可键盘聚焦和导航。
:::

## 七、源码推导与适用场景

### 1. `useMatches()` 是 active branch 的 UI 投影

**官方事实：** 固定版本的 `useMatches` 从 Router state 读取当前 matches，并将每条 route 的 `id`、pathname、params、loaderData 和 handle 组合成 `UIMatch`。

**课程推导：** 祖先布局可以把面包屑、页面标题或权限提示集中渲染，而不需要知道每条子 route 的组件实现。

**边界：** 它只覆盖当前 Data Router 已知的匹配树；另一个嵌套且未登记给该 Router 的 `<Routes>` 树不会自动出现。

### 2. `handle` 的字段是应用合同

**官方事实：** Data Route Object 文档把 `handle` 描述为应用可以放入 match 的任意数据，并以面包屑作为使用方向。

**课程推导：** 应用应定义一个小而稳定的 handle 类型，例如只允许 `breadcrumb` 描述对象，并集中处理未知值。

**边界：** React Router 不会替应用校验业务字段、生成 HTML 或保证 handle 与 loader data 的类型关联；这些需要 TypeScript 类型和运行时窄化共同维护。

### 3. 动态面包屑属于 route data 的组合视图

**官方事实：** UIMatch 同时暴露 handle 和该 route 的 loaderData；loaderData 在没有结果或错误边界路径中可能是 `undefined`。

**课程推导：** 动态资源标题可以由该 route 的 handle 读取自己的 loaderData 生成，布局只负责排列和无障碍标记。

**边界：** 如果页面需要跨多个 route 共享一个已知数据所有者，优先使用 `useRouteLoaderData`；不要把 matches 当成全局数据仓库。

## 八、练习

:::exercise
### 练习目标

**要求：** 建立 `account-root`、`account-project` 和 `account-settings` 三条嵌套路由。给 root、project 和 settings 配置 `handle.breadcrumb`，让 project 的标签读取自己的 loader data。祖先布局使用 `useMatches()` 输出可导航的父项和带 `aria-current="page"` 的当前项。再加入一个 sibling `account-billing`，确认它不出现在 project URL 的面包屑中。

**验收：** 直接进入 project settings 深链时，顺序为账户、项目名称、设置；切换到 billing 后，面包屑只包含账户、账单分支；刷新页面后动态项目名称仍来自 loader data；删掉 project handle 后只减少一项，不影响其它 route。
:::

## 九、本节小结

- `handle` 是 route object 提供给 UI match 的应用自定义元数据容器。
- `useMatches()` 返回当前 active route hierarchy，可按父到子顺序聚合面包屑。
- 动态面包屑可以读取对应 match 的 loaderData，但要提供 fallback 并保持数据所有权清晰。
- 不需要面包屑的技术性布局 route 可以省略 handle，渲染器应过滤空值。
- 只读取某个已知 route 数据时用稳定 ID 和 `useRouteLoaderData`，不要用固定 matches 下标。

## 十、参考资料

- [Route Object（Data Mode）](https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/start/data/route-object.md) - `handle` 的 Data Mode route object 合同。
- [useMatches API](https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/api/hooks/useMatches.md) - active matches、loaderData 和 handle 的公开字段。
- [Using handle](https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/how-to/using-handle.md) - 使用 handle 与 useMatches 组织面包屑的官方示例。
- [UI Match Type](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1114-L1145) - 固定版本 UIMatch 字段组成。
- [useMatches Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/hooks.tsx#L1569-L1615) - 固定版本 active match 投影实现。
