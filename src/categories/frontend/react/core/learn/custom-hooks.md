---
id: react.core.learn.intermediate.custom-hooks
type: lesson
title: 自定义 Hook
summary: 抽取可复用的有状态逻辑，并用 useDebugValue 为复杂内部状态提供 DevTools 调试标签。
domain: frontend
technology: react
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 50
prerequisites:
  - react.core.learn.intermediate.effect-events
related:
  - react.core.learn.intermediate.lifting-state-up
  - react.core.learn.basics.use-state
  - react.core.learn.basics.rules-of-hooks
tags:
  - React
  - 自定义 Hook
  - useState
  - useDebugValue
  - React DevTools
  - 有状态逻辑
  - State 所有权
appliesTo: React 19.2
verifiedAt: 2026-08-17
objectives:
  - 能识别适合抽取为自定义 Hook 的有状态逻辑，并设计清楚的输入与返回值。
  - 能按 use 加大写字母的规则命名自定义 Hook，并在组件顶层按固定顺序调用。
  - 能解释同一个自定义 Hook 的每次调用为什么拥有独立 State。
  - 能区分复用有状态逻辑、共享同一份 State 和复用纯计算函数。
  - 能说明 useDebugValue 的参数、可选 formatter、无业务返回值和 DevTools 显示边界。
  - 能判断何时不应抽 Hook，也能避免把调试标签当成页面逻辑。
recap:
  - 自定义 Hook 是以 use 开头的函数，用来复用有状态逻辑，不是隐藏的全局 State。
  - 同一自定义 Hook 的每次调用都独立拥有自己的 State、更新函数和返回值。
  - 自定义 Hook 和内置 Hook 一样，只能在组件或自定义 Hook 的顶层按固定顺序调用。
  - 真正需要共享同一份 State 时，应提升 State 所有权并通过参数和事件传递。
  - useDebugValue(value, format?) 只为 React DevTools 提供调试值，不改变 Hook 的业务返回值。
  - formatter 只负责纯格式化；不需要调试收益的简单 Hook 不必添加标签。
sources:
  - title: Reusing Logic with Custom Hooks
    url: https://react.dev/learn/reusing-logic-with-custom-hooks
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 自定义 Hook 复用有状态逻辑而非 State 本身
      - Hook 命名、独立调用和抽取边界
  - title: Rules of Hooks
    url: https://react.dev/reference/rules/rules-of-hooks
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Hook 只能从组件或自定义 Hook 的顶层调用
      - 每次渲染必须保持相同的调用顺序
  - title: useDebugValue
    url: https://react.dev/reference/react/useDebugValue
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 调试值、可选 formatter、无返回值和延迟格式化
      - 调试值只用于 React DevTools
  - title: Sharing State Between Components
    url: https://react.dev/learn/sharing-state-between-components
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 共享同一份 State 时提升共同所有权
---

# 自定义 Hook

## 一、学习目标

- 把一套包含 State、更新函数和业务规则的逻辑抽成自定义 Hook。
- 为 Hook 设计明确的输入、返回值和调用者边界。
- 在同一组件顶层调用同一个 Hook 两次，并验证两份 State 互不影响。
- 遵守 Hook 命名、顶层调用和固定顺序规则。
- 使用 `useDebugValue` 为不易直接观察的内部状态提供 React DevTools 标签。
- 区分逻辑复用、State 共享和纯函数复用。

## 二、什么是自定义 Hook

### 1. 它封装的是有状态逻辑

自定义 Hook 是一个遵守 Hook 规则、可以组合其他 Hook 的 JavaScript 函数。它通常把以下内容放在一起：

- State 的声明；
- 根据 State 计算下一状态的更新函数；
- 围绕这份 State 的业务规则；
- 调用方需要使用的值和操作。

例如，计数器的“保存当前数值、增加一次、恢复初始值”就是一套有明确名称的有状态逻辑。把它抽成
`useCounter` 后，多个组件或同一组件的多个区域都可以复用这套规则。

### 2. 它不是全局 State

自定义 Hook 的函数定义只有一份，但每次调用都有自己的 Hook 调用位置和 State。下面两次调用使用同一个实现，
却创建了两份独立的计数状态：

