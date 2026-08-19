---
id: vue.pinia.learn.intermediate.outside-components-router
type: lesson
title: 组件外使用与路由集成
summary: 在 app 安装后、Router guard 内或显式 Pinia 上取得正确的 Store 实例
domain: frontend
technology: vue
module: pinia
related:
  - vue.pinia.learn.intermediate.subscriptions-actions
  - vue.router.learn.intermediate.meta-navigation-guards
  - vue.pinia.reference.core.pinia-instance
tags:
  - Pinia
  - 组件外使用
  - Vue Router
  - navigation guard
  - active Pinia
appliesTo: Pinia 4.0.2 / Vue Router 5.2.0
verifiedAt: 2026-08-05
sources:
  - title: Pinia：Using a store outside of a component
    url: https://pinia.vuejs.org/core-concepts/outside-component-usage.html
  - title: Pinia：Server Side Rendering
    url: https://pinia.vuejs.org/ssr/
  - title: Vue：app.runWithContext()
    url: https://vuejs.org/api/application.html#app-runwithcontext
  - title: Vue Router：Global injections within guards
    url: https://router.vuejs.org/guide/advanced/navigation-guards.html#global-injections-within-guards
  - title: Vue Router：createMemoryHistory()
    url: https://router.vuejs.org/api/functions/createMemoryHistory.html
  - title: Pinia 4.0.2 createPinia.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/createPinia.ts
  - title: Pinia 4.0.2 store.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts
  - title: Pinia 4.0.2 ssr.spec.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/ssr.spec.ts
stage: intermediate
level: intermediate
estimatedMinutes: 48
prerequisites:
  - vue.pinia.learn.basics.setup-first-store
  - vue.pinia.learn.basics.state-patch-reset
  - vue.pinia.learn.basics.getters
  - vue.pinia.learn.basics.actions-async
  - vue.pinia.learn.basics.component-store-to-refs
  - vue.pinia.learn.intermediate.setup-stores
  - vue.pinia.learn.intermediate.store-composition
  - vue.pinia.learn.intermediate.store-modeling
  - vue.pinia.learn.intermediate.subscriptions-actions
  - vue.router.learn.basics.setup-first-router
objectives:
  - 区分 defineStore 工厂与调用 useStore 的时机
  - 在 Router guard 回调内延迟取得 Store
  - 在组件外通过显式 useStore(pinia) 固定实例归属
  - 理解 SPA active fallback 与 SSR 请求隔离的差别
recap:
  - defineStore 可以提前，useStore 必须在 Pinia 可用后执行。
  - Router guard 内延迟调用可避开 import/install 时序风险。
  - 多 app、测试与 SSR 使用显式 useStore(pinia) 固定实例归属。
  - memory router 证据不等同于真实 SSR 请求隔离。
---

# 组件外使用与路由集成

:::tip
前置：请先完成 L01-L09，并掌握 Vue Router 的创建、memory history 和全局导航守卫。
:::

## 一、定义可以提前，调用必须等上下文

`defineStore()` 只创建 StoreDefinition，可以在模块加载时定义；真正的 `useStore()` 需要明确 Pinia。单 SPA 通常在 `app.use(pinia)` 后依赖 active fallback，但模块评估顺序可能早于 plugin 安装，多个 app 或 SSR 也不能把 mutable active Pinia 当作隔离协议。

~~~~ts
const router = createRouter({ history, routes })

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.signedIn) return '/login'
})
~~~~

## 二、显式、注入与 active fallback

| 入口 | 适用场景 | 边界 |
| --- | --- | --- |
| useStore(pinia) | 组件外 utility、测试、多 app、SSR | 调用方必须持有正确实例 |
| app injection | 组件 setup、已安装 Router guard | 只在当前 app context 内 |
| active fallback | 单 SPA 安装后的便利路径 | mutable，不能隔离并发请求 |

固定 4.0.2 的 `useStore(pinia?)` 优先采用显式参数，再看当前 injection context，最后回退 active Pinia。`app.runWithContext()` 只在同步执行期间提供 app injection，不跨 `await`，也不创建组件实例。

:::warning
Router guard 负责允许或重定向，认证 Store 负责认证 state/action。不要把宿主 Router 实例塞进 Store，也不要依赖进程级 active Pinia 隔离 SSR 请求。
:::

## 三、独立 memory router 实验

:::demo{id="vue.pinia.learn.intermediate.outside-components-router.pinia-outside-component-context-lab-demo" playground="true"}
在独立 mini-app 的 guard 内延迟取得 Store，并保持宿主 URL 与 Pinia 不变
:::

## 四、练习与观察

:::steps
### 1. 访问受保护页

未登录时确认 memory router 重定向到内存登录路径。

### 2. 显式取得 Store

比较 useStore(pinia) 与 guard 内 Store 的 identity。

