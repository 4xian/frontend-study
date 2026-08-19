---
id: react.core.learn.basics.conditional-rendering
type: lesson
title: 条件渲染
summary: 从零理解 React 怎样使用 JavaScript 条件选择 JSX、文本或空节点，并避开数字 0 泄漏等常见错误。
domain: frontend
technology: react
module: core
stage: basics
level: beginner
estimatedMinutes: 70
prerequisites:
  - react.core.learn.basics.children-and-composition
related: []
tags:
  - React
  - 条件渲染
  - if
  - 三元表达式
  - 逻辑与
  - 'null'
  - TypeScript narrowing
appliesTo: React 19.2（运行时 19.2.8）、TypeScript 6.0.3
verifiedAt: 2026-08-15
objectives:
  - 能解释条件渲染为什么是普通 JavaScript 选择 ReactNode，而不是 React 专属模板语法。
  - 能根据分支结构选择 if、提前 return、条件变量、三元表达式或逻辑与。
  - 能区分 false、null、undefined、数字 0 与空字符串在条件和 React 输出中的不同结果。
  - 能用明确的 boolean 比较避免 count && node 泄漏数字 0。
  - 能用 TypeScript 控制流收窄安全访问分支数据，并避免 truthiness 误排除合法值。
recap:
  - React 条件渲染先执行普通 JavaScript 判断，再处理被选中的 ReactNode。
  - 整块结构不同用 if 或提前 return，同一位置二选一用三元，只有 boolean 真分支时才考虑逻辑与。
  - 逻辑与返回原始操作数；0 会显示，数字条件应写成 count > 0 等明确比较。
  - 有意不输出 UI 时明确返回 null；页面区域是否存在通常由拥有布局的父组件决定。
  - TypeScript 收窄帮助安全读取分支字段，但不能替代业务条件设计。
sources:
  - title: React Conditional Rendering
    url: https://react.dev/learn/conditional-rendering
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - if、null、条件变量、三元表达式与逻辑与的条件渲染方式
      - 数字位于逻辑与左侧时会显示 0
      - 父组件条件包含与重复 JSX 的可读性边界
  - title: React Quick Start
    url: https://react.dev/learn
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - React 使用普通 JavaScript if、三元表达式与逻辑与处理条件
  - title: React Types 19.2.18
    url: https://cdn.jsdelivr.net/npm/@types/react@19.2.18/index.d.ts
    sourceType: source-code
    appliesTo: '@types/react 19.2.18'
    claims:
      - ReactNode 中字符串、数字、布尔值、null 与 undefined 的类型边界
  - title: TypeScript Narrowing
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
    sourceType: official-reference
    appliesTo: TypeScript 6.0
    claims:
      - typeof 收窄、控制流分析、可达性、可辨识联合与 truthiness narrowing
  - title: ECMAScript Conditional Operator
    url: https://tc39.es/ecma262/multipage/ecmascript-language-expressions.html#sec-conditional-operator
    sourceType: specification
    appliesTo: ECMAScript
    claims:
      - 三元表达式只求值并返回一个分支
  - title: ECMAScript Binary Logical Operators
    url: https://tc39.es/ecma262/multipage/ecmascript-language-expressions.html#sec-binary-logical-operators
    sourceType: specification
    appliesTo: ECMAScript
    claims:
      - 逻辑与的规范求值、ToBoolean 与操作数返回语义
---

# 条件渲染

## 一、学习目标

- 理解 React 没有专用条件模板语法，条件由普通 JavaScript 决定。
- 掌握 `if`、提前 `return`、条件变量、三元表达式、`&&` 和 `return null`。
- 区分 JavaScript 的 truthy / falsy 与 ReactNode 是否可见这两层规则。
- 避免 `0 && <Node />` 把数字 `0` 渲染到页面。
- 使用 TypeScript 分支收窄安全读取当前状态的数据。

## 二、为什么需要条件渲染

