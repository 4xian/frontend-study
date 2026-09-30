---
id: react.redux.learn.basics.create-slice
type: lesson
title: createSlice
summary: 用 Redux Toolkit 把状态、case reducer 和自动生成的 action creator 组织成一个可复用 slice。
domain: frontend
technology: react
module: redux
stage: basics
level: beginner
estimatedMinutes: 85
prerequisites:
  - react.redux.learn.basics.configure-store
related: []
tags:
  - Redux Toolkit
  - createSlice
  - Slice
  - Action Creator
  - Reducer
appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1
verifiedAt: 2026-08-27
objectives:
  - 能从 @reduxjs/toolkit 导入 createSlice，并写出 name、initialState 与 reducers 配置。
  - 能从 slice.actions 取得自动生成的 action creator，并准确推导生成的 action type。
  - 能使用 slice.reducer 处理生成的 action，并观察初始状态、单次更新和带 payload 的更新结果。
  - 能解释 name 是 action type 的命名空间前缀，而不是自动增加的 state 字段。
  - 能识别普通 reducers 配置与可选 prepare 配置的职责边界，并把 slice.reducer 交给后续 store。
recap:
  - createSlice 用 name、initialState 和 reducers 一次组织 slice 的状态规则。
  - 每个 reducers key 都会生成同名 action creator，action type 形如 name/key。
  - slice.reducer 是可交给 configureStore 的 reducer，slice.actions 是可 dispatch 的 action creator 集合。
  - 调用 action creator 才会得到 action 对象；带参数的 action creator 会把参数放入 payload。
  - prepare 是可选的 payload 预处理入口，本课只掌握它返回 action 输入的最小结构。
sources:
  - title: Redux Toolkit 2.12.0 createSlice API
    url: https://github.com/reduxjs/redux-toolkit/blob/576a02f8056fbee2dcaddb4d2e4d2da3b7937c58/docs/api/createSlice.mdx
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - createSlice 接收 name、initialState 和 reducers，并自动生成 action creators、action types 与 slice reducer。
      - name 用作生成 action type 的命名空间前缀，reducers 的每个 key 对应一个 case reducer 和 action creator。
      - reducers 项可以使用 reducer 与 prepare 组合来自定义 action payload。
  - title: Redux Toolkit 2.12.0 createSlice Source
    url: https://github.com/reduxjs/redux-toolkit/blob/576a02f8056fbee2dcaddb4d2e4d2da3b7937c58/packages/toolkit/src/createSlice.ts
    sourceType: source-code
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 固定源码为每个普通 reducer key 注册 name/key，并通过 createAction 暴露同名 action creator。
      - 固定源码把 case reducer 注册到 slice.reducer，并返回 actions、caseReducers、getInitialState 等成员。
      - prepare 配置会作为 createAction 的 prepare callback 使用。
  - title: Redux Toolkit 2.12.0 createSlice Tests
    url: https://github.com/reduxjs/redux-toolkit/blob/576a02f8056fbee2dcaddb4d2e4d2da3b7937c58/packages/toolkit/src/tests/createSlice.test.ts
    sourceType: official-test
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 官方测试确认 actions.increment() 会生成带有 cool/increment type 的 action。
      - 官方测试确认 slice.reducer(undefined, action) 会从 initialState 计算下一份状态。
      - 官方测试确认缺少有效 initialState 时会报告明确错误。
  - title: Redux Toolkit 2.12.0 npm Latest Metadata
    url: https://registry.npmjs.org/@reduxjs%2ftoolkit/latest
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - npm latest 在核验日指向 Redux Toolkit 2.12.0，并对应固定官方仓库提交。
---

# createSlice

## 一、学习目标

- 用一个 slice 配置集中表达状态起点和状态更新规则。
- 观察 `slice.actions` 自动生成的 action creator 与 action type。
- 使用 `slice.reducer` 直接推导状态变化，并把它交给后续的 store 配置。
- 解释 `name`、reducer key、action type 和 payload 之间的关系。
- 识别 `prepare` 的最小用途，不把本课扩展到异步、extraReducers 或复杂类型推导。

## 二、为什么需要 createSlice

手写 Redux reducer 时，通常要分别声明 action type 常量、action creator、reducer 分支和导出关系。状态规则一多，
这些名称很容易失去对应关系，维护时也要在多个位置同步修改。

`createSlice` 把一组相关状态规则放进一个配置对象。你提供 slice 的名字、初始状态和 reducers 映射，Redux Toolkit
就会同时返回 reducer 和 actions。这样 action 的命名空间与处理它的 case reducer 来自同一个 key，不需要手写重复的
type 字符串。

