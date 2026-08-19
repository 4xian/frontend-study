---
id: vue.pinia.learn.basics.getters
type: lesson
title: Getters
summary: 用缓存派生值表达 Store 状态关系，并保持 getter 纯净、响应式且类型清晰
domain: frontend
technology: vue
module: pinia
related:
  - vue.pinia.learn.basics.state-patch-reset
  - vue.core.learn.basics.computed-properties
  - vue.pinia.reference.stores.store-shape
tags:
  - Pinia
  - getters
  - computed
  - 派生状态
  - TypeScript
appliesTo: Pinia 4.0.2
verifiedAt: 2026-08-04
sources:
  - title: Pinia：Getters
    url: https://pinia.vuejs.org/core-concepts/getters.html
  - title: Pinia 4.0.2 getters.spec.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/getters.spec.ts
  - title: Pinia 4.0.2 store.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts
stage: basics
level: beginner
estimatedMinutes: 40
prerequisites:
  - vue.pinia.learn.basics.setup-first-store
  - vue.pinia.learn.basics.state-patch-reset
objectives:
  - 用 state 参数声明单 Store 派生值
  - 理解 getter 的 computed 缓存与依赖失效
  - 安全访问同 Store 的其他 getter 和另一个 Store
  - 保持 getter 无副作用并为 this 写法标注返回类型
recap:
  - Getter 是 computed 派生值，会缓存并按实际响应式依赖失效。
  - 使用 this 访问其他 getter 时显式标注返回类型。
  - 跨 Store 读取放在 getter 求值内，且 getter 不执行副作用。
---

# Getters

## 一、Getter 是 Store 上的计算属性

Getter 根据 state 或其他响应式来源计算结果。Pinia 把 Options Store getter 包装成 Vue `computed()`：重复读取会复用缓存，只有实际依赖变化后才在下次读取时重新求值。与 state 无关的字段变化不会让 getter 失效。

~~~~ts
export const useCartStore = defineStore('cart', {
  state: () => ({ price: 80, quantity: 2 }),
  getters: {
    subtotal: (state) => state.price * state.quantity,
    /** 读取同 Store 的另一个 getter。 */
    summary(): string {
      return '小计：' + this.subtotal
    },
  },
})
~~~~

:::tip
箭头 getter 使用 state 参数时通常可以自动推导返回类型；通过 `this` 访问其他 getter 时，TypeScript 的限制要求显式写出返回类型。
:::

## 二、跨 Store 读取仍然保留响应式依赖

Getter 可以在求值时调用另一个 `useStore()`。Pinia 会把当前容器设为 active Pinia，另一个 Store 的 state/getter 读取仍被 computed 收集为依赖。不要在模块顶层提前取值形成普通快照。

~~~~ts
const useTaxStore = defineStore('tax', {
  state: () => ({ rate: 0.1 }),
})

const useCartStore = defineStore('cart', {
  state: () => ({ subtotal: 100 }),
  getters: {
    /** 根据另一个 Store 的当前税率派生总价。 */
    total(state): number {
      const tax = useTaxStore()
      return state.subtotal * (1 + tax.rate)
    },
  },
})
~~~~

## 三、用确定计数观察缓存

Demo 的运行次数只是教学仪表，不是业务 getter 应有的副作用。连续读取、修改无关备注、修改价格和修改另一个 Store 的税率，会分别显示哪些依赖使缓存保持或失效；不使用毫秒耗时作为正确性证据。

:::demo{id="vue.pinia.learn.basics.getters.pinia-getter-dependency-lab-demo" playground="true"}
用确定性求值计数器观察单 Store 与跨 Store getter 的缓存依赖
:::

## 四、源码与测试推导

:::steps
### 1. Options getter 包装为 computed

`store.ts` 为每个 getter 创建 computed，并在求值前设置当前 active Pinia；因此缓存、脏标记和依赖追踪沿用 Vue computed 的语义。

### 2. 跨 Store 依赖会失效缓存

固定 `getters.spec.ts` 覆盖 getter 中调用另一个 Store 的场景；依赖 Store 的 state 变化后，下一次读取会得到重新计算的值。
:::

## 五、易错使用提示

:::pitfalls
### 在 getter 中写入 state

**触发条件：** 在 getter 中写入 state

**原因：** Getter 应只描述派生关系，写入会把读取动作变成隐式命令。

**后果：** 求值可能触发循环更新，缓存次数也不再可预测。

**错误示例：**

~~~~ts
total(state) {
  state.reads++
  return state.price
}
~~~~

**正确写法：**

~~~~ts
total: (state) => state.price * state.quantity
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 getter 执行请求或写 storage

**触发条件：** 用 getter 执行请求或写 storage

**原因：** Getter 可能因任意消费者读取而执行，调用时机不属于业务流程。

**后果：** 渲染和日志读取都可能重复触发外部副作用。

**错误示例：**

~~~~ts
profile() {
  return fetch('/api/profile')
}
~~~~

**正确写法：**

~~~~ts
async loadProfile() {
  this.profile = await fetchProfile()
}
~~~~

**验证方式：** 对照正确写法验证结果。

### this getter 省略返回类型

**触发条件：** this getter 省略返回类型

**原因：** TypeScript 无法在对象字面量的循环 this 推导中可靠得到返回类型。

**后果：** getter 变成隐式 any，或类型检查报告递归引用错误。

**错误示例：**

~~~~ts
summary() {
  return String(this.total)
}
~~~~

**正确写法：**

~~~~ts
summary(): string {
  return String(this.total)
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 在模块顶层保存跨 Store 快照

**触发条件：** 在模块顶层保存跨 Store 快照

**原因：** 普通变量只保存读取时的值，不再连接另一个 Store 的响应式依赖。

**后果：** 源 Store 更新后派生结果仍使用旧数据。

**错误示例：**

~~~~ts
const rate = useTaxStore().rate
const total = price * (1 + rate)
~~~~

**正确写法：**

~~~~ts
total(): number {
  return this.price * (1 + useTaxStore().rate)
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 用耗时判断 getter 是否缓存

**触发条件：** 用耗时判断 getter 是否缓存

**原因：** 墙钟耗时受设备、调度和开发工具影响，不是确定性证据。

**后果：** 同一实现可能在不同运行中得到相反结论。

**错误示例：**

~~~~ts
const cached = performance.now() - start < 1
~~~~

**正确写法：**

~~~~ts
expect(runCount).toBe(1)
~~~~

**验证方式：** 对照正确写法验证结果。
:::
