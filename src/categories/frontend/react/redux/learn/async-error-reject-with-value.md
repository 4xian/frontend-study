---
id: react.redux.learn.intermediate.async-error-reject-with-value
type: lesson
title: 异步错误与 rejectWithValue
summary: 区分预期业务拒绝与意外异常，并让 rejected action、Reducer 和组件获得准确的错误类型。
domain: frontend
technology: react
module: redux
stage: intermediate
level: intermediate
estimatedMinutes: 110
prerequisites:
  - react.redux.learn.intermediate.async-lifecycle-state
related:
  - react.redux.learn.intermediate.create-async-thunk
  - react.redux.learn.basics.typescript-pretyped-hooks
  - react.redux.learn.basics.use-dispatch
tags:
  - Redux Toolkit
  - createAsyncThunk
  - rejectWithValue
  - rejectValue
  - rejected action
  - unwrap
appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1、React Redux 9.3.0、React 19.2.8
verifiedAt: 2026-08-30
objectives:
  - 能区分可预期业务拒绝与意外异常，并为两者选择不同的错误通道。
  - 能通过 ThunkApiConfig 的 rejectValue 声明业务错误 payload 类型。
  - 能返回 rejectWithValue 生成带业务 payload 的 rejected action。
  - 能在 rejected Reducer 中分别读取 action.payload 与 action.error。
  - 能理解 meta.rejectedWithValue 和 unwrap 对两类失败的可观察结果。
  - 能在组件中展示字段错误与系统错误，而不把未知异常伪装成业务数据。
recap:
  - rejectWithValue 用于已有稳定结构、需要进入 Reducer 或组件的预期业务错误。
  - 普通抛错进入 rejected action.error，适合程序异常、网络故障等未建模失败。
  - rejectValue 泛型让 rejected action.payload 获得业务错误类型。
  - meta.rejectedWithValue 表明 rejected action 是否由 rejectWithValue 创建。
  - unwrap 在业务拒绝时抛出 payload，在普通抛错时抛出序列化错误。
  - Reducer 和组件必须保留两种错误的语义差异。
sources:
  - title: Redux Toolkit createAsyncThunk API
    url: https://redux-toolkit.js.org/api/createAsyncThunk
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - rejectWithValue 会把调用者提供的值放入 rejected action.payload。
      - 由 rejectWithValue 产生的 rejected action 带有 meta.rejectedWithValue 标记。
      - 普通抛错被序列化到 rejected action.error，dispatch Promise 本身仍以最终 action 解决。
      - unwrap 会在业务拒绝时抛出 payload，在普通失败时抛出序列化错误。
  - title: Redux Toolkit Usage with TypeScript
    url: https://redux-toolkit.js.org/usage/usage-with-typescript
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - ThunkApiConfig 的 rejectValue 字段声明 rejectWithValue 的参数与 rejected payload 类型。
      - 官方示例在 Reducer 和派发组件中分别读取业务 payload 与 action.error。
      - 预期失败格式已知时，应返回 rejectWithValue 提供该结构化错误。
  - title: Redux Toolkit 2.12.0 createAsyncThunk Source
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/createAsyncThunk.ts
    sourceType: source-code
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 固定源码用 RejectWithValue 包装业务 payload，并据此创建 rejected action。
      - 固定源码把 rejectedWithValue 设为 payload 是否存在的布尔值。
      - 固定源码的 unwrapResult 优先检查 rejectedWithValue，再决定抛出 payload 或 error。
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

# 异步错误与 rejectWithValue

## 一、学习目标

- 区分“请求按业务规则被拒绝”和“程序或基础设施意外失败”。
- 为 `createAsyncThunk` 声明结构化的 `rejectValue` 类型。
- 使用 `return rejectWithValue(...)` 创建带业务错误 payload 的 rejected action。
- 在 Reducer 中分别读取 `action.payload` 与 `action.error`。
- 理解 `meta.rejectedWithValue` 和 `.unwrap()` 对两类失败的不同结果。
- 在界面上分别呈现字段错误和系统错误。

