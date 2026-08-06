---
id: vue.core.reference.reactivity.reactive
type: reference
title: reactive()
summary: 返回一个对象的响应式代理（Proxy），转换是深层的，直接访问属性即可触发依赖追踪
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.reactivity.ref
  - vue.core.reference.reactivity.shallow
  - vue.core.reference.reactivity.readonly
  - vue.core.reference.reactivity.to-ref
tags:
  - reactive
  - Proxy
  - reactivity
  - 响应式
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-28
sources:
  - title: Vue 响应式 API：核心
    url: https://vuejs.org/api/reactivity-core.html
  - title: Vue 响应式基础
    url: https://vuejs.org/guide/essentials/reactivity-fundamentals.html
  - title: Vue 深入响应式系统
    url: https://vuejs.org/guide/extras/reactivity-in-depth.html
  - title: Vue 3.5.40 baseHandlers.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/baseHandlers.ts
  - title: Vue 3.5.40 reactive.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/reactive.ts
group: reactivity
signature: "function reactive<T extends object>(target: T): UnwrapNestedRefs<T>"
anchors:
  - reactive()
  - Proxy
  - 深层响应
  - 局限性
  - ref 属性的自动解包
  - 响应式原理
  - 易错使用提示
---

# reactive()

## 概述

reactive() 返回一个对象的响应式代理。与 ref 不同，它不需要 `.value`，直接读写属性即可：属性读取被 Proxy 的 get 拦截并追踪（track），属性写入被 set 拦截并触发更新（trigger）。官方建议只操作代理版本，不要保留对原始对象的引用。

~~~~ts
function reactive<T extends object>(target: T): UnwrapNestedRefs<T>
~~~~

## 基础用法与深层响应

转换是深层的：嵌套多深的对象属性都会被转为响应式，修改 `state.user.address.city` 与修改 `state.count` 一样能触发视图更新。若只需追踪顶层属性，可改用 `shallowReactive()`。

~~~~ts
import { reactive } from 'vue'

const state = reactive({ count: 0 })
state.count++ // 直接读写属性，无需 .value
~~~~

:::demo{id="vue.core.reference.reactivity.reactive.reactive-nested" playground="true"}
基础用法 + 深层响应：修改顶层 count 与深层 user.address.city 都会触发更新
:::

## 代理与原始对象不相等

reactive() 返回的是原始对象的 Proxy 代理，两者并不相等（`proxy === raw` 为 `false`）。修改原始对象不会触发更新。最佳实践是只使用代理版本，丢弃原始对象引用。

~~~~ts
import { reactive } from 'vue'

const raw = {}
const proxy = reactive(raw)

// 代理与原始对象不相等
console.log(proxy === raw) // false
~~~~

## 局限性

reactive() 有三条局限：1）只对对象类型有效（对象、数组、Map/Set 等集合类型），不能持有 `string`、`number`、`boolean` 等原始值；2）用新对象替换整个 reactive 变量会丢失响应连接——Vue 追踪的是属性访问，替换引用后原对象不再被追踪；3）解构原始值属性、或把属性单独传入函数时，得到的是普通值，与源对象断开响应连接。

~~~~ts
import { reactive } from 'vue'

let state = reactive({ count: 0 })

// 局限 2：替换整个对象，上面的 { count: 0 } 不再被追踪（响应连接丢失）
state = reactive({ count: 1 })

// 局限 3：解构原始值属性，count 与 state.count 断开连接
let { count } = state
count++ // 不影响 state.count

// 传入函数的是普通 number，无法追踪 state.count 的变化
callSomeFunction(state.count)
~~~~

:::demo{id="vue.core.reference.reactivity.reactive.reactive-limitations" playground="true"}
解构断开响应连接的现场对照：修改解构副本不影响 state，也不触发更新
:::

## 易错使用提示

:::pitfalls
### 用 `reactive()` 包装基本类型

**触发条件：** 用 `reactive()` 包装基本类型

