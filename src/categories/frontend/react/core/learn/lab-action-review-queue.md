---
id: react.core.learn.advanced.lab-action-review-queue
type: lesson
title: 实战：异步审核队列
summary: 组合 Form Action、useFormStatus、useActionState 与 useOptimistic，构建可提交、可回滚、可区分业务结果的审核队列。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 180
prerequisites:
  - react.core.learn.advanced.form-action-client-submission
  - react.core.learn.advanced.use-action-state-result-queue
  - react.core.learn.advanced.use-optimistic-pending-state
related:
  - react.core.learn.advanced.use-transition-pending-action
  - react.core.learn.advanced.error-boundary-render-failures
tags:
  - React
  - 实战
  - Form Action
  - useFormStatus
  - useActionState
  - useOptimistic
  - Optimistic UI
  - 异步审核
appliesTo: React 19.2
verifiedAt: 2026-08-18
objectives:
  - 能把基础审核数据、临时审核视图、Action 业务结果和父 form 提交状态拆成四个状态所有者。
  - 能让 function Form Action 接收稳定记录 ID、审核决策和备注组成的 FormData。
  - 能用 useFormStatus 在 form 后代中显示本次提交的 pending 与 payload，并阻止重复提交。
  - 能用 useActionState 根据 previousState 返回 success 或 invalid 结果，并维护结果 revision。
  - 能用 useOptimistic 在 Action 等待期间标记目标行，并在成功后由基础 State 承接、失败后回退。
  - 能区分业务失败与异常失败，并为两类失败选择不同的状态与恢复边界。
  - 能保持记录 ID、列表 key、FormData 目标和结果合并条件一致。
  - 能说明前端 Action 队列与服务器权限、事务、幂等和冲突处理的边界。
recap:
  - 基础 State 保存确认事实，optimistic State 只保存 Action 等待期间的临时显示。
  - Form Action 收集本次 FormData；useFormStatus 只读取最近父 form 的提交状态。
  - useActionState 保存 Action 返回的业务结果，previousState 是前次结果而不是渲染闭包快照。
  - useOptimistic 的 updateFn 必须纯、不可变并使用输入中已有的稳定身份。
  - 成功路径同时更新基础队列和结果 State；业务失败只返回 invalid 结果，不确认临时输入。
  - throw 或 reject 属于异常路径，应交给最近 Error Boundary，而不是伪装成普通字段校验。
  - 同一个记录 ID 应贯穿列表 key、hidden input、optimistic input 和基础 State 合并。
  - React 的 Action 能力不提供后端权限、持久化、事务、版本冲突或跨客户端一致性。
sources:
  - title: React form Reference
    url: https://react.dev/reference/react-dom/components/form
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - function Action、FormData、Transition、成功 reset 与错误传播
  - title: React useFormStatus Reference
    url: https://react.dev/reference/react-dom/hooks/useFormStatus
    sourceType: official-reference
    appliesTo: React DOM 19.2
    claims:
      - 父 form 后代作用域、pending、data、method 与 action
  - title: React useActionState Reference
    url: https://react.dev/reference/react/useActionState
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - previousState、payload、结果 State、Action 队列与 isPending
  - title: React useOptimistic Reference
    url: https://react.dev/reference/react/useOptimistic
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 基础值、临时 State、纯 updateFn、Action 约束与回退
  - title: React 19 Actions
    url: https://react.dev/blog/2024/12/05/react-19#actions
    sourceType: release-note
    appliesTo: React 19
    claims:
      - Actions、表单状态、结果 State 与 optimistic UI 的组合方向
  - title: React 19.2.8 Action 与 optimistic 实现
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - Action State 队列、passthrough 基础值、optimistic 重放与调用上下文
  - title: React 19.2.8 Form Action 测试
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMForm-test.js
    sourceType: official-test
    appliesTo: React DOM 19.2.8
    claims:
      - FormData、form status、成功 reset、错误边界与 form 结构
  - title: WAI-ARIA status role
    url: https://www.w3.org/TR/wai-aria-1.2/#status
    sourceType: specification
    appliesTo: WAI-ARIA 1.2
    claims:
      - 动态状态消息的 polite live region 与 atomic 语义
