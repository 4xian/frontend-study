---
id: vue.pinia.reference.runtime.hmr
type: reference
title: Vite Store HMR 接入
summary: 查询 acceptHMRUpdate() 的 Vite 接法、Store identity、迁移与证据边界
domain: frontend
technology: vue
module: pinia
related:
  - vue.pinia.reference.stores.define-store
  - vue.pinia.reference.observation.subscriptions
  - vue.pinia.reference.runtime.hydration
  - vue.pinia.learn.advanced.hmr-devtools-maintenance
  - vue.pinia.learn.intermediate.subscriptions-actions
tags:
  - Pinia
  - acceptHMRUpdate
  - Vite
  - HMR
  - StoreDefinition
  - hot update
appliesTo: Pinia 4.0.2
verifiedAt: 2026-08-05
sources:
  - title: Pinia API：acceptHMRUpdate
    url: https://pinia.vuejs.org/api/pinia/functions/acceptHMRUpdate.html
  - title: Pinia Guide：Hot Module Replacement
    url: https://pinia.vuejs.org/cookbook/hot-module-replacement.html
  - title: Pinia 4.0.2：hmr.ts 固定源码
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/hmr.ts
  - title: Pinia 4.0.2：store.ts 固定源码
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts
  - title: Pinia 4.0.2：HMR 官方测试
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/hmr.spec.ts
  - title: "Pinia Issue #2611：Setup Store HMR runtime-added property"
    url: https://github.com/vuejs/pinia/issues/2611
group: runtime
signature: |-
  declare function acceptHMRUpdate<
    Id extends string = string,
    S extends StateTree = StateTree,
    G extends _GettersTree<S> = _GettersTree<S>,
    A = _ActionsTree,
  >(
    initialUseStore: StoreDefinition<Id, S, G, A>,
    hot: any,
  ): (newModule: any) => any
anchors:
  - 概述
  - Accept HMR Update
  - Vite 接入与 Production 边界
  - Store Identity 与 Shape 更新
  - 订阅连续性与证据状态
  - 易错使用提示
  - 源码推导与适用场景
---

# Vite Store HMR 接入

## 一、概述

`acceptHMRUpdate()` 把一个 StoreDefinition 接入 Vite hot lifecycle，使开发期编辑 state、getters 或 actions 时尽量保留已经运行的 Store state。它不是 production migration，也不替代持久化 schema upgrade。

:::tip
签名中的 `_GettersTree` 与 `_ActionsTree` 只是公开函数声明的内部泛型约束。应用只使用 `acceptHMRUpdate()`、`defineStore()` 返回值和 Vite 的 `import.meta.hot`。
:::

## 二、Accept HMR Update

helper 接收初始 Store definition 与当前 hot context，返回交给 Vite accept 的 callback。开发期 callback 从 `hot.data.pinia` 或 initial definition 取得 Pinia，把它保存回 `hot.data`，再遍历新模块 exports；只有形如 StoreDefinition 且 registry 已有对应 id 的 export 才会更新。

## 三、Vite 接入与 Production 边界

~~~~ts
import { acceptHMRUpdate, defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCounterStore, import.meta.hot))
}
~~~~

官方接法把 guard 放在 Store definition 文件旁。固定 runtime 在 production 直接返回 no-op callback，因此 HMR 不会在正式升级、持久化数据迁移或 SSR 恢复时执行。

## 四、Store Identity 与 Shape 更新

Store ID 是 HMR identity，必须保持稳定。固定流程先按新 `$id` 查询 registry，再比较 initial id；改名可能导致更新被跳过，命中特定条件时也可能触发 invalidation，不能概括成“总保留”或“总 reload”。

| 更新面 | 固定测试覆盖 | 迁移边界 |
| --- | --- | --- |
| state | 新增、删除、响应性与 shape | 尽量保留既有运行值 |
| action | 新增、删除与实现替换 | 开发反馈，不是生产版本迁移 |
| getter | 新增、删除与依赖更新 | 保持 Store proxy 的公开访问方式 |
| nested state | Options plain object 与 Setup ref object | 两条迁移路径不能抽象为同一个普通 deep merge |

Options Store 的 nested plain object 按新 definition shape 合并同名旧值；Setup Store 的 ref object 保留旧运行值。应用只依赖 Pinia 的公开 HMR helper，不复制 internal migration，也不调用 `_hotUpdate` 或读取 `_s/_pinia`。

## 五、订阅连续性与证据状态

| 能力 | Pinia 4.0.2 官方测试状态 | 应用策略 |
| --- | --- | --- |
| $subscribe() | `it.todo`，跨 HMR 连续性未保证 | owner 在更新后可重建状态订阅 |
| $onAction() | `it.todo`，跨 HMR 连续性未保证 | owner 在更新后可重建 Action 订阅 |

成员更新测试通过不能推出两类 observer 会跨更新继续工作。本页未触发真实 Vite file update，也未验证 module graph、file event、accept 或 invalidation；真实 HMR 与订阅连续性证据均为 `Deferred/not-run`。Devtools client 是相邻但不同的能力，普通 DOM 状态、callback unit model 或截图都不能替代它。

