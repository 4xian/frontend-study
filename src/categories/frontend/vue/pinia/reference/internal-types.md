---
id: vue.pinia.reference.boundaries.internal-types
type: reference
title: Pinia Internal Types Watchlist
summary: 集中查询 Pinia 4.0.2 的 24 个 internal 类型、所在公开签名与稳定替代
domain: frontend
technology: vue
module: pinia
related:
  - vue.pinia.reference.stores.store-shape
  - vue.pinia.reference.stores.store-to-refs
  - vue.pinia.reference.observation.subscriptions
  - vue.pinia.reference.options-api.map-helpers
tags:
  - Pinia
  - internal
  - restricted
  - watchlist
  - _StoreOnActionListenerContext
  - _StoreWithState
  - _SubscriptionCallbackMutationBase
  - _ActionsTree
  - _DeepPartial
  - _ExtractActionsFromSetupStore
  - _ExtractActionsFromSetupStore_Keys
  - _ExtractGettersFromSetupStore
  - _ExtractGettersFromSetupStore_Keys
  - _ExtractStateFromSetupStore
  - _ExtractStateFromSetupStore_Keys
  - _GettersTree
  - _MapActionsObjectReturn
  - _MapActionsReturn
  - _MapStateObjectReturn
  - _MapStateReturn
  - _MapWritableStateObjectReturn
  - _MapWritableStateReturn
  - _Method
  - _Spread
  - _StoreObject
  - _StoreWithActions
  - _StoreWithGetters
  - _UnwrapAll
appliesTo: Pinia 4.0.2
verifiedAt: 2026-08-05
sources:
  - title: Pinia API 根索引
    url: https://pinia.vuejs.org/api/pinia/
  - title: Pinia 4.0.2：types.ts 固定源码
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/types.ts
  - title: Pinia 4.0.2：mapHelpers.ts 固定源码
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/mapHelpers.ts
  - title: Pinia 4.0.2：storeToRefs.ts 固定源码
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/storeToRefs.ts
  - title: Pinia API：_StoreOnActionListenerContext
    url: https://pinia.vuejs.org/api/pinia/interfaces/StoreOnActionListenerContext.html
  - title: Pinia API：_StoreWithState
    url: https://pinia.vuejs.org/api/pinia/interfaces/StoreWithState.html
  - title: Pinia API：_SubscriptionCallbackMutationBase
    url: https://pinia.vuejs.org/api/pinia/interfaces/SubscriptionCallbackMutationBase.html
  - title: Pinia API：_ActionsTree
    url: https://pinia.vuejs.org/api/pinia/type-aliases/ActionsTree.html
  - title: Pinia API：_DeepPartial
    url: https://pinia.vuejs.org/api/pinia/type-aliases/DeepPartial.html
  - title: Pinia API：_ExtractActionsFromSetupStore
    url: https://pinia.vuejs.org/api/pinia/type-aliases/ExtractActionsFromSetupStore.html
  - title: Pinia API：_ExtractActionsFromSetupStore_Keys
    url: https://pinia.vuejs.org/api/pinia/type-aliases/ExtractActionsFromSetupStore_Keys.html
  - title: Pinia API：_ExtractGettersFromSetupStore
    url: https://pinia.vuejs.org/api/pinia/type-aliases/ExtractGettersFromSetupStore.html
  - title: Pinia API：_ExtractGettersFromSetupStore_Keys
    url: https://pinia.vuejs.org/api/pinia/type-aliases/ExtractGettersFromSetupStore_Keys.html
  - title: Pinia API：_ExtractStateFromSetupStore
    url: https://pinia.vuejs.org/api/pinia/type-aliases/ExtractStateFromSetupStore.html
  - title: Pinia API：_ExtractStateFromSetupStore_Keys
    url: https://pinia.vuejs.org/api/pinia/type-aliases/ExtractStateFromSetupStore_Keys.html
  - title: Pinia API：_GettersTree
    url: https://pinia.vuejs.org/api/pinia/type-aliases/GettersTree.html
  - title: Pinia API：_MapActionsObjectReturn
    url: https://pinia.vuejs.org/api/pinia/type-aliases/MapActionsObjectReturn.html
  - title: Pinia API：_MapActionsReturn
    url: https://pinia.vuejs.org/api/pinia/type-aliases/MapActionsReturn.html
  - title: Pinia API：_MapStateObjectReturn
    url: https://pinia.vuejs.org/api/pinia/type-aliases/MapStateObjectReturn.html
  - title: Pinia API：_MapStateReturn
    url: https://pinia.vuejs.org/api/pinia/type-aliases/MapStateReturn.html
  - title: Pinia API：_MapWritableStateObjectReturn
    url: https://pinia.vuejs.org/api/pinia/type-aliases/MapWritableStateObjectReturn.html
  - title: Pinia API：_MapWritableStateReturn
    url: https://pinia.vuejs.org/api/pinia/type-aliases/MapWritableStateReturn.html
  - title: Pinia API：_Method
    url: https://pinia.vuejs.org/api/pinia/type-aliases/Method.html
  - title: Pinia API：_Spread
    url: https://pinia.vuejs.org/api/pinia/type-aliases/Spread.html
  - title: Pinia API：_StoreObject
    url: https://pinia.vuejs.org/api/pinia/type-aliases/StoreObject.html
  - title: Pinia API：_StoreWithActions
    url: https://pinia.vuejs.org/api/pinia/type-aliases/StoreWithActions.html
  - title: Pinia API：_StoreWithGetters
    url: https://pinia.vuejs.org/api/pinia/type-aliases/StoreWithGetters.html
  - title: Pinia API：_UnwrapAll
    url: https://pinia.vuejs.org/api/pinia/type-aliases/UnwrapAll.html
