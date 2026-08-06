---
id: vue.pinia.reference.observation.subscriptions
type: reference
title: Store 状态与 Action 订阅
summary: 查询 mutation 联合类型、状态订阅、Action 订阅的时序与生命周期边界
domain: frontend
technology: vue
module: pinia
related:
  - vue.pinia.reference.stores.store-shape
  - vue.pinia.reference.runtime.hmr
  - vue.pinia.learn.intermediate.subscriptions-actions
  - vue.pinia.learn.advanced.plugins-persistence
  - vue.pinia.learn.advanced.hmr-devtools-maintenance
tags:
  - Pinia
  - MutationType
  - $subscribe
  - $onAction
  - SubscriptionCallback
  - flush
appliesTo: Pinia 4.0.2
verifiedAt: 2026-08-05
sources:
  - title: Pinia API：MutationType
    url: https://pinia.vuejs.org/api/pinia/enumerations/MutationType.html
  - title: Pinia API：SubscriptionCallbackMutationDirect
    url: https://pinia.vuejs.org/api/pinia/interfaces/SubscriptionCallbackMutationDirect.html
  - title: Pinia API：SubscriptionCallbackMutationPatchFunction
    url: https://pinia.vuejs.org/api/pinia/interfaces/SubscriptionCallbackMutationPatchFunction.html
  - title: Pinia API：SubscriptionCallbackMutationPatchObject
    url: https://pinia.vuejs.org/api/pinia/interfaces/SubscriptionCallbackMutationPatchObject.html
  - title: Pinia API：StoreOnActionListener
    url: https://pinia.vuejs.org/api/pinia/type-aliases/StoreOnActionListener.html
  - title: Pinia API：StoreOnActionListenerContext
    url: https://pinia.vuejs.org/api/pinia/type-aliases/StoreOnActionListenerContext.html
  - title: Pinia API：SubscriptionCallback
    url: https://pinia.vuejs.org/api/pinia/type-aliases/SubscriptionCallback.html
  - title: Pinia API：SubscriptionCallbackMutation
    url: https://pinia.vuejs.org/api/pinia/type-aliases/SubscriptionCallbackMutation.html
  - title: Pinia Guide：State subscriptions
    url: https://pinia.vuejs.org/core-concepts/state.html#subscribing-to-the-state
  - title: Pinia Guide：Action subscriptions
    url: https://pinia.vuejs.org/core-concepts/actions.html#subscribing-to-actions
  - title: Vue API：watch()
    url: https://vuejs.org/api/reactivity-core.html#watch
  - title: Vue Guide：Callback Flush Timing
    url: https://vuejs.org/guide/essentials/watchers.html#callback-flush-timing
  - title: Pinia 4.0.2：types.ts 固定源码
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/types.ts
  - title: Pinia 4.0.2：store.ts 固定源码
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts
  - title: Pinia 4.0.2：subscriptions.ts 固定源码
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/subscriptions.ts
  - title: Pinia 4.0.2：subscriptions 官方测试
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/subscriptions.spec.ts
  - title: Pinia 4.0.2：onAction 官方测试
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/onAction.spec.ts
group: observation
signature: |-
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
anchors:
  - 概述
  - Mutation Type
  - Direct Mutation
  - Patch Object Mutation
  - Patch Function Mutation
  - Subscription Callback Mutation
  - Subscription Callback
  - Store On Action Listener Context
  - Store On Action Listener
  - Flush 与生命周期
  - 易错使用提示
  - 源码推导与适用场景
---

# Store 状态与 Action 订阅

## 概述

`$subscribe()` 观察 state mutation，`$onAction()` 观察 action 的调用与结果。两者都是通知机制而不是拦截器：前者提供 mutation 与触发时完整 state，后者在 action 执行前提供参数，并用 `after`、`onError` 登记结果观察。

:::tip
签名中的 `_DeepPartial`、`_ActionsTree` 与 `_StoreOnActionListenerContext` 只用于还原公开 alias 的展开关系，不是应用应直接导入的稳定 API。
:::

## Mutation Type

| 成员 | 运行时值 | 来源 |
| --- | --- | --- |
| direct | `direct` | 直接写入 state |
| patchObject | `patch object` | `$patch(object)` |
| patchFunction | `patch function` | `$patch(fn)` |

`MutationType` 的运行时值包含空格，不能用 enum key 文本代替。三个 variant 都有 `type` 与 `storeId`；`events` 来自 Vue reactivity debugging，并在固定声明中标为 DEV-only，生产业务逻辑不能依赖其存在、形状或数量。

## Direct Mutation

直接给 Store state 赋值会产生 `MutationType.direct`。它通过 deep `watch()` 调度，默认遵循 Vue watcher 的 `flush: 'pre'`；需要逐次同步观察时显式使用 `sync`，需要组件更新后的时机时显式使用 `post`。direct variant 没有稳定 `payload`。

