---
id: react.core.learn.advanced.use-action-state-result-queue
type: lesson
title: useActionState 与 Action 结果
summary: 用前次结果串联顺序执行的 Action，并准确处理 payload、pending 与错误结果。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 85
prerequisites:
  - react.core.learn.advanced.form-action-client-submission
related:
  - react.core.learn.advanced.use-transition-pending-action
tags:
  - React
  - useActionState
  - Action
  - FormData
  - isPending
appliesTo: React 19.2
verifiedAt: 2026-08-18
objectives:
  - 能在组件顶层正确使用 useActionState 的参数、返回值、TypeScript 类型和 Action 签名。
  - 能使用 previousState 串联顺序执行的 Action，并区分它与闭包 State。
  - 能通过 Action prop 或 startTransition 建立正确的 Action 上下文，并理解 dispatchAction 返回 void。
  - 能把 FormData、普通值或可辨识对象作为 payload，并选择合适的数据结构。
  - 能区分业务失败结果与抛出异常，并使用 isPending 表达准确的等待状态。
  - 能区分 Action 结果 State、普通 UI State、表单状态与临时乐观状态的职责。
recap:
  - useActionState 返回 [state, dispatchAction, isPending]，首次 state 等于 initialState。
  - Action 签名是 (previousState, payload)，同步值或 Promise fulfillment value 会成为下一 State。
  - dispatchAction 返回 void，必须从 Action 上下文调用，结果只能从后续渲染的 state 读取。
  - 多次 dispatchAction 会顺序执行，后一项的 previousState 是前一项返回的结果。
  - isPending 是该 Hook 的聚合等待信号，不是队列长度、请求身份或业务成功标志。
  - 可预期失败应返回可辨识结果 State；未知异常应抛出并交给最近的 Error Boundary。
sources:
  - title: React useActionState Reference
    url: https://react.dev/reference/react/useActionState
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 参数、返回三元组、顺序队列、Action 上下文、错误、重置与排错合同
  - title: React form Reference
    url: https://react.dev/reference/react-dom/components/form
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - function action 的 FormData、Transition 与成功后表单重置合同
  - title: React startTransition Reference
    url: https://react.dev/reference/react/startTransition
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 手动派发 Action 的 Transition 上下文与 await 后更新边界
  - title: React Rules of Hooks
    url: https://react.dev/reference/rules/rules-of-hooks
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Hook 只能在函数组件或自定义 Hook 顶层调用
  - title: React State as a Snapshot
    url: https://react.dev/learn/state-as-a-snapshot
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - render 闭包读取对应渲染的 State 快照
  - title: React useFormStatus Reference
    url: https://react.dev/reference/react-dom/hooks/useFormStatus
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 表单提交上下文与 Action 结果 State 的职责边界
  - title: React 19.2.8 ReactFiberHooks source
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 当前版本的顺序执行、错误取消和 dispatch 返回实现旁证
  - title: React useReducer Reference
    url: https://react.dev/reference/react/useReducer
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 纯 reducer 与 Action reducer 的职责差异
  - title: React useOptimistic Reference
    url: https://react.dev/reference/react/useOptimistic
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 已确认结果 State 与临时乐观 State 的职责边界
  - title: HTML Standard Form Data Entry List
    url: https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-the-form-data-set
    sourceType: specification
    appliesTo: Living Standard
    claims:
      - 表单成功控件与 FormData 条目构造规则
  - title: XMLHttpRequest Standard FormData
    url: https://xhr.spec.whatwg.org/#interface-formdata
    sourceType: specification
    appliesTo: Living Standard
    claims:
      - FormData get 与 getAll 的返回合同
  - title: WAI-ARIA status role
    url: https://www.w3.org/TR/wai-aria-1.2/#status
    sourceType: specification
    appliesTo: WAI-ARIA 1.2
    claims:
      - 动态结果状态的 polite live region 语义
---

# useActionState 与 Action 结果

## 一、学习目标

- 正确声明 `useActionState` 的 Action、初始 State 与返回三元组。
- 使用 `previousState` 串联顺序执行的 Action，并区分它与闭包 State。
- 通过 `<form action>`、Action prop 或 `startTransition` 正确派发返回 `void` 的 Action。
- 为普通 payload、可辨识 payload 与 `FormData` 建立明确的类型合同。
- 使用可辨识联合建模成功、校验失败等业务结果，把未知异常交给 Error Boundary。
- 准确解释 `isPending` 及 Action 结果 State 与其他状态工具的职责边界。

## 二、Action 结果 State

界面经常需要同时执行副作用并显示副作用的结果，例如保存设置后显示新版本号、提交审核后显示校验
消息、修改数量后显示服务端确认值。`useActionState` 把这类结果接入 React State：Action 可以执行同步
或异步副作用，返回值成为下一份 State，后续 Action 再以该结果为输入。

