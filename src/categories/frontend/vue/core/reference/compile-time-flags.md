---
id: vue.core.reference.advanced.compile-time-flags
type: reference
title: Vue 编译时标志速查
summary: 在 esm-bundler 构建中静态配置 Options API、生产 Devtools 与生产 hydration 详细诊断，并保留版本、体积和平台边界
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.application.application-configuration
  - vue.core.reference.options-api.state-options
  - vue.core.learn.advanced.ssr-hydration
tags:
  - compile-time flags
  - esm-bundler
  - __VUE_OPTIONS_API__
  - __VUE_PROD_DEVTOOLS__
  - __VUE_PROD_HYDRATION_MISMATCH_DETAILS__
  - tree-shaking
appliesTo: Vue 3.5.40
verifiedAt: 2026-08-03
sources:
  - title: Vue 编译时标志 API
    url: https://cn.vuejs.org/api/compile-time-flags.html
  - title: Vue 3.5.40 构建格式与 feature flag 替换
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/rollup.config.js
  - title: Vue 3.5.40 feature flag 初始化
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/featureFlags.ts
  - title: Vue 3.5.40 renderer 标志入口
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/renderer.ts
  - title: Vue 3.5.40 Options API 分支
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/component.ts
  - title: Vue 3.5.40 hydration mismatch 分支
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/hydration.ts
  - title: Vue 3.5.40 Options flag 官方测试
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/apiSetupHelpers.spec.ts
  - title: Vue 3.5.40 hydration 官方测试
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/hydration.spec.ts
group: advanced
signature: |-
  declare const __VUE_OPTIONS_API__: boolean
  declare const __VUE_PROD_DEVTOOLS__: boolean
  declare const __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: boolean
anchors:
  - 编译时标志是什么
  - __VUE_OPTIONS_API__
  - __VUE_PROD_DEVTOOLS__
  - __VUE_PROD_HYDRATION_MISMATCH_DETAILS__
  - 构建配置边界
  - 易错使用提示
  - 源码推导与适用场景
---

# Vue 编译时标志速查

## 编译时标志是什么

Vue 的三个公开编译时标志不是运行时 API，而是 `esm-bundler` 构建留给 bundler 静态替换的全局布尔标识。构建工具把它们替换成字面量后，压缩器才能通过 tree-shaking 删除不可达分支。Vue 在未显式配置时仍会回退到默认值，但生产构建应使用明确的静态配置。

| 标志 | 默认值 | 版本 | 控制范围 |
| --- | --- | --- | --- |
| `__VUE_OPTIONS_API__` | `true` | Vue 3 | Options API 支持 |
| `__VUE_PROD_DEVTOOLS__` | `false` | Vue 3 | 生产 Devtools 支持 |
| `__VUE_PROD_HYDRATION_MISMATCH_DETAILS__` | `false` | 3.4+ | 生产 hydration 详细警告 |

:::tip
`@vitejs/plugin-vue` 会提供默认值。即使默认行为符合预期，也要区分“插件提供默认替换”和“应用运行后修改变量”：只有前者发生在构建期，能够参与 tree-shaking。
:::

## &#95;&#95;VUE&#95;OPTIONS&#95;API&#95;&#95;

`__VUE_OPTIONS_API__` 默认是 `true`。设为 `false` 会裁剪 `applyOptions()`、应用级 mixin 和部分选项合并路径，从而减少纯 Composition API 构建的体积。它是整个 Vue runtime 的构建级选择，不是单个组件开关；本地组件、插件和第三方依赖只要仍使用 Options API，就必须保持启用。

:::warning
只检查应用源码是否使用 `<script setup>` 不足以关闭 Options API。发布前还要审计组件库、插件、mixin、extends 和运行时 template 等依赖路径，并用同一生产产物回归。
:::

## &#95;&#95;VUE&#95;PROD&#95;DEVTOOLS&#95;&#95;

`__VUE_PROD_DEVTOOLS__` 默认是 `false`。设为 `true` 会让生产构建保留 Devtools hook、组件生命周期事件和额外调试元数据，因此会增加体积。它只开启生产 Devtools 支持，不会把生产构建变成开发模式，也不会恢复所有 `__DEV__` 警告，更不能替代错误监控和性能遥测。

## &#95;&#95;VUE&#95;PROD&#95;HYDRATION&#95;MISMATCH&#95;DETAILS&#95;&#95;

`__VUE_PROD_HYDRATION_MISMATCH_DETAILS__` 自 Vue 3.4 起可用，默认是 `false`。设为 `true` 会在生产客户端 hydration 中保留更详细的节点、文本、class、style 与 attribute mismatch 检查和警告，同时增加产物体积。它不启用 SSR、不改变服务端输出，也不会修复差异。

:::warning
关闭该标志不代表 mismatch 消失：Vue 仍可能输出概括性的生产错误并继续 DOM 调和。3.5 的 `data-allow-mismatch` 是对特定不可避免差异的声明式容忍，也不是这个诊断标志的别名。
:::

## 构建配置边界

三个标志只对 `vue(.runtime).esm-bundler.js` 生效。Vue 固定构建配置在 bundler ESM 输出中保留外部 `__VUE_*` 标识，在 global、esm-browser 和 CJS 等其他输出中直接硬编码 `true / false / false`。配置前要先确认实际解析的 Vue distribution，不能把同一段 bundler 配置套到 CDN 或外置 CJS Vue。

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    __VUE_OPTIONS_API__: 'true',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
  },
})
~~~~

