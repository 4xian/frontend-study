---
id: vue.core.reference.options-api.component-instance
type: reference
title: 组件公共实例
summary: 查询 Options API 实例的状态、树关系、渲染引用和实例方法，以及公开实例边界
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.options-api.state-options
  - vue.core.reference.components.props
  - vue.core.reference.composition.template-refs
  - vue.core.reference.application.application-configuration
  - vue.core.reference.components.slots
  - vue.core.reference.components.attrs
  - vue.core.reference.reactivity-watchers.watch
  - vue.core.reference.components.emits
  - vue.core.reference.application.next-tick
tags:
  - Options API
  - ComponentPublicInstance
  - $data
  - $props
  - $refs
  - $attrs
  - $watch
  - $emit
  - $nextTick
appliesTo: Vue 3.5.40
verifiedAt: 2026-08-03
sources:
  - title: Vue 组件公共实例 API
    url: https://cn.vuejs.org/api/component-instance.html
  - title: Vue 模板引用指南
    url: https://cn.vuejs.org/guide/essentials/template-refs.html
  - title: Vue 透传 Attributes 指南
    url: https://cn.vuejs.org/guide/components/attrs.html
  - title: Vue 组件事件指南
    url: https://cn.vuejs.org/guide/components/events.html
  - title: Vue 插槽指南
    url: https://cn.vuejs.org/guide/components/slots.html
  - title: Vue 侦听器指南
    url: https://cn.vuejs.org/guide/essentials/watchers.html
  - title: Vue defineExpose 编译宏
    url: https://cn.vuejs.org/api/sfc-script-setup.html#defineexpose
  - title: Vue 3.5.40 组件公共实例实现
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentPublicInstance.ts
  - title: Vue 3.5.40 组件公开边界实现
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/component.ts
  - title: Vue 3.5.40 Options 合并实现
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentOptions.ts
  - title: Vue 3.5.40 实例侦听实现
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/apiWatch.ts
  - title: Vue 3.5.40 插槽规范化与更新实现
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentSlots.ts
  - title: Vue 3.5.40 模板引用实现
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/rendererTemplateRef.ts
  - title: Vue 3.5.40 组件事件实现
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentEmits.ts
  - title: Vue 3.5.40 更新调度实现
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/scheduler.ts
group: options-api
signature: |-
  interface ComponentPublicInstance {
    readonly $data: Record<string, unknown>
    readonly $props: Record<string, unknown>
    readonly $el: any
    readonly $options: ComponentOptions
    readonly $parent: ComponentPublicInstance | null
    readonly $root: ComponentPublicInstance
    readonly $slots: Record<string, (...args: any[]) => VNode[]>
    readonly $refs: Record<string, Element | ComponentPublicInstance | null>
    readonly $attrs: Record<string, unknown>

    $watch(
      source: string | (() => any),
      callback: WatchCallback,
      options?: WatchOptions,
    ): () => void
    $emit(event: string, ...args: any[]): void
    $forceUpdate(): void
    $nextTick(callback?: (this: ComponentPublicInstance) => void): Promise<void>
  }
anchors:
  - 概述
  - data
  - props
  - el
  - options
  - parent
  - root
  - slots
  - refs
  - attrs
  - watch
  - emit
  - forceupdate
  - nexttick
  - 易错使用提示
  - 源码推导与适用场景
---

# 组件公共实例

## 一、概述

公共实例是模板、Options API 的 `this`、组件模板引用以及 `$parent` / `$root` 所看到的受控代理，不是 Vue 的内部组件实例。除 `$data` 的嵌套字段外，本页列出的公共实例属性全部只读；开发构建是否给出额外警告，不会改变这项 public contract。业务代码不得通过 `$`、`vnode`、`subTree` 等内部字段绕过公开边界。

