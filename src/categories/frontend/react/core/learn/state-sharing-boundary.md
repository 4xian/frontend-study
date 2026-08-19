---
id: react.core.learn.intermediate.state-sharing-boundary
type: lesson
title: 状态共享边界
summary: 根据数据来源和真实消费者，为每一份 State 选择局部、共同父组件、Context 或外部 Store 边界。
domain: frontend
technology: react
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 70
prerequisites:
  - react.core.learn.intermediate.state-structure
  - react.core.learn.intermediate.lifting-state-up
  - react.core.learn.intermediate.context-providing-and-reading
  - react.core.learn.intermediate.reducer-context-composition
related: []
tags:
  - React
  - State
  - 状态所有权
  - 提升 State
  - Context
  - 外部 Store
appliesTo: React 19.2
verifiedAt: 2026-08-16
objectives:
  - 能先排除派生值和重复副本，并区分 State owner、消费者和数据传递路径。
  - 能让单一使用者的 State 留在最小局部边界。
  - 能把附近组件必须协调的同一事实提升到最近共同父组件。
  - 能在 Props 与 children 仍然清楚时保持显式传递，在深层共享时选择明确的 Provider 子树。
  - 能分别判断更新逻辑是否需要 reducer、读取路径是否需要 Context。
  - 能识别已有非 React 可订阅数据源何时才属于外部 Store 候选。
recap:
  - 先确认一个值是否真是 State，再为每一份 State 单独选择 owner。
  - 单一使用者留在局部，附近共同事实提升到最近共同父组件。
  - Props 和事件回调显式连接 owner 与附近消费者，children 可以避免布局组件转交无关数据。
  - Context 扩大 Provider 子树内的读取路径，但不会接管 State 所有权。
  - reducer 解决复杂更新规则，Context 解决深层传递，两项需要应分别成立。
  - 外部 Store 的数据由 React 外部对象拥有并独立变化，消费者数量多不是选择依据。
sources:
  - title: React Versions
    url: https://react.dev/versions
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - react.dev 当前文档版本口径为 React 19.2
  - title: "State: A Component's Memory"
    url: https://react.dev/learn/state-a-components-memory
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - State 对具体组件实例局部且私有
      - 同一组件的不同实例拥有相互隔离的 State
  - title: Sharing State Between Components
    url: https://react.dev/learn/sharing-state-between-components
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 必须协调同一事实的组件共享最近共同父组件中的唯一 State
      - 每一份 State 都应有明确 owner 和单一事实来源
  - title: Choosing the State Structure
    url: https://react.dev/learn/choosing-the-state-structure
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 避免冗余和重复 State
      - 临时 UI State 可以下移到实际使用它的组件
  - title: Passing Data Deeply with Context
    url: https://react.dev/learn/passing-data-deeply-with-context
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Props 与 children 是使用 Context 前应考虑的显式传递方式
      - Context 可以向 Provider 子树中的深层后代提供数据
  - title: createContext
    url: https://react.dev/reference/react/createContext
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Context 对象本身不持有动态业务信息
      - Provider 向其 children 子树提供当前 value
  - title: useContext
    url: https://react.dev/reference/react/useContext
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 读取方使用上方最近匹配 Provider 的 value
  - title: Scaling Up with Reducer and Context
    url: https://react.dev/learn/scaling-up-with-reducer-and-context
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Provider 组件可以用 reducer 管理复杂更新并向深层组件提供 State 与 dispatch
  - title: useSyncExternalStore
    url: https://react.dev/reference/react/useSyncExternalStore
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 外部 Store 是位于 React 之外并能订阅变化的数据源
      - 能使用 React 内建 State 时应优先使用 useState 或 useReducer
  - title: Using TypeScript
    url: https://react.dev/learn/typescript
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Props 对象和 Context value 可以用 TypeScript 明确描述
      - ReactNode 可以表达组件接收的宽泛 children
---

# 状态共享边界

## 一、学习目标

