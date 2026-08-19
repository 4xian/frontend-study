# Reducer 与 Context 组合调研记录

## 一、目标与范围

- 课程 ID：`react.core.learn.intermediate.reducer-context-composition`
- 标题：`Reducer 与 Context 组合`
- 核验日期：`2026-08-16`
- 公共文档基线：React 官方文档 `19.2`
- 固定实现基线：`facebook/react` tag `v19.2.8`
- React 类型基线：仓库实际安装的 `@types/react 19.2.18`
- 已具备知识：`useReducer`、Action、纯 reducer、不可变更新、`createContext`、
  `useContext`、默认值和最近 Provider

本课只回答一个问题：一份已经决定由 `useReducer` 管理的 State，怎样通过明确的 Provider
边界，让深层组件按职责读取当前 State 或派发 Action。

本课负责以下内容：

1. State Context 与 dispatch Context 的职责拆分。
2. Provider 组件对 `useReducer`、两个 Context 和 `children` 的封装。
3. `useTaskState`、`useTaskDispatch` 这类薄读取 Hook 的缺失 Provider 合同。
4. 一次 Action 从深层事件入口到 reducer、下一份 State、State Context 消费者的完整数据流。
5. Provider 在组件树中的作用域、State 生命周期和嵌套实例。
6. 与上述组合直接相关的 TypeScript 类型。

范围边界：

- 不建立局部 State、提升 State、Context 与其他状态方案的选择体系。
- 不引入第三方状态库、外部 Store、持久化、请求、远程缓存或服务器组件。
- 不把 Context 描述成状态容器；State 仍由调用 `useReducer` 的组件实例拥有。
- 不重复完整教学 Action 设计、reducer 纯度、Context 默认值或 Provider 覆盖。
- 不把拆分 State/dispatch Context 夸大为自动阻止 render 的性能方案。

## 二、一手来源与证据等级

### 1. 公共合同

