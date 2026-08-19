# 状态共享边界研究记录

## 冻结知识点合同

- 目标 ID：`react.core.learn.intermediate.state-sharing-boundary`
- 标题：状态共享边界
- 路线位置：React Core 中级 I07
- 教学层级：本科范围的中级 React 基础
- 核验日期：`2026-08-16`
- 研究状态：官方事实、固定版本源码、现有课程与 Demo 审计已完成；本记录不代表 I07 新路线实现闭环
- 官方文档基线：React `19.2`
- 固定实现基线：React / React DOM `19.2.8`
- 本地 TypeScript 基线：TypeScript `6.0.3`
- 直接前置：I01 State 结构、I02 State 提升、I05 Context、I06 Reducer 与 Context 组合

总计划为 I07 冻结的范围是：在局部 State、提升 State、Context 与外部 Store 之间做选择，不教学第三方
状态库。本课不是再次教学四套 API，而是判断每一份状态事实由谁拥有、哪些组件需要读取，以及数据源是否
本来就在 React 外部。

本轮读取时，总计划执行表仍把 `I07-IL4` 标为“未开始”。仓库中已有旧路线课程与同源 Demo，可作为
复用候选，但旧 `available` 状态、历史浏览器验收或旧路线复审不能替代新路线 I07 的重新闭环。

## 调研问题与范围

本记录只回答以下问题：

1. 只有一个组件使用的信息为什么默认留在局部 State？
2. 多个组件必须协调同一事实时，State 为什么应提升到最近共同父组件？
3. Props 与 `children` 什么时候比 Context 更清楚？
4. Provider 子树怎样限定 Context 可见范围，Context 是否会接管 State 所有权？
5. Reducer 与 Context 的组合何时成立，何时只是过度设计？
6. 什么事实足以把数据源判为外部 Store，为什么“消费者很多”本身不成立？
7. 旧课程与 Demo 哪些可以保留，哪些必须补充、删除或移动到其他课程？

明确不在 I07 教学：第三方状态库、`useSyncExternalStore` 的 `subscribe` / `getSnapshot` / SSR 快照合同、
远程数据缓存、持久化、跨标签或跨 root 同步、selector、Context 性能优化、Effect、Ref，以及 React
Fiber 或 lane 内部算法。

## 外部检索与原文核验

1. 先按仓库顺位调用 Tavily，并限定 React 官方文档与官方 GitHub 仓库；四次查询均因 Tavily 套餐用量
   上限失败，没有返回候选。
2. 按顺位切换到 Exa。Exa 找到 React 官方 State、State 提升、Context、Reducer + Context、
   `useSyncExternalStore`、TypeScript 指南和 `facebook/react` 源码候选，因此未再切换 Parallel、
   Perplexity 或原生 `web_search`。
3. 搜索摘要只用于发现 URL。采用结论逐项回到 `react.dev` 官方原文与 `facebook/react@v19.2.8` raw
   源码核对；二手文章、翻译镜像、issue、RFC 与搜索摘要不承担事实证明。
4. TypeScript 只核对 Props、Context value 与 `children` 的类型表达。类型注解可以暴露数据通道，却不
   决定运行时 State owner，也不会把 Context 变成 Store。

## 一手来源索引

