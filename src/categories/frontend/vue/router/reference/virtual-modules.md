---
id: vue.router.reference.file-based.virtual-modules
type: reference
title: 文件路由虚拟模块
summary: 区分 auto-routes 与 auto-resolver 的声明 stub、构建插件生成值、类型增强和稳定性边界
domain: frontend
technology: vue
module: router
related:
  - vue.router.reference.file-based.overview
  - vue.router.reference.typed-routes.route-map
  - vue.router.reference.tooling.unplugin
  - vue.router.reference.tooling.volar-migration
  - vue.router.reference.configuration.create-router
tags:
  - Vue Router
  - auto-routes
  - auto-resolver
  - virtual module
  - types-only
  - HMR
appliesTo: Vue Router 5.2.0
verifiedAt: 2026-08-04
sources:
  - title: Vue Router 文件路由：Getting Started
    url: https://router.vuejs.org/file-based-routing
  - title: Vue Router 文件路由：Configuration
    url: https://router.vuejs.org/file-based-routing/configuration
  - title: Vue Router：Experimental Router
    url: https://router.vuejs.org/experimental/router-resolver
  - title: Vue Router 5.2.0 package exports
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/package.json
  - title: Vue Router 5.2.0 auto-routes 声明 stub
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/vue-router-auto-routes.d.mts
  - title: Vue Router 5.2.0 auto-resolver 声明 stub
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/vue-router-auto-resolver.d.mts
  - title: Vue Router 5.2.0 虚拟模块常量源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/unplugin/core/moduleConstants.ts
  - title: Vue Router 5.2.0 unplugin resolve/load 源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/unplugin/index.ts
  - title: Vue Router 5.2.0 构建上下文源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/unplugin/core/context.ts
  - title: Vue Router 5.2.0 routes 代码生成器
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/unplugin/codegen/generateRouteRecords.ts
  - title: Vue Router 5.2.0 resolver 代码生成器
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/unplugin/codegen/generateRouteResolver.ts
  - title: Vue Router 5.2.0 类型声明生成器
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/unplugin/codegen/generateDTS.ts
  - title: Vue Router 5.2.0 experimental fixed resolver 源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/experimental/route-resolver/resolver-fixed.ts
group: file-based
signature: |-
  import { routes, handleHotUpdate } from 'vue-router/auto-routes'

  // 仅 experimental router 链路
  import { resolver, handleHotUpdate as handleResolverHotUpdate } from 'vue-router/auto-resolver'
anchors:
  - 概述
  - Auto Routes
  - Auto Resolver
  - Types Only Stub 与 Plugin 前置
  - 声明生成与 TypeScript
  - HMR 边界
  - Package Exports
  - 易错使用提示
  - 源码推导与适用场景
---

# 文件路由虚拟模块

## 一、概述

`vue-router/auto-routes` 与 `vue-router/auto-resolver` 是构建插件识别的虚拟 module id。5.2.0 package exports 为两者各提供一个 types-only 声明 stub，让 TypeScript 知道导出形状；真正的项目级运行时代码由插件扫描当前 pages 后，在 bundler 的 `resolveId/load` 阶段生成。

| 模块 | 生成值 | 对应 Router | 稳定性 |
| --- | --- | --- | --- |
| vue-router/auto-routes | routes + handleHotUpdate | 稳定 createRouter({ routes }) | RA5 常规路径 |
| vue-router/auto-resolver | resolver + handleHotUpdate | experimental_createRouter({ resolver }) | experimental opt-in |

:::warning
两个模块共享 pages/route tree，但不是可互换别名。常规项目选 `auto-routes`；只有明确试验 experimental router 时才选择 `auto-resolver`。
:::

## 二、Auto Routes

`auto-routes` 的 `routes` 是 `RouteRecordRaw[]`。插件把每个 route tree 节点编译为 path、name、component import、children、props、alias 与 meta；应用把数组直接传给稳定 `createRouter()`，后续匹配仍由稳定 matcher 完成。

