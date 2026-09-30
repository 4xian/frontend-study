---
id: react.router.learn.basics.lab-nested-documentation-center
type: lesson
title: 实战：嵌套文档中心
summary: 组合多层布局、相对导航与 URL 状态，完成可深链、可筛选并能恢复历史 entry 的嵌套文档中心。
domain: frontend
technology: react
module: router
stage: basics
level: beginner
estimatedMinutes: 170
prerequisites:
  - react.router.learn.basics.lab-multi-page-course-center
  - react.router.learn.basics.nested-routes-and-outlet
  - react.router.learn.basics.layout-routes
  - react.router.learn.basics.index-routes
  - react.router.learn.basics.optional-segments-and-splats
  - react.router.learn.basics.route-params
  - react.router.learn.basics.query-params-and-url-state
  - react.router.learn.basics.location-and-history-state
related:
  - react.router.learn.basics.route-objects
  - react.router.learn.basics.route-matching
  - react.router.learn.basics.link-navigation
  - react.router.learn.basics.nav-link-state
  - react.router.learn.basics.dynamic-segments
tags:
  - React Router
  - Data Mode
  - 实战
  - 嵌套路由
  - 文档中心
  - 相对导航
  - URL 状态
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-20
objectives:
  - 能把文档首页、语言、章节、文档和归档翻译成职责明确的多层 route tree。
  - 能在 pathless 外框、文档根布局和章节布局中放置正确的 Outlet。
  - 能用 Index Route 为文档根 URL 与章节 URL 提供默认 child。
  - 能用相对 Link 和 NavLink 在章节子树内导航，并判断 route 与 path 相对语义。
  - 能组合继承参数、search、可选段、splat 与 location state，同时为直接入口提供回退。
  - 能通过 pathname、search、navigation type 和 key 验证 PUSH、REPLACE 与 POP。
recap:
  - 路由树表达 UI 所有权；每个有 Component 和 children 的布局都要为下一层提供 Outlet。
  - Index Route 表达 parent URL 的默认 child，可选段表达可缺失的 URL segment，两者不能互换。
  - 相对 route 导航按 route hierarchy 解析，pathless 和 index 层不会额外贡献 URL segment。
  - child 会继承 ancestor params；splat 只用于确实需要任意深度的尾部路径。
  - 资源身份属于 pathname，可分享筛选与视图属于 search，短期来源才属于 location state。
  - 内存 Router 让嵌入式 Demo 拥有独立 history，并保持外层学习站 URL 不变。
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
  - title: React Router 8.3.0 Data Mode Routing
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/start/data/routing.md#L21-L228
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - children 建立嵌套路由，child 通过 parent Outlet 渲染。
      - Layout Route、Index Route、动态段、可选段和 splat 的声明规则。
  - title: React Router 8.3.0 Outlet
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/components/Outlet.md#L19-L70
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Outlet 渲染 matching child，没有 child 时返回 null。
  - title: React Router 8.3.0 Link
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/components/Link.md#L19-L189
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Link 支持 route/path 相对语义、replace 和 location state。
      - pathless 与 index route 不参与相对 path 计算。
  - title: React Router 8.3.0 NavLink
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/components/NavLink.md#L19-L145
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - NavLink 在 active 时提供 aria-current，end 控制末端匹配。
  - title: React Router 8.3.0 useParams
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useParams.md#L19-L119
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - useParams 读取当前匹配参数，child 继承 ancestor params。
      - splat 使用星号键读取剩余路径。
  - title: React Router 8.3.0 useSearchParams
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useSearchParams.md#L19-L139
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - setter 会提交导航，searchParams 可变但不能只修改对象而不调用 setter。
      - defaultInit 不会在首次渲染时改写 URL。
  - title: React Router 8.3.0 useLocation
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useLocation.md#L19-L55
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - useLocation 返回当前已提交 Location。
  - title: React Router 8.3.0 createMemoryRouter
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/data-routers/createMemoryRouter.md#L19-L104
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - createMemoryRouter 使用内存 history，并支持 initialEntries。
  - title: React Router 8.3.0 Route Matching Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L648-L1260
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 固定版本把 route tree 展开、评分并选择 matching branch。
      - 静态段、动态段、index 与 splat 参与分支评分和匹配。
  - title: React Router 8.3.0 Relative Path Resolution Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1879-L1958
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - route-relative 的双点目标按 route pathname 层级上移。
      - path-relative 与 route-relative 使用不同的起点计算。
