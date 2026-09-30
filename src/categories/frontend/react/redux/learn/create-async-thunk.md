---
id: react.redux.learn.intermediate.create-async-thunk
type: lesson
title: createAsyncThunk
summary: 使用 createAsyncThunk 从一个异步 payloadCreator 生成标准生命周期 action，并正确处理派发结果。
domain: frontend
technology: react
module: redux
stage: intermediate
level: intermediate
estimatedMinutes: 100
prerequisites:
  - react.redux.learn.intermediate.thunk-async-logic
related:
  - react.redux.learn.basics.configure-store
  - react.redux.learn.basics.typescript-pretyped-hooks
  - react.redux.learn.basics.use-dispatch
tags:
  - Redux Toolkit
  - createAsyncThunk
  - payloadCreator
  - fulfilled
  - rejected
  - unwrap
appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1、React Redux 9.3.0、React 19.2.8
verifiedAt: 2026-08-30
objectives:
  - 能说明 type prefix、payloadCreator 与返回的 Thunk action creator 各自承担的职责。
  - 能根据 type prefix 推导 pending、fulfilled 和 rejected 三种 action type。
  - 能用一个可序列化参数对象向 payloadCreator 传入请求所需信息。
  - 能区分 dispatch Promise 返回的最终 action 与 unwrap 返回的业务 payload。
  - 能用附加的 match 方法安全判断 fulfilled 或 rejected action。
  - 能依靠参数和返回值推导建立常规 createAsyncThunk TypeScript 类型。
recap:
  - createAsyncThunk 返回一个 Thunk action creator，并附加 pending、fulfilled、rejected action creator。
  - 派发后会先产生 pending，再根据 payloadCreator 的 Promise 结果产生 fulfilled 或 rejected。
  - payloadCreator 的第一个参数就是调用 Thunk action creator 时传入的单个 arg。
  - dispatch 返回的 Promise 总是以最终 action 解决，不会仅因生成 rejected action 而自行拒绝。
  - fulfilled.match 与 rejected.match 能同时完成运行时判断和 TypeScript 类型收窄。
  - 调用 dispatch 返回 Promise 上的 unwrap，可以取得 fulfilled payload，或在 rejected 时抛出错误。
sources:
  - title: Redux Toolkit createAsyncThunk API
    url: https://redux-toolkit.js.org/api/createAsyncThunk
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - createAsyncThunk 接收 type prefix 与 payloadCreator，并返回异步 Thunk action creator。
      - 返回值附加 pending、fulfilled、rejected action creator 和对应 match 能力。
      - 派发结果 Promise 总是以 fulfilled 或 rejected 最终 action 解决，unwrap 用于取得 payload 或抛出错误。
      - createAsyncThunk 不会自动生成 Reducer，因为状态结构和处理方式由应用决定。
  - title: Redux Toolkit Usage with TypeScript
    url: https://redux-toolkit.js.org/usage/usage-with-typescript
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 常规用法只需标注 payloadCreator 的 arg 类型，返回类型和生成 action 的 payload 类型可自动推导。
      - dispatch 异步 Thunk 后得到类型准确的 fulfilled 或 rejected action，官方推荐按需要调用 unwrap。
      - 需要配置 thunkAPI 类型时，可以使用 Returned、ThunkArg 和 ThunkApiConfig 泛型。
  - title: Redux Toolkit 2.12.0 createAsyncThunk Source
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/createAsyncThunk.ts
    sourceType: source-code
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 固定源码在执行 payloadCreator 前派发 pending，并在异步工作结束后派发最终 action。
      - 固定源码把最终 Promise 附加 arg 和 unwrap 方法。
      - 固定源码把 pending、fulfilled、rejected 和 typePrefix 附加到返回的 action creator。
  - title: React Redux Usage with TypeScript
    url: https://react-redux.js.org/using-react-redux/usage-with-typescript
    sourceType: api-doc
    appliesTo: React Redux 9.3.0
    claims:
      - 官方建议从实际 store 推导 AppDispatch，并通过 useDispatch.withTypes 创建预类型 Hook。
      - 预类型 dispatch Hook 能保留异步 Thunk 的参数与返回结果类型。
  - title: Redux Toolkit 2.12.0 npm Latest Metadata
    url: https://registry.npmjs.org/@reduxjs/toolkit/latest
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - npm latest 在核验日指向 Redux Toolkit 2.12.0。
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