## Patch Object Mutation

`$patch(object)` 合并传入对象并同步聚合成一次 `patch object` 通知。它是三个 variant 中唯一拥有 `payload` 的分支，值就是传给 `$patch()` 的对象；callback 的第二参数仍是触发时完整 `store.$state`。

## Patch Function Mutation

`$patch(fn)` 在同步 mutator 中成组修改 state，并同步触发一次 `patch function` 通知。该 variant 没有稳定 payload；若业务需要记录变化原因，应在 action 或显式领域事件中建模。

## Subscription Callback Mutation

~~~~ts
store.$subscribe((mutation, state) => {
  switch (mutation.type) {
    case MutationType.patchObject:
      persistPatch(mutation.payload)
      break
    case MutationType.direct:
    case MutationType.patchFunction:
      persistSnapshot(state)
      break
  }
})
~~~~

联合类型以 `type` 为 discriminator。按三种运行时值 narrowing 后，只有 object patch 分支读取 `payload`；不要从 DEV-only `events` 反推生产字段差异。

## Subscription Callback

`SubscriptionCallback&lt;S&gt;` 接收 `(mutation, state)`：第一个参数描述触发方式，第二个参数是完整且已解包的当前 state。持久化完整快照时读取 `state`；只处理 object patch 时才读取 `mutation.payload`。

## Store On Action Listener Context

| 字段 | 时机或值 | 用途 |
| --- | --- | --- |
| name | 即将执行的 action 名 | 分类 tracing/metrics |
| store | 同一个 Store 实例 | 读取 identity 与上下文 |
| args | 本次调用实参数组 | 记录调用输入 |
| after(callback) | 成功返回或 Promise resolve 后 | 观察返回值与清理 |
| onError(callback) | 同步 throw 或 Promise reject 时 | 记录失败 |

## Store On Action Listener

~~~~ts
const stop = store.$onAction(({ name, args, after, onError }) => {
  const startedAt = performance.now()

  after((result) => recordSuccess(name, args, result, performance.now() - startedAt))
  onError((error) => recordFailure(name, error, performance.now() - startedAt))
})
~~~~

listener 在 action 本体前同步触发。同步 action 的 `after` 在本体返回后、调用返回前收到返回值；Promise action 的 `after` 等待 resolve 并收到解包值。同步 throw 与 Promise reject 都先通知 `onError`，随后错误仍传播给调用方，observer 不能吞错。

## Flush 与生命周期

| 路径 | 通知时序 | 生命周期 |
| --- | --- | --- |
| direct mutation | deep watch；默认 `pre`，可选 `sync/post` | 默认随当前 scope 清理 |
| $patch(object/fn) | 手动同步聚合一次，不受 `flush` 影响 | 默认随当前 scope 清理 |
| $onAction() | action 前同步进入 listener | 默认随当前 scope 清理 |

同 tick 的 patch 后立即 direct mutation，非 sync listener 未必为 direct 再产生独立事件；需要逐事件观察时使用 `flush: 'sync'`，或在两次操作间 `await nextTick()`。`$subscribe()` 通过 `{ detached: true }`、`$onAction()` 通过第二个布尔参数 `true` 脱离当前 scope。两者都返回 stop；detached 只转移清理所有权，owner 仍须保存并调用 stop。

## 易错使用提示

:::pitfalls
### 把 events 当作生产审计协议

**触发条件：** 把 events 当作生产审计协议

**原因：** `events` 是 DEV-only reactivity debugging 信息。

**后果：** production 可能缺少字段，形状或数量也不是稳定业务契约。

**错误示例：**

~~~~ts
audit(mutation.events)
~~~~

**正确写法：**

~~~~ts
audit({ type: mutation.type, storeId: mutation.storeId })
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为 direct mutation 非法

**触发条件：** 认为 direct mutation 非法

**原因：** Store 允许直接写入 state，并会产生 direct variant。

**后果：** 联合类型处理遗漏合法分支。

**错误示例：**

~~~~ts
if (mutation.type === 'direct') throw new Error()
~~~~

**正确写法：**

~~~~ts
if (mutation.type === 'direct') persist(state)
~~~~

**验证方式：** 对照正确写法验证结果。

### 在所有 mutation 上读取 payload

**触发条件：** 在所有 mutation 上读取 payload

**原因：** 只有 patch object variant 声明 `payload`。

**后果：** direct 与 patch function 分支读取不存在字段。

**错误示例：**

~~~~ts
persist(mutation.payload)
~~~~

**正确写法：**

~~~~ts
if (mutation.type === MutationType.patchObject) persist(mutation.payload)
~~~~

**验证方式：** 对照正确写法验证结果。

### 把第二参数当作 patch payload

**触发条件：** 把第二参数当作 patch payload

