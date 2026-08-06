---
id: vue.pinia.reference.options-api.map-helpers
type: reference
title: Options API 映射 Helpers
summary: 查询 mapStores、state/action 映射、可写 setter、suffix 与迁移边界
domain: frontend
technology: vue
module: pinia
related:
  - vue.pinia.reference.core.pinia-instance
  - vue.pinia.reference.stores.define-store
  - vue.pinia.reference.stores.store-shape
  - vue.pinia.reference.stores.store-to-refs
  - vue.pinia.learn.basics.setup-first-store
tags:
  - Pinia
  - Options API
  - mapState
  - mapWritableState
  - mapActions
  - mapStores
  - mapGetters
appliesTo: Pinia 4.0.2
verifiedAt: 2026-08-05
sources:
  - title: Pinia API：MapStoresCustomization
    url: https://pinia.vuejs.org/api/pinia/interfaces/MapStoresCustomization.html
  - title: Pinia API：mapActions
    url: https://pinia.vuejs.org/api/pinia/functions/mapActions.html
  - title: Pinia API：mapState
    url: https://pinia.vuejs.org/api/pinia/functions/mapState.html
  - title: Pinia API：mapStores
    url: https://pinia.vuejs.org/api/pinia/functions/mapStores.html
  - title: Pinia API：mapWritableState
    url: https://pinia.vuejs.org/api/pinia/functions/mapWritableState.html
  - title: Pinia API：setMapStoreSuffix
    url: https://pinia.vuejs.org/api/pinia/functions/setMapStoreSuffix.html
  - title: Pinia API：mapGetters（deprecated）
    url: https://pinia.vuejs.org/api/pinia/variables/mapGetters.html
  - title: Pinia Guide：Usage without setup()
    url: https://pinia.vuejs.org/cookbook/options-api.html
  - title: Pinia Guide：State Usage with the Options API
    url: https://pinia.vuejs.org/core-concepts/state.html#usage-with-the-options-api
  - title: Pinia 4.0.2：mapHelpers.ts 固定源码
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/mapHelpers.ts
  - title: Pinia 4.0.2：types.ts 固定源码
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/types.ts
  - title: Pinia 4.0.2：mapHelpers 官方测试
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/mapHelpers.spec.ts
group: options-api
signature: |-
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
  >(useStore: StoreDefinition<Id, S, G, A>, keyMapper: KeyMapper):
    _MapStateObjectReturn<Id, S, G, A, KeyMapper>

  declare function mapState<
    Id extends string,
    S extends StateTree,
    G extends _GettersTree<S> | Record<string, ComputedRef>,
    A,
    Keys extends keyof S | keyof G,
  >(useStore: StoreDefinition<Id, S, G, A>, keys: readonly Keys[]):
    _MapStateReturn<S, G, Keys>

  declare function mapWritableState<
    Id extends string,
    S extends StateTree,
    G,
    A,
    KeyMapper extends Record<string, _MapWritableStateKeys<S, G>>,
  >(useStore: StoreDefinition<Id, S, G, A>, keyMapper: KeyMapper):
    _MapWritableStateObjectReturn<S, G, KeyMapper>

  declare function mapWritableState<
    Id extends string,
    S extends StateTree,
    G,
    A,
    Keys extends _MapWritableStateKeys<S, G>,
  >(useStore: StoreDefinition<Id, S, G, A>, keys: readonly Keys[]):
    Pick<_MapWritableStateReturn<S, G, Keys>, Keys>

  declare function mapActions<
    Id extends string,
    S extends StateTree,
    G extends _GettersTree<S>,
    A,
    KeyMapper extends Record<string, keyof A>,
  >(useStore: StoreDefinition<Id, S, G, A>, keyMapper: KeyMapper):
    _MapActionsObjectReturn<A, KeyMapper>

  declare function mapActions<
    Id extends string,
    S extends StateTree,
    G extends _GettersTree<S>,
    A,
  >(useStore: StoreDefinition<Id, S, G, A>, keys: Array<keyof A>):
    _MapActionsReturn<A>

  declare function mapStores<Stores extends any[]>(
    ...stores: [...Stores]
  ): _Spread<Stores>

  declare function setMapStoreSuffix(
    suffix: MapStoresCustomization extends Record<'suffix', infer Suffix>
      ? Suffix
      : string,
  ): void

  /** @deprecated use mapState() instead. */
  declare const mapGetters: typeof mapState
