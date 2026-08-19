---
id: react.core.learn.intermediate.use-reducer
type: lesson
title: useReducer 与 Action
summary: 用 Action 描述交互，用纯 reducer 集中计算关联 State 的下一份值。
domain: frontend
technology: react
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 90
prerequisites:
  - react.core.learn.intermediate.state-preservation-and-reset
related:
  - react.core.learn.basics.render-commit-and-state-snapshot
  - react.core.learn.basics.immutable-state-updates
  - react.core.learn.intermediate.state-structure
tags:
  - React
  - useReducer
  - Action
  - reducer
  - dispatch
  - 判别联合
appliesTo: React 19.2 官方文档与 React 19
verifiedAt: 2026-08-16
objectives:
  - 能解释 State、Action、reducer 与 dispatch 在一次状态更新中的职责。
  - 能使用 TypeScript 判别联合定义事件式 Action 及其最小载荷。
  - 能写出不修改旧 State、不读取隐藏输入且返回完整下一份 State 的纯 reducer。
  - 能使用 useReducer 的初始化函数从原始参数建立初始 State。
  - 能解释 dispatch 后当前事件仍读取旧 render 快照的原因。
  - 能根据更新逻辑的关联程度选择 useState 或 useReducer。
recap:
  - useReducer 返回当前 State 和 dispatch，dispatch 提交 Action 而不是下一份 State。
  - Action 描述发生了什么，reducer 决定 State 如何转换。
  - 判别联合把每个 type 与专属载荷绑定，减少无效 Action 组合。
  - 纯 reducer 只读取 State 与 Action，不修改旧快照，也不执行外部副作用。
  - 对象 State 的每个分支都要返回完整结构，不会自动合并部分字段。
  - init 接收 initialArg 并建立初始 State；它不是同步参数变化的机制。
  - dispatch 只请求后续 render，当前事件中的 State 变量仍是旧快照。
  - 更新入口少且规则独立时使用 useState，关联转换集中且复杂时使用 useReducer。
sources:
  - title: useReducer
    url: https://react.dev/reference/react/useReducer
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - useReducer 签名、初始化函数、dispatch、快照、纯度和常见错误
      - State 与前一值 Object.is 相同时 React 可以跳过重新渲染
  - title: Extracting State Logic into a Reducer
    url: https://react.dev/learn/extracting-state-logic-into-a-reducer
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 从事件处理器集中提取 State 更新逻辑
      - Action 描述交互，reducer 返回下一份 State
      - reducer 必须纯净且使用不可变更新
  - title: Components and Hooks must be pure
    url: https://react.dev/reference/rules/components-and-hooks-must-be-pure
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 渲染计算应保持幂等，State 是不可变快照
      - 副作用应在渲染计算之外执行
  - title: StrictMode
    url: https://react.dev/reference/react/StrictMode
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 开发环境额外调用纯函数以发现不纯逻辑
  - title: TypeScript Narrowing
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
    sourceType: official-reference
    appliesTo: TypeScript 6.0
    claims:
      - 共同字面量字段可形成判别联合并收窄分支专属字段
      - never 可用于穷尽性检查
  - title: React 19.2.8 ReactFiberHooks Source
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 固定版本初始化 Hook 状态、绑定 dispatch 和处理 reducer 更新的内部证据
      - 固定版本开发模式额外调用 reducer 和初始化函数的内部证据
---

# useReducer 与 Action

## 一、学习目标

- 说清 State、Action、reducer 与 dispatch 在一次更新中的职责。
- 用判别联合定义清晰、有效且字段最少的 Action。
- 写出返回完整下一份 State 的纯 reducer。
- 使用对象和数组的不可变更新保留旧 State 快照。
- 使用初始化函数把原始参数转换为初始 State。
- 根据更新规则的复杂度选择 `useState` 或 `useReducer`。

## 二、为什么需要 reducer

### 1. 更新逻辑会在事件处理器之间分散

