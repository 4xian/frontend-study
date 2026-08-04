# Vue Router R1-B09：路由数据获取调研

> 核验日期：2026-08-04
>
> 适用版本：Vue 3.5.40、Vue Router 5.2.0。
>
> 资料范围：Vue Router 官方 Guide/API、`vuejs/router` 的 `v5.2.0` 固定标签源码与
> 同标签官方测试；取消语义补充 Vue 官方 watcher 文档。外部资料通过 Tavily Search /
> Extract 定位并回到上述一手来源核验。

## 课程定位与冻结边界

本课 Manifest 为 `vue.router.learn.intermediate.route-data-fetching`，直接前置是 L08
`vue.router.learn.intermediate.meta-navigation-guards`。L08 已建立导航守卫与取消/重定向模型，
本课只把异步数据请求放进两种稳定时序中：**导航提交后由页面取数**，以及**导航提交前由守卫
等待取数**。

课程主线冻结为 Vue Router 5.2.0 的稳定 Router/guard/component API：

- 不导入 `vue-router/experimental`，不使用 Data Loader Plugin。
- 不引入 Pinia Colada，也不借 store 掩盖数据所有权和竞态。
- 不把 `beforeRouteEnter` 的 `next(vm => ...)` 当 Composition API 主线；它只用于解释官方旧式
  交接机制与组件实例时机。
- 不在 B09 讲动态 `import()`、route lazy component、chunk 或 `defineAsyncComponent()`；这些属于
  B10，当前仅保持 `planned`。
- 不依赖真实网络延迟或 `setTimeout()` 制造竞态；Demo 使用手动 resolve/reject/abort 的 deferred
  request controller，保证行为可复跑。

