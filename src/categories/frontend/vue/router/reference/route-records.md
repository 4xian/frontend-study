---
id: vue.router.reference.matching.route-records
type: reference
title: Route Records 与 RouteRecordRaw
summary: 区分应用声明的 raw route record、matcher 生成的 normalized record，以及单视图、多视图、children、redirect、name、meta 与 props 的类型边界
domain: frontend
technology: vue
module: router
related:
  - vue.router.reference.matching.matcher
  - vue.router.reference.matching.route-locations
  - vue.router.learn.basics.nested-routes
  - vue.router.learn.intermediate.named-views-route-props
  - vue.router.learn.intermediate.named-routes-redirects-aliases
  - vue.router.learn.intermediate.meta-navigation-guards
tags:
  - Vue Router
  - RouteRecordRaw
  - RouteRecordNormalized
  - RouteMeta
  - RouteRecordName
  - named views
  - nested routes
  - redirect
  - route props
appliesTo: Vue Router 5.2.0
verifiedAt: 2026-08-04
sources:
  - title: Vue Router API：_RouteRecordBase
    url: https://router.vuejs.org/api/interfaces/routerecordbase
  - title: Vue Router API：RouteMeta
    url: https://router.vuejs.org/api/interfaces/routemeta
  - title: Vue Router API：RouteRecordMultipleViews
    url: https://router.vuejs.org/api/interfaces/routerecordmultipleviews
  - title: Vue Router API：RouteRecordMultipleViewsWithChildren
    url: https://router.vuejs.org/api/interfaces/routerecordmultipleviewswithchildren
  - title: Vue Router API：RouteRecordNormalized
    url: https://router.vuejs.org/api/interfaces/routerecordnormalized
  - title: Vue Router API：RouteRecordRedirect
    url: https://router.vuejs.org/api/interfaces/routerecordredirect
  - title: Vue Router API：RouteRecordSingleView
    url: https://router.vuejs.org/api/interfaces/routerecordsingleview
  - title: Vue Router API：RouteRecordSingleViewWithChildren
    url: https://router.vuejs.org/api/interfaces/routerecordsingleviewwithchildren
  - title: Vue Router API：_RouteRecordProps
    url: https://router.vuejs.org/api/type-aliases/routerecordprops
  - title: Vue Router API：RouteRecord
    url: https://router.vuejs.org/api/type-aliases/routerecord
  - title: Vue Router API：RouteRecordName
    url: https://router.vuejs.org/api/type-aliases/routerecordname
  - title: Vue Router API：RouteRecordNameGeneric
    url: https://router.vuejs.org/api/type-aliases/routerecordnamegeneric
  - title: Vue Router API：RouteRecordRaw
    url: https://router.vuejs.org/api/type-aliases/routerecordraw
  - title: Vue Router API：RouteRecordRedirectOption
    url: https://router.vuejs.org/api/type-aliases/routerecordredirectoption
  - title: Vue Router Guide：Nested Routes
    url: https://router.vuejs.org/guide/essentials/nested-routes
  - title: Vue Router Guide：Named Routes
    url: https://router.vuejs.org/guide/essentials/named-routes
  - title: Vue Router Guide：Named Views
    url: https://router.vuejs.org/guide/essentials/named-views
  - title: Vue Router Guide：Passing Props to Route Components
    url: https://router.vuejs.org/guide/essentials/passing-props
  - title: Vue Router Guide：Redirect and Alias
    url: https://router.vuejs.org/guide/essentials/redirect-and-alias
  - title: Vue Router Guide：Route Meta Fields
    url: https://router.vuejs.org/guide/advanced/meta
  - title: Vue Router Guide：Dynamic Routing
    url: https://router.vuejs.org/guide/advanced/dynamic-routing
  - title: Vue Router 5.2.0：route record 输入类型固定源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/types/index.ts
  - title: Vue Router 5.2.0：normalized record 固定源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/matcher/types.ts
  - title: Vue Router 5.2.0：name、props 与 redirect 类型固定源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/typed-routes/route-records.ts
  - title: Vue Router 5.2.0：record 标准化与 matcher 固定源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/matcher/index.ts
