---
id: vue.router.reference.matching.route-locations
type: reference
title: Route Locations
summary: 区分导航输入、matcher 结果、规范化地址、已加载地址与 href 解析结果，并说明 START_LOCATION 的首航边界
domain: frontend
technology: vue
module: router
related:
  - vue.router.reference.configuration.create-router
  - vue.router.reference.configuration.router-instance
  - vue.router.reference.configuration.history
  - vue.router.learn.basics.composition-programmatic-navigation
  - vue.router.learn.basics.route-params-query-matching
tags:
  - Vue Router
  - RouteLocationRaw
  - RouteLocationNormalized
  - RouteLocationResolved
  - START_LOCATION
appliesTo: Vue Router 5.2.0
verifiedAt: 2026-08-04
sources:
  - title: Vue Router API：Route Locations 总览
    url: https://router.vuejs.org/api/
  - title: Vue Router API：RouteLocationRaw
    url: https://router.vuejs.org/api/type-aliases/routelocationraw
  - title: Vue Router API：RouteLocation
    url: https://router.vuejs.org/api/type-aliases/routelocation
  - title: Vue Router API：RouteLocationNormalizedLoaded
    url: https://router.vuejs.org/api/type-aliases/routelocationnormalizedloaded
  - title: Vue Router API：RouteLocationResolved
    url: https://router.vuejs.org/api/type-aliases/routelocationresolved
  - title: Vue Router API：RouteLocationOptions
    url: https://router.vuejs.org/api/interfaces/routelocationoptions
  - title: Vue Router API：START_LOCATION
    url: https://router.vuejs.org/api/variables/start_location
  - title: Vue Router Guide：Programmatic Navigation
    url: https://router.vuejs.org/guide/essentials/navigation.html
  - title: Vue Router Guide：Composition API 中读取 route
    url: https://router.vuejs.org/guide/advanced/composition-api.html
  - title: Vue Router Guide：地址编码迁移约定
    url: https://router.vuejs.org/guide/migration
  - title: "Vue Router 官方 discussion #2118：START_LOCATION 与 isReady()"
    url: https://github.com/vuejs/router/discussions/2118
  - title: Vue Router 5.2.0 route-location.ts 固定提交源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/typed-routes/route-location.ts
  - title: Vue Router 5.2.0 types/index.ts 固定提交源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/types/index.ts
  - title: Vue Router 5.2.0 location.ts 固定提交源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/location.ts
  - title: Vue Router 5.2.0 router.ts 固定提交源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/router.ts
