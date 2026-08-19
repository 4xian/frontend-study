---
id: vue.core.reference.application.next-tick
type: reference
title: nextTick()
summary: 等待当前批次的 Vue DOM 更新完成；在响应式状态修改后 await 它，才能读取本轮渲染后的 DOM
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.application.create-app
  - vue.core.reference.reactivity-watchers.watch
  - vue.core.reference.composition.lifecycle
tags:
  - nextTick
  - DOM 更新
  - 微任务
  - 调度器
  - 异步
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-29
sources:
  - title: Vue 通用 API：nextTick
    url: https://cn.vuejs.org/api/general.html#nexttick
  - title: Vue 响应式基础：DOM 更新时机
    url: https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html#dom-update-timing
  - title: Vue 3.5.40 scheduler.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/scheduler.ts
  - title: Vue 3.5.40 renderer.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts
group: application
signature: |-
  function nextTick(): Promise<void>
  function nextTick<T, R>(this: T, fn: (this: T) => R | Promise<R>): Promise<R>
anchors:
  - 概述
  - 等待 DOM 更新
  - 回调与返回值
  - 易错使用提示
  - 最小源码实现
---

# nextTick()

## 一、概述

响应式状态变化后，Vue 不会立即逐次更新 DOM，而是把同一同步任务中的组件更新合并到一次异步冲刷。`nextTick()` 返回一个在当前批次 DOM 更新完成后兑现的 Promise；只有确实需要读取、聚焦、测量或依赖更新后 DOM 时才需要等待它。

## 二、等待 DOM 更新

~~~~vue
<script setup lang="ts">
import { nextTick, ref } from 'vue'

const count = ref(0)
const counterElement = ref<HTMLElement | null>(null)

/** 修改状态后等待本轮 DOM 更新，再读取元素文本。 */
async function increment() {
  count.value++
  console.log(counterElement.value?.textContent) // 仍可能是旧值

  await nextTick()
  console.log(counterElement.value?.textContent) // 已是新值
}
</script>

<template>
  <button ref="counterElement" @click="increment">{{ count }}</button>
</template>
~~~~

:::demo{id="vue.core.reference.application.next-tick.next-tick-demo" playground="true"}
同一次点击中，记录状态更新后、await nextTick 前后读取到的 DOM 文本
:::

## 三、回调与返回值

除了 `await nextTick()`，也可传入回调。回调签名保留泛型 `T` 与 `R`：Vue 会在当前冲刷 Promise 后调用它，并把同步返回值或 Promise 返回值包装成 `Promise<R>`。在组合式 API 中通常优先使用 `await`，便于按代码顺序表达状态修改、等待与 DOM 操作。

~~~~ts
const width = await nextTick(() => panelElement.value?.clientWidth ?? 0)

nextTick(function () {
  return this.measure() // 回调返回值决定 Promise<R> 的 R
}.bind(chartController))
~~~~

:::warning
`nextTick()` 只等待调用时已排入或正在冲刷的 Vue 更新。它不是浏览器绘制帧、网络请求、定时器、第三方动画或异步组件 loader 的通用等待器。
:::

## 四、易错使用提示

:::pitfalls
### 调用 nextTick() 却不等待它，再立刻读取 DOM

**触发条件：** 调用 nextTick() 却不等待它，再立刻读取 DOM

**原因：** `nextTick()` 返回 Promise，不会暂停后续同步代码。只调用它而没有 `await` 或回调，读取仍发生在 DOM 冲刷之前。

**后果：** 会读到修改前的文本、尺寸或节点数量，测试和交互逻辑因此出现偶发失败。

**错误示例：**

~~~~ts
count.value++
nextTick()
console.log(counterElement.textContent)
~~~~

**正确写法：**

~~~~ts
count.value++
await nextTick()
console.log(counterElement.textContent)
~~~~

**验证方式：** 对照正确写法验证结果。

### 先等待 nextTick()，再修改状态并立即读取 DOM

**触发条件：** 先等待 nextTick()，再修改状态并立即读取 DOM

