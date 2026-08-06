---
id: vue.router.reference.experimental.watchlist
type: reference
title: Experimental 观察清单
summary: 冻结两个实验入口的 86 项导出、构建 flag、文档冲突与升级核验边界
domain: frontend
technology: vue
module: router
related:
  - vue.router.reference.file-based.overview
  - vue.router.reference.file-based.virtual-modules
  - vue.router.reference.tooling.unplugin
  - vue.router.reference.typed-routes.route-map
tags:
  - Vue Router
  - experimental
  - Router Resolver
  - Param Parsers
  - Data Loaders
  - watchlist
appliesTo: Vue Router 5.2.0
verifiedAt: 2026-08-04
sources:
  - title: Vue Router Experimental Router Resolver
    url: https://router.vuejs.org/experimental/router-resolver
  - title: Vue Router Experimental Param Parsers
    url: https://router.vuejs.org/experimental/param-parsers
  - title: Vue Router Experimental Basic Data Loader
    url: https://router.vuejs.org/data-loaders/basic/
  - title: "Vue Router Extending Routes: definePage"
    url: https://router.vuejs.org/file-based-routing/extending-routes#definepage
  - title: Vue Router Typed Routes Guide
    url: https://router.vuejs.org/guide/advanced/typed-routes
  - title: Vue Router 5.2.0 package.json 固定源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/package.json
  - title: Vue Router 5.2.0 experimental 入口固定源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/experimental/index.ts
  - title: Vue Router 5.2.0 Pinia Colada loader 固定源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/experimental/data-loaders/defineColadaLoader.ts
  - title: Vue Router 5.2.0 unplugin options 固定源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/unplugin/options.ts
  - title: Vue Router 固定 commit 6e5f8d2
    url: https://github.com/vuejs/router/commit/6e5f8d253b9444a76eb58f176ebe08d686c937cb
group: experimental
signature: |-
  watchlist surface: vue-router/experimental (26 runtime + 50 type-only)
  watchlist surface: vue-router/experimental/pinia-colada (1 runtime + 9 type-only)
anchors:
  - 概述
  - Experimental Router 清单
  - Pinia Colada 清单
  - 实验配置 Flags
  - 稳定性与冲突账本
  - 易错使用提示
  - 源码推导与适用场景
---

# Experimental 观察清单

## 概述

本页是 Vue Router 5.2.0 的独立 experimental watchlist，只登记两个子路径的发布事实、官方警告与待观察冲突。86 项全部不属于稳定根入口的 118 项分母，不适合形成生产承诺，也不能因为可导入、可运行或仅在类型层出现就升级为稳定 API。

:::warning
本页不创建 Demo，不从 experimental 入口执行任何导入，也不引入或调用 Pinia Colada 依赖。需要评估实验能力时，只能在锁定 5.2.0 的隔离研究环境中进行，并保留默认关闭的 feature flag、验证清单与可删除适配层。
:::

## Experimental Router 清单

`vue-router/experimental` 在固定发布物中包含 26 个 runtime 与 50 个 type-only 导出。形态来自声明文件 export clause；type-only 只表示不会产生运行时值，不表示获得稳定性承诺。

