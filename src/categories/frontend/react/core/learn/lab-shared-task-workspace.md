---
id: react.core.learn.intermediate.lab-shared-task-workspace
type: lesson
title: 实战：共享任务工作区
summary: 用纯 reducer、双 Context 和模块化 Provider 完成任务汇总、筛选、列表、详情与局部草稿协作。
domain: frontend
technology: react
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 210
prerequisites:
  - react.core.learn.intermediate.use-reducer
  - react.core.learn.intermediate.context-providing-and-reading
  - react.core.learn.intermediate.reducer-context-composition
  - react.core.learn.intermediate.state-sharing-boundary
related:
  - react.core.learn.basics.immutable-state-updates
  - react.core.learn.basics.react-forms
  - react.core.learn.basics.list-rendering-and-key
tags:
  - React
  - 实战
  - Reducer
  - Context
  - State 边界
  - Provider
appliesTo: React 19.2 官方文档与 React 19
verifiedAt: 2026-08-16
objectives:
  - 能从任务工作区需求中分离共享 State、局部 State、固定数据和同步派生值。
  - 能用判别联合 Action 与纯 reducer 表达新增、状态变化、选择、删除、筛选和恢复。
  - 能用独立 State Context 与 dispatch Context 建立读取和更新通道。
  - 能把 reducer、Context、Provider 和读取 Hook 收拢到职责明确的模块。
  - 能让汇总、表单、筛选、列表和详情只依赖各自需要的数据或更新入口。
  - 能验证跨组件一致性、删除清理、空状态、稳定 ID 和局部 State 保留边界。
recap:
  - 任务、筛选、当前选择和下一任务 ID 由一个工作区 Provider 共同拥有。
  - 标题草稿、负责人草稿和帮助开关只有单一使用者，因此保持局部 State。
  - 数量、可见任务和当前任务都从共享 State 同步派生，不保存副本。
  - Action 用共同的 type 字面量区分事件，并只携带对应分支需要的新事实。
  - reducer 不修改输入，不执行外部工作，只返回完整的下一份 State。
  - State Context 与 dispatch Context 分离，使只读和只写依赖能够直接表达。
  - Provider 模块负责拥有 State 和提供通道，不渲染具体业务界面。
  - 删除当前任务会同时清空选择，筛选则不会改变任务或选择。
  - 恢复命令只重置 Provider 的共享 State，不清空表单草稿或帮助开关。
  - 新任务在一次恢复周期内使用稳定递增 ID；恢复会重建初值并开启新的身份周期。
sources:
  - title: Extracting State Logic into a Reducer
    url: https://react.dev/learn/extracting-state-logic-into-a-reducer
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Action 描述已经发生的用户事件
      - reducer 必须纯计算并以不可变方式返回下一份 State
  - title: useReducer
    url: https://react.dev/reference/react/useReducer
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - useReducer 返回当前 State 与稳定的 dispatch 函数
      - dispatch 请求后续 render，当前事件处理器仍读取当前 render 的 State 快照
  - title: Scaling Up with Reducer and Context
    url: https://react.dev/learn/scaling-up-with-reducer-and-context
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - State 与 dispatch 可以通过两条 Context 通道提供给深层组件
      - Provider 可以封装 reducer、Context 和读取入口的接线
  - title: createContext
    url: https://react.dev/reference/react/createContext
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Context 应在模块顶层创建
      - React 19 可以直接渲染 Context 作为 Provider
  - title: useContext
    url: https://react.dev/reference/react/useContext
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - useContext 读取上方最近匹配 Provider 的当前值
      - 提供与读取必须使用同一个 Context 对象
  - title: Sharing State Between Components
    url: https://react.dev/learn/sharing-state-between-components
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 多个组件协调的同一事实应提升到最近共同所有者
      - 每一份 State 都应有单一事实来源
  - title: Choosing the State Structure
    url: https://react.dev/learn/choosing-the-state-structure
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 应避免矛盾、冗余和重复 State
      - 能由当前 State 计算的值应在 render 中派生
  - title: Updating Arrays in State
    url: https://react.dev/learn/updating-arrays-in-state
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - State 数组应按只读值处理
      - 添加、替换和删除可使用展开、map 与 filter 创建新数组
  - title: TypeScript Narrowing
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
    sourceType: official-reference
    appliesTo: TypeScript
    claims:
      - 判别联合通过共同字面量字段收窄成员
      - never 可以检查 switch 是否穷尽联合成员
---

# 实战：共享任务工作区

## 一、学习目标

- 把产品需求拆成固定数据、共享 State、局部 State、同步派生值和用户事件。
- 用判别联合 Action 与纯 reducer 集中任务工作区的业务转换。
- 用 State Context 与 dispatch Context 连接深层只读、只写和读写组件。
- 把 Provider 接线与页面视图分开，保持模块职责清楚。
- 让任务汇总、筛选列表和详情始终读取同一份事实。
- 用完整操作序列检查新增、选择、状态变化、删除、筛选、恢复和局部状态边界。