---

# 实战：异步审核队列

## 一、学习目标

- 把审核记录的确认事实、等待期间临时显示、Action 返回结果和表单提交状态拆开建模。
- 用 function Form Action 接收当前记录、审核决定和备注组成的 `FormData`。
- 在 form 后代中使用 `useFormStatus`，让 pending 文案和禁用状态只属于当前表单。
- 用 `useActionState` 保存业务结果，并用 `previousState` 维护可追踪的 revision。
- 用 `useOptimistic` 立即标记目标审核行，成功后写回基础 State，业务失败后自动回到基础值。
- 区分业务失败与异常失败，不让结果 State、optimistic State 和 Error Boundary 争夺职责。
- 用同一个稳定 ID 连接列表 `key`、提交 payload、临时输入和确认结果。
- 识别 React Action 与后端权限、事务、持久化、幂等和冲突处理之间的边界。

## 二、问题场景与状态边界

审核队列包含多条待处理记录。审核人选择一条记录，填写备注并提交“通过”或“退回修改”。提交需要
等待异步结果，但界面不能在等待期间失去上下文，也不能把尚未确认的决定直接当成最终事实。

这个场景同时需要四类信息：

1. 已经确认的审核队列。
2. 等待期间应该显示的临时决定。
3. 最近一次 Action 返回的业务结果。
4. 当前父 form 是否正在提交，以及本次提交了什么。

四类信息可能同时变化，但所有权不同。把它们塞进一个 `loading`、一个 `error` 或一个复制出来的数组，
会让成功、失败和重试路径互相覆盖。

本节固定以下界面结果：

| 阶段 | 基础队列 | 当前显示 | Action 结果 | form 状态 |
| --- | --- | --- | --- | --- |
| 空闲 | 已确认记录 | 等于基础队列 | 最近结果或初始结果 | `pending=false` |
| 等待 | 不变 | 目标行显示临时决定 | 仍是前次结果 | `pending=true`，`data` 是本次提交 |
| 成功 | 写入确认决定 | 服从新的基础队列 | `success`，revision 增加 | 回到空闲 |
| 业务失败 | 不变 | 临时决定消失 | `invalid`，revision 不增加 | 回到空闲 |
| 异常失败 | 不保证保留表单子树 | 由错误边界决定 | 不返回普通结果 | Action 错误进入最近边界 |

## 三、先建立四个状态所有者

### 1. 基础队列保存确认事实

```tsx
type ReviewStatus = 'awaiting' | 'approved' | 'changes-requested'

type ReviewItem = Readonly<{
  id: string
  title: string
  owner: string
  status: ReviewStatus
}>

const [reviews, setReviews] = useState<readonly ReviewItem[]>(initialReviews)
```

只有成功结果可以改变 `reviews`。等待和业务失败都不应该先改基础值再恢复旧快照，因为旧快照可能覆盖
其他已经确认的更新。

### 2. optimistic State 保存临时显示

```tsx
type ReviewIntent = Readonly<{
  reviewId: string
  decision: 'approve' | 'request-changes'
}>

const [optimisticReviews, addOptimisticReview] = useOptimistic(
  reviews,
  updateOptimisticQueue,
)
```

`optimisticReviews` 是当前渲染列表，不是第二份持久数据。它可以在目标行增加
`pendingDecision`，但不能代替成功后的基础 State 更新。

### 3. Action State 保存业务结果

```tsx
type ReviewResult = Readonly<{
  revision: number
  kind: 'idle' | 'success' | 'invalid'
  reviewId: string | null
  fieldError: 'note' | null
  message: string
}>
```

`ReviewResult` 回答“最近一次业务处理得到什么结果”。它不保存完整审核队列，也不负责 form 的局部
pending。`fieldError` 只标记能归因到具体输入的校验错误；规则版本变化、记录失效等表单级业务失败
保持 `null`，不能让备注框代替整个操作承担错误语义。

### 4. form status 保存本次提交信息

`useFormStatus` 返回父 form 的 `pending`、`data`、`method` 和 `action`。它描述提交过程，不描述审核
业务是否成功。