| 导出名 | 形态 | 入口 | 边界 |
| --- | --- | --- | --- |
| DataLoaderPlugin | runtime | vue-router/experimental | experimental runtime；仅用于固定版本研究，不作生产承诺 |
| MatcherPatternPathDynamic | runtime | vue-router/experimental | experimental runtime；仅用于固定版本研究，不作生产承诺 |
| MatcherPatternPathStatic | runtime | vue-router/experimental | experimental runtime；仅用于固定版本研究，不作生产承诺 |
| MatcherPatternQueryParam | runtime | vue-router/experimental | experimental runtime；仅用于固定版本研究，不作生产承诺 |
| NavigationResult | runtime | vue-router/experimental | experimental runtime；仅用于固定版本研究，不作生产承诺 |
| PARAM_PARSER_BOOL | runtime | vue-router/experimental | experimental runtime；仅用于固定版本研究，不作生产承诺 |
| PARAM_PARSER_INT | runtime | vue-router/experimental | experimental runtime；仅用于固定版本研究，不作生产承诺 |
| _MatchMiss | runtime | vue-router/experimental | experimental runtime；仅用于固定版本研究，不作生产承诺 |
| _NavigationResult | runtime | vue-router/experimental | experimental runtime；仅用于固定版本研究，不作生产承诺 |
| _mergeRouteRecord | runtime | vue-router/experimental | experimental runtime；仅用于固定版本研究，不作生产承诺 |
| _normalizeParamParser | runtime | vue-router/experimental | experimental runtime；仅用于固定版本研究，不作生产承诺 |
| createFixedResolver | runtime | vue-router/experimental | experimental runtime；仅用于固定版本研究，不作生产承诺 |
| defineBasicLoader | runtime | vue-router/experimental | experimental runtime；仅用于固定版本研究，不作生产承诺 |
| definePage | runtime | vue-router/experimental | experimental runtime；仅用于固定版本研究，不作生产承诺 |
| defineParamParser | runtime | vue-router/experimental | experimental runtime；仅用于固定版本研究，不作生产承诺 |
| defineParamParserRaw | runtime | vue-router/experimental | experimental runtime；仅用于固定版本研究，不作生产承诺 |
| experimental_createRouter | runtime | vue-router/experimental | experimental runtime；仅用于固定版本研究，不作生产承诺 |
| getCurrentContext | runtime | vue-router/experimental | experimental runtime；仅用于固定版本研究，不作生产承诺 |
| miss | runtime | vue-router/experimental | experimental runtime；仅用于固定版本研究，不作生产承诺 |
| normalizeRouteRecord | runtime | vue-router/experimental | experimental runtime；仅用于固定版本研究，不作生产承诺 |
| reroute | runtime | vue-router/experimental | experimental runtime；仅用于固定版本研究，不作生产承诺 |
| setCurrentContext | runtime | vue-router/experimental | experimental runtime；仅用于固定版本研究，不作生产承诺 |
| toLazyValue | runtime | vue-router/experimental | experimental runtime；仅用于固定版本研究，不作生产承诺 |
| trackRoute | runtime | vue-router/experimental | experimental runtime；仅用于固定版本研究，不作生产承诺 |
| useIsDataLoading | runtime | vue-router/experimental | experimental runtime；仅用于固定版本研究，不作生产承诺 |
| withLoaderContext | runtime | vue-router/experimental | experimental runtime；仅用于固定版本研究，不作生产承诺 |
| DataLoaderBasicEntry | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| DataLoaderContext | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| DataLoaderContextBase | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| DataLoaderEntryBase | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| DataLoaderPluginOptions | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| DefineDataLoaderOptions | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| DefineDataLoaderOptionsBase_DefinedData | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| DefineDataLoaderOptionsBase_LaxData | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| DefineDataLoaderOptions_DefinedData | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| DefineDataLoaderOptions_LaxData | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| DefineLoaderFn | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| DefinePage | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| DefinePageQueryParamOptions | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| EXPERIMENTAL_RouteRecordNormalized | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| EXPERIMENTAL_RouteRecordNormalized_Group | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| EXPERIMENTAL_RouteRecordNormalized_Matchable | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| EXPERIMENTAL_RouteRecordRaw | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| EXPERIMENTAL_RouteRecord_Base | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| EXPERIMENTAL_RouteRecord_Group | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| EXPERIMENTAL_RouteRecord_Matchable | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| EXPERIMENTAL_Router | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| EXPERIMENTAL_RouterOptions | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| EXPERIMENTAL_RouterOptions_Base | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| EXPERIMENTAL_Router_Base | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| EmptyParams | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| ErrorDefault | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| MatcherParamsFormatted | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| MatcherPattern | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| MatcherPatternHash | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| MatcherPatternPath | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| MatcherPatternPathDynamic_ParamOptions | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| MatcherPatternQuery | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| MatcherQueryParams | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| MatcherQueryParamsValue | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| ParamParser | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| ParamParserType | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| ParamParserTypeOf | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| ParamParserType_Native | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| SetupLoaderGuardOptions | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| UseDataLoader | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| UseDataLoaderBasic | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| UseDataLoaderBasic_DefinedData | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| UseDataLoaderBasic_LaxData | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| UseDataLoaderInternals | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| UseDataLoaderResult | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| _DefinePageQueryParamOptionsAny | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| _ExtractParamParserType | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| _ParamParsers | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| _ParamParsers_Native | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |
| _PathParamNamesForFilePath | type-only | vue-router/experimental | experimental type-only；编译期形态不代表稳定 |