---

# 实战：嵌套文档中心

## 一、学习目标

- 能把文档首页、语言、章节、文档和归档翻译成一棵多层 route tree。
- 能判断哪一层拥有共享 UI，并为每个 matching child 放置正确的 `<Outlet />`。
- 能用 Index Route 为 `/docs` 和章节 URL 提供默认内容。
- 能在章节子树内使用相对 `Link`、`NavLink` 和 `end`，不重复父级完整路径。
- 能在文档页同时读取可选语言、章节 ID 和文档 ID，并为未知业务 ID 提供空态。
- 能把筛选、视图与短期来源分别放入 search 和 location state。
- 能用 optional segment、splat、Location、key 和 navigation type 检查深链与历史行为。

本实战只组合静态本地文档数据与已经建立的客户端路由能力。它不使用 loader、action、pending UI、
Route Error Boundary 或远程请求；Data Mode 在这里表示由 route objects 创建 Data Router，不等于每个
页面都必须提前使用数据 API。

## 二、为什么需要

多页面课程中心可以把首页、目录、详情和学习页放成根布局下的 sibling。文档站通常有更深的 UI
所有权：

```text
工作坊外框（不增加 URL）
└── 文档中心 /docs
    ├── 文档首页（index）
    ├── 指南 /docs/:language?/guides/:sectionId
    │   ├── 章节总览（index）
    │   └── 文档 /:documentId
    ├── 归档 /docs/archive/*
    └── 文档子树兜底 /*
```

打开一篇文档时，页面应同时保留文档中心标题、全局导航和章节目录，只替换章节 Outlet 中的内容。
如果把所有页面都写成根级 sibling，就必须在多个页面重复外框和目录；如果只嵌套 route object 却遗漏
中间 Outlet，URL 会匹配而页面内容不会出现。

文档 URL 还承担多种状态：

- `sectionId` 与 `documentId` 决定资源身份。
- 可选 `language` 决定语言版本；省略时使用默认语言。
- `q` 决定可复制的章节筛选，`view` 决定可恢复的文档视图。
- `location.state` 只记录“从哪个筛选结果进入”这类短期来源。
- `archive/*` 保留真实具有任意深度的归档路径。

把这些职责放回 route tree 和 URL 后，直接打开深链、复制链接、前进后退和未知 ID 都能按同一模型
解释，而不依赖用户必须从首页按固定顺序点击。

## 三、核心概念

### 1. Route tree 同时表达 URL 与 UI 所有权

route object 的 `children` 不只是文件分类。它声明 child 的 URL 基于哪个 parent，也声明 child element
进入哪个 parent Component 的 Outlet。

```tsx
{
  path: '/docs',
  Component: DocumentationLayout,
  children: [
    {
      path: ':language?/guides/:sectionId',
      Component: GuideSectionLayout,
      children: [
        { index: true, Component: SectionOverviewPage },
        { path: ':documentId', Component: DocumentPage },
      ],
    },
  ],
}
```

访问 `/docs/en/guides/foundations/route-tree` 时，matching branch 为：

```text
documentation -> guide-section -> document
```

`DocumentationLayout` 拥有文档中心外框，`GuideSectionLayout` 拥有章节目录，`DocumentPage` 只拥有
文档正文。每一层只处理自己的共享范围。

### 2. 每个有 child UI 的布局都需要 Outlet

两层布局意味着两个不同插入点：

```tsx
function DocumentationLayout() {
  return (
    <main>
      <DocumentationHeader />
      <Outlet />
    </main>
  )
}

function GuideSectionLayout() {
  return (
    <section>
      <SectionNavigation />
      <Outlet />
    </section>
  )
}
```

第一个 Outlet 接收章节布局、归档或文档首页；第二个 Outlet 接收章节总览或具体文档。Outlet 只渲染
当前 matching child，不扫描全部 children，也不把 route object 的 `children` 当成 React
`props.children`。

外层还可以有一个省略 `path` 的 pathless layout。它为所有后代增加 UI 外框，却不会给 URL 增加
segment。pathless layout 仍然有 Component 和 children，因此同样需要 Outlet。

### 3. Index、optional 与 splat 解决不同问题

