---
id: react.redux.learn.basics.task-filter-panel
type: lesson
title: 实战：任务筛选面板
summary: 综合 Feature 目录、slice、selector 与 React Redux Hooks，完成可切换筛选条件的任务面板。
domain: frontend
technology: react
module: redux
stage: basics
level: beginner
estimatedMinutes: 110
prerequisites:
  - react.redux.learn.basics.feature-folder-organization
  - react.redux.learn.basics.use-selector
  - react.redux.learn.basics.use-dispatch
  - react.redux.learn.basics.state-ownership
related: []
tags:
  - Redux Toolkit
  - React Redux
  - 实战
  - Feature folder
  - selector
  - 任务筛选
appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1、React Redux 9.3.0、React 19.2.8
verifiedAt: 2026-08-30
objectives:
  - 能把任务状态、筛选条件和 UI 组件组织在同一个 Feature 目录中。
  - 能用 createSlice 保存原始任务与筛选条件，并派发明确的 action。
  - 能用纯 selector 从 RootState 派生当前可见任务和统计数量。
  - 能让 Provider、预类型 Hooks、store 和 Feature 模块形成清晰的依赖方向。
  - 能通过交互验证全部、待完成、已完成三种视图及重置行为。
recap:
  - 任务数组和当前筛选条件是 Redux 中的源事实，筛选结果和数量由 selector 派生。
  - Feature 内集中维护 slice、selectors 和组件，app 目录只负责 store 与 Hooks 装配。
  - 组件通过预类型 Hooks 读取和派发，不直接导入 store 实例。
  - 切换筛选只改变视图，不修改完整任务数组；切换完成状态才会改变任务事实。
  - 空结果是合法视图，重置 action 应同时恢复任务和筛选条件。
sources:
  - title: Redux Essentials：App Structure
    url: https://redux.js.org/tutorials/essentials/part-2-app-structure
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0、React Redux 9.3.0
    claims:
      - 推荐使用 app 目录装配 store，使用 features 目录集中维护一个业务 Feature 的 Redux 逻辑和组件。
      - slice 可以集中维护某个 Feature 的 reducer、action 和相关选择器。
  - title: Redux Style Guide：Structure Files as Feature Folders or Ducks
    url: https://redux.js.org/style-guide#structure-files-as-feature-folders-or-ducks
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1
    claims:
      - 按业务功能组织文件比按 actions、reducers 等文件类型拆分更容易定位和维护。
      - Feature 目录应按主要数据域或业务能力命名，而不是按具体组件命名。
  - title: Redux Deriving Data with Selectors
    url: https://redux.js.org/usage/deriving-data-selectors
    sourceType: official-reference
    appliesTo: Redux 5.0.1、Redux Toolkit 2.12.0
    claims:
      - selector 可以从 state 读取值或计算派生值，派生值不需要重复存入 state。
      - 选择器可以集中封装状态结构，组件只读取视图所需的数据。
  - title: Redux Toolkit 2.12.0 createSlice API
    url: https://redux-toolkit.js.org/api/createSlice
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - createSlice 根据 name、initialState 和 reducers 生成 reducer 与 action creators。
  - title: Redux Toolkit 2.12.0 configureStore Source
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/configureStore.ts
    sourceType: source-code
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - configureStore 接收 reducer 映射并把每个映射键作为 RootState 的分支名称。
  - title: Redux Toolkit 2.12.0 configureStore Tests
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/tests/configureStore.test.ts
    sourceType: official-test
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 官方测试覆盖 reducer 映射组合和 dispatch 后状态更新。
  - title: React Redux 9.3.0 Usage with TypeScript
    url: https://react-redux.js.org/using-react-redux/usage-with-typescript
    sourceType: api-doc
    appliesTo: React Redux 9.3.0
    claims:
      - useSelector.withTypes 和 useDispatch.withTypes 可以从应用类型生成预类型 Hooks。
---

# 实战：任务筛选面板

## 一、学习目标

