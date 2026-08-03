# Vue Core API 第 40 批：TypeScript 类型与编译标志官方调研

> 核对日期：2026-08-03
>
> 版本基线：`vue@3.5.40`（固定提交
> `fa2885d8c48768d26f1666a01bd540ffe3b20f9b`）
>
> 范围：仅 Vue Core Reference 的 9 项 TypeScript 工具类型与 3 项编译时标志，不进入第
> 41 批

## 冻结结论

本批建议新增两篇 `advanced` collection 的 quick entry：一篇集中解释官网列出的 9 个常用
TypeScript 工具类型，一篇集中解释 `esm-bundler` 的 3 个编译时标志。两页各项必须保留独立
heading 与站内 anchor，但不新增 Demo、动画、依赖或运行时配置。

| 宿主 | 建议站内 ID | collection | 本批条目 |
| --- | --- | --- | ---: |
| TypeScript 工具类型速查 | `vue.core.reference.advanced.utility-types` | `advanced` | 9 |
| 编译时标志速查 | `vue.core.reference.advanced.compile-time-flags` | `advanced` | 3 |

完成后预期为 `193 available / 13 planned / 206 total`。第 41 批平台边界的 13 项必须继续为
`planned` 且没有 target。

## 条目与锚点映射

站内 anchor 按当前 `headingId()` 规则冻结：转小写、空白转连字符，并移除尖括号等非字母数字、
下划线、连字符或中文字符。官方 fragment 与站内 anchor 是两套标识，不能互相替代。

| Manifest id | heading | 官方 fragment | 站内 anchor | 目标 entry |
| --- | --- | --- | --- | --- |
| `utility-types.prop-type` | `PropType<T>` | `proptype-t` | `proptypet` | `vue.core.reference.advanced.utility-types` |
| `utility-types.maybe-ref` | `MaybeRef<T>` | `mayberef` | `maybereft` | `vue.core.reference.advanced.utility-types` |
| `utility-types.maybe-ref-or-getter` | `MaybeRefOrGetter<T>` | `maybereforgetter` | `maybereforgettert` | `vue.core.reference.advanced.utility-types` |
| `utility-types.extract-prop-types` | `ExtractPropTypes<T>` | `extractproptypes` | `extractproptypest` | `vue.core.reference.advanced.utility-types` |
| `utility-types.extract-public-prop-types` | `ExtractPublicPropTypes<T>` | `extractpublicproptypes` | `extractpublicproptypest` | `vue.core.reference.advanced.utility-types` |
| `utility-types.component-custom-properties` | `ComponentCustomProperties` | `componentcustomproperties` | `componentcustomproperties` | `vue.core.reference.advanced.utility-types` |
| `utility-types.component-custom-options` | `ComponentCustomOptions` | `componentcustomoptions` | `componentcustomoptions` | `vue.core.reference.advanced.utility-types` |
| `utility-types.component-custom-props` | `ComponentCustomProps` | `componentcustomprops` | `componentcustomprops` | `vue.core.reference.advanced.utility-types` |
| `utility-types.css-properties` | `CSSProperties` | `cssproperties` | `cssproperties` | `vue.core.reference.advanced.utility-types` |
| `compile-time-flags.options-api` | `__VUE_OPTIONS_API__` | `VUE_OPTIONS_API` | `__vue_options_api__` | `vue.core.reference.advanced.compile-time-flags` |
| `compile-time-flags.prod-devtools` | `__VUE_PROD_DEVTOOLS__` | `VUE_PROD_DEVTOOLS` | `__vue_prod_devtools__` | `vue.core.reference.advanced.compile-time-flags` |
| `compile-time-flags.prod-hydration-mismatch-details` | `__VUE_PROD_HYDRATION_MISMATCH_DETAILS__` | `VUE_PROD_HYDRATION_MISMATCH_DETAILS` | `__vue_prod_hydration_mismatch_details__` | `vue.core.reference.advanced.compile-time-flags` |

## 官方来源

