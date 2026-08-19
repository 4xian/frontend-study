---
id: react.core.learn.intermediate.use-ref
type: lesson
title: useRef
summary: 使用 useRef 在多次 render 之间保存不参与页面输出的可变值。
domain: frontend
technology: react
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 40
prerequisites:
  - react.core.learn.intermediate.state-sharing-boundary
related:
  - react.core.learn.basics.use-state
  - react.core.learn.basics.render-commit-and-state-snapshot
  - react.core.learn.intermediate.state-structure
tags:
  - React
  - useRef
  - Ref
  - 可变值
  - render
appliesTo: React 19.2 官方文档与 React 19
verifiedAt: 2026-08-16
objectives:
  - 能说明 useRef 返回对象、current 属性和 initialValue 的首次初始化合同。
  - 能判断一个值应使用普通局部变量、State 还是 Ref。
  - 能在事件处理函数中读写 current，并解释为什么写入不会触发 render。
  - 能避免在 render 期间读写 current 或让 JSX 依赖 Ref 工作值。
  - 能说明 Ref 只在同一挂载实例中保留，不等同于持久化或跨实例共享。
recap:
  - Ref 适合需要跨 render 保存、但不参与页面输出的可变工作值。
  - useRef 首次用 initialValue 填充 current，后续 render 返回同一个对象并忽略新初始参数。
  - 修改 current 立即改变普通对象，但不会请求 React 重新渲染。
  - render 需要读取的值应进入 State 或由 Props 和 State 派生。
  - 除可预测的一次性初始化外，只在事件等非 render 阶段读写 current。
  - useRef 仍须在函数组件或自定义 Hook 顶层调用。
sources:
  - title: React Versions
    url: https://react.dev/versions
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 确认 react.dev 当前文档版本口径
  - title: useRef
    url: https://react.dev/reference/react/useRef
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - useRef 的参数、返回对象与同一对象合同
      - current 写入不触发 render
      - render 读写限制、Strict Mode 与延迟初始化例外
  - title: Referencing Values with Refs
    url: https://react.dev/learn/referencing-values-with-refs
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Ref 与 State、普通局部变量的选择边界
      - Ref 保存不参与渲染的信息
  - title: Rules of Hooks
    url: https://react.dev/reference/rules/rules-of-hooks
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - useRef 必须在组件或自定义 Hook 顶层调用
  - title: Components and Hooks must be pure
    url: https://react.dev/reference/rules/components-and-hooks-must-be-pure
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - render 必须保持幂等且不产生副作用
  - title: eslint-plugin-react-hooks refs
    url: https://react.dev/reference/eslint-plugin-react-hooks/lints/refs
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - render 期间错误读写 Ref 的静态检查边界
---

# useRef

## 一、学习目标

- 能说清 `useRef(initialValue)` 返回什么，以及初始参数为什么不会随 Props 自动同步。
- 能根据“是否跨 render 保留”和“是否参与页面输出”在局部变量、State、Ref 之间做选择。
- 能在事件处理函数中读写 `ref.current`，并解释页面为什么不会因此自动更新。
- 能识别 JSX 读取 Ref、render 期间写 Ref、条件调用 Hook 等高风险写法。

## 二、为什么需要

组件有时需要记住一份工作值，但这份值不应该直接改变界面。例如，一组校验结果要先在多个事件之间
累计，用户点击“发布”后才显示；普通局部变量会在组件再次 render 时重新创建，而每次登记都更新 State
又会把尚未公开的工作过程放进渲染数据流。

`useRef` 提供了第三种边界：让同一组件实例在多次 render 之间取回一个可变对象，同时不因为修改这个
对象而请求新的 render。它解决的是“保留非视觉工作值”，不是“用另一种方式保存可见 State”。

## 三、核心概念

### 1. 一个稳定对象和一个可变属性

```tsx
const pendingCountRef = useRef(0)
```

首次 render 时，React 返回一个形如 `{ current: 0 }` 的普通对象。只要组件实例没有卸载，后续 render
都会得到同一个对象。代码可以在事件处理函数中读取或修改 `pendingCountRef.current`。

`initialValue` 只负责首次初始化。即使后续调用表达式变成 `useRef(nextValue)`，React 也不会用
`nextValue` 自动覆盖已经存在的 `current`。需要持续跟随 Props 的值不应依赖这个初始参数。

