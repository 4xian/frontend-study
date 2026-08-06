---
id: vue.pinia.learn.intermediate.store-composition
type: lesson
title: Store 组合
summary: 用 computed 与 action 延迟跨 Store 读取，建立可终止的依赖方向
domain: frontend
technology: vue
module: pinia
related:
  - vue.pinia.learn.intermediate.setup-stores
  - vue.pinia.learn.basics.actions-async
  - vue.pinia.reference.stores.define-store
tags:
  - Pinia
  - Store 组合
  - computed
  - action
  - 循环依赖
appliesTo: Pinia 4.0.2
verifiedAt: 2026-08-05
sources:
  - title: Pinia：Composing Stores
    url: https://pinia.vuejs.org/cookbook/composing-stores.html
  - title: Pinia 4.0.2 store.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts
  - title: Pinia 4.0.2 combinedStores.spec.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/combinedStores.spec.ts
  - title: Pinia 4.0.2 getters.spec.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/getters.spec.ts
stage: intermediate
level: intermediate
estimatedMinutes: 42
prerequisites:
  - vue.pinia.learn.basics.setup-first-store
  - vue.pinia.learn.basics.state-patch-reset
  - vue.pinia.learn.basics.getters
  - vue.pinia.learn.basics.actions-async
  - vue.pinia.learn.basics.component-store-to-refs
  - vue.pinia.learn.intermediate.setup-stores
objectives:
  - 在 getter、computed 与 action 中读取另一个 Store
  - 区分互相取得实例与 setup 创建期即时互读
  - 让跨 Store action 保留清晰的 state 所有者
  - 识别 SSR 异步 action 首个 await 前的取 Store 边界
recap:
  - Store 可以互相取得实例，限制在创建期即时互读和运行时递归。
  - 跨 Store 派生值用 getter/computed，业务流程用明确的协调 action。
  - SSR 异步 action 在首个 await 前取得所需 Store。
---

# Store 组合

:::tip
前置：请先完成 L01-L06，尤其要理解 Setup Store、computed 和 action。
:::

## 组合不等于取消边界

Store 可以调用另一个 Store。关键不是禁止依赖，而是让状态仍由明确的 Store 拥有：派生展示放在 getter/computed，跨职责流程放在一个协调 action，被调用 Store 通过自己的 action 修改 state。

| 位置 | 适合做什么 | 需要避免 |
| --- | --- | --- |
| setup 顶层 | 取得另一个 Store 实例 | 双方立即读取对方 state |
| getter / computed | 持续追踪另一个 Store 的响应式值 | 两个 getter 互相求值 |
| action | 按用户操作协调多个职责 | 无终止条件地互相调用 |

## 循环边界在读取时机

固定 4.0.2 源码会在执行 Setup Store 前先登记 partial store，因此 A、B 可以先互相取得实例；这不代表对方的返回属性已经初始化。双方都在 setup 创建期立即读取对方 state 会依赖不完整顺序，应把真实读取推迟到 computed 或 action。

~~~~ts
export const useCartStore = defineStore('cart', () => {
  const session = useSessionStore()
  const items = ref<string[]>([])
  const summary = computed(() => `${session.name} · ${items.value.length} 件`)

  /** 由购物车自己修改商品列表。 */
  function addItem(item: string): void {
    items.value.push(item)
  }

  return { items, summary, addItem }
})
~~~~

:::warning
延迟读取不会自动消除所有递归。两个 computed 互相求值，或两个 action 无终止地互调，仍会形成运行时循环。
:::

## 组合实验

:::demo{id="vue.pinia.learn.intermediate.store-composition.pinia-store-composition-lab-demo" playground="true"}
观察 session/cart 互相取得实例后，computed 与 action 才读取对方 state
:::

## 练习与观察

:::steps
### 1. 观察创建阶段

确认 setup 记录只有取得实例，没有读取对方 state。

### 2. 修改两侧状态

加入商品并切换会员，观察 computed 持续更新。

### 3. 触发协调 action

让 session action 在调用时读取 cart 当前数量。

### 4. 画出依赖方向

标明哪个 Store 拥有 state，哪个入口只负责协调。
:::

## 源码与测试推导

:::steps
### 1. partial store 先进入 registry

