---
id: react.core.learn.advanced.memo-component-bailout
type: lesson
title: memo 与组件跳过渲染
summary: 在父组件更新时比较新旧 Props，跳过没有价值的子组件 render，并用测量判断优化是否成立。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 90
prerequisites:
  - react.core.learn.advanced.profiler-render-measurement
  - react.core.learn.advanced.use-memo-value-caching
related:
  - react.core.learn.basics.component-purity
  - react.core.learn.intermediate.state-structure
  - react.core.learn.intermediate.context-providing-and-reading
tags:
  - React
  - memo
  - Props
  - Object.is
  - 渲染性能
appliesTo: React 19.2
verifiedAt: 2026-08-17
objectives:
  - 能写出 memo 的完整签名，并说明原组件、记忆化组件与可选比较函数的职责。
  - 能解释父组件更新时 React 如何逐项使用 Object.is 比较新旧 Props。
  - 能区分父级 Props、组件自身 State 与组件所读 Context 三种更新来源。
  - 能识别对象、数组、函数和 children 的引用身份如何影响跳过机会。
  - 能用更小的 Props 合同减少无意义变化，并判断何时不需要 memo。
  - 能审查自定义比较函数的正确性与成本，并用 Profiler 验证实际收益。
recap:
  - memo 返回新的记忆化组件，不修改原组件，也不增加业务状态。
  - 父组件更新且每个 Prop 都通过 Object.is 比较时，React 通常可以跳过组件 render。
  - memo 是性能优化而非正确性保证，移除后界面和交互仍应正确。
  - 组件自身 State 或所读 Context 变化时，记忆化组件仍会 render。
  - 新对象、数组、函数和 JSX 元素会形成新引用，可能使默认比较判定 Prop 已变化。
  - 自定义比较必须覆盖每个 Prop，包括函数，并证明比较比重新 render 更便宜。
  - 只有重复 render 昂贵且 Props 经常不变时，memo 才可能带来可测收益。
sources:
  - title: memo
    url: https://react.dev/reference/react/memo
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - memo 的签名、参数、返回值、默认 Props 比较和性能优化定位
      - State、Context、引用 Props 与自定义比较函数的行为边界
  - title: React 19.2 memo 固定文档
    url: https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/memo.md
    sourceType: source-code
    appliesTo: React 19.2
    claims:
      - 固定本课采用的 memo 公开语义与风险说明
  - title: React 19.2.8 ReactMemo Source
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactMemo.js
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - memo element type 保存原组件与可选 compare 的实现佐证
  - title: React 19.2.8 ReactFiberBeginWork Source
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberBeginWork.js
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 默认浅比较、更新来源检查与 bailout 路径的固定版本实现佐证
  - title: Profiler
    url: https://react.dev/reference/react/Profiler
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 用 actualDuration 与 baseDuration 比较记忆化前后的更新成本
---

# memo 与组件跳过渲染

## 一、学习目标

- 写出 `memo(Component, arePropsEqual?)`，说明两个参数和返回组件分别承担什么职责。
- 解释父组件更新时默认 Props 比较的触发条件，以及逐项 `Object.is` 的含义。
- 判断一次 render 来自父级 Props、组件自己的 State，还是组件读取的 Context。
- 识别对象、数组、函数和 `children` 的引用变化，找出破坏跳过机会的具体 Prop。
- 设计更小、更稳定的 Props 合同，不用记忆化掩盖 State 位置或 Effect 链问题。
- 用相同交互路径比较普通组件与记忆化组件，并审查自定义比较函数是否正确且值得。

## 二、为什么需要组件记忆化

父组件的 State 更新时，React 通常会继续 render 它的子组件。多数 render 很便宜，直接执行最清楚；但
某些子组件会格式化大量数据、计算复杂图形或生成较大的元素树。如果这些工作已经被测得明显昂贵，而本次
父级更新又没有改变子组件的任何输入，重复执行就可能没有价值。