- 先判断一个值是否真的需要保存，再区分“谁拥有”“谁读取”“怎样传递”。
- 根据消费者分布，在局部 State、最近共同父组件和 Provider 子树之间选择最小边界。
- 保持 Props 与事件回调的显式数据流，不因固定层数规则提前引入 Context。
- 说明 Context 改变传递路径，但不改变 State 的 owner 和生命周期。
- 分别判断复杂更新是否需要 reducer、深层传递是否需要 Context。
- 识别已有非 React 数据源与普通 React State 的差异，不把“全局”当成外部 Store 的充分条件。

## 二、为什么需要

State 放在哪里，会直接决定组件怎样协作、数据何时重置以及修改入口位于哪里。边界过小，同一事实会被
多个组件各存一份，更新后容易互相矛盾；边界过大，无关组件会接收不使用的 Props，或者获得本不需要的
修改能力。

常见的两个极端都不正确：

- 把每个输入、开关和选择都提升到页面根部，认为位置越高越容易复用。
- 看到两个组件要共享数据就创建 Context，认为 Context 等于全局状态。

正确问题不是“应用应该使用哪一种状态方案”，而是对每一份事实分别判断：它是不是 State，谁必须协调
它，谁应该拥有它，消费者分布在哪里，数据源是否本来就在 React 外部。不同事实可以同时采用不同边界。

例如文档审阅页面可能同时存在三份 State：帮助开关只由编辑器使用，文档选择同时驱动列表和预览，审阅
模式要穿过布局层到达深层工具栏和摘要。三份 State 属于同一页面，却不应该为了“统一管理”放进同一个
容器。

## 三、核心概念

### 1. 共享边界包含两个独立维度

选择 State 边界时要分开回答：

1. **所有权：** 哪个组件实例或外部对象保存事实、决定生命周期并提供更新入口？
2. **传递路径：** 当前值和更新意图怎样到达真正的消费者？

调用 `useState` 或 `useReducer` 的组件实例是 React State 的 owner。Props、事件回调和 Context 只是把
值或更新入口连接到消费者，它们不自动改变 owner。

```text
State owner
  ├── 当前值 ──> Props 或 Context ──> 读取方
  └── 更新入口 <── 事件回调或 dispatch <── 操作方
```

因此，“使用 Context”不能回答 State 存在哪里；还必须指出哪个 Provider 组件拥有 State。

### 2. 先区分源事实与派生结果

只有需要跨 render 保留并能随交互变化的源事实才需要 State。能由当前 Props 或已有 State 计算出的值，
应在 render 中派生：

```tsx
interface ReviewDocument {
  id: string
  title: string
}

interface ReviewWorkspaceProps {
  documents: readonly ReviewDocument[]
}

/** 保存源 ID，并由当前输入派生完整文档。 */
function ReviewWorkspace({ documents }: ReviewWorkspaceProps) {
  const [selectedId, setSelectedId] = useState(documents[0]?.id ?? '')
  const selectedDocument = documents.find((document) => document.id === selectedId)

  // selectedId 是源事实；selectedDocument 是当前输入和 selectedId 的派生结果。
  return null
}
```

若同时保存 `selectedId` 和 `selectedDocument`，就会制造两个需要同步的副本。选择共享范围之前先删除伪
State，可以减少 owner、setter 和更新路径。

### 3. owner、消费者和修改者不是同一角色

- **owner** 保存唯一 State，并决定它随哪个组件实例创建、保留和销毁。
- **读取方** 使用当前值生成界面或计算结果。
- **操作方** 通过回调、setter 或 dispatch 请求 owner 更新。
- **中间组件** 可能只负责布局，不理解也不修改这份 State。

一个组件可以同时承担多个角色，但不能据此推断所有角色必须位于同一个文件。最近共同父组件可以是
owner，左侧列表负责发出选择意图，右侧预览只读取当前文档；两名消费者都不需要保存自己的副本。

### 4. 单一事实来源不等于单一全局容器

“单一事实来源”针对的是每一份独立 State。两个计数器若本来就应独立，它们各自保存 State 是正确的；
列表和预览若必须显示同一选择，各自保存 `selectedId` 才是重复。

判断是否为同一事实，可以检查：