- 把任务状态、筛选条件、selector 和 UI 组件放进同一个 Feature 目录。
- 用 `createSlice` 保存源事实，并通过 action 表达筛选和任务状态变更。
- 用纯 selector 派生可见任务、当前数量和未完成数量。
- 通过 `Provider` 与预类型 Hooks 把 Feature 接入 React 组件树。
- 验证三种筛选视图、任务切换、空结果和重置行为。

## 二、为什么需要一个完整的筛选面板

单独学习 `createSlice`、`useSelector` 或 `useDispatch` 时，每个示例都很小，容易忽略它们在真实模块中的
连接方式。任务筛选面板把这些能力放到一个有限的业务边界里：任务数据需要被列表和统计读取，筛选条件
需要被控件和列表共同读取，而过滤后的数组和数量都可以从源事实计算出来。

这个面板不把筛选结果再存一份。Redux 只保存任务数组和当前筛选值，selector 在读取时计算可见任务。这样
切换筛选不会改写业务事实，切换任务完成状态才会改变任务数组。

## 三、核心模型

### 1. Feature 目录的文件职责

```text
task-filter-panel/
  app/
    store.ts       # 组合 tasks reducer，导出应用类型
    hooks.ts       # 导出预类型 dispatch/selector Hook
  features/tasks/
    tasksSlice.ts  # 任务 state、action 和 selector
    TasksPanel.tsx # 任务筛选控件与列表
  task-filter-panel-demo.tsx
```

`app` 只负责装配，`features/tasks` 负责任务业务。组件从 Feature 文件导入 action 和 selector，通过 `app/hooks`
读取 store；它不需要知道 store 是怎样组合的。

### 2. 源事实与派生结果

任务数组和筛选值是需要被 action 更新的源事实：

```ts
type TaskFilter = 'all' | 'open' | 'completed'

type TasksState = {
  items: Task[]
  filter: TaskFilter
}
```

`visibleTasks`、`visibleCount` 和 `openCount` 都能从这两个字段计算。它们没有独立的 setter，也不会因为
某个更新路径遗漏同步而变成过期副本。

### 3. action 与数据流

```text
筛选按钮 -> filterChanged(filter) -> tasks.filter
任务按钮 -> taskToggled(id) -> tasks.items
重置按钮 -> tasksReset() -> 初始任务与 all 筛选
```

每次 action 进入 slice reducer，selector 在下一次 render 读取新的 RootState。筛选 action 只改 `filter`，
因此完整任务数量保持不变；任务 action 只改指定任务的 `completed` 字段，因此当前筛选结果会随之变化。

## 四、实现步骤

### 1. 在 slice 中保存最小状态

```ts
const initialState: TasksState = {
  items: [
    { id: 'task-1', title: '阅读 Feature 目录规范', completed: true },
    { id: 'task-2', title: '为筛选条件定义 action', completed: false },
    { id: 'task-3', title: '验证 selector 的派生结果', completed: false },
  ],
  filter: 'all',
}
```

任务使用稳定 ID。筛选只是从同一个数组选择项，不改变任务的身份或顺序。

### 2. 定义 action

`filterChanged` 接收 `TaskFilter`，`taskToggled` 接收任务 ID，`tasksReset` 不需要 payload。action 的 payload
只表达事件需要的数据，不把组件对象或 DOM 节点放进 Redux。

### 3. 定义纯 selector

```ts
export const selectVisibleTasks = (state: RootState) => {
  const { items, filter } = state.tasks
  if (filter === 'open') return items.filter((task) => !task.completed)
  if (filter === 'completed') return items.filter((task) => task.completed)
  return items
}
```

selector 只读取输入并返回结果。`all` 直接复用原数组引用；其他筛选返回新数组。统计 selector 可以复用
`selectVisibleTasks`，不需要把数量放进 state。

### 4. 通过预类型 Hooks 连接组件

```tsx
const filter = useTaskFilterSelector(selectTaskFilter)
const tasks = useTaskFilterSelector(selectVisibleTasks)
const dispatch = useTaskFilterDispatch()
```

