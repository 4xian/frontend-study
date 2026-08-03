# Vue Core API 第 35 批：组件公共实例官方调研

> 核对日期：2026-08-03
>
> 版本基线：`vue@3.5.40`（固定提交
> `fa2885d8c48768d26f1666a01bd540ffe3b20f9b`）
>
> 范围：仅 `vue/core/reference` 的组件公共实例 13 项，不进入第 36 批

## 冻结结论

本批建立一篇主题合并页，不新增 Demo。页面必须先声明官方总边界：**除 `$data` 下的嵌套
属性外，本页列出的公共实例属性都只读**。只读是 public contract，不能因生产构建省略部分
开发期代理警告而鼓励写入。

| 官方页面 | 站内 ID | collection | 标题 |
| --- | --- | --- | --- |
| [组件实例](https://cn.vuejs.org/api/component-instance.html) | `vue.core.reference.options-api.component-instance` | `options-api` | `组件公共实例` |

这是一张 Options API 公共实例速查页。现有 Props、Emits、Slots、Attributes、模板引用、侦听器
与 `nextTick()` 页面继续承担完整知识教学；本页只讲 `this.$*` 入口、只读边界和与 Composition
API 的差异。

## 条目与锚点映射

13 项都保持既有 `merged` 深度，合并到同一 entry。heading 使用 API 展示名，站内 anchor 与
当前 manifest 的冻结值逐字一致。

| Manifest id | heading | anchor | 目标 entry |
| --- | --- | --- | --- |
| `component-instance.data` | `$data` | `data` | `vue.core.reference.options-api.component-instance` |
| `component-instance.props` | `$props` | `props` | `vue.core.reference.options-api.component-instance` |
| `component-instance.el` | `$el` | `el` | `vue.core.reference.options-api.component-instance` |
| `component-instance.options` | `$options` | `options` | `vue.core.reference.options-api.component-instance` |
| `component-instance.parent` | `$parent` | `parent` | `vue.core.reference.options-api.component-instance` |
| `component-instance.root` | `$root` | `root` | `vue.core.reference.options-api.component-instance` |
| `component-instance.slots` | `$slots` | `slots` | `vue.core.reference.options-api.component-instance` |
| `component-instance.refs` | `$refs` | `refs` | `vue.core.reference.options-api.component-instance` |
| `component-instance.attrs` | `$attrs` | `attrs` | `vue.core.reference.options-api.component-instance` |
| `component-instance.watch` | `$watch()` | `watch` | `vue.core.reference.options-api.component-instance` |
| `component-instance.emit` | `$emit()` | `emit` | `vue.core.reference.options-api.component-instance` |
| `component-instance.force-update` | `$forceUpdate()` | `forceupdate` | `vue.core.reference.options-api.component-instance` |
| `component-instance.next-tick` | `$nextTick()` | `nexttick` | `vue.core.reference.options-api.component-instance` |

## 官方来源

### 中文官网

- [组件实例](https://cn.vuejs.org/api/component-instance.html)：13 项的 public contract、类型、
  `$el` 根节点形态、`$options` 合并来源、`$watch()` 选项及实例版 `$nextTick()` 的差异。
- [模板引用](https://cn.vuejs.org/guide/essentials/template-refs.html)：`$refs` 的挂载时机、
  `v-for` 数组、组件公开实例，以及 Options `expose` / `<script setup>` 公开边界。
- [`defineExpose()`](https://cn.vuejs.org/api/sfc-script-setup.html#defineexpose)：
  `<script setup>` 默认关闭内部绑定，显式暴露成员及 ref 自动解包。
- [透传 Attributes](https://cn.vuejs.org/guide/components/attrs.html)：`$attrs` 的消费规则、原始
  key、监听器 key、非响应式限制和 `inheritAttrs` 落点。
- [组件事件](https://cn.vuejs.org/guide/components/events.html)：事件参数、命名转换、声明校验
  和“组件事件不冒泡”的边界。
- [插槽](https://cn.vuejs.org/guide/components/slots.html)：条件插槽、作用域插槽与函数调用模型。
- [侦听器](https://cn.vuejs.org/guide/essentials/watchers.html)：getter、深层侦听、刷新时机、清理
  和停止侦听的完整语义。

### Vue 3.5.40 固定源码与官方测试

- [`componentPublicInstance.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentPublicInstance.ts)：
  13 项的 public property 映射、公开实例类型、只读赋值拦截、访问缓存和实例代理。
- [`component.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/component.ts)：
  `getComponentPublicInstance()`、`exposeProxy`、setup context 和 `defineExpose()` 的运行时承载。
- [`componentOptions.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentOptions.ts)：
  `resolveMergedOptions()` 的合并顺序、每组件缓存和自定义 option merge strategy。
- [`apiWatch.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/apiWatch.ts)：
  `instanceWatch()` 的字符串路径、getter、回调 `this`、所属实例作用域和停止句柄。
- [`componentEmits.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentEmits.ts)：
  emit 声明与校验、参数修饰、handler 名称解析、`.once` 和卸载边界。
- [`rendererTemplateRef.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/rendererTemplateRef.ts)：
  DOM / 组件公开实例取值、post-render 非空赋值、卸载清空与 `v-for` 引用数组。
- [`componentSlots.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentSlots.ts)：
  插槽规范化、函数包装和更新时删除过期插槽。
- [`scheduler.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/scheduler.ts)：
  `$forceUpdate()` 依赖的 job 队列，以及 `$nextTick()` 等待当前 flush 与回调绑定的实现。
- [`componentPublicInstance.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/componentPublicInstance.spec.ts)、
  [`apiWatch.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/apiWatch.spec.ts)、
  [`rendererTemplateRef.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/rendererTemplateRef.spec.ts)、
  [`componentEmits.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/componentEmits.spec.ts)、
  [`scheduler.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/scheduler.spec.ts)：
  公共属性身份与只读警告、实例侦听生命周期、引用清空、事件处理和队列去重的回归证据。

Tavily 用于检索和抽取上述 Vue 官方域名、`vuejs/docs` 与 `vuejs/core` 一手来源；没有用第三方
教程决定 public contract。线上指南按核对日期冻结语义，补丁级实现结论只以
`vuejs/core@v3.5.40` 固定标签为证据。

## 类型基线

正文展示学习所需的 public surface，不复制 `ComponentPublicInstance` 的全部内部泛型：

```ts
interface ComponentPublicInstance {
  readonly $data: object
  readonly $props: object
  readonly $el: any
  readonly $options: ComponentOptions
  readonly $parent: ComponentPublicInstance | null
  readonly $root: ComponentPublicInstance
  readonly $slots: Record<string, (...args: any[]) => VNode[]>
  readonly $refs: Record<string, Element | ComponentPublicInstance | null>
  readonly $attrs: object

  $watch(
    source: string | (() => any),
    callback: WatchCallback,
    options?: WatchOptions,
  ): StopHandle

  $emit(event: string, ...args: any[]): void
  $forceUpdate(): void
  $nextTick(callback?: (this: ComponentPublicInstance) => void): Promise<void>
}

type StopHandle = () => void
```

`$data` 自身仍只读，允许修改的是它内部由 `data()` 返回的响应式字段。官网简化类型没有在每个
属性前写 `readonly`，但页面总说明已明确禁止替换这些属性。

## 公共实例与暴露边界

公共实例是模板、Options API 的 `this`、组件模板引用、`$parent` / `$root` 所看到的受控代理，
不是 `ComponentInternalInstance`。正文不得教授依赖 `$`、`vnode`、`subTree` 等内部字段，也不
引导使用 `getCurrentInstance()` 绕过公开边界。

普通 Options 组件默认会在公开实例上代理 data、声明的 props、computed、methods 等绑定，可用
`expose` 选项收窄。使用 `<script setup>` 的组件默认不公开其中声明的局部绑定；必须通过
`defineExpose({ focus })` 建立父级可见能力。公开对象中的 ref 会自动解包。固定源码的
`exposeProxy` 仍会回退到 `$el`、`$emit` 等内置 public properties，但这不意味着父级能读取未
显式暴露的 `<script setup>` 局部状态。

因此，子组件模板引用、`$parent` 与 `$root` 取得的实例形状可能受对方 `expose` /
`defineExpose()` 约束。跨组件代码只应依赖明确公开的最小命令；数据通信优先 Props、Emits、
Provide / Inject 或状态容器。

## 行为边界

### $data

`$data` 是当前实例 `data()` 返回的响应式对象，`this.$data.count` 与 `this.count` 指向同一份
组件状态。可以修改内部字段，但不能用新对象替换 `this.$data`。它只属于 Options `data()`；
`setup()` 返回的绑定不归入 `$data`。

### $props

`$props` 只包含通过 `props` 声明并解析后的属性，未声明输入会进入 `$attrs` 而不是 `$props`。
对象本身只读；子组件应通过 emit 请求父组件更新，而不是回写 prop。只读是浅层边界：嵌套对象
技术上可能仍可变，但直接修改会破坏单向数据流，只有父子明确共享同一对象语义时才可协商使用。

### $el

挂载完成前 `$el` 为 `undefined`。单元素根指向该元素，文本根指向文本节点，多根组件则只是 Vue
用于定位组件范围的文本或 hydration 注释占位节点。它不是稳定业务 DOM 契约；聚焦、测量和
第三方库接入应使用目标元素的模板引用。

### $options

`$options` 是实例化当前组件时的已解析选项。存在全局 mixin、`extends` 或组件级 mixin 时，
运行时按 Options 合并策略生成结果；没有任何合并来源时可直接返回原始组件选项。它适合读取经
`app.config.optionMergeStrategies` 处理的自定义 option，不适合在实例运行后动态改写组件定义。

固定实现按组件类型缓存合并结果，而不是为每个实例复制一份。写入 `$options.foo` 既不重新执行
初始化，也可能形成跨实例共享的隐式状态。

### $parent 与 $root

顶层组件的 `$parent` 为 `null`；`$root` 指向当前组件树根实例，根组件的 `$root` 是它自己。
固定实现会沿父链取得可公开的有状态组件实例，并尊重对方的 expose 边界。它们适合调试、迁移
或受控框架集成的逃生口，不应成为跨层业务通信协议；插入包装组件就可能改变 `$parent` 关系。

### $slots

`$slots` 的 key 是插槽名，值是接收 slot props 并返回 VNode 数组的函数；默认插槽位于
`this.$slots.default`。可以用 `this.$slots.header` 检测父级是否提供该插槽，但需要内容时必须
在渲染期间调用 `this.$slots.header?.({ title: '标题' })`，不能把函数本身当作 VNode 数组。

### $refs

`$refs` 由渲染器维护，包含模板 `ref` 对应的 DOM 元素或子组件公共实例。首次挂载前目标不存在；
条件卸载后会清空，非空值在 post-render 阶段写入。它不是可供 `watch()` 跟踪的业务响应式状态。
`v-for` 下同名 ref 可能得到数组，且官网不保证数组顺序与源数组一致。

子组件 ref 只提供该组件的公开实例。`<script setup>` 子组件的局部绑定默认不可见；需要命令式
能力时由子组件用 `defineExpose()` 暴露 `focus()`、`reset()` 等窄方法。

### $attrs

`$attrs` 包含未被 props 或 emits 声明消费的 attributes 与监听器。attribute key 保留原始
大小写，例如 `foo-bar` 要用 `this.$attrs['foo-bar']`；`@click` 以 `onClick` 暴露。对象始终
反映最新输入，但官方明确它不是响应式对象，不能以 watcher 监听其字段。需要响应性时声明 prop；
只需在更新后执行副作用时，在 `updated` 中读取最新值。

`inheritAttrs: false` 只关闭自动根节点继承，不会清空 `$attrs`。多根或包装组件应把它显式绑定
到真正承载语义的元素。

### $watch()

`$watch()` 命令式创建当前实例作用域内的侦听器，并返回停止句柄。字符串来源只支持属性名或由
点分隔的简单路径，例如 `'profile.name'`；索引、可选链和计算表达式必须改用 getter。getter 与
callback 都以当前公开实例为 `this`。`immediate`、`deep`、`flush`、`onTrack` 和 `onTrigger`
沿用 `watch()` 语义。

实例卸载会停止所属作用域中的 watcher；业务条件提前结束时仍应立即调用返回句柄，避免无效工作。
对象嵌套变化是否触发取决于来源和 `deep`，不能因使用实例入口就默认深度侦听。

### $emit()

`$emit(event, ...args)` 只通知当前组件调用点上的匹配监听器，不沿组件树冒泡。事件应在 `emits`
中声明，以获得类型、开发期未声明事件提示、参数校验以及 attrs listener 的正确消费边界。
模板监听推荐 kebab-case，代码中可用 camelCase 触发；不要把这种名称归一化理解成任意字符串
都等价。

固定实现按普通 handler 与 `.once` handler 查找调用点 props；实例卸载后 emit 直接退出。公开
签名返回 `void`，不能依赖父级 listener 的返回值建立请求响应协议。

### $forceUpdate()

`$forceUpdate()` 把当前组件更新 job 放入调度队列；同一轮重复请求会被队列去重，因此它不是
同步重绘命令。官方只建议在刻意使用高阶响应式 API 创建了非响应式组件状态时作为极少使用的
逃生口。它不会把普通对象变成响应式数据，也不能替代正确声明 ref / reactive / shallowRef。

### $nextTick()

`$nextTick()` 是绑定当前公开实例的全局 `nextTick()`。它等待当前 Vue 更新 flush；若传回调，
唯一实例差异是回调 `this` 指向当前组件。Promise 写法更适合串联：先修改响应式状态，再
`await this.$nextTick()` 读取本轮更新后的 DOM。

它不保证网络请求、计时器、CSS transition 或浏览器绘制已经结束。没有状态变更时调用也不会
凭空触发组件更新；需要等待实际绘制应选择对应浏览器时机，而不是循环调用 `$nextTick()`。

## 相关站内页面

| 本批锚点 | 应关联的现有页面 | 关联原因 |
| --- | --- | --- |
| `$data` | `vue.core.reference.options-api.state-options` | 对照 `data()` 的创建、代理与响应式边界 |
| `$props` | `vue.core.reference.components.props` | 复用声明、校验和单向数据流完整说明 |
| `$el`、`$refs` | `vue.core.reference.composition.template-refs` | 推荐的 DOM / 子组件引用与挂载时机 |
| `$options` | `vue.core.reference.application.application-configuration` | 自定义 option merge strategy 与合并来源 |
| `$slots` | `vue.core.reference.components.slots` | 插槽函数、作用域与渲染时调用 |
| `$attrs` | `vue.core.reference.components.attrs` | 透传消费、inheritAttrs 与多根落点 |
| `$watch()` | `vue.core.reference.reactivity-watchers.watch` | watcher 来源、清理、深度与 flush 完整教学 |
| `$emit()` | `vue.core.reference.components.emits` | 事件声明、校验、命名与监听器消费 |
| `$nextTick()` | `vue.core.reference.application.next-tick` | DOM 更新批次和 Promise 入口 |

`$parent`、`$root` 和 `$forceUpdate()` 不强造对应教程；正文明确它们是逃生口即可。

## 结构化易错点候选

正文建议保留以下 10 项。每项都应包含原因、可观察后果、错误示范和正确示范；不要拆成 13 个
机械条目，也不要为了数量重复现有专题页的完整教程。

### 1. 替换只读公共属性，或把生产期少警告当成可写契约

- 原因：`$data`、`$props`、`$attrs`、`$refs` 等属性本身由公共实例代理管理；仅 `$data`
  内部字段允许正常响应式修改。
- 后果：开发环境警告或严格模式抛错；生产构建即使没有相同提示，写入也不是受支持行为。

```js
// 错误
this.$data = { count: 1 }
this.$props.title = '新标题'
this.$refs = {}

// 正确
this.count = 1
this.$emit('update:title', '新标题')
```

### 2. 在挂载前读取 `$el`，或把多根 `$el` 当作业务元素

- 原因：挂载前没有 DOM；多根组件的 `$el` 只是位置占位节点。
- 后果：得到 `undefined`、文本/注释节点，调用 `focus()`、`getBoundingClientRect()` 失败或作用于
  错误目标。

```js
// 错误
created() {
  this.$el.focus()
}

// 正确：模板中 <input ref="searchInput">
mounted() {
  this.$refs.searchInput?.focus()
}
```

### 3. 修改 `$options` 并期待当前实例重新初始化

- 原因：合并选项按组件类型缓存，data、watch、computed 与生命周期已经完成初始化。
- 后果：当前实例行为不更新，还可能把共享组件定义变成跨实例隐式状态。

```js
// 错误
this.$options.watch = { status: this.handleStatus }

// 正确
this.stopStatusWatch = this.$watch('status', this.handleStatus)
```

### 4. 用 `$parent` / `$root` 读取任意内部状态，并假定层级永远不变

- 原因：包装组件会改变父链；对方可以用 `expose` / `defineExpose()` 收窄公开面，
  `<script setup>` 局部绑定默认不公开。
- 后果：重构布局或迁移组件写法后字段变成 `undefined`，形成难以追踪的跨层耦合。

```js
// 错误
this.$root.currentUser = nextUser
this.$parent.formState.submit()

// 正确
this.$emit('submit', payload)
// 跨层依赖使用 provide/inject；命令式 ref 只调用子组件显式 expose 的 submit()。
```

### 5. 把 `$slots.default` 当作 VNode 数组，或在渲染之外提前调用

- 原因：插槽是由父组件提供的函数，依赖应在子组件渲染期间被收集。
- 后果：访问数组方法报错，或依赖跟踪与更新时机不符合预期。

```js
// 错误
const first = this.$slots.default[0]
created() {
  this.cachedNodes = this.$slots.default?.()
}

// 正确：render 中调用
render() {
  return h('section', this.$slots.default?.() ?? [])
}
```

### 6. 在首次渲染读取 `$refs`，或侦听 `$refs` 等待目标出现

- 原因：引用由渲染器在目标挂载后写入，不是业务响应式状态；条件卸载时还会回到空值。
- 后果：首次得到 `undefined`，watcher 不触发，或保留已经卸载的目标假设。

```js
// 错误
watch: {
  '$refs.input'(input) {
    input.focus()
  },
}

// 正确
mounted() {
  this.$refs.input?.focus()
}
// 更新条件目标后先 await this.$nextTick()，再重新判空读取。
```

### 7. 把 `$attrs` 当响应式对象，或按 camelCase 猜 attribute key

- 原因：attrs 始终提供最新内容但不具备可侦听响应性；普通 attribute 保留原始 key，监听器才
  以 `onXxx` 形式出现。
- 后果：watcher 永不按预期触发，读取 `fooBar` 得到 `undefined`，或漏转发监听器。

```js
// 错误
this.$watch(() => this.$attrs.fooBar, this.syncFoo)

// 正确
updated() {
  this.syncFoo(this.$attrs['foo-bar'])
}
// 真正需要响应式依赖时，把 foo-bar 声明为 prop。
```

### 8. 给 `$watch()` 传表达式字符串，或忘记提前停止临时侦听

- 原因：字符串来源只支持属性名和简单点路径；复杂读取要使用 getter。实例卸载虽会清理
  watcher，但业务条件结束不会自动提前停止。
- 后果：观察到错误路径或永不触发；关闭面板后仍持续执行昂贵副作用。

```js
// 错误
this.$watch('items[selectedIndex].price', this.recalculate)

// 正确
const stop = this.$watch(
  () => this.items[this.selectedIndex]?.price,
  this.recalculate,
)
// 此项业务不再需要时调用 stop()。
```

### 9. 认为 `$emit()` 会冒泡，或不声明 emits 就手动触发同名原生事件

- 原因：组件事件只匹配直接调用点监听器。未声明的 listener 还可能留在 `$attrs` 并透传到根
  DOM，与手动 `$emit('click')` 造成一次交互触发两次。
- 后果：祖先监听不到跨层事件，或父 handler 重复执行。

```js
// 错误：没有声明 click
emits: [],
methods: {
  handleClick() {
    this.$emit('click')
  },
}

// 正确
emits: ['click'],
methods: {
  handleClick() {
    this.$emit('click')
  },
}
```

### 10. 把 `$forceUpdate()` 当同步重绘，再用 `$nextTick()` 轮询外部任务

- 原因：force update 只是入队且会去重；next tick 只等待 Vue 当前 flush，不等待浏览器绘制、
  CSS 动画、计时器或网络。
- 后果：紧接着仍读到旧 DOM，或形成无意义微任务循环且没有修复非响应式状态。

```js
// 错误
this.externalState.count++
this.$forceUpdate()
const text = this.$el.textContent

// 正确：优先让状态进入响应式系统
this.count++
await this.$nextTick()
const text = this.$refs.counter?.textContent
```

## 源码推导与适用场景

以下是基于 `vuejs/core@v3.5.40` 的实现推导，不提升为跨版本 public contract：

1. `publicPropertiesMap` 把 13 项映射到内部实例字段或已绑定函数；公开代理的 set trap 拒绝覆盖
   `$data` 等保留 public property。开发期 `$props`、`$attrs`、`$slots`、`$refs` 还通过
   `shallowReadonly()` 暴露，但正文仍应以官网只读契约为准，而不是依赖构建模式差异。
2. `$data` 直接指向实例 data，`$props` 只指向已解析 props，说明两者不是“所有组件输入/状态”
   的汇总对象；setup bindings、未声明 attrs 和注入值各有独立通道。
3. `resolveMergedOptions()` 在存在全局 mixin、extends 或本地 mixins 时合并，并按组件类型缓存；
   `$options` 因而适合读取静态自定义 option 元数据，不适合承载每实例可变状态。
4. `getComponentPublicInstance()` 在存在 exposed 对象时使用 `exposeProxy`，先读显式公开成员，再
   回退内置 public properties；`$parent`、`$root` 与组件模板 ref 都经过这条公开边界。
5. `setRef()` 对非空目标安排 post-render 写入，对卸载清空不延后，并在组件目标上调用
   `getComponentPublicInstance()`；这解释了 `$refs` 的挂载、条件卸载和 expose 行为。
6. 插槽更新会规范化函数并删除过期 key；attrs 与 slots 由实例容器持续更新而不是替换为业务
   reactive state。适合在渲染期消费最新值，不适合在 created 中缓存 VNode 或 watch attrs。
7. `instanceWatch()` 对字符串点路径逐段取值，对函数 source 和 callback 绑定公开实例，并短暂
   设置当前实例后创建 watcher；因此 watcher 归属被调用实例的 effect scope，而不是调用者。
8. `emit()` 先按 emits 声明做开发期校验，再从调用点 props 解析普通与 `.once` handler；这从
   源码侧说明它是组件输出通道，不是 DOM 冒泡，也不是带返回值的同步 RPC。
9. `$forceUpdate()` 缓存一个把组件 update job 交给 `queueJob()` 的函数；调度器以 QUEUED 标志
   去重。同一 tick 连续调用不会形成同次数的同步 render，适合极少量非响应式边界补偿。
10. `$nextTick()` 绑定当前 proxy，并等待 `currentFlushPromise` 或已解决 Promise；它保证的是 Vue
    调度批次，而不是浏览器 paint。需要布局完成后的下一帧时应另用浏览器调度机制。

## 实施验收与停止边界

1. 只新增 `vue.core.reference.options-api.component-instance` 一篇 Reference，不新增 Demo。
2. 页面 `collection` 为 `options-api`；13 个 API 各有真实、唯一 heading anchor，manifest target
   全部指向同一 entry，页面正文完成前不得把状态切为 `available`。
3. 页面开头必须保留官方只读总边界，并明确 `<script setup>` 默认关闭内部绑定、
   `defineExpose()` / Options `expose` 决定子组件公开面。
4. 正文至少保留上述类型、13 项行为边界、10 个结构化易错点与源码推导；关联现有长文，避免
   再复制完整 Props、Emits、Slots、Attrs、Refs、Watch 与 nextTick 课程。
5. 本批完成后覆盖应为 `136 available / 70 planned / 206 total`，Options API 应为
   `46 available / 0 planned`；以实施时 catalog 测试的实时输出复核，不能只相信计划数字。
6. 实施时补一个 manifest 完整性断言，并运行全量质量 Gate；代表性移动端路径应验证 13 个
   heading、左侧切换后滚动归零、无横向溢出和控制台错误。
7. 第 35 批未达到覆盖计数、映射、内容、验证及 Standards / Spec `PASS / 0 finding` 前，不开始
   第 36 批内置指令。
