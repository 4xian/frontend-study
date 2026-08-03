/**
 * 课程：插槽
 * 查证日期：2026-07-31
 * 适用版本：Vue 3.5.40
 * 查证工具：Tavily、Vue 中文官网与 vuejs/core v3.5.40 固定标签源码和测试
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

export const meta = defineLessonMeta({
  id: 'vue.core.learn.intermediate.slots',
  type: 'lesson',
  title: '插槽',
  summary: '在父级渲染作用域中提供模板片段，并由子组件定义出口与状态能力边界',
  ecosystem: 'vue',
  module: 'core',
  collection: 'intermediate',
  level: 'intermediate',
  prerequisites: ['vue.core.learn.intermediate.template-refs'],
  related: [
    'vue.core.learn.intermediate.template-refs',
    'vue.core.learn.basics.component-basics',
    'vue.core.learn.basics.props',
    'vue.core.reference.components.slots',
  ],
  tags: ['插槽', 'v-slot', '作用域插槽', '$slots', 'useSlots', 'defineSlots'],
  sources: [
    {
      title: 'Vue 插槽指南',
      url: 'https://cn.vuejs.org/guide/components/slots.html',
    },
    {
      title: 'Vue v-slot 指令',
      url: 'https://cn.vuejs.org/api/built-in-directives.html#v-slot',
    },
    {
      title: 'Vue slot 特殊元素',
      url: 'https://cn.vuejs.org/api/built-in-special-elements.html#slot',
    },
    {
      title: 'Vue useSlots',
      url: 'https://cn.vuejs.org/api/composition-api-helpers.html#useslots',
    },
    {
      title: 'Vue defineSlots',
      url: 'https://cn.vuejs.org/api/sfc-script-setup.html#defineslots',
    },
    {
      title: 'Vue 3.5.40 componentSlots.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentSlots.ts',
    },
    {
      title: 'Vue 3.5.40 renderSlot.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/renderSlot.ts',
    },
    {
      title: 'Vue 3.5.40 vSlot.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/src/transforms/vSlot.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-31',
  estimatedMinutes: 50,
})

export default defineLesson({
  meta,
  objectives: [
    '解释父组件拥有插槽内容、子组件拥有插槽出口的职责边界',
    '说明插槽表达式属于父级渲染作用域',
    '使用默认插槽和 fallback 提供缺省内容',
    '用具名插槽和显式 #default 划分内容出口',
    '通过 slot props 接收子组件提供的状态与窄命令',
    '使用 $slots 判断插槽函数是否存在',
    '正确书写动态插槽名并遵守动态参数限制',
    '区分模板 $slots、运行时 useSlots() 与类型宏 defineSlots()',
    '用 defineSlots() 描述插槽名称和 slot props 类型',
    '根据 Vue 3.5.40 的实现证据判断 fallback 与动态插槽行为',
  ],
  blocks: [
    { type: 'heading', content: '正文大纲' },
    {
      type: 'text',
      content:
        '上一课已经学习怎样在必要时访问真实渲染目标。本课回到声明式组件组合：父组件提供模板片段，子组件决定片段出现在哪个出口，并明确哪些子状态和命令可以交给这段内容使用。',
    },
    {
      type: 'table',
      headers: ['部分', '核心问题', '完成标志'],
      rows: [
        ['内容与出口', '父子各自拥有什么', '能解释内容所有权和渲染作用域'],
        ['默认与具名', '片段进入哪个出口', '会使用 fallback、#name 和 #default'],
        ['作用域插槽', '子组件怎样提供能力', '只传值类型状态与窄命令'],
        ['条件与动态', '出口结构怎样随声明变化', '会用 $slots 和动态名称'],
        ['API 与类型', '模板、运行时和类型入口如何选择', '不会混用三个入口'],
        ['版本推导', '当前实现能说明什么', '不把内部行为写成公共承诺'],
      ],
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '本课只讲 SFC、<script setup lang="ts">、Composition API 与 Vue 3.5.40 中的插槽契约。重点是模板组合和清楚的状态所有权，不把插槽扩展成任意穿透组件内部状态的通道。',
    },
    { type: 'heading', content: '父组件拥有内容，子组件拥有出口' },
    {
      type: 'text',
      content:
        '先把插槽拆成两端：父组件写在组件标签之间的内容，是由父组件定义的模板片段；子组件模板中的 `<slot>` 是调用这段内容的出口。子组件决定出口位于按钮、面板还是其他结构中，但不会因此取得内容的所有权。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<!-- FancyButton.vue -->
<template>
  <button type="button" class="fancy-button">
    <slot />
  </button>
</template>

<!-- ParentView.vue -->
<template>
  <FancyButton>保存草稿</FancyButton>
</template>`,
    },
    {
      type: 'table',
      headers: ['位置', '所有者', '职责'],
      rows: [
        ['<FancyButton>保存草稿</FancyButton>', '父组件', '定义要提供的模板内容'],
        ['<slot />', '子组件', '决定内容的渲染出口'],
        ['最终按钮内部', '双方协作', '子结构包裹父级提供的片段'],
      ],
    },
    { type: 'heading', content: '插槽表达式仍属于父级渲染作用域' },
    {
      type: 'text',
      content:
        '插槽内容写在父组件模板中，所以其中的表达式只能直接读取父组件作用域。它最终出现在子组件 DOM 内，也不会自动看见子组件局部变量；这与 JavaScript 函数在定义位置决定可见变量的规则一致。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
const parentLabel = '来自父组件'
</script>

<template>
  <LearningPanel>
    <p>{{ parentLabel }}</p>
  </LearningPanel>
</template>`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '若 LearningPanel 内部还有 activeTopic，父级插槽不能直接读取它。子组件必须在 `<slot>` 出口上把允许读取的值显式传为 slot props。',
    },
    { type: 'heading', content: '默认插槽与 fallback' },
    {
      type: 'text',
      content:
        '没有 `name` 的 `<slot>` 隐式名为 `default`。写在出口标签内部的内容是 fallback：父级没有为该出口产生有效内容时，子组件才渲染它。fallback 定义在子组件中，因此其中的表达式读取子组件作用域。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<!-- SubmitButton.vue -->
<template>
  <button type="submit">
    <slot>提交</slot>
  </button>
</template>

<!-- 使用 fallback -->
<SubmitButton />

<!-- 父级内容替代 fallback -->
<SubmitButton>保存</SubmitButton>`,
    },
    {
      type: 'table',
      headers: ['父级写法', '出口结果', '内容所有者'],
      rows: [
        ['<SubmitButton />', '显示“提交”', '子组件 fallback'],
        ['<SubmitButton>保存</SubmitButton>', '显示“保存”', '父组件默认插槽'],
      ],
    },
    { type: 'heading', content: '具名插槽与显式 default' },
    {
      type: 'text',
      content:
        '`<slot name="header">` 声明 header 出口，父组件用 `<template #header>` 提供对应片段；`#header` 是 `v-slot:header` 的缩写。没有放进具名 `<template>` 的顶层内容进入隐式 default。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<BaseLayout>
  <template #header>
    <h2>课程标题</h2>
  </template>

  <p>默认正文</p>

  <template #footer>
    <small>课程状态</small>
  </template>
</BaseLayout>`,
    },
    {
      type: 'text',
      content:
        '组件级 `v-slot` 只适合单个默认作用域插槽。只要同一组件还提供具名插槽，默认插槽也要放入独立的 `<template #default>`，这样每段 slot props 的作用域边界都清楚。`#` 缩写必须带参数，默认名称不能省略。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<LearningPanel>
  <template #default="{ activeTopic }">
    <p>当前主题：{{ activeTopic }}</p>
  </template>

  <template #actions="{ reset }">
    <button type="button" @click="reset">重置</button>
  </template>
</LearningPanel>`,
    },
    { type: 'heading', content: '作用域插槽显式提供子组件能力' },
    {
      type: 'text',
      content:
        '子组件在 `<slot>` 出口上绑定的普通 attribute 会成为 slot props。父组件用 `v-slot` 或 `#name="slotProps"` 接收参数。父级仍未取得子组件内部变量，只拿到子组件在调用插槽时主动提供的值和命令。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<!-- LearningPanel.vue -->
<script setup lang="ts">
import { ref } from 'vue'

type TopicId = 'template' | 'source'

const activeTopic = ref<TopicId>('template')

/** 选择当前学习主题。 */
function selectTopic(topic: TopicId) {
  activeTopic.value = topic
}
</script>

