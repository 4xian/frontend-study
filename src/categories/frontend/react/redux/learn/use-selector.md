---
id: react.redux.learn.basics.use-selector
type: lesson
title: useSelector
summary: 在 React 组件中使用 useSelector 读取 Redux 状态，并用纯 selector 选择视图需要的数据。
domain: frontend
technology: react
module: redux
stage: basics
level: beginner
estimatedMinutes: 75
prerequisites:
  - react.redux.learn.basics.provider
related: []
tags:
  - React Redux
  - useSelector
  - Selector
  - RootState
  - Redux store
appliesTo: React Redux 9.3.0、Redux Toolkit 2.12.0、React 19.2.8
verifiedAt: 2026-08-30
objectives:
  - 能说明 selector 接收完整 RootState 并返回组件需要的值。
  - 能在 Provider 子树中使用 useSelector 读取 Redux store，并随状态更新显示新结果。
  - 能使用命名 selector 读取字段和简单派生值。
  - 能在一个组件中调用多次 useSelector，分别读取视图需要的数据。
  - 能保持 selector 为纯函数，并避免直接返回整个 RootState。
recap:
  - selector 是接收完整 Redux root state 并返回所需值的纯函数。
  - useSelector 从最近的 Provider 取得 store，并在状态更新后重新读取 selector 结果。
  - 命名 selector 可以集中封装状态路径，也可以返回简单派生值。
  - 一个组件可以多次调用 useSelector，分别读取它真正需要的数据。
  - 不要返回整个 root state，也不要在 selector 中修改状态或执行副作用。
sources:
  - title: React Redux 9.3.0 Hooks API
    url: https://react-redux.js.org/api/hooks
    sourceType: api-doc
    appliesTo: React Redux 9.3.0
    claims:
      - useSelector 接收 selector 和可选 equalityFn/options，并返回 selector 结果。
      - selector 接收完整 store state，应保持纯函数；dispatch 后会重新执行并比较结果。
      - 默认使用严格 === 比较选择结果；一个组件可以多次调用 useSelector。
      - 返回整个 root state 会让组件在任意状态变化时更新，通常是错误选择。
  - title: React Redux 9.3.0 useSelector Source
    url: https://github.com/reduxjs/react-redux/blob/v9.3.0/src/hooks/useSelector.ts
    sourceType: source-code
    appliesTo: React Redux 9.3.0
    claims:
      - 固定版本源码从 React Redux Context 取得 store 与订阅，并通过 useSyncExternalStoreWithSelector 读取结果。
      - 固定版本默认比较函数使用严格 ===，开发模式会检查 selector 稳定性和是否返回 root state。
  - title: React Redux 9.3.0 useSelector Tests
    url: https://github.com/reduxjs/react-redux/blob/v9.3.0/test/hooks/useSelector.spec.tsx
    sourceType: official-test
    appliesTo: React Redux 9.3.0
    claims:
      - 官方测试覆盖首次读取、dispatch 后更新、引用相等时保持结果和订阅清理。
  - title: Redux Deriving Data with Selectors
    url: https://redux.js.org/usage/deriving-data-selectors
    sourceType: official-reference
    appliesTo: Redux 5.0.1
    claims:
      - selector 可以读取 state 中的值，也可以基于 state 计算派生值。
      - 复用 selector 可以集中封装状态结构，避免组件散落字段路径。
  - title: React Redux Usage with TypeScript
    url: https://react-redux.js.org/using-react-redux/usage-with-typescript
    sourceType: api-doc
    appliesTo: React Redux 9.3.0
    claims:
      - selector 的 state 参数可以显式标注 RootState，返回类型会被 useSelector 推断。
      - RootState 通常由 ReturnType<typeof store.getState> 推导得到。
  - title: React Redux 9.3.0 npm Latest Metadata
    url: https://registry.npmjs.org/react-redux/latest
    sourceType: official-reference
    appliesTo: React Redux 9.3.0
    claims:
      - npm latest 在核验日指向 React Redux 9.3.0。
  - title: Redux 5.0.1 npm Latest Metadata
    url: https://registry.npmjs.org/redux/latest
    sourceType: official-reference
    appliesTo: Redux 5.0.1
    claims:
      - npm latest 在核验日指向 Redux 5.0.1。
---

# useSelector

## 一、学习目标