这三种声明都可能“没有一个固定普通段”，但职责不能互换：

| 声明 | 作用 | 示例结果 |
| --- | --- | --- |
| `{ index: true }` | 在 parent URL 结束分支，提供默认 child | `/docs/guides/foundations` 显示章节总览 |
| `:language?` | 允许一个 URL segment 存在或缺失 | `/docs/guides/...` 与 `/docs/en/guides/...` |
| `archive/*` | 捕获固定前缀后的任意深度尾部 | `2025/release-notes` 保存在 `params['*']` |

Index Route 是 leaf，不能拥有 children。optional segment 仍属于普通 path pattern；存在时会产生参数，
缺失时值为 `undefined`。splat 必须位于 pattern 尾部，适合归档或文件树，不应替代精确文档 ID。

### 4. Child 会继承 ancestor params

具体文档 route 只声明 `:documentId`，但 `DocumentPage` 位于语言与章节 route 之下，因此可以同时读取
三层参数：

```tsx
const { language, sectionId, documentId } = useParams()
```

对于 `/docs/en/guides/foundations/route-tree`：

```text
language   = "en"
sectionId  = "foundations"
documentId = "route-tree"
```

参数只证明 URL pattern 已匹配，不证明业务数据存在。组件仍要分别检查语言、章节和文档集合，未知
`documentId` 应显示可恢复空态，不能读取未定义对象或伪造默认文档。

### 5. 相对导航按 route hierarchy 解析

章节布局内的文档链接不需要重复 `/docs/:language?/guides/:sectionId`：

```tsx
<NavLink to="." end relative="route">
  章节总览
</NavLink>

<NavLink to={document.id} relative="route">
  {document.title}
</NavLink>
```

在文档 route 中，`to=".." relative="route"` 返回 parent section route。默认值本来就是
`relative="route"`，这里显式写出是为了让代码表达教学意图。

`relative="route"` 的 `..` 移除一个 route pattern 层级；`relative="path"` 才按 pathname segment
上移。一个 route pattern 可以包含多个 segment，因此两种结果不一定相同。pathless layout 与 Index
Route 没有自己的 path，不会额外贡献相对 URL 层级。

### 6. URL 状态按恢复能力分工

文档中心使用三种存储位置：

| 状态 | 存放位置 | 原因 |
| --- | --- | --- |
| 语言、章节、文档身份 | pathname params | 决定资源，必须能直接打开 |
| 章节筛选、文档视图 | search params | 可复制、可刷新、可进入 history |
| 进入来源标签 | location state | 只增强当前 entry 的返回体验 |

相对 Link 的新 pathname 不会替你自动保留 search。需要保留筛选时，要显式把当前
`pathname + search` 写入受控来源，或把目标写成包含 search 的 `to` 对象。location state 又可能在
直接打开 URL 时缺失，所以页面必须始终保留一个由 route hierarchy 计算的稳定 Link。

### 7. Memory Router 提供独立 history

嵌入式 Demo 不能与外层 Vue Router 争夺浏览器地址栏，因此每次宿主挂载都创建独立 Router：

```tsx
export function createDocumentationCenterDemo() {
  const router = createMemoryRouter(routes, {
    initialEntries: ['/docs/guides/foundations?q=路由'],
  })

  return function DocumentationCenterDemo() {
    return <RouterProvider router={router} />
  }
}
```

初始 entry 的 action 为 POP、key 为 `default`。普通 Link 默认 PUSH；筛选输入和同文档视图切换可用
`replace: true` 更新当前 entry。POP 会恢复目标 entry 当时的 pathname、search、state 与 key。

## 四、用法与示例

### 1. 先写可检查的 route table

在写组件前，把页面、URL 和共享布局列成表：

| 页面 | Route | 共享布局 | 主要读取 |
| --- | --- | --- | --- |
| 文档首页 | `/docs` index | 文档根布局 | 无 |
| 章节总览 | `:language?/guides/:sectionId` index | 根布局 + 章节布局 | language、sectionId、q |
| 文档页 | `:documentId` | 根布局 + 章节布局 | 三个 params、view、state |
| 归档页 | `archive/*` | 文档根布局 | `params['*']` |
| 未匹配页 | `*` | 文档根布局 | pathname |

这张表让 `archive/*` 与文档动态段处在不同 branch，也让章节默认页成为显式 Index Route。页面不会靠
声明顺序猜测默认内容。

