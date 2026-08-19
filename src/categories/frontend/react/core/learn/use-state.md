---
id: react.core.learn.basics.use-state
type: lesson
title: useState
summary: 使用 useState 为组件声明局部状态，并用 TypeScript 准确表达状态允许的值。
domain: frontend
technology: react
module: core
stage: basics
level: beginner
estimatedMinutes: 90
prerequisites:
  - react.core.learn.basics.rules-of-hooks
related: []
tags:
  - React
  - useState
  - State
  - TypeScript
appliesTo: React 19.2
verifiedAt: 2026-08-16
objectives:
  - 能解释普通局部变量与组件局部 State 的区别。
  - 能读懂 useState 的两个 TypeScript overload 和二元返回值。
  - 能正确选择普通初始值或惰性 initializer。
  - 能使用直接值或单次 updater 调用 setter，并理解 setter 返回 void。
  - 能说明同一组件内的多份 State 和多个组件副本为什么互不覆盖。
  - 能为基本值、联合类型、null、undefined 和函数 State 编写准确类型。
recap:
  - useState 返回当前 State 和对应 setter 组成的二元组。
  - 初始参数只用于确定初始 State，函数参数会被解释为 initializer。
  - setter 接受直接下一值或从前一值返回下一值的 updater，并返回 void。
  - 每个组件副本拥有隔离的 State，同一副本也可以声明多份 State。
  - TypeScript 通常从初始值推断类型，完整状态域更宽时需要显式泛型。
  - 函数 State 在初始化和更新时都需要由外层函数返回。
sources:
  - title: React useState Reference
    url: https://react.dev/reference/react/useState
    sourceType: api-doc
    appliesTo: React 19.2
    claims:
      - useState 的签名、返回值、初始值、initializer、setter、updater 和函数 State
  - title: "React State: A Component's Memory"
    url: https://react.dev/learn/state-a-components-memory
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 组件局部 State、多份 State 和多个组件副本的隔离性
  - title: React Preserving and Resetting State
    url: https://react.dev/learn/preserving-and-resetting-state
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - State 与 UI 树中组件位置的归属关系
  - title: React Using TypeScript
    url: https://react.dev/learn/typescript#typing-usestate
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - useState 的类型推断和显式联合类型
  - title: React Type Definitions
    url: https://cdn.jsdelivr.net/npm/@types/react@19.2.18/index.d.ts
    sourceType: api-doc
    appliesTo: "@types/react 19.2.18"
    claims:
      - SetStateAction、Dispatch 和 useState 的两个 TypeScript overload
  - title: TypeScript Union Types
    url: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types
    sourceType: official-reference
    appliesTo: TypeScript 6.0
    claims:
      - 联合类型、null 和 undefined 的静态类型边界

---

# useState

## 一、学习目标

- 说明组件为什么需要一份由 React 保存的局部 State。
- 从 `useState` 的公开签名判断初始值、当前值和 setter 的类型。
- 区分直接初始值、惰性 initializer 和函数 State。
- 使用直接值或单次 updater 表达下一状态。
- 识别同一组件中的多份 State，以及同一组件的多个独立副本。
- 为基本值、有限字符串、`null`、`undefined` 和函数值声明准确的 TypeScript 状态域。

## 二、为什么组件需要 State

组件经常需要记住会影响界面的信息，例如点击次数、当前模式或是否已经选择某项。普通局部变量不能同时
承担“保留信息”和“通知 React 更新界面”这两个职责。

```tsx
/** 演示普通局部变量不能作为组件状态。 */
function BrokenCounter() {
  let count = 0

  /** 只修改本次函数执行中的局部变量。 */
  function handleIncrement() {
    count += 1
  }

  return <button onClick={handleIncrement}>已点击 {count} 次</button>
}
```

这段代码的问题有两层：

1. `count` 是组件函数执行期间创建的普通变量，React 不会把它登记为这个组件副本的 State。
2. `count += 1` 是普通 JavaScript 赋值，不会请求 React 根据新值重新生成界面。

`useState` 同时提供当前 State 和更新入口：

```tsx
import { useState } from 'react'

/** 使用 State 保存点击次数。 */
function Counter() {
  const [count, setCount] = useState(0)

  /** 根据前一计数生成下一计数。 */
  function handleIncrement() {
    setCount((previous) => previous + 1)
  }

  return <button onClick={handleIncrement}>已点击 {count} 次</button>
}
```

