# Vue Router R1-B10：路由懒加载调研

> 核验日期：2026-08-04
>
> 适用版本：Vue 3.5.40、Vue Router 5.2.0、Vite 8.1.5。
>
> 资料范围：Vue Router 官方 Guide/API、`vuejs/router` 的 `v5.2.0` 固定标签源码与
> 同标签官方测试；仅为区分 Vue async component 与 Vite 8 分块边界补充 Vue/Vite 官方资料。
> 外部资料通过 Tavily Search / Extract 定位并回到上述一手来源核验。

## 课程定位与冻结边界

本课 Manifest 为 `vue.router.learn.intermediate.lazy-loading`，直接前置是 L08
`vue.router.learn.intermediate.meta-navigation-guards` 与 L09
`vue.router.learn.intermediate.route-data-fetching`。L08 已建立完整导航守卫顺序，L09 已区分
导航提交前后的异步工作；B10 只把 route component 的动态加载放回这个导航生命周期中，观察
**loader 何时调用、导航何时提交、解析结果何时复用**。

课程主线冻结为 Vue Router 5.2.0 的稳定 route component contract：

- route record 使用 `component: () => import('./LazyReportRoute.vue')`，不使用静态导入伪装
  route-level code splitting。
- Demo 使用独立 mini-app、独立 `createMemoryHistory()` 与真实字面量 `import()`，不改宿主 URL。
- route component 本身不包 `defineAsyncComponent()`；该 API 只可作为 route component 内部子组件
  的延迟渲染选读。
- 只验证 loader 调用、Promise 解析、导航提交和 Router 已解析组件复用；不验证 chunk 文件名、
  hash、字节数、请求次数或耗时。
- 不修改 Vite 配置，不构建 `dist/`，不把官网当前的旧 `manualChunks` 示例抄入本仓库配置。
- 不引入 preload/prefetch 插件、Service Worker、SSR、Suspense 或 experimental Data Loaders。

B09 的 stop boundary 要求其单独验收完成后才能实施 B10。本研究只冻结 B10 后续实现 contract，
不把研究文档本身写成 B09 已完成或 B10 已实施的证据。