## 二、最终成品

成品是一个纯客户端项目任务工作区。初始数据包含三条任务，分别由产品、前端和测试角色负责，状态为
待办、进行中或已完成。

工作区提供以下功能：

- 展示任务总数、进行中数量和已完成数量。
- 输入标题并选择负责人，创建一条新的待办任务。
- 按全部、待办、进行中或已完成筛选列表。
- 选择任务并在详情区域查看稳定 ID、标题、负责人和状态。
- 从列表或详情修改任务状态。
- 删除任意任务，并在删除当前任务时清空详情选择。
- 恢复固定示例任务、默认筛选、默认选择和下一任务 ID。
- 展开局部帮助说明，观察它不受工作区恢复命令影响。

所有数据只存在当前页面内存。这里的“共享”指多个 React 组件围绕同一份 State 协作，不包含账号、
网络请求、持久化或多人实时同步。

## 三、先写功能合同

不要从组件文件开始猜 State。先把用户操作和结果写成转换合同：

| 用户操作 | 直接输入 | 共享结果 | 不应变化 |
| --- | --- | --- | --- |
| 添加任务 | 标题、负责人 | 追加待办任务，下一 ID 递增 | 筛选、当前选择 |
| 修改状态 | 任务 ID、新状态 | 只替换目标任务 | 其他任务、筛选、选择 |
| 选择任务 | 任务 ID | 更新当前选择 ID | 任务、筛选 |
| 删除普通任务 | 任务 ID | 移除目标任务 | 当前选择、筛选、下一 ID |
| 删除当前任务 | 任务 ID | 移除目标任务并清空选择 | 筛选、下一 ID |
| 切换筛选 | 新筛选值 | 更新筛选 | 任务、当前选择 |
| 恢复示例 | 无 | 四项共享 State 恢复初值 | 表单草稿、帮助开关 |

这个表直接决定 Action 和 reducer 分支。只要某个实现不能说明自己对应哪一行，就应重新检查它是否
属于业务 State。

## 四、数据分类

### 1. 固定数据

负责人选项、任务状态选项、筛选选项和对应中文标签在运行期间不由用户增删，因此是模块常量：

```ts
const TASK_OWNERS = ['product', 'frontend', 'qa'] as const
const TASK_STATUSES = ['todo', 'doing', 'done'] as const
const TASK_FILTERS = ['all', ...TASK_STATUSES] as const
```

常量数组同时提供运行时选项和 TypeScript 联合类型来源。标签映射只负责显示，不复制进每条任务。

### 2. 共享 State

| 字段 | 含义 | 需要共享的原因 |
| --- | --- | --- |
| `tasks` | 完整任务集合 | 汇总、列表和详情必须读取同一事实 |
| `filter` | 当前列表筛选 | 筛选控件与列表必须协调 |
| `selectedTaskId` | 当前选择的任务身份 | 列表选择与详情必须协调 |
| `nextTaskId` | 下一条任务的稳定身份 | 新增和恢复需要统一分配规则 |

### 3. 局部 State

| 字段 | 所有者 | 为什么不共享 |
| --- | --- | --- |
| 新任务标题 | 新增表单 | 提交前只有输入框使用 |
| 新任务负责人 | 新增表单 | 提交前只有下拉框使用 |
| 帮助是否展开 | 帮助区域 | 与任务业务无关 |

组件位于 Provider 子树内，不代表它的所有 State 都必须进入 reducer。共享范围由真实消费者决定。

### 4. 同步派生值

以下值由当前共享 State 直接计算，不另存 State：

- 任务总数：`tasks.length`。
- 进行中数量：按 `status === 'doing'` 过滤后的长度。
- 已完成数量：按 `status === 'done'` 过滤后的长度。
- 当前可见列表：由 `tasks + filter` 计算。
- 当前详情任务：由 `tasks + selectedTaskId` 查找。
- 标题是否允许提交：由 `title.trim().length > 0` 计算。

不保存这些结果，就不需要额外同步代码，也不会出现列表已删除而汇总仍显示旧数量的矛盾。

## 五、领域类型

任务身份使用稳定数字 ID，负责人和状态使用有限联合：

```ts
type TaskOwner = 'product' | 'frontend' | 'qa'
type TaskStatus = 'todo' | 'doing' | 'done'
type TaskFilter = 'all' | TaskStatus

type WorkspaceTask = {
  readonly id: number
  readonly title: string
  readonly owner: TaskOwner
  readonly status: TaskStatus
}
```

`readonly` 表达任务快照不应被原地重写。修改状态时创建新的目标任务对象，未变化任务继续复用原对象。

共享 State 只保存源事实：

