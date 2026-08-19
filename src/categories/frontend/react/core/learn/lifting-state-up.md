---
id: react.core.learn.intermediate.lifting-state-up
type: lesson
title: State 提升
summary: 把共享事实交给最近共同父组件，并用受控或非受控合同明确当前值的唯一所有者。
domain: frontend
technology: react
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 90
prerequisites:
  - react.core.learn.intermediate.state-structure
related:
  - react.core.learn.basics.props
  - react.core.learn.basics.use-state
  - react.core.learn.basics.state-ownership-and-thinking-in-react
tags:
  - React
  - State
  - 提升 State
  - 单一事实来源
  - 单向数据流
appliesTo: React 19.2 官方文档与 React 19
verifiedAt: 2026-08-16
objectives:
  - 能判断多个组件是否共享同一个事实，并找到覆盖全部读取者和更新入口的最近共同父组件。
  - 能删除重复 State，只把最小源事实提升给唯一所有者，再用值 Props 和回调 Props 连接子组件。
  - 能区分父组件的协调职责与子组件的渲染、事件职责，避免重复派生值和提升过度。
  - 能区分受控 value、更新回调与非受控 defaultValue，并用 TypeScript 判别联合表达互斥合同。
  - 能处理空字符串、undefined、null 与组件所有权模式稳定性边界。
recap:
  - 多个组件必须使用同一事实时，把最小源 State 移到它们的最近共同父组件。
  - 提升的关键是删除副本，而不是在父组件再增加一份 State。
  - 当前值和回调都由父组件通过 Props 向下传递，子组件调用回调报告用户意图。
  - 每份 State 只有一个明确所有者，但不需要把应用所有 State 放在同一处。
  - 共享规则由所有者协调，展示结果在 render 中派生，局部临时状态仍靠近使用者。
  - 受控组件由调用方提供当前值和更新回调，非受控组件只从 defaultValue 初始化内部 State。
  - 同一实例的所有权模式保持稳定，受控文本始终使用字符串，包括合法的空字符串。
sources:
  - title: Sharing State Between Components
    url: https://react.dev/learn/sharing-state-between-components
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 提升 State 的步骤与最近共同父组件
      - 值和事件处理器通过 Props 传递
      - 每份 State 的单一事实来源
  - title: Thinking in React
    url: https://react.dev/learn/thinking-in-react
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 按 State 使用者确定所有者
      - 父到子的单向数据流
  - title: Choosing the State Structure
    url: https://react.dev/learn/choosing-the-state-structure
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 避免冗余和重复 State
      - 临时 UI State 保持局部
  - title: You Might Not Need an Effect
    url: https://react.dev/learn/you-might-not-need-an-effect
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 不同组件 State 需要同步时优先考虑提升
      - 删除副本减少同步路径
  - title: memo
    url: https://react.dev/reference/react/memo
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 优先局部 State，不要提升超过必要范围
  - title: <input>
    url: https://react.dev/reference/react-dom/components/input
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - value、onChange、defaultValue 的文本输入合同
      - 受控文本值的空值与生命周期模式边界
---

# State 提升

## 一、学习目标

- 判断多个组件是否共享同一个事实，并找到覆盖全部读取者和更新入口的最近共同父组件。
- 删除重复 State，只把最小源事实提升给唯一所有者，再用值 Props 和回调 Props 连接子组件。
- 区分父组件的协调职责与子组件的渲染、事件职责，避免重复派生值和提升过度。
- 区分受控 `value`、更新回调与非受控 `defaultValue`，并用判别联合表达互斥合同。
- 正确处理 `''`、`undefined`、`null` 和组件所有权模式稳定性边界。

## 二、为什么需要提升 State

两个兄弟输入框分别调用 `useState('')` 时，即使初始内容一样，它们也拥有两份独立 State。用户编辑
其中一个，另一个不会自动变化。如果产品要求两个输入、一个预览和字符统计始终表示同一段文字，
“让它们自己同步”就把一个事实变成了多个需要维护的副本。

提升 State 的目标不是把 setter 移到更高文件，而是重新确定所有权：删除重复副本，让覆盖全部使用者
的最近共同父组件保存唯一源事实，再向下提供当前值和更新入口。

## 三、核心心智模型

### 1. 相同初始值不等于共享

下面两个组件各自记住自己的 `text`：

