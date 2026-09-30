---
id: react.redux.learn.intermediate.async-cancel-condition
type: lesson
title: 异步取消与请求条件
summary: 在异步 Thunk 开始前跳过不必要请求，或取消正在运行的任务并识别取消原因。
domain: frontend
technology: react
module: redux
stage: intermediate
level: intermediate
estimatedMinutes: 100
prerequisites:
  - react.redux.learn.intermediate.async-error-reject-with-value
related:
  - react.redux.learn.intermediate.create-async-thunk
  - react.redux.learn.intermediate.async-lifecycle-state
tags:
  - Redux Toolkit
  - createAsyncThunk
  - condition
  - dispatchConditionRejection
  - abort
  - AbortSignal
appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1、React Redux 9.3.0、React 19.2.8
verifiedAt: 2026-08-31
objectives:
  - 能使用 condition 在 payloadCreator 执行前跳过重复或不必要的请求。
  - 能解释 condition 返回 false 时默认不派发 action 的行为。
  - 能使用 dispatchConditionRejection 观察条件跳过产生的 rejected action。
  - 能调用 dispatch(thunk()).abort() 取消正在运行的异步 Thunk。
  - 能把 thunkAPI.signal 传给可取消的异步工作，并区分 meta.condition 与 meta.aborted。
  - 能把取消策略限制在本课范围，不把请求身份或并发竞态混入同一状态模型。
recap:
  - condition 在 payloadCreator 之前运行；返回 false 会跳过 payloadCreator。
  - 条件跳过默认不派发 action，dispatchConditionRejection 为 true 时会派发 rejected action。
  - dispatch(thunk()) 返回的 Promise 有 abort 方法，运行中调用会得到带 AbortError 的 rejected action。
  - thunkAPI.signal 是取消协作的 AbortSignal；payloadCreator 应把它传给 fetch 或其他可取消任务。
  - meta.condition 表示执行前条件跳过，meta.aborted 表示运行中被 abort；两者不能混为普通业务失败。
sources:
  - title: Redux Toolkit createAsyncThunk API
    url: https://redux-toolkit.js.org/api/createAsyncThunk
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - condition 可以在 payloadCreator 执行前跳过执行；返回 false 时默认不派发 action。
      - dispatchConditionRejection 为 true 时，条件跳过会派发 rejected action。
      - 派发返回的 Promise 附带 abort 方法；运行中 abort 会产生带 AbortError 的 rejected action。
      - thunkAPI.signal 可传给 fetch 等可取消任务，meta.condition 与 meta.aborted 区分两种取消。
  - title: Redux Toolkit 2.12.0 createAsyncThunk Source
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/createAsyncThunk.ts
    sourceType: source-code
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 固定源码在 payloadCreator 前调用 condition，并为取消竞速建立 AbortSignal。
      - 固定源码在 dispatchConditionRejection 未开启时跳过条件 rejected action 的派发。
      - 固定源码把运行中取消标记为 meta.aborted，把条件跳过标记为 meta.condition。
  - title: Redux Toolkit 2.12.0 createAsyncThunk Tests
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/tests/createAsyncThunk.test.ts
    sourceType: official-test
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 官方测试验证条件跳过默认不派发 action。
      - 官方测试验证 dispatchConditionRejection 会派发 condition=true 的 rejected action。
      - 官方测试验证运行中 abort 会产生 name 为 AbortError 的 rejected action。
  - title: Redux Toolkit Latest npm Metadata
    url: https://registry.npmjs.org/@reduxjs/toolkit/latest
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 核验日 npm latest 指向 Redux Toolkit 2.12.0。
---

# 异步取消与请求条件

## 一、学习目标

- 使用 `condition` 在异步工作开始前阻止重复请求。
- 知道条件返回 `false` 时默认不会派发任何 action，并能按需开启 rejected 通知。
- 使用派发 Promise 的 `.abort()` 取消运行中的 Thunk。
- 让 `payloadCreator` 通过 `thunkAPI.signal` 协作取消，而不是继续写入成功结果。
- 通过 `meta.condition` 和 `meta.aborted` 判断取消发生在执行前还是执行中。

## 二、为什么需要两种取消入口

异步工作可能在两个时间点变得不值得继续：

