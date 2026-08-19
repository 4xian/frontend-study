---
id: react.core.learn.basics.children-and-composition
type: lesson
title: children 与组合
summary: 理解嵌套 JSX 怎样成为 children，并用 ReactNode、命名区域和 render prop 设计组件组合接口。
domain: frontend
technology: react
module: core
stage: basics
level: beginner
estimatedMinutes: 65
prerequisites:
  - react.core.learn.basics.props
related: []
tags:
  - React
  - children
  - composition
  - ReactNode
  - ReactElement
  - render-prop
appliesTo: React 19.2（运行时 19.2.8）、TypeScript 6.0.3
verifiedAt: 2026-08-15
objectives:
  - 能解释嵌套 JSX 怎样进入 children prop，以及接收组件怎样决定内容位置。
  - 能根据通用可渲染内容和单个 element 对象的要求选择 ReactNode 或 ReactElement。
  - 能用 children 表达单一主要区域，用命名 ReactNode Props 表达多个语义区域。
  - 能用 render prop 把组件提供的数据交给调用方转换为 ReactNode。
  - 能识别依赖 child 顺序、扫描结构或隐式注入数据的脆弱组合接口。
recap:
  - children 是有嵌套语法的 prop，收到内容不等于已经把内容放进返回结果。
  - ReactNode 适合通用内容区域，ReactElement 只适合确实需要 element 对象的窄合同。
  - 一个主要区域使用 children，多个稳定区域使用职责明确的命名 ReactNode Props。
  - render prop 适合组件提供数据、调用方决定表现形式的组合需求。
  - 新组合接口应保持数据流显式，避免扫描、改写或向未知 child 隐式注入数据。
sources:
  - title: React Passing Props to a Component
    url: https://react.dev/learn/passing-props-to-a-component
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 标签之间的 JSX 会成为 children prop
      - 接收组件在自己的返回结果中决定 children 的位置
  - title: React Using TypeScript
    url: https://react.dev/learn/typescript#typing-children
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - ReactNode 与 ReactElement 的类型边界
      - TypeScript 不能可靠限定某一种 JSX element
  - title: React DOM Common Components
    url: https://react.dev/reference/react-dom/components/common
    sourceType: api-doc
    appliesTo: React DOM 19.2
    claims:
      - React node 的代表值
      - 多个类似 slot 的区域通常通过 JSX Props 表达
  - title: React Children
    url: https://react.dev/reference/react/Children
    sourceType: api-doc
    appliesTo: React 19.2
    claims:
      - 扫描 children 结构不常用且容易形成脆弱代码
      - render prop 是保持数据流显式的替代方向
  - title: React cloneElement
    url: https://react.dev/reference/react/cloneElement
    sourceType: api-doc
    appliesTo: React 19.2
    claims:
      - 向未知 child 隐式注入数据会让数据流难以追踪
      - 直接组合与 render prop 更适合新接口
---

# children 与组合

## 一、学习目标

- 理解组件标签之间的 TSX 怎样成为 `children` prop。
- 在组件返回值中为 `children` 指定清楚的语义位置。
- 根据接口允许的内容选择 `ReactNode` 或 `ReactElement`。
- 使用 `children`、命名 `ReactNode` Props 和 render prop 表达三种组合需求。
- 让组合接口显式、低耦合，不依赖 child 的排列顺序或内部结构。

## 二、children 是有嵌套语法的 prop

组件经常需要固定外壳，同时允许调用方提供不同内容。下面的 `Notice` 固定标题和正文容器，但不写死
正文：

```tsx
import type { ReactNode } from 'react'

type NoticeProps = {
  title: string
  children: ReactNode
}

// 组合固定标题与调用方提供的主要内容。
function Notice({ title, children }: NoticeProps) {
  return (
    <section>
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  )
}
```

调用方把内容写在开始标签和结束标签之间：

```tsx
// 为 Notice 提供嵌套内容。
function Page() {
  return (
    <Notice title="阅读提示">
      <p>先区分固定结构和可替换内容。</p>
    </Notice>
  )
}
```

这段代码的数据流是：

```text
<Notice> 与 </Notice> 之间的 TSX
  -> 本次 Notice element 的 children prop
  -> Notice 函数读取 children
  -> Notice 把 children 放进正文区域
```