# createAsyncThunk

## 一、学习目标

- 解释 `type` 前缀、`payloadCreator` 与返回的 Thunk action creator 的职责。
- 根据一个前缀识别自动生成的 `pending`、`fulfilled` 和 `rejected` action。
- 用单个参数或参数对象向异步流程传递输入。
- 区分 `dispatch` 返回的最终 action 与 `.unwrap()` 返回的业务结果。
- 使用附加的 `.match()` 方法判断最终 action 并获得类型收窄。
- 让 TypeScript 从 `payloadCreator` 的参数和返回值推导异步 Thunk 类型。

## 二、为什么需要 createAsyncThunk

手写 Thunk 可以组织任意流程，但一次标准异步请求通常会重复相同结构：先说明请求开始，等待 Promise，再根据成功或失败派发
不同 action。开发者如果为每个请求手工定义三组 action creator 和 action type，命名、payload 形状与错误行为容易不一致。

`createAsyncThunk` 把这段重复结构固定下来。开发者提供一个稳定的 action type 前缀和真正执行异步工作的
`payloadCreator`，Redux Toolkit 返回一个可以派发的 Thunk action creator，并自动建立请求开始、成功和失败三种普通
action。

它仍然基于 Thunk middleware。`createAsyncThunk(...)` 是定义工具，调用返回的 action creator 只会创建 Thunk；真正执行
仍从 `dispatch(thunkAction)` 开始。

## 三、createAsyncThunk 的最小模型

### 1. 两个核心定义参数

`createAsyncThunk` 的基本形状是：

```ts
createAsyncThunk(typePrefix, payloadCreator)
```

- `typePrefix`：当前异步流程的稳定名称，用来生成生命周期 action type。
- `payloadCreator`：接收业务参数并返回业务结果的函数，可以返回 Promise，也可以同步返回值。

本课只使用这两个核心参数：

```ts
type CoursePreview = {
  id: string
  title: string
}

/** 根据课程 ID 读取预览数据。 */
const loadCoursePreview = createAsyncThunk(
  'coursePreview/load',
  async (courseId: string): Promise<CoursePreview> => {
    return await courseApi.getPreview(courseId)
  },
)
```

`coursePreview/load` 是前缀，不是最终唯一的 action type。`loadCoursePreview` 是 Redux Toolkit 返回的 Thunk action
creator。

### 2. 自动生成的 action creator

上述定义会得到以下公开成员：

```ts
loadCoursePreview.pending.type
// 'coursePreview/load/pending'

loadCoursePreview.fulfilled.type
// 'coursePreview/load/fulfilled'

loadCoursePreview.rejected.type
// 'coursePreview/load/rejected'
```

`pending`、`fulfilled` 和 `rejected` 不只是字符串属性，而是标准 action creator。它们各自还提供 `.type`、`.toString()` 和
`.match(action)` 等由 `createAction` 建立的能力。

调用 `loadCoursePreview('redux-async')` 不会立刻发请求。它返回一段 Thunk action，必须交给 store：

```ts
const promise = store.dispatch(loadCoursePreview('redux-async'))
```

### 3. payloadCreator 的 arg

`payloadCreator` 的第一个参数就是调用 Thunk action creator 时传入的 `arg`：

```ts
/** 使用课程 ID 请求数据。 */
const loadCoursePreview = createAsyncThunk(
  'coursePreview/load',
  async (courseId: string) => courseApi.getPreview(courseId),
)

store.dispatch(loadCoursePreview('redux-async'))
```

一个异步 Thunk 只接收一个 `arg`。请求需要多个值时，把它们放进对象：

```ts
type PreviewRequest = {
  courseId: string
  locale: 'zh-CN' | 'en-US'
}

/** 使用一个参数对象保存完整请求输入。 */
const loadLocalizedPreview = createAsyncThunk(
  'coursePreview/loadLocalized',
  async (request: PreviewRequest) => {
    return courseApi.getLocalizedPreview(request.courseId, request.locale)
  },
)

store.dispatch(loadLocalizedPreview({ courseId: 'redux-async', locale: 'zh-CN' }))
```

