---
id: vue.core.learn.advanced.custom-directives
type: lesson
title: 自定义指令
summary: 把必须接触真实元素的行为封装为可清理、可更新且边界明确的 DOM 生命周期能力
domain: frontend
technology: vue
module: core
related:
  - vue.core.learn.advanced.error-handling
  - vue.core.learn.intermediate.composables
  - vue.core.learn.intermediate.lifecycle-update-timing
  - vue.core.reference.advanced.custom-directives
tags:
  - 自定义指令
  - Directive
  - DirectiveBinding
  - DOM 生命周期
  - 资源清理
  - 函数简写
  - getSSRProps
appliesTo: Vue 3.5.40
verifiedAt: 2026-08-01
sources:
  - title: Vue 中文自定义指令指南
    url: https://cn.vuejs.org/guide/reusability/custom-directives.html
  - title: Vue 应用实例 API：app.directive
    url: https://cn.vuejs.org/api/application.html#app-directive
  - title: Vue 其他杂项选项：directives
    url: https://cn.vuejs.org/api/options-misc.html#directives
  - title: Vue SSR：自定义指令
    url: https://cn.vuejs.org/guide/scaling-up/ssr.html#custom-directives
  - title: Vue 自定义指令官方 Markdown
    url: https://github.com/vuejs/docs/blob/main/src/guide/reusability/custom-directives.md
  - title: Vue 3.5.40 directives.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/directives.ts
  - title: Vue 3.5.40 renderer.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts
  - title: Vue 3.5.40 指令官方测试
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/directives.spec.ts
  - title: Vue 3.5.40 ssrGetDirectiveProps.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/src/helpers/ssrGetDirectiveProps.ts
stage: advanced
level: advanced
estimatedMinutes: 60
prerequisites:
  - vue.core.learn.advanced.error-handling
objectives:
  - 判断一个需求应使用组件、组合式函数还是自定义指令，避免把指令当作通用复用工具
  - 使用 script setup 的 vName 局部约定，并区分局部注册与 app.directive 全局注册
  - 按真实元素的创建、挂载、更新和卸载流程选择七个可选指令钩子
  - 正确读取 value、oldValue、arg 与 modifiers，并把 binding 当作只读快照
  - 让 updated 幂等且先比较新旧值，避免宿主无关更新重复执行昂贵 DOM 操作
  - 用元素作为资源键保存 listener、observer 或第三方实例，并在 unmounted 释放
  - 解释函数简写、组件根继承和 SSR getSSRProps 的能力边界
  - 根据固定版本源码推导错误传播、依赖追踪和动态参数更新的适用场景
recap:
  - 组件复用界面，组合式函数复用状态逻辑，自定义指令只复用真实元素的底层 DOM 行为。
  - script setup 的 vName 提供局部指令；全局指令只属于当前应用实例。
  - 七个钩子围绕宿主元素 patch 执行，应选择最晚但仍满足需求的时机。
  - binding 是只读快照；跨钩子资源应以真实元素为键保存在外部记录中。
  - updated 可能由无关宿主更新触发，必须比较输入并保持幂等。
  - 函数简写只覆盖 mounted 和 updated，不适合需要清理或 SSR 输出的行为。
  - 组件根不是稳定的指令目标；让子组件用 prop 明确拥有内部元素行为。
  - SSR 不执行 DOM 钩子，需要 attribute 时由对象指令实现 getSSRProps。
---

# 自定义指令

## 正文大纲

上一课建立了组件错误链，本课进入 Vue 的 DOM 扩展边界。自定义指令不是另一种组件，也不是另一种组合式函数：它只负责把必须直接接触某个真实元素的行为绑定到该元素的挂载、更新和卸载流程。课程先做工具选择，再学习钩子与资源所有权，最后用源码解释更新和 SSR 边界。

| 需求 | 优先能力 | 理由 |
| --- | --- | --- |
| 复用界面结构与交互 | 组件 | 结构、状态和事件属于一个可组合界面单元 |
| 复用有状态逻辑 | 组合式函数 | 逻辑可脱离某个具体 DOM 元素 |
| 聚焦、观察或接入 DOM 插件 | 自定义指令 | 行为必须取得真实宿主元素 |
| 只切换 class、style 或 attribute | 模板绑定 | 声明式表达已经足够清晰 |

:::warning
先证明“必须直接操作真实元素”，再创建指令。业务状态、请求、权限和跨组件通信仍应留在组件、store 或组合式函数中；指令只接收结果并维护 DOM 资源。
:::