```tsx
function ReviewSubmitButton() {
  const status = useFormStatus()
  return (
    <button type="submit" disabled={status.pending}>
      {status.pending ? '正在提交' : '提交审核'}
    </button>
  )
}
```

## 四、组件树决定 form 状态作用域

### 1. 状态组件必须是 form 后代

Hook 只能读取组件树上方最近的父 form：

```tsx
function ReviewForm() {
  return (
    <form action={submitReview}>
      <ReviewFields />
      <ReviewSubmitControls />
    </form>
  )
}
```

`ReviewSubmitControls` 在 form 后代中调用 `useFormStatus`，因此能读取这次提交。若在
`ReviewForm` 顶部先调用 Hook，再返回 `<form>`，该 form 仍位于 Hook 的下方，Hook 读不到它。

### 2. 按状态依赖安排组件位置

审核列表和 Action 结果不读取父 form status，可以放在 form 的兄弟位置。异步结算控件需要显示当前
提交的记录与决策，因此也调用 `useFormStatus`，必须作为 form 后代。它的按钮使用 `type="button"`，
只结算已经开始的异步操作，不会再次提交 form。

```text
ReviewWorkspace
├─ ReviewQueue
├─ ReviewEditor
│  └─ form
│     ├─ ReviewFields
│     ├─ ReviewSubmitControls -> useFormStatus
│     └─ ReviewSettlementControls -> useFormStatus, type="button"
└─ ReviewResult -> useActionState result
```

组件是否位于 form 内取决于它是否读取该 form 的提交状态，不取决于它看起来像按钮、列表还是结果区。

### 3. 不嵌套 form

需要多条记录时，不要为了让每一行拥有 status 而把 form 放进另一个 form。HTML 不允许 form 成为 form
后代。可以使用一个编辑 form 配合记录选择，也可以渲染多个彼此独立的兄弟 form。

## 五、设计稳定的数据与 FormData 合同

### 1. 一个 ID 贯穿所有边界

记录 ID 同时承担四个职责：

- 列表 `key`；
- hidden input 的 `reviewId`；
- optimistic input 的目标；
- 成功后基础数组 `map` 的匹配条件。

```tsx
<input type="hidden" name="reviewId" value={selectedReview.id} />
```

不要使用数组下标。审核列表经过排序、筛选或插入后，下标会改变，同一个结果可能被写入另一条记录。

### 2. 用 submitter 表达审核决定

```tsx
<button type="submit" name="decision" value="approve">
  提交通过
</button>
<button type="submit" name="decision" value="request-changes">
  提交退回
</button>
```

被点击的 submitter 会把 `name/value` 加入本次 `FormData`。两个按钮共用一个 Action，不需要为每个决定
复制一套提交函数。

### 3. 缩窄 FormData 值

`FormData.get()` 可能得到字符串、`File` 或 `null`。业务代码应先缩窄：

```tsx
function readFormValue(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}
```

审核决定还需要检查允许值，不能用类型断言把任意字符串直接变成联合类型。

## 六、用 useActionState 保存审核结果

### 1. Action 接收 previousState 和 FormData

```tsx
async function reviewAction(
  previousState: ReviewResult,
  formData: FormData,
): Promise<ReviewResult> {
  const reviewId = readFormValue(formData, 'reviewId')
  const decision = readFormValue(formData, 'decision')
  // 等待异步业务结果
  return nextResult
}

const [result, submitReview, isActionPending] = useActionState(
  reviewAction,
  initialResult,
)
```

`previousState` 是同一个 Action State 队列的前次结果。它比闭包中的 `result` 更适合计算下一 revision：

```tsx
return {
  revision: previousState.revision + 1,
  kind: 'success',
  reviewId,
  fieldError: null,
  message: '审核结果已确认',
}
```

### 2. 把返回的 Action 交给 form

```tsx
<form action={submitReview}>{/* fields */}</form>
```

React 为 function Action 收集 `FormData` 并建立 Action 上下文。这里不需要手工 `preventDefault()`，也
不需要在 submit 事件中重新构造同一份 payload。

