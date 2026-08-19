---
id: vue.core.learn.advanced.custom-ref-triggering
type: lesson
title: CustomRef 与触发控制
summary: 显式控制自定义 Ref 的依赖追踪、值提交与更新触发时机
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.reactivity.custom-ref
  - vue.core.reference.reactivity.ref
  - vue.core.learn.basics.watchers
tags:
  - customRef
  - CustomRefFactory
  - track
  - trigger
  - 防抖
  - 对象身份
  - 定时器清理
appliesTo: Vue 3.5.40
verifiedAt: 2026-08-02
sources:
  - title: Vue 中文响应式 API：进阶 customRef()
    url: https://cn.vuejs.org/api/reactivity-advanced.html#customref
  - title: Vue 中文深入响应式系统
    url: https://cn.vuejs.org/guide/extras/reactivity-in-depth.html
  - title: Vue 中文组合式 API：onUnmounted()
    url: https://cn.vuejs.org/api/composition-api-lifecycle.html#onunmounted
  - title: Vue 响应式进阶 API 官方 Markdown
    url: https://github.com/vuejs/docs/blob/main/src/api/reactivity-advanced.md
  - title: Vue 3.5.40 ref.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts
  - title: Vue 3.5.40 ref 官方测试
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/ref.spec.ts
stage: advanced
level: advanced
estimatedMinutes: 65
prerequisites:
  - vue.core.learn.advanced.shallow-reactivity-raw-boundaries
objectives:
  - 解释 customRef 工厂、get、set、track 与 trigger 各自承担的职责
  - 区分“接收一次写入”“提交可观察值”和“通知订阅者”三个时刻
  - 让依赖读取经过 track，并只在语义值真正提交后调用 trigger
  - 实现会合并连续输入的防抖 CustomRef，并预测每一步的可见结果
  - 让对象 getter 在两次有效提交之间返回稳定身份
  - 识别 customRef 不会自动执行相等性比较、深层转换或定时器清理
  - 在重排定时器、主动取消和组件卸载时清理未完成任务
  - 判断需求应使用普通 ref、computed、watch 还是 customRef
recap:
  - customRef 保留 Ref 的 value 接口，但把 get、set、track 与 trigger 时机交给工厂。
  - track 在活跃响应式消费期间建立订阅；事件中的孤立读取不会创建持续副作用。
  - trigger 只通知订阅者重新读取，业务值必须在通知前完成提交。
  - 防抖需要区分即时草稿与已提交值，并把连续 set 合并为一次提交和 trigger。
  - 对象 getter 应在两次有效提交之间返回稳定身份，真实提交时再替换快照。
  - CustomRefImpl 不替工厂做相等性判断、深层转换或异步资源清理。
  - 旧定时器要在重排、主动取消和所有者卸载时用同一幂等函数清理。
  - 普通 ref、computed 或 watch 足够时优先使用它们，只在 value 协议本身需要定制时使用 customRef。
---

# CustomRef 与触发控制

## 一、正文大纲

上一课建立浅层响应式与原始对象边界，本课继续控制“什么时候才算发生更新”。customRef() 仍返回普通 Ref 接口，但把 value 的读取与写入交给工厂返回的 get 和 set，并把依赖收集与更新通知两个开关交给 track 和 trigger。我们先拆开四个职责，再建立防抖的两阶段提交，最后用稳定 getter 身份和定时器清理收紧工程边界。

## 二、CustomRef 仍是 Ref，定制的是 value 协议

调用方仍通过 model.value 读写，也可以把它交给模板、computed 或 watch。不同之处在内部：工厂在创建 customRef 时接收 track 与 trigger，并返回 get 和 set。Vue 不替工厂保存业务值，也不规定一次 set 必须立刻改变下一次 get 的结果。

~~~~ts
import { customRef } from 'vue'

