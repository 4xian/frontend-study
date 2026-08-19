---
id: react.core.learn.intermediate.state-preservation-and-reset
type: lesson
title: State 保留与重置
summary: 根据组件类型、树位置和 key 判断局部 State 何时继续、何时重新创建。
domain: frontend
technology: react
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 75
prerequisites:
  - react.core.learn.intermediate.lifting-state-up
related:
  - react.core.learn.basics.use-state
  - react.core.learn.basics.conditional-rendering
  - react.core.learn.basics.list-rendering-and-key
  - react.core.learn.basics.render-commit-and-state-snapshot
  - react.core.learn.basics.state-ownership-and-thinking-in-react
tags:
  - React
  - State
  - 组件身份
  - render tree
  - key
  - 子树重建
appliesTo: React 19.2 官方文档与 React 19
verifiedAt: 2026-08-16
objectives:
  - 能用组件类型、父级树位置和 key 判断局部 State 是否保留。
  - 能解释 Props、样式和 JSX 分支变化为何不重置 State，以及不同位置为何彼此隔离。
  - 能判断组件被移除、组件类型改变和祖先类型改变后的 State 结果。
  - 能识别组件函数嵌套定义造成的类型不稳定和意外重置。
  - 能区分稳定 key、index 与随机 key，并判断 key 改变后的子树重建边界。
  - 能选择保留当前实例、按业务身份重置子树、局部更新或提升草稿所有权。
recap:
  - State 由 React 保存，并与组件在 render tree 中的身份位置关联。
  - 同一父级位置上的同一组件类型默认继续使用原来的 State。
  - Props、业务对象名称、样式和条件表达式所在的源码行不是默认身份。
  - 组件从树中移除后，其局部 State 结束；再次出现时按初始值创建。
  - 同一位置换成不同组件类型时，旧组件和它的后代 State 会被重建。
  - 祖先类型改变会替换该祖先及其完整子树，即使叶子组件名称相同。
  - 同类型组件位于不同树位置时，各自拥有独立 State。
  - 嵌套定义的组件每次父级 render 都可能成为新的组件类型，应放在模块顶层。
  - key 是位置身份的一部分；key 改变会重建 key 边界内的组件、后代 State 和 DOM。
  - key 不会保存每个业务对象的旧草稿；只想保留各对象草稿时，需要把数据放在更高层或其他存储中。
sources:
  - title: React Versions
    url: https://react.dev/versions
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - react.dev 当前文档版本口径为 React 19.2
  - title: Preserving and Resetting State
    url: https://react.dev/learn/preserving-and-resetting-state
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - State 与 render tree 中的位置关联
      - 同位置同类型默认保留，移除或类型改变会重置
      - key 可以成为位置身份的一部分并重置完整子树
      - 嵌套定义组件会因为类型改变造成 State 重置
  - title: "State: A Component's Memory"
    url: https://react.dev/learn/state-a-components-memory
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 同类型组件在不同位置拥有隔离的 State
      - State 不与某次函数调用或源代码行绑定
  - title: useState
    url: https://react.dev/reference/react/useState
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 改变 key 会从头创建组件及其全部 children
      - 递增版本可以表达显式重置
  - title: Rendering Lists
    url: https://react.dev/learn/rendering-lists
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - key 只需在同一 parent 的兄弟节点中区分
      - 稳定数据 ID 比 index 更适合表达列表身份
      - 随机 key 会让组件和 DOM 反复重建
  - title: You Might Not Need an Effect
    url: https://react.dev/learn/you-might-not-need-an-effect
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - key 适合在身份变化时重置完整子树
      - 只需调整少数 State 时可以直接在事件处理中更新
---

# State 保留与重置

## 一、学习目标

- 根据“父级位置 + 组件类型 + key”判断一次 render 后 State 是否继续。
- 区分保留、隔离、销毁、重建四种结果。
- 用稳定的业务身份决定编辑器、面板或表单是否应该成为新的 State 实例。
- 把 key 放在真正需要一起重置的子树根部。
- 识别只隐藏、条件移除、换宿主标签和嵌套组件定义造成的不同结果。

## 二、为什么需要身份模型

输入框、计数器和选项卡都可能拥有局部 State。用户切换显示对象后，旧输入有时会继续存在，有时会
从初始值重新开始。只看屏幕上的位置、Props 文本或组件函数名称，无法稳定解释这种差异。

React 每次 render 都会得到一棵新的元素树。State 不放在某个 JSX 对象或函数调用的局部变量中，而由
React 按照返回树中的组件身份保存。判断结果时，先比较前后两棵树的结构，再决定同一个 State 位置
是否继续被使用。