group: matching
signature: |-
  interface _RouteLocationBase
    extends Pick<MatcherLocation, 'name' | 'path' | 'params' | 'meta'> {
    fullPath: string
    query: LocationQuery
    hash: string
    redirectedFrom: RouteLocation | undefined
  }

  interface LocationAsRelativeRaw {
    name?: RouteRecordNameGeneric
    path?: undefined
    params?: RouteParamsRawGeneric
  }

  interface RouteLocationAsPathGeneric extends RouteQueryAndHash, RouteLocationOptions {
    path: string
  }

  interface RouteLocationAsRelativeGeneric extends RouteQueryAndHash, RouteLocationOptions {
    name?: RouteRecordNameGeneric
    params?: RouteParamsRawGeneric
    path?: undefined
  }

  interface RouteLocationGeneric extends _RouteLocationBase, RouteLocationOptions {
    matched: RouteRecord[]
  }

  interface RouteLocationMatched extends RouteRecordNormalized {
    components: Record<string, RouteComponent> | null | undefined
  }

  interface RouteLocationNamedRaw
    extends RouteQueryAndHash, LocationAsRelativeRaw, RouteLocationOptions {}

  interface RouteLocationNormalizedGeneric extends _RouteLocationBase {
    name: RouteRecordNameGeneric
    matched: RouteRecordNormalized[]
  }

  interface RouteLocationNormalizedLoadedGeneric extends RouteLocationNormalizedGeneric {
    matched: RouteLocationMatched[]
  }

  interface RouteLocationOptions {
    replace?: boolean
    force?: boolean
    state?: HistoryState
  }

  interface RouteLocationPathRaw
    extends RouteQueryAndHash, MatcherLocationAsPath, RouteLocationOptions {}

  interface RouteLocationResolvedGeneric extends RouteLocationGeneric {
    href: string
  }

  type RouteLocation<Name extends keyof RouteMap = keyof RouteMap> =
    RouteMapGeneric extends RouteMap
      ? RouteLocationGeneric
      : RouteLocationTypedList<RouteMap>[Name]

  type RouteLocationAsPath<Name extends keyof RouteMap = keyof RouteMap> =
    RouteMapGeneric extends RouteMap
      ? RouteLocationAsPathGeneric
      : RouteLocationAsPathTypedList<RouteMap>[Name]

  type RouteLocationAsRelative<Name extends keyof RouteMap = keyof RouteMap> =
    RouteMapGeneric extends RouteMap
      ? RouteLocationAsRelativeGeneric
      : RouteLocationAsRelativeTypedList<RouteMap>[Name]

  type RouteLocationAsString<Name extends keyof RouteMap = keyof RouteMap> =
    RouteMapGeneric extends RouteMap
      ? string
      : _LiteralUnion<RouteLocationAsStringTypedList<RouteMap>[Name], string>

  type RouteLocationNormalized<Name extends keyof RouteMap = keyof RouteMap> =
    RouteMapGeneric extends RouteMap
      ? RouteLocationNormalizedGeneric
      : RouteLocationNormalizedTypedList<RouteMap>[Name]

  type RouteLocationNormalizedLoaded<Name extends keyof RouteMap = keyof RouteMap> =
    RouteMapGeneric extends RouteMap
      ? RouteLocationNormalizedLoadedGeneric
      : RouteLocationNormalizedLoadedTypedList<RouteMap>[Name]

  type RouteLocationRaw<Name extends keyof RouteMap = keyof RouteMap> =
    RouteMapGeneric extends RouteMap
      ? RouteLocationAsString | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric
      : | _LiteralUnion<RouteLocationAsStringTypedList<RouteMap>[Name], string>
        | RouteLocationAsRelativeTypedList<RouteMap>[Name]
        | RouteLocationAsPathTypedList<RouteMap>[Name]

  type RouteLocationResolved<Name extends keyof RouteMap = keyof RouteMap> =
    RouteMapGeneric extends RouteMap
      ? RouteLocationResolvedGeneric
      : RouteLocationResolvedTypedList<RouteMap>[Name]

  declare const START_LOCATION: RouteLocationNormalizedLoaded
anchors:
  - 概述
  - 地址状态与选择入口
  - Internal Route Location Base
  - Location As Relative Raw
  - Route Location As Path Generic
  - Route Location As Relative Generic
  - Route Location Generic
  - Route Location Matched
  - Route Location Named Raw
  - Route Location Normalized Generic
  - Route Location Normalized Loaded Generic
  - Route Location Options
  - Route Location Path Raw
  - Route Location Resolved Generic
  - Route Location
  - Route Location As Path
  - Route Location As Relative
  - Route Location As String
  - Route Location Normalized
  - Route Location Normalized Loaded
  - Route Location Raw
  - Route Location Resolved
  - START LOCATION
  - 易错使用提示
  - 源码推导与适用场景
---

# Route Locations

## 一、概述

Route location 不是单一对象类型，而是地址在不同阶段的类型家族。应用把 `RouteLocationRaw` 交给 `push()`、`replace()`、`resolve()` 或 RouterLink；matcher 解析出 path、params、records 与 meta；导航再排除 redirect records、加载异步组件，最终把 `RouteLocationNormalizedLoaded` 提交给 `currentRoute`、守卫和 RouterView。

:::tip
未声明 `RouteMap` 时，公开别名回退到本页的 Generic 接口；启用 typed routes 后，同一别名会按 route name 选择 TypedList 中的成员。业务 API 优先暴露公开别名，不要把 Generic 或 internal 基础类型误当成唯一入口。
:::

## 二、地址状态与选择入口