同一个 `arg` 会保存在生命周期 action 的 `meta.arg` 中，因此结果 action 仍能说明它属于哪次输入。

### 4. payloadCreator 的 thunkAPI

第二个参数 `thunkAPI` 提供手写 Thunk 常见的 `dispatch`、`getState` 和额外依赖：

```ts
/** 读取当前登录信息后请求课程预览。 */
const loadPrivatePreview = createAsyncThunk(
  'coursePreview/loadPrivate',
  async (courseId: string, thunkAPI) => {
    const state = thunkAPI.getState() as RootState
    return courseApi.getPrivatePreview(courseId, state.session.token)
  },
)
```

只在流程确实需要 store 状态或继续派发时使用这些能力。普通请求只使用 `arg`，能够让输入与结果合同更直接。

### 5. 返回值与抛出决定最终 action

`payloadCreator` 正常返回值或解决的 Promise 时，值进入 `fulfilled` action 的 `payload`：

```ts
/** 返回服务提供的业务数据。 */
async function payloadCreator(courseId: string): Promise<CoursePreview> {
  const preview = await courseApi.getPreview(courseId)
  return preview
}
```

`payloadCreator` 抛出错误或返回拒绝的 Promise 时，Redux Toolkit 会捕获该错误并生成 `rejected` action。普通抛错会被
序列化到 `action.error`；不要把任意 `Error` 实例当作可直接保留全部自定义字段的业务 payload。

## 四、派发顺序与调用结果

### 1. 标准执行顺序

派发一个由 `createAsyncThunk` 创建的 Thunk 后，标准顺序是：

1. 派发 `<typePrefix>/pending`。
2. 以 `arg` 和 `thunkAPI` 调用 `payloadCreator`。
3. 等待返回值解决或拒绝。
4. 成功时创建并派发 `fulfilled`，失败时创建并派发 `rejected`。
5. 让 dispatch Promise 以最终 action 解决。

`createAsyncThunk` 负责产生 action，不负责决定 Redux state 应该保存什么。即使 store 没有处理这些 action，异步流程仍会
执行并返回最终 action。

### 2. dispatch Promise 返回最终 action

```ts
/** 派发请求并读取最终 action。 */
async function inspectResult(courseId: string): Promise<void> {
  const finalAction = await store.dispatch(loadCoursePreview(courseId))
  console.log(finalAction.type)
  console.log(finalAction.meta.arg)
}
```

成功时 `finalAction` 是 `fulfilled` action，失败时是 `rejected` action。关键点是：这两种情况都会让 dispatch 返回的
Promise 正常解决。这样可以避免组件忽略 Promise 后产生未处理拒绝，但也意味着普通 `try/catch` 不会仅因请求生成
`rejected` action 而进入 `catch`。

### 3. 使用 match 判断 action

不要手写字符串比较，也不要先断言 action 类型。附加的 `.match()` 同时完成运行时判断和 TypeScript 收窄：

```ts
/** 根据最终 action 分别读取 payload 或 error。 */
async function inspectPreview(courseId: string): Promise<void> {
  const action = await store.dispatch(loadCoursePreview(courseId))

  if (loadCoursePreview.fulfilled.match(action)) {
    console.log(action.payload.title)
    return
  }

  console.error(action.error.message)
}
```

这个分支适合调用方需要完整 action、`meta.arg` 或 action type 的场景。

### 4. 使用 unwrap 取得业务结果

dispatch 返回的 Promise 还附加 `.unwrap()`。成功时它返回 `fulfilled` action 的 `payload`，失败时抛出序列化错误或明确的
拒绝 payload：

```tsx
/** 等待业务结果，并按普通 Promise 方式处理失败。 */
async function handleLoad(courseId: string): Promise<void> {
  try {
    const preview = await dispatch(loadCoursePreview(courseId)).unwrap()
    setMessage(`已加载：${preview.title}`)
  } catch (error) {
    setMessage(`加载失败：${readErrorMessage(error)}`)
  }
}
```

需要业务数据时优先使用 `.unwrap()`；需要检查最终 Redux action 时等待 dispatch Promise 本身。二者不是两次请求，
`.unwrap()` 只是基于同一个派发结果转换返回语义。

