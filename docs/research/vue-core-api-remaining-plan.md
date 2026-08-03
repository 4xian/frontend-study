# Vue 3 Core Reference 剩余 API 调研与实施批次

> 状态：实施前研究快照，不代表已完成内容实现  
> 范围：仅 Vue 3 Core Reference；不含 Vue Router、Pinia、`learn` 课程主线  
> 审计对象：`src/content/catalog/manifests/vue-core-reference-index.ts`  
> Manifest SHA-256：`9b56ca6add9b5c05e46172bc700c915331b28208f44a4df01442852e74978174`  
> 版本基线：本地 `vue@3.5.40`、`@vue/compiler-sfc@3.5.40`、
> `@vue/server-renderer@3.5.40`  
> 核验日期：2026-08-02  
> 官方入口：<https://cn.vuejs.org/api/>

## 结论

- 本地索引共有 206 项：71 项 `available`，135 项 `planned`。
- 135 项 `planned` 全部仍存在于 Vue 官方 Core API 索引；名称、一级分类、官方页面和
  fragment 逐项匹配，没有失效链接、移类项或需要删除的项。
- planned 深度为 `detail 1 / merged 106 / quick 28`。分级符合仓库既定口径，本计划不建议
  改级：唯一 `detail` 是 `useId()`；重复语法和同页选项保持 `merged`；SSR、Custom
  Elements、类型、渲染器、编译标志及版本读取等环境相关或低频能力保持 `quick`。
- 一级分类计数为：全局 API 12、组合式 API 7、选项式 API 46、内置内容 19、单文件组件
  21、进阶 API 30，共 135。
- 按冻结 manifest 的宿主建议，约 25 项可由原有 Reference 页面承接；完整交付形态还需要
  1 个 `detail`、12 个 `merged`、5 个 `quick` 主题页，而不是为 135 项分别建页。当前脏工作区
  已有在制的 `useId()` detail entry、Demo 和 track 注册，但 index 仍是 `planned` 且没有 target；
  B01 应复核并接通这份在制成果，不能重复建页。因此按当前文件状态净新增约 17 个主题页，
  已注册 Reference entry 预计由 32 个增至约 49 个。
- 官方全集有 `compile-time-flags#configuration-guides` 这一说明性章节，但它不是独立 API；
  本地另把 `<script setup>` 正文中的 `withDefaults()` 作为已完成条目收录。这个 206 对 206
  的口径差异不属于剩余 135 项，也不阻塞本计划。

## 来源与方法

### 一手来源

事实来源只采用 Vue 官方文档和固定版本源码：