## Pinia Colada 清单

`vue-router/experimental/pinia-colada` 在固定发布物中包含 1 个 runtime 与 9 个 type-only 导出。它是可选实验适配面；下表只做静态盘点，本站页面本身不安装、导入或调用 `@pinia/colada`。

| 导出名 | 形态 | 入口 | 边界 |
| --- | --- | --- | --- |
| defineColadaLoader | runtime | vue-router/experimental/pinia-colada | experimental adapter runtime；本页不引入或调用 Pinia Colada |
| DataColadaLoaderContext | type-only | vue-router/experimental/pinia-colada | experimental adapter type-only；本页不引入 Pinia Colada |
| DataLoaderColadaEntry | type-only | vue-router/experimental/pinia-colada | experimental adapter type-only；本页不引入 Pinia Colada |
| DefineDataColadaLoaderOptions | type-only | vue-router/experimental/pinia-colada | experimental adapter type-only；本页不引入 Pinia Colada |
| DefineDataColadaLoaderOptions_DefinedData | type-only | vue-router/experimental/pinia-colada | experimental adapter type-only；本页不引入 Pinia Colada |
| DefineDataColadaLoaderOptions_LaxData | type-only | vue-router/experimental/pinia-colada | experimental adapter type-only；本页不引入 Pinia Colada |
| UseDataLoaderColadaResult | type-only | vue-router/experimental/pinia-colada | experimental adapter type-only；本页不引入 Pinia Colada |
| UseDataLoaderColada_DefinedData | type-only | vue-router/experimental/pinia-colada | experimental adapter type-only；本页不引入 Pinia Colada |
| UseDataLoaderColada_LaxData | type-only | vue-router/experimental/pinia-colada | experimental adapter type-only；本页不引入 Pinia Colada |
| _DefineDataColadaLoaderOptions_Common | type-only | vue-router/experimental/pinia-colada | experimental adapter type-only；本页不引入 Pinia Colada |

## 实验配置 Flags

固定 `src/unplugin/options.ts` 把以下两个键放在 `experimental` 配置对象下，并明确警告它们可能在 patch release 中改变或移除。它们属于构建期插件选项，不是稳定 RouterOptions，也不应静默进入常规项目模板。

| 配置键 | 固定源码作用 | RA6 观察要求 |
| --- | --- | --- |
| experimental.autoExportsDataLoaders | 按配置目录自动发现并导出 Data Loaders | 锁定精确版本；隔离生成结果；升级时重跑 build/type 清单；生产默认关闭 |
| experimental.paramParsers | 启用内建或自定义参数解析器的扫描、生成与类型接线 | 锁定精确版本；记录 parser 输入输出；升级时重验 URL 往返；生产默认关闭 |

:::tip
`vue-router/auto-resolver` 是由文件路由插件提供的构建期虚拟模块入口；它与 `vue-router/experimental` 中 resolver、matcher 和 router 的运行时实验语义不是同一层。package export 能解析 auto-resolver，只证明构建入口存在，不能把 experimental router 升级为稳定能力。
:::

## 稳定性与冲突账本

| 观察域 | 一手信号 | RA6 处理 |
| --- | --- | --- |
| Experimental Router | Router Resolver 官方页明确不适合生产，只用于测试与反馈 | 独立 watchlist；研究环境锁定 5.2.0；不提供稳定推荐或生产承诺 |
| Param Parsers | Param Parsers 官方页明确 API 与 ergonomics 仍可变化 | 记录 runtime/type-only 形态与 flag；示例只表达隔离验证边界 |
| Data Loaders | Basic Loader 官方页明确标为 experimental；Pinia Colada 另有可选适配入口 | basic 与 colada 共用 RA6 边界；本页不引入或调用 Pinia Colada |
| Unplugin Experimental Flags | `experimental.autoExportsDataLoaders` 与 `experimental.paramParsers` 可在 patch release 改变或移除 | 记录 flag、精确版本和移除风险；与稳定构建配置分离并默认关闭 |
| definePage | Extending Routes Guide 称从 `vue-router` 导入；5.2.0 根发布物无该导出，experimental 入口有 | 保留 Guide/发布物 mismatch；原因未知，不自行判定文档错误、稳定或废弃 |
| Typed Routes | 19 项从根入口导出且普通 Guide 未标 experimental；固定源码仍写 `Experimental Type Safe API` | RA5 保留根导出事实；RA6 记录 Guide/源码混合信号，不用单一证据宣布稳定性 |