## 从局部指令开始，再决定是否全局注册

&lt;script setup&gt; 中以 v 开头的驼峰变量会成为同一模板可用的局部指令，例如 vFocus 对应 v-focus。局部定义让依赖与使用位置相邻，适合作为默认选择。只有整个应用都需要且语义稳定的基础设施，才在 mount 前通过 app.directive() 注册；全局注册属于当前 app，不会自动进入另一个 createApp() 实例。

~~~~vue
<script setup lang="ts">
const vFocus = {
  /** 元素插入文档后再聚焦。 */
  mounted(element: HTMLElement) {
    element.focus()
  },
}
</script>

<template><input v-focus /></template>
~~~~

非 &lt;script setup&gt; 组件通过 directives 选项局部注册，键名 focus 对应模板中的 v-focus。它与 vFocus 编译约定只是不同入口，仍应优先保持局部。

~~~~ts
const focus = {
  /** 元素插入文档后再聚焦。 */
  mounted(element: HTMLElement) {
    element.focus()
  },
}

export default {
  directives: { focus },
}
~~~~

~~~~ts
const app = createApp(App)

app.directive('focus', {
  /** 全局指令仍只作用于使用 v-focus 的元素。 */
  mounted(element: HTMLElement) {
    element.focus()
  },
})

app.mount('#app')
~~~~

:::tip
全局注册减少了 import，却隐藏了组件依赖。团队级基础指令可全局安装；只在一个功能内使用的指令应保持局部，并在需要复用时从普通 TypeScript 模块导出指令对象。
:::

## 七个钩子跟随宿主元素的 patch 生命周期

所有钩子都可选。created 发生在元素 attribute 和事件监听器应用前；beforeMount 发生在插入父节点前；mounted 发生在父组件及其子节点挂载后。更新阶段由 beforeUpdate 与 updated 包围宿主 patch，卸载阶段由 beforeUnmount 与 unmounted 包围移除过程。选择最晚但仍满足需求的钩子，可以减少时序假设。

| 钩子 | 宿主状态 | 常见职责 |
| --- | --- | --- |
| created | 元素已创建，attribute 尚未完整应用 | 极少量不依赖最终 DOM 的初始化 |
| beforeMount | 即将插入真实父节点 | 挂载前准备 |
| mounted | 元素与子节点已挂载 | 聚焦、测量、listener、observer、DOM 插件 |
| beforeUpdate | 父组件更新前 | 读取更新前 DOM 状态 |
| updated | 父组件及子节点更新后 | 比较 value / oldValue 后同步 DOM |
| beforeUnmount | 元素仍存在 | 需要现存 DOM 的收尾动作 |
| unmounted | 元素已卸载 | listener、observer 与第三方实例清理 |

:::warning
指令钩子类似组件生命周期，但不是组件钩子的别名。它们围绕宿主元素 patch 执行；created 中不能假设 attribute、listener、父节点或布局都已就绪。
:::

## binding 是本轮调用的只读快照

完整钩子形状是 hook(element, binding, vnode, prevVnode)。binding.value 是当前表达式结果，oldValue 是更新前结果，arg 是冒号参数，modifiers 是点修饰符集合，instance 是使用该指令的组件公开实例，dir 是当前指令定义。vnode 表示当前元素，prevVnode 只在更新钩子中提供上一轮 VNode。动态参数会随渲染更新。除 element 外，官方要求把其余参数视为只读；不要向 binding、vnode、prevVnode 或 instance 塞入资源句柄。

~~~~vue
<script setup lang="ts">
const placement = ref<'top' | 'bottom'>('top')
const tooltip = ref('保存草稿')

const vTooltip = {
  /** 把当前值、动态参数和修饰符同步给 DOM 适配层。 */
  updated(element: HTMLElement, binding: DirectiveBinding<string>) {
    syncTooltip(element, {
      text: binding.value,
      placement: binding.arg,
      quiet: binding.modifiers.quiet,
    })
  },
}
</script>

<template><button v-tooltip:[placement].quiet="tooltip">保存</button></template>
~~~~

:::tip
value 与 oldValue 可以相等，arg 也可能独立变化。若一个指令同时依赖 value、arg 和 modifiers，更新判断必须覆盖真正影响 DOM 的全部输入，不能只比较 value。
:::

## updated 不是绑定值 watcher