- [TypeScript 工具类型](https://cn.vuejs.org/api/utility-types.html)：9 个常用类型的公开用途、
  3.3+ 标记、内部与外部 props 视角、模块增强前提及最小示例。官网明确说明该页不是 `vue`
  全部导出类型的清单。
- [编译时标志](https://cn.vuejs.org/api/compile-time-flags.html)：`esm-bundler` 生效范围、三个
  默认值、tree-shaking 目的、3.4+ hydration 标志与 Vite / webpack / Rollup 配置方式。
- [`packages/vue/package.json`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/vue/package.json)：
  固定提交中的 `vue` 包版本为 `3.5.40`。
- [`componentProps.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentProps.ts)、
  [`ref.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/reactivity/src/ref.ts)：
  `PropType`、两种 `MaybeRef`、两种 props 提取类型的固定声明，以及 `unref()` / `toValue()`
  的归一化差异。
- [`componentPublicInstance.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentPublicInstance.ts)、
  [`componentOptions.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentOptions.ts)、
  [`component.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/component.ts)、
  [`apiDefineComponent.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/apiDefineComponent.ts)：
  三个 `ComponentCustom*` 接口分别进入公共实例、自定义 Options 和 TSX 公共 props 的类型 seam。
- [`jsx.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-dom/src/jsx.ts)：
  `CSSProperties` 对 `csstype` 的封闭类型继承，以及 3.5.40 已存在的 `--${string}` 自定义属性
  索引签名。
- [`rollup.config.js`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/rollup.config.js)、
  [`featureFlags.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/featureFlags.ts)、
  [`renderer.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/renderer.ts)、
  [`hydration.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/hydration.ts)：
  外部标志到内部 feature flag 的构建替换、未配置回退、Options / devtools 分支和 hydration
  详细警告分支。
- [`component.test-d.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages-private/dts-test/component.test-d.ts)、
  [`ref.test-d.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages-private/dts-test/ref.test-d.ts)、
  [`extractProps.test-d.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages-private/dts-test/extractProps.test-d.ts)、
  [`componentTypeExtensions.test-d.tsx`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages-private/dts-test/componentTypeExtensions.test-d.tsx)、
  [`built.test-d.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages-private/dts-test/built.test-d.ts)：
  复杂 PropType、getter 归一化、props 双视角与三个模块增强接口的固定类型回归。
- [`apiSetupHelpers.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/apiSetupHelpers.spec.ts)、
  [`hydration.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/hydration.spec.ts)：
  Options feature 分支与 hydration mismatch 处理的固定运行时回归证据。

Tavily 仅用于抽取本节前两张指定的 Vue 中文官方 API 页面；源码、类型声明和测试直接核对
Vue Core 固定提交。官网类型页的 `CSSProperties` 示例仍演示增加 `--${string}`，但 3.5.40 固定
源码已经内置同类索引签名，因此本批以固定版本声明为实施基线，不要求重复增强。

## 12 项公开语义

### `PropType<T>`

`PropType<T>` 用于在运行时 props 声明中为 `Object`、`Array`、`Function` 等构造器补充精确的
TypeScript 类型，例如 `Object as PropType<Book>`。它只影响静态推导；运行时仍按 `Object`
构造器检查，若要验证 `Book` 的字段和值域，还需在 prop 选项中提供 `validator`。

### `MaybeRef<T>`

官网把它概括为 `T | Ref<T>`，适合作为组合式函数允许“普通值或 ref”的参数。3.5.40 声明还
显式覆盖 `ShallowRef<T>` 与 `WritableComputedRef<T>`；消费方应使用 `unref()` 读取统一值，不能
假定输入一定有 `.value`。

### `MaybeRefOrGetter<T>`

3.3+ 的 `MaybeRefOrGetter<T>` 在 `MaybeRef<T>` 之外还接受只读 `ComputedRef<T>` 与
`() => T`。它适合需要按调用时机读取最新值的组合式函数参数；应使用 `toValue()` 统一读取，
因为 `unref()` 不会调用普通 getter。

### `ExtractPropTypes<T>`

该类型从运行时 props 选项对象提取组件内部收到的已解析 props 类型。Boolean prop 与带默认值
的 prop 在内部视角始终定义；`required: true` 的 prop 也必填。选项对象应保留字面量信息，通常
写成 `as const`。

### `ExtractPublicPropTypes<T>`

3.3+ 的 public 版本描述父组件允许传入的 props：只有显式 `required: true` 才是必填，Boolean
和带默认值的 prop 对父组件仍可省略。它适合发布组件输入契约，不能替代组件内部的
`ExtractPropTypes<T>`。

### `ComponentCustomProperties`

通过 `declare module 'vue'` 增强该接口，可让 Options API 的 `this` 和组件公共实例识别
`app.config.globalProperties` 上安装的全局属性。类型增强本身不会写入运行时对象；插件或应用
仍需实际赋值。

### `ComponentCustomOptions`

增强该接口可让 `defineComponent()` 的选项对象识别自定义 option，例如路由库的组件选项。
若该选项会参与 mixin / extends 合并，运行时还需要对应的 `app.config.optionMergeStrategies`；
类型增强不定义合并规则。

### `ComponentCustomProps`

增强该接口可为所有组件的 TSX 调用加入允许的全局 prop。它适合框架级、确实由所有组件共享
的 TSX 属性，不会把该属性加入组件的运行时 props 声明，也不应代替具体组件的 `props`。

### `CSSProperties`

`CSSProperties` 是 Vue runtime-dom 的 JSX / style 对象类型，继承 `csstype` 的 camelCase 与
hyphen-case 属性。3.5.40 已允许键名匹配 `--${string}` 的自定义属性，值为
`string | number | undefined`；其余未知属性保持封闭检查。它只提供类型约束，不产生 CSS、
响应式更新或 SFC CSS `v-bind()` 编译行为。

### `__VUE_OPTIONS_API__`

该标志仅在 `esm-bundler` 构建生效，默认 `true`。静态替换为 `false` 可移除 Options API 相关
分支并减小产物，但依赖 Options API 的本地组件、mixin、插件或第三方库会失效；切换前必须审计
整个依赖图，而不是只看应用源码。

### `__VUE_PROD_DEVTOOLS__`

该标志仅在 `esm-bundler` 构建生效，默认 `false`。设为 `true` 会在生产构建保留 devtools hook、
组件元数据和相关分支，同时增加体积；它适合限时诊断，不等于业务错误监控或性能埋点。

### `__VUE_PROD_HYDRATION_MISMATCH_DETAILS__`

该标志自 3.4+ 可用，仅在 `esm-bundler` 构建生效，默认 `false`。设为 `true` 会在生产客户端
hydration 中保留更详细的节点、文本、class、style 与 attribute mismatch 检查/警告，并增加
体积。它不启用 SSR、不修复差异，也不等同于 3.5 的 `data-allow-mismatch`。

## 版本、构建与类型边界

| 主题 | 固定边界 | 实施时必须保留的说明 |
| --- | --- | --- |
| 官网类型清单 | 只列常用且需要解释的类型 | 本批覆盖官网 9 项，不宣称覆盖 `vue` 的全部类型 export |
| `MaybeRef*` | 3.3+；3.5.40 声明比官网别名摘要更具体 | 公开教学用官网心智模型，精确联合类型以固定源码为准 |
| `ExtractPublicPropTypes` | 3.3+ | 与内部 `ExtractPropTypes` 成对对照，不共享一个模糊“Props 类型”锚点 |
| 三个 `ComponentCustom*` | TypeScript 模块增强 | 增强文件必须是 `.ts` / `.d.ts` 模块；类型增强不执行运行时安装 |
| `CSSProperties` | runtime-dom 类型；3.5.40 已接受 `--*` | 不把类型声明写成 CSS runtime、SFC 编译器或浏览器支持承诺 |
| 三个编译标志 | 仅 `vue(.runtime).esm-bundler.js` | global、esm-browser 和 CJS 构建使用硬编码分支，不能声称同一配置生效 |
| hydration 详细标志 | 3.4+；生产客户端 hydration 诊断 | SSR 生成与 hydration 教学留给第 41 批；当前 SPA smoke 不能验证该标志 |

## TypeScript 工具类型页结构化易错点候选

### 1. 把 `PropType<T>` 当成深层运行时验证

- 原因：`as PropType<Book>` 为 TypeScript 提供 `Book`，运行时构造器仍只是 `Object`。
- 后果：字段缺失或值域错误的普通对象通过运行时类型检查，静态类型给出虚假的安全感。
- 错误：只写 `type: Object as PropType<Book>`，并声称 Vue 会验证 `title` 与 `year`。
- 正确：用 `PropType<Book>` 做静态推导；不可信输入需要 `validator` 或边界解析器。

### 2. 用同一种读取方式处理 `MaybeRef` 与 getter

- 原因：`unref()` 只解 ref；`MaybeRefOrGetter` 还允许普通函数，`toValue()` 才会调用 getter。
- 后果：把 getter 本身传进计算或请求逻辑，而不是取到它的当前返回值。
- 错误：`const value = unref(source)`，其中 `source: MaybeRefOrGetter<number>`。
- 正确：`MaybeRef<T>` 用 `unref(source)`；`MaybeRefOrGetter<T>` 用 `toValue(source)`。

### 3. 混淆内部与外部 props 提取视角，或丢失字面量

- 原因：内部解析会补齐 Boolean 与默认值；父组件输入只把 `required: true` 视为必填，且提取依赖
  运行时选项的字面量信息。
- 后果：组件作者错误处理本应已定义的值，或公开类型错误要求父组件传入默认 prop。
- 错误：用 `ExtractPropTypes` 发布父组件输入，并省略 props 选项末尾的 `as const`。
- 正确：内部使用 `ExtractPropTypes<typeof options>`，外部使用
  `ExtractPublicPropTypes<typeof options>`，并保留 `as const`。

### 4. 在脚本文件中写了 `declare module`，却没有形成模块增强

- 原因：官网要求增强位于模块 `.ts` / `.d.ts` 文件；没有 import/export 的声明文件可能不按预期
  合并 Vue 模块。
- 后果：原有 Vue 导出类型被遮蔽或增强不生效，错误只在消费组件时出现。
- 错误：纯全局 `vue.d.ts` 只写 `declare module 'vue' { ... }`。
- 正确：文件先写 `export {}` 或 `import 'vue'`，再增强 `declare module 'vue'`。

### 5. 把三个 `ComponentCustom*` 当成同一接口，或只写类型不装运行时

- 原因：Properties、Options、Props 分别作用于实例属性、组件选项和 TSX 公共 props；它们都是
  类型 seam，不会创建值或处理合并。
- 后果：`this.$service` 类型通过但运行时报 undefined，或用全局 TSX prop 掩盖组件 props 漏声明。
- 错误：增强 `ComponentCustomProps` 后期待 `app.config.globalProperties.$service` 自动存在。
- 正确：按使用面选择接口，并分别完成 runtime 安装、option merge strategy 或真实 props 声明。

### 6. 为 `CSSProperties` 加宽任意字符串索引或重复旧版增强

- 原因：3.5.40 已接受 `--${string}`，其余属性借助 `csstype` 保持封闭检查。
- 后果：`[key: string]: any` 会吞掉拼写错误；重复声明较窄的自定义属性索引还会偏离固定类型。
- 错误：把 `CSSProperties` 增强为 `[key: string]: any`。
- 正确：本基线直接使用 `--brand-color`；若确需扩展，只增加项目拥有的窄键名和准确值类型。

## 编译时标志页结构化易错点候选

### 1. 把标志当成运行时环境变量

- 原因：标志必须由 bundler 静态替换为布尔字面量，tree-shaking 才能删除不可达分支。
- 后果：运行时再读 `import.meta.env` 无法裁剪 Vue 内部代码，甚至留下未定义全局标识符。
- 错误：应用启动后执行 `window.__VUE_OPTIONS_API__ = false`。
- 正确：在 Vite `define` 中配置 `__VUE_OPTIONS_API__: 'false'`，然后重新构建目标产物。

### 2. 在非 `esm-bundler` 构建上承诺标志有效

- 原因：固定 rollup 配置只在 bundler ESM 格式把内部 feature flag 映射到三个外部标志；其他
  格式硬编码默认分支。
- 后果：CDN global、原生 esm-browser 或外置 CJS Vue 的行为与文档承诺不一致。
- 错误：给 `<script src="vue.global.prod.js">` 页面添加 webpack DefinePlugin 配置。
- 正确：先确认解析到 `vue(.runtime).esm-bundler.js`，再配置并验证对应 bundle。

### 3. 未审计依赖就关闭 Options API

- 原因：该标志会跳过 `applyOptions()`，并影响 mixin 参与的 props / emits 缓存和 options 解析。
- 后果：Composition API 应用本身看似正常，依赖 Options API 的插件或第三方组件却在生产失效。
- 错误：因为本地页面都用 `<script setup>` 就直接设为 `false`。
- 正确：审计应用与第三方依赖的 Options/mixin 使用，再以生产 bundle 回归决定是否关闭。

### 4. 长期开启生产 devtools 并把它当成可观测性方案

- 原因：标志保留 devtools hook 和组件调试元数据，但不提供业务错误采集、权限控制或留存策略。
- 后果：生产包持续增大，同时仍缺少可查询的错误与性能数据。
- 错误：永久启用 `__VUE_PROD_DEVTOOLS__` 代替监控 SDK。
- 正确：默认保持 `false`；确需诊断时限时开启专用构建，并使用独立监控承担可观测性。

### 5. 把 hydration 详细标志当成修复或 mismatch 豁免

- 原因：该标志主要保留详细检查和警告；hydration 仍会调和 DOM，生产环境仍可能输出概括性的
  mismatch 错误。
- 后果：服务端/客户端非确定性继续存在，只是日志更长，甚至因额外检查增加生产体积。
- 错误：开启标志后忽略时间、随机数或平台分支造成的 HTML 差异。
- 正确：先修复可避免差异；只为短期生产诊断开启，确实不可避免的 3.5 差异在第 41 批评估
  `data-allow-mismatch`。

## 源码推导与适用场景

### TypeScript 工具类型页（9 条）

1. `componentProps.ts` 的 `PropType<T>` 最终仍映射到一个或多个构造器；同文件开发期
   `assertType()` 对 `Object` 只检查对象身份。它适合给已受信业务对象补静态类型，不替代输入解析。
2. `ref.ts` 的 `MaybeRef<T>` 显式包含普通值、`Ref`、`ShallowRef` 与 `WritableComputedRef`；它适合
   只需读取“值或可写 ref”的轻量组合式参数。
3. 同文件的 `MaybeRefOrGetter<T>` 再加入 `ComputedRef` 与 getter，`toValue()` 对函数求值后再返回；
   它适合惰性、随依赖变化重新读取的 source 参数。
4. `componentProps.ts` 的 `RequiredKeys` 把 Boolean 和带默认值的 prop 归入内部必有键；
   `ExtractPropTypes` 适合 setup / 组件实现视角。
5. 同文件的 `PublicRequiredKeys` 只接受显式 `required: true`；`ExtractPublicPropTypes` 适合组件库
   对父组件公开输入，二者不能互换。
6. `ComponentCustomProperties` 同时进入公共实例交叉类型与 `AppConfig.globalProperties`；它适合
   插件安装后的 `$service` 类型，不适合无运行时赋值的纯声明。
7. `ComponentCustomOptions` 由 `ComponentOptionsBase` 扩展；它适合插件自定义 option 的编辑器和
   类型支持，实际合并语义仍归 `optionMergeStrategies`。
8. `ComponentCustomProps` 进入 `defineComponent` 的 `PublicProps`，固定类型测试也只从 TSX / `$props`
   seam 验证；它适合全局 TSX 属性，不适合作为业务组件 props 的捷径。
9. `jsx.ts` 继承 `csstype` 两种属性命名并只额外开放 `--${string}`；它适合 typed style object，
   不适合通过宽索引关闭 CSS 拼写检查。

### 编译时标志页（6 条）

1. `rollup.config.js` 只为 bundler ESM 输出保留三个外部 `__VUE_*` 标志，其他输出分别硬编码
   `true / false / false`；配置前必须先确认实际 Vue distribution。
2. `renderer.ts` 仅在 `__ESM_BUNDLER__` 创建 renderer 时调用 `initFeatureFlags()`；
   `featureFlags.ts` 的未定义回退保证能运行并在开发期警告，但静态注入才有可靠 tree-shaking。
3. `component.ts` 以 Options flag 包围 `applyOptions()`，props/emits 等文件还用它控制 mixin 缓存；
   关闭它适合经依赖审计的纯 Composition 构建，不是局部组件开关。
4. renderer、component、emits、KeepAlive 与 profiling 多处用 prod devtools flag 保留 hook 和元数据；
   它适合临时诊断构建，体积影响不只一个入口函数。
5. `hydration.ts` 用 hydration details flag 包围详细 warn 与部分 prop mismatch 检查，但 DOM 调和和
   概括性 `Hydration completed but contains mismatches.` 不以该标志作为修复开关。
6. hydration 代码位于客户端 renderer 路径；该标志适合已有 SSR + client hydration 应用的生产
   诊断。服务端输出、stream API 与 mismatch 容忍策略必须留到第 41 批平台边界说明。

## 实施验收与第 41 批停止边界

1. 新增 `utility-types` 与 `compile-time-flags` 两篇 quick Reference；合计保留本表冻结的 12 个
   唯一 heading / anchor，不新增 Demo、动画、依赖或真实构建配置。
2. 类型页应覆盖 9 项公开语义、6 个结构化易错点与 9 条固定源码推导；标志页应覆盖 3 项公开
   语义、5 个结构化易错点与 6 条固定源码推导。可以压缩文字，但不能合并掉索引身份或边界。
3. 类型页明确官网不是全部导出类型；标志页明确 `esm-bundler`、默认值、tree-shaking、版本和体积
   代价。hydration 标志只建立指向第 41 批 SSR 内容的后续交叉链接，不提前实现平台内容。
4. 12 项完成后机器统计应为 `193 available / 13 planned / 206 total`；第 41 批 13 项全部保持
   `planned` 且无 target。
5. 实施期运行定向 manifest/entry 测试、全量 Vitest、type-check、lint、format-check、build 与
   whitespace Gate；本批无 Demo，不用浏览器 smoke 冒充类型、tree-shaking 或 SSR 验证。
6. Standards / Spec 未达到 `PASS / 0 finding` 前不得开始第 41 批；不进入 Custom Elements、SSR、
   custom renderer、Vue Router、Pinia、React，也不修改 `learn` 主线。