固定 store.ts 先登记实例再执行 setup，所以互相取得 identity 可行；尚未返回的属性仍不可安全即时读取。

### 2. 官方组合测试把读取放在 action

combinedStores.spec.ts 证明 A/B 可互相取得并在 action 执行期交互。

### 3. computed 持续追踪跨 Store 依赖

getter 测试证明另一个 Store 更新后派生值会重新求值，而不是 setup 快照。

### 4. action wrapper 会激活所属 Pinia

这支持同步组合，但 SSR 异步流程仍应在首个 await 前取得所需 Store。

### 5. 循环规则不等于目录规则

官方约束读取时机与递归；文件拆分方式仍由应用职责决定。

### 6. 当前 Demo 的证据边界

它证明浏览器 SPA 内的隔离组合，不冒充真实 SSR 请求上下文。
:::

## 易错使用提示

:::pitfalls
### 把互相 useStore 当成绝对禁止

**触发条件：** 把互相 useStore 当成绝对禁止

**原因：** 双方可以先取得已登记的实例。

**后果：** 为规避不存在的限制而合并成难维护的总 Store。

**错误示例：**

~~~~ts
// A 与 B 永远不能互相取得实例
~~~~

**正确写法：**

~~~~ts
const other = useOtherStore() // 只取得实例
~~~~

**验证方式：** 对照正确写法验证结果。

### 双方在 setup 顶层立即互读

**触发条件：** 双方在 setup 顶层立即互读

**原因：** 此时另一侧可能尚未完成初始化。

**后果：** 读取 undefined 或进入不稳定的创建顺序。

**错误示例：**

~~~~ts
const snapshot = other.count
~~~~

**正确写法：**

~~~~ts
const current = computed(() => other.count)
~~~~

**验证方式：** 对照正确写法验证结果。

### 把一次读取当成持续派生

**触发条件：** 把一次读取当成持续派生

**原因：** 普通赋值只保存当前值。

**后果：** 另一个 Store 更新后界面仍显示旧快照。

**错误示例：**

~~~~ts
const label = other.name
~~~~

**正确写法：**

~~~~ts
const label = computed(() => other.name)
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为 computed 能消除所有循环

**触发条件：** 认为 computed 能消除所有循环

**原因：** computed 仍可能在求值时互相递归。

**后果：** 读取派生值时堆栈溢出。

**错误示例：**

~~~~ts
const a = computed(() => b.value + 1)
~~~~

**正确写法：**

~~~~ts
const total = computed(() => cart.subtotal - session.discount)
~~~~

**验证方式：** 对照正确写法验证结果。

### 跨 Store action 直接接管对方 state

**触发条件：** 跨 Store action 直接接管对方 state

**原因：** 修改责任不再属于 state 的拥有者。

**后果：** 业务规则散落在多个 Store。

**错误示例：**

~~~~ts
other.items = []
~~~~

**正确写法：**

~~~~ts
other.clearItems()
~~~~

**验证方式：** 对照正确写法验证结果。

### 让 action 无终止地互相调用

**触发条件：** 让 action 无终止地互相调用

**原因：** action 不会自动阻止运行时递归。

**后果：** 用户操作导致无限调用。

**错误示例：**

~~~~ts
a.run() // a.run 又调用 b.run
~~~~

**正确写法：**

~~~~ts
checkout.run() // 单一协调入口
~~~~

**验证方式：** 对照正确写法验证结果。

### 在首个 await 后隐式取得 Store

**触发条件：** 在首个 await 后隐式取得 Store

**原因：** SSR 恢复执行时 active Pinia 可能已经变化。

**后果：** 并发请求可能读到错误实例。

**错误示例：**

~~~~ts
await load()
const cart = useCartStore()
~~~~

**正确写法：**

~~~~ts
const cart = useCartStore()
await load()
~~~~

**验证方式：** 对照正确写法验证结果。

### 为消除依赖而建立总 Store

**触发条件：** 为消除依赖而建立总 Store

**原因：** 合并所有职责并没有修复读取时机。

**后果：** 状态、派生值和副作用失去所有者。

**错误示例：**

~~~~ts
useEverythingStore()
~~~~

**正确写法：**

~~~~ts
useSessionStore(); useCartStore()
~~~~

**验证方式：** 对照正确写法验证结果。
:::