`children` 没有独立的数据通道。它仍然属于 Props 对象，只是 JSX 为它提供了嵌套写法。

### 1. 收到内容不等于已经显示内容

组件必须在返回结果中使用 `children`：

```tsx
type PanelProps = {
  children: ReactNode
}

// 错误：读取了 children，但返回结果没有放置它。
function EmptyPanel({ children: _children }: PanelProps) {
  return <section />
}

// 正确：在明确的内容区域渲染 children。
function Panel({ children }: PanelProps) {
  return <section>{children}</section>
}
```

React 不会根据内容形状自动选择标题区、正文区或页脚区。接收组件拥有外壳，因此也负责确定插入位置。

因为 `children` 仍是 prop，`<Panel children={content} />` 也能提供同一个字段；常规组合使用嵌套写法，
让外壳与内容的关系直接可见。

## 三、ReactNode 表达通用可渲染内容

`ReactNode` 是描述通用 React 内容的宽类型。与组件组合直接相关的代表值如下：

| 值 | 能否作为 ReactNode | 显示边界 |
| --- | --- | --- |
| React element | 能 | 例如 `<strong>重点</strong>`。 |
| 字符串 | 能 | 作为文本显示。 |
| 数字 | 能 | `0` 是有效的可见内容。 |
| `null`、`undefined`、布尔值 | 能 | 属于空节点，不产生可见内容。 |
| 多个节点或节点数组 | 能 | 每个节点都属于组合内容。 |
| Fragment | 能 | 组合多个节点，但不增加额外 DOM wrapper。 |
| 普通对象 | 不能 | 应读取对象中的具体字段，再把字段转换为可渲染内容。 |

通用容器可以接受这些不同形式：

```tsx
import type { ReactNode } from 'react'

type ContentFrameProps = {
  children: ReactNode
}

// 渲染任意常规 React 内容。
function ContentFrame({ children }: ContentFrameProps) {
  return <div>{children}</div>
}

// 用多种 ReactNode 复用同一个内容外壳。
function Examples() {
  return (
    <>
      <ContentFrame>纯文本</ContentFrame>
      <ContentFrame>{0}</ContentFrame>
      <ContentFrame>
        <strong>一个 element</strong>
      </ContentFrame>
      <ContentFrame>
        <>
          <span>第一段</span>
          <span>第二段</span>
        </>
      </ContentFrame>
    </>
  )
}
```

Fragment 自身是一个 React element，但它可以包含多个后代。因此“一个 element”不等于“最终只有
一个 DOM 节点”。

`children: ReactNode` 要求调用方提供该属性，但 `null`、`undefined` 和布尔值仍是空节点，因此必填
不等于一定产生可见内容。

## 四、ReactElement 表达单个 element 对象

`ReactElement` 比 `ReactNode` 窄。它接受一个 React element，不接受文本、数字或节点数组：

```tsx
import type { ReactElement } from 'react'

type SingleElementFrameProps = {
  children: ReactElement
}

// 接收一个 React element 对象。
function SingleElementFrame({ children }: SingleElementFrameProps) {
  return <div>{children}</div>
}
```

下面的 element 符合合同：

```tsx
<SingleElementFrame>
  <strong>一个 element</strong>
</SingleElementFrame>
```

文本不符合 `ReactElement` 合同：

```tsx
// 类型错误：字符串是 ReactNode，但不是 ReactElement。
<SingleElementFrame>纯文本</SingleElementFrame>
```

选择类型时应从真实接口出发：

| 接口要求 | 类型选择 |
| --- | --- |
| 允许文本、数字、element、Fragment、多个节点或空节点 | `ReactNode` |
| 必须收到一个 React element 对象 | `ReactElement` |

`ReactElement` 也不能让 TypeScript 可靠保证调用方只能传某个特定组件或某一种 HTML 标签。不要用
`ReactElement<SomeProps>` 宣称类型已经锁定了 element 的具体来源；需要明确业务输入时，应设计清楚
的数据字段或命名区域。

## 五、用 children 表达单一主要区域

当组件只有一个主要内容入口时，`children` 最直观：

```tsx
type DialogFrameProps = {
  title: string
  children: ReactNode
}

// 组合固定标题和单一主要内容区域。
function DialogFrame({ title, children }: DialogFrameProps) {
  return (
    <section aria-labelledby="dialog-title">
      <h2 id="dialog-title">{title}</h2>
      <div>{children}</div>
    </section>
  )
}
```

