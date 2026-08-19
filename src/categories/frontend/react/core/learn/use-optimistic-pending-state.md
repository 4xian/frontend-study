---
id: react.core.learn.advanced.use-optimistic-pending-state
type: lesson
title: useOptimistic 乐观状态
summary: 在 Action 等待期间派生临时 UI，并让成功结果由基础 State 承接、失败结果回到当前基础值。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 50
prerequisites:
  - react.core.learn.advanced.use-action-state-result-queue
related:
  - react.core.learn.advanced.use-transition-pending-action
tags:
  - React
  - useOptimistic
  - Optimistic UI
  - Action
  - State
appliesTo: React 19.2
verifiedAt: 2026-08-18
objectives:
  - 能区分基础 State、optimistic State 和最终确认结果的职责。
  - 能为 useOptimistic 选择 State 与 Action 类型，并编写纯 updateFn。
  - 能在 Action 中派发一个或多个临时输入，并解释它们的显示顺序。
  - 能在成功路径更新基础 State，在失败路径保留业务错误并回到当前基础值。
  - 能处理临时 ID、稳定 key、基础值变化和多个异步操作的边界。
  - 能根据是否需要 pending、队列结果或乐观视图选择相邻状态工具。
sources:
  - title: React useOptimistic Reference
    url: https://react.dev/reference/react/useOptimistic
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Hook 参数、返回值、Action 约束、纯 updateFn 与基础值回退
  - title: React 19 发布说明
    url: https://react.dev/blog/2024/12/05/react-19#new-hook-optimistic-updates
    sourceType: release-note
    appliesTo: React 19
    claims:
      - useOptimistic 用于在异步操作完成前显示临时 UI
  - title: React useTransition Reference
    url: https://react.dev/reference/react/useTransition
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Action、异步 Action 与 await 后 State 更新的 Transition 边界
  - title: React 19.2.8 useOptimistic 实现
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - passthrough 基础值、optimistic 更新队列、重放与 Action 外调用提示
  - title: React 19.2.8 异步 Action 测试
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactAsyncActions-test.js
    sourceType: official-test
    appliesTo: React 19.2.8
    claims:
      - 等待期间基础值变化、多次 optimistic 派发与纯 reducer 重算

---

# useOptimistic 乐观状态

## 一、学习目标

- 能区分基础 State、optimistic State 和最终确认结果的职责。
- 能为 `useOptimistic` 选择 State 与 Action 类型，并编写纯 `updateFn`。
- 能在 Action 中派发一个或多个临时输入，并解释它们的显示顺序。
- 能在成功路径更新基础 State，在失败路径保留业务错误并回到当前基础值。
- 能处理临时 ID、稳定 `key`、基础值变化和多个异步操作的边界。
- 能根据是否需要 pending、队列结果或乐观视图选择相邻状态工具。

## 二、为什么需要

保存、发送、点赞、收藏或拖拽排序通常需要等待异步结果。若界面只在服务端确认后才改变，用户会看到
明显的空白时间；若直接把“已成功”写进唯一 State，又会把尚未确认的事实当成真实数据。

乐观 UI 把两件事分开：

1. 基础 State 保存应用已经确认、可以作为下一次渲染输入的事实。
2. optimistic State 在 Action 尚未结束时临时叠加用户输入，用来提高反馈速度。

```tsx
const [items, setItems] = useState(initialItems)
const [optimisticItems, addOptimistic] = useOptimistic(items, updateFn)
```

`items` 是事实来源，`optimisticItems` 是当前应该显示的列表。成功结果必须写回 `items`；失败时不确认本轮
输入，React 会重新显示当前 `items`。`useOptimistic` 不负责发送请求、保存数据、解析服务器响应或替应用
决定失败策略。

## 三、基础 State 与 optimistic State

### 1. 基础值是确认事实

`useOptimistic` 的第一个参数是 passthrough value，也就是组件在当前渲染中拥有的基础值。它可以来自
`useState`、Props、Reducer、查询缓存或其他数据源。这个值没有“乐观”标记，应用需要自己决定哪些内容已经
确认。

