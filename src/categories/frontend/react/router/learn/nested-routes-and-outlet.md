---
id: react.router.learn.basics.nested-routes-and-outlet
type: lesson
title: 嵌套路由与 Outlet
summary: 用父子 route tree 组织共享界面，并在父组件的 Outlet 位置渲染当前匹配的子页面。
domain: frontend
technology: react
module: router
stage: basics
level: beginner
estimatedMinutes: 80
prerequisites:
  - react.router.learn.basics.nav-link-state
related:
  - react.router.learn.basics.route-objects
  - react.router.learn.basics.route-matching
  - react.router.learn.basics.link-navigation
tags:
  - React Router
  - Nested Routes
  - Outlet
  - children
  - parent route
  - child route
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-19
objectives:
  - 能用 children 把带 path 的 parent route 与相对 path child 组织成 route tree。
  - 能根据 location 写出当前匹配的 parent-to-child branch 和完整 URL。
  - 能在 parent route Component 中用 Outlet 指定匹配 child 的渲染位置。
  - 能解释没有 child match 时 Outlet 返回 null，而不是自动选择第一个 child。
  - 能区分 RouteObject children、React children 与 Outlet context 的职责。
recap:
  - children 建立 route tree，父 path 会自动包含进相对 child URL。
  - 当前 location 选择一条 parent-to-child branch，不会同时渲染全部 children。
  - parent Component 提供共享 UI，Outlet 决定匹配 child element 的插入位置。
  - parent Component 遗漏 Outlet 时，匹配 child 不会自动出现在组件树里。
  - 没有 child match 时 Outlet 返回 null，children 数组顺序不代表默认 child。
  - 每个需要继续展示下一层 child 的 parent Component 都要提供自己的 Outlet。
sources:
  - title: React Router 8.3.0 Release
    url: https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0
    sourceType: release-note
    appliesTo: React Router 8.3.0
    claims:
      - 8.3.0 是核验时的稳定发布版本。
  - title: npm react-router Latest Metadata
    url: https://registry.npmjs.org/react-router/latest
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - npm latest 端点在核验时返回 8.3.0。
  - title: React Router 8.3.0 Data Mode Routing
    url: https://reactrouter.com/8.3.0/start/data/routing
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - children、父子 path 合成、嵌套路由与 Outlet 的公开合同。
      - layout route 与 index route 的术语边界。
  - title: React Router 8.3.0 Outlet
    url: https://reactrouter.com/8.3.0/api/components/Outlet
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Outlet 渲染当前 parent route 的匹配 child，或在没有匹配 child 时返回 null。
      - Outlet context 是可选的数据传递能力。
  - title: React Router 8.3.0 Link
    url: https://reactrouter.com/8.3.0/api/components/Link#relative
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - 相对 to 默认按 route hierarchy 解析。
  - title: React Router 8.3.0 createMemoryRouter
    url: https://reactrouter.com/8.3.0/api/data-routers/createMemoryRouter
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - createMemoryRouter 在内存中管理 location stack 与 initialEntries。
  - title: React Router 8.3.0 Outlet Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/components.tsx#L926-L967
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 固定版本的 Outlet 组件委托 useOutlet 渲染当前层 child element。
  - title: React Router 8.3.0 Match Rendering Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/hooks.tsx#L1186-L1375
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 固定版本从叶到根组合匹配分支，并把更深层 element 作为当前层 outlet。
  - title: React Router 8.3.0 useOutlet Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/useOutlet-test.tsx#L11-L158
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 官方测试覆盖无 child 时返回 null，以及匹配 child 时得到 element。
  - title: React Router 8.3.0 Route Matching Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/route-matching-test.tsx#L41-L116
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 官方测试覆盖对象 route tree 的父子匹配与多层 Outlet 组合。
---

# 嵌套路由与 Outlet

## 一、学习目标

- 能用 `children` 建立带 `path` 的 parent route 与相对 path child。
- 能从 location 写出当前匹配的 parent-to-child branch 和完整 URL。
- 能在 parent route Component 中用 `<Outlet />` 指定 child 的渲染位置。
- 能解释父地址没有匹配 child 时，Outlet 为什么没有内容。
- 能区分 route object 的 `children`、React 的 `children` prop 与 Outlet 的职责。

