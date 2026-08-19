---
id: engineering.typescript.learn.advanced.framework-type-integration
type: lesson
title: Vue/TSX 类型连接
summary: 把 TypeScript 接入 Vue SFC、TSX 和 Vue Router typed routes，识别嵌入式工具链的检查边界
domain: frontend
technology: engineering
module: typescript
related:
  - engineering.typescript.learn.advanced.library-author-boundaries
  - vue.router.learn.advanced.typed-file-based-routing
tags:
  - TypeScript
  - Vue
  - SFC
  - TSX
  - Vue Router
  - typed routes
appliesTo: TypeScript 7.0.2、Vue 3.5.40、Vue Router 5.2.0
verifiedAt: 2026-08-06
sources:
  - title: "Vue TypeScript Overview"
    url: https://vuejs.org/guide/typescript/overview.html
    sourceType: official-reference
    appliesTo: Vue 3.5.40
    claims:
      - SFC lang=ts
      - vue-tsc
  - title: "Vue Composition API TypeScript"
    url: https://vuejs.org/guide/typescript/composition-api.html
    sourceType: official-reference
    appliesTo: Vue 3.5.40
    claims:
      - script setup
      - ref
  - title: "TypeScript JSX"
    url: https://www.typescriptlang.org/docs/handbook/jsx.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - TSX
      - jsx option
  - title: "Vue Router Typed Routes"
    url: https://router.vuejs.org/guide/advanced/typed-routes.html
    sourceType: official-reference
    appliesTo: Vue Router 5.2.0
    claims:
      - RouteRecordInfo
      - TypesConfig.RouteNamedMap
stage: advanced
level: advanced
estimatedMinutes: 65
prerequisites:
  - engineering.typescript.learn.advanced.library-author-boundaries
objectives:
  - 用 vue-tsc 检查带 lang="ts" 的 Vue SFC
  - 用 defineProps 与 defineEmits 描述组件输入和事件合同
  - 解释 TSX 的 jsx 选项与框架 JSX 类型来源
  - 用 RouteRecordInfo 和 RouteNamedMap 约束 route name 与 params
  - 区分 TypeScript 合同、7.0 API 缺口和未运行的插件、SSR/HMR 行为
recap:
  - SFC 类型检查需要能理解 `.vue` 的 vue-tsc 工具链。
  - TSX 是 TypeScript 文件格式和 JSX 编译合同，不自动代表 React 运行时。
  - typed routes 只有在 route map 进入 program 后才会约束导航参数。
---

# Vue/TSX 类型连接

## 一、为什么需要

TypeScript 在 `.ts` 文件里工作得很好，但 Vue 应用还包含 SFC、模板、组合式 API 和路由说明符。框架工具链
把这些嵌入的语言边界转换成 TypeScript program；课程目标是理解这条连接，知道哪一层已经验证、哪一层仍需
真实构建或浏览器验证。开始前应先阅读本课来源中的 TypeScript JSX Reference；本课不重复创建 Reference
正文，也不把框架运行时能力混入 TypeScript 合同。

## 二、核心概念和最小模型

Vue SFC 可以在 `<script setup lang="ts">` 中使用普通 TypeScript 类型和组合式 API。

~~~~vue
<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  courseId: string
  completed?: boolean
}

const props = withDefaults(defineProps<Props>(), { completed: false })
const emit = defineEmits<{ select: [id: string] }>()
const title = ref(`课程 ${props.courseId}`)

// 向父组件发出当前课程选择事件。
function selectCourse(): void {
  emit('select', props.courseId)
}
</script>

<template>
  <button type="button" @click="selectCourse">{{ title }}{{ props.completed ? '（已完成）' : '' }}</button>
</template>
~~~~

`.tsx` 文件则需要 `jsx` 选项和匹配的 JSX 类型来源；它只是另一种表达组件 render 的文件形式。

~~~~tsx
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {
    const title = ref('TypeScript')
    return () => <h2>{title.value}</h2>
  },
})
~~~~

Vue Router 的 typed routes 通过 route map 把名字和参数连接起来：

~~~~ts
import type { RouteRecordInfo } from 'vue-router'

interface RouteNamedMap {
  course: RouteRecordInfo<'course', '/courses/:id', { id: string }, { id: string }>
}
~~~~

应用再通过 `TypesConfig.RouteNamedMap` 做 module augmentation，`useRoute<'course'>()` 和
`router.push({ name: 'course', params: { id: 'ts' } })` 才能获得具体合同。

## 三、知识点详解

### 1. Vue SFC 的 `lang="ts"`

**它是什么：** 在 `<script setup>` 或 `<script>` 上添加 `lang="ts"`，让 Vue 文件中的脚本进入 TypeScript
检查流程。

**它有什么用：** props、emits、refs 和模板表达式可以共享类型来源，组件调用错误能在编译期发现。

**怎么使用：** 为脚本声明 `lang="ts"`，使用 `defineProps`、`defineEmits` 等宏写出组件边界，再用
`vue-tsc` 检查 SFC。

