---
id: vue.pinia.learn.basics.component-store-to-refs
type: lesson
title: 组件接入与 storeToRefs
summary: 在组件中安全解构 Store，让 state 与 getter 保持响应，同时直接调用 actions
domain: frontend
technology: vue
module: pinia
related:
  - vue.pinia.learn.basics.actions-async
  - vue.core.learn.basics.reactive-state
  - vue.pinia.reference.stores.store-to-refs
tags:
  - Pinia
  - storeToRefs
  - 响应式解构
  - actions
  - 插件 state
appliesTo: Pinia 4.0.2
verifiedAt: 2026-08-05
sources:
  - title: Pinia：Using the store
    url: https://pinia.vuejs.org/core-concepts/#using-the-store
  - title: Pinia API：storeToRefs()
    url: https://pinia.vuejs.org/api/pinia/functions/storeToRefs.html
  - title: Pinia：Plugins / Adding new state
    url: https://pinia.vuejs.org/core-concepts/plugins.html#adding-new-state
  - title: Vue：reactive() 的限制
    url: https://vuejs.org/guide/essentials/reactivity-fundamentals.html#limitations-of-reactive
  - title: Pinia 4.0.2 storeToRefs.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/storeToRefs.ts
  - title: Pinia 4.0.2 storeToRefs.spec.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/storeToRefs.spec.ts
stage: basics
level: beginner
estimatedMinutes: 40
prerequisites:
  - vue.pinia.learn.basics.setup-first-store
  - vue.pinia.learn.basics.state-patch-reset
  - vue.pinia.learn.basics.getters
  - vue.pinia.learn.basics.actions-async
objectives:
  - 区分直接访问 Store 与直接解构 primitive 属性的响应性语义
  - 使用 storeToRefs() 解构 state、getter 和响应式插件字段
  - 把 action 直接从 Store 解构并保持所属 Store 上下文
  - 区分可提取的插件 ref 与可序列化插件 state
recap:
  - 直接访问 Store 会持续经过响应式代理，直接解构 primitive state/getter 只留下快照。
  - state、getter 与响应式插件字段使用 storeToRefs()；action 直接从 Store 解构。
  - 插件字段可被提取不代表已成为可序列化的正式 Store state。
---

# 组件接入与 storeToRefs

:::tip
前置：请先完成建立 Store、State/Patch/Reset、Getters 与 Actions 四课。
:::

## 响应式 Store 不等于可以随意解构

Pinia Store 是响应式对象。模板持续读取 `store.count` 时，Vue 每次都能经过代理追踪依赖；`const { count } = store` 则只在解构当下取得一个 primitive 值，后续写入不会改变这个局部快照。getter 直接解构也有同样问题。

:::compare
### 错误写法

~~~~text
const { count, doubleCount } = store
~~~~

### 正确写法

~~~~text
const { count, doubleCount } = storeToRefs(store)
~~~~
:::

## State 和 getter 转 refs，action 直接解构

`storeToRefs()` 专门遍历 Store 的响应式属性，返回 state、getters 和插件添加的响应式 state。methods 与普通非响应值会被忽略，因此 action 应直接从 Store 解构。Pinia 的 action wrapper 会在失去合格 `this` 时回到所属 Store。

~~~~ts
const store = useCounterStore()
const { count, doubleCount } = storeToRefs(store)
const { increment } = store

/** 通过解构后的 Pinia action 修改同一个 Store。 */
function increase(): void {
  increment()
}
~~~~

| Store 属性 | storeToRefs() | 组件内用法 |
| --- | --- | --- |
| state ref/reactive | 提取 | 解构 ref 后持续跟随 |
| getter/computed | 提取 | 保留缓存与依赖 |
| 插件返回的 ref/reactive | 提取 | 仍需单独判断序列化所有权 |
| action/function | 忽略 | 直接从 Store 解构 |
| 普通插件值 | 忽略 | 按普通非响应属性读取 |

## 插件字段只演示筛选，不提前讲持久化

一个插件返回 ref 时，`storeToRefs()` 能发现它；返回普通字符串时则会忽略。能被提取只说明字段具有响应性，不等于它已经同步到 `store.$state`、可以参与 SSR 序列化或重置。完整插件 state 设计属于后续插件课程。

## 在同一次操作里对比四种结果

:::demo{id="vue.pinia.learn.basics.component-store-to-refs.pinia-store-to-refs-lab-demo" playground="true"}
解构同一个 Store，观察快照、refs、action 与插件字段的差异
:::

