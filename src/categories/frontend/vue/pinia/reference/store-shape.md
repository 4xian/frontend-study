---
id: vue.pinia.reference.stores.store-shape
type: reference
title: Store 类型与实例 Surface
summary: 查询 Store 的类型组合、公开实例成员、提取类型与 internal/dev-only 边界
domain: frontend
technology: vue
module: pinia
related:
  - vue.pinia.reference.stores.define-store
  - vue.pinia.reference.stores.store-to-refs
  - vue.pinia.learn.basics.state-patch-reset
  - vue.pinia.learn.basics.getters
  - vue.pinia.learn.basics.actions-async
  - vue.pinia.learn.intermediate.setup-stores
  - vue.pinia.learn.intermediate.subscriptions-actions
tags:
  - Pinia
  - Store
  - StoreProperties
  - StoreActions
  - StoreGetters
  - StoreState
  - StoreGeneric
appliesTo: Pinia 4.0.2
verifiedAt: 2026-08-05
sources:
  - title: Pinia API：Store
    url: https://pinia.vuejs.org/api/pinia/type-aliases/Store.html
  - title: Pinia API：StoreProperties
    url: https://pinia.vuejs.org/api/pinia/interfaces/StoreProperties.html
  - title: Pinia API：StateTree
    url: https://pinia.vuejs.org/api/pinia/type-aliases/StateTree.html
  - title: Pinia API：StoreGeneric
    url: https://pinia.vuejs.org/api/pinia/type-aliases/StoreGeneric.html
  - title: Pinia API：StoreActions
    url: https://pinia.vuejs.org/api/pinia/type-aliases/StoreActions.html
  - title: Pinia API：StoreGetters
    url: https://pinia.vuejs.org/api/pinia/type-aliases/StoreGetters.html
  - title: Pinia API：StoreState
    url: https://pinia.vuejs.org/api/pinia/type-aliases/StoreState.html
  - title: Pinia Guide：State
    url: https://pinia.vuejs.org/core-concepts/state.html
  - title: Pinia Guide：Getters
    url: https://pinia.vuejs.org/core-concepts/getters.html
  - title: Pinia Guide：Actions
    url: https://pinia.vuejs.org/core-concepts/actions.html
  - title: Pinia 4.0.2：types.ts 固定源码
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/types.ts
  - title: Pinia 4.0.2：store.ts 固定源码
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts
  - title: Pinia 4.0.2：state 官方测试
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/state.spec.ts
  - title: Pinia 4.0.2：patch 官方测试
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/store.patch.spec.ts
  - title: Pinia 4.0.2：store 官方测试
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/store.spec.ts
  - title: Pinia 4.0.2：subscriptions 官方测试
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/subscriptions.spec.ts
  - title: Pinia 4.0.2：onAction 官方测试
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/onAction.spec.ts
group: stores
signature: |-
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
anchors:
  - State Tree
  - Store Type
  - Store Generic
  - Store Actions
  - Store Getters
  - Store State
  - Store Properties
  - 实例成员
  - 易错使用提示
  - 源码推导与适用场景
---

# Store 类型与实例 Surface

## State Tree

`StateTree` 是 `Record&lt;PropertyKey, any&gt;`，是 Pinia 公共泛型约束而不是推荐把业务 state 写成 `any`。实际 store 仍应让 `state()` 或 Setup 返回值推导精确字段；只有需要表达“任意 Pinia state shape”的基础设施才使用这个宽边界。

## Store Type

`Store` 是实例的完整交叉类型：基础 `$` 成员、解包后的 state、getters、actions，以及插件声明合并得到的 custom properties/state。上方签名是固定声明的可读摘要；应用不应直接导入 `_StoreWithState`、`_StoreWithGetters` 或 `_ActionsTree` 手工重建它。

:::tip
同一个 store 变量可以直接读取 state/getter 并调用 action，是类型组合与 reactive proxy 解包共同形成的 public surface。需要解构 state/getter 时，改用 `storeToRefs()` 保留响应式连接。
:::

## Store Generic

`StoreGeneric` 是 type-unsafe convenience：id 与 state/getter/action 都被放宽，允许字符串属性访问。它适合不关心具体 store shape 的诊断器、通用 plugin helper 或函数边界，不应替代业务层的精确 `ReturnType&lt;typeof useStore&gt;`。

## Store Actions

`StoreActions&lt;SS&gt;` 从 Options Store 的 actions 或 Setup Store 返回的 function 中提取公共 action shape。库代码需要只消费行为面时使用它；它是稳定根入口，优先于 internal `_ExtractActionsFromSetupStore`。

## Store Getters

