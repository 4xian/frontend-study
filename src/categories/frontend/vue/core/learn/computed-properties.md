---
id: vue.core.learn.basics.computed-properties
type: lesson
title: 计算属性
summary: 用 computed 声明同步派生状态，并理解缓存、惰性求值和只读边界
domain: frontend
technology: vue
module: core
related:
  - vue.core.learn.basics.reactive-state
  - vue.core.learn.basics.conditional-list-rendering
  - vue.core.reference.reactivity-watchers.computed
  - vue.core.reference.reactivity.ref
  - vue.core.reference.reactivity-watchers.watch
tags:
  - computed
  - 计算属性
  - 派生状态
  - 缓存
  - 惰性求值
  - Composition API
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-29
sources:
  - title: Vue 计算属性
    url: https://cn.vuejs.org/guide/essentials/computed.html
  - title: Vue 响应式 API：computed
    url: https://cn.vuejs.org/api/reactivity-core.html#computed
  - title: Vue TypeScript：为 computed 标注类型
    url: https://cn.vuejs.org/guide/typescript/composition-api.html#typing-computed
  - title: Vue 响应式基础：模板中的 ref 解包
    url: https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html#ref-unwrapping-in-templates
  - title: Vue 性能优化：计算属性稳定性
    url: https://cn.vuejs.org/guide/best-practices/performance.html#computed-stability
  - title: Vue 深入响应式：计算属性调试
    url: https://cn.vuejs.org/guide/extras/reactivity-in-depth.html#computed-debugging
  - title: Vue 3.5.40 computed.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/computed.ts
  - title: Vue 3.5.40 effect.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effect.ts
  - title: Vue 3.5.40 dep.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/dep.ts
  - title: Vue 3.5.40 computed 官方测试
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/computed.spec.ts
stage: basics
level: beginner
estimatedMinutes: 35
prerequisites:
  - vue.core.learn.basics.reactive-state
objectives:
  - 把依赖现有状态的重复表达式整理为有名字的计算属性
  - 解释 computed 的缓存、惰性求值和动态依赖行为
  - 区分派生值、普通函数与需要交给侦听器的副作用
  - 在确有双向适配需求时使用可写计算属性
recap:
  - 源状态保存事实，computed 声明由这些事实得到的同步派生值。
  - computed 首次读取才求值，依赖不变时复用缓存，依赖变化后在下次读取时重算。
  - getter 只读取依赖并返回结果；请求、存储和 DOM 操作属于副作用。
  - getter-only computed 默认只读，可写 computed 的 setter 必须反向更新源状态。
---

# 计算属性

## 一、从源状态得到派生值

上一课已经用 `ref()` 保存会变化的事实。总价、筛选结果和状态文案不需要再保存一份，它们都可以根据现有状态随时得到。`computed()` 用来声明这种同步派生关系，让模板只读取有意义的名字。

~~~~vue
<script setup lang="ts">
import { computed, ref } from 'vue'

const price = ref(12)
const quantity = ref(2)
const total = computed(() => price.value * quantity.value)
</script>

<template>
  <p>总价：¥{{ total }}</p>
</template>
~~~~

`price` 和 `quantity` 是源状态，`total` 是派生状态。源状态负责保存事实，计算属性只描述怎样从事实得到结果，不复制一份需要手动同步的新状态。

## 二、脚本读取 value，模板自动解包

getter-only `computed()` 返回一个只读的 computed ref。脚本中读取结果要写 `total.value`；模板中的顶层 ref 会自动解包，因此直接写 `{{ total }}`。这与上一课的 `ref()` 访问规则一致。

~~~~ts
import { computed, ref } from 'vue'

const firstName = ref('Ada')
const lastName = ref('Lovelace')
const fullName = computed(() => firstName.value + ' ' + lastName.value)

console.log(fullName.value) // Ada Lovelace
~~~~

:::tip
TypeScript 通常能从 getter 返回值推导类型。只有确实需要约束公共返回类型时，才写 `computed<number>(() => ...)`，不要为简单示例重复标注。
:::