**原因：** API 名称容易让人以为任何值都能“变成响应式”；但 `reactive()` 的类型和运行时代理机制都要求对象、数组或集合，基本类型不能被 Proxy 包装成相同语义的状态。

**后果：** 得不到可按预期追踪的数字、字符串或布尔状态，后续读取和赋值也没有稳定的响应式容器。

**错误示例：**

~~~~ts
const count = reactive(0)
~~~~

**正确写法：**

~~~~ts
const count = ref(0)
count.value++
~~~~

**验证方式：** 对照正确写法验证结果。

### 用新代理替换整个 `reactive` 变量

**触发条件：** 用新代理替换整个 `reactive` 变量

**原因：** 误以为使用方订阅的是变量名 `state`。Vue 实际通过旧代理上的属性访问建立连接，变量重新指向新代理不会把既有订阅迁移过去。

**后果：** 持有旧代理的 computed、watch、组件或函数继续观察旧对象；新对象变化不一定驱动它们更新。

**错误示例：**

~~~~ts
let state = reactive({ count: 0 })
state = reactive({ count: 1 })
~~~~

**正确写法：**

~~~~ts
const state = ref({ count: 0 })
state.value = { count: 1 }
~~~~

**验证方式：** 对照正确写法验证结果。

### 解构基本类型属性后仍期待双向响应

**触发条件：** 解构基本类型属性后仍期待双向响应

**原因：** 解构语法只复制当前属性值；对数字、字符串等基本类型而言，本地变量不再经过代理的 get / set 拦截。

**后果：** 修改解构变量不会修改源状态；源状态变化也不会更新该变量，依赖它的逻辑读到旧值。

**错误示例：**

~~~~ts
const state = reactive({ count: 0 })
let { count } = state
count++
~~~~

**正确写法：**

~~~~ts
const state = reactive({ count: 0 })
const { count } = toRefs(state)
count.value++
~~~~

**验证方式：** 对照正确写法验证结果。

### 继续修改原始对象并期待视图更新

**触发条件：** 继续修改原始对象并期待视图更新

**原因：** `reactive()` 保留原始对象不变，真正建立追踪的是返回的 Proxy。直接写原始对象不会经过代理的 set 拦截。

**后果：** 数据本身已改变，但模板、computed 和 watcher 不会因这次写入而重新执行，页面保留旧结果。

**错误示例：**

~~~~ts
const raw = { count: 0 }
const state = reactive(raw)

watchEffect(() => console.log(state.count))
raw.count++ // 不触发 effect
~~~~

**正确写法：**

~~~~ts
const raw = { count: 0 }
const state = reactive(raw)

watchEffect(() => console.log(state.count))
state.count++ // 始终通过代理写入
~~~~

**验证方式：** 对照正确写法验证结果。

### 把代理与原始对象当成同一个引用

**触发条件：** 把代理与原始对象当成同一个引用

**原因：** `reactive(raw)` 返回的代理与 raw 拥有相同数据，但严格相等比较的对象身份不同。

**后果：** 使用 `===`、Set 或 Map 做身份判断时会查找失败，去重、选中与缓存逻辑可能误判。

**错误示例：**

~~~~ts
const raw = { id: 1 }
const state = reactive(raw)

console.log(state === raw) // false
selectIfSame(state, raw)
~~~~

**正确写法：**

~~~~ts
const raw = { id: 1 }
const state = reactive(raw)

// 业务逻辑用稳定键比较
console.log(state.id === raw.id) // true

// 仅在短暂身份判断时取原始对象
console.log(toRaw(state) === raw) // true
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## ref 属性的自动解包

作为 reactive 对象属性的 ref 会自动解包：访问 `obj.count` 无需 `.value`，且与原 ref 双向同步。例外：ref 在 reactive 数组或 Map 等原生集合类型中不会解包。

~~~~ts
import { reactive, ref } from 'vue'

const count = ref(1)
const obj = reactive({ count })

// ref 被解包，无需 .value
console.log(obj.count === count.value) // true

