---
id: react.redux.learn.intermediate.thunk-async-logic
type: lesson
title: Thunk 异步逻辑
summary: 使用手写 Thunk 在 Redux 外部组织一次性异步流程，并正确使用 dispatch、getState 与返回值。
domain: frontend
technology: react
module: redux
stage: intermediate
level: intermediate
estimatedMinutes: 95
prerequisites:
  - react.redux.learn.intermediate.use-selector-result-identity-and-subscription
related:
  - react.redux.learn.basics.configure-store
  - react.redux.learn.basics.use-dispatch
  - react.redux.learn.basics.typescript-pretyped-hooks
tags:
  - Redux Toolkit
  - Redux Thunk
  - Async Logic
  - dispatch
  - getState
  - AppThunk
appliesTo: Redux Toolkit 2.12.0、Redux Thunk 3.1.0、Redux 5.0.1、React Redux 9.3.0、React 19.2.8
verifiedAt: 2026-08-30
objectives:
  - 能解释 Thunk action creator 与内部 Thunk 函数的两层结构。
  - 能说明 thunk middleware 为什么可以让 dispatch 接收函数。
  - 能在手写 Thunk 中使用 dispatch、getState 和 await 组织一次性异步流程。
  - 能根据业务语义决定在异步边界之前还是之后读取 state。
  - 能用 AppThunk 与预类型 AppDispatch 保留参数、状态和返回值类型。
  - 能判断手写 Thunk 与长连接监听、服务端缓存等其他副作用方案的边界。
recap:
  - Thunk action creator 返回函数，真正的业务逻辑在 dispatch 之后由 middleware 调用。
  - configureStore 默认加入 thunk middleware，普通 action 仍继续进入 reducer。
  - 内部 Thunk 可以通过 dispatch 提交普通 action，通过 getState 读取调用时的最新状态。
  - 异步前读取的是流程启动快照，异步后再次读取的是完成时的最新状态。
  - thunk middleware 会把内部函数的返回值交还给 dispatch 调用方，因此 Promise 可以被等待。
  - Thunk 适合一次性流程，不负责长期监听其他 action，也不应默认承载完整服务端缓存。
sources:
  - title: Writing Logic with Thunks
    url: https://redux.js.org/usage/writing-logic-thunks
    sourceType: api-doc
    appliesTo: Redux 5.0.1、Redux Toolkit 2.12.0、Redux Thunk 3.1.0
    claims:
      - Redux Thunk 允许把函数传给 dispatch，并向内部函数提供 dispatch、getState 与可选额外参数。
      - configureStore 默认加入 thunk middleware，无需在标准 Redux Toolkit store 中重复安装。
      - thunk middleware 把内部函数的返回值作为 dispatch 的返回值。
      - Thunk 适合复杂同步逻辑与简单到中等的一次性异步流程，不适合长期监听其他 action。
  - title: Redux Usage with TypeScript
    url: https://redux.js.org/usage/usage-with-typescript
    sourceType: api-doc
    appliesTo: Redux 5.0.1、Redux Thunk 3.1.0
    claims:
      - ThunkAction 的泛型依次描述返回值、RootState、额外参数和可派发的普通 action。
      - 返回 Promise 的手写 Thunk 应在 AppThunk 的返回值泛型中保留对应 Promise 类型。
      - 组件需要使用能够识别 Thunk 的 AppDispatch，而不是只接受普通 action 的基础 Dispatch。
  - title: Redux Side Effects Approaches
    url: https://redux.js.org/usage/side-effects-approaches
    sourceType: api-doc
    appliesTo: Redux 5.0.1、Redux Toolkit 2.12.0
    claims:
      - Thunk 适合需要访问 dispatch 与 getState 的逻辑，以及一次性的中等复杂度异步工作。
      - 持续响应 action、长连接和服务端数据缓存应根据生命周期选择其他工具。
  - title: Redux Toolkit configureStore API
    url: https://redux-toolkit.js.org/api/configureStore
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 未提供 middleware 选项时，configureStore 使用 getDefaultMiddleware 返回的默认 middleware 集合。
      - 自定义 middleware 配置会决定最终安装到 store 的 middleware 集合。
  - title: React Redux Usage with TypeScript
    url: https://react-redux.js.org/using-react-redux/usage-with-typescript
    sourceType: api-doc
    appliesTo: React Redux 9.3.0
    claims:
      - 官方建议从实际 store 推导 AppDispatch，并通过 useDispatch.withTypes 创建预类型 Hook。
      - 预类型 dispatch Hook 能让组件正确派发并等待手写 Thunk。
  - title: Redux Thunk 3.1.0 Middleware Source
    url: https://github.com/reduxjs/redux-thunk/blob/v3.1.0/src/index.ts
    sourceType: source-code
    appliesTo: Redux Thunk 3.1.0
    claims:
      - 固定源码检查 dispatch 收到的值是否为函数；函数会被调用并获得 dispatch、getState 与 extraArgument。
      - 固定源码直接返回内部 Thunk 的调用结果，普通 action 则继续交给下一个 middleware。
  - title: Redux Thunk 3.1.0 Type Source
    url: https://github.com/reduxjs/redux-thunk/blob/v3.1.0/src/types.ts
    sourceType: source-code
    appliesTo: Redux Thunk 3.1.0
    claims:
      - ThunkDispatch 通过重载区分普通 action 与 Thunk，并保留内部 Thunk 返回值。
      - ThunkAction 类型固定描述 dispatch、getState、extraArgument 和 ReturnType。
  - title: Redux Toolkit 2.12.0 npm Latest Metadata
    url: https://registry.npmjs.org/@reduxjs/toolkit/latest
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - npm latest 在核验日指向 Redux Toolkit 2.12.0。
  - title: Redux Thunk 3.1.0 npm Latest Metadata
    url: https://registry.npmjs.org/redux-thunk/latest
    sourceType: official-reference
    appliesTo: Redux Thunk 3.1.0
    claims:
      - npm latest 在核验日指向 Redux Thunk 3.1.0。
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