`memo` 为这种情况建立组件级性能边界。父组件再次 render 时，React 先比较记忆化组件的新旧 Props；
当每个 Prop 都满足比较条件时，React 通常可以复用先前结果，跳过调用该组件。它处理的是“相同父级输入
带来的重复组件工作”，不是数据存储、资源缓存或业务状态控制。

使用 `memo` 前必须满足两个基础条件：

1. 组件 render 保持纯净。相同 Props、State 和 Context 应得到相同输出，不在 render 中写外部数据。
2. 不使用 `memo` 时功能已经正确。记忆化只能改变可能执行的工作量，不能修复闪烁、重复请求或错误状态。

## 三、最小模型与 API

### 1. `memo` 接收组件并返回新组件

完整调用形式是：

```tsx
const MemoizedComponent = memo(Component, arePropsEqual?)
```

- `Component` 是需要记忆化的 React 组件。
- `arePropsEqual` 是可选的新旧 Props 比较函数，通常不提供。
- 返回值是新的记忆化组件。`memo` 不修改传入的原组件。

最常见的写法先声明纯组件，再在模块顶层包装：

```tsx
import { memo } from 'react'

type ReportProps = Readonly<{
  title: string
  total: number
}>

/** 根据报告 Props 渲染摘要。 */
function Report({ title, total }: ReportProps) {
  return (
    <p>
      {title}：{total}
    </p>
  )
}

/** 为父级相同 Props 的更新提供跳过 render 的机会。 */
const MemoizedReport = memo(Report)
```

`MemoizedReport` 与 `Report` 接收同一套 Props，也必须产生相同的功能结果。调用方只是在需要性能边界的
位置使用记忆化版本。

### 2. 记忆化不增加业务状态

`memo` 不保存表单值、请求响应或业务 ID，也不让组件脱离 React 更新模型。它只允许 React 在特定父级
更新路径中复用先前结果。组件仍然可以拥有 State、读取 Context、渲染子组件并响应事件。

因此下面两个组件的业务能力相同：

```tsx
<Report title="季度报告" total={12} />
<MemoizedReport title="季度报告" total={12} />
```

区别只在后续父组件 render 时，记忆化版本多了一次 Props 比较机会。

### 3. 跳过 render 不是绝对保证

React 官方把 `memo` 定义为性能优化，而不是保证。即使 Props 没有变化，React 仍可能再次调用组件。
正确组件必须能安全地重复 render，不能依赖“组件函数从此不会执行”来维持功能。

最直接的删除检查是临时移除 `memo`：

- 页面内容应保持正确。
- 事件处理应读取当前数据。
- 外部资源不应重复创建或泄漏。
- 允许变化的只有 render 次数和测量结果。

## 四、父组件更新与默认 Props 比较

### 1. 比较发生在父组件带来的更新路径

考虑父组件同时保存报告版本和一个无关的面板计数：

```tsx
/** 渲染报告和父级面板计数。 */
function Dashboard() {
  const [panelRevision, setPanelRevision] = useState(0)
  const [reportVersion, setReportVersion] = useState(1)

  return (
    <>
      <button onClick={() => setPanelRevision((value) => value + 1)}>
        面板更新 {panelRevision}
      </button>
      <button onClick={() => setReportVersion((value) => value + 1)}>修改报告</button>
      <MemoizedReport title="季度报告" total={reportVersion} />
    </>
  )
}
```

只更新 `panelRevision` 时，传给 `MemoizedReport` 的 `title` 和 `total` 没有变化，出现跳过机会。更新
`reportVersion` 时，`total` 变化，组件必须 render 并显示新结果。

### 2. 默认逐项使用 `Object.is`

省略第二个参数时，React 比较每个新 Prop 与对应旧 Prop，比较语义是 `Object.is`：

```tsx
Object.is('已发布', '已发布') // true
Object.is(3, 3) // true
Object.is(Number.NaN, Number.NaN) // true
Object.is(0, -0) // false
Object.is({ page: 1 }, { page: 1 }) // false
Object.is(() => {}, () => {}) // false
```

标量值通常按值保持相同。对象、数组、函数和 React 元素按引用比较；内容看起来相同，不代表是同一个值。
默认比较不会递归打开对象，也不会执行函数来判断行为是否一致。

