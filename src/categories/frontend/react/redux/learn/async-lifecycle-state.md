---
id: react.redux.learn.intermediate.async-lifecycle-state
type: lesson
title: 异步生命周期状态
summary: 将 createAsyncThunk 的生命周期 action 映射为互斥请求状态，并据此稳定渲染数据、等待和失败界面。
domain: frontend
technology: react
module: redux
stage: intermediate
level: intermediate
estimatedMinutes: 105
prerequisites:
  - react.redux.learn.intermediate.create-async-thunk
related:
  - react.redux.learn.basics.create-slice
  - react.redux.learn.basics.use-selector
  - react.redux.learn.basics.use-dispatch
tags:
  - Redux Toolkit
  - async lifecycle
  - request status
  - pending
  - fulfilled
  - rejected
appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1、React Redux 9.3.0、React 19.2.8
verifiedAt: 2026-08-30
objectives:
  - 能用 idle、pending、succeeded、failed 联合类型表达互斥请求状态。
  - 能让 pending、fulfilled、rejected action 分别更新状态、数据和错误字段。
  - 能使用 extraReducers 的精确 addCase 连接异步 Thunk 与拥有业务状态的 Slice。
  - 能根据请求状态派生等待、成功和失败界面，而不是保存多组互相矛盾的布尔值。
  - 能明确 pending 时是否保留旧数据、何时清除错误以及何时恢复 idle。
recap:
  - createAsyncThunk 只生成生命周期 action，不会替应用设计请求状态。
  - 一个互斥 status 字段可以排除 loading、success、failed 同时成立的非法组合。
  - pending 负责进入等待态并清理上次错误，fulfilled 保存 payload，rejected 保存普通错误信息。
  - 是否在刷新和失败时保留旧数据是业务策略，不是 Redux Toolkit 的固定行为。
  - 组件应从 Redux 状态派生界面和禁用条件，不再复制一份本地请求状态。
sources:
  - title: Redux Toolkit createAsyncThunk API
    url: https://redux-toolkit.js.org/api/createAsyncThunk
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - createAsyncThunk 为每次派发生成 pending、fulfilled 和 rejected 生命周期 action。
      - Reducer 可以引用附加在异步 Thunk action creator 上的生命周期 action creator。
      - createAsyncThunk 不会自动创建 Reducer 或决定应用的请求状态结构。
  - title: Redux Toolkit createSlice API
    url: https://redux-toolkit.js.org/api/createSlice
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - extraReducers builder 可以用 addCase 响应 Slice 自身 reducers 之外的 action。
      - 传入 action creator 时，builder callback 可以推导 action payload 类型。
  - title: Redux Essentials Part 5 - Async Logic and Data Fetching
    url: https://redux.js.org/tutorials/essentials/part-5-async-logic
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1
    claims:
      - 官方教程使用互斥 status 字段表达 idle、pending、succeeded 和 failed。
      - pending、fulfilled、rejected Reducer 分别负责等待态、成功数据和失败信息。
      - React 组件根据 status 决定是否发起请求以及渲染何种界面。
  - title: Redux Toolkit 2.12.0 createAsyncThunk Source
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/createAsyncThunk.ts
    sourceType: source-code
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 固定源码在执行 payloadCreator 前派发 pending action。
      - 固定源码等待 payloadCreator 后创建并派发 fulfilled 或 rejected 最终 action。
      - 固定源码只派发 action，不包含应用业务 state 的字段或更新策略。
  - title: React Redux Usage with TypeScript
    url: https://react-redux.js.org/using-react-redux/usage-with-typescript
    sourceType: api-doc
    appliesTo: React Redux 9.3.0
    claims:
      - 官方建议从实际 store 推导 RootState 和 AppDispatch。
      - useSelector.withTypes 与 useDispatch.withTypes 可以建立预类型 Hooks。
  - title: Redux Toolkit 2.12.0 npm Latest Metadata
    url: https://registry.npmjs.org/@reduxjs/toolkit/latest
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
  - title: React 19.2.8 npm Latest Metadata
    url: https://registry.npmjs.org/react/latest
    sourceType: official-reference
    appliesTo: React 19.2.8
    claims:
      - npm latest 在核验日指向 React 19.2.8。