group: boundaries
signature: |-
  restricted watchlist: 3 internal interfaces + 21 internal type aliases
  stable Reference Overview: 41 / 41（本页不进入稳定分母）
anchors:
  - 概述
  - Internal Store On Action Listener Context
  - Internal Store With State
  - Internal Subscription Callback Mutation Base
  - Internal Actions Tree
  - Internal Deep Partial
  - Internal Extract Actions From Setup Store
  - Internal Extract Actions From Setup Store Keys
  - Internal Extract Getters From Setup Store
  - Internal Extract Getters From Setup Store Keys
  - Internal Extract State From Setup Store
  - Internal Extract State From Setup Store Keys
  - Internal Getters Tree
  - Internal Map Actions Object Return
  - Internal Map Actions Return
  - Internal Map State Object Return
  - Internal Map State Return
  - Internal Map Writable State Object Return
  - Internal Map Writable State Return
  - Internal Method
  - Internal Spread
  - Internal Store Object
  - Internal Store With Actions
  - Internal Store With Getters
  - Internal Unwrap All
  - 易错使用提示
  - 源码推导与适用场景
---

# Pinia Internal Types Watchlist

## 一、概述

本页只登记 Pinia 4.0.2 根发布物仍导出的 24 个 internal 类型。它们解释公开 Store、订阅、Setup Store 推断、map helpers 与 storeToRefs 的声明如何组装，但 sourceTag 始终是 internal，不属于 41 个稳定 Reference 项。

:::warning
sourceTag: internal。应用代码不要 import 下列名称；发布物可导出不等于兼容性承诺。应优先使用每项列出的公开类型、helper 或具体 Store 推断结果。
:::

## 二、Internal Store On Action Listener Context

| 名称 | sourceTag | 固定源码说明 | 所在公开签名 | 公开替代 |
| --- | --- | --- | --- | --- |
| _StoreOnActionListenerContext | internal | `src/types.ts` 组合 action name、store、args、after 与 onError 的内部泛型上下文。 | `StoreOnActionListenerContext`、`StoreOnActionListener` 与 `$onAction()` | 让 `$onAction()` 回调直接推断，或使用 `StoreOnActionListenerContext`。 |

## 三、Internal Store With State

| 名称 | sourceTag | 固定源码说明 | 所在公开签名 | 公开替代 |
| --- | --- | --- | --- | --- |
| _StoreWithState | internal | `src/types.ts` 汇集 `$state/$patch/$reset/$subscribe/$dispose` 的内部 Store 基座。 | `Store`、`StoreGeneric` 与 `StoreDefinition` 的实例返回值 | 使用 `ReturnType&lt;typeof useStore&gt;`、`Store` 或 `StoreGeneric`。 |

## 四、Internal Subscription Callback Mutation Base

| 名称 | sourceTag | 固定源码说明 | 所在公开签名 | 公开替代 |
| --- | --- | --- | --- | --- |
| _SubscriptionCallbackMutationBase | internal | `src/types.ts` 为三种公开 mutation 分支提供 type、storeId 与 dev-only events。 | `SubscriptionCallbackMutationDirect/PatchObject/PatchFunction` | 使用公开联合 `SubscriptionCallbackMutation&lt;S&gt;` 做分支收窄。 |

## 五、Internal Actions Tree

| 名称 | sourceTag | 固定源码说明 | 所在公开签名 | 公开替代 |
| --- | --- | --- | --- | --- |
| _ActionsTree | internal | `src/types.ts` 以字符串到 `_Method` 的记录作为内部 action 默认约束。 | `StoreDefinition`、`StoreGeneric`、`StoreOnActionListener` | 让 `defineStore()` 推断 actions，读取时使用 `StoreActions&lt;SS&gt;`。 |

