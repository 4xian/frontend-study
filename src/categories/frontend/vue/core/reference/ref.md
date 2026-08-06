---
id: vue.core.reference.reactivity.ref
type: reference
title: ref()
summary: 接受一个内部值，返回响应式、可更改的 ref 对象，它只有一个指向内部值的 .value 属性
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.reactivity.reactive
  - vue.core.reference.reactivity.shallow
  - vue.core.reference.reactivity.to-ref
  - vue.core.reference.reactivity.utils
tags:
  - ref
  - reactivity
  - 响应式
  - Composition API
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-28
sources:
  - title: Vue 响应式 API：核心
    url: https://vuejs.org/api/reactivity-core.html
  - title: Vue 响应式基础
    url: https://vuejs.org/guide/essentials/reactivity-fundamentals.html
  - title: Vue 深入响应式系统
    url: https://vuejs.org/guide/extras/reactivity-in-depth.html
  - title: Vue 3.5.40 ref.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts
group: reactivity
signature: "function ref<T>(value: T): Ref<UnwrapRef<T>>"
anchors:
  - ref()
  - Ref
  - .value
  - 深层响应性
  - 模板解包规则
  - 响应式原理
  - 易错使用提示
---

# ref()

## 概述

ref() 接受一个内部值，返回一个响应式、可更改的 ref 对象。它只有一个属性 `.value`，指向该内部值。对 `.value` 的读取会被追踪（track），对 `.value` 的写入会触发相关副作用（trigger）——这就是 Vue 响应式的最小单元。

~~~~ts
function ref<T>(value: T): Ref<UnwrapRef<T>>

interface Ref<T> {
  value: T
}
~~~~

## 基础用法

通过 `.value` 读取和修改值。在 `<script setup>` 中声明的顶层 ref，在模板中使用时会自动解包，不需要写 `.value`。

~~~~ts
import { ref } from 'vue'

const count = ref(0)
console.log(count.value) // 0

count.value = 1
console.log(count.value) // 1
~~~~

:::demo{id="vue.core.reference.reactivity.ref.basic-ref-counter" playground="true"}
基础计数器：模板中顶层 ref 自动解包，事件处理器中修改 .value 触发更新
:::

## 深层响应性

如果把一个对象赋值给 ref，这个对象会通过 `reactive()` 转为深层响应式对象。嵌套多深的属性修改都会被追踪；对象中嵌套的 ref 也会被自动解包。若不需要深层响应，可改用 `shallowRef()`（只追踪 `.value` 本身的替换）。

:::demo{id="vue.core.reference.reactivity.ref.deep-ref-object" playground="true"}
对象 ref：修改嵌套属性 user.value.address.city 同样触发视图更新
:::

## 模板解包规则

ref 在模板中的自动解包有明确的边界，只有"顶层属性"才解包。三条规则：1）模板渲染上下文的顶层 ref 自动解包；2）表达式中的非顶层 ref（如 `object.id`）不解包，参与运算会得到错误结果；3）例外——文本插值 `{{ }}` 的最终求值结果若是 ref，会被解包显示。

:::demo{id="vue.core.reference.reactivity.ref.ref-unwrap-demo" playground="true"}
三条解包规则的现场对照
:::

## 易错使用提示

:::pitfalls
### 在脚本中省略 `.value`

**触发条件：** 在脚本中省略 `.value`

**原因：** 模板会自动解包顶层 ref，容易把这条便利规则误带到 JavaScript / TypeScript。脚本里变量本身仍是 `Ref` 对象。

**后果：** `const` ref 被重新赋值时报错，或运算针对 ref 对象而不是内部值；响应式值没有按预期更新。

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

### 认为响应式数组和集合会自动解包其中的 ref

**触发条件：** 认为响应式数组和集合会自动解包其中的 ref

**原因：** 深层 reactive 对象属性会解包 ref，但官方明确把数组元素和 `Map` 等原生集合列为例外。

**后果：** 表达式拿到 ref 对象，数值运算、字符串拼接或比较产生错误结果。

**错误示例：**

~~~~ts
const books = reactive([ref('Vue 3 Guide')])
console.log(books[0].toUpperCase())
~~~~

**正确写法：**

~~~~ts
const books = reactive([ref('Vue 3 Guide')])
console.log(books[0].value.toUpperCase())
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为模板表达式会递归解包任意嵌套 ref

**触发条件：** 认为模板表达式会递归解包任意嵌套 ref

**原因：** 模板自动解包主要适用于渲染上下文的顶层属性；`object.id` 不是顶层属性。只有当它是文本插值最终值时另有便利解包，参与 `+ 1` 时不会先变成数字。