- 请求还没有开始，例如同一份内容已经成功加载。此时应使用 `condition`，连 `payloadCreator` 和网络请求都不要启动。
- 请求已经开始，例如用户离开页面或点击“取消”。此时应调用派发 Promise 的 `.abort()`，并让底层任务监听 `signal`。

这两个入口的结果不同。条件跳过是“没有执行”；运行中取消是“执行过，但被中止”。把它们都当成普通失败，会让重试、提示和日志失去依据。

## 三、核心概念

### 1. 用 condition 在执行前做判断

`createAsyncThunk` 的第三个参数可以配置 `condition(arg, { getState, extra })`：

```ts
const loadArticle = createAsyncThunk<Article, string, { state: RootState }>(
  'article/load',
  async (slug) => requestArticle(slug),
  {
    condition: (slug, { getState }) => {
      const article = getState().article
      return !(article.status === 'succeeded' && article.slug === slug)
    },
  },
)
```

它在 `payloadCreator` 之前执行。返回 `false` 时，默认不会派发 `pending`、`fulfilled` 或 `rejected` action，`payloadCreator` 也不会运行。

### 2. 需要通知时开启 dispatchConditionRejection

默认静默跳过适合“缓存命中”这类无需更新 UI 的情况。若界面或日志需要知道这次调用被条件拦截，可配置：

```ts
const loadArticle = createAsyncThunk('article/load', requestArticle, {
  condition: (slug, { getState }) => getState().article.slug !== slug,
  dispatchConditionRejection: true,
})
```

此时派发会得到一个 `rejected` action，`action.meta.condition === true`。它仍然表示没有执行 `payloadCreator`，不应当被当作服务端返回的业务错误。

### 3. 用 abort 取消正在运行的 Promise

`dispatch` 返回的 Thunk Promise 除了等待最终 action，还附带 `abort()`：

```tsx
const request = dispatch(loadArticle(slug))
request.abort()
const result = await request

if (loadArticle.rejected.match(result) && result.meta.aborted) {
  console.log(result.error.name) // AbortError
}
```

调用 `abort()` 会让最终结果成为 `rejected` action，并把 `meta.aborted` 设为 `true`。这个 Promise 仍然解析为最终 action；需要组件层抛出错误时，才额外使用上一课介绍的 `unwrap()`。

### 4. 让 payloadCreator 监听 thunkAPI.signal

`thunkAPI.signal` 是标准 `AbortSignal`。原生 `fetch` 可以直接接收它：

```ts
const loadArticle = createAsyncThunk('article/load', async (slug, { signal }) => {
  const response = await fetch(`/api/articles/${slug}`, { signal })
  return (await response.json()) as Article
})
```

其他异步库或自定义 Promise 需要自行监听 `signal`，在收到 `abort` 时停止计时器、取消订阅或释放资源。`createAsyncThunk` 会负责把取消结果包装成 rejected action，但不会替你取消不支持 `AbortSignal` 的底层任务。

## 四、用法与示例

### 1. 条件检查应该依赖当前 Redux 状态

`condition` 能读取 `getState()`，因此可以把“是否已经有同一查询的成功结果”作为跳过条件。判断应保持同步且便宜；耗时的业务逻辑留给 `payloadCreator`。

### 2. 用 meta 选择展示策略

```ts
const action = await dispatch(loadArticle(slug))

if (loadArticle.rejected.match(action)) {
  if (action.meta.condition) {
    return '已存在相同结果，无需请求'
  }

  if (action.meta.aborted) {
    return '用户取消了请求'
  }

  return action.error.message ?? '请求失败'
}
```

条件跳过通常保留当前已成功的数据；运行中取消则由业务决定保留旧数据、恢复 `idle` 或显示可重试状态。本课 Demo 用独立的 `canceled` 状态让中止结果可见。

### 3. 只允许当前操作取消

组件可以暂存当前派发 Promise 的 `abort` 方法，并在按钮点击时调用。开始新的请求前应清理旧引用；本课 Demo 在同一时刻只允许一个请求，避免把请求归属和并发竞态混入取消示例。

## 五、Demo：取消与条件观察台

:::demo{id="react.redux.learn.intermediate.async-cancel-condition.cancel-condition-demo"}
:::

按以下顺序观察：