同一个组件常常要根据输入展示不同内容：课程可用时显示入口，维护时显示原因，权限不足时不显示内部
提示。把所有结果同时写进页面，再依靠样式遮住其中一部分，并没有表达“这次 UI 应该包含什么”。
条件渲染直接选择本次返回的 React node：

```tsx
type AccessBadgeProps = {
  isAdmin: boolean
}

// 根据管理员标记选择一个访问级别标签。
function AccessBadge({ isAdmin }: AccessBadgeProps) {
  if (isAdmin) {
    return <strong>管理员</strong>
  }

  return <span>普通成员</span>
}
```

这里的 `if` 是 JavaScript，不是 React 新增的语法。组件先执行判断并得到一个结果，React 再处理这个
结果。条件可以来自 Props，也可以来自组件根据当前输入计算出的值。

## 三、最小心智模型

条件渲染可以拆成两步：

```text
当前输入
  -> JavaScript 计算条件并选择一个值
  -> React 把被选中的 ReactNode 变成当前 UI
```

这两步不能混为一谈。以 `count && <Notice />` 为例：

1. JavaScript 先计算 `&&`，它返回某个原始操作数，不保证返回 boolean。
2. React 再处理结果；`false` 是空节点，数字 `0` 却会显示为文本。

因此，阅读条件 JSX 时不要只问“条件是真是假”，还要问“完整 JavaScript 表达式最终返回了什么”。

## 四、if、else 与提前 return

### 1. 整块结构不同时使用 if

两个分支的结构明显不同时，先在 `return` 前判断最直接：

```tsx
type ResultPanelProps = {
  hasResult: boolean
}

// 根据是否有结果返回完整结果区或空状态区。
function ResultPanel({ hasResult }: ResultPanelProps) {
  if (hasResult) {
    return (
      <section>
        <h2>查询结果</h2>
        <p>已找到可用内容。</p>
      </section>
    )
  }

  return <p>暂无结果</p>
}
```

`if` 是 statement，不能直接放进 JSX 的 `{}`。花括号接收 expression；需要在 JSX 内二选一时，使用
三元表达式，或先把结果计算到变量中。

### 2. 提前 return 表达 guard

一个条件表示“后续正常内容不成立”时，可以先返回特殊结果：

```tsx
type LessonSummaryProps = {
  isUnavailable: boolean
  title: string
}

// 在课程不可用时提前返回，否则显示正常摘要。
function LessonSummary({ isUnavailable, title }: LessonSummaryProps) {
  if (isUnavailable) {
    return <p>课程暂不可用</p>
  }

  return <h2>{title}</h2>
}
```

前一个分支已经结束函数，后续路径只处理正常情况，不需要再套一层 `else`。缺少必要输入、权限不满足
或整块 UI 使用另一套结构时，提前 return 通常容易扫描。

### 3. else 不是错误

React 官方没有规定提前 return、`if / else`、三元或变量的固定优先级。两个分支需要并列阅读时，
`if / else` 完全有效。选择标准是每个条件对应的 UI 是否清楚，不是代码是否最短。

### 4. 使用 else if 表达多个互斥结果

超过两个互斥结果时，可以按业务优先级连续判断：

```tsx
type AccessLevel = 'admin' | 'member' | 'guest'

type AccessLabelProps = {
  level: AccessLevel
}

// 按访问级别选择一个明确的标签。
function AccessLabel({ level }: AccessLabelProps) {
  if (level === 'admin') {
    return <strong>管理员</strong>
  } else if (level === 'member') {
    return <span>成员</span>
  }

  return <span>访客</span>
}
```

每条路径只返回一个结果，最后的默认路径处理剩余值。若分支主体较长，也可以改成多个提前 `return`，
避免让缩进掩盖条件顺序。

## 五、先把条件结果保存到变量

外层结构相同、只有一个区域变化时，可以先计算一个 `ReactNode`：

```tsx
import type { ReactNode } from 'react'

type CourseStatusProps = {
  isComplete: boolean
  title: string
}

// 先计算状态区域，再复用一份课程外壳。
function CourseStatus({ isComplete, title }: CourseStatusProps) {
  let statusContent: ReactNode = <span>学习中</span>

  if (isComplete) {
    statusContent = <strong>已完成</strong>
  }

  return (
    <article>
      <h2>{title}</h2>
      {statusContent}
    </article>
  )
}
```

