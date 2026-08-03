# Vue SSR 与 hydration 调研

> 查证日期：2026-08-02  
> 适用版本：Vue 3.5.40  
> 资料范围：Vue 中文官方 SSR 指南、`vuejs/docs` 官方 Markdown、`vuejs/core`
> `v3.5.40` 的 `server-renderer` / `runtime-core` 源码及官方测试。外部资料仅通过
> Tavily 定位与提取；社区文章、issue 讨论和框架二次封装不作为结论依据。

## 结论先行

1. Vue SSR 不是“先生成一份 HTML”这么简单，而是一条完整链路：服务端按请求创建应用并调用
   `renderToString()`，浏览器收到预渲染 DOM 后，再由同一应用定义和同一初始状态通过
   `createSSRApp().mount()` 执行 hydration。
2. 请求隔离与首轮确定性是两条独立约束。前者防止用户状态跨请求泄漏，后者保证服务端 DOM 与
   客户端首轮 VNode 可匹配；只满足其中一条仍会产生严重问题。
3. hydration 会复用匹配的服务端节点并补上组件关联、事件和响应式更新。遇到不匹配时，Vue 会按
   不匹配类型局部恢复，但恢复有额外成本，也不能保证保留服务端节点的所有临时状态。
4. `data-allow-mismatch` 只用于有意且不可避免的差异。它选择性消除警告，不负责同步状态，也不应被
   用来遮盖无效 HTML、随机值、时区或请求污染造成的普通错误。
5. 当前仓库仍是 Vite SPA：运行入口
   [`src/main.ts`](../../src/main.ts) 使用 `createApp()`，运行脚本没有 Node SSR server entry，生产
   运行链也没有调用 `renderToString()`。课程可以演示服务端快照与客户端首轮模型，但不能把 SPA Demo
   称为真实 Node SSR 或真实 hydration 证据。