<template>
  <slot :active-topic="activeTopic" :select-topic="selectTopic" />
</template>`,
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<!-- ParentView.vue -->
<template>
  <LearningPanel v-slot="{ activeTopic, selectTopic }">
    <p>当前主题：{{ activeTopic }}</p>
    <button type="button" @click="selectTopic('source')">查看源码</button>
  </LearningPanel>
</template>`,
    },
    { type: 'heading', content: '用只读状态与窄命令守住所有权' },
    {
      type: 'text',
      content:
        'slot props 是调用插槽时的能力参数，不是新的双向绑定。优先传字符串、布尔值等值类型状态，并用参数已收窄的命令表达允许的修改。不要传出内部 ref、可写对象或数组；TypeScript 的 `readonly` 只能限制属性赋值，不能冻结嵌套引用。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `type TopicId = 'template' | 'source'

type DefaultSlotProps = {
  readonly activeTopic: TopicId
  readonly activeTopicLabel: string
  readonly detailsVisible: boolean
  readonly selectTopic: (topic: TopicId) => void
}`,
    },
    {
      type: 'table',
      headers: ['提供方式', '所有权结果', '判断'],
      rows: [
        ['activeTopic: TopicId', '父级只读当前值', '适合'],
        ['selectTopic(topic: TopicId)', '父级只能发出已定义命令', '适合'],
        ['panelState 可写对象', '父级可绕过规则修改内部字段', '不适合'],
        ['内部 ref', '父级可直接写入子状态', '不适合'],
      ],
    },
    { type: 'heading', content: '在学习面板插槽实验中串起契约' },
    {
      type: 'text',
      content:
        '唯一 Demo 由真实父子 SFC 组成。父级提供标题、默认内容和操作片段；子级拥有当前主题、详情状态和四个出口，只通过 slot props 提供值类型状态、selectTopic() 与 toggleDetails()。父级不提供 support，因而由子级显示真实 fallback。',
    },
    {
      type: 'demo',
      id: 'vue.core.learn.intermediate.slots.learning-panel-slots-demo',
      description: '验证父级渲染作用域、显式作用域插槽、窄命令与子级 fallback',
      playground: true,
    },
    { type: 'heading', content: '条件插槽只判断函数是否存在' },
    {
      type: 'text',
      content:
        '子组件可以在模板中读取 `$slots.header`，只在父级提供 header 插槽函数时创建外围结构。这适合控制标题区或操作区是否出现，但只回答“函数是否存在”，不保证函数最终产生用户可见文本。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<template>
  <header v-if="$slots.header">
    <slot name="header" />
  </header>

  <main>
    <slot />
  </main>
</template>`,
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '若业务必须区分“有操作数据”和“无操作数据”，应让数据本身提供明确状态。不要把 `$slots.actions` 当作最终 VNode 数量或可见内容的检测器。',
    },
    { type: 'heading', content: '动态插槽名遵守动态参数限制' },
    {
      type: 'text',
      content:
        '动态名称写作 `#[activeSlotName]`，适合目标出口确实由状态决定的场景。动态参数值应为字符串或 `null`；包含空格、引号等不合法 attribute 名字符号的复杂表达式不能直接写在方括号中，应先整理为脚本中的简单变量。固定出口仍优先使用静态名称。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
import { ref } from 'vue'

const activeSlotName = ref<'header' | 'footer'>('header')
</script>

<template>
  <BaseLayout>
    <template #[activeSlotName]>
      动态目标内容
    </template>
  </BaseLayout>
</template>`,
    },
    { type: 'heading', content: '插槽的函数契约' },
    {
      type: 'text',
      content:
        '公开 API 把 slots 对象的每个属性表示为函数：函数接收 slot props，返回 VNode 数组。模板使用者无需手写这个函数；编译器把父级插槽模板转成函数，把子级 `<slot>` 转成渲染期调用。这个模型能统一解释父级作用域、参数和 fallback。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `type Slot = (...args: any[]) => VNode[]`,
    },
    {
      type: 'text',
      content:
        '`default` 只是保留的隐式名称。`<slot name="header" message="hello">` 中的 `name` 只负责选择目标函数，不属于 slot props；父级 header 插槽只会收到 `{ message: "hello" }`。',
    },
    { type: 'heading', content: '$slots、useSlots 与 defineSlots' },
    {
      type: 'table',
      headers: ['入口', '使用位置', '主要职责'],
      rows: [
        ['$slots', '模板', '随渲染检查插槽函数是否存在'],
        ['useSlots()', 'setup 运行时', '脚本确实需要时取得 slots 对象'],
        ['defineSlots()', '<script setup> 类型宏', '声明名称与 slot props 类型'],
      ],
    },
    {
      type: 'text',
      content:
        '`useSlots()` 返回当前 setup context 的 slots 对象；已提供的名称对应插槽函数，未提供的名称读取为 `undefined`。模板中的存在性判断和出口渲染直接使用 `$slots` 与 `<slot>` 更清楚；脚本只在确实需要读取插槽结构时使用运行时 helper。不要在 setup 中提前执行插槽函数并缓存 VNode 结果。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `/** 返回当前组件 setup context 中的插槽函数对象。 */
function useSlots(): Record<string, ((...args: any[]) => VNode[]) | undefined>`,
    },
    {
      type: 'text',
      content:
        '`defineSlots()` 自 Vue 3.3 起可用，只接受类型参数，不接收运行时配置。类型字面量的 key 是插槽名，函数第一个参数描述 slot props；返回值是同一个 slots 对象。当前函数返回类型会被忽略，因此宏不是运行时校验器，也不能验证父级最终渲染的内容。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `type TopicId = 'template' | 'source'

type DefaultSlotProps = {
  readonly activeTopic: TopicId
  readonly activeTopicLabel: string
  readonly detailsVisible: boolean
  readonly selectTopic: (topic: TopicId) => void
}

const slots = defineSlots<{
  /** 提供面板标题内容。 */
  header(): any
  /** 接收主题状态与选择命令。 */
  default(props: DefaultSlotProps): any
  /** 接收详情状态与切换命令。 */
  actions(props: {
    readonly detailsVisible: boolean
    readonly toggleDetails: () => void
  }): any
  /** 可选地提供补充资料。 */
  support?(): any
}>()`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        'defineSlots() 提供 TypeScript 提示，不会在浏览器中要求某个插槽必须存在，也不会检查插槽函数返回的实际节点。运行时缺省体验仍由子组件出口和 fallback 负责。',
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '在父组件插槽内容中直接读取子组件状态',
          description: '误以为内容最终渲染在子组件内部，就能直接读取子组件局部的 activeTopic。',
          consequence:
            'activeTopic 仍按父组件作用域解析，类型检查会报属性不存在，运行时也无法得到目标子状态。',
          wrong: {
            lang: 'vue',
            content: `<LearningPanel>
  <p>{{ activeTopic }}</p>
</LearningPanel>`,
          },
          correct: {
            lang: 'vue',
            content: `<LearningPanel v-slot="{ activeTopic }">
  <p>{{ activeTopic }}</p>
</LearningPanel>`,
          },
        },
        {
          title: '组件级默认 v-slot 与嵌套具名插槽混用',
          description: '误以为组件级 v-slot 的变量会自然进入同一组件内部的所有具名插槽。',
          consequence: '默认 slot props 的作用域含糊，模板编译失败。',
          wrong: {
            lang: 'vue',
            content: `<LearningPanel v-slot="{ activeTopic }">
  <p>{{ activeTopic }}</p>
  <template #actions>操作</template>
</LearningPanel>`,
          },
          correct: {
            lang: 'vue',
            content: `<LearningPanel>
  <template #default="{ activeTopic }">
    <p>{{ activeTopic }}</p>
  </template>
  <template #actions>操作</template>
</LearningPanel>`,
          },
        },
        {
          title: '把 # 当成无参数的 v-slot 缩写',
          description: '误以为单独的 # 可以接收默认 slot props，而不必写出插槽名。',
          consequence: '# 后缺少参数，模板语法无效。',
          wrong: {
            lang: 'vue',
            content: `<LearningPanel #="{ activeTopic }">
  {{ activeTopic }}
</LearningPanel>`,
          },
          correct: {
            lang: 'vue',
            content: `<LearningPanel #default="{ activeTopic }">
  {{ activeTopic }}
</LearningPanel>`,
          },
        },
        {
          title: '把 slot outlet 的 name 当成普通 slot prop',
          description:
            '误以为 `<slot name="header" message="hello" />` 会同时传出 name 与 message。',
          consequence: 'name 是选择出口的保留 attribute，父级收到的参数中没有它。',
          wrong: {
            lang: 'vue',
            content: `<Panel>
  <template #header="{ name, message }">
    {{ name }}：{{ message }}
  </template>
</Panel>`,
          },
          correct: {
            lang: 'vue',
            content: `<Panel>
  <template #header="{ message }">
    {{ message }}
  </template>
</Panel>`,
          },
        },
        {
          title: '把可写对象当成只读 slot props 传出',
          description: '误以为 slot props 会自动阻止父级修改传出的嵌套对象或内部响应式状态。',
          consequence:
            '父级可以绕过子组件命令直接制造未验证状态，TypeScript readonly 也不会运行时冻结嵌套引用。',
          wrong: {
            lang: 'vue',
            content: `<slot :panel-state="panelState" />`,
          },
          correct: {
            lang: 'vue',
            content: `<slot
  :active-topic="activeTopic"
  :details-visible="detailsVisible"
  :select-topic="selectTopic"
  :toggle-details="toggleDetails"
/>`,
          },
        },
        {
          title: '把 $slots.name 存在等同于一定有可见内容',
          description:
            '误以为 $slots.actions 为真，就证明插槽函数一定产生按钮、文本或其他可见节点。',
          consequence:
            '包装区可能存在却没有可见内容，业务空状态也可能与运行时 fallback 判定混在一起。',
          wrong: {
            lang: 'vue',
            content: `<footer v-if="$slots.actions">
  操作数据一定存在
  <slot name="actions" />
</footer>`,
          },
          correct: {
            lang: 'vue',
            content: `<Panel :has-actions="actions.length > 0">
  <template v-if="actions.length > 0" #actions>
    <button type="button">执行操作</button>
  </template>
</Panel>`,
          },
        },
        {
          title: '在 setup 中提前执行插槽函数并缓存结果',
          description: '误以为 useSlots() 返回普通内容工厂，setup 时调用一次就能永久复用。',
          consequence:
            '插槽依赖没有在正确渲染上下文中追踪，开发环境可能警告，缓存内容也不会按预期更新。',
          wrong: {
            lang: 'ts',
            content: `const slots = useSlots()
const cachedContent = slots.default?.()`,
          },
          correct: {
            lang: 'vue',
            content: `<template>
  <slot />
</template>`,
          },
        },
        {
          title: '把模板条件判断绕到 useSlots 中实现',
          description:
            '误以为 script setup 中所有插槽操作都必须使用 useSlots()，于是缓存一次存在性快照。',
          consequence: '快照可能与后续插槽更新不一致，并增加脚本状态与模板结构之间的同步负担。',
          wrong: {
            lang: 'ts',
            content: `const slots = useSlots()
const hasHeader = Boolean(slots.header)`,
          },
          correct: {
            lang: 'vue',
            content: `<header v-if="$slots.header">
  <slot name="header" />
</header>`,
          },
        },
        {
          title: '把 defineSlots 当作运行时校验器',
          description:
            '误以为 defineSlots 可以接收运行时配置，并让浏览器拒绝缺失或错误的插槽内容。',
          consequence: '宏不接受运行时参数，类型声明也无法检查父级最终产生的 VNode 内容。',
          wrong: {
            lang: 'ts',
            content: `defineSlots({
  default: { required: true },
})`,
          },
          correct: {
            lang: 'ts',
            content: `defineSlots<{
  /** 接收当前主题与选择命令。 */
  default(props: {
    readonly activeTopic: string
    readonly selectTopic: (topic: string) => void
  }): any
}>()`,
          },
        },
        {
          title: '重复名称或显式 default 后继续写额外默认内容',
          description: '误以为同名插槽模板会自动合并，显式 #default 外的顶层内容也会自动追加。',
          consequence: '重复名称或额外默认 children 会触发编译错误。',
          wrong: {
            lang: 'vue',
            content: `<Panel>
  <template #default>正文 A</template>
  正文 B
  <template #header>标题 A</template>
  <template #header>标题 B</template>
</Panel>`,
          },
          correct: {
            lang: 'vue',
            content: `<Panel>
  <template #default>
    <p>正文 A</p>
    <p>正文 B</p>
  </template>
  <template #header>
    <h2>标题 A</h2>
    <p>标题 B</p>
  </template>
</Panel>`,
          },
        },
      ],
    },
    { type: 'heading', content: '从 Vue 3.5.40 源码与官方测试推导' },
    {
      type: 'text',
      content:
        '以下八点都明确区分固定版本的官方事实与课程推导。课程推导只帮助判断 Vue 3.5.40 下的写法，不是新增的 Vue 公共 API 承诺。',
    },
    {
      type: 'steps',
      items: [
        {
          title: '推导 1：实例插槽统一为函数',
          content:
            '官方事实：componentSlots.ts 会把单个值包装成数组并逐项归一化为 VNode，函数插槽也会被包装；非函数值虽兼容，但开发环境提示优先使用函数插槽。课程推导：把插槽理解为延迟执行的函数契约，不把它当成静态字符串容器；这不是要求手写渲染函数的公共 API 承诺。',
        },
        {
          title: '推导 2：插槽函数应在渲染期调用',
          content:
            '官方事实：归一化插槽记录创建上下文，开发模式会警告在组件 render 之外调用时响应式依赖无法正确追踪。课程推导：不在 setup、普通事件或 computed 初始化中执行并缓存 slots.default?.()，模板继续使用 `<slot>`；这不是对其他内部调用路径的公共承诺。',
        },
        {
          title: '推导 3：插槽名称会随更新增删',
          content:
            '官方事实：updateSlots() 更新实例已有 slots 容器，并在需要删除检查时移除新输入中已消失的非内部 key；动态插槽参与更新。课程推导：不把 Object.keys(slots) 或 Boolean(slots.footer) 的 setup 结果缓存为永久事实，模板应在渲染中读 `$slots.footer`；这不是 slots 对象身份的公共承诺。',
        },
        {
          title: '推导 4：fallback 在出口调用时惰性选择',
          content:
            '官方事实：renderSlot() 按名称取得函数并传入 props，目标没有有效结果时才调用 fallback 函数。课程推导：缺省内容留在子组件出口，父级只决定是否提供插槽；这不是对内部调用顺序或实现函数的公共承诺。',
        },
        {
          title: '推导 5：存在函数不等于产生有效内容',
          content:
            '官方事实：ensureValidVNode() 会穿过 Fragment 检查结果，纯 Comment 与嵌套的无效片段不会被当成有效内容。课程推导：`$slots.name` 只判断函数存在，业务空状态应使用显式数据；这不是对所有 VNode 类型可见性的公共承诺。',
        },
        {
          title: '推导 6：fallback 与真实内容使用不同内部 key',
          content:
            '官方事实：Vue 3.5.40 在采用 fallback 时会给 Fragment key 追加 `_fb`，官方测试验证了该内部结果。课程推导：验证切换时只观察真实可见内容，不依赖或对外暴露 `_fb`；该 key 是当前实现细节，不是公共 API 承诺。',
        },
        {
          title: '推导 7：条件、循环和动态名称会标记为动态插槽',
          content:
            '官方事实：编译器会为插槽计算稳定、动态或转发标记，条件、循环、动态名称和作用域依赖会生成动态插槽结构。课程推导：只在出口确实变化时使用动态声明，固定出口保持静态具名插槽；编译标记与 patch flag 不是课程对外承诺。',
        },
        {
          title: '推导 8：编译器拒绝含糊或重复声明',
          content:
            '官方事实：官方测试覆盖组件级 v-slot 与模板级具名插槽混用、重复名称、显式 default 外的额外默认 children，以及在普通元素使用 v-slot 等错误。课程推导：多个插槽都使用独立 `<template #name>`，默认作用域插槽显式写 `#default`；这不是新增语法规则或公共 API 承诺。',
        },
      ],
    },
    {
      type: 'exercise',
      title: '实现有明确能力边界的学习面板',
      instructions:
        '创建 LearningPanel 子组件：它拥有 template/source 两个主题和详情显隐状态，提供 header、default、actions、support 四个出口。父组件在显式 #default 中读取父级备注以及子级提供的值，选择主题只能调用 selectTopic；actions 只能调用 toggleDetails；不提供 support，并验证子级 fallback 出现。',
      answer: `<!-- LearningPanel.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'

type TopicId = 'template' | 'source'

const activeTopic = ref<TopicId>('template')
const detailsVisible = ref(true)
const activeTopicLabel = computed(() =>
  activeTopic.value === 'template' ? '模板' : '源码',
)

/** 选择当前学习主题。 */
function selectTopic(topic: TopicId) {
  activeTopic.value = topic
}

/** 切换学习详情的显示状态。 */
function toggleDetails() {
  detailsVisible.value = !detailsVisible.value
}

defineSlots<{
  /** 提供标题内容。 */
  header(): any
  /** 接收主题状态与选择命令。 */
  default(props: {
    readonly activeTopic: TopicId
    readonly activeTopicLabel: string
    readonly detailsVisible: boolean
    readonly selectTopic: (topic: TopicId) => void
  }): any
  /** 接收详情状态与切换命令。 */
  actions(props: {
    readonly detailsVisible: boolean
    readonly toggleDetails: () => void
  }): any
  /** 可选地提供补充资料。 */
  support?(): any
}>()
</script>

<template>
  <section>
    <header v-if="$slots.header"><slot name="header" /></header>
    <slot
      :active-topic="activeTopic"
      :active-topic-label="activeTopicLabel"
      :details-visible="detailsVisible"
      :select-topic="selectTopic"
    />
    <footer v-if="$slots.actions">
      <slot
        name="actions"
        :details-visible="detailsVisible"
        :toggle-details="toggleDetails"
      />
    </footer>
    <aside><slot name="support">当前没有父级补充资料</slot></aside>
  </section>
</template>

<!-- ParentView.vue -->
<script setup lang="ts">
const parentNote = '父级备注：内容布局由父组件决定'
</script>

<template>
  <LearningPanel>
    <template #header><h2>插槽学习面板</h2></template>
    <template #default="{ activeTopicLabel, detailsVisible, selectTopic }">
      <p>{{ parentNote }}</p>
      <p>当前主题：{{ activeTopicLabel }}</p>
      <p>详情状态：{{ detailsVisible ? '已展开' : '已收起' }}</p>
      <button type="button" @click="selectTopic('template')">选择模板</button>
      <button type="button" @click="selectTopic('source')">选择源码</button>
    </template>
    <template #actions="{ detailsVisible, toggleDetails }">
      <button type="button" @click="toggleDetails">
        {{ detailsVisible ? '收起详情' : '展开详情' }}
      </button>
    </template>
  </LearningPanel>
</template>`,
    },
    {
      type: 'checklist',
      items: [
        { label: '能指出父组件拥有插槽内容、子组件拥有出口' },
        { label: '知道插槽表达式始终按父级渲染作用域解析' },
        { label: '会使用默认插槽，并把 fallback 留在子组件出口' },
        { label: '会用 #name 提供具名内容，并在混用时显式写 #default' },
        { label: '只通过 slot props 接收子组件主动提供的能力' },
        { label: '优先传值类型状态与收窄命令，不传可写内部对象' },
        { label: '知道 $slots.name 只判断插槽函数是否存在' },
        { label: '动态名称会写成 #[name]，值保持为字符串或 null' },
        { label: '模板优先使用 $slots 与 <slot>，不提前执行并缓存插槽函数' },
        { label: '会用 defineSlots() 描述名称和 slot props，但不把它当运行时校验' },
      ],
    },
    { type: 'heading', content: '完成本课后的判断顺序' },
    {
      type: 'text',
      content:
        '先确认内容由哪个父组件定义、出口由哪个子组件拥有，再判断片段只需 default 还是需要静态具名出口。父级需要子状态时，由子级提供值类型 slot props 与窄命令；多个插槽则为默认片段显式写 #default。结构是否出现由模板中的 $slots 判断，业务空状态交给显式数据。最后再判断脚本是否真的需要 useSlots，并用 defineSlots 补充类型边界。',
    },
  ],
  recap: [
    '父组件定义插槽内容，子组件通过 <slot> 决定调用出口。',
    '插槽表达式属于父级渲染作用域，不会自动读取子组件局部状态。',
    '没有 name 的出口是 default；缺少有效父级内容时由子组件渲染 fallback。',
    '具名插槽用 #name 提供；与具名插槽混用时，默认作用域插槽显式写 #default。',
    'slot props 是子组件主动提供的能力参数，不会改变内容的父级所有权。',
    '值类型状态与窄命令能保持单向所有权，可写对象和内部 ref 不应作为能力出口。',
    '$slots.name 只检查插槽函数存在，不等于一定产生可见内容。',
    '动态插槽名使用 #[name]，并遵守动态参数的字符串和模板语法限制。',
    'useSlots() 是运行时脚本入口，defineSlots() 是只接收类型参数的编译器宏。',
    'Vue 3.5.40 的归一化、fallback key 与编译标记用于课程推导，不是新的公共 API 承诺。',
  ],
})