```tsx
const leftCounter = useCounter(0)
const rightCounter = useCounter(0)
```

`leftCounter.increment()` 只更新左侧调用，右侧调用仍保持原值。抽取逻辑不会自动建立共享数据通道，也不会把
Hook 变成单例 store。

### 3. 每次渲染都会重新运行 Hook 代码

组件重新渲染时，自定义 Hook 函数也会按相同顺序再次执行。React 会把每个调用位置与之前对应的 State 关联起来，
所以 Hook 代码应写成对当前 Props、State 和参数的正常计算。不要把一次调用理解成只执行一次的构造器，也不要
把模块变量当作 Hook 的持久 State。

## 三、设计 Hook 的输入和输出

### 1. 先写出调用者要表达的意图

好的调用点应该能直接读出它要解决的问题：

```tsx
const search = useSearchInput('')
const leftCounter = useCounter(0)
```

调用者不需要知道内部用了几个 `useState`，也不需要重复实现清空、递增或格式化规则。Hook 名称和参数应表达
用途，而不是描述实现细节，例如 `useCounter` 比 `useTwoStates` 更容易理解。

### 2. 输入只保留必要配置

输入可以是初始值、选项或外部传入的标识。每个参数都应能对应一个清楚的行为：

```tsx
function useCounter(initialValue: number, step: number) {
  // State 和操作实现略
}

const counter = useCounter(0, 1)
```

不要为了“以后可能扩展”把整个组件对象、无关回调和多个重复配置都塞进 Hook。参数越多，Hook 与调用者的耦合
越强，越难看出真正的状态边界。

### 3. 返回调用者真正需要的合同

对象返回值适合多个有名称的值和操作：

```tsx
type Counter = Readonly<{
  count: number
  increment: () => void
  reset: () => void
}>
```

Hook 可以返回当前 State、事件函数、派生结果或状态标记。不要默认暴露底层 setter；如果调用者只能通过明确的
`increment` 和 `reset` 改变状态，业务规则更集中，也更容易替换内部实现。

### 4. 不要混淆纯函数与自定义 Hook

只接收参数并返回计算结果的函数不需要 Hook 前缀：

```tsx
function formatCount(count: number): string {
  return `${count} 次`
}
```

只有函数会调用 Hook，或设计上需要遵守 Hook 规则时，才使用 `useXxx` 命名。纯计算放在普通函数中可以在任意
合法代码位置调用，不应为了统一命名而包装成 Hook。

## 四、从组件中抽取有状态逻辑

### 1. 先找出完整的状态闭环

抽取前先在组件内确认一组完整逻辑：

1. 哪个 State 表示当前数据；
2. 哪些事件会更新它；
3. 更新时必须遵守哪些规则；
4. 调用者最终需要读取什么。

只搬走 `useState` 而把更新规则留在组件里，通常不会形成有意义的 Hook。抽取后，计数的更新和重置规则应由
`useCounter` 统一负责。

### 2. 让 Hook 保持一个清楚的职责

下面的 Hook 把一份计数 State 与两个操作放在同一个合同中：

```tsx
import { useState } from 'react'

type Counter = Readonly<{
  count: number
  increment: () => void
  reset: () => void
}>

/** 创建一份独立计数 State，并提供计数操作。 */
function useCounter(initialValue: number): Counter {
  const [count, setCount] = useState(initialValue)

  /** 根据最新 State 增加一次。 */
  function increment() {
    setCount((current) => current + 1)
  }

  /** 把当前调用恢复到自己的初始值。 */
  function reset() {
    setCount(initialValue)
  }

  return { count, increment, reset }
}
```

这里的 `initialValue` 属于本次 Hook 调用。`setCount` 使用函数式更新，避免操作函数依赖某一次渲染中的旧值；
`reset` 只恢复当前调用对应的初始值。

### 3. 保持抽取前后的行为一致

抽取不是改变业务规则的机会。可以按下面的顺序进行：

1. 先让组件内的原始逻辑可运行；
2. 将 State、更新函数和相关规则移动到 `useXxx`；
3. 让组件只读取 Hook 返回值并绑定事件；
4. 用相同的输入和操作比较抽取前后的结果。