## 二、为什么不能把所有失败都当成 Error

“邮箱已被占用”与“服务连接中断”都可能让保存失败，但它们对用户和程序的意义不同：

- 邮箱冲突是预期业务结果。服务端可以稳定返回错误码、说明和字段错误，界面应把信息放到对应输入附近。
- 连接中断是意外异常。应用通常只能显示通用提示、记录日志或允许重试，不能声称某个字段有问题。

如果两者都只保存为 `action.error.message`，Reducer 会失去错误码和字段映射；如果反过来把所有 `catch` 到的异常都包装为业务
payload，真实故障又会伪装成“可修正的输入错误”。错误建模的目标不是让所有失败形状一致，而是保留有用的语义差异。

`createAsyncThunk` 为此提供两个 rejected 通道：

```text
return rejectWithValue(businessError) -> action.payload
throw unexpectedError                  -> action.error
```

它们都会产生 `rejected` action，但内容和后续处理不同。

## 三、建立两类错误模型

### 1. 预期业务拒绝需要稳定结构

先定义应用真正会消费的错误数据：

```ts
type ProfileValidationError = {
  code: 'EMAIL_TAKEN'
  message: string
  fields: {
    email: string
  }
}
```

这个结构是客户端与服务端业务合同的一部分。Reducer 可以读取 `fields.email`，界面可以显示 `message`，分析代码也可以根据
`code` 区分原因。它应当可序列化，不放入 `Error` 实例、DOM 节点或函数。

### 2. 意外异常保留为 error

网络库抛错、程序断言失败或未知数据访问异常不一定具有业务结构。让这些值继续抛出，Redux Toolkit 会把常见错误属性序列化到
`action.error`：

```ts
throw new Error('资料服务暂时不可用')
```

Reducer 此时读取 `action.error.message`。序列化后的错误不是原始 `Error` 实例，也不应依赖任意自定义属性仍然存在。

### 3. 选择通道的判断规则

可以用一个问题判断：调用方是否知道这个失败的稳定字段，并需要据此采取明确业务行动？

- 知道：返回 `rejectWithValue`，例如字段校验、库存不足、状态冲突。
- 不知道：继续抛出，让它进入 `action.error`，例如断网、解析异常、程序错误。

不要仅凭 HTTP 状态码选择通道。同一个 400 响应也可能没有可信 schema；只有解析并验证过的业务错误才适合成为
`rejectWithValue` payload。

## 四、声明并返回 rejectValue

### 1. 第三个泛型参数声明错误 payload

`createAsyncThunk` 的三个关键泛型依次是成功返回值、调用参数和 Thunk API 配置：

```ts
const saveProfile = createAsyncThunk<
  Profile,
  SaveProfileRequest,
  { rejectValue: ProfileValidationError }
>('profile/save', async (request, { rejectWithValue }) => {
  // ...
})
```

`rejectValue` 不是 Slice state 字段。它只告诉 TypeScript：这个 Thunk 的 `rejectWithValue(...)` 接受什么，以及 rejected
action 的 `payload` 可能是什么。

### 2. 返回 rejectWithValue 的结果

当服务端返回已确认的业务错误时，直接返回：

```ts
if (!response.ok) {
  const issue = (await response.json()) as ProfileValidationError
  return rejectWithValue(issue)
}

return (await response.json()) as Profile
```

`return` 让 payload creator 在该分支明确结束，也方便 TypeScript 检查其余成功路径。官方 API 也允许抛出
`rejectWithValue(...)` 的结果，但常规业务分支使用 `return` 更容易阅读。

### 3. 不要用 rejectWithValue 包装未知异常

下面的写法会抹平错误边界：

```ts
try {
  return await profileApi.save(request)
} catch (error) {
  return rejectWithValue({
    code: 'EMAIL_TAKEN',
    message: String(error),
    fields: { email: '保存失败' },
  })
}
```