### 2. 用 pathless route 包住整个工作坊

pathless layout 只提供宿主说明，不进入 URL：

```tsx
const routes = [
  {
    Component: DocumentationWorkshopFrame,
    children: [
      {
        path: '/docs',
        Component: DocumentationLayout,
        children: [/* 文档子树 */],
      },
    ],
  },
] satisfies RouteObject[]
```

访问 `/docs` 而不是 `/workshop/docs`。组件名、route ID 和 pathless UI 都不会自动变成 pathname。

### 3. 在章节布局中使用相对 NavLink

章节布局知道当前章节和其文档集合，最适合拥有侧边目录：

```tsx
function GuideSectionLayout() {
  const { sectionId } = useParams()
  const section = findSection(sectionId)

  return (
    <section>
      <nav>
        <NavLink to="." end relative="route">
          章节总览
        </NavLink>
        {section?.documents.map((document) => (
          <NavLink key={document.id} to={document.id} relative="route">
            {document.title}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </section>
  )
}
```

总览 Link 使用 `end`，所以进入具体文档后不会继续保持 `aria-current="page"`。具体文档 NavLink 则只在
自己的 URL active。

### 4. 让章节 Index Route 从 search 派生列表

筛选词决定当前 URL 下看到的文档集合，复制链接应恢复同一结果：

```tsx
const [searchParams, setSearchParams] = useSearchParams()
const query = searchParams.get('q')?.trim() ?? ''
const visibleDocuments = documents.filter((document) =>
  `${document.title}${document.summary}`.includes(query),
)

function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
  const nextParams = new URLSearchParams(searchParams)
  if (event.currentTarget.value) nextParams.set('q', event.currentTarget.value)
  else nextParams.delete('q')
  setSearchParams(nextParams, { replace: true })
}
```

每次 render 都从当前 search 派生结果，没有第二份筛选 State。输入属于连续编辑，使用 REPLACE 避免每个
字符都新增一条 history entry。直接修改 `searchParams` 对象而不调用 setter 不会提交导航。

### 5. 从列表进入文档时只携带短期来源

文档身份已经在目标 pathname，来源只用于返回增强：

```tsx
<Link
  to={document.id}
  relative="route"
  state={{
    from: `${location.pathname}${location.search}`,
    label: section.title,
  }}
>
  阅读文档
</Link>
```

文档页先验证 state 形状和 `from` 是否属于受控章节 URL。可信来源存在时可以返回原筛选 entry；直接
打开文档时显示“直接访问”，并提供 `to=".." relative="route"` 的稳定章节 Link。必要业务数据不能
只放在 state。

### 6. 用 search 切换同一文档的视图

正文和大纲是同一资源的两种可分享视图，不需要新 route：

```tsx
const [searchParams, setSearchParams] = useSearchParams()
const view = searchParams.get('view') === 'outline' ? 'outline' : 'article'

function showOutline() {
  const nextParams = new URLSearchParams(searchParams)
  nextParams.set('view', 'outline')
  setSearchParams(nextParams, { replace: true, state: validatedState })
}
```

pathname 和三个参数保持不变，只有 search 与当前 entry 内容改变。如果文档页需要继续使用已验证的
来源 state，就在这次 navigation option 中显式携带它；新的 Location 不会因为 pathname 相同而自动
复制旧 state。未知 `view` 回退到正文，但不应把错误值复制成另一份本地 State。

### 7. 只让 splat 承担任意深度路径

归档确实允许年份后继续出现多层目录，因此使用 `archive/*`：

```tsx
function DocumentationArchivePage() {
  const { '*': archivePath } = useParams()
  return <strong>{archivePath || '（空）'}</strong>
}
```

`/docs/archive/2025/release-notes` 得到 `2025/release-notes`。普通文档仍使用精确
`:documentId`；否则拼错文档后继续追加任意层级也会被过宽 branch 吞掉。

## 五、Demo：嵌套文档中心

下面的 Demo 使用独立 `createMemoryRouter`。顶部观察区显示内部 pathname、search、action、key 与
state.from；外层学习站 URL 始终不变。

:::demo{id="react.router.learn.basics.lab-nested-documentation-center.documentation-center-demo"}
:::

按顺序观察一条完整流程：

