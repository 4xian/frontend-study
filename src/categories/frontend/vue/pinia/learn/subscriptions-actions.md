---
id: vue.pinia.learn.intermediate.subscriptions-actions
type: lesson
title: 状态与 Action 订阅
summary: 观察 mutation 与 action 结算，并正确管理 flush、scope、detached 和 stop
domain: frontend
technology: vue
module: pinia
related:
  - vue.pinia.learn.basics.state-patch-reset
  - vue.pinia.learn.basics.actions-async
  - vue.pinia.reference.observation.subscriptions
tags:
  - Pinia
  - $subscribe
  - $onAction
  - flush
  - detached
  - unsubscribe
appliesTo: Pinia 4.0.2
verifiedAt: 2026-08-05
sources:
  - title: Pinia：State subscriptions
    url: https://pinia.vuejs.org/core-concepts/state.html#subscribing-to-the-state
  - title: Pinia：Action subscriptions
    url: https://pinia.vuejs.org/core-concepts/actions.html#subscribing-to-actions
  - title: Vue：Callback Flush Timing
    url: https://vuejs.org/guide/essentials/watchers.html#callback-flush-timing
  - title: Pinia 4.0.2 store.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts
  - title: Pinia 4.0.2 subscriptions.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/subscriptions.ts
  - title: Pinia 4.0.2 subscriptions.spec.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/subscriptions.spec.ts
  - title: Pinia 4.0.2 onAction.spec.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/onAction.spec.ts
stage: intermediate
level: intermediate
estimatedMinutes: 55
prerequisites:
  - vue.pinia.learn.basics.setup-first-store
  - vue.pinia.learn.basics.state-patch-reset
  - vue.pinia.learn.basics.getters
  - vue.pinia.learn.basics.actions-async
  - vue.pinia.learn.basics.component-store-to-refs
  - vue.pinia.learn.intermediate.setup-stores
  - vue.pinia.learn.intermediate.store-composition
  - vue.pinia.learn.intermediate.store-modeling
objectives:
  - 区分 direct、patch object 与 patch function mutation
  - 理解 $subscribe 的 pre/sync/post 与 patch 聚合特例
  - 使用 $onAction 的 before、after、onError 观察结算
  - 管理 scoped、detached 与显式 stop 的生命周期
recap:
  - $subscribe 观察三类 mutation，payload 只属于 patch object。
  - direct 使用 watch flush，patch 则同步聚合通知一次。
  - $onAction 的 after/onError 不改变调用方结算责任。
  - scoped 自动清理，detached 必须保存并调用 stop。
---

# 状态与 Action 订阅

:::tip
前置：请先完成 L01-L08，并理解 direct/patch、同步/异步 action 与组件 scope。
:::

## 选择要观察的语义层

`$subscribe()` 观察 state mutation，适合持久化适配和状态审计；`$onAction()` 观察 action 意图、参数和结算，适合 tracing 与指标。二者都是观察边界，不应替代显式业务 action 或变成 Store 间消息总线。

| mutation type | payload | 通知特点 |
| --- | --- | --- |
| direct | 无 | 按 watch flush 调度 |
| patch object | 传入的 patch object | 同步聚合一次 |
| patch function | 无 | 同步聚合一次 |

:::warning
`events` 是 DEV-only 调试字段，不是稳定的生产审计协议。业务代码只依赖公开的 type、storeId 和 patch object payload。
:::

## flush 与 patch 特例

`$subscribe()` 把选项交给 Vue `watch()`，默认沿用 `pre`，也可选择 `sync` 或 `post`。固定 4.0.2 的 `$patch()` 会暂停普通 watcher 通知，再手动同步聚合触发一次，因此 patch 通知不会被 `post` 延后；逐次观察 direct mutation 时才需要按 flush 选择时机。

## Action 的开始、成功与失败

~~~~ts
const stop = store.$onAction(({ name, args, after, onError }) => {
  console.log('before', name, args)
  after((result) => console.log('after', result))
  onError((error) => console.error('onError', error))
}, true)

stop()
~~~~

`after` 会等待 Promise resolve 并收到 resolved value；`onError` 覆盖同步 throw 与 Promise reject，但错误仍继续传播给调用方。固定 4.0.2 有一处陈旧 JSDoc 声称返回 false 可阻止传播，类型、实现和测试都不支持，本课不采用该说法。

## 订阅生命周期实验

:::demo{id="vue.pinia.learn.intermediate.subscriptions-actions.pinia-subscription-lifecycle-lab-demo" playground="true"}
比较 mutation、flush、action hook，以及 mini-app 卸载前后的订阅计数
:::

## 练习与观察

:::steps
### 1. 比较三种 mutation

核对 type，并确认只有 patch object 有 payload。

### 2. 观察 flush

比较 direct 同步快照与 patch 的同步聚合计数。

### 3. 结算异步 action

在 Gate 前确认没有 after，再分别 resolve 或 reject。

### 4. 卸载与 stop

先卸载 scoped listener，再显式停止 detached listener。
:::

## 源码与测试推导

:::steps
### 1. mutation 是判别联合

