import { describe, expect, it } from 'vitest'
import { learningCatalog } from '@/content/catalog'

const experimentalRuntime = `
DataLoaderPlugin
MatcherPatternPathDynamic
MatcherPatternPathStatic
MatcherPatternQueryParam
NavigationResult
PARAM_PARSER_BOOL
PARAM_PARSER_INT
_MatchMiss
_NavigationResult
_mergeRouteRecord
_normalizeParamParser
createFixedResolver
defineBasicLoader
definePage
defineParamParser
defineParamParserRaw
experimental_createRouter
getCurrentContext
miss
normalizeRouteRecord
reroute
setCurrentContext
toLazyValue
trackRoute
useIsDataLoading
withLoaderContext
`
  .trim()
  .split(/\s+/)

const experimentalTypeOnly = `
DataLoaderBasicEntry
DataLoaderContext
DataLoaderContextBase
DataLoaderEntryBase
DataLoaderPluginOptions
DefineDataLoaderOptions
DefineDataLoaderOptionsBase_DefinedData
DefineDataLoaderOptionsBase_LaxData
DefineDataLoaderOptions_DefinedData
DefineDataLoaderOptions_LaxData
DefineLoaderFn
DefinePage
DefinePageQueryParamOptions
EXPERIMENTAL_RouteRecordNormalized
EXPERIMENTAL_RouteRecordNormalized_Group
EXPERIMENTAL_RouteRecordNormalized_Matchable
EXPERIMENTAL_RouteRecordRaw
EXPERIMENTAL_RouteRecord_Base
EXPERIMENTAL_RouteRecord_Group
EXPERIMENTAL_RouteRecord_Matchable
EXPERIMENTAL_Router
EXPERIMENTAL_RouterOptions
EXPERIMENTAL_RouterOptions_Base
EXPERIMENTAL_Router_Base
EmptyParams
ErrorDefault
MatcherParamsFormatted
MatcherPattern
MatcherPatternHash
MatcherPatternPath
MatcherPatternPathDynamic_ParamOptions
MatcherPatternQuery
MatcherQueryParams
MatcherQueryParamsValue
ParamParser
ParamParserType
ParamParserTypeOf
ParamParserType_Native
SetupLoaderGuardOptions
UseDataLoader
UseDataLoaderBasic
UseDataLoaderBasic_DefinedData
UseDataLoaderBasic_LaxData
UseDataLoaderInternals
UseDataLoaderResult
_DefinePageQueryParamOptionsAny
_ExtractParamParserType
_ParamParsers
_ParamParsers_Native
_PathParamNamesForFilePath
`
  .trim()
  .split(/\s+/)

const coladaRuntime = ['defineColadaLoader']

const coladaTypeOnly = `
DataColadaLoaderContext
DataLoaderColadaEntry
DefineDataColadaLoaderOptions
DefineDataColadaLoaderOptions_DefinedData
DefineDataColadaLoaderOptions_LaxData
UseDataLoaderColadaResult
UseDataLoaderColada_DefinedData
UseDataLoaderColada_LaxData
_DefineDataColadaLoaderOptions_Common
`
  .trim()
  .split(/\s+/)

describe('Vue Router Reference RA6', () => {
  it('独立登记 Experimental 86 项且不改变稳定 118 项', async () => {
    const overview = learningCatalog.getReferenceOverview({ ecosystem: 'vue', module: 'router' })
    const navigation = learningCatalog.getNavigation({
      purpose: 'reference',
      ecosystem: 'vue',
      module: 'router',
      collection: 'experimental',
    })

    expect({ available: overview?.availableCount, total: overview?.total }).toEqual({
      available: 118,
      total: 118,
    })
    expect(overview?.groups.some((group) => group.id === 'experimental')).toBe(false)
    expect(navigation.entries.map((entry) => entry.entryId)).toEqual([
      'vue.router.reference.experimental.watchlist',
    ])

    const entry = await learningCatalog.loadEntry('vue.router.reference.experimental.watchlist')
    expect('signature' in entry).toBe(true)
    if (!('signature' in entry)) throw new Error('RA6 watchlist 必须是 ReferenceEntry')

    expect(entry.meta.collection).toBe('experimental')
    expect(entry.signature.trim().length).toBeGreaterThan(0)
    expect(entry.meta.anchors).toEqual(
      expect.arrayContaining([
        'Experimental Router 清单',
        'Pinia Colada 清单',
        '实验配置 Flags',
        '稳定性与冲突账本',
        '易错使用提示',
        '源码推导与适用场景',
      ]),
    )
    expect(entry.blocks.flatMap((block) => (block.type === 'demo' ? [block.id] : []))).toEqual([])

    const tables = entry.blocks.filter((block) => block.type === 'table')
    const exportRows = tables
      .filter((table) => table.headers.join('|') === '导出名|形态|入口|边界')
      .flatMap((table) => table.rows)
    // 按入口和导出形态提取实验清单名称，便于逐项比对固定声明。
    const namesFor = (entryPoint: string, form: string) =>
      exportRows
        .filter((row) => row[1] === form && row[2] === entryPoint)
        .map((row) => row[0])
        .sort()

    expect(namesFor('vue-router/experimental', 'runtime')).toEqual([...experimentalRuntime].sort())
    expect(namesFor('vue-router/experimental', 'type-only')).toEqual(
      [...experimentalTypeOnly].sort(),
    )
    expect(namesFor('vue-router/experimental/pinia-colada', 'runtime')).toEqual(
      [...coladaRuntime].sort(),
    )
    expect(namesFor('vue-router/experimental/pinia-colada', 'type-only')).toEqual(
      [...coladaTypeOnly].sort(),
    )

    const ledgerRows = tables.find(
      (table) => table.headers.join('|') === '观察域|一手信号|RA6 处理',
    )?.rows
    expect(ledgerRows?.map((row) => row[0])).toEqual([
      'Experimental Router',
      'Param Parsers',
      'Data Loaders',
      'Unplugin Experimental Flags',
      'definePage',
      'Typed Routes',
    ])
    expect(JSON.stringify(entry.blocks)).toEqual(
      expect.stringContaining('experimental.autoExportsDataLoaders'),
    )
    expect(JSON.stringify(entry.blocks)).toEqual(
      expect.stringContaining('experimental.paramParsers'),
    )
  })
})