如果抽取后调用者还必须访问内部临时变量，说明返回合同或职责边界还没有整理清楚。

### 4. 同一个 Hook 可以被多个调用方使用

一个组件可以调用不同的自定义 Hook，也可以多次调用同一个自定义 Hook。每个调用点都要有明确用途：

```tsx
const draftCounter = useCounter(0)
const retryCounter = useCounter(0)
```

两个变量使用同一套计数逻辑，但分别代表草稿计数和重试计数。变量名仍应说明业务含义，不能只写成难以区分的
`state1`、`state2`。

## 五、同一 Hook 的调用彼此独立

### 1. 复用逻辑不等于复用 State

下面的因果关系是自定义 Hook 的核心：

| 复用的内容 | 每次调用的内容 |
| --- | --- |
| Hook 函数定义 | 当前 State 值 |
| State 更新规则 | 更新函数和更新队列 |
| 返回值的结构 | 调用位置对应的状态结果 |

因此，左侧调用增加一次不会改写右侧调用。两份 State 初始值相同，只表示它们从相同输入开始，不表示它们指向同一
个容器。

### 2. 用两个调用位置观察独立性

```tsx
function CounterPanel() {
  const left = useCounter(0)
  const right = useCounter(0)

  return (
    <>
      <button type="button" onClick={left.increment}>
        左侧增加
      </button>
      <button type="button" onClick={right.increment}>
        右侧增加
      </button>
      <p>
        {left.count} / {right.count}
      </p>
    </>
  )
}
```

左侧增加两次、右侧增加一次、重置左侧后，结果应依次为 `2 / 0`、`2 / 1`、`0 / 1`。如果一个操作改变了两侧，
应先检查是否误用了共享变量、交叉绑定了返回值，或实际上只创建了一份 State。

### 3. 真正共享 State 时提升所有权

如果两个区域必须显示并修改同一个值，需求就不是“两个独立 Hook 调用”。应由共同父组件拥有唯一 State，再把值和
更新事件传给子组件：

```tsx
function CounterOwner() {
  const [count, setCount] = useState(0)

  /** 由共同所有者更新唯一计数。 */
  function increment() {
    setCount((current) => current + 1)
  }

  return <SharedCounter count={count} onIncrement={increment} />
}
```

自定义 Hook解决“如何复用一套逻辑”，State 提升解决“谁拥有这份数据”。用模块变量、隐式单例或两个 Hook 之间
互相写入来伪造共享，会绕过 React 的 State 数据流。

## 六、命名和调用规则

### 1. 使用 `use` 加大写字母命名

`useCounter`、`useSearchInput` 和 `useDebugLabel` 都符合命名形式。`use` 前缀让读者和静态检查工具知道：这个函数
可能调用其他 Hook，调用它时必须遵守 Hook 规则。

普通函数不要使用这个前缀：

```tsx
function parseCount(value: string): number {
  return Number(value)
}
```

如果函数当前不调用 Hook，也没有设计成 Hook，就保持普通命名。命名规则不能替代正确的调用位置，但能让边界清晰。

### 2. 只能在组件或自定义 Hook 顶层调用

下面两种调用路径合法：

```tsx
function CounterPanel() {
  const counter = useCounter(0)
  return <output>{counter.count}</output>
}

function useDoubleCounter(initialValue: number) {
  const first = useCounter(initialValue)
  const second = useCounter(initialValue)
  return { first, second }
}
```

不能从普通工具函数、类方法、事件处理器或任意非 React 调用路径调用 Hook。自定义 Hook 内部调用的内置 Hook 也
必须位于该自定义 Hook 的顶层。

### 3. 不要放进条件、循环或嵌套函数

```tsx
// 错误：enabled 改变后，Hook 调用次数会改变。
if (enabled) {
  const counter = useCounter(0)
}
```

应始终调用，再控制结果如何显示或是否启用业务行为：

```tsx
const counter = useCounter(0)
if (!enabled) return null
```

也不要在 `map`、`for`、点击回调、`try/catch/finally` 或另一个嵌套函数中调用。数组元素数量、条件分支和提前返回
都可能改变下一次渲染的调用顺序。

