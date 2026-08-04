/**
 * Vue Router 参考：Typed Routes 的 RouteMap、RouteRecordInfo 与地址类型映射
 * 查证日期：2026-08-04
 * 适用版本：Vue Router 5.2.0
 * 查证工具：Tavily、Vue Router 官方 API/Guide、本地 5.2.0 声明与固定 commit 源码
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

const fixedSourceBase =
  'https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src'

export const meta = defineReferenceMeta({
  id: 'vue.router.reference.typed-routes.route-map',
  type: 'reference',
  title: 'Typed Routes 与 RouteMap',
  summary:
    '查阅 RouteRecordInfo、RouteMap、Typed 地址类型与 internal TypedList 的精确签名、公开替代及版本信号边界',
  ecosystem: 'vue',
  module: 'router',
  collection: 'typed-routes',
  related: [
    'vue.router.reference.matching.route-locations',
    'vue.router.reference.matching.route-records',
    'vue.router.reference.file-based.overview',
    'vue.router.reference.file-based.virtual-modules',
  ],
  tags: ['Vue Router', 'Typed Routes', 'RouteMap', 'RouteRecordInfo', 'TypesConfig', 'TypeScript'],
  sources: [
    {
      title: 'Vue Router API：Typed Routes 相关类型总览',
      url: 'https://router.vuejs.org/api/',
    },
    {
      title: 'Vue Router API：RouteRecordInfo',
      url: 'https://router.vuejs.org/api/interfaces/routerecordinfo',
    },
    {
      title: 'Vue Router API：RouteMap',
      url: 'https://router.vuejs.org/api/type-aliases/routemap',
    },
    {
      title: 'Vue Router API：TypesConfig',
      url: 'https://router.vuejs.org/api/interfaces/typesconfig',
    },
    {
      title: 'Vue Router Guide：Typed Routes',
      url: 'https://router.vuejs.org/guide/advanced/typed-routes',
    },
    {
      title: 'Vue Router 5.2.0：route-map.ts 固定提交源码',
      url: `${fixedSourceBase}/typed-routes/route-map.ts`,
    },
    {
      title: 'Vue Router 5.2.0：route-location.ts 固定提交源码',
      url: `${fixedSourceBase}/typed-routes/route-location.ts`,
    },
    {
      title: 'Vue Router 5.2.0：TypesConfig 固定提交源码',
      url: `${fixedSourceBase}/config.ts`,
    },
    {
      title: 'Vue Router 5.2.0：根入口固定提交源码',
      url: `${fixedSourceBase}/index.ts`,
    },
  ],
  appliesTo: 'Vue Router 5.2.0',
  verifiedAt: '2026-08-04',
  anchors: [
    '概述',
    '稳定发布事实与源码混合信号',
    'Route Location As Path Typed',
    'Route Location As Relative Typed',
    'Route Location Normalized Loaded Typed',
    'Route Location Normalized Typed',
    'Route Location Resolved Typed',
    'Route Location Typed',
    'Route Record Info',
    'Types Config',
    'Route Location As Path Typed List',
    'Route Location As Relative Typed List',
    'Route Location As String Typed',
    'Route Location As String Typed List',
    'Route Location Normalized Loaded Typed List',
    'Route Location Normalized Typed List',
    'Route Location Resolved Typed List',
    'Route Location Typed List',
    'Route Map',
    'Route Map Generic',
    'Route Record Info Generic',
    '手工配置与生成配置',
    '易错使用提示',
    '源码推导与适用场景',
  ],
})

export default defineReference({
  meta,
  signature: `interface RouteLocationAsPathTyped<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric } = RouteMapGeneric,
  Name extends keyof RouteMap = keyof RouteMap,
> extends RouteLocationAsPathGeneric {
  path: _LiteralUnion<RouteMap[Name]['path']>
}

interface RouteLocationAsRelativeTyped<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric } = RouteMapGeneric,
  Name extends keyof RouteMap = keyof RouteMap,
> extends RouteLocationAsRelativeGeneric {
  name?: Extract<Name, string | symbol>
  params?: RouteMap[Name]['paramsRaw']
}

interface RouteLocationNormalizedLoadedTyped<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric } = RouteMapGeneric,
  Name extends keyof RouteMap = keyof RouteMap,
> extends RouteLocationNormalizedLoadedGeneric {
  name: Extract<Name, string | symbol>
  params: RouteMap[Name]['params']
}

interface RouteLocationNormalizedTyped<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric } = RouteMapGeneric,
  Name extends keyof RouteMap = keyof RouteMap,
> extends RouteLocationNormalizedGeneric {
  name: Extract<Name, string | symbol>
  params: RouteMap[Name]['params']
  matched: RouteRecordNormalized[]
}

interface RouteLocationResolvedTyped<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric },
  Name extends keyof RouteMap,
> extends RouteLocationTyped<RouteMap, Name> {
  href: string
}

interface RouteLocationTyped<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric },
  Name extends keyof RouteMap,
> extends RouteLocationGeneric {
  name: Extract<Name, string | symbol>
  params: RouteMap[Name]['params']
}

interface RouteRecordInfo<
  Name extends string | symbol = string,
  Path extends string = string,
  ParamsRaw extends RouteParamsRawGeneric = RouteParamsRawGeneric,
  Params extends RouteParamsGeneric = RouteParamsGeneric,
  ChildrenNames extends string | symbol = never,
> {
  name: Name
  path: Path
  paramsRaw: ParamsRaw
  params: Params
  childrenNames: ChildrenNames
}

/** @internal */
interface TypesConfig {}

