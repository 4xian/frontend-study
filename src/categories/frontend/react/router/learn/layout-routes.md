---
id: react.router.learn.basics.layout-routes
type: lesson
title: 布局路由
summary: 用不增加 URL segment 的 route tree parent，为一组 child route 复用共享界面。
domain: frontend
technology: react
module: router
stage: basics
level: beginner
estimatedMinutes: 75
prerequisites:
  - react.router.learn.basics.nested-routes-and-outlet
related:
  - react.router.learn.basics.route-objects
  - react.router.learn.basics.route-matching
  - react.router.learn.basics.link-navigation
tags:
  - React Router
  - Layout Route
  - pathless route
  - Outlet
  - children
  - matching branch
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-19
objectives:
  - 能写出省略 path、拥有 Component 和 children 的 pathless layout route。
  - 能判断布局层不会向 child 的完整 URL 增加 segment。
  - 能从 location 写出包含 pathless layout 的 parent-to-child matching branch。
  - 能用无 prop 的 Outlet 指定匹配 child 在共享布局中的渲染位置。
  - 能根据 route tree ancestry 判断哪些 sibling 不受布局包裹。
recap:
  - 省略 path 的 layout route 增加 route tree 与 UI 层级，但不增加 URL segment。
  - Layout Component 只会随其后代 route 的匹配分支出现，不是可独立命中的页面。
  - Layout Component 在 Outlet 外渲染共享 UI，在 Outlet 位置渲染当前匹配 child。
  - 布局覆盖范围由 children ancestry 决定，同级 sibling 不会自动进入布局。
  - 带 path parent 与 pathless layout 都能共享 UI，区别在于前者会贡献 URL segment。
  - Index Route 是不可拥有 children 的 leaf，与可以拥有 children 的 layout route 职责不同。
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
      - 省略 path 会创建不增加 URL segment 的 Layout Route。
      - Layout Route 只包裹其 children，带 path parent 与 Index Route 具有不同结构语义。
  - title: React Router 8.3.0 Outlet
    url: https://reactrouter.com/8.3.0/api/components/Outlet
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Outlet 渲染当前 parent 的匹配 child，没有匹配 child 时返回 null。
  - title: React Router 8.3.0 createMemoryRouter
    url: https://reactrouter.com/8.3.0/api/data-routers/createMemoryRouter
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - createMemoryRouter 在内存中管理 history，并支持 initialEntries。
  - title: React Router 8.3.0 Route Flattening Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1180-L1267
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 固定版本把无 path route 的 relative path 视为空字符串，并把它保留在后代 branch 中。
      - 无 path 且非 index 的 route 不会单独成为候选 branch。
  - title: React Router 8.3.0 Branch Matching Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1405-L1480
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 固定版本逐层匹配 branch metadata，并保留成功分支中的每级 route。
  - title: React Router 8.3.0 Match Rendering Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/hooks.tsx#L1294-L1351
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 固定版本从 leaf 向 parent 组合 element，并把下一层 element 作为当前层 outlet。
  - title: React Router 8.3.0 Layout Routes Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/layout-routes-test.tsx#L5-L33
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 官方测试覆盖没有 child 命中时 pathless layout 自身也不匹配。
  - title: React Router 8.3.0 useOutlet Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/useOutlet-test.tsx#L11-L105
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 官方测试覆盖无 child 时的 null 结果与普通 child 的 Outlet element。
  - title: React Router 8.3.0 Index Routes Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/index-routes-test.tsx#L3-L25
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 官方测试确认 Index Route 不能拥有 children。
---

# 布局路由

## 一、学习目标

- 能写出省略 `path`、拥有 `Component` 和 `children` 的 pathless layout route。
- 能判断 layout route 不会向 child 的完整 URL 增加 segment。
- 能从 location 写出包含 layout 的 parent-to-child matching branch。
- 能在 Layout Component 中用无 prop 的 `<Outlet />` 渲染匹配 child。
- 能根据 route tree ancestry 判断 sibling 是否受布局包裹。
- 能区分 pathless layout、带 path parent 和 Index Route 的结构职责。