```ts
type WorkspaceState = {
  readonly tasks: readonly WorkspaceTask[]
  readonly filter: TaskFilter
  readonly selectedTaskId: number | null
  readonly nextTaskId: number
}
```

只保存 `selectedTaskId`，不保存完整 `selectedTask`。任务标题、负责人或状态更新后，详情会通过当前数组
重新查找，因此不会保留旧对象副本。

## 六、确定初值

```ts
const initialTasks: readonly WorkspaceTask[] = [
  { id: 1, title: '确认任务字段', owner: 'product', status: 'done' },
  { id: 2, title: '拆分 Provider 模块', owner: 'frontend', status: 'doing' },
  { id: 3, title: '核对状态边界', owner: 'qa', status: 'todo' },
]

/** 创建互不修改的工作区初始 State。 */
function createInitialWorkspaceState(): WorkspaceState {
  return {
    tasks: [...initialTasks],
    filter: 'all',
    selectedTaskId: 2,
    nextTaskId: 4,
  }
}
```

使用创建函数有两个作用：每个 Provider 实例获得自己的 State 对象；恢复示例时也能返回新的数组容器。
任务对象本身按只读模板处理，reducer 不修改它们。

`nextTaskId` 不能用 `tasks.length + 1` 代替。删除 ID 2 后，数组长度可能变成 2；此时按长度生成 ID 3
会与现有任务冲突。稳定身份必须独立于当前数组位置和长度。

这里的递增范围是一次恢复周期。恢复会让整份共享 State 回到确定初值，并从 `nextTaskId: 4` 开启新的
身份周期；上一周期新增的任务已整体退出当前 State，因此不会与新周期的 ID 同时存在。

## 七、设计 Action 判别联合

```ts
type WorkspaceAction =
  | { type: 'task/added'; title: string; owner: TaskOwner }
  | { type: 'task/statusChanged'; taskId: number; status: TaskStatus }
  | { type: 'task/selected'; taskId: number }
  | { type: 'task/deleted'; taskId: number }
  | { type: 'filter/changed'; filter: TaskFilter }
  | { type: 'workspace/reset' }
```

### 1. `type` 描述事件

`task/added` 表示任务已经由用户提交，`filter/changed` 表示筛选已经被用户切换。它们比
`setTasks`、`updateField` 或 `patchState` 更接近产品语义。

### 2. 载荷保持最小

添加任务只携带已清理的标题和负责人。ID 与初始状态由 reducer 根据当前 State 决定。状态变化只携带
任务 ID 和新状态，不传完整旧任务。删除只需要任务 ID。

### 3. 不传浏览器事件对象

事件入口读取 `event.currentTarget.value`，然后构造普通 Action。reducer 不依赖 DOM，也不需要知道操作
来自按钮、表单还是其他界面。

### 4. 联合成员不能写成可选字段袋

如果把所有载荷都写成可选字段，`task/added` 也可能缺少 `title`，reducer 只能使用断言。判别联合会让
TypeScript 根据 `type` 自动收窄到对应载荷。

## 八、编写纯 reducer

### 1. 添加任务

```ts
case 'task/added':
  return {
    ...state,
    tasks: [
      ...state.tasks,
      {
        id: state.nextTaskId,
        title: action.title,
        owner: action.owner,
        status: 'todo',
      },
    ],
    nextTaskId: state.nextTaskId + 1,
  }
```

添加使用当前 `nextTaskId`，新任务固定从待办开始。数组展开创建新数组，旧数组不变。

### 2. 修改状态

```ts
case 'task/statusChanged': {
  const currentTask = state.tasks.find((task) => task.id === action.taskId)
  if (!currentTask || currentTask.status === action.status) return state

  return {
    ...state,
    tasks: state.tasks.map((task) =>
      task.id === action.taskId ? { ...task, status: action.status } : task,
    ),
  }
}
```

目标不存在或状态没有变化时返回原 State。真正变化时，`map` 只替换目标对象。

### 3. 选择任务

```ts
case 'task/selected':
  if (state.selectedTaskId === action.taskId) return state
  return state.tasks.some((task) => task.id === action.taskId)
    ? { ...state, selectedTaskId: action.taskId }
    : state
```

选择只接受当前集合中的任务身份。它不修改任务、筛选或下一 ID。

### 4. 删除任务

```ts
case 'task/deleted':
  return {
    ...state,
    tasks: state.tasks.filter((task) => task.id !== action.taskId),
    selectedTaskId:
      state.selectedTaskId === action.taskId ? null : state.selectedTaskId,
  }
```

删除当前任务时同步清空选择，避免详情继续指向不存在的身份。删除其他任务时保留当前选择。

### 5. 切换筛选

```ts
case 'filter/changed':
  return state.filter === action.filter ? state : { ...state, filter: action.filter }
```

筛选只决定列表投影。它不删除任务、不改变详情选择，也不改变汇总口径。

### 6. 恢复初值