| 需求 | 首选类型 | 关键边界 |
| --- | --- | --- |
| 声明可导航输入 | RouteLocationRaw | 字符串、命名/相对对象、path 对象的联合 |
| 只接受 path 对象 | RouteLocationAsPath | `path` 已编码；可附带 query、hash 与导航选项 |
| 按当前地址或 name 改字段 | RouteLocationAsRelative | 没有 path；可提供 params、query、hash |
| 读取 matcher 解析结果 | RouteLocation | `matched` 仍可能含 redirect 或懒加载组件 |
| 读取守卫目标 | RouteLocationNormalized | `matched` 已排除 redirect records |
| 读取 currentRoute / 渲染目标 | RouteLocationNormalizedLoaded | 懒加载组件已解析 |
| 生成 href、不发起导航 | RouteLocationResolved | `router.resolve()` 增加 `href` |

## 三、Internal Route Location Base

~~~~ts
interface _RouteLocationBase
  extends Pick<MatcherLocation, 'name' | 'path' | 'params' | 'meta'> {
  fullPath: string
  query: LocationQuery
  hash: string
  redirectedFrom: RouteLocation | undefined
}
~~~~

:::warning
`_RouteLocationBase` 在固定源码中标记 `@internal`，只为已解析地址共享字段。应用层不要导入、扩展或断言它；根据阶段改用 `RouteLocation`、`RouteLocationNormalized` 或 `RouteLocationNormalizedLoaded`。
:::

## 四、Location As Relative Raw

~~~~ts
interface LocationAsRelativeRaw {
  name?: RouteRecordNameGeneric
  path?: undefined
  params?: RouteParamsRawGeneric
}
~~~~

:::warning
`LocationAsRelativeRaw` 是 `@internal` 的组合片段，`path?: undefined` 用来排除 path 分支。应用层使用公开的 `RouteLocationAsRelative` 或总入口 `RouteLocationRaw`，不要围绕这个片段建立公共契约。
:::

## 五、Route Location As Path Generic

~~~~ts
interface RouteLocationAsPathGeneric
  extends RouteQueryAndHash, RouteLocationOptions {
  path: string
}
~~~~

无 `RouteMap` 时的 path 对象形态。`path` 是百分号编码后的 pathname；`query` 与 `hash` 仍按未编码值传入。需要让 Router 根据动态参数编码并生成 path 时，优先使用 name + params 的相对地址。

## 六、Route Location As Relative Generic

~~~~ts
interface RouteLocationAsRelativeGeneric
  extends RouteQueryAndHash, RouteLocationOptions {
  name?: RouteRecordNameGeneric
  params?: RouteParamsRawGeneric
  path?: undefined
}
~~~~

无 `RouteMap` 时的命名/相对对象。提供 `name` 时 matcher 按名称找 record；省略 name 与 path 时，matcher 以当前位置为基础合并 params。它适合保留当前 record、只改变 params/query/hash，也适合明确 name 让 Router 负责参数编码。

## 七、Route Location Generic

~~~~ts
interface RouteLocationGeneric extends _RouteLocationBase, RouteLocationOptions {
  matched: RouteRecord[]
}
~~~~

`RouteLocation` 的未类型化回退。它已经有规范化的 path、params、query、hash、fullPath 与合并 meta，但 `matched` 保存加入 matcher 时的 `RouteRecord[]`，仍可能含 redirect records 或懒加载组件，不能直接当作 RouterView 的最终渲染清单。

## 八、Route Location Matched

~~~~ts
interface RouteLocationMatched extends RouteRecordNormalized {
  components: Record<string, RouteComponent> | null | undefined
}
~~~~

表示完成组件加载、可用于渲染的单条 normalized record。它把 `components` 收窄为普通 `RouteComponent`，不再允许 lazy loader；只在 `RouteLocationNormalizedLoaded.matched` 中出现。

## 九、Route Location Named Raw

~~~~ts
interface RouteLocationNamedRaw
  extends RouteQueryAndHash, LocationAsRelativeRaw, RouteLocationOptions {}
~~~~

