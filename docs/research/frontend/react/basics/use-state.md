# useState 官方调研

## 研究范围

本文面向已掌握 JavaScript 函数、数组解构和 TypeScript 基础语法的本科阶段学习者，只研究以下内容：

- `useState` 的公开签名，以及返回数组中两个位置各自表示什么。
- 普通初始值、函数形式的惰性 initializer，以及二者的使用差异。
- setter 接受直接值或 updater 函数、触发重新渲染并返回 `void` 的基本合同。
- State 属于屏幕上的组件副本；同一组件可以拥有多份互相独立的 State。
- TypeScript 对基本值的推断、显式联合类型、`null`、`undefined` 和函数 State。

以下主题只作为边界列出，不进入概念解释、示例或练习：Hooks 调用规则；State 快照；render 与
commit；批处理与更新队列；对象或数组的不可变更新；Effect、Reducer、Context、共享状态和外部
store。

## 本地版本基线

核验日期：2026-08-16。

| 项目 | 锁定版本 | 本地证据 | 核验结果 |
| --- | --- | --- | --- |
| `react` | 19.2.8 | `package-lock.json` 的 `node_modules/react`；`node_modules/react/package.json` | 两处一致 |
| `react-dom` | 19.2.8 | `package-lock.json` 的 `node_modules/react-dom`；`node_modules/react-dom/package.json` | 两处一致 |
| `@types/react` | 19.2.18 | `package-lock.json` 的 `node_modules/@types/react`；`node_modules/@types/react/package.json` | 两处一致 |
| `typescript` | 6.0.3 | `package-lock.json` 的 `node_modules/typescript`；`node_modules/typescript/package.json` | 两处一致 |
| React TypeScript 配置 | `strict: true` | `tsconfig.react.json` | `null` 与 `undefined` 按独立类型处理 |

`react-dom` 不定义 `useState`，但它与 `react` 的运行时版本需要保持一致。本文涉及的 TypeScript
签名以本地 `@types/react@19.2.18` 为准，不用其他版本的声明代替。

## 一手来源