---

# 异步生命周期状态

## 一、学习目标

- 用 `idle | pending | succeeded | failed` 表达一个请求当前所处的唯一阶段。
- 将异步 Thunk 的 `pending`、`fulfilled`、`rejected` action 映射到 Redux state。
- 在成功时保存业务 payload，在失败时保存普通错误信息。
- 根据 Redux 中的请求状态派生等待、成功和失败界面。
- 明确刷新期间保留旧数据、清理旧错误和手动恢复初始状态的策略。

## 二、为什么需要请求状态

异步请求不仅产生最终数据。请求开始后，界面需要阻止重复提交或显示等待提示；请求成功后需要展示新数据；请求失败后需要提供
可读反馈。只有一个 `items` 数组时，空数组可能表示“还没请求”“请求中”“成功但结果为空”或“请求失败”，组件无法区分这些
完全不同的情况。

`createAsyncThunk` 已经把一次异步工作的过程表示为三个 action：

```text
pending -> fulfilled
        -> rejected
```

但 action 只是发生过的事件。应用仍要决定 Redux state 如何记录当前事实。最小请求状态通常包含：

```ts
type RequestStatus = 'idle' | 'pending' | 'succeeded' | 'failed'

type CatalogState = {
  items: CourseSummary[]
  status: RequestStatus
  error: string | null
}
```

这三个字段各自回答一个问题：当前有哪些数据、请求处于什么阶段、最近一次失败是什么。

## 三、建立互斥状态模型

### 1. 用一个 status 排除非法组合

不要分别保存 `isLoading`、`isSuccess` 和 `isFailed`：

```ts
type FragileState = {
  isLoading: boolean
  isSuccess: boolean
  isFailed: boolean
}
```

三个布尔值能组合出八种结果，其中“同时加载成功并失败”等组合没有业务意义。一个字符串联合类型只能取一个值，因此非法组合
无法进入状态：

```ts
type RequestStatus = 'idle' | 'pending' | 'succeeded' | 'failed'
```

各状态可以这样理解：

| 状态 | 含义 | 常见界面行为 |
| --- | --- | --- |
| `idle` | 尚未开始，或已明确恢复初始状态 | 允许首次加载 |
| `pending` | 请求已经开始，最终 action 尚未到达 | 显示等待，禁用重复操作 |
| `succeeded` | 最近一次请求成功 | 展示最新 payload |
| `failed` | 最近一次请求失败 | 展示错误，可保留已有数据 |

状态名是应用模型，不是 action type 的复制。`fulfilled` 是一次成功事件，应用可以把当前状态命名为更适合阅读的
`succeeded`。

### 2. 初始状态要表达真实事实

```ts
const initialState: CatalogState = {
  items: [],
  status: 'idle',
  error: null,
}
```

`idle` 表示请求尚未开始，而不是“请求成功但没有数据”。如果页面一进入就必须加载，组件可以在观察到 `idle` 时派发请求；如果
由按钮触发，则 `idle` 只是等待用户操作。

### 3. 明确允许的转换

最小状态机允许这些转换：

```text
idle       -> pending
succeeded  -> pending
failed     -> pending
pending    -> succeeded
pending    -> failed
任意稳定态 -> idle（显式重置）
```

从 `succeeded` 或 `failed` 再次进入 `pending` 表示重新请求。组件不需要同时维护“是否重新加载”布尔值；它可以结合
`status` 与现有 `items` 判断是首次加载还是刷新。

## 四、用生命周期 action 更新 Slice

### 1. pending 进入等待态

`pending` 在 `payloadCreator` 执行前派发。对应 Reducer 负责开始一次新尝试：

