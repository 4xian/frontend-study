/**
 * 课程：单文件组件基础
 * 查证来源（2026-07-29）：
 * - https://cn.vuejs.org/guide/scaling-up/sfc.html
 * - https://cn.vuejs.org/api/sfc-spec.html
 * - https://cn.vuejs.org/api/sfc-script-setup.html
 * - https://cn.vuejs.org/api/sfc-css-features.html
 * - https://github.com/vuejs/core/tree/v3.5.40/packages/compiler-sfc/src
 * 查证工具：Tavily、Vue 中文官网与 vuejs/core v3.5.40 源码
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

export const meta = defineLessonMeta({
  id: 'vue.core.learn.basics.sfc-basics',
  type: 'lesson',
  title: '单文件组件基础',
  summary: '认识 .vue 文件的三个核心区块、编译过程，以及 script setup 与 scoped 样式的边界',
  ecosystem: 'vue',
  module: 'core',
  collection: 'basics',
  level: 'beginner',
  prerequisites: [],
  related: [
    'vue.core.learn.basics.template-syntax',
    'vue.core.reference.application.define-component',
  ],
  tags: ['SFC', 'script setup', 'scoped CSS', 'compiler-sfc', 'Vue component'],
  sources: [
    {
      title: 'Vue 单文件组件指南',
      url: 'https://cn.vuejs.org/guide/scaling-up/sfc.html',
    },
    {
      title: 'Vue 单文件组件语法定义',
      url: 'https://cn.vuejs.org/api/sfc-spec.html',
    },
    {
      title: 'Vue script setup',
      url: 'https://cn.vuejs.org/api/sfc-script-setup.html',
    },
    {
      title: 'Vue 单文件组件 CSS 功能',
      url: 'https://cn.vuejs.org/api/sfc-css-features.html',
    },
    {
      title: 'Vue 3.5.40 compiler-sfc 源码',
      url: 'https://github.com/vuejs/core/tree/v3.5.40/packages/compiler-sfc/src',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-29',
  estimatedMinutes: 22,
})

export default defineLesson({
  meta,
  objectives: [
    '说清楚 template、script setup 与 style 三个核心区块的职责',
    '理解 .vue 文件为什么需要 Vite 和 compiler-sfc，而不能直接交给浏览器',
    '区分 script setup 的实例执行语义与 scoped CSS 的选择器重写边界',
  ],
  blocks: [
    { type: 'heading', content: '什么是单文件组件' },
    {
      type: 'text',
      content:
        'Vue 单文件组件（Single-File Component，简称 SFC）通常使用 `.vue` 扩展名，把一个组件强相关的结构、逻辑和样式放进同一个文件。它不是浏览器原生认识的 HTML 文件，而是 Vue 工具链定义的组件源文件。',
    },
    {
      type: 'table',
      headers: ['区块', '负责什么', '本阶段先掌握'],
      rows: [
        ['`<template>`', '描述组件要渲染的结构', '读取脚本顶层绑定并组织标签'],
        ['`<script setup>`', '准备组件数据、依赖与行为', '使用 TypeScript 并暴露顶层绑定'],
        ['`<style scoped>`', '声明当前组件的局部样式', '使用 class 并理解作用域不是完全隔离'],
      ],
    },
    { type: 'heading', content: '从一个最小组件开始' },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
const title = '开始学习 Vue'
</script>

<template>
  <article class="study-card">
    <h2>{{ title }}</h2>
  </article>
</template>

<style scoped>
.study-card {
  padding: 16px;
  border: 1px solid #d2d2d7;
}
</style>`,
    },
    {
      type: 'text',
      content:
        '这三个区块的排列顺序不影响编译结果，但团队应保持一致。`lang="ts"` 告诉工具链按 TypeScript 处理脚本，`setup` 让顶层绑定可以直接被模板使用，`scoped` 则要求编译器给当前组件的选择器增加作用域标记。',
    },
    { type: 'heading', content: '浏览器运行前发生了什么' },
    {
      type: 'steps',
      items: [
        {
          title: '解析 SFC 描述符',
          content:
            '`@vue/compiler-sfc` 读取 `.vue` 文件，识别 template、script、style 及其 attribute。',
        },
        {
          title: '分别编译语言块',
          content:
            '模板被预编译为渲染函数，script setup 被转换为组件 setup 逻辑，scoped 样式被重写为带作用域 attribute 的 CSS。',
        },
        {
          title: '交给构建工具组合',
          content:
            'Vite 在开发时提供模块加载和热更新，在生产构建时输出浏览器能够执行的 JavaScript 与 CSS。',
        },
      ],
    },
    {
      type: 'tip',
      style: 'info',
      content:
        'SFC 适合 SPA、SSG 和其他值得引入构建步骤的项目。只给静态 HTML 增加少量交互时，不一定需要 SFC 工具链。',
    },
    { type: 'heading', content: 'script setup 的执行边界' },
    {
      type: 'text',
      content:
        '`<script setup>` 是编译时语法糖，其中的代码会成为组件 `setup()` 的内容。因此每创建一个组件实例，它都会执行一次；顶层变量、函数和 import 会直接进入模板可用范围。普通 `<script>` 则按 ES 模块语义执行，适合少量模块级声明或组件选项。',
    },
    {
      type: 'compare',
      labels: ['模块级工作', '实例级工作'],
      before: `// constants.ts：模块首次导入时创建
export const dateFormatter = new Intl.DateTimeFormat('zh-CN')`,
      after: `<script setup lang="ts">
// 每个组件实例都有自己的局部值
const createdAt = Date.now()
</script>`,
    },
    { type: 'heading', content: 'scoped 样式如何限制范围' },
    {
      type: 'text',
      content:
        '`scoped` 不是 Shadow DOM。编译器会给模板元素增加类似 `data-v-f3f3eg9` 的 attribute，并把 `.study-card` 改写为 `.study-card[data-v-f3f3eg9]`。普通全局 CSS 仍可能影响该元素，父组件也能从布局角度影响子组件根元素。',
    },
    {
      type: 'code',
      lang: 'css',
      content: `/* 编写时 */