控件把合法筛选值派发给 `filterChanged`，任务按钮把稳定 ID 派发给 `taskToggled`。组件只依赖 Feature
公开的 action 和 selector，不直接调用 `store.getState()`。

### 5. 处理空结果和重置

已完成任务全部切换为待完成后，`completed` 视图应显示空结果提示；这不是异常。重置 action 应一次恢复
任务数组和筛选值，让面板回到可预测的初始状态。

## 五、Demo：观察筛选数据流

:::demo{id="react.redux.learn.basics.task-filter-panel.task-filter-panel-demo"}

Demo 初始显示 3 条任务，其中 2 条待完成。点击筛选按钮只改变可见列表和数量；点击任务行会改变该任务的
完成状态，并让当前筛选结果重新计算；点击“恢复初始状态”会同时恢复任务和筛选条件。Demo 的源码面板
按 `app/store.ts`、`app/hooks.ts`、`features/tasks/tasksSlice.ts`、`features/tasks/TasksPanel.tsx` 和
宿主文件展示实际运行的源码。
:::

## 六、易错使用提示

:::pitfalls
### 错误：把筛选结果保存为第二份 state

**触发条件：** 在 slice 中同时保存 `items`、`filter` 和 `visibleItems`，每次 action 都手动同步三者。

**原因：** 把可以由源事实计算的派生值当成独立业务事实。

**后果：** 某条更新路径忘记同步时，列表和任务数组会出现矛盾。

**错误示例：**

```ts
state.visibleItems = state.items.filter((task) => task.completed === state.filter)
```

**正确写法：**

```ts
const selectVisibleTasks = (state: RootState) => {
  const { items, filter } = state.tasks
  if (filter === 'open') return items.filter((task) => !task.completed)
  if (filter === 'completed') return items.filter((task) => task.completed)
  return items
}
```

**验证方式：** 切换筛选和任务状态后，只检查 `items` 与 `filter` 两个源字段，确认列表和数量仍能正确派生。

### 错误：筛选控件修改数组而不是派发 action

**触发条件：** 组件直接调用 `tasks.filter` 的结果或修改从 selector 得到的对象。

**原因：** 把 selector 返回值误认为组件拥有的可写数据。

**后果：** Redux 不会记录这次变化，其他订阅者也不会收到一致的更新。

**错误示例：**

```tsx
const tasks = useTaskFilterSelector(selectAllTasks)
tasks[0].completed = true
```

**正确写法：**

```tsx
dispatch(taskToggled(taskId))
```

**验证方式：** 点击任务按钮后，确认更新来自 Redux action，且其他 selector 读取到同一结果。

### 错误：用数组下标作为任务身份

**触发条件：** `key` 或 `taskToggled` 的参数使用 `index`。

**原因：** 下标描述当前视图位置，不描述任务本身。

**后果：** 筛选后同一位置对应不同任务，操作可能落到错误对象上。

**错误示例：**

```tsx
{tasks.map((task, index) => <button key={index} onClick={() => toggleTask(index)} />)}
```

**正确写法：**

```tsx
{tasks.map((task) => <button key={task.id} onClick={() => toggleTask(task.id)} />)}
```

**验证方式：** 先切换到一个筛选视图，再点击任务，确认 action payload 仍是该任务的稳定 ID。

### 错误：让 Feature 组件运行时导入 store 实例

**触发条件：** `TasksPanel` 直接导入 `store` 并调用 `store.dispatch()`。

**原因：** 混淆应用装配入口和业务 Feature API。

**后果：** 组件难以复用独立 Provider，测试和多实例嵌入也更困难。

**错误示例：**

```tsx
import { store } from '../../app/store'
store.dispatch(tasksReset())
```

**正确写法：**

```tsx
const dispatch = useTaskFilterDispatch()
dispatch(tasksReset())
```

**验证方式：** 在两个不同 store 的 Provider 下渲染同一个 Feature 组件，确认各自只更新自己的状态。

