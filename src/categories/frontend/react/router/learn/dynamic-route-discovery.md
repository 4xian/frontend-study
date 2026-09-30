---
id: react.router.learn.advanced.dynamic-route-discovery
type: lesson
title: 动态路由发现
summary: 用 patchRoutesOnNavigation 在导航时增量补充 Data Router 的路由树，并正确处理部分匹配、取消与缓存。
domain: frontend
technology: react
module: router
stage: advanced
level: advanced
estimatedMinutes: 60
prerequisites:
  - react.router.learn.intermediate.lazy-routes
  - react.router.learn.advanced.custom-data-strategy
related:
  - react.router.learn.basics.route-matching
  - react.router.learn.intermediate.lazy-routes
tags:
  - React Router
  - Data Mode
  - patchRoutesOnNavigation
  - 动态路由发现
  - Fog of War
  - 微前端
objectives:
  - 能判断什么时候需要在初始配置之外增量发现路由树。
  - 能使用 patchRoutesOnNavigation 读取目标路径和部分匹配，并用 patch 把路由加入 Data Router。
  - 能让多层异步发现按部分匹配继续推进，并处理取消与幂等缓存。
  - 能区分动态发现、route.lazy 和 Framework Mode 的服务端清单发现边界。
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-26
sources:
  - title: React Router createMemoryRouter API
    url: https://reactrouter.com/8.3.0/api/data-routers/createMemoryRouter
  - title: React Router PatchRoutesOnNavigationFunction 类型
    url: https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/lib/router/utils.ts
  - title: React Router Data Router 源码
    url: https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/lib/router/router.ts
  - title: React Router Lazy Route Discovery 测试
    url: https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/__tests__/router/lazy-discovery-test.ts
  - title: React Router 安装文档
    url: https://raw.githubusercontent.com/remix-run/react-router/react-router%408.3.0/docs/start/data/installation.md
---

# 动态路由发现

## 一、学习目标

- 判断什么时候需要在初始配置之外增量发现路由树。
- 使用 `patchRoutesOnNavigation` 读取目标路径和部分匹配，并用 `patch` 把子路由或根级路由加入 Data Router。
- 让多层异步发现按部分匹配继续推进，直到目标路径能够完整匹配。
- 使用 `signal` 响应被后续导航取消的发现工作，并用稳定键避免重复请求。
- 区分动态发现、`route.lazy` 和 Framework Mode 的服务端清单发现边界。

## 二、为什么需要动态路由发现

Data Router 通常会在创建时拿到完整的 route object。完整树可以让匹配和数据加载立即开始，但大型后台、微前端
或按租户加载的应用可能无法在首屏就知道所有路由定义。把所有定义打进初始 JavaScript 会增加启动成本，也会把
用户永远不会访问的区域带进来。

`route.lazy` 只延迟已经知道的路由实现，例如组件、loader 和 action；它不会增加新的 `path`、`children` 或
`index`。当连路由定义本身都需要在导航时取得时，`patchRoutesOnNavigation` 才是合适的 Data Mode 扩展点。
Router 先尝试匹配当前树，发现匹配不完整时调用回调；回调补丁完成后，Router 会用更新后的树再次匹配并继续导航。

## 三、核心概念

### 1. 回调合同

在创建 Data Router 时传入 `patchRoutesOnNavigation`：

```tsx
import { createBrowserRouter, type PatchRoutesOnNavigationFunction } from 'react-router'

const patchRoutesOnNavigation: PatchRoutesOnNavigationFunction = async ({
  signal,
  path,
  matches,
  fetcherKey,
  patch,
}) => {
  // 根据 path 和 matches 决定是否加载一段路由定义
  console.log({ signal, path, matches, fetcherKey })
  patch('app-root', [{ path: 'reports', Component: Reports }])
}

const router = createBrowserRouter(routes, { patchRoutesOnNavigation })
```

回调参数的职责如下：

- `path` 是本次要处理的 pathname；它不包含用于匹配的查询字符串。
- `matches` 是当前树能够得到的部分匹配，最后一项通常是最深的已知 route。
- `patch(routeId, children)` 把 `children` 追加到指定 route 的 `children`；传入 `null` 表示补充根级路由。
- `signal` 属于本次导航或 Fetcher 工作，应传给可取消的请求和等待操作。
- `fetcherKey` 在 Fetcher 调用中标识调用者，普通页面导航时为 `undefined`。