普通 Options 组件默认把 data、声明的 props、computed 和 methods 等绑定代理到公开实例，可用 `expose` 选项收窄。`<script setup>` 组件默认不公开局部绑定，父级只能访问子组件通过 `defineExpose()` 明确暴露的成员；其中的 ref 会自动解包。跨组件数据优先使用 Props、Emits、Provide / Inject 或状态容器，公共实例引用只承担必要的命令式能力。

| 分组 | 成员 | 主要用途 |
| --- | --- | --- |
| 状态与定义 | `$data`、`$props`、`$options` | 读取实例状态、已解析输入和组件选项 |
| 组件树 | `$parent`、`$root` | 调试或受控框架集成的逃生口 |
| 渲染引用 | `$el`、`$slots`、`$refs`、`$attrs` | 读取当前渲染上下文和明确的 DOM / 组件目标 |
| 实例方法 | `$watch()`、`$emit()`、`$forceUpdate()`、`$nextTick()` | 创建副作用、发出事件和等待更新批次 |

:::warning
父级持有的组件 ref、`$parent` 与 `$root` 都受对方 `expose` / `defineExpose()` 约束。只依赖子组件明确承诺的窄方法，例如 `focus()` 或 `reset()`；不要读取任意内部状态。
:::

## 二、$data

`$data` 是当前实例 `data()` 返回的响应式对象，`this.$data.count` 与 `this.count` 访问同一份组件状态。可以修改其内部字段，但 `$data` 属性本身只读，不能替换成新对象。`setup()` 返回的绑定不属于 `$data`；组合式状态应通过 setup bindings 或显式暴露的能力访问。

~~~~ts
export default {
  /** 创建当前计数器实例的状态。 */
  data() {
    return { count: 0 }
  },
  methods: {
    /** 更新 $data 内部的响应式字段。 */
    increment() {
      this.$data.count++
    },
  },
}
~~~~

## 三、$props

`$props` 只包含通过 `props` 声明并解析后的输入，未声明输入会进入 `$attrs`。对象本身只读，子组件应通过 emit 请求父组件更新。只读属于浅层边界：嵌套对象技术上仍可能可变，但随意修改会破坏单向数据流；只有父子明确约定共享同一对象语义时才可协商使用。完整声明、校验和默认值规则参见“组件 Props”。

~~~~ts
export default {
  props: { title: String },
  emits: ['update:title'],
  methods: {
    /** 请求父组件更新标题。 */
    rename(title: string) {
      this.$emit('update:title', title)
    },
  },
}
~~~~

## 四、$el

`$el` 是当前组件管理的根 DOM 节点。挂载完成前为 `undefined`；单元素根指向该元素，文本根指向文本节点，多根组件则只提供 Vue 用来标记组件范围的文本或 hydration 注释占位节点。因此它不是稳定的业务 DOM 契约。聚焦、测量和第三方库接入应使用目标元素的模板引用。

~~~~vue
<template>
  <input ref="searchInput" type="search" />
</template>

<script lang="ts">
export default {
  /** 在目标元素挂载后设置焦点。 */
  mounted() {
    this.$refs.searchInput?.focus()
  },
}
</script>
~~~~

## 五、$options

`$options` 是实例化当前组件时的已解析选项。存在全局 mixin、`extends` 或组件级 mixin 时，运行时按 Options 合并策略生成结果；没有合并来源时可能直接返回原始组件选项。它适合读取由 `app.config.optionMergeStrategies` 处理的静态自定义 option 元数据，不适合在实例运行后动态改写组件定义。

:::tip
合并结果按组件类型缓存，而不是为每个实例复制。修改 `$options` 不会重新执行 data、watch、computed 或生命周期初始化，还可能制造跨实例共享状态。
:::

## 六、$parent

`$parent` 指向父级组件的公共实例，根组件的 `$parent` 为 `null`。它会尊重父组件的公开边界，且插入包装组件就可能改变父链。仅在调试、迁移旧代码或受控框架集成时把它当作逃生口；业务通信不要依赖父级的任意字段。

## 七、$root

