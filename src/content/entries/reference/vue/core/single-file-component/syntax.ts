/**
 * 知识点：单文件组件语法
 * 查证来源（2026-08-03）：
 * - https://cn.vuejs.org/api/sfc-spec.html
 * - https://cn.vuejs.org/guide/scaling-up/sfc.html
 * - https://cn.vuejs.org/guide/scaling-up/tooling.html
 * - https://github.com/vuejs/core/tree/fa2885d8c48768d26f1666a01bd540ffe3b20f9b
 * 查证工具：Tavily、Vue 中文官网、vuejs/core v3.5.40 固定提交源码与官方测试
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'vue.core.reference.single-file-component.syntax',
  type: 'reference',
  title: '单文件组件语法',
  summary: '查询 Vue SFC 的顶层语言块、名称推导、预处理器、外部源与注释边界',
  ecosystem: 'vue',
  module: 'core',
  collection: 'single-file-component',
  related: [
    'vue.core.learn.basics.sfc-basics',
    'vue.core.learn.basics.template-syntax',
    'vue.core.reference.built-ins.template-primitives',
  ],
  tags: ['SFC', '.vue', '语言块', 'lang', 'src', '自动名称推导', '注释'],
  sources: [
    {
      title: 'Vue 单文件组件语法定义',
      url: 'https://cn.vuejs.org/api/sfc-spec.html',
    },
    {
      title: 'Vue 单文件组件指南',
      url: 'https://cn.vuejs.org/guide/scaling-up/sfc.html',
    },
    {
      title: 'Vue 工具链指南',
      url: 'https://cn.vuejs.org/guide/scaling-up/tooling.html',
    },
    {
      title: 'Vue 3.5.40 SFC 解析器',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/parse.ts',
    },
    {
      title: 'Vue 3.5.40 SFC 解析测试',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/__tests__/parse.spec.ts',
    },
    {
      title: 'Vue 3.5.40 script 编译器',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/compileScript.ts',
    },
    {
      title: 'Vue 3.5.40 script 编译测试',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/__tests__/compileScript.spec.ts',
    },
    {
      title: 'Vue 3.5.40 template 编译器',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/compileTemplate.ts',
    },
    {
      title: 'Vue 3.5.40 template 编译测试',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/__tests__/compileTemplate.spec.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-08-03',
  anchors: [
    '总览',
    '相应语言块',
    '自动名称推导',
    '预处理器',
    'src 导入',
    '注释',
    '易错使用提示',
    '源码推导与适用场景',
  ],
})

export default defineReference({
  meta,
  signature: `<template>...</template>
<script>...</script>
<script setup>...</script>
<style>...</style>
<custom-block>...</custom-block>`,
  blocks: [
    { type: 'heading', content: '总览' },
    {
      type: 'text',
      content:
        'Vue 单文件组件通常使用 `.vue` 扩展名，是语法兼容 HTML 的自定义组件文件格式。文件由顶层 `<template>`、`<script>`、`<style>` 和可选自定义块组成；SFC 工具链先解析这些块，再交给相应编译器处理，不是让浏览器把整个文件当作普通 HTML 直接运行。',
    },
    {
      type: 'text',
      content:
        '模板内容会预编译为 JavaScript render 函数。顶层 `<template>` 是 SFC 语言块容器；组件模板内部带结构指令的 `<template>` 才是无包装分组，两者不能互换。',
    },
    { type: 'heading', content: '相应语言块' },
    {
      type: 'table',
      headers: ['顶层块', '数量', '公开边界'],
      rows: [
        ['`<template>`', '最多一个', '内容交给模板编译器，预编译为 render 函数'],
        ['普通 `<script>`', '最多一个', '作为 ES 模块执行，默认导出组件选项或组件定义'],
        ['`<script setup>`', '最多一个', '可与一个普通 script 并存；完整语义留到下一批'],
        ['`<style>`', '可以多个', '可混合普通、scoped 或 module 封装'],
        ['自定义块', '可以多个', '转换行为完全由工具链集成决定'],
      ],
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<template><ProfileCard /></template>

<script lang="ts">
export const featureName = 'profile'
</script>

<script setup lang="ts">
import ProfileCard from './ProfileCard.vue'
</script>

<style scoped>/* 组件局部样式 */</style>`,
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '普通 `<script>` 与 `<script setup>` 合法并存，但本页只记录顶层块数量和外部源禁令；宏、顶层绑定、普通 script 协作、顶层 await、泛型与其他限制属于下一批。',
    },
    { type: 'heading', content: '自动名称推导' },
    {
      type: 'text',
      content:
        'SFC 会根据文件名推导组件名，用于开发警告、DevTools 展示和递归自引用。例如 `FooBar.vue` 可以在自己的模板中写 `<FooBar />`。同名的显式导入或注册组件优先于自引用推导。',
    },
    {
      type: 'text',
      content:
        '文件名推导不是全局注册。其他 SFC 仍须正常导入或注册 `FooBar.vue`，也不能依靠推导名替代显式业务身份或公开注册表。',
    },
    { type: 'heading', content: '预处理器' },
    {
      type: 'text',
      content:
        '任意语言块都可以用 `lang` 声明语言处理器，例如 `<script lang="ts">`、`<style lang="scss">` 或 `<template lang="pug">`。`lang` 只声明语言，不会安装、加载或实现处理器；Vite、vue-loader 等工具链必须有对应集成，项目也必须自行安装 Sass、Pug 等依赖。',
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '一篇语法参考不会验证仓库未安装的预处理语言。只有项目真实安装并由构建工具接入后，才可以声称对应 `lang` 可编译。',
    },
    { type: 'heading', content: 'src 导入' },
    {
      type: 'text',
      content:
        '语言块可以通过 `src` 引入外部内容，例如 `<template src="./template.html">`、`<style src="./style.css">` 或 `<script src="./script.js">`。路径按 JavaScript 模块导入规则解析：相对路径必须以 `./` 开头，也可以从已安装的 npm 依赖解析；自定义块同样可以声明 `src`。',
    },
    {
      type: 'text',
      content:
        '`<script setup>` 禁止使用 `src`，因为移出组件后其编译上下文不明确。一个 SFC 同时存在普通 `<script>` 与 `<script setup>` 时，普通 script 也不能再使用 `src`；两类 script 必须由 SFC 编译器一起处理。',
    },
    { type: 'heading', content: '注释' },
    {
      type: 'text',
      content:
        '每个语言块使用自身语言的注释语法：template 使用 HTML 注释，script 使用 JavaScript 或 TypeScript 注释，style 使用 CSS 注释，Pug 等预处理块遵循对应语言。SFC 根级、所有语言块之外只能使用 `<!-- ... -->` HTML 注释。',
    },
    {
      type: 'text',
      content:
        '解析器会按 source range 保留 block 原始内容，供后续对应编译器处理；这不保证所有注释都会进入最终生产输出，是否删除仍取决于模板、脚本、样式或预处理器的后续编译配置。',
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '重复声明只能出现一次的 SFC 顶层块',
          description:
            'template、普通 script 和 script setup 各最多一个；只有 style 与自定义块可以有多个。',
          consequence: 'SFC parser 报告重复块，组件无法继续编译。',
          wrong: {
            lang: 'vue',
            content: `<script>export default {}</script>
