# Vue Core 中级课程：组合式函数调研

> 核验日期：2026-07-31
>
> 适用版本：Vue 3.5.40。
>
> 资料范围：Vue 官方中文组合式函数、响应式工具、侦听器、生命周期与 SSR 文档，以及
> `vuejs/core@v3.5.40` 固定标签的 reactivity/runtime 源码和同标签官方测试。外部资料由既有
> Tavily 调研定位并回到一手来源核验；本文不采用博客、问答、第三方组合式函数库、RFC 讨论、
> `main` 分支或浮动版本链接作为事实来源。

## 课程定位与冻结边界

| 字段 | 冻结值 |
| --- | --- |
| 课程 ID | `vue.core.learn.intermediate.composables` |
| 标题 | `组合式函数` |
| 阶段 | 重构实施计划阶段 6 / Vue Core 中级 / 逻辑复用与依赖传递 |
| 当前 catalog 状态 | `planned`；本调研只冻结内容，不改变 catalog 或课程实现 |
| 线性位置 | `组件 v-model` 之后，Provide / Inject 之前 |
| 难度 | `intermediate` |
| 建议时长 | 50 分钟 |

本课唯一直接 prerequisite 冻结为：

`vue.core.learn.intermediate.component-v-model`

它是当前线性路线中紧邻本课之前的已上线课程。响应式状态、侦听器、生命周期等能力已经通过基础
课程传递，不重复列成直接 prerequisite。

`related` 必须严格按以下顺序冻结，且五个 ID 均须在当前仓库解析：

1. `vue.core.learn.intermediate.component-v-model`
2. `vue.core.learn.basics.watchers`
3. `vue.core.reference.advanced.composables`
4. `vue.core.reference.reactivity.utils`
5. `vue.core.reference.composition.lifecycle`

顺序表达“上一课组件契约 -> 已学侦听副作用 -> 组合式函数固定参考 -> 输入规范化工具 -> 生命周期
参考”。不得提前加入 Provide / Inject，也不得用尚未上线的后续课程作 prerequisite。

本课只回答一个主问题：**如何把依赖响应式输入、拥有局部状态和副作用清理的逻辑封装成可复用、
可组合且实例边界明确的函数。** 主线限定为 SFC、`<script setup lang="ts">`、Composition API 与
Vue 3.5.40，覆盖：

- 组合式函数封装的是有状态逻辑，与普通无状态工具函数的边界。
- `use*` 驼峰命名约定，以及 setup 活跃实例下的同步调用边界。
- `MaybeRefOrGetter<T>` 输入与 `toValue()` 在实际读取位置的规范化。
- 在 `watch()` / `watchEffect()` 中读取规范化输入，保持依赖追踪。
- 返回“普通对象 + refs”，让调用方解构后仍保留响应性。
- 每次调用创建独立状态；模块级共享状态属于另一种所有权选择。
- DOM/浏览器副作用在 mounted 后建立，并在 unmounted 或显式 stop 时清理。
- `onScopeDispose()`、watcher cleanup 与组件 effect scope 的高级所有权依据。
- SSR 中浏览器 API、需清理副作用和模块级状态污染的边界。

以下内容明确排除，不进入正文主线、练习或 Demo：

- Provide / Inject；它是下一课的跨层依赖传递主题。
- 完整网络请求竞态、AbortController、缓存、重试、错误恢复或生产级 `useFetch`。
- Pinia、共享 store、事件总线和应用级单例状态设计。
- 完整 SSR 应用、hydration、流式渲染、服务端数据获取或请求上下文实现。
- 修复或重写现有 `vue.core.reference.advanced.composables` Reference。
- Mixin、无渲染组件和 React Hooks 的完整对比课程。
- 第三方 composables 库、插件安装、自动导入和包发布。
- `effectScope()` 的完整 API 教程；只用其源码说明组件所有权与清理边界。
- Provide / Inject 及其之后的任何计划课程。

