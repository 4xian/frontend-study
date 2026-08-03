# Vue Core 基础课程：单文件组件基础调研

> 调研日期：2026-07-29
>
> 适用基线：Vue 3.5.40；当前仓库使用 `vue ^3.5.40`、
> `@vitejs/plugin-vue ^6.0.8` 与 Vite。
>
> 资料范围：Vue 中文官网、Vue SFC 规范、Vue 官方工具链文档，以及
> `vuejs/core` 的 `v3.5.40` 固定标签 `compiler-sfc` 源码与说明。外部资料通过
> Tavily 检索并回到一手页面核验；本文不依赖社区教程。

## 课程边界

本课回答“一个 `.vue` 文件是什么、三个顶层块分别负责什么、它怎样成为一个组件模块，
以及代码和样式的边界在哪里”。下一课“模板语法”再解释插值、属性绑定、指令、事件、
表达式限制等模板内部规则。本课示例中的模板内容只用于标出 SFC 结构，不把这些语法当成
教学目标。

## 适合零基础课程的知识顺序

### 1. 先建立正确产物模型：`.vue` 不是浏览器原生文件格式

- `.vue` 是 Vue 规定的自定义文件格式，写法与 HTML 兼容，但浏览器不会直接把整个文件
  当成可执行组件。
- `@vue/compiler-sfc` 先解析各顶层块；模板会预编译为 JavaScript 渲染函数，脚本成为组件
  模块的一部分，样式则交给构建工具处理。最终交给浏览器的是标准 JavaScript 与 CSS。
- 因此“能写类似 HTML 的标签”不等于“可以像普通 HTML 一样双击运行”。