依据：[Lazy Loading Routes](https://router.vuejs.org/guide/advanced/lazy-loading)、
[Full Navigation Resolution Flow](https://router.vuejs.org/guide/advanced/navigation-guards#the-full-navigation-resolution-flow)、
[Vue `defineAsyncComponent()`](https://vuejs.org/api/general.html#defineasynccomponent)。

## 教学目标

完成本课后，学习者应能：

1. 把静态 route component 改为返回 Promise 的函数，并说明为什么外层函数让 `import()` 延迟到
   Router 进入该 route record 时调用。
2. 预测首次进入 lazy route 的时序：前置 guard 先运行，Router 调用 loader 并等待解析，解析出的
   component guard 再运行，最后才提交 `currentRoute`。
3. 区分三个事实：loader 函数被调用、动态 import Promise 已解析、目标导航已经提交；三者不能
   合并成一个模糊的“页面加载完成”。
4. 说明 Vue Router 5.2.0 的复用机制是成功解析后把 route record 中的 lazy function 替换为已解析
   component；离开再进入时不再调用同一 record 的 loader。
5. 区分 route lazy component 与 `defineAsyncComponent()`：前者属于 Router 导航解析，后者是 Vue
   在组件被渲染时加载的组件包装器。
6. 把 route-level dynamic import、Router 运行时解析与 Vite 生产分块配置分成不同责任层，不根据
   开发环境或文件名猜测生产 chunk 形态。

## 先修知识

### 课程内先修

- L08：global guard、per-route `beforeEnter`、in-component guard 与完整导航解析顺序。
- L09：Promise 会阻塞导航提交或页面状态的条件，以及“异步开始”和“导航完成”不是同一事件。
- L03-L04、L07：route record、nested routes、named views 与 `component` / `components` 配置。

### Vue 与 JavaScript 先修

- 知道 `import('./module')` 返回 Promise，静态 `import X from './module'` 会随当前模块求值。
- 知道 SFC 通常通过 ESM default export 暴露 component，但无需学习 bundler 生成文件细节。
- 能读懂 `async` / `await`、Promise fulfill/reject 与最小 deferred gate。

本课不重讲 JavaScript 模块系统，也不把浏览器 HTTP cache、Service Worker cache 或 CDN cache
并入“Router cache”概念。

## 核心结论

Vue Router 的 lazy route component 是 route record 上的**函数**。Router 进入新 record 的
`beforeRouteEnter` guard extraction 阶段时调用该函数，等待 Promise 得到 component，再从解析出的
component 提取 `beforeRouteEnter`，随后才进入 global `beforeResolve` 和导航确认。首次加载成功后，
5.2.0 会把 record 的 lazy function 替换成解析后的 component，所以同一 record 再次进入不会再次
调用原 loader。

`import()` 是否产生独立 chunk、多个模块是否合并、chunk 如何命名，是 Vite 的构建责任。Router
只消费“返回 Promise<Component> 的函数”，不拥有生产 chunk 策略。

依据：[Lazy Loading Routes](https://router.vuejs.org/guide/advanced/lazy-loading)、
[`navigationGuards.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/navigationGuards.ts)、
[`lazyLoading.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/lazyLoading.spec.ts)。

## Route lazy component 与 Vue async component

### Route lazy component

```ts
// Router 在首次进入该 route record 时调用这个函数。
const loadLazyReportRoute = () => import('./LazyReportRoute.vue')

const routes = [{ path: '/report', component: loadLazyReportRoute }]
```

它的所有者是 Vue Router：

- 调用点位于导航 guard extraction，而不是 `RouterView` 已经渲染之后。
- Promise 未完成时，首次目标导航尚未确认，旧 `currentRoute` 保持不变。
- Promise 完成后，Router 先保存原始 module 与解析后的 component，再提取 component guard。
- 成功解析的 component 被写回 route record，后续进入复用该 component。

### `defineAsyncComponent()`

```ts
// 这是普通视图内部的异步子组件，不是 route record 的推荐写法。
const LazyChart = defineAsyncComponent(() => import('./LazyChart.vue'))
```

它的所有者是 Vue renderer：Vue 官方 API 将它定义为“只在被渲染时才加载”的 component，并提供
`loadingComponent`、`errorComponent`、`delay`、`timeout`、`suspensible` 与重试回调等渲染层选项。
这些能力解决的是组件占位、错误视图与 Suspense 协作，不是 Router 的导航确认和 route guard
提取。

Vue Router 官方明确要求不要把 async component 用作 route component。5.2.0
`extractComponentsGuards()` 在开发模式识别到 `__asyncLoader` 时也会给出诊断；该包装器被当作已
定义 component，而不是 Router 应调用并等待的 lazy route function。其底层页面 component 的
`beforeRouteEnter` 因此不再处于正常的 route lazy guard extraction seam。

正确边界是：

- route record：`() => import('./RoutePage.vue')`；
- RoutePage 内的昂贵子区域：必要时再用 `defineAsyncComponent()`；
- B10 Demo 只验证第一层，不把两种机制叠在一起。

依据：[Lazy Loading Routes: Relationship to async components](https://router.vuejs.org/guide/advanced/lazy-loading#relationship-to-async-components)、
[Vue `defineAsyncComponent()`](https://vuejs.org/api/general.html#defineasynccomponent)、
[`navigationGuards.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/navigationGuards.ts)。

## 动态 import 的调用与 Router 复用

### 外层函数决定调用时机

```ts
// 错误：route 表建立时已经调用 import()，值还是 Promise 而不是 loader function。
const eagerPromiseRoute = {
  path: '/report',
  component: import('./LazyReportRoute.vue'),
}

// 正确：先保存函数，Router 进入 record 时才调用 import()。
const lazyRoute = {
  path: '/report',
  component: () => import('./LazyReportRoute.vue'),
}
```

5.2.0 开发构建对直接传 Promise 的旧式写法有诊断并做兼容包装，但兼容不能恢复已经发生的
`import()` 调用，也不能把错误形状变成推荐 public contract。

### 成功后的复用层

`extractComponentsGuards()` 对 lazy function 的成功路径执行三件事：

1. 调用 loader 并持有返回的 Promise；
2. 若结果是 ESM module，则读取 default export 作为 route component，同时把原始 module 写入
   `record.mods[name]`；
3. 把解析后的 component 写回 `record.components[name]`。

下次进入同一 record 时，guard extraction 看到的是 component，而不是原 loader function，因此
不再调用 loader。固定标签测试在“进入 `/foo` -> 离开 -> 再进入 `/foo`”后断言 loader 只调用一次，
并另外确认 alias 与 nested alias 共享同一 record cache。

这里的“缓存”必须精确表述为 **Router 对已解析 route component 的复用**：

- 不是 B10 对浏览器 HTTP cache 命中次数的承诺；
- 不是对 Vite 开发服务器模块图或生产 CDN cache 的测量；
- 不是对尚未 fulfill 的多个并发 loader 调用提供公开的请求去重契约；
- 不是失败结果缓存。源码只在 Promise 成功解析后替换 record，reject 后后续导航仍可能重试。

### 仅返回已导入 component 不等于 code splitting

```ts
import ReportRoute from './LazyReportRoute.vue'

// Router 仍会等待 Promise，但 component 已经进入当前静态模块图。
const notCodeSplit = () => Promise.resolve(ReportRoute)
```

Vue Router 接受任何返回 Promise<Component> 的函数，但 route-level code splitting 需要真实动态
`import()` split point。B10 的核心验收必须观察真实 `import()` 调用，不能只用
`Promise.resolve()` 模拟。

依据：[Lazy Loading Routes](https://router.vuejs.org/guide/advanced/lazy-loading)、
[`navigationGuards.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/navigationGuards.ts)、
[`lazyLoading.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/lazyLoading.spec.ts)。

## 唯一独立 memory-router Demo seam

Demo 冻结为一个“报表路由惰性解析实验台”。它只有 eager 首页 `/` 和 lazy 报表页 `/report`，
使用独立 mini-app 与独立 `createMemoryHistory()`；不复用站点 router，不提供第二套业务场景。

### 可控 loader

真实 loader 外围增加一个只在第一次调用时创建的手动 deferred gate：

```ts
// 记录 loader 调用，并在学习者放行后才真正调用动态 import。
const loadLazyReportRoute = () => {
  loaderCalls.value += 1
  loaderPhase.value = 'waiting-release'

  return importGate.promise
    .then(() => {
      importCalls.value += 1
      loaderPhase.value = 'importing'
      eventLog.value.push('import call #1')
      return import('./LazyReportRoute.vue')
    })
    .then((module) => {
      resolvedCalls.value += 1
      loaderPhase.value = 'resolved'
      eventLog.value.push('import resolved #1')
      return module
    })
}
```

这不是网络模拟器。gate 只让“Router 已调用 loader、但 `import()` 尚未调用”的状态稳定可见；
点击“允许 import”后才执行真实字面量 `import()`。`importing` 可能只持续一个微任务窗口，因此验收
读取永久事件日志和计数，不要求自动化在瞬时 DOM 状态上抢时序。

### 固定交互路径

1. 初始导航完成于 `/`；计数全部为 0。
2. 点击“进入报表页”，以非阻塞方式保存 `router.push('/report')` 的 Promise。
3. Router 调用 loader；界面显示 navigation pending、target `/report`、loader call 1、import call 0，
   而 `router.currentRoute` 仍是 `/`。
4. 点击“允许 import”；gate fulfill，真实 `import()` 被调用并解析，导航随后提交 `/report`。
5. 点击“返回首页”，导航回 `/`。
6. 再次点击“进入报表页”；导航提交 `/report`，loader/import/resolved 三个计数仍为 1，也没有新的
   gate 可操作。

不提供“清空 Router cache”按钮。若要重新观察 cold path，应重建整个独立 mini-app/router；直接
篡改 normalized record 的内部 `components` 不属于公共 API，也会污染教学结论。

## 必须可观察的状态

| 状态 | 页面上必须能回答的问题 |
| --- | --- |
| `currentRoute.fullPath` | 当前已提交的是首页还是报表页？ |
| target route | 当前 pending navigation 想去哪里？ |
| navigation state | idle、pending、committed 还是 failed？ |
| loader phase | idle、waiting-release、importing、resolved 还是 reused？ |
| loader calls | Router 调过 route loader 几次？ |
| import calls | 字面量 `import()` 表达式实际执行过几次？ |
| resolved calls | loader Promise 成功解析过几次？ |
| gate state | 首次 cold load 是否仍等待学习者放行？ |
| lazy view marker | 解析并提交后，真实 lazy route component 是否已渲染？ |
| event log | navigation start、loader call、import call、resolve、commit、revisit 的顺序是什么？ |

固定事件日志应使用无时间戳的确定性文本：

```text
navigation start /report
loader call #1
gate waiting
import call #1
import resolved #1
navigation commit /report
navigation commit /
navigation start /report (revisit)
navigation commit /report (loader unchanged)
```

不要显示“下载耗时”“chunk 名称”或浏览器 network request 数；这些值不属于 memory-router seam
能够稳定证明的状态。

## 最少验收断言

后续实现只需要四组关键行为断言：

1. 初始 `/` 已提交且 lazy view 不存在时，loader/import/resolved 计数均为 0。
2. 首次点击 `/report` 且 gate 未放行时，navigation 为 pending、target 为 `/report`、当前路由仍为
   `/`，loader 为 1 而 import/resolved 为 0。
3. 放行 gate 后，事件顺序包含 `loader call -> import call -> import resolved -> navigation commit`，
   当前路由为 `/report`、lazy view 可见，三个计数均为 1。
4. 返回 `/` 再进入 `/report` 后，报表页再次可见，但 loader/import/resolved 仍全部为 1，且没有
   第二个可操作 gate。

这四组断言已覆盖“首次调用、首次解析、导航等待、再次进入复用”。不为 chunk hash、请求 timing、
浏览器 cache、失败重试或内部 record 字段增加 E2E 断言。

## Vue Router 5.2.0 源码推导

### 1. Lazy loader 位于进入组件 guard extraction

`router.ts` 先运行 leaving guards、global `beforeEach`、update guards 与 per-route `beforeEnter`，
之后才对 entering records 调用 `extractComponentsGuards(..., 'beforeRouteEnter')`；再往后才是 global
`beforeResolve` 和导航确认。

`extractComponentsGuards()` 在构建 guard queue 时已经调用 lazy function，让 chunk request 尽早
开始；queue 中的 Promise guard 再等待该结果并提取解析 component 的 `beforeRouteEnter`。

**课程推导：** 首次 lazy Promise pending 时 `router.push()` 未结算，`currentRoute` 未提交；
`beforeEach` / `beforeEnter` 若先取消导航，loader 甚至不会调用。固定标签测试分别验证了 pending
导航、`beforeEnter` 取消和 `beforeEach` 取消三种情况。

来源：[`router.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts)、
[`navigationGuards.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/navigationGuards.ts)、
[`lazyLoading.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/lazyLoading.spec.ts)。

### 2. 解析完成后才提取 component guard

lazy Promise fulfill 后，源码先得到 ESM default/component，再读取其 `__vccOpts` 或 component
options 中对应的 guard。固定测试确认 lazy component 的 `beforeRouteEnter` 会在 loader 完成后运行，
而加载完成并挂载后的 `beforeRouteLeave` / `beforeRouteUpdate` 也能进入后续导航队列。

**课程推导：** route lazy loading 不能描述为 RouterView 自己在渲染阶段才拉取页面；Router 必须先
解析 component，才能维持 in-component navigation guard 的正常时序。

来源：[`navigationGuards.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/navigationGuards.ts)、
[`lazyLoading.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/lazyLoading.spec.ts)。

### 3. 缓存是 route record 的成功后替换

成功分支把原始 module 写入 `record.mods[name]`，并把 `record.components[name]` 从 loader function
改为解析后的 component。后续 guard extraction 走“已是 route component”的分支，不再调用 lazy
function。

**课程推导：** Demo 的 loader call count 是最小、真实、稳定的复用证据。无需读取内部 record，
也不能把这个机制扩写为浏览器网络缓存承诺。

来源：[`navigationGuards.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/navigationGuards.ts)、
[`lazyLoading.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/lazyLoading.spec.ts)。

### 4. reject 不会提交目标导航，也不会写入成功缓存

component Promise reject 会让导航失败；固定测试确认错误被传给失败路径，`currentRoute` 仍保持
原位置。写回 `record.mods/components` 的语句只在 fulfill 分支中执行。

**课程推导：** failed load 之后再次导航可能再次调用 loader，但 B10 主 Demo 不需要增加失败/重试
分支。错误处理应在课程正文作为边界说明，不与首次成功复用实验混成第二条 seam。

来源：[`navigationGuards.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/navigationGuards.ts)、
[`lazyLoading.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/lazyLoading.spec.ts)。

### 5. `loadRouteLocation()` 使用同一类解析与写回机制

公开 `loadRouteLocation(route)` 遍历所有 matched records 的 `components` keys，调用未解析 lazy
functions，等待它们完成，并同样写入 `record.mods[name]` 与 `record.components[name]`，最后返回
`RouteLocationNormalizedLoaded`。API 文档把它定义为“确保 route 已加载，以便作为 prop 传给
`RouterView`”。

它不是 `router.push()`：函数本身不运行 navigation guards、不写 history，也不提交
`router.currentRoute`。

**课程推导：** 它适合作为课末显式预加载选读；主 Demo 仍应通过真实 navigation 触发 loader，
否则会绕开本课最重要的导航等待时序。

来源：[`loadRouteLocation()` API](https://router.vuejs.org/api/functions/loadroutelocation)、
[`navigationGuards.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/navigationGuards.ts)。

### 6. 函数组件需要 `displayName` 消除歧义

Router 的 lazy contract 也是函数，而 Vue functional component 同样可以是函数。官方指南要求
functional route component 设置 `displayName`；`loadRouteLocation()` 也以“函数且没有
`displayName`”识别待加载 component。

**课程推导：** 不带 `displayName` 的 functional route component 可能被误当 loader 调用。它是
真实边界，但不需要进入主 Demo。

来源：[Lazy Loading Routes: Relationship to functional components](https://router.vuejs.org/guide/advanced/lazy-loading#relationship-to-functional-components)、
[`navigationGuards.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/navigationGuards.ts)。

## 真实常见易错项

| # | 错误方向 | 原因 | 可观察后果 | 正确方向 |
| --- | --- | --- | --- | --- |
| 1 | 写 `component: import('./Page.vue')` | 在建立 routes 时已经调用 import，且配置值是 Promise | 页面尚未导航，loader 工作已开始；开发模式还会诊断错误形状 | 写 `component: () => import('./Page.vue')` |
| 2 | 先静态 import，再返回 `Promise.resolve(component)` | 只模拟了 Router 等待，没有动态 split point | loader 看似异步，component 却已进入当前静态模块图 | B10 必须使用真实字面量动态 import |
| 3 | 把 route component 包成 `defineAsyncComponent()` | 混淆 Router 导航解析与 Vue 渲染时异步组件 | Router 开发诊断；底层页面 guard 不在正常 lazy extraction seam | route 本身直接返回 import Promise，async wrapper 只放内部子组件 |
| 4 | 预期每次进入都重新调用 loader 或重新下载 | 忽略成功后 record component 替换 | 测试错误地等待第二个 gate，页面永久卡住 | 断言首次调用一次，离开再进入计数不变 |
| 5 | 把 Router cache 等同 HTTP/CDN/Service Worker cache | 混合运行时 record 复用与传输层缓存 | 用不稳定 network 次数推翻正确 Router 行为 | 只以 loader call count 和 navigation state 验收 |
| 6 | 认为 lazy 页面开始 importing 时目标路由已经提交 | 忽略 async component resolution 位于导航确认前 | pending 时读取到的仍是旧 `currentRoute`，UI 文案自相矛盾 | 同时显示 target 与 current route，等待 push Promise 结算 |
| 7 | loader resolve 后才想提取 `beforeRouteEnter` 是偶然实现 | 忽略 Router 必须先拿到 component options | 把 route lazy loading 误讲成纯 RouterView 渲染行为 | 用完整导航流程和固定标签 guard 测试解释时序 |
| 8 | 把 `loadRouteLocation()` 当成一次导航 | 该 API 只加载 resolved route | 没有 history/currentRoute/guard 变化，却声称已经进入页面 | 仅把它作为显式预加载选读，导航仍用 push/replace |
| 9 | 直接复制 Router 指南的 Vite `manualChunks` 对象配置 | Router 指南片段与本仓库 Vite 8.1.5 构建 API 已漂移 | Vite 8 不支持该对象写法，且把构建器配置误当 Router API | B10 不改配置；需要分块策略时单独按 Vite 8 `codeSplitting` 调研 |

## 高级用法与适用边界

### Nested routes 与 named views

官方 `component` 和 `components` 都接受返回 Promise<Component> 的函数。源码会遍历 matched
records 以及每个 record 的 component names，因此父/子 record 与 named views 可以各自 lazy。
固定标签测试确认 nested lazy components 都会加载，并确认 nested alias 复用同一缓存。

这不等于“每个 component 必然一个 HTTP request”或“同一 route 必然一个 chunk”。实际 chunk
合并、共享依赖与 preload 是构建器输出，不进入 Router runtime contract。

依据：[Lazy Loading Routes](https://router.vuejs.org/guide/advanced/lazy-loading)、
[`navigationGuards.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/navigationGuards.ts)、
[`lazyLoading.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/lazyLoading.spec.ts)。

### 显式预加载

```ts
const reportRoute = router.resolve('/report')
await loadRouteLocation(reportRoute)
```

这可以在真正导航前解析并写回 lazy components，后续导航复用结果。调用者必须自己决定触发时机、
错误处理与资源预算；API 不会替调用者执行导航。

B10 只在正文高级用法中展示，不给 Demo 增加 hover preload、IntersectionObserver 或预测算法，避免
“按需加载”主线同时变化两个变量。

依据：[`loadRouteLocation()` API](https://router.vuejs.org/api/functions/loadroutelocation)、
[`navigationGuards.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/navigationGuards.ts)。

### 失败后重试

loader reject 会中止当前导航；因为成功替换尚未发生，下一次导航可重新调用 loader。产品可通过
`router.onError()` 或调用处的 rejected Promise 反馈失败，但 retry/backoff、部署版本漂移恢复与
`vite:preloadError` 属于生产可靠性专题，不进入 B10 Demo。

依据：[`lazyLoading.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/lazyLoading.spec.ts)、
[Vite Load Error Handling](https://vite.dev/guide/build.html#load-error-handling)。

## Vite 8 chunk 说明边界

Vue Router 官方指南的稳定结论是：bundler 遇到 route dynamic import 时可从 code splitting 受益。
但同一页面当前仍展示 `build.rollupOptions.output.manualChunks` 对象作为 Vite 分组示例。

本仓库使用 Vite 8.1.5。Vite 8 官方资料给出不同的当前 contract：

- 生产构建定制入口是 `build.rolldownOptions`；
- chunk strategy 使用 `build.rolldownOptions.output.codeSplitting`；
- 从 Vite 7 迁移到 8 时，`build.rollupOptions.output.manualChunks` 对象形式已移除，函数形式也被
  deprecated。

因此 B10 冻结以下措辞：

1. 可以说“字面量动态 import 是 Vite 生产构建可识别的异步 split point”。
2. 不说“每个 route 一定生成一个 chunk”或“再次进入一定没有网络请求”。
3. 不把 dev server 的 module request 文件名当 production chunk 证据。
4. 不复制 Router 指南的旧 `manualChunks` 配置，也不在本批迁移 Vite 配置。
5. 若未来确需验证 chunk grouping，应单独批准 build-only 任务，以 Vite 8 官方
   `codeSplitting` contract 为基线，并明确允许构建后再检查产物。

本研究任务禁止构建，因此这里只冻结官方资料边界，不声称已对本仓库 production assets 做实测。

依据：[Lazy Loading Routes: Grouping Components](https://router.vuejs.org/guide/advanced/lazy-loading#grouping-components-in-the-same-chunk)、
[Vite 8 Chunking Strategy](https://vite.dev/guide/build.html#chunking-strategy)、
[Vite 8 Migration from v7](https://vite.dev/guide/migration.html#removed-object-form-build-rollupoptions-output-manualchunks-and-deprecate-function-form-one)、
[Vite Dynamic Import](https://vite.dev/guide/features.html#dynamic-import)。

## 实现约束

- 后续只新增 B10 自己的 entry、一个 lazy route component、一个独立 Demo 与最少专项验证；本研究
  文档不授权这些实现。
- Demo 使用 `createMemoryHistory()`，显式完成 `/` 初始导航，并在宿主组件卸载时 unmount mini-app。
- 手动 gate 不使用 timer，不发真实 HTTP 请求；放行后必须调用真实字面量 `import()`。
- 导航按钮触发 pending `router.push()` 后不能阻塞“允许 import”控件；Promise 结算结果写入可见
  状态和事件日志。
- 所有可验证事实通过页面文本暴露，不依赖 console 或 network 面板。
- 样式只沿用现有 token、flex、margin/padding；不新增构建配置或全局样式重排。
- 390px 视口单列展示；长事件文本可换行，按钮文字不能截断。
- loading/resolve/reuse 状态使用可见文本与 `aria-live="polite"`，不只依赖颜色。
- 不读取或篡改 normalized record 私有字段来制造 cache；只观察 public navigation 与 loader counters。
- 最小验证只覆盖上文四组断言，不为不可能输入或构建产物堆叠测试。

## 明确 Out of Scope

B10 不包含：

- 修改 manifest、课程 entry、Demo、lazy component、E2E、总实施计划或 Vite 配置；
- `defineAsyncComponent()` 的 loading/error/delay/timeout/retry/Suspense 完整课程；
- `<Suspense>`、`<Transition>`、`<KeepAlive>` 与 `RouterView` slot 组合，这些属于后续 L12；
- experimental Data Loaders、Pinia Colada、导航前后业务数据获取重讲；
- SSR hydration、流式 SSR、服务端 module preload 或路由级数据序列化；
- preload/prefetch plugin、hover/viewport 预测、Service Worker、PWA 与 CDN cache；
- chunk grouping、vendor split、chunk hash、文件命名、压缩体积、source map 与性能预算；
- Webpack magic comments、Rollup 旧配置兼容或 Vite 8 构建迁移；
- 动态路径拼接、`import.meta.glob()`、文件路由和 `vue-router/vite` 插件，这些属于 L15 或单独专题；
- 真实网络限速、请求时间断言、浏览器 cache 命中率与部署版本漂移恢复；
- 强制清除 Router record cache 的非公共 API 技巧。

## B10 Stop Boundary

本研究笔记到此停止在 R1-B10 前置研究：

- 已冻结教学目标、先修、唯一 memory-router Demo seam、可观察状态、四组最小断言、九个易错项、
  源码推导、高级用法与 Vite 8 边界。
- 没有修改 catalog/manifest、课程正文、Demo、E2E、总实施计划或构建配置。
- 没有启动开发服务、打开页面、构建 `dist/` 或验证 production chunk。
- 后续实施必须重新确认 B09 gate、manifest snapshot 与 dirty workspace；不能把本文当作实现已完成。
- B11“导航失败”仍保持后续边界；B10 不借 lazy reject 提前实施完整 failure taxonomy。

## 固定来源清单

### Vue Router 官方 Guide / API

- [Lazy Loading Routes](https://router.vuejs.org/guide/advanced/lazy-loading)：route loader 形状、首次进入、
  cached version、async/functional component 边界，以及当前分块说明。
- [Full Navigation Resolution Flow](https://router.vuejs.org/guide/advanced/navigation-guards#the-full-navigation-resolution-flow)：
  async route component、`beforeRouteEnter`、`beforeResolve` 与导航确认的公开顺序。
- [`loadRouteLocation()`](https://router.vuejs.org/api/functions/loadroutelocation)：显式加载 resolved route
  并返回 `RouteLocationNormalizedLoaded` 的公共 contract。

### Vue / Vite 官方资料

- [Vue `defineAsyncComponent()`](https://vuejs.org/api/general.html#defineasynccomponent)：渲染时异步组件与
  loading/error/delay/timeout/suspensible/retry 选项，用于和 route lazy component 划界。
- [Vite Dynamic Import](https://vite.dev/guide/features.html#dynamic-import)：Vite 对动态 import 的官方
  功能边界。
- [Vite 8 Chunking Strategy](https://vite.dev/guide/build.html#chunking-strategy)：当前
  `build.rolldownOptions.output.codeSplitting` 入口。
- [Vite 8 Migration from v7](https://vite.dev/guide/migration.html#removed-object-form-build-rollupoptions-output-manualchunks-and-deprecate-function-form-one)：
  `manualChunks` 对象形式移除与函数形式 deprecated 的版本差异。
- [Vite Load Error Handling](https://vite.dev/guide/build.html#load-error-handling)：动态 import 加载失败的
  生产恢复边界，仅作 out-of-scope 说明。

### vuejs/router v5.2.0 固定标签

- [`packages/router/src/navigationGuards.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/navigationGuards.ts)：
  lazy/component 判定、loader 调用、ESM default 解析、`record.mods/components` 写回、component guard
  extraction 与 `loadRouteLocation()` 实现。
- [`packages/router/src/router.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts)：
  guard queue、entering record extraction、`beforeResolve` 与 final navigation commit 的顺序。
- [`packages/router/__tests__/lazyLoading.spec.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/lazyLoading.spec.ts)：
  pending navigation、nested routes、成功后单次 loader、alias cache、前置取消、component guards 与
  reject 行为的固定标签证据。

## 结论

B10 的最小教学闭环不是“看见一个带 hash 的 JS 文件”，而是用独立 memory router 和真实动态
`import()` 证明四个有因果关系的事实：未导航时 loader 未调用；首次进入时 Router 调用 loader 并
等待；import 解析后导航才提交；成功解析的 route component 在再次进入时被 Router 复用。

`defineAsyncComponent()` 属于 Vue 渲染时异步组件，不应包在 route record 上；`loadRouteLocation()`
可显式预加载 resolved route，但不等于导航。Vite 8 的 chunk strategy 已与 Router 指南中的旧
`manualChunks` 片段发生版本漂移，因此 B10 只冻结 dynamic import split point 的概念边界，不修改
构建配置、不构建产物，也不把 Router runtime cache 夸大为网络缓存承诺。