只要带指令的宿主进入更新流程，beforeUpdate 和 updated 就可能运行，即使绑定值没有变化。updated 应设计为幂等同步器：先比较本轮输入与 oldValue，再决定是否写 DOM；复杂对象若原地修改，新旧引用可能相同，业务层应优先生成新的不可变配置，而不是在指令里做昂贵深比较。

~~~~ts
const vChart = {
  /** 只在图表配置引用变化时同步现有实例。 */
  updated(element: HTMLElement, binding: DirectiveBinding<ChartOptions>) {
    if (binding.value === binding.oldValue) return
    chartInstances.get(element)?.setOptions(binding.value)
  },
}
~~~~

| 更新方式 | 结果 | 建议 |
| --- | --- | --- |
| 无关文本更新，value 同引用 | updated 仍可能调用 | 比较后跳过 DOM 写入 |
| value 替换为新对象 | oldValue 保留旧引用 | 增量同步现有资源 |
| 原地修改 value 深层字段 | 新旧引用可能相同 | 上游创建新配置，明确变更边界 |
| 每次 updated 重建资源 | 重复监听与状态丢失 | 资源只建一次，更新其配置 |

## 资源由宿主元素拥有，并在卸载时释放

listener、observer 和第三方实例需要跨多个钩子存活。binding 每轮都会重新创建，不能承担资源容器；真实元素在这一段生命周期中保持稳定，适合作为 WeakMap 键。mounted 创建一次资源，updated 只更新配置，unmounted 用同一引用释放并删除记录。

~~~~ts
interface ResizeResource {
  callback: (width: number) => void
  observer: ResizeObserver
}

const resizeResources = new WeakMap<Element, ResizeResource>()

const vResize = {
  /** 挂载后创建并保存唯一观察器与当前回调。 */
  mounted(element: Element, binding: DirectiveBinding<(width: number) => void>) {
    const observer = new ResizeObserver(([entry]) => {
      const resource = resizeResources.get(element)
      if (entry && resource) resource.callback(entry.contentRect.width)
    })
    resizeResources.set(element, { callback: binding.value, observer })
    observer.observe(element)
  },
  /** 更新观察器下一次调用的回调。 */
  updated(element: Element, binding: DirectiveBinding<(width: number) => void>) {
    const resource = resizeResources.get(element)
    if (resource) resource.callback = binding.value
  },
  /** 卸载后释放并删除元素拥有的观察器。 */
  unmounted(element: Element) {
    resizeResources.get(element)?.observer.disconnect()
    resizeResources.delete(element)
  },
}
~~~~

:::warning
若 updated 需要使用最新回调，不要让 mounted 创建的 listener 永远闭包旧 binding。资源记录中保存可更新的当前配置，listener 每次触发时从记录读取最新值。
:::

## 函数简写只适合无清理的对称行为

函数形式会被 Vue 归一化为同一个 mounted 和 updated 钩子，不会自动成为 created、beforeUnmount 或 unmounted。只有两个阶段逻辑完全相同，而且没有跨钩子资源时才使用简写。只要涉及清理、SSR 或不同更新策略，就使用对象形式。

~~~~ts
// 合适：每次只把最新颜色同步到元素，无需保存资源
const vColor: Directive<HTMLElement, string> = (element, binding) => {
  element.style.color = binding.value
}

// 不合适：window listener 需要 unmounted 清理
const vEscape = {
  /** 挂载时建立资源。 */
  mounted(element: HTMLElement) {
    installEscapeListener(element)
  },
  /** 卸载时释放同一资源。 */
  unmounted(element: HTMLElement) {
    removeEscapeListener(element)
  },
}
~~~~

## 组件根和 SSR 是两条独立边界

官方不推荐把自定义指令用在组件上。组件 VNode 的指令会落到组件根元素，而不是组件实例；根节点变化会改变目标，多根、文本或 Teleport 根没有可依赖的唯一元素。更稳定的契约是让子组件接收 prop，再由子组件把指令绑定到明确的真实元素。

~~~~vue
<!-- 不稳定：指令目标取决于 SearchPanel 的根结构 -->
<SearchPanel v-focus />

<!-- 稳定：组件公开语义，内部选择真实输入元素 -->
<SearchPanel autofocus />
~~~~

服务端渲染没有浏览器 DOM，不会执行 mounted、updated 或 unmounted。若指令必须给服务端 HTML 添加 attribute，对象指令需实现 getSSRProps() 并返回服务端 props；客户端钩子仍负责接管后的真实 DOM。当前课程 Demo 只验证客户端，不据此推导 hydration 行为。

