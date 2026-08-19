# State 提升研究记录

## 知识点合同

- 目标条目：`react.core.learn.intermediate.lifting-state-up`
- 目标标题：State 提升
- 教学范围：本科 React 组件、Props、`useState`、事件处理与基础 TypeScript
- 核验日期：`2026-08-16`
- 官方文档基线：React `19.2`
- 仓库依赖基线：React / React DOM `19.2.8`
- 研究状态：I02 官方研究，待正文、Demo、注册信息和浏览器证据按当前批次闭环

本课解决一个明确问题：多个组件需要读取或改变同一个当前事实时，如何确定唯一所有者，并让数据沿
组件树清晰流动。核心做法是删除需要协调的子组件中的重复 State，把最小且完整的源事实提升到最近
共同父组件，再通过值 Props 和更新回调让子组件读取当前值、报告用户意图。受控与非受控不是另一个
孤立 API，而是同一所有权模型在组件边界上的两种稳定合同。

本课必须覆盖：

1. 每个组件实例的 State 默认独立；相同初始值不等于共享同一个事实。
2. 列出一份事实的所有读取者和更新者，找到覆盖它们的最近共同父组件。
3. 先移除子组件中的重复 State，再由共同父组件拥有唯一源事实。
4. 父组件通过 Props 向下传当前值，子组件通过父组件传下的回调报告更新意图。
5. 单一事实来源按“每份 State 一个明确所有者”判断，不等于所有 State 都集中在根组件。
6. 只提升需要共享的部分；只服务一个组件的草稿、hover、展开提示等临时 UI State 可以留在局部。
7. 选择最小源事实，避免保存互相矛盾的布尔值、对象副本或可由现有值计算出的展示结果。
8. 理解受控信息由调用方的 Props 驱动，非受控信息由组件内部 State 或 DOM 驱动。
9. 受控合同使用当前 `value` 与同步更新回调；非受控合同使用 `defaultValue` 初始化内部值。
10. 同一份信息不能同时由 `value` 与 `defaultValue` 表达，同一实例不能在两种模式间切换。
11. 文本受控值始终使用字符串；`''` 是合法受控空值，不能让 `undefined` 或 `null` 充当模式开关。
12. 能用 TypeScript 判别联合表达互斥的受控/非受控 Props，并知道这是课程 API 设计而非 React 强制命名。

明确排除：State 在组件树中的位置身份、组件类型匹配、`key` 重置和子树重建；Reducer、Context、Effect、
Ref、缓存和外部 Store；`memo`、`useMemo`、`useCallback` 性能优化；远程数据、请求状态、表单 Action、
复杂验证、表单控件矩阵；高级泛型、条件类型和库作者级 API。排除项不作为本课解决方案，也不在示例中
以“顺便介绍”的方式展开。

## 研究问题

1. 两个兄弟组件各自调用 `useState` 时，为什么不会自动共享当前值？
2. 什么条件说明两个组件表示同一个事实，而不是两个合法的局部状态？
3. 为什么默认把 State 放到最近共同父组件，而不是任意祖先或应用根？
4. 提升时应保存什么源事实，哪些布尔值、对象和计数应在 render 中计算？
5. 值 Prop、回调 Prop 和子组件事件调用如何组成可追踪的单向数据流？
6. 为什么子组件调用回调不等于子组件直接修改父组件 State？
7. 受控与非受控描述的是整个组件，还是组件中的某一份重要信息？
8. `value`、同步 `onChange`、`defaultValue` 分别表达什么所有权和时间边界？
9. 为什么不能混用两组 Props，也不能在一次挂载期间切换模式？
10. `value=""`、`value={undefined}`、`value={null}` 和不传 `value` 的合同有什么差别？
11. 什么场景应使用受控模式，什么场景保留非受控模式更简单？
12. 怎样通过源码、TypeScript 检查、交互和 console 证据证明所有权合同成立？

## 证据方法

### 搜索顺位

本次先按仓库规则调用 Tavily，三个官方限定查询均返回账户用量上限错误：

```text
Tavily API error: This request exceeds your plan's set usage limit.
```

按照既定顺位切换到 Exa，Exa 仅用于发现候选和回取页面内容。候选全部限定为 `react.dev`，没有采用
社区文章、搜索摘要或二手教程作为课程证据。已知官方 URL 再通过 `curl -L --fail --silent --show-error`
做原页核验；原页包含 `closest common parent`、`source of truth`、`controlled`、`uncontrolled` 和
`defaultValue` 等对应段落。Tavily 用量失败是外部服务限制，不改变官方来源要求。