/** 创建一个行为等同于基础字符串 ref 的最小 CustomRef。 */
function usePlainCustomRef(initialValue: string) {
  let value = initialValue

  return customRef<string>((track, trigger) => ({
    /** 收集本次 value 读取所在的活跃响应式副作用。 */
    get() {
      track()
      return value
    },
    /** 保存新值并通知已经收集的订阅者。 */
    set(nextValue) {
      if (Object.is(nextValue, value)) return
      value = nextValue
      trigger()
    },
  }))
}
~~~~

:::tip
一般写法是在 get 中 track、在 set 中 trigger，但官方明确说明调用时机乃至是否调用都由工厂决定。这份自由适合延迟提交、外部信号或协议适配，也意味着正确性责任转移给实现者。
:::

## 三、track 只负责建立读取方与当前 Ref 的关系

组件渲染、computed 或 watchEffect 正在执行时读取 customRef.value，get 中的 track 才能把当前活跃副作用登记为订阅者。事件处理器里的普通读取没有活跃副作用，不会凭空创建一个以后自动运行的任务。漏掉 track 后，get 仍能返回最新变量，却没有任何响应式消费方知道应该订阅它。

| 发生位置 | track 的结果 | 后续 trigger 的结果 |
| --- | --- | --- |
| 组件 render 中读取 | 登记组件渲染副作用 | 安排组件更新 |
| computed getter 中读取 | 登记 computed 内部副作用 | 使 computed 失效并在需要时重算 |
| watchEffect 中读取 | 登记 watcher 副作用 | 按 watcher 调度规则重新运行 |
| 点击事件中单独读取 | 没有活跃副作用可登记 | 这次读取本身不会创建持续监听 |

## 四、trigger 只通知，不替你提交业务值

trigger 会通知已经订阅当前 CustomRef 的响应式副作用，但下一次 get 返回什么仍由工厂的闭包状态决定。正确顺序通常是先写入要公开的语义值，再 trigger。反过来先通知再异步写值，订阅者重读时仍可能拿到旧值，而且后续写入若没有第二次 trigger 就永远不可见。

~~~~ts
/** 提交已经准备好的课程标题。 */
function commitTitle(nextTitle: string): void {
  if (Object.is(nextTitle, committedTitle)) return
  committedTitle = nextTitle
  trigger()
}
~~~~

:::warning
trigger() 不等于 DOM 已同步更新。它启动 Vue 的响应式通知与调度，组件 DOM 仍遵循批处理和 nextTick 边界；需要读取更新后 DOM 时继续使用 nextTick，而不是重复 trigger。
:::

## 五、防抖需要把草稿、提交值和通知拆开

防抖 CustomRef 的 set 先接收最新草稿并取消上一只定时器，但不立即替换 committedValue。用户停止输入达到 delay 后，回调才提交最新草稿并 trigger。这样连续十次 set 可以合并为一次语义提交和一次响应式通知；输入框的即时草稿与下游已提交快照是两个有意区分的状态。

:::steps
### 读取已提交值

get 调用 track，并返回两次提交之间保持不变的 committedValue。

### 接收最新草稿

set 保存 pendingValue，清除上一只定时器，再为当前草稿安排新定时器。

### 到期后提交

定时器回调先比较并替换 committedValue，再调用 trigger 通知订阅者。

### 消费方重新读取

组件、computed 或 watcher 重跑 get，重新 track 并看到刚提交的值。
:::

~~~~ts
import { customRef } from 'vue'

/** 创建只在输入停顿后提交字符串的防抖 Ref。 */
function useDebouncedRef(initialValue: string, delay = 300) {
  let committedValue = initialValue
  let pendingValue = initialValue
  let timer: ReturnType<typeof setTimeout> | undefined

  return customRef<string>((track, trigger) => ({
    /** 收集依赖并返回最近一次已提交值。 */
    get() {
      track()
      return committedValue
    },
    /** 保存最新草稿并重新安排唯一提交定时器。 */
    set(nextValue) {
      pendingValue = nextValue
      clearTimeout(timer)
      timer = setTimeout(() => {
        timer = undefined
        if (Object.is(pendingValue, committedValue)) return
        committedValue = pendingValue
        trigger()
      }, delay)
    },
  }))
}
~~~~