# Thunk 异步逻辑

## 一、学习目标

- 识别 Thunk action creator 与内部 Thunk 函数的两层结构。
- 解释 thunk middleware 如何扩展 `dispatch`，同时保留普通 action 的数据流。
- 使用 `dispatch`、`getState` 和 `await` 编排一次性异步任务。
- 区分流程启动时的 state 快照与异步完成时的最新 state。
- 为手写 Thunk、预类型 Hook 和异步返回值建立完整 TypeScript 类型。
- 判断 Thunk 适合解决的问题，以及应交给其他副作用工具的场景。

## 二、为什么需要 Thunk

Reducer 必须根据当前 state 和 action 同步计算下一份 state。网络请求、计时器、文件读取等副作用不能放进 Reducer，但组件
也不应该负责知道每一步业务 action 的派发顺序。例如“发布草稿”可能需要：

1. 读取 Redux 中的当前草稿。
2. 判断内容是否为空。
3. 派发一个普通 action，记录流程已经开始。
4. 等待发布服务。
5. 派发另一个普通 action，保存服务结果。

如果这些步骤全部留在点击处理器中，业务流程会依赖某个组件，其他入口难以复用。Thunk 把这段流程放在 Redux 逻辑层，同时
仍然让最终状态变化由普通 action 和 Reducer 完成。

“Thunk”原本表示一段延迟执行的工作。在 Redux 中，Thunk 是一个稍后由 middleware 调用的函数；它不是 Reducer 能处理的
普通 action 对象。

## 三、Thunk 的最小模型

### 1. 外层 action creator 返回内层函数

手写 Thunk 通常有两层函数：

```ts
/** 创建一段稍后执行的发布流程。 */
const publishDraft = (draftId: string) => {
  /** 在 middleware 调用后执行实际逻辑。 */
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const draft = getState().drafts.entities[draftId]
    if (!draft) return

    const result = await publishToService(draft)
    dispatch(draftPublished(result))
  }
}
```

外层 `publishDraft(draftId)` 接收业务参数并返回函数。`dispatch(publishDraft(draftId))` 把内层函数交给 middleware，内层函数
才会得到当前 store 的 `dispatch` 与 `getState`。

外层函数不是强制语法。如果流程不需要业务参数，也可以直接定义一个 Thunk 函数。但 action creator 形式便于传参、复用和
测试，也是应用代码的常见组织方式。

### 2. middleware 在 Reducer 之前识别函数