### 3. 任一 Prop 变化都会失去默认跳过机会

默认比较覆盖组件收到的全部 Props。只要新增、删除或改变其中一项，React 就会把这次输入视为不同：

```tsx
<MemoizedReport title="季度报告" total={12} />
<MemoizedReport title="季度报告" total={13} />
```

`title` 保持相同，但 `total` 从 `12` 变为 `13`，组件必须 render。`memo` 不是“只要大部分 Props
相同就跳过”，也不会判断某个 Prop 在本次输出中是否恰好没有被使用。

## 五、State 与 Context 更新边界

### 1. 组件自身 State 变化仍会 render

记忆化只处理父组件传入的 Props。组件自己的 State 变化时，它仍需要计算新界面：

```tsx
/** 显示可展开的报告详情。 */
const MemoizedDetails = memo(function Details({ title }: { title: string }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <section>
      <button onClick={() => setExpanded((value) => !value)}>{title}</button>
      {expanded ? <p>完整详情</p> : null}
    </section>
  )
})
```

点击按钮改变 `expanded` 时，即使 `title` 没变，组件也必须 render。否则界面无法展开。

### 2. 组件读取的 Context 变化仍会 render

如果记忆化组件读取 Context，Provider 值变化时组件仍会 render：

```tsx
/** 使用当前主题显示报告标题。 */
const MemoizedHeading = memo(function Heading({ title }: { title: string }) {
  const theme = useContext(ThemeContext)
  return <h2 className={theme}>{title}</h2>
})
```

`title` 相同只能说明 Props 未变，不能屏蔽 `ThemeContext` 的新值。把这次 render 归因于“memo 失效”会
混淆更新来源。

如果组件只需要 Context 的一小部分，可以让外层组件读取 Context，再把最小信息传给记忆化子组件：

```tsx
/** 从主题 Context 中提取当前报告真正需要的色调。 */
function ThemedReport({ title }: { title: string }) {
  const theme = useContext(ThemeContext)
  return <MemoizedReportTone title={title} tone={theme.reportTone} />
}

/** 只根据标题和色调渲染报告。 */
const MemoizedReportTone = memo(function ReportTone({
  title,
  tone,
}: {
  title: string
  tone: string
}) {
  return <p className={tone}>{title}</p>
})
```

外层仍响应 Context；只有提取后的 `title` 或 `tone` 变化时，内层 Props 才变化。是否值得这样拆分仍需
结合组件职责和测量结果判断。

### 3. 设置相同 State 值可能独立跳过更新

React 文档还说明：把 State 设置为当前值时，即使没有 `memo`，React 也可能跳过组件更新。开发环境中
仍可能看到组件函数额外调用一次，但结果会被丢弃。

这与 `memo` 的父级 Props 比较是两条不同路径。观察到组件没有 commit 时，应先确认事件是否真的产生了
新 State，再判断是否由记忆化带来。

## 六、设计更稳定的 Props

### 1. 只传组件真正需要的信息

Props 越宽，任一字段变化导致重新 render 的机会越多。与其传入整个对象，可以让组件接收它真正需要的
字段：

```tsx
// 对象包含组件不使用、但可能频繁变化的字段。
<MemoizedProfile person={person} />

// Props 合同只保留组件真正读取的信息。
<MemoizedProfile name={person.name} age={person.age} />
```

这不是要求机械拆散所有对象，而是让组件边界表达真实依赖。若组件确实需要完整对象，保留对象 Prop 可能
更清楚；此时再检查对象的所有者是否能在数据未变时保留引用。

### 2. 投影为变化频率更低的信息

有时组件只关心“是否存在”，而不是完整值。把输入投影成布尔值可以减少无关变化：

```tsx
/** 只显示当前用户是否有可用分组。 */
const MemoizedGroupNotice = memo(function GroupNotice({ hasGroups }: { hasGroups: boolean }) {
  return <p>{hasGroups ? '已有分组' : '尚无分组'}</p>
})

/** 把完整用户数据投影成通知组件需要的布尔值。 */
function Profile({ person }: { person: Person }) {
  return <MemoizedGroupNotice hasGroups={person.groups !== null} />
}
```