```tsx
type SaveState = {
  revision: number
  message: string
}

const initialState: SaveState = {
  revision: 0,
  message: '尚未保存',
}

async function saveAction(previousState: SaveState, title: string): Promise<SaveState> {
  await saveTitle(title)
  return {
    revision: previousState.revision + 1,
    message: `已保存：${title}`,
  }
}

function Editor() {
  const [state, dispatchAction, isPending] = useActionState(saveAction, initialState)
  // 使用 state、dispatchAction 和 isPending 渲染界面
}
```

这里的 State 描述“Action 已返回什么结果”，不是输入框是否聚焦、弹窗是否展开等普通 UI 状态。把
Action 结果单独建模，可以避免事件处理器、请求回调和界面各维护一份互相可能失同步的数据。

## 三、API 与返回三元组

```tsx
const [state, dispatchAction, isPending] = useActionState(
  reducerAction,
  initialState,
  permalink,
)
```

三个参数分别承担以下职责：

| 参数 | 含义 |
| --- | --- |
| `reducerAction` | 接收前次结果与本次 payload，执行副作用并返回下一 State |
| `initialState` | 首次渲染使用的 State，也是第一项 Action 收到的 `previousState` |
| `permalink` | 可选的渐进增强 URL，只在特定 Server Function 与水合前提交场景使用 |

返回数组固定包含三个值：

| 返回值 | 含义 |
| --- | --- |
| `state` | 当前已提交的 Action 结果；首次渲染等于 `initialState` |
| `dispatchAction` | 派发 payload 的稳定函数，返回 `void` |
| `isPending` | 当前 Hook 是否仍有已派发 Action 等待完成 |

`useActionState` 是 Hook，必须在函数组件或自定义 Hook 的顶层调用。不能在条件分支、循环、
`try/catch/finally`、事件处理器、Action 函数或普通工具函数中调用。

```tsx
function SavePanel({ enabled }: { enabled: boolean }) {
  // 正确：每次渲染都以相同顺序调用 Hook
  const [state, dispatchAction, isPending] = useActionState(saveAction, initialState)

  if (!enabled) return <p>保存功能未启用</p>
  return <SaveForm state={state} action={dispatchAction} pending={isPending} />
}
```

## 四、TypeScript 类型合同

React 19.2 的类型定义提供无 payload 与有 payload 两种重载。简化后可写成：

```ts
function useActionState<State>(
  action: (state: Awaited<State>) => State | Promise<State>,
  initialState: Awaited<State>,
): [Awaited<State>, () => void, boolean]

function useActionState<State, Payload>(
  action: (state: Awaited<State>, payload: Payload) => State | Promise<State>,
  initialState: Awaited<State>,
): [Awaited<State>, (payload: Payload) => void, boolean]
```

由此可以直接得到四个结论：

1. `previousState`、`initialState` 与 Action 的最终返回值必须属于同一个 State 合同。
2. 有 payload 时，`dispatchAction` 必须接收同一种 Payload；无 payload 时调用 `dispatchAction()`。
3. Action 可以同步返回 State，也可以返回 `Promise<State>`。
4. `dispatchAction` 的返回类型始终是 `void`，不能通过 `await` 获得 Action 结果。

复杂 State 建议显式标注类型，避免字符串字面量被扩大后丢失可辨识联合：

```tsx
type ResultState =
  | { status: 'idle'; revision: number; message: string }
  | { status: 'success'; revision: number; message: string }
  | { status: 'invalid'; revision: number; message: string }

const initialResult: ResultState = {
  status: 'idle',
  revision: 0,
  message: '等待提交',
}

async function submitAction(
  previousState: ResultState,
  payload: FormData,
): Promise<ResultState> {
  // 返回值始终满足 ResultState
  return previousState
}
```

## 五、initialState 的边界

首次渲染时，`state` 与第一项 Action 的 `previousState` 都来自 `initialState`。第一次
`dispatchAction` 被调用后，React 使用 Action 返回值推进 State，并忽略后续渲染传入的
`initialState` 参数。它不是每次渲染都执行的“重置值”。

```tsx
function Counter({ initialCount }: { initialCount: number }) {
  const [count, dispatchIncrement] = useActionState(
    (previousCount: number) => previousCount + 1,
    initialCount,
  )

  return (
    <form action={dispatchIncrement}>
      <button type="submit">{count}</button>
    </form>
  )
}
```

如果组件接收到新的 `initialCount`，已经派发过 Action 的实例不会自动回到新值。需要重置时有两种明确
做法：

- 为 Action 设计 `RESET` payload，并返回定义好的初始 State。
- 改变拥有 `useActionState` 的组件 `key`，让 React 重挂载该实例。

第一种做法保留组件实例并让重置也进入 Action 队列；第二种做法重建组件及其子树中的全部本地 State。
二者影响范围不同，不能互换描述。

## 六、Action 签名与 previousState

Action 的固定签名是：

```ts
function reducerAction(previousState, actionPayload) {
  return nextState
}
```

第一项 Action 收到 `initialState`。每当一项 Action 成功返回，返回值成为队列的最新结果；下一项
Action 再收到该结果。因此，`previousState` 表示“该项 Action 开始执行时，队列中前一项已经产生的
结果”，不是调用 `dispatchAction` 时某次渲染里的 State 快照。

