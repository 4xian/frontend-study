---
id: vue.router.reference.tooling.volar-migration
type: reference
title: Volar 与 Vue Router 5 迁移
summary: 配置 SFC 路由语言插件，并从旧 unplugin-vue-router 与 auto 兼容入口迁移
domain: frontend
technology: vue
module: router
related:
  - vue.router.reference.tooling.unplugin
  - vue.router.reference.file-based.overview
  - vue.router.reference.file-based.virtual-modules
  - vue.router.reference.typed-routes.route-map
tags:
  - Vue Router
  - Volar
  - TypeScript
  - migration
  - deprecated auto
appliesTo: Vue Router 5.2.0
verifiedAt: 2026-08-04
sources:
  - title: Vue Router 文件路由：Volar Plugins
    url: https://router.vuejs.org/file-based-routing#volar-plugins
  - title: Vue Router 5 迁移指南
    url: https://router.vuejs.org/guide/migration/v4-to-v5
  - title: Vue Router 文件路由：Extending Routes
    url: https://router.vuejs.org/file-based-routing/extending-routes
  - title: Vue Router 5.2.0 package exports
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/package.json
  - title: Vue Router 5.2.0 SFC route blocks 插件源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/volar/entries/sfc-route-blocks.ts
  - title: Vue Router 5.2.0 SFC typed router 插件源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/volar/entries/sfc-typed-router.ts
  - title: Vue Router 5.2.0 auto 兼容声明
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/vue-router-auto.d.ts
  - title: Vue Router v5.2.0 release
    url: https://github.com/vuejs/router/releases/tag/v5.2.0
group: tooling
signature: |-
  vueCompilerOptions.plugins = [
    'vue-router/volar/sfc-route-blocks',
    'vue-router/volar/sfc-typed-router',
  ]
anchors:
  - 概述
  - Volar 插件职责
  - 迁移到 Vue Router 5
  - Deprecated Auto 入口
  - Package Exports
  - 易错使用提示
  - 源码推导与适用场景
---

# Volar 与 Vue Router 5 迁移

## 一、概述

Vue Router 5 把原 `unplugin-vue-router` 的文件路由能力并入 `vue-router`。构建插件负责扫描和生成，两个 Volar 入口负责编辑器/SFC 语言服务；它们协作但不能互相替代。迁移应同时更新依赖、构建入口、虚拟模块、生成声明位置与 Volar plugin 路径。

:::warning
`vue-router/auto` 的 5.2.0 声明首行已标记 DEPRECATED。它只是迁移兼容入口，不应作为新项目的 runtime 或类型主入口。
:::

## 二、Volar 插件职责

| 插件 | 输入 | 语言服务结果 | 不会负责 |
| --- | --- | --- | --- |
| vue-router/volar/sfc-route-blocks | SFC `&lt;route&gt;` custom block | 让 Vue language core 识别页面路由块 | 扫描 pages 或创建 runtime routes |
| vue-router/volar/sfc-typed-router | 当前 SFC 文件路径与生成的 _RouteFileInfoMap | 为页面中的 useRoute() 注入对应 route name 泛型 | 生成 RouteNamedMap 或 d.ts |

~~~~json
{
  "compilerOptions": {
    "rootDir": "."
  },
  "vueCompilerOptions": {
    "plugins": [
      "vue-router/volar/sfc-route-blocks",
      "vue-router/volar/sfc-typed-router"
    ]
  }
}
~~~~

`sfc-typed-router` 根据文件路径查询 `vue-router/auto-routes` 中生成的 `_RouteNamesForFilePath`，再把泛型补到该页面的 `useRoute()`。因此 rootDir、实际文件路径和生成声明必须属于同一 TypeScript project；仅安装 Volar 插件不会产生这些映射。

## 三、迁移到 Vue Router 5

:::steps
### 1. 合并依赖所有权

移除 `unplugin-vue-router`，升级到 `vue-router@5`。避免两个包同时扫描同一 pages 目录。

### 2. 更新构建入口

Vite 从 `unplugin-vue-router/vite` 改为 `vue-router/vite`；其他 bundler 和 tree helpers 改为 `vue-router/unplugin`。

### 3. 更新虚拟模块

运行时 API 继续从 `vue-router` 导入，生成 routes 从 `vue-router/auto-routes` 导入，不再从兼容 `vue-router/auto` 聚合。

### 4. 更新生成声明

把 dts 放进项目 include 可见范围，例如 `src/route-map.d.ts`；移除旧 client types reference，重新生成后重启 TypeScript server。

