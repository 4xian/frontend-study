---
id: vue.core.reference.options-api.state-options
type: reference
title: Options API：状态选项
summary: 查询 Options API 的实例状态、输入、派生值、方法、侦听、组件事件与公开实例边界
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.reactivity.reactive
  - vue.core.reference.components.props
  - vue.core.reference.reactivity-watchers.computed
  - vue.core.reference.advanced.composables
  - vue.core.reference.reactivity-watchers.watch
  - vue.core.reference.components.emits
  - vue.core.reference.composition.template-refs
tags:
  - Options API
  - data
  - props
  - computed
  - methods
  - watch
  - emits
  - expose
appliesTo: Vue 3.5.40
verifiedAt: 2026-08-02
sources:
  - title: Vue Options API：状态选项
    url: https://cn.vuejs.org/api/options-state.html
  - title: Vue 3.5.40 状态选项应用与合并实现
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentOptions.ts
  - title: Vue 3.5.40 Props 解析与校验实现
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentProps.ts
  - title: Vue 3.5.40 Emits 规范化与派发实现
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentEmits.ts
  - title: Vue 3.5.40 Options API 官方测试
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/apiOptions.spec.ts
  - title: Vue 3.5.40 Props 官方测试
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/componentProps.spec.ts
  - title: Vue 3.5.40 Emits 官方测试
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/componentEmits.spec.ts
group: options-api
signature: |-
  type Data = Record<string, unknown>
  type ComputedGetter<T = unknown> = (
    this: ComponentPublicInstance,
    vm: ComponentPublicInstance,
    previous?: T,
  ) => T
  type ComputedSetter<T = unknown> = (this: ComponentPublicInstance, value: T) => void
  type WatchHandler<T = unknown> = (
    this: ComponentPublicInstance,
    value: T,
    oldValue: T | undefined,
    onCleanup: (cleanupFn: () => void) => void,
  ) => void
  type WatchOptionItem = string | WatchHandler | ObjectWatchOptionItem

  interface PropOptions<T = unknown> {
    type?: PropType<T> | true | null
    required?: boolean
    default?: T | ((rawProps: Data) => T)
    validator?: (value: unknown, props: Data) => boolean
  }

  interface ObjectWatchOptionItem {
    handler: WatchHandler | string
    immediate?: boolean
    deep?: boolean | number
    flush?: 'pre' | 'post' | 'sync'
    once?: boolean
  }

  interface ComponentOptions {
    data?(this: ComponentPublicInstance, vm: ComponentPublicInstance): Data
    props?: string[] | Record<string, PropType | PropOptions>
    computed?: Record<
      string,
      ComputedGetter | { get: ComputedGetter; set: ComputedSetter }
    >
    methods?: Record<string, (this: ComponentPublicInstance, ...args: any[]) => any>
    watch?: Record<string, WatchOptionItem | WatchOptionItem[]>
    emits?: string[] | Record<string, ((...args: any[]) => boolean) | null>
    expose?: string[]
  }
anchors:
  - 概述
  - data
  - props
  - computed
  - methods
  - watch
  - emits
  - expose
  - 易错使用提示
  - 源码推导与适用场景
---

# Options API：状态选项

## 概述

状态选项共同定义一个 Options API 组件实例的公开代理：`data` 提供本地响应式状态，`props` 接收父级输入，`computed` 声明缓存派生值，`methods` 提供命令，`watch` 处理状态变化副作用，`emits` 声明向父级发送的事件，`expose` 则收窄父级模板引用能够访问的成员。除 `props` 在更早阶段完成初始化外，Vue 3.5.40 按 methods、data、computed、watch 的顺序把状态能力应用到实例。

| Options API 选项 | 最接近的 Composition API 或通信页面 | 职责 |
| --- | --- | --- |
| data | reactive() | 创建每个实例独立的可变状态 |
| props | 组件 Props | 声明父到子的只读输入契约 |
| computed | computed() | 缓存由响应式依赖推导的值 |
| methods | 组合式函数 | 组织可被模板或其他选项调用的命令 |
| watch | watch() | 在指定状态变化后执行副作用 |
| emits | 组件 Emits | 声明并校验子到父的事件协议 |
| expose | 模板引用 | 限制父级通过组件引用访问的表面 |