**来源（核验：2026-07-29）：** [Vue：单文件组件如何工作](https://cn.vuejs.org/guide/scaling-up/sfc.html#how-it-works)、
[Vue SFC 语法规范](https://cn.vuejs.org/api/sfc-spec.html)、
[`@vue/compiler-sfc` 3.5.40 说明](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/README.md)。

### 2. 再认识三个块，而不是先学块内语法

```vue
<script setup lang="ts">
const title = '个人资料'
</script>

<template>
  <article class="profile-card">...</article>
</template>

<style scoped>
.profile-card {
  border: 1px solid #d7dce2;
}
</style>
```

- `<template>` 描述该组件要渲染的视图；一个 SFC 最多一个顶层模板块。
- `<script setup>` 放组件实例所需的逻辑。它会被编译为 `setup()` 的内容，每创建一个组件
  实例都会执行一次；顶层变量、函数和导入可被同文件模板使用。
- `<style>` 放 CSS；一个 SFC 可以有多个样式块。没有 `scoped` 时仍是全局 CSS，写上
  `scoped` 才启用 Vue 的组件作用域转换。

这里先讲“职责与数量”，不解释模板中的 `...` 如何变成内容。

**来源（核验：2026-07-29）：** [Vue SFC 规范：相应语言块](https://cn.vuejs.org/api/sfc-spec.html#language-blocks)、
[Vue：`<script setup>` 基本语法](https://cn.vuejs.org/api/sfc-script-setup.html#basic-syntax)。

### 3. 把一个 SFC 看成一个组件模块

- SFC 编译后是默认导出组件对象的标准 ES 模块，因此其他文件可以
  `import ProfileCard from './ProfileCard.vue'`。
- 在 `<script setup>` 中，导入的组件能直接作为当前模板里的组件标签；这个可见性是局部的，
  不会让它自动出现在整个应用中。
- 同一个组件被使用多次会创建多个实例。组件文件提供同一份定义，但每个实例拥有各自的
  setup 执行过程和实例状态。

**来源（核验：2026-07-29）：** [Vue：组件基础](https://cn.vuejs.org/guide/essentials/component-basics.html#defining-a-component)、
[Vue：局部注册](https://cn.vuejs.org/guide/components/registration.html#local-registration)、
[Vue 术语表：组件](https://cn.vuejs.org/glossary/#component)。

### 4. 单独建立 `<script setup>` 的编译时心智模型

- `setup` 不是浏览器认识的 `<script>` attribute，而是 SFC 编译器处理的语法。
- 顶层绑定“可在模板使用”是编译结果，不是把变量挂到 `window`，也不是全局注册。
- `defineProps()`、`defineEmits()` 等属于编译器宏；零基础课可先说明“它们不用导入且会被
  编译处理”，具体通信规则留到组件课程。
- 普通 `<script>` 是模块作用域，模块首次加载时执行；`<script setup>` 是实例作用域，
  每个实例都会执行。两者不能互换理解。

**来源（核验：2026-07-29）：** [Vue：`<script setup>`](https://cn.vuejs.org/api/sfc-script-setup.html)、
[`compileScript.ts` 3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/compileScript.ts)。

### 5. 最后讲样式边界：`scoped` 是编译转换，不是 Shadow DOM

- `<style scoped>` 会把选择器与模板元素改写为带同一作用域标识的形式，例如
  `.title[data-v-xxxx]` 与 `<h2 data-v-xxxx>`。
- 它提供类似局部样式的效果，但没有创建 Shadow DOM，也没有改变浏览器的 CSS 继承规则。
- 父组件的 scoped 样式通常不会进入子组件内部；子组件根元素是特例，会同时受到父、子两边
  的作用域样式影响，便于父组件负责布局。

**来源（核验：2026-07-29）：** [Vue SFC CSS：组件作用域 CSS](https://cn.vuejs.org/api/sfc-css-features.html#scoped-css)、
[`compileStyle.ts` 3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/compileStyle.ts)、
[`pluginScoped.ts` 3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/style/pluginScoped.ts)。

### 6. 用工具链收尾：语言能力不等于项目已经配置

- Vite 项目通过官方 `@vitejs/plugin-vue` 支持 SFC；`@vue/compiler-sfc` 是底层编译能力，
  通常由插件调用，不是初学者手工编译每个文件的 API。
- `lang="ts"`、`lang="scss"`、外部 `src` 块和自定义块都需要相应工具链支持。SFC 语法允许
  声明预处理语言，不代表对应预处理器已经安装。
- `@vue/compiler-sfc` 应通过 `vue/compiler-sfc` 深层导入使用，以便与 Vue 运行时版本同步。

**来源（核验：2026-07-29）：** [Vue：工具链](https://cn.vuejs.org/guide/scaling-up/tooling.html)、
[Vue SFC 规范：预处理器与 `src`](https://cn.vuejs.org/api/sfc-spec.html#pre-processors)。

## 真实常见易错点

### 1. 把 `.vue` 当成浏览器可以原生导入的 JavaScript 模块

- **错误原因：** SFC 的外观接近 HTML，且编译后确实是 ES 模块，容易跳过“编译后”这个前提。
  浏览器本身没有解析 SFC 顶层块、生成 render 函数或处理 scoped CSS 的能力。
- **实际后果：** 在普通静态 HTML 中直接导入 `.vue` 时，请求得到的是未编译源码，浏览器无法
  把它作为标准 JavaScript 执行；页面不会得到可用的组件模块。
- **错误示例方向：**

```html
<script type="module">
  import App from './App.vue'
</script>
```

- **正确示例方向：** 让已经配置 `@vitejs/plugin-vue` 的 Vite 项目处理同一个导入；浏览器接收
  插件转换后的 JavaScript 与 CSS，而不是原始 `.vue` 文件。

```ts
// vite.config.ts
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
})
```

**来源（核验：2026-07-29）：** [Vue：SFC 必须编译](https://cn.vuejs.org/guide/scaling-up/sfc.html#how-it-works)、
[Vue 工具链：`@vitejs/plugin-vue`](https://cn.vuejs.org/guide/scaling-up/tooling.html#vite)、
[`@vue/compiler-sfc` 3.5.40 的集成边界](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/README.md)。

### 2. 为了拆页面，在同一个 SFC 写多个顶层 `<template>` 或 `<script setup>`

- **错误原因：** 误把顶层块当成可以任意重复的 HTML 容器。SFC descriptor 只有一个
  `template`、一个 `script` 和一个 `scriptSetup` 槽位，只有 `styles` 与自定义块是数组。
- **实际后果：** 编译器报告一个 SFC 只能包含一个对应顶层块，文件无法正常转换；第二个块
  不会变成“第二个组件”。
- **错误示例方向：**

```vue
<template><header>...</header></template>
<template><main>...</main></template>
```

- **正确示例方向：** 一个 SFC 表达一个组件，在唯一模板块中组织该组件视图；需要独立组件时
  新建并导入另一个 SFC。样式确有全局与局部两种边界时，可以保留多个 `<style>` 块。

```vue
<template>
  <div>
    <header>...</header>
    <main>...</main>
  </div>
</template>
```

**来源（核验：2026-07-29）：** [Vue SFC 规范：顶层块数量](https://cn.vuejs.org/api/sfc-spec.html#language-blocks)、
[`parse.ts` 3.5.40 的 `SFCDescriptor`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/parse.ts)。

### 3. 把 `<script setup>` 当成普通 `<script>`，在里面写 `export default`

- **错误原因：** `<script setup>` 会整体变成组件的 `setup()` 内容；组件默认导出由编译器合成，
  不能再在这个实例作用域里声明 ES 模块导出。
- **实际后果：** SFC 编译器报出 `<script setup> cannot contain ES module exports`，组件无法编译。
  同类误解还会让人把只应执行一次的模块副作用放进 setup，结果每创建一个实例就执行一次。
- **错误示例方向：**

```vue
<script setup lang="ts">
export default {
  name: 'ProfileCard',
}
</script>
```

- **正确示例方向：** 普通组件逻辑直接写在 `<script setup>`；Vue 3.3+ 的组件选项可优先使用
  `defineOptions()`。确实需要具名导出或仅执行一次的模块逻辑时，再使用普通 `<script>`。

```vue
<script setup lang="ts">
defineOptions({ name: 'ProfileCard' })

const title = '个人资料'
</script>
```

**来源（核验：2026-07-29）：** [Vue：`<script setup>` 与普通 `<script>`](https://cn.vuejs.org/api/sfc-script-setup.html#usage-alongside-normal-script)、
[`compileScript.ts` 3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/compileScript.ts)、
[Vue 官方 docs issue #2532](https://github.com/vuejs/docs/issues/2532)。

### 4. 只写 `<UserCard />`，以为同目录组件会自动发现或全局可见

- **错误原因：** 文件位置不会注册组件。在 `<script setup>` 中，组件标签对应当前作用域里的
  变量；显式 import 才把子组件绑定带进当前 SFC。局部导入也不会向兄弟组件传播。
- **实际后果：** Vue 无法解析组件并给出组件解析警告，页面不会渲染预期的 `UserCard` 实现；
  依赖关系也无法从父组件源码中确认。
- **错误示例方向：**

```vue
<template>
  <UserCard />
</template>
```

- **正确示例方向：**

```vue
<script setup lang="ts">
import UserCard from './UserCard.vue'
</script>

<template>
  <UserCard />
</template>
```

**来源（核验：2026-07-29）：** [Vue：局部注册](https://cn.vuejs.org/guide/components/registration.html#local-registration)、
[Vue：`<script setup>` 中使用组件](https://cn.vuejs.org/api/sfc-script-setup.html#using-components)。

### 5. 以为写在 SFC 里的 `<style>` 天然只影响当前组件

- **错误原因：** 普通 `<style>` 最终仍是普通全局 CSS。`scoped` 也不是运行时沙箱，而是编译器
  给选择器和当前组件元素增加作用域 attribute；它不会自动获得 Shadow DOM 的完整隔离语义。
- **实际后果：** 不加 `scoped` 的通用类名会污染其他页面；加了 `scoped` 后，又可能错误期待
  父组件规则能直接命中子组件内部节点。父 scoped 样式只把子组件根元素作为明确的布局边界。
- **错误示例方向：**

```vue
<style>
.title {
  color: red;
}
</style>
```

上面的 `.title` 会匹配应用中其他位置的同名元素。另一个错误方向是在父组件 scoped 样式中
写 `.user-card .title`，却期待它默认穿透并控制 `UserCard` 的内部 `.title`。

- **正确示例方向：** 当前组件的规则使用 `scoped` 和清晰的 class；子组件内部视觉由子组件
自己负责，父组件只调整子组件根元素的布局。确有跨边界需求时再明确评估 `:deep()`，不要把它
当默认写法。

```vue
<style scoped>
.profile-card__title {
  color: red;
}
</style>
```

**来源（核验：2026-07-29）：** [Vue SFC CSS：scoped 转换与子组件根元素](https://cn.vuejs.org/api/sfc-css-features.html#scoped-css)、
[`compileStyle.ts` 3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/compileStyle.ts)、
[`pluginScoped.ts` 3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/style/pluginScoped.ts)。

## 从编译机制可推导的适用场景与高级提示

### 1. 按“模块一次”与“实例每次”选择脚本位置

`<script setup>` 被编译进 `setup()`，适合每个实例各自建立的状态、生命周期和组合式逻辑；
普通 `<script>` 保留 ES 模块执行语义，适合具名导出、单例对象或只需要执行一次的模块副作用。
这不是个人代码风格，而是执行次数不同。不要为了共享一段实例逻辑就同时维护两套 API。

**适用场景：** 页面同时渲染多个卡片组件时，把卡片状态留在 `<script setup>`；只有确实要让
所有实例共享同一模块对象时，才把该对象放到模块作用域。

**来源（核验：2026-07-29）：** [Vue：基本语法与逐实例执行](https://cn.vuejs.org/api/sfc-script-setup.html#basic-syntax)、
[Vue：与普通 `<script>` 一起使用](https://cn.vuejs.org/api/sfc-script-setup.html#usage-alongside-normal-script)。

### 2. 看到 `?vue&type=...` 请求时，按块定位工具链问题

`@vue/compiler-sfc` 先解析 descriptor，构建插件再分别转换 script、template 和 style，最后
由一个 facade 模块把脚本、render 函数、样式与 scope id 组装起来。这种分块也是模板热更新
通常不重置组件状态、样式热更新通常不触发组件重渲染的基础。

**适用场景：** Vite 日志或浏览器网络记录出现 `Component.vue?vue&type=style`、
`type=template` 时，先检查对应块和预处理器，不要把所有错误都归因于组件运行时。

**来源（核验：2026-07-29）：** [`@vue/compiler-sfc` 3.5.40 高层工作流](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/README.md)、
[`compileTemplate.ts` 3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/compileTemplate.ts)、
[`compileStyle.ts` 3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/compileStyle.ts)。

### 3. 把子组件根元素当成父子样式的布局交界面

父组件与子组件各自的 scope id 都会作用到子组件根元素，因此父组件可以合理地控制这个根元素
在父布局中的外边距、尺寸或定位，而子组件继续控制自身内部结构。这是 scoped CSS 明确保留的
边界，不等于父组件可以任意控制子组件内部。

**适用场景：** 列表页需要调整每个卡片根元素的宽度或外边距时，可以由列表组件负责；卡片
标题、按钮等内部样式仍放在卡片组件中。若频繁需要 `:deep()`，通常说明组件样式契约需要重审。

**来源（核验：2026-07-29）：** [Vue SFC CSS：子组件的根元素](https://cn.vuejs.org/api/sfc-css-features.html#child-component-root-elements)、
[`pluginScoped.ts` 3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/style/pluginScoped.ts)。

### 4. 把预处理器、外部块和自定义块视为构建能力

`lang`、`src` 与自定义块只是把处理需求交给工具链。比如 `lang="scss"` 仍需安装 Sass；
自定义 `<i18n>` 或 `<docs>` 块需要插件定义其转换方式；`<script setup>` 因依赖 SFC 上下文，
明确不支持 `src` attribute。

**适用场景：** 从纯 CSS/TypeScript 升级到 Sass、Pug、自定义块，或准备把 SFC 各块拆到外部
文件时，先核对 Vite 插件与预处理器支持，而不是只改标签 attribute。

**来源（核验：2026-07-29）：** [Vue SFC 规范：预处理器、`src` 与自定义块](https://cn.vuejs.org/api/sfc-spec.html#pre-processors)、
[Vue：`<script setup>` 限制](https://cn.vuejs.org/api/sfc-script-setup.html#restrictions)、
[Vue：自定义块工具链集成](https://cn.vuejs.org/guide/scaling-up/tooling.html#sfc-custom-block-integrations)。

## 建议的课程收束检查

学完本课，学习者应能只依据文件结构回答以下问题：

1. 为什么 `.vue` 文件需要构建工具，浏览器最终收到什么？
2. `<template>`、`<script setup>`、`<style>` 各自负责什么，哪些块可以重复？
3. 为什么 import 一个子组件后只在当前 SFC 中可直接使用？
4. `<script setup>` 的代码何时执行，和普通 `<script>` 有什么关键区别？
5. 普通样式、scoped 样式、子组件根元素三者的边界是什么？

如果答案开始解释 `v-bind`、`v-if`、`v-for`、事件修饰符或模板表达式细节，应移到后续
“模板语法”及相应专题，不在本课扩写。
