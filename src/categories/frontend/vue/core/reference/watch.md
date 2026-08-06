---
id: vue.core.reference.reactivity-watchers.watch
type: reference
title: watch()
summary: 侦听一个或多个响应式数据源，在源变化时调用回调，可访问新旧值并控制触发时机
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.reactivity-watchers.computed
  - vue.core.reference.reactivity-watchers.watch-effect
  - vue.core.reference.reactivity-watchers.watch-post-sync
tags:
  - watch
  - 侦听器
  - 副作用
  - flush
  - onWatcherCleanup
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-28
sources:
  - title: Vue 响应式 API：核心
    url: https://cn.vuejs.org/api/reactivity-core.html#watch
  - title: Vue 侦听器指南
    url: https://cn.vuejs.org/guide/essentials/watchers.html
  - title: Vue 3.5.40 watch.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/watch.ts
group: reactivity-watchers
signature: "function watch<T>(source: WatchSource<T>, callback: WatchCallback<T>, options?: WatchOptions): WatchHandle"
anchors:
  - 概述
  - 侦听源的四种形式
  - 选项：deep / immediate / once
  - 副作用清理
  - 触发时序
  - 最小源码实现
  - 与 computed / watchEffect 如何选择
  - 易错使用提示
---

# watch()

## 概述

watch() 侦听一个或多个响应式数据源，源变化时调用回调。它默认是惰性的——回调只在源变化后执行；依赖追踪与副作用分离，你能精确控制"什么变化才触发"。返回的 `WatchHandle` 可停止、暂停、恢复侦听。

~~~~ts
// 侦听单个源
function watch<T>(
  source: WatchSource<T>,
  callback: WatchCallback<T>,
  options?: WatchOptions
): WatchHandle

// 侦听多个源
function watch<T>(
  sources: WatchSource<T>[],
  callback: WatchCallback<T[]>,
  options?: WatchOptions
): WatchHandle

type WatchSource<T> =
  | Ref<T>                       // ref
  | (() => T)                    // getter
  | (T extends object ? T : never) // reactive 对象

interface WatchHandle {
  (): void          // 可直接调用，等同 stop
  pause: () => void
  resume: () => void
  stop: () => void
}
~~~~

## 侦听源的四种形式

源可以是：1）ref（含 computed ref）；2）getter 函数——只有返回值变化才触发，适合侦听"派生结果"或 reactive 对象的单个属性；3）reactive 对象——自动开启深层侦听；4）以上组合的数组——任一源变化都触发，回调收到新旧值数组。

:::demo{id="vue.core.reference.reactivity-watchers.watch.watch-sources" playground="true"}
ref 源与 getter 源对比：getter 只在计算结果变化时触发
:::

## 易错使用提示

:::pitfalls
### 直接把 reactive 对象的属性值传给 `watch()`

**触发条件：** 直接把 reactive 对象的属性值传给 `watch()`

**原因：** `obj.count` 在调用 `watch()` 前已经求值成普通数字，不再是 ref、reactive 对象或 getter 这类有效侦听源。

**后果：** Vue 会把它视为无效源并警告，之后 `obj.count` 变化不会调用回调。

**错误示例：**

~~~~ts
const obj = reactive({ count: 0 })
watch(obj.count, (count) => console.log(count))
~~~~

**正确写法：**

~~~~ts
const obj = reactive({ count: 0 })
watch(() => obj.count, (count) => console.log(count))
~~~~

**验证方式：** 对照正确写法验证结果。

### 用深层 watcher 的 `newValue` / `oldValue` 直接做对象差异

**触发条件：** 用深层 watcher 的 `newValue` / `oldValue` 直接做对象差异

**原因：** `deep` 的职责是遍历嵌套属性建立依赖，不是自动复制变化前快照。对象内部原地修改时，回调的两个参数仍指向同一个对象。

**后果：** `newValue === oldValue` 为 true，比较函数看不到“修改前”的嵌套值，审计或撤销逻辑得到错误差异。

**错误示例：**

~~~~ts
watch(state, (next, previous) => {
  console.log(next === previous) // 深层原地修改时为 true
})
~~~~

**正确写法：**