:::warning
`RouteLocationNamedRaw` 在固定声明中标记 `@internal`。它只是 name/params、query/hash 与导航选项的低层交叉类型；应用代码使用 `RouteLocationAsRelative` 或 `RouteLocationRaw`，不要直接依赖此内部名称。
:::

## 十、Route Location Normalized Generic

~~~~ts
interface RouteLocationNormalizedGeneric extends _RouteLocationBase {
  name: RouteRecordNameGeneric
  matched: RouteRecordNormalized[]
}
~~~~

`RouteLocationNormalized` 的未类型化回退。与 `RouteLocationGeneric` 相比，它不携带导航选项，`matched` 已是 `RouteRecordNormalized[]` 且不含 redirect records；但 lazy components 不保证已经加载。

## 十一、Route Location Normalized Loaded Generic

~~~~ts
interface RouteLocationNormalizedLoadedGeneric
  extends RouteLocationNormalizedGeneric {
  matched: RouteLocationMatched[]
}
~~~~

`RouteLocationNormalizedLoaded` 的未类型化回退。`matched` 中异步组件已经解析并替换为普通组件，也不含 redirect records；它是 `router.currentRoute.value`、已完成导航守卫参数与 RouterView 渲染所需的最终形态。

## 十二、Route Location Options

~~~~ts
interface RouteLocationOptions {
  replace?: boolean
  force?: boolean
  state?: HistoryState
}
~~~~

| 选项 | 含义 | 注意 |
| --- | --- | --- |
| replace | 替换当前 history 条目 | 不新增可后退条目 |
| force | 相同地址也执行导航 | 除非同时 replace，否则仍新增 history 条目 |
| state | 写入 History API state | 必须可结构化克隆，不能含响应式值或 Symbol |

## 十三、Route Location Path Raw

~~~~ts
interface RouteLocationPathRaw
  extends RouteQueryAndHash, MatcherLocationAsPath, RouteLocationOptions {}
~~~~

:::warning
`RouteLocationPathRaw` 在固定声明中标记 `@internal`，是 matcher path、query/hash 与导航选项的低层组合。应用层使用公开的 `RouteLocationAsPath` 或 `RouteLocationRaw`，不要以该内部接口作为组件 prop 或库 API。
:::

## 十四、Route Location Resolved Generic

~~~~ts
interface RouteLocationResolvedGeneric extends RouteLocationGeneric {
  href: string
}
~~~~

`RouteLocationResolved` 的未类型化回退。`router.resolve()` 在 matcher 结果上增加考虑 history base 的 `href`，但不会运行守卫、写 history、更新 currentRoute 或加载 matched 中的懒组件。

## 十五、Route Location

~~~~ts
type RouteLocation<Name extends keyof RouteMap = keyof RouteMap> =
  RouteMapGeneric extends RouteMap
    ? RouteLocationGeneric
    : RouteLocationTypedList<RouteMap>[Name]
~~~~

raw 地址经过 matcher 解析后的公开别名。未配置 typed routes 时等于 `RouteLocationGeneric`；配置 `RouteMap` 后按 `Name` 联合出精确 name 与 params。需要渲染保证时继续收窄到 NormalizedLoaded。

## 十六、Route Location As Path

~~~~ts
type RouteLocationAsPath<Name extends keyof RouteMap = keyof RouteMap> =
  RouteMapGeneric extends RouteMap
    ? RouteLocationAsPathGeneric
    : RouteLocationAsPathTypedList<RouteMap>[Name]
~~~~

~~~~ts
import type { RouteLocationAsPath } from 'vue-router'

const reports: RouteLocationAsPath = {
  path: '/reports/weekly',
  query: { format: 'compact' },
  hash: '#totals',
}
~~~~

## 十七、Route Location As Relative

~~~~ts
type RouteLocationAsRelative<Name extends keyof RouteMap = keyof RouteMap> =
  RouteMapGeneric extends RouteMap
    ? RouteLocationAsRelativeGeneric
    : RouteLocationAsRelativeTypedList<RouteMap>[Name]
~~~~

~~~~ts
import type { RouteLocationAsRelative } from 'vue-router'