### Exa 查询记录

| ID | 查询意图 | 候选结果 | 采用方式 |
| --- | --- | --- | --- |
| E1 | React 官方提升 State、最近共同父组件、受控/非受控 | `Sharing State Between Components` | 回取整页并逐段核对 |
| E2 | React 官方 State 所有者、Props 向下、事件回调 | `Thinking in React` | 回取整页并逐段核对 |
| E3 | React 官方冗余 State、重复 State、局部临时 State | `Choosing the State Structure` | 回取整页并逐段核对 |
| E4 | React DOM 文本输入 `value`、`onChange`、`defaultValue`、模式切换 | `<input>` | 回取整页并逐段核对 |
| E5 | 当前官方文档版本 | `React Versions` | 回取版本页核对版本口径 |

### 采用的第一方来源

| 来源 ID | URL | 直接支持的 claim |
| --- | --- | --- |
| `react-sharing-state` | https://react.dev/learn/sharing-state-between-components | 删除子组件 State、提升到最近共同父组件、值和事件处理器 Props、单一事实来源、受控/非受控术语 |
| `react-thinking` | https://react.dev/learn/thinking-in-react | 列出所有使用者、寻找最近共同父组件、决定 State 所有者、父到子单向数据流 |
| `react-state-memory` | https://react.dev/learn/state-a-components-memory | State 私有于组件实例；重复渲染同一组件得到隔离 State；同步需求应移到共同父组件 |
| `react-state-structure` | https://react.dev/learn/choosing-the-state-structure | 避免矛盾/冗余/重复 State、保存最小源事实、临时 UI State 留在局部 |
| `react-input` | https://react.dev/reference/react-dom/components/input | `value` 当前控制、同步 `onChange`、`defaultValue` 初始值、不能混用或切换、字符串空值边界 |
| `react-versions` | https://react.dev/versions | 官方文档版本与同一 major 内的维护口径 |

## 版本与 TypeScript 边界

React 官方版本页当前把 `19.2` 标为 latest version，并说明文档在同一 major 内持续更新，不为每个 minor
或 patch 发布独立文档快照。[`react-versions`]

仓库锁定 React / React DOM `19.2.8`。本主题依赖函数组件、Props、`useState` 和 DOM 输入公开合同，
没有使用 React 19 专属 API；正文应按当前依赖运行验证，但不能把 `19.2.8` 表述为一个独立官方文档版本。

TypeScript 只用于把值与回调合同写清楚，例如 `value: string`、`onValueChange: (nextValue: string) => void`。
`mode` 判别联合可以在编译期阻止 `value` 与 `defaultValue` 混用，但这是课程设计的类型表达，不是 React
要求所有自定义组件必须提供 `mode` 属性。[`react-input`][`react-sharing-state`]

## 官方事实

### 1. State 默认属于声明它的组件实例