一个断网错误并不能证明邮箱已占用。只有能验证为 `ProfileValidationError` 的响应才转换；其余错误继续抛出。

## 五、在 rejected Reducer 中分流

### 1. 先检查业务 payload

声明 `rejectValue` 后，精确 rejected case 中的 `action.payload` 类型是
`ProfileValidationError | undefined`：

```ts
builder.addCase(saveProfile.rejected, (state, action) => {
  state.status = 'failed'

  if (action.payload) {
    state.fieldError = action.payload.fields.email
    state.systemError = null
    return
  }

  state.fieldError = null
  state.systemError = action.error.message ?? '未知系统错误'
})
```

本例的业务 payload 是对象，因此真值判断可以完成类型收窄。如果业务 payload 允许 `0`、空字符串等合法值，应使用
`action.payload !== undefined`，避免把合法 payload 误判为不存在。

### 2. pending 清理两类旧错误

新请求开始时，界面不应继续显示上一次业务错误或系统错误：

```ts
builder.addCase(saveProfile.pending, (state) => {
  state.status = 'pending'
  state.fieldError = null
  state.systemError = null
})
```

成功分支保存业务数据；失败分支只写入当前通道对应的错误。这样同一时刻不会既显示“邮箱占用”又显示“服务不可用”。

### 3. meta.rejectedWithValue 用于观察来源

由 `rejectWithValue` 创建的 rejected action 会带有：

```ts
action.meta.rejectedWithValue === true
```

普通抛错则为 `false`。这个标记适合记录、观察或需要明确区分来源的调用代码；Reducer 已经能够通过类型化
`action.payload` 完成常规分流，不必重复保存这个布尔值。

## 六、在派发组件中读取结果

### 1. 最终 action 保留两类错误

派发异步 Thunk 后可以先匹配成功与失败，再读取对应字段：

```ts
const resultAction = await dispatch(saveProfile(request))

if (saveProfile.fulfilled.match(resultAction)) {
  showSuccess(resultAction.payload)
} else if (resultAction.payload) {
  showFieldErrors(resultAction.payload.fields)
} else {
  showSystemError(resultAction.error.message)
}
```

dispatch Promise 仍然以最终 action 解决。仅生成 rejected action 不会让这次 `await dispatch(...)` 自动进入 `catch`。

### 2. unwrap 抛出的值也保持语义

需要用普通 `try/catch` 串联组件流程时调用 `.unwrap()`：

```ts
try {
  const profile = await dispatch(saveProfile(request)).unwrap()
  navigateToProfile(profile)
} catch (error) {
  // 业务拒绝时是 ProfileValidationError，普通抛错时是序列化错误。
  handleUnknownFailure(error)
}
```

JavaScript 的 `catch` 变量仍应按 `unknown` 处理。`rejectValue` 能精确描述 rejected action payload，但不会把所有可能抛出的
值变成同一个静态类型。

## 七、Demo：异步错误分流台

:::demo{id="react.redux.learn.intermediate.async-error-reject-with-value.error-channel-demo"}
:::

依次观察三个结果：

1. “保存成功”产生 fulfilled action，资料 payload 进入 Slice，`unwrap()` 返回资料。
2. “返回业务错误”通过 `rejectWithValue` 产生 rejected action，`payload` 包含 `EMAIL_TAKEN` 和字段错误，
   `meta.rejectedWithValue` 为真，`unwrap()` 抛出同一个业务 payload。
3. “抛出系统异常”产生没有业务 payload 的 rejected action，消息进入 `action.error`，`unwrap()` 抛出序列化错误。

Demo 的 Reducer 将字段错误和系统错误分开保存，并在每次 pending 时同时清理。重置会恢复 Slice 和结果观察区。

## 八、易错使用提示

:::pitfalls
### 错误：没有声明 rejectValue 类型

**触发条件：** 调用 `rejectWithValue` 返回结构化对象，却省略 ThunkApiConfig 的 `rejectValue`。