```tsx
type Comment = Readonly<{
  id: string
  text: string
  status: 'confirmed'
}>

const [comments, setComments] = useState<readonly Comment[]>([])
const [visibleComments, addOptimistic] = useOptimistic(comments, addComment)
```

基础值发生变化时，Hook 以新的基础值重新计算临时视图。不要把某次 Action 开始时的数组引用当成 React
自动保存的回滚快照。

### 2. optimistic State 是临时渲染值

调用 `addOptimistic(input)` 后，`updateFn` 会把输入应用到当前 optimistic State。只要对应 Action 仍在
进行，渲染可以显示这一临时结果。没有待处理的 optimistic 更新时，显示值通常与基础值相同。

临时条目可能带有 `pending: true`、`status: 'sending'` 或半透明样式，但这些字段都是应用定义的普通
数据。React 不会自动添加临时 ID、状态字段、错误消息或时间戳。

### 3. 它不是第二份可持久化 State

`useOptimistic` 不返回一个可以直接 `set` 的第二 State，也不提供自动保存和自动请求。它返回的是当前
显示值和一个派发函数：

```tsx
const [optimisticState, addOptimistic] = useOptimistic(state, updateFn)
```

成功后如果只调用 `addOptimistic` 而不更新 `state`，Action 结束时临时输入会消失。这个结果不是 React
丢失了数据，而是应用没有把确认结果写入真正的基础 State。

## 四、useOptimistic 的 API 与类型

### 1. 带 updateFn 的形式

从 `react` 导入 Hook：

```tsx
import { useOptimistic } from 'react'
```

常用形式是：

```tsx
const [optimisticState, addOptimistic] = useOptimistic<State, Action>(
  state,
  updateFn,
)
```

`state` 是当前基础值，`updateFn` 接收当前状态和一次输入，并返回下一份 optimistic State。返回数组的
第二项是派发函数，其参数类型是 `Action`，返回 `void`。

```tsx
function updateFn(currentState: State, input: Action): State {
  return nextState
}
```

### 2. 不带 updateFn 的形式

省略 `updateFn` 时，派发值本身就是下一份 State：

```tsx
const [optimisticValue, setOptimisticValue] = useOptimistic<string>(value)

startTransition(() => {
  setOptimisticValue('正在保存的标题')
})
```

setter 也接收纯函数，函数参数是当前 pending State：

```tsx
startTransition(() => {
  setOptimisticValue((pendingValue) => `${pendingValue}（保存中）`)
})
```

这种形式适合临时值本身就是完整 State，或下一值只依赖当前 pending State 的场景。若输入只是一个命令、
增量或领域事件，应提供明确的 `updateFn`，让“输入如何改变视图”成为可读的纯函数。

### 3. TypeScript 的泛型边界

```tsx
type Item = Readonly<{
  id: string
  label: string
  pending: boolean
}>

type AddItem = Readonly<{
  id: string
  label: string
}>

const [optimisticItems, addOptimistic] = useOptimistic<
  readonly Item[],
  AddItem
>(items, (currentItems, input) => [
  ...currentItems,
  { ...input, pending: true },
])
```

`State` 和 `Action` 可以相同，也可以不同。显式写出泛型能在 reducer 参数、临时输入和基础 setter 之间
形成更清晰的合同，但不应为了形式重复已经能正确推导的类型。

### 4. Hook 位置与派发函数

Hook 只能在组件或自定义 Hook 的顶层调用，不能放进条件分支、循环或事件处理器。`addOptimistic` 是
普通函数引用，不应当保存到模块级变量，也不应在渲染期间调用。

```tsx
function CommentEditor() {
  const [comments, setComments] = useState(initialComments)
  const [optimisticComments, addOptimistic] = useOptimistic(
    comments,
    appendPendingComment,
  )

  // 事件处理器只调用 Action；Hook 仍然位于组件顶层。
  return <button onClick={() => submitComment(addOptimistic)}>发送</button>
}
```

## 五、updateFn 的输入输出

### 1. 用输入表达意图

`updateFn` 的第二个参数不是服务器响应，而是调用方派发的 optimistic input。它可以是完整对象，也可以是
一个命令：

