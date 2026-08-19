---
id: vue.pinia.learn.basics.setup-first-store
type: lesson
title: 建立第一个 Store
summary: 从 Pinia 实例、插件安装和 Store 定义开始，建立清晰的应用级状态所有权
domain: frontend
technology: vue
module: pinia
related:
  - vue.core.reference.application.create-app
  - vue.pinia.reference.core.pinia-instance
tags:
  - Pinia
  - createPinia
  - defineStore
  - useStore
  - app.use
appliesTo: Pinia 4.0.2
verifiedAt: 2026-08-04
sources:
  - title: Pinia：Getting Started
    url: https://pinia.vuejs.org/getting-started.html
  - title: Pinia：Defining a Store
    url: https://pinia.vuejs.org/core-concepts/
  - title: Pinia 4.0.2 createPinia.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/createPinia.ts
  - title: Pinia 4.0.2 store.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts
stage: basics
level: beginner
estimatedMinutes: 35
prerequisites:
  - vue.core.learn.basics.component-basics
objectives:
  - 区分 Pinia 实例、Store 定义函数与 Store 实例
  - 在根应用挂载前安装唯一属于该应用的 Pinia
  - 理解 Store 在首次 useStore() 时才被创建和注册
  - 用稳定且唯一的字符串标识 Store
recap:
  - createPinia() 创建应用级状态容器，app.use(pinia) 建立组件注入边界。
  - defineStore() 返回定义函数，首次 useStore() 才在目标 Pinia 中创建实例。
  - Store ID 必须稳定唯一，Store 生命周期不等于单个组件生命周期。
---

# 建立第一个 Store

:::tip
前置：Vue 应用与组件基础。请先理解应用挂载、组件 setup 与事件交互，再开始本课。
:::

## 一、三个对象分担三种职责

`createPinia()` 创建应用级容器，`defineStore()` 创建可复用的 Store 定义函数，调用这个定义函数才取得某个 Pinia 容器里的 Store 实例。定义阶段不创建业务状态，也不会自动把实例注册进任何应用。

| 对象 | 创建时机 | 主要职责 |
| --- | --- | --- |
| Pinia | createPinia() | 持有 root state、插件、effect scope 与 Store registry |
| Store 定义 | defineStore(id, options) | 保存稳定 ID 与创建 Store 所需的配置 |
| Store 实例 | 首次 useStore() | 承载当前 Pinia 中的 state、getters 与 actions |

## 二、先安装 Pinia，再挂载应用

`app.use(pinia)` 会设置当前应用组件可注入的 Pinia。组件 setup 内调用 `useStore()` 时可以从注入上下文取得它；在组件外调用时则应等待插件安装完成，或显式把目标 Pinia 传给 `useStore(pinia)`。

~~~~ts
import { createApp } from 'vue'
import { createPinia, defineStore } from 'pinia'
import App from './App.vue'

export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    /** 增加当前计数。 */
    increment(): void {
      this.count++
    },
  },
})

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.mount('#app')
~~~~

:::tip
Store ID 属于同一个 Pinia 容器里的全局身份，不是文件名或变量名。使用可搜索、不会重复的业务名称，并保持发布后稳定。
:::

## 三、观察定义与首次使用的边界

下面的 Demo 创建独立 mini-app 和独立 Pinia。重建时先只有 Store 定义；挂载后根组件首次调用 `useStore()`，registry 才从 0 变为 1。按钮修改的状态只属于这份 mini-app，宿主课程 URL 不会变化。

:::demo{id="vue.pinia.learn.basics.setup-first-store.pinia-first-store-lab-demo" playground="true"}
重建独立 Pinia，观察 defineStore 与首次 useStore 的创建时机
:::

## 四、源码与测试推导

:::steps
### 1. Pinia 是所有权边界

`createPinia.ts` 把 effect scope、root state、待安装插件和 Store registry 都放在返回的 Pinia 实例上，因此两次 createPinia() 会形成两个隔离容器。

### 2. useStore 才创建实例

`store.ts` 先按 ID 查询当前 Pinia 的 registry；不存在时创建 Options 或 Setup Store 并注册，所以 defineStore() 本身只是定义工厂。
:::

## 五、易错使用提示

:::pitfalls
### 把 defineStore() 的返回值当作 Store 实例

**触发条件：** 把 defineStore() 的返回值当作 Store 实例

**原因：** defineStore() 返回的是 useStore 定义函数，尚未绑定任何 Pinia。

**后果：** 直接读取 count 得到 undefined，也绕过了正确的实例创建时机。

**错误示例：**

~~~~ts
const counter = defineStore('counter', options)
console.log(counter.count)
~~~~

**正确写法：**

~~~~ts
const useCounterStore = defineStore('counter', options)
const counter = useCounterStore()
~~~~

**验证方式：** 对照正确写法验证结果。

### 在插件安装前依赖隐式 active Pinia

**触发条件：** 在插件安装前依赖隐式 active Pinia

**原因：** 组件外没有可注入的应用上下文，过早调用无法知道目标容器。

**后果：** 运行时抛出没有 active Pinia 的错误，或错误复用其他应用的容器。

**错误示例：**

~~~~ts
const counter = useCounterStore()
app.use(pinia)
~~~~

**正确写法：**

~~~~ts
app.use(pinia)
const counter = useCounterStore(pinia)
~~~~

**验证方式：** 对照正确写法验证结果。

### 重复使用同一个 Store ID

**触发条件：** 重复使用同一个 Store ID

**原因：** 同一 Pinia 通过 ID 定位实例，变量名和文件路径不会参与身份判断。

**后果：** 两份不相关定义竞争同一实例，状态和类型意图发生混淆。

**错误示例：**

~~~~ts
defineStore('settings', userOptions)
defineStore('settings', workspaceOptions)
~~~~

**正确写法：**

~~~~ts
defineStore('user-settings', userOptions)
defineStore('workspace-settings', workspaceOptions)
~~~~

**验证方式：** 对照正确写法验证结果。

### 为每个组件创建新的 Pinia

**触发条件：** 为每个组件创建新的 Pinia

**原因：** Pinia 是应用级容器，不是组件本地状态工厂。

**后果：** 组件之间无法共享 Store，插件也会被反复安装。

**错误示例：**

~~~~ts
setup() {
  return useCounterStore(createPinia())
}
~~~~

**正确写法：**

~~~~ts
const pinia = createPinia()
app.use(pinia)
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为组件卸载会自动删除 Store

**触发条件：** 认为组件卸载会自动删除 Store

**原因：** Store 由 Pinia 持有，生命周期与任一消费组件不同。

**后果：** 重新进入页面时仍读取旧状态，清理假设与真实行为不一致。

**错误示例：**

~~~~ts
onUnmounted(() => {
  // 假定 Store 已自动销毁
})
~~~~

**正确写法：**

~~~~ts
const store = useCounterStore()
store.$reset()
~~~~

**验证方式：** 对照正确写法验证结果。
:::