anchors:
  - 概述
  - Map State
  - Map Writable State
  - Map Actions
  - Map Stores
  - Set Map Store Suffix
  - Map Stores Customization
  - Options API 形状与 Mapper
  - Deprecated Map Getters
  - 全局 Suffix 与类型同步
  - Evidence 边界
  - 易错使用提示
  - 源码推导与适用场景
---

# Options API 映射 Helpers

## 概述

这些 helper 把 Pinia StoreDefinition 转成 Options API 的 computed 或 methods 选项。generated function 执行时都通过 useStore(this.$pinia) 取得当前组件所属 Pinia，而不是捕获某个全局 active singleton。

:::tip
下划线 return 与 constraint 类型只还原发布声明，不是推荐 import。应用通常只导入 mapState、mapWritableState、mapActions、mapStores 与 setMapStoreSuffix。
:::

## Map State

mapState() 返回可 spread 到 computed 的 getter object。array 形状映射 state 或 getter 并保留 key；object 形状可以改名，也可用 function mapper 从整个 Store 计算组件值。

~~~~ts
computed: {
  ...mapState(useAccountStore, ['name', 'displayName']),
  ...mapState(useAccountStore, {
    accountName: 'name',
    greeting(store) {
      return this.prefix + store.displayName
    },
  }),
}
~~~~

function mapper 通过 mapper.call(this, store) 执行。TypeScript 不会自动推导其中的组件 this；需要组件字段时使用普通 method shorthand，不要使用 arrow function 期待 this。

## Map Writable State

mapWritableState() 返回带 get 与 setter 的 computed descriptors，放在 computed。setter 直接赋值到 Store property，不代理 action，也不自动提供 validation、transaction 或业务事件。

~~~~ts
computed: {
  ...mapWritableState(useProfileStore, ['name']),
  ...mapWritableState(useProfileStore, { formName: 'name' }),
}
~~~~

readonly getter 不可写；state 与具有 setter 的 writable computed 才能映射。固定官方测试同时覆盖 array、object alias 和 Setup Store writable computed。

## Map Actions

mapActions() 返回可 spread 到 methods 的 method wrappers。array 直接保留 action 名；object 只建立组件方法名到 action 名的映射，并透传 arguments 与 return value，不接受 mapState 那种自定义 function mapper。

~~~~ts
methods: {
  ...mapActions(useCartStore, ['checkout']),
  ...mapActions(useCartStore, { submitOrder: 'checkout' }),
}
~~~~

## Map Stores

mapStores(useUserStore, useCartStore) 使用 rest Store definitions，并默认生成 userStore 与 cartStore computed getter。每个 getter 执行时调用 useStore(this.$pinia)，因此组件必须由 app.use(pinia) 获得 $pinia。

~~~~ts
computed: {
  ...mapStores(useUserStore, useCartStore),
}
~~~~

:::warning
不要把 [useUserStore, useCartStore] 作为唯一参数。固定开发构建会对 array fallback 发出诊断 warning，官方形状是逐个传入。
:::

## Set Map Store Suffix

setMapStoreSuffix(suffix) 修改 mapHelpers 模块级 suffix，默认值是 Store，也允许空字符串。它只影响后续 mapStores() 调用；已经生成的 mapping object key 在 helper 调用时已经冻结，不会被重命名。

~~~~ts
setMapStoreSuffix('_store')

const stores = mapStores(useUserStore)
// stores.user_store
~~~~

## Map Stores Customization

MapStoresCustomization 是用于 declaration merging 的空 interface。它只影响 mapStores 返回 key 的类型推导，runtime 不读取 augmentation；mapStoreSuffix 与 _Spread 等内部 helper 不进入稳定索引。

