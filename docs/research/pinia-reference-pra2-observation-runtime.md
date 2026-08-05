# Pinia Reference PRA2：Observation & Runtime 官方研究冻结

> 状态：`P0.2 / PRA2 / research-only`
>
> 查证日期：2026-08-05（Asia/Shanghai）
>
> 适用版本：本地与 lockfile 的 `pinia@4.0.2`
>
> 固定 tag commit：
> [`ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1`](https://github.com/vuejs/pinia/commit/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1)
>
> 本文只冻结 PRA2 的 11 个 stable 根入口、3 个 Reference 页面内容契约和未来实施 Gate；
> 不修改 manifest、index、spec、entry、Demo、schema、UI、依赖或实施计划，不进入 PRA3。

## 结论

1. PRA2 精确承载 **11 个 stable/public 根入口**：订阅与 action observation 8 项、hydration
   helper 2 项、HMR helper 1 项。RA0 深度保持为 `5 detail + 6 merged + 0 quick`，页面分布为
   `8 / 2 / 1`。
2. PRA2 原子发布后，Pinia Reference 必须得到
   `30 available / 11 planned / 41 stable total`。全局深度仍为
   `17 detail / 17 merged / 7 quick`；`25 internal + 1 deprecated = 26 restricted` 继续独立，
   不进入 Overview 或稳定分母。
3. 三页都必须有非空 `signature`、5–10 个高质量 pitfalls、编号
   “源码事实 → 推出结论 → 适用场景”、固定 official/commit sources、可达 `related` 和唯一
   heading anchor。11 个 API 的官方 URL 必须逐项原样进入其目标页 `meta.sources`。
4. PRA2 是 Reference 内容批，不新增 Demo。hydration 页只解释 SSR 所有权与恢复顺序，HMR 页只记录
   Vite 接法和固定 4.0.2 证据；不得用 SPA 文案或 unit callback 冒充真实 SSR/HMR。
5. 未来实施只允许 6 个实现文件；同一冻结 diff 取得
   `Standards PASS / 0 finding` 与 `Spec PASS / 0 finding` 后，才允许第 7 个
   `docs/重构实施计划.md` 做 closure-only 记录。闭环后立即停止，不进入 PRA3、PRA4、搜索收口、
   Gate 6、React 或其他生态。

## 冻结输入、检索状态与证据口径

### 当前本地冻结值

| 输入 | 当前值 |
| --- | --- |
| Git `HEAD` | `b2396d24738ecfed3b053c6c7199c32210d70509` |
| `vue` | `3.5.40` |
| `vue-router` | `5.2.0` |
| `pinia` | `4.0.2` |
| `package-lock.json` SHA-256 | `6a68e9e91d6b08c740fdcdecdf64951639e7aba78f1acd4d766c7c6f9b1e1c98` |
| `node_modules/pinia/dist/pinia.d.ts` SHA-256 | `e13460b9f39a197d76b64f4b4a14ddc403b4d85e036adb5850b820f7e08e0674` |
| `node_modules/pinia/dist/pinia.js` SHA-256 | `eb83983da65fdbdb6585de805bda8cadc70a9d273444da1bf4811f6e4851ea92` |
| `src/content/catalog/manifests/vue-pinia-track.ts` SHA-256 | `68476b94dff0142f6d8e811406f26b94298007c7a2937dc0732ffba0f3525d9b` |
| 当前 Pinia Reference index SHA-256 | `9f0060279e09bb9a2e52c108dbe45c9b02d42a7c0b397c643407b47168cd4b65` |
| RA0 研究 SHA-256 | `512cd3d0a4347e93d7fba8ae6b9f4c903edfb31ea991ca4d1c1fbbf0446bd61f` |
| PRA1 研究 SHA-256 | `b1e9f5a513d337f26f79235afce79a302c8d0fe37e038ce2928ba8fbfc3ba81f` |

PRA2 实施 Gate 0 必须重算以上输入。Pinia version、lock、声明、runtime、RA0、PRA1 或当前
Reference index 任一变化，都先做精确差异审计；不能沿用本文直接实施。learning manifest 的 SHA
用于确认课程关联对象未漂移，PRA2 不修改该文件。

### Tavily 与外部读取边界

本轮先按仓库规则调用 Tavily，原样返回：

```text
This request exceeds your plan's set usage limit. Please upgrade your plan or contact support@tavily.com
```

停止重试后，没有切换到博客、搜索摘要或其他二手资料。本文沿用 RA0、P03、P05 已冻结的一手 URL，
并逐项读取当前本地 `pinia@4.0.2` 的发布声明与 runtime；固定测试结论只采用仓库中已按同一 commit
核对的 P03/P05 结论。未来实施 Gate 0 若能恢复官方读取，应重读下文冻结 URL；如果一手内容与本地
4.0.2 快照冲突，必须先报告而不是静默改写本文契约。

### 证据优先级与两处已知漂移

| 层级 | 可支持的结论 | 本文示例 |
| --- | --- | --- |
| 公开 API/Guide | 默认 Reference 契约 | mutation discriminant、Setup Store 限定、Vite HMR snippet |
| 固定 4.0.2 声明/runtime | 必须标固定版本的行为 | patch 同步通知、action Promise hooks、production no-op |
| 固定 4.0.2 官方测试 | 已覆盖或仍缺失的上游 seam | state/action/getter HMR 已测，两类订阅仍 `it.todo` |
| 应用建议 | 只能写成建议，不能伪装成 runtime 规则 | detached owner 清理、HMR 后保守重建外部订阅 |

需要在正文中显式化解两处同版本证据漂移：

1. `subscriptions.spec.ts` 有测试标题称默认是 `post`，但断言只证明“非 sync 且 next tick 后已调用”；
   本地 runtime 没有覆盖 `flush`，公开 `$subscribe()` 接受 Vue `WatchOptions`，所以 direct mutation
   应按 Vue `watch()` 默认 `pre` 教学。`$patch()` 走手动同步通知，是独立特例。
2. `types.ts` 的内部 JSDoc 曾称 `onError` callback 返回 `false` 可阻止传播，但公开 callback 类型是
   `(error: unknown) => void`，runtime 不读取返回值，固定测试也确认同步 throw 与 Promise reject
   继续到调用方。因此 PRA2 不教授“return false 吞错”。

## PRA2 精确 11 项稳定矩阵

以下 11 行全部是 `sourceTag: public`、`stable: yes`。`entryId#anchor` 是唯一发布目标；只有目标
entry 与 heading 在同批真实存在且唯一，才可从 `planned` 原子切到 `available`。

| apiId | displayName | officialUrl | depth | entryId | 唯一 anchor |
| --- | --- | --- | --- | --- | --- |
| `enumerations.mutationtype` | `MutationType` | [官方](https://pinia.vuejs.org/api/pinia/enumerations/MutationType.html) | `detail` | `vue.pinia.reference.observation.subscriptions` | `mutation-type` |
| `interfaces.subscriptioncallbackmutationdirect` | `SubscriptionCallbackMutationDirect` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/SubscriptionCallbackMutationDirect.html) | `merged` | `vue.pinia.reference.observation.subscriptions` | `direct-mutation` |
| `interfaces.subscriptioncallbackmutationpatchfunction` | `SubscriptionCallbackMutationPatchFunction` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/SubscriptionCallbackMutationPatchFunction.html) | `merged` | `vue.pinia.reference.observation.subscriptions` | `patch-function-mutation` |
| `interfaces.subscriptioncallbackmutationpatchobject` | `SubscriptionCallbackMutationPatchObject` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/SubscriptionCallbackMutationPatchObject.html) | `merged` | `vue.pinia.reference.observation.subscriptions` | `patch-object-mutation` |
| `type-aliases.storeonactionlistener` | `StoreOnActionListener` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/StoreOnActionListener.html) | `detail` | `vue.pinia.reference.observation.subscriptions` | `store-on-action-listener` |
| `type-aliases.storeonactionlistenercontext` | `StoreOnActionListenerContext` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/StoreOnActionListenerContext.html) | `merged` | `vue.pinia.reference.observation.subscriptions` | `store-on-action-listener-context` |
| `type-aliases.subscriptioncallback` | `SubscriptionCallback` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/SubscriptionCallback.html) | `detail` | `vue.pinia.reference.observation.subscriptions` | `subscription-callback` |
| `type-aliases.subscriptioncallbackmutation` | `SubscriptionCallbackMutation` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/SubscriptionCallbackMutation.html) | `merged` | `vue.pinia.reference.observation.subscriptions` | `subscription-callback-mutation` |
| `functions.accepthmrupdate` | `acceptHMRUpdate` | [官方](https://pinia.vuejs.org/api/pinia/functions/acceptHMRUpdate.html) | `detail` | `vue.pinia.reference.runtime.hmr` | `accept-hmr-update` |
| `functions.shouldhydrate` | `shouldHydrate` | [官方](https://pinia.vuejs.org/api/pinia/functions/shouldHydrate.html) | `merged` | `vue.pinia.reference.runtime.hydration` | `should-hydrate` |
| `functions.skiphydrate` | `skipHydrate` | [官方](https://pinia.vuejs.org/api/pinia/functions/skipHydrate.html) | `detail` | `vue.pinia.reference.runtime.hydration` | `skip-hydrate` |

机械断言必须得到：

| 维度 | 结果 |
| --- | ---: |
| PRA2 stable | 11 |
| `detail / merged / quick` | `5 / 6 / 0` |
| 页面分布：subscriptions / hydration / HMR | `8 / 2 / 1` |
| 发布后 `available / planned / total` | `30 / 11 / 41` |
| 全局 `detail / merged / quick` | `17 / 17 / 7` |
| restricted | `26`，不进入 Overview |
| 每项 target 命中且同页 anchor 唯一 | 11 |

## 三页统一正文契约

每页必须复用 `defineReferenceMeta()` 与 `defineReference()`，并同时满足：

- `signature.trim().length > 0`；合并页使用多行 declaration，不能用 prose 代替签名。
- `meta.anchors` 与正文 heading 顺序、文本严格一致；`headingId()` 结果页内唯一。
- 正文有且只有一个 `易错使用提示` 和一个 `源码推导与适用场景` heading。
- 每页有 5–10 个 pitfalls；每项包含错误用法、可观察后果和公开替代。
- “源码推导与适用场景”使用编号条目，每项明确源码事实、能推出的结论和适用场景。
- `meta.sources` 精确采用各页下文冻结的 title/URL；11 个 API URL 不得只存在于 index。
- `related` 只连接当前 catalog 已存在的 entryId，或本批同批创建的另外两页。
- 不加入 `demo` block，不新增 `src/content/demos/vue/pinia/` 文件，也不复用课程 Demo 冒充
  Reference 的 SSR/HMR evidence。
- 每个新增 `.ts` 文件的顶层说明和自定义 helper 方法都写规范中文注释；不使用 CSS，也不引入
  `grid` 或 `gap`。

## 页面 1：Store 状态与 Action 订阅

### 元数据、文件与 headings

| 字段 | 冻结值 |
| --- | --- |
| 文件 | `src/content/entries/reference/vue/pinia/observation/subscriptions.ts` |
| `meta.id` | `vue.pinia.reference.observation.subscriptions` |
| `meta.title` | `Store 状态与 Action 订阅` |
| `meta.summary` | `查询 mutation 联合类型、状态订阅、Action 订阅的时序与生命周期边界` |
| `meta.collection` | `observation` |
| `meta.appliesTo` | `Pinia 4.0.2` |
| `meta.verifiedAt` | `2026-08-05` |
| pitfalls 数 | 10 |
| Demo | 0 |

`related` 按下列顺序冻结：

1. `vue.pinia.reference.stores.store-shape`
2. `vue.pinia.reference.runtime.hmr`
3. `vue.pinia.learn.intermediate.subscriptions-actions`
4. `vue.pinia.learn.advanced.plugins-persistence`
5. `vue.pinia.learn.advanced.hmr-devtools-maintenance`

`meta.anchors` 与正文 headings 按下列顺序冻结：

1. `概述`
2. `Mutation Type`
3. `Direct Mutation`
4. `Patch Object Mutation`
5. `Patch Function Mutation`
6. `Subscription Callback Mutation`
7. `Subscription Callback`
8. `Store On Action Listener Context`
9. `Store On Action Listener`
10. `Flush 与生命周期`
11. `易错使用提示`
12. `源码推导与适用场景`

其中 8 个 API target 对应的 `headingId()` 必须依次命中矩阵中的
`mutation-type`、`direct-mutation`、`patch-object-mutation`、`patch-function-mutation`、
`subscription-callback-mutation`、`subscription-callback`、
`store-on-action-listener-context`、`store-on-action-listener`。index 的 tuple 顺序可以继续保持
RA0 当前顺序，不能因正文教学顺序改变 API identity。

### signature 冻结

```ts
declare enum MutationType {
  direct = 'direct',
  patchObject = 'patch object',
  patchFunction = 'patch function',
}

interface SubscriptionCallbackMutationDirect {
  type: MutationType.direct
  storeId: string
  events: DebuggerEvent
}

interface SubscriptionCallbackMutationPatchObject<S> {
  type: MutationType.patchObject
  storeId: string
  events: DebuggerEvent[]
  payload: _DeepPartial<UnwrapRef<S>>
}

interface SubscriptionCallbackMutationPatchFunction {
  type: MutationType.patchFunction
  storeId: string
  events: DebuggerEvent[]
}

type SubscriptionCallbackMutation<S> =
  | SubscriptionCallbackMutationDirect
  | SubscriptionCallbackMutationPatchObject<S>
  | SubscriptionCallbackMutationPatchFunction

type SubscriptionCallback<S> = (
  mutation: SubscriptionCallbackMutation<S>,
  state: UnwrapRef<S>,
) => void

type StoreOnActionListenerContext<Id extends string, S extends StateTree, G, A> =
  _ActionsTree extends A
    ? _StoreOnActionListenerContext<StoreGeneric, string, _ActionsTree>
    : {
        [Name in keyof A]: Name extends string
          ? _StoreOnActionListenerContext<Store<Id, S, G, A>, Name, A>
          : never
      }[keyof A]

type StoreOnActionListener<Id extends string, S extends StateTree, G, A> = (
  context: StoreOnActionListenerContext<Id, S, G, {} extends A ? _ActionsTree : A>,
) => void
```

签名如实显示声明中的 internal helper 名称只为还原公开 alias 的展开关系；正文不得推荐 import
`_DeepPartial`、`_ActionsTree` 或 `_StoreOnActionListenerContext`。公开可观察的 action context 必须用
`name / store / args / after / onError` 解释，不把 internal helper 提升为稳定索引项。

### 必须覆盖的正文事实

1. `MutationType` 的值精确是 `direct`、`patch object`、`patch function`，不是 enum key 文本。
2. 三个 mutation variant 共有 `type` 与 `storeId`；`events` 来自 Vue reactivity debugging，固定
   声明明确标为 DEV-only，生产业务逻辑不能依赖其存在、形状或数量。
3. 只有 patch object variant 有 `payload`，其值是传给 `$patch(object)` 的对象；direct 和 patch
   function 没有稳定 payload。`SubscriptionCallback` 第二参数才是触发时完整 `store.$state`。
4. `$patch(object)` 与 `$patch(fn)` 暂停 watcher、聚合修改并手动同步触发一次 subscription；声明
   也明确 `flush` 不影响 `$patch()` 调用。
5. direct mutation 经 deep `watch()` 调度；默认遵守 Vue `watch()` 的 `pre`，`sync` 可逐次同步观察，
   `post` 用于组件更新后的观察。不能用上游测试标题把默认值改写成 `post`。
6. 同 tick 的 patch 后立即 direct mutation，非 sync listener 未必为 direct 再产生独立事件；需要
   逐事件观察时使用 `flush: 'sync'` 或显式 `await nextTick()` 分隔。
7. `$onAction()` listener 在 action 本体前同步触发，context 精确包含 `name`、同一 `store`、实参数组
   `args`、`after` 和 `onError`。
8. 同步 action 的 `after` 在本体返回后、调用返回前收到返回值；Promise action 的 `after` 等待
   resolve 并收到解包值。同步 throw 与 Promise reject 都先触发 `onError`，然后继续传播给调用方。
9. `$subscribe()` 用 `{ detached: true }`，`$onAction()` 用第二个布尔参数 `true` 脱离当前 scope；
   两者都返回 stop。默认在组件/effect scope 内注册时随 scope 销毁。
10. detached 只转移清理所有权，不代表永生或无需停止；owner 必须保存 stop，并在宿主释放时调用。

### 10 个 pitfalls 冻结

1. 把 DEV-only `events` 当作生产字段级审计协议；后果是 production 缺字段或形状漂移；改用
   `type/storeId/payload` 的稳定面，业务审计由显式 action/event 建模。
2. 认为 direct mutation 非法；后果是遗漏合法的 `MutationType.direct` 分支；按三值联合完整处理。
3. 在所有 mutation 上读取 `payload`；后果是 direct/function 分支得到不存在字段；先按 `type`
   narrowing，只有 `patchObject` 读取 payload。
4. 把 callback 第二参数当作 patch payload；后果是持久化完整 state 与差异对象混淆；第二参数明确
   命名为 `state`，object patch 从 mutation.payload 读取。
5. 认为 `$subscribe()` 默认 `post`；后果是依赖错误 DOM 时序；direct mutation 按 Vue 默认 `pre`，
   需要 DOM 后时机时显式传 `flush: 'post'`。
6. 认为 `flush: 'post'` 会延后 `$patch()`；后果是把同步 patch 通知误排入 next tick；把 patch 的
   手动同步聚合路径作为明确特例。
7. patch 后同 tick 连续 direct 写入并期待非 sync 逐事件日志；后果是事件被当前 listening gate 合并/
   跳过；使用 `sync` 或在操作间 `await nextTick()`。
8. 给 `$onAction()` 传 `{ detached: true }`；后果是第二参数 truthy/类型不符且意图不清；使用
   `store.$onAction(listener, true)`。
9. 在 `onError` 返回 `false` 试图吞错；后果是 throw/rejection 仍传播；observer 只记录，调用方继续
   `try/catch` 或处理 rejection。
10. 创建 detached listener 却丢弃 stop；后果是宿主卸载后仍观察并累积副作用；由明确 owner 保存并
    幂等调用 stop。

### 编号“源码事实 → 推出结论 → 适用场景”

1. 固定 `types.ts` 把 mutation 定义为三个 discriminated variants，且 payload 只属于 object patch；
   因而可以按 `type` 做穷尽 narrowing；适用于持久化、时间线和 Devtools adapter 的结构化输入。
2. 固定 `store.ts` 的 `$patch()` 暂停 watcher并手动触发一次 callback；因而 patch 是同步聚合通知且
   不受 flush 延迟；适用于批量 state 修改后只做一次持久化写入。
3. 同一实现把 `$subscribe()` options 合并到 deep `watch()`；因而 direct mutation 才遵守
   `pre/post/sync`；适用于需要组件更新前后或逐事件观察的订阅。
4. 固定 `subscriptions.ts` 仅在非 detached 且存在 current scope 时登记 `onScopeDispose()`；因而
   detached 只是跳过自动清理；适用于组件外 observer 和长期 integration owner。
5. 固定 action wrapper 在执行本体前触发 listener，并分别为同步返回与 Promise resolve 触发
   `after`；因而能观察意图和最终成功值；适用于 tracing、metrics 与 cleanup，而不是 action 拦截。
6. wrapper 对同步错误 rethrow、对异步错误重新 reject；因而 `onError` 不改变调用方失败通道；适用于
   错误遥测，同时保持业务调用者的处理责任。
7. 固定 `onAction.spec.ts` 覆盖 args、返回值、resolve、throw、reject 和 unsubscribe；因而正文只需
   一套最小行为矩阵；适用于后续 focused public seam，不需要新增 Demo。
8. 声明让两类订阅都返回 `() => void`，`$dispose()` 又会清 Store 持有的两个 listener Set；因而
   observer owner、Store 和 Pinia 有分层生命周期；适用于测试 teardown 与临时 Store 资源管理。

### 精确 `meta.sources`

以下 title/URL 必须原样进入本页 `meta.sources`；可以增加确有正文使用的一手来源，但不得删减、改成
目录页或用一个总链接替代 8 个 API URL。

| title | url |
| --- | --- |
| `Pinia API：MutationType` | `https://pinia.vuejs.org/api/pinia/enumerations/MutationType.html` |
| `Pinia API：SubscriptionCallbackMutationDirect` | `https://pinia.vuejs.org/api/pinia/interfaces/SubscriptionCallbackMutationDirect.html` |
| `Pinia API：SubscriptionCallbackMutationPatchFunction` | `https://pinia.vuejs.org/api/pinia/interfaces/SubscriptionCallbackMutationPatchFunction.html` |
| `Pinia API：SubscriptionCallbackMutationPatchObject` | `https://pinia.vuejs.org/api/pinia/interfaces/SubscriptionCallbackMutationPatchObject.html` |
| `Pinia API：StoreOnActionListener` | `https://pinia.vuejs.org/api/pinia/type-aliases/StoreOnActionListener.html` |
| `Pinia API：StoreOnActionListenerContext` | `https://pinia.vuejs.org/api/pinia/type-aliases/StoreOnActionListenerContext.html` |
| `Pinia API：SubscriptionCallback` | `https://pinia.vuejs.org/api/pinia/type-aliases/SubscriptionCallback.html` |
| `Pinia API：SubscriptionCallbackMutation` | `https://pinia.vuejs.org/api/pinia/type-aliases/SubscriptionCallbackMutation.html` |
| `Pinia Guide：State subscriptions` | `https://pinia.vuejs.org/core-concepts/state.html#subscribing-to-the-state` |
| `Pinia Guide：Action subscriptions` | `https://pinia.vuejs.org/core-concepts/actions.html#subscribing-to-actions` |
| `Vue API：watch()` | `https://vuejs.org/api/reactivity-core.html#watch` |
| `Vue Guide：Callback Flush Timing` | `https://vuejs.org/guide/essentials/watchers.html#callback-flush-timing` |
| `Pinia 4.0.2：types.ts 固定源码` | `https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/types.ts` |
| `Pinia 4.0.2：store.ts 固定源码` | `https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts` |
| `Pinia 4.0.2：subscriptions.ts 固定源码` | `https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/subscriptions.ts` |
| `Pinia 4.0.2：subscriptions 官方测试` | `https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/subscriptions.spec.ts` |
| `Pinia 4.0.2：onAction 官方测试` | `https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/onAction.spec.ts` |

## 页面 2：Setup Store 水合控制

### 元数据、文件与 headings

| 字段 | 冻结值 |
| --- | --- |
| 文件 | `src/content/entries/reference/vue/pinia/runtime/hydration.ts` |
| `meta.id` | `vue.pinia.reference.runtime.hydration` |
| `meta.title` | `Setup Store 水合控制` |
| `meta.summary` | `查询 skipHydrate() 与 shouldHydrate()，并区分 Setup、Options 与宿主 SSR 边界` |
| `meta.collection` | `runtime` |
| `meta.appliesTo` | `Pinia 4.0.2` |
| `meta.verifiedAt` | `2026-08-05` |
| pitfalls 数 | 8 |
| Demo | 0 |

`related` 按下列顺序冻结：

1. `vue.pinia.reference.stores.define-store`
2. `vue.pinia.reference.runtime.hmr`
3. `vue.pinia.learn.advanced.ssr-hydration`
4. `vue.pinia.learn.intermediate.outside-components-router`
5. `vue.pinia.learn.advanced.plugins-persistence`

`meta.anchors` 与正文 headings 按下列顺序冻结：

1. `概述`
2. `Skip Hydrate`
3. `Should Hydrate`
4. `Setup Store 顶层水合`
5. `Options Store Hydrate`
6. `SSR 恢复顺序与安全边界`
7. `易错使用提示`
8. `源码推导与适用场景`

两个 API target 分别严格命中 `skip-hydrate` 与 `should-hydrate`。

### signature 冻结

```ts
declare function skipHydrate<T = any>(obj: T): T
declare function shouldHydrate(obj: any): boolean
```

### 必须覆盖的正文事实

1. `skipHydrate(obj)` 通过不可枚举 Symbol 标记对象并返回同一个对象；公开说明把用途限定在 Setup
   Store 返回的“有状态但不是真正 store state”的对象，例如 router instance。
2. `shouldHydrate(obj)` 对有该 own-property 标记的对象返回 `false`；对未标记对象、primitive 和
   nullish 返回 `true`。它是 Pinia 判断 helper，不是通用 serializability 或安全检查器。
3. 固定测试覆盖标记后的 plain object、Map、Set、Array 不水合，而 primitive/nullish 仍应水合；
   nested marker case 是 skipped，不能扩大成递归保证。
4. Setup Store 总会执行 setup。存在 initial state 时，固定 runtime 只对顶层 ref/reactive property
   调用 `shouldHydrate(prop)`；通过后 ref 接收 initial value、reactive object merge，然后重新接回
   root state。
5. `skipHydrate()` 不删除字段、不阻止字段进入 `pinia.state.value`、不排除序列化，也不解决 DOM
   hydration mismatch。
6. Options Store 的复杂/custom ref 水合入口是 `DefineStoreOptions.hydrate(storeState,
   initialState)` 成员；它不是第三个 Pinia 根入口，也不是每个普通 Options Store 都必须实现。
7. SSR 必须每请求创建 Pinia；服务端 render 后读取 state，使用防 XSS 的宿主序列化协议，并在客户
   端第一次 `useStore()` 前恢复 `pinia.state.value`。Pinia helper 不拥有 serializer、HTML、CSP 或
   parser。
8. 本 Reference 无 SSR renderer、server/client 双入口或 HTML injection seam；真实 Node SSR、浏览器
   hydration、安全序列化均保持 `Deferred/not-run`，不新增 Demo。

### 8 个 pitfalls 冻结

1. 在 Options Store 使用 `skipHydrate()` 代替 `hydrate()`；后果是混淆两种创建分支；Options 的
   custom state 使用公开 `hydrate` member，Setup 顶层对象才使用 helper。
2. 把 `skipHydrate()` 传给 primitive；后果是 runtime 的 `Object.defineProperty()` 无法标记；只标记
   Setup Store 返回的对象型 stateful value。
3. 认为标记会从 root state 或序列化 payload 删除字段；后果是泄漏/传输假设错误；serializer 和
   payload selection 由宿主显式负责。
4. 认为标记会递归影响嵌套后代；后果是 nested client-only 对象仍可能被 initial state 覆盖；只对
   Setup Store 顶层返回对象建立契约。
5. 把 `shouldHydrate()` 当作“可 JSON 序列化”检查；后果是 class、DOM、Map/Set 的传输能力被误判；
   它只检查 Pinia 的 skip marker。
6. 客户端先创建 Store 再整体恢复 root state；后果是固定 4.0.2 的 Options refs 可能仍连接旧对象；
   在首次 `useStore()` 前完成恢复。
7. 使用 `JSON.stringify()` 后直接内联 `<script>` 并声称防 XSS；后果是 HTML context 攻击面未处理；
   由 SSR 宿主选择配对 serializer/parser、escaping 与 CSP。
8. 仅比较 Pinia state 相等就声称真实 Vue hydration 通过；后果是 DOM mismatch 被遗漏；真实保证需要
   server HTML、client hydrate 与 console mismatch evidence。

### 编号“源码事实 → 推出结论 → 适用场景”

1. 固定 `store.ts` 以不可枚举 own Symbol 实现 `skipHydrate()`，并让 `shouldHydrate()` 只检查该
   marker；因而 helper 不递归也不负责序列化；适用于 Setup Store 的 client-only 顶层对象。
2. 同一 runtime 在 Setup Store 分支对顶层 ref 赋值、对 reactive object merge；因而普通 Setup
   state 可接收 initial state；适用于解释自动恢复，不代表任意对象都可跨网络传输。
3. runtime 只在 `!isOptionsStore` 分支调用 `shouldHydrate()`；因而 skip helper 是 Setup Store 限定；
   适用于 router/custom composable 等不应接收 server initial value 的返回项。
4. Options Store 在存在 initial state 时对 root state 建 refs，最后才按需调用 options `hydrate()`；
   因而该 member 是复杂值补充入口；适用于 custom ref/local storage ref，而非全局 serializer。
5. 固定 `state.spec.ts` 覆盖 object/Map/Set/Array marker，nested case 保持 skipped；因而只能承诺顶层
   行为；适用于限制正文与类型示例，不制造递归保证。
6. 官方 SSR guide 要求 render 后读取 state、客户端首个 Store 前恢复并安全转义；因而 hydration
   helper 只是完整协议的一环；适用于 SSR entry 的宿主集成设计。
7. 固定 `ssr.spec.ts` 覆盖独立 app/Pinia 与 Options/Setup initial state，但没有项目的 HTML/CSP/
   浏览器 seam；因而它是上游行为依据，不是本项目真实 SSR green；适用于 evidence 分层。

### 精确 `meta.sources`

| title | url |
| --- | --- |
| `Pinia API：skipHydrate` | `https://pinia.vuejs.org/api/pinia/functions/skipHydrate.html` |
| `Pinia API：shouldHydrate` | `https://pinia.vuejs.org/api/pinia/functions/shouldHydrate.html` |
| `Pinia Guide：SSR` | `https://pinia.vuejs.org/ssr/` |
| `Pinia Guide：Composables / SSR` | `https://pinia.vuejs.org/cookbook/composables.html#ssr` |
| `Pinia 4.0.2：store.ts 固定源码` | `https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts` |
| `Pinia 4.0.2：types.ts 固定源码` | `https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/types.ts` |
| `Pinia 4.0.2：state 官方测试` | `https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/state.spec.ts` |
| `Pinia 4.0.2：SSR 官方测试` | `https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/ssr.spec.ts` |

## 页面 3：Vite Store HMR 接入

### 元数据、文件与 headings

| 字段 | 冻结值 |
| --- | --- |
| 文件 | `src/content/entries/reference/vue/pinia/runtime/hmr.ts` |
| `meta.id` | `vue.pinia.reference.runtime.hmr` |
| `meta.title` | `Vite Store HMR 接入` |
| `meta.summary` | `查询 acceptHMRUpdate() 的 Vite 接法、Store identity、迁移与证据边界` |
| `meta.collection` | `runtime` |
| `meta.appliesTo` | `Pinia 4.0.2` |
| `meta.verifiedAt` | `2026-08-05` |
| pitfalls 数 | 8 |
| Demo | 0 |

`related` 按下列顺序冻结：

1. `vue.pinia.reference.stores.define-store`
2. `vue.pinia.reference.observation.subscriptions`
3. `vue.pinia.reference.runtime.hydration`
4. `vue.pinia.learn.advanced.hmr-devtools-maintenance`
5. `vue.pinia.learn.intermediate.subscriptions-actions`

`meta.anchors` 与正文 headings 按下列顺序冻结：

1. `概述`
2. `Accept HMR Update`
3. `Vite 接入与 Production 边界`
4. `Store Identity 与 Shape 更新`
5. `订阅连续性与证据状态`
6. `易错使用提示`
7. `源码推导与适用场景`

唯一 API target 严格命中 `accept-hmr-update`。

### signature 冻结

```ts
declare function acceptHMRUpdate<
  Id extends string = string,
  S extends StateTree = StateTree,
  G extends _GettersTree<S> = _GettersTree<S>,
  A = _ActionsTree,
>(
  initialUseStore: StoreDefinition<Id, S, G, A>,
  hot: any,
): (newModule: any) => any
```

签名中的 `_GettersTree` 与 `_ActionsTree` 是公开函数声明的内部约束，不因此成为 stable API。正文只
使用 `acceptHMRUpdate()`、`defineStore()` 返回值与 Vite `import.meta.hot` 的公开接法。

### 必须覆盖的正文事实

1. 官方用法限定为 Store definition 旁的 Vite guard：

   ```ts
   if (import.meta.hot) {
     import.meta.hot.accept(acceptHMRUpdate(useStore, import.meta.hot))
   }
   ```

2. 固定 runtime 在 production 直接返回 no-op callback；HMR 不是 production migration、schema
   upgrade 或 persistence 恢复机制。
3. dev callback 从 `hot.data.pinia` 或 initial definition 取得 Pinia，保存到 `hot.data`，遍历新模块
   exports，只处理形如 StoreDefinition 且 registry 中已有对应 id 的 Store。
4. Store ID 是 HMR identity，必须稳定；固定流程先按新 `$id` 查 registry，再比较 initial id。
   ID 不匹配可能跳过更新，命中特定条件时会 invalidate，不能概括成“总保留”或“总 reload”。
5. 固定 `hmr.spec.ts` 覆盖 state、action、getter 的新增/删除、响应性与 shape 更新。Options Store 的
   nested plain object 与 Setup Store 的 ref object 走不同迁移路径，不能自创一个通用 deep merge。
6. 同一官方测试对 `$subscribe()` 与 `$onAction()` 跨 HMR 连续性仍保留两个 `it.todo`；Reference
   必须写成未保证，应用可采用更新后重新建立外部订阅的保守策略。
7. 本批不写 HMR Demo，不触发真实文件更新，不操作 internal `_hotUpdate/_s/_pinia`；真实 Vite file
   update 与订阅连续性证据固定为 `Deferred/not-run`。
8. Devtools 是相邻但不同能力；页面不把普通 DOM 状态、callback unit model 或截图当作 Devtools/
   HMR runtime evidence。

### 8 个 pitfalls 冻结

1. 只定义 Store，未注册 `import.meta.hot.accept(...)`；后果是模块更新时 Pinia 没有 accept handler；
   在 definition 文件旁使用官方 guarded snippet。
2. 无 guard 在 production 直接访问 `import.meta.hot`；后果是环境/类型边界不清；始终放入
   `if (import.meta.hot)`。
3. 把 `acceptHMRUpdate()` 当成 production state migration；后果是正式升级没有任何执行；为持久化
   schema 单独设计版本迁移。
4. HMR 时随意更改 Store ID 并期待 state 保留；后果是更新被跳过或 invalidation；把 ID 作为稳定
   identity，重命名单独迁移。
5. 假定 Options 与 Setup nested state 使用同一 deep merge；后果是 shape 或 runtime-added 属性处理
   错误；只依赖 Pinia 固定实现，不复制 internal migration。
6. 断言 action/getter 更新通过就代表两类订阅也保持；后果是把上游 `it.todo` 写成 green；明确标记
   未保证，并让 owner 能重建 observer。
7. 直接调用 `_hotUpdate` 或读取 `_s/_pinia` 写应用代码；后果是依赖 internal surface；只通过官方
   Vite accept helper 接入。
8. 用手工调用返回 callback 证明真实 HMR；后果是遗漏 Vite module graph、file event、accept 与
   invalidation；真实证据必须由 Vite 文件更新产生，本页保持 `Deferred/not-run`。

### 编号“源码事实 → 推出结论 → 适用场景”

1. 固定 `hmr.ts` 在 production 返回空 callback；因而 helper 只属于开发期；适用于明确禁止把 HMR
   当作 production migration。
2. dev callback 把 Pinia 存入 `hot.data` 并筛选新模块 Store exports；因而同一 Vite hot lifecycle
   才能复用实例；适用于 Store definition 文件的官方 accept snippet。
3. helper 先查 `pinia._s.has(newId)`，再比较 initial id；因而 ID 改名结果受 registry 条件影响；适用
   于冻结“ID 必须稳定”，不能推出无条件 invalidate。
4. 固定 `store.ts` 的 internal hot update 增删 state/action/getter 并保留已有 state；因而编辑定义可在
   开发期维持交互上下文；适用于局部开发反馈，不替代正式数据迁移。
5. Options nested plain object 以新 definition shape 合并同名旧值，Setup ref object 保留旧运行值；
   因而两种 Store shape 不能统一描述为普通 deep merge；适用于解释 issue #2611 的修复边界。
6. 固定 `hmr.spec.ts` 已覆盖成员更新，却把两类订阅连续性留为 `it.todo`；因而只能声称前者已测、
   后者未保证；适用于维护策略和 evidence matrix。
7. 官方 Guide 只给 Vite 形式，当前项目研究又没有真实 file-update seam；因而 callback model 不能升级
   为浏览器 HMR green；适用于把实际状态保持为 `Deferred/not-run`。

### 精确 `meta.sources`

| title | url |
| --- | --- |
| `Pinia API：acceptHMRUpdate` | `https://pinia.vuejs.org/api/pinia/functions/acceptHMRUpdate.html` |
| `Pinia Guide：Hot Module Replacement` | `https://pinia.vuejs.org/cookbook/hot-module-replacement.html` |
| `Pinia 4.0.2：hmr.ts 固定源码` | `https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/hmr.ts` |
| `Pinia 4.0.2：store.ts 固定源码` | `https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts` |
| `Pinia 4.0.2：HMR 官方测试` | `https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/hmr.spec.ts` |
| `Pinia Issue #2611：Setup Store HMR runtime-added property` | `https://github.com/vuejs/pinia/issues/2611` |

## 未来 PRA2 实施 allowlist

PRA2 只允许以下 6 个实现文件。现有 catalog index、tracks 与 Pinia Reference 注册已经由 PRA1
完成，不需要再次修改。

| 动作 | 文件 | 唯一职责 |
| --- | --- | --- |
| 修改 | `src/content/catalog/manifests/vue-pinia-reference.ts` | 新增 `observation`、`runtime` collections 与 3 个 entryId |
| 修改 | `src/content/catalog/manifests/vue-pinia-reference-index.ts` | 只把 PRA2 的 11 个既有 stable IDs 加入 available set |
| 修改 | `src/content/catalog/vue-pinia-reference-pra1.spec.ts` | 扩展同一 public seam regression，不新建平行 PRA2 spec |
| 新增 | `src/content/entries/reference/vue/pinia/observation/subscriptions.ts` | 页面 1 |
| 新增 | `src/content/entries/reference/vue/pinia/runtime/hydration.ts` | 页面 2 |
| 新增 | `src/content/entries/reference/vue/pinia/runtime/hmr.ts` | 页面 3 |

上述 6 文件取得最终双轴 `PASS / 0 finding` 前，明确禁止修改：

- `src/content/catalog/index.ts`、`src/content/catalog/manifests/tracks.ts`、
  `src/content/catalog/manifests/vue-pinia-track.ts`；
- `LearningCatalog.ts`、catalog/schema types、`ReferenceOverviewPage.vue`、共享组件与样式；
- PRA1 四篇正文、P01–P05 课程正文/spec、RA0/PRA1 研究文档；
- 任何 `src/content/demos/`、SSR/HMR fixture、依赖、配置或实施计划；
- PRA3/PRA4、搜索收口、Gate 6、React、后端或其他生态文件。

只有 6 个实现文件通过全部 Gate 且同一冻结 diff 获得双轴 PASS/0 后，才允许第 7 个文件
`docs/重构实施计划.md` 进入 **closure-only scope**。该文件只能追加 PRA2 实际计数、实际命令/
结果、文件/SHA、evidence 边界与停止线；不得改写其他阶段，也不得把 `Deferred/not-run`、未执行的
真实 SSR/HMR 或两个 HMR `it.todo` 写成 green。closure 落盘后，对该文档运行定向格式/whitespace
检查，并把“6 实现 + 1 closure”最终 diff 交给同一复审方复核。

## TDD 红绿与 public seam

### Red：先扩展现有唯一 focused spec

先只修改 `src/content/catalog/vue-pinia-reference-pra1.spec.ts`，保留现有测试结构和
`learningCatalog`、`headingId()`、显式 readonly `piniaRestrictedReferenceItems` 三个 seam。不要新建
PRA2 spec，不读取 catalog private map、未导出的 stable definitions 或 entry default。

最少新增/调整以下断言后，先运行同一测试并保存真实红灯：

1. 新增本文 11 行 `pra2Mappings`，精确断言 `apiId → entryId#anchor → collection`。
2. Overview 从 `19 / 22 / 41` 改为 `30 available / 11 planned / 41 total`；41 项仍全部
   `sourceTag: public`，全局 depth 仍 `17 / 17 / 7`。
3. available 30 项 depth 为 `15 detail / 10 merged / 5 quick`；单独筛出 PRA2 11 项为
   `5 detail / 6 merged / 0 quick`。
4. restricted 仍精确 26、`25 internal + 1 deprecated`、stable/restricted 交集为空、并集仍等于
   RA0 67 项；PRA2 不改变其 coverage。
5. `getNavigation()` 新增 `observation=[subscriptions]` 与
   `runtime=[hydration, hmr]`；原 `core/stores` 顺序和 entryIds 不变。
6. `loadEntry()` 累计加载 7 个 Pinia Reference entries；新增三页 signature 非空、headingId 页内
   唯一、pitfalls 精确为 `10 / 8 / 8`、都没有 demo block。
7. 11 个 target anchor 每项恰好命中一次；每个 index `officialUrl` 都存在于目标页
   `meta.sources[].url`。
8. 三页 `meta.anchors` 等于正文 headings；`related` 全部可由 public catalog 找到；每页至少一个
   Pinia 官方 URL 和一个包含固定 commit 的源码/test URL。
9. HMR 页存在 `Deferred/not-run` 与两个订阅 `it.todo` 的边界；hydration 页同时区分 Setup Store、
   Options Store 和宿主 SSR，且三页 Demo 数为 0。

预期 Red 不是伪造报错：此时 Overview 仍为 `19 / 22 / 41`，PRA2 target 未发布、三页无法加载、
新 collections 不存在。记录最前面的本批因果失败即可；不要为了获得更多红灯继续运行全量 Gate。

### Green：最小实现顺序

1. 在 `vue-pinia-reference.ts` 新增 `observation` collection，唯一 entry 是 subscriptions；新增
   `runtime` collection，entry 顺序严格为 hydration、HMR。保留 `core/stores` 原状。
2. 新增三篇正文，严格采用本文 metadata、headings、signature、pitfalls、inferences、sources 与
   related；不创建 helper abstraction 或 Demo。
3. 在 `vue-pinia-reference-index.ts` 只把矩阵中的 11 个 ID 加入 `availableStableIds`，同步把注释从
   “仅 PRA1”更新为“PRA1 与 PRA2”。不重排 41 stable definitions，不改 26 restricted tuple。
4. 复跑同一个 focused spec 直到 Green；失败只修 public catalog/entry/anchor seam，不新增平行测试。

此顺序描述提交前的工作步骤，不要求中间工作区永远可运行；最终 6 文件必须原子形成真实
entry、navigation、anchor、source 与 available target，不能先发布伪链接。

## 未来 PRA2 Gate

本 research-only 批次不运行下列测试、build、server 或浏览器；它们只适用于获得明确实施授权后的
PRA2。

1. **Gate 0 / 重冻**：记录 `git status --short`，复算本文“当前本地冻结值”；任一输入变化先差异
   审计。记录 6 个 allowlist 文件的 preimage/不存在状态，保护全部既有 dirty/untracked 资产。
2. **Gate 1 / TDD Red**：按上一节先扩展现有 focused spec，运行：

   ```bash
   npm test -- src/content/catalog/vue-pinia-reference-pra1.spec.ts
   ```

   保存一个由 `19 → 30`、缺 entry/collection/target 直接造成的失败。不能用语法错误、错误 import 或
   private seam 制造红灯。
3. **Gate 2 / TDD Green 与结构计数**：完成 6 文件最小实现，复跑同一命令；机械确认
   `11 / 5-6-0 / 8-2-1 / 30-11-41`、全局 `17-17-7`、restricted 26 不变。
4. **Gate 3 / shared public regression**：运行：

   ```bash
   npm test -- src/content/catalog/LearningCatalog.spec.ts
   npm test -- src/content/schema/entry-template.spec.ts
   ```

   不修改这两个共享 spec；失败按本批或既有故障归因。
5. **Gate 4 / 全量与静态检查**：运行 `npm test`、`npm run type-check`、`npm run lint`、
   `npm run format:check`。全仓既有失败必须列出精确路径和 pre-existing 证据，不能把 focused green
   写成整体 green。
6. **Gate 5 / 文件级格式与 whitespace**：对 6 个实现文件运行定向 `npx prettier --check`；tracked
   文件运行 `git diff --check -- <files>`，untracked 新页逐个运行
   `git diff --no-index --check /dev/null <file>`，只忽略 content-diff 的 exit 1，不忽略 whitespace
   error。记录每个文件行数，约 1000 行上限不能突破。
7. **Gate 6 / production build**：运行 `npm run build`。这是已接入 Reference 的内容变更，build 可
   验证模块加载，但不能代替浏览器或真实 HMR/SSR evidence。
8. **Gate 7 / 最小浏览器路径**：不新增 E2E 文件；用可复跑浏览器操作验证
   `/reference/vue/pinia` 显示 `30 / 41`，搜索 `MutationType` 后键盘进入
   `/reference/vue/pinia/observation/subscriptions#mutation-type`，并直达 hydration/HMR 两个 target。
   再搜索一个 PRA3 planned 项，确认无伪链接。检查桌面、`390 × 844`、200% 文本、reduced motion、
   焦点、水平溢出以及 console error/warning/pageerror。该路径只证明页面/catalog，不证明 SSR 或
   Vite HMR。
9. **Gate 8 / 单一双轴复审**：冻结同一 6 文件 diff，只创建 **一个** `gpt-5.6-sol`、`xhigh` 复审
   代理，并在同一上下文中分别输出 `Standards` 与 `Spec` 两节。Standards 核对仓库规范、最小改动、
   公开 seam、文件规模、中文注释、无 Demo/依赖；Spec 逐项核对本文 11 项矩阵、三页正文、sources、
   counts、evidence 与停止边界。任一 finding 非零，只修点名 blocker，复跑受影响 Gate，并交回同一
   复审方；不能用主进程自评替代 closure gate。
10. **Gate 9 / closure-only**：只有 Gate 8 得到
    `Standards PASS / 0 finding` 与 `Spec PASS / 0 finding`，才修改第 7 个
    `docs/重构实施计划.md`。写入实际而非计划结果，定向检查后让同一复审方核对最终 7 文件 diff。
11. **Gate 10 / 报告并停止**：报告最终 7 文件、SHA、
    `11 / 5-6-0 / 8-2-1 / 30-11-41`、restricted 26、实际 Gate 与 Deferred 项；不暂存、不提交、
    不推送。

## PRA3 停止边界

PRA2 完成后硬停止。不得创建、修改或提前发布：

- `PiniaPlugin`、`PiniaPluginContext`、`DefineStoreOptionsInPlugin`、
  `PiniaCustomProperties`、`PiniaCustomStateProperties`；
- `mapActions`、`mapState`、`mapStores`、`mapWritableState`、`setMapStoreSuffix`、
  `MapStoresCustomization` 或 deprecated `mapGetters`；
- plugin contracts、Options API helpers、restricted watchlist、PRA3/PRA4 研究或正文；
- `@pinia/testing`、`@pinia/nuxt`、持久化插件、serializer、Devtools 或其他依赖；
- SSR/HMR Demo、真实 server/client fixture、真实 Vite update、搜索收口或 Gate 6。

PRA2 closure 只表示 11 个 stable Reference target 以公开 catalog seam 发布，不表示真实 Node SSR、
安全 HTML 注入、浏览器 hydration、Vite file HMR、Devtools client 或 HMR 订阅连续性已经验证。

## 固定一手来源索引

### 发布、API 与 Guide

- [Pinia release `v4.0.2`](https://github.com/vuejs/pinia/releases/tag/v4.0.2)
- [固定 commit](https://github.com/vuejs/pinia/commit/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1)
- [Pinia API 根页](https://pinia.vuejs.org/api/pinia/)
- [State subscriptions](https://pinia.vuejs.org/core-concepts/state.html#subscribing-to-the-state)
- [Action subscriptions](https://pinia.vuejs.org/core-concepts/actions.html#subscribing-to-actions)
- [SSR](https://pinia.vuejs.org/ssr/)
- [Composables / SSR](https://pinia.vuejs.org/cookbook/composables.html#ssr)
- [Hot Module Replacement](https://pinia.vuejs.org/cookbook/hot-module-replacement.html)
- [Vue `watch()`](https://vuejs.org/api/reactivity-core.html#watch)
- [Vue Callback Flush Timing](https://vuejs.org/guide/essentials/watchers.html#callback-flush-timing)

### Pinia 4.0.2 固定源码与官方测试

- [`types.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/types.ts)
- [`store.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts)
- [`subscriptions.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/subscriptions.ts)
- [`hmr.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/hmr.ts)
- [`subscriptions.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/subscriptions.spec.ts)
- [`onAction.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/onAction.spec.ts)
- [`state.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/state.spec.ts)
- [`ssr.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/ssr.spec.ts)
- [`hmr.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/hmr.spec.ts)
- [Issue #2611](https://github.com/vuejs/pinia/issues/2611)

本文到此停止；本轮未实施 PRA2，也未进入 PRA3。