本课只讨论带 path 的父子 route 和无 prop 的 `<Outlet />`。不展开不贡献 URL segment 的布局 route、
父地址的默认 child、动态段、loader、错误边界或 Outlet 数据共享。

## 二、为什么需要嵌套路由

假设项目工作台有两个地址：

```text
/projects/overview
/projects/activity
```

两个页面都需要显示“项目工作台”标题、子导航和工具区，只有主内容不同。如果把它们配置成互不相关的
平级页面，共享界面要么重复编写，要么被移到 Router 外部，无法表达“它只属于 `/projects` 分支”。

嵌套路由把稳定部分交给 parent route，把变化部分交给 child route：

```text
projects parent
├── overview child
└── activity child
```

当 location 是 `/projects/overview` 时，匹配结果不是只剩 `overview`，而是一条分支：

```text
projects -> overview
```

parent Component 和 child Component 都参与本次 UI。parent 决定共享界面，并通过 `<Outlet />` 指定 child
进入组件树的位置。

## 三、核心概念

### 1. children 建立 route tree

non-index route 的 `children` 可以继续包含 route object，从而形成递归 route tree：

```tsx
const routes = [
  {
    path: 'projects',
    Component: ProjectsLayout,
    children: [
      { path: 'overview', Component: ProjectOverview },
      { path: 'activity', Component: ProjectActivity },
    ],
  },
]
```

这里的 child path 是相对于 parent path 的 route pattern。父 path 会自动包含进 child URL：

| parent path | child path | 完整 URL            |
| ----------- | ---------- | ------------------- |
| `projects`  | `overview` | `/projects/overview` |
| `projects`  | `activity` | `/projects/activity` |

child 不需要再重复写 `projects`。

### 2. location 选择一条匹配分支

`children` 是候选 route，不是要同时渲染的组件数组。Router 会根据 location 选择一条分支：

```text
location /projects/activity

matched:
  projects
  activity

not matched:
  overview
```

所以一个 Outlet 在当前层只会得到本次匹配的下一层 child element，不会遍历并显示所有 children。

### 3. Outlet 是 child element 的插入点

parent route 的 Component 使用 `<Outlet />`，明确 child 应该出现在共享 UI 的哪个位置：

```tsx
import { Outlet } from 'react-router'

function ProjectsLayout() {
  return (
    <main>
      <h2>项目工作台</h2>
      <ProjectNavigation />
      <Outlet />
    </main>
  )
}
```

`/projects/overview` 下，`ProjectOverview` 进入这个位置；导航到 `/projects/activity` 后，parent 标题与导航
继续存在，Outlet 中的 element 改为 `ProjectActivity`。

Outlet 不负责匹配 URL，也不接收“要渲染哪个 child”的 prop。Router 已经根据当前 location 选好 child，
Outlet 只消费当前层的匹配结果。

### 4. 没有 child match 时 Outlet 返回 null

上面的 route tree 没有为 `/projects` 配置同地址 child。直接进入父地址时：

```text
location /projects
matched: projects
matched child: none
Outlet result: null
```

parent Component 仍然渲染，但 Outlet 位置没有 child element。`children` 数组第一项不会自动成为默认页。
需要父地址显示默认 child 时，必须显式建立相应 route 合同；本课不展开该配置。

### 5. children 不是 React children prop

这两个同名概念属于不同层：

| 名称                     | 所属层       | 职责                              |
| ------------------------ | ------------ | --------------------------------- |
| `RouteObject.children`   | Router 配置  | 建立候选 child route              |
| React `props.children`   | 组件调用关系 | 接收 JSX 调用处传入的子节点        |
| `<Outlet />`             | route 渲染   | 渲染当前层实际匹配的 child element |

Router 不会把 `RouteObject.children` 数组作为 `props.children` 传给 parent Component。parent 要接入 child
route UI，必须渲染 Outlet。

### 6. 多层嵌套需要逐层 Outlet

三层分支可能是：

```text
workspace -> projects -> activity
```

`Workspace` 的 Outlet 接入 `Projects`，`Projects` 还需要自己的 Outlet 才能接入 `Activity`。根部的一个
Outlet 不会跳过中间 parent，直接寻找任意深度的 leaf。

## 四、用法与示例

### 1. 配置带 path 的 parent route

先让 parent route 同时贡献 URL prefix 和共享 UI：

