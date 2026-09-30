---
id: react.redux.learn.basics.multiple-slices-root-state
type: lesson
title: 多 Slice 与 RootState
summary: 使用多个 slice reducer 组成清晰的 Redux 状态树，并让 RootState 自动反映每个分支的类型。
domain: frontend
technology: react
module: redux
stage: basics
level: beginner
estimatedMinutes: 75
prerequisites:
  - react.redux.learn.basics.typescript-pretyped-hooks
related: []
tags:
  - Redux Toolkit
  - createSlice
  - configureStore
  - 多 Slice
  - RootState
  - combineReducers
appliesTo: React Redux 9.3.0、Redux Toolkit 2.12.0、Redux 5.0.1、React 19.2.8
verifiedAt: 2026-08-30
objectives:
  - 能使用多个 createSlice reducer 配置 configureStore。
  - 能说明 reducer 配置对象的键名如何形成 RootState 的分支。
  - 能从多 Slice store 推导包含所有分支的 RootState。
  - 能为不同 slice 编写指向正确分支的 selector 和 action。
  - 能识别 slice reducer、root state 和组件读取边界之间的区别。
recap:
  - 每个 slice reducer 负责一个状态分支，configureStore 的 reducer 对象把分支组合成 root reducer。
  - reducer 对象的键名就是 RootState 中对应的字段名，不能只看 reducer 变量名猜测状态路径。
  - RootState 应从 store.getState 推导，新增或删除 slice 后类型会同步变化。
  - selector 从完整 RootState 进入具体分支，action creator 仍由所属 slice 提供。
  - 多 Slice 组合不会把状态字段自动摊平，也不要求在组件里直接导入 store 实例。
sources:
  - title: Redux Toolkit configureStore API
    url: https://redux-toolkit.js.org/api/configureStore
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - configureStore 的 reducer 参数可以是 reducer 函数，也可以是会传给 combineReducers 的 reducer 对象。
      - reducer 对象会生成 root reducer，并参与 store 的状态类型推导。
  - title: Redux Using combineReducers
    url: https://redux.js.org/usage/structuring-reducers/using-combinereducers
    sourceType: api-doc
    appliesTo: Redux 5.0.1
    claims:
      - combineReducers 接收 reducer 映射对象，并返回一个按键名组织状态的组合 reducer。
      - 组合后的状态对象字段对应传入 reducer 映射的键，键名应表达该分支承载的数据。
  - title: React Redux Usage with TypeScript
    url: https://react-redux.js.org/using-react-redux/usage-with-typescript
    sourceType: api-doc
    appliesTo: React Redux 9.3.0
    claims:
      - RootState 通常由 store.getState 的返回类型推导。
      - 预类型 useSelector 可以直接读取多分支 RootState，而无需在组件中重复标注 state 类型。
  - title: Redux Toolkit 2.12.0 configureStore Source
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/configureStore.ts
    sourceType: source-code
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - configureStore 在 reducer 参数为对象时调用 combineReducers，并将组合结果作为 root reducer。
      - reducer 对象和组合后的 root reducer共同决定 store 的状态形状。
  - title: Redux 5.0.1 combineReducers Source
    url: https://github.com/reduxjs/redux/blob/v5.0.1/src/combineReducers.ts
    sourceType: source-code
    appliesTo: Redux 5.0.1
    claims:
      - combineReducers 为每个 reducer 映射键读取对应状态，并构造同形状的状态对象。
      - 组合 reducer 会分别执行各分支 reducer，再根据分支结果决定根状态是否变化。
  - title: Redux Toolkit 2.12.0 configureStore Tests
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/tests/configureStore.test.ts
    sourceType: official-test
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 官方测试验证传入 reducer 对象时 configureStore 会调用 combineReducers 并创建 store。
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
  - title: React Redux 9.3.0 npm Latest Metadata
    url: https://registry.npmjs.org/react-redux/latest
    sourceType: official-reference
    appliesTo: React Redux 9.3.0
    claims:
      - npm latest 在核验日指向 React Redux 9.3.0。
---

# 多 Slice 与 RootState

## 一、学习目标

- 使用多个 `createSlice` reducer 配置同一个 `configureStore`。
- 说明 reducer 配置对象的键名如何形成 `RootState` 的分支。
- 从多 Slice store 推导包含所有分支的 `RootState`。
- 为不同 slice 编写指向正确分支的 selector 和 action。
- 区分 slice reducer、root state 和组件读取边界。

