---
id: react.router.learn.advanced.scroll-restoration
type: lesson
title: 滚动恢复
summary: 用 ScrollRestoration 让 Data Router 在新导航、前进后退、锚点和查询参数切换之间保持可预测的滚动位置。
domain: frontend
technology: react
module: router
stage: advanced
level: advanced
estimatedMinutes: 60
prerequisites:
  - react.router.learn.basics.location-and-history-state
  - react.router.learn.intermediate.form-fetcher-choice
  - react.router.learn.intermediate.lazy-routes
related:
  - react.router.learn.basics.query-params-and-url-state
  - react.router.learn.basics.link-navigation
  - react.router.learn.intermediate.navigation-pending-ui
tags:
  - React Router
  - Data Mode
  - ScrollRestoration
  - preventScrollReset
  - getKey
  - sessionStorage
objectives:
  - 能解释浏览器原生滚动恢复与 Data Router 滚动恢复的职责差异。
  - 能在根路由只挂载一个 ScrollRestoration，并理解新导航、POP 导航和 hash 的处理顺序。
  - 能使用 getKey 和 storageKey 设计滚动位置的存储粒度。
  - 能为查询参数或局部视图切换选择 preventScrollReset，并知道它不会改变前进后退恢复。
  - 能识别窗口滚动、嵌套滚动容器、SSR 初始恢复和组件卸载之间的边界。
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-26
sources:
  - title: React Router ScrollRestoration API
    url: https://reactrouter.com/8.3.0/api/components/ScrollRestoration
  - title: React Router ScrollRestoration 文档源码
    url: https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/api/components/ScrollRestoration.md
  - title: React Router DOM ScrollRestoration 源码
    url: https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/lib/dom/lib.tsx
  - title: React Router 滚动恢复 Router 源码
    url: https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/lib/router/router.ts
  - title: React Router 滚动恢复 DOM 测试
    url: https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/__tests__/dom/scroll-restoration-test.tsx
  - title: React Router 滚动恢复 Router 测试
    url: https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/__tests__/router/scroll-restoration-test.ts
  - title: React Router Link API
    url: https://reactrouter.com/8.3.0/api/components/Link
  - title: React Router Form API
    url: https://reactrouter.com/8.3.0/api/components/Form
---

# 滚动恢复

## 一、学习目标

- 解释浏览器原生滚动恢复和 Data Router 滚动恢复分别负责什么。
- 在根路由挂载唯一的 `ScrollRestoration`，理解新导航、POP 导航和 hash 的处理顺序。
- 用 `getKey`、`storageKey` 设计滚动位置的存储粒度。
- 为查询参数或局部视图切换选择 `preventScrollReset`，并知道它不会改变前进后退恢复。
- 识别窗口滚动、嵌套滚动容器和 SSR 初始恢复的边界。

## 二、为什么需要滚动恢复

浏览器在多页文档导航中会记住每个历史条目的滚动位置，但客户端路由只是在同一个文档内替换界面。
如果应用只调用 `navigate` 或渲染新的 route，用户从长列表进入详情再返回时，列表可能停在顶部，必须重新寻找
刚才的位置。反过来，筛选条件只改变查询参数时，直接回到顶部也会打断用户的阅读。

滚动策略需要区分三种意图：新页面导航通常从顶部开始，前进或后退应恢复对应历史位置，局部查询参数变化可以
保留当前位置。`ScrollRestoration` 把这些规则接到 Data Router 的导航提交时机上，避免在组件的 `useEffect`
中自行猜测导航方向。

## 三、核心概念

### 1. ScrollRestoration 接入 Data Router

`ScrollRestoration` 只能在 Data Mode 或 Framework Mode 使用，不能放进只提供路由渲染的 Declarative Mode。
它应在根路由布局中只渲染一次，让所有子路由共享同一份位置记录：

```tsx
import { Outlet, ScrollRestoration } from 'react-router'

function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  )
}
```

组件内部会启用 Router 的滚动恢复能力，并把 `window.history.scrollRestoration` 临时设为 `manual`。卸载时它会
恢复为 `auto`，因此独立挂载的 Demo 或微前端不能永久占用宿主的 history 设置。

### 2. 新导航与 POP 导航的默认顺序

