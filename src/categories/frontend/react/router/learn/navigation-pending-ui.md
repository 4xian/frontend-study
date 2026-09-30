---
id: react.router.learn.intermediate.navigation-pending-ui
type: lesson
title: 导航 Pending UI
summary: 用 useNavigation 和 NavLink 观察普通导航的等待状态，在目标数据完成前保留当前页面。
domain: frontend
technology: react
module: router
stage: intermediate
level: intermediate
estimatedMinutes: 90
prerequisites:
  - react.router.learn.intermediate.loader-data-loading
  - react.router.learn.basics.nav-link-state
related:
  - react.router.learn.intermediate.route-data-reading-and-sharing
  - react.router.learn.basics.nested-routes-and-outlet
  - react.router.learn.basics.nav-link-state
tags:
  - React Router
  - Data Mode
  - useNavigation
  - Navigation
  - NavLink
  - Pending UI
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-21
objectives:
  - 能用 useNavigation 读取普通导航的 idle 和 loading 状态。
  - 能区分 useLocation 的当前位置与 navigation.location 的目标位置。
  - 能解释目标 loader 完成前旧页面仍然可见，以及完成后的整体提交。
  - 能用 NavLink 的 isPending 为本次目标链接提供局部反馈。
  - 能让全局状态反馈、局部链接反馈和当前页面标记各自承担清晰职责。
  - 能为等待状态补充稳定的 status、aria-busy 和 reduced-motion 处理。
recap:
  - Data Router 会在普通导航等待目标 loaders 时把 navigation.state 设为 loading。
  - idle 时 navigation.location 是 undefined，loading 时它表示目标 Location。
  - 目标数据完成前当前 location、匹配链、loader data 和旧页面保持已提交状态。
  - NavLink 的 isPending 由 Router 的目标位置匹配得出，不应手写 pathname 比较替代它。
  - useNavigation 适合共享布局的全局反馈，NavLink.isPending 适合单个入口的局部反馈。
  - status、aria-busy 和 reduced-motion 是应用层的可访问与动效实现，不是 Router 自动生成的契约。
sources:
  - title: React Router 8.3.0 Release
    url: https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0
    sourceType: release-note
    appliesTo: React Router 8.3.0
    claims:
      - 8.3.0 是核验时的稳定发布版本，对应固定官方提交。
  - title: npm react-router Latest Metadata
    url: https://registry.npmjs.org/react-router/latest
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - 2026-08-21 的 latest dist-tag 为 8.3.0。
  - title: useNavigation
    url: https://reactrouter.com/8.3.0/api/hooks/useNavigation
    sourceType: api-doc
    appliesTo: React Router 8.3.0
    claims:
      - useNavigation 返回当前 Navigation，可用于读取等待状态。
      - Hook 需要 Data Router 上下文。
  - title: Pending UI
    url: https://reactrouter.com/8.3.0/start/data/pending-ui
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - 目标页面 loaders 完成前可以用 useNavigation 渲染全局反馈。
      - NavLink 的 isPending 可为单个导航链接提供局部反馈。
  - title: React Router 8.3.0 Navigation Types
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - Navigation 是 idle、loading、submitting 的判别联合。
      - idle 的 location 为 undefined，loading 的 location 是目标 Location。
  - title: React Router 8.3.0 Navigation Flow Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L2454-L2497
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - Router 先更新 loading navigation，再等待匹配 loaders。
  - title: React Router 8.3.0 NavLink Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/dom/lib.tsx
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - NavLink 的 isPending 根据 Router 的目标位置和链接匹配规则计算。
  - title: React Router 8.3.0 Navigation Test
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/router/navigation-test.ts#L1139-L1165
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - GET 导航期间状态为 loading，完成后恢复 idle 并清除 navigation.location。
  - title: React Router Accessibility
    url: https://reactrouter.com/8.3.0/how-to/accessibility
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - 客户端路由应用需要自行考虑焦点和状态播报等可访问行为。
  - title: WAI-ARIA status
    url: https://www.w3.org/TR/wai-aria-1.2/#status
    sourceType: specification
    appliesTo: WAI-ARIA 1.2
    claims:
      - status 适合表达 advisory live region 的状态变化。
  - title: WAI-ARIA aria-busy
    url: https://www.w3.org/TR/wai-aria-1.2/#aria-busy
    sourceType: specification
    appliesTo: WAI-ARIA 1.2
    claims:
      - aria-busy 可以标记内容区域仍在更新。
  - title: prefers-reduced-motion
    url: https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion
    sourceType: specification
    appliesTo: Media Queries Level 5
    claims:
      - 应用可以根据用户的 reduced-motion 偏好停止非必要动画。
