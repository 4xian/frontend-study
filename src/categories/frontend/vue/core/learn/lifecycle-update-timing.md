---
id: vue.core.learn.intermediate.lifecycle-update-timing
type: lesson
title: 生命周期与更新时机
summary: 在组件挂载、更新和卸载的正确阶段执行逻辑，并等待本轮 DOM 更新
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.composition.lifecycle
  - vue.core.reference.application.next-tick
tags:
  - 生命周期
  - onMounted
  - onUpdated
  - onUnmounted
  - nextTick
  - 更新时机
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-31
sources:
  - title: Vue 生命周期指南
    url: https://cn.vuejs.org/guide/essentials/lifecycle.html
  - title: Vue 组合式 API 生命周期钩子
    url: https://cn.vuejs.org/api/composition-api-lifecycle.html
  - title: Vue nextTick
    url: https://cn.vuejs.org/api/general.html#nexttick
  - title: Vue SSR 组件生命周期钩子
    url: https://cn.vuejs.org/guide/scaling-up/ssr.html#component-lifecycle-hooks
  - title: Vue watcher 回调触发时机
    url: https://cn.vuejs.org/guide/essentials/watchers.html#callback-flush-timing
  - title: Vue 3.5.40 apiLifecycle.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiLifecycle.ts
  - title: Vue 3.5.40 scheduler.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/scheduler.ts
  - title: Vue 3.5.40 apiLifecycle.spec.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiLifecycle.spec.ts
stage: intermediate
level: intermediate
estimatedMinutes: 45
prerequisites:
  - vue.core.learn.basics.emits
objectives:
  - 用挂载、更新和卸载三个阶段解释六个核心生命周期钩子
  - 根据 DOM 处于操作前还是完成后，选择正确的生命周期阶段
  - 预测普通父子组件在 mount、update 和 unmount 时的完整顺序
  - 解释同步连续修改为何通常只产生一轮组件 DOM 更新
  - 在状态修改后等待 nextTick，并准确说明它只等待当前 Vue flush
  - 把外部资源的创建和清理放在同一组件内对称管理
  - 在 setup 同步调用栈中注册钩子，避免丢失当前组件实例
  - 识别 SSR 执行 setup 却不运行客户端生命周期钩子的边界
recap:
  - 六个核心钩子分别包围挂载、更新和卸载三段 DOM 操作。
  - 普通父子树的 before 阶段从父到子，mounted、updated、unmounted 从子到父。
  - 响应式状态同步改变，普通组件 DOM 更新进入队列并在同一同步任务中去重。
  - nextTick 应在状态修改后 await，它只等待调用时已有或正在执行的 Vue flush。
  - onUpdated 中修改本组件渲染依赖容易形成递归更新，应把写操作放回明确动作。
  - 外部 timer、listener 和第三方资源不会自动释放，应由创建它的组件对称清理。
  - 生命周期 API 依赖当前实例，必须在 setup 同步调用栈中注册。
  - SSR 执行 setup 却跳过六个客户端钩子，客户端副作用应推迟到 mounted 创建。
---

# 生命周期与更新时机

## 一、正文大纲

基础阶段已经能用 Props 和 Emits 完成父子交互。进入中级阶段后，需要进一步回答：组件什么时候拥有 DOM，连续状态修改何时真正刷新界面，以及组件离开时谁负责释放资源。本课不背 API 清单，而是沿一条组件实例时间线建立判断模型。

| 部分 | 核心问题 | 完成标志 |
| --- | --- | --- |
| 实例旅程 | 挂载、更新、卸载各有哪些前后边界 | 能解释六个核心钩子 |
| 父子顺序 | before 与完成钩子为何方向相反 | 能预测三阶段顺序 |
| 批量更新 | 同步修改两次为何只刷新一轮 | 区分状态变化与 DOM flush |
| nextTick | 本次等待覆盖哪一轮工作 | 先修改、再等待、再读取 |
| 资源所有权 | 外部资源应由谁释放 | 创建和清理保持对称 |
| 注册与 SSR | 何时存在当前实例，服务端执行什么 | 避免失效注册与资源泄漏 |

:::tip
本课不会提前教授模板引用、KeepAlive、Suspense、Teleport、异步组件、错误捕获、完整 watcher、SSR 架构、Slots、Attrs、组件 v-model、Provide/Inject、store 或动态组件。这些主题各有独立契约，正文和练习只使用普通同步父子组件。
:::