## Options API 形状与 Mapper

| helper | Options API 位置 | mapper 形状 | 执行上下文 |
| --- | --- | --- | --- |
| mapState | computed | array / object / function | useStore(this.$pinia) |
| mapWritableState | computed | array / object | get 与直接赋值 setter |
| mapActions | methods | array / object alias | 透传 arguments 与 return value |
| mapStores | computed | rest definitions | 按 Store id 与 suffix 生成 key |

这些函数服务 Options API 形状：state/getter 属于 computed，action 属于 methods，整个 Store 也以 computed getter 暴露。它们不会把组件局部逻辑复制进 Store，也不会改变 StoreDefinition。

## Deprecated Map Getters

:::warning
mapGetters 是 mapState 的同一 runtime value alias，官方 API 与 Guide 已标记 deprecated。保留相同参数，把 import 与调用名替换为 mapState()；该 warning 属于 restricted 账本，不进入 41 项 stable Overview。
:::

:::compare
### 错误写法

~~~~text
import { mapGetters } from 'pinia'
computed: { ...mapGetters(useStore, ['total']) }
~~~~

### 正确写法

~~~~text
import { mapState } from 'pinia'
computed: { ...mapState(useStore, ['total']) }
~~~~
:::

## 全局 Suffix 与类型同步

~~~~ts
import 'pinia'

declare module 'pinia' {
  export interface MapStoresCustomization {
    suffix: '_store'
  }
}

setMapStoreSuffix('_store')
~~~~

augmentation 与 runtime setMapStoreSuffix() 必须使用同一个 literal。global .d.ts 先 import pinia，避免覆盖模块声明。suffix 是同一 mapHelpers 模块内所有 app 共用的全局启动配置，不是 per-component 或 per-request state。

## Evidence 边界

固定 mapHelpers.ts 与官方测试支撑 array/object/function mapper、this.$pinia、setter、suffix 与 deprecated alias 的上游事实。本站 focused seam 只证明 Reference catalog、正文与 anchors。

本页没有运行真实 Options API SFC、suffix isolation 或浏览器交互，也没有证明不同 app 拥有独立 suffix；这些 runtime 证据均为 Deferred/not-run。

## 易错使用提示

:::pitfalls
### 把 helper 放错 Options 区域

**触发条件：** 把 helper 放错 Options 区域

**原因：** state/getter 是 computed，action 是 methods。

**后果：** 组件选项类型与调用语义错误。

**错误示例：**

~~~~ts
methods: { ...mapState(useStore, ['name']) }
~~~~

**正确写法：**

~~~~ts
computed: { ...mapState(useStore, ['name']) }
methods: { ...mapActions(useStore, ['save']) }
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 Store definitions 包成 array

**触发条件：** 把 Store definitions 包成 array

**原因：** mapStores 使用 rest definitions。

**后果：** 开发环境出现 warning，依赖不稳定 fallback。

**错误示例：**

~~~~ts
mapStores([useUserStore, useCartStore])
~~~~

**正确写法：**

~~~~ts
mapStores(useUserStore, useCartStore)
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 function mapper 中用 arrow 读取 this

**触发条件：** 在 function mapper 中用 arrow 读取 this

**原因：** arrow 不接收 mapper.call 提供的组件上下文。

**后果：** this 不指向当前 Options API 组件。

**错误示例：**

~~~~ts
label: (store) => this.prefix + store.name
~~~~

**正确写法：**

