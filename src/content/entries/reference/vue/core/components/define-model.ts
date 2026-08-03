/**
 * 知识点：组件 v-model（defineModel）
 * 查证来源（2026-07-28）：
 * - https://cn.vuejs.org/api/sfc-script-setup.html#definemodel（签名、类型、修饰符与默认值警告）
 * - https://cn.vuejs.org/guide/components/v-model.html（底层协议、具名模型、多模型与修饰符）
 * - https://github.com/vuejs/docs/blob/main/src/guide/components/v-model.md（官方指南原始 Markdown）
 * - https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/defineModel.ts
 * - https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/useModel.ts
 * 查证工具：Vue 官方中文文档、Vue 官方 docs 原始 Markdown、vuejs/core v3.5.40 源码
 * Tavily 在当前工具集中不可用，已按仓库规则回退上述一手来源。
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'vue.core.reference.components.define-model',
  type: 'reference',
  title: '组件 v-model 与 defineModel()',
  summary:
    '用 Vue 3.4+ defineModel 声明默认或具名双向绑定，理解底层 prop/事件协议、修饰符和失同步边界',
  ecosystem: 'vue',
  module: 'core',
  collection: 'components',
  related: [
    'vue.core.reference.components.props',
    'vue.core.reference.components.emits',
    'vue.core.reference.reactivity.ref',
  ],
  tags: ['defineModel', 'v-model', 'modelValue', 'update:modelValue', '组件通信'],
  sources: [
    {
      title: 'Vue <script setup>：defineModel',
      url: 'https://cn.vuejs.org/api/sfc-script-setup.html#definemodel',
    },
    {
      title: 'Vue 组件 v-model 指南',
      url: 'https://cn.vuejs.org/guide/components/v-model.html',
    },
    {
      title: 'Vue 组件 v-model 指南原始 Markdown',
      url: 'https://github.com/vuejs/docs/blob/main/src/guide/components/v-model.md',
    },
    {
      title: 'Vue 3.5.40 defineModel.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/defineModel.ts',
    },
    {
      title: 'Vue 3.5.40 useModel.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/useModel.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-28',
  anchors: [
    '概述',
    '默认模型与底层协议',
    '具名模型与多个绑定',
    '修饰符与转换器',
    '受控与本地模式',
    '易错使用提示',
    '最小源码实现',
  ],
})

export default defineReference({
  meta,
  signature:
    'function defineModel<T, M extends PropertyKey = string, G = T, S = T>(options: ({ default: DefineModelDefault<T> } | { required: true }) & DefineModelRuntimeOptions<T, G, S>): ModelRef<T, M, G, S>\nfunction defineModel<T, M extends PropertyKey = string, G = T, S = T>(options?: DefineModelRuntimeOptions<T, G, S>): ModelRef<T | undefined, M, G | undefined, S | undefined>\nfunction defineModel<T, M extends PropertyKey = string, G = T, S = T>(name: string, options: ({ default: DefineModelDefault<T> } | { required: true }) & DefineModelRuntimeOptions<T, G, S>): ModelRef<T, M, G, S>\nfunction defineModel<T, M extends PropertyKey = string, G = T, S = T>(name: string, options?: DefineModelRuntimeOptions<T, G, S>): ModelRef<T | undefined, M, G | undefined, S | undefined>',
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        '`defineModel()` 是 Vue 3.4+ 仅用于 `<script setup>` 的编译器宏。它声明一个供父组件 `v-model` 使用的 prop 和对应的 `update:*` 事件，并返回可读写的 ref：读取反映模型 prop，写入会发出更新事件。它没有改变 props 向下、事件向上的数据流，只是收起了重复声明与可写 computed 的样板代码。',
    },
    { type: 'heading', content: '默认模型与底层协议' },
    {
      type: 'text',
      content:
        '不传名称时，模型 prop 是 `modelValue`，事件是 `update:modelValue`。父组件的 `<Child v-model="value" />` 等价于传入 `:model-value="value"` 并监听更新事件后给 value 赋值。`defineModel()` 返回 ref，可直接绑定原生输入或在脚本中写 `.value`；需要消除 `undefined` 类型时，可声明 `required: true`，或提供默认值并同时处理父子初始值一致性。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
const model = defineModel<string>({ required: true })
</script>

<template>
  <input v-model="model" />
</template>

<!-- 父组件 -->
<Child v-model="message" />`,
    },
    {
      type: 'demo',
      id: 'vue.core.reference.components.define-model.define-model-demo',
      description: '通过 modelValue 与 update:modelValue 协议演示父值和自定义输入组件的双向同步',
      playground: true,
    },
    { type: 'heading', content: '具名模型与多个绑定' },
    {
      type: 'text',
      content:
        "把字面量名称作为第一个参数即可声明具名模型：`defineModel('title')` 对应 `title` prop 与 `update:title` 事件，父组件使用 `v-model:title`。一个组件可以声明多个不同名称的模型，每个模型拥有独立 prop 与更新事件；同名模型不能重复声明。名称是组件公共协议的一部分，应保持稳定并采用与父模板一致的命名。",
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
const firstName = defineModel<string>('firstName', { required: true })
const lastName = defineModel<string>('lastName', { required: true })
</script>

<template>
  <input v-model="firstName" />
  <input v-model="lastName" />
</template>

<!-- 父组件 -->
<UserName v-model:first-name="first" v-model:last-name="last" />`,
    },
    { type: 'heading', content: '修饰符与转换器' },
    {
      type: 'text',
      content:
        '解构 defineModel 的可迭代返回值可同时取得模型 ref 与修饰符记录。options 中的 `get` 和 `set` 转换器分别加工读取结果与发给父组件的值，适合实现自定义修饰符。转换器应保持轻量且可预测；它们改变的是模型边界上的值，不应在内部悄悄写入其他状态。TypeScript 可用第二个泛型参数约束允许的修饰符名称。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const [model, modifiers] = defineModel<string, 'capitalize'>({
  /** 根据父组件传入的修饰符转换待提交值。 */
  set(value) {
    return modifiers.capitalize
      ? value.charAt(0).toUpperCase() + value.slice(1)
      : value
  },
})`,
    },
    { type: 'heading', content: '受控与本地模式' },
    {
      type: 'text',
      content:
        '运行时 `useModel()` 只有在当前 vnode 同时收到模型 prop 和相应的 `onUpdate:*` 监听器时，才把写入视为父组件控制的 v-model：它发出更新事件，并等待新 prop 向下同步。缺少这对绑定时，模型 ref 会先更新本地值，同时仍 emit 更新事件。因此可选 v-model 的组件可以在未绑定时拥有本地状态；若组件必须受父级控制，应将模型声明为 required，并由父组件始终提供可写绑定。',
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '子组件设置默认值但父模型初始为 undefined',
          description:
            'defineModel 的 default 属于子组件 prop 默认值，不会在挂载时自动反向写入父 ref。官方明确提示这会造成初始失同步。',
          consequence:
            '子组件模型显示默认值，父组件仍持有 undefined，两侧在第一次写入前读到不同状态。',
          wrong: {
            lang: 'vue',
            content:
              '<!-- Child.vue -->\n<script setup>\nconst model = defineModel({ default: 1 })\n</script>\n\n<!-- Parent.vue -->\n<script setup>\nconst count = ref()\n</script>\n<Child v-model="count" />',
          },
          correct: {
            lang: 'vue',
            content:
              '<!-- Child.vue -->\n<script setup>\nconst model = defineModel({ required: true })\n</script>\n\n<!-- Parent.vue -->\n<script setup>\nconst count = ref(1)\n</script>\n<Child v-model="count" />',
          },
        },
        {
          title: '具名模型的父子名称不一致',
          description:
            "`defineModel('title')` 声明的是 title prop 与 update:title 事件；无参数的 `v-model` 使用 modelValue 协议，两者不是同一通道。",
          consequence: '子组件拿不到父值，写入时父组件也没有对应监听器接收更新。',
          wrong: {
            lang: 'vue',
            content:
              '<!-- Child.vue: const title = defineModel(\'title\') -->\n<Child v-model="bookTitle" />',
          },
          correct: {
            lang: 'vue',
            content:
              '<!-- Child.vue: const title = defineModel(\'title\') -->\n<Child v-model:title="bookTitle" />',
          },
        },
        {
          title: '把 model ref 当成脚本中的普通值',
          description:
            'defineModel 返回的是 Ref。模板会自动解包，但 JavaScript 和 TypeScript 中仍要通过 `.value` 读取或写入。',
          consequence: '运算作用在 ref 对象上，或尝试重新赋值 const 绑定，模型没有按预期更新。',
          wrong: {
            lang: 'ts',
            content: 'const count = defineModel<number>()\ncount++',
          },
          correct: {
            lang: 'ts',
            content: 'const count = defineModel<number>()\ncount.value = (count.value ?? 0) + 1',
          },
        },
        {
          title: '父组件传入只读表达式作为模型目标',
          description:
            '组件 v-model 要把事件载荷赋回父级目标。prop、getter 结果或复杂调用表达式没有可写的赋值位置。',
          consequence: '模板编译失败，或更新事件无法把新值写回真实数据源。',
          wrong: {
            lang: 'vue',
            content: '<Editor v-model="record.title.trim()" />',
          },
          correct: {
            lang: 'vue',
            content:
              '<Editor\n  :model-value="record.title.trim()"\n  @update:model-value="(value) => (record.title = value)"\n/>',
          },
        },
        {
          title: '转换器产生值但父组件拒绝或不回写',
          description:
            '受控 v-model 的子组件写入主要通过 `update:*` 请求父级更新。若父监听器不赋值、异步拒绝或改写为旧值，prop 仍以父级最终结果为准。',
          consequence:
            '输入控件可能短暂显示用户输入后又恢复，业务代码误以为写 model ref 已经永久提交。',
          wrong: {
            lang: 'vue',
            content:
              '<Child\n  :model-value="name"\n  @update:model-value="(value) => validate(value)"\n/>',
          },
          correct: {
            lang: 'vue',
            content:
              '<Child\n  :model-value="name"\n  @update:model-value="(value) => { if (validate(value)) name = value }"\n/>',
          },
        },
      ],
    },
    { type: 'heading', content: '最小源码实现' },
    {
      type: 'text',
      content:
        '编译器把 defineModel 记录为模型 prop，同时生成修饰符 prop 和 `update:<name>` 事件，并将宏调用改写为 `useModel(__props, name, options)`。`useModel()` 用 customRef 保存当前 prop 镜像，`watchSyncEffect` 在父值变化时同步并触发依赖。setter 先应用 set 转换器，再检查当前 vnode 是否同时存在模型 prop 和更新监听器：未绑定时直接更新本地值；无论哪种模式都会 emit 更新事件。源码还有转换值重复、父更新被去重等强制刷新的细节，这里只保留主路径。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// 精简自 vuejs/core v3.5.40 defineModel.ts、useModel.ts
/** 建立模型 prop 与 update 事件之间的可写 ref。 */
function useModel(props: Record<string, unknown>, name: string, options = {}) {
  const instance = getCurrentInstance()!

  return customRef((track, trigger) => {
    let localValue: unknown

    watchSyncEffect(() => {
      const propValue = props[name]
      if (hasChanged(localValue, propValue)) {
        localValue = propValue
        trigger()
      }
    })

    return {
      /** 追踪并返回当前模型值。 */
      get() {
        track()
        return options.get ? options.get(localValue) : localValue
      },
      /** 转换新值，并按绑定模式更新本地值或通知父组件。 */
      set(value) {
        const emittedValue = options.set ? options.set(value) : value
        const hasVModel = hasModelPropAndUpdateListener(instance, name)

        if (!hasVModel) {
          localValue = value
          trigger()
        }
        instance.emit(\`update:\${name}\`, emittedValue)
      },
    }
  })
}`,
    },
  ],
})