## 五、TypeScript 类型推导

### 1. 从 arg 与返回值推导常规类型

常规用法不需要写完整泛型。标注 `payloadCreator` 的第一个参数，TypeScript 会把它作为 Thunk action creator 的参数类型；
返回的 Promise 类型会成为 `fulfilled` payload 类型：

```ts
/** 让参数和服务返回值驱动 createAsyncThunk 类型推导。 */
const loadCoursePreview = createAsyncThunk(
  'coursePreview/load',
  async (courseId: string) => {
    return await courseApi.getPreview(courseId)
  },
)
```

如果 `getPreview` 返回 `Promise<CoursePreview>`，那么 `loadCoursePreview` 只接受 `string`，且
`loadCoursePreview.fulfilled` 的 payload 是 `CoursePreview`。

### 2. 需要 thunkAPI 配置时再写泛型

当 `payloadCreator` 需要有类型的 `getState`、`dispatch` 或额外依赖时，可以提供三个泛型位置：返回值、Thunk 参数、
`ThunkApiConfig`。

```ts
/** 为 getState 提供应用状态类型。 */
const loadPrivatePreview = createAsyncThunk<
  CoursePreview,
  string,
  { state: RootState }
>('coursePreview/loadPrivate', async (courseId, thunkAPI) => {
  const token = thunkAPI.getState().session.token
  return courseApi.getPrivatePreview(courseId, token)
})
```

只为真实使用的字段配置类型。为了“看起来完整”一次性填写所有泛型，会让简单请求难以阅读。

### 3. 组件继续使用 AppDispatch

`createAsyncThunk` 返回的是 Thunk action creator，组件中的 dispatch 仍需保留 store middleware 扩展：

```ts
type AppDispatch = typeof store.dispatch

/** 创建应用统一使用的预类型 dispatch Hook。 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
```

从实际 store 推导 `AppDispatch`，可以让 `dispatch(loadCoursePreview(id))`、最终 action 和 `.unwrap()` 的类型保持一致。

## 六、职责与适用边界

### 1. 自动生成 action，不自动生成 Reducer

`createAsyncThunk` 不知道应用要保存数据、替换数据，还是只记录一次操作，因此不会创建 Reducer，也不会自动向 state 写入
`loading`、`data` 或 `error`。应用必须显式决定是否以及如何响应生成的 action。

这条边界很重要：能在 Redux DevTools 看到 `fulfilled` action，不等于 state 已保存其中的 payload。

### 2. 适合具有明确起止的一次性工作

`createAsyncThunk` 适合一个参数触发、等待 Promise 并形成标准结果 action 的流程，例如提交表单、生成导出文件或执行一次
刷新命令。流程需要额外步骤时，`payloadCreator` 仍可以使用 `thunkAPI` 读取 state 或派发其他 action。

需要缓存、去重、失效、自动重新获取和订阅的服务端数据，不应仅因为存在网络请求就默认手工放进普通 slice。
`createAsyncThunk` 规范化一次异步工作，不等于提供完整服务端缓存系统。

### 3. arg 与 payload 应保持可序列化

`arg` 会进入 `action.meta.arg`，返回值会进入 `action.payload`。优先传递 ID、字符串、数字和普通对象，返回已经解析的业务
数据。不要把 DOM 节点、组件实例、带方法的响应对象或长期连接句柄塞进 action。

## 七、Demo：createAsyncThunk 结果观察台

:::demo{id="react.redux.learn.intermediate.create-async-thunk.result-observer-demo"}
:::

操作时重点观察：

1. 页面直接读取 `pending.type`、`fulfilled.type` 和 `rejected.type`，三者共享同一个前缀。
2. 修改 `courseId` 后运行成功请求，最终 action 的 `meta.arg` 保留完整输入。
3. 成功请求让 `fulfilled.match(action)` 为 `true`，`.unwrap()` 返回业务 payload。
4. 运行失败请求，dispatch Promise 仍显示“已解决”，最终 action 变为 `rejected`。
5. 同一次失败派发的 `.unwrap()` 会抛出序列化错误，组件可以在 `catch` 中处理。
6. 恢复初始状态后可以重复比较两条路径。