const user: RouteLocationAsRelative = {
  name: 'user',
  params: { username: 'Ada Lovelace' },
  query: { tab: 'activity' },
}
~~~~

## 十八、Route Location As String

~~~~ts
type RouteLocationAsString<Name extends keyof RouteMap = keyof RouteMap> =
  RouteMapGeneric extends RouteMap
    ? string
    : _LiteralUnion<RouteLocationAsStringTypedList<RouteMap>[Name], string>
~~~~

字符串地址可以包含 path、query 与 hash，也能相对当前 path 解析。传入字符串或对象 `path` 时调用方负责 pathname 编码；若动态值来自业务数据，name + params 通常更安全，并能利用 typed routes。

## 十九、Route Location Normalized

~~~~ts
type RouteLocationNormalized<Name extends keyof RouteMap = keyof RouteMap> =
  RouteMapGeneric extends RouteMap
    ? RouteLocationNormalizedGeneric
    : RouteLocationNormalizedTypedList<RouteMap>[Name]
~~~~

公开的规范化地址别名。它适合 matcher 完成、redirect records 已排除，但组件加载尚未承诺完成的导航中间阶段。守卫签名会按具体时序同时使用 Normalized 与 NormalizedLoaded。

## 二十、Route Location Normalized Loaded

~~~~ts
type RouteLocationNormalizedLoaded<Name extends keyof RouteMap = keyof RouteMap> =
  RouteMapGeneric extends RouteMap
    ? RouteLocationNormalizedLoadedGeneric
    : RouteLocationNormalizedLoadedTypedList<RouteMap>[Name]
~~~~

公开的可渲染地址别名。`router.currentRoute` 是 `ShallowRef&lt;RouteLocationNormalizedLoaded&gt;`；等待导航或首次 `isReady()` 后读取它，才能把 matched components 当作已加载组件。

## 二十一、Route Location Raw

~~~~ts
type RouteLocationRaw<Name extends keyof RouteMap = keyof RouteMap> =
  RouteMapGeneric extends RouteMap
    ? RouteLocationAsString | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric
    : | _LiteralUnion<RouteLocationAsStringTypedList<RouteMap>[Name], string>
      | RouteLocationAsRelativeTypedList<RouteMap>[Name]
      | RouteLocationAsPathTypedList<RouteMap>[Name]
~~~~

用户侧导航输入的总联合，覆盖字符串、name/params 相对对象与 path 对象。库或组件只要把值转交给 Router，通常以此作为参数类型，不要自行复制联合成员。

~~~~ts
import type { RouteLocationRaw } from 'vue-router'

const destinations: RouteLocationRaw[] = [
  '/help',
  { name: 'user', params: { username: 'Ada Lovelace' } },
  { path: '/search', query: { q: 'router' }, replace: true },
]
~~~~

## 二十二、Route Location Resolved

~~~~ts
type RouteLocationResolved<Name extends keyof RouteMap = keyof RouteMap> =
  RouteMapGeneric extends RouteMap
    ? RouteLocationResolvedGeneric
    : RouteLocationResolvedTypedList<RouteMap>[Name]
~~~~

~~~~ts
const target = router.resolve({
  name: 'user',
  params: { username: 'Ada Lovelace' },
})

console.log(target.fullPath, target.href)
~~~~

`fullPath` 是应用内已编码地址，`href` 还应用了 history base，可直接用于链接。解析是同步计算，不代表导航已经成功，也不保证懒组件已经加载。

## 二十三、START LOCATION

~~~~ts
declare const START_LOCATION: RouteLocationNormalizedLoaded
~~~~

`START_LOCATION` 是 Router 创建后的共享“尚未导航”对象，初值为 `/`、空 params/query/matched/meta。官方 API 用 `from === START_LOCATION` 识别首次导航；它不是普通首页，也不应通过字段形状猜测。SSR 或依赖首个真实 route 的初始化要先显式 push 并等待 `router.isReady()`。

## 二十四、易错使用提示

:::pitfalls
### 同时传 path 与 params，期待 Router 把参数插入 path