```tsx
import { createBrowserRouter, type RouteObject } from 'react-router'

const routes = [
  {
    id: 'projects',
    path: 'projects',
    Component: ProjectsLayout,
    children: [
      { id: 'project-overview', path: 'overview', Component: ProjectOverview },
      { id: 'project-activity', path: 'activity', Component: ProjectActivity },
    ],
  },
] satisfies RouteObject[]

const router = createBrowserRouter(routes)
```

这是一个带 path 的 parent route。它可以承担视觉上的共享界面，但不要把它与“省略 path、不增加 URL
segment”的专门布局 route 分类混为一谈。

### 2. 把 Outlet 放在准确的 UI 位置

Outlet 可以位于标题、导航或工具区之后。它在 JSX 中的位置就是 child element 在 parent UI 中的位置：

```tsx
function ProjectsLayout() {
  return (
    <section>
      <header>
        <h2>项目工作台</h2>
      </header>

      <ProjectNavigation />

      <section aria-label="项目子页面">
        <Outlet />
      </section>
    </section>
  )
}
```

Outlet 不是 Portal，也不会把 child 渲染到组件树之外。

### 3. 在 parent context 中使用相对导航

parent Component 内的简单相对目标会根据它所在的 route context 解析：

```tsx
import { NavLink, Outlet } from 'react-router'

function ProjectsLayout() {
  return (
    <section>
      <nav aria-label="项目子页面">
        <NavLink to=".">仅显示父级</NavLink>
        <NavLink to="overview">项目概览</NavLink>
        <NavLink to="activity">最近活动</NavLink>
      </nav>
      <Outlet />
    </section>
  )
}
```

在这个 parent route context 中，`.` 指向 `/projects`，`overview` 指向 `/projects/overview`，`activity`
指向 `/projects/activity`。这些 `to` 值负责解析导航目标，不会创建或改变 route tree。

### 4. 父组件遗漏 Outlet 不会阻止 URL 匹配

如果 route tree 已经包含 activity child，但 `ProjectsLayout` 没有 Outlet，导航仍可能到达
`/projects/activity`，parent route 也仍然匹配。缺少的是把已经匹配的 child element 接入 parent 返回值
的步骤，因此只看 URL 不能证明嵌套路由 UI 已经完成。

### 5. Outlet context 属于另一项职责

公开 API 允许 `<Outlet context={value} />` 向下方 element tree 提供值，并由 `useOutletContext()` 读取。
它解决父 route UI 向 child route UI 传值的问题，不负责 route 匹配，也不是 loader data。本课只使用无
prop 的 `<Outlet />`，让“匹配哪一个 child”和“child 出现在哪里”保持清晰。

## 五、观察父子路由渲染

下面的 Demo 使用 `createMemoryRouter` 隔离 history。route tree 只有一个带 path 的 `projects` parent 和
两个相对子 route：`overview`、`activity`。

初始 location 是 `/projects/overview`。切换 child 时，共享标题、导航与父层计数继续存在，Outlet 区域
替换为新的 child。进入 `/projects` 时没有 child match，因此 Outlet slot 保留，但 child element 数量为
零。外层学习站仍由 Vue Router 管理，宿主 URL 始终不变。

:::demo{id="react.router.learn.basics.nested-routes-and-outlet.outlet-demo"}
:::

观察时可以检查：

1. 初始 parent 标题与“项目概览”child 同时可见，内存地址为 `/projects/overview`。
2. 增加父层计数后切换到“最近活动”，计数保留，Outlet child 只剩“最近活动”。
3. 选择“仅显示父级”后，内存地址为 `/projects`，parent UI 仍在，Outlet slot 中没有 child。
4. 三个入口都是具有真实 `href` 的 anchor，键盘可以聚焦并激活。
5. 内存地址改变，但“宿主初始地址”和“宿主当前地址”始终相同。

## 六、易错使用提示

:::pitfalls
### 错误：只配置 children，parent Component 遗漏 Outlet

**触发条件：** route object 已经包含 child，但 parent Component 只返回标题和导航。

**原因：** 误以为 Router 会把匹配 child 自动追加到 parent DOM 末尾。

**后果：** URL 可以进入 child 地址，parent UI 也可见，但 child UI 不出现。

**错误示例：**

```tsx
function ProjectsLayout() {
  return <h2>项目工作台</h2>
}
```

**正确写法：**

```tsx
function ProjectsLayout() {
  return (
    <section>
      <h2>项目工作台</h2>
      <Outlet />
    </section>
  )
}
```

