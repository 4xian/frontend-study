# Vue 高阶能力易错使用点调研

> 调研日期：2026-07-29
>
> 适用基线：Vue 3.5.40
>
> 对应范围：阶段 4 第 6 批 `advanced`，仅覆盖 Composables、自定义指令、
> 渲染函数与 `h()`。
>
> 资料范围：先分别通过 Tavily 检索三类常见误用线索，但三次请求均因当前
> plan usage limit 失败，未取得可引用结果；随后只使用 Vue 官方中英文文档、
> Vue 官方 docs 仓库，以及 `vuejs/core` 的 `v3.5.40` 固定标签源码和官方测试
> 逐项核实。本文不引用社区文章、搜索摘要或未合并提案。

```yaml
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-29
```

下列错误代码用于呈现错误直觉，正确代码给出最小替换路径。每点均记录原因、
可观察后果、版本边界和直接一手来源；没有行为后果的个人风格偏好不计入易错点。

## Composables

### 1. 在失去组件实例上下文后调用依赖生命周期的 composable

- **适用版本：** Vue 3.0+；基线 Vue 3.5.40。`<script setup>` 经编译后可以在
  `await` 之后恢复活动实例，是官方明确记录的例外。
- **错误假设 / 原因：** 认为 `onMounted()`、`onUnmounted()` 和组件作用域中的 watcher
  只要最终被执行就能自动找到宿主。它们依赖调用当下的活动组件实例；普通
  `async setup()` 在首个 `await` 后、定时器回调或组件外调用都可能失去该上下文。
- **可观察后果：** 开发环境出现“没有活动组件实例”的警告，生命周期 hook 不会注册；
  watcher 也可能不再随组件卸载而自动停止。
- **错误代码：**

```ts
// 延迟后才注册宿主生命周期
setTimeout(() => {
  useWindowSize()
}, 0)
```

- **正确代码：**

```ts
// 在 setup 的同步执行阶段创建 composable
const size = useWindowSize()

onMounted(() => {
  console.log(size.width.value)
})
```