<script>export const shared = true</script>`,
          },
          correct: {
            lang: 'vue',
            content: `<script>export const shared = true</script>
<script setup>const local = true</script>`,
          },
        },
        {
          title: '把文件名推导当成全局注册或最高优先级名称',
          description: '自动名只服务开发显示与递归自引用，同名显式导入或注册组件具有更高优先级。',
          consequence: '其他组件省略导入后解析失败，或递归位置实际渲染同名导入组件。',
          wrong: {
            lang: 'vue',
            content: '<template><FooBar /></template>',
          },
          correct: {
            lang: 'vue',
            content: `<script setup>
import FooBar from './FooBar.vue'
</script>
<template><FooBar /></template>`,
          },
        },
        {
          title: '以为 lang 会安装处理器，或让 script setup 使用 src',
          description:
            '`lang` 只选择处理器，缺少依赖会编译失败；script setup 又依赖组件内编译上下文，不能外置。',
          consequence: '构建出现预处理器未安装或 script setup `src` 歧义诊断并中止。',
          wrong: {
            lang: 'vue',
            content: `<template lang="pug">p {{ message }}</template>
<script setup src="./feature.ts"></script>`,
          },
          correct: {
            lang: 'vue',
            content: `<template><p>{{ message }}</p></template>
<script setup lang="ts">const message = 'ready'</script>`,
          },
        },
        {
          title: '省略相对路径前缀，或在 SFC 根级使用块内注释',
          description:
            '`src` 相对导入遵循模块规则并要求 `./`；根级不属于 script 或 style，只接受 HTML 注释。',
          consequence: '路径被当成包请求而解析失败，根级 `//` 或 `/* */` 也不会成为合法 SFC 注释。',
          wrong: {
            lang: 'vue',
            content: `// temporary component
<style src="styles.css"></style>`,
          },
          correct: {
            lang: 'vue',
            content: `<!-- temporary component -->
<style src="./styles.css"></style>`,
          },
        },
      ],
    },
    { type: 'heading', content: '源码推导与适用场景' },
    {
      type: 'text',
      content:
        '以下结论来自 `vuejs/core@fa2885d8` 的固定源码与官方测试，只解释 Vue 3.5.40 的可观察结果；descriptor 字段和 compiler-sfc 内部处理顺序不是 public API。',
    },
    {
      type: 'steps',
      items: [
        {
          title: '6. descriptor 形状对应顶层块数量',
          content:
            '`parse.ts` 的 descriptor 以单值保存 template、script、scriptSetup，以数组保存 styles 与 customBlocks；`parse.spec.ts` 验证前三类重复块诊断以及普通 script 与 script setup 合法并存。这是文件格式 gate，不是运行时组件选项。',
        },
        {
          title: '7. 文件名只在缺少显式名称时参与推导',
          content:
            '`compileScript.ts` 从非匿名 filename 提取 basename，并仅在缺少显式默认导出名称时注入 `__name`；对应测试覆盖普通文件名、带点文件名与显式名称。它适合诊断与自引用便利，不是公共注册表。',
        },
        {
          title: '8. lang 元数据必须匹配真实处理器',
          content:
            '`parse.ts` 只保存 block 的 lang 与 src 元数据；`compileTemplate.ts` 再按 preprocessLang 查找处理器，缺失时返回“not installed”错误。预处理只适合项目已明确采用并安装对应工具的场景。',
        },
        {
          title: '9. script setup 的外部 source 会被明确拒绝',
          content:
            '`compileScript.ts` 对 `scriptSetup.src` 直接报告组件外语法歧义，并在普通 script 与 setup 并存时拒绝普通 `script.src`。外部 source 适合 template、style 或单独普通 script，不适合跨文件拼装 script setup。',
        },
        {
          title: '10. parser 保留源码范围不承诺输出注释',
          content:
            '`parse.ts` 按 block source location 切出原始 content，`parse.spec.ts` 校验内容与 source range。这支持各块先保留自身注释语法的解析边界，但最终是否输出注释仍由对应语言编译器决定。',
        },
      ],
    },
  ],
  notes: [
    '本页不新增 Demo，也不安装 Pug、Sass 或其他预处理依赖。',
    '本页不提前讲解下一批 script setup 宏、顶层绑定、普通 script 协作或运行时辅助。',
  ],
})