### 4. 把所有 Hook 调用放在提前返回之前

```tsx
function CounterPanel({ visible }: { visible: boolean }) {
  const counter = useCounter(0)

  if (!visible) return null
  return <output>{counter.count}</output>
}
```

早返回只影响 JSX，不应跳过后续某个 Hook。需要完全移除一棵子树时，可以让子组件自身负责那份 Hook 调用。

### 5. 每次渲染保持相同顺序

React 依靠 Hook 调用顺序把这次渲染的调用与之前的 State 对应。两个调用的顺序一旦交换，React 无法根据函数名
判断哪份 State 应该归给哪个调用。固定顺序是 State 身份的一部分，而不是格式偏好。

## 七、Hook 内部的响应行为

### 1. Hook 不是一次性初始化器

调用自定义 Hook 后，组件仍然按照普通 React 规则渲染。传给 Hook 的 Props 或参数发生变化时，Hook 会在新的
渲染中看到新值；Hook 返回的派生结果也会随 State 和输入重新计算。

不要把 Hook 写成只在第一次调用时读取参数的初始化器。若某个参数只用于设置初始 State，应在接口中明确这一
语义；若后续变化也应影响行为，就必须把它纳入 Hook 的正常数据流。

### 2. Hook 可以组合多个内置 Hook

一个有意义的自定义 Hook 可以组合 `useState`、`useReducer`、`useRef`、Effect 或其他自定义 Hook。组合不会改变
任何内置 Hook 的规则：

- 每个内置 Hook 仍在自定义 Hook 顶层调用；
- 需要清理的外部同步仍由 Hook 自己负责建立和清理；
- 调用者通过参数和返回合同与内部实现交互；
- 抽取不能用来隐藏真正需要遵守的依赖和数据流。

本例只用 `useState` 观察独立 State；加入其他内置 Hook 前，应先确认它确实属于同一个有状态职责。

### 3. 不把返回对象的身份当成默认承诺

Hook 每次渲染都可能重新创建返回对象和其中的函数。除非接口明确规定了稳定身份并采用相应实现，否则调用者应
关注返回值的语义，不应把对象引用相等当作业务判断条件。需要优化子组件重渲染时，另行评估组件边界和稳定化策略，
不要把自定义 Hook 的抽取本身当成性能优化。

## 八、`useDebugValue` 调试标签

### 1. API 只服务 React DevTools

`useDebugValue(value, format?)` 在自定义 Hook 顶层登记一个调试值。React DevTools 检查使用该 Hook 的组件时，
可以用这个值显示更容易理解的标签。它不会自动渲染到 DOM，也不会替代 Hook 的业务返回值。

```tsx
useDebugValue({ count, initialValue })
```

`value` 可以是数字、字符串、对象或其他能帮助定位内部状态的值。选择值时应优先保留能说明状态含义的字段，
而不是把整个组件对象传进去。

### 2. 第二个参数是可选 formatter

需要把内部结构转换为短标签时，可以传入格式化函数：

```tsx
type CounterDebugValue = Readonly<{
  name: string
  count: number
}>

/** 把计数状态格式化为 React DevTools 中的可读标签。 */
function formatCounterDebugValue(value: CounterDebugValue): string {
  return `${value.name}: ${value.count}`
}

useDebugValue({ name, count }, formatCounterDebugValue)
```

`useDebugValue` 本身没有可供业务使用的返回值。formatter 的返回结果也不是 Hook 的返回值，它只提供 DevTools
展示内容；Hook 仍然要显式返回 `count`、`increment` 等业务数据和操作。

### 3. formatter 的格式化工作可以延迟

React DevTools 检查组件时才需要执行 formatter。这样可以把可能昂贵的字符串化或结构转换放在第二个参数中，避免
每次普通渲染都执行这段格式化：

```tsx
/** 只负责格式化传入的快照，不写日志、不更新 State。 */
function formatStatus(value: Readonly<{ count: number }>): string {
  return `count=${value.count}`
}

useDebugValue({ count }, formatStatus)
```