### 错误：把非法筛选值当成可扩展字符串

**触发条件：** 使用 `string` 保存 filter，并在 selector 中静默接受未知值。

**原因：** 没有把 UI 支持的筛选选项写进类型合同。

**后果：** 控件显示无对应标签，selector 可能退回错误分支。

**错误示例：**

```ts
type TasksState = { filter: string }
```

**正确写法：**

```ts
type TaskFilter = 'all' | 'open' | 'completed'
type TasksState = { filter: TaskFilter }
```

**验证方式：** 检查 action、selector 和控件选项均只能使用三个联合值。
:::

## 七、源码推导与适用场景

### 1. 官方事实

Redux Essentials 的应用结构示例把 `app/store.ts` 用作 store 装配入口，把 `features/<name>/` 用作单个业务
Feature 的 slice 和组件目录。Redux Style Guide 推荐按业务能力组织相关文件，而不是把所有 action、reducer
和组件分别集中到技术目录。

Redux Toolkit 2.12.0 的 `configureStore` 源码接收 reducer 映射，映射键成为 RootState 的分支；官方测试验证
组合后的 reducer 可以响应 dispatch 并生成更新后的状态。`createSlice` API 负责从一个 Feature 的 reducers
生成 action creators 和 reducer，因此本课把任务 action、reducer 和 selector 放在同一 Feature 文件中。

### 2. 课程推导

任务筛选面板适合使用一个 `tasks` Feature，因为任务数组、筛选条件、任务 action 和列表 UI 具有共同业务语义。
`app` 层只组合 reducer 和类型化 Hooks，组件层只消费 selector 和 action。这个边界让筛选逻辑可以在页面布局
变化时继续复用。

### 3. 适用边界

本课整合同步任务状态、基础 selector、Feature 目录和 React Redux Hooks。记忆化 `createSelector`、异步请求、
标准化实体、持久化和大型模块代码分割不在本课展开；需要这些能力时再引入对应课程中的专门设计。

## 八、练习

:::exercise
### 练习目标

**要求：** 创建一个 `tasks` Feature，使用 `createSlice` 保存三条任务和 `all/open/completed` 筛选值。定义
`filterChanged`、`taskToggled` 和 `tasksReset`，再定义 `selectVisibleTasks` 和 `selectOpenTaskCount` 两个
纯 selector。使用 `configureStore`、`Provider`、预类型 Hooks 和一个 React 组件完成筛选、切换任务与重置。答案
应包含可以直接运行的完整源码，不把筛选结果另存为 state。

**验收：** 初始显示 3 条任务和 2 条待完成；切换到“待完成”只显示 2 条；切换一条任务后待完成数量变为 1；
切换到“已完成”显示 2 条；点击重置后恢复初始任务和 `all` 筛选。selector 是纯函数，组件没有直接导入 store
实例，任务按钮使用稳定 ID。

**参考答案：**

