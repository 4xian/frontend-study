/**
 * Vue Router 参考：Route Locations 类型家族与 START_LOCATION
 * 查证来源（2026-08-04）：
 * - https://router.vuejs.org/api/
 * - https://router.vuejs.org/api/type-aliases/routelocationraw
 * - https://router.vuejs.org/api/type-aliases/routelocationnormalizedloaded
 * - https://router.vuejs.org/api/interfaces/routelocationoptions
 * - https://router.vuejs.org/api/variables/start_location
 * - https://router.vuejs.org/guide/essentials/navigation.html
 * - https://router.vuejs.org/guide/advanced/composition-api.html
 * - https://router.vuejs.org/guide/migration
 * - https://github.com/vuejs/router/discussions/2118
 * - https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/typed-routes/route-location.ts
 * - https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/types/index.ts
 * - https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/location.ts
 * - https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/router.ts
 * 查证工具：Tavily、Vue Router 官方 API/Guide、官方 discussion、固定提交源码与本地 5.2.0 声明
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'vue.router.reference.matching.route-locations',
  type: 'reference',
  title: 'Route Locations',
  summary:
    '区分导航输入、matcher 结果、规范化地址、已加载地址与 href 解析结果，并说明 START_LOCATION 的首航边界',
  ecosystem: 'vue',
  module: 'router',
  collection: 'matching',
  related: [
    'vue.router.reference.configuration.create-router',
    'vue.router.reference.configuration.router-instance',
    'vue.router.reference.configuration.history',
    'vue.router.learn.basics.composition-programmatic-navigation',
    'vue.router.learn.basics.route-params-query-matching',
  ],
  tags: [
    'Vue Router',
    'RouteLocationRaw',
    'RouteLocationNormalized',
    'RouteLocationResolved',
    'START_LOCATION',
  ],
  sources: [
    {
      title: 'Vue Router API：Route Locations 总览',
      url: 'https://router.vuejs.org/api/',
    },
    {
      title: 'Vue Router API：RouteLocationRaw',
      url: 'https://router.vuejs.org/api/type-aliases/routelocationraw',
    },
    {
      title: 'Vue Router API：RouteLocation',
      url: 'https://router.vuejs.org/api/type-aliases/routelocation',
    },
    {
      title: 'Vue Router API：RouteLocationNormalizedLoaded',
      url: 'https://router.vuejs.org/api/type-aliases/routelocationnormalizedloaded',
    },
    {
      title: 'Vue Router API：RouteLocationResolved',
      url: 'https://router.vuejs.org/api/type-aliases/routelocationresolved',
    },
    {
      title: 'Vue Router API：RouteLocationOptions',
      url: 'https://router.vuejs.org/api/interfaces/routelocationoptions',
    },
    {
      title: 'Vue Router API：START_LOCATION',
      url: 'https://router.vuejs.org/api/variables/start_location',
    },
    {
      title: 'Vue Router Guide：Programmatic Navigation',
      url: 'https://router.vuejs.org/guide/essentials/navigation.html',
    },
    {
      title: 'Vue Router Guide：Composition API 中读取 route',
      url: 'https://router.vuejs.org/guide/advanced/composition-api.html',
    },
    {
      title: 'Vue Router Guide：地址编码迁移约定',
      url: 'https://router.vuejs.org/guide/migration',
    },
    {
      title: 'Vue Router 官方 discussion #2118：START_LOCATION 与 isReady()',
      url: 'https://github.com/vuejs/router/discussions/2118',
    },
    {
      title: 'Vue Router 5.2.0 route-location.ts 固定提交源码',
      url: 'https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/typed-routes/route-location.ts',
    },
    {
      title: 'Vue Router 5.2.0 types/index.ts 固定提交源码',
      url: 'https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/types/index.ts',
    },
    {
      title: 'Vue Router 5.2.0 location.ts 固定提交源码',
      url: 'https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/location.ts',
    },
    {
      title: 'Vue Router 5.2.0 router.ts 固定提交源码',
      url: 'https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/router.ts',
    },
  ],
  appliesTo: 'Vue Router 5.2.0',
  verifiedAt: '2026-08-04',
  anchors: [
    '概述',
    '地址状态与选择入口',
    'Internal Route Location Base',
    'Location As Relative Raw',
    'Route Location As Path Generic',
    'Route Location As Relative Generic',
    'Route Location Generic',
    'Route Location Matched',
    'Route Location Named Raw',
    'Route Location Normalized Generic',
    'Route Location Normalized Loaded Generic',
    'Route Location Options',
    'Route Location Path Raw',
    'Route Location Resolved Generic',
    'Route Location',
    'Route Location As Path',
    'Route Location As Relative',
    'Route Location As String',
    'Route Location Normalized',
    'Route Location Normalized Loaded',
    'Route Location Raw',
    'Route Location Resolved',
    'START LOCATION',
    '易错使用提示',
    '源码推导与适用场景',
  ],
})

export default defineReference({
  meta,
  signature: `interface _RouteLocationBase
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

declare const START_LOCATION: RouteLocationNormalizedLoaded`,
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        'Route location 不是单一对象类型，而是地址在不同阶段的类型家族。应用把 `RouteLocationRaw` 交给 `push()`、`replace()`、`resolve()` 或 RouterLink；matcher 解析出 path、params、records 与 meta；导航再排除 redirect records、加载异步组件，最终把 `RouteLocationNormalizedLoaded` 提交给 `currentRoute`、守卫和 RouterView。',
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '未声明 `RouteMap` 时，公开别名回退到本页的 Generic 接口；启用 typed routes 后，同一别名会按 route name 选择 TypedList 中的成员。业务 API 优先暴露公开别名，不要把 Generic 或 internal 基础类型误当成唯一入口。',
    },
    { type: 'heading', content: '地址状态与选择入口' },
    {
      type: 'table',
      headers: ['需求', '首选类型', '关键边界'],
      rows: [
        ['声明可导航输入', 'RouteLocationRaw', '字符串、命名/相对对象、path 对象的联合'],
        ['只接受 path 对象', 'RouteLocationAsPath', '`path` 已编码；可附带 query、hash 与导航选项'],
        [
          '按当前地址或 name 改字段',
          'RouteLocationAsRelative',
          '没有 path；可提供 params、query、hash',
        ],
        ['读取 matcher 解析结果', 'RouteLocation', '`matched` 仍可能含 redirect 或懒加载组件'],
        ['读取守卫目标', 'RouteLocationNormalized', '`matched` 已排除 redirect records'],
        ['读取 currentRoute / 渲染目标', 'RouteLocationNormalizedLoaded', '懒加载组件已解析'],
        ['生成 href、不发起导航', 'RouteLocationResolved', '`router.resolve()` 增加 `href`'],
      ],
    },
    { type: 'heading', content: 'Internal Route Location Base' },
    {
      type: 'code',
      lang: 'ts',
      content: `interface _RouteLocationBase
  extends Pick<MatcherLocation, 'name' | 'path' | 'params' | 'meta'> {
  fullPath: string
  query: LocationQuery
  hash: string
  redirectedFrom: RouteLocation | undefined
}`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`_RouteLocationBase` 在固定源码中标记 `@internal`，只为已解析地址共享字段。应用层不要导入、扩展或断言它；根据阶段改用 `RouteLocation`、`RouteLocationNormalized` 或 `RouteLocationNormalizedLoaded`。',
    },
    { type: 'heading', content: 'Location As Relative Raw' },
    {
      type: 'code',
      lang: 'ts',
      content: `interface LocationAsRelativeRaw {
  name?: RouteRecordNameGeneric
  path?: undefined
  params?: RouteParamsRawGeneric
}`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`LocationAsRelativeRaw` 是 `@internal` 的组合片段，`path?: undefined` 用来排除 path 分支。应用层使用公开的 `RouteLocationAsRelative` 或总入口 `RouteLocationRaw`，不要围绕这个片段建立公共契约。',
    },
    { type: 'heading', content: 'Route Location As Path Generic' },
    {
      type: 'code',
      lang: 'ts',
      content: `interface RouteLocationAsPathGeneric
  extends RouteQueryAndHash, RouteLocationOptions {
  path: string
}`,
    },
    {
      type: 'text',
      content:
        '无 `RouteMap` 时的 path 对象形态。`path` 是百分号编码后的 pathname；`query` 与 `hash` 仍按未编码值传入。需要让 Router 根据动态参数编码并生成 path 时，优先使用 name + params 的相对地址。',
    },
    { type: 'heading', content: 'Route Location As Relative Generic' },
    {
      type: 'code',
      lang: 'ts',
      content: `interface RouteLocationAsRelativeGeneric
  extends RouteQueryAndHash, RouteLocationOptions {
  name?: RouteRecordNameGeneric
  params?: RouteParamsRawGeneric
  path?: undefined
}`,
    },
    {
      type: 'text',
      content:
        '无 `RouteMap` 时的命名/相对对象。提供 `name` 时 matcher 按名称找 record；省略 name 与 path 时，matcher 以当前位置为基础合并 params。它适合保留当前 record、只改变 params/query/hash，也适合明确 name 让 Router 负责参数编码。',
    },
    { type: 'heading', content: 'Route Location Generic' },
    {
      type: 'code',
      lang: 'ts',
      content: `interface RouteLocationGeneric extends _RouteLocationBase, RouteLocationOptions {
  matched: RouteRecord[]
}`,
    },
    {
      type: 'text',
      content:
        '`RouteLocation` 的未类型化回退。它已经有规范化的 path、params、query、hash、fullPath 与合并 meta，但 `matched` 保存加入 matcher 时的 `RouteRecord[]`，仍可能含 redirect records 或懒加载组件，不能直接当作 RouterView 的最终渲染清单。',
    },
    { type: 'heading', content: 'Route Location Matched' },
    {
      type: 'code',
      lang: 'ts',
      content: `interface RouteLocationMatched extends RouteRecordNormalized {
  components: Record<string, RouteComponent> | null | undefined
}`,
    },
    {
      type: 'text',
      content:
        '表示完成组件加载、可用于渲染的单条 normalized record。它把 `components` 收窄为普通 `RouteComponent`，不再允许 lazy loader；只在 `RouteLocationNormalizedLoaded.matched` 中出现。',
    },
    { type: 'heading', content: 'Route Location Named Raw' },
    {
      type: 'code',
      lang: 'ts',
      content: `interface RouteLocationNamedRaw
  extends RouteQueryAndHash, LocationAsRelativeRaw, RouteLocationOptions {}`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`RouteLocationNamedRaw` 在固定声明中标记 `@internal`。它只是 name/params、query/hash 与导航选项的低层交叉类型；应用代码使用 `RouteLocationAsRelative` 或 `RouteLocationRaw`，不要直接依赖此内部名称。',
    },
    { type: 'heading', content: 'Route Location Normalized Generic' },
    {
      type: 'code',
      lang: 'ts',
      content: `interface RouteLocationNormalizedGeneric extends _RouteLocationBase {
  name: RouteRecordNameGeneric
  matched: RouteRecordNormalized[]
}`,
    },
    {
      type: 'text',
      content:
        '`RouteLocationNormalized` 的未类型化回退。与 `RouteLocationGeneric` 相比，它不携带导航选项，`matched` 已是 `RouteRecordNormalized[]` 且不含 redirect records；但 lazy components 不保证已经加载。',
    },
    { type: 'heading', content: 'Route Location Normalized Loaded Generic' },
    {
      type: 'code',
      lang: 'ts',
      content: `interface RouteLocationNormalizedLoadedGeneric
  extends RouteLocationNormalizedGeneric {
  matched: RouteLocationMatched[]
}`,
    },
    {
      type: 'text',
      content:
        '`RouteLocationNormalizedLoaded` 的未类型化回退。`matched` 中异步组件已经解析并替换为普通组件，也不含 redirect records；它是 `router.currentRoute.value`、已完成导航守卫参数与 RouterView 渲染所需的最终形态。',
    },
    { type: 'heading', content: 'Route Location Options' },
    {
      type: 'code',
      lang: 'ts',
      content: `interface RouteLocationOptions {
  replace?: boolean
  force?: boolean
  state?: HistoryState
}`,
    },
    {
      type: 'table',
      headers: ['选项', '含义', '注意'],
      rows: [
        ['replace', '替换当前 history 条目', '不新增可后退条目'],
        ['force', '相同地址也执行导航', '除非同时 replace，否则仍新增 history 条目'],
        ['state', '写入 History API state', '必须可结构化克隆，不能含响应式值或 Symbol'],
      ],
    },
    { type: 'heading', content: 'Route Location Path Raw' },
    {
      type: 'code',
      lang: 'ts',
      content: `interface RouteLocationPathRaw
  extends RouteQueryAndHash, MatcherLocationAsPath, RouteLocationOptions {}`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`RouteLocationPathRaw` 在固定声明中标记 `@internal`，是 matcher path、query/hash 与导航选项的低层组合。应用层使用公开的 `RouteLocationAsPath` 或 `RouteLocationRaw`，不要以该内部接口作为组件 prop 或库 API。',
    },
    { type: 'heading', content: 'Route Location Resolved Generic' },
    {
      type: 'code',
      lang: 'ts',
      content: `interface RouteLocationResolvedGeneric extends RouteLocationGeneric {
  href: string
}`,
    },
    {
      type: 'text',
      content:
        '`RouteLocationResolved` 的未类型化回退。`router.resolve()` 在 matcher 结果上增加考虑 history base 的 `href`，但不会运行守卫、写 history、更新 currentRoute 或加载 matched 中的懒组件。',
    },
    { type: 'heading', content: 'Route Location' },
    {
      type: 'code',
      lang: 'ts',
      content: `type RouteLocation<Name extends keyof RouteMap = keyof RouteMap> =
  RouteMapGeneric extends RouteMap
    ? RouteLocationGeneric
    : RouteLocationTypedList<RouteMap>[Name]`,
    },
    {
      type: 'text',
      content:
        'raw 地址经过 matcher 解析后的公开别名。未配置 typed routes 时等于 `RouteLocationGeneric`；配置 `RouteMap` 后按 `Name` 联合出精确 name 与 params。需要渲染保证时继续收窄到 NormalizedLoaded。',
    },
    { type: 'heading', content: 'Route Location As Path' },
    {
      type: 'code',
      lang: 'ts',
      content: `type RouteLocationAsPath<Name extends keyof RouteMap = keyof RouteMap> =
  RouteMapGeneric extends RouteMap
    ? RouteLocationAsPathGeneric
    : RouteLocationAsPathTypedList<RouteMap>[Name]`,
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import type { RouteLocationAsPath } from 'vue-router'

const reports: RouteLocationAsPath = {
  path: '/reports/weekly',
  query: { format: 'compact' },
  hash: '#totals',
}`,
    },
    { type: 'heading', content: 'Route Location As Relative' },
    {
      type: 'code',
      lang: 'ts',
      content: `type RouteLocationAsRelative<Name extends keyof RouteMap = keyof RouteMap> =
  RouteMapGeneric extends RouteMap
    ? RouteLocationAsRelativeGeneric
    : RouteLocationAsRelativeTypedList<RouteMap>[Name]`,
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import type { RouteLocationAsRelative } from 'vue-router'

const user: RouteLocationAsRelative = {
  name: 'user',
  params: { username: 'Ada Lovelace' },
  query: { tab: 'activity' },
}`,
    },
    { type: 'heading', content: 'Route Location As String' },
    {
      type: 'code',
      lang: 'ts',
      content: `type RouteLocationAsString<Name extends keyof RouteMap = keyof RouteMap> =
  RouteMapGeneric extends RouteMap
    ? string
    : _LiteralUnion<RouteLocationAsStringTypedList<RouteMap>[Name], string>`,
    },
    {
      type: 'text',
      content:
        '字符串地址可以包含 path、query 与 hash，也能相对当前 path 解析。传入字符串或对象 `path` 时调用方负责 pathname 编码；若动态值来自业务数据，name + params 通常更安全，并能利用 typed routes。',
    },
    { type: 'heading', content: 'Route Location Normalized' },
    {
      type: 'code',
      lang: 'ts',
      content: `type RouteLocationNormalized<Name extends keyof RouteMap = keyof RouteMap> =
  RouteMapGeneric extends RouteMap
    ? RouteLocationNormalizedGeneric
    : RouteLocationNormalizedTypedList<RouteMap>[Name]`,
    },
    {
      type: 'text',
      content:
        '公开的规范化地址别名。它适合 matcher 完成、redirect records 已排除，但组件加载尚未承诺完成的导航中间阶段。守卫签名会按具体时序同时使用 Normalized 与 NormalizedLoaded。',
    },
    { type: 'heading', content: 'Route Location Normalized Loaded' },
    {
      type: 'code',
      lang: 'ts',
      content: `type RouteLocationNormalizedLoaded<Name extends keyof RouteMap = keyof RouteMap> =
  RouteMapGeneric extends RouteMap
    ? RouteLocationNormalizedLoadedGeneric
    : RouteLocationNormalizedLoadedTypedList<RouteMap>[Name]`,
    },
    {
      type: 'text',
      content:
        '公开的可渲染地址别名。`router.currentRoute` 是 `ShallowRef<RouteLocationNormalizedLoaded>`；等待导航或首次 `isReady()` 后读取它，才能把 matched components 当作已加载组件。',
    },
    { type: 'heading', content: 'Route Location Raw' },
    {
      type: 'code',
      lang: 'ts',
      content: `type RouteLocationRaw<Name extends keyof RouteMap = keyof RouteMap> =
  RouteMapGeneric extends RouteMap
    ? RouteLocationAsString | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric
    : | _LiteralUnion<RouteLocationAsStringTypedList<RouteMap>[Name], string>
      | RouteLocationAsRelativeTypedList<RouteMap>[Name]
      | RouteLocationAsPathTypedList<RouteMap>[Name]`,
    },
    {
      type: 'text',
      content:
        '用户侧导航输入的总联合，覆盖字符串、name/params 相对对象与 path 对象。库或组件只要把值转交给 Router，通常以此作为参数类型，不要自行复制联合成员。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import type { RouteLocationRaw } from 'vue-router'

const destinations: RouteLocationRaw[] = [
  '/help',
  { name: 'user', params: { username: 'Ada Lovelace' } },
  { path: '/search', query: { q: 'router' }, replace: true },
]`,
    },
    { type: 'heading', content: 'Route Location Resolved' },
    {
      type: 'code',
      lang: 'ts',
      content: `type RouteLocationResolved<Name extends keyof RouteMap = keyof RouteMap> =
  RouteMapGeneric extends RouteMap
    ? RouteLocationResolvedGeneric
    : RouteLocationResolvedTypedList<RouteMap>[Name]`,
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const target = router.resolve({
  name: 'user',
  params: { username: 'Ada Lovelace' },
})

console.log(target.fullPath, target.href)`,
    },
    {
      type: 'text',
      content:
        '`fullPath` 是应用内已编码地址，`href` 还应用了 history base，可直接用于链接。解析是同步计算，不代表导航已经成功，也不保证懒组件已经加载。',
    },
    { type: 'heading', content: 'START LOCATION' },
    {
      type: 'code',
      lang: 'ts',
      content: `declare const START_LOCATION: RouteLocationNormalizedLoaded`,
    },
    {
      type: 'text',
      content:
        '`START_LOCATION` 是 Router 创建后的共享“尚未导航”对象，初值为 `/`、空 params/query/matched/meta。官方 API 用 `from === START_LOCATION` 识别首次导航；它不是普通首页，也不应通过字段形状猜测。SSR 或依赖首个真实 route 的初始化要先显式 push 并等待 `router.isReady()`。',
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '同时传 path 与 params，期待 Router 把参数插入 path',
          description:
            '官方 Programmatic Navigation 明确说明：提供 `path` 时 `params` 会被忽略；固定源码也只在 path 分支解析 pathname。',
          consequence:
            '导航停在 `/users`，动态 username 没有进入 URL，页面读取到的 params 与调用意图不符。',
          wrong: {
            lang: 'ts',
            content: `router.push({
  path: '/users',
  params: { username: 'Ada Lovelace' },
})`,
          },
          correct: {
            lang: 'ts',
            content: `router.push({
  name: 'user',
  params: { username: 'Ada Lovelace' },
})`,
          },
        },
        {
          title: '把未编码业务值直接拼进字符串或 path',
          description:
            '官方迁移 Guide 规定字符串地址和对象 path 必须已经编码，而 params、query、hash 应传未编码值。name + params 会让 Router 负责参数编码。',
          consequence: '空格、斜杠、问号或非 ASCII 字符可能改变 URL 分段，产生错误匹配或重复编码。',
          wrong: {
            lang: 'ts',
            content: 'router.push(`/users/${username}`)',
          },
          correct: {
            lang: 'ts',
            content: `router.push({
  name: 'user',
  params: { username },
})`,
          },
        },
        {
          title: '对象地址的 hash 忘记前导 #',
          description:
            '官方导航示例使用 `hash: "#team"`；5.2.0 固定源码也会在开发环境诊断不以 `#` 开头的 hash。',
          consequence:
            '生成的 fullPath 不是预期 fragment，滚动定位与复制当前 hash 的行为都可能失真。',
          wrong: {
            lang: 'ts',
            content: `router.push({
  name: 'about',
  hash: 'team',
})`,
          },
          correct: {
            lang: 'ts',
            content: `router.push({
  name: 'about',
  hash: '#team',
})`,
          },
        },
        {
          title: '用 force 刷新相同地址，却忽略它会新增 history 条目',
          description:
            '`RouteLocationOptions.force` 会绕过重复导航判断；官方 API 明确提示，未同时设置 `replace: true` 时仍会 push 新条目。',
          consequence: '用户按后退键仍停在同一 URL，重复刷新还会不断增长 history 栈。',
          wrong: {
            lang: 'ts',
            content: `await router.push({
  name: 'dashboard',
  force: true,
})`,
          },
          correct: {
            lang: 'ts',
            content: `await router.push({
  name: 'dashboard',
  force: true,
  replace: true,
})`,
          },
        },
        {
          title: '把响应式对象或 Symbol 塞进 navigation state',
          description:
            '官方 `RouteLocationOptions` API 要求 state 满足 History API 的结构化克隆边界，明确排除响应式值和 Symbol 等类型。',
          consequence: 'history 写入可能抛出克隆错误，或保存的状态无法按应用预期恢复。',
          wrong: {
            lang: 'ts',
            content: `router.push({
  name: 'report',
  state: { draft: reactiveDraft, marker: Symbol('draft') },
})`,
          },
          correct: {
            lang: 'ts',
            content: `router.push({
  name: 'report',
  state: { reportId: reactiveDraft.id, mode: 'draft' },
})`,
          },
        },
        {
          title: '把 router.resolve() 的结果当成已导航、已加载 route',
          description:
            '`RouteLocationResolved` 只比 matcher 结果多 `href`；固定 `resolve()` 不运行守卫、不提交 currentRoute，也不加载懒组件。',
          consequence:
            '权限与重定向尚未结算，matched 中的组件还可能是 loader，却被代码提前当作可渲染结果。',
          wrong: {
            lang: 'ts',
            content: `const target = router.resolve({ name: 'reports' })
renderMatched(target.matched)`,
          },
          correct: {
            lang: 'ts',
            content: `const failure = await router.push({ name: 'reports' })

if (!failure) {
  renderMatched(router.currentRoute.value.matched)
}`,
          },
        },
        {
          title: '侦听整个响应式 route，而不是所需字段',
          description:
            '官方 Composition API Guide 建议直接侦听预期变化的属性，避免把完整 route 对象作为宽泛依赖。',
          consequence:
            'query、hash 或 meta 等无关变化也会触发请求，依赖意图不清晰且更难取消过期工作。',
          wrong: {
            lang: 'ts',
            content: `const route = useRoute()

watch(route, () => fetchUser(route.params.id))`,
          },
          correct: {
            lang: 'ts',
            content: `const route = useRoute()

watch(
  () => route.params.id,
  (id) => fetchUser(id),
)`,
          },
        },
        {
          title: '通过字段形状判断 START_LOCATION 或把它当作首页',
          description:
            '官方 API 示例使用对象身份 `from === START_LOCATION`；官方 discussion #2118 也将其描述为首次导航完成前的 nowhere location。',
          consequence:
            '真实 `/` 路由或测试构造对象可能被误判为首航，SSR 还可能在真实 matched records 就绪前渲染空页面。',
          wrong: {
            lang: 'ts',
            content: `router.beforeEach((to, from) => {
  if (from.fullPath === '/' && from.matched.length === 0) {
    startSession()
  }
})`,
          },
          correct: {
            lang: 'ts',
            content: `import { START_LOCATION } from 'vue-router'

router.beforeEach((to, from) => {
  if (from === START_LOCATION) startSession()
})`,
          },
        },
      ],
    },
    { type: 'heading', content: '源码推导与适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '1. 公开别名是 typed routes 的稳定切换点',
          content:
            '固定 `route-location.ts` 的公开别名都先判断 `RouteMapGeneric extends RouteMap`：没有 route map 时落到 Generic，有 route map 时按 Name 索引 TypedList。组件 prop、工具函数和库 API 应优先写公开别名，让类型增强无需改调用契约。',
        },
        {
          title: '2. Raw 联合按字符串、path、relative 三路进入 resolve',
          content:
            '固定 `router.ts` 对字符串先 parseURL；对象有 path 时解析 path；否则编码 params 并让 matcher 结合 name 或当前位置解析。通用跳转参数适合 RouteLocationRaw，明确只接受一种对象形态时再使用 AsPath 或 AsRelative。',
        },
        {
          title: '3. path 与 params 的所有权互斥',
          content:
            'path 分支直接把解析后的 pathname 交给 matcher，relative 分支才清理、编码和合并 params。表单或菜单拥有 route name 与业务参数时用 name + params；已经拥有完整 URL pathname 时用 path，并由调用方负责编码。',
        },
        {
          title: '4. Resolved 只增加链接语义',
          content:
            '固定 `resolve()` 合并 normalized URL、matcher result、`redirectedFrom: undefined` 和 history 创建的 href 后立即返回。生成 `<a>` 地址、预览目标和比较地址适合 resolve；需要守卫、redirect、history 与 currentRoute 提交则必须 push/replace。',
        },
        {
          title: '5. Normalized 与 Loaded 以组件可用性分界',
          content:
            '固定类型把 Normalized 的 matched 写成 `RouteRecordNormalized[]`，Loaded 则收窄为 `RouteLocationMatched[]`，其 components 不再含 lazy loader。导航守卫中按签名使用传入值；直接渲染或读取 currentRoute 时等待导航完成。',
        },
        {
          title: '6. 导航选项随 raw 地址进入 push 管线',
          content:
            '固定 `pushWithRedirect()` 从输入提取 state、force、replace；force 控制重复地址短路，replace 控制 history 写入方式，state 交给 history。刷新相同地址但不留重复记录时组合 force + replace，普通替换只用 replace。',
        },
        {
          title: '7. START_LOCATION 是身份哨兵',
          content:
            '固定 `location.ts` 创建单一 START_LOCATION_NORMALIZED，根入口再导出为 START_LOCATION；Router 也以同一对象初始化 currentRoute。首航守卫用严格身份比较，SSR、测试和首次数据初始化则通过显式初始导航与 isReady 建立真实 route。',
        },
        {
          title: '8. 四个 internal 名称只描述实现拼装',
          content:
            '`_RouteLocationBase`、`LocationAsRelativeRaw`、`RouteLocationNamedRaw`、`RouteLocationPathRaw` 在固定声明中带 `@internal`。它们适合阅读源码关系，不适合应用导入；公开替代依次是 RouteLocation 家族、RouteLocationAsRelative、RouteLocationRaw 与 RouteLocationAsPath。',
        },
      ],
    },
  ],
})