一个计数器只有一个数字和一个加一按钮，`useState` 已经足够直接。任务看板却可能同时支持添加、完成、
删除、清空、筛选和重置。若每个事件处理器都自行复制对象、查找任务和维护编号，决定“下一份 State
应该是什么”的规则就分散在多个位置。

```tsx
function handleToggle(id: number) {
  setTasks((tasks) =>
    tasks.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task,
    ),
  )
}

function handleDelete(id: number) {
  setTasks((tasks) => tasks.filter((task) => task.id !== id))
}
```

这些处理器本身没有错误。问题出现在更新入口持续增加、多个字段必须共同变化、同一条规则被重复实现时。
此时可以把状态转换集中到 reducer，让事件处理器只报告发生了什么。

### 2. reducer 分开“发生了什么”和“如何更新”

```text
事件处理器 --dispatch(Action)--> reducer(当前 State, Action) --> 下一份 State
```

- 事件处理器知道用户完成了哪次交互。
- Action 用普通值描述这次交互。
- reducer 知道每种 Action 如何产生下一份 State。
- React 保存 reducer 的返回值，并用它执行后续 render。

分离以后，按钮不再负责复制任务数组；reducer 也不需要知道 Action 来自按钮、键盘还是其他交互入口。

## 三、useReducer 的核心合同

### 1. 四个角色

| 角色 | 保存或接收的内容 | 职责 |
| --- | --- | --- |
| State | 当前 render 使用的数据快照 | 表达组件当前需要记住的事实 |
| Action | `type` 和必要载荷 | 描述一次已经发生的交互 |
| reducer | `(state, action) => nextState` | 纯计算完整的下一份 State |
| dispatch | 一个 Action | 请求 React 按 reducer 规则更新 |

Action 不是下一份 State，dispatch 也不是对象合并器。更新结果只能由 reducer 的返回值决定。

### 2. 基础签名

```tsx
import { useReducer } from 'react'

interface CounterState {
  count: number
}

type CounterAction =
  | { type: 'incremented' }
  | { type: 'amount_added'; amount: number }
  | { type: 'reset' }

/** 根据计数交互返回完整的下一份 State。 */
function counterReducer(
  state: CounterState,
  action: CounterAction,
): CounterState {
  switch (action.type) {
    case 'incremented':
      return { count: state.count + 1 }
    case 'amount_added':
      return { count: state.count + action.amount }
    case 'reset':
      return { count: 0 }
  }
}

/** 用 reducer 管理具有多种更新意图的计数。 */
function Counter() {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 })

  return (
    <button type="button" onClick={() => dispatch({ type: 'incremented' })}>
      {state.count}
    </button>
  )
}
```

`useReducer` 的第一个参数是 reducer，第二个参数是初始 State。返回数组中的 `state` 属于当前 render，
`dispatch` 用来提交符合 `CounterAction` 合同的值。

`dispatch(action)` 没有返回值，它的函数身份在 render 之间保持稳定。稳定身份意味着可以把同一个 dispatch
传给事件入口，而不必为每次 render 重新包装更新能力；它并不意味着 State 会同步改变，更新结果仍然只在
后续 render 中可见。

### 3. reducer 返回完整下一份 State

假设 State 同时保存任务和下一个编号：

```tsx
interface TaskState {
  tasks: Task[]
  nextId: number
}
```

清空任务时只返回 `{ tasks: [] }` 不会保留 `nextId`。Reducer 的对象返回值不会与旧对象自动合并：

```tsx
// 错误：丢失 nextId。
return { tasks: [] }

// 正确：返回完整 State，并只替换 tasks。
return { ...state, tasks: [] }
```

返回完整 State 不等于每个分支都要重建所有嵌套值。没有变化的字段可以复用；发生变化的路径必须创建
新对象或新数组。

### 4. dispatch 只影响后续 render

```tsx
function handleClear() {
  dispatch({ type: 'tasks_cleared' })
  console.log(state.tasks.length)
}
```