```tsx
import { useState } from 'react'

/** 保存并渲染一份独立文本。 */
function LocalInput({ label }: { label: string }) {
  const [text, setText] = useState('')
  return (
    <label>
      {label}
      <input value={text} onChange={(event) => setText(event.currentTarget.value)} />
    </label>
  )
}
```

渲染两个 `LocalInput` 会创建两份 State。若它们本来就允许独立编辑，这个设计没有问题；若它们必须
显示同一内容，组件树中就需要一个共同所有者。

### 2. 最近共同父组件覆盖全部使用者

先列出谁读取这份 State、谁可以触发它变化，再沿树向上找到覆盖这些组件的最近共同父组件：

```text
SharedEditor（拥有 text）
├── SyncedInput A（读取 text，报告编辑意图）
├── SyncedInput B（读取 text，报告编辑意图）
└── SharedPreview（读取 text）
```

“最近”限制了影响范围。只服务于这一组编辑组件的文字不需要被提升到页面根部；所有者只要位于真实
使用者之上即可。若现有父组件只负责布局，也可以在这个边界建立一个小型协调组件。

### 3. 单一事实来源按每份 State 判断

单一事实来源表示每一份独立 State 都有一个明确所有者，不表示应用只能有一个 State 容器。共享文字
可以由 `SharedEditor` 拥有，某个输入自己的聚焦提示仍可留在输入组件。判断单位是业务事实，而不是
整个组件。

## 四、提升 State 的四步

### 1. 写清共享事实

先用一句可验证的话描述不变量，例如：

**共享不变量：** 两个输入框、预览和字符数必须始终使用同一段当前文字。

“页面状态”“表单数据”过于宽泛。描述越具体，越容易找出真正的源字段和使用者。

### 2. 删除子组件中的重复 State

提升的第一步是删除副本。不能在父组件新增 `text` 后，继续让子组件执行
`useState(value)`；那只是从两份副本变成三份副本。

### 3. 通过值 Props 传递当前数据

子组件把值当作当前 render 的只读输入：

```tsx
interface SyncedInputProps {
  label: string
  value: string
  onValueChange: (nextValue: string) => void
}

/** 渲染父组件提供的当前值。 */
function SyncedInput({ label, value, onValueChange }: SyncedInputProps) {
  return (
    <label>
      {label}
      <input
        value={value}
        onChange={(event) => onValueChange(event.currentTarget.value)}
      />
    </label>
  )
}
```

父组件更新后重新 render，两个输入会在新 Props 中读到同一个当前值。子组件不修改 Prop，也不为它
建立镜像。

### 4. 通过回调 Props 报告更新意图

父组件把函数作为 Prop 向下传递。子组件在用户事件中调用函数，报告“希望使用这个新值”；真正的
setter 仍由所有者执行：

```tsx
import { useState } from 'react'

/** 保存共享文字并向两个输入提供相同数据合同。 */
function SharedEditor() {
  const [text, setText] = useState('')
  return (
    <section>
      <SyncedInput label="输入 A" value={text} onValueChange={setText} />
      <SyncedInput label="输入 B" value={text} onValueChange={setText} />
      <p>{text === '' ? '暂无内容' : text}</p>
    </section>
  )
}
```

可以把方向记成：

```text
父组件 State --值 Prop--> 子组件渲染
父组件回调 --函数 Prop--> 子组件事件 --调用--> 所有者更新自己的 State
```

回调本身仍是向下传递的 Prop。这里不是双向绑定，也不是子组件直接修改父组件 State。

## 五、完整示例：同步编辑器

下面的完整例子只有一份 `text`。预览和字符数都是当前 render 的派生结果，不需要额外 setter：

```tsx
import { useState } from 'react'
import type { ChangeEvent } from 'react'

interface SyncedInputProps {
  label: string
  value: string
  onValueChange: (nextValue: string) => void
}

/** 把输入事件转换为字符串更新意图。 */
function SyncedInput({ label, value, onValueChange }: SyncedInputProps) {
  /** 读取当前输入值并交给共享 State 所有者。 */
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onValueChange(event.currentTarget.value)
  }

  return (
    <label>
      <span>{label}</span>
      <input value={value} maxLength={60} onChange={handleChange} />
    </label>
  )
}

/** 协调全部共享文字使用者。 */
export default function SharedEditor() {
  const [text, setText] = useState('React State')
  const visibleText = text === '' ? '暂无内容' : text

  return (
    <section>
      <SyncedInput label="编辑器 A" value={text} onValueChange={setText} />
      <SyncedInput label="编辑器 B" value={text} onValueChange={setText} />
      <p>{visibleText}</p>
      <small>{text.length} / 60 个字符</small>
    </section>
  )
}
```