/** @internal */
type RouteLocationAsPathTypedList<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric } = RouteMapGeneric,
> = { [N in keyof RouteMap]: RouteLocationAsPathTyped<RouteMap, N> }

/** @internal */
type RouteLocationAsRelativeTypedList<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric } = RouteMapGeneric,
> = { [N in keyof RouteMap]: RouteLocationAsRelativeTyped<RouteMap, N> }

type RouteLocationAsStringTyped<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric } = RouteMapGeneric,
  Name extends keyof RouteMap = keyof RouteMap,
> = RouteMap[Name]['path']

/** @internal */
type RouteLocationAsStringTypedList<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric } = RouteMapGeneric,
> = { [N in keyof RouteMap]: RouteLocationAsStringTyped<RouteMap, N> }

/** @internal */
type RouteLocationNormalizedLoadedTypedList<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric } = RouteMapGeneric,
> = { [N in keyof RouteMap]: RouteLocationNormalizedLoadedTyped<RouteMap, N> }

/** @internal */
type RouteLocationNormalizedTypedList<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric } = RouteMapGeneric,
> = { [N in keyof RouteMap]: RouteLocationNormalizedTyped<RouteMap, N> }

/** @internal */
type RouteLocationResolvedTypedList<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric } = RouteMapGeneric,
> = { [N in keyof RouteMap]: RouteLocationResolvedTyped<RouteMap, N> }

/** @internal */
type RouteLocationTypedList<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric } = RouteMapGeneric,
> = { [N in keyof RouteMap]: RouteLocationTyped<RouteMap, N> }

type RouteMap = TypesConfig extends Record<'RouteNamedMap', infer RouteNamedMap>
  ? RouteNamedMap
  : RouteMapGeneric

type RouteMapGeneric = Record<string | symbol, RouteRecordInfoGeneric>

type RouteRecordInfoGeneric = RouteRecordInfo<
  string | symbol,
  string,
  RouteParamsRawGeneric,
  RouteParamsGeneric,
  string | symbol
