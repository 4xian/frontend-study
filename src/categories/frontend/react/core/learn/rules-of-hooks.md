---
id: react.core.learn.basics.rules-of-hooks
type: lesson
title: Hooks 调用规则
summary: 掌握 Hook 的合法调用位置、稳定顺序、React 函数边界、lint 检查与 use 例外。
domain: frontend
technology: react
module: core
stage: basics
level: beginner
estimatedMinutes: 80
prerequisites:
  - react.core.learn.basics.event-handling
related:
  - react.core.learn.basics.component-purity
  - react.core.learn.basics.use-state
tags:
  - React
  - Hooks
  - 调用规则
  - ESLint
  - use
appliesTo: React 19.2（运行时 19.2.8）
verifiedAt: 2026-08-16
objectives:
  - 能准确解释“只在 React 函数顶层调用 Hook”的含义。
  - 能识别条件、循环、提前返回、嵌套函数和事件处理器中的非法 Hook 调用。
  - 能用稳定调用顺序解释 React 为什么禁止普通 Hook 的条件调用。
  - 能区分函数组件、自定义 Hook、普通函数与组件直接调用的边界。
  - 能说明 rules-of-hooks lint 能检查什么以及静态检查的能力边界。
  - 能准确应用 React use API 的条件与循环例外，并保留其余限制。
recap:
  - 普通 Hook 只在函数组件或自定义 Hook 的函数体顶层调用。
  - 每次 render 必须执行相同的普通 Hook，并保持相同顺序。
  - 条件、循环、提前返回之后、回调、事件处理器和模块顶层都不是普通 Hook 的合法位置。
  - 组件通过 JSX 交给 React 调用，自定义 Hook 以 use 加大写字母命名。
  - rules-of-hooks 只检查可静态识别的调用结构，不能证明运行时执行一定正确。
  - use 不是普通 Hook，可在条件和循环中调用，但仍须位于组件或 Hook 内且不能放进 try/catch。
sources:
  - title: React Versions
    url: https://react.dev/versions
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 当前 React 官方文档版本
  - title: Rules of Hooks
    url: https://react.dev/reference/rules/rules-of-hooks
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Hook 的顶层调用与 React 函数边界
      - 条件、循环、提前返回、回调和事件处理器等非法位置
  - title: React calls Components and Hooks
    url: https://react.dev/reference/rules/react-calls-components-and-hooks
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 组件由 React 通过 JSX 调用
      - Hook 不作为普通值动态传递或替换
  - title: Hook names always start with use
    url: https://react.dev/learn/reusing-logic-with-custom-hooks#hook-names-always-start-with-use
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 组件、自定义 Hook 与普通函数的命名边界
  - title: rules-of-hooks lint
    url: https://react.dev/reference/eslint-plugin-react-hooks/lints/rules-of-hooks
    sourceType: official-reference
    appliesTo: eslint-plugin-react-hooks 7.1.1
    claims:
      - 稳定调用顺序的公共心智模型
      - 静态检查范围与 use 特殊处理
  - title: use API Reference
    url: https://react.dev/reference/react/use
    sourceType: api-doc
    appliesTo: React 19.2
    claims:
      - use 的条件与循环例外
      - 组件或 Hook 边界与 try/catch 限制
---

# Hooks 调用规则

## 一、学习目标

- 准确判断 Hook 调用是否位于函数组件或自定义 Hook 的顶层。
- 识别条件、循环、提前返回、嵌套函数、回调和事件处理器中的非法调用。
- 用“每次 render 的调用序列必须稳定”解释规则原因。
- 区分组件、自定义 Hook、普通函数和模块顶层的调用边界。
- 理解 `rules-of-hooks` lint 的作用、识别依据和能力边界。
- 正确处理 React `use` API 的窄例外，不把例外推广给普通 Hook。

## 二、为什么 Hook 需要调用规则

Hook 在语法上是 JavaScript 函数调用，但 React 需要把一次 render 中的每个 Hook 调用与同一组件之前
render 中的对应位置联系起来。普通 Hook 因此不能只在某些 render 中出现，也不能随数据改变调用次数。

下面的组件在 `enabled` 为 `true` 时调用 `useState`，为 `false` 时不调用：

