---
id: vue.core.reference.reactivity.readonly
type: reference
title: readonly() / shallowReadonly()
summary: 创建对象或 ref 的只读代理：readonly 深层只读，shallowReadonly 仅根级只读；修改代理不生效，修改原始对象仍会同步到代理
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.reactivity.reactive
  - vue.core.reference.reactivity.shallow
  - vue.core.reference.reactivity.utils
tags:
  - readonly
  - shallowReadonly
  - isReadonly
  - reactivity
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-28
sources:
  - title: Vue 响应式 API：核心
    url: https://vuejs.org/api/reactivity-core.html
  - title: Vue 响应式 API：进阶
    url: https://vuejs.org/api/reactivity-advanced.html
  - title: Vue 响应式 API：工具
    url: https://vuejs.org/api/reactivity-utilities.html
  - title: Vue 依赖注入指南
    url: https://vuejs.org/guide/components/provide-inject.html
  - title: Vue 3.5.40 baseHandlers.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/baseHandlers.ts
group: reactivity
signature: |-
  function readonly<T extends object>(target: T): DeepReadonly<UnwrapNestedRefs<T>>
  function shallowReadonly<T extends object>(target: T): Readonly<T>
anchors:
  - readonly()
  - shallowReadonly()
  - isReadonly()
  - 深层只读
  - 只读代理
  - 易错使用提示
---

# readonly() / shallowReadonly()

## 一、概述

readonly() 接受一个对象（响应式或普通对象）或一个 ref，返回指向原始值的只读代理。该代理是深层的：访问到的任何嵌套属性也都是只读的。它的 ref 解包行为与 `reactive()` 相同，区别是解包后的值同样会变为只读。

~~~~ts
function readonly<T extends object>(
  target: T
): DeepReadonly<UnwrapNestedRefs<T>>
~~~~

## 二、基础用法

只读代理与原始对象保持连接：读取代理的属性会正常收集依赖；修改原始对象会同步反映到代理上，并触发依赖代理的副作用；而直接修改代理会失败。

~~~~ts
import { reactive, readonly, watchEffect } from 'vue'

const original = reactive({ count: 0 })
const copy = readonly(original)

watchEffect(() => {
  // 读取只读代理，同样会被依赖追踪
  console.log(copy.count)
})

// 修改原始对象：同步到 copy，触发上面的 watchEffect
original.count++

// 直接修改只读代理：失败，并得到警告
copy.count++ // warning!
~~~~

:::demo{id="vue.core.reference.reactivity.readonly.readonly-demo" playground="true"}
修改只读代理被拒绝（值不变，开发模式下控制台有警告）；修改原始对象则同步反映到只读代理
:::

## 三、易错使用提示

:::pitfalls
### 把 readonly 代理当成不会变化的快照

**触发条件：** 把 readonly 代理当成不会变化的快照

**原因：** 把“不能通过这个入口写”误解成 `Object.freeze()` 式静态值。`readonly(reactiveSource)` 仍追踪源代理，源所有者可以继续更新它。

**后果：** watch、computed 和模板会随着源状态更新；依赖“视图永远不变”的缓存或比较逻辑得到意外结果。

**错误示例：**

~~~~ts
const source = reactive({ count: 0 })
const snapshot = readonly(source)
source.count++ // snapshot.count 也变成 1
~~~~

**正确写法：**

~~~~ts
const source = reactive({ count: 0 })
const view = readonly(source) // 明确作为只读视图
const snapshot = structuredClone(toRaw(source)) // 真正按需复制快照
~~~~

**验证方式：** 对照正确写法验证结果。

### 通过 readonly 代理写入，再期待源状态改变

**触发条件：** 通过 readonly 代理写入，再期待源状态改变

**原因：** TypeScript 的 `Readonly` 容易被看成只提供编译期提示；Vue 的 readonly 代理在运行时也会拦截 `set` 和 `deleteProperty`。

**后果：** 写入没有生效，开发环境出现 readonly 警告；后续业务逻辑仍读到旧值。

**错误示例：**

~~~~ts
const view = readonly(source)
view.count++
delete view.label
~~~~

**正确写法：**

~~~~ts
const view = readonly(source)