### 3. 登录后重试

同一路径由 guard 放行到内存受保护页。

### 4. 核对宿主

确认浏览器 URL 和宿主 active Pinia 全程不变。
:::

## 五、源码与测试推导

:::steps
### 1. install 同时 active 与 provide

createPinia.ts 在 app.use 时设置 active、关联 app 并 provide Pinia。

### 2. 显式参数优先

固定 store.ts 先采用 useStore(pinia) 参数，再看 injection context 和 active fallback。

### 3. active 是 mutable fallback

它方便单 SPA，但不能表示并发请求或多 app 的唯一所有者。

### 4. runWithContext 只保证同步注入

Setup Store 和 Router guard 可读取 app provide，但不能把该上下文外推到 await 后。

### 5. 官方 guard 示例延迟调用

outside-component 文档把 useStore 放在 beforeEach callback 内，消除 import/install 顺序风险。

### 6. 固定 SSR 测试证明实例隔离

两个 app 可以持有同 ID Store 的不同 state；真实请求必须显式传当前 Pinia。

### 7. 当前 Demo 的证据边界

memory router 只证明浏览器内独立 app seam，不替代真实 SSR/hydration。
:::

## 六、易错使用提示

:::pitfalls
### 把 defineStore 与 useStore 混为一谈

**触发条件：** 把 defineStore 与 useStore 混为一谈

**原因：** 定义工厂不需要已安装 Pinia，调用才需要。

**后果：** 为解决调用时序而错误延迟所有模块定义。

**错误示例：**

~~~~ts
app.use(pinia)
export const useAuthStore = defineStore('auth', {})
~~~~

**正确写法：**

~~~~ts
export const useAuthStore = defineStore('auth', {})
~~~~

**验证方式：** 对照正确写法验证结果。

### 在模块顶层提前调用 useStore

**触发条件：** 在模块顶层提前调用 useStore

**原因：** 模块可能先于 app.use(pinia) 求值。

**后果：** 没有 active Pinia 或误取另一个 app。

**错误示例：**

~~~~ts
const auth = useAuthStore()
~~~~

**正确写法：**

~~~~ts
function getAuth() { return useAuthStore() }
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 active Pinia 当成常量

**触发条件：** 把 active Pinia 当成常量

**原因：** 它会被其他 Store 调用或 app 安装更新。

**后果：** 多 app 与 SSR 读到错误实例。

**错误示例：**

~~~~ts
const requestStore = useAuthStore()
~~~~

**正确写法：**

~~~~ts
const requestStore = useAuthStore(requestPinia)
~~~~

**验证方式：** 对照正确写法验证结果。

### 已有实例仍手动 setActivePinia

**触发条件：** 已有实例仍手动 setActivePinia

**原因：** StoreDefinition 公开接受显式 Pinia。

**后果：** 全局 mutable 状态产生额外切换。

**错误示例：**

~~~~ts
setActivePinia(pinia)
const auth = useAuthStore()
~~~~

**正确写法：**

~~~~ts
const auth = useAuthStore(pinia)
~~~~

**验证方式：** 对照正确写法验证结果。

### 让 runWithContext 跨 await

**触发条件：** 让 runWithContext 跨 await

**原因：** Vue 只保证同步 callback 期间的 injection。

**后果：** 异步恢复后读取到错误上下文。

**错误示例：**

~~~~ts
await app.runWithContext(async () => useStoreAfterAwait())
~~~~

**正确写法：**

~~~~ts
const store = app.runWithContext(() => useStore())
await work(store)
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 router 模块顶层缓存 Store

**触发条件：** 在 router 模块顶层缓存 Store

**原因：** Router plugin 可能尚未安装到 app。

**后果：** guard 导入时就触发错误实例选择。

**错误示例：**

~~~~ts
const auth = useAuthStore()
router.beforeEach(() => auth.signedIn)
~~~~

**正确写法：**

~~~~ts
router.beforeEach(() => useAuthStore().signedIn)
~~~~

**验证方式：** 对照正确写法验证结果。

### 让 Store 决定所有重定向

**触发条件：** 让 Store 决定所有重定向

**原因：** 认证 state 与导航决策是不同责任。

**后果：** Store 与宿主 Router 强耦合。

**错误示例：**

~~~~ts
authStore.router.push('/login')
~~~~

**正确写法：**

~~~~ts
if (!auth.signedIn) return '/login'
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 memory router 当成 SSR 证据

**触发条件：** 把 memory router 当成 SSR 证据

**原因：** 它仍在单个浏览器进程中运行。

**后果：** 把未验证的请求隔离写成已通过。

**错误示例：**

~~~~ts
// memory router 已证明 SSR 安全
~~~~

**正确写法：**

~~~~ts
// SSR 请求隔离 Deferred/not-run
~~~~

**验证方式：** 对照正确写法验证结果。
:::