### 3. isActionPending 只描述这条 Action State 队列

`isActionPending` 适合阻止切换当前记录、显示结果队列仍在处理。它不等于服务器已经写入成功，也不能
替代 form 后代的提交数据。

## 七、用 useFormStatus 读取本次表单提交

### 1. 先按 pending 缩窄

```tsx
function ReviewSubmitControls() {
  const status = useFormStatus()

  if (!status.pending) {
    return <p role="status">当前父表单空闲</p>
  }

  const reviewId = readFormValue(status.data, 'reviewId')
  const decision = readFormValue(status.data, 'decision')
  return <p role="status">正在提交 {reviewId} / {decision}</p>
}
```

空闲时 `data` 是 `null`，不能无条件调用 `data.get()`。pending 分支中的 `data` 是提交快照，不是输入框
随后变化后的实时内容。

### 2. 禁用两个 submitter

只禁用被点击的按钮仍可能让用户通过另一个 submitter 再次提交。同一 form 的两个审核决定都应使用
`status.pending`：

```tsx
<button disabled={status.pending}>提交通过</button>
<button disabled={status.pending}>提交退回</button>
```

`disabled` 负责操作约束；`role="status"` 负责动态通知；可见文案负责视觉反馈。三者职责不同。

### 3. 不把 method 当真实请求证据

`useFormStatus` 暴露 `method`，但客户端 function Action 会由 React 接管，Demo 没有发出真实网络请求。
不要仅凭 `method` 文本宣称后端收到了 POST，也不要为 function Action 强行增加 `method` 属性来制造
这种印象。

## 八、用 useOptimistic 标记目标审核行

### 1. updateFn 只根据参数返回新列表

```tsx
function updateOptimisticQueue(
  currentReviews: readonly OptimisticReviewItem[],
  intent: ReviewIntent,
): readonly OptimisticReviewItem[] {
  return currentReviews.map((review) =>
    review.id === intent.reviewId
      ? { ...review, pendingDecision: intent.decision }
      : review,
  )
}
```

函数不修改 `currentReviews`，不调用 State setter，不启动 Promise，不读取时间，也不生成 ID。基础值变化
或 React 重试计算时，同一输入可以安全重放。

### 2. 在 Action 中派发临时输入

```tsx
const intent = { reviewId, decision }
addOptimisticReview(intent)
const resolution = await submitToDataLayer(intent)
```

`submitReview` 由 form Action 调用，因此函数内部已经处于 Action 上下文。临时行可以在异步结果返回前
显示“等待确认：通过”或“等待确认：退回修改”。

### 3. 不从 optimistic State 读取确认事实

Action 等待期间，`optimisticReviews` 包含临时字段；`reviews` 仍保持确认值。统计“基础待审核数量”时
读取 `reviews`，统计“当前临时决定数量”时读取 `optimisticReviews`。两个数字回答不同问题。

## 九、完成成功路径

### 1. 先让基础 State 承接结果

```tsx
setReviews((currentReviews) =>
  currentReviews.map((review) =>
    review.id === reviewId
      ? {
          ...review,
          status: decision === 'approve' ? 'approved' : 'changes-requested',
        }
      : review,
  ),
)
```

函数式 setter 从当前基础值合并确认结果，不会把 Action 开始时的旧数组整体覆盖回来。

### 2. 再返回新的结果 State

结果 State 记录 revision、目标和可见反馈。它不需要复制完整审核对象：

```tsx
return {
  revision: previousState.revision + 1,
  kind: 'success',
  reviewId,
  fieldError: null,
  message: `${review.title}已确认`,
}
```

Action 完成后，optimistic input 退出等待队列。此时显示列表服从已经更新的基础 State，临时标记消失，
确认状态保留。

### 3. 明确受控字段的所有权

Form Action 成功完成会重置未受控字段。若备注使用 `value={note}`，它是受控字段，内容由 `note` State
决定。需要清空时显式调用 `setNote('')`；需要保留供下一条审核复用时不修改它。

## 十、处理业务失败与异常失败

### 1. 业务失败返回普通结果

规则版本变化、备注不符合业务要求、记录已失效等预期结果可以返回 `invalid`：