function increment() {
  source.count++
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为 `shallowReadonly()` 会递归保护嵌套对象

**触发条件：** 认为 `shallowReadonly()` 会递归保护嵌套对象

**原因：** 忽略 shallow 只转换根级属性；嵌套对象按原值暴露，不会被递归包装成 readonly 代理。

**后果：** 根属性赋值会被拦截，但 `state.nested.count++` 可以成功，形成“有的写入被挡、有的没被挡”的混合边界。

**错误示例：**

~~~~ts
const state = shallowReadonly({ nested: { count: 0 } })
state.nested.count++ // 可以修改
~~~~

**正确写法：**

~~~~ts
const state = readonly({ nested: { count: 0 } })
// state.nested.count++ 会被 readonly 代理拦截
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 四、shallowReadonly()

~~~~ts
function shallowReadonly<T extends object>(target: T): Readonly<T>
~~~~

readonly() 的浅层版本：只有根级属性是只读的，嵌套对象仍然可写，并且不会解包 ref。与 `shallowReactive()` 一样，官方建议只把它用于组件的根级状态，以保证响应行为可预测。

~~~~ts
import { shallowReadonly, isReadonly } from 'vue'

const state = shallowReadonly({
  foo: 1,
  nested: { bar: 2 },
})

// 根级属性只读：写入失败
state.foo++

// 嵌套对象并不是只读的
isReadonly(state.nested) // false

// 嵌套属性可以正常修改
state.nested.bar++
~~~~

:::tip
典型场景是"暴露但不许改"：通过 provide 向后代组件提供状态时，用 readonly() 包一层，后代只能读取，修改必须调用一并提供的方法；组合式函数向外返回内部状态时同理。isReadonly() 可判断一个值是否为只读代理（含 readonly、shallowReadonly 及无 setter 的 computed）。
:::

## 五、最小源码实现

readonly() 与 reactive() 一样返回 Proxy，差别全在 handler：set 与 deleteProperty 拦截不执行任何写入，开发模式下打印警告后直接返回 true（Proxy 协议要求返回 true 表示"已处理"，所以不抛异常、静默失败）；get 拦截不调用 track()——只读代理自身的属性永远不会变，无需为"改不了的东西"收集依赖。而"修改原始对象会同步到只读代理"正是因为代理只是一层壳，读取始终穿透到原始对象（若原始对象是 reactive 代理，track 发生在那一层）。

~~~~ts
// 精简自 vuejs/core v3.5.40 packages/reactivity/src/baseHandlers.ts
class ReadonlyReactiveHandler {
  get(target: object, key: string, receiver: object) {
    const res = Reflect.get(target, key, receiver)
    // 注意：这里没有 track()——只读代理自身不会变化，无需收集依赖
    // （target 若是 reactive 代理，读取会穿透触发它的 get，track 发生在那层）

    if (isRef(res)) {
      const value = res.value // ref 解包
      return isObject(value) ? readonly(value) : value
    }
    if (isObject(res)) {
      return readonly(res) // 惰性递归：嵌套对象读到才包成只读（深层只读）
    }
    return res
  }

  set(target: object, key: string | symbol) {
    if (__DEV__) {
      console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`)
    }
    return true // 返回 true 表示"已处理"，写入静默失败，不抛异常
  }

  deleteProperty(target: object, key: string | symbol) {
    if (__DEV__) {
      console.warn(`Delete operation on key "${String(key)}" failed: target is readonly.`)
    }
    return true
  }
}

export function readonly(target: object) {
  return new Proxy(target, new ReadonlyReactiveHandler())
}
// shallowReadonly 同一个 handler 传入 shallow 开关：
// get 提前返回，嵌套对象不再包 readonly，也不解包 ref
~~~~

## 六、readonly 与 shallowReadonly 对比

| 特性 | readonly() | shallowReadonly() |
| --- | --- | --- |
| 只读层级 | 深层：嵌套属性全部只读 | 仅根级属性只读，嵌套对象可写 |
| ref 解包 | 与 reactive() 相同，解包后的值同样只读 | 不解包 ref |
| 接受的参数 | 对象（响应式或普通）或 ref | 对象 |
| 典型用途 | 向组件 / 组合式函数外暴露不可修改的状态 | 仅需保护根级状态的特殊场景 |
