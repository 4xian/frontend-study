---
id: react.redux.learn.basics.use-dispatch
type: lesson
title: useDispatch
summary: 在 React 事件边界中取得 Redux dispatch，并派发描述用户意图的 action。
domain: frontend
technology: react
module: redux
stage: basics
level: beginner
estimatedMinutes: 70
prerequisites:
  - react.redux.learn.basics.use-selector
related: []
tags:
  - React Redux
  - useDispatch
  - dispatch
  - Action Creator
  - Payload
appliesTo: React Redux 9.3.0、Redux Toolkit 2.12.0、Redux 5.0.1、React 19.2.8
verifiedAt: 2026-08-30
objectives:
  - 能说明 useDispatch 返回的是 Provider 对应 store 的 dispatch 函数。
  - 能在事件处理器中调用 useDispatch，并派发 action creator 返回的 action。
  - 能为无参数 action 和带 payload 的 action 选择清晰的调用方式。
  - 能区分调用 action creator 与把 action creator 函数本身交给 dispatch。
  - 能避免在组件渲染或 selector 计算期间派发 action。
recap:
  - Provider 为 React 子树提供 store，useDispatch 从最近的 Provider 取得 dispatch。
  - dispatch 接收 action 对象；使用 createSlice 时通常先调用 action creator，再派发返回值。
  - 用户输入和点击等事件是派发 action 的自然边界，payload 承载事件需要的数据。
  - 同一个 Provider store 实例不变时，useDispatch 返回的 dispatch 引用保持稳定。
  - 不要在 render 或 selector 中派发，也不要把 action creator 函数本身当成 action。
sources:
  - title: React Redux 9.3.0 Hooks API
    url: https://react-redux.js.org/api/hooks
    sourceType: api-doc
    appliesTo: React Redux 9.3.0
    claims:
      - useDispatch 返回 Redux store 的 dispatch 函数引用，可用于派发 action。
      - 使用 useDispatch 的组件必须位于 Provider 提供的 store 作用域内。
      - 同一个 Provider store 实例不变时，dispatch 函数引用保持稳定。
  - title: React Redux 9.3.0 useDispatch Source
    url: https://github.com/reduxjs/react-redux/blob/v9.3.0/src/hooks/useDispatch.ts
    sourceType: source-code
    appliesTo: React Redux 9.3.0
    claims:
      - 固定版本源码通过 useStore 取得当前 store，并返回 store.dispatch。
      - 固定版本源码提供 createDispatchHook 和 withTypes API，但本课只使用基础 useDispatch。
  - title: React Redux 9.3.0 useDispatch Tests
    url: https://github.com/reduxjs/react-redux/blob/v9.3.0/test/hooks/useDispatch.spec.tsx
    sourceType: official-test
    appliesTo: React Redux 9.3.0
    claims:
      - 官方测试验证 useDispatch 返回的引用就是 Provider 对应 store.dispatch。
      - 官方测试验证嵌套不同 context 时，默认 hook 和自定义 dispatch hook 取得各自 store 的 dispatch。
  - title: Redux Essentials Part 2：Redux Toolkit App Structure
    url: https://redux.js.org/tutorials/essentials/part-2-app-structure
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0、React Redux 9.3.0
    claims:
      - React 组件可以在用户点击等事件中调用 useDispatch 并派发 slice action creator。
      - store 的 RootState 与 AppDispatch 可以从 store 实例推导，复杂类型组织属于单独的工程主题。
  - title: Redux Fundamentals Part 5：UI and React
    url: https://redux.js.org/tutorials/fundamentals/part-5-ui-react
    sourceType: official-reference
    appliesTo: Redux 5.0.1、React Redux 9.3.0
    claims:
      - useDispatch 为组件提供 store 的 dispatch 方法，使组件能够提交 action。
      - 受控输入可以在事件中准备 payload，再由 dispatch 提交 action。
  - title: React Redux 9.3.0 npm Latest Metadata
    url: https://registry.npmjs.org/react-redux/latest
    sourceType: official-reference
    appliesTo: React Redux 9.3.0
    claims:
      - npm latest 在核验日指向 React Redux 9.3.0。
  - title: Redux Toolkit 2.12.0 npm Latest Metadata
    url: https://registry.npmjs.org/@reduxjs%2ftoolkit/latest
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - npm latest 在核验日指向 Redux Toolkit 2.12.0。
  - title: Redux 5.0.1 npm Latest Metadata
    url: https://registry.npmjs.org/redux/latest
    sourceType: official-reference
    appliesTo: Redux 5.0.1
    claims:
      - npm latest 在核验日指向 Redux 5.0.1。
---

# useDispatch

## 一、学习目标

