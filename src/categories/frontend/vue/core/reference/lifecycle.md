---
id: vue.core.reference.composition.lifecycle
type: reference
title: 生命周期钩子
summary: 在组件挂载、更新、卸载、缓存切换、错误捕获与服务端预取等阶段注册回调
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.composition.template-refs
  - vue.core.reference.built-ins.keep-alive
  - vue.core.reference.built-ins.suspense
  - vue.core.reference.application.next-tick
tags:
  - 生命周期
  - onMounted
  - onUpdated
  - onUnmounted
  - onRenderTracked
  - onRenderTriggered
  - DebuggerEvent
  - KeepAlive
  - SSR
appliesTo: Vue 3.5.40
verifiedAt: 2026-08-02
sources:
  - title: Vue 组合式 API：生命周期钩子
    url: https://cn.vuejs.org/api/composition-api-lifecycle.html
  - title: Vue onRenderTracked()
    url: https://cn.vuejs.org/api/composition-api-lifecycle.html#onrendertracked
  - title: Vue 深入响应式系统：组件调试钩子
    url: https://cn.vuejs.org/guide/extras/reactivity-in-depth.html#component-debugging-hooks
  - title: Vue 生命周期指南
    url: https://cn.vuejs.org/guide/essentials/lifecycle.html
  - title: Vue 组合式函数使用限制
    url: https://cn.vuejs.org/guide/reusability/composables.html#usage-restrictions
  - title: Vue KeepAlive 缓存实例生命周期
    url: https://cn.vuejs.org/guide/built-ins/keep-alive.html#lifecycle-of-cached-instance
  - title: Vue SSR 组件生命周期钩子
    url: https://cn.vuejs.org/guide/scaling-up/ssr.html#component-lifecycle-hooks
  - title: Vue 3.5.40 apiLifecycle.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiLifecycle.ts
  - title: Vue 3.5.40 renderer.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts
  - title: Vue 3.5.40 KeepAlive.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/KeepAlive.ts
group: composition
signature: |-
  function onMounted(callback: () => void, target?: ComponentInternalInstance | null): void
  function onRenderTracked(callback: DebuggerHook, target?: ComponentInternalInstance | null): void
  function onRenderTriggered(callback: DebuggerHook, target?: ComponentInternalInstance | null): void
anchors:
  - 概述
  - 六个核心钩子的签名
  - 六个核心钩子的时机
  - 注册时机的约束
  - onRenderTracked()
  - onRenderTriggered()
  - 易错使用提示
  - SSR 与 KeepAlive 边界
  - 错误捕获
  - 最小源码实现
---

# 生命周期钩子

## 概述

每个组件实例都会经历创建、挂载、更新和卸载。组合式 API 用 `onXxx()` 在对应阶段注册回调：挂载前后使用 `onBeforeMount` / `onMounted`，更新前后使用 `onBeforeUpdate` / `onUpdated`，卸载前后使用 `onBeforeUnmount` / `onUnmounted`。

## 六个核心钩子的签名

~~~~ts
type LifecycleCallback = () => void
type LifecycleTarget = ComponentInternalInstance | null

function onBeforeMount(callback: LifecycleCallback, target?: LifecycleTarget): void
function onMounted(callback: LifecycleCallback, target?: LifecycleTarget): void
function onBeforeUpdate(callback: LifecycleCallback, target?: LifecycleTarget): void
function onUpdated(callback: LifecycleCallback, target?: LifecycleTarget): void
function onBeforeUnmount(callback: LifecycleCallback, target?: LifecycleTarget): void
function onUnmounted(callback: LifecycleCallback, target?: LifecycleTarget): void
~~~~

## 六个核心钩子的时机

