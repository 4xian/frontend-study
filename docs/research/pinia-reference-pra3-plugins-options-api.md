# Pinia Reference PRA3：Plugins & Options API 官方研究冻结

> 状态：`P0.2 / PRA3 / research-only`
>
> 查证日期：2026-08-05（Asia/Shanghai）
>
> 适用版本：本地与 lockfile 的 `pinia@4.0.2`
>
> 固定 tag commit：[`ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1`](https://github.com/vuejs/pinia/commit/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1)
>
> 本文只冻结 PRA3 的 11 个 stable/public 根入口、2 个 Reference 页面内容契约和未来实施 Gate；
> 不修改 manifest、index、spec、entry、Demo、schema、UI、依赖或实施计划，不进入 PRA4、搜索收口、
> Gate 6 或 React。

## 结论

1. PRA3 精确承载 **11 个 stable/public 根入口**：plugin-contracts 5 项、map-helpers 6 项。
   深度为 **`2 detail + 7 merged + 2 quick`**，全部计入稳定 `41` 分母。
2. `mapGetters` 不是 stable API。它只在 map-helpers 页以 `deprecated` warning 和
   `mapState()` quick replacement 登记，不能进入 stable Overview，也不能计入 PRA3 的 11 项。
3. 当前工作区的 tuple 机械复算为 `30 available / 11 planned / 41 stable total`，全局 depth
   `17 detail / 17 merged / 7 quick`，restricted 为 `25 internal + 1 deprecated = 26`，coverage
   `25 planned + 1 documented`。PRA3 预期原子发布后为 **`41 available / 0 planned / 41 stable total`**，
   global depth 不变；若 mapGetters 本批 documented，restricted coverage 应为 **`24 planned + 2 documented`**。
4. stable 与 restricted 仍必须无交集，并集逐名等于 RA0 冻结的 67 个根入口。PRA3 不创建
   restricted watchlist 页，不 import restricted symbol，不改 shared schema 或总览计数实现。
5. plugin 页面必须冻结 plugin install-before-store、context 四项 identity、返回扩展、state 双写、
   SSR/Devtools 可见性、清理责任与 declaration merging 边界。map 页面必须冻结 Options API 的
   `computed`/`methods` 形状、array/object/function mapper、writable setter、全局 suffix 与
   `mapGetters -> mapState()` 替代。
6. 两页均为静态 Reference：每页无 Demo、无真实 SSR/Devtools client、无真实 Options API SFC、无
   浏览器 runtime 证据。固定 4.0.2 官方源码、声明和官方测试是 upstream evidence；实施 Gate 的
   public catalog seam 只证明本站 Reference 目录与正文。

## 冻结输入、版本与检索状态

### 当前本地冻结值

| 输入 | 当前值 |
| --- | --- |
| Git `HEAD` | `b2396d24738ecfed3b053c6c7199c32210d70509` |
| `vue` | `3.5.40` |
| `vue-router` | `5.2.0` |
| `pinia` | `4.0.2` |
| `package-lock.json` SHA-256 | `6a68e9e91d6b08c740fdcdecdf64951639e7aba78f1acd4d766c7c6f9b1e1c98` |
| `node_modules/pinia/package.json` SHA-256 | `3f582bbd93981c665127629912ba784031d740f2bb1ceb0decc206846e97ace9` |
| `node_modules/pinia/dist/pinia.d.ts` SHA-256 | `e13460b9f39a197d76b64f4b4a14ddc403b4d85e036adb5850b820f7e08e0674` |
| `node_modules/pinia/dist/pinia.js` SHA-256 | `eb83983da65fdbdb6585de805bda8cadc70a9d273444da1bf4811f6e4851ea92` |
| `src/content/catalog/manifests/vue-pinia-track.ts` SHA-256 | `68476b94dff0142f6d8e811406f26b94298007c7a2937dc0732ffba0f3525d9b` |
| `src/content/catalog/manifests/vue-pinia-reference.ts` SHA-256 | `066a33b9138ed5c83e7f09a941719dc75ca4e7620bf0421b9f43a97116b29a95` |
| `src/content/catalog/manifests/vue-pinia-reference-index.ts` SHA-256 | `c50184cf1f3f84825ce838c742c05e375ca37b058aee835ae28b95d108619baf` |
| `src/content/catalog/vue-pinia-reference-pra1.spec.ts` SHA-256 | `a5e372c34d3bd2a95c9ee8e58699dca48638edd2e7f0d9b5c23ff23c167d99d5` |
| RA0 research SHA-256 | `512cd3d0a4347e93d7fba8ae6b9f4c903edfb31ea991ca4d1c1fbbf0446bd61f` |
| PRA1 research SHA-256 | `b1e9f5a513d337f26f79235ce79a302c8d0fe37e038ce2928ba8fbfc3ba81f` |
| PRA2 research SHA-256 | `7abc49982955fd3e46e699f98b8452443156493946dcb273feaa296fae154589` |

PRA3 实施 Gate 0 必须重算上述输入以及目标文件的 preimage。工作区已经有用户 staged、unstaged 和
untracked 资产；实施只能在当前快照上做 surgical edits，不清理、不暂存、不提交、不推送。任何
Pinia 发布输入、RA0/PRA1/PRA2 研究、current reference manifest/index 或 focused spec 变化，都先
做精确差异审计，不能直接沿用本文矩阵。

### Tavily 原样状态与官方回退

本轮按仓库规则先调用 Tavily Search 和 Extract，两个请求均原样返回额度限制：

```text
This request exceeds your plan's set usage limit. Please upgrade your plan or contact support@tavily.com
```

停止重试后没有使用博客、搜索摘要、论坛或其他二手资料。随后直接读取以下官方 primary sources：

- `pinia.vuejs.org` 的 11 个 stable API URL 与 `mapGetters` deprecated URL（HTTP 200）；
- 固定 commit `ae4e3b2` 的 `packages/pinia/src/types.ts`、`rootStore.ts`、`createPinia.ts`、
  `store.ts`、`mapHelpers.ts`；
- 固定 commit 的 `packages/docs/core-concepts/plugins.md` 与
  `packages/docs/cookbook/options-api.md`；
- 固定 commit 的官方 `storePlugins.spec.ts` 与 `mapHelpers.spec.ts`；
- 当前本地 `node_modules/pinia@4.0.2` 的 `dist/pinia.d.ts` 与 `dist/pinia.js`。

当前 API 页面可能带有官网的 v3 导航链接，但 API 名称、签名和 deprecated 文本与固定 4.0.2 声明/源码
分开记录。网络恢复后实施 Gate 0 可以重读这些一手 URL；若 current 页面与固定发布物冲突，必须先
报告，不得静默改写本文。

### 当前 tuple 的结构化复算

使用 TypeScript Compiler API 读取 `vue-pinia-reference-index.ts` 的数组、Set 和 tuple，而不是用
文字命中数猜测：

| 维度 | 当前冻结值 | PRA3 预期 |
| --- | ---: | ---: |
| stable total | 41 | 41 |
| available / planned | 30 / 11 | 41 / 0 |
| stable depth detail / merged / quick | 17 / 17 / 7 | 17 / 17 / 7 |
| PRA3 stable | 11 | 11 |
| PRA3 depth detail / merged / quick | 2 / 7 / 2 | 2 / 7 / 2 |
| plugin-contracts / map-helpers | 5 / 6 | 5 / 6 |
| restricted total | 26 | 26 |
| restricted sourceTag internal / deprecated | 25 / 1 | 25 / 1 |
| restricted coverage planned / documented | 25 / 1 | 24 / 2 |
| stable/restricted intersection | 0 | 0 |
| stable/restricted union | 67 | 67 |

当前 documented 只有 `variables.piniasymbol`，目标 documented 集合为
`variables.piniasymbol` 与 `variables.mapgetters`；后者仍不属于 stable Overview。

## PRA3 精确 11 项 stable 矩阵

以下 11 行全部是 `sourceTag: public`、`stable: yes`。`entryId#anchor` 是唯一发布目标；只有目标
entry 与真实 heading 在同批存在且唯一后，才可从 `planned` 原子切换为 `available`。

| apiId | displayName | officialUrl | depth | entryId | 唯一 anchor |
| --- | --- | --- | --- | --- | --- |
| `interfaces.definestoreoptionsinplugin` | `DefineStoreOptionsInPlugin` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/DefineStoreOptionsInPlugin.html) | `merged` | `vue.pinia.reference.plugins.plugin-contracts` | `define-store-options-in-plugin` |
| `interfaces.piniacustomproperties` | `PiniaCustomProperties` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/PiniaCustomProperties.html) | `merged` | `vue.pinia.reference.plugins.plugin-contracts` | `pinia-custom-properties` |
| `interfaces.piniacustomstateproperties` | `PiniaCustomStateProperties` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/PiniaCustomStateProperties.html) | `merged` | `vue.pinia.reference.plugins.plugin-contracts` | `pinia-custom-state-properties` |
| `interfaces.piniaplugin` | `PiniaPlugin` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/PiniaPlugin.html) | `detail` | `vue.pinia.reference.plugins.plugin-contracts` | `pinia-plugin` |
| `interfaces.piniaplugincontext` | `PiniaPluginContext` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/PiniaPluginContext.html) | `merged` | `vue.pinia.reference.plugins.plugin-contracts` | `pinia-plugin-context` |
| `interfaces.mapstorescustomization` | `MapStoresCustomization` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/MapStoresCustomization.html) | `quick` | `vue.pinia.reference.options-api.map-helpers` | `map-stores-customization` |
| `functions.mapactions` | `mapActions` | [官方](https://pinia.vuejs.org/api/pinia/functions/mapActions.html) | `merged` | `vue.pinia.reference.options-api.map-helpers` | `map-actions` |
| `functions.mapstate` | `mapState` | [官方](https://pinia.vuejs.org/api/pinia/functions/mapState.html) | `detail` | `vue.pinia.reference.options-api.map-helpers` | `map-state` |
| `functions.mapstores` | `mapStores` | [官方](https://pinia.vuejs.org/api/pinia/functions/mapStores.html) | `merged` | `vue.pinia.reference.options-api.map-helpers` | `map-stores` |
| `functions.mapwritablestate` | `mapWritableState` | [官方](https://pinia.vuejs.org/api/pinia/functions/mapWritableState.html) | `merged` | `vue.pinia.reference.options-api.map-helpers` | `map-writable-state` |
| `functions.setmapstoresuffix` | `setMapStoreSuffix` | [官方](https://pinia.vuejs.org/api/pinia/functions/setMapStoreSuffix.html) | `quick` | `vue.pinia.reference.options-api.map-helpers` | `set-map-store-suffix` |

机械断言必须得到：

| 维度 | 结果 |
| --- | ---: |
| PRA3 stable | 11 |
| `detail / merged / quick` | `2 / 7 / 2` |
| 页面分布：plugin-contracts / map-helpers | `5 / 6` |
| 发布后 `available / planned / total` | `41 / 0 / 41` |
| 全局 `detail / merged / quick` | `17 / 17 / 7` |
| restricted | `26`，不进入 Overview |
| 每项 target 命中且同页 anchor 唯一 | 11 |

### Restricted mapGetters 账本

`variables.mapgetters` 的固定源码是 `export const mapGetters = mapState`，JSDoc 与官网页面都标记
`@deprecated use mapState() instead.`。本批只在 map-helpers 页创建一个 quick warning heading
`Deprecated Map Getters`（anchor `deprecated-map-getters`），正文只给出等价替换和迁移原因：

```ts
// restricted warning 中允许的 replacement
mapState(useStore, keysOrMapper)
```

它必须保留 `sourceTag: deprecated`、官方 URL、coverage `documented`，不加入 41 项 stable definitions、
`availableStableIds`、Overview 计数或 stable/depth 统计。

## 两页统一 Reference 合同

两个文件都必须复用现有 `defineReferenceMeta()` 与 `defineReference()`，不新增 Pinia 专用 schema。

- `signature.trim().length > 0`；merged heading 也必须给出声明或 overload，不用 prose 代替签名。
- `meta.anchors` 与正文 heading content 同源、顺序一致，`headingId()` 页内唯一。
- 每页恰有一个 `易错使用提示` heading 和一个 `源码推导与适用场景` heading；紧随后者必须是
  `steps` block，条目标题用 `1.`、`2.` 等编号。
- 每页 pitfalls 精确 10 个；每项同时写错误用法/可观察后果/公开替代，不能把 internal 类型或
  `_customProperties` 之外的 internal 字段包装成推荐 API。
- `meta.sources` 必须原样包含本页所有 stable API URL，以及至少一个固定 commit 源码 URL；官方
  test URL 只支撑其真实覆盖，不能把上游测试当作本项目 Demo evidence。
- `related` 只能连接现有 public catalog entry 或同批另一页，不能指向尚未创建的 PRA4 watchlist。
- 不加入 `demo` block，不新增 `src/content/demos/vue/pinia/` 文件，不引入 `@pinia/testing`、
  `@pinia/nuxt`、持久化插件或其他依赖。
- 新 `.ts` 文件必须有中文顶层注释和规范中文自定义方法注释；每文件不超过约 1000 行。不写 CSS，
  不引入 `grid` 或 `gap`。

## 页面 1：Plugin Contracts

### 元数据、文件与 headings

| 字段 | 冻结值 |
| --- | --- |
| 文件 | `src/content/entries/reference/vue/pinia/plugins/plugin-contracts.ts` |
| `meta.id` | `vue.pinia.reference.plugins.plugin-contracts` |
| `meta.type` | `reference` |
| `meta.title` | `Pinia 插件与类型扩展契约` |
| `meta.summary` | `查询 Pinia plugin 的安装时序、context、返回扩展、state 双写与类型扩展边界` |
| `meta.ecosystem / module` | `vue / pinia` |
| `meta.collection` | `plugins` |
| `meta.appliesTo` | `Pinia 4.0.2` |
| `meta.verifiedAt` | `2026-08-05` |
| pitfalls 数 | 10 |
| Demo | 0 |
| `tags` | `['Pinia', 'PiniaPlugin', 'plugin context', 'declaration merging', '$state', 'SSR']` |

`related` 按以下顺序冻结：

1. `vue.pinia.reference.core.pinia-instance`
2. `vue.pinia.reference.stores.define-store`
3. `vue.pinia.reference.stores.store-to-refs`
4. `vue.pinia.learn.advanced.plugins-persistence`
5. `vue.pinia.learn.advanced.store-testing`

`meta.anchors` 与正文 headings 按以下顺序冻结：

1. `概述`
2. `Pinia Plugin`
3. `Pinia Plugin Context`
4. `Define Store Options In Plugin`
5. `Pinia Custom Properties`
6. `Pinia Custom State Properties`
7. `安装时序与 Context Identity`
8. `返回扩展与 Devtools 可见性`
9. `State 双写、SSR 与 Hydration`
10. `TypeScript Declaration Merging`
11. `清理责任与 Evidence 边界`
12. `易错使用提示`
13. `源码推导与适用场景`

5 个 stable target 必须依次命中 `pinia-plugin`、`pinia-plugin-context`、
`define-store-options-in-plugin`、`pinia-custom-properties`、`pinia-custom-state-properties`；页面还
不得出现 `internal-pinia-symbol`；该 restricted warning 继续只由 PRA1 的 Pinia 实例页承载。

### 非空 signature

```ts
interface PiniaCustomProperties<
  Id extends string = string,
  S extends StateTree = StateTree,
  G = _GettersTree<S>,
  A = _ActionsTree,
> {}

interface PiniaCustomStateProperties<S extends StateTree = StateTree> {}

interface DefineStoreOptionsInPlugin<
  Id extends string,
  S extends StateTree,
  G,
  A,
> extends Omit<DefineStoreOptions<Id, S, G, A>, 'id' | 'actions'> {
  actions: A
}

interface PiniaPluginContext<
  Id extends string = string,
  S extends StateTree = StateTree,
  G = _GettersTree<S>,
  A = _ActionsTree,
> {
  pinia: Pinia
  app: App
  store: Store<Id, S, G, A>
  options: DefineStoreOptionsInPlugin<Id, S, G, A>
}

interface PiniaPlugin {
  (
    context: PiniaPluginContext,
  ): Partial<PiniaCustomProperties & PiniaCustomStateProperties> | void
}
```

`_GettersTree`、`_ActionsTree` 等下划线 helper 只还原公开声明的约束关系，不因此成为 stable API；
正文不提供应用层 import 示例。`DefineStoreOptionsInPlugin` 是 plugin 读取到的已归一化 options，真正
新增 `defineStore()` 选项的 declaration-merging seam 是 `DefineStoreOptionsBase`（该接口属于 PRA1
页面的关联边界），不是把 `DefineStoreOptionsInPlugin` 当成另一份输入配置。

### 必须覆盖的正文事实

1. `pinia.use(plugin)` 登记 Pinia plugin；plugin 接收一个 `PiniaPluginContext`，可以返回 partial
   store extensions，也可以返回 `void`。
2. 官方 Guide 的时序是：plugin 先通过 `pinia.use()` 登记，Pinia 先传给 app（`app.use(pinia)`），
   之后创建的 Store 才应用 plugin。app 安装前登记可以排队，但 app 安装前创建的 Store 不会被事后
   补扩展；已有 Store 也不 retroactive。
3. context 的 `pinia`、`app`、`store` 是当前操作使用的同一对象 identity；`options` 是当前
   `defineStore()` 的 plugin-facing 选项。Options Store 保留定义选项，Setup Store 的 `actions` 是
   `useStore()` 建立时提取的 action map，并始终默认存在。
4. `PiniaPlugin` 返回的 object 会被 assign 到 Store；返回 object 是 Devtools 自动跟踪自定义属性的
   推荐路径。直接写 `store.foo` 时，开发构建如需登记 Devtools custom key 才使用该 specialized
   seam，不读写 `_p/_a/_s` 等 internal registry。
5. plugin 新增 state 必须双写：先把 ref/reactive value 放入 `store.$state`，再以 `toRef(store.$state,
   'key')`（或等价共享引用）连接 `store.key`。只写 Store 会让 `$state`、Devtools state section 和
   SSR 序列化缺字段；只写 `$state` 又不能提供稳定的 Store surface。
6. plugin state 进入 `$state` 才参与 Pinia 的 state serialization/hydration contract；这不等于本项目
   已运行真实 SSR、HTML escaping、Vue hydration 或 Devtools client。plugin 建立阶段的 state change
   发生在 Store active 前，不写成会触发 `$subscribe()` 的业务事件。
7. `PiniaCustomProperties` 负责直接添加到 Store 的属性，拥有 `Id/S/G/A` 四个泛型；
   `PiniaCustomStateProperties` 负责添加到每个 `store.$state` 的 state，只拥有 `S` 泛型。官方
   declaration merging 要求 generic 参数名与源码一致（如 `Id` 不能改名为 `id`）。
8. 类型 augmentation 只是 compile-time contract：声明扩展不会自动创建 runtime property，plugin 仍需
   返回/设置该字段；反过来 runtime 返回字段也不自动补齐 TypeScript 类型。
9. plugin 可以读取 `DefineStoreOptionsInPlugin.actions` 来包装 action；Setup Store 的 action map
   由 Pinia 提取，不能要求用户在 Setup 定义阶段手写该字段。自定义创建选项应扩展
   `DefineStoreOptionsBase<S, Store>`，再由 context.options 读取。
10. plugin 自持有的 storage listener、timer、network observer 等外部副作用不由 Pinia 自动清理；需要
    由 plugin 包装 `$dispose()` 或保存 owner-level stop，并在宿主释放时幂等调用。PRA3 不把 internal
    plugin registry 提升为清理 API。

### 10 个 pitfalls 冻结

1. 在 `app.use(pinia)` 或 `pinia.use(plugin)` 前创建 Store；后果是 Store 没有该 plugin extension；先
   完成 Pinia 安装和 plugin 登记，再创建 Store。
2. 认为后来调用 `pinia.use()` 会 retroactive 扩展已有 Store；后果是旧实例缺字段；销毁并重新取得
   Store 不是通用迁移方案，插件时序应在 bootstrap 冻结。
3. 把“app 安装前可以登记 plugin”误读成“app 安装前创建 Store 也会应用 plugin”；后果是 queue 与
   `_p` 的边界混淆；以 `app.use(pinia)` 后创建 Store 为契约。
4. 把 Setup Store 的 `context.options` 当成用户写出的完整 Options object；后果是遗漏提取的 actions
   或误读 getters/state；按 `DefineStoreOptionsInPlugin` 的 plugin-facing shape 读取。
5. 只写 declaration merging 不写 runtime plugin，或只写 runtime 不做 augmentation；前者运行时缺属性，
   后者 TypeScript 缺属性；保持静态声明与返回/设置实现成对。
6. 改动 `PiniaCustomProperties` 的泛型参数名；后果是 module augmentation 不再匹配声明；保留官方
   `Id/S/G/A` 名称与参数顺序。
7. 直接写 `store.foo` 却期待 Devtools 自动把它登记为自定义属性；后果是 client/dev build 看不到该
   custom key；优先 return extension，确需 direct assignment 时按官方 dev-only 登记说明处理。
8. 只把新 state 写到 `store.foo`；后果是 `$state`、Devtools state section、SSR 序列化与 hydration
   不一致；先初始化 `$state.foo`，再绑定 Store ref。
9. 重新赋予 `store.foo = ref(...)` 却没有和 `$state.foo` 共享 identity，或覆盖已恢复的 `$state`；
   后果是两个访问面分叉、SSR restore 被覆盖；使用存在性保护和 `toRef`。
10. 把 plugin 创建阶段的副作用当成普通 subscription，或丢弃 `$dispose()` wrapper 的 stop；后果是
    监听器泄漏、重建后重复执行；为外部资源定义明确 owner 和幂等 teardown。

### 编号“源码事实 → 结论 → 适用场景”

1. **源码事实**：`createPinia()` 的 `use()` 在没有 `_a` 时把 plugin 放入待安装队列，`install()` 再
   将队列刷入 `_p`；**结论**：app 安装前可以登记但只有安装后创建的 Store 才稳定获得 plugin；**适用场景**：
   应用 bootstrap、测试 fixture 和多 app 初始化顺序。
2. **源码事实**：Store 创建阶段遍历 `pinia._p`，对每个 extender 传入同一个 `pinia`、`pinia._a`、
   当前 `store` 与 `optionsForPlugin`；**结论**：context identity 是当前实例级别，不是复制快照；**适用场景**：
   插件按 app/store 分支、读取当前 definition options。
3. **源码事实**：`optionsForPlugin` 先以 `{ actions: {} }` 初始化，Setup Store 扫描返回函数后再写入
   `optionsForPlugin.actions`；**结论**：plugin 可用统一 `actions` 入口处理 Options 与 Setup Store，但
   两者来源不同；**适用场景**：action wrapping/debounce 这类 plugin contract。
4. **源码事实**：extensions 在 store scope 中运行并随后 `assign(store, extensions)`，开发 Devtools
   会遍历返回 key 加入 custom property 集合；**结论**：返回 object 同时提供 runtime surface 与可追踪
   custom keys；**适用场景**：router/toast/metadata 等 plugin-added property。
5. **源码事实**：固定 Guide 的 state 示例先保护 `store.$state`，再用 `toRef` 连接 `store`；**结论**：
   双写是一份响应式 state 的两个访问面，不是两份独立 state；**适用场景**：SSR restore、Devtools state
   可见性和插件持久化。
6. **源码事实**：固定 `PiniaPlugin` 返回类型是 `Partial<PiniaCustomProperties & PiniaCustomStateProperties> | void`，
   两个 custom interface 默认为空；**结论**：类型扩展是 declaration merging 与 runtime 返回值的组合契约；**适用场景**：
   为 plugin property 建立 compile-time API，不扩大 stable root exports。
7. **源码事实**：官方测试分别断言 Options `context.options` 等于 options、Setup `context.options.actions`
   含提取函数，并验证同一 plugin 多次 install 只执行一次；**结论**：context shape 与 lifecycle 有可复现
   upstream seam；**适用场景**：实施后的 focused public catalog 与文档审计，不冒充应用 runtime 证据。
8. **源码事实**：官方 Guide 明确只有 returned properties 自动进入 Devtools 追踪，直接添加 state 还需
   `$state`；**结论**：Devtools/SSR 可见性是 contract 条件，不是所有 plugin fields 的默认保证；**适用场景**：
   设计持久化或可观测插件时区分 Store property、custom property 和 state property。

### 一手 sources（精确 title/URL）

| title | url |
| --- | --- |
| `Pinia API：DefineStoreOptionsInPlugin` | `https://pinia.vuejs.org/api/pinia/interfaces/DefineStoreOptionsInPlugin.html` |
| `Pinia API：PiniaCustomProperties` | `https://pinia.vuejs.org/api/pinia/interfaces/PiniaCustomProperties.html` |
| `Pinia API：PiniaCustomStateProperties` | `https://pinia.vuejs.org/api/pinia/interfaces/PiniaCustomStateProperties.html` |
| `Pinia API：PiniaPlugin` | `https://pinia.vuejs.org/api/pinia/interfaces/PiniaPlugin.html` |
| `Pinia API：PiniaPluginContext` | `https://pinia.vuejs.org/api/pinia/interfaces/PiniaPluginContext.html` |
| `Pinia Guide：Plugins` | `https://pinia.vuejs.org/core-concepts/plugins.html` |
| `Pinia 4.0.2：types.ts 固定源码` | `https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/types.ts` |
| `Pinia 4.0.2：rootStore.ts 固定源码` | `https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/rootStore.ts` |
| `Pinia 4.0.2：createPinia.ts 固定源码` | `https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/createPinia.ts` |
| `Pinia 4.0.2：store.ts 固定源码` | `https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts` |
| `Pinia 4.0.2：storePlugins 官方测试` | `https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/storePlugins.spec.ts` |

## 页面 2：Options API Map Helpers

### 元数据、文件与 headings

| 字段 | 冻结值 |
| --- | --- |
| 文件 | `src/content/entries/reference/vue/pinia/options-api/map-helpers.ts` |
| `meta.id` | `vue.pinia.reference.options-api.map-helpers` |
| `meta.type` | `reference` |
| `meta.title` | `Options API 映射 Helpers` |
| `meta.summary` | `查询 mapStores、state/action 映射、可写 setter、suffix 与迁移边界` |
| `meta.ecosystem / module` | `vue / pinia` |
| `meta.collection` | `options-api` |
| `meta.appliesTo` | `Pinia 4.0.2` |
| `meta.verifiedAt` | `2026-08-05` |
| pitfalls 数 | 10 |
| Demo | 0 |
| `tags` | `['Pinia', 'Options API', 'mapState', 'mapWritableState', 'mapActions', 'mapStores', 'mapGetters']` |

`related` 按以下顺序冻结：

1. `vue.pinia.reference.core.pinia-instance`
2. `vue.pinia.reference.stores.define-store`
3. `vue.pinia.reference.stores.store-shape`
4. `vue.pinia.reference.stores.store-to-refs`
5. `vue.pinia.learn.basics.setup-first-store`

`meta.anchors` 与正文 headings 按以下顺序冻结：

1. `概述`
2. `Map State`
3. `Map Writable State`
4. `Map Actions`
5. `Map Stores`
6. `Set Map Store Suffix`
7. `Map Stores Customization`
8. `Options API 形状与 Mapper`
9. `Deprecated Map Getters`
10. `全局 Suffix 与类型同步`
11. `Evidence 边界`
12. `易错使用提示`
13. `源码推导与适用场景`

6 个 stable target 必须命中 `map-state`、`map-writable-state`、`map-actions`、`map-stores`、
`set-map-store-suffix`、`map-stores-customization`；restricted warning 必须唯一命中
`deprecated-map-getters`，且只在本页出现。

### 非空 signature

```ts
interface MapStoresCustomization {}

declare function mapState<
  Id extends string,
  S extends StateTree,
  G extends _GettersTree<S> | Record<string, ComputedRef>,
  A,
  KeyMapper extends Record<
    string,
    keyof S | keyof G | ((store: Store<Id, S, G, A>) => any)
  >,
>(
  useStore: StoreDefinition<Id, S, G, A>,
  keyMapper: KeyMapper,
): _MapStateObjectReturn<Id, S, G, A, KeyMapper>

declare function mapState<
  Id extends string,
  S extends StateTree,
  G extends _GettersTree<S> | Record<string, ComputedRef>,
  A,
  Keys extends keyof S | keyof G,
>(useStore: StoreDefinition<Id, S, G, A>, keys: readonly Keys[]): _MapStateReturn<S, G, Keys>

declare function mapWritableState<
  Id extends string,
  S extends StateTree,
  G,
  A,
  KeyMapper extends Record<string, _MapWritableStateKeys<S, G>>,
>(
  useStore: StoreDefinition<Id, S, G, A>,
  keyMapper: KeyMapper,
): _MapWritableStateObjectReturn<S, G, KeyMapper>

declare function mapWritableState<
  Id extends string,
  S extends StateTree,
  G,
  A,
  Keys extends _MapWritableStateKeys<S, G>,
>(
  useStore: StoreDefinition<Id, S, G, A>,
  keys: readonly Keys[],
): Pick<_MapWritableStateReturn<S, G, Keys>, Keys>

declare function mapActions<
  Id extends string,
  S extends StateTree,
  G extends _GettersTree<S>,
  A,
  KeyMapper extends Record<string, keyof A>,
>(useStore: StoreDefinition<Id, S, G, A>, keyMapper: KeyMapper): _MapActionsObjectReturn<A, KeyMapper>

declare function mapActions<
  Id extends string,
  S extends StateTree,
  G extends _GettersTree<S>,
  A,
>(useStore: StoreDefinition<Id, S, G, A>, keys: Array<keyof A>): _MapActionsReturn<A>

declare function mapStores<Stores extends any[]>(...stores: [...Stores]): _Spread<Stores>

declare function setMapStoreSuffix(
  suffix: MapStoresCustomization extends Record<'suffix', infer Suffix> ? Suffix : string,
): void

/** @deprecated use mapState() instead. */
declare const mapGetters: typeof mapState
```

下划线 return/constraint 类型只还原发布声明，不成为推荐 import。固定 4.0.2 的
`_MapWritableStateKeys<S, G>` 包含 `keyof UnwrapRef<S>` 与 writable getter keys；因此正文必须区分
“readonly getter 不可写”与“Setup/Options 的 writable computed 有可写 setter”。源码 JSDoc 中“only
state properties”是过窄的说明，官方 `mapHelpers.spec.ts` 已验证 Setup Store `textUpper` writable
computed 的 setter。

### 必须覆盖的正文事实

1. `mapState()` 与 `mapWritableState()` 返回可 spread 到 Options API `computed` 的对象；
   `mapActions()` 返回可 spread 到 `methods` 的对象；`mapStores()` 返回按 store id 生成的 computed
   getter 对象。
2. 所有 generated function 都通过 `useStore(this.$pinia)` 取得当前组件所属 Pinia，不捕获某个 app 的
   active singleton；Options API 组件必须让 `$pinia` 由 `app.use(pinia)` 提供。
3. `mapState(useStore, keys)` 接收 state/getter key array，保留原 key 名；object mapper 可把结果名映射
   到 key，也可传 `(store) => any` 函数。函数 mapper 以组件 `this` 调用，`this` 在 TypeScript 中不被
   自动类型化；需要访问组件字段时使用普通 method shorthand，不用 arrow 期待 `this`。
4. `mapActions()` array 直接映射 action 名，object mapper 把组件 method 名映射到 action 名并透传
   arguments/return value；它不接受 `mapState` 那种自定义 `(store) => any` function mapper。
5. `mapWritableState()` 生成 `{ get, set }` computed descriptors。setter 直接赋值到 Store property，
   不自动转成 action、不提供 validation/transaction；readonly getter 不能写，state 与 writable computed
   才可写。官方测试覆盖 array、object alias 和 Setup writable computed。
6. `mapStores(useUserStore, useCartStore)` 需要逐个传 Store definition，默认生成 `userStore`、
   `cartStore`；把 array 作为唯一参数不是官方形状，dev build 会发出诊断 warning。
7. `setMapStoreSuffix(suffix)` 修改 mapHelpers 模块级 suffix，默认值为 `Store`，允许空字符串；它影响
   后续 `mapStores()` 生成的 key，已经生成的 mapping object 不会被重命名，且同一模块内所有 app 共用该
   配置。
8. TypeScript 中扩展 `MapStoresCustomization` 的 `suffix` 必须与 runtime `setMapStoreSuffix()` 一致；
   declaration merging 只影响类型推导，不能改变 runtime key。global `.d.ts` 需先 `import 'pinia'`。
9. `MapStoresCustomization` 空 interface 的稳定用途是 declaration merging，不是让应用读取/写入内部
   suffix variable；`mapStoreSuffix`、`_Spread` 等 internal helper 不进入稳定索引。
10. `mapGetters` 与 `mapState` 是同一 runtime value 的 alias，当前官方 API/Guide 标记 deprecated，
    迁移只需把 import/call 名替换为 `mapState()`；本批 warning 可定位但不进 stable Overview。

### 10 个 pitfalls 冻结

1. 把 `mapState()` spread 到 `methods` 或把 `mapActions()` spread 到 `computed`；后果是组件选项类型和
   getter/method 语义错误；state/getters 放 `computed`，actions 放 `methods`。
2. 使用 `mapStores([useUserStore, useCartStore])` 作为官方形状；后果是 dev warning 与不稳定的 array
   fallback；逐个传入 Store definition。
3. 在 `mapState` function mapper 里使用 arrow 并期待组件 `this`；后果是 `this` 不指向组件；需要
   组件上下文时写 method shorthand，并把 store 作为第一个参数。
4. 把 `mapActions` object mapper 当成 function mapper；后果是把函数误当 action key；object 只接受
   `组件方法名 -> action 名`。
5. 对 `mapWritableState` 映射 readonly getter；后果是 setter 不存在或类型错误；只映射 state 或
   writable computed。
6. 认为 writable setter 会调用 action、产出 patch 事件或执行业务校验；后果是绕过 domain action；
   需要校验/事务时显式调用 action，不依赖 setter 的直接赋值。
7. 在生成 mapping 后调用 `setMapStoreSuffix()`，再期待已存在的 `userStore` key 自动改名；后果是
   computed object 仍保留旧 key；先在 bootstrap 设置 suffix，再生成 mappings。
8. 只改 TypeScript `MapStoresCustomization` augmentation，不改 runtime suffix，或反过来只改 runtime；
   后果是类型与运行时 key 分叉；两处使用同一 literal suffix。
9. 在不同 app、请求或组件之间动态切换 module-global suffix；后果是同一模块的 mapping key 随调用顺序
   变化；把 suffix 当应用启动配置，不能当 per-component state。
10. 继续导入 `mapGetters` 并把它当推荐 API；后果是保留 deprecated surface；使用同样参数调用
    `mapState()`，并在迁移账本中保留 warning 而不是 stable item。

### 编号“源码事实 → 结论 → 适用场景”

1. **源码事实**：`mapState` array/object 分支返回 computed getter function，并在执行时调用
   `useStore(this.$pinia)`；**结论**：它必须放到 Options API `computed`，且读取组件注入的 Pinia；**适用场景**：
   Vue 组件从 Options Store 读取 state/getter。
2. **源码事实**：object mapper 的值可以是 store key 或 function，function 以 `call(this, store)` 执行；
   **结论**：可建立别名/派生值并访问 Options 组件 `this`，但 function mapper 的 `this` 需要 method shorthand；
   **适用场景**：组件局部格式化或基于 store 与本地字段的 computed。
3. **源码事实**：`mapActions` array/object 分支生成 method wrapper，并以 `...args` 调用 Store action；
   **结论**：参数和 return value 保持 action contract，object 只做命名映射；**适用场景**：Options API methods
   过渡层，不把业务逻辑复制到组件。
4. **源码事实**：`mapWritableState` 生成 `{ get, set }`，setter 直接给当前 Store key 赋值；固定测试还
   覆盖 Setup writable computed；**结论**：可写映射是 computed setter，不是 action proxy；**适用场景**：简单
   表单双向绑定，复杂校验仍走 action。
5. **源码事实**：`mapStores` 用 `$id + mapStoreSuffix` 立即生成 getter key，getter 通过 `this.$pinia`
   取得 Store；**结论**：传参是 rest Store definitions，key 在 helper 调用时冻结；**适用场景**：Options API
   需要整个 Store surface 的组件。
6. **源码事实**：`mapStoreSuffix` 是 mapHelpers 模块级 `let`，`setMapStoreSuffix()` 直接赋值；**结论**：
   suffix 是进程/模块范围配置，后续 helper 调用生效，既有 object 不重命名；**适用场景**：应用 bootstrap 和
   TypeScript augmentation 的单点配置。
7. **源码事实**：`MapStoresCustomization` 空 interface 通过 conditional type 参与 key 推导，runtime 不读取
   declaration；**结论**：augmentation 只改变编译期 key，必须与 runtime literal 对齐；**适用场景**：
   global.d.ts 维护 suffix 类型。
8. **源码事实**：固定源码 `mapGetters = mapState`，官方测试断言两者 identity，官网页面给出 deprecated
   replacement；**结论**：替换是无行为变化的名称迁移，restricted coverage 可以 documented 但 stable
   分母不变；**适用场景**：Options API 旧代码迁移。

### 一手 sources（精确 title/URL）

| title | url |
| --- | --- |
| `Pinia API：MapStoresCustomization` | `https://pinia.vuejs.org/api/pinia/interfaces/MapStoresCustomization.html` |
| `Pinia API：mapActions` | `https://pinia.vuejs.org/api/pinia/functions/mapActions.html` |
| `Pinia API：mapState` | `https://pinia.vuejs.org/api/pinia/functions/mapState.html` |
| `Pinia API：mapStores` | `https://pinia.vuejs.org/api/pinia/functions/mapStores.html` |
| `Pinia API：mapWritableState` | `https://pinia.vuejs.org/api/pinia/functions/mapWritableState.html` |
| `Pinia API：setMapStoreSuffix` | `https://pinia.vuejs.org/api/pinia/functions/setMapStoreSuffix.html` |
| `Pinia API：mapGetters（deprecated）` | `https://pinia.vuejs.org/api/pinia/variables/mapGetters.html` |
| `Pinia Guide：Usage without setup()` | `https://pinia.vuejs.org/cookbook/options-api.html` |
| `Pinia Guide：State Usage with the Options API` | `https://pinia.vuejs.org/core-concepts/state.html#usage-with-the-options-api` |
| `Pinia 4.0.2：mapHelpers.ts 固定源码` | `https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/mapHelpers.ts` |
| `Pinia 4.0.2：types.ts 固定源码` | `https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/types.ts` |
| `Pinia 4.0.2：mapHelpers 官方测试` | `https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/mapHelpers.spec.ts` |

## PRA3 实施 allowlist

PRA3 只允许以下 **5 个实现文件**；这五个文件未取得最终双轴 `Standards PASS / 0 finding` 与
`Spec PASS / 0 finding` 前，除此之外出现任何 diff 都必须停止并先说明原因：

| 动作 | 文件 | 唯一职责 |
| --- | --- | --- |
| 修改 | `src/content/catalog/manifests/vue-pinia-reference.ts` | 新增 `plugins` 与 `options-api` collection，各自登记一个 entryId，保持既有四 collection 顺序不变 |
| 修改 | `src/content/catalog/manifests/vue-pinia-reference-index.ts` | 将本矩阵 11 个 ID 加入 available set；将 `mapGetters` restricted coverage 从 `planned` 改为 `documented`；不改 stable definitions、sourceTag 或 depth |
| 修改 | `src/content/catalog/vue-pinia-reference-pra1.spec.ts` | 扩展同一 public catalog/headingId/readonly restricted tuple seam；不新建 PRA3 spec |
| 新增 | `src/content/entries/reference/vue/pinia/plugins/plugin-contracts.ts` | 页面 1，5 个 stable target 与 plugin contract 正文 |
| 新增 | `src/content/entries/reference/vue/pinia/options-api/map-helpers.ts` | 页面 2，6 个 stable target 与 deprecated mapGetters warning |

明确禁止修改：`src/content/catalog/index.ts`、`tracks.ts`、`vue-pinia-track.ts`、共享 schema/types、
`LearningCatalog.ts`、`ReferenceOverviewPage.vue`、PRA1/PRA2 正文、P01–P05 课程正文/spec、任何
Demo、样式、依赖、配置、RA0/PRA1/PRA2 研究文档、PRA4、搜索收口、Gate 6、React、后端或其他生态。
不创建抽象、依赖或第二个 focused spec；两个 entry 内的 source URL 可以用各自文件内固定 URL 常量，
但不新增共享 helper。

只有上述 5 个实现文件完成全部 Gate 并取得双轴 `PASS / 0 finding` 后，才允许第 6 个文件
`docs/重构实施计划.md` 进入 **closure-only scope**。closure 只能追加 PRA3 的实际计数、命令结果、
文件/SHA、Tavily 状态、evidence 边界和 PRA4 停止线；不得改写其他阶段，不得把 deferred 或未执行
证据写成 green。closure 落盘后，对 6 文件最终 diff 交给同一复审方复核并停止。

## TDD Red / Green 与唯一 public seam

### Red：先扩展现有 focused spec

先只修改 `src/content/catalog/vue-pinia-reference-pra1.spec.ts`，保留现有公开 seam：

- `learningCatalog.getReferenceOverview()`、`getNavigation()`、`loadEntry()`；
- `headingId()`；
- 明确导出的 readonly `piniaRestrictedReferenceItems`。

禁止读取 catalog private map、未导出的 stable definitions、entry default 或通过字符串扫描绕过
catalog。先将 `allMappings` 从 PRA1/PRA2 扩展为 PRA3，新增如下断言，然后运行一次 focused spec 保存
真实红灯：

1. `overview` 由当前 `30 / 11 / 41` 变为目标 `41 / 0 / 41`，41 个 stable item 仍全为 public，
   global depth 仍 `17 / 17 / 7`，available depth 目标 `17 / 17 / 7`。
2. `pra3Mappings` 精确登记本文 11 行 `apiId -> entryId#anchor -> collection`，并单独断言
   `2 / 7 / 2`；两页目标分布是 `5 / 6`。
3. restricted 仍精确 26、sourceTag `25 internal + 1 deprecated`，stable/restricted 交集为空、
   并集仍等于 RA0 67 项；coverage 改为 `24 planned + 2 documented`，documented 精确包含
   `variables.piniasymbol` 与 `variables.mapgetters`。
4. `getNavigation()` 新增 `plugins=[plugin-contracts]` 与 `options-api=[map-helpers]`；
   原 `core/stores/observation/runtime` 顺序和 entryIds 不变。累计 `loadEntry()` 为 9 页。
5. 新页 signature 非空、headingId 页内唯一、pitfalls 都是 10、无 Demo block；每页 `meta.anchors`
   与正文 headings 严格相等。
6. 11 个 stable target 的官方 URL 逐一存在于目标页 `meta.sources`；每页至少一个 Pinia official
   URL 和一个含固定 commit 的源码/test URL；`related` 全部可由 public catalog 找到。
7. plugin 页内容必须可观察包含 install-before-store、四项 context identity、`store.$state` 与
   `toRef` 双写、SSR/Devtools、declaration merging 和 teardown；map 页必须包含 computed/methods、
   `this.$pinia`、array/object/function mapper、writable setter、suffix globality 与
   `mapGetters -> mapState()` warning。

在 manifest 没有两个 collection、entries 不存在、index 仍只有 30 available 时，红灯应由真实
`overview`/navigation/loadEntry/target 缺失造成，不得使用语法错误、错误 import、private seam 或
人为抛错制造失败。记录最前面的因果失败后即停，不继续运行全量 Gate。

### Green：最小实现顺序

1. 在 `vue-pinia-reference.ts` 追加 `plugins` collection（唯一 entry 为 plugin-contracts），再追加
   `options-api` collection（唯一 entry 为 map-helpers）；core/stores/observation/runtime 内容和顺序不变。
2. 新增两篇正文，严格采用本文 metadata、headings、signature、pitfalls、inferences、sources、
   related 和 evidence boundary；不创建 Demo、共享 helper 或第三方依赖。
3. 在 `vue-pinia-reference-index.ts` 将矩阵 11 个 ID加入 `availableStableIds`，只把
   `variables.mapgetters` 的 restricted coverage 改为 `documented`，更新局部中文注释为“PRA1–PRA3
   41 项”；不重排 41 stable definitions，不改 26 tuple 的顺序/tag/target。
4. 复跑同一 focused spec 直到 Green；失败只修这 5 个 allowlist 文件的 public catalog/entry/anchor/
   source seam，不新增 parallel test，不调整 shared schema。

这一步的原子性是最终状态要求：未有真实 entry/heading/source 时不得把 index target 提前写成可达，
也不得把 mapGetters warning 当成 stable item。

## PRA3 完整 Gate（research-only 不运行）

下列 `PRA3-G*` 是未来获得明确实施授权后的 Gate；本轮 research-only 严格不运行 test、build、server、
browser、全量 Gate 或任何 implementation。`PRA3-G*` 编号不等同路线级 `Gate 6`，本轮仍不得进入路线级
Gate 6。

1. **PRA3-G0 / 重冻与 dirty protection**：记录 `git status --short`；复算 package、lock、d.ts、runtime、
   current manifest/index/spec、RA0/PRA1/PRA2 SHA；记录五个 allowlist 文件的 preimage/不存在状态。
   任一冻结输入变化先差异审计，保留所有 staged/unstaged/untracked，不 `git add`。
2. **PRA3-G1 / TDD Red**：按上述 Red 只扩展现有 focused spec，运行
   `npm test -- src/content/catalog/vue-pinia-reference-pra1.spec.ts`，保存因 `30 -> 41`、两个
   collection/entry/target 缺失产生的真实失败。
3. **PRA3-G2 / Green 与结构计数**：完成五文件最小实现，复跑同一命令；机械确认
   `11 / 2-7-2 / 5-6 / 41-0-41`、global `17-17-7`、restricted 26 与 coverage `24-2`，
   stable/restricted intersection 0、union 67。
4. **PRA3-G3 / shared public regression**：运行
   `npm test -- src/content/catalog/LearningCatalog.spec.ts` 与
   `npm test -- src/content/schema/entry-template.spec.ts`；不修改这两个 shared spec，失败按本批
   或既有故障精确归因。
5. **PRA3-G4 / 全量与静态检查**：运行 `npm test`、`npm run type-check`、`npm run lint`、
   `npm run format:check`。既有 workspace failure 必须列精确路径、输出和 pre-existing 证据，不能把
   focused green 写成 global green。
6. **PRA3-G5 / 文件级格式、whitespace、规模与禁令**：对五个 allowlist 文件运行定向
   `npx prettier --check`；tracked/staged 文件分别运行 `git diff --check` 与
   `git diff --cached --check`，新 entry 逐个运行
   `git diff --no-index --check /dev/null <file>`，只忽略 content-diff exit 1，不忽略 whitespace
   error；逐个报告行数（每个 `.ts` 约 1000 行以内）、中文顶层/方法注释、无 `grid`/`gap`/新增依赖。
7. **PRA3-G6 / production build**：运行 `npm run build`，确认两页和新 collections 在类型检查与打包
   转换中可加载；build 不能代替 browser、Options API runtime 或 Devtools/SSR evidence。
8. **PRA3-G7 / 最小浏览器 catalog 路径**：只在实施授权后使用可复跑 Playwright 路径，不新增 E2E 文件：
   打开 `/reference/vue/pinia` 确认 `41 / 41`；键盘搜索 `PiniaPlugin` 进入
   `/reference/vue/pinia/plugins/plugin-contracts#pinia-plugin`，搜索 `mapState` 进入
   `/reference/vue/pinia/options-api/map-helpers#map-state`；直达两个 deprecated/restricted warning
   只验证 map page 的 `#deprecated-map-getters`，确认不会出现在 Overview；检查 desktop、`390 × 844`、
   200% 文本、reduced motion、焦点、水平溢出、console warning/error、pageerror。该路径只证明
   Reference catalog/page，不证明真实 plugin、Options API SFC、SSR、Devtools 或 suffix runtime。
9. **PRA3-G8 / 单一双轴 review**：冻结同一五文件 diff，只创建一个 `gpt-5.6-sol`、`xhigh` review
   agent，在同一上下文分别输出 `Standards` 与 `Spec` 两节。Standards 检查仓库规范、最小改动、
   public seam、中文注释、文件规模、无 Demo/依赖；Spec 逐项核对 11 行矩阵、metadata/headings/
   signatures/pitfalls/inferences/sources/related、restricted coverage、TDD/evidence/停止线。任一
   finding 非零只修被点名 blocker，复跑受影响 Gate 并交回同一 review agent；不得用主进程自评替代。
10. **PRA3-G9 / closure-only**：只有 `Standards PASS / 0 finding` 与 `Spec PASS / 0 finding` 后，才
    修改第六文件 `docs/重构实施计划.md`，仅追加实际 PRA3 closure、命令/结果、五个实现文件和 closure
    文件 SHA、Tavily 状态、Deferred evidence 与 PRA4 停止线；对 closure 文档运行定向 Prettier 与
    whitespace，并让同一 review agent 核对最终六文件 diff。
11. **PRA3-G10 / 报告并硬停止**：报告实际六文件、stable/restricted 计数、SHA、focused/global Gate、
    双轴 PASS/0 和未验证 evidence；不暂存、不提交、不推送。完成后不自动进入 PRA4 或任何搜索/Gate 6。

## Evidence 与负范围

### 本 research-only 批次

- 已读取固定版本声明、runtime、源码、Guide、官方测试；Tavily Search/Extract 额度错误已原样记录。
- 未运行 npm test、type-check、lint、format、build、server、browser、Playwright、全量 Gate；因此不把
  研究文档状态写成 implementation green，不修改任何 manifest/index/spec/entry/Demo/closure。
- 外部来源只支撑 Pinia 4.0.2 API contract 与 upstream test facts；当前本地声明/runtime 用于区分公开
  contract、declaration merging 和具体运行时实现。

### 实施后的证据边界

- focused spec 与 LearningCatalog/entry-template 只证明公开 catalog、anchor、source、metadata、counts
  和 restricted seam。
- 官方 `storePlugins.spec.ts` 证明固定上游 plugin identity、options、state/ref 和安装时序事实，不证明
  本项目 plugin runtime。官方 `mapHelpers.spec.ts` 证明 fixed runtime 的 array/object/function mapper、
  suffix、setter 和 deprecated alias，不证明本项目真实 Options API 页面。
- build 只证明模块可类型检查/转换；最小浏览器路径只证明本站 Reference 页面。真实 SSR serialization/
  hydration、Vue Devtools client、Options API SFC interaction、per-app suffix isolation 和 production
  behavior 均保持 `Deferred/not-run`。
- 不创建 Demo 或 fixture，不引入 `@pinia/testing`/`@pinia/nuxt`，不把 static code snippet、callback
  unit model 或页面截图写成真实 runtime evidence。

## PRA4 停止线

PRA3 closure 后，稳定 Reference 仅达到 `41 available / 0 planned / 41 stable total`；restricted
仍为 `26 = 24 internal planned + 1 internal documented (piniaSymbol) + 1 deprecated documented
(mapGetters)`。下一批如获明确授权，只能独立研究/实施 PRA4 的 24 个 internal type watchlist；PRA4
不得 import restricted symbol、创建 24 页、改变 stable Overview 或新增 Demo。

PRA3 完成后硬停止，不提前进入 PRA4、搜索收口、路线级 Gate 6、React、后端、依赖、SSR/HMR/Devtools
fixture 或其他生态。`ready`、`PASS/0` 或 `41/41` 只表示本批 Reference contract 闭合，不表示上述
相邻能力已经验证。

## 固定一手来源索引

### 发布、声明与插件

- [Pinia release `v4.0.2`](https://github.com/vuejs/pinia/releases/tag/v4.0.2)
- [固定 commit](https://github.com/vuejs/pinia/commit/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1)
- [Pinia API 根页](https://pinia.vuejs.org/api/pinia/)
- [`types.ts@ae4e3b2`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/types.ts)
- [`rootStore.ts@ae4e3b2`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/rootStore.ts)
- [`createPinia.ts@ae4e3b2`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/createPinia.ts)
- [`store.ts@ae4e3b2`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts)
- [Plugins Guide](https://pinia.vuejs.org/core-concepts/plugins.html)
- [`storePlugins.spec.ts@ae4e3b2`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/storePlugins.spec.ts)

### Options API map helpers

- [Options API Guide](https://pinia.vuejs.org/cookbook/options-api.html)
- [State Guide：Usage with the Options API](https://pinia.vuejs.org/core-concepts/state.html#usage-with-the-options-api)
- [MapStoresCustomization API](https://pinia.vuejs.org/api/pinia/interfaces/MapStoresCustomization.html)
- [mapActions API](https://pinia.vuejs.org/api/pinia/functions/mapActions.html)
- [mapState API](https://pinia.vuejs.org/api/pinia/functions/mapState.html)
- [mapStores API](https://pinia.vuejs.org/api/pinia/functions/mapStores.html)
- [mapWritableState API](https://pinia.vuejs.org/api/pinia/functions/mapWritableState.html)
- [setMapStoreSuffix API](https://pinia.vuejs.org/api/pinia/functions/setMapStoreSuffix.html)
- [mapGetters API（deprecated）](https://pinia.vuejs.org/api/pinia/variables/mapGetters.html)
- [`mapHelpers.ts@ae4e3b2`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/mapHelpers.ts)
- [`types.ts@ae4e3b2`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/types.ts)
- [`mapHelpers.spec.ts@ae4e3b2`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/mapHelpers.spec.ts)

本文到此停止；未实施 PRA3，未创建 index/manifest/entry/spec/Demo/closure，也未进入 PRA4、搜索收口、
路线级 Gate 6 或 React。