### 1. 数据流说明

1. `SharedEditor` 在一次 render 中读取唯一 `text`。
2. 两个 `SyncedInput` 和预览得到同一个快照。
3. 用户编辑输入 A，A 调用 `onValueChange(nextValue)`。
4. 所有者执行 `setText(nextValue)`，React 请求下一次 render。
5. 下一次 render 中，A、B、预览和字符数都从新的 `text` 得到结果。

整个流程没有同步 Effect，也没有“先更新 A、稍后复制给 B”的中间状态。

## 六、共享后的组件职责

### 1. 父组件负责协调

共同父组件应负责：

- 保存共享的最小源事实。
- 执行跨组件不变量，例如“最多一个面板激活”。
- 把当前值和语义明确的更新入口交给使用者。
- 删除可由源事实计算的重复字段。

### 2. 子组件仍然有明确职责

子组件应负责：

- 根据当前 Props 渲染界面。
- 收集输入、点击等本地用户事件。
- 调用回调表达意图，不直接改写所有者的数据。
- 保留只服务于自己的临时 UI State。

提升一份 State 不要求子组件变成完全无状态组件。只有真正需要共享的事实才移动。

## 七、高级用法：用稳定 ID 表达共享不变量

多个面板最多只能展开一个时，不要保存一组可能冲突的布尔值。父组件保存一个最小的
`activePanelId`，各面板从它计算 `isActive`：

```tsx
import { useState } from 'react'

interface PanelProps {
  title: string
  isActive: boolean
  onShow: () => void
}

/** 渲染一个由父组件协调的内容面板。 */
function Panel({ title, isActive, onShow }: PanelProps) {
  return (
    <article>
      <h3>{title}</h3>
      {isActive ? <p>当前面板内容</p> : <button onClick={onShow}>展开</button>}
    </article>
  )
}

/** 保存唯一激活面板 ID，并保证最多一个面板激活。 */
function SharedAccordion() {
  const [activePanelId, setActivePanelId] = useState('overview')
  return (
    <section>
      <Panel
        title="概览"
        isActive={activePanelId === 'overview'}
        onShow={() => setActivePanelId('overview')}
      />
      <Panel
        title="详情"
        isActive={activePanelId === 'details'}
        onShow={() => setActivePanelId('details')}
      />
    </section>
  )
}
```

这里唯一源事实是激活面板 ID。`isActive` 是 render 中的派生值，不应再次保存。示例没有展开列表
identity 或使用 `key` 重置 State；那些是后续独立知识点。

## 八、组合 Demo：观察一份 State 驱动多个组件

Demo 的两个输入、预览和字符数都读取同一份共享文字。请依次尝试：

1. 在编辑器 A 输入内容，观察编辑器 B 和预览同步变化。
2. 再从编辑器 B 修改，确认 A 仍显示同一结果。
3. 填入边界样例，观察长文本换行且四个使用者一致。
4. 清空内容，确认两个输入为空，预览显示明确空状态，字符数为 `0 / 60`。

:::demo{id="react.core.learn.intermediate.lifting-state-up.synced-inputs-demo"}
:::

观察时重点检查共享文字只有一个 `useState`，子组件只读取 `value` 并调用 `onValueChange`。

## 九、易错使用提示

:::pitfalls
### 错误一：为同一个共享事实保留多份 State

**触发条件：** 兄弟组件各自调用 `useState`，或子组件把父级 `value` 再复制进内部 State，但业务要求
这些位置始终显示同一个值。

**原因：** 相同初始值和 `useState(value)` 都只会创建新的内存位置，不会建立共享关系。

**后果：** 任一副本更新后，其他位置可能保留旧值，还要增加容易遗漏的同步路径。

**错误示例：**

```tsx
/** 错误地把父级当前值复制成第二份 State。 */
function MirroredInput({ value }: { value: string }) {
  const [localValue, setLocalValue] = useState(value)
  return <input value={localValue} onChange={(event) => setLocalValue(event.currentTarget.value)} />
}
```

**正确写法：** 删除子组件副本，由最近共同父组件保存唯一值并传给全部读取者。

```tsx
const [text, setText] = useState('')
const firstInput = <SyncedInput label="输入 A" value={text} onValueChange={setText} />
const secondInput = <SyncedInput label="输入 B" value={text} onValueChange={setText} />
```