## 三、核心概念

### 1. 三个必需的基础配置

最小配置由 `name`、`initialState` 和 `reducers` 组成：

```ts
import { createSlice } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1
    },
  },
})
```

`name` 提供 action type 的前缀；`initialState` 是 reducer 在没有现有状态时使用的起点；`reducers` 的每个 key
描述一个能处理对应 action 的 case reducer。`name` 不会自动成为状态对象的一层字段，状态形状仍由
`initialState` 决定。

### 2. actions 与 action type 的生成关系

上例中的 `increment` key 会生成 `counterSlice.actions.increment`。调用它才会得到 action 对象：

```ts
const action = counterSlice.actions.increment()

action.type // 'counter/increment'
```

生成规则可以写成：

```text
action.type = `${name}/${reducerKey}`
```

因此，改动 `name` 或 reducer key 会改变生成的 action type。调用方应从 slice 导出的 `actions` 使用 action creator，
不要在业务代码里重新拼接同名字符串。

### 3. slice.reducer 连接状态计算

`createSlice` 返回的 `reducer` 是一个普通 Redux reducer，可以单独接收旧状态和 action：

```ts
const first = counterSlice.reducer(undefined, counterSlice.actions.increment())
const second = counterSlice.reducer(first, counterSlice.actions.increment())

first // { value: 1 }
second // { value: 2 }
```

也可以把它直接交给 `configureStore`：

```ts
import { configureStore } from '@reduxjs/toolkit'

const store = configureStore({
  reducer: counterSlice.reducer,
})
```

本课先用直接调用 reducer 观察生成关系；store、Provider 和组件 Hooks 的组合仍沿前面课程的职责边界逐步加入。

### 4. 带 payload 的 case reducer

需要输入数据时，在 case reducer 的第二个参数读取 action payload：

```ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload
    },
  },
})

const action = counterSlice.actions.incrementByAmount(3)
action // { type: 'counter/incrementByAmount', payload: 3 }
```

参数由自动生成的 action creator 放进 `payload`，case reducer 再读取这个字段。Action 与 payload 的完整概念体系留到
下一课，本课只建立这条可执行的输入路径。

### 5. prepare 的最小边界

当 action creator 需要先把调用参数整理成 payload，可以为某个 reducer key 提供 `reducer` 与 `prepare`：

```ts
const todoSlice = createSlice({
  name: 'todos',
  initialState: [] as { id: string; text: string }[],
  reducers: {
    addTodo: {
      reducer: (state, action: { payload: { id: string; text: string } }) => {
        state.push(action.payload)
      },
      prepare: (text: string) => ({
        payload: { id: `todo-${text.length}`, text },
      }),
    },
  },
})

const action = todoSlice.actions.addTodo('学习 Redux')
// action.type === 'todos/addTodo'
// action.payload === { id: 'todo-8', text: '学习 Redux' }
```

`prepare` 至少返回带 `payload` 的对象，也可以按 API 约定附带 `meta` 或 `error`。本课不展开复杂类型推导、creator
callback notation、异步 action 或 `extraReducers`。

## 四、用法与示例

### 1. 导出 slice 的两个主要成员

实际 feature 模块通常从同一个文件导出 reducer 和 actions：

```ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type CounterState = { value: number }

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 } satisfies CounterState,
  reducers: {
    increment: (state) => {
      state.value += 1
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload
    },
  },
})

export const { increment, incrementByAmount } = counterSlice.actions
export const counterReducer = counterSlice.reducer
```

`actions` 适合由组件或业务流程 dispatch；`counterReducer` 适合交给 `configureStore`。两者来自同一份 slice 配置，
不会因为手写字符串而失去对应关系。

### 2. 推导一条状态轨迹

下面的轨迹不依赖 React，可以在普通 TypeScript 中验证：

```ts
const start = counterSlice.reducer(undefined, { type: 'init' })
const afterIncrement = counterSlice.reducer(start, counterSlice.actions.increment())
const afterAmount = counterSlice.reducer(afterIncrement, counterSlice.actions.incrementByAmount(4))

console.log({ start, afterIncrement, afterAmount })
// { start: { value: 0 }, afterIncrement: { value: 1 }, afterAmount: { value: 5 } }
```

未知 action 会保留当前状态；生成的 action type 只会匹配对应 reducer key。需要持久化、异步请求或跨 slice 响应时，
应在后续课程使用相应的 store、middleware 或 `extraReducers` 能力，不在本课塞进一个 slice。