**原因：** TypeScript 不知道 rejected payload 的稳定业务形状。

**后果：** Reducer 中的 `action.payload` 无法安全读取字段，开发者容易使用断言掩盖错误。

**错误示例：**

```ts
const saveProfile = createAsyncThunk('profile/save', async (request, { rejectWithValue }) => {
  return rejectWithValue({ fields: { email: '邮箱已占用' } })
})
```

**正确写法：**

```ts
const saveProfile = createAsyncThunk<
  Profile,
  SaveProfileRequest,
  { rejectValue: ProfileValidationError }
>('profile/save', async (request, { rejectWithValue }) => {
  return rejectWithValue({
    code: 'EMAIL_TAKEN',
    message: '资料未保存',
    fields: { email: '邮箱已占用' },
  })
})
```

**验证方式：** 在 rejected Reducer 中读取 `action.payload?.fields.email`，类型应为 `string | undefined`。

### 错误：调用 rejectWithValue 却没有返回

**触发条件：** 在业务错误分支执行 `rejectWithValue(issue)` 后继续运行成功逻辑。

**原因：** `rejectWithValue` 返回一个供 payload creator 交给 Redux Toolkit 的特殊值；仅调用但不返回，不会结束当前函数。

**后果：** 代码可能继续解析错误响应并产生异常，最终 action 不再携带预期业务 payload。

**错误示例：**

```ts
if (!response.ok) {
  rejectWithValue(issue)
}
return response.json()
```

**正确写法：**

```ts
if (!response.ok) {
  return rejectWithValue(issue)
}
return response.json()
```

**验证方式：** 检查业务失败的 `action.meta.rejectedWithValue` 为真，且 `action.payload` 等于传入对象。

### 错误：把所有 catch 都伪装成业务错误

**触发条件：** 捕获任意 `unknown` 后都构造同一个校验 payload。

**原因：** 未先确认错误是否符合业务错误 schema。

**后果：** 断网或程序错误被显示成字段错误，排障信息丢失，用户得到错误指引。

**错误示例：**

```ts
catch (error) {
  return rejectWithValue({ code: 'EMAIL_TAKEN', message: String(error), fields: { email: '失败' } })
}
```

**正确写法：**

```ts
catch (error) {
  if (isProfileValidationError(error)) return rejectWithValue(error)
  throw error
}
```

**验证方式：** 分别模拟稳定业务响应和普通 `Error`；前者进入 payload，后者进入 error。

### 错误：Reducer 只读取 action.error

**触发条件：** rejected case 无条件保存 `action.error.message`。

**原因：** 忽略 `rejectWithValue` 把有用业务信息放在 `action.payload` 的合同。

**后果：** 业务拒绝通常只剩通用的 `Rejected`，字段错误和错误码丢失。

**错误示例：**

```ts
state.error = action.error.message ?? '保存失败'
```

**正确写法：**

```ts
state.error = action.payload?.message ?? action.error.message ?? '保存失败'
```

**验证方式：** 派发业务拒绝后，界面应显示业务消息而不是通用 `Rejected`。

### 错误：认为 await dispatch 会自动抛出 rejected

**触发条件：** 只给 `await dispatch(saveProfile(request))` 包裹 `try/catch`，但没有调用 `.unwrap()`。

**原因：** createAsyncThunk 的 dispatch Promise 会以最终 action 解决，便于调用方始终检查 action。

**后果：** 失败分支不会进入 `catch`，后续代码可能把 rejected action 当成成功结果。

**错误示例：**

```ts
try {
  await dispatch(saveProfile(request))
} catch {
  showError()
}
```

**正确写法：**

```ts
try {
  await dispatch(saveProfile(request)).unwrap()
} catch (error) {
  showUnknownError(error)
}
```

**验证方式：** 让请求返回业务拒绝；只有使用 `.unwrap()` 的版本进入 `catch`。
:::

## 九、源码推导与适用场景

### 1. rejectedWithValue 来自特殊返回值