```tsx
type RevisionState = {
  revision: number
  history: readonly string[]
}

async function publishAction(
  previousState: RevisionState,
  documentId: string,
): Promise<RevisionState> {
  await publishDocument(documentId)
  const nextRevision = previousState.revision + 1

  return {
    revision: nextRevision,
    history: [...previousState.history, `${previousState.revision} -> ${nextRevision}`],
  }
}
```

`previousState` 只对 Action 结果链有特殊含义。Action 闭包中的 Props、普通 State 和局部变量仍遵守
JavaScript 闭包与 React 渲染快照规则。队列不会自动把所有闭包值替换为最新值。

## 七、payload 的设计

Payload 是调用 `dispatchAction(payload)` 时传入的第二类信息。它可以是字符串、数字、对象、
`FormData` 或其他符合运行环境的数据。Action 只有一种操作时可以直接传业务值：

```tsx
const [count, changeQuantity] = useActionState(
  async (previousCount: number, delta: number) => {
    return await updateQuantity(previousCount, delta)
  },
  0,
)

startTransition(() => {
  changeQuantity(1)
})
```

同一个 Action 需要处理多种操作时，使用带 `type` 的可辨识联合比位置参数更清晰：

```tsx
type CartPayload =
  | { type: 'add'; quantity: number }
  | { type: 'remove'; quantity: number }
  | { type: 'reset' }

async function updateCart(previousCount: number, payload: CartPayload): Promise<number> {
  switch (payload.type) {
    case 'add':
      return await saveCount(previousCount + payload.quantity)
    case 'remove':
      return await saveCount(Math.max(0, previousCount - payload.quantity))
    case 'reset':
      return await saveCount(0)
  }
}
```

Payload 描述“本次要做什么”，State 描述“前面的 Action 已经得到什么结果”。不要把整份当前 State 再
复制进 payload，否则调用方和队列会同时拥有两份前次结果来源。

## 八、dispatchAction 的 Action 上下文

`dispatchAction` 必须从 Action 上下文调用。常见入口有两种。

### 1. Action prop

把 `dispatchAction` 交给真正实现 Action prop 协议的入口，调用方会建立 Transition 上下文：

```tsx
<form action={dispatchAction}>
  <input name="title" />
  <button type="submit">保存</button>
</form>
```

表单提交不需要额外调用 `startTransition`，也不需要手动 `preventDefault()`。

自定义组件的 prop 即使命名为 `action`，也不会自动获得这项能力。组件实现必须在内部通过 Transition
调用传入函数；原生表单的 function `action` 已由 React DOM 实现该合同。

### 2. startTransition

普通点击处理器中手动派发时，用 `startTransition` 包裹派发调用：

```tsx
function handleArchive() {
  startTransition(() => {
    dispatchAction({ type: 'archive', documentId })
  })
}
```

直接在事件处理器中调用异步 `dispatchAction` 会在开发模式报错，`isPending` 也不能正确反映这次工作：

```tsx
function handleArchive() {
  // 错误：缺少 Action 上下文
  dispatchAction({ type: 'archive', documentId })
}
```

也不能在 render 期间派发。render 调用会触发更新，更新再次 render，再次派发，React 会以
“Cannot update action state while rendering”阻止这种循环。

`dispatchAction` 的函数身份稳定，可以安全地作为 prop 传递。若依赖检查器允许省略它，Effect 依赖中
通常不需要添加；即使添加，也不会仅因组件重渲染而触发 Effect。

JavaScript 语法允许 `await` 一个 `void` 值，但它只会立即得到 `undefined`，不会等待 Action 队列完成。
等待状态必须读取 `isPending`，最终结果必须读取后续渲染的 `state`。

## 九、同步与异步返回值

Action 可以同步执行：

```tsx
function selectAction(previousState: SelectionState, itemId: string): SelectionState {
  return {
    ...previousState,
    selectedId: itemId,
  }
}
```

也可以执行异步副作用：

```tsx
async function saveAction(
  previousState: SaveState,
  payload: SavePayload,
): Promise<SaveState> {
  const saved = await saveDocument(payload)
  return {
    revision: previousState.revision + 1,
    message: `已保存 ${saved.title}`,
  }
}
```

同步返回值与 Promise fulfillment value 都会成为下一 State。Promise rejection 或同步 `throw` 属于
异常路径，不会成为普通结果 State。

Action 允许副作用，因此 React 不会像纯 reducer 那样在 Strict Mode 中为了发现不纯逻辑而把 Action
函数额外调用两次。它仍可能因为用户重复操作、重试机制或应用逻辑被多次派发；副作用的幂等性应由业务
协议决定，不能依赖开发模式行为。

如果 Action 在 `await` 之后还要直接调用普通 State setter，并且希望该更新也属于 Transition，需要再用
`startTransition` 包裹该 setter。Action 自己最终返回的 State 不需要额外包装：

```tsx
async function saveAction(previousState: SaveState, payload: SavePayload) {
  const result = await saveDocument(payload)

  startTransition(() => {
    setLastSavedAt(result.savedAt)
  })

  return {
    revision: previousState.revision + 1,
    message: result.message,
  }
}
```