Demo 使用真实 `configureStore`、`Provider`、预类型 dispatch 和 `createAsyncThunk`。最小 Reducer 故意不处理生命周期
action，让观察范围集中在 action 生成与调用结果，不把 UI 展示状态误当成 Redux 中的请求状态模型。

## 八、易错使用提示

:::pitfalls
### 错误：只调用 Thunk action creator，没有 dispatch

**触发条件：** 调用 `loadCoursePreview(id)` 后等待其返回值，却没有交给 store。

**原因：** 调用返回的 action creator 只会创建 Thunk action；middleware 只有在 dispatch 时才会执行它。

**后果：** `pending` 不会派发，`payloadCreator` 不会运行，也不会产生最终 action。

**错误示例：**

```ts
await loadCoursePreview('redux-async')
```

**正确写法：**

```ts
await store.dispatch(loadCoursePreview('redux-async'))
```

**验证方式：** 在 `payloadCreator` 或服务替身中记录调用次数；没有 dispatch 时次数保持为零，dispatch 后只调用一次。

### 错误：认为 rejected action 会让 dispatch Promise 自动拒绝

**触发条件：** 用 `try/catch` 包住 `await dispatch(loadCoursePreview(id))`，并期待请求失败时进入 `catch`。

**原因：** `createAsyncThunk` 生成的 dispatch Promise 总是以最终 action 解决，包括 `rejected` action。

**后果：** 失败分支没有执行，调用方可能把 rejected action 当作成功后的普通结果继续处理。

**错误示例：**

```ts
try {
  await dispatch(loadCoursePreview(courseId))
} catch {
  showError()
}
```

**正确写法：**

```ts
try {
  const preview = await dispatch(loadCoursePreview(courseId)).unwrap()
  showPreview(preview)
} catch (error) {
  showError(error)
}
```

**验证方式：** 让服务 Promise 拒绝；确认等待 dispatch 本身得到 `rejected` action，而调用 `.unwrap()` 才进入 `catch`。

### 错误：捕获错误后把错误对象正常 return

**触发条件：** 在 `payloadCreator` 中捕获服务错误，然后 `return error` 或返回一个错误说明对象。

**原因：** 正常 return 表示 Promise 已解决，Redux Toolkit 会据此生成 `fulfilled` action。

**后果：** 失败请求被标记为 fulfilled，调用方必须猜测 payload 到底是成功数据还是错误对象。

**错误示例：**

```ts
const loadPreview = createAsyncThunk('preview/load', async (id: string) => {
  try {
    return await api.getPreview(id)
  } catch (error) {
    return error
  }
})
```

**正确写法：**

```ts
const loadPreview = createAsyncThunk('preview/load', async (id: string) => {
  return await api.getPreview(id)
})
```

**验证方式：** 让服务拒绝，检查最终 action 必须通过 `loadPreview.rejected.match(action)`。

### 错误：给 action creator 传多个位置参数

**触发条件：** 希望同时传 ID、语言和刷新标记，直接调用 `loadPreview(id, locale, force)`。

**原因：** 异步 Thunk action creator 的业务输入只有一个 `arg`；额外位置不是独立业务参数。

**后果：** TypeScript 报参数错误，或请求输入没有按预期进入 `payloadCreator` 与 `meta.arg`。

**错误示例：**

```ts
dispatch(loadPreview('redux-async', 'zh-CN', true))
```

**正确写法：**

```ts
dispatch(
  loadPreview({
    courseId: 'redux-async',
    locale: 'zh-CN',
    force: true,
  }),
)
```

**验证方式：** 检查 `payloadCreator` 收到一个完整对象，最终 action 的 `meta.arg` 与派发输入一致。

### 错误：期待 createAsyncThunk 自动写入 Redux state

**触发条件：** 定义并派发异步 Thunk 后，直接从 state 读取 `loading` 或返回数据，却没有 Reducer 响应生成的 action。

**原因：** 工具只创建生命周期 action 和执行流程，不知道应用的 state 结构与更新规则。

**后果：** 请求已经完成且 DevTools 中存在 action，但 Redux state 保持原样。

**错误示例：**

```ts
const loadPreview = createAsyncThunk('preview/load', api.getPreview)
// 没有任何 Reducer 处理 loadPreview.fulfilled
```