- 用一个纯 selector 从完整 Redux root state 中读取组件需要的字段。
- 在 Provider 子树中调用 `useSelector`，并在 store 更新后看到新的选择结果。
- 使用命名 selector 封装字段路径和简单派生计算。
- 在同一个组件中多次调用 `useSelector`，分别读取需要的数据。
- 避免返回整个 root state，也不在 selector 中执行副作用。

## 二、为什么需要 useSelector

Provider 让 React 子树能够找到同一个 Redux store，但组件还需要一种声明式的读取方式。让每个组件手动调用
`store.getState()` 只能得到调用时的快照，也不会因为后续 dispatch 自动重新渲染；让每个组件手动调用
`store.subscribe()` 又会重复处理订阅生命周期和更新判断。

`useSelector` 把这两件事合在一起：组件提供一个 selector，React Redux 负责从 store 读取它的结果、订阅 store，
并在 action dispatch 后再次计算。组件只保留自己需要的值，状态结构和 React 渲染之间的连接由 Hook 管理。

## 三、核心概念

### 1. Selector 接收完整 RootState

selector 是一个普通的纯函数，参数是完整 root state，返回值可以是原始字段、对象引用、数组引用或派生结果：

```ts
type RootState = {
  counter: number
  preferences: { theme: 'light' | 'dark' }
}

const selectCounter = (state: RootState) => state.counter
const selectTheme = (state: RootState) => state.preferences.theme
const selectIsDark = (state: RootState) => state.preferences.theme === 'dark'
```

selector 不需要知道组件，只描述“从这份状态读什么”。把路径集中在命名 selector 中，可以避免多个组件分别记住
状态结构；状态结构调整时，也只需要修改 selector 的实现。

### 2. useSelector 建立订阅并返回选择结果

在 Provider 子树内，组件可以把 selector 交给 `useSelector`：

```tsx
import { useSelector } from 'react-redux'

function CounterLabel(): React.ReactElement {
  const counter = useSelector(selectCounter)
  return <strong>{counter}</strong>
}
```

首次渲染时，Hook 用当前 root state 调用 selector，并把结果返回给组件。之后 store 收到 dispatch，Hook 会重新读取
selector 结果；结果变化时，组件会显示更新后的数据。组件不需要自己调用 `store.subscribe()` 或维护取消订阅逻辑。

selector 可能在渲染和订阅检查的不同时机执行，因此必须是纯函数。不要在 selector 中 dispatch、修改 state、写入
外部变量或依赖当前时间；这些副作用会让相同输入产生不可预测的结果。

### 3. 选择结果应尽量直接

`useSelector` 默认使用 `===` 比较前后选择结果。基础课程优先直接返回组件需要的字段或原始派生值：

```ts
const selectCount = (state: RootState) => state.counter
const selectPreferences = (state: RootState) => state.preferences
```

不要为了“一次返回多个字段”就在 selector 中临时创建对象或数组：

```ts
// 不推荐：每次调用都创建新的对象引用
const selectSummary = (state: RootState) => ({
  counter: state.counter,
  theme: state.preferences.theme,
})
```

这种写法每次执行都会创建新引用。复杂派生结果、结果身份和自定义比较需要结合具体数据结构单独设计；当前先用
直接字段或简单原始值建立正确读取方式。

### 4. 多次选择比返回临时对象更直接

一个组件可以多次调用 `useSelector`，每次只返回它需要的一小块值：

```tsx
function Toolbar(): React.ReactElement {
  const counter = useSelector(selectCounter)
  const theme = useSelector(selectTheme)
  return <span>{theme}: {counter}</span>
}
```

每次调用都返回一个独立结果。拆分读取比返回临时组合对象更直接，也让组件代码清楚表达自己使用了哪些字段。

## 四、用法与示例

### 1. 从 store 推导 RootState 类型

当 store 已由 `configureStore` 创建时，通常从 `store.getState` 推导 root state，再为 selector 的参数标注类型：

```ts
import { configureStore, createSlice } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: 0,
  reducers: {},
})

const store = configureStore({
  reducer: { counter: counterSlice.reducer },
})

type RootState = ReturnType<typeof store.getState>
const selectCounter = (state: RootState) => state.counter
```

