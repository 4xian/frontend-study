---
id: vue.router.learn.intermediate.lazy-loading
type: lesson
title: 路由懒加载
summary: 用真实动态 import 观察路由加载、导航提交与解析结果复用
domain: frontend
technology: vue
module: router
related:
  - vue.router.learn.intermediate.meta-navigation-guards
  - vue.router.learn.intermediate.route-data-fetching
tags:
  - Vue Router
  - lazy loading
  - dynamic import
  - code splitting
  - Vite
appliesTo: Vue 3.5.40、Vue Router 5.2.0、Vite 8.1.5
verifiedAt: 2026-08-04
sources:
  - title: Vue Router：Lazy Loading Routes
    url: https://router.vuejs.org/guide/advanced/lazy-loading
  - title: Vue Router：Full Navigation Resolution Flow
    url: https://router.vuejs.org/guide/advanced/navigation-guards#the-full-navigation-resolution-flow
  - title: Vue Router API：loadRouteLocation
    url: https://router.vuejs.org/api/functions/loadroutelocation
  - title: Vue：defineAsyncComponent
    url: https://vuejs.org/api/general.html#defineasynccomponent
  - title: Vite：Dynamic Import
    url: https://vite.dev/guide/features.html#dynamic-import
  - title: Vue Router 5.2.0 navigationGuards.ts
    url: https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/navigationGuards.ts
stage: intermediate
level: intermediate
estimatedMinutes: 65
prerequisites:
  - vue.router.learn.intermediate.meta-navigation-guards
  - vue.router.learn.intermediate.route-data-fetching
objectives:
  - 把路由组件改为返回动态 import Promise 的函数
  - 区分 loader 调用、import 解析与导航提交三个时刻
  - 说明路由懒加载与 defineAsyncComponent 的责任边界
  - 解释首次成功解析后的 route record component 复用
  - 把 Router 运行时解析与 Vite 生产分块策略分开
recap:
  - 路由懒加载依赖函数包裹的真实动态 import。
  - Router 在导航确认前解析 route component 并提取 component guard。
  - 首次成功解析后，5.2.0 复用 record 上的解析组件。
  - defineAsyncComponent 属于 Vue 渲染层，不用来包 route component。
  - Vite 分块策略与 Router 运行时解析是不同责任层。
---

# 路由懒加载

## 一、让 import 发生在首次进入路由时

路由懒加载的公开契约是把 route record 的 component 写成返回 Promise 的函数。外层函数保留了调用时机；Router 只在进入该 record 时调用 loader，并等到组件解析后才继续确认导航。

~~~~ts
const routes = [
  {
    path: '/reports',
    component: () => import('./ReportsRoute.vue'),
  },
]
~~~~

| 时刻 | 可观察事实 | 尚未发生 |
| --- | --- | --- |
| loader call | Router 已进入组件解析阶段 | 动态 import 未必执行 |
| import resolved | 已获得 route component | 导航未必已提交 |
| navigation commit | currentRoute 与 RouterView 已切换 | 不能推断网络缓存 |

## 二、路由组件不要再包 defineAsyncComponent

`() =&gt; import()` 的所有者是 Router：它在导航确认前解析页面并提取 component guard。`defineAsyncComponent()` 的所有者是 Vue renderer：它在组件真正渲染时加载，适合页面内部的昂贵子组件。两者解决的不是同一层问题。

~~~~ts
// route record：交给 Router 在导航中解析
component: () => import('./ReportsRoute.vue')

// ReportsRoute 内部：只在需要渲染图表时加载
const LazyChart = defineAsyncComponent(() => import('./ReportChart.vue'))
~~~~

## 三、观察首次等待与再次进入复用

下面的 mini-app 用独立 memory router 运行。手动 gate 只把“Router 已调用 loader，动态 import 尚未执行”稳定展示出来；放行后执行真实字面量 import。离开再进入时，loader、import 和 resolved 计数都应保持为 1。

:::demo{id="vue.router.learn.intermediate.lazy-loading.lazy-loading-lab-demo" playground="true"}
用受控 gate 观察真实动态 import 与 Router 解析结果复用
:::

## 四、易错使用提示

:::pitfalls
### 在建立 routes 时就调用 import

**触发条件：** 在建立 routes 时就调用 import

**原因：** `component` 需要保存 loader 函数，不是已经开始的 Promise。

**后果：** 尚未导航就开始加载，且 route record 形状错误。

**错误示例：**

~~~~ts
component: import('./ReportsRoute.vue')
~~~~

**正确写法：**

~~~~ts
component: () => import('./ReportsRoute.vue')
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 Promise.resolve 伪装 code splitting

**触发条件：** 用 Promise.resolve 伪装 code splitting

**原因：** 静态 import 已把 component 带入当前模块图。

**后果：** Router 会等 Promise，但不存在真实动态 split point。

**错误示例：**

~~~~ts
import Page from './Page.vue'
component: () => Promise.resolve(Page)
~~~~

**正确写法：**

~~~~ts
component: () => import('./Page.vue')
~~~~

**验证方式：** 对照正确写法验证结果。

### 为 route component 包 defineAsyncComponent

**触发条件：** 为 route component 包 defineAsyncComponent

**原因：** 该 API 属于 Vue 渲染层，不是 Router 的懒路由契约。

**后果：** 底层页面 guard 离开正常的 route lazy extraction 时序。