```tsx
import { useState } from 'react'

type CourseEditorProps = {
  enabled: boolean
}

// 错误地根据 enabled 决定是否调用 Hook。
function CourseEditor({ enabled }: CourseEditorProps) {
  if (enabled) {
    const [title] = useState('React')
    return <p>{title}</p>
  }

  return null
}
```

当 `enabled` 改变时，这个组件执行的 Hook 序列也改变。React 不能再可靠地把当前调用位置与之前的组件
状态对应起来。Rules of Hooks 用两条规则阻止这类不稳定结构：

1. 只在顶层调用普通 Hook。
2. 只从 React 函数调用普通 Hook。

这里的重点是调用位置。`useState` 的返回值含义不影响位置判断。

## 三、先识别三类函数

### 1. 函数组件

函数组件的名称以大写字母开头，并返回 React 可以渲染的内容。组件通过 JSX 交给 React 调用：

```tsx
// 展示课程标题。
function CourseTitle() {
  return <h2>Hooks 调用规则</h2>
}

// 通过 JSX 把组件交给 React 渲染。
function CoursePage() {
  return <CourseTitle />
}
```

`<CourseTitle />` 表达“让 React 渲染这个组件”。`CourseTitle()` 只是普通 JavaScript 函数调用，会绕过
React 对组件身份和调用时机的管理。

### 2. 自定义 Hook

自定义 Hook 名称以 `use` 开头，后面紧跟大写字母，例如 `useCourseMode`。它可以在自身顶层调用其它
Hook：

```tsx
import { useState } from 'react'

// 提供当前课程视图模式。
function useCourseMode() {
  const [mode] = useState<'list' | 'card'>('list')
  return mode
}

// 读取课程视图模式并输出当前结果。
function CourseView() {
  const mode = useCourseMode()
  return <p>当前模式：{mode}</p>
}
```

名称让读者和静态工具知道该函数可能调用 Hook。名字本身不会让任意调用位置自动合法；
`useCourseMode` 仍然只能在函数组件或另一个自定义 Hook 的顶层调用。

### 3. 普通函数

不调用 Hook 的计算函数不需要 `use` 前缀，也不受 Hook 调用位置限制：

```ts
// 根据数量生成课程统计文本。
function formatCourseCount(count: number) {
  return `共 ${count} 门课程`
}
```

普通函数可以在条件、循环或事件处理器中调用。如果一个函数不调用 Hook，使用 `get`、`format`、
`calculate` 等表达职责的名称比冒用 `use` 前缀更准确。

| 函数类别 | 识别方式 | 可以调用普通 Hook | 正确调用方式 |
| --- | --- | --- | --- |
| 函数组件 | 名称以大写字母开头，返回可渲染内容 | 可以，在函数体顶层 | 通过 JSX 交给 React |
| 自定义 Hook | `use` 后跟大写字母 | 可以，在函数体顶层 | 从组件或另一个 Hook 顶层调用 |
| 普通函数 | 普通职责名称 | 不可以 | 按普通 JavaScript 规则调用 |

## 四、规则一：只在函数体顶层调用普通 Hook

### 1. “顶层”的准确含义

顶层是函数组件或自定义 Hook 的函数体最外层。普通 Hook 调用应当：

- 不在 `if`、`switch`、三元表达式或逻辑短路表达式中；
- 不在 `for`、`while` 或数组迭代回调中；
- 不在可能先执行的条件 `return` 之后；
- 不在嵌套函数、事件处理器或其它 Hook 接收的回调中；
- 不在 `try`、`catch` 或 `finally` 中。

“顶层”不是 JavaScript 模块顶层。直接在导入语句之后调用 `useState` 同样非法，因为调用没有发生在
React 正在 render 的组件或 Hook 中。

### 2. 合法的顶层调用

```tsx
import { useState } from 'react'

type CourseSummaryProps = {
  visible: boolean
}

// 始终先调用 Hook，再根据 visible 决定渲染结果。
function CourseSummary({ visible }: CourseSummaryProps) {
  const [title] = useState('React 基础')

  if (!visible) {
    return null
  }

  return <p>{title}</p>
}
```

无论 `visible` 是什么，`useState` 都在同一个位置执行。条件只影响返回的 UI，不影响 Hook 调用序列。