- 一个组件更新后，另一个是否必须在同一次界面更新中得到相同结果？
- 两份值是否表达同一业务含义，只是位于不同组件？
- 是否需要额外同步代码才能避免它们互相矛盾？
- 重置其中一份时，另一份是否也必须重置？

若答案表明它们必须一致，就应寻找共同 owner；若它们允许独立变化，就不应为了形式统一而共享。

### 5. 最小边界是一项可调整的设计

最小边界不是“永远放在叶子组件”，而是当前真实消费者都能正确协作的最小范围。消费者发生变化时，
State 可以向上提升、向下移动或进入更明确的 Provider 子树。

边界调整会改变生命周期。State 从子组件移动到父组件后，即使子组件暂时卸载，父组件仍可能保留该
State；Provider owner 被移除时，它拥有的 State 随实例一起销毁。选择位置也就是选择保留和重置范围。

## 四、用法与示例

### 1. 按固定顺序判断，而不是先选工具

对一份候选数据依次提问：

1. 能否由当前 Props 或 State 直接计算？能则不另存 State。
2. 是否只有一个真实使用者？是则留在该组件或最小功能子树。
3. 多个组件是否必须协调同一事实？是则找到最近共同父组件。
4. Props 与事件回调能否清楚连接 owner 和消费者？能则保持显式传递。
5. 数据是否必须穿过多个不使用它的中间层，或服务一组深层后代？是则考虑明确 Provider 子树。
6. 更新规则是否已经复杂？复杂时才在 owner 内考虑 reducer。
7. 数据是否由 React 外部对象持有并独立变化？只有此时才进入外部 Store 判断。

```text
可派生 -> 不保存
单一使用者 -> 局部 State
附近多个使用者 -> 最近共同父组件 + Props/回调
深层多个使用者 -> Provider owner + Context
深层共享且更新复杂 -> reducer + Context
已有非 React 可订阅数据源 -> 外部 Store 候选
```

这条链没有固定的组件数量、应用规模或 Props 层数阈值。

### 2. 单一使用者保留局部 State

```tsx
/** 保存只影响当前帮助区域的局部 State。 */
function InlineHelp() {
  const [open, setOpen] = useState(false)

  return (
    <section>
      <button type="button" onClick={() => setOpen((current) => !current)}>
        {open ? '收起帮助' : '展开帮助'}
      </button>
      {open && <p>帮助内容只服务当前编辑区域。</p>}
    </section>
  )
}
```

`open` 的读取方、修改入口和可见结果都位于 `InlineHelp`。把它提升到页面根部不会增加正确性，只会扩大
接口和生命周期。局部 State 也不是“不能共享”；出现第二个必须协调的真实消费者时，再重新选择 owner。

适合局部保存的典型信息包括：

- 只影响一个组件的展开、选中或临时编辑状态。
- 一个可复用组件实例自己的交互进度。
- 不要求与兄弟、父级或深层后代保持一致的 UI 信息。

### 3. 附近共同事实提升到最近共同父组件

当文档列表和预览必须围绕同一个 `selectedId` 协作时，应删除子组件中的重复 State，让最近共同父组件
拥有唯一事实：

```tsx
interface ReviewWorkspaceProps {
  documents: readonly ReviewDocument[]
}

/** 拥有共享选择，并通过 Props 连接两个直接子组件。 */
function ReviewWorkspace({ documents }: ReviewWorkspaceProps) {
  const [selectedId, setSelectedId] = useState(documents[0]?.id ?? '')
  const selectedDocument = documents.find((document) => document.id === selectedId)

  return (
    <section>
      <DocumentList
        documents={documents}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <DocumentPreview document={selectedDocument} />
    </section>
  )
}
```

数据流保持单向：

1. 父组件把当前值通过 Props 传给读取方。
2. 子组件在事件中调用 `onSelect(nextId)` 表达更新意图。
3. owner 更新唯一 `selectedId`。
4. 下一次 render 重新派生 `selectedDocument`，列表和预览得到一致结果。