若额外 State 只是 Action 结果的一部分，直接放进返回对象通常更简单，也能避免两个状态源。

## 十、顺序队列

对同一个 `useActionState` 实例连续调用 `dispatchAction` 时，React 会把这些调用排入同一队列并顺序
执行。后一项必须等待前一项产生结果，因为它需要把该结果作为自己的 `previousState`。

```tsx
startTransition(() => {
  dispatchAction({ type: 'append', text: 'A' })
  dispatchAction({ type: 'append', text: 'B' })
  dispatchAction({ type: 'append', text: 'C' })
})
```

如果初始结果为 `[]`，三项 Action 的输入输出关系是：

| 队列项 | previousState | payload | 返回结果 |
| --- | --- | --- | --- |
| 1 | `[]` | `A` | `[A]` |
| 2 | `[A]` | `B` | `[A, B]` |
| 3 | `[A, B]` | `C` | `[A, B, C]` |

顺序队列能防止“后完成的旧请求覆盖先完成的新请求”，但也意味着每项都等待前一项，三次各耗时一秒的
Action 总体可能接近三秒。需要彼此独立、可以并行完成的操作时，`useActionState` 不是合适的队列模型；
可以使用独立 State 配合 Transition，并自行定义并发、取消与结果合并规则。

多个进行中的 Action 可能被 React 批在一起，界面不应依赖每个中间结果都单独提交一次渲染。可靠合同是
“执行顺序和 `previousState` 链正确”，不是“用户必定逐帧看到每个中间 State”。

## 十一、isPending 的准确语义

`isPending` 表示该 Hook 是否仍有已派发 Action 等待完成。它适合：

- 显示“正在保存”“正在审核”等等待文案。
- 禁用确实不能重复执行的入口。
- 为结果区域添加 `aria-busy` 或保持已有状态消息。

它不能表达：

- 队列里有几项。
- 哪一个 payload 正在执行。
- 网络请求是否成功。
- 数据库事务是否提交。
- 当前 State 是成功结果还是校验失败结果。
- 某个普通表单之外的所有 Action 是否都在等待。

```tsx
const [state, dispatchAction, isPending] = useActionState(saveAction, initialState)

return (
  <section aria-busy={isPending}>
    <form action={dispatchAction}>
      <button type="submit" disabled={isPending}>
        {isPending ? '保存中' : '保存'}
      </button>
    </form>
    <p role="status" aria-live="polite">
      {state.message}
    </p>
  </section>
)
```

同步 Action 可能完成得非常快，pending 状态未必能被人眼观察到。不要添加固定 timer 来制造“看得见的
pending”并把它误写成 API 行为。需要确定性教学或测试时，可以用可手动继续的 Promise；生产代码应
等待真实副作用。

禁用入口是业务选择，不是 `isPending` 的强制用法。需要允许继续排队时可以保留按钮可用，同时提供独立
队列日志；需要防止重复付款等操作时则应禁用入口，并在服务端继续保证幂等。

## 十二、FormData 作为 payload

把 `dispatchAction` 传给 `<form action>` 后，React 自动在 Transition 中提交，并把本次表单的
`FormData` 作为第二个参数。由于第一个参数已经是 `previousState`，表单数据不能再按普通 function
Action 的单参数签名读取。

```tsx
type ProfileState = {
  status: 'idle' | 'success' | 'invalid'
  message: string
}

async function updateProfile(
  previousState: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const displayName = String(formData.get('displayName') ?? '').trim()
  const intent = String(formData.get('intent') ?? '')

  if (!displayName) {
    return {
      status: 'invalid',
      message: '显示名称不能为空',
    }
  }

  await saveProfile({ displayName, intent })
  return {
    status: 'success',
    message: `已保存 ${displayName}`,
  }
}

function ProfileForm() {
  const [state, formAction, isPending] = useActionState(updateProfile, {
    status: 'idle',
    message: '等待提交',
  } satisfies ProfileState)

  return (
    <form action={formAction}>
      <input name="displayName" />
      <button type="submit" name="intent" value="draft" disabled={isPending}>
        保存草稿
      </button>
      <button type="submit" name="intent" value="publish" disabled={isPending}>
        发布
      </button>
      <p role="status">{state.message}</p>
    </form>
  )
}
```

表单 payload 只包含成功控件。读取时要注意：

- 控件必须有 `name` 才能形成对应字段。
- 被点击的提交按钮可以通过 `name` 与 `value` 提供本次意图。
- `FormData.get(name)` 返回第一个匹配值，缺失时返回 `null`。
- 同名复选框、多选项等应使用 `FormData.getAll(name)`。
- 字段值可能是字符串或 `File`，不能无条件断言为字符串。

function Action 正常完成后，React 会重置表单中的未受控字段。Action 返回“校验失败”对象仍然属于正常
fulfilled 结果；如果界面需要保留和精确控制输入，应明确使用受控 State，或设计符合交互要求的表单结构。
不能把 Action 结果 State 当作输入值所有者。

