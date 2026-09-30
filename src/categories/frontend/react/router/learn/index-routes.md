---
id: react.router.learn.basics.index-routes
type: lesson
title: 索引路由
summary: 用 Index Route 在 parent URL 上为 parent Outlet 提供显式的默认 child 内容。
domain: frontend
technology: react
module: router
stage: basics
level: beginner
estimatedMinutes: 70
prerequisites:
  - react.router.learn.basics.layout-routes
related:
  - react.router.learn.basics.nested-routes-and-outlet
  - react.router.learn.basics.route-objects
  - react.router.learn.basics.route-matching
tags:
  - React Router
  - Index Route
  - Outlet
  - default child
  - children
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-19
objectives:
  - '能用 index: true 且省略普通 path 声明 Data Mode Index Route。'
  - 能解释 Index Route 在 parent URL 上渲染进 parent Outlet。
  - 能区分 Index Route、pathless Layout Route 与普通 path child。
  - 能说明没有 Index Route 时 parent Outlet 不会自动选择第一个 child。
  - 能判断 Index Route 是不能拥有 children 的 leaf。
  - 能准确判断 parent URL、末尾斜杠和额外 child segment 的匹配边界。
recap:
  - 'Index Route 通过 index: true 显式声明，并省略普通 path。'
  - Index Route 与 parent 共享 pathname，在 parent URL 上进入 parent Outlet。
  - 普通 path sibling 只在自己的 child URL 上匹配，不会自动成为默认 child。
  - 没有 matching child 时 Outlet 返回 null；children 顺序不提供默认规则。
  - Index Route 是 leaf，不能拥有 children；共享布局应由非 index parent 承担。
  - React Router 8.3.0 接受末尾斜杠，但 Index Route 不会兜底额外 segment。
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
    url: https://reactrouter.com/8.3.0/start/data/routing
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - 'Index Route 使用 index: true 且不写 path。'
      - Index Route 在 parent URL 渲染进 parent Outlet，并且不能有 children。
      - Layout Route 与普通 path child 的结构职责不同。
  - title: React Router 8.3.0 Outlet
    url: https://reactrouter.com/8.3.0/api/components/Outlet
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Outlet 渲染 matching child，没有 child match 时返回 null。
  - title: React Router 8.3.0 createMemoryRouter
    url: https://reactrouter.com/8.3.0/api/data-routers/createMemoryRouter
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - createMemoryRouter 使用内存 history，并支持 initialEntries。
  - title: React Router 8.3.0 Index Route Type
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L646-L758
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 'IndexRouteObject 要求 index: true，并把 children 限制为 undefined。'
      - BaseRouteObject 仍公开可选 path，因此 path 字段不是当前类型的硬限制。
  - title: React Router 8.3.0 Route Conversion Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L968-L981
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - Data Router 在运行时拒绝拥有 children 的 Index Route。
  - title: React Router 8.3.0 Branch Matching Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1226-L1260
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 固定版本把 route tree 展开为 branch，并对 branch leaf 进行完整匹配。
      - 本课无 path Index branch 结束在 parent pathname，不作为额外 segment 的回退。
  - title: React Router 8.3.0 Index Path Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/matchRoutes-test.tsx#L29-L99
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 官方测试覆盖带 path 的 index leaf、parent URL 优先级和普通 child 的额外 segment。
  - title: React Router 8.3.0 MatchPath Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/matchPath-test.tsx#L11-L76
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 官方测试覆盖精确匹配、完整路径段边界和末尾斜杠。
  - title: React Router 8.3.0 Index Routes Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/index-routes-test.tsx#L3-L25
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 官方测试确认 Index Route 不能拥有 children。
  - title: React Router 8.3.0 useOutlet Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/useOutlet-test.tsx#L11-L130
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 官方测试覆盖无 child 时 null、普通 child 和 parent URL 上的 Index child。
---

# 索引路由

## 一、学习目标