## 六、对象 getter 要在语义提交之间保持身份稳定

官方特别提醒：若 get 每次都创建新对象，父组件因无关状态重渲染时也会重新求值并把一个新 prop 传给子组件。setter 没有运行，父侧 CustomRef 没有 trigger，子组件却因 prop 身份变化而更新。正确做法是缓存快照对象，只在真正提交新语义值时替换该对象。

:::compare{before="每次读取创建对象" after="提交时替换快照"}
### 每次读取创建对象

~~~~text
const model = customRef((track, trigger) => ({
  /** 每次读取都制造不同对象身份。 */
  get() {
    track()
    return { text: committedText }
  },
  /** 保存文本并通知订阅者。 */
  set(next) {
    committedText = next.text
    trigger()
  },
}))
~~~~

### 提交时替换快照

~~~~text
let snapshot = { text: initialText, revision: 0 }

const model = customRef((track, trigger) => ({
  /** 返回最近一次提交时创建的稳定快照。 */
  get() {
    track()
    return snapshot
  },
  /** 只在语义变化时替换快照。 */
  set(next) {
    if (Object.is(next.text, snapshot.text)) return
    snapshot = { text: next.text, revision: snapshot.revision + 1 }
    trigger()
  },
}))
~~~~
:::

稳定身份不是把对象原地改到永远不换。下游依赖浅比较时，有效提交应创建新快照；无关父更新和相同语义写入则继续返回旧快照。这个边界同时避免虚假子更新，也让一次真实提交拥有清楚的新身份。

## 七、相等性、转换和清理由工厂负责

普通 ref 会规范化输入并在值变化时通知；CustomRefImpl 的 setter 只调用工厂返回的 set。若每次都 trigger，相同值也会重新通知；若把对象原样保存，它也不会自动变成深层 reactive。防抖实现还创建了 Vue 不会自动知道的定时器，因此重排、取消和所有者卸载都要显式清理。

~~~~ts
import { onUnmounted } from 'vue'

/** 取消尚未提交的定时任务。 */
function cancelPendingCommit(): void {
  if (timer === undefined) return
  clearTimeout(timer)
  timer = undefined
}

onUnmounted(cancelPendingCommit)
~~~~

:::tip
如果 CustomRef 被封装为可复用组合式函数，可以返回 cancel/dispose 命令，并在拥有它的组件或 effect scope 中登记清理。清理函数应保持幂等：没有待处理定时器时直接返回。
:::

## 八、先判断是否真的需要 CustomRef

| 需求 | 首选工具 | 理由 |
| --- | --- | --- |
| 同步保存一个值 | ref | 内置追踪、比较、对象转换与触发语义已经足够 |
| 从现有状态派生只读结果 | computed | 缓存派生值而不重新定义写入协议 |
| 状态变化后发请求或执行副作用 | watch / watchEffect | 副作用与源状态保持分离 |
| 延迟、门控或外部协议决定 value 何时可见 | customRef | 需要接管 get、set、track 或 trigger 时机 |
| 大型对象只在根引用替换时更新 | shallowRef | 无需手写完整 Ref 协议 |

:::warning
不要只为了“高级”而使用 customRef。若需求只是防抖网络请求，保留普通 ref 作为输入源并在 watch 中取消旧请求通常更清楚；只有下游读取到的 Ref 值本身也必须延迟提交时，防抖 CustomRef 才匹配问题。
:::

## 九、易错使用提示

:::pitfalls
### get 返回值却没有调用 track

**触发条件：** get 返回值却没有调用 track

**原因：** 把 customRef 误认为仍会像普通 ref 一样自动收集模板与 watcher。