```tsx
// task-filter-panel.tsx
import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { Provider, useDispatch, useSelector } from 'react-redux'
import type { ReactElement } from 'react'

type TaskFilter = 'all' | 'open' | 'completed'
type Task = { id: string; title: string; completed: boolean }
type TasksState = { items: Task[]; filter: TaskFilter }

const initialState: TasksState = {
  items: [
    { id: 'task-1', title: '阅读 Feature 目录规范', completed: true },
    { id: 'task-2', title: '为筛选条件定义 action', completed: false },
    { id: 'task-3', title: '验证 selector 的派生结果', completed: false },
  ],
  filter: 'all',
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    /** 设置筛选条件。 */
    filterChanged: (state, action: PayloadAction<TaskFilter>) => {
      state.filter = action.payload
    },
    /** 切换指定任务。 */
    taskToggled: (state, action: PayloadAction<string>) => {
      const task = state.items.find((item) => item.id === action.payload)
      if (task) task.completed = !task.completed
    },
    /** 恢复初始状态。 */
    tasksReset: () => initialState,
  },
})

const store = configureStore({ reducer: { tasks: tasksSlice.reducer } })
type RootState = ReturnType<typeof store.getState>
const useAppDispatch = useDispatch.withTypes<typeof store.dispatch>()
const useAppSelector = useSelector.withTypes<RootState>()

/** 选择当前筛选值。 */
const selectFilter = (state: RootState) => state.tasks.filter

/** 选择当前筛选后的任务。 */
const selectVisibleTasks = (state: RootState) => {
  const { items, filter } = state.tasks
  if (filter === 'open') return items.filter((task) => !task.completed)
  if (filter === 'completed') return items.filter((task) => task.completed)
  return items
}

/** 选择全部任务中的未完成数量。 */
const selectOpenTaskCount = (state: RootState) =>
  state.tasks.items.filter((task) => !task.completed).length

const filterLabels: Record<TaskFilter, string> = {
  all: '全部',
  open: '待完成',
  completed: '已完成',
}

/** 显示任务筛选面板。 */
function TasksPanel(): ReactElement {
  const dispatch = useAppDispatch()
  const filter = useAppSelector(selectFilter)
  const tasks = useAppSelector(selectVisibleTasks)
  const openCount = useAppSelector(selectOpenTaskCount)

  /** 派发筛选变更。 */
  function changeFilter(nextFilter: TaskFilter): void {
    dispatch(tasksSlice.actions.filterChanged(nextFilter))
  }

  /** 派发任务切换。 */
  function toggleTask(taskId: string): void {
    dispatch(tasksSlice.actions.taskToggled(taskId))
  }

  /** 派发重置。 */
  function resetPanel(): void {
    dispatch(tasksSlice.actions.tasksReset())
  }

  return (
    <section aria-label="任务筛选面板">
      <p>待完成：{openCount}</p>
      <div role="group" aria-label="任务筛选条件">
        {(Object.keys(filterLabels) as TaskFilter[]).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={filter === option}
            onClick={() => changeFilter(option)}
          >
            {filterLabels[option]}
          </button>
        ))}
      </div>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <button type="button" aria-pressed={task.completed} onClick={() => toggleTask(task.id)}>
              {task.completed ? '已完成' : '待完成'}：{task.title}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={resetPanel}>
        恢复初始状态
      </button>
    </section>
  )
}

/** 在 Provider 中挂载任务面板。 */
export function App(): ReactElement {
  return (
    <Provider store={store}>
      <TasksPanel />
    </Provider>
  )
}
```
:::

## 九、本节小结

- Feature 目录按业务能力集中 slice、selector、组件和相关类型。
- Redux 只保存任务数组和筛选条件，列表与统计由 selector 派生。
- 组件通过 Provider 下的预类型 Hooks 消费 Feature API，不直接持有 store 实例。
- 稳定 ID 同时用于 action payload 和列表 key，筛选不会改变任务身份。
- 空结果和重置都是明确的 UI 状态，应由 selector 和 action 直接表达。

## 十、参考资料

- [Redux Essentials：App Structure](https://redux.js.org/tutorials/essentials/part-2-app-structure) - 支持 app、features、slice 和组件的组织方式。
- [Redux Style Guide：Feature Folders](https://redux.js.org/style-guide#structure-files-as-feature-folders-or-ducks) - 支持按业务能力组织文件。
- [Redux Deriving Data with Selectors](https://redux.js.org/usage/deriving-data-selectors) - 支持派生筛选结果和统计值。
- [Redux Toolkit createSlice API](https://redux-toolkit.js.org/api/createSlice) - 支持 reducer 与 action creator 生成。
- [Redux Toolkit configureStore Source](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/configureStore.ts) - 支持 reducer 映射与 RootState 分支。
- [Redux Toolkit configureStore Tests](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/tests/configureStore.test.ts) - 支持组合 reducer 与 dispatch 更新。
- [React Redux Usage with TypeScript](https://react-redux.js.org/using-react-redux/usage-with-typescript) - 支持预类型 Hooks。