组件调用 `useSelector(selectCounter)` 时，TypeScript 可以从 selector 推断出返回值为 `number`。预类型 Hook 属于
更大的 TypeScript 组织主题；本课先掌握 selector 与 Hook 的数据流关系。

### 2. 读取字段和派生原始值

返回原始值通常天然稳定，适合用作计数、布尔判断和文本：

```tsx
const selectOpenCount = (state: RootState) =>
  state.tasks.filter((task) => !task.done).length

function OpenCount(): React.ReactElement {
  const count = useSelector(selectOpenCount)
  return <span>未完成：{count}</span>
}
```

这里返回的是数字，组件可以直接用于显示。复杂或高成本派生计算需要额外工具时，再根据实际输入设计缓存方式。

### 3. 选择最小必要范围

组件通常只应订阅它真正渲染的字段：

```tsx
// 不推荐：任意字段变化都会触发组件更新
const entireState = useSelector((state: RootState) => state)

// 推荐：只订阅当前视图需要的字段
const theme = useSelector((state: RootState) => state.preferences.theme)
```

返回整个 root state 会让组件失去选择边界。即使组件目前只读取一个字段，其他 slice 的更新也会触发它重新渲染，
并让组件与整个应用状态发生不必要的耦合。

## 五、Demo：观察选择器读取结果

Demo 让三个组件分别用命名 selector 读取 `counter`、`theme` 和 `notifications`。按钮通过已有 store 的 `dispatch`
修改不同字段，读者会显示各自最新的选择结果。

:::demo{id="react.redux.learn.basics.use-selector.use-selector-demo"}
分别修改三块状态，观察每个 `useSelector` 读者如何显示 selector 返回的最新值。
:::

## 六、易错使用提示

:::pitfalls
### 错误：selector 返回整个 root state

**触发条件：** 直接把 `(state) => state` 传给 `useSelector`。

**原因：** 选择结果就是 root state 引用，任意 slice 更新都会改变它。

**后果：** 组件订阅了整个应用状态，和当前视图无关的 action 也会触发重新渲染。

**错误示例：**

```tsx
const state = useSelector((rootState: RootState) => rootState)
```

**正确写法：**

```tsx
const theme = useSelector((rootState: RootState) => rootState.preferences.theme)
```

**验证方式：** 检查组件是否只读取当前界面真正使用的字段，而不是保存整个 root state。

### 错误：每次选择都创建新对象或数组

**触发条件：** 在 selector 中使用对象字面量、`map` 或 `filter`，然后直接返回新结果。

**原因：** 默认比较是严格 `===`，新引用即使内容相同也会被认为发生变化。

**后果：** 选择结果引用不稳定，开发模式可能给出 selector 稳定性警告。

**错误示例：**

```tsx
const selected = useSelector((state: RootState) => ({
  counter: state.counter,
  theme: state.preferences.theme,
}))
```

**正确写法：**

```tsx
const counter = useSelector((state: RootState) => state.counter)
const theme = useSelector((state: RootState) => state.preferences.theme)
```

**验证方式：** 检查基础读取是否可以拆成直接字段 selector，避免在调用时创建临时组合对象。

### 错误：在 selector 中执行副作用

**触发条件：** 在 selector 中 dispatch、修改外部变量、写入 localStorage 或读取当前时间。

**原因：** React Redux 可能在渲染和订阅检查时多次调用 selector；它要求相同输入得到可预测结果。

**后果：** 读取结果不稳定，副作用次数不可控，调试和并发渲染行为都会变得困难。

**错误示例：**

```tsx
const selected = useSelector((state: RootState) => {
  localStorage.setItem('last-count', String(state.counter))
  return state.counter
})
```

**正确写法：**

```tsx
const selected = useSelector((state: RootState) => state.counter)
```

**验证方式：** 检查 selector 是否只读取参数并返回结果；持久化和 dispatch 放在明确的事件或 Effect 边界中。

:::

## 七、源码推导与适用场景

### 1. 官方事实

React Redux 9.3.0 的 `useSelector` 源码从 React Redux Context 取得 store 与订阅，使用
`useSyncExternalStoreWithSelector` 连接外部 store 快照和 selector，默认比较函数是严格 `===`。固定版本官方测试覆盖
首次读取、dispatch 后更新、引用相等时保持结果，以及组件卸载后的订阅清理。