这里的 `count` 是 React 为当前组件副本保存的值，`setCount` 是对应的 setter。调用 setter 后，React 会
使用下一 State 重新渲染这个组件副本。

适合放入 State 的值同时满足两个条件：

- 组件需要在交互之间记住它。
- 它发生变化时，界面也需要重新计算。

固定不变的标签、单位或配置常量直接使用普通 `const` 即可，不需要放入 State。

## 三、公开签名与二元返回值

### 1. 两个 TypeScript overload

`@types/react` 将 `useState` 的核心类型整理为以下形式：

```ts
type SetStateAction<S> = S | ((prevState: S) => S)
type Dispatch<A> = (value: A) => void

function useState<S>(
  initialState: S | (() => S),
): [S, Dispatch<SetStateAction<S>>]

function useState<S = undefined>(): [
  S | undefined,
  Dispatch<SetStateAction<S | undefined>>,
]
```

类型参数 `S` 表示这份 State 允许保存的完整值集合。两个 overload 的差别是是否提供初始参数：

| 调用形式 | 当前 State 类型 | setter 可接收的内容 |
| --- | --- | --- |
| `useState<S>(initialState)` | `S` | `S` 或 `(previous: S) => S` |
| `useState<S>()` | `S \| undefined` | `S \| undefined` 或对应 updater |

`Dispatch<A>` 的返回类型是 `void`。setter 的职责是提交下一状态，不会把下一状态作为调用结果返回。

### 2. 返回数组中只有两个位置

`useState(initialState)` 返回恰好两个值：

```tsx
const [state, setState] = useState(initialState)
```

- 第一项是当前 State。
- 第二项是更新这份 State 的 setter。

方括号是 JavaScript 数组解构，不是 React 新语法。下面两种读取方式得到相同的两个值：

```tsx
const statePair = useState(0)
const count = statePair[0]
const setCount = statePair[1]

const [score, setScore] = useState(0)
```

数组解构让调用者自行命名变量。常用约定是 `[something, setSomething]`：

```tsx
const [isOpen, setIsOpen] = useState(false)
const [status, setStatus] = useState('idle')
const [selectedId, setSelectedId] = useState<string | null>(null)
```

名称不影响 React 的行为，但准确名称能直接说明这份 State 表示什么。布尔值通常使用 `is`、`has` 或
`can` 前缀，setter 则保留 `set` 前缀。

### 3. `S` 同时约束当前值与 setter

同一个 `S` 会出现在当前 State、直接值和 updater 的输入输出中：

```tsx
type ReadingMode = 'preview' | 'focus'

const [mode, setMode] = useState<ReadingMode>('preview')

setMode('focus')
setMode((previous) => (previous === 'preview' ? 'focus' : 'preview'))
```

下面的调用不属于 `ReadingMode`，TypeScript 会拒绝：

```tsx
setMode('unknown')
setMode(() => 1)
```

泛型因此不仅标注当前变量，也约束所有合法更新入口。

## 四、初始 State

### 1. 直接提供普通初始值

数字、字符串和布尔值可以直接作为初始参数：

```tsx
const [page, setPage] = useState(1)
const [query, setQuery] = useState('')
const [enabled, setEnabled] = useState(false)
```

初始参数只用于确定这个组件副本的初始 State。初始化完成后，再次执行组件函数不会用新的初始参数覆盖
当前 State。

初始值还会参与 TypeScript 推断：

| 初始调用 | 推断出的 `S` | setter 的直接值类型 |
| --- | --- | --- |
| `useState(1)` | `number` | `number` |
| `useState('')` | `string` | `string` |
| `useState(false)` | `boolean` | `boolean` |

### 2. 初始参数不是持续同步入口

当初始参数来自 Prop 时，它仍然只负责初始化：

```tsx
type LevelEditorProps = {
  initialLevel: number
}

/** 使用 Prop 提供初始等级。 */
function LevelEditor({ initialLevel }: LevelEditorProps) {
  const [level, setLevel] = useState(initialLevel)

  /** 将等级增加一级。 */
  function handleUpgrade() {
    setLevel((previous) => previous + 1)
  }

  /** 显式恢复为调用方当前提供的初始等级。 */
  function handleReset() {
    setLevel(initialLevel)
  }

  return (
    <section>
      <p>当前等级：{level}</p>
      <button type="button" onClick={handleUpgrade}>升级</button>
      <button type="button" onClick={handleReset}>恢复初始等级</button>
    </section>
  )
}
```

