# Vue Core API 第 32 批：Options 状态与渲染官方调研

## 调研范围与证据纪律

- 冻结版本：`vue@3.5.40`，对应 `vuejs/core` commit
  [`fa2885d8c48768d26f1666a01bd540ffe3b20f9b`](https://github.com/vuejs/core/commit/fa2885d8c48768d26f1666a01bd540ffe3b20f9b)，
  提交信息为 `release: v3.5.40`。
- 调研日期：2026-08-02。
- 首轮网页检索使用 Tavily，`include_domains` 仅包含 `cn.vuejs.org`、`vuejs.org` 和
  `github.com`；随后逐项核对 `vuejs/core` 固定 commit 的公开类型、源码或官方测试。
- 官网 API 页面是 public contract 的首要依据；源码和测试用于确认 3.5.40 的环境、优先级和
  易错边界。`instance.ctx`、access cache、内部 slot flag 等实现细节不应进入课程公开契约。
- 本批覆盖两篇官方页面的 11 个 `merged` 项：状态选项 7 项、渲染选项 4 项。不拆出额外
  entry，也不把已有 Composition Reference 的内容复制成第二套教程。

## 冻结的两篇 merged 页面

| 官方页面 | 建议 entry id | collection | 建议标题 | 覆盖项 |
| --- | --- | --- | --- | --- |
| [状态选项](https://cn.vuejs.org/api/options-state.html) | `vue.core.reference.options-api.state-options` | `options-api` | `Options API：状态选项` | `data`、`props`、`computed`、`methods`、`watch`、`emits`、`expose` |
| [渲染选项](https://cn.vuejs.org/api/options-rendering.html) | `vue.core.reference.options-api.rendering-options` | `options-api` | `Options API：渲染选项` | `template`、`render`、`compilerOptions`、`slots` |

### 11 项唯一 heading 与 anchor

下列 anchor 按仓库 `headingId()` 的当前规则生成：去除首尾空白、转小写、空白转连字符，
最后删除中文、字母数字、下划线和连字符以外的字符。manifest 应冻结第四列的实际 anchor，
不能直接照抄官网 hash。

| Manifest id | entry id | 唯一 heading 文本 | `headingId()` anchor | 版本与主要环境 |
| --- | --- | --- | --- | --- |
| `options-state.data` | `vue.core.reference.options-api.state-options` | `data` | `data` | Vue 3.0+；Options API，浏览器与 SSR |
| `options-state.props` | `vue.core.reference.options-api.state-options` | `props` | `props` | Vue 3.0+；浏览器与 SSR；校验警告仅开发环境 |
| `options-state.computed` | `vue.core.reference.options-api.state-options` | `computed` | `computed` | Vue 3.0+；Options API，浏览器与 SSR |
| `options-state.methods` | `vue.core.reference.options-api.state-options` | `methods` | `methods` | Vue 3.0+；Options API，浏览器与 SSR |
| `options-state.watch` | `vue.core.reference.options-api.state-options` | `watch` | `watch` | Vue 3.0+；Options API，浏览器与 SSR |
| `options-state.emits` | `vue.core.reference.options-api.state-options` | `emits` | `emits` | Vue 3.0+；运行时声明；校验警告仅开发环境 |
| `options-state.expose` | `vue.core.reference.options-api.state-options` | `expose` | `expose` | Vue 3.0.3+；Options API 公共实例边界 |
| `options-rendering.template` | `vue.core.reference.options-api.rendering-options` | `template` | `template` | Vue 3.0+；浏览器运行时编译需完整构建 |
| `options-rendering.render` | `vue.core.reference.options-api.rendering-options` | `render` | `render` | Vue 3.0+；runtime-only、完整构建与 SSR 均可用 |
| `options-rendering.compiler-options` | `vue.core.reference.options-api.rendering-options` | `compilerOptions` | `compileroptions` | Vue 3.1+；仅运行时编译的完整构建 |
| `options-rendering.slots` | `vue.core.reference.options-api.rendering-options` | `slots` | `slots` | Vue 3.3+；仅类型辅助，选项值不参与运行时 |

`expose` 的版本不是官网 badge，而是官方 tag 的保守下界：
[v3.0.2](https://github.com/vuejs/core/blob/v3.0.2/packages/runtime-core/src/componentOptions.ts)
的公开类型尚无该字段，
[v3.0.3](https://github.com/vuejs/core/blob/v3.0.3/packages/runtime-core/src/componentOptions.ts#L116)
已包含。`compilerOptions` 在
[v3.0.11](https://github.com/vuejs/core/blob/v3.0.11/packages/runtime-core/src/componentOptions.ts)
尚无公开字段，
[v3.1.0](https://github.com/vuejs/core/blob/v3.1.0/packages/runtime-core/src/componentOptions.ts#L152)
已包含。`slots` 的 3.3+ 由官网直接标注，且
[v3.2.47](https://github.com/vuejs/core/blob/v3.2.47/packages/runtime-core/src/componentOptions.ts)
与
[v3.3.0](https://github.com/vuejs/core/blob/v3.3.0/packages/runtime-core/src/componentOptions.ts#L143)
也能交叉确认。

## 与现有 Composition / 相关 Reference 的交叉链接建议

| 本批 heading | 建议 related entry | 链接目的 |
| --- | --- | --- |
| `data` | `vue.core.reference.reactivity.ref`、`vue.core.reference.reactivity.reactive` | 对照 Options 实例代理与显式 ref/reactive 状态 |
| `props` | `vue.core.reference.components.props` | 复用单向数据流、类型声明和 prop 变更边界 |
| `computed` | `vue.core.reference.reactivity-watchers.computed` | 对照实例属性与 `computed()` 返回 ref 的形态 |
| `methods` | `vue.core.reference.advanced.composables` | 对照实例绑定方法与 setup 中普通函数/组合式函数 |
| `watch` | `vue.core.reference.reactivity-watchers.watch`、`vue.core.reference.reactivity-watchers.watch-post-sync` | 复用侦听源、清理与 flush 时机详解 |
| `emits` | `vue.core.reference.components.emits` | 复用 `defineEmits()`、事件命名和校验契约 |
| `expose` | `vue.core.reference.composition.template-refs` | 对照模板引用访问与 `<script setup>` 的 `defineExpose()` |
| `template` | `vue.core.reference.advanced.render-function` | 对照声明式模板与渲染函数，不复制渲染机制教程 |
| `render` | `vue.core.reference.advanced.render-function` | 复用 VNode、`h()` 和渲染函数约束 |
| `compilerOptions` | `vue.core.reference.application.application-configuration` | 对照 app 级配置与组件级覆盖关系 |
| `slots` | `vue.core.reference.components.slots` | 复用运行时 slot 函数、slot props 与 `useSlots()` |

## 页面一：Options API：状态选项

### 1. `data`

**推荐签名 / 类型**

```ts
interface ComponentOptions {
  data?(
    this: ComponentPublicInstance,
    vm: ComponentPublicInstance,
  ): object
}
```

**版本与环境**：Vue 3.0+；Options API 功能开启时适用于浏览器与 SSR。`data()` 不能是
`async`，也不能直接写成普通对象选项。

**公开行为边界**

- `data` 必须是为每个组件实例返回初始状态的函数；返回值应是只表示状态的普通 JavaScript
  对象，不应是带自身状态行为的浏览器对象或类实例。
- Vue 把返回对象变为响应式对象，并通过 `this.$data` 暴露；其中不以 `_` / `$` 开头的顶层
  属性还会代理到公共实例，因此 `this.count === this.$data.count`。
- 所有会用到的顶层属性应在初始返回对象中声明。暂时没有值时用 `undefined` 或 `null` 占位，
  不把挂载后临时新增顶层属性当作推荐契约。
- 普通函数中的 `this` 与首参 `vm` 都是组件公共实例代理。箭头函数没有动态 `this`，只能使用
  `vm`；类型源码还明确 `data()` 的 `this` 推断不包含 setup 返回值，不应借初始化顺序制造耦合。

**交叉链接**：`vue.core.reference.reactivity.ref`、
`vue.core.reference.reactivity.reactive`。

来源：[状态选项：data](https://cn.vuejs.org/api/options-state.html#data)、
[`componentOptions.ts` v3.5.40](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentOptions.ts#L383-L409)、
[`applyOptions()` data 路径](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentOptions.ts#L620-L653)、
[`apiOptions.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/apiOptions.spec.ts#L21-L48)。

### 2. `props`

**推荐签名 / 类型**

```ts
interface ComponentOptions {
  props?: string[] | Record<string, Prop>
}

type Prop<T = unknown> = PropOptions<T> | PropType<T> | null

interface PropOptions<T> {
  type?: PropType<T>
  required?: boolean
  default?: T | ((rawProps: object) => T)
  validator?: (value: unknown, props: object) => boolean
}
```

**版本与环境**：Vue 3.0+；浏览器与 SSR。类型、`required` 和自定义 validator 的失败检查
仅在开发环境警告；`Boolean` 转换和默认值解析也在生产运行。

**公开行为边界**

- 所有 props 都应显式声明。数组语法只声明名称；对象语法才能声明类型、必填、默认值和
  validator。
- 父组件未传值或传入 `undefined` 时应用 `default`。对象和数组默认值必须由工厂返回，工厂以
  当前 props 作为参数；3.5.40 会按实例缓存工厂结果，避免无关更新重新制造默认对象。
- `Function` 类型 prop 的函数默认值本身就是值，不会被当作默认工厂调用。
- validator 在 v3.5.40 接收当前值和完整、只读的已解析 props 视图；第二参数能力从 Vue 3.4+
  可用。validator 只声明开发期契约，不能作为权限、数据清洗或业务拒绝机制。
- `default` / `validator` 不应使用 `this`。需要其他 prop 时使用函数参数，并避免修改传入对象。

**交叉链接**：`vue.core.reference.components.props`。

来源：[状态选项：props](https://cn.vuejs.org/api/options-state.html#props)、
[Props 校验指南](https://cn.vuejs.org/guide/components/props.html#prop-validation)、
[`componentProps.ts` 公开类型](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentProps.ts#L44-L68)、
[`resolvePropValue()`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentProps.ts#L449-L489)、
[`componentProps.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/componentProps.spec.ts#L169-L223)。

### 3. `computed`

**推荐签名 / 类型**

```ts
interface ComponentOptions {
  computed?: Record<
    string,
    ComputedGetter<unknown> | WritableComputedOptions<unknown>
  >
}

type ComputedGetter<T> = (
  this: ComponentPublicInstance,
  vm: ComponentPublicInstance,
  previous?: T,
) => T

interface WritableComputedOptions<T> {
  get: ComputedGetter<T>
  set(this: ComponentPublicInstance, value: T): void
}
```

**版本与环境**：Vue 3.0+；Options API，浏览器与 SSR。`previous` 对应当前 Vue 3.5 行为；
课程示例不需要依赖它时可省略。

**公开行为边界**

- 每个键可以是只读 getter，或带 `get` / `set` 的可写计算属性；结果作为属性暴露在组件公共
  实例上，并沿用 `computed()` 的依赖追踪和缓存语义。
- 普通 getter / setter 的 `this` 自动绑定公共实例。箭头 getter 没有动态 `this`，但可以通过
  首参 `vm` 访问实例。
- 只有 getter 的计算属性是只读的；为它赋值会在开发环境警告，不能把赋值当作静默更新源状态。
- 可写 computed 的 setter 应把输入映射回真实源状态，不能在 getter 内制造副作用。

**交叉链接**：`vue.core.reference.reactivity-watchers.computed`。

来源：[状态选项：computed](https://cn.vuejs.org/api/options-state.html#computed)、
[英文 API 当前签名](https://vuejs.org/api/options-state.html#computed)、
[`componentOptions.ts` computed 路径](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentOptions.ts#L659-L693)、
[`apiOptions.spec.ts` getter 与 vm 测试](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/apiOptions.spec.ts#L50-L82)、
[只读警告测试](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/apiOptions.spec.ts#L1416-L1450)。

### 4. `methods`

**推荐签名 / 类型**

```ts
interface ComponentOptions {
  methods?: Record<
    string,
    (this: ComponentPublicInstance, ...args: unknown[]) => unknown
  >
}
```

**版本与环境**：Vue 3.0+；Options API，浏览器与 SSR。

**公开行为边界**

- 每个值必须是函数。声明的方法作为组件实例成员和模板表达式成员暴露。
- Vue 会把普通方法的 `this` 绑定到公共实例，即使把方法作为回调传递，绑定仍然保留。
- 箭头函数的词法 `this` 无法被 `.bind()` 改写，因此需要实例状态的方法必须使用方法简写或普通
  函数。
- 方法适合命令和事件响应；没有派生值缓存语义。纯派生值仍应使用 computed。

**交叉链接**：`vue.core.reference.advanced.composables`。

来源：[状态选项：methods](https://cn.vuejs.org/api/options-state.html#methods)、
[`componentOptions.ts` method 绑定](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentOptions.ts#L591-L617)、
[`apiOptions.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/apiOptions.spec.ts#L84-L123)。

### 5. `watch`

**推荐签名 / 类型**

```ts
interface ComponentOptions {
  watch?: Record<string, WatchOptionItem | WatchOptionItem[]>
}

type WatchOptionItem = string | WatchCallback | ObjectWatchOptionItem

type WatchCallback<T = unknown> = (
  value: T,
  oldValue: T,
  onCleanup: (cleanupFn: () => void) => void,
) => void

interface ObjectWatchOptionItem {
  handler: WatchCallback | string
  immediate?: boolean
  deep?: boolean | number
  once?: boolean
  flush?: 'pre' | 'post' | 'sync'
  onTrack?: (event: DebuggerEvent) => void
  onTrigger?: (event: DebuggerEvent) => void
}
```

**版本与环境**：Vue 3.0+；Options API，浏览器与 SSR。`once` 从 Vue 3.4+、数字
`deep` 从 3.5+ 进入底层公开 `WatchOptions`；Options State 官网的展示类型为简化版，主讲仍应聚焦
本批指定的 `immediate` / `deep` / `flush`。

**公开行为边界**

- key 可以是 `data` / `computed` 等公共实例根属性，或只由点分隔的简单路径，如 `user.profile.id`。
  key 不是表达式；调用、可选链、索引和运算应改用 `$watch()` getter 或先声明 computed。
- value 可以是 methods 中的方法名字符串、直接回调、带 `handler` 的选项对象，或这些形态组成的
  数组；数组中的 handler 按顺序分别注册。
- 直接函数和对象函数 handler 的 `this` 会绑定公共实例；箭头回调仍没有动态 `this`。
- `immediate` 在创建侦听器时调用，首次 `oldValue` 为 `undefined`。`deep` 触发嵌套变更，但在同一
  对象内部变更时新旧值可能是同一对象引用，不提供历史快照。
- 默认 `flush: 'pre'` 在组件 DOM 更新前调度；读取已更新 DOM 使用 `'post'`；`'sync'` 不批处理，
  应只用于简单、低频且确需同步的状态。
- 对象选项会传给底层 `watch()`，因此清理回调、调试钩子等语义与 Composition API 共用；完整教学
  交给现有 `watch` Reference。

**交叉链接**：`vue.core.reference.reactivity-watchers.watch`、
`vue.core.reference.reactivity-watchers.watch-post-sync`、
`vue.core.reference.reactivity-watchers.watch-effect`。

来源：[状态选项：watch](https://cn.vuejs.org/api/options-state.html#watch)、
[响应式 API：watch()](https://cn.vuejs.org/api/reactivity-core.html#watch)、
[侦听器指南](https://cn.vuejs.org/guide/essentials/watchers.html)、
[`componentOptions.ts` handler 归一化](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentOptions.ts#L849-L920)、
[`apiWatch.ts` 选项与调度](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/apiWatch.ts#L45-L53)、
[`apiOptions.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/apiOptions.spec.ts#L143-L285)。

### 6. `emits`

**推荐签名 / 类型**

```ts
interface ComponentOptions {
  emits?: string[] | Record<string, EmitValidator | null>
}

type EmitValidator = (...args: unknown[]) => boolean
```

**版本与环境**：Vue 3.0+；浏览器与 SSR。未声明事件与 validator 失败检查只在开发环境运行。

**公开行为边界**

- 数组语法只声明事件名；对象语法以 `null` 表示不校验，或以函数校验 `$emit()` 的全部 payload
  参数。
- validator 返回假值时，3.5.40 只发出开发警告，事件仍会继续派发；它不是运行时阻断器。
- 声明事件还会影响 listener 分类：匹配的监听器被视为组件事件监听器，不再作为透传 attribute
  落到根元素，并从 `$attrs` 排除。
- 应声明组件会发出的所有事件，但不要把开发期声明误当作生产数据安全边界。

**交叉链接**：`vue.core.reference.components.emits`、
`vue.core.reference.components.attrs`。

来源：[状态选项：emits](https://cn.vuejs.org/api/options-state.html#emits)、
[组件事件校验](https://cn.vuejs.org/guide/components/events.html#events-validation)、
[`componentEmits.ts` 校验路径](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentEmits.ts#L121-L153)、
[`componentEmits.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/componentEmits.spec.ts#L217-L245)。

### 7. `expose`

**推荐签名 / 类型**

```ts
interface ComponentOptions {
  expose?: string[]
}
```

**版本与环境**：Vue 3.0.3+；Options API 公共实例边界。它影响父组件通过模板引用、`$parent`
或 `$root` 取得的用户定义成员。

**公开行为边界**

- 默认 Options API 公共实例会暴露用户定义的实例属性；配置 `expose` 后只暴露数组中显式列出的
  用户成员。
- `expose: []` 关闭全部用户定义成员，但不会过滤 `$el`、`$emit` 等内置公共实例属性。
- 3.5.40 把列出的 key 以 getter / setter 转发到公共实例；不要依赖 `instance.exposed` 或
  expose proxy 等内部结构。
- `expose` 与 `defineExpose()` 目标相近但不是同一个入口：后者仅是 `<script setup>` 编译宏，
  `<script setup>` 默认关闭，宏会编译为 setup context 的 `expose({...})`，不能作为普通运行时函数
  调用。
- mixin / extends 中的 expose 不构成可组合的公共表面；公开表面应由组件本身显式决定。

**交叉链接**：`vue.core.reference.composition.template-refs`。

来源：[状态选项：expose](https://cn.vuejs.org/api/options-state.html#expose)、
[`defineExpose()`](https://cn.vuejs.org/api/sfc-script-setup.html#defineexpose)、
[`componentOptions.ts` expose 路径](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentOptions.ts#L754-L767)、
[`component.ts` 公共 expose proxy](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/component.ts#L1189-L1210)、
[`apiExpose.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/apiExpose.spec.ts#L34-L120)。

### 状态页易错点候选（8）

#### 候选 1：把 `data` 写成对象，或在箭头函数里使用 `this`

- **原因**：Vue 3 要求每个实例调用 `data()`；箭头函数只有词法 `this`，返回值还应是普通状态对象。
- **后果**：对象形式在开发环境警告且不是兼容回退；箭头中的 `this.user` 不指向组件实例。
- **错误方向**：`data: { count: 0 }`，或 `data: () => ({ owner: this.user })`。
- **正确方向**：使用 `data() { return { count: 0 } }`；确需箭头时用首参 `vm`。通过实例读取普通
  顶层属性，通过 `$data` 读取 `_` / `$` 前缀属性。

#### 候选 2：直接复用对象 prop 默认值，并把 validator 当生产防线

- **原因**：对象/数组默认值需要实例级工厂；prop validator 是开发期契约检查。
- **后果**：直接对象可能让实例共享可变状态；validator 返回 `false` 只产生开发警告，不能阻止危险
  数据进入业务逻辑。
- **错误方向**：`default: { page: 1 }`，或只靠 validator 实施权限、清洗和拒绝。
- **正确方向**：`default: (rawProps) => ({ page: 1 })`；安全与业务校验放在真正的输入边界，
  validator 只提供开发反馈。

#### 候选 3：计算属性使用箭头 `this`，或给只读 computed 赋值

- **原因**：箭头 getter 不接受动态绑定；只有 getter 的 computed 没有 setter。
- **后果**：getter 读到错误上下文；写入只读 computed 不会更新源状态并在开发环境警告。
- **错误方向**：`total: () => this.price * this.count`，随后 `this.total = 0`。
- **正确方向**：使用普通 getter，或箭头首参 `(vm) => vm.price * vm.count`；需要反向映射时显式提供
  `{ get, set }`。

#### 候选 4：methods 使用箭头函数依赖 `this`

- **原因**：Vue 只能绑定普通函数的动态 `this`，无法覆盖箭头函数的词法 `this`。
- **后果**：方法作为模板事件或回调调用时无法读取、修改组件状态。
- **错误方向**：`methods: { save: () => api.save(this.form) }`。
- **正确方向**：`methods: { save() { return api.save(this.form) } }`；不依赖实例的纯函数放到模块或
  composable。

#### 候选 5：把复杂表达式当作 watch key，或写出无效 handler 形态

- **原因**：Options watch key 只支持根属性和简单点路径；handler 只能是方法名、函数、带
  `handler` 的对象或其数组。
- **后果**：复杂 key 不会按表达式追踪；不存在的方法名或缺少 `handler` 的对象只会得到无效 handler
  警告。
- **错误方向**：`'items.filter(isActive).length': callback`，或 `{ deep: true }` 没有 handler。
- **正确方向**：先声明 computed，或使用 `$watch(() => expression, callback)`；数组中的每个 handler
  都使用受支持形态。

#### 候选 6：误解 `immediate`、`deep` 和 `flush`

- **原因**：首次 immediate 没有旧值；deep 遍历不创建历史快照；默认 pre 时序早于组件 DOM 更新。
- **后果**：把 `oldValue` 当旧对象副本会得到相同引用；在默认回调中读取 DOM 可能仍是更新前状态；
  sync 高频触发会失去批处理。
- **错误方向**：用 `deep: true` 做对象历史记录，或默认 flush 后立即测量更新后的 DOM。
- **正确方向**：历史记录显式复制所需字段；DOM 后置逻辑使用 `flush: 'post'`；`sync` 只用于简单、
  低频同步需求。

#### 候选 7：认为 emits validator 会取消事件

- **原因**：3.5.40 的 validator 失败分支只在开发环境发出 warning，之后仍继续 listener 派发。
- **后果**：无效 payload 仍可能被父组件接收；生产环境甚至没有该警告。
- **错误方向**：依赖 `emits: { submit: validate }` 阻断非法提交。
- **正确方向**：在调用 `$emit()` 前完成真正的业务判断；emits validator 只用于声明和开发诊断，
  同时利用声明控制 listener 透传。

#### 候选 8：混淆 Options `expose` 与 `defineExpose()`

- **原因**：Options 组件默认公开用户实例成员，而 `<script setup>` 默认关闭；`defineExpose()` 是编译
  宏，不是普通函数。
- **后果**：父引用表面与预期相反，或在普通运行时代码调用宏得到警告/无效行为；也可能误以为
  `expose: []` 会隐藏 `$el` 等内置成员。
- **错误方向**：把两种入口当作可以任意互换的运行时 API。
- **正确方向**：Options 组件在自身选项列出字符串 key；`<script setup>` 顶层调用
  `defineExpose({ ... })`，并把内置公共属性视为保留表面。

### 状态页 v3.5.40 源码推导与适用场景

| 固定源码 seam | 可以推导的公开边界 | 合适的教学 / 使用场景 |
| --- | --- | --- |
| `applyOptions()` 按 props、inject、methods、data、computed、watch 初始化 | `data()` 能访问已绑定 method，但不应把内部顺序扩成跨选项隐式协议 | 解释 Options 实例为何能在方法、计算和侦听器中使用 `this` |
| data 返回对象经 `reactive()`，公共 proxy 再解析 data key | `this.x` 是实例代理便利入口，不是原始对象复制 | 对照 Composition API 的显式 `reactive()` / `ref()` |
| methods 使用 `bind(publicThis)`；computed getter 绑定 `publicThis` 并传入 `vm` | 普通函数能使用 `this`，箭头 getter 只能使用首参，箭头 method 不适用 | 迁移旧 Options 代码时判断哪些箭头函数必须改写 |
| `createWatcher()` 对点路径建 getter，对数组递归注册，对象交给 `watch()` | 路径不是表达式；多 handler 与 `immediate/deep/flush` 都走同一底层 watch 语义 | 兼容声明式简单侦听；复杂源转到现有 `watch()` Reference |
| prop default factory 结果按实例缓存；validator 收到只读 props 视图 | 默认对象稳定且不应跨实例共享；validator 不能修改兄弟 prop | 组件库默认配置与开发期参数诊断 |
| emit validator 分支只 warning，`isEmitListener()` 另行分类 listener | 校验不阻断派发；声明还负责 attrs / listener 边界 | 解释为什么“声明事件”不只是 TypeScript 提示 |
| Options expose 转发选中 key，最终 public proxy 仍保留内置成员 | `expose` 缩小用户表面但不是完整沙箱 | 给模板引用提供最小命令式接口 |

## 页面二：Options API：渲染选项

### 8. `template`

**推荐签名 / 类型**

```ts
interface ComponentOptions {
  template?: string
}
```

**版本与环境**：Vue 3.0+。字符串模板的浏览器即时编译只在包含模板编译器的完整构建中可用；
文件名带 `runtime` 的构建和 Vite 默认 runtime-only 路径不包含该编译器。SFC 模板通常在构建期
预编译为 `render`。

**公开行为边界**

- `template` 字符串会在运行时编译。若同时存在 `render`，`template` 被忽略。
- 字符串以 `#` 开头时，Vue 用 `document.querySelector()` 定位元素，并读取其 `innerHTML` 作为
  模板。找不到元素时开发环境警告，并编译空字符串。
- 根组件既没有 `template` 也没有 `render` 时，浏览器 `createApp().mount()` 会尝试以挂载容器的
  `innerHTML` 作为模板，然后清空容器并挂载。
- **绝不能把不可信内容作为 template 编译。** Vue 模板会编译为 JavaScript；固定源码把 selector
  和 mount-container 的 `innerHTML` 路径标记为 `__UNSAFE__`，服务端提供的模板 DOM 也不能混入
  用户数据。
- 官网公开类型冻结为 `string`。3.5.40 内部类型还允许直接 DOM node，但课程 public signature 不应
  扩大到官网未承诺的对象形态。

**交叉链接**：`vue.core.reference.advanced.render-function`。

来源：[渲染选项：template](https://cn.vuejs.org/api/options-rendering.html#template)、
[安全指南：不要使用不可信模板](https://cn.vuejs.org/guide/best-practices/security.html#rule-no-1-never-use-non-trusted-templates)、
[`packages/vue/src/index.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/vue/src/index.ts#L30-L106)、
[`runtime-dom/src/index.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-dom/src/index.ts#L117-L143)、
[`packages/vue/__tests__/index.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/vue/__tests__/index.spec.ts#L5-L17)。

### 9. `render`

**推荐签名 / 类型**

```ts
interface ComponentOptions {
  render?(this: ComponentPublicInstance): VNodeChild
}

type VNodeChild =
  | VNode
  | string
  | number
  | boolean
  | null
  | undefined
  | VNodeChild[]
```

**版本与环境**：Vue 3.0+；预编译 SFC、runtime-only、完整构建和 SSR 都可使用渲染函数。

**公开行为边界**

- `render` 以 JavaScript 编程式创建组件 VNode 树，是字符串模板的替代入口；完整 VNode 规则交给
  现有 Render Function Reference。
- SFC `<template>` 在构建期编译为 render function，因此运行时看到的是 render，而不是等待浏览器
  再编译模板。
- 同一组件同时定义 `render` 和 `template` 时，`render` 优先，模板不会被编译。
- `setup()` 返回的 render function 会先成为实例 render；这是 Composition API render 用法，不应再
  与 Options `render` / `template` 叠加争夺输出。
- 普通 Options render 的 `this` 是公共实例代理。课程只讲公开调用上下文，不暴露内部
  `renderCache`、optimized flag 等参数。

**交叉链接**：`vue.core.reference.advanced.render-function`。

来源：[渲染选项：render](https://cn.vuejs.org/api/options-rendering.html#render)、
[渲染函数与 JSX](https://cn.vuejs.org/guide/extras/render-function.html)、
[`component.ts` 渲染归一化](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/component.ts#L929-L1052)、
[`componentRenderUtils.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentRenderUtils.ts#L81-L109)。

### 10. `compilerOptions`

**推荐签名 / 类型**

```ts
interface ComponentOptions {
  compilerOptions?: {
    isCustomElement?: (tag: string) => boolean
    whitespace?: 'condense' | 'preserve'
    delimiters?: [string, string]
    comments?: boolean
  }
}
```

**版本与环境**：Vue 3.1+；只在浏览器中能够运行时编译模板的完整构建生效。runtime-only 构建会
在开发环境警告；Vite SFC 应在 Vue 构建插件的 compiler options 中配置。

**公开行为边界**

- 字段与 `app.config.compilerOptions` 的运行时公开子集一致：自定义元素判定、空白处理、插值
  分隔符和注释保留。
- 组件级选项只影响当前组件，并高于 app 级配置。3.5.40 先合并 app 配置，再用组件配置覆盖同名
  字段；未被组件指定的 app 字段仍保留。
- 配置只影响尚待运行时编译的 `template`。它不能改写已经由 Vite / SFC compiler 生成的 render
  function。
- `comments` 的生产差异只有模板实际走这条运行时编译路径时才有意义。

**交叉链接**：`vue.core.reference.application.application-configuration`。

来源：[渲染选项：compilerOptions](https://cn.vuejs.org/api/options-rendering.html#compileroptions)、
[app.config.compilerOptions](https://cn.vuejs.org/api/application.html#app-config-compileroptions)、
[`component.ts` runtime-only 警告与合并](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/component.ts#L851-L857)、
[`runtimeCompilerOptions.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/vue/__tests__/runtimeCompilerOptions.spec.ts#L50-L103)。

### 11. `slots`

**推荐签名 / 类型**

```ts
import type { SlotsType } from 'vue'

defineComponent({
  slots: Object as SlotsType<{
    default: { message: string }
    item: { id: number }
  }>,
})
```

**版本与环境**：Vue 3.3+；这是 `defineComponent()` 的类型辅助选项，选项值本身不参与浏览器或
SSR 运行时行为。

**公开行为边界**

- `slots: Object as SlotsType<...>` 只让 setup context 和公共 `$slots` 获得 slot 名称、slot props
  类型；3.5.40 的 Options 初始化路径不读取该选项。
- 实际运行时 slots 仍来自父 VNode children，并通过 `setup(_, { slots })`、`useSlots()` 或 `$slots`
  访问。不能从 `this.$options.slots` 取得父组件传入的运行时 slot 内容。
- 该选项不要与 `<script setup>` 的 `defineSlots<T>()` 混淆。`defineSlots()` 同样提供类型提示，
  但其返回值被使用时，SFC compiler 会改写为 `useSlots()`，此时会读取真实运行时 slots。
- slot 是否存在仍是运行时条件；类型声明不能保证父组件一定传入 slot。

**交叉链接**：`vue.core.reference.components.slots`。

来源：[渲染选项：slots](https://cn.vuejs.org/api/options-rendering.html#slots)、
[`defineSlots()`](https://cn.vuejs.org/api/sfc-script-setup.html#defineslots)、
[`componentOptions.ts` SlotsType 泛型](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentOptions.ts#L110-L167)、
[`componentSlots.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentSlots.ts#L40-L61)、
[`defineSlots` 类型测试](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages-private/dts-test/defineComponent.test-d.tsx#L1590-L1650)。

### 渲染页易错点候选（6）

#### 候选 1：在 runtime-only / Vite SFC 路径期待 `template` 即时编译

- **原因**：浏览器运行时编译器只包含在 Vue 完整构建中；Vite SFC 通常在构建期生成 render。
- **后果**：runtime-only 组件提供 template 时无法渲染并在开发环境警告；运行时配置也无法改写
  已编译 SFC。
- **错误方向**：在默认 Vite 应用中依赖动态 `template` 字符串和 app/组件 runtime
  `compilerOptions`。
- **正确方向**：优先使用 SFC 预编译；确有可信浏览器模板编译需求时明确选择 full build 并接受
  体积、安全与 CSP 边界。

#### 候选 2：把用户输入、远端 HTML 或数据库内容作为 Vue template

- **原因**：模板表达式会被编译为 JavaScript，3.5.40 full build 最终以 `new Function` 创建 render。
- **后果**：攻击者可在应用上下文执行任意 JavaScript；SSR 场景还可能扩大到服务器攻击。
- **错误方向**：`template: '<div>' + userProvidedString + '</div>'`，即使字符串做过普通 HTML
  转义也把它放进了模板语法上下文。
- **正确方向**：模板必须完全受开发者控制；用户内容只作为已转义文本数据绑定。必须执行用户代码
  的产品应放入明确隔离的沙箱，而不是主应用模板编译器。

#### 候选 3：忽略 `#selector` 和根容器 `innerHTML` 也是模板来源

- **原因**：`template: '#source'` 读取所选元素 `innerHTML`；无 render/template 的根组件会读取
  mount 容器 `innerHTML`。
- **后果**：服务端或第三方写入 DOM 的用户数据可能意外进入模板编译，形成与直接字符串相同的执行
  风险。
- **错误方向**：认为“模板字符串不是代码里拼出来的”就天然可信。
- **正确方向**：审计 DOM 来源；不要挂载到含用户提供内容或未经隔离服务端内容的节点，selector
  模板元素也必须完全可信。

#### 候选 4：同时写 `render` 和 `template`，期待二者组合

- **原因**：运行时只选择一个组件 render；显式 render 会阻止 template 编译。
- **后果**：template 被静默忽略，维护者看到的标记与真实 UI 输出不一致。
- **错误方向**：用 template 做主体，再用 render “补一部分” VNode。
- **正确方向**：每个组件选择单一渲染入口；需要局部编程式组合时在 render 中显式创建完整 VNode
  树，或在模板中使用组件/插槽。

#### 候选 5：混淆组件级和构建期 compiler options

- **原因**：组件 `compilerOptions` 只属于 full build 的运行时编译，并按字段覆盖 app 级同名配置；
  SFC 编译发生在构建工具中。
- **后果**：Vite 页面配置不生效，或组件局部配置意外改变 app 默认行为。
- **错误方向**：把组件 `compilerOptions` 当作对所有 SFC 生效的全局构建配置，或认为 app 级一定
  高于组件级。
- **正确方向**：预编译 SFC 在 Vue 插件中配置；full build 才使用运行时选项，并明确“app 默认、
  组件覆盖”的优先级。

#### 候选 6：把 Options `slots` 当作运行时插槽数据

- **原因**：该字段在 3.3+ 只承载 `SlotsType` 泛型；实际 slot 来自 VNode children。
- **后果**：读取 `this.$options.slots` 得不到父组件传入内容，或把类型存在误判为 slot 必然存在。
- **错误方向**：在 `slots` 选项里放回调或数据，期待 Vue 运行时注册/调用。
- **正确方向**：只写 `Object as SlotsType<...>` 做类型声明；运行时通过 setup context、`useSlots()`
  或 `$slots` 访问，并继续判空。

### 渲染页 v3.5.40 源码推导与适用场景

| 固定源码 seam | 可以推导的公开边界 | 合适的教学 / 使用场景 |
| --- | --- | --- |
| `packages/vue` 注册 runtime compiler，runtime-core 的 `compile` 可为空 | `template` 即时编译取决于构建产物，不是所有 `vue` import 都自动具备 | 解释 standalone full build 与 Vite runtime-only 的区别 |
| `compileToFunction()` 对 `#` 查询和 `innerHTML` 路径标注 `__UNSAFE__` | 不可信模板是代码执行边界，不是普通转义问题 | 安全审查动态模板、CMS DOM 与无构建页面 |
| `finishComponentSetup()` 仅在没有实例 render 且没有 `Component.render` 时编译 template | setup render / Options render 优先于 template | 排查“模板为何没有生效” |
| compiler options 先合并 app，再覆盖 component 字段 | 组件级优先；未覆盖的 app 字段继续保留 | full build 中少数组件需要不同分隔符或 custom element 识别 |
| `applyOptions()` 不读取 `slots`；`initSlots()` 从 VNode children 建立运行时 slots | Options `slots` 值只做类型推断，运行时 slot 来源是父渲染树 | 对照 `SlotsType`、`useSlots()` 与 `$slots` |
| 官方 runtime compiler 测试让组件 `comments: true` 覆盖 app `false` | 优先级有固定回归证据，但只在运行时编译环境成立 | 为 full build 的组件局部 compiler 配置写最小验证 |

## 跨项边界与保守结论

| 边界 | 冻结结论 |
| --- | --- |
| Options API feature | 状态选项依赖 Options API 功能；不为关闭 `__VUE_OPTIONS_API__` 的构建承诺行为 |
| 开发期校验 | props 与 emits 的类型/validator 失败主要是 warning，不是生产业务拒绝机制 |
| 实例代理 | `data`、computed、methods、watch handler 的 `this` 是公共实例便利入口；箭头函数规则逐项不同 |
| watch 扩展字段 | 3.5.40 公共 `WatchOptions` 还含 `once` 与数字 `deep`；Options State 页面为简化类型，主页面可作高级备注，不应挤占本批重点 |
| expose 两种入口 | Options `expose` 与 `<script setup>` `defineExpose()` 目标相近、默认表面不同，不能描述为同一个运行时 API |
| template 公开类型 | 官网签名是 `string`；内部 `string | object` 用于直接 DOM node，课程保持官网的较窄 public contract |
| render 优先级 | setup 返回 render 先占实例，显式 Options render 阻止 template 编译；课程重点冻结 render 高于 template |
| compilerOptions | 组件级只在 full build 运行时编译生效，并高于 app 级同名字段；Vite SFC 走构建插件配置 |
| slots 类型边界 | “运行时不访问”只指 Options `slots` 选项；赋值使用的 `defineSlots()` 会编译为 `useSlots()` 并读取真实运行时 slots |

## 实施验收建议

1. 只建立 `state-options` 与 `rendering-options` 两篇 entry，id、collection 和标题采用本文冻结值；
   7 + 4 个 manifest target 分别指向 11 个唯一 heading。
2. `anchors` 数组至少逐字包含本文 11 个 API heading；用真实 `headingId()` 检查
   `compilerOptions -> compileroptions`，不要手写官网的 hash 规则。
3. 两篇 entry 的 signature 合计覆盖全部 11 项；`watch` 可在高级备注标明 3.5 的数字 deep 与 3.4
   的 once，但主体必须完整讲清路径 key、对象/数组 handler、immediate/deep/flush。
4. 状态页至少保留四个醒目边界：data 普通对象/实例代理、props 工厂与开发校验、emits 校验不
   阻断、expose 与 defineExpose 的默认表面差异。
5. 渲染页至少保留四个醒目边界：template 仅完整构建运行时编译、绝不编译不可信模板、render
   高于 template、组件 compilerOptions 高于 app 且只作用于运行时编译。
6. `slots` 示例只把 `Object as SlotsType<...>` 当类型辅助；运行时示例继续从 setup context、
   `useSlots()` 或 `$slots` 读取，不访问 `this.$options.slots`。
7. 源码段只展示能解释 public contract 的最小 seam，不把内部 proxy target、scheduler job、slot
   flag 或 compile cache 暴露为业务可依赖 API。