## data

`data` 必须是同步函数，并返回一个对象。Vue 会在创建每个组件实例时以公开实例作为 `this` 调用它，再把返回对象传给 `reactive()`；因此嵌套对象也进入深层响应式转换，顶层字段可以通过 `this` 和模板直接访问。函数形式保证各实例得到独立状态。返回 Promise 或非对象不构成有效状态；以 `$` 或 `_` 开头的字段不会被代理到公开实例上。需要在组合式写法中表达相同状态时，参见 `reactive()` 页面。

~~~~ts
export default {
  /** 为每个计数器实例创建独立的响应式状态。 */
  data() {
    return {
      count: 0,
      profile: { name: 'Ada' },
    }
  },
}
~~~~

:::tip
`data()` 的返回对象是原始状态声明，不要依赖它与实例公开代理具有相同身份。业务代码通过 `this.count` 读写；需要组合式复用时，把状态创建放入 composable 并返回 `reactive()` 或 refs。
:::

## props

`props` 可以是名称数组，也可以是“名称到类型或选项对象”的映射。对象声明支持 `type`、`required`、`default` 和 `validator`。未传入且没有默认值的普通 prop 解析为 `undefined`，Boolean prop 另有缺省转换规则。数组、对象等可变默认值应由工厂函数逐实例创建；当 prop 的 `type` 是 `Function` 时，函数默认值本身作为值使用而不会被调用。默认值工厂接收原始 props；`validator(value, props)` 从 Vue 3.4 起还能读取已经解析的全部 props。两者都发生在组件实例完整创建前，不能依赖组件 `this`。完整的单向数据流与运行时声明边界参见“组件 Props”页面。

~~~~ts
export default {
  props: {
    mode: {
      type: String,
      default: 'all',
    },
    filters: {
      type: Object,
      /** 根据原始输入为每个实例创建独立默认值。 */
      default(rawProps: { mode?: string }) {
        return { mode: rawProps.mode ?? 'all' }
      },
    },
    pageSize: {
      type: Number,
      required: true,
      /** 只接受位于业务范围内的整数页容量。 */
      validator(value: number) {
        return Number.isInteger(value) && value >= 1 && value <= 100
      },
    },
  },
}
~~~~

:::warning
`type`、`required` 与 `validator` 的运行时校验属于开发期诊断；失败会产生 warning，而不是把输入自动修正为合法值。真正的安全校验应放在信任边界，组件校验用于尽早暴露调用错误。
:::

## computed

`computed` 的每个字段可以是只读 getter，也可以是包含 `get` 和 `set` 的可写对象。Vue 会把 getter 包装成 `computed()`：首次读取时求值并收集响应式依赖，依赖不变时复用缓存，依赖变化后在下一次读取时重算。getter-only 字段是只读的，赋值在开发环境会告警。getter 或 setter 需要访问实例时必须使用普通函数，由 Vue 把 `this` 绑定到公开实例。组合式写法和缓存细节参见 `computed()` 页面。

~~~~ts
export default {
  /** 创建用于姓名派生值的实例状态。 */
  data() {
    return { firstName: 'Ada', lastName: 'Lovelace' }
  },
  computed: {
    /** 根据姓名字段计算并缓存展示名称。 */
    fullName() {
      return `${this.firstName} ${this.lastName}`
    },
    displayName: {
      /** 读取当前展示名称。 */
      get() {
        return this.fullName
      },
      /** 把完整名称拆回可变的姓名字段。 */
      set(value: string) {
        ;[this.firstName, this.lastName] = value.split(' ')
      },
    },
  },
}
~~~~

## methods

