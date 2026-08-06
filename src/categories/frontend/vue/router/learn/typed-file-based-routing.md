---
id: vue.router.learn.advanced.typed-file-based-routing
type: lesson
title: 类型化与文件路由
summary: 从手工 RouteNamedMap 走到受限 pages、生成 routes 与类型声明的真实构建链路
domain: frontend
technology: vue
module: router
related:
  - vue.router.learn.basics.route-params-query-matching
  - vue.router.learn.basics.composition-programmatic-navigation
  - vue.router.learn.intermediate.named-routes-redirects-aliases
  - vue.router.learn.intermediate.lazy-loading
  - vue.router.learn.advanced.dynamic-routing-router-link
tags:
  - Vue Router
  - RouteRecordInfo
  - TypesConfig
  - 文件路由
  - Vite
appliesTo: Vue 3.5.40、Vue Router 5.2.0、Vite 8.1.5
verifiedAt: 2026-08-04
sources:
  - title: Vue Router：Typed Routes
    url: https://router.vuejs.org/guide/advanced/typed-routes
  - title: Vue Router：File-Based Routing
    url: https://router.vuejs.org/file-based-routing
  - title: Vue Router：File Conventions
    url: https://router.vuejs.org/file-based-routing/file-based-routing
  - title: Vue Router：Configuration
    url: https://router.vuejs.org/file-based-routing/configuration
  - title: Vue Router：Extending Routes
    url: https://router.vuejs.org/file-based-routing/extending-routes
  - title: Vue Router：Migrating to Vue Router 5
    url: https://router.vuejs.org/guide/migration/v4-to-v5
  - title: Vue Router API：RouteRecordInfo
    url: https://router.vuejs.org/api/interfaces/routerecordinfo
  - title: Vue Router API：TypesConfig
    url: https://router.vuejs.org/api/interfaces/typesconfig
  - title: Vue Router 5.2.0 typed-routes
    url: https://github.com/vuejs/router/tree/v5.2.0/packages/router/src/typed-routes
  - title: Vue Router 5.2.0 unplugin
    url: https://github.com/vuejs/router/tree/v5.2.0/packages/router/src/unplugin
  - title: Vue Router 5.2.0 generateDTS.ts
    url: https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/unplugin/codegen/generateDTS.ts
stage: advanced
level: advanced
estimatedMinutes: 95
prerequisites:
  - vue.router.learn.basics.route-params-query-matching
  - vue.router.learn.basics.nested-routes
  - vue.router.learn.basics.composition-programmatic-navigation
  - vue.router.learn.intermediate.named-routes-redirects-aliases
  - vue.router.learn.intermediate.named-views-route-props
  - vue.router.learn.intermediate.lazy-loading
  - vue.router.learn.advanced.dynamic-routing-router-link
objectives:
  - 解释 RouteRecordInfo 五个类型位置与 raw/normalized params 的差异
  - 用 TypesConfig.RouteNamedMap 把 route-name map 接入 Router 类型系统
  - 配置 vue-router/vite 并从 vue-router/auto-routes 消费生成 routes
  - 把 pages 扫描、声明生成与生产输出限制在独立 fixture
  - 用合法和预期非法调用验证 name/params 类型契约
  - 区分构建期 route tree、运行时 matcher 与 HMR 的职责
recap:
  - RouteRecordInfo 把 name、path、raw params、normalized params 与 child names 放在同一记录中。
  - TypesConfig.RouteNamedMap 只有被 tsconfig 读取后，公共 Router API 才真正获得具名类型。
  - vue-router/vite 负责构建期扫描与生成，运行时仍由 createRouter 消费 auto-routes。
  - 独立 fixture 能验证文件路由而不迁移宿主 Vite、router 或 URL contract。
  - production build、生成声明与带预期错误的独立 vue-tsc 缺一不可。
---

# 类型化与文件路由

## 先看懂手工 RouteNamedMap 的五个位置

