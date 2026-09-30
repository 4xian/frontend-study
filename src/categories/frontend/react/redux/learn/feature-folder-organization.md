---
id: react.redux.learn.basics.feature-folder-organization
type: lesson
title: Feature 目录与模块组织
summary: 按业务能力集中维护 Redux 状态、组件和选择器，让模块边界清晰且便于演进。
domain: frontend
technology: react
module: redux
stage: basics
level: beginner
estimatedMinutes: 75
prerequisites:
  - react.redux.learn.basics.redux-devtools
related: []
tags:
  - Redux Toolkit
  - Feature folder
  - 模块组织
  - app 目录
  - slice
  - 依赖方向
appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1、React Redux 9.3.0、React 19.2.8
verifiedAt: 2026-08-30
objectives:
  - 能按业务 Feature 组织 slice、组件、selector 和相关测试源码。
  - 能说明 app、features 和 common 目录的职责边界。
  - 能让 Feature 内部集中维护业务逻辑，并通过 app 入口接入 store。
  - 能识别按文件类型拆分、跨 Feature 直接耦合和循环依赖等组织问题。
  - 能从目录结构追踪一个 action 从组件到 reducer 的依赖方向。
recap:
  - Feature folder 按业务能力集中相关状态逻辑、组件和选择器，目录名表达数据域而不是组件名。
  - app 目录负责 store、预类型 Hooks 等应用装配；features 目录负责业务能力；common 只放真正跨 Feature 的共享代码。
  - store 可以依赖 Feature reducer，Feature 通过类型导入 app 契约，避免反向导入 store 实例。
  - 目录组织不能替代运行时数据流，组件仍通过 Provider、selector 和 dispatch 访问 Redux。
  - 只有多个 Feature 共享且语义稳定的代码才应提升到 common，避免过早抽象。
sources:
  - title: Redux Style Guide：Structure Files as Feature Folders or Ducks
    url: https://redux.js.org/style-guide#structure-files-as-feature-folders-or-ducks
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1
    claims:
      - 推荐按 Feature folder 组织相关逻辑，把一个功能的 slice、action、reducer 和 selector 放在一起。
      - 按业务功能组织文件比按 action、reducer 等文件类型拆分更容易定位和维护。
  - title: Redux Essentials：App Structure
    url: https://redux.js.org/tutorials/essentials/part-2-app-structure
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0、React Redux 9.3.0
    claims:
      - app 目录集中放 store 配置和应用级 Hooks，features 目录放各个业务 Feature。
      - Feature 文件夹可以集中 slice、组件和相关逻辑，组件通过预类型 Hooks 使用 store。
  - title: Redux FAQ：Code Structure
    url: https://redux.js.org/faq/code-structure
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1、React Redux 9.3.0
    claims:
      - Redux 没有强制唯一的文件结构，但按功能组织代码通常更易扩展。
      - 需要注意模块之间的循环依赖，避免 store 和业务模块互相导入运行时值。
  - title: Redux Style Guide：文件和目录组织建议
    url: https://redux.js.org/style-guide
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1
    claims:
      - 全局状态逻辑应按主要数据域或业务 Feature 划分，而不是按组件划分。
      - 共享的 Redux 逻辑可以在 Feature 内集中导出，减少跨目录跳转。
  - title: Redux Toolkit Modernizing Redux Logic
    url: https://redux.js.org/usage/migrating-to-modern-redux
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1
    claims:
      - 现代 Redux 推荐使用 configureStore、createSlice 和 Feature folder，减少手写样板。
      - 迁移时可以按 Feature 逐步移动 reducer、action 和组件，而不是一次重写整个应用。
  - title: Redux Toolkit 2.12.0 configureStore Source
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/configureStore.ts
    sourceType: source-code
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - configureStore 接收 reducer 映射并创建统一 store，映射键决定 RootState 的分支名称。
  - title: Redux Toolkit 2.12.0 configureStore Tests
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/tests/configureStore.test.ts
    sourceType: official-test
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 官方测试验证 reducer 映射可以组合多个状态分支，并通过 store dispatch 驱动更新。
---

# Feature 目录与模块组织

## 一、学习目标