---

# 导航 Pending UI

## 一、学习目标

- 能用 `useNavigation()` 观察 Data Router 普通链接导航的 `idle` 与 `loading`。
- 能同时显示已经提交的 `useLocation()` 和正在前往的 `navigation.location`。
- 能解释目标 `loader` 完成前为什么旧页面仍然显示，以及完成后何时切换到新页面。
- 能用 `NavLink` 的 `isPending` 反馈哪个链接是本次目标，而不是复制 Router 的匹配逻辑。
- 能把全局导航反馈、单个链接反馈和当前页标记放在合适的界面位置。
- 能让等待状态具备文字语义、`aria-busy` 和 reduced-motion 分支。

## 二、为什么导航需要等待反馈

点击链接后，浏览器通常会立刻出现可见响应。但 Data Router 的目标 route 可能还需要运行 loader，
因此 Router 不会在目标数据准备好以前提交下一页面。没有反馈时，用户只能看到旧页面，容易把正常等待
误认为点击没有生效。

Pending UI 解决的是“现在正在等待哪次导航”，不是“把下一页提前画出来”。一次普通导航可以按下面的
顺序理解：

```text
页面 A，navigation.state = idle
        |
        | 激活指向页面 B 的 Link 或 NavLink
        v
navigation.state = loading
navigation.location = B
useLocation() = A，页面 A 仍然显示
        |
        | 等待页面 B 的 loaders
        v
一次提交 B 的 location、matches 和 loader data
navigation.state = idle
useLocation() = B，页面 B 开始显示
```

全局反馈让用户知道应用在工作，目标链接的局部反馈让用户知道哪一个入口正在等待。两者可以同时出现，
但不应各自维护一套本地“加载中”状态。

## 三、Navigation 的状态模型

### 1. `idle`、`loading` 与 `submitting`

React Router 的 `Navigation` 是一个判别联合，公开状态值是：

| `navigation.state` | 语义 | `navigation.location` |
| --- | --- | --- |
| `idle` | 没有进行中的导航 | `undefined` |
| `loading` | 普通导航正在等待目标数据 | 目标 `Location` |
| `submitting` | 数据提交导航正在进行 | 目标 `Location` |

本节只实现普通链接产生的 `idle -> loading -> idle`。`submitting` 说明完整类型的边界，但数据提交、表单
和 action 属于另外的数据交互主题。不要为了显示一个全局等待条就把所有非 `idle` 情况都混称为本节的
`loading`。

### 2. `useNavigation` 读取 Router 状态

`useNavigation()` 返回当前 Navigation 对象：

```tsx
function GlobalPending() {
  const navigation = useNavigation()
  const isLoading = navigation.state === 'loading'

  return (
    <p role="status">
      {isLoading ? `正在加载 ${navigation.location?.pathname ?? '目标页面'}` : '导航空闲'}
    </p>
  )
}
```

这个 Hook 读取 Data Router 状态，因此组件必须位于 `createMemoryRouter`、`createBrowserRouter` 等 Data
Router 的 Provider 下面。把它放进只提供 Declarative Router 上下文的组件树会缺少所需的状态来源。

### 3. 空闲时不要直接访问目标位置

`idle` 分支的 `navigation.location` 是 `undefined`。读取它的 pathname 时必须先缩窄状态或使用可选链：

```tsx
const targetPath =
  navigation.state === 'loading' ? navigation.location.pathname : '无'
```

下面这种写法会在首次渲染或导航完成后出错：

```tsx
const targetPath = navigation.location.pathname
```

## 四、区分当前位置与目标位置

### 1. `useLocation` 表示已经提交的位置

`useLocation()` 仍然表示当前已经提交的 route。在页面 A 前往页面 B 的 loading 窗口中，
`useLocation().pathname` 仍然是 A。它适合标记当前页面、读取已经提交的查询参数或展示当前内容的上下文。

### 2. `navigation.location` 表示正在前往的位置