## 三、默认身份：父级位置与组件类型

没有显式 key 时，可以先使用一个足够准确的公开模型：

```text
同一父级位置 + 同一组件类型 = 默认复用同一份局部 State
```

“位置”指组件在返回树中相对于父级的结构位置，不是屏幕像素、CSS 坐标、变量名、源文件行号或业务
对象名称。组件类型是同一个函数组件，或者同一种宿主元素类型，例如 `ScoreCard`、`section`、`div`。

存在显式 key 时，key 会成为父级作用域内的位置身份。React 需要匹配同一父级下的组件类型和 key；
稳定 key 可以让同一业务条目在兄弟顺序变化后继续保持身份，key 改变则表示新身份。key 不能让 State
跨父级移动，也不提供全局身份。

| 前后返回树的变化 | 局部 State 的默认结果 | 判断依据 |
| --- | --- | --- |
| 同一位置、同一组件类型 | 保留 | 原位置仍匹配同一类型 |
| 同一位置、Props 或样式变化 | 保留 | 输入与外观不是身份字段 |
| 同一类型出现在两个兄弟位置 | 各自保留、互不共享 | 每个位置分别保存一份 State |
| 组件从树中移除 | 销毁 | 该位置不再有组件 |
| 同一位置换成不同组件类型 | 重置 | 旧类型被移除，新类型被创建 |
| 祖先类型改变 | 整棵后代子树重置 | 旧祖先和后代一起被替换 |

这个模型用于预测公开行为，不等于 React 内部 Fiber 字段或协调器实现的承诺。

## 四、同位置同类型会保留 State

下面的两个分支都在同一个 `section` 的第一个子位置返回 `ScoreCard`：

```tsx
import { useState } from 'react'

interface ScoreCardProps {
  person: string
  tone: 'calm' | 'strong'
}

/** 在当前树位置保存一份局部分数。 */
function ScoreCard({ person, tone }: ScoreCardProps) {
  const [score, setScore] = useState(0)

  return (
    <article className={tone}>
      <p>{person}：{score}</p>
      <button type="button" onClick={() => setScore((current) => current + 1)}>
        增加分数
      </button>
    </article>
  )
}

/** 改变输入和外观，但保持相同的组件类型与树位置。 */
function ScorePanel() {
  const [showTaylor, setShowTaylor] = useState(true)

  return (
    <section>
      {showTaylor ? (
        <ScoreCard person="Taylor" tone="strong" />
      ) : (
        <ScoreCard person="Sarah" tone="calm" />
      )}
      <button type="button" onClick={() => setShowTaylor((current) => !current)}>
        切换成员
      </button>
    </section>
  )
}
```

切换成员后，`person` 和 `tone` 是新的 Props；`score` 仍然属于同一个 `ScoreCard` 身份位置，所以会
继续保留。改变条件表达式的写法、把 JSX 抽到局部变量，或把颜色改成另一个 class，也不会单独制造
新的 State 身份。

### 1. Props 改变不是自动重置

```tsx
<ScoreCard person="Taylor" tone="strong" />
<ScoreCard person="Sarah" tone="calm" />
```

这两行在不同的 render 中轮流出现在同一个位置时，组件类型仍是 `ScoreCard`。React 会把新 Props
交给已有实例，而不会因为 `person` 文本改变就重新执行 `useState(0)` 的初始化。

### 2. 条件分支的源码位置不是身份

```tsx
return showTaylor
  ? <ScoreCard person="Taylor" tone="strong" />
  : <ScoreCard person="Sarah" tone="calm" />
```

React 比较的是最终返回树。两个 JSX 分支写在 `?` 和 `:` 两侧，不会让它们自动成为两个持久的 State
位置。要让两个成员拥有各自的实例，需要使用不同的树位置或显式 key。

## 五、不同位置拥有独立 State

同一个函数组件可以在一个父级下出现多次。调用了同一个函数并不等于共享一份 State：

```tsx
/** 在两个兄弟位置渲染相互独立的计分组件。 */
function ParallelScores() {
  return (
    <section>
      <ScoreCard person="左侧实例" tone="strong" />
      <ScoreCard person="右侧实例" tone="calm" />
    </section>
  )
}
```

左侧点击只改变左侧位置保存的 `score`，右侧位置有另一份 `score`。两个组件的函数体相同、Props
结构相同，也不会因此共享 State。

如果两个位置必须显示同一个事实，应由它们共同可访问的父级保存 State，再通过 Props 和回调传递。
如果两个位置应该是两个独立实例，就让它们保留不同的树位置，不要把“同一个组件函数”误认为“同一
份 State”。