~~~~ts
const vIdentity = {
  /** 客户端把标识同步到真实元素。 */
  mounted(element: HTMLElement, binding: DirectiveBinding<string>) {
    element.id = binding.value
  },
  /** 服务端为同一语义输出 attribute。 */
  getSSRProps(binding: DirectiveBinding<string>) {
    return { id: binding.value }
  },
}
~~~~

## 易错使用提示

:::pitfalls
### 用指令承载本可声明式表达的界面逻辑

**触发条件：** 用指令承载本可声明式表达的界面逻辑

**原因：** 指令适合底层 DOM 行为，不适合管理业务状态、请求或完整界面结构。

**后果：** 状态散落到元素钩子中，组件数据流和测试入口都变得不清晰。

**错误示例：**

~~~~ts
const vLoadProfile = {
  /** 在 DOM 钩子里发请求并拼接界面。 */
  async mounted(element: HTMLElement) {
    element.innerHTML = renderProfile(await fetchProfile())
  },
}
~~~~

**正确写法：**

~~~~vue
<ProfilePanel :profile="profile" />
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 created 中读取布局或聚焦

**触发条件：** 在 created 中读取布局或聚焦

**原因：** created 时 attribute、listener、父节点和最终布局尚未完整应用。

**后果：** 测量值不可信，focus 也可能因为元素尚未插入文档而失效。

**错误示例：**

~~~~ts
const vFocus = {
  /** 过早操作尚未挂载的元素。 */
  created(element: HTMLElement) {
    element.focus()
  },
}
~~~~

**正确写法：**