条件变量适合以下情况：

- 共享外壳和大部分内容不变。
- 条件结果会插入一个明确位置。
- 条件分支有多行判断或赋值，三元会变得拥挤。
- 变量名能说明职责，例如 `statusContent`，而不是 `temp`。

变量只属于当前函数调用。

## 六、三元表达式

### 1. 在同一位置二选一

三元表达式的结构是：

```text
condition ? expressionWhenTruthy : expressionWhenFalsy
```

它是 expression，可以放入 JSX 花括号：

```tsx
type AvailabilityProps = {
  isAvailable: boolean
}

// 在同一位置显示可用或维护中的标签。
function Availability({ isAvailable }: AvailabilityProps) {
  return <p>{isAvailable ? <strong>可学习</strong> : <span>维护中</span>}</p>
}
```

JavaScript 只求值其中一个结果表达式。React 接收到的是被选中的 `ReactNode`，不是条件表达式的两条
分支同时存在。

### 2. 显示一个结果或明确的空节点

```tsx
type OptionalBadgeProps = {
  showBadge: boolean
}

// 显式选择推荐徽标或空节点。
function OptionalBadge({ showBadge }: OptionalBadgeProps) {
  return <div>{showBadge ? <strong>推荐</strong> : null}</div>
}
```

`condition ? node : null` 比 `&&` 更长，但假分支非常明确，也不会把非 boolean 条件的原值意外返回给
React。

### 3. 不把业务规则藏进嵌套三元

一个短三元适合两个简单结果。多个三元连续嵌套时，读者很难快速判断每个 `:` 属于哪个条件。此时
改用提前 return、命名变量或职责清楚的子组件。React 没有规定绝对层数；判断依据是分支是否还能被
快速解释。

## 七、逻辑与 &&

### 1. 只有真分支时的短写法

```tsx
type FeaturedMarkProps = {
  isFeatured: boolean
}

// 只在课程被推荐时显示标记。
function FeaturedMark({ isFeatured }: FeaturedMarkProps) {
  return <p>{isFeatured && <strong>推荐课程</strong>}</p>
}
```

左侧为 `true` 时，`&&` 返回右侧 element；左侧为 `false` 时，结果是 `false`，React 把它当作空节点。
这种写法适合左侧本来就是 boolean、且假分支确实不需要任何内容的情况。

### 2. && 返回操作数，不返回固定 boolean

JavaScript 从左向右计算 `&&`：遇到第一个 falsy 操作数就原样返回，否则返回最后一个操作数。

| 表达式 | JavaScript 结果 | React 可见结果 |
| --- | --- | --- |
| `false && <Badge />` | `false` | 空节点，不显示。 |
| `null && <Badge />` | `null` | 空节点，不显示。 |
| `undefined && <Badge />` | `undefined` | 空节点，不显示。 |
| `0 && <Badge />` | `0` | 显示文本 `0`。 |
| `'' && <Badge />` | `''` | 没有可见字符。 |
| `2 && <Badge />` | `<Badge />` | 显示右侧 element。 |
| `-1 && <Badge />` | `<Badge />` | 负数也是 truthy。 |

“falsy”只描述 JavaScript 在布尔上下文中的判断，不等于“React 一定不显示”。`0` 是最常见的反例。

### 3. 数字条件必须表达业务含义

错误写法：

```tsx
type InboxNoticeProps = {
  messageCount: number
}

// 错误：零会成为最终 ReactNode 并显示出来。
function InboxNotice({ messageCount }: InboxNoticeProps) {
  return <div>{messageCount && <p>有新消息</p>}</div>
}
```

正确写法：

```tsx
type SafeInboxNoticeProps = {
  messageCount: number
}

// 使用正数判断表达“确实有消息”。
function SafeInboxNotice({ messageCount }: SafeInboxNoticeProps) {
  return <div>{messageCount > 0 && <p>有新消息</p>}</div>
}
```