如果调用方后来提供了不同的 `initialLevel`，React 不会自动覆盖用户已经修改过的 `level`。代码只有在
明确调用 `setLevel(initialLevel)` 时，才把这份 Prop 值作为下一 State 提交。

### 3. 惰性 initializer

初始值需要计算时，可以传入一个无参数函数：

```tsx
/** 计算组件需要的初始标签。 */
function createInitialLabel(): string {
  return '等待练习'
}

/** 使用惰性 initializer 创建初始标签。 */
function PracticeLabel() {
  const [label, setLabel] = useState(createInitialLabel)

  /** 写入明确的下一标签。 */
  function handleStart() {
    setLabel('练习中')
  }

  return <button onClick={handleStart}>{label}</button>
}
```

`createInitialLabel` 没有调用括号。React 把它识别为 initializer，在初始化组件副本时调用，并把返回值
保存为初始 State。

initializer 的合同是：

- 不接收参数。
- 返回类型与 `S` 一致。
- 只根据已有输入计算结果，不修改外部值。
- 只用于确定初始 State，不能用来持续同步其它数据。

### 4. 传函数与立即调用的差别

下面两种写法都能得到字符串，但执行位置不同：

```tsx
const [lazyLabel] = useState(createInitialLabel)
const [eagerLabel] = useState(createInitialLabel())
```

| 写法 | JavaScript 先做什么 | React 收到什么 |
| --- | --- | --- |
| `useState(createInitialLabel)` | 不立即调用 | initializer 函数 |
| `useState(createInitialLabel())` | 先执行函数调用 | 函数返回的字符串 |

第二种写法中的函数调用属于普通表达式求值。组件函数每次执行时都会先计算这个表达式，即使 React 已经
不再需要新的初始值。初始计算有明显成本时，应传入函数本身。

## 五、setter 的基本合同

### 1. 直接提交下一值

下一状态已经明确时，直接把值传给 setter：

```tsx
type StudyMode = 'reading' | 'practice'

/** 在两种学习模式之间提供明确操作。 */
function ModeSwitch() {
  const [mode, setMode] = useState<StudyMode>('reading')

  /** 进入练习模式。 */
  function handlePractice() {
    setMode('practice')
  }

  /** 返回阅读模式。 */
  function handleReading() {
    setMode('reading')
  }

  return (
    <section>
      <p>当前模式：{mode}</p>
      <button type="button" onClick={handlePractice}>练习</button>
      <button type="button" onClick={handleReading}>阅读</button>
    </section>
  )
}
```

直接值仍然必须属于 `S`。`setMode('practice')` 合法，`setMode('paused')` 会产生类型错误。

### 2. 由前一值计算下一值

下一状态由前一状态计算时，传入 updater：

```tsx
/** 使用 updater 增加计数。 */
function StepCounter() {
  const [count, setCount] = useState(0)

  /** 从前一计数返回下一计数。 */
  function handleIncrement() {
    setCount((previous) => previous + 1)
  }

  return <button onClick={handleIncrement}>{count}</button>
}
```

updater 的输入输出合同是 `(previous: S) => S`：

1. `previous` 是 React 提供的前一 State。
2. 函数根据 `previous` 计算结果。
3. 返回值成为下一 State，类型必须仍然是 `S`。

一次直接值和一次 updater 都属于 setter 的正常输入。选择标准只看下一值是否需要由前一值计算。

### 3. setter 返回 `void`

setter 没有业务返回值：

```tsx
const [status, setStatus] = useState<'idle' | 'ready'>('idle')

const result = setStatus('ready')
// result 的类型是 void
```

不要把 `result` 当成新的 `status`，也不要把 setter 当成返回 Promise 的异步函数。需要提交什么值，应在
调用 setter 之前用普通变量或 updater 表达清楚。

```tsx
const nextStatus = 'ready' as const
setStatus(nextStatus)
```

## 六、局部 State 与组件副本

### 1. 同一组件可以声明多份 State

每次 `useState` 调用都会返回一组独立的当前值和 setter：