- 说明 `useDispatch` 如何从 Provider 取得当前 Redux store 的 `dispatch`。
- 在点击、提交等事件处理器中调用 `dispatch`，让 reducer 处理用户意图。
- 使用 slice action creator 派发无参数 action 和带 payload 的 action。
- 区分 action 对象、action creator 函数和 `dispatch` 调用。
- 识别不能在 render 或 selector 中派发 action 的边界。

## 二、为什么需要 useDispatch

`useSelector` 解决了组件如何读取状态，但用户点击按钮、提交表单或选择选项时，组件还需要把“发生了什么”交给
Redux。组件可以直接导入一个全局 store 并调用 `store.dispatch()`，但这样会让组件依赖具体 store 实例，也不容易
替换 Provider 的作用域。

`useDispatch` 提供了组件需要的那一个方法：它从最近的 Provider 取得 store 的 `dispatch`。组件只需要在事件边界
准备 action 并调用 `dispatch`，reducer、订阅和后续的 `useSelector` 更新继续沿着 Redux 单向数据流完成。

## 三、核心概念

### 1. useDispatch 必须位于 Provider 子树

Provider 把 store 放进 React Redux 的上下文。组件在这个作用域内调用 `useDispatch`，才能取得对应 store 的
dispatch：

```tsx
import { Provider, useDispatch } from 'react-redux'

const store = configureStore({ reducer: rootReducer })

function SaveButton(): React.ReactElement {
  const dispatch = useDispatch()
  return <button type="button">保存</button>
}

function App(): React.ReactElement {
  return (
    <Provider store={store}>
      <SaveButton />
    </Provider>
  )
}
```

脱离 Provider 调用 Hook 没有可用的 store，React Redux 会报告上下文缺失。Provider 的作用域决定了该组件实际连接
到哪一份 store。

### 2. Hook 返回 dispatch 函数

```tsx
function IncrementButton(): React.ReactElement {
  const dispatch = useDispatch()

  /** 派发一个无 payload 的 action。 */
  function handleClick(): void {
    dispatch(counterSlice.actions.incremented())
  }

  return (
    <button type="button" onClick={handleClick}>
      增加
    </button>
  )
}
```

`useDispatch()` 本身只取得函数，不会自动修改状态；真正的更新发生在事件中调用 `dispatch(action)` 之后。只要
Provider 继续使用同一份 store，返回的 dispatch 引用就保持稳定。

### 3. 派发 action creator 的返回值

slice 会生成 action creator。调用 action creator 才能得到 action 对象，再把这个对象交给 `dispatch`：

```ts
const action = counterSlice.actions.amountAdded(5)
dispatch(action)
```

把函数本身交给 `dispatch` 是错误的：

```ts
// 错误：这里传入的是函数，而不是 action 对象
dispatch(counterSlice.actions.amountAdded)

// 正确：调用 creator，得到带 payload 的 action
dispatch(counterSlice.actions.amountAdded(5))
```

带 payload 的 action 应该让事件处理器提供事件数据。payload 的具体形状由 action 契约决定，本课只使用数字和
简单对象，不展开异步 action 或自定义 dispatch 类型。

### 4. 事件是派发的自然边界

组件应在用户事件发生时准备输入并派发 action：

```tsx
function QuantityButton(): React.ReactElement {
  const dispatch = useDispatch()

  /** 把按钮代表的数量作为 payload 交给 action creator。 */
  function handleAdd(): void {
    const amount = 5
    dispatch(counterSlice.actions.amountAdded(amount))
  }

  return (
    <button type="button" onClick={handleAdd}>
      增加 5
    </button>
  )
}
```

这样 action 的来源是清晰的用户意图。组件不直接修改 Redux state，reducer 也不需要知道按钮或输入框的存在。

## 四、用法与示例

### 1. 无 payload 的 action

无 payload 的 action 适合表达“切换”“打开”“清空”等不需要额外数据的事件：

```tsx
const dispatch = useDispatch()

/** 派发切换主题事件。 */
function toggleTheme(): void {
  dispatch(themeSlice.actions.toggled())
}
```

### 2. 带 payload 的 action

当事件需要携带数据时，把数据传给 action creator：

```tsx
const dispatch = useDispatch()

/** 派发选择任务事件，并携带任务 ID。 */
function selectTask(taskId: string): void {
  dispatch(tasksSlice.actions.selected(taskId))
}
```

action creator 负责生成稳定的 `type` 和 `payload` 形状，组件负责提供当前事件产生的数据。不要在多个组件中重复
手写同一个 action 对象的字段约定。

### 3. 与 useSelector 组成读写闭环

一个组件可以同时读取状态并派发事件：

```tsx
function Counter(): React.ReactElement {
  const value = useSelector(selectCounter)
  const dispatch = useDispatch()

  /** 派发增加事件，让 reducer 生成下一份状态。 */
  function increment(): void {
    dispatch(counterSlice.actions.incremented())
  }

  return (
    <p>
      <span>{value}</span>
      <button type="button" onClick={increment}>
        增加
      </button>
    </p>
  )
}
```