**验证方式：** 编辑任一输入后，另一输入和父级预览在下一次 render 中显示相同值；源码中只有一个
表示当前文本的 State。

### 错误二：让某个兄弟组件拥有共享值

**触发条件：** 左侧面板保存 `selectedId`，右侧兄弟面板也要读取它。

**原因：** 所有者不在全部使用者之上，普通 Props 无法从兄弟横向传递。

**后果：** 出现绕行回调、重复副本或隐式通信。

**错误示例：** 把 `selectedId` 留在 `LeftPanel`，再要求 `RightPanel` 猜测当前选择。

```tsx
const leftPanel = <LeftPanel selectedId={selectedId} />
```

**正确写法：** 把 `selectedId` 移到两个面板的最近共同父组件。

```tsx
const coordinatedPanels = <section>
  <LeftPanel selectedId={selectedId} />
  <RightPanel selectedId={selectedId} />
</section>
```

**验证方式：** 从唯一所有者到每个读取者都存在清楚的向下 Prop 路径。

### 错误三：直接修改 Prop

**触发条件：** 子组件给 `value` 赋值，或把 Prop 当成可写的双向变量。

**原因：** 混淆当前输入和更新入口。

**后果：** State 所有者不明确，也没有可靠的 React 更新请求。

**错误示例：**

```tsx
value = event.currentTarget.value
```

**正确写法：** 调用父组件传入的 `onValueChange(event.currentTarget.value)`。

```tsx
onValueChange(event.currentTarget.value)
```

**验证方式：** 子组件只读取值 Prop；唯一 setter 位于所有者组件。

### 错误四：为同一规则保存多种表示

**触发条件：** 规则要求最多一个面板展开，却同时保存 `firstOpen`、`secondOpen` 和当前面板 ID。

**原因：** 可由源事实计算的结果也被放进 State，同一规则出现多个可独立更新的表示。

**后果：** 两个布尔值可能同时为 `true`，切换时必须协调多个 setter，遗漏一次就会产生冲突状态。

**错误示例：** 为每个面板各写一份 `useState(false)`。

```tsx
const [firstOpen, setFirstOpen] = useState(false)
const [secondOpen, setSecondOpen] = useState(false)
```

**正确写法：** 只保存一个 `activePanelId`，在 render 中用比较结果得到各面板的 `isActive`。

```tsx
const [activePanelId, setActivePanelId] = useState('first')
const isFirstActive = activePanelId === 'first'
```

**验证方式：** 连续切换面板，任意时刻最多一个激活；派生布尔值没有 setter，也没有同步流程。

### 错误五：把所有局部 State 提升到应用根部

**触发条件：** 单个输入草稿、hover 或局部提示都被移动到页面顶层。

**原因：** 把单一事实来源误解为单一全局容器，为假设中的未来需求提前集中。

**后果：** 无关组件、Props 路径和重置范围被耦合。

**错误示例：** 页面根组件保存每个列表项的 hover 状态。

```tsx
const [hoveredItemId, setHoveredItemId] = useState<string | null>(null)
```

**正确写法：** 只提升真实共享的事实，临时 UI State 留在最近使用者。

```tsx
const [isHovered, setIsHovered] = useState(false)
```

**验证方式：** 为每份 State 列出读取者；只有一个局部读取者的值不应位于远端祖先。

### 错误六：混用受控当前值与非受控初始值

**触发条件：** 组件同时接收 `value` 和 `defaultValue`，用 `value || internalValue` 选择显示值，或在用户
编辑后改变 `defaultValue` 并期待覆盖当前内容。

**原因：** `value` 表示调用方拥有的当前值，`defaultValue` 只初始化组件内部 State；空字符串虽然是
falsy，仍是合法的受控值。

**后果：** 清空受控输入时会重新显示内部旧值，改变 `defaultValue` 又无法可靠替换已经存在的当前值，
组件所有者随输入内容漂移。

**错误示例：**

```tsx
const [internalValue, setInternalValue] = useState(defaultValue)
const currentValue = value || internalValue
```

**正确写法：** 用判别字段固定合同；受控分支始终读取 `value`，非受控分支只在初始化时读取
`defaultValue`。

```tsx
type FieldProps =
  | { mode: 'controlled'; value: string; onValueChange: (value: string) => void }
  | { mode: 'uncontrolled'; defaultValue?: string }

const currentValue = props.mode === 'controlled' ? props.value : internalValue
```

