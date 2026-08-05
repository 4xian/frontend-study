# Pinia Reference PRA1：Core & Stores 官方研究冻结

> 状态：`P0.2 / PRA1 / research-only`
>
> 查证日期：2026-08-05（Asia/Shanghai）
>
> 适用版本：本地与 lockfile 的 `pinia@4.0.2`
>
> 固定 tag commit：[`ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1`](https://github.com/vuejs/pinia/commit/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1)
>
> 本文只冻结 PRA1 的 19 个 stable 根入口、4 个详情页内容契约和未来实施 Gate；不实施 index、
> track、entry、spec 或 Demo，不进入 PRA2。

## 结论

1. PRA1 精确承载 **19 个 stable/public 根入口**：`5 Core + 6 Define Store + 7 Store Shape +
   1 storeToRefs`。深度为 `10 detail + 4 merged + 5 quick`，全部计入稳定 `41` 分母。
2. `25 internal + 1 deprecated = 26 restricted` 必须保存在独立 tuple，**不得**进入稳定 index、
   `availableCount` 或 `total=41`。PRA1 只在 Pinia 实例页放一个 `piniaSymbol` quick warning；其余
   24 个 internal type 与 `mapGetters` 仍为 planned，不能借 PRA1 提前发布。
3. 四页都必须有非空 `signature`、5–10 个高质量 pitfalls、编号“源码推导与适用场景”、固定
   official/commit sources、`related` 和唯一 heading anchor。Reference 默认不创建 Demo。
4. 当前 `pinia@4.0.2` 发布输入与 RA0 相同；当前 Pinia learning manifest 已有工作区改动，SHA 不再
   等于 RA0。PRA1 实施前必须以当时工作区重新冻结，不得把 RA0 的旧 manifest SHA 当成 current。
5. PRA1 只接入 Core & Stores。完成 `19 available / 22 planned / 41 stable` 后立即停止；
   subscriptions、hydration 和 HMR 属于 PRA2，不能顺手实现。

## 版本、声明与检索边界

### 当前本地冻结值

| 输入 | 当前值 | 与 RA0 的关系 |
| --- | --- | --- |
| `node_modules/pinia/package.json` version | `4.0.2` | 一致 |
| `node_modules/pinia/package.json` SHA-256 | `3f582bbd93981c665127629912ba784031d740f2bb1ceb0decc206846e97ace9` | 一致 |
| `node_modules/pinia/dist/pinia.d.ts` SHA-256 | `e13460b9f39a197d76b64f4b4a14ddc403b4d85e036adb5850b820f7e08e0674` | 一致 |
| `node_modules/pinia/dist/pinia.js` SHA-256 | `eb83983da65fdbdb6585de805bda8cadc70a9d273444da1bf4811f6e4851ea92` | 一致 |
| `package-lock.json` SHA-256 | `6a68e9e91d6b08c740fdcdecdf64951639e7aba78f1acd4d766c7c6f9b1e1c98` | 一致 |
| `src/content/catalog/manifests/vue-pinia-track.ts` SHA-256 | `68476b94dff0142f6d8e811406f26b94298007c7a2937dc0732ffba0f3525d9b` | 已偏离 RA0 的 `903e8126…` |

本地声明复核到两个 `defineStore()` overload、`Pinia`/`StoreDefinition`/`StoreProperties` 的成员、
`Store` 组合类型以及 `storeToRefs()` 返回边界。发布 runtime 进一步复核了 active Pinia 解析、插件
安装队列、实例与 store disposal、Setup/Options Store 创建分支和响应式字段筛选。

### Tavily 与外部读取边界

本轮按仓库规则先调用 Tavily：4 组官方 URL Extract 和 1 次限定 `pinia.vuejs.org` 的 Search 均返回
`This request exceeds your plan's set usage limit`。停止重试后，固定 GitHub raw 回退也发生 15 秒
零字节超时。因此本文没有把本轮未读到的 current 页面正文伪装成已重新验证；外部链接沿用 RA0
已经冻结的官方 API/Guide、固定 commit 源码与官方测试 URL，行为结论逐项交叉核对当前 4.0.2 本地
声明/runtime，以及仓库中已对同一 commit 形成的 P02/P05 官方测试研究。网络恢复后，PRA1 Gate 0
应重读这些一手 URL；在此之前不得新增本文未冻结的 upstream test 结论。

## PRA1 精确 19 项稳定矩阵

以下 19 行全部是 `sourceTag: public`、`stable: yes`。表中 `entryId#anchor` 是唯一发布目标；
`planned` 时不写 target，只有同批 entry 与 heading 存在且唯一后才原子切换为 `available`。

| apiId | displayName | sourceTag | officialUrl | depth | entryId | 唯一 anchor |
| --- | --- | --- | --- | --- | --- | --- |
| `interfaces.pinia` | `Pinia` | `public` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/Pinia.html) | `detail` | `vue.pinia.reference.core.pinia-instance` | `pinia-interface` |
| `variables.getactivepinia` | `getActivePinia` | `public` | [官方](https://pinia.vuejs.org/api/pinia/variables/getActivePinia.html) | `quick` | `vue.pinia.reference.core.pinia-instance` | `get-active-pinia` |
| `variables.setactivepinia` | `setActivePinia` | `public` | [官方](https://pinia.vuejs.org/api/pinia/variables/setActivePinia.html) | `quick` | `vue.pinia.reference.core.pinia-instance` | `set-active-pinia` |
| `functions.createpinia` | `createPinia` | `public` | [官方](https://pinia.vuejs.org/api/pinia/functions/createPinia.html) | `detail` | `vue.pinia.reference.core.pinia-instance` | `create-pinia` |
| `functions.disposepinia` | `disposePinia` | `public` | [官方](https://pinia.vuejs.org/api/pinia/functions/disposePinia.html) | `quick` | `vue.pinia.reference.core.pinia-instance` | `dispose-pinia` |
| `interfaces.definesetupstoreoptions` | `DefineSetupStoreOptions` | `public` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/DefineSetupStoreOptions.html) | `detail` | `vue.pinia.reference.stores.define-store` | `define-setup-store-options` |
| `interfaces.definestoreoptions` | `DefineStoreOptions` | `public` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/DefineStoreOptions.html) | `detail` | `vue.pinia.reference.stores.define-store` | `define-store-options` |
| `interfaces.definestoreoptionsbase` | `DefineStoreOptionsBase` | `public` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/DefineStoreOptionsBase.html) | `merged` | `vue.pinia.reference.stores.define-store` | `define-store-options-base` |
| `interfaces.setupstoredefinition` | `SetupStoreDefinition` | `public` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/SetupStoreDefinition.html) | `detail` | `vue.pinia.reference.stores.define-store` | `setup-store-definition` |
| `interfaces.storedefinition` | `StoreDefinition` | `public` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/StoreDefinition.html) | `detail` | `vue.pinia.reference.stores.define-store` | `store-definition` |
| `functions.definestore` | `defineStore` | `public` | [官方](https://pinia.vuejs.org/api/pinia/functions/defineStore.html) | `detail` | `vue.pinia.reference.stores.define-store` | `define-store` |
| `interfaces.storeproperties` | `StoreProperties` | `public` | [官方](https://pinia.vuejs.org/api/pinia/interfaces/StoreProperties.html) | `detail` | `vue.pinia.reference.stores.store-shape` | `store-properties` |
| `type-aliases.statetree` | `StateTree` | `public` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/StateTree.html) | `quick` | `vue.pinia.reference.stores.store-shape` | `state-tree` |
| `type-aliases.store` | `Store` | `public` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/Store.html) | `detail` | `vue.pinia.reference.stores.store-shape` | `store-type` |
| `type-aliases.storeactions` | `StoreActions` | `public` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/StoreActions.html) | `merged` | `vue.pinia.reference.stores.store-shape` | `store-actions` |
| `type-aliases.storegeneric` | `StoreGeneric` | `public` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/StoreGeneric.html) | `quick` | `vue.pinia.reference.stores.store-shape` | `store-generic` |
| `type-aliases.storegetters` | `StoreGetters` | `public` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/StoreGetters.html) | `merged` | `vue.pinia.reference.stores.store-shape` | `store-getters` |
| `type-aliases.storestate` | `StoreState` | `public` | [官方](https://pinia.vuejs.org/api/pinia/type-aliases/StoreState.html) | `merged` | `vue.pinia.reference.stores.store-shape` | `store-state` |
| `functions.storetorefs` | `storeToRefs` | `public` | [官方](https://pinia.vuejs.org/api/pinia/functions/storeToRefs.html) | `detail` | `vue.pinia.reference.stores.store-to-refs` | `store-to-refs` |

机械断言必须得到：

| 维度 | 结果 |
| --- | ---: |
| PRA1 stable | 19 |
| `detail / merged / quick` | `10 / 4 / 5` |
| `sourceTag=public` | 19 |
| PRA1 entryId | 4 |
| 每项 target 命中且同页 anchor 唯一 | 19 |

`variables.piniasymbol` 不在上表。它是 `sourceTag: internal`、`stable: no`，只允许落到
`vue.pinia.reference.core.pinia-instance#internal-pinia-symbol` 的 quick warning；没有官网详情 URL，
只引用固定 `rootStore.ts`。它仍属于 restricted 26，不得让 PRA1 stable 从 19 变成 20。

## 四页统一正文契约

每页必须复用 `defineReferenceMeta()` 与 `defineReference()`，并同时满足：

- `signature.trim().length > 0`；合并页可以用多行 declaration，但不能用空串或 prose 代替签名。
- `meta.anchors` 与正文 heading 同源，`headingId()` 结果页内唯一；19 个 target anchor 必须逐项命中。
- 正文必须有且只有一个 `易错使用提示` 和一个 `源码推导与适用场景` heading。
- 每页有 5–10 个 pitfalls；每项包含可观察后果和公开替代，不把 internal 实现写成推荐做法。
- “源码推导与适用场景”按编号写，明确“源码事实 → 能推出什么 → 适用场景”，不做无来源概括。
- `meta.sources` 至少包含相应官方 API/Guide、固定 commit 源码；采用测试结论时加入精确官方 test URL。
- `related` 只连到当前 catalog 已存在的 entryId 或本批同批创建的其他三页。
- 不加入 `demo` block，不新增 `src/content/demos/vue/pinia/` 文件。

## 页面 1：Pinia 实例与应用所有权

### 元数据与 anchors

- `entryId`：`vue.pinia.reference.core.pinia-instance`
- 文件：`src/content/entries/reference/vue/pinia/core/pinia-instance.ts`
- collection：`core`
- 必须唯一的目标 headings：`Pinia Interface`、`Create Pinia`、`Get Active Pinia`、
  `Set Active Pinia`、`Dispose Pinia`
- restricted heading：`Internal Pinia Symbol`
- 固定 anchors：`pinia-interface`、`create-pinia`、`get-active-pinia`、`set-active-pinia`、
  `dispose-pinia`、`internal-pinia-symbol`

建议 `related` 精确冻结为：

```ts
[
  'vue.pinia.reference.stores.define-store',
  'vue.pinia.learn.basics.setup-first-store',
  'vue.pinia.learn.intermediate.outside-components-router',
  'vue.pinia.learn.advanced.store-testing',
  'vue.pinia.learn.advanced.hmr-devtools-maintenance',
]
```

### 非空 signature

```ts
declare function createPinia(): Pinia

interface Pinia {
  install(app: App): void
  state: Ref<Record<string, StateTree>>
  use(plugin: PiniaPlugin): Pinia
}

declare function disposePinia(pinia: Pinia): void
declare const getActivePinia: () => Pinia | undefined
declare const setActivePinia: {
  (pinia: Pinia): Pinia
  (pinia: undefined): undefined
  (pinia: Pinia | undefined): Pinia | undefined
}
```

### `Pinia` public/internal members

| 成员 | 分类 | 正文必须说明 |
| --- | --- | --- |
| `install(app)` | public | 正常入口是 `app.use(pinia)`；由 Vue 调用，不手动调用 |
| `state` | public | 根 state 是 `Ref<Record<string, StateTree>>`；按 store id 保存 state |
| `use(plugin)` | public | 返回同一 Pinia；安装前插件排队，安装后直接登记 |
| `_p` | internal | 已安装 store plugins，应用代码不读写 |
| `_a` | internal | 关联 App，不能作为 public installed flag |
| `_e` | internal | Pinia effect scope，生命周期由公开 dispose API 管理 |
| `_s` | internal | store registry，不能用来枚举或删除业务 store |
| `_testing` | internal | `@pinia/testing` seam，不是应用模式开关 |

`piniaSymbol` 只写 quick warning：它用于 testing/Storybook 等 edge case，固定声明明确
“Could break in a minor, USE AT YOUR OWN RISK”。常规应用使用 `app.use(pinia)`、组件注入上下文或给
`useStore(pinia)` 显式传实例；不展示 import 示例。

### 易错使用提示方向（8）

1. 不要手动调用 `pinia.install(app)`；后果是绕过 Vue plugin 约定。使用 `app.use(pinia)`。
2. 不要把 active Pinia 当进程级单例；SSR、多 app 和并行测试必须持有正确实例。
3. 组件外在 `app.use(pinia)` 之前调用 `useStore()` 可能没有 active context；延后调用或显式传 pinia。
4. `setActivePinia()` 是上下文 seam，不是全局初始化 API；使用完毕要恢复/隔离测试上下文。
5. `getActivePinia()` 可能返回 `undefined`；不能以非空断言掩盖安装顺序错误。
6. `disposePinia()` 不是 reset；它停止整个 scope、清 stores/plugins/root state，并使实例不可复用。
7. 不要混淆 `disposePinia(pinia)` 与 `store.$dispose()`；前者清整个实例，后者只释放一个 store 且
   默认保留 root state。
8. 不读取 `_p/_a/_e/_s/_testing` 或常规依赖 `piniaSymbol`；使用公开 plugin、state、store 和
   lifecycle seam。

### 编号源码推导与适用场景

1. 固定 `createPinia.ts` 创建 detached `effectScope(true)` 和根 `ref({})`，再返回 `markRaw` Pinia；
   适用于解释为何每个 app/test 应拥有自己的实例，而不是模块级复用一个隐式全局。
2. `install()` 先 `setActivePinia(pinia)`，再保存 app、provide symbol、设置 `$pinia` 并冲刷安装前
   plugin 队列；适用于解释 plugin 安装顺序与组件外调用时机。
3. `use(plugin)` 在 `_a` 缺席时进入待安装队列，否则进入 `_p`；适用于“插件为什么在 app 安装后
   才作用于随后创建的 store”，不延伸到 PRA3 plugin 正文。
4. `getActivePinia()` 优先使用 injection context，回退到 active variable；适用于组件、guard、SSR
   或测试中选择正确实例，不得概括为永久全局单例。
5. `disposePinia()` 依次 stop effect scope、清 registry/plugins/root state 并断开 app；适用于测试、
   多实例应用的总清理，dispose 后必须重新 `createPinia()`。
6. P05 对固定 `lifespan.spec.ts` 的研究确认 Pinia disposal 会停止 store setup watcher；适用于生命周期
   说明，但本页不把 testing package 行为混入 core 根入口。

### 一手来源

- [Pinia API：Pinia](https://pinia.vuejs.org/api/pinia/interfaces/Pinia.html)
- [Pinia API：createPinia](https://pinia.vuejs.org/api/pinia/functions/createPinia.html)
- [Pinia API：disposePinia](https://pinia.vuejs.org/api/pinia/functions/disposePinia.html)
- [组件外使用 Store](https://pinia.vuejs.org/core-concepts/outside-component-usage.html)
- [`rootStore.ts@ae4e3b2`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/rootStore.ts)
- [`createPinia.ts@ae4e3b2`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/createPinia.ts)
- [`lifespan.spec.ts@ae4e3b2`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/lifespan.spec.ts)

## 页面 2：定义 Store

### 元数据与 anchors

- `entryId`：`vue.pinia.reference.stores.define-store`
- 文件：`src/content/entries/reference/vue/pinia/stores/define-store.ts`
- collection：`stores`
- 必须唯一的目标 headings：`Define Store`、`Define Store Options`、
  `Define Setup Store Options`、`Define Store Options Base`、`Store Definition`、
  `Setup Store Definition`
- 固定 anchors：`define-store`、`define-store-options`、`define-setup-store-options`、
  `define-store-options-base`、`store-definition`、`setup-store-definition`

建议 `related` 精确冻结为：

```ts
[
  'vue.pinia.reference.core.pinia-instance',
  'vue.pinia.reference.stores.store-shape',
  'vue.pinia.learn.basics.setup-first-store',
  'vue.pinia.learn.intermediate.setup-stores',
  'vue.pinia.learn.intermediate.store-modeling',
]
```

### 非空 signature

```ts
declare function defineStore<
  Id extends string,
  S extends StateTree = {},
  G extends _GettersTree<S> = {},
  A = {},
>(
  id: Id,
  options: Omit<DefineStoreOptions<Id, S, G, A>, 'id'>,
): StoreDefinition<Id, S, G, A>

declare function defineStore<Id extends string, SS>(
  id: Id,
  storeSetup: (helpers: SetupStoreHelpers) => SS,
  options?: DefineSetupStoreOptions<
    Id,
    _ExtractStateFromSetupStore<SS>,
    _ExtractGettersFromSetupStore<SS>,
    _ExtractActionsFromSetupStore<SS>
  >,
): SetupStoreDefinition<Id, SS>
```

正文还要给出：

```ts
interface StoreDefinition<Id extends string, S extends StateTree, G, A> {
  (pinia?: Pinia | null, hot?: StoreGeneric): Store<Id, S, G, A>
  $id: Id
  /** @internal */ _pinia?: Pinia
}

interface SetupStoreDefinition<Id extends string, SS>
  extends StoreDefinition<
    Id,
    _ExtractStateFromSetupStore<SS>,
    _ExtractGettersFromSetupStore<SS>,
    _ExtractActionsFromSetupStore<SS>
  > {}
```

### Options、Setup 与 definition surface

| surface | 正文必须说明 |
| --- | --- |
| Options overload | 第二参数是去掉 `id` 的 `DefineStoreOptions`；`state/getters/actions/hydrate` 属于定义输入 |
| Setup overload | setup 返回面决定 state/getters/actions；第三参数是扩展选项，不是另一份业务 actions |
| `DefineStoreOptions.state` | fresh state factory；固定声明要求 arrow function 以保持正确类型 |
| `DefineStoreOptions.getters/actions` | 使用 `ThisType` 建立 Options Store 的 `this` surface |
| `DefineStoreOptions.hydrate` | SSR complex state hook；这里只登记签名，完整 hydration 留给 PRA2 |
| `DefineSetupStoreOptions.actions?` | `useStore()` 提取后提供给 plugin；用户定义 Setup Store 时不手写 |
| `DefineStoreOptionsBase` | 空 interface 是两类 store 共同的 declaration-merging seam |
| `StoreDefinition` | `defineStore()` 返回 callable；调用时才创建/取得 store；public `$id`，internal `_pinia` |
| `SetupStoreDefinition` | 只细化提取类型，不增加新的 runtime member |

### 易错使用提示方向（8）

1. Store id 必须在应用内稳定且唯一；重复 id 会让不同定义命中同一 registry identity。
2. `defineStore()` 只返回 definition，不立即创建 store；首次调用 `useStore()` 才创建或取得实例。
3. 不把 Options object 与 Setup function 混在一个 overload；先选一种定义模型。
4. Options `state` 使用 fresh arrow factory；不要共享模块级可变对象。
5. Setup Store 必须返回所有应由 Pinia 管理的 state；隐藏/readonly private state 会破坏 SSR、
   Devtools 与 plugin 可见性。
6. 不手写 `DefineSetupStoreOptions.actions`；它是 store 建立后供 plugin 观察的提取结果。
7. 不把 `SetupStoreDefinition` 当成额外 runtime wrapper；它与 `StoreDefinition` 共享 callable/$id。
8. 应用代码不传 `hot`、不读取 `_pinia`，也不导入 `_Extract*`；HMR 与 internal type 留在边界层。

### 编号源码推导与适用场景

1. 固定 `defineStore()` 以第二参数是否为 function 选择 Setup/Options 分支；适用于说明两个 overload
   是同一 API 的互斥入口，不需要创建两页。
2. 返回的 `useStore()` 先解析显式 pinia/injection/active context，再按 `$id` 查询 `_s`；适用于说明
   definition 与实例分离以及 id identity。
3. registry 尚无 `$id` 时才调用 `createSetupStore()` 或 `createOptionsStore()`；适用于 lazy
   instantiation、按 app 隔离 store 和测试 fixture。
4. Options 分支把 state 转 refs、actions 与 computed getters 合并后交给 setup 创建器；适用于对照
   Options ergonomic input 与最终统一 Store surface。
5. Setup 分支只扫描 setup 返回对象：ref/reactive → state，computed → getter，function → action；
   `storeSetup.spec.ts` 的 `$state` 断言适用于解释“必须返回全部 state”。
6. `StoreDefinition.$id` 由 `defineStore()` 直接赋值，`_pinia` 只在 dev 创建后写入；适用于 map/helper
   identity 与 HMR 边界，不应把 `_pinia` 暴露给应用。
7. `DefineStoreOptionsBase` 与两种 options interface 是 TypeScript declaration-merging seam；适用于
   PRA3 插件类型扩展的预告，本页不实现 plugin contract。

### 一手来源

- [Pinia API：defineStore](https://pinia.vuejs.org/api/pinia/functions/defineStore.html)
- [Pinia API：DefineStoreOptions](https://pinia.vuejs.org/api/pinia/interfaces/DefineStoreOptions.html)
- [Pinia API：DefineSetupStoreOptions](https://pinia.vuejs.org/api/pinia/interfaces/DefineSetupStoreOptions.html)
- [Pinia API：StoreDefinition](https://pinia.vuejs.org/api/pinia/interfaces/StoreDefinition.html)
- [Defining a Store](https://pinia.vuejs.org/core-concepts/)
- [`store.ts@ae4e3b2`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts)
- [`storeSetup.spec.ts@ae4e3b2`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/storeSetup.spec.ts)

## 页面 3：Store 类型与实例 surface

### 元数据与 anchors

- `entryId`：`vue.pinia.reference.stores.store-shape`
- 文件：`src/content/entries/reference/vue/pinia/stores/store-shape.ts`
- collection：`stores`
- 必须唯一的目标 headings：`State Tree`、`Store Type`、`Store Generic`、`Store Actions`、
  `Store Getters`、`Store State`、`Store Properties`
- 固定 anchors：`state-tree`、`store-type`、`store-generic`、`store-actions`、`store-getters`、
  `store-state`、`store-properties`

建议 `related` 精确冻结为：

```ts
[
  'vue.pinia.reference.stores.define-store',
  'vue.pinia.reference.stores.store-to-refs',
  'vue.pinia.learn.basics.state-patch-reset',
  'vue.pinia.learn.basics.getters',
  'vue.pinia.learn.basics.actions-async',
  'vue.pinia.learn.intermediate.setup-stores',
  'vue.pinia.learn.intermediate.subscriptions-actions',
]
```

### 非空 signature

```ts
type StateTree = Record<PropertyKey, any>

type Store<Id extends string = string, S extends StateTree = {}, G = {}, A = {}> =
  _StoreWithState<Id, S, G, A> &
  UnwrapRef<S> &
  _StoreWithGetters<G> &
  (_ActionsTree extends A ? {} : A) &
  PiniaCustomProperties<Id, S, G, A> &
  PiniaCustomStateProperties<S>

type StoreGeneric = Store<string, StateTree, _GettersTree<StateTree>, _ActionsTree>
type StoreActions<SS> = /* Options 或 Setup Store 的 actions 提取结果 */
type StoreGetters<SS> = /* Options 或 Setup Store 的 getters 提取结果 */
type StoreState<SS> = /* Options 或 Setup Store 的 unwrapped state 提取结果 */
```

`Store` 的教学签名可省略 internal conditional type 展开，但正文必须链接固定声明并明确这只是可读
等价摘要；代码示例不得手写 `_StoreWithState/_StoreWithGetters/_ActionsTree/_GettersTree`。

### Store public surface

| 成员 | 正文必须说明 |
| --- | --- |
| `$id` | 稳定 store identity |
| `$state` | unwrapped state + custom state；整体赋值内部走 `$patch()` |
| `$patch(object)` | nested partial patch；mutation payload 可观察 |
| `$patch(fn)` | 对同一 state 做成组同步 mutation；mutator 不得 async |
| `$reset()` | Options Store 重跑 state factory；Setup Store 默认不实现，需自定义 |
| `$subscribe(callback, options?)` | 返回 unsubscribe；组件作用域默认清理，可 `detached`；patch 通知不受 `flush` 影响 |
| `$onAction(callback, detached?)` | action 前置、`after/onError` 通道；返回 unsubscribe |
| `$dispose()` | 停 store scope、清 subscriptions、移出 registry；不删除 root state |
| state/getters/actions keys | 都直接出现在 store surface；state/getter 解构规则由 storeToRefs 页解释 |

### `StoreProperties` public/internal members

| 成员 | 分类 | 正文处理 |
| --- | --- | --- |
| `$id` | public | 常规应用可读的唯一成员 |
| `_p` | internal | store 所属 Pinia |
| `_getters?` | internal | Devtools getter 名单，production 可移除 |
| `_isOptionsAPI?` | internal | Devtools 区分 Options/Setup |
| `_hotUpdate()` | internal | dev-only HMR 更新 |
| `_hotUpdating` | internal | HMR 时暂停部分 watcher |
| `_hmrPayload` | internal | dev-only state/actions/getters payload |
| `_customProperties` | public but specialized | 固定声明没有 `@internal`；插件作者登记 Devtools 应展示的自定义 key，普通业务不应把它当 state |

`StoreActions`、`StoreGetters`、`StoreState` 是公共提取类型；应用需要从一个 store/definition 推导
surface 时使用它们。`StoreGeneric` 明确是 type-unsafe convenience，只适合不关心具体 store shape 的
通用基础设施，不应替代业务层精确 store 类型。

### 易错使用提示方向（10）

1. 不用 `StoreGeneric` 逃避业务类型；它允许字符串属性访问，牺牲精确错误提示。
2. 不直接解构 store 的 state/getter；会失去 reactive 连接，使用 `storeToRefs()`。
3. `$patch(fn)` 必须同步；异步流程放 action，await 前后分别提交明确 mutation。
4. `$state = next` 不是替换 reactive object，而是内部函数 patch；不要依赖对象 identity 被替换。
5. Setup Store 没有自动 `$reset()`；显式返回自己的 reset action。
6. `store.$dispose()` 不删除 `pinia.state.value[id]`；若重新 `useStore()`，默认会复用旧 state。
7. `$subscribe()`/`$onAction()` 在组件内默认随 scope 清理；跨组件存活必须有意使用 `detached` 并
   保存 unsubscribe。
8. `$subscribe({ flush })` 的 flush 不改变 `$patch()` 手动触发通知的时机；不能用 flush 推断 patch
   次数或事务边界。
9. 不读写 `_p/_getters/_isOptionsAPI/_hot*`；它们是 internal/dev-only，minor 版本可变。
10. `_customProperties` 不是任意业务字段容器；只给插件作者登记 Devtools custom keys，响应式 state
    仍需遵守 plugin state 双写契约（PRA3）。

### 编号源码推导与适用场景

1. `Store` 是 base state、unwrapped state、getter、action 与 custom extension 的交叉类型；适用于
   解释“一个 store 变量为何同时可读 state、getter 和方法”，不应在应用手工重建交叉类型。
2. 固定 `$state` setter 调用 `$patch()` 并 `assign` 新值；适用于 state restore/replace 语义，不代表
   root reactive object 被直接换掉。
3. `$patch()` 暂停常规 listener、执行 object merge 或同步 mutator，再手动触发一次 subscription；
   `store.patch.spec.ts` 适用于验证成组 mutation，不将其扩展为异步事务。
4. Options `$reset()` 重跑 state factory 后用函数 patch assign；Setup 分支默认 dev throw/prod noop；
   `state.spec.ts` 与 `storeSetup.spec.ts` 适用于两种 store 的 reset 差异。
5. `$subscribe()` 包装 Vue watch 并根据 `detached` 绑定 scope；`subscriptions.spec.ts` 适用于 watcher
   生命周期、flush 与 patch 通知边界，完整 mutation variants 留给 PRA2。
6. `$onAction()` 保存 action subscriptions，wrapper 在返回 Promise 时延后 `after`、失败进入
   `onError`；`actions.spec.ts`/`onAction.spec.ts` 适用于 action surface，listener 类型留给 PRA2。
7. `$dispose()` stop store scope、清两类 subscriptions、删除 registry entry但不删 root state；
   `store.spec.ts` 适用于临时 store/test cleanup 和“旧实例不可继续作为 active identity”。
8. Setup 扫描返回值的 ref/reactive、computed、function 形态并登记 state/getters/actions；适用于解释
   `StoreState/StoreGetters/StoreActions` 的公共提取结果。
9. `_customProperties` 在 dev/client 收集 plugin 返回 keys，部分 internal 字段被改为 non-enumerable；
   适用于 Devtools/plugin tooling，不得当成稳定业务枚举协议。

### 一手来源

- [Pinia API：Store](https://pinia.vuejs.org/api/pinia/type-aliases/Store.html)
- [Pinia API：StoreProperties](https://pinia.vuejs.org/api/pinia/interfaces/StoreProperties.html)
- [Pinia State Guide](https://pinia.vuejs.org/core-concepts/state.html)
- [Pinia Getters Guide](https://pinia.vuejs.org/core-concepts/getters.html)
- [Pinia Actions Guide](https://pinia.vuejs.org/core-concepts/actions.html)
- [`types.ts@ae4e3b2`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/types.ts)
- [`store.ts@ae4e3b2`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts)
- [`state.spec.ts@ae4e3b2`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/state.spec.ts)
- [`store.patch.spec.ts@ae4e3b2`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/store.patch.spec.ts)
- [`store.spec.ts@ae4e3b2`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/store.spec.ts)
- [`subscriptions.spec.ts@ae4e3b2`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/subscriptions.spec.ts)
- [`onAction.spec.ts@ae4e3b2`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/onAction.spec.ts)

## 页面 4：storeToRefs 响应式提取

### 元数据与 anchors

- `entryId`：`vue.pinia.reference.stores.store-to-refs`
- 文件：`src/content/entries/reference/vue/pinia/stores/store-to-refs.ts`
- collection：`stores`
- 必须唯一的目标 heading：`Store To Refs`
- 固定 anchor：`store-to-refs`

建议 `related` 精确冻结为：

```ts
[
  'vue.pinia.reference.stores.store-shape',
  'vue.pinia.learn.basics.component-store-to-refs',
  'vue.pinia.learn.basics.getters',
  'vue.pinia.learn.intermediate.setup-stores',
  'vue.pinia.learn.advanced.plugins-persistence',
]
```

### 非空 signature

```ts
declare function storeToRefs<SS extends StoreGeneric>(store: SS): StoreToRefs<SS>
```

`StoreToRefs`、`_ToStateRefs`、`_ToComputedRefs` 出现在声明内部但没有进入 67 个根导出矩阵；正文可用
它们解释返回类型，不能为其新增 `apiId`、heading target 或稳定分母项。

### 返回边界

| store 属性 | 结果 | 说明 |
| --- | --- | --- |
| Options/Setup state | 包含 | 可读写 ref，继续同步 store |
| readonly getter/computed | 包含 | computed ref，保持 lazy/cached 语义 |
| writable computed | 包含 | computed ref 保留 setter |
| plugin-added ref/reactive/computed state | 包含 | 按响应式形态筛选，不按“来自插件”标签筛选 |
| action/function | 忽略 | action 直接从 store 解构 |
| plugin-added 普通 number/string/plain object | 忽略 | 非响应式扩展不会被包装成 ref |
| Setup 返回的其他非响应值 | 忽略 | 遍历存在不等于进入结果 |

### 易错使用提示方向（8）

1. 直接 `const { count } = store` 得到当前解包值，不再跟随 store；使用 `storeToRefs(store)`。
2. actions 不进入 `storeToRefs()`；可直接 `const { increment } = store`，不要期待 `increment.value()`。
3. 不是所有 plugin 字段都会进入结果；只有 computed/ref/reactive 形态被选择。
4. `storeToRefs()` 不代表字段自动参与 SSR 序列化；plugin state 仍需同步到 `store.$state`。
5. 不用 `ref(store.count)` 修复解构；那会创建另一份以当前值初始化的 state。
6. 不用 `toRefs(store)` 替代专用 helper；它不能表达 Pinia 对 methods/non-reactive 的稳定过滤契约。
7. 不把未导出的 `StoreToRefs/_To*` 提升为稳定 API 或直接 import internal type。
8. 调用 `storeToRefs()` 不应立即求值所有 lazy getters；不要以提取动作触发副作用。

### 编号源码推导与适用场景

1. 固定实现先 `toRaw(store)`；适用于看到 Setup Store 原始 ref/computed，避免 reactive proxy 已解包
   后丢失分类信息。
2. 对 `value?.effect` 创建带 get/set 的 computed；适用于 readonly/writable getter ref，并且构造阶段
   不读取 `.value`，所以保持 lazy。
3. 其他 `isRef(value) || isReactive(value)` 走 `toRef(store, key)`；适用于 Options/Setup state 与
   plugin-added reactive state。
4. function 与普通值不命中任一分支；适用于 action 直接解构、非响应式 plugin field 留在 store。
5. 固定 `storeToRefs.spec.ts` 覆盖 Options/Setup state/getter、plugin ref 与普通值差异、writable
   computed setter、getter lazy；这些是本页 public regression seam。
6. 固定 `store.ts` 同时把 setup 返回值赋给 reactive store 与 raw store；适用于解释为何 helper 遍历
   raw store 仍能看到完整响应式返回面。

### 一手来源

- [Using the Store](https://pinia.vuejs.org/core-concepts/#using-the-store)
- [Pinia API：storeToRefs](https://pinia.vuejs.org/api/pinia/functions/storeToRefs.html)
- [Plugins：Adding new state](https://pinia.vuejs.org/core-concepts/plugins.html#adding-new-state)
- [`storeToRefs.ts@ae4e3b2`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/storeToRefs.ts)
- [`storeToRefs.spec.ts@ae4e3b2`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/storeToRefs.spec.ts)

## PRA1 文件 allowlist

PRA1 实现和 closure 前复审只允许以下 9 个文件；除此之外出现任何 diff 都必须停止并先说明原因：

| 动作 | 文件 | 唯一职责 |
| --- | --- | --- |
| 修改 | `src/content/catalog/index.ts` | 注册 Pinia reference index |
| 修改 | `src/content/catalog/manifests/tracks.ts` | 注册 Pinia Reference flat track |
| 新增 | `src/content/catalog/manifests/vue-pinia-reference.ts` | `core`/`stores` 两个 collection 与 4 entryIds |
| 新增 | `src/content/catalog/manifests/vue-pinia-reference-index.ts` | 41 stable 定义、26 restricted tuple、PRA1 available set |
| 新增 | `src/content/entries/reference/vue/pinia/core/pinia-instance.ts` | 页面 1 |
| 新增 | `src/content/entries/reference/vue/pinia/stores/define-store.ts` | 页面 2 |
| 新增 | `src/content/entries/reference/vue/pinia/stores/store-shape.ts` | 页面 3 |
| 新增 | `src/content/entries/reference/vue/pinia/stores/store-to-refs.ts` | 页面 4 |
| 新增 | `src/content/catalog/vue-pinia-reference-pra1.spec.ts` | 唯一 focused/public catalog regression |

在上述 9 文件完成全部实现 Gate，并对同一冻结 diff 取得最终 `Standards PASS / 0 finding` 与
`Spec PASS / 0 finding` 之前，明确不修改：`vue-pinia-track.ts`、`ecosystems.ts`、`types.ts`、
`LearningCatalog.ts`、`ReferenceOverviewPage.vue`、schema、现有课程 entry/spec、任何 Demo、样式、
依赖、实施计划、RA0、PRA2/PRA3/PRA4 文件。若单个 index 文件接近仓库约定的约 1000 行上限，
必须先请求批准拆分，不能擅自扩大实现 allowlist。

只有上述 9 文件已经取得最终双轴 `PASS / 0 finding` 后，才允许第 10 个文件
`docs/重构实施计划.md` 进入 **closure-only scope**。该文件只能追加 PRA1 closure、实际 Gate 结果、
文件/SHA 与停止边界；不得改写其他阶段、扩大实现范围或把未运行证据写成 green。closure 落盘后，
必须对该文档运行定向 Prettier 与 whitespace 检查，并把“9 个实现文件 + 1 个 closure 文件”的最终
diff 纳入最后一次复审。这个例外不反向扩大实现/closure 前复审的 9 文件 scope。

## Index、restricted 与 public catalog seam

### Index 原子性

- stable index 精确保存 41 项；每项显式写 `sourceTag`、`depth`、official URL 和 coverage。
- PRA1 的 19 项为 `available` 且有真实 target；其余 22 stable 为 `planned` 且没有 `target/path`。
- 26 restricted 放独立 readonly tuple；联合 stable 后与 RA0 67 项逐名相等、交集为空。
- `piniaSymbol` restricted target 可指向实例页 warning；其余 restricted target 仍 planned。
- `getReferenceOverview()` 不改动；它无条件统计 index items，因此 restricted 绝不能混进主 index。

### 唯一 focused spec

`src/content/catalog/vue-pinia-reference-pra1.spec.ts` 的 catalog 行为、entry 内容与 anchor 必须只通过
公开 `learningCatalog` 和 `headingId()` seam 验证。唯一额外 seam 是从
`vue-pinia-reference-index.ts` 直接 import 明确导出的 readonly
`piniaRestrictedReferenceItems`；它是独立 restricted 数据 artifact，只用于 26 项的数量、tag、
coverage、与 stable IDs 的交集/并集断言。禁止读取 catalog 内部 map、未导出数组、private stable
definitions 或 entry default。最少断言：

1. `getReferenceOverview({ ecosystem: 'vue', module: 'pinia' })` 得到
   `19 available / 41 total / 22 planned`。
2. 从 `learningCatalog` 得到的 41 项 sourceTag 都是 public，depth 全局仍与 RA0 一致；从 readonly
   restricted tuple 断言精确 `26`、`25 internal + 1 deprecated`、
   `1 documented (piniaSymbol) + 25 planned`，且这些 IDs 不在 overview items。
3. PRA1 19 个 `apiId → entryId#anchor` 精确等于本文矩阵，path 可达；22 planned 没有 target/path。
4. `getNavigation()` 的 `core` 为 1 页、`stores` 为 3 页；`loadEntry()` 可加载全部 4 页。
5. 四页 signature 非空，pitfalls 数各在 5–10，均无 demo block。
6. 每页 headingId 页内唯一；19 个 target anchor、`易错使用提示`、`源码推导与适用场景` 均存在。
7. 每页至少一个 Pinia 官方 URL 和一个含固定 commit 的源码/test URL。
8. stable IDs 与 restricted tuple IDs 交集为空、并集逐名等于 RA0 67 项；实例页存在唯一
   `internal-pinia-symbol` 警告，其他 25 restricted 的 coverage 仍为 planned。

focused 命令：

```bash
npm test -- src/content/catalog/vue-pinia-reference-pra1.spec.ts
```

public catalog 回归再运行：

```bash
npm test -- src/content/catalog/LearningCatalog.spec.ts
```

如果已有断言能覆盖上述 seam，不再增加第二个 PRA1 spec。

## 浏览器最小路径（仅未来 PRA1 实施）

本研究批次禁止启动服务和打开页面。PRA1 若完全复用已验证的 Router Reference Overview，则只保留
一条最小受影响路径，不创建新的大 E2E：

1. 打开 `/reference/vue/pinia`，确认 `19 / 41`；搜索 `createPinia` 可见 public/detail available。
2. 搜索一个 PRA2 planned 项，确认禁用且无伪链接；overview 计数中不得出现 restricted 26。
3. 键盘 Tab 到 `createPinia` 并 Enter，落到
   `/reference/vue/pinia/core/pinia-instance#create-pinia`。
4. 分别直达 `/reference/vue/pinia/stores/define-store#define-store`、
   `/reference/vue/pinia/stores/store-shape#store-type`、
   `/reference/vue/pinia/stores/store-to-refs#store-to-refs`，确认 hash 对应唯一 heading。
5. 仅实例页验证 `#internal-pinia-symbol` quick warning，不在 overview 稳定计数中显示为 stable。
6. 在 `390 × 844` 重复 overview filter → available entry 路径，确认无横向溢出、焦点可见、内容可读。

只有 PRA1 实际新增/改变总览交互或 UI 时才新增 Playwright；完全复用时做人工最小路径或复用现有
E2E seam，不把“页面能打开”写成所有 Gate green。

## PRA1 Gate 与 PRA2 停止边界

以下是未来实施 Gate，本 research-only 批次不运行 build/test/server/browser：

1. **Gate 0 / 重冻**：记录 `git status --short`；复算 package、lock、`dist/pinia.d.ts`、runtime 和
   current manifest SHA。任一 Pinia 发布输入变化先重做差异审计；保护所有现有 dirty/untracked。
2. **Gate 1 / 结构计数**：机械确认 `41 stable + 26 restricted = 67`、交集为空；PRA1 为
   `19 available`、其余 `22 planned`；restricted 不进入 41 分母。
3. **Gate 2 / focused 双 seam**：catalog/entry/anchor 只经 `learningCatalog`/`headingId()`，restricted
   计数只经明确导出的 readonly tuple；失败先修同一 seam，不新增平行测试或读取内部 map 绕过。
4. **Gate 3 / public catalog regression**：运行 `LearningCatalog.spec.ts`，确认 shared catalog 行为未变。
5. **Gate 4 / 静态全局**：运行 `npm run type-check`、`npm run lint`、`npm run format:check`；失败按
   本批变更或既有故障精确归因。
6. **Gate 5 / 文件级格式与 whitespace**：对 9 个实现 allowlist 文件运行定向
   `npx prettier --check`；tracked 文件 `git diff --check -- <files>`，untracked 文件逐个
   `git diff --no-index --check /dev/null <file>`，只忽略 content-diff 的 exit 1，不忽略 whitespace。
7. **Gate 6 / 最小浏览器路径**：仅满足上一节触发条件时执行；报告真实路径和验证边界。
8. **Gate 7 / 首次接入 build**：PRA1 是 Pinia Reference 首次接入，按 RA0 运行 `npm run build`；
   focused green 不能代替 build，build 也不能代替浏览器证据。
9. **Gate 8 / closure 前双轴复审**：冻结 9 文件 diff，取得 `Standards PASS / 0 finding` 与
   `Spec PASS / 0 finding`；任一 finding 非零都不得写 closure。
10. **Gate 9 / closure-only**：双轴 PASS/0 后，才在第 10 个文件 `docs/重构实施计划.md` 仅追加 PRA1
    closure。对该文档定向运行 Prettier/whitespace，随后把 9 个实现文件与该 closure 文件一起纳入
    最终复审；不得改写其他阶段。
11. **Gate 10 / 报告并停止**：报告实际 10 文件、SHA、`19/22/41`、restricted 26、focused/global
    gate 与最终复审结果。不提交代码。

PRA1 完成后硬停止。不得创建/修改下列 PRA2 内容：

- `MutationType`、`SubscriptionCallback*`、三种 mutation variants；
- `StoreOnActionListener*`、detached/flush 的完整 Reference 展开；
- `skipHydrate`、`shouldHydrate`、SSR hydration 页面或 Demo；
- `acceptHMRUpdate`、HMR 页面、HMR test todo 或真实 Vite HMR 证据。

可以在 PRA1 的 Store surface 中给 `$subscribe()`、`$onAction()`、`hydrate()` 留准确边界说明，但不能
把 PRA2 的 11 项提前切为 available，也不能新增 Demo。

## 固定一手来源索引

### 发布与声明

- [Pinia release `v4.0.2`](https://github.com/vuejs/pinia/releases/tag/v4.0.2)
- [固定 commit](https://github.com/vuejs/pinia/commit/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1)
- [`src/index.ts@ae4e3b2`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/index.ts)
- 本地 `node_modules/pinia/dist/pinia.d.ts` 与 `dist/pinia.js`

### 固定源码

- [`types.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/types.ts)
- [`rootStore.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/rootStore.ts)
- [`createPinia.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/createPinia.ts)
- [`store.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts)
- [`storeToRefs.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/storeToRefs.ts)

### 固定官方测试

- [`storeSetup.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/storeSetup.spec.ts)
- [`state.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/state.spec.ts)
- [`store.patch.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/store.patch.spec.ts)
- [`store.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/store.spec.ts)
- [`storeToRefs.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/storeToRefs.spec.ts)
- [`subscriptions.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/subscriptions.spec.ts)
- [`actions.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/actions.spec.ts)
- [`onAction.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/onAction.spec.ts)
- [`lifespan.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/lifespan.spec.ts)

本文到此停止；未授权实施 PRA1，更未授权进入 PRA2。