### 3. 条件需要放在 Hook 调用之外

条件需求不等于条件调用 Hook。常用修正有三种：

1. 无条件调用 Hook，在调用之后根据条件计算或返回 UI。
2. 如果每个分支需要独立的一组 Hook，把分支提取为不同组件。
3. 如果条件控制用户动作，把条件放进事件处理器，Hook 仍留在组件顶层。

选择哪种写法取决于 UI 是否需要不同组件身份，而不是为了绕过 lint。

## 五、提前返回不能改变 Hook 序列

### 1. Hook 不能位于条件返回之后

提前返回本身是正常的 React 写法，问题在于它是否会跳过普通 Hook。如果 `ready` 为 `false` 时先返回，
而 `useState` 位于返回语句之后，这次 render 调用零个 Hook；`ready` 为 `true` 时却调用一个。即使某个值
当前似乎不会改变，这种源码结构仍违反规则。

### 2. 把 Hook 移到所有条件返回之前

判断提前返回是否安全时，查看它上方和下方是否存在普通 Hook。普通 Hook 先在组件顶层固定调用，再由
条件决定返回加载提示、空内容或正常 UI。这样每条返回路径都经过同一组 Hook，条件只改变渲染结果。

## 六、循环和列表中的 Hook

### 1. 固定次数的循环也不允许

普通 Hook 不能写在 `for`、`while` 或 `do...while` 中。即使循环当前固定执行三次，调用位置仍由循环
结构产生；以后修改边界时也很容易无意改变调用次数。数组的 `map`、`filter`、`forEach` 回调同样是
嵌套函数，不是组件顶层。

### 2. 每个列表项需要状态时提取组件

列表项需要独立 Hook 时，把单项提取为组件，由列表回调只创建 `<CourseRow />` 元素。列表长度可以变化，
因为父组件没有在循环中调用 Hook；每个 `CourseRow` 都由 React 独立 render，各自执行固定的 Hook 序列。

## 七、嵌套函数和事件处理器不是 Hook 调用位置

### 1. 事件处理器在 render 之后执行

React render 组件时会调用组件函数；事件处理器在用户交互发生后执行，不处于组件 render 调用链中，
所以不能在其中调用 Hook。Hook 留在组件顶层，事件处理器只使用当前 render 已经取得的值或操作函数。

### 2. 普通嵌套函数和回调也不合法

下列位置都属于嵌套函数：

- 组件内部定义的普通 helper；
- 传给 `map`、`filter` 或 `forEach` 的回调；
- 传给 `useMemo`、`useReducer` 或 `useEffect` 的函数；
- 定时器、Promise 回调和浏览器 listener。

这些函数可能在不同时间、不同次数或不同条件下运行。需要使用另一个 Hook 时，应在组件或自定义 Hook
顶层调用，再把得到的普通值交给回调。

## 八、规则二：只从 React 函数调用普通 Hook

### 1. 模块顶层和普通函数都不合法

模块加载和普通工具函数执行时，React 不一定正在 render 某个组件。模块顶层适合声明常量、类型和纯工具
函数；需要组件局部的 React 能力时，只在函数组件或自定义 Hook 中调用对应 Hook。

### 2. 组件不能当普通函数直接调用

`CoursePanel()` 是普通 JavaScript 调用，可能让组件内部的 Hook 混入调用方序列，也会丢失独立组件
身份。组件组合应写成 `<CoursePanel />`，由 React 决定调用时机并维护组件边界。

### 3. Hook 不作为普通值动态传递

Hook 调用应静态写在组件或自定义 Hook 中。不要把某个 Hook 作为 prop 传入、根据条件选择一个 Hook，
也不要在 render 时临时创建高阶 Hook。静态调用让当前函数可能使用的 React 能力可以从源码直接看出，
也减少条件选择破坏调用规则的机会。

如果行为需要变化，让同一个 Hook 接收普通参数，或者在组件边界上选择不同组件。不要动态替换被调用的
Hook 函数。

## 九、稳定调用顺序的心智模型

### 1. React 按调用位置对应多次 render

考虑一个始终执行三个 Hook 的组件：