### 2. 修改 Ref 不会请求 render

```tsx
/** 记录一次不需要立即显示的工作。 */
function handleRecord() {
  pendingCountRef.current += 1
  console.log(pendingCountRef.current)
}
```

写入后，同一事件处理函数可以立即读到新值，因为 Ref 是普通 JavaScript 对象。React 不跟踪它的属性
变化，也不会为这次写入安排 render。若用户应该立即看到新值，就必须使用 State setter。

### 3. 用两个问题选择存储位置

```text
不需要跨 render                    -> 普通局部值
需要跨 render，并且变化参与页面输出 -> State
需要跨 render，但变化不参与页面输出 -> Ref
```

Ref 和 State 都能跨 render 保留，分界不在“会不会变化”，而在“变化是否应该重新计算 JSX”。计数、文本、
样式、属性、条件和列表只要要反映在页面中，就属于 State 或派生值。

### 4. render 期间保持 Ref 安静

组件应在相同 Props、State 和 Context 下返回相同 JSX。React 可能暂停、重启或重复一次 render，因此不要
在组件函数主体或 JSX 中按业务过程读写 `ref.current`。事件处理函数发生在 render 之外，是本课读写
Ref 的主要边界。

官方只允许完全可预测且仅在首次初始化时命中的分支在 render 中写入 Ref。这只是读写限制的受限例外，
不能推广为每次 render 都根据 Props 改写 Ref，也不在本课展开对象创建或性能优化。

## 四、用法与示例

### 1. 在事件之间保存工作值

```tsx
import { useRef, useState } from 'react'

/** 把内部工作值显式发布为页面可见结果。 */
export function BatchPublisher() {
  const pendingCountRef = useRef(0)
  const [publishedCount, setPublishedCount] = useState(0)

  /** 只登记内部工作，不请求 render。 */
  function handleRecord() {
    pendingCountRef.current += 1
  }

  /** 在事件中读取 Ref，再通过 State 发布结果。 */
  function handlePublish() {
    const nextCount = pendingCountRef.current
    pendingCountRef.current = 0
    setPublishedCount(nextCount)
  }

  return (
    <section>
      <p>最近发布：{publishedCount}</p>
      <button type="button" onClick={handleRecord}>
        登记
      </button>
      <button type="button" onClick={handlePublish}>
        发布
      </button>
    </section>
  )
}
```

`pendingCountRef.current` 没有进入 JSX。登记动作可以连续发生，发布动作才把 Ref 的当前快照复制到
State。页面显示的是受 React 跟踪的 `publishedCount`，不是一次偶然 render 时碰巧读到的工作值。

### 2. 不用 Ref 绕过 State

下面的状态决定按钮文案，必须使用 State：

```tsx
const [enabled, setEnabled] = useState(false)

return (
  <button type="button" onClick={() => setEnabled((current) => !current)}>
    {enabled ? '已启用' : '未启用'}
  </button>
)
```

若改成 `enabledRef.current`，点击只会改内存，不会让 React 重新计算文案。通过其他 State 强制刷新也不是
修复，因为它仍让页面输出依赖一个 React 不跟踪的可变量。

### 3. 理解实例与 Hook 边界

Ref 只在同一挂载实例的后续 render 中保留。组件卸载后再挂载会得到新的 Ref；两个组件实例也各有自己的
Ref。它不是浏览器存储、模块单例或跨页面持久化机制。

`useRef` 仍然是 Hook，必须在函数组件或自定义 Hook 顶层调用。事件处理函数只能操作已经创建的 Ref，
不能在点击时才调用 `useRef`。

开发环境的 Strict Mode 可能额外调用组件函数，并丢弃其中一轮创建的 Ref。纯组件不会因此出现可观察
差异；不要在 render 期间用 Ref 累加“渲染次数”。

## 五、用法示例或 Demo

下面的同源 Demo 把待发布校验数保存在 Ref，把公开结果保存在一个 State 快照中。登记后页面不变；即使
先触发一次独立 State 更新，Ref 工作值仍能在之后的发布事件中被读取。丢弃只清空内部工作值，重置则同
时恢复 Ref 与公开 State。

::::demo{id="react.core.learn.intermediate.use-ref.mutable-value-buffer-demo"}
::::

