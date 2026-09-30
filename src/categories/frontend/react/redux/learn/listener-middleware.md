---
id: react.redux.learn.intermediate.listener-middleware
type: lesson
title: Listener Middleware
summary: 使用 createListenerMiddleware 响应 Redux action 或状态变化，并组织可取消的异步副作用。
domain: frontend
technology: react
module: redux
stage: intermediate
level: intermediate
estimatedMinutes: 120
prerequisites:
  - react.redux.learn.intermediate.default-middleware-checks
related:
  - react.redux.learn.intermediate.middleware-chain
  - react.redux.learn.intermediate.thunk-async-logic
  - react.redux.learn.intermediate.async-cancel-condition
tags:
  - Redux
  - Redux Toolkit
  - Listener Middleware
  - createListenerMiddleware
  - startListening
  - listenerApi
  - condition
  - cancelActiveListeners
appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1、React Redux 9.3.0、React 19.2.8
verifiedAt: 2026-08-31
objectives:
  - 能创建 listener middleware，并通过 configureStore 保留默认 middleware。
  - 能用 actionCreator、matcher、type 或 predicate 声明 listener 的触发条件。
  - 能区分 effect 中的 getState、同步 getOriginalState 与 dispatch。
  - 能用 delay、condition 和 cancelActiveListeners 组织可取消的异步工作流。
  - 能用 startListening 返回的取消函数、stopListening 和 clearListeners 管理监听器生命周期。
recap:
  - createListenerMiddleware 返回 middleware、startListening、stopListening 和 clearListeners；middleware 应通过 prepend 放在 serializable 检查之前。
  - listener 在 reducer 完成后运行；effect 可以读取当前 state，getOriginalState 只能同步读取触发 action 之前的 state。
  - 一个 listener 只能提供 type、actionCreator、matcher、predicate 四种触发方式中的一种；effect 负责副作用和后续 dispatch。
  - delay、condition、take、pause 都受当前 listener 的取消信号管理；cancelActiveListeners 只取消同一 listener 的其他运行实例。
sources:
  - title: Redux Toolkit createListenerMiddleware API
    url: https://redux-toolkit.js.org/api/createListenerMiddleware
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0+
    claims:
      - createListenerMiddleware 返回 middleware、startListening、stopListening 和 clearListeners。
      - listener 支持 type、actionCreator、matcher、predicate 四种匹配方式，effect 在 reducer 更新后执行。
      - listenerApi 提供 getState、getOriginalState、dispatch、condition、take、delay、pause、cancel 和取消相关方法。
  - title: Redux Toolkit configureStore API
    url: https://redux-toolkit.js.org/api/configureStore
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0+
    claims:
      - middleware 回调接收 getDefaultMiddleware，prepend 可在保留默认集合的同时放置 listener middleware。
  - title: Redux Toolkit 2.12.0 listenerMiddleware 源码
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/listenerMiddleware/index.ts
    sourceType: source-code
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - listener 任务使用 AbortController 管理 delay、condition、take、pause 和 fork 的取消信号。
      - cancelActiveListeners、unsubscribe 和 stopListening 的 cancelActive 选项会取消运行中的 listener 实例。
  - title: Redux Toolkit 2.12.0 listenerMiddleware 类型定义
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/listenerMiddleware/types.ts
    sourceType: source-code
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - ListenerMiddlewareInstance、ListenerEffectAPI 和 startListening 的公开类型定义了生命周期与 listener API 契约。
  - title: Redux Toolkit npm latest package metadata
    url: https://registry.npmjs.org/@reduxjs%2ftoolkit/latest
    sourceType: official-reference
    appliesTo: Redux Toolkit latest stable (核验于 2026-08-31)
    claims:
      - latest 标签指向 Redux Toolkit 2.12.0，作为本课固定版本与官方源码链接的版本核验依据。
---

# Listener Middleware

## 一、学习目标

- 创建一个 listener middleware，并将它放入 `configureStore` 的 middleware 链。
- 使用 `actionCreator`、`matcher`、`type` 或 `predicate` 声明 listener 的触发条件。
- 在 `effect` 中读取当前 state、同步读取原始 state，并派发后续 action。
- 使用 `delay`、`condition` 与 `cancelActiveListeners` 组织可以等待和取消的异步工作流。
- 用 `startListening` 返回的取消函数、`stopListening` 和 `clearListeners` 管理 listener 生命周期。