## 三、缓存与惰性求值

创建 computed 时不会立刻执行 getter。第一次读取时才计算并缓存结果；依赖没有变化时，重复读取直接复用缓存。依赖变化只会让缓存失效，真正的重算仍然延迟到下一次读取。

:::steps
### 创建

只保存 getter，执行次数仍为 0。

### 首次读取

执行 getter、收集本次实际读取的依赖并缓存结果。

### 重复读取

依赖未变时直接返回缓存，getter 不再执行。

### 依赖变化

computed 先失效；下次读取时才重新执行 getter。
:::

普通函数则在每次调用时执行。选择 computed 的首要理由是它表达一个可复用的派生值；当这个计算有成本或被多处读取时，按依赖缓存还可以避免重复工作。

## 四、观察 getter 何时执行

下面的实验不会在模板中直接读取 `total`，只有点击按钮时才访问 `.value`。先连续读取验证缓存，再修改无关备注、价格和条件折扣，观察执行次数与当前依赖如何变化。

:::demo{id="vue.core.learn.basics.computed-properties.computed-dependency-demo" playground="true"}
观察 computed 的缓存、惰性求值和条件分支产生的动态依赖
:::

## 五、依赖来自本次实际读取

Vue 在 getter 执行时追踪真正读取到的响应式值。条件分支没有进入时，分支里的 ref 不属于本次依赖；分支切换并重新求值后，Vue 会建立新依赖并清理已经离开的旧依赖。

~~~~ts
const discountEnabled = ref(false)
const subtotal = ref(100)
const discountRate = ref(0.1)

const total = computed(() =>
  discountEnabled.value
    ? subtotal.value * (1 - discountRate.value)
    : subtotal.value,
)
~~~~

折扣关闭时 getter 不读取 `discountRate.value`，此时单独修改折扣率不会让 `total` 失效。开启折扣并完成一次读取后，折扣率才进入当前依赖集合。

## 六、选择 computed、函数还是 watcher

| 需求 | 选择 | 原因 |
| --- | --- | --- |
| 由响应式状态得到一个可复用的同步值 | computed | 声明派生关系并按依赖缓存 |
| 每次调用都带不同参数 | 普通函数 | 参数本身就是本次计算输入 |
| 明确要求每次调用重新计算 | 普通函数 | 不需要缓存语义 |
| 请求数据、写存储、操作 DOM | watcher 或事件 | 这些是副作用，不是派生值 |
| 独立保存并主动修改的业务数据 | ref / reactive | 它属于源状态 |

:::tip
下一课“侦听器”会系统讲解状态变化后的副作用、异步请求和清理。本课只需要记住：computed getter 必须保持同步、可预测并只返回结果。
:::

## 七、需要时才使用可写 computed

只传 getter 得到的计算属性不可写。少数场景需要把一个派生视图作为双向适配入口时，可以提供 `get` 和 `set`。setter 不会给 computed 保存新值，它必须解析输入并更新真正的源状态。

~~~~ts
import { computed, ref } from 'vue'

const firstName = ref('Ada')
const lastName = ref('Lovelace')

const fullName = computed({
  get: () => firstName.value + ' ' + lastName.value,
  set: (value: string) => {
    const [first = '', ...rest] = value.trim().split(/\s+/)
    firstName.value = first
    lastName.value = rest.join(' ')
  },
})
~~~~

绝大多数计算属性都应保持 getter-only。可写 computed 适合单位换算、字段合并拆分或组件模型适配，不应被当成另一种独立状态容器。

## 八、易错使用提示

:::pitfalls
### 混淆脚本与模板中的 value

**触发条件：** 混淆脚本与模板中的 value

**原因：** 脚本拿到的是 computed ref 对象，模板才会自动解包顶层 ref。两个位置使用同一种写法会得到不同结果。

**后果：** 脚本比较和运算落在对象上；模板顶层多写 `.value` 则破坏统一访问规则并可能得到 undefined。

**错误示例：**

~~~~vue
<script setup lang="ts">
if (remainingCount > 0) {
  console.log('还有课程')
}
</script>