**正确写法：**

```ts
const loadPreview = createAsyncThunk('preview/load', api.getPreview)

// 在拥有该状态的 Reducer 中显式响应生成的 action。
builder.addCase(loadPreview.fulfilled, (state, action) => {
  state.preview = action.payload
})
```

**验证方式：** 分别检查 action 记录和 state 快照；只有注册相应 Reducer 后，payload 才会进入 state。
:::

## 九、源码推导与适用场景

### 1. 返回函数附加了一组稳定成员

Redux Toolkit 2.12.0 固定源码在创建 action creator 后，通过 `Object.assign` 附加 `pending`、`fulfilled`、`rejected` 和
`typePrefix`。

由此可以推导：应用应引用 `loadCoursePreview.fulfilled` 或它的 `.match()`，而不是在多处重新拼接字符串。附加成员属于公开
API，但源码中的局部变量名和文件组织不是应用合同。

### 2. pending 位于 payloadCreator 之前

固定源码先 `dispatch(pending(...))`，再执行并等待 `payloadCreator(arg, thunkAPI)`。成功值被包装为 `fulfilled`，抛出值被
捕获并包装为 `rejected`，最后才派发最终 action。

由此可以推导：`pending` 表示工作已经获准开始，`fulfilled` 或 `rejected` 表示本次异步工作已经结束。具体 state 字段与界面
策略仍由应用定义，工具不保证某个固定的 loading 模型。

### 3. dispatch Promise 保存最终 action

固定源码的内部 async 函数返回 `finalAction`，并把该 Promise 作为 Thunk dispatch 的结果。因此服务拒绝会先被转换为
`rejected` action，外层 dispatch Promise 再以该 action 解决。

由此可以推导：需要 action 元数据时等待 dispatch 本身；需要传统“成功返回、失败抛出”语义时调用 `.unwrap()`。这不是对
任意手写 Thunk 的承诺，只适用于 `createAsyncThunk` 返回的 action creator。

### 4. unwrap 复用同一个 Promise

固定源码把 `unwrap()` 实现为基于同一个 Promise 的 `.then(unwrapResult)`。它不会重新调用 `payloadCreator`，而是解释已经
得到的最终 action。

由此可以推导：调用方可以保存一次 dispatch 结果，先检查 action，再按需要对同一个结果调用 `.unwrap()`。不要为了同时
读取 action 与 payload 而重复 dispatch 请求。

## 十、练习

:::exercise
### 编写可观察最终 action 的课程卡片请求

**要求：** 创建一个可运行的 React Redux 页面。定义 `LoadCardRequest` 和 `CourseCard`，使用
`createAsyncThunk('courseCard/load', payloadCreator)` 调用一个可成功或抛错的模拟服务。store 使用最小 Reducer，不保存
请求生命周期。组件必须使用预类型 dispatch，提供“成功请求”和“失败请求”按钮；每次只 dispatch 一次，先用
`fulfilled.match` 或 `rejected.match` 显示最终 action type，再对同一个 dispatch 结果调用 `.unwrap()`，显示 payload 或捕获
到的错误。不得手写 `pending`、`fulfilled`、`rejected` action creator。

**验收：** 成功请求最终类型为 `courseCard/load/fulfilled`，matcher 读取到有类型的 `CourseCard` payload，`.unwrap()` 返回
同一业务数据；失败请求最终类型为 `courseCard/load/rejected`，等待 dispatch 本身不抛错，`.unwrap()` 进入 `catch`。两个
按钮都只让模拟服务执行一次，TypeScript 能检查请求参数和成功 payload。

**参考答案：**

