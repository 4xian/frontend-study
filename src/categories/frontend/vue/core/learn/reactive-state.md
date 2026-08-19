---
id: vue.core.learn.basics.reactive-state
type: lesson
title: 响应式状态
summary: 使用 ref 声明会驱动界面更新的状态，并理解脚本、模板与 DOM 更新时机的边界
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.reactivity.ref
  - vue.core.reference.reactivity.reactive
  - vue.core.reference.application.next-tick
tags:
  - ref
  - reactive
  - 响应式状态
  - Composition API
  - nextTick
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-29
sources:
  - title: Vue 响应式基础
    url: https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html
  - title: Vue 响应式 API：核心
    url: https://cn.vuejs.org/api/reactivity-core.html#ref
  - title: Vue 通用 API：nextTick
    url: https://cn.vuejs.org/api/general.html#nexttick
stage: basics
level: beginner
estimatedMinutes: 25
prerequisites:
  - vue.core.learn.basics.template-syntax
objectives:
  - 用 ref 声明和修改组件状态
  - 区分脚本中的 .value 与模板中的自动解包
  - 在需要读取更新后 DOM 时正确等待 nextTick()
recap:
  - "`ref()` 是 Composition API 声明响应式状态的首选方式。"
  - 脚本访问 ref 需要 `.value`，模板会自动解包顶层 ref。
  - 状态立即改变，DOM 在下一次更新周期完成渲染。
---

# 响应式状态

## 一、用 ref 声明状态

在 Composition API 中，`ref()` 是声明响应式状态的首选方式。它把传入值包装为带 `.value` 的 ref 对象；脚本读取或修改 `.value` 时，Vue 可以追踪依赖并通知使用该状态的界面更新。

~~~~vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

/** 增加当前计数。 */
function increment(): void {
  count.value++
}
</script>

<template>
  <button @click="increment">点击 {{ count }} 次</button>
</template>
~~~~

## 二、脚本与模板的访问方式

脚本中的 `count` 是 ref 对象，所以要通过 `count.value` 访问内部值。模板会自动解包渲染上下文中的顶层 ref，因此写 `{{ count }}` 和 `count++` 即可。先记住这条位置差异，不需要提前学习响应式内部实现。

:::demo{id="vue.core.reference.reactivity.ref.basic-ref-counter" playground="true"}
修改 ref 后，模板中的计数会自动重新渲染
:::

## 三、对象状态与 reactive

`ref()` 可以保存基本类型或对象；对象会被转换为深层响应式代理。`reactive()` 则直接返回对象代理，但它不能接收基本类型，也要求持续使用同一个代理引用。新手主线优先使用 `ref()`，需要集中操作多个相关字段时再选择 `reactive()`。

:::compare{before="独立状态" after="对象状态"}
### 独立状态

~~~~text
const count = ref(0)
count.value++
~~~~

### 对象状态

~~~~text
const form = reactive({ name: '', valid: false })
form.name = 'Ada'
~~~~
:::

## 四、DOM 更新在下一轮完成

状态修改是同步的，但 Vue 会缓冲 DOM 更新，避免同一轮修改触发多次渲染。只有确实需要读取更新后的元素尺寸、文本或焦点状态时才调用 `await nextTick()`；普通业务逻辑继续直接读取状态。

~~~~ts
import { nextTick, ref } from 'vue'

const count = ref(0)

/** 更新计数并等待对应 DOM 完成渲染。 */
async function incrementAndMeasure(): Promise<void> {
  count.value++
  await nextTick()
  // 此处才能读取更新后的 DOM。
}
~~~~

## 五、练习顺序

:::steps
### 声明

用 ref(0) 创建 count，并在模板中显示它。

### 修改

编写 increment()，在脚本中通过 count.value 更新。

### 验证

连续点击按钮，确认状态与界面保持一致。
:::

## 六、易错使用提示

:::pitfalls
### 在脚本中省略 .value

**触发条件：** 在脚本中省略 .value

**原因：** 模板会自动解包顶层 ref，但 JavaScript 和 TypeScript 中的变量仍然是 Ref 对象。

**后果：** 运算会落在对象上，或尝试重新赋值 const 变量，状态不会按预期更新。

**错误示例：**

~~~~ts
const count = ref(0)
count++
~~~~

**正确写法：**

~~~~ts
const count = ref(0)
count.value++
~~~~

**验证方式：** 对照正确写法验证结果。

### 把基本类型传给 reactive()

**触发条件：** 把基本类型传给 reactive()

**原因：** `reactive()` 只适用于对象、数组、Map 和 Set，不能代理 number 等基本类型。

**后果：** 开发环境会给出警告，返回值也不会成为可追踪的对象状态。

**错误示例：**

~~~~ts
const count = reactive(0)
~~~~

**正确写法：**

~~~~ts
const count = ref(0)
~~~~

**验证方式：** 对照正确写法验证结果。

### 替换整个 reactive 对象

**触发条件：** 替换整个 reactive 对象

**原因：** 依赖追踪建立在原代理的属性访问上，重新赋值会让旧代理的连接丢失。

**后果：** 已有模板、计算属性或侦听器继续依赖旧代理，新对象的变化无法驱动它们。

**错误示例：**

~~~~ts
let form = reactive({ name: '' })
form = reactive({ name: 'Ada' })
~~~~

**正确写法：**

~~~~ts
const form = reactive({ name: '' })
Object.assign(form, { name: 'Ada' })
~~~~

**验证方式：** 对照正确写法验证结果。

### 直接解构 reactive 的基本类型属性

**触发条件：** 直接解构 reactive 的基本类型属性

**原因：** 解构会在当下读取一次代理属性，得到与源对象断开连接的普通值。

**后果：** 修改局部变量不会更新源状态，源状态变化也不会同步到该变量。

**错误示例：**

~~~~ts
const state = reactive({ count: 0 })
let { count } = state
count++
~~~~

**正确写法：**

~~~~ts
const state = reactive({ count: 0 })
const { count } = toRefs(state)
count.value++
~~~~

**验证方式：** 对照正确写法验证结果。

### 修改状态后立刻读取 DOM

**触发条件：** 修改状态后立刻读取 DOM

**原因：** Vue 会把同一轮的 DOM 变更缓冲到下一次更新周期，而不是同步写入页面。

**后果：** 立即读取到的文本、尺寸或焦点状态仍然属于更新前的 DOM。

**错误示例：**

~~~~ts
count.value++
console.log(counterEl.value?.textContent)
~~~~

**正确写法：**

~~~~ts
count.value++
await nextTick()
console.log(counterEl.value?.textContent)
~~~~

**验证方式：** 对照正确写法验证结果。
:::

:::exercise
### 给计数器增加步长与重置

**要求：**

~~~~text
新增一个 step ref，让“增加”按钮每次累加 step，并提供重置按钮。先在脚本中修改 .value，再确认模板里不需要 .value。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
const count = ref(0)
const step = ref(2)

/** 按当前步长增加计数。 */
function increment(): void {
  count.value += step.value
}

/** 把计数恢复为初始值。 */
function reset(): void {
  count.value = 0
}
~~~~
:::
