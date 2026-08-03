/**
 * 课程：Props
 * 查证日期：2026-07-30
 * 适用版本：Vue 3.5.40
 * 查证工具：Tavily、Vue 中文/英文官网与 vuejs/core v3.5.40 固定标签源码
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

export const meta = defineLessonMeta({
  id: 'vue.core.learn.basics.props',
  type: 'lesson',
  title: 'Props',
  summary: '声明父到子的组件输入，正确处理类型、默认值与单向数据流边界',
  ecosystem: 'vue',
  module: 'core',
  collection: 'basics',
  level: 'beginner',
  prerequisites: ['vue.core.learn.basics.component-basics'],
  related: ['vue.core.learn.basics.component-basics', 'vue.core.reference.components.props'],
  tags: ['Props', 'defineProps', '父子组件', '单向数据流', 'Boolean'],
  sources: [
    {
      title: 'Vue 组件 Props',
      url: 'https://cn.vuejs.org/guide/components/props.html',
    },
    {
      title: 'Vue TypeScript 与组合式 API',
      url: 'https://cn.vuejs.org/guide/typescript/composition-api.html#typing-component-props',
    },
    {
      title: 'Vue script setup',
      url: 'https://cn.vuejs.org/api/sfc-script-setup.html#defineprops-defineemits',
    },
    {
      title: 'Vue 3.5.40 defineProps.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/defineProps.ts',
    },
    {
      title: 'Vue 3.5.40 definePropsDestructure.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/definePropsDestructure.ts',
    },
    {
      title: 'Vue 3.5.40 componentProps.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentProps.ts',
    },
    {
      title: 'Vue 3.5.40 component.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/component.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-30',
  estimatedMinutes: 45,
})

export default defineLesson({
  meta,
  objectives: [
    '把 prop 解释为父组件拥有、子组件声明并只读消费的公开输入',
    '用类型式 defineProps 声明必传与可选输入，并为可选输入提供默认值',
    '区分静态字符串与 v-bind 表达式，正确传递常用值类型',
    '预测 Boolean prop 缺席、仅写名称、空字符串与显式 false 的结果',
    '说明父级更新为何会刷新子级，并拒绝直接改写顶层 prop',
    '根据需求选择一次性本地初值或 computed 持续派生',
    '识别对象和数组 prop 的浅层只读边界，保持父级数据所有权',
    '把运行时 prop 校验定位为开发反馈，而不是生产数据边界',
  ],
  blocks: [
    { type: 'heading', content: '把 Props 看成组件的公开输入' },
    {
      type: 'text',
      content:
        '上一课已经会组合父组件与子组件，但包含关系不会让子组件自动读取父级局部变量。父组件拥有课程状态，子组件若要展示标题、时长或推荐状态，必须声明这些命名输入；父组件也要在使用子组件时显式传入。Props 就是这条父到子边界上的公开输入契约。',
    },
    {
      type: 'code',
      lang: 'text',
      content: `父组件拥有课程状态
        │
        │ props：title / durationMinutes / featured
        ▼
CoursePreviewCard 声明并只读展示`,
    },
    {
      type: 'table',
      headers: ['角色', '负责什么', '不应做什么'],
      rows: [
        ['父组件', '保存并更新业务状态，在子组件标签上传值', '假设子组件能自动读取父级变量'],
        ['子组件', '声明可接收的输入，并根据输入渲染', '把父级输入当成自己的可写状态'],
        ['prop 契约', '给输入命名并说明类型、可选性和默认值', '制造隐式的反向写入通道'],
      ],
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '判断所有权时先问“哪个组件负责决定这个值”。负责决定值的一方保存状态，另一方只通过公开输入消费。',
    },
    { type: 'heading', content: '用类型式 defineProps 声明输入' },
    {
      type: 'text',
      content:
        '`defineProps()` 是 `<script setup>` 的编译器宏，无需导入。本课用 TypeScript 接口作为唯一主声明：没有问号的字段必须传入，带问号的字段可以缺席；模板通过 `props.xxx` 显式读取，便于新手始终看见数据来自组件输入。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
interface Props {
  title: string
  durationMinutes: number
  featured?: boolean
}

const props = defineProps<Props>()
</script>

<template>
  <article>
    <p v-if="props.featured">推荐课程</p>
    <h3>{{ props.title }}</h3>
    <p>{{ props.durationMinutes }} 分钟</p>
  </article>
</template>`,
    },
    {
      type: 'table',
      headers: ['声明', '含义', '缺席时'],
      rows: [
        ['title: string', '必传字符串', 'TypeScript 在使用处提示缺少输入'],
        ['durationMinutes: number', '必传数字', 'TypeScript 在使用处提示缺少输入'],
        ['featured?: boolean', '可选布尔值', '按 Boolean 规则通常解析为 false'],
        ['description?: string', '可选字符串', '没有默认值时通常是 undefined'],
      ],
    },
    {
      type: 'text',
      content:
        'Vue 也支持运行时对象声明，用来直接配置 `type`、`required`、`default` 或 `validator`。它与类型式声明是两种入口，同一次 `defineProps()` 不能既传运行时对象又传类型参数；基础课程保持一套主线，避免把两套语法拼在一起。',
    },
    { type: 'heading', content: '静态 attribute 只传字符串' },
    {
      type: 'text',
      content:
        '父模板中没有 `v-bind` 的 attribute 是静态字符串。需要读取 JavaScript 变量、字面量或表达式时使用 `v-bind`，简写为冒号。脚本声明保持 camelCase，模板传参按官方约定使用 kebab-case。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
import { ref } from 'vue'
import CoursePreviewCard from './CoursePreviewCard.vue'

const title = ref('Props')
const isFeatured = ref(false)
</script>

<template>
  <CoursePreviewCard
    eyebrow="基础课程"
    :title="title"
    :duration-minutes="45"
    :featured="isFeatured"
    :topics="['Vue', 'TypeScript']"
    :course-meta="{ level: 'beginner' }"
  />
</template>`,
    },
    {
      type: 'table',
      headers: ['父模板写法', '子组件收到的值', '值的类型'],
      rows: [
        ['eyebrow="基础课程"', '基础课程', 'string'],
        [':duration-minutes="45"', '45', 'number'],
        [':featured="false"', 'false', 'boolean'],
        [":topics=\"['Vue', 'TS']\"", "['Vue', 'TS']", 'array'],
        [':course-meta="{ level: \'beginner\' }"', "{ level: 'beginner' }", 'object'],
      ],
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`duration-minutes="45"` 传的是字符串，`featured="false"` 也传字符串。冒号表达的是“按 JavaScript 求值”，不是装饰性写法。',
    },
    { type: 'heading', content: '用 withDefaults 提供稳定默认值' },
    {
      type: 'text',
      content:
        '可选普通 prop 缺席时通常是 `undefined`。界面需要稳定文案或空集合时，可以用 `withDefaults()` 为类型式声明提供默认值。字符串可以直接给值；对象和数组应使用工厂，让每个组件实例得到自己的可变引用。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
interface Props {
  title: string
  description?: string
  topics?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  description: '暂无课程说明',
  topics: () => [],
})
</script>

<template>
  <article>
    <h3>{{ props.title }}</h3>
    <p>{{ props.description }}</p>
    <p>主题数：{{ props.topics.length }}</p>
  </article>
</template>`,
    },
    {
      type: 'text',
      content:
        '父级没有传 `description`，或显式传入 `undefined` 时，子级都会使用默认文案。数组工厂的目标不是每次渲染都创建新数组，而是让不同组件实例拥有彼此独立的默认引用；同一实例后续重新解析时会复用已经缓存的默认结果。',
    },
    {
      type: 'tip',
      style: 'info',
      content:
        'Vue 3.5 也支持响应式 Props 解构的原生默认值，但本课继续使用 `props.xxx` 与 `withDefaults()`，避免在默认值之外再引入一套读取方式。',
    },
    { type: 'heading', content: '单独理解 Boolean 转换' },
    {
      type: 'text',
      content:
        'Boolean prop 模仿原生 `disabled`、`checked` 这类 boolean attribute：缺席通常是 `false`，只写名称或传空字符串通常是 `true`。它不是把任意字符串解析为布尔值的通用转换器。',
    },
    {
      type: 'table',
      headers: ['声明与传法', '典型结果', '原因'],
      rows: [
        ['featured: Boolean，父级缺席', 'false', 'Boolean prop 默认按二态处理'],
        ['父级写 featured', 'true', '空 attribute 使用原生布尔属性语义'],
        ['父级写 featured=""', 'true', '空字符串可转换为 true'],
        ['父级写 :featured="false"', 'false', 'v-bind 传入真正的 boolean'],
        ['父级写 featured="false"', "'false'", '静态 attribute 仍是字符串，并产生开发期警告'],
      ],
    },
    {
      type: 'text',
      content:
        '运行时联合声明还受构造器顺序影响。`[Boolean, String]` 会把空 attribute 转为 `true`，`[String, Boolean]` 则保留空字符串。只有确实需要两种输入类型时才声明联合类型，并把顺序当成公开语义的一部分。',
    },
    {
      type: 'compare',
      labels: ['空属性转为 true', '空属性保留空字符串'],
      before: `const props = defineProps({
  disabled: [Boolean, String],
})`,
      after: `const props = defineProps({
  disabled: [String, Boolean],
})`,
    },
    { type: 'heading', content: '父级更新，子级被动刷新' },
    {
      type: 'text',
      content:
        'Props 是单向向下绑定。父组件修改自己拥有的状态后重新渲染，子组件的 props 会收到最新输入并更新视图。子级没有隐式写回通道，也不能把 `props.title` 重新赋值当成自己的状态更新。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
import { ref } from 'vue'
import CoursePreviewCard from './CoursePreviewCard.vue'

const title = ref('组件基础')
const durationMinutes = ref(30)
</script>

<template>
  <button type="button" @click="title = 'Props'; durationMinutes = 45">
    切换课程
  </button>
  <CoursePreviewCard
    :title="title"
    :duration-minutes="durationMinutes"
  />
</template>`,
    },
    {
      type: 'table',
      headers: ['时刻', '父级状态', '子级 props'],
      rows: [
        ['初始渲染', '组件基础 / 30', '显示组件基础 / 30'],
        ['父级点击按钮', '改为 Props / 45', '尚未由子级执行任何写入'],
        ['更新完成', 'Props / 45', '被动显示 Props / 45'],
      ],
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '子级直接给顶层 prop 赋值会收到只读警告，而且父级下次更新仍会用自己的值刷新它。所有权没有因为子级暂时看见这个值而转移。',
    },
    { type: 'heading', content: '在 Props 输入流实验台观察方向' },
    {
      type: 'text',
      content:
        '下面的唯一 Demo 把课程状态全部保留在父组件。依次切换课程、推荐状态、主题、说明和难度，观察子卡片只通过已声明输入被动刷新；子级没有修改父状态的按钮。',
    },
    {
      type: 'demo',
      id: 'vue.core.learn.basics.props.props-input-flow-demo',
      description: '由父级更新多种输入，观察子组件按已声明 Props 被动刷新',
      playground: true,
    },
    { type: 'heading', content: '区分一次性本地初值与持续派生' },
    {
      type: 'text',
      content:
        '想“修改 prop”时，先分清真实需求。若输入只用于创建组件自己的初始状态，就明确复制到本地 `ref`，并接受它与父级后续更新断开；若只想规范化或计算展示值，就用 `computed` 持续从最新 prop 派生。',
    },
    {
      type: 'table',
      headers: ['需求', '正确工具', '父级更新后的结果'],
      rows: [
        ['只在创建时提供起始页', 'ref(props.initialPage)', '本地页码保持独立'],
        ['持续显示清理后的标题', 'computed(() => props.title.trim())', '派生标题自动更新'],
        ['临时改写父级标题', '不是本地副本或 computed 的职责', '应保持父级所有权'],
      ],
    },
    {
      type: 'compare',
      labels: ['一次性本地初值', '持续派生值'],
      before: `<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ initialPage: number }>()
const page = ref(props.initialPage)
</script>`,
      after: `<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ title: string }>()
const normalizedTitle = computed(() => props.title.trim())
</script>`,
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '不要为了让复制值继续同步而立即增加 watcher。若本地值始终应等于 prop 的变换结果，它本来就是 computed；若它应独立变化，就应接受两者分离。',
    },
    { type: 'heading', content: '对象和数组只受浅层只读约束' },
    {
      type: 'text',
      content:
        '“Props 只读”准确地说是顶层绑定只读。对象和数组仍是父子共享的 JavaScript 引用，所以 `props.topics.push()` 或 `props.courseMeta.level = ...` 技术上可能改到父级数据。能够修改不代表应该修改：这种变化绕过所有权边界，很难追踪来源。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  topics: string[]
  courseMeta: { level: string }
}

const props = defineProps<Props>()
const sortedTopics = computed(() => [...props.topics].sort())
</script>

<template>
  <p>难度：{{ props.courseMeta.level }}</p>
  <ul>
    <li v-for="topic in sortedTopics" :key="topic">{{ topic }}</li>
  </ul>
</template>`,
    },
    {
      type: 'table',
      headers: ['操作', '是否改变父级引用', '建议'],
      rows: [
        ['读取 props.courseMeta.level', '否', '直接读取'],
        ['[...props.topics].sort()', '否', '复制后派生排序结果'],
        ['props.topics.sort()', '是', '不要在子级原地排序'],
        ['props.courseMeta.level = ...', '是', '由父级所有者修改'],
      ],
    },
    { type: 'heading', content: '运行时校验只提供开发反馈' },
    {
      type: 'text',
      content:
        '运行时对象声明可以检查 `type`、`required` 和 `validator`。失败时 Vue 在开发构建中给出控制台警告，但不会把字符串自动清洗成数字，也不会因为 validator 返回 false 就拒绝创建组件。外部数据仍应在进入组件前完成真实解析与校验。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const props = defineProps({
  durationMinutes: {
    type: Number,
    required: true,
    validator: (value: number) => value > 0,
  },
})`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '这里的 validator 适合提醒组件调用者“时长应大于零”，不负责接口响应解析、表单规则、安全判断或生产环境数据清洗。',
    },
    { type: 'heading', content: 'Vue 3.5 响应式解构是进阶能力' },
    {
      type: 'text',
      content:
        'Vue 3.5 会在同一 `<script setup>` 内把解构 prop 的读取改写为 prop 访问，因此父级更新后，直接读取的变量仍能得到新值。但该变量不是 `ref`，没有 `.value`；交给 `watch` 或组合函数时，要传 getter 才能保留追踪。基础代码继续写 `props.count` 最直观。',
    },
    {
      type: 'compare',
      labels: ['错误地当成 ref', '通过 getter 保留追踪'],
      before: `const { count } = defineProps<{ count: number }>()

watch(count, () => {
  console.log(count.value)
})`,
      after: `const { count } = defineProps<{ count: number }>()

watch(() => count, () => {
  console.log(count)
})`,
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '把静态 attribute 当成 number 或 boolean',
          description:
            '没有 v-bind 的 attribute 是字符串；文本 false 也不是 Boolean prop 的 false 传法。',
          consequence: '组件收到错误类型，产生开发期警告，并可能发生字符串拼接或 truthy 判断错误。',
          wrong: {
            lang: 'vue',
            content: `<CoursePreviewCard duration-minutes="45" featured="false" />`,
          },
          correct: {
            lang: 'vue',
            content: `<CoursePreviewCard :duration-minutes="45" :featured="false" />`,
          },
        },
        {
          title: '忽略 Boolean 与 String 联合类型的顺序',
          description: '运行时用构造器位置决定空 attribute 能否转换为 true，两种排列不是等价声明。',
          consequence:
            '同一个仅写名称的 prop 在两种声明下分别得到 true 或空字符串，分支行为不一致。',
          wrong: {
            lang: 'ts',
            content: `// 误以为顺序不影响空 attribute
const props = defineProps({ disabled: [String, Boolean] })`,
          },
          correct: {
            lang: 'ts',
            content: `// 需要原生 boolean attribute 语义时让 Boolean 在前
const props = defineProps({ disabled: [Boolean, String] })`,
          },
        },
        {
          title: '在子组件中直接改写顶层 prop',
          description: '顶层 prop 由父级拥有，setup 侧看到的是浅只读输入视图。',
          consequence:
            '开发环境产生只读警告，父级下次更新还会用自己的值刷新子级，修改无法成为可靠状态。',
          wrong: {
            lang: 'ts',
            content: `const props = defineProps<{ title: string }>()
props.title = '新标题'`,
          },
          correct: {
            lang: 'ts',
            content: `const props = defineProps<{ title: string }>()
const displayTitle = computed(() => props.title.trim())`,
          },
        },
        {
          title: '复制 prop 到 ref 后仍期待跟随父级',
          description: '`ref(props.title)` 只读取创建当时的值，不会自动连接 prop 的后续更新。',
          consequence: '父级与子级显示不同标题，随后又用额外同步逻辑维护两份本可派生的状态。',
          wrong: {
            lang: 'ts',
            content: `const props = defineProps<{ title: string }>()
const title = ref(props.title)`,
          },
          correct: {
            lang: 'ts',
            content: `const props = defineProps<{ title: string }>()
const title = computed(() => props.title.trim())`,
          },
        },
        {
          title: '认为 Props 会深度阻止对象和数组修改',
          description: 'props 容器只在顶层只读，嵌套对象仍是父子共享引用。',
          consequence: '子级在没有明确所有权的情况下改变父状态，其他读取者也会观察到隐蔽变更。',
          wrong: {
            lang: 'ts',
            content: `props.topics.push('响应式')
props.courseMeta.level = 'advanced'`,
          },
          correct: {
            lang: 'ts',
            content: `const sortedTopics = computed(() => [...props.topics].sort())
const level = computed(() => props.courseMeta.level)`,
          },
        },
        {
          title: '给多个实例共享同一个可变默认值',
          description: '直接提供数组或复用模块级对象会让多个组件实例可能持有同一个可变引用。',
          consequence: '一个实例中的嵌套修改可能泄漏到其他实例，独立组件出现交叉状态。',
          wrong: {
            lang: 'ts',
            content: `const props = withDefaults(defineProps<{ topics?: string[] }>(), {
  topics: [],
})`,
          },
          correct: {
            lang: 'ts',
            content: `const props = withDefaults(defineProps<{ topics?: string[] }>(), {
  topics: () => [],
})`,
          },
        },
        {
          title: '把 prop 校验当成生产数据边界',
          description: '运行时 prop 校验只在开发分支警告，不负责强制转换、拦截输入或生产清洗。',
          consequence: '业务仍可能收到字符串数字或非法值，生产环境甚至没有对应校验警告。',
          wrong: {
            lang: 'ts',
            content: `// 错误假设：Number 会把字符串转成数字
const props = defineProps({ durationMinutes: Number })`,
          },
          correct: {
            lang: 'ts',
            content: `// 父级先把外部输入解析为明确数字，再动态传入
const durationMinutes = Number.parseInt(rawDuration, 10)`,
          },
        },
        {
          title: '把 Vue 3.5 解构 prop 当成 ref',
          description:
            '解构读取的响应性来自编译器改写，变量本身不是 ref，作为函数参数时会先求出当前值。',
          consequence: '访问 .value 得到错误结果，直接传给 watch 也无法建立期望的响应式来源。',
          wrong: {
            lang: 'ts',
            content: `const { count } = defineProps<{ count: number }>()
watch(count, () => console.log(count.value))`,
          },
          correct: {
            lang: 'ts',
            content: `const { count } = defineProps<{ count: number }>()
watch(() => count, () => console.log(count))`,
          },
        },
      ],
    },
    { type: 'heading', content: '从源码推导适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '类型式与运行时声明保持二选一',
          content:
            '`processDefineProps()` 会分别识别运行时参数与类型参数，并拒绝同一次调用同时使用两者。课程代码以类型式声明表达接口；需要运行时校验时，另选对象声明，不把两套入口拼接。',
        },
        {
          title: '声明决定输入分流与特殊值解析',
          content:
            '`initProps()` 与 `setFullProps()` 先按规范化声明识别输入，再把需要默认值或 Boolean 转换的 key 交给 `resolvePropValue()`。因此声明不只是 TypeScript 提示，也参与实际运行时行为。',
        },
        {
          title: '默认工厂按组件实例缓存结果',
          content:
            '`resolvePropValue()` 把工厂结果保存在当前实例的 `propsDefaults`。同一实例更新时复用结果，不同实例分别计算，所以数组或对象工厂表达的是“每实例一份”，不是“每渲染一份”。',
        },
        {
          title: 'Boolean 联合类型顺序属于公开语义',
          content:
            '`normalizePropsOptions()` 根据 Boolean 与 String 的构造器位置记录转换标记，更新时直接使用。需要空 attribute 表示 true 时让 Boolean 在 String 前，并用静态对照覆盖该约定。',
        },
        {
          title: '浅响应与浅只读共同形成单向边界',
          content:
            '有状态组件内部保存 `shallowReactive(props)`，开发模式传给 setup 的视图是 `shallowReadonly(instance.props)`。父级替换顶层值可触发刷新，嵌套引用却不会被递归冻结，因此仍由父级负责修改。',
        },
        {
          title: '运行时校验适合组件使用反馈',
          content:
            '初始化和更新路径只在开发分支调用 `validateProps()`，失败进入警告流程而不会拒绝值。组件库可用它尽早暴露调用错误，生产输入仍由真正的数据边界解析和验证。',
        },
        {
          title: 'Vue 3.5 解构通过编译器保留读取追踪',
          content:
            '`definePropsDestructure.ts` 记录解构 key 与默认表达式，并改写同一脚本中的读取。变量不是 ref；传给 watch 或组合式函数时使用 getter，基础组件则继续用显式 `props.xxx` 降低认知成本。',
        },
      ],
    },
    {
      type: 'exercise',
      title: '制作只读的课程预览卡片',
      instructions:
        '创建父组件与 `CoursePreviewCard.vue`。父级保存标题、数字时长、Boolean 推荐状态、主题数组和课程信息对象，并在模板中使用正确的静态或动态传值。子级用类型式 defineProps 与 withDefaults 声明输入，用 computed 复制后排序主题；不要在子级修改任何 prop。分别修改父级状态，确认子卡片持续刷新。',
      answer: `<!-- CoursePreviewCard.vue -->
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  eyebrow?: string
  title: string
  durationMinutes: number
  featured?: boolean
  topics?: string[]
  courseMeta: { level: string }
}

const props = withDefaults(defineProps<Props>(), {
  eyebrow: '普通课程',
  featured: false,
  topics: () => [],
})
const sortedTopics = computed(() => [...props.topics].sort())
</script>

<template>
  <article>
    <p>{{ props.eyebrow }}</p>
    <h2>{{ props.title }}</h2>
    <p>时长：{{ props.durationMinutes }} 分钟</p>
    <p>推荐：{{ props.featured ? '是' : '否' }}</p>
    <p>难度：{{ props.courseMeta.level }}</p>
    <ul>
      <li v-for="topic in sortedTopics" :key="topic">{{ topic }}</li>
    </ul>
  </article>
</template>

<!-- StudyPage.vue -->
<script setup lang="ts">
import { reactive, ref } from 'vue'
import CoursePreviewCard from './CoursePreviewCard.vue'

const course = reactive({ title: '组件基础', durationMinutes: 30 })
const featured = ref(false)
const topics = ref(['Vue', 'TypeScript'])
const courseMeta = ref({ level: 'beginner' })
</script>

<template>
  <button type="button" @click="course.title = 'Props'">更新父级标题</button>
  <button type="button" @click="featured = !featured">切换父级推荐状态</button>
  <CoursePreviewCard
    eyebrow="基础课程"
    :title="course.title"
    :duration-minutes="course.durationMinutes"
    :featured="featured"
    :topics="topics"
    :course-meta="courseMeta"
  />
</template>`,
    },
    {
      type: 'checklist',
      items: [
        { label: '父级保存业务状态，子级只声明并读取公开输入' },
        { label: '类型式 defineProps 明确必传、可选和值类型' },
        { label: '静态文本不加冒号，数字、Boolean、数组和对象使用 v-bind' },
        { label: '对象和数组默认值使用每实例工厂' },
        { label: '持续展示变换使用 computed，一次性初值才复制到 ref' },
        { label: '子级不重新赋值顶层 prop，也不修改共享对象或数组' },
        { label: '运行时校验只用于开发反馈，外部数据在边界处解析' },
      ],
    },
    { type: 'heading', content: '下一课预告' },
    {
      type: 'text',
      content:
        'Props 已经建立父到子的输入方向。下一课将学习 Emits，让子组件用显式事件向父组件表达操作意图，同时继续由父级决定是否更新状态。',
    },
  ],
  recap: [
    'Props 是父组件拥有、子组件显式声明并只读消费的公开输入。',
    '类型式 defineProps 清楚表达必传与可选字段；withDefaults 为可选输入提供默认值。',
    '静态 attribute 只传字符串，数字、Boolean、数组、对象和表达式使用 v-bind。',
    'Boolean prop 使用类似原生 boolean attribute 的转换规则，联合类型顺序会影响空属性。',
    '父级更新会刷新子级输入；一次性本地初值使用 ref，持续展示变换使用 computed。',
    '顶层 prop 只读不代表对象深度冻结，共享对象和数组仍应由父级所有者修改。',
    '运行时校验只在开发阶段提供警告，不能代替真实的数据解析与生产校验。',
  ],
})