## 二、把组件实例看成三段旅程

生命周期钩子不是随意选择的回调名称。组件会经历首次挂载、后续更新和最终卸载；每一段都分成 Vue 操作 DOM 之前与完成之后。setup 本身不在六个钩子中，但它是同步注册这些钩子的阶段。

~~~~text
setup 同步注册
      │
      ▼
beforeMount ── 创建并插入 DOM ── mounted
      │
      ▼
beforeUpdate ── 修补已有 DOM ── updated
      │
      ▼
beforeUnmount ── 卸载子树并停止作用 ── unmounted
~~~~

| 钩子 | 调用时的组件状态 | 适合执行 |
| --- | --- | --- |
| onBeforeMount | 响应式状态已建立，组件 DOM 尚未创建 | 不依赖 DOM 的挂载前准备 |
| onMounted | 同步子组件和组件 DOM 已挂载 | 建立浏览器侧外部资源 |
| onBeforeUpdate | 状态已改变，DOM 仍是更新前内容 | 观察或准备本轮修补前状态 |
| onUpdated | 本轮组件 DOM 已完成更新 | 读取结果或做少量外部同步 |
| onBeforeUnmount | 实例仍完整，卸载即将开始 | 最后的同步收尾 |
| onUnmounted | 子组件已卸载，相关响应式作用已停止 | 释放 timer、listener 等外部资源 |

:::warning
“完成”描述的是 Vue 的组件 DOM 边界，不等于浏览器已经绘制，也不等于网络、图片或第三方任务已经结束。
:::

## 三、首次挂载：DOM 创建前后

`onBeforeMount()` 运行时，setup 中的状态已经可以读取，但组件自己的 DOM 还没有创建。`onMounted()` 运行时，本组件 DOM 和同步子组件已经挂载；只有应用根容器本身位于 document 中，才能进一步保证这些节点也位于 document 中。

~~~~ts
import { onBeforeMount, onMounted } from 'vue'

/** 记录组件即将进入首次 DOM 创建阶段。 */
onBeforeMount(() => {
  console.log('组件 DOM 尚未创建')
})

/** 在同步子树和组件 DOM 挂载后启动客户端功能。 */
onMounted(() => {
  console.log('组件 DOM 已完成挂载')
})
~~~~

| 需求 | 选择 | 原因 |
| --- | --- | --- |
| 记录首次渲染即将开始 | onBeforeMount | 不依赖已创建的组件 DOM |
| 启动依赖浏览器环境的外部功能 | onMounted | 客户端组件已经完成挂载 |
| 处理普通按钮点击 | 事件处理函数 | 动作由用户事件触发，不属于挂载阶段 |

## 四、更新：状态先变，DOM 后批量修补

给 ref 赋值会立即改变 JavaScript 状态，但 Vue 不会同步修补 DOM。组件更新任务进入调度队列；同一同步任务中连续修改同一个组件依赖时，普通更新任务会去重，通常只修补一次并呈现最终值。

~~~~ts
import { nextTick, ref } from 'vue'

const count = ref(0)

/** 同步增加两次，并等待这一轮 Vue DOM 更新完成。 */
async function increaseTwice() {
  count.value++
  count.value++

  console.log(count.value) // 2：响应式状态已经改变
  await nextTick()
  console.log('本轮组件 DOM 已刷新到最终值')
}
~~~~

| 时刻 | 响应式 count | 组件 DOM | 更新钩子 |
| --- | --- | --- | --- |
| 同步修改前 | 0 | 显示 0 | 尚未进入更新 |
| 连续两次 count++ 后 | 2 | 仍可能显示 0 | 更新任务已排队并去重 |
| flush 开始 | 2 | 修补前仍是旧内容 | onBeforeUpdate |
| flush 完成 | 2 | 显示 2 | onUpdated |

~~~~ts
import { onBeforeUpdate, onUpdated } from 'vue'

/** 在本轮修补前观察旧 DOM 所处的阶段。 */
onBeforeUpdate(() => {
  console.log('状态已变，DOM 尚未修补')
})

/** 在本轮修补完成后观察最终 DOM 所处的阶段。 */
onUpdated(() => {
  console.log('DOM 已完成本轮修补')
})
~~~~

