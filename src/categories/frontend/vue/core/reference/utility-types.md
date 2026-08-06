---
id: vue.core.reference.advanced.utility-types
type: reference
title: TypeScript 工具类型速查
summary: 查询 Vue 常用公开工具类型，并区分静态推导、运行时行为与模块增强边界
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.components.props
  - vue.core.reference.reactivity.utils
  - vue.core.reference.advanced.composables
  - vue.core.reference.application.application-configuration
tags:
  - TypeScript
  - PropType
  - MaybeRef
  - ExtractPropTypes
  - 模块增强
  - CSSProperties
appliesTo: Vue 3.5.40
verifiedAt: 2026-08-03
sources:
  - title: Vue TypeScript 工具类型
    url: https://cn.vuejs.org/api/utility-types.html
  - title: Vue 3.5.40 Props 类型声明
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentProps.ts
  - title: Vue 3.5.40 Ref 类型与归一化实现
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/reactivity/src/ref.ts
  - title: Vue 3.5.40 组件公共实例类型
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentPublicInstance.ts
  - title: Vue 3.5.40 组件选项类型
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentOptions.ts
  - title: Vue 3.5.40 defineComponent 类型
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/apiDefineComponent.ts
  - title: Vue 3.5.40 JSX 样式类型
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-dom/src/jsx.ts
  - title: Vue 3.5.40 Props 提取类型测试
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages-private/dts-test/extractProps.test-d.ts
  - title: Vue 3.5.40 组件类型增强测试
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages-private/dts-test/componentTypeExtensions.test-d.tsx
group: advanced
signature: |-
  type PropType<T> = PropConstructor<T> | (PropConstructor<T> | null)[]
  type MaybeRef<T> = T | Ref<T> | ShallowRef<T> | WritableComputedRef<T>
  type MaybeRefOrGetter<T> = MaybeRef<T> | ComputedRef<T> | (() => T)
  type ExtractPropTypes<T> = /* 组件内部已解析的 props */
  type ExtractPublicPropTypes<T> = /* 父组件可传入的 props */
  interface ComponentCustomProperties {}
  interface ComponentCustomOptions {}
  interface ComponentCustomProps {}
  interface CSSProperties { [key: `--${string}`]: string | number | undefined }
anchors:
  - PropType<T>
  - MaybeRef<T>
  - MaybeRefOrGetter<T>
  - ExtractPropTypes<T>
  - ExtractPublicPropTypes<T>
  - ComponentCustomProperties
  - ComponentCustomOptions
  - ComponentCustomProps
  - CSSProperties
  - 易错使用提示
  - 源码推导与适用场景
---

# TypeScript 工具类型速查

## PropType&lt;T&gt;

`PropType<T>` 为运行时 props 声明补充精确的 TypeScript 类型，常用于 `Object`、`Array` 和 `Function` 构造器。它只改变静态推导：运行时仍按原构造器检查，不会验证对象字段或业务值域。本页覆盖的是官网列出的 9 个常用工具类型，不是 `vue` 的全部类型导出清单。

~~~~ts
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

interface Book {
  title: string
  year: number
}

const BookCard = defineComponent({
  props: {
    book: {
      type: Object as PropType<Book>,
      required: true,
    },
  },
})
~~~~

:::warning
来自网络、存储或用户输入的对象仍需在系统边界解析，或通过 prop 的 `validator` 做运行时校验；类型断言不会生成验证代码。
:::

## MaybeRef&lt;T&gt;

Vue 3.3+ 的 `MaybeRef<T>` 表示普通值或可解包的 ref。官网可用 `T | Ref<T>` 建立心智模型；Vue 3.5.40 的固定声明还显式包含 `ShallowRef<T>` 与 `WritableComputedRef<T>`。消费方应通过 `unref()` 统一读取，而不是假设参数一定有 `.value`。

~~~~ts
import { unref } from 'vue'
import type { MaybeRef } from 'vue'

/** 读取普通值或 ref 中的页容量。 */
function readPageSize(source: MaybeRef<number>) {
  return unref(source)
}
~~~~

## MaybeRefOrGetter&lt;T&gt;

Vue 3.3+ 的 `MaybeRefOrGetter<T>` 在普通值与 ref 之外，还接受只读 computed 和 `() => T` getter。它适合需要在调用时读取最新结果的 source 参数；应使用 `toValue()` 统一取值，因为 `unref()` 不会调用普通函数。

