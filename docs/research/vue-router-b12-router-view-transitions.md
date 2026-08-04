# Vue Router R1-B12：RouterView 插槽与过渡调研

> 核验日期：2026-08-04
>
> 适用版本：Vue 3.5.40、Vue Router 5.2.0。
>
> 资料范围：Vue Router 官方 Guide/API、Vue 官方 `Transition` / `KeepAlive` 文档，以及
> `vuejs/router@v5.2.0` 固定标签的 `RouterView.ts`、`router.ts` 和官方测试、
> `vuejs/core@v3.5.40` 的 `BaseTransition.ts`。外部资料先用
> Tavily Search / Extract 发现，再回到这些一手来源核验。

## 课程定位与冻结边界

本课 Manifest 冻结为 `vue.router.learn.advanced.router-view-slots-transitions`，标题为
“RouterView 插槽与过渡”。直接前置课程是：

| 前置 | 课程 ID | 本课复用的能力 |
| --- | --- | --- |
| L02 | `vue.router.learn.basics.router-link-view-active` | `RouterView` 渲染当前匹配组件的基础 |
| L10 | `vue.router.learn.intermediate.lazy-loading` | 异步 route component 与导航完成边界 |
| L11 | `vue.router.learn.advanced.navigation-failures` | `router.push()` 的结算结果与导航提交边界 |

B12 只回答四个问题：

1. `RouterView` slot 暴露的 `Component` 与 `route` 分别是什么。
2. `Transition`、`KeepAlive` 和 route component 应按什么顺序嵌套。
3. 无 key、`route.path` key 与 `KeepAlive` 如何共同决定实例复用、替换和缓存。
4. 如何把导航完成、缓存生命周期、过渡事件与初始 `isReady()` 分开观察。

2026-08-04 的调研快照中，manifest 的 SHA-256 为
`6b092f061efb73e770a03e067a82b1e6a133b6381b253d19950cbc1317ea980b`，B11、B12、B13
均为 `planned`；`package-lock.json` 固定 `vue-router` 为 `5.2.0`。这些状态只说明调研时的
工作区，实施前必须重新检查，不能把本文当作 B11 已关闭或 B12 已上线的证据。