| 编号 | 一手来源 | 固定点 | 支撑的主张 |
| --- | --- | --- | --- |
| R1 | [React Versions](https://react.dev/versions) | React 文档 `19.2` | 当前官方文档版本口径 |
| R2 | [State: A Component's Memory](https://react.dev/learn/state-a-components-memory) | React 19.2 | State 对屏幕上的组件实例局部且私有 |
| R3 | [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) | React 19.2 | 最近共同父组件、Props/回调、每份 State 的 owner 与单一事实来源 |
| R4 | [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) | React 19.2 | 避免冗余和重复 State；临时 UI State 可以下移 |
| R5 | [Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context) | React 19.2 | Props、`children`、Context 深层传递与 Provider 子树 |
| R6 | [`createContext`](https://react.dev/reference/react/createContext) | React 19.2 | Context 对象不持有业务信息，Provider 向内部后代提供 value |
| R7 | [`useContext`](https://react.dev/reference/react/useContext) | React 19.2 | 读取上方最近匹配 Provider；同组件返回的 Provider 不影响自身读取 |
| R8 | [Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context) | React 19.2 | reducer 管复杂更新，Context 把 State/dispatch 传给深层后代 |
| R9 | [`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore) | React 19.2 | 外部 Store 的定义、内建 React State 优先与非 React 集成边界 |
| R10 | [Using TypeScript](https://react.dev/learn/typescript) | React 19.2 | Props 对象、Context 类型推断、`ReactNode` children 类型 |
| S1 | [`ReactFiberHooks.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js#L1909-L1935) | React `v19.2.8` | `useState` hook 队列与 dispatch 绑定当前渲染 Fiber |
| S2 | [`ReactContext.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/ReactContext.js#L14-L45) | React `v19.2.8` | Context 初始化默认值；React 19 Provider 与 Context 对象连接 |
| S3 | [`ReactFiberNewContext.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberNewContext.js#L78-L147) | React `v19.2.8` | Provider 进入/离开子树时压入与恢复值 |
| S4 | [`ReactFiberNewContext.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberNewContext.js#L529-L570) | React `v19.2.8` | 消费者读取当前值并登记对该 Context 的依赖 |
| S5 | [`ReactHooks.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/ReactHooks.js#L188-L199) | React `v19.2.8` | `useSyncExternalStore` 的公开桥接入口接收订阅与快照函数 |

S1-S5 只用于确认当前 patch 的实现与公开文档一致。`currentlyRenderingFiber`、内部 value 槽、值栈和
dispatcher 都不是应用代码可以依赖的 API，也不进入本科正文。

## 官方事实与课程推导

### 1. 局部 State 属于具体组件实例

R2 明确说明，State 对屏幕上的组件实例是局部且私有的。同一个组件渲染两次时，两份 State 相互隔离；
父组件也不能直接修改子组件声明的 State。S1 在当前实现中把 State hook 队列和 dispatch 绑定到当前渲染
Fiber，与“每个实例各自保存 State”的公共行为一致。

课程推导：只有一个真实使用者的交互信息，应先保留在该组件或最小功能子树。把 hover、展开、局部草稿
等信息提前放到页面根部，不会让它更“正确”，只会扩大 owner 的职责。

这不是永久决定。R3 明确允许随着真实消费者变化，把某一份 State 向上或向下移动。

### 2. 同一事实由多个组件协调时提升到最近共同父组件

R3 给出的步骤是：从需要协调的子组件删除重复 State，找到它们的最近共同父组件，让该父组件保存唯一
State，再把值与事件处理函数通过 Props 传给子组件。

“单一事实来源”是对每一份独立 State 选择一个 owner，不是把全部应用 State 放进一个对象、Context 或
Store。R4 进一步要求先删除可由当前 Props/State 计算的派生值和同义副本，避免为伪 State 讨论共享位置。

课程推导：附近兄弟需要同一选择、筛选或展开协调时，首选最近共同父组件 + 值 Props + 事件回调；不应
跳过共同父组件直接全局化。

### 3. Props 与 `children` 是 Context 之前的显式通道

R5 把 Props 描述为沿 UI 树显式传递数据的好方法，并明确警告：仅仅因为 Props 经过若干层，不代表必须
使用 Context。官方建议先尝试两种方式：

1. 继续传 Props，让依赖和更新入口保持可见。
2. 抽取组件，把已经配置好的 JSX 作为 `children` 传给只负责布局的中间组件，缩短无意义转交链。

R10 说明 TypeScript 中组件 Props 可用对象类型描述，宽泛 JSX children 可用 `ReactNode` 表达。这是
类型层的接口可见性，不是选择 Context 的层数阈值。

课程推导：I07 不能使用“三层 Props 就改 Context”之类数字规则。判断依据是中间组件是否理解这份数据、
消费者分布和 Provider 是否有自然的功能子树边界。

### 4. Context 扩大读取路径，但不接管 State 所有权

R6 明确说明 Context 对象本身不持有业务信息；动态 value 仍来自某个父组件的 Props、`useState` 或
`useReducer`。R7 规定读取方取得父树上最近匹配 Provider 的 value，Provider 必须位于读取方上方。

R5/R6 把 Provider 的范围定义为它包住的 `children` 子树。S2-S4 在固定实现中通过进入 Provider 时压入
值、离开时恢复旧值、读取当前值来旁证嵌套和子树边界。内部值槽不应被误写成 Context 自己拥有业务
State；应用层 owner 仍是调用 State Hook 的组件实例。

课程推导：进入 Context 时必须同时回答两个问题：

- 哪个 Provider 组件调用 State Hook、拥有生命周期和更新入口？
- 哪一棵最小且语义清楚的子树需要读取这份 value？

Provider 包住整个应用不是默认答案；不同 Provider 实例也不会自动共享同一份组件 State。

### 5. Reducer + Context 只组合两个已经成立的需要

R8 分别定义了两项职责：Reducer 汇总复杂状态更新逻辑，Context 把信息传给较深组件。官方
`TasksProvider` 示例仍在 Provider 组件内部调用 `useReducer`，并明确说 State 继续“live”在该组件中；
Context 只让后代读取 State 和 dispatch。

课程推导：只有“更新逻辑已经复杂”和“消费者确实较深”同时成立时，才复用 I06 的 reducer + Context
组合。简单更新不必为了 Context 改成 reducer，复杂 reducer 也不因存在就必须放进 Context。本课只引用
I06 的组合结论，不重讲 Action、纯 reducer、双 Context 或自定义读取 Hook。

### 6. 外部 Store 是已有非 React 数据源的接入边界

R9 先给出默认情况：多数 React 组件只从 Props、State 和 Context 读取数据。只有当某个数据源在 React
之外持有、会在没有 React setter/dispatch 的情况下变化，并提供订阅能力时，才进入外部 Store 问题。
官方列出的两类例子是第三方状态库和可订阅的浏览器 API。

R9 同时明确建议：能用内建 React State 时，优先 `useState` 或 `useReducer`；
`useSyncExternalStore` 主要用于集成既有非 React 代码。S5 只旁证 React 为这种数据源提供了订阅/快照
入口，完整快照合同属于高级 A15。

课程推导：

- “很多组件需要”“想避免 Props”“数据看起来全局”都不足以选择外部 Store。
- 新功能的数据仍由 React 组件树自然拥有时，先在局部、共同父组件或 Provider owner 中放置。
- 数据本来由浏览器 API、宿主环境或既有非 React 模块拥有，并会独立变化时，才标记为外部 Store 候选。
- I07 只识别该分支并指向 A15，不实现 Store、不展示第三方库，也不教学订阅、快照或 SSR 参数。

Context 与外部 Store 不是同义词：Context 的 value 仍沿 React Provider 子树传播；外部 Store 的数据生命
周期和变化通知来自 React 之外，React 需要通过专用订阅合同读取它。

## 状态共享选择链

| 顺序 | 事实判断 | 最小选择 | I07 边界 |
| ---: | --- | --- | --- |
| 1 | 可由当前 Props/State 在 render 中计算 | 不另存 State | 回顾 I01，不展开缓存性能 |
| 2 | 只有一个真实使用者 | 该组件的局部 State | 新消费者出现后可重新判断 |
| 3 | 附近多个组件必须协调同一事实 | 最近共同父组件 + Props/回调 | 回顾 I02，不重讲受控组件 API |
| 4 | React 内部 State 需要穿过许多无关中间层或服务深层分支 | 明确 Provider 子树 + Context | 回顾 I05，Provider 组件仍是 owner |
| 5 | 深层共享且更新规则已经复杂 | Provider 内 reducer + Context | 复用 I06，不重讲 reducer 实现 |
| 6 | 数据源本来位于 React 外部并会独立变化 | 外部 Store 候选 | 只说明选择；完整接入后移 A15 |

简化决策：

```text
可派生 -> 不保存
单一使用者 -> 局部 State
附近多个使用者 -> 最近共同父组件 + Props/回调
深层多个使用者 -> Provider owner + Context
深层共享且更新复杂 -> reducer + Context
已有非 React 可订阅数据源 -> 外部 Store 候选，接入合同后移 A15
```

该链按 owner 和数据来源升级，没有固定 Props 层数、组件数量或应用规模阈值。

## 现有课程与 Demo 审计

### 可保留

| 现有内容 | 可保留结论 | 复用条件 |
| --- | --- | --- |
| “一份事实只能有一个 owner”主线 | 与 R2/R3 一致 | 改成新路线 I07 的选择合同，不沿用旧课次表述 |
| “先排除派生值和重复副本”入口 | 与 R4 一致 | 明确只是 I01 前置回顾，不能扩成 State 结构复讲 |
| 局部 -> 最近共同父组件 -> Provider 子树三档对照 | 与 R3/R5/R6/R7 一致 | 追加外部 Store 选择分支后才覆盖总计划 I07 |
| Props 值向下、事件意图向上 | 与 R3 一致 | 保留为附近共享判断，不重讲 I02 受控边界 |
| Context 不接管 State owner | 与 R6/R8 一致 | 保持 Provider 组件调用 State Hook 的措辞 |
| `InlineHelp` 局部 State Demo | 能观察单一使用者边界 | 不因新增外部 Store 分支改造为全局重置 |
| `ReviewWorkspace` 共同父组件 Demo | 能观察单一选择驱动两个兄弟 | 子组件继续不保存同义副本 |
| `ReviewModeProvider` Context Demo | 能观察 Provider 子树和外部预览 | 继续让 Provider 组件拥有 State，外部预览不消费 Context |
| `ReactNode` children 与显式 Props 类型 | 与 R10 一致 | 类型只服务接口可见性，不变成泛型教程 |

现有 Demo 不需要为了“覆盖全部选择”实现一个外部 Store。I07 的外部 Store 只是架构选择边界；强行加入
订阅/快照实现会抢占 A15，并把单一决策课变成 API 课。

### 应补充

1. 在课程目标、recap、正文选择链和来源中加入外部 Store 的最后分支。
2. 明确外部 Store 的必要条件是“既有非 React owner + 独立变化 + 可订阅”，而不是“使用者多”。
3. 加入 R9 的官方优先级：能用 React 内建 State 时优先 `useState` / `useReducer`。
4. 明确 Context 与外部 Store 的 owner 差异，并把 `useSyncExternalStore` 细节指向 A15。
5. 把前置课引用改成新路线 ID/I01、I02、I05、I06，删除“第 13 课”等旧序号。
6. 更新研究日期和路线状态口径；将旧资产称为“复用候选”，不能称为新路线已闭环。
7. 在易错点中加入“为了全局方便直接引入外部 Store”和“Context 就是全局 Store”两项。

### 应删除或移动

| 现有内容/说法 | 动作 | 去向或理由 |
| --- | --- | --- |
| “外部 Store 完全排除” | 删除 | 与总计划 I07 明确范围冲突；改为只教学选择边界 |
| `useSyncExternalStore` 参数、订阅、快照缓存、SSR | 移动 | 高级 A15 `useSyncExternalStore` 快照合同 |
| 派生值、矛盾/重复、扁平化的详细教学 | 移动 | I01 State 结构；I07 只做第一步排除 |
| `value/onChange/defaultValue` 与受控/非受控详细合同 | 移动 | I02 State 提升与受控边界 |
| 默认值、最近 Provider、嵌套覆盖、`Object.is` 详细 API | 移动 | I05 Context 创建、提供与读取 |
| Action、reducer 纯度、双 Context、自定义读取 Hook | 移动 | I04/I06；I07 只判断何时复用 |
| 第三方库选型、Redux/Zustand 示例 | 删除 | 总计划明确不教学第三方库，也没有官方一手来源需求 |
| 远程缓存、请求状态、持久化、跨标签/跨 root 同步 | 删除 | 与当前 State 共享边界不是同一知识点 |
| 旧课次“第 1-14 课 available / 第 15 课 planned” | 删除 | 已被 74 课新路线取代，且不是官方事实 |
| 旧 TSX hash、旧浏览器尺寸、旧复审 finding 和旧 Gate 结果 | 删除 | 属于旧实现证据，不能证明新路线 I07；应由本批实现日志重新产生 |
| 研究稿中的详细构建/浏览器验收脚本 | 删除 | 由实现批次按总计划 Gate 执行，不属于官方事实复核 |

## 易错点

### 1. 保存可以派生的完整对象

- **触发条件：** 已保存 `selectedId`，又把可由 ID 查出的完整文档保存为 State。
- **原因：** 完整文档不是独立源事实，而是当前 ID 与文档数组的派生结果。
- **后果：** 两份 State 需要手动同步，文档更新后可能出现 ID 与预览内容不一致。
- **错误示例：** `const [selectedDocument, setSelectedDocument] = useState(documents[0])`。
- **正确示例：** 只保存 `selectedId`，render 时用 `documents.find(...)` 得到当前文档。
- **适用版本：** React 19.2。
- **来源：** R4 `Choosing the State Structure`。

### 2. 需要同步的兄弟组件各存一份同义 State

- **触发条件：** 列表和预览分别调用 `useState` 保存当前文档 ID。
- **原因：** 两个 owner 分别维护同一事实，更新入口没有汇合。
- **后果：** 一个组件更新后，另一个组件仍显示旧选择。
- **错误示例：** `DocumentList` 与 `DocumentPreview` 各自声明 `selectedId`。
- **正确示例：** 删除两个副本，由最近共同父组件保存唯一 `selectedId`，再通过 Props 和回调连接兄弟组件。
- **适用版本：** React 19.2。
- **来源：** R3 `Sharing State Between Components`、R4 `Choosing the State Structure`。

### 3. 把单一使用者的 State 提前放到应用根部

- **触发条件：** 只有编辑器使用帮助开关，却在 `App` 中声明 `showHelp`。
- **原因：** 单一事实来源要求每份 State 有一个 owner，不要求所有 State 共用最高层 owner。
- **后果：** 根组件承担无关更新入口，局部组件的生命周期边界也变得不清楚。
- **错误示例：** `<Editor showHelp={showHelp} onToggleHelp={setShowHelp} />`。
- **正确示例：** 在唯一使用帮助开关的编辑器组件内部调用 `useState`。
- **适用版本：** React 19.2。
- **来源：** R2 `State: A Component's Memory`、R4 `Choosing the State Structure`。

### 4. 两个附近组件共享就立即创建 Context

- **触发条件：** 两个直接兄弟需要同一选择值，立即创建 Context 和 Provider。
- **原因：** 最近共同父组件已经能用 Props 与回调显式表达读取方和更新入口。
- **后果：** 简单依赖变成隐式通道，阅读组件调用处时无法直接看出数据来源。
- **错误示例：** 用 `<SelectionContext value={...}>` 包住两个直接兄弟。
- **正确示例：** 共同父组件保存选择值，并分别传入 `selectedId`、`onSelect` 和预览数据。
- **适用版本：** React 19.2。
- **来源：** R3 `Sharing State Between Components`、R5 `Passing Data Deeply with Context`。

### 5. 按固定 Props 层数决定是否使用 Context

- **触发条件：** 规定 Props 经过三层或五层后必须改用 Context。
- **原因：** React 没有层数阈值；中间组件是否理解数据、消费者分布和功能子树边界才是判断条件。
- **后果：** 局部依赖会因任意数字变成 Context，Provider 数量随组件层级机械增加。
- **错误示例：** 仅因经过三层就创建 `ThreeLayerContext`。
- **正确示例：** 先检查 Props、组件抽取和 `children`，只有深层后代形成明确共享子树时才建立 Provider。
- **适用版本：** React 19.2。
- **来源：** R5 `Passing Data Deeply with Context`。

### 6. 把 Context 当成 State owner

- **触发条件：** 只创建 Context 就声称已经拥有共享 State，或直接修改 Context 默认值对象。
- **原因：** Context 只定义读取通道，动态 State 仍由调用 `useState` 或 `useReducer` 的组件实例拥有。
- **后果：** 更新入口与生命周期无法定位，直接修改默认对象也不会形成 React State 更新。
- **错误示例：** `WorkspaceContext.mode = 'commenting'`。
- **正确示例：** 在 Provider 组件内声明 State，并把当前值和更新入口作为 Context value 提供给子树。
- **适用版本：** React 19.2。
- **来源：** R6 `createContext`、R7 `useContext`。

### 7. 给两个分支各放一个 Provider，却期待共享 State

- **触发条件：** 左右分支分别渲染一个内部调用 State Hook 的相同 Provider 组件。
- **原因：** 两个 Provider 组件实例各自拥有独立 State。
- **后果：** 左侧更新不会改变右侧读取结果，两个分支看似同名却不是同一事实来源。
- **错误示例：** `<Provider><Left /></Provider>` 与 `<Provider><Right /></Provider>` 并列出现。
- **正确示例：** 用同一个 Provider 实例包住左右分支的最近共同子树。
- **适用版本：** React 19.2。
- **来源：** R2 `State: A Component's Memory`、R5 `Passing Data Deeply with Context`、R7 `useContext`。

### 8. 把 reducer 与 Context 绑定成一项选择

- **触发条件：** 一使用 Context 就强制改为 reducer，或一使用 reducer 就强制建立 Context。
- **原因：** reducer 处理更新逻辑复杂度，Context 处理深层传递，两项需要彼此独立。
- **后果：** 简单更新被改造成多余 Action，或附近消费者被迫依赖隐式 Context。
- **错误示例：** 两个直接兄弟也被放进应用级 `GlobalReducerProvider`。
- **正确示例：** 分别判断更新是否复杂、消费者是否深层；附近消费者可以通过 Props 读取 reducer 结果。
- **适用版本：** React 19.2。
- **来源：** R3 `Sharing State Between Components`、R8 `Scaling Up with Reducer and Context`。

### 9. 因为数据看起来全局就引入外部 Store

- **触发条件：** 主题、筛选或当前用户被多个组件读取，就直接创建 React 外部 Store。
- **原因：** 消费者多不等于数据由 React 外部对象拥有，也不证明它会独立于 React 更新。
- **后果：** 本可由 React State 管理的数据增加订阅和快照边界，所有权反而更难追踪。
- **错误示例：** 只为共享主题而创建新的外部可订阅对象。
- **正确示例：** React 自有数据优先使用局部 State、共同父组件或 Provider；只有既有非 React 数据源才进入外部 Store 判断。
- **适用版本：** React 19.2。
- **来源：** R9 `useSyncExternalStore`。

## 本科范围边界

### 必须掌握

- 对每一份 State 单独识别 owner，而不是给整个应用选一个万能容器。
- 先排除派生值、重复副本和本应独立的组件实例 State。
- 单一使用者、最近共同父组件、Provider 子树三类 React 内部边界。
- Props/回调的显式通道，以及 `children` 对只负责布局的中间组件的作用。
- Context 读取范围与 State 生命周期所有权是两个不同问题。
- Reducer + Context 只有在复杂更新与深层共享同时成立时才有组合价值。
- 外部 Store 的最小判断：数据 owner 位于 React 外、会独立变化、存在订阅入口。
- React 官方优先级：能由 React 内建 State 管理时，不为“全局方便”创建外部 Store。
- TypeScript Props/`children`/Context value 类型用于表达接口，不替代运行时 owner 判断。

### 只需知道名称和去向

- `useSyncExternalStore` 是 React 接入外部 Store 的官方 Hook；完整签名、订阅、快照与 SSR 合同在 A15。
- 第三方状态库可能持有 React 外部状态，但 I07 不选型、不安装、不展示任何库。
- 浏览器 API 也可能是外部 Store 数据源；I07 不实现事件订阅适配器。

### 不要求掌握

- Fiber、Hook 链表、内部 Context value 栈、dispatcher、lane 与并发一致性算法。
- Redux、Zustand、MobX、XState 等第三方库 API 或架构比较。
- `subscribe`、`getSnapshot`、不可变快照缓存、`getServerSnapshot` 和 hydration。
- Context selector、Provider value memo 化、重渲染优化和外部 Store selector/equality。
- 服务器状态、查询缓存、乐观更新、持久化、离线同步、跨标签、跨 root 和多进程一致性。
- Effect、Ref、DOM 命令句柄或数据请求。

## 拆课结论

I07 保持一个知识点，不再拆课。“非 State -> 局部 -> 最近共同父组件 -> Provider 子树 -> reducer +
Context -> 已有非 React 数据源”是一条连续的所有权与数据来源选择链。

外部 Store 必须出现在选择链中，才能符合总计划；但其实现合同已经由高级 A15 单独承接。I07 正文和 Demo
不应引入第三方库，也不应实现订阅/快照协议。现有三段 Demo 足以观察 React 内部的三种边界；外部 Store
用一张判断表和反例说明即可。

## 官方参考资料

1. [React Versions](https://react.dev/versions)
2. [State: A Component's Memory](https://react.dev/learn/state-a-components-memory)
3. [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components)
4. [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure)
5. [Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context)
6. [`createContext`](https://react.dev/reference/react/createContext)
7. [`useContext`](https://react.dev/reference/react/useContext)
8. [Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context)
9. [`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore)
10. [Using TypeScript](https://react.dev/learn/typescript)
11. [`ReactFiberHooks.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js#L1909-L1935)
12. [`ReactContext.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/ReactContext.js#L14-L45)
13. [`ReactFiberNewContext.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberNewContext.js#L78-L147)
14. [`ReactHooks.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/ReactHooks.js#L188-L199)
