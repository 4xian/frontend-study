---
id: react.router.learn.intermediate.lazy-routes
type: lesson
title: Lazy 路由
summary: 用 Data Mode 的 route.lazy 在导航前加载路由实现，缩小初始代码并保持 loader 与组件的路由所有权。
domain: frontend
technology: react
module: router
stage: intermediate
level: intermediate
estimatedMinutes: 55
prerequisites:
  - react.router.learn.intermediate.route-metadata-and-breadcrumbs
related:
  - react.router.learn.intermediate.navigation-pending-ui
  - react.router.learn.intermediate.route-error-boundary
tags:
  - React Router
  - Data Mode
  - route.lazy
  - code splitting
  - loader
  - pending navigation
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-25
objectives:
  - 能使用函数形状的 route.lazy 返回命名的 Component、loader 和 ErrorBoundary。
  - 能使用属性对象形状分别懒加载 route 的实现属性，并理解它们可以并行解析。
  - 能区分静态匹配字段与可延迟加载的 route 实现字段。
  - 能解释 lazy 与 React.lazy 的加载时机、模块导出形状和错误边界差异。
  - 能处理 lazy 导航的 pending、缓存和错误恢复边界。
recap:
  - route.lazy 延迟的是已匹配 route 的实现属性，不会动态改变 path、id、children 或 index。
  - 函数形状一次返回整个实现对象；属性对象为每个实现属性提供异步工厂。
  - 静态属性优先，lazy 同名返回值会被忽略并产生开发态 warning。
  - Router 会缓存已解析的 lazy 结果；导航在 lazy 和 loader 完成前不会提交新 location。
  - route.lazy 不是 React.lazy；前者由 Data Router 在导航前解析，后者在组件渲染时 suspend。
sources:
  - title: React Router Data Route Object
    url: https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/start/data/route-object.md
  - title: React Router Custom Data Mode
    url: https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/start/data/custom.md
  - title: React Router Lazy Route Modules Decision
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/decisions/0002-lazy-route-modules.md
  - title: React Router LazyRouteFunction Types
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts
  - title: React Router Lazy Route Loading Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts
  - title: React Router Lazy Route Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/router/lazy-test.ts
  - title: React Router useNavigation API
    url: https://reactrouter.com/8.3.0/api/hooks/useNavigation
  - title: React lazy API
    url: https://react.dev/reference/react/lazy
---

# Lazy 路由

## 一、学习目标

- 为 Data Mode route object 延迟加载组件、loader 或错误边界。
- 选择函数形状或属性对象形状，并知道两种形状的返回边界。
- 保持 path、id、index、children 等匹配信息静态可用。
- 在导航等待期间显示可理解的 pending 状态，并知道何时才提交新页面。
- 区分 `route.lazy` 与 `React.lazy`，避免把两个加载层混在一起。

## 二、为什么需要 Lazy 路由

路由树可以很大，但用户首次进入的页面通常只需要其中一小部分实现。如果把所有页面组件、loader 和错误
边界都直接写进初始 route object，初始 JavaScript 会包含暂时不会访问的代码。Data Mode 的 `lazy` 允许
Router 先知道如何匹配 URL，再在真正需要某条 route 时加载它的实现属性。

这和把组件渲染出来以后再请求数据不同。Router 会在导航提交前解析 lazy route，并与需要运行的 loader 一起
等待；页面不会先切换成一个没有数据的半成品。等待期间可以用 `useNavigation()` 呈现全局 pending UI。

## 三、核心概念

### 1. 函数形状一次返回 route 实现

最小写法是让静态 route 保留匹配字段，把实现属性放进异步函数：

```tsx
const routes = [
  {
    id: 'reports',
    path: 'reports',
    lazy: async () => {
      const module = await import('./reports-route')
      return {
        Component: module.ReportsPage,
        loader: module.reportsLoader,
        ErrorBoundary: module.ReportsErrorBoundary,
      }
    },
  },
]
```

返回对象使用命名的 route properties。模块不是 `React.lazy` 期待的 `{ default: Component }`，而是显式
提供 `Component`、`loader` 等 Router 能识别的字段。

### 2. 属性对象形状按属性延迟

8.3.0 也支持为每个实现属性提供异步工厂：

```tsx
const reportsRoute = {
  id: 'reports',
  path: 'reports',
  lazy: {
    Component: async () => (await import('./reports-component')).ReportsPage,
    loader: async () => (await import('./reports-loader')).reportsLoader,
  },
}
```

多个属性工厂可以并行解析。它适合组件、loader、action 或 `handle` 分属不同模块的场景；如果它们总是一起
发布，函数形状通常更容易阅读。

### 3. 匹配字段必须静态