~~~~ts
import { createRouter, createWebHistory } from 'vue-router'
import { routes, handleHotUpdate } from 'vue-router/auto-routes'

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

if (import.meta.hot) {
  handleHotUpdate(router)
}
~~~~

| 导出 | stub 签名 | 运行时来源 | 用途 |
| --- | --- | --- | --- |
| routes | RouteRecordRaw[] | generateRouteRecords(routeTree) | 稳定 Router 初始 records |
| handleHotUpdate | (router: Router, callback?) =&gt; void | generateRoutes() HMR 模板 | 开发期替换 routes |
| RouteNamedMap | 空 interface，可由声明增强 | 生成的 route-map.d.ts | 命名路由类型索引 |
| _RouteFileInfoMap | internal 空 interface | 生成的 route-map.d.ts | SFC 文件到 route 信息 |

:::tip
stub 中的空 interface 是增强目标，不是“当前项目没有 routes”的运行时结果。具体成员来自插件写出的 d.ts；具体 routes 值来自插件返回的虚拟模块代码。
:::

## 三、Auto Resolver

`auto-resolver` 从同一 route tree 生成排序后的固定 resolver，并把类型声明为 `EXPERIMENTAL_RouterOptions['resolver']`。生成代码会使用 `vue-router/experimental` 的 `createFixedResolver`、record normalization 与 matcher patterns；它因此继承 experimental router 的稳定性，而不是因为位于 file-based 子路径就成为稳定 matcher 替代品。

~~~~ts
// 仅展示 experimental 边界；生产采用前一节的 auto-routes 稳定链路。
import { createWebHistory } from 'vue-router'
import { experimental_createRouter } from 'vue-router/experimental'
import { resolver, handleHotUpdate } from 'vue-router/auto-resolver'

const router = experimental_createRouter({
  history: createWebHistory(),
  resolver,
})

if (import.meta.hot) {
  handleHotUpdate(router)
}
~~~~

:::warning
官方 Experimental Router 页面明确说明该 router 尚未 production-ready，只适合测试与反馈。本页只记录 resolver 的接线和生成边界；其 matcher patterns、参数解析器与 Data Loaders 成员留在 experimental watchlist，不在 RA5 展开。
:::

| resolver 特征 | 固定生成逻辑 | 边界结论 |
| --- | --- | --- |
| 输入 | 构建期完整 route tree | 不是运行时 addRoute 数组 |
| 排序 | 按生成的 matcher score 排列 records | 由生成器固定 |
| 产物 | createFixedResolver([...records]) | 只交给 experimental router |
| HMR | 调用 Router 的内部 resolver 替换能力 | 只通过生成的 handleHotUpdate 接线 |

## 四、Types Only Stub 与 Plugin 前置

固定 package manifest 中，两个 export key 都只有 `types` 条件，目标分别是包根部的 `.d.mts` stub，没有 `import`、`require` 或 `default` runtime 目标。构建插件注册同名常量，把精确 id 解析成带 `\0` 前缀的虚拟 id；load 时才调用 `generateRoutes()` 或 `generateResolver()` 返回代码。

:::compare
### 错误写法

~~~~text
"./auto-routes": {
  "types": "./vue-router-auto-routes.d.mts"
}
~~~~

### 正确写法

~~~~text
resolveId('vue-router/auto-routes')
  -> '\0vue-router/auto-routes'
load(virtualId)
  -> generateRoutes()
~~~~
:::

| 检查项 | 只有 package 时 | 启用且完成扫描时 |
| --- | --- | --- |
| TypeScript 导出形状 | stub 可见 | stub + 生成声明增强 |
| routes/resolver 运行时值 | 没有静态 runtime target | 插件 load 返回项目代码 |
| 项目 route names/params | 空增强接口 | route-map.d.ts 写入具体映射 |
| 页面 component imports | 不存在 | 按当前 route tree 生成 |

## 五、声明生成与 TypeScript