| 钩子 | 调用时机 | 典型用途 |
| --- | --- | --- |
| onBeforeMount | 首次 DOM 渲染开始前，DOM 节点尚未创建 | 挂载前准备 |
| onMounted | 自身 DOM 已插入父容器，所有同步子组件已挂载 | 访问 DOM、启动客户端副作用 |
| onBeforeUpdate | 响应式状态变化后、组件 DOM 更新前 | 读取更新前的 DOM 状态 |
| onUpdated | 本组件 DOM 更新后，且晚于子组件的 updated | 读取更新后的 DOM |
| onBeforeUnmount | 卸载开始前，组件实例仍保持完整功能 | 执行卸载前操作 |
| onUnmounted | 子组件已卸载，组件作用域内的响应式 effect 已停止 | 清理计时器、DOM 监听和连接 |

`onMounted` 只等待同步子组件，不等待异步组件或 `<Suspense>` 树；只有应用根容器本身位于 document 中时，才能保证组件 DOM 也已进入 document。`onUnmounted` 自动停止的是渲染 effect 以及 setup 中创建的 computed 和 watcher，计时器、DOM 事件监听、服务器连接等仍需手工清理。

:::demo{id="vue.core.reference.composition.lifecycle.lifecycle-hooks-demo" playground="true"}
挂载、更新和卸载一个子组件，观察六个核心钩子的调用顺序
:::

## 注册时机的约束

生命周期钩子通常必须在 `setup()` 的同步调用栈中注册，Vue 才能把回调关联到当前组件实例。钩子可以写在外部组合式函数中，只要该函数仍由 setup 同步调用。普通 `async setup()` 在恢复执行时已失去该上下文；`<script setup>` 的顶层 await 是明确例外，编译器会在异步操作后恢复当前实例。

~~~~ts
// 普通 setup：同步注册
onMounted(() => startFeature())

// 错误：定时回调运行时已经没有当前组件实例
setTimeout(() => {
  onMounted(() => startLateFeature())
}, 100)

// <script setup> 顶层 await：编译器会恢复当前实例
const data = await loadData()
onMounted(() => useData(data))
~~~~

## onRenderTracked()

~~~~ts
type DebuggerHook = (event: DebuggerEvent) => void

// 注册组件渲染依赖追踪调试钩子
function onRenderTracked(
  callback: DebuggerHook,
  target?: ComponentInternalInstance | null,
): void
~~~~

`onRenderTracked()` 在组件渲染期间读取响应式依赖并被渲染 effect 追踪时调用。事件的 `type` 可能是 `get`、`has` 或 `iterate`，适合用来回答“这次渲染为什么依赖了这个属性”。该钩子仅在开发环境可用，服务端渲染期间不会调用。

~~~~ts
onRenderTracked((event) => {
  console.debug('render tracked', event.type, event.key)
  debugger
})
~~~~

## onRenderTriggered()

~~~~ts
type DebuggerHook = (event: DebuggerEvent) => void

// 注册组件渲染依赖触发调试钩子
function onRenderTriggered(
  callback: DebuggerHook,
  target?: ComponentInternalInstance | null,
): void
~~~~

`onRenderTriggered()` 在响应式依赖发生变化并触发组件渲染 effect 时调用，适合定位“哪次写操作让组件准备更新”。事件的 `type` 可能是 `set`、`add`、`delete` 或 `clear`。它同样仅在开发环境可用，服务端渲染期间不会调用。

| DebuggerEvent 字段 | 含义 |
| --- | --- |
| effect | 本次追踪或触发关联的响应式 effect |
| target | 被追踪或修改的原始响应式目标对象 |
| type | 追踪操作或触发操作的类型 |
| key | 相关属性或集合键；部分集合操作可能没有 key |
| newValue | set 或 add 等操作的新值；并非所有事件都有 |
| oldValue | set 或 delete 等操作的旧值；并非所有事件都有 |
| oldTarget | 集合 clear 前的旧集合快照；仅相关事件可能提供 |

tracked 与 triggered 事件并非一一对应：一次渲染可以读取多个依赖，而一次状态修改也可能触发多个 effect。调试钩子报告的是依赖追踪与触发过程，不会改变 Vue 对组件更新的调度和批处理。