`RouteRecordInfo` 依次描述 name、path、导航输入 paramsRaw、URL 归一化后的 params，以及全部 child route names。必填 `\:id` 的导航输入可接受 string 或 number，但从 URL 读取的值是 string；这两个位置不能交换。

~~~~ts
import type {
  ParamValue,
  RouteRecordInfo,
} from 'vue-router'

interface RouteNamedMap {
  '/users/[id]': RouteRecordInfo<
    '/users/[id]',
    '/users/:id',
    { id: ParamValue<true> },
    { id: ParamValue<false> },
    never
  >
}
~~~~

这个 map 只影响编译期，不会创建任何运行时 route record。手工 routes 与手工 map 必须由开发者双份维护；路径、name 或参数一边变化而另一边未同步时，类型仍可通过，运行时却会走向另一套结构。

## TypesConfig 让公共 Router API 读取同一张 map

~~~~ts
declare module 'vue-router' {
  interface TypesConfig {
    RouteNamedMap: RouteNamedMap
  }
}
~~~~

module augmentation 被 TypeScript 纳入后，`router.push()`、`router.resolve()`、RouterLink 与 route location 类型会从这张 map 取得 name 和 params。若声明未进入 tsconfig，它们会回退为 generic；编辑器没有报错并不证明类型生成有效。

## 文件路由把双份维护变成构建期生成

`vue-router/vite` 扫描 pages tree，生成可执行 routes 虚拟模块和 d.ts。Vite 插件必须位于 `Vue()` 前；运行时仍从稳定主入口创建 Router，只从 `vue-router/auto-routes` 导入生成的 routes。

~~~~ts
plugins: [
  VueRouter({
    root: fixtureRoot,
    routesFolder: 'pages',
    dts: 'generated/route-map.d.ts',
    watch: false,
  }),
  Vue(),
]
~~~~

~~~~ts
import { createMemoryHistory, createRouter } from 'vue-router'
import { routes } from 'vue-router/auto-routes'

export const router = createRouter({
  history: createMemoryHistory('/fixture/'),
  routes,
})
~~~~

## 本课的可执行示例是独立 production fixture

fixture 只扫描自己的 `pages/index.vue` 与 `pages/users/[id].vue`，生成声明也保留在 fixture 内，bundle 输出写入 `node_modules/.tmp/`。它不注册到宿主 DemoBox、不修改宿主 Vite 或 router，因此能验证构建期 seam 而不改变学习站 URL。

| 文件 | 职责 | 不得替代的证据 |
| --- | --- | --- |
| pages/**/*.vue | 构建期 route tree 输入 | 不能用手写 routes 冒充扫描 |
| generated/route-map.d.ts | name/params 类型输入 | 不能手改生成文件自证 |
| src/router.ts | 消费 auto-routes 创建运行时 Router | 不能从 vue-router/auto 导入 |
| src/type-contract.ts | 合法与预期非法类型调用 | 不能只看编辑器提示 |
| vite.config.ts | 限定扫描、插件顺序与输出目录 | 不能修改宿主配置 |

## 用正反例证明生成类型真的生效

~~~~ts
router.resolve({ name: '/users/[id]', params: { id: '42' } })
router.resolve({ name: '/users/[id]', params: { id: 42 } })

// @ts-expect-error 缺少必填 id
router.resolve({ name: '/users/[id]', params: {} })

// @ts-expect-error 生成 map 中不存在该名称
router.resolve({ name: '/missing', params: {} })
~~~~

`@ts-expect-error` 不是忽略错误：它要求下一行必须产生类型错误。若 augmentation 失效而 API 退化为 generic，指令会变成 unused 并让 Gate 失败。normalized route 还要单独断言 `params.id` 是 string，而不是导航输入允许的 number。

## 构建期扩展与运行时 addRoute 属于两个阶段

