---
id: vue.router.reference.tooling.unplugin
type: reference
title: Vite 与 Unplugin 构建入口
summary: 区分 Vite 专用插件、通用 unplugin、适配器发布物与应用运行时入口
domain: frontend
technology: vue
module: router
related:
  - vue.router.reference.file-based.overview
  - vue.router.reference.file-based.virtual-modules
  - vue.router.reference.tooling.volar-migration
  - vue.router.learn.advanced.typed-file-based-routing
tags:
  - Vue Router
  - Vite
  - unplugin
  - 构建插件
  - package exports
appliesTo: Vue Router 5.2.0
verifiedAt: 2026-08-04
sources:
  - title: Vue Router 文件路由：Getting Started
    url: https://router.vuejs.org/file-based-routing
  - title: Vue Router 文件路由：Configuration
    url: https://router.vuejs.org/file-based-routing/configuration
  - title: Vue Router 5 迁移指南
    url: https://router.vuejs.org/guide/migration/v4-to-v5
  - title: Vue Router 5.2.0 package exports
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/package.json
  - title: Vue Router 5.2.0 unplugin 入口源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/unplugin/index.ts
  - title: Vue Router 5.2.0 Vite 适配器源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/unplugin/vite.ts
  - title: Vue Router 5.2.0 构建上下文源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/unplugin/core/context.ts
  - title: Vue Router v5.2.0 release
    url: https://github.com/vuejs/router/releases/tag/v5.2.0
group: tooling
signature: |-
  import VueRouter from 'vue-router/vite'
  import VueRouterUnplugin from 'vue-router/unplugin'
anchors:
  - 概述
  - Vite 插件入口
  - 通用 Unplugin 入口
  - 适配器与发布物边界
  - Package Exports
  - 易错使用提示
  - 源码推导与适用场景
---

# Vite 与 Unplugin 构建入口

## 一、概述

`vue-router/vite` 与 `vue-router/unplugin` 都运行在构建工具进程，不是浏览器运行时 API。它们扫描页面、生成 routes/声明、提供虚拟模块，并把确定的构建输入交给应用；`createRouter()`、`RouterLink` 等运行时 API仍从根入口 `vue-router` 导入。

:::warning
本页记录 5.2.0 已发布入口，不修改本站 Vite 配置，也不把 experimental flag 或低层 context helper 推荐为普通应用配置。
:::

## 二、Vite 插件入口

`vue-router/vite` 默认导出接收文件路由 Options 的 Vite plugin factory。官方要求它位于 `@vitejs/plugin-vue` 之前，使页面扫描、`definePage()` 转换和虚拟模块准备先于 Vue SFC 编译。

~~~~ts
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import VueRouter from 'vue-router/vite'

export default defineConfig({
  plugins: [
    VueRouter({
      routesFolder: 'src/pages',
      dts: 'src/route-map.d.ts',
    }),
    Vue(),
  ],
})
~~~~

| 职责 | 发生阶段 | 可观察结果 |
| --- | --- | --- |
| 扫描 pages | buildStart / dev watcher | 构建期 route tree |
| 生成 routes | 虚拟模块 load | `vue-router/auto-routes` 的模块内容 |
| 生成声明 | 扫描后或 tree 变化后 | 被 tsconfig 纳入的 route map d.ts |
| 转换页面宏 | SFC 进入 Vue 插件前 | 静态 route metadata |

## 三、通用 Unplugin 入口

`vue-router/unplugin` 默认导出 `UnpluginInstance`，供 Webpack、Rollup、esbuild 等适配器消费；同一入口还导出 Options、EditableTreeNode、命名 helper 与 `VueRouterAutoImports`。普通 Vite 项目使用更直接的 `vue-router/vite`，只有非 Vite 或自定义构建集成才需要通用入口。

~~~~ts
import VueRouter from 'vue-router/unplugin'

export default {
  plugins: [
    VueRouter.webpack({
      routesFolder: 'src/pages',
      dts: 'src/route-map.d.ts',
    }),
  ],
}
~~~~

:::tip
上例表达通用入口的 adapter 属性，不意味着所有 bundler 配置格式相同。插件 options 可以共用，bundler 的 plugin 容器与执行生命周期仍由各自工具决定。
:::