```ts
builder.addCase(loadCourseCatalog.pending, (state) => {
  state.status = 'pending'
  state.error = null
})
```

开始新请求时清除上一次错误，可以避免界面同时显示“正在加载”和旧失败信息。本例没有清空 `items`，因此刷新时旧数据仍可读。

### 2. fulfilled 保存 payload

```ts
builder.addCase(loadCourseCatalog.fulfilled, (state, action) => {
  state.status = 'succeeded'
  state.items = action.payload
  state.error = null
})
```

传入 `loadCourseCatalog.fulfilled` action creator 后，builder callback 能推导 `action.payload` 的业务类型。这里选择替换整个
目录；追加、合并或按 ID 更新属于业务数据策略。

### 3. rejected 保存普通错误信息

```ts
builder.addCase(loadCourseCatalog.rejected, (state, action) => {
  state.status = 'failed'
  state.error = action.error.message ?? '未知请求错误'
})
```

普通抛错会被序列化到 `action.error`。本课只建立失败状态和通用错误文本，不定义业务拒绝 payload。

### 4. 在 extraReducers 中响应外部 action

异步 Thunk 的生命周期 action 不是 `catalogSlice.reducers` 生成的，因此 Slice 使用 `extraReducers` 响应它们：

```ts
const catalogSlice = createSlice({
  name: 'courseCatalog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCourseCatalog.pending, pendingReducer)
      .addCase(loadCourseCatalog.fulfilled, fulfilledReducer)
      .addCase(loadCourseCatalog.rejected, rejectedReducer)
  },
})
```

本课只使用精确 action creator 的 `addCase` 形式。通用 matcher、批量 action 处理和默认分支不属于请求状态模型本身。

## 五、从 Redux 状态派生界面

### 1. 组件读取同一份请求事实

```tsx
const status = useAppSelector((state) => state.courseCatalog.status)
const items = useAppSelector((state) => state.courseCatalog.items)
const error = useAppSelector((state) => state.courseCatalog.error)
```

不要再用组件本地 `useState` 保存另一份 `isLoading`。如果 Redux 和组件各自维护一次请求状态，两者可能因为遗漏某个分支而
分歧。

### 2. 根据 status 决定操作和反馈

```tsx
const isPending = status === 'pending'

return (
  <>
    <button disabled={isPending} onClick={() => void dispatch(loadCourseCatalog(false))}>
      {isPending ? '加载中' : '加载课程'}
    </button>
    {status === 'failed' && <p role="alert">{error}</p>}
    {status === 'succeeded' && <CourseList items={items} />}
  </>
)
```

`status` 是源事实，`isPending` 是渲染期间派生的布尔值，不需要进入 Redux state。禁用按钮、等待文案和错误区域都从同一个
状态得出。

### 3. 区分首次加载与刷新

```ts
const isInitialLoading = status === 'pending' && items.length === 0
const isRefreshing = status === 'pending' && items.length > 0
```

这两个界面状态可以从已有事实推导。首次加载可以显示完整占位；刷新可以继续展示旧数据并提供较轻的等待提示。

## 六、决定数据与错误策略

### 1. pending 时是否清空旧数据

两种策略都可能正确：

- 保留数据：刷新期间页面稳定，适合已有内容仍有阅读价值的场景。
- 清空数据：避免旧数据被误认为当前结果，适合参数变化后旧内容已经无效的场景。

关键是显式选择，而不是因为写了 `pending` Reducer 就机械清空数组。本课 Demo 在刷新和失败时保留最近一次成功数据。

### 2. 何时清理错误

新请求开始时清除旧错误，成功时再次保证错误为空，失败时写入新错误。这样 `error !== null` 始终描述当前请求状态，而不会
残留上一次失败。

### 3. 何时恢复 idle

成功后通常保留 `succeeded`，失败后保留 `failed`，让界面知道最近结果。只有业务明确要求“忘记这次请求”时才恢复
`idle`，例如用户关闭面板或执行重置。

