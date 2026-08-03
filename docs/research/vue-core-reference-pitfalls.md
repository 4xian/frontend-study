# Vue 核心参考条目易错使用点调研

> 调研日期：2026-07-28  
> 适用基线：Vue 3.5.40  
> 资料范围：15 篇本地条目列出的 Vue 官方中英文文档、Vue 官方文档仓库原始 Markdown，以及 `vuejs/core` 的 `v3.5.40` 固定标签源码。根进程已尝试 Tavily 分类检索，但接口返回 plan usage limit，因此回退到直接读取上述一手资料；本批结论不依赖社区文章、搜索摘要或未合并提案。

下列“错误代码”用于复现错误直觉，“正确代码”展示最小替换路径。示例省略与问题无关的组件外壳和导入，但不省略决定行为的 `.value`、同步注册、空值检查、清理或刷新时机。

## 当前 15 篇条目的建议提示

### `customRef()`

#### 1. 把 `track()` / `trigger()` 当成可省略的样板代码

- **错误假设 / 原因：** 误以为 `customRef()` 仍会像普通 `ref()` 一样自动收集读取方、自动通知写入。实际上工厂接管了这两个时机；源码中的 `CustomRefImpl` 只把 `Dep` 的 `track` 和 `trigger` 交给工厂，不会代替调用。
- **可观察后果：** `get()` 不调用 `track()` 时，模板、computed、watch 不会订阅；`set()` 提交新值后不调用 `trigger()` 时，已经订阅的使用方仍显示旧结果。
- **错误代码：**

```ts
const count = customRef(() => ({
  get: () => value,
  set: (next) => (value = next),
}))
```

- **正确代码：**

```ts
const count = customRef((track, trigger) => ({
  get() {
    track()
    return value
  },
  set(next) {
    value = next
    trigger()
  },
}))
```

