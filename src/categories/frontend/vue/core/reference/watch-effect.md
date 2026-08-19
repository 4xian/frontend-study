---
id: vue.core.reference.reactivity-watchers.watch-effect
type: reference
title: watchEffect()
summary: 立即运行一个函数并自动追踪其响应式依赖，依赖变化时重新执行
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.reactivity-watchers.watch
  - vue.core.reference.reactivity-watchers.watch-post-sync
tags:
  - watchEffect
  - 自动依赖追踪
  - 副作用
  - flush
  - cleanup
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-28
sources:
  - title: Vue 响应式 API：核心
    url: https://cn.vuejs.org/api/reactivity-core.html#watcheffect
  - title: Vue 侦听器指南
    url: https://cn.vuejs.org/guide/essentials/watchers.html#watcheffect
  - title: Vue 3.5.40 watch.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/watch.ts
group: reactivity-watchers
signature: "function watchEffect(effect: (onCleanup: OnCleanup) => void, options?: WatchEffectOptions): WatchHandle"
anchors:
  - 概述
  - 自动依赖收集
  - 最小源码实现
  - 与 watch 的区别
  - 副作用清理
  - 易错使用提示
---

# watchEffect()

## 一、概述

watchEffect() 立即运行传入的函数，并在同步执行期间自动追踪所有被读取的响应式依赖；任一依赖变化时重新执行。与 watch 不同，它不需要显式指定源——依赖追踪与副作用合二为一。

~~~~ts
function watchEffect(
  effect: (onCleanup: OnCleanup) => void,
  options?: WatchEffectOptions
): WatchHandle

interface WatchEffectOptions {
  flush?: 'pre' | 'post' | 'sync' // 默认 'pre'
  onTrack?: (event: DebuggerEvent) => void
  onTrigger?: (event: DebuggerEvent) => void
}
~~~~

## 二、自动依赖收集

依赖是"每次执行动态确定"的：只有本次执行实际读到的响应式属性才会被追踪。条件分支导致某个源没被读取时，改它不会触发重新执行。

:::demo{id="vue.core.reference.reactivity-watchers.watch-effect.watch-effect-auto" playground="true"}
条件读取：读 a 时改 b 不触发；切换分支后依赖关系自动更新
:::

## 三、易错使用提示

:::pitfalls
### 首次 `await` 之后才读取响应式依赖

**触发条件：** 首次 `await` 之后才读取响应式依赖

**原因：** 误以为 async effect 整个 Promise 生命周期内的读取都会自动追踪。官方限定为同步执行阶段；只有首次 `await` 之前访问的属性会成为依赖。

**后果：** `id.value` 变化时 effect 不会因此重跑，请求或派生数据停在旧 ID。

**错误示例：**

~~~~ts
watchEffect(async () => {
  await prepare()
  await loadUser(id.value)
})
~~~~

**正确写法：**