只要 `hasGroups` 保持相同，`person` 的其他字段变化不会进入该组件的 Props 比较。

### 3. 对象与数组需要稳定所有者

JSX 中直接创建对象或数组，会在每次父组件 render 时得到新引用：

```tsx
<MemoizedChart options={{ compact: true }} points={[12, 18, 24]} />
```

可以根据数据来源选择更清楚的所有者：

- 真正不变的配置放在模块级常量中。
- 已经由父组件 State 持有的数据，在没有更新时自然保持引用。
- 昂贵的纯派生对象只有在测量后才考虑 `useMemo`；缓存值不是本课的主线。
- 如果子组件只需要少数字段，优先缩小 Props，而不是先增加缓存。

### 4. 函数和 `children` 也是 Props

父组件 render 中声明的函数每次都会形成新函数。把它传给记忆化组件时，默认比较会判定 Prop 已变化：

```tsx
<MemoizedToolbar onSave={() => submitReport(reportId)} />
```

这段代码功能正确，也不意味着看到函数就必须缓存。先证明组件 render 昂贵、其他 Props 稳定，而且函数
确实是唯一变化项；函数身份和依赖由 `useCallback` 负责，本课不展开其用法。

`children` 同样是 Prop。父组件每次 render 时新建的 JSX 元素通常也是新对象：

```tsx
<MemoizedPanel>
  <ReportChart />
</MemoizedPanel>
```

因此不能假设“只要写在标签内部就不会影响比较”。应检查实际传入值的身份，并判断这个记忆化边界是否
必要。

## 七、自定义比较函数的风险

### 1. 返回值描述输出和行为是否等价

`memo` 的第二个参数接收旧 Props 和新 Props：

```tsx
/** 判断两组受限数据是否会产生相同图表。 */
function areChartPropsEqual(previous: ChartProps, next: ChartProps): boolean {
  return previous.points === next.points && previous.onSelect === next.onSelect
}

const MemoizedChart = memo(Chart, areChartPropsEqual)
```

返回 `true` 表示新旧 Props 会产生相同输出和相同行为，React 可以复用旧结果；返回 `false` 表示必须
render。它不是“是否要更新”的随意开关。

### 2. 必须比较每个 Prop，包括函数

漏掉数据 Prop 可能保留旧界面，漏掉函数 Prop 还可能保留旧闭包。若旧 `onClick` 闭包了父组件上一次
render 的 Props 或 State，而 comparator 对新旧函数返回 `true`，用户点击时会读取陈旧数据。

审查 comparator 时需要逐项回答：

- 每个 Prop 是否都参与比较？
- 函数 Prop 是否按身份比较？
- 返回 `true` 时，输出和事件行为是否都相同？
- Props 类型增加字段后，比较函数是否同步更新？

### 3. 比较成本必须低于重新 render

自定义比较本身也会在父级更新时执行。对未知深度对象做递归深比较，可能比重新 render 更慢，数据结构
变化后甚至造成长时间阻塞。

只有在无法通过更小 Props 或稳定所有者解决、数据深度已知且有限，并且正式测量证明 comparator 更便宜
时，才值得保留。默认逐项比较更容易审查，也更不容易留下陈旧闭包。

## 八、测量与使用决策

### 1. 先建立未优化基线

在加入 `memo` 前，先用 Profiler 包裹最小候选子树，固定输入、设备、运行环境和操作顺序，收集多次同类
update。需要确认：

- 哪个父级更新触发了子组件 render？
- 子组件 Props 是否真的没有变化？
- 这次 render 的 `actualDuration` 是否稳定地占用可感知成本？
- 问题是否其实来自 Effect 链、State 放置过高或更大的组件边界？

### 2. 同时满足三个条件才有明确价值

`memo` 通常在以下条件同时成立时才值得：