提升 State 的目标是协调同一事实，不是让父组件接管所有子组件 State。`DocumentList` 自己的悬停状态或
局部展开项若没有其他消费者，仍可留在列表内部。

### 4. Props 与 children 保持依赖显式

Props 的价值不仅是“能传数据”，还包括调用处可以直接看见依赖：

```tsx
<DocumentList selectedId={selectedId} onSelect={setSelectedId} />
<DocumentPreview selectedId={selectedId} />
```

如果中间组件只负责布局，可以让它接收已经配置好的 `children`，而不是迫使它理解并转交业务 Props：

```tsx
/** 只负责排列已经配置好的子组件。 */
function ReviewLayout({ children }: { children: ReactNode }) {
  return <main className="review-layout">{children}</main>
}

/** 在调用处显式连接选择值、更新入口和消费者。 */
function ReviewPage() {
  const [selectedId, setSelectedId] = useState('ownership')

  return (
    <ReviewLayout>
      <DocumentList selectedId={selectedId} onSelect={setSelectedId} />
      <DocumentPreview selectedId={selectedId} />
    </ReviewLayout>
  )
}
```

这里布局组件不接收 `selectedId`，但数据依赖仍在 `ReviewPage` 的 JSX 中清楚可见。Props 经过几层不是
自动改用 Context 的理由；关键是中间组件是否被迫承担与自身职责无关的接口。

### 5. 深层共同事实进入明确 Provider 子树

当一组较深后代都需要审阅模式，而中间布局不理解这份数据时，可以在功能边界建立 Provider：

```tsx
type ReviewMode = 'reading' | 'commenting'

interface ReviewModeValue {
  mode: ReviewMode
  setMode: Dispatch<SetStateAction<ReviewMode>>
}

const ReviewModeContext = createContext<ReviewModeValue | null>(null)

/** 在审阅功能子树内拥有模式 State。 */
function ReviewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ReviewMode>('reading')
  return <ReviewModeContext value={{ mode, setMode }}>{children}</ReviewModeContext>
}
```

`ReviewModeProvider` 是 owner，因为它调用 `useState`。Context 只让当前值与 `setMode` 到达 Provider
子树中的深层组件：

```tsx
<ReviewModeProvider>
  <ReviewLayout>
    <DeepModeToolbar />
    <DeepReviewSummary />
  </ReviewLayout>
</ReviewModeProvider>
```

Provider 应包住所有目标消费者的最近共同功能子树。放得过低会产生多个互不共享的 owner，放得过高会
让无关页面获得读取和修改能力。Context 的选择标准是传递路径和子树边界，不是“数据重要”或“应用很大”。

### 6. reducer 与 Context 分别回答不同问题

reducer 与 Context 可以组合，但两项需要必须分别成立：

| 判断 | 否 | 是 |
| --- | --- | --- |
| 更新规则是否复杂 | owner 内继续使用简单 State | owner 内可用 reducer 集中更新 |
| 消费者是否分布在深层子树 | 继续使用 Props 和回调 | 可用 Context 提供 State 与 dispatch |

因此存在四种合理情况：

- 简单更新 + 附近消费者：共同父组件中的 `useState` 与 Props。
- 复杂更新 + 附近消费者：共同父组件中的 reducer 与 Props。
- 简单更新 + 深层消费者：Provider 中的 `useState` 与 Context。
- 复杂更新 + 深层消费者：Provider 中的 reducer 与 Context。

不能因为使用了 reducer 就自动引入 Context，也不能因为使用 Context 就强制把简单 setter 改成 Action。

### 7. 外部 Store 是数据来源边界

外部 Store 与 Context 的关键区别不在于“是否全局”，而在于谁拥有数据以及数据怎样变化：

| 维度 | React State + Context | 外部 Store |
| --- | --- | --- |
| owner | 调用 `useState` 或 `useReducer` 的组件实例 | React 之外的对象、宿主 API 或既有模块 |
| 更新来源 | React setter 或 dispatch | 外部对象可以独立变化 |
| 读取范围 | Provider 的 React 子树 | 由外部数据源和订阅关系决定 |
| React 接入 | Provider value 与 `useContext` | 需要稳定的订阅和快照合同 |