```ts
case 'workspace/reset':
  return createInitialWorkspaceState()
```

恢复只返回 reducer 管理的初始 State。新增表单草稿和帮助开关属于其他组件，不在这个分支中处理。

### 7. 穷尽检查

```ts
default: {
  const unhandledAction: never = action
  return unhandledAction
}
```

新增联合成员但漏写 reducer 分支时，`action` 不能收窄为 `never`，类型检查会指出缺失分支。

## 九、Reducer 的纯度边界

reducer 可以做：

- 读取当前 State 与 Action。
- 计算新对象和新数组。
- 使用同步数组方法查找、映射和过滤。
- 在无变化时返回原 State。

reducer 不做：

- 修改 `state`、`state.tasks` 或任务对象。
- 读取输入框、窗口或文档节点。
- 发起请求、写存储、设置定时器或记录外部日志。
- 调用 dispatch 或组件 setter。
- 使用时间戳或随机数生成任务 ID。

同样的 State 与 Action 必须得到同样的下一 State。这个性质让业务转换可以脱离组件树理解。

## 十、建立两条 Context 通道

```tsx
const WorkspaceStateContext = createContext<WorkspaceState | null>(null)
const WorkspaceDispatchContext = createContext<Dispatch<WorkspaceAction> | null>(null)
```

State 与 dispatch 分开后，组件能直接表达自己的依赖：

- 汇总只读 State，不获得更新能力。
- 新增表单只取得 dispatch，不读取完整任务集合。
- 筛选、列表和详情既读取当前值，也派发事件。
- 恢复按钮只取得 dispatch。

拆分首先用于表达职责，不代表自动获得渲染性能提升。是否需要性能优化必须依据实际测量，不能由 Context
数量推断。

## 十一、用薄 Hook 暴露缺失边界

```tsx
/** 读取最近工作区 Provider 的 State，并显式暴露缺失边界。 */
function useWorkspaceState(): WorkspaceState {
  const state = useContext(WorkspaceStateContext)
  if (state === null) throw new Error('useWorkspaceState 必须在 WorkspaceProvider 内使用')
  return state
}

/** 读取最近工作区 Provider 的 dispatch，并显式暴露缺失边界。 */
function useWorkspaceDispatch(): Dispatch<WorkspaceAction> {
  const dispatch = useContext(WorkspaceDispatchContext)
  if (dispatch === null) {
    throw new Error('useWorkspaceDispatch 必须在 WorkspaceProvider 内使用')
  }
  return dispatch
}
```

`null` 明确表示没有 Provider。Hook 检查后，返回类型中不再包含 `null`，调用组件也不需要重复判断。

不要给 Context 填入伪造空对象或空函数。伪默认值会让缺失 Provider 看似正常，操作却没有效果。

两个 Hook 内部调用 `useContext`，因此必须在组件函数或其他 Hook 的顶层调用。不能在事件处理器、条件
分支或循环中临时调用。

## 十二、封装模块化 Provider

```tsx
/** 拥有工作区 reducer State，并向同一子树提供读取与更新通道。 */
function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, undefined, createInitialWorkspaceState)

  return (
    <WorkspaceStateContext value={state}>
      <WorkspaceDispatchContext value={dispatch}>{children}</WorkspaceDispatchContext>
    </WorkspaceStateContext>
  )
}
```

Provider 模块的职责只有：

1. 创建两条 Context。
2. 调用一次 `useReducer`，成为共享 State owner。
3. 向同一 children 子树提供当前 State 与 dispatch。
4. 导出两个读取入口。

Provider 不渲染任务标题、表单、筛选、列表或详情，不保存表单草稿，不计算可见任务，也不处理样式。
这就是“模块化 Provider”的核心：把状态接线收拢到一个业务边界，而不是建立通用状态框架。

## 十三、确定 Provider 作用域

```text
LabSharedTaskWorkspaceDemo
|- WorkspaceHelp                         局部 useState
`- WorkspaceProvider                    共享 State owner
   `- WorkspaceShell                    只组织 children
      |- WorkspaceSummary               只读
      |- TaskComposer                    只写 + 局部草稿
      |- TaskFilterBar                   读写
      |- TaskList                        读写
      |- TaskDetails                     读写
      `- RestoreWorkspaceButton          只写