## 七、Demo：异步生命周期状态台

:::demo{id="react.redux.learn.intermediate.async-lifecycle-state.request-state-demo"}
:::

操作时重点观察：

1. 初始状态为 `idle`，业务数据为空，错误字段为 `null`。
2. “加载成功结果”真实派发异步 Thunk，状态记录依次出现 `pending` 和 `succeeded`，payload 进入课程列表。
3. 成功后再运行失败请求，状态记录出现 `pending` 和 `failed`，错误字段更新，但最近一次成功数据仍保留。
4. 新请求的 `pending` Reducer 会先清除旧错误。
5. “恢复 idle”同时清空数据、错误和教学观察记录，可以重复验证相同转换。

Demo 使用真实 `configureStore`、`createAsyncThunk`、`createSlice`、`Provider` 和预类型 Hooks。状态历史只帮助观察 Reducer
实际经历的转换，业务 Slice 通常只保存当前状态、数据和错误。

## 八、易错使用提示

:::pitfalls
### 错误：用多组布尔值表达互斥阶段

**触发条件：** 同时保存 `isLoading`、`isSuccess` 和 `isFailed`，并在每个 Reducer 中分别修改。

**原因：** 独立布尔值不会自动互斥，遗漏一次复位就会产生非法组合。

**后果：** 页面可能同时显示加载、成功和失败区域，调用方无法判断哪个状态可信。

**错误示例：**

```ts
state.isLoading = true
// 忘记把 isFailed 恢复为 false
```

**正确写法：**

```ts
state.status = 'pending'
```

**验证方式：** 枚举状态可能值；联合类型只有四个合法分支，三组布尔值会产生八种组合。

### 错误：只在 pending 更新状态

**触发条件：** 请求开始时写入 `pending`，但成功或失败 Reducer 没有写入终态。

**原因：** Redux Toolkit 会派发最终 action，但不会替应用修改业务 state。

**后果：** 按钮一直禁用，界面永久显示加载中。

**错误示例：**

```ts
builder.addCase(loadCourseCatalog.pending, (state) => {
  state.status = 'pending'
})
```

**正确写法：**

```ts
builder
  .addCase(loadCourseCatalog.pending, (state) => {
    state.status = 'pending'
  })
  .addCase(loadCourseCatalog.fulfilled, (state) => {
    state.status = 'succeeded'
  })
  .addCase(loadCourseCatalog.rejected, (state) => {
    state.status = 'failed'
  })
```

**验证方式：** 分别让服务成功和失败，确认两条路径都能离开 `pending`。

### 错误：无条件在 pending 清空已有数据

**触发条件：** 每次刷新开始都执行 `state.items = []`，没有评估旧数据是否仍可阅读。

**原因：** 把“正在获取新数据”和“当前没有任何数据”当成同一个事实。

**后果：** 刷新期间列表闪空，失败后用户也失去最近一次成功结果。

**错误示例：**

```ts
builder.addCase(loadCourseCatalog.pending, (state) => {
  state.status = 'pending'
  state.items = []
})
```

**正确写法：**

```ts
builder.addCase(loadCourseCatalog.pending, (state) => {
  state.status = 'pending'
  state.error = null
  // 当前业务允许刷新期间继续显示旧数据。
})
```

**验证方式：** 先成功加载，再重新请求并让它失败；确认旧列表是否符合产品预期地保留或清空。

### 错误：新请求开始后仍显示旧错误

**触发条件：** `rejected` 写入了 `error`，后续 `pending` 没有清理。

**原因：** 错误字段仍描述上一次请求，却和当前等待状态同时展示。

**后果：** 用户看到“正在加载”和“加载失败”同时出现，无法理解当前进度。

**错误示例：**

```ts
builder.addCase(loadCourseCatalog.pending, (state) => {
  state.status = 'pending'
})
```

**正确写法：**

```ts
builder.addCase(loadCourseCatalog.pending, (state) => {
  state.status = 'pending'
  state.error = null
})
```