| ID | 一手来源 | 适用版本或性质 | 本文使用范围 |
| --- | --- | --- | --- |
| R1 | [React `useState` Reference](https://react.dev/reference/react/useState) | React 19.2 官方文档 | 公开调用形式、二元返回值、初始值、initializer、setter、updater、函数 State |
| R2 | [State: A Component's Memory](https://react.dev/learn/state-a-components-memory) | React 19.2 官方文档 | 多份 State、组件副本的局部与独立 State |
| R3 | [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state) | React 19.2 官方文档 | State 与 UI 树中组件位置的归属关系 |
| R4 | [Using TypeScript](https://react.dev/learn/typescript#typing-usestate) | React 19.2 官方文档 | `useState` 的类型推断和显式联合泛型 |
| T1 | [Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html) | TypeScript 官方 Handbook | 从初始化表达式推断类型 |
| T2 | [Everyday Types: Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types) | TypeScript 官方 Handbook | 联合类型的成员集合语义 |
| T3 | [Everyday Types: `null` and `undefined`](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#null-and-undefined) | TypeScript 官方 Handbook | 严格空值检查下的空值类型与收窄要求 |
| T4 | [TSConfig: `strict`](https://www.typescriptlang.org/tsconfig/strict.html) | TypeScript 官方配置参考 | `strict` 启用严格模式系列检查 |
| T5 | [TSConfig: `strictNullChecks`](https://www.typescriptlang.org/tsconfig/strictNullChecks.html) | TypeScript 官方配置参考 | `null`、`undefined` 具有独立类型 |
| L1 | `node_modules/@types/react/index.d.ts:1639-1697` | `@types/react@19.2.18` 本地声明 | `SetStateAction`、`Dispatch` 和两个 `useState` overload |
| L2 | `package-lock.json` 与四个对应的 `node_modules/*/package.json` | 当前工作区快照 | 当前依赖版本 |

这些来源均来自 React、TypeScript 或当前安装的官方类型声明。没有用博客、问答网站或搜索摘要支撑
事实。

## 公开签名

本地 `@types/react@19.2.18` 的相关声明可整理为：

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

这两项返回值组成固定的二元组：第一项是当前 State，第二项是对应的 setter。数组解构的变量名由
调用者决定，常用命名只是 `[something, setSomething]` 约定，不参与 React 的状态识别。[R1][R2][L1]

有初始参数时，第一项类型是 `S`；无参数 overload 的第一项包含 `undefined`。setter 的参数类型是
`S | ((prevState: S) => S)`，返回类型是 `void`。[L1]

## 逐项事实与证据

| Claim | 可采用的准确表述 | 证据 |
| --- | --- | --- |
| C1 | `useState(initialState)` 返回恰好两个值：当前 State 与更新它的 setter。 | R1 `Returns`；R2 `Adding a state variable`；L1 |
| C2 | `initialState` 可以是任意类型的值；组件完成初始化后，后续 render 会忽略这个参数。 | R1 `Parameters` |
| C3 | 函数形式的 `initialState` 被解释为 initializer；它应当无参数、纯净并返回初始 State。 | R1 `Parameters` |
| C4 | `useState(createValue)` 把函数交给 React 用于初始化；`useState(createValue())` 会先在每次组件函数执行时计算表达式。 | R1 `Avoiding recreating the initial state` |
| C5 | setter 可以接收一个下一值，也可以接收一个由前一值计算下一值的纯 updater。 | R1 `set functions`；L1 |
| C6 | setter 会请求 React 使用新的 State 重新渲染对应组件；setter 本身没有返回值。 | R1 `set functions` 与 `Returns`；L1 |
| C7 | 一个组件可以声明多份不同类型的 State；互不相关的值可以由各自的 setter 单独更新。 | R2 `Giving a component multiple state variables` |
| C8 | State 对屏幕上的组件副本是局部且私有的；渲染同一组件的两个副本时，两份 State 相互隔离。 | R2 `State is isolated and private` |
| C9 | React 将 State 与 UI 树中的组件位置关联，而不是把 State 存在组件函数或 JSX 标签对象中。 | R3 `State is tied to a position in the tree` |
| C10 | TypeScript 通常根据初始值推断 `S`；有限字符串集合需要显式联合泛型。 | R4；T1；T2 |
| C11 | 当前 `strict` 配置下，`null` 和 `undefined` 是独立类型；业务允许空值时必须把它写进 State 类型。 | T3；T4；T5；`tsconfig.react.json` |
| C12 | 当 State 本身是函数时，初始化和更新都要用外层函数返回真正要存储的函数。 | R1 `I'm trying to set state to a function`；L1 |

## 初始值与 initializer

### 普通初始值

```tsx
const [count, setCount] = useState(0)
const [title, setTitle] = useState('React')
const [visible, setVisible] = useState(false)
```

这里的 `0`、`'React'` 和 `false` 用来确定各自的初始 State，也为 TypeScript 提供推断输入。不能把
`initialState` 理解成每次 render 都会覆盖当前值的默认参数；React 官方明确说明初始化后会忽略它。
[R1][R4]

### 惰性 initializer

```tsx
/** 生成惰性初始化所需的字符串。 */
function createInitialLabel(): string {
  return '待学习'
}

const [label, setLabel] = useState(createInitialLabel)
```

传入的是 `createInitialLabel` 函数本身。React 在初始化组件时调用它并保存返回值。若写成
`useState(createInitialLabel())`，JavaScript 会先执行函数，再把字符串结果传给 `useState`；因此每次
组件函数执行都会先求值。[R1]

准确措辞应是“initializer 只用于确定初始 State”或“普通重新渲染不会重新采用初始参数”，不能承诺
initializer 在所有开发配置下恰好调用一次。正文无需展开调用次数机制。[R1]

## Setter 的基本合同

### 直接提供下一值

```tsx
type Mode = 'reading' | 'practice'

const [mode, setMode] = useState<Mode>('reading')

/** 直接把模式设置为已知的下一值。 */
function enterPractice(): void {
  setMode('practice')
}
```

直接值适合“下一状态已经明确”的情况。setter 会请求重新渲染，但调用表达式的结果是 `void`，不能把
它当成新 State，也不能把它当成可等待结果。[R1][L1]

### 由前一值计算下一值

```tsx
const [count, setCount] = useState(0)

/** 根据前一计数计算下一计数。 */
function increment(): void {
  setCount((previous) => previous + 1)
}
```

函数参数被解释为 updater：接收前一 State，返回同一类型的下一 State。这里只建立输入与输出合同，
不解释多个更新的执行顺序或时间安排。[R1][L1]

## 组件副本与多份独立 State

同一组件内可以有多次 `useState` 调用，每次声明一份有独立名称、值和 setter 的 State：[R2]

```tsx
/** 展示同一组件副本中的两份独立 State。 */
function CounterPanel() {
  const [count, setCount] = useState(0)
  const [mode, setMode] = useState<'reading' | 'practice'>('reading')

  return (
    <section>
      <button type="button" onClick={() => setCount((value) => value + 1)}>
        {count}
      </button>
      <button type="button" onClick={() => setMode('practice')}>
        {mode}
      </button>
    </section>
  )
}
```

若页面渲染两个 `<CounterPanel />`，它们是屏幕上的两个组件副本。点击其中一个副本内的按钮不会改动
另一个副本的 State。准确表述是“每个副本拥有隔离的 State”，不是“组件函数对象保存了变量”。
[R2][R3]

## TypeScript 边界

### 由初始值推断

```tsx
const [enabled, setEnabled] = useState(false) // boolean
const [count, setCount] = useState(0) // number
const [title, setTitle] = useState('React') // string
```

`useState('idle')` 通常得到 `string`，不会自动把 State 限制为未来只允许几个字符串。需要有限状态域时，
显式提供联合类型。[R4][T1][T2]

### 联合类型

```tsx
type Status = 'idle' | 'loading' | 'success' | 'error'

const [status, setStatus] = useState<Status>('idle')
```

setter 只能接收 `Status` 的成员，或接收从 `Status` 返回 `Status` 的 updater。联合类型描述允许值的
集合，不会在运行时验证来自网络或存储的数据。[R4][T2][L1]

### `null`

```tsx
type User = {
  id: string
  name: string
}

const [user, setUser] = useState<User | null>(null)
```

在当前严格配置下，单独写 `useState(null)` 只得到 `null` State，之后不能写入 `User`。如果“尚未有
用户”是合法状态，就要在初始化时显式声明 `User | null`，读取属性前也必须先完成空值收窄。
[T3][T4][T5][L1]

### `undefined`

```tsx
const [value, setValue] = useState() // value: undefined
const [token, setToken] = useState<string>() // token: string | undefined
const [alias, setAlias] = useState<string | undefined>(undefined)
```

无参且不提供泛型时，`S` 使用默认值 `undefined`，setter 不能在之后接受字符串。`useState<string>()`
才表示“当前可能没有字符串，之后可以写入字符串”。如果业务有明确默认值，直接提供该值可以减少
`undefined` 分支。[L1][T3]

### 函数 State

函数参数在 `useState` 和 setter 中都有特殊解释，因此函数值必须由外层函数返回：[R1][L1]

```tsx
type Formatter = (score: number) => string

/** 把分数格式化为中文分值。 */
function formatAsPoints(score: number): string {
  return `${score} 分`
}

/** 把分数格式化为百分比文本。 */
function formatAsPercent(score: number): string {
  return `${score}%`
}

const [format, setFormat] = useState<Formatter>(() => formatAsPoints)

setFormat(() => formatAsPercent)
```

初始化时，外层 `() => formatAsPoints` 是 initializer，返回的 `formatAsPoints` 才是 State；更新时，
外层 `() => formatAsPercent` 是 updater，返回的 `formatAsPercent` 才是下一 State。即使显式泛型允许
函数类型，仍不能省略外层包装，因为特殊解释发生在 React 运行时。[R1][L1]

## 现有正文与 Demo 处置建议

本节只记录后续内容调整方向，不修改现有正文或 Demo。

| 动作 | 现有内容 | 建议 |
| --- | --- | --- |
| 保留 | “为什么需要 `useState`”中的局部变量与 State 对照 | 压缩为 State 能保留组件副本所需信息，并由 setter 请求重新渲染；不解释快照时序。 |
| 保留 | 二元数组、普通初始值、惰性 initializer、直接值 setter、单次 updater | 以 R1 与本地声明为唯一合同，保留最小示例。 |
| 保留 | “每个 `useState` 调用管理一份独立状态”和两个组件副本的示例 | 用 R2、R3 校准为“屏幕上的组件副本”和“UI 树中的位置”。 |
| 保留 | 基本推断、字符串联合、`null`、`undefined`、函数 State | 修正到 TypeScript 6.0.3，并明确每种写法的实际类型。 |
| 删除 | setter 后立即读取旧值、连续三次更新、批处理描述 | 这些内容超出 setter 的基本输入/输出合同。 |
| 删除 | `Object.is`、直接修改对象/数组、展开复制等内容 | 对象与数组更新不属于本文范围。 |
| 删除 | Strict Mode 双调用、setter 稳定身份、render 阶段 setter | 它们不是理解公开签名与基本用法所必需的内容。 |
| 删除 | Effect、Reducer、Context、共享状态、外部 store 的解释或建议 | 仅在范围列表中标明不涉及，不在正文展开。 |
| 移动 | Hooks 调用位置、条件与循环调用错误 | 归入 `rules-of-hooks.md`。 |
| 移动 | 当前值与下一次 render 的读取差异 | 归入 `render-commit-and-state-snapshot.md`。 |
| 移动 | 多个 updater 的顺序、连续更新和批处理 | 归入 `state-update-queue.md`。 |
| 移动 | 对象、数组替换与不可变更新 | 分别归入 `updating-object-state.md`、`updating-array-state.md`。 |
| 移动 | 多组件同步、提升 State 等共享边界 | 归入 `state-sharing-boundary.md` 或 `lifting-state-up.md`。 |
| 补充 | 公开 TypeScript overload | 正文展示精简签名，并解释有参和无参两种返回类型。 |
| 补充 | Demo 的组件副本独立性 | 渲染两个小型计数器；操作一个时另一个保持原值。 |
| 补充 | Demo 的类型边界 | 用字符串联合展示显式泛型；`null`、`undefined` 和函数 State 可用短代码块说明。 |

当前 Demo 中 `count`、`completed` 和多个 setter 可以保留。`notice` 使用对象 State，会把示例带入对象
更新；建议改成由纯函数返回的字符串，以继续展示惰性 initializer。Demo 可以补两个相同计数器副本，
但不需要同时承载所有 TypeScript 边界；`null`、`undefined` 和函数 State 用正文短示例表达更直接。

## 高风险易错点

| 易错写法或说法 | 风险 | 准确处理 | 证据 |
| --- | --- | --- | --- |
| 把 TypeScript 版本写成 `7.0.2` | 与锁文件和安装版本不一致 | 使用 `6.0.3` | L2 |
| 把返回值当对象或任意长度数组 | 错读公开 API | 明确它是 `[state, setState]` 二元组 | R1；L1 |
| 说每次 render 都会采用新的 `initialState` | 把初始参数误当同步入口 | 明确初始化后忽略该参数 | R1 |
| 用 `useState(createValue())` 演示惰性初始化 | 函数已经被 JavaScript 立即执行 | 传 `useState(createValue)` | R1 |
| 承诺 initializer 在所有环境恰好调用一次 | 超出官方保证 | 只承诺它用于确定初始 State | R1 |
| 把 setter 当成返回下一值或 Promise | 本地声明明确返回 `void` | 下一值通过参数表达，不依赖调用结果 | R1；L1 |
| 用连续 updater 示例解释基本 setter | 不必要地引入更新顺序 | 只展示一次直接值与一次 updater | R1；L1 |
| 写 `useState(null)` 后期望接受对象 | 严格配置下 `S` 只推断为 `null` | 显式写 `User | null` | T3；T5；L1 |
| 写 `useState()` 后期望接受字符串 | 默认泛型为 `undefined` | 写 `useState<string>()` 或提供字符串初始值 | L1 |
| 直接传入要保存的函数 | React 会把它解释为 initializer 或 updater | 初始化和更新都增加外层函数 | R1；L1 |
| 说 State 存在组件函数或 JSX 标签中 | 混淆 State 的归属 | 表述为屏幕上的组件副本及其 UI 树位置 | R2；R3 |
| 用对象 `notice` 作为 initializer 主示例 | 把注意力引向对象替换规则 | 改用字符串 initializer | 研究范围；R1 |

## 可执行验收合同

### 正文验收

1. 学习者能根据公开签名指出二元组第一项、第二项、setter 参数和 `void` 返回值。
2. 示例同时出现 `useState(0)` 与 `useState(createInitialLabel)`，并能解释为什么后者没有调用括号。
3. setter 只用一个直接值示例和一个单次 updater 示例说明基本合同。
4. 同一组件内至少展示两份独立 State；同一组件的两个屏幕副本拥有互不影响的值。
5. TypeScript 示例覆盖推断、字符串联合、`null`、`undefined` 和函数 State 的双层包装。
6. 正文不展开研究范围之外的主题；范围列表之外也不以 Pitfall、练习或旁注继续解释它们。
7. 每个 API 或类型结论都能回指 R1-R4、T1-T5、L1 或 L2，不用无来源的经验性断言。

### Demo 验收

| 场景 | 操作 | 可观察结果 |
| --- | --- | --- |
| 两个组件副本 | 只点击第一个计数器的增加按钮 | 第一个计数改变，第二个保持原值 |
| 同一副本的多份 State | 改变模式，再增加计数 | 模式与计数分别变化，互不覆盖 |
| 直接值 setter | 点击“进入练习” | 联合状态从 `reading` 变为 `practice` |
| updater setter | 点击“增加” | 对应副本的计数增加 1 |
| 惰性 initializer | 检查展示源码并操作其他状态 | 源码传入 `createInitialLabel` 而不是执行调用，标签保持其 State 值 |

### TypeScript 验收

在当前 `strict` 配置的临时类型片段中核对以下结果：

- `useState(false)` 的 State 为 `boolean`，setter 不接受字符串。
- `useState<'idle' | 'loading'>('idle')` 的 setter 不接受联合成员之外的值。
- `useState<User | null>(null)` 在未收窄时不能直接读取 `User` 属性。
- `useState()` 的 State 为 `undefined`；`useState<string>()` 为 `string | undefined`。
- `useState<Formatter>(() => formatAsPoints)` 返回 `Formatter`，更新函数写成
  `setFormat(() => formatAsPercent)`。

临时片段只用于核对类型结论，不进入仓库。所有判断以 TypeScript 6.0.3 与本地
`@types/react@19.2.18` 的结果为准。

## 结论

在当前依赖下，`useState` 的核心公开合同是：用一个普通值或无参 initializer 确定初始 State，返回
`[state, setter]` 二元组，并允许 setter 接收直接值或 updater 后返回 `void`。每个屏幕上的组件副本
拥有隔离的 State，同一副本也可以声明多份 State。TypeScript 从初始值推断 `S`；当完整状态域包含
有限字符串、`null`、`undefined` 或函数时，需要用显式类型和正确的函数包装准确表达它。
