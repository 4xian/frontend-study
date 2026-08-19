---
id: vue.core.reference.single-file-component.script-setup
type: reference
title: <script setup>
summary: 查询 script setup 的模板作用域、编译器宏、运行时 helper 与工具链边界
domain: frontend
technology: vue
module: core
related:
  - vue.core.learn.basics.sfc-basics
  - vue.core.learn.basics.reactive-state
  - vue.core.reference.components.props
  - vue.core.reference.components.emits
  - vue.core.reference.components.slots
  - vue.core.reference.components.attrs
  - vue.core.reference.built-ins.suspense
tags:
  - script setup
  - defineProps
  - defineEmits
  - defineOptions
  - useSlots
  - useAttrs
  - 顶层 await
  - generic
appliesTo: Vue 3.5.40
verifiedAt: 2026-08-03
sources:
  - title: Vue <script setup> API
    url: https://cn.vuejs.org/api/sfc-script-setup.html
  - title: Vue 单文件组件语法定义
    url: https://cn.vuejs.org/api/sfc-spec.html
  - title: Vue 3.5 响应式 Props 解构说明
    url: https://blog.vuejs.org/posts/vue-3-5
  - title: Vue 3.5.40 script 编译器
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/compileScript.ts
  - title: Vue 3.5.40 Props 宏处理
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/script/defineProps.ts
  - title: Vue 3.5.40 Props 解构转换
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/script/definePropsDestructure.ts
  - title: Vue 3.5.40 模板导入使用分析
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/script/importUsageCheck.ts
  - title: Vue 3.5.40 顶层 await 转换
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/script/topLevelAwait.ts
  - title: Vue 3.5.40 setup 运行时辅助
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/apiSetupHelpers.ts
  - title: Vue 3.5.40 script 编译测试
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/__tests__/compileScript.spec.ts
group: single-file-component
signature: |-
  <script setup lang="ts" generic="T">
  // 每个组件实例执行；顶层绑定可直接用于模板
  </script>
anchors:
  - 基本语法
  - 响应式
  - 使用组件
  - 使用自定义指令
  - defineProps() 和 defineEmits()
  - defineOptions()
  - useSlots() 和 useAttrs()
  - 与普通的 <script> 一起使用
  - 顶层 await
  - 导入语句
  - 泛型
  - 限制
  - 易错使用提示
  - 源码推导与适用场景
---

# &lt;script setup&gt;

## 一、基本语法

`<script setup>` 是单文件组件中使用组合式 API 的编译时语法糖。块内可执行语句进入生成的 `setup()`，因此每创建一个组件实例都会执行一次；顶层变量、函数和 import 可直接在同一 SFC 模板中使用，不需要构造返回对象或再次注册。

:::tip
模板可见不等于公开实例可见。父组件通过模板引用访问子组件时，script setup 组件默认是关闭的；需要公开的成员由已有 `defineExpose()` Reference 负责。
:::

## 二、响应式

`<script setup>` 不会把普通 JavaScript 值自动变成响应式状态。仍须使用 `ref()`、`reactive()`、`computed()` 等 API；ref 在模板中自动解包，而脚本逻辑仍通过 `.value` 读写。

~~~~vue
<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <button @click="count++">{{ count }}</button>
</template>
~~~~

## 三、使用组件

导入的组件是模板词法作用域中的变量，可以直接写成 PascalCase 标签。动态组件应把组件变量传给 `<component :is>`；命名空间导入还支持 `<Form.Input />` 这样的点号成员。显式同名导入优先于 SFC 文件名递归自引用。

~~~~vue
<script setup>
import ProfileCard from './ProfileCard.vue'
import * as Form from './form-components'
</script>

<template>
  <ProfileCard />
  <Form.Input />
  <component :is="compact ? ProfileCard : Form.Input" />
</template>
~~~~

## 四、使用自定义指令

本地指令顶层绑定必须遵循 `vNameOfDirective` 命名约定，例如 `vFocus` 对应模板 `v-focus`。从模块导入时可以用别名适配；变量本身仍须满足自定义指令的公开形状。全局注册指令不受本地命名约定影响。

~~~~vue
<script setup>
import { focus as vFocus } from './directives'
</script>

<template><input v-focus /></template>
~~~~