Vue 允许在 `onBeforeUpdate()` 中修改响应式状态，因为本轮 DOM 还没有修补完成；仍应只在确有更新前准备需求时使用。相反，`onUpdated()` 写入本组件渲染依赖会在完成后重新安排更新。

:::warning
不要在 `onUpdated()` 中修改会触发本组件渲染的响应式状态，否则完成钩子会再次安排更新，形成自触发循环。常规状态修改应放回具体事件处理函数。
:::

只做时机对照：默认 watcher 回调发生在父组件更新之后、所属组件 DOM 更新之前；确实需要所属组件更新后 DOM 时使用 post flush。本课不继续展开其来源、选项或清理 API。

## 五、普通父子组件的三段顺序

对普通同步父子树，before 半段从外到内，完成半段从内到外。父级先开始处理整棵子树，子级先完成自己的工作，父级最后确认子树已经完成。这个模型同时适用于首次挂载、prop 驱动更新和整棵子树卸载。

| 阶段 | before 半段 | 完成半段 |
| --- | --- | --- |
| 首次挂载 | 父 onBeforeMount → 子 onBeforeMount | 子 onMounted → 父 onMounted |
| prop 驱动更新 | 父 onBeforeUpdate → 子 onBeforeUpdate | 子 onUpdated → 父 onUpdated |
| 整棵子树卸载 | 父 onBeforeUnmount → 子 onBeforeUnmount | 子 onUnmounted → 父 onUnmounted |

结合上一课的通信链来看：子组件发出事件后，父 handler 同步修改父状态；该状态作为 prop 在同一调度批次向下刷新。父 update job 先运行，子级先完成 updated，最后才到父级 updated。事件已经发出与 DOM 已经更新是两个不同时间点。

## 六、在生命周期更新时序实验台验证顺序

唯一 Demo 使用真实父子组件和非响应式暂存日志。先“同步增加两次”，观察 count 直接从 0 到 2，却只出现一轮父子 update 钩子；再隐藏和重新显示子组件，对照 unmount 与 mount 的内外顺序。时间线只在 await nextTick 后一次性发布，避免日志界面触发自身循环。

:::demo{id="vue.core.learn.intermediate.lifecycle-update-timing.lifecycle-update-timeline-demo" playground="true"}
观察同步批量更新、普通父子组件钩子顺序与 nextTick 发布边界
:::

## 七、nextTick 只等待当前 Vue flush

`nextTick()` 不是生命周期钩子。它返回 Promise，并连接调用时已经存在或正在执行的 Vue 调度 flush。正确顺序是先修改状态，再 await，最后执行依赖本轮 DOM 更新结果的代码。

:::compare{before="顺序相反，等待不到后续更新" after="先修改，再等待当前更新"}
### 顺序相反，等待不到后续更新

~~~~text
await nextTick()
count.value++
readUpdatedResult()
~~~~

### 先修改，再等待当前更新

~~~~text
count.value++
await nextTick()
readUpdatedResult()
~~~~
:::

| 调用时状态 | nextTick 的结果 | 不承诺 |
| --- | --- | --- |
| 已有组件更新排队 | 等待当前 flush 完成 | 未来其他异步来源产生的更新 |
| 当前正在 flush | 连接当前 flush Promise | 所有后续业务 Promise |
| 当前没有 flush | 提供一个已解决 Promise 的微任务边界 | 浏览器绘制或外部任务完成 |

~~~~ts
import { nextTick } from 'vue'

/** 更新状态后，只等待这一轮 Vue DOM flush。 */
async function saveAndReadResult() {
  status.value = 'saved'
  await nextTick()
  readUpdatedResult()
}
~~~~

:::tip
调用 `nextTick()` 但不 await 不会暂停后续代码。它也不等待 fetch、timer、动画、图片加载、第三方任务或浏览器绘制；每类工作都要等待自己的完成信号。
:::

## 八、资源由创建它的组件对称清理

`onBeforeUnmount()` 运行时实例仍完整，可以完成最后的同步记录；`onUnmounted()` 运行时子组件已经卸载，setup 中创建的相关响应式作用已经停止，适合释放浏览器 timer、手工 listener 和外部连接。

~~~~ts
import { onBeforeUnmount, onMounted, onUnmounted } from 'vue'

let intervalId: ReturnType<typeof setInterval> | undefined