## 六、Internal Deep Partial

| 名称 | sourceTag | 固定源码说明 | 所在公开签名 | 公开替代 |
| --- | --- | --- | --- | --- |
| _DeepPartial | internal | `src/types.ts` 递归放宽 `$patch()` object 与 patch-object payload 的字段。 | `Store.$patch()`、`SubscriptionCallbackMutationPatchObject&lt;S&gt;` | 直接让 `$patch({ ... })` 校验输入，订阅侧使用公开 patch-object 类型。 |

## 七、Internal Extract Actions From Setup Store

| 名称 | sourceTag | 固定源码说明 | 所在公开签名 | 公开替代 |
| --- | --- | --- | --- | --- |
| _ExtractActionsFromSetupStore | internal | `src/types.ts` 从 Setup Store 返回对象挑出 action，供定义返回类型内部组装。 | `SetupStoreDefinition`、Setup 形式 `defineStore()` | 从 Store 实例读取 `StoreActions&lt;ReturnType&lt;typeof useStore&gt;&gt;`。 |

## 八、Internal Extract Actions From Setup Store Keys

| 名称 | sourceTag | 固定源码说明 | 所在公开签名 | 公开替代 |
| --- | --- | --- | --- | --- |
| _ExtractActionsFromSetupStore_Keys | internal | `src/types.ts` 用 key remapping 选择 Setup Store 返回对象中的函数键。 | Setup 形式 `defineStore()`、`SetupStoreDefinition`、`StoreActions&lt;SS&gt;` | 让 `defineStore()` 推断；消费结果时使用 `StoreActions&lt;SS&gt;`。 |

## 九、Internal Extract Getters From Setup Store

| 名称 | sourceTag | 固定源码说明 | 所在公开签名 | 公开替代 |
| --- | --- | --- | --- | --- |
| _ExtractGettersFromSetupStore | internal | `src/types.ts` 从 Setup Store 返回对象挑出 computed getters。 | `SetupStoreDefinition`、Setup 形式 `defineStore()` | 从 Store 实例读取 `StoreGetters&lt;ReturnType&lt;typeof useStore&gt;&gt;`。 |

## 十、Internal Extract Getters From Setup Store Keys

| 名称 | sourceTag | 固定源码说明 | 所在公开签名 | 公开替代 |
| --- | --- | --- | --- | --- |
| _ExtractGettersFromSetupStore_Keys | internal | `src/types.ts` 用 key remapping 选择 Setup Store 返回对象中的 ComputedRef 键。 | Setup 形式 `defineStore()`、`SetupStoreDefinition`、`StoreGetters&lt;SS&gt;` | 让 `defineStore()` 推断；消费结果时使用 `StoreGetters&lt;SS&gt;`。 |

## 十一、Internal Extract State From Setup Store

| 名称 | sourceTag | 固定源码说明 | 所在公开签名 | 公开替代 |
| --- | --- | --- | --- | --- |
| _ExtractStateFromSetupStore | internal | `src/types.ts` 从 Setup Store 返回对象挑出既非方法也非 computed 的 state。 | `SetupStoreDefinition`、Setup 形式 `defineStore()` | 从 Store 实例读取 `StoreState&lt;ReturnType&lt;typeof useStore&gt;&gt;`。 |

## 十二、Internal Extract State From Setup Store Keys

| 名称 | sourceTag | 固定源码说明 | 所在公开签名 | 公开替代 |
| --- | --- | --- | --- | --- |
| _ExtractStateFromSetupStore_Keys | internal | `src/types.ts` 用 key remapping 排除方法与 ComputedRef 键。 | Setup 形式 `defineStore()`、`SetupStoreDefinition`、`StoreState&lt;SS&gt;` | 让 `defineStore()` 推断；消费结果时使用 `StoreState&lt;SS&gt;`。 |

## 十三、Internal Getters Tree

| 名称 | sourceTag | 固定源码说明 | 所在公开签名 | 公开替代 |
| --- | --- | --- | --- | --- |
| _GettersTree | internal | `src/types.ts` 表达 Options getter 的 state 参数或无参 getter 内部约束。 | `Store`、`StoreDefinition`、map helpers 的泛型约束 | 在 `defineStore()` 中声明 getters，并用 `StoreGetters&lt;SS&gt;` 读取结果。 |

## 十四、Internal Map Actions Object Return