1. 组件 render 已测得明显昂贵。
2. 组件经常因为父级更新而重复 render。
3. 这些更新中，组件的每个 Prop 经常保持相同。

轻量组件、低频更新或 Props 几乎每次都变化时，比较和额外包装通常没有可解释收益。

### 3. 用相同路径复测并执行删除检查

加入 `memo` 后使用完全相同的交互路径，比较多次同类 commit。若预期的跳过没有发生，逐项检查 Props，
不要继续叠加缓存。如果跳过发生但总成本没有可复现改善，可以移除优化以保持代码直接。

最后临时删除 `memo`，确认业务结果、State、Context、事件和资源行为不变。这个检查能暴露把性能优化误当
正确性条件的设计。

## 九、用法示例或 Demo

下面的 Demo 让普通报告与 `memo` 报告接收相同的标量 Props，并执行相同的确定性计算。两个报告内部各有
一个 Profiler，只有真正完成 render 的分支才会追加 commit 记录。

观察顺序：

1. 冷挂载后两边各有一次 `mount`。
2. 清空记录，两边回到零条。
3. 点击“仅更新父组件”，普通报告增加一条，`memo` 报告保持零条。
4. 点击“修改报告 Props”，两边都增加一条并显示相同的新版本。
5. 再次清空记录，可以从当前 Props 开始重复同一观察路径。

这说明 `memo` 跳过的是父级相同 Props 带来的重复工作，不会阻止真实 Props 更新。

:::demo{id="react.core.learn.advanced.memo-component-bailout.parent-update-demo"}
:::

## 十、易错使用提示

:::pitfalls
### 错误一：让功能正确性依赖 memo

**触发条件：** 组件重复 render 就会写两次外部变量，因此用 `memo` 阻止第二次调用。

**原因：** render 本应保持纯净，却把性能优化当成副作用开关。

**后果：** Props、State、Context 或 React 自身调度再次触发 render 时，外部数据仍被错误修改。

**错误示例：**

```tsx
/** 错误：render 修改组件外部的日志。 */
function Report({ item }: { item: string }) {
  auditLog.push(item)
  return <p>{item}</p>
}

const MemoizedReport = memo(Report)
```

**正确写法：**

```tsx
/** 相同输入始终产生相同输出，不写外部数据。 */
function Report({ item }: { item: string }) {
  return <p>{item}</p>
}

const MemoizedReport = memo(Report)
```

**验证方式：** 删除 `memo` 并重复 render；界面仍正确，render 不修改外部状态。

### 错误二：认为相同 Props 时绝对不会 render

**触发条件：** 把“组件函数不会再执行”写成业务或测试必须满足的永久合同。

**原因：** React 把 `memo` 定义为性能优化，不提供绝对跳过保证。

**后果：** 组件逻辑依赖未承诺的调度行为，开发检查或运行条件变化后出现错误。

**错误示例：**

```tsx
// 错误：业务结果依赖 Receipt 只执行一次。
const MemoizedReceipt = memo(Receipt)
```

**正确写法：**

```tsx
// Receipt 可安全重复执行，memo 只减少已测量的重复工作。
const MemoizedReceipt = memo(Receipt)
```

**验证方式：** 主动移除 `memo`；功能保持不变，只允许测量结果变化。

### 错误三：把默认比较当成对象深比较

**触发条件：** 两个对象字段相同，就断言 `memo` 会把它们视为相同 Prop。

**原因：** 默认比较逐项使用 `Object.is`，不会递归读取对象字段。

**后果：** 父组件每次传入新引用，子组件继续 render，预期优化没有发生。

**错误示例：**

```tsx
<MemoizedReport options={{ page: 1 }} />
```

**正确写法：**

```tsx
<MemoizedReport page={1} />
```

**验证方式：** 比较相邻父级 render 的对象引用，并核对 Profiler 是否真的减少 commit。

### 错误四：每次传入新对象或数组

**触发条件：** 在 JSX 或父组件 render 中每次创建新的集合。

**原因：** 新对象和新数组具有新引用，即使字段或元素相同也不是相同 Prop。