## 六、易错使用提示

:::pitfalls
### 只定义 Store 而不注册 accept

**触发条件：** 只定义 Store 而不注册 accept

**原因：** Vite 需要模块显式接受 hot update。

**后果：** 文件更新时 Pinia 没有 accept handler。

**错误示例：**

~~~~ts
export const useStore = defineStore('main', {})
~~~~

**正确写法：**

~~~~ts
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStore, import.meta.hot))
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 无 guard 访问 import.meta.hot

**触发条件：** 无 guard 访问 import.meta.hot

**原因：** hot context 只在支持 HMR 的开发环境存在。

**后果：** 环境与类型边界不清。

**错误示例：**

~~~~ts
import.meta.hot.accept(acceptHMRUpdate(useStore, import.meta.hot))
~~~~

**正确写法：**

~~~~ts
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStore, import.meta.hot))
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 HMR 当作 production migration

**触发条件：** 把 HMR 当作 production migration

**原因：** production helper 返回空 callback。

**后果：** 正式升级时持久化 schema 没有任何迁移执行。

**错误示例：**

~~~~ts
acceptHMRUpdate(useStore, hot) // 迁移 v1 到 v2
~~~~

**正确写法：**

~~~~ts
const state = migratePersistedState(payload.version, payload)
~~~~

**验证方式：** 对照正确写法验证结果。

### 更改 Store ID 并期待保留 state

**触发条件：** 更改 Store ID 并期待保留 state

**原因：** registry 使用 Store ID 识别 HMR 目标。

**后果：** 更新可能被跳过或触发 invalidation。

**错误示例：**

~~~~ts
defineStore('renamed-counter', {})
~~~~

**正确写法：**

~~~~ts
defineStore('counter', {}) // HMR 期间保持稳定 identity
~~~~

**验证方式：** 对照正确写法验证结果。

### 统一复制 nested deep merge

**触发条件：** 统一复制 nested deep merge

**原因：** Options plain object 与 Setup ref object 走不同迁移路径。

**后果：** shape 或 runtime-added 属性处理错误。

**错误示例：**

~~~~ts
deepMerge(oldState, newState)
~~~~

**正确写法：**

~~~~ts
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStore, import.meta.hot))
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 用成员更新推断订阅连续性

**触发条件：** 用成员更新推断订阅连续性

**原因：** 官方只固定 state、action 与 getter 的成员更新行为。

**后果：** 把尚未保证的两类 observer 写成 green。

**错误示例：**

~~~~ts
expect(actionsUpdated).toBe(true) // 因此订阅仍存在
~~~~

**正确写法：**

~~~~ts
const stop = reconnectObserversAfterHotUpdate(store)
~~~~

**验证方式：** 对照正确写法验证结果。

### 直接调用 internal hot surface

**触发条件：** 直接调用 internal hot surface

**原因：** `_hotUpdate/_s/_pinia` 不是应用稳定接口。

**后果：** 升级时依赖内部 registry 与 payload 结构。

**错误示例：**

~~~~ts
store._hotUpdate(payload)
~~~~

**正确写法：**

~~~~ts
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStore, import.meta.hot))
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 手工调用 callback 证明真实 HMR

**触发条件：** 手工调用 callback 证明真实 HMR

**原因：** 函数调用没有覆盖 Vite module graph 与 file event。

**后果：** accept 与 invalidation 的 runtime 路径被遗漏。

**错误示例：**

~~~~ts
acceptHMRUpdate(useStore, fakeHot)(newModule)
~~~~

**正确写法：**

~~~~ts
// 由真实 Vite 文件更新形成端到端证据
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 七、源码推导与适用场景

:::steps
### 1. Helper 只属于开发期

固定 `hmr.ts` 在 production 返回空 callback，因此不能把 HMR 当作 production migration。适用于划清正式升级与开发反馈的边界。

### 2. Vite hot lifecycle 才能复用实例

dev callback 把 Pinia 保存到 `hot.data` 并筛选新模块 Store exports。适用于 definition 文件旁的官方 accept snippet。

### 3. ID 改名结果受 registry 条件影响

helper 先查 `pinia._s.has(newId)`，再比较 initial id，因此只能冻结“ID 必须稳定”，不能推出无条件 invalidate。适用于 Store 重命名决策。

### 4. Shape 更新保留开发交互上下文

固定 `store.ts` 的 internal hot update 增删 state、action 与 getter，并尽量保留已有 state。适用于局部开发反馈，不替代数据迁移。

### 5. 两种 Store 不能统一描述为 deep merge

Options nested plain object 以新 shape 合并旧值，Setup ref object 保留旧运行值。适用于解释 issue #2611 的修复边界。

### 6. Observer 连续性仍未保证

固定 `hmr.spec.ts` 已覆盖成员更新，却把状态订阅与 Action 订阅连续性留为待办。适用于采用可重建 observer 的保守维护策略。

### 7. Callback model 不是浏览器 HMR green

官方 Guide 给出 Vite 接法，但本项目没有真实 file-update seam。适用于把 runtime evidence 明确保留为 deferred。
:::