延迟的是 formatter 函数体，不是 `value` 参数表达式。`{ count }` 这个值仍会在 Hook 调用所在的渲染中求值；不要
在第一个参数中提前完成本来想延迟的昂贵转换。

### 4. formatter 必须是纯函数

formatter 不应：

- 修改 State、Ref、模块变量或外部对象；
- 发请求、写日志、上报数据或触发通知；
- 根据格式化结果决定页面业务分支；
- 假设它在每次渲染都会执行；
- 返回依赖随机数或当前时间的不可重复文本。

它只接收调试值并返回用于显示的结果。即使没有打开 DevTools，页面功能也必须与添加标签前完全一致。

### 5. 只在调试收益明确时使用

简单的 `useState(0)` 已经容易从组件树理解时，添加标签可能只增加噪声。`useDebugValue` 更适合共享库或内部包含
多份状态、订阅和转换、直接查看不容易理解的 Hook。标签应短、稳定，能帮助定位问题。

## 九、何时应该抽取，何时保持简单

### 1. 适合抽取的信号

- 多个调用方需要相同的 State 操作规则；
- 逻辑有一个稳定、具体的业务名称；
- 组件因为状态协调细节变长而难以阅读；
- 抽取后可以用少量输入和返回值表达完整职责；
- 内部状态复杂，使用 `useDebugValue` 能改善 DevTools 观察。

### 2. 不必抽取的情况

- 只有一行简单 State 声明，调用者仍然是唯一使用者；
- 逻辑只是参数到结果的纯计算；
- Hook 需要接收大量组件细节才能工作；
- 为了消除一次重复而增加多个跳转层；
- 抽取后名称无法说明它解决的具体问题。

本身是 Hook 并不代表代码更高级，也不代表一定更快。抽取价值来自职责清晰和逻辑复用，不来自文件数量增加。

### 3. 用 State 所有权检查抽取结果

完成抽取后检查三个问题：

1. 这份 State 应该由谁拥有？
2. 同一逻辑是否需要多份独立 State？
3. 多个区域是否必须读写同一份 State？

前两个问题适合用自定义 Hook表达，第三个问题通常需要提升 State 或使用明确的共享状态边界。不要用自定义 Hook
的名字掩盖所有权没有确定的问题。

## 十、用法示例或 Demo

下面的 Demo 在同一组件顶层调用两次 `useCounter`。每次调用都使用同一套增加、重置和调试标签逻辑，页面结果则
分别读取两份 State。调试标签只在 React DevTools 中观察，不参与页面显示。

:::demo{id="react.core.learn.intermediate.custom-hooks.independent-counters-demo"}
:::

## 十一、易错使用提示

:::pitfalls
### 错误：把两个 Hook 调用当成共享 State

**触发条件：** 左侧和右侧都调用 `useCounter(0)`，却期待增加左侧会同时改变右侧。

**原因：** 自定义 Hook 共享的是逻辑实现，每次调用都拥有独立 State。

**后果：** 交互结果与错误的共享预期不一致。

**错误示例：**

```tsx
const left = useCounter(0)
const right = useCounter(0)
// 错误预期：left.increment() 会自动改变 right.count
```

**正确写法：**

```tsx
const left = useCounter(0)
const right = useCounter(0)
left.increment()
```

**验证方式：** 左侧从 `0` 变为 `1` 时，右侧仍为 `0`。

### 错误：用模块变量制造共享状态

**触发条件：** 把计数保存到组件外的 `let sharedCount`，再让两个 Hook 调用读取它。

**原因：** 模块变量不属于某个 React State，也没有按调用位置隔离。

**后果：** 多个调用互相污染，直接赋值也不会按 React State 规则触发渲染。

**错误示例：**

```tsx
let sharedCount = 0

function useCounter() {
  return { count: sharedCount }
}
```

**正确写法：**

```tsx
function useCounter(initialValue: number) {
  const [count, setCount] = useState(initialValue)
  return { count, setCount }
}
```

**验证方式：** 检查每次 Hook 调用的 State 是否由 Hook 内部声明，并执行两侧单独交互。

### 错误：在条件或循环中调用 Hook

**触发条件：** 只在 `enabled` 为真时调用 `useCounter`，或在列表 `map` 中调用它。

