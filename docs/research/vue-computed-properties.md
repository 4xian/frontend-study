# Vue Core 基础课程：计算属性调研

> 核验日期：2026-07-29
>
> 适用版本：Vue 3.5.40。
>
> 资料范围：Vue 中文官网、`vuejs/core` 的 `v3.5.40` 固定标签源码与同标签官方测试。
> 外部资料通过 Tavily 检索、提取后回到官方页面或固定源码逐项核验。

## 课程定位与边界

本课目标 ID 为 `vue.core.learn.basics.computed-properties`，在现有基础课程清单中位于
“响应式状态”之后、“侦听器”之前。面向已经会用 `ref()`、`reactive()` 修改状态，并理解
脚本中 `.value` 与模板自动解包的学习者。

本课只回答“怎样从现有响应式状态声明一个可复用的派生值”，不把计算属性讲成通用的
“状态变化回调”：

- 正文聚焦 getter-only computed、缓存、惰性求值、响应式依赖和最小的 writable computed。
- `watch()`、`watchEffect()`、异步请求、DOM 操作、副作用清理与 flush 时机留给下一课
  “侦听器”。本课只用反例说明这些任务不属于 computed getter。
- 不展开完整响应式数据结构、批处理调度、SSR 特殊路径或编译器实现；源码只服务于解释
  可观察行为。
- `oldValue`、调试钩子、返回对象的稳定性属于课末“进阶提示”，不应抢占新手主线。