**验证方式：** 受控实例传入 `value=""` 时保持空白；非受控实例编辑后，即使调用方改变
`defaultValue`，当前输入仍保持用户编辑值；同一实例没有模式切换 warning。
:::

## 十、受控与非受控：把值所有权写进组件合同

提升 State 解决的是“多个组件共同使用一份事实”。当共享值被封装成一个可复用组件后，还要继续回答
一个更具体的问题：这份值由组件调用方保存，还是由组件自己保存？这就是受控与非受控的区别。

受控与非受控只描述某一份重要信息的所有权，不是给整个组件永久贴标签。一个编辑器可以让标题受控，
同时把焦点提示、展开状态等只服务于自身的 UI State 留在内部。

| 问题 | 受控 | 非受控 |
| --- | --- | --- |
| 当前值的所有者 | 调用方的 State | 组件内部的 State |
| 当前值入口 | `value` | 内部 State |
| 初始值入口 | 调用方 State 的初始值 | `defaultValue` |
| 用户编辑 | 回调报告，调用方同步写回 | 组件内部直接更新 |
| 外部替换 | 更新调用方 State | 只改变 `defaultValue` 不会覆盖当前值 |
| 配置成本 | 较高，需要值和更新回调 | 较低，只需初始值也能使用 |

### 1. 受控组件：value 是当前值

受控组件每次 render 都从 `value` 读取要显示的当前值。组件不应该再执行
`useState(value)` 保存同义副本，否则调用方和组件内部会同时声称自己拥有这份值。

```tsx
import { useState } from 'react'

interface TitleFieldProps {
  value: string
  onValueChange: (nextValue: string) => void
}

/** 直接渲染调用方的当前标题，并报告用户的更新意图。 */
function ControlledTitleField({ value, onValueChange }: TitleFieldProps) {
  return (
    <label>
      <span>标题</span>
      <input
        value={value}
        onChange={(event) => onValueChange(event.currentTarget.value)}
      />
    </label>
  )
}

/** 保存受控字段的唯一当前值。 */
function ControlledEditor() {
  const [title, setTitle] = useState('React State')
  return <ControlledTitleField value={title} onValueChange={setTitle} />
}
```

`value` 只负责提供当前快照，`onValueChange` 只负责报告更新意图。子组件调用回调并不会让数据反向
流动；回调本身仍然是父组件向下传入的函数 Prop，真正的 State 更新由所有者完成。

如果只传 `value` 而没有同步更新它，输入会继续显示旧值，用户的编辑会在下一次 render 后被覆盖。确实
需要只读显示时，应明确使用 `readOnly`，不要把一个没有更新入口的输入误当成可编辑受控组件。

### 2. 非受控组件：defaultValue 只提供初始值

非受控组件把当前值保存在组件内部。调用方可以用 `defaultValue` 提供第一次初始化时的建议值，但它不
是后续 render 的持续显示合同。

```tsx
import { useState } from 'react'

interface LocalTitleFieldProps {
  defaultValue?: string
}

/** 只在初始化时读取 defaultValue，之后由内部 State 保存编辑。 */
function UncontrolledTitleField({ defaultValue }: LocalTitleFieldProps) {
  const [title, setTitle] = useState(defaultValue ?? '')
  return (
    <label>
      <span>本地标题</span>
      <input value={title} onChange={(event) => setTitle(event.currentTarget.value)} />
    </label>
  )
}
```

父组件后来把 `defaultValue` 改成另一段文字，并不会覆盖这个实例已经输入的内容。若产品要求外部按钮
随时载入、清空或撤销当前值，就应该从一开始使用受控合同，而不是把 `defaultValue` 当作持续同步入口。

### 3. 用判别联合让两种合同互斥

自定义组件可以用 `mode` 明确选择所有权模式。受控分支只接收 `value` 和必需的更新回调，非受控分支
只接收 `defaultValue`；这样 TypeScript 会在调用点阻止两套值合同混用。