## 二、为什么需要多个 Slice

一个 slice 适合描述一个局部状态和它的同步更新逻辑。应用继续增加功能后，计数、偏好设置、通知等状态如果都放在同一个
slice 中，状态结构和 action 列表会越来越难定位。把不同数据域拆成多个 slice，可以让每个 reducer 保持较小，同时仍由一个
store 为 React 组件提供统一状态树。

多 Slice 不是创建多个 Redux store。应用通常只有一个 store，store 的 root reducer 再把多个 slice reducer 组合起来。组件
通过完整的 `RootState` 读取需要的分支，通过对应 slice 导出的 action creator 发出更新意图。

## 三、Slice reducer 如何组成状态树

### 1. 每个 slice reducer 返回一个分支

`createSlice` 返回的 `slice.reducer` 是一个普通 Redux reducer。它只处理自己的状态形状：

```ts
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    incremented: (state) => {
      state.value += 1
    },
  },
})

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: { theme: 'light' as 'light' | 'dark' },
  reducers: {
    themeToggled: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
  },
})
```

`counterSlice.reducer` 不负责 `preferences`，反过来也一样。每个 reducer 都会收到 action，但只有匹配自己 action type 的
处理器会更新自己的分支。

### 2. reducer 对象的键名决定状态路径

将 slice reducer 作为 `reducer` 对象的属性传给 `configureStore`：

```ts
const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
    preferences: preferencesSlice.reducer,
  },
})
```

此时状态树的形状是：

```ts
{
  counter: { value: 0 },
  preferences: { theme: 'light' },
}
```

`counter` 和 `preferences` 是 reducer 对象的键，也是 selector 访问 `state.counter` 和 `state.preferences` 时使用的路径。
`createSlice` 的 `name` 会影响 action type 前缀，但不会单独决定 root state 的字段名。

### 3. 也可以显式使用 combineReducers

`configureStore` 接收 reducer 对象时，会为你调用 Redux 的 `combineReducers`。如果需要先得到 root reducer，也可以显式组合：

```ts
import { combineReducers, configureStore } from '@reduxjs/toolkit'

const rootReducer = combineReducers({
  counter: counterSlice.reducer,
  preferences: preferencesSlice.reducer,
})

const store = configureStore({ reducer: rootReducer })
```

两种写法得到的状态树形状相同。一般情况下直接把 reducer 对象传给 `configureStore` 更简洁；只有需要复用 root reducer 或
单独测试组合结果时，才有必要把 `combineReducers` 写出来。

## 四、从多 Slice store 推导 RootState

### 1. 使用 store.getState 推导

组合多个 reducer 后，不要重新手写一个只包含部分字段的 `RootState`。直接从实际 store 推导：

```ts
export type RootState = ReturnType<typeof store.getState>
```

这样 `RootState` 会包含 `counter` 和 `preferences` 两个分支。以后在 reducer 对象中增加 `notifications`，selector 的 state
参数也会自动获得 `state.notifications` 类型。

### 2. 让 selector 进入正确分支

selector 接收完整 root state，再沿状态树访问需要的字段：

```ts
const selectCounterValue = (state: RootState) => state.counter.value
const selectTheme = (state: RootState) => state.preferences.theme
```

使用预类型 `useAppSelector` 时，不需要在每个组件里重复写 `RootState`：

```tsx
const counterValue = useAppSelector(selectCounterValue)
const theme = useAppSelector(selectTheme)
```

selector 的路径应该与 reducer 对象的键保持一致。把 `state.value` 写成 `state.counter.value` 之前，先确认 `value` 是
root state 的字段还是某个 slice 分支里的字段。

### 3. action 仍由所属 slice 提供

读取路径由 root state 决定，更新 action 仍从具体 slice 的 `actions` 导出：

```tsx
dispatch(counterSlice.actions.incremented())
dispatch(preferencesSlice.actions.themeToggled())
```

一个 action 会经过 root reducer 的所有分支，但通常只有产生该 action 的 slice 会改变自己的状态。组件不需要手动调用每个
reducer，也不需要把 slice state 合并到一个平面对象。

## 五、Demo：观察多个 Slice 的状态分支