~~~~ts
label(store) {
  return this.prefix + store.name
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 mapActions object 当 function mapper

**触发条件：** 把 mapActions object 当 function mapper

**原因：** object value 只能是 action key。

**后果：** 函数被误当作 Store action 名。

**错误示例：**

~~~~ts
mapActions(useStore, { save: (store) => store.save() })
~~~~

**正确写法：**

~~~~ts
mapActions(useStore, { saveForm: 'save' })
~~~~

**验证方式：** 对照正确写法验证结果。

### 映射 readonly getter 为可写值

**触发条件：** 映射 readonly getter 为可写值

**原因：** readonly getter 没有 setter。

**后果：** 产生类型错误或不可写行为。

**错误示例：**

~~~~ts
mapWritableState(useStore, ['total'])
~~~~

**正确写法：**

~~~~ts
mapWritableState(useStore, ['draftName'])
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 writable setter 当作 action

**触发条件：** 把 writable setter 当作 action

**原因：** setter 直接给 Store property 赋值。

**后果：** 绕过业务 validation 与 transaction。

**错误示例：**

~~~~ts
this.draftName = uncheckedValue
~~~~

**正确写法：**

~~~~ts
this.updateDraftName(validatedValue)
~~~~

**验证方式：** 对照正确写法验证结果。

### 期待 suffix 追溯重命名

**触发条件：** 期待 suffix 追溯重命名

**原因：** mapping key 在 mapStores() 调用时生成。

**后果：** 已有 userStore key 保持旧名称。

**错误示例：**

~~~~ts
const mapped = mapStores(useUserStore)
setMapStoreSuffix('_store')
~~~~

**正确写法：**

~~~~ts
setMapStoreSuffix('_store')
const mapped = mapStores(useUserStore)
~~~~

**验证方式：** 对照正确写法验证结果。

### 只同步 suffix 的类型或 runtime

**触发条件：** 只同步 suffix 的类型或 runtime

**原因：** declaration merging 与模块变量相互独立。

**后果：** TypeScript key 与运行时 key 分叉。

**错误示例：**

~~~~ts
interface MapStoresCustomization { suffix: '_store' }
~~~~

**正确写法：**

~~~~ts
interface MapStoresCustomization { suffix: '_store' }
setMapStoreSuffix('_store')
~~~~

**验证方式：** 对照正确写法验证结果。

### 动态切换模块级 suffix

**触发条件：** 动态切换模块级 suffix

**原因：** 同一 mapHelpers 模块内所有 app 共用该值。

**后果：** mapping key 随调用顺序变化。

**错误示例：**

~~~~ts
setMapStoreSuffix(currentComponentSuffix)
~~~~

**正确写法：**

~~~~ts
// 应用 bootstrap 中只设置一次 suffix
~~~~

**验证方式：** 对照正确写法验证结果。

### 继续推荐 mapGetters

**触发条件：** 继续推荐 mapGetters

**原因：** 它是 deprecated 的 mapState alias。

**后果：** 新代码继续依赖 restricted surface。

**错误示例：**

~~~~ts
import { mapGetters } from 'pinia'
~~~~

**正确写法：**

~~~~ts
import { mapState } from 'pinia'
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 源码推导与适用场景

:::steps
### 1. State 映射属于 computed

mapState 的 array 与 object 分支都返回 getter function，并调用 useStore(this.$pinia)；适用于 Options API 读取 state 与 getter。

### 2. Function mapper 保留组件上下文

源码以 call(this, store) 执行 mapper；适用于结合 Store 与组件局部字段计算展示值。

### 3. Action 映射属于 methods

mapActions wrapper 透传参数与返回值，object 只做别名；适用于组件 methods 过渡层。

### 4. Writable 映射是直接 setter

mapWritableState 生成 get 与 set，固定测试还覆盖 Setup writable computed；适用于简单表单双向绑定。

### 5. Stores 使用 rest definitions

mapStores 立即按 Store id 与 suffix 生成 getter key，并通过 this.$pinia 取实例；适用于访问整个 Store surface。

### 6. Suffix 是模块级配置

setMapStoreSuffix() 直接修改模块变量，只影响后续 helper 调用；适用于应用 bootstrap 的单点配置。

### 7. 类型 suffix 不改变 runtime

MapStoresCustomization 只参与 conditional type，runtime 不读取声明；适用于维护 global.d.ts 与启动代码的一致 literal。

### 8. mapGetters 是名称迁移

固定源码令 mapGetters 与 mapState identity 相同，官方页面标记 deprecated；适用于无行为变化地迁移旧 Options API。
:::