<template>{{ remainingCount.value }}</template>
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts">
if (remainingCount.value > 0) {
  console.log('还有课程')
}
</script>

<template>{{ remainingCount }}</template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 依赖非响应式值并期待自动更新

**触发条件：** 依赖非响应式值并期待自动更新

**原因：** `Date.now()`、普通变量和外部 SDK 状态不会被 Vue 追踪。computed 没有响应式依赖变化时会持续复用缓存。

**后果：** 时间或外部值已经改变，页面仍停留在第一次求值结果，看起来像 computed 不工作。

**错误示例：**

~~~~ts
const now = computed(() => Date.now())
~~~~

**正确写法：**

~~~~ts
const now = ref(Date.now())

// 由事件或生命周期负责更新源状态，computed 只派生显示文本。
const timeLabel = computed(() => new Date(now.value).toLocaleTimeString())
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 getter 中修改状态、请求数据或操作 DOM

**触发条件：** 在 getter 中修改状态、请求数据或操作 DOM

**原因：** getter 的执行由读取和缓存决定，不具备“一次变化就执行一次”的副作用契约。

**后果：** 副作用可能因为未读取而遗漏，也可能在难以预测的读取时机运行；修改自身依赖还可能造成递归更新。

**错误示例：**

~~~~ts
const profile = computed(() => {
  count.value++
  void fetch('/api/profile')
  return count.value
})
~~~~

**正确写法：**

~~~~ts
const profileUrl = computed(() => '/api/users/' + userId.value)

