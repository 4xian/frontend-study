---
id: vue.core.reference.reactivity-watchers.computed
type: reference
title: computed()
summary: 接受 getter 函数返回带缓存的只读 ref；也可接受 get/set 对象创建可写的计算属性
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.reactivity-watchers.watch
  - vue.core.reference.reactivity-watchers.watch-effect
  - vue.core.reference.reactivity.ref
tags:
  - computed
  - 计算属性
  - 缓存
  - 派生状态
  - Composition API
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-28
sources:
  - title: Vue 响应式 API：核心
    url: https://cn.vuejs.org/api/reactivity-core.html#computed
  - title: Vue 计算属性
    url: https://cn.vuejs.org/guide/essentials/computed.html
  - title: Vue 3.5.40 computed.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/computed.ts
group: reactivity-watchers
signature: "function computed<T>(getter: (oldValue?: T) => T): Readonly<Ref<Readonly<T>>>"
anchors:
  - 概述
  - 基础用法
  - 缓存机制
  - 可写 computed
  - 缓存原理
  - 最小源码实现
  - 与 watch 如何选择
  - 易错使用提示
---

# computed()

## 概述

computed() 用于声明"派生状态"：一个值由其他响应式状态计算而来。传入 getter 函数时返回只读的计算属性 ref；传入带 `get` 和 `set` 的对象时返回可写的计算属性 ref。getter 收到的参数是上一次的计算结果（首次为 undefined）。

~~~~ts
// 只读
function computed<T>(
  getter: (oldValue: T | undefined) => T,
  debuggerOptions?: DebuggerOptions
): Readonly<Ref<Readonly<T>>>

// 可写
function computed<T>(
  options: {
    get: (oldValue: T | undefined) => T
    set: (value: T) => void
  },
  debuggerOptions?: DebuggerOptions
): Ref<T>
~~~~

## 基础用法

~~~~ts
import { computed, ref } from 'vue'

const count = ref(1)
const plusOne = computed(() => count.value + 1)

console.log(plusOne.value) // 2
plusOne.value++ // 错误：只读 computed 不可写
~~~~

## 缓存机制

computed 基于其响应式依赖进行缓存：只有依赖变化时才重新求值；依赖不变时反复读取 `.value` 都直接返回缓存结果，getter 不会执行。相比之下，方法调用在每次组件重渲染时都会重新执行。对开销大的计算，这个差别决定性能。

:::demo{id="vue.core.reference.reactivity-watchers.computed.computed-cache-demo" playground="true"}
过滤列表只依赖关键字：修改无关状态不会触发 getter 重算
:::

## 可写 computed

绝大多数计算属性应当是只读的。确有需要时，可以通过 `get` + `set` 创建可写的计算属性：写入 `.value` 时执行 `set`，由它反向更新源状态。

:::demo{id="vue.core.reference.reactivity-watchers.computed.writable-computed" playground="true"}
摄氏 ⇄ 华氏双向换算：写华氏输入框，set 反向更新摄氏
:::

## 易错使用提示

:::pitfalls
### 依赖 `Date.now()` 等非响应式值并期待自动刷新

**触发条件：** 依赖 `Date.now()` 等非响应式值并期待自动刷新

**原因：** 误以为 computed 会按时间或每次渲染重新执行。它只在追踪到的响应式依赖变化时失效，非响应式 API 不会使缓存变脏。

**后果：** 多次读取都返回首次求值结果；即使组件因其他原因重渲染，时间值也可能保持不变。

**错误示例：**

~~~~ts
const now = computed(() => Date.now())
~~~~

**正确写法：**

~~~~ts
const now = ref(Date.now())
const timer = setInterval(() => (now.value = Date.now()), 1000)
onUnmounted(() => clearInterval(timer))
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 computed getter 中修改状态、发请求或操作 DOM

**触发条件：** 在 computed getter 中修改状态、发请求或操作 DOM

**原因：** 把 getter 当成普通事件回调。getter 是否执行取决于读取、依赖失效和缓存，不具备“一次变化对应一次副作用”的调用契约。

**后果：** 副作用可能因未读取而遗漏、因多处读取而在难以预测的时机发生，修改自身依赖时还可能产生递归更新。

**错误示例：**

~~~~ts
const profile = computed(() => {
  void fetch(`/api/users/${userId.value}`)
  return userId.value
})
~~~~

**正确写法：**