~~~~ts
onRenderTriggered((event) => {
  console.debug('render triggered', {
    type: event.type,
    key: event.key,
    oldValue: event.oldValue,
    newValue: event.newValue,
  })
  debugger
})
~~~~

## 易错使用提示

:::pitfalls
### 在异步恢复后才注册生命周期钩子

**触发条件：** 在异步恢复后才注册生命周期钩子

**原因：** 生命周期 API 依赖当前 active component instance。`setTimeout()`、Promise 回调或普通 `async setup()` 的 await 续体通常已离开 setup 的同步调用栈，Vue 无法再把钩子关联到原实例。

**后果：** 开发环境警告“没有 active component instance”，钩子没有登记，挂载或卸载时不会执行。

**错误示例：**

~~~~ts
setTimeout(() => {
  onMounted(startClientFeature)
}, 100)
~~~~

**正确写法：**

~~~~ts
const settings = ref<Settings>()
onMounted(startClientFeature)
void loadSettings().then((value) => (settings.value = value))
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为父组件 `onMounted()` 已等待所有异步子树且一定进入 document

**触发条件：** 认为父组件 `onMounted()` 已等待所有异步子树且一定进入 document

**原因：** `onMounted()` 只保证同步子组件已经挂载；不包含异步组件或 Suspense 子树。组件 DOM 只有在应用根容器本身位于 document 时才保证 in-document。

**后果：** 异步子组件 ref 仍为 null，调用方法时报错；挂在脱离 document 的容器时，几何或焦点操作没有预期结果。

**错误示例：**

~~~~ts
onMounted(() => {
  asyncChild.value.measure()
})
~~~~

**正确写法：**

~~~~ts
function handleChildReady(child: ChildPublicApi) {
  child.measure()
}

