---
id: react.core.learn.intermediate.reducer-context-composition
type: lesson
title: Reducer 与 Context 组合
summary: 用 Provider 封装 reducer，并用独立的 State Context 和 dispatch Context 让深层组件读取或更新同一份 State。
domain: frontend
technology: react
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 55
prerequisites:
  - react.core.learn.intermediate.use-reducer
  - react.core.learn.intermediate.context-providing-and-reading
related: []
tags:
  - React
  - useReducer
  - Context
  - dispatch
  - Provider
appliesTo: React 19.2 官方文档与仓库运行时 React 19.2.8 的 Provider 语法
verifiedAt: 2026-08-16
objectives:
  - 能解释 reducer 与 Context 在组合模式中的不同职责。
  - 能创建独立的 State Context 和 dispatch Context。
  - 能在一个 Provider 组件中拥有 reducer State 并向子树提供两条通道。
  - 能让深层只读组件读取 State，让只写组件只取得 dispatch。
  - 能让同一个组件同时读取 State 和 dispatch，并保持 Action 边界清楚。
  - 能追踪一次 Action 从深层事件入口到下一次 Context 读取结果的数据流。
  - 能解释 Provider 的作用域、State 生命周期和嵌套实例隔离。
  - 能识别缺失 Provider、错误 Context 身份、Hook 调用位置和 reducer 不纯等组合错误。
recap:
  - useReducer 仍拥有 State 并计算更新，Context 只负责把 State 与 dispatch 传入子树。
  - State Context 和 dispatch Context 分开后，组件可以只声明自己真正需要的依赖通道。
  - Provider 组件调用一次 useReducer，再用两个 Provider 包住同一 children 子树。
  - 深层组件 dispatch Action 后，reducer 返回下一份 State，读取 State Context 的组件在后续 render 得到新值。
  - 双 Context 是清楚表达两类依赖的官方组合模式，不是 React API 的唯一合法结构。
  - State 的生命周期由 Provider 组件实例在树中的位置决定，嵌套实例各自拥有隔离 State。
sources:
  - title: React Versions
    url: https://react.dev/versions
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - react.dev 当前文档版本口径为 React 19.2
  - title: Scaling Up with Reducer and Context
    url: https://react.dev/learn/scaling-up-with-reducer-and-context
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 创建 State Context 与 dispatch Context 两个通道
      - 在拥有 reducer 的组件中提供两条通道
      - 深层组件可以读取 State 或 dispatch Action
  - title: useReducer
    url: https://react.dev/reference/react/useReducer
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - useReducer 返回当前 State 与稳定身份的 dispatch
      - dispatch 安排下一次更新且当前 State 仍是旧快照
      - reducer 必须纯净并返回不可变的下一份 State
  - title: useContext
    url: https://react.dev/reference/react/useContext
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 读取方使用上方最近 Provider 的当前值
      - Context value 变化按 Object.is 比较并传播给读取方
      - 提供方与读取方必须引用同一个 Context 对象
  - title: createContext
    url: https://react.dev/reference/react/createContext
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 默认值仅在上方没有匹配 Provider 时使用
      - React 19 可以直接渲染 Context 作为 Provider
  - title: Extracting State Logic into a Reducer
    url: https://react.dev/learn/extracting-state-logic-into-a-reducer
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Action 描述发生的事件，reducer 决定 State 如何变化
      - reducer 应保持纯净并使用不可变更新
  - title: Rules of Hooks
    url: https://react.dev/reference/rules/rules-of-hooks
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 调用 useContext 的自定义 Hook 必须在组件或自定义 Hook 顶层调用
  - title: State Is Isolated and Private
    url: https://react.dev/learn/state-a-components-memory#state-is-isolated-and-private
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 同一组件的不同实例拥有隔离 State
  - title: Preserving and Resetting State
    url: https://react.dev/learn/preserving-and-resetting-state
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 组件在树中保持同一位置时保留 State，移除后再次出现会得到新的 State
  - title: TypeScript Narrowing
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
    sourceType: official-reference
    appliesTo: TypeScript
    claims:
      - 判别联合和 null 检查可以通过控制流收窄 Action 与 Context 读取结果
---