来源：[Vue 中文 SSR 总览与基础教程](https://cn.vuejs.org/guide/scaling-up/ssr.html)、
[客户端激活](https://cn.vuejs.org/guide/scaling-up/ssr.html#client-hydration)、
[`hydration.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/hydration.ts)。

## 一手来源

- [Vue 中文官方 SSR 指南](https://cn.vuejs.org/guide/scaling-up/ssr.html)：SSR 定义、基础服务端与
  客户端入口、通用代码、请求隔离、生命周期、平台 API 和 hydration mismatch。
- [`vuejs/docs` SSR 原始 Markdown](https://github.com/vuejs/docs/blob/main/src/guide/scaling-up/ssr.md)：
  官网内容的官方写作源，用于核对章节语义；实现细节仍以 `v3.5.40` 固定标签源码为准。
- [`renderToString.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/src/renderToString.ts)：
  应用到根 VNode、SSR context、异步 buffer、Teleport 与 watcher 清理的入口。
- [`render.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/src/render.ts)：
  服务端组件实例创建、SSR setup、`serverPrefetch` 等待与子树渲染。
- [`apiLifecycle.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiLifecycle.ts)：
  SSR setup 期间组合式生命周期注册的边界。
- [`hydration.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/hydration.ts)：
  hydration 遍历、节点采用、mismatch 分类、恢复与 `data-allow-mismatch`。
- [`hydration.spec.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/hydration.spec.ts)：
  文本、children、完整节点和允许 mismatch 的官方回归用例。
- [`server-renderer` render 官方测试](https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/__tests__/render.spec.ts)：
  应用上下文、`onServerPrefetch()` 与最终 HTML 的官方行为证据。

## 1. SSR 的请求隔离

### 问题不是“响应式对象是否全局”，而是“可变状态是否跨请求复用”

纯客户端 SPA 的模块通常会随页面加载初始化一次，对当前浏览器会话使用模块级单例很常见。Node SSR
进程则会长期复用已经加载的模块；如果模块根作用域保存用户相关的可变状态，请求 A 写入的值可能在
请求 B 渲染时仍然存在，这就是跨请求状态污染。

官方建议让共享模块导出应用工厂，并在每个请求中重新创建：

- Vue app；
- router 及当前请求的路由状态；
- 全局 store 及请求相关数据；
- 需要通过 app-level `provide` 暴露的请求级依赖。

```ts
// app.ts，在服务端与客户端共享
/** 为单次服务端请求或一次浏览器启动创建隔离应用。 */
export function createUniversalApp() {
  const app = createSSRApp(App)
  const store = createStore()
  const router = createRouter()

  app.use(store)
  app.use(router)

  return { app, store, router }
}
```

服务端必须在请求处理函数内部调用该工厂。把工厂结果缓存成模块单例，会重新引入污染风险。客户端也
调用同一工厂，但它创建的是当前浏览器页面自己的应用实例。

来源：[跨请求状态污染](https://cn.vuejs.org/guide/scaling-up/ssr.html#cross-request-state-pollution)、
[`vuejs/docs` 对应章节](https://github.com/vuejs/docs/blob/main/src/guide/scaling-up/ssr.md#cross-request-state-pollution)。

## 2. 服务端与客户端的首轮确定性

hydration 要求浏览器中的预渲染 DOM 与客户端第一次渲染得到的 VNode 树相互对应。这里要求的是
“首轮可重放”，不是要求 hydration 后应用永远不再变化。

### 必须保持一致的输入

- 根组件、插件安装顺序以及会影响首轮输出的 app 配置；
- 当前 URL 对应的路由结果；
- 服务端已经取到并写入 HTML 的初始 store 状态；
- 随机数种子、语言环境和会影响首轮字符串的时间数据；
- 首轮模板分支与节点层级。

服务端取到的状态应以安全的序列化形式随响应交给客户端，客户端先恢复状态，再挂载应用。不能在
服务端渲染一组数据、客户端又立即独立请求或随机生成另一组数据，然后期待 hydration 自动调和。

### 官方列出的三类常见根因

1. **无效 HTML 结构。** 浏览器解析器会修正服务器字符串，例如把 `<p><div>...</div></p>`
   改写成不同 DOM 层级，客户端随后看到的已不是服务端以为输出的节点树。
2. **随机值。** 同一应用在服务端和客户端各执行一次，两个无种子的随机结果无法保证一致。可以把
   种子随状态传递，或让相关内容在 `onMounted()` 后仅在客户端出现。
3. **时区差异。** 服务端通常不能可靠预知用户时区；当地时间格式化可延迟到客户端，或先传递足够的
   确定性时区信息。

同样的原则也适用于 `Date.now()`、依赖浏览器尺寸的分支和只在某个平台存在的数据。首轮不要直接以
`window`、`document` 或媒体查询结果决定不同结构；必须在客户端挂载后再进入平台特有分支。

来源：[激活不匹配与常见原因](https://cn.vuejs.org/guide/scaling-up/ssr.html#hydration-mismatch)、
[客户端激活要求同一应用](https://cn.vuejs.org/guide/scaling-up/ssr.html#client-hydration)。

## 3. 服务端与客户端入口

### 服务端入口

每个请求创建新 app，完成当前路由和初始状态准备后，再把 app 交给 `renderToString()`：

```ts
const { app, router, store } = createUniversalApp()

await router.push(request.url)
await router.isReady()
await store.loadForRoute(router.currentRoute.value)

const html = await renderToString(app, ssrContext)
```

`renderToString()` 返回 Promise，不应把异步 setup 或 `serverPrefetch` 尚未结束的中间状态当作最终
HTML。源码会为 app 创建根 VNode、挂上 app context、向组件树 provide SSR context、展开异步 buffer，
最后解析 Teleport 输出并清理 SSR watcher handles。

来源：[基础服务端渲染示例](https://cn.vuejs.org/guide/scaling-up/ssr.html#rendering-an-app)、
[`renderToString.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/src/renderToString.ts)、
[`render.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/src/render.ts)。

### 客户端入口

客户端必须恢复与服务端相同的初始状态，并使用同一 app 工厂产生的 `createSSRApp()` 实例：

```ts
const { app, router, store } = createUniversalApp()

store.replaceState(window.__INITIAL_STATE__)
await router.isReady()
app.mount('#app')
```

`createSSRApp().mount()` 表达“容器中已有预渲染 DOM，需要 hydration”。普通 `createApp().mount()`
表达客户端新挂载，不是 SSR 客户端入口的等价写法。

来源：[客户端激活](https://cn.vuejs.org/guide/scaling-up/ssr.html#client-hydration)、
[`vuejs/docs` 客户端入口](https://github.com/vuejs/docs/blob/main/src/guide/scaling-up/ssr.md#client-hydration)。

## 4. hydration 算法与恢复边界

Vue 3.5.40 的 `createHydrationFunctions()` 接收 renderer internals，返回根 `hydrate()` 和
`hydrateNode()`。根容器非空时，从 `firstChild` 开始递归匹配；容器为空时无法采用任何服务端节点，
会警告并执行完整客户端 mount。

`hydrateNode()` 按 VNode 类型和现有 DOM 类型分派：文本、注释、静态节点、Fragment、元素、组件、
Teleport 与 Suspense 各走对应分支。类型兼容时采用现有节点；组件 VNode 通过已设置的 `vnode.el`
进入组件子树 hydration，而不是先清空整棵 DOM。

来源：[`createHydrationFunctions()` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/hydration.ts)、
[`hydration.spec.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/hydration.spec.ts)。

### mismatch 分类与恢复

| mismatch 类别 | 典型条件 | Vue 3.5.40 的恢复行为 |
| --- | --- | --- |
| 空容器 | 客户端要 hydrate，但容器没有服务端子节点 | 放弃采用，完整 mount 客户端 VNode |
| 文本 | 现有 Text 或元素 `textContent` 与客户端文本不同 | 把文本改为客户端期望值 |
| children 过多 | 服务端元素中仍有客户端 VDOM 不需要的尾部节点 | 删除多余服务端节点 |
| children 不足 | 客户端 children 已无对应服务端节点 | mount 缺失的客户端 VNode |
| 节点类型或标签 | Text、Comment、Fragment、元素标签等无法对应 | 移除不兼容节点；Fragment 会清理范围；在原位置 patch 新 VNode |
| `class` | 规范化后的 class 集合不同 | 报告 check-only mismatch；不承诺生产环境修正 DOM |
| `style` | 规范化后的 style map 不同 | 报告 check-only mismatch；不承诺生产环境修正 DOM |
| `attribute` | 已知 HTML / SVG attribute 或布尔 attribute 不同 | 报告 check-only mismatch；不承诺生产环境修正 DOM |

这张表不能简化成“任何 mismatch 都重新渲染整棵应用”：恢复粒度取决于类别。文本可原位改写，children
会局部增删，真正不兼容的节点才由 `handleMismatch()` 移除并在原位置 mount。另一方面，class、style
和 attribute 的诊断明确写着 check-only，生产环境不会为了这些检查统一纠正 DOM；事件和必要动态 prop
仍由正常 hydration 路径处理，不能把“采用节点”误解为“完全不碰属性”。

即使自动恢复后页面看似可用，也应在开发阶段修复根因：替换节点会增加渲染成本，并可能丢失该节点上
不属于客户端 VNode 的临时 DOM 状态。

来源：[官方对自动恢复成本的说明](https://cn.vuejs.org/guide/scaling-up/ssr.html#hydration-mismatch)、
[`handleMismatch()` 与 prop 检查 v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/hydration.ts)、
[`hydration.spec.ts` mismatch 回归](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/hydration.spec.ts)。

## 5. `data-allow-mismatch`

Vue 3.5+ 可以对确实无法避免的差异选择性消除 hydration mismatch 警告：

```vue
<time data-allow-mismatch="text">{{ localTime }}</time>
```

Vue 3.5.40 源码定义五类值：

- `text`
- `children`
- `class`
- `style`
- `attribute`

空值 `data-allow-mismatch` 表示允许该作用域内的所有类别。逗号分隔可以声明多个类别；源码按精确值
拆分，课程示例不应在逗号后加入额外空格。`children` 同时覆盖 `text` 子集。对 text / children，检查会
沿父元素向上寻找该 attribute；class / style / attribute 则针对当前元素的相应 prop 比较。

必须保留三个边界：

1. 它消除的是已知差异的警告，不是让服务端和客户端状态自动一致。
2. 它不改变结构恢复的必要性；节点不兼容时仍要删除和 patch，只是不再报告被允许的 mismatch。
3. 它不适合遮盖普通缺陷。无效 HTML、可传递随机种子却没有传递、错误的 store 恢复或请求污染都应
   修复源头。

来源：[Vue 3.5+ 消除激活不匹配](https://cn.vuejs.org/guide/scaling-up/ssr.html#suppressing-hydration-mismatches)、
[`MismatchTypes` 与 `isMismatchAllowed()` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/hydration.ts)、
[`data-allow-mismatch` 官方测试](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/hydration.spec.ts)。

## 6. 生命周期与平台边界

### 服务端会执行什么

- `setup()` / `<script setup>` 根作用域会在服务端组件 setup 中执行。
- Options API 的 `beforeCreate`、`created` 会在 SSR 期间执行。
- `onServerPrefetch()` 是服务端专用异步入口；server renderer 会等待已登记的 prefetch，再渲染子树。
- SSR 没有用户交互和后续 DOM 更新，服务端响应性默认禁用以降低成本。

### 服务端不会执行什么

- `mounted` / `onMounted`、`updated` / `onUpdated` 只在客户端运行。
- 组合式 API 的 mount、update、unmount 等 post-create 生命周期在 SSR setup 中不会登记；
  `SERVER_PREFETCH` 是源码保留的例外。
- 因为 unmount 钩子不会在服务端执行，不能在 `setup()`、`beforeCreate` 或 `created` 中启动依赖
  `onUnmounted()` 清理的定时器。此类浏览器副作用应放到 `onMounted()`。

来源：[服务端响应性与生命周期](https://cn.vuejs.org/guide/scaling-up/ssr.html#reactivity-on-the-server)、
[`apiLifecycle.ts` SSR 注册门槛](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiLifecycle.ts)、
[`render.ts` 等待 serverPrefetch](https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/src/render.ts)、
[`render.spec.ts` 官方 prefetch 测试](https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/__tests__/render.spec.ts)。

### 平台 API

通用模块会同时在 Node 和浏览器执行，不能在模块求值或服务端首轮 render 中直接读取 `window`、
`document` 等浏览器全局。浏览器能力应封装在平台适配层，或延迟到 `onMounted()`。同理，直接依赖
Node API 的实现也不能无条件进入客户端 bundle。

大多数直接操作 DOM 的自定义指令在 SSR 中会被忽略；确实要输出服务端 attribute 时使用
`getSSRProps`。Teleport 的服务端内容也不直接混入主应用字符串，而是通过 SSR context 单独收集，
需要由服务端模板放进目标容器。

来源：[访问平台特有 API](https://cn.vuejs.org/guide/scaling-up/ssr.html#access-to-platform-specific-apis)、
[SSR 自定义指令与 Teleports](https://cn.vuejs.org/guide/scaling-up/ssr.html#custom-directives)、
[`renderToString.ts` Teleport 解析](https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/src/renderToString.ts)。

## 7. 可用于课程的 8 条源码推导

### 推导 1：`renderToString()` 接收的是应用上下文，不只是根组件

入口从 app 创建根 VNode，并把 `input._context` 赋给 `vnode.appContext`。因此插件、全局组件、provide
与错误处理等 app-level 配置必须在服务端 render 前安装；只在客户端安装会让两端首轮行为不同。

来源：[`renderToString.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/src/renderToString.ts)。

### 推导 2：服务端异步准备属于组件渲染完成条件

`renderComponentVNode()` 以 SSR 模式执行 setup，并在 async setup 或 `serverPrefetch` 存在时等待它们，
再进入 `renderComponentSubTree()`。课程应把服务端预取画成渲染管线的一部分，而不是 HTML 返回后的
后台任务。

来源：[`render.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/src/render.ts)、
[`render.spec.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/__tests__/render.spec.ts)。

### 推导 3：SSR 生命周期限制发生在“注册”阶段

`apiLifecycle.ts` 在 `isInSSRComponentSetup` 为 true 时跳过 post-create hook 注入，只有
`SERVER_PREFETCH` 例外。这解释了为什么在服务端执行到 `onMounted(() => ...)` 这行，并不意味着其
回调会在服务器调用。

来源：[`apiLifecycle.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiLifecycle.ts)。

### 推导 4：hydration 是“采用现有节点”，不是重新 mount 的别名

非空容器从 `firstChild` 进入 `hydrateNode()`；匹配元素和组件保留 `vnode.el` 指向现有 DOM。只有空
容器或具体 mismatch 分支才调用 mount / patch 创建节点。因此课程动画应先表现“节点配对与接管”，
再表现必要的局部恢复。

来源：[`createHydrationFunctions()` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/hydration.ts)。

### 推导 5：文本、children 与节点类型 mismatch 的恢复粒度不同

文本原位写成客户端值；缺少 children 时 mount 缺失项；多余 children 被逐个删除；节点类型或标签
不兼容才进入 `handleMismatch()` 删除旧节点并 patch 新 VNode。一个笼统的“Vue 重新渲染”无法解释
这些不同的 DOM 后果。

来源：[`hydration.ts` 恢复分支 v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/hydration.ts)、
[`hydration.spec.ts` 官方恢复断言](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/hydration.spec.ts)。

### 推导 6：class / style 比较先规范化，顺序不同不必然 mismatch

class 会按集合比较，style 会转成 map 后比较；仅仅 class token 或 CSS 声明顺序不同，不等于语义
不同。课程不要用顺序差异制造伪 mismatch，应改变真实 class token 或 style 值。

来源：[`propHasMismatch()` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/hydration.ts)。

### 推导 7：属性诊断与结构恢复不能共用一个“已修复”状态

class、style、attribute mismatch 的源码警告明确标记为 check-only，生产环境不会因检查成本统一修正
DOM；结构 mismatch 则会实际增删或替换节点。课程状态模型至少应区分“已报告”和“发生 DOM 恢复”。

来源：[`propHasMismatch()` 与 `handleMismatch()` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/hydration.ts)。

### 推导 8：`data-allow-mismatch` 是分类 allowlist，不是总开关

源码把允许项建模为 `text`、`children`、`class`、`style`、`attribute` 五类，并让 `children` 覆盖
`text` 子集。课程应要求学习者先说出“哪类差异是刻意的”，再选择最窄值；只有确实需要允许全部类别
时才使用空 attribute。

来源：[`MismatchTypes` 与 allowlist 解析 v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/hydration.ts)、
[`data-allow-mismatch` 官方测试](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/hydration.spec.ts)。

## 8. 当前仓库的验证边界

当前运行入口是：

```ts
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')
```

仓库没有 Node 请求处理函数，也没有在运行链中调用 `renderToString()` 或
`createSSRApp().mount()`。因此本课在现有 SPA 内可以可靠验证：

- 请求级工厂、确定性输入和 mismatch 分类的概念模型；
- 服务端快照与客户端首轮模型的可视化比较；
- 学习者能否选择正确恢复策略与 `data-allow-mismatch` 类别。

但它不能验证：

- Node 进程中的真实跨请求隔离；
- `serverPrefetch` 对服务端 HTML 的真实影响；
- 浏览器对服务端 HTML 的实际解析修正；
- Vue runtime 的真实 hydration warning、节点复用或替换；
- SSR context 中的 Teleport 与 watcher 清理。

如果未来要把这些结论升级为运行态证据，必须另建真实 server entry、client entry 和
`vue/server-renderer` 反馈环，并用两个独立请求验证状态不泄漏，再在浏览器中观察同一响应的
hydration。当前批次不得把可视化模型外推成该证据。
