---
id: vue.pinia.reference.plugins.plugin-contracts
type: reference
title: Pinia 插件与类型扩展契约
summary: 查询 Pinia plugin 的安装时序、context、返回扩展、state 双写与类型扩展边界
domain: frontend
technology: vue
module: pinia
related:
  - vue.pinia.reference.core.pinia-instance
  - vue.pinia.reference.stores.define-store
  - vue.pinia.reference.stores.store-to-refs
  - vue.pinia.learn.advanced.plugins-persistence
  - vue.pinia.learn.advanced.store-testing
tags:
  - Pinia
  - PiniaPlugin
  - plugin context
  - declaration merging
  - $state
  - SSR
appliesTo: Pinia 4.0.2
verifiedAt: 2026-08-05
sources:
  - title: Pinia API：DefineStoreOptionsInPlugin
    url: https://pinia.vuejs.org/api/pinia/interfaces/DefineStoreOptionsInPlugin.html
  - title: Pinia API：PiniaCustomProperties
    url: https://pinia.vuejs.org/api/pinia/interfaces/PiniaCustomProperties.html
  - title: Pinia API：PiniaCustomStateProperties
    url: https://pinia.vuejs.org/api/pinia/interfaces/PiniaCustomStateProperties.html
  - title: Pinia API：PiniaPlugin
    url: https://pinia.vuejs.org/api/pinia/interfaces/PiniaPlugin.html
  - title: Pinia API：PiniaPluginContext
    url: https://pinia.vuejs.org/api/pinia/interfaces/PiniaPluginContext.html
  - title: Pinia Guide：Plugins
    url: https://pinia.vuejs.org/core-concepts/plugins.html
  - title: Pinia 4.0.2：types.ts 固定源码
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/types.ts
  - title: Pinia 4.0.2：rootStore.ts 固定源码
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/rootStore.ts
  - title: Pinia 4.0.2：createPinia.ts 固定源码
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/createPinia.ts
  - title: Pinia 4.0.2：store.ts 固定源码
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts
  - title: Pinia 4.0.2：storePlugins 官方测试
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/storePlugins.spec.ts
group: plugins
signature: |-
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
anchors:
  - 概述
  - Pinia Plugin
  - Pinia Plugin Context
  - Define Store Options In Plugin
  - Pinia Custom Properties
  - Pinia Custom State Properties
  - 安装时序与 Context Identity
  - 返回扩展与 Devtools 可见性
  - State 双写、SSR 与 Hydration
  - TypeScript Declaration Merging
  - 清理责任与 Evidence 边界
  - 易错使用提示
  - 源码推导与适用场景
---

# Pinia 插件与类型扩展契约

## 一、概述

Pinia plugin 在 Store 创建时扩展实例。公开契约由 PiniaPlugin、PiniaPluginContext、plugin-facing options 与两个 declaration merging 接口组成；下划线 helper 只还原发布签名的约束关系，不是应用层推荐 import。

:::tip
先完成 pinia.use(plugin) 与 app.use(pinia)，再创建 Store。插件不会事后补扩展已经存在的 Store。
:::

## 二、Pinia Plugin

PiniaPlugin 是接收 PiniaPluginContext 的函数。它可以返回 PiniaCustomProperties 与 PiniaCustomStateProperties 的 partial 扩展，也可以返回 void。返回对象会被合并到当前 Store，而不是创建另一个 Store identity。

~~~~ts
import type { PiniaPlugin } from 'pinia'

const installAudit: PiniaPlugin = ({ store }) => {
  return { auditLabel: store.$id }
}
~~~~

## 三、Pinia Plugin Context

| 字段 | identity | 公开含义 |
| --- | --- | --- |
| pinia | 当前 Pinia 实例本身 | 与创建当前 Store 时显式或注入取得的实例相同 |
| app | pinia 安装到的 Vue App 本身 | 不是复制的配置快照 |
| store | 当前新建 Store 本身 | 返回扩展最终合并到这个对象 |
| options | 当前 definition 的 plugin-facing options | Options 与 Setup Store 都提供 actions |

四个字段都属于当前创建操作。pinia、app、store 保持对象 identity；options 是归一化后的读取面。插件可以按 app 或 store 分支，但不能把它们当作跨应用全局对象。

## 四、Define Store Options In Plugin

DefineStoreOptionsInPlugin 保留定义选项并保证 actions 存在。Options Store 的 actions 来自定义对象；Setup Store 的函数在 useStore() 建立期间被提取为 action map。自定义 defineStore() 选项应通过 DefineStoreOptionsBase&lt;S, Store&gt; declaration merging 声明，再从 context.options 读取。

:::warning
不要把 DefineStoreOptionsInPlugin 当成应用传入的第二份配置，也不要要求 Setup Store 作者手写 actions 字段。
:::

## 五、Pinia Custom Properties

PiniaCustomProperties 描述直接添加到每个 Store 的属性，保留 Id、S、G、A 四个泛型。它适合 router、service 或派生 metadata 等非 state 扩展，但 runtime 仍必须由 plugin 返回或赋值。