```tsx
return {
  ...previousState,
  kind: 'invalid',
  reviewId,
  fieldError: null,
  message: '规则版本已变化，请核对备注后重新提交',
}
```

这条路径不调用基础队列 setter。Action 正常完成后临时输入消失，目标行回到当前基础状态，revision 不
增加。若失败来自备注校验，则返回 `fieldError: 'note'` 并据此设置输入的 `aria-invalid`；不要仅凭
`kind === 'invalid'` 把所有业务失败都标记成字段错误。

### 2. 异常失败交给 Error Boundary

程序错误、依赖不可用或明确 reject 属于异常。它们不应被转换成一个含糊的 `invalid` 文案，也不应在
同一次 Action 中先返回业务结果再 throw。

最近 Error Boundary 可能替换整个 form 子树，因此异常路径不能承诺 DOM 输入一定保留。恢复时应由
错误边界提供重建入口，并让新的组件实例重新建立 Action State。

### 3. optimistic 回退不是错误恢复

`useOptimistic` 只保证未确认临时输入不继续作为显示事实。它不会保存错误对象、重建表单、恢复焦点、
重新发送请求或决定业务提示。这些分别属于结果 State、Error Boundary、交互层和数据层。

## 十一、多条记录、Action 队列与并发边界

### 1. 一次只提交一条记录

当前实现提交期间禁用记录切换和两个 submitter。这样 `selectedId`、hidden input 和 form status 的
`data` 始终指向同一条记录，也让成功与失败结果容易解释。

### 2. useActionState 队列不等于业务队列

同一个 `useActionState` 的多次派发会顺序处理，但页面上的审核记录集合是应用数据。Hook 不会自动决定
下一条记录、跨用户锁定、服务器顺序或重复请求去重。

需要并发审核时，至少要在数据层携带：

- 稳定记录 ID；
- 操作 ID；
- 基础版本或 ETag；
- 服务端权限判断；
- 幂等键或重复提交规则；
- 冲突后的重新获取或合并策略。

这些字段可以成为 Action payload 或服务器响应的一部分，但不是 React 自动提供的保证。

### 3. 不用 pending 决定业务锁

`pending` 只描述当前客户端 Action 生命周期。页面刷新、另一个标签页、另一位用户或服务器后台处理都
不受这个布尔值约束。真正的互斥和授权必须由共享数据所有者处理。

## 十二、可访问反馈与响应式布局

### 1. 状态消息提前存在

结果容器在空闲时也存在，内容从 idle 更新为 success 或 invalid：

```tsx
<div role="status" aria-atomic="true">
  <strong>{result.kind}</strong>
  <p>{result.message}</p>
</div>
```

`status` 隐含 polite live region。不要在每次更新时强制移动焦点，也不要把相同消息重复放进多个 live
region。

### 2. 颜色不是唯一信号

队列行必须显示“待审核”“等待确认：通过”“已通过”“需修改”等文本。绿色、橙色或红色只增强扫描，
不能成为唯一差异。

### 3. 选择与提交都使用原生控件

记录选择使用 `button` 和 `aria-pressed`，提交使用 `type="submit"`，异步结算使用
`type="button"`。键盘顺序遵循文档流，不用可点击 `div` 模拟控件。

### 4. 文本放大时允许换行

记录标题、状态、按钮文案、FormData 摘要和业务错误都可能变长。布局使用 flex 换行和正常文档流，
按钮不固定单行宽度，长词使用 `overflow-wrap`，避免在窄屏或文本放大时产生横向滚动。

## 十三、完整 Demo

:::demo{id="react.core.learn.advanced.lab-action-review-queue.review-workflow-demo"}
:::

Demo 使用三条固定本地记录和一个手动结算的 Promise。它不发起网络请求，也不使用 timer 或随机数。
运行时可以分别观察：

- 基础待审核数量；
- optimistic 临时决定数量；
- `useActionState` 的 pending 与 revision；
- form 后代读取的 pending、记录 ID 和 decision；
- 成功后的基础状态与结果 State；
- 业务失败后的临时回退和受控备注保留。