`extendRoute` 与 `beforeWriteFiles` 修改生成器的 editable tree，结果可同时进入 routes 和 d.ts；B14 的 `addRoute()` 只修改已运行 Router 的 matcher，不会回写声明。需要新增类型时必须回到构建输入或 public build-time hook。

- [ ] VueRouter() 位于 Vue() 前，root/routesFolder/dts 均显式限定
- [ ] 公共 Router API 从 vue-router 导入，生成 routes 从 auto-routes 导入
- [ ] 生成声明由插件重建，并明确进入 fixture tsconfig
- [ ] required params、未知 params、未知 name 都有预期非法断言
- [ ] normalized params 读取类型与 raw 导航输入分开验证
- [ ] production build 与独立 vue-tsc Gate 都通过
- [ ] 宿主 vite.config.ts、src/router 与 URL contract 保持不变

## 易错使用提示

:::pitfalls
### 把 VueRouter() 放到 Vue() 后

**触发条件：** 把 VueRouter() 放到 Vue() 后

**原因：** 文件路由插件的 SFC 转换必须先于 Vue 插件处理。

**后果：** 页面扫描或 route block 转换不完整，开发与生产结果可能不同。

**错误示例：**

~~~~ts
plugins: [Vue(), VueRouter()]
~~~~

**正确写法：**

~~~~ts
plugins: [VueRouter(options), Vue()]
~~~~

**验证方式：** 对照正确写法验证结果。

### 让 fixture 使用默认 src/pages

**触发条件：** 让 fixture 使用默认 src/pages

**原因：** 默认扫描位置相对当前 root，未限定时容易混入宿主页面。

**后果：** 生成 name map 随站点文件变化，课程结果不再稳定。

**错误示例：**

~~~~ts
VueRouter()
~~~~

**正确写法：**

~~~~ts
VueRouter({ root: fixtureRoot, routesFolder: 'pages', dts: 'generated/route-map.d.ts' })
~~~~

**验证方式：** 对照正确写法验证结果。

### 生成 d.ts 后忘记纳入 tsconfig

**触发条件：** 生成 d.ts 后忘记纳入 tsconfig

**原因：** 文件存在不等于 TypeScript program 已经读取它。

**后果：** name 和 params 退化为 generic，错误导航也能通过。

**错误示例：**

~~~~json
{ "include": ["src/**/*"] }
~~~~

**正确写法：**

~~~~json
{ "include": ["src/**/*", "generated/route-map.d.ts"] }
~~~~

**验证方式：** 对照正确写法验证结果。

### 从弃用的 vue-router/auto 导入

**触发条件：** 从弃用的 vue-router/auto 导入

**原因：** 5.2.0 的兼容类型入口不是本课的生成 routes 模块。

**后果：** 稳定 runtime 与 build-time virtual module 的边界被混淆。

**错误示例：**

~~~~ts
import { createRouter } from 'vue-router/auto'
~~~~

**正确写法：**

~~~~ts
import { createRouter } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 auto-routes 当成普通文件或手写 mock

**触发条件：** 把 auto-routes 当成普通文件或手写 mock

**原因：** 它由 unplugin resolve/load hooks 在构建时提供。

**后果：** 测试绕过真实插件后，生产构建仍可能无法解析模块。

**错误示例：**

~~~~ts
resolve: { alias: { 'vue-router/auto-routes': mockFile } }
~~~~

**正确写法：**

~~~~ts
plugins: [VueRouter(options), Vue()]
~~~~

**验证方式：** 对照正确写法验证结果。

### 交换 raw 与 normalized params

**触发条件：** 交换 raw 与 normalized params

**原因：** 导航输入和 URL 解析后的值属于不同类型位置。

**后果：** 数字导航被错误拒绝，或读取结果被错误承诺为 number。

**错误示例：**

~~~~ts
RouteRecordInfo<'user', '/users/:id', { id: string }, { id: number }>
~~~~

**正确写法：**

~~~~ts
RouteRecordInfo<'user', '/users/:id', { id: ParamValue<true> }, { id: ParamValue<false> }>
~~~~