回调可以同步返回，也可以返回 Promise。它本身不返回路由数组，必须通过 `patch` 提交要加入的 route objects。

### 2. 部分匹配与分层补丁

初始树可以只保留应用壳：

```tsx
const routes = [
  {
    id: 'app-root',
    path: '/',
    Component: AppLayout,
  },
]

const router = createBrowserRouter(routes, {
  async patchRoutesOnNavigation({ path, matches, patch }) {
    if (path.startsWith('/workspace') && matches.at(-1)?.route.id === 'app-root') {
      const workspace = await loadWorkspaceRoute()
      patch('app-root', [workspace])
    }
  },
})
```

如果目标是 `/workspace/reports`，第一次补丁可以加入 `workspace`，但这还不足以匹配 `reports`。Router 会重新
计算部分匹配，再次调用回调；第二次回调可以依据最后一个匹配的 route 把 `reports` 作为 `workspace` 的子路由加入。
分层补丁比一次把整棵未知树塞入回调更容易控制加载边界。

要补充没有父级的路由，使用 `patch(null, children)`：

```tsx
patch(null, [{ path: '/status', Component: StatusPage }])
```

加入的 route object 仍然遵守普通路由的 `id`、`path`、`children`、loader 和组件规则。每个 ID 必须在整棵树中保持
唯一，不能把同一条路由反复加入不同父级。

### 3. 取消、提交与缓存

动态发现发生在导航流程中。GET 导航通常在 `loading` 阶段发现，非 GET 导航会在 `submitting` 阶段发现；补丁和
匹配完成后，Router 才会继续 loader、action 和页面提交。发现期间当前 location 仍是已经提交的页面。

把 `signal` 传给请求，并在补丁前检查取消状态：

```tsx
const discovered = new Set<string>()

async function discover({ path, signal, patch }: PatchRoutesOnNavigationFunctionArgs) {
  if (discovered.has(path)) return

  const response = await fetch(`/route-manifest?path=${encodeURIComponent(path)}`, { signal })
  const children = (await response.json()) as RouteObject[]
  if (signal.aborted) return

  patch('app-root', children)
  discovered.add(path)
}
```

后续导航中止正在运行的回调时，剩余的 `patch` 不会更新路由树。缓存键应根据后端清单的粒度选择：按完整 path
缓存适合路径独立的清单，按业务区段或父级 route ID 缓存可以避免同一片子树被不同 URL 重复请求。只有补丁成功后
才记录已发现状态，避免失败或取消造成永久假缓存。已经补入 route tree 的静态路径通常不再触发发现回调，但它的
loader 仍会按普通导航规则重新执行。

### 4. 与其他延迟机制的边界

`route.lazy` 要求 `path`、`id` 和 `children` 等匹配信息预先存在，延迟的是已经匹配 route 的实现属性。
`patchRoutesOnNavigation` 延迟的是 route tree 本身，适合不能预先提供完整定义的架构。Framework Mode 的
Lazy Route Discovery 则由框架管理服务端清单请求；它不是在 Data Mode 中手写 `patchRoutesOnNavigation` 的替代语法。

## 四、用法与示例

### 1. 按部分匹配把子路由放在定义附近

可以在已知父级的 `handle` 中保存加载子路由的函数，让发现逻辑不用重复维护 path 前缀：

```tsx
const routes = [
  {
    id: 'dashboard',
    path: '/dashboard',
    Component: DashboardLayout,
    handle: {
      lazyChildren: () => import('./dashboard-routes').then((module) => module.children),
    },
  },
]

const router = createBrowserRouter(routes, {
  async patchRoutesOnNavigation({ matches, patch }) {
    const leaf = matches.at(-1)?.route
    if (leaf?.handle?.lazyChildren) {
      patch(leaf.id ?? null, await leaf.handle.lazyChildren())
    }
  },
})
```

如果 `/dashboard` 本身已经完全匹配且没有未知子路径，Router 可能不会调用发现回调；需要让父级路径直接可访问
时，应把 index route 等关键定义静态放入父级，不能依赖只在更深路径才会触发的发现回调。

### 2. 处理动态参数的更高优先级候选