~~~~vue
<script setup lang="ts">
const props = defineProps<{ courseId: string }>()
const emit = defineEmits<{ select: [id: string] }>()
</script>

<template>
  <button type="button" @click="emit('select', props.courseId)">
    {{ props.courseId }}
  </button>
</template>
~~~~

### 2. TSX 与 JSX 配置

**它是什么：** TSX 是包含 JSX 的 TypeScript 文件；`jsx` 和 `jsxImportSource` 决定 JSX 如何转译以及从哪里取得类型。

**它有什么用：** 配置正确后，`.tsx` 中的组件属性和 JSX 元素才会使用目标框架的类型合同。

**怎么使用：** 在 tsconfig 中设置与框架匹配的 JSX 选项，并把 `.tsx` 纳入 `include`；不要因为后缀是
`.tsx` 就默认套用其他框架运行时。

~~~~json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "vue"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
~~~~

### 3. 组件 props 与 emits

**它们是什么：** `defineProps` 描述父组件传入的数据，`defineEmits` 描述子组件可以发出的事件和参数。

**它们有什么用：** 组件输入输出形成双向合同，调用处传错字段或事件参数时会收到诊断。

**怎么使用：** 为 props 写对象或接口类型，为 emits 写事件名到参数元组的映射，并在模板中使用这些值。

~~~~ts
interface CourseProps {
  id: string
  completed?: boolean
}

type CourseEvents = {
  select: [id: string]
  complete: []
}
~~~~

### 4. typed routes

**它是什么：** `RouteRecordInfo` 和 `TypesConfig.RouteNamedMap` 把 route name、path 参数和导航参数连接起来。

**它有什么用：** `router.push` 和 `useRoute` 不再接受任意字符串或缺失参数，路由变更会反馈到调用方。

**怎么使用：** 为公开路由写 route map，再通过模块增强或生成声明把 map 加入当前 TypeScript program。

~~~~ts
import type { RouteRecordInfo } from 'vue-router'

interface RouteNamedMap {
  course: RouteRecordInfo<'course', '/courses/:id', { id: string }, { id: string }>
}
~~~~

### 5. 编译验证与运行验证

**它是什么：** `vue-tsc` 证明 SFC、TSX 和路由的静态合同；插件、HMR、SSR 和浏览器行为属于另一类运行反馈。

**它有什么用：** 分开报告可以避免把类型检查通过误写成框架运行时能力已经验证。

**怎么使用：** 先让声明文件被 tsconfig include，再运行 `vue-tsc --noEmit`；运行时能力使用对应的构建或
浏览器反馈环验证。

~~~~text
npx vue-tsc --noEmit
~~~~

## 四、动手实践：把组件、路由与事件串成一条类型链

先在 Vue 单文件组件中声明 props 和 emits，再让路由参数成为调用方必须提供的数据。

~~~~vue
<script setup lang="ts">
const props = defineProps<{ courseId: string; title: string }>()
const emit = defineEmits<{ select: [courseId: string] }>()
</script>

<template>
  <button type="button" @click="emit('select', props.courseId)">
    {{ props.title }}
  </button>
</template>
~~~~

~~~~ts
import type { RouteRecordInfo } from 'vue-router'

export interface RouteNamedMap {
  course: RouteRecordInfo<'course', '/courses/:id', { id: string }, { id: string }>
}
~~~~

运行 `npx vue-tsc --noEmit`，然后故意遗漏 course 路由的 id 或把 select 事件参数改成 number。修复调用后，再沿着“路由参数 → 组件 props → emit 参数”解释类型如何贯穿框架边界。
## 五、易错使用提示

:::pitfalls
### 用 tsc 单独检查 Vue SFC

**触发条件：** 只运行 `tsc`，却期待模板和 `.vue` 文件被完整检查。

**原因：** 普通 TypeScript compiler 不负责 Vue SFC 的文件转换和模板类型桥接。

**后果：** script 可能通过，模板错误直到其他工具才出现。

**错误示例：**

~~~~text
tsc -p tsconfig.json
~~~~

**正确写法：**

~~~~text
vue-tsc -p tsconfig.json --noEmit
~~~~

**验证方式：** 正例用 `vue-tsc -p` 检查 SFC，另写模板或 props 负例。

### 把 TSX 当成 React 课程

**触发条件：** 文件后缀是 `.tsx` 就引入 React 专有 API 和运行时假设。

**原因：** JSX 语法和运行时库是两个不同合同。

**后果：** `jsxImportSource`、JSX namespace 和实际 render 函数不匹配。

**错误示例：**

~~~~json
{ "include": ["src/**/*.tsx"] }
~~~~

**正确写法：**

~~~~json
{ "compilerOptions": { "jsx": "preserve", "jsxImportSource": "vue" } }
~~~~

**验证方式：** 在固定 TSX 示例中检查 `vue` 类型和输出模式。

### 只写 route name 不写参数

**触发条件：** `router.push({ name: 'course' })` 被认为足够安全。

**原因：** 动态 path 的参数是运行时导航合同的一部分。

**后果：** URL 生成时缺少 `id`，错误被推迟到运行时。

**错误示例：**