```

Provider 覆盖所有共享消费者的最近共同子树。帮助区域完全不读任务 State，因此放在 Provider 外。中间的
`WorkspaceShell` 只接收 `children`，不接收 `tasks`、`filter` 或 `dispatch` Props。

把 Provider 放到整个应用根部会扩大依赖与生命周期；把列表和详情分别放进两个 Provider，则会创建两份
互不相干的任务 State。当前工作区只需要一个共同 Provider 实例。

## 十四、实现只读汇总

```tsx
/** 从当前任务数组派生并展示工作区汇总。 */
function WorkspaceSummary() {
  const { tasks } = useWorkspaceState()
  const doingCount = tasks.filter((task) => task.status === 'doing').length
  const doneCount = tasks.filter((task) => task.status === 'done').length

  return (
    <section aria-label="任务汇总" aria-live="polite">
      <span>任务总数：{tasks.length}</span>
      <span>进行中：{doingCount}</span>
      <span>已完成：{doneCount}</span>
    </section>
  )
}
```

汇总不保存数量，也不取得 dispatch。任何任务 Action 产生下一数组后，后续 render 会重新计算数量。

## 十五、实现只写新增表单

新增表单只需要 dispatch 和自己的局部草稿：

```tsx
/** 保存未提交草稿，并把有效提交转换为添加任务 Action。 */
function TaskComposer() {
  const dispatch = useWorkspaceDispatch()
  const [title, setTitle] = useState('')
  const [owner, setOwner] = useState<TaskOwner>('product')
  const canSubmit = title.trim().length > 0

  /** 提交非空标题，并恢复当前表单的局部草稿。 */
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextTitle = title.trim()
    if (!nextTitle) return

    dispatch({ type: 'task/added', title: nextTitle, owner })
    setTitle('')
    setOwner('product')
  }

  // 返回受控 input、select 和 submit button。
}
```

`trim()` 位于事件入口，reducer 接收已经确认有效的业务标题。成功提交后只清空表单自己的草稿；共享
筛选和当前选择保持不变。

按钮的 `disabled` 由当前标题派生，不需要保存 `canSubmit` State。表单使用一个 `submit` 入口，避免
点击按钮和按 Enter 走两套添加逻辑。

## 十六、实现筛选栏

筛选栏读取当前筛选以显示选中状态，同时派发筛选 Action：

```tsx
{TASK_FILTERS.map((filterName) => (
  <button
    key={filterName}
    type="button"
    aria-pressed={filter === filterName}
    onClick={() => dispatch({ type: 'filter/changed', filter: filterName })}
  >
    {TASK_FILTER_LABELS[filterName]}
  </button>
))}
```

`aria-pressed` 和按钮文字共同表达状态，不能只依赖背景颜色。筛选 Action 不携带任务数组，reducer 也
不会重写任务。

## 十七、实现任务列表

列表先从完整任务和筛选值派生当前投影：

```ts
const visibleTasks =
  filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)
```

然后使用稳定任务 ID 作为 key：

```tsx
{visibleTasks.map((task) => (
  <li key={task.id}>
    <strong>{task.title}</strong>
    <span>{TASK_OWNER_LABELS[task.owner]}</span>
    <span>{TASK_STATUS_LABELS[task.status]}</span>
  </li>
))}
```

不要使用索引、标题、时间戳或随机值。标题可能重复，索引会随删除和筛选变化，随机值会让每次 render
产生新身份。

每一行提供三类更新意图：

- 选择：派发 `task/selected`。
- 修改状态：派发 `task/statusChanged`。
- 删除：派发 `task/deleted`。

列表不直接修改任务对象，也不调用多个 setter 拼装一次业务事件。

## 十八、实现任务详情

详情只保存选择 ID，完整任务在 render 中查找：

```ts
const selectedTask = tasks.find((task) => task.id === selectedTaskId)
```

存在任务时显示稳定 ID、标题、负责人和状态；不存在时显示明确的“未选择任务”状态。详情中的状态按钮
派发同一个 `task/statusChanged` Action，因此列表与详情会在同一份下一 State 上更新。

详情不根据当前筛选隐藏。筛选改变的是列表投影，不是选择事实。例如当前选中进行中任务后筛选已完成，
列表可以暂时看不到它，详情仍然保留当前选择。

## 十九、删除与选择一致性

删除行为需要区分两种情况：

1. 删除非当前任务：任务集合减少，当前详情保持。
2. 删除当前任务：任务集合减少，`selectedTaskId` 同时变为 `null`。

如果只过滤数组而不清理当前选择，详情查找会得到 `undefined`。界面虽然可能显示空状态，但 State 仍保留
一个不存在的身份。把清理规则放进同一个 reducer 分支，能保证一次 Action 产生完整一致的下一 State。

删除后不自动选择相邻任务。自动选择不是当前产品合同，额外行为会掩盖“当前选择已经失效”的事实。

## 二十、筛选与汇总口径

汇总始终针对完整 `tasks`，列表针对 `visibleTasks`。这两个口径不能混用：

```ts
const totalCount = tasks.length
const visibleTasks = filter === 'all' ? tasks : tasks.filter(matchesFilter)
```

筛选已完成后，列表显示的数量可能为 1，但任务总数仍为 4。若汇总从 `visibleTasks` 计算，用户会误以为
筛选删除了其他任务。

空筛选结果必须显示明确文字。空数组本身是合法业务结果，不应被当成加载失败或异常。

## 二十一、恢复边界

恢复按钮只取得 dispatch：

```tsx
/** 派发工作区恢复 Action。 */
function handleRestore() {
  dispatch({ type: 'workspace/reset' })
}
```

恢复后的共享 State 为：

- 三条固定任务。
- 筛选为全部。
- 选择 ID 2。
- 下一任务 ID 为 4。

以下局部 State 保持：

- 新增表单中尚未提交的标题。
- 新增表单中尚未提交的负责人。
- 帮助内容的展开状态。

这个结果直接证明共享 reducer 不是页面所有 State 的容器。

## 二十二、一次 dispatch 的数据流

以“把任务改为进行中”为例：

```text
select onChange
  -> 读取 taskId 与新 status
  -> dispatch({ type: 'task/statusChanged', taskId, status })
  -> reducer 读取当前 State
  -> map 创建下一 tasks 数组
  -> Provider 在后续 render 提供下一 State
  -> 列表、详情和汇总从同一 State 重新派生
