/**
 * 知识点：TypeScript 工具类型
 * 查证来源（2026-08-03）：
 * - https://cn.vuejs.org/api/utility-types.html
 * - https://github.com/vuejs/core/tree/fa2885d8c48768d26f1666a01bd540ffe3b20f9b
 * 查证工具：Tavily、Vue 中文官网、vuejs/core v3.5.40 固定提交源码与官方类型测试
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'vue.core.reference.advanced.utility-types',
  type: 'reference',
  title: 'TypeScript 工具类型速查',
  summary: '查询 Vue 常用公开工具类型，并区分静态推导、运行时行为与模块增强边界',
  ecosystem: 'vue',
  module: 'core',
  collection: 'advanced',
  related: [
    'vue.core.reference.components.props',
    'vue.core.reference.reactivity.utils',
    'vue.core.reference.advanced.composables',
    'vue.core.reference.application.application-configuration',
  ],
  tags: ['TypeScript', 'PropType', 'MaybeRef', 'ExtractPropTypes', '模块增强', 'CSSProperties'],
  sources: [
    {
      title: 'Vue TypeScript 工具类型',
      url: 'https://cn.vuejs.org/api/utility-types.html',
    },
    {
      title: 'Vue 3.5.40 Props 类型声明',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentProps.ts',
    },
    {
      title: 'Vue 3.5.40 Ref 类型与归一化实现',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/reactivity/src/ref.ts',
    },
    {
      title: 'Vue 3.5.40 组件公共实例类型',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentPublicInstance.ts',
    },
    {
      title: 'Vue 3.5.40 组件选项类型',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentOptions.ts',
    },
    {
      title: 'Vue 3.5.40 defineComponent 类型',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/apiDefineComponent.ts',
    },
    {
      title: 'Vue 3.5.40 JSX 样式类型',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-dom/src/jsx.ts',
    },
    {
      title: 'Vue 3.5.40 Props 提取类型测试',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages-private/dts-test/extractProps.test-d.ts',
    },
    {
      title: 'Vue 3.5.40 组件类型增强测试',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages-private/dts-test/componentTypeExtensions.test-d.tsx',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-08-03',
  anchors: [
    'PropType<T>',
    'MaybeRef<T>',
    'MaybeRefOrGetter<T>',
    'ExtractPropTypes<T>',
    'ExtractPublicPropTypes<T>',
    'ComponentCustomProperties',
    'ComponentCustomOptions',
    'ComponentCustomProps',
    'CSSProperties',
    '易错使用提示',
    '源码推导与适用场景',
  ],
})

export default defineReference({
  meta,
  signature: `type PropType<T> = PropConstructor<T> | (PropConstructor<T> | null)[]
type MaybeRef<T> = T | Ref<T> | ShallowRef<T> | WritableComputedRef<T>
type MaybeRefOrGetter<T> = MaybeRef<T> | ComputedRef<T> | (() => T)
type ExtractPropTypes<T> = /* 组件内部已解析的 props */
type ExtractPublicPropTypes<T> = /* 父组件可传入的 props */
interface ComponentCustomProperties {}
interface ComponentCustomOptions {}
interface ComponentCustomProps {}
interface CSSProperties { [key: \`--\${string}\`]: string | number | undefined }`,
  blocks: [
    { type: 'heading', content: 'PropType<T>' },
    {
      type: 'text',
      content:
        '`PropType<T>` 为运行时 props 声明补充精确的 TypeScript 类型，常用于 `Object`、`Array` 和 `Function` 构造器。它只改变静态推导：运行时仍按原构造器检查，不会验证对象字段或业务值域。本页覆盖的是官网列出的 9 个常用工具类型，不是 `vue` 的全部类型导出清单。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { defineComponent } from 'vue'
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
})`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '来自网络、存储或用户输入的对象仍需在系统边界解析，或通过 prop 的 `validator` 做运行时校验；类型断言不会生成验证代码。',
    },
    { type: 'heading', content: 'MaybeRef<T>' },
    {
      type: 'text',
      content:
        'Vue 3.3+ 的 `MaybeRef<T>` 表示普通值或可解包的 ref。官网可用 `T | Ref<T>` 建立心智模型；Vue 3.5.40 的固定声明还显式包含 `ShallowRef<T>` 与 `WritableComputedRef<T>`。消费方应通过 `unref()` 统一读取，而不是假设参数一定有 `.value`。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { unref } from 'vue'
import type { MaybeRef } from 'vue'

/** 读取普通值或 ref 中的页容量。 */
function readPageSize(source: MaybeRef<number>) {
  return unref(source)
}`,
    },
    { type: 'heading', content: 'MaybeRefOrGetter<T>' },
    {
      type: 'text',
      content:
        'Vue 3.3+ 的 `MaybeRefOrGetter<T>` 在普通值与 ref 之外，还接受只读 computed 和 `() => T` getter。它适合需要在调用时读取最新结果的 source 参数；应使用 `toValue()` 统一取值，因为 `unref()` 不会调用普通函数。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

/** 在当前调用时机读取最新查询词。 */
function readQuery(source: MaybeRefOrGetter<string>) {
  return toValue(source).trim()
}`,
    },
    { type: 'heading', content: 'ExtractPropTypes<T>' },
    {
      type: 'text',
      content:
        '`ExtractPropTypes<T>` 从运行时 props 选项提取组件内部收到的已解析类型。Boolean prop 与带默认值的 prop 在内部始终有值，显式 `required: true` 的 prop 也必填。选项对象通常以 `as const` 保留 `required` 等字面量信息。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import type { ExtractPropTypes } from 'vue'

const options = {
  active: Boolean,
  label: { type: String, default: '未命名' },
  count: { type: Number, required: true },
} as const

type InternalProps = ExtractPropTypes<typeof options>
// { active: boolean; label: string; count: number }`,
    },
    { type: 'heading', content: 'ExtractPublicPropTypes<T>' },
    {
      type: 'text',
      content:
        'Vue 3.3+ 的 `ExtractPublicPropTypes<T>` 描述父组件允许传入的 props。只有显式 `required: true` 才形成必填输入；Boolean prop 与带默认值的 prop 对父组件仍可省略。组件库发布输入契约时应使用 public 视角，不能复用内部已解析类型。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import type { ExtractPublicPropTypes } from 'vue'

const options = {
  active: Boolean,
  label: { type: String, default: '未命名' },
  count: { type: Number, required: true },
} as const

type PublicProps = ExtractPublicPropTypes<typeof options>
// { active?: boolean; label?: string; count: number }`,
    },
    { type: 'heading', content: 'ComponentCustomProperties' },
    {
      type: 'text',
      content:
        "通过 `declare module 'vue'` 增强 `ComponentCustomProperties`，可让 Options API 的 `this` 与组件公共实例识别 `app.config.globalProperties` 上的全局属性。增强文件必须是模块，且声明不会创建运行时值；插件或应用仍要执行实际安装。",
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { createApp } from 'vue'
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
app.config.globalProperties.$service = { endpoint: '/api' }`,
    },
    { type: 'heading', content: 'ComponentCustomOptions' },
    {
      type: 'text',
      content:
        '增强 `ComponentCustomOptions` 可让 `defineComponent()` 识别插件提供的自定义组件选项。该接口只提供类型入口；若选项要参与 mixin 或 `extends` 合并，应用还需在 `app.config.optionMergeStrategies` 中实现对应的运行时合并规则。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { defineComponent } from 'vue'

export {}

declare module 'vue' {
  interface ComponentCustomOptions {
    audit?: boolean
  }
}

const AuditedPanel = defineComponent({
  audit: true,
  template: '<section>审计面板</section>',
})`,
    },
    { type: 'heading', content: 'ComponentCustomProps' },
    {
      type: 'text',
      content:
        '增强 `ComponentCustomProps` 会为所有组件的 TSX 调用加入允许的公共 prop，适合确实由框架层统一支持的全局属性。它不会把属性加入组件运行时 props，也不会替代具体组件的 `props` 声明。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `export {}

declare module 'vue' {
  interface ComponentCustomProps {
    traceId?: string
  }
}

const action = <ActionButton traceId="checkout" />`,
    },
    { type: 'heading', content: 'CSSProperties' },
    {
      type: 'text',
      content:
        '`CSSProperties` 是 Vue runtime-dom 为 JSX 与 style 对象提供的封闭类型，继承 `csstype` 的 camelCase 与 hyphen-case 属性。Vue 3.5.40 已允许 `--${string}` 自定义属性，值为 `string | number | undefined`；其他未知键仍会触发拼写检查。它只约束类型，不会生成 CSS 或触发 SFC CSS 编译。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import type { CSSProperties } from 'vue'

const panelStyle: CSSProperties = {
  backgroundColor: '#ffffff',
  'font-size': '14px',
  '--brand-color': '#42b883',
}`,
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '把 PropType<T> 当成深层运行时验证',
          description:
            '`as PropType<Book>` 只为 TypeScript 提供 Book 类型，运行时的 `Object` 构造器只确认输入是对象。',
          consequence: '字段缺失或值域错误的普通对象仍可能通过运行时检查，边界数据缺少真实保护。',
          wrong: {
            lang: 'ts',
            content: 'const book = { type: Object as PropType<Book> } // Vue 会验证 title 和 year',
          },
          correct: {
            lang: 'ts',
            content:
              'const book = {\n  type: Object as PropType<Book>,\n  /** 验证 Book 的关键字段和值域。 */\n  validator(value: Book) {\n    return value.title.length > 0 && value.year > 0\n  },\n}',
          },
        },
        {
          title: '用 unref() 读取 MaybeRefOrGetter',
          description:
            '`unref()` 只解开 ref；普通 getter 仍会作为函数原样返回，只有 `toValue()` 会调用它。',
          consequence: '请求或计算逻辑拿到函数本身，而不是调用时的最新返回值。',
          wrong: {
            lang: 'ts',
            content: 'declare const source: MaybeRefOrGetter<number>\nconst value = unref(source)',
          },
          correct: {
            lang: 'ts',
            content:
              'declare const source: MaybeRefOrGetter<number>\nconst value = toValue(source)',
          },
        },
        {
          title: '混淆内部与外部 Props 类型或丢失字面量',
          description:
            '内部解析会补齐 Boolean 与默认值，父组件输入只把 `required: true` 视为必填；提取还依赖选项中的字面量。',
          consequence: '公开契约错误要求父组件传入默认 prop，或组件内部重复处理本应已定义的值。',
          wrong: {
            lang: 'ts',
            content:
              "const options = { label: { type: String, default: '默认值' } }\nexport type Props = ExtractPropTypes<typeof options>",
          },
          correct: {
            lang: 'ts',
            content:
              "const options = { label: { type: String, default: '默认值' } } as const\ntype InternalProps = ExtractPropTypes<typeof options>\nexport type PublicProps = ExtractPublicPropTypes<typeof options>",
          },
        },
        {
          title: '声明了 Vue 增强却没有形成模块',
          description:
            '增强应位于模块 `.ts` 或 `.d.ts` 文件中；没有 import 或 export 的声明文件可能遮蔽原模块或不按预期合并。',
          consequence: 'Vue 原有导出类型消失，或增强直到消费组件时才暴露为未生效。',
          wrong: {
            lang: 'ts',
            content:
              "// vue.d.ts\ndeclare module 'vue' {\n  interface ComponentCustomProperties { $service: Service }\n}",
          },
          correct: {
            lang: 'ts',
            content:
              "// vue-extensions.d.ts\nexport {}\n\ndeclare module 'vue' {\n  interface ComponentCustomProperties { $service: Service }\n}",
          },
        },
        {
          title: '混用 ComponentCustom* 接口或只写类型不装运行时',
          description:
            'Properties、Options 与 Props 分别作用于实例属性、自定义选项和 TSX 公共 props，三者都是类型 seam。',
          consequence:
            '代码能通过类型检查，运行时却读到 undefined，或用全局 TSX prop 掩盖组件漏声明输入。',
          wrong: {
            lang: 'ts',
            content:
              "declare module 'vue' {\n  interface ComponentCustomProps { $service: Service }\n}\n// 期待 this.$service 自动存在",
          },
          correct: {
            lang: 'ts',
            content:
              "declare module 'vue' {\n  interface ComponentCustomProperties { $service: Service }\n}\napp.config.globalProperties.$service = service",
          },
        },
        {
          title: '为 CSSProperties 加宽任意字符串索引',
          description:
            'Vue 3.5.40 已接受 `--${string}`，其余属性依靠 `csstype` 的封闭集合发现拼写错误。',
          consequence: '`[key: string]: any` 会吞掉错误属性名，重复旧版增强也会偏离当前固定类型。',
          wrong: {
            lang: 'ts',
            content: 'interface CSSProperties {\n  [key: string]: any\n}',
          },
          correct: {
            lang: 'ts',
            content:
              "const style: CSSProperties = {\n  color: '#222222',\n  '--brand-color': '#42b883',\n}",
          },
        },
      ],
    },
    { type: 'heading', content: '源码推导与适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '1. PropType<T> 最终仍映射到运行时构造器',
          content:
            '`componentProps.ts` 将 `PropType<T>` 声明为一个或多个构造器；开发期 `assertType()` 遇到 `Object` 也只检查对象身份。它适合为受信业务对象补静态类型，不替代输入解析。',
        },
        {
          title: '2. MaybeRef<T> 覆盖值与可写 ref',
          content:
            '`ref.ts` 的固定声明显式联合普通值、`Ref`、`ShallowRef` 与 `WritableComputedRef`。它适合只需读取“值或可写 ref”的轻量组合式参数。',
        },
        {
          title: '3. MaybeRefOrGetter<T> 支持惰性 source',
          content:
            '同一文件再加入 `ComputedRef` 与 getter，`toValue()` 会先对函数求值。它适合按使用时机重新读取的 source，而不是必须立即快照的参数。',
        },
        {
          title: '4. ExtractPropTypes<T> 表示内部已解析视角',
          content:
            '`componentProps.ts` 的 `RequiredKeys` 将 Boolean 与带默认值的 prop 归入内部必有键。该类型适合 setup 与组件实现代码。',
        },
        {
          title: '5. ExtractPublicPropTypes<T> 表示父组件输入视角',
          content:
            '同一文件的 `PublicRequiredKeys` 只接受显式 `required: true`。该类型适合组件库公开输入，不能与内部提取类型互换。',
        },
        {
          title: '6. ComponentCustomProperties 同时连接实例与全局属性配置',
          content:
            '`componentPublicInstance.ts` 将它并入公共实例类型，`AppConfig.globalProperties` 也以它为基础。它适合插件安装后的 `$service` 类型，不适合没有运行时赋值的纯声明。',
        },
        {
          title: '7. ComponentCustomOptions 扩展组件选项类型',
          content:
            '`ComponentOptionsBase` 扩展该接口，因此自定义 option 能进入组件定义的编辑器与类型检查。mixin 或 extends 的实际合并仍由 `optionMergeStrategies` 决定。',
        },
        {
          title: '8. ComponentCustomProps 进入 TSX 公共 Props',
          content:
            '`defineComponent` 的 `PublicProps` 包含该接口，固定类型测试也从 TSX 与 `$props` seam 验证。它适合框架级全局 TSX 属性，不是业务组件 props 的捷径。',
        },
        {
          title: '9. CSSProperties 保留封闭的属性检查',
          content:
            '`jsx.ts` 继承 `csstype` 的两种属性命名，并只额外开放 `--${string}`。它适合 typed style object，不适合通过宽字符串索引关闭 CSS 拼写检查。',
        },
      ],
    },
  ],
  notes: [
    '本页覆盖 Vue 官方工具类型页面列出的 9 个常用类型，不代表 vue 包的全部类型导出。',
    'TypeScript 类型与模块增强会在编译后擦除；运行时安装、输入校验和选项合并必须分别实现。',
    '版本精确联合类型以 vue@3.5.40 固定源码为准，MaybeRef、MaybeRefOrGetter 与 ExtractPublicPropTypes 自 Vue 3.3+ 提供。',
  ],
})