Redux 的 selector 文档把 selector 定义为读取 state 或从 state 推导数据的函数，并建议用可复用 selector 封装状态
结构。React Redux 的 TypeScript 文档则建议显式标注 `RootState`，让 Hook 推断选择结果类型。

### 2. 课程推导

可以把 `useSelector` 看成“组件声明自己要从 store 读取什么”。组件只写 selector 和展示逻辑，React Redux 负责读取
当前快照、连接订阅并把新的选择结果交回组件。

### 3. 适用边界

本课覆盖同步读取、纯 selector、Provider 前提、简单派生值和多个基础选择。`useDispatch`、预类型 Hooks、结果身份的
系统优化、记忆化 selector、异步逻辑和实体选择器不在本课展开。

## 八、练习

:::exercise
### 练习目标

**要求：** 创建 `TaskPanel` 组件，使用两个命名 selector：`selectOpenCount` 返回未完成任务数量，
`selectFilter` 返回当前筛选值。组件用两次 `useSelector` 读取它们并显示结果；不要返回临时组合对象，也不要在
selector 中修改状态。使用一个 `Provider` 和 Redux store 渲染组件。

**验收：** 初始显示未完成数量 `1` 和筛选值 `open`；点击“完成任务”后数量变为 `0`，筛选值保持 `open`；selector
都是纯函数，组件没有读取整个 root state，也没有返回临时组合对象。

**参考答案：**

```tsx
import { configureStore, createSlice } from '@reduxjs/toolkit'
import { Provider, useSelector } from 'react-redux'
import type { ReactElement } from 'react'

type Task = { id: string; done: boolean }

type TasksState = {
  items: Task[]
  filter: 'all' | 'open'
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: [{ id: 'task-1', done: false }],
    filter: 'open',
  } satisfies TasksState,
  reducers: {
    taskCompleted: (state, action: { payload: string }) => {
      const task = state.items.find((item) => item.id === action.payload)
      if (task) task.done = true
    },
  },
})

const store = configureStore({
  reducer: { tasks: tasksSlice.reducer },
})

type RootState = ReturnType<typeof store.getState>

/** 选择未完成任务数量。 */
const selectOpenCount = (state: RootState) =>
  state.tasks.items.filter((task) => !task.done).length

/** 选择当前任务筛选值。 */
const selectFilter = (state: RootState) => state.tasks.filter

/** 只订阅任务数量和筛选值的面板。 */
function TaskPanel(): ReactElement {
  const openCount = useSelector(selectOpenCount)
  const filter = useSelector(selectFilter)

  return <p>{filter}：{openCount}</p>
}

/** 通过已有 store dispatch 完成第一条任务。 */
function completeTask(): void {
  store.dispatch(tasksSlice.actions.taskCompleted('task-1'))
}

/** 在 Provider 中渲染任务面板并验证选择结果。 */
export function App(): ReactElement {
  return (
    <Provider store={store}>
      <TaskPanel />
      <button type="button" onClick={completeTask}>
        完成任务
      </button>
    </Provider>
  )
}
```
:::

## 九、本节小结

- selector 接收完整 root state，负责读取或推导组件需要的值。
- `useSelector` 从 Provider 提供的 store 读取数据，并在状态更新后提供新的选择结果。
- selector 必须保持纯函数，可以封装字段路径或返回简单派生值。
- 一个组件可以多次调用 `useSelector`，分别读取当前视图需要的数据。
- 避免返回整个 root state、临时组合对象或在 selector 中执行副作用。

## 十、参考资料

- [React Redux Hooks API](https://react-redux.js.org/api/hooks) - 支持 useSelector 的签名、订阅、比较和使用边界。
- [React Redux 9.3.0 useSelector Source](https://github.com/reduxjs/react-redux/blob/v9.3.0/src/hooks/useSelector.ts) - 支持固定版本 Context、订阅、快照和默认比较实现。
- [React Redux 9.3.0 useSelector Tests](https://github.com/reduxjs/react-redux/blob/v9.3.0/test/hooks/useSelector.spec.tsx) - 支持读取、更新和订阅清理行为。
- [Redux Deriving Data with Selectors](https://redux.js.org/usage/deriving-data-selectors) - 支持 selector 的读取、派生和复用。
- [React Redux Usage with TypeScript](https://react-redux.js.org/using-react-redux/usage-with-typescript) - 支持 RootState 和 selector 类型推断。