**原因：** callback 第二参数是触发时完整 state。

**后果：** 完整快照与差异对象的持久化语义混淆。

**错误示例：**

~~~~ts
store.$subscribe((mutation, payload) => savePatch(payload))
~~~~

**正确写法：**

~~~~ts
store.$subscribe((mutation, state) => saveState(state))
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为订阅默认 post

**触发条件：** 认为订阅默认 post

**原因：** direct mutation 默认遵循 Vue watch 的 `pre`。

**后果：** 依赖了错误的 DOM 更新时间。

**错误示例：**

~~~~ts
store.$subscribe(readUpdatedDom)
~~~~

**正确写法：**

~~~~ts
store.$subscribe(readUpdatedDom, { flush: 'post' })
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 post 延后 patch 通知

**触发条件：** 用 post 延后 patch 通知

**原因：** `$patch()` 走手动同步聚合路径。

**后果：** 同步通知被错误地排入 next tick 设计。

**错误示例：**

~~~~ts
store.$subscribe(save, { flush: 'post' })
store.$patch({ count: 1 })
~~~~

**正确写法：**

~~~~ts
store.$patch({ count: 1 })
// save 在 patch 内同步收到一次通知
~~~~

**验证方式：** 对照正确写法验证结果。

### 期待非 sync 逐事件记录

**触发条件：** 期待非 sync 逐事件记录

**原因：** patch 后同 tick direct 写入可能被 listening gate 合并或跳过。

**后果：** 日志缺少预期的独立 direct 事件。

**错误示例：**

~~~~ts
store.$patch({ count: 1 })
store.count = 2
~~~~

**正确写法：**

~~~~ts
store.$subscribe(log, { flush: 'sync' })
~~~~

**验证方式：** 对照正确写法验证结果。

### 给 onAction 传 detached 对象

**触发条件：** 给 onAction 传 detached 对象

**原因：** `$onAction()` 的 detached 参数是第二个布尔值。

**后果：** 参数类型与清理意图不清。

**错误示例：**

~~~~ts
store.$onAction(listener, { detached: true })
~~~~

**正确写法：**

~~~~ts
const stop = store.$onAction(listener, true)
~~~~

**验证方式：** 对照正确写法验证结果。

### 尝试在 onError 吞错

**触发条件：** 尝试在 onError 吞错

**原因：** `onError` 只观察失败，不改变 action 的错误通道。

**后果：** throw 或 rejection 仍传播给调用方。

**错误示例：**

~~~~ts
onError(() => false)
~~~~

**正确写法：**

~~~~ts
onError(reportError)
await store.save().catch(handleError)
~~~~

**验证方式：** 对照正确写法验证结果。

### 丢弃 detached listener 的 stop

**触发条件：** 丢弃 detached listener 的 stop

**原因：** detached 只跳过当前 scope 的自动清理。

**后果：** 宿主释放后 observer 仍运行并累积副作用。

**错误示例：**

~~~~ts
store.$subscribe(sync, { detached: true })
~~~~

**正确写法：**

~~~~ts
const stop = store.$subscribe(sync, { detached: true })
onDispose(stop)
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 源码推导与适用场景

:::steps
### 1. 三个 variant 形成可穷尽联合

固定 `types.ts` 让 payload 只属于 object patch，因此可按 `type` 完整 narrowing。适用于持久化、时间线与 Devtools adapter 的结构化输入。

### 2. Patch 是同步聚合通知

固定 `store.ts` 的 `$patch()` 暂停 watcher 并手动触发一次 callback，因此通知不受 flush 延迟。适用于批量修改后只做一次持久化写入。

### 3. Direct 才遵循 watch flush

同一实现把 `$subscribe()` options 合并到 deep `watch()`，因此 direct mutation 遵循 `pre/post/sync`。适用于组件更新前后或逐事件观察。

### 4. Detached 只跳过 scope 清理

固定 `subscriptions.ts` 仅在非 detached 且存在 current scope 时登记 `onScopeDispose()`。适用于组件外 observer 与长期 integration owner。

### 5. Action listener 同时观察意图与成功值

固定 wrapper 在 action 前触发 listener，并为同步返回与 Promise resolve 触发 `after`。适用于 tracing、metrics 与 cleanup，不适用于拦截 action。

### 6. onError 不改变失败通道

wrapper 对同步错误重新抛出、对异步错误重新 reject。适用于错误遥测，同时保留业务调用者的处理责任。

### 7. 官方测试固定最小行为矩阵

`onAction.spec.ts` 覆盖 args、返回值、resolve、throw、reject 与 unsubscribe。适用于 public seam 回归，不需要用 Demo 重复证明。

### 8. Observer 存在分层生命周期

两类订阅都返回 stop，`$dispose()` 还会清 Store 持有的 listener Set。适用于测试 teardown 与临时 Store 资源管理。
:::