~~~~ts
watch(
  () => state.user.name,
  (nextName, previousName) => {
    recordRename(previousName, nextName)
  },
)
~~~~

**验证方式：** 对照正确写法验证结果。

### 在首次 `await` 后才调用 `onWatcherCleanup()`

**触发条件：** 在首次 `await` 后才调用 `onWatcherCleanup()`

**原因：** 误以为异步 watcher 回调在 Promise 完成前一直是“当前 watcher”。`onWatcherCleanup()` 只能在 watch 回调或 watchEffect 的同步执行阶段关联当前侦听器。

**后果：** cleanup 注册失败或出现警告；参数快速变化时，旧请求仍可能最后返回并覆盖新结果。

**错误示例：**

~~~~ts
watch(id, async (value) => {
  const response = await fetch(`/api/${value}`)
  onWatcherCleanup(() => response.body?.cancel())
})
~~~~

**正确写法：**

~~~~ts
watch(id, async (value) => {
  const controller = new AbortController()
  onWatcherCleanup(() => controller.abort())
  const response = await fetch(`/api/${value}`, { signal: controller.signal })
  data.value = await response.json()
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 对大型对象无差别启用无限深层侦听

**触发条件：** 对大型对象无差别启用无限深层侦听

**原因：** 认为 `deep: true` 只是“多监听一些事件”。Vue 必须递归遍历嵌套属性以收集依赖；对象越大、层级越深，遍历成本越高。

**后果：** 创建和重跑 watcher 时出现明显额外开销，频繁变更的大型数据结构可能造成卡顿。

**错误示例：**

~~~~ts
watch(largeState, persistEverything, { deep: true })
~~~~

**正确写法：**

~~~~ts
watch(
  [() => largeState.user.id, () => largeState.settings.theme],
  persistRelevantFields,
)

// Vue 3.5+：确需遍历时可限制最大深度
watch(largeState, persistSection, { deep: 2 })
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 `watch()` 当成会立即执行的初始化逻辑

**触发条件：** 把 `watch()` 当成会立即执行的初始化逻辑

**原因：** `watch()` 默认是懒执行的：创建时只收集和保存初始值，回调要等侦听源第一次变化才运行。

**后果：** 页面初次进入时不请求数据、不同步缓存，只有用户修改条件后才出现结果。

**错误示例：**

~~~~ts
const userId = ref(1)
watch(userId, loadUser) // 初始的 1 不会触发 loadUser
~~~~

**正确写法：**

~~~~ts
const userId = ref(1)
watch(userId, loadUser, { immediate: true })
~~~~

**验证方式：** 对照正确写法验证结果。

### 侦听返回对象的 getter 时误以为会默认深层触发

**触发条件：** 侦听返回对象的 getter 时误以为会默认深层触发

**原因：** 直接把 reactive 对象作为源会隐式深层侦听，但 getter 源默认只比较返回值本身。深改后仍返回同一对象时，回调不触发。

**后果：** 嵌套字段已经改变，依赖 watcher 的持久化、校验或同步逻辑却没有运行。

**错误示例：**

~~~~ts
const state = reactive({ user: { name: 'Ada' } })
watch(() => state.user, saveUser)
state.user.name = 'Grace' // 返回的仍是同一个 user
~~~~

**正确写法：**

~~~~ts
const state = reactive({ user: { name: 'Ada' } })

// 优先只侦听真正需要的字段
watch(() => state.user.name, saveName)

// 确需整个对象时才使用 deep
watch(() => state.user, saveUser, { deep: true })
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 选项：deep / immediate / once

`immediate: true` 让回调在创建时立即执行一次（此次 oldValue 为 undefined）；`deep: true` 对 getter 返回的对象做深层遍历（3.5+ 还可传数字限制深度）；`once: true`（3.4+）让回调只触发一次后自动停止。默认 `deep: false`——getter 源只比较返回值本身；reactive 对象源例外，隐式深层。

:::demo{id="vue.core.reference.reactivity-watchers.watch.watch-options" playground="true"}
immediate、once 与 WatchHandle.stop() 的行为对照
:::

## 副作用清理

回调的第三个参数 `onCleanup`（或 3.5+ 的 `onWatcherCleanup` API）注册清理函数：在侦听器下一次触发前或停止时调用，用于取消过期的异步请求等。

~~~~ts
import { watch, onWatcherCleanup } from 'vue'

watch(id, (newId) => {
  const controller = new AbortController()
  fetch(`/api/${newId}`, { signal: controller.signal }).then(() => {
    // 回调逻辑
  })
  // id 再次变化时，中止上一次未完成的请求
  onWatcherCleanup(() => controller.abort())
})
~~~~

## 触发时序

:::principle{id="vue.core.reference.reactivity-watchers.watch.watch-timing"}
默认（pre）回调在父组件更新之后、当前组件 DOM 更新之前批量执行；post 在 DOM 更新后；sync 完全同步、不批量。
:::

## 最小源码实现

watch 的实现分三步。第一步源归一化：四种源形式统一转成一个 getter 函数——ref 源变成 `() => source.value`，reactive 对象源变成 `() => traverse(source)`（深遍历每个属性，属性读取即完成依赖收集，这就是 reactive 源隐式深层侦听的原因），数组源逐项归一化；`deep: true` 就是在 getter 外再包一层 traverse。第二步：用这个 getter 创建 `ReactiveEffect`——与组件渲染、computed 同款的副作用原语。第三步job：依赖变化时调度器执行 job，重新运行 getter 拿新值，`hasChanged` 比较新旧值，变了才调用回调并把旧值换成新值。immediate/once/onCleanup 都只是这个骨架上的小开关。

~~~~ts
// 精简自 vuejs/core v3.5.40 packages/reactivity/src/watch.ts
// 省略多源数组、pause/resume、错误处理与 SSR 分支
export function watch(source: unknown, cb: WatchCallback, options: WatchOptions = {}) {
  const { immediate, deep, once } = options

  // 第一步：把四种源形式统一归一化为 getter
  let getter: () => any
  if (isRef(source)) {
    getter = () => source.value
  } else if (isReactive(source)) {
    getter = () => traverse(source) // reactive 源：深遍历 → 隐式 deep
  } else if (isFunction(source)) {
    getter = source as () => any
  }

  if (deep) {
    const baseGetter = getter
    getter = () => traverse(baseGetter()) // deep: true → 包一层深遍历
  }

  if (once && cb) {
    const _cb = cb
    cb = (...args) => {
      _cb(...args)
      stop() // once：执行一次后自停
    }
  }

  let oldValue: any
  // 第三步：依赖变化时被调度执行的任务
  const job = () => {
    const newValue = effect.run() // 重新跑 getter，同时刷新依赖
    if (deep || hasChanged(newValue, oldValue)) {
      cb(newValue, oldValue)
      oldValue = newValue
    }
  }

  // 第二步：getter 作为副作用运行，读到的一切自动订阅
  const effect = new ReactiveEffect(getter)
  effect.scheduler = job // 依赖变化 → 不直接重跑 getter，而是调度 job

  if (immediate) {
    job() // 立即执行一次（oldValue 为 undefined）
  } else {
    oldValue = effect.run() // 惰性：先取初始值，不调回调
  }

  const stop = () => effect.stop()
  return stop
}

// traverse：递归访问对象每个属性——"读取"本身就是依赖收集
function traverse(value: unknown, seen = new Set()) {
  if (!isObject(value) || seen.has(value)) return value
  seen.add(value)
  for (const key in value as object) {
    traverse((value as any)[key], seen)
  }
  return value
}
~~~~

:::tip
deep 的代价在源码里一目了然：traverse 每次都要递归访问全部嵌套属性来维持订阅，对大对象开销可观——这就是官方建议 deep 按需使用、3.5+ 支持传数字限制遍历深度的原因。
:::

## 与 computed / watchEffect 如何选择

| 需求 | 推荐 API |
| --- | --- |
| 由状态派生新值供模板使用 | computed |
| 状态变化时执行副作用，需要新旧值或精确控制源 | watch |
| 副作用依赖多个状态，希望自动追踪 | watchEffect |
| 副作用中要读取更新后的 DOM | watch/watchEffect 的 flush: "post" |