## 六、从树中移除会销毁 State

条件渲染为假时，组件不只是变得不可见，而是从返回树中消失：

```tsx
/** 通过条件渲染移除并重新添加第二个计分组件。 */
function RemovableScore() {
  const [visible, setVisible] = useState(true)

  return (
    <section>
      {visible && <ScoreCard person="第二实例" tone="calm" />}
      <button type="button" onClick={() => setVisible((current) => !current)}>
        {visible ? '移除实例' : '重新添加实例'}
      </button>
    </section>
  )
}
```

移除时，第二个 `ScoreCard` 的局部 State 结束。重新添加后，即使组件类型和位置看起来相同，也是一
个新的出现实例，`score` 从 `0` 开始。第一个没有被移除的 `ScoreCard` 仍保留自己的值。

不要把 `display: none`、`visibility: hidden` 或视觉上折叠误认为条件移除。只要元素仍然存在于返回
树中，它的组件 State 仍有机会保留；真正的条件移除才会结束该组件身份。

## 七、组件类型改变会重置局部 State

同一父级位置不只要相同位置，还要保持同一组件类型：

```tsx
/** 渲染不保存计分 State 的替代内容。 */
function PauseMessage() {
  return <p>本轮暂停计分</p>
}

/** 在同一位置切换两个不同的组件类型。 */
function TypeSwitch() {
  const [isScoring, setIsScoring] = useState(true)

  return (
    <section>
      {isScoring ? <ScoreCard person="主场" tone="strong" /> : <PauseMessage />}
      <button type="button" onClick={() => setIsScoring((current) => !current)}>
        切换内容类型
      </button>
    </section>
  )
}
```

从 `ScoreCard` 切换为 `PauseMessage` 时，旧计分组件被移除；切回 `ScoreCard` 时重新创建，所以原来的
分数不会恢复。两者可以占据同一视觉区域，但视觉区域不是组件身份。

宿主元素类型也属于树结构的一部分。将拥有后代 State 的包装从 `section` 换成 `div`，会替换这个
包装及其后代。不要用“内容看起来一样”代替类型比较。

## 八、祖先改变会重建完整子树

拥有 State 的叶子组件没有改变，并不表示它一定能保留。如果它上面的祖先类型变化，旧祖先及其后代
会一起被替换：

```tsx
/** 保存一份局部输入草稿。 */
function DraftField() {
  const [draft, setDraft] = useState('')

  return (
    <label>
      当前草稿
      <input value={draft} onChange={(event) => setDraft(event.currentTarget.value)} />
    </label>
  )
}

/** 在同一位置切换 DraftField 的直接祖先类型。 */
function WrapperSwitch() {
  const [usesSection, setUsesSection] = useState(true)

  return (
    <section>
      {usesSection ? (
        <section><DraftField /></section>
      ) : (
        <div><DraftField /></div>
      )}
      <button type="button" onClick={() => setUsesSection((current) => !current)}>
        切换祖先类型
      </button>
    </section>
  )
}
```

输入草稿后切换包装类型，旧包装和其中的 `DraftField` 都被替换，新的输入从空字符串开始。排查意外
重置时，应从拥有 State 的组件向上比较，找到第一个被移除或类型改变的祖先。

## 九、保持组件类型稳定

组件函数应放在模块顶层。若在父组件函数内部定义子组件，父组件每次 render 都可能创建新的函数对象：

```tsx
/** 以稳定的模块级组件类型保存草稿。 */
function StableDraft({ owner }: { owner: string }) {
  const [draft, setDraft] = useState('')

  return (
    <label>
      {owner}
      <input value={draft} onChange={(event) => setDraft(event.currentTarget.value)} />
    </label>
  )
}

/** 重新 render 父级时仍复用 StableDraft 的组件类型。 */
function StableDraftPage() {
  const [revision, setRevision] = useState(0)

  return (
    <section>
      <p>页面版本：{revision}</p>
      <StableDraft owner="编辑草稿" />
      <button type="button" onClick={() => setRevision((current) => current + 1)}>
        更新父级
      </button>
    </section>
  )
}
```

错误写法通常像这样：

```tsx
function UnstablePage() {
  function Draft() {
    const [text, setText] = useState('')
    return <input value={text} onChange={(event) => setText(event.currentTarget.value)} />
  }

  return <Draft />
}
```

`Draft` 的源码名称没有改变，但它的函数对象在每次 `UnstablePage` render 时重新创建。不要把组件定义
嵌套在另一个组件中；需要变化的数据通过 Props 传入。