~~~~ts
const vFocus = {
  /** 插入文档后再聚焦。 */
  mounted(element: HTMLElement) {
    element.focus()
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 假定 updated 只在绑定值变化时调用

**触发条件：** 假定 updated 只在绑定值变化时调用

**原因：** updated 跟随宿主更新流程，不是绑定值专用 watcher。

**后果：** 无关状态更新也反复重建图表、插件或其他昂贵 DOM 资源。

**错误示例：**

~~~~ts
const vChart = {
  /** 每次更新都重建图表。 */
  updated(element: HTMLElement, binding: DirectiveBinding<ChartOptions>) {
    createChart(element, binding.value)
  },
}
~~~~

**正确写法：**

~~~~ts
const vChart = {
  /** 绑定引用变化时才同步现有实例。 */
  updated(element: HTMLElement, binding: DirectiveBinding<ChartOptions>) {
    if (binding.value !== binding.oldValue) updateChart(element, binding.value)
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 修改 binding 或用它保存跨钩子状态

**触发条件：** 修改 binding 或用它保存跨钩子状态

**原因：** binding 是每轮重新组装的只读快照，不是稳定资源容器。

**后果：** 后续钩子拿不到句柄，listener、observer 或插件实例无法释放。

**错误示例：**

~~~~ts
/** 错误地把资源写入只读 binding。 */
mounted(element, binding) {
  binding.observer = new ResizeObserver(() => {})
  binding.observer.observe(element)
}
~~~~

**正确写法：**

~~~~ts
const observers = new WeakMap<Element, ResizeObserver>()

/** 为元素保存观察器。 */
function observe(element: Element) {
  const observer = new ResizeObserver(() => {})
  observers.set(element, observer)
  observer.observe(element)
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 需要卸载清理却使用函数简写

**触发条件：** 需要卸载清理却使用函数简写

**原因：** 函数指令只映射到 mounted 和 updated，不会在 unmounted 自动调用。

**后果：** 全局 listener、observer 或插件实例在元素移除后继续存活。

**错误示例：**

~~~~ts
app.directive('escape', (element) => {
  window.addEventListener('keydown', () => element.remove())
})
~~~~

**正确写法：**

~~~~ts
app.directive('escape', {
  /** 挂载时安装监听。 */
  mounted: installEscapeListener,
  /** 卸载时移除同一监听。 */
  unmounted: removeEscapeListener,
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 updated 中重复注册资源

**触发条件：** 在 updated 中重复注册资源

**原因：** updated 可频繁执行，新增资源前若不复用或释放旧资源就会累积。

**后果：** 一次键盘或观察事件触发多次回调，内存与业务副作用持续增长。

**错误示例：**

~~~~ts
/** 错误地在每轮更新中追加监听。 */
updated(element, binding) {
  window.addEventListener('keydown', () => binding.value(element))
}
~~~~

**正确写法：**

~~~~ts
/** 只更新现有资源读取的当前配置。 */
updated(element, binding) {
  const resource = resources.get(element)
  if (resource) resource.value = binding.value
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 把组件上的指令当成稳定组件 API

**触发条件：** 把组件上的指令当成稳定组件 API

**原因：** 组件指令会落到根元素；多根、文本或 Teleport 根没有稳定目标。

**后果：** 指令被忽略并警告，或在子组件重构后悄然作用到另一个元素。

**错误示例：**

~~~~vue
<SearchPanel v-focus />
~~~~

**正确写法：**

~~~~vue
<SearchPanel autofocus />
~~~~

**验证方式：** 对照正确写法验证结果。

### 期待客户端钩子修改 SSR HTML

**触发条件：** 期待客户端钩子修改 SSR HTML

**原因：** 服务端字符串渲染不会执行 mounted 等浏览器端 DOM 钩子。

**后果：** 服务端 HTML 缺少所需 attribute，接管前后的语义不一致。

**错误示例：**

~~~~ts
const vId = {
  /** 只在客户端写入 id。 */
  mounted(element, binding) {
    element.id = binding.value
  },
}
~~~~

**正确写法：**

~~~~ts
const vId = {
  /** 服务端输出相同 id。 */
  getSSRProps(binding) {
    return { id: binding.value }
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 从源码推导适用场景

:::steps
### 函数简写只有两个阶段

withDirectives 在 Vue 3.5.40 中把函数归一化为 mounted 与 updated，因此资源型行为必须使用对象指令。

### oldValue 来自上一轮 VNode

invokeDirectiveHook 在更新时从前一 VNode 对应 binding 复制 oldValue；渲染函数手工组织指令时应保持列表顺序和语义稳定。

### 钩子暂停追踪并进入错误链

Vue 调用钩子时暂停依赖追踪，并用异步错误包装执行。钩子不是 watcher；响应式结果应作为 binding value 传入，钩子抛错则进入上一课的错误处理链。

### renderer 划分三个 DOM 时序边界

created 在属性应用前，beforeMount 在插入前，mounted 在插入后排队；beforeUpdate 与 updated 包围更新，beforeUnmount 在卸载开始前调用，unmounted 随后排队。Transition 可能延迟真实移除，业务只应依赖公开钩子时机。

### 组件指令由 renderer 转交根 VNode

renderComponentRoot 会把组件 VNode 的指令合并到可用根元素；Fragment、文本或 Teleport 根没有稳定目标，因此组件根指令不应成为公开契约。

### SSR 只读取 getSSRProps

server renderer 只在对象指令提供 getSSRProps 时合并返回值。它不运行 DOM 生命周期，也不能由客户端 Demo 证明 hydration 正确。
:::

:::warning
vnode.dirs、currentRenderingInstance、暂停追踪和 binding 数组位置都是固定版本实现事实，不是业务代码可访问的公共接口。生产代码只依赖 Directive 类型、公开钩子参数和自己的资源记录。
:::

## 在快捷键指令实验台验证资源所有权

唯一 Demo 在 mounted 为目标安装一份 window 键盘监听，updated 只替换当前快捷键配置，unmounted 移除同一监听。无关状态更新会调用 updated，却不会增加 DOM 写入；切换绑定值后 oldValue 与 value 清晰可见；移除目标后快捷键不再触发，恢复目标只重新建立一份资源。

:::demo{id="vue.core.learn.advanced.custom-directives.directive-lifecycle-lab-demo" playground="true"}
比较无关更新与绑定更新，并验证快捷键 listener 在卸载后被释放
:::

## 练习与回顾

:::exercise
### 为第三方 DOM 插件划分生命周期

**要求：**

~~~~text
一个图表插件需要初始化、更新 options、响应容器尺寸并在元素移除时 dispose。写出各资源分别属于哪个钩子，以及如何保存实例。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
在 mounted 创建图表和 ResizeObserver，以元素为 WeakMap 键保存两者；updated 比较 options 后更新现有图表；unmounted 断开 observer、dispose 图表并删除记录。
~~~~
:::

:::exercise
### 判断是否应该创建指令

**要求：**

~~~~text
比较“按钮根据权限隐藏”“输入框挂载后选中文本”“跨页面复用分页请求”三个需求，分别选择模板、指令或组合式函数并说明理由。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
权限结果应由组件状态和模板条件表达；选中文本必须操作真实 input，适合指令；分页请求是有状态业务逻辑，应使用组合式函数或 store。
~~~~
:::