```tsx
type CartAction =
  | { type: 'add'; id: string; title: string }
  | { type: 'remove'; id: string }
  | { type: 'changeQuantity'; id: string; quantity: number }
```

```tsx
function updateCart(currentCart: readonly CartLine[], action: CartAction) {
  switch (action.type) {
    case 'add':
      return [
        ...currentCart,
        { id: action.id, title: action.title, quantity: 1, pending: true },
      ]
    case 'remove':
      return currentCart.filter((line) => line.id !== action.id)
    case 'changeQuantity':
      return currentCart.map((line) =>
        line.id === action.id
          ? { ...line, quantity: action.quantity, pending: true }
          : line,
      )
  }
}
```

输入越接近用户意图，成功时把服务器结果写回基础 State 就越容易。不要把 Promise、Response 或异常对象
作为 reducer 的隐含输入。

### 2. 纯函数和不可变返回值

`updateFn` 必须只依赖两个参数，并返回新的 State。不要原地修改数组、对象或 Map，也不要在其中执行网络
请求、写入模块变量、触发 State setter、读取当前时间或生成随机值。

```tsx
function appendPending(
  currentItems: readonly Item[],
  input: AddItem,
): readonly Item[] {
  return [...currentItems, { ...input, pending: true }]
}
```

React 可能在基础值变化时重放 pending 输入。纯函数能保证同一基础值和同一输入得到同一结果，重放不会产生
重复副作用。

### 3. updateFn 不负责确认

`updateFn` 只能回答“临时显示什么”，不能回答“请求是否成功”。服务器返回的规范化文本、数据库 ID、权限
结果和错误信息属于 Action 的成功或失败分支。

```tsx
startTransition(async () => {
  addOptimistic(input)
  const confirmed = await saveItem(input)

  startTransition(() => {
    setItems((currentItems) => [...currentItems, confirmed])
  })
})
```

## 六、Action 约束

### 1. setter 必须属于 Action

React 需要知道临时值属于哪一次异步更新。`addOptimistic` 应在 `startTransition` 的同步函数或异步
Action 中调用，也可以由支持 Action 的表单提交函数调用。

```tsx
function submit(input: AddItem) {
  startTransition(async () => {
    addOptimistic(input)
    await saveItem(input)
  })
}
```

普通事件中直接调用 optimistic setter 会在开发环境提示它不在 Transition 或 Action 中。这个提示说明调用
边界错误，不是应该忽略的普通日志。

### 2. 在 Action 开始阶段派发临时输入

最清晰的结构是在等待之前派发临时输入：

```tsx
startTransition(async () => {
  addOptimistic({ id: temporaryId, label: draft.label })
  const result = await save(draft)

  startTransition(() => {
    setItems((items) => [...items, result])
  })
})
```

`await` 后的普通 State 更新需要重新放入 Transition，才能继续表达非紧急的 Action 更新。这个规则属于
`startTransition` 的异步 Action 语义；它不改变 `useOptimistic` 的两个返回值结构。

### 3. 一个 Action 可以派发多个输入

多个输入会按派发顺序进入同一 optimistic 更新队列：

```tsx
startTransition(async () => {
  addOptimistic({ id: 'alpha', label: '组件清单' })
  addOptimistic({ id: 'beta', label: '审核记录' })
  await saveBoth()
})
```

如果 `updateFn` 是追加函数，显示结果通常是“基础条目、组件清单、审核记录”。这是输入在当前 Action 中
的显示顺序，不是网络响应的完成顺序，也不是服务器事务保证。

### 4. Action 结束后的状态

Action 成功结束时，React 不会自动把 optimistic State 复制到基础 State。应用必须根据真实结果更新基础
State；如果基础 State 没有变化，临时输入会被撤销。

Action 失败时，应用可以捕获异常并写入普通错误 State。若异常继续抛出，则最近的 Error Boundary 可能替换
组件子树；此时不要承诺用户一定还能看到同一个列表的回滚画面。

## 七、成功承接与失败回滚

### 1. 成功承接

成功路径至少包含两个职责：等待真实结果、把真实结果写进基础 State。服务器可能返回新的 ID、排序、权限
或格式化文本，因此不要盲目把 optimistic 输入原样当成确认对象。

