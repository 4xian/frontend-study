---
id: react.redux.learn.basics.typescript-pretyped-hooks
type: lesson
title: TypeScript 与预类型 Hooks
summary: 从 Redux store 推导 RootState、AppDispatch 和 AppStore，并创建可复用的预类型 React Redux Hooks。
domain: frontend
technology: react
module: redux
stage: basics
level: beginner
estimatedMinutes: 75
prerequisites:
  - react.redux.learn.basics.use-dispatch
related: []
tags:
  - TypeScript
  - React Redux
  - RootState
  - AppDispatch
  - withTypes
  - Typed Hooks
appliesTo: React Redux 9.3.0、Redux Toolkit 2.12.0、Redux 5.0.1、React 19.2.8
verifiedAt: 2026-08-30
objectives:
  - 能从 configureStore 推导 RootState、AppDispatch 和 AppStore 类型。
  - 能解释为什么 AppDispatch 应从 store.dispatch 推导，而不是手写通用 Dispatch。
  - 能在独立 hooks 模块中使用 React Redux 的 withTypes 创建预类型 Hooks。
  - 能在组件中使用 useAppSelector、useAppDispatch 和 useAppStore，避免重复书写泛型。
  - 能区分类型推导、运行时 Hook 和 Provider store 之间的职责。
recap:
  - RootState 通常由 ReturnType<typeof store.getState> 推导。
  - AppDispatch 通常由 typeof store.dispatch 推导，能够随 middleware 配置更新。
  - AppStore 可以由 typeof store 或 store 工厂的返回类型推导。
  - React Redux 9.1.0 起可用 useDispatch.withTypes、useSelector.withTypes 和 useStore.withTypes。
  - 预类型 Hooks 是运行时 Hook 的复用入口，仍然必须在对应 Provider 子树中调用。
sources:
  - title: React Redux Usage with TypeScript
    url: https://react-redux.js.org/using-react-redux/usage-with-typescript
    sourceType: api-doc
    appliesTo: React Redux 9.3.0
    claims:
      - 官方推荐从 store 推导 RootState、AppDispatch 和 AppStore，并在单独 hooks 文件中创建预类型 Hooks。
      - React Redux 9.1.0 起，useDispatch、useSelector 和 useStore 都提供 withTypes 方法。
      - useSelector 的 state 类型可预先绑定，useDispatch 的 dispatch 类型可预先绑定。
  - title: Redux Toolkit Usage with TypeScript
    url: https://redux-toolkit.js.org/usage/usage-with-typescript
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - RootState 由 store.getState 推导，AppDispatch 由 store.dispatch 推导。
      - configureStore 会根据 reducer 和 middleware 配置推导 dispatch 类型。
      - store 类型、RootState 和 AppDispatch 可以从 store 设置模块导出供其他模块引用。
  - title: React Redux 9.3.0 useDispatch Source
    url: https://github.com/reduxjs/react-redux/blob/v9.3.0/src/hooks/useDispatch.ts
    sourceType: source-code
    appliesTo: React Redux 9.3.0
    claims:
      - useDispatch.withTypes 只预先绑定 dispatch 的 TypeScript 类型，运行时仍返回 Provider store 的 dispatch。
      - useDispatch 实现通过 useStore 取得当前 store，再返回 store.dispatch。
  - title: React Redux 9.3.0 useSelector Source
    url: https://github.com/reduxjs/react-redux/blob/v9.3.0/src/hooks/useSelector.ts
    sourceType: source-code
    appliesTo: React Redux 9.3.0
    claims:
      - useSelector.withTypes 预先绑定 state 类型，组件调用时可以直接传 selector。
  - title: React Redux 9.3.0 useStore Source
    url: https://github.com/reduxjs/react-redux/blob/v9.3.0/src/hooks/useStore.ts
    sourceType: source-code
    appliesTo: React Redux 9.3.0
    claims:
      - useStore.withTypes 预先绑定 store 类型，运行时仍从 Provider 取得当前 store。
  - title: React Redux 9.3.0 withTypes Tests
    url: https://github.com/reduxjs/react-redux/blob/v9.3.0/test/hooks/hooks.withTypes.test.tsx
    sourceType: official-test
    appliesTo: React Redux 9.3.0
    claims:
      - 官方类型测试验证预类型 useDispatch、useSelector 和 useStore 可以在组件中使用。
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

# TypeScript 与预类型 Hooks

## 一、学习目标