日志仍读取当前 render 捕获的 `state`。dispatch 请求一次更新，但不会改写正在执行的局部变量。Reducer
计算出的 State 会在后续 render 中成为新的 `state`。这与使用 state setter 时的快照规则一致。

需要预先推导某个结果时，可以直接调用纯 reducer 计算：

```tsx
const action: TaskAction = { type: 'tasks_cleared' }
const nextState = taskReducer(state, action)

dispatch(action)
console.log(nextState.tasks.length)
```

这里的手动调用只做计算；真正请求 React 更新的仍是 dispatch。

## 四、设计 Action

### 1. type 描述发生了什么

Action 是普通对象，React 不规定全局名称表，也不要求固定的 `payload` 属性。清晰的 `type` 让阅读者
不查看 reducer 也能理解交互：

| 交互 | 清晰 Action | 含混 Action |
| --- | --- | --- |
| 添加任务 | `task_added` | `set_tasks` |
| 切换完成状态 | `task_toggled` | `patch_item` |
| 选择筛选条件 | `filter_selected` | `update_state` |
| 重置看板 | `board_reset` | `set_defaults` |

过去式和下划线只是项目内可以采用的一致命名方式，不是 React 语法。关键是名称表达事件，而不是泄漏
reducer 内部执行了哪些赋值步骤。

### 2. 载荷只放 reducer 必需的新事实

设计载荷时依次检查：

1. 当前 State 已经保存了什么？
2. 本次交互新增了哪个事实？
3. 哪些值可以由当前 State 与新事实计算？
4. reducer 实际会读取哪些字段？

切换任务时，State 已经保存标题和完成状态，Action 只需说明目标 ID：

```tsx
dispatch({ type: 'task_toggled', id })
```

不需要传完整任务、整个任务数组或预先计算好的下一份 State：

```tsx
// 载荷重复了 State，也把 reducer 的计算搬回事件处理器。
dispatch({
  type: 'tasks_replaced',
  tasks: state.tasks.map((task) =>
    task.id === id ? { ...task, done: !task.done } : task,
  ),
})
```

### 3. 在交互边界提取领域值

Reducer 需要任务标题字符串，不需要浏览器事件对象：

```tsx
<input
  value={title}
  onChange={(event) => setTitle(event.currentTarget.value)}
/>

<button
  type="button"
  onClick={() => dispatch({ type: 'task_added', title: title.trim() })}
>
  添加
</button>
```

事件处理器先从 UI 中得到领域值，再构造 Action。这样 reducer 不依赖 DOM 事件结构，纯函数也能直接
接收固定输入。

### 4. 一次有意义的交互对应一个 Action

一次“重置看板”可能同时恢复任务、编号和筛选条件，但它仍是一项交互：

```tsx
dispatch({ type: 'board_reset' })
```

Reducer 可以在一个分支中共同恢复多个字段。按字段连续 dispatch `tasks_replaced`、`next_id_changed`、
`filter_selected` 会把一个意图拆成实现步骤，还会让中间状态进入更新队列。

反过来，添加任务和切换筛选是两项独立交互，应使用两个 Action。粒度判断依据是可命名的交互，不是
Action 越少越好。

### 5. 判别联合绑定 type 与专属字段

```tsx
type TaskFilter = 'all' | 'open' | 'done'

type TaskAction =
  | { type: 'task_added'; title: string }
  | { type: 'task_toggled'; id: number }
  | { type: 'task_deleted'; id: number }
  | { type: 'filter_selected'; filter: TaskFilter }
  | { type: 'tasks_cleared' }
  | { type: 'board_reset' }
```

`type` 是所有成员共有的字面量判别字段。检查 `action.type === 'task_added'` 后，TypeScript 会把
`action` 收窄到含 `title` 的成员；漏传标题、把 `filter` 放在错误分支或拼错 `type` 都会在静态检查
中暴露。

不要把 Action 退化成可选字段袋：