loading 时，`navigation.location` 是 Router 为本次导航构造的目标 `Location`。它不能替代当前 location：

```tsx
function LocationObserver() {
  const location = useLocation()
  const navigation = useNavigation()

  return (
    <dl>
      <div>
        <dt>当前已提交</dt>
        <dd>{location.pathname}</dd>
      </div>
      <div>
        <dt>正在前往</dt>
        <dd>{navigation.location?.pathname ?? '无'}</dd>
      </div>
    </dl>
  )
}
```

把目标位置写进“当前页面”一栏，会让 UI 在旧页面仍可见时产生矛盾。始终给两个位置不同的标签。

### 3. 目标 loader 完成后一次提交

Router 会先让导航进入 loading，再等待匹配的 loaders。loader 完成后，Router 一次提交新 location、匹配
链和 loader data，并把 navigation 恢复为 idle。此时目标位置重新变为 `undefined`，页面组件也切换到
新 route 的内容。

如果目标 route 没有需要加载的工作，Router 可能直接完成导航，loading 窗口短到人眼不可见。Demo 里的
短暂 loader 延时只为观察真实 Router 状态，不是生产性能建议，也不应在组件点击事件里手写一个假状态。

## 五、在共享布局显示全局反馈

### 1. 让反馈与 `Outlet` 并存

共享布局可以在 `Outlet` 上方或附近显示全局反馈：

```tsx
function AppShell() {
  const navigation = useNavigation()
  const isLoading = navigation.state === 'loading'

  return (
    <section>
      {isLoading && <p role="status">正在加载目标页面</p>}
      <div aria-busy={isLoading}>
        <Outlet />
      </div>
    </section>
  )
}
```

loading 时不要写成 `isLoading ? <Spinner /> : <Outlet />`。旧页面是已经提交的可用内容，它应继续显示，
而状态条只补充“正在等待”的信息。

### 2. 全局反馈回答一个问题

全局状态条适合放在共享 layout，因为一次导航可能影响多个嵌套路由。它回答的是“应用现在是否正在等待
一次导航”。

它不负责判断哪个入口触发导航，也不应把所有链接一起改成不可操作的遮罩。普通 Link 仍然是标准 anchor，
用户可以继续阅读当前内容。

## 六、用 `NavLink.isPending` 显示局部反馈

### 1. 让 Router 负责链接匹配

`NavLink` 的 children、className 和 style 可以接收状态回调。目标链接的 `isPending` 表示它与当前进行
中的目标位置匹配：

```tsx
<NavLink to="/reports">
  {({ isActive, isPending }) => (
    <span>
      报告
      {isPending ? ' · 正在前往' : isActive ? ' · 当前页面' : ''}
    </span>
  )}
</NavLink>
```

loading 期间，旧页面的链接可以仍然是 `isActive`，而指向 B 的链接同时是 `isPending`。这正是“当前内容
还在、目标正在等待”的两个不同事实。

### 2. 不要手写 pathname 比较

下面的比较看起来简单，但没有覆盖 NavLink 的相对路径、basename、大小写和 `end` 等匹配规则：

```tsx
const isPending = navigation.location?.pathname === item.to
```

使用 `NavLink` 自己的 `isPending` 更准确，也避免在业务组件里复制 Router 的匹配实现。`useNavigation` 仍然
适合全局状态和目标位置观察；`NavLink.isPending` 适合目标入口旁的短文案、边框或小指示器。

### 3. Active 与 Pending 的职责不同

`isActive` 描述已经提交的当前匹配，通常由 `NavLink` 自动提供 `aria-current="page"`；`isPending` 描述
正在加载的目标匹配。不要用 active 代替 pending，也不要在 pending 时把当前 active 样式抹掉。

## 七、补齐可访问的等待反馈

### 1. 使用稳定的 status 节点

Router 提供状态，但不会自动创建 live region。可以让一个稳定挂载的节点承担状态播报：

```tsx
<p role="status" aria-live="polite" aria-atomic="true">
  {isLoading ? '正在加载报告' : ''}
</p>
```

状态文字应该清楚表达等待事实，不需要在 pending 开始时抢夺焦点。视觉反馈也不能只依赖颜色或动画，
文字、边框或稳定的图标形状至少保留一种非运动线索。