~~~~ts
const profileKey = computed(() => userId.value)
watch(profileKey, (id) => {
  void fetch(`/api/users/${id}`)
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 给 getter-only computed 赋值

**触发条件：** 给 getter-only computed 赋值

**原因：** computed 返回 ref 形态，容易被当成普通可写 ref；但只传 getter 时返回的是 readonly computed ref。

**后果：** 运行时发出只读警告，源状态不变，后续读取仍返回由 getter 计算出的值。

**错误示例：**

~~~~ts
const fullName = computed(() => `${first.value} ${last.value}`)
fullName.value = 'Ada Lovelace'
~~~~

**正确写法：**

~~~~ts
const fullName = computed({
  get: () => `${first.value} ${last.value}`,
  set: (value) => {
    ;[first.value, last.value] = value.split(' ')
  },
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 直接修改 computed 返回的对象

**触发条件：** 直接修改 computed 返回的对象

**原因：** computed 的返回值是根据源状态计算出的派生快照。即使这个快照是可变对象，也不应把它当成独立写入入口。

**后果：** 本地修改可能暂时出现，但源依赖下次变化后 computed 会重新生成结果并覆盖它，状态所有权变得混乱。

**错误示例：**

~~~~ts
const selectedUser = computed(() => users.value.find((user) => user.id === id.value)!)
selectedUser.value.name = 'Grace'
~~~~

**正确写法：**

~~~~ts
const selectedUser = computed(() => users.value.find((user) => user.id === id.value)!)

function renameSelectedUser(name: string) {
  const user = users.value.find((item) => item.id === id.value)
  if (user) user.name = name
}
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 缓存原理

:::principle{id="vue.core.reference.reactivity-watchers.computed.computed-cache"}
computed 内部维护缓存与"脏"标记：依赖变化只是标脏，重算延迟到下一次读取时进行（惰性求值）。
:::

## 最小源码实现

computed 的实现是"双面角色"：它既像 ref 一样有自己的 `dep`（供订阅它的组件/watch 收集依赖），又像副作用一样订阅别的响应式数据。缓存靠 `DIRTY` 脏标记实现——依赖变化时 `notify()` 只置脏并转发通知，不立即重算；直到下一次读 `.value` 才在 `refreshComputed` 里真正执行 getter（惰性求值），且重算后新旧值相同就不递增自己的版本号，下游订阅者也就不会重跑。

~~~~ts
// 精简自 vuejs/core v3.5.40 packages/reactivity/src/computed.ts、effect.ts
// 省略 SSR 分支、批处理队列与 Link 链表细节，保留真实骨架
class ComputedRefImpl<T> {
  _value: T | undefined = undefined // 缓存的计算结果
  readonly dep = new Dep(this) // 供"订阅本 computed 的人"收集依赖
  flags = EffectFlags.DIRTY // 初始即脏：首次读取必须求值
  readonly __v_isRef = true

  constructor(
    public fn: (oldValue?: T) => T, // getter
    private setter?: (v: T) => void,
  ) {}

  // 依赖变化时被上游 Dep 调用：只标脏 + 通知下游，不重算
  notify() {
    this.flags |= EffectFlags.DIRTY
    this.dep.notify() // 把"可能变了"传递给订阅本 computed 的副作用
  }

  get value(): T {
    this.dep.track() // 谁在读我，谁就订阅我
    refreshComputed(this) // 脏了才真正重算（惰性求值）
    return this._value!
  }

  set value(newValue: T) {
    if (this.setter) this.setter(newValue)
    else console.warn('Write operation failed: computed value is readonly')
  }
}

function refreshComputed(computed: ComputedRefImpl<unknown>) {
  if (!(computed.flags & EffectFlags.DIRTY)) return // 不脏：直接用缓存

  computed.flags &= ~EffectFlags.DIRTY
  const prevSub = activeSub
  activeSub = computed // 求值期间读到的数据都会订阅到本 computed
  try {
    const value = computed.fn(computed._value)
    if (hasChanged(value, computed._value)) {
      computed._value = value
      computed.dep.version++ // 结果真的变了，下游才会重跑
    }
  } finally {
    activeSub = prevSub
  }
}

export function computed(getterOrOptions: any) {
  return typeof getterOrOptions === 'function'
    ? new ComputedRefImpl(getterOrOptions, undefined)
    : new ComputedRefImpl(getterOrOptions.get, getterOrOptions.set)
}
~~~~

:::tip
3.5 版源码还有一层全局版本号快速通道（globalVersion）：整个应用没有发生任何响应式变化时，读 computed 连"逐个检查依赖是否变化"都跳过，直接返回缓存。
:::

## 与 watch 如何选择

| 场景 | 用 computed | 用 watch |
| --- | --- | --- |
| 由现有状态派生新值（模板要展示） | ✓ 声明式、自动缓存 | ✗ 需手动维护中间变量 |
| 状态变化时执行副作用（请求、写 DOM、操作路由） | ✗ getter 禁止副作用 | ✓ 专为副作用设计 |
| 需要访问变化前后的值 | getter 参数可拿上次结果 | ✓ 回调天然提供新旧值 |

:::tip
调试选项：computed 第二个参数可传 `onTrack` / `onTrigger` 回调（仅开发模式生效），用于观察依赖被收集与触发的时机。
:::
