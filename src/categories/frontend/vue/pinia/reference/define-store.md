---
id: vue.pinia.reference.stores.define-store
type: reference
title: 定义 Store
summary: 对照 Options Store 与 Setup Store，并理解 definition、实例化时机和扩展 seam
domain: frontend
technology: vue
module: pinia
related:
  - vue.pinia.reference.core.pinia-instance
  - vue.pinia.reference.stores.store-shape
  - vue.pinia.learn.basics.setup-first-store
  - vue.pinia.learn.intermediate.setup-stores
  - vue.pinia.learn.intermediate.store-composition
  - vue.pinia.learn.intermediate.store-modeling
tags:
  - Pinia
  - defineStore
  - DefineStoreOptions
  - DefineSetupStoreOptions
  - StoreDefinition
appliesTo: Pinia 4.0.2
verifiedAt: 2026-08-05
sources:
  - title: Pinia API：defineStore
    url: https://pinia.vuejs.org/api/pinia/functions/defineStore.html
  - title: Pinia API：DefineStoreOptions
    url: https://pinia.vuejs.org/api/pinia/interfaces/DefineStoreOptions.html
  - title: Pinia API：DefineSetupStoreOptions
    url: https://pinia.vuejs.org/api/pinia/interfaces/DefineSetupStoreOptions.html
  - title: Pinia API：DefineStoreOptionsBase
    url: https://pinia.vuejs.org/api/pinia/interfaces/DefineStoreOptionsBase.html
  - title: Pinia API：StoreDefinition
    url: https://pinia.vuejs.org/api/pinia/interfaces/StoreDefinition.html
  - title: Pinia API：SetupStoreDefinition
    url: https://pinia.vuejs.org/api/pinia/interfaces/SetupStoreDefinition.html
  - title: Pinia Guide：Defining a Store
    url: https://pinia.vuejs.org/core-concepts/
  - title: Pinia 4.0.2：store.ts 固定源码
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts
  - title: Pinia 4.0.2：Setup Store 官方测试
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/storeSetup.spec.ts
group: stores
signature: |-
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
anchors:
  - Define Store
  - Define Store Options
  - Define Setup Store Options
  - Define Store Options Base
  - Store Definition
  - Setup Store Definition
  - 易错使用提示
  - 源码推导与适用场景
---

# 定义 Store

## 一、Define Store

`defineStore()` 的两个 overload 共用一个稳定 store id：第二参数是对象时定义 Options Store，是函数时定义 Setup Store。调用只创建可复用的 definition；首次执行返回的 `useStore()` 才根据正确的 Pinia context 创建或取得实例。id 是 registry identity，必须在应用内稳定且唯一。

~~~~ts
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: {
    doubled: (state) => state.count * 2,
  },
  actions: {
    /** 将计数增加一次。 */
    increment() {
      this.count += 1
    },
  },
})
~~~~

## 二、Define Store Options

| 成员 | 类型角色 | 契约 |
| --- | --- | --- |
| state | () =&gt; S | 每个实例取得 fresh state；声明要求 arrow factory 以保持 this 类型 |
| getters | G & ThisType&lt;...&gt; | computed-like 派生值；this 可见 state 与其他 getters |
| actions | A & ThisType&lt;...&gt; | 方法 this 可见 state、getters、actions 与扩展属性 |
| hydrate? | (storeState, initialState) =&gt; void | Options Store 的复杂 SSR state hook；完整水合留给 PRA2 |

Options overload 的第二参数是去掉 `id` 的 `DefineStoreOptions`，因为 id 已作为第一个参数传入。`state/getters/actions` 是易读的定义输入，运行时最终仍收敛到统一 Store surface；`hydrate()` 这里只登记成员签名，不提前扩展 SSR/hydration Reference。

## 三、Define Setup Store Options

Setup overload 接收 setup function。返回的 ref/reactive 归入 state，computed 归入 getters，function 归入 actions；因此所有希望 Pinia 管理并用于 SSR、Devtools 或 plugin 的 state 都必须返回。第三参数是扩展选项，`actions?` 是实例化后提取给 plugin 的结果，用户定义 Setup Store 时不手写。

~~~~ts
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubled = computed(() => count.value * 2)

  /** 将计数增加一次。 */
  function increment() {
    count.value += 1
  }

  return { count, doubled, increment }
})
~~~~

## 四、Define Store Options Base

`DefineStoreOptionsBase&lt;S, Store&gt;` 在 4.0.2 中是空 interface，但它不是无意义占位：Options 与 Setup 的 options 都继承它，插件作者可通过 TypeScript declaration merging 添加共享选项。应用应扩展 public seam，不能用 internal `_Extract*` 类型拼接私有实现。`DefineStoreOptionsInPlugin` 属于 PRA3，不在本批上线。

## 五、Store Definition

~~~~ts
interface StoreDefinition<Id extends string, S extends StateTree, G, A> {
  (pinia?: Pinia | null, hot?: StoreGeneric): Store<Id, S, G, A>
  $id: Id
  /** @internal */
  _pinia?: Pinia
}
~~~~

`StoreDefinition` 是 `defineStore()` 返回的 callable。公开 surface 只有调用签名与 `$id`：调用时先解析显式 Pinia、injection 或 active context，再用 `$id` 查询 registry；没有实例时才创建。`hot` 参数与 `_pinia` 是 HMR internal，应用不得传入或读取。

## 六、Setup Store Definition