`lazy` 负责实现属性，不负责改变 Router 已经用来匹配的 route tree。`path`、`id`、`index`、`children` 和
`caseSensitive` 需要在静态 route object 中存在；函数形状返回 `middleware` 也不属于可延迟字段。把这些
字段塞进 lazy 返回值不会动态增加子路由，类型和运行时都会拒绝或忽略它们。需要增量发现路由树时，是另一
个路由发现问题，不能用本课的 `route.lazy` 代替。

### 4. 静态属性优先

如果 route 已经静态配置了 `loader`、`action`、`Component` 或 `handle`，lazy 返回同名属性不会覆盖它。
Router 会保留静态值，并在开发态给出 warning。属性对象形状下，冲突属性的工厂也不会执行。

因此可以把轻量、必须立即存在的 loader 静态放置，把页面组件或错误边界延迟加载；这不是“后加载覆盖前面”的
配置合并。

### 5. pending、缓存与错误边界

lazy 工厂第一次执行时，Router 会缓存该 route 的 Promise。并发或重复导航会复用已开始的解析，不会为同一条
route 每次重新创建一份实现。只要 lazy 或 loader 尚未完成，导航状态仍可能是 `loading`；新 location 在提交前
不会取代当前页面。

lazy 工厂以及由它返回的 loader、action 抛错时，错误按 Data Router 的错误处理路径交给最近的 `ErrorBoundary`
或 `errorElement`。有新导航可以离开错误 location；错误边界中的重试策略应只重跑适合重试的 loader。

## 四、用法与示例

### 1. 用 `useNavigation` 呈现等待状态

```tsx
function PendingShell() {
  const navigation = useNavigation()
  const pending = navigation.state !== 'idle'

  return (
    <>
      {pending ? <p role="status">正在加载目标路由…</p> : null}
      <Outlet />
    </>
  )
}
```

`navigation.location` 是正在前往的目标，而当前 `useLocation()` 仍然是已提交页面。不要在 pending 状态
直接把目标当成已经完成的页面，也不要把等待中的 loader data 当成可用结果。

### 2. 用类型保留命名 route properties

```tsx
type ReportsRouteModule = {
  Component: React.ComponentType
  loader: LoaderFunction
}

const lazyReports = async (): Promise<ReportsRouteModule> => {
  const module = await import('./reports-route')
  return {
    Component: module.ReportsPage,
    loader: module.reportsLoader,
  }
}
```

如果一个模块只导出 `default` 组件，Router 不会自动把它当成 `Component`。显式命名导出可以让 route module
合同和 TypeScript 检查一起工作。

### 3. `route.lazy` 与 `React.lazy` 不是同一个层级

```tsx
// Router 级：导航前解析组件和 loader
const route = { path: 'reports', lazy: () => import('./reports-route') }

// React 级：首次渲染组件时 suspend，需要 Suspense
const ReportsPage = React.lazy(() => import('./ReportsPage'))
```

前一种需要返回 Router route properties；后一种需要模块 default export 和 `<Suspense>` fallback。若页面还
有 Data Router loader，组件级 `React.lazy` 不能替代 route.lazy 的数据加载边界。

## 五、用法示例或 Demo

:::demo{id="react.router.learn.intermediate.lazy-routes.lazy-routes-demo"}
Demo 从静态首页开始。“质量报告”用函数形状一次解析 Component 和 loader；“设置中心”保留静态 loader，
用属性对象形状并行解析 Component 与 ErrorBoundary。状态栏区分已提交 location 与 `loading/idle`，事件列表
记录提交前的 lazy 属性工厂和 loader 阶段；是否提交以 location 变化为准。返回首页再进入同一页面时，Router
复用已解析的 route 定义；“设置错误”会让静态 loader 抛错并由 lazy ErrorBoundary 接住。
:::

## 六、易错使用提示

:::pitfalls
### 错误：把 `route.lazy` 写成 React.lazy 组件

**触发条件：** 在 route object 中写 `Component: React.lazy(() => import('./Page'))`，并以为 loader 也会一起延迟。

**原因：** `React.lazy` 是组件渲染层机制，只认识 default export；`route.lazy` 是 Data Router 的 route property 加载机制。

**后果：** loader、ErrorBoundary 和导航 pending 不属于同一加载合同，组件还需要独立 Suspense 边界。

**错误示例：**

```tsx
{ path: 'reports', Component: React.lazy(() => import('./ReportsPage')) }
```

**正确写法：**

```tsx
{ path: 'reports', lazy: () => import('./reports-route') }
```

**验证方式：** 检查模块是否返回命名的 `Component`/`loader` route properties，并在导航未完成时观察 `useNavigation().state`。

### 错误：试图用 lazy 改 path 或 children

**触发条件：** 在 lazy 返回对象中添加 `path`、`id` 或 `children`。

**原因：** Router 必须先有稳定的匹配树和 route ID 才能找到要加载的 lazy route。

**后果：** 类型检查失败，绕过类型时字段被忽略并产生 warning；不会动态创建子路由。

**错误示例：**

```tsx
lazy: async () => ({ path: 'reports', children: [] })
```