- 按业务 Feature 组织 slice、组件、selector 和相关测试源码。
- 说明 `app`、`features` 和 `common` 目录的职责边界。
- 让 Feature 内部集中维护业务逻辑，并通过应用入口接入 store。
- 识别按文件类型拆分、跨 Feature 直接耦合和循环依赖等组织问题。
- 从目录结构追踪一个 action 从组件到 reducer 的依赖方向。

## 二、为什么需要 Feature 目录

随着应用增加，按 `actions/`、`reducers/`、`components/` 分目录会把同一业务能力拆散。修改一个任务功能时，开发者需要在多个目录之间来回寻找 action、reducer、selector、组件和样式，依赖关系也不容易从目录看出来。

Feature folder 把同一个业务能力的代码放在一起。例如任务功能可以集中在 `features/tasks/`，其中包含 `tasksSlice.ts`、`TasksPanel.tsx` 和该功能的测试。目录名表达业务数据域，组件只是这个 Feature 的一个使用界面。

目录组织解决的是“代码在哪里、谁负责什么”的问题；Redux 运行时仍然遵循“组件 dispatch action -> reducer 计算新 state -> selector 读取 -> 组件更新”的单向数据流。

## 三、核心概念

### 1. Feature folder 是业务能力边界

一个 Feature folder 通常集中以下内容：

- slice 的初始状态、reducers 和 actions。
- 读取该 Feature 状态的 selectors。
- 只服务该 Feature 的组件、样式和测试。
- 与该 Feature 强相关的类型和小型辅助函数。

例如 `features/tasks/` 表示任务业务能力，而不是某个页面上的“左侧任务组件”。当页面布局改变时，任务状态仍然属于 `tasks` Feature。

### 2. `app`、`features` 和 `common` 的职责

可以把模块分为三层：

| 目录 | 主要职责 | 典型内容 |
| --- | --- | --- |
| `app/` | 应用装配和运行时入口 | `store.ts`、预类型 Hooks、Provider 入口 |
| `features/` | 业务能力及其内部逻辑 | `tasksSlice.ts`、任务组件、Feature 测试 |
| `common/` | 多个 Feature 真实共享的稳定能力 | 通用 UI、日期格式化、跨业务基础类型 |

`common` 不是“暂时不知道放哪里”的目录。如果代码只被一个 Feature 使用，先留在该 Feature 中；当多个 Feature 共享且语义稳定时，再提升到 `common`。

### 3. 依赖方向比目录名称更重要

应用装配入口可以组合 Feature reducer：

```ts
// app/store.ts
import { configureStore } from '@reduxjs/toolkit'
import tasksReducer from '../features/tasks/tasksSlice'

export const store = configureStore({
  reducer: { tasks: tasksReducer },
})
```

Feature 组件通过 `app/hooks.ts` 使用类型化 Hooks，slice 只在需要推导 `RootState` 时以 `import type` 读取类型。这样不会让 Feature 在运行时导入 store 实例，也不会让 store 反过来导入组件。

## 四、用法与示例

### 1. 先定义 Feature 的公开入口

slice 文件可以同时维护状态类型、初始值、reducers、actions 和 selectors：

```ts
// features/tasks/tasksSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

type Task = { id: string; title: string; completed: boolean }
type TasksState = { items: Task[] }

const initialState: TasksState = { items: [] }

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    /** 切换任务完成状态。 */
    taskToggled: (state, action: PayloadAction<string>) => {
      const task = state.items.find((item) => item.id === action.payload)
      if (task) task.completed = !task.completed
    },
  },
})

/** 读取任务列表。 */
export const selectTasks = (state: RootState) => state.tasks.items

export const { taskToggled } = tasksSlice.actions
export default tasksSlice.reducer
```

这里的 `default` 导出供 `app/store.ts` 组合，actions 和 selectors 是 Feature 给组件使用的公开入口。没有使用者的内部类型和辅助函数可以保持非导出，避免扩大模块 API。

### 2. 让组件只依赖 Feature API

Feature 组件读取 selector 并派发 action，不需要知道 store 是怎样组合的：

```tsx
// features/tasks/TasksPanel.tsx
import type { ReactElement } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { selectTasks, taskToggled } from './tasksSlice'

/** 显示任务并派发任务 Feature action。 */
export function TasksPanel(): ReactElement {
  const tasks = useAppSelector(selectTasks)
  const dispatch = useAppDispatch()

  /** 切换任务完成状态。 */
  function toggleTask(taskId: string): void {
    dispatch(taskToggled(taskId))
  }

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          <button type="button" onClick={() => toggleTask(task.id)}>
            {task.title}
          </button>
        </li>
      ))}
    </ul>
  )
}
```