## 六、Pinia Custom State Properties

PiniaCustomStateProperties 只描述每个 store.$state 中新增的 state，并只接收 S 泛型。声明该接口不会创建字段；runtime plugin 必须初始化共享 state 并暴露同一响应式来源。

## 七、安装时序与 Context Identity

~~~~ts
const pinia = createPinia()
pinia.use(plugin)
app.use(pinia)

const store = useAccountStore(pinia)
~~~~

app 安装前调用 pinia.use(plugin) 会先排队，install 时再登记；稳定契约仍是 app.use(pinia) 后创建 Store。安装前创建的 Store不会因队列稍后刷新而补装，已有 Store 也不会因后来 use() 而 retroactive 扩展。

## 八、返回扩展与 Devtools 可见性

返回对象是公开的扩展路径，Pinia 会把 key 合并到 Store；开发构建也会据此跟踪自定义属性。直接写 store.foo 时，只有确实需要 Devtools custom key 的专用开发路径才登记该 key；不要读取或修改内部 plugin registry。

:::warning
返回属性可被 Devtools 跟踪是上游 contract 条件，不等于本页运行过真实 Vue Devtools client。本页的 Devtools 证据保持 Deferred/not-run。
:::

## 九、State 双写、SSR 与 Hydration

~~~~ts
if (!Object.prototype.hasOwnProperty.call(store.$state, 'pluginState')) {
  store.$state.pluginState = initialPluginState
}
store.pluginState = toRef(store.$state, 'pluginState')
~~~~

先初始化 store.$state，再用 toRef 让 store.pluginState 指向同一来源，才能同时保持 Store surface、Devtools state section、SSR serialization 与 Hydration 恢复的一致性。存在性保护避免覆盖已经恢复的 state；两处不是两份独立数据。

plugin 建立期间的 state change 发生在 Store active 前，不能写成必然触发 $subscribe() 的业务 mutation。本页没有运行宿主 SSR、HTML escaping、Vue hydration 或真实 Devtools，相关 runtime 证据均为 Deferred/not-run。

## 十、TypeScript Declaration Merging

~~~~ts
import 'pinia'

declare module 'pinia' {
  export interface PiniaCustomProperties<
    Id extends string,
    S extends StateTree,
    G,
    A,
  > {
    auditLabel: string
  }
}
~~~~

augmentation 的泛型名与顺序必须匹配官方声明，尤其保留 Id、S、G、A。declaration merging 只建立 compile-time contract，不会自动创建 runtime property；plugin 的 runtime 返回值也不会自动补齐 TypeScript 类型，两侧必须成对。

## 十一、清理责任与 Evidence 边界

Pinia 管理 Store 自身 scope，但不会自动清理 plugin 创建的 storage listener、timer 或 network observer。plugin 应包装 store.$dispose() 或保存 owner-level stop，并在宿主 teardown 时幂等调用。不要把内部 plugin 列表提升为清理 API。

固定官方源码与 storePlugins.spec.ts 支撑安装时序、context identity 和 options shape；本站 focused seam 只证明 catalog、正文与 anchors。本页未执行真实 plugin、SSR、Devtools 或 owner teardown，均为 Deferred/not-run。

## 十二、易错使用提示

:::pitfalls
### 在安装与登记前创建 Store

**触发条件：** 在安装与登记前创建 Store

**原因：** Store 创建时才遍历已登记的 plugin。

**后果：** 当前实例没有预期 extension。

**错误示例：**

~~~~ts
const store = useStore(pinia)
pinia.use(plugin)
~~~~

**正确写法：**

~~~~ts
pinia.use(plugin)
app.use(pinia)
const store = useStore(pinia)
~~~~

**验证方式：** 对照正确写法验证结果。

### 期待后来登记会追溯扩展

**触发条件：** 期待后来登记会追溯扩展

**原因：** plugin 不 retroactive 处理已有 Store。

**后果：** 新旧 Store surface 不一致。

**错误示例：**

~~~~ts
const store = useStore(pinia)
pinia.use(plugin)
~~~~

**正确写法：**

~~~~ts
// 在 bootstrap 阶段冻结所有 plugin 登记
~~~~

**验证方式：** 对照正确写法验证结果。

### 混淆 plugin queue 与 Store 创建

**触发条件：** 混淆 plugin queue 与 Store 创建

**原因：** app 安装前可以排队，不代表安装前创建的 Store会应用 plugin。

**后果：** 测试与应用得到不同扩展结果。

**错误示例：**

~~~~ts
pinia.use(plugin)
const store = useStore(pinia)
~~~~

**正确写法：**

~~~~ts
pinia.use(plugin)
app.use(pinia)
useStore(pinia)
~~~~

**验证方式：** 对照正确写法验证结果。

### 误读 Setup Store options

**触发条件：** 误读 Setup Store options

