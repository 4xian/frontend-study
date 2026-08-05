# Pinia 4.0.2 课程 P0 官方调研与 P01-P05 实施冻结

> 状态：`P0 / research-and-plan-only`
>
> 查证日期：2026-08-04（Asia/Shanghai）
>
> 本地安装与 lockfile 解析版本：`pinia@4.0.2`
>
> 依赖声明：`package.json` 使用 `^4.0.2`，不是严格 pin
>
> 固定 tag：[`v4.0.2`](https://github.com/vuejs/pinia/releases/tag/v4.0.2)
>
> 固定 commit：[`ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1`](https://github.com/vuejs/pinia/commit/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1)
>
> 课程 manifest：`src/content/catalog/manifests/vue-pinia-track.ts`
>
> Manifest SHA-256：`903e8126486d2abbb3bf177f380408853987e26195417ef3a63fbfda86a8825f`

## P0 结论

1. 现有 14 课的 ID、标题、阶段和顺序保持不变，不在实施时临时插课、合课或调序。
2. 五个课程批次冻结为 `P01=1-4`、`P02=5-6`、`P03=7-10`、`P04=11-12`、
   `P05=13-14`。每批内可同时准备，但只能在该批全部课程、唯一 Demo 与 Gate 一起通过后
   原子发布，不展示半完成课程。
3. 每课使用一个唯一 Demo，每个 Demo 自行创建 Pinia 实例，不读写宿主应用的 Pinia、路由、
   `localStorage` 或全局订阅。卸载时必须停止订阅、计时器、存储监听、临时 mini-app 与挂载节点。
4. 课程中的归纳必须分成“官方公开契约”、“固定 4.0.2 源码/测试推导”和“应用建模建议”。
   第 8 课的 Store 职责划分是建模建议，不得写成 Pinia 强制分层标准。
5. SSR、Hydration、HMR 和 Devtools 不得用当前 Vite SPA 的固定文本或截图冒充真实运行证据。
   实施时可用确定性模型教学状态隔离与水合顺序，但必须在正文和验收中标明证据边界。
6. `@pinia/testing`、`@pinia/nuxt` 和第三方持久化插件都是独立 package，不属于根 `pinia`
   入口。P04/P05 可讲清其使用和责任边界，但本路线不自动安装新依赖。
7. P0 只交付本文、Pinia Reference RA0 文档和实施计划状态登记；不创建课程正文、
   Demo、Reference、索引或测试。

## 版本与证据口径

| 证据 | 冻结值 | 用途 |
| --- | --- | --- |
| 根 `package.json` | `pinia: ^4.0.2` | 只说明允许范围，不称为精确 pin |
| `package-lock.json` | 解析 `pinia@4.0.2` | 当前本地实施版本 |
| Pinia release | `v4.0.2` | 发布说明与 tarball 边界 |
| Pinia commit | `ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1` | 所有源码与上游测试链接的固定点 |
| 本地 Vue | `3.5.40` | Demo 运行基线 |
| 本地 Vue Router | `5.2.0` | 第 10 课路由集成基线 |

官网 Guide 和 API 页作为当前公开说明入口，但官网页头与部分 edit/changelog 链接仍带
`v3.x`/`v3` 信息。版本敏感结论必须交叉固定 4.0.2 commit 的源码和测试，不使用浮动
`main` 链接支撑行为承诺。

## 课程顺序与前置

| 序号 | 批次 | 课程 ID 后缀 | 标题 | 课内前置 |
| ---: | --- | --- | --- | --- |
| 1 | P01 | `setup-first-store` | 建立第一个 Store | Vue 应用与组件基础 |
| 2 | P01 | `state-patch-reset` | State、Patch 与 Reset | 1 |
| 3 | P01 | `getters` | Getters | 1-2 |
| 4 | P01 | `actions-async` | Actions 与异步流程 | 1-3 |
| 5 | P02 | `component-store-to-refs` | 组件接入与 storeToRefs | 1-4 |
| 6 | P02 | `setup-stores` | Setup Store | 1-5 |
| 7 | P03 | `store-composition` | Store 组合 | 1-6 |
| 8 | P03 | `store-modeling` | Store 建模 | 1-7 |
| 9 | P03 | `subscriptions-actions` | 状态与 Action 订阅 | 1-8 |
| 10 | P03 | `outside-components-router` | 组件外使用与路由集成 | 1-9，Vue Router 基础 |
| 11 | P04 | `plugins-persistence` | 插件与持久化边界 | 1-10 |
| 12 | P04 | `store-testing` | Store 测试 | 1-11，Vitest 基础 |
| 13 | P05 | `ssr-hydration` | SSR 与 Hydration | 1-12，Vue SSR/Hydration 基础 |
| 14 | P05 | `hmr-devtools-maintenance` | HMR、Devtools 与维护 | 1-13 |

## 正文与 Demo 通用 contract

### 课程正文

每课必须包含：明确目标、前置、最小正确用法、运行时边界、5-10 个结构化易错点、至少
2 条编号源码/测试推导、官方 Guide/API 和固定 commit 来源。示例不得导入 internal、
deprecated 或不存在的根入口。不得把 Devtools 展示、经验性分层或第三方插件行为写成
Pinia 核心公开契约。

### Demo 隔离与清理

1. 每个 Demo 使用唯一完整 ID，放在
   `src/content/demos/vue/pinia/learn/<stage>/<course>/`，并由现有 registry 同时加载 `.vue`
   组件和同文件 `?raw` 源码。完整 ID 固定为
   `vue.pinia.learn.<stage>.<course>.<demo>`。
2. 每个 Demo 内部创建独立 `createPinia()`；需要真实插件安装、组件 scope 或路由注入时，
   创建仅属于 Demo 的 mini-app 和挂载节点。
3. Demo 卸载必须调用已保存的 unsubscribe、清理 timer/listener/observer、卸载 mini-app、
   删除临时节点，并在适用时执行 `store.$dispose()` 或 `disposePinia()`。
4. 如果 Demo 使用持久化媒介，只允许带版本的 Demo 专用 key，且重置/卸载后恢复基线；
   不读写宿主 theme/progress 存储。

### 可观察与浏览器验证

每个交互 Demo 至少显示当前状态、最后操作/结果、确定性计数器和有界时间线。不使用墙钟时间、
网络速度或随机值作为通过条件。交互必须可以键盘完成，在 390px、200% 文本和
`prefers-reduced-motion: reduce` 下不溢出，不使用项目禁止的 CSS `grid` 或 `gap`。

SSR/Hydration 只能验证 Demo 中的序列化/恢复模型和隔离不变式；如果没有真实 server/client fixture，
必须写为 `Deferred/not-run`。HMR 必须由真实 Vite hot update 或固定上游测试支撑；Devtools 必须由
真实 Devtools 集成支撑。普通 SPA 截图不得替代这三类证据。

## 14 课逐项实施计划

### L01 建立第一个 Store

- 完整 ID：`vue.pinia.learn.basics.setup-first-store`
- 批次：P01；状态由 `planned` 切为 `available` 时必须与 P01 其余三课同批通过。
- 唯一 Demo：`vue.pinia.learn.basics.setup-first-store.pinia-first-store-lab-demo`
- 目标：区分 `createPinia()`、`app.use(pinia)`、`defineStore()` 和首次 `useStore()` 的所有权与时机。
- Demo seam：独立 mini-app 安装自有 Pinia，显示定义后/首次调用后 registry 大小、store ID、
  state 和组件交互计数；宿主 URL 与宿主 Pinia 不变。
- 易错边界：不在 `app.use(pinia)` 前使用隐式 active Pinia；store ID 全局唯一；
  `defineStore()` 返回工厂而非已创建实例；不把组件卸载写成 store 自动销毁。
- 源码推导：`createPinia.ts` 将 effect scope、root state、plugin queue 和 store registry 挂在 Pinia
  实例上；`store.ts` 在首次 `useStore()` 时创建并注册 store。
- 一手来源：[Getting Started](https://pinia.vuejs.org/getting-started.html)、
  [Defining a Store](https://pinia.vuejs.org/core-concepts/)、
  [`createPinia.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/createPinia.ts)、
  [`store.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts)。

### L02 State、Patch 与 Reset

- 完整 ID：`vue.pinia.learn.basics.state-patch-reset`
- 批次：P01；前置：L01。
- 唯一 Demo：`vue.pinia.learn.basics.state-patch-reset.pinia-state-mutation-lab-demo`
- 目标：对比直接赋值、`$patch(object)`、`$patch(fn)`、`$state =` 和 `$reset()` 的真实语义。
- Demo seam：对同一独立 Options Store 执行五种操作，显示 mutation type、payload、订阅次数和
  重置后状态；函数 patch 只包含同步修改。
- 易错边界：直接赋值是合法用法；`$state =` 内部仍是 patch，不替换 reactive object；
  `$patch(fn)` 不容纳异步操作；自动 `$reset()` 只属于 Options Store，Setup Store 需自行实现。
- 源码推导：`$patch` 在一次事务内暂停常规 watcher 通知后手动发出一次 mutation；
  Options Store `$reset()` 重新执行 state factory 再进行函数 patch。
- 一手来源：[State](https://pinia.vuejs.org/core-concepts/state.html)、
  [`store.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts)、
  [`state.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/state.spec.ts)、
  [`store.patch.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/store.patch.spec.ts)。

### L03 Getters

- 完整 ID：`vue.pinia.learn.basics.getters`
- 批次：P01；前置：L01-L02。
- 唯一 Demo：`vue.pinia.learn.basics.getters.pinia-getter-dependency-lab-demo`
- 目标：使用 getter 表达缓存派生值，区分 state 参数、`this`、其他 getter 和其他 store 依赖。
- Demo seam：以确定性求值计数器对比多次读取、相关 state 变更、无关 state 变更与跨 store 依赖；
  不用性能时长作为证据。
- 易错边界：getters 是 computed；使用 `this` 访问其他 getter 时 TypeScript 需显式返回类型；
  不在 getter 里执行副作用；不把跨 store 读取写成非响应式快照。
- 源码推导：Options getter 会被包装为 computed；通过 active Pinia 取得其他 store 后仍保留响应式依赖。
- 一手来源：[Getters](https://pinia.vuejs.org/core-concepts/getters.html)、
  [`getters.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/getters.spec.ts)、
  [`store.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts)。

### L04 Actions 与异步流程

- 完整 ID：`vue.pinia.learn.basics.actions-async`
- 批次：P01；前置：L01-L03。
- 唯一 Demo：`vue.pinia.learn.basics.actions-async.pinia-action-lifecycle-lab-demo`
- 目标：用 action 封装同步/异步业务流程，观察返回值、抛错、Promise rejection、`after` 和
  `onError`。
- Demo seam：使用手动 deferred gate 而不是真实网络，分别完成 success、sync throw 和 async reject，
  显示 action 参数、顺序、返回值和错误归属。
- 易错边界：Options action 使用方法语法保留 `this`；调用方必须处理 rejection；`after` 等待
  Promise resolve，`onError` 同时覆盖同步抛错与 Promise reject；不隐藏 stale request 竞态。
- 源码推导：action wrapper 在返回 Promise 时延迟 `after`，并把 rejection 送入 error callbacks；
  同步抛错在调用 error callbacks 后继续抛出。
- 一手来源：[Actions](https://pinia.vuejs.org/core-concepts/actions.html)、
  [`actions.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/actions.spec.ts)、
  [`onAction.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/onAction.spec.ts)。

### L05 组件接入与 storeToRefs

- 完整 ID：`vue.pinia.learn.basics.component-store-to-refs`
- 批次：P02；前置：L01-L04。
- 唯一 Demo：`vue.pinia.learn.basics.component-store-to-refs.pinia-store-to-refs-lab-demo`
- 目标：区分直接访问 store、直接解构、`storeToRefs()` 和 action 解构的响应性语义。
- Demo seam：并列显示直接解构快照、`storeToRefs()` 返回的 state/getter refs、可解构 action 和
  一个插件注入的响应式/非响应式字段；所有区域由同一操作更新。
- 易错边界：直接解构 state/getter 会丢失与 store 的响应联系；actions 可直接解构；
  `storeToRefs()` 忽略 actions 和非响应式属性；不为取 ref 而复制一份 state。
- 源码推导：`storeToRefs()` 在 raw store 的键上检查 computed 或 ref/reactive 值，不遍历 action；
  固定测试还确认调用本身不会立即求值 getter。
- 一手来源：[Using the store](https://pinia.vuejs.org/core-concepts/#using-the-store)、
  [`storeToRefs()`](https://pinia.vuejs.org/api/pinia/functions/storeToRefs.html)、
  [`storeToRefs.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/storeToRefs.ts)、
  [`storeToRefs.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/storeToRefs.spec.ts)。

### L06 Setup Store

- 完整 ID：`vue.pinia.learn.intermediate.setup-stores`
- 批次：P02；前置：L01-L05。
- 唯一 Demo：`vue.pinia.learn.intermediate.setup-stores.pinia-setup-store-contract-lab-demo`
- 目标：把 `ref/reactive`、`computed` 和 function 分别建模为 state、getter 和 action，并理解 Setup
  Store 的公开返回面。
- Demo seam：对照 Options Store 与 Setup Store 的 state/getter/action、手写 reset、store 内 watcher 和
  组件卸载后状态；通过显式 dispose 证明 store scope 的结束点。
- 易错边界：必须返回所有应由 Pinia 管理的 state；隐藏或只返回 readonly state 会破坏 SSR、
  Devtools 和 plugin；Setup Store 没有内建 `$reset()`；store 内 watch 不随任意消费组件卸载。
- 源码推导：Setup Store 创建器依据返回值的 ref/reactive、computed 和 function 形态建立 store；
  返回面同时是序列化、Devtools 和插件可见面。
- 一手来源：[Setup Stores](https://pinia.vuejs.org/core-concepts/#setup-stores)、
  [Dealing with Composables](https://pinia.vuejs.org/cookbook/composables.html)、
  [`store.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts)、
  [`storeSetup.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/storeSetup.spec.ts)。

### L07 Store 组合

- 完整 ID：`vue.pinia.learn.intermediate.store-composition`
- 批次：P03；前置：L01-L06。
- 唯一 Demo：`vue.pinia.learn.intermediate.store-composition.pinia-store-composition-lab-demo`
- 目标：在 getter、action 和 Setup Store 中组合其他 store，同时避免 setup 顶层的循环即时读取。
- Demo seam：使用 cart/session 两个独立职责 store，显示 computed 跨 store 派生值、action 协调和
  一个只在用户操作时才读取对方状态的循环边界。
- 易错边界：两个 Setup Store 不得在 setup 顶层同时立即读取对方 state；将读取推迟到
  computed 或 action；SSR 异步 action 在首个 `await` 前取得所有需要的 store；不创建一个无边界总 store。
- 源码推导：`useStore()` 依赖当前 active Pinia 或显式实例；跨 store getter 的 computed 依赖可以
  自动跟踪，而 setup 创建期即时互读会形成顺序问题。
- 一手来源：[Composing Stores](https://pinia.vuejs.org/cookbook/composing-stores.html)、
  [`combinedStores.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/combinedStores.spec.ts)、
  [`getters.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/getters.spec.ts)。

### L08 Store 建模

- 完整 ID：`vue.pinia.learn.intermediate.store-modeling`
- 批次：P03；前置：L01-L07。
- 唯一 Demo：`vue.pinia.learn.intermediate.store-modeling.pinia-store-responsibility-lab-demo`
- 目标：根据所有权、生命周期和跨视图复用性决定状态是否属于 store，并按业务职责划分
  多个 store。
- Demo seam：在一个确定性任务场景中切换“组件本地 UI 状态”、“跨组件业务状态”和
  “服务端派生/缓存状态”的归属方案，显示组件重挂载后哪些状态保留。
- 易错边界：Pinia 只建议 store 承载全局/跨页面状态和业务逻辑，并没有强制分层规则；
  不把短命表单打开态、hover 或纯展示状态搬入 store；不把后端缓存完全复制为客户端真相。
- 源码推导：store registry 属于 Pinia 而非组件，所以跨路由状态共享与组件生命周期
  必须分开设计；本课的职责判断是应用建模，不是新 runtime API。
- 一手来源：[What is a Store?](https://pinia.vuejs.org/getting-started.html#what-is-a-store)、
  [`rootStore.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/rootStore.ts)、
  [`rootState.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/rootState.spec.ts)。

### L09 状态与 Action 订阅

- 完整 ID：`vue.pinia.learn.intermediate.subscriptions-actions`
- 批次：P03；前置：L01-L08。
- 唯一 Demo：`vue.pinia.learn.intermediate.subscriptions-actions.pinia-subscription-lifecycle-lab-demo`
- 目标：分别使用 `$subscribe()` 和 `$onAction()`，理解 mutation/action 事件、flush 时机、
  detached 与 unsubscribe 的生命周期。
- Demo seam：独立 mini-app 中同时注册组件 scope 订阅和 detached 订阅，通过 direct/
  patch object/patch function/action success/action error 展示事件次数与顺序；卸载后再修改一次。
- 易错边界：`$subscribe` 默认使用 Vue `watch()` 的 `pre` flush，可显式选择 `sync` 或 `post`；
  `$patch()` 的聚合通知不受该 flush 选项影响，patch 只应触发一次订阅回调；组件 scope 订阅默认随
  卸载清理，持久监听需 `{ detached: true }`；`$onAction` 的 detached 是第二个布尔参数。
- 源码推导：两类 API 都返回注销函数；`store.$dispose()` 停止 store scope、清空两类订阅并
  移除 registry 实例，但不删除 root state。
- 一手来源：[State subscriptions](https://pinia.vuejs.org/core-concepts/state.html#subscribing-to-the-state)、
  [Action subscriptions](https://pinia.vuejs.org/core-concepts/actions.html#subscribing-to-actions)、
  [`subscriptions.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/subscriptions.ts)、
  [`subscriptions.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/subscriptions.spec.ts)、
  [`onAction.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/onAction.spec.ts)。

### L10 组件外使用与路由集成

- 完整 ID：`vue.pinia.learn.intermediate.outside-components-router`
- 批次：P03；前置：L01-L09 和 Vue Router 基础。
- 唯一 Demo：`vue.pinia.learn.intermediate.outside-components-router.pinia-outside-component-context-lab-demo`
- 目标：在路由守卫与其他组件外场景中选择正确的 `useStore()` 调用时机，并理解 SPA 与
  SSR 的实例传递差异。
- Demo seam：使用独立 memory router 和 mini-app，对比模块评估时的过早取 store、守卫函数内
  延迟取 store 和显式 `useStore(pinia)`；宿主课程 URL 保持不变。
- 易错边界：SPA 中在 `app.use(pinia)` 后调用；路由守卫内再取 store，避免 import 时过早创建；
  SSR 组件外显式传入当前请求 Pinia；不依赖进程级 active Pinia 隔离并发请求。
- 源码推导：`useStore()` 优先使用显式参数或当前注入上下文，再退回 active Pinia；
  固定 SSR 测试证明两个应用可以持有相同 store ID 但不同 state。
- 一手来源：[Outside component usage](https://pinia.vuejs.org/core-concepts/outside-component-usage.html)、
  [SSR](https://pinia.vuejs.org/ssr/)、
  [`createPinia.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/createPinia.ts)、
  [`ssr.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/ssr.spec.ts)。

### L11 插件与持久化边界

- 完整 ID：`vue.pinia.learn.advanced.plugins-persistence`
- 批次：P04；前置：L01-L10。
- 唯一 Demo：`vue.pinia.learn.advanced.plugins-persistence.pinia-plugin-persistence-boundary-lab-demo`
- 目标：理解 `pinia.use()` 的注册时机、plugin context、自定义属性/state 与清理责任，并将
  持久化明确定义为插件/应用策略。
- Demo seam：独立 mini-app 在安装 Pinia 前注册自有 plugin，在安装后创建 store；显示 plugin
  执行次数、注入属性、`$state` 内持久化 state、版本化 Demo 存储和重置结果。
- 易错边界：plugin 只作用于注册后且 Pinia 已安装后创建的 store；需参与 Devtools/SSR
  的 plugin state 同时进入 store 与 `$state`；默认 `$reset()` 不重置 plugin state；不持久化密钥、
  token 或无版本不兼容数据。
- 源码推导：`createPinia()` 在安装前排队 plugin，安装时再并入实际 plugin 列表；
  plugin 在 store active 之前执行，其初始化修改不会被普通 store 订阅当作后续 mutation。
- 一手来源：[Plugins](https://pinia.vuejs.org/core-concepts/plugins.html)、
  [`createPinia.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/createPinia.ts)、
  [`storePlugins.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/storePlugins.spec.ts)。

### L12 Store 测试

- 完整 ID：`vue.pinia.learn.advanced.store-testing`
- 批次：P04；前置：L01-L11 和 Vitest 基础。
- 唯一 Demo：`vue.pinia.learn.advanced.store-testing.pinia-testing-semantics-lab-demo`
- 目标：区分使用真实 `createPinia()` 的 store 业务测试与使用 `createTestingPinia()` 的组件隔离测试。
- Demo seam：不在宿主运行时导入未安装的 `@pinia/testing`；用确定性交互面板模型展示
  “真实 action”、“默认 stub action”、`stubActions:false`、`initialState`、`stubPatch` 和 `stubReset`
  的结果矩阵；真实依赖行为由 Vitest 测试而非模型文本证明。
- 易错边界：每个测试创建新 Pinia；`createTestingPinia()` 默认 stub 全部 actions；
  `stubActions:false` 执行真实逻辑但仍包装 spy；`initialState` 在 store 创建后合并；需 app install
  的 plugin 使用 `fakeApp`。
- 源码推导：Testing Pinia 在 store 创建链中包装 action、`$patch` 和 `$reset`；它是组件
  隔离工具，不自动等于真实业务逻辑已测试。
- 一手来源：[Testing stores](https://pinia.vuejs.org/cookbook/testing.html)、
  [`testing.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/testing/src/testing.ts)、
  [`testing.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/testing/src/testing.spec.ts)、
  [`lifespan.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/lifespan.spec.ts)。
- 依赖边界：P04 实施前先检查项目是否已安装 `@pinia/testing`。未安装时不自动修改
  `package.json`/lockfile；课程只能提供固定官方签名与模型，真实 testing fixture 需单独批准。

### L13 SSR 与 Hydration

- 完整 ID：`vue.pinia.learn.advanced.ssr-hydration`
- 批次：P05；前置：L01-L12 和 Vue SSR/Hydration 基础。
- 唯一 Demo：`vue.pinia.learn.advanced.ssr-hydration.pinia-ssr-hydration-model-lab-demo`
- 目标：建立“每请求独立 Pinia -> 防 XSS 序列化 -> 客户端首次 `useStore()` 前恢复 root
  state -> Option/Setup Store 分别水合”的顺序契约。
- Demo seam：在当前 SPA 中只做确定性内存模型：两个模拟 request 各自创建 Pinia，产生两份
  root state，分别在首次创建 store 前/后恢复，并对比 `skipHydrate()` 标记值。
- 易错边界：每个 app/request 新建 Pinia；SSR 组件外显式传实例；服务端 root state
  必须防 XSS，官方推荐 `devalue`；客户端在任何 `useStore()` 前写入 root state；
  `skipHydrate()` 只用于 Setup Store 中不应水合的有状态对象。
- 源码推导：Setup Store 创建时把 initial state 合并进 ref/reactive；`shouldHydrate()` 检查
  `skipHydrate()` 标记；Options Store 的特殊 composable 恢复通过 `hydrate(state, initialState)` 成员。
- 一手来源：[SSR](https://pinia.vuejs.org/ssr/)、
  [Composables SSR](https://pinia.vuejs.org/cookbook/composables.html#ssr)、
  [`ssr.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/ssr.spec.ts)、
  [`state.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/state.spec.ts)。
- 证据限制：该 Demo 只能证明顺序模型与状态隔离，不能声称已完成真实 Node SSR、HTML 注入、
  CSP 或浏览器 hydration 验证。没有独立 server/client fixture 时必须报告 `Deferred/not-run`。

### L14 HMR、Devtools 与维护

- 完整 ID：`vue.pinia.learn.advanced.hmr-devtools-maintenance`
- 批次：P05；前置：L01-L13。
- 唯一 Demo：`vue.pinia.learn.advanced.hmr-devtools-maintenance.pinia-store-lifecycle-maintenance-lab-demo`
- 目标：区分 `store.$dispose()`、`disposePinia()`、HMR state shape reconciliation 与 Devtools 开发期能力。
- Demo seam：在独立 Pinia 中展示组件卸载、store dispose、重新 `useStore()` 和 Pinia dispose 的
  registry/root-state/订阅差异；HMR 和 Devtools 只显示“需要外部真实证据”的状态，不伪造事件。
- 易错边界：`store.$dispose()` 不删除 root state，重新使用会创建新实例并复用旧 state；
  `disposePinia()` 清空 stores/plugins/root state 后实例不可复用；HMR 仅开发态，Store ID 变更会
  invalidate；不承诺 `$subscribe`/`$onAction` 跨 HMR 保持。
- 源码推导：`acceptHMRUpdate()` 在 production 返回 no-op，官网只正式给出 Vite 用法；
  固定 `hmr.spec.ts` 对订阅保持仍有两个 `it.todo`；固定 Devtools 专用测试不是完整 UI 覆盖。
- 一手来源：[HMR](https://pinia.vuejs.org/cookbook/hot-module-replacement.html)、
  [`$dispose()`](https://pinia.vuejs.org/api/pinia/interfaces/StoreWithState.html#dispose)、
  [`disposePinia()`](https://pinia.vuejs.org/api/pinia/functions/disposePinia.html)、
  [`hmr.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/hmr.ts)、
  [`hmr.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/hmr.spec.ts)、
  [`devtools.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/devtools.spec.ts)。
- 证据限制：生命周期面板可用普通 SPA 验证；HMR 需真实 Vite hot update，Devtools 需真实客户端。
  两者未运行时报告 `Deferred/not-run`，不以面板文本冒充 green。

## P01-P05 批次与 Gate

### P01：Store 核心（L01-L04）

1. 先在公开 `learningCatalog` seam 中写一个 focused 顺序断言，预期前 4 课为 `available`、
   L05-L14 仍为 `planned`，并且每课只有唯一对应 Demo ID。
2. 在实现前运行同一 focused spec，必须因当前只有 planned manifest 而红。不使用内部数组、
   basename 或文件存在性冒充公开 seam。
3. 新增 L01-L04 正文与四个唯一 Demo，再将四课同批改为 `available`；不修改 L05-L14、
   Pinia Reference、搜索 UI 或共享 schema。
4. 复跑同一 focused spec 得到 green，再运行本批 entry/template/registry 相关 Vitest、type-check、
   触及文件 lint/Prettier 和 whitespace Gate。
5. 复用现有 `localhost:5173`，用一条 Playwright 路径依次覆盖四个 Demo 的关键交互、键盘、
   390px、200% 文本、reduced motion、宿主 URL 隔离、水平溢出和 console/pageerror。
6. P01 全部 Gate 通过后停止，不自动开始 P02。

### P02：组件与 Setup Store（L05-L06）

- 将 focused 顺序断言扩展到前 6 课，先因缺少 L05-L06 建立红灯，再最小实现转绿。
- 新增两篇正文与两个 Demo；L07-L14 继续 `planned`，不修改 P01 正文和 Demo。
- 浏览器必须额外证明直接解构快照不再跟随、`storeToRefs()` 仍更新、Setup Store 卸载后
  state/store watcher 不被误销毁，显式 dispose 后才结束。
- 完成 P02 Gate 后停止，不进入 Store 组合。

### P03：组合、建模、订阅与路由（L07-L10）

- focused seam 以前 10 课 `available`、L11-L14 `planned` 建立红/绿；不改用内部注册表。
- 四个 Demo 中只有 L10 创建独立 memory router，不修改宿主 Router；所有订阅与 mini-app 在卸载时清理。
- 浏览器重点证明循环依赖被推迟、本地/全局状态重挂载差异、component/detached 订阅寿命以及
  守卫内取 store 不污染宿主 URL。
- P03 通过后停止，不进入 plugin/testing。

### P04：插件与测试（L11-L12）

- focused seam 以前 12 课 `available`、L13-L14 `planned` 建立红/绿。
- L11 使用 Demo 专用版本化存储，不引入持久化 package；卸载后无 listener、timer、storage 残留。
- L12 未获批安装 `@pinia/testing` 时，不伪造 runtime import。正文与上游测试可解释其契约，
  项目内真实 behavior 证据标明 `Deferred/not-run`。
- P04 通过后停止，不进入 SSR/HMR。

### P05：SSR、Hydration、HMR 与 Devtools（L13-L14）

- focused seam 先期待 14 课全部 `available` 而红，实现后断言顺序零差异、下一课为空。
- L13/L14 Demo 只证明可在 SPA 内真实执行的隔离、恢复顺序与 dispose 行为。真实 SSR、
  hydration、HMR 和 Devtools 证据按上文保持 `Deferred/not-run`，不写成已验证。
- P05 跑全量 Vitest、type-check、触及文件 lint/Prettier、whitespace 和 production build；全仓命令失败时
  精确区分本批回归与已有范围外脏文件。
- P05 通过后只关闭 Pinia 14 课课程主线，不自动开始 PRA1。

## PRA 与搜索收口顺序

1. P01-P05 依次完成后，按
   [Pinia Reference RA0](./pinia-reference-ra0.md) 冻结的 PRA1-PRA4 执行。
2. Pinia Reference 稳定分母为 41 public；26 restricted 使用独立 tuple 与 watchlist，不进入
   Reference Overview 计数。
3. 顺序必须为 `P0 -> P01 -> P02 -> P03 -> P04 -> P05 -> PRA1 -> PRA2 -> PRA3 -> PRA4 -> 搜索收口`。
   不在课程批次中提前创建 Reference，不在 PRA 中重写课程。
4. 搜索收口在 14 课与 PRA 全部关闭后单独执行：检查课程标题/标签/摘要、Reference
   标题/锨点与 Pinia 模块分组均可搜索，并确认 restricted 不会产生伪导航。
5. 搜索验收复用现有 dialog 与公开 `learningCatalog.search()` seam，覆盖键盘选择、`Esc` 关闭/焦点恢复、
   390px 触摸直接点击非首项结果与深链刷新。不为 Pinia 创建第二套搜索实现。

## 每批统一验证与停止边界

1. 开始前记录 `git status --short`，复算 manifest、`package.json`、lockfile 和两份 P0 文档 SHA。
   任一冻结输入变化时先重做差异审计，不盲目沿用旧计数。
2. 每批只修改该批的 entry、Demo、manifest 和最少 focused spec/E2E；不格式化全仓，不清理
   `.playwright-cli/`、`docs/backend/`、`output/` 等范围外资产。
3. 每批都先跑同一个公开 `learningCatalog` focused red/green，不每课新增重复的索引测试。
4. 最少静态 Gate：定向 Vitest、`npm run type-check`、触及文件 Oxlint/Prettier、禁止 CSS 属性检查、
   tracked/untracked whitespace 检查。风险增大或最终批再扩大到全量测试与 build。
5. 浏览器只复用已在 `localhost:5173` 运行的服务，不启动第二个 dev server。Playwright 路径
   必须可复跑，并记录 console warning/error 与 pageerror。
6. 每批完成后做独立 Standards/Spec 双轴复审，只有 `PASS / 0 finding` 才能关闭并进入下一批。
7. 每批报告实际命令、证据边界和未运行项；不把 focused green、文档审查 PASS 或当前 SPA
   smoke 写成 Gate 6 整体关闭。
8. 不提交、不推送、不创建 PR。完成获批批次即停，不自动进入相邻批次。

## P0 完成条件

- 本文的 14 课 ID/顺序与 `vue-pinia-track.ts` 零差异。
- 两份 P0 文档中版本、commit、Reference `67 / 41 / 25 / 1`、课程 `4 / 2 / 4 / 2 / 2`
  批次口径一致。
- 所有一手源链接到官方 Guide/API 或固定 commit，不以第三方文章支撑核心结论。
- targeted Prettier、tracked/untracked whitespace、课程顺序和 Reference 集合机械复算通过。
- 独立 Standards/Spec 双轴复审结果为 `PASS / 0 finding`。
- 只有上述条件全部满足才可进入 P01。P0 本身不创建任何课程正文、Demo、Reference、
  索引、测试或搜索接线。

## 一手来源索引

### 官方 Guide 与 API

- [Getting Started](https://pinia.vuejs.org/getting-started.html)
- [Defining a Store / Using the store / Setup Stores](https://pinia.vuejs.org/core-concepts/)
- [State](https://pinia.vuejs.org/core-concepts/state.html)
- [Getters](https://pinia.vuejs.org/core-concepts/getters.html)
- [Actions](https://pinia.vuejs.org/core-concepts/actions.html)
- [Plugins](https://pinia.vuejs.org/core-concepts/plugins.html)
- [Composing Stores](https://pinia.vuejs.org/cookbook/composing-stores.html)
- [Outside component usage](https://pinia.vuejs.org/core-concepts/outside-component-usage.html)
- [Testing stores](https://pinia.vuejs.org/cookbook/testing.html)
- [SSR](https://pinia.vuejs.org/ssr/)
- [HMR](https://pinia.vuejs.org/cookbook/hot-module-replacement.html)
- [Pinia API](https://pinia.vuejs.org/api/pinia/)

### 固定 4.0.2 源码与测试

- [`createPinia.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/createPinia.ts)
- [`rootStore.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/rootStore.ts)
- [`store.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts)
- [`storeToRefs.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/storeToRefs.ts)
- [`subscriptions.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/subscriptions.ts)
- [`hmr.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/hmr.ts)
- [`rootState.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/rootState.spec.ts)
- [`state.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/state.spec.ts)
- [`getters.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/getters.spec.ts)
- [`onAction.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/onAction.spec.ts)
- [`subscriptions.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/subscriptions.spec.ts)
- [`storePlugins.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/storePlugins.spec.ts)
- [`ssr.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/ssr.spec.ts)
- [`hmr.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/hmr.spec.ts)
- [`devtools.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/devtools.spec.ts)
- [`@pinia/testing` source](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/testing/src/testing.ts)
- [`@pinia/testing` tests](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/testing/src/testing.spec.ts)