**正确写法：**

```tsx
{ id: 'reports', path: 'reports', lazy: loadReportsRoute }
```

**验证方式：** 确认 path/id/children 都在静态 route object，lazy 只返回实现属性。

### 错误：期待 lazy 覆盖静态 loader

**触发条件：** 同一 route 同时写静态 loader 和 lazy loader，并把 lazy 版本当作最终实现。

**原因：** 静态属性优先；Router 会忽略冲突的 lazy 值。

**后果：** 运行的是静态 loader，调试时却以为加载了另一个数据源。

**错误示例：**

```tsx
{ loader: staticLoader, lazy: async () => ({ loader: lazyLoader }) }
```

**正确写法：**

```tsx
{ loader: staticLoader, lazy: async () => ({ Component: ReportsPage }) }
```

**验证方式：** 在两个 loader 中分别记录调用，确认静态 loader 执行且冲突 lazy loader 不应成为数据来源。

### 错误：把 pending location 当成已提交页面

**触发条件：** 导航开始就用 `navigation.location` 替换页面正文。

**原因：** Router 要等 lazy 和 loader 完成后才提交新 location。

**后果：** 用户看到目标 URL 与旧页面内容不一致，或读取尚未准备好的 loader data。

**错误示例：**

```tsx
const page = navigation.location?.pathname
return <article>{page}</article>
```

**正确写法：**

```tsx
const pending = navigation.state !== 'idle'
return <section aria-busy={pending}><Outlet /></section>
```

**验证方式：** 让 lazy 或 loader 延迟，确认 `useLocation().pathname` 在导航完成前保持不变。
:::

## 七、源码推导与适用场景

### 1. Router 先匹配再解析 lazy

**官方事实：** 固定版本的 Router 在导航数据策略中识别 `route.lazy`，加载 route properties 后再执行 handler；
不支持的匹配字段会被过滤，静态同名属性优先。

**课程推导：** 把 URL 结构和稳定 route ID 作为静态合同，把大块页面实现放到 lazy module，可在不改变导航语义的前提下降低首屏实现负担。

**边界：** 这不是动态 children 或 route discovery；若路由树本身需要增量加入，应使用对应的路由发现能力。

### 2. Router 缓存 lazy 结果

**官方事实：** 固定版本使用按 route 的 Promise cache，首次开始的 lazy 解析在并发和重复导航中复用。

**课程推导：** 不要把 lazy 工厂写成每次调用都必须重新初始化全局副作用的函数；模块初始化应尽量是可复用的 route 定义。

**边界：** 缓存的是 route 实现解析，不等于 loader data 永远不重新验证；数据是否重跑由 loader、导航和 revalidation 规则决定。

## 八、练习

:::exercise
### 练习目标

**要求：** 建立一个静态 `workspace` route 和一个 `reports` child。让 `reports` 保留静态 `path`/`id`，用函数形状
`lazy` 返回命名的 `Component` 与 `loader`，让 loader 延迟后返回报告数据。用 `useNavigation` 显示 pending，
并加入一个 route ErrorBoundary 处理 lazy module 或 loader 失败。

**验收：** 直接进入 reports 时 URL 在提交前仍保持当前页面；首次进入显示 pending，完成后显示 loader 数据；
返回首页再进入 reports，route module 不重复解析；把 `path` 放进 lazy 返回对象时，类型或运行时边界拒绝它；
切换到错误 route 后由最近 ErrorBoundary 呈现错误，再导航离开恢复正常页面。
:::

## 九、本节小结

- `route.lazy` 延迟 route 实现属性，静态 route tree 负责匹配。
- 函数形状一次返回实现对象，属性对象分别延迟属性；两者都使用命名 route properties。
- path、id、index、children 等匹配字段不能由 lazy 改写，静态属性优先。
- pending 期间 current location 保持已提交页面，Router 会缓存 lazy 解析结果。
- `route.lazy` 与 `React.lazy` 分属 Router 层和组件层，不能互相替代。

## 十、参考资料

- [Route Object](https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/start/data/route-object.md) - `lazy` 属性、匹配字段和实现属性边界。
- [Custom Data Mode](https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/start/data/custom.md) - 属性对象形状和命名 route properties。
- [Lazy Route Modules Decision](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/decisions/0002-lazy-route-modules.md) - lazy 的导航时机、代码分块取舍和 React.lazy 边界。
- [LazyRouteFunction Types](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts) - 可返回字段和不可 lazy 的匹配字段。
- [Lazy Route Loading Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts) - 静态优先、Promise 缓存和错误路径。
- [Lazy Route Tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/router/lazy-test.ts) - 并行解析、冲突、取消、错误和缓存行为。
- [useNavigation API](https://reactrouter.com/8.3.0/api/hooks/useNavigation) - 当前导航状态与 pending location。
- [React lazy API](https://react.dev/reference/react/lazy) - 组件级 lazy 与 Suspense 合同。