**验证方式：** 对照正确写法验证结果。

### 直接修改生成声明

**触发条件：** 直接修改生成声明

**原因：** 生成文件是 page tree 的可再生产物，不是业务类型源。

**后果：** 下次扫描覆盖修改，运行时 routes 与类型再次分裂。

**错误示例：**

~~~~ts
// 在 route-map.d.ts 手写 '/admin'
~~~~

**正确写法：**

~~~~text
修改 page 或构建期 hook，再重新生成声明
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为 addRoute 会扩充编译期类型

**触发条件：** 认为 addRoute 会扩充编译期类型

**原因：** addRoute 只进入运行时 matcher，不经过 codegen。

**后果：** route 可以匹配，但未知 name 仍不能通过类型检查。

**错误示例：**

~~~~ts
router.addRoute(adminRoute) // 期待 '/admin' 自动变成类型
~~~~

**正确写法：**

~~~~text
需要类型时修改 build-time route tree
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 extendRoute 当运行时 hook

**触发条件：** 把 extendRoute 当运行时 hook

**原因：** extendRoute 与 beforeWriteFiles 都属于插件 options。

**后果：** 若读取 window、当前用户或 current route，构建将不确定或直接失败。

**错误示例：**

~~~~ts
extendRoute: () => window.location.pathname
~~~~

**正确写法：**

~~~~ts
extendRoute: (route) => route.addToMeta({ audited: true })
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 definePage 当 5.2.0 稳定主入口函数

**触发条件：** 把 definePage 当 5.2.0 稳定主入口函数

**原因：** 固定发布物的主入口没有该稳定导出，官网措辞会随新版本变化。

**后果：** 示例在锁定版本无法导入，或把构建宏误当运行时 API。

**错误示例：**

~~~~ts
import { definePage } from 'vue-router'
~~~~

**正确写法：**

~~~~text
B15 主线不依赖该宏，并明确固定版本边界
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 从源码推导适用场景

:::steps
### 1. augmentation 是 typed map 的开关

RouteMap 仅在 TypesConfig 含 RouteNamedMap 时切换到具体 map，否则回退 generic。类型突然失效时，应先检查生成声明是否进入 tsconfig。

### 2. raw/normalized 分离是正式类型模型

RouteRecordInfo 分开保存 paramsRaw 与 params，适合让数字等导航输入在序列化后收敛成稳定的 string 读取类型。

### 3. 只有可命名组件节点进入 RouteNamedMap

生成器为有 component 且有 name 的节点输出 record info；纯结构节点不会自动成为具名导航目标。

### 4. children names 由完整子树生成

codegen 会写入所有深层 child names。大型嵌套路由用生成方案更能避免手工 map 漏掉后代联合。

### 5. auto-routes 是明确的虚拟模块 seam

unplugin 把固定 module id 解析为虚拟 id，再在 load 时生成 routes。生产构建是验证插件真实接管该 seam 的最小证据。

### 6. buildStart 负责 page tree 初次扫描

生产 build 会先 scanPages 再生成 routes/d.ts，因此不需要为了首份声明额外启动 dev server。

### 7. public build hooks 共享同一 editable tree

extendRoute 逐条运行，beforeWriteFiles 在写文件前运行；适合加入确定性的 meta、别名或构建期虚拟记录。

### 8. runtime matcher 不会反向调用 generateDTS

addRoute 不经过生成器。插件化权限 route 若必须动态出现，应接受显式动态边界，不能承诺静态 map 自动增长。

### 9. 显式 options 让教学 fixture 可重复

默认 routesFolder、importMode、dts 与 watch 含环境判断；独立 fixture 固定关键值后，CI 与本地使用同一输入。

### 10. HMR 只同步开发期文件变化

context 会按文件变化更新虚拟 routes 与声明，但 HMR 不能替代 production bundle 解析和独立类型 Gate。
:::