# Reducer 与 Context 组合

## 一、学习目标

- 能说清 `useReducer`、State Context、dispatch Context 和 Provider 的职责。
- 能创建两条 Context 通道，并由同一个 Provider 组件提供。
- 能让深层展示组件只读取 State，让深层操作组件只取得 dispatch。
- 能按“事件 → Action → reducer → 下一份 State → Context 读取方”追踪更新。
- 能识别这套组合适用的组件树边界，以及它不负责的持久化和远程数据问题。

## 二、为什么需要

reducer 把分散的 State 更新集中到一个纯函数，Context 让信息跨过
中间组件到达深层子树。真实页面可能同时遇到这两个问题：任务 State 由页面上层统一管理，但深层列表要
读取任务，编辑器要添加任务，行项目又要切换完成状态。

若只使用 reducer，上层仍要把 `tasks` 和多个事件回调逐层传递；若只使用 Context，更新规则仍可能散落在
不同事件处理器中。组合后，拥有 State 的组件调用一次 `useReducer`，再通过两条 Context 通道把当前
State 和 `dispatch` 提供给需要它们的后代。

组合并没有创建新的状态容器。State 仍属于调用 `useReducer` 的组件，Context 只是让它的读取入口和更新
入口能跨越中间层。

## 三、核心概念

### 1. 六个职责保持分离

```text
Provider 组件调用 useReducer
        │
        ├── 当前 State ──> State Context ──> 深层读取组件
        │
        └── dispatch ─────> dispatch Context ─> 深层事件组件
                                                   │
                                                   └── Action ──> reducer
```

- **Provider 组件**：拥有 reducer State，并决定共享子树的边界。
- **State Context**：提供当前事实，供展示和判断逻辑读取。
- **dispatch Context**：提供稳定的命令入口，供事件处理器派发 Action。
- **reducer**：根据当前 State 和 Action 纯计算下一份 State。
- **`useReducer`**：在 Provider 组件实例中保存 State，并返回 State 与 dispatch。
- **`children`**：表示获得这组 State 与 dispatch 能力的实际子树。

### 2. 创建两条 Context 通道

```tsx
import { createContext, type Dispatch } from 'react'

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
```

两个 Context 表达两类依赖：只展示任务的组件不需要取得 dispatch，只负责按钮的组件也不需要读取整个
任务 State。同时读取列表和派发 Action 的组件可以同时取得两条通道。官方组合示例同样把 State 与 dispatch
分开提供。

这里用 `null` 表示“上方没有功能 Provider”。若任务能力是必需的，伪造空数组或 no-op dispatch 会让
Provider 缺失静默通过，反而更难定位错误。

### 3. Provider 组件拥有 reducer State

```tsx
import { useReducer, type ReactNode } from 'react'

/** 为任务子树拥有 State，并提供读取与更新通道。 */
function TasksProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  return (
    <TaskStateContext value={state}>
      <TaskDispatchContext value={dispatch}>{children}</TaskDispatchContext>
    </TaskStateContext>
  )
}
```

`TasksProvider` 在组件树中的位置决定 State 生命周期和共享范围。两个 Provider 包住同一 `children` 子树，
但它们提供的是不同 Context。React 19 可以直接写 `<TaskStateContext value={state}>`；旧版本使用
`<TaskStateContext.Provider>`。`ReactNode` 能覆盖元素、Fragment、文本和条件结果等合法 children。

### 4. 深层组件按职责读取

```tsx
/** 显示任务总数，只依赖 State Context。 */
function TaskSummary() {
  const state = useContext(TaskStateContext)
  if (state === null) throw new Error('TaskSummary 必须位于 TasksProvider 内')
  return <p>{state.tasks.length} 个任务</p>
}

/** 添加任务，只依赖 dispatch Context。 */
function AddTaskButton() {
  const dispatch = useContext(TaskDispatchContext)
  if (dispatch === null) throw new Error('AddTaskButton 必须位于 TasksProvider 内')

  return (
    <button
      type="button"
      onClick={() =>
        dispatch({ type: 'task/added', title: '检查 Context 边界' })
      }
    >
      添加任务
    </button>
  )
}
```