只有同时满足以下特征，才应把数据标记为外部 Store 候选：

- 数据已经由 React 之外的对象或环境拥有。
- 数据可能在没有 React setter 或 dispatch 的情况下变化。
- 数据源能够通知订阅者重新读取当前值。

浏览器在线状态、宿主应用状态或既有非 React Store 可能符合这些条件。新建的页面筛选、表单草稿或展开
开关通常由 React 组件树自然拥有，即使消费者很多，也不因此成为外部 Store。

`useSyncExternalStore` 是 React 读取外部 Store 的官方入口，但订阅、快照缓存和服务端快照属于独立的
接口合同，本节只判断何时进入该分支。能由 React 内建 State 清楚管理时，优先保留 `useState` 或
`useReducer`。

### 8. 边界会随真实需求变化

State 位置不是一次性架构承诺。常见变化包括：

- 原来只有一个使用者，新增兄弟组件后，把 State 提升到最近共同父组件。
- 原来由页面根拥有，确认只服务一个叶子组件后，把 State 下移到局部。
- 原来用 Props 清楚传递，深层消费者增多并形成稳定功能子树后，引入 Context。
- 原来 Provider 内用简单 setter，更新分支增多后改用 reducer，但 Provider 范围不一定变化。
- 原来是 React State，后来必须接入既有宿主数据源时，重新评估外部 Store 边界。

移动 State 时要同时检查：旧 owner 的副本是否删除、所有读取方是否改用同一事实、更新入口是否仍指向
新 owner，以及 State 的保留和重置范围是否符合预期。

### 9. 用决策表核对最终选择

| 候选事实 | 真实消费者 | 建议 owner | 传递方式 | 不选择更大边界的原因 |
| --- | --- | --- | --- | --- |
| 编辑器帮助开关 | 单个编辑器 | `InlineHelp` | 组件内部 | 没有共享消费者 |
| 当前文档 ID | 列表与预览 | `ReviewWorkspace` | Props 与回调 | 直接兄弟关系清楚 |
| 审阅模式 | 深层工具栏与摘要 | `ReviewModeProvider` | Context | 中间布局不理解该值 |
| 复杂任务集合 | 多个深层任务组件 | 功能 Provider | reducer + Context | 更新和传递两项需要同时存在 |
| 浏览器在线状态 | React 外部浏览器 API 的多个读取方 | 浏览器 API | 外部 Store 接入 | 数据会在 React 之外独立变化 |

表格最后一列很重要：每次选择都应说明为什么不使用更大的共享范围。这样可以防止“为了以后可能用到”
而提前全局化。

## 五、交互示例

下面的文档审阅工作区同时展示三份互不重复的 State：

- 帮助开关由单个编辑器拥有，展开或收起不会改变其他区域。
- 文档 ID 由列表和预览的最近共同父组件拥有，选择后两个兄弟读取同一事实。
- 审阅模式由 Provider 组件拥有，深层工具栏和摘要通过 Context 读取；Provider 外区域保持独立。

Demo 没有加入外部 Store。外部 Store 在本节只是数据来源的选择边界，强行实现订阅会把示例从所有权判断
变成另一套 API 教学。

::::demo{id="react.core.learn.intermediate.state-sharing-boundary.state-ownership-boundary-demo"}
::::

## 六、易错使用提示

:::pitfalls
### 错误：把派生结果也保存为共享 State

**触发条件：** 已保存 `selectedId`，又保存可通过 `documents.find()` 得到的 `selectedDocument`。

**原因：** 没有先区分源事实与派生结果。

**后果：** 文档集合变化后，ID 和对象副本可能指向不同版本，需要额外同步代码。

**错误示例：**

```tsx
const [selectedId, setSelectedId] = useState('intro')
const [selectedDocument, setSelectedDocument] = useState(documents[0])
```

**正确写法：**

```tsx
const [selectedId, setSelectedId] = useState('intro')
const selectedDocument = documents.find((document) => document.id === selectedId)
```

**验证方式：** 修改 `documents` 输入后，预览应直接由当前 ID 派生，不需要第二个 setter 修正对象副本。