```tsx
type LooseAction = {
  type: string
  title?: string
  id?: number
  filter?: TaskFilter
}
```

这个类型允许 `{ type: 'task_added' }`，也允许给 `tasks_cleared` 附加无意义的 `id`。Reducer 只能再次
猜测字段是否存在。

### 6. 用 never 检查所有分支

```tsx
/** 把遗漏的 Action 分支变成明确错误。 */
function assertNever(action: never): never {
  throw new Error(`未知 Action：${JSON.stringify(action)}`)
}

/** 根据 Action 返回完整的下一份任务 State。 */
function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'task_added':
      return addTask(state, action.title)
    case 'task_toggled':
      return toggleTask(state, action.id)
    case 'task_deleted':
      return deleteTask(state, action.id)
    case 'filter_selected':
      return { ...state, filter: action.filter }
    case 'tasks_cleared':
      return { ...state, tasks: [] }
    case 'board_reset':
      return createInitialState(state.owner)
    default:
      return assertNever(action)
  }
}
```

新增联合成员却遗漏 `switch` 分支时，`action` 在 `default` 中不再是 `never`，TypeScript 会提示错误。
如果类型系统外的 JavaScript 或错误断言传入未知值，运行时也会得到明确异常，而不是把协议错误伪装成
“界面没反应”。

## 五、编写纯 reducer

### 1. 相同输入产生等价结果

Reducer 的输入只有当前 State 和 Action，输出只有下一份 State：

```text
(State, Action) -> NextState
```

给定内容相同的 State 与 Action，多次调用应产生内容等价的结果。下面这些值会成为没有进入参数的隐藏
输入，因此不能在 reducer 中读取：

- `Date.now()` 或当前时区时间。
- `Math.random()`。
- 会自增的模块级变量。
- DOM 当前内容。
- 随时可能变化的外部缓存。

需要时间、随机 ID 或其他外部事实时，先在事件边界取得，再作为 Action 载荷传入。Reducer 只使用显式
输入完成转换。

### 2. 不修改旧 State

State 是当前 render 的快照。直接修改旧对象会污染已存在的快照，也可能让 React 看到同一个引用：

```tsx
// 错误：修改旧数组并返回同一个 State。
state.tasks.push(action.task)
return state

// 正确：创建新数组并返回新 State。
return { ...state, tasks: [...state.tasks, action.task] }
```

常见数组操作可以按意图选择：

| 意图 | 不可变写法 | 避免的原地操作 |
| --- | --- | --- |
| 添加 | `[...tasks, nextTask]` | `push` |
| 删除 | `tasks.filter(...)` | `splice` |
| 替换一项 | `tasks.map(...)` | `tasks[index] = ...` |
| 排序 | `[...tasks].sort(...)` | 直接 `tasks.sort(...)` |

### 3. 只复制发生变化的路径

```tsx
interface EditorState {
  form: {
    title: string
    detail: string
  }
  selectedId: number | null
}

/** 只替换从根 State 到标题字段的对象路径。 */
function changeTitle(state: EditorState, title: string): EditorState {
  return {
    ...state,
    form: {
      ...state.form,
      title,
    },
  }
}
```

只复制顶层后再修改 `next.form.title` 仍会污染共享的 `form` 对象。正确做法是复制从根到被修改字段的
整条路径。没有变化的 `selectedId` 可以复用，不需要无条件深拷贝整个 State。

### 4. 副作用不属于状态计算

Reducer 不应发送请求、写日志、安排计时器、操作 DOM 或调用其他 React 状态更新函数。这些操作会在
返回值之外产生可观察变化；React 的开发检查或重新计算可能让它们重复执行。

```tsx
// 错误：状态计算同时修改外部系统。
function reducer(state: State, action: Action): State {
  console.log(action)
  localStorage.setItem('state', JSON.stringify(state))
  return nextState
}
```

事件处理器可以响应一次用户操作，再 dispatch 已经准备好的 Action。Reducer 保持为独立计算函数，外部
交互也就不会因为状态计算次数而重复。

