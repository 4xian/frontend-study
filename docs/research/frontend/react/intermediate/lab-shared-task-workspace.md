# IL2「实战：共享任务工作区」官方研究记录

## 研究状态、版本与冻结边界

- 课程 ID：`react.core.learn.intermediate.lab-shared-task-workspace`。
- 左侧短标题与正文标题：`实战：共享任务工作区`。
- 课程类型：React Core 中级实战课，本科前端课程范围。
- 研究日期：`2026-08-16`。
- React 公共文档基线：React `19.2`。
- 仓库运行时：`react@19.2.8`、`react-dom@19.2.8`。
- React 固定源码标签：`v19.2.8`，提交
  `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`。
- React 固定文档提交：`c7d6b700038c63d1aaf2c649af1aefe01ebbacac`。
- 本轮写入边界：只新增本研究文件；不修改课程正文、Demo、CSS、entry/demo manifest、
  Track、进度、总计划、依赖、测试或任何后续课程资产。

本实战只组合已经完成的 I04「useReducer 与 Action」、I05「Context」、I06「Reducer 与 Context
组合」和 I07「状态共享边界」。核心知识合同固定为：用纯 reducer 集中任务更新，用判别联合描述
Action，用独立 State Context 与 dispatch Context 向工作区子树提供两条通道，用模块化 Provider 封装
接线，并让每一份 State 留在最小、可解释的所有权边界。

“共享”只表示同一页面的多个 React 组件读取或更新同一份内存 State，不表示多人实时协作。应用没有
账号、服务器、请求、同步、冲突解决或持久化；刷新页面恢复固定初值。

## 一、研究方式与检索记录

1. 先核对权威总计划中的 IL2 行、逐课流程、中级 Gate 和执行日志，确认 I04-I07 已闭环且 IL2 是
   `32/74` 后的下一课；I08 及后续课程不在本轮读取、调研或实现范围内。
2. 读取 I04-I07 当前研究、课程正文、Demo、entry/demo manifest 与 Track，再对照 IL1 和基础实战的
   多文件同源 Demo 习惯，区分“可复用合同”和“不能重复的旧示例”。
3. 按仓库外部搜索顺位先调用 Tavily。Tavily 返回套餐用量上限错误
   `This request exceeds your plan's set usage limit`，因此切换到 Exa；Exa 成功找到 React 与
   TypeScript 官方候选 URL，未继续调用 Parallel、Perplexity 或原生 `web_search`。
4. 搜索摘要不作为证据。候选事实最终回到 `react.dev`、TypeScript Handbook、官方 GitHub 仓库固定
   文件和 `facebook/react` 的 `v19.2.8` 标签核验。
5. `raw.githubusercontent.com` 的并行读取在本环境持续无响应，已终止对应只读请求；随后通过 GitHub
   官方 Contents API 的 raw 响应核对同一固定标签源码。这是已知 URL 的读取方式切换，不是关键词
   搜索降级。
6. React 公共行为以 React `19.2` 文档为准；固定源码只用于解释公开合同如何落到当前仓库版本，不把
   Fiber、lane、队列实现或私有字段写成学习者必须依赖的 API。

## 二、一手来源卡