1. 点击“加载内容”，等待状态变为 `succeeded`。
2. 点击“重复加载（条件跳过）”，`meta.condition` 变为 `true`，结果显示 `payloadCreator` 没有执行，原有内容仍保留。
3. 点击“启动长任务”，在状态为 `pending` 时点击“取消当前请求”，`meta.aborted` 变为 `true`，结果的错误名为 `AbortError`。
4. 重置后可以重复上述观察。运行中只有取消按钮保持可用，避免并发请求覆盖教学状态。

Demo 使用真实的 `configureStore`、`createAsyncThunk`、`createSlice`、`Provider` 和预类型 Hooks；源码展示与运行组件来自同一组文件。

## 六、易错使用提示

:::pitfalls
### 错误：把 condition 写进 payloadCreator

**触发条件：** 先进入 `payloadCreator`，再判断是否重复并返回已有数据。

**原因：** 此时 Thunk 已经派发了 `pending`，网络或其他副作用可能已经开始。

**后果：** 重复请求仍会产生，无法达到执行前取消的目的。

**错误示例：**

```ts
async function payloadCreator(slug: string, { getState }: any) {
  if (getState().article.slug === slug) return getState().article.data
  return requestArticle(slug)
}
```

**正确写法：**

```ts
const loadArticle = createAsyncThunk('article/load', requestArticle, {
  condition: (slug, { getState }) => getState().article.slug !== slug,
})
```

**验证方式：** 在 `payloadCreator` 开头记录一次调用；条件返回 `false` 时调用次数应保持不变。

### 错误：以为 condition 返回 false 一定会有 rejected action

**触发条件：** 没有配置 `dispatchConditionRejection`，却在 Reducer 或日志中等待 rejected action。

**原因：** 默认策略是完全静默地跳过本次 Thunk。

**后果：** 观察不到 action 并不代表条件没有生效，而是默认没有派发。

**错误示例：**

```ts
const loadArticle = createAsyncThunk('article/load', requestArticle, {
  condition: () => false,
})
```

**正确写法：**

```ts
const loadArticle = createAsyncThunk('article/load', requestArticle, {
  condition: () => false,
  dispatchConditionRejection: true,
})
```

**验证方式：** 监听 store dispatch；前一种写法没有 action，后一种写法有 `rejected` 且 `meta.condition === true`。

### 错误：只调用 abort，不让底层任务监听 signal

**触发条件：** 自定义 Promise 忽略 `thunkAPI.signal`，调用 `abort()` 后计时器或网络仍在后台运行。

**原因：** `createAsyncThunk` 能改变最终 action，但不能强制停止不支持取消的底层工作。

**后果：** 资源继续消耗，副作用仍可能发生；界面虽已显示取消，任务却未真正停止。

**错误示例：**

```ts
async function requestArticle(): Promise<Article> {
  return new Promise((resolve) => setTimeout(() => resolve(article), 1000))
}
```

**正确写法：**

```ts
async function requestArticle(signal: AbortSignal): Promise<Article> {
  const response = await fetch('/api/article', { signal })
  return (await response.json()) as Article
}
```

**验证方式：** 取消后检查底层 Promise 是否收到 `abort` 事件并清理计时器或请求。

### 错误：把 meta.condition 与 meta.aborted 当成同一种失败

**触发条件：** 所有 rejected action 都显示“服务器请求失败”。

**原因：** 条件跳过没有执行请求，运行中 abort 也不是服务端错误。

**后果：** 用户得到错误的重试提示，日志无法区分策略性跳过和实际故障。

**错误示例：**

```ts
if (loadArticle.rejected.match(action)) {
  showError(action.error.message)
}
```

**正确写法：**

```ts
if (action.meta.condition) showNotice('已有相同结果')
else if (action.meta.aborted) showNotice('请求已取消')
else showError(action.error.message)
```

**验证方式：** 分别触发条件跳过、运行中取消和普通异常，三种提示应保持不同语义。

### 错误：在同一个 Demo 中同时启动多个请求来证明 abort

**触发条件：** 允许第二个请求覆盖第一个请求的 UI，再用一个共享的 `abort` 引用取消。

**原因：** 取消哪个请求属于请求身份和并发协调问题，不是本课的单一取消入口。

**后果：** 可能取消错请求，或者把旧请求结果误认为当前请求结果。

**错误示例：**