**错误示例：**

~~~~ts
component: defineAsyncComponent(() => import('./Page.vue'))
~~~~

**正确写法：**

~~~~ts
component: () => import('./Page.vue')
~~~~

**验证方式：** 对照正确写法验证结果。

### 预期每次进入都重新调用 loader

**触发条件：** 预期每次进入都重新调用 loader

**原因：** 5.2.0 在成功后把解析组件写回 record。

**后果：** 再次进入时等待第二个 gate，测试永远不会结束。

**错误示例：**

~~~~ts
expect(loader).toHaveBeenCalledTimes(2)
~~~~

**正确写法：**

~~~~ts
expect(loader).toHaveBeenCalledTimes(1)
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 Router 复用等同于 HTTP 缓存

**触发条件：** 把 Router 复用等同于 HTTP 缓存

**原因：** 这里只能证明 record 上的解析结果被复用。

**后果：** 用不稳定的 network 次数推翻正确 Router 行为。

**错误示例：**

~~~~ts
// loader 一次 = CDN 必然命中缓存
~~~~

**正确写法：**

~~~~ts
// 只断言 loader call 与 currentRoute
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 importing 当成导航已提交

**触发条件：** 把 importing 当成导航已提交

**原因：** Router 会在确认导航前等待 route component。

**后果：** 界面显示目标页，currentRoute 却仍是旧页。

**错误示例：**

~~~~ts
loaderStarted.value && showAsCommitted()
~~~~

**正确写法：**

~~~~ts
await router.push('/report')
~~~~

**验证方式：** 对照正确写法验证结果。

### 忽略 lazy component 的 beforeRouteEnter 提取

**触发条件：** 忽略 lazy component 的 beforeRouteEnter 提取

**原因：** Router 必须先拿到 component options 才能继续 guard 队列。

**后果：** 把懒加载误讲成 RouterView 渲染阶段的工作。

**错误示例：**

~~~~ts
// RouterView 渲染后才解析页面 guard
~~~~

**正确写法：**

~~~~ts
// 进入 guard extraction 时解析 component
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 loadRouteLocation 当成导航

**触发条件：** 把 loadRouteLocation 当成导航

**原因：** 它只确保 resolved route 的懒组件已加载。

**后果：** 没有 history、currentRoute 或 guard 变化，却声称已进入页面。

**错误示例：**

~~~~ts
await loadRouteLocation(router.resolve('/report'))
~~~~

**正确写法：**

~~~~ts
await router.push('/report')
~~~~

**验证方式：** 对照正确写法验证结果。

### 直接复制旧 manualChunks 对象配置

**触发条件：** 直接复制旧 manualChunks 对象配置

**原因：** 当前 Router 指南片段与本仓 Vite 8.1.5 的分块 API 已漂移。

**后果：** 无法生效的构建配置被误当作 Router API。

**错误示例：**

~~~~ts
build: { rollupOptions: { output: { manualChunks: {} } } }
~~~~

**正确写法：**

~~~~ts
// 单独按 Vite 8 codeSplitting 文档评估
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 五、从源码推导适用场景

:::steps
### 1. loader 位于进入组件 guard extraction

`router.ts` 先运行 leave、beforeEach、update 和 beforeEnter，再为 entering records 提取 beforeRouteEnter。lazy loader 在这里调用，所以前置 guard 取消时可以根本不加载页面。

### 2. 解析组件后才能读取组件守卫

`navigationGuards.ts` 等待 loader Promise，解出 ESM default，再读取 component guard。因此路由懒加载必须参与导航确认，而不是普通渲染占位。

### 3. 成功复用来自 record component 写回

成功分支把原始 module 写入 `record.mods[name]`，把解析 component 写入 `record.components[name]`。再次进入会直接读 component，所以 loader call count 是稳定的最小证据。

### 4. reject 不会写入成功复用

写回只发生在 Promise fulfill 分支。加载失败时目标导航不提交，后续导航可以重试；但失败重试不与首次成功复用 Demo 混成两套 seam。

### 5. loadRouteLocation 只是显式预加载

它遍历 matched records，使用同类解析与写回逻辑，但不运行导航守卫、不改 history 也不提交 currentRoute。可以在用户意图明确时预加载，不能替代 push。

### 6. functional component 需要 displayName 消除歧义

functional component 和 lazy loader 都可能是函数。官方契约用 `displayName` 标识 functional route component，避免它被当作 loader 调用。
:::

:::exercise
### 判断报表页的懒加载边界

**要求：** 报表页自身较大，页内又有一个只在展开后显示的图表。写出两层加载方式，并说明谁控制时机。

**验收：** 完成题目要求。

**参考答案：** route record 用 `component: () =&gt; import('./ReportsRoute.vue')`，由 Router 在首次进入时解析；ReportsRoute 内部的图表可用 `defineAsyncComponent(() =&gt; import('./Chart.vue'))`，由 Vue 在它真正被渲染时加载。
:::

- [ ] route component 保留返回 import Promise 的外层函数
- [ ] 分别观察 loader、import resolved 与 navigation commit
- [ ] 不为 route component 再包 defineAsyncComponent
- [ ] 用 loader call count 证明成功解析后的 Router 复用
- [ ] 不把 Router 复用扩写为 HTTP 或 CDN 缓存承诺
- [ ] 构建分块配置单独按当前 Vite 版本核对