`methods` 是名称到函数的映射。Vue 在应用选项时把每个函数绑定到组件公开实例，因此模板事件、生命周期钩子、computed 和 watch 都可以通过 `this.methodName()` 调用它。只在函数确实使用实例状态时依赖 `this`，且此时不能使用箭头函数，因为箭头函数保留定义位置的词法 `this`，Vue 无法重新绑定。可跨组件复用的状态与命令应提取为组合式函数，参见“组合式函数”页面。

~~~~ts
export default {
  /** 创建当前实例的保存状态。 */
  data() {
    return { saving: false }
  },
  emits: ['saved'],
  methods: {
    /** 保存当前草稿并向父组件报告结果。 */
    async saveDraft() {
      this.saving = true
      const savedDraft = await draftApi.save()
      this.$emit('saved', savedDraft.id)
      this.saving = false
    },
  },
}
~~~~

## watch

`watch` 的 key 是实例上的根属性名或简单点分隔路径，例如 `query`、`filters.status`；字符串不支持任意表达式、可选链或方括号索引。值可以是 methods 中的方法名字符串、直接函数、带 `handler` 的对象，或这些形态组成的数组。回调默认是惰性的，接收新值、旧值和清理注册函数；需要访问实例时使用普通函数。`immediate: true` 会在组件创建阶段立即执行一次，此时旧值是 `undefined`；`deep: true` 会遍历嵌套属性，Vue 3.5+ 也可用数字限制最大遍历深度。`flush` 默认为 `pre`，在组件自身 DOM 更新前执行；`post` 延后到自身 DOM 更新后，`sync` 则在响应式修改时同步执行且不批处理，应谨慎用于简单数据源。`once` 从 Vue 3.4 起可在首次变化后停止。需要 getter、多来源或更精确的响应式源时，使用组合式 `watch()`，参见其参考页面。

~~~~ts
export default {
  /** 创建当前搜索实例的查询条件。 */
  data() {
    return {
      query: '',
      page: 1,
      filters: { status: 'all' },
      sort: 'updated-at',
    }
  },
  methods: {
    /** 使用当前实例状态重新加载结果。 */
    loadResults() {
      return searchApi.load(this.query, this.page, this.filters, this.sort)
    },
    /** 记录排序字段的变化。 */
    recordSort(value: string) {
      analytics.track('sort-changed', value)
    },
  },
  watch: {
    query: 'loadResults',
    /** 页码变化时直接执行函数 handler。 */
    page() {
      this.loadResults()
    },
    'filters.status': {
      handler: 'loadResults',
      immediate: true,
    },
    sort: ['loadResults', { handler: 'recordSort', flush: 'post' }],
  },
}
~~~~

:::tip
深度侦听器因嵌套修改触发时，新值与旧值可能是同一个对象引用。需要比较变化前后的结构时，显式保存快照；不要把 `deep: true` 理解为 Vue 会自动深拷贝旧值。
:::

## emits

`emits` 可以是事件名数组，也可以是“事件名到校验函数或 `null`”的映射。组件通过 `this.$emit(event, ...args)` 派发；对象校验函数接收本次全部参数并返回 boolean。声明事件会建立清晰的组件通信契约，并让匹配的父级监听器不再作为普通透传 attribute 处理。Vue 3.5.40 只在开发环境运行校验；返回 `false` 会产生 warning，但源码随后仍继续解析并调用父级监听器，不会阻止派发。更完整的命名、监听和类型边界参见“组件 Emits”页面。

~~~~ts
export default {
  emits: {
    /** 校验提交事件携带的草稿标识。 */
    submit(draftId: number) {
      return Number.isInteger(draftId) && draftId > 0
    },
    cancel: null,
  },
  methods: {
    /** 向父组件派发已经通过业务检查的提交事件。 */
    submitDraft(draftId: number) {
      if (!Number.isInteger(draftId) || draftId <= 0) return
      this.$emit('submit', draftId)
    },
  },
}
~~~~

## expose

