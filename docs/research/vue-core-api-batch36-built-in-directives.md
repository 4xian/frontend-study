# Vue Core API 第 36 批：内置指令官方调研

> 核对日期：2026-08-03
>
> 版本基线：`vue@3.5.40`（固定提交
> `fa2885d8c48768d26f1666a01bd540ffe3b20f9b`）
>
> 范围：仅 `vue/core/reference` 的 15 项内置指令，不进入第 37 批

## 冻结结论

本批建立一篇主题合并页，不新增 Demo。页面按“内容输出 -> 条件与列表 -> 事件与绑定 ->
插槽与编译控制”组织；每项指令保留独立 heading 和 anchor，但复用现有模板语法、条件列表、
事件、表单、插槽与性能课程，不把一张 API 速查页扩成第二套入门课程。

| 官方页面 | 站内 ID | collection | 标题 |
| --- | --- | --- | --- |
| [内置指令](https://cn.vuejs.org/api/built-in-directives.html) | `vue.core.reference.built-ins.directives` | `built-ins` | `内置指令` |

## 条目与锚点映射

15 项都保持既有 `merged` 深度并指向同一 entry。heading 显示名和 anchor 均保留完整的
`v-*` 名称，不删除前缀，也不另造拼接式 anchor。

| Manifest id | heading | anchor | 目标 entry |
| --- | --- | --- | --- |
| `built-in-directives.v-text` | `v-text` | `v-text` | `vue.core.reference.built-ins.directives` |
| `built-in-directives.v-html` | `v-html` | `v-html` | `vue.core.reference.built-ins.directives` |
| `built-in-directives.v-show` | `v-show` | `v-show` | `vue.core.reference.built-ins.directives` |
| `built-in-directives.v-if` | `v-if` | `v-if` | `vue.core.reference.built-ins.directives` |
| `built-in-directives.v-else` | `v-else` | `v-else` | `vue.core.reference.built-ins.directives` |
| `built-in-directives.v-else-if` | `v-else-if` | `v-else-if` | `vue.core.reference.built-ins.directives` |
| `built-in-directives.v-for` | `v-for` | `v-for` | `vue.core.reference.built-ins.directives` |
| `built-in-directives.v-on` | `v-on` | `v-on` | `vue.core.reference.built-ins.directives` |
| `built-in-directives.v-bind` | `v-bind` | `v-bind` | `vue.core.reference.built-ins.directives` |
| `built-in-directives.v-model` | `v-model` | `v-model` | `vue.core.reference.built-ins.directives` |
| `built-in-directives.v-slot` | `v-slot` | `v-slot` | `vue.core.reference.built-ins.directives` |
| `built-in-directives.v-pre` | `v-pre` | `v-pre` | `vue.core.reference.built-ins.directives` |
| `built-in-directives.v-once` | `v-once` | `v-once` | `vue.core.reference.built-ins.directives` |
| `built-in-directives.v-memo` | `v-memo` | `v-memo` | `vue.core.reference.built-ins.directives` |
| `built-in-directives.v-cloak` | `v-cloak` | `v-cloak` | `vue.core.reference.built-ins.directives` |

## 官方来源

### 中文官网

- [内置指令 API](https://cn.vuejs.org/api/built-in-directives.html)：15 项的期望值、参数、修饰符、
  限定位置、示例和 3.2 / 3.4 版本标记。
- [模板语法](https://cn.vuejs.org/guide/essentials/template-syntax.html)：插值与 `v-text`、原始
  HTML、安全边界、动态参数和模板表达式约束。
- [条件渲染](https://cn.vuejs.org/guide/essentials/conditional.html)：`v-if` / `v-show` 的创建、
  销毁、初始成本、切换成本、`<template>` 和相邻分支限制。
- [列表渲染](https://cn.vuejs.org/guide/essentials/list.html)：循环别名、组件作用域、`key` 身份、
  `<template v-for>` 的 key 位置及 `v-if` 优先级。
- [事件处理](https://cn.vuejs.org/guide/essentials/event-handling.html)：方法与内联处理器、
  `$event`、修饰符执行顺序、按键 guard 以及 `.capture` / `.once` / `.passive` 监听选项。
- [表单输入绑定](https://cn.vuejs.org/guide/essentials/forms.html)：原生控件矩阵、JavaScript 状态
  真值来源、IME、值转换和三个内置修饰符。
- [插槽指南](https://cn.vuejs.org/guide/components/slots.html)：默认、具名、作用域和动态插槽的
  合法位置、父级作用域与显式默认插槽语法。
- [安全指南](https://cn.vuejs.org/guide/best-practices/security.html)：不可信模板和 HTML 的 XSS
  边界；不能把 sanitizer 当作允许执行不可信 Vue 模板的理由。
- [性能优化](https://cn.vuejs.org/guide/best-practices/performance.html)：`v-once`、`v-memo`
  的适用范围，以及先测量再做微优化的顺序。

### Vue 3.5.40 固定源码与官方测试

- [`compile.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/compile.ts)、
  [`compiler-dom/index.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-dom/src/index.ts)：
  结构转换顺序、通用指令转换表、DOM 指令覆盖，以及 `v-cloak` 的空转换。
- [`vText.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-dom/src/transforms/vText.ts)、
  [`vHtml.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-dom/src/transforms/vHtml.ts)、
  [`vShow.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-dom/src/transforms/vShow.ts)：
  `textContent` / `innerHTML` 转换、子节点覆盖诊断和 `v-show` 运行时注入。
- [`compiler-core/vIf.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/vIf.ts)、
  [`vFor.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/vFor.ts)：
  条件分支邻接与身份、循环作用域、fragment 类型、key 位置和 `v-for + v-memo` 特殊路径。
- [`compiler-core/vOn.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/vOn.ts)、
  [`compiler-dom/vOn.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-dom/src/transforms/vOn.ts)、
  [`events.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-dom/src/modules/events.ts)：
  事件名、处理器包装与缓存、modifier 分类，以及 DOM listener 的新增、更新和选项解析。
- [`vBind.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/vBind.ts)、
  [`transformVBindShorthand.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/transformVBindShorthand.ts)、
  [`patchProp.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-dom/src/patchProp.ts)：
  `.camel`、`.prop`、`.attr`、同名简写、对象合并和 DOM property / attribute 路由。
- [`compiler-core/vModel.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/vModel.ts)、
  [`compiler-dom/vModel.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-dom/src/transforms/vModel.ts)、
  [`runtime-dom/vModel.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-dom/src/directives/vModel.ts)：
  可写表达式检查、组件协议、原生控件指令选择、IME、Array / Set 和值转换。
- [`vSlot.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/vSlot.ts)、
  [`errors.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/errors.ts)：
  slot props 作用域、静态与动态 slots、条件 / 循环 slots 和非法位置诊断。
- [`parser.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/parser.ts)、
  [`vOnce.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/vOnce.ts)、
  [`vMemo.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/vMemo.ts)：
  `v-pre` 解析边界、一次性缓存与 memo 代码生成。
- [`withMemo.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/helpers/withMemo.ts)、
  [`renderList.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/helpers/renderList.ts)、
  [`runtime-dom/index.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-dom/src/index.ts)：
  memo 浅比较、列表缓存传递和挂载完成后的 `v-cloak` 移除。
- 官方回归测试：
  [`vIf.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/__tests__/transforms/vIf.spec.ts)、
  [`vFor.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/__tests__/transforms/vFor.spec.ts)、
  [`vSlot.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/__tests__/transforms/vSlot.spec.ts)、
  [`vModel.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-dom/__tests__/directives/vModel.spec.ts)、
  [`withMemo.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/helpers/withMemo.spec.ts)、
  [`vCloak.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-dom/__tests__/directives/vCloak.spec.ts)。

Tavily 只用于检索和抽取上述 Vue 官方域名及 `vuejs/core` 一手来源；没有采用第三方教程、
问答或浮动 `main` 分支实现来确定 public contract。源码中的 AST、patch flag、render cache、
私有 DOM 字段和 VNode memo 都只作 3.5.40 实现证据。

## 版本边界

| 能力 | 最低版本 | 页面必须怎样表达 |
| --- | --- | --- |
| `v-bind` 的 `.prop`、`.attr` | 3.2+ | 作为强制 DOM property / attribute 路由，不写成普通布尔修饰符 |
| `v-memo` | 3.2+ | 明确是少用的渲染微优化；低于 3.2 不可用 |
| `v-bind` 同名简写 `:src` | 3.4+ | 等价于 `:src="src"`；不能倒推 3.3 项目也支持 |

其余 12 项在本页没有官网标出的 3.2 / 3.4 新增边界。`v-once` 段落中“从 3.2 起可使用
`v-memo`”描述的是替代工具出现时间，不是 `v-once` 从 3.2 才存在。

## 15 项公开语义

### v-text

期望字符串，更新元素完整 `textContent`。它会替换已有子内容；只更新一段文本时应使用
`{{ message }}` 插值，让同级静态内容继续保留。文本按普通文本处理，不执行 HTML。

### v-html

期望字符串，更新元素完整 `innerHTML`。插入内容不会再次经过 Vue 模板编译，因此其中的
`{{ }}`、`v-on` 或组件标签都只是普通 HTML。只允许可信 HTML；用户输入、URL 参数、评论和
第三方富文本未经可信净化不得直传。动态 HTML 不经过 SFC scoped 标记转换，局部 scoped 样式
不会自动匹配其内部节点。

### v-show

期望任意值并按真假性切换元素内联 `display`。元素、事件监听器和子组件实例一直保留；显示时
恢复初始 display，且可触发 `<Transition>` 的 persisted 过渡。它要求真实元素，不支持
`<template>`，也不能接 `v-else`。频繁显隐或需要保留本地 DOM 状态时适用；初始不渲染、低频
切换或必须释放资源时考虑 `v-if`。

### v-if

期望任意值并按真假性创建或销毁完整分支，包括其指令和组件。初始为假时分支不会创建；可放在
`<template>` 上包裹多节点而不产生额外 DOM。与 `v-for` 同元素时 `v-if` 优先，且不能读取尚未
建立的循环别名，因此应拆成外层 `<template v-for>` 或先在计算属性中过滤。

### v-else

不接表达式，只能作为同一父级内紧邻 `v-if` 或 `v-else-if` 的最后分支。空白和注释可被编译器
作为分支间隔处理，普通元素或非空文本会打断链。可用于 `<template>` 多节点分支。

### v-else-if

期望任意值，可连续组成条件链；每项必须紧邻前一个 `v-if` 或 `v-else-if`。`v-else` 已结束的链
后不能再追加 `v-else-if`。可用于 `<template>` 多节点分支。

### v-for

期望 `Array | Object | number | string | Iterable`，值使用 `alias in source` 或
`alias of source`。数组 / iterable 可接收 `(value, index)`；对象可接收
`(value, key, index)`；正整数范围从 `1` 开始。循环组件不会自动获得 alias，仍要通过 prop
显式传入。

有状态列表应提供稳定、唯一、基础类型的 `key`。不能用对象作 key；重排列表通常不能用 index
冒充业务身份。`<template v-for>` 的 key 放在 `<template>` 本身。完整 key API 留给第 37 批，
本页只保留与列表身份直接相关的约束。

### v-on

带参数时监听该 DOM 事件或组件自定义事件；值可为方法路径、内联语句或函数。内联表达式可读
`$event`。无参数对象语法一次绑定多个事件，但不支持修饰符。

`.stop`、`.prevent`、`.self` 和系统 / 鼠标 guard 按书写顺序运行；按键修饰符匹配
`KeyboardEvent.key`；`.capture`、`.once`、`.passive` 是原生 listener options。组件事件没有
DOM 冒泡语义。`.passive` 表示不会阻止默认行为，不能与 `.prevent` 同用。

### v-bind

带参数时绑定一个 attribute、DOM property 或组件 prop；无参数时合并对象。普通 DOM 绑定默认
根据 key 是否存在于元素上选择 property 或 attribute；`.prop` / `.` 与 `.attr` 可在确有需要时
强制路由，`.camel` 转换 attribute 名。`class` 和 `style` 额外接受对象 / 数组。

组件上的绑定仍受 props 声明约束。对象展开与同名显式绑定按模板出现顺序合并，后出现者决定普通
同名值；class、style 和监听器具有专门合并语义。3.4+ 的 `:src` 只等价于 `:src="src"`，不等于
无值布尔 attribute。

### v-model

仅限原生 `<input>`、`<textarea>`、`<select>` 与组件，并要求可写表达式。原生控件根据类型选择
value / checked、input / change 及运行时指令；JavaScript 状态是初始真值来源。`.lazy` 改为
change 时同步，`.trim` 去首尾空白，`.number` 做宽松数值转换；它们分别不是防抖、通用净化或
“结果永远为 number”的保证。

组件 `v-model` 编译为 prop 和 `onUpdate:*` 写回协议，默认是 `modelValue` /
`update:modelValue`，不是直接操作子组件 DOM。原生 file input 的 value 不可由脚本写入，编译器
拒绝 `v-model`，应使用 change 事件读取 `files`。

### v-slot

参数是插槽名，省略时为 `default`；值是合法函数参数表达式，可用解构接收 slot props。只允许
用于 `<template>`，或在只有单个默认作用域插槽时直接用于组件。`#name` 是缩写，`#` 不能在
缺少名称时单独使用。

同时存在具名插槽时，默认插槽也应写成 `<template #default>`；不能在组件自身 `v-slot` 与内部
`<template v-slot>` 两种形式间混用。slot props 属于父级插槽函数的局部参数，不是可写回子组件
状态的隐式通道。

### v-pre

不接表达式，跳过当前元素及整棵子树的 Vue 编译。其内部插值保留为文字，指令样式 attribute
变成普通 attribute，组件样式标签也按普通元素解析。适合展示原始模板语法，或极大的纯静态子树；
不能只为跳过某一条表达式而包住仍需要响应式或组件解析的区域。

### v-once

不接表达式。首次渲染后缓存元素或组件的整个子树，后续父组件更新不再更新其中任何动态绑定。
它适合生命周期内确定永不变化的内容，不适合“变化很少”的数据。与 `v-for` 同元素时，首次
生成的整段列表会被缓存，后续源列表增删或项目变化都不会反映出来。

### v-memo

3.2+，期望固定形状的依赖数组。组件重渲染时，依赖长度相同且每项按 Vue 的变化判断均未改变，
就复用缓存 VNode 并跳过子树创建与 diff；空数组效果等同 `v-once`。遗漏依赖会产生陈旧 UI，
对象依赖仍需稳定引用，因为比较不是深比较。

它只用于已测量的性能关键边际场景。与 `v-for` 配合时必须和 `v-for`、`:key` 位于同一元素，
不能放在循环内部子元素；key 已表达 item 身份时，memo 数组只需覆盖决定子树是否更新的其他语义。

### v-cloak

不接表达式，只解决无构建步骤的 DOM 模板在挂载前短暂显示 `{{ }}` 的问题。必须配合
`[v-cloak] { display: none }` 等 CSS；挂载完成后 Vue 从挂载容器移除 attribute。SFC 模板已在
构建期编译，通常不需要它；它也不是异步数据加载遮罩。

## 相关站内页面

| 本批内容 | 应关联的现有页面 | 关联原因 |
| --- | --- | --- |
| `v-text`、`v-html`、`v-bind` | `vue.core.learn.basics.template-syntax` | 插值、原始 HTML、动态参数和 attribute 绑定完整教学 |
| `v-show`、`v-if`、`v-else*`、`v-for` | `vue.core.learn.basics.conditional-list-rendering` | 分支选择、切换成本、列表身份和排序实验 |
| `v-on` | `vue.core.learn.basics.event-handling` | 处理器形态、`$event`、修饰符顺序和键盘交互 |
| 原生 `v-model` | `vue.core.learn.basics.form-bindings` | 控件矩阵、IME、Array / Set 和转换边界 |
| 组件 `v-model` | `vue.core.learn.intermediate.component-v-model` | model prop / emit 协议和 `defineModel()` |
| `v-slot` | `vue.core.learn.intermediate.slots` | 父级作用域、具名 / 作用域 / 动态插槽完整教学 |
| `v-once`、`v-memo` | `vue.core.learn.advanced.performance` | 测量、稳定输入和缓存工具选择 |

## 结构化易错点候选

以下 15 类候选风险都有独立原因、可观察后果、错误示范和正确示范。实施时按相邻指令合并为
不超过 10 个结构化分组，但不能删减安全、身份、可写性或缓存边界，也不能压成无示例提示。

### 1. 把用户输入直接交给 v-html

- 原因：运行时直接写入 `innerHTML`，Vue 不提供自动业务级净化。
- 后果：攻击者可注入危险标签、attribute 或 URL，形成 XSS。

```vue
<!-- 错误 -->
<article v-html="route.query.preview" />

<!-- 正确：普通用户文本使用插值 -->
<article>{{ route.query.preview }}</article>
```

确需富文本时，只能接收经过可信、明确策略净化的 HTML；不可信 Vue template 则始终禁止执行。

### 2. 期待 v-html 继续编译 Vue 语法或自动继承 scoped 样式

- 原因：动态 HTML 不经过模板编译，也没有 SFC 编译期的 scope attribute。
- 后果：插值原样显示、事件不绑定、组件不解析，内部节点也匹配不到普通 scoped 选择器。

```vue
<!-- 错误：把模板字符串当组件模板 -->
<section v-html="'<ProfileCard @save=\"save\">{{ name }}</ProfileCard>'" />

<!-- 正确：模板结构使用真实组件 -->
<ProfileCard @save="save">{{ name }}</ProfileCard>
```

### 3. 给 v-text 或 v-html 同时写子内容

- 原因：两者分别设置完整 `textContent` / `innerHTML`，编译器会移除子节点并报告冲突。
- 后果：fallback、静态前缀或组件子树被覆盖。

```vue
<!-- 错误 -->
<p v-text="message">状态：</p>

<!-- 正确 -->
<p>状态：{{ message }}</p>
```

### 4. 在 template 上使用 v-show，或用它期待子组件销毁

- 原因：`v-show` 需要真实元素的 display，并始终保留子树。
- 后果：模板写法无合法样式目标，隐藏后 timer、监听器或本地状态仍存在。

```vue
<!-- 错误 -->
<template v-show="open"><LivePanel /></template>

<!-- 正确：需要释放资源时使用条件分支 -->
<LivePanel v-if="open" />
```

### 5. 用普通节点打断 v-else / v-else-if 邻接链

- 原因：分支只能附着到同一父级的前一个条件分支；普通元素或非空文本会终止查找。
- 后果：编译器报告没有相邻 `v-if`，分支语义失效。

```vue
<!-- 错误 -->
<p v-if="ready">完成</p>
<hr />
<p v-else>处理中</p>

<!-- 正确 -->
<p v-if="ready">完成</p>
<p v-else>处理中</p>
```

### 6. 在同一元素上让 v-if 读取 v-for alias

- 原因：`v-if` 的转换优先于 `v-for`，循环作用域尚未建立。
- 后果：alias 不存在，模板编译失败或条件读取错误变量。

```vue
<!-- 错误 -->
<li v-for="todo in todos" v-if="!todo.done" :key="todo.id">{{ todo.text }}</li>

<!-- 正确 -->
<template v-for="todo in todos" :key="todo.id">
  <li v-if="!todo.done">{{ todo.text }}</li>
</template>
```

若目标是过滤列表，优先使用 computed 产出 `visibleTodos`，避免每次渲染重复条件筛选。

### 7. 用 index、对象或错误位置的 key 表达业务身份

- 原因：key 决定节点复用；index 会随重排改变归属，对象 key 不是公开支持的基础类型；
  `<template v-for>` 的块身份属于 template 容器。
- 后果：输入值、组件本地状态或过渡状态跟到错误数据项，或收到 key 位置诊断。

```vue
<!-- 错误 -->
<template v-for="(item, index) in items">
  <RowEditor :key="index" :item="item" />
</template>

<!-- 正确 -->
<template v-for="item in items" :key="item.id">
  <RowEditor :item="item" />
</template>
```

### 8. 忽略 v-on 修饰符顺序，或同时使用 passive 与 prevent

- 原因：普通 guards 按模板顺序执行；passive 已声明处理器不会阻止默认行为。
- 后果：对子节点事件也提前 prevent，或浏览器忽略 prevent 并输出警告。

```vue
<!-- 错误：先阻止所有来源的默认行为；passive 与 prevent 冲突 -->
<a @click.prevent.self="open" />
<div @touchmove.passive.prevent="track" />

<!-- 正确 -->
<a @click.self.prevent="open" />
<div @touchmove.passive="track" />
```

### 9. 给无参数 v-on 对象语法添加修饰符

- 原因：对象语法一次展开多组事件/处理器，不支持对整张表应用修饰符。
- 后果：修饰符没有预期语义，事件注册与阅读意图不清。

```vue
<!-- 错误 -->
<section v-on.stop="listeners" />

<!-- 正确：需要 guard 时显式绑定对应事件 -->
<section @click.stop="listeners.click" @focus="listeners.focus" />
```

### 10. 把字符串 "false" 当作布尔 attribute 的 false

- 原因：模板字符串是非空字符串；DOM boolean property 会把它转成真。
- 后果：按钮仍被禁用、控件仍为 required 等。

```vue
<!-- 错误 -->
<button :disabled="'false'">保存</button>

<!-- 正确 -->
<button :disabled="false">保存</button>
```

`.attr` / `.prop` 只改变写入通道，不能替代正确的数据类型。

### 11. 忽略 v-bind 对象展开与显式绑定的先后顺序

- 原因：Vue 3 按模板出现顺序合并普通同名属性，后出现者覆盖前值。
- 后果：外部 attrs 意外覆盖本地安全状态，或以为本地绑定总有固定优先级。

```vue
<!-- 错误：attrs 中的 disabled 可能覆盖 locked -->
<button :disabled="locked" v-bind="attrs">保存</button>

<!-- 正确：本地约束放在后面 -->
<button v-bind="attrs" :disabled="locked">保存</button>
```

### 12. 把 v-model 绑定到 prop、const 或循环 alias

- 原因：model 需要生成赋值表达式；prop、literal const 和 `v-for` / `v-slot` 局部参数不可写。
- 后果：编译器拒绝模板，或形成直接修改父级输入的错误设计。

```vue
<!-- 错误：title 是已声明的 prop -->
<input v-model="title" />

<!-- 正确：显式读入并发出更新意图 -->
<input :value="title" @input="emit('update:title', readValue($event))" />
```

### 13. 把静态 value / checked 当作 v-model 初始状态，或给 file input 使用 v-model

- 原因：JavaScript 模型是原生控件的真值来源；file value 又受浏览器安全边界保护。
- 后果：初始 DOM attribute 被模型覆盖，或 file input 直接编译失败。

```vue
<!-- 错误 -->
<input v-model="accepted" type="checkbox" checked />
<input v-model="file" type="file" />

<!-- 正确 -->
<input v-model="accepted" type="checkbox" />
<input type="file" @change="readFiles" />
```

### 14. 混用组件级 v-slot 与内部 template 插槽声明

- 原因：两种声明会造成作用域归属歧义；普通元素也不是合法 `v-slot` 宿主。
- 后果：编译器报告 mixed 或 misplaced slot usage，默认内容可能被忽略。

```vue
<!-- 错误 -->
<DataPanel v-slot="defaultProps">
  <template #actions="actionProps">...</template>
</DataPanel>

<!-- 正确 -->
<DataPanel>
  <template #default="defaultProps">...</template>
  <template #actions="actionProps">...</template>
</DataPanel>
```

### 15. 把编译控制指令当作普通更新提示

- 原因：`v-pre` 跳过整棵子树编译，`v-once` 永久冻结，`v-memo` 只信声明的依赖，`v-cloak`
  只在挂载后移除 attribute。
- 后果：组件或插值变成文字、动态 UI 永久陈旧、漏依赖更新丢失，或缺少 CSS 时仍闪烁模板。

```vue
<!-- 错误 -->
<section v-pre><LiveCounter /></section>
<p v-once>{{ changingMessage }}</p>
<article v-memo="[selected]">{{ selected }} {{ title }}</article>

<!-- 正确 -->
<code v-pre>{{ literalExample }}</code>
<p>{{ changingMessage }}</p>
<article v-memo="[selected, title]">{{ selected }} {{ title }}</article>
```

在普通 SFC 中不添加 `v-cloak`；无构建步骤 DOM 模板使用时必须同时提供 `[v-cloak]` CSS。

## 源码推导与适用场景

以下结论只解释 `vuejs/core@v3.5.40` 的可观察行为，不把内部字段提升为 public API：

1. `transformVText()` 与 `transformVHtml()` 都先清空 AST children，再生成 `textContent` 或
   `innerHTML` prop；这从编译期解释了“不能保留部分子内容”，也说明两者不是普通 children。
2. `v-html` 最终进入 `patchDOMProp()` 的 unsafe innerHTML 分支，代码注释明确把可信内容责任
   留给调用者；Trusted Types 转换不等于业务 sanitizer，页面不能借此弱化 XSS 警告。
3. `v-show` 是少数保留运行时 directive 的内置项。它记录元素原 display，通过指令钩子切换
   `display: none`，并在存在 transition 时调用 persisted 过渡；所以隐藏不等于卸载。
4. `transformIf()` 把相邻条件分支合为一个 IF AST，忽略分支间空白 / 注释，并为每个分支注入
   不同 key；普通节点会终止邻接查找，相同显式 key 也会产生诊断。
5. `transformFor()` 根据稳定性和 key 生成 stable / keyed / unkeyed fragment；运行时
   `renderList()` 分别处理数组、字符串、正整数、Iterable 与对象。key 是复用身份，不是可传给
   组件的普通 prop。
6. `transformOn()` 把方法路径与内联语句区分开，必要时包装 `$event` 函数；DOM 扩展再把 modifier
   分成 runtime guards、key guards 和 listener options。`withModifiers()` 逐项执行，证明顺序
   具有语义。
7. DOM `patchEvent()` 通过稳定 invoker 更新其 `value`，处理器变化时不必每次移除再新增 listener；
   `.once/.passive/.capture` 从事件 prop 后缀解析成原生 options。业务代码不应读取私有 invoker。
8. 无参数 `v-bind` 和 `v-on` 在 `transformElement()` 中分别走 `mergeProps()` 与 `toHandlers()`；
   `.prop` / `.attr` 则编码为特殊前缀，再由 `patchProp()` 强制选择 property / attribute。
9. 通用 `v-model` 先验证表达式可写，并为组件生成 model prop 与 update handler；DOM 编译器随后
   为 input 类型、textarea 和 select 选择专用 runtime directive。这解释了同名语法的两套协议。
10. `vModelText` 在 composition 期间暂停 input 写回；checkbox / select 根据 Array 或 Set 克隆
    集合；file input 在编译期直接报错。适合解释可观察结果，但 `_assign`、`_modelValue` 不是
    业务可依赖接口。
11. `buildSlots()` 把 slot props 编译为函数参数，并把条件、循环、动态名称或外部作用域依赖标记
    为动态 slot；混用组件级和 template 级声明会走明确错误分支。
12. parser 进入 `v-pre` 后把指令样式 token 转为普通 attribute、把插值作为文本，并在当前元素
    边界退出；它跳过的是整棵子树，而不会污染后续兄弟节点。
13. `transformOnce()` 把整个 codegen node 放入 render cache 并配合 block tracking；它不是降低
    更新频率。嵌套 `v-once` 不会产生多层独立缓存。
14. 普通 `v-memo` 编译为 `withMemo()`，运行时先比较数组长度，再逐项用 Vue 的变化判断并保存
    浅快照；`v-for` 则在 renderList 循环内同时核对 cached key 和 memo，解释了“必须同元素”。
15. `v-cloak` 在 compiler-dom 中是 noop，真正行为是 DOM app 完成 mount 后从挂载容器移除
    attribute；因此 CSS 决定挂载前是否隐藏，它也不会自动等待异步数据。

## 实施验收与停止边界

1. 只新增 `vue.core.reference.built-ins.directives` 一篇 Reference，不新增 Demo。
2. 页面 `collection` 为 `built-ins`；15 个 API 都有真实、唯一且逐字一致的 `v-*` heading / anchor，
   manifest target 全指向同一 entry，正文完成前不得切为 `available`。
3. 正文至少保留 15 项公开语义、3.2 / 3.4 版本边界、覆盖上述 15 类风险的 10 个结构化易错分组
   和源码推导；安全、分支邻接、列表身份、可写 model 与缓存依赖属于不可删减边界。
4. 关联现有课程承担完整教学；本批不新增重复的表单、事件、插槽或性能 Demo。
5. 本批完成后预期覆盖为 `151 available / 55 planned / 206 total`；以实施时 catalog 的实时输出
   为准，不能只相信计划数字。
6. 实施时补一个 manifest 完整性断言，并运行全量质量 Gate；代表性移动端路径验证 15 个 heading、
   左侧切换后正文滚动归零、无横向溢出和控制台错误。
7. 第 36 批未达到映射、内容、验证及 Standards / Spec `PASS / 0 finding` 前，不开始第 37 批。