### 2. 给仍在更新的内容标记 `aria-busy`

目标内容区域可以从 Router 状态派生 `aria-busy`：

```tsx
<div aria-busy={navigation.state === 'loading'}>
  <Outlet />
</div>
```

它表达的是内容区域正在更新，完成后必须回到 `false`。`aria-busy` 不会替代可见等待文字，也不会让目标
页面提前出现。

### 3. 尊重 reduced-motion

如果等待条包含移动或闪烁效果，应提供 `@media (prefers-reduced-motion: reduce)` 分支，停止非必要动画，
但保留状态文字和边框反馈：

```css
@media (prefers-reduced-motion: reduce) {
  .pending-bar {
    animation: none;
  }
}
```

这是应用层对 Web 标准的实现，不是 `useNavigation` 自动提供的样式。

## 八、导航 Pending 观察台

Demo 使用独立的 `createMemoryRouter`，不会修改学习站外层 URL。初始页面是“工作台”，报告和发布记录 route
各自有一个真实异步 loader：

1. 初始状态为 `idle`，当前位置为 `/`，没有目标位置。
2. 点击“质量报告”后，`state` 变为 `loading`，目标位置为 `/reports`，工作台仍然显示。
3. 同一个窗口中，质量报告链接用 `isPending` 显示“正在前往”，全局 status 显示“正在加载质量报告”。
4. loader 完成后，状态恢复 `idle`，目标位置清空，内容一次切换到质量报告。
5. 从报告切换到发布记录时，可以观察相同的 current/target 对照。

:::demo{id="react.router.learn.intermediate.navigation-pending-ui.pending-navigation-demo"}
:::

Demo 的延迟位于 loader 内部，并通过 `request.signal` 在导航取消时释放计时器。组件没有用点击事件或本地
State 假造 Router pending，也没有加入 action、Form、fetcher、revalidation 或错误边界。

## 九、易错使用提示

:::pitfalls
### 错误：在 Declarative Router 中调用 `useNavigation`

**触发条件：** 使用 `<BrowserRouter>` 或 `<MemoryRouter>` 包裹仍调用 `useNavigation` 的组件。

**原因：** Hook 读取 Data Router 的导航状态，不是普通 Router 的 location context。

**后果：** 运行时缺少 Data Router context，无法读取 pending 状态。

**错误示例：**

```tsx
<MemoryRouter>
  <PendingShell />
</MemoryRouter>
```

**正确写法：** 使用 `createMemoryRouter` 创建 Data Router，并由 `RouterProvider` 提供对应上下文。

```tsx
const router = createMemoryRouter(routes)

<RouterProvider router={router} />
```

**验证方式：** 在 Data Router Provider 下观察初始 `idle`，再激活有 loader 的目标链接。
:::

:::pitfalls
### 错误：判断不存在的 `pending` 状态值

**触发条件：** 写 `navigation.state === 'pending'`。

**原因：** Pending UI 是界面概念，Navigation 的普通加载状态值实际是 `loading`。

**后果：** 条件不会在普通导航期间成立，状态条永远不显示。

**错误示例：**

```tsx
const isPending = navigation.state === 'pending'
```

**正确写法：**

```tsx
const isLoading = navigation.state === 'loading'
```

**验证方式：** 用一个有明确异步 loader 的 route，记录点击后 `state` 的实际值。
:::

:::pitfalls
### 错误：空闲时直接读取 `navigation.location.pathname`

**触发条件：** 初次渲染或导航结束时不做状态缩窄就访问 pathname。

**原因：** idle 分支的 location 是 `undefined`。

**后果：** 首次渲染或完成回调中抛出属性访问错误。

**错误示例：**

```tsx
const targetPath = navigation.location.pathname
```

**正确写法：**

```tsx
const targetPath = navigation.location?.pathname ?? '无'
```

**验证方式：** 同时检查初始 idle、loading 和完成后的三次渲染。
:::

:::pitfalls
### 错误：把目标位置当成当前页面

**触发条件：** loading 时用 `navigation.location` 替代 `useLocation()` 渲染“当前页面”。

**原因：** navigation.location 是下一位置，Router 尚未提交它。

**后果：** 页面标题声称已经进入目标，但旧页面内容仍在显示，观察结果互相矛盾。

**错误示例：**