Router 在开始导航时先保存当前页面的 `window.scrollY`。导航完成后，`ScrollRestoration` 依据 Router 状态执行：

1. 有已保存的数字位置时，调用 `window.scrollTo(0, position)`。
2. 没有保存位置但 URL 带 hash 时，查找对应元素并调用 `scrollIntoView()`。
3. 没有 hash 且未设置 `preventScrollReset` 时，调用 `window.scrollTo(0, 0)`。

前进或后退属于 POP 导航，通常能找到历史条目对应的已保存位置；普通 Link 或 `navigate('/new')` 是新位置，默认
回到顶部。Router 的 `restoreScrollPosition` 为 `number`、`null` 或 `false`，分别表达恢复数字位置、按 hash 或
顶部处理，以及提交/重新验证期间不改变滚动。

### 3. 存储键、sessionStorage 与 getKey

默认键使用每个 `location.key`，所以同一路径的不同历史条目可以拥有不同位置。`ScrollRestoration` 会把位置表写入
`sessionStorage`，默认存储名为 `react-router-scroll-positions`。可以用 `storageKey` 隔离多个应用或 Demo：

```tsx
<ScrollRestoration storageKey="course-scroll-positions" />
```

`getKey` 接收当前 `location` 和已匹配的 route matches，返回位置表的键。按 pathname 归并可以让用户再次进入同一
路径时回到该路径上次的位置：

```tsx
<ScrollRestoration getKey={(location) => location.pathname} />
```

键粒度是产品决策。使用 `location.key` 能区分每个历史 entry；使用 pathname 会让多个 query 或 state entry 共享
位置。不要为了“看起来稳定”随意丢弃会改变阅读上下文的查询参数。

### 4. preventScrollReset 只改变新位置的回顶

`Link`、`NavLink` 和 `Form` 支持 `preventScrollReset`。它表示这次导航完成后，如果没有可恢复的位置，不要把窗口
滚到顶部：

```tsx
<Link to="?view=compact" preventScrollReset>
  切换视图
</Link>
```

这个属性不会阻止 Router 保存当前位置，也不会关闭前进后退恢复。它适合 tab、排序或筛选这类仍在同一阅读上下文
中的 URL 变化；进入完全不同的页面时通常应使用默认回顶。

### 5. hash、SSR 与嵌套滚动容器

hash 定位优先于默认回顶。目标元素必须在导航完成后存在，元素 ID 还要能被 URL 解码；否则 Router 会继续执行
默认策略。Framework Mode 下，组件还会渲染一个内联脚本，让服务端输出的页面在 hydration 前就尝试恢复初始位置，
并支持传入 CSP `nonce`。

官方组件记录的是窗口 `scrollY`，不是任意 `div` 的 `scrollTop`。如果页面由固定外壳和内部滚动容器组成，需要
为该容器设计独立的滚动状态合同；不能仅把 `ScrollRestoration` 放在容器旁边就自动获得元素级恢复。

## 四、用法与示例

### 1. 在根布局统一挂载

让根布局同时包含 `ScrollRestoration` 和 `Outlet`，不要在每个页面重复挂载：

```tsx
const routes = [
  {
    id: 'root',
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: 'catalog', Component: Catalog },
    ],
  },
]
```

重复实例会同时读写同一个窗口和存储表，使恢复顺序依赖渲染顺序，也会让卸载某个子树错误地恢复
`history.scrollRestoration`。

### 2. 为同一路径选择合适的 key

需要区分同一路径的多个搜索 entry 时保留默认 `location.key`。如果产品希望离开后再次进入目录仍回到目录上次
的阅读位置，可以按 pathname 归并，并在正文中明确查询参数共享位置的取舍：

```tsx
function RootLayout() {
  return (
    <>
      <ScrollRestoration getKey={(location) => location.pathname} />
      <Outlet />
    </>
  )
}
```

`getKey` 应返回稳定、可序列化为对象键的字符串。它只决定位置如何索引，不负责改变 URL、匹配路由或执行数据
加载。

### 3. 组合 hash 与 preventScrollReset

同一个 `ScrollRestoration` 可以同时处理锚点链接和局部查询参数：

```tsx
<Link to="/docs#api">跳到 API</Link>
<Link to="?tab=examples" preventScrollReset>切换示例</Link>
```