中间布局组件不需要接收 `state`、`dispatch` 或 `onAddTask`。只要实际读取组件仍位于 Provider 的
`children` 子树，Context 就能穿过这些中间层。

## 四、用法与示例

### 1. 一次更新如何穿过两条通道

深层按钮调用 `dispatch({ type: 'task/toggled', id })` 后，数据流如下：

1. 事件处理器创建描述“发生了什么”的 Action。
2. React 用当前 State 和 Action 调用 Provider 中登记的 reducer。
3. reducer 纯计算并返回不可变的下一份 State。
4. 下一次 render 中，State Context 的 `value` 变成新 State。
5. 读取 State Context 的后代得到最新任务；dispatch Context 仍提供同一个稳定 dispatch。

dispatch 不会改写正在运行的事件处理器所捕获的 State。若在 `dispatch` 后立即读取旧变量，看到的仍是
当前 render 的快照；新值会在后续 render 出现。

### 2. 用薄读取入口暴露 Provider 缺失

当多个文件都要读取同一组 Context 时，可以用最薄的命名入口集中 `null` 检查：

```tsx
/** 读取最近任务 Provider 的当前 State。 */
function useTaskState(): TaskState {
  const state = useContext(TaskStateContext)
  if (state === null) throw new Error('useTaskState 必须在 TasksProvider 内使用')
  return state
}

/** 读取最近任务 Provider 的 dispatch。 */
function useTaskDispatch(): Dispatch<TaskAction> {
  const dispatch = useContext(TaskDispatchContext)
  if (dispatch === null) throw new Error('useTaskDispatch 必须在 TasksProvider 内使用')
  return dispatch
}
```

`useContext(TaskStateContext)` 的类型先是 `TaskState | null`。`state === null` 分支抛出错误后，
TypeScript 的控制流收窄保证返回值是 `TaskState`。dispatch Hook 同理返回
`Dispatch<TaskAction>`，调用方不能派发联合类型之外的 Action。Hook 名称以 `use` 开头，调用位置必须保持
在组件或其他自定义 Hook 的顶层，不能放在事件处理器、条件或循环中。

这两个函数是稳定的读取入口：只负责读取 Context、检查缺失 Provider 并返回收窄后的值，不增加业务转换。

### 3. 类型合同

`State` 与 `Action` 的类型应描述 reducer 的完整输入和输出，而不是把一份任意对象塞进 Context：

```tsx
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
```

判别联合的 `type` 是 Action 的判别字段。`switch (action.type)` 进入某个分支后，TypeScript 会收窄到
对应成员，因此 `task/toggled` 可以读取 `id`，`workspace/reset` 不需要虚构 `payload`。Context 默认值
显式包含 `null`，运行时才能区分“没有 Provider”和“真实的空 State”。类型断言不能创建 Provider，也不
应把 `null` 强行转换成业务对象。

### 4. 为什么不默认合成一个对象 Context

下面的写法可以运行，但把两种依赖合并成一个对象：

```tsx
<TasksContext value={{ tasks, dispatch }}>{children}</TasksContext>
```

State 变化时对象 `value` 会变化，只需要 dispatch 的读取方也订阅了同一个 Context。拆成两条 Context
后，读取方能直接声明自己依赖当前 State、dispatch，或两者都依赖。`dispatch` 身份稳定，但这不承诺
组件永远不会因父组件、自身 State 或其他 Context render；它只是让依赖边界更准确。

单对象 Context 不是错误，也不是必须重构的代码。选择双 Context 的直接理由是让只读、只写和同时读写
三类组件的依赖在类型和源码中都可见；是否真的减少 render 需要结合组件树和测量结果判断，不能由拆分本身
推断性能收益。

### 5. Provider 的作用域与 State 生命周期

Provider 是普通函数组件，`useReducer` 的 State 属于它的组件实例：

- Provider 位于树中的位置决定哪些后代可以读取两条 Context。
- 同一 Provider 实例在同一位置持续存在时，React 保留它的 State。
- Provider 被移除，或该位置被其他组件身份替换时，原 State 被丢弃；重新建立实例会从初始 State 开始。
- Provider 外的组件不能读取它提供的值；Context 不会跨越未连接的 React 树自动同步。

