---
id: vue.core.reference.composition.template-refs
type: reference
title: 模板引用 useTemplateRef()
summary: 通过模板 ref 获取 DOM 元素或子组件公开实例，并正确处理挂载、卸载、列表和 SSR 边界
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.reactivity.ref
  - vue.core.reference.composition.lifecycle
  - vue.core.reference.components.props
  - vue.core.reference.components.emits
tags:
  - useTemplateRef
  - 模板引用
  - DOM
  - defineExpose
  - v-for
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-28
sources:
  - title: Vue 组合式 API：useTemplateRef
    url: https://cn.vuejs.org/api/composition-api-helpers.html#usetemplateref
  - title: Vue 模板引用指南
    url: https://cn.vuejs.org/guide/essentials/template-refs.html
  - title: Vue ref 特殊 attribute
    url: https://cn.vuejs.org/api/built-in-special-attributes.html#ref
  - title: Vue SSR 指南
    url: https://cn.vuejs.org/guide/scaling-up/ssr.html#component-lifecycle-hooks
  - title: Vue 3.5.40 useTemplateRef.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/useTemplateRef.ts
  - title: Vue 3.5.40 rendererTemplateRef.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/rendererTemplateRef.ts
group: composition
signature: "function useTemplateRef<T>(key: string): Readonly<ShallowRef<T | null>>"
anchors:
  - 概述
  - 基础用法与可用时机
  - 易错使用提示
  - v-for 中的引用
  - 函数模板引用
  - 组件引用与 defineExpose
  - 最小源码实现
  - 3.5 之前的写法
---

# 模板引用 useTemplateRef()

## 概述

声明式渲染已经覆盖大多数 DOM 操作，但聚焦输入框、测量元素、接入第三方库或调用子组件公开方法时仍需直接引用目标。模板的 `ref` 特殊 attribute 加在普通元素上得到 DOM 元素，加在组件上得到组件公开实例。Vue 3.5+ 使用 `useTemplateRef()` 按模板 ref 名称取得响应式引用。

## 基础用法与可用时机

`useTemplateRef()` 的参数必须与模板中的字符串 ref 值匹配。引用在 setup 初次执行时为 null，目标实际挂载后才会赋值；目标受 `v-if` 控制、已经卸载或异步组件尚未解析时仍可能为 null，因此每次使用都要考虑空值。服务端渲染没有浏览器 DOM，onMounted 也不会在服务端执行，DOM 操作必须留在客户端挂载阶段。

~~~~vue
<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'

const input = useTemplateRef<HTMLInputElement>('my-input')

onMounted(() => {
  input.value?.focus()
})
</script>

<template>
  <input ref="my-input" />
</template>
~~~~

:::demo{id="vue.core.reference.composition.template-refs.template-ref-demo" playground="true"}
对照 setup 与 mounted 时的引用值，并通过 DOM 引用聚焦输入框
:::

## 易错使用提示

:::pitfalls
### 在挂载前或条件卸载后直接访问模板引用

**触发条件：** 在挂载前或条件卸载后直接访问模板引用

**原因：** `useTemplateRef()` 返回的是 `Readonly<ShallowRef<T | null>>`；首次渲染前元素不存在，`v-if` 移除目标时值还会回到 null。SSR 阶段也没有浏览器 DOM。

**后果：** 调用 `focus()`、测量方法或子组件方法时抛出“不能读取 null”的运行时错误。

**错误示例：**

~~~~ts
const input = useTemplateRef<HTMLInputElement>('input')
input.value.focus()
~~~~

**正确写法：**

~~~~ts
const input = useTemplateRef<HTMLInputElement>('input')

