---
id: vue.core.reference.advanced.composables
type: reference
title: 组合式函数 Composables
summary: 用组合式 API 封装可复用的有状态逻辑，并正确处理响应式输入、返回值和副作用清理
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.composition.lifecycle
  - vue.core.reference.reactivity.to-ref
  - vue.core.reference.reactivity.effect-scope
  - vue.core.reference.advanced.custom-directives
tags:
  - composable
  - 组合式函数
  - toValue
  - 副作用清理
  - SSR
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-29
sources:
  - title: Vue 组合式函数指南
    url: https://cn.vuejs.org/guide/reusability/composables.html
  - title: Vue 侦听器：停止侦听器
    url: https://cn.vuejs.org/guide/essentials/watchers.html#stopping-a-watcher
  - title: Vue SSR：跨请求状态污染
    url: https://cn.vuejs.org/guide/scaling-up/ssr.html#cross-request-state-pollution
  - title: Vue 响应式工具：toValue()
    url: https://cn.vuejs.org/api/reactivity-utilities.html#tovalue
  - title: Vue 3.5.40 ref.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts
group: advanced
signature: "function useFeature(...args: unknown[]): unknown // 命名约定，无固定签名"
anchors:
  - 概述
  - 命名与基本结构
  - 返回值约定
  - 响应式输入
  - 易错使用提示
  - 与其他复用方式的分工
  - 运行机制
---

# 组合式函数 Composables

## 一、概述

组合式函数（composable）不是一项独立的运行时 API，而是用组合式 API 封装和复用有状态逻辑的约定。它可以在普通函数中组合 ref、computed、watch 和生命周期钩子，让调用方清楚看到状态来源，也避免 mixin 容易出现的属性来源不明与命名冲突。

## 二、命名与基本结构

组合式函数通常采用 use 前缀和驼峰命名，例如 useMouse。依赖组件生命周期或实例上下文的组合式函数，应在 setup 或 `<script setup>` 的同步执行阶段调用。每次调用通常创建一份独立状态；若需要显式共享状态，应单独设计共享存储及其所有权边界。

~~~~ts
import { onMounted, onUnmounted, ref } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  /** 记录页面坐标。 */
  function update(event: MouseEvent) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}

const { x, y } = useMouse()
~~~~

:::demo{id="vue.core.reference.advanced.composables.composable-demo" playground="true"}
useMouse 跟随组件生命周期工作，两次 useCounter 调用各自持有独立状态
:::

## 三、返回值约定

官方建议组合式函数返回一个包含多个 ref 的普通对象。调用方解构该对象后，拿到的仍是 ref，和函数内部状态保持响应式连接。若直接返回 reactive 代理并解构，原始类型属性只会复制出当前值，之后不再跟随代理变化。

| 约定 | 推荐形式 | 作用 |
| --- | --- | --- |
| 命名 | use 前缀 + 驼峰 | 表明函数可能包含响应式状态和生命周期逻辑 |
| 返回值 | 装有 ref 的普通对象 | 解构后仍保留响应式连接 |
| 输入值 | MaybeRefOrGetter + toValue() | 统一读取普通值、ref 或 getter 的当前值 |

## 四、响应式输入

`toValue()` 自 Vue 3.3 起可以把普通值、ref 或 getter 规范化为当前值，但它本身不会创建侦听器。若输入变化后需要重新执行逻辑，应在 watchEffect 的同步执行段中调用 toValue，或用 watch 显式侦听；普通值没有后续响应式变化可追踪。

~~~~ts
import { ref, toValue, watchEffect } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

export function useFetch(url: MaybeRefOrGetter<string>) {
  const data = ref<unknown>(null)

  watchEffect(() => {
    fetch(toValue(url))
      .then((response) => response.json())
      .then((value) => {
        data.value = value
      })
  })

  return { data }
}
~~~~

## 五、易错使用提示

:::pitfalls
### 在失去组件实例上下文后调用依赖生命周期的 composable

**触发条件：** 在失去组件实例上下文后调用依赖生命周期的 composable

**原因：** onMounted、onUnmounted 和组件作用域 watcher 依赖调用当下的活动组件实例。普通异步回调、定时器或组件外调用不会自动恢复该上下文；`<script setup>` 顶层 await 是编译器支持的例外。