## 五、defineProps() 和 defineEmits()

`defineProps()` 与 `defineEmits()` 是仅在 script setup 中可用的编译器宏，不需要 import，并会在编译结果中被消除。声明会转成组件运行时 props / emits 选项，同时为脚本中的 props 对象和 emit 函数提供类型。

每个宏的运行时参数和 TypeScript 类型参数必须二选一。声明会提升到模块作用域，不能引用 setup 内创建的局部值，但可以引用 import。类型式声明由 AST 静态转换，不等于运行完整 TypeScript 类型分析。

~~~~vue
<script setup lang="ts">
const { title = '未命名' } = defineProps<{ title?: string }>()
const emit = defineEmits<{ save: [id: number] }>()
</script>
~~~~

:::warning
Vue 3.5+ 会把同一 script setup 中的 props 解构标识符读取改写为 `props.title` 等价访问。解构变量不是 Ref；交给 `watch()` 等需要响应式源的 API 时应传 `() => title`。
:::

## 六、defineOptions()

Vue 3.3+ 的 `defineOptions()` 用于声明 `inheritAttrs` 或插件自定义选项，免去只为这些静态选项增加普通 script。它也是编译器宏，参数会提升，不能读取实例局部状态；`props`、`emits`、`expose` 和 `slots` 应继续使用各自专用宏。

~~~~vue
<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
  audit: 'profile-panel',
})
</script>
~~~~

## 七、useSlots() 和 useAttrs()

模板通常直接使用 `$slots` 与 `$attrs`。setup 逻辑确实需要它们时，从 `vue` 导入 `useSlots()`、`useAttrs()`；二者是真实运行时函数，返回值分别等价于 `setupContext.slots` 和 `setupContext.attrs`，普通组合式 API 也能调用。

:::warning
`useAttrs()` 返回对象会反映最新透传 attribute，但不是响应式对象。需要建立侦听契约的输入应声明成 prop；只需在渲染或更新时读取时再使用 attrs。
:::

## 八、与普通的 &lt;script&gt; 一起使用

一个 SFC 可以同时包含一个普通 `<script>` 和一个 `<script setup>`。普通 script 适合模块作用域只执行一次的副作用、具名导出和仍无法由宏表达的组件选项；script setup 负责每个实例的状态与逻辑。

两块不是共享局部变量的混合词法作用域。script setup 变量不会自动成为组件实例属性，Options API 也不能靠 `this` 读取。若必须深度混用两套 API，应改用显式 `setup()`，让输入和返回值清晰可见。

## 九、顶层 await

script setup 允许顶层 await，并编译成 `async setup()`。编译器使用内部 `withAsyncContext()` 包装 await，在恢复后保持当前组件实例上下文；这个保障不适用于任意异步回调。

:::warning
异步 setup 需要 `<Suspense>` 协调 pending UI，而 Suspense 当前仍是实验性功能。编译成功不等于加载、失败与超时体验已经设计完成。
:::

## 十、导入语句

import 遵循 ECMAScript 模块规范并保留在模块作用域。`@/`、`~/` 等 alias 由 Vite、TypeScript 等项目配置提供，不是 Vue 内建。导入绑定可以直接用于模板插值、组件标签、动态组件和符合命名约定的本地指令。

compiler-sfc 根据 template AST 分析实际运行时引用，区分类型 import 和运行时 binding；注释或纯文本中出现同名字符串不会建立模板绑定。

## 十一、泛型

Vue 3.3+ 的 TypeScript SFC 可以通过 `<script setup lang="ts" generic="T">` 声明组件类型参数。值使用 TypeScript 类型参数列表语法，支持多个参数、`extends` 约束、默认类型和导入类型，并可供类型式宏引用。

:::tip
`generic` 只服务 SFC 与 TypeScript 语言工具链，不会在浏览器生成运行时泛型或自动 prop 校验器。本页不引入外部泛型组件 helper。
:::

## 十二、限制

`<script setup>` 依赖完整 SFC 文件上下文，不能使用 `src` attribute 外置到 `.js` 或 `.ts` 文件。普通 script 与 script setup 并存时也必须由 compiler-sfc 一起处理，不能通过外部 source 拼接作用域。

