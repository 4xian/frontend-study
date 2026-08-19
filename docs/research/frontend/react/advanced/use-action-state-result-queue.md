# `useActionState` 与 Action 结果队列研究记录

## 研究范围

本文以 React 官方文档 `19.2`、React `19.2.8` 官方源码与 npm 发布包、仓库安装的
`@types/react@19.2.18` 为依据，说明 `useActionState` 如何保存 Action 结果、传递 payload、串行执行
多次派发并暴露 pending 状态。

重点区分两类信息：

- **公共 API 合同**来自 React Reference、Rules of Hooks 和官方示例，应用代码可以据此设计；
- **版本实现旁证**来自 React `19.2.8` 源码和安装包，只用于解释该版本为何出现相应行为，不把队列节点、
  thenable 或内部 pending 更新方式写成应用可依赖的 API。

Server Function 的序列化、服务端渲染与 `permalink` 渐进增强不在本文展开。第三个 `permalink` 参数只需
知道：它面向 React Server Components 页面在 JavaScript 加载前的表单提交；页面可交互后不再起作用。

## 版本与一手来源

仓库快照固定为 `react@19.2.8`、`react-dom@19.2.8`、`@types/react@19.2.18` 和
`@types/react-dom@19.2.4`。`react@19.2.8` npm 元数据的 `gitHead` 是
`1dd4ecbdabf826f527fc9a58c05ea70375b7d170`，因此源码链接同时固定到该提交。