组件可以位于页面、布局或 Feature 目录中，但业务状态的定义和更新逻辑仍集中在 `features/tasks/`。当另一个组件需要任务数据时，它复用 selector 和 action，而不是复制一份状态。

### 3. 何时提取到 `common`

提取前先验证使用范围和语义：

1. 只有一个 Feature 使用的代码，保留在 Feature 内。
2. 两个或更多 Feature 需要相同能力，并且名字不依赖某个业务域时，才考虑放入 `common`。
3. 如果共享代码需要知道某个 Feature 的内部 state，优先让 Feature 导出 selector，而不是让 `common` 直接读取内部结构。

例如通用的日期格式化器可以进入 `common`；只用于任务排序的函数应该留在 `features/tasks/`。

## 五、Demo：沿依赖方向观察 Feature

Demo 展示 `app/store.ts`、`app/hooks.ts`、`features/tasks/tasksSlice.ts` 和 `features/tasks/TasksPanel.tsx` 的职责。点击任务可以派发 action 并更新同一 Feature 的 selector 结果，点击恢复可以回到初始状态；源码面板展示的文件就是当前运行的嵌套源码。

:::demo{id="react.redux.learn.basics.feature-folder-organization.feature-folder-demo"}
先点击任意任务观察 Feature 状态变化，再点击“恢复任务状态”；对照目录职责列表和源码面板，追踪 store、slice、组件之间的依赖方向。
:::

## 六、易错使用提示

:::pitfalls
### 错误：按文件类型拆散一个 Feature

**触发条件：** 把任务 action 放在 `actions/`、reducer 放在 `reducers/`、组件放在 `components/`，并让它们跨多个目录协作。

**原因：** 目录反映技术角色，而不是业务能力边界。

**后果：** 修改一个 Feature 需要跨目录查找，相关逻辑容易遗漏或产生重复实现。

**错误示例：**

```text
actions/taskActions.ts
reducers/taskReducer.ts
components/TaskList.tsx
```

**正确写法：**

```text
features/tasks/tasksSlice.ts
features/tasks/TaskList.tsx
```

**验证方式：** 从一个业务需求出发，确认相关 slice、selector、组件和测试可以在同一个 Feature 目录中定位。

### 错误：用组件名称命名业务状态

**触发条件：** 创建 `HeaderSlice`、`SidebarSlice` 等 slice 保存同一份任务或工作区数据。

**原因：** 把当前页面布局误当成业务域。

**后果：** 组件重构会迫使状态命名和 reducer 路径一起变化，还可能产生多个状态副本。

**错误示例：**

```ts
const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState: { selectedTaskId: null },
  reducers: {},
})
```

**正确写法：**

```ts
const tasksSlice = createSlice({
  name: 'tasks',
  initialState: { selectedTaskId: null },
  reducers: {},
})
```

**验证方式：** 更换页面布局后，确认 slice 名称仍然准确表达它持有的业务数据。

### 错误：让 `common` 直接依赖 Feature 内部 state

**触发条件：** 通用工具导入 `features/tasks/tasksSlice`，并读取任务的内部字段。

**原因：** 把某个 Feature 的业务知识泄漏到共享层。

**后果：** 共享工具无法独立复用，Feature 的 state 结构变化会扩大影响范围。

**错误示例：**

```ts
// common/taskSummary.ts
import { selectTasks } from '../features/tasks/tasksSlice'
```

**正确写法：**

```ts
// features/tasks/tasksSlice.ts
export const selectTaskSummary = (state: RootState) => state.tasks.items.length
```

**验证方式：** 检查 `common` 是否只依赖通用输入；需要理解 Feature state 的逻辑应留在 Feature 内并通过 selector 暴露结果。

### 错误：store 与 Feature 互相导入运行时值

**触发条件：** `app/store.ts` 导入 slice，同时 slice 又运行时导入 `store` 实例。

**原因：** 没有区分用于类型推导的 `import type` 和需要执行的运行时导入。

**后果：** 形成循环依赖，模块初始化顺序可能导致未初始化的值或构建警告。

**错误示例：**