`$root` 指向当前组件树的根公共实例，根组件的 `$root` 是自身。一个页面可以存在多个 Vue 应用，每个应用都有自己的根；Teleport 只改变 DOM 落点，不会改变组件树根。全局业务状态应使用明确的状态容器或依赖注入，而不是挂在 `$root` 上。

~~~~ts
export default {
  inject: ['analytics'],
  methods: {
    /** 通过显式注入的服务记录课程访问。 */
    trackCourse(courseId: string) {
      this.analytics.openCourse(courseId)
    },
  },
}
~~~~

## 八、$slots

`$slots` 的 key 是插槽名，值是接收 slot props 并返回 VNode 数组的函数；默认插槽位于 `this.$slots.default`。可以检查 `this.$slots.header` 是否存在，但需要内容时必须在渲染期间调用该函数，不能把函数本身当作 VNode 数组，也不要在 created 中缓存调用结果。完整作用域插槽规则参见“组件 Slots”。

~~~~ts
import { h } from 'vue'

export default {
  /** 在当前渲染期间调用父级提供的插槽函数。 */
  render() {
    const nodes = this.$slots.default?.({ status: 'ready' }) ?? []
    return h('section', nodes)
  },
}
~~~~

## 九、$refs

`$refs` 由渲染器维护，包含模板 `ref` 对应的 DOM 元素或子组件公共实例。首次挂载前目标不存在，条件卸载后会清空；非空值在 post-render 阶段写入。它不是可供 `watch()` 跟踪的业务响应式状态。`v-for` 下同名 ref 可能得到数组，且官网不保证数组顺序与源数组一致。

组件 ref 只提供子组件的公开实例。`<script setup>` 子组件的局部绑定默认不可见，需要命令式能力时，由子组件使用 `defineExpose({ focus, reset })` 暴露窄方法。父级在挂载后或相关状态更新并 `await this.$nextTick()` 后重新判空读取。

~~~~vue
<script setup lang="ts">
import { ref } from 'vue'

const input = ref<HTMLInputElement | null>(null)

/** 聚焦当前搜索输入框。 */
function focus() {
  input.value?.focus()
}

defineExpose({ focus })
</script>

<template>
  <input ref="input" type="search" />
</template>
~~~~

## 十、$attrs

`$attrs` 包含未被 props 或 emits 声明消费的 attributes 与监听器。普通 attribute key 保留原始大小写，例如 `foo-bar` 要用 `this.$attrs['foo-bar']`；`@click` 以 `onClick` 暴露。对象始终反映最新输入，但官方明确它不是响应式对象，不能以 watcher 监听其字段。需要响应性时声明 prop；只需在更新后执行副作用时，可在 `updated` 中读取。

`inheritAttrs: false` 只关闭 attributes 自动继承到根节点，不会清空 `$attrs`。多根或包装组件应使用 `v-bind="$attrs"` 将它显式绑定到真正承载交互和可访问性语义的元素。

## 十一、$watch()

`$watch()` 命令式创建当前实例作用域内的侦听器，并返回停止函数。字符串来源只支持属性名或由点分隔的简单路径，例如 `'profile.name'`；索引、可选链和计算表达式必须改用 getter。getter 与 callback 都以当前公共实例为 `this`，`immediate`、`deep`、`flush`、`once`、`onTrack` 和 `onTrigger` 沿用 `watch()` 的语义。

~~~~ts
export default {
  /** 创建当前筛选状态。 */
  data() {
    return { selectedIndex: 0, items: [] }
  },
  /** 在实例挂载后创建需要手动提前停止的侦听器。 */
  mounted() {
    this.stopPriceWatch = this.$watch(
      () => this.items[this.selectedIndex]?.price,
      (price) => this.recalculate(price),
    )
  },
  /** 在业务关闭时提前释放侦听器。 */
  beforeUnmount() {
    this.stopPriceWatch?.()
  },
}
~~~~

:::tip
实例卸载会停止其作用域内的 watcher；如果业务条件更早结束，仍应立即调用返回的停止函数，避免无效副作用继续执行。完整来源、清理、深度和 flush 规则参见 `watch()` 页面。
:::