“返回成功”和“返回业务失败”只负责结算本地 Promise，让状态停在可观察阶段；它们不模拟服务器协议、
延迟、事务或缓存。

## 十四、易错使用提示

:::pitfalls
### 错误：用一个 loading State 代替四个状态所有者

**触发条件：** 基础队列、临时决定、Action 结果和 form pending 都由一个 `loading/error/data` 对象控制。

**原因：** 把共享时间段误当成共享语义，忽略每个 Hook 的数据所有权。

**后果：** 业务失败可能覆盖基础数据，form 外组件误读局部 pending，临时值也可能被当成确认结果。

**错误示例：**

```tsx
const [state, setState] = useState({ loading: false, items: initialReviews })
```

**正确写法：**

```tsx
const [reviews, setReviews] = useState(initialReviews)
const [optimisticReviews, addOptimistic] = useOptimistic(reviews, updateQueue)
const [result, submitReview, isPending] = useActionState(reviewAction, initialResult)
```

**验证方式：** 等待期间基础计数不变、临时计数增加、前次结果保留，同时 form 后代显示本次 payload。

### 错误：在声明 form 的同一组件中读取 useFormStatus

**触发条件：** 组件顶部调用 `useFormStatus()`，随后在同一个返回值中创建目标 `<form>`。

**原因：** Hook 只读取组件树上方的父 form，不能读取尚未返回的后代 form。

**后果：** 提交已经 pending，按钮仍显示空闲，`data` 也始终为 `null`。

**错误示例：**

```tsx
function ReviewForm() {
  const status = useFormStatus()
  return <form action={submitReview}>{String(status.pending)}</form>
}
```

**正确写法：**

```tsx
function ReviewForm() {
  return (
    <form action={submitReview}>
      <ReviewSubmitControls />
    </form>
  )
}
```

**验证方式：** 提交时 form 后代显示 `pending=true`，结算后回到 `pending=false`。

### 错误：成功后只返回 Action 结果，不更新基础队列

**触发条件：** `reviewAction` 返回 `kind: 'success'`，但没有调用基础队列 setter。

**原因：** 把 Action 结果 State 误当成 optimistic State 的持久化来源。

**后果：** Action 结束后临时决定消失，审核行重新显示“待审核”。

**错误示例：**

```tsx
addOptimistic(intent)
return { ...previousState, kind: 'success' }
```

**正确写法：**

```tsx
setReviews((reviews) => confirmDecision(reviews, intent))
return {
  revision: previousState.revision + 1,
  kind: 'success',
  reviewId: intent.reviewId,
  fieldError: null,
  message: '审核结果已确认',
}
```

**验证方式：** 成功后临时计数回到零，基础待审核计数减少，目标行保留确认状态。

### 错误：业务失败时恢复 Action 开始前的数组快照

**触发条件：** Action 开始时保存 `const before = reviews`，失败时调用 `setReviews(before)`。

**原因：** 把旧闭包数组当成唯一正确基础值，没有考虑等待期间的其他确认更新。

**后果：** 已确认数据可能被旧快照覆盖，列表回到过时状态。

**错误示例：**

```tsx
const before = reviews
try {
  await save()
} catch {
  setReviews(before)
}
```

**正确写法：**

```tsx
if (resolution === 'invalid') {
  return {
    revision: previousState.revision,
    kind: 'invalid',
    reviewId,
    fieldError: null,
    message: '规则版本已变化，请重新提交',
  }
}
```

**验证方式：** 业务失败分支不调用基础 setter；Action 结束后只撤销本轮临时字段。

### 错误：在 updateFn 中发送请求或生成 ID

**触发条件：** `updateFn` 调用 fetch、setter、时间或随机 API，或者原地修改数组。

**原因：** 忽略 optimistic reducer 可能基于新的基础值重放。

**后果：** 重放会产生重复副作用、不同 `key` 或累积突变，临时行无法稳定对应记录。

**错误示例：**

```tsx
function updateQueue(items: ReviewItem[], decision: ReviewDecision) {
  items.push({ id: crypto.randomUUID(), decision })
  return items
}
```

**正确写法：**

