/**
 * 知识点：模板原语
 * 查证来源（2026-08-03）：
 * - https://cn.vuejs.org/api/built-in-special-elements.html
 * - https://cn.vuejs.org/api/built-in-special-attributes.html
 * - https://cn.vuejs.org/guide/essentials/component-basics.html
 * - https://cn.vuejs.org/guide/essentials/list.html
 * - https://github.com/vuejs/core/tree/fa2885d8c48768d26f1666a01bd540ffe3b20f9b
 * 查证工具：Tavily、Vue 中文官网、vuejs/core v3.5.40 固定提交源码与官方测试
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'vue.core.reference.built-ins.template-primitives',
  type: 'reference',
  title: '模板原语',
  summary: '查询动态组件、无包装分组、VNode key 身份与原生元素 is 的公开边界',
  ecosystem: 'vue',
  module: 'core',
  collection: 'built-ins',
  related: [
    'vue.core.learn.intermediate.dynamic-components-keep-alive',
    'vue.core.learn.basics.component-basics',
    'vue.core.learn.basics.conditional-list-rendering',
    'vue.core.learn.advanced.render-functions-vnodes',
    'vue.core.learn.intermediate.transitions',
    'vue.core.learn.basics.template-syntax',
  ],
  tags: ['component', 'template', 'key', 'is', '动态组件', 'VNode 身份'],
  sources: [
    {
      title: 'Vue 内置特殊元素',
      url: 'https://cn.vuejs.org/api/built-in-special-elements.html',
    },
    {
      title: 'Vue 内置特殊 Attributes',
      url: 'https://cn.vuejs.org/api/built-in-special-attributes.html',
    },
    {
      title: 'Vue 组件基础：动态组件',
      url: 'https://cn.vuejs.org/guide/essentials/component-basics.html#dynamic-components',
    },
    {
      title: 'Vue 组件基础：DOM 内模板解析注意事项',
      url: 'https://cn.vuejs.org/guide/essentials/component-basics.html#in-dom-template-parsing-caveats',
    },
    {
      title: 'Vue 列表渲染：通过 key 管理状态',
      url: 'https://cn.vuejs.org/guide/essentials/list.html#maintaining-state-with-key',
    },
    {
      title: 'Vue 3.5.40 元素转换',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/transformElement.ts',
    },
    {
      title: 'Vue 3.5.40 组件解析',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/helpers/resolveAssets.ts',
    },
    {
      title: 'Vue 3.5.40 条件、列表与插槽转换',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/vIf.ts',
    },
    {
      title: 'Vue 3.5.40 VNode 身份',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/vnode.ts',
    },
    {
      title: 'Vue 3.5.40 渲染器',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/renderer.ts',
    },
    {
      title: 'Vue 3.5.40 子节点渲染测试',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/rendererChildren.spec.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-08-03',
  anchors: ['<component>', '<template>', 'key', 'is', '易错使用提示', '源码推导与适用场景'],
})

export default defineReference({
  meta,
  signature: `interface DynamicComponentProps {
  is: string | Component
}

<template v-if="condition">...</template>
type VNodeKey = number | string | symbol
<tr is="vue:my-row"></tr>`,
  blocks: [
    { type: 'heading', content: '<component>' },
    {
      type: 'text',
      content:
        '`<component>` 是模板编译期识别的元元素，通过 `is` prop 渲染动态组件或元素。`is` 接受原生 HTML 标签名、已注册组件名或组件定义；直接绑定导入的组件定义不需要再按名称注册。内置组件也可以作为定义传入，但字符串形式仍须能从当前组件注册上下文解析。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
import UserPanel from './UserPanel.vue'
</script>

<template>
  <component :is="UserPanel" />
  <component :is="activeTag" />
</template>`,
    },
    {
      type: 'text',
      content:
        '目标变化后，渲染器按新旧 VNode 的类型与 key 判断复用或替换。普通动态切换不会保留已失活组件实例；确实需要保留本地状态时，应由 `<KeepAlive>` 显式提供缓存。`<component>` 自身不是可注册、可获取实例的真实组件。',
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`<component>` 上的 `v-model` 按组件 `modelValue` / `update:modelValue` 协议编译。若运行时目标最终是原生 `input` 或 `select`，编译器不会再改写为原生控件协议；应使用静态原生控件，或显式绑定 value / checked 与对应事件。',
    },
    { type: 'heading', content: '<template>' },
    {
      type: 'text',
      content:
        '模板内的 `<template>` 只有同时使用 `v-if`、`v-else-if`、`v-else`、`v-for` 或 `v-slot` 时，才是不会生成真实 DOM 包装的分组占位符。`<template v-for>` 可以携带 key；其他 attribute 与指令没有真实元素承载，会被丢弃。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<template v-if="canEdit">
  <SaveButton />
  <CancelButton />
</template>

<template v-for="row in rows" :key="row.id">
  <RowEditor :row="row" />
  <RowActions :row-id="row.id" />
</template>`,
    },
    {
      type: 'text',
      content:
        '没有上述五类指令时，它会成为原生 HTML `<template>` 元素。SFC 最外层 `<template>` 则是文件格式的语言块容器，不属于组件模板 AST，也不接受这里的结构指令语义；两者名称相同，但位于不同编译层级。',
    },
    { type: 'heading', content: 'key' },
    {
      type: 'text',
      content:
        '`key` 的公开类型是 `number | string | symbol`，它为同一父级下的 VNode 提供身份；兄弟 key 必须唯一。没有 key 时，Vue 会尽量就地更新或复用同类型节点；提供 key 后，Vue 按身份重排，并卸载已经消失的项。',
    },
    {
      type: 'text',
      content:
        '同一位置的 key 改变会强制替换元素或组件，而不是就地更新，可用于有意重新触发生命周期或过渡。key 是渲染器保留字段，不会作为普通 prop 传给子组件。会插入、删除或重排的有状态列表应使用稳定业务 ID，不能用对象或漂移的 index 冒充身份。',
    },
    { type: 'heading', content: 'is' },
    {
      type: 'text',
      content:
        '`<component :is="target">` 的 `is` 是 Vue 元元素的动态目标 prop。原生 HTML 元素上的普通 `is` 首先属于 Web 平台 customized built-in element 机制；仅写 `<tr is="my-row">` 不会把 `my-row` 当成 Vue 组件。',
    },
    {
      type: 'table',
      headers: ['写法', '归属', '用途'],
      rows: [
        ['`<component :is="target">`', 'Vue 动态组件', '运行时切换组件定义、注册名或原生标签'],
        ['`<button is="plastic-button">`', 'Web 平台', 'customized built-in element'],
        ['`<tr is="vue:my-row">`', 'Vue 3.1+', '绕过 DOM 内模板的原生 HTML 解析限制'],
      ],
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '`vue:` 字面量前缀从 Vue 3.1 起用于原生宿主位置的 Vue 组件替换。这个版本边界不属于 Web 平台 customized built-in，也不表示 `<component :is>` 整体从 3.1 才可用。',
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '把组件变量名写成静态 is 字符串',
          description:
            '`is` 接受注册名字符串或组件定义；静态 `is="currentPanel"` 表示字面量注册名，不会读取同名脚本变量。',
          consequence: '运行时解析不到目标并出现组件解析警告，或把名称当成意外的原生标签。',
          wrong: {
            lang: 'vue',
            content: '<component is="currentPanel" />',
          },
          correct: {
            lang: 'vue',
            content: '<component :is="currentPanel" />',
          },
        },
        {
          title: '混淆动态 is、原生 is 与 vue: 前缀',
          description:
            '三者分别属于 Vue 元元素 prop、Web 平台 customized built-in 与 DOM 内模板组件替换。',
          consequence: '受 table 解析限制的组件不会出现，或平台自定义元素被误写成 Vue 组件。',
          wrong: {
            lang: 'vue',
            content: '<tr is="my-row"></tr>',
          },
          correct: {
            lang: 'vue',
            content: `<tr is="vue:my-row"></tr>
<component :is="MyRow" />`,
          },
        },
        {
          title: '期待动态原生控件自动获得原生 v-model 协议',
          description:
            '`<component>` 上的 model 在编译期已经选择组件协议，无法按运行时目标重新选择原生控件指令。',
          consequence: '目标解析为 input 或 select 后，用户输入不会按预期写回模型。',
          wrong: {
            lang: 'vue',
            content: `<component :is="'input'" v-model="username" />`,
          },
          correct: {
            lang: 'vue',
            content: '<input v-model="username" />',
          },
        },
        {
          title: '把任意 template 都当成无包装分组',
          description:
            '只有 `v-if`、`v-else-if`、`v-else`、`v-for` 和 `v-slot` 会触发 Vue 的特殊分组处理。',
          consequence:
            '普通 template 会成为 HTMLTemplateElement，class 与事件也不会分发给其子节点。',
          wrong: {
            lang: 'vue',
            content:
              '<template class="actions"><button>保存</button><button>取消</button></template>',
          },
          correct: {
            lang: 'vue',
            content:
              '<template v-if="canEdit"><button>保存</button><button>取消</button></template>',
          },
        },
        {
          title: '用重复、对象或漂移的 index key 表示列表身份',
          description:
            '公开 key 只支持字符串、数字或 symbol，并要求同父级唯一；index 会随列表重排改变归属。',
          consequence: '输入值、焦点、组件本地状态或过渡可能跟到错误的数据项。',
          wrong: {
            lang: 'vue',
            content: '<RowEditor v-for="(row, index) in rows" :key="index" :row="row" />',
          },
          correct: {
            lang: 'vue',
            content: '<RowEditor v-for="row in rows" :key="row.id" :row="row" />',
          },
        },
        {
          title: '无意改变 key 并强制重建组件',
          description: 'VNode 类型相同但 key 不同仍不是同一身份，渲染器会卸载旧树再挂载新树。',
          consequence: '本地状态、焦点和未保存输入丢失，生命周期与过渡也会重新触发。',
          wrong: {
            lang: 'vue',
            content: '<ProfileEditor :key="Math.random()" :profile="profile" />',
          },
          correct: {
            lang: 'vue',
            content: '<ProfileEditor :key="profile.id" :profile="profile" />',
          },
        },
      ],
    },
    { type: 'heading', content: '源码推导与适用场景' },
    {
      type: 'text',
      content:
        '以下结论来自 `vuejs/core@fa2885d8` 的固定源码与官方测试，只解释 Vue 3.5.40 的可观察结果；编译器 AST、VNode 私有字段与渲染器内部流程都不是 public API。',
    },
    {
      type: 'steps',
      items: [
        {
          title: '1. 动态目标先解析组件资产再保留字符串',
          content:
            '`transformElement.ts` 为 `<component :is>` 生成动态目标解析；`resolveAssets.ts` 对字符串先查组件资产，未命中时保留原字符串，因此同一入口既能落到注册组件，也能落到原生标签。它适合真实的运行时切换，不替代静态组件标签。',
        },
        {
          title: '2. 只有 vue: 静态前缀进入原生宿主的组件解析',
          content:
            '`transformElement.ts` 只在原生元素的静态 `is` 值以 `vue:` 开头时剥离前缀并走组件解析，官方 transform 测试同时固定动态组件代码生成；普通 platform `is` 不能与 Vue 动态 prop 互换。',
        },
        {
          title: '3. 五类 template 分组会转成对应渲染结构',
          content:
            '`vIf.ts`、`vFor.ts` 与 `vSlot.ts` 分别把 template 分组转换为条件分支、fragment / renderList 和 slot 函数，对应测试覆盖多子节点与 template key。它们适合不增加布局 DOM 的指定结构场景。',
        },
        {
          title: '4. VNode 类型与 key 共同决定身份',
          content:
            '`isSameVNodeType()` 同时比较 type 与 key；renderer 在身份不同时先卸载再挂载。因此 key 既能稳定重排，也能有意强制重建，但不应随机化为通用刷新手段。',
        },
        {
          title: '5. keyed children 测试固定重排与重复身份边界',
          content:
            '`rendererChildren.spec.ts` 覆盖 append、prepend、move、remove 与 duplicate key，`vFor.spec.ts` 固定 `<template v-for>` 的 key 注入。稳定业务 ID 最适合包含输入、焦点或子组件状态的集合。',
        },
      ],
    },
  ],
  notes: [
    '本页不新增 Demo；动态组件、KeepAlive、列表身份、VNode 与过渡练习复用相关课程。',
    '源码推导只解释 Vue 3.5.40 的可观察行为，不承诺内部编译与渲染实现稳定。',
  ],
})