```tsx
<p>当前页面：{navigation.location?.pathname}</p>
```

**正确写法：**

```tsx
<p>当前页面：{useLocation().pathname}</p>
<p>正在前往：{navigation.location?.pathname ?? '无'}</p>
```

**验证方式：** 在 loader 完成前确认两行分别为旧路径和目标路径。
:::

:::pitfalls
### 错误：loading 时用 spinner 替换整个 `Outlet`

**触发条件：** 通过条件渲染让等待条取代旧页面。

**原因：** 忽略 Data Router 在目标 loaders 完成前保留旧页面的行为。

**后果：** 当前内容突然消失，用户失去上下文，也无法知道这是一次成功触发的导航。

**错误示例：**

```tsx
{isLoading ? <Spinner /> : <Outlet />}
```

**正确写法：**

```tsx
{isLoading && <GlobalPending />}
<Outlet />
```

**验证方式：** loading 窗口内旧页面的 `data-testid` 仍然存在且可读。
:::

:::pitfalls
### 错误：只检查 `isActive`，不提供目标反馈

**触发条件：** 目标 loader 运行时只根据当前链接的 active 样式更新文案。

**原因：** active 表示已经提交的当前页面，pending 表示下一位置的目标匹配。

**后果：** 目标链接没有等待提示，旧链接仍 active 的事实也被错误隐藏。

**错误示例：**

```tsx
<NavLink to="/reports">{({ isActive }) => isActive && '当前页面'}</NavLink>
```

**正确写法：**

```tsx
<NavLink to="/reports">
  {({ isActive, isPending }) =>
    isPending ? '正在前往' : isActive ? '当前页面' : '质量报告'}
</NavLink>
```

**验证方式：** 激活报告链接后，在 loader 完成前同时观察旧链接 active 和目标链接 pending。
:::

:::pitfalls
### 错误：手写 pathname 比较模拟 `NavLink.isPending`

**触发条件：** 用 `navigation.location?.pathname === item.to` 为每个链接推导局部等待。

**原因：** 这绕开了 NavLink 的相对路径、basename、大小写和 `end` 匹配规则。

**后果：** 嵌套路由或前缀匹配下局部反馈可能与 Router 判断不一致。

**错误示例：**

```tsx
const pending = navigation.location?.pathname === item.to
```

**正确写法：**

```tsx
<NavLink to={item.to}>
  {({ isPending }) => (isPending ? '正在前往' : item.label)}
</NavLink>
```

**验证方式：** 在相对路径或带前缀的嵌套路由中检查链接状态仍与 Router 匹配结果一致。
:::

:::pitfalls
### 错误：只做动画，不提供状态语义

**触发条件：** 等待条只有无限移动效果，没有文字或状态节点。

**原因：** Router 不会自动生成 live region；非必要动画也应尊重用户偏好。

**后果：** 辅助技术用户得不到等待信息，减少动态效果的用户仍被迫观看动画。

**错误示例：**

```css
.bar {
  animation: slide 1s infinite;
}
```

**正确写法：**

```tsx
<p role="status" aria-live="polite">
  {isLoading ? '正在加载目标页面' : ''}
</p>
```

**验证方式：** 检查 status 文本、内容区域的 `aria-busy` 和 reduced-motion 样式分支。
:::

## 十、源码推导与适用场景

### 1. Router 先公布 loading，再等待 loaders

**官方事实：** Router 为目标位置构造 loading navigation，更新 Router state 后才等待匹配 loaders。

**课程推导：** 共享布局可以在旧页面继续显示的同时读到 loading 和目标位置，这正是全局 pending UI 的
数据来源。

**适用场景：** 顶部进度条、共享状态文字、内容容器的 busy 标记。

**边界：** 先更新状态再等待 loaders 是 8.3.0 固定源码中的内部顺序，不是跨版本公共承诺；应用只应依赖
公开的 Navigation 状态，并在升级后重新核对内部流程。

### 2. 完成导航时恢复 idle

**官方事实：** loader 结果提交时，Router 一起更新 location、matches、loader data，并把 navigation
设为 idle。

**课程推导：** 不需要用组件 effect 监听 loader 完成，也不应自行复制一套“目标已完成”状态。

**适用场景：** 让等待状态自然消失，并让新的 route component 在同一次提交后读取自己的 loader data。