| 名称 | sourceTag | 固定源码说明 | 所在公开签名 | 公开替代 |
| --- | --- | --- | --- | --- |
| _MapActionsObjectReturn | internal | `src/mapHelpers.ts` 按 object mapper 的新键名重组 action 返回类型。 | `mapActions(useStore, { localName: actionName })` | 直接调用 `mapActions()` object overload，让调用结果自行推断。 |

## 十五、Internal Map Actions Return

| 名称 | sourceTag | 固定源码说明 | 所在公开签名 | 公开替代 |
| --- | --- | --- | --- | --- |
| _MapActionsReturn | internal | `src/mapHelpers.ts` 保留 array overload 选中的 action 键与函数签名。 | `mapActions(useStore, [actionName])` | 直接调用 `mapActions()` array overload，让调用结果自行推断。 |

## 十六、Internal Map State Object Return

| 名称 | sourceTag | 固定源码说明 | 所在公开签名 | 公开替代 |
| --- | --- | --- | --- | --- |
| _MapStateObjectReturn | internal | `src/mapHelpers.ts` 把 object mapper 转为 Options API computed getter 集合。 | `mapState(useStore, { localName: stateOrGetter })` | 直接调用 `mapState()` object overload，让调用结果自行推断。 |

## 十七、Internal Map State Return

| 名称 | sourceTag | 固定源码说明 | 所在公开签名 | 公开替代 |
| --- | --- | --- | --- | --- |
| _MapStateReturn | internal | `src/mapHelpers.ts` 把 array overload 的 state/getter 键转为 computed getter。 | `mapState(useStore, [stateOrGetter])` | 直接调用 `mapState()` array overload，让调用结果自行推断。 |

## 十八、Internal Map Writable State Object Return

| 名称 | sourceTag | 固定源码说明 | 所在公开签名 | 公开替代 |
| --- | --- | --- | --- | --- |
| _MapWritableStateObjectReturn | internal | `src/mapHelpers.ts` 为 object mapper 生成 computed getter/setter 对。 | `mapWritableState(useStore, { localName: stateName })` | 直接调用 `mapWritableState()` object overload，让结果自行推断。 |

## 十九、Internal Map Writable State Return

| 名称 | sourceTag | 固定源码说明 | 所在公开签名 | 公开替代 |
| --- | --- | --- | --- | --- |
| _MapWritableStateReturn | internal | `src/mapHelpers.ts` 为 array overload 生成选中 state 的 getter/setter 对。 | `mapWritableState(useStore, [stateName])` | 直接调用 `mapWritableState()` array overload，让结果自行推断。 |

## 二十、Internal Method

| 名称 | sourceTag | 固定源码说明 | 所在公开签名 | 公开替代 |
| --- | --- | --- | --- | --- |
| _Method | internal | `src/types.ts` 提供可推断参数与返回值的最宽内部函数约束。 | `StoreOnActionListener`、`StoreActions&lt;SS&gt;` 与 Setup Store action 推断链 | 为业务 action 写明确函数类型，或使用 `StoreActions&lt;SS&gt;`。 |

## 二十一、Internal Spread

| 名称 | sourceTag | 固定源码说明 | 所在公开签名 | 公开替代 |
| --- | --- | --- | --- | --- |
| _Spread | internal | `src/mapHelpers.ts` 递归合并多个 `_StoreObject`，形成 mapStores 返回对象。 | `mapStores(...stores)` | 直接调用 `mapStores()`，不要手写它的递归交叉类型。 |

## 二十二、Internal Store Object

| 名称 | sourceTag | 固定源码说明 | 所在公开签名 | 公开替代 |
| --- | --- | --- | --- | --- |
| _StoreObject | internal | `src/mapHelpers.ts` 把单个 StoreDefinition 转为带 suffix 的 computed 属性。 | `mapStores()` 返回对象中的单个 Store 项 | 使用 `mapStores()` 与公开 `MapStoresCustomization`。 |

## 二十三、Internal Store With Actions

| 名称 | sourceTag | 固定源码说明 | 所在公开签名 | 公开替代 |
| --- | --- | --- | --- | --- |
| _StoreWithActions | internal | `src/types.ts` 映射 action 的参数与返回值；固定声明只定义并导出该 alias，`Store` 直接交叉 `A`。 | 无；固定 `pinia.d.ts` 未由其他公开签名引用 | 使用 `Store`、`StoreActions&lt;SS&gt;` 或具体 Store 的返回类型。 |

## 二十四、Internal Store With Getters

| 名称 | sourceTag | 固定源码说明 | 所在公开签名 | 公开替代 |
| --- | --- | --- | --- | --- |
| _StoreWithGetters | internal | `src/types.ts` 合并 readonly 与 writable computed getter 的展开结果。 | `Store` | 使用 `Store`、`StoreGetters&lt;SS&gt;` 或具体 Store 的返回类型。 |