```tsx
import { useState } from 'react'

// 以固定顺序读取课程名称、页码和筛选条件。
function CourseReader() {
  const [name] = useState('React')
  const [page] = useState(1)
  const [filter] = useState('全部')

  return <h2>{name} · {filter} · 第 {page} 页</h2>
}
```

可以把公开规则理解为一张顺序表：

| 调用位置 | 第一次 render | 后续 render |
| --- | --- | --- |
| 1 | 名称对应的 `useState` | 仍是名称对应的 `useState` |
| 2 | 页码对应的 `useState` | 仍是页码对应的 `useState` |
| 3 | 筛选条件对应的 `useState` | 仍是筛选条件对应的 `useState` |

变量名不是 React 建立对应关系的依据。关键是同一组件实例每次 render 都按相同顺序调用相同的普通
Hooks。

### 2. 条件调用会让后续位置错位

如果第一个 `useState` 只在某个条件下执行，那么条件关闭时，原本位于第二个位置的 Hook 会移动到第一
个调用位置。后续 Hook 也会依次错位。React 可能报告调用过多或过少，也可能出现 State 对应错误。

课程代码不应依赖 React 当前内部如何保存这些位置。稳定调用序列是应用能够依赖的公共合同；数组下标、
链表节点、dispatcher 或 Fiber 字段都不是应用 API。

### 3. 组件实例之间相互独立

同一种组件可以渲染多次，每个实例都拥有自己的 Hook 序列。父组件用列表创建多个 `<CourseRow />` 是
合法的，因为 React 分别 render 每个子组件。非法的是父组件自己在 `map` 回调中直接调用 Hook。

## 十、rules-of-hooks lint 的作用

### 1. 在运行前发现常见结构错误

`eslint-plugin-react-hooks` 的 `rules-of-hooks` 规则静态分析源码，识别常见 Hook 名、组件名和代码路径。
它可以报告：

- 条件或循环中的普通 Hook；
- 提前返回之后的普通 Hook；
- 回调、事件处理器和普通函数中的普通 Hook；
- class 方法或模块顶层的普通 Hook；
- `use` 位于 `try/catch` 的特殊错误。

静态反馈能把许多错误提前到编辑器或检查命令中。不要通过禁用规则来保留不稳定调用结构；应修改代码，
让调用位置本身满足合同。

### 2. 命名约定帮助静态识别

组件名以大写字母开头，自定义 Hook 名以 `use` 加大写字母开头。`useCourseData` 会被识别为 Hook，
`userData` 不会仅因为以三个字母 `use` 开头而被当作 Hook。

命名约定同时服务于读者和工具。把调用 Hook 的函数错误命名为 `getCourseData`，会隐藏它的 React 函数
身份；把纯计算函数随意命名为 `useSortedCourses`，则会制造不必要的调用限制和误解。

### 3. lint 只证明可静态识别的结构

`rules-of-hooks` 不会执行应用，也不验证某个 Hook 的业务逻辑和返回值使用。lint 通过只表示没有发现它
能够识别的调用结构错误，不能证明运行时执行一定正确；运行时出现错误也不能直接反推调用位置必然违规。

## 十一、React use API 的窄例外

### 1. use 不是普通 Hook

React `use` API 可以读取 Promise 或 Context。官方 API Reference 明确说明：尽管名称是 `use`，它不是
Hook。它可以出现在条件和循环中：

```tsx
import { use } from 'react'

type CourseTitleProps = {
  shouldRead: boolean
  titlePromise: Promise<string>
}

// 只在需要显示标题时读取课程标题资源。
function CourseTitle({ shouldRead, titlePromise }: CourseTitleProps) {
  if (!shouldRead) {
    return <p>暂不读取标题</p>
  }

  const title = use(titlePromise)
  return <h2>{title}</h2>
}
```

这里的条件调用只适用于官方 `use(resource)`。不能据此条件调用 `useState`、`useEffect`、`useContext`
或自定义 Hook。

### 2. 例外没有取消 React 函数边界

`use` 仍然必须在组件或 Hook 中调用。它不能放在模块顶层、普通工具函数或事件处理器中。条件和循环
例外只放宽函数内部的控制流位置，不放宽调用它的函数类别。

### 3. use 不能放进 try/catch