- 能用 `index: true` 且省略普通 `path` 声明 Data Mode Index Route。
- 能解释 Index Route 为什么会在 parent URL 上进入 parent 的 `<Outlet />`。
- 能判断普通 path child 不会因为排在 `children` 第一项就变成默认 child。
- 能区分 Index Route、pathless Layout Route 与普通 path child 的 route-tree 职责。
- 能说明 Index Route 是 leaf，不能再拥有 `children`。
- 能判断 parent URL、末尾斜杠与额外 child segment 的匹配边界。

本文只讨论“parent URL 应该显示什么默认 child”。带 path parent、嵌套路由与 Outlet 的基本模型保持
不变，不展开动态段、未知路径兜底、数据加载、错误边界或编程式导航。

## 二、为什么需要索引路由

假设工作区有一个 parent route：

```text
/workspace
└── activity -> /workspace/activity
```

`WorkspaceLayout` 渲染标题、导航和 `<Outlet />`。访问 `/workspace/activity` 时，`activity` child
进入 Outlet；但是访问 `/workspace` 时，没有任何普通 child path 被消费。

```tsx
{
  path: '/workspace',
  Component: WorkspaceLayout,
  children: [{ path: 'activity', Component: ActivityPage }],
}
```

这时 parent 本身仍然匹配，标题和导航可以出现，但 Outlet 没有 matching child，会返回 `null`。
React Router 不会把 `children` 数组第一项当成默认页面，也不会自动跳转到它。

如果产品希望 `/workspace` 显示“工作区总览”，就需要在 route tree 中明确表达这个默认 child：

```tsx
{
  path: '/workspace',
  Component: WorkspaceLayout,
  children: [
    { index: true, Component: WorkspaceHome },
    { path: 'activity', Component: ActivityPage },
  ],
}
```

Index Route 让 parent URL 拥有明确的 child 内容，而不增加新的 URL segment，也不依赖数组顺序或隐式
跳转。

## 三、核心概念

### 1. 用 index: true 声明默认 child

Data Mode 的标准写法是在 parent 的 `children` 中增加一个省略普通 `path`、设置 `index: true` 的
route object：

```tsx
const routes = [
  {
    path: '/workspace',
    Component: WorkspaceLayout,
    children: [
      { index: true, Component: WorkspaceHome },
      { path: 'activity', Component: ActivityPage },
    ],
  },
]
```

这里的 Index Route 与 parent 共用 pathname。它不会生成 `/workspace/index`、`/workspace/home` 或
其他新地址。

### 2. Index Route 在 parent URL 结束分支

当 location 是 `/workspace` 时，匹配分支包含 parent 和 Index Route：

```text
location /workspace
matched branch: workspace parent -> workspace index
```

当 location 是 `/workspace/activity` 时，普通 path child 取代 Index Route：

```text
location /workspace/activity
matched branch: workspace parent -> activity
```

两条分支共享 parent，但叶子不同。Index Route 只负责 parent URL 的默认 child，不会与普通 child
同时渲染。

### 3. Parent 必须提供 Outlet

Index Route 能进入 matching branch，不代表 child UI 会自动追加到 parent DOM。Parent Component 仍要
在希望显示 child 的位置渲染 `<Outlet />`：

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

访问 `/workspace` 时，Outlet 渲染 `WorkspaceHome`；访问 `/workspace/activity` 时，同一个位置改为
渲染 `ActivityPage`。Parent 标题与导航继续保留。

### 4. Index Route 是不能继续嵌套的 leaf

Index Route 表示“分支在 parent URL 这里结束”，所以不能再拥有 `children`。固定版本公开类型中的核心
结构是：

```ts
interface IndexRouteObject {
  index: true
  children?: undefined
}
```

类型中的 `children?: undefined`、运行时 route 转换检查和官方测试共同约束了这条规则。需要继续嵌套
时，应让非 index parent 持有 children，再把 Index Route 放进该数组。

