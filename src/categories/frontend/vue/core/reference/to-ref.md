---
id: vue.core.reference.reactivity.to-ref
type: reference
title: toRef() / toRefs()
summary: toRef 基于响应式对象的属性创建双向同步的 ref；toRefs 把响应式对象的每个可枚举属性都转为 ref，使解构后仍保持响应性
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.reactivity.ref
  - vue.core.reference.reactivity.reactive
  - vue.core.reference.reactivity.utils
tags:
  - toRef
  - toRefs
  - Ref
  - reactivity
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-28
sources:
  - title: Vue 响应式 API：工具
    url: https://vuejs.org/api/reactivity-utilities.html
  - title: Vue 响应式基础
    url: https://vuejs.org/guide/essentials/reactivity-fundamentals.html
  - title: Vue 组合式函数指南
    url: https://vuejs.org/guide/reusability/composables.html
  - title: Vue setup() API
    url: https://vuejs.org/api/composition-api-setup.html
  - title: Vue 3.5.40 ref.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts
group: reactivity
signature: |-
  function toRef<T extends object, K extends keyof T>(object: T, key: K, defaultValue?: T[K]): ToRef<T[K]>
  function toRefs<T extends object>(object: T): { [K in keyof T]: ToRef<T[K]> }
anchors:
  - toRef()
  - toRefs()
  - ToRef
  - 双向同步
  - 组合式函数
  - 易错使用提示
---

# toRef() / toRefs()

## 一、概述

这是一对"属性转 ref"的工具函数。`toRef()` 基于响应式对象的某个属性创建 ref，该 ref 与源属性双向同步；3.3 起它还能把值、getter、已有 ref 规范化为 ref。`toRefs()` 则把响应式对象的每个可枚举属性都转为 ref（内部逐个调用 `toRef()`），返回一个普通对象——于是这个对象可以被随意解构、展开而不丢失响应性。

~~~~ts
// toRef：规范化形式（3.3+）
function toRef<T>(
  value: T
): T extends () => infer R
  ? Readonly<Ref<R>>
  : T extends Ref
    ? T
    : Ref<UnwrapRef<T>>

// toRef：对象属性形式
function toRef<T extends object, K extends keyof T>(
  object: T,
  key: K,
  defaultValue?: T[K]
): ToRef<T[K]>

// toRefs
function toRefs<T extends object>(
  object: T
): { [K in keyof T]: ToRef<T[K]> }

type ToRef<T> = T extends Ref ? T : Ref<T>
~~~~

## 二、为什么需要它们

`reactive()` 的响应性依附在对象本身的属性访问上。直接解构出原始值属性，得到的只是解构那一刻的普通值，与源对象彻底断开连接——之后无论谁改谁，双方都不再同步。

~~~~ts
import { reactive } from 'vue'

const state = reactive({ count: 0 })

// 解构后 count 只是一个普通数字，与 state.count 断开
let { count } = state
count++ // 不影响 state.count

// 传参同理：函数拿到的是普通数字，无法追踪变化
callSomeFunction(state.count)
~~~~

:::demo{id="vue.core.reference.reactivity.to-ref.to-refs-demo" playground="true"}
现场对比：直接解构的值停在解构那一刻，toRefs 解构的 ref 始终跟随源对象更新
:::

## 三、toRef()：单个属性转 ref

`toRef(object, key)` 创建的 ref 与源属性双向同步：修改 ref 的 `.value` 会写回源对象，修改源对象也会反映到 ref。即使 `key` 在源对象上暂不存在，也会返回一个可用的 ref（可传第三个参数作默认值）。

~~~~ts
import { reactive, toRef } from 'vue'

const state = reactive({ foo: 1, bar: 2 })

const fooRef = toRef(state, 'foo')

fooRef.value++
console.log(state.foo) // 2

state.foo++
console.log(fooRef.value) // 3

// 属性暂不存在也能拿到可用的 ref（第三个参数为默认值）
const state2 = reactive<{ baz?: number }>({})
const bazRef = toRef(state2, 'baz', 0)
~~~~

3.3 起 `toRef()` 还可以作规范化工具：传入已有 ref 原样返回；传入 getter 得到只读 ref；传入普通值等同于 `ref(value)`。getter 形式常用于把 prop 转成 ref 传给组合式函数。

~~~~ts
import { toRef } from 'vue'

toRef(existingRef) // 原样返回已有 ref
toRef(() => props.title) // 只读 ref，读取时调用 getter
toRef(1) // 等同 ref(1)

// 典型场景：把 prop 以响应式形式传给组合式函数
useFeature(toRef(props, 'title')) // 对象属性形式
useFeature(toRef(() => props.title)) // 3.3+ getter 形式
~~~~

## 四、toRefs()：解构组合式函数的返回值

`toRefs()` 最典型的场景：组合式函数内部用 `reactive()` 组织状态，返回时转成 ref 集合，调用方就能直接解构而不丢失响应性——这正是官方约定"组合式函数返回装着 ref 的普通对象"的实现手段。

~~~~ts
import { reactive, toRefs } from 'vue'

function useFeatureX() {
  const state = reactive({ foo: 1, bar: 2 })

  // ...基于 state 的逻辑

  // 返回时转为 ref 集合
  return toRefs(state)
}

// 调用方解构，foo / bar 仍与内部 state 保持同步
const { foo, bar } = useFeatureX()
~~~~

## 五、易错使用提示

:::pitfalls
### 用 `ref(state.foo)` 代替属性 ref

**触发条件：** 用 `ref(state.foo)` 代替属性 ref

**原因：** `ref()` 接收到的是调用当下的普通属性值，它会创建独立存储；`toRef(object, key)` 才会把 `.value` 的读写转发到源属性。