## 六、易错使用提示

:::pitfalls
### 错误：把需要显示的计数放进 Ref

**触发条件：** 用户点击后页面应立即显示新计数，却只执行 `countRef.current += 1`。

**原因：** 只看到 Ref 可以修改，没有判断该值是否参与页面输出。

**后果：** 内存值已经改变，页面仍显示旧结果，下一次偶然 render 还可能暴露不一致。

**错误示例：**

```tsx
const countRef = useRef(0)
return <button onClick={() => (countRef.current += 1)}>{countRef.current}</button>
```

**正确写法：**

```tsx
const [count, setCount] = useState(0)
return <button onClick={() => setCount((current) => current + 1)}>{count}</button>
```

**验证方式：** 点击一次后，页面中的计数应在 React 安排的新 render 中立即变为 `1`。

### 错误：在 JSX 中读取 `ref.current`

**触发条件：** 使用 `{pendingRef.current}`、`className={modeRef.current}` 或 Ref 控制条件分支。

**原因：** React 不知道 `current` 何时变化，无法为它建立一致的 render 快照。

**后果：** UI 可能过期，暂停、重复或延后 render 时行为难以预测。

**错误示例：**

```tsx
return <p>待发布：{pendingCountRef.current}</p>
```

**正确写法：**

```tsx
return <p>最近发布：{publishedCount}</p>
```

**验证方式：** 检查 JSX、class、style、条件和列表都不读取工作 Ref；所有可见结果只读取 State。

### 错误：每次 render 都改写 Ref

**触发条件：** 在组件函数主体递增 `renderCountRef.current`，或每轮把 Prop 写进 Ref。

**原因：** 把 render 当成必定只执行一次且必定提交的命令式过程。

**后果：** React 暂停、重启、放弃 render 或 Strict Mode 重复调用时，写入次数与提交结果不一致。

**错误示例：**

```tsx
renderCountRef.current += 1
```

**正确写法：**

```tsx
/** 在明确的用户事件中记录非视觉工作值。 */
function handleRecord() {
  pendingCountRef.current += 1
}
```

**验证方式：** 搜索组件函数主体，不应存在跟随业务过程或 Props 变化的 `current` 写入。

### 错误：期待 `initialValue` 随 Props 更新

**触发条件：** 使用 `useRef(limit)`，并期待后续 `limit` Prop 变化自动覆盖 `current`。

**原因：** 忽略 React 只采用首次 render 的初始参数。

**后果：** 后续事件继续读取旧限制，业务判断与当前 Prop 不一致。

**错误示例：**

```tsx
const limitRef = useRef(limit)
```

**正确写法：**

```tsx
/** 直接使用当前 Prop 完成本次事件判断。 */
function handleSubmit() {
  validateWithLimit(limit)
}
```

**验证方式：** 改变 `limit` 后触发事件，确认逻辑直接读取当前 Prop；只需首次快照时才使用 Ref。

### 错误：用普通局部变量保存跨事件值

**触发条件：** 在组件函数中声明 `let pendingCount = 0`，并期待经历 render 后继续保留。

**原因：** 每次执行组件函数都会重新创建局部绑定。

**后果：** 任意 State 或父组件更新后，尚未发布的工作值被重置。

**错误示例：**

```tsx
let pendingCount = 0
```

**正确写法：**

```tsx
const pendingCountRef = useRef(0)
```

**验证方式：** 先写入 Ref，再触发一次独立 State 更新，最后发布时仍应读到先前的工作值。

### 错误：在点击或条件分支里调用 `useRef`

**触发条件：** 点击后才调用 `useRef(0)`，或只在 `enabled` 为真时创建 Ref。

**原因：** 把 Hook 当成可以随时调用的普通工厂函数。

**后果：** React 无法稳定对应 Hook 状态，违反 Hooks 调用顺序。

**错误示例：**

```tsx
/** 错误地在事件中创建 Hook。 */
function handleClick() {
  const valueRef = useRef(0)
}
```

**正确写法：**

```tsx
const valueRef = useRef(0)

/** 事件只操作顶层已经创建的 Ref。 */
function handleClick() {
  valueRef.current += 1
}
```

**验证方式：** `useRef` 调用应位于函数组件或自定义 Hook 顶层，不在条件、循环或事件函数内。