>`,
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        'Typed Routes 用一个以 route name 为键的 RouteMap，把每条记录的 path、导航输入 paramsRaw、读取结果 params 与子路由名称联系起来。公开地址类型再按 Name 读取这张表，从而让 router.push()、RouterLink、useRoute() 和 router.resolve() 共享同一组编译期约束。',
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '类型映射只发生在 TypeScript 编译期，不会为 URL、服务端数据或用户输入增加运行时校验。官方 Guide 推荐由内置 file-based routing plugin 自动生成 routes 与类型；手工 RouteNamedMap 适合小型、明确受控的路由表。',
    },
    {
      type: 'table',
      headers: ['层级', '负责的信息', '应用首选入口'],
      rows: [
        ['单条记录', 'name、path、paramsRaw、params、childrenNames', 'RouteRecordInfo'],
        ['全局映射', 'route name 到 RouteRecordInfo 的索引', 'RouteMap'],
        ['导航输入', 'path、name + params 或字符串 path', 'RouteLocationRaw / AsPath / AsRelative'],
        ['读取结果', '按 name 收窄 name 与规范化 params', 'RouteLocation / Normalized / Loaded'],
        ['解析结果', '读取结果再增加 href', 'RouteLocationResolved'],
      ],
    },
    { type: 'heading', content: '稳定发布事实与源码混合信号' },
    {
      type: 'table',
      headers: ['证据', '5.2.0 可核验事实', '本页采用的边界'],
      rows: [
        [
          '发布物根入口',
          '`vue-router` 的根声明重新导出本页 19 项',
          '可以从稳定包根路径导入；不据此推断标签之外的稳定等级',
        ],
        [
          '官方 Typed Routes Guide',
          '位于 Advanced Guide，说明手工配置并推荐内置生成插件，页面未标 experimental',
          '作为官方使用路径记录，不把缺少标签改写成稳定性声明',
        ],
        [
          '固定根源码注释',
          '同一批根导出上方仍写着 `Experimental Type Safe API`',
          '保留该源码信号，不把它扩张为对每个类型的单独定性',
        ],
        [
          '逐项源码标签',
          '`TypesConfig` 与七个 `TypedList` 明确标记 `@internal`',
          '逐项警示并给公开替代；其他 11 项按 public 索引呈现',
        ],
      ],
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '以上是并列证据，不是稳定性裁决。Vue Router 5.2.0 的发布入口、Guide 位置和固定源码注释存在混合信号；本页只报告可核验事实，并要求升级时重新检查声明、Guide 与固定源码。',
    },
    { type: 'heading', content: 'Route Location As Path Typed' },
    {
      type: 'code',
      lang: 'ts',
      content: `interface RouteLocationAsPathTyped<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric } = RouteMapGeneric,
  Name extends keyof RouteMap = keyof RouteMap,
> extends RouteLocationAsPathGeneric {
  path: _LiteralUnion<RouteMap[Name]['path']>
}`,
    },
    {
      type: 'text',
      content:
        '公开的 path 对象类型。它保留 Generic 版本的 query、hash 与导航选项，只把 path 收窄到指定 route name 的路径字面量，同时通过 _LiteralUnion 保留一般字符串的可用性。path 分支不携带 params；拥有业务参数时优先使用 name + params。',
    },
    { type: 'heading', content: 'Route Location As Relative Typed' },
    {
      type: 'code',
      lang: 'ts',
      content: `interface RouteLocationAsRelativeTyped<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric } = RouteMapGeneric,
  Name extends keyof RouteMap = keyof RouteMap,
> extends RouteLocationAsRelativeGeneric {
  name?: Extract<Name, string | symbol>
  params?: RouteMap[Name]['paramsRaw']
}`,
    },
    {
      type: 'text',
      content:
        '公开的命名或相对地址类型。name 选择 RouteMap 成员，params 随之读取该记录的 paramsRaw；省略 name 时可相对当前位置更新 params、query 或 hash。它继承的 path?: undefined 会把本分支与 path 对象分开。',
    },
    { type: 'heading', content: 'Route Location Normalized Loaded Typed' },
    {
      type: 'code',
      lang: 'ts',
      content: `interface RouteLocationNormalizedLoadedTyped<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric } = RouteMapGeneric,
  Name extends keyof RouteMap = keyof RouteMap,
> extends RouteLocationNormalizedLoadedGeneric {
  name: Extract<Name, string | symbol>
  params: RouteMap[Name]['params']
}`,
    },
    {
      type: 'text',
      content:
        '公开的已加载地址类型。name 与规范化 params 按记录收窄，matched 则继承为 RouteLocationMatched[]：其中懒组件已加载，也不会包含 redirect record，适合 currentRoute 与 RouterView 就绪后的读取。',
    },
    { type: 'heading', content: 'Route Location Normalized Typed' },
    {
      type: 'code',
      lang: 'ts',
      content: `interface RouteLocationNormalizedTyped<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric } = RouteMapGeneric,
  Name extends keyof RouteMap = keyof RouteMap,