Redux Toolkit 2.12.0 固定源码用内部 `RejectWithValue` 保存调用者给出的 payload。payload creator 结束后，源码识别该对象并用其
payload 创建 rejected action。

由此可以推导：`rejectWithValue` 不是派发另一个 action，而是在当前异步 Thunk 的最终 rejected action 上定义业务 payload。
内部包装类不是公共 API，应用只依赖 `rejectWithValue` 和最终 action 字段。

### 2. 普通 error 与业务 payload 不会互相替代

固定源码在创建 rejected action 时，将普通错误交给序列化函数，同时把业务拒绝值放在 `payload`。使用业务 payload 时，默认
`error.message` 是通用的 `Rejected`。

由此可以推导：有业务 payload 时优先读取 payload；没有时再读取 error。不要期待 `action.error` 自动复制字段错误。

### 3. unwrap 先判断 rejectedWithValue

固定源码的 `unwrapResult` 先检查 `action.meta.rejectedWithValue`：为真时抛出 `action.payload`；否则若存在 `action.error`，抛出
该 error；成功 action 则返回 payload。

由此可以推导：调用方可以用 `.unwrap()` 恢复普通 Promise 控制流，但 `catch` 中仍需区分可能的业务对象和序列化错误。本课只
建立错误通道，不规定全应用统一提示或日志策略。

## 十、练习

:::exercise
### 为邀请成员流程建立类型化业务拒绝

**要求：** 创建一个可运行的 React Redux 页面。定义 `InviteError`，包含稳定错误码、消息和 `email` 字段错误。使用
`createAsyncThunk<Member, InviteRequest, { rejectValue: InviteError }>` 创建 `inviteMember`：成功时返回成员；邮箱冲突时返回
`rejectWithValue`；系统故障时抛出普通 `Error`。Slice 的 rejected case 必须把业务字段错误与系统错误分开保存，组件提供三种
结果按钮和重置按钮，并使用 `.unwrap()` 展示调用结果。

**验收：** 成功时状态为 `succeeded` 且显示成员；邮箱冲突时状态为 `failed`，字段错误来自 `action.payload`，系统错误为空；
系统故障时业务 payload 不存在，系统错误来自 `action.error.message`；两类失败的 `.unwrap()` 观察文本不同；pending 和重置都会
清理旧错误。组件不得把未知异常强制断言成 `InviteError`。

**参考答案：**