## 五、Demo：观察自动生成的 actions 与 reducer

下面的 Demo 创建一个真实 `counterSlice` 和真实 Redux store，界面显示 slice 配置、最近一次生成的 action，以及
store dispatch 前后的状态。按钮只调用 `slice.actions`，不会手写 action type 字符串。

:::demo{id="react.redux.learn.basics.create-slice.create-slice-demo"}
观察 `createSlice` 如何从 reducer key 生成 action creator/type，并通过 reducer 更新 store 状态。
:::

## 六、易错使用提示

:::pitfalls
### 错误：直接把 reducer key 当成 action 对象

**触发条件：** 把 `counterSlice.actions.increment` 直接传给 `dispatch`，没有调用 action creator。

**原因：** `actions.increment` 是函数，真正的 action 对象需要执行 `actions.increment()` 才会生成。

**后果：** dispatch 收到的不是带 `type` 的 action，类型检查或运行时会失败。

**错误示例：**

```ts
store.dispatch(counterSlice.actions.increment)
```

**正确写法：**

```ts
store.dispatch(counterSlice.actions.increment())
```

**验证方式：** 在 dispatch 前检查 `counterSlice.actions.increment()` 的 `type` 是否为 `counter/increment`。

### 错误：把 name 当成 state 的字段

**触发条件：** 配置 `name: 'counter'` 后，预期 `slice.reducer` 返回 `{ counter: { value: 0 } }`。

**原因：** `name` 只用于生成 action type 命名空间，不会改变 `initialState` 的形状。

**后果：** 按错误路径读取状态，或在 reducer 对象配置和单 reducer 配置之间混淆根状态结构。

**错误示例：**

```ts
const state = counterSlice.reducer(undefined, { type: 'init' })
console.log(state.counter.value)
```

**正确写法：**

```ts
const state = counterSlice.reducer(undefined, { type: 'init' })
console.log(state.value)
```

**验证方式：** 直接查看 `slice.reducer(undefined, { type: 'init' })` 的返回值，再决定读取路径。

### 错误：手写与 slice 不一致的 action type

**触发条件：** reducer key 是 `increment`，业务代码却 dispatch `counter/incremented`。

**原因：** 自动生成的 type 严格使用 `${name}/${reducerKey}`，不会根据相似词语自动匹配。

**后果：** reducer 不会命中该 action，状态保持原值，问题只能从字符串差异中排查。

**错误示例：**

```ts
store.dispatch({ type: 'counter/incremented' })
```

**正确写法：**

```ts
store.dispatch(counterSlice.actions.increment())
```

**验证方式：** 优先使用 `slice.actions`，或把 action 的 `type` 与 `${name}/${reducerKey}` 逐字比较。

### 错误：在 slice 外直接修改 state

**触发条件：** 读取 reducer 返回的状态后，直接给字段赋值而不经过生成的 action 和 reducer。

**原因：** `createSlice` 只为 reducer 内的 case 规则提供更新入口；外部修改绕过 Redux 数据流。

**后果：** store 无法按 dispatch 记录和通知这次变化，其他读取方也不会得到一致更新。

**错误示例：**

```ts
const state = store.getState()
state.value += 1
```

**正确写法：**

```ts
store.dispatch(counterSlice.actions.increment())
```

**验证方式：** 每次共享状态变化都应能找到对应的 action 和 reducer case，而不是一个外部赋值。

### 错误：为一个简单参数过早加入 prepare 或复杂配置

**触发条件：** 普通数值 action 也包成 prepare、creator callback 或异步流程，导致调用路径难以阅读。

**原因：** `prepare` 是需要整理输入时的可选入口，不是所有 reducer 都必须增加的一层。

**后果：** 简单的 payload 来源被隐藏，学习者难以判断参数从哪里进入 action。

**错误示例：**

```ts
incrementByAmount: {
  prepare: (amount: number) => ({ payload: amount }),
  reducer: (state, action) => {
    state.value += action.payload
  },
}
```

**正确写法：**

```ts
incrementByAmount: (state, action: PayloadAction<number>) => {
  state.value += action.payload
}
```

**验证方式：** 如果调用参数已经能直接成为 payload，就保留普通 reducer 写法；只有需要组装输入时才加入 prepare。
:::

## 七、源码推导与适用场景

### 1. 官方事实