script setup 不支持 DOM 内根组件模板。浏览器不会自行编译服务器输出 HTML 中的 `<script setup>`；它必须位于 `.vue` 文件并经过 SFC 工具链预处理。

## 十三、易错使用提示

:::pitfalls
### 把每实例执行误当成自动响应式或模块单例

**触发条件：** 把每实例执行误当成自动响应式或模块单例

**原因：** script setup 会随每个实例执行，但普通变量仍是非响应式值，一次性副作用也会重复。

**后果：** 模板不更新，或每挂载一个实例都重复初始化连接与 SDK。

**错误示例：**

~~~~vue
<script setup>
bootAnalytics()
let count = 0
</script>
~~~~

**正确写法：**

~~~~vue
<script>bootAnalyticsOnce()</script>
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>
~~~~

**验证方式：** 对照正确写法验证结果。

### 把局部导入组件重新写成字符串名称

**触发条件：** 把局部导入组件重新写成字符串名称

**原因：** 模板把导入组件和动态目标当作词法变量，字符串走运行时名称解析。

**后果：** 局部组件无法解析，出现警告或渲染成意外标签。

**错误示例：**

~~~~vue
<script setup>
import Panel from './Panel.vue'
</script>
<template><component :is="'Panel'" /></template>
~~~~

**正确写法：**

~~~~vue
<script setup>
import Panel from './Panel.vue'
</script>
<template><component :is="Panel" /></template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 导入本地指令后未使用 vName 命名

**触发条件：** 导入本地指令后未使用 vName 命名

**原因：** 模板通过 `vNameOfDirective` 约定识别 script setup 顶层本地指令。

**后果：** 模板中的指令找不到局部绑定，钩子不会执行。

**错误示例：**

~~~~js
import { focus } from './directives'
~~~~

**正确写法：**

~~~~js
import { focus as vFocus } from './directives'
~~~~

**验证方式：** 对照正确写法验证结果。

### 混用宏的运行时与类型声明，或引用 setup 局部值

**触发条件：** 混用宏的运行时与类型声明，或引用 setup 局部值

**原因：** 两种声明形式互斥，宏参数与选项还会提升到模块作用域。

**后果：** compiler-sfc 直接报错，组件无法生成。

**错误示例：**

~~~~ts
const required = readFlag()
defineProps<{ title: string }>({ title: { type: String, required } })
~~~~

**正确写法：**

~~~~ts
defineProps<{ title: string }>()
defineEmits<{ save: [id: number] }>()
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 3.5 props 解构变量当成 Ref 或跨文件响应式值

**触发条件：** 把 3.5 props 解构变量当成 Ref 或跨文件响应式值

**原因：** 响应性来自同一 script setup AST 中的标识符改写，解构变量没有 `.value`。

**后果：** `watch(foo, ...)` 不是合法响应式源，抽离后也失去预期更新。

**错误示例：**

~~~~ts
const { foo } = defineProps<{ foo: string }>()
watch(foo, logValue)
~~~~

**正确写法：**

~~~~ts
const { foo } = defineProps<{ foo: string }>()
watch(() => foo, logValue)
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 useSlots() 与 useAttrs() 当成免导入宏或响应式 store

**触发条件：** 把 useSlots() 与 useAttrs() 当成免导入宏或响应式 store

**原因：** 二者是真实运行时函数，必须导入；attrs 虽保持最新值但不是响应式对象。

**后果：** 漏导入时标识符未定义，侦听 attrs 也无法形成可靠契约。

**错误示例：**

~~~~js
const attrs = useAttrs()
watch(() => attrs.mode, syncMode)
~~~~

**正确写法：**

~~~~ts
import { useAttrs } from 'vue'
const props = defineProps<{ mode: string }>()
const attrs = useAttrs()
~~~~

**验证方式：** 对照正确写法验证结果。

### 让普通 script 的 Options API 读取 script setup 局部变量

**触发条件：** 让普通 script 的 Options API 读取 script setup 局部变量

**原因：** 普通 script 是模块作用域，script setup 是每实例 setup 作用域。

**后果：** Options 方法中的 `this.count` 为 undefined，或组件契约被重复声明。

**错误示例：**

~~~~vue
<script>export default { mounted() { console.log(this.count) } }</script>
<script setup>const count = ref(0)</script>
~~~~