Demo 使用 `counter` 和 `preferences` 两个 slice 配置同一个 store，页面分别显示 `state.counter.value`、
`state.preferences.theme` 以及对应的状态树路径。点击增加计数或切换主题时，可以观察一个分支变化而另一个分支保持独立；
恢复初始状态会分别派发两个 slice 的 action。

:::demo{id="react.redux.learn.basics.multiple-slices-root-state.multiple-slices-root-state-demo"}
点击增加计数、切换主题和恢复初始状态，观察两个 slice 在同一个 RootState 中的分支路径。
:::

## 六、易错使用提示

:::pitfalls
### 错误：把 slice 对象当作 reducer 传入

**触发条件：** 把 `counterSlice` 直接写进 `configureStore({ reducer: ... })`，而不是使用 `counterSlice.reducer`。

**原因：** `configureStore` 需要 reducer 函数或 reducer 函数映射对象，slice 对象还包含 actions、name 等其他属性。

**后果：** store 初始化时会拒绝无效的 reducer 映射，状态树无法按预期创建。

**错误示例：**

```ts
configureStore({ reducer: { counter: counterSlice } })
```

**正确写法：**

```ts
configureStore({ reducer: { counter: counterSlice.reducer } })
```

**验证方式：** 检查 reducer 对象的每个值是否都是 reducer 函数。

### 错误：只看 slice name 猜测 state 路径

**触发条件：** slice 的 `name` 是 `settings`，但 reducer 对象使用了 `preferences` 键，仍然访问 `state.settings`。

**原因：** action type 前缀和 root state 字段由两个不同配置决定。

**后果：** selector 访问不存在的字段，TypeScript 会报告路径错误，运行时也无法读取预期值。

**错误示例：**

```ts
const preferencesSlice = createSlice({ name: 'settings', ... })
const store = configureStore({ reducer: { preferences: preferencesSlice.reducer } })
const selectTheme = (state: RootState) => state.settings.theme
```

**正确写法：**

```ts
const selectTheme = (state: RootState) => state.preferences.theme
```

**验证方式：** 先查看 `configureStore` 的 reducer 对象键，再确定 selector 的 root state 路径。

### 错误：手写只包含一个分支的 RootState

**触发条件：** 多 Slice store 仍手写 `RootState`，遗漏 `preferences` 或其他分支。

**原因：** 手写类型与实际 store 配置分开维护。

**后果：** selector 类型无法反映完整状态树，新增 slice 后还可能继续使用过期声明。

**错误示例：**

```ts
type RootState = { counter: { value: number } }
```

**正确写法：**

```ts
type RootState = ReturnType<typeof store.getState>
```

**验证方式：** 在 reducer 对象中新增或删除一个分支，确认 RootState 会随 store 类型变化。

### 错误：把多个 slice state 摊平成 root state

**触发条件：** 以为 `counterSlice.reducer` 和 `preferencesSlice.reducer` 会把 `value`、`theme` 直接放在 root 上。

**原因：** reducer 对象的每个键对应一个分支，组合过程不会自动展开分支内部字段。

**后果：** 错误使用 `state.value` 或 `state.theme`，selector 路径与实际状态树不一致。

**错误示例：**

```ts
const selectTheme = (state: RootState) => state.theme
```

**正确写法：**

```ts
const selectTheme = (state: RootState) => state.preferences.theme
```

**验证方式：** 打印或检查 `store.getState()`，确认每个 reducer 对象键都是 root state 的一级字段。

:::

## 七、源码推导与适用场景

### 1. 官方事实

Redux Toolkit 2.12.0 的 `configureStore` 实现接收 reducer 对象时会调用 Redux 的 `combineReducers`，再把组合后的
root reducer 交给 store。Redux 5.0.1 的 `combineReducers` 会按 reducer 映射的键分别读取和写入状态分支，因此键名构成
组合状态对象的一级字段。

React Redux 的 TypeScript 文档建议从 `store.getState` 推导 `RootState`。这条类型推导会把多个 reducer 分支合并后的实际
状态形状暴露给 selector 和预类型 Hooks。

### 2. 课程推导

多 Slice 的最小心智模型是“slice reducer -> reducer 映射键 -> root state 分支 -> selector 路径”。只要先确定 reducer 对象
的键，再从 store 推导 `RootState`，组件就能在不复制状态声明的情况下读取正确分支。