`SetupStoreDefinition&lt;Id, SS&gt;` 继承 `StoreDefinition`，只把 setup 返回面映射成 state、getter 与 action 类型，不增加 runtime wrapper 或新成员。公共 `StoreActions`、`StoreGetters`、`StoreState` 可用于提取结果；不要直接 import 未作为稳定根入口导出的 `_Extract*` 家族。

## 七、易错使用提示

:::pitfalls
### 复用同一个 Store id

**触发条件：** 复用同一个 Store id

**原因：** id 是 Pinia registry 中的稳定 identity。

**后果：** 两个定义会命中同一实例，state 与行为产生冲突。

**错误示例：**

~~~~ts
defineStore('account', adminOptions)
defineStore('account', userOptions)
~~~~

**正确写法：**

~~~~ts
defineStore('admin-account', adminOptions)
defineStore('user-account', userOptions)
~~~~

**验证方式：** 对照正确写法验证结果。

### 以为 defineStore() 会立即创建实例

**触发条件：** 以为 defineStore() 会立即创建实例

**原因：** 它只返回 definition，实例在首次 useStore() 时创建。

**后果：** 初始化副作用和 plugin 时序判断会提前。

**错误示例：**

~~~~ts
const useStore = defineStore('session', options)
// 以为实例已存在
~~~~

**正确写法：**

~~~~ts
const useStore = defineStore('session', options)
const store = useStore(pinia)
~~~~

**验证方式：** 对照正确写法验证结果。

### 混合 Options 与 Setup 形态

**触发条件：** 混合 Options 与 Setup 形态

**原因：** 第二参数必须在 object 与 function 两种 overload 中选一个。

**后果：** 类型推导失效，也无法确定 state 提取规则。

**错误示例：**

~~~~ts
defineStore('mixed', { state: () => ({}), setup() {} })
~~~~

**正确写法：**

~~~~ts
defineStore('options', { state: () => ({ ready: false }) })
~~~~

**验证方式：** 对照正确写法验证结果。

### 共享模块级 state 对象

**触发条件：** 共享模块级 state 对象

**原因：** Options Store 要求 fresh arrow factory。

**后果：** 测试、SSR request 或多个 Pinia 实例可能共享可变数据。

**错误示例：**

~~~~ts
const state = { count: 0 }
defineStore('counter', { state: () => state })
~~~~

**正确写法：**

~~~~ts
defineStore('counter', { state: () => ({ count: 0 }) })
~~~~

**验证方式：** 对照正确写法验证结果。

### 隐藏 Setup Store state

**触发条件：** 隐藏 Setup Store state

**原因：** Pinia 只扫描 setup 返回对象。

**后果：** SSR、Devtools 与 plugin 看不到未返回的 state。

**错误示例：**

~~~~ts
const count = ref(0)
return { increment }
~~~~

**正确写法：**

~~~~ts
const count = ref(0)
return { count, increment }
~~~~

**验证方式：** 对照正确写法验证结果。

### 手写 Setup options.actions

**触发条件：** 手写 Setup options.actions

**原因：** 该字段是创建后供 plugin 观察的提取结果。

**后果：** 定义输入与实际返回 actions 发生漂移。

**错误示例：**

~~~~ts
defineStore('counter', setup, { actions: { increment } })
~~~~

**正确写法：**

~~~~ts
defineStore('counter', setup)
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 SetupStoreDefinition 当作 runtime wrapper

**触发条件：** 把 SetupStoreDefinition 当作 runtime wrapper

**原因：** 它仅细化 TypeScript 提取结果。

**后果：** 产生多余封装并误判实例化时机。

**错误示例：**

~~~~ts
new SetupStoreDefinition()
~~~~

**正确写法：**

~~~~ts
const useStore = defineStore('counter', setup)
~~~~

**验证方式：** 对照正确写法验证结果。

### 依赖 hot、_pinia 或 _Extract 类型

**触发条件：** 依赖 hot、_pinia 或 _Extract 类型

**原因：** 这些 surface 服务 HMR 或内部类型计算。

**后果：** 应用会绑定到 minor 版本可变实现。

**错误示例：**

~~~~ts
useStore(pinia, hotStore)
useStore._pinia
~~~~

**正确写法：**

~~~~ts
const store = useStore(pinia)
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 八、源码推导与适用场景

:::steps
### 1. 第二参数决定定义分支

固定 `defineStore()` 以第二参数是否为 function 选择 Setup 或 Options 分支。两种 overload 是一个 API 的互斥入口，适合放在同一页对照。

### 2. definition 先解析实例上下文

返回的 `useStore()` 先解析显式 pinia、injection 或 active context，再按 `$id` 查询 registry。由此可区分 definition 与 store instance。

### 3. registry miss 才触发惰性创建

只有 `_s` 尚无当前 id 时才进入 `createSetupStore()` 或 `createOptionsStore()`；这适用于按 app 隔离和测试 fixture。

### 4. Options 输入收敛到统一 surface

Options 分支把 state 转 refs，并与 actions、computed getters 合并后交给统一创建器。使用者获得的实例 shape 与 Setup Store 一致。

### 5. Setup 返回值决定提取类别

固定实现将 ref/reactive 视为 state、computed 视为 getter、function 视为 action。官方 `$state` 测试支持“必须返回全部托管 state”的边界。

### 6. $id 是公开 identity

`defineStore()` 直接给 callable 赋 `$id`，而 `_pinia` 只在开发分支写入。业务和 helper 使用 `$id`，HMR 内部信息不对外承诺。

### 7. Base interface 承载类型扩展

`DefineStoreOptionsBase` 被两种 options 继承，构成 declaration-merging seam。它适用于插件类型预告，完整 plugin contract 留给 PRA3。
:::
