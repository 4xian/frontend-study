/**
 * Vue Router 参考：Params 与 Query
 * 查证日期：2026-08-04
 * 适用版本：Vue Router 5.2.0
 * 查证工具：Tavily、Vue Router 官方 API/Guide、官方 issue、本地 5.2.0 类型声明与固定 commit 源码
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

const fixedSourceBase =
  'https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src'

export const meta = defineReferenceMeta({
  id: 'vue.router.reference.matching.params-query',
  type: 'reference',
  title: 'Params 与 Query',
  summary:
    '查阅路径参数与查询参数的 raw、normalized 值域，repeatable 参数形状，以及 query 解析与序列化契约',
  ecosystem: 'vue',
  module: 'router',
  collection: 'matching',
  related: [
    'vue.router.reference.matching.matcher',
    'vue.router.reference.matching.route-locations',
    'vue.router.reference.configuration.create-router',
    'vue.router.learn.basics.route-params-query-matching',
  ],
  tags: [
    'Vue Router',
    'params',
    'query',
    'LocationQuery',
    'RouteParams',
    'repeatable params',
    'parseQuery',
    'stringifyQuery',
  ],
  sources: [
    {
      title: 'Vue Router API：RouteQueryAndHash',
      url: 'https://router.vuejs.org/api/interfaces/routequeryandhash',
    },
    {
      title: 'Vue Router API：LocationQuery',
      url: 'https://router.vuejs.org/api/type-aliases/locationquery',
    },
    {
      title: 'Vue Router API：LocationQueryRaw',
      url: 'https://router.vuejs.org/api/type-aliases/locationqueryraw',
    },
    {
      title: 'Vue Router API：LocationQueryValue',
      url: 'https://router.vuejs.org/api/type-aliases/locationqueryvalue',
    },
    {
      title: 'Vue Router API：LocationQueryValueRaw',
      url: 'https://router.vuejs.org/api/type-aliases/locationqueryvalueraw',
    },
    {
      title: 'Vue Router API：ParamValue',
      url: 'https://router.vuejs.org/api/type-aliases/paramvalue',
    },
    {
      title: 'Vue Router API：ParamValueOneOrMore',
      url: 'https://router.vuejs.org/api/type-aliases/paramvalueoneormore',
    },
    {
      title: 'Vue Router API：ParamValueZeroOrMore',
      url: 'https://router.vuejs.org/api/type-aliases/paramvaluezeroormore',
    },
    {
      title: 'Vue Router API：ParamValueZeroOrOne',
      url: 'https://router.vuejs.org/api/type-aliases/paramvaluezeroorone',
    },
    {
      title: 'Vue Router API：RouteParams',
      url: 'https://router.vuejs.org/api/type-aliases/routeparams',
    },
    {
      title: 'Vue Router API：RouteParamsGeneric',
      url: 'https://router.vuejs.org/api/type-aliases/routeparamsgeneric',
    },
    {
      title: 'Vue Router API：RouteParamsRaw',
      url: 'https://router.vuejs.org/api/type-aliases/routeparamsraw',
    },
    {
      title: 'Vue Router API：RouteParamsRawGeneric',
      url: 'https://router.vuejs.org/api/type-aliases/routeparamsrawgeneric',
    },
    {
      title: 'Vue Router API：RouteParamValue',
      url: 'https://router.vuejs.org/api/type-aliases/routeparamvalue',
    },
    {
      title: 'Vue Router API：RouteParamValueRaw',
      url: 'https://router.vuejs.org/api/type-aliases/routeparamvalueraw',
    },
    {
      title: 'Vue Router API：parseQuery()',
      url: 'https://router.vuejs.org/api/functions/parsequery',
    },
    {
      title: 'Vue Router API：stringifyQuery()',
      url: 'https://router.vuejs.org/api/functions/stringifyquery',
    },
    {
      title: 'Vue Router API：RouterOptions query 配置',
      url: 'https://router.vuejs.org/api/interfaces/routeroptions',
    },
    {
      title: 'Vue Router Guide：Programmatic Navigation',
      url: 'https://router.vuejs.org/guide/essentials/navigation.html',
    },
    {
      title: 'Vue Router Guide：Routes Matching Syntax',
      url: 'https://router.vuejs.org/guide/essentials/route-matching-syntax.html',
    },
    {
      title: 'Vue Router Guide：Dynamic Route Matching',
      url: 'https://router.vuejs.org/guide/essentials/dynamic-matching.html',
    },
    {
      title: 'Vue Router issue #2165：自定义 query parser 的 TypeScript 边界',
      url: 'https://github.com/vuejs/router/issues/2165',
    },
    {
      title: 'Vue Router 5.2.0：query.ts 固定源码',
      url: `${fixedSourceBase}/query.ts`,
    },
    {
      title: 'Vue Router 5.2.0：typed-routes/params.ts 固定源码',
      url: `${fixedSourceBase}/typed-routes/params.ts`,
    },
    {
      title: 'Vue Router 5.2.0：types/index.ts 固定源码',
      url: `${fixedSourceBase}/types/index.ts`,
    },
    {
      title: 'Vue Router 5.2.0：router.ts 固定源码',
      url: `${fixedSourceBase}/router.ts`,
    },
  ],
  appliesTo: 'Vue Router 5.2.0',
  verifiedAt: '2026-08-04',
  anchors: [
    '概述',
    'Raw 与 Normalized',
    'Route Query And Hash',
    'Location Query',
    'Location Query Raw',
    'Location Query Value',
    'Location Query Value Raw',
    'Param Value',
    'Param Value One Or More',
    'Param Value Zero Or More',
    'Param Value Zero Or One',
    'Route Params',
    'Route Params Generic',
    'Route Params Raw',
    'Route Params Raw Generic',
    'Route Param Value',
    'Route Param Value Raw',
    'Parse Query',
    'Stringify Query',
    '易错使用提示',
    '源码推导与适用场景',
  ],
})

export default defineReference({
  meta,
  signature: `interface RouteQueryAndHash {
  query?: LocationQueryRaw
  hash?: string
}

type LocationQuery = Record<string, LocationQueryValue | LocationQueryValue[]>
type LocationQueryRaw = Record<
  string | number,
  LocationQueryValueRaw | LocationQueryValueRaw[]
>
type LocationQueryValue = string | null
type LocationQueryValueRaw = LocationQueryValue | number | undefined

type ParamValue<isRaw extends boolean> = true extends isRaw ? string | number : string
type ParamValueOneOrMore<isRaw extends boolean> = [
  ParamValue<isRaw>,
  ...ParamValue<isRaw>[],
]
type ParamValueZeroOrMore<isRaw extends boolean> = true extends isRaw
  ? ParamValue<isRaw>[] | undefined | null
  : ParamValue<isRaw>[] | undefined
type ParamValueZeroOrOne<isRaw extends boolean> = true extends isRaw
  ? string | number | null | undefined
  : string

type RouteParams<Name extends keyof RouteMap = keyof RouteMap> = RouteMap[Name]['params']
type RouteParamsGeneric = Record<string, RouteParamValue | RouteParamValue[]>
type RouteParamsRaw<Name extends keyof RouteMap = keyof RouteMap> = RouteMap[Name]['paramsRaw']
type RouteParamsRawGeneric = Record<
  string,
  RouteParamValueRaw | Exclude<RouteParamValueRaw, null | undefined>[]
>
type RouteParamValue = string
type RouteParamValueRaw = RouteParamValue | number | null | undefined

function parseQuery(search: string): LocationQuery
function stringifyQuery(query: LocationQueryRaw | undefined): string`,
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        '`params` 来自 route record 的动态路径片段，决定 pathname；`query` 表示 `?` 后的键值集合，不参与 record 的路径匹配。两者都区分导航输入的 raw 形状与解析完成后的 normalized 形状：raw 允许便于调用的数字和空值，normalized 则贴近 URL 解码后的字符串、数组与必要的 `null`。',
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '使用命名路由时由 Router 根据 `params` 生成并编码路径；给出 `path` 时 `params` 会被忽略。`query` 与 `hash` 不同，即使采用 `path` 导航也仍会参与最终 URL。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `router.resolve({
  name: 'report',
  params: { year: 2026 },
  query: { tab: 'summary', page: 2 },
})

// raw params: { year: 2026 }
// raw query: { tab: 'summary', page: 2 }
// normalized params: { year: '2026' }
// normalized query: { tab: 'summary', page: '2' }`,
    },
    { type: 'heading', content: 'Raw 与 Normalized' },
    {
      type: 'table',
      headers: ['维度', 'Raw 导航输入', 'Normalized 路由结果'],
      rows: [
        ['普通 path param', 'string | number', 'string'],
        ['repeatable path param', '(string | number)[]', 'string[]'],
        ['可省略 path param', 'null | undefined 可用于省略', '由具体 route map 决定是否存在'],
        ['query value', 'string | number | null | undefined 或其数组', 'string | null 或其数组'],
        ['query 中的 number', '允许作为便捷输入', '内置策略转成 string'],
        ['query 中的 undefined', '顶层键省略；数组项按内置规则归一', '顶层不存在；数组项变为 null'],
      ],
    },
    {
      type: 'text',
      content:
        '这里的 normalized 是 Router 对稳定内置 query 策略的结果。若通过公开的 `RouterOptions.parseQuery` 与 `stringifyQuery` 换用第三方格式，固定源码会保留自定义实现产生的对象；嵌套对象等扩展值域必须由应用同步维护运行时约定和 TypeScript 类型，不能继续把默认 `LocationQuery` 当作完整描述。',
    },
    { type: 'heading', content: 'Route Query And Hash' },
    {
      type: 'text',
      content:
        '`RouteQueryAndHash` 是命名位置和 path 位置共用的内部组合接口，只把可选 `query?: LocationQueryRaw` 与 `hash?: string` 聚合到导航位置类型。它解释了为何 query/hash 可与 path 共存，但不是应用层应直接声明或扩展的接口。',
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`RouteQueryAndHash` 在 5.2.0 固定源码中标记为 internal。应用应使用公开的 `RouteLocationRaw`、Router 导航方法或组件 `to` 属性，不直接依赖该内部拼装接口。',
    },
    { type: 'heading', content: 'Location Query' },
    {
      type: 'text',
      content:
        '`LocationQuery` 是 normalized query：每个字符串键对应一个 `string | null`，重复键对应该值域的数组。它出现在 normalized route location 的 `query` 中；`null` 表示 URL 中存在键但没有等号，例如 `?draft`，空字符串则对应 `?draft=`。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// URL: /search?tag=vue&tag=router&draft&empty=
const query: LocationQuery = {
  tag: ['vue', 'router'],
  draft: null,
  empty: '',
}`,
    },
    {
      type: 'table',
      headers: ['URL 片段', 'normalized 值', '含义'],
      rows: [
        ['?tag=vue', "{ tag: 'vue' }", '单值仍保留为标量'],
        ['?tag=vue&tag=router', "{ tag: ['vue', 'router'] }", '重复键按出现顺序聚合为数组'],
        ['?draft', '{ draft: null }', '键存在但没有等号'],
        ['?draft=', "{ draft: '' }", '键存在且值为空字符串'],
      ],
    },
    { type: 'heading', content: 'Location Query Raw' },
    {
      type: 'text',
      content:
        '`LocationQueryRaw` 是传给 `router.push()`、`router.replace()`、`router.resolve()` 或 RouterLink 的宽松 query 输入。键可为字符串或数字；值额外允许 `number` 与 `undefined`。内置策略会把数字转成字符串、删除值为 `undefined` 的顶层键，并保留重复值数组。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `router.push({
  name: 'search',
  query: {
    page: 2,
    tag: ['vue', 'router'],
    draft: null,
    obsolete: undefined,
  },
})

// 内置策略生成：?page=2&tag=vue&tag=router&draft`,
    },
    { type: 'heading', content: 'Location Query Value' },
    {
      type: 'text',
      content:
        '`LocationQueryValue = string | null` 是 normalized query 的内部叶子类型。它准确区分普通/空字符串值与“有键无等号”的 `null`，但应用应从公开 `LocationQuery` 取得这个值域，不单独依赖内部别名。',
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`LocationQueryValue` 标记为 internal。公开替代面是 `LocationQuery`；需要缩窄某一键时，在应用自己的解析函数中处理 `string | null | (string | null)[] | undefined`。',
    },
    { type: 'heading', content: 'Location Query Value Raw' },
    {
      type: 'text',
      content:
        '`LocationQueryValueRaw = string | null | number | undefined` 是 raw query 的内部叶子类型。`number` 是序列化前的便捷输入，`undefined` 表示省略，`null` 在默认字符串化时保留键但不写 `=`。',
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`LocationQueryValueRaw` 标记为 internal。应用应把公开 `LocationQueryRaw` 作为导航输入契约，不把该内部叶子别名用作跨模块领域类型。',
    },
    { type: 'heading', content: 'Param Value' },
    {
      type: 'text',
      content:
        '`ParamValue<isRaw>` 用布尔泛型表达单段动态参数的双态值域：raw 为 `string | number`，normalized 为 `string`。它是 typed routes 生成类型的基础，不表示 Router 会把 URL 中的数字自动解析为 JavaScript number。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `type RawId = ParamValue<true> // string | number
type NormalizedId = ParamValue<false> // string`,
    },
    { type: 'heading', content: 'Param Value One Or More' },
    {
      type: 'text',
      content:
        '`ParamValueOneOrMore<isRaw>` 对应 `:segment+`。它是非空 tuple `[first, ...rest]`，所以 raw 和 normalized 两侧都至少有一个值；官方 Guide 明确说明命名导航必须传数组，空数组会因无法满足 `+` 而抛错。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// route record: { path: '/docs/:chapters+', name: 'docs' }
router.resolve({
  name: 'docs',
  params: { chapters: ['guide', 'routing'] },
}) // /docs/guide/routing`,
    },
    { type: 'heading', content: 'Param Value Zero Or More' },
    {
      type: 'text',
      content:
        '`ParamValueZeroOrMore<isRaw>` 对应 `:segment*`。raw 允许数组、`undefined` 或 `null`，normalized 为数组或 `undefined`；它可以表示零段。命名导航使用空数组可生成省略该参数的路径，这是它与 `+` 的关键差别。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// route record: { path: '/docs/:chapters*', name: 'docs' }
router.resolve({ name: 'docs', params: { chapters: [] } }) // /docs
router.resolve({ name: 'docs', params: { chapters: ['api', 'types'] } })
// /docs/api/types`,
    },
    { type: 'heading', content: 'Param Value Zero Or One' },
    {
      type: 'text',
      content:
        '`ParamValueZeroOrOne<isRaw>` 对应 `:segment?`。raw 接受字符串、数字、`null` 或 `undefined`，后两者用于省略可选段；normalized 在该工具类型中为字符串。是否缺失及最终属性形状仍以具体生成的 `RouteMap` 为准。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// route record: { path: '/users/:id?', name: 'users' }
router.resolve({ name: 'users', params: { id: null } }) // /users
router.resolve({ name: 'users', params: { id: 42 } }) // /users/42`,
    },
    { type: 'heading', content: 'Route Params' },
    {
      type: 'text',
      content:
        '`RouteParams<Name>` 从 `RouteMap[Name]["params"]` 取得某个命名路由的 normalized params。它保留由 typed routes 生成或模块增强得到的具体键、必填性与 repeatable 数组形状；不传 `Name` 时默认覆盖 `keyof RouteMap`。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `type ReportParams = RouteParams<'report'>

// 例如生成的 RouteMap 可能得到：
// { year: string; sections: string[] }`,
    },
    { type: 'heading', content: 'Route Params Generic' },
    {
      type: 'text',
      content:
        '`RouteParamsGeneric = Record<string, string | string[]>` 是不知道具体 route name 时的 normalized 通用形状。它保留标量与 repeatable 数组差异，但不包含某条 route 的键名、必填性和参数修饰符信息；有可用 `RouteMap` 时优先使用 `RouteParams<Name>`。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const params: RouteParamsGeneric = {
  id: '42',
  chapters: ['guide', 'api'],
}`,
    },
    { type: 'heading', content: 'Route Params Raw' },
    {
      type: 'text',
      content:
        '`RouteParamsRaw<Name>` 从 `RouteMap[Name]["paramsRaw"]` 取得命名导航接受的 params。与 `RouteParams<Name>` 相比，它允许数字输入，并让 optional 或 zero-or-more 参数表达省略；具体 tuple、数组和可选性由生成的 route map 保留。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const target: RouteParamsRaw<'report'> = {
  year: 2026,
  sections: ['sales', 'cost'],
}`,
    },
    { type: 'heading', content: 'Route Params Raw Generic' },
    {
      type: 'text',
      content:
        '`RouteParamsRawGeneric` 是未绑定 route name 的宽松 params 字典。标量可为 `string | number | null | undefined`；数组项刻意排除 `null | undefined`，因此 repeatable 参数数组只能装字符串或数字。它不如 `RouteParamsRaw<Name>` 精确。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const rawParams: RouteParamsRawGeneric = {
  id: 42,
  optional: null,
  chapters: ['guide', 2],
}`,
    },
    { type: 'heading', content: 'Route Param Value' },
    {
      type: 'text',
      content:
        '`RouteParamValue = string` 是非 typed、normalized params 字典的内部叶子别名。它反映固定 Router 在匹配后会解码参数并以字符串保存；repeatable 参数则是这个值的数组。',
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`RouteParamValue` 标记为 internal。应用应读取公开 route location 的 `params`，并使用 `RouteParams<Name>` 或 `RouteParamsGeneric` 描述类型。',
    },
    { type: 'heading', content: 'Route Param Value Raw' },
    {
      type: 'text',
      content:
        '`RouteParamValueRaw = string | number | null | undefined` 是通用 raw params 的内部叶子别名。固定 Router 会在命名导航解析前删除值为 `null` 或 `undefined` 的参数，再对剩余字符串/数字编码。',
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`RouteParamValueRaw` 标记为 internal。应用应通过公开的 `RouteParamsRaw<Name>` 或 `RouteParamsRawGeneric` 表达导航输入，不直接依赖该别名。',
    },
    { type: 'heading', content: 'Parse Query' },
    {
      type: 'text',
      content:
        '`parseQuery(search)` 接受带或不带前导 `?` 的查询字符串并返回 `LocationQuery`。5.2.0 内置实现先把 `+` 当空格，按首个 `=` 分隔键值，解码百分号；无 `=` 的值为 `null`，重复键按出现顺序累积为数组。空串和单独 `?` 返回空对象。',
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`parseQuery()` 在 5.2.0 API 与固定源码中标记为 internal。应用不要把它当通用 query 工具；默认 Router 已内部调用它，需要自定义格式时使用公开的 `RouterOptions.parseQuery` 配置点。',
    },
    {
      type: 'table',
      headers: ['输入', '内置解析结果'],
      rows: [
        ['?q=vue+router', "{ q: 'vue router' }"],
        ['?tag=a&tag=b', "{ tag: ['a', 'b'] }"],
        ['?flag&empty=', "{ flag: null, empty: '' }"],
      ],
    },
    { type: 'heading', content: 'Stringify Query' },
    {
      type: 'text',
      content:
        '`stringifyQuery(query)` 把 `LocationQueryRaw | undefined` 转成不含前导 `?` 的字符串。内置实现编码键和值，重复数组生成重复键；`null` 只输出键，`undefined` 跳过，空字符串保留等号。Router 会在组装完整 URL 时自行添加 `?`。',
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`stringifyQuery()` 标记为 internal。应用应让 Router 使用默认实现，或通过公开的 `RouterOptions.stringifyQuery` 与对应 `parseQuery` 成对提供自定义策略；不要直接把内部函数当稳定工具函数。',
    },
    {
      type: 'table',
      headers: ['raw 值', '内置输出片段'],
      rows: [
        ["{ q: 'vue router' }", 'q=vue+router'],
        ["{ tag: ['a', 'b'] }", 'tag=a&tag=b'],
        ['{ flag: null, skip: undefined }', 'flag'],
        ["{ empty: '' }", 'empty='],
      ],
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '同时传 path 与 params，期待 Router 插值参数',
          description:
            '官方 Programmatic Navigation Guide 明确说明：对象位置包含 `path` 时，`params` 会被忽略；query 不受这个限制。',
          consequence: '目标仍是原始 path，动态参数没有进入 URL，且开发环境会给出诊断信息。',
          wrong: {
            lang: 'ts',
            content: `router.push({
  path: '/users',
  params: { id: 42 },
}) // /users`,
          },
          correct: {
            lang: 'ts',
            content: `router.push({
  name: 'user',
  params: { id: 42 },
}) // /users/42`,
          },
        },
        {
          title: '给 repeatable 参数传标量',
          description:
            '官方 Matching Syntax Guide 规定 `*` 与 `+` 参数在命名导航中使用数组；类型族也用数组或非空 tuple 表达。',
          consequence: '调用不符合生成类型，绕过类型后也可能得到错误路径或匹配错误。',
          wrong: {
            lang: 'ts',
            content: `router.resolve({
  name: 'chapters',
  params: { chapters: 'guide/api' },
})`,
          },
          correct: {
            lang: 'ts',
            content: `router.resolve({
  name: 'chapters',
  params: { chapters: ['guide', 'api'] },
})`,
          },
        },
        {
          title: '给 one-or-more 参数传空数组',
          description:
            '`ParamValueOneOrMore` 是非空 tuple；官方 Guide 的 `:chapters+` 示例也说明空数组无法满足至少一段的要求。',
          consequence: 'Router 无法生成必需的路径段并抛错。',
          wrong: {
            lang: 'ts',
            content: `router.resolve({
  name: 'chapters',
  params: { chapters: [] },
})`,
          },
          correct: {
            lang: 'ts',
            content: `router.resolve({
  name: 'chapters',
  params: { chapters: ['intro'] },
})`,
          },
        },
        {
          title: '把 query 的 null、空字符串和 undefined 当成同一状态',
          description:
            '官方 API 与固定 `query.ts` 区分三者：`null` 表示有键无等号，空字符串保留 `=`，`undefined` 省略该键。',
          consequence: '筛选器、布尔 flag 或链接复制后的语义会改变。',
          wrong: {
            lang: 'ts',
            content: `router.push({
  query: { preview: undefined },
}) // 错误地期待生成 ?preview`,
          },
          correct: {
            lang: 'ts',
            content: `router.push({
  query: { preview: null },
}) // 生成 ?preview`,
          },
        },
        {
          title: '把嵌套对象直接当作默认 LocationQueryRaw',
          description:
            '公开类型只接受扁平叶子值；官方 issue #2165 也确认 `qs` 等嵌套格式不会自动传播到 Vue Router 的默认 query 类型。',
          consequence:
            'TypeScript 契约与实际 parser 输出分离，组件和 RouterLink 无法可靠推断 query。',
          wrong: {
            lang: 'ts',
            content: `router.push({
  query: { filters: { owner: 'me' } },
})`,
          },
          correct: {
            lang: 'ts',
            content: `router.push({
  query: { owner: 'me', tag: ['vue', 'router'] },
})`,
          },
        },
        {
          title: '只替换 parseQuery，不替换 stringifyQuery',
          description:
            '官方 RouterOptions API 的 `qs` 示例成对提供两个配置；解析 URL 与对象导航必须遵守同一格式。',
          consequence: '读取到的嵌套结构无法按相同约定写回 URL，往返后结构或编码发生变化。',
          wrong: {
            lang: 'ts',
            content: `createRouter({
  history,
  routes,
  parseQuery: qs.parse,
})`,
          },
          correct: {
            lang: 'ts',
            content: `createRouter({
  history,
  routes,
  parseQuery: qs.parse,
  stringifyQuery: qs.stringify,
})`,
          },
        },
        {
          title: '自定义 stringifyQuery 返回前导问号',
          description:
            '官方 API 明确要求返回值不含 `?`；Router 在组合 pathname、search 与 hash 时负责添加分隔符。',
          consequence: '最终 URL 可能出现双问号或产生不符合 parser 预期的查询字符串。',
          wrong: {
            lang: 'ts',
            content: `createRouter({
  history,
  routes,
  // 该实现错误地返回带前导问号的字符串。
  stringifyQuery: stringifyWithLeadingQuestionMark,
})`,
          },
          correct: {
            lang: 'ts',
            content: `createRouter({
  history,
  routes,
  stringifyQuery: qs.stringify,
  parseQuery: qs.parse,
})`,
          },
        },
        {
          title: '直接导入 internal query 函数作为应用工具',
          description:
            '`parseQuery` 与 `stringifyQuery` 虽出现在 API 索引和根声明中，5.2.0 标签仍是 internal，稳定公开 seam 是 Router 的默认行为与 RouterOptions 配置。',
          consequence: '应用与内部导出及其细节耦合，后续版本可在不维持应用工具契约的情况下调整。',
          wrong: {
            lang: 'ts',
            content: `import { parseQuery } from 'vue-router'

const filters = parseQuery(location.search)`,
          },
          correct: {
            lang: 'ts',
            content: `const router = createRouter({
  history,
  routes,
  parseQuery: qs.parse,
  stringifyQuery: qs.stringify,
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
          title: '1. 从 route 语法确定参数形状',
          content:
            '固定 `typed-routes/params.ts` 用普通、`+`、`*`、`?` 四类工具类型表达单值、非空 tuple、可空数组和可省略单值。应用设计 route record 时先根据 URL 段数选择修饰符，再让生成的 `RouteMap` 提供精确 `RouteParams<Name>`，不要用通用字典抹掉约束。',
        },
        {
          title: '2. 命名导航先清理并编码 raw params',
          content:
            '固定 `router.ts` 在没有显式 path 的对象导航中复制 `rawLocation.params`，删除 `null`/`undefined`，再逐值编码后交给 matcher。匹配完成后又解码并把剩余值字符串化，因此 number 只是 raw 输入便利，稳定 normalized params 仍是字符串或字符串数组。适合让 Router 负责 path 插值和编码。',
        },
        {
          title: '3. 内置 parseQuery 保留 URL 的可观察差异',
          content:
            '固定 `query.ts` 接受有无 `?` 的 search，把 `+` 预处理为空格，并只在首个 `=` 处分割。没有等号得到 `null`，空等号得到空字符串，重复键累积成数组。适合常规扁平 query；它在该版本标记 internal，不是应用通用 parser。',
        },
        {
          title: '4. 内置 stringify 与 normalize 形成默认往返',
          content:
            '同一源码中 `stringifyQuery` 不添加 `?`：null 只写键，undefined 跳过，数组写重复键。`normalizeQuery` 再把数字转字符串、移除顶层 undefined、把数组中的 nullish 值转为 null。由此得到 `LocationQueryRaw` 到 `LocationQuery` 的默认契约，适合 URL 可分享的标量筛选条件。',
        },
        {
          title: '5. 自定义 query 策略必须拥有完整边界',
          content:
            '固定 `router.ts` 仅在使用内置 stringify 时调用 `normalizeQuery`；自定义策略的对象会被保留。官方 RouterOptions 示例要求 parse/stringify 成对配置，issue #2165 则确认嵌套 query 类型不会自动传播。适合确有后端兼容格式时集中封装，并由应用自行提供类型、测试与往返约束。',
        },
        {
          title: '6. 应用只依赖公开组合面',
          content:
            '`RouteQueryAndHash`、两个叶子 query 值类型、两个通用 param 叶子类型以及 parse/stringify 函数都带 internal 标签。应用使用 `RouteLocationRaw`、`LocationQueryRaw`、`RouteParams<Name>`、Router 导航方法和 `RouterOptions`；内部符号只用于理解声明如何拼装，不作为业务模块依赖。',
        },
      ],
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// 精简自 vuejs/router 5.2.0 固定 commit 的 query.ts 与 router.ts
/** 把默认 raw query 规范化为路由对外暴露的字符串值域。 */
function normalizeQuery(query: LocationQueryRaw | undefined): LocationQuery {
  const normalized: LocationQuery = {}

  for (const key in query) {
    const value = query[key]
    if (value === undefined) continue

    normalized[key] = Array.isArray(value)
      ? value.map((item) => (item == null ? null : String(item)))
      : value == null
        ? value
        : String(value)
  }

  return normalized
}

// Router 只在使用内置 stringifyQuery 时调用上面的 normalizeQuery；
// 自定义 query 库的返回对象由应用自行维护契约。`,
    },
  ],
})