**后果：** `{{ object.id + 1 }}` 可能渲染为 `[object Object]1`，而不是 `2`。

**错误示例：**

~~~~vue
<script setup lang="ts">
const object = { id: ref(1) }
</script>

<template>{{ object.id + 1 }}</template>
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts">
const { id } = { id: ref(1) }
</script>

<template>{{ id + 1 }}</template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 修改传给 `ref()` 的原始对象

**触发条件：** 修改传给 `ref()` 的原始对象

**原因：** 对象值会被 `ref()` 转成深层 reactive 代理，`.value` 暴露的是该代理。之后继续写入原始对象不会经过代理拦截。

**后果：** 原始数据已改变，但依赖 `state.value.count` 的模板和 watcher 不更新，界面显示旧值。

**错误示例：**

~~~~ts
const raw = { count: 0 }
const state = ref(raw)

watchEffect(() => console.log(state.value.count))
raw.count++
~~~~

**正确写法：**

~~~~ts
const state = ref({ count: 0 })

watchEffect(() => console.log(state.value.count))
state.value.count++
~~~~

**验证方式：** 对照正确写法验证结果。
:::

~~~~ts
import { reactive, ref } from 'vue'

// reactive 对象属性中的 ref：自动解包
const count = ref(0)
const state = reactive({ count })
console.log(state.count) // 0，无需 .value
state.count = 1
console.log(count.value) // 1，两者保持同步

// reactive 数组 / 集合中的 ref：不解包
const books = reactive([ref('Vue 3 Guide')])
console.log(books[0].value) // 需要 .value

const map = reactive(new Map([['count', ref(0)]]))
console.log(map.get('count').value) // 需要 .value
~~~~

## 响应式原理

:::principle{id="vue.core.reference.reactivity.ref.ref-reactivity"}
ref 的响应式基于 getter/setter 拦截：读取 .value 时收集依赖（track），写入 .value 时触发依赖（trigger）。
:::

## 最小源码实现

ref() 在源码中就是一个带 getter/setter 的 `RefImpl` 类。核心只有三件事：持有一个 `Dep`（订阅者集合）；`get value` 时调用 `dep.track()` 把"当前正在运行的副作用"登记为订阅者；`set value` 时先用 `Object.is` 比较新旧值（`hasChanged`），值真的变了才 `dep.trigger()` 通知所有订阅者重新运行。对象值会经 `toReactive()` 转为 reactive 代理，这就是深层响应性的来源。

~~~~ts
// 精简自 vuejs/core v3.5.40 packages/reactivity/src/ref.ts
// 省略 shallow 分支与开发期调试信息，保留真实骨架
class RefImpl<T> {
  _value: T // 暴露给外界的值（对象已转为 reactive 代理）
  private _rawValue: T // 原始值，用于新旧比较
  dep: Dep = new Dep() // 本 ref 的订阅者集合
  public readonly __v_isRef = true // isRef() 靠它判断

  constructor(value: T) {
    this._rawValue = toRaw(value)
    this._value = toReactive(value) // 对象值 → reactive()，即深层响应
  }

  get value() {
    this.dep.track() // 把当前活跃副作用（组件渲染/watch 等）记为订阅者
    return this._value
  }

  set value(newValue) {
    if (hasChanged(newValue, this._rawValue)) {
      // Object.is 比较，值没变不触发
      this._rawValue = newValue
      this._value = toReactive(newValue)
      this.dep.trigger() // 通知所有订阅者重新运行
    }
  }
}

export function ref(value?: unknown) {
  if (isRef(value)) return value // 传入已是 ref：原样返回
  return new RefImpl(value)
}
~~~~

:::tip
"当前活跃副作用"由全局变量 activeSub 维护：组件渲染函数、watchEffect 等在运行前把自己设为 activeSub，期间读到的每个 ref/属性都会把它记入自己的 Dep——这就是自动依赖收集的全部秘密。
:::

## 与 reactive 对比

| 特性 | ref() | reactive() |
| --- | --- | --- |
| 适用值类型 | 任意值（原始值与对象） | 仅对象类型 |
| 访问方式 | .value（模板顶层自动解包） | 直接访问属性 |
| 整体替换 | 支持：count.value = newVal | 不支持：替换整个对象会失去响应连接 |
| 解构 | 解构后仍是同一 ref | 解构原始值属性会失去响应性 |
| 深层响应 | 对象值经 reactive() 深层转换 | 默认深层 |

:::tip
官方推荐：组合式 API 中优先使用 ref() 声明响应式状态，它对任意值类型都成立，且显式的 .value 让响应式数据的读写位置一目了然。
:::