`Boolean(messageCount)` 或 `!!messageCount` 虽然不会泄漏 `0`，却会把 `-1` 视为 true。若业务含义是
“消息数大于零”，`messageCount > 0` 更准确。

## 八、null 与其他空结果

### 1. 有意不输出 UI 时返回 null

```tsx
type InternalHintProps = {
  isVisible: boolean
}

// 在提示不可见时明确返回空节点。
function InternalHint({ isVisible }: InternalHintProps) {
  if (!isVisible) {
    return null
  }

  return <p>仅供内部查看</p>
}
```

`null` 清楚表达“这个组件本次没有 UI”。不要依赖漏写 `return` 得到偶然的 `undefined`；读者无法判断
这是隐藏意图还是遗漏。

### 2. false、null、undefined、0 与空字符串

| 值 | ReactNode 类型边界 | 可见结果 |
| --- | --- | --- |
| `false` | 合法 ReactNode | 空节点，不显示。 |
| `null` | 合法 ReactNode | 空节点，常用于明确表达没有 UI。 |
| `undefined` | 合法 ReactNode | 作为 child 不显示；不适合代替有意的 `null`。 |
| `0` | number ReactNode | 显示文本 `0`。 |
| `''` | string ReactNode | 没有可见字符。 |
| 非空字符串 | string ReactNode | 显示对应文本。 |

空字符串视觉上没有字符，但业务上仍可能表示“值已提供，只是内容为空”；`null` 往往表示“没有值”。
React 不替应用决定两者是否等价。

## 九、谁负责决定组件是否存在

### 1. 子组件根据自己的合同返回 null

```tsx
type PermissionNoteProps = {
  canView: boolean
}

// 在自身显示条件不成立时不输出提示。
function PermissionNote({ canView }: PermissionNoteProps) {
  if (!canView) {
    return null
  }

  return <p>你可以查看该内容。</p>
}
```

这适合“缺少自身必要条件就没有有意义输出”的叶子组件。调用方仍然写了组件，但隐藏规则可能不容易
从父级布局看出。

### 2. 父组件直接决定是否包含

```tsx
type DetailLayoutProps = {
  canViewNote: boolean
}

// 在拥有页面结构的父组件中决定是否包含提示区域。
function DetailLayout({ canViewNote }: DetailLayoutProps) {
  return (
    <section>
      <h2>课程详情</h2>
      {canViewNote ? <PermissionNote canView={true} /> : null}
    </section>
  )
}
```

页面区域是否存在由父级结构决定时，把条件留在父级通常更清楚；组件缺少自身必要输入时，可以在内部
guard 并返回 `null`。选择时应看谁拥有条件，以及谁负责对应区域的结构。

## 十、重复 JSX 与可读性

### 1. 只切换真正不同的部分

若两个分支只有后缀不同，复制整个外壳会让共同属性需要同步修改：

```tsx
type SharedTitleProps = {
  isComplete: boolean
  title: string
}

// 只计算变化的后缀，保留一份标题结构。
function SharedTitle({ isComplete, title }: SharedTitleProps) {
  const suffix = isComplete ? '：已完成' : ''
  return (
    <h2>
      {title}
      {suffix}
    </h2>
  )
}
```

重复 JSX 本身不是语法错误。若两个分支的语义和结构确实不同，完整 `if` 分支比强行拼成一棵共享
结构更易读。减少重复是维护取舍，不是必须遵守的 React 规则。

### 2. 用结构选择写法

| 条件形状 | 优先考虑 | 原因 |
| --- | --- | --- |
| 两块结构明显不同 | `if` 或提前 `return` | 每条路径完整、容易扫描。 |
| 共享外壳中的多行计算 | 条件变量 | JSX 只保留一个有名称的插入点。 |
| 同一位置两个短结果 | 三元表达式 | 真、假分支都明确。 |
| boolean 为真时才有一个短结果 | `&&` | 没有 fallback，写法集中。 |
| 组件明确没有输出 | `return null` | 空结果意图清楚。 |