即使 `use` 可以条件调用，它也不能被 `try/catch` 包裹。读取 Promise 时，等待状态由 Suspense 边界
处理，拒绝结果由 Error Boundary 处理。不要用局部 `try/catch` 截获 `use` 的挂起或拒绝行为。

这一限制也是 `rules-of-hooks` 对 `use` 的专门检查之一。

## 十二、常用修正方法

### 1. 无条件调用，再处理条件

先把普通 Hook 放在组件顶层，再用条件决定普通计算、事件行为或返回 UI。这个方法适合各分支仍属于同一
组件身份的情况。

### 2. 提取独立子组件

列表项、不同页面分支或可选区域需要独立 State 时，把它们提取为组件并通过 JSX 渲染。每个组件拥有
自己的固定 Hook 序列，父组件只决定是否创建对应元素。

### 3. 条件放进事件处理器或普通计算

如果条件只决定点击后是否执行某个操作，把条件放进事件处理器；如果条件只决定显示值，使用普通
JavaScript 计算。Hook 本身继续位于组件顶层。

### 4. 修正函数身份和名称

- 调用 Hook 的可复用函数应成为 `useXxx` 自定义 Hook，并只从 React 函数顶层调用。
- 不调用 Hook 的函数应保留普通名称，可以按 JavaScript 规则使用。
- 返回 JSX 并承担组件身份的函数使用大写名称，通过 JSX 调用。

重命名不能替代结构修正。函数即使叫 `useSomething`，在事件处理器中调用仍然非法。

## 十三、易错使用提示

:::pitfalls
### 错误：在提前返回之后调用 Hook

**触发条件：** loading 分支先返回，Hook 写在返回语句之后。

**原因：** loading 状态会决定 Hook 是否执行。

**后果：** 不同 render 的调用数量不一致。

**错误示例：**

~~~~tsx
import { useState } from 'react'

// 错误地让 loading 分支跳过 Hook。
function CoursePage({ loading }: { loading: boolean }) {
  if (loading) return <p>加载中</p>
  const [title] = useState('React')
  return <h2>{title}</h2>
}
~~~~

**正确写法：** 把 Hook 移到所有条件返回之前。

~~~~tsx
import { useState } from 'react'

// 固定调用 Hook，再处理 loading 分支。
function CoursePage({ loading }: { loading: boolean }) {
  const [title] = useState('React')
  if (loading) return <p>加载中</p>
  return <h2>{title}</h2>
}
~~~~

**验证方式：** loading 两种取值下，Hook 调用位置和数量完全相同。

### 错误：在列表回调中调用 Hook

**触发条件：** 在 `map` 回调中为每个元素调用 `useState`。

**原因：** 回调是嵌套函数，列表长度还会改变调用次数。

**后果：** 父组件的 Hook 序列随数据长度变化。

**错误示例：**

~~~~tsx
import { useState } from 'react'

// 错误地在列表回调中调用 Hook。
function CourseList({ titles }: { titles: readonly string[] }) {
  return (
    <ul>
      {titles.map(
        // 每次回调都会在循环结构中调用 Hook。
        (title) => {
          const [selected] = useState(false)
          return <li key={title}>{selected ? '已选' : '未选'}：{title}</li>
        },
      )}
    </ul>
  )
}
~~~~

**正确写法：** 提取由 React 单独 render 的行组件。

~~~~tsx
import { useState } from 'react'

// 为单个课程标题维护稳定的 Hook 序列。
function CourseRow({ title }: { title: string }) {
  const [selected] = useState(false)
  return <li>{selected ? '已选' : '未选'}：{title}</li>
}

// 通过行组件渲染课程列表。
function CourseList({ titles }: { titles: readonly string[] }) {
  // 把当前标题转换为课程行元素。
  function renderTitle(title: string) {
    return <CourseRow key={title} title={title} />
  }

  return <ul>{titles.map(renderTitle)}</ul>
}
~~~~

**验证方式：** 改变列表长度时，每个 `CourseRow` 仍各自执行一个固定 Hook。

### 错误：在事件处理器中调用 Hook

**触发条件：** 点击后才调用 `useState`。

**原因：** 事件处理器不在 React render 的组件调用过程中执行。

**后果：** React 没有合法的组件 Hook 上下文。

**错误示例：**

~~~~tsx
import { useState } from 'react'