.study-card {
  color: #1d1d1f;
}

/* 编译后的等价选择器 */
.study-card[data-v-f3f3eg9] {
  color: #1d1d1f;
}`,
    },
    {
      type: 'text',
      content:
        '作用域样式仍应优先使用 class。需要明确影响子组件内部时再使用 `:deep()`，需要影响插槽内容时使用 `:slotted()`；不要把深度选择器当成默认写法。',
    },
    { type: 'heading', content: '观察一个真实 SFC' },
    {
      type: 'text',
      content:
        '下面的运行区本身就是一个经过 Vite 编译的 `.vue` 文件。打开源码，可以逐段对应模板结构、脚本绑定和局部样式；具体的插值与属性绑定会在下一课展开。',
    },
    {
      type: 'demo',
      id: 'vue.core.learn.basics.sfc-basics.sfc-anatomy-demo',
      description: '用一个真实组件观察 SFC 三个核心区块的职责',
      playground: true,
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '把 .vue 文件直接交给浏览器',
          description:
            '浏览器不会解析 SFC 顶层区块，也不知道如何把 template 编译成渲染函数。官方要求 SFC 经过 `@vue/compiler-sfc` 与构建工具处理。',
          consequence: '原生模块加载会把 `.vue` 当作未知资源，页面无法获得可执行的组件模块。',
          wrong: {
            lang: 'html',
            content: `<script type="module">
import ProfileCard from './ProfileCard.vue'
</script>`,
          },
          correct: {
            lang: 'bash',
            content: `npm install
npm run dev`,
          },
        },
        {
          title: '在一个文件中写多个顶层 template 或 script setup',
          description:
            'SFC 语法规定每个文件最多一个顶层 template 和一个 script setup；style 可以按需要出现多个。',
          consequence: '编译器无法确定唯一组件结构或 setup 入口，会直接报告重复区块错误。',
          wrong: {
            lang: 'vue',
            content: `<template><header>标题</header></template>
<template><main>正文</main></template>`,
          },
          correct: {
            lang: 'vue',
            content: `<template>
  <header>标题</header>
  <main>正文</main>
</template>`,
          },
        },
        {
          title: '使用 TypeScript 却漏写 lang="ts"',
          description:
            '`lang` 用于声明区块的预处理语言。没有 `lang="ts"` 时，脚本会按普通 JavaScript 解析。',
          consequence: '类型标注会被当成无效 JavaScript 语法，组件无法通过编译。',
          wrong: {
            lang: 'vue',
            content: `<script setup>