### 错误：需要同步的兄弟组件各存一份同义 State

**触发条件：** 列表和预览分别调用 `useState` 保存当前文档 ID。

**原因：** 同一事实有两个 owner，只能依赖事件顺序手动同步。

**后果：** 一个组件更新后另一个仍显示旧值，界面出现矛盾。

**错误示例：**

```tsx
/** 错误示例：列表保存了一份重复选择。 */
function DocumentList() {
  const [selectedId] = useState('intro')
  return <p>{selectedId}</p>
}

/** 错误示例：预览又保存了一份重复选择。 */
function DocumentPreview() {
  const [selectedId] = useState('intro')
  return <p>{selectedId}</p>
}
```

**正确写法：**

```tsx
/** 在最近共同父组件中保存唯一选择。 */
function ReviewWorkspace() {
  const [selectedId, setSelectedId] = useState('intro')
  return <DocumentList selectedId={selectedId} onSelect={setSelectedId} />
}
```

**验证方式：** 选择文档后，列表选中项和预览 ID 应始终来自同一个父组件 State。

### 错误：把单一使用者的 State 提前提升到应用根

**触发条件：** 只有一个编辑器使用帮助开关，却为了“以后可能共享”把它放在根组件。

**原因：** 把单一事实来源误解成所有 State 都必须位于同一个地方。

**后果：** 无关布局接收帮助 Props，生命周期和更新入口远离实际交互。

**错误示例：**

```tsx
/** 错误示例：根组件接管了只服务叶子组件的 State。 */
function App() {
  const [helpOpen, setHelpOpen] = useState(false)
  return <Page helpOpen={helpOpen} onHelpChange={setHelpOpen} />
}
```

**正确写法：**

```tsx
/** 让帮助开关留在唯一使用它的组件中。 */
function InlineHelp() {
  const [helpOpen, setHelpOpen] = useState(false)
  return <button onClick={() => setHelpOpen((open) => !open)}>{helpOpen ? '收起' : '帮助'}</button>
}
```

**验证方式：** 检查只有 `InlineHelp` 读取和修改该值，无关父组件不再声明帮助 Props。

### 错误：附近组件一共享就创建 Context

**触发条件：** 两个直接兄弟需要同一选择值，立即创建 Context 和 Provider。

**原因：** 忽略最近共同父组件和显式 Props 已经能清楚表达关系。

**后果：** 简单数据流变成隐式依赖，读取源码时必须额外追踪 Provider。

**错误示例：**

```tsx
<SelectionContext value={selectedId}>
  <Toolbar />
  <Preview />
</SelectionContext>
```

**正确写法：**

```tsx
<Toolbar selectedId={selectedId} onSelect={setSelectedId} />
<Preview selectedId={selectedId} />
```

**验证方式：** 在共同父组件的 JSX 中应能直接看到两个消费者的值输入和更新入口。

### 错误：按固定 Props 层数决定是否使用 Context

**触发条件：** 规定 Props 经过三层或五层就必须改用 Context。

**原因：** React 没有层数阈值；同样的层数可能仍然清楚，也可能已经让多个布局组件承担无关接口。

**后果：** Provider 数量随任意数字增加，局部依赖变得隐式。

**错误示例：**

```tsx
// 仅因为“达到三层”就创建 Context。
<ThreeLayerContext value={selectedId}>
  <Layout />
</ThreeLayerContext>
```

**正确写法：**

```tsx
<Layout>
  <DocumentPreview selectedId={selectedId} />
</Layout>
```

**验证方式：** 先检查 Props 与 `children` 能否保持依赖清楚，再根据深层消费者分布决定是否建立 Provider。

### 错误：把 Context 当成 State owner 或全局 Store

**触发条件：** 只创建 Context 就声称已经拥有共享 State，或直接修改默认值对象。

**原因：** Context 对象只定义读取通道，不保存会随 React 更新的业务事实。

**后果：** 没有明确生命周期 owner 和更新入口，修改也不会按 React State 合同传播。

**错误示例：**