**原因：** 条件变化、列表长度变化或提前返回会改变渲染之间的调用顺序。

**后果：** Hook 调用和 State 的对应关系不可靠，违反 Rules of Hooks。

**错误示例：**

```tsx
if (enabled) {
  const counter = useCounter(0)
}
```

**正确写法：**

```tsx
const counter = useCounter(0)
if (!enabled) return null
```

**验证方式：** 每次渲染都在提前返回之前以相同顺序执行 Hook 调用。

### 错误：给不调用 Hook 的函数加 `use` 前缀

**触发条件：** 把字符串格式化函数命名为 `useFormatCount`。

**原因：** `use` 前缀表达了它可能调用 Hook 并受 Hook 规则约束，但这个函数只是普通计算。

**后果：** 调用者误以为它必须位于组件顶层，工具和读者也难以区分普通函数与 Hook。

**错误示例：**

```tsx
function useFormatCount(count: number) {
  return `${count} 次`
}
```

**正确写法：**

```tsx
function formatCount(count: number) {
  return `${count} 次`
}
```

**验证方式：** 只有实际调用 Hook 的函数使用 `useXxx` 命名。

### 错误：把 `useDebugValue` 当成页面输出

**触发条件：** 调用 `useDebugValue` 后期待页面出现调试文字，或把它的结果赋给变量。

**原因：** 这个 API 只向 React DevTools 提供标签，且没有可供业务使用的返回值。

**后果：** 页面没有预期文字，业务返回合同也被误写成 `undefined`。

**错误示例：**

```tsx
const label = useDebugValue(count)
return <p>{label}</p>
```

**正确写法：**

```tsx
useDebugValue(count)
return <p>{count}</p>
```

**验证方式：** 页面显示来自 Hook 的业务返回值；调试标签只在 React DevTools 中观察。

### 错误：在 formatter 中执行副作用

**触发条件：** 在调试格式化函数里写日志、更新 State、发送请求或修改外部对象。

**原因：** formatter 只负责把调试值转换成显示结果，调用时机由 DevTools 检查决定。

**后果：** 打开 DevTools 可能改变业务行为，关闭 DevTools 时又得到不同结果。

**错误示例：**

```tsx
function formatValue(value: number) {
  console.log(value)
  setSomeState(value)
  return String(value)
}
```

**正确写法：**

```tsx
function formatValue(value: number) {
  return `count=${value}`
}
```

**验证方式：** formatter 只读取参数并返回格式化结果，页面交互不依赖 DevTools 是否打开。

### 错误：把昂贵转换提前写进第一个参数

**触发条件：** 先把复杂对象序列化，再把序列化字符串传给 `useDebugValue`。

**原因：** 只有第二个参数 formatter 的函数体可以按 DevTools 检查延迟，第一个参数表达式仍会在渲染中求值。

**后果：** 普通渲染承担了不必要的格式化开销。

**错误示例：**

```tsx
useDebugValue(JSON.stringify(largeState))
```

**正确写法：**

```tsx
useDebugValue(largeState, (value) => JSON.stringify(value))
```

**验证方式：** 第一个参数只提供 formatter 所需的原始调试值。

### 错误：所有 Hook 都机械添加调试标签

**触发条件：** 每个只有一个数字 State 的 Hook 都增加 `useDebugValue`。

**原因：** 官方建议优先在内部结构复杂、直接检查不易的共享 Hook 中使用调试值。

**后果：** DevTools 信息增加但没有新的诊断价值，标签反而干扰定位。

**错误示例：**

```tsx
function useSimpleToggle() {
  const [enabled, setEnabled] = useState(false)
  useDebugValue(enabled)
  return [enabled, setEnabled] as const
}
```

**正确写法：**

```tsx
function useConnectionStatus() {
  // 当内部状态难以直接理解时，再提供简短的调试标签。
  useDebugValue('connected')
  return 'connected'
}
```

**验证方式：** 添加标签前先说明它能帮助开发者回答什么问题。
:::

## 十二、源码推导与适用场景