- **直接一手来源：** [Vue Composables：使用限制](https://cn.vuejs.org/guide/reusability/composables.html#usage-restrictions)、
  [Vue 3.5.40 `apiLifecycle.ts` 的实例检查](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiLifecycle.ts#L20-L63)、
  [Vue Watchers：同步创建与自动停止](https://vuejs.org/guide/essentials/watchers.html#stopping-a-watcher)

### 2. 返回一个 `reactive()` 对象，再让调用方直接解构

- **适用版本：** Vue 3.0+；基线 Vue 3.5.40。
- **错误假设 / 原因：** `reactive()` 的响应性来自代理属性访问；普通解构只把属性当前值
  复制到局部变量，不会保留对代理属性的访问。官方约定是返回包含多个 ref 的普通对象。
- **可观察后果：** 解构出的原始值不再随内部状态变化，模板或计算逻辑停留在初始值。
- **错误代码：**

```ts
// 返回代理对象
function usePosition() {
  return reactive({ x: 0, y: 0 })
}

const { x, y } = usePosition()
```

- **正确代码：**

```ts
// 返回装有 ref 的普通对象
function usePosition() {
  const x = ref(0)
  const y = ref(0)
  return { x, y }
}

const { x, y } = usePosition()
```

- **直接一手来源：** [Vue Composables：返回值约定](https://cn.vuejs.org/guide/reusability/composables.html#return-values)、
  [Vue 响应式基础：解构限制](https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html#limitations-of-reactive)

### 3. 用 `toValue()` 读取一次，就宣称值、ref、getter 都会持续响应

- **适用版本：** `toValue()` 自 Vue 3.3+ 可用；基线 Vue 3.5.40。
- **错误假设 / 原因：** `toValue()` 只负责把 getter、ref 或普通值规范化成当前值；它本身
  不创建 watcher。要追踪 ref/getter，必须显式 `watch()`，或在 `watchEffect()` 的同步
  执行段内调用 `toValue()`。普通值本身没有后续响应式更新可追踪。
- **可观察后果：** 输入 ref 或 getter 改变后副作用不重跑；请求仍使用第一次读取的 URL。
- **错误代码：**

```ts
// 只读取一次，不会建立响应式 effect
function useFetch(url: MaybeRefOrGetter<string>) {
  const normalizedUrl = toValue(url)
  fetch(normalizedUrl)
}
```

- **正确代码：**

```ts
// 在 effect 内规范化，ref/getter 的依赖会被追踪
function useFetch(url: MaybeRefOrGetter<string>) {
  watchEffect(() => {
    fetch(toValue(url))
  })
}
```

- **直接一手来源：** [Vue Composables：输入参数](https://cn.vuejs.org/guide/reusability/composables.html#input-arguments)、
  [Vue Composables：在 effect 内调用 `toValue()`](https://vuejs.org/guide/reusability/composables.html#accepting-reactive-state)、
  [Vue 3.5.40 `toValue()` 实现](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts#L233-L251)、
  [Vue 3.5.40 `toValue()` 官方测试](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/ref.spec.ts#L731-L741)

### 4. 在 composable 顶层启动浏览器副作用，却不在卸载时清理

- **适用版本：** Vue 3.0+；基线 Vue 3.5.40。SSR 应用尤其需要遵守浏览器 API
  只在客户端挂载后访问的边界。
- **错误假设 / 原因：** 认为组件销毁会自动移除 composable 创建的 DOM listener、计时器
  或第三方订阅。Vue 只自动管理自身作用域中的响应式 effect，不会替应用清理外部资源；
  SSR 执行 `setup()` 时也没有 `window`，且服务端不会调用卸载 hook。
- **可观察后果：** 客户端多次挂载后 listener 重复执行或资源泄漏；SSR 直接抛出
  `window is not defined`，服务端计时器还可能永久存活。
- **错误代码：**

```ts
// 模块在 SSR 执行时也会访问 window，卸载后 listener 仍存在
function useResize(handler: () => void) {
  window.addEventListener('resize', handler)
}
```

- **正确代码：**

```ts
// 在客户端挂载后注册，并在宿主卸载时对称清理
function useResize(handler: () => void) {
  onMounted(() => window.addEventListener('resize', handler))
  onUnmounted(() => window.removeEventListener('resize', handler))
}
```

- **直接一手来源：** [Vue Composables：副作用](https://cn.vuejs.org/guide/reusability/composables.html#side-effects)、
  [Vue SSR：组件生命周期与平台 API](https://cn.vuejs.org/guide/scaling-up/ssr.html#component-lifecycle-hooks)、
  [Vue 3.5.40 `onUnmounted` 官方测试](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiLifecycle.spec.ts#L164-L190)

### 5. 在 SSR 中把模块级 composable 状态当成每个请求独享

- **适用版本：** Vue 3.0+ SSR；基线 Vue 3.5.40。纯客户端应用中模块单例可以是有意的
  共享状态模式，此问题特指服务端跨请求复用模块的场景。
- **错误假设 / 原因：** 服务端进程通常只初始化模块一次；放在 composable 模块顶层的 ref
  因而是所有请求共享的单例，不会为每位用户重新创建。
- **可观察后果：** 一个请求写入的用户数据可能被后续请求读到，形成跨请求状态污染和数据泄漏。
- **错误代码：**

```ts
// 服务端所有请求共享同一个 ref
const currentUser = ref<User | null>(null)

// 返回模块单例
export function useCurrentUser() {
  return currentUser
}
```

- **正确代码：**

```ts
// 每个 SSR 请求创建独立状态，再由该请求的 app 提供
export function createCurrentUserState() {
  return ref<User | null>(null)
}

const app = createSSRApp(App)
app.provide(currentUserKey, createCurrentUserState())
```

- **直接一手来源：** [Vue SSR：跨请求状态污染](https://cn.vuejs.org/guide/scaling-up/ssr.html#cross-request-state-pollution)、
  [Vue 状态管理：SSR 注意事项](https://vuejs.org/guide/scaling-up/state-management.html#ssr-considerations)

## 自定义指令

### 1. 假定 `updated` 只在指令绑定值发生变化时调用

- **适用版本：** Vue 3.0+；基线 Vue 3.5.40。
- **错误假设 / 原因：** `beforeUpdate` / `updated` 跟随宿主元素的更新流程，而不是一个
  “仅值变化”监听器。官方明确说明 `oldValue` 即使与 `value` 相同也可用；源码只要新 vnode
  带有指令，就在元素 patch 前后调用相应 hook。
- **可观察后果：** 无关状态更新也重复执行昂贵 DOM 操作、重复初始化插件或发送请求。
- **错误代码：**

```ts
const vChart = {
  // 每次宿主更新都重建图表
  updated(element: HTMLElement, binding: DirectiveBinding<ChartOptions>) {
    createChart(element, binding.value)
  },
}
```

- **正确代码：**

```ts
const vChart = {
  // 仅在绑定引用变化时更新图表
  updated(element: HTMLElement, binding: DirectiveBinding<ChartOptions>) {
    if (binding.value !== binding.oldValue) {
      updateChart(element, binding.value)
    }
  },
}
```

- **直接一手来源：** [Vue 自定义指令：hook 参数](https://cn.vuejs.org/guide/reusability/custom-directives.html#hook-arguments)、
  [Vue 3.5.40 元素更新时调用指令 hook](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts#L827-L855)、
  [Vue 3.5.40 指令旧值赋值](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/directives.ts#L170-L195)

### 2. 修改 `binding`，或把跨 hook 状态保存在它上面

- **适用版本：** Vue 3.0+；基线 Vue 3.5.40。
- **错误假设 / 原因：** 除 `el` 外，官方要求把 hook 参数视为只读。`withDirectives()`
  会在每次渲染时重新组装 `DirectiveBinding`，在 `mounted` 上临时增加的属性不是可靠的
  生命周期存储。
- **可观察后果：** `updated` / `unmounted` 读不到先前保存的资源句柄，listener、observer
  或第三方实例无法正确释放。
- **错误代码：**

```ts
const vObserve = {
  // 把可变资源塞进 binding
  mounted(element: Element, binding: DirectiveBinding & { observer?: IntersectionObserver }) {
    binding.observer = new IntersectionObserver(() => {})
    binding.observer.observe(element)
  },
  unmounted(_element: Element, binding: DirectiveBinding & { observer?: IntersectionObserver }) {
    binding.observer?.disconnect()
  },
}
```

- **正确代码：**

```ts
const observers = new WeakMap<Element, IntersectionObserver>()

const vObserve = {
  // 以宿主元素作为外部资源的稳定键
  mounted(element: Element) {
    const observer = new IntersectionObserver(() => {})
    observers.set(element, observer)
    observer.observe(element)
  },
  // 从 WeakMap 取回并清理同一资源
  unmounted(element: Element) {
    observers.get(element)?.disconnect()
    observers.delete(element)
  },
}
```

- **直接一手来源：** [Vue 自定义指令：hook 参数只读约定](https://cn.vuejs.org/guide/reusability/custom-directives.html#hook-arguments)、
  [Vue 3.5.40 每次渲染组装 binding](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/directives.ts#L135-L168)

### 3. 需要卸载清理，却仍使用函数简写

- **适用版本：** Vue 3.0+；基线 Vue 3.5.40。
- **错误假设 / 原因：** 函数指令不是“所有 hook 共用一个函数”。Vue 3.5.40 只把它归一化为
  `{ mounted: fn, updated: fn }`，不会在 `unmounted` 时再次调用。
- **可观察后果：** 指令创建的 listener、observer 或第三方实例在元素移除后仍存活。
- **错误代码：**

```ts
// 函数简写没有 unmounted 清理入口
app.directive('escape', element => {
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') element.remove()
  })
})
```

- **正确代码：**

```ts
const handlers = new WeakMap<Element, (event: KeyboardEvent) => void>()

app.directive('escape', {
  // 注册可被后续移除的同一函数引用
  mounted(element) {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') element.remove()
    }
    handlers.set(element, handler)
    window.addEventListener('keydown', handler)
  },
  // 元素卸载时释放全局 listener
  unmounted(element) {
    const handler = handlers.get(element)
    if (handler) window.removeEventListener('keydown', handler)
    handlers.delete(element)
  },
})
```

- **直接一手来源：** [Vue 自定义指令：函数简写](https://cn.vuejs.org/guide/reusability/custom-directives.html#function-shorthand)、
  [Vue 3.5.40 函数指令归一化](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/directives.ts#L145-L156)、
  [Vue 3.5.40 函数指令官方测试](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/directives.spec.ts#L154-L206)

### 4. 把组件上的自定义指令当成稳定的组件 API

- **适用版本：** Vue 3.0+；基线 Vue 3.5.40。
- **错误假设 / 原因：** 组件 vnode 上的指令会被继承到组件根节点，而不是作用于“组件实例”。
  单根组件改变根元素会改变指令目标；多根、文本或 Teleport 根无法提供确定的元素目标。
- **可观察后果：** 多根组件中指令被忽略并出现警告；重构子组件根节点后，指令悄然作用到
  不同 DOM 元素，且不能像 `$attrs` 一样由子组件显式转发。
- **错误代码：**

```vue-html
<!-- CardPanel 内部有多个根节点 -->
<CardPanel v-focus />
```

- **正确代码：**

```vue-html
<!-- 由子组件暴露明确的声明式 prop -->
<CardPanel autofocus />
```

```vue
<!-- CardPanel.vue -->
<script setup lang="ts">
const props = defineProps<{ autofocus?: boolean }>()

const vFocusIfRequested = {
  // 挂载明确的输入元素后按组件 prop 决定是否聚焦
  mounted(element: HTMLElement) {
    if (props.autofocus) element.focus()
  },
}
</script>

<template>
  <!-- 指令由组件内部绑定到确定的真实元素 -->
  <input v-focus-if-requested />
  <aside>帮助</aside>
</template>
```

- **直接一手来源：** [Vue 自定义指令：在组件上使用](https://cn.vuejs.org/guide/reusability/custom-directives.html#usage-on-components)、
  [Vue 3.5.40 组件根节点指令继承与警告](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentRenderUtils.ts#L244-L255)

### 5. 期待浏览器端指令 hook 在 SSR 时修改服务端 HTML

- **适用版本：** Vue 3.0+ SSR；基线 Vue 3.5.40。
- **错误假设 / 原因：** 大多数自定义指令直接操作 DOM，服务端渲染会忽略这些运行时 hook。
  若指令需要为服务端输出 attribute，必须在对象指令上实现 `getSSRProps()`；函数简写没有
  这个入口。
- **可观察后果：** 服务端 HTML 缺少所需的 `id`、ARIA 或样式 attribute；JavaScript
  接管前页面状态错误，并可能造成服务端与客户端输出不一致。
- **错误代码：**

```ts
const vId = {
  // mounted 不会参与服务端字符串渲染
  mounted(element: HTMLElement, binding: DirectiveBinding<string>) {
    element.id = binding.value
  },
}
```

- **正确代码：**

```ts
const vId = {
  // 客户端挂载后更新真实 DOM
  mounted(element: HTMLElement, binding: DirectiveBinding<string>) {
    element.id = binding.value
  },
  // 服务端把同一语义输出为 attribute
  getSSRProps(binding: DirectiveBinding<string>) {
    return { id: binding.value }
  },
}
```

- **直接一手来源：** [Vue SSR：自定义指令](https://cn.vuejs.org/guide/scaling-up/ssr.html#custom-directives)、
  [Vue 3.5.40 `ssrGetDirectiveProps()`](https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/src/helpers/ssrGetDirectiveProps.ts#L7-L30)、
  [Vue 3.5.40 `getSSRProps` 官方测试](https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/__tests__/ssrDirectives.spec.ts#L532-L550)

## 渲染函数与 `h()`

### 1. 从 `setup()` 直接返回 VNode，而不是返回渲染函数

- **适用版本：** Vue 3.0+；基线 Vue 3.5.40。
- **错误假设 / 原因：** `setup()` 只执行一次；Vue 只有在返回值是函数时才把它安装成组件的
  render。VNode 是对象，会被当成 setup state，并在开发环境触发专门警告。
- **可观察后果：** 组件没有可用的 render/template，首次渲染异常；响应式状态变化也不会
  重新执行那次已经完成的 `h()` 调用。
- **错误代码：**

```ts
export default {
  // 直接返回一次性创建的 vnode
  setup() {
    const count = ref(0)
    return h('button', String(count.value))
  },
}
```

- **正确代码：**

```ts
export default {
  // 返回会随组件更新重复执行的渲染函数
  setup() {
    const count = ref(0)
    return () => h('button', String(count.value))
  },
}
```

- **直接一手来源：** [Vue 渲染函数：声明渲染函数](https://cn.vuejs.org/guide/extras/render-function.html#declaring-render-functions)、
  [Vue 3.5.40 `setup()` 返回值分派与警告](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/component.ts#L929-L966)、
  [Vue 3.5.40 返回 render 的官方测试](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiSetupContext.spec.ts#L35-L44)

### 2. 用组件名字符串调用 `h()`，期待它自动解析已注册组件

- **适用版本：** Vue 3.0+；基线 Vue 3.5.40。
- **错误假设 / 原因：** `h()` 的字符串 `type` 表示原生元素；源码会给任意字符串设置
  `ELEMENT` shape flag。渲染已导入组件应直接传组件定义；只能按注册名取得组件时才使用
  `resolveComponent()`，并且该解析必须发生在 `setup()` 或 render 上下文内。
- **可观察后果：** 页面得到未知的 `<ButtonCounter>` DOM 元素，而不是组件实例；props、emits
  与组件生命周期均不执行。
- **错误代码：**

```ts
// 字符串会按元素处理
return () => h('ButtonCounter', { count: 1 })
```

- **正确代码：**

```ts
import ButtonCounter from './ButtonCounter.vue'

// 直接传组件定义
return () => h(ButtonCounter, { count: 1 })
```

只能依赖已注册名称时：

```ts
// 在 setup 上下文中解析一次
const ButtonCounter = resolveComponent('ButtonCounter')
return () => h(ButtonCounter, { count: 1 })
```

- **直接一手来源：** [Vue 渲染函数：组件](https://cn.vuejs.org/guide/extras/render-function.html#components)、
  [Vue `resolveComponent()` API](https://cn.vuejs.org/api/render-function.html#resolvecomponent)、
  [Vue 3.5.40 字符串 type 的 shape flag](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/vnode.ts#L597-L608)、
  [Vue 3.5.40 组件解析官方测试](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/helpers/resolveAssets.spec.ts#L16-L66)

### 3. 把具名插槽对象放在第二参数，或把插槽值写成现成 VNode

- **适用版本：** Vue 3.0+；基线 Vue 3.5.40。
- **错误假设 / 原因：** 两参数调用中，普通对象会被 `h()` 当成 props；具名 slots 对象必须
  用 `null` 占住 props 的第二参数。组件 slot 的值还必须是函数，以便子组件控制求值时机。
- **可观察后果：** `default` / `footer` 变成普通 props，子组件收不到插槽；非函数 slot
  在开发环境触发性能警告，并失去惰性求值带来的依赖追踪位置和更新优化。
- **错误代码：**

```ts
// 两参数中的普通对象被解释成 props，不是 slots
h(Card, {
  default: h('p', '正文'),
  footer: h('button', '关闭'),
})

// 占住 props 位后，现成 VNode 仍是非函数 slot
h(Card, null, {
  default: h('p', '正文'),
})
```

- **正确代码：**

```ts
// null 占住 props 位，每个 slot 都延迟为函数
h(Card, null, {
  default: () => h('p', '正文'),
  footer: () => h('button', '关闭'),
})
```

- **直接一手来源：** [Vue `h()` API：组件插槽与参数省略规则](https://cn.vuejs.org/api/render-function.html#h)、
  [Vue 3.5.40 `h()` 两参数归一化](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/h.ts#L200-L226)、
  [Vue 3.5.40 非函数 slot 警告](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentSlots.ts#L121-L165)、
  [Vue 3.5.40 slot 规范化官方测试](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/componentSlots.spec.ts#L66-L121)

### 4. 在同一棵组件树中重复使用同一个 VNode 对象

- **适用版本：** Vue 3.0+；基线 Vue 3.5.40。
- **错误假设 / 原因：** VNode 不是可重复使用的组件定义，而是一次已经创建的渲染输出，
  内部还会保存 `el`、组件实例等 patch 状态。官方要求组件树中的每个 VNode 都唯一。
- **可观察后果：** 代码违反官方的 VNode 唯一性约束。Vue 3.5.40 在普通 children
  规范化时会克隆已经挂载的 VNode 来避免引用污染，因此缓存的 VNode 对象不再等同于每个
  实际渲染位置；其他优化路径也不应依赖这种隐式保护。
- **错误代码：**

```ts
// 两个 child 指向同一个 vnode 对象
const paragraph = h('p', '相同文本')
return () => h('div', [paragraph, paragraph])
```

- **正确代码：**

```ts
// 每个位置都调用工厂创建新 vnode
const createParagraph = () => h('p', '相同文本')
return () => h('div', [createParagraph(), createParagraph()])
```

- **直接一手来源：** [Vue 渲染函数：VNode 必须唯一](https://cn.vuejs.org/guide/extras/render-function.html#vnodes-must-be-unique)、
  [Vue 渲染函数：VNode 是已创建的渲染输出](https://vuejs.org/guide/extras/render-function.html#using-vnodes-in-template)、
  [Vue 3.5.40 VNode 复用时的规范化保护](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/vnode.ts#L775-L803)

### 5. 把模板事件修饰符直接拼成任意 `onXxxModifier` prop

- **适用版本：** Vue 3.0+；基线 Vue 3.5.40。
- **错误假设 / 原因：** render props 没有 `@submit.prevent` 语法。只有事件选项修饰符
  `passive`、`capture`、`once` 可以拼在事件名后；`stop`、`prevent`、`self` 和按键修饰符
  需要 `withModifiers()` / `withKeys()` 包装 handler。
- **可观察后果：** `onSubmitPrevent` 被解析为错误的事件名，提交时 handler 不执行，或未调用
  `preventDefault()` 导致浏览器执行原生表单提交。
- **错误代码：**

```ts
// prevent 不是可拼接的事件选项修饰符
h('form', { onSubmitPrevent: submit }, children)
```

- **正确代码：**

```ts
// 行为修饰符通过运行时 helper 包装
h('form', { onSubmit: withModifiers(submit, ['prevent']) }, children)

// once / capture / passive 才拼接到事件名
h('button', { onClickOnceCapture: submit }, '提交一次')
```

- **直接一手来源：** [Vue 渲染函数：事件修饰符](https://cn.vuejs.org/guide/extras/render-function.html#event-modifiers)、
  [Vue `withModifiers()` API](https://cn.vuejs.org/api/render-function.html#withmodifiers)、
  [Vue 3.5.40 事件选项修饰符官方测试](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/__tests__/patchEvents.spec.ts#L79-L103)

## 现有 `advanced` 三篇正文只读核查

本节只记录当前快照中的事实或可运行性问题；本批没有修改这些文件。

### `composables.ts`

1. `useFetch` 示例使用 `ref(null)`，但 import 只有 `toValue` 与 `watchEffect`，缺少 `ref`，
   示例独立运行会得到 `ref is not defined` 或 TypeScript 未解析标识符错误。
2. 表格把 `toValue()` 的收益概括为“调用方传什么形式都能响应”过宽。普通值没有后续变化可追踪；
   ref/getter 也只有被 `watch()` 显式监听，或在 `watchEffect()` 同步执行段内读取时才会驱动重跑。
   当前紧随其后的 `watchEffect(() => fetch(toValue(url)))` 示例方向正确，但表格不应把
   “规范化输入形态”等同于“自动建立响应性”。
3. “`effectScope` 收集副作用”把范围说得过宽。`effectScope()` 自动捕获的是在作用域内创建的
   响应式 effect，例如 computed 和 watcher；事件 listener、计时器、请求等外部副作用仍需用
   `onUnmounted()` 或 `onScopeDispose()` 显式登记清理。

核查依据：[Vue Composables：输入参数](https://cn.vuejs.org/guide/reusability/composables.html#input-arguments)、
[Vue 3.5.40 `toValue()` 实现](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts#L233-L251)、
[Vue 响应式进阶：`effectScope()`](https://cn.vuejs.org/api/reactivity-advanced.html#effectscope)。

### `custom-directives.ts`

1. 源码摘录注释“`deep` 侦听旧值缓存”不符合 Vue 3.5.40 实现。`dir.deep` 分支执行的是
   `traverse(value)`，目的是在渲染 effect 中深度读取绑定值、收集嵌套依赖；`oldValue` 则在
   `invokeDirectiveHook()` 中从 `prevVNode.dirs` 对应 binding 的 `value` 取得，两者是独立机制。
2. 摘录直接执行 `hook(...)`，但真实实现还会暂停依赖追踪，并通过 Vue 的异步错误处理入口
   调用 hook。作为“精简源码”可以省略细节，但现有“只省略 DEV 校验与 deep”说明不完整，
   容易让读者误以为指令 hook 内的响应式读取会被外层渲染 effect 收集。

核查依据：[Vue 3.5.40 `withDirectives()` 与 `invokeDirectiveHook()`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/directives.ts#L135-L195)。

### `render-function.ts`

1. “精简 `createVNode`”的 `shapeFlag` 分支只处理字符串元素和对象组件，函数组件落入 `0`。
   Vue 3.5.40 的真实实现会给函数组件设置 `FUNCTIONAL_COMPONENT`，并在它与
   `STATEFUL_COMPONENT` 的并集上定义 `COMPONENT`；摘录因此不能正确解释函数组件如何进入
   组件 patch 分支。它还省略了 Teleport / Suspense 类型分支，但注释没有列出这些语义省略。
2. “递归生成任意层级树形结构是模板难以表达的典型场景”没有官方依据，而且表述过强。
   Vue 模板支持组件递归自引用，`v-for` 也能渲染递归树；官方只把 render function 定位为
   需要 JavaScript 完整编程能力时的选项，并仍建议绝大多数应用优先模板。该 demo 可以证明
   `h()` 能递归生成树，但不能据此证明模板难以表达同一结构。

核查依据：[Vue 3.5.40 VNode type 的完整 shape flag 分支](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/vnode.ts#L597-L608)、
[Vue 3.5.40 `ShapeFlags.COMPONENT`](https://github.com/vuejs/core/blob/v3.5.40/packages/shared/src/shapeFlags.ts#L1-L13)、
[Vue 渲染函数的官方定位](https://cn.vuejs.org/guide/extras/render-function.html)、
[Vue `<script setup>`：递归组件](https://cn.vuejs.org/api/sfc-script-setup.html#recursive-components)。

## 版本索引

| 能力 | 本文采用的最早版本边界 | 一手依据 |
| --- | --- | --- |
| Composables 调用/返回/副作用约定 | Vue 3.0+ | [Composables](https://cn.vuejs.org/guide/reusability/composables.html) |
| `toValue()` | Vue 3.3+ | [响应式工具：`toValue()`](https://cn.vuejs.org/api/reactivity-utilities.html#tovalue) |
| 自定义指令对象、函数简写、`getSSRProps` | Vue 3.0+ | [自定义指令](https://cn.vuejs.org/guide/reusability/custom-directives.html) |
| `h()`、`resolveComponent()`、render helpers | Vue 3.0+ | [渲染函数 API](https://cn.vuejs.org/api/render-function.html) |