### 5. 更新 Volar 路径

把 `unplugin-vue-router/volar/*` 替换为两个 `vue-router/volar/*` 精确入口，并确认 rootDir 与 pages 相对路径一致。
:::

:::compare
### 错误写法

~~~~text
import VueRouter from 'unplugin-vue-router/vite'
import { routes } from 'vue-router/auto'
~~~~

### 正确写法

~~~~text
import VueRouter from 'vue-router/vite'
import { routes } from 'vue-router/auto-routes'
~~~~
:::

## 四、Deprecated Auto 入口

`./auto` 的运行时条件仍指向根 Router 构建，但其独立声明明确写着“DEPRECATED: will be removed in future versions”。这会让旧导入暂时可工作，却模糊稳定根 API 与 plugin virtual module 的阶段边界。新代码应把公共 API、routes、resolver 分别放回 `vue-router`、`vue-router/auto-routes`、`vue-router/auto-resolver`。

| 需求 | 使用入口 | 不要继续使用 |
| --- | --- | --- |
| createRouter / RouterLink / 类型 | vue-router | vue-router/auto |
| 插件生成的 routes | vue-router/auto-routes | 手写 alias 或 auto 聚合入口 |
| 插件生成的 resolver | vue-router/auto-resolver | 把 resolver 当稳定 runtime 根 API |
| Vite 构建插件 | vue-router/vite | unplugin-vue-router/vite |

## 五、Package Exports

本页登记迁移、编辑器和稳定性边界相关的 package export key。Experimental 两个入口只作为边界台账出现，不计入稳定 118 项，也不在 RA5 展开其 86 项 surface。

