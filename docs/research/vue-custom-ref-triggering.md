# Vue CustomRef 与触发控制调研

> 查证日期：2026-08-02  
> 适用版本：Vue 3.5.40  
> 资料范围：Vue 中文官方“响应式 API：进阶”、`vuejs/docs` 官方 Markdown、
> `vuejs/core@v3.5.40` 的 `ref.ts`、依赖追踪与 effect scope 源码，以及同标签官方测试。
> 外部资料仅通过 Tavily 定位与提取；博客、问答、第三方库、issue 推测、`main` 分支实现和
> 非固定版本源码不作为事实依据。

## 结论先行

1. `customRef()` 不是一种新的依赖系统。Vue 3.5.40 为每个 custom ref 创建一个 `Dep`，再把这个
   `Dep` 绑定后的 `track` 与 `trigger` 交给工厂；工厂决定何时收集依赖、何时通知依赖。
2. custom ref 的 `.value` getter 只调用工厂返回的 `get()`，setter 只调用 `set()`。普通
   `ref()` 内置的原始值比较、深层响应式转换和自动触发，不能被默认套用到 `customRef()`。
3. 最易验证的触发边界是：setter 可以先改变闭包中的值但不调用 `trigger()`，此时已经订阅的
   effect 保持旧结果；显式调用 `trigger()` 后，effect 才重新读取 getter。官方测试直接覆盖了
   这条行为。
4. 官方去抖示例把“提交 backing value”和 `trigger()` 一起推迟到最后一次 set 后的定时器中。
   因而延时结束前读取 `.value` 仍得到上一次已提交值，而不是最近一次待提交输入。
5. getter 每次返回新对象会制造与语义更新无关的身份变化。父组件因其他状态重渲染时会重新读取
   custom ref，新对象作为 prop 传给子组件后会被判断为变化；但父组件中依赖 custom ref 的副作用
   并未由 setter / trigger 驱动，父子更新依据因此可能失去同步。
6. `effectScope()` 捕获的是作用域中创建的响应式副作用，`customRef` 本身不是副作用。停止 scope
   不会自动“销毁 ref”或取消 ref 闭包里的定时器；定时器必须通过 `onScopeDispose()` 显式登记清理。
7. `onScopeDispose()` 只会把回调登记到当前活跃 scope。无活跃 scope 时，默认开发环境警告；
   3.5+ 的第二参数 `true` 只消除警告，不会凭空创建 owner，也不会让清理回调未来自动执行。
8. 非 detached 的子 scope 由活跃父 scope 持有，父 scope 停止时会递归停止；`effectScope(true)`
   脱离父 scope，必须由创建方保留句柄并自行 `stop()`。