**验证方式：** 先失败再重试；一进入 `pending`，旧错误区域就应消失。

### 错误：Redux 和组件各保存一份 loading

**触发条件：** Slice 已有 `status`，组件仍用 `useState(false)` 维护 `isLoading`。

**原因：** 两份状态由不同代码路径更新，任何提前返回或异常分支都可能只更新其中一份。

**后果：** Redux 已经 `failed`，按钮却仍处于组件本地 loading；或请求仍在运行，组件已重新启用按钮。

**错误示例：**

```tsx
const [isLoading, setIsLoading] = useState(false)
const status = useAppSelector((state) => state.courseCatalog.status)
```

**正确写法：**

```tsx
const status = useAppSelector((state) => state.courseCatalog.status)
const isLoading = status === 'pending'
```

**验证方式：** 检查组件没有 `setIsLoading`，所有等待反馈都由 Redux 的 `status` 派生。
:::

## 九、源码推导与适用场景

### 1. pending 确实先于 payloadCreator

Redux Toolkit 2.12.0 固定源码先调用 `dispatch(pending(...))`，随后才把 `payloadCreator` 放入 Promise 流程。

由此可以推导：`pending` Reducer 是建立等待态、清理旧错误和禁用重复操作的可靠入口。它不表示网络已经返回，只表示本次异步
工作已经开始。

### 2. 最终 action 在异步结果确定后派发

固定源码把正常结果包装为 `fulfilled`，把抛出结果包装为 `rejected`，离开捕获逻辑后再派发 `finalAction`。

由此可以推导：两个最终 Reducer 都必须把状态从 `pending` 转换到稳定终态。组件不应猜测 Promise 的内部进度，而应读取
Reducer 已经写入的状态。

### 3. 状态字段是应用策略

固定源码生成 action 并返回最终 action，没有创建 `status`、`items` 或 `error` 字段。官方教程提供常见状态模型，但字段名、
数据保留和重置规则仍由应用决定。

由此可以推导：`idle | pending | succeeded | failed` 是清晰的单请求模型，不是 Redux Toolkit 强制 schema。业务可以使用
`loading` 或 `rejected` 等命名，只要状态互斥且所有转换一致。

本课只讨论同一业务区域的一次请求状态，不延伸到多个请求之间的协调。

## 十、练习

:::exercise
### 为报告请求建立完整生命周期状态

**要求：** 创建一个可运行的 React Redux 页面。定义 `ReportState`，使用互斥的
`idle | pending | succeeded | failed` 状态、`report` 和 `error` 字段。使用 `createAsyncThunk` 创建可成功或抛出普通错误的
`loadReport`，并在 Slice 中精确响应 `pending`、`fulfilled`、`rejected`：开始时清除旧错误，成功时保存 payload，失败时保留
已有报告并保存 `action.error.message`。组件提供成功、失败和重置按钮，所有禁用和反馈必须从 Redux state 派生。

**验收：** 初始为 `idle`；成功请求依次经过 `pending` 和 `succeeded`，页面显示报告标题；随后失败时进入 `failed`，显示普通
错误但仍保留上次报告；重新请求进入 `pending` 时旧错误消失；重置后报告、错误和状态全部恢复初始值。组件不得另建本地
loading state。

**参考答案：**