### 5. 合法无变化可以返回原 State

若 Action 已被识别，但当前 State 已满足目标条件，可以返回原对象。例如“删除不存在的 ID”可以被定义为
合法无变化。React 使用 `Object.is` 比较新旧 State；返回同一对象时可以跳过这次重新渲染。

```tsx
case 'task_deleted': {
  const tasks = state.tasks.filter((task) => task.id !== action.id)
  return tasks.length === state.tasks.length ? state : { ...state, tasks }
}
```

合法无变化与未知 Action 不同。前者是 reducer 明确定义的领域规则；后者说明 Action 协议没有被处理，
应通过穷尽检查或明确错误暴露。

## 六、完整任务看板

### 1. State 与 Action 合同

```tsx
interface Task {
  id: number
  title: string
  done: boolean
}

interface BoardState {
  owner: string
  tasks: Task[]
  nextId: number
  filter: 'all' | 'open' | 'done'
  actionLog: string[]
}

type BoardAction =
  | { type: 'task_added'; title: string }
  | { type: 'task_toggled'; id: number }
  | { type: 'task_deleted'; id: number }
  | { type: 'filter_selected'; filter: BoardState['filter'] }
  | { type: 'tasks_cleared' }
  | { type: 'board_reset' }
```

`nextId` 属于 State，因为每次添加都依赖它；标题属于 `task_added` 的载荷，因为它来自当前输入；切换和
删除只需要 ID；重置与清空不需要额外字段。

### 2. Reducer 分支

```tsx
/** 集中实现任务看板的全部状态转换。 */
function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'task_added':
      return {
        ...state,
        tasks: [
          ...state.tasks,
          { id: state.nextId, title: action.title, done: false },
        ],
        nextId: state.nextId + 1,
      }
    case 'task_toggled':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id
            ? { ...task, done: !task.done }
            : task,
        ),
      }
    case 'task_deleted':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.id),
      }
    case 'filter_selected':
      return { ...state, filter: action.filter }
    case 'tasks_cleared':
      return { ...state, tasks: [] }
    case 'board_reset':
      return createInitialState(state.owner)
    default:
      return assertNever(action)
  }
}
```

每个分支都保持 `BoardState` 的完整形状。添加分支同时更新任务和编号，因为这两个事实必须保持一致；
切换分支只为目标任务创建新对象；删除和清空不会重置 `nextId`，因此后续任务不会复用旧编号。

### 3. 可运行观察

::::demo{id="react.core.learn.intermediate.use-reducer.task-board-demo"}
::::

Demo 将强关联规则放进 reducer，将独立的新任务输入和观察报告保留为简单 `useState`。可依次观察：

| 操作 | Action | 观察点 |
| --- | --- | --- |
| 添加任务 | `task_added(title)` | 新数组、递增 ID、最小标题载荷 |
| 完成或恢复 | `task_toggled(id)` | 只替换目标任务对象 |
| 删除任务 | `task_deleted(id)` | `filter` 返回新数组 |
| 切换筛选 | `filter_selected(filter)` | 一个联合成员只携带自己的字段 |
| 清空任务 | `tasks_cleared` | 返回完整 State，编号仍保留 |
| 恢复看板 | `board_reset` | 一个交互共同恢复多项事实 |
| 运行纯度检查 | 不 dispatch | 相同输入结果一致，旧数组不变 |

Action 日志属于 Demo 的 State，因此日志内容也由 reducer 的返回值决定；Reducer 本身没有调用
`console.log` 或写入外部系统。

## 七、初始化函数与开发检查

### 1. initialArg 直接作为初始 State

最简单的形式把第二个参数直接作为初始 State：

```tsx
const [state, dispatch] = useReducer(boardReducer, {
  owner: 'React 学习组',
  tasks: [],
  nextId: 1,
  filter: 'all',
  actionLog: [],
})
```

适合已经拥有最终 State 形状、创建成本很低的情况。