> extends RouteLocationNormalizedGeneric {
  name: Extract<Name, string | symbol>
  params: RouteMap[Name]['params']
  matched: RouteRecordNormalized[]
}`,
    },
    {
      type: 'text',
      content:
        '公开的规范化地址类型。它按 name 收窄 params，并明确 matched 为 RouteRecordNormalized[]；这一步已排除 redirect records，但不承诺懒组件完成加载。源码刻意不把 path 收窄到模板字面量，因为实际 path 已代入参数。',
    },
    { type: 'heading', content: 'Route Location Resolved Typed' },
    {
      type: 'code',
      lang: 'ts',
      content: `interface RouteLocationResolvedTyped<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric },
  Name extends keyof RouteMap,
> extends RouteLocationTyped<RouteMap, Name> {
  href: string
}`,
    },
    {
      type: 'text',
      content:
        '公开的解析结果类型。在 RouteLocationTyped 的 name、params 与 matcher 信息上只增加 href；它描述 router.resolve() 的返回形态，不表示守卫已运行、导航已提交或懒组件已加载。',
    },
    { type: 'heading', content: 'Route Location Typed' },
    {
      type: 'code',
      lang: 'ts',
      content: `interface RouteLocationTyped<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric },
  Name extends keyof RouteMap,
> extends RouteLocationGeneric {
  name: Extract<Name, string | symbol>
  params: RouteMap[Name]['params']
}`,
    },
    {
      type: 'text',
      content:
        '公开的 matcher 结果类型。它从 RouteMap 的指定成员取得规范化 params，并用 Extract 排除 keyof 可能产生的 number；matched 仍沿用 RouteRecord[]，所以不要把它当作已加载渲染结果。常规 API 签名优先使用 RouteLocation<Name> 公开别名。',
    },
    { type: 'heading', content: 'Route Record Info' },
    {
      type: 'code',
      lang: 'ts',
      content: `interface RouteRecordInfo<
  Name extends string | symbol = string,
  Path extends string = string,
  ParamsRaw extends RouteParamsRawGeneric = RouteParamsRawGeneric,
  Params extends RouteParamsGeneric = RouteParamsGeneric,
  ChildrenNames extends string | symbol = never,
> {
  name: Name
  path: Path
  paramsRaw: ParamsRaw
  params: Params
  childrenNames: ChildrenNames
}`,
    },
    {
      type: 'table',
      headers: ['泛型', '含义', '典型值'],
      rows: [
        ['Name', '记录名称，也是 RouteMap 的键', "'user'"],
        ['Path', '用于补全的路径模板', "'/users/:id'"],
        ['ParamsRaw', '导航调用允许传入的原始参数', '{ id: string | number }'],
        ['Params', '从 URL 解码后读取的规范化参数', '{ id: string }'],
        ['ChildrenNames', '全部直接或递归子记录名称的联合', "'user-edit' | 'user-settings'"],
      ],
    },
    {
      type: 'text',
      content:
        '这是手工 RouteNamedMap 的核心公开类型。ParamsRaw 与 Params 分开表达“可以传什么”和“最终读到什么”；ChildrenNames 为嵌套路由的名称关系提供类型信息。默认 ChildrenNames 是 never，不能在存在子记录时照搬。',
    },
    { type: 'heading', content: 'Types Config' },
    {
      type: 'code',
      lang: 'ts',
      content: `/** @internal */
interface TypesConfig {}`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`TypesConfig` 在 5.2.0 API 与固定 config.ts 中明确写着 ONLY FOR INTERNAL USAGE，并带 `@internal`。不要依赖 Router、$route、RouterLink 等内部替换槽。Typed Routes 的公开支持路径是按官方 Guide 仅声明 RouteNamedMap，或让官方 file-based plugin 生成对应声明；把这条窄用法与任意扩展 internal 配置区分开。',
    },
    { type: 'heading', content: 'Route Location As Path Typed List' },
    {
      type: 'code',
      lang: 'ts',
      content: `/** @internal */
