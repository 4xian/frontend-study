# Vue Core API 第 38 批：`<script setup>` 官方调研

> 核对日期：2026-08-03
>
> 版本基线：`vue@3.5.40`（固定提交
> `fa2885d8c48768d26f1666a01bd540ffe3b20f9b`）
>
> 范围：仅 `vue/core/reference` 的 `<script setup>` 12 项，不进入第 39 批（B10）

## 冻结结论

本批只建立一个 `merged` 宿主页，不新增 Demo。页面按“执行与模板作用域 -> 组件和指令绑定 ->
编译器宏 -> 运行时上下文 helper -> 普通 script / await / import -> TypeScript 泛型 -> 环境限制”
组织。12 个 manifest 项各自保留唯一 heading 和 anchor，但共同落到一个 entry：

| 官方宿主 | 站内 ID | collection | 标题 |
| --- | --- | --- | --- |
| [`<script setup>`](https://cn.vuejs.org/api/sfc-script-setup.html) | `vue.core.reference.single-file-component.script-setup` | `single-file-component` | `<script setup>` |

页面必须把三类名字分开：`defineProps()`、`defineEmits()`、`defineOptions()` 是会被 SFC 编译器
识别并消除的宏；`useSlots()`、`useAttrs()` 是从 `vue` 导入的真实运行时函数；普通 `import`
继续遵循 ESM 与构建工具 alias 规则。不能把“在 `<script setup>` 内书写”统称成运行时 API。

现有 `withDefaults()`、`defineModel()`、`defineExpose()`、`defineSlots()` 已由其他 Reference
条目承接，不计入本批 12 项，也不在本页扩成独立正文。它们最多作为关联入口存在，不能改变本批
计数、heading 或实施范围。

## 条目与锚点映射

12 项均保持 `merged` 深度。`官方 fragment` 必须与官网 URL 完全一致；尤其导入语句是官网实际的
`imports-statements`，不能按 manifest 单数 id 猜成 `import-statements`。站内 anchor 则由当前
`headingId()` 对下表 heading 生成，官方 fragment 与站内 anchor 不要求相同。

| Manifest id | heading | 官方 fragment | 站内 anchor | 目标 entry |
| --- | --- | --- | --- | --- |
| `sfc-script-setup.basic-syntax` | `基本语法` | `basic-syntax` | `基本语法` | `vue.core.reference.single-file-component.script-setup` |
| `sfc-script-setup.reactivity` | `响应式` | `reactivity` | `响应式` | `vue.core.reference.single-file-component.script-setup` |
| `sfc-script-setup.using-components` | `使用组件` | `using-components` | `使用组件` | `vue.core.reference.single-file-component.script-setup` |
| `sfc-script-setup.using-custom-directives` | `使用自定义指令` | `using-custom-directives` | `使用自定义指令` | `vue.core.reference.single-file-component.script-setup` |
| `sfc-script-setup.define-props-and-emits` | `defineProps() 和 defineEmits()` | `defineprops-defineemits` | `defineprops-和-defineemits` | `vue.core.reference.single-file-component.script-setup` |
| `sfc-script-setup.define-options` | `defineOptions()` | `defineoptions` | `defineoptions` | `vue.core.reference.single-file-component.script-setup` |
| `sfc-script-setup.use-slots-and-use-attrs` | `useSlots() 和 useAttrs()` | `useslots-useattrs` | `useslots-和-useattrs` | `vue.core.reference.single-file-component.script-setup` |
| `sfc-script-setup.normal-script` | `与普通的 <script> 一起使用` | `usage-alongside-normal-script` | `与普通的-script-一起使用` | `vue.core.reference.single-file-component.script-setup` |
| `sfc-script-setup.top-level-await` | `顶层 await` | `top-level-await` | `顶层-await` | `vue.core.reference.single-file-component.script-setup` |
| `sfc-script-setup.import-statements` | `导入语句` | `imports-statements` | `导入语句` | `vue.core.reference.single-file-component.script-setup` |
| `sfc-script-setup.generics` | `泛型` | `generics` | `泛型` | `vue.core.reference.single-file-component.script-setup` |
| `sfc-script-setup.restrictions` | `限制` | `restrictions` | `限制` | `vue.core.reference.single-file-component.script-setup` |

实施时应直接使用表中 heading 生成站内 target，不得把官网英文 fragment 当作站内 heading，也不得
为了缩短页面将 12 个 manifest id 指向同一个页首 anchor。

## 官方来源

### 中文官网与官方发布说明

- [`<script setup>` API](https://cn.vuejs.org/api/sfc-script-setup.html)：12 项公开 heading 的主
  契约；覆盖每实例执行、顶层绑定、组件 / 指令、宏、运行时 helper、普通 script、顶层 await、
  ESM import、generic attribute 和两项限制。
- [单文件组件语法定义](https://cn.vuejs.org/api/sfc-spec.html)：`<script setup>` 是每个实例执行
  的 SFC 顶层语言块，并给出普通 script、`src` 与块数量背景。
- [Props 指南](https://cn.vuejs.org/guide/components/props.html)：宏参数提升、3.5+ 响应式 props
  解构、单向 props 与响应式依赖的公开解释。
- [组件基础](https://cn.vuejs.org/guide/essentials/component-basics.html)、
  [自定义指令](https://cn.vuejs.org/guide/reusability/custom-directives.html)：导入组件的局部变量
  语义、动态组件，以及本地指令命名 / 注册边界。
- [插槽](https://cn.vuejs.org/guide/components/slots.html)与
  [透传 Attributes](https://cn.vuejs.org/guide/components/attrs.html)：`$slots` / `$attrs`、
  `useSlots()` / `useAttrs()` 的使用场景，以及 attrs 不是响应式对象的边界。
- [`<Suspense>`](https://cn.vuejs.org/guide/built-ins/suspense.html)：顶层 await 形成异步 setup
  依赖；`<Suspense>` 当前仍是实验性功能，不能把 fallback 协调写成稳定性承诺。
- [Vue 3.2 发布说明](https://blog.vuejs.org/posts/vue-3-2)：`<script setup>` 从 3.2 起脱离实验
  状态；这只说明语法稳定基线，不代表后续 3.3 / 3.5 增量已在 3.2 存在。
- [Vue 3.3 发布说明](https://blog.vuejs.org/posts/vue-3-3)：导入类型的宏推导、简洁 emits
  元组、`defineOptions()` 和 generic components 的 3.3 增量。
- [Vue 3.5 发布说明](https://blog.vuejs.org/posts/vue-3-5)：响应式 props 解构在 3.5 稳定并默认
  启用。

### Vue 3.5.40 固定源码与官方测试

- [`compileScript.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/compileScript.ts)、
  [`context.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/script/context.ts)：
  普通 script / script setup 合并、import 提升与绑定分类、宏识别、setup 生成和 async 标记。
- [`defineProps.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/script/defineProps.ts)、
  [`defineEmits.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/script/defineEmits.ts)、
  [`defineOptions.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/script/defineOptions.ts)：
  运行时 / 类型声明互斥、类型到运行时选项生成、重复调用与非法选项诊断。
- [`definePropsDestructure.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/script/definePropsDestructure.ts)：
  3.5 解构 key / alias / default 注册、同块引用改写、局部遮蔽和响应式源误用诊断。
- [`importUsageCheck.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/script/importUsageCheck.ts)：
  模板中的组件标签、命名空间组件、自定义指令、插值和指令表达式如何纳入 import 使用分析。
- [`topLevelAwait.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/script/topLevelAwait.ts)、
  [`apiSetupHelpers.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/apiSetupHelpers.ts)：
  await 表达式的 `withAsyncContext()` 包装、临时值和组件实例上下文恢复，以及真实 setup helper。
- [`normalScript.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/script/normalScript.ts)、
  [`parse.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/parse.ts)：
  普通 script 默认导出改写、语言块 attribute 与 descriptor 边界。
- [`compileScript.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/__tests__/compileScript.spec.ts)、
  [`defineProps.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/__tests__/compileScript/defineProps.spec.ts)、
  [`defineEmits.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/__tests__/compileScript/defineEmits.spec.ts)、
  [`defineOptions.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/__tests__/compileScript/defineOptions.spec.ts)：
  生成结果、宏消除、运行时选项、generic attribute、async setup 与错误路径的固定回归证据。
- [`definePropsDestructure.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/__tests__/compileScript/definePropsDestructure.spec.ts)、
  [`importUsageCheck.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/__tests__/compileScript/importUsageCheck.spec.ts)、
  [`apiSetupHelpers.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/apiSetupHelpers.spec.ts)：
  props 改写、模板 import 命中和 runtime helper / async context 的测试证据。

固定提交本身是
[`release: v3.5.40`](https://github.com/vuejs/core/commit/fa2885d8c48768d26f1666a01bd540ffe3b20f9b)，
不使用 `main`、`blob/HEAD` 或会随时间漂移的源码链接。Tavily 只用于检索和抽取上述
`cn.vuejs.org`、`blog.vuejs.org` 与 `vuejs/core` 一手来源；未采用第三方文章、issue 推测或搜索
摘要中的非官方结论。

## 版本与分类边界

| 能力 | 最低 / 当前状态 | 页面必须怎样表达 |
| --- | --- | --- |
| `<script setup>` 基础语法 | 3.2 起稳定 | 作为 SFC 编译时语法糖；不能写成普通浏览器 script 或运行时注册 API |
| 导入类型用于宏、简洁 emits 元组 | 3.3+ | 类型转运行时仍基于 AST；不能承诺任意条件类型或完整 TS 类型分析 |
| `defineOptions()` | 3.3+ | 编译器宏且选项提升；不把它包装成可在事件回调中调用的运行时函数 |
| `generic` attribute | 3.3+，TypeScript 工具链能力 | 只描述类型参数、约束和默认值；不能声称生成运行时泛型或校验器 |
| 响应式 props 解构 | 3.5+ 稳定并默认启用 | 只保证同一 `<script setup>` 的标识符改写；解构变量不是 Ref |
| 顶层 await | 编译为 async setup | 必须保留 `<Suspense>` 实验性依赖，不把编译成功等同于稳定加载 UX |
| 其余公开语义 | 本批官网无新增版本徽标 | `appliesTo: 3.5.40` 表示核验基线，不能反推它们从 3.5.40 才存在 |

`generic` 主要由 Vue 的 TypeScript 语言工具消费；`vuejs/core` 固定测试能证明 compiler-sfc 接受
该 attribute 并生成合法脚本，但不能单独证明 IDE 的全部推断能力。页面不为泛型组件引用引入任何
额外 helper 包，也不把 B11 TypeScript 工具类型内容提前合并进来。

## 12 项公开语义

### 基本语法

`<script setup>` 是 SFC 中使用组合式 API 的编译时语法糖。块内可执行语句会成为组件
`setup()` 的内容，因此每创建一个组件实例都会执行一次；这与普通 `<script>` 的模块求值时机
不同。变量、函数声明和 import 等顶层绑定可以直接在同一 SFC 模板中使用，无需构造并返回一个
暴露对象，也无需通过 `components` 或 `methods` 重复注册。

“暴露给模板”只描述模板编译作用域，不等于把全部局部变量放到组件公开实例上。页面应把模板可见
性、模块作用域和父组件可见性分开，避免让读者根据模板能访问就推断 Options API 也能访问。

### 响应式

`<script setup>` 不会让普通 JavaScript 值自动响应式。状态仍须用 `ref()`、`reactive()`、
`computed()` 等响应式 API 创建；ref 在模板表达式中与普通 `setup()` 返回值一样自动解包。
脚本逻辑中仍通过 `.value` 访问 ref，不能把模板解包规则照搬进 JavaScript。

本节只做语法上下文速查，完整 ref / reactive 机制继续链接现有响应式 Reference 与基础课程，
不在合并页重复构造响应式教程。

### 使用组件

模板把 `<script setup>` 顶层绑定当作词法变量。`import MyPanel from './MyPanel.vue'` 后可直接写
`<MyPanel />`；PascalCase 有助于区分 Vue 组件和原生 custom element。动态目标应通过
`<component :is="condition ? Foo : Bar" />` 传入组件变量，而不是把导入对象转回名称字符串。

SFC 可以按文件名递归自引用，但显式导入的同名绑定优先，应给冲突导入取别名。`<Form.Input />`
这类带点标签会从命名空间对象取成员，适合一个模块导出一组相关组件；它不是全局注册语法。

### 使用自定义指令

全局注册指令仍可直接使用。本地指令无需额外 `directives` 选项，但顶层变量必须符合
`vNameOfDirective` 约定，例如 `vFocus` 对应模板 `v-focus`。从其他模块导入时可用
`import { focus as vFocus } from './directives'` 适配命名。

这个约定由模板 import 使用分析识别，不表示任意以 `v` 开头的普通值都会自动变成有效指令；变量
本身仍须满足自定义指令的公开形状。

### `defineProps()` 和 `defineEmits()`

二者是仅在 `<script setup>` 中可用的编译器宏，不需要 import，并在编译结果中消失。
`defineProps()` 的参数与 `props` 选项同形，`defineEmits()` 的参数与 `emits` 选项同形；编译器把
声明转成组件运行时选项，并为返回的 props / emit 函数提供类型推导。

每个宏只能在运行时声明和类型声明中二选一；同时传值参数与类型参数会编译报错。类型式声明会由
静态 AST 分析生成相应运行时声明，但不等于完整运行 TypeScript 类型检查器。宏参数会提升到模块
作用域，不能引用 setup 内稍后创建的局部值；导入绑定位于模块作用域，可以被合法引用。

Vue 3.5+ 会把同一 `<script setup>` 中从 `defineProps()` 解构出的标识符读取重写为
`props.foo` 等价访问，并支持 JavaScript 解构默认值。该变量不是 Ref；把它交给需要响应式源的
API 时应传 getter。改写也不能跨到另一个 `.ts` 文件或任意已求值的函数参数。

### `defineOptions()`

3.3+ 的 `defineOptions()` 用于在同一 `<script setup>` 中声明 `inheritAttrs` 或插件自定义选项，
免去仅为这些选项增加普通 `<script>`。它同样是会被消除的编译器宏，选项提升到模块作用域，
不能读取 setup 内非字面常数局部值。

`props`、`emits` 等已有专用宏负责的契约不能塞回 `defineOptions()`；固定源码会对重复调用、类型
参数和这些冲突字段给出诊断。页面只解释它自己的选项边界，不重讲其他已完成宏。

### `useSlots()` 和 `useAttrs()`

模板通常直接使用 `$slots` 与 `$attrs`。确需在 setup 逻辑中读取时，从 `vue` 显式导入
`useSlots()`、`useAttrs()`；它们是真实运行时函数，返回值分别等价于
`setupContext.slots`、`setupContext.attrs`，也能在普通组合式 API 中使用。

`useAttrs()` 返回对象会反映最新透传 attribute，但出于性能考虑不是响应式对象，不能依赖
`watch(() => attrs.id)` 建立更新契约。需要响应式输入时应声明 prop；只需在渲染 / 更新时取最新值
则直接读取 attrs。

### 与普通的 `<script>` 一起使用

一个 SFC 可以同时包含一个普通 `<script>` 和一个 `<script setup>`。普通 script 适合模块作用域
只执行一次的副作用、具名导出，以及仍无法由 setup 宏表达的组件选项；script setup 保留每实例
执行的状态与逻辑。

两块不是互相可见的混合词法作用域。script setup 局部变量不会自动加到组件实例，Options API
方法也不能靠 `this` 读取它们；不要在普通 script 中重复声明已经由宏定义的 props / emits。
需要深度混用两套 API 时，官方建议改用显式 `setup()`，让作用域和返回值清楚可见。

### 顶层 `await`

`<script setup>` 允许顶层 await，编译结果为 `async setup()`。编译器会把 await 表达式改写成
`withAsyncContext()` 形式，在 await 后恢复当前组件实例上下文，因此生命周期 / 依赖注入等依赖
active instance 的后续同步调用仍关联当前组件。

异步 setup 必须由 `<Suspense>` 协调；而 `<Suspense>` 在当前官方文档仍标为实验性。页面必须说明
fallback / error 设计责任，不能用“编译器能生成 async setup”替代产品级加载和失败处理。

### 导入语句

import 遵循 ECMAScript 模块规范；`@/`、`~/` 等 alias 是否可用由 Vite / TypeScript 等构建配置
决定，不是 Vue 自动提供。import 声明在生成代码中保持模块作用域；导入绑定可以直接用于模板
插值、组件标签、动态组件与符合命名约定的自定义指令。

compiler-sfc 会解析模板实际引用，区分类型 import 与运行时 binding，并识别 PascalCase / kebab
组件、点号命名空间、指令表达式等场景。这个分析服务于生成代码和开发返回对象，不能据此声称
字符串中出现同名文本也会建立模板绑定。

### 泛型

在 TypeScript SFC 中，可通过 `<script setup lang="ts" generic="T">` 声明组件类型参数。
`generic` 值与 TypeScript `<...>` 内参数列表相同，支持多个参数、`extends` 约束、默认类型和导入
类型，并可供 `defineProps()` 等类型式声明引用。

generic attribute 只影响类型工具链，不会在浏览器里生成“运行时泛型”，也不会自动产生 prop
校验器。显式指定使用方类型、泛型组件模板 ref 等更深的语言工具问题留给 B11；本批不新增依赖。

### 限制

`<script setup>` 依赖整个 SFC 的文件上下文，不能使用 `src` attribute 把内容移到外部 `.js` /
`.ts` 文件。一个组件同时含普通 script 与 script setup 时，也必须由 compiler-sfc 一起处理，
不能通过外部 source 拼接两个作用域。

`<script setup>` 不支持 DOM 内根组件模板。它需要 `.vue` 文件和 SFC 工具链做预处理；直接把
`<script setup>` 标签放进服务器输出的 HTML 不会触发 Vue SFC 编译。需要 DOM 内模板时使用其
支持的普通应用 / 组件写法，并接受 HTML parser 的限制。

## 相关站内页面

| 本批内容 | 应关联的现有页面 | 关联原因 |
| --- | --- | --- |
| 基本语法、普通 script、限制 | `vue.core.learn.basics.sfc-basics` | 已有 SFC 文件结构、编译期和实例执行背景 |
| 响应式、ref 模板解包 | `vue.core.learn.basics.reactive-state`、`vue.core.reference.reactivity.ref` | 承担完整响应式机制和脚本 / 模板访问差异 |
| 导入组件、动态组件 | `vue.core.learn.basics.component-basics`、`vue.core.learn.intermediate.dynamic-components-keep-alive` | 已有局部导入、实例身份与动态切换教学 |
| 本地自定义指令 | `vue.core.learn.advanced.custom-directives`、`vue.core.reference.advanced.custom-directives` | 已有指令对象形状、生命周期与适用边界 |
| props / emits 宏 | `vue.core.reference.components.props`、`vue.core.reference.components.emits` | 已有输入 / 输出契约、类型声明和运行时验证 |
| slots / attrs helper | `vue.core.reference.components.slots`、`vue.core.reference.components.attrs` | 已有 slot 函数、透传 attribute 与非响应式 attrs 边界 |
| 顶层 await | `vue.core.learn.advanced.async-components-suspense`、`vue.core.reference.built-ins.suspense` | 已有异步依赖、fallback 和实验性边界 |

关联页面承担完整教学和交互；本页保持 Reference 速查深度。泛型的更完整类型工具说明依赖 B11，
当前不存在的后续页面不能伪装成已可导航 related target。

## 不新增 Demo 的理由

1. 基本响应式、局部组件、动态组件、指令、props / emits、slots / attrs 和 Suspense 已有针对性
   课程或 Demo；本批再做一个总览交互只会重复现象，无法证明宏编译。
2. 宏消除、选项提升、props 标识符改写、模板 import 分析、generic attribute、`src` 与 DOM
   template 限制都是编译器 / 类型工具链契约。普通浏览器按钮无法形成真实 public seam。
3. 结构化错误 / 正确代码、固定编译输出测试与既有课程链接已经覆盖学习目标。本批不新增 E2E、
   不安装类型 helper，也不借研究任务修改现有 Demo。

## 结构化易错点候选

以下 9 类风险均包含原因、可观察后果、错误示范和正确示范。实施时可调整视觉分组，但不能删减
宏互斥 / 提升、3.5 解构边界、运行时 helper、普通 script 作用域、Suspense、generic / `src` /
DOM template 限制。

### 1. 把每实例执行误当成自动响应式或模块单例

- 原因：script setup 代码进入 `setup()` 并随每个实例执行，但普通变量仍是非响应式 JavaScript
  值；一次性副作用也会随实例重复。
- 后果：点击后模板不更新，或每挂载一个组件就重复初始化连接 / SDK。

```vue
<!-- 错误 -->
<script setup>
bootAnalytics()
let count = 0
</script>
<template><button @click="count++">{{ count }}</button></template>

<!-- 正确：模块副作用与每实例状态分开 -->
<script>
bootAnalyticsOnce()
</script>
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>
```

### 2. 把导入组件重新当作字符串注册名

- 原因：script setup 模板把组件标签和动态目标当作词法变量；字符串名称走的是另一套运行时解析
  语义。
- 后果：动态目标解析不到局部导入，出现组件解析警告或渲染成意外标签。

```vue
<!-- 错误 -->
<script setup>
import SettingsPanel from './SettingsPanel.vue'
</script>
<template><component :is="'SettingsPanel'" /></template>

<!-- 正确 -->
<template><component :is="SettingsPanel" /></template>
```

命名空间组件同样传变量成员，例如 `<Form.Input />`，不是拼接 `'Form.Input'` 字符串。

### 3. 导入本地指令后不使用 `vName` 命名

- 原因：模板通过 `vNameOfDirective` 约定把 script setup 顶层绑定识别为本地指令。
- 后果：模板中的 `v-focus` 找不到对应局部绑定，指令钩子不执行。

```vue
<!-- 错误 -->
<script setup>
import { focus } from './directives'
</script>
<template><input v-focus /></template>

<!-- 正确 -->
<script setup>
import { focus as vFocus } from './directives'
</script>
<template><input v-focus /></template>
```

### 4. 同时传宏的运行时声明和类型声明，或引用 setup 局部值

- 原因：`defineProps()` / `defineEmits()` 两种声明形式互斥，宏参数与 `defineOptions()` 选项又会
  被提升到模块作用域。
- 后果：compiler-sfc 直接报错，组件无法生成；把宏当运行时函数调试也看不到预期调用。

```vue
<!-- 错误 -->
<script setup lang="ts">
const required = readFlag()
const props = defineProps<{ title: string }>({
  title: { type: String, required },
})
</script>

<!-- 正确：选一种声明；静态组件选项直接写字面量 -->
<script setup lang="ts">
const props = defineProps<{ title: string }>()
const emit = defineEmits<{ save: [id: number] }>()
defineOptions({ inheritAttrs: false })
</script>
```

### 5. 把 3.5 props 解构变量当成 Ref 或跨文件响应式值

- 原因：响应性来自 compiler-sfc 在同一 script setup AST 内把读取改写为 props 属性访问；变量
  本身没有 `.value`，传参后也不会保留标识符改写。
- 后果：`watch(foo, ...)` 不是合法响应式源，抽到外部函数后更新不再触发预期逻辑。

```vue
<!-- 错误 -->
<script setup lang="ts">
import { watch } from 'vue'
const { foo } = defineProps<{ foo: string }>()
watch(foo, (value) => console.log(value))
</script>

<!-- 正确 -->
<script setup lang="ts">
import { watch } from 'vue'
const { foo = 'ready' } = defineProps<{ foo?: string }>()
watch(() => foo, (value) => console.log(value))
</script>
```

### 6. 把 `useSlots()` / `useAttrs()` 当成免导入宏或响应式 store

- 原因：二者是真实运行时函数，必须从 `vue` 导入；attrs 虽保持最新值，但不是响应式对象。
- 后果：漏 import 会得到未定义标识符；watch attrs 不能形成可靠更新契约。

```vue
<!-- 错误 -->
<script setup>
const attrs = useAttrs()
watch(() => attrs.mode, syncMode)
</script>

<!-- 正确：需要响应式 mode 就声明 prop；slots / attrs 只按需读取 -->
<script setup lang="ts">
import { useAttrs, useSlots, watch } from 'vue'
const props = defineProps<{ mode: string }>()
const attrs = useAttrs()
const slots = useSlots()
watch(() => props.mode, syncMode)
</script>
```

### 7. 让普通 script 的 Options API 读取 script setup 局部变量

- 原因：普通 script 是模块作用域，script setup 是每实例 setup 作用域；后者不会自动成为组件
  实例属性。
- 后果：Options 方法中的 `this.count` 为 `undefined`，或 props / emits 被两套声明重复定义。

```vue
<!-- 错误 -->
<script>
export default {
  mounted() {
    console.log(this.count)
  },
}
</script>
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<!-- 正确：实例逻辑保留在同一 setup 作用域 -->
<script setup>
import { onMounted, ref } from 'vue'
const count = ref(0)
onMounted(() => console.log(count.value))
</script>
```

### 8. 使用顶层 await 却不给异步组件提供 Suspense 边界

- 原因：顶层 await 会生成 async setup；编译器只负责保存组件实例上下文，不负责独立提供加载
  fallback 与失败体验。
- 后果：开发环境提示异步 setup 缺少 `<Suspense>` 边界，组件内容无法按预期渲染，也没有协调的
  pending UI。

```vue
<!-- 错误：父级没有异步边界 -->
<template><AsyncPanel /></template>

<!-- 正确：父级显式协调异步依赖 -->
<template>
  <Suspense>
    <AsyncPanel />
    <template #fallback>加载中</template>
  </Suspense>
</template>
```

子组件可在自己的 `<script setup>` 顶层 await 数据，但页面仍须标记 Suspense 的实验性状态。

### 9. 把 generic、`src` 和 DOM 内模板都当成运行时标签能力

- 原因：`generic` 是 TypeScript / SFC 工具链输入，script setup 又依赖完整 `.vue` 文件上下文；
  浏览器不会自行执行 SFC 编译。
- 后果：`src` 触发 compiler-sfc 诊断，DOM 中的块不被转换，泛型也不会产生运行时校验。

```html
<!-- 错误：外部 source 和 DOM 内根模板都不支持 script setup -->
<div id="app">
  <script setup src="./feature.ts" generic="T"></script>
</div>
```

```vue
<!-- 正确：保留在 .vue 文件，由 SFC + TypeScript 工具链处理 -->
<script setup lang="ts" generic="T extends { id: string }">
defineProps<{ items: T[]; selected: T }>()
</script>
<template><p>{{ selected.id }} / {{ items.length }}</p></template>
```

## 源码推导与适用场景

以下 11 条均由 `vuejs/core@v3.5.40` 固定源码 / 测试交叉支持，只解释公开可观察结果，不把
AST、binding metadata、生成变量名或测试快照提升为稳定 API：

1. **每实例 setup 与模板绑定。**
   [`compileScript.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/compileScript.ts)
   把 script setup 语句包装进生成的 `setup()`，并根据顶层声明建立 binding metadata；
   [`compileScript.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/__tests__/compileScript.spec.ts)
   固定生成代码与绑定分类。因此每实例状态适合放在 script setup，跨实例单例仍应属于显式模块。
2. **宏调用消除并转成组件契约。** 同一 `compileScript.ts` 调用专用 processor，并移除纯宏调用；
   [`defineProps.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/__tests__/compileScript/defineProps.spec.ts)、
   [`defineEmits.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/__tests__/compileScript/defineEmits.spec.ts)
   断言宏名不留在输出、props / emits 进入组件选项、返回绑定改接 `__props` / emit context。宏适合
   声明静态组件契约，不适合事件发生后动态调用。
3. **运行时和类型声明必须二选一。**
   [`defineProps.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/script/defineProps.ts)
   与
   [`defineEmits.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/script/defineEmits.ts)
   分别保存 runtime / type declaration，发现两者同时存在即报错；对应测试固定错误路径和类型生成
   的 runtime 选项。类型式声明适合 TS 项目，但复杂类型仍受 AST 转换能力限制。
4. **3.5 解构是标识符改写，不是创建 Ref。**
   [`definePropsDestructure.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/script/definePropsDestructure.ts)
   注册 public key、别名与默认值，并只在未被局部变量遮蔽的引用位置生成 props 访问；
   [`definePropsDestructure.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/__tests__/compileScript/definePropsDestructure.spec.ts)
   验证脚本和模板都改写、循环 / 函数局部遮蔽不误改。它适合简洁读取，跨函数响应式源仍传 getter。
5. **模板决定哪些 import 是运行时使用。**
   [`importUsageCheck.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/script/importUsageCheck.ts)
   解析 template AST，而不是搜索原始字符串；
   [`importUsageCheck.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/__tests__/compileScript/importUsageCheck.spec.ts)
   固定 plain text、大小写、插值、spread 和属性访问路径。导入 helper 可直接用于模板，但注释或文本
   中同名不会让 type import 变成运行时值。
6. **组件和指令命名由同一次模板分析覆盖。** 同一 `importUsageCheck.ts` 对非原生标签同时加入
   camelized / PascalCase 名，对点号标签取根命名空间，对非内置指令加入 `v` + PascalCase 名；
   对应测试覆盖组件、指令和 namespace / dot component。这个机制解释了 `<my-panel>`、
   `<Form.Input>` 与 `v-focus` 的可用形式，不等于全局注册。
7. **`defineOptions()` 被合并而不是运行时执行。**
   [`defineOptions.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/script/defineOptions.ts)
   拒绝类型参数、重复调用及 props / emits / expose / slots 字段；
   [`defineOptions.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/__tests__/compileScript/defineOptions.spec.ts)
   验证调用从输出消失、选项合并到默认导出。它适合静态组件选项，不适合依赖实例状态的值。
8. **slots / attrs 是 runtime setup context。**
   [`apiSetupHelpers.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/apiSetupHelpers.ts)
   从当前实例的 setup context 返回 slots / attrs；
   [`apiSetupHelpers.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/apiSetupHelpers.spec.ts)
   从 runtime helper 入口验证相关行为。因此组合式函数需要时可以调用，模板展示优先 `$slots` /
   `$attrs`，不能省略 import 冒充编译宏。
9. **普通 script 与 setup 只在编译结果合并。**
   [`normalScript.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/script/normalScript.ts)
   分析普通 script 并按需改写默认导出，`compileScript.ts` 再合并两块 import、选项与 setup；固定
   测试还覆盖两块语言一致性和类型引用。适合“模块一次 + 实例多次”的明确分工，不构成跨块局部
   变量共享。
10. **顶层 await 保存并恢复组件实例上下文。**
    [`topLevelAwait.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/script/topLevelAwait.ts)
    把 await 改写为获取临时 Promise、await、调用 restore 的序列，并通过 `withAsyncContext()` 保留
    active instance；`compileScript.spec.ts` 固定 async 检测和 helper import。这个特殊变换只适用
    script setup 顶层 await，不能推广为任意异步回调都自动保留实例。
11. **generic 和限制都属于 SFC 工具链边界。**
    [`parse.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/parse.ts)
    将 language block attribute 保存进 descriptor；`compileScript.spec.ts` 有 generic attribute 的
    合法生成回归，`compileScript.ts` 对 script setup `src` 及不兼容双 script 输入给出诊断。固定
    core 测试能证明编译器入口边界，不替代 B11 的 TypeScript 语言服务验证或 DOM 浏览器支持。

## 实施验收与 B10 停止边界

1. 只新增 `vue.core.reference.single-file-component.script-setup` 一篇 Reference；标题为
   `<script setup>`，`collection` 为 `single-file-component`，不新增 Demo、动画或依赖。
2. 上表 12 个 manifest id 全部指向该 entry 的 12 个唯一 heading / anchor；正文和真实 target
   未完成前不得切为 `available`。官网导入语句 URL 必须保留 `#imports-statements`。
3. 页面必须覆盖 12 项公开语义、3.2 / 3.3 / 3.5 与实验性边界、上述 9 类结构化风险和 11 条固定
   源码推导；宏消除 / 提升 / 互斥、3.5 解构、模板 import 分析、runtime helper、普通 script
   作用域、`withAsyncContext`、generic、`src` 和 DOM template 均为不可删减点。
4. 现有宏条目继续归原 owner；本批不复制其独立正文，不改变它们的 manifest 状态。现有课程承担
   完整教学，本批不新增交互或 E2E。
5. 若第 37 批实施基线确为 `161 available / 45 planned / 206 total`，本批完成后预期为
   `173 available / 33 planned / 206 total`；必须以实施时 catalog 的实时机器统计为准。
6. 实施时只补最少 manifest / entry 完整性断言并运行全量质量 Gate；代表性移动端路径验证单一
   宿主页的 12 个 heading、跨 collection 导航、滚动归零、无横向溢出和控制台错误。浏览器 smoke
   只能证明页面集成，不能替代 compiler-sfc 固定测试所代表的编译期证据。
7. 第 38 批未达到映射、内容、验证及 Standards / Spec `PASS / 0 finding` 前，不开始 B10。达到后
   也只报告下一批是“SFC CSS 与渲染辅助”8 项，不自动修改其 manifest、正文、测试、样式、Demo
   或计划；更不得提前进入 B11 TypeScript 类型与编译标志。
