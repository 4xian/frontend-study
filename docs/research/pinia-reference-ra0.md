# Pinia Reference RA0 官方研究与实施冻结

> 状态：`P0.2 / PRA0 / research-only`，本文所有 API 项均为 `planned`
>
> 查证日期：2026-08-04（Asia/Shanghai）
>
> 适用版本：本地与 lockfile 的 `pinia@4.0.2`
>
> 固定 tag：[`v4.0.2`](https://github.com/vuejs/pinia/releases/tag/v4.0.2)
>
> 固定 tag commit：[`ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1`](https://github.com/vuejs/pinia/commit/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1)
>
> 审计 manifest：`src/content/catalog/manifests/vue-pinia-track.ts`
>
> Manifest SHA-256：`903e8126486d2abbb3bf177f380408853987e26195417ef3a63fbfda86a8825f`
>
> 本地主入口声明 SHA-256：`e13460b9f39a197d76b64f4b4a14ddc403b4d85e036adb5850b820f7e08e0674`

## RA0 结论

1. 固定 `pinia@4.0.2` 根入口共有 **67 个命名导出**：`17 runtime + 50 type-only`。当前
   [Pinia API 导航](https://pinia.vuejs.org/api/pinia/)列出 66 项，双向差集为
   `officialOnly=[]`、`localOnly=[piniaSymbol]`。`piniaSymbol` 已发布但标记 `@internal`，官网
   TypeDoc 配置使用 `excludeInternal: true`，因此不能把“官网 66”误写成“发布入口 66”。
2. 后续稳定 Reference 的完成度分母冻结为 **41 项**：`15 runtime + 26 type-only`。其余
   **26 项**是 `25 internal + 1 deprecated`，其中 24 个下划线类型虽仍出现在官网索引，但说明
   明确写着 internal；另一个 internal 是 `piniaSymbol`，deprecated 项是 `mapGetters`。固定源码
   没有 `@alpha` 或 `@experimental` 根入口导出。
3. 41 项不机械拆成 41 页。本文冻结 9 个稳定详情目标，深度为
   `17 detail + 17 merged + 7 quick`。每项保留唯一 `apiId`、官方 URL、稳定分母归属、深度和
   `entryId#anchor`；只有真实 entry 与唯一 anchor 同批存在后，结构化索引才能从 `planned`
   原子切换为 `available`。
4. 插件、SSR、Hydration、HMR、Devtools 和 testing 都有明确边界：只有根包 41 项进入稳定分母；
   `@pinia/testing`、`@pinia/nuxt` 是独立 package，Devtools 没有公开子路径，internal/deprecated
   只进入边界观察，不得被包装成推荐 API。
5. RA0 只交付本文。**不创建** Pinia Reference index、正文、Demo、registry、测试、manifest 或
   配置；不修改实施计划，不启动服务、不打开页面、不构建、不提交。完成本文即停，不进入 PRA1。

## 版本与机械核验方法

### 发布快照

| 证据 | 冻结值 |
| --- | --- |
| npm 固定版本 | [`pinia@4.0.2`](https://www.npmjs.com/package/pinia/v/4.0.2) |
| GitHub release | [`v4.0.2`](https://github.com/vuejs/pinia/releases/tag/v4.0.2)，release notes 为 `No significant changes` |
| 固定 commit | `ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1`，message 为 `release: pinia@4.0.2 @pinia/testing@2.0.1` |
| tarball | `https://registry.npmjs.org/pinia/-/pinia-4.0.2.tgz` |
| tarball integrity | `sha512-yKVVA7bSj5oRZFp/Ab9wLlmyb5gPUYEiIm4ryiWTe/xe7PtkRdMVOp1X1ggvq0c6Uj7Q0Du1HnV2mtAwM0Ks1g==` |
| lockfile SHA-256 | `6a68e9e91d6b08c740fdcdecdf64951639e7aba78f1acd4d766c7c6f9b1e1c98` |
| 本地 `node_modules/pinia/package.json` SHA-256 | `3f582bbd93981c665127629912ba784031d740f2bb1ceb0decc206846e97ace9` |
| 本地 runtime SHA-256 | `eb83983da65fdbdb6585de805bda8cadc70a9d273444da1bf4811f6e4851ea92` |

本地安装同时解析为 `vue@3.5.40`、`vue-router@5.2.0`、`pinia@4.0.2`。Pinia 4 发布包是
ESM-only；`@vue/devtools-api ^8.1.5` 是非 optional peer dependency，TypeScript peer
`>=5.6.0` 是 optional。官网当前页头、edit 和 changelog 链接仍带有 `v3.x`/`v3` 信息，因此官网
只作为查证时的导航和说明文本；版本与行为结论以固定 4.0.2 发布物、commit 和测试为准。

### 可直接复算的本地入口脚本

以下命令只读本地声明文件，通过 TypeScript Compiler API 取得最终命名导出、runtime/type-only
通道、声明种类和 JSDoc。Pinia 的 24 个下划线类型主要用“for internal use only”等说明文本，而
不是 24 个机械 `@internal` tag；脚本同时检查 tag 与声明说明，避免把 tag 出现次数误当符号数。

```bash
node <<'NODE'
const ts = require('typescript')
const path = require('node:path')

const file = path.resolve('node_modules/pinia/dist/pinia.d.ts')
const program = ts.createProgram([file], { skipLibCheck: true })
const checker = program.getTypeChecker()
const source = program.getSourceFile(file)
const exportsNode = source.statements.find(
  (node) =>
    ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause),
)

const rows = exportsNode.exportClause.elements.map((item) => {
  const local = item.propertyName ?? item.name
  let symbol = checker.getSymbolAtLocation(local)
  if (symbol?.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol)
  const declaration = symbol?.declarations?.[0]
  const docs = symbol ? ts.displayPartsToString(symbol.getDocumentationComment(checker)) : ''
  const tags = symbol?.getJsDocTags(checker).map((tag) => tag.name) ?? []
  const sourceTag = tags.includes('deprecated')
    ? 'deprecated'
    : tags.includes('internal') ||
        /internal (use|type)|should not be used directly/i.test(docs)
      ? 'internal'
      : 'public'

  return {
    name: item.name.text,
    channel: item.isTypeOnly ? 'type-only' : 'runtime',
    declarationKind: declaration ? ts.SyntaxKind[declaration.kind] : 'unknown',
    sourceTag,
  }
})

const count = (pick) => rows.filter(pick).length
console.table({
  total: rows.length,
  runtime: count((row) => row.channel === 'runtime'),
  typeOnly: count((row) => row.channel === 'type-only'),
  public: count((row) => row.sourceTag === 'public'),
  internal: count((row) => row.sourceTag === 'internal'),
  deprecated: count((row) => row.sourceTag === 'deprecated'),
})
NODE
```

预期结果为 `67 / 17 / 50 / 41 / 25 / 1`。运行时可再用
`node -e "import('pinia').then(m => console.log(Object.keys(m).sort()))"` 复核 17 个真实 runtime
导出。官网集合由 Tavily 读取 `/api/pinia/` 五个 TypeDoc 分类，再与本地 67 项按公开名严格差集；
不使用 prose 搜索命中数代替结构化集合。

`depth` 沿用 Vue Core 和 Vue Router Reference 的三档口径：`detail` 为完整主参考；`merged` 为
合并页中的完整独立 heading；`quick` 为低频稳定项或边界项的独立 heading。`quick` 仍必须可定位，
不能只在正文中顺带提及。

## 官网分类与稳定分母

| 官网分类 | 官网数量 | 本地根入口 | 稳定分母 | 排除项 |
| --- | ---: | ---: | ---: | ---: |
| Enumerations | 1 | 1 runtime | 1 | 0 |
| Interfaces | 19 | 19 type-only | 16 | 3 internal |
| Type Aliases | 31 | 31 type-only | 10 | 21 internal |
| Variables | 3 | 4 runtime | 2 | 1 deprecated + 1 internal local-only |
| Functions | 12 | 12 runtime | 12 | 0 |
| **总计** | **66** | **17 runtime + 50 type-only = 67** | **15 runtime + 26 type-only = 41** | **25 internal + 1 deprecated = 26** |

当前官网仍列出 24 个 internal type-only 项。是否出现在官网导航与是否属于稳定公共分母是两件事：
前者反映 TypeDoc 页面是否生成，后者必须结合固定源码的 internal/deprecated 信号。`piniaSymbol` 是
唯一被 `excludeInternal` 从导航移除的已发布根入口；`mapGetters` 在官网显示删除线，并明确要求改用
`mapState()`。

## 67 项根入口冻结矩阵

`apiId` 使用 `<official-category>.<TypeDoc-basename-lowercase>`；`piniaSymbol` 没有官网详情页，但按
本地声明种类保留 `variables.piniasymbol`。`stable` 只有 `yes` 才计入后续 `41/41` 完成度；`no`
仍要在边界页或相关主题页保留可定位警告。表内 target 是实施覆盖意图，不是当前站内链接；
restricted 项也不因此进入稳定 Reference index。

| apiId | displayName | officialUrl | channel/kind | sourceTag | stable | depth | planned entryId/heading target | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `enumerations.mutationtype` | `MutationType` | [官方](https://pinia.vuejs.org/api/pinia/enumerations/MutationType.html) | `runtime/enumeration` | `public` | `yes` | `detail` | [`vue.pinia.reference.observation.subscriptions#mutation-type`](#target-pra2-subscriptions) | `planned` |
| `interfaces.storeonactionlistenercontext` | `_StoreOnActionListenerContext` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/StoreOnActionListenerContext.html) | `type-only/interface` | `internal` | `no` | `quick` | [`vue.pinia.reference.boundaries.internal-types#internal-store-on-action-listener-context`](#target-pra4-internal-types) | `planned` |
| `interfaces.storewithstate` | `_StoreWithState` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/StoreWithState.html) | `type-only/interface` | `internal` | `no` | `quick` | [`vue.pinia.reference.boundaries.internal-types#internal-store-with-state`](#target-pra4-internal-types) | `planned` |
| `interfaces.subscriptioncallbackmutationbase` | `_SubscriptionCallbackMutationBase` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/SubscriptionCallbackMutationBase.html) | `type-only/interface` | `internal` | `no` | `quick` | [`vue.pinia.reference.boundaries.internal-types#internal-subscription-callback-mutation-base`](#target-pra4-internal-types) | `planned` |
| `interfaces.definesetupstoreoptions` | `DefineSetupStoreOptions` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/DefineSetupStoreOptions.html) | `type-only/interface` | `public` | `yes` | `detail` | [`vue.pinia.reference.stores.define-store#define-setup-store-options`](#target-pra1-define-store) | `planned` |
| `interfaces.definestoreoptions` | `DefineStoreOptions` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/DefineStoreOptions.html) | `type-only/interface` | `public` | `yes` | `detail` | [`vue.pinia.reference.stores.define-store#define-store-options`](#target-pra1-define-store) | `planned` |
| `interfaces.definestoreoptionsbase` | `DefineStoreOptionsBase` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/DefineStoreOptionsBase.html) | `type-only/interface` | `public` | `yes` | `merged` | [`vue.pinia.reference.stores.define-store#define-store-options-base`](#target-pra1-define-store) | `planned` |
| `interfaces.definestoreoptionsinplugin` | `DefineStoreOptionsInPlugin` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/DefineStoreOptionsInPlugin.html) | `type-only/interface` | `public` | `yes` | `merged` | [`vue.pinia.reference.plugins.plugin-contracts#define-store-options-in-plugin`](#target-pra3-plugin-contracts) | `planned` |
| `interfaces.mapstorescustomization` | `MapStoresCustomization` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/MapStoresCustomization.html) | `type-only/interface` | `public` | `yes` | `quick` | [`vue.pinia.reference.options-api.map-helpers#map-stores-customization`](#target-pra3-map-helpers) | `planned` |
| `interfaces.pinia` | `Pinia` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/Pinia.html) | `type-only/interface` | `public` | `yes` | `detail` | [`vue.pinia.reference.core.pinia-instance#pinia-interface`](#target-pra1-pinia-instance) | `planned` |
| `interfaces.piniacustomproperties` | `PiniaCustomProperties` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/PiniaCustomProperties.html) | `type-only/interface` | `public` | `yes` | `merged` | [`vue.pinia.reference.plugins.plugin-contracts#pinia-custom-properties`](#target-pra3-plugin-contracts) | `planned` |
| `interfaces.piniacustomstateproperties` | `PiniaCustomStateProperties` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/PiniaCustomStateProperties.html) | `type-only/interface` | `public` | `yes` | `merged` | [`vue.pinia.reference.plugins.plugin-contracts#pinia-custom-state-properties`](#target-pra3-plugin-contracts) | `planned` |
| `interfaces.piniaplugin` | `PiniaPlugin` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/PiniaPlugin.html) | `type-only/interface` | `public` | `yes` | `detail` | [`vue.pinia.reference.plugins.plugin-contracts#pinia-plugin`](#target-pra3-plugin-contracts) | `planned` |
| `interfaces.piniaplugincontext` | `PiniaPluginContext` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/PiniaPluginContext.html) | `type-only/interface` | `public` | `yes` | `merged` | [`vue.pinia.reference.plugins.plugin-contracts#pinia-plugin-context`](#target-pra3-plugin-contracts) | `planned` |
| `interfaces.setupstoredefinition` | `SetupStoreDefinition` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/SetupStoreDefinition.html) | `type-only/interface` | `public` | `yes` | `detail` | [`vue.pinia.reference.stores.define-store#setup-store-definition`](#target-pra1-define-store) | `planned` |
| `interfaces.storedefinition` | `StoreDefinition` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/StoreDefinition.html) | `type-only/interface` | `public` | `yes` | `detail` | [`vue.pinia.reference.stores.define-store#store-definition`](#target-pra1-define-store) | `planned` |
| `interfaces.storeproperties` | `StoreProperties` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/StoreProperties.html) | `type-only/interface` | `public` | `yes` | `detail` | [`vue.pinia.reference.stores.store-shape#store-properties`](#target-pra1-store-shape) | `planned` |
| `interfaces.subscriptioncallbackmutationdirect` | `SubscriptionCallbackMutationDirect` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/SubscriptionCallbackMutationDirect.html) | `type-only/interface` | `public` | `yes` | `merged` | [`vue.pinia.reference.observation.subscriptions#direct-mutation`](#target-pra2-subscriptions) | `planned` |
| `interfaces.subscriptioncallbackmutationpatchfunction` | `SubscriptionCallbackMutationPatchFunction` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/SubscriptionCallbackMutationPatchFunction.html) | `type-only/interface` | `public` | `yes` | `merged` | [`vue.pinia.reference.observation.subscriptions#patch-function-mutation`](#target-pra2-subscriptions) | `planned` |
| `interfaces.subscriptioncallbackmutationpatchobject` | `SubscriptionCallbackMutationPatchObject` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/SubscriptionCallbackMutationPatchObject.html) | `type-only/interface` | `public` | `yes` | `merged` | [`vue.pinia.reference.observation.subscriptions#patch-object-mutation`](#target-pra2-subscriptions) | `planned` |
| `type-aliases.actionstree` | `_ActionsTree` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/ActionsTree.html) | `type-only/type-alias` | `internal` | `no` | `quick` | [`vue.pinia.reference.boundaries.internal-types#internal-actions-tree`](#target-pra4-internal-types) | `planned` |
| `type-aliases.deeppartial` | `_DeepPartial` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/DeepPartial.html) | `type-only/type-alias` | `internal` | `no` | `quick` | [`vue.pinia.reference.boundaries.internal-types#internal-deep-partial`](#target-pra4-internal-types) | `planned` |
| `type-aliases.extractactionsfromsetupstore` | `_ExtractActionsFromSetupStore` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/ExtractActionsFromSetupStore.html) | `type-only/type-alias` | `internal` | `no` | `quick` | [`vue.pinia.reference.boundaries.internal-types#internal-extract-actions-from-setup-store`](#target-pra4-internal-types) | `planned` |
| `type-aliases.extractactionsfromsetupstore_keys` | `_ExtractActionsFromSetupStore_Keys` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/ExtractActionsFromSetupStore_Keys.html) | `type-only/type-alias` | `internal` | `no` | `quick` | [`vue.pinia.reference.boundaries.internal-types#internal-extract-actions-from-setup-store-keys`](#target-pra4-internal-types) | `planned` |
| `type-aliases.extractgettersfromsetupstore` | `_ExtractGettersFromSetupStore` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/ExtractGettersFromSetupStore.html) | `type-only/type-alias` | `internal` | `no` | `quick` | [`vue.pinia.reference.boundaries.internal-types#internal-extract-getters-from-setup-store`](#target-pra4-internal-types) | `planned` |
| `type-aliases.extractgettersfromsetupstore_keys` | `_ExtractGettersFromSetupStore_Keys` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/ExtractGettersFromSetupStore_Keys.html) | `type-only/type-alias` | `internal` | `no` | `quick` | [`vue.pinia.reference.boundaries.internal-types#internal-extract-getters-from-setup-store-keys`](#target-pra4-internal-types) | `planned` |
| `type-aliases.extractstatefromsetupstore` | `_ExtractStateFromSetupStore` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/ExtractStateFromSetupStore.html) | `type-only/type-alias` | `internal` | `no` | `quick` | [`vue.pinia.reference.boundaries.internal-types#internal-extract-state-from-setup-store`](#target-pra4-internal-types) | `planned` |
| `type-aliases.extractstatefromsetupstore_keys` | `_ExtractStateFromSetupStore_Keys` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/ExtractStateFromSetupStore_Keys.html) | `type-only/type-alias` | `internal` | `no` | `quick` | [`vue.pinia.reference.boundaries.internal-types#internal-extract-state-from-setup-store-keys`](#target-pra4-internal-types) | `planned` |
| `type-aliases.getterstree` | `_GettersTree` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/GettersTree.html) | `type-only/type-alias` | `internal` | `no` | `quick` | [`vue.pinia.reference.boundaries.internal-types#internal-getters-tree`](#target-pra4-internal-types) | `planned` |
| `type-aliases.mapactionsobjectreturn` | `_MapActionsObjectReturn` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/MapActionsObjectReturn.html) | `type-only/type-alias` | `internal` | `no` | `quick` | [`vue.pinia.reference.boundaries.internal-types#internal-map-actions-object-return`](#target-pra4-internal-types) | `planned` |
| `type-aliases.mapactionsreturn` | `_MapActionsReturn` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/MapActionsReturn.html) | `type-only/type-alias` | `internal` | `no` | `quick` | [`vue.pinia.reference.boundaries.internal-types#internal-map-actions-return`](#target-pra4-internal-types) | `planned` |
| `type-aliases.mapstateobjectreturn` | `_MapStateObjectReturn` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/MapStateObjectReturn.html) | `type-only/type-alias` | `internal` | `no` | `quick` | [`vue.pinia.reference.boundaries.internal-types#internal-map-state-object-return`](#target-pra4-internal-types) | `planned` |
| `type-aliases.mapstatereturn` | `_MapStateReturn` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/MapStateReturn.html) | `type-only/type-alias` | `internal` | `no` | `quick` | [`vue.pinia.reference.boundaries.internal-types#internal-map-state-return`](#target-pra4-internal-types) | `planned` |
| `type-aliases.mapwritablestateobjectreturn` | `_MapWritableStateObjectReturn` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/MapWritableStateObjectReturn.html) | `type-only/type-alias` | `internal` | `no` | `quick` | [`vue.pinia.reference.boundaries.internal-types#internal-map-writable-state-object-return`](#target-pra4-internal-types) | `planned` |
| `type-aliases.mapwritablestatereturn` | `_MapWritableStateReturn` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/MapWritableStateReturn.html) | `type-only/type-alias` | `internal` | `no` | `quick` | [`vue.pinia.reference.boundaries.internal-types#internal-map-writable-state-return`](#target-pra4-internal-types) | `planned` |
| `type-aliases.method` | `_Method` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/Method.html) | `type-only/type-alias` | `internal` | `no` | `quick` | [`vue.pinia.reference.boundaries.internal-types#internal-method`](#target-pra4-internal-types) | `planned` |
| `type-aliases.spread` | `_Spread` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/Spread.html) | `type-only/type-alias` | `internal` | `no` | `quick` | [`vue.pinia.reference.boundaries.internal-types#internal-spread`](#target-pra4-internal-types) | `planned` |
| `type-aliases.statetree` | `StateTree` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/StateTree.html) | `type-only/type-alias` | `public` | `yes` | `quick` | [`vue.pinia.reference.stores.store-shape#state-tree`](#target-pra1-store-shape) | `planned` |
| `type-aliases.store` | `Store` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/Store.html) | `type-only/type-alias` | `public` | `yes` | `detail` | [`vue.pinia.reference.stores.store-shape#store-type`](#target-pra1-store-shape) | `planned` |
| `type-aliases.storeactions` | `StoreActions` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/StoreActions.html) | `type-only/type-alias` | `public` | `yes` | `merged` | [`vue.pinia.reference.stores.store-shape#store-actions`](#target-pra1-store-shape) | `planned` |
| `type-aliases.storegeneric` | `StoreGeneric` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/StoreGeneric.html) | `type-only/type-alias` | `public` | `yes` | `quick` | [`vue.pinia.reference.stores.store-shape#store-generic`](#target-pra1-store-shape) | `planned` |
| `type-aliases.storegetters` | `StoreGetters` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/StoreGetters.html) | `type-only/type-alias` | `public` | `yes` | `merged` | [`vue.pinia.reference.stores.store-shape#store-getters`](#target-pra1-store-shape) | `planned` |
| `type-aliases.storeobject` | `_StoreObject` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/StoreObject.html) | `type-only/type-alias` | `internal` | `no` | `quick` | [`vue.pinia.reference.boundaries.internal-types#internal-store-object`](#target-pra4-internal-types) | `planned` |
| `type-aliases.storeonactionlistener` | `StoreOnActionListener` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/StoreOnActionListener.html) | `type-only/type-alias` | `public` | `yes` | `detail` | [`vue.pinia.reference.observation.subscriptions#store-on-action-listener`](#target-pra2-subscriptions) | `planned` |
| `type-aliases.storeonactionlistenercontext` | `StoreOnActionListenerContext` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/StoreOnActionListenerContext.html) | `type-only/type-alias` | `public` | `yes` | `merged` | [`vue.pinia.reference.observation.subscriptions#store-on-action-listener-context`](#target-pra2-subscriptions) | `planned` |
| `type-aliases.storestate` | `StoreState` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/StoreState.html) | `type-only/type-alias` | `public` | `yes` | `merged` | [`vue.pinia.reference.stores.store-shape#store-state`](#target-pra1-store-shape) | `planned` |
| `type-aliases.storewithactions` | `_StoreWithActions` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/StoreWithActions.html) | `type-only/type-alias` | `internal` | `no` | `quick` | [`vue.pinia.reference.boundaries.internal-types#internal-store-with-actions`](#target-pra4-internal-types) | `planned` |
| `type-aliases.storewithgetters` | `_StoreWithGetters` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/StoreWithGetters.html) | `type-only/type-alias` | `internal` | `no` | `quick` | [`vue.pinia.reference.boundaries.internal-types#internal-store-with-getters`](#target-pra4-internal-types) | `planned` |
| `type-aliases.subscriptioncallback` | `SubscriptionCallback` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/SubscriptionCallback.html) | `type-only/type-alias` | `public` | `yes` | `detail` | [`vue.pinia.reference.observation.subscriptions#subscription-callback`](#target-pra2-subscriptions) | `planned` |
| `type-aliases.subscriptioncallbackmutation` | `SubscriptionCallbackMutation` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/SubscriptionCallbackMutation.html) | `type-only/type-alias` | `public` | `yes` | `merged` | [`vue.pinia.reference.observation.subscriptions#subscription-callback-mutation`](#target-pra2-subscriptions) | `planned` |
| `type-aliases.unwrapall` | `_UnwrapAll` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/UnwrapAll.html) | `type-only/type-alias` | `internal` | `no` | `quick` | [`vue.pinia.reference.boundaries.internal-types#internal-unwrap-all`](#target-pra4-internal-types) | `planned` |
| `variables.getactivepinia` | `getActivePinia` | [官方](https://pinia.vuejs.org/api/pinia/variables/getActivePinia.html) | `runtime/variable` | `public` | `yes` | `quick` | [`vue.pinia.reference.core.pinia-instance#get-active-pinia`](#target-pra1-pinia-instance) | `planned` |
| `variables.mapgetters` | `mapGetters` | [官方](https://pinia.vuejs.org/api/pinia/variables/mapGetters.html) | `runtime/variable` | `deprecated` | `no` | `quick` | [`vue.pinia.reference.options-api.map-helpers#deprecated-map-getters`](#target-pra3-map-helpers) | `planned` |
| `variables.setactivepinia` | `setActivePinia` | [官方](https://pinia.vuejs.org/api/pinia/variables/setActivePinia.html) | `runtime/variable` | `public` | `yes` | `quick` | [`vue.pinia.reference.core.pinia-instance#set-active-pinia`](#target-pra1-pinia-instance) | `planned` |
| `variables.piniasymbol` | `piniaSymbol` | `无官网详情页；固定源码` | `runtime/variable` | `internal` | `no` | `quick` | [`vue.pinia.reference.core.pinia-instance#internal-pinia-symbol`](#target-pra1-pinia-instance) | `planned` |
| `functions.accepthmrupdate` | `acceptHMRUpdate` | [官方](https://pinia.vuejs.org/api/pinia/functions/acceptHMRUpdate.html) | `runtime/function` | `public` | `yes` | `detail` | [`vue.pinia.reference.runtime.hmr#accept-hmr-update`](#target-pra2-hmr) | `planned` |
| `functions.createpinia` | `createPinia` | [官方](https://pinia.vuejs.org/api/pinia/functions/createPinia.html) | `runtime/function` | `public` | `yes` | `detail` | [`vue.pinia.reference.core.pinia-instance#create-pinia`](#target-pra1-pinia-instance) | `planned` |
| `functions.definestore` | `defineStore` | [官方](https://pinia.vuejs.org/api/pinia/functions/defineStore.html) | `runtime/function` | `public` | `yes` | `detail` | [`vue.pinia.reference.stores.define-store#define-store`](#target-pra1-define-store) | `planned` |
| `functions.disposepinia` | `disposePinia` | [官方](https://pinia.vuejs.org/api/pinia/functions/disposePinia.html) | `runtime/function` | `public` | `yes` | `quick` | [`vue.pinia.reference.core.pinia-instance#dispose-pinia`](#target-pra1-pinia-instance) | `planned` |
| `functions.mapactions` | `mapActions` | [官方](https://pinia.vuejs.org/api/pinia/functions/mapActions.html) | `runtime/function` | `public` | `yes` | `merged` | [`vue.pinia.reference.options-api.map-helpers#map-actions`](#target-pra3-map-helpers) | `planned` |
| `functions.mapstate` | `mapState` | [官方](https://pinia.vuejs.org/api/pinia/functions/mapState.html) | `runtime/function` | `public` | `yes` | `detail` | [`vue.pinia.reference.options-api.map-helpers#map-state`](#target-pra3-map-helpers) | `planned` |
| `functions.mapstores` | `mapStores` | [官方](https://pinia.vuejs.org/api/pinia/functions/mapStores.html) | `runtime/function` | `public` | `yes` | `merged` | [`vue.pinia.reference.options-api.map-helpers#map-stores`](#target-pra3-map-helpers) | `planned` |
| `functions.mapwritablestate` | `mapWritableState` | [官方](https://pinia.vuejs.org/api/pinia/functions/mapWritableState.html) | `runtime/function` | `public` | `yes` | `merged` | [`vue.pinia.reference.options-api.map-helpers#map-writable-state`](#target-pra3-map-helpers) | `planned` |
| `functions.setmapstoresuffix` | `setMapStoreSuffix` | [官方](https://pinia.vuejs.org/api/pinia/functions/setMapStoreSuffix.html) | `runtime/function` | `public` | `yes` | `quick` | [`vue.pinia.reference.options-api.map-helpers#set-map-store-suffix`](#target-pra3-map-helpers) | `planned` |
| `functions.shouldhydrate` | `shouldHydrate` | [官方](https://pinia.vuejs.org/api/pinia/functions/shouldHydrate.html) | `runtime/function` | `public` | `yes` | `merged` | [`vue.pinia.reference.runtime.hydration#should-hydrate`](#target-pra2-hydration) | `planned` |
| `functions.skiphydrate` | `skipHydrate` | [官方](https://pinia.vuejs.org/api/pinia/functions/skipHydrate.html) | `runtime/function` | `public` | `yes` | `detail` | [`vue.pinia.reference.runtime.hydration#skip-hydrate`](#target-pra2-hydration) | `planned` |
| `functions.storetorefs` | `storeToRefs` | [官方](https://pinia.vuejs.org/api/pinia/functions/storeToRefs.html) | `runtime/function` | `public` | `yes` | `detail` | [`vue.pinia.reference.stores.store-to-refs#store-to-refs`](#target-pra1-store-to-refs) | `planned` |

### 矩阵闭合断言

| 断言 | 冻结结果 |
| --- | ---: |
| 唯一 `apiId` | 67 |
| 唯一根入口 `displayName` | 67 |
| runtime / type-only | 17 / 50 |
| public / internal / deprecated | 41 / 25 / 1 |
| 稳定分母 yes / no | 41 / 26 |
| 稳定 runtime / type-only | 15 / 26 |
| 稳定 `detail / merged / quick` | 17 / 17 / 7 |
| PRA1 / PRA2 / PRA3 稳定批次 | 19 / 11 / 11 |
| 官网 / 本地主入口 | 66 / 67 |
| `officialOnly / localOnly` | 0 / 1（`piniaSymbol`） |

固定入口中还有被公开签名引用、但没有出现在最终 `ExportDeclaration` 和官网根索引中的声明，例如
`SetupStoreHelpers`、`StoreToRefs`、`_SetActivePinia`、`_ToStateRefs` 和 `_ToComputedRefs`。它们只在
所属 public API 的签名说明中解释，不获得新的 `apiId`，也不改变 67 或 41 的分母。接口成员同理：
需要逐项覆盖，但不是新的根入口项。

## 核心对象与成员 surface

根入口矩阵不能代替对象成员审计。后续详情页必须至少固定下列成员，避免只写函数名而漏掉实际使用
surface。

### `Pinia` 与实例所有权

`Pinia` 的公开成员是 `install(app)`、`state`、`use(plugin)`。应用代码通常通过
`app.use(createPinia())` 触发 `install`，不手动调用 `install()`。`_p`、`_a`、`_e`、`_s`、
`_testing` 都标记 `@internal`；`piniaSymbol` 也明确写着“could break in a minor, USE AT YOUR OWN
RISK”，只能作为测试/Storybook 等边界说明，不提供常规应用示例。

`setActivePinia()` 与 `getActivePinia()` 是 active-context seam，不等于进程级单例。SSR、多个 app
或测试并发时必须持有并传递正确的 Pinia 实例；`disposePinia()` 停止 effect scope 并清空 state、
plugins 与 stores，主要面向测试和多实例生命周期，dispose 后不得复用该实例。

### `StoreDefinition` 与 `Store`

`StoreDefinition` 是 `defineStore()` 的返回 callable，公开 surface 为调用签名和 `$id`；`_pinia`
是 HMR internal。`Store` 由 `StoreProperties`、state、getters 和 actions 组合而成，正文至少逐项覆盖：

- `$id`、`$state`、`$patch(object | function)`、`$reset()`、`$subscribe()`、`$onAction()`、
  `$dispose()`；
- Options Store 与 Setup Store 在 state/getters/actions 提取和 `$reset()` 支持上的差异；
- `$patch(fn)` 必须同步，`$subscribe`/`$onAction` 的 detached 生命周期，以及 `$dispose()` 不自动
  删除 `pinia.state.value[store.$id]` 的边界；
- `_p`、`_getters`、`_isOptionsAPI`、`_hotUpdate`、`_hotUpdating`、`_hmrPayload` 为 internal；
  `_customProperties` 虽以下划线开头，但固定声明没有 `@internal`，并明确允许插件作者登记供
  Devtools 展示的自定义属性，不能只凭命名误判。

### `defineStore()` 两种定义方式

`defineStore()` 的 Options Store 和 Setup Store overload 同属一个 API 项。正文必须对照
`DefineStoreOptions`、`DefineSetupStoreOptions`、`StoreDefinition`、`SetupStoreDefinition`，说明：

- store id 的唯一性和调用 `useStore()` 才实例化 store 的时机；
- Options Store 的 `state/getters/actions/hydrate`，以及 Setup Store 必须返回要被 Pinia 管理的
  state；
- `DefineStoreOptionsBase`、`DefineStoreOptionsInPlugin` 的 declaration merging 与插件扩展 seam；
- `StoreActions`、`StoreGetters`、`StoreState` 是公共提取类型，不能用 internal `_Extract*` 家族
  替代；`StoreGeneric` 明确是 type-unsafe 泛型便利类型。

## Package exports 与能力边界

### 发布包入口

固定 [`packages/pinia/package.json`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/package.json)
只声明两个 export-map key：

| export key | 发布目标 | Reference 归属 |
| --- | --- | --- |
| `pinia` / `.` | `./dist/pinia.js`，类型入口为 `./dist/pinia.d.ts` | 本文 67 项根入口；稳定完成度只计 41 |
| `pinia/package.json` / `./package.json` | `./package.json` | 发布元数据，不是 Reference API 项 |

`@pinia/testing@2.0.1` 与 `@pinia/nuxt` 是 monorepo 中独立发布的 package，不是 `pinia/testing`
或 `pinia/nuxt` 子路径。官网 API 根页另列 testing 3 项、nuxt 2 项，全站合计 71 项也不能倒灌到
core `pinia` 的 67 或稳定 41 分母。固定 tag 中旧中文 TypeDoc 仍可见已移除的
`PiniaStorePlugin`，这是翻译快照漂移，不是 4.0.2 导出事实。

### 插件

插件主题由 `PiniaPlugin`、`PiniaPluginContext`、`DefineStoreOptionsInPlugin`、
`PiniaCustomProperties`、`PiniaCustomStateProperties` 五项承载。固定
[`storePlugins.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/storePlugins.spec.ts)
要求后续正文明确：

- plugin 只作用于注册后，并且 Pinia 已安装到 app 后创建的 store；
- plugin state 要同时进入 store 和 `$state`，才进入 Devtools、SSR 序列化和 hydration contract；
- 外部副作用由 plugin 自己持有清理责任，可包装 `$dispose()`，不能把 internal registry 当公共 hook；
- 类型扩展使用官方 declaration merging seam，不直接依赖 24 个 internal helper 类型。

### SSR 与 Hydration

[官方 SSR 指南](https://pinia.vuejs.org/ssr/)与固定
[`ssr.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/ssr.spec.ts)
形成以下边界：每个请求创建并传递自己的 Pinia；组件外调用 store 时显式传入正确实例；服务端
state 必须采用防 XSS 的序列化方式，并在客户端第一次 `useStore()` 前写回 `pinia.state.value`。
课程可以讲框架集成，但 Reference 不把 Nuxt 的自动注入写成 core Pinia 保证。

`skipHydrate()` 只面向 Setup Store 返回的“有状态但不是 store state”的对象；固定测试覆盖被标记的
plain object、Map、Set 和 Array 不水合，而 primitive/nullish 仍水合。`shouldHydrate()` 是与标记
对应的判定函数。Options Store 的复杂对象水合由 `DefineStoreOptions.hydrate()` 成员承载，不能把
它误写成第三个根入口函数。

### HMR

[`acceptHMRUpdate()`](https://pinia.vuejs.org/api/pinia/functions/acceptHMRUpdate.html) 与
[HMR 指南](https://pinia.vuejs.org/cookbook/hot-module-replacement.html)只承诺 Vite 形式的
`import.meta.hot.accept(acceptHMRUpdate(useStore, import.meta.hot))`。固定
[`hmr.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/hmr.ts)
在 production 返回 no-op；固定
[`hmr.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/hmr.spec.ts)
覆盖 state/action/getter 更新，但保留 `$subscribe` 和 `$onAction` 的两个 `it.todo`。Reference 不得把
这两个待测行为写成已验证兼容承诺。

### Devtools

Devtools 通过
[`createPinia.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/createPinia.ts)
在 client/devtools build 自动注册，发布包没有公开 devtools subpath。`StoreProperties` 中若干 internal
字段只供该集成使用。固定
[`devtools.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/devtools.spec.ts)
的专门断言仅证明 testing mock action 不被二次包装，不能概括成完整 Devtools 行为覆盖。后续内容
只讲可观察能力和公共 plugin seam，不导入内部 devtools 实现。

### Testing

官方 [Testing 指南](https://pinia.vuejs.org/cookbook/testing.html)分为普通 `createPinia()` 单元测试和
独立 `@pinia/testing`。固定
[`testing.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/testing/src/testing.ts)
与
[`testing.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/testing/src/testing.spec.ts)
确认：actions 默认 stub，`$patch`/`$reset` 默认执行但会被 spy；插件通过 `plugins` 选项传入，纯 store
测试可用 `fakeApp` 触发安装。上述内容是跨页关联和课程素材，不为 core 67 新增 testing API，也不
在 PRA1-PRA4 引入 `@pinia/testing` 依赖。

## Reference 信息架构

### 总览分组

| collection | 稳定项 | 详情页 | 内容范围 |
| --- | ---: | ---: | --- |
| Core & Stores | 19 | 4 | Pinia 实例、定义方式、Store surface、响应式解构 |
| Observation & Runtime | 11 | 3 | mutation/action 订阅、SSR hydration helper、HMR |
| Plugins & Options API | 11 | 2 | plugin contract、类型扩展、Options API map helpers |
| Boundaries | 0 | 1 | 24 internal 类型、`piniaSymbol` 与 deprecated `mapGetters` 的观察账本 |
| **稳定合计** | **41** | **9** | `17 detail + 17 merged + 7 quick` |

Reference Overview 完成度只用前三组 41 项计算。Boundaries 显示
`watchlist 26`，不得进入 `availableCount/total`；其中 `piniaSymbol` 与 `mapGetters` 可在相关稳定页
保留警告锚点，24 个 internal 类型集中在唯一 watchlist 页，不机械创建 24 页。

### 9 个稳定详情目标

下面的显式 HTML anchor 是矩阵 planned target 的落点定义。未来 entry 的正文 heading anchor 必须
与矩阵末段完全一致；本节 anchor 只供 RA0 文档内跳转，不表示内容已经 available。

<a id="target-pra1-pinia-instance"></a>

#### PRA1 `vue.pinia.reference.core.pinia-instance`（稳定 5 + internal 1）

承载 `Pinia`、`createPinia`、`disposePinia`、`getActivePinia`、`setActivePinia`，并以 quick 警告
登记 `piniaSymbol`。正文同时逐项覆盖 `Pinia` 的 3 个公开成员和 5 个 internal 字段。

<a id="target-pra1-define-store"></a>

#### PRA1 `vue.pinia.reference.stores.define-store`（6）

承载 `defineStore`、`DefineStoreOptions`、`DefineSetupStoreOptions`、`DefineStoreOptionsBase`、
`StoreDefinition`、`SetupStoreDefinition`，对照 Options/Setup overload 与实例化时机。

<a id="target-pra1-store-shape"></a>

#### PRA1 `vue.pinia.reference.stores.store-shape`（7）

承载 `StateTree`、`Store`、`StoreGeneric`、`StoreActions`、`StoreGetters`、`StoreState`、
`StoreProperties`；成员 surface 与 internal 字段按上一节冻结，不把成员另计为根入口。

<a id="target-pra1-store-to-refs"></a>

#### PRA1 `vue.pinia.reference.stores.store-to-refs`（1）

承载 `storeToRefs`，区分 state/getters/plugin-added state 与被忽略的 actions、非响应式属性；不把
未导出的 `StoreToRefs`、`_ToStateRefs`、`_ToComputedRefs` 提升为索引项。

<a id="target-pra2-subscriptions"></a>

#### PRA2 `vue.pinia.reference.observation.subscriptions`（8）

承载 `MutationType`、`SubscriptionCallback`、`SubscriptionCallbackMutation`、三种 mutation
variant、`StoreOnActionListener`、`StoreOnActionListenerContext`。正文区分 direct/patch object/
patch function、flush 行为、detached 生命周期，以及 action 的 `after/onError` 通道。

<a id="target-pra2-hydration"></a>

#### PRA2 `vue.pinia.reference.runtime.hydration`（2）

承载 `skipHydrate`、`shouldHydrate`，并关联 Options Store 的 `hydrate()` 成员、SSR 序列化顺序和
Setup Store 限定，不延伸为 Nuxt 专用教程。

<a id="target-pra2-hmr"></a>

#### PRA2 `vue.pinia.reference.runtime.hmr`（1）

承载 `acceptHMRUpdate`；显式记录 Vite/production 边界与固定测试中两个 `it.todo`，不承诺其他 bundler
或未验证的订阅保持行为。

<a id="target-pra3-plugin-contracts"></a>

#### PRA3 `vue.pinia.reference.plugins.plugin-contracts`（5）

承载 `PiniaPlugin`、`PiniaPluginContext`、`DefineStoreOptionsInPlugin`、`PiniaCustomProperties`、
`PiniaCustomStateProperties`，覆盖安装顺序、state 双写、类型扩展与清理责任。

<a id="target-pra3-map-helpers"></a>

#### PRA3 `vue.pinia.reference.options-api.map-helpers`（稳定 6 + deprecated 1）

承载 `mapState`、`mapWritableState`、`mapActions`、`mapStores`、`setMapStoreSuffix`、
`MapStoresCustomization`；以 quick 警告登记 `mapGetters` 并只给出 `mapState()` 替代。

### 不承载稳定项的边界页

<a id="target-pra4-internal-types"></a>

#### PRA4 `vue.pinia.reference.boundaries.internal-types`（稳定 0，watchlist 24）

集中承载官网仍列出的 3 个 internal interface 与 21 个 internal type alias。每项保留名称、固定源码
说明、所在 public signature 和公开替代；不给出鼓励应用代码 import 的示例。该页与相关页中的
`piniaSymbol`/`mapGetters` 两个警告共同闭合 26 项 restricted 集合，但不改变 `41/41`。

## 详情页与结构化索引模板

### 结构化索引契约

沿用 Vue Router 已建立的 `ReferenceSourceTag` 与 `ReferenceIndexItemManifest`，不修改共享 schema。
当前 `getReferenceOverview()` 对 manifest 的所有 item 无条件计算 `availableCount/total`，因此 Pinia
主 `ReferenceIndexManifest` **只保存稳定 41 项**。26 个 restricted 项保存为独立 readonly tuple，
由相关页警告和 PRA4 watchlist 消费，但不注册进 `referenceIndexes`：

```ts
export type PiniaRestrictedReferenceItemDefinition = readonly [
  id: string,
  name: string,
  sourceTag: 'internal' | 'deprecated',
  officialUrl: string | undefined,
  entryId: string,
  anchor: string,
  coverage: 'planned' | 'documented',
]
```

Pinia stable section helper 要求 41 项全部显式传入 `sourceTag`、`depth`、`entryId` 和 `anchor`；
restricted tuple 要求 26 项显式传入 sourceTag 和边界目标。两份 tuple 的联合必须与本文 67 项矩阵
逐名相等、交集为空。这样无需修改 `ReferenceOverview` 或共享计数逻辑，`41` 也不是运行时按标签
临时推导的隐含值。

RA0 文档中的 planned target 不能写进尚未可达的结构化 manifest。planned 项示例：

```ts
{
  id: 'functions.createpinia',
  name: 'createPinia',
  officialUrl: 'https://pinia.vuejs.org/api/pinia/functions/createPinia.html',
  sourceTag: 'public',
  depth: 'detail',
  status: 'planned',
  // planned 时不写 target，避免总览产生伪链接
}
```

只有同批 entry 与真实 heading 已存在后才可原子切换：

```ts
{
  id: 'functions.createpinia',
  name: 'createPinia',
  officialUrl: 'https://pinia.vuejs.org/api/pinia/functions/createPinia.html',
  sourceTag: 'public',
  depth: 'detail',
  status: 'available',
  target: {
    entryId: 'vue.pinia.reference.core.pinia-instance',
    anchor: 'create-pinia',
  },
}
```

### Reference entry 模板

保持现有 `ReferenceMeta`/`ReferenceEntry`，不新增 Pinia 专用正文 schema。每个文件复用
`defineReferenceMeta()` 和 `defineReference()`：

```ts
/** Pinia 参考：创建与持有实例；固定版本与一手来源见 meta。 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'vue.pinia.reference.core.pinia-instance',
  type: 'reference',
  title: 'Pinia 实例与应用所有权',
  summary: '创建、安装、取得和释放 Pinia 实例。',
  ecosystem: 'vue',
  module: 'pinia',
  collection: 'core',
  related: [],
  tags: ['Pinia', 'createPinia', 'active pinia'],
  sources: [
    {
      title: 'Pinia API: createPinia',
      url: 'https://pinia.vuejs.org/api/pinia/functions/createPinia.html',
    },
    {
      title: 'Pinia v4.0.2 createPinia source',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/createPinia.ts',
    },
  ],
  appliesTo: 'Pinia 4.0.2',
  verifiedAt: '2026-08-04',
  anchors: ['概述', 'Create Pinia', 'Pinia Interface', '易错使用提示', '源码边界'],
})

export default defineReference({
  meta,
  signature: 'declare function createPinia(): Pinia',
  blocks: [
    { type: 'heading', content: '概述' },
    // signature、参数/返回值、最小示例、关系与版本边界
    { type: 'heading', content: '易错使用提示' },
    // 紧随一个已有结构的 pitfalls block
    { type: 'heading', content: '源码边界' },
  ],
})
```

示例中的 `Create Pinia` 经现有 `headingId()` 生成 `create-pinia`，必须与 target 一致。每个方法
定义上方继续使用规范中文注释；Reference 默认不创建 Demo，只有静态示例确实无法解释且用户另行
批准时才评估独立 Demo。

### 三档内容深度

| depth | 必须内容 | 明确不做 |
| --- | --- | --- |
| `detail` | 独立 heading、完整签名、参数/返回值、典型用法、易错项、固定源码与测试推导 | 不复制整个 Guide，不为 overload 建独立页 |
| `merged` | 独立 heading、签名/值域、与同族 API 的差异、最小示例或类型示例 | 不只在段落里顺带提名 |
| `quick` | 独立 heading、用途/限制；restricted 项必须含 sourceTag 警告与公开替代 | 不提供鼓励应用层依赖 internal/deprecated 的示例 |

所有稳定页面都必须有非空 `signature`、`易错使用提示` heading 和结构化 pitfalls block，以满足当前
Reference 模板 gate。sourceTag 以固定声明和说明文本为准，不从下划线命名或官网是否生成页面猜测。

## PRA1-PRA4 实施批次

### PRA1：Core & Stores（19）

新增完整 41 项稳定 index 的 planned 骨架、26 项独立 restricted tuple、Pinia Reference track 和
4 个稳定详情页，将本批 19 项与真实 target 同批切为 `available`。`piniaSymbol` 只作为实例页
restricted quick 警告；24 个 internal 类型和 `mapGetters` 在 restricted tuple 中保持 planned，
不得进入 `referenceIndexes`。

最多新增 1 个 focused catalog spec，机械断言 `19 available / 22 planned stable / 41 total stable`、
`26 restricted` 不进入完成度、4 页 target anchor 真实唯一。总览直接复用 Router 已实现的
sourceTag 展示，不修改 UI。完成后停止，不进入 subscriptions/hydration/HMR。

### PRA2：Observation & Runtime（11）

新增 3 个稳定详情页，将 11 项切为 `available`。focused spec 累计断言
`30 available / 11 planned / 41 stable`，并断言 mutation variants、action listener、hydration 与
HMR target 逐项唯一。不得修改 PRA1 正文，不创建 SSR/HMR Demo，不把两个 HMR `it.todo` 写成 green。

### PRA3：Plugins & Options API（11）

新增 2 个稳定详情页，将最后 11 个稳定项切为 `available`，并在 map helpers 页登记 deprecated
`mapGetters`。focused spec 断言 `41 available / 0 planned / 41 stable`、9 个稳定详情目标全部可达、
restricted 不进入分母。不得引入 `@pinia/testing`、`@pinia/nuxt` 或持久化插件依赖。

### PRA4：Restricted watchlist（稳定项 0）

新增唯一 internal types watchlist 页并接通 24 项；连同 PRA1 的 `piniaSymbol` 和 PRA3 的
`mapGetters`，机械闭合 `25 internal + 1 deprecated`。该页不加入稳定 index，不改变 `41 / 41`，
不创建 Demo，不 import restricted symbol。最多新增 1 个计数 spec；完成后停止，不进入 Pinia 课程、
React、后端或下一生态。

## 每批统一 Gate 与停止边界

1. 开始前记录 `git status --short`，复算 Pinia manifest、lockfile 和 `dist/pinia.d.ts` SHA；若任一
   冻结输入变化，先重做差异审计，不能直接沿用本矩阵。
2. 每批只修改该批明确列出的 index/track/entry/spec 文件；保护其他 staged、unstaged、untracked
   资产，不格式化全仓、不清理用户工作区。
3. 先运行该批唯一 focused spec，例如
   `npm test -- src/content/catalog/vue-pinia-reference-praN.spec.ts`。已有断言能覆盖时不新增测试。
4. 再运行 `npm run type-check`、`npm run lint`、`npm run format:check`，并对本批全部文件（包括
   untracked 新文件）运行 `npx prettier --check <本批文件>`；tracked diff 运行
   `git diff --check -- <本批 tracked 文件>`，untracked 文件逐个运行
   `git diff --no-index --check /dev/null <文件>` 并只忽略“存在内容差异”的退出码 1，不忽略
   whitespace error。失败必须按本批改动或既有故障精确归因，不能把 focused green 写成整体 green。
5. 只有 PRA1 确实新增 Pinia 总览交互或 UI 时，才形成一条 Playwright 可复跑证据，覆盖稳定计数、
   `26 restricted` 未进入总览计数、planned 禁用、available anchor、键盘筛选和 390px；
   restricted 警告只在相关详情页或 watchlist 验证。若完全复用已验证 Router 总览组件，则只做
   最小受影响路径，不重复创建 E2E。
6. PRA1 首次接入 Pinia Reference 和 PRA4 最终闭合运行 `npm run build`；中间纯内容批次不机械重复
   build，除非类型/registry 变化需要扩大反馈环。
7. 每批报告实际文件、stable/restricted 计数、focused/global gate 后停止。不得自动进入下一批，
   不得提交代码。

RA0 的停止条件是本文形成机械闭合且格式/whitespace 验证通过。本文不授权执行上述任一批次；
PRA1 必须由用户另行明确开始。

## 一手来源清单

### 发布与入口

- [GitHub release `v4.0.2`](https://github.com/vuejs/pinia/releases/tag/v4.0.2)
- [固定 commit `ae4e3b2`](https://github.com/vuejs/pinia/commit/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1)
- [`src/index.ts@v4.0.2`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/index.ts)
- [`package.json@v4.0.2`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/package.json)
- [TypeDoc 配置](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/docs/typedoc-markdown.mjs)
- [API Reference 总入口](https://pinia.vuejs.org/api/pinia/)

### 稳定 API 与实现

- [`types.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/types.ts)
- [`rootStore.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/rootStore.ts)
- [`createPinia.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/createPinia.ts)
- [`store.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts)
- [`storeToRefs.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/storeToRefs.ts)
- [`mapHelpers.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/mapHelpers.ts)
- [`hmr.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/hmr.ts)

### Guide、测试与集成边界

- [Plugins Guide](https://pinia.vuejs.org/core-concepts/plugins.html)
- [SSR Guide](https://pinia.vuejs.org/ssr/)
- [HMR Guide](https://pinia.vuejs.org/cookbook/hot-module-replacement.html)
- [Testing Guide](https://pinia.vuejs.org/cookbook/testing.html)
- [`storePlugins.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/storePlugins.spec.ts)
- [`ssr.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/ssr.spec.ts)
- [`hmr.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/hmr.spec.ts)
- [`devtools.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/devtools.spec.ts)
- [`@pinia/testing` source](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/testing/src/testing.ts)
- [`@pinia/testing` tests](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/testing/src/testing.spec.ts)

本地机械证据来自 lockfile 安装的 `node_modules/pinia/package.json`、`dist/pinia.d.ts` 和
`dist/pinia.js`，它们与上方固定 tarball 属于同一 4.0.2 发布物。官网 `/api/pinia/` 是查证时
current，固定 commit、发布声明与测试用于阻止 current-only 内容或旧翻译快照倒灌。