固定版本的 `redux-thunk` 核心行为可以简化为：

```ts
/** 展示 thunk middleware 的核心分支。 */
const thunkMiddleware =
  ({ dispatch, getState }: MiddlewareApi) =>
  (next: Next) =>
  (action: unknown) => {
    if (typeof action === 'function') {
      return action(dispatch, getState)
    }

    return next(action)
  }
```

收到函数时，middleware 调用它，不把函数继续传给 Reducer。收到普通 action 对象时，middleware 调用 `next(action)`，原有
单向数据流不变。因此 Thunk 负责“何时、按什么顺序派发”，Reducer 仍只负责“每个普通 action 如何改变 state”。

### 3. configureStore 默认提供 Thunk 能力

Redux Toolkit 的 `configureStore` 默认使用 `getDefaultMiddleware`，其中包含 thunk middleware：

```ts
import { configureStore } from '@reduxjs/toolkit'

/** 创建带默认 middleware 的 store。 */
const store = configureStore({
  reducer: rootReducer,
})
```

标准配置不需要再次安装 `redux-thunk`。如果把 `middleware` 完全替换为空集合，函数 dispatch 能力也会随之消失；自定义
middleware 时应从 `getDefaultMiddleware()` 开始追加。

### 4. dispatch、getState 与额外参数

内部 Thunk 的完整形状包含三个参数：

```ts
type ThunkBody = (
  dispatch: AppDispatch,
  getState: () => RootState,
  extraArgument: unknown,
) => ReturnValue
```

- `dispatch`：派发普通 action，也可以继续派发其他 Thunk。
- `getState`：在调用发生的那一刻读取完整 Redux state。
- `extraArgument`：可选的依赖注入入口；未配置时通常使用 `unknown` 或 `undefined` 表示。

本课聚焦 `dispatch` 与 `getState`。额外参数适合注入 API client 等依赖，但不改变 Thunk 的基本执行模型。

## 四、组织一次性异步流程

### 1. 先定义可复用的 AppThunk

`ThunkAction` 的四个泛型依次表示返回值、state、额外参数和普通 action 类型：

```ts
import { type ThunkAction, type UnknownAction } from '@reduxjs/toolkit'

type AppThunk<ReturnValue = void> = ThunkAction<
  ReturnValue,
  RootState,
  unknown,
  UnknownAction
>
```

如果 Thunk 返回 Promise，就把 Promise 写进第一个泛型，而不是仍然使用默认的 `void`：

```ts
type PublishThunk = AppThunk<Promise<string | null>>
```

这让调用方能够准确等待结果，并区分成功字符串与提前退出的 `null`。

### 2. 副作用留在 Thunk 或服务层

异步服务函数不应进入 Reducer：

```ts
/** 把草稿发送到发布服务。 */
async function publishToService(draft: string): Promise<string> {
  const response = await fetch('/api/publications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ draft }),
  })

  if (!response.ok) throw new Error('发布失败')
  const data: { title: string } = await response.json()
  return data.title
}
```

Thunk 可以调用该服务并决定后续派发什么；Reducer 只接收已经准备好的可序列化 payload。

### 3. 在异步边界前保存业务快照

如果任务语义是“发布用户点击时看到的内容”，应在 `await` 之前读取并保存快照：

```ts
/** 发布启动时的草稿快照。 */
const publishCurrentDraft = (): AppThunk<Promise<string | null>> =>
  async (dispatch, getState) => {
    const snapshot = getState().publishing.draft.trim()

    if (!snapshot) {
      dispatch(publishingSkipped())
      return null
    }

    dispatch(publishingStarted(snapshot))
    const published = await publishToService(snapshot)
    dispatch(publishingFinished(published))
    return published
  }
```

等待期间用户仍可能编辑 Redux 中的草稿，但当前请求继续使用启动时的 `snapshot`。这不是陈旧读取，而是明确的业务语义。

### 4. 在异步边界后读取最新状态

有些流程需要根据服务完成时的最新 state 决定下一步，此时可以在 `await` 之后再次调用 `getState()`：

```ts
/** 完成保存后，仅在编辑器仍显示同一草稿时清空输入。 */
const saveAndClearUnchangedDraft = (): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const snapshot = getState().publishing.draft
    await saveDraft(snapshot)

    if (getState().publishing.draft === snapshot) {
      dispatch(draftCleared())
    }
  }
```