这张表是可读性建议，不是性能排序或 lint 规则。

## 十一、TypeScript 条件收窄

### 1. 显式排除 null

```tsx
type OptionalLabelProps = {
  text: string | null
}

// 只排除 null，并在剩余路径中安全使用 string。
function OptionalLabel({ text }: OptionalLabelProps) {
  if (text === null) {
    return null
  }

  return <span>{text.toUpperCase()}</span>
}
```

`text === null` 只排除 `null`，不会误排除合法的空字符串。若写成 `if (!text)`，TypeScript 会按
JavaScript truthiness 处理，业务上可能把 `''` 与 `null` 合并。

### 2. 使用 typeof 区分基础类型

联合类型中的不同成员需要不同操作时，可以在条件分支中用 `typeof` 收窄：

```tsx
type MetricValueProps = {
  value: string | number
}

// 根据基础类型选择格式化方式和显示结构。
function MetricValue({ value }: MetricValueProps) {
  if (typeof value === 'number') {
    return <strong>{value.toFixed(1)}</strong>
  }

  return <span>{value.toUpperCase()}</span>
}
```

`typeof value === 'number'` 的分支中，`value` 可以调用数字方法；该分支已经 `return` 后，剩余路径中的
`value` 被收窄为 `string`。这就是控制流和可达性共同产生的收窄结果。

### 3. 使用可辨识联合表达互斥数据

```tsx
type CourseResult =
  | { status: 'ready'; title: string }
  | { status: 'unavailable'; reason: string }

type CourseResultViewProps = {
  result: CourseResult
}

// 根据可辨识字段收窄，并只读取当前分支拥有的数据。
function CourseResultView({ result }: CourseResultViewProps) {
  if (result.status === 'unavailable') {
    return <p>{result.reason}</p>
  }

  return <h2>{result.title}</h2>
}
```

分支中的 `result` 只保留当前状态对应的字段，避免访问不存在的数据。提前返回后，剩余路径也会排除
已经处理的联合成员。

### 4. 类型通过不代表条件符合业务

TypeScript 能证明某条路径里的值属于哪种类型，不能证明 `count &&` 是否表达“数量大于零”。数字 `0`
泄漏通常不会成为类型错误。类型检查解决安全访问，明确比较解决业务语义，两者职责不同。

## 十二、Demo：比较条件写法与输出边界

下面的 Demo 使用固定 Props 并排展示不同分支。重点观察：

- `if` 怎样返回两套完整结构。
- 三元表达式怎样在同一位置二选一。
- `0 && <Node />` 为什么显示 `0`，`0 > 0 && <Node />` 为什么为空。
- 组件 `return null` 后，对应位置没有可见内容。

:::demo{id="react.core.learn.basics.conditional-rendering.branch-selection-demo"}
:::

## 十三、易错使用提示

:::pitfalls

### 错误：在 JSX 花括号中直接写 if

**触发条件：** 把 `if` statement 当作 JSX expression。

**原因：** JSX 花括号接收 expression，`if` 本身不会产生一个可嵌入值。

**后果：** TSX 语法无法通过，条件也没有形成合法的 ReactNode。

**错误示例：**

```tsx
// 错误：if 不能直接放进 JSX 花括号。
function InvalidStatus() {
  return <div>{if (ready) { <strong>就绪</strong> }}</div>
}
```

**正确写法：** 在 `return` 之前判断，或使用三元表达式。

```tsx
// 使用三元表达式在同一位置选择状态。
function ValidStatus({ ready }: { ready: boolean }) {
  return <div>{ready ? <strong>就绪</strong> : <span>准备中</span>}</div>
}
```

**验证方式：** 分别传入 `true` 与 `false`，确认两条路径各产生一个明确结果。

### 错误：把数字直接放在 && 左侧

**触发条件：** 使用 `{count && <Notice />}` 控制数量提示。

**原因：** `&&` 返回首个 falsy 操作数，`count` 为 `0` 时结果就是数字 `0`。

**后果：** 页面在没有数据时意外显示一个 `0`。

**错误示例：**