依据：[课程总计划](./vue-router-course-plan.md)、
[RouterView slot](https://router.vuejs.org/guide/advanced/router-view-slot)、
[Transitions](https://router.vuejs.org/guide/advanced/transitions)。

## 教学目标

完成本课后，学习者应能：

1. 使用 `v-slot="{ Component, route }"` 渲染当前 route component，并说明 `Component` 是
   Router 已创建的 VNode，而不是需要再次查表的 route component 定义。
2. 把 `KeepAlive` 和 `Transition` 放在 slot 内，让它们作用于 route component，而不是缓存或
   过渡 `RouterView` 本身。
3. 预测同一 route record 只变化 params 时的默认实例复用，并只在确实需要新身份或过渡时加 key。
4. 用实例 ID、内部计数、`mounted/unmounted`、`activated/deactivated` 证明“复用”“替换”与
   “缓存”是三种不同结果。
5. 说明 `mode="out-in"` 只协调 leave/enter 的视觉顺序，不会延后 Router 的导航提交。
6. 在 memory history 中先发起初始 `push()`，等待 `router.isReady()` 后再 mount，避免无意的
   initial enter transition。
7. 通过 transition hooks 观察事件，而不使用任意 timer 或 CSS duration 猜测完成时机。
8. 在 reduced motion、390px 与 200% 文字条件下保留相同导航、状态和键盘能力。

## `RouterView` slot 的公开 contract

标准组合从 slot 开始：

```vue
<RouterView v-slot="{ Component, route }">
  <component :is="Component" />
</RouterView>
```

### `Component`

Vue Router 5.2.0 的 `RouterView.ts` 先根据当前 depth、view name 与 matched record 创建 route
component VNode，再把该 VNode 作为 `Component` 传给 slot。源码注释明确指出：`h()` 与
`<component :is="...">` 都接受 VNode。

这意味着：

- slot 消费方直接写 `<component :is="Component" />`；
- 不需要再从 `route.matched` 取 component，也不应重新调用 lazy loader；
- refs、route props 与 attrs 都已经由 `RouterView` 放到该 VNode 上；
- 当前 depth 没有匹配 component 时，slot 仍可能收到 `Component: undefined`。

固定测试专门验证 default slot 同时收到 `Component` 和 `route`，并验证 slot 内的
`KeepAlive` 能正常切换 route component。

### `route`

slot 中的 `route` 是这个 `RouterView` 实际用于匹配和渲染的
`RouteLocationNormalizedLoaded`。默认来自当前 router location；如果高级用法显式传入
`RouterView` 的 `route` prop，则 slot 仍返回该 view 实际使用的 route。

因此动态 transition name、key 或可见诊断应优先使用同一个 slot `route`，避免另取一个可能不属于
该 view 的响应式 route。

依据：[`RouterView` API](https://router.vuejs.org/api/variables/routerview)、
[`RouterView.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/RouterView.ts)、
[`RouterView.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/RouterView.spec.ts)。

## 正确的嵌套顺序

Vue Router 与 Vue 官方文档给出的组合顺序一致：

```vue
<RouterView v-slot="{ Component, route }">
  <Transition name="route-fade" mode="out-in">
    <KeepAlive>
      <component :is="Component" :key="route.path" />
    </KeepAlive>
  </Transition>
</RouterView>
```

从外向内的责任是：

| 层 | 责任 |
| --- | --- |
| `RouterView` | 按当前 route、depth 和 view name 产出 route component VNode |
| `Transition` | 协调当前 VNode 离场与下一 VNode 入场 |
| `KeepAlive` | 缓存失活的 route component 实例 |
| `<component :is="Component">` | 渲染 slot 提供的 route component VNode |

`KeepAlive` 必须位于 slot 内，目标才是 route component，而不是长期存在的 `RouterView`。
同时使用时，官方顺序是 `Transition > KeepAlive > route component`。Vue Router 5.2.0 的固定测试
还覆盖了把 `Transition` / `KeepAlive` 直接包在 `RouterView` 外的弃用诊断，因此课程不保留旧写法。

依据：[RouterView slot: KeepAlive & Transition](https://router.vuejs.org/guide/advanced/router-view-slot#keepalive-transition)、
[Vue `KeepAlive` API](https://vuejs.org/api/built-in-components.html#keepalive)、
[`RouterView.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/RouterView.spec.ts)。

## 实例身份、key 与缓存

### 默认复用

Vue 在同类型 VNode 间会尽量原位 patch。Vue Router 导航到同一 route record、只变化 params 时，
通常复用当前 route component 实例；这也是 `beforeRouteUpdate` 存在的原因。内部 state 不会因为
`/workspace/alpha` 变为 `/workspace/beta` 自动重置，也不一定产生 enter/leave transition。

### key 强制替换

Vue 的 `key` 是 VNode 身份，不是 Router 的导航 ID。key 变化会强制替换 component，而不是原位
复用，并由此触发生命周期和 transition。

Router transition 指南使用 `:key="route.path"`，让同一 record 的不同 pathname 也拥有不同身份。
它是有意改变行为，不是所有 `RouterView` 的固定样板：

- `route.path` 包含实际 pathname，因此 `/workspace/alpha` 与 `/workspace/beta` 不同；
- `route.path` 不包含 query/hash，纯筛选或锚点变化不会创建额外实例；
- `route.fullPath` 包含 query/hash，只有产品确实要求每个组合独立实例时才可选；
- 把整个 `route` 对象当 key 会把导航对象身份误当产品身份，不应使用。

### KeepAlive 缓存的是实例

`KeepAlive` 不序列化 state，也不把 state 搬到 store。它保留失活的 component instance：离开 DOM
时进入 `deactivated`，再次插入时进入 `activated`。`onActivated()` 也会在首次 mount 时调用，
`onDeactivated()` 也会在最终 unmount 时调用，因此不能把这两对 hook 简单视为互斥替代品。

同一个 `KeepAlive` 中，key 会参与缓存身份。配合 `route.path` 后，同一种 route component 可以为
alpha/beta 各保留一个实例；没有 key 时，alpha/beta 默认仍是同一个复用实例。

### 四种组合的预期

以下矩阵是 B12 Demo 的核心，不扩大为任意 cache policy：

| KeepAlive | key | `/workspace/alpha -> beta` | `workspace -> review -> workspace` |
| --- | --- | --- | --- |
| 关闭 | 无 | 同一 workspace 实例被复用，计数连续 | workspace unmount；返回得到新实例、计数归零 |
| 关闭 | `route.path` | alpha 离开后销毁，beta 创建新实例 | 返回 alpha 仍是新实例 |
| 开启 | 无 | 同一 workspace 实例被复用，计数连续 | workspace deactivated；返回 activated，ID/计数保留 |
| 开启 | `route.path` | alpha/beta 是两个缓存身份 | 每个 pathname 返回时恢复自己的 ID/计数 |

依据：[Transitions: forcing reused views](https://router.vuejs.org/guide/advanced/transitions#forcing-a-transition-between-reused-views)、
[Vue `key`](https://vuejs.org/api/built-in-special-attributes.html#key)、
[Vue KeepAlive](https://vuejs.org/guide/built-ins/keep-alive)、
[`onBeforeRouteUpdate.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/guards/onBeforeRouteUpdate.spec.ts)、
[`onBeforeRouteLeave.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/guards/onBeforeRouteLeave.spec.ts)。

## 导航提交与过渡事件是两条时间线

Vue `<Transition>` 默认让 enter/leave 同时进行。B12 选择 `mode="out-in"`，让旧视图先离场，leave
完成后再插入新视图。这个 DOM 顺序不等同于公开 JavaScript hook 回调的文本顺序。

主 Demo 只记录四个稳定阶段：

```text
before-leave:<old-instance>
before-enter:<new-instance>
after-leave:<old-instance>
after-enter:<new-instance>
```

`before-enter -> enter -> after-enter` 与 `before-leave -> leave -> after-leave` 是 Vue transition
hook contract。路由页面不是通过 `v-show` 切换，因此不把只适用于 `v-show` 的
`leave-cancelled` 写成必达事件。

Vue 3.5.40 的 `BaseTransition` 在 `out-in` 内部 `afterLeave` 中先触发组件更新，再由 renderer 的
leave 完成回调调用公开 `onAfterLeave`。因此真实 CSS transition 的可见 hook 日志是
`before-leave -> before-enter -> after-leave -> after-enter`；这不表示新元素在旧元素完成离场前已插入。

以下事实必须分开陈述：

- Router 成功提交会更新 `currentRoute`，`router.push()` 随导航结果结算；
- `mode="out-in"` 只协调渲染层两个 VNode 的先后；
- `await router.push()` 不等价于“`after-enter` 已触发”；
- transition hook 适合更新可见事件日志，但不能改变已经完成的导航；
- E2E 应等待可见 `after-enter` token，而不是等待固定毫秒数。

Demo 使用 CSS transition 和 Vue hooks，不使用 `:css="false"` 的手工 `done()` 路径，也不读取
`transitionend` 次数。这样课程只有一个完成协议。

依据：[Vue Transition modes](https://vuejs.org/guide/built-ins/transition#transition-modes)、
[Vue Transition JavaScript hooks](https://vuejs.org/guide/built-ins/transition#javascript-hooks)、
[`Transition` API](https://vuejs.org/api/built-in-components.html#transition)、
[`BaseTransition.ts@v3.5.40`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/BaseTransition.ts)。

## 初始导航与 `router.isReady()`

普通 `<Transition>` 默认不在初次 render 上执行 enter，除非设置 `appear`。但 Router 导航是异步的：
如果应用先以空 RouterView mount，再完成初始导航，route component 会表现得像后插入内容，即使没有
`appear` 也会产生 enter transition。

浏览器 history 下，`app.use(router)` 会从当前 URL 自动启动初始导航；Vue Router 官方建议在
mount 前等待：

```ts
const app = createApp(App)
app.use(router)
await router.isReady()
app.mount('#app')
```

B12 使用 memory history，不依赖浏览器 location。它必须显式发起初始导航，再等待 ready：

```ts
const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

await router.push('/workspace/alpha')
await router.isReady()

const app = createApp(DemoApp)
app.use(router)
app.mount(mountTarget)
```

固定源码中，`isReady()` 在 router 已 ready 且 current route 不再是 `START_LOCATION` 时立即 resolve；
否则把 resolve/reject handler 放入 ready queue。初始导航错误、取消或 lazy component 加载失败会让
等待 reject，不能把 `isReady()` 教成永不失败的延时工具。固定测试还确认成功后可重复调用并立即
resolve。

Demo 的初始可见状态必须显示：

- `ready: true`，且 ready 在 mount 前完成；
- initial route 为 `/workspace/alpha`；
- initial transition event count 为 `0`；
- 宿主课程 URL 未变化。

依据：[Transitions: initial navigation](https://router.vuejs.org/guide/advanced/transitions#initial-navigation-and-transitions)、
[`Router` API: `isReady()`](https://router.vuejs.org/api/interfaces/router#isready)、
[`router.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts)、
[`isReady.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/isReady.spec.ts)、
[`initialNavigation.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/initialNavigation.spec.ts)。

## 唯一独立 memory-router Demo seam

后续唯一 Demo 冻结为 `router-view-transitions-lab-demo`，使用独立 mini-app 与独立
`createMemoryHistory()`，不读取或改变宿主 router。

建议文件边界仅用于后续 B12 实施，不授权本研究任务创建这些文件：

- entry：`src/content/entries/learn/vue/router/advanced/router-view-slots-transitions.ts`
- Demo：
  `src/content/demos/vue/router/learn/advanced/router-view-slots-transitions/router-view-transitions-lab-demo.vue`
- catalog test：`src/content/catalog/vue-router-b12.spec.ts`
- E2E：`tests/e2e/router-view-transitions.spec.ts`

### 固定 route

| path | component | 用途 |
| --- | --- | --- |
| `/workspace/:id` | `WorkspaceRoute` | alpha/beta 共用一个 record，证明 params 变化时复用或按 key 分身份 |
| `/review` | `ReviewRoute` | 不同 component type，证明 KeepAlive 离开/返回时是否保存实例 |

两个 route component 都必须拥有：

- setup 时分配的单调实例 ID；
- 组件内部 count 与“增加计数”按钮；
- `mounted`、`unmounted`、`activated`、`deactivated` 的可见事件记录；
- 单一根元素，并暴露 view label、route path、实例 ID 与 count。

单一根元素是 `<Transition>` 的公开约束；Demo 不为 fragment route component 增加第二条 seam。

### 固定控制

1. 导航到 workspace alpha。
2. 导航到 workspace beta。
3. 导航到 review。
4. 增加当前 route component 的内部 count。
5. 开关 KeepAlive。
6. 在“默认复用”与“按 `route.path` 建立身份”之间切换。
7. 开关 route transition。
8. 重置实验。

KeepAlive、key 与 transition 都是结构性变量。任一配置改变时，Demo 应 unmount 当前 mini-app，创建
新的实验 generation，并从 `/workspace/alpha` 重新开始；不能让旧 KeepAlive cache 混入新配置的
结论。重置也走同一清理路径，不额外维护第二套初始化逻辑。

### 必须可观察状态

| 状态 | 页面必须能回答的问题 |
| --- | --- |
| generation | 当前结果是否属于同一次受控实验？ |
| host path | mini router 是否保持宿主课程 URL 不变？ |
| `currentRoute.fullPath` | 当前导航提交到了哪里？ |
| ready / mounted | 初始导航是否在 mini-app mount 前 ready？ |
| KeepAlive / key / transition | 当前三个实验变量是什么？ |
| active component / instance ID | 当前显示哪一类组件、哪个实例？ |
| active count | 当前实例的内部状态是多少？ |
| lifecycle log | 实例是 reused、unmounted 还是 deactivated/activated？ |
| transition log | out-in 的 leave/enter 是否按 hook 结算？ |
| navigation outcome | push 是 pending、成功还是 failure？ |
| initial transition count | mount 前 ready 是否避免初始 enter？ |

导航与 transition 日志分区展示；不能把 `after-enter` 标成导航成功，也不能用日志文字替代当前
route 与实例状态。快速变化的 timeline 不设为逐条 live region，只用一个简短 `role="status"`
汇总当前 route、实例、计数和最近一次结算，避免辅助技术被事件洪水淹没。

## 最小 E2E

B12 只新增一个专项 E2E 文件和一个主用户路径，不为每个矩阵单元拆测试。最小路径覆盖：

1. 首屏 ready 为 true、route 为 `/workspace/alpha`、initial transition count 为 0，宿主 URL 不变。
2. 默认无 key 时，alpha 增加 count 后去 beta，instance ID 与 count 保持，证明同 record 复用。
3. 重置为 KeepAlive + `route.path` key：alpha、beta 分别增加到不同 count，经过 review 后返回两者，
   各自 instance ID 与 count 均恢复；事件包含 deactivated/activated。
4. 同一次普通运动路径中，等待并断言
   `before-leave -> before-enter -> after-leave -> after-enter`，不比较毫秒耗时，并将 hook 回调顺序与
   `out-in` 的 DOM 插入顺序分开解释。
5. 重置为关闭 KeepAlive + path key + 关闭 transition：离开 alpha 再返回时 instance ID 改变、
   count 归零，transition log 不新增 enter/leave hook。
6. 用真实 `Tab` / `Shift+Tab` / `Enter` 完成至少一次导航或配置切换，控件顺序和 focus visible 可见。
7. 切到 390px 并注入 200% 文字规则后，所有控制、状态和 timeline 可读可操作，页面与 Demo 均无
   横向溢出。
8. `page.emulateMedia({ reducedMotion: 'reduce' })` 后再次导航，最终 route、实例和 count 正确；相关
   route transition 的 computed duration 为 `0s` 或 transition 为 `none`，console/pageerror 为空。

本 E2E 不断言 frame 数、像素位移、确切 duration、浏览器合成层或事件发生的绝对时间。

## Reduced Motion 与窄视口 contract

### Reduced motion

- 默认 transition 只使用 opacity 与小幅纵向位移，不用横向滑屏、弹簧或大幅缩放。
- `@media (prefers-reduced-motion: reduce)` 将 route enter/leave duration 清零或设为 `none`。
- reduced motion 只移除非必要运动，不跳过导航、key、缓存生命周期或状态更新。
- E2E 仍等待最终可见状态；不能因为 duration 为 0 就省略行为断言。
- 不加入用户自定义动画速度、localStorage 偏好或 JS `matchMedia` 状态机。

### 390px 与 200% 文字

- 使用 flex、换行与显式 margin/padding，不使用 `grid` 或 `gap`。
- 控制组在 390px 和 200% 文字下纵向或换行排列，按钮文字不截断，触控高度至少 44px。
- route path、instance ID 和 timeline token 允许断行，不设置会撑破容器的固定宽度。
- route component 根、状态区与日志区不得依赖绝对定位；过渡期间也不能制造横向滚动。
- 信息不只依赖颜色，focus、active route、cache 状态和 transition 状态都必须有文字。

## Vue Router 5.2.0 源码推导

### 1. slot 的 `Component` 已经是 VNode

`RouterView.ts` 先合并 route props、attrs、unmount hook 与 `ref` 创建 VNode，再调用
`normalizeSlot(slots.default, { Component: component, route })`。

**课程推导：** slot 是装饰现成 route component VNode 的 seam。不要把 `Component` 当 loader 或
component options 重新执行。

### 2. slot `route` 与当前 view 的匹配来源一致

`routeToDisplay` 取显式 `props.route` 或注入的 `routerViewLocation`；depth、matched record 和 slot
route 都从它推导。

**课程推导：** transition name 与 key 使用 slot `route`，才能和当前 view 真正渲染的位置保持一致。

### 3. RouterView 会跳过没有 components 的 matched record

depth 计算会向后越过没有 `components` 的 route record，再为下一层提供 `depth + 1`。

**课程推导：** slot consumer 不应自行用 `matched[index]` 猜当前 component。复杂 nested route 中，
那会重做并可能做错 RouterView 已完成的 depth 解析。

### 4. 复用实例时 Router 会迁移 component guards

`RouterView` 同时观察 instance、matched record 与 view name。若同一 instance 被新 record 复用，
源码把已有 leave/update guard 集合迁移到新 record，并更新 `record.instances[name]`。

**课程推导：** 无 key 的实例复用是 Router 支持的正常路径；不能为了“保险”给所有 route 加 key。
key 改变实例身份，也会改变 guard 与 lifecycle 行为。

### 5. VNode 真正 unmount 时才清空 record instance

创建 route component VNode 时，RouterView 注册 `onVnodeUnmounted`；只有 VNode component 已
unmounted 才把对应 record instance 清空。KeepAlive 的 deactivation 不等于 unmount。

**课程推导：** 观察 cache 应使用 component ID 与 activated/deactivated hooks，不要从 DOM 暂时不可见
推断实例已销毁。

### 6. `isReady()` 是初始导航结算队列，不是 sleep

router 成功 finalize 后写 `currentRoute` 并 `markAsReady()`；错误则以同一 ready queue reject。
ready 后再次调用会立即 resolve。

**课程推导：** memory router 必须先有真实 initial `push()`，再 await `isReady()`；任意
`nextTick()` 或 timer 都不能替代导航结算。

### 7. 固定测试覆盖 slot、KeepAlive 与 ready 失败路径

`RouterView.spec.ts` 验证 slot 的 Component/route 和 slot 内 KeepAlive；`isReady.spec.ts` 覆盖普通
导航、redirect、guard error、cancelled navigation 与重复调用；`initialNavigation.spec.ts` 则明确
在没有 install/mount 的 memory 测试中手动 push history location。

**课程推导：** B12 Demo 的 ready、slot 与 cache 都应由真实 public seam 产生，不手造 route、VNode
或 ready flag。

源码依据：

- [`RouterView.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/RouterView.ts)
- [`router.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts)
- [`RouterView.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/RouterView.spec.ts)
- [`isReady.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/isReady.spec.ts)
- [`initialNavigation.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/initialNavigation.spec.ts)
- [`onBeforeRouteUpdate.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/guards/onBeforeRouteUpdate.spec.ts)
- [`onBeforeRouteLeave.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/guards/onBeforeRouteLeave.spec.ts)

## 真实常见易错项

| # | 错误方向 | 原因 | 可观察后果 | 正确方向 |
| --- | --- | --- | --- | --- |
| 1 | 把 `KeepAlive` 或 `Transition` 直接包在 `RouterView` 外 | 作用目标变成 RouterView，且 5.2.0 对旧组合有诊断 | cache/transition 没有按 route component 身份工作 | 使用 RouterView slot，在 slot 内组合 |
| 2 | 把 slot `Component` 当 component 定义或 lazy loader | 5.2.0 传入的是已创建 VNode | 重复查 record、破坏 props/ref，甚至误调用 loader | 直接 `<component :is="Component" />` |
| 3 | 忽略 `Component` 可能为空 | 某个 depth/name 可能没有匹配 component | wrapper 对空值做错误属性读取 | 让 dynamic component 自然处理，额外逻辑先判空 |
| 4 | 给所有 route 无条件加 `route.fullPath` key | query/hash 每变一次就产生新身份 | 生命周期重跑、表单 state 丢失或 KeepAlive cache 膨胀 | 默认复用；仅按产品身份选择 `path`/稳定业务 key |
| 5 | 不加 key，却期待同 record params 变化产生 transition | 同类型 VNode 会原位复用 | route 已变化但没有 leave/enter，内部 state 连续 | 需要替换时显式用 `route.path` key |
| 6 | 把 KeepAlive 当状态序列化或全局 store | 它只保留同一 KeepAlive 边界内的 instance | 重建 wrapper 后仍错误期待旧 state 存在 | 用 ID/count 与 lifecycle 证明实例缓存范围 |
| 7 | 把 `deactivated` 当 `unmounted` | cache 离场没有销毁实例 | 重复释放资源或断言 setup 会重跑 | 分别记录 mounted/unmounted 与 activated/deactivated |
| 8 | 把 `mode="out-in"` 当导航等待策略 | mode 只协调 VNode enter/leave | 误以为 push 要等 after-enter 才 resolve | 导航结果与 transition hook 分开记录 |
| 9 | memory router 直接 await `isReady()`，却未发起初始导航 | memory history 不会替 Demo 自动选择初始 URL | ready Promise 没有真实初始导航可结算 | 先 `router.push(initialPath)`，再 await ready |
| 10 | 用 timer/固定 duration 验收过渡，或 reduced motion 下跳过行为 | transition 时间受 CSS、浏览器和偏好影响 | 慢机 flaky，reduce 环境永久等不到预期时间 | 等可见 hooks/final state，并断言 reduce duration 为 0 |

## 高级用法与适用边界

### Route meta 驱动 transition name

官方允许用 `route.meta.transition` 选择 transition name，也可以在 `afterEach` 根据 to/from 关系写入
meta。适合层级明确的前进/后退语义，但 meta 值仍应来自固定 allowlist，不能直接拼进任意 class。

B12 正文可展示短片段；主 Demo 保持一个 `route-fade`，不同时验证多套方向算法。

### KeepAlive include/exclude/max

Vue 官方 `include` / `exclude` 根据 component `name` 匹配，不是 route name；`max` 则限制缓存实例数。
它们适合大型应用制定 cache policy，但会引入命名与淘汰变量。

B12 只在高级说明中指出该边界，不加入主 Demo，也不测试 LRU 淘汰。

### Template ref 与公共 page shell

RouterView slot 允许把 template ref、统一 props 或 slots 放到 route component VNode 上。公共 page shell
可在这里接焦点管理或 page-level instrumentation，但所有 route components 必须共同遵守 contract。

课程不借此建立新的全局 layout API；route props 仍优先使用 L07 已讲的 route `props` 配置。

### Nested RouterView

每个 nested `RouterView` 都有自己的 depth 与 route component。需要多层 transition/cache 时，应在
每个 outlet 的 slot 层分别做决策，不能用一个顶层 key 假定控制所有深度。

B12 Demo 只有单 outlet；nested depth 只作为源码推导，不重讲 L04。

## 实现约束

- 后续 B12 只新增一篇 entry、一个独立 Demo、一个最小 catalog test 与一个专项 E2E；本文不授权
  修改这些实现文件。
- Demo 只使用独立 mini-app、`createMemoryHistory()` 与静态本地 component，不改宿主 router/URL。
- 初始导航必须由真实 `router.push()` + `router.isReady()` 完成，不手造 ready flag。
- 实例身份由 component setup 分配；count 必须存放在 route component 内，不放到外部 store 伪装缓存。
- 所有配置切换与 reset 必须 unmount 旧 mini-app，清理旧 router/app 引用和日志 generation。
- 过渡事件使用 Vue hooks，不使用任意 timer；E2E 只等待可见事件与最终状态。
- route component 保持单一根元素；不引入 `TransitionGroup`、动画库或 Web Animations API。
- 样式沿用现有 token、flex 与 margin/padding；禁止 `grid`、`gap` 和全局样式重排。
- 最少验证只覆盖本文矩阵中的关键对照，不为内部字段或不可能输入堆叠测试。

## 明确 Out of Scope

B12 不包含：

- 修改 catalog/manifest、课程 entry、Demo、E2E、总实施计划或全局样式；
- B13 的 `scrollBehavior`、`savedPosition`、web/hash/memory history 对比、base 与服务器 fallback/404；
- B14 的动态路由、`addRoute/removeRoute`、自定义 RouterLink 或 `useLink()`；
- B15 的类型化路由、文件路由、`vue-router/vite` 与生成声明；
- 全站 route transition、宿主 `App.vue` / layout 改造或页面滚动/焦点管理系统；
- `TransitionGroup`、列表动画、FLIP、第三方动画库、View Transitions API 或 RouterLink
  `viewTransition`；
- `Suspense`、async component fallback、lazy loader retry 或 B10 的 chunk/network 结论；
- SSR/hydration、服务端初始 push、streaming 或 hydration mismatch；
- KeepAlive include/exclude/max 的完整 cache policy、LRU 淘汰、手工 cache 清理或状态持久化；
- nested/named RouterView 的多层动画编排、Teleport、模态路由或手势返回；
- guard failure taxonomy、redirect/cancelled 竞态和错误监控，这些仍由 L11 承担；
- 动画性能基准、GPU layer、帧率、像素截图或确切 duration 断言。

## B12 Stop Boundary

本研究笔记到此停止在 R1-B12 前置研究：

- 已冻结课程 ID、L02/L10/L11 先修、教学目标、唯一 memory-router Demo seam、可观察状态、一个最小
  E2E 路径、10 个易错项、7 条源码推导与高级用法。
- 已核实 slot 的 `Component/route`、`Transition > KeepAlive > route component` 顺序、key 身份、
  初始 `isReady()`、缓存实例状态和 transition events。
- 没有修改 catalog/manifest、课程正文、Demo、E2E、总实施计划或任何运行时代码。
- 没有启动开发服务、打开页面、构建或提交。
- B12 实施前必须重新确认 B11 已独立通过、manifest snapshot、lock 版本与 dirty workspace。
- B12 实施与独立验收完成后必须停下；不得开始 B13“滚动、历史模式与部署”，也不得借过渡研究提前
  修改 scroll/history/deployment 行为。

## 固定来源清单

### Vue Router 官方 Guide / API

- [RouterView slot](https://router.vuejs.org/guide/advanced/router-view-slot)：slot 基本形状、
  KeepAlive/Transition 顺序、props/slots/ref 边界。
- [Transitions](https://router.vuejs.org/guide/advanced/transitions)：route meta、`route.path` key、初始导航
  与 `isReady()`。
- [`RouterView` API](https://router.vuejs.org/api/variables/routerview)：slot 的 Component/route 类型。
- [`Router.isReady()` API](https://router.vuejs.org/api/interfaces/router#isready)：ready Promise 的公开
  contract。
- [Memory mode](https://router.vuejs.org/guide/essentials/history-mode#memory-mode)：memory history 不与 URL
  交互、不会自动触发初始导航。

### Vue 官方文档

- [Transition](https://vuejs.org/guide/built-ins/transition)：单一内容、CSS classes、JavaScript hooks、
  transition modes 与 dynamic component。
- [`Transition` API](https://vuejs.org/api/built-in-components.html#transition)：mode、appear、duration 与
  事件全集。
- [KeepAlive](https://vuejs.org/guide/built-ins/keep-alive)：实例缓存、include/exclude/max 与
  activated/deactivated lifecycle。
- [`KeepAlive` API](https://vuejs.org/api/built-in-components.html#keepalive)：单一 active child、缓存 props
  与 Transition 组合顺序。
- [`key`](https://vuejs.org/api/built-in-special-attributes.html#key)：原位复用与强制替换的身份语义。

### `vuejs/router@v5.2.0` 固定标签

- [`packages/router/src/RouterView.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/RouterView.ts)
- [`packages/router/src/router.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts)
- [`packages/router/__tests__/RouterView.spec.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/RouterView.spec.ts)
- [`packages/router/__tests__/isReady.spec.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/isReady.spec.ts)
- [`packages/router/__tests__/initialNavigation.spec.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/initialNavigation.spec.ts)
- [`packages/router/__tests__/guards/onBeforeRouteUpdate.spec.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/guards/onBeforeRouteUpdate.spec.ts)
- [`packages/router/__tests__/guards/onBeforeRouteLeave.spec.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/guards/onBeforeRouteLeave.spec.ts)

## 结论

B12 的最小教学闭环不是“给 RouterView 加一个 fade class”，而是让同一个独立 memory router 在受控
配置中展示三条互相独立的证据：Router 导航已提交、Vue component instance 被复用/替换/缓存、
Transition leave/enter 已按 hook 结算。

`RouterView` slot 提供的 `Component` 已是 VNode，`route` 是该 view 的 loaded route；正确组合是
`RouterView slot > Transition > KeepAlive > route component`。key 只在需要改变实例身份时使用，
memory router 则必须先 push 初始位置并 await `isReady()` 后 mount。完成这些证据即停，不进入 B13。