## 二、为什么需要 Listener Middleware

Thunk 适合由组件或其他逻辑主动启动一段工作，但有些副作用的起点是“某个 action 已经发生”或
“状态满足某个条件”。如果把这些副作用写进组件，组件就要同时知道业务 action、等待逻辑和取消规则；
如果为此手写 middleware，又要维护匹配、任务和错误处理。

Listener Middleware 把“何时响应”和“响应时做什么”分开：listener 负责匹配 action 或状态，`effect`
负责副作用。它的 API 类似 `useEffect` 的响应式思路，但运行在 Redux store 更新流程中；它不是缓存服务端
数据的替代品，也不取代需要由调用方主动启动的 Thunk。

## 三、核心概念

### 1. 创建实例并接入 store

`createListenerMiddleware` 返回的是一个实例对象，其中的 `middleware` 才是要放进 store 的 middleware；
`startListening`、`stopListening` 和 `clearListeners` 是管理 listener 的实例方法。

```ts
import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit'

const listenerMiddleware = createListenerMiddleware()

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
})
```

Listener 的注册 action 可能带有函数，因此官方建议将 middleware 放在 serializable 检查之前。使用
`prepend` 可以保留 `configureStore` 提供的 thunk 和其他默认检查。

### 2. 用一个条件匹配一个 listener

`startListening` 必须提供且只能提供以下四种触发条件中的一种：

- `type`：匹配一个 action type 字符串。
- `actionCreator`：匹配 Redux Toolkit action creator 生成的 action。
- `matcher`：使用一个 matcher 函数匹配多个 action。
- `predicate`：根据 action、当前 state 和原始 state 返回布尔值。

所有 listener 的 `effect` 都在 root reducer 更新 state 后运行。`effect` 的第一个参数是匹配到的 action，
第二个参数是 `listenerApi`。

```ts
listenerMiddleware.startListening({
  actionCreator: todoAdded,
  effect: (action, listenerApi) => {
    console.log(action.payload)
    listenerApi.dispatch(todoLogged(action.payload.id))
  },
})
```

### 3. `listenerApi` 的状态与 store 操作

`listenerApi` 提供 `dispatch`、`getState` 和 `getOriginalState`：

- `getState()` 返回触发 action 已经被 reducer 处理后的当前 state。
- `getOriginalState()` 返回触发 action 处理前的 state，并且只能在 effect 的同步阶段调用；在 `await`、
  `setTimeout` 或其他异步回调之后调用会抛出错误。
- `dispatch()` 重新从 middleware 链首派发一个新 action，可以触发其他 listener。

```ts
effect: (action, listenerApi) => {
  const before = listenerApi.getOriginalState().todos.length
  const after = listenerApi.getState().todos.length

  if (after > before) {
    listenerApi.dispatch(todoIndexed({ id: action.payload.id }))
  }
}
```

### 4. 可取消的异步步骤

`listenerApi.delay(ms)` 会返回一个受 listener 取消信号控制的 Promise。`condition(predicate, timeout?)`
会等待后续 action 或 state 满足条件；满足时返回 `true`，超时返回 `false`，listener 被取消时 Promise 会
拒绝。`take` 与 `condition` 类似，但会返回匹配到的 action、当前 state 和原始 state；`pause(promise)`
则让任意 Promise 参与同一取消信号。

```ts
effect: async (_action, listenerApi) => {
  const confirmed = await listenerApi.condition(confirmAction.match, 3000)
  if (confirmed) listenerApi.dispatch(confirmedAction())
}
```

`cancelActiveListeners()` 会取消同一个 listener 的其他运行实例，但保留调用它的当前实例；因此常与
`delay` 组合实现 takeLatest 或 debounce 语义。当前实例也可以调用 `cancel()`，或在长流程中检查
`signal.aborted`。

### 5. 管理 listener 生命周期

`startListening` 返回一个 `unsubscribe` 函数。默认只移除未来的匹配，不取消已经运行的 effect；传入
`{ cancelActive: true }` 可以同时取消运行中的实例。

```ts
const unsubscribe = listenerMiddleware.startListening(listener)

unsubscribe({ cancelActive: true })
listenerMiddleware.startListening(listener)
```