前一次读取回答“任务以什么输入开始”，后一次读取回答“任务完成时应用处于什么状态”。选择读取时机必须对应业务问题，不能
把 `getState()` 当作永远不变的快照。

### 5. dispatch 会返回内部 Thunk 的返回值

thunk middleware 直接返回内部函数的调用结果。因此异步 Thunk 返回 Promise 时，组件可以等待它：

```tsx
/** 运行发布流程并使用 Thunk 返回值。 */
async function handlePublish(): Promise<void> {
  const published = await dispatch(publishCurrentDraft())
  setMessage(published === null ? '没有可发布内容' : `已发布：${published}`)
}
```

这里等待的是 Thunk 自己返回的 Promise。不要假定每个 Thunk 都返回相同结构；返回值由该 Thunk 的公共类型决定。

### 6. 组件使用能够识别 Thunk 的 AppDispatch

从实际 store 推导 `AppDispatch`，再创建预类型 Hook：

```ts
type AppDispatch = typeof store.dispatch

/** 创建应用统一使用的预类型 dispatch Hook。 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
```

基础 `Dispatch<UnknownAction>` 只描述普通 action，无法表达 `dispatch(thunk)` 及其返回值。预类型 Hook 同时保留默认
middleware 对 dispatch 的扩展。

## 五、职责与适用边界

### 1. 适合 Thunk 的场景

Thunk 适合一次触发、完成后结束的流程：

- 读取当前 Redux state 后决定是否派发。
- 调用一次服务，并按结果派发一个或多个普通 action。
- 按顺序派发多个步骤，或复用另一个 Thunk。
- 把可等待的 Promise 或业务结果返回给调用方。

手写 Thunk 尤其适合步骤不完全符合固定请求模板、需要 `getState` 条件判断，或需要返回自定义结果的命令式流程。

### 2. 不适合长期运行或被动监听

Thunk 是一次调用的函数，没有自动监听后续 action 的生命周期。WebSocket、长期订阅、持续响应其他 action 的工作不应通过
一个永不结束的 Thunk 勉强维持，应选择能显式管理订阅与清理的工具。

服务端数据如果需要缓存、去重、失效和重新获取，也不应默认长期复制进普通 Redux slice。Thunk 可以完成一次请求，但缓存
所有权仍应由专门的数据获取方案决定。

### 3. 与异步 action creator 工具的边界

手写 Thunk 让开发者自己命名并派发流程中的普通 action。Redux Toolkit 还提供生成标准请求 action 的工具，但那属于另一项
知识点。本课只要求理解 Thunk 函数如何被执行，以及如何手工编排异步步骤。

## 六、Demo：手写 Thunk 异步流程观察台

:::demo{id="react.redux.learn.intermediate.thunk-async-logic.workflow-observer-demo"}
:::

操作时重点观察：

1. 点击“运行手写 Thunk”后，轨迹先出现 `dispatch(thunk)`、`getState()` 和开始 action。
2. 在按钮显示运行中时修改输入；“当前草稿”会变化，“启动时快照”保持不变。
3. 服务完成后，“发布结果”和 `dispatch` 返回值都使用启动时快照。
4. 清空草稿再运行；Thunk 通过 `getState()` 提前退出，服务不会执行，`dispatch` 返回 `null`。
5. 恢复初始状态后可以重新观察完整流程。

Demo 使用真实 `configureStore` 默认 middleware、`Provider`、预类型 dispatch 和手写 Thunk。模拟服务只提供确定性的异步
边界，不模拟失败、取消或并发策略。

## 七、易错使用提示

:::pitfalls
### 错误：替换默认 middleware 后仍派发 Thunk

**触发条件：** 配置 `middleware: () => []`，随后调用 `dispatch(someThunk())`。

**原因：** 最终 middleware 集合不再包含 thunk middleware，函数不会被拦截和调用。

**后果：** TypeScript 可能拒绝函数参数；绕过类型后，函数会继续进入 Redux 核心并触发 action 必须是普通对象的错误。

**错误示例：**

```ts
const store = configureStore({
  reducer: rootReducer,
  middleware: () => [],
})
```