1. 初始进入 `/docs/guides/foundations?q=路由`，文档根布局与章节布局同时存在，章节 Index Route 根据
   search 显示筛选结果；action 为 POP，key 为 `default`。
2. 修改筛选输入，search 改变而 pathname 不变；action 为 REPLACE，当前 key 随替换结果更新。
3. 点击相对“阅读文档”，进入 `/docs/guides/foundations/:documentId`；章节目录保留，文档链接获得
   `aria-current="page"`，state.from 记录原筛选 URL。
4. 切换到“大纲”，只增加 `?view=outline`，当前文档与 inherited params 不变。
5. 点击“返回筛选结果”，POP 恢复原章节 entry、筛选 search 和旧 key。
6. 切换 English，URL 增加可选 `en` segment；章节和文档 ID 的含义不变。
7. 打开“归档”，`archive/*` 读取 `2025/release-notes`；再打开另一条多级归档验证斜杠仍在 splat 中。
8. 直接打开一个不存在的文档 ID 时，动态 route 仍匹配，但正文显示业务空态和相对恢复 Link。

这些观察只证明客户端 route tree、URL 与内存 history 行为，不代表服务端深链回退、远程数据加载或
部署配置已经成立。

## 六、易错使用提示

:::pitfalls
### 错误：多层 children 只放一个 Outlet

**触发条件：** 文档根布局和章节布局都有 `children`，但只有根布局渲染 `<Outlet />`。

**原因：** 每一层 Outlet 只负责当前 parent 的 matching child，不能跨过中间布局替它提供插入点。

**后果：** 章节外框出现，URL 也进入具体文档，但章节总览或文档正文没有 DOM 落点。

**错误示例：**

```tsx
function GuideSectionLayout() {
  return <nav>章节目录</nav>
}
```

**正确写法：**

```tsx
function GuideSectionLayout() {
  return (
    <section>
      <nav>章节目录</nav>
      <Outlet />
    </section>
  )
}
```

**验证方式：** 分别打开章节 URL 与文档 URL；章节目录始终保留，Outlet 内容从总览切换为文档。

### 错误：child path 重复 parent 完整前缀

**触发条件：** 在 `/docs` 的 child 中再次写 `/docs/:language?/guides/:sectionId`。

**原因：** child route 本来就继承 parent path；重复绝对前缀让配置不再表达局部层级，并容易在重定位时
漏改一处。

**后果：** route tree 难以移动和复用，相对 Link 的上下文也与代码外观不一致。

**错误示例：**

```tsx
{ path: '/docs/:language?/guides/:sectionId', Component: GuideSectionLayout }
```

**正确写法：**

```tsx
{ path: ':language?/guides/:sectionId', Component: GuideSectionLayout }
```

**验证方式：** 从 parent 开始逐段拼接 route path，最终 URL 只包含一次 `/docs`。

### 错误：把 Index Route 改成可选文档参数

**触发条件：** 为了让章节 URL 显示默认页，把 `:documentId` 改成 `:documentId?`，并在同一组件中分支。

**原因：** optional segment 表达 URL 段可以缺失，不表达 parent Outlet 的默认 child 职责。

**后果：** 章节总览与文档详情耦合，NavLink `end`、空态和继续嵌套的边界都变得模糊。

**错误示例：**

```tsx
{ path: ':documentId?', Component: DocumentOrOverviewPage }
```

**正确写法：**

```tsx
children: [
  { index: true, Component: SectionOverviewPage },
  { path: ':documentId', Component: DocumentPage },
]
```

**验证方式：** 章节 URL 只命中 Index Route，追加一个文档段后只命中文档 leaf。

### 错误：用 splat 代替普通文档 ID

**触发条件：** 把文档 route 写成 `*` 或 `documents/*`，虽然文档 ID 永远只有一个 segment。

**原因：** splat 会捕获所有剩余字符，包括额外 `/`，匹配范围比业务身份更宽。

**后果：** 拼错或多写的深层路径仍被当成文档 ID，文档兜底页失去机会。

**错误示例：**

```tsx
{ path: '*', Component: DocumentPage }
```

**正确写法：**

```tsx
{ path: ':documentId', Component: DocumentPage }
{ path: 'archive/*', Component: DocumentationArchivePage }
```

**验证方式：** 普通文档只接受一个 segment；只有归档分支能读取包含 `/` 的星号参数。