```ts
// features/tasks/tasksSlice.ts
import { store } from '../../app/store'
const taskCount = store.getState().tasks.items.length
```

**正确写法：**

```ts
// features/tasks/tasksSlice.ts
import type { RootState } from '../../app/store'
export const selectTaskCount = (state: RootState) => state.tasks.items.length
```

**验证方式：** 确认 Feature 对 `app/store.ts` 的依赖只用于类型，运行时调用通过 action、selector 或 thunk 的公开接口完成。

### 错误：为了复用而过早抽取共享目录

**触发条件：** 一个 Feature 的小函数刚出现就移动到 `common`，并用模糊名称供未来代码使用。

**原因：** 把潜在复用当成已经稳定的共享契约。

**后果：** `common` 堆积业务特例，真正的 Feature 边界反而变得不清楚。

**错误示例：**

```text
common/formatTaskForSidebar.ts
```

**正确写法：**

```text
features/tasks/formatTaskLabel.ts
```

**验证方式：** 提取前列出至少两个真实调用方，并确认函数名称和参数不包含单一 Feature 的隐含知识。
:::

## 七、源码推导与适用场景

### 1. 官方事实

Redux Style Guide 推荐使用 Feature folder，把一个功能的 slice、action、reducer、selector 和相关组件集中放置；它认为按功能组织通常比按文件类型拆分更容易定位和维护。Redux Essentials 的示例把 `app` 用作 store 与应用 Hooks 的入口，把业务逻辑放入 `features` 目录。

Redux FAQ 指出 Redux 没有强制唯一的目录结构，但模块化时需要注意循环依赖。Redux Toolkit 2.12.0 的 `configureStore` 源码接收 reducer 映射并创建统一 store；映射键决定状态树的分支名称。官方测试验证多个 reducer 可以通过映射组合到同一个 store。

### 2. 课程推导

可以把一次修改沿着“app 装配 -> Feature reducer -> Feature API -> 组件调用”追踪。目录越接近业务能力，越容易让变更保持局部；只有稳定的跨 Feature 契约才值得进入 `common`。这是维护性上的组织判断，不是 Redux 运行时强制的目录规则。

### 3. 适用边界

本课覆盖单一 Redux 应用的 Feature folder、`app`/`features`/`common` 职责和依赖方向。动态 reducer、代码分割、多 store、插件化目录和大型团队的发布边界不在本课展开；这些场景仍应先保持 Feature 的业务内聚，再引入额外装配策略。

## 八、练习

:::exercise
### 练习目标

**要求：** 创建一个 `tasks` Feature，并按以下结构组织完整实现：`app/store.ts` 组合 `tasks` reducer，`app/hooks.ts` 导出预类型 Hooks，`features/tasks/tasksSlice.ts` 定义任务 state、`taskToggled` action 和 `selectOpenTaskCount` selector，`features/tasks/TasksPanel.tsx` 显示任务并派发 action。根组件使用 `Provider` 提供 store。不要按 `actions/`、`reducers/`、`components/` 拆目录，也不要让 `common` 读取 `tasks` 的内部 state。

**验收：** 初始有三条任务且两条待完成；点击任务后对应状态和待完成数量更新；点击恢复按钮返回初始状态；store 只从 `app/store.ts` 组合 Feature reducer；组件只通过预类型 Hooks 和 Feature 导出的 selector/action 读写状态；源码展示包含实际运行的 `app/`、`features/tasks/` 和样式文件。

**参考答案：**