React 官方说明，State 是组件实例的私有记忆；同一个组件渲染两次时，两份 State 完全隔离，修改其中
一份不会改变另一份。[`react-state-memory`：https://react.dev/learn/state-a-components-memory]

因此，两个输入都用 `useState('')` 只说明它们恰好从同一个字面量开始，不说明它们共享同一个当前文本。
如果产品要求它们始终显示同一事实，就必须重新设计所有权；如果它们本来允许独立编辑，保留两个局部
State 才是正确行为。[`react-state-memory`][`react-sharing-state`]

### 2. 提升 State 的官方三步

React 的官方提升示例给出明确顺序：

1. 从需要协调的子组件中移除 State。
2. 先由共同父组件传入固定数据，验证 Props 控制子组件。
3. 把 State 加到共同父组件，并把当前值和事件处理器一起传下去。

这三步不是把 setter 随意搬到另一个文件，而是完成“子组件副本删除、父组件唯一所有者建立、子组件
通过合同读取和报告”的所有权迁移。[`react-sharing-state`]

### 3. 最近共同父组件是默认所有者

应先列出每份 State 的所有读取者，再沿组件树找到覆盖它们的最近共同父组件。该组件位于所有使用者
之上，能把同一当前值传给每个使用者，并集中维护跨组件不变量。React 的 `Thinking in React` 还允许
把 State 放在更高祖先，或新建一个位于共同父组件之上的专门所有者；这需要明确的范围理由，不是默认
把所有局部 State 放到根组件。[`react-thinking`]

```text
SharedEditor（最近共同父组件，拥有 text）
├── SyncedInput（读取 value，调用 onValueChange）
├── SyncedInput（读取 value，调用 onValueChange）
└── Preview（读取 text，render 中计算显示结果）
```

“最近”限制了 Props 路径和更新影响范围；“共同”保证每个读取者都能从同一所有者获得当前值。选择某个
兄弟组件作为所有者不能覆盖另一个兄弟组件，通常会迫使代码增加重复副本或绕行通信。[`react-thinking`]

### 4. 单一事实来源按每份 State 判断

React 官方把单一事实来源解释为：对每一份独立 State，选择一个具体组件作为拥有者。它不表示全部 State
都必须集中在同一个组件；输入草稿、hover 或只服务一个叶子组件的临时提示可以继续靠近使用者。[`react-sharing-state`]

共享的 `text` 由共同父组件拥有，子组件只收到当前值；只影响某个输入焦点样式的 State 可以留在该输入。
判断单位是“这份信息”，不是“这个组件是否允许存在 State”。[`react-sharing-state`][`react-state-structure`]

### 5. Props 向下，回调也向下；更新意图由子组件报告

Props 是父组件向子组件传递数据的公开输入。父组件拥有 State 后，把当前值作为值 Prop 传给子组件；
子组件不能把 Prop 当作可写变量，而应在用户事件中调用父组件传下的回调。回调执行后，父组件更新自己
拥有的 State，再次 render 并传下新值。[`react-thinking`][`react-sharing-state`]

```text
父组件 State -- value Prop --> 子组件渲染
父组件回调 -- onValueChange Prop --> 子组件事件
子组件调用回调 --> 父组件更新自己的 State --> 新一轮 Props
```

因此“向上报告更新意图”不是 React 的反向 State 流，也不是双向绑定。State 仍只由它的拥有者更新，子
组件只拥有一个由 API 明确授权的调用入口。[`react-sharing-state`][`react-thinking`]

### 6. 提升通常改变 State 的形状

如果规则是“同时最多一个面板激活”，两份 `isActive` 布尔值允许出现两个都为 `true` 的矛盾状态。官方
示例把 State 改成一个 `activeIndex`，再由 `activeIndex === index` 计算每个面板的 `isActive`，用一个
源字段表达不变量。[`react-sharing-state`]

同样地，多个组件共享文本时保存 `text` 即可；预览文案、字符数、是否有内容等结果由当前 `text` 在
render 中计算，不再建立第二份 State。可由 Props 或现有 State 得到的信息不应另存为 State。[`react-state-structure`]

### 7. 避免冗余、重复和互相矛盾的 State

官方 State 结构原则要求避免：

- 能从 Props 或已有 State 计算出的冗余值；
- 同一数据在多个 State 变量或嵌套对象中的重复副本；
- 可以互相冲突的多个布尔值或状态标记。

重复副本的每个更新入口都可能遗漏同步，导致界面显示不一致。提升 State 的目的正是删除同义副本，而
不是把多个 setter 集中到父组件后继续保留它们。[`react-state-structure`]

### 8. 受控与非受控是逐份信息的所有权描述

React 官方在提升页面中称：重要信息由 Props 驱动时，可以称为受控；由组件自己的 State 驱动时，可以称为
非受控。术语不是整个组件的严格二分，一个组件可以让文本值受调用方控制，同时保留自己的 hover 或
焦点提示 State。[`react-sharing-state`]

受控的价值是调用方能够完整指定行为并协调多个使用者；代价是调用方必须提供完整 Props 和更新逻辑。
非受控的配置较少，当前值封装在组件内部，但调用方不容易持续协调它。[`react-sharing-state`]

### 9. 原生文本输入的受控合同

对 React DOM `<input>`：

- `value` 指定当前文本；可编辑受控输入必须提供 `onChange`，并同步更新支撑 `value` 的 State。
- 如果有意只读，可以使用 `readOnly`；缺少 `onChange` 的可编辑受控输入不是非受控，而是错误合同。
- `value` 与 `defaultValue` 不能同时用于同一份文本。
- 同一输入实例不能在受控与非受控之间切换。
- `defaultValue` 只指定首次显示的默认文本，后续改变它不会持续覆盖用户编辑。
- 受控文本值应一直是字符串；空字符串 `''` 是合法的受控空值。

这些是 React DOM 的公开输入行为，不应被自定义组件的命名约定替代。[`react-input`]

### 10. 空值和模式边界

| 写法 | 合同 | 正确处理 |
| --- | --- | --- |
| `value=""` | 受控，当前值为空字符串 | 继续提供同步 `onChange`；不能借 falsy 语义放开控制 |
| `value={undefined}` | 没有稳定的受控文本值 | 不要先这样 render 再变成字符串；若要受控，归一化为 `''` |
| `value={null}` | 不是合法的受控文本字符串 | 根据业务语义转换为字符串或在输入外单独建模 |
| 不传 `value` | 非受控候选 | 可使用 `defaultValue` 提供一次性初始值 |

当业务值类型为 `string | null | undefined`，且缺失值应该显示为空输入，可以在调用方使用
`value={maybeValue ?? ''}`，保证从首次 render 起一直传字符串。如果 `null` 表示“尚未加载”而 `''` 表示
“用户清空”，应另外建模这两个业务状态，不能靠切换受控/非受控表达它们。[`react-input`]

### 11. `defaultValue` 只负责初始化

非受控组件的当前值由内部 State 或 DOM 保存。`defaultValue` 只是初始输入，后续用户编辑不会因为调用方
改变默认 Prop 而被覆盖；需要外部按钮、兄弟组件或业务规则持续指定当前值时，从首次 render 起使用受控
`value` 合同。[`react-input`]

对自定义组件，内部可以执行 `useState(defaultValue ?? '')` 完成一次初始化，之后用内部 setter 管理当前值。
调用方若只传一个可选通知回调，仍然没有获得当前值所有权；回调是观察/通知入口，不是持续控制入口。
这一区分是根据 React 的值来源定义推导出的 API 合同。[`react-sharing-state`][`react-input`]

### 12. 同一实例不能切换模式

典型错误是首轮 `value={undefined}`，数据到达后改为字符串；这会从非受控候选切换到受控，React 会在开发
环境报告 warning。反向从字符串改成 `undefined` 也会让原有所有权失效。自定义组件未必自动发出同样 warning，
但切换仍会让内部旧值与外部新值争夺显示结果，因此 API 应在一次挂载期间保持模式稳定。[`react-input`]

## 所有权决策流程

正文应将决策写成可重复步骤，不要求记忆具体组件名称：

1. 用一句话定义要保持一致的事实，例如“两个编辑入口显示同一段文本”。
2. 列出所有读取它的组件和所有能触发变化的用户事件。
3. 找到覆盖这些组件的最近共同父组件；若布局组件不适合持有 State，可在同一边界建立专门所有者。
4. 选择最小且完整的源事实，例如 `text`、`selectedId` 或 `activePanelId`，不保存每个展示结果。
5. 从子组件删除同义 State，避免 `useState(value)` 镜像受控 Prop。
6. 由所有者保存源 State，并将当前值以值 Prop 传给每个读取者。
7. 通过语义化回调 Prop 传下更新入口；子组件只在事件发生时调用它。
8. 检查不需要共享的临时 State 是否仍靠近真正使用者。
9. 若组件边界只需要初始值，选择非受控；若调用方需要持续协调，选择受控。
10. 受控/非受控 Props 互斥，并在一次挂载期间保持同一模式。
11. 对文本值在调用方边界归一化 `null`/`undefined`，不要以真值判断模式。

## 合同矩阵

| 问题 | State 提升后的共享值 | 受控组件值 | 非受控组件值 |
| --- | --- | --- | --- |
| 唯一所有者 | 最近共同父组件或专门协调组件 | 调用方 | 组件内部 State 或 DOM |
| 当前值入口 | 值 Prop | `value` | 内部 State / DOM 当前值 |
| 更新入口 | 语义化回调 Prop | `onChange` / `onValueChange`，调用方同步写回 | 组件内部事件处理，可选通知回调 |
| 初始值 | 所有者 State 初始值 | 所有者 State 初始值 | `defaultValue` |
| 外部按钮能否持续改变当前值 | 可以，更新共同所有者 | 可以，更新调用方 State | 默认不能，改 `defaultValue` 不覆盖当前编辑 |
| 协调能力 | 多个使用者共享同一事实 | 高 | 低 |
| 配置成本 | 取决于共享范围 | 较高，需要当前值和更新逻辑 | 较低，只需初始值时更简单 |
| 生命周期要求 | 所有者稳定 | 一直受控 | 一直非受控 |

“State 提升后的共享值”描述组件树内的位置关系；“受控/非受控”描述某一份信息在组件边界上的值来源。
同一个受控输入可以是共同父组件所拥有的 State 的消费者，而不是三套互相独立的技术。[`react-sharing-state`]

## TypeScript API 合同

下面是适合本科课程的最小判别联合。它表达所有权互斥，不引入高级类型工具：

```tsx
interface ControlledTitleProps {
  mode: 'controlled'
  label: string
  value: string
  onValueChange: (nextValue: string) => void
}

interface UncontrolledTitleProps {
  mode: 'uncontrolled'
  label: string
  defaultValue?: string
  onValueChange?: (nextValue: string) => void
}

type TitleFieldProps = ControlledTitleProps | UncontrolledTitleProps
```

运行时按 `mode` 选择当前值来源，而不是用 `Boolean(value)` 或 `value || internalValue` 猜模式。空字符串
必须继续走受控分支。受控分支不创建 `useState(value)` 镜像；非受控分支只从 `defaultValue` 初始化内部
State。`mode` 在同一个组件实例生命周期内应保持不变。[`react-input`][`react-sharing-state`]

最小实现合同：

```tsx
function TitleField(props: TitleFieldProps) {
  const [internalValue, setInternalValue] = useState(
    props.mode === 'uncontrolled' ? (props.defaultValue ?? '') : '',
  )
  const currentValue = props.mode === 'controlled' ? props.value : internalValue

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.currentTarget.value
    if (props.mode === 'controlled') {
      props.onValueChange(nextValue)
      return
    }
    setInternalValue(nextValue)
    props.onValueChange?.(nextValue)
  }

  return <input value={currentValue} onChange={handleChange} />
}
```

这里的原生 `<input>` 在非受控自定义组件内部仍然通过 `value={internalValue}` 实现可观察的内部 State；
对组件调用方来说，当前值所有权仍在 `TitleField`，并非调用方传入了 `value`。正文必须区分“自定义组件
对外合同”和“组件内部如何实现”，避免把内部实现误称为外部受控。

## 基础示例合同

两个输入共享一份 `text`：

```tsx
interface SyncedInputProps {
  label: string
  value: string
  onValueChange: (nextValue: string) => void
}

function SyncedInput({ label, value, onValueChange }: SyncedInputProps) {
  return (
    <label>
      <span>{label}</span>
      <input
        value={value}
        onChange={(event) => onValueChange(event.currentTarget.value)}
      />
    </label>
  )
}

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

源码检查应能看到：共享文本只有一个 `useState`；两个输入都接收同一 `value`；两个输入调用同一父级
更新入口；预览由 `text` 在 render 中计算；子组件没有 `useState(value)`、同步 Effect 或 Prop 赋值。
这段代码只依赖本科范围的 `useState`、Props、事件和 TypeScript 类型。[`react-sharing-state`][`react-thinking`]

## 高价值易错点

### 1. 两个兄弟组件各存同义 State

- 触发：两个输入各自 `useState('')`，要求编辑一处立即更新另一处。
- 原因：把同一个产品事实实现成两个独立内存位置。
- 后果：更新一个不会触发另一个的当前值更新，必须额外同步且容易遗漏。
- 正确：删除子组件 State，在最近共同父组件保存一份 `text`，向下传 `value` 和回调。
- 验证：输入 A 和输入 B 交替编辑，两个输入及预览始终相等。
- 来源：[`react-state-memory`][`react-sharing-state`]

### 2. 父组件有 State，子组件仍镜像 `useState(value)`

- 触发：子组件接收 `value`，又执行 `const [local, setLocal] = useState(value)`。
- 原因：只增加父级副本，没有删除子级副本。
- 后果：父级外部更新后，子组件可能继续显示旧镜像。
- 正确：受控分支直接渲染 `value`；需要局部编辑时明确选择非受控合同。
- 验证：父级按钮改变 `value` 后输入立即显示新值，源码没有同义 State。
- 来源：[`react-sharing-state`][`react-state-structure`][`react-input`]

### 3. 把 State 放进某一个兄弟组件

- 触发：左侧组件保存共享值，右侧组件也需要读取，但左侧不是右侧的祖先。
- 原因：所有者没有位于全部使用者之上。
- 后果：出现绕行回调、重复副本或隐式通信，数据来源难追踪。
- 正确：把值放到最近共同父组件或其上方明确的所有者组件。
- 验证：从所有者到每个读取者都存在清晰值 Prop 路径。
- 来源：[`react-thinking`][`react-sharing-state`]

### 4. 误以为子组件可以修改 Props

- 触发：在子组件中给 `value` 赋值，或把 Prop 当成双向绑定变量。
- 原因：混淆值所有权与事件入口。
- 后果：更新不会改变父级 State，所有者和渲染触发点不明确。
- 正确：调用 `onValueChange(nextValue)`，由所有者更新自己拥有的 State。
- 验证：唯一 setter 位于所有者，子组件只读取 `value` 并调用回调。
- 来源：[`react-thinking`][`react-sharing-state`]

### 5. 保存互相冲突的布尔值

- 触发：父组件保存 `firstOpen` 与 `secondOpen`，规则却要求最多一个打开。
- 原因：移动了位置但没有建模跨组件不变量。
- 后果：两个布尔值可以同时为 `true`，需要手工同步多个 setter。
- 正确：保存一个 `activeId` 或 `activeIndex`，render 中比较得到 `isActive`。
- 验证：连续激活不同面板，任意时刻最多一个 active，源码只有一个源字段。
- 来源：[`react-sharing-state`][`react-state-structure`]

### 6. 保存可计算结果或对象副本

- 触发：同时保存 `selectedId` 与完整 `selectedItem`，或保存 `text` 与 `characterCount`。
- 原因：没有区分源事实和派生结果。
- 后果：修改源字段时还要同步多个派生字段，产生不一致。
- 正确：只保存最小源事实，在 render 中通过 ID、长度或纯计算得到结果。
- 验证：派生结果没有 setter，也没有用同步 Effect 维护。
- 来源：[`react-state-structure`]

### 7. 把所有局部 State 都提升到根组件

- 触发：表单草稿、hover 或单项展开提示因“统一管理”被放到应用根。
- 原因：把单一事实来源误解成单一全局容器。
- 后果：无关组件被耦合，Props 路径和更新影响范围扩大。
- 正确：只提升被多个组件真实读取或改变的事实，临时 UI State 留在最近使用者。
- 验证：为每份 State 列出读取者；单一读取者的临时值不应远置。
- 来源：[`react-sharing-state`][`react-state-structure`]

### 8. 受控输入没有同步写回

- 触发：可编辑 `<input value={title}>` 没有 `onChange`，或 `onChange` 不更新 `title`。
- 原因：`value` 持续强制显示旧 Prop，用户编辑没有回到所有者。
- 后果：输入表现为只读并出现开发期 warning；字符被旧值覆盖。
- 正确：同步写回 `event.currentTarget.value`；若有意只读，明确使用 `readOnly`。
- 验证：连续输入后 DOM、调用方 State 和摘要立即一致，console 没有缺少 `onChange` warning。
- 来源：[`react-input`]

### 9. 把 `defaultValue` 当成持续控制

- 触发：用户已经编辑非受控输入，调用方改变 `defaultValue` 并期待覆盖当前文本。
- 原因：忽略 `defaultValue` 的一次性初始化语义。
- 后果：外部默认值变化与组件当前值不一致，调用方误判更新失效。
- 正确：只要需要持续指定当前值，就从首次 render 起使用受控 `value`。
- 验证：改变默认 Prop 不覆盖已编辑文本；受控对照能被外部按钮改变。
- 来源：[`react-input`]

### 10. 同时传 `value` 和 `defaultValue`

- 触发：同一输入或自定义字段同时接收两套当前值来源。
- 原因：无法回答当前值到底由调用方还是组件内部拥有。
- 后果：React 报告合同冲突，自定义实现也必须猜优先级。
- 正确：受控只传 `value` 与必需更新回调；非受控只传 `defaultValue` 与可选通知。
- 验证：TypeScript 类型拒绝混用，运行时没有受控/非受控冲突 warning。
- 来源：[`react-input`]

### 11. 用真值判断模式

- 触发：`Boolean(value)`、`value || internalValue` 或空字符串作为模式开关。
- 原因：把值内容与所有权状态混为一谈。
- 后果：受控空字符串被误判为非受控，内部旧值重新出现。
- 正确：使用明确 `mode` 判别联合，`value=""` 仍走受控分支。
- 验证：受控清空后继续输入仍由调用方 State 同步接管。
- 来源：[`react-input`]；`mode` 类型为课程设计推导。

### 12. 从 `undefined`/`null` 切换到字符串

- 触发：首轮 `value={data?.title}`，之后数据加载成字符串；或直接把 nullable 值传给文本输入。
- 原因：初始 render 没有稳定受控字符串，后续改变了模式或值类型。
- 后果：出现 uncontrolled/controlled warning，所有权边界不清。
- 正确：按业务语义使用 `value={maybeTitle ?? ''}`，从首次 render 起保持字符串；语义不同则另建模。
- 验证：缺失值和后续更新流程均无模式切换 warning。
- 来源：[`react-input`]

### 13. 只传变化通知就以为调用方拥有值

- 触发：非受控组件提供可选 `onValueChange`，调用方以为能用外部按钮持续改当前值。
- 原因：把观察入口误当成当前值来源。
- 后果：调用方收到事件，却无法指定组件下一次显示什么。
- 正确：需要持续控制时同时使用 `value` 和必需回调；非受控通知只表达“发生了变化”。
- 验证：API 类型和正文都能明确当前值的唯一所有者。
- 来源：[`react-sharing-state`]；互斥 Props 为课程设计推导。

## 适用边界

适合提升或受控的场景：

- 两个或更多附近组件必须实时显示同一个值。
- 一个组件的交互必须立即影响兄弟组件或父级摘要。
- 父组件需要执行“最多一个激活”“选择与预览一致”等跨组件不变量。
- 外部按钮、校验规则或业务动作需要持续替换当前值。
- 组件库需要让调用方完整配置一份重要信息的行为。

适合保留局部或非受控的场景：

- 当前值只服务一个组件，其他组件不读取也不改变它。
- 调用方只需要提供一次初始草稿，不需要逐次协调用户编辑。
- hover、焦点提示、展开动画标记等短生命周期 UI 状态只影响本组件。
- 提升会让无关组件接收更长的 Props 链，且没有真实共享需求。

不应使用本课方案解决：

- 跨很深组件树的共享边界：本课不选择 Context 或外部 Store。
- 复杂转移逻辑：本课不引入 Reducer。
- 与外部系统同步：本课不使用 Effect。
- DOM 命令式操作：本课不使用 Ref。
- 位置身份、State 保留、重置或 `key`：这些不是所有权迁移问题。
- 性能缓存、渲染跳过和测量：本课不使用 `memo`、`useMemo` 或 Profiler。

## Demo 合同

建议把旧的同步输入场景与旧的受控/非受控场景合并为一个 I02 主题 Demo，运行组件、展示源码和文档
合同都归属于 `react.core.learn.intermediate.lifting-state-up`。目标不是堆更多控件，而是让同一份
“谁拥有当前值”原则在组件树内和组件 API 边界各出现一次。

### A. 共享 State 区域

- `SharedEditor` 是两个输入和预览的最近共同父组件，只保存一个 `text`。
- 两个输入接收同一个 `value`，通过 `onValueChange` 报告用户编辑。
- 预览文本、字符数、空值提示都从 `text` 在 render 中计算，不保存派生 State。
- 输入 A 编辑后，输入 B、预览和统计在同一可见更新中同步；输入 B 编辑反向同样成立。
- 清空使用 `''`，不把 `undefined` 或 `null` 当作放开控制。

### B. 受控/非受控区域

- 受控实例由父级保存 `controlledTitle`，传 `mode="controlled"`、`value` 和必需的
  `onValueChange`；外部按钮可以载入新标题和清空为 `''`。
- 非受控实例只传 `mode="uncontrolled"` 和 `defaultValue`；组件从默认值初始化内部 State，后续编辑由
  组件自身保存，可选回调只作通知。
- 改变父级下一次 `defaultValue` 不覆盖已经编辑的非受控当前值。
- 两个实例从首次 render 到结束都不切换 `mode`，不使用 `key` 重建，不故意制造 warning。
- 受控摘要由父级渲染，非受控摘要由组件内部渲染，形成可观察的所有权对照。

### C. 静态与工程边界

- Demo 只使用函数组件、`useState`、Props、事件和本科 TypeScript 类型。
- 源码不得出现 `useEffect`、`useReducer`、Context、Ref、请求、缓存、外部 Store、`memo` 或
  `useCallback`。
- 源码展示必须来自与实际运行相同的 `.tsx` 文件；CSS 只用 Flexbox、margin 和正常文档流，不使用
  CSS Grid 或 `gap`。
- 新增函数上方写简洁职责注释；按钮和字段文字直击知识点，不加入计划、迁移、批次、进度、构建、
  测试、复审或篇幅说明。
- 桌面、390px 和 390px + 200% 根字号下，控件、标签和源码区域都不能横向溢出或互相覆盖。

## 课程正文建议结构

正文可以按以下知识顺序展开，每一节都只解释本课概念：

1. **先看独立 State 的失败现象**：两个输入各自编辑，说明相同初始值不等于共享事实。
2. **确定共同所有者**：列出读取者，寻找最近共同父组件，明确单一事实来源。
3. **完成提升三步**：删除子级 State，传固定值验证控制，再由父级 State 和回调驱动。
4. **建模最小源事实**：用 `text`、`activeId` 或 ID，而不是保存派生结果和互相冲突布尔值。
5. **解释值与回调 Props**：值向下，事件意图通过回调报告，父级更新后重新传值。
6. **逐份信息选择受控/非受控**：受控 `value/onChange`，非受控 `defaultValue`/内部 State。
7. **稳定 API 边界**：互斥 Props、模式不切换、空字符串与 nullable 值归一化。
8. **选择与排错**：根据协调需求和配置成本做判断，逐项排查镜像 State、默认值误用和缺少同步写回。

正文不应出现 I02、计划、批次、迁移、前后课、停止点、构建测试复审进度或篇幅叙事；研究记录中的路线
与实施边界只服务于仓库维护，不得复制到学习者可见内容。

## 验证合同

### 研究记录

- 每个关键事实在官方来源卡中有直接 URL，且 claim 后有来源标记。
- Exa 只承担候选发现和页面回取；React 官方原文是唯一事实依据。
- Tavily 用量失败、切换 Exa 的原因和第一方回取结果被记录，不把失败服务的摘要当证据。
- 研究文件只涉及 I02 合并范围，不提前研究位置身份、`key`、Reducer、Context、Effect、Ref 或缓存。

### Demo 与课程实现

1. 静态检查确认共享文本只有一个 State 所有者，输入组件没有 `useState(value)` 镜像。
2. 输入 A、输入 B 交替编辑，两个输入、预览和字符统计始终一致。
3. 受控实例外部载入、清空为 `''` 后立即更新输入和父级摘要。
4. 非受控实例从 `defaultValue` 初始化并可独立编辑；父级改默认值不覆盖当前编辑。
5. TypeScript 临时 fixture 拒绝受控缺少回调、同时传 `value/defaultValue`、非受控传 `value` 和受控
   nullable 值；fixture 只放 `/tmp`，验证后删除。
6. 独立故障 fixture 验证 `undefined -> string` 的 uncontrolled-to-controlled warning；故障代码不进入
   生产 Demo。
7. 生产 Demo console 为 0 error / 0 warning；不使用模式切换或 `key` 重建规避问题。
8. Playwright 在桌面、390px 和 390px + 200% 根字号复跑相同交互，检查无横向溢出、裁切和重叠。
9. 展示源码与运行 TSX 来自同一文件，按仓库 loader 规则核对内容一致。

## 保留、补充、删除与合并建议

### 从现有 `lifting-state-up` 研究保留

- 最近共同父组件、提升三步、单一事实来源、值/回调 Props、最小源事实、不要过度提升。
- 同步输入、激活面板、派生显示结果和单向数据流的示例逻辑。
- 兄弟重复 State、父子镜像、冲突布尔值和把所有 State 提升到根组件的排错说明。

### 从现有 `controlled-and-uncontrolled-components` 研究吸收

- Props 驱动与局部 State 驱动的逐份信息定义。
- `value`、同步更新回调、`defaultValue` 的当前值/初始值合同。
- `value` 与 `defaultValue` 互斥、生命周期内不切换、`''`/`undefined`/`null` 边界。
- 受控与非受控的配置成本和协调能力权衡。
- 判别联合、默认值不覆盖编辑、外部载入和清空的可观察 Demo 行为。

### 删除或后移

- 旧研究中的独立课程 ID、旧标题、旧课次和独立闭环状态。
- State 位置身份、`key` 重置、组件重建和任何属于位置生命周期的示例。
- Reducer、Context、Effect、Ref、缓存、外部 Store、性能 API 和复杂表单细节。

### 合并理由

“共享 State 需要唯一所有者”与“组件边界需要选择当前值所有者”是同一条数据所有权主线。先在组件树中
把 State 提升给共同父组件，再在字段组件边界用受控/非受控合同表达是否由调用方持续提供当前值，能够用
一个同步输入和一个字段对照覆盖全部目标；拆成两课会重复讲所有权、值 Props 和回调 Props。`value`、
`onChange`、`defaultValue` 共同描述一份信息的当前来源、更新入口与初始值，不应按 API 名词拆开。

## 官方来源

1. [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components)：提升三步、最近共同父组件、受控/非受控术语、单一事实来源。
2. [Thinking in React](https://react.dev/learn/thinking-in-react)：列出 State 使用者、决定所有者、Props 向下和回调更新入口。
3. [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure)：避免冗余、重复和矛盾 State，保留局部临时 State。
4. [React `<input>`](https://react.dev/reference/react-dom/components/input)：`value`、`onChange`、`defaultValue`、同步写回、空值与模式切换合同。
5. [State: A Component's Memory](https://react.dev/learn/state-a-components-memory)：组件实例的 State 隔离与共享需求。
6. [React Versions](https://react.dev/versions)：官方文档版本口径。