当已发现的 `:slug` 能匹配 `/blog/new` 时，仍可能存在尚未发现、但排名更高的静态 `new` route。Router 对含参数
或 splat 的匹配会再次调用发现回调来确认更优分支。回调应能够幂等执行，并在已知 path 或区段后快速返回；不要把
每次回调都当成一定需要网络请求。

### 3. 为 Fetcher 发现区分调用者

发现回调也可能服务于 Fetcher。可以依据 `fetcherKey` 为日志、缓存或权限上下文区分调用来源，但不要把它当成
页面 location 的替代品：

```tsx
async function discoverForNavigation({ fetcherKey, path, patch }: PatchRoutesOnNavigationFunctionArgs) {
  const scope = fetcherKey ? `fetcher:${fetcherKey}` : 'navigation'
  const children = await loadRoutes(path)
  patch('app-root', children)
  console.info(`${scope} discovered ${path}`)
}
```

## 五、用法示例或 Demo

:::demo{id="react.router.learn.advanced.dynamic-route-discovery.dynamic-route-discovery-demo"}
Demo 从静态首页开始，只把应用壳和首页放入初始 route tree。点击工作区链接后，观察台先记录根级发现，再记录
`workspace` 子路由和页面 loader；导航完成后，地址和已提交页面才会变化。进入慢速页面后立即返回首页，可以看到
`AbortSignal` 取消发现且未提交补丁。再次进入已经发现的页面时，route tree 不会重复补丁，但页面 loader 仍会按导航
重新执行。
:::

## 六、易错使用提示

:::pitfalls
### 错误：用 `route.lazy` 代替动态路由发现

**触发条件：** 初始 route object 没有目标 `path`，却只在它上面配置 `lazy`。

**原因：** `route.lazy` 只能补充已知 route 的实现属性，不能改变 `path`、`children` 或 `index`。

**后果：** Router 仍然无法匹配目标 URL，页面不会因为 lazy 函数存在而自动出现。

**错误示例：**

```tsx
{ path: 'reports', lazy: () => import('./reports-route') }
```

**正确写法：**

```tsx
patch('app-root', [{ path: 'reports', lazy: () => import('./reports-route') }])
```

**验证方式：** 在导航前检查 route tree 是否已有 `reports` 定义；没有时先通过 `patch` 加入它。

### 错误：忽略 `matches`，每次都从根级重复补丁

**触发条件：** 多层发现只根据 URL 前缀判断，并始终调用 `patch(null, ...)` 或 `patch('app-root', ...)`。

**原因：** Router 会在补丁后重新匹配并再次调用回调，部分匹配已经提供了当前发现深度。

**后果：** 同一子树被重复加入，出现重复 ID、无效请求或越来越大的 route tree。

**错误示例：**

```tsx
async patchRoutesOnNavigation({ path, patch }) {
  if (path.startsWith('/workspace')) patch('app-root', await loadWorkspace())
}
```

**正确写法：**

```tsx
async patchRoutesOnNavigation({ path, matches, patch }) {
  const leafId = matches.at(-1)?.route.id
  if (path.startsWith('/workspace') && leafId === 'app-root') {
    patch('app-root', await loadWorkspace())
  }
}
```

**验证方式：** 记录每次回调的最后一个匹配 ID，确认每一层只向当前叶子 route 添加一次子路由。

### 错误：发现请求没有使用 `signal`

**触发条件：** 回调中启动 `fetch` 或长时间等待，但没有传入 Router 提供的 `AbortSignal`。

**原因：** 后续导航无法取消脱离当前目标的工作，异步完成后还可能触发无意义的副作用。

**后果：** 浪费请求和解析资源，事件日志会混入已经离开的目标，错误处理也更难判断。

**错误示例：**

```tsx
const response = await fetch(`/routes?path=${path}`)
```

**正确写法：**

```tsx
const response = await fetch(`/routes?path=${encodeURIComponent(path)}`, { signal })
if (signal.aborted) return
```

**验证方式：** 在请求完成前导航到另一个页面，确认请求收到 abort，且被取消的回调没有调用 `patch`。

### 错误：在补丁前写入成功缓存

**触发条件：** 请求一开始就把 path 加入 `discovered` 集合。

**原因：** 网络失败或导航取消时，路由树并没有获得对应定义，但缓存已经阻止下一次尝试。

**后果：** 用户重复访问时直接跳过发现，目标页面持续显示 404 或部分匹配状态。

**错误示例：**