```tsx
type PanelMode = 'summary' | 'detail'

/** 同时保存计数、模式和选择结果。 */
function PracticePanel() {
  const [attempts, setAttempts] = useState(0)
  const [mode, setMode] = useState<PanelMode>('summary')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  /** 增加练习次数。 */
  function handleAttempt() {
    setAttempts((previous) => previous + 1)
  }

  /** 打开详情模式。 */
  function handleDetail() {
    setMode('detail')
  }

  /** 选择一个条目。 */
  function handleSelect() {
    setSelectedId('react-state')
  }

  return (
    <section>
      <p>次数：{attempts}</p>
      <p>模式：{mode}</p>
      <p>选择：{selectedId ?? '无'}</p>
      <button type="button" onClick={handleAttempt}>增加次数</button>
      <button type="button" onClick={handleDetail}>查看详情</button>
      <button type="button" onClick={handleSelect}>选择条目</button>
    </section>
  )
}
```

三个 setter 只更新各自对应的 State。变量名和类型把三份信息的职责分开，调用一个 setter 不会把其它
State 覆盖掉。

### 2. State 属于屏幕上的组件副本

页面可以多次使用同一个组件函数：

```tsx
/** 保存自身局部计数。 */
function IndependentCounter() {
  const [count, setCount] = useState(0)

  /** 增加当前副本的计数。 */
  function handleIncrement() {
    setCount((previous) => previous + 1)
  }

  return <button onClick={handleIncrement}>{count}</button>
}

/** 渲染两个互相独立的计数器副本。 */
function CounterPair() {
  return (
    <section>
      <IndependentCounter />
      <IndependentCounter />
    </section>
  )
}
```

两个 `<IndependentCounter />` 对应 UI 树中的两个位置，因此各自拥有一份 `count`。点击第一个按钮时，
第二个按钮仍保留自己的值。State 不存放在组件函数对象中，也不会因为两个副本使用同一个函数定义就自动
合并。

### 3. 每个副本都有自己的初始过程

如果 `IndependentCounter` 使用 initializer，每个新出现的组件副本都会为自己的 State 执行初始化：

```tsx
/** 返回计数器的初始标签。 */
function createCounterLabel(): string {
  return '尚未计数'
}

/** 为当前组件副本保存独立标签。 */
function LabeledCounter() {
  const [label, setLabel] = useState(createCounterLabel)

  /** 修改当前副本的标签。 */
  function handleStart() {
    setLabel('已经开始')
  }

  return <button onClick={handleStart}>{label}</button>
}
```

一个副本修改 `label` 不会修改另一个副本的初始值或当前值。

## 七、TypeScript 状态域

### 1. 从基本初始值推断

初始值已经完整表达类型时，通常不需要显式泛型：

```tsx
const [completed, setCompleted] = useState(false) // boolean
const [score, setScore] = useState(0) // number
const [title, setTitle] = useState('React') // string
```

这些类型会限制 setter：

```tsx
setCompleted(true)
setScore(100)
setTitle('useState')

setCompleted('yes') // 类型错误
setScore('100') // 类型错误
```

字符串初始值通常推断为宽泛的 `string`。`useState('idle')` 不会自动表示“只允许若干状态名称”。

### 2. 用联合类型限制有限状态

当允许值是有限集合时，显式声明联合类型：

```tsx
type RequestStatus = 'idle' | 'loading' | 'success' | 'error'

const [status, setStatus] = useState<RequestStatus>('idle')

setStatus('loading')
setStatus('success')
setStatus('paused') // 类型错误
```

联合类型描述编译期允许的值集合。它能阻止代码直接写入未声明的字符串，但不会自动检查网络、存储或用户
输入中的运行时数据。

updater 的返回值也受同一个联合类型约束：

```tsx
setStatus((previous) => (previous === 'idle' ? 'loading' : previous))
```

### 3. 把 `null` 写进完整状态域

`null` 适合表达“当前明确没有值”：

```tsx
type User = {
  id: string
  name: string
}

const [user, setUser] = useState<User | null>(null)
```

这里的完整状态域是 `User | null`。读取 `User` 属性前必须先收窄：

```tsx
const userName = user === null ? '未选择用户' : user.name
```

如果只写 `useState(null)`，TypeScript 会把 `S` 推断为 `null`，之后的 `setUser({ id, name })` 不合法。
显式泛型必须在初始化时描述未来所有允许状态，而不是只描述当前值。