// 错误地在事件处理器中调用 Hook。
function CourseButton() {
  // 点击后尝试创建状态。
  function handleClick() {
    const [open] = useState(false)
    console.info(open)
  }

  return <button onClick={handleClick}>查看</button>
}
~~~~

**正确写法：** 在组件顶层调用 Hook，事件处理器使用已有值。

~~~~tsx
import { useState } from 'react'

// 在合法位置取得状态并连接点击处理。
function CourseButton() {
  const [open] = useState(false)

  // 点击后读取当前 render 的状态值。
  function handleClick() {
    console.info(open)
  }

  return <button onClick={handleClick}>查看</button>
}
~~~~

**验证方式：** Hook 在 render 时固定执行，点击只运行事件处理器。

### 错误：从普通函数或模块顶层调用 Hook

**触发条件：** 把 Hook 放进工具函数，或直接写在模块作用域。

**原因：** 两个位置都不是 React 正在调用的函数组件或自定义 Hook。

**后果：** 运行时可能报告无效 Hook 调用。

**错误示例：**

~~~~tsx
import { useState } from 'react'

// 错误：模块初始化期间调用 Hook。
const [sharedTitle] = useState('React')

// 错误地从普通函数读取 Hook。
function getTitle() {
  const [title] = useState(sharedTitle)
  return title
}
~~~~

**正确写法：** 普通函数保持普通计算，Hook 留在组件顶层。

~~~~tsx
import { useState } from 'react'

// 格式化普通标题文本。
function formatTitle(title: string) {
  return `课程：${title}`
}

// 在组件顶层调用 Hook，并把值交给普通函数。
function CourseTitle() {
  const [title] = useState('React')
  return <h2>{formatTitle(title)}</h2>
}
~~~~

**验证方式：** 搜索 Hook 调用，只出现在组件或自定义 Hook 的函数体顶层。

### 错误：直接调用包含 Hook 的组件函数

**触发条件：** 在 JSX 中写 `{CoursePanel()}`。

**原因：** 普通函数调用绕过 React 对独立组件身份和调用时机的管理。

**后果：** 被调用组件的 Hook 可能混入调用方的序列。

**错误示例：**

~~~~tsx
import { useState } from 'react'

// 展示带局部状态的课程面板。
function CoursePanel() {
  const [title] = useState('React')
  return <section>{title}</section>
}

// 错误地直接执行组件函数。
function Page() {
  return <main>{CoursePanel()}</main>
}
~~~~

**正确写法：** 使用 JSX 让 React 调用组件。

~~~~tsx
import { useState } from 'react'

// 展示带局部状态的课程面板。
function CoursePanel() {
  const [title] = useState('React')
  return <section>{title}</section>
}

// 通过 JSX 组合课程面板。
function Page() {
  return <main><CoursePanel /></main>
}
~~~~

**验证方式：** 组件使用位置是 JSX 元素，不是普通调用表达式。

### 错误：把 use 例外推广给普通 Hook

**触发条件：** 因为 `use` 可条件调用，就把 `useState` 也写进条件。

**原因：** `use` 是官方 React API 的窄例外，不是普通 Hook。

**后果：** 普通 Hook 的调用顺序仍然被破坏。

**错误示例：**

~~~~tsx
import { useState } from 'react'

// 错误地把 use 的条件例外用于 useState。
function CourseLabel({ visible }: { visible: boolean }) {
  if (visible) {
    const [label] = useState('React')
    return <span>{label}</span>
  }
  return null
}
~~~~

**正确写法：** 普通 Hook 始终顶层调用，条件只控制 UI。

~~~~tsx
import { useState } from 'react'

// 固定调用普通 Hook，再决定是否显示标签。
function CourseLabel({ visible }: { visible: boolean }) {
  const [label] = useState('React')
  return visible ? <span>{label}</span> : null
}
~~~~

**验证方式：** 只允许官方 `use(resource)` 使用条件或循环例外。

### 错误：把 use 放进 try/catch

**触发条件：** 用局部 `try/catch` 包裹 `use(titlePromise)`。

**原因：** 官方明确禁止 `use` 位于 `try/catch`，lint 也会单独报告。

**后果：** 代码违反 `use` 的剩余调用限制。

**错误示例：**

