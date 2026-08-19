---
id: engineering.vite.reference.build-rollup-boundary
type: reference
title: Vite、Rolldown、Rollup 与 Vue Plugin 边界
summary: 说明 Vite 8 构建器、兼容插件合同、Vue SFC 编译和 Node 基线之间的责任边界。
domain: frontend
technology: engineering
module: vite
group: features-and-boundaries
signature: |-
  Vite orchestration -> Rolldown build -> framework plugins -> browser/server output
related:
  - engineering.vite.learn.advanced.rollup-rolldown-and-manual-chunks
  - engineering.vite.learn.advanced.security-and-migration
tags:
  - Vite
  - Rolldown
  - Rollup
  - plugin-vue
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
sources:
  - title: Rolldown Plugin Compatibility
    url: https://vite.dev/guide/api-plugin#rolldown-plugin-compatibility
    sourceType: official-reference
    appliesTo: Vite 8.2.1
  - title: Vite Getting Started
    url: https://vite.dev/guide/
    sourceType: official-reference
    appliesTo: Vite 8.2.1
  - title: vite-plugin-vue
    url: https://github.com/vitejs/vite-plugin-vue
    sourceType: source-code
anchors:
  - rollup-compatibility
  - rolldown-plugin-compatibility
  - vitejsplugin-vue
  - nodejs-baseline
---

# Vite、Rolldown、Rollup 与 Vue Plugin 边界

## 一、Rollup compatibility

Vite 8 的构建主路径已迁移到 Rolldown，并保留大量 Rollup plugin interface 兼容性。兼容不代表每个 hook、输出
细节或第三方插件都完全相同；旧 `build.rollupOptions` 已 deprecated。

**最小示例：**

~~~~ts
export default { build: { rolldownOptions: { external: ["vue"] } } }
~~~~

## 二、Rolldown plugin compatibility

通用钩子使用 Rolldown 合同，部分行为和性能能力属于 Rolldown。需要底层选项时使用稳定
`build.rolldownOptions`，并对真实产物做回归。

**最小示例：**

~~~~ts
const plugin = {
  name: "course:transform",
  transform(code, id) {
    return id.endsWith(".course.ts") ? { code, map: null } : null
  },
}
~~~~

## 三、@vitejs/plugin-vue

Vue SFC 的 template、script、style 与 HMR 由官方 Vue plugin 编译。Vite 核心负责插件编排与模块服务，不应把
SFC 编译事实归因给核心。

**最小示例：**

~~~~ts
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
export default defineConfig({ plugins: [vue()] })
~~~~

## 四、Node.js baseline

Vite 8 要求 Node `^20.19.0 || >=22.12.0`。在 `package.json` 中声明该范围，并让开发、CI 与部署流程使用
同一条 Node 版本合同。

**最小示例：**

~~~~json
{
  "engines": { "node": "^20.19.0 || >=22.12.0" }
}
~~~~

## 五、迁移判断

升级时先确定 Vite、框架插件和 Node 版本，再依次验证配置、插件、开发服务器、HMR、构建、预览和 SSR。任何
兼容层 warning 都应定位到配置或插件来源，不能仅通过抬高 warning 阈值隐藏。

**最小示例：**

~~~~sh
npm install -D vite@8.2.1 @vitejs/plugin-vue@6.0.8
npm run dev
npm run build
~~~~

## 六、组合使用示例

下面的示例把本页最常用的接口组合成一条完整使用路径。

~~~~ts
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
export default defineConfig({
  plugins: [vue()],
  build: { rolldownOptions: { external: ['vue'] } },
})
~~~~

## 七、易错使用提示

:::pitfalls
### 错误：把 Rollup 配置原样当作 Vite 8 的稳定构建接口

**触发条件：** 升级到 Vite 8 后继续新增 `build.rollupOptions`，并假定所有 Rollup 插件都能无差别运行。

**原因：** Vite 8 的主构建器是 Rolldown；Rollup 兼容层和插件兼容范围不等于完整 Rollup 公共合同。

**后果：** 配置可能进入弃用路径，插件钩子、产物或 source map 行为与预期不一致。

**错误示例：**

```ts
export default { build: { rollupOptions: { output: {} } } }
```

**正确写法：**

```ts
export default { build: { rolldownOptions: { output: {} } } }
```

**验证方式：** 固定 Vite、Rolldown 和插件版本，运行真实 build，并检查 hook 日志、chunk 与 source map。
:::

## 八、工作原理与适用边界

1. 官方事实：Vite 8 使用 Rolldown 作为主构建器，并为 Rollup 插件提供明确的兼容边界。
2. 课程推导：迁移判断应以当前 Vite 配置和真实产物为准，不能只按旧配置字段是否仍被接受下结论。
3. 适用边界：本页用于选择构建器、插件和 Node 基线；框架插件的私有选项仍回到对应插件文档核验。

## 九、参考资料

- [Vite Plugin API](https://vite.dev/guide/api-plugin) - 支持 Rolldown、Rollup 插件兼容与 Vite 插件边界。
- [Vite Getting Started](https://vite.dev/guide/) - 支持当前 Vite 与 Node 运行基线。