### 5. 与另外两类 route 的区别

三类 route 都可能出现在同一棵 route tree 中，但职责不同：

| 维度                          | Index Route                  | Pathless Layout Route           | 普通 path child            |
| ----------------------------- | ---------------------------- | ------------------------------- | -------------------------- |
| 核心声明                      | `index: true`，省略 `path`   | 省略 `path`，不设置 `index`     | 设置 `path`                |
| 是否增加 URL segment          | 否                           | 否                              | 是                         |
| 是否在 parent URL 结束 branch | 是                           | 否，只随匹配后代进入 branch     | 否，匹配自己的 child URL   |
| 是否可以有 `children`         | 否                           | 是                              | 非 index route 可以        |
| 典型职责                      | parent URL 的默认 child 内容 | 为一组后代提供共享 UI           | 具名 URL 页面或可嵌套 parent |

“没有 path”本身不足以识别 Index Route。还要看它是否显式设置 `index: true`，以及它在 route tree 中是
leaf 还是 parent。

### 6. Parent URL 的精确边界

对于 `/workspace` parent 和无 path Index Route，React Router 8.3.0 的客户端匹配结果是：

| location              | Index Route 是否命中 | 原因                         |
| --------------------- | -------------------- | ---------------------------- |
| `/workspace`          | 是                   | 正好停在 parent URL          |
| `/workspace/`         | 是                   | 固定版本允许末尾斜杠         |
| `/workspace/activity` | 否                   | 由普通 `activity` child 匹配 |
| `/workspace/unknown`  | 否                   | Index Route 不是未知路径兜底 |
| `/workspace-extra`    | 否                   | 不满足完整路径段边界         |

末尾斜杠结论只描述该版本的客户端 matcher，不代表服务器重写、redirect、缓存键或 URL 规范化策略。

## 四、用法与示例

### 1. 先让 parent 正常渲染共享 UI

Parent Component 负责工作区外框，并给 child 留出 Outlet：

```tsx
import { Link, Outlet } from 'react-router'

function WorkspaceLayout() {
  return (
    <section>
      <h2>团队工作区</h2>
      <nav>
        <Link to="/workspace">默认总览</Link>
        <Link to="/workspace/activity">最近活动</Link>
      </nav>
      <Outlet />
    </section>
  )
}
```

两个 Link 分别指向 parent URL 和普通 child URL。Index Route 不需要专门的 URL 字符串。

### 2. 把 Index Route 与普通 child 放在同一层

默认 child 与具名 child 都直接属于 `WorkspaceLayout`：

```tsx
import type { RouteObject } from 'react-router'

const routes = [
  {
    id: 'workspace',
    path: '/workspace',
    Component: WorkspaceLayout,
    children: [
      { id: 'workspace-index', index: true, Component: WorkspaceHome },
      { id: 'workspace-activity', path: 'activity', Component: ActivityPage },
    ],
  },
] satisfies RouteObject[]
```

`workspace-index` 是代码身份，不是 URL segment。`activity` 才是由普通 `path` 明确贡献的 segment。

### 3. 用 location 与 branch 检查结果

配置完成后，不要只看组件是否“好像出现了”。应同时核对 location、matching branch 与 Outlet 内容：

| location              | matching branch             | Outlet 内容       |
| --------------------- | --------------------------- | ----------------- |
| `/workspace`          | workspace -> workspace-index | 工作区总览        |
| `/workspace/`         | workspace -> workspace-index | 工作区总览        |
| `/workspace/activity` | workspace -> activity        | 最近活动          |
| `/workspace/unknown`  | 无这两条完整分支             | 不会显示默认总览  |

Index Route 是显式 route，不是 fallback。额外 segment 未匹配时，不会退回 parent URL 的默认 child。

### 4. 准确理解 index 与 path 的版本边界

Data Mode 指南用“`index: true` 且省略普通 `path`”表达 parent URL 的默认 child，本课所有正式示例都采用
这条写法。