~~~~tsx
import { use } from 'react'

// 错误地用 try/catch 包裹 use。
function CourseTitle({ titlePromise }: { titlePromise: Promise<string> }) {
  try {
    const title = use(titlePromise)
    return <h2>{title}</h2>
  } catch {
    return <p>读取失败</p>
  }
}
~~~~

**正确写法：** 在组件中直接调用 `use`，由外部边界承担等待和错误显示。

~~~~tsx
import { use } from 'react'

// 在组件边界内直接读取标题资源。
function CourseTitle({ titlePromise }: { titlePromise: Promise<string> }) {
  const title = use(titlePromise)
  return <h2>{title}</h2>
}
~~~~

**验证方式：** `use` 不位于 `try`、`catch` 或 `finally` 语句块。
:::

## 十四、原理与适用场景

### 1. 先判断函数身份，再判断语法位置

检查 Hook 调用时按以下顺序判断：

1. 当前函数是函数组件、自定义 Hook，还是普通函数。
2. 组件是否由 React 通过 JSX 调用。
3. Hook 是否位于函数体顶层和所有条件返回之前。
4. 调用是否被条件、循环、嵌套函数或异常处理包围。
5. 当前调用是否确实是官方 `use` 例外。

这个顺序能区分“函数类别不合法”和“函数内位置不合法”，避免只移动一行代码却保留另一个问题。

### 2. 纯度和调用规则是不同合同

一个函数可以没有副作用，却仍然在条件中非法调用 Hook；一个 Hook 也可以位于合法顶层，却在 render 中
执行了不允许的副作用。纯度回答“render 中做什么”，Rules of Hooks 回答“Hook 在哪里调用”。两项都要
满足，不能互相替代。

### 3. 静态结构优先于运行时猜测

不要以“这个条件永远为真”“数组长度固定”“事件只点一次”为理由保留违规代码。规则检查的是源码结构，
因为未来输入、需求和重构都可能改变当前假设。把调用结构写正确，比依赖运行时偶然稳定更可靠。

## 十五、练习

:::exercise
### 修正课程面板的 Hook 调用位置

**要求：** 给定一个课程面板，其中包含 loading 提前返回、按 `enabled` 条件调用 `useState`、在
`courses.map` 回调中调用 Hook，以及点击处理器内调用 Hook。先逐项标注每处违反的是函数边界还是顶层
位置，再完成以下重构：所有普通 Hook 位于合法顶层；列表项提取为独立组件；事件处理器只使用组件已经
取得的值；组件全部通过 JSX 调用。最后增加一个只用于判断调用位置的 `use(titlePromise)` 条件示例。

**验收：** 每个组件或自定义 Hook 在任意 render 中执行相同的普通 Hook 序列；不存在模块顶层、普通
函数、条件、循环回调、提前返回之后或事件处理器中的普通 Hook；`use` 只在组件内条件调用，且不位于
`try/catch/finally`；所有组件均使用 JSX；能够说明 `rules-of-hooks` lint 的静态检查边界。
:::

## 十六、本节小结

- 普通 Hook 只在函数组件或自定义 Hook 的函数体顶层调用。
- 每次 render 必须调用相同的普通 Hooks，并保持完全相同的顺序。
- 条件、循环、提前返回之后、嵌套函数、事件处理器和模块顶层都不是合法位置。
- 组件名称以大写字母开头并通过 JSX 调用；自定义 Hook 以 `use` 加大写字母命名。
- 列表项需要独立 Hook 时提取组件，不在 `map` 回调中调用 Hook。
- `rules-of-hooks` 只检查可静态识别的调用结构，不能证明运行时执行一定正确。
- 官方 `use` 不是普通 Hook，可在条件和循环中调用，但仍受 React 函数边界和 `try/catch` 限制。

## 十七、参考资料

- [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- [React calls Components and Hooks](https://react.dev/reference/rules/react-calls-components-and-hooks)
- [Hook names always start with use](https://react.dev/learn/reusing-logic-with-custom-hooks#hook-names-always-start-with-use)
- [rules-of-hooks lint](https://react.dev/reference/eslint-plugin-react-hooks/lints/rules-of-hooks)
- [`use` API Reference](https://react.dev/reference/react/use)