type RouteLocationAsPathTypedList<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric } = RouteMapGeneric,
> = {
  [N in keyof RouteMap]: RouteLocationAsPathTyped<RouteMap, N>
}`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`RouteLocationAsPathTypedList` 是 internal 映射类型，不是数组。公开替代是 `RouteLocationAsPath<Name>`；通用导航输入则使用 `RouteLocationRaw<Name>`。',
    },
    { type: 'heading', content: 'Route Location As Relative Typed List' },
    {
      type: 'code',
      lang: 'ts',
      content: `/** @internal */
type RouteLocationAsRelativeTypedList<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric } = RouteMapGeneric,
> = {
  [N in keyof RouteMap]: RouteLocationAsRelativeTyped<RouteMap, N>
}`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`RouteLocationAsRelativeTypedList` 是 internal 的按名称索引表。应用公开替代是 `RouteLocationAsRelative<Name>`，它在没有 RouteMap 时还会自动回退到 Generic 形态。',
    },
    { type: 'heading', content: 'Route Location As String Typed' },
    {
      type: 'code',
      lang: 'ts',
      content: `type RouteLocationAsStringTyped<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric } = RouteMapGeneric,
  Name extends keyof RouteMap = keyof RouteMap,
> = RouteMap[Name]['path']`,
    },
    {
      type: 'text',
      content:
        '公开的字符串路径映射，直接读取指定记录的 path 模板。应用 API 通常更适合使用 `RouteLocationAsString<Name>`，因为公开别名负责 Generic 回退并保留一般字符串兼容；本类型适合需要显式传入 RouteMap 的库级工具。',
    },
    { type: 'heading', content: 'Route Location As String Typed List' },
    {
      type: 'code',
      lang: 'ts',
      content: `/** @internal */
type RouteLocationAsStringTypedList<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric } = RouteMapGeneric,
> = {
  [N in keyof RouteMap]: RouteLocationAsStringTyped<RouteMap, N>
}`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`RouteLocationAsStringTypedList` 是 internal 索引表。应用公开替代是 `RouteLocationAsString<Name>`；不要把 List 后缀理解为运行时字符串数组。',
    },
    { type: 'heading', content: 'Route Location Normalized Loaded Typed List' },
    {
      type: 'code',
      lang: 'ts',
      content: `/** @internal */
type RouteLocationNormalizedLoadedTypedList<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric } = RouteMapGeneric,
> = {
  [N in keyof RouteMap]: RouteLocationNormalizedLoadedTyped<RouteMap, N>
}`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`RouteLocationNormalizedLoadedTypedList` 是 internal 映射类型。读取 currentRoute、useRoute() 或已加载导航目标时使用公开 `RouteLocationNormalizedLoaded<Name>`。',
    },
    { type: 'heading', content: 'Route Location Normalized Typed List' },
    {
      type: 'code',
      lang: 'ts',
      content: `/** @internal */
type RouteLocationNormalizedTypedList<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric } = RouteMapGeneric,
> = {
  [N in keyof RouteMap]: RouteLocationNormalizedTyped<RouteMap, N>
}`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`RouteLocationNormalizedTypedList` 是 internal 索引表。守卫或规范化阶段的公开替代是 `RouteLocationNormalized<Name>`，不要让库接口暴露实现用 TypedList。',
    },
    { type: 'heading', content: 'Route Location Resolved Typed List' },
    {
      type: 'code',
      lang: 'ts',
      content: `/** @internal */
type RouteLocationResolvedTypedList<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric } = RouteMapGeneric,
> = {
  [N in keyof RouteMap]: RouteLocationResolvedTyped<RouteMap, N>
}`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`RouteLocationResolvedTypedList` 是 internal 映射类型。router.resolve() 结果和公共工具签名应使用 `RouteLocationResolved<Name>`，由公开别名处理映射选择。',
    },
    { type: 'heading', content: 'Route Location Typed List' },
    {
      type: 'code',
      lang: 'ts',
      content: `/** @internal */
type RouteLocationTypedList<
  RouteMap extends { [K in keyof RouteMap]: RouteRecordInfoGeneric } = RouteMapGeneric,