**边界：** 具体提交的内部字段组合来自 8.3.0 源码；不要依赖 effect 执行次数或内部更新批次判断导航完成，
版本升级后应重新核对实现。

### 3. NavLink 的局部状态来自同一目标位置

**官方事实：** NavLink 根据 Router 的 navigation location 与自身解析后的 href 计算 isPending。

**课程推导：** 全局 Hook 与单个链接回调观察的是同一次导航；它们可以并存而不会产生两个请求或两套状态机。

**适用场景：** 导航栏目标文案、局部边框、小型指示器和不遮挡内容的视觉反馈。

**边界：** `NavLink` 的 pathname 解析和匹配步骤属于 8.3.0 内部实现；不要复制这套算法，公开可依赖的
接口是渲染回调提供的 `isPending`。

### 4. 反馈位置应与问题范围匹配

**官方事实：** useNavigation 暴露整个 Data Router 的当前导航，NavLink 暴露当前链接的 active/pending
渲染信息。

**课程推导：** 全局事实放在共享布局，入口事实放在链接内部；不要让每个页面都各自推断全局导航。

**适用场景：** 嵌套路由工作区、文档目录、带慢 loader 的局部页面切换。

**边界：** 这是根据公开状态范围得到的界面职责建议，不是 React Router 强制的组件层级；反馈位置仍应按
应用布局和可访问性需求决定。

## 十一、练习

:::exercise
### 练习目标

**要求：** 建立一个独立的 Data Router：根布局包含“总览”“成员”“设置”三个 `NavLink`，成员和设置 route 各有
一个可取消的异步 loader。布局使用 `useNavigation` 显示 `idle`、`loading`、当前 pathname 和目标
pathname；内容容器使用 `aria-busy`，每个链接使用 `isPending`。不要用点击事件或本地 state 模拟等待，
不要用 spinner 替换 `Outlet`，不要加入 action、Form、fetcher、revalidation 或错误边界。

**验收：** 初始为 idle；点击成员后，loading 窗口内总览仍可见、当前路径仍为旧路径、目标路径为成员，
只有成员链接显示 pending；loader 完成后一次切换到成员且目标路径清空。键盘激活和鼠标激活结果一致，
reduced-motion 下文字反馈仍然存在。
:::

## 十二、本节小结

- `useNavigation` 读取 Data Router 的当前导航；普通链接的主线状态是 `idle -> loading -> idle`。
- loading 时 `navigation.location` 是目标位置，`useLocation()` 仍是已经提交的当前位置。
- 目标 loaders 完成前旧页面应继续显示，等待反馈与 `Outlet` 并存。
- `NavLink.isPending` 负责单个目标链接的局部反馈，`isActive` 继续表示当前已提交页面。
- 不要把 UI 名称 `pending` 写成不存在的 Navigation 状态值，也不要直接读取 idle 的 undefined location。
- status、`aria-busy` 和 reduced-motion 分支由应用实现，用于补齐状态语义和动效偏好。

## 十三、参考资料

- [React Router 8.3.0 Release](https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0) - 核验稳定发布与固定 tag。
- [npm react-router Latest Metadata](https://registry.npmjs.org/react-router/latest) - 核验 2026-08-21 的 latest 版本。
- [useNavigation](https://reactrouter.com/8.3.0/api/hooks/useNavigation) - 当前 Navigation Hook 的公开合同。
- [Pending UI](https://reactrouter.com/8.3.0/start/data/pending-ui) - 全局与局部等待反馈示例。
- [Navigation Types and Flow Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts) - 状态联合、loading 更新、loader 等待和完成提交。
- [NavLink Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/dom/lib.tsx) - active/pending 匹配和渲染回调。
- [Navigation Test](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/router/navigation-test.ts#L1139-L1165) - loading 到 idle 的状态断言。
- [React Router Accessibility](https://reactrouter.com/8.3.0/how-to/accessibility) - 客户端路由应用的可访问性边界。
- [WAI-ARIA status](https://www.w3.org/TR/wai-aria-1.2/#status) - 状态 live region 语义。
- [WAI-ARIA aria-busy](https://www.w3.org/TR/wai-aria-1.2/#aria-busy) - 内容更新中的 busy 标记。
- [prefers-reduced-motion](https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion) - 用户动效偏好媒体查询。