const title: string = '课程'
</script>`,
          },
          correct: {
            lang: 'vue',
            content: `<script setup lang="ts">
const title: string = '课程'
</script>`,
          },
        },
        {
          title: '给 script setup 添加 src attribute',
          description:
            'script setup 的编译依赖当前 SFC 上下文，官方明确禁止它与 `src` attribute 一起使用。复用逻辑应通过普通模块导入。',
          consequence: 'compiler-sfc 会拒绝该区块，外部脚本也无法获得正确的组件上下文。',
          wrong: {
            lang: 'vue',
            content: '<script setup lang="ts" src="./profile-card.ts"></script>',
          },
          correct: {
            lang: 'vue',
            content: `<script setup lang="ts">
import { createProfile } from './profile'

const profile = createProfile()
</script>`,
          },
        },
        {
          title: '把昂贵初始化误当成模块只执行一次',
          description:
            'script setup 会随每个组件实例执行。在其中直接创建大型不可变对象，会让同一组件的每个实例重复承担成本。',
          consequence: '列表中批量创建组件时会重复计算和分配内存，初始化成本随实例数增长。',
          wrong: {
            lang: 'vue',
            content: `<script setup lang="ts">
const formatter = new Intl.DateTimeFormat('zh-CN')
</script>`,
          },
          correct: {
            lang: 'ts',
            content: `// formatters.ts
export const dateFormatter = new Intl.DateTimeFormat('zh-CN')

// 组件中直接 import dateFormatter`,
          },
        },
        {
          title: '忘记 scoped 后使用宽泛元素选择器',
          description:
            '没有 scoped 的 style 是全局 CSS。`button`、`p` 等宽泛选择器会匹配应用中其他组件的同类元素。',
          consequence: '新增一个组件后，远处页面的按钮或文字样式也可能被意外改写。',
          wrong: {
            lang: 'vue',
            content: `<style>
button { color: red; }
</style>`,
          },
          correct: {
            lang: 'vue',
            content: `<style scoped>
.save-button { color: red; }
</style>`,
          },
        },
      ],
    },
    { type: 'heading', content: '从编译实现推导使用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '需要组件级内聚时使用 SFC',
          content:
            'compiler-sfc 会分别编译三个区块再组合为组件模块，所以结构、行为和局部样式可以一起演进，又不会要求把所有组件写进同一个文件。',
        },
        {
          title: '按执行频率放置初始化逻辑',
          content:
            'compileScript 会把 script setup 转成 setup 逻辑，因此实例独有状态放在其中；真正只需创建一次的不可变工具应放到普通模块并导入。',
        },
        {
          title: '把 scoped 当作维护边界而非安全边界',
          content:
            'compileStyle 通过 attribute 选择器重写 CSS，没有隔离浏览器全局样式。它适合减少组件间误伤，但不能阻止外部 CSS，也不能隔离不可信内容。',
        },
        {
          title: '让工具链承担模板预编译',
          content:
            '模板在构建阶段变成渲染函数，适合需要 IDE 类型检查、热更新和生产优化的 Vue 应用；极小的无构建页面则应重新评估是否值得引入 SFC。',
        },
      ],
    },
    {
      type: 'exercise',
      title: '拆出你的第一个 SFC',
      instructions:
        '创建 `WelcomeCard.vue`，写出 template、script setup lang="ts" 和 style scoped 三个区块。脚本声明一个静态标题，模板显示它，样式只使用 `.welcome-card` class。',
      answer: `<script setup lang="ts">
const title = '欢迎开始 Vue 学习'
</script>

<template>
  <article class="welcome-card">{{ title }}</article>
</template>

<style scoped>
.welcome-card {
  padding: 16px;
  border: 1px solid #d2d2d7;
}
</style>`,
    },
  ],
  recap: [
    'SFC 是需要 compiler-sfc 与构建工具处理的组件源文件，不是浏览器原生格式。',
    'template 负责结构，script setup 负责实例逻辑，style scoped 提供基于选择器重写的局部样式。',
    '代码应根据模块级或实例级执行频率放置，scoped CSS 也不等于完全隔离。',
  ],
})