## 十二、$emit()

`$emit(event, ...args)` 只通知当前组件调用点上的匹配监听器，不沿组件树冒泡。事件应在 `emits` 中声明，以获得类型、开发期未声明事件提示、参数校验以及 attrs listener 的正确消费边界。模板监听推荐 kebab-case，代码中可用 camelCase 触发；不要把名称归一化理解成任意字符串都等价。

~~~~ts
export default {
  emits: {
    /** 校验提交事件的课程标识。 */
    submit: (courseId: string) => courseId.length > 0,
  },
  methods: {
    /** 把用户提交意图发送给直接父组件。 */
    submitCourse(courseId: string) {
      this.$emit('submit', courseId)
    },
  },
}
~~~~

:::warning
`$emit()` 的公开签名返回 `void`。不要依赖父级 listener 的返回值建立同步请求响应协议；需要结果时应通过状态、回调 prop 或显式服务契约表达。
:::

## 十三、$forceUpdate()

`$forceUpdate()` 将当前组件的更新 job 放入调度队列，同一轮重复请求会被去重，因此它不是同步重绘命令。官方只建议在刻意使用高阶响应式 API 创建了非响应式组件状态时，把它作为极少使用的逃生口。它不会把普通对象变成响应式数据，也不能替代正确声明 `ref()`、`reactive()` 或 `shallowRef()`。

## 十四、$nextTick()

`$nextTick()` 是绑定当前公共实例的全局 `nextTick()`。它等待当前 Vue 更新 flush；传入回调时，实例版的差异是回调 `this` 指向当前组件。Promise 写法通常更清晰：先修改响应式状态，再 `await this.$nextTick()` 读取本轮更新后的 DOM。

~~~~ts
export default {
  /** 展开面板并在 DOM 更新后读取目标尺寸。 */
  async openPanel() {
    this.open = true
    await this.$nextTick()
    return this.$refs.panel?.getBoundingClientRect()
  },
}
~~~~

:::tip
`$nextTick()` 不保证网络请求、计时器、CSS transition 或浏览器绘制已经结束，也不会在没有状态变化时主动触发更新。需要等待实际绘制或动画结束时，应选择对应的浏览器时机。
:::

## 十五、易错使用提示

:::pitfalls
### 替换只读公共属性，或把生产期少警告当作可写契约

**触发条件：** 替换只读公共属性，或把生产期少警告当作可写契约

**原因：** `$data`、`$props`、`$attrs` 和 `$refs` 等属性由公共实例代理管理；只有 `$data` 内部字段允许正常响应式修改。

**后果：** 开发环境出现警告或严格模式错误；生产构建即使没有相同提示，写入也不是受支持行为。

**错误示例：**

~~~~ts
this.$data = { count: 1 }
this.$props.title = '新标题'
this.$refs = {}
~~~~

**正确写法：**

~~~~ts
this.count = 1
this.$emit('update:title', '新标题')
~~~~

**验证方式：** 对照正确写法验证结果。

### 在挂载前读取 $el，或把多根 $el 当作业务元素

**触发条件：** 在挂载前读取 $el，或把多根 $el 当作业务元素

**原因：** 挂载前没有 DOM；多根组件的 `$el` 只是用于标记组件范围的占位节点。

**后果：** 得到 `undefined`、文本或注释节点，调用 `focus()`、测量方法时失败或作用于错误目标。

**错误示例：**

~~~~ts
export default {
  /** 错误地在 DOM 创建前读取根节点。 */
  created() {
    this.$el.focus()
  },
}
~~~~

**正确写法：**