### 2. init 把原始参数转换为 State

`useReducer(reducer, initialArg, init)` 会用 `init(initialArg)` 建立初始 State：

```tsx
/** 根据所有者生成确定的初始任务看板。 */
function createInitialState(owner: string): BoardState {
  return {
    owner,
    tasks: [{ id: 1, title: `${owner} 的第一项任务`, done: false }],
    nextId: 2,
    filter: 'all',
    actionLog: [],
  }
}

const [state, dispatch] = useReducer(
  boardReducer,
  'React 学习组',
  createInitialState,
)
```

第三个参数接收函数本身，不是提前执行后的结果。初始化函数适合完成确定的结构转换或避免每次 render
重复准备初始值。组件已经挂载后，`initialArg` 的表达式变化不会自动重置现有 State；重置行为应由明确
Action 或组件身份变化表达。

### 3. initializer 与 reducer 都必须纯净

Strict Mode 在开发环境可能额外调用 reducer 和 initializer，并忽略其中一次结果，用来发现原地修改和
隐藏副作用。纯函数的两次计算内容等价，因此页面结果不受影响。

不要依赖初始化函数或 reducer 的精确调用次数推进业务，也不要在其中递增模块变量、发送请求或记录只应
发生一次的外部日志。生产环境是否额外调用不是业务合同；纯度才是稳定合同。

## 八、选择 useState 或 useReducer

| 判断问题 | 倾向 `useState` | 倾向 `useReducer` |
| --- | --- | --- |
| State 规模 | 一个或少量独立值 | 一组有关联的对象、数组或流程状态 |
| 更新入口 | 少且规则短 | 多个事件共享转换规则 |
| 更新关系 | 字段彼此独立 | 一个交互必须共同维护多个字段 |
| 阅读重点 | 直接看到下一值 | 集中查看所有 Action 与状态转换 |
| 独立验证 | setter 逻辑很少 | 希望用固定 State 和 Action 验证转换 |

State 对象大不代表必须用 reducer，字段少也不代表不能用 reducer。真正的判断依据是更新逻辑：它是否
分散、重复、相互关联，是否已经难以从事件处理器中看清。

同一组件可以同时使用两者。任务看板的任务、编号和筛选由 reducer 集中管理；一个只控制输入框草稿的
独立字符串仍可使用 `useState`。选择 API 的目标是让数据所有权和更新规则更容易理解。

## 九、易错使用提示

::::pitfalls
### 错误：把 dispatch 当成 setter

**触发条件：** 直接把下一份 State 传给 dispatch，而 reducer 期待带 `type` 的 Action。

**原因：** 混淆了 Action 输入合同与 reducer 输出合同。

**后果：** 判别联合不匹配，reducer 也无法知道发生了哪种交互。

**错误示例：**

```tsx
dispatch({ tasks: nextTasks })
```

**正确写法：**

```tsx
dispatch({ type: 'tasks_replaced', tasks: nextTasks })
```

**验证方式：** 检查每个 dispatch 参数都匹配一个明确的 Action 联合成员。

### 错误：用 string 和可选字段袋定义 Action

**触发条件：** 所有载荷都写成可选字段，`type` 只写 `string`。

**原因：** `type` 不再是判别字段，事件名称与必要载荷失去绑定。

**后果：** 缺少标题、错误字段组合和拼写错误可能进入 reducer。

**错误示例：**

```tsx
type Action = { type: string; title?: string; id?: number }
```

**正确写法：**

```tsx
type Action =
  | { type: 'task_added'; title: string }
  | { type: 'task_toggled'; id: number }
```

**验证方式：** 尝试 dispatch `{ type: 'task_added' }`，确认 TypeScript 要求提供 `title`。

### 错误：把完整 State 或浏览器事件作为载荷

**触发条件：** 事件处理器先计算整份结果，或把 `event` 对象直接放入 Action。

**原因：** 没有在 UI 边界提取 reducer 真正需要的新事实。