## 十、key 是位置身份的一部分

没有 key 时，可以使用以下简化模型：

```text
同一父级位置 + 同一组件类型 = 默认复用
```

给同一位置的组件加上 key 后，模型变为：

```text
同一父级位置 + 同一组件类型 + 同一 key = 可复用同一身份
```

例如：

```tsx
/** 让不同成员拥有互不共享的计分身份。 */
function KeyedScore({ person }: { person: 'Taylor' | 'Sarah' }) {
  return (
    <ScoreCard
      key={person}
      person={person}
      tone={person === 'Taylor' ? 'strong' : 'calm'}
    />
  )
}
```

当 `person` 从 `Taylor` 变为 `Sarah` 时，key 也改变。React 移除 `Taylor` 身份，在同一位置创建
`Sarah` 身份；旧分数不会迁移到新身份。

`key` 是 React 的匹配提示，不是普通 Props。下面的组件不能读取 `props.key`：

```tsx
interface CustomerEditorProps {
  customerId: string
  name: string
}

/** 通过普通 Prop 读取业务 ID，同时让 key 留在 React 身份层。 */
function CustomerEditor({ customerId, name }: CustomerEditorProps) {
  return <p>{name}（{customerId}）</p>
}

/** 将业务身份分别用于 React 匹配和组件业务输入。 */
function CustomerPage({ customer }: { customer: { id: string; name: string } }) {
  return <CustomerEditor key={customer.id} customerId={customer.id} name={customer.name} />
}
```

组件需要显示或提交业务 ID 时，必须额外传入 `customerId` 或完整对象。`key` 不会自动进入组件参数。

## 十一、稳定业务 key 重置编辑子树

切换客户、收件人、文档或档案时，业务语义可能是“开始一个全新的编辑实例”。这时可以把稳定 ID
放在编辑器子树根部：

```tsx
interface Customer {
  id: string
  name: string
  email: string
  note: string
}

interface EditorProps {
  customer: Customer
}

/** 在编辑器内部保存当前客户尚未提交的草稿。 */
function Editor({ customer }: EditorProps) {
  const [email, setEmail] = useState(customer.email)
  const [note, setNote] = useState(customer.note)

  return (
    <article>
      <h2>{customer.name}</h2>
      <input value={email} onChange={(event) => setEmail(event.currentTarget.value)} />
      <textarea value={note} onChange={(event) => setNote(event.currentTarget.value)} />
    </article>
  )
}

/** 用客户 ID 表达“切换后是新的编辑身份”。 */
function CustomerPage({ customer }: EditorProps) {
  return <Editor key={customer.id} customer={customer} />
}
```

`customer.id` 改变时，`Editor` 的 `email`、`note` 以及它下面的其他 State 都从新客户的初始数据开始。
页面外层的导航 State、客户选择 State 和其他没有被 key 包住的 State 不会自动重置。

### 1. key 改变不会保存每个 key 的旧快照

从 Alice 切到 Bob，再切回 Alice，会再次创建 Alice 的编辑器。此前被销毁的 Alice 局部 State 不会因为
key 又回到 `alice` 就自动恢复。如果业务要求切回时继续显示 Alice 草稿，应将草稿按 ID 提升到更高的
State 所有者，或写入明确的数据存储；key 本身不是缓存表。

### 2. 递增版本表达一次明确重置

不只有业务对象能作为 key。用户明确点击“重新开始”时，可以改变一个版本：

```tsx
/** 包含多个局部字段的编辑子树。 */
function ContactForm() {
  const [name, setName] = useState('')
  return <input value={name} onChange={(event) => setName(event.currentTarget.value)} />
}

/** 只在明确的重置动作中创建新的表单身份。 */
function ResettableForm() {
  const [version, setVersion] = useState(0)

  return (
    <section>
      <button type="button" onClick={() => setVersion((current) => current + 1)}>
        重新开始
      </button>
      <ContactForm key={version} />
    </section>
  )
}
```

`version` 只在用户请求重置时改变。不能使用 `Math.random()`、当前时间或每次 render 都递增的计数，
否则正常 render 也会不断制造新身份。

## 十二、key 会重建完整子树和 DOM

key 不是“把某一个输入设为空”的命令。它放在哪个元素上，哪个元素及其后代就成为重建边界：

```tsx
<EditorShell>
  <Editor key={customer.id} customer={customer} />
</EditorShell>
```

`Editor` 下方的备注、校验提示、选项卡和后代 State 都会随身份一起创建。`EditorShell` 外部的导航
State 不在边界内，继续保留。