## 源码与测试推导

:::steps
### 1. Raw Store 暴露原始响应容器

`storeToRefs.ts` 先读取 raw Store，才能看到 Setup Store 返回的 ref/computed，而不是代理已经解包的当前值。

### 2. 提取阶段保持 getter lazy

computed 分支只创建代理 getter/setter，没有读取 `.value`；固定上游测试直接断言调用 `storeToRefs()` 不会立刻求值 getter。

### 3. 响应形态决定插件字段是否出现

同一插件返回的 ref 会进入结果，普通值不会，证明筛选依据是 computed/ref/reactive，而不是“来自插件”这个标签。

### 4. Action wrapper 恢复所属 Store

固定 `store.ts` 在 action 调用没有合格 Store `this` 时回退到闭包捕获的 Store，所以解构 action 仍能读写该实例。
:::

## 易错使用提示

:::pitfalls
### 直接解构 primitive state

**触发条件：** 直接解构 primitive state

**原因：** 解构只读取一次当前值，不再经过 Store proxy。

**后果：** 界面继续显示旧值，与 Store 的最新 state 不一致。

**错误示例：**

~~~~ts
const { count } = store
~~~~

**正确写法：**

~~~~ts
const { count } = storeToRefs(store)
~~~~

**验证方式：** 对照正确写法验证结果。

### 直接解构 getter 当前值

**触发条件：** 直接解构 getter 当前值

**原因：** Store getter 在解构时已经被读取为当前结果。

**后果：** 依赖变化后局部值不再重新求值。

**错误示例：**

~~~~ts
const { doubleCount } = store
~~~~

**正确写法：**

~~~~ts
const { doubleCount } = storeToRefs(store)
~~~~

**验证方式：** 对照正确写法验证结果。

### 期待 storeToRefs() 返回 action ref

**触发条件：** 期待 storeToRefs() 返回 action ref

**原因：** 该 API 明确忽略 methods，action 不是响应式数据。

**后果：** 从结果读取 increment 得到 undefined。

**错误示例：**

~~~~ts
const { increment } = storeToRefs(store)
~~~~

**正确写法：**

~~~~ts
const { increment } = store
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 action 解构归因于 JavaScript 自动绑定

**触发条件：** 把 action 解构归因于 JavaScript 自动绑定

**原因：** 普通对象方法脱离对象后不会自动保留 this，这是 Pinia wrapper 的契约。

**后果：** 把同样假设套到普通方法或插件方法上会读取错误上下文。

**错误示例：**

~~~~ts
const { method } = plainObject
method()
~~~~

**正确写法：**

~~~~ts
const { increment } = store
increment()
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为所有插件字段都会被提取

**触发条件：** 认为所有插件字段都会被提取

**原因：** 固定实现只保留 computed、ref 或 reactive 属性。

**后果：** 普通字符串或对象不会出现在返回结果。

**错误示例：**

~~~~ts
pinia.use(() => ({ label: 'plain' }))
~~~~

**正确写法：**

~~~~ts
pinia.use(() => ({ status: ref('ready') }))
~~~~

**验证方式：** 对照正确写法验证结果。

### 把被提取等同于可序列化

**触发条件：** 把被提取等同于可序列化

**原因：** 插件 state 参与 SSR 还需要按插件指南同步进 store.$state。

**后果：** 服务端与客户端得到不同初值，hydration 所有权不清。

**错误示例：**

~~~~ts
return { status: ref('ready') }
// 假定自动进入 $state
~~~~

**正确写法：**

~~~~ts
// 在插件课程中同时定义 store 与 store.$state 所有权
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 ref(store.count) 复制 state

**触发条件：** 用 ref(store.count) 复制 state

**原因：** ref() 只用当前值初始化一份新的独立状态。

**后果：** 两份 state 后续各自变化，组件出现双重真相。

**错误示例：**

~~~~ts
const count = ref(store.count)
~~~~

**正确写法：**

~~~~ts
const { count } = storeToRefs(store)
~~~~

**验证方式：** 对照正确写法验证结果。
:::

:::exercise
### 观察解构边界

**要求：** 连续调用三次解构 action，记录直接解构快照、state ref、getter ref 与插件 ref 的变化，再确认提取键中没有 action 和普通插件字段。

**验收：** 完成题目要求。
:::