group: matching
signature: |-
  interface _RouteRecordBase extends PathParserOptions {
    path: string
    redirect?: RouteRecordRedirectOption
    alias?: string | string[]
    name?: RouteRecordNameGeneric
    beforeEnter?:
      | NavigationGuardWithThis<undefined>
      | NavigationGuardWithThis<undefined>[]
    meta?: RouteMeta
    children?: RouteRecordRaw[]
    props?: _RouteRecordProps | Record<string, _RouteRecordProps>
  }

  interface RouteMeta extends Record<PropertyKey, unknown> {
    loaders?: UseDataLoader[]
    [LOADER_SET_KEY]?: Set<UseDataLoader>
    [ABORT_CONTROLLER_KEY]?: AbortController
  }

  interface RouteRecordSingleView extends _RouteRecordBase {
    component: RawRouteComponent
    components?: never
    children?: never
    redirect?: never
    props?: _RouteRecordProps
  }

  interface RouteRecordSingleViewWithChildren extends _RouteRecordBase {
    component?: RawRouteComponent | null | undefined
    components?: never
    children: RouteRecordRaw[]
    props?: _RouteRecordProps
  }

  interface RouteRecordMultipleViews extends _RouteRecordBase {
    components: Record<string, RawRouteComponent>
    component?: never
    children?: never
    redirect?: never
    props?: Record<string, _RouteRecordProps> | boolean
  }

  interface RouteRecordMultipleViewsWithChildren extends _RouteRecordBase {
    components?: Record<string, RawRouteComponent> | null | undefined
    component?: never
    children: RouteRecordRaw[]
    props?: Record<string, _RouteRecordProps> | boolean
  }

  interface RouteRecordRedirect extends _RouteRecordBase {
    redirect: RouteRecordRedirectOption
    component?: never
    components?: never
    props?: never
  }

  interface RouteRecordNormalized {
    path: _RouteRecordBase['path']
    redirect: _RouteRecordBase['redirect'] | undefined
    name: _RouteRecordBase['name']
    components: RouteRecordMultipleViews['components'] | null | undefined
    mods: Record<string, unknown>
    children: RouteRecordRaw[]
    meta: Exclude<_RouteRecordBase['meta'], void>
    props: Record<string, _RouteRecordProps>
    beforeEnter: _RouteRecordBase['beforeEnter']
    leaveGuards: Set<NavigationGuard>
    updateGuards: Set<NavigationGuard>
    enterCallbacks: Record<string, NavigationGuardNextCallback[]>
    instances: Record<string, ComponentPublicInstance | undefined | null>
    aliasOf: RouteRecordNormalized | undefined
  }

  type _RouteRecordProps<Name extends keyof RouteMap = keyof RouteMap> =
    | boolean
    | Record<string, any>
    | ((to: RouteLocationNormalized<Name>) => Record<string, any>)

  type RouteRecord = RouteRecordNormalized

  type RouteRecordName = RouteMapGeneric extends RouteMap
    ? RouteRecordNameGeneric
    : keyof RouteMap

  type RouteRecordNameGeneric = string | symbol | undefined

  type RouteRecordRaw =
    | RouteRecordSingleView
    | RouteRecordSingleViewWithChildren
    | RouteRecordMultipleViews
    | RouteRecordMultipleViewsWithChildren
    | RouteRecordRedirect

  type RouteRecordRedirectOption =
    | RouteLocationRaw
    | ((
        to: RouteLocation,
        from: RouteLocationNormalizedLoaded,
      ) => RouteLocationRaw)
anchors:
  - 概述
  - Route Record Base
  - Route Meta
  - Route Record Multiple Views
  - Route Record Multiple Views With Children
  - Route Record Normalized
  - Route Record Redirect
  - Route Record Single View
  - Route Record Single View With Children
  - Internal Route Record Props
  - Route Record
  - Route Record Name
  - Route Record Name Generic
  - Route Record Raw
  - Route Record Redirect Option
  - 选型速查
  - 易错使用提示
  - 源码推导与适用场景