DOM 也会属于新的子树。对输入节点、焦点、文本选择、滚动位置或未受控 DOM 值有依赖时，key 改变可能
导致旧节点被新节点替换。受控输入即使显示出相同文本，也不能据此证明组件和 DOM 没有重建；显示值可能
来自外层 State，而不是来自旧节点的延续。

因此，key 的位置要匹配业务边界：

| key 放置位置 | 可能的结果 |
| --- | --- |
| 编辑器根部 | 编辑器及其所有后代一起重置 |
| 某个单独字段 | 只有该字段子树重置，其他客户 State 可能残留 |
| 页面最外层 | 导航、筛选和编辑器全部重置，边界过大 |

## 十三、保留、重置与局部更新的选择

先问“前后是否仍是同一个概念上的编辑实例”，再选择实现：

### 1. 应该保留

- 同一对象只改变标题、颜色、排序或其他显示 Props。
- 面板被 CSS 隐藏但仍需要继续编辑。
- 父级重新 render，但子组件身份没有业务变化。
- 表单中暂时切换视图，用户回来后应继续看到草稿。

做法是保持同一组件类型、同一树位置和稳定 key，不要为了刷新显示而随意改变 key。

### 2. 应该重置

- 编辑对象已经从一个客户换成另一个客户。
- 收件人、文档或账号改变后，边界内所有草稿都不应带过去。
- 用户明确要求整棵表单从初始值重新开始。

做法是用稳定业务 ID 或明确递增版本作为 key，并把 key 放在完整编辑子树根部。

### 3. 只更新少数字段

如果只需要清空一个搜索框或一条提示，不要为了方便给整棵页面换 key：

```tsx
/** 只清空当前消息字段，不重建整个编辑器。 */
function clearMessage(setMessage: (value: string) => void) {
  setMessage('')
}
```

在事件处理器中直接更新目标 State，重置范围更小，也更容易表达业务意图。不要用 Effect 监听 Props
变化后再逐个清空字段来模拟身份重建；若确实是完整身份变化，key 更直接；若不是完整身份变化，保留
实例并只更新需要变化的 State。

## 十四、key 的作用域和稳定性

### 1. 只要求兄弟节点内区分

key 不需要全局唯一。两个不同父级下的节点可以使用相同的 key，因为它们不在同一组兄弟节点中进行
匹配。key 的作用域是当前 parent 的兄弟集合。

### 2. 稳定 ID 表达数据身份

列表或编辑对象应使用数据本身的稳定 ID。名称可能改变、重复或只是展示文本；随机值、时间戳和 render
计数都不能表达“仍然是同一条数据”。

### 3. index 只适合真正稳定的静态顺序

数组插入、删除或重排时，`key={index}` 会把旧 State 和 DOM 对到新的数据项。可变列表应使用绑定在
数据上的 ID；不要因为 index 方便就让用户输入跟着位置移动。

### 4. 随机 key 会破坏正常保留

```tsx
// 错误：每次 render 都产生不同身份。
<Editor key={Math.random()} customer={customer} />
```

每次 render 都改变 key 会反复销毁并创建组件和 DOM，丢失输入、焦点和其他局部 State。key 是身份合同，
不是通用刷新按钮。

## 十五、组合 Demo：观察保留与重置

:::demo{id="react.core.learn.intermediate.state-preservation-and-reset.state-preservation-demo"}
:::

Demo 分成四个观察区：

1. **同位置、同类型：** 给当前计分器增加分数，再切换成员和外观，确认分数保留。
2. **并列位置：** 分别增加左右实例，确认两份 State 独立；移除右侧再添加，确认右侧从初始值开始。
3. **祖先类型：** 输入草稿后切换 `section` 与 `div` 包装，确认叶子组件一起重新开始。
4. **key 对照：** 在两个客户编辑器中输入草稿，再切换客户；无 key 的编辑器保留旧编辑，稳定 key 的
   编辑器从新客户初始资料开始。

观察时不要只看文字结果。对照源码中的组件类型、返回树位置、key 值和边界位置，再判断为什么结果
不同。

## 十六、易错使用提示

:::pitfalls
### 错误一：只改变 Props，却期待 State 自动重置

**触发条件：** `CustomerEditor` 仍在同一位置，只从 Alice 换成 Bob，没有改变 key。

**原因：** 默认匹配只要求同一位置和同一组件类型；Prop 值不是默认身份字段。

**后果：** Bob 的编辑器可能显示 Alice 尚未提交的邮箱或备注。

**错误示例：**