```tsx
import { useState } from 'react'
import type { ChangeEvent } from 'react'

interface ControlledFieldProps {
  mode: 'controlled'
  label: string
  value: string
  onValueChange: (nextValue: string) => void
}

interface UncontrolledFieldProps {
  mode: 'uncontrolled'
  label: string
  defaultValue?: string
  onValueChange?: (nextValue: string) => void
}

type FieldProps = ControlledFieldProps | UncontrolledFieldProps

/** 按判别字段决定当前值由调用方还是组件内部拥有。 */
function Field(props: FieldProps) {
  const [internalValue, setInternalValue] = useState(
    props.mode === 'uncontrolled' ? (props.defaultValue ?? '') : '',
  )
  const currentValue = props.mode === 'controlled' ? props.value : internalValue

  /** 把事件值交给当前模式的唯一所有者。 */
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.currentTarget.value
    if (props.mode === 'controlled') {
      props.onValueChange(nextValue)
      return
    }
    setInternalValue(nextValue)
    props.onValueChange?.(nextValue)
  }

  return <input aria-label={props.label} value={currentValue} onChange={handleChange} />
}
```

以下调用分别符合两种合同：

```tsx
<Field mode="controlled" label="标题" value={title} onValueChange={setTitle} />
<Field mode="uncontrolled" label="草稿" defaultValue="初始草稿" />
```

这些调用应被类型系统拒绝：

```tsx
// 同一个字段同时声明两种所有权。
<Field
  mode="controlled"
  label="冲突字段"
  value={title}
  defaultValue="本地初始值"
  onValueChange={setTitle}
/>

// 受控字段缺少调用方的更新入口。
<Field mode="controlled" label="冻结字段" value={title} />
```

判别字段比检查 `Boolean(value)` 或 `value || internalValue` 稳定。空字符串是合法的受控值，不能因为它
是 falsy 就把组件误判为非受控。

## 十一、值边界与模式稳定性

### 1. 空字符串是合法的受控空值

文本受控输入应在每次 render 收到字符串。清空输入时传 `value=""`，并继续提供同步更新回调；空字符串
并不表示“没有传 value”。

```tsx
const [title, setTitle] = useState('')

return <Field mode="controlled" label="标题" value={title} onValueChange={setTitle} />
```

### 2. `undefined` 与 `null` 先在边界归一化

接口返回的可缺失值不能直接混入受控文本合同。若产品把缺失标题解释为空输入，可以在边界使用
`title ?? ''`；如果 `null` 表示“尚未加载”而不是空标题，则应另外保存加载状态，不能依靠受控/非受控
切换来表达两种业务语义。

```tsx
interface ApiTitleProps {
  title: string | null | undefined
  onTitleChange: (nextValue: string) => void
}

/** 把可缺失的业务值归一化为稳定的受控字符串。 */
function ApiTitleField({ title, onTitleChange }: ApiTitleProps) {
  return (
    <Field
      mode="controlled"
      label="标题"
      value={title ?? ''}
      onValueChange={onTitleChange}
    />
  )
}
```

| 传入情况 | 对文本受控组件的含义 | 处理方式 |
| --- | --- | --- |
| `value=""` | 受控，当前值为空 | 保持受控并同步写回 |
| `value={undefined}` | 没有稳定的字符串当前值 | 先归一化或改用非受控合同 |
| `value={null}` | 业务缺失值，不是文本合同 | 转成字符串或另建业务状态 |
| 不传 `value` | 非受控候选 | 可用 `defaultValue` 初始化 |

### 3. 同一实例不能在两种模式之间切换

同一输入首次不传 `value`、之后传入字符串，会从非受控变成受控；反过来从字符串变成
`undefined`，又会失去调用方的当前值。React 会对此发出 warning，使用者也无法判断哪一方是最终所有者。

因此应在组件实例首次创建时就确定模式，并保持到卸载：

- 受控实例始终传字符串 `value` 和同步更新回调。
- 非受控实例始终使用内部 State，`defaultValue` 只参与初始化。
- 不要通过修改 `key` 来掩盖模式切换；如果确实需要两种模式，应渲染两个明确的实例。

## 十二、受控与非受控的选择

选择受控的信号：

- 页面按钮需要载入、清空、撤销或替换当前值。
- 多个组件需要实时读取同一份值。
- 校验、格式化、提交前规则必须看到每次编辑后的当前内容。
- 调用方需要统一规定 State 变化的合法路径。

选择非受控的信号：

- 当前值只服务于组件内部，没有兄弟组件协调需求。
- 调用方只提供一个初始草稿，不需要持续覆盖用户编辑。
- 希望减少调用方配置，让组件封装自己的编辑细节。