- **一手来源：** [Vue 进阶 API：customRef](https://cn.vuejs.org/api/reactivity-advanced.html#customref)、[Vue 3.5.40 `ref.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts#L293-L329)

#### 2. getter 每次返回一个新对象也不会影响子组件

- **错误假设 / 原因：** 只关注对象内容相同，忽略了 prop 比较使用对象身份；父组件因无关状态重渲染时，getter 会再次求值并产生不同引用，即使 custom ref 的 setter 没有触发。
- **可观察后果：** 子组件把 prop 判定为变化并更新，而父组件中依赖该 custom ref 的响应式副作用没有对应触发，父子两侧出现难以解释的不一致更新。
- **错误代码：**

```ts
const model = customRef((track) => ({
  get() {
    track()
    return { value }
  },
  set(next) {
    value = next.value
  },
}))
```

- **正确代码：**

```ts
const model = customRef((track, trigger) => ({
  get() {
    track()
    return value
  },
  set(next) {
    value = next
    trigger()
  },
}))
```

- **一手来源：** [Vue 官方 customRef “谨慎使用”说明](https://cn.vuejs.org/api/reactivity-advanced.html#customref)

### `effectScope()`

#### 1. 在 `scope.run()` 外创建副作用，再期待 `scope.stop()` 接管

- **错误假设 / 原因：** 误以为 scope 会按变量引用或创建先后关系查找副作用。实际捕获依赖“创建时的当前 active scope”，只有 `run()` 的同步调用栈会把目标 scope 设为当前值。
- **可观察后果：** 调用 `scope.stop()` 后，外部创建的 watch / watchEffect 仍继续回调；其中的请求、订阅或定时器也可能继续存活。
- **错误代码：**

```ts
const stopWatching = watchEffect(loadData)
const scope = effectScope()
scope.stop() // 不会停止上面的 watchEffect
```

- **正确代码：**

```ts
const scope = effectScope()
scope.run(() => {
  watchEffect(loadData)
})
scope.stop()
```

- **一手来源：** [Vue 进阶 API：effectScope](https://cn.vuejs.org/api/reactivity-advanced.html#effectscope)、[Vue 3.5.40 `effectScope.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effectScope.ts#L106-L170)

#### 2. 在 `await` 之后才调用 `onScopeDispose()`

- **错误假设 / 原因：** 误以为 `scope.run(async () => ...)` 会在 Promise 完成前一直保留 active scope。`run()` 在异步函数返回 Promise 后就执行 `finally` 恢复先前 scope；await 后的续体已不在该同步上下文中。
- **可观察后果：** 开发环境提示当前没有 active effect scope，cleanup 没有登记；随后 `scope.stop()` 不会释放资源。
- **错误代码：**

```ts
scope.run(async () => {
  const socket = await openSocket()
  onScopeDispose(() => socket.close())
})
```

- **正确代码：**

```ts
scope.run(() => {
  const controller = new AbortController()
  onScopeDispose(() => controller.abort())
  void loadStream({ signal: controller.signal })
})
```

- **一手来源：** [Vue 进阶 API：onScopeDispose](https://cn.vuejs.org/api/reactivity-advanced.html#onscopedispose)、[Vue 3.5.40 `run()` 同步 active scope](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effectScope.ts#L106-L114)、[Vue 3.5.40 `onScopeDispose()`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effectScope.ts#L227-L235)

#### 3. 把 detached scope 当成会随父 scope 自动停止

- **错误假设 / 原因：** `effectScope(true)` 的 `true` 很容易被理解成“启用自动管理”，实际含义是 detached：不挂入当前父 scope 的子 scope 列表。
- **可观察后果：** 父组件卸载或父 scope 停止后，detached scope 中的副作用仍运行；重复创建会累积订阅。
- **错误代码：**

```ts
const cacheScope = effectScope(true)
cacheScope.run(() => watchEffect(refreshCache))
// 所有者结束时没有 stop
```

- **正确代码：**

```ts
const cacheScope = effectScope(true)
cacheScope.run(() => watchEffect(refreshCache))

function disposeCache() {
  cacheScope.stop()
}
```

- **一手来源：** [Vue 进阶 API：effectScope](https://cn.vuejs.org/api/reactivity-advanced.html#effectscope)、[Vue 3.5.40 父子 scope 关联](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effectScope.ts#L47-L55)

### `reactive()`

#### 1. 用 `reactive()` 包装基本类型

- **错误假设 / 原因：** API 名称容易让人以为任何值都能“变成响应式”；但 `reactive()` 的类型和运行时代理机制都要求对象、数组或集合，基本类型不能被 Proxy 包装成相同语义的状态。
- **可观察后果：** 得不到可按预期追踪的数字、字符串或布尔状态，后续读取和赋值也没有稳定的响应式容器。
- **错误代码：**

```ts
const count = reactive(0)
```

- **正确代码：**

```ts
const count = ref(0)
count.value++
```

- **一手来源：** [Vue 响应式基础：`reactive()` 的局限](https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html#limitations-of-reactive)

#### 2. 用新代理替换整个 `reactive` 变量

- **错误假设 / 原因：** 误以为使用方订阅的是变量名 `state`。Vue 实际通过旧代理上的属性访问建立连接，变量重新指向新代理不会把既有订阅迁移过去。
- **可观察后果：** 持有旧代理的 computed、watch、组件或函数继续观察旧对象；新对象变化不一定驱动它们更新。
- **错误代码：**

```ts
let state = reactive({ count: 0 })
state = reactive({ count: 1 })
```

- **正确代码：**

```ts
const state = ref({ count: 0 })
state.value = { count: 1 }
```

- **一手来源：** [Vue 响应式基础：不能替换整个对象](https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html#limitations-of-reactive)

#### 3. 解构基本类型属性后仍期待双向响应

- **错误假设 / 原因：** 解构语法只复制当前属性值；对数字、字符串等基本类型而言，本地变量不再经过代理的 get / set 拦截。
- **可观察后果：** 修改解构变量不会修改源状态；源状态变化也不会更新该变量，依赖它的逻辑读到旧值。
- **错误代码：**

```ts
const state = reactive({ count: 0 })
let { count } = state
count++
```

- **正确代码：**

```ts
const state = reactive({ count: 0 })
const { count } = toRefs(state)
count.value++
```

- **一手来源：** [Vue 响应式基础：对解构不友好](https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html#limitations-of-reactive)、[Vue 工具 API：toRefs](https://cn.vuejs.org/api/reactivity-utilities.html#torefs)

### `readonly()` / `shallowReadonly()`

#### 1. 把 readonly 代理当成不会变化的快照

- **错误假设 / 原因：** 把“不能通过这个入口写”误解成 `Object.freeze()` 式静态值。`readonly(reactiveSource)` 仍追踪源代理，源所有者可以继续更新它。
- **可观察后果：** watch、computed 和模板会随着源状态更新；依赖“视图永远不变”的缓存或比较逻辑得到意外结果。
- **错误代码：**

```ts
const source = reactive({ count: 0 })
const snapshot = readonly(source)
source.count++ // snapshot.count 也变成 1
```

- **正确代码：**

```ts
const source = reactive({ count: 0 })
const view = readonly(source) // 明确作为只读视图
const snapshot = structuredClone(toRaw(source)) // 真正按需复制快照
```

- **一手来源：** [Vue 核心 API：readonly](https://cn.vuejs.org/api/reactivity-core.html#readonly)

#### 2. 通过 readonly 代理写入，再期待源状态改变

- **错误假设 / 原因：** TypeScript 的 `Readonly` 容易被看成只提供编译期提示；Vue 的 readonly 代理在运行时也会拦截 `set` 和 `deleteProperty`。
- **可观察后果：** 写入没有生效，开发环境出现 readonly 警告；后续业务逻辑仍读到旧值。
- **错误代码：**

```ts
const view = readonly(source)
view.count++
delete view.label
```

- **正确代码：**

```ts
const view = readonly(source)

function increment() {
  source.count++
}
```

- **一手来源：** [Vue 核心 API：readonly](https://cn.vuejs.org/api/reactivity-core.html#readonly)、[Vue 3.5.40 readonly handler](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/baseHandlers.ts#L230-L247)

#### 3. 认为 `shallowReadonly()` 会递归保护嵌套对象

- **错误假设 / 原因：** 忽略 shallow 只转换根级属性；嵌套对象按原值暴露，不会被递归包装成 readonly 代理。
- **可观察后果：** 根属性赋值会被拦截，但 `state.nested.count++` 可以成功，形成“有的写入被挡、有的没被挡”的混合边界。
- **错误代码：**

```ts
const state = shallowReadonly({ nested: { count: 0 } })
state.nested.count++ // 可以修改
```

- **正确代码：**

```ts
const state = readonly({ nested: { count: 0 } })
// state.nested.count++ 会被 readonly 代理拦截
```

- **一手来源：** [Vue 进阶 API：shallowReadonly](https://cn.vuejs.org/api/reactivity-advanced.html#shallowreadonly)

### `ref()`

#### 1. 在脚本中省略 `.value`

- **错误假设 / 原因：** 模板会自动解包顶层 ref，容易把这条便利规则误带到 JavaScript / TypeScript。脚本里变量本身仍是 `Ref` 对象。
- **可观察后果：** `const` ref 被重新赋值时报错，或运算针对 ref 对象而不是内部值；响应式值没有按预期更新。
- **错误代码：**

```ts
const count = ref(0)
count++
```

- **正确代码：**

```ts
const count = ref(0)
count.value++
```

- **一手来源：** [Vue 核心 API：ref](https://cn.vuejs.org/api/reactivity-core.html#ref)、[Vue 响应式基础：ref](https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html#ref)

#### 2. 认为响应式数组和集合会自动解包其中的 ref

- **错误假设 / 原因：** 深层 reactive 对象属性会解包 ref，但官方明确把数组元素和 `Map` 等原生集合列为例外。
- **可观察后果：** 表达式拿到 ref 对象，数值运算、字符串拼接或比较产生错误结果。
- **错误代码：**

```ts
const books = reactive([ref('Vue 3 Guide')])
console.log(books[0].toUpperCase())
```

- **正确代码：**

```ts
const books = reactive([ref('Vue 3 Guide')])
console.log(books[0].value.toUpperCase())
```

- **一手来源：** [Vue 响应式基础：数组和集合注意事项](https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html#caveat-in-arrays-and-collections)、[Vue 核心 API：reactive](https://cn.vuejs.org/api/reactivity-core.html#reactive)

#### 3. 认为模板表达式会递归解包任意嵌套 ref

- **错误假设 / 原因：** 模板自动解包主要适用于渲染上下文的顶层属性；`object.id` 不是顶层属性。只有当它是文本插值最终值时另有便利解包，参与 `+ 1` 时不会先变成数字。
- **可观察后果：** `{{ object.id + 1 }}` 可能渲染为 `[object Object]1`，而不是 `2`。
- **错误代码：**

```vue
<script setup lang="ts">
const object = { id: ref(1) }
</script>

<template>{{ object.id + 1 }}</template>
```

- **正确代码：**

```vue
<script setup lang="ts">
const { id } = { id: ref(1) }
</script>

<template>{{ id + 1 }}</template>
```

- **一手来源：** [Vue 响应式基础：模板解包注意事项](https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html#caveat-when-unwrapping-in-templates)

### `shallowRef()` / `shallowReactive()`

#### 1. 深改 `shallowRef` 内部对象后等待自动更新

- **错误假设 / 原因：** 把 shallowRef 当成“性能更好的普通 ref”。它只追踪 `.value` 的访问和替换，内部对象按原样保存，不做深层响应式转换。
- **可观察后果：** `state.value.count++` 已修改原始对象，但模板、computed 和 watcher 不会因此重跑。
- **错误代码：**

```ts
const state = shallowRef({ count: 0 })
state.value.count++
```

- **正确代码：**

```ts
const state = shallowRef({ count: 0 })
state.value = { ...state.value, count: state.value.count + 1 }
```

必须原地深改时，可在一次修改完成后显式触发：

```ts
state.value.count++
triggerRef(state)
```

- **一手来源：** [Vue 进阶 API：shallowRef](https://cn.vuejs.org/api/reactivity-advanced.html#shallowref)、[Vue 进阶 API：triggerRef](https://cn.vuejs.org/api/reactivity-advanced.html#triggerref)

#### 2. 把 `shallowReactive()` 当成深层响应式对象

- **错误假设 / 原因：** shallowReactive 仅使根级属性响应式；嵌套对象保持原样，根级 ref 属性也不会像深层 reactive 那样自动解包。
- **可观察后果：** 修改 `state.nested.count` 不触发更新；把 `state.someRef` 当数字使用时实际拿到 ref 对象。
- **错误代码：**

```ts
const state = shallowReactive({ nested: { count: 0 } })
state.nested.count++
```

- **正确代码：**

```ts
const state = shallowReactive({ nested: { count: 0 } })
state.nested = { ...state.nested, count: state.nested.count + 1 }
```

- **一手来源：** [Vue 进阶 API：shallowReactive](https://cn.vuejs.org/api/reactivity-advanced.html#shallowreactive)

#### 3. 把浅层代理嵌进深层响应式树

- **错误假设 / 原因：** 误以为外层 `reactive()` 会补齐内部 shallowReactive 的深层转换。官方明确不建议把浅层结构嵌套在深层响应式对象中，因为它会制造不一致的响应语义。
- **可观察后果：** 同一状态树中，一部分深改会触发、一部分不会触发；维护者很难从访问路径判断更新行为。
- **错误代码：**

```ts
const child = shallowReactive({ nested: { count: 0 } })
const state = reactive({ child })
```

- **正确代码：**

```ts
// shallow 状态保持为清晰的根级边界
const childState = shallowReactive({ nested: { count: 0 } })

// 如果必须成为深层树的一部分，就统一使用 reactive
const state = reactive({ child: { nested: { count: 0 } } })
```

- **一手来源：** [Vue 官方 shallowReactive “谨慎使用”说明](https://cn.vuejs.org/api/reactivity-advanced.html#shallowreactive)

### `toRef()` / `toRefs()`

#### 1. 用 `ref(state.foo)` 代替属性 ref

- **错误假设 / 原因：** `ref()` 接收到的是调用当下的普通属性值，它会创建独立存储；`toRef(object, key)` 才会把 `.value` 的读写转发到源属性。
- **可观察后果：** 源对象和新 ref 各自变化，另一方不跟随，界面出现两份不同状态。
- **错误代码：**

```ts
const state = reactive({ foo: 1 })
const foo = ref(state.foo)
state.foo++ // foo.value 仍为 1
```

- **正确代码：**

```ts
const state = reactive({ foo: 1 })
const foo = toRef(state, 'foo')
state.foo++ // foo.value 同步为 2
```

- **一手来源：** [Vue 工具 API：toRef](https://cn.vuejs.org/api/reactivity-utilities.html#toref)、[Vue 3.5.40 `ObjectRefImpl`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts#L372-L431)

#### 2. 通过 props 的属性 ref 反向修改 prop

- **错误假设 / 原因：** `toRef(props, 'foo')` 的类型外观看起来像普通 ref，但它的 setter 会写回 props；props 的运行时只读约束仍然存在。
- **可观察后果：** 写入等同直接修改 prop，开发环境警告且数据流不可靠；父组件下一次更新还可能覆盖本地结果。
- **错误代码：**

```ts
const foo = toRef(props, 'foo')
foo.value = 'next'
```

- **正确代码：**

```ts
const foo = toRef(() => props.foo)

function updateFoo(value: string) {
  emit('update:foo', value)
}
```

- **一手来源：** [Vue 工具 API：toRef 与组件 props](https://cn.vuejs.org/api/reactivity-utilities.html#toref)、[Vue 组件 props：单向数据流](https://cn.vuejs.org/guide/components/props.html#one-way-data-flow)

#### 3. 期待 `toRefs()` 自动加入未来新增的属性

- **错误假设 / 原因：** `toRefs()` 看起来像对象的持续响应式映射，实际只在调用时遍历源对象当前的可枚举属性并逐个创建属性 ref。
- **可观察后果：** 之后新增 `state.optional`，返回对象上仍没有 `optional`；解构值是 undefined 或根本不存在。
- **错误代码：**

```ts
const state = reactive<{ optional?: string }>({})
const refs = toRefs(state)
state.optional = 'ready'
console.log(refs.optional) // undefined
```

- **正确代码：**

```ts
const state = reactive<{ optional?: string }>({})
const optional = toRef(state, 'optional')
state.optional = 'ready'
console.log(optional.value) // ready
```

- **一手来源：** [Vue 工具 API：toRefs](https://cn.vuejs.org/api/reactivity-utilities.html#torefs)、[Vue 3.5.40 `ref.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts#L361-L368)

### 响应式工具函数

#### 1. 用 `unref()` 解析 getter

- **错误假设 / 原因：** 把 `unref()` 和 3.3+ 的 `toValue()` 当成同义词。`unref()` 只在输入是 ref 时读取 `.value`，普通函数会被原样返回；`toValue()` 才会额外调用 getter。
- **可观察后果：** 业务函数拿到函数对象而不是 getter 的返回值，比较、请求参数或序列化结果错误。
- **错误代码：**

```ts
const id = ref(1)
const value = unref(() => id.value)
// value 是函数，不是 1
```

- **正确代码：**

```ts
const id = ref(1)
const value = toValue(() => id.value)
```

- **一手来源：** [Vue 工具 API：toValue](https://cn.vuejs.org/api/reactivity-utilities.html#tovalue)、[Vue 工具 API：unref](https://cn.vuejs.org/api/reactivity-utilities.html#unref)

#### 2. 用 `isReadonly()` 推断“它一定是对象代理”

- **错误假设 / 原因：** `isReadonly()` 判断的是只读语义，不是值的完整种类；没有 setter 的 computed ref 也被标记为 readonly。
- **可观察后果：** 代码进入“只读对象代理”分支后按普通对象枚举或调用对象 API，实际值却是 ref，导致逻辑误判。
- **错误代码：**

```ts
if (isReadonly(value)) {
  sendObject(Object.keys(value))
}
```

- **正确代码：**

```ts
if (isRef(value) && isReadonly(value)) {
  sendValue(value.value)
} else if (isProxy(value) && isReadonly(value)) {
  sendObject(Object.keys(value))
}
```

- **一手来源：** [Vue 工具 API：isReadonly](https://cn.vuejs.org/api/reactivity-utilities.html#isreadonly)、[Vue 3.5.40 `reactive.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/reactive.ts#L340-L348)

#### 3. 长期保存并写入 `toRaw()` 返回值

- **错误假设 / 原因：** 把 `toRaw()` 当成“解除代理但保留响应式连接”。官方只把它定义为临时逃生口；原始对象的写入绕过代理拦截。
- **可观察后果：** 原始对象已经变化，但依赖代理的模板、computed 和 watcher 没有收到通知；同时持有 raw 与 proxy 还会混淆身份比较。
- **错误代码：**

```ts
const state = reactive({ count: 0 })
const raw = toRaw(state)
raw.count++
```

- **正确代码：**

```ts
const state = reactive({ count: 0 })
inspectOnce(toRaw(state)) // 临时读取后丢弃 raw
state.count++ // 写入仍走代理
```

- **一手来源：** [Vue 进阶 API：toRaw](https://cn.vuejs.org/api/reactivity-advanced.html#toraw)

#### 4. 认为 `markRaw()` 会递归标记整棵对象树

- **错误假设 / 原因：** `markRaw()` 的退出转换只作用于被标记的根对象；未标记的嵌套对象之后放入 reactive 容器，仍会被转换为代理。
- **可观察后果：** 同一个嵌套对象同时出现 raw 和 proxy 两种身份，`===`、Map key 或依赖对象身份的去重逻辑失败。
- **错误代码：**

```ts
const raw = markRaw({ nested: {} })
const state = reactive({ nested: raw.nested })
console.log(raw.nested === state.nested) // false
```

- **正确代码：**

```ts
const nested = markRaw({})
const raw = markRaw({ nested })
const state = reactive({ nested })
console.log(raw.nested === state.nested) // true
```

- **一手来源：** [Vue 进阶 API：markRaw 与 identity hazard](https://cn.vuejs.org/api/reactivity-advanced.html#markraw)

### `computed()`

#### 1. 依赖 `Date.now()` 等非响应式值并期待自动刷新

- **错误假设 / 原因：** 误以为 computed 会按时间或每次渲染重新执行。它只在追踪到的响应式依赖变化时失效，非响应式 API 不会使缓存变脏。
- **可观察后果：** 多次读取都返回首次求值结果；即使组件因其他原因重渲染，时间值也可能保持不变。
- **错误代码：**

```ts
const now = computed(() => Date.now())
```

- **正确代码：**

```ts
const now = ref(Date.now())
const timer = setInterval(() => (now.value = Date.now()), 1000)
onUnmounted(() => clearInterval(timer))
```

- **一手来源：** [Vue 计算属性：缓存与方法](https://cn.vuejs.org/guide/essentials/computed.html#computed-caching-vs-methods)

#### 2. 在 computed getter 中修改状态、发请求或操作 DOM

- **错误假设 / 原因：** 把 getter 当成普通事件回调。getter 是否执行取决于读取、依赖失效和缓存，不具备“一次变化对应一次副作用”的调用契约。
- **可观察后果：** 副作用可能因未读取而遗漏、因多处读取而在难以预测的时机发生，修改自身依赖时还可能产生递归更新。
- **错误代码：**

```ts
const profile = computed(() => {
  void fetch(`/api/users/${userId.value}`)
  return userId.value
})
```

- **正确代码：**

```ts
const profileKey = computed(() => userId.value)
watch(profileKey, (id) => {
  void fetch(`/api/users/${id}`)
})
```

- **一手来源：** [Vue 计算属性最佳实践：getter 应无副作用](https://cn.vuejs.org/guide/essentials/computed.html#getters-should-be-side-effect-free)

#### 3. 给 getter-only computed 赋值

- **错误假设 / 原因：** computed 返回 ref 形态，容易被当成普通可写 ref；但只传 getter 时返回的是 readonly computed ref。
- **可观察后果：** 运行时发出只读警告，源状态不变，后续读取仍返回由 getter 计算出的值。
- **错误代码：**

```ts
const fullName = computed(() => `${first.value} ${last.value}`)
fullName.value = 'Ada Lovelace'
```

- **正确代码：**

```ts
const fullName = computed({
  get: () => `${first.value} ${last.value}`,
  set: (value) => {
    ;[first.value, last.value] = value.split(' ')
  },
})
```

- **一手来源：** [Vue 计算属性：可写计算属性](https://cn.vuejs.org/guide/essentials/computed.html#writable-computed)、[Vue 3.5.40 `computed.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/computed.ts#L105-L111)

### `watch()`

#### 1. 直接把 reactive 对象的属性值传给 `watch()`

- **错误假设 / 原因：** `obj.count` 在调用 `watch()` 前已经求值成普通数字，不再是 ref、reactive 对象或 getter 这类有效侦听源。
- **可观察后果：** Vue 会把它视为无效源并警告，之后 `obj.count` 变化不会调用回调。
- **错误代码：**

```ts
const obj = reactive({ count: 0 })
watch(obj.count, (count) => console.log(count))
```

- **正确代码：**

```ts
const obj = reactive({ count: 0 })
watch(() => obj.count, (count) => console.log(count))
```

- **一手来源：** [Vue 侦听器：数据源类型](https://cn.vuejs.org/guide/essentials/watchers.html#watch-source-types)、[Vue 3.5.40 `watch.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/watch.ts#L127-L168)

#### 2. 用深层 watcher 的 `newValue` / `oldValue` 直接做对象差异

- **错误假设 / 原因：** `deep` 的职责是遍历嵌套属性建立依赖，不是自动复制变化前快照。对象内部原地修改时，回调的两个参数仍指向同一个对象。
- **可观察后果：** `newValue === oldValue` 为 true，比较函数看不到“修改前”的嵌套值，审计或撤销逻辑得到错误差异。
- **错误代码：**

```ts
watch(state, (next, previous) => {
  console.log(next === previous) // 深层原地修改时为 true
})
```

- **正确代码：**

```ts
watch(
  () => state.user.name,
  (nextName, previousName) => {
    recordRename(previousName, nextName)
  },
)
```

- **一手来源：** [Vue 侦听器：深层侦听器](https://cn.vuejs.org/guide/essentials/watchers.html#deep-watchers)、[Vue 核心 API：watch](https://cn.vuejs.org/api/reactivity-core.html#watch)

#### 3. 在首次 `await` 后才调用 `onWatcherCleanup()`

- **错误假设 / 原因：** 误以为异步 watcher 回调在 Promise 完成前一直是“当前 watcher”。`onWatcherCleanup()` 只能在 watch 回调或 watchEffect 的同步执行阶段关联当前侦听器。
- **可观察后果：** cleanup 注册失败或出现警告；参数快速变化时，旧请求仍可能最后返回并覆盖新结果。
- **错误代码：**

```ts
watch(id, async (value) => {
  const response = await fetch(`/api/${value}`)
  onWatcherCleanup(() => response.body?.cancel())
})
```

- **正确代码：**

```ts
watch(id, async (value) => {
  const controller = new AbortController()
  onWatcherCleanup(() => controller.abort())
  const response = await fetch(`/api/${value}`, { signal: controller.signal })
  data.value = await response.json()
})
```

- **一手来源：** [Vue 侦听器：副作用清理](https://cn.vuejs.org/guide/essentials/watchers.html#side-effect-cleanup)、[Vue 3.5.40 `watch.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/watch.ts#L103-L117)

#### 4. 对大型对象无差别启用无限深层侦听

- **错误假设 / 原因：** 认为 `deep: true` 只是“多监听一些事件”。Vue 必须递归遍历嵌套属性以收集依赖；对象越大、层级越深，遍历成本越高。
- **可观察后果：** 创建和重跑 watcher 时出现明显额外开销，频繁变更的大型数据结构可能造成卡顿。
- **错误代码：**

```ts
watch(largeState, persistEverything, { deep: true })
```

- **正确代码：**

```ts
watch(
  [() => largeState.user.id, () => largeState.settings.theme],
  persistRelevantFields,
)

// Vue 3.5+：确需遍历时可限制最大深度
watch(largeState, persistSection, { deep: 2 })
```

- **一手来源：** [Vue 侦听器：深层侦听器与 3.5+ 最大深度](https://cn.vuejs.org/guide/essentials/watchers.html#deep-watchers)、[Vue 3.5.40 `watch.ts` 的 traverse](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/watch.ts)

### `watchEffect()`

#### 1. 首次 `await` 之后才读取响应式依赖

- **错误假设 / 原因：** 误以为 async effect 整个 Promise 生命周期内的读取都会自动追踪。官方限定为同步执行阶段；只有首次 `await` 之前访问的属性会成为依赖。
- **可观察后果：** `id.value` 变化时 effect 不会因此重跑，请求或派生数据停在旧 ID。
- **错误代码：**

```ts
watchEffect(async () => {
  await prepare()
  await loadUser(id.value)
})
```

- **正确代码：**

```ts
watchEffect(async () => {
  const currentId = id.value
  await prepare()
  await loadUser(currentId)
})
```

依赖需要完全显式时，直接改用 `watch(id, ...)`：

```ts
watch(id, async (currentId) => {
  await prepare()
  await loadUser(currentId)
})
```

- **一手来源：** [Vue 侦听器：watchEffect 的同步追踪边界](https://cn.vuejs.org/guide/essentials/watchers.html#watcheffect)

#### 2. 把 `watchEffect()` 当成懒执行 watcher

- **错误假设 / 原因：** 与默认惰性的 `watch()` 混淆。`watchEffect()` 在创建时立即运行一次，以便发现同步读取的依赖。
- **可观察后果：** 尚未准备好的输入被访问，或页面初始化时提前发出一次请求、订阅一次资源。
- **错误代码：**

```ts
watchEffect(() => {
  void fetch(`/api/users/${selectedId.value}`)
})
```

- **正确代码：**

```ts
watch(selectedId, (id) => {
  void fetch(`/api/users/${id}`)
})
```

若仍需自动依赖追踪，应在首次执行中明确处理未就绪状态：

```ts
watchEffect(() => {
  if (selectedId.value == null) return
  void fetch(`/api/users/${selectedId.value}`)
})
```

- **一手来源：** [Vue 核心 API：watchEffect](https://cn.vuejs.org/api/reactivity-core.html#watcheffect)、[Vue 侦听器：watch 与 watchEffect](https://cn.vuejs.org/guide/essentials/watchers.html#watch-vs-watcheffect)

#### 3. 异步创建 watcher 后仍期待组件卸载时自动停止

- **错误假设 / 原因：** 组件只会自动停止在 setup 同步阶段创建并绑定到当前实例的 watcher；定时器或 Promise 回调执行时已经离开该同步上下文。
- **可观察后果：** 组件卸载后 effect 继续运行，读取旧组件状态或累积请求、订阅等资源。
- **错误代码：**

```ts
setTimeout(() => {
  watchEffect(syncRemoteState)
}, 100)
```

- **正确代码：**

```ts
const ready = ref(false)

watchEffect(() => {
  if (ready.value) syncRemoteState()
})

setTimeout(() => (ready.value = true), 100)
```

确需异步创建时必须保存并停止句柄：

```ts
let stop: (() => void) | undefined
const timer = setTimeout(() => (stop = watchEffect(syncRemoteState)), 100)
onUnmounted(() => {
  clearTimeout(timer)
  stop?.()
})
```

- **一手来源：** [Vue 侦听器：停止侦听器](https://cn.vuejs.org/guide/essentials/watchers.html#stopping-a-watcher)

### `watchPostEffect()` / `watchSyncEffect()`

#### 1. 用 pre / sync effect 读取组件更新后的 DOM

- **错误假设 / 原因：** 误以为 watcher 看到新状态时，组件 DOM 也必然完成更新。默认 pre 回调早于所有者组件 DOM 更新，sync 更是在 Vue 管理的更新前同步执行。
- **可观察后果：** `getBoundingClientRect()`、`textContent` 或焦点检查读到上一次渲染的 DOM 状态。
- **错误代码：**

```ts
watchSyncEffect(() => {
  width.value = panel.value?.getBoundingClientRect().width ?? 0
})
```

- **正确代码：**

```ts
watchPostEffect(() => {
  width.value = panel.value?.getBoundingClientRect().width ?? 0
})
```

- **一手来源：** [Vue 侦听器：回调刷新时机](https://cn.vuejs.org/guide/essentials/watchers.html#callback-flush-timing)、[Vue 3.5.40 `apiWatch.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiWatch.ts#L63-L85)

#### 2. 对会同步批量变更的数据使用 `watchSyncEffect()`

- **错误假设 / 原因：** 把 sync 理解成“更快”。同步 watcher 不进入批处理队列，每次检测到响应式修改都会立刻触发。
- **可观察后果：** 连续 push 100 个元素可能执行 100 次昂贵逻辑，中间状态也会逐一暴露给副作用。
- **错误代码：**

```ts
watchSyncEffect(() => rebuildIndex(items.value))

for (let index = 0; index < 100; index++) {
  items.value.push(index)
}
```

- **正确代码：**

```ts
watchEffect(() => rebuildIndex(items.value))

for (let index = 0; index < 100; index++) {
  items.value.push(index)
}
```

- **一手来源：** [Vue 侦听器：同步侦听器](https://cn.vuejs.org/guide/essentials/watchers.html#sync-watchers)、[Vue 核心 API：flush sync 的谨慎说明](https://cn.vuejs.org/api/reactivity-core.html#watcheffect)

### 生命周期钩子

#### 1. 在异步恢复后才注册生命周期钩子

- **错误假设 / 原因：** 生命周期 API 依赖当前 active component instance。`setTimeout()`、Promise 回调或普通 `async setup()` 的 await 续体通常已离开 setup 的同步调用栈，Vue 无法再把钩子关联到原实例。
- **可观察后果：** 开发环境警告“没有 active component instance”，钩子没有登记，挂载或卸载时不会执行。
- **错误代码：**

```ts
setTimeout(() => {
  onMounted(startClientFeature)
}, 100)
```

- **正确代码：**

```ts
const settings = ref<Settings>()
onMounted(startClientFeature)
void loadSettings().then((value) => (settings.value = value))
```

`<script setup>` 顶层 await 是明确例外：编译器会恢复 active instance；这不应推广到普通 async 回调。

- **一手来源：** [Vue 生命周期：同步注册](https://cn.vuejs.org/guide/essentials/lifecycle.html#registering-lifecycle-hooks)、[Vue 组合式函数使用限制](https://cn.vuejs.org/guide/reusability/composables.html#usage-restrictions)、[Vue 3.5.40 `apiLifecycle.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiLifecycle.ts)

#### 2. 认为父组件 `onMounted()` 已等待所有异步子树且一定进入 document

- **错误假设 / 原因：** `onMounted()` 只保证同步子组件已经挂载；不包含异步组件或 Suspense 子树。组件 DOM 只有在应用根容器本身位于 document 时才保证 in-document。
- **可观察后果：** 异步子组件 ref 仍为 null，调用方法时报错；挂在脱离 document 的容器时，几何或焦点操作没有预期结果。
- **错误代码：**

```ts
onMounted(() => {
  asyncChild.value.measure()
})
```

- **正确代码：**

```ts
function handleChildReady(child: ChildPublicApi) {
  child.measure()
}

onMounted(() => {
  if (root.value?.isConnected) measureRoot(root.value)
})
```

异步子组件应在自身就绪后发出 ready 事件，再调用 `handleChildReady`，而不是把父 mounted 当作其就绪信号。

- **一手来源：** [Vue API：onMounted](https://cn.vuejs.org/api/composition-api-lifecycle.html#onmounted)、[Vue SSR：组件生命周期钩子](https://cn.vuejs.org/guide/scaling-up/ssr.html#component-lifecycle-hooks)

#### 3. 把 KeepAlive 钩子只当作“缓存切换”通知

- **错误假设 / 原因：** 误以为 `onActivated()` 不会在首次挂载调用，或 `onDeactivated()` 不会在最终卸载调用。官方还说明，这两个钩子同时作用于缓存树中的后代组件。
- **可观察后果：** 同一订阅初始化两次、最终卸载时漏清理，或后代组件重复执行本以为只属于缓存根节点的逻辑。
- **错误代码：**

```ts
onMounted(() => subscribe())
onActivated(() => subscribe())
onUnmounted(() => unsubscribe())
```

- **正确代码：**

```ts
let stopSubscription: (() => void) | undefined

onActivated(() => {
  stopSubscription ??= subscribe()
})

onDeactivated(() => {
  stopSubscription?.()
  stopSubscription = undefined
})
```

- **一手来源：** [Vue KeepAlive：缓存实例生命周期](https://cn.vuejs.org/guide/built-ins/keep-alive.html#lifecycle-of-cached-instance)、[Vue 3.5.40 `KeepAlive.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/KeepAlive.ts)

### `provide()` / `inject()`

#### 1. 使用字符串 key 后直接断定类型和存在性

- **错误假设 / 原因：** 字符串 key 不能把提供方的 TypeScript 类型同步到注入方；没有祖先或应用提供匹配 key 且没有默认值时，`inject()` 返回 undefined。
- **可观察后果：** 对 undefined 访问 `.value` 直接抛错；同名字符串碰撞时还可能注入错误类型的值。
- **错误代码：**

```ts
const count = inject('count')
count.value++
```

- **正确代码：**

```ts
export const countKey: InjectionKey<Readonly<Ref<number>>> = Symbol('count')

const count = inject(countKey)
if (!count) throw new Error('缺少 count 提供者')
console.log(count.value)
```

- **一手来源：** [Vue 依赖注入 API](https://cn.vuejs.org/api/composition-api-dependency-injection.html)、[Vue 依赖注入类型标注](https://cn.vuejs.org/guide/typescript/composition-api.html#typing-provide-inject)

#### 2. 让注入方直接修改共享响应式状态

- **错误假设 / 原因：** ref 注入后保持原样且仍可写，容易把技术上的可写能力当成合理所有权。官方建议尽可能把响应式状态的修改留在提供方。
- **可观察后果：** 任意深度后代都能绕开业务规则改状态，修改入口分散，难以定位谁改变了共享值。
- **错误代码：**

```ts
// 提供方
provide(countKey, count)

// 注入方
inject(countKey)!.value++
```

- **正确代码：**

```ts
provide(counterKey, {
  count: readonly(count),
  increment: () => count.value++,
})

const counter = inject(counterKey)
counter?.increment()
```

- **一手来源：** [Vue 依赖注入：使用响应式数据](https://cn.vuejs.org/guide/components/provide-inject.html#working-with-reactivity)

#### 3. 在任意模块或异步回调中直接调用 `inject()`

- **错误假设 / 原因：** 误以为 inject 是全局容器查找。组件内的 provide / inject 要在 setup 同步阶段调用；Vue 3.3+ 的 `app.runWithContext()` 也只在回调同步执行期间提供应用注入上下文。
- **可观察后果：** 没有当前组件或应用上下文时得到 undefined 并出现警告；await 后再次 inject 也失去 runWithContext 上下文。
- **错误代码：**

```ts
export const service = inject(serviceKey)
```

- **正确代码：**

```ts
const service = app.runWithContext(() => inject(serviceKey))
```

组件中则应在 setup 的同步阶段读取一次，再把结果传给异步逻辑。

- **一手来源：** [Vue 依赖注入 API：inject](https://cn.vuejs.org/api/composition-api-dependency-injection.html#inject)、[Vue 3.3+ `app.runWithContext()`](https://cn.vuejs.org/api/application.html#app-runwithcontext)、[Vue 3.5.40 `apiInject.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiInject.ts)

### 模板引用 `useTemplateRef()`

#### 1. 在挂载前或条件卸载后直接访问模板引用

- **错误假设 / 原因：** `useTemplateRef()` 返回的是 `Readonly<ShallowRef<T | null>>`；首次渲染前元素不存在，`v-if` 移除目标时值还会回到 null。SSR 阶段也没有浏览器 DOM。
- **可观察后果：** 调用 `focus()`、测量方法或子组件方法时抛出“不能读取 null”的运行时错误。
- **错误代码：**

```ts
const input = useTemplateRef<HTMLInputElement>('input')
input.value.focus()
```

- **正确代码：**

```ts
const input = useTemplateRef<HTMLInputElement>('input')

onMounted(() => {
  input.value?.focus()
})
```

若目标受 `v-if` 控制，应侦听引用并同时处理 null：

```ts
watchEffect(() => input.value?.focus())
```

- **一手来源：** [Vue API：useTemplateRef](https://cn.vuejs.org/api/composition-api-helpers.html#usetemplateref)、[Vue 模板引用：访问时机](https://cn.vuejs.org/guide/essentials/template-refs.html#accessing-the-refs)、[Vue SSR 生命周期](https://cn.vuejs.org/guide/scaling-up/ssr.html#component-lifecycle-hooks)

#### 2. 用同一索引对应 `v-for` 源数组和 ref 数组

- **错误假设 / 原因：** 看到两边都是数组就假定顺序一致。官方明确不保证 ref 数组与源数组顺序相同；列表增删、移动和渲染更新会进一步放大风险。
- **可观察后果：** 点击或滚动某个业务项时，代码聚焦、测量或操作了另一个元素。
- **错误代码：**

```ts
function focusItem(index: number) {
  itemRefs.value[index].focus()
}
```

- **正确代码：**

```ts
const itemElements = new Map<string, HTMLButtonElement>()

function setItemRef(id: string, element: Element | null) {
  if (element instanceof HTMLButtonElement) itemElements.set(id, element)
  else itemElements.delete(id)
}

function focusItem(id: string) {
  itemElements.get(id)?.focus()
}
```

模板中用 `:ref="(element) => setItemRef(item.id, element)"` 按稳定业务 ID 维护映射。

- **一手来源：** [Vue 模板引用：v-for 与函数引用](https://cn.vuejs.org/guide/essentials/template-refs.html#refs-inside-v-for)、[Vue 3.5.40 `rendererTemplateRef.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/rendererTemplateRef.ts)

#### 3. 在 `await` 后才调用 `defineExpose()`

- **错误假设 / 原因：** 误以为宏可以在异步数据准备后动态扩展公开实例。官方要求 `defineExpose()` 位于任何 await 之前；`<script setup>` 组件本身还是默认私有的。
- **可观察后果：** 父组件通过模板 ref 拿到的公开实例中没有 await 后暴露的属性或方法，调用时得到 undefined。
- **错误代码：**

```ts
await loadInitialState()
defineExpose({ reset })
```

- **正确代码：**

```ts
defineExpose({ reset })
await loadInitialState()
```

公开接口应保持最小；暴露对象中的 ref 在父组件拿到的实例上会自动解包。

- **一手来源：** [Vue 模板引用：组件上的 ref 与 defineExpose](https://cn.vuejs.org/guide/essentials/template-refs.html#ref-on-component)

## 第二轮补充核验

用户将数量目标调整为“每篇尽量约 5 个，最多 10 个，一手资料不足时可少写”后，又从官方指南的限制、警告和生命周期契约中补充了 15 个不重复问题。完整的原因、后果与成对代码已写入对应正式条目。

| 主题 | 补充问题 | 一手依据 |
| --- | --- | --- |
| `reactive()` | 修改原始对象不触发更新；代理与原始对象身份不同 | [Vue 响应式基础：Reactive Proxy vs. Original](https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html#reactive-proxy-vs-original) |
| `ref()` | 对象 ref 中继续修改原始对象会绕过代理 | [Vue 核心 API：ref](https://cn.vuejs.org/api/reactivity-core.html#ref)、[Reactive Proxy vs. Original](https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html#reactive-proxy-vs-original) |
| `toRef()` | getter 规范化签名返回只读 ref | [Vue 响应式工具：toRef](https://cn.vuejs.org/api/reactivity-utilities.html#toref) |
| `computed()` | 不应直接修改 computed 返回的派生快照 | [Vue 计算属性：Avoid mutating computed value](https://cn.vuejs.org/guide/essentials/computed.html#avoid-mutating-computed-value) |
| `watch()` | 默认懒执行；getter 对象源不会默认深层触发 | [Vue 侦听器：Eager Watchers](https://cn.vuejs.org/guide/essentials/watchers.html#eager-watchers)、[Deep Watchers](https://cn.vuejs.org/guide/essentials/watchers.html#deep-watchers) |
| `watchEffect()` | `onWatcherCleanup()` 不能在 `await` 后登记 | [Vue 侦听器：Side Effect Cleanup](https://cn.vuejs.org/guide/essentials/watchers.html#side-effect-cleanup) |
| 生命周期 | SSR 不调用客户端钩子；`onUpdated()` 中修改状态；外部资源未手工清理 | [Vue SSR：Component Lifecycle Hooks](https://cn.vuejs.org/guide/scaling-up/ssr.html#component-lifecycle-hooks)、[Vue 生命周期 API](https://cn.vuejs.org/api/composition-api-lifecycle.html) |
| `provide()` / `inject()` | 提供普通值不会自动响应；当前组件不能注入自己提供的值 | [Vue 依赖注入指南](https://cn.vuejs.org/guide/components/provide-inject.html)、[Vue 依赖注入 API](https://cn.vuejs.org/api/composition-api-dependency-injection.html) |
| 模板引用 | `<script setup>` 子组件默认私有；函数 ref 卸载时必须处理 `null` | [Vue 模板引用：Ref on Component](https://cn.vuejs.org/guide/essentials/template-refs.html#ref-on-component)、[Function Refs](https://cn.vuejs.org/guide/essentials/template-refs.html#function-refs) |

## 后续内容的选材标准

“易错使用提示”不是普通的最佳实践列表。Vue、React 和工程化内容都应按以下顺序筛选：

1. **先看是否会产生错误行为。** 优先收录不更新、错误更新、旧数据覆盖新数据、资源泄漏、构建产物错误、缓存失效或明显性能放大的问题；不收录纯风格偏好。
2. **优先新手高概率误用。** API 名称、自动行为或相似 API 容易造成错误直觉时优先，例如“readonly 等于冻结”“sync 更快”“解构仍保持响应式”。
3. **必须可给出最小错误写法。** 每条都要能展示一段真实可写出的错误代码，不能只写“谨慎使用”“注意性能”。
4. **必须说明可观察后果。** 写清楚“不触发更新”“读到旧 DOM”“回调执行 N 次”等结果，避免只复述实现原理。
5. **必须提供直接修正路径。** 正确做法应能由新手立即替换，必要时指出更合适的相邻 API。
6. **事实必须由一手资料支撑。** 来源优先级为官方 API/指南、固定版本源码、官方 RFC、维护者确认的官方 issue。issue 用于补充边缘行为，不能把未合并提案当成现行契约。
7. **标注版本与环境边界。** 涉及新增选项、SSR、并发渲染、浏览器或构建工具版本时写明适用范围；源码链接固定到 tag 或 commit，避免 `main` 漂移。
8. **每篇以约 5 条为目标，最多 10 条。** 优先保留最常见且后果最大的提示；若一手资料只能核实更少问题，可以少于 5 条，不为凑数编造、拆分重复问题或收录纯风格偏好。

## 建议模板

后续每个知识点或 API 的提示项统一包含以下字段：

```text
标题：一句话指出错误直觉
原因说明：这个写法为什么与 API 契约冲突
实际后果：用户会观察到什么
错误示范：最小、可识别的错误代码或操作
正确示范：可直接采用的修正代码或替代 API
依据：官方文档 URL；必要时追加固定版本源码、RFC 或官方 issue
适用范围：框架/工具版本、运行环境（仅在确有边界时填写）
```

发布前应再次打开一手来源核对当前版本；搜索结果摘要和二手文章只能用于发现线索，不能直接成为提示内容的事实依据。