本课只增加一个变量：parent route 省略 `path`。嵌套路由、matching branch 与 Outlet 的基本模型保持
不变。本文不展开默认 child、动态段、数据加载、错误边界或 Outlet 数据共享。

## 二、为什么需要布局路由

假设应用有三个地址：

```text
/inbox
/reports
/help
```

`/inbox` 与 `/reports` 都属于团队工作区，需要共享标题、导航和工具区；`/help` 是独立帮助页面，不应
出现工作区外框。产品又不希望把前两个地址改成 `/workspace/inbox` 和 `/workspace/reports`。

带 path parent 能共享 UI，但会把自己的 path 加进 child URL：

```text
workspace parent + inbox child -> /workspace/inbox
```

Layout Route 解决的是另一种结构需求：**增加 route tree 和 UI 层级，但不增加 URL 层级。**

```text
workspace layout (no path)
├── inbox   -> /inbox
└── reports -> /reports

help sibling -> /help
```

这样，route tree 仍能表达“inbox 和 reports 共享一个布局，help 不共享”，公开 URL 则保持扁平。

## 三、核心概念

### 1. 省略 path 创建 Layout Route

Data Mode 的 route object 省略 `path` 时，可以作为 Layout Route：

```tsx
const routes = [
  {
    Component: WorkspaceLayout,
    children: [
      { path: 'inbox', Component: InboxPage },
      { path: 'reports', Component: ReportsPage },
    ],
  },
]
```

这个对象有 `Component` 和 `children`，但没有 `path`。因此它增加一层 route-tree parent，却不在
child 的 URL 中增加任何 segment：

| child path | 完整 URL   | 不会形成的 URL         |
| ---------- | ---------- | ---------------------- |
| `inbox`    | `/inbox`   | `/workspace/inbox`     |
| `reports`  | `/reports` | `/layout/reports`      |

`WorkspaceLayout` 是组件名，route 还可以拥有 `id: 'workspace-layout'`。组件名与 ID 都是代码身份，
不会自动成为 URL。

### 2. Layout 只随匹配 child 进入 branch

Layout Route 不是一个可以脱离 child 独立命中的页面。当前 location 命中它的后代时，matching branch
会保留 layout 层：

```text
location /inbox
matched branch: workspace-layout -> inbox

location /reports
matched branch: workspace-layout -> reports
```

如果 route tree 只有这两个 child，访问 `/` 时没有后代匹配，`WorkspaceLayout` 也不会单独出现。
这与“没有 child 时仍显示一个空壳布局”的直觉不同。

### 3. Layout Component 用 Outlet 接入 child

Layout Component 与带 path parent Component 的渲染职责相同：共享 UI 放在 Outlet 外，变化的 child
放进 Outlet。

```tsx
import { Outlet } from 'react-router'

function WorkspaceLayout() {
  return (
    <section>
      <h2>团队工作区</h2>
      <WorkspaceNavigation />
      <Outlet />
    </section>
  )
}
```

Router 先根据 location 选出 matching branch，再把当前层的匹配 child element 提供给 Outlet。
Outlet 不负责决定 URL，也不会把 route object 的 `children` 数组当成 React `props.children`。

### 4. children 决定布局覆盖范围

只有放在 Layout Route `children` 子树中的 route 才属于该布局：

```tsx
const routes = [
  {
    Component: WorkspaceLayout,
    children: [
      { path: 'inbox', Component: InboxPage },
      { path: 'reports', Component: ReportsPage },
    ],
  },
  { path: 'help', Component: HelpPage },
]
```

对应分支：

```text
/inbox   -> workspace-layout -> inbox
/reports -> workspace-layout -> reports
/help    -> help
```