前者会在目标元素存在时滚到 `id="api"`；后者保留当前位置。若查询参数切换后仍希望滚到某个锚点，应把 hash
写入目标 URL，让 hash 规则有明确目标，而不要在页面 effect 中追加一次 `scrollTo`。

### 4. 观察 Router 的提交边界

可以用 `useLocation`、`useNavigationType` 和 `window.scrollY` 观察策略，但不要把观察逻辑变成第二套恢复实现：

```tsx
function ScrollDebug() {
  const location = useLocation()
  const navigationType = useNavigationType()

  return (
    <p>
      {navigationType}：{location.pathname}，当前滚动 {window.scrollY}px
    </p>
  )
}
```

读取 `window.scrollY` 需要在浏览器环境中进行；服务端渲染时应把它视为不可用的运行时数据。

## 五、用法示例或 Demo

:::demo{id="react.router.learn.advanced.scroll-restoration.scroll-restoration-demo"}
Demo 从一个很长的目录页开始。向下滚动后进入帮助页，观察新导航回到顶部；点击“后退并恢复”返回目录，
观察 Router 恢复之前保存的位置。目录中的查询参数视图链接使用 `preventScrollReset`，切换时保持当前位置；
页面还提供锚点链接和实时 `scrollY`、导航类型、恢复策略与自定义 key 展示。
:::

## 六、易错使用提示

:::pitfalls
### 错误：在每个页面都挂载 ScrollRestoration

**触发条件：** 目录页和详情页各自渲染一个 `ScrollRestoration`。

**原因：** 组件会共同操作窗口滚动、Router 注册和 `history.scrollRestoration`，它们没有页面级隔离合同。

**后果：** 同一次导航可能连续执行多次恢复，子页面卸载还可能把宿主设置提前改回 `auto`。

**错误示例：**

```tsx
function Catalog() {
  return <><ScrollRestoration /><CatalogContent /></>
}
```

**正确写法：**

```tsx
function RootLayout() {
  return <><ScrollRestoration /><Outlet /></>
}
```

**验证方式：** 在根布局只保留一个实例，进入、离开和返回多个子路由，确认每次导航只有一个滚动结果。

### 错误：把 preventScrollReset 当成完整恢复方案

**触发条件：** 只在 Link 上添加 `preventScrollReset`，却期待离开页面后能恢复原来的位置。

**原因：** 该属性只阻止没有保存位置时的回顶，恢复位置仍需要 `ScrollRestoration` 和 Data Router。

**后果：** 局部 tab 可能保留位置，但页面返回时仍从顶部开始。

**错误示例：**

```tsx
<Link to="/catalog?view=compact" preventScrollReset />
```

**正确写法：**

```tsx
<ScrollRestoration />
<Link to="?view=compact" preventScrollReset>紧凑视图</Link>
```

**验证方式：** 分别测试新导航和 POP 导航：新导航保持当前位置，后退/前进仍恢复对应历史位置。

### 错误：用 pathname key 掩盖不同阅读上下文

**触发条件：** 所有页面都使用 `getKey={(location) => location.pathname}`，包括搜索结果和分页 URL。

**原因：** 多个 query entry 会共享同一个位置槽位，后一次滚动会覆盖前一次。

**后果：** 返回某个筛选结果时跳到另一个筛选结果的阅读位置，用户会误以为列表发生了跳跃。

**错误示例：**

```tsx
<ScrollRestoration getKey={(location) => location.pathname} />
```

**正确写法：**

```tsx
<ScrollRestoration getKey={(location) => `${location.pathname}${location.search}`} />
```

**验证方式：** 进入两个不同查询结果并滚动到不同位置，前进后退后确认它们不会互相覆盖。

### 错误：把窗口恢复当成内部滚动容器恢复

**触发条件：** 页面只有 `div` 的 `overflow: auto`，却只挂载 `ScrollRestoration`。

**原因：** 官方组件读取和写入的是 `window.scrollY` 与 `window.scrollTo`。

**后果：** 窗口位置可能改变，但真正的内容面板仍停在旧位置或顶部。

**错误示例：**

```tsx
<div data-scroll-container style={{ overflow: 'auto' }}>
  <ScrollRestoration />
</div>
```

**正确写法：** 为内部容器单独记录 `scrollTop`，在路由 key 与容器生命周期明确后恢复；不要假设官方组件会发现任意
元素。