**课程依据：** [组合式函数指南](https://cn.vuejs.org/guide/reusability/composables.html)、
[`toValue()`](https://cn.vuejs.org/api/reactivity-utilities.html#tovalue)、
[侦听器清理](https://cn.vuejs.org/guide/essentials/watchers.html#side-effect-cleanup)、
[生命周期钩子注册](https://cn.vuejs.org/guide/essentials/lifecycle.html#registering-lifecycle-hooks)、
[SSR 组件生命周期](https://cn.vuejs.org/guide/scaling-up/ssr.html#component-lifecycle-hooks)。

## 学习目标

完成本课后，学习者应能：

1. 判断一段逻辑是普通工具函数，还是需要组合式函数封装的有状态逻辑。
2. 用 `use*` 命名组合式函数，并在 `<script setup>` / `setup()` 的同步阶段调用它。
3. 用 `MaybeRefOrGetter<T>` 接收普通值、ref 或 getter，并用 `toValue()` 统一读取。
4. 把 `toValue()` 放在 watcher/effect 或事件真正读取输入的位置，避免只保存一次快照。
5. 返回包含多个 refs 的普通对象，并安全地解构状态与命令。
6. 解释同一个组合式函数调用两次为何产生两个独立状态实例。
7. 为事件监听等副作用实现幂等 `start()` / `stop()`，并在卸载时清理。
8. 区分组件局部状态、显式共享状态和意外模块级单例。
9. 识别浏览器 API 与模块级可变状态在 SSR 中的风险，不把客户端示例直接搬到服务端。

## 建议教学顺序

### 1. 从“复用有状态逻辑”而不是文件拆分开始

组合式函数是“利用 Vue 组合式 API 封装和复用有状态逻辑的函数”。日期格式化、字符串裁剪等没有
响应式状态和副作用的逻辑，继续使用普通函数即可；把函数移动到 `useSomething.ts` 并不会自动让它
成为组合式函数。

```ts
/** 把课程数格式化为展示文本；这是无状态工具函数。 */
function formatLessonCount(count: number) {
  return `${count} 节课`
}
```

组合式函数通常同时拥有局部 ref、派生状态、watcher、生命周期或资源清理。课程应先说明“它拥有
什么状态、订阅了什么资源、谁负责停止”，再介绍文件结构。

**官方事实：** [什么是组合式函数](https://cn.vuejs.org/guide/reusability/composables.html#what-is-a-composable)。

### 2. 用最小局部状态冻结每次调用的实例边界

状态写在函数体内时，每次调用都会创建新的 ref：

```ts
import { ref } from 'vue'

/** 创建一个相互独立的计数器实例。 */
function useCounter() {
  const count = ref(0)

  /** 当前实例递增一次。 */
  function increment() {
    count.value += 1
  }

  return { count, increment }
}

const first = useCounter()
const second = useCounter()
```

`first.count` 与 `second.count` 不共享状态。这与官方 `useMouse()` 每次调用创建独立 `x`、`y` 的
语义一致。需要共享时必须显式选择共享所有权，不能让学习者误以为所有 `use*` 都是单例。

**官方事实：** [鼠标跟踪器示例](https://cn.vuejs.org/guide/reusability/composables.html#mouse-tracker-example)。

### 3. 返回普通对象中的 refs，保留解构后的响应性

官方推荐组合式函数返回包含多个 refs 的普通非响应式对象：

```ts
const { count, running, start, stop } = useEventCounter(step)
```

解构得到的 `count`、`running` 仍是 refs，模板会自动解包，脚本中继续使用 `.value`。若调用方偏好
属性式访问，可在调用处写 `reactive(useEventCounter(step))`；不要让组合式函数先返回 reactive
对象再要求调用方解构其中的基本值。

**官方事实：** [返回值约定](https://cn.vuejs.org/guide/reusability/composables.html#return-values)。

### 4. 用 MaybeRefOrGetter 接受稳定又灵活的响应式输入

输入可以是普通值、ref 或 getter：

```ts
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

/** 在每次实际使用时读取最新步长。 */
function readStep(source: MaybeRefOrGetter<number>) {
  return toValue(source)
}
```

`toValue()` 对普通值原样返回、对 ref 取 `.value`、对 getter 调用并返回结果。它只负责当前这次
规范化，不会凭空创建持续追踪；要在响应式输入变化时重跑逻辑，必须在 `watch()` 的 getter 或
`watchEffect()` 同步执行段中调用它。

```ts
watchEffect(() => {
  normalizedStep.value = toValue(step)
})
```

**官方事实：** [接收响应式状态](https://cn.vuejs.org/guide/reusability/composables.html#accepting-reactive-state)、
[输入参数约定](https://cn.vuejs.org/guide/reusability/composables.html#input-arguments)、
[`toValue()`](https://cn.vuejs.org/api/reactivity-utilities.html#tovalue)。

### 5. 把浏览器副作用与清理设计成一对操作

DOM 事件等浏览器副作用应在客户端 mounted 后建立，并在 unmounted 时清理。对于可暂停订阅的
组合式函数，再公开幂等的 `start()` / `stop()`：重复 start 不重复注册，重复 stop 不产生额外动作。

```ts
onMounted(start)
onUnmounted(stop)
```

这不是说所有副作用都必须放进 `onMounted()`。官方基础 `useFetch()` 会在调用期间发起请求；
mounted 要求针对浏览器 DOM、SSR 中只能在客户端发生的副作用，以及需要 unmount 配对清理的资源。

**官方事实：** [副作用](https://cn.vuejs.org/guide/reusability/composables.html#side-effects)、
[SSR 生命周期](https://cn.vuejs.org/guide/scaling-up/ssr.html#component-lifecycle-hooks)。

### 6. 最后解释同步调用与 scope 所有权

组合式函数应在 `<script setup>` 或 `setup()` 中同步调用，使生命周期钩子和同步创建的 watchers
关联到当前组件实例，并在组件卸载时自动停止。普通 async `setup()` 不能把注册推迟到首个 await
之后；`<script setup>` 是编译器恢复当前实例上下文的特殊例外，不能泛化给任意异步函数。

需要让清理同时适用于组件卸载和手工 effect scope 的底层可复用逻辑时，可在进阶区介绍
`onScopeDispose()`；它必须在活跃 effect scope 内同步注册。主线仍使用更直观的
`onMounted()` / `onUnmounted()`。

**官方事实：** [使用限制](https://cn.vuejs.org/guide/reusability/composables.html#usage-restrictions)、
[生命周期钩子注册](https://cn.vuejs.org/guide/essentials/lifecycle.html#registering-lifecycle-hooks)。

## 最小核心知识矩阵

| 问题 | 推荐做法 | 不应推导出的结论 |
| --- | --- | --- |
| 无状态转换 | 普通工具函数 | 所有复用函数都必须以 `use` 开头 |
| 有状态逻辑复用 | `use*` 组合式函数 | `use*` 是运行时强制规则 |
| 普通值 / ref / getter 输入 | `MaybeRefOrGetter<T>` + `toValue()` | `toValue()` 会自动持续追踪 |
| 需要响应输入变化 | 在 `watch` / `watchEffect` 中读取 | 函数外先读取一次也会追踪 |
| 多项状态输出 | 普通对象包含 refs | 返回 reactive 对象后随意解构基本值 |
| 两次调用 | 默认创建两份局部状态 | 相同 composable 名意味着自动共享 |
| DOM 事件副作用 | mounted 建立、unmounted 清理 | 所有副作用一律只能在 mounted 中执行 |
| 显式暂停资源 | 幂等 `start()` / `stop()` | 每次 start 都创建新的匿名 handler |
| 组件内同步 watcher | 由组件 scope 捕获并随卸载停止 | 任意异步时刻创建的 watcher 都自动归属组件 |
| SSR | 延迟浏览器 API，避免模块级可变单例 | SSR 中所有 watcher 或生命周期一律完全相同/完全不运行 |

## 高质量常见易错点

### 1. 调用组合式函数时先取 `.value`，把响应式输入截成快照

**错误示例：**

```ts
const step = ref(1)
const counter = useEventCounter(step.value)
```

**正确示例：**

```ts
const step = ref(1)
const counterA = useEventCounter(step)
const counterB = useEventCounter(() => step.value * 2)
```

**后果：** 错误写法只传入当时的数字 `1`；之后把 `step` 改成 `3`，组合式函数无法知道来源曾经
是 ref，也不会采用新步长。正确写法保留 ref/getter 这条输入链。

**一手来源：** [接收响应式状态](https://cn.vuejs.org/guide/reusability/composables.html#accepting-reactive-state)、
[`toValue()`](https://cn.vuejs.org/api/reactivity-utilities.html#tovalue)。

### 2. 在响应式 effect 外只调用一次 `toValue()`，却期待持续追踪

**错误示例：**

```ts
const initialStep = toValue(step)

watchEffect(() => {
  preview.value = initialStep
})
```

**正确示例：**

```ts
watchEffect(() => {
  preview.value = toValue(step)
})
```

**后果：** 错误写法的 effect 只读取普通数字，不依赖原 ref/getter，输入变化不会触发重跑。
`toValue()` 是一次读取，不是 watcher。

**一手来源：** [输入参数约定](https://cn.vuejs.org/guide/reusability/composables.html#input-arguments)、
[`ref.ts` 的 `toValue()`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts)、
[`ref.spec.ts` 的 `toValue` 测试](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/ref.spec.ts)。

### 3. 返回 reactive 对象后立即解构基本值

**错误示例：**

```ts
/** 错误地返回会自动解包 ref 的 reactive 对象。 */
function useCounter() {
  const count = ref(0)
  return reactive({ count })
}

const { count } = useCounter()
```

**正确示例：**

```ts
/** 返回普通对象，让 count 保持为 ref。 */
function useCounter() {
  const count = ref(0)
  return { count }
}

const { count } = useCounter()
```

**后果：** 错误写法解构出的基本值失去与内部状态的响应式连接，页面停在旧值。若确实需要对象式
访问，应保留整个对象：`const counter = reactive(useCounter())`。

**一手来源：** [返回值约定](https://cn.vuejs.org/guide/reusability/composables.html#return-values)。

### 4. 在 await 或异步回调之后注册生命周期钩子

**错误示例：**

```ts
/** 错误地把清理注册推迟到活跃实例已经丢失之后。 */
async function useDelayedListener() {
  await Promise.resolve()
  onUnmounted(stop)
}
```

**正确示例：**

```ts
/** 在组合式函数同步执行期间先注册清理。 */
function useListener() {
  onMounted(start)
  onUnmounted(stop)
}
```

**后果：** 普通 async setup 或异步回调中可能已没有活跃组件实例，钩子不会成功关联组件，并在
开发环境收到警告；资源随后可能无法自动清理。`<script setup>` 对顶层 await 的编译器恢复是
特例，不等于任意 async composable 都可延迟注册。

**一手来源：** [组合式函数使用限制](https://cn.vuejs.org/guide/reusability/composables.html#usage-restrictions)、
[`apiLifecycle.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiLifecycle.ts)。

### 5. 在 setup 根作用域直接访问 window，并把清理留给不执行的 SSR unmount

**错误示例：**

```ts
window.addEventListener('composable-contract-lab:tick', handleTick)
onUnmounted(() => window.removeEventListener('composable-contract-lab:tick', handleTick))
```

**正确示例：**

```ts
onMounted(start)
onUnmounted(stop)
```

**后果：** 服务端没有 `window`，且 mounted/unmounted 不在 SSR 执行；在 setup 中启动需清理的
浏览器资源会报错或跨请求残留。浏览器 API 应延迟到仅客户端生命周期。

**一手来源：** [SSR 访问平台特有 API](https://cn.vuejs.org/guide/scaling-up/ssr.html#access-to-platform-specific-apis)、
[SSR 组件生命周期](https://cn.vuejs.org/guide/scaling-up/ssr.html#component-lifecycle-hooks)、
[`apiLifecycle.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiLifecycle.ts)。

### 6. start 每次创建新匿名 handler，stop 无法移除原监听

**错误示例：**

```ts
/** 每次启动都会创建一个无法配对移除的新函数。 */
function start() {
  window.addEventListener('composable-contract-lab:tick', () => {
    count.value += toValue(step)
  })
}
```

**正确示例：**

```ts
/** 使用稳定 handler，并保证重复启动或停止不会重复操作。 */
function start() {
  if (running.value) return
  window.addEventListener('composable-contract-lab:tick', handleTick)
  running.value = true
}

/** 移除同一个 handler。 */
function stop() {
  if (!running.value) return
  window.removeEventListener('composable-contract-lab:tick', handleTick)
  running.value = false
}
```

**后果：** 每次重启都会新增监听，单次 tick 可能累加多次；卸载也无法用另一个匿名函数移除原
监听。稳定函数引用和幂等状态使显式 stop 与卸载清理使用同一条路径。

**一手来源：** [组合式函数副作用](https://cn.vuejs.org/guide/reusability/composables.html#side-effects)、
[鼠标跟踪器清理示例](https://cn.vuejs.org/guide/reusability/composables.html#mouse-tracker-example)。

### 7. 假定同一组合式函数的两次调用会自动共享状态

**错误示例：**

```ts
const counterA = useEventCounter(step)
const counterB = useEventCounter(step)

counterA.reset()
// 错误地期待 counterB.count 也归零
```

**正确示例：**

```ts
const counterA = useEventCounter(step)
const counterB = useEventCounter(() => step.value * 2)

counterA.reset()
// counterB 保留自己的计数，这是实例隔离契约
```

**后果：** 调用方若误以为状态共享，会把局部 reset、stop 等命令当成全局操作，产生难以解释的
界面差异。共享状态需要单独设计所有权，本课不以 Pinia 或模块单例替代实例隔离。

**一手来源：** [鼠标跟踪器示例](https://cn.vuejs.org/guide/reusability/composables.html#mouse-tracker-example)。

### 8. 为了共享而把可变 ref 放到模块顶层，忽略 SSR 跨请求污染

**错误示例：**

```ts
const count = ref(0)

/** 所有调用和所有服务端请求都返回同一个模块级 ref。 */
function useCounter() {
  return { count }
}
```

**正确示例：**

```ts
/** 默认在每次调用中创建状态。 */
function useCounter() {
  const count = ref(0)
  return { count }
}
```

**后果：** 模块通常在服务器进程中只初始化一次，可变单例会把一个请求的状态泄露给另一个请求。
真正的应用级共享状态应由 SSR 应用工厂和每请求上下文建立；这属于后续架构主题。

**一手来源：** [SSR 跨请求状态污染](https://cn.vuejs.org/guide/scaling-up/ssr.html#cross-request-state-pollution)。

### 9. 把指南中的最小 useFetch 当成完整生产请求方案

**错误示例：**

```ts
watchEffect(() => {
  fetch(toValue(url))
    .then((response) => response.json())
    .then((result) => (data.value = result))
})
```

**正确示例：**

```ts
watchEffect((onCleanup) => {
  const currentUrl = toValue(url)
  const controller = new AbortController()

  onCleanup(() => controller.abort())
  void loadCurrentUrl(currentUrl, controller.signal)
})
```

**后果：** 最小指南片段没有展示旧请求取消、竞态抑制、`response.ok` 检查和完整错误策略；输入
快速变化时，较旧响应可能最后写回。正确示例只强调“失效时清理”方向，本课不实现完整网络层。

**一手来源：** [异步状态示例](https://cn.vuejs.org/guide/reusability/composables.html#async-state-example)、
[侦听器副作用清理](https://cn.vuejs.org/guide/essentials/watchers.html#side-effect-cleanup)。

## Vue 3.5.40 源码与官方测试的独立推导

本节严格区分公开文档契约、固定版本实现事实与课程推导。源码细节用于解释边界，不升级成未来
版本永久承诺。

### 1. toValue 只做一次分支读取

`packages/reactivity/src/ref.ts` 的实现为：

```ts
export function toValue<T>(source: MaybeRefOrGetter<T>): T {
  return isFunction(source) ? source() : unref(source)
}
```

函数输入会被当作 getter 调用，其他输入交给 `unref()`；因此 ref/computed 取 `.value`，普通值原样
返回。`packages/reactivity/__tests__/ref.spec.ts` 的 `test('toValue', ...)` 用 ref、computed、getter
和普通数字断言结果依次为 `1 / 2 / 3 / 4`。

**课程推导：** 输入类型可以统一成 `MaybeRefOrGetter<T>`，但必须在真正读取的时刻调用
`toValue()`；函数若本来是“函数值”而不是 getter，不应直接交给该接口，因为它会被执行。

**固定证据：** [`ref.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts)、
[`ref.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/ref.spec.ts)。

### 2. 组件同步 setup 通过 effect scope 捕获响应式副作用

`packages/runtime-core/src/component.ts` 为每个组件实例创建 detached `EffectScope`；
`setCurrentInstance(instance)` 会同时启用 `instance.scope`，恢复实例时再关闭。同步 setup 调用期间
创建的 watchers/effects 因而被组件 scope 捕获。

`packages/runtime-core/src/renderer.ts` 的 `unmountComponent` 调用 `scope.stop()` 停止组件 scope 中
的 effects。由此可解释“在 setup 活跃 scope 中同步创建的 watcher 会随组件卸载停止”，但不能
扩写成“任何异步时刻创建的 watcher 都自动归属组件”。

**固定证据：** [`component.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/component.ts)、
[`renderer.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts)。

### 3. onScopeDispose 只向当前活跃 scope 注册清理

`packages/reactivity/src/effectScope.ts` 的 `onScopeDispose()` 只在存在 `activeEffectScope` 时把回调
加入其 `cleanups`。没有活跃 scope 时，开发环境默认发出警告；`failSilently` 只抑制警告，不会
创建 scope 或延迟注册。`EffectScope.stop()` 会停止 effects、执行 cleanups、停止子 scopes 并解除
父子引用。

官方 `effectScope.spec.ts` 的 `should fire onScopeDispose hook` 断言多个 cleanup 在 stop 时执行；
无活跃 scope 的测试断言对应警告；子 scope 测试覆盖清理期间停止 sibling 不抛错。

**课程推导：** 可复用于组件和手工 scope 的底层组合式函数可用 `onScopeDispose(stop)`，但仍须在
调用时就有活跃 scope。Demo 采用对新手更直观的 `onUnmounted(stop)`，不把 effect scope 变成主线。

**固定证据：** [`effectScope.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effectScope.ts)、
[`effectScope.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/effectScope.spec.ts)。

### 4. watcher cleanup 在重跑前与 stop 时执行

`packages/reactivity/src/watch.ts` 把 cleanup 关联到具体 watcher effect。watchEffect 重跑前会执行
上一轮 cleanup；带 callback 的 watch 在确认需要调用新 callback 后先清理上一轮；手工 stop 或所属
scope stop 也会执行 cleanup 并移除记录。

`onWatcherCleanup()` 必须在 active watcher 的同步执行期间调用；没有 owner 时开发环境会警告。
watch/watchEffect 参数形式的 `onCleanup` 直接绑定目标 effect，不应与 `onWatcherCleanup()` 在 await
后的限制混为一谈。`apiWatch.spec.ts` 的 cleanup registration 与 `onWatcherCleanup` 测试覆盖初次
执行、依赖失效重跑和 stop 三个时点。

**课程推导：** 组合式函数内的异步副作用必须暴露“本轮何时失效”的清理逻辑；组件卸载不是唯一
清理时机。网络竞态的完整实现留在后续主题。

**固定证据：** [`watch.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/watch.ts)、
[`apiWatch.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiWatch.spec.ts)、
[侦听器副作用清理](https://cn.vuejs.org/guide/essentials/watchers.html#side-effect-cleanup)。

### 5. 生命周期注入依赖活跃组件实例，SSR 有明确分支

`packages/runtime-core/src/apiLifecycle.ts` 在没有 active component instance 时对生命周期注入发出
开发警告，并提示 async setup 应在首个 await 前注册。SSR setup 中，create hook 仅对
`onServerPrefetch` 保留注册；mounted/unmounted 等 post-create 生命周期不注册。

官方生命周期测试可证明客户端 mount/update/unmount 时序，但不能单独证明 SSR；SSR 结论必须以
源码分支和 SSR 官方文档共同限定。

**课程推导：** DOM 订阅在 `onMounted()` 中建立、在 `onUnmounted()` 中清理，既避开服务端浏览器
API，也保证客户端拥有成对生命周期。不能写成“SSR 中所有生命周期都不运行”。

**固定证据：** [`apiLifecycle.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiLifecycle.ts)、
[`apiLifecycle.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiLifecycle.spec.ts)、
[SSR 组件生命周期](https://cn.vuejs.org/guide/scaling-up/ssr.html#component-lifecycle-hooks)。

### 6. SSR watcher 不能简化成全部运行或全部不运行

`packages/runtime-core/src/apiWatch.ts` 按 `flush`、`immediate` 与 watch/watchEffect 分支处理 SSR：
`flush: 'sync'` 的 handle 可收进 SSR context；非 sync 且不立即运行的 watcher 返回 no-op handle；
需要立即运行但不保留的 watcher 创建后会停止。

`server-renderer/__tests__/ssrWatch.spec.ts` 分别覆盖 sync watch、sync + immediate、post + immediate、
async context restore 后的非 immediate watcher，以及 sync/post watchEffect。证据不支持“SSR watcher
与客户端完全一致”或“SSR 中 watcher 一律不运行”。

**课程推导：** 本课 Demo 只验证客户端生命周期。课程正文只提醒 SSR 存在独立调度边界，不教
完整 SSR watcher 策略。

**固定证据：** [`apiWatch.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiWatch.ts)、
[`ssrWatch.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/__tests__/ssrWatch.spec.ts)。

### 7. 可落地的高级使用场景

1. **响应式参数适配器：** 搜索范围、步长或阈值既可接普通值，也可接 ref/getter；组合式函数在
   effect 或事件处理器真正读取时统一 `toValue()`，而不是在入口立即取快照。
2. **可暂停资源订阅：** WebSocket、Observer、DOM event 等都可抽象为稳定 handler 加幂等
   `start()` / `stop()`，同时把 `stop` 注册到 owner scope。
3. **多个独立实例：** 同一页面可用同一逻辑创建不同输入、状态和启停周期；共享算法不等于共享
   数据。Demo 的 A/B 正是这一契约。
4. **普通对象 + refs 的组合：** 一个 composable 的返回 refs 可以直接成为另一个 composable 的
   输入，显式组合数据流，不依赖 mixin 的隐式属性名。
5. **所有权升级：** 当状态确实需要跨组件共享时，先确定请求级、应用级或组件树级生命周期，再
   选择 Provide / Inject 或 store；不要靠模块级 ref 偶然升级所有权。本课只建立判断，不提前实现。

## 唯一 Demo 冻结规格

### 唯一公开 Demo ID

`vue.core.learn.intermediate.composables.composable-contract-lab-demo`

本课正文只能出现这一个 `type: 'demo'` block。易错点与源码推导使用静态代码块，不得注册第二个
Demo、stop 专用 Demo 或 SSR 变体。

### 文件结构

```text
composable-contract-lab-demo.vue    唯一公开父 SFC；拥有输入、按钮和结果摘要
useEventCounter.ts                  私有组合式函数；不注册 Demo ID，不单独导航
```

两个文件位于同一 Demo 目录：

```text
src/content/demos/vue/core/learn/intermediate/composables/
```

父 SFC 是唯一可导航入口和 raw source 面板入口。`useEventCounter.ts` 只由父 SFC 导入，不注册为
交互资产。

### 私有组合式函数契约

```ts
export const composableCounterTickEvent = 'composable-contract-lab:tick'

/** 创建一个按响应式步长累加、可暂停且自动清理的事件计数器。 */
export function useEventCounter(step: MaybeRefOrGetter<number>) {
  const count = ref(0)
  const running = ref(false)

  /** 使用当前最新步长处理一次共享 tick。 */
  function handleTick() {
    count.value += toValue(step)
  }

  /** 幂等启动当前实例的事件订阅。 */
  function start() {
    if (running.value) return
    window.addEventListener(composableCounterTickEvent, handleTick)
    running.value = true
  }

  /** 幂等停止当前实例的事件订阅。 */
  function stop() {
    if (!running.value) return
    window.removeEventListener(composableCounterTickEvent, handleTick)
    running.value = false
  }

  /** 只重置当前实例的本地计数。 */
  function reset() {
    count.value = 0
  }

  onMounted(start)
  onUnmounted(stop)

  return { count, running, start, stop, reset }
}
```

实现可以按项目格式补齐 imports，但不得改变上述行为：

- `step` 类型必须为 `MaybeRefOrGetter<number>`。
- tick handler 每次派发时调用 `toValue(step)`，不能在 composable 入口缓存数字。
- `count` 与 `running` 必须作为 refs 放在普通对象中返回。
- 每次调用创建独立 refs，不能移到模块顶层。
- `start()` / `stop()` 使用同一个 handler 且必须幂等。
- `window` 访问只发生在 mounted 后或用户点击启停按钮时。
- unmounted 必须复用 `stop()` 清理。

### 父 Demo 初始契约

```ts
const step = ref(1)
const counterA = useEventCounter(step)
const counterB = useEventCounter(() => step.value * 2)
```

父 SFC 必须用解构后的 refs/命令渲染两个实例，证明返回普通对象不会破坏响应性。初始挂载后 A、B
均为 running，计数均为 `0`；页面明确显示 A 的输入是 `ref step`，B 的输入是 `getter step * 2`。

页面只需要以下操作：

- “派发 tick”按钮：向 `window` 派发冻结事件。
- 步长输入或明确的“设为 3”操作：把 base step 从 `1` 改为 `3`。
- B 的“停止 B”与“重新启动 B”按钮；可按 running 状态禁用不适用命令。
- A 的“重置 A”按钮。

不得加入随机值、计时器、网络请求、全局 store、Provide / Inject 或第二种 composable。

### 可复跑交互断言

1. 初始挂载：base step 为 `1`，A 显示 `0 / 运行中 / 当前增量 1`，B 显示
   `0 / 运行中 / 当前增量 2`；控制台无 warning/error。
2. 点击一次“派发 tick”：A 变为 `1`，B 变为 `2`，证明两个实例共同响应事件但读取不同输入。
3. 把 base step 切到 `3`：计数不应立即改变，A 当前增量显示 `3`，B 当前增量显示 `6`。
4. 再派发 tick：A 从 `1` 变为 `4`，B 从 `2` 变为 `8`，证明 ref 与 getter 没被截成初始快照。
5. 点击“停止 B”后派发 tick：A 从 `4` 变为 `7`，B 保持 `8` 且状态为“已停止”。
6. 再次点击停止不得改变任何计数，也不得导致后续重复订阅；随后“重新启动 B”并派发 tick：A 从
   `7` 变为 `10`，B 从 `8` 变为 `14`。
7. 点击“重置 A”：A 归零，B 仍为 `14`，证明两次调用拥有独立状态；两者 running 状态不变。
8. 重复 stop/start B 后，每次 tick 最多只让 B 增加一次当前增量；不存在重复 listener。
9. 离开 Demo 或卸载组件后再次派发冻结事件，不产生 console warning/error，也不残留可见更新。
10. 390px 宽度下控制项纵向流动、文字可换行、无横向滚动；按钮具备可辨名称与至少 44px 触控
    高度，状态摘要可使用 `aria-live="polite"`，但不重复播报整块内容。

这条序列完整验证输入规范化、返回 refs、独立实例和清理四个主命题。不得用手工改写计数值伪造
stop/restart 结果；变化必须来自真实事件订阅。

### Demo 布局与样式约束

- 使用 flex 与 margin 组织实例和按钮，不使用 CSS `grid` 或 `gap`。
- 使用原生 number input 和 button；label 与控件必须可程序化关联。
- A、B 是同一实验区的两个并列实例，不创建嵌套卡片。
- 不使用 Transition、远程资源、时间戳或动画计数；结果必须确定且可复跑。
- 200% 文本缩放时标题、输入来源、计数和状态可换行，不遮挡相邻内容。

## 建议 metadata

```ts
export const meta = defineLessonMeta({
  id: 'vue.core.learn.intermediate.composables',
  type: 'lesson',
  title: '组合式函数',
  summary: '用响应式输入、返回 refs 与成对清理封装可复用的有状态逻辑',
  ecosystem: 'vue',
  module: 'core',
  collection: 'intermediate',
  level: 'intermediate',
  prerequisites: ['vue.core.learn.intermediate.component-v-model'],
  related: [
    'vue.core.learn.intermediate.component-v-model',
    'vue.core.learn.basics.watchers',
    'vue.core.reference.advanced.composables',
    'vue.core.reference.reactivity.utils',
    'vue.core.reference.composition.lifecycle',
  ],
  tags: ['组合式函数', 'composable', 'MaybeRefOrGetter', 'toValue', '副作用清理', '状态复用'],
  sources: [
    {
      title: 'Vue 组合式函数指南',
      url: 'https://cn.vuejs.org/guide/reusability/composables.html',
    },
    {
      title: 'Vue 响应式工具 toValue',
      url: 'https://cn.vuejs.org/api/reactivity-utilities.html#tovalue',
    },
    {
      title: 'Vue 侦听器副作用清理',
      url: 'https://cn.vuejs.org/guide/essentials/watchers.html#side-effect-cleanup',
    },
    {
      title: 'Vue 生命周期钩子注册',
      url: 'https://cn.vuejs.org/guide/essentials/lifecycle.html#registering-lifecycle-hooks',
    },
    {
      title: 'Vue SSR 指南',
      url: 'https://cn.vuejs.org/guide/scaling-up/ssr.html',
    },
    {
      title: 'Vue 3.5.40 ref.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts',
    },
    {
      title: 'Vue 3.5.40 effectScope.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effectScope.ts',
    },
    {
      title: 'Vue 3.5.40 watch.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/watch.ts',
    },
    {
      title: 'Vue 3.5.40 生命周期实现',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiLifecycle.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-31',
  estimatedMinutes: 50,
})
```

上述 prerequisite、related 五项及其顺序、唯一 Demo ID 和两个文件名均为冻结契约。实施批次可
按最终正文结构微调 summary/tags/sources 的文案，但不得改变依赖关系与 Demo 行为。

## 后续最小实施范围

后续实现限定为：

- `src/content/entries/learn/vue/core/intermediate/composables.ts`
- `src/content/demos/vue/core/learn/intermediate/composables/composable-contract-lab-demo.vue`
- `src/content/demos/vue/core/learn/intermediate/composables/useEventCounter.ts`
- `src/content/catalog/manifests/vue-core-track.ts`
- `src/content/catalog/vue-core-track.spec.ts`
- `src/content/interactive/registry.spec.ts`
- `tests/e2e/progress.spec.ts`
- `docs/重构实施计划.md`
- `docs/research/vue-composables.md`

本课完成后的 Vue Core 目标为 `17 available / 43 planned`。完成即停止，不进入
`vue.core.learn.intermediate.provide-inject`，也不修复现有 Reference。

## 固定来源清单

### Vue 官方中文文档

- [组合式函数指南](https://cn.vuejs.org/guide/reusability/composables.html)
- [`toValue()`](https://cn.vuejs.org/api/reactivity-utilities.html#tovalue)
- [侦听器副作用清理](https://cn.vuejs.org/guide/essentials/watchers.html#side-effect-cleanup)
- [生命周期钩子注册](https://cn.vuejs.org/guide/essentials/lifecycle.html#registering-lifecycle-hooks)
- [SSR 组件生命周期](https://cn.vuejs.org/guide/scaling-up/ssr.html#component-lifecycle-hooks)
- [SSR 平台特有 API](https://cn.vuejs.org/guide/scaling-up/ssr.html#access-to-platform-specific-apis)
- [SSR 跨请求状态污染](https://cn.vuejs.org/guide/scaling-up/ssr.html#cross-request-state-pollution)

### vuejs/core v3.5.40 固定源码

- [`packages/reactivity/src/ref.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts)
- [`packages/reactivity/src/effectScope.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effectScope.ts)
- [`packages/reactivity/src/watch.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/watch.ts)
- [`packages/runtime-core/src/apiLifecycle.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiLifecycle.ts)
- [`packages/runtime-core/src/component.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/component.ts)
- [`packages/runtime-core/src/renderer.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts)
- [`packages/runtime-core/src/apiWatch.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiWatch.ts)

### vuejs/core v3.5.40 官方测试

- [`packages/reactivity/__tests__/ref.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/ref.spec.ts)
- [`packages/reactivity/__tests__/effectScope.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/effectScope.spec.ts)
- [`packages/runtime-core/__tests__/apiWatch.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiWatch.spec.ts)
- [`packages/runtime-core/__tests__/apiLifecycle.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiLifecycle.spec.ts)
- [`packages/server-renderer/__tests__/ssrWatch.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/__tests__/ssrWatch.spec.ts)

## 自检结论

- prerequisite 只有组件 v-model，related 五项顺序已精确冻结。
- 主线先讲实例状态与返回 refs，再讲响应式输入，最后讲副作用所有权，符合新手认知顺序。
- 9 个易错点均包含错误示例、正确示例、后果和一手来源，不用数量替代质量。
- 源码推导独立成节，并区分公开契约、Vue 3.5.40 实现事实与课程推导。
- 唯一 Demo 用同一条交互链验证输入规范化、返回 refs、实例隔离和幂等清理。
- Provide / Inject、完整网络竞态、Pinia/共享 store、完整 SSR、Reference 修复及后续课程均明确排除。