- 从 `configureStore` 推导 `RootState`、`AppDispatch` 和 `AppStore`。
- 为 React Redux Hooks 预先绑定应用自己的类型。
- 在组件中使用 `useAppSelector`、`useAppDispatch` 和 `useAppStore`。
- 区分类型推导、运行时 Hook 和 `Provider` 的职责。
- 识别通用 `Dispatch`、未绑定的 Hook 和错误类型声明带来的问题。

## 二、为什么需要应用类型

前面的课程可以直接调用 `useSelector` 和 `useDispatch`，但大型应用的 store 通常还包含多个 reducer 和中间件。
如果每个 selector 都重复写 `RootState`，每个组件又单独处理 dispatch 类型，类型声明会散落在组件中；当 store
结构或 middleware 改变时，旧声明还可能继续通过编译，却没有反映真实的 store 契约。

TypeScript 可以直接从已经创建的 store 推导这些类型。把推导结果集中导出，再创建一组预类型 Hooks，组件就能使用
统一的应用接口，store 的实际变化也会沿着类型推导传到调用点。

## 三、从 store 推导类型

### 1. 推导 RootState

`RootState` 表示 `store.getState()` 返回的完整状态。使用 `ReturnType` 可以让它跟随 reducer 配置变化：

```ts
const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
})

type RootState = ReturnType<typeof store.getState>
```

这里的 `typeof store.getState` 先取得函数类型，`ReturnType` 再取这个函数的返回类型。它不是运行时读取，也不会
创建新的 state。

### 2. 推导 AppDispatch

`AppDispatch` 表示当前 store 的 dispatch 函数类型：

```ts
type AppDispatch = typeof store.dispatch
```

从 store 推导比手写 `Dispatch` 更准确，因为 `configureStore` 会根据 reducer 和 middleware 配置生成 dispatch 类型。
本课只建立类型入口，不展开 thunk 或自定义 middleware 的业务写法；当这些能力加入 store 时，`AppDispatch` 会成为
组件获得对应 dispatch 类型的连接点。

### 3. 推导 AppStore

需要在组件或工具中取得完整 store 类型时，可以推导 `AppStore`：

```ts
type AppStore = typeof store
```

如果 store 由工厂函数创建，也可以使用工厂返回值：

```ts
function createStore() {
  return configureStore({ reducer: rootReducer })
}

type AppStore = ReturnType<typeof createStore>
```

`RootState`、`AppDispatch` 和 `AppStore` 都是类型，不会在浏览器中生成同名值；它们描述的是同一个 store 契约的
不同入口。

## 四、定义预类型 Hooks

### 1. 在独立模块中集中定义

React Redux 官方建议把预类型 Hooks 放在独立文件中。这样组件只导入应用级 Hooks，不需要每次重复导入类型：

```ts
// app/hooks.ts
import { useDispatch, useSelector, useStore } from 'react-redux'
import type { AppDispatch, AppStore, RootState } from './store'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
export const useAppStore = useStore.withTypes<AppStore>()
```

`.withTypes()` 预先绑定的是 TypeScript 类型参数，不会创建新的 Provider 或 store。调用这些 Hook 时仍然需要位于
对应的 `<Provider store={store}>` 子树中。

### 2. 在组件中使用预类型 selector

组件不再为每次选择重复写 `RootState`：

```tsx
const selectCounter = (state: RootState) => state.counter.value

function Counter(): React.ReactElement {
  const value = useAppSelector(selectCounter)
  return <strong>{value}</strong>
}
```

`useAppSelector` 已经知道 state 参数类型，selector 的返回值仍由 TypeScript 自动推断。命名 selector 依旧应该是纯
函数，预类型 Hook 不会改变 selector 的运行规则。

### 3. 在事件中使用预类型 dispatch

组件通过 `useAppDispatch` 取得应用 dispatch，并在事件边界派发 action：

```tsx
function IncrementButton(): React.ReactElement {
  const dispatch = useAppDispatch()

  /** 派发增加 action。 */
  function increment(): void {
    dispatch(counterSlice.actions.incremented())
  }

  return <button type="button" onClick={increment}>增加</button>
}
```

调用方式与未绑定的 `useDispatch` 相同，区别在于返回值带有应用自己的 `AppDispatch` 类型。Hook 仍然只取得函数，
不会因为声明了类型就自动修改状态。

### 4. 在需要时使用预类型 store

`useAppStore` 适合需要访问完整 store API 的基础工具场景：

```tsx
function StoreStatus(): React.ReactElement {
  const store = useAppStore()
  return <span>{store.getState().counter.value}</span>
}
```