Provider 的职责到调用 `useReducer`、提供两个 Context、渲染 `children` 为止。持久化、请求、远程缓存、
跨 root 同步和外部 Store 都不由这组 Context 自动提供。

### 6. 嵌套同类型 Provider

同一个 Context 可以在树中出现多次，读取方总是命中最近的祖先 Provider：

```tsx
<TaskProvider>
  <OuterSummary />
  <TaskProvider>
    <InnerWorkspace />
  </TaskProvider>
  <OuterActions />
</TaskProvider>
```

`OuterSummary` 和 `OuterActions` 连接外层实例，`InnerWorkspace` 同时连接内层 State 与 dispatch。内层
dispatch 只更新内层 State，外层 dispatch 只更新外层 State；两份 State 不会因为 Context 类型相同而合并。
如果内层 Provider 被移除，它的 State 随实例一起丢弃。

### 7. Context 对象身份与 value 比较

提供方和读取方必须引用同一个 `createContext` 返回对象。变量名、泛型、默认值都不能替代对象身份：

```tsx
// contexts.ts：只创建一次
export const TaskStateContext = createContext<TaskState | null>(null)

// provider.ts 与 hooks.ts：都从同一模块导入
import { TaskStateContext } from './contexts'
```

Provider 前后 `value` 按 `Object.is` 语义比较。State Context 的不可变更新通常产生新 State，读取方随后
取得新值；dispatch Context 的 dispatch 身份保持稳定。Provider 没有 `value`，或明确传入 `undefined`，
读取结果就是 `undefined`，不会回退到 `createContext` 的默认值。

## 五、Demo

任务工作区展示两条 Context 的完整数据流。统计区只读取 State，添加表单与重置按钮只取得 dispatch，
任务列表同时读取 State 并派发切换、删除 Action。外层与内层 Provider 使用相同组件但拥有隔离 State，
中间 shell 不接收业务 State 或更新回调。

::::demo{id="react.core.learn.intermediate.reducer-context-composition.task-context-demo"}
::::

## 六、易错使用提示

:::pitfalls
### 错误：把双 Context 当成唯一要求

**触发条件：** 看到官方示例使用两个 Context，就断言单对象 Context 不符合 React。

**原因：** 官方教程采用双 Context，但 `createContext` 允许任意类型的 `value`。

**后果：** 把教程模式误写成 API 限制，无法根据实际依赖选择清晰的 Context 结构。

**错误示例：**

```tsx
<AppContext value={{ state, dispatch }}>{children}</AppContext>
```

**正确写法：**

```tsx
<StateContext value={state}>
  <DispatchContext value={dispatch}>{children}</DispatchContext>
</StateContext>
```

**验证方式：** 单对象 Context 也能运行；双 Context 的直接价值是让只读、只写和同时读写三类依赖更清楚。

### 错误：用伪造默认值隐藏 Provider 缺失

**触发条件：** 必需的 Context 使用空对象、空数组或 no-op dispatch 作为默认值。

**原因：** 把“没有 Provider”伪装成正常业务状态。

**后果：** 操作静默失效或显示假数据，错误远离缺失 Provider 的真正位置。

**错误示例：**

```tsx
const DispatchContext = createContext<Dispatch<Action>>(() => {})
```

**正确写法：**

```tsx
const DispatchContext = createContext<Dispatch<Action> | null>(null)
// 读取入口遇到 null 时抛出明确错误。
```

**验证方式：** 临时把读取组件移出 Provider，确认错误直接指出缺少哪一个 Provider。

### 错误：Provider 没有位于读取组件上方

**触发条件：** 组件先调用 `useContext`，再在自己的返回值中渲染对应 Provider。

**原因：** `useContext` 只向当前组件的父树查找，不会读取同一组件刚刚返回的 Provider。

**后果：** 组件得到静态默认值或 `null`，误以为 Provider 的动态值没有更新。

**错误示例：**

```tsx
function Tasks() {
  const state = useContext(StateContext)
  return <StateContext value={initialState}>{state?.tasks.length}</StateContext>
}
```

**正确写法：**

```tsx
<TasksProvider>
  <Tasks />
</TasksProvider>
```