`generateDTS()` 增强根入口 `TypesConfig`，把 `RouteNamedMap` 与 `_RouteFileInfoMap` 指向 `vue-router/auto-routes`；随后又在该模块声明里写入具体 route records 与文件映射。因此即使应用不直接 import `RouteNamedMap`，Router 的 `push()`、RouterLink 和 `useRoute()` 仍能消费生成类型。

~~~~json
{
  "include": ["src/**/*.ts", "src/**/*.vue", "src/route-map.d.ts"],
  "compilerOptions": {
    "moduleResolution": "Bundler"
  }
}
~~~~

:::tip
官方 Getting Started 建议启动 dev server 生成首版类型，并把 d.ts 纳入 tsconfig。5.2.0 迁移指南进一步建议放在 `src/route-map.d.ts`，以便常见项目配置自动包含。
:::

## 六、HMR 边界

两个虚拟模块都生成 `handleHotUpdate()`，但更新策略不同：auto-routes 清空并重新 addRoute，再强制 replace 当前位置；auto-resolver 替换 experimental resolver，再按当前 path/query/hash 导航。应用只注册对应模块的 helper，不直接调用 `clearRoutes()` 循环或 internal resolver 替换方法。

| 模块 | HMR 替换对象 | 回放位置 | 生产语义 |
| --- | --- | --- | --- |
| auto-routes | 稳定 Router route records | 当前 route 去除旧 name/matched 后 replace | HMR 代码按 import.meta.hot 分支 |
| auto-resolver | experimental resolver | 当前 path/query/hash 后 replace | 仍是 experimental 链路 |

## 七、Package Exports

下表是本页负责的两个 package export key，第一列按 5.2.0 manifest 原样登记。它们是稳定 118 项之外的构建期附加入口，不计入根 API 分母；“types-only”只描述 package 静态目标，不会把 plugin 生成的运行时值变成 type-only。

| export key | 5.2.0 静态目标 | 插件生成值 | RA5 结论 |
| --- | --- | --- | --- |
| ./auto-routes | ./vue-router-auto-routes.d.mts（types-only） | routes + handleHotUpdate | 稳定 Router 文件路由桥接；不计 118 |
| ./auto-resolver | ./vue-router-auto-resolver.d.mts（types-only） | resolver + handleHotUpdate | experimental router 桥接；不计 118 |

## 八、易错使用提示

:::pitfalls
### 把 types-only stub 当成包内 runtime 模块

**触发条件：** 把 types-only stub 当成包内 runtime 模块

**原因：** manifest 只把这两个子路径映射到声明文件；值导入必须由已启用的构建插件拦截。

**后果：** 裸 Node 或未安装插件的 bundler 无法得到 routes/resolver 的运行时代码。

**错误示例：**

~~~~ts
// 没有 VueRouter() build plugin
import { routes } from 'vue-router/auto-routes'
~~~~

**正确写法：**

~~~~ts
// vite.config.ts
plugins: [VueRouter(), Vue()]

// router.ts
import { routes } from 'vue-router/auto-routes'
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 auto-resolver 传给稳定 createRouter()

**触发条件：** 把 auto-resolver 传给稳定 createRouter()

**原因：** 稳定 Router 接受 `routes`，experimental router 才接受生成的 `resolver`；两种 option 契约不同。

**后果：** 类型不匹配，且把 experimental matcher 错接到稳定 Router 生命周期。

**错误示例：**

~~~~ts
import { createRouter } from 'vue-router'
import { resolver } from 'vue-router/auto-resolver'

createRouter({ history, resolver })
~~~~

**正确写法：**

~~~~ts
import { createRouter } from 'vue-router'
import { routes } from 'vue-router/auto-routes'

createRouter({ history, routes })
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 auto-resolver 标为 production-ready

**触发条件：** 把 auto-resolver 标为 production-ready

**原因：** 其 stub 类型和生成代码都依赖 `vue-router/experimental`，官方页面明确限定为测试与反馈。

**后果：** 应用把可能变化的 resolver、Router 类型与安装行为当成稳定契约。