组件读取 Redux 状态时仍优先使用 `useAppSelector`，因为它会建立订阅；`useAppStore().getState()` 只是读取当前快照，
不会替代 `useSelector` 的订阅职责。

## 五、Demo：观察预类型 Hooks 的读写闭环

Demo 将 store 类型、预类型 Hooks 和 React 组件拆成独立源码文件。组件使用 `useAppSelector` 读取计数、使用
`useAppDispatch` 派发三个同步 action，并使用 `useAppStore` 确认 Provider store 已连接。

:::demo{id="react.redux.learn.basics.typescript-pretyped-hooks.typed-hooks-demo"}
点击增加、减少和重置，观察预类型 selector 的读数以及 Provider store 的连接状态。
:::

## 六、易错使用提示

:::pitfalls
### 错误：手写与 store 不一致的 RootState

**触发条件：** 另写一个只包含部分字段的 `RootState`，而不是从 store 推导。

**原因：** 手写类型不会随着 reducer 增删同步更新。

**后果：** selector 可能错误地访问字段，真实 store 变化也无法及时反映到组件类型。

**错误示例：**

```ts
type RootState = { counter: { value: number } }
```

**正确写法：**

```ts
type RootState = ReturnType<typeof store.getState>
```

**验证方式：** 修改 store 的 reducer 形状后，确认 RootState 无需重复手写就能反映变化。

### 错误：把通用 Dispatch 当作 AppDispatch

**触发条件：** 用 `Dispatch` 或 `typeof useDispatch` 代替 `typeof store.dispatch`。

**原因：** 通用类型不能表达当前 store 根据 middleware 等配置扩展出的 dispatch 能力。

**后果：** 组件派发应用 action 时失去精确的参数和返回值类型。

**错误示例：**

```ts
import type { Dispatch } from 'redux'

const dispatch: Dispatch = useDispatch()
```

**正确写法：**

```ts
type AppDispatch = typeof store.dispatch
const dispatch: AppDispatch = useDispatch()
```

**验证方式：** 检查 AppDispatch 是否直接来源于当前 store.dispatch。

### 错误：在 store 文件中混合定义预类型 Hooks

**触发条件：** store 文件运行时导入 hooks 文件，hooks 文件又导入 store 的类型和值，形成循环依赖。

**原因：** store 实例和 Hook 模块承担不同的运行时职责。

**后果：** 模块初始化顺序变得脆弱，可能出现未初始化的导出值；类型契约也不易集中维护。

**错误示例：**

```ts
// store.ts
import { useAppSelector } from './hooks'
export const store = configureStore({ reducer: rootReducer })
```

**正确写法：**

```ts
// hooks.ts
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
```

**验证方式：** 检查 store 模块不导入组件 Hook，hooks 模块只以 `import type` 读取 store 类型。

### 错误：以为 withTypes 创建了新的 store 作用域

**触发条件：** 调用 `useAppSelector` 或 `useAppDispatch` 时没有对应的 Provider。

**原因：** `.withTypes()` 只绑定 TypeScript 类型，不改变 Hook 运行时依赖的 React Redux Context。

**后果：** 组件仍会因为缺少 Provider 而抛出上下文错误。

**错误示例：**

```tsx
root.render(<Counter />)
```

**正确写法：**

```tsx
root.render(
  <Provider store={store}>
    <Counter />
  </Provider>,
)
```

**验证方式：** 检查使用预类型 Hooks 的组件是否位于目标 Provider 子树内。

:::

## 七、源码推导与适用场景

### 1. 官方事实

React Redux 9.3.0 的 `useDispatch`、`useSelector` 和 `useStore` 源码都暴露 `.withTypes()`。固定版本源码显示，
该方法返回预先绑定泛型的 Hook；`useDispatch` 的运行实现仍通过 `useStore()` 返回当前 store 的 `dispatch`。
官方类型测试验证预类型 Hooks 可以在 Provider 组件中调用。

Redux Toolkit 官方 TypeScript 文档把 `RootState` 定义为 `ReturnType<typeof store.getState>`，把 `AppDispatch` 定义为
`typeof store.dispatch`，并说明 `configureStore` 会从 reducer 和 middleware 配置推导 dispatch 类型。

### 2. 课程推导

预类型 Hooks 把应用级类型契约放到一个稳定入口：组件关注 selector、事件和展示，store 模块负责状态与 dispatch 类型，
hooks 模块负责 React 绑定。类型推导链保持为“store 配置 -> 应用类型 -> 预类型 Hook -> 组件调用”。