**验证方式：** 进入 `/projects/overview`，同时检查 parent 标题和 overview child 标题，两者都应可见。

### 错误：child path 重复 parent path

**触发条件：** parent 已写 `path: 'projects'`，child 又写 `path: 'projects/overview'`。

**原因：** 不知道 parent path 会自动包含进相对 child URL。

**后果：** 实际 pattern 变为 `/projects/projects/overview`，预期的 `/projects/overview` 无法命中该 child。

**错误示例：**

```tsx
{
  path: 'projects',
  children: [{ path: 'projects/overview', Component: ProjectOverview }],
}
```

**正确写法：**

```tsx
{
  path: 'projects',
  children: [{ path: 'overview', Component: ProjectOverview }],
}
```

**验证方式：** 用 `matchRoutes` 或真实 Router 分别检查 `/projects/overview` 与重复路径地址的匹配分支。

### 错误：把 route children 当成同时渲染的组件数组

**触发条件：** 期待 overview 与 activity 同时出现在一个 Outlet，或在 parent 中手工渲染两个页面。

**原因：** 把候选 child route 与 React 的静态组件组合混为一谈。

**后果：** URL 只匹配一个 child，页面却显示多个互相矛盾的子页面。

**错误示例：**

```tsx
function ProjectsLayout() {
  return (
    <main>
      <ProjectOverview />
      <ProjectActivity />
    </main>
  )
}
```

**正确写法：**

```tsx
function ProjectsLayout() {
  return (
    <main>
      <Outlet />
    </main>
  )
}
```

**验证方式：** 在 `/projects/activity` 检查 DOM；activity child 应出现一次，overview child 应不存在。

### 错误：认为父地址会自动选择第一个 child

**触发条件：** children 数组第一项是 overview，因此期待 `/projects` 自动显示它。

**原因：** 把配置顺序误当成默认 child 匹配规则。

**后果：** parent UI 出现但 Outlet 没有内容，开发者可能误判为渲染失败。

**错误示例：**

```tsx
const router = createMemoryRouter(routes, {
  initialEntries: ['/projects'],
})
// 错误预期：自动显示 overview child
```

**正确写法：**

```tsx
const router = createMemoryRouter(routes, {
  initialEntries: ['/projects/overview'],
})
// 当前 route tree 明确匹配 overview child
```

**验证方式：** 分别进入 `/projects` 与 `/projects/overview`；前者的 Outlet child 数量为零，后者为一。

### 错误：只在最外层提供一个 Outlet

**触发条件：** route tree 有三层，但中间 parent Component 没有 Outlet。

**原因：** 误以为根 Outlet 会跳过中间层，直接渲染任意深度的 leaf。

**后果：** 根与中间 parent 可见，最深 child 无法接入中间 parent 的组件树。

**错误示例：**

```tsx
function ProjectsLayout() {
  return <h2>项目工作台</h2>
}
```

**正确写法：**

```tsx
function ProjectsLayout() {
  return (
    <section>
      <h2>项目工作台</h2>
      <Outlet />
    </section>
  )
}
```

**验证方式：** 进入三层 leaf 地址，逐层检查每个 parent 与最终 leaf 都恰好出现一次。
:::

## 七、源码推导与适用场景

### 1. 匹配分支从 leaf 向 parent 组合

**官方事实：** 固定版本的匹配渲染实现从匹配数组末尾开始组合 element。每处理一层 match，就把更深
一层已经形成的 element 作为当前层 route context 的 `outlet`。

**课程推导：** 可以先确定 leaf child，再逐层向外检查每个 parent 是否提供 Outlet。这样比从根组件
猜测“child 会出现在哪里”更准确。

**边界：** 数组折叠方式、内部 context 字段和组件名属于 React Router 8.3.0 实现。应用只依赖公开的
route tree 与 Outlet 合同，不直接读取内部 context。

### 2. Outlet 只消费当前层 outlet

**官方事实：** 固定版本的 `<Outlet>` 委托 `useOutlet()`；该 hook 读取当前 route context 的 outlet，
有匹配 child 时返回 element，没有时返回 `null`。官方测试分别覆盖这两种结果。

**课程推导：** parent 地址没有 child match 时，空 Outlet 是正常匹配结果，不是 loading，也不应伪造
一个默认页面掩盖它。