React Router 8.3.0 的 `IndexRouteObject` 仍从基础 route object 取得可选 `path`，官方匹配测试也覆盖
带 path 的 index leaf。这说明当前硬限制是 `children`，不是 `path` 字段。带名字的 URL segment 应用
普通 path child 表达；不要利用类型余量混合“默认 child”和“具名 child”两种职责。

## 五、观察 parent URL 的默认 child

下面的 Demo 使用独立 `createMemoryRouter`。唯一 parent 是 `/workspace`，它直接拥有一个 Index Route
和一个 `activity` sibling child。

初始地址为 `/workspace`，所以工作区 parent 与“工作区总览”同时显示。点击“最近活动”后，parent
继续显示，Outlet 内容替换为普通 path child；点击“默认总览”会回到 parent URL，并再次显示 Index
Route 内容。整个过程只改变内存 location，不修改外层学习站地址。

:::demo{id="react.router.learn.basics.index-routes.index-demo"}
:::

**观察目标：**

1. `/workspace` 同时显示工作区 parent 与唯一 Index Route 内容。
2. `/workspace/activity` 保留 parent，只把 Outlet 内容替换为普通 child。
3. 两个链接的 `href` 分别是 `/workspace` 与 `/workspace/activity`。
4. 返回 parent URL 时，不需要 redirect 或额外 path，Index Route 会再次匹配。
5. Demo 内部导航不会修改宿主学习站 URL。

## 六、易错使用提示

:::pitfalls
### 错误：把具名 path 与默认 child 职责混在一起

**触发条件：** 为 parent URL 的默认页面同时设置 `index: true` 和 `path: 'home'`。

**原因：** 把“在 parent URL 结束分支”与“增加一个具名 child segment”当成同一职责。当前版本的
类型保留可选 `path`，但这不等于它表达了指南中的默认 child。

**后果：** `/workspace` 没有预期默认内容，页面可能只在额外的 `/workspace/home` 地址出现，route
object 的意图也变得含混。

**错误示例：**

```tsx
{ index: true, path: 'home', Component: WorkspaceHome }
```

**正确写法：**

```tsx
// Parent URL 的默认 child
{ index: true, Component: WorkspaceHome }

// 具名 child URL
{ path: 'home', Component: WorkspaceHome }
```

**验证方式：** 分别用 `/workspace` 与 `/workspace/home` 初始化 Router。默认 child 配置只应让前者
显示 `WorkspaceHome`，具名 child 配置只应让后者显示它。

### 错误：让 Index Route 再拥有 children

**触发条件：** 在 `index: true` 的 route object 上增加 `children`。

**原因：** 把 Index Route 当成可以继续嵌套的 parent。它的语义是 branch 在 parent URL 结束，因此
必须是 leaf。

**后果：** 配置违反 `children?: undefined` 的类型合同；绕开类型后，Data Router 在转换 route tree
时也会拒绝该结构。

**错误示例：**

```tsx
{
  index: true,
  Component: WorkspaceHome,
  children: [{ path: 'details', Component: Details }],
}
```

**正确写法：**

```tsx
{
  path: '/workspace',
  Component: WorkspaceLayout,
  children: [
    { index: true, Component: WorkspaceHome },
    { path: 'details', Component: Details },
  ],
}
```

**验证方式：** 检查 route tree 中每个 `index: true` 节点都没有 `children`，并运行类型检查验证结构。

### 错误：定义 Index Route 却遗漏 parent Outlet

**触发条件：** Parent 有 Index Route，但 Parent Component 只渲染自己的标题和导航。

**原因：** 误以为 matching child 会自动追加到 parent DOM 末尾。

**后果：** Parent 与 Index Route 都能进入 matching branch，但默认 child 没有可见插入位置，看起来像
Index Route 未匹配。

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