**后果：** Action 与 State 或 DOM 结构耦合，reducer 失去集中转换职责。

**错误示例：**

```tsx
dispatch({ type: 'title_changed', event })
```

**正确写法：**

```tsx
dispatch({
  type: 'title_changed',
  title: event.currentTarget.value,
})
```

**验证方式：** 隐藏 UI 后直接阅读 Action，确认其中只包含 reducer 会读取的领域值。

### 错误：只返回对象的一部分

**触发条件：** State 还有 `nextId` 和 `filter`，某个分支只返回 `{ tasks: [] }`。

**原因：** 误以为 reducer 会自动合并对象字段。

**后果：** 未返回字段变成 `undefined`，后续 Action 破坏编号或筛选规则。

**错误示例：**

```tsx
return { tasks: [] }
```

**正确写法：**

```tsx
return { ...state, tasks: [] }
```

**验证方式：** 清空后继续添加任务并切换筛选，确认其他字段仍符合 State 类型。

### 错误：原地修改 State

**触发条件：** 对旧数组使用 `push`、`splice`、`sort`，或直接给旧对象字段赋值。

**原因：** 把 render 快照当成临时可变容器。

**后果：** 旧快照被污染，返回引用可能不变，开发期额外调用还会放大重复修改。

**错误示例：**

```tsx
state.tasks.push(action.task)
return state
```

**正确写法：**

```tsx
return { ...state, tasks: [...state.tasks, action.task] }
```

**验证方式：** 保存调用前的数组引用和值，调用 reducer 后确认旧数组不变且新数组引用不同。

### 错误：在 reducer 中读取隐藏输入或执行副作用

**触发条件：** 在 reducer 中读取时间、生成随机数、发送请求、写日志或操作 DOM。

**原因：** 状态结果不再只由 State 与 Action 决定，函数返回值之外也产生变化。

**后果：** 相同输入可能得到不同结果，重新计算会重复外部操作。

**错误示例：**

```tsx
return {
  ...state,
  id: Math.random(),
  updatedAt: Date.now(),
}
```

**正确写法：**

```tsx
dispatch({ type: 'task_added', id, createdAt, title })
```

**验证方式：** 用同一 State 和 Action 连续调用 reducer，确认结果内容一致且没有外部可观察变化。

### 错误：提前调用初始化函数

**触发条件：** 在组件函数中执行 `createInitialState(owner)`，再把结果传给第二个参数。

**原因：** 初始化计算已经在每次 render 时执行，没有把函数交给 `init` 参数。

**后果：** 昂贵转换重复发生，代码也无法准确表达初始化阶段。

**错误示例：**

```tsx
useReducer(reducer, createInitialState(owner))
```

**正确写法：**

```tsx
useReducer(reducer, owner, createInitialState)
```

**验证方式：** 触发与 reducer 无关的 render，确认初始化转换没有被组件代码主动重复调用。

### 错误：dispatch 后立即读取新 State

**触发条件：** 在同一个事件处理器中 dispatch 后，把局部 `state` 当作下一份 State。

**原因：** 当前函数闭包读取的是当前 render 快照。

**后果：** 日志和条件判断仍使用旧值，容易误判 reducer 没有执行。

**错误示例：**

```tsx
dispatch({ type: 'tasks_cleared' })
console.log(state.tasks.length)
```

**正确写法：**

```tsx
const action = { type: 'tasks_cleared' } as const
const nextState = reducer(state, action)
dispatch(action)
console.log(nextState.tasks.length)
```

**验证方式：** 区分当前事件的快照与页面后续 render 显示的新值。

### 错误：把所有 State 都换成 reducer

**触发条件：** 一个独立布尔值或输入字符串也被包装进大型 Action 协议，只因为组件已经使用 reducer。

**原因：** 把 `useReducer` 当成更高级的 State 容器，而不是更新逻辑组织工具。

**后果：** 简单更新需要额外类型、Action 和分支，阅读路径变长。

**错误示例：**