### 4. 无参数 overload 与 `undefined`

三种调用形式的结果不同：

```tsx
const [missing, setMissing] = useState()
// missing: undefined；setter 只能接受 undefined 或对应 updater

const [token, setToken] = useState<string>()
// token: string | undefined

const [alias, setAlias] = useState<string | undefined>(undefined)
// alias: string | undefined
```

`useState()` 使用默认泛型 `S = undefined`，并不会根据未来的 setter 调用反向扩大类型。只有业务确实允许
“尚未有值”时才使用包含 `undefined` 的状态域。

读取前需要明确处理缺失分支：

```tsx
const tokenLength = token === undefined ? 0 : token.length
```

如果一开始就有合理默认值，`useState('')` 会得到更简单的 `string` 状态域。

### 5. 显式泛型应描述全部合法值

选择泛型时，先列出这份 State 的全部合法情况：

| 业务含义 | 建议类型 | 初始值示例 |
| --- | --- | --- |
| 任意计数 | `number` | `0` |
| 开或关 | `boolean` | `false` |
| 有限模式 | `'read' \| 'edit'` | `'read'` |
| 有值或明确为空 | `Item \| null` | `null` |
| 尚未取得字符串 | `string \| undefined` | 无参数或 `undefined` |

泛型太窄会让合法更新无法通过检查，泛型太宽则会失去有限状态的约束。优先让基本初始值参与推断，只在
初始值不能表达完整集合时显式提供泛型。

## 八、函数 State

### 1. 函数参数具有特殊含义

`useState` 的初始参数如果是函数，React 会把它解释为 initializer；setter 的参数如果是函数，React 会
把它解释为 updater。因此“保存函数本身”需要额外一层函数。

先声明要保存的函数类型和两个具体函数：

```tsx
type Formatter = (score: number) => string

/** 把分数格式化为分值。 */
function formatAsPoints(score: number): string {
  return `${score} 分`
}

/** 把分数格式化为百分比。 */
function formatAsPercent(score: number): string {
  return `${score}%`
}
```

初始化函数 State：

```tsx
const [format, setFormat] = useState<Formatter>(() => formatAsPoints)
```

外层 `() => formatAsPoints` 是 initializer，它的返回值 `formatAsPoints` 才是需要保存的 State。

更新函数 State：

```tsx
setFormat(() => formatAsPercent)
```

外层 `() => formatAsPercent` 是 updater，它返回新的函数值。显式写了 `Formatter` 泛型也不能省略外层
函数，因为 initializer 和 updater 的特殊解释发生在运行时。

### 2. 完整函数 State 示例

```tsx
import { useState } from 'react'

type Formatter = (score: number) => string

/** 使用分值单位。 */
function formatAsPoints(score: number): string {
  return `${score} 分`
}

/** 使用百分比单位。 */
function formatAsPercent(score: number): string {
  return `${score}%`
}

/** 保存并替换格式化函数。 */
function ScoreFormatter() {
  const [format, setFormat] = useState<Formatter>(() => formatAsPoints)

  /** 切换到百分比格式函数。 */
  function handleUsePercent() {
    setFormat(() => formatAsPercent)
  }

  /** 切换到分值格式函数。 */
  function handleUsePoints() {
    setFormat(() => formatAsPoints)
  }

  return (
    <section>
      <p>{format(85)}</p>
      <button type="button" onClick={handleUsePercent}>百分比</button>
      <button type="button" onClick={handleUsePoints}>分值</button>
    </section>
  )
}
```

函数 State 只表示“函数对象本身是需要保存的数据”。普通事件处理器直接作为事件属性传递，不需要为了
保存它而创建函数 State。

## 九、可运行示例

下面的示例渲染两个相同组件副本。每个副本都有独立计数、联合类型模式和惰性初始化标签；操作任意一边
都不会覆盖另一边。

:::demo{id="react.core.learn.basics.use-state.state-hook-demo"}
:::

观察顺序：

1. 只点击第一个副本的“增加”，确认第二个计数保持 `0`。
2. 只把第二个副本切换为练习模式，确认第一个模式保持阅读。
3. 分别重置计数，确认 setter 只处理所属副本的对应 State。
4. 展开源码，确认 `createInitialLabel` 作为函数传入，没有调用括号。