该账本只陈列在 2026-08-04 可复核的一手信号。definePage 的 Guide/发布物 mismatch 与 Typed Routes 的根导出/Guide/源码混合信号均没有找到官方原因说明；后续版本必须重新核对，而不是继承推测。

## 易错使用提示

:::pitfalls
### 把 experimental 子路径纳入稳定 118 项

**触发条件：** 把 experimental 子路径纳入稳定 118 项

**原因：** 118 项只统计固定包根入口的稳定清单；两个 experimental specifier 是独立发布面。

**后果：** 覆盖率分母被污染，团队把观察项误写成已经承诺的生产 API。

**错误示例：**

~~~~text
稳定 API：118 + 86 = 204 项
~~~~

**正确写法：**

~~~~text
稳定清单：118 / 118
experimental watchlist：76 + 10（不计入稳定分母）
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 type-only 形态当成稳定性标签

**触发条件：** 把 type-only 形态当成稳定性标签

**原因：** 声明文件中的 `type` 只区分编译期导出与运行时值，不提供兼容性等级。

**后果：** 类型别名进入公共契约后仍可能随实验 API 变化，升级影响被错误忽略。

**错误示例：**

~~~~ts
// type-only，所以可以视为稳定公共契约
type PublicRouter = EXPERIMENTAL_Router
~~~~

**正确写法：**