调用处只提供这次需要的正文：

```tsx
<DialogFrame title="确认信息">
  <p>请核对名称和数量。</p>
  <p>确认后再继续操作。</p>
</DialogFrame>
```

这种接口把职责分成两部分：

- `DialogFrame` 决定标题、正文容器和语义结构。
- 调用方决定正文由哪些节点组成。

外壳不读取 child 的标签名，也不猜测内部层级。调用方把段落换成 Fragment 或另一个组件时，外壳的
合同仍然成立。

### 1. 适合 children 的条件

同时满足下面条件时，优先使用 `children`：

1. 组件只有一个主要可替换区域。
2. 调用处的嵌套关系能够准确表达“外壳包含内容”。
3. 外壳只负责放置内容，不需要识别内容的具体标签或来源。
4. 调用方已经能够创建所需节点，不需要外壳再提供数据。

## 六、用命名 ReactNode Props 表达多个区域

组件有多个稳定且含义不同的区域时，只使用一个 `children` 会迫使调用方依赖位置顺序。命名 Props
可以直接表达每块内容的职责：

```tsx
type WorkspaceFrameProps = {
  sidebar: ReactNode
  toolbar: ReactNode
  children: ReactNode
}

// 把命名区域和主要内容放进各自的语义位置。
function WorkspaceFrame({ sidebar, toolbar, children }: WorkspaceFrameProps) {
  return (
    <div>
      <aside>{sidebar}</aside>
      <header>{toolbar}</header>
      <main>{children}</main>
    </div>
  )
}
```

调用处通过名称说明区域归属：

```tsx
<WorkspaceFrame
  sidebar={<nav aria-label="章节">导航内容</nav>}
  toolbar={<strong>只读模式</strong>}
>
  <article>主要内容</article>
</WorkspaceFrame>
```

只看调用代码，就能判断 `sidebar`、`toolbar` 和主要内容分别进入哪里。相比“第一个 child 是侧栏、
第二个 child 是工具栏、其余 child 是正文”，命名合同不依赖隐藏的顺序约定。

### 1. 区域名称要表达职责

使用 `header`、`sidebar`、`actions`、`footer` 等能说明位置或用途的名称。`top`、`extra1`、`slotA`
这类名称不能解释内容职责，调用方仍需查看实现才能理解。

### 2. 每个区域只承担一个职责

命名区域与主要内容区域应分别对应一个稳定职责：

```tsx
type ArticleFrameProps = {
  heading: ReactNode
  actions: ReactNode
  children: ReactNode
}
```

`heading` 表达标题区域，`actions` 表达操作区域，`children` 表达主要内容区域。不要再增加与它们含义
相同的 `titleContent`、`toolbar` 或 `body`，让调用方判断多个入口之间的覆盖关系。

### 3. 不要用命名区域传递原始业务数据

命名 `ReactNode` Prop 表达的是一块已经创建好的 UI。若子组件需要价格、数量或状态值进行计算，应
使用与数据含义对应的字段，而不是先把数据包装成不可分析的节点。

```tsx
type PriceSummaryProps = {
  amount: number
  currency: 'CNY' | 'USD'
}
```

组合区域负责 UI 所有权，数据字段负责计算输入。接口应说明自己需要哪一种合同。

## 七、用 render prop 定制数据的表现形式

`children` 和命名区域接收的是已经创建好的节点。有时组件拥有一份数据，但希望调用方决定这份数据
怎样变成 UI。此时可以使用返回 `ReactNode` 的函数 Prop：

```tsx
import type { ReactNode } from 'react'

type Summary = {
  readonly title: string
  readonly minutes: number
}

type SummaryPreviewProps = {
  summary: Summary
  renderSummary: (summary: Summary) => ReactNode
}

// 把摘要数据交给调用方提供的函数生成 UI。
function SummaryPreview({ summary, renderSummary }: SummaryPreviewProps) {
  return <section>{renderSummary(summary)}</section>
}
```

调用方接收数据并选择显示形式：

```tsx
<SummaryPreview
  summary={{ title: 'children 与组合', minutes: 65 }}
  renderSummary={(summary) => (
    <p>
      {summary.title} · {summary.minutes} 分钟
    </p>
  )}
/>
```