| Vue distribution | 公开标志是否生效 | 配置结论 |
| --- | --- | --- |
| `vue(.runtime).esm-bundler.js` | 是 | 由 Vite、webpack 或 Rollup 静态替换 |
| `vue(.runtime).esm-browser.js` | 否 | Vue 构建时已硬编码默认分支 |
| `vue(.runtime).global.js` | 否 | 不能通过页面运行时全局赋值覆盖 |
| `vue.cjs(.prod).js` | 否 | 外置到 Node 时使用预构建默认分支 |

## 易错使用提示

:::pitfalls
### 把编译时标志当成运行时环境变量

**触发条件：** 把编译时标志当成运行时环境变量

**原因：** Vue 内部需要在打包阶段看到布尔字面量，运行后再给 window 赋值不会回头裁剪已经生成的代码。

**后果：** tree-shaking 不生效，应用还可能因为未定义标识符或错误的全局类型声明而启动失败。

**错误示例：**

~~~~ts
// 应用已经加载后才赋值，无法改变 Vue 的构建分支。
window.__VUE_OPTIONS_API__ = false
~~~~

**正确写法：**

~~~~ts
export default defineConfig({
  define: {
    __VUE_OPTIONS_API__: 'false',
  },
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 在非 esm-bundler 构建上承诺标志有效

**触发条件：** 在非 esm-bundler 构建上承诺标志有效

**原因：** CDN global、原生 esm-browser 和 CJS 输出已经在 Vue 自身构建时写入固定分支。

**后果：** 配置文件看似包含标志，最终 Vue 运行行为与体积却完全没有变化。

**错误示例：**

~~~~html
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script>
  window.__VUE_PROD_DEVTOOLS__ = true
</script>
~~~~

**正确写法：**

~~~~ts
// 让包管理器中的 vue 解析到 esm-bundler，再由 Vite 静态替换。
import { createApp } from 'vue'
~~~~

**验证方式：** 对照正确写法验证结果。

### 未审计依赖就关闭 Options API

**触发条件：** 未审计依赖就关闭 Options API

**原因：** Options flag 会影响整个 runtime，第三方组件、插件、mixin 和 extends 也共享这个选择。

**后果：** Composition API 页面可能正常，依赖 Options API 的边缘路径却只在生产产物中失效。

**错误示例：**

~~~~ts
// 只因为当前页面使用 script setup 就关闭整个 runtime 的 Options API。
__VUE_OPTIONS_API__: 'false'
~~~~

**正确写法：**

~~~~ts
// 依赖审计与生产回归完成前保持兼容默认值。
__VUE_OPTIONS_API__: 'true'
~~~~

**验证方式：** 对照正确写法验证结果。

### 长期启用生产 Devtools 代替可观测性

**触发条件：** 长期启用生产 Devtools 代替可观测性

**原因：** Devtools flag 只保留浏览器调试 hook 和组件元数据，不负责业务错误采集、告警或留存。

**后果：** 生产包持续增大，但线上问题仍缺少可查询、可聚合的诊断证据。

**错误示例：**

~~~~ts
// 永久在线构建
__VUE_PROD_DEVTOOLS__: 'true'
~~~~

**正确写法：**

~~~~ts
// 常规生产构建保持关闭；诊断使用限时、受控的专用构建。
__VUE_PROD_DEVTOOLS__: 'false'
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 hydration 详细标志当成修复开关

**触发条件：** 把 hydration 详细标志当成修复开关

**原因：** 该标志保留更多 mismatch 检查和文本，只改变诊断详细程度，不让两端初始输出自动一致。

**后果：** 服务端与客户端差异继续存在，DOM 仍需调和，同时生产包因为额外诊断代码而增大。

**错误示例：**

~~~~ts
// 开启详细日志后就忽略实际 mismatch。
__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true'
~~~~

**正确写法：**

~~~~ts
// 修复两端初始输出；临时诊断结束后恢复默认值。
__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 源码推导与适用场景

:::steps
### 构建格式决定标志入口

Vue 3.5.40 的 `rollup.config.js` 只为 bundler ESM 输出保留三个外部 `__VUE_*` 标志，其他输出分别硬编码 `true / false / false`。因此第一步是确认 Vue distribution，而不是先抄配置。

### 未配置回退不等于完成优化

`renderer.ts` 仅在 `__ESM_BUNDLER__` 创建 renderer 时初始化标志；`featureFlags.ts` 会在缺少静态替换时写入默认值并在开发期警告。这个回退保证可运行，但不能替代可被压缩器识别的构建期字面量。

### Options flag 是共享 runtime 选择

`component.ts` 用该标志包围 `applyOptions()`，props、emits 和应用 mixin 路径也会读取同一 feature flag。它只适合完成全依赖审计后的纯 Composition 构建。

### 生产 Devtools 影响多个调试分支

renderer、component、emits、KeepAlive 与 profiling 都会按 prod devtools flag 保留 hook 或元数据。它适合短期诊断产物，体积成本并不局限于一个入口函数。

### hydration 标志只增加诊断细节

`hydration.ts` 用该标志包围详细 warn 和部分 prop mismatch 检查，但 DOM 调和与概括性的生产 mismatch 错误独立存在。它适合定位已有 SSR 页面的问题，不是正确性开关。

### SSR 边界留在客户端 hydration

hydration 详细标志作用于客户端 renderer，不改变 server-renderer 输出、stream API 或请求状态隔离。当前 SPA 的普通浏览器 smoke 不能证明该标志有效，完整平台语义应在后续 SSR 速查中验证。
:::