| ID | 官方来源 | URL 与锚点 | 本研究采用范围 |
| --- | --- | --- | --- |
| `R00` | React Versions | [latest version](https://react.dev/versions#latest-version) | `react.dev` 当前文档基线是 React `19.2`；同一 major 内持续更新，不为每个 minor/patch 单独发布文档。 |
| `R01` | Extracting State Logic into a Reducer | [writing reducers well](https://react.dev/learn/extracting-state-logic-into-a-reducer#writing-reducers-well)、[comparing useState and useReducer](https://react.dev/learn/extracting-state-logic-into-a-reducer#comparing-usestate-and-usereducer) | Action 描述发生的事件；reducer 计算下一份 State，并保持纯净和不可变。 |
| `R02` | `useReducer` | [reference](https://react.dev/reference/react/useReducer#reference)、[dispatch](https://react.dev/reference/react/useReducer#dispatch-function) | 签名、当前 State、稳定的 dispatch、下一次 render、纯 reducer 与 StrictMode 开发检查。 |
| `R03` | Scaling Up with Reducer and Context | [combining a reducer with context](https://react.dev/learn/scaling-up-with-reducer-and-context#combining-a-reducer-with-context)、[moving all wiring into a single file](https://react.dev/learn/scaling-up-with-reducer-and-context#moving-all-wiring-into-a-single-file) | State/dispatch 两条 Context、Provider 封装、`children` 和薄读取 Hook 的官方组合模式。 |
| `R04` | `createContext` | [reference](https://react.dev/reference/react/createContext#reference)、[provider](https://react.dev/reference/react/createContext#provider) | Context 在模块顶层创建；默认值是静态 fallback；React 19 可直接渲染 Context 作为 Provider。 |
| `R05` | `useContext` | [reference](https://react.dev/reference/react/useContext#reference)、[caveats](https://react.dev/reference/react/useContext#caveats) | 读取最近祖先 Provider、同一 Context 对象、Provider 必须位于读取方上方、值变化比较。 |
| `R06` | Sharing State Between Components | [lifting state up](https://react.dev/learn/sharing-state-between-components#lifting-state-up-by-example)、[single source of truth](https://react.dev/learn/sharing-state-between-components#a-single-source-of-truth-for-each-state) | 共同事实提升到最近共同 owner；每一份 State 有单一事实来源。 |
| `R07` | Passing Data Deeply with Context | [before you use context](https://react.dev/learn/passing-data-deeply-with-context#before-you-use-context)、[context use cases](https://react.dev/learn/passing-data-deeply-with-context#use-cases-for-context) | Props 和 `children` 优先；Context 用于明确子树中的深层共享，而不是任意全局容器。 |
| `R08` | Choosing the State Structure | [principles](https://react.dev/learn/choosing-the-state-structure#principles-for-structuring-state) | 避免矛盾、冗余和重复 State；可由当前 State 计算的值在 render 中派生。 |
| `R09` | Updating Arrays in State | [updating arrays without mutation](https://react.dev/learn/updating-arrays-in-state#updating-arrays-without-mutation) | State 数组按只读值处理，使用展开、`map` 和 `filter` 创建下一数组。 |
| `R10` | Rules of Hooks | [only call Hooks at the top level](https://react.dev/reference/rules/rules-of-hooks#only-call-hooks-at-the-top-level) | `useContext` 及薄读取 Hook 只能在组件或自定义 Hook 顶层调用。 |
| `T01` | TypeScript Narrowing | [discriminated unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)、[exhaustiveness checking](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking) | 共同字面量字段收窄联合成员，`never` 可检查 `switch` 是否穷尽。 |
| `S01` | React `v19.2.8` `ReactContext.js` | [fixed source](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/ReactContext.js) | 固定源码把 `defaultValue` 写入 Context 初始槽位，并令 React 19 Provider 与 Context 使用同一对象身份。 |
| `S02` | React `v19.2.8` `ReactFiberHooks.js` | [fixed source](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js) | `mountReducer` 把绑定后的 dispatch 保存到 Hook queue；更新路径复用 `queue.dispatch`。仅作稳定身份的版本核对。 |

固定 React 文档证据位于官方 `reactjs/react.dev` 仓库同一提交：

- [Extracting State Logic into a Reducer](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/extracting-state-logic-into-a-reducer.md)
- [`useReducer`](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useReducer.md)
- [Scaling Up with Reducer and Context](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/scaling-up-with-reducer-and-context.md)
- [`createContext`](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/createContext.md)
- [`useContext`](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useContext.md)
- [Sharing State Between Components](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/sharing-state-between-components.md)
- [Passing Data Deeply with Context](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/passing-data-deeply-with-context.md)
- [Choosing the State Structure](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/choosing-the-state-structure.md)

## 三、逐 Claim 事实账本

| Claim | 可用于 IL2 的准确表述 | 一手来源 | 当前边界 |
| --- | --- | --- | --- |
| `C01` | reducer 接收当前 State 与 Action，必须纯计算并返回完整的下一份 State。 | `R01`、`R02` | 不在 reducer 中请求、写存储、计时、修改参数或调用 dispatch。 |
| `C02` | Action 应描述已经发生的用户事件，并只携带 reducer 计算所需的新事实。 | `R01`、`R02` | 不把 Action 设计为宽泛字段补丁，也不传浏览器事件对象。 |
| `C03` | dispatch 请求后续 render；同一事件处理器中的 State 变量仍是当前 render 快照。 | `R02` | 不在 dispatch 后立即把旧变量当成新 State。 |
| `C04` | `useReducer` 返回的 dispatch 身份稳定；当前固定源码在挂载时保存它，更新时复用同一 queue 中的 dispatch。 | `R02`、`S02` | 这是 Context 分离可表达“只写依赖”的事实，不展开 Hook queue 或调度算法。 |
| `C05` | 官方组合模式建立 State Context 和 dispatch Context，由一个调用 `useReducer` 的 Provider 同时提供。 | `R03` | 双 Context 是本课冻结设计，不宣称它是 React 唯一合法写法。 |
| `C06` | Provider 可以与 reducer、Context 和读取入口放在独立模块中，接收 `children` 并隐藏接线细节。 | `R03` | “模块化”是职责拆分，不是创建框架、插件系统或通用 Store。 |
| `C07` | Context 对象只标识通道，不自行拥有动态 State；读取方得到最近祖先 Provider 的当前 value。 | `R04`、`R05`、`S01` | State owner 仍是调用 `useReducer` 的 Provider 组件实例。 |
| `C08` | 必须提供的 Context 可用 `null` 表示缺失，再由薄读取 Hook 做运行时检查和 TypeScript 收窄。 | `R03`、`R04`、`T01` | 不使用伪造空对象、类型断言或静态默认值隐藏 Provider 缺失。 |
| `C09` | 自定义读取 Hook 可以复用 `useContext`，但仍必须在组件或其他自定义 Hook 顶层调用。 | `R03`、`R10` | 本课只复用 I06 已学的两个薄读取 Hook，不扩展新的 Hook 设计主题。 |
| `C10` | 多个组件必须协调的同一事实应由最近共同 owner 保存；单一使用者的草稿或开关应保持局部。 | `R06`、`R07` | 单一事实来源不等于所有页面 State 都进入一个 Provider。 |
| `C11` | 任务计数、筛选结果和由 ID 查出的当前任务可以从 State 同步计算，不另存 State。 | `R08` | 不使用 Effect 或缓存维持这些派生结果。 |
| `C12` | reducer 更新任务数组时应创建新数组，并只替换实际变化的任务对象。 | `R01`、`R09` | 不引入 Immer 或其他不可变数据依赖。 |
| `C13` | 以共同字面量 `type` 定义 Action 判别联合后，`switch` 分支可自动收窄专属载荷。 | `T01` | 不引入类命令、事件总线或状态机库。 |
| `C14` | `never` 可在 `switch` 末尾形成穷尽检查；新增 Action 而漏写 reducer 分支时应产生类型错误。 | `T01` | 该检查属于 TypeScript 合同，不替代运行时交互验收。 |
| `C15` | 两个同名 Provider 实例分别拥有自己的 reducer State；要共享同一事实，消费者必须位于同一个共同 Provider 实例下。 | `R05`、`R06` | IL2 使用一个工作区 Provider，不重复 I06 的嵌套 Provider 教学。 |

## 四、已学知识清单与禁止项

### 1. 必须直接复用的已学知识

| 来源课程 | 已经学会的合同 | IL2 中的使用方式 |
| --- | --- | --- |
| I04 `useReducer` 与 Action | `useReducer` 签名、纯 reducer、不可变更新、事件式 Action、最小载荷、判别联合、穷尽检查、dispatch 快照 | 统一处理新增、状态变更、选择、删除、筛选和恢复初值。 |
| I05 Context | 模块顶层 `createContext`、React 19 Provider、`useContext`、最近祖先、静态默认值、同一对象身份 | 建立工作区 State 与 dispatch 两条通道，并限定到工作区子树。 |
| I06 Reducer 与 Context 组合 | State/dispatch Context 拆分、Provider 调用一次 reducer、薄读取 Hook、缺失 Provider、组件按职责读取 | 把接线移入独立 Provider 模块，让汇总、表单、筛选、列表和详情按需读取或派发。 |
| I07 状态共享边界 | owner/消费者/修改者、局部 State、最近共同父组件、Props/`children`、Provider 子树、派生值排除 | 决定哪些事实进入共享 reducer，哪些输入草稿和帮助开关继续局部。 |

还可以直接使用更早已学的 TSX、组件、Props、`children`、条件渲染、列表与稳定 key、事件、
`useState`、受控表单、不可变对象/数组更新和同步派生值。这些能力只服务于成品，不重新扩写为专题。

### 2. 明确禁止

- 不使用或讲解 `useRef`、DOM Ref、Callback Ref、ref prop；这些属于 I08 及后续范围。
- 不使用 Effect、Effect 清理、Effect 依赖或任何以 Effect 同步派生 State 的方案。
- 除 I06 已学的 `useWorkspaceState`、`useWorkspaceDispatch` 两个薄读取 Hook 外，不新增自定义 Hook
  主题或抽象。
- 不使用 `use`、`useMemo`、`useCallback`、`memo`、Transition、Action 表单、Suspense、Portal 或
  Error Boundary。
- 不引入 Redux、Zustand、MobX、XState、Immer、表单库、请求库或任何第三方状态方案。
- 不实现外部 Store、订阅、快照、selector、缓存、性能优化或 Context selector。
- 不发请求，不连接服务器，不做异步提交、认证、持久化、自动保存、离线、跨标签或多人同步。
- 不引入 Router、URL State、定时器、随机 ID、日期时间或浏览器存储。
- 不把“共享任务工作区”描述成真实多人协作系统；它是单页面内存 Demo。

## 五、真实任务工作区场景

### 1. 唯一产品目标

学习者完成一个纯客户端“项目任务工作区”。页面初始展示三条固定任务，任务分别由产品、前端和测试
角色负责，并处于待办、进行中或已完成状态。用户可以新增任务、选择负责人、改变任务状态、选择任务
查看详情、删除任务、按状态筛选，以及把共享工作区恢复为固定示例。

任务汇总、筛选栏、列表和详情位于不同组件层级，却必须读取同一份任务事实；新增表单只需要 dispatch，
不需要读取完整任务 State。新增标题与负责人是尚未提交的局部草稿，帮助说明也是局部开关。这个场景让
Reducer、Context、State 边界和模块化 Provider 都有可观察职责，而不是为了展示 API 人为拼接。

### 2. 页面可见区域

1. 工作区标题和一句产品语义明确的副标题。
2. 汇总区：任务总数、进行中数量、已完成数量；全部由当前任务数组同步派生。
3. 新增任务表单：受控标题、负责人选择和“添加任务”按钮。
4. 状态筛选：全部、待办、进行中、已完成，当前值可由文本或 `aria-pressed` 辨认。
5. 任务列表：标题、负责人、当前状态、选择按钮和删除按钮。
6. 任务详情：显示当前 `selectedTaskId` 对应任务；没有选择或已删除时显示明确空状态。
7. “恢复示例任务”按钮：只重置 Provider 拥有的共享工作区 State。
8. 局部帮助开关：证明不需要共享的 UI State 不进入 reducer，且工作区恢复不会改变它。

页面不显示课程编号、计划、批次、构建、测试、审查或操作教程文字。

### 3. 固定业务数据

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

const initialTasks: readonly WorkspaceTask[] = [
  { id: 1, title: '确认任务字段', owner: 'product', status: 'done' },
  { id: 2, title: '拆分 Provider 模块', owner: 'frontend', status: 'doing' },
  { id: 3, title: '核对状态边界', owner: 'qa', status: 'todo' },
]
```

- ID 是稳定业务身份，列表使用 `key={task.id}`。
- 负责人和状态的显示标签由模块常量映射，不复制进任务 State。
- 新任务从 `nextTaskId` 取得 ID，不能使用数组长度、标题、索引、时间戳或随机值。
- 初始数组与初始 State 视为只读模板；恢复时创建新的 State/数组值，不允许 reducer 修改模板。

## 六、State 模型与 Action 判别联合

### 1. 共享 State

```ts
type WorkspaceState = {
  readonly tasks: readonly WorkspaceTask[]
  readonly filter: TaskFilter
  readonly selectedTaskId: number | null
  readonly nextTaskId: number
}

const initialWorkspaceState: WorkspaceState = {
  tasks: initialTasks,
  filter: 'all',
  selectedTaskId: 2,
  nextTaskId: 4,
}
```

四项都是真实源事实：

- `tasks` 是共享任务集合。
- `filter` 由筛选控件修改，并决定列表显示范围。
- `selectedTaskId` 连接列表选择和详情面板，但不复制完整任务对象。
- `nextTaskId` 保证一次恢复周期内的新增 ID 单调且不与删除后的 ID 重复；恢复会重建初值并开启新的
  身份周期，上一周期的任务已整体退出当前 State。

以下值必须在 render 中派生：`totalCount`、`doingCount`、`doneCount`、`visibleTasks`、
`selectedTask`、负责人标签、状态标签、空列表提示和表单按钮可用性。

### 2. Action 判别联合

```ts
type WorkspaceAction =
  | { type: 'task/added'; title: string; owner: TaskOwner }
  | { type: 'task/statusChanged'; taskId: number; status: TaskStatus }
  | { type: 'task/selected'; taskId: number }
  | { type: 'task/deleted'; taskId: number }
  | { type: 'filter/changed'; filter: TaskFilter }
  | { type: 'workspace/reset' }
```

- `type` 描述已经发生的产品事件，不使用 `setTasks`、`patchState` 或 `updateField`。
- 每个联合成员只携带该分支需要的新事实；不传完整 State、完整旧任务或浏览器事件对象。
- `task/added` 在 reducer 内使用当前 `nextTaskId` 创建待办任务并递增 ID；事件入口负责先
  `trim()` 标题。
- `task/statusChanged` 只替换目标任务；不存在目标时返回原 State。
- `task/selected` 只由现有任务的选择按钮派发。
- `task/deleted` 删除目标；若目标正被选择，则把 `selectedTaskId` 设为 `null`。
- `filter/changed` 不修改任务或当前选择；详情不因列表筛选而丢失选择。
- `workspace/reset` 恢复确定的任务、筛选、选择和下一个 ID，不重置 Provider 外或子组件局部 State。

### 3. 转换表

| 当前事件 | Action | 必须变化 | 必须保持 |
| --- | --- | --- | --- |
| 提交有效新任务 | `task/added` | 追加待办任务、`nextTaskId + 1` | 当前筛选、当前选择 |
| 修改任务状态 | `task/statusChanged` | 目标任务的 `status` | 其他任务对象、筛选、选择、下一个 ID |
| 选择任务 | `task/selected` | `selectedTaskId` | 任务、筛选、下一个 ID |
| 删除普通任务 | `task/deleted` | 移除目标任务 | 当前选择、筛选、下一个 ID |
| 删除当前任务 | `task/deleted` | 移除目标任务并清空选择 | 筛选、下一个 ID |
| 切换筛选 | `filter/changed` | `filter` | 任务、选择、下一个 ID |
| 恢复示例 | `workspace/reset` | 四项共享 State 回到固定初值 | 新增表单草稿、帮助开关 |

### 4. Reducer 最小合同

```ts
/** 根据工作区 Action 纯计算下一份共享 State。 */
function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
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
    case 'task/statusChanged': {
      if (!state.tasks.some((task) => task.id === action.taskId)) return state
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.taskId ? { ...task, status: action.status } : task,
        ),
      }
    }
    case 'task/selected':
      return state.tasks.some((task) => task.id === action.taskId)
        ? { ...state, selectedTaskId: action.taskId }
        : state
    case 'task/deleted': {
      if (!state.tasks.some((task) => task.id === action.taskId)) return state
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.taskId),
        selectedTaskId:
          state.selectedTaskId === action.taskId ? null : state.selectedTaskId,
      }
    }
    case 'filter/changed':
      return { ...state, filter: action.filter }
    case 'workspace/reset':
      return { ...initialWorkspaceState, tasks: [...initialTasks] }
    default: {
      const unhandledAction: never = action
      return unhandledAction
    }
  }
}
```

这段代码冻结的是转换语义，不要求未来正文逐行照抄。实现可以在不改变 Action、State、纯度、不可变更新
和验收结果的前提下调整函数排列。

## 七、State/dispatch Context 拆分

### 1. 两条通道

```tsx
import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react'

const WorkspaceStateContext = createContext<WorkspaceState | null>(null)
const WorkspaceDispatchContext = createContext<Dispatch<WorkspaceAction> | null>(null)

/** 读取最近工作区 Provider 的 State，并显式暴露缺失边界。 */
export function useWorkspaceState(): WorkspaceState {
  const state = useContext(WorkspaceStateContext)
  if (state === null) throw new Error('useWorkspaceState 必须在 WorkspaceProvider 内使用')
  return state
}

/** 读取最近工作区 Provider 的 dispatch，并显式暴露缺失边界。 */
export function useWorkspaceDispatch(): Dispatch<WorkspaceAction> {
  const dispatch = useContext(WorkspaceDispatchContext)
  if (dispatch === null) {
    throw new Error('useWorkspaceDispatch 必须在 WorkspaceProvider 内使用')
  }
  return dispatch
}

/** 拥有工作区 reducer State，并向同一子树提供读取与更新通道。 */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, initialWorkspaceState)

  return (
    <WorkspaceStateContext value={state}>
      <WorkspaceDispatchContext value={dispatch}>{children}</WorkspaceDispatchContext>
    </WorkspaceStateContext>
  )
}
```

### 2. 拆分后的依赖

| 组件 | State Context | dispatch Context | 局部 State |
| --- | ---: | ---: | ---: |
| `WorkspaceSummary` | 是 | 否 | 否 |
| `TaskComposer` | 否 | 是 | 标题、负责人草稿 |
| `TaskFilterBar` | 是 | 是 | 否 |
| `TaskList` | 是 | 是 | 否 |
| `TaskDetails` | 是 | 是 | 否 |
| `RestoreWorkspaceButton` | 否 | 是 | 否 |
| `WorkspaceHelp` | 否 | 否 | 展开/收起 |

拆分的教学目标是让依赖方向可见：只展示的组件不获得更新能力，只提交命令的组件不需要完整 State。
本课不宣称拆分必然减少 render，也不加入 `memo`、选择器或 Provider value 缓存。

## 八、模块化 Provider 的最小职责与作用域

### 1. 最小职责

`WorkspaceProvider` 模块只承担以下职责：

1. 定义或导入 `WorkspaceState`、`WorkspaceAction`、初始 State 与纯 reducer。
2. 在模块顶层创建 State Context 和 dispatch Context。
3. 在 Provider 组件顶层调用一次 `useReducer`。
4. 把当前 State 与 dispatch 提供给同一 `children` 子树。
5. 导出两个 I06 已学形式的薄读取 Hook，并在缺少 Provider 时抛出明确错误。

它不渲染标题、表单、列表、详情或按钮，不保存表单草稿，不计算筛选结果，不发请求，不写存储，不记录
日志，不创建全局单例，也不承担样式和性能优化。

### 2. Provider 作用域

```text
LabSharedTaskWorkspaceDemo
|- WorkspaceHelp                         <- 局部 useState，不读 Context
`- WorkspaceProvider                    <- 唯一共享 State owner
   `- WorkspaceShell                    <- 只组织 children
      |- WorkspaceSummary               <- 只读
      |- TaskComposer                    <- 只写 + 局部草稿
      |- TaskFilterBar                   <- 读写
      |- TaskList                        <- 读写
      |- TaskDetails                     <- 读写
      `- RestoreWorkspaceButton          <- 只写
```

Provider 位于所有共享消费者的最近共同祖先，但不包住完全不需要工作区 State 的帮助区。IL2 只使用一个
Provider 实例，不用并列或嵌套实例重复证明 I06 已学的隔离规则。

### 3. 最小文件职责建议

| 文件 | 唯一职责 |
| --- | --- |
| `workspace-model.ts` | 类型、固定初值、Action 联合与纯 reducer。 |
| `workspace-provider.tsx` | 两条 Context、`WorkspaceProvider` 与两个薄读取 Hook。 |
| `workspace-panels.tsx` | 汇总、表单、筛选、列表、详情、恢复按钮和帮助区。 |
| `lab-shared-task-workspace-demo.tsx` | 用一个 Provider 组合最终页面，不拥有共享业务 State。 |
| `lab-shared-task-workspace-demo.css` | 当前 Demo 样式；使用 Flexbox、margin 和正常文档流，不使用 CSS Grid 或 `gap`。 |

这五个文件符合现有实战的多文件同源展示习惯。若实现后职责足够短，可合并展示组件文件，但 Provider
接线与页面组合应保持可辨认边界，不建立额外目录层或通用状态框架。

## 九、状态所有权边界

| 数据 | 是否 State | owner | 读取者 | 修改入口 | 理由 |
| --- | --- | --- | --- | --- | --- |
| 固定负责人/状态选项 | 否 | 模块常量 | 表单、列表、详情 | 无 | 产品静态数据。 |
| `tasks` | 是 | `WorkspaceProvider` | 汇总、列表、详情 | 新增、状态变化、删除、恢复 Action | 多个深层组件协调同一任务事实。 |
| `filter` | 是 | `WorkspaceProvider` | 筛选栏、列表 | 筛选 Action、恢复 Action | 控件和列表必须共享当前筛选。 |
| `selectedTaskId` | 是 | `WorkspaceProvider` | 列表、详情 | 选择、删除、恢复 Action | 列表选择与详情由同一 ID 协调。 |
| `nextTaskId` | 是 | `WorkspaceProvider` | reducer | 新增、恢复 Action | 属于任务集合的内存身份分配。 |
| 新任务标题 | 是 | `TaskComposer` | 表单 | 输入与成功提交后清空 | 未提交草稿只有表单使用。 |
| 新任务负责人 | 是 | `TaskComposer` | 表单 | 选择与成功提交后恢复默认 | 未提交草稿不需要其他组件协调。 |
| 帮助展开状态 | 是 | `WorkspaceHelp` | 帮助区 | 帮助按钮 | 与任务业务无关，保持最小局部边界。 |
| 汇总数量 | 否 | render 派生 | 汇总 | 无 | 可由 `tasks` 同步计算。 |
| `visibleTasks` | 否 | render 派生 | 列表 | 无 | 可由 `tasks + filter` 同步计算。 |
| `selectedTask` | 否 | render 派生 | 详情 | 无 | 可由 `tasks + selectedTaskId` 查找。 |

关键边界结论：共享 reducer 不是页面所有 State 的收纳箱；它只拥有确实需要跨工作区组件协调的事实。
组件可以同时处于 Provider 子树内并拥有自己的局部 `useState`。

## 十、可观察 Demo 交互与验收清单

### 1. 固定交互序列

所有浏览器行为验收从刷新后的固定初值开始：

| 步骤 | 操作 | 必须观察到的结果 |
| ---: | --- | --- |
| `0` | 初始加载 | 显示 3 条任务；总数 3、进行中 1、已完成 1；筛选为“全部”；详情选中“拆分 Provider 模块”。 |
| `1` | 展开帮助 | 帮助内容显示；任务、筛选和详情不变。 |
| `2` | 标题只输入空格 | “添加任务”保持 disabled，不产生 Action。 |
| `3` | 输入“补充验收清单”，负责人选择“测试”，提交 | 列表新增 ID 4 的待办任务；总数变 4；表单草稿清空并恢复默认负责人；其他任务不变。 |
| `4` | 选择新任务 | 详情显示“补充验收清单”、测试、待办；列表对应项有明确选中状态。 |
| `5` | 把新任务改为“进行中” | 列表与详情同步显示进行中；进行中数量变 2。 |
| `6` | 筛选“已完成” | 列表只显示初始已完成任务；汇总仍基于全部任务显示总数 4；当前详情仍显示已选的新任务。 |
| `7` | 在已完成列表选择“确认任务字段” | 详情切换到该任务，其他任务和筛选不变。 |
| `8` | 删除当前任务 | 已完成列表进入空状态；详情进入“未选择任务”状态；总数变 3、已完成变 0。 |
| `9` | 切回“全部” | 显示剩余 3 条任务；没有自动选择，详情继续为空。 |
| `10` | 在新增标题输入“尚未提交”，再次展开或保持帮助，然后点击“恢复示例任务” | 共享 State 回到初始 3 条、全部筛选、选中 ID 2；未提交标题和帮助开关保持原值。 |
| `11` | 提交“尚未提交” | 使用恢复后的 `nextTaskId=4` 新增一次；没有重复 key 或旧删除残留。 |

### 2. 行为验收

- 任务总数、各状态数量、筛选列表和详情始终来自同一份 Provider State，没有不同步副本。
- 新增、状态变化、选择、删除、筛选和恢复都只派发一个语义完整的 Action。
- 标题在事件入口 `trim()` 后非空才派发；reducer 不接收 DOM 事件。
- 删除当前任务同时清空选择；删除非当前任务保持原选择。
- 筛选不会删除任务、改变选择或改写汇总口径；详情是否显示不依赖当前筛选。
- 空筛选结果与空详情都有明确文本，不只显示空白区域。
- `workspace/reset` 只重置共享 reducer State，局部表单草稿和帮助开关保持。
- 所有普通按钮明确使用 `type="button"`；表单只由 `submit` 入口添加一次任务。
- 任务列表使用稳定 `task.id` 作为 key，不使用索引、标题、随机数或时间戳。
- State 与 dispatch Context 来自同一个 Provider；任何读取 Hook 都在组件顶层调用。
- 展开源码包含实际运行的 TS、TSX 与 CSS 全部文件，顺序稳定且文件名清楚。

### 3. 页面与质量验收

- Demo ID 建议为
  `react.core.learn.intermediate.lab-shared-task-workspace.shared-task-workspace-demo`，正文引用与
  demo manifest 完全一致。
- entry manifest、demo manifest 与 Track 原子登记；Track 位置固定在 I07 之后、I08 之前。
- 正文前置课程至少覆盖 I04、I05、I06、I07；`related` 只引用实际存在且确有帮助的已学课程。
- TSX/CSS 同源展示，不复制一份失真的教学源码。
- 样式不使用 CSS Grid、`gap`、负字间距或 viewport 宽度字体缩放。
- 桌面、`390px` 与 `390px + 32px` 根字号下无页面/Demo 横向溢出、文字裁切、控件重叠或不可达
  操作；状态不能只靠颜色表达。
- console error/warning、page error、失败请求和 `>=400` 响应均为 `0`。
- 后续实现按仓库要求完成聚焦格式、type-check、lint、空测试目录命令、build、浏览器验证和复杂修改
  审查；临时验证资产只放 `/tmp` 并在成功后删除。

## 十一、现有资产审计

### 1. IL2 目标资产

| 资产 | 当前事实 | 后续 IL2 处理 |
| --- | --- | --- |
| 权威计划 | IL2 已定义为“实战：共享任务工作区”，范围是 Reducer、Context、状态边界、模块化 Provider；执行日志标记未开始。 | 保留 ID、标题、范围和 I07 后/I08 前顺序。 |
| 本研究文件 | 调研开始前不存在。 | 本轮新建当前文件。 |
| 课程正文 | `learn/lab-shared-task-workspace.md` 不存在。 | 实现阶段新建，不复用 I06 正文充当实战。 |
| Demo 目录 | `demos/lab-shared-task-workspace/` 不存在。 | 实现阶段按最小职责新建多文件同源 Demo。 |
| entry manifest | 没有 IL2 import 或 entry。 | 实现阶段在 I07 后、I08 前登记。 |
| demo manifest | 没有 IL2 source bundle 或 Demo ID。 | 实现阶段登记真实运行文件组合 loader。 |
| Track | 没有 IL2 条目；当前顺序由 I07 直接进入 I08。 | 实现阶段在两者之间登记 `available`。 |
| 进度迁移 | IL2 是全新实战，无旧 ID 合并来源。 | 不新增旧课程迁移组。 |

### 2. 前置资产

| 资产 | 可复用 | 不应复制 |
| --- | --- | --- |
| I04 当前任务看板 | 判别联合 Action、纯 reducer、数组不可变更新、恢复初值。 | Action 日志、纯度重放、初始化专题和 I04 全量讲解。 |
| I05 Context 树 Demo | 最近 Provider、明确缺失值、React 19 Provider 写法。 | 默认值、显式 `undefined`、`memo` 等 Context 专题实验。 |
| I06 任务 Context Demo | 两条 Context、Provider、薄读取 Hook、只读/只写组件。 | 现有“任务工作区”的单文件概念示例和嵌套 Provider 对照；IL2 必须形成更完整产品和模块边界。 |
| I07 文档审阅 Demo | 局部、提升、Context 三种所有权判断。 | 再做一组三段式边界讲解；IL2 应把边界落实在一个产品内。 |
| IL1 多步骤编辑器 | 多文件真实运行源码、稳定 ID、固定交互序列、完整空状态与窄屏验收。 | 模板、步骤、key 重置和编辑器产品功能。 |
| 既有基础实战 | `demo-manifest` 组合 loader、完整限定 Demo ID、TSX/CSS 同源展示。 | 原课程业务数据和视觉结构。 |

审计结论：IL2 的研究、正文、Demo 和注册资产都需要新建；只复用既有知识合同和仓库接线习惯，不移动、
合并或删除 I04-I07 资产。

## 十二、十个高价值易错点

### 1. 各面板分别保存任务副本

- **触发条件：** 汇总、列表和详情各自调用 `useState` 保存任务数组或当前任务。
- **原因：** 同一业务事实出现多个 owner，组件间没有唯一更新入口。
- **后果：** 删除或改状态后，数量、列表和详情互相矛盾。
- **错误示例：** `TaskList` 与 `TaskDetails` 各自声明 `const [tasks, setTasks] = useState(...)`。
- **正确示例：** 由一个 `WorkspaceProvider` 的 reducer 保存 `tasks`，所有读取方使用 State Context。
- **适用版本：** React 19.2。
- **来源：** `R06`、`R08`。

### 2. 把未提交表单草稿和帮助开关放进共享 reducer

- **触发条件：** 因为组件位于 Provider 内，就把标题输入、负责人草稿和帮助开关全部加入
  `WorkspaceState`。
- **原因：** Provider 子树范围不等于每份 State 的最小所有权范围。
- **后果：** Action 与 reducer 被无关局部交互淹没，恢复工作区的语义也变得含糊。
- **错误示例：** `dispatch({ type: 'draft/titleChanged', title })` 只为一个表单输入服务。
- **正确示例：** 表单草稿由 `TaskComposer` 的 `useState` 拥有，帮助开关由 `WorkspaceHelp` 拥有；
  有效提交才派发 `task/added`。
- **适用版本：** React 19.2。
- **来源：** `R06`、`R07`、`R08`。

### 3. 保存汇总、筛选结果或完整选中任务

- **触发条件：** 已有 `tasks`、`filter`、`selectedTaskId`，又保存 `doneCount`、`visibleTasks` 或
  `selectedTask`。
- **原因：** 这些值能由当前 State 在 render 中同步计算，不是独立源事实。
- **后果：** 每次任务变化都要手动同步多个字段，漏掉任一路径就显示旧结果。
- **错误示例：** `const [visibleTasks, setVisibleTasks] = useState(initialTasks)`。
- **正确示例：** render 时 `tasks.filter(...)`、`tasks.find(...)` 和 `tasks.filter(...).length`。
- **适用版本：** React 19.2。
- **来源：** `R08`。

### 4. reducer 原地修改任务数组或任务对象

- **触发条件：** 在 `task/statusChanged` 中直接写 `task.status = action.status`，或使用 `push`、
  `splice` 修改 `state.tasks`。
- **原因：** React State 中的数组和对象应视为只读，reducer 还必须保持纯净。
- **后果：** 旧 State 被污染，StrictMode 重放与 `Object.is` 判断无法可靠揭示真实变化。
- **错误示例：** `state.tasks.push(newTask); return state`。
- **正确示例：** 添加用 `[...state.tasks, newTask]`，替换用 `map`，删除用 `filter`，并返回新的
  `WorkspaceState`。
- **适用版本：** React 19.2。
- **来源：** `R01`、`R02`、`R09`。

### 5. 用宽泛字段袋代替 Action 判别联合

- **触发条件：** 所有分支共享 `type: string`，其余 `taskId`、`title`、`owner`、`status` 都设为可选。
- **原因：** `type` 与专属载荷没有类型绑定，非法组合仍能通过调用处。
- **后果：** reducer 内充满非空断言，新增分支也无法获得可靠穷尽检查。
- **错误示例：** `type Action = { type: string; taskId?: number; title?: string }`。
- **正确示例：** 为六个事件定义独立联合成员，并在 `default` 将剩余 `action` 赋给 `never`。
- **适用版本：** React 19.2 与 TypeScript。
- **来源：** `R01`、`R02`、`T01`。

### 6. 在 reducer 或 Provider 接线中执行外部工作

- **触发条件：** reducer 写 `localStorage`、发请求、生成时间戳，或 Provider 负责日志、同步和缓存。
- **原因：** reducer 在 render 更新流程中计算 State，必须纯净；Provider 的最小职责只是拥有 State
  并提供通道。
- **后果：** StrictMode 开发检查可能重复外部操作，模块职责无法独立理解和验证。
- **错误示例：** 在 `workspace/reset` 分支调用 `localStorage.clear()`。
- **正确示例：** reducer 只返回固定初值；本实战完全不实现外部工作，Provider 只接线。
- **适用版本：** React 19.2。
- **来源：** `R01`、`R02`、`R03`。

### 7. 用伪造默认值或半套 Provider 隐藏缺失边界

- **触发条件：** 为 State Context 填空对象、为 dispatch Context 填空函数，或只提供其中一条通道。
- **原因：** 读取组件无法区分真实 Provider 与伪造 fallback，两条依赖还可能来自不同作用域。
- **后果：** UI 看似可运行却不更新，错误直到用户操作才静默暴露。
- **错误示例：** `createContext({ tasks: [], filter: 'all', selectedTaskId: null, nextTaskId: 1 })`
  与 `createContext(() => {})`。
- **正确示例：** 两条 Context 都以 `null` 表示缺失，由同一个 `WorkspaceProvider` 提供，并由两个薄
  Hook 抛出明确错误。
- **适用版本：** React 19.2 与 TypeScript。
- **来源：** `R03`、`R04`、`R05`、`T01`。

### 8. Provider 作用域过高，或并列两个实例却期待共享

- **触发条件：** 把工作区 Provider 放到整个应用根部，或让列表和详情分别位于两个
  `WorkspaceProvider` 中。
- **原因：** Provider 应贴合真实消费者的共同子树；两个组件实例拥有相互隔离的 reducer State。
- **后果：** 无关页面获得任务依赖，或列表更新后详情仍读取另一份 State。
- **错误示例：** `<WorkspaceProvider><TaskList /></WorkspaceProvider>` 与
  `<WorkspaceProvider><TaskDetails /></WorkspaceProvider>` 并列。
- **正确示例：** 一个 Provider 包住工作区汇总、表单、筛选、列表、详情和恢复按钮；帮助区留在外部。
- **适用版本：** React 19.2。
- **来源：** `R05`、`R06`、`R07`。

### 9. 在事件处理器或条件分支中调用读取 Hook

- **触发条件：** 点击按钮后才调用 `useWorkspaceDispatch()`，或只在有选中任务时调用
  `useWorkspaceState()`。
- **原因：** 自定义读取 Hook 内部调用 `useContext`，仍受 Hooks 顶层调用规则约束。
- **后果：** Hook 调用顺序不稳定，React 会报告非法 Hook 调用或产生不可预测行为。
- **错误示例：** `function handleDelete() { const dispatch = useWorkspaceDispatch() }`。
- **正确示例：** 在组件函数顶层取得 `dispatch`，事件处理器只调用已取得的函数。
- **适用版本：** React 19.2。
- **来源：** `R03`、`R10`。

### 10. 把双 Context 宣称成性能优化

- **触发条件：** 仅凭 State/dispatch 拆分，就承诺只写组件不会 render 或整个工作区自动更快。
- **原因：** 官方模式首先表达依赖职责；实际 render 还取决于组件树、Props、父组件更新和 Context
  value，不存在本课已证明的性能结论。
- **后果：** 学习者把结构选择建立在未经测量的承诺上，并提前引入 `memo`、缓存或 selector。
- **错误示例：** “拆成两个 Context 后所有 dispatch 组件永远不会重新渲染。”
- **正确示例：** “拆分让组件可以只读取 State 或只取得 dispatch；本实战不做性能承诺或优化。”
- **适用版本：** React 19.2。
- **来源：** `R02`、`R03`、`R05`。

## 十三、本科范围

### 1. 必须掌握

- 从真实用户操作列出固定数据、共享 State、局部 State、同步派生值和 Action。
- 用判别联合绑定 Action `type` 与专属载荷，并用 `never` 检查 reducer 分支。
- 编写纯 reducer，使用展开、`map` 和 `filter` 完成不可变数组/对象更新。
- 解释 dispatch 后当前变量仍是旧快照，界面在后续 render 读取下一份 State。
- 创建 State Context 和 dispatch Context，并由一个模块化 Provider 提供。
- 让只读、只写和读写组件分别取得需要的通道。
- 用 `null` 和薄读取 Hook 暴露 Provider 缺失，并遵守 Hooks 顶层规则。
- 为任务、筛选、选择、表单草稿和帮助开关确定最小 owner。
- 从共享 State 派生数量、可见任务和当前任务，不保存副本。
- 用一个可复跑操作序列验证跨组件一致性、恢复边界和空状态。

### 2. 只需知道的边界

- Context 是 Provider 子树内的传递通道，不是动态 State owner 或全局 Store。
- I07 已经说明外部 Store 适用于 React 外部可订阅数据源；本实战的数据由 React Provider 拥有，
  不进入外部 Store 实现。
- 双 Context 是官方且适合本场景的组合模式，但不是 React 对所有应用的强制结构。
- 固定源码能印证 Context/Provider 对象关系和 dispatch 稳定身份；学习者不依赖任何私有字段或函数名。

### 3. 不要求掌握

- `useRef`、DOM 节点、Callback Ref、ref prop，以及 I08 或后续课程主题。
- Effect、请求、订阅、计时器、持久化、外部 Store、缓存和服务器状态。
- 第三方状态库、状态机、命令总线、事件溯源、撤销/重做和离线同步。
- 多用户协作、权限、冲突合并、乐观更新、WebSocket 或实时连接。
- Context selector、Provider value memo 化、`memo`、`useMemo`、`useCallback` 或性能测量。
- Fiber、Hook queue、lane、并发调度、Context value 栈和 React 内部数据结构。

## 十四、IL2 实现建议

1. 先以本记录的固定数据、State、Action 和转换表建立纯模型，再接入 Provider；不要从 JSX 反推
   Action。
2. 保持 `workspace-model.ts` 与 `workspace-provider.tsx` 两个清楚边界，页面组件只负责渲染、局部
   草稿和派发意图。
3. 使用一个 Provider 包住全部共享消费者；不要为了展示作用域再增加嵌套 Provider。
4. 先完成初始汇总、列表和详情读取，再逐项接通新增、状态变化、选择、删除、筛选和恢复。
5. 最后加入局部表单草稿与帮助开关，并用“恢复示例任务后仍保持”证明边界。
6. 课程正文应围绕产品需求、建模、Action 流、Provider 模块、组件依赖、所有权和固定验收展开；不把
   I04-I07 的完整专题内容重复一遍。
7. Demo 沿用仓库现有同源组合 loader 和完整限定 ID；样式只使用 Flexbox、margin 与正常文档流。
8. 本课到上述合同即止，不引出 Ref、Effect、外部 Store、请求、持久化、性能优化或下一课内容。

## 十五、研究完成检查

- [x] 冻结课程 ID、标题、类型、版本和单文件写入边界。
- [x] 核对 I04-I07 已完成资产、权威 IL2 行、逐课 Gate 与当前 `32/74` 边界。
- [x] 记录 Tavily 失败原因、Exa 接替结果和官方原文核验路径。
- [x] 给出逐 Claim 一手来源、React `19.2` 公共合同和 `v19.2.8` 固定源码边界。
- [x] 冻结真实任务工作区、固定数据、State、Action、转换和派生值。
- [x] 冻结 State/dispatch Context、模块化 Provider 最小职责与作用域。
- [x] 冻结共享、局部和派生数据的所有权边界。
- [x] 给出可观察 Demo 操作序列、行为验收和页面质量验收。
- [x] 审计目标资产不存在，并区分 I04-I07/IL1 中可复用与不可复制的内容。
- [x] 给出不超过 10 个高价值易错点，且每项包含触发条件、原因、后果、错误示例、正确示例、适用
  版本和来源。
- [x] 明确本科范围和禁止项，不包含 I08 或后续课程实现建议。