```tsx
import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { useState, type ReactElement } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'

type InviteMode = 'success' | 'conflict' | 'system'

type Member = {
  id: string
  email: string
}

type InviteRequest = {
  email: string
  mode: InviteMode
}

type InviteError = {
  code: 'EMAIL_ALREADY_INVITED'
  message: string
  fields: { email: string }
}

type InviteState = {
  status: 'idle' | 'pending' | 'succeeded' | 'failed'
  member: Member | null
  fieldError: string | null
  systemError: string | null
}

const initialState: InviteState = {
  status: 'idle',
  member: null,
  fieldError: null,
  systemError: null,
}

/** 模拟成员邀请服务。 */
async function requestInvitation(request: InviteRequest): Promise<Member> {
  await Promise.resolve()
  if (request.mode === 'system') throw new Error('邀请服务暂时不可用')
  return { id: 'member-1', email: request.email }
}

const inviteMember = createAsyncThunk<
  Member,
  InviteRequest,
  { rejectValue: InviteError }
>('members/invite', async (request, { rejectWithValue }) => {
  if (request.mode === 'conflict') {
    return rejectWithValue({
      code: 'EMAIL_ALREADY_INVITED',
      message: '该成员已经收到邀请',
      fields: { email: '请勿重复邀请同一邮箱' },
    })
  }
  return requestInvitation(request)
})

const inviteSlice = createSlice({
  name: 'invite',
  initialState,
  reducers: {
    resetInvite: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(inviteMember.pending, (state) => {
        state.status = 'pending'
        state.fieldError = null
        state.systemError = null
      })
      .addCase(inviteMember.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.member = action.payload
      })
      .addCase(inviteMember.rejected, (state, action) => {
        state.status = 'failed'
        if (action.payload) {
          state.fieldError = action.payload.fields.email
          state.systemError = null
        } else {
          state.fieldError = null
          state.systemError = action.error.message ?? '未知系统错误'
        }
      })
  },
})

const { resetInvite } = inviteSlice.actions
const store = configureStore({ reducer: { invite: inviteSlice.reducer } })
type RootState = ReturnType<typeof store.getState>
type AppDispatch = typeof store.dispatch
const useAppDispatch = useDispatch.withTypes<AppDispatch>()
const useAppSelector = useSelector.withTypes<RootState>()

/** 将 unwrap 抛出的未知值转换为可读文本。 */
function describeError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message)
  }
  return String(error)
}

/** 派发三类邀请结果并展示 Redux 错误状态。 */
function InvitePanel(): ReactElement {
  const dispatch = useAppDispatch()
  const state = useAppSelector((rootState) => rootState.invite)
  const [result, setResult] = useState('尚未邀请')

  /** 派发邀请并通过 unwrap 观察调用结果。 */
  async function runInvite(mode: InviteMode): Promise<void> {
    try {
      const member = await dispatch(
        inviteMember({ email: 'student@example.com', mode }),
      ).unwrap()
      setResult(`邀请成功：${member.email}`)
    } catch (error) {
      setResult(`邀请失败：${describeError(error)}`)
    }
  }

  /** 恢复邀请状态和调用结果。 */
  function reset(): void {
    dispatch(resetInvite())
    setResult('尚未邀请')
  }

  return (
    <section>
      <p>状态：{state.status}</p>
      <p>成员：{state.member?.email ?? '暂无'}</p>
      <p>字段错误：{state.fieldError ?? '无'}</p>
      <p>系统错误：{state.systemError ?? '无'}</p>
      <p>{result}</p>
      <button type="button" onClick={() => void runInvite('success')}>
        邀请成功
      </button>
      <button type="button" onClick={() => void runInvite('conflict')}>
        邮箱冲突
      </button>
      <button type="button" onClick={() => void runInvite('system')}>
        系统故障
      </button>
      <button type="button" onClick={reset}>
        重置
      </button>
    </section>
  )
}

/** 创建可挂载的邀请页面。 */
export function createApp(): ReactElement {
  return (
    <Provider store={store}>
      <InvitePanel />
    </Provider>
  )
}
```
:::

## 十一、本节小结

- `rejectWithValue` 用于经过确认、具有稳定结构的预期业务拒绝。
- 普通异常保留在 `action.error`，不要伪装成字段错误。
- `{ rejectValue: BusinessError }` 同时约束 `rejectWithValue` 参数和 rejected payload。
- rejected Reducer 先读取业务 payload，不存在时再读取序列化 error。
- `meta.rejectedWithValue` 标记失败来源，`.unwrap()` 会抛出对应 payload 或 error。
- `catch` 变量仍按 `unknown` 处理，错误通道不同不等于所有异常拥有同一类型。

## 十二、参考资料

- [Redux Toolkit createAsyncThunk API](https://redux-toolkit.js.org/api/createAsyncThunk)
- [Redux Toolkit Usage with TypeScript](https://redux-toolkit.js.org/usage/usage-with-typescript)
- [Redux Toolkit 2.12.0 createAsyncThunk 源码](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/createAsyncThunk.ts)
- [Redux Toolkit 2.12.0 npm 最新版元数据](https://registry.npmjs.org/@reduxjs/toolkit/latest)
- [Redux 5.0.1 npm 最新版元数据](https://registry.npmjs.org/redux/latest)
- [React Redux 9.3.0 npm 最新版元数据](https://registry.npmjs.org/react-redux/latest)
- [React 19.2.8 npm 最新版元数据](https://registry.npmjs.org/react/latest)