依据：[Vue 中文官方 `customRef()`](https://cn.vuejs.org/api/reactivity-advanced.html#customref)、
[`ref.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts)、
[`ref.spec.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/ref.spec.ts)、
[`effectScope.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effectScope.ts)。

## 一手来源

- [Vue 中文官方“响应式 API：进阶”](https://cn.vuejs.org/api/reactivity-advanced.html)：
  `customRef()` 类型与契约、官方去抖示例、新对象 getter 警告，以及
  `effectScope()` / `getCurrentScope()` / `onScopeDispose()` 的公开语义。
- [`vuejs/docs` 的 `reactivity-advanced.md`](https://github.com/vuejs/docs/blob/main/src/api/reactivity-advanced.md)：
  官网英文内容的官方写作源，用于交叉核对 custom ref 身份陷阱与 scope 文案。该链接随
  `main` 演进，版本实现仍以以下 `v3.5.40` 固定标签为准。
- [`ref.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts)：
  `CustomRefFactory<T, S>`、`CustomRefImpl`、每实例 `Dep`、getter / setter 转发和
  `customRef()` 构造入口。
- [`ref.spec.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/ref.spec.ts)：
  setter 后暂不更新、手工 trigger 后更新，以及 custom ref 读取值缓存的官方回归测试。
- [`dep.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/dep.ts)：
  `Dep.track()` 只在存在活跃 subscriber 且允许追踪时建立链接的实现依据。
- [`effect.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effect.ts)：
  `ReactiveEffect` 在活跃 scope 中登记到 `scope.effects` 的实现依据。
- [`effectScope.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effectScope.ts)：
  scope 的父子持有、`run()`、`stop()`、cleanups 和 `onScopeDispose()` 的实现。
- [`effectScope.spec.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/effectScope.spec.ts)：
  cleanup 在 stop 时执行、scope 外调用警告、停止子 scope 等官方回归行为。

## 1. `customRef` factory 的最小契约

公开类型在 3.5.40 源码中允许 getter 与 setter 使用不同类型参数：

```ts
type CustomRefFactory<T, S = T> = (
  track: () => void,
  trigger: () => void,
) => {
  get: () => T
  set: (value: S) => void
}

function customRef<T, S = T>(factory: CustomRefFactory<T, S>): Ref<T, S>
```

中文官网当前展示的是单一 `T` 的简化签名；固定标签源码已经是 `<T, S = T>`。课程若只讲普通
同类型读写，使用 `customRef<T>()` 即可，不需要把双类型读写扩展成主线。

factory 在创建 custom ref 时执行，并接收两个已绑定到该实例 `Dep` 的函数：

- `track()`：尝试把当前活跃 subscriber 与这个 custom ref 的 `Dep` 建立依赖链接。
- `trigger()`：通知这个 `Dep` 上已经登记的 subscribers。
- `get()`：定义每次读取 `.value` 时返回什么。
- `set(value)`：定义每次写入 `.value` 时做什么。

官方建议通常在 `get()` 中调用 `track()`，在 `set()` 中调用 `trigger()`；但 API 刻意允许
调用方改变时机或完全不调用。这个自由度就是 custom ref 的能力，也意味着调用方承担完整一致性责任。

来源：[Vue 中文官方 `customRef()` 详情](https://cn.vuejs.org/api/reactivity-advanced.html#customref)、
[`CustomRefFactory` 与 `CustomRefImpl` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts)。

### `track()` 的准确含义

`track()` 不是“把值变成响应式”，也不是每次普通读取都会永久新增订阅。`Dep.track()` 在没有
活跃 subscriber、当前关闭追踪，或 subscriber 就是该 dep 对应 computed 时会直接返回。换言之：

- 模板渲染、computed、watchEffect 或底层 effect 执行时读取并调用 `track()`，才可能形成订阅。
- 在普通事件函数或控制台中读取 `.value`，仍会得到 getter 返回值，但没有活跃副作用时不会因此
  新建响应式订阅。
- 若 getter 忘记调用 `track()`，后续 `trigger()` 也无法通知“这次读取本应建立但从未建立”的依赖。

来源：[`Dep.track()` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/dep.ts)。

### `trigger()` 的准确含义

`trigger()` 表达“这个 dep 需要失效并通知 subscribers”，不是普通 ref setter 的同义词。
`CustomRefImpl.set value` 没有 `hasChanged()` 比较，也没有自动 trigger：

- setter 可以立刻写值、延迟写值、拒绝写值或规范化输入。
- setter 可以选择不 trigger、延迟 trigger，或在外部事件到达时 trigger。
- 若实现对相同语义值也无条件 trigger，custom ref 这一层仍会发出通知；更上层的 scheduler 去重、
  watcher 新旧值比较等机制可能继续过滤，因此课程不应承诺“每次 trigger 等于每个回调恰好执行一次”。

来源：[`CustomRefImpl` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts)、
[`Dep.trigger()` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/dep.ts)。

## 2. 官方测试冻结的触发屏障

`ref.spec.ts` 的 `customRef` 测试建立了以下顺序：

1. getter 调用 `track()` 并返回闭包值 `1`。
2. effect 首次执行，读取 custom ref，结果为 `1`。
3. 写入 `custom.value = 2`；setter 只更新闭包值并保存 `trigger` 函数。
4. 测试断言 effect 的派生结果仍为 `1`，注释明确写着“should not trigger yet”。
5. 测试手工调用保存的 `trigger()`。
6. effect 重新读取 getter，派生结果才变为 `2`。

这条测试同时证明两点：custom ref 会被 `isRef()` 识别；“backing value 已改变”与“依赖已收到
更新通知”是两个可以分开的阶段。

测试不能被扩大解释成“trigger 永远同步刷新所有 Vue 组件”。该用例使用底层 `effect()`；组件
渲染和 watcher 仍受各自 scheduler、flush timing 与值比较规则约束。

来源：[`ref.spec.ts` 的 `customRef` 测试 v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/ref.spec.ts)。

## 3. getter 返回新对象的身份陷阱

### 触发路径

危险实现不是“custom ref 不能保存对象”，而是 getter 每次读取都创建一个新对象：

```ts
const unstable = customRef((track, trigger) => {
  let value = 'draft'

  return {
    /** 读取时创建新对象，导致每次引用身份都不同。 */
    get() {
      track()
      return { value }
    },
    /** 更新内部文本并通知依赖。 */
    set(nextValue: { value: string }) {
      value = nextValue.value
      trigger()
    },
  }
})
```

即使 `value` 没变，两次 `unstable.value` 也不是同一个对象。官方文档特别指出父子 prop 场景：

1. 父组件因另一个响应式状态变化而重渲染。
2. 渲染重新读取 custom ref，getter 生成新对象。
3. 新对象与上次传给子组件的 prop 引用不同，子组件会把 prop 视为变化。
4. 这次过程中 custom ref 的 setter 没有被调用，其 dep 也没有被 trigger。
5. 因此子组件由 prop 身份变化进入更新，而父组件中只依赖该 custom ref 通知的副作用没有对应触发。

这不是深层响应性问题，而是 getter 制造了不稳定身份。稳定做法是让 backing value 本身保存对象，并在
语义更新时替换它；若返回派生对象，则缓存结果并只在输入真正改变时替换缓存。

来源：[Vue 中文官方“谨慎使用”](https://cn.vuejs.org/api/reactivity-advanced.html#customref)、
[`vuejs/docs` 对应警告](https://github.com/vuejs/docs/blob/main/src/api/reactivity-advanced.md#customref)。

### 课程应冻结的辨析

| 写法 | 身份行为 | 课程判断 |
| --- | --- | --- |
| getter 返回 primitive | 按 primitive 值比较 | 最适合入门示例 |
| getter 返回稳定闭包对象 | 多次读取保持同一引用，直到显式替换 | 可用 |
| getter 每次返回对象字面量 | 每次读取产生新引用 | 作为反例 |
| getter 每次 `map()` / `filter()` | 每次读取产生新数组 | 与对象字面量同类风险 |
| computed 返回派生对象 | computed 有缓存与依赖失效语义 | 不能直接等同于无缓存 custom ref getter |

## 4. 去抖 ref 的提交与通知

官方示例的核心顺序是：

1. getter 调用 `track()` 并返回当前已提交 `value`。
2. 每次 set 先 `clearTimeout(timeout)`，取消上一笔待提交任务。
3. 新定时器到期后才把 `newValue` 写入 `value`。
4. 写入后调用 `trigger()`，让 subscribers 读取新的已提交值。

所以它是“延迟提交 + 延迟通知”，不是“立即提交 + 延迟通知”。连续写入 `A`、`B`、`C` 时，
前两次定时器被取消，最后只有 `C` 在 delay 到期后成为 backing value 并触发通知。

来源：[Vue 中文官方去抖 ref 示例](https://cn.vuejs.org/api/reactivity-advanced.html#customref)、
[`vuejs/docs` 官方示例](https://github.com/vuejs/docs/blob/main/src/api/reactivity-advanced.md#customref)。

### 课程可采用的 scope 清理版本

以下代码是在官方去抖示例上增加明确的 timer owner，不是官网原样代码：

```ts
import { customRef, onScopeDispose, type Ref } from 'vue'

/** 创建一个在当前 effect scope 停止时取消待提交任务的去抖 ref。 */
export function useDebouncedRef<T>(initialValue: T, delay = 200): Ref<T> {
  let value = initialValue
  let timeout: ReturnType<typeof setTimeout> | undefined

  const debounced = customRef<T>((track, trigger) => ({
    /** 收集当前活跃副作用对该 ref 的依赖。 */
    get() {
      track()
      return value
    },
    /** 取消上一笔任务，并在最后一次延时到期后提交和通知。 */
    set(newValue) {
      if (timeout !== undefined) {
        clearTimeout(timeout)
      }

      timeout = setTimeout(() => {
        value = newValue
        timeout = undefined
        trigger()
      }, delay)
    },
  }))

  onScopeDispose(() => {
    if (timeout !== undefined) {
      clearTimeout(timeout)
      timeout = undefined
    }
  })

  return debounced
}
```

该版本冻结的 ownership contract 是：函数必须在组件 `setup()` / `<script setup>` 或显式
`scope.run()` 的活跃 scope 中同步调用。scope 停止时，尚未提交的输入被取消，不再写入 backing
value，也不再 trigger。

来源：[Vue 中文官方 `onScopeDispose()`](https://cn.vuejs.org/api/reactivity-advanced.html#onscopedispose)、
[`onScopeDispose()` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effectScope.ts)。

## 5. `effectScope` 与定时器清理边界

### scope 捕获 effect，不捕获任意资源

官方文档说 effect scope 捕获其中创建的 computed 和 watchers；源码中 `ReactiveEffect` 构造时会把
自身加入活跃 scope 的 `effects`。相比之下，`CustomRefImpl` 构造只创建 `Dep` 并保存
`get` / `set`，没有登记到 `scope.effects`。

因此以下结论必须分开：

- scope 中读取 custom ref 的 watcher / computed / effect 会被 scope 持有并在 stop 时停止。
- custom ref 对象本身仍然是可读写对象，不会因 owner scope stop 自动变成 inactive。
- custom ref 闭包中的 `setTimeout`、事件监听或外部订阅不是 ReactiveEffect，不会被自动发现。
- `onScopeDispose(clearTimer)` 才把定时器清理明确放进 `scope.cleanups`。

来源：[Vue 中文官方 `effectScope()`](https://cn.vuejs.org/api/reactivity-advanced.html#effectscope)、
[`ReactiveEffect` 登记 v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effect.ts)、
[`CustomRefImpl` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts)。

### `stop()` 的范围与顺序

Vue 3.5.40 的 `EffectScope.stop()` 在 scope 尚活跃时依次：

1. 把 scope 标记为 inactive。
2. 停止并清空直接持有的 effects。
3. 执行并清空 `onScopeDispose()` 登记的 cleanups。
4. 递归停止并清空非 detached 子 scopes。
5. 对普通子 scope，从父 scope 的 children 中解除引用。

官方测试验证多个 `onScopeDispose()` 回调在 `scope.stop()` 前不执行，stop 后都执行；也验证父
scope 停止可以安全停止子 scope。

这意味着 timer cleanup 会在 scope stop 流程中执行，但不能推出“stop 后 ref 永远不会再启动定时器”。
如果外部仍持有 ref 并在 stop 后再次赋值，custom setter 仍能创建新 timer。课程应把“停止后不再使用
该 scoped ref”作为所有权约束；若业务需要独立生命周期，应返回显式 `stop()` / `cancel()`，
而不是假设 effect scope 会封印对象。

来源：[`EffectScope.stop()` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effectScope.ts)、
[`effectScope.spec.ts` cleanup 测试 v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/effectScope.spec.ts)。

### 无活跃 scope

`onScopeDispose(fn)` 的实现只在 `activeEffectScope` 存在时执行
`activeEffectScope.cleanups.push(fn)`。否则开发环境发出警告。

`onScopeDispose(fn, true)` 的 `true` 名为 `failSilently`，只跳过该警告分支。回调仍未登记，
所以不能把它解释为“允许在 scope 外也能自动清理”。可复用函数有三种诚实契约：

1. 要求必须在活跃 scope 中调用，并保留默认警告。
2. 用 `getCurrentScope()` 检查；有 scope 时登记，没有时由公开的 `cancel()` 交给调用方。
3. 完全不依赖 scope，始终返回显式 disposer。

只传 `true` 又不提供其他 disposer，会静默丢失 timer owner，不适合作为课程推荐做法。

来源：[Vue 中文官方 `getCurrentScope()` 与 `onScopeDispose()`](https://cn.vuejs.org/api/reactivity-advanced.html#getcurrentscope)、
[`onScopeDispose()` 源码 v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effectScope.ts)、
[`effectScope.spec.ts` scope 外警告测试](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/effectScope.spec.ts)。

### 嵌套与 detached scope

在活跃 scope 内创建 `effectScope()` 时，构造器会把它登记为父 scope 的 child；父 stop 会递归
stop 它。`effectScope(true)` 跳过该登记，适合生命周期明确独立于当前父级的场景，但创建方必须
保留句柄并负责 stop。

课程主线不需要 detached scope。若把它作为进阶辨析，应只强调：`detached: true` 改变 owner，
不是“更强的清理”；忘记 stop 反而会让 effects 与 cleanups 超出父级生命周期。

来源：[`EffectScope` 构造与 stop v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effectScope.ts)、
[`effectScope.spec.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/effectScope.spec.ts)。

## 6. 八个可用于课程的准确源码推导

### 推导 1：每个 custom ref 有自己的依赖容器

`CustomRefImpl` 构造器执行 `new Dep()`，再把该 dep 绑定后的 track / trigger 传给 factory。
因此两个独立创建的 custom refs 不会因为使用相同 factory 而自动共享订阅；共享只可能来自 factory
闭包或外部状态本身。

来源：[`CustomRefImpl.constructor` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts)。

### 推导 2：factory 创建策略，getter 执行读取策略

factory 在 `new CustomRefImpl(factory)` 的构造期执行一次；`get()` 则在每次读取 `.value` 时执行。
所以资源初始化若写在 factory 中是“每个 ref 一次”，写在 getter 中则可能被模板重渲染反复执行。
getter 应保持可重复读取，不应在其中无条件启动 timer 或订阅外部资源。

来源：[`customRef()` 与 `CustomRefImpl` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts)。

### 推导 3：custom setter 不继承普通 ref 的变更判断

普通 `RefImpl.set value` 保存 raw value、处理 shallow / readonly 输入，并用 `hasChanged()` 决定
是否触发；`CustomRefImpl.set value` 只有 `this._set(newVal)`。因此去重、规范化和触发策略都属于
factory 的 setter，而不是 Vue 额外补上的默认行为。

来源：[`RefImpl` 与 `CustomRefImpl` 对照 v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts)。

### 推导 4：读取缓存不等于 computed 缓存

`CustomRefImpl.get value` 会把自定义 getter 的结果写进内部 `_value`，官方测试也检查读取后的
`_value`。但下一次读取仍会再次调用 `_get()`；源码没有 dirty flag 或跳过 getter 的缓存分支。
课程不能因为存在 `_value` 字段就把 custom ref 称为 computed 式缓存。

来源：[`CustomRefImpl.get value` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts)、
[`ref.spec.ts` value cache 测试](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/ref.spec.ts)。

### 推导 5：更新 backing value 与发布更新是两项操作

官方测试在 setter 内先改变闭包值，却把 trigger 暂存到外部；effect 仍保留旧派生结果。调用 trigger
后才重新读取。因此 custom ref 可以实现 commit、debounce 或外部事件桥接，但任何延迟发布都必须有
明确的最终 trigger 路径。

来源：[`ref.spec.ts` customRef 测试 v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/ref.spec.ts)。

### 推导 6：无活跃 subscriber 的读取不会形成订阅

factory 提供的 track 最终调用 `Dep.track()`；该方法在没有 `activeSub` 或不允许追踪时返回。
因此“读取一定订阅”是错误表述，准确表述是“在响应式副作用执行期间读取，并由 getter 调用 track，
才建立该副作用与 ref 的依赖关系”。

来源：[`Dep.track()` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/dep.ts)。

### 推导 7：custom ref 不会被 scope 自动 dispose

`ReactiveEffect` 构造时登记到活跃 `scope.effects`；`CustomRefImpl` 没有对应登记。scope stop
停止的是 effects、cleanups 和子 scopes，不是任意在 `run()` 中创建的 JavaScript 对象。因此 timer
必须用 `onScopeDispose()` 进入 cleanups。

来源：[`effect.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effect.ts)、
[`ref.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts)、
[`effectScope.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effectScope.ts)。

### 推导 8：静默参数改变诊断，不改变所有权

`onScopeDispose(fn, failSilently)` 在活跃 scope 下无条件登记；无 scope 时，`failSilently` 只决定
是否警告。两条路径中都不存在“暂存回调，等未来 scope 出现再登记”的逻辑。因此 `true` 不是延迟
绑定，也不是自动兜底。

来源：[`onScopeDispose()` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effectScope.ts)。

## 7. 课程内容建议

### 建议主线

1. 用普通 ref 对照说明默认 setter 会自动发布更新。
2. 用最小 custom ref 展示 track 与 trigger 两个控制点。
3. 复现官方测试的“set 后未触发、trigger 后更新”时间线。
4. 实现 primitive 字符串去抖 ref，观察待提交值与已提交值。
5. 加入 `onScopeDispose()`，把 pending timer 与组件 / scope 生命周期绑定。
6. 用 getter 新建对象作为反例，解释无关父级重渲染为何造成子 prop 身份变化。
7. 最后辨析 scope stop 不会让 ref 对象本身失效，以及 scope 外调用的 disposer 责任。

### 最小 Demo 状态

| 状态 | 用途 |
| --- | --- |
| 原始输入框 DOM 值 | 展示用户正在输入的值 |
| custom ref 已提交值 | 展示 delay 到期后发布的值 |
| effect / watchEffect 运行次数 | 证明 trigger 前后依赖执行边界 |
| pending / idle | 展示是否存在待提交 timer |
| unrelated parent count | 触发无关父组件重渲染，复现对象身份陷阱 |
| child prop update count | 观察新对象 prop 造成的子级更新 |

Demo 不应使用 production 网络请求、复杂 scheduler 模拟或第三方 debounce 库。单个 timer、一个
primitive 正例和一个对象身份反例足以覆盖核心行为。

### 建议练习

1. 补全 getter 中的 `track()`，让 effect 能订阅。
2. 把立即 trigger 改为 delay 到期后 trigger，并验证连续输入只提交最后一次。
3. 在 scope stop 前安排 pending timer，stop 后确认它没有提交。
4. 把每次新建对象的 getter 改为稳定 backing object，确认无关父级重渲染不再制造 prop 身份变化。

验证重点只需覆盖四条关键路径，不需要为所有延时组合写大量测试。

## 8. 高质量易错点

| 易错说法或写法 | 准确边界 |
| --- | --- |
| “customRef 会自动追踪 getter” | 只有 getter 主动调用 factory 提供的 `track()` 才追踪 |
| “setter 改了值就会更新” | setter 还必须在正确时机调用 `trigger()` |
| “trigger 就是赋值” | trigger 只通知 dep；backing value 如何变化由 setter / 外部逻辑决定 |
| “每次 trigger 每个 watcher 都执行一次” | scheduler 去重与 watcher 值比较仍可能过滤 |
| “getter 返回等价对象没关系” | 新对象引用会在 prop 比较中表现为变化 |
| “custom ref 内部 `_value` 会缓存 getter” | 它保存最近读取结果，但每次 `.value` 仍调用自定义 getter |
| “scope.stop 会销毁其中创建的 ref” | 它停止 effects、执行 cleanups、停止子 scopes；ref 对象仍可被外部持有 |
| “timer 在 setup 中创建就会自动清理” | 普通 timer 不是 ReactiveEffect，必须显式 clear |
| “`onScopeDispose(fn, true)` 可以在 scope 外清理” | `true` 只消除无 scope 警告，回调不会登记 |
| “detached scope 更安全” | detached 改为调用方独立持有，忘记 stop 会越过父生命周期 |

## 9. 本轮冻结边界

本调研只覆盖：

- `customRef` factory、track / trigger、getter / setter 的公开契约。
- getter 新对象在父子 prop 传递中的身份陷阱。
- 官方去抖 ref 的提交与触发时间线。
- `effectScope()`、`onScopeDispose()` 与 timer cleanup 的 owner 边界。
- 可直接转成课程讲解、Demo 和少量验证的源码推导。

以下内容不应从本文扩展：

- 不把 custom ref 讲成完整 scheduler、renderer 或 watcher flush 课程。
- 不把 `triggerRef(shallowRef)` 与 custom factory 的 `trigger()` 混为同一个公开 API。
- 不引入第三方 debounce 库、VueUse 实现或社区 issue 作为课程权威依据。
- 不把官网浮动文档描述成固定标签源码；实现结论以 `vuejs/core@v3.5.40` 为准。
- 不承诺 scope stop 后外部持有的 ref 自动失效。
- 不把 getter 新对象问题泛化成“customRef 不能返回对象”。