### 3. 适用边界

本课覆盖同步 Redux action、RootState/AppDispatch/AppStore 推导和 React Redux 预类型 Hooks。异步 thunk 的返回类型、
自定义 middleware、`createAsyncThunk.withTypes()`、多 store context 和高级类型工具不在本课展开。

## 八、练习

:::exercise
### 练习目标

**要求：** 创建一个带 `counter` reducer 的 store，推导 `RootState` 和 `AppDispatch`，在独立 `hooks.ts` 中使用
`useSelector.withTypes<RootState>()` 与 `useDispatch.withTypes<AppDispatch>()` 创建 `useAppSelector` 和
`useAppDispatch`。创建 `CounterPanel`，通过 `useAppSelector` 显示 `state.counter.value`，通过
`useAppDispatch` 在“增加 1”按钮事件中派发 slice action。组件必须位于 `Provider` 内，不能手写 RootState，也不能在
render 或 selector 中 dispatch。

**验收：** `RootState` 来自 `ReturnType<typeof store.getState>`，`AppDispatch` 来自 `typeof store.dispatch`；hooks
文件只导入 store 类型并导出两个预类型 Hooks；初始值为 `0`，点击按钮后为 `1`；Provider、selector 和 dispatch
边界正确。

**参考答案：**

```tsx
// store.ts
import { configureStore, createSlice } from '@reduxjs/toolkit'

export const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    incremented: (state) => {
      state.value += 1
    },
  },
})

export const store = configureStore({
  reducer: { counter: counterSlice.reducer },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// hooks.ts
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

// CounterPanel.tsx
import { Provider } from 'react-redux'
import type { ReactElement } from 'react'

import { counterSlice, store } from './store'
import { useAppDispatch, useAppSelector } from './hooks'
import type { RootState } from './store'

const selectCounter = (state: RootState) => state.counter.value

/** 显示计数并使用预类型 Hooks 派发事件。 */
function CounterPanel(): ReactElement {
  const value = useAppSelector(selectCounter)
  const dispatch = useAppDispatch()

  /** 派发增加 action。 */
  function increment(): void {
    dispatch(counterSlice.actions.incremented())
  }

  return (
    <section>
      <p>{value}</p>
      <button type="button" onClick={increment}>
        增加 1
      </button>
    </section>
  )
}

/** 在 Provider 中渲染计数面板。 */
export function App(): ReactElement {
  return (
    <Provider store={store}>
      <CounterPanel />
    </Provider>
  )
}
```
:::

## 九、本节小结

- `RootState` 通常写成 `ReturnType<typeof store.getState>`。
- `AppDispatch` 通常写成 `typeof store.dispatch`，不要用手写通用 Dispatch 替代。
- `useDispatch.withTypes<AppDispatch>()`、`useSelector.withTypes<RootState>()` 和 `useStore.withTypes<AppStore>()`
  可以集中创建应用级 Hooks。
- `.withTypes()` 只绑定类型，运行时仍需要正确的 Provider 和 store。
- 组件使用预类型 Hooks，store 类型和 React 绑定职责保持分离。

## 十、参考资料

- [React Redux Usage with TypeScript](https://react-redux.js.org/using-react-redux/usage-with-typescript) - 支持 RootState、AppDispatch、AppStore 推导和预类型 Hooks 的官方推荐。
- [Redux Toolkit Usage with TypeScript](https://redux-toolkit.js.org/usage/usage-with-typescript) - 支持 configureStore 推导 dispatch 类型和 store 类型导出。
- [React Redux 9.3.0 useDispatch Source](https://github.com/reduxjs/react-redux/blob/v9.3.0/src/hooks/useDispatch.ts) - 支持 `withTypes` 的固定源码事实。
- [React Redux 9.3.0 useSelector Source](https://github.com/reduxjs/react-redux/blob/v9.3.0/src/hooks/useSelector.ts) - 支持预先绑定 RootState 的固定源码事实。
- [React Redux 9.3.0 useStore Source](https://github.com/reduxjs/react-redux/blob/v9.3.0/src/hooks/useStore.ts) - 支持预先绑定 AppStore 的固定源码事实。
- [React Redux 9.3.0 withTypes Tests](https://github.com/reduxjs/react-redux/blob/v9.3.0/test/hooks/hooks.withTypes.test.tsx) - 支持预类型 Hooks 的官方类型测试。