`renderSummary` 的函数签名同时约束两端：

- 组件必须提供一个 `Summary` 参数。
- 调用方可以读取 `title` 和 `minutes`。
- 调用方必须返回可作为 React 内容的 `ReactNode`。
- 组件负责在自己的返回结果中放置函数结果。

### 1. render prop 解决的是数据到 UI 的定制

如果调用方已经创建好静态内容，不需要把它包装成无参数函数：

```tsx
// 直接使用命名 ReactNode Prop。
<Panel heading={<strong>固定标题</strong>}>正文</Panel>
```

只有组件需要向调用方提供数据时，函数接口才带来实际表达能力：

```tsx
type ValuePreviewProps = {
  value: number
  renderValue: (value: number) => ReactNode
}

// 使用组件提供的数值生成调用方定义的内容。
function ValuePreview({ value, renderValue }: ValuePreviewProps) {
  return <output>{renderValue(value)}</output>
}
```

render prop 的名称通常使用 `render` 加上内容职责，例如 `renderSummary`、`renderValue`。名称应说明
函数产生哪一块 UI，而不是使用含义不明确的 `callback`。

## 八、组合三种接口

同一个组件可以同时拥有主要 `children`、命名区域和 render prop，只要每个入口承担不同职责：

```tsx
type RecordItem = {
  readonly label: string
  readonly value: string
}

type RecordPanelProps = {
  heading: ReactNode
  item: RecordItem
  renderItem: (item: RecordItem) => ReactNode
  children: ReactNode
}

// 组合标题、主要说明和由数据生成的定制区域。
function RecordPanel({ heading, item, renderItem, children }: RecordPanelProps) {
  return (
    <section>
      <header>{heading}</header>
      <div>{children}</div>
      <div>{renderItem(item)}</div>
    </section>
  )
}
```

```tsx
<RecordPanel
  heading={<h2>记录详情</h2>}
  item={{ label: '状态', value: '有效' }}
  renderItem={(item) => (
    <dl>
      <dt>{item.label}</dt>
      <dd>{item.value}</dd>
    </dl>
  )}
>
  <p>这里是主要说明区域。</p>
</RecordPanel>
```

这个接口没有让多个入口表达同一件事：

- `heading` 是固定语义的命名区域。
- `children` 是主要说明区域。
- `item` 是组件提供的数据。
- `renderItem` 决定数据的表现形式。

如果两个入口始终接收相同内容或相互覆盖，应删掉其中一个，避免让调用方判断优先级。

## 九、怎样选择组合接口

| 需求 | 推荐接口 | 原因 |
| --- | --- | --- |
| 一个主要可替换区域 | `children: ReactNode` | 嵌套关系直接表达外壳包含内容。 |
| 多个稳定且语义不同的区域 | 命名 `ReactNode` Props | 属性名直接表达区域职责。 |
| 组件提供数据，调用方决定表现 | `(value) => ReactNode` | 函数把数据显式交给调用方生成 UI。 |
| 组件需要原始值进行计算 | 明确的数据 Props | 数据仍保留可分析的类型和含义。 |
| 接口必须收到一个 element 对象 | `ReactElement` | 类型准确拒绝文本、数字和节点数组。 |

可以按下面的顺序判断：

1. 先确认输入是原始数据还是已经创建好的 UI。
2. UI 只有一个主要区域时使用 `children`。
3. UI 有多个稳定区域时使用命名 `ReactNode` Props。
4. 组件必须把自己拥有的数据交给调用方生成 UI 时使用 render prop。
5. 只有必须操作 element 对象的接口才把类型收窄到 `ReactElement`。

## 十、保持组合接口显式

组合的目标是分离稳定外壳和可替换内容，不是查询或改写未知 child。新接口应遵守下面的约束。

### 1. 不依赖 child 的排列顺序表达语义

“第一个 child 是标题，第二个 child 是正文”把协议藏在位置中。调用处无法直接看出职责，插入一个
节点还会改变后续位置。命名区域能把相同信息写进类型和调用代码。

### 2. 不读取未知 child 的标签类型决定业务行为

外壳若要求调用方必须传某种业务数据，应把数据声明成明确字段。扫描 `child.type` 既不能可靠看到
组件内部输出，也会让外壳依赖调用方的实现细节。

