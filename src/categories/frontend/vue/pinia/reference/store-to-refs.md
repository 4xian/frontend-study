---
id: vue.pinia.reference.stores.store-to-refs
type: reference
title: storeToRefs() 响应式提取
summary: 从 Store 提取 state、getters 与响应式插件字段，同时过滤 action 和普通属性
domain: frontend
technology: vue
module: pinia
related:
  - vue.pinia.reference.stores.store-shape
  - vue.pinia.learn.basics.component-store-to-refs
  - vue.pinia.learn.basics.getters
  - vue.pinia.learn.intermediate.setup-stores
  - vue.pinia.learn.advanced.plugins-persistence
tags:
  - Pinia
  - storeToRefs
  - ref
  - computed
  - reactive
  - 响应式解构
appliesTo: Pinia 4.0.2
verifiedAt: 2026-08-05
sources:
  - title: Pinia Guide：Using the Store
    url: https://pinia.vuejs.org/core-concepts/#using-the-store
  - title: Pinia API：storeToRefs
    url: https://pinia.vuejs.org/api/pinia/functions/storeToRefs.html
  - title: Pinia Guide：Plugins Adding New State
    url: https://pinia.vuejs.org/core-concepts/plugins.html#adding-new-state
  - title: Pinia 4.0.2：storeToRefs.ts 固定源码
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/storeToRefs.ts
  - title: Pinia 4.0.2：storeToRefs 官方测试
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/storeToRefs.spec.ts
  - title: Pinia 4.0.2：store.ts 固定源码
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts
group: stores
signature: "declare function storeToRefs<SS extends StoreGeneric>(store: SS): StoreToRefs<SS>"
anchors:
  - Store To Refs
  - 返回边界
  - 易错使用提示
  - 源码推导与适用场景
---

# storeToRefs() 响应式提取

## 一、Store To Refs

`storeToRefs(store)` 把 Store 中的 state、getters 和响应式插件字段转换为可安全解构的 refs，同时忽略 methods 与非响应式属性。返回 ref 继续连接原 store：写入可写 state ref 会更新 store，getter 则保留 computed 的 lazy/cached 语义。actions 可直接从 store 解构。

~~~~ts
import { storeToRefs } from 'pinia'

const counter = useCounterStore()
const { count, doubled } = storeToRefs(counter)
const { increment } = counter

count.value += 1
increment()
~~~~

:::tip
`StoreToRefs`、`_ToStateRefs` 与 `_ToComputedRefs` 出现在 4.0.2 声明内部，但没有进入 Pinia 根入口 67 项导出矩阵。它们可以解释返回类型，不能获得独立索引项，也不应从应用直接 import。
:::

## 二、返回边界

| Store 属性 | 结果 | 4.0.2 契约 |
| --- | --- | --- |
| Options / Setup state | 包含 | 得到可读写 ref，并继续同步 store |
| readonly getter / computed | 包含 | 得到 computed ref，保持 lazy 与 cached |
| writable computed | 包含 | computed ref 保留 setter |
| plugin-added ref/reactive/computed | 包含 | 按响应式形态筛选，不按来源标签 |
| action / function | 忽略 | 直接从 store 解构 action |
| plugin-added 普通 number/string/object | 忽略 | 不会自动包装成 ref |
| Setup 返回的其他非响应值 | 忽略 | 遍历到属性不等于进入结果 |

plugin-added 响应式字段进入返回值，只说明它满足 `ref/reactive/computed` 过滤。是否参与 Devtools、SSR 序列化和 hydration 仍取决于 plugin 是否同时把 state 写入 `store` 与 `store.$state`；`storeToRefs()` 不会补齐这份持久化契约。

## 三、易错使用提示

:::pitfalls
### 直接解构 Store state

**触发条件：** 直接解构 Store state

**原因：** reactive proxy 会把属性解包为当前值。

**后果：** 局部变量不再跟随 store 更新。

**错误示例：**

~~~~ts
const { count } = counter
~~~~

**正确写法：**

~~~~ts
const { count } = storeToRefs(counter)
~~~~

**验证方式：** 对照正确写法验证结果。

### 期待 action 进入 refs

**触发条件：** 期待 action 进入 refs

**原因：** function 会被专用 helper 明确忽略。

**后果：** 把 action 当 ref 调用会得到不存在的 `.value`。

**错误示例：**