也可以用 `stopListening` 按相同的匹配条件和 effect 引用移除 listener。`clearListeners()` 会移除所有
listener，并取消所有仍在运行的任务，适合测试清理或应用生命周期结束时使用。listener 被移除后，
`listenerApi.subscribe()` 可以在 effect 内重新订阅当前 listener，`listenerApi.unsubscribe()` 可以暂时停止
未来匹配。

## 四、用法与示例

### 1. 对 action 负责，对数据请求保持边界

Listener 适合“保存成功后记录审计”“用户输入变化后延迟触发提示”“收到 action 后等待另一个 action”这类
响应式工作流。需要由调用方传入参数、读取服务并返回结果的单次流程，仍可使用 Thunk；专门的服务端缓存和
请求生命周期应评估 RTK Query 或 TanStack Query。

### 2. 用 `predicate` 观察状态变化

`predicate` 会收到 `(action, currentState, originalState)`。可以比较一段状态是否从未完成变为完成，而不必
让每个业务 action 都注册一个 listener：

```ts
listenerMiddleware.startListening({
  predicate: (_action, currentState, originalState) =>
    !originalState.checkout.completed && currentState.checkout.completed,
  effect: (_action, listenerApi) => {
    listenerApi.dispatch(showReceipt(listenerApi.getState().checkout.id))
  },
})
```

### 3. 用 `matcher` 复用 action 分类

RTK 的 `isAnyOf`、`isPending`、`isFulfilled` 等 matcher 可以作为 listener 的 `matcher`。这样可以把多个
异步请求的共同反馈集中到一个 effect，但仍应让 effect 保持短小，并把业务更新交回 reducer。

### 4. 动态注册要保留可逆句柄

界面级或插件级 listener 可以动态注册，但应保存 `unsubscribe`，在卸载或切换范围时调用它。若 listener
会产生长时间任务，移除时使用 `{ cancelActive: true }`，避免旧任务在新的页面范围之外继续派发 action。

### 5. Demo：观察监听器的匹配、等待与取消

:::demo{id="react.redux.learn.intermediate.listener-middleware.listener-middleware-demo"}
:::

Demo 使用 `actionCreator` 监听 `increment`。effect 先同步比较 `getOriginalState()` 和 `getState()`，再
执行可取消的 `delay`；连续快速派发会由 `cancelActiveListeners()` 取消前一个延迟。另一个 listener 在
`startWaiting` 后用 `condition(confirmWaiting.match, 2400)` 等待确认 action；确认或超时都会派发新的
状态 action。停止和恢复按钮使用 `startListening` 返回的取消函数，展示 listener 本身的生命周期。

## 五、易错使用提示

:::pitfalls
### 错误：把 listener middleware 放在 serializable 检查之后

**触发条件：** 用 `getDefaultMiddleware().concat(listenerMiddleware.middleware)` 接入 listener。

**原因：** 动态 add/remove listener action 可能包含函数，serializable 检查会先看到这些函数。

**后果：** 开发环境出现非序列化诊断，或把合法的 listener 管理 action 当成业务错误。

**错误示例：**

```ts
middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware().concat(listenerMiddleware.middleware)
```

**正确写法：**

```ts
middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware().prepend(listenerMiddleware.middleware)
```

**验证方式：** 通过动态 listener action 注册或移除 listener，检查默认 serializable 诊断没有因为函数字段而出现。

### 错误：在异步等待之后读取 `getOriginalState`

**触发条件：** `await listenerApi.delay()` 后才调用 `listenerApi.getOriginalState()`。

**原因：** 原始 state 只在触发当前 effect 的同步调用栈内可用。

**后果：** 运行时抛出错误，且无法再得到触发 action 之前的快照。

**错误示例：**

```ts
effect: async (_action, listenerApi) => {
  await listenerApi.delay(100)
  listenerApi.getOriginalState()
}
```

**正确写法：**

```ts
effect: async (_action, listenerApi) => {
  const originalState = listenerApi.getOriginalState()
  await listenerApi.delay(100)
  console.log(originalState)
}
```

**验证方式：** 在第一次 `await` 前保存快照，比较它与等待后的 `getState()`，不要在异步阶段重新调用 `getOriginalState()`。