/** 刷新当前时钟显示。 */
function refreshClock() {
  clock.value = new Date().toLocaleTimeString()
}

/** 在组件挂载后创建由本组件拥有的 timer。 */
function startClock() {
  intervalId = setInterval(refreshClock, 1000)
}

/** 在组件卸载后释放由本组件创建的 timer。 */
function stopClock() {
  if (intervalId !== undefined) clearInterval(intervalId)
}

/** 在卸载开始前记录最终业务状态。 */
onBeforeUnmount(() => {
  console.log('最终时钟值', clock.value)
})

onMounted(startClock)
onUnmounted(stopClock)
~~~~

| 组件创建的资源 | 建立阶段 | 清理阶段 |
| --- | --- | --- |
| setInterval / setTimeout | onMounted | onUnmounted 中 clear |
| 手工 DOM listener | onMounted | onUnmounted 中 remove |
| 观察器或第三方实例 | onMounted | onUnmounted 中 disconnect / dispose |
| Vue 管理的相关响应式作用 | setup | 卸载时由 Vue 停止 |

:::warning
Vue 停止自己管理的响应式作用，不代表它会自动释放浏览器或第三方资源。谁创建外部资源，谁就保存句柄并提供对称清理。
:::

## 九、生命周期钩子必须同步注册

生命周期 API 默认把回调注入当前组件实例。Vue 只在 setup 的同步调用栈中维护这个实例；同步调用的组合式函数仍在同一调用栈内，因此可以注册钩子。timer、Promise 回调或普通 await 之后再注册，通常已经没有可归属的实例。

:::compare{before="异步回调中才注册" after="setup 同步调用栈中注册"}
### 异步回调中才注册

~~~~text
/** 错误：timer 回调执行时 setup 已结束。 */
setTimeout(() => {
  onMounted(startClientFeature)
}, 0)
~~~~

### setup 同步调用栈中注册

~~~~text
/** 为当前组件同步注册客户端功能的建立与清理。 */
function useClientFeature() {
  onMounted(startClientFeature)
  onUnmounted(stopClientFeature)
}

useClientFeature()
~~~~
:::

:::tip
同步注册不要求钩子回调内部只能做同步工作。受约束的是调用 `onMounted(callback)` 的注册时机，已注册回调在生命周期到达后仍可启动自己的异步任务。
:::

## 十、SSR 中 setup 与客户端钩子不对称

服务端渲染会执行 setup 或 `<script setup>` 根作用域，但没有动态 DOM 更新，本课六个 mount、update、unmount 钩子都不会运行。如果在 setup 根作用域创建永续 timer，再只依靠 unmounted 清理，服务端就没有对应的释放机会。

~~~~ts
let intervalId: ReturnType<typeof setInterval> | undefined

/** 仅在客户端组件挂载后创建周期任务。 */
function startPolling() {
  intervalId = setInterval(refreshData, 5000)
}

/** 在客户端组件卸载后释放周期任务。 */
function stopPolling() {
  if (intervalId !== undefined) clearInterval(intervalId)
}

onMounted(startPolling)
onUnmounted(stopPolling)
~~~~

:::warning
把需要清理的浏览器侧副作用推迟到 onMounted 创建，既避免服务端根作用域泄漏，也保证客户端存在对应的 onUnmounted 清理路径。
:::

## 十一、易错使用提示

:::pitfalls
### 在 onMounted 中假定整个页面和外部任务都已完成

**触发条件：** 在 onMounted 中假定整个页面和外部任务都已完成

**原因：** mounted 只保证同步子组件和本组件 DOM 已挂载，不代表页面所有内容、请求或图片都完成。

**后果：** 过早读取外部结果会得到空值，后续逻辑依赖一个不存在的完成保证。

**错误示例：**

~~~~ts
/** 错误地把 mounted 当成所有外部任务完成信号。 */
onMounted(() => {
  consumeRemoteResult()
})
~~~~

**正确写法：**

~~~~ts
/** 在组件挂载后只启动外部任务。 */
async function loadRemoteResult() {
  const result = await fetchResult()
  consumeRemoteResult(result)
}

onMounted(loadRemoteResult)
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 onUpdated 中修改本组件响应式状态

**触发条件：** 在 onUpdated 中修改本组件响应式状态