**正确写法：**

```ts
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(auditMiddleware),
})
```

**验证方式：** 检查 `store.dispatch` 的推导类型能接受 `AppThunk`，派发后内部函数确实收到 `dispatch` 与 `getState`。

### 错误：在 Reducer 中等待异步服务

**触发条件：** 把 Reducer 声明为 `async`，或在 Reducer 中调用 `fetch`、计时器等副作用。

**原因：** Reducer 必须同步、纯净地计算下一份 state；Promise 不是合法的 Redux state 转换结果。

**后果：** store 不能在当前 dispatch 中得到正确 state，Immer draft 也不能跨异步边界继续使用。

**错误示例：**

```ts
reducers: {
  async published(state) {
    state.result = await publishToService(state.draft)
  },
}
```

**正确写法：**

```ts
/** 在 Thunk 中执行副作用，再派发普通 action。 */
const publishDraft = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
  const result = await publishToService(getState().publishing.draft)
  dispatch(publishingFinished(result))
}
```

**验证方式：** Redux DevTools 中只出现普通 action；Reducer 执行结束时直接返回下一份 state，不返回 Promise。

### 错误：组件使用只接受普通 action 的 Dispatch

**触发条件：** 手工把 Hook 标成 `Dispatch<UnknownAction>`，再派发手写 Thunk。

**原因：** 基础 Dispatch 类型不知道 thunk middleware 增加的函数重载和返回值。

**后果：** 合法的 `dispatch(thunk)` 出现类型错误，或通过断言后丢失 Promise 返回类型。

**错误示例：**

```ts
const dispatch = useDispatch<Dispatch<UnknownAction>>()
await dispatch(publishDraft())
```

**正确写法：**

```ts
type AppDispatch = typeof store.dispatch

/** 创建保留 middleware 扩展的 dispatch Hook。 */
const useAppDispatch = useDispatch.withTypes<AppDispatch>()
```

**验证方式：** 编辑器能推导 `dispatch(publishDraft())` 的真实 Promise 类型，`await` 后得到 Thunk 声明的结果类型。

### 错误：没有明确 getState 的读取时机

**触发条件：** 流程需要使用点击时输入，却只在 `await` 之后调用 `getState()`。

**原因：** `getState()` 每次返回调用当下的 state，不会自动保存流程启动时的值。

**后果：** 用户在等待期间编辑 state 后，当前任务可能使用另一份输入，导致请求与界面意图不一致。

**错误示例：**

```ts
await waitForPermission()
const draft = getState().publishing.draft
await publishToService(draft)
```

**正确写法：**

```ts
const snapshot = getState().publishing.draft
await waitForPermission()
await publishToService(snapshot)
```

**验证方式：** 在异步等待期间修改草稿；确认当前请求使用启动时快照，后续请求才使用新草稿。

### 错误：用 Thunk 维持长期监听和完整服务端缓存

**触发条件：** 启动一个永不结束的 Thunk 来监听所有后续 action，或手工实现缓存去重、失效、重试和订阅。

**原因：** Thunk 是一次调用的函数，不能自动观察其他 action，也不提供服务端缓存生命周期。

**后果：** 清理边界不明确，重复请求和陈旧缓存规则散落在命令式流程中。

**错误示例：**

```ts
/** 错误地让一次 Thunk 永久轮询。 */
const watchServerForever = (): AppThunk => async (dispatch) => {
  while (true) {
    dispatch(dataReceived(await loadData()))
  }
}
```

**正确写法：**

```ts
/** Thunk 只完成一次明确结束的刷新。 */
const refreshOnce = (): AppThunk<Promise<void>> => async (dispatch) => {
  const data = await loadData()
  dispatch(dataReceived(data))
}
```

**验证方式：** 每次 dispatch 都能在有限时间内完成；长期连接、响应式监听和缓存所有权另有明确的建立与清理入口。
:::

## 八、源码推导与适用场景

### 1. 函数分支不会进入 Reducer

Redux Thunk 3.1.0 固定源码先检查 `typeof action === 'function'`。函数会直接以 `dispatch`、`getState` 和
`extraArgument` 为参数执行；只有非函数值才调用 `next(action)`。