## 十三、业务失败与异常

可预期业务失败应作为 State 返回。例如库存不足、字段校验失败、权限规则不满足都需要在当前界面可恢复
地显示，并允许用户修改后再次派发：

```tsx
type OrderState = {
  status: 'idle' | 'success' | 'invalid'
  orderId: string | null
  message: string
}

async function createOrder(
  previousState: OrderState,
  payload: OrderPayload,
): Promise<OrderState> {
  const result = await submitOrder(payload)

  if (!result.ok) {
    return {
      ...previousState,
      status: 'invalid',
      message: result.message,
    }
  }

  return {
    status: 'success',
    orderId: result.orderId,
    message: '订单已创建',
  }
}
```

未知异常、程序错误或无法在当前界面恢复的失败应抛出：

```tsx
async function createOrder(previousState: OrderState, payload: OrderPayload) {
  const response = await submitOrder(payload)

  if (response.status === 400) {
    return { ...previousState, status: 'invalid', message: '订单内容无效' }
  }

  if (!response.ok) {
    throw new Error(`订单服务失败：${response.status}`)
  }

  return { status: 'success', orderId: response.orderId, message: '订单已创建' }
}
```

Action 抛错时，React 取消该 Hook 中尚未执行的排队 Action，并由最近的 Error Boundary 处理错误。因而
不能假设抛错项后面的 payload 仍会执行。若错误属于可恢复业务结果，应在 Action 中识别它并返回
`status: 'invalid'` 等结果；不要用异常模拟普通校验分支。

反过来也不要捕获所有异常并一律转换为“提交失败”。这样会把空引用、错误数据结构等程序缺陷伪装成业务
消息。捕获范围应与可识别、可恢复的失败类型一致。

## 十四、previousState 与闭包 State

下面的写法混合了两个不同的数据来源：

```tsx
const [revision, setRevision] = useState(0)

const [result, dispatchAction] = useActionState(async (_previousResult, payload: Payload) => {
  const saved = await saveRevision(revision + 1, payload)
  return saved
}, initialResult)
```

`revision` 来自创建这次 Action 函数的 render 快照。连续排队时，它不会因为前一项 Action 返回了新结果
而自动变成新的队列 State。若每项必须基于前一项结果递增，应把 revision 放进 Action State 并读取
`previousState.revision`：

```tsx
const [result, dispatchAction] = useActionState(
  async (previousResult: ResultState, payload: Payload) => {
    const nextRevision = previousResult.revision + 1
    const saved = await saveRevision(nextRevision, payload)
    return {
      ...saved,
      revision: nextRevision,
    }
  },
  initialResult,
)
```

这不是“闭包永远过期”，而是明确数据职责：

- 每项必须继承的 Action 结果使用 `previousState`。
- 本次用户意图使用 payload。
- 组件配置、服务对象等普通值仍可通过闭包读取，但要按 React 渲染快照理解。
- 普通 UI 交互状态继续使用 `useState` 或 `useReducer`。

## 十五、State 结构与不可变更新

Action 返回值会成为下一项的完整 `previousState`，所以 State 结构应包含后续计算真正需要的字段。常见
字段包括：

- `status`：`idle`、`success`、`invalid` 等可辨识状态。
- 业务结果：版本号、记录 ID、已确认数量。
- 可恢复消息：字段错误、操作说明。
- 需要串联的历史：按不可变方式追加的结果摘要。

不要直接修改 `previousState`：

```tsx
async function action(previousState: ResultState, payload: Payload) {
  // 错误：修改旧对象和旧数组
  previousState.history.push(payload.label)
  previousState.revision += 1
  return previousState
}
```

应创建新对象和新数组：

```tsx
async function action(previousState: ResultState, payload: Payload): Promise<ResultState> {
  return {
    ...previousState,
    revision: previousState.revision + 1,
    history: [...previousState.history, payload.label],
  }
}
```

虽然 Action 可以执行副作用，但 State 仍应遵守不可变更新约定。新引用让 React、调试工具和后续队列项
都能清楚区分前次结果与下一结果。

## 十六、与其他状态职责的区别

| 需求 | 合适工具 | 原因 |
| --- | --- | --- |
| 根据前一 Action 结果顺序执行副作用 | `useActionState` | Action 可异步、有副作用，并自动串联结果 |
| 管理纯 UI 状态转换 | `useReducer` | reducer 应保持纯函数，适合复杂本地状态 |
| 管理少量独立 UI 值 | `useState` | 不需要 Action 队列与结果串联 |
| 显示所属表单的提交数据与 pending | 表单状态 Hook | 观察 form 提交上下文，不拥有 Action 返回值 |
| 在 Action 完成前显示临时预测值 | 乐观 State | 表达尚未确认的临时界面，不替代最终结果 State |
| 并行执行彼此独立的异步操作 | 独立 State 与 Transition | 不受 previousState 顺序依赖约束 |

选择的关键不是 API 名称，而是问题是否满足两个条件：需要执行 Action 副作用，并且下一项需要前一项的
结果。只满足其中一个条件时，通常有更直接的状态工具。