**后果：** 开发环境出现没有活动组件实例的警告，生命周期钩子不会注册，异步创建的 watcher 也可能不随组件卸载自动停止。

**错误示例：**

~~~~ts
setTimeout(() => {
  useWindowSize()
}, 0)
~~~~

**正确写法：**

~~~~ts
const size = useWindowSize()

onMounted(() => {
  console.log(size.width.value)
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 返回 reactive 对象后直接解构

**触发条件：** 返回 reactive 对象后直接解构

**原因：** reactive 的响应性来自对代理属性的访问。普通解构把原始类型属性的当前值复制到局部变量，不会继续访问代理。

**后果：** 解构出的 x 和 y 停留在初始值，内部代理变化也不会触发依赖它们的更新。

**错误示例：**

~~~~ts
function usePosition() {
  return reactive({ x: 0, y: 0 })
}

const { x, y } = usePosition()
~~~~

**正确写法：**

~~~~ts
function usePosition() {
  const x = ref(0)
  const y = ref(0)
  return { x, y }
}

const { x, y } = usePosition()
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 effect 外调用 toValue 后期待输入持续响应

**触发条件：** 在 effect 外调用 toValue 后期待输入持续响应

**原因：** toValue 只规范化并返回输入的当前值，不会独立建立 watcher。ref 或 getter 必须在响应式 effect 中读取，变化才会触发后续执行。

**后果：** 输入 URL 改变后请求不重跑，逻辑继续使用首次读取的值。

**错误示例：**

~~~~ts
function useFetch(url: MaybeRefOrGetter<string>) {
  const normalizedUrl = toValue(url)
  fetch(normalizedUrl)
}
~~~~

**正确写法：**

~~~~ts
function useFetch(url: MaybeRefOrGetter<string>) {
  watchEffect(() => {
    fetch(toValue(url))
  })
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 创建浏览器副作用却不登记清理

**触发条件：** 创建浏览器副作用却不登记清理

**原因：** Vue 会停止组件作用域中的响应式 effect，但不会自动移除应用创建的 DOM listener、计时器或第三方订阅。SSR 的 setup 阶段也不能直接访问 window。

**后果：** 组件重复挂载后 listener 累积并重复执行；服务端渲染还可能直接抛出 window is not defined。

**错误示例：**

~~~~ts
function useResize(handler: () => void) {
  window.addEventListener('resize', handler)
}
~~~~

**正确写法：**

~~~~ts
function useResize(handler: () => void) {
  onMounted(() => window.addEventListener('resize', handler))
  onUnmounted(() => window.removeEventListener('resize', handler))
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 SSR 中把模块级状态当成每个请求独享

**触发条件：** 在 SSR 中把模块级状态当成每个请求独享

**原因：** 服务端通常会跨请求复用已初始化的模块，模块顶层 ref 因而是进程内单例，而不是每个请求的新状态。

**后果：** 一个请求写入的用户数据可能被后续请求读取，造成跨请求状态污染和数据泄漏。

**错误示例：**

~~~~ts
const currentUser = ref<User | null>(null)

export function useCurrentUser() {
  return currentUser
}
~~~~

**正确写法：**

~~~~ts
export function createCurrentUserState() {
  return ref<User | null>(null)
}

const app = createSSRApp(App)
app.provide(currentUserKey, createCurrentUserState())
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 六、与其他复用方式的分工

| 方式 | 复用对象 | 典型用途 |
| --- | --- | --- |
| 组件 | 视图、交互与样式 | 按钮、表单、列表 |
| 组合式函数 | 不绑定视图的有状态逻辑 | useMouse、useFetch、useStorage |
| 自定义指令 | 必须直接操作元素的逻辑 | v-focus、v-reveal |
| 工具函数 | 无状态计算 | formatDate、debounce |

## 七、运行机制

组合式函数没有独立的运行时实现：它只是普通函数，实际行为来自内部调用的响应式 API 和生命周期 API。组件 setup 同步执行时，Vue 以当前组件作用域收集 computed 与 watcher 等响应式 effect，并在组件卸载时停止它们；事件监听、计时器和请求等外部副作用仍需显式清理。