`StoreGetters&lt;SS&gt;` 对 Options Store 提取 getters，对 Setup Store 提取 computed 返回面。它描述实例解包后的 getter 值类型；要在组件解构后保持 computed ref，使用 `storeToRefs()` 的返回值。

## Store State

`StoreState&lt;SS&gt;` 提取 Options 或 Setup Store 的 unwrapped state。它适合持久化 adapter、fixture 与函数参数的 state-only 约束；不要把类型提取等同于复制 state，也不要据此绕过 `$patch()` 的 mutation 语义。

## Store Properties

| 成员 | 分类 | 正文边界 |
| --- | --- | --- |
| $id | public | 稳定 store identity；常规应用可读 |
| _p | internal | store 所属 Pinia；不直接访问 |
| _getters? | internal | Devtools getter 名单；production 可移除 |
| _isOptionsAPI? | internal | Devtools 区分 Options 与 Setup |
| _hotUpdate() | internal | dev-only HMR 更新 |
| _hotUpdating | internal | HMR 期间暂停部分 watcher |
| _hmrPayload | internal | dev-only state/actions/getters payload |
| _customProperties | public specialized | 固定声明未标 internal；仅供插件登记 Devtools custom keys，不是业务 state 容器 |

## 实例成员

| 成员 | 公开契约 | 关键边界 |
| --- | --- | --- |
| $id | 稳定 store id | 与 StoreDefinition.$id 对应 |
| $state | 解包 state 与 custom state | 整体赋值内部走函数式 $patch()，不会替换 reactive object |
| $patch(object) | 合并 nested partial patch | subscription 可观察 payload |
| $patch(fn) | 成组同步修改同一 state | mutator 不得 async |
| $reset() | Options Store 重跑 state factory | Setup Store 默认不实现，需自定义 action |
| $subscribe() | 订阅 state mutation 并返回 unsubscribe | 组件 scope 默认清理；可 detached |
| $onAction() | action 前置与 after/onError 通道 | 可 detached，并返回 unsubscribe |
| $dispose() | 停止 store scope 并移出 registry | 不删除 pinia.state.value[id] |
| state/getter/action keys | 直接位于实例 surface | state/getter 解构规则见 storeToRefs 页 |

~~~~ts
const counter = useCounterStore()

counter.$patch({ count: 2 })
counter.$patch((state) => {
  state.count += 1
  state.lastChangedAt = Date.now()
})

const stop = counter.$subscribe((mutation, state) => {
  persist(state, mutation.type)
})

stop()
~~~~

`$subscribe()` 的 `detached` 决定是否脱离当前组件 scope；`$onAction()` 同样支持脱离并暴露 `after/onError`。`$patch()` 会暂停常规 listener、完成 object merge 或同步 mutator，再主动发出一次 patch 通知，因此 watch `flush` 不能用来推断 patch 次数或异步事务。mutation variants 与 listener 类型的完整 Reference 属于 PRA2。

## 易错使用提示

:::pitfalls
### 用 StoreGeneric 逃避业务类型

**触发条件：** 用 StoreGeneric 逃避业务类型

**原因：** StoreGeneric 有意牺牲精确字段约束。

**后果：** 拼写错误和错误 action 参数无法在业务层及时暴露。

**错误示例：**

~~~~ts
const account: StoreGeneric = useAccountStore()
~~~~

**正确写法：**

~~~~ts
const account = useAccountStore()
~~~~

**验证方式：** 对照正确写法验证结果。

### 直接解构 state 或 getter

**触发条件：** 直接解构 state 或 getter

**原因：** reactive store 会把属性解包为当前值。

**后果：** 局部变量不再跟随 store 更新。

**错误示例：**

~~~~ts
const { count, doubled } = counter
~~~~

**正确写法：**

~~~~ts
const { count, doubled } = storeToRefs(counter)
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 $patch(fn) 中等待异步任务

**触发条件：** 在 $patch(fn) 中等待异步任务

**原因：** 函数式 patch 是同步 mutation 分组。

**后果：** 通知边界与错误处理不再对应一个同步提交。

**错误示例：**

~~~~ts
counter.$patch(async (state) => { state.count = await load() })
~~~~

**正确写法：**

~~~~ts
const count = await load()
counter.$patch({ count })
~~~~

**验证方式：** 对照正确写法验证结果。

### 依赖 $state 赋值替换对象 identity

**触发条件：** 依赖 $state 赋值替换对象 identity

**原因：** setter 内部执行函数式 `$patch()` 与 assign。

**后果：** 基于对象 identity 的缓存假设不会成立。

**错误示例：**

~~~~ts
counter.$state = next
expect(counter.$state).toBe(next)
~~~~

**正确写法：**

~~~~ts
counter.$state = next
expect(counter.count).toBe(next.count)
~~~~