### 错误：认为相对 Link 自动保留 search

**触发条件：** 在带 `?q=路由` 的章节页使用 `to={document.id}`，并假设目标仍携带该 search。

**原因：** 相对 pathname 解析和 search 是两个字段；指定新 pathname 时不会把旧筛选自动合并进去。

**后果：** 文档页看不到原筛选来源，返回时无法恢复相同结果。

**错误示例：**

```tsx
<Link to={document.id}>阅读文档</Link>
```

**正确写法：**

```tsx
<Link
  to={document.id}
  relative="route"
  state={{ from: `${location.pathname}${location.search}` }}
>
  阅读文档
</Link>
```

**验证方式：** 进入文档后 search 可按页面职责变化，但 state.from 精确保留原章节筛选 URL；直接入口
仍能用相对 Link 返回章节。

### 错误：只修改 searchParams 对象

**触发条件：** 调用 `searchParams.set('view', 'outline')` 后等待 Router 自动更新。

**原因：** `URLSearchParams` 可变不代表对象 mutation 是一次导航；只有 setter 会提交新 URL。

**后果：** 对象读数与 Location.search 分叉，刷新、复制和 history 都不能恢复界面。

**错误示例：**

```tsx
searchParams.set('view', 'outline')
```

**正确写法：**

```tsx
const nextParams = new URLSearchParams(searchParams)
nextParams.set('view', 'outline')
setSearchParams(nextParams, { replace: true })
```

**验证方式：** 切换视图后同时检查按钮状态、Location.search 与 navigation type。

### 错误：把 location state 当成文档身份

**触发条件：** 只在 state 中保存 `documentId`，或直接读取 `location.state.from` 而不验证。

**原因：** state 不出现在可复制 URL 中，直接访问、刷新边界或其他入口都可能没有它。

**后果：** 分享链接无法恢复文档，未知 state 还可能生成不受控返回目标。

**错误示例：**

```tsx
const document = findDocument(location.state.documentId)
```

**正确写法：**

```tsx
const { sectionId, documentId } = useParams()
const state = readDocumentationState(location.state)
```

**验证方式：** 直接打开文档 URL 时仍能从 params 找到正文；state 缺失只改变来源提示，不破坏页面。

### 错误：在组件 render 中创建 Memory Router

**触发条件：** 在 `DocumentationCenterDemo` 函数组件体内调用 `createMemoryRouter(routes)`。

**原因：** 组件重新 render 会创建新的 Router 和 history，而不是继续当前 entries。

**后果：** 文档路径、筛选、state 和 key 突然回到初始 entry。

**错误示例：**

```tsx
function DocumentationCenterDemo() {
  const router = createMemoryRouter(routes)
  return <RouterProvider router={router} />
}
```

**正确写法：**

```tsx
function createDocumentationCenterDemo() {
  const router = createMemoryRouter(routes)
  return function DocumentationCenterDemo() {
    return <RouterProvider router={router} />
  }
}
```

**验证方式：** 导航到文档后触发普通 render，Location 不重置；完整卸载并重新挂载才恢复初始 entry。
:::

## 七、源码推导与适用场景

### 1. Matching branch 来自整棵 route tree

**官方事实：** 固定版本先把 route tree 展开成 branches，计算静态、动态、index 与 splat 等分值，再按
完整路径选择 branch；不是简单采用第一个字符串前缀。

**课程推导：** `archive/*`、章节动态参数和文档动态参数可以放在明确子树中，静态 archive 前缀不会因
声明位置而被普通动态文档 branch 抢走。

**边界：** 分支评分是固定版本的实现证据。公共配置仍应让每条 route 表达清楚业务意图，不用评分
规则制造难读的重叠 pattern。

### 2. Outlet 沿 matching branch 逐层传递 child

**官方事实：** Outlet 渲染当前 route context 中的 child outlet，没有 matching child 时返回 null。

**课程推导：** 文档根布局与章节布局各保留一层共享 UI，只有最内层 Outlet 在总览与文档间切换。

**边界：** Outlet 保留的是当前 React route element 层级；它不保证业务 State 永久存在，也不替代缓存
或持久化。

### 3. Route-relative 双点使用 route pathname 层级

**官方事实：** 固定版本解析 `..` 时，route-relative 会按参与匹配的 route pathnames 上移；
path-relative 则从 location pathname 解析路径段。