```

dispatch 后，同一个事件处理器闭包中的 `state` 变量仍属于当前 render。不要立即读取旧变量并断言它已
更新。需要显示的新结果应由后续 render 读取。

## 二十三、文件职责

| 文件 | 职责 |
| --- | --- |
| `workspace-model.ts` | 领域类型、标签、初值、Action 与纯 reducer |
| `workspace-provider.tsx` | 两条 Context、Provider 和两个读取 Hook |
| `workspace-panels.tsx` | 汇总、表单、筛选、列表、详情、恢复与帮助区域 |
| `lab-shared-task-workspace-demo.tsx` | 组合一个完整工作区，不拥有共享业务 State |
| `lab-shared-task-workspace-demo.css` | 工作区布局、状态和响应式样式 |

拆分依据是职责，不是文件数量。模型不依赖 React 组件；Provider 不依赖具体面板；页面组合不重复 reducer
接线。这样展开源码时可以沿“模型 → Provider → 视图 → 组合”顺序阅读。

## 二十四、完整运行示例

下面的工作区包含实际运行的全部 TS、TSX 与 CSS 源码。重点观察：新增表单没有读取完整任务 State，
汇总没有取得 dispatch，中间布局没有业务 Props，帮助区位于 Provider 外。

:::demo{id="react.core.learn.intermediate.lab-shared-task-workspace.shared-task-workspace-demo"}
:::

## 二十五、固定操作序列

从初始页面依次操作：

1. 初始显示三条任务；总数 3、进行中 1、已完成 1；详情显示“拆分 Provider 模块”。
2. 展开帮助，确认任务、筛选和详情不变。
3. 标题只输入空格，确认“添加任务”保持不可用。
4. 输入“补充验收清单”，负责人选择“测试”，提交。
5. 确认列表新增一条待办任务，总数变为 4，表单清空并恢复产品负责人。
6. 选择新任务，确认列表显示“当前选中”，详情显示同一标题、测试和待办。
7. 把新任务改为进行中，确认列表与详情同步，进行中数量变为 2。
8. 筛选已完成，确认列表只显示“确认任务字段”，汇总总数仍为 4，详情仍显示新任务。
9. 选择并删除“确认任务字段”，确认列表显示空筛选结果，详情显示未选择任务。
10. 切回全部，确认剩余三条任务，详情仍为空。
11. 在标题输入“尚未提交”，保持帮助展开，点击“恢复示例任务”。
12. 确认任务、筛选、选择和下一 ID 恢复初值，标题草稿与帮助状态保持。
13. 提交“尚未提交”，确认新任务使用 ID 4，没有重复身份。

每一步都只观察产品状态。数量、列表与详情若出现冲突，应回到 State 分类和 reducer 转换表定位问题。

## 二十六、易错使用提示

:::pitfalls
### 错误一：各面板分别保存任务副本

**触发条件：** 汇总、列表和详情各自调用 `useState` 保存任务数组。

**原因：** 同一业务事实出现多个 owner。

**后果：** 删除或修改后，数量、列表和详情互相矛盾。

**错误示例：**

```tsx
function TaskList() {
  const [tasks, setTasks] = useState(initialTasks)
}

