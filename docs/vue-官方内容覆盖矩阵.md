# Vue 官方内容覆盖矩阵

> 状态：正式覆盖基线  
> 权威文档：`docs/重构设计方案.md`、`docs/重构实施计划.md`  
> 结构化索引：`src/content/catalog/manifests/vue-core-reference-index.ts`  
>
> 核对日期：2026-08-03
> 官方入口：<https://cn.vuejs.org/api/>

## 当前覆盖

| 官方分类 | 页面 | 已映射 | 待补全 | 合计 |
| --- | ---: | ---: | ---: | ---: |
| 全局 API | 2 | 25 | 0 | 25 |
| 组合式 API | 7 | 51 | 0 | 51 |
| 选项式 API | 6 | 46 | 0 | 46 |
| 内置内容 | 4 | 26 | 0 | 26 |
| 单文件组件 | 3 | 25 | 0 | 25 |
| 进阶 API | 6 | 33 | 0 | 33 |
| **总计** | **28** | **206** | **0** | **206** |

“已映射”表示条目已有同模块站内详情或锚点目标；“待补全”仍保留官方名称和 URL，但不制造可点击假入口。映射深度分为核心详解、主题合并和快速参考，具体状态由结构化索引驱动。

## 范围与口径

- 本文只整理 Vue 中文官网 `https://cn.vuejs.org/api/` 及其官方 API 子页面，不引用指南页、第三方文章或本地项目代码。
- 当前官网索引包含 **6 个一级分类、28 个分类页、206 个索引条目**。这里的“索引条目”包含 API、选项、组件、指令、宏及 SFC 语法主题，不等同于 `vue` 包全部导出符号的数量。
- 清单按官网导航结构记录。`withDefaults()` 虽不是独立二级标题，但正文明确将其称为编译器宏，因此纳入宏清单。
- “版本提示”只记录官网页面明确展示的徽标或正文说明，不根据发布时间反推。官网 API 索引没有标出一项统一的当前 Vue patch 版本。
- 除明确标注外，不把条目自行归类为实验性、废弃或具有最低版本要求。

## 1. 全局 API

### [应用实例](https://cn.vuejs.org/api/application.html)

- 公开条目：`createApp()`、`createSSRApp()`、`app.mount()`、`app.unmount()`、`app.onUnmount()`、`app.component()`、`app.directive()`、`app.use()`、`app.mixin()`、`app.provide()`、`app.runWithContext()`、`app.version`、`app.config`、`app.config.errorHandler`、`app.config.warnHandler`、`app.config.performance`、`app.config.compilerOptions`、`app.config.globalProperties`、`app.config.optionMergeStrategies`、`app.config.idPrefix`、`app.config.throwUnhandledErrorInProduction`。
- `app.config.compilerOptions` 下还明确列出：`isCustomElement`、`whitespace`、`delimiters`、`comments`。
- 版本提示：`app.runWithContext()` 仅 3.3+；`app.onUnmount()`、`app.config.idPrefix`、`app.config.throwUnhandledErrorInProduction` 为 3.5+。
- 其他限定：`createSSRApp()` 是 SSR 应用入口，但标题没有 `SSR only` 徽标。

### [通用](https://cn.vuejs.org/api/general.html)

- 公开条目：`version`、`nextTick()`、`defineComponent()`、`defineAsyncComponent()`。
- 版本提示：`defineComponent()` 的函数签名语法仅 3.3+；该提示不限制对象语法。

## 2. 组合式 API

### [setup()](https://cn.vuejs.org/api/composition-api-setup.html)

- 索引主题：基本使用、访问 Props、Setup 上下文、与渲染函数一起使用。
- 版本提示：无。

### [响应式：核心](https://cn.vuejs.org/api/reactivity-core.html)

- 公开 API：`ref()`、`computed()`、`reactive()`、`readonly()`、`watchEffect()`、`watchPostEffect()`、`watchSyncEffect()`、`watch()`、`onWatcherCleanup()`。
- 版本提示：侦听器暂停/恢复为 3.5+；`watch()` 的 `once` 选项为 3.4+，数值型 `deep` 为 3.5+；`onWatcherCleanup()` 及页面对应的副作用清理写法为 3.5+。

### [响应式：工具](https://cn.vuejs.org/api/reactivity-utilities.html)

- 公开 API：`isRef()`、`unref()`、`toRef()`、`toValue()`、`toRefs()`、`isProxy()`、`isReactive()`、`isReadonly()`。
- 版本提示：`toRef()` 的值/ref/getter 规范化签名为 3.3+；`toValue()` 仅 3.3+。

### [响应式：进阶](https://cn.vuejs.org/api/reactivity-advanced.html)