```tsx
import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { ComponentType, ReactElement } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'

type RequestStatus = 'idle' | 'pending' | 'succeeded' | 'failed'

type Report = {
  id: string
  title: string
}

type ReportState = {
  report: Report | null
  status: RequestStatus
  error: string | null
}

/** 创建报告模块的初始请求状态。 */
function createInitialState(): ReportState {
  return {
    report: null,
    status: 'idle',
    error: null,
  }
}

/** 模拟可成功或抛出普通错误的报告服务。 */
async function requestReport(shouldFail: boolean): Promise<Report> {
  await Promise.resolve()

  if (shouldFail) {
    throw new Error('报告服务暂时不可用')
  }

  return { id: 'weekly', title: '每周学习报告' }
}

const loadReport = createAsyncThunk('report/load', requestReport)

const reportSlice = createSlice({
  name: 'report',
  initialState: createInitialState(),
  reducers: {
    resetReport: createInitialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadReport.pending, (state) => {
        state.status = 'pending'
        state.error = null
      })
      .addCase(loadReport.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.report = action.payload
        state.error = null
      })
      .addCase(loadReport.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? '未知请求错误'
      })
  },
})

const { resetReport } = reportSlice.actions

const store = configureStore({
  reducer: {
    report: reportSlice.reducer,
  },
})

type RootState = ReturnType<typeof store.getState>
type AppDispatch = typeof store.dispatch

const useAppDispatch = useDispatch.withTypes<AppDispatch>()
const useAppSelector = useSelector.withTypes<RootState>()

/** 展示报告数据和唯一请求状态。 */
function ReportPanel(): ReactElement {
  const dispatch = useAppDispatch()
  const reportState = useAppSelector((state) => state.report)
  const isPending = reportState.status === 'pending'

  /** 派发一次报告请求，结果状态由 Slice Reducer 统一维护。 */
  async function runRequest(shouldFail: boolean): Promise<void> {
    await dispatch(loadReport(shouldFail))
  }

  /** 恢复报告模块的完整初始状态。 */
  function reset(): void {
    dispatch(resetReport())
  }

  return (
    <main>
      <h1>报告请求</h1>
      <p aria-live="polite">当前状态：{reportState.status}</p>
      <button type="button" disabled={isPending} onClick={() => void runRequest(false)}>
        加载成功报告
      </button>
      <button type="button" disabled={isPending} onClick={() => void runRequest(true)}>
        加载失败报告
      </button>
      <button type="button" disabled={isPending} onClick={reset}>
        重置
      </button>
      <p>报告：{reportState.report?.title ?? '暂无报告'}</p>
      <p role={reportState.error ? 'alert' : undefined}>
        错误：{reportState.error ?? '没有错误'}
      </p>
    </main>
  )
}

/** 挂载练习所需的 Redux Provider。 */
function App(): ReactElement {
  return (
    <Provider store={store}>
      <ReportPanel />
    </Provider>
  )
}

/** 导出可运行的练习根组件。 */
export function createApp(): ComponentType {
  return App
}
```
:::

## 十一、本节小结

- 生命周期 action 是事件，`status`、数据和错误字段是应用对当前事实的建模。
- 一个联合类型状态可以排除多组布尔值产生的非法组合。
- `pending` 进入等待态并清除旧错误，`fulfilled` 保存 payload，`rejected` 保存普通错误。
- 保留还是清空旧数据必须由业务场景决定，Redux Toolkit 不替应用选择。
- 组件从 Redux `status` 派生禁用、等待和失败界面，不再复制本地 loading。

## 十二、参考资料

- [Redux Toolkit createAsyncThunk API](https://redux-toolkit.js.org/api/createAsyncThunk)
- [Redux Toolkit createSlice API](https://redux-toolkit.js.org/api/createSlice)
- [Redux Essentials Part 5：Async Logic and Data Fetching](https://redux.js.org/tutorials/essentials/part-5-async-logic)
- [Redux Toolkit 2.12.0 createAsyncThunk 源码](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/createAsyncThunk.ts)
- [React Redux Usage with TypeScript](https://react-redux.js.org/using-react-redux/usage-with-typescript)
- [Redux Toolkit 2.12.0 npm 最新版元数据](https://registry.npmjs.org/@reduxjs/toolkit/latest)
- [Redux 5.0.1 npm 最新版元数据](https://registry.npmjs.org/redux/latest)
- [React Redux 9.3.0 npm 最新版元数据](https://registry.npmjs.org/react-redux/latest)
- [React 19.2.8 npm 最新版元数据](https://registry.npmjs.org/react/latest)