Redux Toolkit 2.12.0 的 `createSlice` 源码读取 `name`、`initialState` 和 `reducers`，为普通 reducer key 生成
`${name}/${key}`，注册对应 case reducer，并暴露同名 action creator。返回值包含 `actions`、`reducer` 和
`caseReducers` 等成员；`prepare` 配置会把自定义的 prepare callback 交给 action 创建器。

官方测试用一个 `cool` slice 断言 `actions.increment()` 的 type 为 `cool/increment`，再调用
`reducer(undefined, action)` 验证初始状态更新。测试还覆盖了缺少有效 `initialState` 时的错误提示。它们证明的是
固定版本的 API 行为，不意味着应用代码应该复制内部注册流程。

### 2. 课程推导

可以把一个 slice 看成“同一组状态规则的命名模块”：`name` 负责命名空间，reducer key 负责事件名，`actions` 负责
生成事件对象，`reducer` 负责计算状态。因为这些成员来自同一份配置，后续 store 只需要接入 reducer，组件或流程只需
使用 actions，就能保持名称和处理规则一致。

### 3. 适用边界

本课只覆盖普通 `reducers`、自动生成的 actions、`slice.reducer` 和 prepare 的最小入口。`extraReducers`、selector、
异步 thunk、RTK Query、复杂 creator callback notation 和 Immer 更新机制分别放到后续课程；不要为展示 createSlice
而把这些概念提前揉进一个示例。

## 八、练习

:::exercise
### 练习目标

**要求：** 使用 `createSlice` 创建 `scoreSlice`。初始状态为 `{ score: 10 }`，提供 `increment` 和
`add` 两个 reducer；`increment` 加一，`add` 把调用参数加入 `payload` 后累加。导出 slice 的 actions 和
reducer，并用 reducer 依次计算初始状态、加一、加五三个结果。

**验收：** `scoreSlice.actions.increment().type` 必须是 `score/increment`；`scoreSlice.actions.add(5)` 的
payload 必须是 `5`；三个状态结果依次为 `{ score: 10 }`、`{ score: 11 }`、`{ score: 16 }`，且没有手写
`score/increment` action 对象。

**参考答案：**

```ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type ScoreState = { score: number }

const scoreSlice = createSlice({
  name: 'score',
  initialState: { score: 10 } satisfies ScoreState,
  reducers: {
    increment: (state) => {
      state.score += 1
    },
    add: (state, action: PayloadAction<number>) => {
      state.score += action.payload
    },
  },
})

export const { increment, add } = scoreSlice.actions
export const scoreReducer = scoreSlice.reducer

const initial = scoreReducer(undefined, { type: 'init' })
const afterIncrement = scoreReducer(initial, increment())
const afterAdd = scoreReducer(afterIncrement, add(5))

console.log({
  actionType: increment().type,
  payload: add(5).payload,
  states: [initial, afterIncrement, afterAdd],
})
// actionType: 'score/increment'
// payload: 5
// states: [{ score: 10 }, { score: 11 }, { score: 16 }]
```
:::

## 九、本节小结

- `createSlice` 用 `name`、`initialState` 和 `reducers` 把一组 Redux 状态规则组织在一起。
- 每个 reducer key 都会生成同名 action creator，type 遵循 `${name}/${reducerKey}`。
- `slice.actions` 负责创建 action，`slice.reducer` 负责处理 action 并计算下一份状态。
- name 是 action type 前缀，不会改变 initialState 的根形状。
- 普通参数直接由 action creator 形成 payload；需要整理输入时才使用 prepare。

## 十、参考资料

- [Redux Toolkit createSlice API](https://github.com/reduxjs/redux-toolkit/blob/576a02f8056fbee2dcaddb4d2e4d2da3b7937c58/docs/api/createSlice.mdx) - 支持配置字段、自动生成成员和 prepare 的公开合同。
- [Redux Toolkit createSlice Source](https://github.com/reduxjs/redux-toolkit/blob/576a02f8056fbee2dcaddb4d2e4d2da3b7937c58/packages/toolkit/src/createSlice.ts) - 支持 action type、case reducer 注册和返回成员的固定实现事实。
- [Redux Toolkit createSlice Tests](https://github.com/reduxjs/redux-toolkit/blob/576a02f8056fbee2dcaddb4d2e4d2da3b7937c58/packages/toolkit/src/tests/createSlice.test.ts) - 支持生成 action 与 reducer 初始更新的官方测试行为。
- [Redux Toolkit npm Latest Metadata](https://registry.npmjs.org/@reduxjs%2ftoolkit/latest) - 支持核验日的稳定版本。