**原因：** updated 在一次更新完成后运行，写入渲染依赖会再次安排同一组件更新。

**后果：** 组件形成自触发循环，最终触发最大递归更新错误。

**错误示例：**

~~~~ts
/** 错误地在完成钩子里继续驱动同一状态。 */
onUpdated(() => {
  count.value++
})
~~~~

**正确写法：**

~~~~ts
/** 响应明确的用户动作并更新状态。 */
function increaseCount() {
  count.value++
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为每次连续赋值都会单独更新 DOM

**触发条件：** 认为每次连续赋值都会单独更新 DOM

**原因：** 同一同步任务中的普通组件更新任务会排队并去重。

**后果：** 代码错误依赖一个不会呈现的中间 DOM，并误判钩子应执行两轮。

**错误示例：**

~~~~ts
count.value++
count.value++
// 错误假设：DOM 先显示 1，再显示 2
~~~~

**正确写法：**

~~~~ts
/** 同步修改两次，并把最终值作为一轮更新处理。 */
function increaseTwice() {
  count.value++
  count.value++
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 调用 nextTick 却没有 await

**触发条件：** 调用 nextTick 却没有 await

**原因：** nextTick 返回 Promise，单独调用不会暂停紧随其后的同步代码。

**后果：** 后续代码仍在 DOM 更新前执行，读取到旧界面状态。

**错误示例：**

~~~~ts
count.value++
nextTick()
readUpdatedResult()
~~~~

**正确写法：**

~~~~ts
/** 修改状态并等待当前 Vue flush。 */
async function increaseAndRead() {
  count.value++
  await nextTick()
  readUpdatedResult()
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 先 await nextTick 再修改状态

**触发条件：** 先 await nextTick 再修改状态

**原因：** 一次 nextTick 只连接调用时已有或正在执行的 flush。

**后果：** 等待先结束，后续修改才入队，读取代码仍可能早于 DOM 更新。

**错误示例：**

~~~~ts
await nextTick()
count.value++
readUpdatedResult()
~~~~

**正确写法：**

~~~~ts
count.value++
await nextTick()
readUpdatedResult()
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 nextTick 当成所有异步和绘制的等待器

**触发条件：** 把 nextTick 当成所有异步和绘制的等待器

**原因：** nextTick 只等待当前 Vue 调度 flush，不追踪外部任务或浏览器绘制帧。

**后果：** 代码在真正依赖的工作完成前继续执行，产生时序竞争。

**错误示例：**

~~~~ts
startRemoteTask()
await nextTick()
// 错误假设：远程任务和浏览器绘制都已完成
~~~~

**正确写法：**

~~~~ts
/** 等待远程任务自身返回的完成信号。 */
async function loadData() {
  const result = await startRemoteTask()
  applyResult(result)
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 在异步回调中注册生命周期钩子

**触发条件：** 在异步回调中注册生命周期钩子

**原因：** 回调运行时 setup 已结束，当前组件实例通常不再可用。

**后果：** Vue 无法把钩子归属到组件，开发环境警告且注册被跳过。

**错误示例：**

~~~~ts
/** 错误：延迟到 setup 结束后才注册。 */
setTimeout(() => {
  onMounted(startFeature)
}, 0)
~~~~

**正确写法：**

~~~~ts
/** 在 setup 同步调用栈中注册功能。 */
function useFeature() {
  onMounted(startFeature)
  onUnmounted(stopFeature)
}

useFeature()
~~~~

**验证方式：** 对照正确写法验证结果。

### 以为卸载会自动清理所有外部资源

**触发条件：** 以为卸载会自动清理所有外部资源

**原因：** Vue 会停止相关响应式作用，但不会替组件 clear timer 或释放第三方实例。

**后果：** 组件消失后任务仍持续运行，造成重复回调、内存泄漏或无效连接。

**错误示例：**

~~~~ts
/** 错误：只创建资源，不保存句柄也不清理。 */
onMounted(() => {
  setInterval(refreshClock, 1000)
})
~~~~

**正确写法：**

~~~~ts
let intervalId: ReturnType<typeof setInterval>

/** 建立组件拥有的 timer。 */
function startClock() {
  intervalId = setInterval(refreshClock, 1000)
}

/** 释放组件拥有的 timer。 */
function stopClock() {
  clearInterval(intervalId)
}

onMounted(startClock)
onUnmounted(stopClock)
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 SSR setup 根作用域创建永续副作用

**触发条件：** 在 SSR setup 根作用域创建永续副作用

**原因：** setup 会在服务端执行，但本课的客户端卸载钩子不会运行。

**后果：** 服务端创建的 timer 或连接没有对应清理阶段，持续占用资源。

**错误示例：**

~~~~ts
const intervalId = setInterval(refreshData, 5000)

/** 错误：服务端不会运行这个客户端清理钩子。 */
onUnmounted(() => clearInterval(intervalId))
~~~~

**正确写法：**

~~~~ts
let intervalId: ReturnType<typeof setInterval> | undefined

/** 只在客户端挂载后建立资源。 */
function startPolling() {
  intervalId = setInterval(refreshData, 5000)
}

/** 在客户端卸载后释放资源。 */
function stopPolling() {
  if (intervalId !== undefined) clearInterval(intervalId)
}

onMounted(startPolling)
onUnmounted(stopPolling)
~~~~

**验证方式：** 对照正确写法验证结果。

### 把固定父子顺序外推到所有组件形态

**触发条件：** 把固定父子顺序外推到所有组件形态

**原因：** 本课顺序来自普通同步父子树的固定版本测试，不是所有渲染形态的通用承诺。

**后果：** 业务依赖脆弱的兄弟或跨树先后关系，组件结构变化后行为失效。

**错误示例：**

~~~~ts
/** 错误地用兄弟钩子先后来传递业务状态。 */
onMounted(() => {
  readSiblingSideEffect()
})
~~~~

**正确写法：**

~~~~ts
/** 通过明确事件处理业务状态，不依赖兄弟钩子顺序。 */
function applyChildRequest(payload: ChildRequest) {
  state.value = reduceRequest(state.value, payload)
}
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 十二、从 Vue 3.5.40 源码与测试推导

:::steps
### 钩子默认注入当前组件实例

`createHook()` 默认把 `currentInstance` 作为 target，再由 `injectHook()` 加入实例对应的钩子数组。没有当前实例就无法建立归属，因此注册必须同步发生在 setup 调用栈内。

### 生命周期回调执行时暂停依赖追踪

`injectHook()` 包装器在调用用户回调前暂停依赖追踪，结束后恢复。钩子中偶然读取 ref 不会把它新增为渲染依赖；触发时机仍由生命周期阶段决定。

### SSR setup 会跳过客户端钩子注入

`createHook()` 在服务端组件 setup 标记存在时跳过本课六个客户端钩子的注入。setup 根作用域仍执行，所以仅客户端外部资源应推迟到 mounted 创建。

### renderer 把完成钩子放入 post-render 队列

`renderer.ts` 在 DOM patch 前同步调用 before hooks，把 mounted、updated、unmounted 交给 post-render 队列。因此 before 能观察操作前阶段，完成钩子位于本轮 patch 之后。

### 官方测试固定普通父子完整顺序

`apiLifecycle.spec.ts` 用 Root、Mid、Child 三层断言 before 阶段从外到内，mounted、updated、unmounted 完成阶段从内到外。本课顺序表来自固定测试，不是名称猜测。

### 组件任务按父子 ID 排序并去重

`scheduler.ts` 按组件 ID 递增安排更新，使先创建的父任务先运行；`queueJob()` 用 QUEUED 标记避免同一普通任务重复入队，形成同步双增的一轮更新。

### nextTick 只连接当前 flush Promise

`nextTick()` 返回 `currentFlushPromise || resolvedPromise`。它只连接当前已有或正在执行的 Vue flush，不会建立等待未来所有异步工作的追踪器。

### 递归限制是错误兜底而非更新策略

调度器开发分支以 `RECURSION_LIMIT = 100` 检测任务反复修改自己的依赖。它帮助定位 updated 写状态造成的循环，不表示递归更新在限制内就是合法设计。
:::

:::exercise
### 实现可挂载、更新与卸载的计数子组件

**要求：**

~~~~text
创建父组件与 LifecycleCounter.vue。父级保存 count 和子组件可见状态，提供“同步增加两次”和“隐藏/显示子组件”按钮。子组件同步注册六个核心钩子，把标签写入父级普通数组；每次动作先修改状态，再 await nextTick，最后一次性发布日志。子组件再在 mounted 创建 timer、unmounted 对称清理。验证 count 每次增加 2，但 update 钩子只出现一轮。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
<!-- LifecycleCounter.vue -->
<script setup lang="ts">
import {
  onBeforeMount,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  onUnmounted,
  onUpdated,
} from 'vue'

const props = defineProps<{ count: number }>()
const emit = defineEmits<{ lifecycle: [label: string] }>()
let intervalId: ReturnType<typeof setInterval> | undefined

/** 把子组件当前阶段报告给直接父级。 */
function report(label: string) {
  emit('lifecycle', '子 ' + label)
}

/** 记录周期任务执行时的当前输入。 */
function reportClockTick() {
  console.log('当前 count', props.count)
}

/** 启动子组件拥有的周期任务。 */
function startClock() {
  intervalId = setInterval(reportClockTick, 1000)
}

/** 清理子组件拥有的周期任务。 */
function stopClock() {
  if (intervalId !== undefined) clearInterval(intervalId)
}

/** 报告子组件进入挂载前阶段。 */
onBeforeMount(() => report('beforeMount'))
/** 报告子组件完成挂载，并建立外部资源。 */
onMounted(() => {
  report('mounted')
  startClock()
})
/** 报告子组件进入更新前阶段。 */
onBeforeUpdate(() => report('beforeUpdate'))
/** 报告子组件完成本轮更新。 */
onUpdated(() => report('updated'))
/** 报告子组件进入卸载前阶段。 */
onBeforeUnmount(() => report('beforeUnmount'))
/** 报告子组件完成卸载，并释放外部资源。 */
onUnmounted(() => {
  report('unmounted')
  stopClock()
})
</script>

<template>
  <p>子组件 count：{{ props.count }}</p>
</template>

<!-- StudyPage.vue -->
<script setup lang="ts">
import { nextTick, ref } from 'vue'
import LifecycleCounter from './LifecycleCounter.vue'

const count = ref(0)
const childVisible = ref(true)
const timeline = ref<string[]>([])
const pendingEntries: string[] = []
let recording = false

/** 在记录事务期间暂存一条生命周期标签。 */
function record(label: string) {
  if (recording) pendingEntries.push(label)
}

/** 结束当前记录事务并一次性发布时间线。 */
function publishTimeline() {
  recording = false
  timeline.value = [...pendingEntries]
}

/** 同步增加两次，并在当前 flush 后发布日志。 */
async function increaseTwice() {
  pendingEntries.length = 0
  recording = true
  count.value++
  count.value++
  await nextTick()
  publishTimeline()
}

/** 切换子组件，并在当前 flush 后发布日志。 */
async function toggleChild() {
  pendingEntries.length = 0
  recording = true
  childVisible.value = !childVisible.value
  await nextTick()
  publishTimeline()
}
</script>

<template>
  <button type="button" @click="increaseTwice">同步增加两次</button>
  <button type="button" @click="toggleChild">
    {{ childVisible ? '隐藏子组件' : '显示子组件' }}
  </button>
  <LifecycleCounter
    v-if="childVisible"
    :count="count"
    @lifecycle="record"
  />
  <ol>
    <li v-for="item in timeline" :key="item">{{ item }}</li>
  </ol>
</template>
~~~~
:::

- [ ] 能按挂载、更新、卸载三段解释六个核心钩子
- [ ] 能区分 before 阶段的旧 DOM 与完成阶段的新 DOM
- [ ] 普通父子树的 before 从外到内，完成钩子从内到外
- [ ] 同步连续修改会先改变状态，再合并为一轮普通组件更新
- [ ] 状态修改后 await nextTick，只等待当前 Vue flush
- [ ] 外部资源在 mounted 创建，在 unmounted 对称释放
- [ ] 生命周期钩子在 setup 同步调用栈中完成注册
- [ ] SSR 会执行 setup，但不会运行本课六个客户端钩子
- [ ] 业务逻辑不依赖兄弟组件或跨树的钩子先后

## 十三、完成本课后的判断顺序

先判断逻辑属于挂载、更新还是卸载，再判断需要 DOM 操作前还是完成后的阶段。若只是某次状态修改后等待界面刷新，优先在该动作中 await nextTick；若创建了组件外部资源，则由同一组件保存句柄并在卸载时释放。最后确认钩子同步注册，并检查服务端是否会执行创建资源的代码。