```tsx
const WorkspaceContext = createContext({ mode: 'reading' })
WorkspaceContext.mode = 'commenting'
```

**正确写法：**

```tsx
/** 在明确子树内拥有并提供工作区模式。 */
function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState('reading')
  return <WorkspaceContext value={{ mode, setMode }}>{children}</WorkspaceContext>
}
```

**验证方式：** 应能指出调用 `useState` 或 `useReducer` 的 owner 组件，以及包住目标消费者的 Provider 子树。

### 错误：给两个消费者分支各放一个 Provider，却期待共享

**触发条件：** 左侧列表和右侧摘要分别创建一个相同 Provider 组件实例。

**原因：** 每个 Provider 组件实例分别调用 State Hook，因而拥有独立 State。

**后果：** 更新左侧 Provider 不会改变右侧摘要，两个分支读取不同 owner。

**错误示例：**

```tsx
<ReviewModeProvider><LeftBranch /></ReviewModeProvider>
<ReviewModeProvider><RightBranch /></ReviewModeProvider>
```

**正确写法：**

```tsx
<ReviewModeProvider>
  <LeftBranch />
  <RightBranch />
</ReviewModeProvider>
```

**验证方式：** 两个消费者应在同一个 Provider 实例的 children 子树内，切换后同时读取相同模式。

### 错误：把 reducer 与 Context 绑定成一项选择

**触发条件：** 使用 Context 就强制改成 reducer，或使用 reducer 就强制建立 Context。

**原因：** reducer 解决更新逻辑组织，Context 解决深层值传递，两者职责不同。

**后果：** 简单 State 被改造成多余 Action，或附近消费者被迫依赖隐式 Context。

**错误示例：**

```tsx
// 两个直接兄弟也被强制放入全局 Provider。
<GlobalReducerProvider>
  <SiblingA />
  <SiblingB />
</GlobalReducerProvider>
```

**正确写法：**

```tsx
const [state, dispatch] = useReducer(reducer, initialState)
return <><SiblingA state={state} /><SiblingB dispatch={dispatch} /></>
```

**验证方式：** 分别回答“更新是否复杂”和“消费者是否深层分布”，不能用其中一个答案替代另一个。

### 错误：因为数据看起来全局就引入外部 Store

**触发条件：** 主题、筛选或当前用户被多个组件读取，就直接迁移到外部 Store。

**原因：** 消费者多不等于数据由 React 外部拥有，也不证明它会独立于 React 更新。

**后果：** 新增订阅、快照和额外生命周期，却没有解决真实的外部数据源问题。

**错误示例：**

```tsx
// 仅因很多组件需要 theme，就创建独立可订阅对象。
const themeStore = createExternalStore('light')
```

**正确写法：**

```tsx
/** 让 React 组件拥有主题，再通过 Context 提供给子树。 */
function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>
}
```

**验证方式：** 只有能指出 React 外部 owner、独立变化来源和订阅入口时，才把数据标记为外部 Store 候选。
:::

## 七、原理与适用场景

### 1. 官方事实

1. State 对具体组件实例局部且私有，同一组件的不同实例拥有隔离 State。
2. 多个组件必须协调同一事实时，应删除重复 State 并提升到最近共同父组件。
3. 可由当前 Props 或 State 计算的值不应再保存为 State。
4. Props 是显式传递数据的通道，使用 Context 前可以先尝试 Props、组件抽取和 `children`。
5. Context 对象本身不持有动态信息，读取方使用上方最近匹配 Provider 的 value。
6. reducer 可以管理复杂更新，Context 可以把 State 与 dispatch 传给深层后代，两项职责彼此独立。
7. 外部 Store 位于 React 之外并提供变化订阅；能使用内建 React State 时应优先使用内建 State。

### 2. 由官方合同得到的设计判断

- State owner 应靠近真实消费者，但必须覆盖所有需要协调同一事实的组件。
- 传递路径可以改变，owner 不一定改变；为现有 State 加 Context 不代表迁移了所有权。
- Context 的自然边界是一棵有明确业务含义的 Provider 子树，不是默认的应用根。
- reducer 的存在只能证明更新规则需要集中，不能证明读取方需要 Context。
- “全局数据”是模糊描述；判断外部 Store 必须检查 React 外部 owner、独立变化和订阅能力。
- 类型可以让 Props、Context value 和 `children` 接口更清楚，但不能在运行时决定 owner。