数据流是：用户事件 -> `dispatch(action)` -> reducer -> 新状态 -> `useSelector` 重新读取 -> UI 更新。

### 4. 让 dispatch 保持在事件或明确的副作用边界

不要在组件函数体中直接派发：

```tsx
function WrongCounter(): React.ReactElement {
  const dispatch = useDispatch()
  dispatch(counterSlice.actions.incremented())
  return <p>错误示例</p>
}
```

组件每次 render 都可能再次执行函数体，直接派发会形成不可控的更新循环。selector 也只能读取和推导数据，不能在
其中调用 `dispatch`。需要由外部状态变化触发的派发，应放在明确的 Effect 或事件边界，并确认依赖不会造成重复提交。

## 五、Demo：观察 useDispatch 派发链路

Demo 使用一个 Provider 和独立 store。三个按钮分别派发无 payload 的递增 action、带数字 payload 的增量 action 和
重置 action；界面用 `useSelector` 显示当前计数，用最近一次事件说明 dispatch 已经把 action 交给 store。

:::demo{id="react.redux.learn.basics.use-dispatch.use-dispatch-demo"}
点击不同按钮，观察事件处理器调用 `useDispatch` 后，计数、payload 和最近一次 action 如何变化。
:::

## 六、易错使用提示

:::pitfalls
### 错误：组件没有位于 Provider 内

**触发条件：** 在没有 `<Provider store={store}>` 祖先的组件中调用 `useDispatch()`。

**原因：** Hook 需要从 React Redux 上下文取得 store，脱离 Provider 时没有可用的 dispatch。

**后果：** 组件渲染时抛出上下文缺失错误，事件处理器也无法建立 Redux 更新路径。

**错误示例：**

```tsx
function SaveButton(): React.ReactElement {
  const dispatch = useDispatch()
  return <button type="button">保存</button>
}

// 这里没有 Provider
root.render(<SaveButton />)
```

**正确写法：**

```tsx
root.render(
  <Provider store={store}>
    <SaveButton />
  </Provider>,
)
```

**验证方式：** 检查调用 `useDispatch` 的组件是否始终位于提供目标 store 的 Provider 子树内。

### 错误：把 action creator 函数本身交给 dispatch

**触发条件：** 写成 `dispatch(counterSlice.actions.incremented)` 或 `dispatch(counterSlice.actions.amountAdded)`。

**原因：** action creator 是生成 action 的函数，dispatch 需要接收调用后的 action 对象。

**后果：** Redux 无法按预期读取 action 的 `type`，带 payload 的数据也没有真正生成。

**错误示例：**

```tsx
dispatch(counterSlice.actions.amountAdded)
```

**正确写法：**

```tsx
dispatch(counterSlice.actions.amountAdded(5))
```

**验证方式：** 在 dispatch 前检查值是否为包含字符串 `type` 的 action 对象，而不是函数引用。

### 错误：在 render 或 selector 中 dispatch

**触发条件：** 在组件函数体、selector 或 JSX 求值期间调用 `dispatch`。

**原因：** render 和 selector 可能被重复执行；派发会触发新的状态更新并再次进入这些计算边界。

**后果：** 产生重复 action、更新循环或难以预测的渲染行为。

**错误示例：**

```tsx
function WrongPanel(): React.ReactElement {
  const dispatch = useDispatch()
  const count = useSelector((state: RootState) => {
    dispatch(counterSlice.actions.incremented())
    return state.counter
  })
  return <p>{count}</p>
}
```

**正确写法：**

```tsx
function Panel(): React.ReactElement {
  const dispatch = useDispatch()
  const count = useSelector(selectCounter)

  /** 只在用户点击事件中派发。 */
  function increment(): void {
    dispatch(counterSlice.actions.incremented())
  }

  return <button type="button" onClick={increment}>{count}</button>
}
```

**验证方式：** 搜索 dispatch 调用的父级边界，确认它位于事件处理器或明确的 Effect 中，而不是组件 render 或 selector。

### 错误：组件直接修改 Redux state

**触发条件：** 通过从 store 取出的对象直接赋值，绕过 action 和 reducer。

**原因：** Redux 状态的变更必须经过 dispatch 和 reducer，组件不拥有 store 状态的写入权。

**后果：** 订阅通知、不可变更新和调试日志无法按 Redux 数据流工作。

**错误示例：**

```tsx
const state = store.getState()
state.counter = state.counter + 1
```

**正确写法：**

```tsx
const dispatch = useDispatch()
dispatch(counterSlice.actions.incremented())
```

**验证方式：** 组件只生成或派发 action，不对 `getState()` 返回值或 selector 结果直接写入。

:::

## 七、源码推导与适用场景

### 1. 官方事实