`expose` 只接收组件自身公开成员名称组成的数组。设置后，父组件通过模板引用或 `$parent` 只能访问列出的用户定义成员；空数组不公开任何用户定义成员，但 `$el`、`$emit` 等内置公共属性仍保留。它不会限制组件自己的模板或其他选项访问实例。为了避免 mixin 或 extends 隐式改变基组件的公开契约，Vue 3.5.40 在合并这些来源时直接忽略其中的 `expose` 并在开发环境告警，因此必须在最终基组件上声明。组合式组件的对应边界是 `setup()` 的 `expose()` 或 `<script setup>` 的 `defineExpose()`，参见“模板引用”页面。

~~~~ts
export default {
  expose: ['focus', 'reset'],
  /** 创建当前搜索框实例的查询状态。 */
  data() {
    return { query: '' }
  },
  methods: {
    /** 把焦点移动到组件内部的输入框。 */
    focus() {
      this.$refs.input.focus()
    },
    /** 清空公开可控的查询状态。 */
    reset() {
      this.query = ''
    },
    /** 仅供组件内部使用，不向父级公开。 */
    rebuildIndex() {
      searchIndex.rebuild()
    },
  },
}
~~~~

## 易错使用提示

:::pitfalls
### 把共享对象直接写成 data 选项

**触发条件：** 把共享对象直接写成 data 选项

**原因：** Vue 3 要求 `data` 是函数，并对每个实例的返回对象执行响应式转换；普通对象形式既不符合公开契约，也无法建立独立实例状态。

**后果：** 运行时会报告 data 选项必须是函数，组件状态不能按预期初始化；复用同一原始对象还会造成实例间状态污染。

**错误示例：**

~~~~ts
export default {
  data: { count: 0 },
}
~~~~

**正确写法：**