| 编号 | 一手来源 | 支撑的事实 |
| --- | --- | --- |
| S1 | [React `useActionState` Reference](https://react.dev/reference/react/useActionState) | 三元组、参数、同步或异步 Action、串行队列、Action 调用上下文、错误处理和职责边界。 |
| S2 | [固定的 `useActionState` 文档源码](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useActionState.md#L21-L107) | 固定公开文字；队列见 264-272 行，表单见 1031-1035 行，错误见 1197-1203 行和 1426-1432 行。 |
| S3 | [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks#only-call-hooks-at-the-top-level) | Hook 只能在函数组件或自定义 Hook 顶层调用。 |
| S4 | [State as a Snapshot](https://react.dev/learn/state-as-a-snapshot#rendering-takes-a-snapshot-in-time) | 每次 render 创建自己的 State、变量和函数快照，用于解释闭包值与 `previousState` 的区别。 |
| S5 | [React `<form>` Reference](https://react.dev/reference/react-dom/components/form) | 函数 `action` 接收提交的 `FormData`，在 Transition 中执行。 |
| S6 | [React `useTransition` Reference](https://react.dev/reference/react/useTransition) | Action、Transition、`startTransition`、通用 pending 状态和异步更新限制。 |
| S7 | [React `useFormStatus` Reference](https://react.dev/reference/react-dom/hooks/useFormStatus) | 最近父表单的 `pending`、`data`、`method`、`action` 状态及其作用域。 |
| S8 | [React `useOptimistic` Reference](https://react.dev/reference/react/useOptimistic) | Action 期间的临时乐观值、最终值与失败回退边界。 |
| S9 | [React `19.2.8` `ReactFiberHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L2041-L2512) | 派发返回 `void`、逐项执行、前次结果、同步/异步完成、错误取消和当前版本的 Action 函数捕获方式。 |
| S10 | [React `19.2.8` `FormActionEventPlugin.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/events/plugins/FormActionEventPlugin.js#L26-L175) | React DOM 构造 `FormData`、处理提交按钮并在 Host Transition 中调用函数 Action。 |
| S11 | `node_modules/@types/react/index.d.ts:1975` | 当前安装类型的两个 `useActionState` 重载，以及 dispatch 返回 `void`。 |
| S12 | `node_modules/react-dom/cjs/react-dom-client.development.js:8334` | 当前安装的 `react-dom@19.2.8` 开发包与 S9、S10 的行为相符。 |

## API 形状与 Hook 调用规则

### 固定三元组

`useActionState` 必须在函数组件或自定义 Hook 顶层调用，不能放在条件、循环、事件处理函数、嵌套函数或
`try` / `catch` / `finally` 中。返回数组恰好有三个位置，顺序不能交换：

```tsx
const [state, dispatchAction, isPending] = useActionState(reducerAction, initialState)
```

- `state`：当前 Action 结果；第一次 render 等于 `initialState`；
- `dispatchAction`：向该 Hook 的 Action 队列派发一个 payload；
- `isPending`：是否仍有属于该 Hook 的已派发 Action 处于 pending。

`dispatchAction` 的身份稳定。稳定的是派发函数，不代表传入 `useActionState` 的 `reducerAction` 闭包永远
读取最新 render 值。

### 当前 TypeScript 合同

仓库安装的 `@types/react@19.2.18` 有无 payload 和有 payload 两个重载。带 payload 的重载可简化为：

```ts
function useActionState<State, Payload>(
  action: (
    state: Awaited<State>,
    payload: Payload,
  ) => State | Promise<State>,
  initialState: Awaited<State>,
  permalink?: string,
): [
  state: Awaited<State>,
  dispatch: (payload: Payload) => void,
  isPending: boolean,
]
```

如果 Action 只需要 `previousState`，另一个重载会得到无参数的 `dispatch: () => void`。因此 payload
在概念上可以省略；一旦声明了 payload 类型，dispatch 就必须接收该类型。

`dispatchAction` 返回 `void`。下面两种理解都不成立：

```tsx
const result = dispatchAction(payload) // result 不是 Action 返回的新 State
await dispatchAction(payload) // 不会等待队列完成
```

JavaScript 允许 `await` 一个非 Promise 值，但那只会把 `undefined` 当作已完成值，不会把 dispatch 变成
队列完成句柄。结果通过后续 render 的 `state` 提供，进行中状态通过 `isPending` 提供。

## `reducerAction(previousState, payload)`

### 两个参数各自来自哪里

React 调用 `reducerAction` 时：

1. 第一个参数是该队列的前次成功结果 `previousState`；第一次调用使用 `initialState`；
2. 第二个参数是本次传给 `dispatchAction` 的 payload；它可以是字符串、对象、`FormData` 或其他应用值；
3. Action 的返回值成为新的结果 State，并作为下一项的 `previousState`。

```tsx
type Result = {
  revision: number
  message: string
  error: string | null
}

type Payload = {
  message: string
}

async function saveMessage(
  previousState: Result,
  payload: Payload,
): Promise<Result> {
  await save(payload.message)

  return {
    revision: previousState.revision + 1,
    message: payload.message,
    error: null,
  }
}
```

这不是 `useReducer` 的纯 reducer：官方允许它同步或异步执行副作用。名称中的“reducer”只表示它根据
前次结果计算下一结果。

### `initialState` 的边界

`initialState` 同时承担两个角色：第一次 render 的 `state`，以及第一次 Action 的 `previousState`。第一次
派发后，结果由 Action 返回值推进；官方明确此后忽略 `initialState` 参数。Action 返回类型必须与
`initialState` 的 State 类型一致。

`useActionState` 没有独立的 reset 函数。需要重置时，可以把“重置”设计成一种 payload 并返回初始结构，
或者通过组件 `key` 改变来重新挂载；不能反复传入一个新的 `initialState` 并假设它会覆盖现有结果。

### 同步与异步返回

以下两种返回都受支持：

```tsx
function increment(previousState: number, step: number): number {
  return previousState + step
}

async function saveName(
  previousState: Result,
  formData: FormData,
): Promise<Result> {
  const name = String(formData.get('name') ?? '')
  const savedName = await postName(name)
  return { ...previousState, message: savedName, error: null }
}
```

- 同步返回值立即成为该项的成功结果；
- Promise fulfillment value 成为该项的成功结果；
- 同步 `throw` 和 Promise rejection 都进入同一错误传播路径；
- `await` 数据后直接 `return nextState` 不需要额外的 `startTransition`；
- 只有 Action 在 `await` 之后另外调用普通 State setter 时，React 19.2 才要求再用
  `startTransition` 包住那个 setter。这是 Transition 标记的限制，不是 Action 返回结果的限制。

## 串行队列与前次结果

### 公共队列合同

同一个 Hook 的多次 `dispatchAction` 会按派发顺序排队并逐项执行。第一项可以开始执行；如果它返回尚未
settle 的 Promise，第二项必须等待，因为 React 只有拿到第一项结果后才能提供第二项的
`previousState`。

假设初始值为 `0`，连续派发 `1`、`2`、`3`，Action 执行 `previousState + payload`：

```text
第一项：previousState = 0，payload = 1，返回 1
第二项：previousState = 1，payload = 2，返回 3
第三项：previousState = 3，payload = 3，返回 6
```

这是 `useActionState` 与普通并行异步请求最关键的区别。后一项不是读取“派发时屏幕上显示的 State”，也
不是与前一项竞速完成，而是等待前一项结果再运行。

官方示例明确说明：连续点击四次且每项延迟一秒，会近似串行等待四秒。React 不默认取消较旧 Action，
因为取消网络请求不等于撤销已经发生的服务端写入。需要并行、取消、last-write-wins 或事务语义时，必须
由应用或数据层另外定义；不能从 `isPending` 推断这些能力。

### `isPending` 的精确含义

公开合同是“是否有属于这个 `useActionState` Hook 的已派发 Action 仍在 pending”。对同一队列的连续
派发，官方示例保持 pending，直到所有项目完成，再以最终结果重新 render。

因此 `isPending`：

- 是 Hook 级聚合布尔值，不是队列长度；
- 不指出当前运行的是哪一个 payload；
- 不提供进度百分比、请求 ID、取消句柄或持久化回执；
- 为 `false` 只表示 React 观察的 Action/Transition 工作已结束，不额外证明外部系统满足某个业务条件；
- 不保证每个中间成功结果都单独成为用户可见的一次 commit，应用只能依赖最终 `state` 和队列顺序合同；
- 多个 ongoing Actions 当前可能被 React 一起 batch，官方把这列为未来可能移除的限制。

`isPending` 正确更新依赖 Action 上下文。手工派发必须写在 `startTransition` 中：

```tsx
function handleIncrement() {
  startTransition(() => {
    dispatchAction(1)
  })
}
```

直接在普通点击处理函数中调用 dispatch 不符合公开用法。对于 async Action，React 19.2 开发构建会提示
它在 Transition 外调用，并明确警告 `isPending` 可能无法正确更新。不要把“当前实现仍调用了函数”当成
受支持合同。

### 与闭包快照的区别

每次 render 创建自己的 State 快照；在那次 render 中创建的函数会看到那次快照。于是下面的
`state.revision` 可能在排队等待期间变旧：

```tsx
const [state, dispatchAction] = useActionState(update, initialState)

async function update(previousState: Result, payload: Payload) {
  console.log(state.revision) // render 闭包快照，不是队列前值
  return {
    ...previousState,
    revision: previousState.revision + 1,
    message: payload.message,
  }
}
```

应使用 `previousState` 计算依赖前次 Action 结果的字段。它由 Action 队列在真正执行该项时提供，不是闭包
变量。

React `19.2.8` 源码进一步说明当前实现：每个队列节点保留“派发时的 Action 函数实现”，排队项稍后运行
时该函数可能已经 stale；源码明确称这是有意行为。这个捕获方式属于版本实现旁证，不应被提升成跨版本
API 保证。可以依赖的公共结论仍然是：render 闭包遵循 State 快照，`previousState` 遵循队列前次结果。

## 表单 Action 与 `FormData` payload

### React DOM 如何连接两层函数

普通函数传给 `<form action>` 时，React DOM 在 Transition 中调用它，并传入一个提交表单的
`FormData`。把 `useActionState` 返回的 dispatch 直接传给该 prop 时也是同一入口：

```tsx
async function submitProfile(
  previousState: Result,
  formData: FormData,
): Promise<Result> {
  const displayName = String(formData.get('displayName') ?? '')
  return saveProfile(previousState, displayName)
}

function ProfileForm() {
  const [result, formAction, isPending] = useActionState(
    submitProfile,
    initialResult,
  )

  return (
    <form action={formAction}>
      <input name="displayName" />
      <button type="submit" disabled={isPending}>保存</button>
      <p>{result.message}</p>
    </form>
  )
}
```

这里有两层调用，不能混为一谈：

1. React DOM 调用 `formAction(formData)`，只向 dispatch 传一个 `FormData` payload；
2. `useActionState` 再调用 `submitProfile(previousState, formData)`，补上队列的前次结果。

所以使用 `useActionState` 后，表单数据位于 reducer Action 的第二个参数，而不是第一个参数。React DOM
源码还表明它通过 `new FormData(form)` 构造数据，并处理触发提交的按钮；应用不应自己伪造第一个
`previousState` 参数。

`<form action={formAction}>` 和原生 `formAction` DOM prop 会自动在 Transition 中调用函数 Action，无需
再包一层 `startTransition`。手工按钮事件没有这个自动上下文，仍需显式 `startTransition`。对于自定义
组件，名字带 `Action` 只是约定；组件必须像官方 Action prop 模式那样在内部建立 Transition，不能仅凭
prop 名称获得该行为。

## 业务错误结果与异常传播

### 可预期业务失败应返回结果 State

库存不足、字段校验失败、名称已占用等可预期结果通常应成为 State 的一种形状：

```tsx
type SaveResult =
  | { ok: true; message: string }
  | { ok: false; message: string }

async function saveAction(
  previousState: SaveResult,
  formData: FormData,
): Promise<SaveResult> {
  const response = await save(formData)

  if (!response.ok) {
    return { ok: false, message: response.message }
  }

  return { ok: true, message: '保存成功' }
}
```

返回 `{ ok: false }` 对 JavaScript 和 React 而言仍是一次 fulfilled Action：对象成为新的 `state`，后续
队列项也会把它作为 `previousState`。React 不会根据字段名 `ok` 或 `error` 自动进入 Error Boundary。

### 未知异常会取消队列并交给 Error Boundary

如果 Action 同步抛错，或 async Action 返回的 Promise rejected，React 会：

1. 把当前项和随后排队项标记为失败并取消后续执行；
2. 从 `useActionState` 重新抛出错误；
3. 让最近的 Error Boundary 显示 fallback。

这是 `useActionState` 明确提供的错误传播路径，不代表 Error Boundary 会捕获任意事件处理函数或任意裸
Promise 的错误。若异常实际属于可恢复业务失败，应在 Action 内捕获并返回错误 State；若是未知程序错误，
让它抛出，避免后续 Action 基于不确定的前次结果继续运行。

错误后的公共保证是“已排队 Action 被取消并显示最近错误边界”。不要额外假设结果自动回滚到某个历史值、
外部副作用被撤销，或队列能从失败项之后自动续跑。

## 与相邻状态工具的职责边界

| 工具 | 主要职责 | 不提供的能力 |
| --- | --- | --- |
| 普通 `useState` / `useReducer` | 保存组件 UI State；`useReducer` reducer 必须纯。适合不需要按前次副作用结果串行推进的状态。 | 不自动建立 Action 上下文，不自动把异步副作用结果排成 `previousState` 队列。 |
| `useTransition` | 标记任意 State 更新为非阻塞 Transition，并提供该 Transition 的 pending 反馈。 | 不保存 Action 返回结果，也不提供 `useActionState` 的逐项结果累积器。普通 async Actions 的业务顺序仍需应用处理。 |
| `useActionState` | 保存 Action 的最终返回结果；允许副作用；同一 Hook 按顺序执行并把前次结果传给下一项。 | 不提供乐观临时值、表单上下文详情、请求取消、进度或事务回滚。 |
| `useFormStatus` | 在 `<form>` 后代中读取最近父表单的提交状态，以及正在提交的 `FormData`、method 和 action。 | 不保存 Action 返回结果；表单外或声明该表单的同一组件中不能用它观察该表单。 |
| `useOptimistic` | Action 进行中立即显示临时乐观值；Action 完成后与真实 `value` 汇合，失败时回到当前真实值。 | 不替代最终结果 State，也不提供顺序队列的 `previousState`。 |

几个常见组合不会改变各自职责：

- 表单可以用 `useActionState` 显示最终业务结果，同时由表单后代用 `useFormStatus` 读取本次提交数据；
- 慢 Action 可以用 `useOptimistic` 先显示临时值，再由 `useActionState.state` 承接最终结果；
- 手工事件用 `startTransition(() => dispatchAction(payload))` 只是建立 Action 上下文，结果仍由
  `useActionState` 管理；
- 需要 Action 并行时，官方建议直接组合普通 State 与 `useTransition`，不要假设
  `useActionState` 的顺序队列会自动变成并行。

## 可核验结论

1. `useActionState` 是 Hook，只能在函数组件或自定义 Hook 顶层调用。
2. 返回顺序固定为 `[state, dispatchAction, isPending]`。
3. Action 接收 `(previousState, payload)`；第一次的 `previousState` 是 `initialState`。
4. Action 可同步返回 State，也可异步返回 `Promise<State>`；返回类型必须与初始 State 匹配。
5. 当前安装类型把 dispatch 定义为返回 `void`，不能通过 `await dispatchAction()` 等待结果。
6. 同一 Hook 的派发严格按顺序执行，后一项接收前一项的成功结果。
7. `isPending` 表示该 Hook 是否仍有已派发 Action pending，不是请求、进度、队列长度或业务成功标志。
8. 表单 Action 自动提供 Transition，并把提交的 `FormData` 作为 dispatch payload；在 reducer Action 中
   它是第二个参数。
9. 手工 dispatch 必须放进 `startTransition` 或由真正实现 Action prop 协议的组件调用。
10. 可预期业务失败应返回结果 State；抛错或 Promise rejection 会取消排队项并传播到最近 Error Boundary。
11. 闭包读取的是所属 render 快照；依赖前次 Action 结果的计算必须使用 `previousState`。
12. 普通 State、Transition、表单状态、乐观状态和 Action 结果 State 解决的是不同问题，不能用一个
    pending 布尔值替代其余状态模型。