**课程依据：** [Vue 计算属性指南](https://cn.vuejs.org/guide/essentials/computed.html)、
[Vue 响应式核心 API：computed](https://cn.vuejs.org/api/reactivity-core.html#computed)、
[`vue-core-track.ts`](../../src/content/catalog/manifests/vue-core-track.ts)。

## 学习目标

完成本课后，学习者应能：

1. 把依赖已有状态的复杂或重复模板表达式移到 getter-only `computed()`。
2. 在脚本中通过 `.value` 读取计算结果，在模板中依赖顶层 ref 自动解包。
3. 通过可观察实验解释“缓存”和“惰性”：未读取不求值，依赖不变时重复读取不重算，
   依赖变化后也要到下次读取才重算。
4. 区分源状态、派生状态与副作用，保证 computed getter 只计算并返回值。
5. 知道 getter-only computed 默认只读；确有双向适配需求时，才使用 `get`/`set` 形式。
6. 能判断一个需求应该使用 computed、普通函数，还是留给下一课的 watcher。

## 建议教学顺序

### 1. 从模板中的重复派生逻辑进入

先展示一个学习任务列表：源状态是 `lessons` 与 `query`，模板中重复出现过滤、计数和文案
拼接。把它们改为 `visibleLessons`、`remainingCount` 等命名派生值，让学习者先理解 computed
解决的是“由状态得到新值”，而不是先讲内部机制。

指南同样从复杂模板表达式切入，并推荐用计算属性描述依赖响应式状态的复杂逻辑。

**来源：** [Vue 计算属性：基础示例](https://cn.vuejs.org/guide/essentials/computed.html#basic-example)。

### 2. 教 getter-only computed 的最小用法

```ts
import { computed, ref } from 'vue'

const price = ref(12)
const quantity = ref(2)
const total = computed(() => price.value * quantity.value)

console.log(total.value) // 24
```

必须同步复习访问规则：脚本读 `total.value`，模板中的顶层 `total` 自动解包。getter 返回值
会自动推导，例如上例是 `ComputedRef<number>`；需要约束返回类型时可写
`computed<number>(() => ...)`。

**来源：** [Vue 响应式核心 API：computed](https://cn.vuejs.org/api/reactivity-core.html#computed)、
[Vue TypeScript：为 computed 标注类型](https://cn.vuejs.org/guide/typescript/composition-api.html#typing-computed)、
[Vue 响应式基础：模板中的 ref 解包](https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html#ref-unwrapping-in-templates)。

### 3. 用“读取次数”建立缓存与惰性模型

按以下顺序让学习者预测 getter 是否执行：

1. 创建 computed 后暂不读取：getter 执行 0 次。
2. 第一次读 `.value`：执行 1 次并缓存。
3. 源依赖不变，连续读取：仍为 1 次。
4. 修改一个已追踪依赖，但不读取 computed：仍为 1 次。
5. 再读 `.value`：执行第 2 次并更新缓存。
6. 修改无关状态再读取：不增加次数。

官网明确说明 computed 基于响应式依赖缓存；官方 `computed.spec.ts` 还直接验证了创建时不
求值、依赖改变后直到下一次读取才求值。

**来源：** [Vue 计算属性：缓存与方法](https://cn.vuejs.org/guide/essentials/computed.html#computed-caching-vs-methods)、
[`computed.spec.ts` 3.5.40：should compute lazily](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/computed.spec.ts#L54-L80)。

### 4. 再解释“依赖是 getter 实际读取到的响应式值”

使用条件分支示例：

```ts
const discountEnabled = ref(false)
const subtotal = ref(100)
const discountRate = ref(0.1)

const total = computed(() =>
  discountEnabled.value
    ? subtotal.value * (1 - discountRate.value)
    : subtotal.value,
)
```

首次在 `discountEnabled` 为 `false` 时求值，不会读取 `discountRate.value`，因此此时修改
折扣率不会使 `total` 失效。切换开关并重新求值后，折扣率才进入当前依赖集合。这里要用
“本次实际读取”而不是“getter 代码里出现过”描述依赖。

**来源：** [`dep.ts` 3.5.40：Dep.track](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/dep.ts#L108-L165)、
[`effect.ts` 3.5.40：prepareDeps/cleanupDeps](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effect.ts#L312-L350)。

### 5. 比较 computed 与普通函数，不把缓存讲成绝对优势

- 同一个无参数派生值会被模板或其他 computed 重复读取，且计算有一定成本：优先 computed。
- 每次调用都带不同参数，或明确希望每次调用重新计算：使用普通函数。
- 一次性、非常短且不重复的表达式可以留在模板中，不必为了“用了 computed”而搬运。

普通方法在组件重渲染时会重新执行；computed 在依赖未变时返回缓存。课程应把选择标准落在
“是否表示一个可复用的派生值”和“是否需要按依赖缓存”，而不是宣称 computed 永远更快。

**来源：** [Vue 计算属性：缓存与方法](https://cn.vuejs.org/guide/essentials/computed.html#computed-caching-vs-methods)。

### 6. 最后引入 writable computed

先强调绝大多数 computed 应保持 getter-only。只有一个值需要作为源状态的双向“视图”或
“适配器”时，才提供 setter：

```ts
const firstName = ref('Ada')
const lastName = ref('Lovelace')

const fullName = computed({
  get: () => `${firstName.value} ${lastName.value}`,
  set: (value: string) => {
    ;[firstName.value, lastName.value] = value.split(' ')
  },
})
```

写入 `fullName.value` 只会调用 setter；setter 必须更新真正的源状态。computed 本身没有一份
独立、可由 setter 直接保存的业务状态。

**来源：** [Vue 计算属性：可写计算属性](https://cn.vuejs.org/guide/essentials/computed.html#writable-computed)、
[`computed.ts` 3.5.40：value getter/setter](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/computed.ts#L131-L153)。

### 7. 把 oldValue 与调试能力放入可选进阶区

getter 会收到上一次计算结果，首次为 `undefined`。Vue 3.4+ 的计算属性稳定性允许在完整读取
本次依赖后，经比较确认语义没有变化时返回旧对象，避免因为每次创建新对象而触发下游。
这不是基础课必会写法，必须放在普通 computed 已掌握之后。

`computed()` 的第二个参数还可提供 `onTrack`、`onTrigger` 调试钩子；二者仅开发模式生效，
适合解释“收集了谁、被谁触发”，不应进入生产业务逻辑。

**来源：** [Vue 计算属性：获取上一个值](https://cn.vuejs.org/guide/essentials/computed.html#previous)、
[Vue 性能优化：计算属性稳定性](https://cn.vuejs.org/guide/best-practices/performance.html#computed-stability)、
[Vue 深入响应式：计算属性调试](https://cn.vuejs.org/guide/extras/reactivity-in-depth.html#computed-debugging)。

## getter-only 与 writable computed 的准确行为和类型

### 面向课程的行为对照

| 形式 | 创建方式 | 读取 | 写入 | 状态所有权 |
| --- | --- | --- | --- | --- |
| getter-only | `computed(() => value)` | 首次或失效后的下一次读取执行 getter，否则返回缓存 | TypeScript 阻止给 `.value` 赋值；开发模式强行写入会警告 | 源 `ref`/`reactive` 拥有状态 |
| writable | `computed({ get, set })` | 与 getter-only 相同，仍然缓存和惰性求值 | 调用 setter，setter 返回值被忽略 | setter 必须反向更新源状态 |

**来源：** [Vue 响应式核心 API：computed](https://cn.vuejs.org/api/reactivity-core.html#computed)、
[`computed.ts` 3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/computed.ts#L105-L153)。

### v3.5.40 实际导出类型

固定源码的核心声明是：

```ts
export interface ComputedRef<T = any> extends BaseComputedRef<T> {
  readonly value: T
}

export interface WritableComputedRef<T, S = T> extends BaseComputedRef<T, S> {}

export type ComputedGetter<T> = (oldValue?: T) => T
export type ComputedSetter<T> = (newValue: T) => void

export function computed<T>(getter: ComputedGetter<T>): ComputedRef<T>
export function computed<T, S = T>(
  options: WritableComputedOptions<T, S>,
): WritableComputedRef<T, S>
```

教学上需要把以下几点说准：

- getter-only 的只读边界是 computed ref 的 `.value` 赋值入口。
- getter 返回对象时，Vue 不会自动把该对象转换成深只读代理。官方测试明确验证
  `isReadonly(computedObject.value) === false`。指南要求“把派生快照视为只读”是状态所有权
  规则，不等于运行时深冻结。
- writable 类型在 v3.5.40 支持读取类型 `T` 与写入类型 `S` 不同；初学示例继续使用同一类型，
  避免把类型技巧混入基础概念。
- 官网 API 页面用 `Readonly<Ref<Readonly<T>>>` / `Ref<T>` 表达公开行为；课程代码与精确类型
  说明应以固定版本导出的 `ComputedRef<T>` / `WritableComputedRef<T, S>` 为准。

**来源：** [`computed.ts` 3.5.40：类型声明](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/computed.ts#L16-L40)、
[`computed.ts` 3.5.40：重载](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/computed.ts#L189-L220)、
[`computed.spec.ts` 3.5.40：只读边界](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/computed.spec.ts#L205-L231)。

## 缓存、惰性求值与依赖传播的源码证据

### 1. 创建时只记录 getter，不执行 getter

`computed()` 只区分函数形式与 `get`/`set` 对象，随后创建 `ComputedRefImpl`。实例初始带
`DIRTY` 标记和未定义缓存 `_value`，构造过程没有调用 getter。因此“创建 computed 就计算”
是错误模型。

**来源：** [`computed.ts` 3.5.40：初始字段](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/computed.ts#L47-L82)、
[`computed.ts` 3.5.40：computed 工厂](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/computed.ts#L198-L220)。

### 2. 读取 value 时才刷新并返回缓存

`get value()` 先让使用者订阅 computed 自己的 `dep`，再调用 `refreshComputed(this)`，最后返回
`_value`。这说明 computed 有两面：它作为 subscriber 读取源依赖，也作为 ref 让模板、其他
computed 或 effect 订阅它。

**来源：** [`computed.ts` 3.5.40：dep 与 subscriber 字段](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/computed.ts#L47-L82)、
[`computed.ts` 3.5.40：get value](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/computed.ts#L131-L145)。

### 3. 源变化先标脏，不在 notify 中执行 getter

源 `Dep.trigger()` 增加自己的 `version` 和全局 `globalVersion`，再通知订阅者。computed 的
`notify()` 只设置 `DIRTY` 并进入批处理；调用链中没有执行 `fn`。因此源变化与 getter 重算
在时间上是分开的。

**来源：** [`dep.ts` 3.5.40：trigger/notify](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/dep.ts#L167-L204)、
[`computed.ts` 3.5.40：notify](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/computed.ts#L114-L129)。

### 4. refreshComputed 按多层快速路径决定是否重算

`refreshComputed()` 依次使用以下判断：

1. 已追踪且未脏，直接返回。
2. 自上次刷新后全局没有任何响应式变化，`globalVersion` 相同，直接返回。
3. 全局有变化，但该 computed 自己记录的依赖版本都没变，直接返回。
4. 确实需要重算时，才把 `activeSub` 设为当前 computed、开启追踪并调用
   `computed.fn(computed._value)`。
5. 新旧结果使用 `Object.is` 语义比较；只有结果真的变化才更新缓存并增加 computed 自己的
   `dep.version`，从而避免不必要的下游 effect 更新。

**来源：** [`effect.ts` 3.5.40：isDirty/refreshComputed](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effect.ts#L353-L430)、
[`dep.ts` 3.5.40：globalVersion](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/dep.ts#L14-L19)、
[`general.ts` 3.5.40：hasChanged](https://github.com/vuejs/core/blob/v3.5.40/packages/shared/src/general.ts#L143-L144)。

### 5. 每次真实重算都会刷新动态依赖集合

重算前，`prepareDeps()` 把旧依赖链接标为未使用；getter 执行时，`Dep.track()` 同步本次实际
读取的链接；重算后，`cleanupDeps()` 删除未再次读取的依赖。因此条件分支切换后，computed
不会永久订阅已经离开的分支。

**来源：** [`dep.ts` 3.5.40：Link/track](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/dep.ts#L21-L62)、
[`dep.ts` 3.5.40：Dep.track](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/dep.ts#L108-L165)、
[`effect.ts` 3.5.40：依赖准备与清理](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effect.ts#L312-L350)。

## 真实常见易错点

### 1. 在脚本中忘记 `.value`，或在模板顶层多写 `.value`

- **后果：** 脚本拿到的是 computed ref 对象而不是结果，比较、运算或传参会错误；模板顶层
  多写 `.value` 会破坏课程刚建立的统一访问规则。
- **错误方向：** `if (remainingCount > 0)`；模板写 `{{ remainingCount.value }}`。
- **正确方向：** 脚本用 `remainingCount.value`，模板顶层用 `{{ remainingCount }}`。
- **来源：** [Vue 计算属性：基础示例](https://cn.vuejs.org/guide/essentials/computed.html#basic-example)、
  [Vue 模板中的 ref 解包](https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html#ref-unwrapping-in-templates)。

### 2. 依赖 Date.now()、普通变量或非响应式外部值并期待自动更新

- **后果：** computed 首次读取后持续返回缓存；时间已经过去或普通变量已变化，界面仍不变。
- **错误方向：** `const now = computed(() => Date.now())` 并期待它每秒刷新。
- **正确方向：** 让真正会变化的输入成为响应式源；若需求是定时器等副作用，在下一课用合适
  生命周期与 watcher/事件流程组织。
- **来源：** [Vue 计算属性：缓存与方法](https://cn.vuejs.org/guide/essentials/computed.html#computed-caching-vs-methods)。

### 3. 在 getter 中修改状态、发请求、操作 DOM 或把日志当业务触发器

- **后果：** getter 何时执行取决于是否被读取和依赖是否失效，可能根本不执行、重复执行或
  形成递归更新；副作用时序难以预测。
- **错误方向：** 在 `computed(() => { fetch(...); count.value++; return ... })` 中混合副作用。
- **正确方向：** getter 只读取依赖并返回派生值；异步请求、DOM 操作与响应变化后的动作留给
  事件、生命周期或下一课 watcher。
- **来源：** [Vue 计算属性：Getter 不应有副作用](https://cn.vuejs.org/guide/essentials/computed.html#getters-should-be-side-effect-free)、
  [`computed.spec.ts` 3.5.40：惰性求值](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/computed.spec.ts#L54-L80)。

### 4. 给 getter-only computed 赋值

- **后果：** TypeScript 会报错；绕过类型后，开发模式只会得到
  `Write operation failed: computed value is readonly` 警告，源状态不会改变。
- **错误方向：** `fullName.value = 'Grace Hopper'`，但 `fullName` 仅由 getter 创建。
- **正确方向：** 优先修改 `firstName`、`lastName` 等源状态；确有双向适配需求才提供 setter。
- **来源：** [Vue 计算属性：可写计算属性](https://cn.vuejs.org/guide/essentials/computed.html#writable-computed)、
  [`computed.ts` 3.5.40：只读警告](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/computed.ts#L147-L152)。

### 5. 在 writable setter 中只 return 新值，不更新源状态

- **后果：** setter 的返回值被忽略；下一次读取仍由 getter根据旧源状态得到旧结果，看起来像
  “赋值没有生效”。
- **错误方向：** `set: value => value.trim()`。
- **正确方向：** `set` 解析输入并写回 getter 所依赖的 `ref`/`reactive` 源。
- **来源：** [`computed.ts` 3.5.40：setter 调用](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/computed.ts#L147-L150)、
  [Vue 计算属性：可写计算属性](https://cn.vuejs.org/guide/essentials/computed.html#writable-computed)。

### 6. 直接修改 getter 返回的对象，并误以为它会被深只读保护

- **后果：** getter-only 只限制替换 `.value`；返回对象本身可能仍可变。直接修改派生快照会
  绕过清晰的状态所有权，源变化后的下一次计算还可能覆盖这次修改。
- **错误方向：** `selectedUser.value.name = 'Grace'`，把派生查找结果当写入入口。
- **正确方向：** 通过 `users` 等源状态的明确 action 更新；派生结果只读取。
- **来源：** [Vue 计算属性：避免直接修改计算属性值](https://cn.vuejs.org/guide/essentials/computed.html#avoid-mutating-computed-value)、
  [`computed.spec.ts` 3.5.40：返回值并非自动 readonly](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/computed.spec.ts#L215-L231)。

### 7. 以为 getter 代码里出现的所有响应式值都会永久成为依赖

- **后果：** 修改当前未执行分支中的状态不会使 computed 失效，调试时容易误判为响应式失效。
- **错误方向：** `enabled ? a.value : b.value` 当前只读 `a`，却期待修改 `b` 立即重算。
- **正确方向：** 把依赖理解为“本次求值实际读取”；若结果确实始终依赖两者，就在求值路径中
  明确读取两者。
- **来源：** [`dep.ts` 3.5.40：依赖追踪](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/dep.ts#L108-L165)、
  [`effect.ts` 3.5.40：动态依赖清理](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effect.ts#L312-L350)。

### 8. 每次重算都返回新对象，却期待“内容相同就不触发下游”

- **后果：** Vue 使用 `Object.is` 比较新旧结果；两个内容相同的新对象仍是不同引用，会增加
  computed 的版本并可能触发下游更新。
- **错误方向：** `computed(() => ({ isEven: count.value % 2 === 0 }))`。
- **正确方向：** 基础场景优先返回原始值或稳定引用；确有性能证据时，完整读取本次依赖后
  比较 `oldValue` 并在语义不变时返回旧对象。
- **来源：** [Vue 性能优化：计算属性稳定性](https://cn.vuejs.org/guide/best-practices/performance.html#computed-stability)、
  [`effect.ts` 3.5.40：结果变化判断](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effect.ts#L413-L420)。

### 9. 把需要参数的查询硬塞进 computed

- **后果：** computed 表示一个固定的派生 ref，不能像函数一样为每个参数自然产生不同结果；
  容易引入额外的“当前参数”状态和不必要耦合。
- **错误方向：** 为“按任意 ID 找课程”维护 `selectedId`，只为了调用一次 computed。
- **正确方向：** 固定当前选择的派生结果用 computed；真正的参数化查询用普通函数。
- **来源：** [Vue 计算属性：缓存与方法](https://cn.vuejs.org/guide/essentials/computed.html#computed-caching-vs-methods)。

## 基于源码推导的适用场景与高级用法

### 适合使用 computed

- 过滤、排序、映射、汇总、格式化等由多个 `ref`/`reactive` 字段得到的展示值。
- 同一派生结果会被模板多处读取，或被其他 computed 继续组合的场景。官方测试覆盖 computed
  链式依赖，源码中的 computed 自有 `dep` 也正是这类组合的基础。
- 计算成本较高且输入相比渲染频率变化更少的场景，缓存可以避免重复 getter 调用。
- writable computed 作为双向单位换算、分拆/合并字段、组件模型适配层；setter 只负责把输入
  还原并提交给源状态。

**来源：** [Vue 计算属性指南](https://cn.vuejs.org/guide/essentials/computed.html)、
[`computed.spec.ts` 3.5.40：chained computed](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/computed.spec.ts#L94-L126)、
[`dep.ts` 3.5.40：computed 的订阅关系](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/dep.ts#L193-L231)。

### 可选高级用法

- 用 getter 的 `oldValue` 保持返回对象身份，但必须先完成本次所有依赖读取，再决定返回旧值，
  否则会漏收依赖。
- 使用 `onTrack`/`onTrigger` 定位依赖收集和触发原因；只用于开发调试。
- writable computed 可以使用不同的读取类型 `T` 与写入类型 `S`，例如脚本读取数字但输入端
  写入字符串；基础课程只需说明能力，不必用复杂泛型作为主示例。
- 条件依赖可让昂贵分支只在启用时订阅相关状态；分支切换后的旧依赖会被清理。

**来源：** [Vue 计算属性：获取上一个值](https://cn.vuejs.org/guide/essentials/computed.html#previous)、
[Vue 性能优化：计算属性稳定性](https://cn.vuejs.org/guide/best-practices/performance.html#computed-stability)、
[Vue 计算属性调试](https://cn.vuejs.org/guide/extras/reactivity-in-depth.html#computed-debugging)、
[`computed.ts` 3.5.40：读写泛型](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/computed.ts#L27-L40)。

### 不适合使用 computed

- 发请求、写存储、操作 DOM、启动定时器、记录分析事件等副作用：留给事件、生命周期或下一课
  watcher。
- 需要每次调用都重新计算或接受任意参数的逻辑：使用普通函数。
- 需要独立修改和持久保存的业务状态：使用 `ref()`/`reactive()`，不要把派生快照当源状态。
- 依赖系统时间、随机数或非响应式 SDK 状态却没有响应式触发源的值：computed 不会自行轮询。
- 单次且非常简单的模板表达式：保留表达式通常更直接。

**来源：** [Vue 计算属性最佳实践](https://cn.vuejs.org/guide/essentials/computed.html#best-practices)、
[Vue 计算属性：缓存与方法](https://cn.vuejs.org/guide/essentials/computed.html#computed-caching-vs-methods)。

## 同源 Demo 建议：缓存与动态依赖实验台

使用一个自包含 SFC，不请求外部数据，也不使用 `watch()`/`watchEffect()`：

### 状态与计算

- 源状态：`price`、`quantity`、`discountEnabled`、`discountRate`、`note`。
- `total` computed 始终读取价格、数量和折扣开关；只有开关开启时才读取折扣率。
- getter 内部仅为教学仪表增加一个普通、非响应式 `getterRuns` 计数，并记录本次读取的依赖名。
  旁注明确标记“这是 Demo 仪表，不是业务 getter 写法”。
- “读取 total”按钮执行 `total.value`，再把结果、累计 getter 次数和依赖名复制到可见的
  `snapshot` ref。这样不需要 watcher，也不会因面板自动读取 total 而破坏惰性实验。

### 必须可验证的交互顺序

1. 初始显示 getter 0 次；点击“读取 total”后变为 1 次。
2. 连续点击“读取 total”，结果相同且 getter 次数不增加，证明缓存。
3. 修改 `note` 后再读取，次数不增加，证明无关状态不是依赖。
4. 修改 `price` 后不读取，次数不增加；点击读取后只增加 1，证明失效与重算分离。
5. 折扣关闭时修改 `discountRate` 再读取，次数不增加；开启折扣并读取后，依赖面板新增
   `discountRate`。
6. 折扣开启时再改折扣率并读取，次数增加；关闭折扣并完成一次读取后，依赖面板移除折扣率。

### 390px 布局约束

- 单列 flex 布局，控制区允许 `flex-wrap`；不使用 `grid`，不使用 `gap`，控件间距使用明确的
  margin。
- 输入与按钮宽度在 390px 视口内不产生横向滚动；按钮至少 44px 高，长标签可换行。
- 结果、缓存次数、当前依赖和操作说明分成连续的全宽区块，不嵌套卡片。
- getter 次数使用稳定宽度数字区域，状态变化不引发布局跳动。

该 Demo 的单一主问题是“什么时候真的执行 getter”，条件折扣只是用于证明依赖集合会随实际
读取变化，不应再加入 watcher、异步请求或 writable computed，以免分散教学目标。

## 建议关联的现有课程/API ID

以下 ID 均已通过本地 `rg` 精确核验：

- 目标清单 ID：`vue.core.learn.basics.computed-properties`。已在
  `src/content/catalog/manifests/vue-core-track.ts` 中标记为 `available`。
- 前置课程：`vue.core.learn.basics.reactive-state`。这是本课唯一建议 prerequisite。
- 主要 API 参考：`vue.core.reference.reactivity-watchers.computed`。
- 源状态 API：`vue.core.reference.reactivity.ref`、`vue.core.reference.reactivity.reactive`。
- 可回链课程：`vue.core.learn.basics.conditional-list-rendering`。现有课程已经用 computed 过滤
  列表，可作为学完本课后的复习入口。
- 后续参考：`vue.core.reference.reactivity-watchers.watch`、
  `vue.core.reference.reactivity-watchers.watch-effect`。只用于“副作用请看下一课”的关联，
  本课不展开其 API。

不建议把 `readonly()` 参考作为本课主要关联：getter-only computed 的只读赋值入口与
`readonly()` 创建深层只读代理不是同一个概念，过早并列容易加强“computed 返回对象会自动
深只读”的误解。

## 固定来源清单

### 官方文档

- [Vue 计算属性指南](https://cn.vuejs.org/guide/essentials/computed.html)
- [Vue 响应式核心 API：computed](https://cn.vuejs.org/api/reactivity-core.html#computed)
- [Vue TypeScript：为 computed 标注类型](https://cn.vuejs.org/guide/typescript/composition-api.html#typing-computed)
- [Vue 响应式基础：模板中的 ref 解包](https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html#ref-unwrapping-in-templates)
- [Vue 深入响应式：计算属性调试](https://cn.vuejs.org/guide/extras/reactivity-in-depth.html#computed-debugging)
- [Vue 性能优化：计算属性稳定性](https://cn.vuejs.org/guide/best-practices/performance.html#computed-stability)

### vuejs/core v3.5.40

- [`computed.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/computed.ts)
- [`effect.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effect.ts)
- [`dep.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/dep.ts)
- [`general.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/shared/src/general.ts)
- [`computed.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/computed.spec.ts)

## 结论

这篇基础课最重要的教学模型应是：源状态负责保存事实，computed 负责声明同步派生值，watcher
负责因变化执行副作用。`v3.5.40` 的实现支持一个可直接验证的三段式心智模型：依赖变化先标脏，
读取时按依赖版本决定是否执行 getter，结果真正变化时才推进 computed 自己的版本。只要课程
围绕这一模型安排示例，就能同时讲清缓存、惰性、动态依赖、只读边界，并自然把副作用留给
下一课。