---

# Route Records 与 RouteRecordRaw

## 一、概述

`RouteRecordRaw` 是应用传给 `createRouter({ routes })` 或 `router.addRoute()` 的声明联合；matcher 会复制并标准化它，生成 `RouteRecordNormalized`。`RouteRecord` 在 5.2.0 中只是 normalized 类型的别名。输入配置与读取结果看似共享 path、name、meta，却不是可互换的生命周期对象。

:::tip
写配置时用 `RouteRecordRaw`；读取 `router.getRoutes()`、`route.matched` 或 matcher 结果时按对应 normalized 类型处理。不要把 normalized record 当成再次声明 routes 的模板。
:::

## 二、Route Record Base

`_RouteRecordBase` 汇总五种 raw record 共享的 path parser、name、alias、guard、meta、children 与 props 字段。固定源码注释称它为 common internal shape，但 5.2.0 根入口实际导出且未标 `@internal`，本页按 manifest 的 public/quick 记录；应用通常仍应声明最终的 `RouteRecordRaw`，让联合类型检查互斥字段。

| 字段 | 完整值域 | 边界 |
| --- | --- | --- |
| path | string | 顶层通常以 / 开头；child 可写相对段 |
| name / alias | string \| symbol \| undefined；string \| string[] | name 全局唯一；alias 保留访问 URL |
| beforeEnter | 单个或数组 NavigationGuardWithThis&lt;undefined&gt; | redirect record 上不会执行 |
| meta | RouteMeta | 挂到 record，并在 route.meta 中由父到子浅合并 |
| children / props | RouteRecordRaw[]；布尔、对象或函数模式 | 最终值域由五个联合分支收窄 |
| sensitive / strict / end | 继承 PathParserOptions | record 级值覆盖 Router 全局默认；end 已 deprecated |

## 三、Route Meta

`RouteMeta` 是可通过模块增强收窄的开放接口。稳定应用字段应在一个会被 TypeScript 纳入编译的模块中声明；`route.meta` 是 matched records 从父到子的非递归合并结果。5.2.0 还声明 experimental Data Loaders 使用的 `loaders`，以及两个 internal symbol 字段；未启用 experimental plugin 时不要围绕这些字段设计稳定业务契约。

~~~~ts
// router-meta.d.ts
import 'vue-router'

export {}

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth: boolean
    permission?: 'reports:read' | 'reports:write'
  }
}

const reportRoute: RouteRecordRaw = {
  path: '/reports',
  component: ReportsPage,
  meta: { requiresAuth: true, permission: 'reports:read' },
}
~~~~

## 四、Route Record Multiple Views

`RouteRecordMultipleViews` 用必填 `components: Record&lt;string, RawRouteComponent&gt;` 同时填充多个命名 RouterView，并禁止 singular `component`、children 与 redirect。`default` 对应未命名 RouterView；`props` 可以是布尔值，或按与 components 相同的 view name 分别配置。

~~~~ts
const dashboardRoute: RouteRecordRaw = {
  path: '/dashboard/:teamId',
  components: {
    default: DashboardMain,
    sidebar: DashboardSidebar,
  },
  props: {
    default: true,
    sidebar: (route) => ({ teamId: route.params.teamId }),
  },
}
~~~~

## 五、Route Record Multiple Views With Children

`RouteRecordMultipleViewsWithChildren` 要求 `children`，允许 components 缺省、为 null 或为命名组件表，也允许 redirect。没有 components 的 parent 可作为路径分组，让顶层 RouterView 直接使用匹配 child；需要布局时再提供与命名 RouterView 对齐的 components。

~~~~ts
const adminRoutes: RouteRecordRaw = {
  path: '/admin',
  components: {
    default: AdminLayout,
    sidebar: AdminNavigation,
  },
  children: [
    { path: '', component: AdminOverview },
    { path: 'users', component: AdminUsers },
  ],
}
~~~~

