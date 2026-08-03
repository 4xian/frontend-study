/**
 * 知识点：插槽（slots / useSlots / defineSlots）
 * 查证来源（2026-07-28）：
 * - https://cn.vuejs.org/guide/components/slots.html
 * - https://cn.vuejs.org/api/sfc-script-setup.html#defineslots
 * - https://github.com/vuejs/docs/blob/main/src/guide/components/slots.md
 * - https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentSlots.ts
 * - https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/renderSlot.ts
 * 查证工具：Tavily（套餐用量上限，已回退）、Vue 官方文档、官方原始 Markdown、
 * vuejs/core v3.5.40 源码
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'vue.core.reference.components.slots',
  type: 'reference',
  title: '插槽 slots',
  summary:
    '由父组件提供模板片段，子组件通过默认、具名和作用域插槽决定渲染出口，并可用 useSlots / defineSlots 描述插槽接口',
  ecosystem: 'vue',
  module: 'core',
  collection: 'components',
  related: [
    'vue.core.reference.components.props',
    'vue.core.reference.components.emits',
    'vue.core.reference.composition.template-refs',
  ],
  tags: ['slots', 'v-slot', '作用域插槽', 'useSlots', 'defineSlots'],
  sources: [
    {
      title: 'Vue 插槽指南',
      url: 'https://cn.vuejs.org/guide/components/slots.html',
    },
    {
      title: 'Vue script setup：defineSlots 与 useSlots',
      url: 'https://cn.vuejs.org/api/sfc-script-setup.html#defineslots',
    },
    {
      title: 'Vue 插槽指南原始 Markdown',
      url: 'https://github.com/vuejs/docs/blob/main/src/guide/components/slots.md',
    },
    {
      title: 'Vue 3.5.40 componentSlots.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentSlots.ts',
    },
    {
      title: 'Vue 3.5.40 renderSlot.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/renderSlot.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-28',
  anchors: [
    '概述',
    '默认插槽与后备内容',
    '具名与条件插槽',
    '作用域插槽',
    'useSlots() 与 defineSlots()',
    '易错使用提示',
    '最小源码实现',
  ],
})

export default defineReference({
  meta,
  signature: 'type Slot<T = any> = (props: T) => VNode[]',
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        'props 传递 JavaScript 数据，插槽传递由父组件编写的模板片段。子组件用 `<slot>` 声明出口，父组件放在组件标签内的内容在该出口渲染。插槽内容在父组件作用域编译；子组件不能直接改变它能访问的变量，只能在调用插槽时通过 slot props 提供数据。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<!-- FancyButton.vue -->
<button class="fancy-button">
  <slot>提交</slot>
</button>

<!-- 父组件 -->
<FancyButton>保存</FancyButton>`,
    },
    { type: 'heading', content: '默认插槽与后备内容' },
    {
      type: 'text',
      content:
        '未命名的 `<slot>` 隐式名为 `default`。写在出口标签内部的内容是后备内容：父组件没有提供有效插槽内容时才渲染；父组件提供内容后，后备内容被替换。一个组件同时接收默认和具名插槽时，顶层且不在具名 `<template>` 内的节点会进入默认插槽。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<!-- SubmitButton.vue -->
<button type="submit">
  <slot>提交</slot>
</button>

<!-- 显示后备文本“提交” -->
<SubmitButton />

<!-- 显示父组件提供的“保存” -->
<SubmitButton>保存</SubmitButton>`,
    },
    { type: 'heading', content: '具名与条件插槽' },
    {
      type: 'text',
      content:
        '`<slot name="header">` 声明具名出口，父组件用 `<template #header>` 定向提供内容，`#` 是 `v-slot:` 的缩写。子组件可通过 `$slots.header` 判断父组件是否提供了对应插槽，再决定是否创建包裹元素；动态插槽名则使用 `#[expression]`，并遵守动态指令参数的表达式限制。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<!-- Card.vue -->
<article>
  <header v-if="$slots.header">
    <slot name="header" />
  </header>
  <slot />
</article>

<!-- 父组件 -->
<Card>
  <template #header>账户设置</template>
  <p>修改个人资料</p>
</Card>`,
    },
    { type: 'heading', content: '作用域插槽' },
    {
      type: 'text',
      content:
        '插槽内容仍属于父组件作用域。子组件若要把内部数据交给这段模板，应在 `<slot>` 出口上绑定属性；父组件通过 `v-slot` 接收这些 slot props。具名作用域插槽写作 `<template #item="{ body }">`。当默认作用域插槽与具名插槽混用时，默认插槽也必须放入显式的 `<template #default>`，否则作用域归属存在歧义并会编译失败。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<!-- FancyList.vue -->
<ul>
  <li v-for="item in items" :key="item.id">
    <slot name="item" v-bind="item" />
  </li>
</ul>

<!-- 父组件按自己的模板渲染子组件提供的数据 -->
<FancyList :items="items">
  <template #item="{ body, username }">
    <p>{{ body }} - {{ username }}</p>
  </template>
</FancyList>`,
    },
    {
      type: 'demo',
      id: 'vue.core.reference.components.slots.scoped-slots-demo',
      description: '同一个列表组件由父组件提供两种作用域插槽模板，展示数据与渲染职责分离',
      playground: true,
    },
    { type: 'heading', content: 'useSlots() 与 defineSlots()' },
    {
      type: 'text',
      content:
        '模板中可直接使用 `$slots`；`<script setup>` 中的 `useSlots()` 返回与 setup context 相同的插槽对象，每个插槽是接收 slot props、返回 VNode 数组的函数。`defineSlots()` 是编译器宏，只接受类型参数、不接受运行时参数；它为插槽名和 slot props 提供类型检查，并返回等价的 slots 对象。其函数返回类型在 Vue 3.5.40 中尚未用于检查插槽内容。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const slots = defineSlots<{
  default(props: { title: string }): any
  item(props: { id: number; body: string }): any
}>()

const hasItemSlot = Boolean(slots.item)`,
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '在父组件的插槽模板中直接读取子组件状态',
          description:
            '插槽内容按词法作用域在父组件中编译，只能直接读取父组件作用域。子组件内部的 item 不会因为模板最终在子组件出口渲染就自动可见。',
          consequence: '模板编译时报告属性不存在，或运行时读取到 undefined，列表项内容无法渲染。',
          wrong: {
            lang: 'vue',
            content: '<FancyList>{{ item.body }}</FancyList>',
          },
          correct: {
            lang: 'vue',
            content:
              '<FancyList :items="items">\n  <template #item="{ body }">{{ body }}</template>\n</FancyList>',
          },
        },
        {
          title: '把默认作用域的 v-slot 写在组件上，同时嵌套具名插槽',
          description:
            '组件级 `v-slot` 只适合单个默认插槽。它与内部具名插槽混用时，默认 slot props 是否应进入具名模板会产生歧义，官方示例明确说明这种写法不能编译。',
          consequence: 'SFC 模板编译失败，具名插槽与默认插槽都无法渲染。',
          wrong: {
            lang: 'vue',
            content:
              '<Panel v-slot="{ message }">\n  <p>{{ message }}</p>\n  <template #footer>页脚</template>\n</Panel>',
          },
          correct: {
            lang: 'vue',
            content:
              '<Panel>\n  <template #default="{ message }">{{ message }}</template>\n  <template #footer>页脚</template>\n</Panel>',
          },
        },
        {
          title: '在手写渲染函数中把 VNode 直接当作插槽值',
          description:
            '运行时插槽的标准形态是返回 VNode 数组的函数。`componentSlots.ts` 会兼容归一化非函数值，但开发环境会警告，并失去延迟执行带来的更新优化。',
          consequence: '控制台出现非函数插槽警告，插槽内容提前创建并带来不必要的更新工作。',
          wrong: {
            lang: 'ts',
            content: "h(Card, null, { default: h('p', '正文') })",
          },
          correct: {
            lang: 'ts',
            content:
              "// 在子组件渲染插槽时再创建内容。\nh(Card, null, { default: () => h('p', '正文') })",
          },
        },
        {
          title: '在渲染函数之外提前调用插槽函数',
          description:
            '`componentSlots.ts` 会警告在 render 之外调用的插槽不能正确追踪其中使用的响应式依赖。应在组件的渲染函数或模板出口中调用。',
          consequence: '插槽读取的响应式状态变化后，依赖没有按预期收集，界面可能不更新。',
          wrong: {
            lang: 'ts',
            content:
              "/** 在 setup 阶段提前执行默认插槽。 */\nsetup(_, { slots }) {\n  const content = slots.default?.()\n  return () => h('main', content)\n}",
          },
          correct: {
            lang: 'ts',
            content:
              "/** 返回在渲染阶段执行默认插槽的函数。 */\nsetup(_, { slots }) {\n  return () => h('main', slots.default?.())\n}",
          },
        },
        {
          title: '把 defineSlots() 当作运行时校验器',
          description:
            '`defineSlots()` 是会被编译移除的类型宏，不接收运行时参数。它能帮助 IDE 检查插槽名和 slot props，但不会在浏览器中验证父组件实际返回的内容。',
          consequence: '误以为生产环境会拒绝错误插槽内容，实际运行时没有这层校验。',
          wrong: {
            lang: 'ts',
            content: 'defineSlots({ item: { required: true } })',
          },
          correct: {
            lang: 'ts',
            content: 'defineSlots<{\n  item(props: { id: number; body: string }): any\n}>()',
          },
        },
      ],
    },
    { type: 'heading', content: '最小源码实现' },
    {
      type: 'text',
      content:
        'Vue 3.5.40 把插槽表示为返回 VNode 数组的函数。`initSlots()` 为实例创建 slots 对象：编译器生成的插槽可直接赋值，手写插槽对象则逐项归一化，非函数值会被包装为函数并在开发环境警告。模板中的 `<slot>` 编译为 `renderSlot()`；它以 slot props 调用对应函数，结果没有有效 VNode 时才调用后备函数。`useSlots()` 只是从当前组件的 setup context 返回同一 slots 对象。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// 精简自 vuejs/core v3.5.40 componentSlots.ts、renderSlot.ts
type Slot<T = any> = (props: T) => VNode[]

/** 将手写插槽对象归一化为函数插槽。 */
function normalizeObjectSlots(rawSlots: RawSlots, slots: InternalSlots) {
  for (const key in rawSlots) {
    if (isInternalKey(key)) continue
    const value = rawSlots[key]
    slots[key] = isFunction(value)
      ? normalizeSlot(key, value)
      : () => normalizeSlotValue(value)
  }
}

/** 初始化组件实例的插槽对象。 */
function initSlots(instance: ComponentInternalInstance, children: RawSlots) {
  const slots = (instance.slots = createInternalObject())
  if (children._) assignSlots(slots, children)
  else normalizeObjectSlots(children, slots)
}

/** 调用目标插槽，并在没有有效内容时渲染后备内容。 */
function renderSlot(slots: Slots, name: string, props = {}, fallback?: () => VNode[]) {
  const content = slots[name]?.(props)
  return ensureValidVNode(content) || fallback?.() || []
}`,
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '把插槽理解成“由父组件定义、由子组件在渲染期调用的函数”即可统一解释作用域、slot props、后备内容以及函数插槽的性能要求。',
    },
  ],
})