**错误示例：**

~~~~ts
// 生产默认路由
const router = experimental_createRouter({ history, resolver })
~~~~

**正确写法：**

~~~~ts
// 生产默认采用稳定链路
const router = createRouter({ history, routes })
~~~~

**验证方式：** 对照正确写法验证结果。

### 生成 d.ts 后没有纳入 TypeScript project

**触发条件：** 生成 d.ts 后没有纳入 TypeScript project

**原因：** 文件存在不等于语言服务读取；tsconfig include/files 与 moduleResolution 必须覆盖生成声明。

**后果：** 运行时 routes 正常，编辑器却退化为未增强的通用 route name 与 params。

**错误示例：**

~~~~json
{
  "include": ["src/main.ts"]
}
~~~~

**正确写法：**

~~~~json
{
  "include": ["src/**/*.ts", "src/**/*.vue", "src/route-map.d.ts"],
  "compilerOptions": { "moduleResolution": "Bundler" }
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 运行时包装 routes 后期待类型同步

**触发条件：** 运行时包装 routes 后期待类型同步

**原因：** route-map.d.ts 在构建期从 route tree 生成，运行时 `map()` 或第三方 layout 包装不会回写声明。

**后果：** 实际 record 的 path/name/meta 与编译器认识的映射出现差异。

**错误示例：**

~~~~ts
const runtimeRoutes = routes.map((route) => ({
  ...route,
  path: '/prefix' + route.path,
}))
~~~~

**正确写法：**

~~~~ts
VueRouter({
  beforeWriteFiles(rootRoute) {
    // 在生成 routes 与 d.ts 前统一调整 route tree。
  },
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 同时无别名导入两个 handleHotUpdate

**触发条件：** 同时无别名导入两个 handleHotUpdate

**原因：** 两个虚拟模块导出同名 helper，但参数分别是稳定 Router 与 experimental Router。

**后果：** 导入名冲突，或错误 helper 被用于另一种 Router。

**错误示例：**

~~~~ts
import { handleHotUpdate } from 'vue-router/auto-routes'
import { handleHotUpdate } from 'vue-router/auto-resolver'
~~~~

**正确写法：**

~~~~ts
// 常规项目只选择稳定链路
import { routes, handleHotUpdate } from 'vue-router/auto-routes'
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 九、源码推导与适用场景

:::steps
### 1. 从 package manifest 确定静态边界

固定 `package.json` 的 `./auto-routes` 与 `./auto-resolver` 都只有 `types` 条件，分别指向 `.d.mts`。因此 package 负责声明形状，不提供项目级 runtime records/resolver。

### 2. 从 module constants 确定精确 id

固定 `moduleConstants.ts` 把两个 specifier 定义为 `MODULE_ROUTES_PATH` 与 `MODULE_RESOLVER_PATH`。这两个字符串是插件和应用 import 之间的构建期协议。

### 3. 从 resolveId/load 确定 plugin 前置

固定 `unplugin/index.ts` 把精确 id 转为虚拟 id，并在 load 分支分别调用 context 的 `generateRoutes()` 与 `generateResolver()`。没有这组 hooks 就没有运行时值。

### 4. 从两个生成器确定不可互换

`generateRouteRecords.ts` 生成稳定 RouteRecordRaw 结构；`generateRouteResolver.ts` 生成 `createFixedResolver()` 调用并导入 experimental matcher helpers。共同输入不代表共同稳定性。

### 5. 从 generateDTS 确定类型增强路径

固定 `generateDTS.ts` 同时增强根 `TypesConfig` 和 `vue-router/auto-routes` 模块；stub 的空 interface 因而成为生成成员的合并目标，而不是手工维护点。

### 6. 按 Router 选择适用模块

生产常规链路选择 `auto-routes` + 稳定 `createRouter()`。`auto-resolver` 仅用于官方 Experimental Router 页面所示的测试/反馈接线；本页链接该边界，但不进入 RA6 的 experimental surface。
:::