```tsx
type ConfirmedItem = Readonly<{
  id: string
  label: string
  pending: false
}>

startTransition(async () => {
  const temporary = { id: temporaryId, label: draft }
  addOptimistic(temporary)

  const confirmed: ConfirmedItem = await createItem(draft)
  startTransition(() => {
    setItems((items) => [...items, confirmed])
  })
})
```

确认 State 重新作为基础值传给 Hook 后，条目的 `pending` 标记由应用数据变为 `false`，临时 UI 与确认 UI
自然收敛。

### 2. 业务失败

业务失败不一定要抛异常。例如权限不足、内容重复或校验失败可以作为返回结果：

```tsx
startTransition(async () => {
  addOptimistic(input)
  const result = await tryCreate(input)

  if (!result.ok) {
    setMessage(result.message)
    return
  }

  startTransition(() => {
    setItems((items) => [...items, result.item])
  })
})
```

没有确认基础更新时，本轮临时项会消失。错误消息应由普通 State、`useActionState` 或错误边界负责，不能
期待 `useOptimistic` 自动产生消息。

### 3. 异常失败

网络异常、解析异常或 Action 中主动 `throw` 会结束 Action。捕获异常可以保留当前组件并展示可恢复的错误：

```tsx
startTransition(async () => {
  addOptimistic(input)
  try {
    const item = await save(input)
    startTransition(() => setItems((items) => [...items, item]))
  } catch {
    setMessage('保存失败，临时条目已撤销')
  }
})
```

如果不捕获，异常会交给最近的错误边界。错误边界的替换范围由组件树决定，不是 `useOptimistic` 的回滚 API。

### 4. 不把回滚写成手工旧快照

失败时通常不需要 `setItems(snapshotBeforeAction)`。手工快照会覆盖 Action 期间其他合法的基础更新，也
可能把已经确认的新数据抹掉。只要失败分支不把本轮输入写入基础 State，Hook 会在 Action 结束后显示当前
基础值。

## 八、基础值变化与重放

### 1. 等待期间基础值可以变化

基础 State 并不因为 optimistic Action 开始就被冻结。例如后台同步、另一个用户的更新或本地普通交互都
可能更新 `items`。React 会以新的基础值作为 passthrough，并重新应用仍然等待的 optimistic 输入。

```tsx
// 另一个交互确认了一条条目
setItems((items) => [
  ...items,
  { id: 'remote-1', label: '其他来源的确认条目', pending: false },
])
```

如果原 Action 仍处于等待状态，显示结果应同时包含这条新的确认条目和尚未确认的临时条目。这里的“回滚”
指放弃未确认输入后回到当时的基础值，而不是回到 Action 开始时的固定数组。

### 2. 重放要求 updateFn 没有副作用

基础值重置、组件重新渲染或多个 pending 更新合并时，React 可能重新计算 optimistic State。若 reducer 中
递增全局计数器或调用 `Math.random()`，同一个输入可能得到不同 ID，列表会出现重复或跳动。

临时身份应在 Action 入口准备好：

```tsx
const temporaryId = `local-${nextLocalId.current++}`
const input = { id: temporaryId, label: draft }

startTransition(() => {
  addOptimistic(input)
})
```

此处生成 ID 的代码属于事件处理器；`updateFn` 只接收已经确定的 `input`。

### 3. 基础值更新的合并策略

React 只负责把 pending 输入应用到新的基础值，不负责领域冲突合并。两个操作都修改同一条记录时，应用仍
需要决定最后写入者、版本号、服务器时间或冲突提示。不要把 `useOptimistic` 的队列顺序解释成数据库锁或
事务顺序。

## 九、临时 ID、稳定 key 与确认身份

### 1. 临时 ID 的职责

临时 ID 用于在服务器响应之前标识一条 optimistic 项。它应该在派发输入时生成，并贯穿该项的渲染、错误
提示和重试。不要把数组下标当 ID，因为插入、删除或重新排序会改变下标。

### 2. key 要稳定且唯一

```tsx
{optimisticItems.map((item) => (
  <li key={item.id}>{item.label}</li>
))}
```