`help` 是 layout 的 sibling，不在它的 `children` 中，所以 `/help` 只渲染 `HelpPage`。声明顺序、URL
是否相似、组件是否复用相同 CSS，都不会改变 ancestry。

### 5. 与带 path parent 的区别

两种 parent 都能用 `Component + children + Outlet` 共享 UI，区别只在 URL 合同：

```tsx
// 带 path parent
{
  path: 'workspace',
  Component: WorkspaceLayout,
  children: [{ path: 'inbox', Component: InboxPage }],
}

// Pathless Layout Route
{
  Component: WorkspaceLayout,
  children: [{ path: 'inbox', Component: InboxPage }],
}
```

| parent 结构                   | child 完整 URL      | parent 是否增加 segment |
| ----------------------------- | ------------------- | ----------------------- |
| `path: 'workspace'`           | `/workspace/inbox`  | 是                      |
| 省略 `path` 的 Layout Route   | `/inbox`            | 否                      |

选择依据不是“哪个写法更高级”，而是 URL 是否真的需要表达该层级。

### 6. 与 Index Route 的最小边界

Layout Route 与 Index Route 都没有普通 `path`，但它们在 route tree 中承担不同角色：

| 维度            | Pathless Layout Route             | Index Route                  |
| --------------- | --------------------------------- | ---------------------------- |
| 标识            | 省略 `path`，不是 `index: true`   | `index: true`，无普通 `path` |
| 结构角色        | parent，可以拥有 `children`       | leaf，不能拥有 `children`    |
| URL 角色        | 不增加 segment，随后代分支出现    | 在 parent URL 匹配           |

本课只使用这些条件避免混淆，不讨论 Index Route 如何提供默认 child。

## 四、用法与示例

### 1. 先按共享 UI 范围建立 route tree

先回答“哪些页面应该拥有工作区外框”，再决定它们是否进入 layout 的 `children`：

```tsx
import type { RouteObject } from 'react-router'

const routes = [
  {
    id: 'workspace-layout',
    Component: WorkspaceLayout,
    children: [
      { id: 'inbox', path: 'inbox', Component: InboxPage },
      { id: 'reports', path: 'reports', Component: ReportsPage },
    ],
  },
  { id: 'help', path: 'help', Component: HelpPage },
] satisfies RouteObject[]
```

`id` 用于在代码中识别 route，不贡献 URL。决定 URL 的仍然是 `path`。

### 2. 在布局中放共享状态与 Outlet

布局组件可以拥有共享导航和局部 UI 状态。只要从一个 child 切到同一 layout 下的另一个 child，布局
仍在 matching branch 中，变化发生在 Outlet 区域：

```tsx
import { useState } from 'react'
import { Link, Outlet } from 'react-router'

function WorkspaceLayout() {
  const [draft, setDraft] = useState('')

  return (
    <section>
      <h2>团队工作区</h2>
      <nav>
        <Link to="/inbox">收件箱</Link>
        <Link to="/reports">报告</Link>
      </nav>
      <input value={draft} onChange={(event) => setDraft(event.currentTarget.value)} />
      <Outlet />
    </section>
  )
}
```

草稿在 child 切换后保留，是当前组件树中同一个 layout 实例继续存在的可观察结果。它用于帮助定位
共享 UI 层，不是新的 Router 状态 API。

### 3. 把布局外页面保持为 sibling

布局外页面不应被塞进 layout `children` 后再用 CSS 隐藏共享 UI。它应在 route tree 中直接成为
sibling：

```tsx
const routes = [
  {
    Component: WorkspaceLayout,
    children: [
      { path: 'inbox', Component: InboxPage },
      { path: 'reports', Component: ReportsPage },
    ],
  },
  { path: 'help', Component: HelpPage },
]
```

进入 `/help` 时 matching branch 不包含 `WorkspaceLayout`，因此共享标题、导航、草稿和 Outlet 都不会
渲染。路由结构直接表达了布局边界。

### 4. 用 location 检查 URL 与 UI 层级

