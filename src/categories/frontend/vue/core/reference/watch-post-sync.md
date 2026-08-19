---
id: vue.core.reference.reactivity-watchers.watch-post-sync
type: reference
title: watchPostEffect() / watchSyncEffect()
summary: watchEffect 的两个 flush 时机别名：post 在 DOM 更新后执行，sync 在依赖变化时同步执行
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.reactivity-watchers.watch-effect
  - vue.core.reference.reactivity-watchers.watch
tags:
  - watchPostEffect
  - watchSyncEffect
  - flush
  - post
  - sync
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-28
sources:
  - title: Vue 响应式 API：核心
    url: https://cn.vuejs.org/api/reactivity-core.html#watchposteffect
  - title: Vue 侦听器回调刷新时机
    url: https://cn.vuejs.org/guide/essentials/watchers.html#callback-flush-timing
  - title: Vue 3.5.40 apiWatch.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiWatch.ts
group: reactivity-watchers
signature: |-
  function watchPostEffect(effect: WatchEffect): WatchHandle
  function watchSyncEffect(effect: WatchEffect): WatchHandle
anchors:
  - 概述
  - 三种 flush 时机
  - DOM 更新时机差异
  - 最小源码实现
  - sync 的代价
  - 易错使用提示
---

# watchPostEffect() / watchSyncEffect()

## 一、概述

这两个 API 是 watchEffect() 固定 flush 选项的便捷别名：`watchPostEffect` = `watchEffect(fn, { flush: "post" })`，`watchSyncEffect` = `watchEffect(fn, { flush: "sync" })`。理解它们的关键是理解回调的三种触发时机（flush timing）。

~~~~ts
import { watchEffect, watchPostEffect, watchSyncEffect } from 'vue'

watchEffect(callback)                    // 默认 pre：组件 DOM 更新前
watchEffect(callback, { flush: 'post' }) // 等价于 watchPostEffect(callback)
watchEffect(callback, { flush: 'sync' }) // 等价于 watchSyncEffect(callback)
~~~~

## 二、三种 flush 时机

| 时机 | 执行位置 | 批量合并 | 典型用途 |
| --- | --- | --- | --- |
| pre（默认） | 父组件更新后、当前组件 DOM 更新前 | 是 | 绝大多数副作用 |
| post | 当前组件 DOM 更新之后 | 是 | 副作用中需要读取更新后的 DOM |
| sync | 响应式数据一变就同步执行 | 否 | 需要在 Vue 介入前拿到变化的罕见场景 |

## 三、DOM 更新时机差异

默认（pre）回调执行时，数据已是新值，但组件 DOM 还没重新渲染——读 DOM 拿到的是旧内容；post 回调在 DOM 更新后执行，读写 DOM 都安全。

:::demo{id="vue.core.reference.reactivity-watchers.watch-post-sync.flush-timing-demo" playground="true"}
同一次 count++：pre 回调读到旧 DOM 文本，post 回调读到新 DOM 文本
:::

## 四、最小源码实现

源码证实"别名"二字的字面含义：两个函数各自只有一行——给 watchEffect 补上固定的 flush 选项。三种 flush 的差别则全部体现在调度器（scheduler）上：依赖变化时副作用并不直接重跑，而是把 job 交给不同的队列——post 进"DOM 更新后队列"（queuePostRenderEffect），pre 进组件更新前的任务队列（queueJob，同一 tick 多次变化会去重合并，这就是批量的来源），sync 干脆不设调度器，依赖一变 job 原地执行，因此没有任何合并。

~~~~ts
// 精简自 vuejs/core v3.5.40 packages/runtime-core/src/apiWatch.ts
// 两个"别名"的完整真身：
export function watchPostEffect(effect: WatchEffect) {
  return doWatch(effect, null, { flush: 'post' })
}

export function watchSyncEffect(effect: WatchEffect) {
  return doWatch(effect, null, { flush: 'sync' })
}

// doWatch 中三种 flush 对应三种调度策略：
function doWatch(source: any, cb: any, { flush }: WatchOptions = {}) {
  const options: BaseWatchOptions = {}

  if (flush === 'post') {
    // job 放进"组件 DOM 更新之后"的队列 → 回调里能读到新 DOM
    options.scheduler = (job) => queuePostRenderEffect(job)
  } else if (flush !== 'sync') {
    // 默认 'pre'：job 进渲染前任务队列；同一 tick 重复入队会被去重 → 批量
    options.scheduler = (job) => queueJob(job)
  }
  // 'sync'：不设置 scheduler → 依赖一变 job 原地同步执行，无批量

  return baseWatch(source, cb, options) // 组装好调度策略，交给 reactivity 层的 watch
}
~~~~

:::tip
这也解释了 sync 的性能警告：pre/post 的批量来自队列去重（同一个 job 一个 tick 只跑一次），sync 没有队列，改十次就同步跑十次。
:::

## 五、sync 的代价

sync 侦听器没有批量机制：每一次响应式修改都立即触发一次回调。同一 tick 改十次就执行十次，而 pre/post 只批量执行一次。

## 六、易错使用提示

:::pitfalls
### 用 pre / sync effect 读取组件更新后的 DOM

**触发条件：** 用 pre / sync effect 读取组件更新后的 DOM

**原因：** 误以为 watcher 看到新状态时，组件 DOM 也必然完成更新。默认 pre 回调早于所有者组件 DOM 更新，sync 更是在 Vue 管理的更新前同步执行。

**后果：** `getBoundingClientRect()`、`textContent` 或焦点检查读到上一次渲染的 DOM 状态。

**错误示例：**

~~~~ts
watchSyncEffect(() => {
  width.value = panel.value?.getBoundingClientRect().width ?? 0
})
~~~~

**正确写法：**

~~~~ts
watchPostEffect(() => {
  width.value = panel.value?.getBoundingClientRect().width ?? 0
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 对会同步批量变更的数据使用 `watchSyncEffect()`

**触发条件：** 对会同步批量变更的数据使用 `watchSyncEffect()`

**原因：** 把 sync 理解成“更快”。同步 watcher 不进入批处理队列，每次检测到响应式修改都会立刻触发。

**后果：** 连续 push 100 个元素可能执行 100 次昂贵逻辑，中间状态也会逐一暴露给副作用。

**错误示例：**

~~~~ts
watchSyncEffect(() => rebuildIndex(items.value))

for (let index = 0; index < 100; index++) {
  items.value.push(index)
}
~~~~

**正确写法：**

~~~~ts
watchEffect(() => rebuildIndex(items.value))

for (let index = 0; index < 100; index++) {
  items.value.push(index)
}
~~~~

**验证方式：** 对照正确写法验证结果。
:::

:::tip
watch() 同样支持 `flush: "post" / "sync"` 选项，语义一致；只是没有对应的具名别名函数。
:::