// 异步请求留给事件或下一课的 watcher。
async function loadProfile(): Promise<void> {
  await fetch(profileUrl.value)
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 给 getter-only computed 赋值

**触发条件：** 给 getter-only computed 赋值

**原因：** 只传 getter 时返回的是只读计算属性。它看起来像 ref，但没有可写 setter。

**后果：** TypeScript 会阻止赋值；绕过类型后，开发模式发出只读警告，源状态仍然不变。

**错误示例：**

~~~~ts
const fullName = computed(() => first.value + ' ' + last.value)
fullName.value = 'Grace Hopper'
~~~~

**正确写法：**

~~~~ts
first.value = 'Grace'
last.value = 'Hopper'
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 writable setter 中只返回新值

**触发条件：** 在 writable setter 中只返回新值

**原因：** 写入可写 computed 时，Vue 只调用 setter；setter 的返回值会被忽略。

**后果：** 下一次读取仍由旧源状态计算，表现为赋值没有生效。

**错误示例：**

~~~~ts
const normalizedName = computed({
  get: () => name.value.trim(),
  set: (value: string) => value.trim(),
})
~~~~

**正确写法：**

~~~~ts
const normalizedName = computed({
  get: () => name.value.trim(),
  set: (value: string) => {
    name.value = value.trim()
  },
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 直接修改 computed 返回的对象

**触发条件：** 直接修改 computed 返回的对象

**原因：** getter-only 只限制替换 `.value`。返回对象不会自动变成深只读代理，但它仍是由源状态得到的派生快照。

**后果：** 修改路径绕过源状态的明确入口，后续重算还可能覆盖本地修改，状态所有权变得混乱。

**错误示例：**

~~~~ts
const selectedUser = computed(() =>
  users.value.find((user) => user.id === selectedId.value),
)

selectedUser.value!.name = 'Grace'
~~~~

**正确写法：**

~~~~ts
/** 更新当前选中用户的源记录。 */
function renameSelectedUser(name: string): void {
  const user = users.value.find((item) => item.id === selectedId.value)
  if (user) user.name = name
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 以为所有代码分支都会永久成为依赖

**触发条件：** 以为所有代码分支都会永久成为依赖

**原因：** computed 只追踪本次 getter 实际读取的响应式值，未进入的条件分支不会加入当前依赖。

**后果：** 修改未启用分支的状态不会触发失效，调试时容易被误判为响应式失效。

**错误示例：**

~~~~ts
const total = computed(() =>
  enabled.value ? discounted.value : original.value,
)

// enabled 为 false 时，修改 discounted 不会使 total 失效。
~~~~

**正确写法：**

~~~~ts
// 把依赖理解为“本次求值实际读取”。
enabled.value = true
console.log(total.value)
discounted.value = 80
~~~~

**验证方式：** 对照正确写法验证结果。

### 每次返回新对象并期待内容相同就保持稳定

**触发条件：** 每次返回新对象并期待内容相同就保持稳定

**原因：** Vue 使用 `Object.is` 语义比较新旧结果。内容相同的新对象仍是不同引用。

**后果：** computed 的结果版本会变化，依赖它的下游可能执行不必要的更新。

**错误示例：**

~~~~ts
const parity = computed(() => ({
  even: count.value % 2 === 0,
}))
~~~~

**正确写法：**

~~~~ts
const isEven = computed(() => count.value % 2 === 0)
~~~~

**验证方式：** 对照正确写法验证结果。

### 把需要参数的查询硬塞进 computed

**触发条件：** 把需要参数的查询硬塞进 computed

**原因：** computed 表示一个固定派生 ref，不会像函数一样自然接收每次调用的不同参数。

**后果：** 为了传参额外维护“当前参数”状态，简单查询变得耦合且难复用。

**错误示例：**

~~~~ts
const selectedId = ref('')
const selectedLesson = computed(() =>
  lessons.value.find((lesson) => lesson.id === selectedId.value),
)
~~~~

**正确写法：**

~~~~ts
/** 按稳定 ID 查询课程。 */
function findLesson(id: string) {
  return lessons.value.find((lesson) => lesson.id === id)
}
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 九、从源码推导适用场景

:::steps
### 昂贵且会重复读取的同步派生值

`computed.ts` 创建实例时不执行 getter；`refreshComputed()` 只在需要时刷新。过滤、排序、汇总等重复读取场景可以利用缓存。

### 把多个派生值继续组合

computed 自己拥有 `dep`，既能订阅源状态，也能被模板、其他 computed 或 effect 订阅，适合建立清晰的派生链。

### 让条件分支只订阅当前需要的输入

`prepareDeps()`、`Dep.track()` 与 `cleanupDeps()` 会按本次读取刷新依赖集合，昂贵分支关闭时不必持续订阅分支数据。

### 优先返回原始值或稳定引用

`refreshComputed()` 通过 `Object.is` 语义判断结果是否变化。返回布尔值、数字、字符串或稳定引用更容易避免无意义的下游更新。

### 用 writable computed 做双向适配

`ComputedRefImpl` 并不保存 setter 的返回值；写入只转交给 setter。它适合把输入转换后提交到源状态，不适合承载独立业务事实。
:::

:::tip
getter 的 `oldValue` 与 `onTrack` / `onTrigger` 调试钩子属于进阶能力。先掌握普通派生值；遇到真实对象稳定性或依赖调试问题时，再进入 computed API 参考页。
:::

:::exercise
### 制作课程进度摘要

**要求：**

~~~~text
准备三条带 completed 字段的课程记录和一个 query ref。用 computed 得到过滤后的课程、已完成数量和摘要文案。不要复制一份 summary ref，也不要在 getter 中修改课程。再思考：按任意 ID 查询课程应写 computed 还是普通函数？
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
import { computed, ref } from 'vue'

const query = ref('')
const lessons = ref([
  { id: 'state', title: '响应式状态', completed: true },
  { id: 'computed', title: '计算属性', completed: false },
  { id: 'watch', title: '侦听器', completed: false },
])

const visibleLessons = computed(() =>
  lessons.value.filter((lesson) => lesson.title.includes(query.value.trim())),
)
const completedCount = computed(
  () => lessons.value.filter((lesson) => lesson.completed).length,
)
const summary = computed(
  () => completedCount.value + ' / ' + lessons.value.length + ' 已完成',
)

/** 按稳定 ID 查询课程。 */
function findLesson(id: string) {
  return lessons.value.find((lesson) => lesson.id === id)
}
~~~~
:::