可以把路由检查写成一张表：

| location   | matching branch                | 可见 UI                 |
| ---------- | ------------------------------ | ----------------------- |
| `/inbox`   | layout -> inbox                | 布局 + 收件箱 child     |
| `/reports` | layout -> reports              | 布局 + 报告 child       |
| `/help`    | help                           | 只有帮助页              |
| `/`        | 没有上述 branch                | 布局不会独立出现        |

这张表同时检查了三件事：layout 不贡献 segment、只有一个 child 进入 Outlet、sibling 不受布局包裹。

## 五、观察布局层与 URL

下面的 Demo 使用独立 `createMemoryRouter`。无 `path` 的 `workspace-layout` 包含 `/inbox` 与
`/reports`，`/help` 是布局外 sibling。

先在“布局层草稿”中输入内容，再切到“报告”：草稿与共享标题会保留，Outlet child 会替换。随后进入
“布局外帮助”：整个工作区布局会消失。观察内存地址始终没有 `workspace` 或 `layout` segment，同时
外层学习站地址保持不变。

:::demo{id="react.router.learn.basics.layout-routes.layout-demo"}
:::

**观察目标：**

1. 初始 `/inbox` 同时显示工作区 layout 与 inbox child。
2. `/reports` 仍显示 layout，但 Outlet 中只剩 reports child。
3. 在两个 layout child 间切换时，布局层草稿保留。
4. `/help` 只显示 sibling 页面，工作区 layout 不在 matching branch 中。
5. 三个链接都是可键盘激活的真实 anchor，且 `href` 不包含布局 segment。
6. Demo 导航只修改内存 location，不修改宿主学习站 URL。

## 六、易错使用提示

:::pitfalls
### 错误：为了给布局命名而添加 path

**触发条件：** 想把布局叫作 workspace，于是写入 `path: 'workspace'`，但产品地址仍要求
`/inbox`。

**原因：** 把 route ID、组件名与 URL segment 混为一谈。`path` 是 URL 匹配合同，不是显示名称。

**后果：** child 的实际地址变成 `/workspace/inbox`，访问 `/inbox` 不再命中该分支。

**错误示例：**

```tsx
{
  id: 'workspace-layout',
  path: 'workspace',
  Component: WorkspaceLayout,
  children: [{ path: 'inbox', Component: InboxPage }],
}
```

**正确写法：**

```tsx
{
  id: 'workspace-layout',
  Component: WorkspaceLayout,
  children: [{ path: 'inbox', Component: InboxPage }],
}
```

**验证方式：** 分别以 `/inbox` 与 `/workspace/inbox` 初始化 memory router。正确配置只会在
`/inbox` 显示 layout 与 inbox，生成链接的 `href` 也应是 `/inbox`。

### 错误：把需要共享布局的页面写成 sibling

**触发条件：** `WorkspaceLayout` 与 `inbox` route 位于同一个数组层级，却期望 Inbox 被布局包裹。

**原因：** 布局覆盖范围由 `children` ancestry 决定，不由声明顺序、组件名称或 URL 相似度决定。

**后果：** `/inbox` 可以显示 Inbox，但共享标题、导航和布局状态不会出现。

**错误示例：**

```tsx
[
  { Component: WorkspaceLayout },
  { path: 'inbox', Component: InboxPage },
]
```

**正确写法：**

```tsx
[
  {
    Component: WorkspaceLayout,
    children: [{ path: 'inbox', Component: InboxPage }],
  },
]
```

**验证方式：** 以 `/inbox` 初始化 Router，同时断言共享标题和 Inbox child 标题可见。只验证 child
标题不能证明 layout 已进入 matching branch。

### 错误：Layout Component 遗漏 Outlet

**触发条件：** route tree 已正确嵌套，但 Layout Component 只返回共享标题与导航。

**原因：** 误以为 Router 会把 matching child 自动追加到布局 DOM 末尾。

