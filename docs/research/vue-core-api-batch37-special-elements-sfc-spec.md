# Vue Core API 第 37 批：模板原语与 SFC 语法官方调研

> 核对日期：2026-08-03
>
> 版本基线：`vue@3.5.40`（固定提交
> `fa2885d8c48768d26f1666a01bd540ffe3b20f9b`）
>
> 范围：仅 `vue/core/reference` 的 4 项模板原语与 6 项 SFC 语法，不进入第 38 批

## 冻结结论

本批建立两个 `merged` 宿主页，不新增 Demo。模板原语页合并 `<component>`、`<template>`、
`key` 和 `is`，按“动态目标 -> 无包装分组 -> VNode 身份 -> 原生元素替换边界”组织；SFC
语法页按“文件结构 -> 语言块 -> 名称 -> 预处理 -> 外部源 -> 注释”组织。每个 manifest 项
保留独立 heading 和 anchor，不能把 `<component :is>` 与原生元素 `is` 合成一个入口，也不能
提前讲解第 38 批 `<script setup>` 的宏、顶层绑定或运行时 helper。

| 官方宿主 | 站内 ID | collection | 标题 |
| --- | --- | --- | --- |
| [特殊元素 / 特殊 Attributes](https://cn.vuejs.org/api/built-in-special-elements.html) | `vue.core.reference.built-ins.template-primitives` | `built-ins` | `模板原语` |
| [单文件组件语法定义](https://cn.vuejs.org/api/sfc-spec.html) | `vue.core.reference.single-file-component.syntax` | `single-file-component` | `单文件组件语法` |

第一个宿主页还应并列引用[特殊 Attributes](https://cn.vuejs.org/api/built-in-special-attributes.html)，
但不另拆第三篇 entry。第二个宿主页沿用官方索引中的 `single-file-component` 分组；实施时若该
collection 尚未进入 Reference 导航，应补真实 collection，而不能把 SFC 内容临时塞进
`built-ins` 或 `advanced`。

## 条目与锚点映射

10 项保持既有 `merged` 深度。heading 使用官方显示名；官网 URL 继续使用英文 fragment，站内
anchor 则使用 `headingId()` 由显示标题生成的真实 ID。两个页面内分别唯一，且 target 必须指向
真实 entry。

| Manifest id | heading | anchor | 目标 entry |
| --- | --- | --- | --- |
| `built-in-special-elements.component` | `<component>` | `component` | `vue.core.reference.built-ins.template-primitives` |
| `built-in-special-elements.template` | `<template>` | `template` | `vue.core.reference.built-ins.template-primitives` |
| `built-in-special-attributes.key` | `key` | `key` | `vue.core.reference.built-ins.template-primitives` |
| `built-in-special-attributes.is` | `is` | `is` | `vue.core.reference.built-ins.template-primitives` |
| `sfc-spec.overview` | `总览` | `总览` | `vue.core.reference.single-file-component.syntax` |
| `sfc-spec.language-blocks` | `相应语言块` | `相应语言块` | `vue.core.reference.single-file-component.syntax` |
| `sfc-spec.automatic-name-inference` | `自动名称推导` | `自动名称推导` | `vue.core.reference.single-file-component.syntax` |
| `sfc-spec.pre-processors` | `预处理器` | `预处理器` | `vue.core.reference.single-file-component.syntax` |
| `sfc-spec.src-imports` | `src 导入` | `src-导入` | `vue.core.reference.single-file-component.syntax` |
| `sfc-spec.comments` | `注释` | `注释` | `vue.core.reference.single-file-component.syntax` |

## 官方来源

### 中文官网

- [内置特殊元素](https://cn.vuejs.org/api/built-in-special-elements.html)：`<component>` 的
  `is` prop、字符串 / 组件定义两类目标、动态原生元素的 `v-model` 边界，以及 `<template>`
  只有在五类指定指令下才触发的无包装语义。
- [内置特殊 Attributes](https://cn.vuejs.org/api/built-in-special-attributes.html)：`key` 的
  公开类型、唯一性、重排 / 销毁 / 强制替换用途，以及原生元素 `is`、customized built-in 与
  `vue:` 前缀的区别。
- [组件基础：动态组件](https://cn.vuejs.org/guide/essentials/component-basics.html#dynamic-components)：
  动态组件切换和 `<KeepAlive>` 保持失活实例的使用场景。
- [组件基础：DOM 内模板解析注意事项](https://cn.vuejs.org/guide/essentials/component-basics.html#in-dom-template-parsing-caveats)：
  `<table>` 等原生 HTML 解析限制，以及 `is="vue:..."` 的适用背景。
- [列表渲染：通过 key 管理状态](https://cn.vuejs.org/guide/essentials/list.html#maintaining-state-with-key)：
  就地更新与有状态列表身份、基础类型 key、`<template v-for>` 的 key 位置。
- [条件渲染](https://cn.vuejs.org/guide/essentials/conditional.html)与
  [插槽指南](https://cn.vuejs.org/guide/components/slots.html)：`<template>` 在 `v-if`、
  `v-for`、`v-slot` 下的多节点分组用途。
- [单文件组件语法定义](https://cn.vuejs.org/api/sfc-spec.html)：六项 SFC heading 的公开契约，
  包括顶层块数量、文件名推导、`lang`、`src` 路径和注释语法。
- [单文件组件指南](https://cn.vuejs.org/guide/scaling-up/sfc.html)与
  [工具链](https://cn.vuejs.org/guide/scaling-up/tooling.html)：SFC 是编译期文件格式，模板会
  预编译；自定义块和预处理器能力取决于工具链，不属于浏览器运行时开关。

### Vue 3.5.40 固定源码与官方测试

- [`transformElement.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/transformElement.ts)、
  [`resolveAssets.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/helpers/resolveAssets.ts)：
  `<component :is>` 的动态目标代码生成、`vue:` 静态前缀处理，以及字符串组件名 / 原生标签名
  的运行时解析回退。
- [`transformElement.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/__tests__/transforms/transformElement.spec.ts)、
  [`resolveAssets.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/helpers/resolveAssets.spec.ts)：
  动态组件字符串、函数 / 对象定义、原生标签和空目标的固定回归证据。
- [`vIf.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/vIf.ts)、
  [`vFor.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/vFor.ts)、
  [`vSlot.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/vSlot.ts)：
  `<template>` 在结构指令和插槽中的编译期消除、fragment / slot 函数生成及 key 传递。
- 对应测试
  [`vIf.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/__tests__/transforms/vIf.spec.ts)、
  [`vFor.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/__tests__/transforms/vFor.spec.ts)、
  [`vSlot.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/__tests__/transforms/vSlot.spec.ts)：
  多子节点 template、`<template v-for>` key 注入和具名插槽 template 的回归样例。
- [`vnode.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/vnode.ts)、
  [`renderer.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/renderer.ts)、
  [`rendererChildren.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/rendererChildren.spec.ts)：
  VNode key 标准化、`type + key` 身份比较、身份变化后的卸载 / 挂载和 keyed children 重排。
- [`compiler-sfc/parse.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/parse.ts)、
  [`parse.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/__tests__/parse.spec.ts)：
  descriptor 的单个 template、普通 script、script setup、多个 styles / custom blocks，block
  内容、attribute、`lang`、`src`、source range 与重复块诊断。
- [`compileScript.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/compileScript.ts)、
  [`compileScript.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/__tests__/compileScript.spec.ts)：
  文件名生成 `__name` 的条件、显式名称优先级、普通 script 与 script setup 的语言一致性，
  以及 script setup 禁止 `src` 的诊断。
- [`compileTemplate.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/compileTemplate.ts)、
  [`compileTemplate.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/__tests__/compileTemplate.spec.ts)：
  template 预处理器选择、`preprocessCustomRequire` 边界、未安装语言处理器的明确失败和编译结果。

Tavily 只用于检索和抽取上述 `cn.vuejs.org` 与固定提交下的 `vuejs/core` 一手来源。未采用
第三方文章、搜索摘要中的非 Vue 结果、`vuejs/core` 浮动 `main`，也未用当前浏览器行为替代
SFC 编译期证据。

## 版本与阶段边界

| 能力 | 最低版本 | 页面必须怎样表达 |
| --- | --- | --- |
| 原生元素 `is="vue:组件名"` | 3.1+ | 只把官网标记归给 Vue 组件替换用法；不得写成 Web 平台 customized built-in 从 Vue 3.1 才存在 |

其余 9 项在本批官网页面没有明确的新增版本徽标。页面以 `appliesTo: 3.5.40` 表达当前核验
基线，不能反推它们都从 3.5.40 才可用。`<script setup>` 只因 SFC 顶层块数量和 `src` 禁令
被提及；其基本语法、响应式、组件 / 指令使用、宏、普通 script 并用、顶层 await、泛型和限制
属于第 38 批 12 项正文，本批不得代讲。

## 10 项公开语义

### `<component>`

用于按 `is` prop 渲染动态组件或元素，公开形状为
`interface DynamicComponentProps { is: string | Component }`。字符串既可以是原生 HTML 标签名，
也可以是已注册组件名；绑定组件定义时无需再按名称注册。内置组件也能作为组件定义传入，若只传
字符串名称则仍需先注册。

这是模板编译期识别的元元素，不是真实组件。目标变化后，渲染器按新旧 VNode 类型与 key 决定
复用或替换；若业务要在切换后保留组件实例，应由 `<KeepAlive>` 显式提供缓存。`v-model` 在
`<component>` 上按组件协议编译；当 `is` 最终解析为原生 `input` / `select` 时不会自动改写为
原生控件协议，应显式绑定 value / checked 与事件。

### `<template>`

只有同时使用 `v-if`、`v-else-if`、`v-else`、`v-for` 或 `v-slot` 时，Vue 才把它作为不产生
真实 DOM 包装的分组占位符。`<template v-for>` 可以携带 `key`；其余 attribute 和指令因没有
真实元素承载而被丢弃。没有上述五类指令时，它会成为原生 HTML `<template>` 元素。

SFC 最外层 `<template>` 是语言块容器，不属于组件模板 AST，也不接受这里讨论的指令语义。
二者名称相同但编译层级不同，页面必须分栏说明。

### `key`

期望 `number | string | symbol`。它给虚拟 DOM diff 提供同一父级下的 VNode 身份；兄弟 key
必须唯一，重复会产生渲染异常。没有 key 时 Vue 尽量就地更新 / 复用同类型元素；有 key 时按
key 重排，并卸载已经消失的身份。

同一位置 key 改变会强制替换元素或组件，而非就地更新，可用于重新触发生命周期或过渡。key 是
渲染器保留字段，不会作为普通 prop 传进子组件。列表应使用稳定业务 ID；对象不是公开合法类型，
index 也不能在会插入、删除或重排的有状态列表中冒充业务身份。

### `is`

`<component :is="target">` 中的 `is` 是元元素的动态目标 prop。原生 HTML 元素上的普通 `is`
则首先属于 Web 平台 customized built-in element 机制；不能因为写了 `<tr is="my-row">` 就
假定 Vue 会把它解析为组件。

需要在 DOM 内模板的 HTML 解析限制下让原生宿主位置渲染 Vue 组件时，使用 3.1+ 的字面量
`is="vue:my-row"`。这和定义 / 注册原生 customized built-in 不是同一能力，也不等于
`<component :is>` 的任意动态表达式。

### 总览

Vue SFC 通常使用 `.vue` 扩展名，是语法兼容 HTML 的自定义组件文件格式。文件由顶层
`<template>`、`<script>`、`<style>` 和可选自定义块组成；这些块由 SFC 工具链解析，不是交给
浏览器按普通 HTML 直接运行。模板内容会预编译为 JavaScript render 函数。

### 相应语言块

- 每个 `.vue` 文件最多一个顶层 `<template>`，其内容交给 `@vue/compiler-dom` 编译。
- 最多一个普通 `<script>`；它作为 ES 模块执行，默认导出应是组件选项对象或
  `defineComponent()` 返回值。
- 最多一个 `<script setup>`，且可以和一个普通 `<script>` 并存；它的更完整语义留给第 38 批。
- 可以有多个 `<style>`，并可混合普通、`scoped` 或 `module` 封装模式。
- 可以有多个自定义块，但如何转换完全由工具链集成决定，单写未知块不会产生业务能力。

### 自动名称推导

SFC 根据文件名推导组件名，用于开发警告格式、DevTools 展示和递归自引用。例如
`FooBar.vue` 可在自己的模板中写 `<FooBar />`。同名的显式导入 / 注册组件优先于自引用推导；
推导也不是全局注册，其他 SFC 仍须正常导入或注册它。

### 预处理器

任意语言块可用 `lang` 声明交给哪种语言处理器，例如 `<script lang="ts">`、
`<style lang="scss">`、`<template lang="pug">`。`lang` 只声明语言，不会安装或实现处理器；
集成方式由 Vite / vue-loader 等工具链决定，所需 Sass、Pug 等依赖必须由项目自行安装。

本仓库当前无需为一篇语法参考新增预处理器。示例可展示声明形状，但不能声称 format check、
浏览器 smoke 或 Vue 运行时已经验证未安装的语言。

### `src` 导入

语言块可以用 `src` 引入外部内容，例如 `<template src="./template.html">`、
`<style src="./style.css">` 或 `<script src="./script.js">`。解析规则与 JavaScript 模块导入
一致：相对路径必须以 `./` 开头，也可从已安装 npm 依赖解析；自定义块同样可声明 `src`。

`<script setup>` 禁止使用 `src`，因为移出组件后其语法上下文不明确。一个 SFC 同时存在普通
`<script>` 与 `<script setup>` 时，普通 script 也不能再使用 `src`，两者必须一起处理。

### 注释

每个语言块使用自身语言的注释语法：template 用 HTML 注释，script 用 JavaScript / TypeScript
注释，style 用 CSS 注释，Pug 等预处理块遵循对应语言。SFC 根级、所有语言块之外只能使用
`<!-- ... -->` HTML 注释。

parser 会按 source range 保留 block 原始内容供后续对应编译器处理，但这不保证所有注释都进入
最终生产输出；是否删除仍由模板、脚本、样式或预处理器的后续编译配置决定。

## 相关站内页面

| 本批内容 | 应关联的现有页面 | 关联原因 |
| --- | --- | --- |
| `<component>`、动态 `is` | `vue.core.learn.intermediate.dynamic-components-keep-alive` | 已有目标切换、组件实例身份和缓存实验 |
| `<component>` 基础组件解析 | `vue.core.learn.basics.component-basics` | 组件注册、动态组件与 DOM 内模板背景 |
| `<template>`、列表 `key` | `vue.core.learn.basics.conditional-list-rendering` | 多节点分支、`<template v-for>` 与有状态列表身份 |
| `key` 的 VNode 身份 | `vue.core.learn.advanced.render-functions-vnodes` | VNode 类型、key 与复用 / 替换完整教学 |
| `key` 触发过渡 | `vue.core.learn.intermediate.transitions` | 进入 / 离开与强制替换的可观察过渡 |
| SFC 六项 | `vue.core.learn.basics.sfc-basics` | 已有 SFC 解剖、编译边界与最小组件结构 |
| 顶层 template 与模板内 template | `vue.core.learn.basics.template-syntax` | 区分语言块容器与 Vue 模板语法 |

## 不新增 Demo 的理由

1. 动态组件身份、KeepAlive、条件 / 列表 key、VNode 和过渡已有可交互课程；再做一个合并页 Demo
   只会复制相同行为，不能增加新的 public seam。
2. SFC 顶层块、`lang`、`src`、文件名和注释都是编译期 / 工具链契约。浏览器中的运行时交互
   无法证明预处理依赖解析、重复块诊断或外部 source 合并，反而会伪造验证范围。
3. 本批两个宿主页是 API 速查与风险路由。结构化错误 / 正确代码和现有课程交叉链接已覆盖学习
   目标；不为每个 anchor 制造低价值 demo、E2E 或新依赖。

## 结构化易错点候选

以下 10 类风险均有独立原因、可观察后果、错误示范和正确示范。实施时可以把相邻说明排在同一
视觉分组，但不能删减动态目标、VNode 身份、SFC 块数量、预处理依赖、`src` 或注释边界。

### 1. 把组件对象的字符串化结果传给 `<component :is>`

- 原因：`is` 接受注册名字符串或组件定义；对象插值 / attribute 字符串化不是组件注册。
- 后果：运行时尝试解析错误标签名，出现组件解析警告或渲染出意外原生元素。

```vue
<!-- 错误 -->
<component is="currentPanel" />

<!-- 正确：currentPanel 是组件定义或响应式组件目标 -->
<component :is="currentPanel" />
```

若传的是注册名字符串，必须确保该名称已注册；直接传导入的组件定义则不需要名称注册。

### 2. 混淆 `<component :is>`、原生 `is` 和 `vue:` 前缀

- 原因：三者分别属于 Vue 元元素 prop、Web 平台 customized built-in、DOM 内模板组件替换。
- 后果：`<tr is="my-row">` 不会按预期解析 Vue 组件，或把平台自定义元素误写成 Vue 组件。

```vue
<!-- 错误：普通原生 is 不表示 Vue 组件 -->
<tr is="my-row"></tr>

<!-- 正确：DOM 内模板受 table 解析限制时 -->
<tr is="vue:my-row"></tr>

<!-- 正确：SFC 中的一般动态目标 -->
<component :is="MyRow" />
```

### 3. 期待动态原生表单元素自动获得原生 `v-model` 协议

- 原因：`<component>` 上的 `v-model` 编译为组件 `modelValue` / `update:modelValue` 协议；
  编译期无法按运行时 `is` 结果重新选择原生控件指令。
- 后果：最终是 `input` / `select` 时，输入值不回写模型。

```vue
<!-- 错误 -->
<component :is="'input'" v-model="username" />

<!-- 正确 -->
<input v-model="username" />
```

确需动态原生标签时，按具体元素显式拆分 property 与 input / change 事件。

### 4. 把任意 `<template>` 都当成无 DOM 包装

- 原因：只有 `v-if`、`v-else-if`、`v-else`、`v-for`、`v-slot` 会触发 Vue 特殊处理。
- 后果：没有指定指令时得到原生 `HTMLTemplateElement`；附加 class / 事件也不会落到分组子节点。

```vue
<!-- 错误：class 不会分发给两个子节点 -->
<template class="actions"><button>保存</button><button>取消</button></template>

<!-- 正确：结构指令下只作无包装分组 -->
<template v-if="canEdit"><button>保存</button><button>取消</button></template>
```

SFC 顶层 `<template>` 又是独立语言块，不应附加模板指令。

### 5. 用重复、对象或会漂移的 index key 表示有状态列表身份

- 原因：公开 key 只支持 `number | string | symbol`，并要求同父级唯一；index 会随重排改变归属。
- 后果：输入值、焦点、组件本地状态或过渡跟到错误数据项，重复 key 还会产生警告。

```vue
<!-- 错误 -->
<RowEditor v-for="(row, index) in rows" :key="index" :row="row" />

<!-- 正确 -->
<RowEditor v-for="row in rows" :key="row.id" :row="row" />
```

### 6. 无意改变 key，导致组件被强制重建

- 原因：VNode 类型相同但 key 不同仍不是同一身份，renderer 会卸载旧树再挂载新树。
- 后果：本地状态、焦点和未保存输入丢失，生命周期及进入 / 离开过渡重新触发。

```vue
<!-- 错误：每次渲染都产生新身份 -->
<ProfileEditor :key="Math.random()" :profile="profile" />

<!-- 正确：稳定身份，只有切换实体时替换 -->
<ProfileEditor :key="profile.id" :profile="profile" />
```

强制替换是有意工具，不应当作“确保更新”的常规手段。

### 7. 写出重复 SFC 顶层块，或把 style 数量规则套到 script

- 原因：template、普通 script、script setup 各最多一个；只有 style 与自定义块可有多个。
- 后果：SFC parser 直接报告重复块，组件无法编译。

```vue
<!-- 错误 -->
<script>export default {}</script>
<script>export const shared = true</script>

<!-- 正确：一个普通 script 可以和一个 script setup 并存 -->
<script>export const shared = true</script>
<script setup>const local = true</script>
```

两类 script 的更完整作用域差异留到第 38 批。

### 8. 把文件名推导当成全局注册或最高优先级名称

- 原因：自动名只服务开发显示与递归自引用；同名显式导入 / 注册优先。
- 后果：其他组件里省略导入后解析失败，或递归位置实际渲染了同名导入组件。

```vue
<!-- 错误：在另一个 SFC 中仅凭文件名假定可用 -->
<FooBar />

<!-- 正确 -->
<script setup>
import FooBar from './FooBar.vue'
</script>
<template><FooBar /></template>
```

### 9. 以为 `lang` 会自动安装预处理器，或让 `<script setup>` 使用 `src`

- 原因：`lang` 只选择语言处理器；缺失依赖会编译失败。script setup 又依赖组件内编译上下文，
  固定源码明确禁止外部 `src`。
- 后果：出现“preprocessor not installed”或 script setup `src` 歧义诊断，构建中止。

```vue
<!-- 错误：项目未安装 Pug，却只声明 lang -->
<template lang="pug">p {{ message }}</template>
<script setup src="./feature.ts"></script>

<!-- 正确：不引入额外预处理器；setup 内容保留在 SFC -->
<template><p>{{ message }}</p></template>
<script setup lang="ts">const message = 'ready'</script>
```

本批研究不授权安装 Pug、Sass 或其他依赖。

### 10. 省略相对路径前缀，或在 SFC 根级使用语言块注释

- 原因：`src` 相对导入遵循模块规则并要求 `./`；根级不属于 script / style，只接受 HTML 注释。
- 后果：路径被当作包请求而解析失败；根级 `//`、`/* */` 也不会按预期被识别为注释，可能被
  工具链当作无效文本或直接忽略。

```vue
<!-- 错误 -->
// temporary component
<style src="styles.css"></style>

<!-- 正确 -->
<!-- temporary component -->
<style src="./styles.css"></style>
```

块内继续使用各自语言的注释；“parser 保留源码片段”不等于生产 bundle 保留所有注释。

## 源码推导与适用场景

以下 10 条均由 `vuejs/core@v3.5.40` 固定源码 / 测试交叉支持，只解释可观察结果，不把 AST、
descriptor 私有处理或 render internals 提升为 public API：

1. [`transformElement.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/transformElement.ts)
   为 `<component :is>` 生成 `resolveDynamicComponent()`；
   [`resolveAssets.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/helpers/resolveAssets.ts)
   对字符串先查组件资产，未命中则保留字符串，因此同一公开入口既可落到注册组件也可落到原生
   标签。适合组件 / 元素目标确实需要运行时切换的界面，不替代普通静态组件标签。
2. 同一 [`transformElement.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/transformElement.ts)
   只在原生元素的静态 `is` 值以 `vue:` 开头时剥离前缀并走组件解析；
   [`transformElement.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/__tests__/transforms/transformElement.spec.ts)
   固定动态组件代码生成。由此不能把普通 platform `is` 与 Vue 动态 prop 互换。
3. [`vIf.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/vIf.ts)、
   [`vFor.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/vFor.ts)
   和 [`vSlot.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/vSlot.ts)
   分别把 template 分组转成条件分支、fragment / renderList 和 slot 函数；三个对应 spec 覆盖多
   子节点及 template key。适合需要多节点而不增加布局 DOM 的五类指定指令场景。
4. [`vnode.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/vnode.ts)
   的 `isSameVNodeType()` 同时比较 `type` 与 `key`；
   [`renderer.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/renderer.ts)
   在身份不同时先 unmount 再 mount。key 因此既能稳定重排身份，也能有意强制重建，但不应被
   随机化为通用刷新按钮。
5. [`rendererChildren.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/rendererChildren.spec.ts)
   固定 append、prepend、move、remove 和 duplicate key 路径；
   [`vFor.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/__tests__/transforms/vFor.spec.ts)
   固定 `<template v-for>` key 注入。稳定业务 ID 适合有输入、焦点或子组件状态的集合。
6. [`parse.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/parse.ts)
   的 descriptor 只有单值 `template` / `script` / `scriptSetup`，但 `styles` / `customBlocks`
   是数组；[`parse.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/__tests__/parse.spec.ts)
   验证重复前三类块的诊断与普通 script + script setup 合法并存。这是文件格式 gate，不是运行时
   组件选项。
7. [`compileScript.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/compileScript.ts)
   从非匿名 filename 提取 basename，并仅在缺少显式默认导出名称时注入 `__name`；
   [`compileScript.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/__tests__/compileScript.spec.ts)
   固定基本、点号文件名和显式名称路径。文件名推导适合诊断 / 自引用便利，不是公共注册表。
8. [`parse.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/parse.ts)
   只把 `lang` / `src` 保存为 block 元数据；
   [`compileTemplate.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/compileTemplate.ts)
   再按 `preprocessLang` 查处理器，缺失时返回“not installed”错误。预处理只适合项目已明确采用并
   安装对应工具的场景。
9. [`compileScript.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/compileScript.ts)
   对 `scriptSetup.src` 直接报“组件外语法歧义”，并在普通 script 与 setup 并存时拒绝普通
   `script.src`。因此外部 source 适合 template / style 或单独普通 script，不适合跨文件拼装
   script setup。
10. [`parse.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/parse.ts)
    按 block source location 切出原始 `content`，
    [`parse.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/__tests__/parse.spec.ts)
    校验 content 与 source range。它支持“各块先保留自己的注释语法”这一解析边界，但最终是否
    输出注释仍交给对应语言编译器，不能从 descriptor 反推生产产物。

## 实施验收与停止边界

1. 只新增 `vue.core.reference.built-ins.template-primitives` 与
   `vue.core.reference.single-file-component.syntax` 两篇 Reference，不新增 Demo。
2. 第一篇 `collection` 为 `built-ins`，第二篇为 `single-file-component`；10 个 manifest id
   都有上表唯一 heading / anchor，正文与真实 target 完成前不得切为 `available`。
3. 两页必须覆盖 10 项公开语义、3.1+ 版本边界、上述 10 类结构化风险和 10 条固定源码推导；
   `<component :is>` / 原生 `is`、template 特殊触发条件、key 基础类型 / 强制替换、块数量、
   预处理依赖、script setup `src` 禁令及根级 HTML 注释属于不可删减边界。
4. 关联现有课程承担完整教学；本批不新增动态组件、列表、过渡或 SFC 重复 Demo，也不安装
   Pug、Sass 等预处理依赖。
5. 本批完成后预期覆盖为 `161 available / 45 planned / 206 total`；必须以实施时 catalog 的
   实时机器输出为准，不能只相信计划数字。
6. 实施时补最少 manifest 完整性断言并运行全量质量 Gate；代表性移动端路径验证两个宿主页的
   10 个 heading、跨 collection 导航、滚动归零、无横向溢出和控制台错误。
7. 第 37 批未达到映射、内容、验证及 Standards / Spec `PASS / 0 finding` 前，不开始第 38 批。
   达到后也只报告下一批是 `<script setup>` 12 项，不自动修改其 manifest、正文、测试或计划。