固定 types.ts 只让 patch object 分支拥有 payload，适合 TypeScript narrowing。

### 2. patch 手动聚合通知

store.ts 暂停 watcher 后同步触发 subscriptions，所以一个 patch 只产生一次通知。

### 3. direct 沿用 watch flush

$subscribe 传递 WatchOptions；默认值来自 Vue watch 的 pre，不由 Pinia 改成 post。

### 4. scope cleanup 来自 onScopeDispose

subscriptions.ts 让默认 listener 随当前 scope 清理，detached 只跳过自动登记。

### 5. action wrapper 在本体前触发

after/onError 分别挂到同步返回或 Promise 的结算分支，不是拦截器。

### 6. 错误继续传播

固定实现会 rethrow 或重新 reject，调用方仍必须 catch。

### 7. 两类 API 都返回 stop

detached 只改变 scope 归属，不免除所有者的显式清理责任。

### 8. dispose 不是 reset

store.$dispose() 停 scope 与订阅但保留 root state；Demo 总清理使用 disposePinia。
:::

## 易错使用提示

:::pitfalls
### 依赖 DEV-only events

**触发条件：** 依赖 DEV-only events

**原因：** events 只服务响应式调试。

**后果：** 生产环境审计字段缺失。

**错误示例：**

~~~~ts
save(mutation.events)
~~~~

**正确写法：**

~~~~ts
save({ type: mutation.type, storeId: mutation.storeId })
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为 direct mutation 不存在

**触发条件：** 认为 direct mutation 不存在

**原因：** 直接修改 state 是公开用法。

**后果：** 订阅处理遗漏合法事件。

**错误示例：**

~~~~ts
if (type !== 'patch object') return
~~~~

**正确写法：**

~~~~ts
switch (mutation.type) { /* 三个公开分支 */ }
~~~~

**验证方式：** 对照正确写法验证结果。

### 读取 patch function payload

**触发条件：** 读取 patch function payload

**原因：** 只有 patch object 有 payload。

**后果：** 运行时得到不存在的字段。

**错误示例：**

~~~~ts
mutation.payload.count
~~~~

**正确写法：**

~~~~ts
if (mutation.type === 'patch object') mutation.payload
~~~~

**验证方式：** 对照正确写法验证结果。

### 把默认 flush 写成 post

**触发条件：** 把默认 flush 写成 post

**原因：** Pinia 沿用 Vue watch 默认 pre。

**后果：** 对 DOM 更新时机形成错误假设。

**错误示例：**

~~~~ts
// $subscribe 默认 post
~~~~

**正确写法：**

~~~~ts
store.$subscribe(callback, { flush: 'post' })
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为 post 会延迟 patch

**触发条件：** 认为 post 会延迟 patch

**原因：** patch 使用同步手动聚合通知。

**后果：** 同 tick 持久化顺序判断错误。

**错误示例：**

~~~~ts
store.$patch(data) // 假定回调稍后执行
~~~~

**正确写法：**

~~~~ts
store.$patch(data) // patch 回调同步聚合一次
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 detached 当成自动清理

**触发条件：** 把 detached 当成自动清理

**原因：** detached 只脱离当前组件 scope。

**后果：** 长期 listener 在页面离开后继续执行。

**错误示例：**

~~~~ts
store.$subscribe(save, { detached: true })
~~~~

**正确写法：**

~~~~ts
const stop = store.$subscribe(save, { detached: true })
~~~~

**验证方式：** 对照正确写法验证结果。

### 给 $onAction 传 options object

**触发条件：** 给 $onAction 传 options object

**原因：** 它的 detached 是第二个布尔参数。

**后果：** 订阅没有按预期脱离 scope。

**错误示例：**

~~~~ts
store.$onAction(listener, { detached: true })
~~~~

**正确写法：**

~~~~ts
store.$onAction(listener, true)
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为 async after 立即运行

**触发条件：** 认为 async after 立即运行

**原因：** after 等待 Promise resolve。

**后果：** 指标把 pending 误记成完成。

**错误示例：**

~~~~ts
after(() => markDoneImmediately())
~~~~

**正确写法：**

~~~~ts
after((result) => markSettled(result))
~~~~

**验证方式：** 对照正确写法验证结果。

### 让 onError 吞掉错误

**触发条件：** 让 onError 吞掉错误

**原因：** 固定实现仍会 throw/reject。

**后果：** 调用方产生未处理 rejection。

**错误示例：**

~~~~ts
onError(() => false)
~~~~

**正确写法：**

~~~~ts
try { await store.save() } catch (error) { handle(error) }
~~~~

**验证方式：** 对照正确写法验证结果。

### 用订阅互相驱动业务

**触发条件：** 用订阅互相驱动业务

**原因：** 观察边界不应隐藏业务控制流。

**后果：** 两个 Store 形成难以终止的反馈环。

**错误示例：**

~~~~ts
a.$subscribe(() => b.$patch(data))
~~~~

**正确写法：**

~~~~ts
await workflow.applyChange()
~~~~

**验证方式：** 对照正确写法验证结果。
:::