```tsx
function updateQueue(items: readonly ReviewItem[], intent: ReviewIntent) {
  return items.map((item) =>
    item.id === intent.reviewId ? { ...item, pendingDecision: intent.decision } : item,
  )
}
```

**验证方式：** 同一个 input 重复传入纯函数时得到等价结果，旧数组和旧对象保持不变。

### 错误：用数组下标连接提交与审核行

**触发条件：** hidden input、optimistic input 或成功合并使用列表下标。

**原因：** 把当前渲染位置误当成业务身份。

**后果：** 排序、筛选或插入后，异步结果可能写入另一条记录，组件 State 也可能随错误 `key` 迁移。

**错误示例：**

```tsx
<li key={index}>
  <input type="hidden" name="reviewId" value={String(index)} />
</li>
```

**正确写法：**

```tsx
<li key={review.id}>
  <input type="hidden" name="reviewId" value={review.id} />
</li>
```

**验证方式：** 改变列表顺序后，同一稳定 ID 仍对应相同标题、FormData 目标和基础合并结果。

### 错误：把业务失败和异常失败写成同一路径

**触发条件：** 备注校验失败时 throw，或程序异常被全部转换成 `kind: 'invalid'`。

**原因：** 没有区分可预期业务结果与无法继续执行的异常。

**后果：** 普通输入问题会卸载表单，真正的程序错误又可能被一条业务文案掩盖。

**错误示例：**

```tsx
if (!note) throw new Error('备注不能为空')
```

**正确写法：**

```tsx
if (!note) {
  return {
    revision: previousState.revision,
    kind: 'invalid',
    reviewId,
    fieldError: 'note',
    message: '审核备注不能为空',
  }
}
```

**验证方式：** invalid 结果保留表单供修改；真正 reject 时由最近 Error Boundary 接管。

### 错误：把 pending 当作服务器锁或事务

**触发条件：** 仅凭提交按钮 disabled 就假定没有其他客户端能修改同一记录。

**原因：** 把当前组件的 Action 生命周期扩张成共享数据一致性保证。

**后果：** 多标签页、多人审核或重试时仍可能产生覆盖、重复写入和权限问题。

**错误示例：**

```tsx
if (isPending) return // 这不能锁住服务器上的记录
```

**正确写法：**

```tsx
const payload = { reviewId, operationId, expectedVersion, decision }
```

**验证方式：** 前端只用 pending 约束当前交互；共享一致性由数据层校验操作 ID、版本和权限。
:::

## 十五、源码推导与适用场景

### 1. 官方实现事实

固定 React DOM 实现会在 function form Action 提交时构造 `FormData`，建立 host transition status，并
调用 Action。`useFormStatus` 读取该父级状态；固定 React 实现则分别维护 Action State 更新队列和
optimistic passthrough 基础值。

官方测试覆盖 form status 四字段、成功后的未受控字段 reset、Action 错误传播、同一 Action 中的多次
optimistic 更新，以及基础值变化后的临时重算。

### 2. 从实现得到的课程推导

- form status 与 Action State 可以同时 pending，但它们来自不同所有者，不能互相替代。
- optimistic reducer 必须纯，因为基础值变化后同一输入可能重新应用。
- 确认结果必须进入基础 State，因为 Action 结束后临时输入不再承担显示事实。
- 业务结果使用普通返回值时可以留在表单工作流；异常会改变组件树恢复路径。
- 稳定记录 ID 必须在 Action 开始前确定，不能在 reducer 重放时生成。

这些结论用于设计应用代码，不授权依赖 Fiber 名称、lane、固定 render 次数或内部队列节点。

### 3. 适用场景

- 内容审核、工单处理、报名确认、评论管理等可以先显示临时决定的操作。
- 一次提交有明确目标 ID、明确决策和可读业务结果。
- 成功结果能够写回基础数据，失败结果能够撤销临时显示并保留修正入口。
- 交互需要局部 pending、表单 payload、结果 State 和列表临时状态同时可见。

### 4. 不适合的场景