**验证方式：** 对照正确写法验证结果。

### 对 Setup Store 调用自动 $reset()

**触发条件：** 对 Setup Store 调用自动 $reset()

**原因：** 只有 Options Store 自动重跑 state factory。

**后果：** 开发环境会报错，生产环境也不会完成预期 reset。

**错误示例：**

~~~~ts
useSetupCounter().$reset()
~~~~

**正确写法：**

~~~~ts
useSetupCounter().reset() // store 自己实现的 action
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为 $dispose() 会删除 root state

**触发条件：** 认为 $dispose() 会删除 root state

**原因：** 它停止 scope、清订阅并移出 registry，但保留 `pinia.state.value[id]`。

**后果：** 重新 useStore() 时可能复用旧 state。

**错误示例：**

~~~~ts
store.$dispose()
// 以为 state 已删除
~~~~

**正确写法：**

~~~~ts
store.$dispose()
delete pinia.state.value[store.$id]
~~~~

**验证方式：** 对照正确写法验证结果。

### 忘记 detached 订阅的清理责任

**触发条件：** 忘记 detached 订阅的清理责任

**原因：** 脱离组件 scope 后不会随组件自动停止。

**后果：** 订阅跨页面存活并重复处理 mutation 或 action。

**错误示例：**

~~~~ts
store.$subscribe(sync, { detached: true })
~~~~

**正确写法：**

~~~~ts
const stop = store.$subscribe(sync, { detached: true })
stop()
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 flush 推断 patch 事务边界

**触发条件：** 用 flush 推断 patch 事务边界

**原因：** 手动 patch 通知不受普通 watch flush 时机支配。

**后果：** 持久化与审计逻辑对通知次数作出错误假设。

**错误示例：**

~~~~ts
store.$subscribe(sync, { flush: 'post' }) // 以为 patch 会拆分
~~~~

**正确写法：**

~~~~ts
store.$patch((state) => { state.a++; state.b++ })
~~~~

**验证方式：** 对照正确写法验证结果。

### 读写 internal/dev-only 字段

**触发条件：** 读写 internal/dev-only 字段

**原因：** `_p/_getters/_isOptionsAPI/_hot*` 不属于稳定应用协议。

**后果：** production 构建或 minor 升级可让字段消失或改变。

**错误示例：**

~~~~ts
store._hotUpdate(payload)
~~~~

**正确写法：**

~~~~ts
store.$patch(nextState)
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 _customProperties 当作业务字段容器

**触发条件：** 把 _customProperties 当作业务字段容器

**原因：** 它只给插件作者登记 Devtools custom key。

**后果：** 业务 state 绕过 `$state`、SSR 与 hydration 契约。

**错误示例：**

~~~~ts
store._customProperties.add('profile')
~~~~

**正确写法：**

~~~~ts
store.$patch({ profile })
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 源码推导与适用场景

:::steps
### 1. Store 是多个公开面的交叉类型

固定 `types.ts` 将 base state、unwrapped state、getter、action 与 custom extension 组合。它解释一个实例为何同时可读数据和方法，应用无需手工重建。

### 2. $state 赋值收敛到 patch

固定 setter 调用 `$patch()` 并 assign 新值。该事实适用于 state restore 语义，但不能推出 reactive root object 被替换。

### 3. patch 形成同步 mutation 分组

`$patch()` 暂停常规 listener、完成 merge 或同步 mutator，再触发一次 subscription。官方 patch 测试验证分组，不把它扩展成异步事务。

### 4. reset 能力取决于定义模型

Options `$reset()` 重跑 factory 并 patch；Setup 分支默认开发报错、生产 no-op。官方 state 与 setup 测试固定了差异。

### 5. subscribe 生命周期绑定 effect scope

`$subscribe()` 包装 Vue watch，并依据 detached 决定是否绑定当前 scope。适用于组件默认清理与长期订阅的显式清理。

### 6. action wrapper 提供完成与错误通道

`$onAction()` 的 wrapper 对 Promise 延后 `after`，失败进入 `onError`。本页只说明实例 surface，listener 类型留给 PRA2。

### 7. store disposal 不等于 state deletion

`$dispose()` stop store scope、清两类订阅并删除 registry entry，却不删除 root state。适用于临时 store 和测试 cleanup。

### 8. Setup 返回形态驱动公共提取类型

创建器扫描 ref/reactive、computed 与 function，分别登记 state/getters/actions。`StoreState/StoreGetters/StoreActions` 提供稳定提取结果。

### 9. _customProperties 是专门化公开字段

开发客户端会收集 plugin 返回 keys 供 Devtools 展示，而其他 internal 字段可被设为不可枚举。该成员服务 tooling，不是普通业务协议。
:::