**后果：** 首次读取能得到值，但后续 trigger 找不到应该重新运行的响应式消费方。

**错误示例：**

~~~~ts
const model = customRef((_track, trigger) => ({
  /** 错误地跳过依赖收集。 */
  get() {
    return value
  },
  /** 保存值并尝试通知。 */
  set(next) {
    value = next
    trigger()
  },
}))
~~~~

**正确写法：**

~~~~ts
const model = customRef((track, trigger) => ({
  /** 在响应式读取发生时收集依赖。 */
  get() {
    track()
    return value
  },
  /** 保存值并通知已收集的依赖。 */
  set(next) {
    value = next
    trigger()
  },
}))
~~~~

**验证方式：** 对照正确写法验证结果。

### set 提交新值却没有调用 trigger

**触发条件：** set 提交新值却没有调用 trigger

**原因：** 闭包变量已经改变，于是误以为模板也会自行重新读取。

**后果：** 直接读取能看到新值，但已经订阅的组件、computed 与 watcher 仍停留在旧结果。

**错误示例：**

~~~~ts
const model = customRef((track) => ({
  /** 收集读取依赖。 */
  get() {
    track()
    return value
  },
  /** 只保存闭包变量。 */
  set(next) {
    value = next
  },
}))
~~~~

**正确写法：**

~~~~ts
const model = customRef((track, trigger) => ({
  /** 收集读取依赖。 */
  get() {
    track()
    return value
  },
  /** 保存后通知订阅者重新读取。 */
  set(next) {
    value = next
    trigger()
  },
}))
~~~~

**验证方式：** 对照正确写法验证结果。

### 先 trigger，稍后才写入提交值

**触发条件：** 先 trigger，稍后才写入提交值

**原因：** 把通知当成可提前发送的“即将更新”事件。

**后果：** 订阅者被唤醒时仍读取旧值，真正写入后又没有第二次通知。

**错误示例：**

~~~~ts
/** 错误地提前通知订阅者。 */
function commitLater(next: string): void {
  trigger()
  setTimeout(() => {
    value = next
  }, 300)
}
~~~~

**正确写法：**

~~~~ts
/** 到期后先提交，再通知订阅者。 */
function commitLater(next: string): void {
  setTimeout(() => {
    value = next
    trigger()
  }, 300)
}
~~~~

**验证方式：** 对照正确写法验证结果。

### getter 每次返回一个新对象

**触发条件：** getter 每次返回一个新对象

**原因：** 对象内容相同，却没有保留两次有效提交之间的引用身份。

**后果：** 父组件的无关重渲染也会给子组件传入新 prop，造成没有 setter 和 trigger 的子更新。

**错误示例：**

~~~~ts
/** 每次读取都创建新快照。 */
get() {
  track()
  return { text: committedText }
}
~~~~

**正确写法：**

~~~~ts
let snapshot = { text: committedText }