> = {
  [N in keyof RouteMap]: RouteLocationTyped<RouteMap, N>
}`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`RouteLocationTypedList` 是 internal 的按 route name 分发表。公共返回值或参数使用 `RouteLocation<Name>`；只有阅读条件类型实现时才需要理解该列表。',
    },
    { type: 'heading', content: 'Route Map' },
    {
      type: 'code',
      lang: 'ts',
      content: `type RouteMap = TypesConfig extends Record<'RouteNamedMap', infer RouteNamedMap>
  ? RouteNamedMap
  : RouteMapGeneric`,
    },
    {
      type: 'text',
      content:
        '公开的全局路由映射选择器。存在 RouteNamedMap 声明时取出它；没有声明时退回 RouteMapGeneric。`keyof RouteMap` 是需要全部已知 route names 时的公开类型表达，避免直接操作 internal TypedList。',
    },
    { type: 'heading', content: 'Route Map Generic' },
    {
      type: 'code',
      lang: 'ts',
      content: 'type RouteMapGeneric = Record<string | symbol, RouteRecordInfoGeneric>',
    },
    {
      type: 'text',
      content:
        '公开的未配置回退映射。它允许任意 string 或 symbol 名称，但会丢失每条 route 的 path、params 与 children 字面量。它适合描述“尚无具体映射”的边界，不适合替代项目自己的 RouteNamedMap。',
    },
    { type: 'heading', content: 'Route Record Info Generic' },
    {
      type: 'code',
      lang: 'ts',
      content: `type RouteRecordInfoGeneric = RouteRecordInfo<
  string | symbol,
  string,
  RouteParamsRawGeneric,
  RouteParamsGeneric,
  string | symbol
>`,
    },
    {
      type: 'text',
      content:
        '公开的单条记录回退形态。它把五个维度全部放宽，用于约束“某值至少是合法 RouteRecordInfo”的泛型边界；项目映射若直接把每项都写成此类型，会主动抹掉 typed routes 所需的字面量信息。',
    },
    { type: 'heading', content: '手工配置与生成配置' },
    {
      type: 'code',
      lang: 'ts',
      content: `import type { RouteRecordInfo } from 'vue-router'

export interface RouteNamedMap {
  home: RouteRecordInfo<
    'home',
    '/',
    Record<never, never>,
    Record<never, never>,
    never
  >
  user: RouteRecordInfo<
    'user',
    '/users/:id',
    { id: string | number },
    { id: string },
    'user-edit'
  >
  'user-edit': RouteRecordInfo<
    'user-edit',
    '/users/:id/edit',
    { id: string | number },
    { id: string },
    never
  >
}

declare module 'vue-router' {
  interface TypesConfig {
    RouteNamedMap: RouteNamedMap
  }
}`,
    },
    {
      type: 'text',
      content:
        '上例遵循官方 Guide 的窄模块增强：RouteNamedMap 的键与每项 Name 保持一致，原始 id 可传 number，读取时则是 URL 解码后的 string。路由数量、嵌套关系或 path 经常变化时，官方 Guide 推荐使用内置 file-based routing plugin 自动生成 route records 与类型，避免手工映射漂移。',
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '把 paramsRaw 与 params 写成同一种宽类型',
          description:
            'RouteRecordInfo 分开记录导航输入和 URL 解码后的读取结果；数字可作为原始参数输入，但默认 URL 参数读取为字符串。',
          consequence:
            '组件会把 route.params.id 错当成 number，数值比较、加法或 API 参数构造出现静默错误。',
          wrong: {
            lang: 'ts',
            content: `type UserRoute = RouteRecordInfo<
  'user',
  '/users/:id',
  { id: number },
  { id: number }
>`,
          },
          correct: {
            lang: 'ts',
            content: `type UserRoute = RouteRecordInfo<
  'user',
  '/users/:id',
  { id: string | number },
  { id: string }
