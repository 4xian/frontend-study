/**
 * 知识点：Options API 渲染选项
 * 查证来源（2026-08-02）：
 * - https://cn.vuejs.org/api/options-rendering.html
 * - https://cn.vuejs.org/guide/best-practices/security.html#rule-no-1-never-use-non-trusted-templates
 * - https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/component.ts
 * - https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/vue/src/index.ts
 * - https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentSlots.ts
 * 查证工具：Vue 中文官网、vuejs/core v3.5.40 源码、类型声明与官方测试
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'vue.core.reference.options-api.rendering-options',
  type: 'reference',
  title: 'Options API：渲染选项',
  summary:
    '查询 template、render、组件级 compilerOptions 与 slots 类型声明的优先级、环境和安全边界',
  ecosystem: 'vue',
  module: 'core',
  collection: 'options-api',
  related: [
    'vue.core.reference.advanced.render-function',
    'vue.core.reference.application.application-configuration',
    'vue.core.reference.components.slots',
  ],
  tags: ['Options API', 'template', 'render', 'compilerOptions', 'SlotsType'],
  sources: [
    {
      title: 'Vue 渲染选项：template',
      url: 'https://cn.vuejs.org/api/options-rendering.html#template',
    },
    {
      title: 'Vue 渲染选项：render',
      url: 'https://cn.vuejs.org/api/options-rendering.html#render',
    },
    {
      title: 'Vue 渲染选项：compilerOptions',
      url: 'https://cn.vuejs.org/api/options-rendering.html#compileroptions',
    },
    {
      title: 'Vue 渲染选项：slots',
      url: 'https://cn.vuejs.org/api/options-rendering.html#slots',
    },
    {
      title: 'Vue 安全指南：永远不要使用不可信模板',
      url: 'https://cn.vuejs.org/guide/best-practices/security.html#rule-no-1-never-use-non-trusted-templates',
    },
    {
      title: 'Vue 3.5.40 组件渲染归一化',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/component.ts',
    },
    {
      title: 'Vue 3.5.40 运行时模板编译入口',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/vue/src/index.ts',
    },
    {
      title: 'Vue 3.5.40 插槽运行时实现',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentSlots.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-08-02',
  anchors: [
    '概述',
    'template',
    'render',
    'compilerOptions',
    'slots',
    '易错使用提示',
    '源码推导与适用场景',
  ],
})

export default defineReference({
  meta,
  signature: `interface ComponentOptions {
  template?: string
  render?(this: ComponentPublicInstance): VNodeChild
  compilerOptions?: {
    isCustomElement?: (tag: string) => boolean
    whitespace?: 'condense' | 'preserve'
    delimiters?: [string, string]
    comments?: boolean
  }
  slots?: SlotsType // Vue 3.3+，仅类型辅助
}`,
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        '这四个选项并不处在同一个运行阶段：`template` 等待编译，`render` 已经是可执行的渲染入口，`compilerOptions` 只配置浏览器中的运行时模板编译，而 `slots` 只承载 TypeScript 插槽声明。先判断项目使用预编译 SFC、runtime-only 构建还是完整构建，再选择对应选项。',
    },
    {
      type: 'table',
      headers: ['选项', '主要职责', '关键边界'],
      rows: [
        ['`template`', '声明待编译模板', '浏览器即时编译需要完整构建'],
        ['`render`', '返回 VNode 子树', '与 template 同时存在时优先'],
        ['`compilerOptions`', '调整当前组件的运行时编译', '不影响 Vite 已预编译的 SFC'],
        ['`slots`', '声明插槽类型', '运行时不会读取选项值'],
      ],
    },
    { type: 'heading', content: 'template' },
    {
      type: 'text',
      content:
        '`template` 接收由开发者控制的模板字符串。完整构建会在浏览器中把它编译成 render function；默认 Vite SFC 通常已在构建期完成编译，因此不依赖这条运行时路径。以 `#` 开头的值会查询对应 DOM 元素并读取其 `innerHTML`。根组件没有 template 和 render 时，浏览器挂载也可能读取容器现有的 `innerHTML`。',
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '绝不能编译用户输入、远端 HTML 或其他不可信内容。Vue 模板会变成 JavaScript；普通 HTML 转义不能把不可信模板变成安全代码。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { defineComponent } from 'vue'

export default defineComponent({
  /** 创建模板插值使用的实例状态。 */
  data() {
    return { name: 'Ada' }
  },
  // 仅在含运行时编译器的完整构建中即时编译
  template: '<p>你好，{{ name }}</p>',
})`,
    },
    {
      type: 'text',
      content:
        '若组件同时提供 `render`，`template` 不会再被编译。需要 CSP 禁止动态代码生成、较小客户端体积或稳定的生产构建时，优先使用预编译 SFC。',
    },
    { type: 'heading', content: 'render' },
    {
      type: 'text',
      content:
        '`render` 是编程式渲染入口，可在 runtime-only、完整构建和 SSR 中工作。普通 Options render 的 `this` 指向组件公共实例。SFC `<template>` 本身也会在构建期生成 render function；手写 render 主要适合高度动态的 VNode 组合，完整 VNode 规则请继续查阅关联的“渲染函数与 VNode”页面。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { defineComponent, h } from 'vue'

export default defineComponent({
  props: {
    label: { type: String, required: true },
  },
  /** 根据公开 props 生成唯一的 VNode 子树。 */
  render() {
    return h('button', { type: 'button' }, this.label)
  },
})`,
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '`setup()` 返回渲染函数时，该函数会先成为实例 render。不要再叠加 Options render 或 template；一个组件只保留一个清晰的渲染入口。',
    },
    { type: 'heading', content: 'compilerOptions' },
    {
      type: 'text',
      content:
        '组件级 `compilerOptions` 包含 `isCustomElement`、`whitespace`、`delimiters` 和 `comments`。它只影响当前组件尚待运行时编译的 template，并按字段覆盖 `app.config.compilerOptions`；未覆盖的应用级字段继续生效。Vue 3.1+ 提供该选项。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { defineComponent } from 'vue'

export default defineComponent({
  template: '<x-status>[[ state ]]</x-status>',
  compilerOptions: {
    delimiters: ['[[', ']]'],
    /** 将 x- 前缀元素交给浏览器自定义元素处理。 */
    isCustomElement: (tag) => tag.startsWith('x-'),
  },
  /** 创建运行时模板使用的实例状态。 */
  data() {
    return { state: 'ready' }
  },
})`,
    },
    {
      type: 'text',
      content:
        '上例只描述完整构建中的运行时编译。Vite 中的 `.vue` 文件已由构建插件编译，应在 `@vitejs/plugin-vue` 的 `template.compilerOptions` 配置编译行为；组件运行时选项无法回头改写已经生成的 render function。',
    },
    { type: 'heading', content: 'slots' },
    {
      type: 'text',
      content:
        'Vue 3.3+ 的 Options `slots` 是 `defineComponent()` 的类型辅助。推荐写成 `Object as SlotsType<...>`，使 setup context 和公共 `$slots` 获得插槽名称与 slot props 类型。该选项值不参与浏览器或 SSR 运行时；真实 slots 始终来自父 VNode children。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { defineComponent, h } from 'vue'
import type { SlotsType } from 'vue'

export default defineComponent({
  slots: Object as SlotsType<{
    default: { message: string }
    item: { id: number }
  }>,
  /** 从 setup context 读取真实运行时插槽。 */
  setup(_props, { slots }) {
    return () =>
      h('section', [
        slots.default?.({ message: '准备完成' }),
        slots.item?.({ id: 1 }),
      ])
  },
})`,
    },
    {
      type: 'text',
      content:
        '类型声明不能保证父组件一定传入某个 slot，因此运行时仍要判空。`defineSlots<T>()` 是另一个 SFC 编译宏；其返回值被使用时会编译为 `useSlots()`，不能据此推断 Options `slots` 也读取运行时内容。',
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '在 runtime-only 或 Vite SFC 中期待 template 即时编译',
          description: '浏览器运行时编译器只存在于完整构建中；Vite SFC 通常已在构建期生成 render。',
          consequence:
            '动态 template 无法渲染并在开发环境告警，运行时 compilerOptions 也不会改变已编译 SFC。',
          wrong: {
            lang: 'ts',
            content: `// 默认 Vite 客户端入口使用 runtime-only 路径
const RemoteCard = { template: remoteTemplate }`,
          },
          correct: {
            lang: 'vue',
            content: `<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template><article>{{ title }}</article></template>`,
          },
        },
        {
          title: '把不可信内容作为 Vue 模板',
          description: '模板表达式会被编译为 JavaScript，普通 HTML 转义无法覆盖模板语法执行边界。',
          consequence: '攻击者可能在应用上下文执行任意 JavaScript，SSR 中还可能影响服务端。',
          wrong: {
            lang: 'ts',
            content: `const UserCard = {
  template: '<section>' + userProvidedHtml + '</section>',
}`,
          },
          correct: {
            lang: 'vue',
            content: `<script setup lang="ts">
defineProps<{ userText: string }>()
</script>

<template><section>{{ userText }}</section></template>`,
          },
        },
        {
          title: '忽略 selector 与挂载容器也是模板来源',
          description:
            '`template: "#source"` 和无渲染入口的根挂载都可能读取已有 DOM 的 `innerHTML`。',
          consequence: '服务端或第三方写入 DOM 的数据可能被意外送入模板编译器。',
          wrong: {
            lang: 'ts',
            content: `// #remote-content 中混有未经信任的数据
const App = { template: '#remote-content' }`,
          },
          correct: {
            lang: 'ts',
            content: `// 模板由开发者固定，远端内容只作为普通数据
const App = {
  props: ['remoteText'],
  template: '<p>{{ remoteText }}</p>',
}`,
          },
        },
        {
          title: '同时写 render 和 template 并期待组合',
          description: '显式 render 会阻止 template 编译，Vue 不会合并两个渲染结果。',
          consequence: 'template 被忽略，源码中的标记与真实页面输出不一致。',
          wrong: {
            lang: 'ts',
            content: `const Card = {
  template: '<p>模板内容</p>',
  /** 错误地期待补充模板。 */
  render() { return h('button', '保存') },
}`,
          },
          correct: {
            lang: 'ts',
            content: `const Card = {
  /** 使用单一入口生成完整子树。 */
  render() {
    return h('article', [h('p', '正文'), h('button', '保存')])
  },
}`,
          },
        },
        {
          title: '混淆组件级与构建期 compiler options',
          description: '组件选项只参与完整构建的运行时模板编译；SFC 的编译发生在 Vite 插件中。',
          consequence: '配置在 Vite 页面中没有效果，或错误理解 app 与组件的覆盖优先级。',
          wrong: {
            lang: 'ts',
            content: `// 不能改变已经预编译的 App.vue
export default { compilerOptions: { comments: true } }`,
          },
          correct: {
            lang: 'ts',
            content: `// vite.config.ts
vue({
  template: { compilerOptions: { comments: true } },
})`,
          },
        },
        {
          title: '把 Options slots 当作运行时插槽数据',
          description:
            'Options `slots` 只承载 `SlotsType` 泛型，实际插槽来自父组件生成的 VNode children。',
          consequence: '从 `$options.slots` 读取不到父插槽，类型存在也不能保证运行时一定传入。',
          wrong: {
            lang: 'ts',
            content: `const Card = {
  slots: { default: () => '正文' },
  /** 错误地读取类型声明字段。 */
  render() { return this.$options.slots.default() },
}`,
          },
          correct: {
            lang: 'ts',
            content: `defineComponent({
  slots: Object as SlotsType<{ default: Record<string, never> }>,
  /** 从运行时 setup context 读取插槽。 */
  setup(_props, { slots }) {
    return () => slots.default?.({})
  },
})`,
          },
        },
      ],
    },
    { type: 'heading', content: '源码推导与适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '构建产物决定是否能即时编译',
          content:
            'Vue 3.5.40 由完整构建注册 runtime compiler；runtime-core 中该编译器可以不存在。因此 template 能力必须与实际构建产物一起判断，不能只看 import 是否来自 `vue`。',
        },
        {
          title: '动态模板属于代码执行边界',
          content:
            '`compileToFunction()` 对 selector 和 `innerHTML` 路径明确标记不安全，并最终创建可执行 render。适合审计无构建页面、CMS 模板来源和挂载容器，不适合承载用户内容。',
        },
        {
          title: '渲染入口具有明确优先级',
          content:
            '组件完成设置时，已有实例 render 或显式 Component.render 都会跳过 template 编译。排查“模板未生效”时，先确认 setup 和 Options 是否已经提供 render。',
        },
        {
          title: '组件配置只覆盖运行时编译字段',
          content:
            '源码先合并应用 compiler options，再覆盖组件同名字段。适合完整构建中少数组件需要不同分隔符或 custom element 识别的情况，不是 SFC 构建配置替代品。',
        },
        {
          title: '插槽类型与插槽值分属两条路径',
          content:
            'Options 初始化不读取 `slots`，而 `initSlots()` 从 VNode children 建立运行时 slots。组件库可用 SlotsType 约束消费端，但运行逻辑仍须从 setup context、`useSlots()` 或 `$slots` 取值。',
        },
        {
          title: '选择最小且可验证的入口',
          content:
            '普通业务组件优先预编译模板；VNode 结构确实高度动态时才使用 render；只有可信模板必须在浏览器即时编译时才选择完整构建与 compilerOptions。',
        },
      ],
    },
  ],
  notes: [
    'template、render 与 compilerOptions 的运行环境结论绑定 Vue 3.5.40。',
    'Options slots 从 Vue 3.3 起提供，只承担类型辅助，不是运行时插槽注册表。',
  ],
})