### 错误：把取消当成普通运行时错误

**触发条件：** 直接 `await listenerApi.delay()` 或 `condition()`，却没有为取消后的清理、记录或其他业务分支留出处理位置。

**原因：** `cancelActiveListeners`、`unsubscribe({ cancelActive: true })` 和 `clearListeners` 都会取消运行中的任务。可取消 Promise 会以任务取消错误结束，但 Listener Middleware 会识别并吞掉这一类取消错误；它不是未处理 Promise 拒绝。

**后果：** 不处理取消并不会自动产生未处理拒绝，但需要清理或记录时会失去取消分支；如果把所有错误都吞掉，又会隐藏真正的业务异常。

**错误示例：**

```ts
effect: async (_action, listenerApi) => {
  await listenerApi.delay(1000)
  listenerApi.dispatch(done())
}
```

**正确写法：**

```ts
effect: async (_action, listenerApi) => {
  try {
    await listenerApi.delay(1000)
    listenerApi.dispatch(done())
  } catch (error) {
    if (listenerApi.signal.aborted) {
      listenerApi.dispatch(cancelled())
      return
    }
    throw error
  }
}
```

**验证方式：** 连续触发同一 listener 或主动取消它，确认取消分支按需记录，取消任务不会派发完成 action，且真正的业务异常仍会抛出。

### 错误：用 `dispatch` 替代 `next` 传递当前 action

**触发条件：** 在 listener effect 中把当前 action 再次 `listenerApi.dispatch(action)`，试图“继续”当前流程。

**原因：** listener effect 已经在 reducer 更新后运行，`dispatch` 会创建一次新的 middleware 链遍历。

**后果：** 可能重复更新 state 或再次触发 listener；listener 不是自定义 middleware 的 `next` 层。

**错误示例：**

```ts
effect: (action, listenerApi) => {
  listenerApi.dispatch(action)
}
```

**正确写法：**

```ts
effect: (action, listenerApi) => {
  listenerApi.dispatch(auditRecorded({ source: action.type }))
}
```

**验证方式：** effect 只派发明确的新 action，并在 reducer 或事件记录中确认原始 action 没有被重复处理。

### 错误：移除 listener 时留下运行中的任务

**触发条件：** 只调用 `unsubscribe()`，却认为旧 effect 已经停止。

**原因：** 默认 unsubscribe 只阻止未来匹配，不会取消已经启动的 effect。

**后果：** 旧页面或旧业务范围仍可能在延迟完成后派发 action。

**错误示例：**

```ts
unsubscribe()
```

**正确写法：**

```ts
unsubscribe({ cancelActive: true })
```

**验证方式：** 移除 listener 后触发取消路径，确认旧任务没有再派发完成 action；需要保留任务时才使用默认 unsubscribe。
:::

## 六、源码推导与适用场景

### 1. 固定版本源码展示的生命周期事实

Redux Toolkit 2.12.0 的 `listenerMiddleware/index.ts` 在执行 listener 时创建内部 `AbortController`，并将
`delay`、`pause`、`condition`、`take` 和 `fork` 绑定到该取消信号；`cancelActiveListeners` 会遍历同一
listener 的其他控制器并调用 `abort`。源码还显示 `unsubscribe` 默认只移除 listener，传入
`cancelActive: true` 才会额外取消活跃实例。

由此推导：每次 listener 触发都是独立任务，必须把取消当作正常控制流处理；不要把 effect 当作不会被中断的
普通函数。`fork/join` 可以拆分子任务，但会引入额外并发语义，本课只把它作为 API 边界，不展开设计。

### 2. reducer 与 effect 的职责边界

官方 API 定义 effect 在 reducer 更新后运行，并提供 `getOriginalState` 读取更新前快照。因此 reducer 负责
产生可追踪的状态变更，effect 负责日志、请求、等待和派发后续 action。effect 直接修改 state、依赖组件
生命周期或把检查 middleware 当作业务校验，都超出 Listener Middleware 的职责。

### 3. 选择 Listener、Thunk 与数据请求工具

当需求是“响应已经发生的 action 或状态变化”，Listener 是自然选择；当需求是“由调用方启动并返回一个流程
结果”，Thunk 更直接；当需求是缓存、去重、重新获取和服务端数据生命周期，应评估 RTK Query 或专门的数据
请求工具。Listener 可以协调这些能力，但不应把所有服务端数据复制到 Redux state。