**正确写法：**

~~~~js
const count = ref(0)
onMounted(() => console.log(count.value))
~~~~

**验证方式：** 对照正确写法验证结果。

### 使用顶层 await 却没有 Suspense 边界

**触发条件：** 使用顶层 await 却没有 Suspense 边界

**原因：** 顶层 await 生成 async setup，编译器不负责独立提供 pending 与失败体验。

**后果：** 父树没有协调的加载 UI，并把实验性能力误当成同步渲染。

**错误示例：**

~~~~vue
<template><AsyncPanel /></template>
~~~~

**正确写法：**

~~~~vue
<Suspense>
  <AsyncPanel />
  <template #fallback>加载中</template>
</Suspense>
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 generic、src 和 DOM 内模板当成运行时标签能力

**触发条件：** 把 generic、src 和 DOM 内模板当成运行时标签能力

**原因：** 它们属于 SFC / TypeScript 工具链输入，浏览器不会自行执行 SFC 编译。

**后果：** `src` 触发编译诊断，DOM 中的块不转换，泛型也不产生运行时校验。

**错误示例：**

~~~~html
<script setup src="./feature.ts" generic="T"></script>
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts" generic="T extends { id: string }">
defineProps<{ items: T[] }>()
</script>
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 十四、源码推导与适用场景

:::steps
### 1. 每实例 setup 与模板绑定

`compileScript.ts` 把 script setup 语句包装进生成的 `setup()`，并为顶层声明建立 binding metadata；固定测试验证生成代码与绑定分类。每实例状态适合放在这里，跨实例单例应属于显式模块。

### 2. 宏调用消除并转成组件契约

编译器调用专用 processor 并移除纯宏调用，官方测试断言 props / emits 进入组件选项、返回绑定改接生成的 setup 输入。宏适合声明静态契约，不适合在事件发生后动态调用。

### 3. 运行时与类型声明必须二选一

`defineProps.ts` 与 `defineEmits.ts` 分别记录 runtime / type declaration，同时存在就诊断。类型式声明适合 TypeScript 项目，但复杂类型仍受 AST 转换能力限制。

### 4. 3.5 解构是标识符改写，不是创建 Ref

`definePropsDestructure.ts` 注册 key、别名与默认值，只改写未被局部变量遮蔽的引用。它适合简洁读取；作为跨函数响应式源时仍应传 getter。

### 5. 模板决定 import 的运行时使用

`importUsageCheck.ts` 解析 template AST 而不是搜索原始字符串，并区分类型 import。导入 helper 可直接用于模板，注释或文本中的同名内容不会建立运行时引用。

### 6. 组件与指令命名由同一次模板分析覆盖

分析器为非原生标签加入 camelized / PascalCase 名，对点号标签取根命名空间，对指令加入 `v` + PascalCase 名。这解释局部组件和指令绑定，不等于全局注册。

### 7. defineOptions() 被合并而不是运行时执行

`defineOptions.ts` 拒绝类型参数、重复调用及专用宏字段，测试验证调用从输出消失并合入默认导出。它适合静态组件选项，不适合实例状态。

### 8. slots 与 attrs 来自运行时 setup context

`apiSetupHelpers.ts` 从当前实例 setup context 返回 slots / attrs。组合式函数可以按需调用，但必须导入真实函数，不能省略 import 冒充编译器宏。

### 9. 普通 script 与 setup 只在编译结果合并

`normalScript.ts` 分析并按需改写普通 script 默认导出，`compileScript.ts` 再合并 import、组件选项与 setup。适合“模块一次 + 实例多次”的明确分工，不构成跨块局部变量共享。

### 10. 顶层 await 保存并恢复组件实例上下文

`topLevelAwait.ts` 把 await 改写为获取 Promise、等待和恢复上下文的序列，并调用 `withAsyncContext()`。这个变换只覆盖 script setup 顶层 await，不能推广到任意异步回调。

### 11. generic 与限制属于 SFC 工具链边界

SFC parser 保存 language block attribute，compiler-sfc 测试覆盖 generic 输入，并对 script setup `src` 与不兼容双 script 报错。这只证明编译器入口，不替代 TypeScript 语言服务或 DOM 浏览器支持。
:::