React Redux 9.3.0 的固定版本 `useDispatch` 源码先通过 `useStore` 取得当前上下文中的 store，再返回
`store.dispatch`。源码还提供 `createDispatchHook` 和 `.withTypes()`，但这些 API 属于自定义上下文和类型组织，
不改变基础 Hook 的职责。

官方 `useDispatch` 测试验证：在 Provider 中调用 Hook 得到的函数引用就是对应 store 的 `dispatch`；当嵌套不同
context 和 store 时，默认 Hook 与自定义 Hook 分别得到各自作用域的 dispatch。

### 2. 课程推导

`useDispatch` 是 React 组件进入 Redux 写入路径的最小入口。组件在事件边界准备 action，调用 dispatch；状态如何
计算由 reducer 决定，组件如何显示由 `useSelector` 决定。这样可以把用户意图、状态计算和视图读取分在不同职责中。

### 3. 适用边界

本课覆盖 Provider 作用域、同步 action、action creator、payload 和事件派发。异步 thunk、带 middleware 的自定义
dispatch 类型、预类型 Hook、自定义 React Redux context 和 dispatch 性能优化需要结合各自的运行环境与类型契约单独设计。

## 八、练习

:::exercise
### 练习目标

**要求：** 创建 `ResettableCounter` 组件。使用 `useSelector` 读取 `state.counter.value`，使用 `useDispatch` 得到
dispatch。组件包含“增加 1”和“重置”两个按钮：前者派发 `counter/incremented`，后者派发 `counter/reset`；两个
action 都由 `createSlice` 生成。组件必须放在 `Provider` 内，不能直接修改 state，也不能在 render 中 dispatch。

**验收：** 初始显示 `0`；点击“增加 1”后显示 `1`；再点击“重置”后显示 `0`。两个按钮的事件处理器都调用
`dispatch`，action creator 均被调用后再传给 dispatch；组件函数体和 selector 没有 dispatch 或 state 赋值。

**参考答案：**

```tsx
import { configureStore, createSlice } from '@reduxjs/toolkit'
import { Provider, useDispatch, useSelector } from 'react-redux'
import type { ReactElement } from 'react'

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    incremented: (state) => {
      state.value += 1
    },
    reset: (state) => {
      state.value = 0
    },
  },
})

const store = configureStore({
  reducer: { counter: counterSlice.reducer },
})

type RootState = ReturnType<typeof store.getState>

/** 选择当前计数值。 */
const selectCounter = (state: RootState) => state.counter.value

/** 显示计数并通过 useDispatch 提交事件。 */
function ResettableCounter(): ReactElement {
  const value = useSelector(selectCounter)
  const dispatch = useDispatch()

  /** 派发增加事件。 */
  function handleIncrement(): void {
    dispatch(counterSlice.actions.incremented())
  }

  /** 派发重置事件。 */
  function handleReset(): void {
    dispatch(counterSlice.actions.reset())
  }

  return (
    <section>
      <p>{value}</p>
      <button type="button" onClick={handleIncrement}>
        增加 1
      </button>
      <button type="button" onClick={handleReset}>
        重置
      </button>
    </section>
  )
}

/** 在 Provider 中渲染计数组件。 */
export function App(): ReactElement {
  return (
    <Provider store={store}>
      <ResettableCounter />
    </Provider>
  )
}
```
:::

## 九、本节小结

- `useDispatch` 从最近的 Provider 取得当前 store 的 dispatch 函数。
- 组件通常在事件处理器中调用 action creator，再把返回的 action 交给 dispatch。
- 无 payload 和带 payload 的 action 都必须遵守既定的数据契约。
- `useDispatch` 与 `useSelector` 分别连接组件的写入路径和读取路径。
- 不要在 render、selector 或组件外部直接修改 Redux state。

## 十、参考资料

- [React Redux Hooks API](https://react-redux.js.org/api/hooks) - 支持 useDispatch 的职责、Provider 前提、事件调用和引用稳定性。
- [React Redux 9.3.0 useDispatch Source](https://github.com/reduxjs/react-redux/blob/v9.3.0/src/hooks/useDispatch.ts) - 支持固定版本 useStore -> store.dispatch 的实现事实。
- [React Redux 9.3.0 useDispatch Tests](https://github.com/reduxjs/react-redux/blob/v9.3.0/test/hooks/useDispatch.spec.tsx) - 支持 Provider store 与 dispatch 引用、嵌套 context 行为。
- [Redux Essentials Part 2：Redux Toolkit App Structure](https://redux.js.org/tutorials/essentials/part-2-app-structure) - 支持组件事件中派发 slice action creator。
- [Redux Fundamentals Part 5：UI and React](https://redux.js.org/tutorials/fundamentals/part-5-ui-react) - 支持组件通过 useDispatch 进入 Redux dispatch 路径。
