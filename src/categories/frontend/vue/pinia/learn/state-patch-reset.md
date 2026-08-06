---
id: vue.pinia.learn.basics.state-patch-reset
type: lesson
title: State、Patch 与 Reset
summary: 选择直接赋值或批量 patch 更新状态，并理解 state 替换与 reset 的真实边界
domain: frontend
technology: vue
module: pinia
related:
  - vue.pinia.learn.basics.setup-first-store
  - vue.pinia.reference.stores.store-shape
tags:
  - Pinia
  - state
  - $patch
  - $state
  - $reset
  - $subscribe
appliesTo: Pinia 4.0.2
verifiedAt: 2026-08-04
sources:
  - title: Pinia：State
    url: https://pinia.vuejs.org/core-concepts/state.html
  - title: Pinia 4.0.2 store.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts
  - title: Pinia 4.0.2 state.spec.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/state.spec.ts
  - title: Pinia 4.0.2 store.patch.spec.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/store.patch.spec.ts
stage: basics
level: beginner
estimatedMinutes: 40
prerequisites:
  - vue.pinia.learn.basics.setup-first-store
objectives:
  - 用直接赋值表达单字段更新
  - 区分对象 patch 与函数 patch 的使用场景
  - 理解 $state 赋值不会替换内部 reactive object
  - 只在 Options Store 中使用自动 $reset()
recap:
  - 单字段直接赋值是合法用法；批量同步修改再使用 $patch。
  - $state 赋值保留当前 reactive object，Options Store 的 $reset() 重跑 state factory。
  - $patch(fn) 只聚合同步修改，不应包裹异步流程。
---

# State、Patch 与 Reset

## 直接赋值本来就是公开用法

Pinia 不要求每次状态变化都经过 action。组件中可以直接修改可写 state；单字段更新用直接赋值最清楚。需要一次表达多个字段或集合操作时，再选择 `$patch()`。是否把业务规则集中到 action 是建模决策，不是 Pinia 的写入限制。

| 写法 | 适合场景 | $subscribe mutation type |
| --- | --- | --- |
| store.count++ | 单字段、意图直接 | direct |
| $patch({ count: 2 }) | 已知字段的浅层批量更新 | patch object，带 payload |
| $patch((state) =&gt; ...) | 数组等需要原地执行的同步批量操作 | patch function |
| store.$state = next | 用新快照合并状态 | patch function |
| store.$reset() | Options Store 恢复 state factory 初始值 | patch function |

## Patch 是一次同步状态事务

对象 patch 会递归合并给定字段，并把对象保存为 mutation payload。函数 patch 让多个同步修改共享一次 mutation 通知，适合 push、splice 等集合操作；回调不是异步事务容器，不能在 await 前后维持同一批次。

~~~~ts
store.$patch({ count: 2, status: 'ready' })

store.$patch((state) => {
  state.count++
  state.tags.push('reviewed')
})
~~~~

## 替换语法仍然保留响应式对象

直接替换 Pinia 持有的 reactive state 会断开已有引用，所以 `$state` 的 setter 内部调用 `$patch()`。Options Store 的 `$reset()` 则重新执行 `state()` 工厂取得新初始值，再通过函数 patch 写回当前 Store。Setup Store 没有自动 `$reset()`。

## 对比五种写入的可观察事件

:::demo{id="vue.pinia.learn.basics.state-patch-reset.pinia-state-mutation-lab-demo" playground="true"}
在同一独立 Options Store 中执行五种写入并观察 mutation 与订阅次数
:::

## 源码与测试推导

:::steps
### 1. Patch 聚合一次通知

`store.ts` 在 patch 期间暂停普通监听标记，完成同步修改后手动向订阅者发送一次 patch mutation；固定测试也断言函数 patch 不按内部赋值次数重复通知。

### 2. Reset 重跑 state factory

Options Store 的 `$reset()` 调用原始 `state()` 取得新对象，再用 `$patch((state) =&gt; assign(state, newState))` 写回，因此它恢复的是工厂定义的初值。
:::

## 易错使用提示

:::pitfalls
### 把直接赋值当作违规操作

**触发条件：** 把直接赋值当作违规操作

**原因：** Pinia state 是可写的，直接赋值是正式支持的 mutation。

**后果：** 为每个简单字段制造空壳 action，反而掩盖真正的业务动作。

**错误示例：**

~~~~ts
store.$patch({ count: store.count + 1 })
~~~~

**正确写法：**

~~~~ts
store.count++
~~~~

**验证方式：** 对照正确写法验证结果。

### 把对象 patch 当作完整替换

**触发条件：** 把对象 patch 当作完整替换

**原因：** $patch(object) 会合并字段，不会删除 payload 中缺失的旧字段。

**后果：** 旧数据继续存在，得到混合了两份快照的状态。

**错误示例：**

~~~~ts
store.$patch({ name: 'Ada' }) // 期望删除 role
~~~~

**正确写法：**

~~~~ts
store.$patch({ name: 'Ada', role: undefined })
~~~~

**验证方式：** 对照正确写法验证结果。

### 在函数 patch 中等待异步结果

**触发条件：** 在函数 patch 中等待异步结果

**原因：** 函数 patch 的聚合边界只覆盖同步回调执行。

**后果：** await 后的写入脱离原批次，错误处理与事件归属变得含糊。

**错误示例：**

~~~~ts
store.$patch(async (state) => {
  state.user = await loadUser()
})
~~~~

**正确写法：**

~~~~ts
const user = await loadUser()
store.$patch({ user })
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为 $state 会替换 reactive object

**触发条件：** 认为 $state 会替换 reactive object

**原因：** $state setter 内部仍调用 patch，以保留现有响应式连接。

**后果：** 按对象身份设计的清理或订阅逻辑与实际行为不一致。

**错误示例：**

~~~~ts
store.$state = next
// 假定旧引用已经失效
~~~~

**正确写法：**

~~~~ts
store.$state = next
// 将其理解为一次状态 patch
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 Setup Store 调用自动 $reset()

**触发条件：** 在 Setup Store 调用自动 $reset()

**原因：** Setup Store 的初始状态来自任意 ref/composable，Pinia 无法自动推导重置规则。

**后果：** 运行时抛出 Setup Store 不支持内置 reset 的错误。

**错误示例：**

~~~~ts
const useStore = defineStore('setup', () => ({ count: ref(0) }))
useStore().$reset()
~~~~

**正确写法：**

~~~~ts
function reset(): void {
  count.value = 0
}
~~~~

**验证方式：** 对照正确写法验证结果。
:::