```tsx
dispatch({ type: 'dialog_open_changed', open: true })
```

**正确写法：**

```tsx
setDialogOpen(true)
```

**验证方式：** 检查该值是否与 reducer 中其他事实共同变化；没有共享规则时保留 `useState`。
::::

## 十、源码推导与适用场景

1. **公共合同：** React 19.2 文档定义 `useReducer(reducer, initialArg, init?)`，返回当前 State 与
   dispatch；dispatch 请求后续 render，reducer 必须纯净并返回下一份 State。
2. **固定实现证据：** React 19.2.8 的 `ReactFiberHooks.js` 在挂载阶段用 `init(initialArg)` 建立初始
   State 并保存绑定后的 dispatch；更新与重新 render 时复用该 dispatch，再把 Action 交给当前 reducer。
3. **实现边界：** 固定源码只用于解释公开行为，不构成应用可以依赖的内部 API。应用只依赖 State、
   Action、reducer、dispatch 和初始化合同。
4. **适用场景：** 多个事件处理器修改同一组关联 State；一次交互需要共同维护多个字段；状态转换需要
   集中阅读或用固定输入独立验证。
5. **不适用场景：** 只有一个更新规则清楚的独立值；主要问题是数据所有权位置而不是更新逻辑；状态结果
   依赖请求、DOM 或时间等外部系统且尚未提取为明确输入。
6. **选择原则：** 先设计最小、无矛盾的 State，再判断更新规则是否值得集中。Reducer 不能修复重复数据、
   错误所有权或不纯的数据模型。

## 十一、练习

::::exercise
### 练习目标：设计一个可重放的购物清单 reducer

**要求：** 建立 `ShoppingState` 与 `ShoppingAction`，支持添加商品、修改数量、删除商品、清空已购买
商品、切换“全部 / 待购买 / 已购买”筛选和恢复初始清单；使用判别联合绑定每个 `type` 与必要字段，
让 reducer 返回完整 State 且不修改旧对象或旧数组；总件数、总价和筛选结果在 render 中派生；时间、
随机 ID 和浏览器事件不进入 reducer；使用初始化函数从清单名称建立初始 State。

**验收：** 添加只携带规范化名称、单价和交互边界生成的 ID，修改与删除只携带商品 ID 及各自必要值，
清空已购买商品只 dispatch 一个 Action；同一 State 和 Action 调用 reducer 两次得到等价结果，旧 State
保持不变；只看 Action 序列可以复述交互，并能解释每个分支为何保持纯净。
::::

## 十二、本节小结

- `useReducer` 用 reducer 集中状态转换，用 dispatch 提交 Action。
- Action 描述发生了什么，只携带 reducer 必需的新事实。
- 判别联合让 `type` 与专属载荷形成编译期合同，`never` 可以检查分支是否完整。
- Reducer 只根据 State 与 Action 返回完整下一份 State，不修改旧快照，不执行副作用。
- 对象和数组只复制发生变化的路径；合法无变化可以返回原 State。
- `init(initialArg)` 建立初始 State，初始化函数与 reducer 都必须纯净。
- dispatch 不会改写当前事件中的 State 变量，新值在后续 render 中可见。
- `useState` 与 `useReducer` 的选择取决于更新逻辑是否分散和关联，不取决于字段数量。

## 十三、参考资料

- [useReducer](https://react.dev/reference/react/useReducer) - Hook 签名、dispatch、初始化、快照、纯度和故障排查。
- [Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer) - 从事件处理器提取 reducer、设计 Action 和不可变更新。
- [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) - 幂等计算、不可变快照与副作用边界。
- [StrictMode](https://react.dev/reference/react/StrictMode) - 开发环境额外调用纯函数的诊断目的。
- [TypeScript Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions) - 判别联合、控制流收窄与 `never` 穷尽检查。
- [React 19.2.8 ReactFiberHooks.js](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js) - 初始化、更新队列与 reducer 调用的固定版本实现证据。