**后果：** 记忆化组件在每次父级更新时继续 render。

**错误示例：**

```tsx
<MemoizedChart points={[12, 18, 24]} />
```

**正确写法：**

```tsx
const stablePoints = [12, 18, 24] as const

/** 传入由模块稳定拥有的只读数据。 */
function Dashboard() {
  return <MemoizedChart points={stablePoints} />
}
```

**验证方式：** 确认输入未变时数组引用稳定，再比较父级更新后的组件 commit。

### 错误五：忽略函数 Prop 的身份

**触发条件：** 父组件每次 render 都创建处理函数，同时期待 `memo` 子组件跳过。

**原因：** 函数按引用比较；新函数无法通过默认 `Object.is`。

**后果：** 其他 Props 虽然稳定，函数 Prop 仍让组件继续 render。

**错误示例：**

```tsx
<MemoizedToolbar onSave={() => submitReport(reportId)} />
```

**正确写法：**

```tsx
// 先测量并确认函数是唯一变化的 Prop，再选择函数身份方案。
<MemoizedToolbar onSave={saveReport} />
```

**验证方式：** 比较相邻 render 的 `onSave` 引用并核对 Profiler，不因看到箭头函数就直接增加缓存。

### 错误六：认为 memo 会阻止 State 或 Context 更新

**触发条件：** 组件自己的 State 或所读 Context 变化后，仍期待界面保持旧结果。

**原因：** `memo` 只比较父组件传入的 Props，不屏蔽组件自己的更新来源。

**后果：** 把正常 render 误诊为记忆化失效，或错误隐藏真实状态变化。

**错误示例：**

```tsx
// 错误预期：ThemeContext 变化时 MemoizedPanel 不应 render。
const MemoizedPanel = memo(Panel)
```

**正确写法：**

```tsx
// Panel 读取的新主题仍应显示；相同 Props 只处理父级更新路径。
const MemoizedPanel = memo(Panel)
```

**验证方式：** 分别触发父级无关 State、组件自身 State 与 Context 更新，记录每次 render 的真实来源。

### 错误七：不测量就包装所有组件

**触发条件：** 把 `memo` 当成每个组件都必须使用的代码风格。

**原因：** 忽略比较成本、Props 变化频率和组件本身的 render 成本。

**后果：** 代码增加包装和身份约束，却没有可复现收益。

**错误示例：**

```tsx
/** 错误：轻量标签没有测量依据却被记忆化。 */
const MemoizedLabel = memo(function Label({ text }: { text: string }) {
  return <span>{text}</span>
})
```

**正确写法：**

```tsx
/** 轻量标签默认直接 render。 */
function Label({ text }: { text: string }) {
  return <span>{text}</span>
}
```

**验证方式：** 在相同路径下收集多次 Profiler 数据；没有可解释收益时移除 `memo`。

### 错误八：自定义比较漏掉 Prop

**触发条件：** comparator 只比较数据字段，忽略函数或后来新增的 Prop。

**原因：** 返回 `true` 会复用旧输出；被遗漏的函数可能继续闭包旧 Props 与 State。

**后果：** UI 看似没有更新，事件处理却读取陈旧数据。

**错误示例：**

```tsx
const MemoizedChart = memo(Chart, (previous, next) => previous.points === next.points)
```

**正确写法：**

```tsx
// 默认先使用逐项比较，并通过更小、更稳定的 Props 保持合同清楚。
const MemoizedChart = memo(Chart)
```

**验证方式：** 若确实使用 comparator，列出并比较每个 Prop，尤其是函数；同时证明比较成本低于重新
render，不对未知深度数据做递归深比较。
:::

## 十一、源码推导与适用场景

1. React 19.2 官方文档规定：`memo` 返回新的记忆化组件；父组件 render 且 Props 未变时通常跳过组件，
   但这只是性能优化，不是保证。
2. 默认比较会对每个 Prop 使用 `Object.is`。React 19.2.8 固定源码在默认路径中执行浅比较，并在 Props、
   ref 与更新来源等条件允许时进入 bailout。