## 十七、取消与重置

`useActionState` 没有“删除队列中某一项”的内置函数。需要取消底层异步工作时，可以把
`AbortSignal` 放进 payload，并让实际请求或异步工作响应取消：

```tsx
type SearchPayload = {
  query: string
  signal: AbortSignal
}

async function searchAction(previousState: SearchState, payload: SearchPayload) {
  try {
    const items = await search(payload.query, { signal: payload.signal })
    return { status: 'success', items, message: '' }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return previousState
    }
    throw error
  }
}
```

取消请求不等于从 React 队列中任意移除节点。Action 仍需完成为返回 State 或抛出异常；应用必须定义取消
后保留前次结果、返回取消状态还是让异常上抛。

重置结果也没有专用 setter。可以派发明确的 `RESET` payload，或通过 `key` 重挂载。若通过
`<form action>` 正常提交，表单未受控字段的自动 reset 与 Action State 重置是两件不同的事：前者重置
DOM 字段，后者必须由 Action 返回值或组件身份变化决定。

## 十八、渐进增强参数

第三个 `permalink` 参数服务于 React Server Components 与 Server Function 的渐进增强场景。JavaScript
尚未加载时，浏览器可以导航到该唯一 URL；目标页面必须渲染相同的表单组件、相同 Action 与相同
permalink，React 才能传递结果。页面完成交互化后，该参数不再影响客户端派发。

纯客户端 SPA 不需要为了“参数完整”而随意填写 permalink。它不是请求地址、路由跳转配置或队列名称。
使用 Server Function 时，`initialState` 与 payload 还要满足服务端边界的可序列化要求；普通客户端
Action 不应借此宣称服务端或水合能力。

## 十九、可访问反馈

Action 界面至少要让等待状态和结果状态可感知：

```tsx
<form action={dispatchAction} aria-busy={isPending}>
  <button type="submit" disabled={isPending}>
    {isPending ? '保存中' : '保存'}
  </button>
  <p role="status" aria-atomic="true">
    {state.message}
  </p>
</form>
```

- 按钮文案直接说明当前动作，不只依赖颜色或旋转图标。
- `disabled` 控制是否允许重复操作；只有业务确实不允许时才禁用。
- `role="status"` 让结果在合适时机被辅助技术播报。
- `aria-busy` 表达区域仍在更新，不等同于业务成功或失败。
- 校验失败应把字段与错误消息关联，并用 `aria-invalid` 标明字段状态。

## 二十、结果队列 Demo

:::demo{id="react.core.learn.advanced.use-action-state-result-queue.result-queue-demo"}
:::

Demo 使用可手动继续的本地 Promise，不依赖网络、timer 或随机数。可以观察三条独立事实：

1. 点击“连续排队两项”后，第一项立即开始，第二项等待前次结果。
2. 继续第一项后，第二项开始；最终历史为 `0 -> 1`、`1 -> 2`。
3. 清空受控备注后提交并继续 Action，会得到 `invalid` 业务结果，而不是 Error Boundary 异常。

`isPending` 只显示 React 提供的聚合等待布尔值，不能据此推断队列长度或某次请求的身份。

队列处理中间的 `state.revision` 是否逐项出现在可见渲染中不是依赖目标。应核对的是最终 revision、历史
顺序、最后 payload 和 pending 最终回到 idle。

## 二十一、易错使用提示

:::pitfalls
### 错误一：在条件分支中调用 useActionState

**触发条件：** 只在 `enabled` 为 `true` 时创建 Action State。

**原因：** Hook 必须在组件顶层以固定顺序调用。

**后果：** 不同 render 的 Hook 顺序变化，React 无法匹配 State。

**错误示例：**

```tsx
if (enabled) {
  const [state, dispatchAction] = useActionState(action, initialState)
}
```

**正确写法：**

```tsx
const [state, dispatchAction] = useActionState(action, initialState)
if (!enabled) return null
```

**验证方式：** 切换 `enabled` 时无 Hook 顺序错误，原有 Action State 按组件身份保留。

### 错误二：颠倒 previousState 与 payload

**触发条件：** 把 `FormData` 写成第一个参数，把旧 State 写成第二个参数。

**原因：** `useActionState` 固定在原 Action 参数前增加 `previousState`。

**后果：** `formData.get()` 或 State 字段读取作用在错误对象上。

**错误示例：**

```tsx
async function action(formData: FormData, previousState: ResultState) {
  return { ...previousState, message: String(formData.get('message') ?? '') }
}
```

**正确写法：**

```tsx
async function action(previousState: ResultState, formData: FormData) {
  return { ...previousState, message: String(formData.get('message') ?? '') }
}
```

**验证方式：** 第一项读取 `initialState`，表单字段从第二个参数读取。

### 错误三：等待 dispatchAction 的返回值

**触发条件：** 写成 `const result = await dispatchAction(payload)`。

**原因：** dispatch 函数返回 `void`，只负责派发。

**后果：** `result` 不是 Action 返回值，代码容易再维护一份重复 State。

**错误示例：**

```tsx
const result = await dispatchAction(payload)
setResult(result)
```