```tsx
discovered.add(path)
const children = await loadRoutes(path)
patch('app-root', children)
```

**正确写法：**

```tsx
const children = await loadRoutes(path)
if (signal.aborted) return
patch('app-root', children)
discovered.add(path)
```

**验证方式：** 让第一次发现被取消，再次访问相同 URL，确认回调仍会执行并成功补丁。

### 错误：把动态参数当成一次性匹配

**触发条件：** 已经有 `:slug` 路由后，认为所有同级 URL 都不需要再次发现。

**原因：** 未发现的静态 route 可能比参数 route 排名更高，Router 需要再次确认最佳分支。

**后果：** `/new` 等静态页面可能被错误地渲染成参数页面。

**错误示例：**

```tsx
if (discovered.has('/blog')) return
```

**正确写法：**

```tsx
if (discovered.has(path) && !path.includes('/new')) return
```

**验证方式：** 先访问一个 slug，再访问同级静态路径，检查最终匹配 route ID 是否是静态 route。
:::

## 七、源码推导与适用场景

1. **官方事实：** React Router 8.3.0 的 `PatchRoutesOnNavigationFunctionArgs` 明确定义了 `signal`、`path`、`matches`、`fetcherKey` 和 `patch`；`patch` 在 signal 已取消时不会更新路由树。Router 源码会在发现后重新匹配，必要时继续调用回调，直到获得完整匹配或确认无法继续。
2. **官方事实：** 官方测试覆盖了 GET 与 POST 导航、多层子路由发现，以及已有参数或 splat 路由时的再次发现。
3. **课程推导：** 动态发现的稳定边界是“请求清单、补丁路由、再匹配”，而不是让组件自行读取 URL 后决定渲染哪个页面。这样 loader、action、错误边界和导航状态仍由 Data Router 管理。
4. **适用场景：** 微前端、按租户加载的功能区、插件式后台和规模很大的路由树可以考虑该 API；普通中小型应用通常应保持完整静态定义，或只使用 `route.lazy`，避免把匹配逻辑和缓存策略引入运行时。
5. **边界条件：** 动态发现不能绕过服务端对深链的处理，也不能替代权限校验。补丁接口返回的 route object 必须来自可信来源，并继续遵守 loader、action 和错误边界的安全合同。

## 八、练习

:::exercise
### 练习目标

**要求：** 为一个只包含应用壳的 Data Router 增加 `/reports/:reportId` 动态发现。第一次进入
`/reports/2026` 时，先补充 `reports` 父级，再补充带 `:reportId` 的子路由；让发现请求接收 `signal`，取消后
不调用 `patch`；记录成功补丁后的缓存键，并解释为什么不能在请求开始时写缓存；再增加一个静态
`/reports/new`，验证它不会被 `:reportId` 路由遮蔽。

**验收：** `/reports/2026` 的两层 route object 都由发现回调加入，取消导航不会留下补丁；第二次访问复用成功
缓存；访问 `/reports/new` 时最终匹配静态 route，而不是参数 route。
:::

## 九、本节小结

- route tree 不完整时，用 `patchRoutesOnNavigation` 在导航过程中增量补充定义。
- 用 `matches` 选择补丁父级，用 `patch(null, children)` 添加根级路由。
- 所有异步发现都应使用 `signal`，成功补丁后再写入幂等缓存。
- 含参数或 splat 的匹配可能触发再次发现，回调必须可重复执行。
- `route.lazy` 延迟实现，动态发现延迟定义；二者解决不同层次的问题。

## 十、参考资料

- [createMemoryRouter API](https://reactrouter.com/8.3.0/api/data-routers/createMemoryRouter) - 说明 Data Router 选项中的 `patchRoutesOnNavigation`。
- [PatchRoutesOnNavigationFunction 类型](https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/lib/router/utils.ts) - 定义回调参数和 `patch` 签名。
- [Router 源码](https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/lib/router/router.ts) - 展示发现、取消和重新匹配流程。
- [Lazy Route Discovery 测试](https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/__tests__/router/lazy-discovery-test.ts) - 覆盖多层、GET、POST 和参数路由场景。
- [Data Router 安装文档](https://raw.githubusercontent.com/remix-run/react-router/react-router%408.3.0/docs/start/data/installation.md) - 说明可以通过 `patchRoutesOnNavigation` 程序化添加路由。