**后果：** 地址与 branch 正常匹配，layout UI 也出现，但 child 页面没有渲染位置。

**错误示例：**

```tsx
function WorkspaceLayout() {
  return <h2>团队工作区</h2>
}
```

**正确写法：**

```tsx
function WorkspaceLayout() {
  return (
    <section>
      <h2>团队工作区</h2>
      <Outlet />
    </section>
  )
}
```

**验证方式：** 以 `/inbox` 初始化 Router，同时检查 layout 标题与 Inbox child 标题。只检查
location 或 layout 标题无法验证 Outlet 链路。

### 错误：把 pathless layout 当成可独立命中的页面

**触发条件：** Layout Route 只有 `inbox` 和 `reports` 两个 child，却期望访问 `/` 时仍显示空壳布局。

**原因：** 无 `path`、非 index 的 route 只随后代匹配进入 branch，不会单独成为候选 branch。

**后果：** `/` 不显示该布局，正常匹配结果可能被误诊为 Outlet 故障。

**错误示例：**

```text
location / -> WorkspaceLayout 自动出现
```

**正确写法：**

```text
location /inbox -> WorkspaceLayout + InboxPage
location /      -> 没有后代命中，WorkspaceLayout 不出现
```

**验证方式：** 对同一 route tree 分别使用 `initialEntries: ['/']` 与 `initialEntries: ['/inbox']`。
layout 标记只应在后一种情况出现。

### 错误：把 Index Route 当成可以继续嵌套的 Layout Route

**触发条件：** 因为两者都没有普通 `path`，在同一个 route object 上同时写 `index: true` 和
`children`。

**原因：** 忽略它们的 route-tree 角色：Layout Route 是 parent，Index Route 是 leaf。

**后果：** 配置违反结构合同，类型与运行时都会拒绝。

**错误示例：**

```tsx
{
  index: true,
  Component: WorkspaceLayout,
  children: [{ path: 'inbox', Component: InboxPage }],
}
```

**正确写法：**

```tsx
{
  Component: WorkspaceLayout,
  children: [{ path: 'inbox', Component: InboxPage }],
}
```

**验证方式：** 将错误对象传给 `createMemoryRouter` 会在 route 转换时拒绝 Index Route 的
`children`。Layout Route 则可以正常包含 child；这里只验证结构差异。
:::

## 七、源码推导与适用场景

### 1. 空 relative path 不增加 URL segment

**官方事实：** 固定版本的 route flattening 会把缺失的 `route.path` 视为空 relative path，再与
parent path 合并；递归 children 时会把当前 layout metadata 保留在后代 branch 中。无 path 且非
index 的 route 本身不会加入可独立匹配的 branch 列表。

**课程推导：** 可以把 Layout Route 理解为“后代 matching branch 上不增加 segment 的 parent”。
这个模型同时解释了 child 命中时布局出现，以及没有 child 命中时布局不会独立出现。

**边界：** `flattenRoutes`、relative path 和 branch metadata 是 React Router 8.3.0 的内部组织。
应用只依赖“省略 path 不增加 URL segment”和“layout 随匹配 child 出现”的公共合同。

### 2. matching branch 保留 layout ancestry

**官方事实：** 固定版本逐层处理候选 branch 的 route metadata；全部成功时，每一级 route 都进入
匹配结果，任一级失败则整条 branch 不成立。

**课程推导：** 判断一个页面是否拥有某个布局，应沿 route tree 检查它是否是 layout 的后代，而不是
只比较 URL 文本或视觉组件。

**边界：** branch 的评分、排序和完整匹配算法不属于本课。这里只使用“location 选择一条包含 layout
祖先与命中 child 的 branch”这一模型。

### 3. Outlet 把 route branch 组合成 UI

**官方事实：** 固定版本从 matching branch 的 leaf 向 parent 组合 element，并把已经形成的 child
element 作为当前 parent route context 的 outlet。`<Outlet />` 消费当前层 outlet。