**验证方式：** 访问 parent URL，同时断言 parent 标题和 Index Route 的唯一标题可见。只检查 parent
标题不能证明 Outlet 链路完成。

### 错误：认为第一个普通 child 会自动成为默认 child

**触发条件：** `children` 第一项是 `path: 'activity'`，并期望访问 `/workspace` 时显示它。

**原因：** 把数组顺序误当作默认选择规则。普通 child 仍要消费自己的 path segment。

**后果：** Parent 可以显示，但 Outlet 没有 matching child，会返回 `null`；用户看到空白内容区。

**错误示例：**

```tsx
children: [{ path: 'activity', Component: ActivityPage }]
```

**正确写法：**

```tsx
children: [
  { index: true, Component: WorkspaceHome },
  { path: 'activity', Component: ActivityPage },
]
```

**验证方式：** 先用没有 Index Route 的 route tree 访问 `/workspace`，确认 Parent 可见而 Outlet 为空；
增加 Index Route 后用同一地址重验，确认默认内容出现。

### 错误：把 pathless Layout Route 当成 Index Route

**触发条件：** 共享 UI 的无 path parent 设置了 `index: true`，同时还要包含多个 children。

**原因：** 只看到两者都不增加 URL segment，忽略 Index Route 是 leaf，而 Layout Route 是 parent。

**后果：** route tree 无法同时表达共享 layout 和默认 child，配置也违反 Index Route 的 children
边界。

**错误示例：**

```tsx
{
  index: true,
  Component: WorkspaceLayout,
  children: [{ index: true, Component: WorkspaceHome }],
}
```

**正确写法：**

```tsx
{
  Component: WorkspaceLayout,
  children: [{ index: true, Component: WorkspaceHome }],
}
```

**验证方式：** 检查共享 layout 节点不设置 `index: true`，所有 Index Route 都是没有 children 的
leaf。

### 错误：把 Index Route 当成未知路径 fallback

**触发条件：** 期望 `/workspace/unknown` 或 `/workspace-extra` 仍显示工作区默认总览。

**原因：** 把“parent URL 的默认 child”误解为“所有未匹配 child 的默认值”。

**后果：** 未知地址不会命中 Index Route；应用会得到其他匹配结果或没有匹配分支。

**错误示例：**

```text
/workspace/unknown -> workspace index
```

**正确写法：**

```text
/workspace          -> workspace index
/workspace/activity -> activity child
/workspace/unknown  -> index 不匹配
```

**验证方式：** 分别匹配三个地址，确认 Index Route 只出现在 parent URL 分支，不出现在额外 segment
分支。
:::

## 七、源码推导与适用场景

### 1. 类型与转换同时保证 leaf 边界

**官方事实：** 固定版本的 `IndexRouteObject` 要求 `index: true`，并把 `children` 声明为
`children?: undefined`。Data route 转换还会在运行时检查 Index Route 是否携带 children。

**课程推导：** Index Route 应只承载 parent URL 的默认页面。需要继续嵌套时，把后代放到非 index
parent 下，并让 Index Route 成为其 children 之一。

**边界：** 公开类型与运行时错误文字可能随版本调整；应用依赖的是“Index Route 不能有 children”这条
文档合同。

### 2. Branch leaf 解释精确匹配

**官方事实：** 固定版本把 route tree 展开成候选 branch，并对 branch 最后一层执行完整匹配。本课的
无 path Index Route 在 parent pathname 结束分支。

**课程推导：** Index Route 是 parent URL 的显式默认 child，不是前缀匹配或未知 child 的 fallback。
看到额外 segment 时，应寻找对应普通 child，而不是期待 Index Route 接管。

**边界：** branch 评分、排序与正则实现是内部组织。本课只依赖 parent URL 命中 Index Route、额外
segment 不命中它的公共结果。

### 3. Outlet 只消费当前 matching child

**官方事实：** `useOutlet` 从当前 route context 读取已经形成的 child element，没有 matching child
时返回 `null`；`<Outlet />` 使用这个结果。