同一条项在“待确认”到“已确认”的转换中，如果仍使用相同 ID，React 可以保留该行的组件 State 和 DOM
身份。服务器返回全新 ID 时，应用可以在确认合并阶段把临时 ID 映射到服务端 ID；这可能导致 React 认为是
新项，需要在需要时显式迁移行内 State。

### 3. 不在 updateFn 内产生身份

以下写法会在重放时产生不同 key：

```tsx
// 错误：每次重放都可能得到不同身份
return [...currentItems, { id: crypto.randomUUID(), ...input }]
```

正确方式是让 `input.id` 在事件入口已经确定，再由纯 `updateFn` 原样复制。

### 4. 去重与重试

同一用户操作可能因为重复点击、重试或恢复网络而再次派发。`useOptimistic` 不会自动去重。应用应给操作
一个稳定的 client operation ID，在 Action 层或服务器层做幂等处理；`updateFn` 只负责按输入产生显示结果。

## 十、多个 Action 与并发边界

### 1. 显示顺序不等于完成顺序

同一个 Hook 可以在多个 Action 中接收 optimistic 输入。React 会维护这些 pending 输入的视图，但服务端
可能先完成后派发的操作。若确认结果包含旧快照，直接覆盖基础 State 就可能丢失较新的更新。

因此需要在数据层定义版本、操作 ID、服务器排序或重新获取策略。`useOptimistic` 本身不提供竞态解决方案。

### 2. Action 之间的 entanglement

React 可以把同一时间窗口内相关的异步 Action 作为一组 Transition 处理。这个内部调度行为不应被写成业务
顺序保证。课程代码只依赖公开的输入与基础 State 语义，不依赖固定的 render 次数、lane 名称或完成时刻。

### 3. 何时限制并发

如果同一资源不能同时提交，可以在事件入口禁用重复按钮，或由请求层建立队列。这个产品策略与
`useOptimistic` 是两层职责：前者限制 Action，后者只描述等待期间的临时视图。

### 4. 删除与编辑

删除可以先从 optimistic 列表过滤，编辑可以先替换文本并标记 `pending`。失败时不要恢复一个过时的全量
快照，而应由当前基础数据和具体操作 ID 决定是否重试、显示冲突或重新加载。

## 十一、与其他状态工具的区别

### 1. 与普通 useState

`useState` 保存事实或普通交互状态；`useOptimistic` 在 Action 期间提供派生临时视图。若没有异步确认
过程，直接使用 `useState` 更简单。

### 2. 与 useTransition

`useTransition` 提供 `isPending` 和 `startTransition`，用于标识并启动非紧急更新。它不自动生成临时
数据。`useOptimistic` 提供临时 State 和 optimistic setter，但不返回 pending 布尔值。两者经常组合：

```tsx
const [isPending, startTransition] = useTransition()
const [optimisticItems, addOptimistic] = useOptimistic(items, updateFn)
```

### 3. 与 useActionState

`useActionState` 适合把 Action 的前次结果、业务错误和提交状态组织成 State；`useOptimistic` 适合在结果
到达前显示临时内容。一个表单可以同时使用两者，但每个 Hook 解决的问题不同。

### 4. 与 useFormStatus

`useFormStatus` 读取父级 `<form>` 的提交状态，适合禁用提交按钮和显示 pending。它不产生临时列表，也不
决定成功结果如何写入基础 State。

### 5. 与缓存或数据层

缓存库可以负责请求去重、失效、重新获取和服务器数据同步。`useOptimistic` 是组件层的临时渲染工具；即使
使用数据层，仍需明确乐观输入、确认结果和失败处理的边界。

## 十二、可访问反馈与交互设计

临时状态需要可读的文本和可操作的错误恢复。不要只通过颜色、透明度或动画表示“待确认”。

```tsx
<li>
  <span>{item.label}</span>
  <span aria-label={item.pending ? '等待确认' : '已确认'}>
    {item.pending ? '待确认' : '已确认'}
  </span>
</li>
```

