---
id: vue.pinia.reference.core.pinia-instance
type: reference
title: Pinia 实例与应用所有权
summary: 创建、安装、取得和释放 Pinia 实例，并区分公开能力与内部实现字段
domain: frontend
technology: vue
module: pinia
related:
  - vue.pinia.reference.stores.define-store
  - vue.pinia.learn.basics.setup-first-store
  - vue.pinia.learn.intermediate.outside-components-router
  - vue.pinia.learn.advanced.store-testing
  - vue.pinia.learn.advanced.hmr-devtools-maintenance
tags:
  - Pinia
  - createPinia
  - disposePinia
  - getActivePinia
  - setActivePinia
  - piniaSymbol
  - 应用所有权
appliesTo: Pinia 4.0.2
verifiedAt: 2026-08-05
sources:
  - title: Pinia API：Pinia
    url: https://pinia.vuejs.org/api/pinia/interfaces/Pinia.html
  - title: Pinia API：createPinia
    url: https://pinia.vuejs.org/api/pinia/functions/createPinia.html
  - title: Pinia API：disposePinia
    url: https://pinia.vuejs.org/api/pinia/functions/disposePinia.html
  - title: Pinia API：getActivePinia
    url: https://pinia.vuejs.org/api/pinia/variables/getActivePinia.html
  - title: Pinia API：setActivePinia
    url: https://pinia.vuejs.org/api/pinia/variables/setActivePinia.html
  - title: Pinia Guide：组件外使用 Store
    url: https://pinia.vuejs.org/core-concepts/outside-component-usage.html
  - title: Pinia 4.0.2：rootStore.ts 固定源码
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/rootStore.ts
  - title: Pinia 4.0.2：createPinia.ts 固定源码
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/createPinia.ts
  - title: Pinia 4.0.2：lifespan 官方测试
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/lifespan.spec.ts
group: core
signature: |-
  declare function createPinia(): Pinia

  interface Pinia {
    install(app: App): void
    state: Ref<Record<string, StateTree>>
    use(plugin: PiniaPlugin): Pinia
  }

  declare function disposePinia(pinia: Pinia): void
  declare const getActivePinia: () => Pinia | undefined
  declare const setActivePinia: {
    (pinia: Pinia): Pinia
    (pinia: undefined): undefined
    (pinia: Pinia | undefined): Pinia | undefined
  }
anchors:
  - 概述
  - Pinia Interface
  - Create Pinia
  - Get Active Pinia
  - Set Active Pinia
  - Dispose Pinia
  - Internal Pinia Symbol
  - 易错使用提示
  - 源码推导与适用场景
---

# Pinia 实例与应用所有权

## 概述

一个 `Pinia` 实例拥有自己的根 state、store registry、effect scope 与插件集合。常规应用先 `createPinia()`，再通过 `app.use(pinia)` 把实例交给 Vue；SSR、多应用和并行测试则必须为各自生命周期持有独立实例。active Pinia 只是解析上下文，不是进程级单例。

## Pinia Interface

| 成员 | 分类 | 契约与边界 |
| --- | --- | --- |
| install(app) | public | 正常由 app.use(pinia) 调用，不手动绕过 Vue plugin 协议 |
| state | public | Ref&lt;Record&lt;string, StateTree&gt;&gt;；以 store id 保存根 state |
| use(plugin) | public | 登记插件并返回同一 Pinia；安装前排队，安装后直接登记 |
| _p | internal | 已安装的 store plugin 列表；应用不能读写 |
| _a | internal | 关联的 Vue App；不能当作公开 installed flag |
| _e | internal | 实例 effect scope；生命周期由 disposePinia() 管理 |
| _s | internal | store registry；不能用于业务枚举或删除 store |
| _testing | internal | @pinia/testing seam；不是应用模式开关 |

~~~~ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
~~~~

## Create Pinia

`createPinia()` 创建 detached effect scope、根 `ref({})` 与插件队列，并返回经 `markRaw()` 处理的实例。创建不等于安装；在 `app.use(pinia)` 之前，插件只进入待安装队列，组件也还没有注入上下文。每个 app、SSR request 或需要隔离的测试 fixture 都应创建自己的实例。

## Get Active Pinia

`getActivePinia()` 在 Vue injection context 内优先读取注入的实例，否则回退到当前 active variable，因此返回值可能是 `undefined`。它适合框架集成和边界诊断；普通业务优先直接调用在正确安装时机内的 `useStore()`，组件外则显式传入实例。

## Set Active Pinia

`setActivePinia()` 设置或清除 active context，并原样返回参数。Pinia 在安装和 store 创建流程中使用该 seam；测试或 SSR 代码若直接使用它，必须隔离并恢复上下文，不能把一次设置当作永久全局初始化。

~~~~ts
import { createPinia, getActivePinia, setActivePinia } from 'pinia'

const previousPinia = getActivePinia()
const pinia = createPinia()

try {
  setActivePinia(pinia)
  runIsolatedTask()
} finally {
  setActivePinia(previousPinia)
}
~~~~

## Dispose Pinia

`disposePinia(pinia)` 停止整个 effect scope，清空 store registry、插件列表和 root state，并断开 app。它主要服务测试和多实例生命周期，不等于 state reset；调用后实例不可复用，需要重新 `createPinia()`。该函数本身不会恢复或清除 active context：调用方必须保存并恢复先前实例，不能让已释放的 Pinia 继续被 `getActivePinia()` 或隐式 `useStore()` 解析。单个 `store.$dispose()` 只释放该 store，且默认保留 `pinia.state.value[id]`。