**边界：** Outlet 的 context provider 组织方式是内部实现。`context` prop 是公开能力，但数据所有权与
类型封装需要单独设计。

### 3. parent path 自动进入 child URL

**官方事实：** Data Mode Routing Guide 明确说明 parent path 会自动包含进 child URL，相对 child
`path: 'overview'` 在 `path: 'projects'` 下形成 `/projects/overview`。

**课程推导：** route tree 每层只写自己负责的 segment，更容易从 URL 反推匹配分支，也避免重复
parent path。

**边界：** 没有 path 的布局 route、没有 Component 的 prefix route、index route 和绝对 child path
具有不同结构语义，不在本课的带 path parent/relative child 主线中展开。

### 4. 内存 Router 隔离嵌入式 Demo

**官方事实：** `createMemoryRouter` 在内存中管理 history，并用 `initialEntries` 指定初始 location。

**课程推导：** 内嵌学习 Demo 可以真实运行 parent/child 匹配、相对 Link 与 Outlet，同时避免接管外层
学习站的浏览器 history。

**边界：** 这是嵌入式 Demo 的宿主选择，不表示普通浏览器应用应该用 memory history 替代 browser
history。

### 5. 适用场景

适合使用嵌套路由与 Outlet：

- 一个 URL 分支共享标题、导航、侧栏或工具区，主内容随 child route 改变。
- 页面层级需要由深链、后退和刷新直接恢复，而不是由组件 State 手工选页。
- 每一层 parent 都能清楚指出下一层 child 应进入的 UI 位置。

不需要嵌套：

- 两个页面没有共享 route UI，也没有 parent-to-child 的 URL 关系。
- 变化只是当前组件内部的小区域切换，不需要独立可导航地址。

## 八、练习

:::exercise
### 练习目标

**要求：** 配置一个带 path 的 `account` parent route，以及相对 path 为 `profile`、`security` 的两个
child route。parent Component 显示“账户中心”标题、两个相对 `NavLink` 和一个 `<Outlet />`。再增加
一条指向 `.` 的父级链接，用于观察没有 child match 时的结果。

**验收：** `/account/profile` 与 `/account/security` 都同时显示 parent 标题和唯一匹配的 child；切换
child 时宿主没有完整文档刷新；进入 `/account` 后 parent 仍可见，Outlet 区没有 child；child path 没有
重复 `account`，所有导航入口都渲染为真实 anchor。
:::

## 九、本节小结

- `children` 把 route object 组织成 parent-to-child tree。
- parent path 自动进入相对 child URL，child 只写自己负责的 segment。
- location 选择一条匹配分支，不会同时渲染全部 children。
- parent Component 通过 `<Outlet />` 决定匹配 child 的插入位置。
- parent 遗漏 Outlet 时，匹配 child 不会自动进入组件树。
- 没有 child match 时 Outlet 返回 `null`，数组第一项不会自动成为默认页。
- 多层嵌套需要每个中间 parent 分别提供 Outlet。

## 十、参考资料

- [React Router 8.3.0 Release](https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0) - 稳定发布事实。
- [npm react-router Latest Metadata](https://registry.npmjs.org/react-router/latest) - npm latest 版本元数据。
- [React Router 8.3.0 Data Mode Routing](https://reactrouter.com/8.3.0/start/data/routing) - children、父子 path、嵌套路由与结构边界。
- [React Router 8.3.0 Outlet](https://reactrouter.com/8.3.0/api/components/Outlet) - child element、null 结果与 context prop。
- [React Router 8.3.0 Link](https://reactrouter.com/8.3.0/api/components/Link#relative) - 相对 to 的 route context 语义。
- [React Router 8.3.0 createMemoryRouter](https://reactrouter.com/8.3.0/api/data-routers/createMemoryRouter) - 内存 history 与 initialEntries。
- [React Router 8.3.0 Outlet Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/components.tsx#L926-L967) - 固定版本 Outlet 实现。
- [React Router 8.3.0 Match Rendering Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/hooks.tsx#L1186-L1375) - 固定版本匹配分支组合路径。
- [React Router 8.3.0 useOutlet Tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/useOutlet-test.tsx#L11-L158) - matched child 与 null 结果测试。
- [React Router 8.3.0 Route Matching Tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/route-matching-test.tsx#L41-L116) - parent/child 匹配与多层 Outlet 测试。