受控不代表组件完全没有内部 State；组件仍可拥有只服务于自己的聚焦提示、展开状态或错误显示。非受控
也不代表调用方永远不能观察事件，但可选通知回调不会改变当前值的所有权。

## 十三、官方事实、课程推导与适用边界

### 1. 官方事实

- 需要协调的组件应把 State 提升到最近共同父组件。
- 提升过程会删除子组件 State，由父组件通过 Props 传入当前值和事件处理器。
- 每份 State 都应有一个明确的单一事实来源。
- React 数据沿组件层级从父组件向子组件传递。
- 冗余和重复 State 难以保持同步；临时 UI State 应尽量保持局部。

### 2. 课程推导

- 先写共享不变量、列出使用者，再选择所有者，能避免凭组件名称猜位置。
- 回调 Prop 应表达用户意图，所有者可以在一个入口中维护跨组件规则。
- 提升后仍要删除派生字段，否则只移动位置，没有减少事实数量。
- 所有者应位于覆盖真实使用者的最小合理边界，需求变化时再调整。

### 3. 适用场景

- 多个附近组件必须显示同一个当前值。
- 一个子组件的交互必须立即影响兄弟组件。
- 父组件需要保证“最多一个激活”“选择与预览一致”等共享不变量。
- 一组组件共同使用同一个稳定 ID、筛选条件或编辑内容。

### 4. 不适用场景

- State 只被一个组件使用：保留局部。
- 值可由当前 Props 或 State 计算：在 render 中派生。
- 远程数据、缓存或跨页面持久化：不属于本课。
- 复杂状态转换、深层跨树传递和外部状态管理：不属于本课的值所有权问题。

## 十四、练习

:::exercise
### 提升两个温度输入的共享值

**要求：** 两个兄弟输入分别显示摄氏温度和同一数值的只读摘要。先解释为什么两份局部 State 会分叉，
再把唯一 `temperature` 移到最近共同父组件。输入组件接收 `value` 和 `onValueChange`，摘要直接从当前
值渲染。添加清空路径，但不要保存 `isEmpty` 或摘要文字。

**验收：** 源码只有一个温度 State；任一输入路径都通过父级回调更新；所有使用者显示相同当前值；
空状态由当前字符串计算；没有父子镜像或兄弟副本。
:::

:::exercise
### 为标题字段选择稳定的所有权模式

**要求：** 实现一个带 `mode` 判别字段的 `TitleField`。受控分支接收字符串 `value` 和必需的
`onValueChange`，非受控分支接收可选 `defaultValue`。分别渲染一个固定模式实例；受控实例支持外部
载入和用 `''` 清空，非受控实例显示内部当前值，并验证父级改变 `defaultValue` 后不会覆盖已有编辑。

**验收：** TypeScript 拒绝同传 `value` 与 `defaultValue`、受控缺少回调；受控输入与父级 State 同步；
非受控输入保持自己的当前值；同一实例从首次 render 到卸载都没有模式切换 warning。
:::

## 十五、本节小结

- 多个组件必须使用同一个事实时，把最小源 State 提升到最近共同父组件。
- 提升首先删除子组件副本，再由父组件传值和更新回调。
- 子组件调用回调报告意图，真正的 State 更新仍由唯一所有者完成。
- 单一事实来源按每份 State 判断，不要求把应用全部 State 集中到根组件。
- 父组件协调共享不变量，子组件渲染当前 Props 并处理本地事件。
- 可计算结果不另存 State，只服务于一个组件的临时状态也不应提升过度。
- 受控组件由调用方通过 `value` 和更新回调拥有当前值；非受控组件由内部 State 拥有当前值。
- `defaultValue` 只参与非受控初始化，`''` 是合法受控空值，`undefined` 与 `null` 应先归一化。
- 使用判别联合表达互斥 Props，并让每个组件实例从始至终保持一种所有权模式。

## 十六、官方来源

- [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) - 提升步骤、
  最近共同父组件、Props、事件处理器和单一事实来源。
- [Thinking in React](https://react.dev/learn/thinking-in-react) - 按使用者确定 State 所有者与单向数据流。
- [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) - 避免重复 State 和
  保持临时 UI State 局部。
- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) - 多组件同步时优先
  调整 State 所有权。
- [memo](https://react.dev/reference/react/memo) - 只用于说明不要把局部 State 提升超过必要范围。
- [React `<input>`](https://react.dev/reference/react-dom/components/input) - `value`、`onChange`、
  `defaultValue`、空值与受控/非受控生命周期合同。