### 3. 不向未知 child 隐式注入数据

React 19.2.8 仍然提供 `Children` 和 `cloneElement`，但官方明确提示这些 API 不常用，并且容易形成
脆弱代码或让数据流难以追踪。新组合接口优先使用直接 `children`、命名 `ReactNode` Props 或 render
prop，让数据从哪里来、进入哪个区域都能在调用处看见。

### 4. 让每个入口只有一个清楚职责

不要同时设计 `content`、`body` 和 `children` 三个等价入口，也不要让 `renderContent` 在缺失时再读取
`children` 作为隐式备选。一个职责对应一个入口，调用方不需要记忆覆盖顺序。

## 十一、Demo：三种组合接口

下面的 Demo 使用同一个 `LearningPanel` 外壳。第一个面板展示主要 `children` 与命名区域；第二个面板
同时展示命名区域、主要 `children` 和 `renderSummary`。

:::demo{id="react.core.learn.basics.children-and-composition.composition-boundaries-demo"}
:::

观察重点：

1. 两个面板拥有相同外壳，主要内容由调用方通过嵌套 JSX 提供。
2. `eyebrow` 与 `footer` 通过名称表达固定区域，不依赖 child 顺序。
3. `renderSummary` 接收组件提供的摘要数据并返回 `ReactNode`。
4. Demo 不扫描 child 结构，也不向 child 隐式注入数据。

## 十二、常见错误

:::pitfalls
### 错误：收到 children 却没有渲染

**触发条件：** 调用方写了嵌套内容，接收组件的返回结果却没有 `{children}`。

**原因：** 提供内容和决定内容位置是两个动作，React 不会自动选择插入点。

**后果：** 调用方提供的内容完全不可见，外壳只剩空区域。

**错误示例：**

```tsx
// 错误：忽略了收到的 children。
function Panel({ children: _children }: { children: ReactNode }) {
  return <section />
}
```

**正确写法：**

```tsx
// 在主要内容区域渲染 children。
function Panel({ children }: { children: ReactNode }) {
  return <section>{children}</section>
}
```

**验证方式：** 传入有辨识度的文本，确认文本出现在组件定义的主要内容区域。

### 错误：通用内容区域使用 ReactElement

**触发条件：** 容器允许文本和数字，却把 `children` 声明为 `ReactElement`。

**原因：** `ReactElement` 比实际接口更窄，会拒绝合法内容。

**后果：** 文本、数字或多个节点无法使用这个通用容器。

**错误示例：**

```tsx
type LabelProps = {
  children: ReactElement
}

<Label>纯文本</Label>
```

**正确写法：**

```tsx
type LabelProps = {
  children: ReactNode
}

// 接收通用可渲染内容。
function Label({ children }: LabelProps) {
  return <span>{children}</span>
}
```

**验证方式：** 分别传入文本、数字、element 和 Fragment，确认类型与接口允许范围一致。

### 错误：依赖 child 顺序表达区域

**触发条件：** 约定第一个 child 是侧栏、第二个 child 是工具栏、其余 child 是正文。

**原因：** 调用处看不到区域职责，插入或重排节点会改变含义。

**后果：** 组件调用对排列顺序产生隐藏依赖，维护者难以安全调整内容。

**错误示例：**

```tsx
<OrderedLayout>
  <nav>左侧导航</nav>
  <article>主要内容</article>
</OrderedLayout>
```

**正确写法：**

```tsx
<WorkspaceFrame sidebar={<nav>左侧导航</nav>} toolbar={<strong>工具栏</strong>}>
  <article>主要内容</article>
</WorkspaceFrame>
```

**验证方式：** 只阅读调用代码，应能直接指出导航、工具栏和主要内容各自进入哪个区域。

### 错误：静态内容也包装成 render prop

**触发条件：** 函数不接收组件提供的数据，只返回一段固定节点。

**原因：** 函数没有增加定制能力，只增加调用层级。

**后果：** 接口多出无意义的间接调用，类型和调用代码都更复杂。

**错误示例：**

```tsx
<Panel renderHeading={() => <strong>固定标题</strong>}>正文</Panel>
```

**正确写法：**

```tsx
<Panel heading={<strong>固定标题</strong>}>正文</Panel>
```