count.value++ // 同步到 obj.count → 2
obj.count++ // 也同步回 count ref → 3
~~~~

## 响应式原理

:::principle{id="vue.core.reference.reactivity.reactive.reactive-proxy"}
reactive 的响应式基于 Proxy 拦截：get 拦截中调用 track() 收集依赖，set 拦截中调用 trigger() 触发更新。
:::

## 最小源码实现

reactive() 的核心是 `new Proxy(target, handlers)`。get 拦截里做三件事：`track(target, key)` 按「对象 → 属性 → Dep」登记依赖；若属性值是 ref 则自动解包；若属性值是对象则惰性递归——此刻才对嵌套对象调用 reactive()，而不是创建时一次性深遍历。set 拦截里先 `Reflect.set` 完成赋值，再按"新增属性"或"值变化"调用 `trigger(target, key)`。依赖存放在全局 `targetMap: WeakMap<object, Map<key, Dep>>` 中，对象被回收时依赖记录随之释放。

~~~~ts
// 精简自 vuejs/core v3.5.40 packages/reactivity/src/baseHandlers.ts、reactive.ts
// 省略 readonly/shallow/数组特殊方法/集合类型分支，保留真实骨架
const reactiveMap = new WeakMap<object, any>() // 同一对象重复代理时复用

const handlers: ProxyHandler<object> = {
  get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver)
    track(target, key) // 登记：target 的 key 被当前副作用依赖

    if (isRef(res)) return res.value // ref 属性自动解包
    if (isObject(res)) return reactive(res) // 惰性递归：读到才转换（深层响应）
    return res
  },

  set(target, key, value, receiver) {
    const oldValue = (target as any)[key]
    const hadKey = Object.prototype.hasOwnProperty.call(target, key)
    const result = Reflect.set(target, key, value, receiver)

    if (!hadKey) {
      trigger(target, key) // 新增属性
    } else if (hasChanged(value, oldValue)) {
      trigger(target, key) // 已有属性且值变化
    }
    return result
  },
}

export function reactive(target: object) {
  const existing = reactiveMap.get(target)
  if (existing) return existing // 保证同一对象只有一个代理

  const proxy = new Proxy(target, handlers)
  reactiveMap.set(target, proxy)
  return proxy
}

// 依赖存储：对象 → 属性 → 订阅者集合
const targetMap = new WeakMap<object, Map<unknown, Dep>>()

function track(target: object, key: unknown) {
  let depsMap = targetMap.get(target)
  if (!depsMap) targetMap.set(target, (depsMap = new Map()))
  let dep = depsMap.get(key)
  if (!dep) depsMap.set(key, (dep = new Dep()))
  dep.track() // 与 ref 复用同一套 Dep：登记当前活跃副作用
}

function trigger(target: object, key: unknown) {
  targetMap.get(target)?.get(key)?.trigger() // 通知该属性的所有订阅者
}
~~~~

:::tip
「惰性递归」是 Proxy 方案对 Vue2 Object.defineProperty 方案的关键改进之一：Vue2 初始化时递归遍历整个对象定义 getter/setter，Vue3 只在属性真正被读取时才代理嵌套对象，大对象的初始化开销大幅降低；且 Proxy 能拦截新增/删除属性与数组索引写入，Vue2 需要 $set 辅助。
:::

## 与 ref 对比

| 特性 | reactive() | ref() |
| --- | --- | --- |
| 适用值类型 | 仅对象类型（对象/数组/集合） | 任意值（原始值与对象） |
| 访问方式 | 直接访问属性 | .value（模板顶层自动解包） |
| 整体替换 | 不支持：替换整个对象会失去响应连接 | 支持：count.value = newVal |
| 解构 | 解构原始值属性会失去响应性 | 解构后仍是同一 ref |
| 实现机制 | Proxy 代理，与原始对象不相等 | getter/setter 拦截 .value |

:::tip
选择建议：官方推荐优先使用 ref()；reactive() 适合一组关联紧密、始终整体使用且不需要整体替换的对象状态（如表单对象）。
:::