3. 固定源码还会检查是否存在已安排的组件更新或 Context 更新，因此公开文档中的 State/Context 边界与
   实现路径一致。
4. `memo` 创建的 element type 保存原组件和可选 comparator；内部 Fiber 标签、lane、复用 Props 对象和
   bailout 函数名都是实现细节，不是应用代码可以依赖的合同。
5. 课程层面的选择标准是：组件纯净、重复 render 昂贵、父级更新频繁、Props 经常相同，并且同路径测量
   显示工作减少。缺少任一条件时都应先保持直接 render。
6. 自定义 comparator 只适合数据深度明确、全部 Props 可完整比较且测量证明成本更低的少数场景；它不能
   用来掩盖不稳定数据模型或陈旧闭包。

## 十二、练习

:::exercise
### 练习一：建立标量 Props 的跳过证据

**要求：** 创建一个普通报告和一个 `memo` 报告，让两者只接收 `title` 与 `version`。连续三次更新父级
无关 State，再修改一次 `version`，记录两边的 commit。

**验收：** 能解释为什么无关更新只让普通报告增加记录；`version` 变化后两边都显示新值；移除
`memo` 后功能完全一致。
:::

:::exercise
### 练习二：定位破坏比较的引用 Prop

**要求：** 依次向记忆化报告传入 JSX 内新建的对象、数组、函数和 `children`，每次只改变一种 Prop
来源。记录相邻父级 render 的 `Object.is` 结果和组件 commit，再把 Props 缩小到真正需要的信息。

**验收：** 能指出具体是哪一项 Prop 形成新引用；修正后无关更新可跳过；没有为了小计算机械加入
额外缓存。
:::

:::exercise
### 练习三：区分 Props、State 与 Context

**要求：** 在同一个记忆化组件中加入局部展开 State，并读取主题 Context。分别触发父级无关更新、Props
更新、局部 State 更新和 Context 更新，预测并记录每次 render。

**验收：** 只有父级更新且 Props 相同时属于 Props bailout；State 与 Context 变化仍正常更新界面；
不会把正常更新误判为 `memo` 失效。
:::

:::exercise
### 练习四：审查自定义比较函数

**要求：** 为一段包含数据和事件函数 Props 的 comparator 列出完整字段，构造函数闭包变化但数据不变的
情况。先说明漏比函数的错误结果，再用正式测量比较 comparator 与重新 render 的成本。

**验收：** comparator 返回 `true` 时输出和事件行为都等价；每个 Prop 都被比较；不对未知深度数据
做深比较；没有证据证明更快时恢复默认比较。
:::

## 十三、本节小结

- `memo(Component, arePropsEqual?)` 返回新组件，不修改原组件，也不增加业务状态。
- 父组件更新且每个 Prop 都满足比较条件时，React 通常可以跳过记忆化组件 render，但不作绝对保证。
- 默认比较逐项使用 `Object.is`；对象、数组、函数和 React 元素是否相同取决于引用身份。
- 组件自己的 State 和所读 Context 变化时，记忆化组件仍会 render。
- 更小的 Props、稳定的数据所有者和合理的 State 位置，通常比堆叠缓存更容易维护。
- 自定义比较必须覆盖每个 Prop、避免未知深度比较，并证明成本低于重新 render。
- 先建立普通组件基线，再用同一路径复测；删除 `memo` 后功能必须保持正确。

## 十四、参考资料

- [`memo`](https://react.dev/reference/react/memo) - API、默认比较、State/Context、Props 设计、性能边界与
  自定义比较风险，适用于 React 19.2。
- [React 19.2 固定 `memo` 文档](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/memo.md) - 固定本课采用的公开语义。
- [React 19.2.8 `ReactMemo.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactMemo.js) - `memo` element type 与可选 comparator 的实现佐证。
- [React 19.2.8 `ReactFiberBeginWork.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberBeginWork.js) - 默认浅比较、更新来源检查与 bailout 路径的实现佐证。
- [`Profiler`](https://react.dev/reference/react/Profiler) - 用 commit 与两类 duration 验证记忆化收益。