- 公开 API：`shallowRef()`、`triggerRef()`、`customRef()`、`shallowReactive()`、`shallowReadonly()`、`toRaw()`、`markRaw()`、`effectScope()`、`getCurrentScope()`、`onScopeDispose()`。
- 版本提示：`onScopeDispose()` 用于消除无活跃作用域警告的第二个参数为 3.5+。

### [生命周期钩子](https://cn.vuejs.org/api/composition-api-lifecycle.html)

- 公开 API：`onMounted()`、`onUpdated()`、`onUnmounted()`、`onBeforeMount()`、`onBeforeUpdate()`、`onBeforeUnmount()`、`onErrorCaptured()`、`onRenderTracked()`、`onRenderTriggered()`、`onActivated()`、`onDeactivated()`、`onServerPrefetch()`。
- 版本提示：无。
- 其他限定：`onRenderTracked()`、`onRenderTriggered()` 仅开发环境；`onServerPrefetch()` 为 `SSR only`。

### [依赖注入](https://cn.vuejs.org/api/composition-api-dependency-injection.html)

- 公开 API：`provide()`、`inject()`、`hasInjectionContext()`。
- 版本提示：`hasInjectionContext()` 仅 3.3+。

### [辅助](https://cn.vuejs.org/api/composition-api-helpers.html)

- 公开 API：`useAttrs()`、`useSlots()`、`useModel()`、`useTemplateRef()`、`useId()`。
- 版本提示：`useModel()` 仅 3.4+；`useTemplateRef()`、`useId()` 为 3.5+。

## 3. 选项式 API

### [状态选项](https://cn.vuejs.org/api/options-state.html)

- 公开选项：`data`、`props`、`computed`、`methods`、`watch`、`emits`、`expose`。
- 版本提示：无。

### [渲染选项](https://cn.vuejs.org/api/options-rendering.html)

- 公开选项：`template`、`render`、`compilerOptions`、`slots`。
- 版本提示：`slots` 仅 Vue 3.3+。
- 其他限定：`slots` 标为 TypeScript 辅助选项。

### [生命周期选项](https://cn.vuejs.org/api/options-lifecycle.html)

- 公开选项：`beforeCreate`、`created`、`beforeMount`、`mounted`、`beforeUpdate`、`updated`、`beforeUnmount`、`unmounted`、`errorCaptured`、`renderTracked`、`renderTriggered`、`activated`、`deactivated`、`serverPrefetch`。
- 版本提示：无。
- 其他限定：`renderTracked`、`renderTriggered` 仅开发环境；`serverPrefetch` 为 `SSR only`。

### [组合选项](https://cn.vuejs.org/api/options-composition.html)

- 公开选项：`provide`、`inject`、`mixins`、`extends`。
- 版本提示：无。

### [其他杂项](https://cn.vuejs.org/api/options-misc.html)

- 公开选项：`name`、`inheritAttrs`、`components`、`directives`。
- 版本提示：3.2.34+ 的 `<script setup>` SFC 会按文件名自动推导 `name`；这不是 `name` 选项本身的最低版本。

### [组件实例](https://cn.vuejs.org/api/component-instance.html)

- 公开属性和方法：`$data`、`$props`、`$el`、`$options`、`$parent`、`$root`、`$slots`、`$refs`、`$attrs`、`$watch()`、`$emit()`、`$forceUpdate()`、`$nextTick()`。
- 版本提示：无。

## 4. 内置内容

### [指令](https://cn.vuejs.org/api/built-in-directives.html)

- 内置指令：`v-text`、`v-html`、`v-show`、`v-if`、`v-else`、`v-else-if`、`v-for`、`v-on`、`v-bind`、`v-model`、`v-slot`、`v-pre`、`v-once`、`v-memo`、`v-cloak`。
- 版本提示：`v-bind` 的 `.prop`、`.attr` 修饰符为 3.2+；同名 attribute 省略值的简写为 3.4+；`v-memo` 仅 3.2+。

### [组件](https://cn.vuejs.org/api/built-in-components.html)

- 内置组件：`<Transition>`、`<TransitionGroup>`、`<KeepAlive>`、`<Teleport>`、`<Suspense>`。
- 版本提示：`<Teleport defer>` 的延迟目标解析为 3.5+。
- 实验性：`<Suspense>` 是当前 API 索引中唯一显式标为 `experimental` 的条目。

### [特殊元素](https://cn.vuejs.org/api/built-in-special-elements.html)

- 内置特殊元素：`<component>`、`<slot>`、`<template>`。
- 版本提示：无。

### [特殊 Attributes](https://cn.vuejs.org/api/built-in-special-attributes.html)