```ts
// 参考答案按文件注释分隔。exercise 只支持一个代码块；tsx 作为承载标记，
// app/store.ts、app/hooks.ts 和 tasksSlice.ts 实际为纯 ts，feature-folder-demo.css 实际为 css。
// app/store.ts
import { configureStore } from '@reduxjs/toolkit'
import tasksReducer from '../features/tasks/tasksSlice'

/** 创建组合 tasks Feature 的应用 store。 */
export function createStore() {
  return configureStore({
    reducer: { tasks: tasksReducer },
  })
}

export type AppStore = ReturnType<typeof createStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

// app/hooks.ts
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'

/** 创建绑定应用 dispatch 类型的 Hook。 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()

/** 创建绑定应用 RootState 类型的 Hook。 */
export const useAppSelector = useSelector.withTypes<RootState>()

// features/tasks/tasksSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

type Task = { id: string; title: string; completed: boolean }
type TasksState = { items: Task[] }

const initialState: TasksState = {
  items: [
    { id: 'task-1', title: '确认 Feature 边界', completed: true },
    { id: 'task-2', title: '集中维护 slice 逻辑', completed: false },
    { id: 'task-3', title: '从组件派发业务 action', completed: false },
  ],
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    /** 切换指定任务的完成状态。 */
    taskToggled: (state, action: PayloadAction<string>) => {
      const task = state.items.find((item) => item.id === action.payload)
      if (task) task.completed = !task.completed
    },
    /** 恢复任务 Feature 的初始状态。 */
    tasksReset: () => initialState,
  },
})

/** 读取任务列表。 */
export const selectTasks = (state: RootState) => state.tasks.items

/** 读取待完成任务数量。 */
export const selectOpenTaskCount = (state: RootState) =>
  state.tasks.items.filter((task) => !task.completed).length

export const { taskToggled, tasksReset } = tasksSlice.actions
export default tasksSlice.reducer

// features/tasks/TasksPanel.tsx
import type { ReactElement } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { selectOpenTaskCount, selectTasks, taskToggled, tasksReset } from './tasksSlice'

/** 显示任务 Feature 并提供状态操作。 */
export function TasksPanel(): ReactElement {
  const tasks = useAppSelector(selectTasks)
  const openTaskCount = useAppSelector(selectOpenTaskCount)
  const dispatch = useAppDispatch()

  /** 切换任务完成状态。 */
  function toggleTask(taskId: string): void {
    dispatch(taskToggled(taskId))
  }

  return (
    <section>
      <h2>任务面板</h2>
      <p>待完成：{openTaskCount}</p>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <button type="button" onClick={() => toggleTask(task.id)}>
              {task.completed ? '已完成' : '待处理'}：{task.title}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => dispatch(tasksReset())}>恢复任务状态</button>
    </section>
  )
}

// feature-folder-demo.tsx
import { useState, type ReactElement } from 'react'
import { Provider } from 'react-redux'
import { createStore } from './app/store'
import { TasksPanel } from './features/tasks/TasksPanel'

/** 在 Provider 中渲染 tasks Feature。 */
export function App(): ReactElement {
  const [store] = useState(createStore)
  return (
    <Provider store={store}>
      <TasksPanel />
    </Provider>
  )
}

// feature-folder-demo.css
section {
  padding: 16px;
  border: 1px solid #d0d7de;
}

li + li {
  margin-top: 8px;
}

button {
  min-height: 40px;
  padding: 8px 12px;
  cursor: pointer;
}
```
:::

## 九、本节小结

- Feature folder 以业务能力为边界集中 slice、selector、组件和测试，避免按文件类型拆散一条业务链。
- `app` 负责应用装配，`features` 负责业务内聚，`common` 只承载真实稳定的跨 Feature 共享能力。
- store 可以组合 Feature reducer；Feature 通过公开的 selector/action 与组件协作，并用类型导入避免循环运行时依赖。
- 目录只说明组织方式，不能改变 Provider、dispatch、reducer 和 selector 组成的单向数据流。

## 十、参考资料

- [Redux Style Guide：Structure Files as Feature Folders or Ducks](https://redux.js.org/style-guide#structure-files-as-feature-folders-or-ducks) - 说明按 Feature 集中组织 Redux 逻辑的建议。
- [Redux Essentials：App Structure](https://redux.js.org/tutorials/essentials/part-2-app-structure) - 说明 `app` 与 `features` 目录的职责和示例结构。
- [Redux FAQ：Code Structure](https://redux.js.org/faq/code-structure) - 说明目录结构没有唯一答案以及循环依赖注意事项。
- [Redux Style Guide](https://redux.js.org/style-guide) - 说明按数据域组织状态逻辑的维护性原则。
- [Redux Toolkit Modernizing Redux Logic](https://redux.js.org/usage/migrating-to-modern-redux) - 说明现代 Redux 迁移到 Feature folder 的路径。
- [Redux Toolkit 2.12.0 configureStore 源码](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/configureStore.ts) - 支持 reducer 映射和 store 装配事实。
- [Redux Toolkit 2.12.0 configureStore 官方测试](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/tests/configureStore.test.ts) - 支持多个 reducer 组合到统一 store 的行为。