1. **官方事实：** 自定义 Hook 复用有状态逻辑，而不是 State 本身；每次调用彼此独立。
   **使用判断：** 把同一组 State 操作提取为 `useCounter`，再用两个显式调用验证独立性。
   **边界：** 要共享同一份 State 时，提升共同所有者，不用模块变量制造隐式共享。
2. **官方事实：** Hook 名以 `use` 加大写字母开头，并且只能在组件或自定义 Hook 顶层调用。
   **使用判断：** 把调用位置固定在提前返回之前，保持每次渲染的顺序一致。
   **边界：** 普通纯函数不需要 `use` 前缀，也不受 Hook 顶层调用限制。
3. **官方事实：** `useDebugValue` 接收调试值和可选 formatter，没有业务返回值，formatter 可延迟执行。
   **使用判断：** 只有复杂内部状态确实需要 DevTools 标签时才添加，并保持 formatter 纯。
   **边界：** 调试标签不参与 DOM、State 更新、日志、遥测或业务分支。

适合抽取自定义 Hook 的判断顺序是：先确认 State 所有权，再确认是否存在一套可命名的状态规则，最后设计最小
输入和返回合同。只重复静态计算时使用普通函数；需要同一份数据时提升 State；需要复杂调试观察时再考虑
`useDebugValue`。

## 十三、练习

:::exercise
### 练习一：观察两次调用的独立 State

**要求：** 在 Demo 中把左侧增加两次，再把右侧增加一次，最后只重置左侧。写出每一步的结果，并指出哪两行代码
分别创建了两个 Hook 调用位置。

**验收：** 结果依次为 `2 / 0`、`2 / 1`、`0 / 1`；任何一侧的增加或重置都不改变另一侧。
:::

:::exercise
### 练习二：判断逻辑复用还是 State 共享

**要求：** 设计一个“两个输入框各自维护草稿”的场景，再设计一个“两个视图显示同一选中项”的场景。前者使用
两次自定义 Hook 调用，后者说明 State 应该由哪个共同父组件拥有。

**验收：** 能说清“每个调用一份 State”和“多个组件一份 State”的区别，不用模块变量伪造共享。
:::

:::exercise
### 练习三：补充一个纯 formatter

**要求：** 为包含 `status`、`count` 和 `lastAction` 的 Hook 设计 `useDebugValue` 调用。formatter 只能接收值并
返回短字符串，不能写日志、更新 State 或返回业务数据。

**验收：** 调试值不出现在 DOM；Hook 的业务返回值不依赖 formatter 是否执行。
:::

:::exercise
### 练习四：找出违规调用

**要求：** 检查一个把 `useCounter` 放在 `if`、`map` 和点击回调中的组件，分别说明调用顺序如何变化，并把调用
移动到合法的顶层位置。

**验收：** 所有 Hook 调用在组件或自定义 Hook 顶层、提前返回之前，并且每次渲染顺序一致。
:::

## 十四、本节小结

- 自定义 Hook 用一个清楚的函数名和最小合同复用有状态逻辑。
- 同一个 Hook 的每次调用都有独立 State；复用实现不会自动共享数据。
- Hook 名使用 `useXxx`，调用必须位于组件或自定义 Hook 顶层，并保持固定顺序。
- 真正共享 State 时提升共同所有者，通过参数和事件形成单向数据流。
- 纯计算使用普通函数；没有明确用途时不要为重复包装增加 Hook。
- `useDebugValue` 只为 React DevTools 提供标签，formatter 负责纯格式化且没有业务返回值。
- 调试标签应服务真实诊断需要，不能替代页面输出、日志或业务状态。

## 十五、参考资料

- [Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks) - 自定义 Hook 的定义、命名、
  独立 State、State 共享边界和抽取判断。
- [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks) - Hook 的合法调用位置和固定顺序。
- [rules-of-hooks lint](https://react.dev/reference/eslint-plugin-react-hooks/lints/rules-of-hooks) - 常见调用违规的
  静态检查边界。
- [`useDebugValue`](https://react.dev/reference/react/useDebugValue) - 调试标签、formatter、返回值和延迟格式化。
- [`useState`](https://react.dev/reference/react/useState) - State 声明与更新函数的公共合同。
- [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) - 共享 State 时的所有权
  和提升方法。