Action 级别的状态可以使用 `role="status"` 和 `aria-live="polite"`，错误信息应说明失败原因和可用操作。
禁用重复按钮时仍要保留键盘可见焦点和足够的文字反馈。普通交互不应因为一个等待中的 Action 而全部失去
响应能力，除非业务确实要求锁定整个资源。

## 十三、用法示例与 Demo

Demo 使用一条已确认基础条目和两个固定输入。点击“开始待确认更新”后，两个输入立即显示为待确认，基础
计数不变；等待期间可以添加一条独立的已确认条目，观察基础值变化后临时输入仍按顺序存在。

点击“确认成功”时，两个输入被写入基础 State，待确认标记消失。重新开始后点击“拒绝并回滚”，基础条目
和等待期间已经确认的条目保留，两个未确认输入消失。点击“记录本地备注”可以观察相邻 State 在等待期间
仍可响应。

:::demo{id="react.core.learn.advanced.use-optimistic-pending-state.optimistic-items-demo"}
:::

## 十四、易错使用提示

:::pitfalls
### 错误一：把 optimistic State 当作持久 State

**触发条件：** 只调用 `addOptimistic`，成功后不更新基础 State。

**原因：** optimistic State 只在 Action 期间派生，Hook 不会自动保存临时值。

**后果：** Action 结束后临时内容消失，看起来像成功也回滚。

**错误示例：**

```tsx
startTransition(async () => {
  addOptimistic(input)
  await save(input)
})
```

**正确写法：**

```tsx
startTransition(async () => {
  addOptimistic(input)
  const confirmed = await save(input)
  startTransition(() => setItems((items) => [...items, confirmed]))
})
```

**验证方式：** 成功后基础计数和显示计数都增加，条目状态变为已确认。

### 错误二：在普通事件中直接调用 optimistic setter

**触发条件：** `onClick={() => addOptimistic(input)}`。

**原因：** setter 需要属于 Action 或 Transition，React 才能管理它的临时生命周期。

**后果：** 开发环境出现 Action 外调用警告，临时值不能按预期等待。

**错误示例：**

```tsx
function handleClick() {
  addOptimistic(input)
}
```

**正确写法：**

```tsx
function handleClick() {
  startTransition(() => addOptimistic(input))
}
```

**验证方式：** 所有 setter 调用都位于 `startTransition` 或表单 Action 内。

### 错误三：在 updateFn 中原地修改数据

**触发条件：** 对 `currentItems` 调用 `push`，或直接改动其中的对象。

**原因：** React 可能重放纯函数；原地修改会让一次输入产生重复或不一致结果。

**后果：** 基础数据被污染，重放时出现重复条目或无法解释的顺序变化。

**错误示例：**

```tsx
function updateFn(currentItems: Item[], input: AddItem) {
  currentItems.push({ ...input, pending: true })
  return currentItems
}
```

**正确写法：**

```tsx
function updateFn(currentItems: readonly Item[], input: AddItem) {
  return [...currentItems, { ...input, pending: true }]
}
```

**验证方式：** reducer 不调用 setter、Promise、随机 API 或外部写入，只用参数返回新对象。

### 错误四：在 updateFn 中生成临时 ID

**触发条件：** 用 `Date.now()`、随机数或递增模块变量生成 key。

**原因：** updateFn 可能被多次执行，重放会重复生成身份。

**后果：** 同一临时项的 key 变化，列表行 State 被重置或出现重复项。

**错误示例：**

```tsx
return [...currentItems, { id: crypto.randomUUID(), ...input }]
```

**正确写法：**

```tsx
const input = { id: createClientOperationId(), label: draft }
addOptimistic(input)
```

**验证方式：** 同一个输入在重放前后包含相同 ID，列表使用该 ID 作为 key。

### 错误五：把失败写成恢复固定快照

**触发条件：** Action 开始时保存 `const snapshot = items`，失败时强制 `setItems(snapshot)`。

**原因：** 等待期间基础 State 可能已经合法变化，React 回到的是当前基础值而非固定旧引用。

**后果：** 其他已确认条目被覆盖，错误恢复反而丢数据。

**错误示例：**

```tsx
const snapshot = items
// ...等待 Action
setItems(snapshot)
```

**正确写法：**

```tsx
try {
  await save(input)
} catch {
  setMessage('保存失败，保持当前基础值')
}
```