## 二十五、Internal Unwrap All

| 名称 | sourceTag | 固定源码说明 | 所在公开签名 | 公开替代 |
| --- | --- | --- | --- | --- |
| _UnwrapAll | internal | `src/types.ts` 逐键 UnwrapRef；`src/storeToRefs.ts` 用它识别 state ref 形态。 | `storeToRefs(store)` 返回值 | 调用 `storeToRefs()`，或使用 `StoreState&lt;SS&gt;` 等公开类型。 |

## 二十六、易错使用提示

:::pitfalls
### 把 internal 导出当成稳定应用契约

**触发条件：** 把 internal 导出当成稳定应用契约

**原因：** 根声明文件导出了 internal 名称，但注释仍明确标为 internal only。

**后果：** Pinia 升级可改变条件类型结构，应用公共类型随之破坏。

**错误示例：**

~~~~ts
type AppStore = _StoreWithState<'app', State, {}, {}>
~~~~

**正确写法：**

~~~~ts
type AppStore = ReturnType<typeof useAppStore>
~~~~

**验证方式：** 对照正确写法验证结果。

### 手写 map helper 返回类型

**触发条件：** 手写 map helper 返回类型

**原因：** helper overload 已负责键重命名、getter 与 setter 的精确推断。

**后果：** suffix、writable getter 或 object mapper 变化时本地类型立即漂移。

**错误示例：**

~~~~ts
type CountMap = _MapStateReturn<State, Getters>
~~~~

**正确写法：**

~~~~ts
const countMap = mapState(useCounterStore, ['count'])
~~~~

**验证方式：** 对照正确写法验证结果。

### 订阅只依赖 internal base

**触发条件：** 订阅只依赖 internal base

**原因：** base 没有三种公开 mutation 分支的精确 type 与 payload 差异。

**后果：** patch object payload 与不同 events 形态无法正确收窄。

**错误示例：**

~~~~ts
function inspect(mutation: _SubscriptionCallbackMutationBase) {}
~~~~

**正确写法：**

~~~~ts
function inspect(mutation: SubscriptionCallbackMutation<State>) {}
~~~~

**验证方式：** 对照正确写法验证结果。

### 复制 Setup Store 提取条件

**触发条件：** 复制 Setup Store 提取条件

**原因：** state、getters 与 actions 的分组规则属于 defineStore 的类型实现。

**后果：** ComputedRef、方法或未来返回形态变化时，复制类型与运行时 Store 不一致。

**错误示例：**

~~~~ts
type State = _ExtractStateFromSetupStore<SetupReturn>
~~~~

**正确写法：**

~~~~ts
type State = StoreState<ReturnType<typeof useStore>>
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 internal 类型数量加入稳定完成度

**触发条件：** 把 internal 类型数量加入稳定完成度

**原因：** 24 项属于独立 watchlist，不能进入公开 41 项 Overview。

**后果：** 覆盖率分母从 41 被错误扩大，稳定与 restricted 边界失真。

**错误示例：**

~~~~text
稳定 Reference：41 + 24 = 65
~~~~

**正确写法：**

~~~~text
稳定 Reference：41 / 41；restricted：26 / 26 documented
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 二十七、源码推导与适用场景

:::steps
### 1. 发布物导出与稳定性是两条轴

`dist/pinia.d.ts` 的 export clause 证明 24 个名称可从根入口解析；各声明的 internal 注释决定本站仍把它们留在 restricted watchlist。

### 2. Store 公共类型由多个 internal 片段组装

`Store` 交叉组合 state、getters 与 actions 内部片段。应用应依赖最终公开 Store 或具体 useStore 返回类型，而不是任一中间片段。

### 3. Setup Store 提取属于 defineStore 推断链

三组 keys 与三组 Pick 类型把 Setup 返回对象分为 state、computed getters 与 methods，再交给 SetupStoreDefinition；公开 StoreState、StoreGetters、StoreActions 已提供消费侧出口。

### 4. Map helper internal 类型只服务 overload 返回值

`mapStores()`、`mapState()`、`mapActions()` 与 `mapWritableState()` 的公开函数签名暴露输入和推断结果；内部映射类型会随 overload 实现演进，不需要成为应用显式注解。

### 5. storeToRefs 隐藏 ref 展开细节

`_UnwrapAll` 只参与 storeToRefs 的内部 state 识别。应用调用 `storeToRefs()`，不要从 Pinia 根入口显式导入 `StoreToRefs`。
:::