## 六、Route Record Normalized

`RouteRecordNormalized` 是 matcher 的读取形状：所有 component 都归一到 `components`，所有 props 都归一到按 view name 索引的对象，meta 与 children 总是存在。`mods`、三组 guard 容器属于 internal runtime 状态；`instances` 供 RouterView 与组件守卫协调。业务代码读取公开信息即可，不要写这些容器。

| 标准化结果 | 来源或默认值 | 应用层用途 |
| --- | --- | --- |
| components | singular component 变为 { default: component } | 诊断匹配视图；lazy component 加载后另有 loaded 类型 |
| props | singular 配置归到 default；named 配置按 view name | 理解 RouterView 最终收到哪种 props 模式 |
| meta / children | 缺省分别变为 {} / [] | 读取时无需处理 undefined |
| aliasOf | 原记录为 undefined，alias 指向原 normalized record | 区分原路径与 alias 副本 |
| mods / guard sets / callbacks | matcher 与导航期间创建 | internal；禁止应用读写 |

## 七、Route Record Redirect

`RouteRecordRedirect` 是纯 redirect 分支：redirect 必填，component、components 与 props 为 never，因为该 record 不会直接渲染。redirect 可给 path/name 地址或返回地址的函数；导航守卫运行在最终目标上，不运行在 redirect record 上。带 children 的 redirect 应选对应 WithChildren 分支并提供布局 component。

~~~~ts
const legacyReportRoute: RouteRecordRaw = {
  path: '/legacy-report/:id',
  redirect: (to) => ({
    name: 'report-detail',
    params: { id: to.params.id },
  }),
}
~~~~

## 八、Route Record Single View

`RouteRecordSingleView` 是叶子页面的最窄形状：component 必填，components、children 与 redirect 被排除，props 只描述 default view。component 既可为普通 Vue 组件，也可为返回组件 Promise 的 lazy factory。

~~~~ts
const profileRoute: RouteRecordRaw = {
  path: '/users/:id',
  name: 'user-profile',
  component: () => import('./UserProfilePage.vue'),
  props: true,
}
~~~~

## 九、Route Record Single View With Children

`RouteRecordSingleViewWithChildren` 要求 children，但 component 可以缺省或为 null。提供 component 时，它通常是包含嵌套 RouterView 的布局；省略时 parent 只组织路径，匹配 child 可直接进入上一级 RouterView。与叶子分支不同，它允许 redirect。

~~~~ts
const userRoutes: RouteRecordRaw = {
  path: '/users/:id',
  component: UserLayout,
  children: [
    { path: '', component: UserOverview },
    { path: 'activity', component: UserActivity },
  ],
}
~~~~

## 十、Internal Route Record Props

:::warning
`_RouteRecordProps` 在 5.2.0 固定源码明确标记 `@internal`。不要从根入口导入它、做条件类型推导或把它发布在应用公共接口中；直接用 `RouteRecordRaw` 声明 route，再通过公开的 `props` 配置选择 boolean、静态对象或无状态函数模式。
:::

| 公开 props 模式 | RouterView 行为 | 适用边界 |
| --- | --- | --- |
| true / false | true 把 route.params 作为 props；false 不注入 | 参数名已与组件 props 对齐 |
| 普通对象 | 原样作为静态 props | 固定开关或常量，不读取 route |
| 函数 | route 变化时计算 props | 转换 params/query；函数保持无状态 |
| named 对象 | 按 components 的 view name 选择上述模式 | 每个命名视图独立声明 |

## 十一、Route Record

`RouteRecord` 在 5.2.0 精确等于 `RouteRecordNormalized`，用于说明已经进入 matcher 的 record，而不是旧版本意义上的 raw 配置。新代码若要表达输入，请明确使用 `RouteRecordRaw`；若要表达输出，优先使用 API 直接返回的具体 normalized 类型。

## 十二、Route Record Name