```tsx
/** 错误：只替换业务对象，编辑器保持默认身份。 */
function CustomerPage({ customer }: EditorProps) {
  return <Editor customer={customer} />
}
```

**正确写法：**

```tsx
/** 正确：稳定 ID 表示新的编辑身份。 */
function CustomerPage({ customer }: EditorProps) {
  return <Editor key={customer.id} customer={customer} />
}
```

**验证方式：** 输入 Alice 草稿后切换 Bob；带 key 的编辑器显示 Bob 初始资料，不带 key 的编辑器保留
旧草稿。

### 错误二：把条件分支或 JSX 行号当成不同实例

**触发条件：** 认为 `?` 与 `:` 两边写了两个标签，所以切换时一定会清空 State。

**原因：** React 匹配最终返回树，不匹配源码分支所在的字符位置。

**后果：** 只改变显示 Props 时误加 key 或手动同步，造成不必要的 State 重置。

**错误示例：**

```tsx
{active ? <ScoreCard person="A" tone="strong" /> : <ScoreCard person="B" tone="calm" />}
```

**正确写法：**

```tsx
// 两个分支都表达同一位置、同一组件类型；需要重置时再加入业务 key。
{active ? (
  <ScoreCard person="A" tone="strong" />
) : (
  <ScoreCard person="B" tone="calm" />
)}
```

**验证方式：** 切换前先增加分数；无 key 时分数继续保留，加入随业务身份变化的 key 后才重置。

### 错误三：把组件定义在父组件内部

**触发条件：** 为了就近使用变量，在父组件函数中声明带 State 的子组件。

**原因：** 每次父级 render 都可能创建新的函数对象，React 看到的组件类型不再稳定。

**后果：** 父级任何无关更新都可能清空输入、计数和焦点。

**错误示例：**

```tsx
function Page() {
  function Editor() {
    const [text, setText] = useState('')
    return <input value={text} onChange={(event) => setText(event.target.value)} />
  }

  return <Editor />
}
```

**正确写法：**

```tsx
/** 将变化的数据作为 Props 传入顶层组件。 */
function Editor({ label }: { label: string }) {
  const [text, setText] = useState('')
  return <label>{label}<input value={text} onChange={(event) => setText(event.target.value)} /></label>
}
```

**验证方式：** 将组件移到模块顶层后，触发父级无关更新，输入值和焦点不再因为类型变化而重置。

### 错误四：用随机 key 或 render 计数刷新组件

**触发条件：** 使用 `Math.random()`、当前时间或每次 render 都变化的值作为 key。

**原因：** key 每次都不同，React 无法把新树匹配到旧身份。

**后果：** 组件、后代 State 和 DOM 反复重建，用户输入、焦点和滚动位置丢失。

**错误示例：**

```tsx
<CustomerEditor key={Date.now()} customer={customer} />
```

**正确写法：**

```tsx
<CustomerEditor key={customer.id} customer={customer} />
```

**验证方式：** 外层无关 State 更新时，稳定 key 的输入继续保留；随机 key 的输入每次更新都重新初始化。

### 错误五：把 key 当成普通 Prop

**触发条件：** 在组件内部读取 `props.key`，或只传 `key` 却没有传业务 ID。

**原因：** key 是 React 的特殊匹配字段，不会进入组件的 Props 对象。

**后果：** 组件无法显示、提交或查询当前业务对象 ID。

**错误示例：**

```tsx
function Editor(props: { key: string }) {
  return <p>{props.key}</p>
}
```

**正确写法：**

```tsx
function Editor({ customerId }: { customerId: string }) {
  return <p>{customerId}</p>
}

<Editor key={customer.id} customerId={customer.id} />
```

**验证方式：** 组件通过普通 `customerId` 读取业务数据，同时使用 `key` 控制身份；类型检查和运行结果都
不依赖 `props.key`。

### 错误六：把 key 放在错误边界

**触发条件：** 需要重置编辑器，却把 key 放在页面根部；或只给一个字段加 key，却让其他客户 State
继续留在原实例。

**原因：** key 改变会重建它所在组件及全部后代，重置范围由放置位置决定。

**后果：** 页面导航、筛选器等无关 State 被清空，或客户相关提示残留到新客户。

**错误示例：**

```tsx
// 错误：把页面根部一起换 key，导航和筛选也会随编辑器重置。
<Page key={customer.id} customer={customer} />
```

**正确写法：** 把 key 放在拥有“当前客户全部编辑 State”的子树根部，并让页面外部的选择 State 保持在
边界之外。

```tsx
function Page({ customer }: { customer: Customer }) {
  return (
    <PageShell>
      <CustomerEditor key={customer.id} customer={customer} />
    </PageShell>
  )
}
```