- [Vue API 参考索引](https://cn.vuejs.org/api/)：核对 6 个一级分类、28 个分类页和官方链接。
- [Vue 3.5 发布说明](https://blog.vuejs.org/posts/vue-3-5)：核对 3.5 新增能力的版本背景；具体
  public contract 仍以对应 API 页为准。
- [`vuejs/core@v3.5.40`](https://github.com/vuejs/core/tree/v3.5.40)：该 tag 核验时解析到
  `fa2885d8c48768d26f1666a01bd540ffe3b20f9b`，与本地三个 Vue 包的 3.5.40 基线对齐。
- 本文各逐项表格中的 API 名称直接链接到对应 Vue 官方页面锚点；这些链接同时构成逐项
  来源记录。
- 版本和环境边界以对应官方 API 页正文为准，例如
  [应用实例](https://cn.vuejs.org/api/application.html)、
  [`<script setup>`](https://cn.vuejs.org/api/sfc-script-setup.html)、
  [自定义元素](https://cn.vuejs.org/api/custom-elements.html)、
  [SSR](https://cn.vuejs.org/api/ssr.html) 和
  [编译时标志](https://cn.vuejs.org/api/compile-time-flags.html)。
- 官网摘要不足时只用同一固定 commit 的源码定位实现 seam：
  [`apiCreateApp.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/apiCreateApp.ts)
  对应应用实例与 `AppConfig`，
  [`useId.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/helpers/useId.ts)
  对应 `useId()` / `idPrefix`，
  [`apiCustomElement.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-dom/src/apiCustomElement.ts)
  对应 Custom Elements，
  [`server-renderer/index.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/server-renderer/src/index.ts)
  对应 SSR public exports。源码只用于解释版本与环境边界，不把内部实现细节写成 public
  contract。

### 核验方法

1. 通过 TypeScript AST 解析本地 manifest，冻结 206/71/135、分组、section、depth、状态和
   URL；不执行 manifest 中的代码。审计快照由页首 SHA-256 标识。
2. 使用 Tavily 映射 `cn.vuejs.org/api/`，并抽取 24 个含 planned 项的官方页面；站点映射漏列
   `render-function.html`，因此又以明确官方 URL 单独抽取该页。
3. 将官方索引的 206 个唯一 `/api/` 链接与 manifest URL 集做机械比对，再对 135 个
   `planned` 项逐项检查名称、分类页和 fragment。
4. 依据仓库“核心详解 / 主题合并 / 速查条目”定义复核 depth，而不是按一个官方锚点机械
   新建一篇文章。
5. 依照内容前置、复用宿主和运行环境把 135 项分为 12 批；每项只进入一个批次。

## 深度与依赖口径

| 标记 | 实施含义 | 本次判定 |
| --- | --- | --- |
| `detail` | 独立参考页，包含签名、心智模型、最小示例和必要 Demo | 仅 `useId()`；保留 |
| `merged` | 合并到同主题参考页，每项有唯一站内锚点和可搜索元数据 | 106 项；保留 |
| `quick` | 同主题速查页，写清签名、版本、环境、限制和最小示例 | 28 项；保留 |

下表中的“依赖”是内容编写和验收顺序，不是运行时依赖，也不是当前 manifest 字段：

- `现有`：依赖当前已 available 的 Vue Core Reference 页面，应复用或交叉链接，不重写课程。
- `同批`：应在同一批的同一宿主页中共同完成，不能先把其中一项标为 available。
- `Bxx`：若编号小于当前批次，表示必须先完成并具备稳定站内锚点的硬前置；若编号大于当前
  批次，表示后续联动，不阻塞当前批。例如 B01 `useId()` 指向 B02 `idPrefix` 和 B12 SSR，
  是要求后续补齐交叉链接，不构成循环依赖。
- 每个 merged/quick 宿主页必须先确定 entry id 和页内 anchor，再一次性更新其覆盖项；不得制造
  指向不存在页面的 target。

## 批次总览

| 批次 | 主题 | 数量 | 主要前置 | 交付形态 |
| --- | --- | ---: | --- | --- |
| B01 | 基础语义与入口 | 10 | 现有 create-app、define-component、lifecycle、provide/inject | 复核 1 个在制 detail 并增补现有页锚点 |
| B02 | 应用扩展与配置 | 9 | B01、现有 create-app/error handling | 应用实例主题与 SSR 入口速查 |
| B03 | Options 状态与渲染 | 11 | 现有响应式、props/emits、render/slots | 2 个 merged 主题页 |
| B04 | Options 生命周期 | 14 | B03、现有 lifecycle | 1 个 merged 主题页 |
| B05 | Options 组合与杂项 | 8 | B03 | 2 个 merged 主题页 |
| B06 | 组件公共实例 | 13 | B03-B05、现有 refs/attrs/slots | 1 个 merged 主题页 |
| B07 | 内置指令 | 15 | B03、现有模板/事件/表单参考 | 1 个 merged 主题页 |
| B08 | 模板原语与 SFC 语法 | 10 | B03、B06、B07 | 2 个 merged 主题页 |
| B09 | `<script setup>` | 12 | B03、B05、B08、现有宏参考 | 1 个 merged 主题页 |
| B10 | SFC CSS 与渲染辅助 | 8 | B07-B09、现有 render-function | 1 个新 merged 页并增补现有页 |
| B11 | TypeScript 类型与编译标志 | 12 | B03、B09、B10 | 2 个 quick 页 |
| B12 | 平台边界 | 13 | B01、B02、B09-B11 | Custom Elements、SSR、renderer 三个 quick 页 |
| **总计** |  | **135** |  |  |

## 逐项计划

### B01 基础语义与入口（10）

官方分类：全局 API / 应用实例、全局 API / 通用、组合式 API / `setup()`、生命周期钩子、
依赖注入、辅助。

| Manifest id | 官方来源 | Depth | 依赖 / 宿主 | 适配结论 |
| --- | --- | --- | --- | --- |
| `application.app-on-unmount` | [`app.onUnmount()`](https://cn.vuejs.org/api/application.html#app-onunmount) | merged | 现有 create-app 的 mount/unmount | 增加 3.5+ 应用级清理钩子、多次注册与组件钩子边界 |
| `application.app-version` | [`app.version`](https://cn.vuejs.org/api/application.html#app-version) | quick | 同批 `general.version` | 两种版本读取入口放同一速查主题，不重复示例 |
| `general.version` | [`version`](https://cn.vuejs.org/api/general.html#version) | quick | 同批 `app-version` | 保留独立锚点并对照应用实例属性 |
| `composition-api-setup.basic-usage` | [基本使用](https://cn.vuejs.org/api/composition-api-setup.html#basic-usage) | merged | 现有 defineComponent/ref/reactive | 合并到 `defineComponent()` 页，说明 Options API 组件中的组合式入口 |
| `composition-api-setup.accessing-props` | [访问 Props](https://cn.vuejs.org/api/composition-api-setup.html#accessing-props) | merged | 现有 defineComponent、props、toRef/toRefs | 合并到 `defineComponent()` 页，保留 props 只读与响应性边界 |
| `composition-api-setup.setup-context` | [Setup 上下文](https://cn.vuejs.org/api/composition-api-setup.html#setup-context) | merged | 现有 defineComponent/attrs/slots/emits | 合并到 `defineComponent()` 页，按 attrs/slots/emit/expose 建锚点 |
| `composition-api-lifecycle.on-render-tracked` | [`onRenderTracked()`](https://cn.vuejs.org/api/composition-api-lifecycle.html#onrendertracked) | merged | 现有 lifecycle/reactivity | 增补现有生命周期页；标明仅开发环境 |
| `composition-api-lifecycle.on-render-triggered` | [`onRenderTriggered()`](https://cn.vuejs.org/api/composition-api-lifecycle.html#onrendertriggered) | merged | 同批 `on-render-tracked` | 与 tracked 成对讲 debugger event，不拆页 |
| `composition-api-dependency-injection.has-injection-context` | [`hasInjectionContext()`](https://cn.vuejs.org/api/composition-api-dependency-injection.html#has-injection-context) | merged | 现有 provide/inject | 增补现有依赖注入页；说明 3.3+ 与库调用场景 |
| `composition-api-helpers.use-id` | [`useId()`](https://cn.vuejs.org/api/composition-api-helpers.html#useid) | detail | 在制 use-id entry/Demo；B02 `idPrefix`、B12 SSR | 复核现有详解与 Demo 后挂接唯一 target；覆盖应用内唯一、SSR 稳定、多应用前缀和禁止在 computed 内调用，不重复建页 |

### B02 应用生命周期与配置（9）

官方分类：[全局 API / 应用实例](https://cn.vuejs.org/api/application.html)。`createSSRApp()`
作为 quick 入口锚点，其余 8 项 `merged` 到应用实例主题；增补时仍须检查单文件约
1000 行上限。

| Manifest id | 官方来源 | 依赖 / 宿主 | 适配结论 |
| --- | --- | --- | --- |
| `application.create-ssr-app` | [`createSSRApp()`](https://cn.vuejs.org/api/application.html#createssrapp) | B12 SSR | 先建立入口速查锚点，服务端渲染细节只在 B12 展开 |
| `application.app-mixin` | [`app.mixin()`](https://cn.vuejs.org/api/application.html#app-mixin) | B05 mixins | 只讲应用级作用域、代价与 Options 对照 |
| `application.app-run-with-context` | [`app.runWithContext()`](https://cn.vuejs.org/api/application.html#app-runwithcontext) | 现有 app.provide/inject | 说明 3.3+、同步回调和注入上下文 |
| `application.app-config-warn-handler` | [`app.config.warnHandler`](https://cn.vuejs.org/api/application.html#app-config-warnhandler) | 现有 errorHandler | 与错误处理并列，明确仅开发环境 |
| `application.app-config-performance` | [`app.config.performance`](https://cn.vuejs.org/api/application.html#app-config-performance) | 浏览器 Performance API | 只写浏览器开发性能标记边界，不造通用 profiler |
| `application.app-config-compiler-options` | [`app.config.compilerOptions`](https://cn.vuejs.org/api/application.html#app-config-compileroptions) | B03 compilerOptions、B08 SFC | 区分完整构建运行时编译与 Vite 构建配置 |
| `application.app-config-option-merge-strategies` | [`app.config.optionMergeStrategies`](https://cn.vuejs.org/api/application.html#app-config-optionmergestrategies) | B05 mixins/extends、B06 `$options` | 用同一自定义选项示例串起三处锚点 |
| `application.app-config-id-prefix` | [`app.config.idPrefix`](https://cn.vuejs.org/api/application.html#app-config-idprefix) | B01 `useId()` | 3.5+；多应用 ID 隔离必须交叉链接 detail 页 |
| `application.app-config-throw-unhandled-error-in-production` | [`app.config.throwUnhandledErrorInProduction`](https://cn.vuejs.org/api/application.html#app-config-throwunhandlederrorinproduction) | 现有 errorHandler | 3.5+；说明默认生产行为及监控边界 |

### B03 Options 状态与渲染（11）

官方分类：选项式 API / 状态选项、渲染选项。全部 `merged`，建议分别建立状态和渲染两个
宿主页；Composition API 只作对照链接，不把 Options 内容写进课程主线。

| Manifest id | 官方来源 | 依赖 / 宿主 | 适配结论 |
| --- | --- | --- | --- |
| `options-state.data` | [`data`](https://cn.vuejs.org/api/options-state.html#data) | 现有 reactive | 状态页锚点；突出普通对象、实例代理和声明时机 |
| `options-state.props` | [`props`](https://cn.vuejs.org/api/options-state.html#props) | 现有 props | 状态页锚点；复用校验与默认值概念 |
| `options-state.computed` | [`computed`](https://cn.vuejs.org/api/options-state.html#computed) | 现有 computed | 状态页锚点；对照只读/可写 computed |
| `options-state.methods` | [`methods`](https://cn.vuejs.org/api/options-state.html#methods) | 同批 data | 状态页锚点；说明 `this` 绑定与避免箭头函数 |
| `options-state.watch` | [`watch`](https://cn.vuejs.org/api/options-state.html#watch) | 现有 watch | 状态页锚点；覆盖路径 key、handler 对象与数组形式 |
| `options-state.emits` | [`emits`](https://cn.vuejs.org/api/options-state.html#emits) | 现有 emits | 状态页锚点；复用事件声明/校验契约 |
| `options-state.expose` | [`expose`](https://cn.vuejs.org/api/options-state.html#expose) | 现有 template refs | 状态页锚点；与 `defineExpose()` 区分 |
| `options-rendering.template` | [`template`](https://cn.vuejs.org/api/options-rendering.html#template) | B08 SFC、同批 render | 渲染页锚点；明确完整构建与不可信模板风险 |
| `options-rendering.render` | [`render`](https://cn.vuejs.org/api/options-rendering.html#render) | 现有 render-function | 渲染页锚点；说明优先于 template |
| `options-rendering.compiler-options` | [`compilerOptions`](https://cn.vuejs.org/api/options-rendering.html#compileroptions) | B02 app compilerOptions | 渲染页锚点；说明组件级优先级和仅完整构建 |
| `options-rendering.slots` | [`slots`](https://cn.vuejs.org/api/options-rendering.html#slots) | 现有 slots | 渲染页锚点；标明 3.3+ 且运行时值不使用 |

### B04 Options 生命周期（14）

官方分类：[选项式 API / 生命周期选项](https://cn.vuejs.org/api/options-lifecycle.html)。全部
`merged` 到一个按创建、挂载、更新、卸载、调试、缓存、SSR 分段的宿主页。

| Manifest id | 官方来源 | 依赖 / 宿主 | 适配结论 |
| --- | --- | --- | --- |
| `options-lifecycle.before-create` | [`beforeCreate`](https://cn.vuejs.org/api/options-lifecycle.html#beforecreate) | B03 state | 与 created 成对；标明 setup 更早 |
| `options-lifecycle.created` | [`created`](https://cn.vuejs.org/api/options-lifecycle.html#created) | 同批 beforeCreate | 状态已处理、尚未挂载 |
| `options-lifecycle.before-mount` | [`beforeMount`](https://cn.vuejs.org/api/options-lifecycle.html#beforemount) | 现有 lifecycle | 与 mounted 成对；SSR 不调用 |
| `options-lifecycle.mounted` | [`mounted`](https://cn.vuejs.org/api/options-lifecycle.html#mounted) | 同批 beforeMount | 明确同步子树和 DOM 可用边界 |
| `options-lifecycle.before-update` | [`beforeUpdate`](https://cn.vuejs.org/api/options-lifecycle.html#beforeupdate) | B03 state | 与 updated 成对 |
| `options-lifecycle.updated` | [`updated`](https://cn.vuejs.org/api/options-lifecycle.html#updated) | 同批 beforeUpdate | 需要特定 DOM 更新时转向 nextTick |
| `options-lifecycle.before-unmount` | [`beforeUnmount`](https://cn.vuejs.org/api/options-lifecycle.html#beforeunmount) | 现有 lifecycle | 与 unmounted 成对 |
| `options-lifecycle.unmounted` | [`unmounted`](https://cn.vuejs.org/api/options-lifecycle.html#unmounted) | 同批 beforeUnmount | 聚焦副作用清理 |
| `options-lifecycle.error-captured` | [`errorCaptured`](https://cn.vuejs.org/api/options-lifecycle.html#errorcaptured) | 现有 error handling | 说明向上传播、返回 false 与全局 handler |
| `options-lifecycle.render-tracked` | [`renderTracked`](https://cn.vuejs.org/api/options-lifecycle.html#rendertracked) | B01 render-tracked | 仅开发环境；与组合式签名对照 |
| `options-lifecycle.render-triggered` | [`renderTriggered`](https://cn.vuejs.org/api/options-lifecycle.html#rendertriggered) | 同批 renderTracked | 共用 debugger event 表 |
| `options-lifecycle.activated` | [`activated`](https://cn.vuejs.org/api/options-lifecycle.html#activated) | 现有 KeepAlive | 与 deactivated 成对 |
| `options-lifecycle.deactivated` | [`deactivated`](https://cn.vuejs.org/api/options-lifecycle.html#deactivated) | 同批 activated | 明确缓存离开不等于卸载 |
| `options-lifecycle.server-prefetch` | [`serverPrefetch`](https://cn.vuejs.org/api/options-lifecycle.html#serverprefetch) | B12 SSR | 标明 SSR only；B04 只建完整锚点 |

### B05 Options 组合与杂项（8）

官方分类：选项式 API / 组合选项、其他杂项。全部 `merged`，分别建立两个宿主页。

| Manifest id | 官方来源 | 依赖 / 宿主 | 适配结论 |
| --- | --- | --- | --- |
| `options-composition.provide` | [`provide`](https://cn.vuejs.org/api/options-composition.html#provide) | 现有 provide/inject | 组合页锚点；覆盖对象与函数形式 |
| `options-composition.inject` | [`inject`](https://cn.vuejs.org/api/options-composition.html#inject) | 同批 provide | 组合页锚点；覆盖别名与默认工厂 |
| `options-composition.mixins` | [`mixins`](https://cn.vuejs.org/api/options-composition.html#mixins) | B03-B04 options | 组合页锚点；说明合并顺序及 Composition 推荐替代 |
| `options-composition.extends` | [`extends`](https://cn.vuejs.org/api/options-composition.html#extends) | 同批 mixins | 组合页锚点；明确不合并 setup |
| `options-misc.name` | [`name`](https://cn.vuejs.org/api/options-misc.html#name) | 现有 KeepAlive | 杂项页锚点；写清 SFC 文件名推导 |
| `options-misc.inherit-attrs` | [`inheritAttrs`](https://cn.vuejs.org/api/options-misc.html#inheritattrs) | 现有 attrs、B09 defineOptions | 杂项页锚点；复用透传控制语义 |
| `options-misc.components` | [`components`](https://cn.vuejs.org/api/options-misc.html#components) | B03 render | 杂项页锚点；局部注册边界 |
| `options-misc.directives` | [`directives`](https://cn.vuejs.org/api/options-misc.html#directives) | B07、现有 custom directives | 杂项页锚点；局部指令注册边界 |

### B06 组件公共实例（13）

官方分类：[选项式 API / 组件实例](https://cn.vuejs.org/api/component-instance.html)。全部
`merged` 到一个公共实例宿主页；页面开头必须保留“除 `$data` 嵌套属性外均只读”的官方边界。

| Manifest id | 官方来源 | 依赖 / 宿主 | 适配结论 |
| --- | --- | --- | --- |
| `component-instance.data` | [`$data`](https://cn.vuejs.org/api/component-instance.html#data) | B03 data | 与 data 选项双向链接 |
| `component-instance.props` | [`$props`](https://cn.vuejs.org/api/component-instance.html#props) | B03 props | 只读已解析 props |
| `component-instance.el` | [`$el`](https://cn.vuejs.org/api/component-instance.html#el) | B04 mounted、现有 refs | 推荐模板引用，写清多根占位节点 |
| `component-instance.options` | [`$options`](https://cn.vuejs.org/api/component-instance.html#options) | B05 mixins/extends、B02 merge strategy | 展示已解析合并结果 |
| `component-instance.parent` | [`$parent`](https://cn.vuejs.org/api/component-instance.html#parent) | 同批 root | 只作逃生口，不包装成推荐通信方式 |
| `component-instance.root` | [`$root`](https://cn.vuejs.org/api/component-instance.html#root) | 同批 parent | 与 parent 合并讲层级边界 |
| `component-instance.slots` | [`$slots`](https://cn.vuejs.org/api/component-instance.html#slots) | 现有 slots | 与 setup context / useSlots 对照 |
| `component-instance.refs` | [`$refs`](https://cn.vuejs.org/api/component-instance.html#refs) | 现有 template refs | 写清挂载时机与非响应式边界 |
| `component-instance.attrs` | [`$attrs`](https://cn.vuejs.org/api/component-instance.html#attrs) | 现有 attrs | 与 inheritAttrs 对照 |
| `component-instance.watch` | [`$watch()`](https://cn.vuejs.org/api/component-instance.html#watch) | B03 watch | 返回停止函数；只讲实例式入口差异 |
| `component-instance.emit` | [`$emit()`](https://cn.vuejs.org/api/component-instance.html#emit) | 现有 emits | 与 emits 声明契约交叉链接 |
| `component-instance.force-update` | [`$forceUpdate()`](https://cn.vuejs.org/api/component-instance.html#forceupdate) | 现有 reactivity | 速释极少需要，不扩为常规更新方案 |
| `component-instance.next-tick` | [`$nextTick()`](https://cn.vuejs.org/api/component-instance.html#nexttick) | 现有 nextTick | 说明回调 `this` 绑定差异 |

### B07 内置指令（15）

官方分类：[内置内容 / 指令](https://cn.vuejs.org/api/built-in-directives.html)。全部 `merged` 到一个
指令参考页，每个指令有独立锚点；按内容、条件/列表、事件/绑定、编译优化四组组织。

| Manifest id | 官方来源 | 依赖 / 宿主 | 适配结论 |
| --- | --- | --- | --- |
| `built-in-directives.v-text` | [`v-text`](https://cn.vuejs.org/api/built-in-directives.html#v-text) | 现有 template syntax | 与插值对照 |
| `built-in-directives.v-html` | [`v-html`](https://cn.vuejs.org/api/built-in-directives.html#v-html) | 同批 v-text | 必须保留不可信 HTML 安全边界 |
| `built-in-directives.v-show` | [`v-show`](https://cn.vuejs.org/api/built-in-directives.html#v-show) | 同批 v-if | 对照 CSS 切换与销毁 |
| `built-in-directives.v-if` | [`v-if`](https://cn.vuejs.org/api/built-in-directives.html#v-if) | 现有 conditional rendering | 与 else 链同段 |
| `built-in-directives.v-else` | [`v-else`](https://cn.vuejs.org/api/built-in-directives.html#v-else) | 同批 v-if | 不拆独立示例 |
| `built-in-directives.v-else-if` | [`v-else-if`](https://cn.vuejs.org/api/built-in-directives.html#v-else-if) | 同批 v-if | 不拆独立示例 |
| `built-in-directives.v-for` | [`v-for`](https://cn.vuejs.org/api/built-in-directives.html#v-for) | 现有 list rendering、B08 key | 与 key 身份交叉链接 |
| `built-in-directives.v-on` | [`v-on`](https://cn.vuejs.org/api/built-in-directives.html#v-on) | 现有 event handling | 覆盖参数、对象语法、修饰符入口 |
| `built-in-directives.v-bind` | [`v-bind`](https://cn.vuejs.org/api/built-in-directives.html#v-bind) | 现有 template/attrs | 标明 3.2 修饰符与 3.4 同名简写 |
| `built-in-directives.v-model` | [`v-model`](https://cn.vuejs.org/api/built-in-directives.html#v-model) | 现有 form/model | 区分原生控件与组件协议 |
| `built-in-directives.v-slot` | [`v-slot`](https://cn.vuejs.org/api/built-in-directives.html#v-slot) | 现有 slots | 只作语法速查，复用 slot 详解 |
| `built-in-directives.v-pre` | [`v-pre`](https://cn.vuejs.org/api/built-in-directives.html#v-pre) | 同批 v-once | 编译跳过边界 |
| `built-in-directives.v-once` | [`v-once`](https://cn.vuejs.org/api/built-in-directives.html#v-once) | 现有 reactivity | 一次渲染语义 |
| `built-in-directives.v-memo` | [`v-memo`](https://cn.vuejs.org/api/built-in-directives.html#v-memo) | 同批 v-for | 标明 3.2+、少用及列表优化约束 |
| `built-in-directives.v-cloak` | [`v-cloak`](https://cn.vuejs.org/api/built-in-directives.html#v-cloak) | B08 SFC | 说明无构建步骤场景，SFC 通常不需要 |

### B08 模板原语与 SFC 语法（10）

官方分类：内置内容 / 特殊元素、特殊 Attributes；单文件组件 / 语法定义。全部 `merged`。

| Manifest id | 官方来源 | 依赖 / 宿主 | 适配结论 |
| --- | --- | --- | --- |
| `built-in-special-elements.component` | [`<component>`](https://cn.vuejs.org/api/built-in-special-elements.html#component) | B05 components、现有 KeepAlive | 模板原语页；动态组件身份与缓存交叉链接 |
| `built-in-special-elements.template` | [`<template>`](https://cn.vuejs.org/api/built-in-special-elements.html#template) | B07 if/for/slot | 模板原语页；只讲无 DOM 包装语义 |
| `built-in-special-attributes.key` | [`key`](https://cn.vuejs.org/api/built-in-special-attributes.html#key) | B07 v-for、现有 render | 模板原语页；身份、替换与过渡复用 |
| `built-in-special-attributes.is` | [`is`](https://cn.vuejs.org/api/built-in-special-attributes.html#is) | 同批 component | 模板原语页；区分 `<component :is>` 与原生元素场景 |
| `sfc-spec.overview` | [总览](https://cn.vuejs.org/api/sfc-spec.html#overview) | 现有 SFC 内容 | SFC 语法页总锚点 |
| `sfc-spec.language-blocks` | [相应语言块](https://cn.vuejs.org/api/sfc-spec.html#language-blocks) | 同批 overview | 合并 template/script/style/custom block |
| `sfc-spec.automatic-name-inference` | [自动名称推导](https://cn.vuejs.org/api/sfc-spec.html#automatic-name-inference) | B05 name | 对照显式 name 与文件名推导 |
| `sfc-spec.pre-processors` | [预处理器](https://cn.vuejs.org/api/sfc-spec.html#pre-processors) | 构建工具边界 | 只写 `lang` 契约，不引入新预处理器依赖 |
| `sfc-spec.src-imports` | [`src` 导入](https://cn.vuejs.org/api/sfc-spec.html#src-imports) | 同批 language blocks | 说明相对路径和 `<script setup>` 限制 |
| `sfc-spec.comments` | [注释](https://cn.vuejs.org/api/sfc-spec.html#comments) | 同批 language blocks | 合并到语法页，不建 Demo |

### B09 `<script setup>`（12）

官方分类：[单文件组件 / `<script setup>`](https://cn.vuejs.org/api/sfc-script-setup.html)。全部
`merged` 到一个宿主页；宏、运行时 helper 和普通 ESM 必须明确区分。

| Manifest id | 官方来源 | 依赖 / 宿主 | 适配结论 |
| --- | --- | --- | --- |
| `sfc-script-setup.basic-syntax` | [基本语法](https://cn.vuejs.org/api/sfc-script-setup.html#basic-syntax) | B01 setup、B08 SFC | 每实例执行与顶层绑定暴露 |
| `sfc-script-setup.reactivity` | [响应式](https://cn.vuejs.org/api/sfc-script-setup.html#reactivity) | 现有 reactivity | 复用 ref 模板解包，不重复详解 |
| `sfc-script-setup.using-components` | [使用组件](https://cn.vuejs.org/api/sfc-script-setup.html#using-components) | B05 components | 覆盖变量引用、动态和命名空间组件 |
| `sfc-script-setup.using-custom-directives` | [使用自定义指令](https://cn.vuejs.org/api/sfc-script-setup.html#using-custom-directives) | B07、现有 custom directives | 保留 `vName` 命名约定 |
| `sfc-script-setup.define-props-and-emits` | [`defineProps()` / `defineEmits()`](https://cn.vuejs.org/api/sfc-script-setup.html#defineprops-defineemits) | 现有 props/emits | 宏提升、运行时/类型二选一、3.5 响应式解构 |
| `sfc-script-setup.define-options` | [`defineOptions()`](https://cn.vuejs.org/api/sfc-script-setup.html#defineoptions) | B05 misc | 标明 3.3+ 与提升限制 |
| `sfc-script-setup.use-slots-and-use-attrs` | [`useSlots()` / `useAttrs()`](https://cn.vuejs.org/api/sfc-script-setup.html#useslots-useattrs) | B01 setup context、现有 slots/attrs | 明确二者是运行时函数且使用相对少见 |
| `sfc-script-setup.normal-script` | [与普通 `<script>` 一起使用](https://cn.vuejs.org/api/sfc-script-setup.html#usage-alongside-normal-script) | B08 SFC、B05 options | 模块作用域与实例作用域分离 |
| `sfc-script-setup.top-level-await` | [顶层 `await`](https://cn.vuejs.org/api/sfc-script-setup.html#top-level-await) | 现有 Suspense、B12 SSR | 明确编译为 async setup 且依赖实验性 Suspense |
| `sfc-script-setup.import-statements` | [导入语句](https://cn.vuejs.org/api/sfc-script-setup.html#imports-statements) | B08 SFC | 保留官网实际的 `imports-statements` fragment |
| `sfc-script-setup.generics` | [泛型](https://cn.vuejs.org/api/sfc-script-setup.html#generics) | B11 types | TypeScript 专属；不把外部 helper 包列为项目依赖 |
| `sfc-script-setup.restrictions` | [限制](https://cn.vuejs.org/api/sfc-script-setup.html#restrictions) | 同批全部 | 作为页尾边界，不拆页 |

### B10 SFC CSS 与渲染辅助（8）

官方分类：单文件组件 / CSS 功能；进阶 API / 渲染函数。全部 `merged`。

| Manifest id | 官方来源 | 依赖 / 宿主 | 适配结论 |
| --- | --- | --- | --- |
| `sfc-css-features.scoped-css` | [组件作用域 CSS](https://cn.vuejs.org/api/sfc-css-features.html#scoped-css) | B08 SFC | 新建 CSS 合并页；覆盖 deep/slotted/global 与子根边界 |
| `sfc-css-features.css-modules` | [CSS Modules](https://cn.vuejs.org/api/sfc-css-features.html#css-modules) | 同批 scoped CSS | 构建时能力；不新增样式依赖 |
| `sfc-css-features.v-bind-in-css` | [CSS 中的 `v-bind()`](https://cn.vuejs.org/api/sfc-css-features.html#v-bind-in-css) | B09 reactivity | 说明编译为自定义属性与表达式引号 |
| `render-function.merge-props` | [`mergeProps()`](https://cn.vuejs.org/api/render-function.html#mergeprops) | 现有 render-function | 增补现有页；突出 class/style/listener 合并 |
| `render-function.clone-vnode` | [`cloneVNode()`](https://cn.vuejs.org/api/render-function.html#clonevnode) | 现有 h/VNode | 与 isVNode 合并讲，避免复用同一 vnode |
| `render-function.is-vnode` | [`isVNode()`](https://cn.vuejs.org/api/render-function.html#isvnode) | 同批 cloneVNode | 类型守卫式速释 |
| `render-function.resolve-directive` | [`resolveDirective()`](https://cn.vuejs.org/api/render-function.html#resolvedirective) | B07 directives | 写清必须在 setup/render 上下文调用 |
| `render-function.with-directives` | [`withDirectives()`](https://cn.vuejs.org/api/render-function.html#withdirectives) | 同批 resolveDirective | 与指令元组格式同段，不另建 Demo |

### B11 TypeScript 类型与编译标志（12）

官方分类：进阶 API / TypeScript 工具类型、编译时标志。全部 `quick`，分别建立类型和标志
速查页。类型页必须说明官网列表本身不是 Vue 全部导出类型的全集。

| Manifest id | 官方来源 | 依赖 / 宿主 | 适配结论 |
| --- | --- | --- | --- |
| `utility-types.prop-type` | [`PropType<T>`](https://cn.vuejs.org/api/utility-types.html#proptype-t) | B03 props | 运行时 props 复杂类型 |
| `utility-types.maybe-ref` | [`MaybeRef<T>`](https://cn.vuejs.org/api/utility-types.html#mayberef) | 现有 ref | 3.3+；与下一项并列 |
| `utility-types.maybe-ref-or-getter` | [`MaybeRefOrGetter<T>`](https://cn.vuejs.org/api/utility-types.html#maybereforgetter) | 同批 MaybeRef | 3.3+；说明 getter 差异 |
| `utility-types.extract-prop-types` | [`ExtractPropTypes<T>`](https://cn.vuejs.org/api/utility-types.html#extractproptypes) | B03 props | 与 public 版本成对，强调内部已解析类型 |
| `utility-types.extract-public-prop-types` | [`ExtractPublicPropTypes<T>`](https://cn.vuejs.org/api/utility-types.html#extractpublicproptypes) | 同批 ExtractPropTypes | 3.3+；面向父组件输入 |
| `utility-types.component-custom-properties` | [`ComponentCustomProperties`](https://cn.vuejs.org/api/utility-types.html#componentcustomproperties) | B02 globalProperties | 模块增强速查 |
| `utility-types.component-custom-options` | [`ComponentCustomOptions`](https://cn.vuejs.org/api/utility-types.html#componentcustomoptions) | B02 merge strategy、B05 options | 自定义选项类型增强 |
| `utility-types.component-custom-props` | [`ComponentCustomProps`](https://cn.vuejs.org/api/utility-types.html#componentcustomprops) | B03 props | 全局允许属性增强 |
| `utility-types.css-properties` | [`CSSProperties`](https://cn.vuejs.org/api/utility-types.html#cssproperties) | B10 CSS | JSX / style 绑定类型与自定义属性增强 |
| `compile-time-flags.options-api` | [`__VUE_OPTIONS_API__`](https://cn.vuejs.org/api/compile-time-flags.html#VUE_OPTIONS_API) | B03-B06 Options | `esm-bundler` only；默认 true 与兼容性风险 |
| `compile-time-flags.prod-devtools` | [`__VUE_PROD_DEVTOOLS__`](https://cn.vuejs.org/api/compile-time-flags.html#VUE_PROD_DEVTOOLS) | 构建配置 | `esm-bundler` only；默认 false 与体积代价 |
| `compile-time-flags.prod-hydration-mismatch-details` | [`__VUE_PROD_HYDRATION_MISMATCH_DETAILS__`](https://cn.vuejs.org/api/compile-time-flags.html#VUE_PROD_HYDRATION_MISMATCH_DETAILS) | B12 SSR | 3.4+；生产 hydration 诊断与体积代价 |

### B12 平台边界（13）

官方分类：进阶 API / 自定义元素、服务端渲染、自定义渲染。全部 `quick`。这批不应把当前
浏览器 Vite SPA 改造成 SSR、Web Component 或非 DOM renderer 工程；最小代码应以环境边界
为主，必要验证放在独立脚本或静态类型检查中。

| Manifest id | 官方来源 | 依赖 / 宿主 | 适配结论 |
| --- | --- | --- | --- |
| `custom-elements.define-custom-element` | [`defineCustomElement()`](https://cn.vuejs.org/api/custom-elements.html#definecustomelement) | B03 defineComponent、B08 SFC | Custom Elements 速查总入口；记录 3.5 选项 |
| `custom-elements.use-host` | [`useHost()`](https://cn.vuejs.org/api/custom-elements.html#usehost) | 同批 defineCustomElement | 仅当前 Vue 自定义元素宿主上下文 |
| `custom-elements.use-shadow-root` | [`useShadowRoot()`](https://cn.vuejs.org/api/custom-elements.html#useshadowroot) | 同批 defineCustomElement | 与 shadowRoot 配置成对 |
| `custom-elements.host` | [`this.$host`](https://cn.vuejs.org/api/custom-elements.html#this-host) | B03-B06 Options、同批 useHost | Options 入口，与 useHost 对照 |
| `ssr.render-to-string` | [`renderToString()`](https://cn.vuejs.org/api/ssr.html#rendertostring) | B01 createSSRApp | SSR 速查主入口；来自 `vue/server-renderer` |
| `ssr.render-to-node-stream` | [`renderToNodeStream()`](https://cn.vuejs.org/api/ssr.html#rendertonodestream) | 同批 renderToString | Node Readable；记录 ESM 构建限制 |
| `ssr.pipe-to-node-writable` | [`pipeToNodeWritable()`](https://cn.vuejs.org/api/ssr.html#pipetonodewritable) | 同批 node stream | Node Writable 替代路径 |
| `ssr.render-to-web-stream` | [`renderToWebStream()`](https://cn.vuejs.org/api/ssr.html#rendertowebstream) | 同批 renderToString | Web ReadableStream 环境 |
| `ssr.pipe-to-web-writable` | [`pipeToWebWritable()`](https://cn.vuejs.org/api/ssr.html#pipetowebwritable) | 同批 web stream | 与 TransformStream 配合 |
| `ssr.render-to-simple-stream` | [`renderToSimpleStream()`](https://cn.vuejs.org/api/ssr.html#rendertosimplestream) | 同批 streaming | 平台无关 push/destroy 适配接口 |
| `ssr.use-ssr-context` | [`useSSRContext()`](https://cn.vuejs.org/api/ssr.html#usessrcontext) | 同批 render APIs | 仅 SSR 条件分支；上下文由 render API 传入 |
| `ssr.data-allow-mismatch` | [`data-allow-mismatch`](https://cn.vuejs.org/api/ssr.html#data-allow-mismatch) | B11 hydration flag | 3.5 能力；列出 text/children/class/style/attribute，强调不是修复替代品 |
| `custom-renderer.create-renderer` | [`createRenderer()`](https://cn.vuejs.org/api/custom-renderer.html#createrenderer) | B10 render helpers | 非 DOM 平台速查；记录 host operations 与返回 render/createApp |

## 批次 Gate

每批只在以下条件同时满足后，才可把其条目从 `planned` 改为 `available`：

1. 本批逐项表中的每个 id 都有真实 entry target 和唯一 anchor，官方 URL、depth、版本与
   `verifiedAt` 同步更新；不能只写正文后批量改状态。
2. merged/quick 页面包含本批全部锚点；搜索、Reference Overview 和直接路由都能定位。
3. 只复用 Reference 现有页面，不把内容实施扩展到 Vue Router、Pinia 或 `learn` 主线。
4. 纯文本批次不新增 Demo 或 E2E；只有 `useId()` 等需要观察行为的 detail 页考虑一个最小 Demo。
5. 最少验证为 manifest 完整性、type-check、lint、format-check；只抽一个含 Demo 的批次页面做
   可复跑浏览器验证。本文是研究文档，不执行这些实现期命令。
6. 每批完成后重新机器统计 planned 数量，期望依次减少：
   `135 -> 125 -> 116 -> 105 -> 91 -> 83 -> 70 -> 55 -> 45 -> 33 -> 25 -> 13 -> 0`。

## 风险与核验边界

- **官方目录会漂移。** 本文只保证 2026-08-02 的官方快照与本地 `3.5.40`；实施每批前应重新
  用 Tavily 核验该批官方页，不能把本快照当永久事实。
- **官网无统一 patch 标签。** `appliesTo` 绑定本地锁定版本，不代表官网页面自身固定在
  3.5.40；只记录官方明确显示的 3.3+/3.4+/3.5+ 和环境限制。
- **官方索引不是包导出全集。** 特别是 TypeScript 工具类型页明确只列常用且需解释的类型；
  本计划目标是官方 Core Reference 全覆盖，不是扫描 `vue` 包所有 export。
- **同名不等价。** `version/app.version`、Composition/Options 生命周期、`provide/inject`、
  `compilerOptions` 等必须保留各自官方锚点和访问方式，允许共享讲解但不能合并掉索引身份。
- **编译时与运行时不可混淆。** SFC 宏、CSS 功能和 flags 依赖编译器或 `esm-bundler`；不得用
  浏览器运行时 Demo 声称已验证编译期契约。
- **平台环境不可伪造。** SSR stream、Custom Elements、custom renderer 的 quick 深度只要求
  准确契约和最小示例。当前 SPA 中的普通浏览器 smoke 不能替代 Node/Web stream、hydration 或
  非 DOM host 验证。
- **实验性边界仍存在。** `<script setup>` 顶层 await 依赖 `<Suspense>`；内容必须保留官方当前
  的实验性提示，不能把示例写成稳定性承诺。
- **安全边界必须保留。** `v-html` 和运行时字符串 template 不能接受不可信内容；
  `data-allow-mismatch` 只抑制不可避免的指定类型警告，不应掩盖可修复的 hydration 差异。
- **结构膨胀风险。** 135 个索引项不能变成 135 篇文章或 135 个 Demo；宿主页超过仓库约定的
  约 1000 行时应按官方主题拆页，但每个索引项仍须有唯一 target/anchor。

## 停止边界

本文只提供 Vue 3 Core Reference 剩余 135 项的调研、依赖和批次建议。它不授权修改 manifest、
新增内容 entry/demo、更新课程主线、启动 Vue Router/Pinia 工作、构建打包、打开页面或提交代码。