~~~~ts
const { increment } = storeToRefs(counter)
increment.value()
~~~~

**正确写法：**

~~~~ts
const { increment } = counter
increment()
~~~~

**验证方式：** 对照正确写法验证结果。

### 假定所有 plugin 字段都会进入结果

**触发条件：** 假定所有 plugin 字段都会进入结果

**原因：** 实现只选择 computed/ref/reactive 形态。

**后果：** 普通 number、string 或 plain object 的键为 undefined。

**错误示例：**

~~~~ts
const { plainVersion } = storeToRefs(store)
~~~~

**正确写法：**

~~~~ts
const { reactiveVersion } = storeToRefs(store)
~~~~

**验证方式：** 对照正确写法验证结果。

### 把提取等同于 SSR 序列化

**触发条件：** 把提取等同于 SSR 序列化

**原因：** helper 不会把 plugin field 自动写入 `$state`。

**后果：** 客户端能响应式读取字段，但 SSR payload 仍缺失。

**错误示例：**

~~~~ts
storeToRefs(store) // 以为已进入 SSR state
~~~~

**正确写法：**

~~~~ts
store.$state.pluginState = initialPluginState
store.pluginState = toRef(store.$state, 'pluginState')
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 ref(store.count) 修复解构

**触发条件：** 用 ref(store.count) 修复解构

**原因：** `ref()` 只以当前值创建另一份 state。

**后果：** 局部 ref 与 store 后续更新互不连接。

**错误示例：**

~~~~ts
const count = ref(counter.count)
~~~~

**正确写法：**

~~~~ts
const { count } = storeToRefs(counter)
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 Vue toRefs(store) 代替专用 helper

**触发条件：** 用 Vue toRefs(store) 代替专用 helper

**原因：** 通用 helper 不表达 Pinia 对 methods 与非响应式扩展的过滤契约。

**后果：** 调用者拿到不符合 Store 使用预期的属性集合。

**错误示例：**

~~~~ts
const fields = toRefs(counter)
~~~~

**正确写法：**

~~~~ts
const fields = storeToRefs(counter)
~~~~

**验证方式：** 对照正确写法验证结果。

### 直接 import 未导出的返回辅助类型

**触发条件：** 直接 import 未导出的返回辅助类型

**原因：** `StoreToRefs/_To*` 不是 4.0.2 根入口稳定导出。

**后果：** 代码依赖声明内部结构，升级时容易断裂。

**错误示例：**

~~~~ts
import type { StoreToRefs } from 'pinia'
~~~~

**正确写法：**

~~~~ts
const fields = storeToRefs(store)
type Fields = typeof fields
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为提取会立即求值所有 getter

**触发条件：** 认为提取会立即求值所有 getter

**原因：** computed branch 在构造时不读取 `.value`。

**后果：** 为不存在的 eager 副作用编写错误初始化逻辑。

**错误示例：**

~~~~ts
storeToRefs(store)
// 以为所有 getter 已执行
~~~~

**正确写法：**

~~~~ts
const { expensive } = storeToRefs(store)
console.log(expensive.value)
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 四、源码推导与适用场景

:::steps
### 1. 先读取 raw store 保留分类信息

固定实现先调用 `toRaw(store)`，因此能看到 Setup Store 原始 ref/computed，而不是 reactive proxy 已解包后的值。适用于精确区分 state 与 getter。

### 2. computed 分支保留 getter 读写能力

实现用 `value.effect` 识别 computed，并创建带 get/set 的新 computed。readonly 与 writable getter 都保持原有能力。

### 3. ref/reactive 分支连接 Store 属性

其他 `isRef(value) || isReactive(value)` 通过 `toRef(store, key)` 暴露，适用于 Options/Setup state 与 plugin-added reactive state。

### 4. function 与普通值自然落入过滤外

两类值不命中 computed、ref 或 reactive 分支，因此 action 直接解构，普通 plugin field 继续留在 store。

### 5. 官方测试固定可观察边界

`storeToRefs.spec.ts` 覆盖 Options/Setup state、getter、plugin ref 与普通值、writable computed setter 和 getter lazy。这些是 public regression seam。

### 6. Store 创建器同时保留 raw 返回面

固定 `store.ts` 把 setup 返回值赋给 reactive store 与 raw store，使 helper 遍历 raw store 仍能看到完整响应式字段。
:::