固定标签把 Data Loader 实现放在
[`packages/router/src/experimental/data-loaders`](https://github.com/vuejs/router/tree/v5.2.0/packages/router/src/experimental/data-loaders)
下。这足以把它判定为本课稳定验收之外的选读实现，而不是 5.2.0 稳定默认。

### 为什么稳定主线不依赖 Data Loaders / Pinia Colada

这不是否定 Data Loaders 的能力，而是冻结课程依赖与验收层级：

1. 官方示例从 `vue-router/experimental` 导入 `DataLoaderPlugin` 与 `defineBasicLoader()`，Basic
   Loader 页面也直接标明 Data Loaders 仍是 experimental。实验 API 可以观察，不能成为稳定课程
   的必需运行时契约。
2. v5.2.0 `package.json` 把 `./experimental` 与 `./experimental/pinia-colada` 作为独立子路径导出；
   `@pinia/colada`、Pinia 也只是 optional peer dependencies，不是稳定 Router 核心依赖。
3. Data Loader Plugin 会自动收集并在导航守卫中等待 loaders，还同时引入 loading/error、并行、
   去重、SSR、prefetch 等额外语义；Colada Loader 又增加第三方缓存/查询策略。把这些带入 B09 会
   同时改变多个变量，反而遮住本课要观察的 guard queue、页面 watcher 与 latest-wins 责任。
4. 稳定的 `beforeResolve`、guard Promise/return、组件 `watch()` 与 AbortController 已足够完成两种
   UX 和竞态实验。实验 Data Loaders 只保留为课末选读链接，不进入 Demo、测试或验收。

依据：[Data Loaders](https://router.vuejs.org/data-loaders)、
[`defineBasicLoader()`](https://router.vuejs.org/data-loaders/basic)、
[`package.json@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/package.json)。

## 核心结论

Vue Router 官方将两种取数策略都定义为有效选择，决策依据是产品想要的 UX，而不是 API
优劣。导航后取数先改变 URL 并渲染目标页面，再由目标页面显示自己的 loading/error；导航前
取数让用户停留在旧页面，直到守卫中的请求完成，因此 pending/error 指示必须由目标页面之外的
全局层负责。

依据：[Data Fetching](https://router.vuejs.org/guide/advanced/data-fetching)、
[Navigation Guards](https://router.vuejs.org/guide/advanced/navigation-guards)。

### UX 与责任矩阵

| 维度 | 导航后取数 | 导航前取数 |
| --- | --- | --- |
| URL / 当前路由 | 立即变成目标路由 | 请求完成并允许导航前保持旧路由 |
| 首屏内容 | 目标页面立即出现，可显示骨架/loading | 旧页面继续可见，目标页面尚未提交 |
| loading 所有者 | 目标 route component | app shell、顶栏或全局导航状态 |
| error 所有者 | 目标页面的局部错误区 | 全局警告/通知，并明确取消、重定向或继续策略 |
| 取消入口 | 参数 watcher 失效或组件卸载 | 新导航开始时使旧 prefetch 失效；守卫仍必须结算 |
| 数据交付 | watcher 完成后写入当前页面状态 | 守卫先写入按导航身份隔离的 prepared buffer，提交后页面读取 |
| 适合场景 | 页面可先呈现结构，各页面 loading 不同 | 进入页面前数据必须就绪，或失败时不应离开旧页面 |
| 主要代价 | 必须防止旧请求覆盖新参数结果 | 旧页面停留时间变长，需全局进度、失败反馈和悬挂防护 |

两种策略都必须定义“旧请求怎样失效、谁能提交结果、失败后导航怎样结束”。差别只在这些责任
由页面内还是导航层承担。

## 四个入口的准确边界

### `setup()`：创建页面状态，不是导航前守卫

`setup()` / `<script setup>` 在目标组件被创建时运行，适合建立 refs、watcher 与取消清理。它不在
导航确认前的 guard queue 中，不能用来阻止本次进入。导航后模式可以在这里同步创建
`watch(() => route.params.id, ..., { immediate: true })`，让首次进入与同组件参数变化共用一套
请求逻辑。

Vue Router 官方同时强调 `route` 是 reactive 对象，但应侦听真正会改变请求身份的属性，而不是
整个 route。对 `/users/:id` 而言，默认源应是 `() => route.params.id`。

依据：[Vue Router and the Composition API](https://router.vuejs.org/guide/advanced/composition-api)、
[Dynamic Route Matching](https://router.vuejs.org/guide/essentials/dynamic-matching)。

### `watch()`：导航后取数与复用参数更新的默认入口

从 `/users/1` 到 `/users/2` 时，同一个 route record 通常复用同一个组件实例；创建类生命周期不会
重新运行。精确参数 watcher 会在参数变化时重跑，并在下一轮开始前使上一轮副作用失效。

```ts
const route = useRoute()
const loading = ref(false)
const data = ref<User | null>(null)
const error = ref<string | null>(null)

// 监听唯一的请求身份，并在下一轮前终止旧请求。
watch(
  () => route.params.id,
  async (id, _previousId, onCleanup) => {
    const controller = new AbortController()
    onCleanup(() => controller.abort())

    loading.value = true
    data.value = null
    error.value = null

    try {
      const response = await fetch(`/api/users/${String(id)}`, {
        signal: controller.signal,
      })
      data.value = (await response.json()) as User
    } catch (caught) {
      if (!controller.signal.aborted) error.value = String(caught)
    } finally {
      if (!controller.signal.aborted) loading.value = false
    }
  },
  { immediate: true },
)
```

课程 Demo 不应真实调用上述 URL；代码只展示稳定 API 责任。实际实验由 deferred controller
接管 request，并以 token 再做一次“只有当前请求能提交”的身份判断。Abort 能节约支持取消的
底层工作，token 则保证即使 adapter 忽略 Abort，旧结果也不能写回。

### `beforeRouteEnter`：激活组件的进入守卫，没有组件实例

`beforeRouteEnter` 在目标 route component 被激活、但导航尚未确认时执行。此时组件实例尚未
创建，因此不能访问 `this`。官方 Data Fetching 示例通过 `next(vm => ...)` 延后交付：守卫先取得
数据，回调在组件实例挂载后才收到 `vm`。

这不是本课主线，原因有三点：

1. Vue Router 5.x API 已将 guard 的 `next` 参数标记为 deprecated，推荐从 guard return 值。
2. Composition API 只提供 `onBeforeRouteUpdate` / `onBeforeRouteLeave`，没有对应的
   `onBeforeRouteEnter` composable。
3. 同 route record 的参数变化属于 reused component，不属于 entering record；只写
   `beforeRouteEnter` 会漏掉 `/users/1 -> /users/2`。官方取数示例也必须额外写
   `beforeRouteUpdate`。

依据：[Data Fetching](https://router.vuejs.org/guide/advanced/data-fetching)、
[Navigation Guards](https://router.vuejs.org/guide/advanced/navigation-guards)、
[NavigationGuard API](https://router.vuejs.org/api/interfaces/navigationguard)、
[`navigationGuards.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/navigationGuards.ts)。

### `beforeResolve`：导航确认前最后一个全局守卫阶段

完整导航流程中，global `beforeResolve` 位于 async route component、`beforeRouteEnter` 之后，
导航确认之前。它适合统一实现“数据成功才提交导航”的演示，因为它对新进入与同记录参数变化都
会运行，并且可以返回 Promise、`false` 或 redirect。

它也是 global guard，会看到所有导航，因此必须先用明确的 route name/meta 判定是否属于 B09，
不能把所有页面塞进一个无条件 fetch。守卫没有目标组件实例；准备好的数据应写入以
`to.fullPath` 或显式 navigation token 隔离的短生命周期 buffer，组件提交后再消费。

```ts
let activeController: AbortController | undefined

// 只拦截本课的导航前取数路由，并保证每次 guard 都会结算。
router.beforeResolve(async (to) => {
  if (to.name !== 'route-data-before') return

  activeController?.abort()
  const controller = new AbortController()
  activeController = controller
  navigationPending.value = true
  navigationError.value = null

  try {
    const prepared = await requestUser(String(to.params.id), controller.signal)
    if (!controller.signal.aborted) preparedByFullPath.set(to.fullPath, prepared)
  } catch (caught) {
    if (controller.signal.aborted) return
    navigationError.value = String(caught)
    return false
  } finally {
    if (activeController === controller) {
      activeController = undefined
      navigationPending.value = false
    }
  }
})
```

上例中旧 guard 因新导航而 Abort 后返回 `undefined`，随后 Router 自己的 cancellation check 会把旧
导航识别为 cancelled；业务失败则显式 `return false`，保留旧路由并展示全局错误。Demo 还要以
token 检查保护 prepared buffer，不能仅依赖 `AbortController`。

依据：[Navigation Guards](https://router.vuejs.org/guide/advanced/navigation-guards)、
[NavigationGuard API](https://router.vuejs.org/api/interfaces/navigationguard)、
[`router.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts)。

### 时序对照

```text
导航后取数
push -> guards 通过 -> currentRoute 提交 -> 创建/复用组件 -> setup 中 watch 运行
                                                    -> local loading/result/error

导航前取数
push -> 前置守卫 -> beforeRouteEnter -> beforeResolve 等待 request
                                      -> global pending/error
                                      -> 成功后 currentRoute 提交 -> 组件读取 prepared data
```

`beforeRouteEnter` 回调收到实例比 `beforeRouteEnter` 本体晚：官方完整流程把它放在导航确认、
DOM update 之后；`RouterView.ts` 也在 post-flush watcher 中拿到实例后遍历 `enterCallbacks`。

## 取消、失效与提交身份

### watcher 清理的调用时机

Vue 官方说明，watcher 的 cleanup 会在当前 watcher 失效、即将重新运行时调用。Vue 3.5+ 的
`onWatcherCleanup()` 必须在 `watch` 回调或 `watchEffect` effect 的**同步执行期间**注册，不能
放到首个 `await` 之后：

```ts
// 正确：先创建资源、同步登记清理，再进入异步暂停点。
watch(id, async (nextId) => {
  const controller = new AbortController()
  onWatcherCleanup(() => controller.abort())
  await requestUser(nextId, controller.signal)
})
```

回调第三参数 `onCleanup` 绑定到 watcher 实例，不受 `onWatcherCleanup` 的同步限制；但课程仍要求
在创建 request 后立即注册，避免资源在一段异步窗口里没有所有者。组件 setup 中同步创建的
watcher 在卸载时自动停止，停止也会触发其 cleanup。

依据：[Vue Watchers: Side Effect Cleanup](https://vuejs.org/guide/essentials/watchers.html#side-effect-cleanup)、
[Vue Reactivity API: `onWatcherCleanup`](https://vuejs.org/api/reactivity-core.html#onwatchercleanup)。

### Abort 与“只提交最新结果”是两层保证

`controller.abort()` 会通过 `signal` 通知支持 AbortSignal 的 adapter 停止工作，但以下事实不能
省略：

- Vue watcher 不会自动取消 fetch；它只提供 cleanup 注册点。
- Vue Router 将旧导航标记为 cancelled，不等于自动 abort 旧导航启动的业务 Promise。
- adapter 可能不支持 signal，或者完成与 abort 发生在相邻微任务；因此写回前仍要比较
  request token / navigation token。
- `AbortError` 是预期失效，不应显示成用户可见 error；真实 reject 才进入错误状态。
- guard 中的 Promise 最终必须 fulfill、return false/redirect 或 reject；永远 pending 会让导航
  永远无法确认。

`router.ts` 在每段 guard queue 后插入 cancellation check，通过当前 `pendingLocation` 判断是否已有
更新导航；它只决定旧导航结果，不持有也不会调用业务 request 的 AbortController。

### 建议的最小提交条件

对任一 request，只有同时满足以下条件才允许写回：

1. request 仍是该策略记录的 active token；
2. resolve 已将 request 推进为 `resolved`，且该 active token 没有在写回前失效；
3. 导航后模式下，当前 `route.params.id` 仍等于 request id；
4. 导航前模式下，prepared key 仍等于本次 `to.fullPath`，且 Router 后续确实提交了该路由。

Abort 负责尽快停止，身份检查负责最终正确性。两者不能互相替代。

## Deferred Controller 设计

### 目标

控制器不模拟“过一段时间自动完成”，而是把每个请求冻结为可手动控制的记录。学习者可以按任意
顺序点击 resolve/reject，并直接观察旧请求为何不能覆盖新结果。

最小记录模型：

```ts
type FetchStrategy = 'after' | 'before'
type DeferredState = 'pending' | 'resolved' | 'rejected' | 'aborted'

interface DeferredRequest<T> {
  token: number
  strategy: FetchStrategy
  routeId: string
  targetFullPath: string
  state: DeferredState
  signal: AbortSignal
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (reason: Error) => void
  abort: () => void
}
```

这里只需要一个递增 token、一个 request 列表，以及每种策略当前 active token。`resolve`、
`reject`、`abort` 只允许把 `pending` 推进到一个终态；终态按钮禁用即可，不添加重试、缓存、
去重、TTL 或并发池。

### 必须可观察的状态

| 状态 | 页面上必须能回答的问题 |
| --- | --- |
| `router.currentRoute` / 当前 route id | 目标导航已经提交了吗？ |
| target id / target fullPath | 当前想去哪里？ |
| strategy | 请求属于 after 还是 before？ |
| request token | 哪一轮请求拥有提交资格？ |
| request state | pending、resolved、rejected 还是 aborted？ |
| local loading/error/data | 导航后模式的页面责任是什么？ |
| global navigation pending/error | 导航前模式旧页面为何仍可见？ |
| prepared key | 导航前结果准备给哪一个 fullPath？ |
| event log | start、invalidate、abort、resolve/reject、commit 的先后是什么？ |

事件日志只记录确定性事实，例如：

```text
#4 before /users/4 start; current=/users/1
#4 abort because #5 started
#5 before /users/5 resolve
navigation commit /users/5
```

不要把“请求耗时 800ms”作为状态或断言；手动控制本身就是本课的可验证 seam。

### 状态转换

| 当前状态 | 操作 | 下一状态 | 可提交结果 |
| --- | --- | --- | --- |
| pending + active | resolve | resolved | 是，仍需 route/navigation 身份检查 |
| pending + active | reject | rejected | 否，写入对应 local/global error |
| pending + stale | 新请求开始 | aborted | 否 |
| aborted | 迟到 resolve/reject | aborted | 否，记录 ignored 即可 |
| resolved/rejected | 再次操作 | 原终态 | 否，按钮已禁用 |

### 两种策略的最小行为

#### 导航后模式

1. 点击 `/after/1` 后 current route 立即是 `/after/1`，页面显示 local loading。
2. controller 创建 after request；手动 resolve 后只在 token 与 route id 仍匹配时写入 data。
3. pending 时快速切到 `/after/2`，watch cleanup abort `/after/1`，并创建新 token。
4. 对旧 token 执行迟到 resolve 不改变 data；resolve 当前 token 才显示 `/after/2` 数据。
5. reject 当前 token 关闭 loading 并显示页面内 error；Abort 不显示 error。

#### 导航前模式

1. 从已提交的 `/before/1` 点击 `/before/2`，current route 仍是 `/before/1`，app shell 显示
   global pending 与 target `/before/2`。
2. controller 创建 before request；resolve 后 guard 允许继续，Router 才提交 `/before/2`。
3. reject 后 guard `return false`，current route 保持 `/before/1`，全局区域显示失败信息。
4. pending `/before/2` 时再点 `/before/3`，新 guard abort 旧 token；旧 guard 结算但被 Router 识别
   为 cancelled。
5. 旧 token 的迟到 resolve 不能写 prepared buffer，也不能提交 `/before/2`；只有当前 token
   resolve 后可提交 `/before/3`。

### 最小验收断言

1. after pending 时“URL/路由已更新 + 页面 loading”同时成立。
2. before pending 时“旧路由仍在 + 全局 pending + 目标 id 可见”同时成立。
3. 两种模式快速切换 id 后，旧 request 都进入 aborted，旧 resolve 都不能覆盖当前结果。
4. after reject 归属局部 error；before reject 归属全局 error 且导航已结算为未提交。
5. 任意 request 到达终态后不再显示可用的 resolve/reject 控件。
6. 事件日志能按 token 证明 start -> invalidate/resolve/reject -> commit/ignore 顺序。

## Vue Router 5.2.0 源码推导

### 1. `beforeResolve` 是确认前最后一段 guard queue

`router.ts` 的 `navigate()` 依次运行 leave、global beforeEach、update、per-route beforeEnter、
component `beforeRouteEnter`，最后才遍历 `beforeResolveGuards`。`finalizeNavigation()` 只在整个
`navigate()` 成功后执行，因此等待 `beforeResolve` 的 Promise 会阻止 `currentRoute` 提交。

**课程推导：** 导航前模式可把 global pending 暴露给 app shell，并断言 current route 在手动
resolve 前不变。

来源：[`router.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts)、
[`beforeResolve.spec.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/guards/beforeResolve.spec.ts)。

### 2. Router cancellation 不会替业务请求调用 Abort

`pushWithRedirect()` 把最新目标写入 `pendingLocation`；每段 queue 后的
`checkCanceledNavigationAndReject()` 比较旧目标是否仍是 pending。源码只创建 navigation
cancelled failure，没有任何业务 request 或 AbortController 引用。

**课程推导：** 快速发起新导航时，Demo 必须显式 abort 旧 deferred request；Router 的
cancelled 结果只能作为第二层导航身份保护。

来源：[`router.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts)。

### 3. guard 的同步/异步返回最终被统一成 Promise 决策

`navigationGuards.ts` 的 `guardToPromiseFn()` 用 `Promise.resolve(guardReturn)` 兼容同步值和
Promise；`false` 产生 aborted failure，route location 产生 redirect，Error 进入 reject。没有
返回值表示继续。

**课程推导：** `beforeResolve` 可以直接 `await` deferred promise 后 return；业务失败若想保留旧
页面，应收敛到可观察 error 并 `return false`，而不是让 guard 永远 pending。

来源：[`navigationGuards.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/navigationGuards.ts)、
[`guardToPromiseFn.spec.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/guards/guardToPromiseFn.spec.ts)。

### 4. 只有 `beforeRouteEnter` 的 `next(function)` 会进入 enter callback 队列

`guardToPromiseFn()` 仅在存在 route record/name、返回值是 function，且本次捕获的
`enterCallbackArray` 仍是 record 当前数组时保存该回调。新导航会重置数组，旧导航不能把 callback
塞进新导航。

**课程推导：** `next(vm => ...)` 是 Router 对进入组件实例的专用延迟交接，不是任意 guard
return function 的通用数据通道；B09 主线不依赖它。

来源：[`navigationGuards.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/navigationGuards.ts)、
[`beforeRouteEnterCallback.spec.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/guards/beforeRouteEnterCallback.spec.ts)。

### 5. `RouterView` 在实例可用后的 post flush 执行 enter callbacks

`RouterView.ts` 侦听 view instance、matched record 与 view name，使用 `flush: 'post'`。实例存在且
不是同一记录的纯复用时，它遍历 `to.enterCallbacks[name]` 并把实例传给 callback。

**课程推导：** `beforeRouteEnter` 本体绝不能访问实例；callback 交付发生在导航确认与组件创建
之后，也不应被描述为“守卫里已经有 vm”。

来源：[`RouterView.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/RouterView.ts)。

### 6. 组件复用把参数变化交给 update guard / watcher

`extractChangingRecords()` 区分 leaving、updating、entering records；`navigate()` 只从
`enteringRecords` 提取 `beforeRouteEnter`，而 reused records 进入 `beforeRouteUpdate` 队列。
`RouterView.ts` 也会在实例复用到新 record 时复制 update/leave guards。

**课程推导：** `/users/1 -> /users/2` 的稳定页面取数入口是精确参数 watcher；需要守卫语义时
使用 `onBeforeRouteUpdate`。只实现 `beforeRouteEnter` 无法通过快速切换 id 验收。

来源：[`router.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts)、
[`navigationGuards.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/navigationGuards.ts)、
[`RouterView.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/RouterView.ts)、
[`beforeRouteUpdate.spec.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/guards/beforeRouteUpdate.spec.ts)。

## 真实常见易错项

| # | 错误方向 | 原因 | 后果 | 正确方向 |
| --- | --- | --- | --- | --- |
| 1 | 把导航后或导航前写成唯一正确答案 | 忽略官方把两者定义为 UX 选择 | 责任位置与产品体验不匹配 | 先决定何时换 URL/页面，再分配 local/global loading 与 error |
| 2 | 导航后只在 `onMounted` 请求一次 | 参数变化会复用组件，mounted 不重跑 | `/users/2` 仍显示 `/users/1` | setup 中精确 watch `route.params.id`，并设 `immediate: true` |
| 3 | 侦听整个 reactive route | 请求身份其实只由少数字段决定 | query/hash 等无关变化也重发，依赖边界模糊 | watch 精确 getter，必要时使用 source 数组 |
| 4 | 旧请求不 Abort，也不检查 token | 请求可能乱序，adapter 也可能忽略取消 | 慢的旧结果覆盖最新 id | cleanup Abort + active token/route id 双重提交检查 |
| 5 | 在首个 `await` 后调用 `onWatcherCleanup` | 该 API 只认 watcher 的同步执行窗口 | 清理未注册，旧 fetch 继续并可能写回 | 创建 controller 后立即同步注册，再 await |
| 6 | 把 Abort 当业务失败展示 | 快速切换导致的 abort 是预期失效 | 用户看到虚假错误，error 闪烁 | aborted 只记日志/ignored；真实 reject 才显示 error |
| 7 | 只用 `beforeRouteEnter` 处理所有 id | 同 record 参数变化属于 component reuse | 首次进入能取数，后续 id 不更新 | 页面用 watch/update guard；全局 prefetch 可用 beforeResolve |
| 8 | guard 某个分支既不 return 也不结算 deferred | 错误/取消路径漏掉 resolve、reject、false | 导航永久 pending，旧页面无解释地卡住 | 每条路径都 fulfill、return false/redirect 或 throw，并有全局 pending/error |
| 9 | 认为 Router cancelled 会自动 abort fetch | Router 只管理导航 identity，不拥有业务资源 | 旧网络继续，占用资源且可能污染 buffer | 新 guard 显式 abort 旧 controller，写回仍校验 navigation token |
| 10 | 用 experimental Data Loader 或 Pinia Colada 完成主线 | 把实验/第三方抽象提前带入，掩盖稳定 guard/watch seam | B09 无法独立说明 5.2.0 稳定 API 的时序与责任 | 只用 Router guard、Vue watch、AbortController 和最小 deferred controller |

## 建议的单一 Demo seam

使用一个“用户详情路由取数实验台”，共享同一 deferred controller 与同一份用户假数据，只切换
`after` / `before` 策略。这样所有行为差异都来自导航提交时机，而不是两个不相干的业务案例。

### 最小界面区域

1. 当前路由：显示 `current fullPath` 与当前页面 id。
2. 策略选择：`after` / `before` segmented control。
3. 目标导航：id 1、2、3 三个明确操作，不开放任意网络 URL。
4. 页面状态：local loading/data/error，只由 after 模式拥有。
5. 导航状态：global pending/target/error，只由 before 模式拥有。
6. 请求队列：每个 token 显示策略、id、state 和 resolve/reject 控件。
7. 事件日志：显示 abort、ignored stale result 与 navigation commit。

### 实现约束

- 只用 flex 与明确 margin/padding，禁用 CSS grid 与 `gap`。
- 390px 视口保持单列，按钮文字不截断；长 fullPath 与日志允许换行。
- request 控件有稳定尺寸，终态禁用；状态变化不能挤压导航操作区。
- pending/error 使用可见文本与 `aria-live="polite"`，不靠颜色或 hover 单独表达。
- 不启动真实 HTTP 服务，不使用 timer，不把 wall-clock 时间写进断言。
- 最小验证只覆盖上文 6 条验收断言，不为 controller 的不可能输入堆叠测试。

## B09 Stop Boundary

本研究笔记到此停止在 R1-B09：

- 本课可以规划稳定 guard/watch + deferred controller 的实现与最小验证。
- 本课不实现或讲解 route lazy loading、动态 import、chunk 缓存、preload、
  `defineAsyncComponent()` 或构建产物。
- 本课不进入 `vue-router/experimental`，不引入 Pinia Colada。
- B10“路由懒加载”保持 `planned`；只有 B09 单独验收完成后，后续任务才能开始 B10。

## 固定来源清单

### Vue Router 官方 Guide / API

- [Data Fetching](https://router.vuejs.org/guide/advanced/data-fetching)：导航后/前两种策略、页面内
  loading，以及导航前的全局进度与错误责任。
- [Navigation Guards](https://router.vuejs.org/guide/advanced/navigation-guards)：完整导航解析顺序、
  `beforeResolve`、`beforeRouteEnter`、组件复用与 guard 返回语义。
- [Vue Router and the Composition API](https://router.vuejs.org/guide/advanced/composition-api)：
  reactive route 的精确属性 watch，以及 Composition API 的 update/leave guards。
- [Dynamic Route Matching](https://router.vuejs.org/guide/essentials/dynamic-matching)：同 route record
  参数变化的组件复用与 watch / `onBeforeRouteUpdate` 选择。
- [NavigationGuard API](https://router.vuejs.org/api/interfaces/navigationguard)：guard 的 awaitable
  return 类型，以及 `next` 参数 deprecated 状态。
- [Data Loaders](https://router.vuejs.org/data-loaders)：Plugin 自动收集/等待 loader、功能范围，以及
  Basic / Colada 两类实现的关系。
- [`defineBasicLoader()`](https://router.vuejs.org/data-loaders/basic)：Data Loaders 的 experimental
  状态与 `vue-router/experimental` 导入路径。

### Vue 官方取消语义

- [Watchers: Side Effect Cleanup](https://vuejs.org/guide/essentials/watchers.html#side-effect-cleanup)：
  AbortController、watcher invalidation、`onWatcherCleanup` 与回调参数 `onCleanup` 的约束。
- [Reactivity API: `onWatcherCleanup`](https://vuejs.org/api/reactivity-core.html#onwatchercleanup)：
  cleanup 注册时机与类型。

### vuejs/router v5.2.0 固定标签

- [`packages/router/src/router.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts)：
  guard queue、`beforeResolve`、pending navigation cancellation 与 final commit。
- [`packages/router/src/navigationGuards.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/navigationGuards.ts)：
  guard-to-Promise 适配、enter callback identity 与 component guard extraction。
- [`packages/router/src/RouterView.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/RouterView.ts)：
  reused instance guard 复制与 post-flush enter callback。
- [`packages/router/package.json`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/package.json)：
  `./experimental`、`./experimental/pinia-colada` 独立导出，以及 Pinia Colada 的 optional peer
  dependency 边界。
- [`beforeResolve.spec.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/guards/beforeResolve.spec.ts)：
  global beforeResolve 的固定标签测试。
- [`guardToPromiseFn.spec.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/guards/guardToPromiseFn.spec.ts)：
  guard 返回、abort、redirect 与 Promise 适配测试。
- [`beforeRouteEnterCallback.spec.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/guards/beforeRouteEnterCallback.spec.ts)：
  enter callback 与实例交付测试。
- [`beforeRouteUpdate.spec.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/guards/beforeRouteUpdate.spec.ts)：
  reused component 的 update guard 测试。
- [`experimental/data-loaders`](https://github.com/vuejs/router/tree/v5.2.0/packages/router/src/experimental/data-loaders)：
  仅用于确认实验边界，不进入 B09 稳定验收。

## 结论

B09 应把“数据放在哪里”改写为“导航何时提交、谁拥有 pending/error、旧请求怎样失效、谁拥有
最终写回资格”。导航后模式由 setup 中的精确参数 watcher 管理局部状态；导航前模式由
`beforeResolve` 等待 deferred request，并让 app shell 管理全局状态。两者都使用 AbortController
加 token 检查，且都必须让每一轮异步工作到达确定终态。这个单一实验台已足以覆盖 L09，不需要
experimental loader、Pinia Colada，也不应提前进入 B10。