```tsx
import { configureStore, createAsyncThunk } from '@reduxjs/toolkit'
import { useState, type ComponentType, type ReactElement } from 'react'
import { Provider, useDispatch } from 'react-redux'

type LoadCardRequest = {
  courseId: string
  shouldFail: boolean
}

type CourseCard = {
  courseId: string
  title: string
}

type AppState = {
  ready: boolean
}

const initialState: AppState = { ready: true }

/** 模拟课程卡片服务。 */
async function requestCourseCard(request: LoadCardRequest): Promise<CourseCard> {
  await Promise.resolve()

  if (request.shouldFail) {
    throw new Error(`无法加载 ${request.courseId}`)
  }

  return {
    courseId: request.courseId,
    title: 'createAsyncThunk',
  }
}

const loadCourseCard = createAsyncThunk(
  'courseCard/load',
  async (request: LoadCardRequest) => requestCourseCard(request),
)

/** 提供不处理生命周期 action 的最小 Reducer。 */
function appReducer(state: AppState = initialState): AppState {
  return state
}

const store = configureStore({ reducer: appReducer })

type AppDispatch = typeof store.dispatch

/** 创建能够派发异步 Thunk 的预类型 Hook。 */
const useAppDispatch = useDispatch.withTypes<AppDispatch>()

/** 从未知错误中读取消息。 */
function readErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message)
  }
  return String(error)
}

/** 派发请求并展示最终 action 与 unwrap 结果。 */
function CourseCardPanel(): ReactElement {
  const dispatch = useAppDispatch()
  const [isRunning, setIsRunning] = useState(false)
  const [finalType, setFinalType] = useState('尚未派发')
  const [matchResult, setMatchResult] = useState('尚未匹配')
  const [unwrapResult, setUnwrapResult] = useState('尚未调用 unwrap')

  /** 只派发一次请求，并复用同一个 dispatch 结果。 */
  async function runRequest(shouldFail: boolean): Promise<void> {
    setIsRunning(true)
    const dispatched = dispatch(
      loadCourseCard({
        courseId: 'redux-async',
        shouldFail,
      }),
    )
    const action = await dispatched

    setFinalType(action.type)
    if (loadCourseCard.fulfilled.match(action)) {
      setMatchResult(`fulfilled payload：${action.payload.title}`)
    } else {
      setMatchResult(`rejected error：${action.error.message ?? '未知错误'}`)
    }

    try {
      const card = await dispatched.unwrap()
      setUnwrapResult(`unwrap payload：${card.title}`)
    } catch (error) {
      setUnwrapResult(`unwrap error：${readErrorMessage(error)}`)
    }

    setIsRunning(false)
  }

  return (
    <main>
      <h1>课程卡片请求</h1>
      <button type="button" disabled={isRunning} onClick={() => void runRequest(false)}>
        成功请求
      </button>
      <button type="button" disabled={isRunning} onClick={() => void runRequest(true)}>
        失败请求
      </button>
      <p aria-live="polite">最终 action：{finalType}</p>
      <p>{matchResult}</p>
      <p>{unwrapResult}</p>
    </main>
  )
}

/** 挂载练习使用的 React Redux Provider。 */
function App(): ReactElement {
  return (
    <Provider store={store}>
      <CourseCardPanel />
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

- `createAsyncThunk` 用 type prefix 和 `payloadCreator` 建立一个标准异步 Thunk action creator。
- 派发时先产生 `pending`，再根据 Promise 结果产生 `fulfilled` 或 `rejected`。
- 一个异步 Thunk 只接收一个 `arg`；多个输入应放进可序列化对象，并会保留在 `meta.arg`。
- dispatch Promise 总是返回最终 action；使用附加 `.match()` 可以安全判断并收窄类型。
- `.unwrap()` 把同一个派发结果转换为“成功返回 payload、失败抛出”的调用语义。
- `createAsyncThunk` 不会自动创建 Reducer 或请求状态，也不等同于服务端缓存方案。

## 十二、参考资料

- [Redux Toolkit createAsyncThunk API](https://redux-toolkit.js.org/api/createAsyncThunk)
- [Redux Toolkit Usage with TypeScript](https://redux-toolkit.js.org/usage/usage-with-typescript)
- [Redux Toolkit 2.12.0 createAsyncThunk 源码](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/createAsyncThunk.ts)
- [React Redux Usage with TypeScript](https://react-redux.js.org/using-react-redux/usage-with-typescript)
- [Redux Toolkit 2.12.0 npm 最新版元数据](https://registry.npmjs.org/@reduxjs/toolkit/latest)
- [React Redux 9.3.0 npm 最新版元数据](https://registry.npmjs.org/react-redux/latest)
- [React 19.2.8 npm 最新版元数据](https://registry.npmjs.org/react/latest)