`RouteRecordName` 是条件类型：没有生成 `RouteNamedMap` 时退化为 generic name；存在 typed route map 时收窄为 `keyof RouteMap`。固定声明提示它可能过早求值；需要稳定表达已生成的全部 route names 时，直接使用 `keyof RouteMap` 更清楚。

## 十三、Route Record Name Generic

`RouteRecordNameGeneric = string | symbol | undefined` 是无 typed route map 时的通用值域。raw record 的 name 可缺省，所以包含 undefined；实际传给 `hasRoute()`、`removeRoute()` 或按名导航时必须是已定义的 string 或 symbol。Symbol 适合避免第三方功能模块的字符串冲突，但不能从 URL 持久化还原。

## 十四、Route Record Raw

`RouteRecordRaw` 是五分支可辨识联合，也是本页 detail 主入口。互斥字段把常见配置错误前移到 TypeScript：叶子用 component 或 components，嵌套分支必须有 children，纯 redirect 不渲染。共享的 path、alias、name、beforeEnter、meta 和 parser options 由 base 提供。

| 分支 | 必填判据 | 明确排除 |
| --- | --- | --- |
| RouteRecordSingleView | component | components、children、redirect |
| RouteRecordSingleViewWithChildren | children；component 可选 | components |
| RouteRecordMultipleViews | components | component、children、redirect |
| RouteRecordMultipleViewsWithChildren | children；components 可选 | component |
| RouteRecordRedirect | redirect | component、components、props |

## 十五、Route Record Redirect Option

:::warning
`RouteRecordRedirectOption` 虽从 5.2.0 根入口可见，但固定源码明确标记 `@internal`。不要显式导入、重导出或在应用 API 中锁定该别名；把 redirect 值内联到公开的 `RouteRecordRaw`，由联合类型推断。函数形态接收 to/from 并返回 `RouteLocationRaw`，其参数细节也不应成为应用自建抽象的兼容承诺。
:::

## 十六、选型速查

| 当前任务 | 使用类型或字段 | 不要使用 |
| --- | --- | --- |
| 声明初始或动态 routes | RouteRecordRaw | RouteRecordNormalized / RouteRecord |
| 读取 router.getRoutes() | RouteRecordNormalized[] | 把结果回填并当作 raw 配置 |
| 声明 route meta 业务字段 | 模块增强 RouteMeta | internal loader symbol |
| 声明单页面或布局 | SingleView / WithChildren 由联合自动推断 | 同时写 component 与 components |
| 声明命名视图 | components 与同名 props map | 把 view name 当 route name |
| 声明 redirect | RouteRecordRaw 内联 redirect | 显式依赖 RouteRecordRedirectOption |

## 十七、易错使用提示

:::pitfalls
### 给两条 route record 使用同一个 name

**触发条件：** 给两条 route record 使用同一个 name

**原因：** 官方 Named Routes 要求 name 在全部 routes 中唯一；Dynamic Routing 进一步说明，加入冲突 name 会先移除旧 record。

**后果：** 按名导航只会命中最后保留的 record，旧 record 及其 children、aliases 可能一并从 matcher 消失。

**错误示例：**

~~~~ts
const routes: RouteRecordRaw[] = [
  { path: '/reports', name: 'detail', component: ReportList },
  { path: '/reports/:id', name: 'detail', component: ReportDetail },
]
~~~~

**正确写法：**

~~~~ts
const routes: RouteRecordRaw[] = [
  { path: '/reports', name: 'report-list', component: ReportList },
  { path: '/reports/:id', name: 'report-detail', component: ReportDetail },
]
~~~~

**验证方式：** 对照正确写法验证结果。

### child path 以斜杠开头，却期待自动拼接 parent path

**触发条件：** child path 以斜杠开头，却期待自动拼接 parent path

**原因：** 官方 Nested Routes 明确说明，以 `/` 开头的 nested path 会被当作 root path；只有相对 child path 才拼接 parent path。

**后果：** 访问 `/users/42/settings` 匹配不到预期 child，而配置实际注册的是根路径 `/settings`。

**错误示例：**