**验证方式：** 切换客户后，编辑器内字段和提示都回到新客户初始值，客户选择器和页面导航仍保持当前值。

### 错误七：只想清空一个字段，却重建整棵子树

**触发条件：** 清空搜索框时改变页面 key，或使用 key 重置包含多个互不相关字段的表单。

**原因：** key 表达完整身份变化，不是单字段 setter 的替代品。

**后果：** 无关输入、焦点、选项和局部提示一起丢失。

**错误示例：**

```tsx
// 错误：清空搜索词却让整个页面失去身份。
<SearchPage key={queryVersion} />
```

**正确写法：** 在事件处理中只更新目标字段；只有整棵子树都属于新身份时才改变 key。

```tsx
/** 只清空搜索词，保留其他 State 和 DOM 身份。 */
function clearQuery(setQuery: (value: string) => void) {
  setQuery('')
}
```

**验证方式：** 清空目标字段后，其他字段和组件 DOM 身份仍保留；切换业务对象时，边界内 State 才整体重置。

### 错误八：以为 key 会缓存每个业务对象的旧 State

**触发条件：** 使用 `key={customer.id}` 后，期待切回 Alice 自动恢复此前 Alice 的草稿。

**原因：** 旧 key 消失时对应 State 已被销毁，key 只用于匹配当前树，不是按 key 保存的缓存。

**后果：** 用户切回对象后发现草稿从初始值开始，错误地把问题归因于 React 丢失数据。

**错误示例：**

```tsx
// 错误：以为 key 会替每个客户保存一份旧 State。
<CustomerEditor key={customer.id} customer={customer} />
```

**正确写法：** 若业务要求跨身份保留草稿，把草稿按 ID 存在更高层 State 或明确数据存储中；若业务要求
重新开始，使用 key 重建即可。

```tsx
/** 由更高层按业务 ID 保存草稿，切换身份后仍能取回。 */
const [draftsById, setDraftsById] = useState<Record<string, string>>({})
const draft = draftsById[customer.id] ?? ''
```

**验证方式：** 在 Demo 的 key 编辑器中输入 Alice、切到 Bob、再切回 Alice，确认不会恢复已销毁的旧草稿；
再对照无 key 编辑器的保留行为。
:::

## 十七、源码推导与适用场景

1. **官方事实：** React 19.2 官方文档说明，State 由 React 保存，并与组件在 render tree 中的位置
   关联。**课程推导：** 预测结果时应比较前后返回树，不应根据变量名、JSX 行号、显示文字或屏幕坐标
   判断身份。**边界：** 这是公开心智模型，不等同于 Fiber 字段、协调器遍历顺序或 DOM diff 步骤。
2. **官方事实：** 没有显式 key 时，同一位置的同一组件类型默认保留 State；同一种组件出现在两个
   位置时，各自拥有独立 State。**课程推导：** Prop、样式和条件表达式只改变已有实例的输入或外观，
   不会单独创建新身份。**边界：** 若父级结构变化使组件落到另一个树位置，不能仅凭组件函数名称相同
   判断 State 会保留。
3. **官方事实：** 组件从树中移除、同一位置换成另一种组件类型，或祖先类型被替换时，受影响子树的
   State 会结束。**课程推导：** 判断叶子组件是否保留前，应从父级向下找到第一个不再匹配的位置、
   类型或 key。**边界：** 条件隐藏若实际仍返回组件，和条件分支返回 `null` 后重新挂载不是同一种结果。
4. **官方事实：** key 是父级作用域内的位置身份组成部分；key 改变会从头创建该组件及其 children，
   表单示例中的 DOM 也会重新创建。**课程推导：** key 应放在概念身份真正改变的子树根部，稳定业务
   ID 表示同一对象，明确版本号表示一次主动重置。**边界：** key 不会作为普通 Prop 传入，不会缓存
   已从树中移除的旧 State，也不能让 State 跨父级移动。
5. **官方事实：** React 官方建议不要在组件内部定义另一个组件；父级重新 render 时，嵌套函数会形成
   不同的组件类型并导致 State 意外重置。**课程推导：** 有局部 State 的组件应在模块顶层定义，把变化
   数据通过 Props 传入。**边界：** 普通事件处理函数和只在当前 render 中调用的辅助函数不是组件类型，
   不受这条组件身份规则约束。