>`,
          },
        },
        {
          title: '同时传 path 与 params，期待 Router 替换参数',
          description:
            'Path typed 分支只收窄已拥有的 path；参数生成属于 name + params 的 relative 分支。',
          consequence: 'params 被忽略或调用落到不符合预期的地址分支，类型映射也无法表达参数关系。',
          wrong: {
            lang: 'ts',
            content: `router.push({
  path: '/users/:id',
  params: { id: 42 },
})`,
          },
          correct: {
            lang: 'ts',
            content: `router.push({
  name: 'user',
  params: { id: 42 },
})`,
          },
        },
        {
          title: '把 TypedList 当成应用层数组或公共契约',
          description:
            '七个 TypedList 都是带 @internal 的映射类型，键是 route name，不存在对应运行时数组。',
          consequence:
            '公共类型暴露内部实现细节，升级时容易受映射结构变化影响，也会误导调用方期待运行时值。',
          wrong: {
            lang: 'ts',
            content: `import type { RouteLocationTypedList } from 'vue-router'

type UserLocation = RouteLocationTypedList[0]`,
          },
          correct: {
            lang: 'ts',
            content: `import type { RouteLocation } from 'vue-router'

type UserLocation = RouteLocation<'user'>`,
          },
        },
        {
          title: '用 RouteRecordInfoGeneric 声明整张项目映射',
          description:
            'Generic 形态会把 name、path、params 与 childrenNames 全部放宽，只适合作为泛型约束或无映射回退。',
          consequence: 'route name 和 params 自动补全退化，错误名称与缺失参数重新变成可编译代码。',
          wrong: {
            lang: 'ts',
            content: `interface RouteNamedMap {
  user: RouteRecordInfoGeneric
}`,
          },
          correct: {
            lang: 'ts',
            content: `interface RouteNamedMap {
  user: RouteRecordInfo<
    'user',
    '/users/:id',
    { id: string | number },
    { id: string }
  >
}`,
          },
        },
        {
          title: '存在子记录却保留默认 childrenNames 为 never',
          description:
            'RouteRecordInfo 的第五个泛型默认是 never；父记录需要显式列出可达子 route names。',
          consequence:
            '依赖父子名称关系的类型收窄不完整，生成映射与手工映射对同一路由树给出不同结果。',
          wrong: {
            lang: 'ts',
            content: `type UserRoute = RouteRecordInfo<
  'user',
  '/users/:id',
  { id: string | number },
  { id: string }
>`,
          },
          correct: {
            lang: 'ts',
            content: `type UserRoute = RouteRecordInfo<
  'user',
  '/users/:id',
  { id: string | number },
  { id: string },
  'user-edit' | 'user-settings'
>`,
          },
        },
        {
          title: '把类型安全误当成运行时输入校验',
          description:
            'RouteMap 只约束已编译的 TypeScript 调用；URL、缓存、服务端响应与用户输入仍可能包含无效值。',
          consequence: '代码直接信任 route.params 或外部 route name，非法数据进入请求或业务状态。',
          wrong: {
            lang: 'ts',
            content: `const page = Number(route.query.page)
loadPage(page)`,
          },
          correct: {
            lang: 'ts',
            content: `const page = Number(route.query.page)

if (Number.isInteger(page) && page > 0) {
  loadPage(page)
}`,
          },
        },
        {
          title: '用类型断言绕过未知 route name 或缺失 params',
          description:
            'Typed Routes 的价值来自 RouteMap 驱动的检查；as 断言会把真实映射错误隐藏到运行时。',
          consequence:
            '重命名 route 或调整必填参数后，调用点不再得到编译错误，导航可能失败或生成错误 URL。',
          wrong: {
            lang: 'ts',
            content: `router.push({
  name: externalName as keyof RouteMap,
  params: {} as never,
})`,
          },
          correct: {
            lang: 'ts',
            content: `const destinations = {
  profile: { name: 'user', params: { id: currentUserId } },
} satisfies Record<string, RouteLocationRaw>