## 七、练习

:::exercise
### 实现可取消的保存监听器

**要求：** 使用 `configureStore`、`createSlice` 和 `createListenerMiddleware` 创建一个 store。slice 包含
`draft` 字符串和 `saved` 布尔值，并提供 `draftChanged`、`saveStarted`、`saveFinished` 三个 action。用
`actionCreator: draftChanged` 注册 listener：每次 draft 改变时先调用 `cancelActiveListeners()`，再
`await listenerApi.delay(300)`，最后派发 `saveFinished()`。在 `configureStore` 中使用
`getDefaultMiddleware().prepend(listenerMiddleware.middleware)` 保留默认 middleware。连续派发两次
`draftChanged` 时，只有最后一次延迟应派发 `saveFinished`。

**验收：** listener 放在 serializable 检查之前；状态更新由 reducer 完成；取消旧任务时不会出现未处理拒绝；
连续两次修改 draft 后，最终 `saved` 为 `true`，且 `saveFinished` 只由最后一次延迟派发。

**参考答案：**

```ts
import {
  configureStore,
  createListenerMiddleware,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'

const editorSlice = createSlice({
  name: 'editor',
  initialState: { draft: '', saved: false },
  reducers: {
    draftChanged: (state, action: PayloadAction<string>) => {
      state.draft = action.payload
      state.saved = false
    },
    saveStarted: (state) => {
      state.saved = false
    },
    saveFinished: (state) => {
      state.saved = true
    },
  },
})

const { draftChanged, saveStarted, saveFinished } = editorSlice.actions

const listenerMiddleware = createListenerMiddleware()

listenerMiddleware.startListening({
  actionCreator: draftChanged,
  effect: async (_action, listenerApi) => {
    listenerApi.cancelActiveListeners()
    listenerApi.dispatch(saveStarted())

    try {
      await listenerApi.delay(300)
      listenerApi.dispatch(saveFinished())
    } catch {
      // 被新的 draftChanged 取消时，不派发完成 action。
    }
  },
})

const store = configureStore({
  reducer: { editor: editorSlice.reducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
})

store.dispatch(draftChanged('第一版'))
store.dispatch(draftChanged('最后一版'))

setTimeout(() => {
  console.log(store.getState().editor)
}, 350)
```
:::

## 八、本节小结

- `createListenerMiddleware` 用实例方法注册 listener，用 `middleware` 接入 `configureStore`。
- 一个 listener 从 `type`、`actionCreator`、`matcher`、`predicate` 中选择一种匹配方式，effect 在 reducer 更新后运行。
- `getOriginalState` 必须同步调用；`getState` 读取更新后的 state；后续状态变化通过新的 `dispatch` 交回 reducer。
- `delay`、`condition`、`take`、`pause` 受取消信号控制；`cancelActiveListeners` 可实现同一 listener 的 takeLatest/debounce 行为。
- listener 的取消、重新订阅和清理是生命周期的一部分；是否取消活跃任务必须根据业务范围明确选择。

## 九、参考资料

- [Redux Toolkit createListenerMiddleware API](https://redux-toolkit.js.org/api/createListenerMiddleware) - 实例、匹配条件、listener API、生命周期和取消语义。
- [Redux Toolkit configureStore API](https://redux-toolkit.js.org/api/configureStore) - middleware 回调、默认 middleware 和 prepend/concat 组合方式。
- [Redux Toolkit 2.12.0 listenerMiddleware 源码](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/listenerMiddleware/index.ts) - 取消控制器、condition、delay、pause、fork 和任务生命周期的固定版本实现。
- [Redux Toolkit 2.12.0 listenerMiddleware 类型定义](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/listenerMiddleware/types.ts) - `ListenerMiddlewareInstance`、`ListenerEffectAPI` 和 `startListening` 类型契约。
- [Redux Toolkit npm latest package metadata](https://registry.npmjs.org/@reduxjs%2ftoolkit/latest) - 核验本课使用的最新稳定版本。
- [Redux Toolkit matching utilities API](https://redux-toolkit.js.org/api/matching-utilities) - `matcher`、`isAnyOf`、`isPending` 等匹配工具。