~~~~ts
router.push({ name: 'course', params: {} })
~~~~

**正确写法：**

~~~~ts
router.push({ name: 'course', params: { id: 'ts' } })
~~~~

**验证方式：** 缺少 `id` 的负例固定 `TS2345`。

### route map 没有进入 program

**触发条件：** 声明文件生成了，但 `tsconfig` 没有 include 它。

**原因：** module augmentation 只对当前 TypeScript program 生效。

**后果：** name 和 params 退回泛型或宽松类型，误以为 typed routes 已启用。

**错误示例：**

~~~~json
{ "exclude": ["src/typed-router.d.ts"] }
~~~~

**正确写法：**

~~~~json
{ "include": ["src/**/*.ts", "src/**/*.vue", "src/typed-router.d.ts"] }
~~~~

**验证方式：** 先移除 route map，确认负例不再诊断，再恢复并得到 `TS2345`。

### 用类型检查声称插件行为已验证

**触发条件：** `vue-tsc` 通过后声称 Vite HMR、SSR 或 Devtools 一定正常。

**原因：** 这些行为由运行时和插件链决定，不是静态 route/type 合同。

**后果：** 未运行的集成被错误标成已验证。

**错误示例：**

~~~~text
vue-tsc exit 0，因此 SSR/HMR PASS
~~~~

**正确写法：**

~~~~text
vue-tsc 只检查类型；SSR、HMR 和 Devtools 需要各自的运行流程
~~~~

**验证方式：** 报告分别列出 `vue-tsc`、build、browser 的证据。
:::

## 六、工作原理与适用边界

:::steps
### SFC 是嵌入式 program 输入

官方 Vue 文档说明 `vue-tsc` 承担 SFC 类型检查。**实践建议：** SFC 类型错误要在 vue-tsc seam 观察。**使用边界：**
`tsc` 的绿色结果不能替代它。

### JSX 语法与运行时分离

官方 TypeScript 文档定义 `jsx` 选项和 TSX 检查。**实践建议：** 先匹配目标框架类型，再决定文件形式。**使用边界：**
不因为 TSX 文件而扩展 React 教学范围。

### route map 是声明合同

官方 Router 文档定义 `RouteRecordInfo` 和 `TypesConfig.RouteNamedMap`。**实践建议：** 把 route name/params
当作公共接口。**使用边界：** 类型合同仍需运行时 router 配置和浏览器导航验证。
:::

:::exercise
### 为课程详情页接入类型路由

**要求：** 写 `home` 与 `/courses/:id` 两条 `RouteRecordInfo`，在 Vue SFC 中读取 `id`，在 TSX 组件中显示
标题，并让 `router.push` 使用 route map。

**完成标准：** `vue-tsc` 正例 exit 0；缺少 `id` 的调用得到 `TS2345`；报告明确未验证的 Vite/SSR/HMR 行为。
:::

## 七、本节小结

TypeScript 连接框架时要把 SFC、TSX 和 route map 当作不同的输入边界，并使用对应工具验证。完成本课后，
TypeScript 课程路线到达终点；Vite、React、SSR、HMR 和 Devtools 仍由各自阶段与匹配环境验证。

:::code-details{title="查看本节完整配置"}
~~~~text
// 安装类型检查与框架依赖
npm install vue@3.5.40 vue-router@5.2.0
npm install -D typescript@7.0.2 vue-tsc

// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "jsx": "preserve",
    "jsxImportSource": "vue",
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue", "src/**/*.d.ts"]
}

// src/typed-router.d.ts
import 'vue-router'
import type { RouteRecordInfo } from 'vue-router'
export {}
declare module 'vue-router' {
  interface TypesConfig {
    RouteNamedMap: {
      'course-detail': RouteRecordInfo<
        'course-detail',
        '/courses/:courseId',
        { courseId: string | number },
        { courseId: string },
        never
      >
    }
  }
}

// src/CourseCard.vue
<script setup lang="ts">
const props = defineProps<{ id: string; title: string }>()
const emit = defineEmits<{ open: [courseId: string] }>()
</script>
<template><button @click="emit('open', props.id)">{{ props.title }}</button></template>

// src/CourseBadge.tsx
export const CourseBadge = (props: { text: string }) => <strong>{props.text}</strong>

// src/navigation.ts
import type { Router } from 'vue-router'
/** 使用已声明的路由名称和参数导航。 */
export function openCourse(router: Router, courseId: string) {
  return router.push({ name: 'course-detail', params: { courseId } })
}

// 验证：npx vue-tsc --noEmit
~~~~
:::

## 八、参考资料

- [Vue TypeScript Overview](https://vuejs.org/guide/typescript/overview.html) - SFC 与 vue-tsc。
- [Composition API TypeScript](https://vuejs.org/guide/typescript/composition-api.html) - 组合式 API 类型。
- [TypeScript JSX](https://www.typescriptlang.org/docs/handbook/jsx.html) - TSX 和 jsx 选项。
- [Vue Router Typed Routes](https://router.vuejs.org/guide/advanced/typed-routes.html) - route map 类型连接。