## 四、适配器与发布物边界

5.2.0 同时发布 Vite、Webpack、Rollup、Rolldown、esbuild 的 ESM/CJS 适配器文件，但 package export 的 `./unplugin/*` 是原样映射。固定发布物中，`vue-router/unplugin/webpack`、`rollup`、`esbuild` 的无扩展名子路径不能由 Node 直接解析，而带 `.mjs` 的文件存在。稳定教学写法因此使用精确 `vue-router/unplugin`，不把 wildcard 的具体解析行为当跨工具承诺。

| 导入意图 | 5.2.0 推荐入口 | 边界 |
| --- | --- | --- |
| Vite 项目 | vue-router/vite | 专用 factory，放在 Vue 插件之前 |
| 其他 bundler | vue-router/unplugin | 从 UnpluginInstance 选择 adapter |
| 直接发布物排障 | vue-router/unplugin/*.mjs 或 *.cjs | 低层且依赖确切文件名 |
| 内部构建文件 | vue-router/dist/* | 逃生口，不保证统一格式或稳定文件名 |

## 五、Package Exports

下表只登记本页负责的四个 package export key。它们不增加稳定根入口 118 项的分母；export map 能解析某个子路径，也不代表其中每个 helper 都适合应用层直接使用。

| export key | 5.2.0 形态 | 使用结论 |
| --- | --- | --- |
| ./vite | types + ESM + CJS | Vite 文件路由插件精确入口 |
| ./unplugin | types + ESM + CJS | 通用 UnpluginInstance 精确入口 |
| ./unplugin/* | 原样映射 dist/unplugin/* | 存在扩展名解析陷阱，不作首选 |
| ./dist/* | 原样映射 dist/* | 低层发布物逃生口，不作稳定 API |

## 六、易错使用提示

:::pitfalls
### 把 VueRouter 插件放在 Vue 插件之后

**触发条件：** 把 VueRouter 插件放在 Vue 插件之后

**原因：** 文件路由插件需要先扫描和转换页面，官方配置明确把 `VueRouter()` 放在 `Vue()` 之前。

**后果：** 页面宏、虚拟模块或生成类型可能在错误阶段被处理，行为与官方链路不一致。

**错误示例：**

~~~~ts
plugins: [Vue(), VueRouter()]
~~~~

**正确写法：**

~~~~ts
plugins: [VueRouter(), Vue()]
~~~~

**验证方式：** 对照正确写法验证结果。

### 在浏览器代码中导入构建插件

**触发条件：** 在浏览器代码中导入构建插件

**原因：** `vue-router/vite` 依赖构建工具环境，不是组件或 router 实例的运行时依赖。

**后果：** 客户端 bundle 引入 Node/build-only 依赖，或在运行时得到不可用的 plugin factory。

**错误示例：**

~~~~ts
// src/router.ts
import VueRouter from 'vue-router/vite'
~~~~

**正确写法：**

~~~~ts
// vite.config.ts
import VueRouter from 'vue-router/vite'
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 wildcard 无扩展名子路径当成已验证入口

**触发条件：** 把 wildcard 无扩展名子路径当成已验证入口

**原因：** 5.2.0 的 `./unplugin/*` 原样映射发布文件；本地发布物只存在带 `.mjs`/`.cjs` 的 adapter。

**后果：** 示例在 Node 解析时出现 MODULE_NOT_FOUND，并把发布物差异误判为配置错误。

**错误示例：**

~~~~ts
import VueRouter from 'vue-router/unplugin/webpack'
~~~~

**正确写法：**

~~~~ts
import VueRouter from 'vue-router/unplugin'

const plugin = VueRouter.webpack()
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 alias 或 mock 伪造虚拟模块

**触发条件：** 用 alias 或 mock 伪造虚拟模块

**原因：** 真正的 unplugin 在 resolve/load seam 生成 routes 和 resolver；类型 stub 不是运行时模块。

**后果：** 测试可能通过，但生产构建没有扫描页面，也不会同步生成 route map。

**错误示例：**

~~~~ts
resolve: { alias: { 'vue-router/auto-routes': './fake-routes.ts' } }
~~~~

**正确写法：**

~~~~ts
plugins: [VueRouter({ dts: 'src/route-map.d.ts' }), Vue()]
~~~~

**验证方式：** 对照正确写法验证结果。

### 生成 d.ts 后不让 tsconfig 读取

**触发条件：** 生成 d.ts 后不让 tsconfig 读取

**原因：** 生成文件只有进入 TypeScript program，TypesConfig 的 module augmentation 才会生效。

**后果：** 运行时 routes 存在，但 route name 和 params 仍退回 generic 类型。

**错误示例：**

~~~~json
{ "include": ["src/**/*.ts", "src/**/*.vue"] }
~~~~