router.push(destinations.profile)`,
          },
        },
        {
          title: '扩展 TypesConfig 的内部替换槽作为普通定制 API',
          description:
            'API 与固定源码把 TypesConfig 标为 internal；官方 Typed Routes Guide 只展示 RouteNamedMap 这一窄模块增强。',
          consequence:
            '应用依赖没有公开兼容承诺的 Router、$route 或组件替换槽，版本升级时类型系统整体漂移。',
          wrong: {
            lang: 'ts',
            content: `declare module 'vue-router' {
  interface TypesConfig {
    $route: MyCustomRoute
    RouterLink: typeof MyRouterLink
  }
}`,
          },
          correct: {
            lang: 'ts',
            content: `declare module 'vue-router' {
  interface TypesConfig {
    RouteNamedMap: RouteNamedMap
  }
}`,
          },
        },
        {
          title: '根据单一入口或注释自行宣布稳定性',
          description:
            '5.2.0 同时存在根入口导出、未标 experimental 的 Advanced Guide，以及根源码 Experimental Type Safe API 注释。',
          consequence: '团队把混合证据压成过强承诺，升级评估遗漏逐项 internal 标签与版本差异。',
          wrong: {
            lang: 'ts',
            content: `// 根入口可导出，所以全部 Typed Routes 类型都已承诺稳定。
export type PublicRouteList = RouteLocationTypedList`,
          },
          correct: {
            lang: 'ts',
            content: `// 固定 vue-router@5.2.0；公共契约停在公开别名。
export type PublicUserRoute = RouteLocation<'user'>`,
          },
        },
      ],
    },
    { type: 'heading', content: '源码推导与适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '1. RouteRecordInfo 是五维类型事实表',
          content:
            '固定 `typed-routes/route-map.ts` 将 name、path、paramsRaw、params 与 childrenNames 原样保存为字段。手工映射和生成器的共同目标不是复制 RouteRecordRaw，而是为后续条件类型提供这五项编译期事实。',
        },
        {
          title: '2. RouteMap 以全局声明决定 typed 或 generic',
          content:
            '固定 `RouteMap` 检查 `TypesConfig` 是否包含 RouteNamedMap；有则 infer 出项目映射，无则退回 `Record<string | symbol, RouteRecordInfoGeneric>`。应用公共类型可以一直使用 RouteMap 与公开地址别名，无需自行写两套分支。',
        },
        {
          title: '3. Typed 接口只覆盖能由 route name 精确决定的字段',
          content:
            '固定 `route-location.ts` 为 Typed 接口覆盖 name 与 params；AsPath 额外读取 path 模板，Normalized 则刻意保持实际 path 为 string。适合按名称收窄 params，不应期待动态参数代入后的 URL 仍等于 path 模板字面量。',
        },
        {
          title: '4. TypedList 是条件别名的内部派发表',
          content:
            '七个 TypedList 都用 `[N in keyof RouteMap]` 生成按名称索引的映射并标记 `@internal`；公开 RouteLocation 家族在检测到具体 RouteMap 后才索引它们。库与应用应暴露公开别名，让 Vue Router 自己承担派发实现。',
        },
        {
          title: '5. 导航输入按 path、relative 与 string 分开建模',
          content:
            'AsPathTyped 从记录读取 path，AsRelativeTyped 从同一记录读取 paramsRaw，AsStringTyped 直接得到 path 模板；公开 RouteLocationRaw 再联合三条路径。拥有 route name 与业务参数时选择 relative，对已有编码 path 才选择 path 或 string。',
        },
        {
          title: '6. 读取阶段统一使用规范化 params',
          content:
            'RouteLocationTyped、NormalizedTyped 与 NormalizedLoadedTyped 都从 RouteMap 成员读取 `params` 而非 `paramsRaw`；差别主要在 matched records 与组件加载阶段。组件和守卫读取 URL 参数时按规范化类型处理，导航构造才使用原始参数类型。',
        },
        {
          title: '7. Resolved 只在 Typed matcher 结果上增加 href',
          content:
            '固定 `RouteLocationResolvedTyped` 继承 `RouteLocationTyped` 并只声明 href。它适合链接预览与锚点 href 生成，不能据此推断导航守卫、redirect、history 提交或懒组件加载已经发生。',
        },
        {
          title: '8. 发布与标签必须逐层同时读取',
          content:
            '固定根 `index.ts` 从包根导出本页全部类型，同一区段注释仍写 `Experimental Type Safe API`；`config.ts` 和七个 TypedList 又逐项带 `@internal`，而官方 Typed Routes Guide 未标 experimental。结论只能保留为 5.2.0 的混合信号，并在公共契约中避开明确 internal 项。',
        },
      ],
    },
  ],
})