**后果：** 源对象和新 ref 各自变化，另一方不跟随，界面出现两份不同状态。

**错误示例：**

~~~~ts
const state = reactive({ foo: 1 })
const foo = ref(state.foo)
state.foo++ // foo.value 仍为 1
~~~~

**正确写法：**

~~~~ts
const state = reactive({ foo: 1 })
const foo = toRef(state, 'foo')
state.foo++ // foo.value 同步为 2
~~~~

**验证方式：** 对照正确写法验证结果。

### 通过 props 的属性 ref 反向修改 prop

**触发条件：** 通过 props 的属性 ref 反向修改 prop

**原因：** `toRef(props, 'foo')` 的类型外观看起来像普通 ref，但它的 setter 会写回 props；props 的运行时只读约束仍然存在。

**后果：** 写入等同直接修改 prop，开发环境警告且数据流不可靠；父组件下一次更新还可能覆盖本地结果。

**错误示例：**

~~~~ts
const foo = toRef(props, 'foo')
foo.value = 'next'
~~~~

**正确写法：**

~~~~ts
const foo = toRef(() => props.foo)

function updateFoo(value: string) {
  emit('update:foo', value)
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 期待 `toRefs()` 自动加入未来新增的属性

**触发条件：** 期待 `toRefs()` 自动加入未来新增的属性

**原因：** `toRefs()` 看起来像对象的持续响应式映射，实际只在调用时遍历源对象当前的可枚举属性并逐个创建属性 ref。

**后果：** 之后新增 `state.optional`，返回对象上仍没有 `optional`；解构值是 undefined 或根本不存在。

**错误示例：**

~~~~ts
const state = reactive<{ optional?: string }>({})
const refs = toRefs(state)
state.optional = 'ready'
console.log(refs.optional) // undefined
~~~~

**正确写法：**

~~~~ts
const state = reactive<{ optional?: string }>({})
const optional = toRef(state, 'optional')
state.optional = 'ready'
console.log(optional.value) // ready
~~~~

**验证方式：** 对照正确写法验证结果。

### 给 getter 形式的 `toRef()` 返回值赋值

**触发条件：** 给 getter 形式的 `toRef()` 返回值赋值

**原因：** `toRef(() => source)` 是 3.3+ 的规范化签名，它只把 getter 包装成只读 ref，没有可以把新值写回任意 getter 的 setter。

**后果：** 赋值不能更新源状态，TypeScript 会报只读错误，绕过类型后运行时也无有效写入路径。

**错误示例：**

~~~~ts
const model = toRef(() => props.modelValue)
model.value = 'next'
~~~~

**正确写法：**

~~~~ts
const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 六、最小源码实现

toRef 返回的不是普通 RefImpl，而是 `ObjectRefImpl`——它自己没有 Dep，不存储值：`get value` 直接读 `this._object[this._key]`，`set value` 直接写回去。由于 `_object` 是响应式代理，读写会穿透代理触发那一层的 track/trigger，这就是"双向同步"的本质：ObjectRefImpl 只是源属性的一个"访问转发器"。toRefs 则是 for-in 遍历对源对象每个键调用一次 toRef。也因此，对普通对象调用 toRef 得到的 ref 不具有响应性（没有代理可穿透），开发模式下 toRefs 对非代理对象会发出警告。

~~~~ts
// 精简自 vuejs/core v3.5.40 packages/reactivity/src/ref.ts
// 省略 3.3 规范化重载（getter → GetterRefImpl 等）与数组/浅层判断
class ObjectRefImpl<T extends object, K extends keyof T> {
  public readonly __v_isRef = true
  // 注意：没有 dep，也不缓存值

  constructor(
    private readonly _object: T, // 源响应式对象（代理）
    private readonly _key: K,
    private readonly _defaultValue?: T[K],
  ) {}

  get value() {
    // 转发读取：穿透 _object 的 Proxy get → 那一层完成 track
    const val = this._object[this._key]
    return val === undefined ? this._defaultValue! : val
  }

  set value(newVal) {
    // 转发写入：穿透 _object 的 Proxy set → 那一层完成 trigger
    this._object[this._key] = newVal
  }
}

export function toRef(object: object, key: string, defaultValue?: unknown) {
  const val = (object as any)[key]
  return isRef(val) ? val : new ObjectRefImpl(object as any, key as any, defaultValue)
}

export function toRefs<T extends object>(object: T) {
  const ret: any = Array.isArray(object) ? new Array(object.length) : {}
  for (const key in object) {
    ret[key] = toRef(object, key) // 逐属性转发
  }
  return ret
}
~~~~

:::tip
对比记忆：RefImpl 自带 Dep、自己管理订阅者；ObjectRefImpl 没有 Dep，track/trigger 都委托给源代理。所以 toRef 的响应性完全取决于源对象是不是响应式代理。
:::

## 七、三种方式对比

| 特性 | toRef(obj, key) | toRefs(obj) | 直接解构 |
| --- | --- | --- | --- |
| 处理范围 | 单个属性 | 调用时所有可枚举属性 | 任意属性 |
| 响应性 | 保持，双向同步 | 保持，双向同步 | 原始值属性完全丢失 |
| 不存在的属性 | 返回可用 ref，可设默认值 | 不生成对应 ref | 得到 undefined |
| 典型场景 | 把单个 prop 传给组合式函数 | 解构组合式函数返回的 reactive 状态 | 不推荐 |

:::tip
对 props 使用 toRef / toRefs 得到的 ref 仍受 props 只读约束，不能通过它反向修改 prop；getter 形式 toRef(() =&gt; props.x) 生成的本身就是只读 ref。
:::