### 错误：通过 Ref 变异仍参与渲染的对象

**触发条件：** Ref 保存与 State 或 Props 共用的对象，再直接修改其字段。

**原因：** 误解“Ref 可变”为“任何放进 Ref 的对象都可以安全变异”。

**后果：** 旧 render 快照被污染，界面不会按 State 更新路径重算，多个所有者还可能观察到同一引用。

**错误示例：**

```tsx
profileRef.current.name = 'Lin'
```

**正确写法：**

```tsx
setProfile((current) => ({ ...current, name: 'Lin' }))
```

**验证方式：** 任何参与 JSX 的对象都由 State setter 返回新对象；Ref 只保存独立的非视觉工作值。
:::

## 七、源码推导与适用场景

### 1. 官方事实

1. `useRef(initialValue)` 首次返回 `current` 为初始值的对象，后续 render 返回同一个对象并忽略新的初始
   参数。
2. `current` 是可变属性，写入立即生效；React 不跟踪该属性，因此不会触发 render。
3. React 官方要求不要在 render 期间读写 Ref；完全可预测的一次性初始化是受限例外。
4. 开发环境 Strict Mode 可能额外调用组件函数并丢弃其中一份 Ref，纯组件不受影响。
5. `useRef` 遵守 Rules of Hooks，只能在函数组件或自定义 Hook 顶层调用。

### 2. 课程推导

把“能否跨 render 保存”和“是否参与页面输出”拆成两个判断，就能避免两个相反错误：普通局部变量在新
render 中丢失工作值，Ref 又被滥用成不会通知 React 的可见 State。Ref 只承担内部工作记忆，公开结果仍
通过 State 进入 React 数据流。

### 3. 适用场景

- 多个用户事件之间需要保留，但只在显式发布时才进入页面的批次工作值。
- 与 JSX 无关、只属于当前挂载实例的命令式对象或标识。

### 4. 不适用场景

- 用户应该立即看到的文本、计数、样式、属性、条件或列表数据。
- 需要跨卸载持久化、跨组件实例共享或由 React 协调所有权的数据。
- DOM 节点、聚焦、滚动、测量、Callback Ref、ref as prop 或命令式组件接口。
- Effect、外部系统同步、请求、缓存、外部 Store 或性能优化。

## 八、练习

:::exercise
### 练习目标

**要求：** 实现一个“校验批次”组件。连续点击三次“登记”时只修改顶层创建的 Ref，页面上的已发布
批次和数量保持不变；再触发一次独立 State 更新，随后点击“发布”，页面显示本批次为 `3`。发布后清空
Ref，但不在 JSX 中读取它。增加“丢弃”和“重置”事件，并解释为什么待发布数、公开结果和普通临时计算
分别选择 Ref、State 与局部变量。

**验收：** render 期间没有业务性 `current` 读写；登记不会改变页面；独立 State render 不丢失 Ref；
发布后显示准确快照；丢弃后发布得到 `0`；没有使用 DOM Ref、Effect、请求或强制更新。
:::

## 九、本节小结

- Ref 保存同一挂载实例中需要跨 render 延续、但不参与页面输出的可变工作值。
- `initialValue` 只用于首次初始化；后续 render 返回同一个 Ref 对象。
- 修改 `current` 会立即改变对象，但不会请求 React 重新渲染。
- 参与 JSX 的值使用 State 或由当前 Props / State 派生，不要让页面依赖 Ref。
- 事件处理函数可以读写 Ref；render 期间只保留完全可预测的一次性初始化例外。
- `useRef` 仍遵守 Hooks 顶层调用规则，Ref 也不等于持久化或跨实例共享。

## 十、参考资料

- [React Versions](https://react.dev/versions) - React 19.2 官方文档版本口径。
- [`useRef`](https://react.dev/reference/react/useRef) - 参数、返回对象、更新边界与 render 读写限制。
- [Referencing Values with Refs](https://react.dev/learn/referencing-values-with-refs) - Ref、State 与局部变量的选择。
- [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks) - Hook 顶层调用规则。
- [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) - render 纯度边界。
- [eslint-plugin-react-hooks: refs](https://react.dev/reference/eslint-plugin-react-hooks/lints/refs) - render 期间 Ref 读写检查。