- 只有普通本地字段更新，没有异步确认；直接使用 `useState` 即可。
- 操作不可逆或错误代价极高，不应先显示可能错误的成功状态。
- 需要跨客户端事务、库存锁、支付扣款、权限或强一致性；这些必须由服务端保证。
- 框架或数据层已经完整拥有 mutation、optimistic cache 和冲突策略；不要再复制第二套状态机。

## 十六、练习

:::exercise
### 练习一：画出一次成功提交的状态表

**要求：** 从空闲、提交、等待、成功到再次空闲，分别写出 `reviews`、`optimisticReviews`、`result`、
`isActionPending` 和 `useFormStatus().pending` 的值或职责。

**验收：** 等待阶段基础队列不变、临时行出现、前次结果保留；成功后基础队列承接，revision 增加，
两个 pending 信号回到空闲。
:::

:::exercise
### 练习二：增加“暂缓”决策

**要求：** 给 `ReviewDecision` 增加 `defer`，补齐 submitter、文案映射、optimistic 状态和成功后的基础状态。不要
修改记录 ID，也不要在 `updateFn` 中增加副作用。

**验收：** TypeScript 的联合类型覆盖所有分支；暂缓等待、成功和业务失败都能得到明确文字结果。
:::

:::exercise
### 练习三：实现本地字段校验

**要求：** 备注少于六个字符时返回 `invalid` 结果，不创建异步任务，不派发 optimistic input。真正的 Promise
reject 仍保留给 Error Boundary。

**验收：** 校验失败时 revision 不增加、基础队列不变、临时计数为零、备注输入仍可继续编辑。
:::

:::exercise
### 练习四：切换为兄弟 form

**要求：** 为两条记录各渲染一个合法的兄弟 form，每个 form 内有自己的 `ReviewSubmitControls`。提交其中一个时，
另一 form 的 `useFormStatus` 保持空闲。

**验收：** DOM 中没有嵌套 form；pending、FormData 和禁用状态只属于被提交的父 form。
:::

:::exercise
### 练习五：设计并发数据合同

**要求：** 不改 React Hook 结构，只为提交 payload 增加 `operationId` 和 `expectedVersion`，写出服务器成功、版本
冲突和重复操作三类返回结果，以及客户端如何更新基础队列。

**验收：** 明确 React pending 不是服务器锁；冲突不覆盖基础值，重复操作按数据层合同处理。
:::

## 十七、本节小结

- 基础队列、optimistic 队列、Action 结果和父 form status 是四个不同状态所有者。
- Form Action 负责把本次成功控件组成的 `FormData` 交给 Action，不负责业务持久化。
- `useFormStatus` 必须在 form 后代中调用，只描述最近父 form 的提交。
- `useActionState` 用 `previousState` 计算下一结果，业务失败可以返回普通 `invalid` State。
- `useOptimistic` 只派生等待期间的显示，成功必须由基础 State 承接。
- 业务失败不确认临时输入；异常失败交给 Error Boundary，二者不能混用。
- 记录 ID 应贯穿 `key`、FormData、optimistic input 和基础数据合并。
- Action pending 不能提供权限、事务、幂等、版本冲突或跨客户端一致性。

## 十八、参考资料

- [React `<form>`](https://react.dev/reference/react-dom/components/form) - function Action、FormData、成功 reset 和错误传播。
- [React `useFormStatus`](https://react.dev/reference/react-dom/hooks/useFormStatus) - 父 form 作用域与四字段提交状态。
- [React `useActionState`](https://react.dev/reference/react/useActionState) - previousState、payload、结果 State 和 Action 队列。
- [React `useOptimistic`](https://react.dev/reference/react/useOptimistic) - 基础值、临时 State、纯更新函数和回退。
- [React 19 Actions](https://react.dev/blog/2024/12/05/react-19#actions) - Actions、表单、结果和 optimistic UI 的组合方向。
- [ReactFiberHooks](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js) - React 19.2.8 的 Action State 与 optimistic 实现旁证。
- [ReactDOMForm 测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMForm-test.js) - FormData、状态、reset 与错误边界固定测试。
- [WAI-ARIA `status`](https://www.w3.org/TR/wai-aria-1.2/#status) - 动态状态通知语义。