## 十、易错使用提示

:::pitfalls
### 错误：把二元组当成对象解构

**触发条件：** 使用花括号读取 `useState` 返回值。

**原因：** API 返回数组二元组，不返回带 `state`、`setState` 属性的对象。

**后果：** TypeScript 无法取得这些属性，运行时也得不到预期值。

**错误示例：**

```tsx
const { state, setState } = useState(0)
```

**正确写法：**

```tsx
const [count, setCount] = useState(0)
```

**验证方式：** `count` 推断为 `number`，`setCount` 接受数字或数字 updater。

### 错误：把初始参数当成持续同步值

**触发条件：** Prop 改变后，期待 `useState(initialLevel)` 自动覆盖本地 `level`。

**原因：** `initialLevel` 只用于确定初始 State。

**后果：** 界面继续显示组件副本已经保存的 `level`，与错误预期不符。

**错误示例：**

```tsx
type LevelViewProps = {
  initialLevel: number
}

/** 错误地期待初始参数持续覆盖 State。 */
function LevelView({ initialLevel }: LevelViewProps) {
  const [level] = useState(initialLevel)
  return <p>{level}</p>
}
```

**正确写法：** 需要恢复时明确调用 setter。

```tsx
type LevelEditorProps = {
  initialLevel: number
}

/** 提供显式恢复操作。 */
function LevelEditor({ initialLevel }: LevelEditorProps) {
  const [level, setLevel] = useState(initialLevel)

  /** 恢复为调用方当前提供的初始等级。 */
  function handleReset() {
    setLevel(initialLevel)
  }

  return <button onClick={handleReset}>等级 {level}</button>
}
```

**验证方式：** 只有点击按钮调用 setter 时，`level` 才恢复为当前 `initialLevel`。

### 错误：把 initializer 立即执行

**触发条件：** 写出 `useState(createInitialLabel())`，却把它称为惰性 initializer。

**原因：** 调用括号使 JavaScript 先执行函数，React 收到的是返回值。

**后果：** 组件函数每次执行时都会先做这次计算。

**错误示例：**

```tsx
/** 计算初始标签。 */
function createInitialLabel(): string {
  return '等待练习'
}

const [label] = useState(createInitialLabel())
```

**正确写法：**

```tsx
const [label] = useState(createInitialLabel)
```

**验证方式：** 检查传给 `useState` 的是函数引用，而不是函数调用结果。

### 错误：依赖 setter 的返回值

**触发条件：** 把 `setStatus('ready')` 的调用结果当成下一状态或 Promise。

**原因：** setter 的返回类型是 `void`。

**后果：** 后续代码拿到 `undefined`，无法表示下一状态。

**错误示例：**

```tsx
const nextStatus = setStatus('ready')
```

**正确写法：**

```tsx
const nextStatus = 'ready' as const
setStatus(nextStatus)
```

**验证方式：** TypeScript 显示 `nextStatus` 为 `'ready'`，setter 调用结果不参与业务计算。

### 错误：用 `useState(null)` 表达未来的对象值

**触发条件：** 初始值只有 `null`，之后却要通过 setter 写入对象。

**原因：** 严格类型检查下，`S` 被推断为 `null`。

**后果：** setter 不接受对象，读取对象属性也没有类型依据。

**错误示例：**

```tsx
const [user, setUser] = useState(null)
setUser({ id: 'u-1', name: 'Ada' })
```

**正确写法：**

```tsx
type User = {
  id: string
  name: string
}

const [user, setUser] = useState<User | null>(null)
```

**验证方式：** setter 接受 `User` 和 `null`，读取属性前要求先排除 `null`。

### 错误：省略初始值后期待自动接受字符串

**触发条件：** 调用 `useState()` 后再尝试写入字符串。

**原因：** 无参数 overload 默认得到 `undefined` 状态域，不会根据后面的 setter 调用扩大类型。

**后果：** `setToken('abc')` 产生类型错误。

**错误示例：**

```tsx
const [token, setToken] = useState()
setToken('abc')
```

**正确写法：**

```tsx
const [token, setToken] = useState<string>()
setToken('abc')
```

**验证方式：** `token` 的类型是 `string | undefined`，分支处理 `undefined` 后可以安全使用字符串方法。