~~~~ts
const route: RouteRecordRaw = {
  path: '/users/:id',
  component: UserLayout,
  children: [{ path: '/settings', component: UserSettings }],
}
~~~~

**正确写法：**

~~~~ts
const route: RouteRecordRaw = {
  path: '/users/:id',
  component: UserLayout,
  children: [{ path: 'settings', component: UserSettings }],
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 component 与 beforeEnter 放在纯 redirect record 上

**触发条件：** 把 component 与 beforeEnter 放在纯 redirect record 上

**原因：** 官方 Redirect and Alias 指出 redirect record 不会直接渲染，且守卫只应用于最终目标，不应用于执行 redirect 的 record。

**后果：** component 永远不会显示，redirect record 上的 beforeEnter 也不执行，权限检查可能被错误地认为已生效。

**错误示例：**

~~~~ts
const route = {
  path: '/legacy-admin',
  component: LegacyAdmin,
  beforeEnter: requireAdmin,
  redirect: { name: 'admin' },
}
~~~~

**正确写法：**

~~~~ts
const routes: RouteRecordRaw[] = [
  { path: '/legacy-admin', redirect: { name: 'admin' } },
  { path: '/admin', name: 'admin', component: Admin, beforeEnter: requireAdmin },
]
~~~~

**验证方式：** 对照正确写法验证结果。

### absolute alias 丢掉原 path 的动态参数

**触发条件：** absolute alias 丢掉原 path 的动态参数

**原因：** 官方 Guide 与 API 都要求带参数 route 的 absolute alias 保留相同参数；alias 是另一个匹配入口，不是任意跳转地址。

**后果：** alias 无法为原 record 提供完整 params，开发环境会警告，解析与按参导航也会出现不一致。

**错误示例：**

~~~~ts
const route: RouteRecordRaw = {
  path: '/users/:id/profile',
  alias: '/profile',
  component: UserProfile,
}
~~~~

**正确写法：**

~~~~ts
const route: RouteRecordRaw = {
  path: '/users/:id/profile',
  alias: '/profiles/:id',
  component: UserProfile,
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 命名视图的 props 对象没有使用 view name

**触发条件：** 命名视图的 props 对象没有使用 view name

**原因：** 官方 Passing Props 要求 named views 分别声明 props；固定源码标准化时按 components 的每个 name 读取同名 props。

**后果：** default 与 sidebar 都取不到预期配置，组件收到的 props 与开发者看到的对象内容不一致。

**错误示例：**

~~~~ts
const route: RouteRecordRaw = {
  path: '/teams/:id',
  components: { default: TeamMain, sidebar: TeamSidebar },
  props: { id: true },
}
~~~~

**正确写法：**

~~~~ts
const route: RouteRecordRaw = {
  path: '/teams/:id',
  components: { default: TeamMain, sidebar: TeamSidebar },
  props: { default: true, sidebar: true },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 让 route props 函数依赖外部响应式状态

**触发条件：** 让 route props 函数依赖外部响应式状态

**原因：** 官方 Passing Props 提醒 props 函数应保持无状态，因为它只在 route 变化时求值；外部状态应由 wrapper component 响应。

**后果：** feature flag 或 store 改变但 route 未变化时，页面继续收到旧 props，形成难以追踪的非响应式快照。

**错误示例：**

~~~~ts
const route: RouteRecordRaw = {
  path: '/search',
  component: SearchPage,
  props: () => ({ compact: preferences.compact }),
}
~~~~

**正确写法：**

~~~~ts
const route: RouteRecordRaw = {
  path: '/search',
  component: SearchPage,
  props: (to) => ({ query: to.query.q ?? '' }),
}

// 响应式 preferences 由 SearchPage 或 wrapper component 直接消费。
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 route.meta 误当成深度合并

**触发条件：** 把 route.meta 误当成深度合并

**原因：** 官方 Route Meta Fields 明确将 route.meta 定义为父到子的非递归合并；同名嵌套对象会被 child 整体覆盖。

**后果：** child 写入 audit 后，parent 的 roles 不会自动保留，权限逻辑可能读取到不完整的 access 对象。

**错误示例：**

~~~~ts
const route: RouteRecordRaw = {
  path: '/admin',
  component: AdminLayout,
  meta: { access: { roles: ['admin'] } },
  children: [
    { path: 'audit', component: AuditPage, meta: { access: { audit: true } } },
  ],
}
~~~~

**正确写法：**

~~~~ts
const route: RouteRecordRaw = {
  path: '/admin',
  component: AdminLayout,
  meta: { requiresAdmin: true },
  children: [
    { path: 'audit', component: AuditPage, meta: { auditEnabled: true } },
  ],
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 RouteRecordNormalized 声明 createRouter() 的 routes

**触发条件：** 用 RouteRecordNormalized 声明 createRouter() 的 routes

**原因：** 官方 API 把 RouteRecordRaw 定义为用户输入联合，把 RouteRecordNormalized 定义为 matcher 标准化结果；两者的必填字段和所有权不同。

**后果：** 配置被迫伪造 guard sets、instances、aliasOf 等运行时字段，或用断言掩盖真正的 route 分支错误。

**错误示例：**

~~~~ts
const routes = [
  { path: '/', component: HomePage },
] as unknown as RouteRecordNormalized[]

createRouter({ history, routes })
~~~~

**正确写法：**

~~~~ts
const routes: RouteRecordRaw[] = [
  { path: '/', component: HomePage },
]

createRouter({ history, routes })
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 十八、源码推导与适用场景

:::steps
### 1. 先以 raw 联合约束配置组合

固定 `types/index.ts` 把五种 record 合成 `RouteRecordRaw`，并用 never 排除 component/components、children 与 redirect 的无效组合。应用 routes、动态 addRoute 和库对外配置都应停留在这个 public 输入边界。

### 2. 标准化会创建副本并补齐容器

`matcher/index.ts` 的 `normalizeRouteRecord()` 复制 path、redirect、name、meta、children 与 beforeEnter，把 singular component 放入 `components.default`，并创建 instances、leaveGuards、updateGuards、enterCallbacks。raw 对象不是 matcher 内部状态。

### 3. props 始终按 view name 归一

`normalizeRecordProps()` 把单视图配置放到 `default`；多视图则遍历 components name，从 props 对象取同名值，或把 boolean 应用到每个 view。因此命名视图的 components 与 props key 必须表达同一组 view。

### 4. normalized record 包含不可接管的运行时字段

`matcher/types.ts` 暴露完整读取形状，但多个 guard set、callbacks 与 mods 标为 internal；normalize 还把 mods 定义为不可枚举属性。调试工具可读取公开 record 信息，应用不得克隆后写回 matcher 或接管内部集合。

### 5. alias 是链接到原 record 的 normalized 副本

matcher 为每个 alias 再做标准化，设置 `aliasOf`，并把 alias matcher 挂到原 matcher。移除原 route 会连同 children 与 aliases 清理；需要保留访问 URL 但复用匹配行为时用 alias，需要改变 URL 和重新导航时用 redirect。

### 6. name 冲突是替换语义

matcher 在插入顶层 named record 前先按 name 调用 removeRoute，再登记到 name map。静态配置和动态模块都必须保证 name 唯一；插件需要隔离命名空间时可使用稳定 Symbol，并保存同一 Symbol 引用进行查询与移除。

### 7. meta 聚合是按 matched 顺序浅覆盖

`mergeMetaFields()` 对 matched records 依次执行浅层 assign。适合把 requiresAuth、layout、title 等独立键从 parent 提供默认、由 child 覆盖；需要合并嵌套集合时，应显式读取 `route.matched` 并实现自己的领域规则。

### 8. 按页面拓扑选择 record 分支

叶子页面选 single/multiple view；需要嵌套出口时选对应 WithChildren；只改导航目标且不渲染时选 redirect。先确定是否有 children，再确定一个还是多个 view，最后添加 meta、guard、alias 与 props，可让类型自然收敛。
:::