| export key | 5.2.0 形态 | RA5 结论 |
| --- | --- | --- |
| . | 稳定根 types + runtime | 118 项稳定分母的唯一根入口 |
| ./vetur/* | Vetur metadata wildcard | 旧编辑器元数据，不是应用 runtime API |
| ./package.json | 包元数据文件 | 工具诊断可读取，业务代码不应依赖内部路径 |
| ./experimental | types + ESM | 独立观察项，不计入稳定完成度 |
| ./experimental/pinia-colada | types + ESM | 实验 Data Loader surface，不在 RA5 展开 |
| ./auto | 兼容 types + 根 runtime 条件 | deprecated，迁移到精确入口 |
| ./volar/sfc-route-blocks | types + CJS | SFC route block language plugin |
| ./volar/sfc-typed-router | types + CJS | 按页面文件推导 useRoute 类型的 language plugin |

## 六、易错使用提示

:::pitfalls
### 只升级依赖，不更新旧 import path

**触发条件：** 只升级依赖，不更新旧 import path

**原因：** Vue Router 5 合并了旧 unplugin，但不会把源代码中的旧包名自动重写为新入口。

**后果：** 项目仍依赖已移除包，或同时加载新旧两个扫描插件。

**错误示例：**

~~~~ts
import VueRouter from 'unplugin-vue-router/vite'
~~~~

**正确写法：**

~~~~ts
import VueRouter from 'vue-router/vite'
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 Volar 插件放进 compilerOptions.plugins

**触发条件：** 把 Volar 插件放进 compilerOptions.plugins

**原因：** 这两个入口是 Vue language plugins，应配置在 `vueCompilerOptions.plugins`。

**后果：** TypeScript/Vue language server 不加载插件，SFC 中的 route block 和 useRoute 无增强。

**错误示例：**

~~~~json
{ "compilerOptions": { "plugins": ["vue-router/volar/sfc-typed-router"] } }
~~~~

**正确写法：**

~~~~json
{ "vueCompilerOptions": { "plugins": ["vue-router/volar/sfc-typed-router"] } }
~~~~

**验证方式：** 对照正确写法验证结果。

### 同时保留新旧 Volar 插件

**触发条件：** 同时保留新旧 Volar 插件

**原因：** 迁移指南要求把旧 `unplugin-vue-router/volar/*` 替换为新 package subpath。

**后果：** 同一 SFC 被重复增强，诊断来源与升级责任不清晰。

**错误示例：**

~~~~json
{
  "plugins": [
    "unplugin-vue-router/volar/sfc-typed-router",
    "vue-router/volar/sfc-typed-router"
  ]
}
~~~~

**正确写法：**

~~~~json
{ "plugins": ["vue-router/volar/sfc-typed-router"] }
~~~~

**验证方式：** 对照正确写法验证结果。

### 忽略 rootDir 与生成声明的项目边界

**触发条件：** 忽略 rootDir 与生成声明的项目边界

**原因：** typed-router 插件用 SFC 文件路径查询生成 map；固定实现缺少 rootDir 时也会输出警告。

**后果：** useRoute() 无法定位当前页面对应的 route name，类型退回宽泛结果。

**错误示例：**

~~~~json
{ "vueCompilerOptions": { "plugins": ["vue-router/volar/sfc-typed-router"] } }
~~~~

**正确写法：**

~~~~json
{
  "compilerOptions": { "rootDir": "." },
  "include": ["src", "src/route-map.d.ts"]
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 期待 Volar 插件代替构建插件

**触发条件：** 期待 Volar 插件代替构建插件

**原因：** Volar 只增强语言服务；pages 扫描、虚拟 routes 和 d.ts 仍由 `vue-router/vite` 或 unplugin 生成。

**后果：** 编辑器配置看似齐全，但生产构建找不到 auto-routes，类型 map 也不存在。

**错误示例：**

~~~~text
只配置 vueCompilerOptions.plugins，不安装 VueRouter() 构建插件
~~~~

**正确写法：**

~~~~text
构建配置负责生成，vueCompilerOptions.plugins 负责 SFC 编辑体验
~~~~

**验证方式：** 对照正确写法验证结果。

### 新代码继续从 vue-router/auto 导入

**触发条件：** 新代码继续从 vue-router/auto 导入

**原因：** 固定声明明确标为 deprecated，并计划在未来版本移除。

**后果：** 稳定 runtime、生成 routes 与 experimental 类型被兼容层混在一起，迁移成本延后。

**错误示例：**

~~~~ts
import { createRouter, routes } from 'vue-router/auto'
~~~~

**正确写法：**

~~~~ts
import { createRouter } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 Vetur metadata 或 package.json 当运行时 API

**触发条件：** 把 Vetur metadata 或 package.json 当运行时 API

**原因：** `./vetur/*` 与 `./package.json` 是工具/元数据入口，不提供路由匹配能力。

**后果：** 业务代码依赖包布局，既增加 bundle 风险，也绕开正式 Router contract。

**错误示例：**

~~~~ts
import tags from 'vue-router/vetur/tags.json'
~~~~

**正确写法：**

~~~~ts
import { useRoute, useRouter } from 'vue-router'
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 experimental 子路径计入稳定完成度

**触发条件：** 把 experimental 子路径计入稳定完成度

**原因：** package export 只证明子路径可解析；Data Loaders、resolver 等仍有独立实验性声明和变更风险。

**后果：** 把 86 项观察 surface 误写成稳定根入口，版本承诺与用户预期失真。

**错误示例：**

~~~~text
Vue Router 稳定 API = 根入口 118 项 + experimental 86 项
~~~~

**正确写法：**

~~~~text
稳定完成度只统计根入口 118 项；experimental 保持独立 watchlist
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 七、源码推导与适用场景

:::steps
### 1. 两个 Volar 入口承担不同转换

固定发布声明把两者都定义为 VueLanguagePlugin；route-blocks 处理 custom block，typed-router 带 rootDir options 并按文件生成 useRoute 泛型。只启用真正需要的编辑器能力。

### 2. 页面级类型依赖 auto-routes 的生成映射

固定 typed-router 实现引用 `_RouteNamesForFilePath`，该映射由生成声明增强。适合由同一 file tree 同时驱动 runtime routes 与页面类型，不适合手写第二份文件到 route name 对照。

### 3. Deprecated auto 是过渡层而非新架构

固定 `vue-router-auto.d.ts` 首行标记未来移除，而 package runtime 条件回指根构建。迁移时应拆回精确入口，而不是因为旧代码暂时运行就保留聚合依赖。

### 4. v5 迁移的主线是所有权合并

官方迁移指南把 dependency、build import、virtual module、client types 与 Volar path 一并迁移。出现类型不生效时按这条链逐段排查，比只重启编辑器更可靠。

### 5. Metadata export 不等于应用 API

固定 export map 保留 Vetur 与 package.json 是为了工具兼容；它们不参与 Router 安装、matcher 或导航。应用运行时继续以根入口和明确 virtual module 为边界。

### 6. Experimental 保持独立版本账本

固定 package 同时导出 experimental 子路径，但 RA5 只登记解析边界。需要实验 resolver 或 Data Loaders 时，应在独立 watchlist 核对 flag、来源与升级风险。
:::