```tsx
const first = dispatch(loadArticle('first'))
const second = dispatch(loadArticle('second'))
currentAbort = second.abort
currentAbort()
```

**正确写法：**

```ts
const request = dispatch(loadArticle(slug))
request.abort()
```

**验证方式：** 本课一次只保留一个可取消的派发 Promise；并发请求的归属交给专门课程。
:::

## 七、源码推导与适用场景

### 1. 执行前跳过不会进入 payloadCreator

Redux Toolkit 2.12.0 固定源码先等待 `condition` 结果，再决定是否建立执行流程；条件为 false 时构造 `ConditionError`，并在默认配置下跳过 rejected action 的派发。官方测试也验证默认 dispatch 次数为零。

由此可推导：缓存命中、重复点击和权限预检等“根本不应开始”的判断应放在 `condition`，而不是请求函数内部。是否派发 rejected 通知是观测策略，不改变“没有执行”的事实。

边界是 `condition` 只负责一次 Thunk 调用的启动门槛；它不解决两个不同请求之间的身份匹配、结果覆盖或并发竞态。

### 2. abort 通过 AbortSignal 与 Promise 竞速

固定源码为每次 Thunk 创建 `AbortController`，把其 `signal` 传给 payload creator，并让 abort Promise 与 payload creator Promise 竞速；官方测试验证结果 action 的 `error.name` 为 `AbortError` 且 `meta.aborted` 为 true。

由此可推导：调用 `.abort()` 后应尽快停止底层可取消工作，并把取消视为稳定的终态分支。组件若只关心最终 action，可以直接检查 matcher 和 meta，而不必捕获 dispatch Promise 的异常。

边界是 AbortSignal 的协作语义：不监听 signal 的第三方任务可能仍在后台运行。浏览器、Node 或其他宿主对具体取消 API 的支持需要按实际环境重新核对。

### 3. 两种元数据保留不同事实

固定源码把条件跳过写入 `meta.condition`，把运行中中止写入 `meta.aborted`；两者都可能伴随 `rejected` 类型，但触发点不同。

课程推导是先判断这两个标记，再处理普通 `action.error`。这样 Reducer 可以保留已成功数据，组件可以给出“无需请求”或“用户取消”的准确反馈。

边界是这些标记只描述 `createAsyncThunk` 的取消原因，不替代业务自己的错误码、请求身份或缓存策略。

## 八、练习

:::exercise
### 为搜索请求加入条件跳过和运行中取消

**要求：** 创建一个可运行的 React Redux 页面。定义 `SearchState`，使用 `createAsyncThunk` 创建 `searchItems`：当已有相同关键词的成功结果时，通过 `condition` 返回 `false` 并开启 `dispatchConditionRejection`；请求函数使用 `thunkAPI.signal` 监听取消。组件提供“搜索”“取消”“重置”按钮，保存当前派发 Promise 的 `abort` 方法。点击取消后，Reducer 必须把状态设为 `canceled`；条件跳过时保留已有结果。组件展示最终 action 类型以及 `meta.condition`、`meta.aborted`。

**验收：** 首次搜索进入 `pending` 后成功；再次搜索相同关键词时不调用服务函数，得到 `rejected` 且 `meta.condition === true`，已有结果仍保留；搜索运行中点击取消进入 `canceled`，`meta.aborted === true` 且 `action.error.name === 'AbortError'`；重置回到空闲状态。底层等待必须在 signal abort 时清理计时器。

**参考答案：**