function TaskDetails() {
  const [tasks, setTasks] = useState(initialTasks)
}
```

**正确写法：**

```tsx
const { tasks } = useWorkspaceState()
```

**验证方式：** 修改一条任务后，汇总、列表和详情必须在同一次界面更新中显示相同结果。

### 错误二：把所有局部交互塞进 reducer

**触发条件：** 为标题每次输入和帮助展开都派发 Action。

**原因：** 把 Provider 子树范围误当成每份 State 的最小所有权范围。

**后果：** reducer 被局部 UI 细节占满，恢复命令的边界也不清楚。

**错误示例：**

```tsx
dispatch({ type: 'draft/titleChanged', title })
dispatch({ type: 'help/toggled' })
```

**正确写法：**

```tsx
const [title, setTitle] = useState('')
const [open, setOpen] = useState(false)
```

**验证方式：** 恢复示例任务后，未提交标题和帮助状态保持原值。

### 错误三：保存派生副本

**触发条件：** 同时保存 `tasks`、`visibleTasks`、`doneCount` 和完整 `selectedTask`。

**原因：** 后三项都能从当前源事实同步计算。

**后果：** 每个 Action 都要手动同步多个字段，漏掉一项就显示旧数据。

**错误示例：**

```tsx
const [visibleTasks, setVisibleTasks] = useState(initialTasks)
const [doneCount, setDoneCount] = useState(1)
```

**正确写法：**

```tsx
const visibleTasks = filter === 'all' ? tasks : tasks.filter(matchesFilter)
const doneCount = tasks.filter((task) => task.status === 'done').length
```

**验证方式：** 任务状态变化后不调用额外 setter，汇总和筛选结果仍立即一致。

### 错误四：原地修改 State

**触发条件：** 在 reducer 中使用 `push`、`splice` 或直接重写任务状态。

**原因：** State 数组和对象应按只读快照处理，reducer 还必须保持纯净。

**后果：** 旧 State 被污染，更新身份与重放结果不可靠。

**错误示例：**

```ts
state.tasks.push(newTask)
task.status = action.status
return state
```

**正确写法：**

```ts
return {
  ...state,
  tasks: state.tasks.map((task) =>
    task.id === action.taskId ? { ...task, status: action.status } : task,
  ),
}
```

**验证方式：** 未变化任务保持原对象，目标任务和数组获得新对象。

### 错误五：用可选字段袋描述 Action

**触发条件：** 所有分支共享 `type: string`，其他字段全部可选。

**原因：** `type` 与专属载荷没有类型绑定。

**后果：** 非法组合能进入 reducer，分支中充满断言。

**错误示例：**

```ts
type Action = {
  type: string
  taskId?: number
  title?: string
  status?: TaskStatus
}
```

**正确写法：**

```ts
type Action =
  | { type: 'task/added'; title: string; owner: TaskOwner }
  | { type: 'task/statusChanged'; taskId: number; status: TaskStatus }
```

**验证方式：** 构造缺少标题的添加 Action 时，TypeScript 必须拒绝。

### 错误六：用伪默认值隐藏缺失 Provider

**触发条件：** State Context 使用空任务对象，dispatch Context 使用空函数。

**原因：** 消费者无法区分真实 Provider 和无效 fallback。

**后果：** 界面看似可渲染，操作却静默无效。

**错误示例：**

```tsx
const StateContext = createContext(emptyState)
const DispatchContext = createContext(() => {})
```

**正确写法：**

```tsx
const StateContext = createContext<WorkspaceState | null>(null)
const DispatchContext = createContext<Dispatch<WorkspaceAction> | null>(null)
```

**验证方式：** 消费者缺少 Provider 时，读取 Hook 应立即给出明确错误。

### 错误七：让两个 Provider 实例承担同一工作区

**触发条件：** 列表和详情分别包在并列的 `WorkspaceProvider` 中。

**原因：** 每个 Provider 组件实例各自调用 reducer，拥有独立 State。

**后果：** 列表选择后，详情仍读取另一份初值。

**错误示例：**

```tsx
<WorkspaceProvider><TaskList /></WorkspaceProvider>
<WorkspaceProvider><TaskDetails /></WorkspaceProvider>
```

**正确写法：**

```tsx
<WorkspaceProvider>
  <TaskList />
  <TaskDetails />