~~~~ts
export default {
  /** 在目标模板引用就绪后设置焦点。 */
  mounted() {
    this.$refs.searchInput?.focus()
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 修改 $options 并期待当前实例重新初始化

**触发条件：** 修改 $options 并期待当前实例重新初始化

**原因：** 组件的 data、watch、computed 与生命周期已经完成初始化，合并选项还可能按组件类型缓存。

**后果：** 当前实例行为不会按预期更新，还可能把共享组件定义变成跨实例隐式状态。

**错误示例：**

~~~~ts
this.$options.watch = {
  status: this.handleStatus,
}
~~~~

**正确写法：**

~~~~ts
this.stopStatusWatch = this.$watch(
  'status',
  this.handleStatus,
)
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 $parent 或 $root 读取任意状态并假定层级不变

**触发条件：** 用 $parent 或 $root 读取任意状态并假定层级不变

**原因：** 包装组件会改变父链，对方也可以通过 expose 或 defineExpose 收窄公开面。

**后果：** 重构布局或迁移组件写法后字段变成 `undefined`，形成难以追踪的跨层耦合。

**错误示例：**

~~~~ts
this.$root.currentUser = nextUser
this.$parent.formState.submit()
~~~~

**正确写法：**

~~~~ts
this.$emit('submit', payload)
// 跨层依赖使用 provide / inject。
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 $slots.default 当作 VNode 数组或提前缓存

**触发条件：** 把 $slots.default 当作 VNode 数组或提前缓存

**原因：** 插槽是父组件提供的函数，响应式依赖应在子组件渲染期间被收集。

**后果：** 访问数组方法报错，或依赖跟踪与更新时机不符合预期。

**错误示例：**

~~~~ts
const first = this.$slots.default[0]
this.cachedNodes = this.$slots.default?.()
~~~~

**正确写法：**

~~~~ts
/** 在当前渲染期间读取最新插槽内容。 */
render() {
  return h('section', this.$slots.default?.() ?? [])
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 在首次渲染读取 $refs，或侦听 $refs 等待目标

**触发条件：** 在首次渲染读取 $refs，或侦听 $refs 等待目标

**原因：** 引用由渲染器在目标挂载后写入，并在卸载时清空；它不是业务响应式状态。

**后果：** 首次得到 `undefined`，watcher 不触发，或继续依赖已经卸载的目标。

**错误示例：**

~~~~ts
watch: {
  '$refs.input'(input) {
    input.focus()
  },
}
~~~~

**正确写法：**

~~~~ts
/** 在引用就绪后聚焦目标。 */
mounted() {
  this.$refs.input?.focus()
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 $attrs 当响应式对象，或按 camelCase 猜 attribute key

**触发条件：** 把 $attrs 当响应式对象，或按 camelCase 猜 attribute key

**原因：** attrs 始终反映最新输入但不可被 watcher 跟踪；普通 attribute 还保留原始 key。

**后果：** watcher 不触发，读取 `fooBar` 得到 `undefined`，或漏转发输入和监听器。

**错误示例：**

~~~~ts
this.$watch(
  () => this.$attrs.fooBar,
  this.syncFoo,
)
~~~~

**正确写法：**

~~~~ts
/** 在组件更新后读取最新 attribute。 */
updated() {
  this.syncFoo(this.$attrs['foo-bar'])
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 给 $watch() 传表达式字符串，或忘记停止临时侦听

**触发条件：** 给 $watch() 传表达式字符串，或忘记停止临时侦听

**原因：** 字符串来源只支持属性名和简单点路径；复杂读取需要 getter，业务提前结束时需要主动停止。

**后果：** 观察错误路径或始终不触发；关闭对应功能后仍持续执行昂贵副作用。

**错误示例：**

~~~~ts
this.$watch(
  'items[selectedIndex].price',
  this.recalculate,
)
~~~~

**正确写法：**

~~~~ts
const stop = this.$watch(
  () => this.items[this.selectedIndex]?.price,
  this.recalculate,
)

stop()
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为 $emit() 会冒泡，或漏声明同名原生事件

**触发条件：** 认为 $emit() 会冒泡，或漏声明同名原生事件

**原因：** 组件事件只匹配直接调用点监听器；未声明 listener 还可能留在 `$attrs` 并透传到根元素。

**后果：** 祖先监听不到跨层事件，或一次原生交互让父级 handler 执行两次。

**错误示例：**

~~~~ts
export default {
  methods: {
    /** 未声明事件并错误地期待它沿组件树冒泡。 */
    notify() {
      this.$emit('click')
    },
  },
}
~~~~

**正确写法：**

~~~~ts
export default {
  emits: ['click'],
  methods: {
    /** 只通知直接父组件的匹配监听器。 */
    notify() {
      this.$emit('click')
    },
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 $forceUpdate() 当同步重绘，再用 $nextTick() 轮询外部任务

**触发条件：** 把 $forceUpdate() 当同步重绘，再用 $nextTick() 轮询外部任务

**原因：** force update 只把更新 job 入队，next tick 只等待 Vue 当前 flush，不等待网络、计时器或浏览器绘制。

**后果：** 紧接着仍读到旧 DOM，或形成无意义的微任务循环且没有修复非响应式状态。

**错误示例：**

~~~~ts
this.externalState.count++
this.$forceUpdate()
const text = this.$el.textContent
~~~~

**正确写法：**

~~~~ts
this.count++
await this.$nextTick()
const text = this.$refs.counter?.textContent
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 十六、源码推导与适用场景

:::steps
### 1. 公共属性来自固定映射并受代理写入边界保护

`publicPropertiesMap` 把本页成员映射到内部实例字段或绑定函数，公开代理的 set trap 会拒绝覆盖 `$data` 等保留属性。适合依赖官网公开成员，不应扩展到未记录的内部字段。

### 2. $data 与 $props 不是所有状态和输入的汇总对象

`$data` 直接指向实例 data，`$props` 只指向已解析 props；setup bindings、未声明 attrs 与注入值走独立通道。调试状态来源时应按声明通道定位，而不是遍历两个对象猜测。

### 3. $options 适合静态元数据，不适合每实例可变状态

`resolveMergedOptions()` 在有全局 mixin、extends 或本地 mixins 时合并，并按组件类型缓存。可用它读取已合并的自定义 option，但可变业务数据必须进入实例状态。

### 4. 组件树引用与模板 ref 共用公开实例边界

`getComponentPublicInstance()` 在存在 exposed 对象时创建 `exposeProxy`，先读显式公开成员，再回退内置公共属性。适合暴露 `focus()` 等最小命令，不适合把整个子组件状态公开给父级。

### 5. 非空模板引用在渲染后写入，卸载清空不延后

`setRef()` 对非空目标安排 post-render 写入，对卸载清空立即处理，并在组件目标上取得其公共实例。这解释了首次判空、条件卸载后重读和 expose 限制。

### 6. slots 与 attrs 是持续更新的渲染输入容器

插槽更新会规范化函数并删除过期 key，attrs 也由实例容器持续同步。它们适合在渲染期或更新后读取最新值，不适合在 created 中缓存 VNode 或当作业务 reactive state。

### 7. 实例侦听器归属调用它的组件作用域

`instanceWatch()` 对字符串点路径逐段取值，对函数来源与回调绑定当前公共实例，并在该实例上下文创建 watcher。适合 Options API 中需要命令式启停的局部副作用。

### 8. emit 从组件调用点解析监听器而非执行 DOM 冒泡

`emit()` 先按 emits 声明进行开发期校验，再从调用点 props 查找普通与 `.once` handler。适合明确的子到父意图通知，不适合跨层广播或同步 RPC。

### 9. force update 复用组件更新 job 并由调度器去重

`$forceUpdate()` 缓存一个把组件 update job 交给 `queueJob()` 的函数，调度器通过 QUEUED 标记去重。同一 tick 连续调用不会产生同次数同步 render，只适合极少的非响应式边界补偿。

### 10. next tick 保证 Vue 调度批次而非浏览器绘制

`$nextTick()` 绑定当前 proxy，并等待 `currentFlushPromise` 或已解决 Promise。它适合在状态变更后读取 Vue 更新的 DOM；需要下一帧布局或动画结束时应使用相应浏览器机制。
:::