**原因：** Setup actions 是创建 Store 时提取的 plugin-facing map。

**后果：** 包装 action 时遗漏 Setup Store。

**错误示例：**

~~~~ts
if (!options.state) return
~~~~

**正确写法：**

~~~~ts
for (const action of Object.values(options.actions)) wrap(action)
~~~~

**验证方式：** 对照正确写法验证结果。

### 只完成类型或 runtime 一侧

**触发条件：** 只完成类型或 runtime 一侧

**原因：** declaration merging 与 plugin 实现承担不同职责。

**后果：** 运行时缺属性或 TypeScript 报错。

**错误示例：**

~~~~ts
declare module 'pinia' { /* 只有类型 */ }
~~~~

**正确写法：**

~~~~ts
declare module 'pinia' {
  interface PiniaCustomProperties<
    Id extends string,
    S extends StateTree,
    G,
    A,
  > {
    auditLabel: string
  }
}
pinia.use(({ store }) => ({ auditLabel: store.$id }))
~~~~

**验证方式：** 对照正确写法验证结果。

### 改动 augmentation 泛型名

**触发条件：** 改动 augmentation 泛型名

**原因：** 声明合并要求泛型参数匹配官方声明。

**后果：** module augmentation 无法正确合并。

**错误示例：**

~~~~ts
interface PiniaCustomProperties<id, state, getters, actions>
~~~~

**正确写法：**

~~~~ts
interface PiniaCustomProperties<Id, S, G, A>
~~~~

**验证方式：** 对照正确写法验证结果。

### 直接赋值并假设 Devtools 自动跟踪

**触发条件：** 直接赋值并假设 Devtools 自动跟踪

**原因：** 返回对象才是自动登记 custom key 的推荐路径。

**后果：** 开发工具看不到预期自定义属性。

**错误示例：**

~~~~ts
store.auditLabel = label
~~~~

**正确写法：**

~~~~ts
return { auditLabel: label }
~~~~

**验证方式：** 对照正确写法验证结果。

### 只写 Store property

**触发条件：** 只写 Store property

**原因：** plugin state 还必须进入 store.$state。

**后果：** SSR、Hydration 与 Devtools state section 缺字段。

**错误示例：**

~~~~ts
store.pluginState = ref(initialPluginState)
~~~~

**正确写法：**

~~~~ts
store.$state.pluginState = initialPluginState
store.pluginState = toRef(store.$state, 'pluginState')
~~~~

**验证方式：** 对照正确写法验证结果。

### 覆盖已恢复 state 或制造双 identity

**触发条件：** 覆盖已恢复 state 或制造双 identity

**原因：** 恢复值要保留，两个访问面应共享同一来源。

**后果：** Store property 与 $state 分叉。

**错误示例：**

~~~~ts
store.pluginState = ref(initialPluginState)
~~~~

**正确写法：**

~~~~ts
if (!('pluginState' in store.$state)) store.$state.pluginState = initialPluginState
store.pluginState = toRef(store.$state, 'pluginState')
~~~~

**验证方式：** 对照正确写法验证结果。

### 丢弃外部资源 teardown

**触发条件：** 丢弃外部资源 teardown

**原因：** Pinia 不拥有 plugin 建立的浏览器或网络资源。

**后果：** Store 重建后 listener 或 timer 重复执行。

**错误示例：**

~~~~ts
addEventListener(name, listener)
~~~~

**正确写法：**

~~~~ts
store.$dispose = wrapDispose(store.$dispose, stopListener)
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 十三、源码推导与适用场景

:::steps
### 1. 安装前登记进入队列

createPinia() 的 use() 在 app 未安装时暂存 plugin，install() 再刷入列表；适用于应用 bootstrap、测试 fixture 和多 app 初始化。

### 2. 创建 Store 时应用 plugin

Store 创建阶段遍历当前 plugin 列表，因此已有实例不会被后来登记追溯修改；适用于冻结插件安装顺序。

### 3. Context 保持当前对象 identity

固定源码把当前 pinia、app、store 与 options 传给 extender；适用于按 app 或 store 做实例级分支。

### 4. Setup actions 由 Pinia 提取

plugin-facing options 先有空 actions，再收集 Setup Store 返回函数；适用于统一包装两类 Store action。

### 5. 返回对象形成公开扩展面

extensions 在 Store scope 内创建并 assign 到 Store，开发模式登记返回 key；适用于 router、service 与 metadata 扩展。

### 6. State 双写共享一个来源

官方 Guide 先保护 $state，再用 toRef 连接 Store；适用于 SSR 恢复、Devtools state 与持久化。

### 7. 类型扩展需要 runtime 配对

两个 custom interface 默认为空，PiniaPlugin 返回类型引用它们；适用于建立 compile-time API 而不扩大 stable exports。

### 8. 上游测试不等于本站 runtime

官方测试覆盖 identity、options 与安装时序；适用于审计文档事实，不能替代真实 plugin、SSR 或 Devtools 证据。
:::