**原因：** 一次 `await nextTick()` 只能等待调用时已有的更新。之后才发生的响应式赋值会安排新的 DOM 更新批次。

**后果：** await 已完成，但紧随其后的 DOM 读取仍是赋值前的结果，容易误判 nextTick 没有生效。

**错误示例：**

~~~~ts
await nextTick()
count.value++
console.log(counterElement.textContent)
~~~~

**正确写法：**

~~~~ts
count.value++
await nextTick()
console.log(counterElement.textContent)
~~~~

**验证方式：** 对照正确写法验证结果。

### 在同一 tick 连续赋值，却期待每个中间 DOM 都出现

**触发条件：** 在同一 tick 连续赋值，却期待每个中间 DOM 都出现

**原因：** Vue 会合并同一同步任务中的更新，`nextTick()` 只等待一次批量冲刷，不会为每个赋值单独提交一帧 DOM。

**后果：** 进度条、日志或断言只会观察到最终值，中间的 25 与 50 从未进入 DOM。

**错误示例：**

~~~~ts
progress.value = 25
progress.value = 50
progress.value = 100
await nextTick()
~~~~

**正确写法：**

~~~~ts
progress.value = 25
await nextTick()
progress.value = 50
await nextTick()
progress.value = 100
await nextTick()
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 nextTick() 等待请求、定时器或异步组件加载

**触发条件：** 用 nextTick() 等待请求、定时器或异步组件加载

**原因：** `nextTick()` 只关联 Vue 调度器的当前冲刷 Promise，不会等待独立的 fetch、timer 或异步组件 loader Promise。

**后果：** 等待结束后数据可能尚未返回，异步组件仍在 loading 状态，代码会过早读取页面。

**错误示例：**

~~~~ts
loadProfile()
await nextTick()
console.log(profile.value)
~~~~

**正确写法：**

~~~~ts
await loadProfile()
await nextTick()
console.log(profile.value)
~~~~

**验证方式：** 对照正确写法验证结果。

### 修改非响应式变量后调用 nextTick()，期待强制重渲染

**触发条件：** 修改非响应式变量后调用 nextTick()，期待强制重渲染

**原因：** `nextTick()` 只等待已经调度的组件更新，本身不会创建渲染任务；普通局部变量的赋值不会触发组件更新。

**后果：** Promise 会正常兑现，但页面内容保持不变，看起来像 nextTick “失效”。

**错误示例：**

~~~~ts
let count = 0

/** 增加普通变量，但不会触发 Vue 更新。 */
async function increment() {
  count++
  await nextTick()
}
~~~~

**正确写法：**

~~~~ts
const count = ref(0)

/** 增加响应式状态，再等待对应 DOM 更新。 */
async function increment() {
  count.value++
  await nextTick()
}
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 五、最小源码实现

Vue 3.5.40 让 `nextTick()` 与组件更新共享 `currentFlushPromise`。第一个更新任务入队时，调度器安排一个微任务冲刷队列；`nextTick()` 把回调链接在这个 Promise 之后，因此回调执行前本轮 DOM 更新已经完成。没有待冲刷任务时，它退化为已兑现 Promise 的下一次微任务。

~~~~ts
// 精简自 vuejs/core v3.5.40 packages/runtime-core/src/scheduler.ts
const resolvedPromise = Promise.resolve()
let currentFlushPromise: Promise<void> | null = null

/** 将组件更新安排到同一轮微任务冲刷。 */
function queueFlush() {
  if (!currentFlushPromise) {
    currentFlushPromise = resolvedPromise.then(flushJobs)
  }
}

/** 执行已入队的组件更新任务。 */
function flushJobs() {
  // 省略任务排序、去重与 pre / post 队列细节。
  currentFlushPromise = null
}

/** 在当前 DOM 更新批次之后调用回调，并保留其 Promise<R> 返回类型。 */
export function nextTick<T, R>(this: T, fn?: (this: T) => R | Promise<R>) {
  const promise = currentFlushPromise || resolvedPromise
  return fn ? promise.then(this ? fn.bind(this) : fn) : promise
}
~~~~