- 特殊 Attributes：`key`、`ref`、`is`。
- 版本提示：`is` 用于原生 HTML 元素的场景仅 3.1+；这不是 `is` 整体的最低版本。

## 5. 单文件组件

### [语法定义](https://cn.vuejs.org/api/sfc-spec.html)

- 索引主题：总览、相应语言块、自动名称推导、预处理器、`src` 导入、注释。
- 语言块：`<template>`、`<script>`、`<script setup>`、`<style>`、自定义块。
- 版本提示：无。

### [`<script setup>`](https://cn.vuejs.org/api/sfc-script-setup.html)

- 索引主题：基本语法、响应式、使用组件、使用自定义指令、`defineProps()` 和 `defineEmits()`、`defineModel()`、`defineExpose()`、`defineOptions()`、`defineSlots()`、`useSlots()` 和 `useAttrs()`、与普通 `<script>` 一起使用、顶层 `await`、导入语句、泛型、限制。
- 编译器宏：`defineProps()`、`defineEmits()`、`withDefaults()`、`defineModel()`、`defineExpose()`、`defineOptions()`、`defineSlots()`。
- 运行时辅助：`useSlots()`、`useAttrs()`；两者也出现在组合式 API“辅助”分类中。
- 版本提示：`defineEmits()` 具名元组语法为 3.3+；`defineProps()` 对导入类型及有限复杂类型的支持从 3.3 起放宽；响应式 Props 解构为 3.5+；3.4 及以下版本的类型声明默认值需要 `withDefaults()`；`defineModel()` 为 3.4+；`defineOptions()`、`defineSlots()` 为 3.3+。
- 其他限定：`defineSlots()` 和泛型章节标为 TypeScript；顶层 `await` 会编译为 `async setup()`，页面要求与仍属实验性的 `<Suspense>` 配合使用。

### [CSS 功能](https://cn.vuejs.org/api/sfc-css-features.html)

- 公开功能：组件作用域 CSS、CSS Modules、CSS 中的 `v-bind()`。
- 版本提示：无。

## 6. 进阶 API

### [自定义元素](https://cn.vuejs.org/api/custom-elements.html)

- 公开 API：`defineCustomElement()`、`useHost()`、`useShadowRoot()`、`this.$host`。
- 版本提示：`defineCustomElement()` 的 `configureApp`、`shadowRoot`、`nonce` 选项为 3.5+；`useHost()`、`useShadowRoot()`、`this.$host` 为 3.5+。

### [渲染函数](https://cn.vuejs.org/api/render-function.html)

- 公开 API：`h()`、`mergeProps()`、`cloneVNode()`、`isVNode()`、`resolveComponent()`、`resolveDirective()`、`withDirectives()`、`withModifiers()`。
- 版本提示：无。

### [服务端渲染](https://cn.vuejs.org/api/ssr.html)

- 公开 API/attribute：`renderToString()`、`renderToNodeStream()`、`pipeToNodeWritable()`、`renderToWebStream()`、`pipeToWebWritable()`、`renderToSimpleStream()`、`useSSRContext()`、`data-allow-mismatch`。
- 版本提示：`data-allow-mismatch` 为 3.5+。
- 其他限定：整页属于服务端渲染 API。

### [TypeScript 工具类型](https://cn.vuejs.org/api/utility-types.html)

- 公开工具类型：`PropType<T>`、`MaybeRef<T>`、`MaybeRefOrGetter<T>`、`ExtractPropTypes<T>`、`ExtractPublicPropTypes<T>`、`ComponentCustomProperties`、`ComponentCustomOptions`、`ComponentCustomProps`、`CSSProperties`。
- 版本提示：`MaybeRef<T>`、`MaybeRefOrGetter<T>`、`ExtractPublicPropTypes<T>` 仅 3.3+。
- 范围边界：官网明确说明该页只列出需要解释的常用工具类型，并非 Vue 所有导出类型的完整列表。

### [自定义渲染](https://cn.vuejs.org/api/custom-renderer.html)

- 公开 API：`createRenderer()`。
- 版本提示：无。

### [编译时标志](https://cn.vuejs.org/api/compile-time-flags.html)

- 公开标志：`__VUE_OPTIONS_API__`、`__VUE_PROD_DEVTOOLS__`、`__VUE_PROD_HYDRATION_MISMATCH_DETAILS__`；页面另列 Vite、vue-cli、webpack、Rollup 配置指南。
- 版本提示：`__VUE_PROD_HYDRATION_MISMATCH_DETAILS__` 仅 3.4+。
- 其他限定：这些标志仅对 `esm-bundler` 构建生效，不是运行时 API。

## 版本边界汇总