```tsx
// 错误：零会被 React 当作数字节点显示。
function UnsafeCount({ count }: { count: number }) {
  return <div>{count && <strong>有内容</strong>}</div>
}
```

**正确写法：** 写出真正的业务比较，而不是依赖数字 truthiness。

```tsx
// 只有数量大于零时才显示提示。
function SafeCount({ count }: { count: number }) {
  return <div>{count > 0 && <strong>有内容</strong>}</div>
}
```

**验证方式：** 输入 `0`、正数与 `-1`，确认只有正数进入提示分支。

### 错误：用 && 表达两个结果

**触发条件：** 条件为假时需要 fallback，却只写右侧真分支。

**原因：** `&&` 只表达“真时取右侧”，不会自动生成另一条 UI。

**后果：** 假分支变成空节点，等待中或不可用提示丢失。

**错误示例：**

```tsx
// 错误：未就绪时没有任何 fallback。
function MissingFallback({ ready }: { ready: boolean }) {
  return <div>{ready && <strong>已就绪</strong>}</div>
}
```

**正确写法：** 使用三元表达式明确写出两个结果。

```tsx
// 明确渲染就绪或准备中状态。
function CompleteFallback({ ready }: { ready: boolean }) {
  return <div>{ready ? <strong>已就绪</strong> : <span>准备中</span>}</div>
}
```

**验证方式：** 检查 `ready` 的 true / false 两路，页面都应有可解释内容。

### 错误：用 truthiness 只想排除 null

**触发条件：** 对 `string | null` 写 `if (!text)`，却希望保留空字符串路径。

**原因：** 空字符串和 `null` 都是 falsy，truthiness 检查会同时排除它们。

**后果：** 合法空字符串被误判为“没有值”，业务语义被合并。

**错误示例：**

```tsx
// 错误：空字符串也会进入空结果分支。
function BroadGuard({ text }: { text: string | null }) {
  if (!text) {
    return null
  }

  return <span>{text}</span>
}
```

**正确写法：** 只排除合同中真正表示缺失的 `null`。

```tsx
// 使用精确 null 检查保留所有 string 值。
function ExactGuard({ text }: { text: string | null }) {
  if (text === null) {
    return null
  }

  return <span>{text}</span>
}
```

**验证方式：** 分别输入 `null`、`''` 和非空字符串，确认三者走向符合合同。

### 错误：用漏写 return 表达隐藏

**触发条件：** 条件不成立时让函数自然结束，不写明确返回值。

**原因：** 偶然得到的 `undefined` 无法说明这是设计意图还是遗漏。

**后果：** 后续维护者难以判断分支是否完整，增加漏渲染风险。

**错误示例：**

```tsx
// 错误：不可见路径没有表达明确的 UI 决策。
function AmbiguousHint({ visible }: { visible: boolean }) {
  if (visible) {
    return <p>内部提示</p>
  }
}
```

**正确写法：** 有意为空时明确返回 `null`。

```tsx
// 明确区分可见内容与空结果。
function ExplicitHint({ visible }: { visible: boolean }) {
  if (!visible) {
    return null
  }

  return <p>内部提示</p>
}
```

**验证方式：** 阅读每条可达路径，确认每个分支都表达了清楚的返回意图。

### 错误：把多个业务状态塞进嵌套三元

**触发条件：** 在一行中连续嵌套多个 `? :`。

**原因：** 条件、真分支和假分支的对应关系难以扫描。

**后果：** 添加或调整状态时容易修改错误分支。

**错误示例：**

```tsx
// 错误倾向：三个角色的优先级藏在嵌套表达式中。
function DenseRole({ admin, member }: { admin: boolean; member: boolean }) {
  return <p>{admin ? '管理员' : member ? '成员' : '访客'}</p>
}
```

**正确写法：** 使用提前 return 按优先级展开判断。

```tsx
// 按业务优先级显式返回角色。
function ClearRole({ admin, member }: { admin: boolean; member: boolean }) {
  if (admin) {
    return <p>管理员</p>
  }

  if (member) {
    return <p>成员</p>
  }

  return <p>访客</p>
}
```