**课程推导：** Layout Component 只需把共享 UI 写在 Outlet 外，并在希望 child 出现的位置渲染一个
无 prop 的 `<Outlet />`。

**边界：** 从叶到根的组合方式与 route context 字段属于内部实现。公开合同只有 Outlet 渲染当前
matching child，或在没有 matching child 时返回 `null`。

### 4. 适用场景

适合使用 pathless Layout Route：

- 一组页面需要共享标题、侧栏、导航或工具区，但公共 URL 不需要额外 prefix。
- 需要由 route tree 明确表达哪些页面受某个 UI 外框包裹。
- 同一 URL 前缀下只有部分 sibling 需要额外一层共享界面。

更适合带 path parent：

- URL 本身需要表达资源或工作区层级，例如 `/workspace/inbox`。
- parent path 是深链、权限或信息架构合同的一部分，而不只是 UI 分组名称。

不需要 Layout Route：

- 共享元素属于全应用外壳，已经稳定放在 Router 外层。
- 变化只是一个页面内部的本地组件切换，不需要独立可导航地址。

## 八、练习

:::exercise
### 练习目标

**要求：** 配置一个省略 `path` 的 `account-layout`，让 `/profile` 与 `/security` 共享“账户设置”
标题、导航和 `<Outlet />`，并让 `/support` 保持为布局外 sibling。在布局中增加一个文本输入框，输入
内容后从 `/profile` 切到 `/security`，确认输入值保留；进入 `/support` 后，确认布局标题、输入框与
Outlet 都不再显示。

**验收：** `/profile` 与 `/security` 的 URL 都不含 `account` 或 `layout` segment；两个地址各自
只显示唯一匹配 child；`/support` 不受布局包裹；所有导航入口都是带正确 `href` 的真实 anchor。
:::

## 九、本节小结

- 省略 `path` 会建立不增加 URL segment 的 Layout Route。
- Layout Route 是 route-tree parent，只随匹配后代进入 branch，不会独立命中。
- Layout Component 在 Outlet 外提供共享 UI，在 Outlet 位置显示唯一 matching child。
- `children` ancestry 决定布局覆盖范围，同级 sibling 不会自动受布局包裹。
- 带 path parent 与 pathless layout 都能共享 UI，前者会把自己的 path 加进 child URL。
- Layout Route 可以拥有 children；Index Route 是不能拥有 children 的 leaf。

## 十、参考资料

- [React Router 8.3.0 Release](https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0) - 稳定发布事实。
- [npm react-router Latest Metadata](https://registry.npmjs.org/react-router/latest) - npm latest 版本元数据。
- [React Router 8.3.0 Data Mode Routing](https://reactrouter.com/8.3.0/start/data/routing) - Layout Route、children、带 path parent 与 Index Route 的公共合同。
- [React Router 8.3.0 Outlet](https://reactrouter.com/8.3.0/api/components/Outlet) - matching child 与 null 结果。
- [React Router 8.3.0 createMemoryRouter](https://reactrouter.com/8.3.0/api/data-routers/createMemoryRouter) - 内存 history 与 initialEntries。
- [React Router 8.3.0 Route Flattening Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1180-L1267) - pathless route 的空 relative path 与 branch 结构。
- [React Router 8.3.0 Branch Matching Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1405-L1480) - matching branch 的逐层匹配。
- [React Router 8.3.0 Match Rendering Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/hooks.tsx#L1294-L1351) - 从 leaf 向 parent 组合 element。
- [React Router 8.3.0 Layout Routes Tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/layout-routes-test.tsx#L5-L33) - 无 child 命中时 layout 不单独匹配。
- [React Router 8.3.0 useOutlet Tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/useOutlet-test.tsx#L11-L105) - Outlet 的 child 与 null 测试。
- [React Router 8.3.0 Index Routes Tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/index-routes-test.tsx#L3-L25) - Index Route 不可拥有 children 的结构边界。