~~~~ts
watchEffect(async () => {
  const currentId = id.value
  await prepare()
  await loadUser(currentId)
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 `watchEffect()` 当成懒执行 watcher

**触发条件：** 把 `watchEffect()` 当成懒执行 watcher

**原因：** 与默认惰性的 `watch()` 混淆。`watchEffect()` 在创建时立即运行一次，以便发现同步读取的依赖。

**后果：** 尚未准备好的输入被访问，或页面初始化时提前发出一次请求、订阅一次资源。

**错误示例：**

~~~~ts
watchEffect(() => {
  void fetch(`/api/users/${selectedId.value}`)
})
~~~~

**正确写法：**

~~~~ts
watch(selectedId, (id) => {
  void fetch(`/api/users/${id}`)
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 异步创建 watcher 后仍期待组件卸载时自动停止

**触发条件：** 异步创建 watcher 后仍期待组件卸载时自动停止

**原因：** 组件只会自动停止在 setup 同步阶段创建并绑定到当前实例的 watcher；定时器或 Promise 回调执行时已经离开该同步上下文。

**后果：** 组件卸载后 effect 继续运行，读取旧组件状态或累积请求、订阅等资源。

**错误示例：**

~~~~ts
setTimeout(() => {
  watchEffect(syncRemoteState)
}, 100)
~~~~

**正确写法：**

~~~~ts
const ready = ref(false)

watchEffect(() => {
  if (ready.value) syncRemoteState()
})

setTimeout(() => (ready.value = true), 100)
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 `watchEffect()` 的 `await` 之后才调用 `onWatcherCleanup()`

**触发条件：** 在 `watchEffect()` 的 `await` 之后才调用 `onWatcherCleanup()`

**原因：** `onWatcherCleanup()` 与 watch 中的约束一致：只能在 effect 同步执行期间关联当前 watcher，不能等异步操作结束后再登记。

**后果：** 过期请求没有取消，依赖快速变化时旧结果可能晚到并覆盖新结果。

**错误示例：**

~~~~ts
watchEffect(async () => {
  const response = await fetch(`/api/${id.value}`)
  onWatcherCleanup(() => response.body?.cancel())
})
~~~~

**正确写法：**

~~~~ts
watchEffect(async () => {
  const controller = new AbortController()
  onWatcherCleanup(() => controller.abort())
  const response = await fetch(`/api/${id.value}`, { signal: controller.signal })
  data.value = await response.json()
})
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 四、最小源码实现

源码里 watchEffect 与 watch 是同一个函数：内部 `watch(source, cb)` 的 cb 为 null 时就是 watchEffect——用户函数本身直接充当 getter，跑它的过程就是收集依赖的过程，依赖变化后要做的事也只是"再跑一遍"，没有新旧值比较。"每次执行动态确定依赖"则由 `ReactiveEffect.run()` 实现：每次运行前把上一轮的依赖记录全部标记为"未使用"，运行中读到谁就恢复谁，结束后把仍未使用的依赖退订——条件分支没读到的源就这样被自动移出依赖。

~~~~ts
// 精简自 vuejs/core v3.5.40 packages/reactivity/src/watch.ts、effect.ts
// watch 内部：cb 为 null 的分支就是 watchEffect
export function watchEffect(effectFn: (onCleanup: OnCleanup) => void) {
  let cleanup: (() => void) | undefined
  const onCleanup: OnCleanup = (fn) => (cleanup = fn)

  // 用户函数直接当 getter：跑一遍 = 收集一遍依赖
  const getter = () => {
    if (cleanup) {
      cleanup() // 重新执行前先清理上一次的副作用
      cleanup = undefined
    }
    return effectFn(onCleanup)
  }

  const effect = new ReactiveEffect(getter)
  effect.scheduler = () => effect.run() // 依赖变化 → 直接重跑（无新旧值比较）

  effect.run() // 立即执行第一次（这也是它与 watch 惰性的差别）

  return () => effect.stop()
}

// ReactiveEffect.run 的依赖刷新骨架（effect.ts）：
class ReactiveEffect {
  run() {
    const prevSub = activeSub
    activeSub = this // 期间所有 track 都记到本 effect 头上
    prepareDeps(this) // 上一轮依赖全部标记为"未使用"（version = -1）
    try {
      return this.fn() // 执行用户函数：读到的依赖被恢复/新增
    } finally {
      cleanupDeps(this) // 本轮没读到的依赖 → 退订
      activeSub = prevSub
    }
  }
}
~~~~

:::tip
prepareDeps/cleanupDeps 的"标记-恢复-清扫"机制正是 demo 里依赖切换的原理：读 a 的那一轮 b 被清扫出依赖表，改 b 自然不触发；分支切换后下一轮重新读到 b，它又被订阅回来。
:::

## 五、与 watch 的区别

| 维度 | watch | watchEffect |
| --- | --- | --- |
| 依赖来源 | 显式指定源 | 自动追踪回调内读取的属性 |
| 首次执行 | 惰性（immediate 可改） | 立即执行 |
| 新旧值 | 回调提供 newValue / oldValue | 不提供 |
| 触发精度 | 仅指定源变化才触发 | 任一被读依赖变化都触发 |
| 适用 | 需要对比新旧值、精确控制触发 | 副作用天然依赖多个状态 |

## 六、副作用清理

effect 函数的第一个参数是 `onCleanup`：注册的清理函数会在 effect 重新执行前或停止时调用，与 watch 的清理机制一致。停止侦听则调用返回的句柄（组件卸载时自动停止）。

~~~~ts
const stop = watchEffect((onCleanup) => {
  const timer = setTimeout(() => console.log(keyword.value), 500)
  onCleanup(() => clearTimeout(timer)) // 重新执行前清掉上一次的定时器
})

// 不再需要时
stop()
~~~~

:::tip
watchEffect 的 flush 时机与 watch 相同（默认 pre）。需要在回调中访问更新后的 DOM 时用 `flush: "post"`，或直接使用别名 watchPostEffect()。
:::