### 3. 适用边界

本课覆盖同步 slice reducer 的组合、reducer 对象键名和多分支 `RootState` 推导。状态所有权决策、Feature 目录拆分、动态
reducer、标准化实体和异步请求不在本课展开。

## 八、练习

:::exercise
### 练习目标

**要求：** 创建 `counter` 和 `preferences` 两个 slice，并把它们作为 reducer 对象传给 `configureStore`。从 store 推导
`RootState`，在独立 hooks 文件中创建 `useAppSelector`，再创建 `Dashboard` 组件读取 `state.counter.value` 与
`state.preferences.theme`。为两个 slice 各提供一个按钮，分别派发所属 slice 的 action。不能手写只包含一个分支的
`RootState`，不能把 slice 对象本身传给 `reducer`，也不能把分支字段摊平到 root state。

**验收：** `store.getState()` 同时包含 `counter` 和 `preferences` 两个一级字段；`RootState` 来自
`ReturnType<typeof store.getState>`；两个 selector 路径分别为 `state.counter.value` 和 `state.preferences.theme`；
点击按钮只改变对应 slice 的展示值，另一个分支仍可正常读取；组件位于 `Provider` 内。

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

export const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: { theme: 'light' as 'light' | 'dark' },
  reducers: {
    themeToggled: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
  },
})

export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
    preferences: preferencesSlice.reducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// hooks.ts
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

// Dashboard.tsx
import { Provider } from 'react-redux'
import type { ReactElement } from 'react'
import type { RootState } from './store'

import { counterSlice, preferencesSlice, store } from './store'
import { useAppDispatch, useAppSelector } from './hooks'

const selectCounterValue = (state: RootState) => state.counter.value
const selectTheme = (state: RootState) => state.preferences.theme

/** 读取两个 slice 分支并派发对应 action。 */
function Dashboard(): ReactElement {
  const counterValue = useAppSelector(selectCounterValue)
  const theme = useAppSelector(selectTheme)
  const dispatch = useAppDispatch()

  /** 派发 counter slice 的增加 action。 */
  function increment(): void {
    dispatch(counterSlice.actions.incremented())
  }

  /** 派发 preferences slice 的切换 action。 */
  function toggleTheme(): void {
    dispatch(preferencesSlice.actions.themeToggled())
  }

  return (
    <section>
      <p>计数：{counterValue}</p>
      <p>主题：{theme}</p>
      <button type="button" onClick={increment}>增加计数</button>
      <button type="button" onClick={toggleTheme}>切换主题</button>
    </section>
  )
}

/** 在 Provider 中渲染多 Slice 面板。 */
export function App(): ReactElement {
  return (
    <Provider store={store}>
      <Dashboard />
    </Provider>
  )
}
```
:::

## 九、本节小结

- 多个 `slice.reducer` 可以通过 `configureStore({ reducer: { ... } })` 组成一个 store。
- reducer 对象的键名决定 `RootState` 的一级字段，slice 的 `name` 主要影响 action type 前缀。
- `RootState` 应从 `ReturnType<typeof store.getState>` 推导，避免遗漏分支。
- selector 从完整 root state 进入对应 slice 分支，action creator 从所属 slice 导出。
- 组合多个 slice 不等于创建多个 store，也不会把各分支字段自动摊平。

## 十、参考资料

- [Redux Toolkit configureStore API](https://redux-toolkit.js.org/api/configureStore) - 支持 reducer 对象和 root reducer 组合规则。
- [Redux Using combineReducers](https://redux.js.org/usage/structuring-reducers/using-combinereducers) - 支持 reducer 映射键与组合状态形状。
- [React Redux Usage with TypeScript](https://react-redux.js.org/using-react-redux/usage-with-typescript) - 支持从 store 推导 RootState 和预类型 Hooks。
- [Redux Toolkit 2.12.0 configureStore Source](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/configureStore.ts) - 支持 configureStore 调用 combineReducers 的固定源码事实。
- [Redux 5.0.1 combineReducers Source](https://github.com/reduxjs/redux/blob/v5.0.1/src/combineReducers.ts) - 支持组合 reducer 按键构造 root state 的固定源码事实。
- [Redux Toolkit 2.12.0 configureStore Tests](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/tests/configureStore.test.ts) - 支持 reducer 对象会调用 combineReducers 的官方测试。