### 3. 适用场景

- **局部 State：** 单个输入、展开开关、临时编辑模式、单个组件实例的交互进度。
- **最近共同父组件：** 列表与预览共享选择、多个输入共享筛选条件、兄弟组件必须保持互斥展开。
- **Context：** 一组深层后代共享主题、审阅模式或工作区能力，中间布局不理解该值。
- **reducer + Context：** 深层工作区既有多个消费者，又有添加、删除、重排、重置等集中更新规则。
- **外部 Store 候选：** 浏览器或宿主 API 持有数据并独立变化，或必须接入既有非 React 可订阅模块。

### 4. 不适用场景

- 还没有排除派生值和重复副本，就开始比较 Context 或 Store。
- 只有一个消费者，却为了未来假设扩大 State 边界。
- 两个直接兄弟用 Props 与回调已经能清楚表达关系。
- 把服务器数据缓存、持久化、离线同步或跨进程一致性当作普通组件 State 共享问题。
- 需要优化 render 性能，却没有测量实际瓶颈；状态边界选择本身不承诺性能收益。
- 需要学习外部 Store 的订阅、快照或服务端合同；这些属于独立接口问题。

## 八、练习

:::exercise
### 为文档审阅页设计 State 所有权图

**要求：** 列出帮助开关、当前文档 ID、当前文档对象、审阅模式和浏览器在线状态五个候选值。对每个值
依次写出：它是否需要保存、唯一 owner、全部消费者、更新入口、传递方式，以及为什么不选择更大的边界。
实现时让帮助开关保留在单个编辑器，让文档 ID 由列表和预览的最近共同父组件拥有，让当前文档对象由
ID 和文档数组派生，让审阅模式由明确 Provider 子树拥有。浏览器在线状态只标记为外部 Store 候选，不
实现订阅 API。

**完成标准：** 页面中不存在同义 State 副本；列表和预览始终读取同一文档 ID；深层工具栏与摘要读取
同一 Provider 的模式；Provider 外组件不依赖该模式；每份 State 都能指出唯一 owner；没有引入第三方
状态库、请求、持久化或外部 Store 实现。
:::

## 九、本节小结

- 对每一份事实单独选择边界，不为整个应用一次性选择万能状态容器。
- 先排除派生值和重复副本，再讨论 State 应放在哪里。
- 单一使用者留在局部，附近共同事实提升到最近共同父组件。
- Props 与回调保持近距离数据流显式，`children` 可以让布局组件避免转交无关数据。
- Context 扩大 Provider 子树内的读取路径，State 仍由调用 State Hook 的组件实例拥有。
- reducer 与 Context 分别解决更新复杂度和传递深度，只有两项需要都成立时才组合。
- 外部 Store 的依据是已有非 React owner、独立变化和订阅能力，不是消费者多或数据看起来全局。
- 边界可以随真实消费者变化而移动，但移动后必须删除旧副本并重新检查生命周期。

## 十、参考资料

- [React Versions](https://react.dev/versions) - React 19.2 官方文档版本口径。
- [State: A Component's Memory](https://react.dev/learn/state-a-components-memory) - 组件实例的局部 State。
- [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) - 最近共同父组件、owner 与单一事实来源。
- [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) - 避免冗余、重复 State 与 State 下移。
- [Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context) - Props、children 与 Context 的选择边界。
- [`createContext`](https://react.dev/reference/react/createContext) - Context 对象和 Provider 子树。
- [`useContext`](https://react.dev/reference/react/useContext) - 最近匹配 Provider 的读取范围。
- [Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context) - reducer 与 Context 的组合职责。
- [`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore) - 外部 Store 定义与 React 内建 State 优先级。
- [Using TypeScript](https://react.dev/learn/typescript) - Props、Context value 与 children 的类型表达。