~~~~ts
import { toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

/** 在当前调用时机读取最新查询词。 */
function readQuery(source: MaybeRefOrGetter<string>) {
  return toValue(source).trim()
}
~~~~

## ExtractPropTypes&lt;T&gt;

`ExtractPropTypes<T>` 从运行时 props 选项提取组件内部收到的已解析类型。Boolean prop 与带默认值的 prop 在内部始终有值，显式 `required: true` 的 prop 也必填。选项对象通常以 `as const` 保留 `required` 等字面量信息。

~~~~ts
import type { ExtractPropTypes } from 'vue'

const options = {
  active: Boolean,
  label: { type: String, default: '未命名' },
  count: { type: Number, required: true },
} as const

type InternalProps = ExtractPropTypes<typeof options>
// { active: boolean; label: string; count: number }
~~~~

## ExtractPublicPropTypes&lt;T&gt;

Vue 3.3+ 的 `ExtractPublicPropTypes<T>` 描述父组件允许传入的 props。只有显式 `required: true` 才形成必填输入；Boolean prop 与带默认值的 prop 对父组件仍可省略。组件库发布输入契约时应使用 public 视角，不能复用内部已解析类型。

~~~~ts
import type { ExtractPublicPropTypes } from 'vue'

const options = {
  active: Boolean,
  label: { type: String, default: '未命名' },
  count: { type: Number, required: true },
} as const

type PublicProps = ExtractPublicPropTypes<typeof options>
// { active?: boolean; label?: string; count: number }
~~~~

## ComponentCustomProperties

通过 `declare module 'vue'` 增强 `ComponentCustomProperties`，可让 Options API 的 `this` 与组件公共实例识别 `app.config.globalProperties` 上的全局属性。增强文件必须是模块，且声明不会创建运行时值；插件或应用仍要执行实际安装。

~~~~ts
import { createApp } from 'vue'
import App from './App.vue'

interface AppService {
  readonly endpoint: string
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $service: AppService
  }
}

const app = createApp(App)
app.config.globalProperties.$service = { endpoint: '/api' }
~~~~

## ComponentCustomOptions

增强 `ComponentCustomOptions` 可让 `defineComponent()` 识别插件提供的自定义组件选项。该接口只提供类型入口；若选项要参与 mixin 或 `extends` 合并，应用还需在 `app.config.optionMergeStrategies` 中实现对应的运行时合并规则。

~~~~ts
import { defineComponent } from 'vue'

export {}

declare module 'vue' {
  interface ComponentCustomOptions {
    audit?: boolean
  }
}

const AuditedPanel = defineComponent({
  audit: true,
  template: '<section>审计面板</section>',
})
~~~~

## ComponentCustomProps

增强 `ComponentCustomProps` 会为所有组件的 TSX 调用加入允许的公共 prop，适合确实由框架层统一支持的全局属性。它不会把属性加入组件运行时 props，也不会替代具体组件的 `props` 声明。

~~~~ts
export {}

declare module 'vue' {
  interface ComponentCustomProps {
    traceId?: string
  }
}

const action = <ActionButton traceId="checkout" />
~~~~

## CSSProperties

`CSSProperties` 是 Vue runtime-dom 为 JSX 与 style 对象提供的封闭类型，继承 `csstype` 的 camelCase 与 hyphen-case 属性。Vue 3.5.40 已允许 `--${string}` 自定义属性，值为 `string | number | undefined`；其他未知键仍会触发拼写检查。它只约束类型，不会生成 CSS 或触发 SFC CSS 编译。

~~~~ts
import type { CSSProperties } from 'vue'

const panelStyle: CSSProperties = {
  backgroundColor: '#ffffff',
  'font-size': '14px',
  '--brand-color': '#42b883',
}
~~~~

## 易错使用提示

:::pitfalls
### 把 PropType&lt;T&gt; 当成深层运行时验证

**触发条件：** 把 PropType&lt;T&gt; 当成深层运行时验证

**原因：** `as PropType<Book>` 只为 TypeScript 提供 Book 类型，运行时的 `Object` 构造器只确认输入是对象。

**后果：** 字段缺失或值域错误的普通对象仍可能通过运行时检查，边界数据缺少真实保护。

**错误示例：**

~~~~ts
const book = { type: Object as PropType<Book> } // Vue 会验证 title 和 year
~~~~

**正确写法：**