**触发条件：** 同时传 path 与 params，期待 Router 把参数插入 path

**原因：** 官方 Programmatic Navigation 明确说明：提供 `path` 时 `params` 会被忽略；固定源码也只在 path 分支解析 pathname。

**后果：** 导航停在 `/users`，动态 username 没有进入 URL，页面读取到的 params 与调用意图不符。

**错误示例：**

~~~~ts
router.push({
  path: '/users',
  params: { username: 'Ada Lovelace' },
})
~~~~

**正确写法：**

~~~~ts
router.push({
  name: 'user',
  params: { username: 'Ada Lovelace' },
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 把未编码业务值直接拼进字符串或 path

**触发条件：** 把未编码业务值直接拼进字符串或 path

**原因：** 官方迁移 Guide 规定字符串地址和对象 path 必须已经编码，而 params、query、hash 应传未编码值。name + params 会让 Router 负责参数编码。

**后果：** 空格、斜杠、问号或非 ASCII 字符可能改变 URL 分段，产生错误匹配或重复编码。

**错误示例：**

~~~~ts
router.push(`/users/${username}`)
~~~~

**正确写法：**

~~~~ts
router.push({
  name: 'user',
  params: { username },
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 对象地址的 hash 忘记前导 #

**触发条件：** 对象地址的 hash 忘记前导 #

**原因：** 官方导航示例使用 `hash: "#team"`；5.2.0 固定源码也会在开发环境诊断不以 `#` 开头的 hash。

**后果：** 生成的 fullPath 不是预期 fragment，滚动定位与复制当前 hash 的行为都可能失真。

**错误示例：**

~~~~ts
router.push({
  name: 'about',
  hash: 'team',
})
~~~~

**正确写法：**

~~~~ts
router.push({
  name: 'about',
  hash: '#team',
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 force 刷新相同地址，却忽略它会新增 history 条目

**触发条件：** 用 force 刷新相同地址，却忽略它会新增 history 条目

**原因：** `RouteLocationOptions.force` 会绕过重复导航判断；官方 API 明确提示，未同时设置 `replace: true` 时仍会 push 新条目。

**后果：** 用户按后退键仍停在同一 URL，重复刷新还会不断增长 history 栈。

**错误示例：**

~~~~ts
await router.push({
  name: 'dashboard',
  force: true,
})
~~~~

**正确写法：**

~~~~ts
await router.push({
  name: 'dashboard',
  force: true,
  replace: true,
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 把响应式对象或 Symbol 塞进 navigation state

**触发条件：** 把响应式对象或 Symbol 塞进 navigation state

**原因：** 官方 `RouteLocationOptions` API 要求 state 满足 History API 的结构化克隆边界，明确排除响应式值和 Symbol 等类型。

**后果：** history 写入可能抛出克隆错误，或保存的状态无法按应用预期恢复。

**错误示例：**

~~~~ts
router.push({
  name: 'report',
  state: { draft: reactiveDraft, marker: Symbol('draft') },
})
~~~~

**正确写法：**

~~~~ts
router.push({
  name: 'report',
  state: { reportId: reactiveDraft.id, mode: 'draft' },
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 router.resolve() 的结果当成已导航、已加载 route

**触发条件：** 把 router.resolve() 的结果当成已导航、已加载 route

**原因：** `RouteLocationResolved` 只比 matcher 结果多 `href`；固定 `resolve()` 不运行守卫、不提交 currentRoute，也不加载懒组件。

**后果：** 权限与重定向尚未结算，matched 中的组件还可能是 loader，却被代码提前当作可渲染结果。

**错误示例：**

~~~~ts
const target = router.resolve({ name: 'reports' })
renderMatched(target.matched)
~~~~

**正确写法：**

~~~~ts
const failure = await router.push({ name: 'reports' })

if (!failure) {
  renderMatched(router.currentRoute.value.matched)
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 侦听整个响应式 route，而不是所需字段

**触发条件：** 侦听整个响应式 route，而不是所需字段

**原因：** 官方 Composition API Guide 建议直接侦听预期变化的属性，避免把完整 route 对象作为宽泛依赖。

**后果：** query、hash 或 meta 等无关变化也会触发请求，依赖意图不清晰且更难取消过期工作。

**错误示例：**

~~~~ts
const route = useRoute()

watch(route, () => fetchUser(route.params.id))
~~~~

**正确写法：**

~~~~ts
const route = useRoute()

watch(
  () => route.params.id,
  (id) => fetchUser(id),
)
~~~~

**验证方式：** 对照正确写法验证结果。

### 通过字段形状判断 START_LOCATION 或把它当作首页

**触发条件：** 通过字段形状判断 START_LOCATION 或把它当作首页

**原因：** 官方 API 示例使用对象身份 `from === START_LOCATION`；官方 discussion #2118 也将其描述为首次导航完成前的 nowhere location。

**后果：** 真实 `/` 路由或测试构造对象可能被误判为首航，SSR 还可能在真实 matched records 就绪前渲染空页面。

**错误示例：**

~~~~ts
router.beforeEach((to, from) => {
  if (from.fullPath === '/' && from.matched.length === 0) {
    startSession()
  }
})
~~~~

**正确写法：**

~~~~ts
import { START_LOCATION } from 'vue-router'

router.beforeEach((to, from) => {
  if (from === START_LOCATION) startSession()
})
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 二十五、源码推导与适用场景

:::steps
### 1. 公开别名是 typed routes 的稳定切换点

固定 `route-location.ts` 的公开别名都先判断 `RouteMapGeneric extends RouteMap`：没有 route map 时落到 Generic，有 route map 时按 Name 索引 TypedList。组件 prop、工具函数和库 API 应优先写公开别名，让类型增强无需改调用契约。

### 2. Raw 联合按字符串、path、relative 三路进入 resolve

固定 `router.ts` 对字符串先 parseURL；对象有 path 时解析 path；否则编码 params 并让 matcher 结合 name 或当前位置解析。通用跳转参数适合 RouteLocationRaw，明确只接受一种对象形态时再使用 AsPath 或 AsRelative。

### 3. path 与 params 的所有权互斥

path 分支直接把解析后的 pathname 交给 matcher，relative 分支才清理、编码和合并 params。表单或菜单拥有 route name 与业务参数时用 name + params；已经拥有完整 URL pathname 时用 path，并由调用方负责编码。

### 4. Resolved 只增加链接语义

固定 `resolve()` 合并 normalized URL、matcher result、`redirectedFrom: undefined` 和 history 创建的 href 后立即返回。生成 `&lt;a&gt;` 地址、预览目标和比较地址适合 resolve；需要守卫、redirect、history 与 currentRoute 提交则必须 push/replace。

### 5. Normalized 与 Loaded 以组件可用性分界

固定类型把 Normalized 的 matched 写成 `RouteRecordNormalized[]`，Loaded 则收窄为 `RouteLocationMatched[]`，其 components 不再含 lazy loader。导航守卫中按签名使用传入值；直接渲染或读取 currentRoute 时等待导航完成。

### 6. 导航选项随 raw 地址进入 push 管线

固定 `pushWithRedirect()` 从输入提取 state、force、replace；force 控制重复地址短路，replace 控制 history 写入方式，state 交给 history。刷新相同地址但不留重复记录时组合 force + replace，普通替换只用 replace。

### 7. START_LOCATION 是身份哨兵

固定 `location.ts` 创建单一 START_LOCATION_NORMALIZED，根入口再导出为 START_LOCATION；Router 也以同一对象初始化 currentRoute。首航守卫用严格身份比较，SSR、测试和首次数据初始化则通过显式初始导航与 isReady 建立真实 route。

### 8. 四个 internal 名称只描述实现拼装

`_RouteLocationBase`、`LocationAsRelativeRaw`、`RouteLocationNamedRaw`、`RouteLocationPathRaw` 在固定声明中带 `@internal`。它们适合阅读源码关系，不适合应用导入；公开替代依次是 RouteLocation 家族、RouteLocationAsRelative、RouteLocationRaw 与 RouteLocationAsPath。
:::