onMounted(() => {
  if (root.value?.isConnected) measureRoot(root.value)
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 KeepAlive 钩子只当作“缓存切换”通知

**触发条件：** 把 KeepAlive 钩子只当作“缓存切换”通知

**原因：** 误以为 `onActivated()` 不会在首次挂载调用，或 `onDeactivated()` 不会在最终卸载调用。官方还说明，这两个钩子同时作用于缓存树中的后代组件。

**后果：** 同一订阅初始化两次、最终卸载时漏清理，或后代组件重复执行本以为只属于缓存根节点的逻辑。

**错误示例：**

~~~~ts
onMounted(() => subscribe())
onActivated(() => subscribe())
onUnmounted(() => unsubscribe())
~~~~

**正确写法：**

~~~~ts
let stopSubscription: (() => void) | undefined

onActivated(() => {
  stopSubscription ??= subscribe()
})

onDeactivated(() => {
  stopSubscription?.()
  stopSubscription = undefined
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 SSR 中等待 `onMounted()` 加载数据

**触发条件：** 在 SSR 中等待 `onMounted()` 加载数据

**原因：** 服务端渲染不会调用 beforeMount、mounted、beforeUpdate、updated、beforeUnmount 和 unmounted 这些客户端生命周期钩子。

**后果：** 服务端输出缺少数据，客户端水合后才发起请求，容易出现空内容或服务端与客户端结果不一致。

**错误示例：**

~~~~ts
onMounted(async () => {
  article.value = await loadArticle()
})
~~~~

**正确写法：**

~~~~ts
onServerPrefetch(async () => {
  article.value = await loadArticle()
})

onMounted(() => {
  startBrowserOnlyFeature()
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 `onUpdated()` 中继续修改本组件状态

**触发条件：** 在 `onUpdated()` 中继续修改本组件状态

**原因：** `onUpdated()` 会在本组件 DOM 更新后执行。若回调再修改会影响渲染的状态，就会立即排队下一次更新。

**后果：** 组件反复渲染并进入无限更新循环，浏览器卡顿且 Vue 报告递归更新错误。

**错误示例：**

~~~~ts
onUpdated(() => {
  count.value++
})
~~~~

**正确写法：**

~~~~ts
function increment() {
  count.value++
}

// 只需等特定状态的 DOM 时，在修改后就地等待
await nextTick()
measureResult()
~~~~

**验证方式：** 对照正确写法验证结果。

### 以为组件卸载会自动清理所有外部资源

**触发条件：** 以为组件卸载会自动清理所有外部资源

**原因：** 组件 scope 会停止 setup 中创建的渲染 effect、computed 和 watcher，但浏览器计时器、手工 DOM 监听、WebSocket 等不属于 Vue 的资源不会自动停止。

**后果：** 组件离开后回调仍执行，反复进入页面会累积多份监听与连接，造成重复逻辑和资源泄漏。

**错误示例：**

~~~~ts
onMounted(() => {
  window.addEventListener('resize', updateLayout)
  setInterval(refreshData, 5000)
})
~~~~

**正确写法：**

~~~~ts
let timer: ReturnType<typeof setInterval>

onMounted(() => {
  window.addEventListener('resize', updateLayout)
  timer = setInterval(refreshData, 5000)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateLayout)
  clearInterval(timer)
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 混淆 tracked 与 triggered 的含义

**触发条件：** 混淆 tracked 与 triggered 的含义

**原因：** `onRenderTracked()` 记录渲染读取并订阅了哪些依赖，`onRenderTriggered()` 记录哪次依赖变化触发了渲染 effect；两类事件不会一一对应。

**后果：** 把依赖读取误判为状态写入，或只看一次 triggered 就断定组件只依赖一个属性，导致定位方向错误。

**错误示例：**

~~~~ts
onRenderTracked((event) => {
  console.log('修改组件状态的来源', event.key)
})
~~~~

**正确写法：**

~~~~ts
onRenderTracked((event) => console.log('渲染读取', event.key))
onRenderTriggered((event) => console.log('更新触发', event.key))
~~~~

**验证方式：** 对照正确写法验证结果。

### 在渲染调试钩子中修改参与渲染的状态

**触发条件：** 在渲染调试钩子中修改参与渲染的状态

**原因：** 调试钩子运行在依赖追踪或触发链路中。若回调又修改组件渲染所依赖的状态，会干扰正在观察的过程并继续触发更新。

**后果：** 调试输出被额外写操作污染，严重时形成递归更新，无法再还原原始触发原因。

**错误示例：**

~~~~ts
onRenderTriggered(() => {
  count.value++
})
~~~~

**正确写法：**

~~~~ts
onRenderTriggered((event) => {
  console.debug('只读检查', event.type, event.key)
  debugger
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 依赖渲染调试钩子在生产环境或 SSR 中执行

**触发条件：** 依赖渲染调试钩子在生产环境或 SSR 中执行

**原因：** `onRenderTracked()` 和 `onRenderTriggered()` 是仅开发环境可用的调试 API，服务端渲染期间也不会调用。

**后果：** 放在钩子中的业务逻辑、日志上报或状态初始化在线上或 SSR 路径中完全不执行。

**错误示例：**

~~~~ts
onRenderTriggered(() => sendRequiredAuditLog())
~~~~

**正确写法：**

~~~~ts
watch(source, () => sendRequiredAuditLog())

// 渲染调试钩子只用于本地诊断
onRenderTriggered((event) => console.debug(event))
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 DebuggerEvent 的 target 和 key 当作稳定业务接口

**触发条件：** 把 DebuggerEvent 的 target 和 key 当作稳定业务接口

**原因：** `target` 是用于诊断的原始响应式目标，`key` 还会随对象、数组与集合操作而变化；这些字段描述内部依赖事件，不是业务事件契约。

**后果：** 长期保存原始 target 会绕开代理边界；业务逻辑还会与 Vue 的调试事件形态耦合，难以维护。

**错误示例：**

~~~~ts
onRenderTracked((event) => storedTargets.add(event.target))
~~~~

**正确写法：**

~~~~ts
onRenderTracked((event) => {
  console.debug('临时诊断', event.type, event.key)
})
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## SSR 与 KeepAlive 边界

服务端渲染不会调用 onBeforeMount、onMounted、onBeforeUpdate、onUpdated、onBeforeUnmount 和 onUnmounted；需要在服务端渲染前等待异步数据时使用 `onServerPrefetch()`。DOM 相关副作用应放进 onMounted，确保只在客户端执行。

`onActivated` / `onDeactivated` 用于 `<KeepAlive>` 缓存树。onActivated 在首次挂载和每次重新插入 DOM 时调用；onDeactivated 在移入缓存和最终卸载时调用。这两个钩子也会作用于缓存根组件的后代。源码会包装失活分支检查，并把钩子登记到祖先 KeepAlive root，因此它们并非六个核心钩子的简单别名。

## 错误捕获

`onErrorCaptured` 捕获后代组件在渲染、事件处理、生命周期、setup、侦听器、自定义指令和过渡钩子中抛出的错误。回调收到 `(err, instance, info)`；开发环境的 info 是错误来源字符串，生产环境则是缩短代码。错误默认从下向上经过各级捕获钩子并送达 `app.config.errorHandler`，返回 false 可停止继续传播。若捕获钩子自身抛错，新错误和原错误都会送达应用级处理器。

~~~~ts
import { onErrorCaptured, ref } from 'vue'

const error = ref<Error | null>(null)

onErrorCaptured((err, _instance, info) => {
  error.value = err as Error
  console.error(info)
  return false // 已处理：阻止其他捕获钩子和全局 errorHandler 再收到原错误
})
~~~~

## 最小源码实现

六个核心钩子由同一个 `createHook(type)` 工厂生成。它在客户端 setup 中把回调交给 `injectHook`，后者暂停依赖追踪、恢复目标实例并统一处理回调错误，再把包装后的函数加入实例对应的钩子数组。SSR setup 中除 SERVER&#95;PREFETCH 外不会登记这些钩子。

~~~~ts
// 精简自 vuejs/core v3.5.40 packages/runtime-core/src/apiLifecycle.ts
// 省略暂停依赖追踪、恢复实例上下文与异步错误处理包装
export function injectHook(
  type: LifecycleHooks,
  hook: Function,
  target: ComponentInternalInstance | null = currentInstance,
) {
  if (!target) {
    console.warn('生命周期注入 API 只能在 setup() 执行期间使用')
    return
  }

  const hooks = target[type] || (target[type] = [])
  const wrappedHook = (...args: unknown[]) => hook(...args)
  hooks.push(wrappedHook)
}

const createHook =
  (lifecycle: LifecycleHooks) =>
  (hook: () => void, target: ComponentInternalInstance | null = currentInstance) => {
    if (!isInSSRComponentSetup || lifecycle === LifecycleHooks.SERVER_PREFETCH) {
      injectHook(lifecycle, hook, target)
    }
  }

export const onMounted = createHook(LifecycleHooks.MOUNTED)
export const onUpdated = createHook(LifecycleHooks.UPDATED)
export const onUnmounted = createHook(LifecycleHooks.UNMOUNTED)
~~~~

`onRenderTracked` 与 `onRenderTriggered` 也由 `createHook()` 注册，分别写入组件实例的 RENDER&#95;TRACKED 与 RENDER&#95;TRIGGERED 钩子数组。renderer 仅在开发分支把组件渲染 effect 的 `onTrack` / `onTrigger` 转发给这些数组，因此它们不是生产运行时能力。

~~~~ts
// 注册渲染依赖追踪钩子
export const onRenderTracked = createHook<DebuggerHook>(LifecycleHooks.RENDER_TRACKED)

// 注册渲染依赖触发钩子
export const onRenderTriggered = createHook<DebuggerHook>(LifecycleHooks.RENDER_TRIGGERED)

if (__DEV__) {
  effect.onTrack = instance.rtc
    ? (event) => invokeArrayFns(instance.rtc, event)
    : undefined
  effect.onTrigger = instance.rtg
    ? (event) => invokeArrayFns(instance.rtg, event)
    : undefined
}
~~~~
