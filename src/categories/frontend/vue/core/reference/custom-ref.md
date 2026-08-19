---
id: vue.core.reference.reactivity.custom-ref
type: reference
title: customRef()
summary: 创建一个自定义 ref，显式控制它的依赖追踪（track）与更新触发（trigger）时机，典型用途是防抖 ref
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.reactivity.ref
  - vue.core.reference.reactivity.shallow
tags:
  - customRef
  - CustomRefFactory
  - track
  - trigger
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-28
sources:
  - title: Vue 响应式 API：进阶
    url: https://vuejs.org/api/reactivity-advanced.html
  - title: Vue 3.5.40 ref.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts
group: reactivity
signature: "function customRef<T>(factory: CustomRefFactory<T>): Ref<T>"
anchors:
  - customRef()
  - CustomRefFactory
  - 防抖 ref
  - track()
  - trigger()
  - 易错使用提示
---

# customRef()

## 一、概述

customRef() 把 ref 内部的两个开关交到你手上：`track`（收集依赖）与 `trigger`（触发更新）。它接收一个工厂函数，工厂函数以这两个函数为参数，返回带 `get` 和 `set` 方法的对象——你在 get 里决定何时 track、在 set 里决定何时（甚至是否延迟）trigger。

~~~~ts
function customRef<T>(factory: CustomRefFactory<T>): Ref<T>

type CustomRefFactory<T> = (
  track: () => void,
  trigger: () => void
) => {
  get: () => T
  set: (value: T) => void
}
~~~~

## 二、典型用途：防抖 ref

官方示例：一个只在最后一次 set 之后延迟一段时间才向模板同步的防抖 ref。关键在于 set 里不立即调用 `trigger()`，而是放进 `setTimeout`——期间的连续输入会不断重置定时器，只有停止输入后才真正触发一次更新。

~~~~ts
import { customRef } from 'vue'

export function useDebouncedRef(value, delay = 200) {
  let timeout
  return customRef((track, trigger) => {
    return {
      get() {
        track() // 读取时正常收集依赖
        return value
      },
      set(newValue) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          value = newValue
          trigger() // 停止输入 delay 毫秒后才通知依赖更新
        }, delay)
      },
    }
  })
}
~~~~

:::demo{id="vue.core.reference.reactivity.custom-ref.custom-ref-debounce" playground="true"}
防抖 ref 实测：输入框连续输入时镜像文本不动，停顿 400ms 后一次性同步
:::

## 三、易错使用提示

:::pitfalls
### 把 `track()` / `trigger()` 当成可省略的样板代码

**触发条件：** 把 `track()` / `trigger()` 当成可省略的样板代码

**原因：** 误以为 `customRef()` 仍会像普通 `ref()` 一样自动收集读取方、自动通知写入。实际上工厂接管了这两个时机；源码中的 `CustomRefImpl` 只把 `Dep` 的 `track` 和 `trigger` 交给工厂，不会代替调用。

**后果：** `get()` 不调用 `track()` 时，模板、computed、watch 不会订阅；`set()` 提交新值后不调用 `trigger()` 时，已经订阅的使用方仍显示旧结果。

**错误示例：**

~~~~ts
const count = customRef(() => ({
  get: () => value,
  set: (next) => (value = next),
}))
~~~~

**正确写法：**

~~~~ts
const count = customRef((track, trigger) => ({
  get() {
    track()
    return value
  },
  set(next) {
    value = next
    trigger()
  },
}))
~~~~

**验证方式：** 对照正确写法验证结果。

### getter 每次返回一个新对象也不会影响子组件

**触发条件：** getter 每次返回一个新对象也不会影响子组件

**原因：** 只关注对象内容相同，忽略了 prop 比较使用对象身份；父组件因无关状态重渲染时，getter 会再次求值并产生不同引用，即使 custom ref 的 setter 没有触发。

**后果：** 子组件把 prop 判定为变化并更新，而父组件中依赖该 custom ref 的响应式副作用没有对应触发，父子两侧出现难以解释的不一致更新。

**错误示例：**

~~~~ts
const model = customRef((track) => ({
  get() {
    track()
    return { value }
  },
  set(next) {
    value = next.value
  },
}))
~~~~

**正确写法：**

~~~~ts
const model = customRef((track, trigger) => ({
  get() {
    track()
    return value
  },
  set(next) {
    value = next
    trigger()
  },
}))
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 四、最小源码实现

CustomRefImpl 与 RefImpl 一样持有一个 Dep，区别是它把 `dep.track` 与 `dep.trigger` 用 bind 绑定后直接交给工厂函数，自己的 value 存取器完全委托给工厂返回的 get/set。也就是说：普通 ref 的"读取必 track、写入变化必 trigger"在这里换成了"你说了算"。

~~~~ts
// 精简自 vuejs/core v3.5.40 packages/reactivity/src/ref.ts
class CustomRefImpl<T> {
  public dep: Dep
  public readonly __v_isRef = true

  private readonly _get: () => T
  private readonly _set: (value: T) => void

  constructor(factory: CustomRefFactory<T>) {
    const dep = (this.dep = new Dep())
    // 把 dep 的 track/trigger 交给工厂：何时调用由使用者决定
    const { get, set } = factory(dep.track.bind(dep), dep.trigger.bind(dep))
    this._get = get
    this._set = set
  }

  get value(): T {
    return this._get() // 完全委托：是否 track 看工厂里的 get
  }

  set value(newVal: T) {
    this._set(newVal) // 完全委托：是否/何时 trigger 看工厂里的 set
  }
}

export function customRef<T>(factory: CustomRefFactory<T>): Ref<T> {
  return new CustomRefImpl(factory)
}
~~~~

:::tip
对比记忆：RefImpl 内置"get 必 track、set 比较后必 trigger"；ObjectRefImpl（toRef）没有 Dep、全部委托给源代理；CustomRefImpl 有 Dep 但把开关外包给工厂函数。三者覆盖了 ref 家族的三种控制粒度。
:::