| 编号 | 一手来源 | 版本口径 | 本课采用的事实 |
| --- | --- | --- | --- |
| R1 | [React Versions](https://react.dev/versions) | React 官方文档 19.2 | `react.dev` 当前稳定文档口径为 19.2。 |
| R2 | [Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context) | React 19.2 | 官方任务示例创建 State Context 和 dispatch Context；由 Provider 调用 `useReducer`、接收 `children` 并提供两条通道；读取方可封装为 Hook。 |
| R3 | [`useReducer`](https://react.dev/reference/react/useReducer) | React 19.2 | State、dispatch、reducer 更新流程、dispatch 稳定身份、当前快照、`Object.is` 跳过和纯 reducer 合同。 |
| R4 | [`useContext`](https://react.dev/reference/react/useContext) | React 19.2 | 最近祖先 Provider、同一组件返回的 Provider 不影响自身读取、Context value 的 `Object.is` 比较、对象身份、缺少 `value` 与显式 `undefined`。 |
| R5 | [`createContext`](https://react.dev/reference/react/createContext) | React 19.2 | 静态默认值、Context 对象不保存业务信息、value 可为任意类型、React 19 Provider 语法、最内层匹配值。 |
| R6 | [Using TypeScript](https://react.dev/learn/typescript#typing-usereducer) | React 19.2 | State/Action/reducer 类型、nullable Context、Hook 内运行时检查、`ReactNode` children 类型。 |
| R7 | [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks) | React 19.2 | 调用 Hook 的函数名以 `use` 开头；Hook 只在函数组件或自定义 Hook 顶层调用。 |
| R8 | [State: A Component's Memory](https://react.dev/learn/state-a-components-memory#state-is-isolated-and-private) | React 19.2 | 同一组件渲染两份时，每个组件实例拥有隔离的 State。 |
| R9 | [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state) | React 19.2 | 同一组件在树中同一位置时保留 State；移除或替换该位置会丢弃 State。 |
| T1 | [TypeScript Narrowing: Discriminated unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions) | TypeScript 官方 Handbook | 共同的字面量属性构成判别字段；检查该字段后联合成员收窄；控制流可排除 `null`。 |
| N1 | [`@types/react@19.2.18`](https://www.npmjs.com/package/@types/react/v/19.2.18) | 仓库 `package-lock.json` 与 `node_modules` 实际版本 19.2.18 | `Dispatch<A>`、`ReactNode`、`createContext<T>`、`useContext<T>` 和 `useReducer` 的项目类型身份。 |

R1-R9 是学习者可以依赖的 React 公共合同。T1 是 TypeScript 语言合同。N1 不是 React
运行时规范，而是本仓库实际使用的 DefinitelyTyped 声明包；本课只用它确定项目中的类型名称和形状。

### 2. React `v19.2.8` 固定源码

| 编号 | 固定源码 | 只用于确认的实现事实 |
| --- | --- | --- |
| S1 | [`ReactFiberHooks.js` L1257-L1291](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js#L1257-L1291)、[L1573-L1574](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js#L1573-L1574) | mount 时把绑定后的 reducer dispatch 保存到 Hook queue；更新时复用 `queue.dispatch`。 |
| S2 | [`ReactContext.js` L14-L45](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/ReactContext.js#L14-L45) | `createContext` 用默认值初始化内部槽；React 19 中 `.Provider` 指向同一个 Context 对象。 |
| S3 | [`ReactFiberNewContext.js` L78-L147](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberNewContext.js#L78-L147) | 进入 Provider 时压入旧值，离开子树时恢复旧值。 |
| S4 | [`ReactFiberNewContext.js` L208-L267](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberNewContext.js#L208-L267)、[L382-L403](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberNewContext.js#L382-L403)、[L465-L485](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberNewContext.js#L465-L485) | 依赖按同一 Context 对象匹配；Provider 前后 value 通过 `Object.is` 语义比较；读取依赖保存上次值。 |
| S5 | [`ReactFiberBeginWork.js` L3607-L3631](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberBeginWork.js#L3607-L3631) | Provider 从 props 读取 `value` 和 `children`；开发环境缺少 `value` 时警告并把 `undefined` 压入。 |

S1-S5 只解释 React `v19.2.8` 的当前实现，不能把 queue、Fiber、内部值槽、依赖链或函数名写成
应用层 API。正文结论仍以 R2-R9 为准。

### 3. 本仓库 React 类型身份

仓库安装的 `@types/react` 是 `19.2.18`。其 `index.d.ts` 当前给出：

- `Dispatch<A> = (value: A) => void`。
- `ReactNode` 包含 React element、字符串、数字、可迭代节点、Portal、布尔值、`null`、
  `undefined`、Promise 等可作为 JSX children 的节点类型。
- `createContext<T>(defaultValue: T): Context<T>`，因此 `null` 默认值必须显式包含在泛型中。
- `useContext<T>(context): T`，读取返回值保留 Context 的完整联合类型。
- `useReducer` 从 reducer 与初始 State 推导 State 和 action 参数。

这些是 N1 与仓库当前安装声明的事实。TypeScript 控制流收窄仍由 T1 解释。

## 三、本课逐项知识合同

### 1. 组合解决的问题

`useReducer` 和 Context 解决的是不同问题：

- `useReducer` 把一份组件 State 的转换规则集中到 reducer，并提供 dispatch 入口。
- Context 让组件向任意深度的后代提供一个当前值，中间组件不必逐层转交对应 Props。
- 两者组合后，深层组件能读取上层 reducer 的当前 State，或把 Action 送回同一 reducer。

因此组合不会产生第三种 State。业务数据仍是 Provider 组件实例中的 reducer State；Context 只建立
State 与 dispatch 在该 Provider 子树中的可达通道。R5 还明确说明 Context 对象本身不保存业务信息，
它只代表其他组件提供或读取的是哪一个 Context。

### 2. 六个角色的职责

| 角色 | 本课职责 | 不负责 |
| --- | --- | --- |
| `useReducer` | 在 Provider 组件实例中保存当前 State，返回 State 与 dispatch。 | 不决定 Context 的覆盖范围。 |
| reducer | 接收当前 State 与 Action，纯计算并返回下一份 State。 | 不读取 Context，不请求数据，不操作 DOM。 |
| State Context | 把当前 State 作为 `value` 提供给子树读取方。 | 不生成、不持久化、不修改 State。 |
| dispatch Context | 把 reducer 的 dispatch 函数提供给子树事件入口。 | 不替代 Action，不直接计算下一份 State。 |
| Provider 组件 | 调用一次 `useReducer`，提供两条 Context 通道，渲染 `children`，确定 State 生命周期和可见范围。 | 不承担请求、持久化或缓存职责。 |
| `children` | 表示获得这组 State/dispatch 能力的实际子树。 | 不要求中间 shell 读取或转交 Context。 |

### 3. 两条 Context 是官方模式，不是唯一要求

R2 的任务示例明确创建两个独立 Context：`TasksContext` 提供任务列表，
`TasksDispatchContext` 提供 dispatch。课程采用相同结构，因为它直接表达三类依赖：

- 只读组件只调用 State 读取 Hook。
- 只写组件只调用 dispatch 读取 Hook。
- 同时读写组件调用两个 Hook。

但 React API 没有规定 reducer 必须配两条 Context。R5 明确 Context value 可以是任意类型，所以
`{ state, dispatch }` 单 Context 也是合法写法。准确表述应为：

- “两个 Context”是 React 官方组合教程采用的模式，也是本课的设计合同。
- 它不是 React 唯一支持的结构，也不是所有应用都必须遵守的架构规则。
- 拆分的直接收益是依赖通道和类型职责清楚。
- `dispatch` 身份稳定，dispatch Context 的 value 不随 reducer State 更新而变化；这不等于只写组件
  永远不 render。父组件 render、自身 State 和其他 Context 仍可能让它 render。
- 不能在没有测量的情况下把拆分写成自动性能优化。

### 4. Provider 封装

本科采用以下最小组合形状：

```tsx
import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react'

interface Task {
  id: number
  title: string
  done: boolean
}

interface TaskState {
  tasks: Task[]
  nextId: number
  lastAction: TaskAction['type'] | 'initialized'
}

type TaskAction =
  | { type: 'task/added'; title: string }
  | { type: 'task/toggled'; id: number }
  | { type: 'task/deleted'; id: number }
  | { type: 'workspace/reset' }

const TaskStateContext = createContext<TaskState | null>(null)
const TaskDispatchContext = createContext<Dispatch<TaskAction> | null>(null)

/** 为任务子树拥有 reducer State，并提供读取与更新通道。 */
function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  return (
    <TaskStateContext value={state}>
      <TaskDispatchContext value={dispatch}>{children}</TaskDispatchContext>
    </TaskStateContext>
  )
}
```

合同要点：

1. `useReducer` 在 `TaskProvider` 顶层调用；State 属于这个 Provider 组件实例。
2. React 19 直接渲染 `<TaskStateContext value={state}>`。旧
   `<TaskStateContext.Provider value={state}>` 是 React 19 以前的写法，固定实现仍兼容，但正文统一使用
   React 19 语法。
3. 两个 Provider 都覆盖同一 `children` 子树。它们的先后嵌套顺序不是 API 要求；本课固定一种写法，
   避免无意义变化。
4. `ReactNode` 适合 `children`，因为 Provider 可以包住元素、Fragment、文本、条件结果等合法 JSX
   children，不应窄化为单个 `ReactElement`。
5. Provider 组件只组装 State 与通道，不把 reducer 逻辑搬进 Context，也不把请求或持久化搬进 Provider。

### 5. nullable Context 与薄读取 Hook

当功能离开 Provider 没有合理业务含义时，State 和 dispatch Context 都应使用 `T | null`，并把
`null` 作为“没有匹配 Provider”的明确标记：

```tsx
/** 读取最近任务 Provider 的当前 State。 */
function useTaskState(): TaskState {
  const state = useContext(TaskStateContext)
  if (state === null) throw new Error('useTaskState 必须在 TaskProvider 内使用')
  return state
}

/** 读取最近任务 Provider 的 dispatch。 */
function useTaskDispatch(): Dispatch<TaskAction> {
  const dispatch = useContext(TaskDispatchContext)
  if (dispatch === null) throw new Error('useTaskDispatch 必须在 TaskProvider 内使用')
  return dispatch
}
```

这是 R6 明确推荐的 nullable Context 处理方式。本课中的两个 Hook 保持“薄”：只调用一次
`useContext`、检查缺失值并返回窄化后的结果，不增加业务转换或缓存。

TypeScript 合同如下：

1. `useContext(TaskStateContext)` 的初始类型是 `TaskState | null`。
2. `if (state === null) throw ...` 之后，不能继续执行的 `null` 分支被控制流排除，返回值收窄为
   `TaskState`。
3. dispatch Hook 同理返回 `Dispatch<TaskAction>`，调用方只能派发判别联合允许的 Action。
4. Hook 名称必须以 `use` 开头，因为内部调用了 `useContext`；调用方只能在函数组件或其他自定义 Hook
   的顶层调用，不能在事件处理器、条件或循环中调用。
5. 显式返回类型让 Context 的公共入口可读，也能防止未来误把 `null` 泄漏给调用方。

`createContext<Dispatch<TaskAction>>(() => {})` 不是等价替代。no-op dispatch 会把 Provider 缺失伪装成
合法更新入口，点击后静默无结果；伪造空 State 也会把配置错误伪装成真实空状态。

### 6. 一次 Action 的公开数据流

一次添加、切换、删除或重置应能按以下顺序解释：

```text
深层事件处理器
  -> useTaskDispatch() 取得最近 dispatch Context 的 dispatch
  -> dispatch(action)
  -> React 用 Provider 当前 State 和 action 调用 taskReducer
  -> reducer 纯计算并返回 nextState
  -> React 保存 nextState，并让 TaskProvider 进入后续 render
  -> TaskStateContext 收到新的 state value
  -> 读取 TaskStateContext 的后代取得新 State
  -> UI 显示新的任务、统计和 lastAction
```

需要同时说明三个边界：

- `dispatch(action)` 返回 `void`，不会把下一份 State直接返回给事件处理器。
- 同一事件处理器在 dispatch 后读取的 `state` 仍是当前 render 的旧快照。
- reducer 若返回与当前 State 经 `Object.is` 比较相同的值，React 可以跳过该 State 更新对应的组件与
  子树 render；正常分支应通过不可变更新返回下一份 State。

dispatch Context 在这条数据流中提供稳定的函数身份。S1 确认 `v19.2.8` mount 时将绑定函数存入 queue，
后续从 queue 取回同一函数；正文只保留 R3 的“dispatch 身份稳定”公共结论。

### 7. 最近祖先、对象身份与半套 Provider

R4-R5 给出四条必须直接写清的规则：

1. `useContext` 从调用组件所在位置向父树查找最近的同一 Context Provider。
2. 同一组件 return 出来的 Provider 不会影响该组件已经执行的 `useContext`；读取方必须是 Provider
   的后代。
3. 提供方和读取方必须引用完全相同的 Context 对象。名称、泛型和默认值相同都不能替代对象身份。
4. Provider 明确提供 `undefined` 或遗漏 `value` 时，读取结果是 `undefined`，不会退回
   `createContext` 的默认值。

本课还有一个组合特有错误：只包 State Provider 或只包 dispatch Provider。此时一个 Hook 可能成功，
另一个 Hook 会抛出缺失 Provider 错误。`TaskProvider` 应始终把两条通道作为一个完整边界提供给同一
`children`。

### 8. Provider State 生命周期

Provider 不是静态模块，也不是脱离组件树的容器。它是调用 `useReducer` 的普通函数组件：

- 同一个 `TaskProvider` 组件实例在树中同一位置持续存在时，React 保留它的 reducer State。
- 移除该 Provider、在相同位置换成其他组件，或通过已有的身份规则重建它时，原 reducer State 被丢弃。
- 渲染两个 `TaskProvider` 实例时，每个实例各自调用 `useReducer`，因此拥有隔离的 State 与 dispatch。
- Context 让后代连接到最近实例，不会把两个 Provider 实例的 State 合并。

这些结论由 R8-R9 的组件 State 合同与 R4 的最近 Provider 合同共同推导，不需要教学 Fiber 内部结构。

### 9. 嵌套同类型 Provider

以下树中有两个独立 `TaskProvider` 实例：

```tsx
<TaskProvider>
  <OuterSummary />
  <TaskProvider>
    <InnerWorkspace />
  </TaskProvider>
  <OuterActions />
</TaskProvider>
```

- `OuterSummary` 与 `OuterActions` 读取外层 State/dispatch。
- `InnerWorkspace` 对两条 Context 都命中最近的内层 Provider。
- 内层 dispatch 只更新内层 reducer State；外层 dispatch 只更新外层 reducer State。
- 内层 Provider 不是覆盖或修改外层 State，而是建立另一份组件 State 和另一组最近值。
- 内层 Provider 被移除后，它的 State 被丢弃；重新出现时从初始 State 开始。

S3 的 Provider 值压栈/恢复与该公共行为一致，但“值栈”不是学习者需要依赖的 API。

### 10. Context value 身份与拆分边界

R4 明确使用 `Object.is` 比较 Provider 的前后 value，并通知读取该 Context 的组件取得新值。应用到本课：

- State Context 的 value 是 reducer State。合法更新通常返回新对象，因此 State 读取方取得新值。
- dispatch Context 的 value 是稳定 dispatch；仅 reducer State 更新时，它仍是同一个函数。
- 单 Context 的 `{ state, dispatch }` 每次创建新对象时，所有读取该 Context 的组件都订阅同一个变化值。
- 两条 Context 能表达不同依赖，但不能据此承诺具体 render 次数。
- 不在本课引入 `useMemo`、`memo`、Context selector 或 render 计数器；它们会把主线转成性能优化教学。

## 四、TypeScript 课程合同

### 1. State 与 Action

`TaskState` 应显式表达 reducer 管理的完整状态：任务列表、下一个确定性 ID 和最近一次 Action。
`TaskAction` 使用判别联合，让每个 `type` 只携带该分支需要的字段：

| Action | 必需字段 | 不应携带 |
| --- | --- | --- |
| `task/added` | `title: string` | 调用方拼好的完整下一份 State |
| `task/toggled` | `id: number` | 可选 `done` 字段袋 |
| `task/deleted` | `id: number` | 整个 Task 对象 |
| `workspace/reset` | 无额外字段 | 空 `payload` 或旧 State |

`switch (action.type)` 后，T1 保证 TypeScript 在分支中收窄到对应成员。正文只复述这个现成前置能力，
不再次展开完整 Action 设计课程。

### 2. Context 与 Hook 类型

| 入口 | 声明类型 | 读取前 | 检查后 / 返回类型 |
| --- | --- | --- | --- |
| `TaskStateContext` | `Context<TaskState | null>` | `TaskState | null` | `TaskState` |
| `TaskDispatchContext` | `Context<Dispatch<TaskAction> | null>` | `Dispatch<TaskAction> | null` | `Dispatch<TaskAction>` |
| `TaskProvider.children` | `ReactNode` | 可接受合法 JSX children | 原样渲染在两个 Provider 内 |

不要使用类型断言把错误藏起来：

```tsx
// 错误：类型断言没有创建真实 Provider。
const TaskStateContext = createContext({} as TaskState)

// 正确：类型和运行时都承认 Provider 可能缺失。
const TaskStateContext = createContext<TaskState | null>(null)
```

### 3. 返回值和命名

薄 Hook 的签名应在源码中一眼可见：

```tsx
function useTaskState(): TaskState
function useTaskDispatch(): Dispatch<TaskAction>
```

它们不是普通工具函数。名称以 `use` 开头，调用位置遵守 Hooks 规则，且只负责 Context 读取与缺失检查。
不要做成接受任意 Context 的通用工厂；本课只有这两个明确入口。

## 五、组合边界

### 1. Context 不拥有 State

准确句式：

> `TaskProvider` 组件实例通过 `useReducer` 拥有 State；State Context 提供当前 State，dispatch Context
> 提供发送 Action 的入口。

应删除或避免以下句式：

- “Context 保存全局 State。”
- “把 State 存进 Context。”
- “dispatch Context 会更新 State。”
- “Provider 是独立于组件树的 Store。”

### 2. reducer 合同不因 Context 改变

Context 只改变值到达后代的方式，不改变 reducer 的既有合同：

- reducer 仍是纯函数。
- 不修改旧对象或数组，返回不可变的下一份 State。
- 不在 reducer 中请求、记录日志、操作 DOM、生成随机值或读取当前时间。
- Action 仍描述发生了什么，事件处理器仍只 dispatch 意图。

正文只保留一段组合提醒和一个直接 mutation 对照，不重复前置课程的完整纯度章节。

### 3. Provider 不承担外部职责

`TaskProvider` 的本科职责到以下三步结束：调用 `useReducer`、提供两个 Context、渲染 `children`。
它不负责保存到本地、调用接口、同步远程数据、跨 root 通信或提供缓存。Demo 只使用确定性本地交互。

### 4. 不建立状态方案选型

本课从“已经决定由 reducer 管理且需要跨深层子树共享”开始。正文不比较多种 State 归属方案，不提供
决策表，也不把本组合推广为所有共享 State 的默认答案。

### 5. 不承诺自动性能收益

可以说“拆分后组件只声明自己读取的 Context”，不能说“只写组件不会再 render”或“两个 Context
一定更快”。公共合同只保证 dispatch 身份稳定，以及 Context value 变化按 `Object.is` 传播；完整 render
行为还受组件树、Props、自身 State 和其他 Context 影响。

## 六、live 正文与元数据审计

审计对象：`src/categories/frontend/react/core/learn/reducer-context-composition.md`。

### 1. 标题、导航与 frontmatter

| 项目 | 动作 | 审计结论 |
| --- | --- | --- |
| `id` | 保留 | `react.core.learn.intermediate.reducer-context-composition` 与稳定入口一致。 |
| 标题 | 保留 | “Reducer 与 Context 组合”短、准确，只体现本课，不需要副标题。正文 H1 与导航标题应一致。 |
| `summary` | 保留并补充 | 当前“独立的 State Context 和 dispatch Context”准确；可补一句 Provider 封装，但不写成唯一官方要求或性能保证。 |
| `prerequisites` | 补充 | 当前只列 Context；应同时列 `react.core.learn.intermediate.use-reducer` 与 `react.core.learn.intermediate.context-providing-and-reading`。 |
| `related` | 删除或合并 | 当前两项都属于必需知识且与 `prerequisites` 重复。移入 `prerequisites` 后删除重复 related；不挂状态方案选型内容。 |
| `tags` | 保留 | React、useReducer、Context、dispatch、Provider 都直接服务本课。 |
| `appliesTo` | 补充 | 明确公共文档为 React 19.2，仓库运行时为 React 19.2.8；不把固定源码细节写成公共保证。 |
| `objectives` / `recap` | 保留并校正 | 保留职责、Provider、深层读取和数据流；新增薄 Hook、Provider 生命周期与嵌套实例；把“双 Context”写成课程采用的官方模式，而非 API 唯一要求。 |
| `sources` | 补充 | 保留 R1-R5；加入 R6、R7、R8-R9 与 T1/N1 中正文实际使用的事实。source claim 必须具体。 |

学习者可见标题、summary、objectives、recap 和章节正文不得出现生产过程或其他课程的安排叙事。

### 2. 正文章节逐项处理

| live 部分 | 保留 | 补充 | 删除 / 移动 / 合并 |
| --- | --- | --- | --- |
| 学习目标 | 四个职责、两条通道、完整 Action 数据流、组合边界 | 薄 Hook 返回合同；Provider 生命周期；嵌套实例独立性 | 删除“方案选择”式目标；不延伸外部能力 |
| 为什么需要 | reducer 集中转换、Context 跨中间层、State 仍属于调用 Hook 的组件 | 明确组合前提是已经确定 reducer State 和共享子树 | 删除“若只有一个组件就选什么”的比较叙事 |
| 四个职责 | 现有图和 Provider / State Context / dispatch Context / reducer 定义 | `children` 职责；Context 本身不保存信息 | 合并重复出现的“Context 不是容器”说明，只保留一次核心定义 |
| 创建两条 Context | nullable State/dispatch 类型；只读/只写/读写三类依赖 | `TaskState` 完整类型、`Dispatch<TaskAction>`、两条 Context 非唯一要求 | 删除任何“官方要求必须两条”的绝对表述 |
| Provider 封装 | React 19 语法；两个 Provider 覆盖同一 children | `ReactNode`；组件位置决定生命周期；多个实例隔离；嵌套命中最近实例 | 把旧版本语法压缩为一句兼容说明，不扩展迁移教学 |
| 深层读取 | 中间 shell 不转交 Props；只读与只写组件 | 用 `useTaskState`、`useTaskDispatch` 统一调用点；显式返回类型与 Hook 规则 | 移除组件内重复手写 `useContext + null` 的主示例，保留为 Hook 内实现 |
| 更新数据流 | 事件 -> Action -> reducer -> 新 State -> State Context 读取方；旧快照 | `lastAction` 可观察结果；dispatch Context value 保持稳定 | 合并前置 Action/纯 reducer 解释，不重开独立章节 |
| 单对象 Context 对照 | 单对象写法可以运行；两条通道依赖更清楚 | 明确它不是错误，也不是自动性能结论 | 删除“单对象一定导致问题”式措辞；不加入 memo 微优化 |
| Demo 引导 | 本地任务工作区、统计、添加、切换、重置、shell | 删除、同时读写组件、嵌套 Provider 独立实例、固定交互序列、TSX/CSS 同时展示 | 删除重复 API 讲解和英文生产标签 |
| 易错提示 | 伪造默认值、半套 Provider、Context 对象错配、mutation、旧快照 | 两条 Context 非唯一要求；嵌套误连到内层实例；Hook 调用位置 | 合并重复的 Context 基础错误；每项保留错误/正确对照和可见后果 |
| 原理与适用场景 | Context 不拥有 State；拆分不是零 render 保证 | Provider 边界与生命周期 | 删除“适用/不适用”选型清单；删除外部状态方案比较 |
| 练习 | 购物清单 Provider、只读/只写/读写组件、不可变 reducer | nullable Hook、嵌套实例预测、删除 Action | 不要求网络、缓存或持久化 |
| 小结与来源 | reducer/Context 职责、Provider、深层通道 | 非唯一模式、Hook 收窄、实例隔离 | 删除版本之外的生产状态叙事 |

### 3. 应直接校正的现有表述

现有研究旧稿曾写“官方组合专题明确要求创建两个 Context”。应改成：

> React 官方组合教程创建两个独立 Context；本课采用该模式表达 State 与 dispatch 两类依赖。React
> Context API 允许任意 value，因此这不是唯一合法结构。

现有正文把 `TaskRow` 说明成只派发组件、把 `TaskList` 说明成只读组件，整体没有一个明确“同时读写”的
组件。Demo 可将 `TaskList` 改为同时调用两个 Hook，并把 `TaskRow` 保持为展示组件；这样三类角色均可从
源码直接识别。

现有“不适用场景”已进入多方案选择，应删除。保留一句范围即可：本组合只解决既有 reducer State 在一个
Provider 子树内的读取与 dispatch 通道，不增加其他数据能力。

## 七、live Demo 与 CSS 审计

审计对象：

- `src/categories/frontend/react/core/demos/reducer-context-composition/task-context-demo.tsx`
- `src/categories/frontend/react/core/demos/reducer-context-composition/task-context-demo.css`
- 该 Demo 在 `demo-manifest.ts` 中的当前注册

### 1. TSX 逐项结论

| live 资产 | 动作 | 结论 |
| --- | --- | --- |
| `Task` / `TaskState` / 判别联合 | 保留并补充 | 现有添加、切换、重置和 `lastAction` 清楚；新增 `task/deleted`，继续使用确定性 `nextId`。 |
| `taskReducer` | 保留并补充 | 现有分支均不可变；新增删除分支。不要加入请求、时间、随机数或日志。 |
| 两个 nullable Context | 保留 | 类型与 Provider 缺失合同准确。 |
| `useTaskState` / `useTaskDispatch` | 保留 | 已有显式返回类型、`null` 检查和清楚错误文案，正是本课主入口。 |
| `TaskProvider` | 保留并补充观察 | 已正确调用一次 reducer 并包住同一 children；通过嵌套同类型实例展示 State 生命周期，不需要把 Context 或 reducer 做成通用工厂。 |
| `TaskSummary` | 保留 | 明确只读，显示总数、完成数和 `lastAction`。 |
| `TaskComposer` | 保留 | 明确只写；本地输入 State 只服务表单草稿，不进入 Context。 |
| `TaskRow` / `TaskList` | 合并职责 | 当前 TaskList 只读、TaskRow 只写，缺少同时读写组件。让 TaskList 同时调用两条 Hook，负责切换/删除；TaskRow 可变为无 Hook 的展示行，或将行合并回 TaskList。 |
| `ResetWorkspaceButton` | 保留 | 明确只写，形成确定性回到初始 State 的路径。 |
| `WorkspaceShell` | 保留 | 证明中间组件只渲染 children，不接收任务 State 或更新回调。 |
| 顶层标题 | 修改 | 删除 `Reducer + two Contexts` 这类可能暗示唯一结构的英文标签，使用简短中文职责标签或直接省略。 |
| 嵌套实例区 | 新增 | 在外层 Provider 子树中再渲染一个同类型 Provider；同时显示外层和内层统计，并给内层一个独立添加入口。 |
| 缺失 Provider | 移到负向例子 | 不让主 Demo 故意崩溃。正文提供可运行错误/正确对照，说明 Hook 会在缺失时抛错。 |

### 2. CSS 结论

现有 CSS 可以保留：

- TSX 已真实 `import './task-context-demo.css'`。
- 使用 Flexbox、margin 和正常文档流，没有 `grid` 或 `gap`。
- 表单控件、任务文字和 `lastAction` 已有稳定尺寸、换行和窄屏处理。
- 新增删除按钮和嵌套实例区时继续沿用现有边框、margin 与 Flexbox，不增加装饰性卡片套卡片。
- 嵌套区域必须从可见标签和边界上区分“外层实例”“内层实例”，但不依赖颜色单独传达身份。

当前 Demo 注册的 `loadSource` 只读取 `task-context-demo.tsx`，虽然 CSS 真正参与运行，学习者却无法在
源码区同时看到 CSS。应采用仓库已有的多文件 source loader 形式，同时登记：

1. `task-context-demo.tsx`
2. `task-context-demo.css`

运行组件继续直接加载同一 TSX；展示源码直接读取运行 TSX 和被它 import 的同一 CSS，不能维护复制版。

### 3. 固定交互序列

Demo 使用确定性初始值：外层与内层各有任务 2 项、完成 1 项、`lastAction = initialized`。固定代表序列：

1. 外层输入“完善 Provider 合同”并提交。
   - 外层：3 项、完成 1 项、`lastAction = task/added`，输入框清空。
   - 内层：仍为 2 项、完成 1 项、`lastAction = initialized`。
2. 外层切换 `id = 1`。
   - 外层：完成 2 项、`lastAction = task/toggled`。
   - 内层不变。
3. 外层删除 `id = 2`。
   - 外层：2 项、完成 1 项、`lastAction = task/deleted`。
   - 被删除标题不再出现。
4. 点击“在内层添加检查项”。
   - 内层：3 项、完成 1 项、`lastAction = task/added`。
   - 外层仍为 2 项、完成 1 项、`lastAction = task/deleted`。
5. 点击外层“重置工作区”。
   - 外层回到 2 项、完成 1 项、`lastAction = workspace/reset`。
   - 内层仍为 3 项、`lastAction = task/added`，证明外层 dispatch 没有重置内层实例。

这个序列同时证明添加、切换、删除、重置、`lastAction`、三类读取职责、中间 shell 和嵌套 Provider
隔离，不需要 render 次数、异步任务或外部系统。

### 4. Demo 可观察合同

| 观察目标 | 源码角色 | 可见结果 |
| --- | --- | --- |
| 只读 | `TaskSummary -> useTaskState` | State 更新后统计和 `lastAction` 改变。 |
| 只写 | `TaskComposer`、`ResetWorkspaceButton -> useTaskDispatch` | 不读取任务列表也能派发合法 Action。 |
| 同时读写 | `TaskList -> useTaskState + useTaskDispatch` | 从 State 生成列表，并派发切换、删除 Action。 |
| 中间层透明 | `WorkspaceShell({ children })` | 不接收任务 State、dispatch 或业务回调。 |
| Provider 封装 | `TaskProvider` | 两个 Context 始终覆盖同一 children。 |
| 实例隔离 | 外层与内层 `TaskProvider` | 任一实例更新时，另一实例的统计和 `lastAction` 不变。 |
| nullable 边界 | 两个薄 Hook | 移出对应 Provider 会得到明确错误，而不是空数据或静默 dispatch。 |
| 同源展示 | source loader 的 TSX 与 CSS 两个条目 | 展示的逻辑、组件和样式就是实际运行文件。 |

## 八、常见错误与负向对照

### 1. 把双 Context 写成 React 唯一要求

- **错误：** “Reducer 与 Context 组合必须创建两个 Context，否则不符合 React。”
- **原因：** R2 使用两个 Context，但 R5 允许 Context value 为任意类型。
- **后果：** 把官方示例模式误写成 API 限制。
- **正确：** “本课采用官方教程的 State/dispatch 双 Context 模式，以明确两类依赖。”
- **可解释结果：** 单个 `{ state, dispatch }` Context 能运行，只是依赖合同不同。

### 2. 把拆分写成自动性能优化

```tsx
// 错误结论：只要拆开，这个组件就永远不会 render。
const dispatch = useTaskDispatch()

// 正确结论：它不订阅 State Context，但仍受正常组件 render 规则影响。
const dispatch = useTaskDispatch()
```

- **错误后果：** 学习者把 Context 通道与完整 render 行为混为一谈。
- **正确观察：** 只说明 dispatch Context value 稳定，不显示未经测量的 render 计数。
- **来源：** R3-R4；S1 只解释固定实现。

### 3. 用伪造默认值隐藏 Provider 缺失

```tsx
// 错误：缺失 Provider 时点击会静默无结果。
const TaskDispatchContext = createContext<Dispatch<TaskAction>>(() => {})

// 正确：缺失 Provider 是显式运行时错误。
const TaskDispatchContext = createContext<Dispatch<TaskAction> | null>(null)
```

- **错误结果：** UI 看起来可操作，但 reducer 从未收到 Action。
- **正确结果：** `useTaskDispatch` 在错误边界处立即说明必须位于 `TaskProvider` 内。
- **来源：** R5-R6。

### 4. 只提供半套 Context

```tsx
// 错误：读取 State 成功，派发入口缺失。
<TaskStateContext value={state}>{children}</TaskStateContext>

// 正确：两条通道覆盖同一子树。
<TaskStateContext value={state}>
  <TaskDispatchContext value={dispatch}>{children}</TaskDispatchContext>
</TaskStateContext>
```

- **错误结果：** `useTaskState` 正常，`useTaskDispatch` 抛错，页面表现成“能看不能改”。
- **正确结果：** Provider 作为一个组合边界同时提供 State 与 dispatch。
- **来源：** R2、R4-R6。

### 5. 在 Provider 自身中读取它刚返回的 Context

```tsx
// 错误：这里读取父树，不会读取下面刚返回的 Provider。
function TaskProvider({ children }: { children: ReactNode }) {
  const state = useContext(TaskStateContext)
  return <TaskStateContext value={initialState}>{children}</TaskStateContext>
}

// 正确：由真正后代通过薄 Hook 读取。
<TaskProvider>
  <TaskSummary />
</TaskProvider>
```

- **错误结果：** 取得外层值或 `null`。
- **正确结果：** `TaskSummary` 命中上方最近的 `TaskProvider`。
- **来源：** R4。

### 6. Provider 与 Hook 引用不同 Context 对象

```tsx
// 错误：provider.ts 与 hooks.ts 各创建一次同名 Context。
const TaskStateContext = createContext<TaskState | null>(null)

// 正确：模块顶层创建一次，Provider 与 Hook 导入同一导出。
export const TaskStateContext = createContext<TaskState | null>(null)
```

- **错误结果：** Hook 找不到预期 Provider，只得到自己的 `null`。
- **正确结果：** 提供和读取通过同一对象身份连接。
- **来源：** R4；S4 是固定实现佐证。

### 7. 在事件处理器内调用读取 Hook

```tsx
// 错误：Hook 不能在事件处理器中调用。
function handleClick() {
  const dispatch = useTaskDispatch()
  dispatch({ type: 'workspace/reset' })
}

// 正确：组件顶层读取，事件处理器只使用已取得的 dispatch。
const dispatch = useTaskDispatch()
function handleClick() {
  dispatch({ type: 'workspace/reset' })
}
```

- **错误结果：** 违反 Hooks 调用规则。
- **正确结果：** 每次 render 的 Hook 顺序稳定，事件只派发 Action。
- **来源：** R7。

### 8. 把 Context 当可变容器

```tsx
// 错误：修改旧数组并返回原 State。
state.tasks.push(task)
return state

// 正确：返回完整、不可变的下一份 State。
return { ...state, tasks: [...state.tasks, task] }
```

- **错误结果：** 旧快照被污染，返回同一引用还可能被 `Object.is` 判为无变化。
- **正确结果：** State Context 在后续 render 收到下一份 State。
- **来源：** R3-R4。

### 9. dispatch 后立即把当前 State 当成新值

```tsx
// 错误：state 仍是当前 render 的快照。
dispatch({ type: 'task/toggled', id })
save(state.tasks)

// 正确：事件只 dispatch；新值由后续 render 的 State Context 读取方显示。
dispatch({ type: 'task/toggled', id })
```

- **错误结果：** 保存或判断使用旧任务列表。
- **正确结果：** `TaskSummary` 和 `TaskList` 在后续 render 读取新 State。
- **来源：** R3。

### 10. 把嵌套 Provider 当成同一份 State

```tsx
<TaskProvider>
  <OuterSummary />
  <TaskProvider>
    <InnerWorkspace />
  </TaskProvider>
</TaskProvider>
```

- **错误理解：** 内层 dispatch 会同时修改外层任务。
- **原因：** 忽略组件 State 实例隔离和最近 Provider 规则。
- **正确结果：** 内层读取和派发连接内层实例；外层兄弟继续连接外层实例。
- **来源：** R4、R8-R9；S3 只作固定实现佐证。

## 九、正文与 Demo 完成判定

### 1. 正文

- [ ] 标题保持“Reducer 与 Context 组合”，导航和 H1 一致。
- [ ] `prerequisites` 同时包含 useReducer 与 Context 两项稳定 ID，`related` 不重复它们。
- [ ] 开头直接说明 State 由 Provider 组件中的 `useReducer` 拥有，Context 只提供通道。
- [ ] 六个角色职责清楚：`useReducer`、reducer、State Context、dispatch Context、Provider、
      `children`。
- [ ] 明确双 Context 是官方教程模式与本课合同，不是 React 唯一要求。
- [ ] 明确 dispatch 稳定身份，但不承诺拆分自动减少所有 render。
- [ ] 完整展示 `TaskState`、判别联合 `TaskAction`、`Dispatch<TaskAction>`、`ReactNode` 与 nullable
      Context。
- [ ] 两个薄 Hook 有中文职责注释、显式返回类型、`null` 检查和明确错误。
- [ ] 数据流覆盖 Action、reducer、next State、后续 render、State Context 消费者与 `lastAction`。
- [ ] 说明 Provider 的树位置、State 保留/丢弃和嵌套同类型实例隔离。
- [ ] reducer 纯度与不可变更新只作组合提醒，不重复完整前置教学。
- [ ] 不出现状态方案选型、第三方库、持久化、请求、远程缓存、服务器组件或性能微优化。
- [ ] 易错点均有错误代码、正确代码、原因和可观察结果。

### 2. Demo

- [ ] 真实运行文件仍是 `task-context-demo.tsx`，样式仍来自其 import 的
      `task-context-demo.css`。
- [ ] 源码区同时展示运行 TSX 和运行 CSS，不展示复制文本。
- [ ] `TaskSummary` 只读，`TaskComposer` 与重置按钮只写，`TaskList` 同时读写。
- [ ] `WorkspaceShell` 不接收任务 State、dispatch 或业务回调。
- [ ] 添加、切换、删除、重置均只派发一个明确 Action。
- [ ] 每次交互同步显示任务数、完成数和 `lastAction`。
- [ ] 外层和内层同类型 Provider 有清楚标签，任一实例更新不会改变另一实例。
- [ ] 缺失 Provider 由薄 Hook 的负向对照解释，不靠 no-op 或伪造 State 掩盖。
- [ ] TSX 方法继续使用规范中文职责注释；CSS 继续使用 Flexbox、margin 与正常文档流。

## 十、核心结论

Reducer 与 Context 的组合不创造新的状态容器。Provider 组件实例调用 `useReducer` 并拥有 State；
State Context 提供当前事实，dispatch Context 提供稳定的 Action 入口，两个薄 Hook 把 nullable Context
收窄为明确的业务返回类型。React 官方教程采用两个独立 Context，但这不是 Context API 的唯一要求；
本课选择它是为了表达读取和派发两类依赖，而不是承诺自动性能收益。

一次更新从深层事件 dispatch Action，经过纯 reducer 得到下一份 State，再由 State Context 让后续
render 的读取方取得新值。Provider 的位置决定 State 生命周期和可见子树；同类型 Provider 的不同组件
实例拥有隔离 State，嵌套读取始终命中最近实例。Context 不承担持久化、请求、缓存或其他外部职责。