由此可以推导：Thunk 本身不是 Reducer 处理的业务事件，真正可回放的状态变化仍来自 Thunk 派发的普通 action。这个结论
来自固定版本实现；应用不应直接依赖 middleware 的内部函数名或文件结构。

### 2. 返回值由 dispatch 重载保留

固定类型源码为 `ThunkDispatch` 提供 Thunk 重载：接收 `ThunkAction<ReturnType, ...>` 时返回同一个 `ReturnType`。运行时
源码也直接 `return action(...)`。

由此可以推导：异步 Thunk 可以把 Promise 作为明确的调用合同，组件或其他 Thunk能够等待它。该能力不表示所有 Thunk 都
应该返回 Promise，调用方仍应服从具体 Thunk 的类型。

### 3. getState 是读取函数，不是固定快照

固定类型把 `getState` 描述为 `() => State`，middleware 把 store 当前的 `getState` 方法交给 Thunk。每次调用都会读取那一刻
的 store state。

由此可以推导：跨越 `await` 时，开发者必须明确需要启动快照还是完成时最新值。Redux 不替应用决定业务时间语义，也不会
冻结两次调用之间的 state。

### 4. 一次性流程的边界

官方指南把 Thunk 定位为复杂同步逻辑和简单到中等的一次性异步工作，并明确指出它不能观察其他 action。课程据此把单次
发布、保存、条件派发归入 Thunk，把长期监听和缓存生命周期排除在外。

这是工具选择建议，不是运行时禁止。技术上可以在 Thunk 中启动任意 JavaScript 工作，但能够启动不等于具备正确的清理、
去重和生命周期模型。

## 九、练习

:::exercise
### 编写可等待的草稿保存 Thunk

**要求：** 创建一个可运行的 React Redux 页面。store 保存 `draft`、`saved` 与执行说明；定义
`AppThunk<Promise<string | null>>`，让手写 `saveDraft` 通过 `getState()` 读取并修剪草稿。空草稿派发跳过 action 并返回
`null`；非空草稿先派发开始 action，等待模拟服务，再派发完成 action并返回已保存文本。组件必须使用预类型 dispatch，
等待 `dispatch(saveDraft())` 并显示返回值。不得使用异步 Reducer 或自动生成异步 action 的工具。

**验收：** 输入非空文本并保存后，页面依次显示开始与完成说明，`saved` 等于流程启动时的修剪文本，组件显示相同的 dispatch
返回值；输入只有空格时不调用模拟服务，页面显示跳过说明且返回值为 `null`。TypeScript 能准确推导 dispatch 的 Promise
结果，Reducer 只处理普通 action。

**参考答案：**