**验证方式：** 画出最终 render tree，确认 Provider 是读取组件的祖先而不是它自己的返回节点。

### 错误：提供方和读取方使用不同 Context 对象

**触发条件：** 在不同文件重复调用 `createContext`，或从错误模块导入同名 Context。

**原因：** Context 通过对象身份匹配，不通过变量名、类型或默认值匹配。

**后果：** 读取方找不到预期 Provider，只得到自己的默认值。

**错误示例：**

```tsx
// provider.ts 和 reader.ts 各自执行一次：
const TasksContext = createContext<TaskState | null>(null)
```

**正确写法：**

```tsx
// 只创建一次，并由 Provider 与读取方导入同一个对象。
export const TasksContext = createContext<TaskState | null>(null)
```

**验证方式：** 检查提供方和读取方的导入来源，确认引用的是同一模块导出的 Context。

### 错误：只提供半套 Context

**触发条件：** 只渲染 State Provider，或只渲染 dispatch Provider，却让后代同时调用两个 Hook。

**原因：** State 与 dispatch 是一个功能边界的两条通道，缺一条就无法满足对应依赖。

**后果：** 只读组件可能正常显示，但只写或同时读写组件在缺失入口处抛出明确错误。

**错误示例：**

```tsx
<TaskStateContext value={state}>{children}</TaskStateContext>
```

**正确写法：**

```tsx
<TaskStateContext value={state}>
  <TaskDispatchContext value={dispatch}>{children}</TaskDispatchContext>
</TaskStateContext>
```

**验证方式：** 两条 Context 必须覆盖同一 `children` 子树，不能只为某一类组件提供半套能力。

### 错误：在事件处理器、条件或循环中调用读取 Hook

**触发条件：** 在点击函数里调用 `useTaskDispatch()`，或只在某个条件分支中调用 `useTaskState()`。

**原因：** Hook 调用顺序必须在每次 render 中保持稳定。

**后果：** 违反 Hooks 规则，组件的 Hook 状态与 Context 读取关系不再可靠。

**错误示例：**

```tsx
function handleClick() {
  const dispatch = useTaskDispatch()
  dispatch({ type: 'workspace/reset' })
}
```

**正确写法：**

```tsx
const dispatch = useTaskDispatch()

function handleClick() {
  dispatch({ type: 'workspace/reset' })
}
```

**验证方式：** Hook 在组件顶层读取一次，事件处理器只使用已经取得的 dispatch。

### 错误：把嵌套 Provider 当成同一份 State

**触发条件：** 在外层 Provider 中再渲染同类型 Provider，并认为内层 dispatch 会修改外层任务。

**原因：** 每个 Provider 组件实例各自调用 `useReducer`，读取方命中最近祖先 Provider。

**后果：** 用错实例的统计、重置或更新入口，误判 State 是否发生变化。

**错误示例：**

```tsx
<TaskProvider>
  <TaskProvider>
    <OuterSummary />
  </TaskProvider>
</TaskProvider>
```

**正确写法：**

```tsx
<TaskProvider>
  <OuterSummary />
  <TaskProvider>
    <InnerWorkspace />
  </TaskProvider>
</TaskProvider>
```

**验证方式：** 内层 Action 只改变内层统计，外层 Action 只改变外层统计；Demo 中两份 `lastAction` 独立变化。

### 错误：在 render 期间调用 dispatch

**触发条件：** 把事件处理器写成 `onClick={handleAdd()}`，或按当前 State 无条件 dispatch。

**原因：** render 立即调用 dispatch，下一次 render 又重复执行同一更新。

**后果：** React 报告渲染次数过多，组件无法稳定显示。

**错误示例：**

```tsx
<button onClick={handleAdd()}>添加</button>
```

**正确写法：**

```tsx
<button onClick={handleAdd}>添加</button>
```

**验证方式：** 初次渲染不产生 Action；只有点击按钮时 reducer 才收到一次 Action。

### 错误：修改旧 State 并原样返回

**触发条件：** reducer 对 Context 提供的数组或对象直接执行 `push`、赋值或删除。

**原因：** reducer 失去纯度，且返回值与当前 State 仍是同一个对象。

**后果：** React 可能按 `Object.is` 跳过更新，旧快照也被污染。