**验证方式：** 在等待期间加入一条基础条目，失败后该条目仍存在，而本轮临时条目消失。

### 错误六：把输入顺序当作请求完成顺序

**触发条件：** 看到“甲、乙”按顺序显示，就断言两个异步请求一定按甲、乙完成。

**原因：** optimistic 队列描述临时视图，不能替代服务器完成顺序、版本或冲突策略。

**后果：** 并发更新可能互相覆盖，课程代码建立了不存在的事务保证。

**错误示例：**

```tsx
// 错误：用显示顺序推断服务端完成顺序
const confirmed = await saveBothInDisplayOrder()
```

**正确写法：**

```tsx
const result = await save(input)
setItems((currentItems) => mergeByOperationId(currentItems, result))
```

**验证方式：** 为操作携带 ID 或版本，并在数据层处理乱序确认；UI 只显示当前基础值与 pending 输入。

### 错误七：以为 Hook 返回 pending 布尔值

**触发条件：** 写成 `const [value, add, isPending] = useOptimistic(...)`。

**原因：** Hook 只返回 optimistic State 和 setter。

**后果：** 类型错误，并把视图派生和提交状态混为一谈。

**错误示例：**

```tsx
const [value, add, isPending] = useOptimistic(baseValue, updateFn)
```

**正确写法：**

```tsx
const [isPending, startTransition] = useTransition()
const [value, add] = useOptimistic(baseValue, updateFn)
```

**验证方式：** 需要布尔值时组合 `useTransition`、`useFormStatus` 或 `useActionState`。

### 错误八：把 React 自动产生的字段当业务数据

**触发条件：** 认为 `pending`、临时 ID 或错误消息由 React 注入。

**原因：** 这些字段来自 `updateFn` 的返回值或应用自己的 State。

**后果：** 确认结果无法正确映射，错误处理也没有明确拥有者。

**错误示例：**

```tsx
const [value, add] = useOptimistic(baseValue, (items, input) => [
  ...items,
  { ...input, pending: true },
])
// 认为 React 会自动填写 id、pending 和 error
```

**正确写法：**

```tsx
type Input = { id: string; label: string }
type Item = Input & { pending: boolean }
```

**验证方式：** 在输入类型和 State 类型中显式定义字段及转换规则。

### 错误九：用整个列表快照解决并发冲突

**触发条件：** 每个 Action 成功时用闭包中的旧 `items` 覆盖基础 State。

**原因：** 旧闭包不包含等待期间的其他确认更新。

**后果：** 后完成的响应覆盖先完成或同时确认的数据。

**错误示例：**

```tsx
setItems([...items, result.item])
```

**正确写法：**

```tsx
setItems((currentItems) => mergeByOperationId(currentItems, result))
```

**验证方式：** 成功回调使用函数式 setter，并按操作 ID、版本或重新获取结果合并确认数据。
:::

## 十五、源码推导与适用场景

### 1. 官方实现事实

React 的 `useOptimistic` 更新路径把第一个参数作为当前基础值，并把 optimistic 更新放入带有 Transition
回收边界的更新队列。更新队列处理时会从新的基础值开始计算，Action 结束后不再保留未确认的临时更新。
这一实现说明两件事：基础值变化时可以重放 pending 输入；失败回滚不是恢复一张固定快照。

公开类型把 reducer 写成 `(state, action) => state`，返回值是 `[state, dispatch]`。运行时在没有 Transition
或 Action 上下文时会发出开发提示，但这些内部队列、lane 和调度细节都不是业务代码可以依赖的时序合同。

### 2. 从实现得到的课程推导

1. `updateFn` 必须纯，因为同一输入可能被新的基础值重新应用。
2. 确认结果必须进入基础 State，因为临时队列结束后只保留基础值。
3. 临时身份必须在输入产生时确定，因为 reducer 重放不应改变列表 key。
4. 并发冲突必须由应用数据层解决，因为 Hook 只负责临时显示，不负责服务器排序、幂等或版本合并。

### 3. 适用场景