**正确写法：**

~~~~json
{ "include": ["src/**/*.ts", "src/**/*.vue", "src/route-map.d.ts"] }
~~~~

**验证方式：** 对照正确写法验证结果。

### 直接编辑 dist 适配器解决配置问题

**触发条件：** 直接编辑 dist 适配器解决配置问题

**原因：** `./dist/*` 是低层发布物入口，node_modules 中的修改不会成为项目配置或源码。

**后果：** 重装依赖后修改消失，并把本应在 options/上游解决的问题变成不可复现补丁。

**错误示例：**

~~~~text
修改 node_modules/vue-router/dist/unplugin/vite.mjs
~~~~

**正确写法：**

~~~~text
在 vite.config.ts 配置公开 Options，并用固定版本复现上游问题
~~~~

**验证方式：** 对照正确写法验证结果。

### 把运行时 addRoute() 当成 codegen 输入

**触发条件：** 把运行时 addRoute() 当成 codegen 输入

**原因：** unplugin 读取文件树和构建期 hooks；浏览器运行后的 matcher 变化不会回写 d.ts。

**后果：** 动态路由可以匹配，但编译期 route map 不会自动出现新 name 或 params。

**错误示例：**

~~~~ts
router.addRoute(dynamicRecord)
// 期待 route-map.d.ts 自动变化
~~~~

**正确写法：**

~~~~ts
VueRouter({
  extendRoute(route) {
    // 根据确定的构建输入调整 editable tree
  },
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 无意启用 experimental 构建选项

**触发条件：** 无意启用 experimental 构建选项

**原因：** 通用入口含实验性 loader auto-export 能力；export 存在不等于稳定应用配置的一部分。

**后果：** 项目依赖可能在 patch/minor 中变化的实验协议，升级边界不清晰。

**错误示例：**

~~~~ts
VueRouter({ experimental: { autoExportsDataLoaders: true } })
~~~~

**正确写法：**

~~~~ts
VueRouter({
  routesFolder: 'src/pages',
  dts: 'src/route-map.d.ts',
})
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 七、源码推导与适用场景

:::steps
### 1. 精确入口优先于发布物猜测

固定 package.json 为 `./vite` 与 `./unplugin` 同时声明 types、import、require，而 wildcard 只做原样映射。应用配置优先使用精确入口，只有定位打包问题时才检查具体发布文件。

### 2. Vite factory 只是通用 unplugin 的适配层

固定 vite 声明只导出 `(options?) =&gt; Plugin | Plugin[]`；通用入口才公开 UnpluginInstance、Options 和 tree helpers。Vite 用户不需要为获得普通文件路由而下沉到 context API。

### 3. 扫描、虚拟模块和声明共享同一构建树

固定 context 先 scanPages，再由 generateRoutes/generateResolver 提供虚拟模块，并由 writeConfigFiles 写声明。适合把 pages 与 build-time hooks 当单一来源，不适合在运行时另建一套类型生成协议。

### 4. 插件顺序是阶段契约

官方 Setup 把 VueRouter 放在 Vue 之前，是为了让 route block/definePage 与模块生成在 Vue SFC 消费前完成。它不是视觉偏好，迁移时应逐项保留。

### 5. 适配器共享 options，不共享宿主配置语法

UnpluginInstance 可生成 vite/webpack/rollup/esbuild adapters，但每个宿主仍决定插件容器和 lifecycle。跨 bundler 封装应共享最小 Options，而不是复制一份假想的通用 config。

### 6. Experimental 仍在独立观察边界

固定 unplugin 声明公开实验性 AutoExportLoaders，RA5 只记录其存在，不把它纳入稳定 118 项或普通文件路由推荐；需要它时应单独评估版本与删除风险。
:::