**错误示例：**

```tsx
state.tasks.push(action.task)
return state
```

**正确写法：**

```tsx
return { ...state, tasks: [...state.tasks, action.task] }
```

**验证方式：** 保存更新前的 State 引用，dispatch 后确认旧数组未变化且新 State 使用新引用。

### 错误：dispatch 后立即读取新 State

**触发条件：** 在同一事件处理器中 dispatch 后，马上用当前 Context State 做保存或分支判断。

**原因：** State 是当前 render 的快照，dispatch 只安排后续更新。

**后果：** 保存、日志或下一步判断仍使用旧数据。

**错误示例：**

```tsx
dispatch({ type: 'task/added', task })
save(state.tasks)
```

**正确写法：**

```tsx
dispatch({ type: 'task/added', task })
// 在下一次 render 读取更新后的 Context State。
```

**验证方式：** 同时记录事件处理器内的旧值和下一次 render 的显示值，确认更新发生在后续 render。
:::

## 七、源码推导与适用场景

React 对 `useReducer`、`createContext` 和 `useContext` 的公开合同共同确定了下面的职责边界：

1. `useReducer` 仍负责拥有 State、接收 Action 并计算下一份 State；Context 只负责让值和 dispatch
   到达 Provider 子树。
2. State Context 表达当前事实，dispatch Context 表达发出命令的入口；两者都不直接执行请求、保存或缓存。
3. `dispatch` 身份稳定，State Context 的 value 会随不可变 State 更新；这能表达依赖差异，但不是所有
   render 行为的优化保证。
4. Context 只覆盖 Provider 的后代。Provider 位置、组件身份和嵌套层级共同决定可见范围与 State 生命周期。
5. Context API 不提供持久化、远程缓存、跨 React root 同步或外部 Store 合同；需要这些能力时必须由其他
   明确的模块负责。

### 1. 读写职责的判断

- 只显示任务数量、过滤结果或最近 Action 的组件只需要 State Context。
- 只响应点击、提交或重置的组件只需要 dispatch Context。
- 既要根据任务列表生成 UI，又要对某个任务派发 Action 的组件需要两条 Context。
- 只负责布局的组件可以只接收 `children`，不接收业务 State、dispatch 或逐层转交的事件回调。

这种职责划分帮助阅读源码和检查类型，不要求所有页面都机械拆成两个 Context。

## 八、练习

:::exercise
### 1. 组合一个购物清单 Provider

**要求：** 创建 `ItemsStateContext` 与 `ItemsDispatchContext`。让 `ItemsProvider` 调用一次 `useReducer`；
`ItemCount` 只读取 State，`AddItem` 只取得 dispatch，`ItemRow` 读取当前项目并派发切换 Action。中间布局
组件不得接收 `items` 或 `onToggle` Props。

**完成标准：** 添加、切换、删除和重置各只 dispatch 一个 Action；reducer 使用不可变更新；Provider 外读取
时得到明确错误；嵌套 Provider 的 State 互不影响；不把网络请求、Effect 或外部 Store 塞进 Provider。
:::

## 九、本节小结

- reducer 负责“State 如何变化”，Context 负责“State 与 dispatch 能到达哪些后代”。
- 用独立的 State Context 与 dispatch Context 表达读取和更新两种依赖。
- Provider 组件调用一次 `useReducer`，并用两个 Provider 包住同一功能子树。
- 深层组件只读取自己需要的通道；dispatch 后的新 State 在后续 render 通过 State Context 可见。
- 这是一种有明确组件树边界的组合模式，不是无边界全局 Store。

## 十、参考资料

- [React Versions](https://react.dev/versions) - React 19.2 官方文档版本口径。
- [Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context) - 双 Context 与 Provider 组合模式。
- [`useReducer`](https://react.dev/reference/react/useReducer) - State、dispatch、更新快照和 reducer 纯度合同。
- [`useContext`](https://react.dev/reference/react/useContext) - 最近 Provider、更新传播与 Context 对象身份。
- [`createContext`](https://react.dev/reference/react/createContext) - 静态默认值和 React 19 Provider 语法。
- [Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer) - Action 与纯 reducer 的职责。