- 评论、消息、收藏、点赞、购物车数量等“用户意图明确且反馈价值高”的操作。
- 可以快速显示临时结果，且失败后有清晰的撤销或错误提示的界面。
- 基础数据由 State、Props 或数据层驱动，并能在成功后提供确认结果的组件。

### 4. 不适合的场景

- 结果不可逆、权限敏感或错误代价很高，不能先向用户显示可能错误的内容。
- 需要精确的事务、库存锁、支付扣款或服务器版本协调；这些必须由服务端和数据层提供保证。
- 没有异步等待，直接使用普通 State 就足够的本地交互。

### 5. 选择判断

先问三个问题：

1. 用户是否能立即表达一个明确的临时意图？
2. 成功结果能否写入基础 State，失败结果能否清楚撤销或提示？
3. 并发冲突是否有操作 ID、版本或重新获取策略？

三个问题都能回答时，再使用 `useOptimistic`；否则先补齐数据合同或选择更适合的状态工具。

## 十六、练习

:::exercise
### 练习一：预测基础值与显示值

**要求：** 基础列表只有“基础条目”。在同一个 Action 中依次派发“甲”和“乙”，分别预测等待、成功和失败
三个阶段的基础列表、显示列表和 `pending` 标记。

**验收：** 等待阶段基础列表不变，显示列表按“基础、甲、乙”排列；成功后确认条目进入基础列表；失败
后未确认条目消失。
:::

:::exercise
### 练习二：在等待期间加入基础更新

**要求：** 点击 Demo 的“加入已确认条目”，再点击“拒绝并回滚”。解释为什么该条目保留，而本轮甲乙消失。

**验收：** 能说出当前基础值与 Action 开始时快照的区别，并能指出失败分支没有调用确认 State setter。
:::

:::exercise
### 练习三：设计编辑操作

**要求：** 把追加条目改成编辑已有条目。输入包含 `operationId`、`itemId` 和 `nextLabel`，optimistic
State 显示新文本并标记待确认，成功使用服务器返回对象替换基础条目，失败保留原基础条目。

**验收：** `updateFn` 只读参数并返回新数组；列表 `key` 使用稳定的条目 ID；成功合并不会覆盖等待期间
的其他基础更新。
:::

:::exercise
### 练习四：选择状态工具

**要求：** 分别判断以下需求应该使用 `useState`、`useTransition`、`useActionState`、`useFormStatus` 还是
`useOptimistic`：显示保存按钮 pending、返回表单业务错误、显示评论临时条目、记录一个纯本地开关。

**验收：** 能把“提交状态”“Action 结果”“表单父级状态”“临时视图”“普通事实 State”分别归给正确工具。
:::

## 十七、本节小结

- 第一个参数是基础值，`useOptimistic` 的显示值是 Action 期间基于它派生的临时 State。
- 带 `updateFn` 时，输入由调用方派发，`updateFn` 必须纯、不可变并且可以重放。
- optimistic setter 必须在 Action 或 Transition 中调用；Hook 只返回显示值和 setter，不返回 pending 布尔值。
- 成功必须把真实结果写入基础 State；失败时不确认本轮输入，视图回到当前基础值。
- 临时 ID 在输入入口生成，列表 key 保持稳定；不要在 reducer 中生成身份或修改旧数据。
- 输入显示顺序不等于请求完成顺序，冲突、幂等、版本和事务由数据层负责。

## 十八、参考资料

- [useOptimistic](https://react.dev/reference/react/useOptimistic) - 参数、返回值、Action 约束、纯更新函数和基础值回退。
- [React 19 发布说明](https://react.dev/blog/2024/12/05/react-19#new-hook-optimistic-updates) - 乐观更新的公开使用场景。
- [useTransition](https://react.dev/reference/react/useTransition) - Action、pending 和 await 后更新的 Transition 边界。
- [State as a Snapshot](https://react.dev/learn/state-as-a-snapshot) - State 快照与事件处理器闭包的基础模型。
- [ReactFiberHooks](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js) - React 19.2.8 的基础值、optimistic 队列与 Action 外调用实现旁证。
- [ReactAsyncActions 测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactAsyncActions-test.js) - React 19.2.8 的基础值重放和多次派发固定测试。