**验证方式：** 若函数不接收组件提供的数据，移除函数后表达能力应保持不变。

### 错误：扫描或改写未知 child

**触发条件：** 外壳依赖 child 的标签类型、内部层级或隐式注入的数据。

**原因：** 隐藏协议让数据来源难以追踪，并把外壳耦合到调用方实现细节。

**后果：** child 替换为文本、Fragment 或另一个组件后，外壳行为可能失效。

**错误示例：**

```tsx
// 错误：要求外壳根据未知 child 的类型猜测并注入 tone。
<ImplicitToneFrame>
  <StatusText>连接正常</StatusText>
</ImplicitToneFrame>
```

**正确写法：**

```tsx
// tone 的来源和作用范围在调用处可见。
<ToneFrame tone="success">
  <StatusText>连接正常</StatusText>
</ToneFrame>
```

**验证方式：** 调用代码应能直接说明数据从哪里进入，不需要查看外壳怎样识别 child。
:::

## 十三、源码推导与适用场景

### 1. 可以依赖的公开规则

- TSX 标签之间的内容通过 `children` prop 传入组件，组件必须在返回结果中显式放置它。
- `ReactNode` 表示 React 可以渲染的通用内容，`ReactElement` 表示已经创建的单个 element 对象。
- Props 是只读输入，组合组件不能通过修改收到的 element 或数据建立隐藏写回通道。
- `Children` 和 `cloneElement` 仍可用，但官方把它们列为不常用能力，并提示其容易形成脆弱代码。

### 2. 从公开规则得到的接口判断

一个主要 UI 区域使用 `children`，多个稳定区域使用命名 `ReactNode` Props。只有组件拥有数据且调用方
需要决定表现形式时才使用 render prop。组件若需要读取、校验或计算原始值，应接收明确的数据 Props，
而不是从未知 child 的标签、位置或内部结构反推数据。

### 3. 适用边界

这些组合方式适合布局外壳、内容容器、工具栏、状态区域和可替换的数据展示。若需求是共享可变状态、
跨层级更新或连接外部系统，应使用对应的 State、Context 或 Effect 边界；`children` 本身只负责传递
可渲染内容，不提供状态所有权、事件协议或生命周期管理。

## 十四、练习

:::exercise
### 设计一个多区域内容外壳

**要求：** 定义 `ArticleMeta`，包含只读 `author: string` 与 `readMinutes: number`；定义
`ArticleLayoutProps`，包含 `navigation: ReactNode`、`actions: ReactNode`、`meta: ArticleMeta`、
`renderMeta: (meta: ArticleMeta) => ReactNode` 和 `children: ReactNode`。把命名区域分别放入 `<nav>`
与 `<header>`，把 `children` 放入 `<main>`，把 `meta` 交给 `renderMeta` 后将结果放入 `<footer>`。

**验收：** 调用方通过嵌套 JSX 提供两段正文，通过命名 Props 提供导航和操作区域，通过 render prop
显示作者与阅读时长；调用代码能直接看出每块内容的归属；函数参数与返回类型准确；实现不读取 child
标签、排列顺序或内部结构，也不克隆或改写 child。
:::

## 十五、知识点总结

- 组件标签之间的 TSX 会成为 `children` prop，接收组件在返回结果中决定它出现的位置。
- `ReactNode` 适合文本、数字、element、Fragment、多个节点和空节点等通用内容。
- `ReactElement` 只适合确实要求一个 element 对象的窄接口，不能可靠限定某一种 JSX 标签。
- `children: ReactNode` 要求提供属性，但不保证内容可见。
- 一个主要内容区域使用 `children`，多个语义区域使用职责明确的命名 `ReactNode` Props。
- render prop 把组件拥有的数据交给调用方生成 UI，返回值使用 `ReactNode` 表达。
- 原始数据使用明确的数据 Props，已经创建好的 UI 才使用 `ReactNode` 组合区域。
- 组合接口不应依赖 child 顺序、标签类型或隐式注入；输入来源和内容去向应在调用处可见。

## 十六、参考资料

- [Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component)
- [Using TypeScript](https://react.dev/learn/typescript#typing-children)
- [Common components](https://react.dev/reference/react-dom/components/common)
- [Children](https://react.dev/reference/react/Children)
- [cloneElement](https://react.dev/reference/react/cloneElement)