/** 返回最近一次提交生成的缓存快照。 */
get() {
  track()
  return snapshot
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 连续输入时保留所有定时器

**触发条件：** 连续输入时保留所有定时器

**原因：** 每次 set 都启动新任务，却没有取消上一轮计划。

**后果：** 旧草稿按各自到期时间依次提交，失去防抖合并语义并造成多次 trigger。

**错误示例：**

~~~~ts
/** 为每次输入都保留一只定时器。 */
set(next) {
  setTimeout(() => {
    value = next
    trigger()
  }, delay)
}
~~~~

**正确写法：**

~~~~ts
/** 只保留最新输入对应的提交任务。 */
set(next) {
  clearTimeout(timer)
  timer = setTimeout(() => {
    value = next
    trigger()
  }, delay)
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 相同语义值也无条件 trigger

**触发条件：** 相同语义值也无条件 trigger

**原因：** 假设 CustomRefImpl 会像普通 RefImpl 一样替工厂执行相等性比较。

**后果：** 没有可见变化也会通知订阅者，昂贵 computed、watcher 或组件可能重复工作。

**错误示例：**

~~~~ts
/** 无条件保存并通知。 */
set(next) {
  value = next
  trigger()
}
~~~~

**正确写法：**

~~~~ts
/** 只为新的语义值发送通知。 */
set(next) {
  if (Object.is(next, value)) return
  value = next
  trigger()
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 所有者卸载后仍保留待提交任务

**触发条件：** 所有者卸载后仍保留待提交任务

**原因：** 只在下一次 set 时清除旧定时器，没有处理组件提前离开。

**后果：** 卸载后回调仍执行并保留闭包资源，甚至继续调用 trigger 或外部副作用。

**错误示例：**

~~~~ts
const title = useDebouncedRef('初始标题', 300)
~~~~

**正确写法：**

~~~~ts
const { value: title, cancel } = useDebouncedRef('初始标题', 300)

onUnmounted(cancel)
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 十、从 Vue 3.5.40 源码推导边界

:::steps
### 工厂明确返回 get 与 set

ref.ts 的 CustomRefFactory 接收 track 与 trigger，并要求返回 get 和 set；CustomRef 的行为边界从创建时就被固定为这两个 value 访问器。

### 每个 CustomRefImpl 持有自己的 Dep

构造器为当前实例创建 Dep，因此 track 与 trigger 操作的是这一个 Ref 的订阅关系；业务代码不应直接读取 dep。

### Dep 方法绑定后交给工厂

实现把 dep.track.bind(dep) 与 dep.trigger.bind(dep) 传给工厂，既保留 Dep 的 this，也把调用时机完全交给返回的访问器闭包。

### value getter 完全委托给工厂 getter

CustomRefImpl 的 get value 调用 &#95;get，并把结果存入内部 &#95;value 缓存；是否 track、返回旧对象还是新对象，仍由 &#95;get 决定。

### value setter 不做相等性判断

set value 直接调用 &#95;set，没有 RefImpl 的 hasChanged 分支。相同值去重、规范化、延迟提交和 trigger 次数都属于工厂协议。

### 官方测试把 trigger 保存在 setter 之外

ref.spec.ts 的 customRef 用例先 set 但不 trigger，副作用保持旧结果；显式调用保存的 trigger 后才重跑并读取新值，直接证明写入与通知可以分离。

### 普通 RefImpl 是有意的对照

同一文件中的 RefImpl 在 get 内固定 dep.track，并在 set 内完成原始值处理、hasChanged 比较与 dep.trigger；CustomRefImpl 缺少这些步骤正是可定制能力，而不是遗漏。
:::

:::warning
CustomRefImpl、&#95;get、&#95;set、&#95;value 与 Dep 是 Vue 3.5.40 的实现证据，不是应用可读取的公共接口。业务测试应观察响应式消费次数、提交值、对象身份和清理结果。
:::

## 十一、动手验证：把写入、提交和通知分开

:::demo{id="vue.core.learn.advanced.custom-ref-triggering.custom-ref-trigger-control-lab-demo" playground="true"}
连续输入只提交最后一份稳定快照；比较 track/trigger 消费轮次、无关父更新、子预览身份与定时器取消结果
:::

## 十二、练习与回顾

:::exercise
### 设计搜索条件提交边界

**要求：**

~~~~text
搜索面板把 { keyword, category } 作为一个 CustomRef 快照传给结果子组件。写出草稿、提交快照、相等性、定时器重排、trigger 与卸载清理的顺序，并说明无关父更新时应返回哪个对象。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
输入先更新独立草稿并清除旧定时器；到期后比较 keyword 与 category，语义相同就结束，否则创建一个新提交快照，再 trigger。get 始终 track，并在两次有效提交之间返回同一个快照对象；无关父更新也返回该对象。取消、重新安排和组件卸载都清除同一只待处理定时器。
~~~~
:::