### 错误：直接传入要保存的函数

**触发条件：** State 本身是函数，却把函数值直接传给 `useState` 或 setter。

**原因：** React 会把这两个位置上的函数分别解释为 initializer 或 updater。

**后果：** 函数被调用，其返回值被当成 State，而不是保存函数对象本身。

**错误示例：**

```tsx
type Formatter = (score: number) => string

/** 返回带单位的分数。 */
function formatScore(score: number): string {
  return `${score} 分`
}

const [format, setFormat] = useState<Formatter>(formatScore)
setFormat(formatScore)
```

**正确写法：**

```tsx
const [format, setFormat] = useState<Formatter>(() => formatScore)
setFormat(() => formatScore)
```

**验证方式：** `format` 的类型保持为 `Formatter`，调用 `format(80)` 得到 `80 分`。
:::

## 十一、原理与适用场景

### 1. 公开合同

1. `useState` 用普通值或 initializer 确定初始 State。
2. 返回值固定为 `[state, setter]` 二元组。
3. setter 接受 `S` 或 `(previous: S) => S`，返回 `void`。
4. 一个组件副本可以有多份 State；不同组件副本的 State 相互隔离。
5. State 与 UI 树中的组件位置关联，不存放在组件函数对象里。

### 2. 类型判断顺序

为 State 选择类型时按以下顺序判断：

1. 初始值是否已经覆盖全部合法值；若是，让 TypeScript 推断。
2. 值是否只允许有限字符串；若是，声明字符串联合类型。
3. “明确为空”是否属于业务状态；若是，把 `null` 加入联合。
4. “尚未取得值”是否属于业务状态；若是，把 `undefined` 加入联合。
5. State 本身是否为函数；若是，声明函数类型，并在初始化和更新时增加外层函数。

### 3. 适用场景

`useState` 适合保存一个组件副本需要记住、并且会改变其界面的局部信息，例如：

- 点击次数、页码或评分等数字。
- 是否展开、是否完成等布尔值。
- 阅读、练习、完成等有限模式。
- 当前选择可能存在或为空的标识。
- 暂时尚未取得的字符串值。
- 确实作为数据使用的函数值。

如果值在组件副本存续期间始终不变，使用普通常量更直接。是否使用 State，应由“是否需要记住并影响界面”
决定，而不是由变量类型决定。

## 十二、练习

:::exercise
### 练习目标

**要求：** 实现两个互相独立的 `ScoreCounter` 组件副本，并为每份 State 建立准确类型；组件使用
`useState(0)` 保存 `score`，提供“加一”和“归零”按钮；使用
`useState<'ready' | 'running'>('ready')` 保存模式，提供“开始”按钮；使用无参数纯函数
`createInitialLabel` 惰性创建字符串标签；页面同时渲染两个 `ScoreCounter`；另写一个类型片段，分别
声明 `string | null`、`string | undefined` 和函数 State。

**验收：** 第一个副本连续点击两次后显示 `2`，第二个仍显示 `0`；第一个切换为 `running` 后，第二个
仍显示 `ready`；“归零”使用直接值 setter，“加一”使用单次 updater；源码传入
`createInitialLabel` 而不是调用它；联合类型之外的字符串、未声明的空值和错误的函数包装都会被
TypeScript 拒绝。
:::

## 十三、本节小结

- `useState` 返回当前 State 和 setter 组成的二元组。
- 普通初始值直接传入；需要延后计算时传入无参数 initializer。
- setter 接受直接值或从前一值返回下一值的 updater，并返回 `void`。
- 同一组件副本可以保存多份 State，同一组件的多个屏幕副本互不覆盖。
- 基本初始值可以推断类型；有限字符串、`null` 和 `undefined` 需要准确描述完整状态域。
- State 本身是函数时，初始化和更新都要使用外层函数返回真正的函数值。

## 十四、参考资料

- [useState](https://react.dev/reference/react/useState) - 公开签名、初始化、setter、updater 与函数 State。
- [State: A Component's Memory](https://react.dev/learn/state-a-components-memory) - 局部 State、多份 State 与组件副本。
- [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state) - State 与 UI 树位置的归属。
- [Using TypeScript](https://react.dev/learn/typescript#typing-usestate) - 推断和显式联合类型。
- [Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types) - 联合类型、`null` 与 `undefined`。
