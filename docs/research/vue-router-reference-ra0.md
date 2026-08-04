# Vue Router Reference RA0 官方研究与实施冻结

> 状态：`RA0 / research-only`，本文所有 API 项均为 `planned`
>
> 查证日期：2026-08-04（Asia/Shanghai）
>
> 适用版本：本地与 lockfile 的 `vue-router@5.2.0`
>
> 固定 tag：[`v5.2.0`](https://github.com/vuejs/router/tree/v5.2.0)
>
> annotated tag object：`976cfd47a97455e5881584a539a7021d58851071`
>
> 固定 tag commit：[`6e5f8d253b9444a76eb58f176ebe08d686c937cb`](https://github.com/vuejs/router/commit/6e5f8d253b9444a76eb58f176ebe08d686c937cb)
>
> 审计 manifest：`src/content/catalog/manifests/vue-router-track.ts`
>
> Manifest SHA-256：`b72fe57976a3d8a176424095b6b53bd1f0c30ff27df56c00c2e851c8c49fda2e`
>
> 本地主入口声明 SHA-256：`472e36ac43172da8c45ce15d74315de621b06f17dbe2241e6cb001454794345a`

## RA0 结论

1. 计划中的 **23 个 runtime + 95 个 type-only = 118 个主入口导出精确成立**。本地
   `node_modules/vue-router/dist/vue-router.d.ts` 的单一 `ExportDeclaration` 与当前官网
   [API Reference](https://router.vuejs.org/api) 的五类集合逐名相等：
   `officialOnly=[]`、`localOnly=[]`。
2. 官网分类为 2 Enumerations + 49 Interfaces + 45 Type Aliases + 8 Variables + 14
   Functions = 118；没有 Classes。118 是稳定**主入口 surface** 的分母，不包含 Router
   实例成员、构建期子路径或 experimental 子路径。
3. `@internal`、`@alpha`、`@deprecated` 是导出项自身的一手标签，不能因位于主入口就提升为
   推荐 API。本次固定源码机械得到 `public=81`、`internal=35`、`alpha=1`、
   `deprecated=1`。
4. Reference 不机械创建 118 页。本文冻结 14 个稳定详情页目标，每个 API 保留唯一
   `apiId`、官网 URL、覆盖深度和独立 heading anchor；未来总览项只有在详情 entry 与 anchor
   同批存在后才能转成 `available`。
5. RA0 只交付本文。**不创建**结构化 Reference index、Reference 正文、Demo、registry、测试、
   manifest 或配置；不启动服务、不打开页面、不构建、不提交。完成本文即停，不进入 RA1。

## 版本与机械核验方法

### 发布快照

| 证据 | 冻结值 |
| --- | --- |
| npm 固定版本 | [`vue-router@5.2.0`](https://www.npmjs.com/package/vue-router/v/5.2.0) |
| npm 发布时间 | `2026-07-15T10:08:16.829Z` |
| GitHub release | [`v5.2.0`](https://github.com/vuejs/router/releases/tag/v5.2.0)，发布于 `2026-07-15T10:08:20Z` |
| tarball | `https://registry.npmjs.org/vue-router/-/vue-router-5.2.0.tgz` |
| tarball integrity | `sha512-QAC5i0LEb1GLG0LXDQmHu8L7FX12j0KwU/JTKmLQUJMrn04gQdKP6Du+p0QwpHb3iy71vBlqnHQ8WAfOSAWhqw==` |
| 本地 package.json SHA-256 | `2335fd2f2fef50185406de62a05747928b7d3f6fa554d370ecbd539869b59455` |
| lockfile SHA-256 | `6a68e9e91d6b08c740fdcdecdf64951639e7aba78f1acd4d766c7c6f9b1e1c98` |

Release notes 只声明一项 feature（helpful diagnostics）和三项 fix（Pinia 4、忽略过期异步
`scrollBehavior` 结果、unplugin 拒绝 `[x+hh]` 中非法十六进制字符）。这些发布说明不改变
本次按声明文件冻结 public surface 的口径。

### 可复算步骤

1. 用 TypeScript AST 读取 `dist/vue-router.d.ts` 的单一 `ExportDeclaration`，按
   `ExportSpecifier.isTypeOnly` 分类；别名按公开名归一化：
   `START_LOCATION_NORMALIZED as START_LOCATION`、`RouterClassic as _RouterClassic`。
2. 通过 Tavily 定位当前官网 `/api`，再机械读取五个 TypeDoc 分类的名称与 URL。
3. 对两侧名称集合做严格差集；结果均为空。查证时官网
   [API Reference](https://router.vuejs.org/api/) 与本地固定声明逐名相等；固定
   [`src/index.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/index.ts)
   和查证时 main 对应文件也相同。
4. 用 TypeScript TypeChecker 追到 alias target 的 JSDoc，提取 `@internal`、`@alpha`、
   `@deprecated`；未出现这些标签的项记为 `public`，不根据下划线或名称猜测。
5. 用固定 commit 的 [`src/index.ts`](https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/index.ts)、
   [`router.ts`](https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/router.ts)
   与 [`package.json`](https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/package.json)
   复核根入口、Router 成员和 package subpaths。

`depth` 采用 Vue Core Reference 的三档口径：`detail` 为完整主参考；`merged` 为合并页中的
完整独立 heading；`quick` 为低层、internal、deprecated 或只需边界说明的独立 heading。
`quick` 仍必须有可定位目标，不能只在正文中顺带提及。

## 官网分类盘点

### Guide 一级组

当前 Guide 共 6 个一级组、48 个条目：Setup 2、Essentials 11、Advanced 12、File-Based
Routing 8、Data Loaders 13、Migration 2。固定来源为
[`en.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/docs/.vitepress/config/en.ts)，
其中 Router Resolver、Param Parsers 的条目名显式包含 experimental；Data Loaders 的实验性边界
由 Basic Loader 正文单独复核。

### API 五类

| 官网分类 | 数量 | 本地主入口对应 |
| --- | ---: | ---: |
| Enumerations | 2 | 1 runtime + 1 type-only |
| Interfaces | 49 | 49 type-only |
| Type Aliases | 45 | 45 type-only |
| Variables | 8 | 8 runtime |
| Functions | 14 | 14 runtime |
| **总计** | **118** | **23 runtime + 95 type-only** |

## 118 项稳定主入口冻结矩阵

`apiId` 采用 `<official-category>.<official-slug>`，因此
`interfaces.pathparseroptions` 与 `type-aliases.pathparseroptions` 不冲突。Target 链接跳到本文冻结
的详情页定义；链接文字中的 `entryId#anchor` 是未来结构化 index 必须原样使用的目标。

| apiId | displayName | officialUrl | kind/category | sourceTag | depth | planned entryId/heading target | status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `enumerations.errortypes` | `ErrorTypes` | [官方](https://router.vuejs.org/api/enumerations/errortypes) | `type-only/enumerations` | `internal` | `quick` | [`vue.router.reference.navigation.failures#error-types`](#target-ra4-failures) | `planned` |
| `enumerations.navigationfailuretype` | `NavigationFailureType` | [官方](https://router.vuejs.org/api/enumerations/navigationfailuretype) | `runtime/enumerations` | `public` | `detail` | [`vue.router.reference.navigation.failures#navigation-failure-type`](#target-ra4-failures) | `planned` |
| `interfaces.pathparseroptions` | `_PathParserOptions` | [官方](https://router.vuejs.org/api/interfaces/pathparseroptions) | `type-only/interfaces` | `internal` | `quick` | [`vue.router.reference.matching.matcher#internal-path-parser-options`](#target-ra2-matcher) | `planned` |
| `interfaces.routelocationbase` | `_RouteLocationBase` | [官方](https://router.vuejs.org/api/interfaces/routelocationbase) | `type-only/interfaces` | `internal` | `quick` | [`vue.router.reference.matching.route-locations#internal-route-location-base`](#target-ra2-route-locations) | `planned` |
| `interfaces.routerclassic` | `_RouterClassic` | [官方](https://router.vuejs.org/api/interfaces/routerclassic) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.configuration.router-instance#router-classic`](#target-ra1-router-instance) | `planned` |
| `interfaces.routerecordbase` | `_RouteRecordBase` | [官方](https://router.vuejs.org/api/interfaces/routerecordbase) | `type-only/interfaces` | `public` | `quick` | [`vue.router.reference.matching.route-records#route-record-base`](#target-ra2-route-records) | `planned` |
| `interfaces.routerlinki` | `_RouterLinkI` | [官方](https://router.vuejs.org/api/interfaces/routerlinki) | `type-only/interfaces` | `internal` | `quick` | [`vue.router.reference.components.router-link#internal-router-link-i`](#target-ra3-router-link) | `planned` |
| `interfaces.historystate` | `HistoryState` | [官方](https://router.vuejs.org/api/interfaces/historystate) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.configuration.history#history-state`](#target-ra1-history) | `planned` |
| `interfaces.locationasrelativeraw` | `LocationAsRelativeRaw` | [官方](https://router.vuejs.org/api/interfaces/locationasrelativeraw) | `type-only/interfaces` | `internal` | `quick` | [`vue.router.reference.matching.route-locations#location-as-relative-raw`](#target-ra2-route-locations) | `planned` |
| `interfaces.matcherlocation` | `MatcherLocation` | [官方](https://router.vuejs.org/api/interfaces/matcherlocation) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.matching.matcher#matcher-location`](#target-ra2-matcher) | `planned` |
| `interfaces.matcherlocationaspath` | `MatcherLocationAsPath` | [官方](https://router.vuejs.org/api/interfaces/matcherlocationaspath) | `type-only/interfaces` | `internal` | `quick` | [`vue.router.reference.matching.matcher#matcher-location-as-path`](#target-ra2-matcher) | `planned` |
| `interfaces.navigationfailure` | `NavigationFailure` | [官方](https://router.vuejs.org/api/interfaces/navigationfailure) | `type-only/interfaces` | `public` | `detail` | [`vue.router.reference.navigation.failures#navigation-failure`](#target-ra4-failures) | `planned` |
| `interfaces.navigationguard` | `NavigationGuard` | [官方](https://router.vuejs.org/api/interfaces/navigationguard) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.navigation.guards#navigation-guard`](#target-ra4-guards) | `planned` |
| `interfaces.navigationguardnext` | `NavigationGuardNext` | [官方](https://router.vuejs.org/api/interfaces/navigationguardnext) | `type-only/interfaces` | `deprecated` | `quick` | [`vue.router.reference.navigation.guards#navigation-guard-next`](#target-ra4-guards) | `planned` |
| `interfaces.navigationguardwiththis` | `NavigationGuardWithThis` | [官方](https://router.vuejs.org/api/interfaces/navigationguardwiththis) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.navigation.guards#navigation-guard-with-this`](#target-ra4-guards) | `planned` |
| `interfaces.navigationhookafter` | `NavigationHookAfter` | [官方](https://router.vuejs.org/api/interfaces/navigationhookafter) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.navigation.guards#navigation-hook-after`](#target-ra4-guards) | `planned` |
| `interfaces.navigationredirecterror` | `NavigationRedirectError` | [官方](https://router.vuejs.org/api/interfaces/navigationredirecterror) | `type-only/interfaces` | `internal` | `quick` | [`vue.router.reference.navigation.failures#navigation-redirect-error`](#target-ra4-failures) | `planned` |
| `interfaces.routelocationaspathgeneric` | `RouteLocationAsPathGeneric` | [官方](https://router.vuejs.org/api/interfaces/routelocationaspathgeneric) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.matching.route-locations#route-location-as-path-generic`](#target-ra2-route-locations) | `planned` |
| `interfaces.routelocationaspathtyped` | `RouteLocationAsPathTyped` | [官方](https://router.vuejs.org/api/interfaces/routelocationaspathtyped) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.typed-routes.route-map#route-location-as-path-typed`](#target-ra5-typed-routes) | `planned` |
| `interfaces.routelocationasrelativegeneric` | `RouteLocationAsRelativeGeneric` | [官方](https://router.vuejs.org/api/interfaces/routelocationasrelativegeneric) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.matching.route-locations#route-location-as-relative-generic`](#target-ra2-route-locations) | `planned` |
| `interfaces.routelocationasrelativetyped` | `RouteLocationAsRelativeTyped` | [官方](https://router.vuejs.org/api/interfaces/routelocationasrelativetyped) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.typed-routes.route-map#route-location-as-relative-typed`](#target-ra5-typed-routes) | `planned` |
| `interfaces.routelocationgeneric` | `RouteLocationGeneric` | [官方](https://router.vuejs.org/api/interfaces/routelocationgeneric) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.matching.route-locations#route-location-generic`](#target-ra2-route-locations) | `planned` |
| `interfaces.routelocationmatched` | `RouteLocationMatched` | [官方](https://router.vuejs.org/api/interfaces/routelocationmatched) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.matching.route-locations#route-location-matched`](#target-ra2-route-locations) | `planned` |
| `interfaces.routelocationnamedraw` | `RouteLocationNamedRaw` | [官方](https://router.vuejs.org/api/interfaces/routelocationnamedraw) | `type-only/interfaces` | `internal` | `quick` | [`vue.router.reference.matching.route-locations#route-location-named-raw`](#target-ra2-route-locations) | `planned` |
| `interfaces.routelocationnormalizedgeneric` | `RouteLocationNormalizedGeneric` | [官方](https://router.vuejs.org/api/interfaces/routelocationnormalizedgeneric) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.matching.route-locations#route-location-normalized-generic`](#target-ra2-route-locations) | `planned` |
| `interfaces.routelocationnormalizedloadedgeneric` | `RouteLocationNormalizedLoadedGeneric` | [官方](https://router.vuejs.org/api/interfaces/routelocationnormalizedloadedgeneric) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.matching.route-locations#route-location-normalized-loaded-generic`](#target-ra2-route-locations) | `planned` |
| `interfaces.routelocationnormalizedloadedtyped` | `RouteLocationNormalizedLoadedTyped` | [官方](https://router.vuejs.org/api/interfaces/routelocationnormalizedloadedtyped) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.typed-routes.route-map#route-location-normalized-loaded-typed`](#target-ra5-typed-routes) | `planned` |
| `interfaces.routelocationnormalizedtyped` | `RouteLocationNormalizedTyped` | [官方](https://router.vuejs.org/api/interfaces/routelocationnormalizedtyped) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.typed-routes.route-map#route-location-normalized-typed`](#target-ra5-typed-routes) | `planned` |
| `interfaces.routelocationoptions` | `RouteLocationOptions` | [官方](https://router.vuejs.org/api/interfaces/routelocationoptions) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.matching.route-locations#route-location-options`](#target-ra2-route-locations) | `planned` |
| `interfaces.routelocationpathraw` | `RouteLocationPathRaw` | [官方](https://router.vuejs.org/api/interfaces/routelocationpathraw) | `type-only/interfaces` | `internal` | `quick` | [`vue.router.reference.matching.route-locations#route-location-path-raw`](#target-ra2-route-locations) | `planned` |
| `interfaces.routelocationresolvedgeneric` | `RouteLocationResolvedGeneric` | [官方](https://router.vuejs.org/api/interfaces/routelocationresolvedgeneric) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.matching.route-locations#route-location-resolved-generic`](#target-ra2-route-locations) | `planned` |
| `interfaces.routelocationresolvedtyped` | `RouteLocationResolvedTyped` | [官方](https://router.vuejs.org/api/interfaces/routelocationresolvedtyped) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.typed-routes.route-map#route-location-resolved-typed`](#target-ra5-typed-routes) | `planned` |
| `interfaces.routelocationtyped` | `RouteLocationTyped` | [官方](https://router.vuejs.org/api/interfaces/routelocationtyped) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.typed-routes.route-map#route-location-typed`](#target-ra5-typed-routes) | `planned` |
| `interfaces.routemeta` | `RouteMeta` | [官方](https://router.vuejs.org/api/interfaces/routemeta) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.matching.route-records#route-meta`](#target-ra2-route-records) | `planned` |
| `interfaces.routequeryandhash` | `RouteQueryAndHash` | [官方](https://router.vuejs.org/api/interfaces/routequeryandhash) | `type-only/interfaces` | `internal` | `quick` | [`vue.router.reference.matching.params-query#route-query-and-hash`](#target-ra2-params-query) | `planned` |
| `interfaces.routerecordinfo` | `RouteRecordInfo` | [官方](https://router.vuejs.org/api/interfaces/routerecordinfo) | `type-only/interfaces` | `public` | `detail` | [`vue.router.reference.typed-routes.route-map#route-record-info`](#target-ra5-typed-routes) | `planned` |
| `interfaces.routerecordmultipleviews` | `RouteRecordMultipleViews` | [官方](https://router.vuejs.org/api/interfaces/routerecordmultipleviews) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.matching.route-records#route-record-multiple-views`](#target-ra2-route-records) | `planned` |
| `interfaces.routerecordmultipleviewswithchildren` | `RouteRecordMultipleViewsWithChildren` | [官方](https://router.vuejs.org/api/interfaces/routerecordmultipleviewswithchildren) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.matching.route-records#route-record-multiple-views-with-children`](#target-ra2-route-records) | `planned` |
| `interfaces.routerecordnormalized` | `RouteRecordNormalized` | [官方](https://router.vuejs.org/api/interfaces/routerecordnormalized) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.matching.route-records#route-record-normalized`](#target-ra2-route-records) | `planned` |
| `interfaces.routerecordredirect` | `RouteRecordRedirect` | [官方](https://router.vuejs.org/api/interfaces/routerecordredirect) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.matching.route-records#route-record-redirect`](#target-ra2-route-records) | `planned` |
| `interfaces.routerecordsingleview` | `RouteRecordSingleView` | [官方](https://router.vuejs.org/api/interfaces/routerecordsingleview) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.matching.route-records#route-record-single-view`](#target-ra2-route-records) | `planned` |
| `interfaces.routerecordsingleviewwithchildren` | `RouteRecordSingleViewWithChildren` | [官方](https://router.vuejs.org/api/interfaces/routerecordsingleviewwithchildren) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.matching.route-records#route-record-single-view-with-children`](#target-ra2-route-records) | `planned` |
| `interfaces.routerhistory` | `RouterHistory` | [官方](https://router.vuejs.org/api/interfaces/routerhistory) | `type-only/interfaces` | `alpha` | `detail` | [`vue.router.reference.configuration.history#router-history`](#target-ra1-history) | `planned` |
| `interfaces.routerlinkprops` | `RouterLinkProps` | [官方](https://router.vuejs.org/api/interfaces/routerlinkprops) | `type-only/interfaces` | `public` | `detail` | [`vue.router.reference.components.router-link#router-link-props`](#target-ra3-router-link) | `planned` |
| `interfaces.routermatcher` | `RouterMatcher` | [官方](https://router.vuejs.org/api/interfaces/routermatcher) | `type-only/interfaces` | `internal` | `quick` | [`vue.router.reference.matching.matcher#router-matcher`](#target-ra2-matcher) | `planned` |
| `interfaces.routeroptions` | `RouterOptions` | [官方](https://router.vuejs.org/api/interfaces/routeroptions) | `type-only/interfaces` | `public` | `detail` | [`vue.router.reference.configuration.create-router#router-options`](#target-ra1-create-router) | `planned` |
| `interfaces.routerscrollbehavior` | `RouterScrollBehavior` | [官方](https://router.vuejs.org/api/interfaces/routerscrollbehavior) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.configuration.history#router-scroll-behavior`](#target-ra1-history) | `planned` |
| `interfaces.routerviewprops` | `RouterViewProps` | [官方](https://router.vuejs.org/api/interfaces/routerviewprops) | `type-only/interfaces` | `public` | `detail` | [`vue.router.reference.components.router-view#router-view-props`](#target-ra3-router-view) | `planned` |
| `interfaces.typesconfig` | `TypesConfig` | [官方](https://router.vuejs.org/api/interfaces/typesconfig) | `type-only/interfaces` | `internal` | `quick` | [`vue.router.reference.typed-routes.route-map#types-config`](#target-ra5-typed-routes) | `planned` |
| `interfaces.uselinkoptions` | `UseLinkOptions` | [官方](https://router.vuejs.org/api/interfaces/uselinkoptions) | `type-only/interfaces` | `public` | `merged` | [`vue.router.reference.components.router-link#use-link-options`](#target-ra3-router-link) | `planned` |
| `interfaces.uselinkreturn` | `UseLinkReturn` | [官方](https://router.vuejs.org/api/interfaces/uselinkreturn) | `type-only/interfaces` | `internal` | `quick` | [`vue.router.reference.components.router-link#use-link-return`](#target-ra3-router-link) | `planned` |
| `type-aliases.awaitable` | `_Awaitable` | [官方](https://router.vuejs.org/api/type-aliases/awaitable) | `type-only/type-aliases` | `internal` | `quick` | [`vue.router.reference.navigation.guards#internal-awaitable`](#target-ra4-guards) | `planned` |
| `type-aliases.routerecordprops` | `_RouteRecordProps` | [官方](https://router.vuejs.org/api/type-aliases/routerecordprops) | `type-only/type-aliases` | `internal` | `quick` | [`vue.router.reference.matching.route-records#internal-route-record-props`](#target-ra2-route-records) | `planned` |
| `type-aliases.locationquery` | `LocationQuery` | [官方](https://router.vuejs.org/api/type-aliases/locationquery) | `type-only/type-aliases` | `public` | `detail` | [`vue.router.reference.matching.params-query#location-query`](#target-ra2-params-query) | `planned` |
| `type-aliases.locationqueryraw` | `LocationQueryRaw` | [官方](https://router.vuejs.org/api/type-aliases/locationqueryraw) | `type-only/type-aliases` | `public` | `merged` | [`vue.router.reference.matching.params-query#location-query-raw`](#target-ra2-params-query) | `planned` |
| `type-aliases.locationqueryvalue` | `LocationQueryValue` | [官方](https://router.vuejs.org/api/type-aliases/locationqueryvalue) | `type-only/type-aliases` | `internal` | `quick` | [`vue.router.reference.matching.params-query#location-query-value`](#target-ra2-params-query) | `planned` |
| `type-aliases.locationqueryvalueraw` | `LocationQueryValueRaw` | [官方](https://router.vuejs.org/api/type-aliases/locationqueryvalueraw) | `type-only/type-aliases` | `internal` | `quick` | [`vue.router.reference.matching.params-query#location-query-value-raw`](#target-ra2-params-query) | `planned` |
| `type-aliases.navigationguardnextcallback` | `NavigationGuardNextCallback` | [官方](https://router.vuejs.org/api/type-aliases/navigationguardnextcallback) | `type-only/type-aliases` | `public` | `merged` | [`vue.router.reference.navigation.guards#navigation-guard-next-callback`](#target-ra4-guards) | `planned` |
| `type-aliases.navigationguardreturn` | `NavigationGuardReturn` | [官方](https://router.vuejs.org/api/type-aliases/navigationguardreturn) | `type-only/type-aliases` | `public` | `merged` | [`vue.router.reference.navigation.guards#navigation-guard-return`](#target-ra4-guards) | `planned` |
| `type-aliases.paramvalue` | `ParamValue` | [官方](https://router.vuejs.org/api/type-aliases/paramvalue) | `type-only/type-aliases` | `public` | `merged` | [`vue.router.reference.matching.params-query#param-value`](#target-ra2-params-query) | `planned` |
| `type-aliases.paramvalueoneormore` | `ParamValueOneOrMore` | [官方](https://router.vuejs.org/api/type-aliases/paramvalueoneormore) | `type-only/type-aliases` | `public` | `merged` | [`vue.router.reference.matching.params-query#param-value-one-or-more`](#target-ra2-params-query) | `planned` |
| `type-aliases.paramvaluezeroormore` | `ParamValueZeroOrMore` | [官方](https://router.vuejs.org/api/type-aliases/paramvaluezeroormore) | `type-only/type-aliases` | `public` | `merged` | [`vue.router.reference.matching.params-query#param-value-zero-or-more`](#target-ra2-params-query) | `planned` |
| `type-aliases.paramvaluezeroorone` | `ParamValueZeroOrOne` | [官方](https://router.vuejs.org/api/type-aliases/paramvaluezeroorone) | `type-only/type-aliases` | `public` | `merged` | [`vue.router.reference.matching.params-query#param-value-zero-or-one`](#target-ra2-params-query) | `planned` |
| `type-aliases.pathparseroptions` | `PathParserOptions` | [官方](https://router.vuejs.org/api/type-aliases/pathparseroptions) | `type-only/type-aliases` | `public` | `merged` | [`vue.router.reference.matching.matcher#path-parser-options`](#target-ra2-matcher) | `planned` |
| `type-aliases.routecomponent` | `RouteComponent` | [官方](https://router.vuejs.org/api/type-aliases/routecomponent) | `type-only/type-aliases` | `public` | `merged` | [`vue.router.reference.components.router-view#route-component`](#target-ra3-router-view) | `planned` |
| `type-aliases.routelocation` | `RouteLocation` | [官方](https://router.vuejs.org/api/type-aliases/routelocation) | `type-only/type-aliases` | `public` | `detail` | [`vue.router.reference.matching.route-locations#route-location`](#target-ra2-route-locations) | `planned` |
| `type-aliases.routelocationaspath` | `RouteLocationAsPath` | [官方](https://router.vuejs.org/api/type-aliases/routelocationaspath) | `type-only/type-aliases` | `public` | `merged` | [`vue.router.reference.matching.route-locations#route-location-as-path`](#target-ra2-route-locations) | `planned` |
| `type-aliases.routelocationaspathtypedlist` | `RouteLocationAsPathTypedList` | [官方](https://router.vuejs.org/api/type-aliases/routelocationaspathtypedlist) | `type-only/type-aliases` | `internal` | `quick` | [`vue.router.reference.typed-routes.route-map#route-location-as-path-typed-list`](#target-ra5-typed-routes) | `planned` |
| `type-aliases.routelocationasrelative` | `RouteLocationAsRelative` | [官方](https://router.vuejs.org/api/type-aliases/routelocationasrelative) | `type-only/type-aliases` | `public` | `merged` | [`vue.router.reference.matching.route-locations#route-location-as-relative`](#target-ra2-route-locations) | `planned` |
| `type-aliases.routelocationasrelativetypedlist` | `RouteLocationAsRelativeTypedList` | [官方](https://router.vuejs.org/api/type-aliases/routelocationasrelativetypedlist) | `type-only/type-aliases` | `internal` | `quick` | [`vue.router.reference.typed-routes.route-map#route-location-as-relative-typed-list`](#target-ra5-typed-routes) | `planned` |
| `type-aliases.routelocationasstring` | `RouteLocationAsString` | [官方](https://router.vuejs.org/api/type-aliases/routelocationasstring) | `type-only/type-aliases` | `public` | `merged` | [`vue.router.reference.matching.route-locations#route-location-as-string`](#target-ra2-route-locations) | `planned` |
| `type-aliases.routelocationasstringtyped` | `RouteLocationAsStringTyped` | [官方](https://router.vuejs.org/api/type-aliases/routelocationasstringtyped) | `type-only/type-aliases` | `public` | `merged` | [`vue.router.reference.typed-routes.route-map#route-location-as-string-typed`](#target-ra5-typed-routes) | `planned` |
| `type-aliases.routelocationasstringtypedlist` | `RouteLocationAsStringTypedList` | [官方](https://router.vuejs.org/api/type-aliases/routelocationasstringtypedlist) | `type-only/type-aliases` | `internal` | `quick` | [`vue.router.reference.typed-routes.route-map#route-location-as-string-typed-list`](#target-ra5-typed-routes) | `planned` |
| `type-aliases.routelocationnormalized` | `RouteLocationNormalized` | [官方](https://router.vuejs.org/api/type-aliases/routelocationnormalized) | `type-only/type-aliases` | `public` | `merged` | [`vue.router.reference.matching.route-locations#route-location-normalized`](#target-ra2-route-locations) | `planned` |
| `type-aliases.routelocationnormalizedloaded` | `RouteLocationNormalizedLoaded` | [官方](https://router.vuejs.org/api/type-aliases/routelocationnormalizedloaded) | `type-only/type-aliases` | `public` | `merged` | [`vue.router.reference.matching.route-locations#route-location-normalized-loaded`](#target-ra2-route-locations) | `planned` |
| `type-aliases.routelocationnormalizedloadedtypedlist` | `RouteLocationNormalizedLoadedTypedList` | [官方](https://router.vuejs.org/api/type-aliases/routelocationnormalizedloadedtypedlist) | `type-only/type-aliases` | `internal` | `quick` | [`vue.router.reference.typed-routes.route-map#route-location-normalized-loaded-typed-list`](#target-ra5-typed-routes) | `planned` |
| `type-aliases.routelocationnormalizedtypedlist` | `RouteLocationNormalizedTypedList` | [官方](https://router.vuejs.org/api/type-aliases/routelocationnormalizedtypedlist) | `type-only/type-aliases` | `internal` | `quick` | [`vue.router.reference.typed-routes.route-map#route-location-normalized-typed-list`](#target-ra5-typed-routes) | `planned` |
| `type-aliases.routelocationraw` | `RouteLocationRaw` | [官方](https://router.vuejs.org/api/type-aliases/routelocationraw) | `type-only/type-aliases` | `public` | `detail` | [`vue.router.reference.matching.route-locations#route-location-raw`](#target-ra2-route-locations) | `planned` |
| `type-aliases.routelocationresolved` | `RouteLocationResolved` | [官方](https://router.vuejs.org/api/type-aliases/routelocationresolved) | `type-only/type-aliases` | `public` | `merged` | [`vue.router.reference.matching.route-locations#route-location-resolved`](#target-ra2-route-locations) | `planned` |
| `type-aliases.routelocationresolvedtypedlist` | `RouteLocationResolvedTypedList` | [官方](https://router.vuejs.org/api/type-aliases/routelocationresolvedtypedlist) | `type-only/type-aliases` | `internal` | `quick` | [`vue.router.reference.typed-routes.route-map#route-location-resolved-typed-list`](#target-ra5-typed-routes) | `planned` |
| `type-aliases.routelocationtypedlist` | `RouteLocationTypedList` | [官方](https://router.vuejs.org/api/type-aliases/routelocationtypedlist) | `type-only/type-aliases` | `internal` | `quick` | [`vue.router.reference.typed-routes.route-map#route-location-typed-list`](#target-ra5-typed-routes) | `planned` |
| `type-aliases.routemap` | `RouteMap` | [官方](https://router.vuejs.org/api/type-aliases/routemap) | `type-only/type-aliases` | `public` | `detail` | [`vue.router.reference.typed-routes.route-map#route-map`](#target-ra5-typed-routes) | `planned` |
| `type-aliases.routemapgeneric` | `RouteMapGeneric` | [官方](https://router.vuejs.org/api/type-aliases/routemapgeneric) | `type-only/type-aliases` | `public` | `merged` | [`vue.router.reference.typed-routes.route-map#route-map-generic`](#target-ra5-typed-routes) | `planned` |
| `type-aliases.routeparams` | `RouteParams` | [官方](https://router.vuejs.org/api/type-aliases/routeparams) | `type-only/type-aliases` | `public` | `merged` | [`vue.router.reference.matching.params-query#route-params`](#target-ra2-params-query) | `planned` |
| `type-aliases.routeparamsgeneric` | `RouteParamsGeneric` | [官方](https://router.vuejs.org/api/type-aliases/routeparamsgeneric) | `type-only/type-aliases` | `public` | `merged` | [`vue.router.reference.matching.params-query#route-params-generic`](#target-ra2-params-query) | `planned` |
| `type-aliases.routeparamsraw` | `RouteParamsRaw` | [官方](https://router.vuejs.org/api/type-aliases/routeparamsraw) | `type-only/type-aliases` | `public` | `merged` | [`vue.router.reference.matching.params-query#route-params-raw`](#target-ra2-params-query) | `planned` |
| `type-aliases.routeparamsrawgeneric` | `RouteParamsRawGeneric` | [官方](https://router.vuejs.org/api/type-aliases/routeparamsrawgeneric) | `type-only/type-aliases` | `public` | `merged` | [`vue.router.reference.matching.params-query#route-params-raw-generic`](#target-ra2-params-query) | `planned` |
| `type-aliases.routeparamvalue` | `RouteParamValue` | [官方](https://router.vuejs.org/api/type-aliases/routeparamvalue) | `type-only/type-aliases` | `internal` | `quick` | [`vue.router.reference.matching.params-query#route-param-value`](#target-ra2-params-query) | `planned` |
| `type-aliases.routeparamvalueraw` | `RouteParamValueRaw` | [官方](https://router.vuejs.org/api/type-aliases/routeparamvalueraw) | `type-only/type-aliases` | `internal` | `quick` | [`vue.router.reference.matching.params-query#route-param-value-raw`](#target-ra2-params-query) | `planned` |
| `type-aliases.router` | `Router` | [官方](https://router.vuejs.org/api/type-aliases/router) | `type-only/type-aliases` | `public` | `detail` | [`vue.router.reference.configuration.router-instance#router`](#target-ra1-router-instance) | `planned` |
| `type-aliases.routerecord` | `RouteRecord` | [官方](https://router.vuejs.org/api/type-aliases/routerecord) | `type-only/type-aliases` | `public` | `merged` | [`vue.router.reference.matching.route-records#route-record`](#target-ra2-route-records) | `planned` |
| `type-aliases.routerecordinfogeneric` | `RouteRecordInfoGeneric` | [官方](https://router.vuejs.org/api/type-aliases/routerecordinfogeneric) | `type-only/type-aliases` | `public` | `merged` | [`vue.router.reference.typed-routes.route-map#route-record-info-generic`](#target-ra5-typed-routes) | `planned` |
| `type-aliases.routerecordname` | `RouteRecordName` | [官方](https://router.vuejs.org/api/type-aliases/routerecordname) | `type-only/type-aliases` | `public` | `merged` | [`vue.router.reference.matching.route-records#route-record-name`](#target-ra2-route-records) | `planned` |
| `type-aliases.routerecordnamegeneric` | `RouteRecordNameGeneric` | [官方](https://router.vuejs.org/api/type-aliases/routerecordnamegeneric) | `type-only/type-aliases` | `public` | `merged` | [`vue.router.reference.matching.route-records#route-record-name-generic`](#target-ra2-route-records) | `planned` |
| `type-aliases.routerecordraw` | `RouteRecordRaw` | [官方](https://router.vuejs.org/api/type-aliases/routerecordraw) | `type-only/type-aliases` | `public` | `detail` | [`vue.router.reference.matching.route-records#route-record-raw`](#target-ra2-route-records) | `planned` |
| `type-aliases.routerecordredirectoption` | `RouteRecordRedirectOption` | [官方](https://router.vuejs.org/api/type-aliases/routerecordredirectoption) | `type-only/type-aliases` | `internal` | `quick` | [`vue.router.reference.matching.route-records#route-record-redirect-option`](#target-ra2-route-records) | `planned` |
| `variables.matchedroutekey` | `matchedRouteKey` | [官方](https://router.vuejs.org/api/variables/matchedroutekey) | `runtime/variables` | `internal` | `quick` | [`vue.router.reference.composables.injection-keys#matched-route-key`](#target-ra3-injection-keys) | `planned` |
| `variables.routelocationkey` | `routeLocationKey` | [官方](https://router.vuejs.org/api/variables/routelocationkey) | `runtime/variables` | `internal` | `quick` | [`vue.router.reference.composables.injection-keys#route-location-key`](#target-ra3-injection-keys) | `planned` |
| `variables.routerkey` | `routerKey` | [官方](https://router.vuejs.org/api/variables/routerkey) | `runtime/variables` | `internal` | `quick` | [`vue.router.reference.composables.injection-keys#router-key`](#target-ra3-injection-keys) | `planned` |
| `variables.routerlink` | `RouterLink` | [官方](https://router.vuejs.org/api/variables/routerlink) | `runtime/variables` | `public` | `detail` | [`vue.router.reference.components.router-link#router-link`](#target-ra3-router-link) | `planned` |
| `variables.routerview` | `RouterView` | [官方](https://router.vuejs.org/api/variables/routerview) | `runtime/variables` | `public` | `detail` | [`vue.router.reference.components.router-view#router-view`](#target-ra3-router-view) | `planned` |
| `variables.routerviewlocationkey` | `routerViewLocationKey` | [官方](https://router.vuejs.org/api/variables/routerviewlocationkey) | `runtime/variables` | `internal` | `quick` | [`vue.router.reference.composables.injection-keys#router-view-location-key`](#target-ra3-injection-keys) | `planned` |
| `variables.start_location` | `START_LOCATION` | [官方](https://router.vuejs.org/api/variables/start_location) | `runtime/variables` | `public` | `merged` | [`vue.router.reference.matching.route-locations#start-location`](#target-ra2-route-locations) | `planned` |
| `variables.viewdepthkey` | `viewDepthKey` | [官方](https://router.vuejs.org/api/variables/viewdepthkey) | `runtime/variables` | `internal` | `quick` | [`vue.router.reference.composables.injection-keys#view-depth-key`](#target-ra3-injection-keys) | `planned` |
| `functions.creatememoryhistory` | `createMemoryHistory` | [官方](https://router.vuejs.org/api/functions/creatememoryhistory) | `runtime/functions` | `public` | `detail` | [`vue.router.reference.configuration.history#create-memory-history`](#target-ra1-history) | `planned` |
| `functions.createrouter` | `createRouter` | [官方](https://router.vuejs.org/api/functions/createrouter) | `runtime/functions` | `public` | `detail` | [`vue.router.reference.configuration.create-router#create-router`](#target-ra1-create-router) | `planned` |
| `functions.createroutermatcher` | `createRouterMatcher` | [官方](https://router.vuejs.org/api/functions/createroutermatcher) | `runtime/functions` | `internal` | `quick` | [`vue.router.reference.matching.matcher#create-router-matcher`](#target-ra2-matcher) | `planned` |
| `functions.createwebhashhistory` | `createWebHashHistory` | [官方](https://router.vuejs.org/api/functions/createwebhashhistory) | `runtime/functions` | `public` | `detail` | [`vue.router.reference.configuration.history#create-web-hash-history`](#target-ra1-history) | `planned` |
| `functions.createwebhistory` | `createWebHistory` | [官方](https://router.vuejs.org/api/functions/createwebhistory) | `runtime/functions` | `public` | `detail` | [`vue.router.reference.configuration.history#create-web-history`](#target-ra1-history) | `planned` |
| `functions.isnavigationfailure` | `isNavigationFailure` | [官方](https://router.vuejs.org/api/functions/isnavigationfailure) | `runtime/functions` | `public` | `detail` | [`vue.router.reference.navigation.failures#is-navigation-failure`](#target-ra4-failures) | `planned` |
| `functions.loadroutelocation` | `loadRouteLocation` | [官方](https://router.vuejs.org/api/functions/loadroutelocation) | `runtime/functions` | `public` | `merged` | [`vue.router.reference.composables.navigation#load-route-location`](#target-ra3-navigation-composables) | `planned` |
| `functions.onbeforerouteleave` | `onBeforeRouteLeave` | [官方](https://router.vuejs.org/api/functions/onbeforerouteleave) | `runtime/functions` | `public` | `detail` | [`vue.router.reference.navigation.guards#on-before-route-leave`](#target-ra4-guards) | `planned` |
| `functions.onbeforerouteupdate` | `onBeforeRouteUpdate` | [官方](https://router.vuejs.org/api/functions/onbeforerouteupdate) | `runtime/functions` | `public` | `detail` | [`vue.router.reference.navigation.guards#on-before-route-update`](#target-ra4-guards) | `planned` |
| `functions.parsequery` | `parseQuery` | [官方](https://router.vuejs.org/api/functions/parsequery) | `runtime/functions` | `internal` | `quick` | [`vue.router.reference.matching.params-query#parse-query`](#target-ra2-params-query) | `planned` |
| `functions.stringifyquery` | `stringifyQuery` | [官方](https://router.vuejs.org/api/functions/stringifyquery) | `runtime/functions` | `internal` | `quick` | [`vue.router.reference.matching.params-query#stringify-query`](#target-ra2-params-query) | `planned` |
| `functions.uselink` | `useLink` | [官方](https://router.vuejs.org/api/functions/uselink) | `runtime/functions` | `public` | `detail` | [`vue.router.reference.components.router-link#use-link`](#target-ra3-router-link) | `planned` |
| `functions.useroute` | `useRoute` | [官方](https://router.vuejs.org/api/functions/useroute) | `runtime/functions` | `public` | `detail` | [`vue.router.reference.composables.navigation#use-route`](#target-ra3-navigation-composables) | `planned` |
| `functions.userouter` | `useRouter` | [官方](https://router.vuejs.org/api/functions/userouter) | `runtime/functions` | `public` | `detail` | [`vue.router.reference.composables.navigation#use-router`](#target-ra3-navigation-composables) | `planned` |

### 矩阵闭合断言

后续批次必须同时满足以下断言，不能只核对总数：

| 维度 | 冻结结果 |
| --- | --- |
| `apiId` 唯一数 | 118 |
| 官网五类 | 2 + 49 + 45 + 8 + 14 = 118 |
| 导出形态 | 23 runtime + 95 type-only = 118 |
| 固定源码标签 | 81 public + 35 internal + 1 alpha + 1 deprecated = 118 |
| 批次分配 | RA1 10 + RA2 58 + RA3 17 + RA4 14 + RA5 19 = 118 |
| 当前状态 | 118 `planned`；RA0 不得产生 `available` |

## Router 实例 surface

官网 [`Router`](https://router.vuejs.org/api/type-aliases/router) 是条件类型；默认
`TypesConfig` 未覆盖 `Router` 时解析为
[`_RouterClassic`](https://router.vuejs.org/api/interfaces/routerclassic)。因此 118 项矩阵只把
`Router` 和 `_RouterClassic` 各计一次，实例成员不再算作主入口导出，但 Router 详情页仍必须逐项
覆盖 19 个公开用户成员，并单独说明 1 个 internal `install` 方法。

### 公开用户成员（19）

| 成员 | 形态 | Reference 要回答的契约 | planned target |
| --- | --- | --- | --- |
| `currentRoute` | readonly property | 当前已规范化且已加载的响应式路由 | `#current-route` |
| `listening` | property | Router 是否监听 history 事件；微前端用法需说明边界 | `#listening` |
| `options` | readonly property | 创建实例时冻结的 Router 配置 | `#options` |
| `addRoute` | method | 动态添加 route record，并返回移除回调 | `#add-route` |
| `afterEach` | method | 注册全局导航完成钩子 | `#after-each` |
| `back` | method | history 后退一条 | `#back` |
| `beforeEach` | method | 注册全局前置守卫 | `#before-each` |
| `beforeResolve` | method | 注册解析前守卫 | `#before-resolve` |
| `clearRoutes` | method | 清空 matcher 中的 route records | `#clear-routes` |
| `forward` | method | history 前进一条 | `#forward` |
| `getRoutes` | method | 返回当前标准化 route records | `#get-routes` |
| `go` | method | 按 delta 移动 history | `#go` |
| `hasRoute` | method | 按 route name 判断记录是否存在 | `#has-route` |
| `isReady` | method | 等待初始导航完成 | `#is-ready` |
| `onError` | method | 注册导航错误处理器 | `#on-error` |
| `push` | method | 推入新 history entry 并导航 | `#push` |
| `removeRoute` | method | 按 route name 移除记录 | `#remove-route` |
| `replace` | method | 替换当前 history entry 并导航 | `#replace` |
| `resolve` | method | 把 raw location 解析为 resolved location | `#resolve` |

成员 heading 属于 `vue.router.reference.configuration.router-instance`，不得为 19 个公开成员分别
新建 entry。
涉及守卫或 matcher 的成员可链接 RA2/RA4 深入页，但 Router 实例页保留签名、返回值、注销方式和
最小示例。

### 直接实例成员中的 internal 方法（1）

| 成员 | 形态 | Reference 要回答的契约 | planned target |
| --- | --- | --- | --- |
| `install` | method | 仅由 `app.use(router)` 自动调用，不得手动调用 | `#install` |

`install` 仍在 Router 实例页保留独立 quick heading 和固定源码链接，但只解释插件安装边界，不提供
直接调用示例，也不计入 19 个公开用户成员或稳定 118 项。

### 继承的 internal symbol 属性（7）

TypeDoc 还展示 7 个继承自内部 Router base 的 symbol 属性。它们全部标记 `Internal`，只在
Router 页的“内部集成边界”小节列名并链接源码，不提供推荐用法，也不计入 19 个公开成员或稳定
118 项：

| internal symbol property | 普通稳定覆盖 | RA6 观察原因 |
| --- | --- | --- |
| `APP_KEY` | 排除 | 应用注入内部状态 |
| `DATA_LOADERS_EFFECT_SCOPE_KEY` | 排除 | Data Loaders 生命周期 |
| `INITIAL_DATA_KEY` | 排除 | SSR/Data Loaders 初始数据 |
| `IS_SSR_KEY` | 排除 | SSR 内部标志 |
| `LOADER_ENTRIES_KEY` | 排除 | Data Loader entries |
| `PENDING_LOCATION_KEY` | 排除 | pending navigation 内部状态 |
| `SERVER_INITIAL_DATA_KEY` | 排除 | server initial data |

## Package exports 与构建期入口

固定 `5.2.0` manifest 有 14 个 export-map key。根入口之外的 key 不得伪装成 118 项 API
的一部分；RA5/RA6 必须按消费阶段和稳定性单独说明。

| export-map key | 形态与固定目标 | 用途/边界 | planned batch |
| --- | --- | --- | --- |
| `.` | types + ESM + CJS + Node 条件 | 稳定根入口，唯一 118 项分母 | RA1-RA5 |
| `./vetur/*` | `./vetur/*` | Vetur 元数据，不是应用 runtime API | RA5 tooling |
| `./package.json` | `./package.json` | 包元数据读取 | RA5 tooling quick |
| `./experimental` | types + ESM | 76 项 experimental surface | RA6 |
| `./experimental/pinia-colada` | types + ESM | 10 项 Pinia Colada Data Loader surface | RA6 |
| `./auto-resolver` | types-only | unplugin 生成/拦截的虚拟模块 | RA5 file-based |
| `./auto-routes` | types-only | unplugin 生成/拦截的虚拟 routes 模块 | RA5 file-based |
| `./auto` | types + 根 runtime | 声明文件标记 deprecated 的兼容入口 | RA5 migration quick |
| `./vite` | types + ESM + CJS | Vite plugin 精确入口 | RA5 tooling |
| `./unplugin` | types + ESM + CJS | 通用 unplugin 精确入口 | RA5 tooling |
| `./unplugin/*` | 原样映射 `./dist/unplugin/*` | bundler adapter wildcard；有扩展名陷阱 | RA5 tooling |
| `./volar/sfc-route-blocks` | types + CJS | Volar SFC route block 集成 | RA5 tooling |
| `./volar/sfc-typed-router` | types + CJS | Volar typed-router 集成 | RA5 tooling |
| `./dist/*` | 原样映射 `./dist/*` | 低层发布物逃生口，不承诺统一格式 | RA5 boundary quick |

`auto-routes` 和 `auto-resolver` 是构建插件识别的虚拟模块：manifest 只提供声明文件，没有独立
runtime 文件。Reference 必须展示它们由 plugin 生成这一前置条件，不能给出裸 Node import 示例。

### 已证实的 unplugin 路径不一致

当前 [File-Based Routing 配置 Guide](https://router.vuejs.org/file-based-routing/configuration)
展示无扩展名的 `vue-router/unplugin/rollup`、`webpack`、`esbuild`。但 `5.2.0` manifest 的
`./unplugin/*` 会原样映射到 `./dist/unplugin/*`，发布包实际只有对应 `.mjs`/`.cjs` 文件。
本地对固定安装包执行只读 `require.resolve()` 得到：

| specifier | `vue-router@5.2.0` 结果 |
| --- | --- |
| `vue-router/unplugin` | 成功，解析到 `dist/unplugin/index.cjs` |
| `vue-router/unplugin/rollup` | `MODULE_NOT_FOUND` |
| `vue-router/unplugin/webpack` | `MODULE_NOT_FOUND` |
| `vue-router/unplugin/esbuild` | `MODULE_NOT_FOUND` |
| `vue-router/unplugin/rollup.mjs` | 成功 |
| `vue-router/unplugin/webpack.mjs` | 成功 |
| `vue-router/unplugin/esbuild.mjs` | 成功 |

因此 RA5 只能把精确入口 `vue-router/unplugin` 写成已验证通用写法。wildcard 的无扩展名 Guide
写法标记为“官网/发布物不一致，等待上游澄清”，不能与带 `.mjs` 的本地解析证据混写。

## Experimental 子路径完整 watchlist

`vue-router/experimental` 和 `vue-router/experimental/pinia-colada` 的 export specifier 由固定安装包
声明文件机械读取。它们共 86 项，全部在稳定 118 项之外；“runtime/type-only”只描述导出形态，
不表示稳定性升级。

### `vue-router/experimental`（76）

runtime 26 项：

```text
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
```

type-only 50 项：

```text
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
```

### `vue-router/experimental/pinia-colada`（10）

runtime 1 项：

```text
defineColadaLoader
```

type-only 9 项：

```text
DataColadaLoaderContext
DataLoaderColadaEntry
DefineDataColadaLoaderOptions
DefineDataColadaLoaderOptions_DefinedData
DefineDataColadaLoaderOptions_LaxData
UseDataLoaderColadaResult
UseDataLoaderColada_DefinedData
UseDataLoaderColada_LaxData
_DefineDataColadaLoaderOptions_Common
```

### RA6 稳定性与冲突账本

| 观察域 | 一手信号 | RA6 处理 |
| --- | --- | --- |
| Experimental Router | [Router Resolver](https://router.vuejs.org/experimental/router-resolver) 明确不适合生产，只用于测试与反馈 | 单独 watchlist，不提供稳定推荐 |
| Param Parsers | [Param Parsers](https://router.vuejs.org/experimental/param-parsers) 明确 API/ergonomics 可变化 | 单独 watchlist，示例标实验性 |
| Data Loaders | [Basic Loader](https://router.vuejs.org/data-loaders/basic/) 明确标 experimental | basic/colada 共用 RA6 边界 |
| unplugin experimental flags | 固定源码的 `experimental.autoExportsDataLoaders`、`experimental.paramParsers` 警告可在 patch release 改变或移除 | 记录 flag、版本和移除风险 |
| `definePage` | [Extending Routes Guide](https://router.vuejs.org/file-based-routing/extending-routes#definepage) 称可从 `vue-router` 导入；固定根入口无此导出，固定 experimental 入口有 | 标记 docs/package mismatch；原因未知，不自行解释 |
| Typed Routes | 普通 [Advanced Guide](https://router.vuejs.org/guide/advanced/typed-routes) 未标 experimental，19 个相关项从根入口导出；固定源码注释仍称 “Experimental Type Safe API” | RA5 覆盖稳定根入口事实，同时在 RA6 保留“混合信号”观察项 |

`definePage` 的 Guide/发布物矛盾和 typed-routes 的混合信号都没有找到官方澄清。后续只能记录可证
事实，不能写成“文档错误已确认原因”或自行宣布稳定/废弃。

## 固定 `5.2.0` 与查证时 `main` 差异

查证时 `main` 为
[`22f25959df8e41a47b8b91a87cf0757abf82800e`](https://github.com/vuejs/router/commit/22f25959df8e41a47b8b91a87cf0757abf82800e)，
相对 `v5.2.0` ahead 12、behind 0。固定比较入口为
[`v5.2.0...main`](https://github.com/vuejs/router/compare/v5.2.0...main)。`main` 会变化，以下结论只对
2026-08-04 查证快照成立。

| 审计面 | tag 与当时 main | RA0 结论 |
| --- | --- | --- |
| Guide sidebar 组与数量 | 相同 | 仍是 6 组、48 条 |
| TypeDoc 五类与名称 | 相同 | 仍是 118 项；不能把 main-only 行为加入矩阵 |
| `packages/router/package.json` exports | 相同 | 仍是 14 个 key |
| 根 `src/index.ts` | 相同 | 仍是 23 runtime + 95 type-only |
| Router 接口与 experimental index | 相同 | 19 public + 1 internal method + 7 internal symbol 的成员边界、76 项 experimental 清单不变 |

当时 main-only 的有效差异必须留在“未来版本观察”，不能倒写成 npm `5.2.0` 行为：

| main-only 变化 | 证据范围 | 5.2.0 Reference 处理 |
| --- | --- | --- |
| 重复 `definePage()` 改为 diagnostics 告警并保留首个定义 | unplugin 源码与测试 | 不声称 5.2.0 具备该容错 |
| `EditableTreeNode.name` 允许设为 `false` | unplugin types/测试 | 不写入 5.2.0 签名 |
| Volar 在 type context 中收窄 `typeof useRoute` | Volar entry 与新增测试 | 不写入 5.2.0 tooling 契约 |
| HMR 文档补充动态路由需初始注册，并在 hot-update callback 再注册 | `file-based-routing/hmr.md` | 标为 main 文档修正，不冒充已发布文档行为 |

这 12 个 commits 还包含 workspace、build、robots 和注释性改动；RA0 不把无关差异扩成课程需求。

## Reference 信息架构

### 总览分组

| 分组 | 用户问题 | 稳定 API 数 | 交付批次 |
| --- | --- | ---: | --- |
| Configuration | 如何创建 Router、选择 history、理解实例契约 | 10 | RA1 |
| Matching | matcher 如何处理 records、locations、params 与 query | 58 | RA2 |
| Components & Composables | 组件、组合式入口与 injection keys 如何协作 | 17 | RA3 |
| Navigation | 守卫返回值、执行阶段与 failure 判定 | 14 | RA4 |
| Typed & File-Based | 类型映射和构建期生成链路如何衔接 | 19 | RA5 |
| Experimental | 哪些能力不属于稳定根入口、当前风险是什么 | 0（另列 86） | RA6 |

Reference Overview 的完成度只用前五组稳定 118 项计算；Experimental 显示独立
`watchlist 86`，不得进入 `availableCount/total`。

### 14 个稳定详情目标

下面的显式 HTML anchor 是 118 项矩阵中 planned target 的落点定义。未来 entry 的正文 heading
anchor 必须与矩阵末段完全一致；本节 anchor 只用于 RA0 文档内跳转，不等于内容已经 available。

<a id="target-ra1-create-router"></a>

#### RA1 `vue.router.reference.configuration.create-router`（2）

承载 `RouterOptions`、`createRouter`；解释 plugin 安装前置、routes/history 必填项和配置所有权。

<a id="target-ra1-router-instance"></a>

#### RA1 `vue.router.reference.configuration.router-instance`（2 + 19 public + 1 internal）

承载 `Router`、`_RouterClassic`、19 个公开成员和 internal `install`；7 个 internal symbol 只作
边界提示。

<a id="target-ra1-history"></a>

#### RA1 `vue.router.reference.configuration.history`（6）

承载三种 history factory、`HistoryState`、`RouterHistory` alpha 标签与 `RouterScrollBehavior`。

<a id="target-ra2-matcher"></a>

#### RA2 `vue.router.reference.matching.matcher`（6）

承载 matcher location、parser options、`RouterMatcher` 和 `createRouterMatcher`；internal 项不给应用层
推荐。

<a id="target-ra2-route-records"></a>

#### RA2 `vue.router.reference.matching.route-records`（14）

承载 raw/normalized、single/multiple views、children、redirect、name 与 meta 的 record 家族。

<a id="target-ra2-route-locations"></a>

#### RA2 `vue.router.reference.matching.route-locations`（21）

承载 raw/resolved/normalized/loaded/path/relative/string 的 generic 家族与 `START_LOCATION`。

<a id="target-ra2-params-query"></a>

#### RA2 `vue.router.reference.matching.params-query`（17）

承载 params/query raw 与 normalized 值域、repeatable 参数、`parseQuery`/`stringifyQuery` 配置
contract。

<a id="target-ra3-router-link"></a>

#### RA3 `vue.router.reference.components.router-link`（6）

承载 `RouterLink`、props、`useLink` 及其 option/return 类型和内部组件接口。

<a id="target-ra3-router-view"></a>

#### RA3 `vue.router.reference.components.router-view`（3）

承载 `RouterView`、`RouterViewProps`、`RouteComponent`，并解释 depth 与 slot 的接口边界。

<a id="target-ra3-navigation-composables"></a>

#### RA3 `vue.router.reference.composables.navigation`（3）

承载 `useRouter`、`useRoute`、`loadRouteLocation`；低层 location loading 不写成常规取数组合式函数。

<a id="target-ra3-injection-keys"></a>

#### RA3 `vue.router.reference.composables.injection-keys`（5）

承载 5 个 internal injection key；只解释测试/高级集成 seam 和“不建议应用代码直接依赖”。

<a id="target-ra4-guards"></a>

#### RA4 `vue.router.reference.navigation.guards`（9）

承载守卫 callable interfaces、返回值、deprecated `next`、组件内守卫函数和 after hook。

<a id="target-ra4-failures"></a>

#### RA4 `vue.router.reference.navigation.failures`（5）

承载 failure enum/interface、internal error types、redirect error 与 `isNavigationFailure`。

<a id="target-ra5-typed-routes"></a>

#### RA5 `vue.router.reference.typed-routes.route-map`（19）

承载 `RouteRecordInfo`/`RouteMap`/`TypesConfig` 与 typed list 家族；稳定根入口事实和 RA6
“Experimental Type Safe API”混合信号并列呈现。

### 不承载稳定主入口项的附加页

RA5 还需创建 4 个不计入 14 个稳定详情目标、也不增加 118 分母的构建期页面：

| entryId | 内容边界 |
| --- | --- |
| `vue.router.reference.file-based.overview` | pages 约定、生成 route tree 与 runtime matcher 的阶段分工 |
| `vue.router.reference.file-based.virtual-modules` | `auto-routes`、`auto-resolver` 的 types-only/虚拟模块前置 |
| `vue.router.reference.tooling.unplugin` | `vite`、`unplugin`、adapter 与已证实的扩展名冲突 |
| `vue.router.reference.tooling.volar-migration` | 两个 Volar 入口、deprecated `auto` 与 v4-to-v5 迁移边界 |

`auto-resolver` 的 export-map 存在事实由 RA5 记录，但 resolver 的实验性语义仍链接 RA6，不因
manifest key 存在而升级。RA6 只创建
`vue.router.reference.experimental.watchlist`，承载 86 项名称、实验配置 flag 和冲突账本。

## 详情页与结构化索引模板

### 结构化索引契约

现有 `ReferenceIndexItemManifest` 已有 `id/name/officialUrl/depth/status/target`，但没有保存官方
源码标签。RA1 的唯一共享 schema 改动是增加可选字段：

```ts
export type ReferenceSourceTag = 'public' | 'internal' | 'alpha' | 'deprecated'

export interface ReferenceIndexItemManifest {
  // 既有字段保持不变
  sourceTag?: ReferenceSourceTag
}
```

字段保持 optional，避免为 Vue Core 206 项制造无关迁移；Vue Router 专用 section helper 则要求
118 项全部显式传入 `sourceTag`。`ReferenceOverviewItem` 继承该字段，总览对 `internal`、`alpha`、
`deprecated` 显示短标签。样式只复用现有 flex/margin 规则，不使用 `grid` 或 `gap`。

RA0 文档中的 planned target 是实施意图，不是可导航链接。结构化 manifest 必须遵守：

```ts
{
  id: 'functions.createrouter',
  name: 'createRouter',
  officialUrl: 'https://router.vuejs.org/api/functions/createrouter',
  sourceTag: 'public',
  depth: 'detail',
  status: 'planned',
  // planned 时不写 target，避免总览产生伪链接
}
```

只有同批 entry 与真实 heading 已存在后才可原子切换：

```ts
{
  id: 'functions.createrouter',
  name: 'createRouter',
  officialUrl: 'https://router.vuejs.org/api/functions/createrouter',
  sourceTag: 'public',
  depth: 'detail',
  status: 'available',
  target: {
    entryId: 'vue.router.reference.configuration.create-router',
    anchor: 'create-router',
  },
}
```

### Reference entry 模板

保持现有 `ReferenceMeta`/`ReferenceEntry`，不新增 Router 专用正文 schema。每个文件复用
`defineReferenceMeta()` 和 `defineReference()`：

```ts
/** Vue Router 参考：本页主题；固定版本与一手来源见 meta。 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'vue.router.reference.configuration.create-router',
  type: 'reference',
  title: '创建 Router',
  summary: '...',
  ecosystem: 'vue',
  module: 'router',
  collection: 'configuration',
  related: [],
  tags: ['Vue Router', 'createRouter', 'RouterOptions'],
  sources: [
    { title: 'Vue Router API: createRouter', url: 'https://router.vuejs.org/api/functions/createrouter' },
    { title: 'Vue Router v5.2.0 source', url: 'https://github.com/vuejs/router/tree/v5.2.0/packages/router/src' },
  ],
  appliesTo: 'Vue Router 5.2.0',
  verifiedAt: '2026-08-04',
  // 这里保存可搜索的 heading 文本，不保存 slug。
  anchors: ['概述', 'Create Router', 'Router Options', '易错使用提示', '源码边界'],
})

export default defineReference({
  meta,
  signature: 'declare function createRouter(options: RouterOptions): Router',
  blocks: [
    { type: 'heading', content: '概述' },
    // signature、参数/返回值、最小示例、关系与版本边界
    { type: 'heading', content: '易错使用提示' },
    // 紧随一个已有结构的 pitfalls block
    { type: 'heading', content: '源码边界' },
  ],
})
```

示例中的 `Create Router` 经现有 `headingId()` 生成 `create-router`，必须与 manifest target 一致。
每个新方法上方继续使用规范中文注释；Reference 默认不创建 Demo，只有无法用静态示例解释且用户
另行批准时才评估独立 Demo。

### 三档内容深度

| depth | 必须内容 | 明确不做 |
| --- | --- | --- |
| `detail` | 独立 heading、完整签名、参数/返回值、典型用法、易错项、固定源码推导 | 不复制整个 Guide，不为每个 overload 建页 |
| `merged` | 独立 heading、签名/值域、与同族 API 的差异、最小示例或类型示例 | 不只在段落里顺带提名 |
| `quick` | 独立 heading、sourceTag 警告、用途/替代方案、固定源码链接 | 不提供鼓励应用层依赖的示例 |

所有页面都必须有非空 `signature`、`易错使用提示` heading 与结构化 pitfalls block，以满足当前
Reference 模板 gate。`internal`、`alpha`、`deprecated` 警示以固定源码标签为准，不能从命名猜测。

## RA1-RA6 实施批次

### RA1：配置、实例与 history（10）

交付 3 个稳定详情页、完整 118 项结构化 index 的 planned 骨架，以及 Router Reference track。
文件级范围：

- 新增 `src/content/catalog/manifests/vue-router-reference.ts`、Router 专用 section helper、按分组拆分
  的 index 文件和总 index；修改 `tracks.ts`、`catalog/index.ts`。
- 在 `src/content/catalog/types.ts` 只增加 optional `sourceTag` 类型；
  `ReferenceOverviewPage.vue` 只增加 sourceTag 文本标签和筛选命中，不重排页面。
- 新增 `src/content/entries/reference/vue/router/configuration/` 下 3 页。
- 新增 1 个 RA1 focused catalog spec；只为总览标签增加 1 条可复跑 Playwright 路径。

Gate：10 项 `available`、108 项 `planned` 且无 planned target；3 个 entry 的全部 target anchor
真实唯一；Router 19 public + 1 internal method + 7 internal symbol 的成员清单存在。完成后停止，
不进入 matcher/records。

### RA2：matcher、records、locations、params/query（58）

新增 4 个 matching 详情页，更新 Reference track 与对应 index group，将本批 58 项和真实 target
同批切为 `available`。最多新增 1 个 focused spec，机械断言累计 `68 available / 50 planned / 118`
及四页 heading 完整。不得修改 RA1 正文、组件/composables 或 guards。

### RA3：components、composables、injection keys（17）

新增 4 页，将 17 项切为 `available`；injection keys 页必须对 5 项逐一显示 `internal`，不能写成
常规依赖注入教程。最多新增 1 个 focused spec，累计断言 `85 / 33 / 118`。不进入守卫执行流。

### RA4：guards 与 failures（14）

新增 2 页，将 14 项切为 `available`；`NavigationGuardNext` 保留 deprecated，`ErrorTypes` 与
`NavigationRedirectError` 保留 internal。最多新增 1 个 focused spec，累计断言
`99 / 19 / 118`。不提前实现 typed/file-based 页面。

### RA5：typed routes 与构建期入口（19）

新增 1 个稳定 typed-routes 详情页和 4 个不计入 118 的 file-based/tooling 页面，将最后 19 个稳定
项切为 `available`。本批只解释已发布入口，不修改 Vite 配置、不生成 routes、不运行课程 B15
fixture。focused spec 断言 `118 / 0 / 118`、14 个稳定 target 全部可达，并单独断言 14 个
package export key 的文档覆盖。完成后停止，不自动进入 experimental。

### RA6：experimental watchlist（稳定项 0）

新增 1 个 watchlist 页，使用本文件的 76 + 10 名称、experimental flags、三个冲突/混合信号与
固定版本。它不加入稳定 index，不改变 `118 / 118`，不创建 Demo，不引入 Pinia Colada 依赖。
最多新增 1 个清单计数 spec（26+50、1+9）；完成后停止。

## 每批统一 Gate 与停止边界

1. 开始前记录 `git status --short`，复算目标 manifest SHA，并确认 lockfile 仍解析
   `vue-router@5.2.0`；若任一冻结输入变化，先重做差异审计，不能直接沿用本矩阵。
2. 每批只修改该批列出的 index/track/entry/test 文件；保护其他 staged、unstaged、untracked
   资产，不格式化全仓、不清理用户工作区。
3. 先运行该批唯一 focused spec：
   `npm test -- src/content/catalog/vue-router-reference-raN.spec.ts`。已有断言能覆盖时不新增测试。
4. 再运行 `npm run type-check`、`npm run lint`、`npm run format:check` 和
   `git diff --check -- <本批文件>`。失败必须按本批改动或既有故障精确归因，不能把 focused green
   写成整体 green。
5. 只有 RA1 触及总览 UI：形成一条 Playwright 可复跑证据，覆盖 sourceTag 文本、planned 禁用、
   available anchor、键盘筛选和 390px；不新增第二条重复 E2E。其余批次无 UI 组件变化时不重复
   浏览器测试。
6. RA1 首次接入 Router Reference 和 RA6 最终闭合运行 `npm run build`；中间纯内容批次不机械
   重复 build，除非类型/registry 变化需要扩大反馈环。
7. 每批报告实际文件、计数、focused/global gate 后停止。不得自动进入下一批，不得提交代码。

RA0 的停止条件是本文形成机械闭合且格式/whitespace 验证通过。本文不授权执行上述任一批次；
RA1 必须由用户另行明确开始。

## 一手来源清单

### 发布与版本

- [npm `vue-router@5.2.0`](https://www.npmjs.com/package/vue-router/v/5.2.0)
- [npm registry metadata](https://registry.npmjs.org/vue-router)
- [GitHub release `v5.2.0`](https://github.com/vuejs/router/releases/tag/v5.2.0)
- [固定 commit `6e5f8d2`](https://github.com/vuejs/router/commit/6e5f8d253b9444a76eb58f176ebe08d686c937cb)
- [`v5.2.0...main` 比较](https://github.com/vuejs/router/compare/v5.2.0...main)

### 稳定 API 与实现

- [API Reference 总入口](https://router.vuejs.org/api/)
- [`Router` type alias](https://router.vuejs.org/api/type-aliases/router)
- [`_RouterClassic` interface](https://router.vuejs.org/api/interfaces/routerclassic)
- [`package.json@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/package.json)
- [`src/index.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/index.ts)
- [`src/router.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts)
- [`typed-routes@v5.2.0`](https://github.com/vuejs/router/tree/v5.2.0/packages/router/src/typed-routes)

### Guide、构建期与 experimental

- [Guide sidebar 固定源码](https://github.com/vuejs/router/blob/v5.2.0/packages/docs/.vitepress/config/en.ts)
- [File-Based Routing](https://router.vuejs.org/file-based-routing/)
- [File-Based Routing 配置](https://router.vuejs.org/file-based-routing/configuration)
- [`definePage` / Extending Routes](https://router.vuejs.org/file-based-routing/extending-routes#definepage)
- [HMR](https://router.vuejs.org/file-based-routing/hmr)
- [v4 to v5 migration](https://router.vuejs.org/guide/migration/v4-to-v5)
- [`experimental/index.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/experimental/index.ts)
- [`experimental` 源码目录](https://github.com/vuejs/router/tree/v5.2.0/packages/router/src/experimental)
- [Experimental Router Resolver](https://router.vuejs.org/experimental/router-resolver)
- [Experimental Param Parsers](https://router.vuejs.org/experimental/param-parsers)
- [Experimental Basic Data Loader](https://router.vuejs.org/data-loaders/basic/)
- [`unplugin/options.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/unplugin/options.ts)

本地机械证据来自 lockfile 安装的
`node_modules/vue-router/dist/vue-router.d.ts`、`dist/index-BN0B0y8a.d.ts`、两个
`dist/experimental/*.d.ts` 与 `package.json`；它们与上方 npm 固定 tarball 属于同一
`5.2.0` 发布物。官网 `/api` 是查证时 current，固定 tag 源码与本地声明用于阻止 current-only
行为倒灌。