6. **官方事实：** 官方分别给出使用 key 重置完整 State、在 render 或事件中调整部分 State 的方案。
   **课程推导：** 同一逻辑实例继续存在时保留 State；完整业务身份改变时重建最小子树；只需清空一个
   字段时直接更新目标 State；需要切回多个对象并恢复各自草稿时，把草稿按 ID 提升到不会被重建的
   所有者。**边界：** 路由缓存、外部 Store、持久化和隐藏树恢复有各自生命周期，不由 key 自动提供。

适合使用默认保留的场景包括同一表单切换外观、同一计数器更新标签、同一编辑实例接收新校验结果。
适合使用 key 重置的场景包括切换收件人、客户或文档后，整棵编辑子树都应从新对象初始值开始。只需
改变搜索词、筛选条件或单个提示时，应直接更新对应 State，避免连带销毁输入、焦点和其他局部状态。

## 十八、排查步骤

遇到“为什么没有保留”或“为什么没有重置”，按固定顺序检查：

1. 组件是否仍出现在返回树中？不在树中就已经结束 State。
2. 从父级开始比较前后位置，是否换了兄弟位置、包装层或条件结构？
3. 该位置的组件类型是否仍是同一个函数或同一种宿主元素？
4. 是否存在 key？key 是否稳定？key 是否真的随业务身份或明确重置动作变化？
5. key 放置位置是否包住了所有应该一起重置的 State？
6. 是否把组件定义嵌套在父级 render 中？
7. 需要的是整棵子树重置，还是只需要更新一个字段？
8. 若要切回旧对象继续草稿，是否把草稿数据放在不会被重建的 State 所有者中？

先画出简化的返回树，再看代码中的 JSX 行号，通常更容易找到真正的身份边界。

## 十九、练习

::::exercise
### 预测默认结果

**要求：** 对以下变化分别写出“保留”或“重置”，并用父级位置、组件类型和 key 说明原因：（1）
`Counter` 的 `label` Prop 改变，组件类型和位置不变；（2）第二个 `Counter` 被条件移除后重新添加；
（3）`Counter` 替换为 `Message`，视觉容器尺寸不变；（4）`Counter` 的祖先从 `section` 换成 `div`；
（5）父组件增加一个无关的 `refreshCount`，子组件定义在模块顶层。

**验收：** 五项结论依次为保留、重置、重置、重置、保留；每项都能指出真正变化的是 Props、节点
存在性、组件类型、祖先类型还是无关父级 State，不能使用 JSX 行号或屏幕位置作为理由。
::::

::::exercise
### 选择身份边界

**要求：** 设计一个客户编辑页面：客户选择器要保留，客户编辑器中的邮箱、备注和校验提示要在切换
客户时全部重置。指出 key 应放在哪里、客户 ID 如何作为普通 Prop 传入，以及哪些 State 不应被 key
包住。

**验收：** `key={customer.id}` 位于编辑器子树根部；组件同时通过普通 `customerId` 或 `customer` Prop
读取业务数据；切换客户后编辑字段和校验提示重新初始化，边界外的客户选择器与页面导航继续保留；
组件不读取 `props.key`，key 不使用名称、index、随机数或时间戳。
::::

::::exercise
### 区分整树重置和局部更新

**要求：** 一个表单只需要清空“搜索词”，但还要保留筛选条件和键盘焦点。分别写出使用事件处理器
直接更新 State 和错误地修改页面 key 的结果，说明哪一种符合更小的重置范围。

**验收：** 正确方案只调用搜索词 setter 并保留筛选条件、其他局部 State 和现有 DOM 身份；错误方案
能够解释页面 key 改变会重建整个边界、丢失无关 State 和焦点；结论明确选择局部更新，不引入 Effect
同步或随机 key。
::::

## 二十、小结

- React 保存的是与返回树身份位置对应的 State，不是某个 JSX 对象或源代码行。
- 默认身份由父级位置和组件类型共同决定；Props 与样式变化通常只更新已有实例。
- 移除组件、改变组件类型或改变祖先类型，会结束旧身份并重建受影响的子树。
- 同一个组件在不同位置拥有不同 State；组件函数应保持模块级稳定。
- key 把显式身份加入位置判断，稳定业务 ID 适合在对象切换时重置完整编辑子树。
- key 改变会影响后代 State 和 DOM，但不会重置边界外 State，也不会缓存旧 key 的 State。
- 只需局部调整时直接更新目标 State；不要把 key 当成通用刷新或清空按钮。

## 二十一、参考资料

- [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state)
- [State: A Component's Memory](https://react.dev/learn/state-a-components-memory)
- [`useState` 参考](https://react.dev/reference/react/useState)
- [Rendering Lists](https://react.dev/learn/rendering-lists)
- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