onMounted(() => {
  input.value?.focus()
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 用同一索引对应 `v-for` 源数组和 ref 数组

**触发条件：** 用同一索引对应 `v-for` 源数组和 ref 数组

**原因：** 看到两边都是数组就假定顺序一致。官方明确不保证 ref 数组与源数组顺序相同；列表增删、移动和渲染更新会进一步放大风险。

**后果：** 点击或滚动某个业务项时，代码聚焦、测量或操作了另一个元素。

**错误示例：**

~~~~ts
function focusItem(index: number) {
  itemRefs.value[index].focus()
}
~~~~

**正确写法：**

~~~~ts
const itemElements = new Map<string, HTMLButtonElement>()

function setItemRef(id: string, element: Element | null) {
  if (element instanceof HTMLButtonElement) itemElements.set(id, element)
  else itemElements.delete(id)
}

function focusItem(id: string) {
  itemElements.get(id)?.focus()
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 `await` 后才调用 `defineExpose()`

**触发条件：** 在 `await` 后才调用 `defineExpose()`

**原因：** 误以为宏可以在异步数据准备后动态扩展公开实例。官方要求 `defineExpose()` 位于任何 await 之前；`<script setup>` 组件本身还是默认私有的。

**后果：** 父组件通过模板 ref 拿到的公开实例中没有 await 后暴露的属性或方法，调用时得到 undefined。

**错误示例：**

~~~~ts
await loadInitialState()
defineExpose({ reset })
~~~~

**正确写法：**

~~~~ts
defineExpose({ reset })
await loadInitialState()
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 `<script setup>` 子组件当成默认公开全部内部绑定

**触发条件：** 把 `<script setup>` 子组件当成默认公开全部内部绑定

**原因：** 使用 `<script setup>` 的组件默认是私有的。父组件的模板引用只能看到子组件通过 `defineExpose()` 明确公开的最小接口。

**后果：** 父组件拿到了子组件实例，但读取内部状态或调用方法时得到 undefined。

**错误示例：**

~~~~vue
<!-- Child.vue -->
<script setup>
function reset() {}
</script>

<!-- Parent.vue -->
<script setup>
const child = useTemplateRef('child')
onMounted(() => child.value.reset())
</script>
~~~~

**正确写法：**

~~~~vue
<!-- Child.vue -->
<script setup>
function reset() {}
defineExpose({ reset })
</script>

<!-- Parent.vue -->
<script setup>
const child = useTemplateRef('child')
onMounted(() => child.value?.reset())
</script>
~~~~

**验证方式：** 对照正确写法验证结果。

### 函数模板引用只记录元素，不处理卸载时的 `null`

**触发条件：** 函数模板引用只记录元素，不处理卸载时的 `null`

**原因：** 函数 ref 会在目标挂载或更新时收到元素，目标卸载时还会再收到 null。回调需要对这两条路径做对称维护。

**后果：** 列表项移除后，Map 或数组中仍保留已脱离 DOM 的元素，后续聚焦、测量或遍历会操作过期引用。

**错误示例：**

~~~~vue
<li :ref="(element) => elements.set(item.id, element)">
  {{ item.label }}
</li>
~~~~

**正确写法：**

~~~~vue
<li
  :ref="(element) => {
    if (element) elements.set(item.id, element)
    else elements.delete(item.id)
  }"
>
  {{ item.label }}
</li>
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## v-for 中的引用

Vue 3.5+ 中，字符串 ref 位于 `v-for` 内时，useTemplateRef 的值是元素或组件实例数组。数组在目标挂载后填充，但官方不保证其顺序与源数组一致，不能靠同一索引建立业务对应关系；需要对应关系时使用稳定 key 或函数引用自行记录。列表项卸载时，渲染器从数组移除对应引用，而不是把整个引用统一写成 null。

~~~~vue
<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'

const itemRefs = useTemplateRef<HTMLLIElement[]>('items')

onMounted(() => console.log(itemRefs.value))
</script>

<template>
  <ul>
    <li v-for="item in list" :key="item.id" ref="items">{{ item.label }}</li>
  </ul>
</template>
~~~~

## 函数模板引用

`ref` 也可通过动态绑定接收函数。该函数在组件更新时收到元素或组件实例，目标卸载时再次收到 null，适合按业务 key 保存列表引用或完全控制存储位置。回调可能重复执行，不应在其中创建无法配对清理的副作用。

~~~~vue
<script setup lang="ts">
const elements = new Map<string, HTMLElement>()

/** 按业务 ID 更新元素引用，并在卸载时删除。 */
function setItemRef(id: string, element: Element | null) {
  if (element instanceof HTMLElement) elements.set(id, element)
  else elements.delete(id)
}
</script>

<template>
  <div v-for="item in list" :key="item.id" :ref="(el) => setItemRef(item.id, el)">
    {{ item.label }}
  </div>
</template>
~~~~

## 组件引用与 defineExpose

组件 ref 得到的是公开实例。使用 `<script setup>` 的子组件默认不暴露其内部绑定，必须通过 `defineExpose()` 明确公开；defineExpose 必须在任何 await 之前调用，否则 await 之后才暴露的成员无法被父组件访问。公开对象中的 ref 会像普通组件实例属性一样自动解包，例如暴露 `ref(2)` 后父组件读到的是数字 2。优先使用 props 和 emit，只有它们不适合命令式操作时才使用组件引用。

~~~~vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(2)

/** 向父组件公开一个受控命令。 */
function reset() {
  count.value = 0
}

defineExpose({ count, reset }) // 必须位于任何 await 之前
</script>
~~~~

## 最小源码实现

useTemplateRef 创建一个 `shallowRef(null)`，再在当前实例的 refs 对象上定义同名 getter/setter。渲染器给普通字符串 ref 赋元素或组件实例时，值经 setter 流入 shallowRef；普通目标卸载或动态 ref 名称变化时写入 null。`v-for` 的 ref&#95;for 分支则维护数组，卸载单项时从数组移除。函数 ref 不写入实例 refs，而是由渲染器直接调用，并在卸载时传入 null。

~~~~ts
// 精简自 vuejs/core v3.5.40 useTemplateRef.ts、rendererTemplateRef.ts
export function useTemplateRef<T>(key: string) {
  const instance = getCurrentInstance()
  const result = shallowRef<T | null>(null)

  if (instance) {
    const refs = instance.refs === EMPTY_OBJ ? (instance.refs = {}) : instance.refs
    Object.defineProperty(refs, key, {
      enumerable: true,
      get: () => result.value,
      set: (value) => (result.value = value),
    })
  }
  return __DEV__ ? readonly(result) : result
}

// 渲染器的卸载分支：
// 普通字符串 ref -> refs[key] = null
// v-for ref 数组    -> remove(existingArray, refValue)
// 函数 ref          -> ref(null)
~~~~

## 3.5 之前的写法

Vue 3.5 之前尚无 useTemplateRef，需要声明一个与模板 ref attribute 同名的 ref，并在非 `<script setup>` 的 setup 中返回它。useTemplateRef 用显式 key 取代变量命名约定，旧写法仍保持兼容。

:::tip
TypeScript 下，Vue IDE 支持和 vue-tsc 可以根据静态模板 ref 自动推断元素或组件类型；动态或复杂引用无法可靠推断时，应显式传入 useTemplateRef 的泛型。
:::