**课程推导：** 文档页用显式 `relative="route"` 返回章节 parent，代码与 route tree 同步，而不是复制
可选语言和章节前缀。

**边界：** 相对导航只解决目标 pathname 的基准。需要保留 search、hash 或 state 时仍要明确提供这些
字段。

### 4. Search setter 提交导航，State 绑定 history entry

**官方事实：** `setSearchParams` 会提交导航；Link 的 `state` 进入目标 Location，并由
`history.state` 保存。

**课程推导：** 章节筛选和文档视图可用 search 恢复，来源 state 随对应 entry 在 POP 时恢复。

**边界：** state 不在服务端或复制 URL 中。身份、权限、正文数据与持久化进度不能依赖它。

### 5. 适用范围是静态客户端文档导航

这套结构适合本地文档、帮助中心、设置手册和具有稳定层级的知识库。文档集合在本实战中是同步常量，
所以未知 ID 是普通业务空态。

当内容来自服务器时，数据请求、重定向、提交、pending、错误边界与重新验证是独立能力，不能用本实战
的同步查找结论代替。本实战也不证明静态服务器会为深链返回 SPA 入口；部署回退需要匹配环境验证。

## 八、练习

:::exercise
### 练习目标

**要求：** 完成三个纵向改动。第一，在章节 search 中同时维护 `q` 与 `sort=title|default`，修改任一项时
保留另一项，并用 REPLACE 避免输入 history 膨胀。第二，在章节下增加精确的 `examples/:exampleId`
branch，预测它与 `:documentId` 的匹配结果，并证明静态 `examples` 前缀优先。第三，先从带筛选的章节
进入文档，再切换大纲、POP 返回并直接打开同一文档 URL，逐步记录 params、search、state.from、key
和 navigation type 的变化。

**验收：** 筛选只由 URL 派生；新 branch 不使用 splat；相对章节返回不硬编码可选语言前缀；直接入口
没有 state 仍可渲染；所有 parent 与 child 内容都有对应 Outlet。
:::

## 九、本节小结

- route tree 同时表达 URL 层级和共享 UI 所有权，多层布局需要多层 Outlet。
- Pathless Layout Route 增加 UI 而不增加 segment；Index Route 为 parent URL 提供默认 child。
- optional segment 允许一个段缺失，splat 捕获任意深度尾部，两者都不替代精确文档参数。
- child 继承 ancestor params，但参数匹配后仍要检查本地章节和文档是否存在。
- 相对 route Link 跟随 route hierarchy；`end` 让章节总览只在精确 parent URL active。
- 资源身份属于 pathname，筛选与视图属于 search，短期来源才属于 location state。
- Memory Router 隔离嵌入式 Demo history；PUSH、REPLACE 与 POP 可通过 action 和 key 观察。
- 静态客户端导航不包含 loader、action、pending、错误边界或部署深链回退。

## 十、参考资料

- [React Router 8.3.0 Release](https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0) - 稳定版本、tag 与发布说明。
- [React Router 8.3.0 Data Mode Routing](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/start/data/routing.md#L21-L228) - nested、layout、index、动态段、optional 与 splat。
- [React Router 8.3.0 Outlet](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/components/Outlet.md#L19-L70) - matching child 的渲染位置。
- [React Router 8.3.0 Link](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/components/Link.md#L19-L189) - relative、replace 与 state。
- [React Router 8.3.0 NavLink](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/components/NavLink.md#L19-L145) - active、aria-current 与 end。
- [React Router 8.3.0 useParams](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useParams.md#L19-L119) - 参数继承与 splat 读取。
- [React Router 8.3.0 useSearchParams](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useSearchParams.md#L19-L139) - search 读取、setter 导航与可变对象边界。
- [React Router 8.3.0 useLocation](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useLocation.md#L19-L55) - 当前 Location 与 state 读取入口。
- [React Router 8.3.0 createMemoryRouter](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/data-routers/createMemoryRouter.md#L19-L104) - 独立内存 history 与初始 entries。
- [React Router 8.3.0 Route Matching Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L648-L1260) - 固定版本的 branch 展开、评分与匹配实现。
- [React Router 8.3.0 Relative Path Resolution Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1879-L1958) - route-relative 与 path-relative 的固定实现证据。