**课程推导：** 普通 child 的数组顺序不会提供默认页面。只有显式 Index Route 进入 branch 后，parent
Outlet 才会在 parent URL 上获得默认 child element。

**边界：** route context 的字段和从 leaf 向 parent 组合 element 的细节属于内部实现；应用只依赖
Outlet 渲染 matching child 或 `null`。

### 4. 适用场景

适合使用 Index Route：

- Parent URL 本身需要显示总览、欢迎页或空状态，而不是强制跳转到某个具名 child。
- Parent Component 提供稳定外框，默认内容与具名 child 需要在同一个 Outlet 中切换。
- 希望 route tree 明确记录默认 child，而不是依赖数组顺序或组件内条件判断。

不需要 Index Route：

- Parent URL 不对用户开放，产品明确要求进入后重定向到某个具名 child。
- Parent 没有 Outlet，只是一个独立叶子页面。
- 需求是处理未知后代路径；Index Route 不承担 fallback 职责。

## 八、练习

:::exercise
### 练习目标

**要求：** 配置一个 `/projects` parent，让无 path 的 Index Route 在 `/projects` 显示“项目总览”，让
普通 `archive` child 在 `/projects/archive` 显示“归档项目”。Parent Component 必须保留“项目中心”
标题、两个真实 Link 和一个 `<Outlet />`。

**验收：** `/projects` 与 `/projects/` 都显示 parent 标题和唯一 Index 内容；
`/projects/archive` 保留 parent 标题但只显示归档 child；Index Route 没有普通 `path` 或 `children`；
`/projects/unknown` 不回退到 Index 内容。
:::

## 九、本节小结

- Index Route 用 `index: true` 显式声明，parent URL 默认 child 的标准写法省略普通 `path`。
- Index Route 与 parent 共享 pathname，并在 parent URL 上进入 parent 的 Outlet。
- 普通 path child 只在自己的 child URL 上匹配，排在数组第一项也不会自动成为默认 child。
- 没有 matching child 时 Outlet 返回 `null`，Parent 自身仍然可以显示。
- Index Route 是不能拥有 children 的 leaf；共享布局由非 index parent 承担。
- 固定版本接受 parent URL 的末尾斜杠，但 Index Route 不会兜底额外 segment。

## 十、参考资料

- [React Router 8.3.0 Release](https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0) - 稳定发布与固定 tag。
- [npm react-router Latest Metadata](https://registry.npmjs.org/react-router/latest) - npm latest 版本元数据。
- [React Router 8.3.0 Data Mode Routing](https://reactrouter.com/8.3.0/start/data/routing) - Index Route、parent URL、Outlet 与 leaf 合同。
- [React Router 8.3.0 Outlet](https://reactrouter.com/8.3.0/api/components/Outlet) - matching child 与 null 结果。
- [React Router 8.3.0 createMemoryRouter](https://reactrouter.com/8.3.0/api/data-routers/createMemoryRouter) - 内存 history 与 initialEntries。
- [React Router 8.3.0 Index Route Type](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L646-L758) - Index Route 的类型形态与 children 边界。
- [React Router 8.3.0 Route Conversion Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L968-L981) - Index Route children 的运行时检查。
- [React Router 8.3.0 Branch Matching Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1226-L1260) - Index branch 与完整匹配边界。
- [React Router 8.3.0 Index Path Tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/matchRoutes-test.tsx#L29-L99) - 当前版本的 index path 余量与普通 child 匹配。
- [React Router 8.3.0 MatchPath Tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/matchPath-test.tsx#L11-L76) - 精确边界与末尾斜杠。
- [React Router 8.3.0 Index Routes Tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/index-routes-test.tsx#L3-L25) - Index Route 不能有 children。
- [React Router 8.3.0 useOutlet Tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/useOutlet-test.tsx#L11-L130) - 无 child、普通 child 与 Index child 的 Outlet 结果。