| 版本 | 官网明确提示的能力 |
| --- | --- |
| 3.1+ | 原生 HTML 元素上的 `is` 场景 |
| 3.2+ | `v-bind` 的 `.prop`、`.attr`；`v-memo` |
| 3.2.34+ | `<script setup>` SFC 按文件名自动推导 `name` |
| 3.3+ | `app.runWithContext()`；`defineComponent()` 函数签名；`toRef()` 规范化签名；`toValue()`；`hasInjectionContext()`；渲染选项 `slots`；`defineEmits()` 具名元组；`defineProps()` 导入/有限复杂类型；`defineOptions()`；`defineSlots()`；`MaybeRef<T>`；`MaybeRefOrGetter<T>`；`ExtractPublicPropTypes<T>` |
| 3.4+ | `watch()` 的 `once`；`useModel()`；`v-bind` 同名 attribute 简写；`defineModel()`；`__VUE_PROD_HYDRATION_MISMATCH_DETAILS__` |
| 3.5+ | `app.onUnmount()`；`app.config.idPrefix`；`app.config.throwUnhandledErrorInProduction`；侦听器暂停/恢复；数值型 `deep`；`onWatcherCleanup()`；`onScopeDispose()` 第二参数；`useTemplateRef()`；`useId()`；`<Teleport defer>`；响应式 Props 解构；自定义元素新增选项和宿主辅助；`data-allow-mismatch` |

## 来源与核验说明

1. 以 [Vue 中文官网 API 索引](https://cn.vuejs.org/api/) 为目录基线，逐页核对上述 28 个官方 API 子页面。
2. 外部检索优先使用 Tavily 的站点映射、页面抽取和站内限定搜索，域名限制为 `cn.vuejs.org`，没有采用第三方搜索结果作为事实来源。
3. Tavily 的初始站点地图漏列 `options-state.html` 和 `render-function.html`，且会截断索引后半段、丢弃页面内版本徽标；`ssr.html` 的正文抽取也曾返回空内容。因此仅针对这些缺口直接读取相同官方 API 页面 HTML，核对侧栏、二级标题和 `data-text` 版本徽标。未使用 Vue 指南页或官方仓库补充事实。
4. 28 个分类页在核对时均可访问。无法核实项：无。

## 本地覆盖对照

本地实际安装版本与本批冻结基线均为 `vue@3.5.40`，不存在本批 3.5 API 超出项目版本的阻塞。`src/content/entries/reference/vue/core/` 当前有 50 篇 Reference 内容；纯语法、类型、构建配置与平台边界主题复用现有 Reference 模板，不新增 Demo。目录现分为 9 类。

| 官网分类 | 本地状态 | 主要缺口 |
| --- | --- | --- |
| 全局 API | 已覆盖 | 25 项已全部映射；`createSSRApp()` 使用独立速查页，8 项应用扩展与配置使用主题合并页 |
| 组合式 API | 已覆盖 | 51 项已全部映射；`setup()` 三项并入 `defineComponent()`，渲染调试钩子、`hasInjectionContext()` 并入对应主题，`useId()` 使用独立详解 |
| 选项式 API | 已覆盖 | 33 项组件选项与 13 项组件公共实例已由六篇主题合并页承接 |
| 内置内容 | 已覆盖 | 5 个内置组件、15 个内置指令、3 个特殊元素与 3 个特殊 Attributes 均已映射；模板原语主题页统一承接 `<component>`、`<template>`、`key` 与 `is` |
| 单文件组件 | 已覆盖 | SFC 语法、`<script setup>` 与 SFC CSS 三篇主题页已承接 25 项官方索引 |
| 进阶 API | 已覆盖 | 渲染函数、TypeScript 工具类型、编译时标志、Custom Elements、SSR 与自定义渲染器 33 项均已映射 |

`watch()` 页面已包含 3.5 的 `pause()` / `resume()` 与数值型 `deep`，本轮不再保留该增量缺口。

## 建议范围

《重构设计方案》的 Vue API 覆盖策略要求每个官网索引主题都可检索，但不应按 206 个索引条目各建一篇重型文章。建议分层：

1. `setup()`、应用配置、Options API、内置内容、SFC 与渲染辅助已经完成映射，重复概念继续复用现有主题页。
2. TypeScript 工具类型与编译时标志已采用两篇速查页承接；类型增强、`esm-bundler` 与 hydration 诊断边界均保留独立锚点。
3. SSR、Custom Elements 与自定义渲染器已由三篇平台边界速查页承接；当前浏览器 SPA 不用 Demo 冒充服务端、Web Component 或非 DOM renderer 验证。

这样保留“全覆盖”的产品目标，同时避免把低频配置项和重复语法按核心响应式 API 的深度逐条扩写。