```tsx
const container = document.querySelector<HTMLElement>('[data-scroll-container]')
const position = container?.scrollTop ?? 0
```

**验证方式：** 分别滚动窗口和内容容器，确认两者的保存与恢复责任没有混淆。
:::

## 七、源码推导与适用场景

1. **官方事实：** React Router 8.3.0 的 `ScrollRestoration` 调用 `useScrollRestoration`，默认使用
   `location.key`，可通过 `getKey` 和 `storageKey` 改变索引与存储名；DOM 层在导航期间保存窗口 `scrollY`，
   并在 Router 状态给出数字位置、hash 或默认回顶信号后执行相应滚动。
2. **官方事实：** Router 在开始导航时保存当前位置；提交时根据已保存位置、`preventScrollReset` 和导航类型计算
   `restoreScrollPosition`。重新验证将其设为 `false`，表示不因数据更新而移动滚动位置。
3. **官方事实：** 官方 DOM 测试覆盖返回历史条目时恢复数值位置、basename 传递、sessionStorage 不可用时的容错、
   初始 SSR 内联脚本以及 `nonce` 透传；Router 测试覆盖新导航、POP、GET/POST 提交、hash 和自定义 key。
4. **课程推导：** 滚动 key 应与用户的阅读上下文一致。路线级文档适合 pathname 归并，搜索和分页通常需要保留
   query，不能把一个通用 key 规则无条件套在所有页面。
5. **适用边界：** 这是窗口级滚动恢复能力。固定壳中的内部滚动面板、多个并行滚动区域和虚拟列表，需要独立的
   元素滚动状态设计；组件卸载时还要归还宿主的 history 设置。

## 八、练习

:::exercise
### 练习目标

**要求：** 建立包含 `/catalog` 和 `/help` 的 Data Router 根布局，在根布局挂载一个 `ScrollRestoration`。
让目录页渲染足够长的内容并提供两个查询参数链接：一个默认回顶，一个带 `preventScrollReset`。进入帮助页后
通过内存 history 后退，验证目录位置恢复；再为 hash 目标添加一个带 `id` 的章节。最后比较默认 `location.key`
与 pathname key 对两个不同查询结果的影响，并说明选择理由。

**验收：** 新导航到帮助页回到顶部；后退回目录恢复离开前的位置；带 `preventScrollReset` 的查询参数链接保持
当前位置；hash 链接在目标元素存在时定位；两个查询结果使用 pathname key 时共享位置，改用包含 search 的 key 后
各自独立。
:::

## 九、本节小结

- `ScrollRestoration` 是 Data/Framework Mode 的根级窗口滚动恢复组件，应只挂载一次。
- 新导航默认回顶，POP 导航恢复保存的位置，hash 在没有数字位置时优先定位目标元素。
- 默认使用 `location.key`，`getKey` 可以按 pathname 或查询上下文重新定义位置粒度，`storageKey` 隔离存储表。
- `preventScrollReset` 只阻止新位置的默认回顶，不会关闭位置保存或前进后退恢复。
- 官方组件处理窗口而非任意元素；内部滚动容器、SSR 和卸载清理需要额外边界设计。

## 十、参考资料

- [ScrollRestoration API](https://reactrouter.com/8.3.0/api/components/ScrollRestoration) - 组件模式、`getKey` 和 `storageKey` 公共合同。
- [ScrollRestoration 文档源码](https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/api/components/ScrollRestoration.md) - 固定版本原始文档。
- [DOM 实现源码](https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/lib/dom/lib.tsx) - `window.history.scrollRestoration`、sessionStorage、hash 和回顶顺序。
- [Router 源码](https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/lib/router/router.ts) - 保存位置、恢复状态和 `preventScrollReset` 的计算。
- [DOM 滚动恢复测试](https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/__tests__/dom/scroll-restoration-test.tsx) - 恢复、SSR、nonce 与存储容错行为。
- [Router 滚动恢复测试](https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/__tests__/router/scroll-restoration-test.ts) - 导航、POP、提交和自定义 key 场景。
- [Link API](https://reactrouter.com/8.3.0/api/components/Link) - `preventScrollReset` 的链接行为。
- [Form API](https://reactrouter.com/8.3.0/api/components/Form) - 提交导航中的 `preventScrollReset`。