**验证方式：** 输入管理员、成员与访客三种组合，能逐行解释命中的分支。

### 错误：只有小片段不同却复制整个外壳

**触发条件：** 两个分支只差一个后缀，却各自返回完整 element。

**原因：** 共同属性与语义结构被复制成两份。

**后果：** 修改 class、ARIA 或公共文字时可能只更新其中一支。

**错误示例：**

```tsx
// 错误倾向：同一标题结构被复制。
function RepeatedHeading({ done, title }: { done: boolean; title: string }) {
  if (done) {
    return <h2>{title}：已完成</h2>
  }

  return <h2>{title}</h2>
}
```

**正确写法：** 只条件计算真正变化的部分。

```tsx
// 保留一份标题结构，只切换后缀。
function SharedHeading({ done, title }: { done: boolean; title: string }) {
  const suffix = done ? '：已完成' : ''
  return <h2>{title}{suffix}</h2>
}
```

**验证方式：** 对照两个分支的共同标签与属性，确认只剩一处需要维护。

:::

## 十四、原理与适用场景

条件语法的选择来自 UI 结构，而不是“哪一种更像 React”：

- `if` / 提前 return：完整分支、guard 或多行判断。
- 条件变量：共享外壳中的一个可命名区域。
- 三元表达式：同一位置的两个短结果。
- boolean 左值的 `&&`：只有一个短真分支，没有 fallback。
- `return null`：组件明确没有输出。

每次判断都先遵循 JavaScript 语义，再遵循 ReactNode 语义。`&&` 的左侧若不是 boolean，就必须确认被
返回的原值是否可能显示；数量优先用 `> 0`，只排除 `null` 时优先用 `=== null`。

父级拥有页面结构时，由父级决定区域是否包含通常更容易阅读；叶子组件缺少自身必要条件时可以返回
`null`。两种写法都属于条件渲染，区别在于条件和结构分别由谁拥有。

## 十五、练习

:::exercise
### 修复消息摘要的三个条件错误

**要求：** 实现一个 `MessageSummary` 组件，接收消息数量 `count: number`、可选标签
`label: string | null` 和加载状态 `isReady: boolean`。未就绪时提前返回“准备中”；就绪后始终保留
同一个 `<section>` 外壳；只有 `count > 0` 时显示“有新消息”；只在 `label === null` 时省略标签，
不能把空字符串当作 `null`；不得使用嵌套三元或把 `count` 直接放在 `&&` 左侧。

**验收：** `count` 为 `0` 时页面不出现意外数字；`count` 为负数时也不显示消息提示；`label` 为空
字符串时仍走字符串分支；代码能说明为什么分别选择提前 return、明确比较和精确 null 检查。
:::

## 十六、本节小结

- React 使用普通 JavaScript 条件选择本次 ReactNode，没有专用条件模板语法。
- 两块结构不同用 `if` 或提前 return，共享外壳可先算变量，两个短结果用三元。
- `&&` 返回操作数；只有左侧本来是 boolean、且假分支不需要内容时才适合直接使用。
- `0` 是可见数字节点，`false`、`null`、`undefined` 是空节点，空字符串没有可见字符。
- 有意让组件不输出 UI 时明确 `return null`，不要用漏写 return 表达隐藏。
- TypeScript 分支收窄帮助安全访问字段，但 truthiness 不能替应用判断合法的 `0` 或空字符串。

## 十七、参考资料

- [Conditional Rendering](https://react.dev/learn/conditional-rendering)
- [Quick Start](https://react.dev/learn)
- [`@types/react@19.2.18`](https://cdn.jsdelivr.net/npm/@types/react@19.2.18/index.d.ts)
- [TypeScript Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [ECMAScript Conditional Operator](https://tc39.es/ecma262/multipage/ecmascript-language-expressions.html#sec-conditional-operator)
- [ECMAScript Binary Logical Operators](https://tc39.es/ecma262/multipage/ecmascript-language-expressions.html#sec-binary-logical-operators)