**正确写法：**

```tsx
startTransition(() => {
  dispatchAction(payload)
})
// 后续 render 直接读取 useActionState 返回的 state
```

**验证方式：** 事件处理器不复制结果，界面只从 `state` 渲染 Action 返回值。

### 错误四：在 Action 上下文之外手动派发

**触发条件：** 普通 `onClick` 直接调用异步 `dispatchAction`。

**原因：** 手动派发必须位于 `startTransition` 或 Action prop 提供的上下文。

**后果：** 开发模式报错，`isPending` 不能正确追踪这次 Action。

**错误示例：**

```tsx
function handleClick() {
  dispatchAction(payload)
}
```

**正确写法：**

```tsx
function handleClick() {
  startTransition(() => {
    dispatchAction(payload)
  })
}
```

**验证方式：** Action 等待期间 `isPending` 为 `true`，console 无“outside of a transition”错误。

### 错误五：使用闭包 State 代替 previousState

**触发条件：** Action 用 render 中的 `revision` 递增，而忽略第一个参数。

**原因：** 闭包值属于某次 render 快照，不是队列前一项的返回结果。

**后果：** 连续排队时多项可能从同一旧版本计算，丢失累积结果。

**错误示例：**

```tsx
async function action(_previousState: ResultState, payload: Payload) {
  return { revision: revision + 1, message: payload.message }
}
```

**正确写法：**

```tsx
async function action(previousState: ResultState, payload: Payload) {
  return { revision: previousState.revision + 1, message: payload.message }
}
```

**验证方式：** 连续两项从 `0 -> 1`、`1 -> 2`，不存在两个 `0 -> 1`。

### 错误六：把 isPending 当作队列计数或成功标志

**触发条件：** 用 `isPending ? 1 : 0` 表示排队数，或用 `!isPending` 表示保存成功。

**原因：** `isPending` 只是聚合等待布尔值。

**后果：** 多项队列、业务失败或异常时显示错误结论。

**错误示例：**

```tsx
const queuedCount = isPending ? 1 : 0
const succeeded = !isPending
```

**正确写法：**

```tsx
const succeeded = state.status === 'success'
const queuedCount = queueLedger.length
```

**验证方式：** 业务失败完成后 `isPending` 为 `false`，但 `state.status` 仍明确为 `invalid`。

### 错误七：把可预期业务失败全部抛出

**触发条件：** 字段为空、库存不足等可恢复结果也 `throw new Error()`。

**原因：** 异常会取消后续队列并进入 Error Boundary，不适合普通表单反馈。

**后果：** 用户无法在当前结果界面修改输入并继续，后续排队 Action 被跳过。

**错误示例：**

```tsx
if (!payload.title) {
  throw new Error('标题不能为空')
}
```

**正确写法：**

```tsx
if (!payload.title) {
  return { ...previousState, status: 'invalid', message: '标题不能为空' }
}
```

**验证方式：** 校验失败渲染为普通结果，组件仍可再次派发；未知异常才进入 Error Boundary。

### 错误八：直接修改 previousState

**触发条件：** 对旧对象赋值或向旧数组 `push` 后返回同一引用。

**原因：** Action State 仍需遵守不可变更新，前次与下一结果应可区分。

**后果：** 历史快照被改写，调试和队列推导失去可靠依据。

**错误示例：**

```tsx
previousState.history.push(payload.label)
return previousState
```

**正确写法：**

```tsx
return {
  ...previousState,
  history: [...previousState.history, payload.label],
}
```

**验证方式：** 每次 Action 返回新对象，旧历史数组内容保持不变。

### 错误九：假设每个中间结果都单独可见

**触发条件：** 业务逻辑要求队列每完成一项，DOM 必须先显示该项 State 才能继续下一项。

**原因：** React 可以批处理多个进行中的 Action；公开合同保证顺序与结果链，不保证逐项可见提交。

**后果：** 不同调度条件下界面流程失效，测试依赖偶然的渲染时机。

**错误示例：**

```tsx
// 假设第二项开始前，DOM 中一定已经显示第一项 revision
if (document.querySelector('[data-revision]')?.textContent !== '1') {
  throw new Error('中间版本没有先显示')
}
```

**正确写法：** 让下一项只依赖 `previousState`，界面最终核对完整历史与最终结果。

```tsx
return {
  revision: previousState.revision + 1,
  history: [...previousState.history, previousState.revision],
}
```

**验证方式：** 不读取 DOM 决定 Action 计算；两项完成后结果链仍为 `0 -> 1 -> 2`。

### 错误十：把表单 reset 当作 Action State reset

**触发条件：** 认为 function Action 成功后清空未受控字段，也会把 `state` 恢复为 `initialState`。

**原因：** 表单 DOM 字段和 Action 结果 State 由不同机制管理。

**后果：** 界面仍显示旧结果，应用却以为结果已清除。

**错误示例：**

```tsx
formRef.current?.reset()
// 错误假设：state 已恢复为 initialState
```

**正确写法：** 为结果 State 派发明确 reset payload，或重挂载拥有 Hook 的组件。