```tsx
import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { useRef, useState, type ReactElement } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'

type SearchItem = { id: string; title: string }
type SearchState = {
  status: 'idle' | 'pending' | 'succeeded' | 'failed' | 'canceled'
  keyword: string | null
  items: SearchItem[]
  error: string | null
}
type RootState = { search: SearchState }
type Observation = {
  actionType: string
  condition: string
  aborted: string
}

const initialState: SearchState = {
  status: 'idle',
  keyword: null,
  items: [],
  error: null,
}

/** 创建一个会响应 AbortSignal 的可取消搜索服务。 */
function requestSearch(keyword: string, signal: AbortSignal): Promise<SearchItem[]> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(
      () => resolve([{ id: keyword, title: `${keyword} 的结果` }]),
      800,
    )
    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer)
        reject(new Error('搜索已取消'))
      },
      { once: true },
    )
  })
}

/** 创建带条件跳过和取消协作的搜索 Thunk。 */
const searchItems = createAsyncThunk<SearchItem[], string>(
  'search/items',
  (keyword, { signal }) => requestSearch(keyword, signal),
  {
    condition: (keyword, { getState }) => {
      const state = getState() as RootState
      return !(state.search.status === 'succeeded' && state.search.keyword === keyword)
    },
    dispatchConditionRejection: true,
  },
)

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchItems.pending, (state) => {
        state.status = 'pending'
        state.error = null
      })
      .addCase(searchItems.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.keyword = action.meta.arg
        state.items = action.payload
      })
      .addCase(searchItems.rejected, (state, action) => {
        if (action.meta.condition) return
        state.status = action.meta.aborted ? 'canceled' : 'failed'
        state.error = action.error.message ?? '搜索失败'
      })
  },
})

const store = configureStore({ reducer: { search: searchSlice.reducer } })
type AppDispatch = typeof store.dispatch
const useAppDispatch = useDispatch.withTypes<AppDispatch>()
const useAppSelector = useSelector.withTypes<RootState>()

/** 展示搜索请求状态，并提供条件跳过和取消操作。 */
export function SearchPanel(): ReactElement {
  const dispatch = useAppDispatch()
  const state = useAppSelector((root) => root.search)
  const abortCurrent = useRef<(() => void) | null>(null)
  const [observation, setObservation] = useState<Observation>({
    actionType: '尚未产生最终 action',
    condition: '尚未判断',
    aborted: '尚未判断',
  })

  /** 派发搜索并保存本次请求的 abort 方法。 */
  async function search(keyword: string): Promise<void> {
    const request = dispatch(searchItems(keyword))
    abortCurrent.current = request.abort
    const action = await request
    abortCurrent.current = null

    if (searchItems.rejected.match(action)) {
      setObservation({
        actionType: action.type,
        condition: String(action.meta.condition),
        aborted: String(action.meta.aborted),
      })
      return
    }

    setObservation({
      actionType: action.type,
      condition: 'false',
      aborted: 'false',
    })
  }

  /** 取消当前运行中的搜索。 */
  function cancel(): void {
    abortCurrent.current?.()
  }

  /** 恢复搜索状态和最终 action 观察结果。 */
  function reset(): void {
    dispatch(searchSlice.actions.reset())
    setObservation({
      actionType: '尚未产生最终 action',
      condition: '尚未判断',
      aborted: '尚未判断',
    })
  }

  return (
    <main>
      <button type="button" onClick={() => void search('redux')}>
        搜索
      </button>
      <button type="button" disabled={state.status !== 'pending'} onClick={cancel}>
        取消
      </button>
      <button type="button" onClick={reset}>
        重置
      </button>
      <p>状态：{state.status}</p>
      <p>结果：{state.items.map((item) => item.title).join('、') || '无'}</p>
      <p>action.type：{observation.actionType}</p>
      <p>meta.condition：{observation.condition}</p>
      <p>meta.aborted：{observation.aborted}</p>
    </main>
  )
}

/** 为练习页面提供 Redux Provider。 */
export function createApp(): ReactElement {
  return (
    <Provider store={store}>
      <SearchPanel />
    </Provider>
  )
}
```
:::

## 九、本节小结

- 执行前不该发生的请求放入 `condition`；运行中已经开始的任务使用 `.abort()`。
- `dispatchConditionRejection` 只决定条件跳过是否通知 store，不会让 `payloadCreator` 执行。
- `thunkAPI.signal` 是底层取消协作的入口；不监听它，底层任务可能继续运行。
- 先检查 `meta.condition` 和 `meta.aborted`，再处理普通错误，保持取消与失败的语义差异。

## 十、参考资料

- [createAsyncThunk API](https://redux-toolkit.js.org/api/createAsyncThunk) - `condition`、`dispatchConditionRejection`、`.abort()`、`signal` 和取消元数据。
- [createAsyncThunk 2.12.0 源码](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/createAsyncThunk.ts) - 固定版本的条件判断、AbortController 和最终 action 生成流程。
- [createAsyncThunk 2.12.0 官方测试](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/tests/createAsyncThunk.test.ts) - 条件跳过与运行中取消的可观察断言。