~~~~ts
type WatchlistRecord = {
  specifier: 'vue-router/experimental'
  form: 'type-only'
  stability: 'experimental'
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 把实验 Router 直接作为生产 Router

**触发条件：** 把实验 Router 直接作为生产 Router

**原因：** Router Resolver 官方页明确说明新 Router 不适合生产，只邀请测试与反馈。

**后果：** 应用把可变化的 matcher、route record 与导航行为变成线上兼容承诺。

**错误示例：**

~~~~text
生产入口 -> experimental_createRouter() -> 全量用户
~~~~

**正确写法：**

~~~~text
隔离研究目录 + vue-router@5.2.0
-> 默认关闭的 feature flag
-> 固定验证清单
-> 不进入生产入口
~~~~

**验证方式：** 对照正确写法验证结果。

### 无版本闸门地启用 experimental 构建 flag

**触发条件：** 无版本闸门地启用 experimental 构建 flag

**原因：** 固定 options 源码警告 experimental 配置可能在 patch release 中改变或移除。

**后果：** 一次依赖更新即可改变生成 routes、loader exports 或参数类型，且缺少归因证据。

**错误示例：**

~~~~ts
VueRouter({
  experimental: { autoExportsDataLoaders: true },
})
~~~~

**正确写法：**

~~~~ts
const experimentChecklist = {
  exactVersion: '5.2.0',
  productionEnabled: false,
  verify: ['generated routes', 'generated d.ts', 'URL round-trip'],
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 为阅读清单引入 Pinia Colada

**触发条件：** 为阅读清单引入 Pinia Colada

**原因：** Pinia Colada 子路径是可选实验适配面；盘点名称不要求安装、导入或执行依赖。

**后果：** 文档页面无故扩大依赖图，还可能让类型解析结果被误当成已完成集成验证。

**错误示例：**

~~~~ts
import { defineColadaLoader } from 'vue-router/experimental/pinia-colada'

defineColadaLoader({ /* 仅为确认导出而调用 */ })
~~~~

**正确写法：**

~~~~ts
const observedSurface = {
  specifier: 'vue-router/experimental/pinia-colada',
  runtime: 1,
  typeOnly: 9,
  dependencyLoaded: false,
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 替 definePage 的 Guide/发布物矛盾编造原因

**触发条件：** 替 definePage 的 Guide/发布物矛盾编造原因

**原因：** 官方 Guide 指向根入口，而固定 5.2.0 发布物只从 experimental 子路径导出 definePage；没有官方澄清原因。

**后果：** 推测被固化成迁移结论，后续修正文档或发布物时无法区分事实与解释。

**错误示例：**

~~~~text
结论：官方已决定 definePage 稳定，只是打包遗漏
~~~~

**正确写法：**

~~~~text
Guide 信号：从 vue-router 导入
5.2.0 发布物：仅 experimental 入口导出
原因：未知，等待官方澄清
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 auto-resolver 当成运行时稳定 Router

**触发条件：** 把 auto-resolver 当成运行时稳定 Router

**原因：** `vue-router/auto-resolver` 是构建期虚拟模块；experimental router 是另一层运行时表面。

**后果：** 构建期 export-map 事实被错误外推成 matcher、param parser 与 router 的稳定承诺。

**错误示例：**

~~~~text
auto-resolver 可解析 -> experimental router 已稳定
~~~~

**正确写法：**

~~~~text
构建期：vue-router/auto-resolver
运行时实验面：vue-router/experimental
两层分别核对，不互相升级稳定性
~~~~

**验证方式：** 对照正确写法验证结果。

### 用单一信号概括全部 Typed Routes

**触发条件：** 用单一信号概括全部 Typed Routes

**原因：** 固定版本同时存在根导出、未标 experimental 的 Guide，以及源码 `Experimental Type Safe API` 注释。

**后果：** 团队要么错误放大生产承诺，要么把已存在的根入口使用事实全部抹去。

**错误示例：**

~~~~text
根入口可导出，所以全部稳定
或
源码有 Experimental 注释，所以全部不可用
~~~~

**正确写法：**

~~~~ts
// 使用固定 5.2.0 根入口的公开类型，同时保留混合信号观察项。
import type { RouteMap } from 'vue-router'
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 源码推导与适用场景

:::steps
### 1. Export clause 决定 26+50 与 1+9 的形态

固定 `dist/experimental/index.d.ts` 与 `pinia-colada.d.ts` 的最终 export clause 明确区分带 `type` 与不带 `type` 的名称。适合机械核对发布物表面；不能从名称前缀或声明种类猜测 runtime/type-only。

### 2. Package 子路径把 86 项隔离在稳定分母之外

固定 package.json 为两个 experimental 子路径提供独立 export key，而稳定 118 项来自根入口。适合维护单独升级 watchlist；不适合把 package 可解析性转换成生产兼容承诺。

### 3. Auto-resolver 与 experimental router 分属构建期和运行时

文件插件在构建期提供 `vue-router/auto-resolver` 虚拟模块，固定 experimental 源码则承载 resolver、matcher、param parser 与 router 值。适合沿生成物到运行时的边界排查问题；不适合用一个入口的存在证明另一层稳定。

### 4. 两个 experimental flags 要求精确版本反馈环

固定 unplugin options 将 loader auto-export 与 param parser 放入 experimental，并给出 patch 级变化或移除警告。适合在隔离分支用输入、生成 routes、生成 d.ts 与 URL 往返组成验证清单；不适合作为默认构建模板。

### 5. Data Loader core 与 Colada adapter 是分开的实验层

主 experimental 入口暴露 Basic Loader、plugin、context 与结果类型，Pinia Colada 子路径只增加专用 loader 和类型。适合在依赖评估中分别记录 core 与 adapter；仅维护清单时无需引入或调用 Pinia Colada。

### 6. definePage mismatch 只能形成待观察事实

Extending Routes Guide 的根入口写法与固定 5.2.0 发布物的 experimental 导出位置不一致，且没有官方原因说明。适合在每次升级时同时重查 Guide 与 package；不适合自行宣布文档错误、打包遗漏或稳定化计划。

### 7. Typed Routes 必须同时保留三个层次的信号

固定根入口导出、普通 Advanced Guide 与源码 `Experimental Type Safe API` 注释共同构成混合信号。适合继续从根入口使用已记录的公开类型并单独观察源码标签；不适合用任何单一层次概括全部 19 项。
:::