```tsx
import {
  configureStore,
  createSlice,
  type PayloadAction,
  type ThunkAction,
  type UnknownAction,
} from '@reduxjs/toolkit'
import { useState, type ChangeEvent, type ReactElement } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'

type DraftState = {
  draft: string
  saved: string
  message: string
}

const draftSlice = createSlice({
  name: 'draft',
  initialState: {
    draft: '学习手写 Thunk',
    saved: '尚未保存',
    message: '等待操作',
  } satisfies DraftState,
  reducers: {
    /** 更新编辑器草稿。 */
    draftChanged: (state, action: PayloadAction<string>) => {
      state.draft = action.payload
    },
    /** 记录异步保存开始。 */
    saveStarted: (state, action: PayloadAction<string>) => {
      state.message = `开始保存：${action.payload}`
    },
    /** 保存模拟服务返回的文本。 */
    saveFinished: (state, action: PayloadAction<string>) => {
      state.saved = action.payload
      state.message = `保存完成：${action.payload}`
    },
    /** 记录空草稿被跳过。 */
    saveSkipped: (state) => {
      state.message = '草稿为空，已跳过服务调用'
    },
  },
})

const store = configureStore({
  reducer: {
    draft: draftSlice.reducer,
  },
})

type RootState = ReturnType<typeof store.getState>
type AppDispatch = typeof store.dispatch
type AppThunk<ReturnValue = void> = ThunkAction<
  ReturnValue,
  RootState,
  unknown,
  UnknownAction
>

/** 等待指定时长。 */
function wait(duration: number): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, duration)
  })
}

/** 模拟保存服务。 */
async function saveToService(snapshot: string): Promise<string> {
  await wait(300)
  return snapshot
}

/** 保存流程启动时的草稿快照，并返回保存结果。 */
const saveDraft = (): AppThunk<Promise<string | null>> => async (dispatch, getState) => {
  const snapshot = getState().draft.draft.trim()

  if (!snapshot) {
    dispatch(draftSlice.actions.saveSkipped())
    return null
  }

  dispatch(draftSlice.actions.saveStarted(snapshot))
  const saved = await saveToService(snapshot)
  dispatch(draftSlice.actions.saveFinished(saved))
  return saved
}

/** 创建能够识别 Thunk 的预类型 dispatch Hook。 */
const useAppDispatch = useDispatch.withTypes<AppDispatch>()

/** 展示草稿编辑、保存状态与 Thunk 返回值。 */
function DraftEditor(): ReactElement {
  const dispatch = useAppDispatch()
  const draft = useSelector((state: RootState) => state.draft.draft)
  const saved = useSelector((state: RootState) => state.draft.saved)
  const message = useSelector((state: RootState) => state.draft.message)
  const [returnValue, setReturnValue] = useState('尚未保存')

  /** 同步更新草稿。 */
  function changeDraft(event: ChangeEvent<HTMLTextAreaElement>): void {
    dispatch(draftSlice.actions.draftChanged(event.target.value))
  }

  /** 派发手写 Thunk 并等待其返回值。 */
  async function handleSave(): Promise<void> {
    const result = await dispatch(saveDraft())
    setReturnValue(result === null ? '返回值：null' : `返回值：${result}`)
  }

  return (
    <main>
      <h1>草稿保存</h1>
      <label htmlFor="draft">草稿</label>
      <textarea id="draft" value={draft} onChange={changeDraft} />
      <button type="button" onClick={() => void handleSave()}>
        保存草稿
      </button>
      <p aria-live="polite">{message}</p>
      <p>已保存：{saved}</p>
      <p>{returnValue}</p>
    </main>
  )
}

/** 挂载练习使用的 React Redux Provider。 */
export default function App(): ReactElement {
  return (
    <Provider store={store}>
      <DraftEditor />
    </Provider>
  )
}
```
:::

## 十、本节小结

- Thunk action creator 返回函数，middleware 在 dispatch 后调用该函数并注入 `dispatch` 与 `getState`。
- `configureStore` 默认包含 thunk middleware；自定义 middleware 时不要无意删除默认集合。
- 异步副作用放在 Thunk 或服务层，Reducer 只同步处理普通 action。
- 在 `await` 前读取 state 可以固定启动快照，在 `await` 后读取可以获得完成时最新状态。
- `ThunkAction`、从 store 推导的 `AppDispatch` 和预类型 Hook共同保留完整返回值类型。
- Thunk 适合一次性命令式流程，不负责长期监听或完整服务端缓存生命周期。

## 十一、参考资料

- [Writing Logic with Thunks](https://redux.js.org/usage/writing-logic-thunks)
- [Redux Usage with TypeScript](https://redux.js.org/usage/usage-with-typescript)
- [Redux Side Effects Approaches](https://redux.js.org/usage/side-effects-approaches)
- [Redux Toolkit configureStore API](https://redux-toolkit.js.org/api/configureStore)
- [React Redux Usage with TypeScript](https://react-redux.js.org/using-react-redux/usage-with-typescript)
- [Redux Thunk 3.1.0 middleware 源码](https://github.com/reduxjs/redux-thunk/blob/v3.1.0/src/index.ts)
- [Redux Thunk 3.1.0 类型源码](https://github.com/reduxjs/redux-thunk/blob/v3.1.0/src/types.ts)
- [Redux Toolkit 2.12.0 npm 最新版元数据](https://registry.npmjs.org/@reduxjs/toolkit/latest)
- [Redux Thunk 3.1.0 npm 最新版元数据](https://registry.npmjs.org/redux-thunk/latest)
- [Redux 5.0.1 npm 最新版元数据](https://registry.npmjs.org/redux/latest)
- [React Redux 9.3.0 npm 最新版元数据](https://registry.npmjs.org/react-redux/latest)
- [React 19.2.8 npm 最新版元数据](https://registry.npmjs.org/react/latest)