## Internal Pinia Symbol

:::warning
`piniaSymbol` 是已发布但标记 internal 的注入键，固定声明明确警告它可能在 minor 版本破坏。它只作为 testing、Storybook 等边界观察项登记；常规应用使用 `app.use(pinia)`、组件注入上下文或 `useStore(pinia)`，不要直接 import。
:::

## 易错使用提示

:::pitfalls
### 手动调用 install(app)

**触发条件：** 手动调用 install(app)

**原因：** `install()` 是 Vue plugin 协议成员，正常入口应由 Vue 管理。

**后果：** 安装时序和插件约定被绕过，应用所有权难以追踪。

**错误示例：**

~~~~ts
pinia.install(app)
~~~~

**正确写法：**

~~~~ts
app.use(pinia)
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 active Pinia 当作进程级单例

**触发条件：** 把 active Pinia 当作进程级单例

**原因：** active context 会随 injection、SSR request 和测试切换。

**后果：** 多个 app 或并发请求可能读写彼此的 store。

**错误示例：**

~~~~ts
export const shared = useAccountStore()
~~~~

**正确写法：**

~~~~ts
const account = useAccountStore(requestPinia)
~~~~

**验证方式：** 对照正确写法验证结果。

### 安装前在组件外创建 Store

**触发条件：** 安装前在组件外创建 Store

**原因：** 组件外调用没有可依赖的 injection context。

**后果：** useStore() 可能报告没有 active Pinia。

**错误示例：**

~~~~ts
const store = useSessionStore()
app.use(pinia)
~~~~

**正确写法：**

~~~~ts
app.use(pinia)
const store = useSessionStore(pinia)
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 setActivePinia() 当作永久初始化

**触发条件：** 把 setActivePinia() 当作永久初始化

**原因：** 它是上下文 seam，不提供跨任务隔离。

**后果：** 后续测试或请求会继承错误实例。

**错误示例：**

~~~~ts
setActivePinia(createPinia())
~~~~

**正确写法：**

~~~~ts
const previousPinia = getActivePinia()
try {
  setActivePinia(pinia)
  runIsolatedTask()
} finally {
  setActivePinia(previousPinia)
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 对 getActivePinia() 使用非空断言

**触发条件：** 对 getActivePinia() 使用非空断言

**原因：** 返回类型明确允许 `undefined`。

**后果：** 安装顺序错误被推迟成运行时异常。

**错误示例：**

~~~~ts
getActivePinia()!.state.value
~~~~

**正确写法：**

~~~~ts
const pinia = getActivePinia()
if (pinia) inspect(pinia.state.value)
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 disposePinia() 当作 reset

**触发条件：** 把 disposePinia() 当作 reset

**原因：** dispose 会停止 scope 并清空实例级资源。

**后果：** 继续复用已释放实例会进入不受支持状态。

**错误示例：**

~~~~ts
disposePinia(pinia)
useSessionStore(pinia)
~~~~

**正确写法：**

~~~~ts
disposePinia(pinia)
const nextPinia = createPinia()
~~~~

**验证方式：** 对照正确写法验证结果。

### 混淆 Pinia 与 Store 的释放范围

**触发条件：** 混淆 Pinia 与 Store 的释放范围

**原因：** `disposePinia()` 释放整个实例，`$dispose()` 只释放一个 store。

**后果：** 局部清理可能误伤所有 store，或误以为 root state 已删除。

**错误示例：**

~~~~ts
disposePinia(pinia) // 只想释放临时 store
~~~~

**正确写法：**

~~~~ts
temporaryStore.$dispose()
~~~~

**验证方式：** 对照正确写法验证结果。

### 依赖内部字段或 piniaSymbol

**触发条件：** 依赖内部字段或 piniaSymbol

**原因：** `_p/_a/_e/_s/_testing` 与 `piniaSymbol` 都不属于稳定应用 surface。

**后果：** minor 升级即可破坏应用代码。

**错误示例：**

~~~~ts
const stores = pinia._s
~~~~

**正确写法：**

~~~~ts
const store = useSessionStore(pinia)
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 源码推导与适用场景

:::steps
### 1. 实例隔离来自独立 scope 与 root state

固定 `createPinia.ts` 为每次调用创建 detached effect scope 和根 ref，再返回 markRaw 实例。由此可推出 app、SSR request 与隔离测试应各自持有实例。

### 2. 安装建立 Vue 上下文

`install()` 设置 active Pinia、保存 app、provide 注入键并设置 `$pinia`。这适用于解释为什么组件消费必须发生在 `app.use(pinia)` 之后。

### 3. 插件队列服从安装时序

`use(plugin)` 在 `_a` 缺席时排队，安装后才进入已登记列表。该事实只用于说明实例时序，插件完整契约留给 PRA3。

### 4. active 解析不是永久全局

`getActivePinia()` 优先 injection context，再回退 active variable。组件、guard、SSR 和测试必须让解析落到各自实例。

### 5. dispose 是实例终止操作

`disposePinia()` stop scope 并清 registry、plugins、root state 与 app 关联，但不改写 active context。它适用于测试和多实例总清理；调用方先恢复先前上下文，且之后应创建新实例，不能再隐式解析已释放实例。

### 6. 生命周期测试证明 watcher 随实例停止

固定 `lifespan.spec.ts` 验证实例释放会停止 setup store watcher。该结论说明 effect scope 的可观察后果，不把 testing package 提升为 core API。
:::