~~~~ts
const book = {
  type: Object as PropType<Book>,
  /** 验证 Book 的关键字段和值域。 */
  validator(value: Book) {
    return value.title.length > 0 && value.year > 0
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 unref() 读取 MaybeRefOrGetter

**触发条件：** 用 unref() 读取 MaybeRefOrGetter

**原因：** `unref()` 只解开 ref；普通 getter 仍会作为函数原样返回，只有 `toValue()` 会调用它。

**后果：** 请求或计算逻辑拿到函数本身，而不是调用时的最新返回值。

**错误示例：**

~~~~ts
declare const source: MaybeRefOrGetter<number>
const value = unref(source)
~~~~

**正确写法：**

~~~~ts
declare const source: MaybeRefOrGetter<number>
const value = toValue(source)
~~~~

**验证方式：** 对照正确写法验证结果。

### 混淆内部与外部 Props 类型或丢失字面量

**触发条件：** 混淆内部与外部 Props 类型或丢失字面量

**原因：** 内部解析会补齐 Boolean 与默认值，父组件输入只把 `required: true` 视为必填；提取还依赖选项中的字面量。

**后果：** 公开契约错误要求父组件传入默认 prop，或组件内部重复处理本应已定义的值。

**错误示例：**

~~~~ts
const options = { label: { type: String, default: '默认值' } }
export type Props = ExtractPropTypes<typeof options>
~~~~

**正确写法：**

~~~~ts
const options = { label: { type: String, default: '默认值' } } as const
type InternalProps = ExtractPropTypes<typeof options>
export type PublicProps = ExtractPublicPropTypes<typeof options>
~~~~

**验证方式：** 对照正确写法验证结果。

### 声明了 Vue 增强却没有形成模块

**触发条件：** 声明了 Vue 增强却没有形成模块

**原因：** 增强应位于模块 `.ts` 或 `.d.ts` 文件中；没有 import 或 export 的声明文件可能遮蔽原模块或不按预期合并。

**后果：** Vue 原有导出类型消失，或增强直到消费组件时才暴露为未生效。

**错误示例：**

~~~~ts
// vue.d.ts
declare module 'vue' {
  interface ComponentCustomProperties { $service: Service }
}
~~~~

**正确写法：**

~~~~ts
// vue-extensions.d.ts
export {}

declare module 'vue' {
  interface ComponentCustomProperties { $service: Service }
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 混用 ComponentCustom&#42; 接口或只写类型不装运行时

**触发条件：** 混用 ComponentCustom&#42; 接口或只写类型不装运行时

**原因：** Properties、Options 与 Props 分别作用于实例属性、自定义选项和 TSX 公共 props，三者都是类型 seam。

**后果：** 代码能通过类型检查，运行时却读到 undefined，或用全局 TSX prop 掩盖组件漏声明输入。

**错误示例：**

~~~~ts
declare module 'vue' {
  interface ComponentCustomProps { $service: Service }
}
// 期待 this.$service 自动存在
~~~~

**正确写法：**

~~~~ts
declare module 'vue' {
  interface ComponentCustomProperties { $service: Service }
}
app.config.globalProperties.$service = service
~~~~

**验证方式：** 对照正确写法验证结果。

### 为 CSSProperties 加宽任意字符串索引

**触发条件：** 为 CSSProperties 加宽任意字符串索引

**原因：** Vue 3.5.40 已接受 `--${string}`，其余属性依靠 `csstype` 的封闭集合发现拼写错误。

**后果：** `[key: string]: any` 会吞掉错误属性名，重复旧版增强也会偏离当前固定类型。

**错误示例：**

~~~~ts
interface CSSProperties {
  [key: string]: any
}
~~~~

**正确写法：**

~~~~ts
const style: CSSProperties = {
  color: '#222222',
  '--brand-color': '#42b883',
}
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 源码推导与适用场景

:::steps
### 1. PropType&lt;T&gt; 最终仍映射到运行时构造器

`componentProps.ts` 将 `PropType<T>` 声明为一个或多个构造器；开发期 `assertType()` 遇到 `Object` 也只检查对象身份。它适合为受信业务对象补静态类型，不替代输入解析。

### 2. MaybeRef&lt;T&gt; 覆盖值与可写 ref

`ref.ts` 的固定声明显式联合普通值、`Ref`、`ShallowRef` 与 `WritableComputedRef`。它适合只需读取“值或可写 ref”的轻量组合式参数。

### 3. MaybeRefOrGetter&lt;T&gt; 支持惰性 source

同一文件再加入 `ComputedRef` 与 getter，`toValue()` 会先对函数求值。它适合按使用时机重新读取的 source，而不是必须立即快照的参数。

### 4. ExtractPropTypes&lt;T&gt; 表示内部已解析视角

`componentProps.ts` 的 `RequiredKeys` 将 Boolean 与带默认值的 prop 归入内部必有键。该类型适合 setup 与组件实现代码。

### 5. ExtractPublicPropTypes&lt;T&gt; 表示父组件输入视角

同一文件的 `PublicRequiredKeys` 只接受显式 `required: true`。该类型适合组件库公开输入，不能与内部提取类型互换。

### 6. ComponentCustomProperties 同时连接实例与全局属性配置

`componentPublicInstance.ts` 将它并入公共实例类型，`AppConfig.globalProperties` 也以它为基础。它适合插件安装后的 `$service` 类型，不适合没有运行时赋值的纯声明。

### 7. ComponentCustomOptions 扩展组件选项类型

`ComponentOptionsBase` 扩展该接口，因此自定义 option 能进入组件定义的编辑器与类型检查。mixin 或 extends 的实际合并仍由 `optionMergeStrategies` 决定。

### 8. ComponentCustomProps 进入 TSX 公共 Props

`defineComponent` 的 `PublicProps` 包含该接口，固定类型测试也从 TSX 与 `$props` seam 验证。它适合框架级全局 TSX 属性，不是业务组件 props 的捷径。

### 9. CSSProperties 保留封闭的属性检查

`jsx.ts` 继承 `csstype` 的两种属性命名，并只额外开放 `--${string}`。它适合 typed style object，不适合通过宽字符串索引关闭 CSS 拼写检查。
:::