```tsx
startTransition(() => {
  dispatchAction({ type: 'reset' })
})
```

**验证方式：** 分别检查表单字段和 Action State，确认二者按各自合同变化。
:::

## 二十二、源码推导与适用场景

React `19.2.8` 的实现会为同一个 `useActionState` 实例维护 Action 队列。当前项完成后，其返回值先成为
队列 State，再作为下一项的 `previousState`；当前项抛出异常时，剩余排队项不会继续执行。官方文档
把顺序执行、前次结果传递和错误取消作为可依赖行为，源码中的队列节点名称与调度字段只是当前版本的
实现证据，不是应用应读取或模仿的公共 API。

由此可以推导：当后一次操作必须基于前一次确认结果计算时，`useActionState` 能直接表达依赖关系；当
多项工作彼此独立并要求并行完成时，顺序队列反而会增加总等待时间，应改用独立 State 和明确的结果
合并策略。界面只应依赖最终 State、Action 顺序和 `isPending` 的布尔合同，不应依赖每个中间结果都
单独提交一次可见渲染。

可预期的校验失败适合返回可辨识 State，因为调用方仍需要继续显示结果并允许后续操作。无法在当前
界面恢复的异常适合抛出并交给 Error Boundary。涉及服务端提交与渐进增强时还需遵守 Server Function
和可序列化边界；纯客户端 Action 不应据此宣称具备服务端持久化、取消或并行调度能力。

## 二十三、练习

:::exercise
### 练习一：推导三项 Action 的结果链

**要求：** 初始 revision 为 `2`，连续派发 payload `A`、`B`、`C`。每项返回
`previousState.revision + 1`，并把 payload 写入历史。写出每项的 `previousState`、payload 与返回值。

**验收：** 三项按顺序得到 `2 -> 3`、`3 -> 4`、`4 -> 5`；能说明总耗时受顺序等待影响，最终历史顺序
为 `A、B、C`。
:::

:::exercise
### 练习二：设计可辨识结果 State

**要求：** 为“保存个人资料”设计 `idle`、`success`、`invalid` 三种结果。校验失败保留前次 revision，
成功时 revision 加一；未知错误继续抛出。

**验收：** TypeScript `switch` 可以穷尽 `status`；校验失败是 fulfilled State，不依赖 `isPending` 判断；
异常路径不伪装成业务消息。
:::

:::exercise
### 练习三：修复手动 dispatch

**要求：** 找出普通 `onClick` 中直接调用 `dispatchAction(payload)` 的问题，并改成正确 Action 上下文。

**验收：** 使用 `startTransition` 包裹派发；pending 期间显示明确文案；console 不出现 transition 上下文
错误；事件处理器不尝试读取 dispatch 返回值。
:::

:::exercise
### 练习四：验证 FormData 与结果重置

**要求：** 创建包含文本框和两个具名提交按钮的表单。分别提交两个按钮，读取 `FormData` 中的意图；再
实现一个 reset payload 清除 Action 结果。

**验收：** Action 第二个参数是 `FormData`；被点击按钮的 `name/value` 可读；表单未受控字段 reset 与
Action State reset 被分别验证，没有把二者混为一个行为。
:::

## 二十四、本节小结

- `useActionState` 用于管理 Action 的返回结果，返回 `[state, dispatchAction, isPending]`。
- `initialState` 只负责初始结果；第一次派发后，State 由 Action 返回值推进。
- Action 接收 `(previousState, payload)`，可以同步或异步执行副作用。
- `dispatchAction` 返回 `void`，必须通过 Action prop 或 `startTransition` 派发。
- 同一 Hook 的多个 Action 顺序执行，后一项接收前一项结果。
- `isPending` 是聚合等待布尔值，不是队列计数、请求身份或业务结果。
- 表单入口把 `FormData` 作为第二个参数，普通入口可以使用业务值或可辨识对象。
- 可预期失败返回结果 State；未知异常抛出后会取消后续队列并进入 Error Boundary。
- `previousState` 与普通闭包 State 不是同一来源，连续计算应使用前者。
- 表单字段 reset、Action State reset、乐观 State 与最终结果 State 各有独立职责。

## 二十五、参考资料

- [useActionState](https://react.dev/reference/react/useActionState) - 参数、类型、队列、错误、重置与排错。
- [form](https://react.dev/reference/react-dom/components/form) - function Action、FormData 与成功后 reset。
- [startTransition](https://react.dev/reference/react/startTransition) - 手动派发的 Action 上下文。
- [useReducer](https://react.dev/reference/react/useReducer) - 纯 UI reducer 的职责边界。
- [useOptimistic](https://react.dev/reference/react/useOptimistic) - 临时乐观值与最终结果 State 的边界。
- [HTML Standard](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-the-form-data-set) - 表单数据条目构造规则。
- [XMLHttpRequest Standard](https://xhr.spec.whatwg.org/#interface-formdata) - `FormData` 读取合同。
- [WAI-ARIA status](https://www.w3.org/TR/wai-aria-1.2/#status) - 动态状态反馈语义。