~~~~ts
export default {
  /** 为每个实例返回独立状态。 */
  data() {
    return { count: 0 }
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 在依赖 this 的 method 或 watch handler 中使用箭头函数

**触发条件：** 在依赖 this 的 method 或 watch handler 中使用箭头函数

**原因：** 箭头函数的 `this` 由定义位置决定，methods 和 watch 的实例绑定无法覆盖词法 `this`。

**后果：** `this.count` 可能是 `undefined`，点击或侦听回调触发时抛错，实例状态保持不变。

**错误示例：**

~~~~ts
methods: {
  /** 错误地使用无法接收组件实例 this 的箭头函数。 */
  increment: () => this.count++,
}
~~~~

**正确写法：**

~~~~ts
methods: {
  /** 增加当前组件实例的计数。 */
  increment() {
    this.count++
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 为对象或数组 prop 复用同一个默认值

**触发条件：** 为对象或数组 prop 复用同一个默认值

**原因：** 可变默认值若不是工厂函数，多个组件实例会拿到同一个对象引用；默认值阶段也没有可依赖的组件实例 `this`。

**后果：** 一个子组件修改嵌套字段后，其他实例可能观察到同一修改，数据来源难以追踪。

**错误示例：**

~~~~ts
props: {
  filters: { type: Object, default: { status: 'all' } },
}
~~~~

**正确写法：**

~~~~ts
props: {
  filters: {
    type: Object,
    /** 为每个组件实例创建独立默认筛选条件。 */
    default() {
      return { status: 'all' }
    },
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 computed getter 中执行请求或改写依赖

**触发条件：** 在 computed getter 中执行请求或改写依赖

**原因：** computed getter 面向可缓存的派生值，求值时机由读取和依赖失效决定，不是稳定的命令执行时机。

**后果：** 请求次数受渲染读取影响而不可预测；getter 改写自己的依赖还可能形成重复失效或更新循环。

**错误示例：**

~~~~ts
computed: {
  /** 错误地在求值期间执行副作用。 */
  result() {
    this.requestCount++
    return searchApi.load(this.query)
  },
}
~~~~

**正确写法：**

~~~~ts
computed: {
  /** 只推导请求参数。 */
  requestParams() {
    return { query: this.query, page: this.page }
  },
},
methods: {
  /** 在明确的命令边界执行请求。 */
  loadResults() {
    return searchApi.load(this.requestParams)
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 把表达式写进 watch 的字符串 key

**触发条件：** 把表达式写进 watch 的字符串 key

**原因：** Options API watch 的字符串 key 只解析根属性或简单点路径，不会编译算术表达式、可选链或数组索引。

**后果：** 依赖变化后 handler 不触发，页面仍显示旧结果且没有明确的业务错误。

**错误示例：**

~~~~ts
watch: {
  'items.length + page': 'loadResults',
}
~~~~

**正确写法：**

~~~~ts
computed: {
  /** 把多字段表达式声明为可侦听的实例属性。 */
  requestKey() {
    return `${this.items.length}:${this.page}`
  },
},
watch: {
  requestKey: 'loadResults',
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 emits validator 当成事件拦截器

**触发条件：** 把 emits validator 当成事件拦截器

**原因：** emits 校验只提供开发期契约诊断。返回 `false` 后 Vue 发出 warning，但仍继续调用匹配的父级监听器。

**后果：** 无效 payload 仍进入父组件，父级状态可能被错误数据更新。

**错误示例：**

~~~~ts
methods: {
  /** 错误地假定 emits 校验会拦截非法草稿。 */
  save(draft) {
    this.$emit('save', draft)
  },
}
~~~~

**正确写法：**

~~~~ts
methods: {
  /** 在派发前执行真正的业务校验。 */
  save(draft) {
    if (!isValidDraft(draft)) return
    this.$emit('save', draft)
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 mixin 或 extends 中声明 expose

**触发条件：** 在 mixin 或 extends 中声明 expose

**原因：** Vue 为保持公开实例契约可追踪，会在选项合并时忽略 mixin 与 extends 提供的 expose；该选项也只接受键数组。

**后果：** 父组件模板引用读不到预期方法，开发环境同时出现 expose 被忽略的 warning。

**错误示例：**

~~~~ts
const focusMixin = {
  expose: ['focus'],
  methods: {
    /** 聚焦内部输入框。 */
    focus() {
      this.$refs.input.focus()
    },
  },
}
~~~~

**正确写法：**

~~~~ts
export default {
  mixins: [focusMixin],
  expose: ['focus'],
}
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 源码推导与适用场景

:::steps
### 1. data：逐实例建立响应式状态

`applyOptions()` 以公开实例调用 `data()`，确认结果是对象后执行 `reactive(data)` 并保存到 `instance.data`。因此它适合组件私有、会参与渲染的可变状态；跨组件共享状态应使用显式 composable 或状态容器。

### 2. props：先解析默认值，再做开发校验

`componentProps.ts` 先规范化声明、执行并缓存默认值工厂，再在开发分支检查 required、type 与 validator。它适合定义父到子的输入协议；来自网络或用户的非可信数据仍需在业务边界校验。

### 3. computed：用组合式计算器承接实例 getter

`applyOptions()` 把 getter 和可选 setter 绑定到公开实例，再创建内部 `computed({ get, set })`，实例属性的读写转发到其 `.value`。因此它适合纯派生值，不适合请求、日志或状态同步。

### 4. methods：绑定一次公开实例命令

运行时遍历 methods，把每个函数的绑定结果写入组件上下文。它适合模板事件和组件内部命令；需要跨组件共享的依赖与行为应放入参数和返回值明确的组合式函数。

### 5. watch：把声明形态归一到 watch()

`createWatcher()` 为根字段或点路径创建 getter，再分别处理字符串、函数、对象和数组 handler，并把需要实例的函数绑定到公开实例后调用 `watch()`。它适合少量实例字段副作用；复杂来源应直接使用组合式 getter。

### 6. emits：诊断后继续派发

`componentEmits.ts` 先规范化数组或对象声明，在开发分支运行事件校验并告警，随后仍查找并调用父级 handler。它适合记录组件事件协议；真正要拒绝的数据必须在 `$emit()` 前完成业务判断。

### 7. expose：由基组件确定公开表面

`applyOptions()` 仅在 expose 为数组时为列出的 key 建立公开访问器；`mergeOptions()` 对 mixin/extends 的 expose 明确跳过。它适合拥有模板引用调用方的命令式组件，并应保持表面尽可能小。
:::