</WorkspaceProvider>
```

**验证方式：** 列表选择任务后，详情必须读取同一个 Provider 中的选择 ID。

### 错误八：把双 Context 当成性能承诺

**触发条件：** 声称拆分后只写组件永远不会重新 render。

**原因：** 拆分表达依赖职责，实际 render 还取决于父组件、Props 和组件树。

**后果：** 在没有测量的情况下继续添加缓存或选择器，结构反而更复杂。

**错误示例：**

```text
拆成两个 Context 后，所有 dispatch 组件都不会重新渲染。
```

**正确写法：**

```text
拆分让组件可以只读取 State 或只取得 dispatch；当前结构不作性能承诺。
```

**验证方式：** 只检查组件是否取得必要通道，不从通道数量推断性能结果。
:::

## 二十七、从状态语义推导实现

### 1. 为什么任务和筛选属于同一个 reducer

新增、删除、状态变化、筛选和恢复共同定义工作区业务转换。恢复命令需要一次性恢复任务、筛选、选择和
下一 ID，因此这些字段由同一个 reducer owner 管理。

### 2. 为什么标题草稿不进入 reducer

标题在提交前只有表单使用，没有其他组件需要协调。成功提交时，表单把清理后的标题作为新事实交给
reducer。局部保存能让共享模型只包含已提交业务状态。

### 3. 为什么选择保存 ID 而不是对象

ID 是稳定源事实，完整对象是当前数组中的投影。状态变化会替换任务对象；按 ID 查找能让详情始终读取
最新对象。

### 4. 为什么筛选不影响详情

筛选描述列表显示范围，选择描述当前关注任务。二者是不同事实。隐藏选中项不等于取消选择，因此筛选
Action 保持 `selectedTaskId`。

### 5. 为什么删除当前任务必须清空选择

任务被删除后，原 ID 不再对应当前集合中的实体。清空选择能让 State 与任务集合保持一致，并让详情进入
明确空状态。

### 6. 为什么恢复不清空局部草稿

恢复命令的对象是共享任务工作区。局部草稿尚未提交，不属于共享任务事实；帮助开关更与业务无关。
它们保持原值，正好证明所有权边界有效。

### 7. 为什么 Provider 不渲染具体面板

Provider 的职责是拥有 State 和提供依赖。具体面板属于视图。分离后，模型和接线可以独立阅读，页面
组合也不需要知道 reducer 细节。

## 二十八、适用边界

当前结构适合：

- 一个页面内有多个深层组件需要读取或更新同一任务集合。
- 更新事件有限且能同步计算。
- 表单草稿有明确局部所有者。
- 数据只存在当前 React 组件树中。
- 需要让只读、只写和读写依赖清楚可见。

当前结构不解决：

- 数据由 React 外部对象持有并独立变化。
- 网络请求、服务器缓存、持久化或离线同步。
- 多人协作、权限和冲突合并。
- 撤销重做、事件溯源或通用状态机。
- 未经测量的渲染性能优化。

需求变化时，应重新列出源事实、消费者和事件，再决定 State owner，而不是直接扩大当前 Provider。

## 二十九、练习

:::exercise
### 练习一：增加优先级

**要求：** 为任务增加“低、普通、高”优先级；固定标签放在模块常量中，新增表单用局部 State 保存未提交值，`task/added` 携带优先级，列表和详情从共享任务读取。

**完成标准：** 新增任务显示正确优先级，恢复示例回到固定初值，不增加独立优先级副本。
:::

:::exercise
### 练习二：增加负责人筛选

**要求：** 增加负责人筛选源事实，并与状态筛选共同派生 `visibleTasks`；两个筛选都不修改任务、选择或汇总。

**完成标准：** 任意组合筛选都只改变列表投影，详情与完整任务数量保持。
:::

:::exercise
### 练习三：增加清除已完成命令

**要求：** 新增语义明确的 `tasks/completedCleared` Action，一次删除所有已完成任务；若当前任务也被删除，同时清空选择。

**完成标准：** reducer 分支通过穷尽检查，列表、汇总和详情保持一致。
:::

:::exercise
### 练习四：下移列表显示密度

**要求：** 为任务列表增加“紧凑、舒展”显示密度开关。只有列表读取该值，因此保留在列表组件局部，不加入共享 reducer。

**完成标准：** 切换密度只改变列表表现，恢复工作区不重置密度。
:::

:::exercise
### 练习五：修复重复身份

**要求：** 找出使用 `tasks.length + 1` 生成 ID 的冲突路径，改为独立 `nextTaskId`，并验证删除后连续新增不会重复。

**完成标准：** 一次恢复周期内每个新任务 ID 唯一、稳定；恢复开启新的身份周期，列表不使用索引 key。
:::

## 三十、本节小结

- 固定负责人、状态、筛选和标签属于模块常量。
- 任务、筛选、当前选择和下一 ID 是需要跨组件协调的共享 State。
- 标题草稿、负责人草稿和帮助开关只有局部使用者，保持局部 State。
- 汇总数量、可见列表、当前任务和按钮能力都在 render 中同步派生。
- Action 使用判别联合描述用户事件，并只携带对应分支需要的新事实。
- reducer 以展开、`map` 和 `filter` 创建下一 State，不修改输入或执行外部工作。
- State Context 与 dispatch Context 分离，让只读、只写和读写依赖直接可见。
- Provider 模块拥有 reducer State 并提供通道，不渲染任务界面或保存局部草稿。
- 一个共同 Provider 覆盖汇总、表单、筛选、列表、详情和恢复按钮。
- 删除当前任务会清空选择；筛选只改变列表投影；恢复只改变共享 State。
- 任务 ID 独立于数组长度和位置，一次恢复周期内删除后不会错误复用。
- 双 Context 用于表达职责，不构成未经测量的性能保证。

## 三十一、参考资料

- [Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer)
- [`useReducer`](https://react.dev/reference/react/useReducer)
- [Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context)
- [`createContext`](https://react.dev/reference/react/createContext)
- [`useContext`](https://react.dev/reference/react/useContext)
- [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components)
- [Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context)
- [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure)
- [Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state)
- [TypeScript Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)
